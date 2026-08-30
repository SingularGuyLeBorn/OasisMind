---
title: "03 · FlashAttention-v2 执行优化: 循环交换与 Warp 调度"
date: 2026-08-30
tags: [FlashAttention-v2, Loop Interchange, Register-level Fusion, Warp Scheduling, CUDA]
as_of: 2026-08-30
---

# 03 · FlashAttention-v2 执行优化: 循环交换与 Warp 调度

FlashAttention-2 不改注意力公式，改的是 **循环嵌套与 Warp 分工**（Dao, 2023, [arXiv:2307.08691](https://arxiv.org/abs/2307.08691)）：外层改到 $Q$ 行块、内层扫 $K,V$，$O_i$ 只在内循环结束写回一次；每个 Warp 独占若干 $Q$ 行，中间 $m,d,O$ 停在寄存器。相对 v1 的增益来自 work partitioning，不是换一套 softmax。不要写无出处的「访存延迟暴跌 60%」。

## 1. 嵌套循环顺序交换的物理直觉 (Nested Loop Interchange)

尽管 FlashAttention-v1 成功将 I/O 复杂度降低到了 $O(N^2 d^2 / M)$, 但在面对超长序列训练时, 其底层的指令流水线依然隐藏着巨大的片上访存开销. 

v1 论文 Algorithm 1 的嵌套顺序是:
- **外循环**: 遍历 Key/Value 的列块 ($j = 1 \dots T_c$, $T_c = N / B_c$).
- **内循环**: 遍历 Query 的行块 ($i = 1 \dots T_r$, $T_r = N / B_r$).

### 1.1 V1 循环顺序的写回代价
外循环锁定一块 $K_j,V_j$ 时，内循环要把各个 $Q_i$ 轮流载入，算完半成品 $O_i,m_i,\ell_i$ 再写回 HBM，下一列块再读回来。$O$ 本身只有 $N\times d$，不是 $N\times N$，但「每个 KV tile × 每个 Q tile 都写一次」在长序列上仍然贵。并行当时只开在 batch × 头数上，长序列、小 batch 时 SM occupancy 不够。

### 1.2 V2 把外循环改到 Q 行 (The Loop Swap)

论文 §3.2 写明：外循环改到行块、内循环改到列块（与 v1 论文相反）；这条顺序以及沿序列维并行，最早见于 Tillet 的 Triton fused-attention。

```
+-------------------------------------------------------------+
|  FlashAttention-v1 (论文 Algorithm 1):                      |
|  For j = 1 ... Tc (Outer: Key/Value 列块)                   |
|      For i = 1 ... Tr (Inner: Query 行块)                   |
|          Load Qi, Oi, mi, ℓi → 每步写回 HBM                 |
+-------------------------------------------------------------+
                              | (外循环改到 Q 行)
+-------------------------------------------------------------+
|  FlashAttention-v2:                                         |
|  For i = 1 ... Tr (Outer: Query 行块；threadblock 独占 Qi)  |
|      For j = 1 ... Tc (Inner: Key/Value)                    |
|          内循环结束才写回 Oi 一次                            |
+-------------------------------------------------------------+
```

v2 一个 thread block 独占 $Q_i$，内循环把 $K_j,V_j$ 扫完，$O_i$ 只写一次；同时还沿 $Q$ 的序列维并行，提高长序列 occupancy。Warp 级从 split-K 改成按 $Q$ 行划分，见 §3。加速来自写回次数与划分，不是改 softmax 公式。

![FA-1 外循环扫 KV、每步写回 O；FA-2 外循环改到 Q 行、O 写一次，Warp 按行划分](./images/fig-fa-v2-mech-work-partition.png)

> 图 1：左为 v1 论文 Algorithm 1（外 $K/V$、内 $Q$，半成品 $O_i$ 高频写回）；右为 v2（外循环改到 $Q$ 行，内循环扫完 $K,V$ 才写一次 $O_i$；Warp 按 $Q$ 行划分、不再 split-K）。同一套 online softmax，不要写无出处的「访存延迟暴跌 60%」。论文 Dao, 2023, [arXiv:2307.08691](https://arxiv.org/abs/2307.08691)。

**图 1 解析**

- **左栏 FA-1**：外循环 $j$ 扫 KV 列块，内循环 $i$ 扫 Q 行块；每步把 $O_i,m_i,\ell_i$ 写回 HBM。
- **右栏 FA-2**：外循环改到 $Q$ 行，一个 threadblock 独占 $Q_i$；内循环扫 $K_j,V_j$，结束才写 $O_i$。
- **Warp**：FA-1 四 Warp 切 K/V（split-K）要进 SMEM 规约；FA-2 按 $Q$ 行静态划分，K/V 只读共享，无 inter-warp barrier。
- **Occupancy**：v2 还沿 $Q$ 序列维并行，长序列、小 batch 时能喂满 SM。
- **不变的**：online softmax 与 v1 同一套数学；加速来自划分与写回，不是新公式。
- **不要编数字**：文中不写无出处的「访存延迟暴跌 60%」。论文加速比见下文图 3 的 jpg（论文 Figure 4），不手绘假坐标。
- **和论文 Figure 2 的关系**：论文图是 worker 按行/列分块的示意；本图补循环嵌套与 Warp 切法。

---

## 2. 非 Matmul 标度算子在寄存器端的融合与消除 (Scale Fusion)

在 GPU 硬件加速器中, 真正能跑满理论峰值算力的只有执行矩阵乘加 (GEMM) 运算的 Tensor Core. 所有的非矩阵乘(如 Softmax 缩放因子相乘, 指数 exp 变换, 除法归一化等)都必须由常规的普通流处理器 (Cuda Core, 即 SFU 单元) 执行.

### 2.1 标度延迟融合 (Delayed Scaling)
在标准自注意力中, 我们需要在矩阵乘 $Q K^T$ 之后, 对生成的 $N \times N$ 元素逐个乘以一个标度因子 $1 / \sqrt{D_{head}}$.
在 FlashAttention-v1 中, 这一缩放操作是在计算出分块分数矩阵后, 在内循环中通过逐元素相乘完成的. 这不仅占用片上寄存器, 还会因频繁调用乘法算子而打断 Tensor Core 矩阵乘指令的并行度.

FlashAttention-v2 引入了**标度延迟融合 (Delayed Scaling)**: 

$$
\tilde{Q} = \frac{1}{\sqrt{D_{head}}} \cdot Q \tag{1}
$$

**我们将原本需要作用于中间分数矩阵的标度运算, 通过代数等价交换, 提前在外部直接作用于输入矩阵 $Q$！因为 $Q$ 的维度是 $N \times D_{head}$, 其大小远远小于 $N \times N$ 的分数矩阵, 这一简单的等价变换, 直接消除了高达 $O(N^2)$ 次的逐元素乘法操作, 将其压缩到了极限的 $O(ND_{head})$ 次寄存器变换. **

### 2.2 寄存器级累加标度融合 (Register Scale Fusion)
在流式 Online Softmax 递推更新中, 每次合并不同的分块时都需要乘以指数补偿因子 $exp(m_i^{(old)} - m_i)$.
在底层的 CUDA 汇编层面, FlashAttention-v2 通过 **Fused Multiply-Add (FMA)** 指令, 将这一指数乘法与局部输出矩阵 $O_i$ 的标度更新完美融合进了单条寄存器指令周期内：

$$
d_i \leftarrow d_i \cdot exp\left(m_i^{(old)} - m_i\right) + d_i^{(new)} \tag{2}
$$

$$
O_i \leftarrow O_i \cdot \left[exp\left(m_i^{(old)} - m_i\right)\right] + \tilde{O}_i^{(new)} \tag{3}
$$

公式 (2) 和 (3) 的底层操作在更新时, 寄存器指针不需要发生任何抖动, 指令完全在原位寄存器内被无缝消费, 最大化规避了寄存器溢出 (Register Spilling) 带来的显存交换开销.

---

## 3. Warp 级行划分与零 Shared Memory Barrier 调度 (Warp-Level Scheduling)

在 NVIDIA GPU SIMT 并行计算框架中, 线程是被划分为以 32 个线程为物理单元的 **Warp (线程束)** 进行调度的. Warp 之间的协作与同步开销直接决定了算子的并发吞吐率.

### 3.1 V1 的协作缺陷：Warp 频繁同步
在 FlashAttention-v1 中, 为了计算行级的 Softmax 归一化, 一个 Thread Block 内部的多个 Warp 采用协同模式：不同 Warp 合作计算同一行注意力分数, 然后通过 Shared Memory 进行规约 (Reduction) 求和与最大值同步. 
这导致在每一个内循环周期内, 所有的 Warp 必须高频调用 `__syncthreads()` 执行物理栅栏同步 (Barrier). 这会导致所有的线程挂起等待最慢的那个 Warp, 严重破坏了 GPU 硬件的指令派发流水线.

### 3.2 V2 的 Warp 行级静态独占重构 (Row-wise Partition)
为了消灭这一毁灭能效的同步屏障, FlashAttention-v2 实施了彻底的 **Warp 级行独占重构 (Row-wise Partition)**：

```
+---------------------------------------------------------------+
|  FlashAttention-v1 (Warp 协同模式):                             |
|  Warp 0 + Warp 1 + Warp 2 -> 协同计算 Row 0 -> 频繁 SM Sync    |
+---------------------------------------------------------------+
                               | (彻底消除 Warp 同步)
+---------------------------------------------------------------+
|  FlashAttention-v2 (Warp 行独占):                             |
|  Warp 0 -> 独立计算 Row 0, Row 1 (寄存器独占, 0 SM Sync)       |
|  Warp 1 -> 独立计算 Row 2, Row 3 (寄存器独占, 0 SM Sync)       |
+---------------------------------------------------------------+
```

在 v2 的全新并行映射空间中：
1. 我们将 Thread Block 加载进片上的整个 $Q$ 分块, 按照行维度**静态、绝对独占地**平分给内部的各个 Warp. 例如, Warp 0 独占第 $0 \dots 15$ 行, Warp 1 独占第 $16 \dots 31$ 行.
2. 在整个自注意力的递推周期中, **Warp 0 独立且完整地负责其所分配行数的所有点积、在线 Softmax 累加与加权求和更新. 所有的中间状态 $m_i$ 和 $d_i$ 物理驻留在该 Warp 内部各线程私有的寄存器中. **
3. 只有在外循环完全结束、生成最终完整 $O_i$ 时, Warp 0 才通过单次寻址将其一次性写回 HBM.

这一机制的达成, 带来了质的飞跃：
由于各个 Warp 独占其负责行的全部计算流程, 它们在计算过程中**不需要与任何其他 Warp 进行任何数据交互, 因而达到了完全的“零片上 Shared Memory Barrier”状态！** 各个 Warp 可以以脱缰野马般的最高速度在 GPU 流处理器内并行奔跑, 算子的整体执行能效实现了超乎想象的飞跃.

![FlashAttention-2 工作划分与并行结构（论文 Figure 2）](./images/fig-flashattention2-parallel-diagram.jpg)

> 图 2: FA-2 前向/反向的线程块工作划分（论文 Figure 2）。前向每个 worker 负责注意力矩阵的一块**行**（$Q$）；反向按列块划分。

**图 2 解析**

- **前向按 Q 行划分 worker**：与上文图 1 右栏一致——外循环在 $Q$ 行上并行，不是外循环锁 $K/V$。
- **Forward / Backward 分面板**：反向需重算或缓存 softmax 统计量 $m,d$；v2 在反向按列块并行，避免全矩阵落盘。
- **Warp 级分工**：每个 Warp 负责 $Q$ 的若干行，中间 $O,m,d$ 驻留寄存器 — 对应正文 §3 的「零 Shared Memory Barrier」。

![FlashAttention-2 在 A100 上的加速比（论文 Figure 4）](./images/fig-flashattention2-speedup.jpg)

> 图 3: A100 上 FA-2 相对 FA-1 与标准 attention 的端到端加速比，随序列长度变化（论文 Figure 4）。

**图 3 解析**

- 横轴为序列长度；纵轴为相对 PyTorch 标准 attention 的 speedup。
- **因果 mask / head dim** 不同子图（论文 (a)(b)(c)）对应不同部署场景 — decode 常用 causal + 小 batch。
- v2 相对 v1 的额外增益来自 **work partitioning**，而非改公式 — 与 MoBA/NSA 等「改稀疏图」的路线正交，可叠加。

---

## 4. 参考文献 (References)

- Dao, T. (2023). "FlashAttention-2: Faster attention with better parallelism and work partitioning." arXiv preprint arXiv:2307.08691.
- NVIDIA Corporation. (2021). "NVIDIA Ampere Architecture Tuning Guide."
