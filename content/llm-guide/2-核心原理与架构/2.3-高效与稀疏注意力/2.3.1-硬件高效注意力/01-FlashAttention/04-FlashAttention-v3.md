---
title: "04 · FlashAttention-3：Hopper 异步流水与 FP8 注意力"
date: 2026-08-30
tags: [FlashAttention-3, Hopper, TMA, WGMMA, Warp Specialization, FP8]
as_of: 2026-09-01
---

# 04 · FlashAttention-3：Hopper 异步流水与 FP8 注意力

[FlashAttention-2](./03-FlashAttention-v2.md) 通过 Query 外循环、序列维并行与更合理的 Warp 分工提高了 Ampere 上的利用率。它在 Hopper 上仍沿用较同步的执行顺序，没有充分利用 TMA 和异步 WGMMA；论文测得 FlashAttention-2 在 H100 上约达到 35% 的理论峰值。FlashAttention-3 因而把优化重点转向三件事：用专门的 Warp 搬运数据，让矩阵乘与 softmax 重叠，以及用块量化与正交变换控制 FP8 误差。

## 1. Hopper 提供的异步执行基础

Hopper 的 Tensor Memory Accelerator（TMA）可以根据张量描述符把多维数据从全局内存异步搬到共享内存。发起传输的 Warp 不必逐元素计算地址，也不必让大量寄存器充当搬运中介。Warpgroup Matrix Multiply-Accumulate（WGMMA）则由连续四个 Warp 共同发起异步矩阵乘，并可直接读取共享内存中的操作数。

两类异步操作分别使用内存搬运单元与 Tensor Core。CUDA Core 在此期间可以执行行最大值、指数、求和和缩放等 softmax 操作。关键不只是拥有新指令，还要安排好数据依赖：消费者只能读取已完成的 TMA 槽位，生产者也不能覆盖仍在使用的槽位。

Hopper 还允许通过 `setmaxnreg` 在 Warpgroup 之间动态分配寄存器。负责发起 TMA 的生产者只需要少量寄存器，节省的配额可分给保存分数块、softmax 统计量与输出累加器的消费者。

## 2. 生产者—消费者与循环共享内存缓冲区

一个线程块仍负责一个 Query 行块 $Q_i$。线程块内部划分为生产者与消费者：

1. 生产者把 $Q_i$ 以及连续的 $K_j,V_j$ 分块载入共享内存；
2. 多级循环缓冲区保存正在装载、等待消费和已经释放的槽位；
3. 消费者等待对应槽位就绪，发起 $Q_iK_j^\top$ 与 $P_{ij}V_j$ 的 WGMMA；
4. 消费结束后释放槽位，生产者才可写入后续分块。

阶段状态由 barrier 协调。缓冲区预热后，TMA 可以装载第 $j+1$ 个分块，消费者同时计算第 $j$ 个分块；只有当搬运时间超过可重叠的计算时间，或缓冲区、共享内存容量不足时，流水线才会显式等待。

这种 Warp 专门化减少了地址计算与指令调度的相互干扰，也便于编译器把搬运和计算排入不同的异步通道。它不能消除 HBM 延迟，而是用足够的独立工作覆盖其中一部分。

## 3. 在矩阵乘之间安排 softmax

每个 Key/Value 分块都包含两个矩阵乘和一段行级计算：

$$
S_j=Q_iK_j^\top,\qquad
P_j=\operatorname{online\_softmax}(S_j),\qquad
\widetilde O_i\leftarrow\widetilde O_i+P_jV_j.
$$

直接按这三个步骤串行执行时，计算 $P_j$ 会让 Tensor Core 等待，而执行 WGMMA 时 CUDA Core 和多功能单元又可能闲置。FlashAttention-3 从两个层次重新排序。

**跨 Warpgroup 的 pingpong。** 两个消费者 Warpgroup 交替推进。一个 Warpgroup 进行 softmax 时，另一个优先发起 $QK^\top$ 或 $PV$ 的 WGMMA；下一阶段交换角色。`bar.sync` 控制两组指令的先后，使 softmax 尽量落在另一组的 Tensor Core 工作区间内。

![FlashAttention-3 的双 Warpgroup pingpong 调度](./images/fig-fa-v3-mech-pingpong.png)

> 图 1：两个消费者 Warpgroup 交替发起 WGMMA 与处理 softmax，生产者同时用 TMA 准备后续 Key/Value 分块。

**单个 Warpgroup 内的跨迭代流水。** 对第 $j$ 块做 softmax 时，异步发起第 $j+1$ 块的 $QK^\top$；对第 $j$ 块执行 $PV$ 时，继续准备后续分数块。两阶段方案需要同时保存当前与下一块的累加器。论文还实验了三阶段方案，希望同时重叠第 $j$ 块的 $PV$、第 $j+1$ 块的 softmax 和第 $j+2$ 块的 $QK^\top$，实际却慢于两阶段：编译器没有把第二次 WGMMA 与 softmax 重叠，额外中间量又迫使实现缩小 tile。流水更深只有在指令调度和寄存器容量都允许时才可能受益。

论文在固定的非因果 FP16 形状上做消融：完整流水达到 661 TFLOPs/s；移除 GEMM–softmax 流水后为 582 TFLOPs/s，移除 Warp 专门化后为 570 TFLOPs/s。这说明两种重叠都在贡献收益。

## 4. FP8 块量化与非相干处理

H100 的 FP8 Tensor Core 吞吐高于 FP16/BF16，但 E4M3 只有 3 位尾数。若一整张张量共享一个缩放因子，少量离群值会扩大步长，使大多数普通值量化得很粗。

FlashAttention-3 为每个 $Q_i,K_j,V_j$ 分块分别保存尺度。以最大绝对值量化为例，可写成

$$
s_X=\frac{\max |X|}{x_{\max}^{\mathrm{FP8}}},\qquad
\widehat X=\operatorname{round}_{\mathrm{FP8}}\!\left(\frac{X}{s_X}\right),
$$

于是分数块近似为

$$
Q_iK_j^\top\approx s_{Q_i}s_{K_j}\,\widehat Q_i\widehat K_j^\top.
$$

分块尺度与 FlashAttention 原有的 tile 一一对应，可以在内核中直接并入分数和输出缩放。FP8 WGMMA 对操作数布局的要求也比 FP16 严格，内核通过片上转置和匹配的行置换，把 softmax 输出与 $V$ 调整到可被下一次 WGMMA 消费的布局。

块尺度仍可能被块内离群值支配。论文在量化前对 Query 和 Key 的特征维乘同一个随机正交矩阵 $M$：

$$
Q'=QM,\qquad K'=KM,\qquad MM^\top=I.
$$

因此

$$
Q'K'^\top=QMM^\top K^\top=QK^\top.
$$

实现中的 $M$ 由随机 $\pm1$ 对角矩阵与 Hadamard 矩阵组成，乘法复杂度为 $O(d\log d)$，并可与旋转位置编码等前置操作融合。变换把集中在少数特征上的大值扩散到更多维度，降低 FP8 量化误差；它保持的是变换前的精确点积，随后执行的 FP8 舍入仍会产生误差。

论文的离群值实验中，块量化与非相干处理把 FP8 输出 RMSE 从按张量缩放基线的 $2.4\times10^{-2}$ 降到 $9.1\times10^{-3}$，约低 2.6 倍。这个结果针对论文构造的分布与形状，不能推出任意模型训练都无精度损失。

## 5. 性能、适用范围与后续问题

论文在 H100 SXM5 上测试序列长度 512–16K、总 token 数 16K、head dimension 64/128/256。FP16 前向相对 FlashAttention-2 为 1.5–2.0 倍，最高 740 TFLOPs/s，约为理论峰值的 75%；反向为 1.5–1.75 倍。FP8 前向接近 1.2 PFLOPs/s，但在 head dimension 128/256 且启用因果掩码时并不总能超过 cuDNN 的 FP8 内核。

论文实现主要评估长序列前向与训练反向。它尚未专门优化 LLM 的单 token 解码，FP8 路径也没有使用持久化内核；小序列和因果形状因此更容易受调度与负载不均影响。单 token 解码的 KV 切分见 [Flash-Decoding](../../../../6-训练与推理优化/6.6-推理框架与高级优化/6.6.3-Flash-Decoding原理与实现.md)。

当前官方仓库仍把 FlashAttention-3 标为 beta：支持 H100/H800，要求 CUDA 12.3 以上并推荐 12.8；已发布 FP16/BF16 前向与反向，以及 FP8 前向。论文性能结果与这组可部署接口属于不同层次，使用前还要核对框架集成、构建版本和实际张量形状。

FlashAttention-3 让 Hopper 的搬运、矩阵乘与 softmax 更充分地并行。到 Blackwell，Tensor Core 的增长快于指数函数单元与共享内存带宽，softmax 中的 $\exp$ 再次成为主要限制；[FlashAttention-4](./05-FlashAttention-v4.md) 转而增加指数吞吐，并重新设计前向与反向流水。

## 参考资料

- Jay Shah et al. [FlashAttention-3: Fast and Accurate Attention with Asynchrony and Low-precision](https://arxiv.org/abs/2407.08608), 2024.
- Jay Shah et al. [FlashAttention-3 论文 HTML](https://arxiv.org/html/2407.08608), 2024.
- NVIDIA. [Hopper Tuning Guide](https://docs.nvidia.com/cuda/hopper-tuning-guide/), CUDA Documentation.
- NVIDIA. [Parallel Thread Execution ISA：WGMMA](https://docs.nvidia.com/cuda/parallel-thread-execution/#asynchronous-warpgroup-level-matrix-instructions), PTX ISA.
