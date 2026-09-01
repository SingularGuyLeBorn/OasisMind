---
title: "05 · FlashAttention-4：Blackwell 流水与指数函数优化"
date: 2026-08-30
tags: [FlashAttention-4, Blackwell, TMEM, 2-CTA MMA, Softmax, CuTe-DSL]
as_of: 2026-09-01
---

# 05 · FlashAttention-4：Blackwell 流水与指数函数优化

[FlashAttention-3](./04-FlashAttention-v3.md) 用 Warp 专门化与异步 WGMMA 把 Hopper 上的数据搬运、矩阵乘和 softmax 交叠起来。Blackwell 的 Tensor Core 吞吐继续增长，指数函数单元与共享内存带宽却没有同步增长：B200 每个 SM、每个时钟可完成约 8192 次 BF16 矩阵乘运算，而 MUFU 仍约为 16 次指数运算，共享内存读取吞吐也仍为 128 byte/cycle/SM。FlashAttention-4 因而同时调整前向流水、指数计算、反向数据布局与线程块调度。

## 1. Blackwell 上的瓶颈转移

对形状为 $M\times N$、head dimension 为 $d$ 的前向 tile，两次矩阵乘的计算时间近似为

$$
T_{\mathrm{MMA}}=\frac{4MNd}{8192}\ \text{cycles},
$$

softmax 的指数计算时间近似为

$$
T_{\exp}=\frac{MN}{16}\ \text{cycles}.
$$

当 $M=N=d=128$ 时，两者都是 1024 cycles。矩阵乘 FLOPs 数量远大于指数函数数量，但 Tensor Core 与 MUFU 的吞吐差也很大，二者最终处于相同量级。单纯让矩阵乘更快，已经不能按相同比例缩短注意力时间。

Blackwell 还增加了每个 SM 256 KiB 的 Tensor Memory（TMEM）。异步 MMA 可以把累加器直接写入 TMEM，不再要求所有大块累加器长期占用寄存器。单条 MMA 的典型输出 tile 也由 Hopper 的 $64\times128$ 扩大到 $128\times128$，为更宽的流水线提供了空间，同时增加了寄存器与片上数据布局的约束。

![FlashAttention-4 在 Blackwell 上的前向数据流](./images/fig-fa-v4-mech-asymmetric.png)

> 图 1：矩阵乘结果进入 TMEM；softmax 的指数计算由 MUFU 与 FMA 多项式两条路径共同承担，再把概率块交给 $PV$ 矩阵乘。

## 2. 前向：两块输出的异步流水

FlashAttention-4 的一个线程块同时推进两个 Query tile。两个 softmax Warpgroup 各负责一个 $128\times128$ 分数块，每个线程处理一整行，依次完成行最大值、指数、行和与精度转换。它们与负责 TMA/MMA 的 Warpgroup 交替工作：一个 tile 做 softmax 时，另一个 tile 的 $QK^\top$ 或 $PV$ 在 Tensor Core 上执行。

分数 $S$、概率 $P$ 与输出累加量主要放在 TMEM。由于 $P$ 通过 TMEM 交给下一次 MMA，旧输出的缩放可以交给独立的 correction Warpgroup，从 softmax 的关键路径移出。实现为两份输出累加器分配 TMEM，再让 $S$ 与 $P$ 复用剩余区域；生命周期不重叠的中间张量共享同一片地址。

更大的 tile 也提高了单线程寄存器需求。一行 128 个分数需要整行载入寄存器，softmax Warpgroup 还要保存输出片段与临时统计量。实现把 $P$ 的写出分阶段进行，避免同时保留全部中间值。这里的目标是在 Tensor Core、MUFU、FMA 和内存搬运之间取得平衡；继续增加流水阶段可能因寄存器溢出或并发度下降而变慢。

## 3. 用 FMA 增加指数吞吐

硬件 `MUFU.EX2` 计算 $2^x$，吞吐低于普通 FMA。FlashAttention-4 让部分元素改走软件多项式路径，与 MUFU 并行。对 softmax 中的 $e^y$，先把输入换算到 $2^{y\log_2 e}$，再用 Cody–Waite 范围缩减：

$$
2^x=2^k2^r,\qquad k=\lfloor x\rfloor,\quad r=x-k\in[0,1).
$$

整数部分 $2^k$ 通过 IEEE 754 指数位构造；分数部分用多项式

$$
2^r\approx p_0+p_1r+\cdots+p_nr^n
$$

并按 Horner 形式求值：

$$
p_0+r\bigl(p_1+r(p_2+\cdots+rp_n)\bigr).
$$

Horner 形式把乘法与加法连续映射到 FMA。实现还会截断过小的输入，避免构造超出浮点指数范围的数。

软件路径需要额外寄存器保存系数和临时量，延迟也高于一次 MUFU 指令。FlashAttention-4 只让每行约 10%–25% 的元素使用多项式，其余仍由 `MUFU.EX2` 计算；比例根据 tile 上矩阵乘与指数吞吐的关系调节。

论文在 $[0,1)$ 上测试 400 万个输入。三次多项式的 FP32 最大相对误差为 $8.77\times10^{-5}$；输出舍入到 BF16 后，最大相对误差为 $3.90\times10^{-3}$，与硬件路径的 $3.89\times10^{-3}$ 接近，99% 输入与硬件结果相差不超过 1 个 BF16 ULP。五次多项式的 FP32 最大相对误差降到 $1.44\times10^{-7}$，代价是每个元素多两次 FMA。该结论依赖 BF16 舍入会覆盖大部分三次逼近误差，不能直接外推到需要完整 FP32 精度的场景。

## 4. 条件 softmax 重标度

在线 softmax 处理第 $j$ 个分块时，通常用新的行最大值更新缩放锚点。为区分“当前块给出的候选最大值”和“实际用于缩放累加量的锚点”，记

$$
c_j=\max\!\left(a_{j-1},\operatorname{rowmax}(S_j)\right),
$$

其中 $a_{j-1}$ 是旧锚点，$c_j$ 是当前块建议的新锚点。传统递推令 $a_j=c_j$，并把此前的输出乘以 $e^{a_{j-1}-a_j}$。只要出现稍大的新最大值，整行旧输出都要做一次向量缩放。

FlashAttention-4 允许锚点在有限范围内滞后。只有候选值相对当前锚点增加超过阈值 $\tau$ 时，才更新锚点并缩放旧输出：

$$
\begin{aligned}
a_j&=
\begin{cases}
c_j,&c_j-a_{j-1}>\tau,\\
a_{j-1},&c_j-a_{j-1}\le\tau,
\end{cases}\\[4pt]
O_j&=e^{a_{j-1}-a_j}O_{j-1}+e^{S_j-a_j}V_j.
\end{aligned}
$$

归一化量使用同一个 $a_j$ 递推：

$$
\ell_j=e^{a_{j-1}-a_j}\ell_{j-1}+\operatorname{rowsum}\!\left(e^{S_j-a_j}\right).
$$

实现内部使用以 2 为底的指数表示时，典型阈值为 $\tau=\log_2 256=8$。未触发阈值时 $a_j=a_{j-1}$，旧输出和旧归一化量都无需缩放；最终 $O_T/\ell_T$ 中的共同尺度相消，log-sum-exp 则为 $a_T+\log\ell_T$。实数运算下这只是选择了不同的公共缩放锚点，浮点实现会因运算次序产生细小差异。为避免同一 Warp 内分支发散，只要某个线程需要重标度，整个 Warp 就执行该步骤。

## 5. 反向：TMEM、2-CTA MMA 与确定性规约

注意力反向每轮包含五次 MMA：重算 $S$，并计算 $dP,dV,dQ,dK$。当 $M=N=d=128$ 时，论文的简化模型估计 MMA 需要 2560 cycles，而单 CTA 方案的共享内存流量需要 3328 cycles；反向的主要限制由指数计算转向共享内存。

Blackwell 的 2-CTA MMA 允许同一 cluster 内的一对线程块共同完成较大的矩阵乘。每个 CTA 只在自己的共享内存中准备一半操作数 $B$，硬件组合两侧数据执行 MMA。FlashAttention-4 使用 $M=256,N=K=128$ 的 tile，把大部分矩阵乘的共享内存读流量分摊到两侧；简化模型中的共享内存时间降到 2688 cycles，接近 2560 cycles 的 MMA 时间。

$dQ$ 沿 KV 方向规约，与 2-CTA 对输出 tile 的划分方向并不一致。两个 CTA 通过 Distributed Shared Memory 交换一半 $dS$，让每侧拥有自己负责的 Query 行和完整的 $2N$ 规约维，再把 $dQ$ 累加到 TMEM。每个 CTA 最终只写一半 $dQ$，全局原子加次数也相对单 CTA 方案减半。

跨 CTA 的原子规约会因执行顺序不同产生非确定结果。确定性模式用 semaphore 规定写入同一梯度 tile 的 CTA 顺序，并配合 batch、head 与因果 tile 的重排减少等待。它提高了可复现性，但需要内存栅栏和串行规约；论文报告其最高达到非确定性单 CTA 反向速度的约 75%。

## 6. 调度与 CuTe-DSL 实现

因果掩码和变长 batch 会让不同 tile 的循环次数不同。FlashAttention-4 使用 longest-processing-time-first（LPT）顺序优先调度工作量较大的 tile，并按 batch 与 head 分段，避免跨太多 KV 头访问而冲掉 L2 缓存。对 MQA/GQA，会先遍历共享同一 KV 头的 Query 头。变长输入可由预处理核按每个 tile 的估计工作量排序，再用虚拟到实际 batch 的索引映射执行。

内核完全用嵌入 Python 的 CuTe-DSL 编写，经由 PTX 和 `ptxas` 生成 SASS，同时可插入自定义 PTX。论文针对单个内核报告：前向编译时间从 FlashAttention-3 C++ 模板实现的 55 秒降到 2.5 秒，反向从 45 秒降到 1.4 秒。这里比较的是论文选定内核的编译时间，不是运行时加速。

## 7. 性能结果与适用边界

论文在 B200 上以 BF16 测试序列长度 1K–32K，总 token 数固定为 32K，覆盖 head dimension 64、128 以及 Query/Key-Value 维度 $(192,128)$。FlashAttention-4 最高达到 1613 TFLOPs/s，约为理论峰值的 71%；相对 cuDNN 9.13 为 1.1–1.3 倍，相对论文中的 Triton 实现为 2.1–2.7 倍。论文也说明，后续 cuDNN 版本吸收相关方法后已经达到相近性能，因此这些比值不能代表当前所有软件版本。

论文中的算法分析和性能数据针对 Blackwell、BF16 与给定形状，其中 TMEM 和 2-CTA MMA 是 Blackwell 专属机制。当前官方仓库另把 FlashAttention-4 CuTe-DSL 软件包标为针对 Hopper 与 Blackwell 优化，列出 H100 和 B200 支持；H100 会采用符合其硬件的数据路径，不能套用 B200 的 TMEM、2-CTA 解释或性能数字。论文基准也没有在 B200 上运行 FlashAttention-3，不能从图表得到 v4 相对 v3 的直接倍率。部署时应按 GPU 架构、掩码、head dimension、前向或反向以及确定性要求分别测试。

## 参考资料

- Ted Zadouri et al. [FlashAttention-4: Algorithm and Kernel Pipelining Co-Design for Asymmetric Hardware Scaling](https://arxiv.org/abs/2603.05451), 2026.
- Ted Zadouri et al. [FlashAttention-4 论文 HTML](https://arxiv.org/html/2603.05451), 2026.
- Dao AI Lab. [FlashAttention-4](https://dao-lab.ai/blog/2026/flash4/), 2026.
- Dao AI Lab. [flash-attention 官方仓库](https://github.com/Dao-AILab/flash-attention), GitHub.
- NVIDIA. [CuTe DSL Documentation](https://docs.nvidia.com/cutlass/media/docs/pythonDSL/cute_dsl_general/dsl_introduction.html), CUTLASS Documentation.
