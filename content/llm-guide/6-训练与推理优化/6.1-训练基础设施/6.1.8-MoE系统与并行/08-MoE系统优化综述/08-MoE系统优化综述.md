---
title: "08 · MoE 系统优化：EP、All2All、Grouped GEMM"
date: 2026-08-30
as_of: 2026-08-30
tags: [MoE, 专家并行, All-to-All, SonicMoE, Grouped-GEMM, Tutel]
---

# MoE 系统优化：稀疏激活碰到硬件的并行胃口

MoE 把每 token 的 FLOPs 做成稀疏，参数却仍要驻留。系统层卡住的不是再写一遍 Top-$K$，而是三件硬东西：token 怎么送到拥有专家的那张卡、细粒度之后激活怎么不按 $O(TKd)$ 涨、Grouped GEMM 的 Tile 怎么不被填充吃掉。路由公式在 [2.4.1](../../../../2-核心原理与架构/2.4-前沿架构与变体/2.4.1-混合专家模型MoE/2.4.1-混合专家模型MoE.md)，共享专家在 [01](../../../../2-核心原理与架构/2.4-前沿架构与变体/2.4.1-混合专家模型MoE/01-DeepSeek-MoE/01-DeepSeek-MoE.md)，STE 在 [03](../../../../2-核心原理与架构/2.4-前沿架构与变体/2.4.1-混合专家模型MoE/03-MoE-Top-K运算可导性分析/03-MoE-Top-K运算可导性分析.md)。本篇不重推 $g_i(x)$。

卡间 Wave、DeepEP、MoonEP 的通信重叠正本在 [6.1.1](../../6.1.1-分布式训练/6.1.1-分布式训练.md)。这里只把并行轴、Dispatch / Combine、两种 GEMM layout 和几条能对上论文的系统数字钉死。

## 1. 显存够走 EP，不够走卸载

显存够、卡多：走 **专家并行（EP）**。每个 rank 只持有一部分专家。路由器仍在本卡算；算完下标之后，用 All-to-All 把 token **dispatch** 到目标卡，专家算完再 All-to-All **combine** 回来。单卡参数降了，通信和负载不均变成主矛盾。

显存不够、卡少：走 **卸载**。不活跃专家放到 CPU 或盘，用到再搬回 GPU。能跑超大池，但 PCIe 延迟比 NVLink All-to-All 更刺。没有预取就会空转。这不是另一种路由公式，是存储层级换了。

![EP：token 经 All-to-All 去专家所在 GPU，结果再 Combine 回来](./images/fig-moe-ep-alltoall.png)

> 图 1：EP 的通信骨架。左是各卡上的 token，右是切分后的专家。实线 Dispatch，虚线 Combine。路由本身仍在本卡。

**图 1 解析**

- 路由器先选出 Top-$K$ 下标。通信搬的是激活，不是整份专家权重。
- 负载不均时，持有热门专家的 GPU 算得久，别的卡在等下一次 All-to-All。这是 EP 的典型空转。加大容量因子能少丢 token，填不满「别人在等最慢的 rank」。
- 节点内 TP 处理 Attention / 共享参数、跨节点 EP 切专家，是工业默认拼法。DeepEP 怎么把 IB 和 NVLink 叠起来，见 6.1.1，本图不画那层拓扑。

## 2. DP / TP / EP 各切一块

稠密 Transformer 常见 DP + TP + PP。MoE 多一个轴：专家参数按卡切开。三轴不要并成一句「混合并行」。

| 维度 | 切什么 | MoE 层在干什么 |
|------|--------|----------------|
| DP / ZeRO | 数据；参数可分片 | 专家若再复制一份，显存又回去了 |
| TP | Attention、共享 FFN 的矩阵 | 高带宽域里 **AllReduce** |
| EP | 专家参数 | 两次 **All-to-All**（dispatch + combine） |

![数据并行切 batch，张量并行切矩阵，专家并行切专家](./images/fig-moe-dp-tp-ep.png)

> 图 2：三行三轴。DP 复制（或 ZeRO 分片）同一套专家、切开 batch。TP 在 Attention 侧 AllReduce。EP 走 Router → Dispatch → 各卡专家 → Combine。

**图 2 解析**

- 第一行蓝：**DP**。Batch A / Batch B 各算各的。专家权重要么每卡一份，要么走 ZeRO 分片。它不解决「专家太多一张卡放不下」。
- 第二行黄：**TP**。QKV 切到两张卡，AllReduce 把结果对齐。这是注意力侧的集体通信，**不是**专家侧的 All2All。
- 第三行绿：**EP**。Router 仍在本卡。Dispatch 把 token 送到 E0/E1/E2 所在 GPU，Combine 送回 $y$。

「ZeRO-EP」只是把 ZeRO 的分片和 EP 的专家切分叠在同一作业里：EP 组内先对专家梯度做完，再在 DP 组间聚合。不要读成第三套门控。DeepSeek-V3 报告里节点内 TP、跨节点 EP，是这个表的一种实例，不是新公式。

## 3. Dispatch / Combine：All2All 不是 AllReduce

单卡 MoE 已经有 Router、Dispatch、Combine 三块。Dispatch 建立 token→专家的置换，把输入排成「同一专家的 token 挨在一起」；Combine 按门控权重把专家输出写回原 token 位置。上多卡之后，这两步各加一个 **rank 维**：token → rank → 专家。

注意力 TP 的集体通信是 AllReduce：每张卡都要同一份聚合结果。EP 的集体通信是 All-to-All：每张卡把不同的 token 发给不同的目的 rank，再收回属于自己的那些。把 MoE 层的通信仍画成「每层两次 AllReduce」，漏掉的就是 Dispatch / Combine。

AllReduce 在实现上可以拆：

$$
\mathrm{AllReduce}(x)=\mathrm{AllGather}(\mathrm{ReduceScatter}(x)). \tag{1}
$$

拆开之后，Reduce-Scatter 和 All-Gather 能分别跟相邻 GEMM 重叠。限制也写在机制旁边：一层里 **第一段 Attention 的 QKV GEMM** 和 **最后一段 MoE 的 down 投影**，常常没有对侧计算可藏。这是通算重叠的窗口，不是路由。

![节点内 TP，跨专家 EP：Dispatch 与 Combine](./images/fig-moe-tp-ep-dispatch.png)

> 图 3：Batch → Attention（TP0/TP1 + AllReduce）→ All2All Dispatch → 各 EP rank 上的 Expert → All2All Combine → 输出。

**图 3 解析**

- 蓝框是节点内张量并行：QKV / 输出投影切开，靠 AllReduce 对齐。
- 黄框是两次 All2All：进专家前 Dispatch，出专家后 Combine。
- 紫框是专家并行：每个 expert 住在自己的 EP rank 上。不要把「把单个专家再按 TP 切一刀」当成 EP 的定义。
- DeepEP、Flux、NCCL-EP 是实现名，数字以各仓库和 6.1.1 为准。本图只钉数据流。

传统 NCCL All-to-All 对「每步目的 rank 都在变」不友好。DeepEP 一类工作做的是动态路由下的 buffer 与通算重叠，不是新的 $p_i$。MoonEP 要求每个 rank 收到恰好 $S\times K$ 个 token，让计算形状静态——那是 **卡间 token 数**，和 Quantile Balancing 的 **专家间被选次数** 不是一层，见 [10](../../../../2-核心原理与架构/2.4-前沿架构与变体/2.4.1-混合专家模型MoE/10-Stable-LatentMoE与Quantile-Balancing/10-Stable-LatentMoE与Quantile-Balancing.md)。

通信量可以先按激活字节估，不要先编加速比。一次 Dispatch 把本卡 $T$ 个 token、隐状态宽度 $d$、每个 token $K$ 个目的专家，搬到对端；Combine 再搬回来。数量级是

$$
\mathrm{bytes}_{\mathrm{A2A}}\approx 2\cdot T\cdot K\cdot d\cdot b, \tag{2}
$$

$b$ 是激活字节宽度（BF16 为 2）。$2$ 是来回。专家权重 **不** 出现在式 (2) 里：EP 的集体通信搬的是 token，不是 $W$。

走一遍数量级。取 Prefill $T=8\times 4096=32768$（batch 8、长 4096），$K=2$，$d=4096$，BF16。代入式 (2)：

$$
2\cdot 32768\cdot 2\cdot 4096\cdot 2=2^{30}\ \mathrm{B}=1\,\mathrm{GiB}
$$

一层来回大约 1 GiB 激活。同一层的专家权重若 $E=8$、每个 SwiGLU 专家大约 $3dd_{\mathrm{ff}}$、再乘 2 字节，往往是数 GiB 级，但那份重量 **不经过** All2All，已经躺在各卡 HBM 里。所以「MoE 通信贵」指的是激活按 $TKd$ 打满互联，不是把 8 个专家的 $W$ 每步广播一遍。把 $T$ 换成 Decode 的 batch=8、seq 维=1：$T=8$，同一公式掉到 $256\,\mathrm{KiB}$ 量级。字节变少，但 All2All 的启动延迟还在，小报文更亏。这就是 Prefill 还肯开跨节点 EP、Decode 要收 EP 度的算术来源，不是玄学。

$T$ 在 Prefill 里是序列×batch，All2All 容易被计算盖住；$T$ 在 Decode 里往往只剩 batch，延迟占主导，EP 度开太大，小 batch 会先撞上启动开销。这就是「训练能开 EP=16、在线 Decode 改 EP=1 或只在节点内 EP」的来源，不是路由换了公式。

共享专家这条支路通常 **不进** All2All：它 always-on、每卡都有一份（或随 TP 切开），算完和路由专家的 Combine 结果相加。DeepSeek-MoE 把共享专家做成计算掩盖的材料，前提是共享支路足够重、能把等待 All2All 的空隙填上。共享专家的公式在 01，本篇只取系统后果：All2All 的 payload 跟 $K_r$ 走，不跟 $N_s$ 走。

设备受限路由（V2 的 $M$ 个设备、V3 的 $M$ 个节点）是在 **缩小 All2All 的目的集合**，不是把 Top-$K$ 改可导。token 最多去 $M$ 个 rank / 节点，跨 IB 的边变少，节点内再用 NVLink 转发。实现细节在 6.1.1；这里只要记住：那是通信可行集，和 STE 无关。

单卡上一次 MoE 前向可以按五步写，上 EP 之后每一步只是多了 rank：

1. **Gate。** $xW_g$ 得到 $E$ 维分数，Top-$K$ 得到下标和门控。这一步几乎总在本卡，算力相对专家 FFN 可忽略，但下标决定后面所有通信目的地。
2. **Permute / encode。** 按专家 id 把 token 排序，写出 offset。单卡这是一次本地 gather；EP 下这就是 Dispatch 要发给谁的清单。
3. **专家 GEMM。** SwiGLU 一类三矩阵（或两矩阵）按专家分块。Grouped GEMM / ScatterMoE / MegaBlocks / SonicMoE 争的都是这一步的 Tile 与 IO。
4. **Unpermute / decode。** 按原 token 序写回，乘上门控。EP 下这是 Combine。
5. **残差。** 和 Attention 输出相加。共享专家若存在，在 Combine 之后、残差之前并进来。

容量溢出发生在第 2 步写槽：目标专家的 $C$ 满了，这条 token 根本不进通信缓冲，后面的 GEMM 看不见它。dropless 时第 2 步的缓冲长度跟实际派遣走，通信形状随 step 变——CUDA Graph 因此才需要图 5 的 Masked layout。算法侧的 $C$、$\gamma$ 在 02，系统侧只要记住：**drop 发生在 Dispatch 写槽，不是发生在 GEMM 算完之后。**

Permute 本身是整数下标，不是浮点路由。玩具：四个 token 的专家 id 为 $[2,0,2,1]$，$E=3$。排序后 token 序变成「专家 0 的一条、专家 1 的一条、专家 2 的两条」，offset 为 $[0,1,2,4)$。EP=3 时这四段分别进三张卡的 Dispatch 缓冲；专家 2 那两段进同一 rank。Tile=128 时专家 2 只有 2 个 token，pad 126——这就是细粒度 + 小 batch 时 grouped GEMM 惨的原因，也是 token rounding 和 Masked layout 要解决的形状，不是 $p_i$ 没学好。

容量 $C$ 卡的是 offset 区间的长度上限：$C=2$ 且专家 2 分到 3 个 token 时，第三条在写槽被丢掉，残差把原 $x$ 送走。MegaBlocks 的 dMoE 拒绝这条 trim，改用 block-sparse 吃变长。两条路都承认「形状是动态的」；一条用 $C$ 把动态砍成静态，一条用稀疏核把动态吃下去。

卸载把第 3 步的权重来源从 HBM 换成 CPU/NVMe。预取窗口是「当前层专家 GEMM 的同时，把下一层预测会亮的专家搬进 HBM」。预测错了就停算等 PCIe。没有预测、每层现用现搬，延迟就是一次专家权重的 PCIe 拷贝，通常比 GEMM 本身长。所以卸载适合冷专家多、路由又稳的池；热专家仍应钉在 HBM。这和量化里「冷专家更低比特」是同一冷热，手段不同：一个搬层级，一个搬位宽。[OM-FREEPLAY] 按 PCIe 5.0 ×16 理论约 64 GB/s 估：200 MB 专家权重单次搬大约 3 ms；同尺寸 BF16 GEMM 在 H100 上往往亚毫秒。卸载要成立，预取命中率必须把这次拷贝藏进上一层计算；藏不住就不如少挂专家，或把冷专家量化后仍留在 HBM。

## 4. Grouped GEMM：Tile 填不满才是计算侧的税

专家算的是一堆形状不同的 GEMM。工业核把同一专家的 token 拼成一块做 **Grouped GEMM**，少一次 kernel launch。稀疏度升高以后，每个专家分到的 token 数经常 **整除不了 Tile**（常见 128）。尾部填充是纯浪费：Tensor Core 仍按满 Tile 转，有效 token 却没那么多。

这件事和负载辅助损失正交。$f_i P_i$ 拧的是「谁被选中」；Tile 填充拧的是「选中之后这块 GEMM 的形状」。token rounding 圆的是 Tile 倍数，不是把 $q=mk/n$ 写成均衡。

![Grouped GEMM 的 Tile 填充，以及 token rounding](./images/fig-moe-grouped-gemm-tile.png)

> 图 4：左，70 个真 token 配 58 个 pad，凑满 Tile 128。右，把该专家的 token 数圆到 Tile 倍数，pad 消失。数字是示意；SonicMoE 的 1.16× 是论文摘要里高稀疏相对 vanilla Top-$K$ 的 kernel。

**图 4 解析**

- 左栏绿条是真计算，灰条是填充。Router 只把真 token 送进专家；pad 是 kernel 为了对齐 Tile 补的。
- 右栏 token rounding 从源头改变「这个专家这一步吃多少 token」，让 $M$ 落在 Tile 倍数上。它 **不是** 负载均衡损失，也不替代容量因子 $\gamma$。
- 底注 1.16× 来自 SonicMoE 摘要的高稀疏设定，相对 vanilla Top-$K$ 的 **kernel 时间**，不是端到端 64 卡对比。

**SonicMoE**（Guo, Mishra, Cheng, Stoica, Dao, [arXiv:2512.14080](https://arxiv.org/abs/2512.14080)）对着细粒度 + 高稀疏改了三件事，不是新的 $p_i$：

1. **少缓存激活。** 细粒度 MoE 的反向若按 $O(TKd)$ 把中间激活堆在 HBM，粒度越细越吃内存。SonicMoE 改反向图，避免物化那块巨型张量，激活内存不再跟粒度一起涨。摘要：**-45%** 激活。
2. **Gather / Epilogue 和 IO 重叠。** Hopper 上 ping-pong warpgroup：一波 MMA，另一波搬下一 tile。
3. **Token rounding。** 高稀疏时相对 vanilla Top-$K$ 大约 **1.16×** kernel。

Hopper 上相对 ScatterMoE 的 BF16 核，细粒度 7B：**1.86×** 吞吐。端到端（同 lm-engine、FSDP-2、7B）：SonicMoE **64×H100** 约 **213B token/天**，ScatterMoE **96×H100** 约 **225B token/天**。卡数不同，不要读成「同一 64 卡快 1.86×」。Blackwell 上相对 DeepGEMM 基线，OLMoE 体量 7B 的前向 / 反向，arxiv v2 摘要写约 **25% / 15%**（ICLR 相机稿写成 28.7% / 22.1%，本篇跟 arxiv HTML v2）。仓：[Dao-AILab/sonic-moe](https://github.com/Dao-AILab/sonic-moe)。

旧专栏里「+40% TFLOPs、正向 >500 TFLOPs」没有进这篇论文的表，**不以它为准**。

SonicMoE 摘要里的 Hopper 对照是 **ScatterMoE 的 BF16 核**。ScatterMoE（Tan et al., [arXiv:2403.08245](https://arxiv.org/abs/2403.08245)）自己对照的是 MegaBlocks：用 Triton 的 `scatter2scatter` 把 grouped GEMM 和 scatter/group 读写真融合进 ParallelLinear，少一次「先 gather 成连续块再 GEMM」的拷贝，也少 padding。输入/输出可以各自选 grouped 或 scattered，四种组合覆盖前向和反向。它还演示过 Mixture of Attention，那是把同一原语套到注意力专家上，不是本篇的 FFN-MoE 主路。SonicMoE 在 Hopper 上宣称相对这块 BF16 核 1.86×，比的是 **核吞吐**，再和 64 卡 / 96 卡的端到端 tok/天分开读。三套系统不要合成一句「MoE kernel 快了 1.86× 所以 Tutel 过时了」：Tutel 管并行切换和 All-to-All 拓扑，MegaBlocks / ScatterMoE / SonicMoE 管专家 GEMM 怎么喂给 Tensor Core。

## 5. Contiguous 与 Masked：Prefill 和 Decode 不是同一块 buffer

DeepGEMM 这一路把 MoE 的 grouped GEMM 分成两种 layout，对应两种运行时约束。

**Contiguous。** Prefill 或训练前向：各专家分到的 token 数已经知道，可以按专家拼接成一段连续 buffer，用 offset / index 做逻辑切分。每个专家的 $M$ 仍要对齐到 Tile（如 128），否则尾部又回到图 4 的填充。

**Masked。** Decode 加 CUDA Graph：下一步 expert–token 分配在 GPU 上才确定，CPU 来不及为每个 step 重建图。用带 mask 的 grouped GEMM 代替「显式拼 buffer」，图的形状保持静态，mask 把空槽从计算里拿掉。

Tile 取 128 不是论文审美。Hopper / Blackwell 的 Tensor Core 指令按固定 $M$ 块吃矩阵，尾部 70 个 token 的专家要么 pad 到 128，要么换一套不吃满 Tensor Core 的核。图 4 左栏的 58 个灰格，就是这条硬件约束在 grouped GEMM 上的投影。token rounding 把「70」改成「128 或 64」这类倍数，是用 **多算几个真 token**（或少接几个）换掉 pad；多算的那些 token 仍然走真实专家，和「用零去填」不是一回事。高稀疏时 1.16× 来自「pad 占比本来就高」，稠密 Top-1、$E$ 很小的层上，rounding 的相对收益会缩小——摘要把 1.16× 钉在高稀疏 kernel，不要写进每一层。

Tutel 的 fast encode/decode 对应上面五步里的第 2、第 4 步：下标 → 偏移 → 打包。这一步在 Python 里做会变成 host 同步；放到 GPU 上和 All2All 排队，才能藏进计算。它仍然不是路由。

![Contiguous layout 与 Masked layout](./images/fig-moe-contiguous-vs-masked.png)

> 图 5：左，Prefill / 训练前向把 token 按专家拼成连续段。右，Decode + CUDA Graph 用 mask 保住静态图。虚线是 mask，不是反向梯度。

**图 5 解析**

- 左列紫盒 token 进一条分三段的 buffer（Expert 1/2/3），再进 Grouped GEMM。offset 写在走廊上，不写进 GEMM 盒子里。
- 右列同样从 token 出发，进带虚线 mask 的槽位网格，再进 Masked Grouped GEMM。mask 线两端 **没有** 箭头——它是辅助，不是数据回流。
- 两列都不是路由公式。换 layout 不改变 Top-$K$ 选了谁，只改变「选完之后 GEMM 怎么喂给 Tensor Core」。

MegaBlocks（Gale, Narayanan, Young, Zaharia, [arXiv:2211.15841](https://arxiv.org/abs/2211.15841)）走另一条：把 MoE 写成 **block-sparse** 算子，不再把每专家 token 数 trim / pad 成固定容量。摘要：相对 Tutel 端到端最多约 **40%**，相对 Megatron-LM 上的稠密 DNN 约 **2.4×**。dMoE 从不丢 token。容量因子 $\gamma$ 和 drop / dropless 的算法账在 [2.4.1 第 5 节](../../../../2-核心原理与架构/2.4-前沿架构与变体/2.4.1-混合专家模型MoE/2.4.1-混合专家模型MoE.md)；本篇只取「系统可以不靠 dropless 口号，而靠稀疏核把动态形状吃下来」。

## 6. Tutel 与 SmartMoE：自适应并行，不是新门控

静态并行假定每步专家负载差不多。MoE 的 token 分配随输入变，静态切分会在某几张卡上打满、其余空转。Tutel 和 SmartMoE 做的是 **运行时换并行组合**，公式侧的 $R(x)$ 不动。

**Tutel**（Hwang et al., [arXiv:2206.03382](https://arxiv.org/abs/2206.03382)）给 MoE 参数和输入同一套 layout，从而能在运行时切换并行和流水，而不做张量搬家、也不改数学等价。附带 Flexible All-to-All、二维分层（2DH）All-to-All、fast encode/decode。2DH 的意思是：节点内走 NVLink 域的 All-to-All，节点间走 IB 域的 All-to-All，两跳合成一次逻辑 EP 交换，避免「所有 rank 两两打满 IB」。Microsoft 介绍页写 2DH 相对当时通信基线在 2048 GPU 上最多约 **20.7×**；单层端到端相对 Fairseq： **16** 张 A100 **4.96×**，**2048** 张 A100 **5.75×**。SwinV2-MoE 相对 Fairseq：训练最多 **1.55×**，推理最多 **2.11×**。仓：[microsoft/Tutel](https://github.com/microsoft/Tutel)。20.7× 是通信微基准，不要写成「Swin 训练 20 倍」。

「identical layout」值得单独说一句。普通实现里，DP 把同一份专家复制到每张卡，EP 把不同专家放到不同卡，两套放置互不相通，要从 DP 切到 EP 就得搬权重。Tutel 把参数和输入做成同一套切分，DP 和 EP 只是对这套切分的两种读法，切换时不必 migrate tensor，也不改前向代数。这就是「零代价换并行」的前提。没有这套 layout，SmartMoE 在线搜索就算找到更好的放置，执行时仍要付搬家税。论文数字是单层相对 Fairseq；换到 2026 年的 DeepEP 栈，倍数不能原样粘贴。

SwinV2-MoE 是 Tutel 论文的端到端载体，任务是视觉，不是 LLM Decode。1.55× / 2.11× 只能说明「这套自适应并行在 Swin + Fairseq 基线上成立」，不能写成「任意 Mixtral 推理 2.11×」。LLM 侧该对的是 DeepEP / MegaBlocks / SonicMoE 各自报告里的设定。视觉 MoE 和自回归 MoE 连因果约束都不同，系统数字不要跨模态挪用。

Fairseq 基线是 2022 年前后的 MoE 实现。Tutel 的 4.96× 分子分母都老。今天拿 DeepSeek-V3 的 EP 栈去重跑那张表，倍数会变，本篇不编新倍数。引用 Tutel 只为钉三件事：layout 可切换、2DH 分层 All-to-All、单层加速曾经相对 Fairseq 到过五倍左右。新作业的绝对吞吐以 SonicMoE / DeepEP 自己的表为准。

SmartMoE 的 1.88× 分母是 FasterMoE，不是 Tutel，也不是 ScatterMoE。三篇系统论文的对照基线不同，倍数不能加减。ATC 2023、最多 64 GPU，放到 2026 年千卡 EP 作业上只作「离线池 + 在线搜放置」这条思路，不把 1.88 写成今天的集群加速比。FasterMoE 自己也是系统论文，不是稠密 Megatron。1.88× 读成「相对当时最快的 MoE 训练系统」，不要读成「相对稠密模型」。对照表怎么读：同一行只比同一篇论文自己的基线。跨论文加减倍数没有意义。SonicMoE 的 1.86× 和 Tutel 的 4.96× 分母不是同一个系统，年份也差三年。不能合成「系统优化一共快了六倍」。分母不同，加起来没有物理意义。不要加。

**SmartMoE**（Zhai, He, Ma, Zong, Zhang, Zhai, **USENIX ATC 2023**，不是 2024）把混合并行的搜索空间拆成：离线构造可互转的静态池（负载感知的性能模型），在线用轻量搜索在池里挑专家放置。评测最多 64 GPU，端到端相对 FasterMoE 最多 **1.88×**。[ATC 论文](https://www.usenix.org/conference/atc23/presentation/zhai)。

两篇都不要读成「自动学会了 Top-$K$」。它们选的是 DP/EP/TP 怎么拼、专家放哪张卡。路由器仍然是 2.4.1 里那套离散选择。

Mixtral 8×7B 这种 $E=8$、$K=2$ 的层，EP 度常见取 8（每卡一个专家）或 2（每卡四个专家）。EP=8 时 Dispatch 的目的 rank 几乎等于专家 id，式 (2) 的跨卡边最多；EP=2 时一张卡上四个专家走本地 grouped GEMM，All2All 只在两个 EP rank 之间打，延迟低、单卡参数高。选哪一档看的是「一张卡能不能放下 $E/\mathrm{EP}$ 份专家权重」，不是看谁的论文标题更新。细粒度到 $E=256$、$K=8$ 时，EP=256 会让 All2All 变成全连接风暴，工业上才把专家捆到节点、再用节点受限的 $M$。这是图 2 第三行在真实规模上的收紧，不是新路由。

SonicMoE 的端到端数字明确写了 **FSDP-2 + lm-engine + 7B**。FSDP-2 把参数分片；MoE 的专家权重若再被 EP 切一次，分片粒度和 EP 组必须对齐，否则 gather 会把「本不该在这张卡上的专家」拉回来，显存优势清零。这是并行组合的约束，不是 FSDP 发明了新门控。评测里 64 卡对 96 卡，用的是同一套数据并行外壳、不同的专家核——比的是核和激活内存，不是「FSDP-2 让 MoE 快了 1.86×」。

## 7. 和机制专文、6.1.1 怎么分工

| 问题 | 去哪 | 本篇不写 |
|------|------|----------|
| 先 Top-$K$ 再 Softmax、STE、ReMoE | [2.4.1](../../../../2-核心原理与架构/2.4-前沿架构与变体/2.4.1-混合专家模型MoE/2.4.1-混合专家模型MoE.md) / [03](../../../../2-核心原理与架构/2.4-前沿架构与变体/2.4.1-混合专家模型MoE/03-MoE-Top-K运算可导性分析/03-MoE-Top-K运算可导性分析.md) | 第二份可导证明 |
| 共享专家、$K_r$、$b_i$ | [01](../../../../2-核心原理与架构/2.4-前沿架构与变体/2.4.1-混合专家模型MoE/01-DeepSeek-MoE/01-DeepSeek-MoE.md) | 第二份 DeepSeek-MoE 公式 |
| 容量 $C$、drop、aux、z-loss | [2.4.1 第 4–5 节](../../../../2-核心原理与架构/2.4-前沿架构与变体/2.4.1-混合专家模型MoE/2.4.1-混合专家模型MoE.md) | 把 rounding 写成 $\gamma$ |
| 瘦专家 $\ell$、分位数 bias | [10](../../../../2-核心原理与架构/2.4-前沿架构与变体/2.4.1-混合专家模型MoE/10-Stable-LatentMoE与Quantile-Balancing/10-Stable-LatentMoE与Quantile-Balancing.md) | |
| Wave 藏 All-to-All、MoonEP 等 token | [6.1.1](../../6.1.1-分布式训练/6.1.1-分布式训练.md) | 把 MoonEP 说成新的 $p_i$ |
| 专家权重量化 | [6.3.1/09](../../../6.3-模型压缩/6.3.1-量化/09-MoE模型量化技术综述/09-MoE模型量化技术综述.md) | 把 QMoE 当 EP |
| FPGA / NDP | [9.1.5](../../../../9-AI工程化与基础设施/9.1-硬件基础/9.1.5-MoE硬件与加速/9.1.5-MoE硬件与加速.md) | |

## 8. 失效

只开 EP、不处理热专家：All-to-All 等最慢的 rank，MFU 看起来像通信墙，其实是负载。细粒度加高 $K$ 仍按稠密 FFN 的激活检查点：HBM 先爆，这是 SonicMoE 要砍掉 $O(TKd)$ 的原因。把 token rounding 当成负载损失：圆的是 Tile，不是 $q=mk/n$。单卡卸载却按多卡 EP 的 overlap 估延迟：PCIe 不是 NVLink。把 Tutel 的 4.96× 安到「任意 16 卡 LLM 训练」上：那是单层 MoE 相对当时 Fairseq 的数。把 2DH 的 20.7× 安到端到端：那是通信微基准。把 213B tok/天和 225B tok/天直接比快慢：一个 64 卡、一个 96 卡。Contiguous layout 拿去绑 Decode 的 CUDA Graph：step 间形状在变，图会废。Masked layout 拿去当「可导路由」：mask 是 GEMM 辅助，不是 STE。ScatterMoE 的 ParallelLinear 拿去当「专家结构创新」：它是 scatter 与 GEMM 的融合核。Decode batch=1 仍开跨节点 EP：式 (2) 里 $T$ 太小，All2All 启动开销比 GEMM 还刺。把共享专家也 dispatch 到远端：白加一倍 All2All，还把 always-on 支路变成通信。

下一篇机制仍回 [2.4.1](../../../../2-核心原理与架构/2.4-前沿架构与变体/2.4.1-混合专家模型MoE/2.4.1-混合专家模型MoE.md)。量化走 6.3.1；板级加速走 9.1.5。

## 参考文献

1. Guo et al. (2025). [SonicMoE: Accelerating MoE with IO and Tile-aware Optimizations](https://arxiv.org/abs/2512.14080). 激活 -45%；Hopper 相对 ScatterMoE BF16 1.86×；64×H100 213B tok/天 vs ScatterMoE 96×H100 225B；token rounding 高稀疏约 1.16×；Blackwell 相对 DeepGEMM 约 25%/15%（v2 摘要）。
2. Hwang et al. (2022). [Tutel: Adaptive Mixture-of-Experts at Scale](https://arxiv.org/abs/2206.03382). 单层 4.96× / 5.75×（16 / 2048 A100 vs Fairseq）；SwinV2-MoE 训练 1.55×、推理 2.11×。
3. Zhai et al. (2023). [SmartMoE](https://www.usenix.org/conference/atc23/presentation/zhai). USENIX ATC 2023。相对 FasterMoE 端到端最多 1.88×；最多 64 GPU。
4. Gale, Narayanan, Young, Zaharia. (2022). [MegaBlocks](https://arxiv.org/abs/2211.15841). 相对 Tutel 最多约 40%；相对 Megatron-LM DNN 约 2.4×；dMoE 不丢 token。
5. DeepSeek-AI. (2024). [DeepSeek-V3 Technical Report](https://arxiv.org/abs/2412.19437). 大规模 EP 的系统背景，不是图 1–5 的出处。
6. Tan et al. (2024). [Scattered Mixture-of-Experts Implementation](https://arxiv.org/abs/2403.08245). Triton `scatter2scatter` / ParallelLinear；SonicMoE Hopper 对照的是它的 BF16 核。
7. 卡间重叠：[6.1.1](../../6.1.1-分布式训练/6.1.1-分布式训练.md)。门控与 DeepSeek-MoE：总览 / 01，本篇不重推。
8. Tutel 2DH 20.7×：Microsoft Research 介绍页对 2206.03382 的通信微基准表述；单层 4.96× / 5.75× 以论文摘要为准。
