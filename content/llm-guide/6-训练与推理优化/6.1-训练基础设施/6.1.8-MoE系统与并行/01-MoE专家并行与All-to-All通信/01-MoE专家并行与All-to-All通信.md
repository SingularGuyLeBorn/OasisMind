---
title: "01 · MoE 专家并行与 All-to-All 通信"
published: true
tags: ["MoE", "专家并行", "All-to-All", "DualPipe", "DeepEP", "Tutel"]
excerpt: "MoE 的专家参数放不进一张卡, 专家固定在卡上以后, 移动的只能是 token. 本篇从 dispatch 与 combine 的通信量出发, 整理 GShard 与 Switch 的切分, Tutel 的 2DH All-to-All, DeepSeek-V2 与 V3 的训练并行和 DualPipe, IB 与 NVLink 两级 dispatch, FP8 通信, DeepEP 以及 Comet 与 Flux 的通算重叠."
---
# 01 MoE 专家并行与 All-to-All 通信

一个 MoE 层的路由专家参数是 $N\cdot3dH$: $N$ 个专家, 每个专家是门控 FFN 的三个矩阵, 模型宽度 $d$, 专家中间维 $H$. DeepSeek-V3 每层 256 个路由专家, $d=7168$, $H=2048$, 一层路由专家约 $256\times3\times7168\times2048\approx1.13\times10^{10}$ 个参数, BF16 下约 22.5 GB. V3 共 61 层, 前三层是稠密 FFN, 其余 58 层是 MoE 层, 合计远超单卡显存. 专家必须分到多张卡上, 这就是专家并行 (EP).

路由器, 共享专家和负载均衡的公式在 [2.6 MoE](../../../../2-核心原理与架构/2.6-MoE/2.6-MoE.md) 与 [DeepSeek-MoE](../../../../2-核心原理与架构/2.6-MoE/01-DeepSeek-MoE/01-DeepSeek-MoE.md). 下面看的是路由结果确定之后, token 怎么在卡之间移动, 移动的字节数是多少, 以及各个系统怎样把这段通信藏进计算. 推理部署放在 [02](../02-MoE推理部署/02-MoE推理部署.md), 专家 GEMM 的 kernel 放在 [03](../03-MoE专家计算/03-MoE专家计算.md).

## 1. 专家并行的数据流与通信量

### 1.1 参数放不下, token 要移动

专家固定在卡上以后, 移动的只能是 token. 设 EP 组有 $R$ 张卡, 每卡持有 $N/R$ 个专家, 本卡有 $t$ 个 token, 每个 token 选 $k$ 个专家. 路由均匀时, 每张卡在一次 dispatch 中发出的数据量约为

$$
V_{\mathrm{dispatch}}=t\,k\,d\,b\cdot\frac{R-1}{R} \tag{1}
$$

字节, 其中 $b$ 是每个元素的字节数, $(R-1)/R$ 是目标专家不在本卡的比例. combine 把专家输出送回源卡, 数据量相同, 方向相反. 式 (1) 与专家数 $N$ 无关, 与 $k$ 和 $d$ 成正比. 专家权重始终留在自己的卡上, 不出现在式 (1) 里; EP 的集合通信搬的是激活. [LatentMoE](../../../../2-核心原理与架构/2.6-MoE/04-Stable-LatentMoE与Quantile-Balancing/04-Stable-LatentMoE与Quantile-Balancing.md) 把路由专家放进宽度 $\ell<d$ 的潜空间, 改的就是式 (1) 里的 $d$.

代入 V3 的数字: $k=8$, $d=7168$. 每 token 每层前向的路由专家计算为 $8\times2\times3\times7168\times2048\approx7.05\times10^8$ FLOPs. dispatch 以 FP8 发送, 8 个副本共 $8\times7168=57344$ 字节; combine 以 BF16 返回, 共 114688 字节. 两者相比, 每字节通信对应约 4100 FLOPs 的专家计算. V3 报告的估计是, 跨节点专家并行让训练中的计算与通信之比约为 1:1, 不做重叠时通信会占去一半时间. 第 3 节的 DualPipe 和第 4 节的通信 kernel 都是围绕这个比例设计的.

### 1.2 五种切法与 AllReduce

稠密 Transformer 的并行有 DP, TP, PP 三个轴, 讲法见 [6.1.1 分布式训练](../../6.1.1-分布式训练/6.1.1-分布式训练.md). MoE 多出一个专家轴, 再加上按序列切激活的 SP, 一共五种:

| 维度 | 切什么 | 主要通信 |
|------|--------|----------|
| 数据并行 (DP) | batch; ZeRO 进一步切优化器状态, 梯度, 参数 | 梯度 AllReduce 或 ReduceScatter |
| 张量并行 (TP) | 单层内的矩阵 | 每层的 AllReduce |
| 流水并行 (PP) | 层 | 相邻 stage 间的激活与梯度点对点传输 |
| 序列并行 (SP) | 序列维度上的激活 | AllGather / ReduceScatter |
| 专家并行 (EP) | 专家 | dispatch / combine 两次 All-to-All |

表中最终一列分成两类. AllReduce 让每张卡得到同一份聚合结果; All-to-All 让每张卡把不同的 token 发给不同的卡, 再收回属于自己的那些. ring 实现中, $R$ 张卡对 $n$ 字节数据做 AllReduce, 每张卡发送 $V_{\mathrm{AR}}=2\cdot\frac{R-1}{R}\,n$ 字节, ReduceScatter 与 AllGather 各占一半 ([Patarasuk & Yuan, 2009](https://doi.org/10.1016/j.jpdc.2008.09.002)). TP 每层都要对完整激活做 AllReduce, 通信量与 $d$ 和 token 数成正比, 与 $k$ 无关; EP 只移动被路由的 token, 且只有 MoE 层需要. 所以注意力层通常用 DP 或小规模 TP, MoE 层用 EP, 两者在同一批卡上共存.

两种切法的字节数可以按每个 token 在整组卡上的总流量比较. 用 $R$ 路 TP 切专家 FFN 时, $R$ 张卡处理同一批 token, 前向在 FFN 之后做一次 AllReduce, 每个 token 在整组上的流量是 $R\cdot2\frac{R-1}{R}db=2(R-1)db$; 用 $R$ 路 EP 时, 每个 token 只在源卡上, dispatch 加 combine 的流量是 $2kdb\frac{R-1}{R}$. 取 $k=8$: $R=8$ 时两者分别是 $14db$ 和 $14db$, 打平; $R=64$ 时 TP 是 $126db$, EP 约 $15.75db$, 差 8 倍. TP 的流量随 $R$ 线性增长, EP 的流量趋于 $2kdb$ 封顶. TP 还把每个专家的矩阵切得更细, 专家 GEMM 本来就窄, 再切会更难跑满 Tensor Core. 这两点合起来, 是专家数多的模型优先用 EP 的原因.

AllReduce 可以写成 $\mathrm{AllReduce}(x)=\mathrm{AllGather}(\mathrm{ReduceScatter}(x))$. 拆开以后, 中间的 ReduceScatter 结果按序列切分, 两个集合通信之间可以插入只需要局部数据的计算, ReduceScatter 和 AllGather 也能分别与相邻的 GEMM 重叠. 一层里最前面的 QKV GEMM 之前和最终的 MoE 下投影之后没有可以对插的计算, 这两处的通信藏不住. Kimi K3 的 prefill 用同一办法处理 Block AttnRes: TP 的 AllReduce 拆成 ReduceScatter 与 AllGather, 块内 kernel 在两者之间按序列切分的隐藏状态上运行, 不必在每个 TP rank 上物化全部 block 表示. ZeRO 分三级, ZeRO-1 只切优化器状态, ZeRO-2 再切梯度, ZeRO-3 连参数也切 ([Rajbhandari et al., 2020](https://arxiv.org/abs/1910.02054)); 每级都用更多通信换显存. DeepSeek 的 V2 与 V3 都只用 ZeRO-1, 参数与梯度在每个 DP rank 上完整保存.

### 1.3 dispatch 与 combine 在计算图上

单卡 MoE 已经有路由器, dispatch, combine 三块: dispatch 建立 token 到专家的置换, 把同一专家的 token 排到一起; combine 按门控权重把专家输出写回原 token 位置. 上多卡以后, 两步各多一个 rank 维, 映射变成 token 到 rank 再到专家. 路由器仍在本卡计算, 算出 Top-$k$ 下标以后, 下标决定这一层所有通信的目的地.

![专家并行的 dispatch 与 combine All-to-All](./images/fig-moe-ep-alltoall.png)

**图 1 解析**

- 左侧是各卡上的 token, 右侧是各卡持有的专家 (每卡两个). Top-$k$ 路由器决定每个 token 去哪个专家, 实线是 dispatch, 虚线是 combine.
- 图中每张卡的 token 只画了一条通向同号卡的箭头. 实际的 All-to-All 中每张卡都可能向所有卡发送数据, GPU 0 上的 token 若选中 E2, 就要发往 GPU 1; 式 (1) 的 $(R-1)/R$ 就是这部分跨卡流量.
- combine 回来以后, 各专家输出按门控权重在源卡上加权求和. 负载不均时, 持有热门专家的卡算得久, 其余卡在下一次 All-to-All 前等它.

共享专家不进 All-to-All. 它处理本卡所有 token, 每卡都有一份 (或随 TP 切开), 算完与路由专家的 combine 结果相加, 所以 All-to-All 的数据量跟路由专家数 $k$ 走, 不跟共享专家数走. 把共享专家也当成远端专家 dispatch, 会凭空多出一份通信, 第 3.1 节的 V2 正是利用它不依赖 dispatch 这一点去掩盖通信. 注意力侧的 TP 与专家侧的 EP 拼在一起时, 一层的数据流如图 2.

![节点内 TP 的注意力与跨专家的 EP](./images/fig-moe-tp-ep-dispatch.png)

**图 2 解析**

- 五个阶段依次是输入, TP 切分的注意力 (两个 TP rank 之间 AllReduce), dispatch All-to-All, 各专家计算, combine All-to-All.
- 图中注意力放在 rank 0–1, 专家放在 rank 2–5, 两组卡互不重叠. V3 的训练与推理都是同一批卡既算注意力又持有专家, 分开画只是为了区分两种并行.
- 每个专家整块住在自己的 EP rank 上, 没有再按 TP 切. 图中每个专家只连一个输入方向, 实际每个专家都接收来自所有数据并行分片的 token.

### 1.4 变长 All-to-All: 先交换计数

稠密模型的集合通信每步形状固定, MoE 的 dispatch 不是: 本卡发给每张卡多少 token, 由这一步的路由结果决定, 接收方事先不知道要分配多大的缓冲区. 一种做法是多做一次通信. Meta 在 Llama 4 推理方案 MetaShuffling ([PyTorch Blog, 2025](https://pytorch.org/blog/metashuffling-accelerating-llama-4-moe-inference/)) 里把 EP 的通信写成三次 All-to-All: 第一次交换每个专家收到的 token 数 (形状为 $[E]$ 的计数张量), 第二次按路由把 token 从按数据并行组织换成按专家组织, 第三次在专家算完后换回来. 计数张量只有 $E$ 个整数, 字节数可以忽略, 但它是一次完整的同步点.

计数到手以后还有两种选择. 一是按真实计数分配稠密张量, 不传填充, 但形状每步都变, CPU 要读到计数才能分配, 和 CUDA Graph 不兼容, 适合 eager 模式. 二是把发给每张卡的数据填充到静态上限, 形状固定, 可以被图捕获, 代价是网络上多传了填充. MetaShuffling 两种都实现了, 按运行模式选择. DeepEP 的做法是第三种: 接收方按配置的容量预先分配输出, 真实计数留在 GPU 上, 由后面的专家 GEMM 自己读取有效范围, 不经过 CPU. 这三种选择在推理部署中的取舍见 [02](../02-MoE推理部署/02-MoE推理部署.md) 第 4 节.

## 2. 早期切分: GShard, Switch 与 Tutel 的 2DH

### 2.1 GShard 与 Switch

GShard ([Lepikhin et al., 2020](https://arxiv.org/abs/2006.16668)) 在 Transformer 中每隔一个 FFN 换成 MoE 层. 专家沿设备切分, 每个设备持有一部分专家, 其余层在设备间复制; 注意力沿 batch 维切分. MoE 层前后用 AllToAll 在「按 batch 切」与「按专家切」两种分片之间转换. 用户只给少量张量写分片标注, SPMD 分区器生成每个设备上的程序, 编译时间与设备数无关. 论文在 2048 个 TPU v3 核上用 4 天训练了 600B 参数的多语言翻译模型, 合计 22 TPU 核年, 权重与激活都用 float32. GShard 的容量分组见 [2.6 MoE 负载均衡与容量](../../../../2-核心原理与架构/2.6-MoE/03-MoE负载均衡与容量/03-MoE负载均衡与容量.md).

Switch Transformer ([Fedus et al., 2021](https://arxiv.org/abs/2101.03961)) 在 Mesh-TensorFlow 上组合数据, 模型与专家三种并行. 论文第 5 节用 $n$ 个核的网格说明各自切什么: 纯数据并行时每个核持有完整权重, 只切 batch, 只有梯度汇总需要通信; 纯模型并行时每个核持有 FFN 中间维的一段, 所有核处理同一批 token, 每层前后都要通信; 专家并行时每个核持有不同的专家, token 按路由在核之间交换. 三者可以叠加, 例如在数据并行的维度上同时切专家, 在模型并行的维度上再切单个专家的中间维. Switch-XXL (395B 参数, 64 个专家) 同时用三种; Switch-C (1571B 参数, 2048 个专家) 只用专家并行. 专家数足够多时, 每个设备放一个或几个专家, 单个专家的矩阵不必再切, TP 的每层 AllReduce 也就省掉了.

### 2.2 小消息问题与 2DH All-to-All

式 (1) 只算了总字节数, 没有算消息大小. Tutel ([Hwang et al., 2023](https://arxiv.org/abs/2206.03382)) 附录 A 分析了 NCCL 点对点实现的 Linear All-to-All: $n$ 张卡, 每卡把 $S$ 字节分成 $n$ 块, 每块 $S/n$ 字节, 和所有其他卡两两交换. $S$ 由模型决定, 卡数增加时 $S/n$ 变小, 小消息填不满 NVLink 和 InfiniBand 的带宽. 取 $S=128$ MiB, $n=2048$, 每块只有 64 KiB.

2DH (两维分层) All-to-All 先在节点内交换, 把本节点 $m$ 张卡发往同一张远端卡的块汇聚成一块, 再做节点间 All-to-All. 节点间阶段只有 $n/m$ 个目的地, 每块约 $mS/n$ 字节; 上面的例子取 $m=8$, 跨节点消息从 64 KiB 变成 512 KiB. 直接做节点内汇聚的问题是要在每张卡上做 $O(n/m)$ 次不连续访存, 论文测到 $S=128$ MiB, $m=8$ 时这一步从 $n=8$ 的约 600 μs 涨到 $n=2048$ 的约 5 ms. 2DH 因此在节点内与节点间交换之前各加一次 stride 拷贝, 先把目的地相同的块排到连续地址, 前三个阶段的延迟只与 $S$ 有关, 不随 $n$ 增长. 规模小时 Linear 更快, 规模大时 2DH 更快, Tutel 在运行时按配置选择.

DeepSeek-V3 的两级 dispatch (第 3.3 节) 方向相反: 先跨节点经 IB 发到目标节点上同号的卡, 再在节点内经 NVLink 转发. 两者的共同点是同一份数据在跨节点链路上只走一次, 再在节点内扇出. Tutel 汇聚的是发往同一远端卡的多块数据; V3 合并的是同一 token 发往同一节点上多个专家的副本, 这一点只有在路由器限制了每个 token 的目标节点数之后才成立.

## 3. DeepSeek-V2 与 V3 的训练并行

### 3.1 V2: 设备受限路由与共享专家重叠

DeepSeek-V2 ([DeepSeek-AI, 2024](https://arxiv.org/abs/2405.04434)) 在 H800 集群上用 16 路 zero-bubble 流水并行, 8 路专家并行和 ZeRO-1 数据并行. 激活参数只有 21B, 部分算子在反向时重算以节省激活显存, 因此不需要张量并行, 省去 TP 的通信. 每层的路由专家均匀放在 8 个设备上 ($D=8$), 设备受限路由让每个 token 最多发往 3 个设备 ($M=3$), 对应的设备级与通信级均衡损失见 [DeepSeek-MoE](../../../../2-核心原理与架构/2.6-MoE/01-DeepSeek-MoE/01-DeepSeek-MoE.md). 设备受限路由缩小的是 All-to-All 的目的集合, 不改 Top-$k$ 的可导性.

V2 的另一处系统设计是把共享专家的计算与专家并行的 All-to-All 重叠. 共享专家处理本卡所有 token, 不依赖 dispatch 的结果, 可以在 token 在网络上传输时先算; 路由专家必须等 dispatch 完成. 共享专家越大, 能掩盖的通信越多. V2 还为通信, 路由算法和跨专家的融合线性计算写了专用 CUDA kernel. K3 推理侧把共享专家 GEMM 放在单独 stream 上与其他 kernel 重叠, 思路相同.

### 3.2 V3 的配置与 DualPipe

V3 报告 ([DeepSeek-AI, 2024](https://arxiv.org/abs/2412.19437)) 第 3 节: 训练集群 2048 张 H800, 每节点 8 卡, 节点内 NVLink 与 NVSwitch, 节点间 InfiniBand. 并行方式是 16 路 PP, 跨 8 个节点的 64 路 EP, ZeRO-1 DP, 不使用 TP. 每层 256 个路由专家分到 64 张卡, 每卡 4 个, 每节点 32 个, 一层的专家占满 8 个节点; 节点受限路由允许每个 token 去其中至多 4 个节点. 省掉 TP 靠的是显存优化: RMSNorm 与 MLA 上投影在反向时重算, EMA 参数放 CPU, MTP 模块与主模型共享 embedding 和输出头 (DualPipe 把最浅层与最深层放在同一个 PP rank 上, 共享参数在物理上只存一份).

这套配置下每个专家能分到多少 token, 可以直接算. 设 64 张卡每张在一个 micro-batch 里有 $t$ 个 token, EP 组一共 $64t$ 个 token, 每个选 8 个路由专家, 路由均匀时每个专家收到 $64t\times8/256=2t$ 个 token, 每卡 4 个专家合计 $8t$ 行. $t=4096$ 时每个专家 8192 行, 远大于 grouped GEMM 的 tile 高度 128, 填充的比例很小 (见 [03](../03-MoE专家计算/03-MoE专家计算.md) 第 2.1 节). EP 度开得大, 本卡专家数少, 每个专家的 batch 就大; 训练侧的 EP 规模和专家 GEMM 的效率是同一件事的两面.

DualPipe 把每个 chunk 拆成注意力, all-to-all dispatch, MLP, all-to-all combine 四部分; 反向 chunk 的注意力与 MLP 再按 ZeroBubble 的做法拆成「对输入求梯度」与「对权重求梯度」两段, 另有 PP 通信. 对一对前向与反向 chunk, 重新排列这些部分, 并手动调整计算与通信各占的 SM 比例, 让 all-to-all 与 PP 通信都被计算掩盖. 整体调度是双向流水: micro-batch 同时从流水线两端送入. 报告 Table 2 比较了三种流水的气泡, $F$ 是前向 chunk 时间, $B$ 是完整反向 chunk 时间, $W$ 是「对权重求梯度」的时间, $F\&B$ 是一对互相重叠的前向与反向 chunk 的时间:

$$
\mathrm{Bubble}_{\mathrm{1F1B}}=(PP-1)(F+B) \tag{2}
$$

$$
\mathrm{Bubble}_{\mathrm{ZB1P}}=(PP-1)(F+B-2W) \tag{3}
$$

$$
\mathrm{Bubble}_{\mathrm{DualPipe}}=\Bigl(\frac{PP}{2}-1\Bigr)(F\&B+B-3W) \tag{4}
$$

代入 V3 的 $PP=16$, 1F1B 为 $15(F+B)$, ZB1P 为 $15(F+B-2W)$, DualPipe 为 $7(F\&B+B-3W)$, 系数从 15 降到 7. 代价是参数存两份, 峰值激活从 $PP$ 份增加到 $PP+1$ 份. V3 的 EP 规模大, 每卡上的专家参数少, 参数存两份对显存影响不大. 与 Chimera 相比, DualPipe 只要求 stage 数和 micro-batch 数能被 2 整除, 不要求 micro-batch 数能被 stage 数整除; micro-batch 增多时气泡与激活都不增长.

### 3.3 两级 dispatch 的通信量

V3 集群的节点间 IB 为 50 GB/s, 节点内 NVLink 为 160 GB/s, 约 3.2 倍. 节点受限路由让每个 token 最多去 4 个节点: 先按每个节点上亲和度最高的 $k/M=8/4=2$ 个专家的分数之和给节点排序, 选出前 $M=4$ 个节点, 再只在这些节点的专家里做 Top-8. token 的路由决定后, 先经 IB 发送到各目标节点上与源卡同号的 GPU, 到达后立即经 NVLink 转发到持有目标专家的 GPU, 不被后到的 token 阻塞. 这样 IB 与 NVLink 的传输完全重叠.

两级转发改变了式 (1) 的跨节点部分: 同一 token 发往同一节点的多个专家时, IB 上只传一份. 每 token 的 IB 数据量上限是 4 个节点各一份, FP8 下为 $4\times7168=28672$ 字节, 是 8 个副本直接发送的一半. 按 50 GB/s 算, 每 token 每层单向的 IB 传输上限约 0.57 μs; 一张卡在一个 micro-batch 里若有 4096 个 token, 单向 dispatch 的 IB 部分约 2.35 ms, combine 以 BF16 返回再翻倍. 报告的估算是, 在不增加 NVLink 开销的前提下每个 token 平均可以在每个节点选 3.2 个专家, 所以同样的通信代价最多能支持 $4\times3.2\approx13$ 个专家, V3 实际只用 8 个.

## 4. 通信 kernel 与通算重叠

### 4.1 V3 的通信 kernel 与低精度通信

V3 的通信 kernel 用 warp specialization 把 20 个 SM 分成 10 个通信通道. dispatch 中 IB 发送, IB 到 NVLink 的转发, NVLink 接收分别由不同的 warp 处理; combine 中 NVLink 发送, NVLink 到 IB 的转发与累加, IB 接收与累加同样分开. 各任务的 warp 数按实际负载动态调整. kernel 使用定制的 PTX 指令并自动调节通信块大小, 减少对 L2 cache 的占用和对其他计算 SM 的干扰. 报告称 20 个 SM 就能跑满 IB 与 NVLink 带宽.

MoE 上投影之前的激活先量化为 FP8 再 dispatch, 与上投影的 FP8 前向计算衔接, 缩放因子取 2 的整数次幂; MoE 下投影之前的激活梯度也这样处理. 前向与反向的 combine 都保留 BF16. dispatch 用 FP8 让式 (1) 中的 $b$ 从 2 降到 1, 另加缩放因子. V3 对激活按 1×128 的 tile 量化 (每个 token 每 128 个通道一个缩放因子), 一个 7168 维的 token 有 $7168/128=56$ 个缩放因子; 若每个按 FP32 的 4 字节存, 是 224 字节, 约为 FP8 主体的 3%. combine 做的是加权求和, 误差会直接进入残差流, 这是它保留 BF16 的原因.

V3 报告第 3.5.1 节写了这套方案的代价: H800 的 132 个 SM 中有 20 个分给通信, 约占 15%, 这部分 SM 上的 Tensor Core 完全闲置. 这些 SM 做四类事: 在 IB 与 NVLink 两个域之间转发数据, 并把发往同一节点多张卡的 IB 流量汇聚到一张卡上发出; 在 RDMA 缓冲区与输入输出缓冲区之间搬运数据; 执行 combine 中的归约; 按专家分块传输时管理细粒度的内存布局. 报告希望硬件把这些任务从 SM 上卸载到 GPU 协处理器或网络协处理器 (例如 NVIDIA SHARP), 并在计算单元看来统一 IB (scale-out) 与 NVLink (scale-up) 两套网络, 让计算单元用读, 写, 多播, 归约等简单原语在统一域内提交通信请求.

### 4.2 DeepEP

[DeepEP](https://github.com/deepseek-ai/DeepEP) 是 V3 通信 kernel 的开源实现, 提供高吞吐和低延迟两类 EP All-to-All kernel, 包括 FP8 dispatch. 当前版本把两类接口统一为 `EPBuffer`, 训练, prefill, decode 用同一套 dispatch / combine API, SM 数和 QP 数按 MoE 配置解析估算, 不再靠自动调参. 输出采用为 grouped GEMM 准备的展开布局, 对齐值 `expert_alignment` 取 DeepGEMM contiguous 布局要求的 M 对齐, 布局细节见 [03](../03-MoE专家计算/03-MoE专家计算.md).

dispatch 与 combine 可以与计算 stream 异步执行, 调用立即返回一个事件, 在专家计算需要结果的位置再等待, 中间插入其他计算. 训练把前向的 handle 保存给反向使用, 反向复用已保存的展开布局, 省去再次统计各专家接收数的 CPU 同步. DeepEP 的通信仍要占用 GPU SM, README 写明不支持零 SM 的 RDMA EP, 这对应的正是上一节 V3 报告提出的硬件限制. 冗余专家的权重预取与梯度回收原语用在部署和负载均衡上, 放在 [02](../02-MoE推理部署/02-MoE推理部署.md) 讲.

### 4.3 细粒度通算重叠: Comet 与 Flux

DualPipe 的重叠粒度是 chunk: 一个 micro-batch 的通信对另一个 micro-batch 的计算. Comet ([Zhang et al., 2025](https://arxiv.org/abs/2502.19811)) 把粒度推到单个 MoE 层内部. 论文统计在常用模型和框架上, MoE 层的设备间通信可以占到整个模型执行时间的 47%; 已有的按 micro-batch 切块流水的做法会降低 GEMM 效率, 掩盖也不充分. 难点在粒度不匹配: 通信按 token 走, grouped GEMM 按 128×128 的 tile 算, 一个专家的一个 tile 需要的 128 个 token 散在多张卡上, 要全部到齐才能开算. Comet 把通信与计算之间共享的缓冲区 (论文称 shared tensor) 沿特定维度分解, 重排数据和算子内的执行顺序, 消掉这种粒度差; 再把通信与计算融合进同一个 kernel, 用线程块特化把两者隔开, 并按负载动态分配各自的线程块数. 论文报告单个 MoE 层加速 1.96 倍, 端到端平均 1.71 倍, 并已在万卡规模的生产集群上使用.

Flux ([Chang et al., 2024](https://arxiv.org/abs/2406.06858)) 处理的是 TP 那一侧的 AllReduce 和 AllGather. 它把通信和依赖它的 GEMM 拆成更细的操作, 再融合进一个更大的 kernel, 在 GEMM 的 tile 粒度上边算边通信. 论文称融合 kernel 最多能掩盖 96% 的通信, 训练相对 Megatron-LM 在 128 卡上最多加速 1.24 倍, 推理相对 vLLM 在 8 卡上 prefill 与 decode 分别最多加速 1.66 倍和 1.30 倍. 同一团队的 Triton-distributed ([Zheng et al., 2025](https://arxiv.org/abs/2504.19442)) 把这类重叠 kernel 的编写搬到 Triton 编译器里, 用通信原语加计算原语描述分布式 kernel. 注意力 TP 的通信交给 Flux 一类方法, 专家侧的 All-to-All 交给 DeepEP 和 Comet 一类方法, 两者作用在一层的不同位置, 可以同时使用.

**参考文献**

1. Lepikhin, D., et al. (2020). [GShard: Scaling Giant Models with Conditional Computation and Automatic Sharding](https://arxiv.org/abs/2006.16668).
2. Fedus, W., Zoph, B., & Shazeer, N. (2021). [Switch Transformers: Scaling to Trillion Parameter Models with Simple and Efficient Sparsity](https://arxiv.org/abs/2101.03961). 第 5 节.
3. Hwang, C., et al. (2023). [Tutel: Adaptive Mixture-of-Experts at Scale](https://arxiv.org/abs/2206.03382). MLSys 2023. 附录 A 2DH All-to-All.
4. DeepSeek-AI. (2024). [DeepSeek-V2: A Strong, Economical, and Efficient Mixture-of-Experts Language Model](https://arxiv.org/abs/2405.04434). §3.1.3.
5. DeepSeek-AI. (2024). [DeepSeek-V3 Technical Report](https://arxiv.org/abs/2412.19437). §3.2, §3.3, §3.5.1, Table 2.
6. DeepSeek. [DeepEP](https://github.com/deepseek-ai/DeepEP). README: `EPBuffer`, 异步 dispatch / combine, FP8 dispatch.
7. Zhang, S., et al. (2025). [Comet: Fine-grained Computation-communication Overlapping for Mixture-of-Experts](https://arxiv.org/abs/2502.19811).
8. Chang, L.-W., et al. (2024). [FLUX: Fast Software-based Communication Overlap On GPUs Through Kernel Fusion](https://arxiv.org/abs/2406.06858).
9. Zheng, S., et al. (2025). [Triton-distributed: Programming Overlapping Kernels on Distributed AI Systems with the Triton Compiler](https://arxiv.org/abs/2504.19442).
10. Rajbhandari, S., Rasley, J., Ruwase, O., & He, Y. (2020). [ZeRO: Memory Optimizations Toward Training Trillion Parameter Models](https://arxiv.org/abs/1910.02054). SC20.
11. Patarasuk, P., & Yuan, X. (2009). [Bandwidth Optimal All-reduce Algorithms for Clusters of Workstations](https://doi.org/10.1016/j.jpdc.2008.09.002). *Journal of Parallel and Distributed Computing*, 69(2).
12. Moonshot AI. (2026). [Kimi K3 Technical Report](https://arxiv.org/abs/2607.24653). 推理 kernel 一节.
13. Elango, V., et al. (2026). [LatentMoE](https://arxiv.org/abs/2601.18089).
