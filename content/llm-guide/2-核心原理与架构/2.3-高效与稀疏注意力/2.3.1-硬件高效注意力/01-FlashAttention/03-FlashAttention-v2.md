---
title: "03 · FlashAttention-2：并行划分与工作量优化"
date: 2026-08-30
tags: [FlashAttention-2, Online Softmax, Loop Interchange, Work Partitioning, CUDA]
as_of: 2026-09-01
---

# 03 · FlashAttention-2：并行划分与工作量优化

[FlashAttention-1](./02-FlashAttention-v1.md) 用分块与在线 softmax 避免物化 $N\times N$ 注意力矩阵，但第一版 CUDA 核仍有三类开销：输出块及 softmax 统计量会被反复读写，线程块数量受 batch 与注意力头数限制，Warp 之间还需要借助共享内存交换中间结果。FlashAttention-2 保留精确注意力和相同的分块思想，重新安排循环、线程块与 Warp 的职责，并减少 softmax 递推中的非矩阵乘运算。

## 1. 从 KV 外循环改为 Q 外循环

设序列长度为 $N$，每个 Query 行块含 $B_r$ 行，每个 Key/Value 列块含 $B_c$ 行，块数分别为 $T_r=\lceil N/B_r\rceil$ 和 $T_c=\lceil N/B_c\rceil$。FlashAttention-1 前向算法的循环顺序是：

$$
\text{for }j=1,\ldots,T_c\quad
  \text{for }i=1,\ldots,T_r.
$$

外层固定 $K_j,V_j$，内层依次处理所有 $Q_i$。每次访问 $(i,j)$ 都要从 HBM 读入 $O_i,m_i,\ell_i$，合并当前列块后再写回；下一轮 $j$ 又会读取这些中间状态。

FlashAttention-2 交换两层循环：

$$
\text{for }i=1,\ldots,T_r\quad
  \text{for }j=1,\ldots,T_c.
$$

一个线程块负责一个 $Q_i$，在片上依次扫描全部 $K_j,V_j$。$O_i$ 与统计量在内循环期间保留在寄存器中，扫描结束后只写回一次。这样既减少了中间状态的 HBM 流量，也把 $Q$ 的行块加入并行网格：前向可同时调度约 $B\times H\times T_r$ 个线程块，长序列、小 batch 时更容易占满流式多处理器。

![FlashAttention-1 与 FlashAttention-2 的循环和 Warp 划分](./images/fig-fa-v2-mech-work-partition.png)

> 图 1：FlashAttention-2 让一个线程块持有一个 Query 行块，扫描全部 Key/Value 列块后再写回输出；Warp 也改为按 Query 行分工。

循环交换没有改变注意力的计算图。每个 $Q_i$ 仍会与所有允许访问的 $K_j,V_j$ 交互，因果掩码也仍按相同规则生效。

## 2. 在线 softmax 保留未归一化累加量

处理第 $j$ 个列块时，先计算分数块

$$
S_{ij}=Q_iK_j^\top/\sqrt d.
$$

记进入该轮前的行最大值、指数和与未归一化输出为 $m^{(j-1)}$、$\ell^{(j-1)}$、$\widetilde O^{(j-1)}$。当前块的行最大值为

$$
r^{(j)}=\operatorname{rowmax}(S_{ij}),
$$

合并后的最大值为

$$
m^{(j)}=\max\!\left(m^{(j-1)},r^{(j)}\right).
$$

令

$$
P^{(j)}=\exp\!\left(S_{ij}-m^{(j)}\right),\qquad
\alpha^{(j)}=\exp\!\left(m^{(j-1)}-m^{(j)}\right),
$$

则递推为

$$
\ell^{(j)}=\alpha^{(j)}\ell^{(j-1)}+\operatorname{rowsum}\!\left(P^{(j)}\right),
$$

$$
\widetilde O^{(j)}=\alpha^{(j)}\widetilde O^{(j-1)}+P^{(j)}V_j.
$$

所有列块处理完后只做一次归一化：

$$
O_i=\operatorname{diag}\!\left(\ell^{(T_c)}\right)^{-1}\widetilde O^{(T_c)}.
$$

第一版实现会在每轮维护已归一化的输出，因此更新旧输出时还要引入旧、新归一化因子的比值。第二版保留未归一化的 $\widetilde O$，把除法推迟到内循环末尾，减少逐元素缩放与除法。对因果注意力，完全位于因果边界之外的块直接跳过，也避免在已知为零的区域执行运算。

这组变换仍计算精确 softmax；浮点舍入顺序会因分块而变化，但没有引入稀疏近似或低秩近似。

## 3. Warp 按 Query 行分工

FlashAttention-1 在一个线程块内把 $K,V$ 分给多个 Warp。各 Warp 共同处理同一批 Query 行，需要把部分结果写入共享内存，再进行规约与同步。共享内存流量不会写到 HBM，但会占用片上带宽并形成同步点。

FlashAttention-2 把 $Q_i$ 的行分给不同 Warp，而 $K_j,V_j$ 作为只读数据供这些 Warp 使用。每个 Warp 独立维护自己负责行的 $m$、$\ell$ 和 $\widetilde O$，因此不再需要为不同 Warp 产生的部分输出做跨 Warp 求和。它减少的是共享内存读写和跨 Warp 同步，并不意味着整个内核没有屏障：块级装载、流水化和阶段切换仍可能需要同步原语。

这种划分还把矩阵乘的操作数分配得更均匀。论文说明了多查询注意力（MQA）与分组查询注意力（GQA）的映射，实验主要覆盖 head dimension 64 和 128；当前官方 CUDA 实现另支持到 head dimension 256。多个 Query 头共享 Key/Value 头时，调度仍需按实际头映射读取对应的 $K,V$。

## 4. 反向传播的并行划分

反向传播需要计算 $dQ,dK,dV$，但仍不保存完整的注意力矩阵。内核从前向保存的 log-sum-exp 统计量恢复每个分块的 softmax 概率，再计算局部梯度。

前向适合按 Query 行块并行，因为每个输出行可独立完成；反向则要同时累加 Query 与 Key/Value 两侧的梯度。FlashAttention-2 按注意力矩阵的列块分配反向工作，使一个线程块能在扫描 Query 行块时积累对应的 $dK_j,dV_j$，并用适当的规约或原子累加合并 $dQ$ 的分块贡献。这样无需把 $N\times N$ 的概率或梯度矩阵写入 HBM。

重计算会增加矩阵乘次数，却省去更昂贵的二次规模中间张量读写。序列越长，二者的交换通常越有利；短序列、很小的 head dimension 或启动开销占主导时，收益需要实测。

## 5. 性能结果与适用边界

论文在 A100 上的注意力微基准中，FlashAttention-2 相对 FlashAttention-1 约为 1.7–3.0 倍，摘要把整体提升概括为约 2 倍；内核达到 A100 理论峰值的 50%–73%，端到端 GPT 风格模型训练最高约为每张 A100 225 TFLOPs/s。范围随序列长度、head dimension、因果掩码和前向或反向而变，不能直接当作任意模型和 GPU 上的固定加速比。

FlashAttention-2 论文与核心设计主要围绕 Ampere 展开；当前官方 CUDA 实现的支持范围已经扩展到 Ampere、Ada 和 Hopper，要求 CUDA 12.0 以上，支持 FP16/BF16 与不超过 256 的 head dimension。Turing 使用独立的 `flash-attention-turing` 仓库，只覆盖核心功能子集。这里应区分算法的设计背景与当前软件支持矩阵。

Hopper 增加了 TMA 与异步 WGMMA，矩阵乘和 softmax 的重叠方式随之改变；[FlashAttention-3](./04-FlashAttention-v3.md) 继续处理这部分硬件流水问题。

## 参考资料

- Tri Dao. [FlashAttention-2: Faster Attention with Better Parallelism and Work Partitioning](https://arxiv.org/abs/2307.08691), 2023.
- Tri Dao. [FlashAttention-2 论文 HTML](https://arxiv.org/html/2307.08691), 2023.
- Dao AI Lab. [flash-attention 官方仓库](https://github.com/Dao-AILab/flash-attention), GitHub.
- NVIDIA. [NVIDIA Ampere GPU Architecture Tuning Guide](https://docs.nvidia.com/cuda/ampere-tuning-guide/), CUDA Documentation.
