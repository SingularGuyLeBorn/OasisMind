---
title: "06 · Triton 分块实现：在线 softmax 与内核骨架"
date: 2026-08-30
tags: [FlashAttention, Triton, Online Softmax, Tiling, GPU Kernel]
as_of: 2026-09-01
---

# 06 · Triton 分块实现：在线 softmax 与内核骨架

Triton 官方 fused-attention 教程给出了一种 FlashAttention-2 风格的程序映射：每个 program 持有一个 Query 行块，内循环依次扫描 Key/Value 列块，在线更新行最大值、归一化量与输出累加器。它适合用来理解分块数据流和 Triton 语义；生产内核还会加入自动调优、架构专用加载、Warp 专门化、变长序列和更多掩码分支。

## 1. 一个 program 负责一个 Query 行块

设 `BLOCK_M` 为 Query 行块高度，`BLOCK_N` 为 Key/Value 列块宽度。program id 先确定 $Q_i$ 的起始行，载入一次 $Q_i$，然后执行

$$
\text{for }j=0,\ldots,\left\lceil N/\texttt{BLOCK\_N}\right\rceil-1
$$

依次载入 $K_j,V_j$。循环期间需要长期保存的状态只有

$$
m_i\in\mathbb R^{B_M},\qquad
\ell_i\in\mathbb R^{B_M},\qquad
\widetilde O_i\in\mathbb R^{B_M\times d}.
$$

其中 $m_i$ 是运行最大值，$\ell_i$ 是指数和，$\widetilde O_i$ 是未归一化输出。局部分数块 $S_{ij}=Q_iK_j^\top$ 在当前迭代内产生并消费，不写入 HBM。

![Triton program 的 Query tile、Key/Value 内循环与在线 softmax 状态](./images/fig-fa-triton-tile-online-softmax.png)

> 图 1：一个 program 载入一次 Query 行块，在内循环中扫描 Key/Value 列块；在线 softmax 状态保留在片上，结束后写回一次输出。

这种 Q 外层、KV 内循环的映射对应 [FlashAttention-2](./03-FlashAttention-v2.md) 的前向工作划分。[FlashAttention-1](./02-FlashAttention-v1.md) 论文 Algorithm 1 使用相反的 KV 外层、Q 内层顺序。

## 2. 因果前向的教学骨架

下面保留算法主线，省略真实内核中的 stride、边界掩码、stage 分支和自动调优配置。它是伪代码骨架，不能直接复制运行。

```python
@triton.jit
def attention_fwd(Q, K, V, Out, LSE, n_ctx, scale,
                  BLOCK_M: tl.constexpr,
                  BLOCK_N: tl.constexpr,
                  HEAD_DIM: tl.constexpr):
    block_m = tl.program_id(0)
    rows = block_m * BLOCK_M + tl.arange(0, BLOCK_M)
    cols = tl.arange(0, BLOCK_N)
    dims = tl.arange(0, HEAD_DIM)

    q = tl.load(...)                         # [BLOCK_M, HEAD_DIM]
    m_i = tl.full([BLOCK_M], -float("inf"), tl.float32)
    l_i = tl.zeros([BLOCK_M], tl.float32)
    acc = tl.zeros([BLOCK_M, HEAD_DIM], tl.float32)

    end_n = min(n_ctx, (block_m + 1) * BLOCK_M)
    for start_n in range(0, end_n, BLOCK_N):
        k = tl.load(...)                     # [BLOCK_N, HEAD_DIM]
        v = tl.load(...)                     # [BLOCK_N, HEAD_DIM]

        scores = tl.dot(q, tl.trans(k)) * scale
        causal = rows[:, None] >= start_n + cols[None, :]
        scores = tl.where(causal, scores, -float("inf"))

        block_max = tl.max(scores, axis=1)
        m_next = tl.maximum(m_i, block_max)
        alpha = tl.exp(m_i - m_next)
        p = tl.exp(scores - m_next[:, None])

        l_i = alpha * l_i + tl.sum(p, axis=1)
        acc = alpha[:, None] * acc + tl.dot(p.to(q.dtype), v)
        m_i = m_next

    tl.store(..., acc / l_i[:, None])
    tl.store(..., m_i + tl.log(l_i))
```

更新式与在线 softmax 完全对应：

$$
\begin{aligned}
m_i'&=\max\!\left(m_i,\operatorname{rowmax}(S_{ij})\right),\\
\alpha_i&=e^{m_i-m_i'},\\
\ell_i'&=\alpha_i\ell_i+\operatorname{rowsum}\!\left(e^{S_{ij}-m_i'}\right),\\
\widetilde O_i'&=\alpha_i\widetilde O_i+e^{S_{ij}-m_i'}V_j.
\end{aligned}
$$

最后的 `LSE = m_i + log(l_i)` 供反向重算 softmax 概率。因果内核还会跳过 Query 块右侧的 Key/Value 块；对角块内部再用逐元素因果掩码处理。

## 3. Triton 语义如何映射到硬件

`tl.load` 描述从指针或 tensor descriptor 读取 tile。普通指针式 `tl.load` 不等于自动使用 TMA；Hopper 上的 TMA 路径需要编译器、目标后端以及相应的 tensor descriptor 或 Warp 专门化实现共同支持。

`tl.dot` 表达块矩阵乘。它可能在 Ampere 上降到 `mma.sync`，也可能在 Hopper 上使用 WGMMA，具体取决于 Triton 版本、GPU 目标、数据类型、tile 形状、`num_warps`、`num_stages` 和编译配置。源码层的一个 `tl.dot` 不能保证某条固定的 PTX 指令。

`tl.where` 把因果条件应用到分数块。编译器通常会用谓词和选择指令实现，但最终是否产生分支、如何合并掩码访问，仍要查看生成的 PTX/SASS。

同理，`tl.exp` 表达指数语义，不会因为目标是 Blackwell 就必然采用 [FlashAttention-4](./05-FlashAttention-v4.md) 的“部分 MUFU、部分 FMA 多项式”方案。FlashAttention-4 的正式实现使用 CuTe-DSL，并显式组织指数双路径、TMEM 与 2-CTA MMA。

## 4. tile 与编译参数的取舍

增大 `BLOCK_M` 或 `BLOCK_N` 可以减少循环次数，并让矩阵乘 tile 更饱满，但会增加分数块、输出累加器和流水中间量的寄存器占用。寄存器不足时会发生 spill，过大的共享内存需求也会减少每个 SM 可驻留的线程块数。

`num_warps` 决定一个 program 使用多少 Warp，`num_stages` 控制软件流水深度。更深的流水能覆盖更多加载延迟，也会同时保存更多 tile。合适配置依赖 GPU 架构、head dimension、序列长度、因果掩码和数据类型，因此生产实现通常准备多组配置并自动调优。

这份骨架只解释前向主循环。变长 batch、MQA/GQA、dropout、窗口注意力、反向重算和持久化调度会改变 program grid、掩码与规约方式，应以官方教程和目标版本源码为准。

## 参考资料

- Philippe Tillet, H. T. Kung, David Cox. [Triton: An Intermediate Language and Compiler for Tiled Neural Network Computations](https://dl.acm.org/doi/10.1145/3315508.3329973), 2019.
- Triton Project. [Fused Attention Tutorial](https://triton-lang.org/main/getting-started/tutorials/06-fused-attention.html), 核验于 2026-09-01.
- Dao AI Lab. [flash-attention 官方仓库](https://github.com/Dao-AILab/flash-attention), GitHub.
- Tri Dao. [FlashAttention-2: Faster Attention with Better Parallelism and Work Partitioning](https://arxiv.org/abs/2307.08691), 2023.
