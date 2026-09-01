---
title: "01 · FlashAttention：从注意力物化到 I/O 感知"
date: 2026-08-30
tags: [FlashAttention, GPU, SRAM, HBM, Roofline, I/O Complexity]
as_of: 2026-09-01
---

# 01 · FlashAttention：从注意力物化到 I/O 感知

FlashAttention 保留精确注意力

$$
O=\operatorname{softmax}\!\left(\frac{QK^\top}{\sqrt d}\right)V
$$

的数学定义，改变的是计算顺序和数据在 GPU 存储层级之间的移动方式。核心做法是把分数矩阵分块，在片上存储中完成局部矩阵乘、在线 Softmax 和输出累加，不把完整的 $N\times N$ 分数矩阵与概率矩阵写入 HBM。

## 1. 标准实现会搬运多少数据

设批量大小为 $B$，注意力头数为 $H$，序列长度为 $N$，每头维度为 $d$，每个元素占 $s$ 字节。先考察一种容易复算的前向实现：

1. 计算 $S=QK^\top/\sqrt d$，把 $S$ 写入 HBM；
2. 从 HBM 读取 $S$，计算 $P=\operatorname{softmax}(S)$，再把 $P$ 写回 HBM；
3. 从 HBM 读取 $P$ 与 $V$，计算并写出 $O=PV$。

下面的账本采用较有利于基线的理想假设：稠密、非因果、自注意力前向；$Q,K,V,O,S,P$ 使用同一数据类型；Softmax 对 $S$ 只做一次完整读取并写出新的 $P$；忽略掩码、偏置、dropout、分配器工作区、缓存命中和矩阵乘内部的 tile 重读。它给出的是张量级的最低搬运量，不是某个具体内核的性能计数器结果。

| 阶段 | HBM 读取 | HBM 写入 | 元素数 |
|---|---|---|---:|
| $QK^\top$ | $Q,K$ | $S$ | $2BHNd+BHN^2$ |
| Softmax | $S$ | $P$ | $2BHN^2$ |
| $PV$ | $P,V$ | $O$ | $BHN^2+2BHNd$ |

因此，完整前向至少搬运

$$
T_{\mathrm{sep}}
=sBH\left(4N^2+4Nd\right)\quad\text{bytes}. \tag{1}
$$

其中，与 $S,P$ 物化有关的二次项是 $4sBHN^2$；$Q,K,V,O$ 各一次读写所对应的线性项合计为 $4sBHNd$。四个线性张量自身的总大小为

$$
V_{QKVO}=4sBHNd. \tag{2}
$$

两者之比为

$$
\frac{T_{\mathrm{sep}}}{V_{QKVO}}=\frac{N}{d}+1. \tag{3}
$$

以 $B=1,H=32,N=8192,d=128,s=2$ 的 BF16/FP16 前向为例：

- $Q,K,V,O$ 合计 $268{,}435{,}456$ 字节，即 $256\ \mathrm{MiB}$；
- $S,P$ 的写入与读取合计 $17{,}179{,}869{,}184$ 字节，即 $16\ \mathrm{GiB}$；
- 式 (1) 的总量为 $16.25\ \mathrm{GiB}$，是式 (2) 的 $65$ 倍。

这组数只描述上述分离实现的理想张量流量。实际内核若用多遍 Softmax、生成掩码或发生额外 tile 重读，流量会更高；若已采用融合或重计算，流量则不能再按式 (1) 计算。

## 2. 算术强度与 Roofline 位置

若一次乘加按 2 FLOP 计，忽略 Softmax 的标量运算，则两次矩阵乘的主要计算量约为

$$
F\approx 4BHN^2d. \tag{4}
$$

结合式 (1)，分离实现的理想算术强度为

$$
I_{\mathrm{sep}}
=\frac{F}{T_{\mathrm{sep}}}
=\frac{Nd}{s(N+d)}
\xrightarrow[N\gg d]{}\frac{d}{s}
\quad\text{FLOP/byte}. \tag{5}
$$

前面的例子得到 $I_{\mathrm{sep}}\approx63.0\ \mathrm{FLOP/byte}$。NVIDIA A100 80GB 数据表给出的密集 BF16/FP16 Tensor Core 峰值为 $312\ \mathrm{TFLOP/s}$，HBM2e 峰值带宽为 $2039\ \mathrm{GB/s}$，两者之比约为

$$
I_{\mathrm{ridge}}\approx
\frac{312\times10^{12}}{2039\times10^9}
=153\ \mathrm{FLOP/byte}. \tag{6}
$$

在这组峰值和理想流量假设下，分离实现位于 Roofline 的带宽侧。它不意味着任意形状、任意精度的注意力都必然受 HBM 带宽限制；短序列、小批量、低占用率以及不同硬件都可能改变实际瓶颈。

![FlashAttention 论文中的 A100 存储层次、分块循环与 GPT-2 运行时间](./images/fig-flashattention-gpu-memory-hierarchy.jpg)

> 图 1：FlashAttention v1 论文图 1。图中的 A100 规格和 GPT-2 测量来自论文所用平台；算法部分显示外层遍历 $K,V$ 块、内层遍历 $Q$ 块。

## 3. FlashAttention 改变了什么

FlashAttention 把 $Q,K,V$ 切成能够进入片上存储的块。一个分数块 $S_{ij}=Q_iK_j^\top$ 产生后，立即参与局部 Softmax 与输出更新，随后即可丢弃。跨 $K,V$ 块的行最大值、归一化分母和输出累加器通过在线 Softmax 递推，因此不需要在 HBM 中保存完整 $S$ 或 $P$。

这里有两个容易混淆的层次：

- “不物化 $N\times N$ 矩阵”描述峰值中间存储；
- “减少 HBM 访问”描述同一数据被片上复用的次数。

v1 论文的 Algorithm 1 以 $K,V$ 块为外层循环。每处理一个 $K,V$ 块，都要逐个从 HBM 读入 $Q_i,O_i,m_i,\ell_i$，更新后再把 $O_i,m_i,\ell_i$ 写回。因此，v1 不是“所有输入只读一次、输出只写一次”；它通过选择较大的 $K,V$ tile，将对 $Q,O$ 的完整扫描次数从与 $N$ 同阶降到约 $Nd/M$ 次。其前向 HBM 访问量在论文模型中为

$$
\Theta\!\left(\frac{N^2d^2}{M}\right),
\qquad d\le M\le Nd, \tag{7}
$$

其中 $M$ 是片上 SRAM 可容纳的元素数。标准分离实现则为 $\Theta(N^2+Nd)$ 次元素访问。Algorithm 1、在线 Softmax、反向重计算与这个界的推导见 [FlashAttention v1](./02-FlashAttention-v1.md)。

早于 FlashAttention 的 [Memory-Efficient Attention](../00-Memory-Efficient-Attention/01-MEA-显存高效注意力.md)（[Rabe & Staats, 2021](https://arxiv.org/abs/2112.05682)）也能精确计算注意力而不保存完整概率矩阵；FlashAttention v1 的重点是面向 GPU 存储层次分析并减少 HBM–SRAM I/O。

## 4. v1–v4 阅读路径

各代文章分别处理不同硬件和并行组织问题，不能只用版本号推断同一内核在所有设备上的支持范围。

| 版本 | 主要技术问题 | 专题 |
|---|---|---|
| v1 | 分块、在线 Softmax、I/O 复杂度与反向重计算 | [02 · FlashAttention v1](./02-FlashAttention-v1.md) |
| v2 | 更好的序列维并行与 warp 工作划分，减少非矩阵乘开销 | [03 · FlashAttention v2](./03-FlashAttention-v2.md) |
| v3 | 面向 Hopper 的异步流水、WGMMA/TMA 与低精度路径 | [04 · FlashAttention v3](./04-FlashAttention-v3.md) |
| v4 | 面向 Blackwell 的非对称硬件与更深流水调度 | [05 · FlashAttention v4](./05-FlashAttention-v4.md) |
| Triton | 用 Triton 表达分块、掩码和在线归一化的实现方法 | [06 · Triton 实现](./06-FlashAttention-Triton实现.md) |

FlashAttention 的主要收益是避免二次中间张量驻留 HBM，并降低数据移动；时间复杂度仍为 $O(N^2d)$。论文中的具体加速比依赖序列长度、头维度、批量、数据类型、GPU 和基线实现，不能脱离实验协议当作固定常数。

## 参考资料

- Tri Dao et al., [FlashAttention: Fast and Memory-Efficient Exact Attention with IO-Awareness](https://arxiv.org/abs/2205.14135), NeurIPS 2022.
- Markus N. Rabe and Charles Staats, [Self-attention Does Not Need $O(n^2)$ Memory](https://arxiv.org/abs/2112.05682), 2021.
- Dao-AILab, [FlashAttention 官方仓库](https://github.com/Dao-AILab/flash-attention).
- NVIDIA, [A100 Tensor Core GPU Data Sheet](https://www.nvidia.com/content/dam/en-zz/Solutions/Data-Center/a100/pdf/a100-80gb-datasheet-update-a4-nvidia-1485612-r12-web.pdf).
- Tri Dao, [FlashAttention-2: Faster Attention with Better Parallelism and Work Partitioning](https://arxiv.org/abs/2307.08691), ICLR 2024.
- Jay Shah et al., [FlashAttention-3: Fast and Accurate Attention with Asynchrony and Low-precision](https://arxiv.org/abs/2407.08608), NeurIPS 2024.
- Ted Zadouri et al., [FlashAttention-4: Algorithm and Kernel Pipelining Co-Design for Asymmetric Hardware Scaling](https://arxiv.org/abs/2603.05451), 2026.
