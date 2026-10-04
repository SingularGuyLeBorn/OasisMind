---
title: "03 · MoE 专家计算: Grouped GEMM, SonicMoE 与系统优化分类"
published: true
tags: ["MoE", "Grouped-GEMM", "DeepGEMM", "MegaBlocks", "ScatterMoE", "SonicMoE", "token-rounding"]
excerpt: "token 送到专家所在的卡以后, 剩下的问题是怎么把一堆长度不一的小矩阵乘喂给 Tensor Core. 本篇从单卡上的一次 MoE 前向出发, 推 grouped GEMM 的填充上界, 比较 Contiguous / Masked 布局与 MegaBlocks, ScatterMoE 两种不填数据的做法, 再按 SonicMoE 的算术强度与激活显存推导看细粒度专家的代价, 最后按瓶颈给 MoE 系统工作分类."
---
# 03 MoE 专家计算: Grouped GEMM, SonicMoE 与系统优化分类

[01](../01-MoE专家并行与All-to-All通信/01-MoE专家并行与All-to-All通信.md) 讲 token 怎样经 All-to-All 到达专家所在的卡, [02](../02-MoE推理部署/02-MoE推理部署.md) 讲推理时 EP 的规模与负载. token 到了以后, 每张卡上有若干个专家, 每个专家这一步分到的 token 数不同, 而且只有路由跑完才知道. 专家计算要解决的就是这件事: 把一组 N, K 维相同, M 维长度不一的矩阵乘, 尽量少浪费地交给 Tensor Core.

细粒度 MoE 让这件事更难. 专家越细, 中间维 $n$ 越小, 激活专家数 $K$ 越大, 每个专家分到的 token 数 $T_e$ 越少. 三个量一起变, 算术强度下降, 需要缓存的激活变多, tile 填不满的比例变大. 本篇沿用 [01](../01-MoE专家并行与All-to-All通信/01-MoE专家并行与All-to-All通信.md) 的记号: $T$ 是本卡 token 数, $E$ 是专家数, $d$ 是模型宽度, 另记 $n$ 为专家中间维, $T_e$ 为某个专家这一步的 token 数. 路由公式与容量的算法侧在 [2.6 MoE](../../../../2-核心原理与架构/2.6-MoE/2.6-MoE.md) 与 [MoE 负载均衡与容量](../../../../2-核心原理与架构/2.6-MoE/03-MoE负载均衡与容量/03-MoE负载均衡与容量.md).

## 1. 单卡上的一次 MoE 前向

### 1.1 五步与 EP 的对应

单卡上一次 MoE 前向可以分成五步, 上了 EP 之后每一步多一个 rank 维:

1. Gate: $xW_g$ 得到 $E$ 维分数, Top-$K$ 得到下标和门控权重. 算力相对专家 FFN 可以忽略, 但下标决定后面所有数据去哪.
2. Permute: 按专家编号给 token 排序, 写出每个专家的起止偏移. EP 下这份清单就是 dispatch 的发送表.
3. 专家 GEMM: SwiGLU 专家的上投影与下投影按专家分块计算. grouped GEMM, MegaBlocks, ScatterMoE, SonicMoE 改的都是这一步.
4. Unpermute: 按原 token 顺序写回并乘门控权重. EP 下这一步就是 combine.
5. 残差: 和注意力输出相加. 有共享专家时, 它的输出在这里并入.

第 2 步和第 4 步是纯整数下标运算加数据搬运, 没有浮点路由. 这两步在 Python 里做会引入主机同步, 在 GPU 上做才能和 All-to-All 排在同一条流上, 藏进计算. Tutel 的 fast encode/decode 和 MetaShuffling 的 IndexShuffling kernel 做的都是这两步 (见 [02](../02-MoE推理部署/02-MoE推理部署.md) 第 4.2 节). 共享专家不进第 2 至 4 步, 它每卡都有一份或随 TP 切开, 所以 All-to-All 的数据量只跟路由专家数走.

### 1.2 permute 的例子与容量写槽

一个最小的例子: 四个 token 的专家编号是 $[2,0,2,1]$, $E=3$. 排序后 token 顺序变成专家 0 的一个, 专家 1 的一个, 专家 2 的两个, 偏移为 $[0,1,2,4)$. EP 取 3 时, 这三段分别进三张卡的 dispatch 缓冲, 专家 2 的两个 token 进同一张卡. 若 grouped GEMM 的 M 维 tile 是 128, 专家 2 只有 2 个有效行, 要补 126 行. 细粒度加小 batch 时 grouped GEMM 效率低, 原因就在这里, 和路由器学得好不好无关.

容量 $C$ 限制的是每段偏移区间的长度. 取 $C=2$, 若专家 2 分到 3 个 token, 第三个在第 2 步写槽时被丢弃, 它不进通信缓冲, 后面的 GEMM 看不到它, 输出只剩残差带过去的原值. 丢弃发生在 dispatch 写槽, 专家计算之前就已决定. dropless 时第 2 步的缓冲长度跟实际派遣数走, 每步形状都在变, 这时要么用第 2.2 节的 Masked 布局保住静态形状, 要么用第 2.3 节的稀疏核直接吃下变长. 丢弃对模型质量的影响, 以及 MegaBlocks 在 The Pile 上的对照实验, 见 [MoE 负载均衡与容量](../../../../2-核心原理与架构/2.6-MoE/03-MoE负载均衡与容量/03-MoE负载均衡与容量.md).

## 2. Grouped GEMM 与填充

### 2.1 M 维分组与对齐填充

逐个专家调 GEMM 会产生大量小 kernel, 启动开销和尾部效应都很重. grouped GEMM 一次启动完成本卡所有专家的矩阵乘. [DeepGEMM](https://github.com/deepseek-ai/DeepGEMM) 的 grouped GEMM 只在 M 维分组, N 与 K 必须固定, 正好对应 MoE 里各专家形状相同的情形; 权重梯度另有按 K 维分组的接口. Tensor Core 按固定大小的 M 块处理矩阵, 每个专家的片段要对齐到 M 块大小 $b_M$, 对不齐的部分就是填充.

专家 $i$ 收到 $n_i$ 个 token, 实际计算的行数是 $b_M\lceil n_i/b_M\rceil$, 一张卡的填充行数

$$
P=\sum_{i}\Bigl(b_M\Bigl\lceil\frac{n_i}{b_M}\Bigr\rceil-n_i\Bigr)<E_{\mathrm{local}}\,b_M, \tag{1}
$$

$E_{\mathrm{local}}$ 是本卡专家数. 上界与 token 总数无关, 只与本卡专家数有关. 以 V3 训练为例, 每卡 4 个专家, $b_M=128$, 填充少于 512 行; 若每卡每个 micro-batch 有 4096 个 token, $K=8$, 均匀路由下每卡收到约 32768 行, 填充不到 1.6%. 换成每个专家只有 100 个 token 的情形, 单个专家补 28 行, 占 28%. 专家越细, $n_i$ 越小, 同样的上界占有效计算的比例就越大.

反向的权重梯度换了一种分组方式. 专家 $i$ 的权重梯度是 $dW_i=X_i^{\top}dY_i$, token 维从输出的行变成了被求和的维度. 前向里长度不一的是 M, 这里长度不一的是 K, 而 M 与 N 是权重的形状, 对所有专家相同. 所以 DeepGEMM 为权重反向单独提供 K 维分组的接口, 不能复用前向的 M 维分组 kernel.

![Grouped GEMM 的 tile 填充, 以及 token rounding 把每个专家的 token 数取整到 tile 倍数](./images/fig-moe-grouped-gemm-tile.png)

> 图 1: 左栏一个专家有 70 个有效 token, 补 58 行凑满 128 的 tile; 右栏把该专家的 token 数取整到 tile 倍数, 填充消失.

**图 1 解析**

- 左栏绿色是有效计算, 灰色是填充. 路由器只把真实 token 送进专家, 填充是 kernel 为了对齐 tile 补的, Tensor Core 仍按满 tile 运转.
- 右栏是第 3.3 节的 token rounding. 它在路由一侧改「这个专家这一步收多少 token」, 让 $n_i$ 落在 tile 倍数上. 负载均衡损失管的是长期的选择频率, 容量因子管的是单个专家的上限, token rounding 管的只是取整.

### 2.2 Contiguous 与 Masked 布局

DeepGEMM 按运行时约束把 grouped GEMM 分成两种布局. Contiguous 用于训练前向和推理 prefill: 各专家的 token 数在 GPU 和 CPU 上都已知, 把所有 token 按专家拼成一个连续张量, 用偏移做逻辑切分, 每个专家的片段对齐到 M 块大小 (`get_mk_alignment_for_contiguous_layout()`). 式 (1) 的填充就出在这里. DeepEP 的 dispatch 输出直接按这个对齐值排好, 见 [01](../01-MoE专家并行与All-to-All通信/01-MoE专家并行与All-to-All通信.md) 第 4.2 节.

Masked 用于开启 CUDA Graph 的 decode: CPU 不知道每个专家收到多少 token, 没法每步重建图. 这时给每个专家分配固定容量的槽位, 额外传一个 mask 张量, kernel 只计算有效部分. DeepGEMM 的 README 举的例子就是以 DeepEP 低延迟 kernel 的输出作输入. 两种布局都不改变 Top-$K$ 选了谁, 只改选完以后数据怎样排给 Tensor Core.

![Contiguous 布局与 Masked 布局](./images/fig-moe-contiguous-vs-masked.png)

> 图 2: 左列 prefill 与训练前向把 token 按专家拼成连续段; 右列 decode 加 CUDA Graph 用固定槽位加 mask 保住静态形状. 虚线是 mask, 不是反向梯度.

**图 2 解析**

- 左列 token 进一条分三段的缓冲 (Expert 1/2/3), 再进 grouped GEMM. 偏移写在缓冲旁边, 它作为 kernel 的输入告诉每个线程块从哪一行读到哪一行.
- 两列的 GEMM 算的有效行相同. 左列的填充在每段末尾, 由对齐产生; 右列的空槽来自按最坏情况分配的容量, 通常比左列多, 这是 decode 换取静态形状的显存代价.
- 右列从同样的 token 出发, 进带 mask 的槽位网格, 再进 masked grouped GEMM. mask 线两端没有箭头, 它只标出哪些槽位有效, 没有数据回流.

DeepGEMM 后来又加了 Mega MoE: 把 EP dispatch, 第一个线性层, SwiGLU, 第二个线性层和 EP combine 融成一个 kernel, 让 NVLink 通信和 Tensor Core 计算在 kernel 内部重叠, 要求多进程启动并使用对称显存. 这一步把 [01](../01-MoE专家并行与All-to-All通信/01-MoE专家并行与All-to-All通信.md) 第 4.3 节 Comet, Flux 的细粒度重叠思路推到了整层, 第 1.1 节的第 2 至 4 步不再是分开的 kernel.

### 2.3 不填数据的两种做法: MegaBlocks 与 ScatterMoE

MegaBlocks ([Gale et al., 2022](https://arxiv.org/abs/2211.15841)) 把 MoE 层写成块稀疏矩阵乘. 上投影是 SDD (稀疏输出 = 稠密 × 稠密), 下投影是 DSD (稠密输出 = 稀疏 × 稠密), 块大小 128×128, 每个专家的 token 数只补齐到块大小, 不再按全局容量填空槽, 所以从不丢 token. 稀疏矩阵用 blocked-CSR 与 COO 混合的格式存, 并额外存一份转置下标, 反向需要按列访问时不必真的转置矩阵. 论文报告端到端训练相对 Tutel 最多快 40%, 相对 Megatron-LM 训练的稠密 Transformer 快 2.4 倍. Mixtral 开源时接入 vLLM 的就是 MegaBlocks 的 kernel ([Jiang et al., 2024](https://arxiv.org/abs/2401.04088)).

ScatterMoE ([Tan et al., 2024](https://arxiv.org/abs/2403.08245)) 指出 MegaBlocks 在第 2 步和第 4 步各复制一份输入, 还把每个专家的 token 块填充成等长, 填充后的数组整个物化在 HBM 里. ScatterMoE 只给 token 排序并填充下标, 把 tile 从 HBM 读进 SRAM 时按填充后的下标读, 得到的是填充过的 tile, HBM 里不出现填充数组. 它把这一能力做成 ParallelLinear 原语, 输入和输出可以各自是 grouped 或 scattered, 四种组合覆盖前向和反向. 在 8 张 A100 上训练 1.5B 模型, 吞吐比 MegaBlocks 的稀疏实现高 38.1%; 单个 MoE MLP 训练时显存是 MegaBlocks 的 66.2%, 推理时是 53.6%. 论文同时说明, 维度更大, batch 相同时, 收益没有这么明显.

三种做法的区别在于填充落在哪里. DeepGEMM 的 contiguous 布局把填充落在 HBM 里的数据上, 由 dispatch 一侧负责对齐, kernel 本身最简单; MegaBlocks 把填充落在块稀疏矩阵的块上, 数据仍要复制成排好序的连续块; ScatterMoE 只把填充落在下标上, 数据保持原位, 代价是 kernel 读 tile 时要做间接寻址. 三者算的有效 FLOPs 相同, 省下的是填充的显存和复制的带宽. 在 EP 下, dispatch 本来就要把 token 搬一次, 顺手按专家排好并对齐几乎不多花钱, 这也是大规模 EP 训练栈多用 contiguous 布局的原因; 单卡或节点内不做 EP 时, 没有这一次搬运可以搭车, ScatterMoE 一类省复制的做法收益更明显.

## 3. SonicMoE: 细粒度专家的 IO 与显存

### 3.1 算术强度随粒度下降

SonicMoE ([Guo et al., 2025](https://arxiv.org/abs/2512.14080)) 先算一个专家的算术强度. 专家是 SwiGLU, 上投影把 $T_e\times d$ 的输入乘 $d\times2n$ 的权重, 计算 $4T_end$ FLOPs, BF16 下读写 $2T_ed+4nd+2T_en$ 字节 (输入, 权重, 激活后的输出); 下投影计算 $2T_end$ FLOPs, 读写 $2T_en+2nd+2T_ed$ 字节. 两者相加, FLOPs 为 $6T_end$, 字节为 $4T_ed+6nd+4T_en$, 分子分母同除 $2T_end$:

$$
I=\frac{3}{\dfrac{2}{d}+\dfrac{2}{n}+\dfrac{3}{T_e}}=\frac{3}{\dfrac{2+2G}{d}+\dfrac{3}{T\rho}}, \tag{2}
$$

右边代入了 $G=d/n$ (粒度) 和 $T_e=T\rho$, $\rho=K/E$ (均匀路由下的激活比例). 式 (2) 说明两件事: 粒度 $G$ 越大, 分母第一项越大; 越稀疏 ($\rho$ 越小), 第二项越大. 两者都压低算术强度. [02](../02-MoE推理部署/02-MoE推理部署.md) 式 (2) 只算权重, 相当于这里 $T_e$ 很小时第三项占主导的近似.

代入 V3 的形状 $d=7168$, $n=2048$, $K=8$, $E=256$, $\rho=1/32$, 一张卡一步 8192 个 token 时均匀路由下 $T_e=8192/32=256$. 此时 $I\approx231$ FLOPs/字节, 低于 H100 BF16 的平衡点约 295; $T_e=32$ 时只剩约 31.6; 即使 $T_e$ 趋于无穷, 上限也只有 $3/(2/7168+2/2048)\approx2389$. 若把中间维再切细到 $n=512$, $T_e=256$ 时降到约 189. 粒度和稀疏度每往前走一步, 专家 GEMM 就更靠近带宽受限的一侧, 访存与计算重叠的价值就更大.

### 3.2 激活显存: 为什么不能缓存 $O(TKd)$ 的张量

SonicMoE 的第二个推导是反向的激活显存. 每个 token 进 $K$ 个专家, 每个专家按第 3.1 节算 $6nd$ FLOPs, 一层 MoE 前向合计 $6TnKd$; 反向要同时算激活梯度和权重梯度, 各与前向同量级, 为 $12TnKd$, 合计 $18TnKd$. 细粒度设计通常保持 $nK$ 不变 (把一个大专家切成几个小专家, 同时多激活几个), 所以 FLOPs 不随粒度变. 但常规实现会缓存 gather 后的输入 $X_e$ 与专家输出 $Y$, 两者都是 $TK\times d$ 的张量, 大小 $O(TKd)$; $nK$ 不变时 $K$ 每翻一倍, 这部分显存就翻一倍.

SonicMoE 只缓存原始输入 $X$ 和上投影输出 $H$, 共 $2Td+4TKn$ 字节, 在 $nK$ 不变时与粒度无关. 关键是路由分数的梯度: ScatterMoE 与 MoMoE 用 $dS=\langle dO,Y\rangle$, 需要保留 $Y$, 多出 $2TKd$ 字节; SonicMoE 改用 $\langle dA,A'\rangle$, 只依赖 $H$ 能重算出的量, 数学上等价. 取 $T=8192$, $d=4096$, $Kn=8192$, SonicMoE 缓存 64 MiB + 256 MiB = 320 MiB; 常规实现单是 $X_e$ 与 $Y$ 两份, $K=8$ 时就是 1 GiB, $K=32$ 时是 4 GiB. 论文报告细粒度 7B MoE 每层激活显存最多降低 45%. Kimi K3 的训练也按这个思路改写了置换后路由概率的梯度, 去掉对前向输出的依赖 ([Moonshot AI, 2026](https://arxiv.org/abs/2607.24653)).

### 3.3 IO 重叠与 token rounding

第三处改动是 IO. 常规实现先把 token gather 成连续块再做 GEMM, 多一次 $2TKd$ 字节的读写; SonicMoE 把 gather 融进 GEMM 的读取. Hopper 的 GEMM 是生产者 / 消费者结构, 生产者 warpgroup 用 TMA 从 HBM 搬 tile 进共享内存, 消费者 warpgroup 做 MMA; SonicMoE 采用 Ping-Pong 调度, 两个消费者 warpgroup 交替做 MMA 和 epilogue, 让访存, 计算和写回重叠. 式 (2) 已经说明细粒度专家受带宽限制, 这一步收益最直接.

第四处是 token rounding, 处理图 1 的填充. 路由照常做 Top-$K$, 然后把每个专家的 token 数取整到最近的 $M_{\mathrm{tile}}$ 倍数: 向上取整时, 从按专家打分排序的候选里补进本来没选这个专家的 token; 向下取整时, 丢掉打分最低的几个. 以 $M_{\mathrm{tile}}=128$ 为例, 70 个 token 取整到 128, 200 个取整到 256, 150 个取整到 128. 每个专家与原指派的偏差不超过一个 tile. 论文的实验表明平均每专家 token 数 $\bar T_e/M_{\mathrm{tile}}\ge2$ 时下游效果稳定. 这个条件可以直接从取整误差看出来: 偏差上限是一个 tile, 平均每专家有两个 tile 以上的 token 时, 相对偏差不超过一半; 若平均只有几十个 token, 取整到最近的 128 倍数会让大量专家变成 0 个或 128 个, 指派被改得面目全非. 所以 token rounding 适合训练和 prefill, 不适合每专家只有几个 token 的 decode. 在 30B MoE 的基础上把专家数扩大 4 倍时, token rounding 比普通 token-choice 快 16%, 下游效果相近; 高稀疏设定下 kernel 时间相对普通 Top-$K$ 约快 1.16 倍.

### 3.4 结果与读法

论文报告的数字较多, 先按对照对象分开:

- 相对 ScatterMoE: Hopper 上细粒度 7B MoE 的 BF16 计算吞吐 1.86 倍, 反向 TFLOPS 高 83%.
- 相对 DeepGEMM: H100 上前向 TFLOPS 高 43%; B300 上 OLMoE 规模的 7B MoE, 前向和反向分别快 25% 和 15%.
- 相对 MoMoE: 反向 TFLOPS 高 115%.
- 端到端: 64 张 H100 每天训练 213B token, ScatterMoE 用 96 张 H100 为 225B (FSDP-2, lm-engine).
- 显存: 每层激活显存最多降低 45%.

端到端那一行卡数不同, 不能读成「同卡快 1.86 倍」. 1.86 倍比的是单个 kernel 的吞吐, 213B 对 225B 比的是整机训练速度, 后者折算到每卡是 $213/64\approx3.33$B 对 $225/96\approx2.34$B token/天, 约快 1.42 倍. 几个百分比的分母也不同: DeepGEMM 是 grouped GEMM 库, ScatterMoE 和 MoMoE 是完整的 MoE kernel, 前者不含 gather 与路由梯度那部分开销.

SonicMoE 的四处改动对应式 (2) 和第 3.2 节的三个代价: 少缓存激活对应显存, IO 重叠对应低算术强度, token rounding 对应 tile 填充. 前两处不改模型输出, 第三处改了路由结果, 要单独评估下游效果. 已经有模型把这套思路用在训练里: Step 3.5 Flash 的技术报告提到实现了类似 SonicMoE 的融合 gather/scatter 与 grouped GEMM ([StepFun, 2026](https://arxiv.org/abs/2602.10604)).

## 4. MoE 系统优化的分类

### 4.1 按瓶颈分四类

MoE 系统工作可以按它要解决的瓶颈分成四类. 第一类是通信: token 跨卡去找专家, 一层两次 All-to-All, 手段有切分方式, 分层 All-to-All, 节点受限路由, 低精度通信和通算重叠, 代表是 GShard, Tutel 的 2DH, DeepSeek-V3, DeepEP, Comet, Flux, 见 [01](../01-MoE专家并行与All-to-All通信/01-MoE专家并行与All-to-All通信.md). 第二类是负载与调度: 专家负载随输入变, 静态切分会让热专家所在的卡拖慢所有人, 手段有冗余专家, 运行时切换并行方式, 离线策略池加在线选择, 代表是 V3 的部署, Tutel, SmartMoE, MoonEP, 见 [02](../02-MoE推理部署/02-MoE推理部署.md).

第三类是专家计算, 即本篇第 2, 3 节: 变长的 grouped GEMM, 填充, 算术强度和激活显存, 代表是 DeepGEMM, MegaBlocks, ScatterMoE, SonicMoE. 第四类是存储层级: 全部专家放不进 HBM, 手段有卸载与预取 ([02](../02-MoE推理部署/02-MoE推理部署.md) 第 5 节), 专家量化 ([MoE 模型量化技术综述](../../../6.3-模型压缩/6.3.1-量化/05-MoE模型量化技术综述/05-MoE模型量化技术综述.md)), 以及近存计算一类的专用硬件 ([9.1.5 MoE 硬件与加速](../../../../9-AI工程化与基础设施/9.1-硬件基础/9.1.5-MoE硬件与加速/9.1.5-MoE硬件与加速.md)).

四类之间相互牵连. 通信侧的节点受限路由改了路由的可行集, 影响负载; 计算侧的 token rounding 改了路由结果, 也影响负载; 存储侧的量化降低了权重字节数, 改变式 (2) 的分母, 也改变 [02](../02-MoE推理部署/02-MoE推理部署.md) 里 decode 的瓶颈位置. 所以排查一个 MoE 作业的性能问题, 先要确定它卡在哪一类, 再选手段. 判断依据是 [01](../01-MoE专家并行与All-to-All通信/01-MoE专家并行与All-to-All通信.md) 式 (1) 的通信量, 本篇式 (2) 的算术强度, 以及各卡 token 数的最大值与平均值之比.

### 4.2 代表工作对照

下表列出几个代表工作, 最后一列是各自论文的对照基线:

| 工作 | 类别 | 做法 | 报告的收益 | 基线 |
|------|------|------|------|------|
| Tutel (2022) | 调度, 通信 | 统一布局下运行时切换并行, 2DH All-to-All | 单层 4.96 倍 (16 卡), 5.75 倍 (2048 卡) | Fairseq |
| SmartMoE (2023) | 调度 | 离线策略池, 在线选专家放置 | 端到端最多 1.88 倍 | FasterMoE |
| MegaBlocks (2022) | 计算 | 块稀疏 SDD / DSD, 不丢 token | 端到端最多快 40% | Tutel |
| ScatterMoE (2024) | 计算 | 只填下标, ParallelLinear | 训练吞吐高 38.1% | MegaBlocks |
| SonicMoE (2025) | 计算 | 少存激活, IO 重叠, token rounding | kernel 吞吐 1.86 倍, 激活 -45% | ScatterMoE |
| Comet (2025) | 通信 | 共享张量拆分, 线程块分工的细粒度重叠 | 单层 1.96 倍, 端到端 1.71 倍 | Megatron-Cutlass, Megatron-TE, FasterMoE 等 |

表里的倍数不能相加, 也不能拿来排名. 分母各不相同, 年份前后差三年, 硬件从 A100 到 B300 都有, 任务有视觉也有语言. 一行一行读, 每个倍数只说明这项技术在它自己的设定里相对它自己的基线成立. 例如 Tutel 的 4.96 倍和 SonicMoE 的 1.86 倍, 一个是 2022 年单个 MoE 层相对 Fairseq 的端到端时间, 一个是 2025 年单个 kernel 相对 ScatterMoE 的吞吐, 合起来没有意义.

两组工作可以叠加, 也不互相替代. kernel 再快, 热专家所在的 rank 仍会让其他卡等它; 调度再好, tile 填充的浪费也不会因此消失. 实际的训练栈通常一层用一种: 通信用 DeepEP 或 NCCL 的 All-to-All, 计算用 DeepGEMM 或 SonicMoE 一类的 grouped GEMM, 调度用冗余专家或 MoonEP 一类的规划, 三者各管一段.

### 4.3 常见误读

读这些论文和排查自己的作业时, 下面几种误读出现得较多:

| 误读 | 实际情况 | 依据 |
|------|------|------|
| MoE 层通信慢, 加大 kernel 算力就能解决 | 热专家所在的卡最慢, All-to-All 等它, 是负载问题 | 第 4.1 节, 各卡 token 数最大值与平均值之比 |
| token rounding 是一种负载均衡损失 | 它取整的是 tile 倍数, 不改训练目标, 只改单步的指派 | 第 3.3 节 |
| 细粒度 MoE 的 FLOPs 不变, 显存也不变 | $nK$ 不变时 FLOPs 不变, 但 $O(TKd)$ 的缓存随 $K$ 增长 | 第 3.2 节 |
| decode 也能用 contiguous 布局配 CUDA Graph | 每步各专家 token 数在变, CPU 不知道, 图无法重放 | 第 2.2 节 |
| 213B 对 225B token/天说明 SonicMoE 更慢 | 前者 64 卡, 后者 96 卡, 按每卡算前者快约 1.42 倍 | 第 3.4 节 |

前三行混淆的是瓶颈类别. 通信, 负载, 计算, 显存四类问题的表现都可能是「这一层很慢」, 解法却完全不同, 先用第 4.1 节的三个量定位, 再看第 4.2 节表里哪一类工作对应. 后两行混淆的是适用条件和对照口径, 读论文数字时先看它的布局约束, 卡数和基线.

这几行也说明了本篇和 [01](../01-MoE专家并行与All-to-All通信/01-MoE专家并行与All-to-All通信.md), [02](../02-MoE推理部署/02-MoE推理部署.md) 的关系. 01 决定 token 怎样到达, 02 决定专家放在哪里, 放几份, 本篇决定 token 到达以后怎样算. 一个 MoE 作业的性能是三段的乘积, 某一段做得再好, 另外两段仍可能成为上限.

## 参考文献

1. Guo, W., Mishra, M., Cheng, X., Stoica, I., & Dao, T. (2025). [SonicMoE: Accelerating MoE with IO and Tile-aware Optimizations](https://arxiv.org/abs/2512.14080). 式 (4) 算术强度, 激活显存分析, token rounding. 代码: [Dao-AILab/sonic-moe](https://github.com/Dao-AILab/sonic-moe).
2. Gale, T., Narayanan, D., Young, C., & Zaharia, M. (2022). [MegaBlocks: Efficient Sparse Training with Mixture-of-Experts](https://arxiv.org/abs/2211.15841). MLSys 2023.
3. Tan, S., Shen, Y., Panda, R., & Courville, A. (2024). [Scattered Mixture-of-Experts Implementation](https://arxiv.org/abs/2403.08245).
4. DeepSeek. [DeepGEMM](https://github.com/deepseek-ai/DeepGEMM). README: contiguous / masked grouped GEMM, Mega MoE.
5. Hwang, C., et al. (2023). [Tutel: Adaptive Mixture-of-Experts at Scale](https://arxiv.org/abs/2206.03382). MLSys 2023.
6. Zhai, M., et al. (2023). [SmartMoE: Efficiently Training Sparsely-Activated Models through Combining Offline and Online Parallelization](https://www.usenix.org/conference/atc23/presentation/zhai). USENIX ATC 2023.
7. Zhang, S., et al. (2025). [Comet: Fine-grained Computation-communication Overlapping for Mixture-of-Experts](https://arxiv.org/abs/2502.19811).
8. DeepSeek-AI. (2024). [DeepSeek-V3 Technical Report](https://arxiv.org/abs/2412.19437). 每卡专家数与 micro-batch 配置.
9. Jiang, A. Q., et al. (2024). [Mixtral of Experts](https://arxiv.org/abs/2401.04088).
10. Moonshot AI. (2026). [Kimi K3 Technical Report](https://arxiv.org/abs/2607.24653). Memory-efficient MoE.
11. StepFun. (2026). [Step 3.5 Flash Technical Report](https://arxiv.org/abs/2602.10604). GPU kernel 优化.
