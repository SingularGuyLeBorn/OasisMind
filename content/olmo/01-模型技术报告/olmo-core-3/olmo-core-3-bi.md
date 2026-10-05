---
title: "Olmo-core 3 · 对照译稿"
category: "模型库"
tags: ["OLMo", "对照译稿"]
published: true
excerpt: "Olmo-core 3 技术报告与发布博客的逐段中英对照译稿, 附读报告时的疑问块."
---
<!-- page 1 of 168 -->

# Supercharging Olmo-core for Efficient and Scalable MoE Training

**Tianhua Tao**<sup>1,2,†,∗</sup> **Akshita Bhagia**<sup>1</sup> **Dirk Groeneveld**<sup>1,†</sup> **Pete Walsh**<sup>1,†</sup> **Tyler Romero**<sup>1</sup>,† **Yashas Samaga**<sup>1,2</sup> **Jacob Morrison**<sup>1,2</sup>**Iz Beltagy**<sup>1</sup> **Taira Anderson**<sup>1</sup> **Noah A. Smith**<sup>1,2</sup> **Hannaneh Hajishirzi**<sup>1,2,†</sup>

<sup>1</sup>Allen Institute for AI <sup>2</sup>University of Washington

<sup>∗</sup>Lead author and primary developer, <sup>†</sup>Work done while at the Allen Institute for AI, see Appendix G for author contributions.

**Correspondence** [tianhuat@cs.washington.edu](mailto:tianhuat@cs.washington.edu); [olmo@allenai.org](mailto:olmo@allenai.org) **Code:** [Olmo-core](https://github.com/allenai/olmo-core) **Date** October 2026

## Abstract

![Image block](images/p01-image.jpg)

> 图注: image.

Mixture-of-Experts (MoE) models offer more total parameter capacity without proportionally increasing per-token compute: each token activates only a few experts. However, training cost depends not only on active compute but also on many other factors, including bytes moved, memory held, and kernels launched; many of those costs follow total parameter capacity rather than active compute. On infrastructure built for dense models, this mismatch is expensive: in our early baselines, throughput fell as stored expert capacity grew, even though the useful work per token stayed nearly fixed.

MoE 模型能提供更大的总参数容量, 每个 token 的计算量却不按比例增加: 每个 token 只激活少数几个专家. 但训练成本不只取决于激活计算量, 还取决于很多别的因素, 包括搬运的字节数, 占用的显存和启动的 kernel 数; 其中很多成本跟着总参数容量走, 而不是跟着激活计算量走. 在为 dense 模型搭建的基础设施上, 这种错配代价很高: 在我们早期的基线里, 每个 token 的有效计算几乎不变, 吞吐却随存储的专家容量增长而下降.

To close this gap, we present a redesigned training stack in Olmo-core, which is optimized for efficient and scalable MoE training. We switch from the Fully Sharded Data Parallel (FSDP) used by previous Olmo-core versions to a parallelization architecture built on Distributed Data Parallel (DDP). On top of it, we add Expert Parallelism (EP), Pipeline Parallelism (PP), a distributed optimizer, and activation recompute to support large-scale models.

为弥合这一差距, 我们在 Olmo-core 里重新设计了训练栈, 专为高效, 可扩展的 MoE 训练优化. 我们把并行架构从此前 Olmo-core 版本使用的全分片数据并行 (FSDP) 换成以分布式数据并行 (DDP) 为基础的架构. 在 DDP 之上, 我们加入专家并行 (EP), 流水线并行 (PP), 分布式优化器和激活 recompute, 以支撑大规模模型.

We bring together a suite of optimizations to make MoE training more efficient. For MoE layers, we propose NVSHMEM-based rowwise EP, which writes each token directly into its expert’s buffer, avoiding permutation overhead in dispatch and combine operations. We make EP fully synchronization-free by keeping routing metadata on the GPU and using device-scheduled grouped GEMMs. Closely integrated MXFP8 raises throughput by cutting compute, activation-memory, and transport costs, and topology-agnostic checkpoints let the parallel layout change between runs.

我们把一组优化组合起来, 让 MoE 训练更高效. 对 MoE 层, 我们提出基于 NVSHMEM 的 rowwise EP: 每个 token 直接写进它所选专家的缓冲区, 省去 dispatch 和 combine 里的重排开销. 路由元数据留在 GPU 上, 再配合由设备端调度的 grouped GEMM, EP 就完全不需要同步. 深度集成的 MXFP8 同时削减计算, 激活显存和传输成本, 从而提高吞吐; 与拓扑无关的 checkpoint 允许两次运行之间更换并行布局.

On NVL8 B300 nodes, the stack supports training configurations from **12.9 billion** to **1.2 trillion** total parameters on up to 512 GPUs, reaching 858 useful-model TFLOP/s/GPU at 1.2 trillion with MXFP8 and per-layer recompute; an experimental capacity test with the optional DeepEP v2 backend reaches **2.38 trillion**.

在 NVL8 B300 节点上, 这套训练栈在最多 512 张 GPU 上支持总参数从 **129 亿** 到 **1.2 万亿** 的训练配置. 1.2 万亿规模下, 开启 MXFP8 和逐层 recompute, 有效模型吞吐达到 858 TFLOP/s/GPU; 使用可选的 DeepEP v2 后端做的实验性容量测试达到 **2.38 万亿**.

We also explain the reasoning behind each design choice and share findings that can inform other training systems. For example, we identify a failure pattern we call Token Gerrymandering, in which the MoE router learns to hack the load-balancing loss, and find that overlapping communication with computation can slow the overlapped kernels by more than it hides. These are two of many findings in the report. Together, the stack and these findings offer practical insights into building efficient, scalable MoE training systems.

我们也解释了每个设计选择背后的理由, 并分享一些对其他训练系统有参考价值的发现. 例如, 我们发现一种失效模式, 称为 Token Gerrymandering: MoE router 学会钻负载均衡 loss 的空子. 我们还发现, 让通信与计算重叠时, 被重叠的 kernel 变慢的时间可能超过重叠藏住的时间. 这只是报告里众多发现中的两个. 训练栈本身和这些发现一起, 为搭建高效, 可扩展的 MoE 训练系统提供了实用经验.

<!-- page 2 of 168 -->

## Statement of AI Assistance · AI 辅助声明

We used AI tools to assist with developing the codebase and kernels, drafting and revising this report, managing experiments, and creating visualizations. The authors retain full responsibility for the report’s content. See Appendix G.1 for the role of these tools and our verification approach.

我们用 AI 工具辅助开发代码库和 kernel, 起草和修改本报告, 管理实验以及制作可视化. 报告内容由作者负全部责任. 这些工具承担的角色和我们的核验方法见附录 G.1.

<!-- page 3 of 168 -->

## Speed-Read · 速读

This report describes the MoE training stack in Olmo-core, the measurements that guided its design, and the approaches we tried but did not adopt. This guide summarizes the main results; the table at the end points to sections for readers interested in a particular problem.

本报告介绍 Olmo-core 里的 MoE 训练栈, 指导其设计的测量结果, 以及我们试过但没有采用的方案. 这份导读概括主要结果; 末尾的表格为关心某个具体问题的读者指出对应章节.

**Sparse compute leaves substantial capacity-dependent costs.** An MoE model stores many expert networks but sends each token through only a few of them, so the arithmetic per token stays small while the stored model grows. Weight storage, gradient synchronization, and optimizer updates still depend on total parameter count. The full-reshard fully sharded data parallel (FSDP) configuration used for dense Olmo also gathers and frees weights around every microbatch. In our early baselines, adding experts at fixed active size therefore reduced throughput even though the useful work per token barely changed (Figure 4). Section 1.3 names this **capacity tax** and separates it from the **runtime tax** of sparse routing and execution; Section 2 introduces the changes we made to reduce both.

**稀疏计算之后, 仍有大量依赖容量的成本.** MoE 模型存了很多专家网络, 但每个 token 只经过其中几个, 所以存储的模型变大时, 每个 token 的算术量仍然很小. 权重存储, 梯度同步和优化器更新仍然取决于总参数量. dense Olmo 使用的 full-reshard FSDP 配置还会在每个 microbatch 前后 gather 和释放权重. 因此在我们早期的基线里, 固定激活规模, 增加专家, 吞吐下降, 而每个 token 的有效计算几乎没变 (Figure 4). 第 1.3 节把这部分成本称为 **容量税** (capacity tax), 并把它和稀疏路由与执行带来的 **运行时税** (runtime tax) 分开; 第 2 节介绍我们为压低这两类成本做的改动.

**DDP keeps model partitions resident; EP moves selected token rows.** The stack replaces the full-reshard FSDP configuration used for dense Olmo with a custom distributed data parallel (DDP) path: each rank keeps its partition of the model in place for the whole accumulation window and synchronizes gradients once per optimizer step, with a distributed optimizer sharding the FP32 main weights and optimizer states (Section 4). Expert parallelism (EP) shards the routed experts across ranks and dispatches only the selected token rows to the rank that stores their expert. Our rowwise intra-node transport writes each token row directly into its destination buffer using GPU-initiated one-sided communication through NVSHMEM, avoiding the host-visible split lists that the block all-to-all path needs. A block-oriented DeepEP v2 backend supports expert groups that span nodes (Section 5). Pipeline parallelism (PP) divides layers when one rank cannot hold them all (Section 6). Section 3 shows how DDP, EP, and PP combine, and Section 7 maps their rank groups onto NVLink and InfiniBand.

**DDP 让模型分片常驻显存, EP 搬运被选中的 token 行.** 这套训练栈用自研的 DDP 路径替换 dense Olmo 的 full-reshard FSDP 配置: 每个 rank 在整个梯度累积窗口里把自己那份模型分片留在原地, 每个优化器步只同步一次梯度, 再由分布式优化器对 FP32 主权重和优化器状态做分片 (第 4 节). EP 把 routed 专家分散到各个 rank 上, 只把被选中的 token 行 dispatch 到存有对应专家的 rank. 我们的节点内 rowwise 传输通过 NVSHMEM, 由 GPU 发起单边通信, 把每个 token 行直接写进目标缓冲区, 不需要 block all-to-all 路径所要求的, 主机可见的 split 列表. 面向 block 的 DeepEP v2 后端支持跨节点的专家组 (第 5 节). 单个 rank 放不下全部层时, PP 按层切分 (第 6 节). 第 3 节说明 DDP, EP 和 PP 如何组合, 第 7 节把它们的 rank 组映射到 NVLink 和 InfiniBand 上.

**GPU-resident metadata removes two recurring host waits.** The original MoE path copied routing counts to the CPU for both all-to-all split sizes and expert matrix-multiplication group sizes. Keeping this metadata on the device removes those synchronization points from the steady-state loop (Section 8). Devicescheduled **grouped general matrix multiplication (grouped GEMM)** executes the uneven per-expert shapes produced by routing without padding every expert batch to a common capacity. Section 9 measures where it beats the padded alternative and where it does not.

**元数据留在 GPU 上, 去掉两处反复出现的主机等待.** 原来的 MoE 路径要把路由计数拷到 CPU, 一次用于 all-to-all 的 split 大小, 一次用于专家矩阵乘的分组大小. 把这些元数据留在设备上, 稳态循环里就没有这两个同步点 (第 8 节). 由设备端调度的 **grouped GEMM** 直接执行路由产生的, 各专家大小不一的形状, 不必把每个专家的 batch 都 pad 到同一个容量. 第 9 节测量它在哪些情况下胜过 pad 方案, 哪些情况下不如.

**Routers can lower the balancing loss while worsening imbalance.** Section 10 treats routing as a systems problem: what capacity admits, what the load-balancing loss actually optimizes, and how it can reward a failure we call **Token Gerrymandering**, in which the loss improves while imbalance grows (Figure 42).

**router 可以一边压低均衡 loss, 一边让负载更不均衡.** 第 10 节把路由当作系统问题来讨论: 容量放行了什么, 负载均衡 loss 实际优化的是什么, 以及它为什么会奖励一种我们称为 **Token Gerrymandering** 的失效: loss 变好, 不均衡却在加剧 (Figure 42).

**MXFP8 reduces compute and data-movement costs. MXFP8**, an eight-bit format with shared block scales, cuts GEMM time, saved activations, and dispatch payloads, while one FP32 main weight stays authoritative (Section 11).

**MXFP8 降低计算与数据搬运成本.** MXFP8 是一种按块共享缩放因子的 8 位格式, 能缩短 GEMM 时间, 减少保存的激活和 dispatch 载荷, 而权威副本始终是一份 FP32 主权重 (第 11 节).

**Checkpoints preserve the model independently of its parallel layout.** Checkpoints record the global FP32 tensors independently of the parallel layout, so a run can resume on a different topology (Section 12).

**checkpoint 保存的模型与并行布局无关.** checkpoint 记录全局 FP32 张量, 不依赖并行布局, 所以一次运行可以换一种拓扑接着训 (第 12 节).

**Recompute lets larger recipes fit in memory.** Activation recompute reduces the activations retained for the backward pass, lowering peak high-bandwidth memory (HBM) usage. In our controlled comparison, it removes nearly two thirds of activation memory and reduces peak memory by about a quarter, at the cost of about a fifth of throughput. We use it in the larger recipes that would otherwise exceed device memory (Section 13).

**recompute 让更大的配方放得进显存.** 激活 recompute 减少为反向传播保留的激活, 从而降低高带宽显存 (HBM) 的峰值占用. 在我们的对照实验里, 它去掉近三分之二的激活显存, 峰值显存降低约四分之一, 代价是吞吐下降约五分之一. 不开就会超出设备显存的大配方, 我们都开启 recompute (第 13 节).

**The training configurations span 16 to 512 GPUs.** Section 14 lists measured operating points, from a 12.9-billion-parameter model on 16 GPUs to a 1.2-trillion-parameter model on 512. These configurations differ in batch, parallelism, precision, and recompute, so their rates are not a controlled scaling curve. Every headline rate there is a systems reference measured under random routing, not a time-to-quality claim; the table states the batch, topology, precision, and recompute policy needed to interpret each number.

**训练配置覆盖 16 到 512 张 GPU.** 第 14 节列出实测的工作点, 从 16 张 GPU 上的 129 亿参数模型到 512 张 GPU 上的 1.2 万亿参数模型. 这些配置的 batch, 并行方式, 精度和 recompute 各不相同, 所以它们的吞吐不构成一条受控的扩展曲线. 那里每个主吞吐数字都是在随机路由下测得的系统参考值, 不代表达到某个质量所需的时间; 表中给出解读每个数字所需的 batch, 拓扑, 精度和 recompute 策略.

**Some optimizations traded one cost for another.** Section 15 describes approaches we did not adopt: CPU offload of activations that the host link could not carry, and two overlap schemes that competed with

<!-- page 4 of 168 -->

expert compute for GPU resources. It also covers a persistent MoE megakernel that needed a complete training runtime, a natural-layout MXFP8 weight-gradient prototype that was slower than dequantizing its operands first, and CUDA Graph replay whose fixed-address activation buffers could not be reused while earlier pipeline microbatches still needed their contents for backward. These experiments quantify the tradeoffs between concurrency, kernel efficiency, and memory use. In particular, overlapping communication with compute can slow concurrent kernels enough to offset—or exceed—the time saved by overlap.

**有些优化只是用一种成本换另一种成本.** 第 15 节介绍我们没有采用的方案: 把激活 offload 到 CPU, 但主机链路带宽撑不住; 两种重叠方案, 它们和专家计算争抢 GPU 资源. 还包括一个常驻的 MoE megakernel, 它需要一整套训练运行时才能用起来; 一个按自然布局计算 MXFP8 权重梯度的原型, 比先把操作数反量化再算还慢; 以及 CUDA Graph 重放: 它的激活缓冲区地址固定, 而流水线里更早的 microbatch 在反向时仍要用这些缓冲区里的内容, 所以缓冲区无法复用. 这些实验量化了并发度, kernel 效率和显存占用之间的取舍. 尤其是, 通信与计算重叠时, 并发 kernel 被拖慢的程度可能抵消甚至超过重叠省下的时间.

**The experiments also inform the training recipe.** Critical batch size says when a larger batch still helps but not which learning rate to pair with it, and square-root scaling needed a small empirical correction (Section 16); scaling expert learning rates by sparsity did not help (Section 17). We train from scratch rather than upcycle because, in the published OLMoE study, a dense model’s head start did not persist over a longer run (Section 18). Several ungated shared experts are mathematically one wider shared expert (Section 20), and the rule that merges routed and shared outputs changes the initialization scale (Section 21).

**这些实验也影响了训练配方.** 临界 batch size 能说明更大的 batch 什么时候仍然有用, 但说明不了该配哪个学习率; 平方根缩放规则需要一个小的经验修正 (第 16 节). 按稀疏度缩放专家学习率没有帮助 (第 17 节). 我们从头训练而不做 upcycle, 原因是在已发表的 OLMoE 研究里, dense 模型带来的起步优势在更长的训练里没有保持下来 (第 18 节). 多个不带门控的共享专家在数学上等价于一个更宽的共享专家 (第 20 节); 合并 routed 输出与共享输出的规则会改变初始化尺度 (第 21 节).

**Post-training reuse and comparisons with other systems.** Section 22 discusses how the same mechanisms could support supervised fine-tuning, preference training, and reinforcement learning; it is a design discussion rather than a post-training benchmark. Section 23 compares the design against Megatron-Core, DeepSpeed-MoE, and DeepEP in terms of parameter movement, communication, and execution costs. Section 24 summarizes the implications for memory use, throughput, and measurement.

**后训练复用, 以及与其他系统的比较.** 第 22 节讨论同一套机制如何支撑 SFT, 偏好训练和强化学习; 这是设计层面的讨论, 不是后训练基准测试. 第 23 节从参数搬运, 通信和执行成本三方面, 把本设计与 Megatron-Core, DeepSpeed-MoE 和 DeepEP 对比. 第 24 节总结这些结果对显存占用, 吞吐和测量方法的意义.

**Read the numbers with their conditions.** The report uses three kinds of evidence. Production-scale runs report achieved throughput and feasible configurations. Controlled four-GPU experiments with a fixed model, batch, and timing window give the ablations for MXFP8, recompute, and overlap. Kernel and profiler microbenchmarks isolate single mechanisms. GEMM timing depends on the values in the operands, which makes initialization part of any kernel benchmark (Section 19). Appendix A documents the kernel interfaces and profiling method, Appendix B records experiment configurations and metric definitions, and Appendix C defines the terminology; when a term such as compute weight, symmetric memory, or dispatch and combine looks overloaded, the glossary gives the meaning used here. Figure 76 in Appendix D compresses the whole design into one matrix of which method relieves which bottleneck and at what cost.

**读数字时要连同条件一起读.** 报告用到三类证据. 生产规模的运行给出实际吞吐和可行配置. 固定模型, batch 和计时窗口的四卡对照实验给出 MXFP8, recompute 和重叠的消融. kernel 与 profiler 微基准用来单独考察某一个机制. GEMM 耗时取决于操作数里的数值, 所以初始化方式是任何 kernel 基准的一部分 (第 19 节). 附录 A 记录 kernel 接口和 profiling 方法, 附录 B 记录实验配置和指标定义, 附录 C 定义术语; compute weight, symmetric memory, dispatch 与 combine 这类词看起来含义不止一个时, 以术语表给出的含义为准. 附录 D 的 Figure 76 把整个设计压成一张矩阵: 哪种方法缓解哪个瓶颈, 代价是什么.

| If you want to | Read |
| --- | --- |
| See the headline throughput and | The panel at the end of Section 2 (p. 19), then Section 14 (p. 103) and |
| exactly what produced it | Appendix B |
| Understand why FSDP was replaced | Sections 1.3, 3, and 4 (pp. 14-29) |
| for MoE |  |
| Build or debug an MoE trainer | Sections 5, 8, 9, and 12 (from p. 30), with Appendix A as the interface reference |
| Fit a larger model into memory | Sections 6, 13, and 14, plus the offload budget in Section 15 (p. 105) |
| Adopt low-precision training | Section 11 (p. 83), then Sections 19 and 15 |
| Diagnose routing or load-balancing | Section 10 (p. 68), with the rank-capacity policy in Section 10.3 |
| behavior |  |
| Choose the model recipe: learning rate, | Sections 16, 17, 18, 20, and 21 (from p. 112) |
| upcycling, shared experts, merge rule |  |
| Reuse the stack for post-training (SFT, | Section 22 (p. 125) |
| preference training, RL) |  |
| Compare with Megatron-Core, | Section 23 (p. 127) and Appendix D |
| DeepSpeed-MoE, or DeepEP |  |
| Reproduce a measurement | Appendix B (p. 143) for configurations and metrics; Appendix A for profiling method |

**Reading paths through the report.** Each row starts from a reader’s question and lists the sections that answer it, in reading order. Part II covers placement and communication, Part III the execution loop and its measurements, and Part IV the recipe findings and the outlook.

**报告的阅读路径.** 每一行从读者的一个问题出发, 按阅读顺序列出回答它的章节. 第二部分讲放置与通信, 第三部分讲执行循环及其测量, 第四部分讲配方上的发现和展望.

<!-- page 5 of 168 -->

- Speed-Read 3
- I Introduction 9
- 1 Why the Dense Training Assumptions Break 9
- 1.1 Mixture of Experts (MoE): Sparse Activation . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 9
- 1.2 Lower FLOPs Do Not Guarantee Lower Wall Time . . . . . . . . . . . . . . . . . . . . . . . . . . . . 11
- 1.3 Sparse Routing Breaks the Dense Training Assumptions . . . . . . . . . . . . . . . . . . 14
- 2 Olmo-core DDP Training Stack 17
- II Parallelization 20
- 3 Parallelism Methods Divide Different Work and Storage 20
- 4 Distributed Data Parallel 21
- 4.1 DDP Uses Static Compute-Weight Replicas . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 22
- 4.2 FSDP Gathers per Microbatch; DDP Synchronizes per Global Step . . . . . . . . . . . . . . . . . . 24
- 4.3 DDP Alone Hits a Memory Wall . . . . . . . . . . . . . . . . . . . . . . 24
- 4.4 Olmo-Owned DDP . . . . . . . . . . . . . . . . . . . . . 28
- 4.5 DDP and FSDP Optimize Different Bottlenecks . . . . . . . . . . . . . . . 29
- 5 Expert Parallelism 30
- 5.1 EP Shards Models That Do Not Fit . . . . . . . . . . . . . . . . . . . . . . . 30
- 5.2 EP Adds Communication to Dispatch and Combine . . . . . . . . . . . . . . 33
- 5.3 Packed All-to-All Requires Peer-Contiguous Blocks . . . . . . . . . . . . . 34
- 5.4 Rowwise EP Removes Block Packing . . . . . . . . . . . . . . 35
- 5.5 Symmetric Memory Addresses Remote Rows . . . . . . . . . . . . . . 38
- 5.6 Routes Use PUT and GET . . . . . . . . . . . . . 38
- 5.7 Buffer Reuse and Ordering Are Explicit in Rowwise EP . 39
- 5.8 DeepEP v2 Provides an Optional EP Backend . . . . . . . . . . . . 41
- 5.9 Overlap Is Not Free: Resource Contention . . . . . . . . . . . 42
- 6 Pipeline Parallelism 44
- 6.1 Olmo Uses the 1F1B Family . . . . . . . . . . . . . . . . . . 45
- 6.2 Virtual-Stage Placement Controls Activation Retention . . . . . . . . . . . 45
- 6.3 P2P Overlap . . . . . . . . . . . . . . 46
- 6.4 PP Delays Reuse of Saved EP Payloads . . . . . . . . . . 47
- 6.5 Runtime Determines Pipeline Throughput . . . . . . . . . 48
- 7 Mapping Parallelism to Hardware 49
- 7.1 Rank Order Turns a Mesh into Placement . . . . . . . . . . . . 49
- 7.2 GPUDirect RDMA Moves Payload; IBGDA Submits Work . . . . . . . . . 50
- 7.3 Communication Clock Determines Placement Priority . . . . . . . 51
- 7.4 The Tested System Has Eight GPUs per NVLink Domain . . . . . . . 51
- 7.5 Topology Changes the Operating Point . . . . . . . 52
- III Efficient Training 53
- 8 Synchronization-Free Training 53
- 8.1 The CPU Must Stay Ahead of the GPU . . . . . . . . . . . 54
- 8.2 Small Work Units Expose Submission Overhead . . . . . . . 55

<!-- page 6 of 168 -->

- 8.3 Critical Microbatch Size . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 56
- 8.4 Device-to-Host Synchronization Drains the Queue . . . . . . . . . . . . . . . . . . . . . . . . 57
- 8.5 How to Become Synchronization-Free . . . . . . . . . . . . . . . . . . . . . . 59
- 9 Grouped GEMM 60
- 9.1 Routing Creates Uneven GEMMs . . . . . . . . . . . . . . . . . . . . . . . . . . 61
- 9.2 Padding, Host Scheduling, and Device Scheduling . . . . . . . . . . . . . . . . . 61
- 9.3 Device-Side Offsets Avoid a Host Synchronization . . . . . . . . . . . . . . . . 61
- 9.4 Padded Shape, Unpadded Compute . . . . . . . . . . . . . . . . 63
- 9.5 Forward, Dgrad, and Wgrad Are Different Problems . . . . . . . . . . . . . . 63
- 9.6 Rows per Expert Determine the Throughput Crossover . . . . . . . . . . . . . 64
- 10 Routing, Capacity, and Load Balancing 68
- 10.1 From Top-K Selection to the Executed Workload . . . . . . . . . . . . . . . . 68
- 10.2 The Costs of Imbalance Depend on Where It Appears . . . . . . . . . . . . 69
- 10.3 Rank-Wide Capacity Bounds Work Without Balancing It . . . . . . . . . . . 70
- 10.4 A Shared Rank Budget Drops No More Routes than Matched Expert Budgets . . . . . . 71
- 10.5 Load-Balancing Scope Is Part of the Training Objective . . . . . . . . . . . 72
- 10.6 Auxiliary Gradients and Hard-Count Feedback Are Different Controllers . . . . . . 74
- 10.7 Token Gerrymandering: The Model Learns to Hack the LBL Objective . . . . . . 75
- 10.8 Gradient Dynamics and the Joint Objective . . . . . . . . . . . 79
- 10.9 Measuring Routing Transients and Outcomes . . . . . . . . . . 82
- 11 MXFP8 Training 83
- 11.1 Benefits of MXFP8 Training . . . . . . . . . . . . . . 84
- 11.2 Understanding the MXFP8 Format . . . . . . . . . . . . 86
- 11.3 Challenges in MXFP8 Training . . . . . . . . . . . . 88
- 11.4 The Olmo MXFP8 Recipe for MoE . . . . . . . . . . 92
- 11.5 Throughput Benchmark . . . . . . . . . . . 95
- 12 Topology-Agnostic Checkpoint Saving and Loading 97
- 12.1 Checkpoint Tensors Are Topology-Independent . . . . . . . . . . 98
- 12.2 Low-Memory Online Conversion . . . . . . . . . . 98
- 12.3 Topology Changes and Model Conversion . . . . . . . 99
- 13 Activation Recompute 99
- 13.1 Choosing Recompute Granularity . . . . . . . . . . 100
- 13.2 Recomputing a Routed Block Repeats Its Communication . . . . . . 101
- 13.3 Composition with Pipeline Schedules . . . . . . . 101
- 13.4 Measured Memory-Throughput Trade-Off . . . . . . . 102
- 13.5 Choosing a Recompute Policy . . . . . . . 103
- 14 Production Training Throughput 103
- 14.1 Production Run Matrix . . . . . . . . . . 103
- 14.2 Throughput Across Model Sizes . . . . . . . 104
- 15 Optimization Attempts and Lessons 105
- 15.1 CPU Activation Offload Was Limited by PCIe . . . . . . . . . 106
- 15.2 Wave Overlap Was Not a Reliable Win . . . . . . . 107
- 15.3 Two-Batch Overlap . . . . . . . 107
- 15.4 The MegaMoE Kernel Became a Runtime Project . . . . . . 109
- 15.5 Wgrad Needed a Different Scale Layout . . . . . . 109
- 15.6 Static CUDA Graphs Need Pipeline-Aware Storage . . . . . 110
- 15.7 Local Savings Must Survive the Training Schedule . . . . . 111

<!-- page 7 of 168 -->

- IV Findings and Outlook 112
- 16 Learning Rate Scaling with Global Batch Size 112
- 16.1 Critical Batch Size Defines the Useful Batch Regime 112
- 16.2 Adam Does Not Imply One Universal Exponent 113
- 16.3 An Empirical Exponent of 0.53 Smoothed Batch Transitions 114
- 17 Scaling Expert Learning Rate with Sparsity Did Not Help 115
- 18 Why We Do Not Upcycle 115
- 19 GEMM Timing Depends on Operand Values 116
- 19.1 Operand-Dependent Hardware Behavior Has Prior Evidence 117
- 19.2 Possible Mechanisms and Their Evidence 117
- 19.3 Use the Same Initialization in Every Comparison 118
- 20 One Shared Expert Is All You Need 118
- 20.1 The Collapse Is Exact 119
- 20.2 Dynamic Gates Preserve Expert Identity 119
- 20.3 Expert Count Is Not Shared Capacity 121
- 20.4 Shared and Routed Widths Are Independent 121
- 21 Merging Routed and Shared Expert Activations 121
- 21.1 A Dense MLP Provides the Scale Reference 122
- 21.2 Predicting Variance at Initialization 123
- 21.3 The Measured Forward and Backward Scales Agree 123
- 21.4 Scope of the Initialization Result 124
- 22 Beyond Pretraining 125
- 22.1 Response-Only Supervision Uses Label Masking 125
- 22.2 Preference Training Scores Two Sequences Against a Reference 125
- 22.3 RLVR Adds Systems Outside the Learner 127
- 22.4 Supervised and Routed Token Rates Measure Different Work 127
- 23 Related MoE Systems Make Different Trade-Offs 127
- 23.1 Conditional Compute Shifts Work to Systems 127
- 23.2 Token and Weight Movement Costs Differ 128
- 23.3 Route Representations Trade Compactness for Regularity 129
- 23.4 Placement Determines Replica Groups 129
- 23.5 Conversion Costs and Communication-Compute Interference 130
- 23.6 Expert Placement Connects Token Movement and Updates 130
- 24 Conclusion 130
- 24.1 Reducing Costs That Repeat Across the Step 131
- 24.2 What the Measurements Do and Do Not Establish 131
- 24.3 Precision, Memory, and Scheduling Interact 131
- 24.4 What Carries Forward 132
- Acknowledgments 132
- Appendices 133
- A Kernel Interfaces and Profiling Reference 133
- A.1 Rowwise Dispatch and Combine Use PUT/GET 133
- A.2 Rowwise Wrappers Enforce Runtime Requirements 134
- A.3 CUDA/NVSHMEM Kernels Operate per Route 134

<!-- page 8 of 168 -->

- A.4 FP8 Transport Requires Compatible Layouts . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 134
- A.5 Blackwell MXFP8 Uses Block-Scaled Tensor Core MMA . . . . . . . . . . . . . . . . . . . . . . . . . . . 135
- A.6 Availability of Device-Side Grouped GEMM . . . . . . . . . . . . . . . . . . . . . . . . . . 135
- A.7 Common Grouped-GEMM Shapes in Training . . . . . . . . . . . . . . . . . . . . . . . . . 136
- A.8 Equal Compute Can Require More HBM Traffic . . . . . . . . . . . . . . . . . . . . . . . . . 137
- A.9 The Maximum Load Does Not Specify the Expert Histogram . . . . . . . . . . . . . . . . . . . 139
- A.10 Grouped-GEMM Capacity Benchmark Details . . . . . . . . . . . . . . . . . . . . . 139
- A.11 Matched Grouped-Dense Projection Benchmark . . . . . . . . . . . . . . . . . . . 140
- A.12 Very Large Grouped GEMMs Enter a Power-Limited Clock Regime . . . . . . . . . . . . . 140
- A.13 Grouped Kernels Accept Managed Buffers . . . . . . . . . . . . . . . . . 141
- A.14 Fused FP8 Autograd Saves the Values Needed by Backward . . . . . . . . . . . . . . 142
- A.15 Some Kernel Prototypes Are Not Integrated . . . . . . . . . . . . . . . 143
- A.16 Kernel Profiles Separate Transport and Compute Costs . . . . . . . . . . . . . 143
- B Reproducible Experiment Configurations and Metrics 143
- B.1 Audited Hardware and Software . . . . . . . . . . . . . . . . . . . . . . . . 143
- B.2 Audited Workload Roles . . . . . . . . . . . . . . . . . . . . 144
- B.3 The Main FSDP Comparison Uses Full Resharding . . . . . . . . . . . . . . 144
- B.4 Reduced Profiling Changes the Workload . . . . . . . . . . . . 144
- B.5 Captured Submission-Regime Profiles . . . . . . . . . . . . . . 145
- B.6 Verifying the Sync-Free Path . . . . . . . . . . . . . 145
- B.7 Checkpoint-Branched LBL-Coefficient Runs . . . . . . . . . . . . 147
- B.8 Batch-Size Warmup Run . . . . . . . . . . . . 148
- B.9 Experiment Artifact Contents . . . . . . . . . . . . 148
- B.10 Production-Throughput Run Details . . . . . . . . . . . 149
- B.11 Metrics Track Useful Work, Time, and Memory . . . . . . . . . . . 150
- C Glossary of Parallelism, Routing, and Training Storage 151
- C.1 Parallel Dimensions and Mesh Axes . . . . . . . . . . . . . 151
- C.2 Model Capacity and Routing Quantities . . . . . . . . . 152
- C.3 Runtime Buffers and Reuse Terms . . . . . . . . . 152
- C.4 Optimizer and Checkpoint Terms . . . . . . . 153
- D System Method Trade-Off Matrix 153
- E Expert-Merge Normalization in Public MoE Models 155
- F Context Parallelism and MoE Parallel Folding 155
- G Author Contributions 157
- G.1 Use of AI Tools . . . . . . . . . . . . . 157
- References 158

<!-- page 9 of 168 -->

## Part I · 第一部分

## Introduction

## 1 Why the Dense Training Assumptions Break · dense 训练的前提为何失效

## 1.1 Mixture of Experts (MoE): Sparse Activation · MoE: 稀疏激活

**MoE separates total and active parameters.** In a dense Transformer block (Vaswani et al., 2017), every token—one position in the input sequence—is processed by the same feed-forward network (FFN). Making that FFN larger gives the model more capacity and increases computation for every token. MoE adds parameter capacity while using only a subset of it for each token.

**MoE 把总参数和激活参数分开.** 在 dense Transformer 块 (Vaswani et al., 2017) 里, 每个 token (输入序列中的一个位置) 都由同一个前馈网络 (FFN) 处理. 把 FFN 做大, 模型容量变大, 每个 token 的计算量也随之增加. MoE 增加参数容量, 但每个 token 只用其中一部分.

![Image block](images/p09-figure-1-moe-and-dense-transformer-blocks-both-blocks.jpg)

Figure 1 MoE and Dense Transformer blocks. Both blocks retain attention and residual connections. The dense block (right) applies the same feed-forward network to every token. The MoE block (left) illustrates one token routed to $K = 2 { \mathrm { ~ o f ~ } } N = 4$ routed experts—experts 0 and 2 in this example—and combines their outputs with an optional always-active shared expert before the residual addition. Here, $K = 2$ is a per-token choice. Other tokens can select different experts, so a training batch can collectively use all N experts.

<!-- page 10 of 168 -->

MoE changes this part of the block. Instead of one FFN, an MoE layer contains a pool of separately parameterized FFNs called **experts**. A small learned **router**, or gate, decides which experts should process each token.

MoE 改的就是块里的这一部分. MoE 层不再只有一个 FFN, 而是有一组各自独立参数化的 FFN, 称为 **专家** (expert). 一个可学习的小 **router** (也叫 gate) 决定每个 token 交给哪些专家处理.

**Each token selects a few experts.** The router scores the N available experts and chooses the top K. The runtime sends—or **dispatches**—the token’s vector to those selected experts. Each selected expert applies its FFN to the vector. The router supplies a combination weight for each selected expert, and the **combine** operation multiplies the expert outputs by those weights, sums them, and restores the result to the token’s original sequence position. The router and experts learn together with the rest of the model. This sparsegated pattern was established by early large-scale MoE work and later simplified by the Switch Transformer (Shazeer et al., 2017; Fedus et al., 2022).

**每个 token 选几个专家.** router 给 N 个可用专家打分, 选出得分最高的 K 个. 运行时把这个 token 的向量发送 (即 **dispatch**) 给被选中的专家. 每个被选中的专家对该向量做一次 FFN. router 为每个被选中的专家给出一个组合权重, **combine** 操作把专家输出乘上这些权重后求和, 再把结果放回 token 在序列中原来的位置. router 和专家与模型其余部分一起训练. 这种稀疏门控的模式由早期的大规模 MoE 工作确立, 后来由 Switch Transformer 简化 (Shazeer et al., 2017; Fedus et al., 2022).

For token representation $x _ { t } ,$ let $S _ { t }$ be the selected expert set, let $p _ { t , e }$ be expert e’s combination weight, and let $f _ { e }$ be that expert’s FFN. Then

设 token 表示为 $x _ { t }$, $S _ { t }$ 是被选中的专家集合, $p _ { t , e }$ 是专家 e 的组合权重, $f _ { e }$ 是该专家的 FFN. 则

$$
y _ {t} ^ {\text {routed}} = \sum_ {e \in S _ {t}} p _ {t, e} f _ {e} (x _ {t}), \quad | S _ {t} | = K \ll N.\tag{1}
$$

Some MoE blocks also include a **shared expert**, an FFN that every token uses alongside its selected routed experts. Attention, embeddings, normalization, the router, and any shared expert also remain active when most routed experts do not. And because the router’s choices depend on the input, experts do not necessarily receive equal numbers of tokens. Training systems use load-balancing objectives and capacity limits to keep one expert from becoming an unbounded hotspot (Shazeer et al., 2017; Fedus et al., 2022; Dai et al., 2024)

有些 MoE 块还带一个 **共享专家** (shared expert): 每个 token 除了经过自己选中的 routed 专家, 都还要经过这个 FFN. 大多数 routed 专家不激活时, 注意力, embedding, 归一化, router 以及共享专家 (如果有) 仍然处于激活状态. 另外, router 的选择取决于输入, 所以各专家收到的 token 数不一定相等. 训练系统用负载均衡目标和容量上限, 防止某个专家变成没有上限的热点 (Shazeer et al., 2017; Fedus et al., 2022; Dai et al., 2024).

Consider a layer with $N = 1 2 8$ routed experts and $K = 4$ . The model has 128 routed expert FFNs, yet a single token uses only four of them. We therefore distinguish the model’s total parameter count from the number of parameters active for one token.

考虑一层有 $N = 1 2 8$ 个 routed 专家, $K = 4$. 模型有 128 个 routed 专家 FFN, 单个 token 却只用其中 4 个. 因此我们区分模型的总参数量和单个 token 激活的参数量.

## Sparse Capacity Without Dense Computation · 稀疏容量, 不需要 dense 计算量

Here, N is the total number of routed experts and K is the number selected for one token. Let $P _ { \mathrm { a l w a y s } }$ denote the parameters used by every token—attention, embeddings, routers, norms, shared experts, and the language-model output head—and let $P _ { \mathrm { e x p e r t } }$ denote the parameters in one routed expert. In a simplified per-token accounting,

这里 N 是 routed 专家总数, K 是一个 token 选中的专家数. 记 $P _ { \mathrm { a l w a y s } }$ 为每个 token 都会用到的参数 (注意力, embedding, router, 归一化, 共享专家和语言模型输出头), $P _ { \mathrm { e x p e r t } }$ 为单个 routed 专家的参数. 按简化的单 token 口径,

$$
\begin{array}{c} P _ {\mathrm{total}} = P _ {\mathrm{always}} + N P _ {\mathrm{expert}}, \\ P _ {\mathrm{active}} = P _ {\mathrm{always}} + K P _ {\mathrm{expert}}. \end{array}\tag{2}
$$

We use two activation ratios:

我们使用两个激活比例:

$$
\begin{array}{l l} \alpha_ {E} = \frac {K}{N} & \text {(expert activation ratio)}, \\ \alpha_ {P} = \frac {P _ {\text {active}}}{P _ {\text {total}}} & \text {(parameter activation ratio)}. \end{array}\tag{3}
$$

In the N = 128, K = 4 example, a token uses 3.125% of the routed experts—not 3.125% of the whole model, because the always-active path still participates. Holding expert shape fixed, routed capacity grows with $N ,$ while routed expert computation per token grows with K.

在 N = 128, K = 4 的例子里, 一个 token 用到 3.125% 的 routed 专家, 但用到的并不是整个模型的 3.125%, 因为始终激活的那部分路径仍然参与计算. 专家形状固定时, routed 容量随 $N$ 增长, 每个 token 的 routed 专家计算量随 K 增长.

This per-token accounting only approximates total model FLOPs, because attention, routing, shared branches, and auxiliary work also contribute. Sparse activation still allows substantially more parameter capacity without a proportional increase in per-token computation. Different token paths may also encourage experts to learn different functions, although useful specialization is neither guaranteed nor assigned by hand.

这种按 token 计的口径只能近似模型总 FLOPs, 因为注意力, 路由, 共享分支和辅助计算也有贡献. 尽管如此, 稀疏激活仍能在单 token 计算量不按比例增长的前提下, 大幅增加参数容量. token 走不同路径, 也可能促使各专家学到不同的功能, 不过有用的专业分工既没有保证, 也不是人工指定的.

**Models are getting larger—and sparser.** A visible design trend among recent high-capacity MoEs is to grow total expert capacity faster than the active parameter count. The cleanest evidence comes from comparisons within one model family: from DeepSeek-V3 to DeepSeek-V4-Pro, and from Qwen3-235B-A22B to Qwen3.5-397B-A17B, total parameters grow substantially while the active count grows far less or even

<!-- page 11 of 168 -->

falls, so the advertised parameter activation ratio drops (DeepSeek-AI et al., 2024, 2026; Yang et al., 2025; Qwen Team, 2026b).

**模型在变大, 也在变稀疏.** 近期的大容量 MoE 有一个明显的设计趋势: 专家总容量的增长快于激活参数量. 最干净的证据来自同一模型家族内部的对比: 从 DeepSeek-V3 到 DeepSeek-V4-Pro, 从 Qwen3-235B-A22B 到 Qwen3.5-397B-A17B, 总参数大幅增长, 激活参数增长少得多, 甚至下降, 于是公布的参数激活比例在下降 (DeepSeek-AI et al., 2024, 2026; Yang et al., 2025; Qwen Team, 2026b).

| Model and primary source | Year | RouteNd/eKxpert | s <sup>α</sup><sub>E</sub> | Ptaortaalm/aecttievers | αP |
| --- | --- | --- | --- | --- | --- |
| Mixtral 8x7B (Jiang et al., 2024a; Mistral AI Team, 2023) | 2023 | 8/2 | 25.0% | 47B/13B | 27.7% |
| DBRX (Databricks AI Research Team, 2024) | 2024 | 16/4 | 25.0% | 132B/36B | 27.3% |
| Snowflake Arctic (Snowflake AI Research, 2024) | 2024 | 128/2 | 1.56% | 480B/17B | 3.54% |
| OLMoE-1B-7B (Muennighoff et al., 2024) | 2024 | 64/8 | 12.5% | 6.9B/1.3B | 18.8% |
| DeepSeek-V3 (DeepSeek-AI et al., 2024) | 2024 | 256/8 +1S | 3.13% | 671B/37B | 5.51% |
| Qwen3-235B-A22B (Yang et al., 2025) | 2025 | 128/8 | 6.25% | 235B/22B | 9.36% |
| Llama 4 Maverick (Meta AI, 2025) | 2025 | 128/1 +1S | 0.78% | 400B/17B | 4.25% |
| gpt-oss-20b (OpenAI, 2025) | 2025 | 32/4 | 12.5% | 20.91B/3.61B | 17.3% |
| gpt-oss-120b (OpenAI, 2025) | 2025 | 128/4 | 3.13% | 116.8B/5.13B | 4.39% |
| DeepSeek-V4-Pro (DeepSeek-AI et al., 2026) | 2026 | 384/6 +1S | 1.56% | 1.60T/49B | 3.06% |
| Gemma 4 26B A4B (Gemma Team, 2026) | 2026 | 128/8 +1S | 6.25% | 25.2B/3.8B | 15.1% |
| GLM-5 (GLM-5 Team et al., 2026) | 2026 | 256/8 +1S | 3.13% | 744B/40B | 5.38% |
| Kimi K2.5 (Moonshot AI, 2026) | 2026 | 384/8 +1S | 2.08% | 1.00T/32B | 3.20% |
| MiMo-V2.5-Pro (Xiaomi MiMo Team, 2026) | 2026 | 384/8 | 2.08% | 1.02T/42B | 4.12% |
| MiniMax-M3 (MiniMax, 2026) | 2026 | 128/4 +1S | 3.13% | ∼428B/∼23B | ∼5.37% |
| Nemotron 3 Ultra (NVIDIA, 2026g) | 2026 | 512/22 +1S | 4.30% | 550B/55B | 10.0% |
| Qwen3.5-397B-A17B (Qwen Team, 2026b) | 2026 | 512/10 +1S | 1.95% | 397B/17B | 4.28% |
| Qwen3.5-35B-A3B (Qwen Team, 2026a) | 2026 | 256/8 +1S | 3.13% | 35B/3B | 8.57% |
| GLM-5.2 (Z.ai, 2026) | 2026 | 256/8 +1S | 3.13% | 744B/40B | 5.38% |
| Kimi K3 (Kimi Team, 2026) | 2026 | 896/16 +2S | 1.79% | 2.80T/104B | 3.71% |

For the routed language models they study, Clark et al. (2022) show that total parameter count and pertoken computation form distinct scaling axes. Fitted scaling laws for fine-grained MoEs further predict that compute-optimal MoE configurations reach lower validation loss than dense Transformers at the same training-FLOP budget, with the predicted advantage widening at larger budgets (Ludziejewski et al., 2024). Yet more sparsity is not automatically better: the best sparsity level depends on constraints such as total parameter count and training compute (Abnar et al., 2025). These results indicate that well-configured MoEs can improve the compute–quality frontier, although a given MoE need not beat a dense model at matched FLOPs.

Clark et al. (2022) 在他们研究的路由式语言模型上表明, 总参数量和单 token 计算量是两条不同的 Scaling 轴. 针对细粒度 MoE 拟合的 Scaling Laws 进一步预测: 在相同训练 FLOP 预算下, 算力最优的 MoE 配置能达到比 dense Transformer 更低的验证 loss, 而且预算越大, 预测的优势越大 (Ludziejewski et al., 2024). 但稀疏度并不是越高越好: 最佳稀疏度取决于总参数量, 训练算力等约束 (Abnar et al., 2025). 这些结果说明, 配置得当的 MoE 可以推进算力与质量的前沿, 但具体某个 MoE 在 FLOPs 相同时不一定能胜过 dense 模型.

## 1.2 Lower FLOPs Do Not Guarantee Lower Wall Time · FLOPs 更低不等于墙钟时间更短

Useful model FLOPs account for arithmetic but leave out much of the work required to train an MoE. The training system must also move weights and token activations, synchronize ranks, and absorb load imbalance. Those costs determine how many GPU-hours it actually takes to reach the desired quality.

有效模型 FLOPs 只统计算术运算, 训练 MoE 所需的很多工作并不在内. 训练系统还要搬运权重和 token 激活, 在 rank 之间同步, 还要消化负载不均衡. 这些成本决定了实际要花多少 GPU 小时才能达到目标质量.

Let F be the useful model FLOPs needed to reach a declared training or quality target, R the realized throughput in useful model FLOPs per GPU-hour under the same accounting convention, and H the GPU-hours consumed. We compare the GPU-hours required by MoE with those required by dense training to reach the same target:

设 F 为达到给定训练目标或质量目标所需的有效模型 FLOPs, R 为同一统计口径下每 GPU 小时实际完成的有效模型 FLOPs (即实际吞吐), H 为消耗的 GPU 小时. 我们比较 MoE 与 dense 训练达到同一目标所需的 GPU 小时:

$$
\rho_ {H} \equiv \frac {H _ {\mathrm{MoE}}}{H _ {\mathrm{dense}}} = \frac {F _ {\mathrm{MoE}}}{F _ {\mathrm{dense}}} \frac {R _ {\mathrm{dense}}}{R _ {\mathrm{MoE}}}.\tag{4}
$$

Here $\rho _ { H } < 1$ means MoE uses fewer GPU-hours than dense training; for example, $\rho _ { H } = 0 . 5$ means half as many. For runs using the same number of GPUs, $\rho _ { H }$ is also the elapsed wall-time ratio.

$\rho _ { H } < 1$ 表示 MoE 比 dense 训练用的 GPU 小时少; 例如 $\rho _ { H } = 0 . 5$ 表示只用一半. GPU 数相同时, $\rho _ { H }$ 也就是墙钟时间之比.

<!-- page 12 of 168 -->

BF16 | 64 experts, top-4

Same FLOPs, more HBM traffic

The first factor captures **algorithmic efficiency**: a smaller $F _ { \mathrm { M o E } } / F _ { \mathrm { d e n s e } }$ means fewer useful FLOPs are needed to reach the target. The scaling results above suggest that a well-configured MoE can reduce this factor in the regimes they study. The second factor captures the **throughput penalty**: when MoE sustains lower useful-FLOP throughput than dense training, $R _ { \mathrm { d e n s e } } / R _ { \mathrm { M o E } } > 1$ . This penalty can erase the algorithmic gain (Figure 3).

第一个因子刻画 **算法效率**: $F _ { \mathrm { M o E } } / F _ { \mathrm { d e n s e } }$ 越小, 达到目标所需的有效 FLOPs 越少. 上面的 Scaling 结果表明, 在它们研究的范围内, 配置得当的 MoE 能压低这个因子. 第二个因子刻画 **吞吐惩罚**: MoE 能维持的有效 FLOP 吞吐低于 dense 训练时, $R _ { \mathrm { d e n s e } } / R _ { \mathrm { M o E } } > 1$. 这个惩罚可能把算法上的收益抵消掉 (Figure 3).

**Equal FLOPs can require more HBM traffic.** Compared with a dense FFN of equal active compute, an MoE reads more weights from high-bandwidth memory (HBM), each reused by fewer tokens. Materialized top-K routes also give grouped GEMM K input rows and K final output rows per original token; combine happens after those outputs are written. A **roofline** estimates the throughput ceiling imposed by arithmetic and HBM traffic (Austin et al., 2025). Figure 2 shows how the extra bytes lower MoE’s modeled ceiling at small batches, even before routing or communication time is added. More tokens per expert amortize the weight reads: both curves eventually reach the same compute ceiling. Appendix A.8 derives the comparison; Section 9.6 measures how actual kernel efficiency changes with rows per expert.

**FLOPs 相同, HBM 流量可能更大.** 与激活计算量相同的 dense FFN 相比, MoE 要从 HBM 读更多权重, 而每份权重被更少的 token 复用. top-K 路由展开之后, 每个原始 token 在 grouped GEMM 里对应 K 个输入行和 K 个最终输出行; combine 在这些输出写回之后才发生. **roofline** 模型根据算术量和 HBM 流量估计吞吐上限 (Austin et al., 2025). Figure 2 显示, 即使还没算上路由和通信时间, 多出来的字节也会在小 batch 时压低 MoE 的理论上限. 每个专家分到的 token 越多, 权重读取就摊得越薄: 两条曲线最终都会到达同一个计算上限. 附录 A.8 推导这一对比; 第 9.6 节测量实际 kernel 效率如何随每个专家的行数变化.

![Image block](images/p12-figure-2-equal-flops-do-not-imply-equal-hbm.jpg)

![Image block](images/p12-figure-2-equal-flops-do-not-imply-equal-hbm-2.jpg)

> 图注: figure 2 equal flops do not imply equal hbm 2.

Analytical HBM model, not measured throughput. Up+gate and down GEMMs only; excludes activation and routing costs.

**Figure 2 Equal FLOPs do not imply equal HBM traffic.** The forward fused up/gate and down GEMMs of a dense FFN with hidden width Kh are compared with N experts of hidden width $h ,$ selecting K per token. Here $N = 6 4$ K = 4, and input and expert hidden widths are $d = h = 4 0 9 6$ . **(a)** GEMM-side HBM byte categories, each normalized separately to dense. These ratios are not additive: each category contributes according to its absolute byte volume, not equally. The intermediate row counts up/gate output writes and down input reads, excluding the pointwise activation’s own accesses. **(b)** Analytical ceilings in bfloat16 (BF16), normalized to peak FLOPs, with balanced routes and one HBM read/write per operand/result. Each curve adds the two GEMM times; pointwise activation, packing, combine, network, and backward costs are excluded. Conceptual illustration with no measured quantities; assumptions are detailed in Appendix A.8.

**Model FLOPs utilization (MFU)** reports useful model throughput as a fraction of a stated hardware peak (Chowdhery et al., 2023). Our complete-step results in Section 14 use the B300’s dense BF16 Tensor Core peak as a common denominator (NVIDIA, 2026r), including for MXFP8 runs; those values are not utilization of the FP8 peak. Appendix B.11 gives the accounting.

**模型 FLOPs 利用率 (MFU)** 表示有效模型吞吐占某个给定硬件峰值的比例 (Chowdhery et al., 2023). 第 14 节的整步结果统一用 B300 的 dense BF16 Tensor Core 峰值作分母 (NVIDIA, 2026r), MXFP8 运行也一样; 这些数值不是相对 FP8 峰值的利用率. 统计口径见附录 B.11.

An expert unused by one token contributes no expert arithmetic for that token, but its parameters and optimizer states still consume memory. Depending on the parallelization method, gradient reduction and weight synchronization can also scale with total expert capacity. Expert placement determines how far a routed token must travel. Routing itself adds work: count assignments, enforce capacity, move or permute token rows, run experts on the devices that store them, restore token order, and cope with imbalance. Useful model-FLOP accounting excludes most of this work.

某个 token 没用到的专家, 不会为这个 token 贡献专家算术, 但它的参数和优化器状态照样占显存. 视并行方式而定, 梯度归约和权重同步也可能随专家总容量增长. 专家放在哪里, 决定了被路由的 token 要走多远. 路由本身还会增加工作: 统计分配数, 执行容量限制, 搬运或重排 token 行, 在存放专家的设备上执行专家, 恢复 token 顺序, 应对负载不均衡. 有效模型 FLOPs 的统计口径把这些工作大多排除在外.

<!-- page 13 of 168 -->

![Image block](images/p13-efficient-infrastructure-preserves-the-compute-frontier-in-wall.jpg)

> 图注: efficient infrastructure preserves the compute frontier in wall.

Efficient infrastructure preserves the compute frontier in wall time

![Image block](images/p13-figure-3-a-flop-advantage-can-shrink-or-survive.jpg)

Figure 3 A FLOP advantage can shrink or survive in wall time. This illustrative, simplified comparison uses two power-law-shaped loss traces that run for 10,000 equal-token steps and end at the same loss. Panel (a) assigns the 3.5B-active/13B-total MoE a normalized useful-FLOP cost of 1 per step, versus 2 for the 7B dense model. Panel (b) maps the same MoE loss samples onto two hypothetical runtimes: normalized wall-time costs of 1.85 for inefficient infrastructure and 1.2 for optimized infrastructure, versus 2 for dense. The corresponding time-to-target advantages are only 2/1.85 ≈ 1.08× and 2/1.2 ≈ 1.67×. All costs and loss curves are illustrative assumptions, not measurements or predictions for an Olmo run.

We observed low realized throughput in two early development baselines. One used a straightforward MoE configuration in Megatron-LM, NVIDIA’s distributed Transformer training framework (Shoeybi et al., 2019).<sup>1</sup> The other used the legacy MoE path in Olmo-core, Ai2’s training library for the Olmo model family; that path inherited fully sharded data parallel (FSDP), the parameter-sharding mechanism used for dense Olmo 3 training (Team Olmo et al., 2025) and described in Section 4. Both suggested that low realized throughput could consume much of the advantage predicted by active-FLOP accounting.

我们在早期开发阶段的两个基线里都看到实际吞吐偏低. 一个是 Megatron-LM (NVIDIA 的分布式 Transformer 训练框架, Shoeybi et al., 2019) 里一套直接的 MoE 配置.<sup>1</sup> 另一个是 Olmo-core (Ai2 为 Olmo 模型家族开发的训练库) 里的旧 MoE 路径; 这条路径沿用了 FSDP, 也就是 dense Olmo 3 训练所用的参数分片机制 (Team Olmo et al., 2025), 第 4 节会介绍. 两个基线都表明, 实际吞吐偏低会吃掉按激活 FLOPs 估算的大部分优势.

A controlled eight-layer experiment reproduces the Olmo-side slowdown. Figure 4 holds top-K and active size nearly fixed while increasing total routed-expert capacity.<sup>2</sup> The legacy FSDP-based path loses throughput as total capacity grows, even though useful expert arithmetic per token stays nearly constant. The new distributed data parallel (DDP; Section 4) path with expert parallelism (EP; Section 5) degree 8 retains most of its dense throughput across the same capacity range. Active-FLOP accounting alone does not predict this difference.

一个受控的八层实验复现了 Olmo 这边的变慢. Figure 4 固定 top-K, 激活规模基本不变, 只增加 routed 专家的总容量.<sup>2</sup> 基于 FSDP 的旧路径随总容量增长而掉吞吐, 尽管每个 token 的有效专家算术几乎不变. 新的 DDP (第 4 节) 路径配合 8 路 EP (第 5 节), 在同样的容量范围内保住了 dense 吞吐的大部分. 只看激活 FLOPs 预测不出这个差别.

Figure 4 compares the old FSDP-based Olmo training stack with the new DDP+EP stack, changing several components together. It therefore does not isolate the benefit of DDP or EP alone, or rank Olmo against other training frameworks. It motivates the systems question pursued by this report: which costs continue to grow with total expert capacity, and how the training stack can keep them from dominating wall time.

Figure 4 比较的是基于 FSDP 的旧 Olmo 训练栈和新的 DDP+EP 训练栈, 两者之间同时改了多个组件. 所以它既不能单独说明 DDP 或 EP 各自的收益, 也不能拿来给 Olmo 和其他训练框架排名. 它引出了本报告要回答的系统问题: 哪些成本会随专家总容量继续增长, 训练栈又该怎样不让它们主导墙钟时间.

## From FLOPs to GPU-Hours · 从 FLOPs 到 GPU 小时

An MoE’s lower useful-FLOP requirement reduces GPU-hours only if its realized throughput is high enough to preserve that advantage.

MoE 所需的有效 FLOPs 更少, 但只有实际吞吐足够高, 保住这份优势, GPU 小时才会真的减少.

<sup>1</sup>This observation concerns a specific earlier Megatron-LM configuration, not current Megatron-Core. The recent Megatron-Core MoE report documents DeepEP and HybridEP token-dispatch backends, overlap of expert-parallel communication with computation from adjacent microbatches, and reduced-precision training in FP8 and FP4 (Yan et al., 2026).

<sup>1</sup>这一观察针对的是早先某个特定的 Megatron-LM 配置, 不是现在的 Megatron-Core. 最近的 Megatron-Core MoE 报告介绍了 DeepEP 和 HybridEP 两种 token dispatch 后端, 把 EP 通信与相邻 microbatch 的计算重叠, 以及 FP8 和 FP4 低精度训练 (Yan et al., 2026).

<sup>2</sup>For this illustrative systems comparison, all MoE runs use random routing to approximate balanced expert loads. Production routing is data-dependent and generally less balanced, so its throughput can be lower than this idealized case.

<sup>2</sup>在这个示意性的系统对比里, 所有 MoE 运行都用随机路由来近似专家负载均衡. 生产环境的路由依赖数据, 通常没这么均衡, 所以吞吐可能低于这种理想情况.

<!-- page 14 of 168 -->

![Image block](images/p14-figure-4-throughput-as-total-expert-capacity-grows-at.jpg)

Figure 4 Throughput as total expert capacity grows at nearly fixed active FLOPs. These preliminary measurements use an eight-layer bfloat16 (BF16) model on one 8×B300 node without pipeline parallelism (PP; Section 6); MoE uses top-4 routing, and the new MoE path uses EP8. The old, dense-oriented FSDP path loses throughput as total expert capacity grows, whereas the new $DDP+EP$ path keeps MoE throughput within a modest margin of its dense baseline. This is a composed-system result, not an isolated FSDP-versus-DDP or EP ablation.

## 1.3 Sparse Routing Breaks the Dense Training Assumptions · 稀疏路由打破 dense 训练的前提

**Training cost includes useful model work and systems overhead.** To organize the costs of an optimizer step, we use the following reference accounting:

**训练成本包括有效模型计算和系统开销.** 为了梳理一个优化器步的成本, 我们用下面的参考口径:

$$
T _ {\mathrm{step}} = T _ {\mathrm{model}} + T _ {\mathrm{tax}}.\tag{5}
$$

Table 2 lists the work included in each term. $T _ { \mathrm { m o d e l } }$ is an ideal reference time for the prescribed forward and backward work at the hardware peaks for the precisions actually used, not the common BF16 normalization used for MFU. $T _ { \mathrm { t a x } }$ is the remaining elapsed time, including execution below those peaks and exposed overhead. The table identifies sources of that overhead, not independent profiler durations to add together: communication and computation can overlap. **Activation rematerialization**, or recompute, discards selected forward activations and recomputes them for the backward pass instead of keeping them in memory. It adds executed FLOPs without increasing useful model FLOPs, and a recomputed routed block can also repeat dispatch and combine (Section 13). In a well-tuned dense stack, large, regular model computations usually keep these costs in a workable balance. In MoE, useful computation follows the active parameters, while much of the tax follows total capacity or routed token assignments. Infrastructure built around dense assumptions can therefore let the tax dominate. The systems goal is to lower it until fewer useful FLOPs also mean less wall time.

Table 2 列出每一项包含的工作. $T _ { \mathrm { m o d e l } }$ 是一个理想参考时间: 按实际所用精度对应的硬件峰值, 完成规定的前向和反向计算所需的时间; 它不用 MFU 那种统一按 BF16 归一的口径. $T _ { \mathrm { t a x } }$ 是剩下的耗时, 包括执行效率低于峰值的部分和暴露在外的开销. 表里列的是这些开销的来源, 不是可以直接相加的独立 profiler 时长: 通信和计算可以重叠. **激活重物化** (activation rematerialization, 即 recompute) 丢掉部分前向激活, 到反向时再重算, 而不是一直留在显存里. 它增加实际执行的 FLOPs, 但不增加有效模型 FLOPs; 重算一个 routed 块时, dispatch 和 combine 也可能再做一遍 (第 13 节). 在调好的 dense 训练栈里, 规模大且规整的模型计算通常能让这些成本保持在可接受的比例. 在 MoE 里, 有效计算跟着激活参数走, 很多税却跟着总容量或 routed token 的分配走. 所以按 dense 前提搭建的基础设施可能让税占主导. 系统层面的目标, 是把税压到足够低, 让更少的有效 FLOPs 也意味着更短的墙钟时间.

## 1.3.1 Capacity Tax · 容量税

**Dense compute can amortize parameter-sized work.** In a dense model, $P _ { \mathrm { a c t i v e } } \: = \: P _ { \mathrm { t o t a l } } ;$ adding parameters increases the forward and backward arithmetic performed for every token as well as the parameters, gradients, and optimizer buffers that must be stored, reduced, or updated. The tax does not disappear, but it grows in step with useful model computation.

**dense 计算能摊薄与参数量同阶的工作.** 在 dense 模型里 $P _ { \mathrm { a c t i v e } } = P _ { \mathrm { t o t a l } }$; 增加参数, 每个 token 的前向和反向算术量会增加, 需要存储, 归约或更新的参数, 梯度和优化器缓冲区也会增加. 税不会消失, 但它和有效模型计算同步增长.

In MoE, the two no longer grow together. Sparse routing lets total expert capacity grow while each token continues to execute only its selected experts. We call the following dimensionless ratio, compared at fixed token count, execution schedule, and hardware, the **capacity-to-active gap**:

在 MoE 里, 两者不再同步增长. 稀疏路由让专家总容量增长, 而每个 token 仍只执行自己选中的专家. 在 token 数, 执行调度和硬件都固定的条件下, 我们把下面这个无量纲比值称为 **容量-激活差距** (capacity-to-active gap):

<!-- page 15 of 168 -->

<table><tr><td colspan="2">Component</td><td>What it includes</td><td>Dense $(P_{\text{active}} = P_{\text{total}})$ </td><td>MoE $(P_{\text{active}} \ll P_{\text{total}})$ </td></tr><tr><td colspan="2">Useful Model FLOPs</td><td>Model forward pass, excluding recomputationModel backward passCovers embeddings, attention, dense/expert MLPs, normalization, residual additions, and the LM head</td><td> $\propto P_{\text{total}}$ </td><td> $\propto P_{\text{active}}, \text{not } P_{\text{total}}$ </td></tr><tr><td rowspan="6">Tax</td><td>Gradients(§§4, 5.1)</td><td>Gradient accumulationGradient reduction</td><td> $\propto P_{\text{total}}; \propto \text{model FLOPs}$ </td><td> $\propto P_{\text{total}}; \not\propto \text{model FLOPs}$ </td></tr><tr><td>Weights(§4)</td><td>Optimizer-state updatesParameter updatesWeight synchronization or redistribution</td><td> $\propto P_{\text{total}}; \propto \text{model FLOPs}$ </td><td> $\propto P_{\text{total}}; \not\propto \text{model FLOPs}$ </td></tr><tr><td>Routing(§§5, 10)</td><td>Router decisions and countingRouter auxiliary lossesDispatch/combine communicationDispatch/combine permutations</td><td>Absent</td><td>High tax: follows EP topology</td></tr><tr><td>Compute efficiency(§§8, 9)</td><td>Small expert GEMMsUneven or fragmented grouped GEMMsSmaller microbatches due to high memory pressure</td><td>Low tax: large, regular GEMMs</td><td>Higher tax: smaller, uneven expert batches reduce realized FLOP/s</td></tr><tr><td>Recompute(§13)</td><td>Repeated forward operations to regenerate saved activationsRepeated EP communication when included in the recomputed region</td><td>Extra work set by the recompute policy</td><td>Can repeat dispatch/combine as well as expert compute</td></tr><tr><td>Indirect runtime(§§5, 8-10)</td><td>Device-host or stream synchronizationDynamic route and general matrix multiplication (GEMM) shapesLoad imbalanceExtra launches and CPU overheadTemporary buffers and memory trafficCommunication-compute contention</td><td>Absent or minimal</td><td>High tax: runtime dependent</td></tr></table>

$$
\Gamma_ {\text {capacity}} \equiv \frac {P _ {\text {total}}}{P _ {\text {active}}} = \frac {1}{\alpha_ {P}}.\tag{6}
$$

For dense models, $\Gamma _ { \mathrm { c a p a c i t y } } \; = \; 1$ For MoE, it can grow as new routed experts increase $P _ { \mathrm { t o t a l } }$ without proportionally increasing $P _ { \mathrm { a c t i v e } }$ . Related systems work observes the same decoupling between total model size and per-token work (Yan et al., 2026).

dense 模型的 $\Gamma _ { \mathrm { c a p a c i t y } } = 1$. 对 MoE, 新增的 routed 专家会增加 $P _ { \mathrm { t o t a l } }$, 而 $P _ { \mathrm { a c t i v e } }$ 不按比例增加, 所以这个比值可以不断变大. 相关的系统工作也观察到模型总规模与单 token 计算量之间同样的脱钩 (Yan et al., 2026).

We call the concrete costs that continue to follow parameter capacity the **capacity tax**. Weight and gradient storage, optimizer state, and some synchronization can grow without a matching increase in useful per-token compute. The ratio $\Gamma _ { \mathrm { c a p a c i t y } }$ only measures how far stored parameters have outgrown the parameters each token uses; how much time that separation costs depends on the implementation. As the ratio increases, parameter-sized work grows relative to the useful computation available to amortize it.

我们把那些持续跟着参数容量走的具体成本称为 **容量税**. 权重和梯度的存储, 优化器状态以及部分同步操作, 都可能在单 token 有效计算没有相应增加的情况下增长. $\Gamma _ { \mathrm { c a p a c i t y } }$ 只衡量存储的参数比每个 token 用到的参数多出多少倍; 这种差距要花多少时间, 取决于实现. 比值越大, 与参数量同阶的工作相对于能摊薄它的有效计算就越大.

**Full-reshard FSDP matches dense models better than sparse MoE.** Before model parallelism, ordinary DDP (Section 4) divides the training data while every rank stores the complete model. Adding DDP ranks therefore does not reduce per-GPU model memory. When a full dense-model replica no longer fits, dense Olmo uses FSDP to shard parameters, gradients, and optimizer state. In the **full-reshard** regime used by our comparison, FSDP all-gathers the full weights of each wrapped unit before the unit computes and

<!-- page 16 of 168 -->

frees them after each use (Zhao et al., 2023).<sup>3</sup> For a dense model, the parameters materialized for a wrapped unit also support useful computation for every token. The materialization is still a tax, but larger dense capacity brings a matching increase in useful model computation.

**full-reshard FSDP 更适合 dense 模型, 不适合稀疏 MoE.** 不加模型并行时, 普通 DDP (第 4 节) 切分训练数据, 每个 rank 都存一份完整模型. 所以增加 DDP rank 并不能降低每张 GPU 的模型显存. 完整的 dense 模型副本放不下时, dense Olmo 用 FSDP 对参数, 梯度和优化器状态做分片. 在我们对比所用的 **full-reshard** 模式下, FSDP 在每个包装单元计算之前 all-gather 它的完整权重, 每次用完就释放 (Zhao et al., 2023).<sup>3</sup> 对 dense 模型, 为一个包装单元物化出来的参数也服务于每个 token 的有效计算. 物化仍然是税, 但 dense 容量变大, 有效模型计算也会相应增加.

FSDP can make a large MoE fit as well, but its weight materialization no longer tracks useful work. In this configuration, every microbatch materializes the wrapped MoE unit’s parameter shards according to its stored expert capacity, while useful expert arithmetic follows the number of token–expert assignments. As $P _ { \mathrm { t o t a l } } / P _ { \mathrm { a c t i v e } }$ grows, weight movement can therefore grow without a proportional increase in useful model work. Full resharding solves the immediate fit problem, but its per-microbatch weight materialization becomes a substantial part of the MoE capacity tax.

FSDP 也能让大 MoE 放进显存, 但它的权重物化不再跟着有效计算走. 在这种配置下, 每个 microbatch 都按存储的专家容量物化 MoE 包装单元的参数分片, 而有效专家算术跟着 token 与专家的分配数走. 所以随着 $P _ { \mathrm { t o t a l } } / P _ { \mathrm { a c t i v e } }$ 增大, 权重搬运会增长, 有效模型计算却不按比例增加. full reshard 解决了眼前放不放得下的问题, 但它每个 microbatch 都要做的权重物化成了 MoE 容量税的一大块.

**Olmo uses DDP plus model parallelism for MoE.** The Olmo MoE design composes DDP with two forms of model parallelism: EP (Section 5) shards the routed experts, and pipeline parallelism (PP; Section 6) assigns different layers to different stages. EP and PP first make each rank’s model partition small enough to fit; DDP then synchronizes replicas of that local partition. A distributed optimizer shards the larger FP32 main weights and optimizer states, while the compute weights—the BF16 or MXFP8 (Section 11) representations read by forward and backward—remain static across the accumulation window and are refreshed once per optimizer step. Section 3 introduces the broader parallelism toolbox before the following sections develop these choices.

**Olmo 对 MoE 采用 DDP 加模型并行.** Olmo 的 MoE 设计把 DDP 和两种模型并行组合起来: EP (第 5 节) 对 routed 专家分片, PP (第 6 节) 把不同的层分给不同的 stage. EP 和 PP 先把每个 rank 的模型分片切到放得下, 再由 DDP 同步这份本地分片的各个副本. 分布式优化器对体积更大的 FP32 主权重和优化器状态做分片; compute weight (前向和反向读取的 BF16 或 MXFP8 (第 11 节) 表示) 在整个累积窗口内保持不动, 每个优化器步刷新一次. 第 3 节先介绍更完整的并行工具箱, 后面几节再逐一展开这些选择.

## FSDP Moves Weights; DDP + EP Moves Activations · FSDP 搬权重, DDP + EP 搬激活

In the full-reshard regime tested here, FSDP gathers weight shards to materialize the wrapped weights around each microbatch. In Olmo’s DDP+EP design, each rank keeps its assigned expert weights in the same GPU buffers across the accumulation window, and EP dispatches only the selected token rows to those experts. EP also exchanges activation gradients during backward. Both approaches synchronize parameter gradients across replicas. Part II develops this design.

在这里测试的 full-reshard 模式下, FSDP 在每个 microbatch 前后 gather 权重分片, 把包装单元的权重物化出来. 在 Olmo 的 DDP+EP 设计里, 每个 rank 在整个累积窗口内把分给自己的专家权重留在同一块 GPU 缓冲区里, EP 只把被选中的 token 行 dispatch 给这些专家. 反向时 EP 还要交换激活梯度. 两种方案都要在副本之间同步参数梯度. 第二部分展开这一设计.

## 1.3.2 Runtime Tax · 运行时税

**Sparse execution adds work around the expert computation.** For a fixed batch shape, a dense feedforward layer executes a predictable sequence of large, regular operations. A routed MoE layer must first decide which experts will process each token. It must then arrange and move token rows to those experts, execute the selected experts, and restore and combine their outputs. This work repeats in every routed layer and every microbatch. Sparse execution requires this work, but it is overhead around the useful expert computation.

**稀疏执行在专家计算周围增加了工作.** batch 形状固定时, dense 前馈层执行的是一串可预测的, 规模大且规整的操作. routed MoE 层先要决定每个 token 交给哪些专家. 然后要整理 token 行并搬到这些专家那里, 执行被选中的专家, 再把输出放回原位并组合. 每个 routed 层, 每个 microbatch 都要重复这些工作. 稀疏执行离不开这些工作, 但它们是围绕有效专家计算的开销.

The extra time appears in several forms. Routing requires decisions, counting, and bookkeeping. Dispatch and combine add memory movement, permutations, and, when experts are distributed, communication. Expert computation can become less efficient when the routed batches are small or uneven. Dynamic shapes and load imbalance can also introduce temporary buffers, extra kernel launches, CPU overhead, synchronization, and contention between communication and computation. The exact mixture depends on the routing decisions, the runtime implementation, and the hardware.

额外时间有几种来源. 路由阶段需要计算选择结果并统计各专家负载. dispatch 和 combine 带来显存搬运与重排, 专家分布在多卡上时还会产生通信. 路由后的 batch 小或者不均匀时, 专家计算效率会下降. 动态形状和负载不均衡还会带来临时缓冲区, 额外的 kernel 启动, CPU 开销, 同步, 以及通信与计算之间的资源争用. 具体比例取决于路由结果, 运行时实现和硬件.

We refer to these routing, compute-efficiency, and supporting runtime costs collectively as the **MoE runtime tax**. Unlike the capacity tax, it is not explained by model size alone: two batches with similar nominal model FLOPs can take different amounts of time because they route tokens differently and exercise the runtime differently. Section 5 examines token movement, Section 8 addresses host submission and synchronization, Section 9 studies expert compute efficiency, and Section 10 examines routing imbalance.

我们把路由, 计算效率以及配套运行时的这些成本统称为 **MoE 运行时税**. 与容量税不同, 它不能只用模型规模解释: 名义模型 FLOPs 相近的两个 batch, 因为 token 的路由不同, 对运行时的压力不同, 耗时也可能不同. 第 5 节考察 token 搬运, 第 8 节处理主机提交与同步, 第 9 节研究专家计算效率, 第 10 节考察路由不均衡.

3<sub>FSDP2</sub> can instead retain unsharded parameters through backward and, with no reshard after intermediate backwards, across an accumulation window (PyTorch Contributors, 2026d). That policy gives up most of full-reshard FSDP’s peak unshardedparameter memory advantage; its parameter footprint and communication cadence then approach DDP with sharded optimizer state. We treat it as a mechanism ablation, not a primary competing design. The primary comparison therefore uses full reshard; Appendix B.3 discusses the other reshard policies.

<sup>3</sup>FSDP2 也可以让未分片的参数一直保留到反向结束; 如果中间几次反向之后都不 reshard, 还能在整个累积窗口内保留 (PyTorch Contributors, 2026d). 这种策略放弃了 full-reshard FSDP 在未分片参数峰值显存上的大部分优势; 此时它的参数显存占用和通信节奏都接近带分片优化器状态的 DDP. 我们把它当作机制消融, 不当作主要的竞争方案. 所以主对比用 full reshard; 其他 reshard 策略见附录 B.3.

> 按第 4.4 节的说法, 差别不在参数是否常驻, 而在常驻之外的几件事: 同一个 MoE 模块里 dense 参数和专家参数要走不同的副本组 (第 4.4.2 节, dense 在 D 上归约, 专家只在 EP-DP 上归约), 梯度要在 FP32 桶里累积和归约 (第 4.4.1 节), MXFP8 缓存要在优化器步后从 FP32 主权重统一重建 (第 4.4.3 节). 关掉 reshard 的 FSDP2 仍然在 shard 组上做 reduce-scatter, 参数常驻的那份是 all-gather 出来的整权重, 和 Olmo 的「compute weight 常驻 + 只分片 FP32 主权重与优化器状态」在显存构成上接近, 但副本组和 dtype 的控制权在 FSDP2 手里. 报告里没给这种 FSDP2 模式与 Olmo DDP 的吞吐对比 (附录 B.3 只是讨论), 所以「接近」是否也意味着吞吐接近, 报告里没写.

<!-- page 17 of 168 -->

## Capacity and Runtime Costs · 容量成本与运行时成本

The capacity tax follows total parameter capacity; the runtime tax follows sparse routing and execution. MoE’s FLOP advantage becomes a wall-time advantage only when the training system controls both.

容量税跟着总参数容量走, 运行时税跟着稀疏路由与执行走. 只有训练系统把两者都控制住, MoE 在 FLOPs 上的优势才会变成墙钟时间上的优势.

## 1.3.3 End-to-End Optimization · 端到端优化

EP lowers the expert capacity stored and synchronized by each rank, but introduces token traffic. Recomputation lowers activation memory by repeating model work (Section 13). Reduced precision can speed up matrix multiplications and reduce communication volume, but adds conversion work and can expose launch over head. Its numerical recipe also matters: with round-ceiling scaling, MXFP8 closely follows BF16’s loss and gradient-norm trajectories over our measured checkpoint-branched continuation (Section 11.3.5, Figure 56). Overlapping communication with computation shortens the step only when the slowdown it causes in the concurrent kernels is smaller than the communication time it hides (Section 5.9). These interactions are a recurring property of MoE systems (Yan et al., 2026). The report-wide matrix in Appendix D, Figure 76, summarizes the first-order benefits and costs of the parallelism, communication, scheduling, precision, runtime, and checkpoint methods developed in the rest of this report. We place the full matrix in the appendix because many of its columns are introduced only in later sections.

EP 减少每个 rank 存储和同步的专家容量, 但带来 token 流量. recompute 以重复计算模型为代价降低激活显存 (第 13 节). 低精度能加快矩阵乘, 减少通信量, 但增加了格式转换的工作, 还可能让 kernel 启动开销暴露出来. 数值配方也很重要: 采用向上取整的缩放方式时, 在我们从 checkpoint 分叉出去的续训测量里, MXFP8 的 loss 和梯度范数轨迹与 BF16 贴得很近 (第 11.3.5 节, Figure 56). 通信与计算重叠, 只有在它拖慢并发 kernel 的时间小于它藏住的通信时间时, 才能缩短一步的耗时 (第 5.9 节). 这些相互作用在 MoE 系统里反复出现 (Yan et al., 2026). 附录 D 的 Figure 76 是一张贯穿全报告的矩阵, 汇总后文介绍的并行, 通信, 调度, 精度, 运行时和 checkpoint 方法的一阶收益与代价. 矩阵里很多列要到后面的章节才会介绍, 所以完整矩阵放在附录.

We therefore evaluate component changes by their effect on complete-step time and throughput for a given model, batch, and topology. An isolated kernel or collective speedup is insufficient to establish that effect.

因此, 我们评价组件改动的标准, 是在给定模型, batch 和拓扑下, 它对整步时间和吞吐的影响. 单个 kernel 或集合通信变快, 不足以证明这种影响.

The next section presents how these mechanisms are integrated into one end-to-end system: the Olmo-core DDP training stack.

下一节介绍这些机制如何集成为一个端到端系统: Olmo-core DDP 训练栈.

## 2 Olmo-core DDP Training Stack · Olmo-core DDP 训练栈

Dense Olmo pretraining uses the FSDP-oriented path described by Team Olmo et al. (2025). The Olmo-core DDP training stack is a separate path centered on distributed data parallel (DDP) and built for MoE. It coordinates expert placement, token movement, gradient synchronization, optimizer updates, memory use, and low-precision execution across the training step.

dense Olmo 的预训练走的是 Team Olmo et al. (2025) 介绍的以 FSDP 为中心的路径. Olmo-core DDP 训练栈是另一条独立路径, 以 DDP 为中心, 专为 MoE 打造. 它在整个训练步里统筹专家放置, token 搬运, 梯度同步, 优化器更新, 显存占用和低精度执行.

**Sparse routing adds work throughout the training step.** It adds data movement, irregular expert matrix multiplications, dynamic shapes, and CPU launch work. DDP provides the synchronization foundation; expert parallelism (EP) divides expert capacity, pipeline parallelism (PP) divides layers, and the distributed optimizer shards the FP32 main weights and optimizer states.

**稀疏路由在整个训练步里都增加了工作.** 它带来数据搬运, 不规则的专家矩阵乘, 动态形状和 CPU 启动开销. DDP 提供同步的基础; EP 切分专家容量, PP 切分层, 分布式优化器对 FP32 主权重和优化器状态做分片.

Figure 5 shows the scope of this design. Configuration and train-module orchestration sit above the MoE model, parallel runtimes, and supporting systems. A low-level software, kernel, communication, and transport layer provides their common execution substrate.

Figure 5 展示这一设计涵盖的范围. 配置和 train module 编排位于 MoE 模型, 并行运行时和配套系统之上. 底层的软件, kernel, 通信和传输层为它们提供共同的执行基础.

PyTorch provides the foundation, but its standard operators cannot remove every overhead introduced by sparse routing. Olmo-core therefore combines PyTorch with custom CUDA, C++, and Triton kernels (Tillet et al., 2019); NCCL and NVSHMEM communication (NVIDIA, 2026f,t); and CUTLASS grouped GEMM (NVIDIA, 2026m). These components run over the hardware links beneath them: NVLink within a node, InfiniBand between nodes, and PCIe between each GPU and its host. InfiniBand GPUDirect Async (IBGDA) lets GPUs initiate InfiniBand transfers directly. We design token layouts together with communication and expert computation, and low-precision formats are integrated with activation storage and transport rather than applied only to isolated GEMMs. A fast kernel is insufficient if it requires an extra permutation, a device-to-host synchronization, or a gap between launches elsewhere in the step.

PyTorch 是基础, 但它的标准算子消除不了稀疏路由带来的全部开销. 所以 Olmo-core 在 PyTorch 之外, 还组合了自研的 CUDA, C++ 和 Triton kernel (Tillet et al., 2019), NCCL 与 NVSHMEM 通信 (NVIDIA, 2026f,t), 以及 CUTLASS grouped GEMM (NVIDIA, 2026m). 这些组件运行在下层的硬件链路上: 节点内是 NVLink, 节点间是 InfiniBand, 每张 GPU 与主机之间是 PCIe. InfiniBand GPUDirect Async (IBGDA) 让 GPU 能直接发起 InfiniBand 传输. token 布局和通信, 专家计算一起设计; 低精度格式与激活存储和传输集成在一起, 而不只是用在个别 GEMM 上. 一个 kernel 再快, 如果它在步内别处要求多一次重排, 一次设备到主机的同步, 或者在两次启动之间留下空隙, 也不够用.

The preliminary capacity sweep in Figure 4 motivates this design. One composed DDP+EP8 configuration retains most of its throughput as stored expert capacity grows, whereas the FSDP-oriented baseline slows.

Figure 4 的初步容量扫描是这一设计的动机. 随着存储的专家容量增长, 一套组合起来的 DDP+EP8 配置保住了大部分吞吐, 而以 FSDP 为中心的基线变慢了.

<sup>4</sup>Olmo-core continues to support MoE through its earlier FSDP-oriented Transformer stack. We call that implementation the legacy MoE path only to distinguish it from the Olmo-core DDP stack presented here.

<sup>4</sup>Olmo-core 仍然通过早先以 FSDP 为中心的 Transformer 栈支持 MoE. 我们把那套实现称为旧 MoE 路径, 只是为了和这里介绍的 Olmo-core DDP 训练栈区分开.

<!-- page 18 of 168 -->

![Image block](images/p18-figure-5-subsystems-of-the-olmo-core-ddp-training.jpg)

Figure 5 Subsystems of the Olmo-core DDP training stack. Colors mark the layers: configuration (green) and train-module orchestration (purple) sit above the MoE model (yellow), the parallel runtimes (blue), and supporting systems (orange). Low-level libraries, kernels, communication systems, and hardware interconnects (gray) form the substrate below. The layout groups system responsibilities rather than prescribing an execution order.

The result does not isolate the contribution of DDP, EP, or any particular kernel, and it measures throughput rather than time to quality.

这个结果不能单独说明 DDP, EP 或某个具体 kernel 的贡献, 而且它测的只是吞吐, 与达到某个质量所需的时间无关.

**The same design extends to trillion-parameter configurations.** Because EP, PP, and the distributed optimizer each divide a different part of the model, the amount stored by each GPU stays bounded as the global model grows. We have run 296B-total-parameter BF16 and 1.200T-total-parameter MXFP8 configurations on 512 B300 GPUs, and an optional DeepEP v2 backend (Zhao et al., 2025b) extends the demonstrated envelope to a 2.380T-total-parameter configuration. The 2.380T figure comes from a short nine-step run and describes reachable capacity, not a sustained-throughput or time-to-quality result at that scale; Section 14 reports production throughput separately.

**同一设计可以扩展到万亿参数配置.** EP, PP 和分布式优化器各自切分模型的不同部分, 所以全局模型变大时, 每张 GPU 存储的量仍有上界. 我们在 512 张 B300 上跑过总参数 296B 的 BF16 配置和总参数 1.200T 的 MXFP8 配置; 可选的 DeepEP v2 后端 (Zhao et al., 2025b) 把已验证的范围扩展到总参数 2.380T 的配置. 2.380T 这个数来自一次只有九步的短跑, 只说明能达到的容量, 既不代表这个规模下的持续吞吐, 也不代表达到某个质量所需的时间; 生产吞吐由第 14 节单独报告.

**Measured throughput spans scales.** Section 14 reports achieved useful-model TFLOP/s/GPU for five model scales, which we name Tiny, Small, Medium, Large, and Ultra in order of size, together with the active and total parameter counts, batch, EP/PP topology, precision, and recomputation policy needed to interpret each number. The selected headline values use random routing as a systems reference and are not a controlled scaling curve or a time-to-quality comparison.

**实测吞吐覆盖多个规模.** 第 14 节报告五个模型规模的有效模型 TFLOP/s/GPU, 按大小依次命名为 Tiny, Small, Medium, Large 和 Ultra, 同时给出解读每个数字所需的激活参数量与总参数量, batch, EP/PP 拓扑, 精度和 recompute 策略. 选出来的主数字以随机路由作为系统参考, 不构成受控的扩展曲线, 也不能用来比较达到某个质量所需的时间.

Part II covers model placement, DDP synchronization, EP, PP, and their physical-network mapping. Part III covers synchronization-free execution, grouped GEMM, routing, MXFP8, checkpoint conversion, and recompute. The later findings examine training recipes and interactions observed in the complete stack.

第二部分讲模型放置, DDP 同步, EP, PP 以及它们到物理网络的映射. 第三部分讲无同步执行, grouped GEMM, 路由, MXFP8, checkpoint 转换和 recompute. 后面的发现部分考察训练配方, 以及在完整训练栈里观察到的相互作用.

<!-- page 19 of 168 -->

## Selected achieved throughput · 选取的实测吞吐

| 1.59B @ 12.9B | 4.29B @ 40.9B | 7.38B @ 137B | 15.1B @ 296B | 58.4B @ 1.20T |
| --- | --- | --- | --- | --- |
| 12.3% active | 10.5% active | 5.38% active | 5.12% active | 4.86% active |
| 903TFLOP/s | 841TFLOP/s | 843TFLOP/s | 768TFLOP/s | 858TFLOP/s |
| 40.1% MFU | 37.4% MFU | 37.5% MFU | 34.1% MFU | 38.1% MFU |
| 64 Experts | 64 Experts | 128 Experts | 128 Experts | 128 Experts |
| BF16 EP1 PP1 | BF16 EP8 PP1 | BF16 EP8 PP4 | BF16 EP8 PP4 | MXFP8 EP8 PP8 |
| Tiny | Small | Medium | Large | Ultra |

<!-- page 20 of 168 -->

## Part II · 第二部分

## Parallelization · 并行

## 3 Parallelism Methods Divide Different Work and Storage · 各种并行方法切分不同的计算与存储

Section 2 introduced the complete Olmo-core DDP stack. Part II examines its parallel methods in terms of what ranks divide, what one rank keeps during computation, and when ranks communicate (Table 3).

第 2 节介绍了完整的 Olmo-core DDP 训练栈. 第二部分从三个方面考察它的并行方法: rank 之间切分什么, 计算时单个 rank 保留什么, rank 之间什么时候通信 (Table 3).

A **rank-local model partition** is the part of the model assigned to one rank after model-parallel placement; without model parallelism, it is the full model. Model-parallel methods, namely expert parallelism (EP), pipeline parallelism (PP), and tensor parallelism (TP), decide which parameters the partition contains. Ranks that are assigned the same partition and process different training examples are **data-parallel (DP) ranks**. Data-parallel methods decide how those ranks store and synchronize the partition they share: distributed data parallel (DDP) keeps a complete copy on every DP rank, whereas fully sharded data parallel (FSDP) splits it across the DP ranks and gathers each piece when it is needed. Context parallelism (CP) divides the sequence rather than the model, while a distributed optimizer shards the FP32 main weights and optimizer states without changing forward or backward model placement.

**rank 本地模型分片** (rank-local model partition) 指按模型并行放置之后分给某个 rank 的那部分模型; 没有模型并行时, 它就是整个模型. 模型并行方法, 即 EP, PP 和张量并行 (TP), 决定分片里包含哪些参数. 分到同一个分片, 处理不同训练样本的 rank 称为 **数据并行 (DP) rank**. 数据并行方法决定这些 rank 如何存储和同步它们共享的分片: DDP 在每个 DP rank 上保留一份完整副本, FSDP 则把分片切开分散到各 DP rank 上, 需要哪一块再 gather 哪一块. 上下文并行 (CP) 切分的是序列而不是模型; 分布式优化器对 FP32 主权重和优化器状态做分片, 但不改变前向和反向时的模型放置.

For data-parallel and optimizer-sharding methods, we follow the standard definitions of DDP (Li et al., 2020), ZeRO-style distributed optimization (Rajbhandari et al., 2020), FSDP, and hybrid sharded data parallel (HSDP) (Zhao et al., 2023). For model and activation partitioning, we follow the standard definitions of EP (Lepikhin et al., 2021; Rajbhandari et al., 2022), PP (Huang et al., 2019; Narayanan et al., 2019), TP (Shoeybi et al., 2019), and CP (Jacobs et al., 2023; Liu et al., 2024).

数据并行和优化器分片方法沿用标准定义: DDP (Li et al., 2020), ZeRO 式分布式优化 (Rajbhandari et al., 2020), FSDP 和混合分片数据并行 HSDP (Zhao et al., 2023). 模型与激活的切分也沿用标准定义: EP (Lepikhin et al., 2021; Rajbhandari et al., 2022), PP (Huang et al., 2019; Narayanan et al., 2019), TP (Shoeybi et al., 2019) 和 CP (Jacobs et al., 2023; Liu et al., 2024).

**DDP and FSDP determine when compute weights move.** We start with this choice because it is the data-parallel foundation beneath EP and PP. FSDP remains a data-parallel method even though it shards stored parameters: its ranks process different data while executing the same model. EP and PP instead assign different experts or layers to different ranks.

**DDP 和 FSDP 决定 compute weight 什么时候移动.** 我们先讲这个选择, 因为它是 EP 和 PP 底下的数据并行基础. FSDP 虽然对存储的参数做分片, 仍属于数据并行方法: 它的各个 rank 处理不同的数据, 执行同一个模型. EP 和 PP 则把不同的专家或层分给不同的 rank.

In the FSDP configuration used by Section 4, each wrapped unit is gathered before its forward pass, freed afterward, gathered again before backward, and followed by gradient reduce-scatter (Zhao et al., 2023; PyTorch Contributors, 2026d). DDP instead keeps one static copy of the rank-local model partition at stable GPU locations across all microbatches that contribute to an optimizer step, then synchronizes the accumulated gradients. Here, static describes placement, not value: the optimizer still updates the weights after every successful step. This difference sets both the memory cost and the communication frequency developed in the next section. Appendix B.3 discusses other FSDP reshard policies.

在第 4 节使用的 FSDP 配置里, 每个包装单元在前向之前 gather, 前向之后释放, 反向之前再 gather 一次, 之后做梯度 reduce-scatter (Zhao et al., 2023; PyTorch Contributors, 2026d). DDP 则在构成一个优化器步的所有 microbatch 期间, 把 rank 本地模型分片的一份静态副本放在固定的 GPU 位置上, 最后同步累积的梯度. 这里的「静态」指位置, 不指数值: 每个成功的优化器步之后, 优化器仍会更新权重. 这一差别同时决定了显存成本和通信频率, 下一节展开. 其他 FSDP reshard 策略见附录 B.3.

**EP and PP make the DDP partition fit.** Olmo’s distributed optimizer shards FP32 main weights and optimizer states, EP divides routed experts, and PP divides layers. Optional CP divides long sequences when activation memory or attention work becomes limiting. Attention mixes token positions, so it is the layer CP must restructure. The routed experts process each position independently and can treat CP ranks as additional DP ranks. Olmo does not use TP. Every expert in our configurations fits on one GPU, and TP’s per-layer collectives would compete with EP for each node’s NVLink domain (Section 7).

**EP 和 PP 让 DDP 分片放得下.** Olmo 的分布式优化器对 FP32 主权重和优化器状态做分片, EP 切分 routed 专家, PP 切分层. 激活显存或注意力计算成为瓶颈时, 可选的 CP 切分长序列. 注意力会混合不同 token 位置的信息, 所以 CP 必须改造的是注意力层. routed 专家对每个位置独立计算, 可以把 CP rank 当作额外的 DP rank. Olmo 不用 TP. 我们的配置里每个专家都能放进一张 GPU, 而 TP 每层都有集合通信, 会和 EP 争抢每个节点的 NVLink 域 (第 7 节).

The rest of Part II follows this dependency. Section 4 first compares DDP with FSDP. Section 5 then explains how EP divides experts, and Section 6 explains how PP divides layers. Section 7 finally maps their composition onto the physical network.

第二部分余下内容按这个依赖顺序展开. 第 4 节先比较 DDP 和 FSDP. 第 5 节讲 EP 如何切分专家, 第 6 节讲 PP 如何切分层. 最后第 7 节把它们的组合映射到物理网络上.

Appendix F covers the optional CP path in detail. Olmo uses the Ulysses form of CP, which changes attention from a local sequence slice with all heads to the full sequence for a subset of heads, then reverses that layout after attention (Jacobs et al., 2023). The MoE layers view the same ranks along two axes, developed in Section 5: ranks along the expert-sharding axis (EP-MP) hold different routed experts, while ranks along the expert-replica axis (EP-DP) hold copies of the same experts and synchronize their gradients. The appendix also explains how Olmo maps the dense DP×CP view and this MoE view onto the same ranks through MoE parallel folding (Liu et al., 2025a). Appendix C collects the symbols and terms used across these sections.

附录 F 详细介绍可选的 CP 路径. Olmo 用的是 Ulysses 形式的 CP: 注意力的输入从「本地一段序列, 全部 head」变成「完整序列, 一部分 head」, 注意力算完再换回原布局 (Jacobs et al., 2023). MoE 层沿两条轴看待同一批 rank, 第 5 节展开: 沿专家分片轴 (EP-MP) 的 rank 持有不同的 routed 专家, 沿专家副本轴 (EP-DP) 的 rank 持有相同专家的副本并同步它们的梯度. 附录 F 还说明 Olmo 如何通过 MoE parallel folding (Liu et al., 2025a) 把 dense 的 DP×CP 视角和这个 MoE 视角映射到同一批 rank 上. 这几节用到的符号和术语汇总在附录 C.

<!-- page 21 of 168 -->

<table><tr><td>Method</td><td>What it divides</td><td>What one rank keeps during computation</td><td>When ranks communicate</td></tr><tr><td colspan="4">Data-parallel and optimizer-sharding methods</td></tr><tr><td>DDP</td><td>Input examples across DP ranks</td><td>One complete copy of the rank-local model partition</td><td>Accumulated gradients syn- chronize before each optimizer update</td></tr><tr><td>Distributed optimizer</td><td>FP32 main weights and optimizer states within a replica group</td><td>Compute weights and the local opti- mizer shard</td><td>Gradient intake, local shard update, and compute-weight re- construction once per optimizer step</td></tr><tr><td>FSDP / HSDP</td><td>Persistent training state— parameters, gradients, and optimizer data—across a shard group; HSDP repeats shard groups</td><td>Full weights for the current wrapped unit; other units remain sharded</td><td>Gather weights before each forward and backward use; free them after each use and reduce- scatter gradients in backward</td></tr><tr><td colspan="4">Model and activation partitioning</td></tr><tr><td>EP</td><td>Routed experts</td><td>The assigned expert shard; dense and shared weights follow the other axes</td><td>Dispatch and combine in each routed layer and microbatch; synchronize expert copies once per optimizer step</td></tr><tr><td>PP</td><td>Transformer layers across physical and virtual stages</td><td>The layers assigned to the local stages</td><td>Hidden activations and their gradients cross stage bound- aries for every microbatch</td></tr><tr><td>TP</td><td>Individual tensors and matrix operations</td><td>One tensor or operator shard</td><td>Activation or partial-result collectives inside each sharded layer</td></tr><tr><td>CP</td><td>Sequence positions</td><td>A local sequence slice; attention also needs keys and values from the other slices</td><td>Ring attention passes key/value blocks around the CP ranks during attention; Ulysses exchanges sequence and head slices with all-to-all before and after attention</td></tr></table>

## 4 Distributed Data Parallel · 分布式数据并行

**Sparse MoE changes the cost of parameter materialization.** In a dense model, $P _ { \mathrm { a c t i v e } } \: \simeq \: P _ { \mathrm { t o t a l } } { : }$ nearly every parameter that is materialized participates in useful computation for every token. Sparse MoE breaks that coupling. Its expert capacity grows with $P _ { \mathrm { t o t a l } }$ , while the expert arithmetic performed for one token follows $P _ { \mathrm { a c t i v e } } .$ On the FSDP path studied here, parameter materialization therefore continues to follow the rank-local parameter capacity even as useful expert work follows only the active experts, so the same gathering cost is spread over less useful work. Olmo-core changes the foundation to DDP so that the rank-local model partition, once it fits in memory, stays at a stable location across the accumulation window. A distributed optimizer, EP, and PP then reduce the persistent training-state memory—compute weights, gradient buffers, FP32 main weights, and optimizer states—that each rank must carry, so the partition fits without gathering parameters in every microbatch.

**稀疏 MoE 改变了参数物化的成本.** 在 dense 模型里 $P _ { \mathrm { a c t i v e } } \simeq P _ { \mathrm { t o t a l } }$: 几乎每个被物化的参数都参与每个 token 的有效计算. 稀疏 MoE 打破了这种耦合. 它的专家容量随 $P _ { \mathrm { t o t a l } }$ 增长, 而一个 token 做的专家算术跟着 $P _ { \mathrm { a c t i v e } }$ 走. 所以在这里研究的 FSDP 路径上, 参数物化仍跟着 rank 本地参数容量走, 有效专家计算却只跟着激活的专家走, 同样的 gather 成本被摊到更少的有效计算上. Olmo-core 把基础换成 DDP, 让 rank 本地模型分片只要放得进显存, 就在整个累积窗口内留在固定位置. 再由分布式优化器, EP 和 PP 减少每个 rank 必须携带的持久训练状态显存 (compute weight, 梯度缓冲区, FP32 主权重和优化器状态), 这样分片不需要每个 microbatch 都 gather 参数也能放得下.

This motivation is specific to sparse MoE configurations with a large gap between total and active parameters and with a rank-local partition that fits after optimizer, expert, and pipeline sharding. It is not a general argument against FSDP. Throughout this section, FSDP refers to full-reshard FSDP2; Appendix B.3 discusses FSDP configurations that keep gathered parameters instead of freeing them. Dense Olmo continues to use an FSDP/HSDP-oriented stack (Team Olmo et al., 2025). The Olmo-core DDP stack can also train dense models and can be faster when its rank-local compute-weight partition fits. Within current Olmo-core, it is also the path for fine-grained integrations such as native MXFP8. We therefore treat DDP as a second training foundation, not as an MoE-only mechanism or a universal replacement for FSDP.

这个动机只适用于特定的稀疏 MoE 配置: 总参数与激活参数差距大, 并且经过优化器, 专家和流水线分片之后, rank 本地分片放得下. 它并不构成反对 FSDP 的一般性论据. 本节的 FSDP 都指 full-reshard FSDP2; 保留 gather 出来的参数而不释放的 FSDP 配置见附录 B.3. dense Olmo 仍然使用以 FSDP/HSDP 为中心的训练栈 (Team Olmo et al., 2025). Olmo-core DDP 训练栈也能训练 dense 模型, 在 rank 本地 compute weight 分片放得下时还可能更快. 在当前的 Olmo-core 里, 原生 MXFP8 这类细粒度集成也走这条路径. 因此我们把 DDP 当作第二套训练基础, 既不是 MoE 专用机制, 也不是 FSDP 的通用替代品.

<!-- page 22 of 168 -->

## 4.1 DDP Uses Static Compute-Weight Replicas · DDP 使用静态的 compute weight 副本

Start with replicated data parallelism and no model parallelism. Let D denote the DDP degree. Every rank holds the complete model (Figure 6), processes different training examples, and accumulates gradients for corresponding parameters. Before an optimizer update, a collective reduction produces the same synchronized gradient for each replicated parameter, so all replicas apply the same update and stay identical. This is the standard replicated-data-parallel contract implemented by PyTorch DDP (Li et al., 2020). As in Section 3, static refers to placement, not to persistent memory: the weights stay at stable GPU locations, and the optimizer still updates their values after every successful step.

先看复制式数据并行, 不加模型并行. 记 D 为 DDP 并行度. 每个 rank 持有完整模型 (Figure 6), 处理不同的训练样本, 为对应的参数累积梯度. 优化器更新之前, 一次集合归约为每个被复制的参数产生相同的同步梯度, 于是所有副本执行相同的更新, 保持一致. 这就是 PyTorch DDP 实现的标准复制式数据并行约定 (Li et al., 2020). 和第 3 节一样, 「静态」指的是位置, 不是显存是否常驻: 权重留在固定的 GPU 位置上, 每个成功的优化器步之后优化器照样更新它们的数值.

FSDP uses a different parameter-materialization policy for data parallelism. Persistent parameter, gradient, and optimizer-state allocations are sharded across the FSDP group. Before a wrapped unit—for example, one Transformer block—runs its forward or backward computation, FSDP gathers that unit’s complete weights. After the computation consumes those weights, FSDP frees the gathered copy and keeps only the local shard; backward also reduce-scatters gradients into their persistent shards. FSDP thereby lowers persistent parameter, gradient, and optimizer memory at the price of gathering and materializing weights around each layer use. Both methods still process different input data. They differ in which complete weights remain materialized between uses. The original FSDP paper and the current FSDP2 documentation define this mechanism and its reshard policies (Zhao et al., 2023; PyTorch Contributors, 2026d).

FSDP 在数据并行里采用另一种参数物化策略. 持久的参数, 梯度和优化器状态分配都在 FSDP 组内分片. 包装单元 (例如一个 Transformer 块) 执行前向或反向之前, FSDP 先 gather 这个单元的完整权重. 计算用完这些权重后, FSDP 释放 gather 出来的副本, 只留本地分片; 反向时还会把梯度 reduce-scatter 到各自的持久分片里. 这样 FSDP 降低了持久的参数, 梯度和优化器显存, 代价是每次用到某一层前后都要 gather 并物化权重. 两种方法都处理不同的输入数据. 区别在于两次使用之间, 哪些完整权重保持物化. FSDP 原始论文和当前的 FSDP2 文档定义了这一机制及其 reshard 策略 (Zhao et al., 2023; PyTorch Contributors, 2026d).

Mixed-precision training separates the representation used by model computation from the higher-precision values used by the optimizer (Micikevicius et al., 2018). The following terms distinguish the three parametersized allocations used throughout this section.

混合精度训练把模型计算所用的表示和优化器所用的更高精度数值分开 (Micikevicius et al., 2018). 下面几个术语用来区分本节反复出现的三类与参数量同阶的显存分配.

## Compute Weights, Main Weights, and Optimizer States · compute weight, 主权重与优化器状态

**Compute weights** are the representations consumed by forward and backward computation. Ordinary layers use BF16 compute weights; selected MXFP8 linears use quantized data and scales, including orientation-specific weight caches.

**compute weight** 是前向和反向计算读取的权重表示. 普通层使用 BF16 compute weight; 选定的 MXFP8 线性层使用量化后的数据和缩放因子, 包括按方向区分的权重缓存.

**Main weights** are the FP32 parameter values updated by the optimizer. For storage accounting, we group them with the optimizer states because the distributed optimizer stores and shards them together; they remain parameter values, not optimizer states. The updated main weights are then used to refresh the BF16 or MXFP8 compute weights.

**主权重** (main weight) 是优化器更新的 FP32 参数值. 统计存储时, 我们把它们和优化器状态归为一类, 因为分布式优化器把两者放在一起存储和分片; 但它们仍是参数值, 不是优化器状态. 更新后的主权重再用来刷新 BF16 或 MXFP8 compute weight.

**Optimizer states** are the per-parameter buffers that an optimizer keeps between steps. In Olmo, parameters updated by AdamW keep two moment estimates (Kingma and Ba, 2015; Loshchilov and Hutter, 2019), and matrices updated by Muon keep one momentum buffer (Jordan et al., 2024; Liu et al., 2025b); all of these states are stored in FP32.

**优化器状态** 是优化器在步与步之间为每个参数保留的缓冲区. 在 Olmo 里, 由 AdamW 更新的参数保留两个矩估计 (Kingma and Ba, 2015; Loshchilov and Hutter, 2019), 由 Muon 更新的矩阵保留一个动量缓冲区 (Jordan et al., 2024; Liu et al., 2025b); 这些状态都以 FP32 存储.

![Image block](images/p22-figure-6-a-four-gpu-ddp-example-with-no.jpg)

Figure 6 A four-GPU DDP example with no model-parallel sharding. With DP = 4, every GPU holds a static replica of the same attention layers and complete routed-expert pool, experts 0–15, while processing different input data. DDP synchronizes the gradients of these replicated weights; it does not itself shard the model shown here.

<!-- page 23 of 168 -->

These dtypes are training-recipe choices, not requirements imposed by DDP or optimizer sharding. DeepSeek-V3 and Megatron-Core report storing both AdamW moments in BF16 while retaining FP32 main weights and accumulated gradients (DeepSeek-AI et al., 2024; Yan et al., 2026). Olmo keeps both AdamW moments in FP32 in the configurations described here; we have not evaluated lower-precision moment storage in this stack.

这些数据类型是训练配方的选择, DDP 和优化器分片本身并不要求. DeepSeek-V3 和 Megatron-Core 报告把 AdamW 的两个矩都存成 BF16, 主权重和累积梯度仍保留 FP32 (DeepSeek-AI et al., 2024; Yan et al., 2026). 在这里描述的配置中, Olmo 把 AdamW 的两个矩都存成 FP32; 我们没有在这套训练栈里评估更低精度的矩存储.

Let B be the tokens processed by one rank in an optimizer step, m the number of microbatches, K the number of active experts, d the model width, and D the DDP degree. Table 4 gives approximate resource costs for the work introduced in Section 1.3. The table omits constant factors and hardware efficiency.

设 B 为一个优化器步内单个 rank 处理的 token 数, m 为 microbatch 数, K 为激活专家数, d 为模型宽度, D 为 DDP 并行度. Table 4 给出第 1.3 节所列各项工作的近似资源成本. 表中省略了常数因子和硬件效率.

<table><tr><td colspan="4">No model parallelism: every DP/DDP rank holds the whole model</td></tr><tr><td>Training work</td><td>When it happens</td><td>Approximate cost</td><td>What changes for MoE</td></tr><tr><td>Forward and backward model compute</td><td>Every microbatch</td><td> $\propto BP_{\text{active}}$  for parameter-linear terms</td><td>This is the useful work. It follows active, not total, parameters.</td></tr><tr><td>Gradient storage and accumulation</td><td>Kept through the accumulation window; initialize once; add after each backward</td><td>Storage and zeroing  $\propto P_{\text{total}}$ ; additions recur for each microbatch</td><td>Buffer capacity follows total parameters.A rank&#x27;s experts share one stacked gradient tensor, so each accumulation can touch the whole tensor even when only some experts received tokens.</td></tr><tr><td>Gradient synchronization</td><td>Final microbatch, or every microbatch</td><td>Payload  $\propto P_{\text{total}}$ ; the exact factor depends on D and the collective algorithm</td><td>Skipping it on the earlier microbatches (PyTorch&#x27;s no_sync()) leaves one synchronization per optimizer step, but the payload still covers the full gradient replica, including experts that received no tokens.</td></tr><tr><td>Optimizer update</td><td>Once per optimizer step</td><td>Arithmetic and memory traffic  $\propto P_{\text{total}}$ </td><td>An inactive expert still has a weight and optimizer states; in this unsharded baseline every DP rank carries them.</td></tr><tr><td>Updated-parameter distribution</td><td>After the optimizer step</td><td>Local only in unsharded DDP</td><td>Every rank updates its complete replica, so there is no parameter collective.Parameter movement appears only after choosing a sharded optimizer.</td></tr><tr><td>Routing and expert work setup</td><td>Every MoE layer and microbatch</td><td>Activation movement  $\propto BKd$  per routed layer, plus route metadata and launches</td><td>Top-K, counting, permutation, and combination already exist with all experts local; the grouped expert GEMMs are useful model work.</td></tr></table>

> **拆开:** Table 4 说一个 rank 上的专家共用一个堆叠的梯度张量, 所以哪怕只有部分专家收到 token, 每次累积也可能碰到整个张量; 这次「碰到」具体是什么操作?
> 对照代码 `nn/parallel/distributed.py` 的 `_fp32_post_grad_acc_hook` (约 586-600 行): autograd 先给整块专家权重 (如 `w_up_gate`, 形状按本地专家数堆叠) 产出一个 BF16 的 `param.grad`, hook 再对整块做 `main_grad.add_(g)` 加进 FP32 桶视图, 然后把 `param.grad` 置空. 没收到 token 的专家, 在 grouped GEMM 的 wgrad 输出里对应的是零, 但这一段零照样参与一次整张量的 BF16 产出和 FP32 加法. 所以每个 microbatch 的累积开销按本地专家总参数量计, 而不是按收到 token 的专家计, 这正是 Table 4 把它归到「Storage and zeroing $\propto P_{\text{total}}$, additions recur for each microbatch」的原因. EP 把本地专家数降到 $N/M_E$, 也就把这次整块加法缩小了 $M_E$ 倍.

These proportionalities identify pressure points; they are not additive terms in an elapsed-time model. Collective traffic also depends on the algorithm, topology, and overlap with other work. For example, ring all-reduce moves approximately $2 ( D   -   1 ) / D$ payload copies per rank, while aggregate network traffic additionally grows with the number of ranks (Patarasuk and Yuan, 2009).

这些正比关系指出的是压力点, 不能当作耗时模型里的项直接相加. 集合通信的流量还取决于算法, 拓扑以及与其他工作的重叠. 例如 ring all-reduce 每个 rank 大约要搬 $2 ( D - 1 ) / D$ 份载荷, 而网络总流量还会随 rank 数增长 (Patarasuk and Yuan, 2009).

The capacity-to-active gap is especially clear for the expert MLP. A bias-free SwiGLU expert pool with model width $d ,$ expert hidden width $h _ { e }$ , and $N$ routed experts stores approximately $3 N d h _ { e }$ parameters, whereas one token evaluates approximately $3 K d h _ { e }$ of them. Parameter-sized work can therefore grow with N while useful expert arithmetic grows with K. The next subsection compares how often DDP and FSDP perform that parameter-sized work.

容量-激活差距在专家 MLP 上尤其明显. 一个不带 bias 的 SwiGLU 专家池, 模型宽度 $d$, 专家隐层宽度 $h _ { e }$, 有 $N$ 个 routed 专家, 存储约 $3 N d h _ { e }$ 个参数, 而一个 token 只用到其中约 $3 K d h _ { e }$ 个. 所以与参数量同阶的工作随 N 增长, 有效专家算术随 K 增长. 下一小节比较 DDP 和 FSDP 执行这类与参数量同阶的工作的频率.

<!-- page 24 of 168 -->

## 4.2 FSDP Gathers per Microbatch; DDP Synchronizes per Global Step · FSDP 按微批 gather, DDP 按全局步同步

An optimizer step is the complete accumulation window that produces one model update. Suppose it contains m microbatches of b tokens per rank, so the rank-local accumulated batch is $B = m b$ . At fixed microbatch shape, useful model work grows the same way under either data-parallel choice:

一个优化器步就是产生一次模型更新的完整累积窗口. 设它包含 m 个 microbatch, 每个 rank 每个 microbatch 处理 b 个 token, 则 rank 本地的累积 batch 为 $B = m b$. microbatch 形状固定时, 两种数据并行选择下有效模型计算的增长方式相同:

$$
W _ {\text {useful}} (m) \propto m b P _ {\text {active}}.\tag{7}
$$

The parameter-sized communication differs between the two alternatives (Figure 7):

两种方案在与参数量同阶的通信上不同 (Figure 7):

• **With DDP,** gradient synchronization and, when using a distributed optimizer, compute-weight reconstruction occur once per optimizer step. Their payload scales with the rank-local parameter count, W<sub>DDP</sub> boundary $\propto P _ { \mathrm { l o c a l } }$

**DDP:** 梯度同步, 以及使用分布式优化器时的 compute weight 重建, 每个优化器步只发生一次. 载荷随 rank 本地参数量增长, W<sub>DDP</sub> boundary $\propto P _ { \mathrm { l o c a l } }$.

• **With FSDP,** weight gathering and freeing recur as each wrapped unit is used in every microbatch. Across the accumulation window, this movement scales as W<sub>FSDP</sub> materialization $\propto m P _ { \mathrm { l o c a l } }$

**FSDP:** 每个 microbatch 用到每个包装单元时, 都要重复 gather 和释放权重. 在整个累积窗口内, 这部分搬运按 W<sub>FSDP</sub> materialization $\propto m P _ { \mathrm { l o c a l } }$ 增长.

The DDP and FSDP terms describe alternative designs; they are not paid together. Increasing m spreads DDP’s once-per-step synchronization over more useful work, whereas it repeats FSDP’s weight movement. The optimizer update itself remains once per optimizer step in both designs.

DDP 项和 FSDP 项描述的是二选一的设计, 不会同时付出. 增大 m, DDP 每步一次的同步被摊到更多有效计算上, FSDP 的权重搬运却要多重复几次. 两种设计里, 优化器更新本身都是每个优化器步一次.

On the Olmo-core DDP path, non-final microbatches run under no\_sync() (Li et al., 2020). Gradients accumulate in stable buffers, and the complete window ends with one ordered sweep of bucketed all-reduces. When the distributed optimizer is enabled, it then updates each rank’s FP32 main-weight and optimizerstate shards and reconstructs the compute weights once. Replica synchronization therefore occurs at the global-step boundary, even with optimizer sharding.

在 Olmo-core DDP 路径上, 最后一个之前的 microbatch 都在 no\_sync() 下运行 (Li et al., 2020). 梯度在固定的缓冲区里累积, 整个窗口结束时按顺序扫一遍分桶的 all-reduce. 开启分布式优化器时, 它接着更新每个 rank 的 FP32 主权重分片和优化器状态分片, 并重建一次 compute weight. 所以即便做了优化器分片, 副本同步也只发生在全局步的边界上.

With FSDP, each wrapped unit must instead be materialized for its forward and backward computation and freed after each use. Gradient accumulation can delay the optimizer step, but it does not eliminate this repeated weight movement. Retaining every gathered unit across the accumulation window instead trades that movement for higher memory, as discussed in Appendix B.3 (PyTorch Contributors, 2026d).

FSDP 则不同, 每个包装单元在前向和反向时都必须物化, 每次用完就释放. 梯度累积可以推迟优化器步, 但消除不了这种反复的权重搬运. 如果在整个累积窗口内保留所有 gather 出来的单元, 就是用更高的显存换掉这部分搬运, 见附录 B.3 (PyTorch Contributors, 2026d).

DDP moves gradient reduction and optimizer reconstruction to the global-step boundary, but it does not make all communication independent of m. Once EP is enabled, dispatch and combine move routed token rows, and their backward adjoints, in every routed layer and microbatch. Accumulating more microbatches spreads the once-per-step gradient synchronization and optimizer update over more useful work, but it does not reduce each microbatch’s EP traffic or enlarge its grouped-GEMM shapes.

DDP 把梯度归约和优化器后的重建挪到全局步边界, 但并没有让所有通信都与 m 无关. 一旦开启 EP, 每个 routed 层, 每个 microbatch 里, dispatch 和 combine 都要搬运 routed token 行, 反向时还要搬它们的伴随梯度. 累积更多 microbatch, 能把每步一次的梯度同步和优化器更新摊到更多有效计算上, 但不会减少每个 microbatch 的 EP 流量, 也不会让 grouped GEMM 的形状变大.

The preliminary single-node accumulation sweep in Figure 8a shows the expected global-batch signature without mixing in EP. It fixes the model at 48 routed experts, approximately 3.2B active and 19B total parameters, fixes the rank-microbatch shape, and changes only the number of accumulated microbatches. Both paths run with EP disabled.

Figure 8a 的初步单节点累积扫描在不掺入 EP 的情况下, 展示了预期中的全局 batch 特征. 它固定模型为 48 个 routed 专家, 激活参数约 3.2B, 总参数约 19B, 固定每个 rank 的 microbatch 形状, 只改变累积的 microbatch 数. 两条路径都关闭 EP.

Figure 8 places this accumulation result beside the capacity sweep used in the next subsection. The panels test different questions: the left varies how much useful work shares one synchronization boundary, while the right varies how much inactive expert capacity the system must store and manage.

Figure 8 把这个累积结果和下一小节用到的容量扫描并排放在一起. 两个子图考察的问题不同: 左图改变的是多少有效计算共用一次同步边界, 右图改变的是系统要存储和管理多少不激活的专家容量.

These trends are consistent with the cost model: DDP spreads its once-per-step work over more useful computation as the batch grows, while FSDP repeats its weight gathering in every microbatch. Each point is a single run without a matched communication profile, so the figure shows the trend but not its exact cause, and it measures throughput, not training quality or time to a target loss.

这些趋势与成本模型一致: batch 变大时, DDP 每步一次的工作被摊到更多有效计算上, FSDP 则在每个 microbatch 里重复 gather 权重. 每个点只跑了一次, 也没有配套的通信 profile, 所以图里能看出趋势, 看不出确切原因; 而且它测的是吞吐, 训练质量和达到目标 loss 的时间都没有测.

> **问:** 按式 (7) 和 $W_{\text{FSDP}} \propto m P_{\text{local}}$, FSDP 的有效计算和权重搬运都随 m 线性增长, 比值不变; 那 Figure 8a 里 FSDP 的 MFU 为什么还能从 26.4% 升到 29.8%?
> 两者比值不变, 说明 FSDP 涨的那一点来自每步只付一次的成本被摊薄: 优化器更新 (Table 4 里 $\propto P_{\text{total}}$, 每步一次), 步首步尾的固定开销, 以及梯度同步, 如果 FSDP2 在非最后一个 microbatch 上关掉了 reduce-scatter. FSDP2 默认每次反向都 reduce-scatter, 要靠 `set_requires_gradient_sync(False)` 才能推迟; 报告没说这组对比里 FSDP 是否推迟了梯度同步, 也没给通信 profile (图注明说不分解). DDP 从 25.2% 升到 41.4%, 涨幅大得多, 和「DDP 每步一次的同步与重建全部被摊薄」相符. FSDP 那 3.4 个点具体归哪一项, 报告里没写, 以上归因只是从已知数字推出的说法, 没有数据验证.

## 4.3 DDP Alone Hits a Memory Wall · 只靠 DDP 会撞上显存墙

**Static replicas require a local partition that fits in memory.** DDP removes repeated weight materialization only by keeping its compute weights and selected training buffers present throughout the accumulation window. Peak memory therefore combines persistent training state with execution working memory, summarized in Table 5.

**静态副本要求本地分片放得进显存.** DDP 之所以不用反复物化权重, 是因为它在整个累积窗口内一直保留 compute weight 和部分训练缓冲区. 所以峰值显存由持久训练状态和执行工作显存两部分组成, 见 Table 5.

FSDP has a direct advantage in persistent training-state memory. With enough shard ranks, it can make each rank’s long-lived parameter, gradient, and optimizer-state contribution small, although the currently materialized unit, activations, and temporary buffers still contribute to peak memory. DDP keeps the compute-weight

<!-- page 25 of 168 -->

![Image block](images/p25-ddp-moe.jpg)

> 图注: ddp moe.

DDP (MoE)

![Image block](images/p25-figure-9-isolates-the-parameter-sized-persistent-training-state.jpg)

> 图注: figure 9 isolates the parameter sized persistent training state.

| Memory class | What it includes | Why it matters |
| --- | --- | --- |
| Persistent | Compute weights; gradient-accumulation buffers; FP32 main weights; optimizer states and other | Must remain available across micro-batches or update boundaries. DDP, the distributed optimizer, EP, and |
| training state | long-lived optimizer buffers | PP determine which portions are replicated or sharded. |
| Execution | Activations; materialization, routing, and com-munication buffers; kernel workspaces; allocator | Its contents and peak demand de-pend on microbatch shape, recom-putation, routing, schedule, kernels, |
| working memory | fragmentation; execution caches | and runtime behavior. A preallocated fixed-address buffer can still belong to this class. |

representation of its rank-local partition complete. That partition, its gradient buffers, and the execution working set must all fit at once.

FSDP 在持久训练状态显存上有直接优势. 分片 rank 足够多时, 它能把每个 rank 长期持有的参数, 梯度和优化器状态压得很小, 不过当前物化的单元, 激活和临时缓冲区仍会计入峰值显存. DDP 则保留 rank 本地分片完整的 compute weight 表示. 这份分片, 它的梯度缓冲区和执行时的工作集必须同时放得下.

Figure 9 isolates the parameter-sized persistent training-state allocations directly changed by the distributed optimizer and EP under one concrete policy.

Figure 9 在一种具体策略下, 单独画出分布式优化器和 EP 直接改变的那部分与参数量同阶的持久训练状态分配.

The capacity sweep in Figure 8b makes the wall visible while holding useful expert work approximately fixed. Top-K stays at 4 and the active model size near 3.2B parameters as the routed-expert pool grows from 8 to

<!-- page 26 of 168 -->

![Image block](images/p26-figure-8-global-batch-and-expert-capacity-sweeps-expose.jpg)

(a) Accumulation amortizes DDP’s per-step synchronization.

![Image block](images/p26-figure-8-global-batch-and-expert-capacity-sweeps-expose-2.jpg)

(b) EP delays DDP’s expert-capacity memory wall.

**Figure 8 Global-batch and expert-capacity sweeps expose different limits.** Preliminary single-node measurements use eight B300 GPUs, an eight-layer BF16 MoE model, top-4 random routing, no PP, and approximately 3.2B active parameters. **Left:** with EP disabled and 48 routed experts (19B total parameters), DDP useful-model FLOPs utilization (MFU) rises from 25.2% to 41.4% between 128-Ki and 4-Mi-token global batches (1 $\mathrm { K i } = 2 ^ { 1 0 }$ and $1 \; \mathrm { M i } = 2 ^ { 2 0 }$ tokens), while FSDP rises from 26.4% to 29.8%. **Right:** total capacity grows from 4.6B to 47B parameters; no-EP DDP runs out of memory at 64 and 128 experts, no-EP FSDP continues to fit but loses useful-model MFU, and DDP+EP8 remains nearly flat. Each point is one run, so the curves show preliminary scaling behavior rather than run-to-run variance. They do not decompose peak memory or attribute the trend to a specific communication phase.

![Image block](images/p26-figure-9-the-distributed-optimizer-and-ep-reduce-different.jpg)

Figure 9 The distributed optimizer and EP reduce different parts of DDP’s persistent parameter-sized training state. Under the illustrated BF16-execution, FP32-gradient, and two-moment FP32 optimizer policy, naive DDP uses 18 bytes per parameter. Sharding the FP32 main weights and optimizer states evenly over D replica ranks reduces this to $6 + 1 2 / D$ bytes while compute weights and gradient buffers remain replicated. Sharding routed-expert compute weights and gradients over the expert-parallel model-sharding degree $M_{E}   \left(  EP-MP ; \right.$ defined in Section 5) further reduces their per-rank memory contribution to $6 / M _ { E } + 1 2 / D$ bytes when $D = M_{E}D_{E}$ Dense and shared parameters follow their separate replica groups. This accounting excludes execution working memory, including activations, routing and communication buffers, kernel workspaces, execution caches, and allocator fragmentation, as well as uneven shards and small auxiliary tensors that are not sharded.

128 experts. DDP without EP fits at 8, 32, and 48 experts, then runs out of memory at 64 and 128. FSDP without EP continues to fit, but its measured MFU falls as total capacity grows. DDP+EP8, which also shards the routed-expert pool across eight ranks, remains near 42–44% MFU over its measured points.

Figure 8b 的容量扫描在有效专家计算基本不变的情况下, 让这堵墙显现出来. routed 专家池从 8 个增长到 128 个, top-K 保持为 4, 激活规模保持在 3.2B 参数左右. 不开 EP 的 DDP 在 8, 32, 48 个专家时放得下, 到 64 和 128 个专家时显存溢出. 不开 EP 的 FSDP 一直放得下, 但实测 MFU 随总容量增长而下降. DDP+EP8 还把 routed 专家池分到 8 个 rank 上, 在它的各个测量点上 MFU 都保持在 42-44% 附近.

In the right panel, DDP+EP8 stores one eighth of the routed-expert pool per EP-MP shard; the dashed dense references were measured separately. Its measured MFU is nearly flat, but the per-rank expert shard still grows as $N / 8 .$ This residual growth matters more as modern MoE designs increase N while keeping K small

<!-- page 27 of 168 -->

(Table 1): EP changes the per-rank growth from N to N/M<sub>E</sub>, but it does not make memory independent of total expert capacity. Olmo therefore reduces the rank-local partition with a distributed optimizer, EP, and PP.

右图中, DDP+EP8 的每个 EP-MP 分片存储 routed 专家池的八分之一; 虚线表示的 dense 参考值是另外测的. 它的实测 MFU 几乎持平, 但每个 rank 上的专家分片仍按 $N / 8$ 增长. 现代 MoE 设计在增大 N 的同时保持 K 很小 (Table 1), 这种残余增长因此更要紧: EP 把每个 rank 的增长从 N 变成 N/M<sub>E</sub>, 但没有让显存与专家总容量无关. 所以 Olmo 同时用分布式优化器, EP 和 PP 来缩小 rank 本地分片.

## 4.3.1 Distributed Optimizer Shards FP32 Main Weights and Optimizer States · 分布式优化器对 FP32 主权重和优化器状态分片

The first of these three mechanisms, the distributed optimizer, keeps model execution unchanged while shrinking the memory for FP32 main weights and optimizer states. Under the illustrated AdamW-like policy, one parameter contributes a 2-byte BF16 compute weight, a 4-byte FP32 gradient-accumulation slot, a 4- byte FP32 main weight, and two 4-byte FP32 moments. Naive DDP therefore carries 18 bytes per parameter before execution working memory. The distributed optimizer leaves the compute weight and gradient buffer replicated within that parameter’s replica group, but shards eligible FP32 main weights and optimizer states over the group. The idealized $6 + 1 2 / D$ expression in Figure 9 assumes even sharding. This optimizer-state partition follows the design family introduced by ZeRO (Rajbhandari et al., 2020).

三种机制中的第一种是分布式优化器, 它不改变模型执行, 只缩小 FP32 主权重和优化器状态的显存. 按图中示意的类 AdamW 策略, 每个参数占用 2 字节的 BF16 compute weight, 4 字节的 FP32 梯度累积槽, 4 字节的 FP32 主权重, 以及两个各 4 字节的 FP32 矩. 所以不算执行工作显存, 朴素 DDP 每个参数要 18 字节. 分布式优化器让 compute weight 和梯度缓冲区在该参数的副本组内保持复制, 但把符合条件的 FP32 主权重和优化器状态在组内分片. Figure 9 里理想化的 $6 + 1 2 / D$ 假设分片均匀. 这种优化器状态切分属于 ZeRO 开创的设计家族 (Rajbhandari et al., 2020).

Figure 10 compares the two useful balanced layouts with a naive baseline. Concatenate-then-shard flattens all eligible optimizer-state tensors into one sequence and partitions that sequence across ranks. It balances the aggregate optimizer state and does not require every tensor to be individually divisible by the sharding degree. Its cost is bookkeeping: shard boundaries may cut through tensors, so optimization, weight reconstruction, and checkpointing must all preserve a global map from each tensor to its flat-buffer views and offsets.<sup>5</sup> The figure’s same-param-count baseline assigns the same number of complete parameter tensors to every rank. It does not equalize the number of scalar elements. Because tensor sizes vary widely, equal tensor counts can produce severely unequal byte counts and are the least useful of the three layouts.

Figure 10 把两种实用的均衡布局和一个朴素基线放在一起比较. 先拼接再分片 (concatenate-then-shard) 把所有符合条件的优化器状态张量展平拼成一个序列, 再把这个序列切给各个 rank. 它让优化器状态总量均衡, 也不要求每个张量各自都能被分片数整除. 代价是额外的索引映射: 分片边界可能切过张量中间, 所以优化, 权重重建和 checkpoint 都必须记录每个张量在扁平缓冲区中的视图与偏移.<sup>5</sup> 图中按参数个数均分的基线给每个 rank 分同样数量的完整参数张量. 它并不均分标量元素个数. 张量大小差别很大, 张量个数相同可能导致字节数严重不均, 所以它是三种布局里最不实用的.

![Image block](images/p27-figure-10-optimizer-state-layout-choices-colors-identify-eligible.jpg)

Figure 10 Optimizer-state layout choices. Colors identify eligible FP32 optimizer-state tensors associated with different model parameters; they do not represent the replicated BF16 compute weights. Dashed lines mark the ranges assigned to each rank in an optimizer replica group of size D = 4. Concatenate-then-shard balances the flattened optimizer state globally but requires explicit view and offset metadata. The same-param-count baseline preserves whole tensors but can severely imbalance bytes. Olmo instead divides each eligible main-weight and optimizer-state tensor independently into D equal contiguous shards.

Olmo uses the per-tensor layout in the bottom row. Each eligible tensor is flattened and divided independently across its optimizer replica group; its FP32 main weight and optimizer states use the same rank-local slice. The mapping is local to one tensor, so update, reconstruction, and checkpoint views remain direct and easy to inspect. The trade-off is that the current policy shards a tensor only when it is sufficiently large and its element count is divisible by the replica-group size. Small or non-divisible optimizer-state tensors remain replicated, as do scalar step counters. This fallback does not prevent training, but it reduces the memory saved by the distributed optimizer.

Olmo 用的是最下面一行的逐张量布局. 每个符合条件的张量展平后, 在它的优化器副本组内各自独立切分; 它的 FP32 主权重和优化器状态使用 rank 本地的同一段切片. 映射只涉及单个张量, 所以更新, 重建和 checkpoint 的视图都是直接的, 容易检查. 代价是, 当前策略只在张量足够大且元素个数能被副本组大小整除时才分片. 小张量, 不能整除的优化器状态张量, 以及标量步数计数器, 都保持复制. 这种回退不影响训练, 但会减少分布式优化器省下的显存.

> 代码 `optim/moe_optimizer.py` 的 `_distribute_tensor` (约 920-938 行) 写的是: `num_elements >= do_not_shard_tensor_smaller_than` 且 `num_elements % device_mesh.size(0) == 0` 时用 `Shard(0)`, 否则 `Replicate()` 并打一行日志; 门槛默认 4096 个元素 (约 512 行). 这里的 `device_mesh` 是该参数自己的副本组: dense 参数是大小为 D 的 DP 组, 专家参数按第 4.3.2 节是大小为 $D_E$ 的 EP-DP 组. 专家组更小, 整除条件更容易满足. 和脚注 5 的 Megatron 桶级布局对比: Megatron 按桶切等长区间, 不挑张量, 但要维护桶切片到参数切片的映射; Olmo 逐张量切, 映射简单, 代价是像 7 或 13 这样的组大小会让更多张量退回复制. 报告说生产里组大小基本是 2 的幂 (最大 128), 所以这项损失可以忽略; 这一判断报告没有给出被复制字节数的实测比例.

In practice, this restriction is mild for the regular, mostly power-of-two replica groups in our production configurations, including groups of 128 ranks: nearly all large model tensors are divisible by these group sizes. Irregular sharding degrees such as 7 or 13 would cause more tensors to remain replicated, but we have not encountered that case in our production runs. Muon changes the number of optimizer history tensors, not this placement rule.

实际上, 我们生产配置里的副本组规整, 大多是 2 的幂 (包括 128 个 rank 的组), 这条限制影响很小: 几乎所有大的模型张量都能被这些组大小整除. 像 7 或 13 这样不规整的分片数会让更多张量保持复制, 但我们在生产运行里没遇到过这种情况. Muon 改变的是优化器历史张量的个数, 不改变这条放置规则.

<sup>5</sup>Megatron-LM’s standard DistributedOptimizer is a bucket-level instance of this layout. It assigns equal contiguous bucket ranges to data-parallel ranks; because a range may cut through a parameter, the implementation maps bucket slices back to parameter slices (NVIDIA, 2026d).

<sup>5</sup>Megatron-LM 的标准 DistributedOptimizer 是这种布局在桶级别上的一个实例. 它把等长的连续桶区间分给各个数据并行 rank; 由于一个区间可能切过某个参数, 实现里要把桶切片映射回参数切片 (NVIDIA, 2026d).

<!-- page 28 of 168 -->

At the end of the accumulation window, DDP first produces reduced FP32 gradients. Each rank narrows the relevant gradient into the shard corresponding to its FP32 main-weight shard, updates that shard and its optimizer states locally, and then participates in coalesced all-gathers that reconstruct the updated compute weights. Thus gradient reduction, sharded update, and reconstruction happen once per optimizer step. The mechanism recovers much of the optimizer-state memory that motivated FSDP without evicting or rematerializing compute weights between microbatches, but it does not remove the replicated weight and gradient floor.

累积窗口结束时, DDP 先产出归约后的 FP32 梯度. 每个 rank 从相应梯度里截出与自己 FP32 主权重分片对应的那一段, 在本地更新这个分片及其优化器状态, 然后参加合并后的 all-gather, 重建更新后的 compute weight. 所以梯度归约, 分片更新和重建每个优化器步各发生一次. 这一机制省回了当初促使人们采用 FSDP 的大部分优化器状态显存, 又不需要在 microbatch 之间驱逐或重新物化 compute weight; 但被复制的权重和梯度构成的显存下限仍然在.

## 4.3.2 EP Shards Expert Weights and Gradients · EP 对专家权重和梯度分片

The second mechanism reduces the routed-expert memory that the distributed optimizer leaves replicated. With EP-MP degree $M _ { E }$ , each rank stores roughly $N / M _ { E }$ routed experts and their gradient buffers rather than all N experts. Ranks holding copies of the same expert shard form an EP-DP group of size $D _ { E } ;$ they reduce that shard’s gradients together, and the distributed optimizer shards its FP32 main weights and optimizer states over those $D _ { E }$ replicas. Because the original data-parallel group has size $D   =   M_{E}D_{E}$ expert optimizer state is still divided across the same total degree D after the two stages of sharding. $\mathrm { E P ^ { \prime } s }$ additional memory saving is therefore in compute weights and gradient buffers; it is not another factor applied to optimizer state that was already sharded over D. Section 5 introduces the EP-MP and EP-DP topology and the dispatch/combine traffic paid for this saving.

第二种机制缩小分布式优化器没动的那部分 routed 专家显存, 也就是仍被复制的部分. EP-MP 并行度为 $M _ { E }$ 时, 每个 rank 只存约 $N / M _ { E }$ 个 routed 专家及其梯度缓冲区, 而不是全部 N 个. 持有同一专家分片副本的 rank 组成大小为 $D _ { E }$ 的 EP-DP 组; 它们一起归约这个分片的梯度, 分布式优化器在这 $D _ { E }$ 个副本上对它的 FP32 主权重和优化器状态做分片. 由于原来的数据并行组大小是 $D = M_{E}D_{E}$, 经过两级分片之后, 专家优化器状态仍是在同样的总并行度 D 上切分. 所以 EP 额外省下的显存在 compute weight 和梯度缓冲区上; 对已经在 D 上分片过的优化器状态, 它不会再除一个因子. EP-MP 与 EP-DP 拓扑, 以及为这份节省付出的 dispatch/combine 流量, 见第 5 节.

> **对一下:** Figure 9 的 $6 / M_E + 12 / D$ 里, 为什么 EP 只除掉了前面的 6 字节, 后面的 12 字节分母没变成 $M_E D$?
> 按第 4.3.2 节逐项算: 每个 rank 存 $N/M_E$ 个专家, BF16 权重 2 字节加 FP32 梯度槽 4 字节, 摊到全局每个专家参数上就是 $6/M_E$. FP32 主权重和两个矩共 12 字节, 分布式优化器只在 EP-DP 组 (大小 $D_E$) 内分片, 而每个 rank 上这份 12 字节对应的本身也只是 $1/M_E$ 的专家, 摊到全局每个参数上是 $12/(M_E D_E) = 12/D$. 也就是说, 没有 EP 时优化器在 D 上切, 开了 EP 之后是「先按 $M_E$ 切专家, 再按 $D_E$ 切副本」, 总因子还是 D. 这条推导也说明 EP 的显存收益上限: 当 D 很大时 $12/D$ 已经很小, 剩下的主要是 $6/M_E$, 继续加大 $M_E$ 才有用, 而 $M_E$ 又受 EP 通信域约束 (第 7 节). 报告没给真实配置下这两项的实测字节数.

## 4.3.3 PP Shards Layers and Their Persistent Training State · PP 对层及其持久训练状态分片

EP divides the expert pool inside a layer, but every rank may still hold too many layers, dense weights, shared experts, and activations. PP assigns different layer ranges and their weights, gradient buffers, and optimizer shards to different stages, reducing this persistent training-state memory in each rank-local partition. It introduces a different tax: activation transfers, pipeline bubbles, and multiple in-flight microbatches. Section 6 develops those schedules and memory trade-offs. Together, the distributed optimizer, EP, and PP make DDP practical at model sizes where ordinary replicated DDP is not.

EP 切的是一层内部的专家池, 但每个 rank 可能仍持有太多层, dense 权重, 共享专家和激活. PP 把不同的层区间, 连同它们的权重, 梯度缓冲区和优化器分片, 分给不同的 stage, 从而减少每个 rank 本地分片里的持久训练状态显存. 它带来另一种税: 激活传输, 流水线气泡, 以及同时在途的多个 microbatch. 第 6 节展开这些调度和显存上的取舍. 分布式优化器, EP 和 PP 合在一起, 让 DDP 在普通复制式 DDP 无法胜任的模型规模上也能用.

## 4.4 Olmo-Owned DDP · Olmo 自研的 DDP

The Olmo-core DDP training stack includes both replica synchronization and the update path around it. PyTorch’s standard DistributedDataParallel wrapper is designed around one process group and ordinary Parameter.grad handling (Li et al., 2020; PyTorch Contributors, 2026a). Olmo combines separate execution and update precision, parameter-specific replica groups after EP, sharded optimizer states, derived MXFP8 representations, and explicit completion after gradient accumulation or a pipeline schedule. Each piece can be assembled from $\mathrm { P y }$ Torch mechanisms, but operating them as one coordinated update path requires integration deep enough that Olmo implements and controls the DDP path directly rather than layering it around the standard wrapper.

Olmo-core DDP 训练栈既包括副本同步, 也包括围绕它的更新路径. PyTorch 标准的 DistributedDataParallel 包装器是围绕单个进程组和普通的 Parameter.grad 处理设计的 (Li et al., 2020; PyTorch Contributors, 2026a). Olmo 要同时处理这几件事: 执行精度与更新精度分开, 开 EP 后每个参数有各自的副本组, 优化器状态分片, 由主权重派生的 MXFP8 表示, 以及在梯度累积或流水线调度结束后显式收尾. 每一项都能用 PyTorch 的机制拼出来, 但要让它们作为一条协调一致的更新路径运转, 集成必须做得很深, 所以 Olmo 直接实现和掌控 DDP 路径, 而不是在标准包装器外面再包一层.

## 4.4.1 Hybrid Precision Control · 混合精度控制

Execution precision and update precision serve different goals. BF16 and MXFP8 reduce model execution and storage cost. Gradient accumulation sums contributions across microbatches, gradient reduction combines ranks, and the optimizer integrates updates over many steps. Mixed-precision training keeps an FP32 master copy of the weights for updates and performs large sums in FP32 (Micikevicius et al., 2018); we apply the same principle to gradient accumulation and reduction. In the Olmo-core DDP configuration described here, model execution uses BF16 or selected MXFP8 paths, while normal parameter gradients accumulate in dedicated FP32 bucket views, reduce in FP32, and feed FP32 main weights and optimizer states.

执行精度和更新精度服务于不同的目标. BF16 和 MXFP8 降低模型执行和存储的成本. 梯度累积把各 microbatch 的贡献相加, 梯度归约合并各 rank 的结果, 优化器则在很多步上把更新积起来. 混合精度训练保留一份 FP32 主权重用于更新, 并用 FP32 做大规模求和 (Micikevicius et al., 2018); 我们把同样的原则用到梯度累积和归约上. 在这里描述的 Olmo-core DDP 配置中, 模型执行走 BF16 或选定的 MXFP8 路径, 普通参数的梯度则在专用的 FP32 桶视图里累积, 以 FP32 归约, 再送给 FP32 主权重和优化器状态.

This separation is more specific than generic mixed-precision execution. For an ordinary BF16 parameter, autograd’s leaf AccumulateGrad node first produces a temporary BF16 param.grad. A post-accumulate hook immediately adds that gradient into the parameter’s FP32 accumulation buffer and clears param.grad. Each FP32 accumulation buffer is a view into a flat bucket built before training, and gradient reduction operates directly on that bucket.<sup>6</sup> The policy described here uses FP32 accumulation and FP32 reduction.

这种分离比一般的混合精度执行更具体. 对普通的 BF16 参数, autograd 的叶子节点 AccumulateGrad 先产出一个临时的 BF16 param.grad. 一个 post-accumulate hook 立即把这个梯度加进该参数的 FP32 累积缓冲区, 并清空 param.grad. 每个 FP32 累积缓冲区都是训练前建好的一个扁平桶里的视图, 梯度归约直接在这个桶上进行.<sup>6</sup> 这里描述的策略用 FP32 累积和 FP32 归约.

> **停一下:** 第 4.4.1 节强调梯度「在 FP32 里累积」, 但 hook 加进 FP32 桶的是 autograd 先产出的 BF16 `param.grad`; 那单个 microbatch 内的权重梯度到底是什么精度?
> 是 BF16. 代码 `nn/parallel/distributed.py` 约 586-600 行: 进来的 `g` 是 BF16, 大张量走 `gradient_add` kernel, 否则 `main_grad.add_(g)`, 两条路都是把已经舍入到 BF16 的 wgrad 加进 FP32. 所以 FP32 保护的是跨 microbatch 的累加和跨 rank 的归约, 单个 microbatch 的 wgrad GEMM 输出已经在 BF16 上舍入过一次. Megatron-Core 的 gradient accumulation fusion 让 wgrad GEMM 直接以 FP32 累加进 `main_grad`, 省掉这次 BF16 舍入和一个临时张量. Olmo 代码里有一个实验性的 `_profile_rounded_wgrad` 路径 (同文件约 263-273 行), 让专家 wgrad 在外部直接写 FP32 桶, 但标为实验, 只在 profiling 里用. 报告没讨论这次 BF16 舍入对 microbatch 很多时累积精度的影响.

<sup>6</sup>The wrapper constructs buckets by replica group, gradient-storage dtype, communication dtype, and size limit. It binds each parameter’s \_main\_grad\_fp32 to the corresponding slice of the bucket’s flat FP32 storage. Under the FP32-accumulation

<!-- page 29 of 168 -->

After the optimizer updates an FP32 main weight, the BF16 or MXFP8 compute-weight representation is refreshed. MXFP8 weight stores use the optimizer-integrated path described below.

优化器更新完 FP32 主权重后, BF16 或 MXFP8 compute weight 表示随之刷新. MXFP8 权重存储走下文介绍的, 与优化器集成的路径.

## 4.4.2 EP Requires Multiple DDP Groups · EP 需要多个 DDP 组

EP makes a single process group insufficient for one model part. Dense parameters are replicated across the dense data-parallel group. Ranks along EP-MP hold different expert shards and must not average those shards together; only EP-DP ranks holding copies of the same expert shard reduce its gradient. A single standard PyTorch DDP wrapper selects one process group for all of its parameters, whereas the MoE model part contains both kinds of parameter.

有了 EP, 同一部分模型只用一个进程组就不够了. dense 参数在 dense 数据并行组内复制. 沿 EP-MP 的 rank 持有不同的专家分片, 不能把这些分片放在一起平均; 只有持有同一专家分片副本的 EP-DP rank 才一起归约它的梯度. 一个标准的 PyTorch DDP 包装器只为它管的全部参数选一个进程组, 而 MoE 这部分模型同时包含两类参数.

For parameters handled by the bucketed DDP path, Olmo chooses a replica group per parameter and forms buckets only among parameters with compatible groups and storage and communication dtypes. Non-final microbatches accumulate locally. Explicit finalization launches the remaining bucket reductions in a stable order and preserves gradients from experts that appeared earlier in the window but not in its final microbatch. Section 5 derives the topology that these groups implement.<sup>7</sup>

对走分桶 DDP 路径的参数, Olmo 为每个参数选定副本组, 只在副本组, 存储 dtype 和通信 dtype 都兼容的参数之间组桶. 最后一个之前的 microbatch 只在本地累积. 显式的收尾步骤按固定顺序发起剩下的桶归约, 并保住那些在窗口前面出现过, 但没在最后一个 microbatch 里出现的专家的梯度. 这些组实现的拓扑由第 5 节推导.<sup>7</sup>

## 4.4.3 Native MXFP8 Integration · 原生 MXFP8 集成

An MXFP8 compute-weight cache is not independently updated. The FP32 main weight is the source used to rebuild the derived, orientation-specific MXFP8 caches for forward and dgrad. After an update, the optimizer gathers any sharded FP32 main weight, reconstructs the full weight, and refreshes the caches coherently. The current path casts through a BF16 compute-weight representation before quantization, so we describe the caches as derived from the FP32 main weight rather than as a direct FP32-to-MXFP8 conversion. Section 11 covers formats, scales, and kernels, together with the cache formats and refresh points.

MXFP8 compute weight 缓存不单独更新. FP32 主权重是来源, 前向和 dgrad 各自按方向派生的 MXFP8 缓存都由它重建. 每次更新后, 优化器 gather 分片的 FP32 主权重, 重建完整权重, 再一致地刷新这些缓存. 当前路径在量化之前先转成 BF16 compute weight 表示, 所以我们说缓存派生自 FP32 主权重, 而不说它是从 FP32 直接转成 MXFP8. 格式, 缩放因子, kernel, 以及缓存格式和刷新时机见第 11 节.

## 4.4.4 Collectives and Weight Reconstruction Stay Outside the Compiled Update · 集合通信与权重重建留在编译的更新之外

Olmo keeps collective launches and compute-weight reconstruction outside the compiled optimizer computa tion. This separates local shard updates from the communication and refresh phases that surround them, making their order explicit and keeping each phase visible in the step timeline. The same update path coordinates gradient clipping with the optimizer step and performs per-group initialization checks.

Olmo 把集合通信的发起和 compute weight 重建放在编译过的优化器计算之外. 这样本地分片更新和它前后的通信, 刷新阶段就分开了, 顺序明确, 每个阶段在一步的时间线上都看得见. 同一条更新路径还协调梯度裁剪与优化器步, 并按组做初始化检查.

## 4.5 DDP and FSDP Optimize Different Bottlenecks · DDP 和 FSDP 优化的是不同的瓶颈

FSDP minimizes long-lived unsharded parameter storage by materializing weights around use. Olmo-core DDP keeps its rank-local compute-weight partition, which must fit in memory, materialized at stable locations across accumulation and moves gradient synchronization and optimizer reconstruction to the global-step boundary. The distributed optimizer lowers FP32 main-weight and optimizer-state memory, EP divides the routed-expert pool, and PP divides layers. Olmo’s implementation integrates the precision, replica-group, and derived-representation refresh rules needed by that composition.

FSDP 在用到权重时才物化它们, 以此把长期持有的未分片参数存储降到最低. Olmo-core DDP 则在整个累积期间把 rank 本地 compute weight 分片 (它必须放得进显存) 物化在固定位置, 并把梯度同步和优化器后的重建挪到全局步边界. 分布式优化器降低 FP32 主权重和优化器状态显存, EP 切分 routed 专家池, PP 切分层. Olmo 的实现把这种组合所需的精度规则, 副本组规则和派生表示的刷新规则集成在一起.

Dense Olmo continues to use FSDP/HSDP. When useful compute grows with materialized parameters or peak parameter, gradient, and optimizer memory is the primary constraint, FSDP or HSDP remains an effective foundation. The current single-node sweeps establish two local scaling patterns in the eight-layer model: accumulation amortizes more of DDP’s step-boundary work, and increasing expert capacity raises pressure on an unsharded local partition. They do not establish a universal sparsity crossover, optimization quality, or time to a target loss.

dense Olmo 继续使用 FSDP/HSDP. 当有效计算随物化的参数一起增长, 或者参数, 梯度和优化器的峰值显存是主要约束时, FSDP 或 HSDP 仍是有效的基础. 目前的单节点扫描在八层模型上确立了两条局部的扩展规律: 累积越多, DDP 步边界上的工作摊得越薄; 专家容量越大, 未分片的本地分片显存压力越大. 它们并不能确立一个普适的稀疏度分界点, 也说明不了优化质量或达到目标 loss 的时间.

The next section develops EP as the model-parallel mechanism that makes the routed-expert partition fit. It explains which ranks hold different expert shards, which ranks hold replicas of the same shard, and why saving weight and gradient memory introduces dispatch and combine on the microbatch clock.

下一节展开 EP, 即让 routed 专家分片放得下的模型并行机制. 它说明哪些 rank 持有不同的专家分片, 哪些 rank 持有同一分片的副本, 以及为什么省下权重和梯度显存的代价是每个 microbatch 都要做 dispatch 和 combine.

and FP32-reduction policy described here, the all-reduce consumes that flat storage directly. This follows the standard DDP bucket pattern; Olmo extends it to multiple replica groups and explicit storage and communication dtypes.

<sup>6</sup>包装器按副本组, 梯度存储 dtype, 通信 dtype 和大小上限组桶. 它把每个参数的 \_main\_grad\_fp32 绑定到桶的扁平 FP32 存储里对应的那一段. 在这里描述的 FP32 累积加 FP32 归约策略下, all-reduce 直接读这块扁平存储. 这沿用了标准 DDP 的分桶模式; Olmo 把它扩展到多个副本组, 并显式区分存储 dtype 和通信 dtype.

<sup>7</sup>The current implementation is named MultiGroupDistributedDataParallel.

<sup>7</sup>当前实现的名字是 MultiGroupDistributedDataParallel.

<!-- page 30 of 168 -->

## 5 Expert Parallelism · 专家并行

**EP reduces routed-expert storage per rank.** DDP synchronizes model replicas, but it does not reduce the size of each replica. Without model parallelism, every DDP rank stores all N routed experts even though each token uses only K. Expert parallelism (EP) distributes the routed-expert pool across the existing DP ranks. Each rank stores its assigned expert shard, and selected token rows move to the ranks that store their experts. This reduces per-rank expert weights and gradient buffers, but adds dispatch and combine communication to every routed layer.

**EP 减少每个 rank 存储的 routed 专家.** DDP 同步模型副本, 但不缩小每个副本. 没有模型并行时, 虽然每个 token 只用 K 个专家, 每个 DDP rank 仍要存全部 N 个 routed 专家. EP 把 routed 专家池分散到现有的 DP rank 上. 每个 rank 存分给自己的专家分片, 被选中的 token 行移动到存有对应专家的 rank. 这减少了每个 rank 的专家权重和梯度缓冲区, 但给每个 routed 层增加了 dispatch 和 combine 通信.

**Olmo-core introduces rowwise EP.** Conventional all-to-all EP moves tokens in large contiguous blocks, but constructing those blocks requires extra data reordering and can expose dynamic route sizes to the CPU. Rowwise EP keeps routing on the GPU and moves each accepted row directly to its destination, eliminating block packing and the associated host synchronization from Olmo-core’s EP path. NVSHMEM symmetric memory and GPU-initiated communication make this direct placement possible. Section 7 connects it to the underlying network.

**Olmo-core 引入 rowwise EP.** 常规的 all-to-all EP 以大的连续块为单位搬运 token, 但拼出这些块需要额外的数据重排, 还可能让动态的路由大小暴露给 CPU. rowwise EP 让路由留在 GPU 上, 把每个被接收的行直接搬到目的地, 从 Olmo-core 的 EP 路径中去掉了块打包和与之相关的主机同步. 这种直接放置靠的是 NVSHMEM 的 symmetric memory 和由 GPU 发起的通信. 第 7 节把它与底层网络联系起来.

## 5.1 EP Shards Models That Do Not Fit · EP 对放不下的模型分片

**Persistent training-state memory grows with total parameters.**<sup>8</sup> Top-K routing limits how many experts compute for one token, but it does not reduce how many expert weights a rank must store. Without model parallelism, the rank-local model partition is the whole model, so ordinary DDP places all N routed experts on every one of its D ranks. Increasing N can therefore increase total parameter capacity without increasing active expert work, yet still grow the compute weights and gradient buffers until one replica no longer fits. EP addresses this memory limit by partitioning the routed-expert pool, as in established large-scale MoE systems (Lepikhin et al., 2021; Rajbhandari et al., 2022).

**持久训练状态显存随总参数增长.**<sup>8</sup> top-K 路由限制了一个 token 要经过多少个专家的计算, 但没有减少一个 rank 必须存储的专家权重. 没有模型并行时, rank 本地模型分片就是整个模型, 所以普通 DDP 在它的 D 个 rank 上每个都放全部 N 个 routed 专家. 因此增大 N 可以在不增加激活专家计算的情况下提高总参数容量, 但 compute weight 和梯度缓冲区照样增长, 直到一份副本放不下. EP 通过切分 routed 专家池解决这一显存限制, 已有的大规模 MoE 系统也是这样做的 (Lepikhin et al., 2021; Rajbhandari et al., 2022).

**EP uses the existing DP ranks.** EP shards expert weights, but it does not require a separate set of ranks in addition to the data-parallel ranks. In the base topology, the same D ranks that form the dense data-parallel group are organized into an EP\_MP rank axis of size $M _ { E }$ and an EP\_DP rank axis of size $D _ { E }$ . Let $\mathcal { A } _ { \mathrm { E P } _ { - } \mathrm { M P } }$ and A<sub>EP</sub>\_<sub>DP</sub> denote the coordinate sets of these axes. The DP group is their Cartesian product:

**EP 复用现有的 DP rank.** EP 对专家权重分片, 但不需要在数据并行 rank 之外另开一组 rank. 在基础拓扑里, 组成 dense 数据并行组的同一批 D 个 rank, 被组织成大小为 $M _ { E }$ 的 EP\_MP rank 轴和大小为 $D _ { E }$ 的 EP\_DP rank 轴. 记 $\mathcal { A } _ { \mathrm { E P } _ { - } \mathrm { M P } }$ 和 A<sub>EP</sub>\_<sub>DP</sub> 为这两条轴的坐标集合. DP 组就是它们的笛卡尔积:

$$
\mathcal {G} _ {\mathrm{DP}} = \mathcal {A} _ {\mathrm {EP\_MP}} \times \mathcal {A} _ {\mathrm {EP\_DP}}, \quad D = M _ {E} D _ {E}.\tag{8}
$$

Each pair of coordinates identifies one rank in the DP group. Dense parameters remain replicated across all D ranks. Routed-expert parameters are sharded across EP\_MP and replicated across EP\_DP. Equation 8 covers the case without CP. Appendix F derives the folded case, where a CP degree C gives $DC = M_{E}D_{E}$ within each pipeline stage.

每对坐标确定 DP 组里的一个 rank. dense 参数仍在全部 D 个 rank 上复制. routed 专家参数沿 EP\_MP 分片, 沿 EP\_DP 复制. 式 (8) 只覆盖没有 CP 的情况. 附录 F 推导折叠后的情况: CP 并行度为 C 时, 每个流水线 stage 内有 $DC = M_{E}D_{E}$.

The four-GPU example in Figure 11 shows this rank organization. Begin with D = 4 ranks and $N = 1 6$ routed experts. Set $M _ { E }   =   2$ and $D _ { E }   =   2$ . Each two-rank EP-MP group collectively holds one complete routed-expert set: one rank holds experts 0–7, and the other holds experts 8–15. There are two such EP-MP groups processing different data, so each expert shard has two copies. Attention, the router, and other non-sharded parameters remain replicated across the four dense-DP ranks.

Figure 11 的四卡例子展示了这种 rank 组织方式. 从 D = 4 个 rank, $N = 1 6$ 个 routed 专家开始. 设 $M _ { E } = 2$, $D _ { E } = 2$. 每个两 rank 的 EP-MP 组合起来持有一整套 routed 专家: 一个 rank 持有专家 0-7, 另一个持有专家 8-15. 这样的 EP-MP 组有两个, 处理不同的数据, 所以每个专家分片有两份副本. 注意力, router 和其他不分片的参数仍在四个 dense DP rank 上复制.

**A route connects a token-source rank to an expert rank.** The token-source rank holds the token before dispatch and receives its combined contribution. The expert rank stores and executes the selected expert. These are per-route roles, not additional parallel axes.

**一条路由连接一个 token 来源 rank 和一个专家 rank.** token 来源 rank 在 dispatch 之前持有这个 token, 并接收 combine 之后的结果. 专家 rank 存储并执行被选中的专家. 这是每条路由上的角色, 并没有引入额外的并行轴.

<sup>8</sup>Relative to a dense model with the same total parameter count, activating only K of N experts reduces per-token computation but not the bytes required to store the complete parameter set and its persistent training state.

<sup>8</sup>与总参数量相同的 dense 模型相比, N 个专家只激活 K 个, 减少的是单 token 计算量, 不是存储完整参数集及其持久训练状态所需的字节数.

<!-- page 31 of 168 -->

![Image block](images/p31-figure-11-a-four-gpu-example-with-and-16.jpg)

Figure 11 A four-GPU example with $\mathsf { D P } = 4 ,   \mathsf { E P } \mathsf { - M P } = 2 ,$ and 16 total experts. Starting from the fully replicated layout in Figure 6, the same four DP ranks form EP-MP groups of size 2 and EP-DP groups of size 2. Each EP-MP group keeps attention replicated and shards experts 0–7 and 8–15 across its two ranks. Dispatch moves selected token rows to the appropriate expert rank, and combine returns their contributions. Ranks holding corresponding shards in the two EP-MP groups are EP-DP replicas and reduce gradients together.

## EP Group Definitions · EP 分组定义

**Expert-sharding group (**EP\_MP**).** Ranks in this group hold different expert shards and exchange routed token rows during dispatch and combine. Because their expert parameters differ, they do not reduce expert gradients together.

**专家分片组 (EP\_MP).** 组内各 rank 持有不同的专家分片, 在 dispatch 和 combine 时互相交换路由后的 token 行. 它们的专家参数各不相同, 所以不在一起归约专家梯度.

**Expert-replica group (**EP\_DP**).** Ranks in this group hold replicas of the same expert shard and reduce that shard’s gradients together.

**专家副本组 (EP\_DP).** 组内各 rank 持有同一个专家分片的副本, 一起归约这个分片的梯度.

**EP reduces expert memory and gradient traffic.** Figure 9 previewed this decomposition under the report’s BF16-execution and FP32-optimizer policy. Abstracting from that specific precision policy, let $P _ { E }$ denote the routed-expert parameter count in the complete model. With an even expert assignment, each rank holds approximately

**EP 降低专家显存和梯度流量.** Figure 9 在本报告的精度策略 (BF16 执行, FP32 优化器) 下预先展示过这种拆分. 抛开具体精度策略, 记 $P _ { E }$ 为整个模型里路由专家的参数量. 专家均匀分配时, 每个 rank 大约持有

$$
\text {expert weights per rank} \approx \frac {P _ {E}}{M _ {E}}, \quad \text {expert - gradient elements per rank} \approx \frac {P _ {E}}{M _ {E}}.\tag{9}
$$

A rank synchronizes only its local expert shard over $D _ { E }$ replicas, rather than reducing the full expert pool over all D ranks. For a fixed EP-DP group size and reduction algorithm, the communicated expert-gradient volume therefore falls with $P _ { E } / M _ { E } ;$ the exact network bytes also depend on $D _ { E }$ and the collective algorithm. Dense, router, shared-expert, and other non-sharded parameters do not receive this EP-MP reduction; they

<!-- page 32 of 168 -->

continue to follow the dense DDP group. At fixed expert width, local expert weights and gradient buffers still grow as $N / M _ { E }$ . Keeping these per-rank tensors bounded as N grows therefore requires increasing $M _ { E } .$

每个 rank 只在 $D _ { E }$ 个副本之间同步本地的专家分片, 不必在全部 $D$ 个 rank 上归约整个专家池. EP-DP 组大小和归约算法固定时, 专家梯度的通信量随 $P _ { E } / M _ { E }$ 下降; 实际的网络字节数还取决于 $D _ { E }$ 和集合通信算法. 稠密参数, router, 共享专家以及其他不分片的参数享受不到 EP-MP 带来的缩减, 仍走稠密 DDP 组. 专家宽度固定时, 本地专家权重和梯度缓冲仍按 $N / M _ { E }$ 增长. 要让这些每 rank 张量在 $N$ 变大时不涨, 就得加大 $M _ { E }$.

**EP can reduce end-to-end step time when parameter-sized work dominates.** Dispatch and combine add work to every routed layer and microbatch, whereas gradient synchronization and parameter update occur once per optimizer step. When the gradient-accumulation count is small and the routed-expert state is large, reducing the rank-local expert shard from $P _ { E }$ to approximately $P _ { E } / M _ { E }$ can reduce the exposed expert gradient and update phase enough to outweigh the added per-microbatch EP work. The exact optimizer cost depends on its state placement: optimizer state for the local EP-MP shard may be sharded further over EP-DP. Figure 12 therefore shows a possible operating regime, not a topology-independent speedup.

**参数量级的工作占主导时, EP 能缩短端到端步时.** dispatch 和 combine 给每个路由层, 每个 microbatch 都加了活; 梯度同步和参数更新则每个优化器步只做一次. 梯度累积次数少, 路由专家的状态又大时, 把 rank 本地的专家分片从 $P _ { E }$ 缩到约 $P _ { E } / M _ { E }$, 省下的专家梯度同步与更新时间 (暴露在关键路径上的那部分) 可能多于 EP 每个 microbatch 新增的开销. 优化器的确切成本取决于状态放在哪里: 本地 EP-MP 分片的优化器状态还可以在 EP-DP 上再分片. 所以 Figure 12 展示的是一种可能的工作区间, 不是与拓扑无关的加速.

![Image block](images/p32-figure-12-ep-trades-per-microbatch-routing-overhead-for.jpg)

Figure 12 EP trades per-microbatch routing overhead for less parameter-sized work at the optimizer-step boundary. EP adds dispatch and combine to forward and backward, but each rank synchronizes and updates only its local routed-expert shard. With few accumulation microbatches and a large routed-expert pool, the reduction in exposed gradient-synchronization and parameter-update time can outweigh the added EP work and make end-to-end training faster. The widths are conceptual and not measured timings. Dense, router, shared-expert, and other non-sharded parameters do not receive the EP-MP reduction; optimizer-state work may be sharded further over EP-DP.

| Execution path | Tokens/s/GPU | Peak active memory |
| --- | --- | --- |
| No EP | 53,512 | 129.3 GiB |
| Block all-to-all EP8 | 54,063 | 77.85 GiB |

**Table 6 One intra-node EP feasibility point.** Conventional block all-to-all EP8 (Section 5.3) substantially reduces peak active memory while preserving similar end-to-end throughput at this operating point. Both runs completed cleanly.

In this run, EP reduced peak active memory by 51.45 GiB at similar throughput. As a single end-to-end feasibility point, it does not show whether reduced expert-gradient synchronization and optimizer-boundary work caused the 1.0% throughput difference, nor does it measure variance or generalize beyond this intra-node configuration. Section 5.3 examines the costs of the block all-to-all implementation used for this comparison.

这次运行里, EP 在吞吐相近的情况下把峰值活跃显存降了 51.45 GiB. 它只是一个端到端的可行性点: 不能说明 1.0% 的吞吐差是不是来自专家梯度同步和优化器边界工作的减少, 没有测方差, 也不能外推到这个节点内配置以外. 这次对比用的是 block all-to-all 实现, 它的开销在 §5.3 分析.

**Per-rank routed activations stay roughly constant as the EP-MP degree grows.** Let each rank originate T tokens before routing. Without EP, the rank processes approximately TK routed rows. An $EP-MP$ group of size $M _ { E }$ contains $M _ { E } T$ source tokens and distributes the resulting M<sub>E</sub>TK routes over $M _ { E }$ expert ranks. Under balanced routing, each rank therefore still processes approximately TK routed rows. Increasing $M _ { E }$ reduces the number of local experts and their persistent training state, but not the average routed rows or capacity-sized communication buffers per rank. Once the local expert shard is small, activations and other execution working memory set a floor, so larger EP-MP degrees provide diminishing peak-memory savings.

**EP-MP 度变大时, 每 rank 的路由激活基本不变.** 设每个 rank 路由前产出 $T$ 个 token. 不开 EP 时, 这个 rank 处理约 $TK$ 个路由行 ($K$ 是 top-K 的 K). 大小为 $M _ { E }$ 的 EP-MP 组共有 $M _ { E } T$ 个源 token, 产生的 $M _ { E } T K$ 条路由分到 $M _ { E }$ 个专家 rank 上. 路由均衡时, 每个 rank 处理的仍是约 $TK$ 行. 加大 $M _ { E }$ 减少的是本地专家个数和它们的常驻训练状态, 不减少每 rank 平均路由行数, 也不减少按容量开的通信缓冲. 本地专家分片缩小以后, 激活和其他执行期工作内存成了下限, EP-MP 度再加大, 峰值显存的节省就越来越少.

**Dense and expert parameters use different reduction groups.** A dense gradient must be reduced across all D dense-DP replicas. An expert gradient must instead be reduced across the $D _ { E }$ ranks that hold copies of that exact EP-MP shard. Reducing expert gradients across EP-MP would mix different experts;

<!-- page 33 of 168 -->

reducing dense gradients only across EP-DP would leave dense replicas out of agreement. The multi-group reducer introduced in Section 4 assigns each gradient bucket to its corresponding replica group.

**稠密参数和专家参数用不同的归约组.** 稠密梯度要在全部 $D$ 个稠密 DP 副本上归约. 专家梯度则只在持有同一 EP-MP 分片副本的 $D _ { E }$ 个 rank 上归约. 在 EP-MP 上归约专家梯度会把不同专家混在一起; 稠密梯度只在 EP-DP 上归约, 稠密副本之间就会不一致. §4 引入的多组 reducer 把每个梯度桶分派给对应的副本组.

Figure 13 shows both group types for the four-rank example.

Figure 13 用四 rank 的例子画出这两类组.

![Image block](images/p33-figure-13-ep-mp-routes-tokens-ep-dp-reduces.jpg)

Figure 13 EP-MP routes tokens; EP-DP reduces gradients. Within each EP-MP group, different ranks hold different expert shards, so routed token rows move between those ranks for expert computation. Within each EP-DP group, ranks holding replicas of the same expert shard reduce that shard’s gradients together: experts 0–7 reduce with their replicas, and experts 8–15 reduce with theirs. Token communication and gradient reduction therefore use different rank groups.

**EP adds token communication.** Before EP, every chosen expert is local to the token-source rank. After the expert pool is sharded, a remote route must dispatch its input row to the expert rank and combine the resulting contribution back at the token-source rank. This communication occurs in every routed layer and every microbatch, not only once at the global-step boundary. The reduced expert memory and gradient traffic therefore come with additional dispatch and combine communication. The next subsection compares these execution paths.

**EP 引入 token 通信.** 没有 EP 时, 被选中的专家都在 token 所在的源 rank 本地. 专家池分片后, 一条远端路由要先把输入行 dispatch 到专家 rank, 再把算出的贡献 combine 回源 rank. 这种通信发生在每个路由层, 每个 microbatch, 不只在全局步边界做一次. 所以专家显存和梯度流量的下降, 是用额外的 dispatch 和 combine 通信换来的. 下一小节比较这几条执行路径.

## 5.2 EP Adds Communication to Dispatch and Combine · EP 给 dispatch 和 combine 加上通信

**MoE dispatches and combines even when every expert is local.** A dense MLP applies the same local computation to every token. It has no router, expert-order permutation, or token communication. An MoE layer without EP first chooses experts for each token, permutes the accepted routes into expert-contiguous order, executes the grouped expert MLPs, and then unpermutes and combines the expert outputs. The permutation is local dispatch; the final unpermutation and weighted reduction are local combine. Grouped GEMM requires this expert-contiguous layout even though no rows cross ranks.

**专家全在本地时, MoE 也要 dispatch 和 combine.** 稠密 MLP 对每个 token 做同样的本地计算, 没有 router, 没有按专家重排, 也没有 token 通信. 不开 EP 的 MoE 层先给每个 token 选专家, 把被接受的路由重排成按专家连续的顺序, 跑分组的专家 MLP, 再逆重排并合并专家输出. 这次重排就是本地 dispatch; 最后的逆重排加加权归约就是本地 combine. 即使没有行跨 rank, grouped GEMM 也需要这种按专家连续的布局.

**EP extends dispatch and combine with an all-to-all exchange.** Conventional all-to-all EP extends local dispatch to permute–all-to-all–permute and local combine to unpermute–all-to-all–unpermute. Figure 14 compares this operator path with dense and local-MoE execution. Section 5.3 derives the intermediate layouts and identifies the two additional peer-major/expert-major conversions beyond the local-MoE path.

**EP 在 dispatch 和 combine 里插入一次 all-to-all.** 常规 all-to-all EP 把本地 dispatch 扩成「重排, all-to-all, 重排」, 把本地 combine 扩成「逆重排, all-to-all, 逆重排」. Figure 14 把这条算子路径和稠密执行, 本地 MoE 执行并排比较. §5.3 推导中间布局, 并指出比本地 MoE 多出来的两次 peer-major 与 expert-major 之间的布局转换.

**Conventional all-to-all EP adds layout and synchronization work beyond the transfer itself.** Relative to local MoE, it adds a rank exchange, up to two additional layout passes, peer-packed buffers, launches, and synchronization around the useful expert GEMMs. These EP-specific costs can remain on the critical path even when network bandwidth is sufficient; Section 5.3 traces them to concrete operations.

**常规 all-to-all EP 在传输之外还加了布局和同步工作.** 相对本地 MoE, 它在有用的专家 GEMM 前后加了一次 rank 间交换, 最多两趟额外的布局变换, 按 peer 打包的缓冲, 若干次 kernel 启动和同步. 网络带宽够用时, 这些 EP 特有的开销照样可能留在关键路径上; §5.3 把它们落到具体操作.

Comparing these execution paths fairly requires giving every path the same inputs, routes, and expert work; otherwise a routing or workload difference can be mistaken for an execution-path improvement. The profiled

<!-- page 34 of 168 -->

| Attention | Linear 1 | SwiGLU | Linear 2 |
| --- | --- | --- | --- |

![Image block](images/p34-figure-14-routing-overhead-grows-from-dense-execution-to.jpg)

Figure 14 Routing overhead grows from dense execution to local MoE and conventional all-to-all EP. A dense MLP has no routing path. MoE without EP adds one local permutation into expert order and one unpermutation back to token order. Conventional all-to-all EP expands dispatch into permute–all-to-all–permute and combine into unpermute–all-to-all–unpermute. Rowwise EP instead attempts to move selected rows directly between token-source and expert ranks. The drawing is not performance evidence.

comparison in Section 5.4 matches these factors. End-to-end training speed is a separate question, because EP also changes the gradient-synchronization and optimizer work at the step boundary.

公平比较这几条执行路径, 要给每条路径相同的输入, 路由和专家工作量; 否则路由或负载上的差别会被误当成执行路径的改进. §5.4 的 profile 对比对齐了这些因素. 端到端训练速度是另一个问题, 因为 EP 还改变了步边界上的梯度同步和优化器工作.

## 5.3 Packed All-to-All Requires Peer-Contiguous Blocks · 打包式 all-to-all 要求按 peer 连续的块

**Block all-to-all moves one contiguous block per peer.** We call the conventional path **block all-to-all EP**: its transport moves one contiguous block of rows per peer rank, never individual token rows. The path expresses dispatch with $\mathrm { P y }$ Torch variable-split all\_to\_all\_single on an NCCL process group (PyTorch Contributors, 2026b; NVIDIA, 2026f). Each rank supplies one flat send buffer partitioned into a contiguous slice per destination and receives a contiguous slice per source. The call cannot scatter arbitrary token rows directly into arbitrary remote expert slots. The sender must therefore pack all accepted routes for destination rank 0, then destination rank 1, and so on. This peer-block packing is a common expert-parallel implementation pattern (Hwang et al., 2023; Yan et al., 2026). Figure 15 traces the complete packing path for a two-rank example.

**block all-to-all 给每个 peer 搬一个连续块.** 我们把常规路径叫作 **block all-to-all EP**: 它的传输层每个 peer rank 搬一整块连续的行, 从不单独搬某个 token 行. 这条路径用 NCCL 进程组上 PyTorch 的变长切分 all\_to\_all\_single 实现 dispatch (PyTorch Contributors, 2026b; NVIDIA, 2026f). 每个 rank 提供一个扁平的发送缓冲, 按目的地切成连续的段, 也按来源收回连续的段. 这个调用没法把任意 token 行直接散到远端任意专家槽位. 发送方只能先打包发往 rank 0 的全部已接受路由, 再打包 rank 1 的, 依次类推. 按 peer 分块打包是专家并行的常见实现方式 (Hwang et al., 2023; Yan et al., 2026). Figure 15 用两 rank 的例子走完整条打包路径.

**Expert order requires a second layout change.** After the transfer, the receive buffer is grouped by source rank, not by the local expert that will process each row. A second permutation places those rows into expert-contiguous intervals before grouped GEMM. Combine reverses the layout changes: it converts expert order into source-rank blocks, returns those blocks through the reverse all-to-all, and then restores token order and applies the router weights. The outer token-to-expert and expert-to-token conversions are already present in local MoE. With multiple local experts, packed peer exchange can require two additional peer-major/expert-major conversions, for four passes total; with one local expert, the extra pair is skipped.

**专家顺序还需要第二次布局变换.** 传完之后, 接收缓冲按来源 rank 分组, 而不是按处理每行的本地专家分组. grouped GEMM 之前还得再重排一次, 把这些行放进按专家连续的区间. combine 把布局变换倒着走一遍: 先把专家顺序转回按来源 rank 分块, 经反向 all-to-all 送回, 再恢复 token 顺序并乘 router 权重. 外层的 token 到专家, 专家到 token 两次转换本地 MoE 里本来就有. 本地专家不止一个时, 按 peer 打包的交换会再多出两次 peer-major 与 expert-major 之间的转换, 一共四趟; 本地只有一个专家时, 多出的这一对可以省掉.

**Dynamic peer-block lengths create a host dependency in the current path.** Because routing changes the peer-block lengths every microbatch, Olmo-core’s implementation converts GPU-produced peer counts into host split lists before launching the variable-split exchange; when we emphasize this host depen-

<!-- page 35 of 168 -->

![Image block](images/p35-figure-15-block-all-to-all-ep-exposes-the.jpg)

Figure 15 Block all-to-all EP exposes the complete packing path. In this illustrative two-rank, top-2 example, local dispatch replicates token rows and packs routes by destination rank. The first all-to-all exchanges peer-contiguous blocks, and a global permutation converts the received rank-major layout into local-expert order for grouped GEMM. Combine reverses the global layout conversion and all-to-all, restores token order, fills a capacity-dropped route with zero, and merges route contributions using the router weights. The drawing explains data layout and movement, not measured performance.

dency, we call it the synchronized path. Section 8.4 explains how this device-to-host dependency reduces submission headroom and how independent work can cover, but not remove, the wait.

**peer 块长度随路由变化, 在现有路径里造成对 host 的依赖.** 路由每个 microbatch 都会改变各 peer 块的长度, 所以 Olmo-core 的实现在发起变长交换前, 要把 GPU 算出的各 peer 计数转成 host 端的切分列表; 强调这层 host 依赖时, 我们把它叫作同步路径. §8.4 讲这种设备到 host 的依赖怎样吃掉提交余量, 以及独立工作为什么只能掩盖这段等待, 去不掉它.

**Faster links shrink only the all-to-all itself.** The peer/expert layout conversions, peer-packed buffers, and this implementation’s host dependency remain. Network bandwidth alone therefore cannot explain the cost of the complete block all-to-all path.

**更快的链路只缩短 all-to-all 本身.** peer 与专家之间的布局转换, 按 peer 打包的缓冲, 以及这个实现的 host 依赖都还在. 所以光看网络带宽解释不了整条 block all-to-all 路径的开销.

## 5.4 Rowwise EP Removes Block Packing · Rowwise EP 去掉分块打包

**Rowwise EP transfers each row directly to its expert slot. Rowwise EP** replaces block packing with direct row placement: each accepted token row is transferred on its own, straight into the destination buffer row where its selected expert expects it. For T local tokens and top-K routing, Olmo-core constructs two GPU tensors of shape [T, K]. One gives the destination EP-MP rank for each accepted route; the other gives the row in that rank’s expert-capacity buffer. Negative entries represent invalid or capacity-dropped routes; Section 10.3 defines the capacity policy and its drop metrics, and in stable training the routing distribution stays nearly dropless. A dispatch kernel uses these two indices to move $x _ { t }$ directly to its destination row. The communication output is already expert-contiguous on each destination rank, so grouped expert computation does not require a packed peer buffer or a second permutation.

**Rowwise EP 把每一行直接送进它的专家槽位.** **Rowwise EP** 用逐行直接放置代替分块打包: 每个被接受的 token 行单独传输, 直接写进目标缓冲里所选专家等着读的那一行. 对 $T$ 个本地 token 和 top-K 路由, Olmo-core 构造两个形状为 [T, K] 的 GPU 张量. 一个给出每条被接受路由的目标 EP-MP rank, 另一个给出它在该 rank 专家容量缓冲里的行号. 负值表示无效路由或因容量被丢弃的路由; 容量策略和丢弃指标在 §10.3 定义, 稳定训练时路由分布几乎不丢. dispatch kernel 按这两个索引把 $x _ { t }$ 直接搬到目标行. 通信输出在每个目标 rank 上已经按专家连续排好, 所以分组专家计算既不需要按 peer 打包的缓冲, 也不需要第二次重排.

The destination row is deterministic. The route-map builder combines the destination expert, the number of earlier accepted routes for that expert, and the offsets of the preceding local experts. It also applies the capacity decision before communication. The map therefore records both the remote destination rank and the precise row consumed by the selected expert. Route counts and overflow metadata remain on the GPU; they are not converted into host split lists for the data movement. Direct placement presupposes that a kernel on the token-source rank can write a row that lives on the expert rank. Section 5.5 introduces the

<!-- page 36 of 168 -->

symmetric-memory and GPU-initiated communication (NVSHMEM/RDMA) mechanisms that make remote rows addressable.

目标行是确定的. route map 的构造器把三样东西合起来: 目标专家, 该专家之前已接受的路由数, 以及排在它前面的本地专家的偏移. 容量判定也在通信之前完成. 所以 route map 同时记下远端目标 rank 和所选专家要读的确切行. 路由计数和溢出元数据都留在 GPU 上, 不为数据搬运转成 host 端切分列表. 直接放置的前提是, 源 rank 上的 kernel 能写专家 rank 上的某一行. §5.5 介绍让远端行可寻址的对称内存和 GPU 发起通信 (NVSHMEM/RDMA) 机制.

> **拆开:** §5.4 说目标行由「该专家之前已接受的路由数」决定, 且计数不下发到 host. 可一个专家的槽位同时被 EP-MP 组内所有源 rank 写入, 源 rank 怎么知道别的 rank 已经占了几行?
> 答: 只靠本地计数做不到, 需要一次组内交换. §8.5 写了「The count exchange is one all-gather over the EP-MP group」. 代码 `src/olmo_core/nn/moe/v2/ep_no_sync_common.py` 的 `sync_tail_drop_allowed_splits_single_a2a` 做的就是这件事: 每个 rank 的请求计数形状是 [目标 rank, 本地专家], `all_gather_into_tensor` 拼成 [源 rank, 目标 rank, 本地专家] 的全局矩阵, 再按「本地专家优先, 其次源 rank」展平做 cumsum, 截到 `rank_capacity`. 各 rank 用同一份全局矩阵算出同一张 keep 矩阵, 于是某源 rank 在某专家上的起始行 = 前面本地专家的保留总数 + 编号更小的源 rank 在该专家上的保留数, 本 rank 内部再按顺序排. 这样不需要 host 介入, 也不需要锁. 一个副作用: 截断是对累积和做的, 容量满时先被丢的是编号靠后的本地专家和编号靠后的源 rank, 丢弃并不在专家间均摊. 该函数名带 `single_a2a`, rowwise 路径的行号构造是否完全复用它, 我没有逐行追到 kernel, 但 §8.5 的「一次 all-gather」和这里的布局一致.

**Rowwise EP adds indexing and ordering costs.** Rowwise movement replaces a small number of block transfers with many indexed row transfers and adds route-map construction, fixed-capacity storage, and explicit write-ordering between communication and compute. It is beneficial only when those costs are lower than the permutations, temporary buffers, and host stalls of the block all-to-all path. Its end-to-end advantage depends on expert shape, EP degree, route imbalance, and network topology, which the current measurements only partly cover.

**Rowwise EP 增加了索引和排序开销.** 逐行搬运把少量分块传输换成大量带索引的行传输, 还要额外构造 route map, 预留固定容量的存储, 并在通信和计算之间显式排定写入顺序. 只有这些开销低于 block all-to-all 路径的重排, 临时缓冲和 host 停顿时, 它才划算. 端到端能赚多少取决于专家形状, EP 度, 路由不均衡程度和网络拓扑, 现有测量只覆盖了其中一部分.

Figures 15 and 16 make the layout difference explicit. The block all-to-all path packs accepted routes into contiguous destination-rank blocks, exchanges those blocks, and then reorders the received rows into localexpert order. Combine reverses both layout conversions. Rowwise EP instead uses the GPU route map to place each accepted row directly in its destination expert-capacity slot and reverses that indexed movement during combine. It removes packed peer buffers and up to four explicit layout conversions; it does not remove routing, communication, grouped expert computation, or the synchronization that orders remote writes between ranks.

Figure 15 和 Figure 16 把布局差别画了出来. block all-to-all 路径把被接受的路由打包成按目标 rank 连续的块, 交换这些块, 再把收到的行重排成本地专家顺序; combine 把两次布局转换都倒回去. Rowwise EP 则用 GPU 上的 route map 把每个被接受的行直接放进目标专家的容量槽位, combine 时沿同样的索引反向搬运. 它去掉了按 peer 打包的缓冲和最多四次显式布局转换; 路由, 通信, 分组专家计算, 以及在 rank 间排定远端写入顺序的同步, 一样都没去掉.

![Image block](images/p36-figure-16-rowwise-ep-targets-remote-expert-rows-without.jpg)

Figure 16 Rowwise EP targets remote expert rows without block packing. In the same illustrative two-rank, top-2 example as Figure 15, GPU-resident route indices drive a rowwise dispatch kernel that places accepted rows directly into fixed-capacity rank- and expert-major storage. Grouped GEMM consumes that layout without a second permutation. Rowwise combine returns expert outputs directly to their source-token positions for weighted merging, without materializing a peer-packed return buffer. The “AllToAll” labels inside the drawing denote the logical rank exchange; the implementation uses indexed one-sided row movement rather than an NCCL all-to-all collective. The drawing explains data layout and movement, not measured performance.

<!-- page 37 of 168 -->

<table><tr><td rowspan="2">Phase</td><td colspan="2">Block all-to-all EP</td><td colspan="2">Rowwise EP</td></tr><tr><td>Operation</td><td>ms</td><td>ms</td><td>Operation</td></tr><tr><td rowspan="3">Dispatch</td><td>Local permute</td><td>0.351</td><td></td><td></td></tr><tr><td>All-to-all</td><td>1.960</td><td>2.298</td><td>Route-map build + row dispatch</td></tr><tr><td>Global permute</td><td>0.532</td><td></td><td></td></tr><tr><td>Compute</td><td>Grouped GEMM</td><td>3.630</td><td></td><td></td></tr><tr><td rowspan="3">Combine</td><td>Global unpermute</td><td>0.712</td><td></td><td></td></tr><tr><td>All-to-all</td><td>1.970</td><td>2.423</td><td>Row gather + weighted reduce</td></tr><tr><td>Local unpermute + merge</td><td>0.391</td><td></td><td></td></tr><tr><td colspan="2">Dispatch + combine</td><td>5.916</td><td>4.721</td><td></td></tr></table>

Figure 17 shows the same example as two cumulative-duration paths: three explicit block-path stages on each side of expert computation versus one aggregated rowwise phase.

Figure 17 把同一个例子画成两条累计耗时路径: 专家计算两侧, block 路径各有三个显式阶段, rowwise 各只有一个聚合阶段.

![Image block](images/p37-figure-17-rowwise-ep-removes-the-block-packing-stages.jpg)

Figure 17 Rowwise EP removes the block-packing stages around expert computation. Block all-to-all EP exposes separate layout and collective stages in dispatch and combine. Each rowwise phase aggregates two displayed subranges: route-map construction plus row dispatch, or row gather plus weighted reduction. Horizontal width shows cumulative displayed duration within each trace, not temporal alignment between traces. The traces were captured on different nodes, so this is mechanism evidence rather than a controlled performance comparison.

This example is consistent with the intended mechanism: rowwise replaces four explicit layout transformations and two peer-block collectives with a GPU-resident route map and indexed row movement, with device routemap construction included in the rowwise total. The displayed ranges exclude the block path’s host split-list wait (Section 8.4). This instance identifies the affected operations but does not establish the size of the saving across workloads and networks.

这个例子与设计意图相符: rowwise 用驻留 GPU 的 route map 加索引式行搬运, 换掉了四次显式布局变换和两次按 peer 分块的集合通信, rowwise 的总时间里已经算上了设备端构造 route map 的耗时. 图中区间不含 block 路径等待 host 切分列表的时间 (§8.4). 这个实例指出了受影响的是哪些操作, 但不能说明在不同负载和网络上能省多少.

> 答: 按表拆: block 路径两次 all-to-all 是 1.960 + 1.970 = 3.930 ms, 四次布局变换是 0.351 + 0.532 + 0.712 + 0.391 = 1.986 ms. rowwise 两个阶段 2.298 + 2.423 = 4.721 ms, 比 block 的纯传输还多 0.791 ms, 而且这 4.721 ms 里含 route map 构造和加权归约. 所以逐行搬运本身并不比 NCCL 分块交换快, 节省全部来自去掉的 1.986 ms 布局变换, 再扣掉 rowwise 多出的那部分. 两条 trace 采自不同节点 (Figure 17 题注), 0.8 ms 量级的差别不能当精确值. 表里没算 block 路径的 host 等待, 把它算进去会进一步拉开差距, 这部分收益属于 §8 的同步问题, 不属于本节的布局问题.

**Direct placement also lets communication use the MXFP8 representation consumed by grouped GEMM.** Olmo can quantize rows during dispatch, let expert grouped GEMM consume the received qdata (quantized data) and scales directly, and return quantized outputs before local reduction. Communication and expert compute thus share one representation without an intervening BF16 materialization. Section 11.4 follows the integrated forward and backward path.

**直接放置还让通信能直接用 grouped GEMM 要吃的 MXFP8 表示.** Olmo 可以在 dispatch 时量化行, 让专家 grouped GEMM 直接读收到的 qdata (量化数据) 和 scale, 在本地归约之前回传量化后的输出. 通信和专家计算于是共用同一种表示, 中间不必落一份 BF16. §11.4 跟踪前向和反向合在一起的完整路径.

<!-- page 38 of 168 -->

## 5.5 Symmetric Memory Addresses Remote Rows · 对称内存让远端行可寻址

**Direct placement requires a remote address.** Ordinary device pointers name local memory. Symmetric memory gives the participating ranks corresponding regions in a symmetric heap, so a local offset together with a peer-rank index names the matching remote location (Figure 18). In the current Olmo-core setup, each EP-MP process group forms the NVSHMEM bootstrap world used by its rowwise kernels. All ranks in that group allocate the same set of buffers, with matching shapes and allocation order (NVIDIA, 2026t).

**直接放置需要远端地址.** 普通设备指针指向的是本地内存. 对称内存让参与的各 rank 在对称堆里拥有一一对应的区域, 于是「本地偏移 + peer rank 编号」就能指到对端的对应位置 (Figure 18). 在 Olmo-core 现在的设置里, 每个 EP-MP 进程组构成一个 NVSHMEM 引导域 (bootstrap world), 供它的 rowwise kernel 使用. 组内所有 rank 分配同一组缓冲, 形状和分配顺序都一致 (NVIDIA, 2026t).

Olmo-core uses NVSHMEM because it permits GPU-initiated one-sided operations. A CUDA kernel can issue a PUT to a remote expert row or a GET from one without first constructing a host-managed peer block. This does not mean that NVSHMEM is universally faster than NCCL. It provides the addressability and fine-grained movement required by this particular rowwise design (NVIDIA, 2026t,h).

Olmo-core 选 NVSHMEM, 是因为它支持 GPU 发起的单边操作. CUDA kernel 可以直接向远端专家行发 PUT, 或从远端行 GET, 不必先构造一个由 host 管理的 peer 块. 这不等于 NVSHMEM 在所有场景下都比 NCCL 快, 只是它提供了这套 rowwise 设计需要的可寻址性和细粒度搬运 (NVIDIA, 2026t,h).

**Safe buffer reuse is a separate problem from addressability.** A symmetric pointer may remain valid while the value at that address is still needed by an earlier microbatch. Every rank must agree on buffer capacity and initialization before communication begins, and the runtime must prevent a later operation from overwriting a row until its final forward or backward consumer has completed. Matching allocations alone cannot prevent premature reuse; the runtime also needs explicit ordering and buffer-reuse rules.

**缓冲能否安全复用, 和能否寻址是两回事.** 对称指针一直有效, 但那个地址上的值可能还被更早的 microbatch 用着. 通信开始前, 所有 rank 必须在缓冲容量和初始化上达成一致; 运行时还必须保证, 某一行的最后一个前向或反向消费者完成之前, 后来的操作不能覆盖它. 分配对齐本身挡不住过早复用, 运行时还需要显式的排序规则和缓冲复用规则.

![Image block](images/p38-figure-18-symmetric-memory-makes-matching-offsets-remotely-addressable.jpg)

Figure 18 Symmetric memory makes matching offsets remotely addressable. Participating EP-MP ranks create corresponding heap regions. A local offset and a peer-rank index therefore identify the matching remote location, allowing a GPU kernel to address an expert-capacity row directly. The allocation establishes addressability; ordering and buffer-reuse rules still determine when a row may be read or overwritten.

## 5.6 Routes Use PUT and GET · 路由用 PUT 和 GET

**MoE operations and transport directions are distinct.** Dispatch and combine describe the MoE computation; PUT and GET describe the direction of the one-sided transfer. Table 8 shows the mapping used by the rowwise path.

**MoE 操作和传输方向是两套概念.** dispatch 和 combine 描述的是 MoE 计算; PUT 和 GET 描述的是单边传输的方向. Table 8 列出 rowwise 路径里两者的对应关系.

| MoE operation | Transfer | Row movement |
| --- | --- | --- |
| Dispatch forward | PUT | The token-source rank pushes x<sub>t</sub> to the capacity row assigned to the selected expert. |
| Combine forward | GET | The token-source rank pulls the selected expert outputs and performs the router-weighted reduction locally. |
| Combine backward | PUT | The token-source rank pushes each router-weighted output gra-dient to the corresponding expert-output gradient row. |
| Dispatch backward | GET | The token-source rank pulls the route gradients and sums them into the gradient of the original token row. |

<!-- page 39 of 168 -->

**Fan-out favors source-initiated PUT.** A top-K token row may need to reach several expert ranks. With PUT, the token-source rank reads its local row and writes each route into a distinct remote capacity slot. Expressing the same fan-out as destination-initiated GETs makes several peers read the same remote source row, concentrating access pressure at that source (Figure 19).

**一对多分发适合由源端发起 PUT.** 一个 top-K 的 token 行可能要送到好几个专家 rank. 用 PUT 时, 源 rank 读本地这一行, 把每条路由写进远端不同的容量槽位. 如果改成由目的端发起 GET, 几个 peer 会去读同一个远端源行, 访问压力集中到这个源上 (Figure 19).

![Image block](images/p39-figure-19-put-fan-out-writes-distinct-destinations-get.jpg)

Figure 19 PUT fan-out writes distinct destinations; GET fan-out converges on one source. On the left, one rank issues PUTs from a local source row into separate remote target rows. On the right, multiple target ranks issue GETs against the same remote source row. The arrows show which rank issues the one-sided operation toward the remote address. The check and cross refer only to same-source access contention: PUT kernels still share memory bandwidth, streaming multiprocessors (SMs), and fabric resources with other work.

Forward dispatch writes directly into expert-contiguous capacity storage. The expert rank then runs grouped expert computation over the valid row intervals. Forward combine gathers the K selected expert rows for each local token, multiplies them by their router weights, and sums them into token order. The custom autograd functions save the route map so backward applies the exact transpose movements in Table 8. The routerweight gradient uses the gathered expert outputs and the token-output gradient from the same accepted routes.

前向 dispatch 直接写进按专家连续的容量存储, 专家 rank 再对有效行区间做分组专家计算. 前向 combine 为每个本地 token 取回所选的 $K$ 个专家输出行, 乘上各自的 router 权重, 按 token 顺序求和. 自定义 autograd 函数保存 route map, 反向时按 Table 8 做严格转置的搬运. router 权重的梯度用同一批被接受路由取回的专家输出和 token 输出梯度来算.

Invalid routes remain explicit throughout this path. Rowwise PUT kernels skip negative destinations; combine gathers zero for invalid entries before the local reduction. Capacity handling is therefore part of the route map rather than an implicit property of unwritten memory.

无效路由在整条路径上都是显式的. rowwise PUT kernel 跳过负的目标; combine 在本地归约前对无效项取零. 容量处理因此是 route map 的一部分, 不依赖「没写过的内存」这种隐含性质.

## 5.7 Buffer Reuse and Ordering Are Explicit in Rowwise EP · Rowwise EP 里缓冲复用和排序都是显式的

**A microbatch fills only a prefix of each capacity buffer.** Rowwise communication reserves capacitysized destination buffers, but a microbatch usually writes only a prefix of the rows assigned to each local expert. Unwritten tail rows may contain values from an earlier use. Expert forward and backward therefore receive the real per-expert row offsets, and grouped GEMM and the expert weight-gradient GEMM (Wgrad) skip the unwritten tails. Clearing the whole capacity buffer is useful as a diagnostic, but it adds unnecessary memory traffic to the normal path.

**一个 microbatch 只填满每个容量缓冲的前缀.** rowwise 通信按容量预留目标缓冲, 但一个 microbatch 通常只写每个本地专家所分配行的前一段. 没写到的尾部行可能留着上一次用剩的值. 所以专家前向和反向拿到的是每个专家的真实行偏移, grouped GEMM 和专家权重梯度 GEMM (Wgrad) 都跳过没写的尾部. 把整个容量缓冲清零可以当诊断手段, 放在正常路径上只会白添内存流量.

**Direct access avoids staging copies but extends buffer use into backward.** Grouped GEMM reads the symmetric dispatch buffer in place instead of copying its contents into a regular tensor. Its saved Wgrad input therefore remains in the same buffer that a later dispatch could overwrite. Figure 20 shows where direct access removes copies; the resulting buffer-reuse constraints depend on how long each consumer needs the data.

**直接访问省掉了中转拷贝, 却把缓冲的使用期延到了反向.** grouped GEMM 原地读对称 dispatch 缓冲, 不把内容拷进普通张量. 于是它为 Wgrad 保存的输入还躺在同一个缓冲里, 而后面的 dispatch 可能覆盖这个缓冲. Figure 20 标出直接访问在哪里省掉了拷贝; 由此带来的复用约束取决于每个消费者要用这份数据多久.

**Reusing buffers across blocks saves memory but can overwrite saved payloads.** Symmetric buffers are allocated collectively and stay resident, so giving every MoE block private symmetric buffers makes resident symmetric memory grow with the number of local blocks. Sharing buffers across blocks removes that growth, but forward and backward visit blocks in opposite orders: block ℓ+1’s dispatch would

<!-- page 40 of 168 -->

![Image block](images/p40-figure-20-crossing-the-regular-symmetric-boundary-staging-copies.jpg)

Figure 20 Crossing the regular–symmetric boundary: staging copies versus direct access. The remote endpoint of a one-sided transfer must live in the symmetric heap, which is allocated separately from regular PyTorch tensors; inter-node GPU-initiated transfers require the local endpoint to be symmetric as well. (a) A generic integration pays one copy on each side of the boundary. (b) The Olmo-core rowwise path removes these copies where kernels can target symmetric memory directly: the expert grouped GEMM reads the dispatch buffer in place, the down projection writes its output directly into the symmetric combine buffer, and MXFP8 dispatch fuses quantization into the PUT kernel. Conceptual illustration with no measured quantities.

overwrite the payload that block ℓ saved, long before block ℓ’s backward reads it (Figure 21). Whether a buffer faces this hazard is decided by its immediate consumer. The dispatch buffer feeds the up-projection grouped GEMM, which saves its input for Wgrad, so the buffer must survive until backward. The expertoutput buffer is only read by the combine transfer, and backward re-routes gradients with the saved route map (the router-weight gradient uses a separate gather capture on the token-source rank), so it is scratch and may be reused as soon as the transfer completes.

**跨 block 复用缓冲省显存, 但可能覆盖已保存的数据.** 对称缓冲是集体分配并常驻的, 给每个 MoE block 配私有对称缓冲, 常驻对称内存就随本地 block 数增长. 让各 block 共享缓冲可以消除这种增长, 但前向和反向访问 block 的顺序相反: block $\ell+1$ 的 dispatch 会覆盖 block $\ell$ 保存的数据, 而 block $\ell$ 的反向要很久以后才读它 (Figure 21). 一个缓冲有没有这种风险, 由它的直接消费者决定. dispatch 缓冲喂给 up-projection 的 grouped GEMM, 后者为 Wgrad 保存输入, 所以这个缓冲必须活到反向. 专家输出缓冲只被 combine 传输读一次, 反向用保存的 route map 重新路由梯度 (router 权重梯度另在源 rank 上单独抓取一份 gather 结果), 所以它是临时缓冲, 传输一完成就能复用.

**Autograd determines when a buffer may be reused.** Under pipeline parallelism, several later forwards may execute before the Wgrad that reads a block’s saved dispatch payload. Remote writes through custom communication kernels are not protected by PyTorch’s ordinary tensor version checks, so Olmo-core attaches autograd-held leases to symmetric payloads that remain visible to backward. Each lease prevents reuse until the corresponding autograd node releases it after its final consumer. When activation checkpointing recomputes the payload for backward, the original forward can instead use shared scratch storage. Figure 22 shows how a lease keeps a dispatched payload available for its backward consumer.

**什么时候能复用缓冲, 由 autograd 决定.** 在 PP 下, 读某个 block 已保存 dispatch 数据的 Wgrad 执行之前, 可能已经跑过好几个后续前向. 通过自定义通信 kernel 做的远端写入不受 PyTorch 普通张量版本检查的保护, 所以 Olmo-core 给反向还要看到的对称数据挂上由 autograd 持有的租约 (lease). 对应的 autograd 节点在最后一个消费者用完后释放租约, 之前这块存储不许复用. 如果激活 checkpoint 会在反向时重算这份数据, 原始前向就可以改用共享的临时存储. Figure 22 展示租约怎样让 dispatch 出去的数据留给反向消费者.

**One-sided communication requires explicit ordering.** Expert compute must not read a destination row before all required dispatch writes are visible. A buffer must not be overwritten while a peer is still reading it, and all ranks participating in a barrier or collective kernel must enter a compatible operation order. The rowwise path uses stream ordering and NVSHMEM completion operations around these phase boundaries. Removing the host split-size wait does not remove distributed synchronization; it moves the required agreement and completion into the GPU execution path (NVIDIA, 2026h).

**单边通信需要显式排序.** 所需的 dispatch 写入全部可见之前, 专家计算不能读目标行. peer 还在读的缓冲不能被覆盖, 参与 barrier 或集合通信 kernel 的所有 rank 必须以相容的顺序进入操作. rowwise 路径在这些阶段边界上用 stream 排序和 NVSHMEM 完成操作来保证. 去掉 host 切分大小的等待, 并没有去掉分布式同步, 只是把必要的一致和完成确认挪到了 GPU 执行路径里 (NVIDIA, 2026h).

**MXFP8 adds a reuse constraint between quantized activations and gradients.** As on the BF16 path, Wgrad needs the dispatched input. A BF16 route carries one row; an MXFP8 route carries qdata and scale rows that follow the same destination indices and validity mask. Backward must consume both saved components before the slot is reused for quantized gradient rows. This shared-buffer constraint is one reason Olmo-core fuses dispatch, expert computation, and combine into a single autograd node on the MXFP8 path (Section 11.4).

**MXFP8 在量化激活和量化梯度之间又加了一条复用约束.** 和 BF16 路径一样, Wgrad 需要 dispatch 进来的输入. BF16 的一条路由带一行数据; MXFP8 的一条路由带 qdata 行和 scale 行, 两者用同一组目标索引和有效掩码. 这个槽位被量化梯度行复用之前, 反向必须把这两份保存的数据都用完. 这条共享缓冲约束是 Olmo-core 在 MXFP8 路径上把 dispatch, 专家计算和 combine 融合成一个 autograd 节点的原因之一 (§11.4).

<!-- page 41 of 168 -->

![Image block](images/p41-figure-21-a-shared-symmetric-buffer-saves-memory-but.jpg)

Figure 21 A shared symmetric buffer saves memory but can overwrite saved payloads. With a private symmetric buffer per block, each saved payload survives untouched until its block’s backward, but resident symmetric memory grows with the number of local blocks; one shared buffer keeps the footprint constant, but forward visits blocks in order 1, 2, 3 while backward returns in order 3, 2, 1, so block 1’s backward reads a payload that later blocks have overwritten. Scratch buffers, which no later operation reads, safely take the shared path; payloads saved for backward keep per-block slots whose reuse is controlled by the lease system of Figure 22, and activation recomputation turns a saved payload back into scratch, restoring the shared option. Conceptual illustration with no measured quantities.

![Image block](images/p41-figure-22-a-lease-pins-the-dispatch-buffer-until.jpg)

Figure 22 A lease pins the dispatch buffer until its backward consumer finishes. The routed grouped GEMM saves the dispatch buffer as its Wgrad input, so an autograd-held lease pins the slot until the backward that consumes it releases it, and a later forward acquires a different slot from a pool sized before training starts. Conceptual illustration with no measured quantities.

## 5.8 DeepEP v2 Provides an Optional EP Backend · DeepEP v2 作为可选的 EP 后端

**DeepEP v2 is an effective inter-node alternative.** Olmo-core can select DeepEP v2 for dispatch and combine while retaining its router, capacity policy, expert kernels, autograd integration, and optimizer (Zhao et al., 2025b). DeepEP v2 is block-oriented like the path in Section 5.3: it exchanges per-peer batches of rows rather than individual rows. The difference is that packing, transfer, and unpacking happen inside its dispatch and combine calls with GPU-resident metadata, so the model-facing path keeps no host split lists.

**DeepEP v2 是跨节点时好用的替代方案.** Olmo-core 可以让 dispatch 和 combine 走 DeepEP v2, 同时保留自己的 router, 容量策略, 专家 kernel, autograd 集成和优化器 (Zhao et al., 2025b). DeepEP v2 和 §5.3 的路径一样面向块: 它按 peer 成批交换行, 不逐行交换. 区别在于打包, 传输和解包都在它的 dispatch 和 combine 调用内部完成, 元数据驻留 GPU, 所以模型这一侧的路径不保留 host 端切分列表.

**Block transfers reduce the NIC request rate.** The block orientation matters most across nodes. Within a node, NVLink transfer time is governed mainly by payload bytes, so rowwise EP’s many small row transfers cost little beyond the bytes they move. Across nodes, every transfer becomes a request that the network interface controller (NIC) must process, and a pattern that issues one request per route can saturate the NIC’s message rate before it saturates link bandwidth (Section 7 describes the GPU-to-NIC submission path). Aggregating rows into a few large per-peer transfers keeps the request count low. Our observations are consistent with this reasoning, though we have not measured the attribution. DeepEP v2 has performed well in our current inter-node experiments, which makes it useful when an EP-MP group spans nodes (on our eight-GPU nodes, EP-MP degrees greater than eight); rowwise EP remains the production intra-node path.

**分块传输降低网卡请求率.** 面向块的设计在跨节点时最要紧. 节点内, NVLink 传输时间主要由数据字节数决定, rowwise EP 的大量小行传输除了搬运的字节本身, 几乎没有额外开销. 跨节点时, 每次传输都变成网卡 (NIC) 要处理的一个请求; 每条路由发一个请求的模式, 可能在链路带宽用满之前先把网卡的消息速率打满 (GPU 到网卡的提交路径见 §7). 把行聚合成少数几次按 peer 的大传输, 请求数就能压低. 我们的观察与这个推理一致, 但没有测量过具体归因. DeepEP v2 在目前的跨节点实验里表现很好, EP-MP 组跨节点时 (在我们的八卡节点上, 就是 EP-MP 度大于 8 时) 就用它; 节点内的生产路径仍是 rowwise EP.

**The trade-off is integration depth.** Olmo-core does not control DeepEP’s dispatch/combine kernels and public interface, so it cannot specialize every communication boundary as freely as it can in the rowwise

<!-- page 42 of 168 -->

backend. In the current MXFP8 integration (Section 11), forward dispatch transports E4M3 data with E8M0 scales and the expert GEMMs use MXFP8. Forward combine, cached backward dispatch, and backward combine remain BF16. Extending MXFP8 across those remaining communication legs would require new DeepEP kernels and interfaces, not only an Olmo-core configuration change. We therefore use DeepEP v2 as an inter-node option and rowwise EP where its closer integration with Olmo-core’s communication, precision, and autograd implementation is useful.

**代价是集成深度.** DeepEP 的 dispatch/combine kernel 和公开接口不归 Olmo-core 管, 所以不能像在 rowwise 后端里那样随意定制每一道通信边界. 在目前的 MXFP8 集成里 (§11), 前向 dispatch 传的是 E4M3 数据加 E8M0 scale, 专家 GEMM 用 MXFP8; 前向 combine, 缓存的反向 dispatch 和反向 combine 仍是 BF16. 要把 MXFP8 扩到剩下这几段通信, 需要 DeepEP 新写 kernel 和接口, 光改 Olmo-core 的配置不够. 所以我们把 DeepEP v2 当作跨节点选项; 需要和 Olmo-core 的通信, 精度和 autograd 实现紧密配合的地方, 用 rowwise EP.

## 5.9 Overlap Is Not Free: Resource Contention · 重叠不是白来的: 资源争用

A **wave schedule** splits a microbatch’s routed work into waves and attempts to dispatch wave i+1 and combine wave i−1 while the experts compute wave i. The idea comes from DeepSeek’s inference systems, where Mega MoE in DeepGEMM fuses EP dispatch, the expert MLP, and EP combine into one persistent megakernel that overlaps communication with tensor-core computation (DeepSeek-AI et al., 2026; Zhao et al., 2025a). We adopted the schedule for training but not the megakernel: the Olmo-core wave path launches ordinary dispatch, grouped-GEMM, and combine kernels on separate streams, so the overlapped stages compete for the same GPU resources instead of sharing one kernel’s internal schedule. Wave execution can hide exposed communication, but it also turns one large expert batch into several smaller grouped GEMMs. A complete comparison needs three schedules: no-wave phase-sequential execution, wave-sequential execution, and waveoverlapped execution. Wave-sequential execution is the control that separates the cost of smaller GEMMs from the cost of concurrent kernels. Our archived experiments lack it, so they show whether the complete wave schedule was faster but cannot split the difference between the two causes.

**wave 调度**把一个 microbatch 的路由工作切成若干波, 专家计算第 $i$ 波时, 同时 dispatch 第 $i+1$ 波, combine 第 $i-1$ 波. 这个思路来自 DeepSeek 的推理系统: DeepGEMM 里的 Mega MoE 把 EP dispatch, 专家 MLP 和 EP combine 融合成一个常驻的 megakernel, 让通信和 tensor core 计算重叠 (DeepSeek-AI et al., 2026; Zhao et al., 2025a). 我们在训练里用了这个调度, 没用 megakernel: Olmo-core 的 wave 路径在不同 stream 上启动普通的 dispatch, grouped GEMM 和 combine kernel, 重叠的几个阶段互相抢同一批 GPU 资源, 而不是在一个 kernel 内部统一排程. wave 执行能藏住暴露的通信, 但也把一大批专家计算拆成几个更小的 grouped GEMM. 完整的对比需要三种调度: 不分波的阶段顺序执行, 分波但顺序执行, 分波且重叠执行. 分波顺序执行是对照组, 用来区分「GEMM 变小」和「kernel 并发」两种代价. 我们存档的实验缺这一组, 只能说明完整 wave 调度快没快, 拆不开两种原因各占多少.

Let $T _ { \mathrm { c o m m } }$ and $T _ { \mathrm { g e m m } }$ be the standalone times for communication and expert computation. Sequential execution costs $T _ { \mathrm { c o m m } } + T _ { \mathrm { g e m m } }$ . After overlap, the same operations may stretch to $\tilde { T } _ { \mathrm { c o m m } }$ and $\tilde { T } _ { \mathrm { g e m m } }$ as they contend for GPU and communication resources, so the overlapped schedule takes $T _ { \mathrm { o v e r l a p } } \geq \operatorname* { m a x } ( \widetilde { T } _ { \mathrm { c o m m } } , \widetilde { T } _ { \mathrm { g e m m } } )$ Overlap improves elapsed time only if

记 $T _ { \mathrm { c o m m } }$ 和 $T _ { \mathrm { g e m m } }$ 为通信和专家计算各自单独跑的时间. 顺序执行耗时 $T _ { \mathrm { c o m m } } + T _ { \mathrm { g e m m } }$. 重叠后, 两者因争用 GPU 和通信资源可能分别拉长到 $\tilde { T } _ { \mathrm { c o m m } }$ 和 $\tilde { T } _ { \mathrm { g e m m } }$, 于是重叠调度的耗时 $T _ { \mathrm { o v e r l a p } } \geq \operatorname* { m a x } ( \widetilde { T } _ { \mathrm { c o m m } } , \widetilde { T } _ { \mathrm { g e m m } } )$. 只有满足下式, 重叠才缩短总耗时:

$$
T _ {\text {overlap}} <   T _ {\text {comm}} + T _ {\text {gemm}}.\tag{10}
$$

Figure 23 makes the no-wave and wave-overlapped order concrete with one measured forward instance at a 32-SM communication budget; the missing wave-sequential control cannot be inferred from it.

Figure 23 用一次实测的前向 (通信预算 32 个 SM) 具体展示不分波和分波重叠两种顺序; 缺失的分波顺序对照组不能从这张图推出来.

**Expert computation takes longer in the wave trace.** Figure 23 shows real communication–compute concurrency, yet the displayed wave forward interval is 3.429 ms longer and its expert-compute intervals grow by 15.1% in aggregate. Across the full profiles, the three dominant grouped-GEMM kernel families accumulated 4.63 s in the no-wave trace and 5.74 s in the wave trace. The wave schedule both split the expert work into four smaller grouped GEMMs and ran DeepEP kernels beside them, so these profiles cannot assign the additional time uniquely to GEMM granularity or concurrent resource contention.

**wave trace 里专家计算变慢了.** Figure 23 里通信和计算确实并发了, 但图中 wave 前向区间长了 3.429 ms, 专家计算区间合计长了 15.1%. 在完整 profile 上, 占主导的三类 grouped GEMM kernel 在不分波 trace 里累计 4.63 s, 在 wave trace 里累计 5.74 s. wave 调度既把专家工作拆成了四个更小的 grouped GEMM, 又让 DeepEP kernel 和它们并排跑, 所以这些 profile 无法把多出来的时间单独归给 GEMM 粒度或并发资源争用.

**Concurrent rowwise communication slows expert GEMM.** In a separate two-node, 16-GPU diagnostic with $EP-MP =16$ , 16,384 tokens per rank, top-8 routing, and $d = h = 6  ,   144$ , we launched either a rowwise NVSHMEM dispatch or combine transfer concurrently with one grouped expert workload while sweeping the communication launch width from 1 to 128 blocks. Table 9 reports the GEMM stretch and the makespan, the total elapsed time of the concurrent pair. Concurrent communication slowed the grouped GEMM by roughly a quarter at every launch width, and shrinking the communication launch to a single block did not avoid the GEMM slowdown; it stretched communication by an order of magnitude.

**并发的 rowwise 通信拖慢专家 GEMM.** 在另一个两节点 16 卡的诊断实验里 ($EP-MP =16$, 每 rank 16,384 个 token, top-8 路由, $d = h = 6  ,   144$), 我们让一次 rowwise NVSHMEM dispatch 或 combine 传输和一份分组专家计算同时跑, 并把通信 kernel 的启动宽度从 1 个 block 扫到 128 个 block. Table 9 给出 GEMM 被拉长的程度和 makespan, 即这一对并发操作的总耗时. 在每种启动宽度下, 并发通信都让 grouped GEMM 慢了约四分之一; 把通信启动缩到单个 block 也躲不开 GEMM 变慢, 反而让通信慢了一个数量级.

GEMM stretch alone, however, does not decide the outcome. At the 128-block launch, overlap still shortened the pair’s makespan by 22–25% relative to sequential execution: the wide launch finished communication soon enough to hide behind useful work despite the contention tax, while the one-block launch did not.

但 GEMM 被拉长多少并不单独决定结果. 在 128 个 block 的启动下, 重叠仍比顺序执行把这一对的 makespan 缩短了 22–25%: 宽启动让通信足够快地结束, 即使交了争用的代价, 也能藏在有用计算后面; 单 block 启动做不到.

> **对一下:** 用 Table 9 的数代入式 (10), 128 block 时重叠为什么还能赢?
> 答: GEMM 单独跑约 4.66 ms, 顺序 makespan 7.768 ms, 反推 dispatch 单独约 3.1 ms. 重叠后 makespan 5.833 ms, 正好落在被拉长的 GEMM 区间 5.736–5.874 ms 里, 即 $T_{\mathrm{overlap}} \approx \tilde{T}_{\mathrm{gemm}}$, 通信被完全盖住. 收益 7.768 - 5.833 = 1.935 ms, 约等于藏掉的 3.1 ms 通信减去 GEMM 多出的约 1.17 ms. combine 那组同理: 7.560 对 5.868. 所以式 (10) 成立的条件可以写成「被藏住的通信时间大于计算被拉长的时间」. 这个诊断是一整个大 GEMM 对一次传输; 真正的 wave 调度还要把 GEMM 切成四份 (§5.9 前文), 小 GEMM 的效率损失不在这张表里, 这就是 Table 9 赢而 Figure 24a 输的一个可能原因.

**The complete wave candidate did not beat its no-wave baseline.** A two-node DeepEP v2 sweep measured BF16 forward and backward for $EP-MP   =   16,$ 128 experts, top-8, 16,384 tokens per rank, and $d   =   h   =   8 { , } 1 9 2$ The four-wave path used an expert-major static layout and overlapped dispatch, expert compute, and combine. Figure 24a shows that it remained slower than no-wave execution at every matched communication-SM setting.

**完整的 wave 方案没有赢过不分波的基线.** 一次两节点的 DeepEP v2 扫描测了 BF16 前向和反向, 配置为 $EP-MP   =   16,$ 128 个专家, top-8, 每 rank 16,384 个 token, $d   =   h   =   8 { , } 1 9 2$. 四波路径用按专家优先的静态布局, 让 dispatch, 专家计算和 combine 重叠. Figure 24a 显示, 在每个对齐的通信 SM 设置下, 它都比不分波慢.

<!-- page 43 of 168 -->

![Image block](images/p43-image.jpg)

> 图注: image.

| Concurrent pair | GEMM time (ms) | GEMM slowdown |
| --- | --- | --- |
| Grouped GEMM alone | 4.645-4.679 | - |
| GEMM + rowwise dispatch | 5.736-5.874 | 22.9-26.0% |
| GEMM + rowwise combine | 5.724-5.907 | 23.0-27.0% |
| Pair schedule (128-block launch) | Makespan (ms) |  |
| Dispatch then GEMM, sequential | 7.768 |  |
| Dispatch and GEMM, overlapped | 5.833 |  |
| Combine then GEMM, sequential | 7.560 |  |
| Combine and GEMM, overlapped | 5.868 |  |

The sweep also shows why lowering the communication SM count is not sufficient: at four and six SMs communication became the bottleneck, while larger budgets still did not recover the no-wave time.

这次扫描也说明了为什么只压低通信用的 SM 数不够: 4 个和 6 个 SM 时通信成了瓶颈, 预算再大也追不回不分波的耗时.

**Overlap helps at eight SMs, but no-wave at 32 SMs is faster.** A later four-node, 32-GPU sourcetoken-major experiment is shown in Figure 24b. At the eight-SM budget, where communication dominates, four-wave execution beat no-wave for both forward and backward. At 32 SMs, no-wave was faster again and was the best measured point for both passes. Overlap can therefore help a communication-constrained configuration without improving the best configuration of the sweep.

**8 个 SM 时重叠有用, 但 32 个 SM 的不分波更快.** Figure 24b 是后来做的四节点 32 卡实验, 用按源 token 优先的布局. 在通信占主导的 8 SM 预算下, 四波执行的前向和反向都赢过不分波. 到 32 SM, 不分波又快了回来, 并且是两个方向上测到的最优点. 所以重叠能帮一个受通信限制的配置, 却没有改进这次扫描里的最优配置.

DeepSeek-V3, Megatron-Core, DeepEP, COMET, and Lancet report overlap designs that win in their settings (DeepSeek-AI et al., 2024; Yan et al., 2026; Zhao et al., 2025b; Zhang et al., 2025; Jiang et al., 2024b). Our

<!-- page 44 of 168 -->

![Image block](images/p44-figure-24-no-wave-execution-is-fastest-after-tuning.jpg)

Figure 24 No-wave execution is fastest after tuning the communication-SM budget in both sweeps. The panels show absolute elapsed time with independent vertical scales; lower is better. (a) On the two-node EP-MP = 16, 128-expert, expert-major BF16 configuration, no-wave was faster at every communication-SM budget and reached its minimum at 32 SMs. (b) On a different four-node EP-MP = 32, 256-expert, source-token-major BF16 configuration, overlap beat no-wave at the communication-constrained eight-SM point. Nevertheless, no-wave at 32 SMs remained the best measured forward and backward operating point. Panel (a) reports max-rank medians over five iterations after 10 warm-ups with inter-iteration synchronization; panel (b) reports max-rank medians over five iterations after three warm-ups without that synchronization. Both are Nsight-instrumented standalone development runs.

measurements are standalone development benchmarks with five within-run timings rather than repeated training runs, and the earlier DeepEP wave layout can change communication traffic relative to no-wave execution. On this evidence, we retain phase-sequential execution as the Olmo-core reference. Replacing it with a wave backend would require a speedup over the best no-wave setting for the same shape and topology. Concurrent kernels or a lower nominal communication resource budget alone do not establish that speedup.

DeepSeek-V3, Megatron-Core, DeepEP, COMET 和 Lancet 都报告了在各自场景下取胜的重叠设计 (DeepSeek-AI et al., 2024; Yan et al., 2026; Zhao et al., 2025b; Zhang et al., 2025; Jiang et al., 2024b). 我们的测量是独立的开发基准, 每次运行内只计时五次, 不是多次重复的训练运行; 而且早先的 DeepEP wave 布局相对不分波执行可能改变通信流量. 基于这些证据, 我们保留阶段顺序执行作为 Olmo-core 的参考实现. 要换成 wave 后端, 得在同样的形状和拓扑下比最优的不分波设置更快. 光有 kernel 并发, 或者名义上通信资源预算更低, 都不足以说明有这个加速.

EP makes a larger routed-expert pool fit by sharding expert weights and gradient buffers across the existing DP ranks, and it reduces each rank’s expert-gradient-reduction payload. The cost is dispatch and combine in every routed layer and microbatch. Rowwise EP removes contiguous-block packing and host split lists by addressing remote expert rows directly, but it is worthwhile only when route construction, symmetric-buffer management, one-sided communication, and any resource contention cost less than the work they replace.

EP 把专家权重和梯度缓冲分片到现有的 DP rank 上, 让更大的路由专家池放得下, 也减少了每个 rank 专家梯度归约的数据量. 代价是每个路由层, 每个 microbatch 都要 dispatch 和 combine. Rowwise EP 直接寻址远端专家行, 去掉了连续块打包和 host 切分列表; 但只有当路由构造, 对称缓冲管理, 单边通信和各种资源争用的总开销低于它替掉的工作时, 才值得用.

## 6 Pipeline Parallelism · 流水线并行

**PP distributes the layers that EP leaves replicated.** Expert parallelism (EP) divides the routed experts inside every MoE layer, but it does not divide the stack of layers, dense weights, shared experts, or the activation schedule. Pipeline parallelism (PP) addresses that remaining depth-wise memory problem by assigning consecutive Transformer blocks to different stages. A stage keeps its assigned parameters, gradients, and optimizer state; complete hidden activations, rather than selected token rows, cross stage boundaries (Huang et al., 2019; Narayanan et al., 2019).

**PP 把 EP 没切开的层分出去.** 专家并行 (EP) 切的是每个 MoE 层里的路由专家, 不切层的堆叠, 稠密权重, 共享专家, 也不改激活的调度. 流水线并行 (PP) 把连续的 Transformer block 分给不同 stage, 解决剩下的沿深度方向的显存问题. 每个 stage 保留分给它的参数, 梯度和优化器状态; 跨 stage 边界传的是完整的隐藏激活, 不是挑出来的 token 行 (Huang et al., 2019; Narayanan et al., 2019).

For PP degree P and EP-MP degree M<sub>E</sub>, a balanced repeated stack gives the rough rank-local parameter count

对 PP 度 $P$ 和 EP-MP 度 $M _ { E }$, 一个均衡重复的层栈给出 rank 本地参数量的粗略估计:

$$
P _ {\mathrm{local}} \approx \frac {1}{P} \left(P _ {\mathrm{dense}} + \frac {P _ {E}}{M _ {E}}\right).
$$

This is an estimate of persistent training state, not a peak-memory formula. The first pipeline stage also stores the token embeddings, while the last stores the language-model head and loss. Unequal block types, communication buffers, and the number of simultaneously live activations further prevent peak memory from scaling exactly as $1 / P .$

这估的是常驻训练状态, 不是峰值显存公式. 第一个 stage 还要存 token embedding, 最后一个 stage 要存语言模型头和 loss. block 类型不一致, 通信缓冲, 以及同时存活的激活数量, 都让峰值显存不能严格按 $1 / P$ 缩小.

<!-- page 45 of 168 -->

PP does not change which ranks store each parameter or which group reduces each gradient within a stage. Dense parameters still reduce over dense data-parallel groups, routed experts still shard over EP-MP, and expert replicas still reduce over EP-DP. If one stage contains $D = M _ { E } D _ { E }$ ranks, then a P-stage job contains $W = P M _ { E } D _ { E }$ ranks before context parallelism. PP adds a group connecting corresponding stage ranks; it does not replace the placement and reduction rules established in Sections 4 and 5.

在一个 stage 内部, PP 不改变哪个 rank 存哪个参数, 也不改变哪个组归约哪个梯度. 稠密参数仍在稠密数据并行组上归约, 路由专家仍在 EP-MP 上分片, 专家副本仍在 EP-DP 上归约. 若一个 stage 有 $D = M _ { E } D _ { E }$ 个 rank, 那么不算上下文并行时, $P$ 个 stage 的作业共有 $W = P M _ { E } D _ { E }$ 个 rank. PP 只是加了一个连接各 stage 对应 rank 的组, 不替换 §4 和 §5 定下的放置规则和归约规则.

**PP trades schedule time for depth-wise memory.** A single microbatch advances stage by stage and leaves the other stages idle. Multiple microbatches fill more of the pipeline, but they also add stage-boundary transfers, scheduler and launch overhead, and forward values that remain live until backward. We therefore use PP when depth-wise sharding is needed to fit the model, then tune the schedule to control the added bubbles, communication, and activation memory.

**PP 用调度时间换沿深度的显存.** 单个 microbatch 一个 stage 一个 stage 往前走, 其他 stage 闲着. 多个 microbatch 能填满更多流水线, 但也带来更多 stage 边界传输, 调度和启动开销, 以及要活到反向的前向值. 所以只在模型必须按深度切分才放得下时用 PP, 再调调度来控制多出来的 bubble, 通信和激活显存.

## 6.1 Olmo Uses the 1F1B Family · Olmo 用 1F1B 一族调度

**Interleaved-1F1B is compile-friendly because it keeps backward whole.** The selected pipeline schedule uses the **interleaved one-forward-one-backward (1F1B)** family (Narayanan et al., 2019, 2021). The scheduler decides when each stage runs, but each stage still executes one ordinary, unsplit backward. The compiled model path therefore does not need to expose separate input-gradient and weight-gradient programs to the scheduler. This preserves the existing torch.compile and TorchInductor contract (Ansel et al., 2024) while gaining the activation-memory benefit of 1F1B scheduling.

**Interleaved-1F1B 对编译友好, 因为它让反向保持完整.** 选定的流水线调度属于**交错式一前一后 (interleaved one-forward-one-backward, 1F1B)** 一族 (Narayanan et al., 2019, 2021). 调度器决定每个 stage 什么时候跑, 但每个 stage 执行的仍是一次普通的, 不拆分的反向. 所以编译后的模型路径不必把输入梯度和权重梯度拆成两段程序交给调度器. 这样既保住了现有的 torch.compile 和 TorchInductor 约定 (Ansel et al., 2024), 又拿到了 1F1B 调度在激活显存上的好处.

Other schedules can reduce the symbolic bubble rate, with different memory and execution requirements. DualPipe uses opposing pipeline directions, but its published comparison requires twice the per-device parameter storage of 1F1B at the same PP degree (DeepSeek-AI et al., 2024; DeepSeek-AI, 2025b). Zero-bubble schedules instead separate input-gradient work from deferrable weight-gradient work (Qi et al., 2024b; Huang et al., 2024). Olmo’s compiled stage backward computes both in one unsplit pass, so the scheduler cannot place them separately; splitting it would require coordinating compiled operators, retained operands, recomputation, gradient accumulation, and the scheduler.

别的调度能降低理论 bubble 率, 但对显存和执行有不同要求. DualPipe 用两个相反方向的流水线, 按其公开的对比, 同样 PP 度下每卡参数存储是 1F1B 的两倍 (DeepSeek-AI et al., 2024; DeepSeek-AI, 2025b). Zero-bubble 调度则把输入梯度计算和可推迟的权重梯度计算分开 (Qi et al., 2024b; Huang et al., 2024). Olmo 编译后的 stage 反向在一次不拆分的计算里同时算这两样, 调度器没法分开放置它们; 要拆, 就得协调编译后的算子, 保留的操作数, 重算, 梯度累积和调度器.

## 6.2 Virtual-Stage Placement Controls Activation Retention · 虚拟 stage 的放置决定激活保留多久

In Olmo-core’s custom interleaved schedule, P physical PP ranks hold 2P contiguous **virtual stages**, two per rank. Splitting each rank’s work into two shorter chunks creates more opportunities to fill a bubble, at the cost of more virtual-stage boundaries and activation handoffs. Placement also determines how long each chunk’s forward values remain live before its backward executes.

在 Olmo-core 自定义的交错调度里, $P$ 个物理 PP rank 持有 $2P$ 个连续的**虚拟 stage**, 每个 rank 两个. 把每个 rank 的工作切成两段更短的 chunk, 填 bubble 的机会更多, 代价是虚拟 stage 边界和激活交接也更多. 放置方式还决定每个 chunk 的前向值要存活多久才轮到它的反向.

Interleaved-1F1B uses **loop placement**: physical rank r holds virtual stages r and $r + P$ (Narayanan et al., 2021). Early pipeline stages can then retain more outstanding activations than late stages, concentrating peak memory on a few ranks. **1F1B-V**, experimental in Olmo-core, instead assigns stages r and $2 P - 1 - r$ to rank r (Qi et al., 2024a). Pairing an early, long-lived chunk with a late, short-lived chunk can equalize activation memory, but it changes the bubble and communication pattern. It is a memory-balancing option, not an assumed throughput improvement. Both placements preserve unsplit backward.

Interleaved-1F1B 用**循环放置**: 物理 rank $r$ 持有虚拟 stage $r$ 和 $r + P$ (Narayanan et al., 2021). 这样靠前的 stage 会比靠后的 stage 保留更多未完成的激活, 峰值显存集中在少数几个 rank 上. Olmo-core 里还在实验阶段的 **1F1B-V** 则把 stage $r$ 和 $2 P - 1 - r$ 分给 rank $r$ (Qi et al., 2024a). 把一个早而长寿的 chunk 和一个晚而短命的 chunk 配成一对, 能把激活显存拉平, 但 bubble 和通信模式也随之改变. 它是平衡显存的选项, 不默认带来吞吐提升. 两种放置都保留不拆分的反向.

Figure 25 compares the two placements for four pipeline ranks, eight microbatches, and eight virtual stages in total.

Figure 25 比较四个流水线 rank, 八个 microbatch, 共八个虚拟 stage 时的两种放置.

The symbolic PP = 4 example makes the trade concrete (Table 10). With eight microbatches, loop placement concentrates unmatched forwards on the early ranks—up to eleven on rank 0—while V placement holds six on every rank. These are schedule high-water marks, not gigabytes: stages can retain different payload sizes, and recomputation can change which values survive. Placement controls both the maximum and the skew of retained forward activations.

PP = 4 的示意例子把这个取舍落到了数上 (Table 10). 八个 microbatch 时, 循环放置把未配对的前向集中在靠前的 rank 上, rank 0 最多积压 11 个; V 放置每个 rank 都是 6 个. 这些是调度上的高水位, 不是 GB 数: 不同 stage 保留的数据大小可能不同, 重算也会改变哪些值要留下来. 放置方式同时决定保留前向激活的最大值和各 rank 间的偏斜.

> **看表:** Table 10 里 1F1B-V 把各 rank 峰值拉平到 6, 可 Figure 25 的 bubble 从 15.8% 涨到 23.8%. Qi et al. (2024a) 的 V 形调度本来是以低 bubble 著称的, 这里为什么反而变差?
> 答: V 形调度的低 bubble 依赖把反向拆成 B (输入梯度) 和 W (权重梯度), 让 W 去填空档; §6.1 写明 Olmo 的 stage 反向是不拆分的, W 没法单独挪. 只保留 V 的放置而去掉 B/W 拆分, 剩下的就只是显存平衡效果: rank 0 同时持有第一个和最后一个虚拟 stage, 最后一个 stage 的反向要等整条前向走完才能开始, 而它又和 rank 0 的第一个 stage 抢同一张卡的时间片, 首尾两端的空档更难填. 这一条因果是我按调度结构推的, 报告只给了两个 bubble 数, 没解释原因. 另外 Table 10 的积压总数: 循环放置 11+9+7+5 = 32, V 放置 6×4 = 24, V 不只是重新分配, 总量也少了.

Placement also decides which physical rank computes the loss. The final virtual stage computes the languagemodel loss and begins backward, and its physical rank follows the placement rather than a rank-number convention. Loss and metric handling must therefore follow stage identity, not the highest-numbered PP rank.

放置方式还决定由哪个物理 rank 算 loss. 最后一个虚拟 stage 计算语言模型 loss 并启动反向, 它落在哪个物理 rank 由放置方式决定, 不按 rank 编号的惯例. 所以 loss 和指标的处理要跟着 stage 身份走, 不能默认交给编号最大的 PP rank.

<!-- page 46 of 168 -->

Interleaved-1F1B | PP=4 | Microbatches=8 | Bubble 15.8%

![Image block](images/p46-a-interleaved-1f1b.jpg)

(a) Interleaved-1F1B.

![Image block](images/p46-1f1b-v-pp-4-microbatches-8-bubble-23.jpg)

> 图注: 1f1b v pp 4 microbatches 8 bubble 23.

1F1B-V | PP=4 | Microbatches=8 | Bubble 23.8%

(b) 1F1B-V placement.

<table><tbody><tr><td>Assumedactivationcopy:10GB</td><td colspan="2">Assumedpersistenttrainingstate:12GB</td><td>Budget:80GB</td></tr><tr><td>Schedule Rank</td><td>Peakactivation copies</td><td>Illustrativepeak memory(GB)</td><td>Fitsassumed budget?</td></tr><tr><td>0</td><td>11</td><td>122</td><td>×</td></tr><tr><td>1</td><td>9</td><td>102</td><td>×</td></tr><tr><td>Interleaved-1F1B</td><td></td><td></td><td></td></tr><tr><td>2</td><td>7</td><td>82</td><td>×</td></tr><tr><td>3</td><td>5</td><td>62</td><td>✓</td></tr><tr><td>0</td><td>6</td><td>72</td><td>✓</td></tr><tr><td>1</td><td>6</td><td>72</td><td>✓</td></tr><tr><td>1F1B-V</td><td></td><td></td><td></td></tr><tr><td>2</td><td>6</td><td>72</td><td>✓</td></tr><tr><td>3</td><td>6</td><td>72</td><td>✓</td></tr></tbody></table>

## 6.3 P2P Overlap · P2P 重叠

Placement fixes which stage boundaries are remote; the remaining cost is moving activations across them. Adjacent virtual stages on one physical rank use a local tensor handoff. Remote boundaries use NCCL pointto-point (P2P) communication: forward sends hidden activations to the next stage, and backward sends their activation gradients in the reverse direction. For a microbatch activation of shape $[ b , s , d ] ,$ each remote boundary moves $O ( b s d )$ values in each direction per microbatch. This traffic scales with activation shape and remote-boundary count, not total model parameters. The boundary payload remains BF16 even when expert GEMMs use MXFP8 (Section 11), so each boundary value costs two bytes in each direction.

放置方式定下了哪些 stage 边界跨 rank; 剩下的开销是把激活搬过这些边界. 同一物理 rank 上相邻的虚拟 stage 之间直接本地交接张量. 跨 rank 的边界用 NCCL 点对点 (P2P) 通信: 前向把隐藏激活发给下一个 stage, 反向沿相反方向发激活梯度. 一个 microbatch 的激活形状为 $[ b , s , d ]$ 时, 每个跨 rank 边界每个 microbatch 每个方向搬 $O ( b s d )$ 个值. 这部分流量随激活形状和跨 rank 边界数增长, 与模型总参数无关. 即便专家 GEMM 用 MXFP8 (§11), 边界数据仍是 BF16, 每个值每个方向占两个字节.

**P2P overlap requires independent scheduled work.** An asynchronous transfer creates overlap only when a rank can execute something that does not consume the tensor in flight. In steady-state Interleaved-1F1B, the peer’s next scheduled action can operate on another virtual stage or microbatch. Olmo can launch the transfer, execute one independent forward or backward action, and wait only when the actual consumer

<!-- page 47 of 168 -->

is reached (Figure 26). This can reduce the exposed transfer wait; it does not remove the communication or the final dependency wait.

**P2P 重叠需要调度里有独立的工作.** 异步传输要形成重叠, 前提是 rank 手上有不依赖在途张量的事可做. 在 Interleaved-1F1B 的稳态里, peer 下一步调度的动作可能作用于另一个虚拟 stage 或另一个 microbatch. Olmo 可以先发起传输, 执行一个独立的前向或反向动作, 等真正的消费者到了才等待 (Figure 26). 这能减少暴露出来的传输等待, 但通信本身和最后那次依赖等待都还在.

![Image block](images/p47-non-overlap-p2p.jpg)

> 图注: non overlap p2p.

Non-Overlap P2P

![Image block](images/p47-figure-26-interleaved-1f1b-can-overlap-p2p-communication-with.jpg)

> 图注: figure 26 interleaved 1f1b can overlap p2p communication with.

Overlap P2P

Figure 26 Interleaved-1F1B can overlap P2P communication with independent compute. Without overlap, each stage-boundary transfer is serialized between compute actions. In the steady-state Interleaved-1F1B pattern shown here, both ranks can post their transfers, execute an unrelated virtual-stage action, and defer each wait until the transferred activation or activation gradient is needed. The overlap hides only the portion of P2P time that fits inside this independent compute window.

A 1F1B-V handoff cannot be hidden when the receiving rank’s next scheduled action consumes the activation or gradient just produced by its peer. Posting that transfer asynchronously cannot start the dependent kernel earlier: the receiving rank must wait for the tensor at the same schedule step. Other V transfers can still overlap, but hiding this handoff requires changing the schedule and accepting a different bubble or memory trade-off.

如果接收方 rank 下一步调度的动作恰好要用 peer 刚算出的激活或梯度, 1F1B-V 的这次交接就藏不住. 把传输异步发出去, 也不能让依赖它的 kernel 提前开始: 接收方在同一个调度步上必须等这个张量. 其他 V 传输仍可以重叠, 但要藏住这一次交接, 就得改调度, 接受另一种 bubble 或显存上的取舍.

**Overlapped P2P still competes for shared resources.** The default two-sided NCCL path requires matching send and receive participation. When stage runtimes are skewed, an early peer can leave a resident NCCL send/receive kernel waiting for its match. That kernel can contend with the Transformer kernel intended to hide the transfer, so overlapped compute may run more slowly even when the wait is not visible as an idle gap (Figure 27). Capping the resident kernel’s thread-block count shrinks its footprint but does not remove the rendezvous, and a smaller communication footprint can lengthen the transfer. As in Section 5.9, the net time saved depends on both the exposed wait and the slowdown of concurrent computation.

**重叠的 P2P 照样要抢共享资源.** 默认的双边 NCCL 路径要求发送方和接收方都参与. stage 运行时间不均时, 先到的 peer 会让一个常驻的 NCCL send/receive kernel 一直等对方. 这个 kernel 会和本来用来掩盖传输的 Transformer kernel 抢资源, 所以即使等待没有表现为空闲间隙, 重叠的计算也可能变慢 (Figure 27). 限制常驻 kernel 的 thread block 数能缩小它的占用, 但去不掉这次会合; 通信占用变小, 传输又可能变长. 和 §5.9 一样, 净省下的时间同时取决于暴露的等待和并发计算的减速.

This contention motivated a one-sided alternative for the pipeline boundary. Prototype NCCL remote memory access (RMA) backends replace the matched send and receive with a producer-side put and a consumer-side wait placed at the latest consume point, so no resident kernel waits for a peer. The prototypes currently work only within a node, while PP boundaries usually span nodes, so the two-sided path remains the default.

这种争用促使我们给流水线边界做了一个单边方案. NCCL 远程内存访问 (RMA) 的原型后端用生产方的 put 加消费方的 wait 替代成对的 send 和 receive, wait 放在最晚的消费点, 于是没有常驻 kernel 在等 peer. 这些原型目前只能在节点内用, 而 PP 边界通常跨节点, 所以默认仍走双边路径.

## 6.4 PP Delays Reuse of Saved EP Payloads · PP 推迟了已保存 EP 数据的复用

**An EP buffer becomes reusable only after its pipeline backward finishes.** Section 5.7 introduced the hazard and the lease that guards against it: a dispatched payload saved for Wgrad must not be overwritten before its backward consumer runs. Without PP, a forward’s temporary EP buffers can often be reclaimed by the following backward. PP interleaves several microbatches, so a later forward may arrive while an earlier forward still needs its saved EP payload for weight-gradient computation. Buffer reuse must therefore follow the pipeline schedule and the point at which each saved value’s backward consumer finishes, not simply the order of forward calls. The pipeline schedule determines how many slots must exist at once.

**EP 缓冲要等对应的流水线反向结束才能复用.** §5.7 讲过这个风险和防范它的租约: 为 Wgrad 保存的 dispatch 数据, 在反向消费者跑之前不能被覆盖. 没有 PP 时, 一次前向的临时 EP 缓冲往往在紧接着的反向里就能回收. PP 把多个 microbatch 交错执行, 较早的前向还要用保存的 EP 数据算权重梯度时, 较晚的前向可能已经到了. 所以缓冲复用必须跟着流水线调度和每个保存值的反向消费者何时结束走, 不能只看前向调用的先后. 同时要有多少个槽位, 由流水线调度决定.

<!-- page 48 of 168 -->

![Image block](images/p48-figure-27-a-resident-p2p-wait-can-slow-the.jpg)

Figure 27 A resident P2P wait can slow the compute meant to hide it. With matched arrival (a), the send/receive kernel transfers and exits, and the overlapped Transformer kernels run at full speed. With skewed arrival (b), the early peer’s resident send/receive kernel occupies streaming multiprocessors while it waits for its match, so the overlapped compute stretches even though no idle gap appears on the compute stream. Conceptual illustration with no measured quantities.

Let $F _ { s } ( t )$ and $B _ { s } ( t )$ count completed forwards and backwards for stage s by schedule time t. The outstanding**forward high-water**

记 $F _ { s } ( t )$ 和 $B _ { s } ( t )$ 为截至调度时刻 $t$, stage $s$ 已完成的前向数和反向数. 未完成的**前向高水位**为

$$
H _ {s} = \max _ {t} \bigl (F _ {s} (t) - B _ {s} (t) \bigr)
$$

predicts how many stage-s payloads can be live concurrently. It sizes a buffer pool, but it does not determine when any particular slot is reusable. A slot becomes reusable only after the matching backward has consumed the saved value.

它给出 stage $s$ 最多同时存活多少份数据, 可以用来定缓冲池的大小, 但定不了某个具体槽位什么时候能复用. 一个槽位只有在对应的反向用完保存的值以后才能复用.

We encountered this hazard in a PP–EP correctness failure. Rowwise expert execution saved a self-managed symmetric-memory dispatch payload needed later for expert weight gradients. A later pipeline forward could reuse that storage before the matching backward consumed it. The corrupted values could remain finite in BF16, so loss finiteness alone did not rule out a silent wrong gradient; the MXFP8 form of the same bug instead surfaced as an infinite gradient norm from stale scales. The repair uses two complementary rules: the schedule high-water determines how many slots to reserve, while the saved autograd value retains a lease on its particular slot until its backward consumer finishes (Figure 22).

我们在一次 PP 加 EP 的正确性故障里碰上了这个风险. rowwise 专家执行保存了一份自管的对称内存 dispatch 数据, 后面算专家权重梯度要用. 对应的反向还没读它, 后来的一次流水线前向就可能复用了这块存储. 在 BF16 下, 被破坏的值可能仍是有限数, 所以 loss 没出 NaN 并不能排除梯度悄悄算错; 同一个 bug 在 MXFP8 下则因为 scale 过期, 表现为梯度范数变成无穷大. 修复用了两条互补的规则: 调度高水位决定预留多少个槽位; 保存的 autograd 值对自己那个槽位持有租约, 直到它的反向消费者结束 (Figure 22).

> **问:** 同一个覆盖 bug, 为什么 BF16 下悄无声息, MXFP8 下却直接梯度范数 inf?
> 答: BF16 槽位被覆盖后, 里面是另一个 microbatch 的合法激活, 量级相同, 算出的 Wgrad 只是错, 不会溢出. MXFP8 一条路由有 qdata 和 scale 两份 (§5.7), 每 32 个元素共用一个 E8M0 scale, 也就是一个 2 的幂次. 覆盖时如果 qdata 和 scale 不是同一批写入的 (比如 scale 行是旧的, qdata 是新的, 或者反过来), 反量化就是用错的指数去乘, 差几个指数位就是几个数量级, 很容易冲到 inf. 报告只写了「stale scales」, 没说是哪一份先被覆盖, 上面的配错机制是按 §5.7 的双份布局推的. 这也说明 MXFP8 在这里起了检测器的作用: 想在 BF16 下抓这类问题, 只看 loss 是否有限不够, 得对比 PP 和非 PP 下的逐参数梯度.

Two schedule features change what the lease rule must cover. Recomputation (Section 13) changes whether a value must survive from the original forward, and two-batch overlap (TBO, Section 15.3) can multiply simultaneous acquisitions within one scheduled forward.

有两个调度特性会改变租约规则要覆盖的范围. 重算 (§13) 改变一个值是否必须从原始前向活到反向; 双批重叠 (two-batch overlap, TBO, §15.3) 会让一次调度的前向里同时申请的槽位成倍增加.

PP peak memory therefore includes not only stage parameters but also the schedule-dependent high-water of ordinary activations, communication buffers, route metadata, and rowwise payload leases. Appendix F describes how context parallelism changes the activation shape entering this same reuse rule.

所以 PP 的峰值显存除了 stage 参数, 还包括随调度变化的高水位: 普通激活, 通信缓冲, 路由元数据, 以及 rowwise 数据的租约. 附录 F 讲上下文并行怎样改变进入同一条复用规则的激活形状.

## 6.5 Runtime Determines Pipeline Throughput · 流水线吞吐由运行时决定

Once a configuration fits, the microbatch schedule and stage runtimes determine its throughput. Let m be the number of pipeline microbatches in one optimizer step. Increasing m amortizes warmup and cooldown because more work occupies the steady-state portion of the pipeline. It does not make those bubbles disappear, and it is not equivalent to increasing the microbatch size. At fixed global batch, increasing m makes each microbatch smaller, which can reduce attention and GEMM efficiency and increase launch and P2P overhead per token. The useful operating point therefore balances pipeline occupancy against the efficiency of each stage invocation.

配置放得下以后, 吞吐由 microbatch 调度和各 stage 的运行时间决定. 记 $m$ 为一个优化器步里的流水线 microbatch 数. 加大 $m$ 能摊薄预热和收尾, 因为更多工作落在流水线的稳态段. 但这些 bubble 不会消失, 加大 $m$ 也不等于加大 microbatch. 全局 batch 固定时, $m$ 越大每个 microbatch 越小, 注意力和 GEMM 效率可能下降, 每个 token 分摊的启动和 P2P 开销会上升. 所以合适的工作点要在流水线占用率和每次 stage 调用的效率之间取平衡.

**One straggling stage throttles the complete pipeline.** Equal layer counts are only a starting point because embeddings, the language-model head, dense versus routed blocks, shared experts, recomputation,

<!-- page 49 of 168 -->

and routing imbalance all change stage time. In PP recipes where the last virtual stage’s language-model head and loss would make it the straggler, we leave that stage one Transformer block lighter. For example, some nominal 32-block designs use 31 blocks while retaining split points from the 32-block partition, so the missing block comes from the final stage. This is a profile-guided recipe choice, not an automatic scheduler policy. We balance stages using measured time and memory rather than layer count alone.

**一个慢 stage 会拖住整条流水线.** 层数相等只是起点, 因为 embedding, 语言模型头, 稠密 block 与路由 block 的差别, 共享专家, 重算, 路由不均衡都会改变 stage 耗时. 在最后一个虚拟 stage 因语言模型头和 loss 会成为拖后腿者的 PP 配方里, 我们让这个 stage 少一个 Transformer block. 例如一些名义上 32 个 block 的设计实际用 31 个, 同时保留按 32 个 block 划分的切分点, 少掉的那一个就落在最后一个 stage. 这是看 profile 定下的配方选择, 不是调度器的自动策略. 我们按实测的时间和显存平衡各 stage, 不只看层数.

**Symbolic timelines omit execution costs.** Generated timelines reveal action order, empty slots, activation high-water, and possible P2P overlap windows. They do not include kernel duration, transfer latency, CPU launch gaps, GPU idle time, or contention between concurrent operations. A smaller symbolic bubble can still lose to smaller microbatch kernels, an imbalanced stage, or communication interference. Pipeline throughput must therefore be measured at runtime for the complete configuration rather than inferred from the schedule diagram alone.

**示意时间线不含执行开销.** 生成的时间线能看出动作顺序, 空槽, 激活高水位和可能的 P2P 重叠窗口. 它不包含 kernel 耗时, 传输延迟, CPU 启动间隙, GPU 空闲时间, 也不包含并发操作之间的争用. 理论 bubble 更小的调度, 仍可能输给更小的 microbatch kernel, 不均衡的 stage 或通信干扰. 所以流水线吞吐必须在完整配置上实测, 不能只从调度图推断.

The production operating points in Section 14 report measured throughput for the PP4 and PP8 configurations used at scale.

§14 的生产工作点给出了大规模使用的 PP4 和 PP8 配置的实测吞吐.

## 7 Mapping Parallelism to Hardware · 把并行映射到硬件

**Rank placement constrains the physical communication path.** Every parallelism axis in the pre-ceding sections was defined by a process group: a list of ranks that must communicate. The list defines the participants but does not predict communication cost. Two groups of the same size may lie inside one NVLink domain or span an InfiniBand fabric. They may also communicate at different frequencies: once per optimizer step or at every routed layer. Parallelism determines what moves and how often; rank placement determines the available physical paths. Together, they affect latency, usable bandwidth, interference, and end-to-end cost.

**rank 的放置限定了物理通信路径.** 前面各节的每条并行轴都由一个进程组定义, 也就是一份必须互相通信的 rank 列表. 列表规定了谁参与, 却预测不了通信开销. 两个同样大小的组, 可能落在同一个 NVLink 域里, 也可能横跨 InfiniBand 网络. 它们的通信频率也可能不同: 每个优化器步一次, 或者每个路由层一次. 并行方式决定搬什么, 搬多频繁; rank 放置决定能走哪些物理路径. 两者合起来影响延迟, 可用带宽, 相互干扰和端到端开销.

Figure 28 recalls the logical topology from the preceding sections. PP divides layer ranges. Within each stage, EP-MP ranks hold different expert shards, EP-DP ranks hold replicas of the same shard, and dense parameters reduce over the full data-parallel group. PP groups connect matching coordinates across layer stages. The diagram leaves physical placement unspecified: the same logical edge may stay inside a node or cross the network.

Figure 28 回顾前几节的逻辑拓扑. PP 切分层的范围. 每个 stage 内部, EP-MP 各 rank 持有不同的专家分片, EP-DP 各 rank 持有同一分片的副本, 稠密参数在整个数据并行组上归约. PP 组把各层 stage 上坐标相同的 rank 连起来. 图里没有指定物理放置: 同一条逻辑边可能留在节点内, 也可能跨网络.

## 7.1 Rank Order Turns a Mesh into Placement · rank 顺序把 mesh 变成放置

**The mesh builder arranges rank numbers.** Olmo-core constructs its device mesh without consulting a switch table or adapter inventory. It orders the dense mesh as PP, then data parallelism (DP), then context parallelism (CP), so CP varies fastest. MoE layers take a second view of the same per-stage ranks, refolding the combined DP–CP pool into EP-DP and EP-MP with $DC = D_{E}M_{E}$ for CP degree C (Appendix F). Ranks are laid out in row-major order, so whichever dimension sits innermost occupies contiguous global ranks: CP in the dense view, EP-MP in the MoE view. A PP group varies the outermost dimension and strides by the width of one pipeline stage.

**mesh 构造器排的只是 rank 编号.** Olmo-core 构造 device mesh 时不查交换机表, 也不查网卡清单. 稠密 mesh 的维度顺序是 PP, 数据并行 (DP), 上下文并行 (CP), CP 变化最快. MoE 层对同一批 stage 内的 rank 另取一个视图, 把 DP 与 CP 合起来的池子重新折成 EP-DP 和 EP-MP, 满足 $DC = D_{E}M_{E}$, $C$ 为 CP 度 (附录 F). rank 按行优先排布, 所以最内层的那一维占据连续的全局 rank: 稠密视图里是 CP, MoE 视图里是 EP-MP. PP 组沿最外层维度变化, 步长是一个流水线 stage 的宽度.

For the eight-rank example in Figure 28, the resulting groups are

对 Figure 28 的八 rank 例子, 得到的组是

$$
\text {EP - MP:} \quad [ 0, 1 ], [ 2, 3 ], [ 4, 5 ], [ 6, 7 ],
$$

$$
\text {EP - DP:} \quad [ 0, 2 ], [ 1, 3 ], [ 4, 6 ], [ 5, 7 ],
$$

$$
\mathrm{PP}: \quad [ 0, 4 ], [ 1, 5 ], [ 2, 6 ], [ 3, 7 ].
$$

With eight contiguous local ranks per node, EP-MP occupies the innermost, adjacent ranks, so at the production degree of eight an EP-MP group fills exactly one NVL8 domain—eight GPUs on one NVLink fabric (Section 7.4). PP groups and the replica groups, which usually span several nodes, stride across those local blocks. This layout keeps frequent, irregular EP traffic on NVLink. An EP-MP group wider than eight has to leave the node.

每个节点有八个连续的本地 rank, EP-MP 占据最内层相邻的 rank, 所以在生产用的 EP-MP 度 8 下, 一个 EP-MP 组正好占满一个 NVL8 域, 即同一 NVLink 网络上的八张 GPU (§7.4). PP 组和副本组通常跨好几个节点, 以本地块为步长跨过去. 这种布局让频繁而不规则的 EP 流量留在 NVLink 上. EP-MP 组宽过 8 就得出节点.

This mapping follows from mesh dimension order and launcher rank order, with no topology optimizer. Reordering the hostfile, changing the number of local ranks, or choosing a stage width that does not divide the node can change the physical mapping even when the parallelism degrees stay the same. Rank order therefore belongs in the recorded performance configuration.

这个映射只来自 mesh 的维度顺序和启动器的 rank 顺序, 没有拓扑优化器参与. 调换 hostfile 顺序, 改每节点的本地 rank 数, 或者选一个不能整除节点卡数的 stage 宽度, 都可能在并行度不变的情况下改变物理映射. 所以 rank 顺序应当写进记录下来的性能配置里.

<!-- page 50 of 168 -->

![Image block](images/p50-figure-28-the-same-ranks-participate-in-several-logical.jpg)

Figure 28 The same ranks participate in several logical topologies. This illustrative eight-rank example uses PP = 2, DP = 4, EP-MP = 2, and EP-DP = 2. Each PP stage stores one layer range; EP-MP pairs form a complete expert set; EP-DP pairs connect replicas of an expert shard; and PP groups join matching data-parallel coordinates across stages. Context parallelism is omitted. The diagram establishes group membership, not the hardware path or a measured production placement.

## 7.2 GPUDirect RDMA Moves Payload; IBGDA Submits Work · GPUDirect RDMA 搬数据, IBGDA 提交工作

**Payload movement and work submission have separate costs.** Inside one NVL8 node, a GPU reaches peer GPU memory through the NVLink/NVSwitch fabric. Across nodes the path is longer:

**搬数据和提交工作是两笔不同的开销.** 在一个 NVL8 节点内, GPU 经 NVLink/NVSwitch 网络访问其他 GPU 的显存. 跨节点时路径更长:

$$
\text {GPU memory} \rightarrow \text {PCIe} \rightarrow \text {local HCA} \rightarrow \text {InfiniBand} \rightarrow \text {remote HCA} \rightarrow \text {PCIe} \rightarrow \text {remote GPU memory}.
$$

The host channel adapter (HCA) is InfiniBand’s name for the network adapter—the NIC of Section 5.8—and it connects to the GPU through PCIe, which is why PCIe appears at both ends of every cross-node transfer. The nominal fabric rate is only one limit: GPU–HCA locality, shared PCIe bridges, rail selection (which of the node’s per-GPU adapters carries the transfer, Section 7.4), message size, and concurrent traffic can each become the limiting segment. The chain above is conceptual, since NCCL or NVSHMEM may select another local adapter or relay path, and only runtime diagnostics establish the route actually used.

主机通道适配器 (HCA) 是 InfiniBand 对网卡的叫法, 也就是 §5.8 说的 NIC. 它经 PCIe 连到 GPU, 所以每次跨节点传输的两端都有 PCIe. 网络的标称速率只是限制之一: GPU 与 HCA 的亲近程度, 共享的 PCIe 桥, rail 选择 (节点上每卡一块的网卡里由哪一块承载这次传输, §7.4), 消息大小, 以及并发流量, 都可能成为卡脖子的那一段. 上面的链路只是示意, NCCL 或 NVSHMEM 可能选别的本地网卡或中转路径, 实际走的路线只有运行时诊断才能确认.

**GPUDirect RDMA** lets an HCA read and write GPU memory directly, removing a host-memory bounce buffer from the payload path (NVIDIA, 2026a); a host thread or proxy may still be the one preparing the work. **InfiniBand GPUDirect Async (IBGDA)**, as used by NVSHMEM, can move that preparation onto the GPU for one-sided operations (NVIDIA, 2026t; Markthub et al., 2022). Symmetric memory (Section 5.5) already makes remote expert rows addressable; the GPU-driven IBGDA path lets the rowwise EP kernel submit the inter-node transfer itself, with no CPU proxy preparing the work.

**GPUDirect RDMA** 让 HCA 直接读写 GPU 显存, 数据路径上不再经过主机内存的中转缓冲 (NVIDIA, 2026a); 但准备这次工作的可能仍是 host 线程或代理. NVSHMEM 用的 **InfiniBand GPUDirect Async (IBGDA)** 能把单边操作的准备工作挪到 GPU 上 (NVIDIA, 2026t; Markthub et al., 2022). 对称内存 (§5.5) 已经让远端专家行可寻址; 由 GPU 驱动的 IBGDA 路径让 rowwise EP kernel 自己提交跨节点传输, 不需要 CPU 代理来准备.

The two mechanisms are independent: a direct payload path removes staging copies, and GPU-side submission removes a host dependency from the critical path. Both still require completion ordering and memory

<!-- page 51 of 168 -->

registration, and rowwise EP transfers also depend on the lifetime rules of the remotely visible symmetric buffers. Section 8.4 follows the host-synchronization consequence in detail.

这两种机制互相独立: 直接的数据路径去掉中转拷贝, GPU 端提交把 host 依赖从关键路径上拿掉. 两者都仍需要完成顺序保证和内存注册; rowwise EP 的传输还依赖远端可见的对称缓冲的生命期规则. §8.4 详细跟踪 host 同步带来的后果.

## 7.3 Communication Clock Determines Placement Priority · 通信频率决定放置优先级

Table 11 combines what moves with when it moves. A single DDP collective can carry more bytes than a single EP dispatch, but it runs once per optimizer step and several accumulation microbatches share its cost. EP and PP communication recurs inside every microbatch, and full-reshard FSDP repeats parameter materialization at every wrapped execution boundary. Placement must account for this frequency and criticalpath sensitivity as well as byte count.

Table 11 把「搬什么」和「什么时候搬」放在一起看. 单次 DDP 集合通信搬的字节可能比单次 EP dispatch 多, 但它每个优化器步只跑一次, 由几个累积 microbatch 分摊. EP 和 PP 通信在每个 microbatch 里反复出现; 完全重分片的 FSDP 在每个被包裹的执行边界上都重新物化参数. 放置时除了字节数, 还要考虑这种频率和对关键路径的敏感度.

| Axis | Traffic and clock Placement consequence |
| --- | --- |
| DDP / optimizer | Bandwidth and rail balance matter; accumu-Parameter-sized gradient and updated-lation microbatches amortize this boundary parameter buckets, once per optimizer step cost. |
| Full-reshard | Parameter shards materialized into full Repetition makes remote placement costly wrapped weights, around each wrapped mi- |
| FSDP | even when each collective is regular. crobatch execution |
| EP-MP | Routed token rows and returned expert out-Fast locality, low latency, route balance, and puts, at every routed layer in forward and small-message behavior all matter. backward for every microbatch |
| PP | Hidden activations and their gradients, at Physical adjacency and independent-work every remote stage boundary for every micro-windows determine the exposed P2P cost. batch |

The axes also use different communication libraries. Dense DDP and EP-DP reduction use NCCL collectives; PP uses NCCL point-to-point communication; block all-to-all EP uses an NCCL all-to-all collective; and the rowwise EP-MP path uses NVSHMEM symmetric memory, because it benefits from indexed one-sided movement among the ranks of an EP-MP group.

各条轴用的通信库也不同. 稠密 DDP 和 EP-DP 归约用 NCCL 集合通信; PP 用 NCCL 点对点通信; block all-to-all EP 用 NCCL 的 all-to-all 集合通信; rowwise EP-MP 路径用 NVSHMEM 对称内存, 因为它要在 EP-MP 组内各 rank 之间做带索引的单边搬运.

## 7.4 The Tested System Has Eight GPUs per NVLink Domain · 测试系统每个 NVLink 域八张 GPU

The audited cluster used for the main training experiments has eight NVIDIA B300 SXM6 GPUs per node in a single NVLink domain, with every GPU pair reported as NV18 (eighteen NVLink links per GPU). Each node reaches the fabric over eight active 800-Gb/s-class XDR InfiniBand rails, one aligned to each GPU across a shared PCIe bridge (PXB) (NVIDIA, 2026b,i). This is an NVL8 system: any parallel group wider than eight leaves the NVLink domain and crosses the fabric.

主要训练实验用的集群经过核查: 每个节点八张 NVIDIA B300 SXM6 GPU, 处在同一个 NVLink 域里, 任意两卡之间报告为 NV18 (每卡 18 条 NVLink). 每个节点通过八条在用的 800 Gb/s 级 XDR InfiniBand rail 接入网络, 每张 GPU 经一个共享 PCIe 桥 (PXB) 对齐一条 (NVIDIA, 2026b,i). 这是 NVL8 系统: 任何宽过 8 的并行组都要离开 NVLink 域, 走网络.

These specifications describe hardware capabilities, not achieved bandwidth. “One local rail per GPU” describes a favorable GPU–HCA pairing in the physical topology; which rail a given NCCL or NVSHMEM transfer actually used is a separate question. Enabling an IBGDA environment option is likewise a request rather than evidence that the effective handler mode was fully GPU-side. The rail and IBGDA statements in this report therefore describe the configured paths, taken from the audited inventory and requested configuration rather than per-transfer counters.

这些规格描述的是硬件能力, 不是实际达到的带宽. 「每卡一条本地 rail」说的是物理拓扑里 GPU 与 HCA 的配对有利; 某次 NCCL 或 NVSHMEM 传输实际用了哪条 rail, 是另一个问题. 同样, 打开 IBGDA 的环境变量只是提出请求, 不能证明实际生效的处理模式完全在 GPU 端. 所以本报告关于 rail 和 IBGDA 的说法描述的是配置的路径, 依据是核查过的硬件清单和请求的配置, 不是逐次传输的计数器.

The distinction matters most when comparing training systems. An NVL72 domain keeps much larger model-parallel groups on NVLink, so results measured there and our NVL8 measurements are not an applesto-apples topology comparison. The comparison can also run the other way: the unusually well-provisioned XDR fabric on these nodes can flatter an inter-node method that would fare worse on a cluster with fewer or slower rails. Comparing systems therefore requires the end-to-end path available to each rank group, not just the GPU and fabric names.

比较训练系统时这个区分最要紧. NVL72 域能把大得多的模型并行组留在 NVLink 上, 所以那里测的结果和我们 NVL8 上的结果不是同一种拓扑下的对比. 反过来也可能有偏差: 这些节点的 XDR 网络配得格外充裕, 可能让某个跨节点方法显得比较好, 换到 rail 更少或更慢的集群上就不一定. 比较系统时, 要看每个 rank 组实际可用的端到端路径, 不能只看 GPU 和网络的型号.

<!-- page 52 of 168 -->

## 7.5 Topology Changes the Operating Point · 拓扑改变工作点

Increasing EP-MP degree from eight to sixteen halves each rank’s expert shard, but also moves EP from an intra-node NVLink exchange to an inter-node operation, and it can change which backend is worth using: many small row transfers can become limited by the HCA’s message rate, favoring the block-oriented DeepEP v2 backend (Section 5.8). Where the crossover falls is an empirical property of model shape and fabric rather than a universal degree threshold.

把 EP-MP 度从 8 加到 16, 每个 rank 的专家分片减半, 但 EP 也从节点内 NVLink 交换变成了跨节点操作, 值得用的后端也可能随之改变: 大量小行传输可能受限于 HCA 的消息速率, 这时面向块的 DeepEP v2 后端更合适 (§5.8). 交叉点落在哪里, 取决于模型形状和网络, 要靠实测, 没有通用的度数阈值.

Adding accumulation microbatches spreads DDP gradient and optimizer-boundary traffic across more useful token work, while EP dispatch/combine and PP activation traffic recur for every microbatch regardless. One batch-size change can therefore relieve one communication axis and, at the same time, make another communicate more often.

增加累积 microbatch 数, 能把 DDP 梯度和优化器边界的流量摊到更多有用的 token 工作上; EP 的 dispatch/combine 和 PP 的激活流量则每个 microbatch 都照样发生. 所以改一次 batch 大小, 可能缓解一条通信轴, 同时让另一条通信得更频繁.

Separate communicators or CUDA streams still use the same hardware. Concurrent communication and GEMM can still contend for SM scheduling, cache, memory bandwidth, PCIe, HCAs, and fabric links. Section 5.9 shows this directly in one two-node EP-MP = 16 diagnostic, where concurrent rowwise communication slowed the grouped expert work by roughly 23–27% on the tested shape. The magnitude is specific to that shape. As Section 5.9 shows, the benefit of hidden communication must be evaluated together with the slowdown of concurrent kernels.

分开的 communicator 或 CUDA stream 用的仍是同一套硬件. 并发的通信和 GEMM 仍会争 SM 调度, 缓存, 显存带宽, PCIe, HCA 和网络链路. §5.9 在一次两节点 EP-MP = 16 的诊断里直接展示了这一点: 在测试的形状上, 并发的 rowwise 通信让分组专家计算慢了约 23–27%. 这个幅度只对那个形状成立. 正如 §5.9 所示, 藏住通信的收益必须和并发 kernel 的减速放在一起评估.

Parallelism defines which values communicate and how often; mesh dimension order and launcher rank order turn those logical groups into physical paths. Our placement gives frequent, latency-sensitive traffic priority within the NVLink domain, subject to the launcher producing the intended mapping. Changing degree, batching, backend, or overlap policy can change the limiting resource, so their combined effect is specific to each model and hardware configuration.

并行方式决定哪些值要通信, 多频繁; mesh 的维度顺序和启动器的 rank 顺序把这些逻辑组变成物理路径. 我们的放置让频繁且对延迟敏感的流量优先留在 NVLink 域里, 前提是启动器产生了预期的映射. 改并行度, batch 划分, 后端或重叠策略, 都可能改变瓶颈资源, 所以它们的综合效果因模型和硬件配置而异.

<!-- page 53 of 168 -->

## Part III Efficient Training · 第三部分 高效训练

## 8 Synchronization-Free Training · 无同步训练

The GPU executes each training step, but the CPU prepares and submits nearly all of that work. A CUDA kernel launch normally returns without waiting for the kernel to finish, allowing the CPU to submit later operations while the GPU executes earlier ones (NVIDIA, 2026k; PyTorch Contributors, 2026f). This asyn chronous execution is essential for high utilization: the GPU should find its next operation already waiting when the current operation finishes. The GPU can run out of queued work if the CPU submits operations too slowly or blocks while waiting for a device-produced value (Figure 29). Slow submission calls for less host work or more device work per launch. A device-to-host wait instead calls for an interface that keeps device results off the host’s steady-state path; initialization, compilation and warmup, and buffer allocation may still synchronize.

每个训练步由 GPU 执行, 但几乎所有工作都由 CPU 准备和提交. CUDA kernel 启动通常不等 kernel 跑完就返回, CPU 因而能在 GPU 执行前面的操作时提交后面的操作 (NVIDIA, 2026k; PyTorch Contributors, 2026f). 这种异步执行是高利用率的前提: 当前操作结束时, GPU 应当发现下一个操作已经排在那里. 如果 CPU 提交太慢, 或者阻塞着等一个设备算出的值, GPU 就会把队列里的工作耗光 (Figure 29). 提交慢, 要么减少 host 工作, 要么让每次启动带更多设备工作. 设备到 host 的等待则需要换一种接口, 让设备结果不进入 host 的稳态路径; 初始化, 编译与预热, 缓冲分配这些阶段仍可以同步.

![Image block](images/p53-figure-29-gpu-idle-intervals-caused-by-slow-submission.jpg)

> 图注: figure 29 gpu idle intervals caused by slow submission.

the queued lead from b1–b2 is spent; every later kernel waits for its own submission

![Image block](images/p53-figure-29-gpu-idle-intervals-caused-by-slow-submission-2.jpg)

(b) synchronization failure: the CPU blocks on a device value

the wait ends only when the GPU produces the value; the queue has already drained

**Figure 29 GPU idle intervals caused by slow submission and host waits.** (a) When submitting a block costs the CPU more time than executing it costs the GPU, the queued lead is spent and every later kernel waits for its own submission; the GPU idles a little before every block. (b) When the CPU blocks on a device value, submission stops entirely: the GPU finishes the queued work, sits idle until the value is produced and the host resumes, and the host must then rebuild its lead. Conceptual illustration with no measured quantities.

MoE training is especially sensitive to both problems. Routing introduces many short metadata operations around the expert GEMMs, and the number of tokens assigned to each rank and expert is data dependent. A direct implementation may therefore combine small GPU work units with host-visible counts, variable allocations, and variable communication schedules. These costs are part of the systems tax introduced in Section 1.3; they are not counted by the model-FLOP estimate.

MoE 训练对这两个问题都格外敏感. 路由在专家 GEMM 周围引入大量短小的元数据操作, 分给每个 rank, 每个专家的 token 数又取决于数据. 一个直白的实现因此会同时有小的 GPU 工作单元, host 可见的计数, 变长的分配和变化的通信计划. 这些开销属于 §1.3 引入的系统税, 不计入模型 FLOP 估算.

In this section, **synchronization-free** has a narrow meaning: the steady-state training path contains no avoidable host-blocking synchronization for routing, allocation, communication, or expert scheduling. It does not mean that execution has no ordering. CUDA stream dependencies, collective completion, autograd dependencies, and optimizer-step boundaries are still required. In the MoE path examined here, the all-to-all and grouped GEMM required host-visible counts. Section 8.5 describes how Olmo removes both waits without introducing a new one.

本节的**无同步**含义很窄: 稳态训练路径上, 路由, 分配, 通信和专家调度都没有可以避免的, 会阻塞 host 的同步. 这不是说执行没有先后顺序. CUDA stream 依赖, 集合通信的完成, autograd 依赖和优化器步边界都还需要. 在这里分析的 MoE 路径中, all-to-all 和 grouped GEMM 都要求 host 可见的计数. §8.5 讲 Olmo 怎样去掉这两处等待, 同时不引入新的等待.

<!-- page 54 of 168 -->

## 8.1 The CPU Must Stay Ahead of the GPU · CPU 必须跑在 GPU 前面

Consider a repeated region such as one transformer block. Let $T _ { \mathrm { s u b m i t } }$ be the CPU time required to submit the region and $T _ { \mathrm { d e v i c e } }$ be the time required by its GPU work. If $T _ { \mathrm { s u b m i t } } < T _ { \mathrm { d e v i c e } }$ , the CPU can usually move ahead while the GPU executes. If $T _ { \mathrm { s u b m i t } } \geq T _ { \mathrm { d e v i c e } }$ , the GPU eventually reaches the end of the submitted queue and waits for the host. Dependencies and concurrent streams make this comparison a diagnostic, not a complete performance model, but it identifies the relevant imbalance.

考虑一段重复的区域, 比如一个 Transformer block. 记 $T _ { \mathrm { s u b m i t } }$ 为 CPU 提交这段区域所需的时间, $T _ { \mathrm { d e v i c e } }$ 为它的 GPU 工作所需的时间. 若 $T _ { \mathrm { s u b m i t } } < T _ { \mathrm { d e v i c e } }$, GPU 执行时 CPU 通常能往前跑. 若 $T _ { \mathrm { s u b m i t } } \geq T _ { \mathrm { d e v i c e } }$, GPU 迟早会跑到已提交队列的末尾, 开始等 host. 依赖关系和并发 stream 让这个比较只能当诊断用, 算不上完整的性能模型, 但它指出了要看的那种失衡.

We call the amount of submitted but not-yet-completed GPU work the **submission headroom**. Headroom is a function of wall-clock time: it jumps up by a kernel’s device duration when the CPU completes that kernel’s submission, drains at unit rate while the GPU executes, and the GPU is idle exactly while it is zero. Large GEMMs, scaled dot-product attention, fused kernels, compiled regions, and C++ execution can build headroom because they submit substantial device work with relatively little host work. Python call stacks, dispatcher and compilation-cache lookups, metadata bookkeeping, and many short launches consume it. Submission headroom is an interpretation of a CPU/GPU timeline, not a CUDA metric: the CPU’s lead over GPU execution shrinks to zero when the device runs out of queued work. Figure 30a draws headroom as this quantity, and Table 12 summarizes which common operations build or consume it. Figure 31 then contrasts a dense block sequence that sustains that lead with a routed one in which a per-block synchronization point removes it.

我们把已提交但尚未完成的 GPU 工作量叫作**提交余量** (submission headroom). 余量是墙钟时间的函数: CPU 每提交完一个 kernel, 余量就跳升这个 kernel 的设备耗时; GPU 执行时余量以单位速率下降; 余量为零的时段恰好就是 GPU 空闲的时段. 大 GEMM, scaled dot-product attention, 融合 kernel, 编译区域和 C++ 执行能攒余量, 因为它们用较少的 host 工作提交大量设备工作. Python 调用栈, dispatcher 与编译缓存查找, 元数据维护, 以及大量短启动会消耗余量. 提交余量是对 CPU/GPU 时间线的一种解读, 不是 CUDA 指标: 设备队列耗尽时, CPU 对 GPU 的领先缩到零. Figure 30a 按这个量画出余量, Table 12 汇总常见操作是攒余量还是耗余量. Figure 31 再对比两种 block 序列: 稠密的能维持这份领先, 路由的每个 block 里有一个同步点, 把领先清零.

Backward passes usually rebuild headroom. A layer’s backward launches roughly twice the GPU work of its forward—the input-gradient and weight-gradient GEMMs (Dgrad and Wgrad, Section 9)—while the autograd engine submits that work with less per-launch overhead than the Python-driven forward. The lead earned during one microbatch’s backward then carries into the next microbatch: the first forward blocks can still run with positive headroom, while each submission-bound block spends part of the lead and leaves less for the blocks behind it. Figure 30b shows this drain-and-rebuild cycle within one microbatch.

反向通常会把余量攒回来. 一层的反向启动的 GPU 工作约是前向的两倍, 即输入梯度和权重梯度两个 GEMM (Dgrad 和 Wgrad, §9); 而 autograd 引擎提交这些工作时每次启动的开销比 Python 驱动的前向小. 一个 microbatch 反向时攒下的领先会带进下一个 microbatch: 前几个前向 block 仍有正余量可用, 每个受提交速度限制的 block 都花掉一部分领先, 留给后面 block 的就更少. Figure 30b 展示一个 microbatch 内这种先耗后攒的循环.

| Operations | Effect | Why |
| --- | --- | --- |
| Large dense and grouped GEMMs | Builds | Much device work per launch |
| Scaled dot-product attention | Builds | Same |
| Fused kernels and compiled | Builds | Many operations submitted as one launch |
| regions |  |  |
| Autograd-engine backward | Builds | Roughly twice forward's device work, submitted from C++ with low per-launch overhead |
| Python call stacks and | Consumes | Host time passes while little or no device work is queued |
| dispatcher overhead |  |  |
| Compilation-cache lookups and | Consumes | Same |
| metadata bookkeeping |  |  |
| Routing metadata and other | Consumes | Little device work per launch |
| short kernels |  |  |
| Device-to-host synchronization | Stops submission | The host blocks until the device produces the value; the queue drains and the lead must be rebuilt (Section 8.4) |

The distance between an API launch on the CPU and the corresponding GPU start is useful, but it must be interpreted with stream dependencies. A long distance can mean that useful work is already queued, or that the operation is waiting on another stream. The decisive observation is whether the GPU has runnable work when the preceding operation completes. GPU utilization and power are too coarse to establish this cause by themselves.

CPU 上一次 API 启动和对应 GPU 开始执行之间的距离有参考价值, 但要结合 stream 依赖来解读. 距离长, 可能说明有用的工作已经排好队, 也可能说明这个操作在等另一条 stream. 决定性的观察是: 前一个操作结束时, GPU 手上有没有可以运行的工作. 单看 GPU 利用率和功耗太粗, 判断不了原因.

Captured profiles of the eight-layer development model show both timeline shapes, one per expert-parallel path (Figure 74 in Appendix B.5). In the synchronized trace, a host wait inside every routed block keeps the CPU and GPU spans of each forward block aligned, and the kernel rows show idle gaps at the block

<!-- page 55 of 168 -->

time

(a) submission headroom: cheap submissions of large kernels build it, host-heavy stretches spend it

![Image block](images/p55-figure-30-submission-headroom-is-the-queued-not-yet.jpg)

(b) within one microbatch: the Python-driven forward spends the lead, the autograd-driven backward rebuilds it

![Image block](images/p55-figure-30-submission-headroom-is-the-queued-not-yet-2.jpg)

**Figure 30 Submission headroom is the queued, not-yet-executed device work.** Both curves are computed exactly from the drawn boxes: headroom jumps up by a kernel’s device duration when the CPU completes that kernel’s submission and drains at unit rate while the GPU executes, so the GPU is idle exactly where the curve sits at zero. (a) Cheap submissions of large kernels (k1–k3) build the lead; a host-heavy stretch of small kernels (k4–k7) spends it faster than it is replaced, and after the lead reaches zero the GPU waits for k7’s submission. (b) Within one microbatch, each $\mathrm { P y }$ thon-driven forward submission costs the CPU more time than its kernel costs the GPU, so the lead carried in from the previous backward drains layer by layer and grazes zero just as the last forward submission arrives. The autograd-driven backward inverts the imbalance, and while the GPU executes it, the CPU is already submitting the next microbatch’s forward: the rebuilt surplus is the lead that forward will spend. Each CPU box’s width is the full host cost of its submission, including Python and dispatcher time. Conceptual illustration with no measured quantities.

boundaries. In the rowwise trace, the CPU submits an entire microbatch while the GPU is still executing earlier work, and the GPU then executes the submitted blocks back to back.

八层开发模型抓到的 profile 里两种时间线形状都有, 每条专家并行路径各对应一种 (附录 B.5 的 Figure 74). 在同步路径的 trace 里, 每个路由 block 内部都有一次 host 等待, 让每个前向 block 的 CPU 区间和 GPU 区间对齐, kernel 行在 block 边界处出现空闲间隙. 在 rowwise 的 trace 里, GPU 还在执行前面的工作时, CPU 已经提交完整个 microbatch, GPU 随后把提交的 block 一个接一个地连续执行.

## 8.2 Small Work Units Expose Submission Overhead · 工作单元小了, 提交开销就露出来

For a fixed operator sequence, a simple host-time approximation is

对固定的算子序列, host 时间可以粗略近似为

$$
T _ {\mathrm{submit}} \approx N _ {\mathrm{launch}} t _ {\mathrm{launch}} + T _ {\mathrm{framework}} + T _ {\mathrm{bookkeeping}},\tag{11}
$$

whereas the GPU time of its GEMMs and attention generally grows with the number of tokens. Reducing the microbatch can therefore shorten device execution without reducing host work in proportion. This is one reason that a kernel-level speedup may disappear when the same kernels are invoked through an eager training stack.

而其中 GEMM 和注意力的 GPU 时间大体随 token 数增长. 式 (11) 里 $N _ { \mathrm { launch } }$ 是启动次数, $t _ { \mathrm { launch } }$ 是单次启动的 host 开销, 后两项是框架开销和元数据维护, 都与 token 数关系不大. 所以缩小 microbatch 能缩短设备执行时间, host 工作却不会按比例减少. 这也是为什么同样的 kernel 换到 eager 训练栈里调用, kernel 层面的加速可能就看不见了.

Routed blocks add host submission work to the transformer operations shared with a dense model: each block constructs routing metadata, counts expert assignments, attaches router losses, permutes or maps rows, launches expert communication, and schedules grouped GEMMs. Expert parallelism can also divide the local tokens among many experts, making each GEMM shorter. The resulting sequence of short GPU operations leaves less time for the CPU to prepare the next group of launches, even when each operation is cheap in isolation.

在和稠密模型共有的 Transformer 操作之上, 路由 block 还要加 host 提交工作: 每个 block 要构造路由元数据, 统计专家分配, 挂上 router loss, 重排或映射行, 发起专家通信, 安排 grouped GEMM. 专家并行还会把本地 token 分给很多专家, 每个 GEMM 都变短. 由此得到一串短小的 GPU 操作, 哪怕单看每个都便宜, 留给 CPU 准备下一批启动的时间也更少了.

<!-- page 56 of 168 -->

![Image block](images/p56-image.jpg)

![Image block](images/p56-figure-31-a-per-block-synchronization-point-stops-the.jpg)

Figure 31 A per-block synchronization point stops the CPU from running ahead. In the dense timeline (top), the CPU submits blocks well in advance of their GPU start times, so several blocks of device work stay queued and the GPU always finds its next operation waiting. In the routed timeline (bottom), every block contains a synchronization point: the CPU begins a sync wait, blocks until the GPU reaches the matching point, and only then submits the remainder of the block. Submission headroom cannot accumulate beyond one block, so the two processors advance in lock step and any GPU stall is exposed. The timeline is conceptual and does not encode measured duration. Section 8.4 examines the synchronizing operations themselves.

The same reasoning applies to very fast normalization, elementwise, and reduction kernels. Their device time can be shorter than the framework and launch path around them. The appropriate remedies are then larger work units, fusion, compilation, or a lower-overhead C++ interface. These remedies reduce ordinary submission cost; they do not remove an explicit device-to-host wait. The balance between submission and execution sets the microbatch-size crossover discussed next.

同样的道理也适用于跑得很快的归一化, 逐元素和归约 kernel. 它们的设备时间可能比周围的框架路径和启动路径还短. 这时该做的是加大工作单元, 融合, 编译, 或者换开销更低的 C++ 接口. 这些办法降低的是普通提交开销, 去不掉显式的设备到 host 等待. 提交和执行之间的平衡决定了下面要讲的 microbatch 大小交叉点.

## 8.3 Critical Microbatch Size · 临界 microbatch 大小

This host–device balance defines a **systems critical microbatch size**. It is unrelated to the optimizationtheoretic critical batch size discussed in Section 16. Let b denote the rank-local amount of work in one microbatch—for example, the number of sequences at fixed sequence length—and compare the CPU submission time $T _ { \mathrm { s u b m i t } } ( b )$ with the corresponding GPU execution time $T _ { \mathrm { d e v i c e } } ( b )$ . The crossover occurs near

host 与设备之间的这种平衡定义了一个**系统意义上的临界 microbatch 大小**. 它和 §16 讨论的优化理论里的临界 batch 大小无关. 记 $b$ 为一个 microbatch 在 rank 本地的工作量, 例如固定序列长度下的序列条数, 比较 CPU 提交时间 $T _ { \mathrm { s u b m i t } } ( b )$ 和对应的 GPU 执行时间 $T _ { \mathrm { d e v i c e } } ( b )$. 交叉点出现在

$$
T _ {\mathrm{device}} (b _ {\mathrm{crit}}) \approx T _ {\mathrm{submit}} (b _ {\mathrm{crit}}).\tag{12}
$$

Below this point, the GPU completes the submitted work faster than the CPU can prepare and launch the next work, so the GPU can run out of queued operations and become idle. At or above the crossover, each submitted region contains enough device work for the CPU to stay ahead. This threshold is not a model constant: it depends on the operator mix, fusion and compilation boundaries, software stack, CPU, GPU, and sequence length.

附近. 低于这个点, GPU 做完已提交工作的速度快过 CPU 准备并启动下一批工作的速度, GPU 可能耗光队列而空闲. 达到或超过交叉点时, 每段提交的区域都含有足够的设备工作, CPU 能保持领先. 这个阈值不是模型常数, 它取决于算子构成, 融合与编译的边界, 软件栈, CPU, GPU 和序列长度.

The crossover must be identified from the CPU/GPU profile of the selected configuration. Figure 32 illustrates how it can move; it does not estimate a critical size for a production run.

交叉点必须从所选配置的 CPU/GPU profile 里找. Figure 32 示意它会怎样移动, 不估算任何生产运行的临界大小.

This trend matters as accelerators improve. Moving from Hopper to Blackwell can shorten the device side of the same operator sequence without reducing Python, dispatcher, routing-bookkeeping, or launch work by the same factor. The crossover can therefore shift to a larger microbatch. A configuration that kept an H100

<!-- page 57 of 168 -->

![Image block](images/p57-figure-32-a-faster-gpu-can-move-the-critical.jpg)

Figure 32 A faster GPU can move the critical microbatch size to the right. The solid red curve represents CPU submission time, while the blue, purple, and green curves represent H100, B200, and B300 execution time. Below a crossover, the device can consume work faster than the host supplies it; faster execution with an unchanged host path therefore requires a larger microbatch to restore submission headroom. Additional GPU memory can extend the feasible microbatch range, while reducing submission overhead (dashed red; CUDA Graph replay is one way to reduce this overhead) can move the crossover to the left. The curves, intersections, and memory limits are qualitative annotations rather than measurements; no numerical critical size is implied.

continuously supplied may become host-submission limited on a faster GPU even though every individual GPU kernel improved.

加速器变快以后, 这个趋势就要紧了. 从 Hopper 换到 Blackwell, 同一串算子的设备端时间会缩短, 但 Python, dispatcher, 路由元数据维护和启动工作不会按同样比例减少. 交叉点因此可能移到更大的 microbatch. 一个原本能让 H100 一直有活干的配置, 换到更快的 GPU 上可能就受限于 host 提交, 尽管每个 GPU kernel 都变快了.

Memory-saving techniques can keep the GPU supplied by making a larger microbatch feasible: lower-precision activation storage and activation recomputation reduce the per-token memory cost, as discussed in Sections 11 and 13. Cheaper submission instead moves $b _ { \mathrm { c r i t } }$ to the left: fusion, compiled regions, and C++ execution reduce repeated host work in the production path, and CUDA Graph replay provides a low-host-overhead reference (NVIDIA, 2026l; PyTorch Contributors, 2026f). Larger microbatches consume more activation memory, while static PyTorch capture/replay imposes address, shape, and buffer-retention constraints; their value depends on whether CPU submission or GPU execution limits the measured step at the selected microbatch size.

省显存的技术能让更大的 microbatch 放得下, 从而让 GPU 一直有活: 低精度存激活和激活重算都降低了每个 token 的显存开销, 见 §11 和 §13. 降低提交开销则把 $b _ { \mathrm { c r i t } }$ 往左移: 融合, 编译区域和 C++ 执行减少了生产路径里重复的 host 工作, CUDA Graph 重放给出一个 host 开销很低的参照 (NVIDIA, 2026l; PyTorch Contributors, 2026f). 更大的 microbatch 吃更多激活显存, 而 PyTorch 的静态捕获与重放要求地址, 形状固定, 缓冲要一直保留; 这些办法值不值, 要看在所选的 microbatch 大小下, 实测的步时是受 CPU 提交限制还是受 GPU 执行限制.

## 8.4 Device-to-Host Synchronization Drains the Queue · 设备到 host 的同步会排空队列

A **device-to-host (D2H) synchronization** occurs when host execution cannot continue until a value computed on the GPU is available to the CPU. The CPU stops submitting later work while the GPU completes all dependencies needed to produce that value. The wait consumes submission headroom, but the GPU becomes idle only if it outlasts useful independent work that was already submitted. After the value arrives, the host must rebuild its lead over the device.

当 host 必须等 GPU 算出的某个值到达 CPU 才能继续执行时, 就发生一次**设备到 host (D2H) 同步**. GPU 完成产出这个值所需的全部依赖期间, CPU 停止提交后续工作. 这次等待消耗提交余量; 但只有等待时间超过已提交的独立有用工作时, GPU 才会空闲. 值到达以后, host 还得重新攒出对设备的领先.

Block all-to-all EP (Section 5.3) provides a concrete example. Routing produces the number of tokens sent to each destination on the GPU. In Olmo-core’s synchronized path, ranks exchange token counts on the GPU, then copy the send, receive, and local-expert counts to CPU memory and wait. The send and receive counts become the Python split lists used to launch the data exchange. A fully dynamic receive buffer has the same problem when its allocation shape is derived from device counts. Some legacy grouped-GEMM backends<sup>9</sup> likewise require host-visible expert sizes, although that dependency can occur without EP. The simplified pseudocode separates the two host dependencies:

block all-to-all EP (§5.3) 是一个具体例子. 路由在 GPU 上算出发往每个目的地的 token 数. 在 Olmo-core 的同步路径里, 各 rank 先在 GPU 上交换 token 计数, 再把发送, 接收和本地专家计数拷到 CPU 内存并等待. 发送和接收计数变成 Python 切分列表, 用来发起数据交换. 完全动态的接收缓冲, 如果分配形状由设备计数推出, 也有同样的问题. 一些旧版 grouped GEMM 后端<sup>9</sup> 同样要求 host 可见的专家大小, 不过这层依赖在没有 EP 时也会出现. 下面的简化伪代码把两处 host 依赖分开写:

<sup>9</sup>In Olmo-core, the legacy grouped-GEMM fallback used before the PyTorch device-offset fast path takes host-side split sizes.

<sup>9</sup>在 Olmo-core 里, 用上 PyTorch 设备端偏移快速路径之前的旧版 grouped GEMM 回退实现, 接收的是 host 端的切分大小.

<!-- page 58 of 168 -->

```python
peer_sizes_gpu = count_routes_per_peer(routes)
# All-to-all requires host-side split sizes.
peer_sizes = copy_to_cpu_and_wait(peer_sizes_gpu) # host sync
all_to_all(x, split_sizes=peer_sizes)

expert_sizes_gpu = count_routes_per_expert(routes)
# Legacy grouped GEMM also requires host-side expert sizes.
expert_sizes = copy_to_cpu_and_wait(expert_sizes_gpu) # legacy host sync
grouped_gemm(x, expert_sizes)
```

Both waits arise when an interface turns device-produced counts into host inputs. A receive buffer allocated from the current route count creates the same dependency even if the transfer itself accepts device metadata. Section 8.5 follows the changes to communication, allocation, and grouped-GEMM scheduling that keep these counts on the GPU.

两处等待都出在接口把设备算出的计数变成 host 输入的地方. 即使传输本身接受设备端元数据, 按当前路由计数分配的接收缓冲也会造成同样的依赖. §8.5 讲通信, 分配和 grouped GEMM 调度怎样改, 让这些计数留在 GPU 上.

![Image block](images/p58-figure-33-host-visible-split-sizes-delay-the-all.jpg)

Figure 33 Host-visible split sizes delay the all-to-all launch. The GPU produces route counts, but the synchro nized variable-split path must expose them to the CPU before the collective can be launched. If the queue drains at this boundary, the GPU becomes idle until the host receives the counts and submits the all-to-all. The timeline is conceptual and does not encode measured duration.

Independent work submitted before the host wait can occupy some or all of this interval. In Figure 34, sharedexpert compute runs while the CPU waits for the route counts. This scheduling hides the GPU bubble but does not remove the synchronization or allow the all-to-all to launch before its split sizes reach the host.

host 等待之前提交的独立工作可以填满这段间隔的一部分或全部. 在 Figure 34 里, CPU 等路由计数时, 共享专家的计算在跑. 这样排能藏住 GPU 的空泡, 但同步本身还在, all-to-all 也不能在切分大小到达 host 之前启动.

![Image block](images/p58-figure-34-independent-compute-can-cover-a-host-wait.jpg)

Figure 34 Independent compute can cover a host wait without removing it. The CPU submits shared-expert work before blocking on GPU-produced route counts, so the GPU remains busy while the host waits. The all-to-all still cannot be submitted until the counts are host-visible. This is latency coverage, not communication–compute overlap; the timeline is conceptual and does not encode measured duration.

Dynamic routing itself does not require a host synchronization. The synchronization is introduced by an interface that asks the CPU to interpret a device result. Table 13 separates definite host-visible operations from operations that are often blamed incorrectly.

动态路由本身并不需要 host 同步. 同步是由要求 CPU 去解读设备结果的接口引入的. Table 13 把确定会让 host 可见的操作, 和常被错怪的操作分开列出.

PyTorch explicitly documents the synchronization behavior of nonzero() on CUDA (PyTorch Contributors, 2026k). Scalar extraction and host-visible copies have the same fundamental dependency: Python cannot

<!-- page 59 of 168 -->

| Pattern | Host wait | Reason |
| --- | --- | --- |
| x.item() | Yes | Materializes a CUDA scalar as a Python value. |
| x.cpu() followed by host use | Yes | The host-visible copy must wait for the required source data. |
| torch.nonzero(x) on | Yes | PyTorch documents a host-device synchronization |
| CUDA |  | for this dynamic-output operator. |
| torch.empty([int(x)]) | Yes, before allocation | The conversion of the CUDA scalar to a Python integer synchronizes; empty itself is not the cause. |
| Device indexing, gather, or | Not inherently | These remain GPU operations when indices, shapes, |
| scatter |  | and results stay on the device. |

use a value that the device has not produced. This does not imply that every dynamic operator or tensor allocation synchronizes. Whether a hot-path call blocks depends on where its shape and control data reside.

PyTorch 文档明确写了 CUDA 上 nonzero() 的同步行为 (PyTorch Contributors, 2026k). 取标量和 host 可见的拷贝有同样的根本依赖: Python 用不了设备还没算出来的值. 这不意味着每个动态算子或每次张量分配都会同步. 热路径上的调用会不会阻塞, 要看它的形状数据和控制数据放在哪里.

CUDA stream events illustrate the distinction between required device ordering and host blocking. A stream can wait on an event while the CPU continues to submit independent work. Calling a host synchronization routine waits on the CPU and therefore changes the submission path. The goal is to retain necessary device ordering without making the host participate in data-dependent scheduling.

CUDA stream event 能说明必要的设备端排序和 host 阻塞之间的区别. 一条 stream 可以等某个 event, 同时 CPU 继续提交独立的工作. 调用 host 同步函数则是在 CPU 上等, 因而改变了提交路径. 目标是保留必要的设备端排序, 同时不让 host 参与依赖数据的调度.

## 8.5 How to Become Synchronization-Free · 怎样做到无同步

Device-resident route metadata and device-side grouped-GEMM offsets remove the two count-dependent host waits from Olmo’s rowwise MoE path. Capacity-shaped storage prevents route counts from becoming host allocation decisions. The selected routes remain dynamic; buffer capacities are fixed before the training loop.

驻留设备的路由元数据和设备端的 grouped GEMM 偏移, 去掉了 Olmo rowwise MoE 路径上两处依赖计数的 host 等待. 按容量开的存储让路由计数不再变成 host 端的分配决定. 选中的路由仍是动态的; 缓冲容量在训练循环开始前就定好.

The rowwise mechanics are those of Sections 5.4 and 5.7; this subsection isolates their host-facing consequence. Table 14 lists the host dependency removed by each mechanism and its associated cost. The first two rows remove the all-to-all dependency; the third removes the grouped-GEMM dependency. Each removal has a focused illustration: Figures 15 and 16 contrast the synchronized block all-to-all with the rowwise path whose route metadata never leaves the GPU, and Figures 36 and 37 contrast the host-loop grouped GEMM with the device-scheduled interface that consumes offsets where they are produced.

rowwise 的具体机制就是 §5.4 和 §5.7 讲的那些, 本小节只单独看它们对 host 一侧的影响. Table 14 列出每个机制去掉了哪处 host 依赖, 以及相应的代价. 前两行去掉 all-to-all 的依赖, 第三行去掉 grouped GEMM 的依赖. 每处去除都有对应的图: Figure 15 和 Figure 16 对比同步的 block all-to-all 与路由元数据从不离开 GPU 的 rowwise 路径; Figure 36 和 Figure 37 对比 host 循环的 grouped GEMM 与在偏移产出处直接消费偏移的设备端调度接口.

| Mechanism | Host dependency removed Cost accepted |
| --- | --- |
| Device-resident route meta- | Python split lists interpreted per |
| data: route maps, counts, and | Metadata kernels in every routed layer microbatch |
| offsets stay CUDA tensors |  |
| Capacity-shaped buffers with a | Reserved capacity memory; possible route Data-dependent allocation shapes |
| valid-row prefix | drops |
| Device-side cumulative offsets | item() per expert count and a host Backend must accept device offsets |
| for grouped GEMM | GEMM loop |

| Dynamic Routes, Fixed Buffer CapacitiesKeep route counts dynamic on the GPU; fix buffer capacities before the training loop. |
| --- |

**Device-resident route metadata.** The router produces route maps, destination ranks and rows, per-rank counts, and expert-group offsets as CUDA tensors. The rowwise dispatch and combine kernels consume those

<!-- page 60 of 168 -->

tensors directly (Figure 16). Olmo currently uses NVSHMEM because it supports GPU-initiated one-sided PUT and GET operations over symmetric memory (NVIDIA, 2026t). The host still launches kernels and establishes the communication resources; it does not retrieve a variable split list for each microbatch. Perrank count exchange, stream waits, and NVSHMEM barriers still provide required device ordering; their route-dependent values remain CUDA tensors and are not consumed by the host. The count exchange is one all-gather over the EP-MP group. This is the rowwise NVSHMEM path analyzed in this section.

**驻留设备的路由元数据.** router 产出的 route map, 目标 rank 与行号, 每 rank 计数, 专家组偏移都是 CUDA 张量. rowwise dispatch 和 combine kernel 直接消费这些张量 (Figure 16). Olmo 目前用 NVSHMEM, 是因为它支持在对称内存上由 GPU 发起单边 PUT 和 GET (NVIDIA, 2026t). host 仍负责启动 kernel 和建立通信资源, 但不再每个 microbatch 取回一份变长切分列表. 每 rank 计数的交换, stream 等待和 NVSHMEM barrier 仍提供必要的设备端排序; 其中依赖路由的值一直是 CUDA 张量, host 不消费它们. 计数交换是 EP-MP 组上的一次 all-gather. 本节分析的就是这条 rowwise NVSHMEM 路径.

**Capacity-shaped storage.** Dispatch, combine, scale, and metadata buffers are allocated to a configured capacity. A route map identifies which rows are valid in the current microbatch. This separates a static upper bound, which the allocator needs, from the dynamic valid-row count, which remains on the device. The distinction matters because unwritten capacity rows may contain stale data; expert compute and combine therefore consume only the rows marked valid for the current microbatch.

**按容量开的存储.** dispatch, combine, scale 和元数据缓冲都按配置的容量分配. route map 标出当前 microbatch 里哪些行有效. 这样就把分配器需要的静态上界, 和留在设备上的动态有效行数分开了. 这个区分要紧, 因为没写到的容量行可能留着旧数据; 所以专家计算和 combine 只消费当前 microbatch 标为有效的行.

**Device-side grouped-GEMM scheduling.** Current Olmo expert compute uses a grouped-GEMM interface with a CUDA int32 cumulative-offset tensor (Figure 37). The backend, rather than a Python loop, identifies the row range assigned to each local expert. This removes the need to call item() on each expert count and also reduces the number of GEMM launches. A CPU-loop implementation would instead copy offsets to the host and serialize group launches, recreating the synchronization and launch gaps that the device-offset interface removes.

**设备端的 grouped GEMM 调度.** Olmo 现在的专家计算用的 grouped GEMM 接口接收一个 CUDA int32 累积偏移张量 (Figure 37). 每个本地专家分到哪段行, 由后端确定, 不由 Python 循环确定. 这样既不必对每个专家计数调用 item(), 也减少了 GEMM 启动次数. CPU 循环的实现则要把偏移拷到 host, 并把各组启动串起来, 又把设备偏移接口去掉的同步和启动间隙带了回来.

**Capacity trades memory for the removed stall.** A fixed envelope can reserve more memory than the valid routes require and can drop routes if the configured capacity is exceeded. Current grouped GEMMs use device offsets and stop at the valid expert rows (Section 9), but capacity tails still occupy buffer memory and can be touched by non-GEMM elementwise work; a tail-aware SwiGLU kernel that applies the activation only to the valid prefix avoids touching the tails on forward-only paths. Other implementations may also communicate padded rows. Useful-token FLOPs must exclude those rows, while physical memory, transferred bytes, and executed kernel work must include them. Capacity overhead is therefore the cost of removing the host synchronization.

**容量用显存换掉了停顿.** 固定的容量上限可能比有效路由实际需要的显存多, 超过配置容量时还会丢路由. 现在的 grouped GEMM 用设备偏移, 算到有效专家行就停 (§9); 但容量尾部仍占着缓冲显存, 也可能被 GEMM 以外的逐元素操作碰到. 一个感知尾部的 SwiGLU kernel 只对有效前缀做激活, 在只有前向的路径上就不碰尾部. 别的实现还可能把填充行也传出去. 计算有用 token 的 FLOPs 时必须排除这些行, 统计物理显存, 传输字节和实际执行的 kernel 工作时必须算上. 所以容量开销就是去掉 host 同步的代价.

**Reducing remaining submission overhead.** Fusion, compiled regions, and C++ execution reduce the number and cost of ordinary launches after dynamic metadata has been kept on the device. These techniques solve a different problem from D2H synchronization. A faster Python or C++ call stack cannot repair an API that fundamentally requires a GPU value in Python. In the current implementation, the custom symmetricmemory transport remains a deliberate C++/CUDA boundary of the compiled block; compilation reduces surrounding work but does not capture the complete rowwise path as one graph.

**压低剩下的提交开销.** 动态元数据留在设备上以后, 融合, 编译区域和 C++ 执行能减少普通启动的次数和开销. 这些技术解决的问题和 D2H 同步不同. 一个从根上就要求在 Python 里拿到 GPU 值的 API, 换再快的 Python 或 C++ 调用栈也修不好. 在现有实现里, 自定义的对称内存传输有意保留为编译 block 的一道 C++/CUDA 边界; 编译减少了周围的工作, 但没有把整条 rowwise 路径捕获成一张图.

CUDA Graph replay could remove much of this remaining submission cost, but its stable-address and fixedshape requirements conflict with live pipeline microbatches, and the production path is not graph captured. Section 15.6 analyzes that trade and uses replay only as a diagnostic ceiling that separates device service time from eager submission cost.

CUDA Graph 重放能去掉剩下提交开销的一大部分, 但它要求地址稳定, 形状固定, 和流水线里同时存活的多个 microbatch 冲突, 所以生产路径没有做图捕获. §15.6 分析这个取舍, 只把重放当作诊断用的上限, 用来区分设备服务时间和 eager 提交开销.

> **停一下:** §8.5 说 rowwise 路径「无同步」, 但同一段又说计数交换是 EP-MP 组上的一次 all-gather, 外加 NVSHMEM barrier. 这和 block 路径的同步到底差在哪?
> 答: 差在等的是谁. block 路径里, 计数要拷到 CPU, Python 拿到切分列表才能发起 all-to-all, CPU 停在那里, 提交余量清零 (§8.4, Figure 33). rowwise 路径里, all-gather 和 barrier 是 GPU stream 上的操作, 等待发生在设备队列里, CPU 照常往后提交 (§8.4 末段对 stream event 的区分). 所以 GPU 端的跨 rank 等待一点没少, 慢 rank 照样会拖住快 rank; 去掉的只是 host 的参与. 这也意味着「无同步」不保证没有 GPU 空闲: 如果 EP-MP 组内路由不均衡, 卡在 barrier 上的 GPU 照样闲着, 只是 CPU 不再陪着等. 附录 B.5 的单 rank trace 只能证明后一半, 证明不了前一半.

Host-wait behavior depends on the running configuration. Appendix B.6 records the verification checklist and a graph-replay microbenchmark that isolates the submission tax on short expert operations. In the captured rowwise timeline of Appendix B.5, no host wait interrupts submission for the eight-layer BF16 EP8 development model with a shared expert. This is a single-rank captured instance of the mechanism, not a guarantee for every configuration or execution phase; initialization, compilation, warmup, and buffer allocation remain outside the steady-state scope.

host 等待的情况取决于运行的配置. 附录 B.6 记录了核验清单, 以及一个图重放微基准, 用来单独量出短专家操作上的提交税. 在附录 B.5 抓到的 rowwise 时间线里, 带共享专家的八层 BF16 EP8 开发模型没有任何 host 等待打断提交. 这只是单个 rank 上抓到的一次机制实例, 不保证所有配置和执行阶段都如此; 初始化, 编译, 预热和缓冲分配不在稳态的范围内.

Capacity memory and padding remain costs of this design. Once the count-dependent waits are removed, ordinary submission overhead still determines whether the CPU can keep the GPU supplied.

容量显存和填充仍是这套设计的代价. 依赖计数的等待去掉之后, CPU 能不能让 GPU 一直有活干, 仍由普通的提交开销决定.

## 9 Grouped GEMM

Routing turns one expert layer into a ragged batch of matrix multiplications. After dispatch, each rank holds token rows ordered by local expert and a device tensor containing the number of rows assigned to every expert.

路由把一个专家层变成一批行数参差不齐的矩阵乘. dispatch 之后, 每个 rank 手上有按本地专家排好的 token 行, 以及一个记着每个专家分到多少行的设备张量.

<!-- page 61 of 168 -->

**Grouped general matrix multiplication (grouped GEMM)** executes these unequal row counts without padding every expert to the hottest load. A device-scheduled implementation also avoids returning the counts to the CPU.

**分组通用矩阵乘 (grouped GEMM)** 直接按这些不等的行数执行, 不用把每个 expert 都 pad 到最热 expert 的负载. 由 device 调度的实现还省掉了把行数回传 CPU 这一步.

## 9.1 Routing Creates Uneven GEMMs · 路由产生不等长的 GEMM

Let M<sub>e</sub> be the number of rows assigned to local expert $e _ { \gamma }$ d the model dimension, and h the expert intermediate dimension. A SwiGLU expert applies

记 $M_e$ 为分给本地 expert $e$ 的行数, $d$ 为模型维度, $h$ 为 expert 中间维度. 一个 SwiGLU expert 计算

$$
\begin{array}{l l} U _ {e} = X _ {e} W _ {\mathrm{ug}, e} ^ {\mathsf {T}}, & X _ {e} \in \mathbb {R} ^ {M _ {e} \times d}, \quad W _ {\mathrm{ug}, e} \in \mathbb {R} ^ {2 h \times d}, \\ Y _ {e} = \operatorname{SwiGLU} (U _ {e}) W _ {\text {down}, e}, & Y _ {e} \in \mathbb {R} ^ {M _ {e} \times d}, \quad W _ {\text {down}, e} \in \mathbb {R} ^ {h \times d}. \end{array}\tag{13}
$$

Within one routed layer, every expert has the same weight shapes; routing changes only $M _ { e }$ . The rank therefore receives $\textstyle M = \sum _ { e } M _ { e }$ useful rows but must execute a collection of GEMMs whose first dimension varies by expert. A single dense GEMM cannot select a different weight matrix for each segment, while launching every expert independently creates a long sequence of small operations.

同一路由层里, 所有 expert 的权重形状相同, 路由只改变 $M_e$. 于是 rank 收到 $M = \sum_e M_e$ 行有效数据, 却要执行一组第一维随 expert 变化的 GEMM. 一个 dense GEMM 没法给每一段换一个权重矩阵; 每个 expert 各自 launch 一次, 又会变成一长串小算子.

## 9.2 Padding, Host Scheduling, and Device Scheduling · padding, host 调度与 device 调度

Figures 35, 36, and 37 compare three ways to execute the same expert projections. They differ in whether they pad the ragged row dimension, make its sizes visible to the host, or schedule the variable-size problems directly from device metadata.

图 35, 36, 37 对比执行同一组 expert 投影的三种方式. 区别在于: 是把参差的行维 pad 齐, 是把各段大小交给 host, 还是直接用 device 上的元数据调度这些变长问题.

**Padded BMM.** The simplest strategy pads every expert to a common capacity C and forms an $N _ { \mathrm { l o c a l } } \times C \times d$ activation tensor. **Batched matrix multiplication (BMM)** then launches one regular operation, but it executes $N _ { \mathrm { l o c a l } } C$ rows even though only M rows contain routes. Its padding fraction is

**Padded BMM.** 最简单的做法是把每个 expert pad 到统一容量 $C$, 拼成 $N_{\mathrm{local}} \times C \times d$ 的激活张量. 然后 **批量矩阵乘 (BMM)** 只 launch 一个规则算子, 但它执行 $N_{\mathrm{local}} C$ 行, 其中只有 $M$ 行装着路由. padding 占比为

$$
\rho_ {\mathrm{pad}} = 1 - \frac {\sum_ {e} M _ {e}}{N _ {\mathrm{local}} C}.\tag{14}
$$

The cost rises with reserved capacity and, once experts overflow their reserved rows, with load imbalance. Empty rows consume the same matrix-multiply work as routed rows.

代价随预留容量上升; expert 一旦超出预留行数, 还会随负载不均上升. 空行消耗的矩阵乘计算和有路由的行一样多.

**Host-scheduled variable GEMMs.** An exact-size alternative makes $( M _ { 1 } , \ldots , M _ { N _ { \operatorname { l o c a l } } } )$ visible to the CPU and launches the corresponding GEMMs from a host loop. This avoids padded arithmetic, but it introduces a device-to-host dependency before expert compute can be submitted and replaces one grouped launch with a sequence of smaller launches.

**host 调度的变长 GEMM.** 按精确尺寸执行的另一种做法, 是把 $(M_1, \ldots, M_{N_{\mathrm{local}}})$ 交给 CPU, 由 host 循环逐个 launch 对应的 GEMM. 这样没有 padding 算术, 但 expert 计算提交之前多了一个 device 到 host 的依赖, 一次分组 launch 也变成一串更小的 launch.

**Device-scheduled grouped GEMM.** A device-scheduled backend keeps the cumulative expert offsets on the GPU. A GPU preparation kernel derives the per-expert pointers, strides, and matrix dimensions; one CUT-LASS grouped kernel then schedules tiles across that problem list (NVIDIA, 2026m). The current Olmo BF16 path reaches this mechanism through PyTorch grouped matrix multiplication on its CUDA fast path. MegaBlocks instead expresses expert compute as block-sparse matrix multiplication over a block-compressed layout. This avoids padding every expert to a common capacity, although its published implementation still pads each expert batch to a multiple of 128 rows for block alignment. It is a related, but distinct, execution strategy (Gale et al., 2023).

**device 调度的 grouped GEMM.** device 调度的后端把各 expert 的累积 offset 留在 GPU 上. 一个 GPU 准备 kernel 推出每个 expert 的指针, stride 和矩阵维度; 随后一个 CUTLASS grouped kernel 在这份问题列表上调度 tile (NVIDIA, 2026m). Olmo 现在的 BF16 路径经 PyTorch grouped matrix multiplication 的 CUDA 快路径用上这套机制. MegaBlocks 走的是另一条路: 在块压缩布局上用块稀疏矩阵乘表达 expert 计算. 它也不用把每个 expert pad 到统一容量, 不过公开实现仍会为块对齐把每个 expert 的 batch pad 到 128 行的整数倍. 这是相关但不同的执行策略 (Gale et al., 2023).

## 9.3 Device-Side Offsets Avoid a Host Synchronization · device 端 offset 省掉一次 host 同步

The route histogram is produced on the GPU. If a GEMM interface requires a Python list or CPU tensor of split sizes, the CPU must wait for that histogram before it can submit the expert work. As Section 8.4 explains, this device-to-host dependency drains the queued GPU work and can expose a submission bubble after the synchronization.

路由直方图在 GPU 上产生. 如果 GEMM 接口要求 split 大小是 Python list 或 CPU 张量, CPU 就得等这份直方图算完才能提交 expert 计算. 按 8.4 节的分析, 这个 device 到 host 的依赖会把 GPU 队列排空, 同步之后还可能露出一段提交空泡.

<!-- page 62 of 168 -->

![Image block](images/p62-image.jpg)

![Image block](images/p62-figure-35-padded-bmm-regularizes-the-ragged-row-dimension.jpg)

Figure 35 Padded BMM regularizes the ragged row dimension. Every expert is padded to capacity C, enabling one regular batched operation. Empty rows nevertheless consume matrix-multiply work, and their outputs are dis carded. Expert weight shapes are fixed; only routed row counts differ.

Figure 36 A host loop executes exact-size expert GEMMs. It avoids padded arithmetic, but GPU-produced row counts must become host-visible before the runtime can submit the per-expert operations. The separate streams in this conceptual drawing are not required by the method; the legacy Olmo fallback submits its GEMMs on the current stream.

<!-- page 63 of 168 -->

![Image block](images/p63-figure-37-device-scheduled-grouped-gemm-executes-exact-row.jpg)

Figure 37 Device-scheduled grouped GEMM executes exact row segments without a host round trip. Device row counts are converted to cumulative offsets. GPU-side preparation then forms the grouped problem list before CUTLASS schedules the compute. The physical buffers retain fixed shapes while the offsets restrict work to the rows assigned to each expert.

Olmo instead computes cumulative expert offsets on the device and passes them to grouped matrix multi-plication. The preparation and scheduling kernels can therefore be queued without the CPU interpreting any route count. The selected backend must support device offsets. A fallback that copies them to the CPU recreates the synchronization even when the call site still says grouped\_mm. Appendix A.6 records the architecture-specific availability of the current device-offset fast path.

Olmo 的做法是在 device 上算出 expert 累积 offset, 直接交给 grouped matrix multiplication. 准备 kernel 和调度 kernel 因此可以排进队列, CPU 不需要读任何路由计数. 前提是所选后端支持 device offset. 如果后端退回到把 offset 拷到 CPU, 即使调用处还写着 grouped\_mm, 同步也会重新出现. 附录 A.6 记录了当前 device offset 快路径在各架构上是否可用.

## 9.4 Padded Shape, Unpadded Compute · 形状 pad, 计算不 pad

Static physical shapes are a central advantage of the rowwise path (Section 5.4). Rowwise EP reserves capacity-shaped communication buffers, so their addresses and dimensions do not change with every routing decision. The device offsets separately describe the variable amount of work for each expert. Dispatch writes the received routes directly into expert-contiguous segments, and the cumulative offsets are computed from the real $M _ { e }$ values. The grouped GEMM consumes only those segments; unused capacity remains outside the final offset. Changing route counts therefore does not require new allocations or new tensor shapes at the compiled boundary, yet the unused tails are not executed.

静态物理形状是 rowwise 路径的核心优势 (5.4 节). rowwise EP 按容量预留通信 buffer, 地址和维度不随每次路由决策变化. 每个 expert 有多少活, 另由 device offset 描述. dispatch 把收到的路由直接写进按 expert 连续排列的段里, 累积 offset 按真实的 $M_e$ 计算. grouped GEMM 只读这些段, 没用到的容量落在最后一个 offset 之外. 所以路由计数变了, 编译边界上不需要新分配内存, 也不出现新的张量形状, 而未用的尾部也不会被执行.

This layout also removes a local permutation between communication and expert compute. The up/gate projection reads the dispatch buffer directly, and the down projection can write directly into the buffer consumed by combine—the direct-access pattern of Figure 20b. In backward, the buffer-aware grouped GEMM wrapper can write the input gradient back into the designated dispatch-gradient storage. Thus, the rowwise path combines fixed-shape allocation with unpadded compute and avoids an additional pack–unpack pair at the grouped-GEMM boundary. Appendix A documents the explicit output-buffer interfaces.

这种布局还去掉了通信和 expert 计算之间的一次本地重排. up/gate 投影直接读 dispatch buffer, down 投影可以直接写进 combine 要读的 buffer, 即图 20b 的直接访问模式. 反向时, 感知 buffer 的 grouped GEMM 封装可以把输入梯度写回指定的 dispatch 梯度存储. 于是 rowwise 路径同时拿到固定形状的分配和不带 padding 的计算, 在 grouped GEMM 边界上也少了一对 pack/unpack. 显式输出 buffer 的接口见附录 A.

## 9.5 Forward, Dgrad, and Wgrad Are Different Problems · 前向, Dgrad 与 Wgrad 是三个不同的问题

For a grouped linear projection $Y _ { e } = X _ { e } W _ { e }$ , let $X _ { e } \in \mathbb { R } ^ { M _ { e } \times d _ { \mathrm { i n } } }$ and $W _ { e } \in \mathbb { R } ^ { d _ { \mathrm { i n } } \times d _ { \mathrm { o u t } } }$ . Backward requires the input gradient (**Dgrad**) and the weight gradient (**Wgrad**):

对分组线性投影 $Y_e = X_e W_e$, 取 $X_e \in \mathbb{R}^{M_e \times d_{\mathrm{in}}}$, $W_e \in \mathbb{R}^{d_{\mathrm{in}} \times d_{\mathrm{out}}}$. 反向要算输入梯度 (**Dgrad**) 和权重梯度 (**Wgrad**):

$$
\nabla X _ {e} = \nabla Y _ {e} W _ {e} ^ {\mathsf {T}}, \quad \nabla W _ {e} = X _ {e} ^ {\mathsf {T}} \nabla Y _ {e}.\tag{15}
$$

<!-- page 64 of 168 -->

| Phase | Left operand | Right operand | Contract | Result | Role of $M_e$ |
| --- | --- | --- | --- | --- | --- |
| Forward | $X_e [M_e \times d_{\text{in}}]$ | $W_e [d_{\text{in}} \times d_{\text{out}}]$ | $d_{\text{in}}$ | $Y_e [M_e \times d_{\text{out}}]$ | Output rows |
| Dgrad | $\nabla Y_e [M_e \times d_{\text{out}}]$ | $W_e^{\mathsf{T}} [d_{\text{out}} \times d_{\text{in}}]$ | $d_{\text{out}}$ | $\nabla X_e [M_e \times d_{\text{in}}]$ | Output rows |
| Wgrad | $X_e^{\mathsf{T}} [d_{\text{in}} \times M_e]$ | $\nabla Y_e [M_e \times d_{\text{out}}]$ | $M_e$ | $\nabla W_e [d_{\text{in}} \times d_{\text{out}}]$ | Contraction length |

The algebra is the same as for a dense linear layer. The difference is that a dense layer has one common token dimension, whereas a routed layer has a different $M _ { e }$ for every expert (Table 15). Forward and Dgrad therefore contain different numbers of output rows per expert, while Wgrad contains different contraction lengths. For the up/gate projection, $( d _ { \mathrm { i n } } , d _ { \mathrm { o u t } } ) = ( d , 2 h )$ ; for the down projection, it is $( h , d )$ . These differences change operand layout, tile geometry, and output buffer opportunities. A forward-only kernel result therefore cannot predict the complete training benefit.

代数和 dense 线性层一样. 差别在于 dense 层只有一个公共的 token 维, 路由层每个 expert 的 $M_e$ 各不相同 (表 15). 所以前向和 Dgrad 里, 各 expert 的输出行数不同; Wgrad 里不同的是收缩长度. up/gate 投影的 $(d_{\mathrm{in}}, d_{\mathrm{out}}) = (d, 2h)$, down 投影是 $(h, d)$. 这些差别会改变操作数布局, tile 几何形状, 以及能否直接写输出 buffer. 只测前向的 kernel 结果, 预测不了训练的完整收益.

Precision makes the distinction sharper. Olmo’s routed MXFP8 path uses scaled grouped GEMM for forward and Dgrad, while its current Wgrad path uses BF16 grouped GEMM after reconstructing the required operands. Section 11.3 explains why the natural MXFP8 Wgrad contraction is not simply another copy of the forward operation.

精度让这个区别更明显. Olmo 的路由 MXFP8 路径在前向和 Dgrad 用带 scale 的 grouped GEMM, 当前的 Wgrad 路径则先重建所需操作数, 再用 BF16 grouped GEMM. 为什么 MXFP8 下 Wgrad 的自然收缩不能照抄前向, 见 11.3 节.

## 9.6 Rows per Expert Determine the Throughput Crossover · 每个 expert 的行数决定吞吐交叉点

Grouped scheduling removes per-expert host launches and avoids BMM’s padded rows, but it does not turn many small expert matrices into one large dense matrix. Its useful geometry is set by the vector $( M _ { 1 } , \ldots , M _ { N _ { \operatorname { l o c a l } } } )$ , not only by the sum M. The mean $\overline { { M } } = M / N _ { \mathrm { l o c a l } }$ indicates how much work is available per expert, while the spread of the $M _ { e }$ values determines BMM padding and how evenly the grouped scheduler can distribute tiles. Small $M _ { e }$ also means less weight reuse, which can make memory bandwidth the limit even before scheduling overhead. Appendix A.8 derives this idealized bound; the comparisons below measure actual kernel performance.

分组调度去掉了每个 expert 一次的 host launch, 也避开了 BMM 的 padding 行, 但它没法把许多小 expert 矩阵变成一个大 dense 矩阵. 决定有效几何形状的是整个向量 $(M_1, \ldots, M_{N_{\mathrm{local}}})$, 不只是总和 $M$. 均值 $\overline{M} = M / N_{\mathrm{local}}$ 表示每个 expert 平均有多少活; $M_e$ 的离散程度决定 BMM 要 pad 多少, 也决定分组调度器能把 tile 分得多均匀. $M_e$ 小还意味着权重复用少, 调度开销还没显现, 显存带宽可能就先成了瓶颈. 附录 A.8 推导了这个理想化上界, 下面的对比测的是 kernel 的实际性能.

We measure the costs of fixed capacity and of splitting one projection into expert-sized problems, then vary the expert-load histogram at fixed work. A separate stress diagnostic extends beyond the training range to investigate the decline at large shapes. We omit the host loop from the kernel-speed comparison because CUDA events do not capture the preceding host wait.

我们先测固定容量的代价, 以及把一个投影拆成 expert 大小的子问题的代价, 再在总工作量不变时改变 expert 负载直方图. 另有一项压力诊断超出训练范围, 专门考察大形状下的性能下降. kernel 速度对比里不放 host 循环, 因为 CUDA event 量不到它之前的 host 等待.

**The cost of fixed capacity.** The legacy BMM path sets its per-expert capacity from the ideal mean load M and a capacity factor c. With the eight-row alignment used by Olmo,

**固定容量的代价.** 旧的 BMM 路径用理想平均负载 $\overline{M}$ 和容量因子 $c$ 设定每个 expert 的容量. 加上 Olmo 用的 8 行对齐,

$$
C = 8 \left\lceil \frac {\lfloor c \overline {{M}} \rfloor}{8} \right\rceil .\tag{16}
$$

For $c = 1 . 2 5$ , the ideal capacity already contains 25% more rows than useful work, or a 20% padding fraction; eight-row alignment can increase that gap further.<sup>10</sup> This is different from choosing $C   =   \operatorname* { m a x } _ { e } M _ { e }$ after observing the routes. Grouped GEMM instead uses the real cumulative counts and excludes every unused capacity row.

$c = 1.25$ 时, 理想容量本身就比有效工作多 25% 的行, 也就是 20% 的 padding 占比; 8 行对齐还可能把差距拉大.<sup>10</sup> 这和看过路由之后再取 $C = \max_e M_e$ 不是一回事. grouped GEMM 则用真实累积计数, 排除所有没用到的容量行.

**The crossover sits at a few hundred rows per expert.** On one B300 with 16 local experts and $d = h = 4 0 9 6$ Figure 38 compares one BF16 exact-row grouped expert projection with BMM at 1.25× per-expert capacity while sweeping the total routed-row count M from 64 rows to 128K. BMM executes 25% more rows at every point, but its regular kernel is faster through $M   =   4 \mathrm { K }$ . The crossover lies between $M   =   4 \mathrm { K }$ and

C = ⌈1 25M⌉

10<sub>The</sub> sweep below uses . exactly, isolating the capacity factor itself; the eight-row alignment of Equation 16 would add a second, shape-dependent padding term on top of the factor.

<sup>10</sup> 下面的扫描严格取 $C = \lceil 1.25\overline{M} \rceil$, 只隔离容量因子本身; 式 (16) 的 8 行对齐会在因子之外再叠一项随形状变化的 padding.

<!-- page 65 of 168 -->

M = 8K, corresponding to 256–512 routed rows per expert, and grouped GEMM is faster at every measured point above it, although its advantage remains shape dependent. Avoiding padding is insufficient below the crossover, while at M = 128K BMM takes 28.9% longer, more than its 25% of padded work. The common mid-to-large-model operating range of 16K–96K routed rows per rank, shaded in the figure, lies entirely above the crossover. Smaller models use narrower expert projections and often place more rows on each rank, so their crossover must be measured separately; Appendix Figure 71 repeats the experiment with $d = h = 2 0 4 8$ representative of that regime, and extends the routed-row sweep to 256K.

**交叉点在每个 expert 几百行.** 在一张 B300 上, 取 16 个本地 expert, $d = h = 4096$, 图 38 把一次 BF16 按精确行数执行的 grouped expert 投影, 和每个 expert 1.25 倍容量的 BMM 做对比, 总路由行数 $M$ 从 64 扫到 128K. BMM 在每个点都多执行 25% 的行, 但直到 $M = 4\mathrm{K}$, 它的规则 kernel 都更快. 交叉点在 $M = 4\mathrm{K}$ 到 $M = 8\mathrm{K}$ 之间, 对应每个 expert 256 到 512 行; 在它之上的每个测点 grouped GEMM 都更快, 只是领先幅度随形状变化. 交叉点以下, 光省掉 padding 不够; 到 $M = 128\mathrm{K}$, BMM 多花 28.9% 的时间, 超过它 25% 的 padding 工作量. 图中阴影标出的 16K 到 96K 每 rank 路由行数, 是中大模型的常见工作区间, 整段都在交叉点之上. 小模型的 expert 投影更窄, 每个 rank 上的行往往更多, 交叉点要另测; 附录图 71 用代表这一区间的 $d = h = 2048$ 重做了实验, 并把路由行数扫到 256K.

![Image block](images/p65-chart.jpg)

![Image block](images/p65-figure-38-grouped-gemm-and-capacity-padded-bmm-across.jpg)

> 图注: figure 38 grouped gemm and capacity padded bmm across.

Total routed rows across 16 local experts (M)

Figure 38 Grouped GEMM and capacity-padded BMM across routed-row counts. Grouped GEMM is faster throughout the shaded mid-to-large-model range. The experiment isolates one BF16 square expert projection on one B300 with $N _ { \mathrm { l o c a l } } = 1 6$ and $d = h = 4 0 9 6$ The horizontal axis is total routed rows across the 16 local experts; routed rows count expert rows, not unique input tokens, since each token contributes one row to each of its top-K experts, and balanced routing gives $M / 1 6$ valid rows per expert. The green band marks the representative 16K–96K rank-local operating range. Its endpoints summarize variation in microbatch and routing choices rather than one fixed microbatch size, sequence length, top-K, or local-expert count; Appendix Table 42 gives concrete configurations. BMM reserves exactly 1.25× capacity per expert, while grouped GEMM executes only valid rows. Left: useful throughput counts only valid-row FLOPs. Right: values above one indicate that grouped GEMM is faster. Each point is the mean of 20 queued CUDA-event samples after 10 warm-ups; all timed operations are submitted behind one device-side gate and released only after the host has queued the complete batch, so small shapes are not dominated by Python launch gaps.

**The cost of decomposing one projection.** To isolate decomposition, we begin with one BF16 weight $W _ { \mathrm { d e n s e } } \in \mathbb { R } ^ { 8 1 9 2 \times 8 1 9 2 0 }$ and partition its output columns into $N \in \{ 4 , 8 \}$ expert matrices. For $X \in \mathbb { R } ^ { T \times 8 1 9 2 ^ { \vec { 1 } } }$

**拆分一个投影的代价.** 为了单独看拆分的影响, 我们从一个 BF16 权重 $W_{\mathrm{dense}} \in \mathbb{R}^{8192 \times 81920}$ 出发, 把它的输出列切成 $N \in \{4, 8\}$ 个 expert 矩阵. 对 $X \in \mathbb{R}^{T \times 8192}$,

$$
W _ {\text {dense}} = [ W _ {1} W _ {2} \dots W _ {N} ], \qquad X W _ {\text {dense}} = [ X W _ {1} X W _ {2} \dots X W _ {N} ].\tag{17}
$$

All three layouts therefore execute the same $2 T \times 8 1 9 2 \times 8 1 9 2 0$ useful $\mathrm { F L O P s } ,$ contain the same BF16 weight elements, and produce the same output elements from the exact same BF16 values. The eight-expert case isolates the cost of dividing the same projection into more, narrower GEMMs, including the additional input reads. It is a projection benchmark, not a complete dense-versus-MoE model comparison.<sup>11</sup> Splitting a microbatch into waves (Section 5.9) reduces T and lowers GEMM efficiency further, one ingredient of the wave-scheduling result in Section 15.2. The compared paths also use the same seeded operand distribution, since operand values affect throughput (Section 19).

所以三种布局执行的有效 FLOPs 都是 $2T \times 8192 \times 81920$, 权重元素一样, 输出元素也由完全相同的 BF16 值算出. 8 expert 的情形单独衡量把同一投影切成更多, 更窄的 GEMM 的代价, 其中包括多出来的输入读取. 这是投影级的基准, 不是完整的 dense 对 MoE 的模型对比.<sup>11</sup> 把微批切成多个 wave (5.9 节) 会减小 $T$, GEMM 效率随之再降, 这是 15.2 节 wave 调度结果的成因之一. 各条对比路径还用同一个随机种子生成操作数分布, 因为操作数的取值本身会影响吞吐 (第 19 节).

11<sub>To</sub> ground T: in a balanced EP32, top-4, 128-expert configuration, each rank contributes T input tokens and holds four experts, so each local expert receives T rows. The eight-expert curve is a controlled partition of the same projection, not a second end-to-end routing configuration.

<sup>11</sup> 给 $T$ 一个具体参照: 在均衡的 EP32, top-4, 128 expert 配置里, 每个 rank 贡献 $T$ 个输入 token, 持有 4 个 expert, 所以每个本地 expert 收到 $T$ 行. 8 expert 曲线是对同一投影的受控切分, 不代表另一种端到端路由配置.

<!-- page 66 of 168 -->

Figure 39 shows the absolute useful throughput of Equation 17. At very small T, decomposing the projection is expensive: both grouped layouts deliver only about 60% of dense throughput through $T   =   1 2 8$ Both improve sharply at $T = 2 5 6$ , reaching about 96%, and remain at 94–96% through $T = 4 0 9 6 .$ Doubling the number of expert GEMMs while halving their width changes throughput only slightly in this experiment. The larger gap is between either grouped layout and the single dense projection. At still larger T, both grouped layouts drift to 83–88% of dense across $T = 8 1 9 2 – 6 5 { , } 5 3 6$ , settling at 32K and 64K in the power-limited regime examined below.

图 39 给出式 (17) 的绝对有效吞吐. $T$ 很小时拆分代价很高: 到 $T = 128$ 为止, 两种分组布局都只有 dense 吞吐的 60% 左右. 到 $T = 256$ 两者都明显回升, 达到约 96%, 并在 $T = 4096$ 之前保持在 94% 到 96%. 在这组实验里, expert GEMM 数量翻倍, 宽度减半, 对吞吐影响很小. 更大的差距在任一分组布局和单个 dense 投影之间. $T$ 再往上, 在 $T = 8192$ 到 $65{,}536$ 区间两种分组布局都滑到 dense 的 83% 到 88%, 32K 和 64K 时稳定在下文分析的功耗受限区.

![Image block](images/p66-figure-39-splitting-one-projection-into-four-or-eight.jpg)

Figure 39 Splitting one projection into four or eight expert GEMMs. The four-expert path executes four [T, 8192] @ [8192, 20480] GEMMs; the eight-expert path executes eight [T, 8192] @ [8192, 10240] GEMMs. Both are exact partitions of the same [T, 8192] @ [8192, 81920] dense projection and therefore match its useful FLOPs, weights, and outputs. Grouped inputs repeat the dense input four or eight times. Curves show means across eight paired trials, one on each of eight B300 $\operatorname { G P U s } ,$ and light bands show the full eight-GPU ranges; each GPU measures the dense control with both grouped partitions, and its two dense measurements are averaged before the dense curve is summarized. The horizontal axis is logarithmic through $T = 4 0 9 6$ and linear thereafter; the dashed divider marks the scale change, and no values are omitted. The final two points, $T = 3 2 { , } 7 6 8$ and 65,536, are oversized diagnostics rather than representative training shapes. Only the projection is timed; Appendix A.11 records the complete timing protocol and representative ratios.

**Very large grouped GEMMs run at a power-limited clock.** The large-shape decline motivates a separate stress diagnostic extending to 32K rows per local expert. Its largest shapes are deliberately oversized diagnostics rather than representative training points. Across that range, grouped GEMM throughput declines together with the SM clock while useful throughput per MHz stays nearly constant. Nsight timelines show the same CUTLASS grouped-GEMM kernel template at $M _ { e }   =   2 \mathrm { K }$ and 32K, and the software power-cap limiter is active in effectively every telemetry sample near the board limit. The equal-FLOP dense control holds nearly flat throughput at a higher clock. Together, these observations indicate a lower power-limited operating point rather than a kernel-selection change or a collapse in per-clock efficiency.

**很大的 grouped GEMM 在功耗限频下运行.** 大形状下的下降促使我们另做一项压力诊断, 一直扫到每个本地 expert 32K 行. 其中最大的几个形状是有意放大的诊断点, 不代表训练形状. 在这段范围内, grouped GEMM 的吞吐和 SM 时钟一起下降, 而每 MHz 的有效吞吐几乎不变. Nsight 时间线显示, $M_e = 2\mathrm{K}$ 和 32K 时用的是同一个 CUTLASS grouped GEMM kernel 模板, 并且在接近板卡上限时, 几乎每个遥测样本里软件功耗上限限制器都处于激活状态. FLOP 相同的 dense 对照则在更高的时钟下保持近乎平坦的吞吐. 这些观察合起来说明: 下降来自更低的功耗受限工作点, 不是 kernel 选择变了, 也不是每时钟效率崩了.

Clocks and power help interpret the extreme-shape decline; operand values also affect throughput (Section 19). Appendix A.12 records the diagnostic protocol and complete curves.

时钟和功耗可以解释极端形状下的下降; 操作数取值同样会影响吞吐 (第 19 节). 诊断流程和完整曲线见附录 A.12.

**Sensitivity to the load histogram.** Even with total rows and arithmetic fixed, the shape of the expert-load histogram changes grouped GEMM time. Let $M _ { e }$ be the rows assigned to local expert $\textstyle e ,   M = \sum _ { e } M _ { e }$ , and $p _ { e } = M _ { e } / M$ . We summarize concentration with the normalized entropy deficit

**对负载直方图的敏感度.** 即使总行数和计算量都固定, expert 负载直方图的形状也会改变 grouped GEMM 的耗时. 记 $M_e$ 为分给本地 expert $e$ 的行数, $M = \sum_e M_e$, $p_e = M_e / M$. 我们用归一化熵亏来概括集中程度

<!-- page 67 of 168 -->

$$
I _ {H} := 1 - \frac {H (\boldsymbol {p})}{\log N _ {\text {local}}} = 1 + \frac {\sum_ {e} p _ {e} \log p _ {e}}{\log N _ {\text {local}}}.\tag{18}
$$

$I _ { H }   =   0$ denotes uniform load and $I _ { H }$ approaches one as the routes concentrate on one expert. Unlike a maximum-to-mean ratio, this metric uses every expert count.

$I_H = 0$ 表示负载均匀, 路由越集中到一个 expert 上, $I_H$ 越接近 1. 和最大值除以均值不同, 这个指标用到了每个 expert 的计数.

Figure 40 evaluates 100 distinct load histograms spanning the entropy range. Across these fixed-work cases, entropy-defined imbalance has a Spearman correlation of −0.86 with grouped GEMM throughput; a histogram-level bootstrap gives a 95% interval of $[ - 0 . 9 0 , - 0 . 8 0 ]$ . The median normalized throughput falls from approximately 96% in the least-concentrated entropy range to 89% in the most-concentrated range. Individual points are not monotonic: histograms with similar entropy can still present different ordered collections of matrix problems to the kernel. The result supports the systems-level trend—greater route concentration usually lowers grouped GEMM throughput at fixed arithmetic—not the stronger claim that entropy alone determines execution time. Appendix Figure 72 gives a complementary example in which two histograms share the same maximum load but have different throughput.

图 40 测了覆盖整个熵范围的 100 个不同负载直方图. 在这些工作量固定的样本上, 按熵定义的不均衡度和 grouped GEMM 吞吐的 Spearman 相关系数是 −0.86; 按直方图做 bootstrap, 95% 区间是 $[-0.90, -0.80]$. 归一化吞吐的中位数从最不集中的熵区间的约 96%, 降到最集中区间的 89%. 单个点并不单调: 熵相近的直方图交给 kernel 的仍可能是顺序不同的一组矩阵问题. 结果支持的是系统层面的趋势, 即计算量固定时路由越集中, grouped GEMM 吞吐通常越低; 它不支持「熵单独决定执行时间」这种更强的说法. 附录图 72 给了一个补充例子: 两个直方图的最大负载相同, 吞吐却不同.

![Image block](images/p67-figure-40-grouped-gemm-throughput-generally-falls-as-expert.jpg)

Figure 40 Grouped GEMM throughput generally falls as expert loads concentrate. The experiment isolates one BF16 square expert projection on one B300 with $N _ { \mathrm { l o c a l } } = 1 6 ,   M = 6 5 { , } 5 3 6$ routed rows, and $d = h = 4 0 9 6$ . We draw symmetric-Dirichlet proposals, convert them to exact eight-row-aligned counts with at least one tile per expert, and select ten distinct histograms from each of ten equal-width $I _ { H }$ ranges. Every dot therefore has the same total rows, operands, dimensions, and useful FLOPs. Each dot averages four fixed expert-index permutations in each of three fresh processes. Each of those 12 conditions averages 20 queued CUDA-event samples after 10 warm-ups; execution order is randomized and balanced controls bracket every ten cases. The magenta curve connects the median of each ten-histogram range. The correlation and bootstrap interval are computed over the 100 histogram means. This kernel-only test excludes dispatch, communication, and cross-rank waiting.

**Section takeaway.** Grouped GEMM executes route-dependent expert shapes without turning reserved capacity into matrix-multiply work; the rowwise layout feeds it directly from fixed-shape buffers, and device offsets restrict computation to real routes. In our B300 sweep, grouped GEMM becomes faster than capacitypadded BMM once enough rows reach each expert. BMM’s regular kernels are faster below the crossover, and concentrated expert loads still reduce throughput above it. Even at exactly matched FLOPs, decomposing one dense GEMM into expert-sized problems changes efficiency, most at very small shapes and again in the power-limited large-shape regime.

**本节要点.** grouped GEMM 按路由决定的 expert 形状执行, 不会把预留容量变成矩阵乘计算; rowwise 布局从固定形状的 buffer 直接喂数据, device offset 把计算限定在真实路由上. 在我们的 B300 扫描里, 每个 expert 拿到的行数足够多以后, grouped GEMM 就比按容量 pad 的 BMM 快. 交叉点以下 BMM 的规则 kernel 更快; 交叉点以上, expert 负载集中仍会降低吞吐. 即便 FLOP 完全对齐, 把一个 dense GEMM 拆成 expert 大小的子问题也会改变效率, 影响最大的是极小形状, 其次是功耗受限的大形状区.

<!-- page 68 of 168 -->

## 10 Routing, Capacity, and Load Balancing · 路由, 容量与负载均衡

**A routing decision is both a model choice and a distributed-work request.** For each token, the router produces soft scores and selects K experts, creating K requested routes. Capacity then determines which requests are kept. Dispatch moves the kept rows to the expert-owning ranks; on the rowwise real-count path, grouped GEMM executes their densely packed expert segments, and combine returns their weighted contributions. Requested and kept routes coincide when no route is dropped, but they are different objects whenever capacity overflows.

**一次路由决策既是模型上的选择, 也是一份分布式工作请求.** 对每个 token, router 给出 soft 分数并选出 $K$ 个 expert, 产生 $K$ 条请求路由. 然后由容量决定哪些请求被保留. dispatch 把保留下来的行送到持有对应 expert 的 rank; 在 rowwise 真实计数路径上, grouped GEMM 执行这些紧密排列的 expert 段, combine 再把它们的加权贡献送回. 没有路由被丢时, 请求路由和保留路由是同一批; 一旦容量溢出, 两者就是不同的对象.

Load-balancing mechanisms influence future requests, while capacity limits how many of the current requests are admitted. The resulting workload has both an expert-level shape and a destination-rank total. The former controls expert training signal and grouped GEMM geometry, while the latter controls communication, buffer use, overflow, and straggling. After establishing those systems consequences, we compare the scopes and mechanisms used to balance routes and then analyze a failure of the standard Switch-style auxiliary objective (Fedus et al., 2022): its scalar can fall while requested routing becomes less balanced.

负载均衡机制影响的是未来的请求, 容量限制的是当前请求能放进来多少. 最后形成的工作负载既有 expert 层面的形状, 也有每个目标 rank 的总量. 前者决定 expert 的训练信号和 grouped GEMM 的几何形状, 后者决定通信, buffer 占用, 溢出和拖尾. 先讲清这些系统后果, 再比较均衡路由时用的统计范围和机制, 最后分析标准 Switch 式辅助目标 (Fedus et al., 2022) 的一种失效: 它的标量值下降的同时, 请求路由反而更不均衡.

## Requested Routes and Kept Routes · 请求路由与保留路由

The current **load-balancing loss (LBL)** and post-batch bias controller (Section 10.6) use requested top-K assignments. Capacity and dispatch use kept assignments, and the rowwise path also uses their real counts for grouped GEMM. When routes are dropped, neither histogram is a substitute for the other.

当前的 **负载均衡损失 (LBL)** 和 batch 后的偏置控制器 (10.6 节) 用的是请求的 top-K 分配. 容量和 dispatch 用的是保留下来的分配, rowwise 路径还用它们的真实计数驱动 grouped GEMM. 有路由被丢时, 两份直方图谁也替代不了谁.

## 10.1 From Top-K Selection to the Executed Workload · 从 top-K 选择到实际执行的工作量

Consider one routed layer with N global experts and $M _ { E }$ expert-parallel ranks. Let source rank s hold $T _ { s }$ tokens, and let $S _ { s , t }$ be the K experts selected for token t. One pair (t, i) with $i \in S _ { s , t }$ is a **route**. The number of routes requested from source rank s to expert i is

考虑一个路由层, 共 $N$ 个全局 expert, $M_E$ 个 expert 并行 rank. 源 rank $s$ 持有 $T_s$ 个 token, $S_{s,t}$ 是 token $t$ 选中的 $K$ 个 expert. 满足 $i \in S_{s,t}$ 的一对 $(t, i)$ 称为一条 **路由**. 源 rank $s$ 向 expert $i$ 请求的路由数是

$$
C _ {s, i} ^ {\mathrm{req}} := \sum_ {t = 1} ^ {T _ {s}} \mathbf {1} \{i \in S _ {s, t} \}, \quad \sum_ {i = 1} ^ {N} C _ {s, i} ^ {\mathrm{req}} = K T _ {s}.\tag{19}
$$

Aggregate over sources to obtain the global requested count $\begin{array} { r } { C _ { i } ^ { \mathrm { r e q } } : = \sum _ { s } C _ { s , i } ^ { \mathrm { r e q } } } \end{array}$ . If $\rho ( i )$ is the expert-parallel rank that owns expert $i ,$ the total demand placed on destination rank q is

对所有源求和, 得到全局请求计数 $C_i^{\mathrm{req}} := \sum_s C_{s,i}^{\mathrm{req}}$. 若 $\rho(i)$ 是持有 expert $i$ 的 expert 并行 rank, 压到目标 rank $q$ 上的总需求为

$$
R _ {q} ^ {\mathrm{req}} := \sum_ {i: \rho (i) = q} C _ {i} ^ {\mathrm{req}}.\tag{20}
$$

Thus the same top-K decisions define two workload distributions: counts over experts and sums over the experts colocated on each destination rank.

同一组 top-K 决策因此定义了两种工作量分布: 按 expert 的计数, 以及按目标 rank 把同处一 rank 的 expert 计数相加.

Capacity acts between requested routes and execution. Let $C _ { s , i } ^ { \mathrm { k e e p } }$ be the routes admitted by the capacity policy and define

容量作用在请求路由和执行之间. 记 $C_{s,i}^{\mathrm{keep}}$ 为容量策略放行的路由数, 定义

$$
\begin{array}{c} D _ {s, i} := C _ {s, i} ^ {\mathrm{req}} - C _ {s, i} ^ {\mathrm{keep}}, \quad C _ {i} ^ {\mathrm{keep}} := \sum_ {s} C _ {s, i} ^ {\mathrm{keep}}, \\ D _ {i} := C _ {i} ^ {\mathrm{req}} - C _ {i} ^ {\mathrm{keep}}, \qquad M _ {i} := C _ {i} ^ {\mathrm{keep}}, \qquad R _ {q} ^ {\mathrm{keep}} := \sum_ {i: \rho (i) = q} C _ {i} ^ {\mathrm{keep}}. \end{array}\tag{21}
$$

Here $D _ { s , i }$ and $D _ { i }$ count source-specific and aggregate dropped routes, $M _ { i }$ is the row count actually presented to expert i (the per-expert row count of Section 9; its subscript is an expert index, not the rank count $M _ { E } )$ and $R _ { q } ^ { \mathrm { k e e p } }$ is the actual receive and compute load on rank q. Write $C ^ { x } = ( C _ { 1 } ^ { x } , \ldots , C _ { N } ^ { x } )$ for $x \in \{ \mathrm { r e q } , \mathrm { k e e p } \}$ In a no-drop step, $C _ { s , i } ^ { \mathrm { k e e p } } = C _ { s , i } ^ { \mathrm { r e q } }$ ; otherwise the distinction is essential. A kept histogram can appear benign only because excess demand was dropped, while a requested histogram alone does not describe the work that ran. Table 16 records which part of the training system produces and consumes each routing quantity.

其中 $D_{s,i}$ 和 $D_i$ 分别是按源区分的丢弃路由数和汇总后的丢弃路由数; $M_i$ 是实际交给 expert $i$ 的行数 (即第 9 节的每 expert 行数; 下标是 expert 编号, 不是 rank 数 $M_E$); $R_q^{\mathrm{keep}}$ 是 rank $q$ 上实际的接收和计算负载. 对 $x \in \{\mathrm{req}, \mathrm{keep}\}$, 记 $C^x = (C_1^x, \ldots, C_N^x)$. 不丢路由的 step 里 $C_{s,i}^{\mathrm{keep}} = C_{s,i}^{\mathrm{req}}$; 否则必须区分两者. 保留直方图看起来温和, 可能只是因为多出来的需求被丢掉了; 而只看请求直方图, 又描述不了实际跑了多少活. 表 16 列出训练系统里每个路由量由谁产生, 由谁使用.

Olmo uses **token-choice routing**: every token selects experts (Shazeer et al., 2017). BASE Layers instead solves a balanced assignment, and Expert Choice lets each expert select tokens; these alternatives change

<!-- page 69 of 168 -->

| Quantity | Created by | Consumed by |
| --- | --- | --- |
| Router score or logit | Router projection and gating function | The configured score or logit drives top-K; selected unbiased affinities or logits determine mixture weights; normalized all-expert scores form LBL's differentiable term |
| Requested count $C^{req}$ | Top-K expert identifiers | LBL's detached hard term, post-batch bias feedback, and capacity admission; on the rowwise path, all-gathered requested splits form the keep matrix that determines dispatch destination ranks and row offsets |
| Kept count $C^{keep}$ | Capacity keep/drop policy | Dispatch and combine payload; expert grouped GEMM row counts on real-count paths; and executed-work diagnostics |

which side of the token–expert relation imposes the constraint (Lewis et al., 2021; Zhou et al., 2022). The remainder of this section concerns Olmo’s token-choice path.

Olmo 用 **token-choice 路由**: 每个 token 自己挑 expert (Shazeer et al., 2017). BASE Layers 改为求解一个均衡分配, Expert Choice 让每个 expert 挑 token; 这些做法改变的是由 token 和 expert 中的哪一方施加约束 (Lewis et al., 2021; Zhou et al., 2022). 本节其余部分只讨论 Olmo 的 token-choice 路径.

## 10.2 The Costs of Imbalance Depend on Where It Appears · 不均衡的代价取决于它出现在哪一层

For any nonzero load vector $\pmb { x } \in \mathbb { R } _ { \geq 0 } ^ { n }$ with $n > 1$ , define its **max/mean imbalance** as

对任意非零负载向量 $\boldsymbol{x} \in \mathbb{R}_{\geq 0}^n$, $n > 1$, 定义它的 **max/mean 不均衡度** 为

$$
I _ {\max} (\boldsymbol {x}) := \frac {\max _ {j} x _ {j}}{\frac {1}{n} \sum_ {j} x _ {j}} = n \frac {\| \boldsymbol {x} \| _ {\infty}}{\| \boldsymbol {x} \| _ {1}}.\tag{22}
$$

Applying this definition to requested expert counts, kept expert counts, requested destination-rank totals, and kept destination-rank totals answers four different questions (Table 17). The expert-level pair describes selection and executed expert shapes; the rank-level pair describes demand and admitted work at the rank that can become a straggler.

把这个定义分别用在请求的 expert 计数, 保留的 expert 计数, 请求的目标 rank 总量, 保留的目标 rank 总量上, 回答的是四个不同的问题 (表 17). expert 层的一对描述选择情况和实际执行的 expert 形状; rank 层的一对描述可能拖后腿的那个 rank 上的需求和放行的工作量.

| Counts | Over experts | Over destination ranks |
| --- | --- | --- |
| Requested | Selection concentration: the training signal the router asks for | Demand on the hottest rank: capacity pressure and drop risk |
| Kept | Executed expert shapes presented to grouped GEMM | Admitted receive, compute, and combine load on the rank that can straggle |

Max/mean identifies the hottest coordinate but does not describe how the remaining load is distributed. Let $\textstyle \pi _ { j }   =   x _ { j } / \sum _ { \ell } x _ { \ell }$ be the normalized load distribution and $\begin{array} { r } { H ( \pi )   =   - \sum _ { j } \pi _ { j } \log \pi _ { j } } \end{array}$ its entropy. The number of never-selected experts, coefficient of variation, and normalized entropy deficit $I _ { H } ( { \pmb x } )   =   1 - H ( { \pmb \pi } ) /$ log n capture complementary aspects of concentration. The source–destination request matrix contains more communication information than its row or column sums: it resolves which source rank sends how many rows to which destination rank, the per-pair traffic that row and column totals average away. Drop rate and receiving-buffer utilization then show how capacity transformed demand into executed work.

max/mean 能找出最热的那个坐标, 但说明不了其余负载怎么分布. 记 $\pi_j = x_j / \sum_\ell x_\ell$ 为归一化负载分布, $H(\boldsymbol{\pi}) = -\sum_j \pi_j \log \pi_j$ 为它的熵. 从未被选中的 expert 数, 变异系数, 归一化熵亏 $I_H(\boldsymbol{x}) = 1 - H(\boldsymbol{\pi}) / \log n$, 各自刻画集中程度的一个侧面. 源到目标的请求矩阵比它的行和或列和带有更多通信信息: 它能分辨哪个源 rank 向哪个目标 rank 发了多少行, 而行列总量会把这种逐对流量平均掉. 丢弃率和接收 buffer 利用率则反映容量如何把需求变成实际执行的工作.

The **model-side** selection pattern starts with requested expert counts, but routed-expert activations and gradients follow kept counts. An expert can be requested yet receive no signal from a dropped route. At the other extreme, requiring every small or domain-homogeneous microbatch to be uniform can oppose useful specialization. The desirable distribution is therefore scope-dependent: avoiding starvation over the training population does not require every local microbatch to look uniform (Qiu et al., 2025).

**模型侧** 的选择模式从请求的 expert 计数开始, 但路由 expert 的激活和梯度跟着保留计数走. 一个 expert 可能被请求了, 却因为路由被丢而收不到信号. 另一个极端是要求每个小的或领域单一的微批都均匀, 这可能和有用的专门化相冲突. 所以理想的分布取决于统计范围: 在整个训练数据上不让 expert 饿死, 并不要求每个局部微批看起来都均匀 (Qiu et al., 2025).

The **systems-side** effect starts with kept counts. Even at a fixed rank total, concentrating rows into fewer experts changes the shapes presented to grouped GEMM. Section 9 measured this directly: as the expert-load histogram concentrated, normalized grouped-GEMM throughput declined with entropy deficit, and median throughput in the most-concentrated entropy range ran about seven points below the least concentrated

<!-- page 70 of 168 -->

(Figure 40). A matched appendix comparison further shows that a single-spike and a three-hot-expert histogram with the same maximum load can have different grouped-GEMM times (Figure 72). These fixed-work microbenchmarks isolate local expert computation; they do not include dispatch, cross-rank waiting, or a learned-router trajectory.

**系统侧** 的影响从保留计数开始. 即便 rank 总量固定, 把行集中到更少的 expert 上也会改变交给 grouped GEMM 的形状. 第 9 节直接测过: expert 负载直方图越集中, 归一化 grouped GEMM 吞吐随熵亏下降, 最集中熵区间的吞吐中位数比最不集中的低约 7 个点 (图 40). 附录里的一组配对对比还表明, 最大负载相同的单尖峰直方图和三个热 expert 的直方图, grouped GEMM 耗时也可能不同 (图 72). 这些工作量固定的微基准只隔离了本地 expert 计算, 不包括 dispatch, 跨 rank 等待, 也不包括学出来的 router 的轨迹.

**Destination-rank imbalance** adds those omitted costs. A rank with high $R _ { q } ^ { \mathrm { r e q } }$ consumes capacity faster and is more likely to drop routes. A rank with high $R _ { q } ^ { \mathrm { k e e p } }$ receives more rows, performs more expert work, returns more outputs, and can delay peers or a pipeline stage. Expert-level and rank-level imbalance can also move independently: a rank may receive a balanced total that is concentrated in one of its local experts, or several moderately hot local experts may make the whole rank a straggler, so diagnostics need both levels.

**目标 rank 不均衡** 补上了这些没算进去的代价. $R_q^{\mathrm{req}}$ 高的 rank 更快用完容量, 更容易丢路由. $R_q^{\mathrm{keep}}$ 高的 rank 收到更多行, 做更多 expert 计算, 回传更多输出, 可能拖慢同组的其他 rank 或一个流水线 stage. expert 层和 rank 层的不均衡还可以各自变化: 一个 rank 收到的总量可能是均衡的, 却全集中在它的一个本地 expert 上; 也可能几个中等偏热的本地 expert 合起来让整个 rank 成了拖尾. 所以诊断要两层都看.

## 10.3 Rank-Wide Capacity Bounds Work Without Balancing It · rank 级容量限住工作量, 但不让它均衡

Let $T _ { \mathrm { r o u t e } } = K T _ { s }$ be the number of routes produced by one source expert-parallel rank. When source ranks hold equal token counts and each destination owns the same number of experts, balanced expert routing places an average of $T _ { \mathrm { r o u t e } }$ requested rows on each destination rank: the factor $M _ { E }$ from all sources cancels the probability $1 / M _ { E }$ of choosing any one destination. Olmo’s rowwise sync-free path reserves the destinationrank budget

记 $T_{\mathrm{route}} = K T_s$ 为一个源 expert 并行 rank 产生的路由数. 当各源 rank 的 token 数相同, 每个目标 rank 持有的 expert 数也相同时, 均衡的 expert 路由平均在每个目标 rank 上放 $T_{\mathrm{route}}$ 条请求行: 来自所有源的因子 $M_E$ 和选中某一个目标的概率 $1/M_E$ 相互抵消. Olmo 的 rowwise 无同步路径为每个目标 rank 预留预算

$$
C _ {\text {rank}} := \max (1, \lceil c T _ {\text {route}} \rceil),\tag{23}
$$

where $c$ is the capacity factor. This is **one shared limit for all experts owned by the destination rank**, not one independent limit per local expert. If the rank owns $N _ { \mathrm { l o c a l } }$ experts, its balanced per-expert mean is $T _ { \mathrm { r o u t e } } / N _ { \mathrm { l o c a l } }$ . The rank budget alone can therefore fit one expert at approximately

其中 $c$ 是容量因子. 这是 **目标 rank 上所有 expert 共用的一个上限**, 不是每个本地 expert 各一个独立上限. 若该 rank 持有 $N_{\mathrm{local}}$ 个 expert, 均衡时每个 expert 的平均负载是 $T_{\mathrm{route}} / N_{\mathrm{local}}$. 所以只看 rank 预算, 单个 expert 最多能装下约

$$
\frac {C _ {\mathrm{rank}}}{T _ {\mathrm{route}} / N _ {\mathrm{local}}} \approx c N _ {\mathrm{local}},\tag{24}
$$

times that mean if its neighbors are sufficiently cool. This is a bound on what can fit, not evidence that a trained router reaches it.

倍于均值的行, 前提是同 rank 的其他 expert 足够冷. 这是能装下多少的上界, 不说明训练出来的 router 会走到这一步.

The shared budget lets a hot local expert use capacity left unused by cooler local experts while the aggregate admitted demand remains within $C _ { \mathrm { r a n k } }$ . A conventional independent expert capacity instead assigns each of the $N _ { \mathrm { l o c a l } }$ experts a limit near

共用预算让热的本地 expert 可以用掉冷 expert 没用完的容量, 只要放行的总需求不超过 $C_{\mathrm{rank}}$. 传统的独立 expert 容量则给 $N_{\mathrm{local}}$ 个 expert 每个分一个约为

$$
C _ {\mathrm{expert}} \approx \left\lceil \frac {c T _ {\mathrm{route}}}{N _ {\mathrm{local}}} \right\rceil .\tag{25}
$$

At approximately the same aggregate reserved rows, that policy can drop routes to one hot expert while neighboring experts leave their allocations unused (Lepikhin et al., 2021; Fedus et al., 2022). The rank-wide rule trades an individual expert bound for flexible sharing within a destination-rank bound.

的上限. 预留总行数大致相同时, 这种策略可能丢掉发往某个热 expert 的路由, 同时旁边的 expert 还有份额闲着 (Lepikhin et al., 2021; Fedus et al., 2022). rank 级规则放弃了单个 expert 的上界, 换来目标 rank 上限之内的灵活共享.

Reserved capacity and executed rows are also distinct. Olmo’s rowwise NVSHMEM path allocates capacityshaped receive and combine buffers but packs valid rows densely at the front. If the kept local-expert counts are $( M _ { 1 } , \ldots , M _ { N _ { \operatorname { l o c a l } } } )$ , the grouped-GEMM offsets are

预留容量和实际执行的行也是两回事. Olmo 的 rowwise NVSHMEM 路径按容量分配接收 buffer 和 combine buffer, 但把有效行紧密排在前面. 若本地 expert 的保留计数是 $(M_1, \ldots, M_{N_{\mathrm{local}}})$, grouped GEMM 的 offset 为

$$
o _ {j} := \sum_ {i = 1} ^ {j} M _ {i}, \qquad j = 1, \dots , N _ {\text {local}}.\tag{26}
$$

Only $[ 0 , o _ { N _ { \mathrm { l o c a l } } } )$ belongs to expert compute. Unused capacity rows lie outside every expert interval and may contain stale values. On this path, communication uses fixed capacity but grouped GEMM processes no padding rows: the device-side real-count offsets described in Sections 8 and 9 separate physical allocation from logical work. Other dispatch paths may instead pass capacity-padded splits to expert compute.

只有 $[0, o_{N_{\mathrm{local}}})$ 属于 expert 计算. 没用到的容量行不在任何 expert 区间里, 里面可能是旧值. 在这条路径上, 通信用固定容量, grouped GEMM 却不处理任何 padding 行: 第 8, 9 节讲的 device 端真实计数 offset 把物理分配和逻辑工作分开了. 其他 dispatch 路径则可能把按容量 pad 过的 split 交给 expert 计算.

On every capacity-enabled sync-free forward, all expert-parallel ranks all-gather their requested split counts and independently derive the same deterministic **keep matrix**. For each destination, the current policy flattens counts in local-expert-major, then source-rank order, cumulatively admits routes until it reaches $C _ { \mathrm { r a n k } }$ , and keeps a prefix within each source/expert split. Restoration and combine mask the tail-dropped routes. This makes overflow bounded and reproducible, but the ordering can affect which routes survive; a capacity evaluation should therefore report the distribution of drops, not only their total.

每次开了容量的无同步前向里, 所有 expert 并行 rank 先 all-gather 各自请求的 split 计数, 再各自独立推出同一个确定性的 **keep 矩阵**. 对每个目标 rank, 当前策略按「本地 expert 为主序, 源 rank 为次序」把计数展平, 累加放行路由直到达到 $C_{\mathrm{rank}}$, 每个 (源, expert) split 内部保留一段前缀. 还原和 combine 时把尾部丢掉的路由 mask 掉. 这样溢出量有界, 结果可复现, 但排序会影响哪些路由留下来; 所以评估容量时应该报告丢弃的分布, 不能只报总数.

> 答: 是. 代码 `nn/moe/v2/ep_no_sync_common.py` 里, 对每个目标 rank 把 `global_requested` 按 `permute(2, 0, 1)` 展平成 (本地 expert, 源 rank) 的顺序, 做 `cumsum` 后 `clamp(max=rank_capacity)`, 差分得到每段放行数. 所以一旦溢出, 先被截掉的总是编号最大的本地 expert, 其次是编号大的源 rank; 编号 0 的本地 expert 只要自己的请求不超过整个预算, 就永远不会丢. 被丢的路由集中在固定的几个 expert 上, 这些 expert 的梯度信号因此系统性偏少, 和 10.2 节「expert 被请求却收不到信号」是同一件事, 只是落点由编号决定, 不由负载决定. 式 (29) 只比较丢弃总数, 没涉及这种分布; 报告这里要求「报告丢弃的分布」, 正是因为这个顺序. 报告的设计意图是近乎不丢 (下面的方框), 偏置只在罕见溢出时出现; 如果溢出频繁, 轮转起始 expert 之类的做法能消除偏置, 但报告和代码里都没有, 只是从已知数字推出的说法, 没有数据验证.

<!-- page 71 of 168 -->

The aggregate **route-drop fraction** is

汇总的 **路由丢弃率** 为

$$
\delta_ {\text {route}} := \frac {\sum_ {s , i} D _ {s , i}}{\sum_ {s , i} C _ {s , i} ^ {\text {req}}} = \frac {\sum_ {s , i} D _ {s , i}}{\sum_ {s} K T _ {s}}.\tag{27}
$$

For $K > 1$ , this is not the fraction of tokens that lose every routed contribution. A model-quality analysis should separately report tokens that lose at least one route, tokens that lose all K, and the selected mixture weight removed by dropping.

$K > 1$ 时, 它不等于丢掉全部路由贡献的 token 占比. 分析模型质量时, 应该分别报告至少丢了一条路由的 token, $K$ 条全丢的 token, 以及因丢弃而被去掉的已选混合权重.

## Capacity Bounds Admitted Work · 容量限的是放行的工作量

Capacity bounds the receive-buffer storage and the worst-case admitted rank work after an outlying routing event. It filters requests after selection; the bound itself provides no guarantee of balanced requested load. The intended regime is nearly dropless under the observed routing distribution: balancing keeps normal demand within the fixed budget, while capacity handles rare excursions. This is not an unconditional dropless guarantee.

容量限住的是接收 buffer 的存储, 以及出现离群路由时 rank 上最坏情况下放行的工作量. 它在选择之后过滤请求, 上界本身不保证请求负载均衡. 设计上希望在实际观察到的路由分布下近乎不丢: 均衡机制让正常需求留在固定预算之内, 容量处理罕见的越界. 这不是无条件的不丢保证.

## 10.4 A Shared Rank Budget Drops No More Routes than Matched Expert Budgets · 共用 rank 预算丢的路由不多于对齐的 expert 预算

Two capacity policies can reserve the same aggregate rows on a destination rank yet admit different subsets of a skewed request histogram. Figure 41 shows the mechanism on one four-expert example, and Table 18 compares the two allocation policies.

两种容量策略可以在目标 rank 上预留相同的总行数, 却从一份偏斜的请求直方图里放行不同的子集. 图 41 用一个四 expert 的例子展示这个机制, 表 18 比较两种分配策略.

![Image block](images/p71-figure-41-rank-wide-capacity-shares-a-destination-rank.jpg)

Figure 41 Rank-wide capacity shares a destination rank’s unused rows among its local experts. Both policies reserve six rows per destination rank for the same requested routes. (a) Independent three-row expert limits drop two $E _ { 0 }$ routes while $E_{1}  's$ two private rows sit unused. (b) One shared six-row budget admits every request; the dashed outline marks the two routes that only pooling admits. Rank 1’s balanced demand is identical under both policies. Each colored block is one requested route; a crossed block is dropped, and an empty block is a reserved, unused row. Conceptual illustration with no measured quantities.

At exactly matched aggregate rows, the drop advantage from pooling unused capacity is algebraic. Given a destination-rank total budget B and independent expert budgets $b _ { j }$ satisfying $\textstyle \sum _ { j } b _ { j } = B$ , the total drops for requested local-expert counts $C _ { j } ^ { \mathrm { r e q } }$ are

预留总行数严格相同时, 把闲置容量合起来带来的丢弃优势可以直接用代数证明. 给定目标 rank 的总预算 $B$, 以及满足 $\sum_j b_j = B$ 的独立 expert 预算 $b_j$, 对本地 expert 的请求计数 $C_j^{\mathrm{req}}$, 两种策略的总丢弃数为

$$
\begin{array}{c c} D ^ {\text {rank}} = \left[ \sum_ {j} C _ {j} ^ {\text {req}} - B \right] _ {+}, & \\ D ^ {\text {expert}} = \sum_ {j} \left[ C _ {j} ^ {\text {req}} - b _ {j} \right] _ {+}, & \end{array} \quad [ z ] _ {+} := \max (z, 0).\tag{28}
$$

<!-- page 72 of 168 -->

| Policy Allocation unit Uovneursfelodwcapacity and | Expert compute |
| --- | --- |
| Rows reserved by a cool expert | Padded BMM may execute capacity |
| Independent per One limit for each |  |
| cannot admit routes for a hot | rows; grouped GEMM can still use real |
| expert local expert |  |
| neighbor; overflow is expert-local | kept counts |
| Local experts draw from one | Olmo's rowwise path packs kept rows |
| One aggregate limit |  |
| budget; overflow begins only when | and uses real cumulative offsets; another |
| Shared rank-wide for the destination |  |
| their aggregate fills the rank | sync-free path can execute |
| rank |  |
| budget | capacity-padded splits |

Because $[ \textstyle \sum _ { j } z _ { j } ] _ { + } \leq \textstyle \sum _ { j } [ z _ { j } ] _ { + } ,$

因为 $[\sum_j z_j]_+ \leq \sum_j [z_j]_+$,

$$
D ^ {\mathrm{rank}} \leq D ^ {\mathrm{expert}}.\tag{29}
$$

A shared rank budget therefore **cannot drop more routes in total** than independent expert budgets with the same aggregate rows. The budgets must match after integer rounding; a shared nominal capacity factor alone need not give equal aggregate rows. The inequality is strict when a hot expert exceeds its private budget while a neighbor leaves rows unused. It does not prove a universally better training policy: rank-wide tail-drop may preserve a different set of tokens and deliberately gives up the stronger per-expert workload bound.

所以在总行数相同时, 共用 rank 预算 **丢弃的路由总数不会多于** 独立 expert 预算. 两边的预算要在取整之后相等; 仅仅名义容量因子相同, 总行数不一定相等. 当一个热 expert 超出自己的预算, 而旁边的 expert 还有空行时, 不等式严格成立. 这并不证明它在训练上处处更好: rank 级尾部丢弃保住的可能是另一批 token, 而且它有意放弃了更强的单 expert 工作量上界.

Per-expert capacity is the standard drop-and-pad formulation in GShard and Switch Transformer (Lepikhin et al., 2021; Fedus et al., 2022). Megatron-Core likewise documents both a per-expert capacity factor and, for the HybridEP and NCCL-EP backends of its flex token dispatcher, a per-expert-rank capacity factor (NVIDIA, 2026c). Comparisons therefore need to specify the capacity policy for the backend and revision being compared.

每 expert 容量是 GShard 和 Switch Transformer 里标准的「丢弃加 padding」写法 (Lepikhin et al., 2021; Fedus et al., 2022). Megatron-Core 的文档也同时列出每 expert 的容量因子, 以及 flex token dispatcher 在 HybridEP 和 NCCL-EP 后端下的每 expert rank 容量因子 (NVIDIA, 2026c). 所以做对比时, 要写明所比后端和版本用的是哪种容量策略.

Capacity reacts to overload after selection. Balancing instead changes future requested demand, beginning with the token scope over which that demand is measured.

容量在选择之后才对过载作出反应. 均衡机制改变的是未来的请求需求, 先从「在多大的 token 范围上统计需求」说起.

## 10.5 Load-Balancing Scope Is Part of the Training Objective · 负载均衡的统计范围是训练目标的一部分

The balance batch is the set of tokens used to construct the requested hard frequency vector. It need not coincide with the optimizer batch, and changing it changes the training objective even when the languagemodeling batch, optimizer, and model are unchanged. A narrow scope asks every small token group to use the experts uniformly; a broad scope allows imbalance within one sequence, rank, domain, or microbatch as long as it is compensated elsewhere in the balance batch. The latter can reduce conflict between load balancing and specialization when microbatches are small or domain-homogeneous (Qiu et al., 2025).

balance batch 指用来构造请求硬频率向量的那组 token. 它不必和优化器 batch 一致; 即便语言建模的 batch, 优化器和模型都不变, 改了它就改了训练目标. 范围窄, 就要求每一小组 token 都均匀地用 expert; 范围宽, 就允许一条序列, 一个 rank, 一个领域或一个微批内部不均衡, 只要在 balance batch 的其他地方补回来. 微批小或领域单一时, 后者能减少负载均衡和专门化之间的冲突 (Qiu et al., 2025).

For a balance batch of T tokens, N routed experts, and K selections per token, let $f _ { i } = C _ { i } ^ { \mathrm { r e q } } / ( K T )$ be expert i’s fraction of requested routes before capacity, and let $\begin{array} { r } { P _ { i } = T ^ { - 1 } \sum _ { t = 1 } ^ { T } p _ { t , i } } \end{array}$ be its mean router score, with $p _ { t , i }$ normalized across experts for each token. The Switch-style load-balancing loss couples these two statistics (Lepikhin et al., 2021; Fedus et al., 2022):

对一个含 $T$ 个 token 的 balance batch, $N$ 个路由 expert, 每个 token 选 $K$ 个, 令 $f_i = C_i^{\mathrm{req}} / (KT)$ 为 expert $i$ 在容量之前的请求路由占比, $P_i = T^{-1} \sum_{t=1}^T p_{t,i}$ 为它的平均 router 分数, 其中 $p_{t,i}$ 对每个 token 在所有 expert 上归一化. Switch 式负载均衡损失把这两个统计量耦合起来 (Lepikhin et al., 2021; Fedus et al., 2022):

$$
\mathcal {L} _ {\mathrm{LBL}} := N \sum_ {i = 1} ^ {N} f _ {i} P _ {i} = N \boldsymbol {f} ^ {\mathsf {T}} \boldsymbol {P}.\tag{30}
$$

The hard fractions $f _ { i }$ are treated as constants; gradients flow through $P _ { i } .$ The factor N keeps the balanced value equal to one as the expert count changes. The external coefficient multiplying this loss in the training objective is omitted here.

硬占比 $f_i$ 当作常数, 梯度只经 $P_i$ 流动. 因子 $N$ 保证不论 expert 数是多少, 均衡时的值都是 1. 训练目标里乘在这个损失外面的系数这里省略.

Table 19 separates five relevant scopes, including three distributed or accumulation-aware variants that are often conflated under “global load balancing.” Only the first two are implemented as Olmo LBL granularities today.

表 19 区分了五种相关范围, 其中三种是分布式或考虑梯度累积的变体, 常被笼统地叫作「全局负载均衡」. Olmo 的 LBL 目前只实现了前两种粒度.

The last two rows are not interchangeable. Let $m   =   1 , \ldots , M$ index the microbatches in one gradientaccumulation window. Let $C _ { m , i } ^ { \mathrm { r e q } }$ be expert i’s requested count after synchronization over balance group $\mathcal { G } ,$

<!-- page 73 of 168 -->

| Scope | Statistics and semantics | Coordination and cost | Olmo status |
| --- | --- | --- | --- |
| Instance | One per-sequence hard histogram, reduced across tensor- and context-parallel shards as applicable, paired with each shard's local differentiable soft-score contribution | Reductions induced by sequence sharding | Implemented as instance |
| Rank-local | Current rank's current microbatch; unrelated | No additional count | Implemented as |
| microbatch | local sequences can compensate, while CP shards remain local | communication | local_batch |
| Synchronized | Current hard counts reduced over the stage-local | One N-element count | Design only |
| current microbatch | token balance group; each rank contributes its local soft term | all-reduce per routed-layer forward |  |
| GA-buffered online | Synchronized counts accumulated through | Same all-reduce plus an | Design only; |
| global | gradient accumulation; microbatch m uses the prefix through m | N-element per-router buffer | analogous to Megatronglobal_aux_loss |
| Exact | Final hard counts and soft-score sums over all | Delayed backward, retained | Not implemented |
| optimizer-batch | ranks and all accumulation microbatches | graphs, or a routing prepass; |  |
| global |  | stale statistics instead define an approximation |  |

let $T _ { m }$ be the corresponding valid-token count, and let

最后两行不能互换. 令 $m = 1, \ldots, M$ 编号一个梯度累积窗口里的微批, $C_{m,i}^{\mathrm{req}}$ 为在 balance group $\mathcal{G}$ 上同步之后 expert $i$ 的请求计数, $T_m$ 为对应的有效 token 数, 再令

$$
Q _ {m, i} := \sum_ {r \in \mathcal {G}} \sum_ {t \in (r, m)} p _ {t, i}\tag{31}
$$

be the conceptual global soft-score sum, where $p _ { t , i }$ is token t’s normalized router score for expert i. A token-weighted online variant uses the frequency and microbatch loss

为概念上的全局 soft 分数和, 其中 $p_{t,i}$ 是 token $t$ 对 expert $i$ 的归一化 router 分数. 按 token 加权的在线变体使用如下频率和微批损失

$$
\widetilde {f} _ {m, i} := \frac {\sum_ {j = 1} ^ {m} C _ {j , i} ^ {\mathrm{req}}}{K \sum_ {j = 1} ^ {m} T _ {j}}, \qquad P _ {m, i} := \frac {Q _ {m , i}}{T _ {m}}, \qquad \mathcal {L} _ {m} ^ {\text {online}} := N \sum_ {i = 1} ^ {N} \widetilde {f} _ {m, i} P _ {m, i}.\tag{32}
$$

This applies Equation 30 with accumulating hard counts and current-microbatch soft scores. Section 10.7 analyzes why this hard/soft coupling need not track requested-load balance. Microbatch one sees only its own counts; microbatch two sees the first two; and so forth. Once an early microbatch has backpropagated, its gradient is not recomputed when later counts arrive. The method expands the effective scope online but is not the exact optimizer-batch objective unless $M = 1$ . The buffered approximation analyzed by Qiu et al. (2025) accumulates routing counts across microbatches. The Megatron implementation maintains the microbatch-number mean $\begin{array} { r } { \overline { { C } } _ { m , i }   =   m ^ { - 1 } \sum _ { j \leq m } C _ { j , i } ^ { \mathrm { r e q } } } \end{array}$ and uses $\textstyle N \sum _ { i } \operatorname { s g } ( \widehat { \overline { { C } } _ { m , i } } ) \widehat { Q _ { m , i } } / ( K T _ { m } ^ { 2 } )$ , where sg denotes stop-gradient (NVIDIA, 2026e). It equals Equation 32 when all microbatches contain the same number of valid tokens. With padding, masking, or variable-size packed microbatches, Equation 32 is a proposed token-weighted generalization rather than a description of the literal Megatron formula.

这是把式 (30) 用在累积的硬计数和当前微批的 soft 分数上. 为什么这种硬/软耦合不一定能跟踪请求负载的均衡, 见 10.7 节. 第一个微批只看到自己的计数, 第二个看到前两个的, 依此类推. 早先的微批一旦做完反向, 后面的计数到了也不会重算它的梯度. 这种方法在线扩大了有效范围, 但除非 $M = 1$, 它不是精确的优化器 batch 目标. Qiu et al. (2025) 分析的带缓冲近似在微批之间累积路由计数. Megatron 的实现维护按微批个数平均的 $\overline{C}_{m,i} = m^{-1} \sum_{j \leq m} C_{j,i}^{\mathrm{req}}$, 用的是 $N \sum_i \mathrm{sg}(\overline{C}_{m,i}) Q_{m,i} / (K T_m^2)$, sg 表示 stop-gradient (NVIDIA, 2026e). 所有微批的有效 token 数相同时, 它和式 (32) 相等. 有 padding, mask 或变长打包微批时, 式 (32) 是本文提出的按 token 加权的推广, 不是 Megatron 公式的字面描述.

> **对一下:** Megatron 的 $\mathrm{sg}(\overline{C}_{m,i}) Q_{m,i} / (K T_m^2)$ 和式 (32) 在微批 token 数不等时到底差在哪?
> 答: 把两者都写成 $\sum_{j \leq m} C_{j,i}^{\mathrm{req}}$ 乘 $Q_{m,i}$ 再除以一个分母. 式 (32) 的分母是 $K T_m \sum_{j \leq m} T_j$; Megatron 的分母是 $K T_m \cdot m T_m$. 两者只差 $\sum_{j \leq m} T_j$ 和 $m T_m$, 也就是「前 $m$ 个微批的真实 token 总数」和「当前微批 token 数乘以 $m$」. $T_j$ 全相等时两者一致. 若当前微批的有效 token 比之前少 (例如 mask 掉的 padding 多), Megatron 的分母偏小, 硬频率被高估, 这个微批的均衡梯度偏大; 反过来就偏小. 所以 Megatron 式子的硬频率在变长微批下不再是概率向量, 其分量和不等于 1, 式 (30) 「均衡时为 1」的归一化也随之失效. 报告只说式 (32) 是推广, 没给变长微批下两者的实测差别.

Equation 32 defines a conceptual global loss. A per-rank implementation can use local soft-score sums and rely on distributed gradient reduction, but the scale of that local contribution follows from the gradient-averaging convention of the DDP implementation—here MultiGroupDistributedDataParallel (Section 4)—so the correct group-size factor differs across training stacks rather than transferring between them.

式 (32) 定义的是概念上的全局损失. 按 rank 实现时, 可以用本地 soft 分数和, 依靠分布式梯度归约, 但本地贡献的缩放由 DDP 实现的梯度平均约定决定, 这里是 MultiGroupDistributedDataParallel (第 4 节). 所以正确的组大小因子随训练框架而异, 不能从一个框架照搬到另一个.

In contrast, define final optimizer-batch statistics

与之对照, 定义优化器 batch 结束时的统计量

$$
C _ {i} ^ {\text {step}} := \sum_ {m = 1} ^ {M} C _ {m, i} ^ {\text {req}}, \qquad Q _ {i} ^ {\text {step}} := \sum_ {m = 1} ^ {M} Q _ {m, i}, \qquad T ^ {\text {step}} := \sum_ {m = 1} ^ {M} T _ {m}.\tag{33}
$$

The exact optimizer-batch objective is

精确的优化器 batch 目标是

$$
\mathcal {L} _ {\mathrm{LBL}} ^ {\text {step}} = \frac {N}{K (T ^ {\text {step}}) ^ {2}} \sum_ {i = 1} ^ {N} \operatorname{sg} \bigl (C _ {i} ^ {\text {step}} \bigr) Q _ {i} ^ {\text {step}}.\tag{34}
$$

<!-- page 74 of 168 -->

Every microbatch’s soft-score sum is now weighted by the same final count vector. Olmo backpropagates each gradient-accumulation microbatch as it is processed, so implementing this objective literally would require retaining every graph until the final count is known, performing an additional routing prepass, or substituting stale statistics. These choices add memory, compute, or approximation error.

这时每个微批的 soft 分数和都乘以同一个最终计数向量. Olmo 每处理完一个梯度累积微批就立刻做反向, 所以要字面实现这个目标, 只能把每张计算图留到最终计数已知, 或者多做一遍路由预扫描, 或者用过期的统计量代替. 这几种做法分别增加显存, 计算或近似误差.

The synchronization group must follow router-token sharding rather than expert-parameter sharding. The intended Olmo design uses the stage-local $\mathrm { D P   \times   C P }$ group: it includes distinct data- and context-parallel token shards for the same router layer, excludes other pipeline stages, and operates on counts over global expert identifiers before expert-local slicing. Using WORLD under pipeline parallelism would mix different layers and can violate collective ordering; using an expert replica or placement group would answer a different question. The count payload is only N elements, but its collective occurs once per routed layer and microbatch, so its cost is set by launch latency and collective ordering rather than by bytes.

同步组要跟着 router 的 token 切分走, 不跟 expert 参数的切分走. Olmo 设计中用的是 stage 内的 $\mathrm{DP} \times \mathrm{CP}$ 组: 它包含同一 router 层上不同的数据并行和上下文并行 token 分片, 不含其他流水线 stage, 统计的是按全局 expert 编号, 在切成本地 expert 之前的计数. 在流水线并行下用 WORLD 会把不同层混在一起, 还可能打乱集合通信的顺序; 用 expert 副本组或放置组, 回答的就是另一个问题了. 计数载荷只有 $N$ 个元素, 但这个集合通信每个路由层, 每个微批都要做一次, 所以它的代价由 launch 延迟和集合通信顺序决定, 和字节数关系不大.

The scope choice changes both specialization pressure and systems behavior. Smaller scopes suppress immediate local skew but can discourage specialization. Broader scopes permit locally skewed batches and require communication or delayed information; a globally balanced count can still leave one expert-parallel rank transiently hot. Changing the scope changes the training recipe, including both its balancing pressure and coordination cost.

范围的选择既改变专门化的压力, 也改变系统行为. 范围小, 能压住眼前的局部偏斜, 但可能抑制专门化. 范围大, 允许局部偏斜的 batch, 但需要通信或延迟的信息; 而全局计数均衡了, 某个 expert 并行 rank 仍可能暂时过热. 改范围就是改训练配方, 均衡压力和协调成本都跟着变.

## 10.6 Auxiliary Gradients and Hard-Count Feedback Are Different Controllers · 辅助梯度与硬计数反馈是两种不同的控制器

Switch-style LBL adds a differentiable term whose detached requested counts become coefficients on the router’s soft-score gradient. DeepSeek-style auxiliary-loss-free balancing instead treats requested load as feedback to a non-trainable selection controller (Wang et al., 2024; DeepSeek-AI et al., 2024). Let $a _ { t , i }$ be the unbiased quantity used for selection, let $\omega _ { t , i }$ be the unbiased affinity used for weighting, and let $b _ { i }$ be a persistent expert bias. Neither $a _ { t , i }$ nor $\omega _ { t , i }$ includes $b _ { i }$ . Selection and mixture weighting use

Switch 式 LBL 加的是一个可微项, 其中 detach 掉的请求计数成了 router soft 分数梯度上的系数. DeepSeek 式无辅助损失均衡则把请求负载当作一个不可训练的选择控制器的反馈 (Wang et al., 2024; DeepSeek-AI et al., 2024). 记 $a_{t,i}$ 为用于选择的无偏量, $\omega_{t,i}$ 为用于加权的无偏亲和度, $b_i$ 为持久的 expert 偏置. $a_{t,i}$ 和 $\omega_{t,i}$ 都不含 $b_i$. 选择和混合加权分别用

$$
S _ {t} = \operatorname{TopK} _ {i} (a _ {t, i} + b _ {i}, K), \quad w _ {t, i} = \text {Normalize} _ {j \in S _ {t}} (\omega_ {t, j}) _ {i}.\tag{35}
$$

The bias changes which experts are selected, while their mixture weights come from the original affinities. For top-K softmax routing, $a _ { t , i }   =   z _ { t , i }$ and $\omega _ { t , i }   =   \exp z _ { t , i } ;$ score-based routing can use $a _ { t , i }   =   \omega _ { t , i }   =   p _ { t , i } .$ DeepSeek uses sigmoid affinities (DeepSeek-AI et al., 2024); Olmo applies the same biased-selection pattern to the configured router scores.

偏置改变的是选中哪些 expert, 它们的混合权重仍来自原始亲和度. 对 top-K softmax 路由, $a_{t,i} = z_{t,i}$, $\omega_{t,i} = \exp z_{t,i}$; 基于分数的路由可以取 $a_{t,i} = \omega_{t,i} = p_{t,i}$. DeepSeek 用 sigmoid 亲和度 (DeepSeek-AI et al., 2024); Olmo 把同样的带偏置选择套在配置的 router 分数上.

Over one feedback window, define the requested count and its mean as

在一个反馈窗口内, 定义请求计数及其均值

$$
C _ {i} ^ {\mathrm{fb}} := \sum_ {t} \mathbf {1} \{i \in S _ {t} \}, \quad \overline {{C}} ^ {\mathrm{fb}} := \frac {1}{N} \sum_ {i} C _ {i} ^ {\mathrm{fb}}.\tag{36}
$$

The controller updates outside autograd,

控制器在 autograd 之外更新,

$$
b _ {i} \leftarrow b _ {i} + \gamma \operatorname{sign} \Bigl (\overline {{C}} ^ {\mathrm{fb}} - C _ {i} ^ {\mathrm{fb}} \Bigr).\tag{37}
$$

Underloaded experts receive a positive selection offset and overloaded experts a negative one. The update acts on future requested assignments; it does not observe which routes a downstream capacity policy kept.

负载不足的 expert 得到正的选择偏移, 过载的得到负的. 更新作用于未来的请求分配, 它看不到下游容量策略保留了哪些路由.

Olmo enables this controller whenever the bias-update rate is positive. Requested counts accumulate across the microbatches of one training batch. A post-batch hook applies Equation 37 after the final backward and before the optimizer step, then resets the accumulator. The router’s count reduction defaults to the WORLD process group unless a balance group is explicitly configured. The next batch selects from unbiased scores plus the persistent bias, while mixture weights still come from unbiased affinities.

只要偏置更新率为正, Olmo 就启用这个控制器. 请求计数在一个训练 batch 的各微批之间累积. batch 后的 hook 在最后一次反向之后, 优化器 step 之前应用式 (37), 然后清空累加器. 除非显式配置了 balance group, router 的计数归约默认用 WORLD 进程组. 下一个 batch 用无偏分数加持久偏置来选择, 混合权重仍来自无偏亲和度.

Under PP, the controller requires a stage-local balance group: the default WORLD group mixes counts from different router layers. This report makes no claim about the controller’s model quality, stability, feedbackscope behavior, or systems cost.

在 PP 下, 控制器需要 stage 内的 balance group: 默认的 WORLD 组会把不同 router 层的计数混在一起. 本报告不对这个控制器的模型质量, 稳定性, 反馈范围上的行为或系统成本作任何结论.

> **停一下:** 10.6 节说默认 WORLD 组在 PP 下会混入不同 router 层的计数, 那 Olmo 的默认配置开 PP 时偏置控制器还对不对?
> 答: 不对. 代码 `nn/moe/router.py` 的 `post_batch` 里, 累积的 `batch_size_per_expert` 直接做 `dist.all_reduce(..., group=self.group)`, `group` 没配置时是 `None`, 也就是 WORLD. post-batch hook 在每个 stage 上按层顺序逐个调用各 router 的 `post_batch`, WORLD 上的 all-reduce 按调用顺序配对, 于是 stage 0 的第 1 个 MoE 层和 stage 1 的第 1 个 MoE 层 (模型里是不同的层) 被加在一起. 每层拿到的是几层混合后的计数, 式 (37) 的 sign 对某一层可能是反的. 如果各 stage 上的 MoE 层数不同, all-reduce 次数对不上, 就是 10.5 节说的「违反集合通信顺序」, 可能卡死. 报告把这写成使用约束, 代码里这一处没看到 PP 开启时自动换组或报错的防护; 其他调用点有没有, 只看了这一个文件, 不确定.

When used without LBL, the controller removes the balancing-loss gradient and its potential interference with cross-entropy. Its behavior still depends on the update rate and feedback scope. A large $\gamma$ can make loads oscillate around the target; a small value can lag behind a changing router; and a broad feedback scope

<!-- page 75 of 168 -->

can hide per-sequence or rank-local hotspots (Wang et al., 2024). DeepSeek-V3 reports retaining a very small sequence-level auxiliary safeguard alongside its bias controller (DeepSeek-AI et al., 2024). Its update rate and safeguard coefficient are recipe choices rather than universal constants.

不配 LBL 单独用时, 这个控制器去掉了均衡损失的梯度, 也就去掉了它可能对交叉熵的干扰. 它的行为仍取决于更新率和反馈范围. $\gamma$ 大, 负载可能在目标附近来回振荡; $\gamma$ 小, 可能跟不上不断变化的 router; 反馈范围宽, 可能掩盖单条序列或单个 rank 上的热点 (Wang et al., 2024). DeepSeek-V3 报告在偏置控制器之外还保留了一个很小的序列级辅助保险项 (DeepSeek-AI et al., 2024). 它的更新率和保险项系数是配方上的选择, 不是通用常数.

When bias feedback and LBL are enabled together, the bias affects the requested counts used by LBL: hard selections depend on $a + b ,$ while LBL’s soft mean still uses the unbiased normalized scores p. The selected experts can therefore differ from those favored by the scores entering the soft term. The coefficient $\lambda _ { \mathrm { L B L } }$ and bias-update rate $\gamma$ control these different feedback paths.

偏置反馈和 LBL 同时开启时, 偏置会影响 LBL 用到的请求计数: 硬选择取决于 $a + b$, LBL 的 soft 均值仍用无偏的归一化分数 $p$. 所以选中的 expert 可能和 soft 项里分数偏好的 expert 不同. 系数 $\lambda_{\mathrm{LBL}}$ 和偏置更新率 $\gamma$ 分别控制这两条反馈路径.

We next analyze the auxiliary-loss controller, separating what its scalar value measures from the effect of its gradient.

辅助损失同时产生一个可观测标量和一组路由梯度, 两者表达的信息需要分别计算.

## 10.7 Token Gerrymandering: The Model Learns to Hack the LBL Objective · Token Gerrymandering: 模型学会钻 LBL 目标的空子

Figure 42 previews the empirical result of Section 10.8.1: after a checkpoint branch, the trajectory that keeps the larger LBL coefficient drives its load-balancing loss down while its load imbalance climbs, and the branch with the smaller coefficient stays balanced. This subsection and Section 10.8 explain why the objective rewards that trade.

图 42 先给出 10.8.1 节的实测结果: 从一个 checkpoint 分叉后, 保留较大 LBL 系数的那条轨迹把负载均衡损失压了下去, 负载不均衡度却在上升; 系数较小的分支一直保持均衡. 本小节和 10.8 节解释这个目标为什么会奖励这种交换.

## The LBL Scalar Is a Signed Cross-Term, Not a Balance Certificate · LBL 标量是一个带符号的交叉项, 不是均衡证明

The standard objective couples requested hard-route frequency to the mean soft router-score vector. After centering both vectors at uniform load, the coupling is a signed cross-term rather than a distance from uniform requested load. Frequently selected experts can win many tokens by small margins while rarely or never selected experts absorb soft mass without winning—the failure mode we call **Token Gerrymandering**.

标准目标把请求的硬路由频率和平均 soft router 分数向量耦合在一起. 把两个向量都以均匀负载为中心平移之后, 这种耦合是一个带符号的交叉项, 不是到均匀请求负载的距离. 常被选中的 expert 可以用很小的优势赢下大量 token, 很少或从未被选中的 expert 吸走 soft 分数却一次也不赢. 我们把这种失效模式叫作 **Token Gerrymandering**.

## 10.7.1 Requested Hard Assignments and Soft Mass · 请求的硬分配与 soft 质量

Consider one routed layer and one balance batch containing $T$ tokens. Let N be the number of routed experts, let each token select K experts, and let $S _ { t }$ be token t’s selected set. For this theoretical block, write $\vec { C _ { i } } \equiv \vec { C _ { i } ^ { \mathrm { r e q } } }$ for the requested top-K count aggregated over the chosen balance batch. Capacity is downstream of this statistic and does not enter the current LBL implementation.

考虑一个路由层和一个含 $T$ 个 token 的 balance batch. $N$ 为路由 expert 数, 每个 token 选 $K$ 个 expert, $S_t$ 为 token $t$ 的选中集合. 在这一段理论推导里, 记 $C_i \equiv C_i^{\mathrm{req}}$ 为在所选 balance batch 上汇总的请求 top-K 计数. 容量在这个统计量的下游, 不进入当前的 LBL 实现.

## Requested Hard Load and Soft Mass · 请求硬负载与 soft 质量

The requested route count, normalized requested fraction, and mean normalized router score for expert i are

expert $i$ 的请求路由数, 归一化请求占比, 以及平均归一化 router 分数分别为

$$
C _ {i} \equiv C _ {i} ^ {\mathrm{req}} := \sum_ {t = 1} ^ {T} \mathbf {1} \{i \in S _ {t} \}, \quad f _ {i} := \frac {C _ {i}}{K T}, \quad P _ {i} := \frac {1}{T} \sum_ {t = 1} ^ {T} p _ {t, i}.\tag{38}
$$

Both $f$ and $P$ are probability vectors: $\textstyle \sum _ { i } f _ { i } = \sum _ { i } P _ { i } = 1$ . The hard vector $f$ describes which experts top-K selected before capacity. The soft vector $P$ is a differentiable summary of router scores; it is neither a selected-route histogram nor an executed workload. If no route is dropped, $C _ { i } ^ { \mathrm { r e q } } = \dot { C } _ { i } ^ { \mathrm { k e e p } } ;$ the LBL algebra itself does not assume that equality.

$f$ 和 $P$ 都是概率向量: $\sum_i f_i = \sum_i P_i = 1$. 硬向量 $f$ 描述在容量之前 top-K 选中了哪些 expert. soft 向量 $P$ 是 router 分数的可微汇总, 它既不是选中路由的直方图, 也不是实际执行的工作量. 没有路由被丢时 $C_i^{\mathrm{req}} = C_i^{\mathrm{keep}}$; LBL 的代数本身不依赖这个等式.

A direct requested-load metric used by Olmo is the maximum expert count divided by the mean expert count. It is the expert-level instance of Equation 22:

Olmo 用的一个直接的请求负载指标是 expert 计数的最大值除以均值, 即式 (22) 在 expert 层上的特例:

$$
I _ {\max} ^ {\mathrm{req}} := \frac {\max _ {i} C _ {i}}{\frac {1}{N} \sum_ {i} C _ {i}} = N \max _ {i} f _ {i}.\tag{39}
$$

Perfect requested balance gives $I _ { \mathrm { m a x } } ^ { \mathrm { r e q } } = 1$ . The number of never-selected experts, the coefficient of variation of the $C _ { i } ,$ and the sum of counts placed on each expert-parallel rank provide complementary views. Requested counts determine demand; capacity converts demand into the kept counts that determine expert compute and actual communication.

请求完全均衡时 $I_{\max}^{\mathrm{req}} = 1$. 从未被选中的 expert 数, $C_i$ 的变异系数, 以及每个 expert 并行 rank 上的计数之和, 从其他角度补充这个指标. 请求计数决定需求; 容量把需求变成保留计数, 后者决定 expert 计算和实际通信.

<!-- page 76 of 168 -->

![Image block](images/p76-figure-42-the-load-balancing-loss-falls-while-load.jpg)

Figure 42 The load-balancing loss falls while load imbalance rises. Orange is the original $\lambda_{ LBL } = 0.05$ trajectory; blue reloads the step-17,000 checkpoint with $\lambda _ { \mathrm { L B L } }   =   0 . 0 0 5$ . Unscaled LBL is the sum over the 47 MoE blocks; imbalance is the worst max/mean expert count over blocks and ranks. Smoothed traces only; Figure 45 adds the raw measurements and the cross-entropy panel, and Section 10.8.1 gives the protocol.

The Switch-style loss in Equation 30 instead couples the hard and soft vectors. Olmo constructs $C _ { i } ^ { \mathrm { r e q } }$ from top-K indices before capacity under no-gradient bookkeeping and differentiates Equation 30 only through $P _ { i }$ For sigmoid routing, the scores used by this loss are normalized across experts before the dot product, so the analysis below applies to both normalized sigmoid and softmax scores.

式 (30) 的 Switch 式损失则把硬向量和 soft 向量耦合起来. Olmo 在容量之前, 用不带梯度的记录从 top-K 下标构造 $C_i^{\mathrm{req}}$, 对式 (30) 只经 $P_i$ 求导. 对 sigmoid 路由, 这个损失用的分数在点积之前先在 expert 维上归一化, 所以下面的分析对归一化的 sigmoid 分数和 softmax 分数都成立.

The standard presentation associates the minimum of this objective with uniform requested and soft routing (Fedus et al., 2022, Section 2.2 and Appendix F). That conclusion would follow immediately if one could identify the soft proxy with requested load. If $P = f$ , then

标准的讲法把这个目标的最小值和请求路由, soft 路由都均匀联系起来 (Fedus et al., 2022, Section 2.2 and Appendix F). 如果能把 soft 代理量等同于请求负载, 这个结论立即成立. 若 $P = f$, 则

$$
\mathcal {L} _ {\mathrm{LBL}} = N \| \boldsymbol {f} \| _ {2} ^ {2} = 1 + N \| \boldsymbol {f} - \boldsymbol {u} \| _ {2} ^ {2}, \quad u _ {i} := \frac {1}{N},\tag{40}
$$

and uniform requested load is the unique minimizer. Top-K routing does not impose $P = f$ . It imposes only an ordering constraint within each token: selected experts must outrank unselected experts. Aggregating those token-wise inequalities does not make the two expert-wise marginals equal.

此时均匀的请求负载是唯一最小点. 但 top-K 路由并不要求 $P = f$. 它只在每个 token 内部施加一个排序约束: 选中的 expert 分数必须高于没选中的. 把这些逐 token 的不等式汇总起来, 并不会让两个按 expert 的边缘分布相等.

## 10.7.2 The Centered Form Exposes the Surrogate · 中心化形式暴露了代理目标的问题

Let $\boldsymbol { u } = ( 1 / N , \dots , 1 / N )$ be uniform load. Because both $f - u$ and $P   -   u$ sum to zero, expanding Equation 30 gives

令 $\boldsymbol{u} = (1/N, \ldots, 1/N)$ 为均匀负载. 因为 $f - u$ 和 $P - u$ 的分量和都为零, 展开式 (30) 得

$$
\boxed {\mathcal {L} _ {\mathrm{LBL}} = 1 + N (\boldsymbol {f} - \boldsymbol {u}) ^ {\top} (\boldsymbol {P} - \boldsymbol {u}) = 1 + N ^ {2} \operatorname{Cov} _ {i \sim \operatorname{Unif} ([ N ])} (f _ {i}, P _ {i}).}\tag{41}
$$

Here the covariance is taken across expert coordinates within one balance scope. It is not a stochastic claim about correlation over training time.

这里的协方差是在一个均衡范围内对 expert 坐标取的, 不是关于训练过程中相关性的随机命题.

In Equation 41, if the hard and soft deviations point in the same direction, the centered inner product is positive and the loss exceeds one. If either vector is uniform, or if their deviations are orthogonal, the loss equals one. If the deviations are anti-aligned, the loss is below one. In particular,

式 (41) 里, 硬偏差和 soft 偏差同向时, 中心化内积为正, 损失大于 1. 任一向量均匀, 或两者偏差正交时, 损失等于 1. 偏差反向时, 损失小于 1. 特别地,

$$
\boldsymbol {P} = \boldsymbol {u} \quad \Longrightarrow \quad \mathcal {L} _ {\mathrm{LBL}} = 1 \quad \text {for every probability vector} \boldsymbol {f}.\tag{42}
$$

With deterministic tie breaking, uniform scores can pair exactly with a collapsed requested-route histogram; with strict routing margins, that pair can be approached arbitrarily closely by giving the winning expert an infinitesimal advantage. Thus collapse can have the same limiting scalar value as perfect balance. More strongly, the compatible anti-aligned constructions below score better than perfect balance.

如果平局按确定规则打破, 均匀分数可以恰好配上一个完全塌缩的请求路由直方图; 如果路由要求严格的分差, 只要给胜出的 expert 一个无穷小的优势, 也能任意逼近这一对. 所以塌缩的极限标量值可以和完全均衡一样. 更进一步, 下面构造的相容的反向配置, 得分比完全均衡还好.

The scalar thus fails as a balance metric even though its stop-gradient construction can still push score mass away from frequently selected experts. Liu (2024) gave a compatible one-dead-expert counterexample in which the scalar falls below one, while Su (2025) emphasized that the scalar value and its balancing gradient

<!-- page 77 of 168 -->

are different objects. In peer-reviewed work, Lange et al. (2026) identified a related blind spot in which global-batch LBL can appear balanced even when some experts remain barely used. The centered form makes that blind spot exact: Equation 30 controls one signed cross-term, but it controls neither $\| \boldsymbol { f } - \boldsymbol { u } \| _ { 2 }$ nor $\| P - u \| _ { 2 }$ separately. The following constructions quantify how far the scalar can fall below one under imbalanced routing.

所以这个标量作为均衡指标是失效的, 尽管它的 stop-gradient 构造仍然能把分数质量从常被选中的 expert 身上推开. Liu (2024) 给过一个相容的单死 expert 反例, 其中标量低于 1; Su (2025) 强调标量值和它的均衡梯度是两个不同的东西. 在同行评审的工作里, Lange et al. (2026) 指出过一个相关的盲区: 即使有些 expert 几乎没被用到, 全局 batch 的 LBL 也可能看起来是均衡的. 中心化形式把这个盲区精确化了: 式 (30) 只控制一个带符号的交叉项, 它既不单独控制 $\|f - u\|_2$, 也不单独控制 $\|P - u\|_2$. 下面的构造定量给出, 在路由不均衡时这个标量能比 1 低多少.

## 10.7.3 A Six-Token Counterexample · 六个 token 的反例

The smallest useful example has two experts, top-1 routing, and six tokens. No capacity filter is present, so requested and kept routes coincide. Ignore the batch dimension and use the normalized score matrix

最小的有用例子有两个 expert, top-1 路由, 六个 token. 没有容量过滤, 所以请求路由和保留路由相同. 忽略 batch 维, 取归一化分数矩阵

$$
\left[ \begin{array}{c c} 1. 0 & 0. 0 \\ 1. 0 & 0. 0 \\ 0. 4 & 0. 6 \\ 0. 4 & 0. 6 \\ 0. 4 & 0. 6 \\ 0. 4 & 0. 6 \end{array} \right].\tag{43}
$$

Expert 1 wins the first two tokens, while expert 2 wins the other four. The requested hard and soft marginals are

expert 1 赢下前两个 token, expert 2 赢下其余四个. 请求的硬边缘分布和 soft 边缘分布为

$$
\boxed {C ^ {\mathrm{req}} = (2, 4), \qquad \boldsymbol {f} = \left(\frac {1}{3}, \frac {2}{3}\right), \qquad \boldsymbol {P} = \left(\frac {3}{5}, \frac {2}{5}\right).}\tag{44}
$$

The requested imbalance is $I _ { \mathrm { m a x } } ^ { \mathrm { r e q } } = 4 / 3$ , yet

请求不均衡度为 $I_{\max}^{\mathrm{req}} = 4/3$, 然而

$$
\mathcal {L} _ {\mathrm{LBL}} = 2 \left(\frac {1}{3} \frac {3}{5} + \frac {2}{3} \frac {2}{5}\right) = \frac {1 4}{1 5} \approx 0. 9 3 3 3 <   1.\tag{45}
$$

Panels (a) and (b) of Figure 43 recast the six-token example as equal winner-take-all “elections.” Both panels hold $P = ( 3 / 5 , 2 / 5 )$ fixed; moving from the hard-balanced panel (a) to panel (b) changes the requested route fraction from $( 1 / 2 , 1 / 2 ) \mathrm { t o } ( 1 / 3 , 2 / 3 )$ . The same soft mass is packed into two decisive expert-1 wins while expert 2 wins four by smaller margins; the requested expert load becomes less balanced as the auxiliary scalar falls from one to 14/15.

图 43 的 (a), (b) 两栏把六 token 的例子画成若干场等权的赢者通吃「选举」. 两栏的 $P = (3/5, 2/5)$ 都固定; 从硬分配均衡的 (a) 栏到 (b) 栏, 请求路由占比从 $(1/2, 1/2)$ 变成 $(1/3, 2/3)$. 同样的 soft 质量被集中成 expert 1 的两场压倒性胜利, expert 2 则以较小优势赢下四场; 辅助标量从 1 降到 14/15, 请求的 expert 负载却更不均衡了.

After aggregation, the lightly loaded expert holds more soft mass and the heavily loaded expert less, so their centered marginals are exactly anti-aligned, the property quantified by Equation 41. The election analogy describes only this concentration of score mass; the tokens themselves stay fixed.

汇总之后, 负载轻的 expert 持有的 soft 质量多, 负载重的反而少, 两者的中心化边缘分布正好反向, 这正是式 (41) 量化的性质. 「选举」这个说法只描述分数质量的集中方式, token 本身是固定的.

This example disproves any monotonic interpretation of $\mathcal { L } _ { \mathrm { L B L } }$ as requested-route imbalance: a lower value coexists with a higher value of the direct requested-load metric. It is not itself an optimum. The next result shows that the discrepancy is a global score-level property rather than an isolated numerical choice.

这个例子否定了把 $\mathcal{L}_{\mathrm{LBL}}$ 当作请求路由不均衡度的任何单调解读: 更低的损失值和更高的直接请求负载指标同时出现. 它本身不是最优点. 下一个结果说明, 这种背离是分数层面的全局性质, 不是凑出来的个别数值.

## 10.7.4 Perfect Balance Is Not the Global Score-Level Optimum · 完全均衡不是分数层面的全局最优

For two experts and top-1 routing, relabel the underloaded expert as expert 1 and write

对两个 expert, top-1 路由, 把负载较轻的 expert 重新编号为 expert 1, 记

$$
\boldsymbol {f} = (x, 1 - x), \quad 0 \leq x \leq \frac {1}{2}.\tag{46}
$$

For one token, let $q$ be its soft probability for expert 1. The token’s contribution to $f ^ { \top } p _ { t }$ is

对一个 token, 令 $q$ 为它给 expert 1 的 soft 概率. 这个 token 对 $f^{\top} p_t$ 的贡献是

$$
x q + (1 - x) (1 - q) = (1 - x) + (2 x - 1) q.\tag{47}
$$

Since $2 x - 1 \leq 0 .$ , this quantity decreases as q increases. On the fraction x of tokens routed to expert 1, the smallest contribution is approached by $q \rightarrow 1$ , giving contribution x. On tokens routed to expert 2, top-1 routing requires $q < 1 / 2 ;$ ; the smallest contribution is approached by $q \rightarrow 1 / 2$ from below, giving contribution $1 / 2$ . Therefore, for a fixed requested load x,

由于 $2x - 1 \leq 0$, 这个量随 $q$ 增大而减小. 在路由到 expert 1 的那 $x$ 比例的 token 上, 取 $q \to 1$ 逼近最小贡献, 贡献为 $x$. 在路由到 expert 2 的 token 上, top-1 路由要求 $q < 1/2$, 取 $q$ 从下方趋于 $1/2$ 逼近最小贡献, 贡献为 $1/2$. 因此, 对固定的请求负载 $x$,

$$
\inf \mathcal {L} _ {\mathrm{LBL}} (x) = 2 \left[ x \cdot x + (1 - x) \frac {1}{2} \right] = 1 - x + 2 x ^ {2}.\tag{48}
$$

<!-- page 78 of 168 -->

![Image block](images/p78-image.jpg)

![Image block](images/p78-image-2.jpg)

![Image block](images/p78-figure-43-soft-router-mass-and-requested-routes-can.jpg)

Figure 43 Soft router mass and requested routes can diverge sharply. Orange denotes expert 1 (A), and teal denotes expert 2 (B). Each outlined tile is one token in a two-expert, top-1 router. Its ten interior dots discretize the normalized scores used to form $P ;$ the tile border marks the sole selected route, which is also executed in this capacityfree construction. Panels (a) and (b) hold $P = ( 3 / 5 , 2 / 5 )$ fixed. Panel (a) is hard-balanced, with $\pmb { f } = ( 1 / 2 , 1 / 2 )$ and unscaled LBL equal to one. Panel (b) concentrates expert 1’s soft mass into two decisive wins while expert 2 wins four tokens 0.6–0.4, giving $\pmb { f }   =   ( 1 / 3 , 2 / 3 )$ $I _ { \mathrm { m a x } } ^ { \mathrm { r e q } }   =   4 / 3$ , and $\mathrm { L B L }   =   1 4 / 1 5$ Panel (c) draws all ten tokens in an extreme limit: one (1, 0) expert-1 win and nine $( 1 / 2 - \epsilon , 1 / 2 + \epsilon )$ expert-2 wins yield $\pmb { f } = ( 0 . 1 , 0 . 9 ) ,   P \rightarrow ( 0 . 5 5 , 0 . 4 5 )$ $I _ { \mathrm { m a x } } ^ { \mathrm { r e q } } = 1 . 8$ , and $\mathrm { L B L } \rightarrow 0 . 9 2$ . Panel (c)’s five-orange/five-teal dot patterns show the $\epsilon \rightarrow 0 ^ { + }$ limiting soft mass; their teal borders mark the strict expert-2 wins for every $\epsilon > 0$ . Dots belonging to the losing expert are soft scores, not selected routes. Exact zeros, ones, and $\epsilon \rightarrow 0 ^ { + }$ are boundary idealizations approachable with finite logits; the panels are feasible score tables, not a training trajectory, and the displayed values are counterexamples rather than minima.

Differentiating the final quadratic gives its minimum at $x = 1 / 4 ;$

对最后这个二次式求导, 最小点在 $x = 1/4$:

$$
\inf _ {x, \{\boldsymbol {p} _ {t} \}} \mathcal {L} _ {\mathrm{LBL}} = \frac {7}{8}, \qquad \boldsymbol {f} = \left(\frac {1}{4}, \frac {3}{4}\right).\tag{49}
$$

Thus the global score-level infimum has a 1:3 requested-load split, whereas perfect balance has value one. For the fixed 2:4 split in Equation 44, the infimum is $8 / 9 ;$ replacing the four (0.4, 0.6) rows by $( 1 / 2 - \epsilon , 1 / 2 + \epsilon )$ approaches that value.

所以分数层面的全局下确界对应 1:3 的请求负载划分, 而完全均衡的值是 1. 对式 (44) 中固定的 2:4 划分, 下确界是 $8/9$; 把那四行 (0.4, 0.6) 换成 $(1/2 - \epsilon, 1/2 + \epsilon)$ 就能逼近它.

The result is an infimum: a finite softmax cannot produce an exact zero or one, and strict top-1 assignment approaches the overloaded expert’s tie from one side. Finite T also discretizes x. The result concerns free per-token normalized score tables with compatible requested counts; it does not claim that every shared linear router attains a smooth finite-logit minimum. A balanced positive-margin assignment is a flat, non-strict local plateau with value one while its requested assignments remain unchanged; it is simply not the global score-level optimum.

这个结果是下确界: 有限 logit 的 softmax 给不出精确的 0 或 1, 严格的 top-1 分配也只能从一侧逼近过载 expert 的平局点. 有限的 $T$ 还会让 $x$ 离散化. 结论针对的是可以逐 token 自由取值, 且和请求计数相容的归一化分数表; 它不声称每个共享的线性 router 都能在有限 logit 下达到一个光滑的最小点. 一个带正分差的均衡分配, 在请求分配不变的范围内是值为 1 的平坦, 非严格局部平台; 它只是不是分数层面的全局最优.

<!-- page 79 of 168 -->

## 10.7.5 Token Gerrymandering Scales to Many Experts · expert 多时 Token Gerrymandering 更严重

The two-expert gap is bounded, but the same mechanism becomes much stronger with many experts. Choose A active experts and $D = N - A$ dead, or never-selected, experts. Route tokens uniformly among the active experts, so an active expert has $f _ { j } = 1 / A$ and a dead expert has $f _ { d } = 0$ . For $0 < \epsilon < 1$ , on a token routed to active expert $j ,$ choose the limiting score pattern

两个 expert 时差距有界, 但 expert 多了以后同一机制强得多. 取 $A$ 个活跃 expert 和 $D = N - A$ 个死 expert (从未被选中). 让 token 在活跃 expert 之间均匀路由, 于是活跃 expert 有 $f_j = 1/A$, 死 expert 有 $f_d = 0$. 对 $0 < \epsilon < 1$, 在路由到活跃 expert $j$ 的 token 上, 取极限分数模式

$$
p _ {t, j} = \frac {1 + D \epsilon}{D + 1}, \quad p _ {t, d} = \frac {1 - \epsilon}{D + 1} \text {for every dead expert} d, \quad p _ {t, r} \rightarrow 0 \text {for other active experts} r,\tag{50}
$$

then take $\epsilon \rightarrow 0 ^ { + }$ . These scores sum to one in the zero-tail limit, and expert $j$ beats every dead expert by ϵ. The dead experts collectively absorb almost all soft mass, but none is selected. An active expert wins only $1 / A$ of the tokens, so

再令 $\epsilon \to 0^+$. 在其余活跃 expert 分数趋于零的极限下, 这些分数和为 1, expert $j$ 以 $\epsilon$ 的优势胜过每个死 expert. 死 expert 合起来吸走几乎全部 soft 质量, 却一个也没被选中. 一个活跃 expert 只赢下 $1/A$ 的 token, 所以

$$
P _ {j} \longrightarrow \frac {1}{A (D + 1)} \quad \Longrightarrow \quad \mathcal {L} _ {\mathrm{LBL}} \longrightarrow \frac {N}{A (N - A + 1)}.\tag{51}
$$

For $N = 6 4$ and $A   =   1 6$ , the limiting loss is $6 4 / ( 1 6 \cdot 4 9 )   \approx   0 . 0 8 1 6 ,$ even though 48 experts are dead and $\begin{array} { r } { \overline { { I _ { \mathrm { m a x } } ^ { \mathrm { r e q } } } } = \frac { N } { A } = 4 } \end{array}$ . Choosing $A \approx ( N + 1 ) / 2$ makes the constructed value approximately $4 / N$ while roughly half the experts are unused. An even sharper asymptotic comparison takes $A \approx { \sqrt { N } }$ : then $\mathcal { L } _ { \mathrm { L B L } }   =   O ( N ^ { - 1 / 2 } )$ approaches zero while $I _ { \mathrm { m a x } } ^ { \mathrm { r e q } } = \Theta ( N ^ { 1 / 2 } )$ diverges and almost every expert is dead. These are feasible limiting constructions, not claims about the typical route distribution of a trained model. Figure 44b plots this family over the full range of A.

取 $N = 64$, $A = 16$, 极限损失为 $64/(16 \cdot 49) \approx 0.0816$, 而此时 48 个 expert 是死的, $I_{\max}^{\mathrm{req}} = N/A = 4$. 取 $A \approx (N+1)/2$, 构造值约为 $4/N$, 同时约一半 expert 没被用到. 更极端的渐近对比取 $A \approx \sqrt{N}$: 这时 $\mathcal{L}_{\mathrm{LBL}} = O(N^{-1/2})$ 趋于零, 而 $I_{\max}^{\mathrm{req}} = \Theta(N^{1/2})$ 发散, 几乎所有 expert 都是死的. 这些是可行的极限构造, 不是对训练后模型典型路由分布的断言. 图 44b 画出了这一族构造在 $A$ 全范围上的值.

The construction also extends to top-K. Select each token’s K winners uniformly from $A \geq K$ active experts. For $0 < \epsilon < 1 / K$ , give each winner score $( 1 + D \epsilon ) / ( D + K )$ , each dead expert score $( 1 - K \epsilon ) / ( D + K )$ , and the other active experts scores approaching zero, then take $\epsilon \rightarrow 0 ^ { + }$ . Every active expert has $f _ { j } = 1 / A$ and $P _ { j } \to K / [ A ( D + K ) ]$ , yielding

这个构造也能推广到 top-K. 每个 token 的 $K$ 个胜者从 $A \geq K$ 个活跃 expert 中均匀选出. 对 $0 < \epsilon < 1/K$, 给每个胜者分数 $(1 + D\epsilon)/(D + K)$, 每个死 expert 分数 $(1 - K\epsilon)/(D + K)$, 其余活跃 expert 分数趋于零, 再令 $\epsilon \to 0^+$. 每个活跃 expert 有 $f_j = 1/A$, $P_j \to K/[A(D + K)]$, 得到

$$
\mathcal {L} _ {\mathrm{LBL}} \longrightarrow \frac {N K}{A (N - A + K)}.\tag{52}
$$

The construction upper-bounds the general score-level infimum and is enough to refute uniform global optimality. We do not claim that Equation 52 is the exact optimum for arbitrary $( N , K , T )$ , tie breaking, grouped selection, or score-correction bias.

这个构造给一般的分数层面下确界提供了一个上界, 足以否定「均匀即全局最优」. 我们不声称式 (52) 在任意 $(N, K, T)$, 任意平局规则, 分组选择或分数修正偏置下都是精确最优.

The many-expert construction preserves the same requested-load/soft-mass anti-alignment as the two-expert example.

多 expert 构造保留了和两 expert 例子一样的「请求负载与 soft 质量反向」.

## 10.7.6 A Larger Scope Does Not Repair the Surrogate · 扩大统计范围修不好代理目标

Changing the balance scope leaves the scalar’s limitation intact. For any scope in which $f$ and $P$ are normalized over the same tokens, Equation 41 still holds. A global-batch LBL gives the router more tokens over which to satisfy the constraint; it does not turn $N f ^ { \mathsf { T } } P$ into a norm of global requested load. Instance-level balancing prevents cancellation between sequences, but it does not remove the anti-alignment construction within one sequence. Likewise, synchronized-microbatch, online-global, and exact optimizer-batch statistics change which tokens may compensate for one another without changing the signed cross-term itself.

改变均衡范围不会消除这个标量的局限. 只要 $f$ 和 $P$ 在同一批 token 上归一化, 式 (41) 就仍然成立. 全局 batch 的 LBL 给 router 更多 token 来满足约束, 但不会把 $N f^{\mathsf{T}} P$ 变成全局请求负载的范数. 实例级均衡防止了序列之间相互抵消, 却去不掉单条序列内部的反向构造. 同步微批, 在线全局, 精确优化器 batch 这几种统计方式也一样, 它们改变的是哪些 token 可以相互补偿, 带符号的交叉项本身不变.

## 10.8 Gradient Dynamics and the Joint Objective · 梯度动力学与联合目标

The requested counts are detached, so within a region where top-K assignments do not change, $f$ is constant. For top-1 softmax logits $z _ { t , i }$ , differentiating Equation 30 gives

请求计数被 detach 了, 所以在 top-K 分配不变的区域内, $f$ 是常数. 对 top-1 softmax 的 logit $z_{t,i}$, 对式 (30) 求导得

$$
\frac {\partial \mathcal {L} _ {\mathrm{LBL}}}{\partial z _ {t , i}} = \frac {N}{T} p _ {t, i} \left(f _ {i} - \boldsymbol {f} ^ {\top} \boldsymbol {p} _ {t}\right).\tag{53}
$$

For every token, the auxiliary gradient transfers soft mass toward experts whose requested load $f _ { i }$ is below the score-weighted average. This is the intended balancing pressure. A task-preferred, frequently selected expert can nevertheless remain the winner by an arbitrarily small margin while cold or dead experts absorb much of the differentiable mass. The gradient can therefore improve the surrogate faster than it improves the requested-selection histogram.

对每个 token, 辅助梯度把 soft 质量挪向请求负载 $f_i$ 低于分数加权平均的 expert. 这是设计中想要的均衡压力. 但一个任务偏好, 常被选中的 expert 仍可以只以任意小的分差保持胜出, 同时冷门或死 expert 吸走大部分可微质量. 所以梯度改善代理目标的速度, 可以快过它改善请求选择直方图的速度.

> 答: 在 top-K 分配不变的区域里是. 式 (53) 对每个 token 都把 soft 质量从 $f_i$ 高的 expert 挪向 $f_i$ 低的 expert, 挪的量正比于 $p_{t,i}$, 不看这个 token 当前的胜者和第二名之间分差多大. 只要胜者的分数还在第 $K+1$ 名之上, $f$ 就不变, 梯度会继续把质量挪给冷门和死 expert, 一直到某个 token 的排序翻转. 翻转之前, 每一步都在把 $P$ 往与 $f$ 反向的方向推, 也就是让式 (41) 的交叉项变负; 而交叉熵在同时奖励胜者保持胜出. 两股力合起来的稳态正是 10.7.5 节的构造: 胜者以很小分差赢, 死 expert 拿走 soft 质量. 所以 Gerrymandering 不需要 router 「主动学会作弊」, 它是式 (53) 在分配不变区内的自然走向; 能把 router 拉回均衡的只有排序真正翻转, $f$ 跳变的那一刻. 10.9 节建议监控 top-K 与 top-$(K+1)$ 的分差, 原因就在这里: 分差越小, 说明 soft 质量越多地堆在了没被选中的 expert 上.

<!-- page 80 of 168 -->

![Image block](images/p80-a-exact-two-expert-top-1-envelope.jpg)

(a) Exact two-expert, top-1 envelope

Underloaded expert's hard-route fraction x

![Image block](images/p80-figure-44-the-switch-style-scalar-can-prefer-imbalanced.jpg)

(b) Feasible construction with $N   =   6 4$ Requested imbalance N/A

Figure 44 The Switch-style scalar can prefer imbalanced requested routes. Panel (a): for two experts and top-1 routing, the fixed-load score-level infimum is $1 - x + 2 x ^ { 2 }$ . Its minimum is $7 / 8$ at a 1:3 route split; the supplied six-token score matrix lies above that envelope at $1 4 / 1 5 ,$ while perfect balance has value one. Panel (b): the limiting value $N / ( A ( N - A + 1 ) )$ of the explicit $N = 6 4$ construction in Equation 51 as the active-expert count A varies. The interior of the curve lies far below the balanced value of one while the requested imbalance $\overleftarrow { \frac { N } { A } }$ on the top axis grows; the marks show the $A = { \sqrt { N } }$ comparison, the worked $A = 1 6$ example, and the minimizing $A \approx ( N + 1 ) / 2$ . At both endpoints the scalar returns to exactly one, so even total collapse onto a single active expert matches the balanced score. Both panels are analytical; they contain no training measurements.

Routing boundaries make the dynamics discontinuous. When two scores cross, the hard vector $f$ changes abruptly and the gradient field is recomputed. A shared router may cross, cycle around, or avoid the limiting score tables above. The theory establishes feasible objective geometry; by itself it does not prove that stochastic gradient descent reaches a stable gerrymandered routing pattern.

路由边界让动力学不连续. 两个分数交叉时, 硬向量 $f$ 突变, 梯度场随之重算. 一个共享的 router 可能穿过, 绕着或避开上面那些极限分数表. 理论只确立了目标函数上的可行几何, 单凭它不能证明随机梯度下降会到达一个稳定的 gerrymandered 路由模式.

The connection to training appears only after restoring the auxiliary coefficient. Write the optimized objective as

只有把辅助系数加回来, 才能和训练联系起来. 把被优化的目标写成

$$
\mathcal {L} _ {\text {train}} = \mathcal {L} _ {\mathrm{CE}} + \lambda_ {\mathrm{LBL}} \mathcal {L} _ {\mathrm{LBL}} + \mathcal {L} _ {\text {other}},\tag{54}
$$

where $\mathcal { L } _ { \mathrm { C E } }$ is next-token cross-entropy (CE) and $\mathcal { L } _ { \mathrm { o t h e r } }$ contains every other enabled term, such as a router z-loss (Zoph et al., 2022) or language-model z-loss (Chowdhery et al., 2023). Compare the model before and after a routing transition on the same evaluation batch with fixed loss normalization. If the transition hurts language modeling but reduces LBL, then

其中 $\mathcal{L}_{\mathrm{CE}}$ 是 next-token 交叉熵 (CE), $\mathcal{L}_{\mathrm{other}}$ 包含其他所有启用的项, 例如 router z-loss (Zoph et al., 2022) 或语言模型 z-loss (Chowdhery et al., 2023). 在同一个评测 batch 上, 用固定的损失归一化, 比较一次路由转变前后的模型. 若这次转变损害了语言建模, 却降低了 LBL, 则

$$
\Delta \mathcal {L} _ {\mathrm{CE}} > 0, \quad \Delta \mathcal {L} _ {\mathrm{LBL}} <   0.\tag{55}
$$

The post-transition model has a lower scalar objective exactly when

转变后的模型标量目标更低, 当且仅当

$$
\Delta \mathcal {L} _ {\text {train}} <   0 \quad \Longleftrightarrow \quad \lambda_ {\mathrm{LBL}} (- \Delta \mathcal {L} _ {\mathrm{LBL}}) > \Delta \mathcal {L} _ {\mathrm{CE}} + \Delta \mathcal {L} _ {\text {other}}.\tag{56}
$$

Whether an LBL coefficient is high depends on the net CE and other-term cost of a reachable routing transition, the number of routed layers contributing auxiliary loss, and the implementation’s layer and microbatch normalization; there is no universal numerical threshold. A larger coefficient does not change the minimizers of LBL alone; it changes which compromises lower the joint objective. When such a compromise wins, the observable pattern is the **surrogate-hacking signature**: the optimized objective falls while both language-modeling loss and requested imbalance worsen. This before-and-after comparison is not an optimizer-dynamics theorem: momentum and stochastic gradients need not lower the instantaneous loss of every training batch, and losses from different batches do not define the deltas above.

一个 LBL 系数算不算高, 取决于一次可达的路由转变在 CE 和其他项上的净代价, 贡献辅助损失的路由层数, 以及实现里按层, 按微批的归一化方式; 不存在通用的数值阈值. 系数更大并不改变 LBL 单独的最小点, 它改变的是哪些折中能降低联合目标. 当这样的折中胜出时, 能观察到的模式就是 **代理目标被钻空子的特征**: 被优化的目标在下降, 语言建模损失和请求不均衡度却都在变差. 这种前后对比不是优化器动力学定理: 动量和随机梯度不一定降低每个训练 batch 的瞬时损失, 而不同 batch 上的损失也定义不了上面的差值.

<!-- page 81 of 168 -->

## 10.8.1 Empirical Signature of Reachable Collapse · 可达塌缩的实测特征

The score-level constructions do not show that stochastic training reaches a gerrymandered routing pattern. Figure 45 provides a checkpoint-branched test in a 48-layer, 64-expert, top-4 MoE. The original trajectory uses instance-level LBL with $\lambda_{ LBL } = 0.05$ . At step 17,000 (71.3 billion training tokens), before the observed divergence, a second trajectory reloads the same model and optimizer checkpoint and changes the coefficient to 0.005. This intervention controls the starting point more tightly than an independent-from-scratch coefficient sweep. Dispatch is dropless in these runs, so requested counts are also the executed expert loads. Block 0 is dense, so the logged global LBL is the sum over 47 MoE blocks; the logged global load imbalance is the worst max/mean expert count over those blocks and distributed ranks. Appendix B.7 records the full run recipe and the archived-history provenance.

分数层面的构造并不说明随机训练会走到 gerrymandered 路由模式. 图 45 在一个 48 层, 64 expert, top-4 的 MoE 上做了 checkpoint 分叉测试. 原始轨迹用实例级 LBL, $\lambda_{\mathrm{LBL}} = 0.05$. 在第 17,000 步 (71.3B 训练 token), 观察到的发散出现之前, 第二条轨迹重新加载同一份模型和优化器 checkpoint, 把系数改为 0.005. 和从零开始的独立系数扫描相比, 这种干预对起点控制得更严. 这些运行里 dispatch 不丢路由, 所以请求计数也就是实际执行的 expert 负载. 第 0 块是 dense 的, 所以记录下来的全局 LBL 是 47 个 MoE 块的和; 记录的全局负载不均衡度是这些块和各分布式 rank 上 max/mean expert 计数的最差值. 完整的运行配方和归档历史的来源见附录 B.7.

![Image block](images/p81-figure-45-checkpoint-branched-training-with-different-lbl-coefficients.jpg)

Figure 45 Checkpoint-branched training with different LBL coefficients. With the higher coefficient, the surrogate falls while CE and imbalance rise. Orange shows the original $\lambda _ { \mathrm { L B L } } = 0 . 0 5$ trajectory; blue shows the branch that reloads the step-17,000 checkpoint with $\lambda_{ LBL } = 0.005$ . After the checkpoint branch, the high-coefficient trajectory eventually develops worsening CE and sharply rising worst-block/rank max/mean expert-count imbalance even as its unscaled LBL falls. The low-coefficient branch instead continues improving CE while its LBL and imbalance remain stable. Light traces show every raw training measurement; thick traces use a time-weighted exponential moving average (TWEMA) with a 0.75-billion-token half-life. The dotted vertical line marks the step-17,000 branch point. This is a checkpoint-branched result for one configuration, not a universal coefficient threshold.

<table><tr><td rowspan="2">Median over window</td><td colspan="3">High coefficient ( $\lambda_{LBL} = 0.05$ )</td><td colspan="3">Low-coefficient branch (0.005)</td></tr><tr><td>Early</td><td>Late</td><td>Change</td><td>Early</td><td>Late</td><td>Change</td></tr><tr><td>CE loss</td><td>2.473</td><td>2.523</td><td>+2.0%</td><td>2.469</td><td>2.358</td><td>-4.5%</td></tr><tr><td>Unscaled LBL sum</td><td>46.864</td><td>41.278</td><td>-11.9%</td><td> $\approx 47$ </td><td> $\approx 47$ </td><td>stable</td></tr><tr><td>Worst-case load imbalance</td><td>2.748</td><td>6.317</td><td>+129.9%</td><td>2.655</td><td>2.544</td><td>-4.2%</td></tr></table>

The unscaled LBL and CE curves in Figure 45 have different weights in the optimized objective. Figure 46 combines them with those weights for the high-coefficient trajectory.

图 45 里未缩放的 LBL 曲线和 CE 曲线在被优化的目标里权重不同. 图 46 对高系数轨迹按这些权重把两者合起来.

<!-- page 82 of 168 -->

![Image block](images/p82-figure-46-the-reconstructed-objective-decreases-despite-worsening-ce.jpg)

Figure 46 The reconstructed objective decreases despite worsening CE. This panel shows only the original $\lambda _ { \mathrm { L B L } } = 0 . 0 5$ trajectory; black, purple, and green now denote the total and its distinct components rather than different coefficient settings. Across the collapse interval, the decrease in coefficient-weighted LBL more than offsets the increase in CE, so the reconstructed optimized objective—CE plus weighted LBL plus the enabled LM-head z-loss—continues downward. Light traces show every raw training measurement; thick traces use a TWEMA with a 0.75-billion-token half-life.

Over the same windows, the effective weighted LBL contribution falls from 2.343 to 2.064, enough for the reconstructed optimized objective to decrease from 4.820 to 4.591 (−4.8%) despite the CE regression. Olmo injects LBL through a custom autograd term rather than adding it to one monolithic forward-loss scalar. The plotted objective therefore reconstructs the optimized scalar from the separately logged CE, coefficientweighted LBL, and LM-head z-loss. Router z-loss is disabled in these runs.

在同样的窗口里, 加权后的有效 LBL 贡献从 2.343 降到 2.064, 足以让重建的被优化目标从 4.820 降到 4.591 (−4.8%), 尽管 CE 变差了. Olmo 通过一个自定义 autograd 项注入 LBL, 没有把它加进一个整体的前向损失标量里. 所以图中的目标是用分别记录的 CE, 加权 LBL 和 LM-head z-loss 重建出来的被优化标量. 这些运行关闭了 router z-loss.

This establishes reachability of the predicted surrogate-hacking signature for this configuration: training can lower the effective objective while making both language modeling and routed workload worse. It does not locate a universal coefficient threshold or establish how frequently the failure occurs. These are also stochastic training-batch curves rather than losses reevaluated on one fixed batch, and the archived metrics do not contain same-scope f and P vectors. Attributing the trajectory to the exact hard/soft anti-alignment construction would require the centered term in Equation 41, or equivalent evidence from soft mass on never-selected experts and top-K–top-(K + 1) margins. A lower LBL scalar did not certify a more balanced expert workload.

这确立了在这个配置下, 预测的代理目标被钻空子的特征是可达的: 训练可以在降低有效目标的同时, 让语言建模和路由工作负载都变差. 它没有找出通用的系数阈值, 也没有确定这种失效多常发生. 这些曲线是随机训练 batch 上的值, 不是在一个固定 batch 上重新评估的损失, 而且归档指标里没有同一范围的 $f$ 和 $P$ 向量. 要把这条轨迹归因于精确的硬/软反向构造, 需要式 (41) 的中心化项, 或者来自从未被选中 expert 上的 soft 质量, top-K 与 top-$(K+1)$ 分差的等价证据. 更低的 LBL 标量并不证明 expert 工作负载更均衡.

> **回看:** 图 45 下方的表里, 高系数轨迹的 LBL 和从 46.864 降到 41.278, 47 个块平均每块约 0.878, 低于 1; 按式 (41), 这是不是已经证明了反向对齐, 用不着再要 $f$ 和 $P$ 向量?
> 答: 证明了反向对齐存在, 证明不了是哪种构造. 式 (41) 对任一个 $f$, $P$ 在同一批 token 上归一化的范围都成立, 单块值低于 1 当且仅当该范围内中心化内积为负. 这里用的是实例级 LBL, 记录值若是各序列单独算式 (30) 再平均, 那么平均低于 1 意味着至少有一部分序列, 在至少一部分块里, $f - u$ 和 $P - u$ 反向. 所以「交叉项为负」这件事, 归档的标量已经给出了. 报告说还缺的, 准确说是两个范数 $\|f - u\|_2$ 和 $\|P - u\|_2$: 交叉项为负既可能来自 10.7.5 节那种死 expert 吸走 soft 质量的构造, 也可能来自 10.7.3 节那种两边偏差都不大的温和反向. 不均衡度从 2.748 涨到 6.317 说明 $\|f - u\|$ 在变大, 但 $P$ 是否堆到了从未被选中的 expert 上, 标量里看不出来. 另外低系数分支稳定在约 47, 即每块约 1, 对应式 (41) 里交叉项接近零; 不均衡度在 2.5 左右, $f$ 并不均匀, 所以要么 $P$ 接近均匀, 要么两者偏差近乎正交, 标量分不出这两种情况. 记录值具体怎么在序列和块上聚合, 报告没写, 上面的推断假设它是逐序列算式 (30) 再平均.

## 10.9 Measuring Routing Transients and Outcomes · 测量路由的瞬态与结果

Routing is nonstationary, especially early in training. A router can move from near-random assignments through sharp transients before reaching a more stable distribution, and both capacity utilization and step time can move with it. Uniform or random expert assignment is useful for isolating an optimistic balanced systems path, but it is not a substitute for trained routing. Interpreting throughput therefore requires knowing whether the routes are artificially balanced, early-transient, or drawn from a declared stable training window. Three diagnostic questions connect those routing conditions to the model and systems outcomes.

路由是非平稳的, 训练早期尤其如此. router 可能从接近随机的分配出发, 经过剧烈的瞬态, 才到达较稳定的分布, 容量利用率和 step 时间都可能跟着变. 均匀或随机的 expert 分配适合用来隔离一条乐观的均衡系统路径, 但替代不了训练出来的路由. 所以解读吞吐时, 要知道路由是人为均衡的, 处在早期瞬态, 还是取自一个明确声明的稳定训练窗口. 下面三个诊断问题把这些路由条件和模型, 系统上的结果联系起来.

**What did the router request, and what did capacity admit?** $C ^ { \mathrm { r e q } }$ records selected top-K routes before capacity, and $C ^ { \mathrm { k e e p } }$ records the rows admitted for expert execution. When no route is dropped the two hard histograms coincide. Otherwise both histograms are needed. Route-drop rate, the fraction of tokens losing at least one or all selected routes, selected weight removed by dropping, and receiving-buffer utilization describe how capacity changed the workload and removed model contributions.

**router 请求了什么, 容量放行了什么?** $C^{\mathrm{req}}$ 记录容量之前选中的 top-K 路由, $C^{\mathrm{keep}}$ 记录放行去做 expert 计算的行. 没有路由被丢时两份硬直方图相同, 否则两份都要看. 路由丢弃率, 至少丢一条或全丢的 token 占比, 因丢弃而去掉的已选权重, 以及接收 buffer 利用率, 描述容量如何改变了工作负载, 去掉了多少模型贡献.

<!-- page 83 of 168 -->

**Which experts or ranks became bottlenecks?** Max/mean and a full-distribution statistic for requested expert counts, the number of never-selected experts, and the maximum requested load on one expert-parallel rank distinguish expert concentration from rank pressure. The corresponding kept-count statistics describe the work that actually ran. Grouped-GEMM and step time connect kept counts to computation; the source– destination request matrix and rank waiting connect demand and admitted work to communication and straggling.

**哪些 expert 或 rank 成了瓶颈?** 请求 expert 计数的 max/mean 和一个覆盖全分布的统计量, 从未被选中的 expert 数, 以及单个 expert 并行 rank 上的最大请求负载, 用来区分 expert 集中和 rank 压力. 对应的保留计数统计量描述实际跑了的工作. grouped GEMM 时间和 step 时间把保留计数和计算联系起来; 源到目标的请求矩阵和 rank 等待时间把需求, 放行的工作和通信, 拖尾联系起来.

**Did balance improve, or only the surrogate?** The soft mean P summarizes differentiable router mass rather than selected or executed routes. Diagnosing Token Gerrymandering requires the requested hard fraction f and soft mean P from the same routed layer and load-balancing scope. Their centered inner product, together with $\| \boldsymbol { f } - \boldsymbol { u } \| _ { 2 }$ and $\| P - u \| _ { 2 }$ , separates anti-alignment from the magnitude of each deviation; top-K–top-$( K   +   1 )$ margins and soft mass on never-selected experts provide complementary evidence. Pearson correlation alone is insufficient because it is undefined when either vector is uniform and discards the magnitudes that determine LBL.

**改善的是均衡, 还是只有代理目标?** soft 均值 $P$ 汇总的是可微的 router 质量, 不是选中或执行的路由. 诊断 Token Gerrymandering 需要来自同一路由层, 同一负载均衡范围的请求硬占比 $f$ 和 soft 均值 $P$. 它们的中心化内积, 加上 $\|f - u\|_2$ 和 $\|P - u\|_2$, 能把「方向相反」和「各自偏离多少」分开; top-K 与 top-$(K+1)$ 的分差, 以及从未被选中 expert 上的 soft 质量, 提供补充证据. 只看 Pearson 相关不够: 任一向量均匀时它没有定义, 而且它丢掉了决定 LBL 的那些幅度.

The effect on the optimized objective depends on the effective LBL contribution after layer and microbatch normalization, together with every enabled auxiliary term. An unscaled LBL curve beside CE can disprove the scalar’s use as a balance certificate, but it cannot establish why the optimizer preferred a transition.

对被优化目标的影响, 取决于按层和按微批归一化之后的有效 LBL 贡献, 以及所有启用的辅助项. 把未缩放的 LBL 曲线和 CE 放在一起, 可以否定把这个标量当作均衡证明, 但不能说明优化器为什么偏好某次转变.

The evidence in this section establishes the objective geometry, the fixed-work grouped-GEMM sensitivity, and the reachability of the surrogate-hacking signature in one checkpoint-branched training comparison. The requested and kept workloads, rather than the auxiliary scalar alone, connect routing to the expert GEMMs and communication that the training system executes.

本节的证据确立了三件事: 目标函数的几何, 固定工作量下 grouped GEMM 的敏感度, 以及在一组 checkpoint 分叉训练对比中代理目标被钻空子的特征是可达的. 把路由和训练系统实际执行的 expert GEMM, 通信联系起来的, 是请求和保留的工作负载, 不是辅助标量本身.

## 11 MXFP8 Training · MXFP8 训练

Routing determines which expert GEMMs run and how their work is distributed. MXFP8 changes the precision and volume of the operands those GEMMs compute with and communicate.

路由决定跑哪些 expert GEMM, 以及它们的工作怎样分布. MXFP8 改变的是这些 GEMM 计算和通信所用操作数的精度和数据量.

**Microscaling (MX)** formats pair a low-precision payload with one shared power-of-two scale per small block of values; MXFP8 is the member with an FP8 payload and 32-value blocks, standardized by the Open Compute Project (OCP) together with the FP8 payload formats (Micikevicius et al., 2022; Rouhani et al., 2023; Open Compute Project, 2023). In training, MXFP8 requires changes to operand quantization, scale layouts, saved activations, expert transport, and weight refresh after each optimizer update. Those changes can accelerate sufficiently large GEMMs, reduce storage for selected saved activations, and shrink expertcommunication payloads. They also add conversion, layout, transport-management, caching, and backward work. Section 11.1 quantifies the potential savings and explains why persistent training-state memory stays approximately unchanged.

**Microscaling (MX)** 格式给低精度载荷的每一小块值配一个共享的 2 的幂 scale; MXFP8 是其中载荷为 FP8, 块大小为 32 的成员, 由 Open Compute Project (OCP) 和 FP8 载荷格式一起标准化 (Micikevicius et al., 2022; Rouhani et al., 2023; Open Compute Project, 2023). 训练中用 MXFP8, 要改操作数量化, scale 布局, 保存的激活, expert 传输, 以及每次优化器更新后的权重刷新. 这些改动能加速足够大的 GEMM, 减少部分保存激活的存储, 缩小 expert 通信的载荷. 它们也带来额外的格式转换, 布局, 传输管理, 缓存和反向计算. 11.1 节量化可能的节省, 并解释为什么持久的训练状态显存基本不变.

Blackwell is the main hardware target for the implementation described here. Hopper supports FP8 Tensor Core operations; Blackwell adds native support for the 32-value, E8M0-scaled block representation used by MXFP8 (Open Compute Project, 2023; NVIDIA, 2026p). The Tensor Core operation can consume quantized operands and their block scales together. Software must still create both components in the layouts expected by the instruction.

这里描述的实现主要面向 Blackwell. Hopper 支持 FP8 Tensor Core 运算; Blackwell 在此之上原生支持 MXFP8 所用的 32 值一块, E8M0 scale 的块表示 (Open Compute Project, 2023; NVIDIA, 2026p). Tensor Core 运算可以同时读入量化操作数和它们的块 scale. 但两部分仍要由软件按指令要求的布局生成.

Table 21 separates ordinary FP8 support from native MXFP8 support. Hopper accelerates E4M3 and E5M2 FP8, but it does not provide the block-scaled matrix instruction that consumes an E8M0 scale per 32 payload values. The Blackwell variants in the table do. Their instruction families differ: data-center Blackwell uses tcgen05.mma, while SM120 RTX Blackwell exposes block scaling through mma.sync.

表 21 区分普通 FP8 支持和原生 MXFP8 支持. Hopper 能加速 E4M3 和 E5M2 FP8, 但没有每 32 个载荷值读一个 E8M0 scale 的块 scale 矩阵指令. 表中的 Blackwell 各型号都有. 它们的指令族不同: 数据中心 Blackwell 用 tcgen05.mma, SM120 的 RTX Blackwell 通过 mma.sync 提供块 scale.

<!-- page 84 of 168 -->

<table><tr><td rowspan="2">GPU</td><td rowspan="2">CC</td><td colspan="3">Dense peak (TFLOP/s)</td><td rowspan="2">Native MXFP8</td><td rowspan="2">Matrix-instruction family</td></tr><tr><td>BF16</td><td>FP8</td><td>FP4</td></tr><tr><td>H100 SXM</td><td>9.0</td><td>989.5</td><td>1979</td><td>—</td><td>No</td><td>wmma.mma_async</td></tr><tr><td>HGX B200, per GPU</td><td>10.0</td><td>2250</td><td>4500</td><td>9000</td><td>Yes</td><td>tcgen05.mma block_scale</td></tr><tr><td>HGX B300, per GPU</td><td>10.3</td><td>2250</td><td>4500</td><td>13500</td><td>Yes</td><td>tcgen05.mma block_scale</td></tr><tr><td>RTX PRO 6000 Blackwell, 600 W</td><td>12.0</td><td>503.8</td><td>1007.6</td><td>2015.2</td><td>Yes</td><td>mma.sync block_scale</td></tr></table>

**Table 21 FP8 support alone does not imply native MXFP8 support.** Peak columns report dense theoretical Tensor Core TFLOP/s. H100 dense values are half of NVIDIA’s published 2:4-sparse figures. HGX B200/B300 system figures are normalized to one of eight GPUs and to dense execution; the HGX page lists FP8 and BF16 as sparse peaks with dense as half, and lists FP4 as both sparse and dense values for B200 and B300. The RTX row uses the Workstation Edition 600-W specifications. Compute capabilities and precision support follow NVIDIA’s TensorRT matrix; instruction names follow the CUTLASS and PTX documentation (NVIDIA, 2026q,r, 2025b, 2026v,j, 2025a).

## 11.1 Benefits of MXFP8 Training · MXFP8 训练的收益

## Where MXFP8 Saves Time and Memory · MXFP8 在哪里省时间和显存

MXFP8 can make large GEMMs faster, selected saved activations smaller, and expert communication lighter. Persistent memory grows slightly instead: the recipe retains two quantized weight orientations alongside the FP32 main weights and optimizer states.

MXFP8 能让大 GEMM 更快, 部分保存的激活更小, expert 通信更轻. 持久显存反而略有增加: 这套配方在 FP32 主权重和优化器状态之外, 还保留了两个方向的量化权重.

## 11.1.1 Faster GEMMs · 更快的 GEMM

A BF16 GEMM uses two bytes per input value and the BF16 Tensor Core path. The Olmo MXFP8 recipe uses one E4M3 payload byte per value plus block scales, and on Blackwell GPUs it uses the higher-throughput FP8 Tensor Core path. Peak Tensor Core specifications list an exact 2× FP8-to-BF16 ratio on both Hopper and Blackwell (Table 21) (NVIDIA, 2026q,r). That ratio is an arithmetic ceiling, not an end-to-end speedup: quantization (Q), dequantization (DQ), scale construction, layout conversion, kernel launches, small GEMMs, communication, and all non-GEMM work remain on the step timeline.

BF16 GEMM 每个输入值占两个字节, 走 BF16 Tensor Core 路径. Olmo 的 MXFP8 配方每个值用一个 E4M3 载荷字节外加块 scale, 在 Blackwell GPU 上走吞吐更高的 FP8 Tensor Core 路径. Tensor Core 峰值规格在 Hopper 和 Blackwell 上给出的 FP8 对 BF16 比都正好是 2 倍 (表 21) (NVIDIA, 2026q,r). 这个比值是算术上限, 不是端到端加速比: 量化 (Q), 反量化 (DQ), scale 构造, 布局转换, kernel launch, 小 GEMM, 通信以及所有非 GEMM 工作都还在 step 时间线上.

Figure 47 contrasts the operands supplied to the BF16 and native MXFP8 Tensor Core paths. The BF16 path consumes two BF16 matrices. The MXFP8 path consumes E4M3 qdata together with one E8M0 scale per 32 values along the reduction dimension. On Blackwell, the instruction-level primitive is a fifth-generation Tensor Core matrix multiply–accumulate (MMA): the MXFP8 path uses the block-scaled tcgen05.mma family. The scale shapes in the figure are the logical pre-swizzle grids; the physical blocked layouts consumed by the instruction are more specialized. Appendix A.5 separates the PyTorch operator, GEMM kernel, and Tensor Core instruction interfaces in more detail.

图 47 对比 BF16 和原生 MXFP8 两条 Tensor Core 路径的输入操作数. BF16 路径读两个 BF16 矩阵. MXFP8 路径读 E4M3 qdata, 以及沿收缩维每 32 个值一个的 E8M0 scale. 在 Blackwell 上, 指令级原语是第五代 Tensor Core 的矩阵乘累加 (MMA): MXFP8 路径用带块 scale 的 tcgen05.mma 指令族. 图中的 scale 形状是 swizzle 之前的逻辑网格, 指令实际读的物理分块布局更特殊. 附录 A.5 更细地区分了 PyTorch 算子, GEMM kernel 和 Tensor Core 指令三层接口.

The attainable speedup depends on shape. Large dense GEMMs can amortize operand quantization and scale-layout work over substantial matrix multiplication. A routed layer may instead present many smaller expert GEMMs, where the same fixed work occupies a larger fraction of kernel time. Weight quantization is easier to amortize because its caches are rebuilt after an optimizer update and reused across the following microbatches. Activation quantization is paid on each invocation.

能拿到多少加速取决于形状. 大的 dense GEMM 能把操作数量化和 scale 布局的开销摊到大量矩阵乘上. 路由层给出的可能是许多较小的 expert GEMM, 同样的固定开销在 kernel 时间里占比更高. 权重量化更容易摊销, 因为它的缓存在优化器更新后重建一次, 之后的各个微批都能复用. 激活量化则每次调用都要付一次.

## 11.1.2 Smaller Saved Activations · 更小的保存激活

For a block of 32 values, the nominal MXFP8 representation contains 32 bytes of E4M3 qdata and one byte of E8M0 scale. Ignoring blocked-layout padding, its storage per value is

对一块 32 个值, 名义上的 MXFP8 表示包含 32 字节 E4M3 qdata 和 1 字节 E8M0 scale. 不计分块布局的 padding, 每个值的存储为

$$
B _ {\mathrm{MXFP8}} = 1 + \frac {1}{3 2} = \frac {3 3}{3 2} \quad \text {bytes / value},\tag{57}
$$

compared with two bytes per BF16 value. Replacing a unique BF16 saved tensor with this representation saves 31/32 bytes per value, a nominal reduction of $1 - 33/64 \approx 48.4\%$ . If another operator already keeps

<!-- page 85 of 168 -->

![Image block](images/p85-figure-47-bf16-and-native-mxfp8-tensor-core-paths.jpg)

Figure 47 BF16 and native MXFP8 Tensor Core paths. For $A \in \mathbb { R } ^ { M \times K }$ and $B \in \mathbb { R } ^ { K \times N }$ , the MXFP8 operation consumes E4M3 qdata and logical scale grids of shape $M \times ( K / 3 2 )$ and $( K / 3 2 ) \times N$ before scale swizzling. $`` \mathrm{MMA''}$ names the native Tensor Core operation accurately: Blackwell provides tcgen05.mma instructions with the kind::mxf8f6f4 and block\_scale modifiers for this computation. Olmo invokes the higher-level scaled\_mm operator, whose kernel includes the MMA main loop and an epilogue that converts the accumulator to the requested BF16 output. Thus, BF16 labels the completed operator output, not the raw MMA accumulator.

the same BF16 activation alive, adding an MXFP8 copy instead costs another 33/32 bytes per value. The implementation must therefore determine whether another operator already retains each BF16 tensor before choosing its saved precision. In our attention path, for example, the QKV projection and output projection use different save policies because their BF16 inputs are retained by different parts of the backward graph. Figure 58 (Section 11.4) shows the resulting boundary between forward-time packing and backward-time unpacking.

而 BF16 每个值两个字节. 把一个只此一份的 BF16 保存张量换成这种表示, 每个值省 31/32 字节, 名义降幅 $1 - 33/64 \approx 48.4\%$. 如果另一个算子本来就让同一份 BF16 激活一直活着, 再加一份 MXFP8 副本反而要每个值多花 33/32 字节. 所以实现在选择保存精度之前, 必须先判断每个 BF16 张量是否已被别的算子保留. 以我们的注意力路径为例, QKV 投影和输出投影用了不同的保存策略, 因为它们的 BF16 输入分别被反向图里不同的部分保留着. 图 58 (11.4 节) 画出了由此形成的前向打包与反向解包之间的边界.

## 11.1.3 Smaller Dispatch and Combine Payloads · 更小的 dispatch 与 combine 载荷

Rowwise EP normally moves one hidden row for each routed token–expert assignment. A BF16 row of width d carries 2d payload bytes. When d is a multiple of 32, its nominal MXFP8 representation carries $d + d / 3 2 = 3 3 d / 3 2$ bytes, again a 48.4% reduction in the row payload.

rowwise EP 通常为每个路由的 token-expert 分配搬运一行 hidden 向量. 宽为 $d$ 的 BF16 行载荷是 $2d$ 字节. 当 $d$ 是 32 的倍数时, 它名义上的 MXFP8 表示是 $d + d/32 = 33d/32$ 字节, 行载荷同样减少 48.4%.

This does not halve the whole communication operation. Route indices, route weights, counters, and synchronization are unchanged. Qdata and scales also need destinations and transfers of their own. MXFP8 reduces the numerical payload for dispatch and combine, and that reduction is useful when the saved transport time exceeds the added quantization, scale, and transfer-management work.

这并不让整个通信操作减半. 路由下标, 路由权重, 计数器和同步都不变. qdata 和 scale 还各自需要目标地址和单独的传输. MXFP8 减少的是 dispatch 和 combine 的数值载荷; 只有省下的传输时间超过新增的量化, scale 和传输管理开销时, 这个减少才有用.

## 11.1.4 Persistent Training-State Memory · 持久的训练状态显存

Each linear weight is consumed in two orientations. Forward computes with $W ^ { \top }$ , while dgrad computes with W. Each orientation needs its own qdata and scale layout. We call these qdata-and-scale representations **MXFP8 compute-weight caches**, or simply **weight caches** in this section. At nominal storage, the two MXFP8 views require $2 \times 3 3 / 3 2   =   2 . 0 6 2 5$ bytes per original weight value. This is 3.125% more than one two-byte BF16 compute weight even before blocked-scale padding.

每个线性层权重要以两个方向被使用. 前向用 $W^{\top}$ 计算, dgrad 用 $W$ 计算. 每个方向都需要自己的 qdata 和 scale 布局. 本节把这些 qdata 加 scale 的表示叫作 **MXFP8 计算权重缓存**, 简称 **权重缓存**. 按名义存储算, 两个 MXFP8 视图对每个原始权重值需要 $2 \times 33/32 = 2.0625$ 字节. 还没算分块 scale 的 padding, 就已经比一份两字节的 BF16 计算权重多 3.125%.

> **确认:** 为什么不能只存一份 MXFP8 权重, dgrad 时转置一下就用?
> 答: 因为 MX 的 scale 块是沿收缩维划的 (11.1.1 节, 图 47: scale 网格是 $M \times (K/32)$ 和 $(K/32) \times N$). 前向 $Y = X W^{\top}$ 沿 $d_{\mathrm{in}}$ 收缩, $W$ 的 32 值块要沿 $d_{\mathrm{in}}$ 划; dgrad $\nabla X = \nabla Y W$ 沿 $d_{\mathrm{out}}$ 收缩, 块要沿 $d_{\mathrm{out}}$ 划. 两种划法下每个 scale 覆盖的 32 个元素完全不同, 转置 qdata 不会得到另一种划法的合法表示; 要从一份 MXFP8 再量化出另一份, 又会叠加两次舍入误差. 所以只能从 BF16 (或 FP32 主权重) 各量化一次, 存两份. 同一个约束也落在 Wgrad 上: $\nabla W_e = X_e^{\mathsf{T}} \nabla Y_e$ 沿 $M_e$ 收缩 (表 15), 块要沿 token 维划, 而 rowwise buffer 里各 expert 的段按真实 $M_e$ 紧密排列, $M_e$ 不一定是 32 的倍数, 32 值块会跨过 expert 边界. 这可能是 9.5 节说当前 Wgrad 退回 BF16 grouped GEMM 的原因之一; 具体理由报告放在 11.3 节, 本段范围内没写, 跨边界这一条只是推出的说法, 没有数据验证.

Our optimizer also retains an FP32 main weight and FP32 optimizer states. After the MXFP8 caches have been initialized, the full BF16 initialization anchor can be released, but the two caches take its place. MXFP8 therefore does not remove the persistent training-state memory wall by itself. EP, PP, and distributed optimizer sharding remain responsible for dividing parameters, gradients, and optimizer tensors, as described in Part II.

我们的优化器还保留 FP32 主权重和 FP32 优化器状态. MXFP8 缓存初始化之后, 完整的 BF16 初始化副本可以释放, 但两份缓存占了它的位置. 所以 MXFP8 本身拆不掉持久训练状态的显存墙. 参数, 梯度和优化器张量的切分仍要靠 EP, PP 和分布式优化器分片, 见第二部分.

Figure 48 compares the two recipes. MXFP8 replaces a two-byte BF16 compute weight with two cache orientations of nearly the same combined size, so the composition of persistent training state changes while its total stays approximately constant.

图 48 对比两套配方. MXFP8 用两个方向的缓存替换一份两字节的 BF16 计算权重, 两份缓存合起来大小几乎相同, 所以持久训练状态的构成变了, 总量大致不变.

<!-- page 86 of 168 -->

![Image block](images/p86-figure-48-persistent-memory-with-bf16-weights-and-two.jpg)

Figure 48 Persistent memory with BF16 weights and two MXFP8 weight caches. Nominal bytes per parameter: both recipes keep the FP32 main weight and two FP32 Adam moments; the BF16 recipe adds one two-byte compute weight, while the MXFP8 recipe replaces it with the forward and dgrad weight caches at 33/32 bytes each. Gradient buffers are identical in both recipes and excluded, and blocked-scale padding is ignored. Conceptual illustration of the nominal accounting with no measured quantities.

## 11.2 Understanding the MXFP8 Format · 理解 MXFP8 格式

An MXFP8 tensor is defined by more than its one-byte E4M3 payload. Its E8M0 scales, the number of payload values that share each scale, and the physical scale layout consumed by a particular operand role are equally important. These details explain why conversion has separate quantization and swizzle costs, why qdata and scales cross operator boundaries together, and why native MXFP8 GEMM requires Blackwell specific hardware support. Figure 49 compares the bit layouts involved: the BF16 baseline, the two payload formats the OCP MX specification permits, and the E8M0 scale.

一个 MXFP8 张量不只由一字节的 E4M3 载荷决定. 它的 E8M0 scale, 共用一个 scale 的载荷值个数, 以及某个操作数角色所读的 scale 物理布局, 同样重要. 这些细节解释了: 为什么格式转换要分别付量化和 swizzle 两份开销, 为什么 qdata 和 scale 总是一起跨过算子边界, 以及为什么原生 MXFP8 GEMM 需要 Blackwell 特有的硬件支持. 图 49 对比涉及的位布局: BF16 基线, OCP MX 规范允许的两种载荷格式, 以及 E8M0 scale.

![Image block](images/p86-figure-49-bit-layouts-of-the-baseline-payload-and.jpg)

Figure 49 Bit layouts of the baseline, payload, and scale formats. BF16 keeps eight exponent bits and seven mantissa bits. The E4M3 payload trades exponent range for mantissa precision; E5M2 makes the opposite trade and is permitted by OCP MX but unused in the Olmo recipe. The E8M0 scale is an exponent-only format: one unsigned power of two per 32-value block, with no sign and no mantissa.

## 11.2.1 Quantization, Dequantization, and Swizzle · 量化, 反量化与 swizzle

For a BF16 block x, quantization selects a power-of-two scale s and stores

对一个 BF16 块 $x$, 量化选一个 2 的幂 scale $s$, 存下

$$
q = \mathrm{E4M3} (x / s), \quad \widehat {x} = s q.\tag{58}
$$

The qdata q and the scale s together encode one MXFP8 tensor; neither part is usable alone. Dequantization applies the second relation when an operator requires BF16 or FP32 values (Figure 50).

qdata $q$ 和 scale $s$ 一起编码一个 MXFP8 张量, 单独哪一部分都不能用. 当算子需要 BF16 或 FP32 值时, 反量化按第二个关系式计算 (图 50).

The scale order associated with adjacent 32-value input blocks is not necessarily the blocked order required by a GEMM. Scaled matrix-multiply kernels consume swizzled scale layouts chosen for Tensor Core access. Quantization therefore has two distinct tasks: compute the scale and qdata, then arrange the scales for the operand role and matrix layout used by the kernel. Rowwise communication may use a different addressable

<!-- page 87 of 168 -->

![Image block](images/p87-figure-50-quantization-produces-a-qdata-scale-pair-dequantization.jpg)

Figure 50 Quantization produces a qdata–scale pair. Dequantization consumes both components and reconstructs ${ \widehat { x } } = s q ,$ an approximation to the original x; it does not invert quantization exactly.

scale layout from scaled GEMM (NVIDIA, 2026w). Figure 51 draws the block decomposition, and Figure 52 draws the layout distinction.

相邻 32 值输入块的 scale 顺序, 不一定是 GEMM 要求的分块顺序. 带 scale 的矩阵乘 kernel 读的是为 Tensor Core 访问而选的 swizzle 后的 scale 布局. 所以量化有两项独立的任务: 先算出 scale 和 qdata, 再按 kernel 用到的操作数角色和矩阵布局排好 scale. rowwise 通信用的可寻址 scale 布局可以和带 scale 的 GEMM 不同 (NVIDIA, 2026w). 图 51 画出块的分解, 图 52 画出两种布局的区别.

![Image block](images/p87-figure-51-quantization-produces-one-contiguous-qdata-array-and.jpg)

> 图注: figure 51 quantization produces one contiguous qdata array and.

BF16 · 2 B per value

**Figure 51 Quantization produces one contiguous qdata array and one contiguous scale array.** Sizes are drawn to byte scale for a two-row tensor with two 32-value blocks per row: each 64-byte BF16 block becomes a 32-byte E4M3 qdata block, half as wide, and the flattened scale array adds one E8M0 byte per block, each scale 1/32 the width of a qdata block. The four scales are the narrow strip at the lower left, drawn at true width; color marks which block each scale covers, and the dashed spans are logical: neither array is fragmented. Conceptual illustration with no measured quantities.

## A Logical MXFP8 Tensor Has Two Physical Components · 一个逻辑 MXFP8 张量有两个物理组成部分

One logical MXFP8 tensor is represented by two physical components: **qdata** and **E8M0 scales**, together with the **layout that relates them**. Operators consume qdata and scales together using their associated layout.

一个逻辑上的 MXFP8 张量由两个物理组成部分表示: **qdata** 和 **E8M0 scale**, 外加 **把两者对应起来的布局**. 算子按这个布局同时读 qdata 和 scale.

## 11.2.2 Scaling Granularity · scale 粒度

The number of values sharing a scale affects both numerical precision and storage cost. A tensor-wide scale is cheap to store but must cover the largest value in the tensor. Per-row or per-channel scales track variation more closely at greater metadata and conversion cost. Block scaling lies between those choices. The OCP MX specification permits E4M3 and E5M2 payload formats. Olmo uses the E4M3 MXFP8 variant: each adjacent block of 32 E4M3 values shares one power-of-two E8M0 scale (Open Compute Project, 2023). Figure 53 contrasts the three granularities.

共用一个 scale 的值有多少, 既影响数值精度, 也影响存储成本. 整个张量一个 scale, 存起来便宜, 但它要覆盖张量里的最大值. 按行或按通道的 scale 跟得更紧, 代价是更多的元数据和转换开销. 块 scale 介于两者之间. OCP MX 规范允许 E4M3 和 E5M2 两种载荷格式. Olmo 用 E4M3 的 MXFP8: 每相邻 32 个 E4M3 值共用一个 2 的幂 E8M0 scale (Open Compute Project, 2023). 图 53 对比三种粒度.

Smaller scale groups reduce the range that any one scale must cover, but they also increase the number of scales that must be produced, moved, and arranged. The 32-value group is therefore part of both the numerical recipe and the systems interface. Shape divisibility and scale layout are not optional kernel details.

scale 组越小, 每个 scale 要覆盖的范围越小, 但要生成, 搬运和排列的 scale 也越多. 所以 32 值一组既是数值配方的一部分, 也是系统接口的一部分. 形状能否整除, scale 怎么布局, 都不是可有可无的 kernel 细节.

<!-- page 88 of 168 -->

![Image block](images/p88-figure-52-the-scale-order-a-gemm-consumes-is.jpg)

Figure 52 The scale order a GEMM consumes is a tiled, interleaved layout. Cells are labeled m, k for the scale of row m and block column $k ,$ and colors mark row groups. Before the swizzle the grid is row-major; after $\mathrm { i t } ,$ each physical line interleaves the four row groups while a row’s scales within a tile stay adjacent. The drawing is a structure-preserving miniature with two-row groups and two-column tiles; the hardware layout applies the same rule with 32-row groups and four-column tiles, rearranging 128 × 4 tiles of scales into 32 sixteen-byte lines so that rows m, m+32, m+64, and m+96 become physically adjacent (NVIDIA, 2026p). The result resembles a transpose because whole row-group sub-blocks are relocated from a vertical stack to a horizontal line, but it is not one: inside every sub-block, m still advances downward and k rightward, and each scale keeps its $m ,$ k identity; only its address changes. Conceptual illustration with no measured quantities.

![Image block](images/p88-figure-53-scale-granularity-is-a-spectrum-along-the.jpg)

Figure 53 Scale granularity is a spectrum along the reduction dimension. One tensor-wide scale must cover the largest value in the tensor, per-row scales track variation more closely, and 32-value block scales track it most tightly at the highest metadata cost. Conceptual illustration with no measured quantities.

## 11.2.3 Native Blackwell MXFP8 GEMM · Blackwell 原生 MXFP8 GEMM

Native block scaling applies the E8M0 scales inside the matrix operation (NVIDIA, 2026p), avoiding a separate materialization of dequantized operands before GEMM. It accelerates the scaled matrix multiplication itself; software still determines how often values are converted into and out of MXFP8. Those conversions are the first challenge examined in Section 11.3.

原生块 scale 在矩阵运算内部应用 E8M0 scale (NVIDIA, 2026p), 不用在 GEMM 之前另外生成一份反量化的操作数. 它加速的是带 scale 的矩阵乘本身; 值多久转进, 转出一次 MXFP8, 仍由软件决定. 这些转换是 11.3 节要讨论的第一个难点.

## 11.3 Challenges in MXFP8 Training · MXFP8 训练的难点

Around the native block-scaled GEMM, the training system must produce correctly oriented operands for forward, dgrad, and Wgrad; pass qdata and scales through autograd; refresh derived weight caches after each optimizer update; and avoid paying Q, DQ, or scale swizzles more often than necessary. The following challenges determine whether the hardware throughput advantage survives in end-to-end training.

围绕原生块 scale GEMM, 训练系统要为前向, dgrad 和 Wgrad 生成方向正确的操作数; 让 qdata 和 scale 一起穿过 autograd; 每次优化器更新后刷新派生的权重缓存; 并且不在 Q, DQ 或 scale swizzle 上多付不必要的次数. 下面这些难点决定了硬件的吞吐优势能不能在端到端训练里保住.

<!-- page 89 of 168 -->

## 11.3.1 Quantization and Layout Overhead · 量化与布局开销

For one candidate GEMM (Figure 54), MXFP8 is faster only when

对单个候选 GEMM (Figure 54), MXFP8 只有在下面的条件成立时才更快:

![Image block](images/p89-figure-54-conversion-and-layout-costs-in-mxfp8-execution.jpg)

Figure 54 Conversion and layout costs in MXFP8 execution. MXFP8 is faster only when its GEMM savings exceed these costs. This is a schematic cost model, not measured timing. The displayed $O ( M K + K N )$ conversion term assumes both operands are quantized on the critical path. In Olmo training, the K × N weight conversion is normally paid during cache refresh and reused across microbatches, leaving activation conversion as the principal per-invocation cost. For small GEMMs, that remaining overhead can still turn the expected speedup into a slowdown.

Not every term is present on every path. A cached weight avoids Q on each microbatch, and a scaled GEMM that returns BF16 may not need a separate output DQ kernel. A saved activation or communicated row requires Q when it is produced and DQ if its consumer requires BF16. These costs are absent from the Tensor Core peak ratio.

并非每条路径都包含全部开销项. 权重有缓存时, 每个 microbatch 都省掉一次 Q; scaled GEMM 若直接输出 BF16, 就不需要单独的输出 DQ kernel. 被保存的 activation 或要通信的行, 产生时要做 Q, 消费方需要 BF16 时还要做 DQ. 这些开销都不在 Tensor Core 的峰值比里.

The crossover depends on the matrix dimensions and on expert load. Dense linears usually produce a few large GEMMs; MoE grouped GEMMs divide tokens across experts and can become too small or uneven to amortize conversion and launch overhead. Our single-GPU microbenchmark sweeps these dimensions to locate the crossover.

交叉点取决于矩阵尺寸和 expert 负载. Dense linear 通常只产生少数几个大 GEMM; MoE 的 grouped GEMM 把 token 分给各个 expert, 单个 GEMM 可能太小或太不均匀, 摊不平转换和 launch 开销. 我们用单卡 microbenchmark 扫这些尺寸, 找交叉点.

**Prequantized MXFP8 overtakes BF16 at smaller sizes than conversion-inclusive execution.** Small square projections do not recover the conversion cost within the single-B300 sweep. Table 22 separates the measured crossover points for prequantized GEMM and cached-weight execution with per-call activation quantization. The sweep also records Q, scale swizzle, Q-plus-swizzle, DQ, and fully dynamic execution alongside the BF16 and MXFP8 GEMMs.

**预量化的 MXFP8 比计入转换的执行在更小尺寸上就超过 BF16.** 在单张 B300 的扫描范围内, 小的方阵投影收不回转换开销. Table 22 把两种情况的实测交叉点分开列出: 一种是预量化 GEMM, 一种是权重走缓存, activation 每次调用都量化. 扫描还在 BF16 与 MXFP8 GEMM 之外记录了 Q, scale swizzle, Q 加 swizzle, DQ 以及全动态执行的耗时.

<table><tbody><tr><td rowspan="2">Projectionfamily</td><td rowspan="2">PrequantizedGEMMfaster from</td><td rowspan="2">Cached RHS,LHSQincluded</td></tr><tr></tr><tr><td>Rectangular projections</td><td>M = 2,048</td><td>M = 8,192</td></tr><tr><td>4096 → 4096</td><td>M = 4,096</td><td>M = 16,384</td></tr><tr><td>1024 → 1024, 2048 → 2048</td><td>-</td><td>No crossover in sweep</td></tr></tbody></table>

<!-- page 90 of 168 -->

| Projection | Raw MXFP8 GEMM | Shared, cached RHS | Routed, prequantized LHS | Routed, LHSQ charged |
| --- | --- | --- | --- | --- |
| 1024 → 1024 | 1.00× | 0.25× | 0.52× | 0.31× |
| 2048 → 2048 | 1.76× | 0.84× | 1.31× | 0.91× |
| 4096 → 4096 | 1.84× | 1.45× | 1.70× | 1.43× |
| 4096 → 6144 | 1.84× | 1.53× | 1.71× | 1.49× |
| 4096 → 8192 | 1.83× | 1.62× | 1.76× | 1.46× |
| 8192 → 4096 | 1.92× | 1.52× | 1.76× | 1.46× |
| 2048 → 16384 | 1.76× | 1.66× | 1.49× | 1.33× |
| 16384 → 2048 | 1.79× | 1.18× | 1.77× | 1.12× |
| OLMoE 1536 → 3072 | 1.72× | 0.99× | 1.34× | 1.02× |
| OLMoE 1536 → 1536 | 1.60× | 0.48× | 0.95× | 0.55× |

## 11.3.2 Forward, Dgrad, and Wgrad Need Different Operands · forward, dgrad 与 Wgrad 需要不同的操作数

For a linear layer,

对一个 linear 层,

$$
Y = X W ^ {\top}, \qquad \nabla_ {X} = \nabla_ {Y} W, \qquad \nabla_ {W} = \nabla_ {Y} ^ {\top} X.\tag{60}
$$

Forward and dgrad use the same weight parameter but opposite matrix orientations. Olmo consequently stores one prequantized RHS cache for $\bar { W } ^ { \top }$ and another for W. They are derived from one FP32 main weight and must be refreshed together; they are not independent parameters.

forward 和 dgrad 用的是同一个权重参数, 但矩阵方向相反. 因此 Olmo 存两份预量化的 RHS 缓存, 一份给 $\bar { W } ^ { \top }$, 一份给 $W$. 两份都从同一个 FP32 主权重导出, 必须一起刷新; 它们不是两个独立参数.

The activation has a similar layout problem. In forward, X is the left-hand operand. In Wgrad, the saved X is the right-hand operand of $\nabla _ { Y } ^ { \top } X$ . The LHS and RHS scale layouts are not interchangeable, so an activation quantized for forward cannot automatically be reused for Wgrad (NVIDIA, 2026w). When Olmo saves X in MXFP8 for Wgrad, it produces the RHS-oriented representation explicitly.

activation 有类似的布局问题. forward 里 $X$ 是左操作数; Wgrad 里, 保存下来的 $X$ 是 $\nabla _ { Y } ^ { \top } X$ 的右操作数. LHS 和 RHS 的 scale 布局不能互换, 所以为 forward 量化的 activation 不能直接拿来给 Wgrad 用 (NVIDIA, 2026w). Olmo 以 MXFP8 为 Wgrad 保存 $X$ 时, 会显式生成 RHS 方向的表示.

Dense MXFP8Linear uses scaled MXFP8 operations for forward, dgrad, and Wgrad. The current routed grouped-Wgrad path is different: it dequantizes the needed operands and uses BF16 grouped matrix multiplication. The tested natural grouped-Wgrad contraction and scale layouts were slower on the measured development shapes.

Dense 的 MXFP8Linear 在 forward, dgrad, Wgrad 三处都用 scaled MXFP8 运算. 当前 routed 的 grouped-Wgrad 路径不一样: 它先把所需操作数反量化, 再做 BF16 grouped 矩阵乘. 在实测的开发期形状上, 测过的天然 grouped-Wgrad 收缩方式和 scale 布局都更慢.

Figure 55 draws the resulting weight path: one FP32 main weight quantized after each update into the two oriented caches that forward and dgrad consume. It is a zoom of the full routed pipeline in Figure 57 (Section 11.4) and uses that figure’s notation.

Figure 55 画出了由此得到的权重路径: 每次更新后, 一个 FP32 主权重被量化成两份带方向的缓存, 分别供 forward 和 dgrad 使用. 它是 Figure 57 (§11.4) 完整 routed 流水线的局部放大, 沿用那张图的记号.

## 11.3.3 Autograd Must Carry qdata and Scales as One Value · autograd 必须把 qdata 和 scales 当成一个值传递

PyTorch autograd normally treats one tensor as one differentiable value. MXFP8 instead encodes one BF16 tensor as qdata and scales. A custom autograd interface must carry or save the two components together, remember their layout, and produce the gradient of the original BF16 tensor. It must not expose either component alone as if it were the activation.

PyTorch autograd 通常把一个 tensor 当作一个可微值. MXFP8 则把一个 BF16 tensor 编码成 qdata 和 scales 两部分. 自定义 autograd 接口必须把这两部分一起传递或保存, 记住它们的布局, 并产出原始 BF16 tensor 的梯度. 它不能把其中任何一部分单独暴露出来, 当成 activation 用.

<!-- page 91 of 168 -->

![Image block](images/p91-figure-55-one-fp32-main-weight-becomes-two-oriented.jpg)

Figure 55 One FP32 main weight becomes two oriented MXFP8 caches. After every optimizer update, the FP32 main weight is quantized into the forward cache and, through an explicit transpose, the dgrad cache, each consumed as the RHS of its scaled grouped GEMM and reused across microbatches until the next update. The figure treats W as the right-hand operand (xW), so its W and W.T labels are $W ^ { \top }$ and $W$ in the notation of the text. The gather that assembles the sharded main weight stages through a transient BF16 copy freed immediately after quantization; under the FP8-only expert-parameter mode evaluated here, forward and backward hold no weight other than the two caches. The loop closes through the weight-gradient path: the BF16 Wgrad output accumulates into the FP32 gradient buffer and is reduced across ranks before the optimizer update writes the FP32 main weight and triggers the next refresh; the dgrad output flows to the previous layer. Notation: Q quantizes to MXFP8 and T transposes; (fp8, R) is qdata with rowwise scales; (fp8, R+B) keeps rowwise plus blocked (swizzled) scales; mx8mx8bf16 names the two MXFP8 inputs and BF16 output of the grouped GEMM. Conceptual illustration with no measured quantities.

This interface also removes avoidable conversions. In the default fused routed path, adjacent backward stages thread explicit qdata and scales inside one custom-autograd region. An MXFP8 tensor wrapper can carry the same qdata-and-scale pair between split operators. When adjacent layouts agree, the consumer uses the pair directly and avoids MXFP8→BF16 dequantization followed immediately by BF16→MXFP8 requantization.

这个接口还能去掉本可避免的转换. 默认的融合 routed 路径里, 相邻的 backward 阶段在同一个 custom-autograd 区域内直接传递显式的 qdata 和 scales. 在拆开的算子之间, 可以用一个 MXFP8 tensor wrapper 携带同样的 qdata 与 scale 对. 相邻两步布局一致时, 消费方直接用这一对, 省掉「先 MXFP8→BF16 反量化, 紧接着又 BF16→MXFP8 重新量化」这一来回.

## 11.3.4 DDP Must Be MXFP8-Aware · DDP 必须感知 MXFP8

Olmo’s DDP implementation follows the synchronization and precision policy of each parameter group (Section 4). It must also manage MXFP8 weight-cache refresh: qdata and scale caches are not ordinary nn.Parameter objects, and they must never be updated directly.

Olmo 的 DDP 实现按每个参数组的同步与精度策略执行 (§4). 它还得管理 MXFP8 权重缓存的刷新: qdata 和 scale 缓存不是普通的 nn.Parameter 对象, 绝不能直接更新.

Olmo represents each MXFP8 weight parameter with an FP8WeightStore. The store records the parameter name and shape, the required cache orientations, and a high-precision gradient sink. Under the precision policy of Section 4, BF16 Wgrad outputs accumulate into the FP32 gradient buffer and are reduced over the parameter’s replica group. The distributed optimizer then updates the sharded FP32 main weight.

Olmo 用一个 FP8WeightStore 表示每个 MXFP8 权重参数. store 记录参数名和形状, 需要哪些方向的缓存, 以及一个高精度的梯度 sink. 按 §4 的精度策略, BF16 的 Wgrad 输出累加进 FP32 梯度 buffer, 再在该参数的副本组上做 reduce. 之后由分布式优化器更新分片的 FP32 主权重.

After initialization and every optimizer copy-back, Olmo reconstructs the local weight values and rebuilds all required MXFP8 caches. Training-resume and model-only training loads also perform this refresh before first use. The BF16 initialization anchor may be released after the FP32 main weight and caches exist. It is not a second source of truth. If the main weight advances to step t + 1 while a cache remains at step t, the next forward pass uses the previous cache.

初始化之后, 以及每次优化器写回之后, Olmo 都会重建本地权重值, 并重建所有需要的 MXFP8 缓存. 续训加载和只加载模型的训练加载, 在首次使用前也做这次刷新. FP32 主权重和缓存建好之后, BF16 初始化锚点可以释放, 它不是第二个事实源. 如果主权重已经走到第 $t+1$ 步, 缓存还停在第 $t$ 步, 下一次 forward 用的就是旧缓存.

<!-- page 92 of 168 -->

## Derived Representations of the FP32 Main Weight · FP32 主权重的派生表示

The FP32 main weight is authoritative. Forward caches, dgrad caches, BF16 views, and checkpoint views are derived representations and must be rebuilt when the main weight changes.

FP32 主权重是权威值. forward 缓存, dgrad 缓存, BF16 视图和 checkpoint 视图都是派生表示, 主权重一变就必须重建.

## 11.3.5 Scale Selection Is a Training Recipe · scale 选法属于训练配方

Cache refresh determines when weights are quantized; scale selection determines the range and spacing of the values they can represent. The OCP MX v1.0 specification (Open Compute Project, 2023) and the NVIDIA training recipe (Mishra et al., 2025) choose the E8M0 scale differently. OCP’s baseline conversion first rounds the block maximum down to a power of two and divides by $2 ^ { 8 }$ , the largest power of two representable by E4M3. The round-ceiling (rceil) recipe instead divides by the actual E4M3 maximum, 448, and rounds the resulting scale upward to a power of two. Table 24 shows the two conversions in the form implemented by Olmo (Open Compute Project, 2023; Mishra et al., 2025).

缓存刷新决定权重什么时候量化; scale 选法决定量化后能表示的数值范围和间距. OCP MX v1.0 规范 (Open Compute Project, 2023) 和 NVIDIA 训练配方 (Mishra et al., 2025) 选 E8M0 scale 的方法不同. OCP 的基线转换先把块最大值向下取整到 2 的幂, 再除以 $2 ^ { 8 }$, 即 E4M3 能表示的最大 2 的幂. round-ceiling (rceil) 配方改为除以 E4M3 的实际最大值 448, 再把得到的 scale 向上取整到 2 的幂. Table 24 按 Olmo 的实现写出了这两种转换 (Open Compute Project, 2023; Mishra et al., 2025).

```python
OCP v1.0: floor
a = max(abs(float(v[0:32]))
e = floor(log2(a)) - 8
e = clamp(e, -127, 127)
s = 2**e
for i in 0..31:
    q[i] = sat_E4M3(
        RNE(float(v[i]) / s))
return q, E8M0(e + 127)
NVIDIA: round-ceiling (rceil)
a = max(abs(float(v[0:32]))
e = ceil(log2(a / 448))
e = clamp(e, -127, 127)
s = 2**e
for i in 0..31:
    q[i] = sat_E4M3(
        RNE(float(v[i]) / s))
return q, E8M0(e + 127)
```

The rceil rule chooses the smallest power-of-two scale that prevents the block maximum from exceeding 448. The floor rule can choose a scale that is twice as fine, but then the largest values saturate when the normalized block maximum lies above 448. For a = 500, for example, floor selects s = 1 and clips at 448, whereas rceil selects s = 2 and avoids clipping.

rceil 规则选的是能让块最大值不超过 448 的最小 2 的幂 scale. floor 规则可能选出细一倍的 scale, 但归一化后的块最大值一旦高于 448, 最大的那些值就会饱和. 例如 $a = 500$ 时, floor 选 $s = 1$, 在 448 处截断; rceil 选 $s = 2$, 不截断.

OCP v1.0 says that its floor-style mechanism should be supported, while also allowing other conversion algorithms. NVIDIA’s experiments identify scale rounding as a training-recipe choice and report that rounding the ratio upward avoids the degradation observed with the floor recipe (Mishra et al., 2025). Olmo implements both modes and uses rceil by default, matching Transformer Engine’s documented scaling rule (NVIDIA, 2026w); floor remains available for controlled comparisons.

OCP v1.0 规定应支持它的 floor 式机制, 同时也允许其他转换算法. NVIDIA 的实验把 scale 的取整方式当作训练配方的一项选择, 并报告: 把比值向上取整, 可以避开 floor 配方下出现的退化 (Mishra et al., 2025). Olmo 两种模式都实现了, 默认用 rceil, 与 Transformer Engine 文档里的 scaling 规则一致 (NVIDIA, 2026w); floor 留作对照实验用.

To test whether this local conversion difference affects training, we fork a 31-layer, 8.36B-active/166.72B-total MoE with top-4 routing over 128 routed experts and one shared expert. The common step-6000 checkpoint was trained from scratch with MXFP8 using OCP floor scaling. From that checkpoint onward, the three branches use BF16, MXFP8 rceil, and MXFP8 floor, respectively. Figure 56 compares the resulting loss and gradient-norm trajectories.

为了检验这种局部转换差异会不会影响训练, 我们从一个 MoE 分叉出三条支路. 这个 MoE 有 31 层, 激活 8.36B, 总参 166.72B, 128 个 routed expert 加 1 个 shared expert, top-4 路由. 共同起点是 step-6000 的 checkpoint, 它从头用 MXFP8 加 OCP floor scaling 训出来. 从这个 checkpoint 起, 三条支路分别用 BF16, MXFP8 rceil 和 MXFP8 floor. Figure 56 对比三者的 loss 和梯度范数轨迹.

The direction of this result matches the NVIDIA recipe study: round-ceiling scaling follows the higherprecision baseline, whereas floor scaling produces a visible loss degradation (Mishra et al., 2025).

结果的方向与 NVIDIA 的配方研究一致: round-ceiling scaling 贴着高精度基线走, floor scaling 则出现肉眼可见的 loss 退化 (Mishra et al., 2025).

> 答: 先按 Table 24 的伪代码算 floor 什么时候截断. floor 取 $e=\lfloor\log_2 a\rfloor-8$, 归一化后的块最大值 $a/2^e$ 落在 $[256,512)$; 落进 $(448,512)$ 的块, 最大元素就被 `sat_E4M3` 截到 448, 最多压小 12.5%. 若块最大值在对数尺度上大致均匀, 这类块约占 $\log_2(512/448)\approx 0.19$, 即五分之一左右的 32 元素块. rceil 把 $a/2^e$ 放进 $(224,448]$, 不截断, 代价是这些块的量化步长粗一倍. 所以 floor 的误差有偏 (只压每块的最大值), rceil 的误差是无偏的舍入误差. 梯度范数 +51% 与「被截的恰好是 outlier 通道」的推断一致, 但 Figure 56 只有全模型的总梯度范数, 没有分层或分张量的数据, 这一步报告里没写, 只是从已知数字推出的说法, 没有数据验证. 另外 trunk 的前 6000 步也是 floor, 报告没有一条从头 BF16 的对照, 所以只能说「从同一点出发, floor 比 rceil 和 BF16 差」, 不能说前 6000 步没被 floor 拖累. 代码侧, `src/olmo_core/mxfp8_config.py` 的 `MXFP8ScaleMode` 只有 `floor` 和 `rceil` 两档, 环境变量缺省取 `rceil`, 与正文「默认 rceil」一致.

## 11.4 The Olmo MXFP8 Recipe for MoE · Olmo 面向 MoE 的 MXFP8 配方

The optimizer keeps the authoritative main weights in FP32. Forward and dgrad use MXFP8 weight caches. Custom-autograd regions accept and return BF16 at ordinary model boundaries, while selected internal activations and backward gradients remain in MXFP8. Wgrad results accumulate into FP32 gradient buffers; gradient reduction, clipping, and the optimizer update are also performed in high precision. The next forward pass uses caches rebuilt from the updated FP32 main weights, the loop that Figure 55 isolated.

优化器以 FP32 保存权威的主权重. forward 和 dgrad 用 MXFP8 权重缓存. custom-autograd 区域在普通的模型边界上收发 BF16, 内部选定的 activation 和 backward 梯度保持 MXFP8. Wgrad 结果累加进 FP32 梯度 buffer; 梯度 reduce, 裁剪和优化器更新也都用高精度完成. 下一次 forward 用的是从更新后的 FP32 主权重重建的缓存, 也就是 Figure 55 单独画出的那个循环.

<!-- page 93 of 168 -->

![Image block](images/p93-mxfp8-rceil-closely-tracks-the-bf16-loss-trajectory.jpg)

> 图注: mxfp8 rceil closely tracks the bf16 loss trajectory.

MXFP8 rceil closely tracks the BF16 loss trajectory

![Image block](images/p93-chart.jpg)

![Image block](images/p93-mxfp8-rceil-keeps-gradient-norms-close-to-bf16.jpg)

> 图注: mxfp8 rceil keeps gradient norms close to bf16.

MXFP8 rceil keeps gradient norms close to BF16

![Image block](images/p93-figure-56-round-ceiling-mxfp8-follows-the-bf16-training.jpg)

Figure 56 Round-ceiling MXFP8 follows the BF16 training trajectory. The top plot reports cross-entropy loss; the bottom reports total gradient norm. The model has 8.36B active and 166.72B total parameters across 31 layers, with top-4 routing over 128 routed experts and one shared expert. The common step-6000 checkpoint was trained from scratch with MXFP8 OCP-floor scaling on approximately 56B tokens. Step 7179 corresponds to approximately 67B tokens, so the plotted continuation spans approximately 11B tokens. The main panels use a 21-step centered moving average, while the final-50-step panels use a lighter 7-step centered moving average; faint lines show the raw measurements. Over the final 50 steps, rceil differs from BF16 by +0.00048 mean loss and −1.9% mean gradient norm, whereas floor differs by +0.02200 mean loss and +51.1% mean gradient norm.

## 11.4.1 Routed Experts · Routed expert

The routed path combines MXFP8 compute with rowwise EP. In forward, the router produces token–expert assignments. Dispatch quantizes each selected BF16 token row into qdata and scales and places those components in the destination expert’s buffers. The up/gate grouped GEMM consumes the dispatched activation and the cached MXFP8 expert weights. A fused SwiGLU-plus-quantization step produces the hidden representation needed by the down projection without requiring a separate BF16-to-MXFP8 pass. The down grouped GEMM then produces a BF16 expert output. That row is quantized for combine transport, and combine reconstructs the route-weighted BF16 token result on the originating rank.

routed 路径把 MXFP8 计算和 rowwise EP 结合起来. forward 时, router 给出 token 到 expert 的分配. dispatch 把每个选中的 BF16 token 行量化成 qdata 和 scales, 放进目标 expert 的 buffer. up/gate grouped GEMM 读取 dispatch 过来的 activation 和缓存的 MXFP8 expert 权重. 一个融合的 SwiGLU 加量化步骤直接产出 down 投影要用的隐层表示, 不需要单独再做一遍 BF16 到 MXFP8 的转换. 随后 down grouped GEMM 输出 BF16 的 expert 结果. 这一行为了 combine 传输再量化一次, combine 在 token 原来所在的 rank 上还原出按路由权重加权的 BF16 结果.

Backward follows the data dependencies in reverse. Combine backward applies the route weights while quantizing the output gradient for transfer to the ranks that hold the selected experts. Dgrad uses the

<!-- page 94 of 168 -->

orientation-specific MXFP8 weight caches. Where two adjacent backward stages inside the fused autograd region agree on layout, their qdata and scales pass directly between those stages, avoiding a DQ–Q cycle. Routed Wgrad currently dequantizes the saved operands and uses BF16 grouped matrix multiplication before accumulating the resulting weight gradient into the high-precision sink. Dispatch backward returns the input gradient to the originating token ranks.

backward 沿数据依赖反向走. combine backward 在乘上路由权重的同时, 把输出梯度量化, 发给持有所选 expert 的 rank. dgrad 用按方向区分的 MXFP8 权重缓存. 在融合 autograd 区域内, 相邻两个 backward 阶段布局一致时, qdata 和 scales 直接在两者之间传递, 省掉一次 DQ 再 Q 的循环. routed Wgrad 目前先把保存的操作数反量化, 用 BF16 grouped 矩阵乘算出权重梯度, 再累加进高精度 sink. dispatch backward 把输入梯度送回 token 原来所在的 rank.

The routed-expert recipe is therefore mixed precision: MXFP8 where scaled GEMM or transport benefits, BF16 at ordinary model interfaces and the current grouped-Wgrad contraction, and FP32 for accumulated gradients, FP32 main weights, and optimizer states.

所以 routed-expert 配方是混合精度的: scaled GEMM 或传输能获益的地方用 MXFP8; 普通模型接口和当前的 grouped-Wgrad 收缩用 BF16; 累加的梯度, 主权重和优化器状态用 FP32.

Figure 57 puts these boundaries into one autograd view. The upper path follows forward execution from dispatch through combine; the lower path follows the corresponding dgrad, Wgrad, and communication work in backward.

Figure 57 把这些边界放进同一张 autograd 视图. 上半条路径是 forward, 从 dispatch 走到 combine; 下半条是 backward 里对应的 dgrad, Wgrad 和通信.

![Image block](images/p94-figure-57-routed-expert-mxfp8-forward-and-backward-forward.jpg)

Figure 57 Routed-expert MXFP8 forward and backward. Forward quantizes routed rows for dispatch, applies MXFP8 grouped GEMMs for the up/gate and down projections, and quantizes the combine payload. Backward reverses the communication path, uses MXFP8 weight caches for dgrad, and uses the current BF16 grouped-GEMM path for Wgrad before accumulation into FP32 gradient buffers that are then reduced with the other ranks’ contributions (dashed arrows). The drawing also identifies saved, discarded, recomputed, quantized, and dequantized values across the custom-autograd boundary. Notation: (fp8, R) is qdata with rowwise scales; (fp8, R+B) keeps rowwise plus blocked (swizzled) scales; Q, DQ, and T are quantize, dequantize, and transpose; Q+S is a fused quantize-plus-swizzle; mx8mx8bf16 and bf16bf16bf16 name each grouped GEMM’s two input dtypes and output dtype. Weight labels treat W as the right-hand operand (xW), so W and W.T correspond to W ⊤ and W in the notation of the text.

## 11.4.2 Dense and Shared-Expert Linears · Dense 与 shared-expert 的 linear

The same cache-and-update scheme applies outside the routed experts. Olmo replaces selected attention projections and shared-expert linears with MXFP8Linear. Each weight has forward and dgrad caches derived from its FP32 main weight, and Wgrad is routed to the same high-precision accumulation path used by the DDP optimizer.

同一套「缓存加更新」做法也用在 routed expert 之外. Olmo 把选定的 attention 投影和 shared-expert 的 linear 换成 MXFP8Linear. 每个权重都有从 FP32 主权重导出的 forward 缓存和 dgrad 缓存, Wgrad 走 DDP 优化器所用的那条高精度累加路径.

The saved-input policy is operator-specific. The packed QKV projection saves its Wgrad input in the MXFP8 RHS layout. The attention output projection keeps its Wgrad input in BF16 because the surrounding attention graph already keeps the relevant BF16 activation alive; adding an MXFP8 copy would not provide the same memory benefit. Attention projections thus use operator-specific compute and saved-activation precision.

保存输入的策略按算子分别定. 打包的 QKV 投影以 MXFP8 RHS 布局保存 Wgrad 的输入. attention 输出投影的 Wgrad 输入保持 BF16, 因为周围的 attention 计算图本来就留着对应的 BF16 activation; 再加一份 MXFP8 副本, 拿不到同样的显存收益. 所以 attention 投影的计算精度和保存 activation 的精度都按算子分别设定.

Shared experts use the same forward/dgrad cache principle, but their shapes and replica groups follow the shared-expert parameter group rather than the routed-expert group. The recipe evaluated here uses one shared expert with MXFP8-only compute-weight storage, and both shared-expert linears save their Wgrad inputs in MXFP8.

shared expert 遵循同样的 forward/dgrad 缓存原则, 但形状和副本组跟随 shared-expert 参数组, 不跟 routed-expert 组. 这里评测的配方用 1 个 shared expert, 计算用权重只存 MXFP8, 两个 shared-expert linear 都以 MXFP8 保存 Wgrad 的输入.

<!-- page 95 of 168 -->

## 11.4.3 MXFP8 Activation Saving Without MXFP8 Compute · 不做 MXFP8 计算, 只用 MXFP8 保存 activation

Storage precision and compute precision are independent choices. Olmo’s saved-tensor hooks can pack selected BF16 activations, including the query, key, and value tensors saved for attention backward, into MXFP8 and dequantize them only when backward consumes them. The surrounding forward GEMM does not need to use MXFP8 for this mechanism to reduce saved-activation memory.

存储精度和计算精度是两个独立的选择. Olmo 的 saved-tensor hook 可以把选定的 BF16 activation 打包成 MXFP8 保存, 包括为 attention backward 保存的 query, key, value tensor, 等 backward 真正用到时才反量化. 周围的 forward GEMM 不必用 MXFP8, 这个机制照样能减少保存 activation 的显存.

![Image block](images/p95-figure-58-saving-a-quantized-activation-for-backward-forward.jpg)

Figure 58 Saving a quantized activation for backward. Forward quantizes the BF16 activation before save\_for\_ backward; backward dequantizes it only when a BF16 consumer needs the value. This saves memory only when the quantized representation replaces, rather than supplements, another retained BF16 copy.

This option is profitable only when the packed tensor replaces a BF16 tensor that would otherwise remain live. It also trades Q during forward and DQ during backward for lower peak memory. Storage-only MXFP8 is therefore a configuration choice separate from MXFP8 compute.

只有当打包后的 tensor 顶替掉一个本来会一直存活的 BF16 tensor 时, 这个选项才划算. 它还要拿 forward 的 Q 和 backward 的 DQ 去换更低的峰值显存. 所以「只在存储上用 MXFP8」是与 MXFP8 计算分开的一个配置项.

## 11.4.4 Kernel Problems and Fusions · kernel 问题与融合

MXFP8 creates useful fusion opportunities because an intermediate often needs to be transformed before its next consumer. The integrated routed path fuses SwiGLU with row quantization, and combine backward fuses route weighting with gradient quantization. Both avoid writing a large BF16 intermediate solely to read it again for Q. Weight caches similarly move weight quantization from the microbatch path to the post-update boundary.

MXFP8 带来了一些有用的融合机会, 因为中间结果在交给下一个消费方之前往往要先变换一次. 集成的 routed 路径把 SwiGLU 和行量化融在一起, combine backward 把路由加权和梯度量化融在一起. 两处都避免了「写出一个大的 BF16 中间结果, 只为了再读回来做 Q」. 权重缓存同理, 把权重量化从 microbatch 路径挪到了参数更新之后.

The current recipe transfers qdata and scales separately. Paired or packed qdata-plus-scale transport and direct weighted-quantize-plus-transfer kernels are prototypes outside the evaluated recipe. For routed Wgrad, global DQ followed by BF16 grouped GEMM was faster than the natural MXFP8 contraction on the measured development shapes, whose reduction dimension and scale layout do not align well with the native block-scaled operation. Table 25 summarizes these choices.

当前配方把 qdata 和 scales 分开传. 成对或打包传输 qdata 加 scale, 以及「加权, 量化, 传输」一步完成的 kernel, 都还是原型, 不在评测的配方里. 对 routed Wgrad, 在实测的开发期形状上, 先全局 DQ 再做 BF16 grouped GEMM, 比天然的 MXFP8 收缩更快; 这些形状的 reduction 维度和 scale 布局与原生 block-scaled 运算对不齐. Table 25 汇总了这些选择.

## 11.5 Throughput Benchmark · 吞吐基准

We compare four modes to separate the attention-projection contribution from the combined MLP-and-EP contribution: a BF16 reference; MXFP8 for the QKV and output projections in attention; MXFP8 for the dense, shared, and routed MLPs together with MXFP8 rowwise EP transport; and the combined recipe.

为了把 attention 投影的贡献和 MLP 加 EP 的贡献分开, 我们比较四种模式: BF16 参照; 只在 attention 的 QKV 和输出投影上用 MXFP8; dense, shared, routed 三类 MLP 用 MXFP8, 同时 rowwise EP 传输也用 MXFP8; 以及两者合起来的完整配方.

Figure 59 reports a controlled four-B300 experiment whose configuration is summarized in Table 26. Throughput is total work divided by wall time over the timed window, which avoids both first-use compilation and an average of already-rounded per-step rates.

Figure 59 报告一组 4 张 B300 上的受控实验, 配置见 Table 26. 吞吐取计时窗口内的总工作量除以 wall time, 这样既避开首次使用时的编译, 也避免对已经取过整的每步速率再求平均.

Quantizing attention projections alone gives a modest benefit at this shape: quantization and layout work offset part of the GEMM savings. The MLP and EP path supplies nearly all of the gain. It accelerates the

<!-- page 96 of 168 -->

| Operation | Current path | Reason or alternative |
| --- | --- | --- |
| SwiGLU + activation Q | Integrated fusion | Avoid a separate BF16 intermediate and Q pass |
| Route weighting + gradient Q | Integrated fusion | Avoid a route-expanded BF16 gradient before dispatch |
| Qdata + scale transport | Separate transfers | Paired and packed transport alterna-tives are outside the evaluated recipe |
| Routed grouped Wgrad | DQ, then BF16 grouped GEMM | The natural MXFP8 path was slower on the measured development shapes |

| Setting | Value |
| --- | --- |
| Model | 8 layers; 3.172B active and 13.037B total parameters |
| Experts and routing | 32 routed experts, top-4, one shared expert |
| Hardware and parallelism | Four B300 GPUs, EP = 4 |
| Global step | 524,288 tokens in eight gradient-accumulation microbatches |
| Matched across modes | Fixed-seed initialization and initialized weights, generated input batches, routing decisions, fused attention implementation, optimizer precision, compilation, and recompute policy |
| Timing window | Steps 1-14 untimed; throughput from total work and wall time over steps 15-24 |
| Repetitions | Three fresh distributed jobs per mode |

large dense and expert GEMMs and cuts the fixed rowwise EP buffer allocation from 5.00 GiB in BF16 to 2.836 GiB for MXFP8 qdata and scales. Combining both paths gives the highest throughput, about 21% above the BF16 reference, and the lowest peak active memory.

在这个形状下, 只量化 attention 投影收益有限: 量化和布局的工作抵掉了一部分 GEMM 的节省. 几乎全部收益来自 MLP 和 EP 这条路径. 它加速了大的 dense GEMM 和 expert GEMM, 并把 rowwise EP 的固定 buffer 从 BF16 的 5.00 GiB 降到 MXFP8 qdata 加 scales 的 2.836 GiB. 两条路径合起来吞吐最高, 比 BF16 参照高约 21%, 峰值活跃显存也最低.

The rank-0 profiles in Figure 59(a,b) support this attribution. The three families MXFP8 targets account for 65% of BF16 kernel time and fall by a quarter to a half once the MLP path is quantized, while the added conversion work costs a tenth of BF16 kernel time. The untargeted families contribute a much smaller share of the reduction.

Figure 59(a,b) 里 rank 0 的 profile 支持这一归因. MXFP8 针对的三类 kernel 占 BF16 kernel 时间的 65%, MLP 路径量化后, 它们下降四分之一到一半; 新增的转换工作只花掉 BF16 kernel 时间的十分之一. 未针对的 kernel 类在总降幅里占比小得多.

These short performance runs verify the systems comparison, not long-horizon training quality. Their first logged loss is identical and their first gradient norms are close under the matched initialization, while the longer continuation experiment in Section 11.3.5 provides the training-trajectory evidence for the selected scale recipe.

这些短的性能测试验证的是系统层面的比较, 不是长程训练质量. 在相同初始化下, 它们记录的第一个 loss 完全相同, 第一个梯度范数也很接近; 所选 scale 配方的训练轨迹证据来自 §11.3.5 那个更长的续训实验.

**Section takeaway.** MXFP8’s compute, activation-memory, and communication benefits depend on the cost of Q/DQ, scale layout, cache refresh, and the autograd interface that carries qdata and scales together. Olmo keeps one FP32 main weight authoritative and treats every MXFP8 representation as a derived cache or payload, so persistent training-state memory does not shrink. In the measured four-mode ablation, the MLP and expert-transport path supplies nearly all of the end-to-end throughput gain, and the combined recipe also lowers peak active memory.

**本节要点.** MXFP8 在计算, activation 显存和通信上的收益, 取决于 Q/DQ 的开销, scale 布局, 缓存刷新, 以及把 qdata 和 scales 一起传递的 autograd 接口. Olmo 只把一个 FP32 主权重当作权威值, 所有 MXFP8 表示都只是派生的缓存或传输负载, 所以常驻的训练状态显存不会变小. 在实测的四模式消融里, 端到端吞吐收益几乎全部来自 MLP 和 expert 传输这条路径, 完整配方还降低了峰值活跃显存.

<!-- page 97 of 168 -->

![Image block](images/p97-chart.jpg)

![Image block](images/p97-figure-59-kernel-time-breakdown-throughput-and-memory-across.jpg)

![Image block](images/p97-figure-59-kernel-time-breakdown-throughput-and-memory-across-2.jpg)

![Image block](images/p97-figure-59-kernel-time-breakdown-throughput-and-memory-across-3.jpg)

> 图注: figure 59 kernel time breakdown throughput and memory across 3.

BF16 reference: 54.74K tokens/s/GPU, 103.4 GiB peak active. Dots in (‌c), (d): three fresh jobs per mode, 10-step windows, four B300, EP4.

**Figure 59 Kernel-time breakdown, throughput, and memory across the four MXFP8 modes.** The combined recipe reduces the rank-0 kernel-duration sum by a quarter. Panels (a,b) use profiled kernel durations to identify changed work; panel (c) uses unprofiled runs for throughput because tracing perturbs the launch-heavy combined path. (a) Kernel-duration sums per captured train batch on rank 0 by kernel family, means of three captured batches per mode. Teal families are the ones MXFP8 targets, gray families are not targeted, and pink is the added quantization, scale-swizzle, and dequantization work (75.5, 203.1, and 262.1 ms per batch; 3.0%, 8.0%, and 10.3% of the BF16 sum). Family sums overlap across streams and are not an additive wall-time model; the triangle marks the union of kernelbusy intervals, which shrinks by 1.3%, 16.3%, and 20.2%. (b) Change of the three targeted families relative to BF16; the bars in each row are, top to bottom, dense GEMM, grouped GEMM, and EP transport, in the colors of (a). The EP-transport family includes barrier kernels; the payload-moving kernels alone fall by 41% in both the MLP+EP and combined modes, so part of the combined −50% is reduced waiting. (c) Throughput change over three fresh distributed jobs per mode; bars are means of the three ten-step windows and dots are the repetitions. The BF16 reference is 54.74K tokens/s/GPU and the largest sample standard deviation is 0.14K, smaller than the dot markers. (d) Peak active memory change in the same runs from the 103.40 GiB BF16 reference. Four B300 GPUs, EP = 4, uniform routing, and identical initialized weights, inputs, and routing in every mode (Table 26); these are systems measurements at one operating point, not training-quality evidence (Section 11.3.5).

## 12 Topology-Agnostic Checkpoint Saving and Loading · 与拓扑无关的 checkpoint 保存与加载

**Checkpoint tensors are independent of rank placement.** A checkpoint should identify the model and optimizer tensors required to resume a particular training step, without requiring the next run to use the same rank layout. Topology-independent checkpoint tensors and load-time resharding are also explicit goals of Universal Checkpointing and $\mathrm { P y }$ Torch Distributed Checkpoint (Lian et al., 2025; PyTorch Contributors, 2026g). Olmo saves FP32 main weights, FP32 optimizer states, and the small amount of optimizer and trainer metadata needed to continue the run. In MoE, dense tensors are sharded over DP, expert tensors over EP-MP and EP-DP, and layers over PP. Changing those degrees changes which slice each rank holds, not the underlying tensor values.

**checkpoint tensor 与 rank 的摆放无关.** checkpoint 应当标明从某个训练步续训所需的模型和优化器 tensor, 而不要求下一次运行沿用同样的 rank 布局. 与拓扑无关的 checkpoint tensor 和加载时重新分片, 也是 Universal Checkpointing 与 PyTorch Distributed Checkpoint 明确的目标 (Lian et al., 2025; PyTorch Contributors, 2026g). Olmo 保存 FP32 主权重, FP32 优化器状态, 以及续训所需的少量优化器和 trainer 元数据. MoE 里, dense tensor 按 DP 分片, expert tensor 按 EP-MP 和 EP-DP 分片, 层按 PP 切分. 改这些并行度, 只改变每个 rank 持有哪一片, 不改变底层的 tensor 值.

<!-- page 98 of 168 -->

| Saved item | Format | Size | 166.7B example (GiB) | What it restores |
| --- | --- | --- | --- | --- |
| FP32 main weights | FP32 | 4P bytes | 621.10 | The authoritative parameter values updated by the optimizer. |
| FP32 first moment | FP32 | 4P bytes | 621.10 | Adam's exponential moving average of gradients. |
| FP32 second moment | FP32 | 4P bytes | 621.10 | Adam's exponential moving average of squared gradients. |
| Optimizer bookkeeping | FP32 scalars | Negligible | &lt; 0.04 | Per-parameter step counters and rolling windows of recent losses and gradient norms. |
| Trainer and run metadata | Mixed | Negligible | &lt; 0.04 | Step, token and epoch counters; data-loader position; random-number-generator state; callbacks; configuration; and data manifest. |
| Total |  | $\approx 12P$bytes | 1,863.33predicted 1,863.29 | BF16 compute weights and MXFP8 compute-weight caches are reconstructed after loading. |

In Table 27, the complete 166.7B-parameter checkpoint occupies **1,863.33 GiB** by file size, within 0.04 GiB of three times its FP32 array size. All remaining checkpoint contents fit in that difference. Topology changes alter the files and chunks written by each rank, but not the dominant 12P payload.

Table 27 里, 166.7B 参数的完整 checkpoint 按文件大小占 **1,863.33 GiB**, 与 FP32 数组大小的三倍只差 0.04 GiB 以内. checkpoint 里其余所有内容都装在这点差额里. 拓扑变化改变的是每个 rank 写出哪些文件和 chunk, 不改变占大头的 $12P$ 负载.

## 12.1 Checkpoint Tensors Are Topology-Independent · checkpoint tensor 与拓扑无关

Olmo identifies each global checkpoint tensor by a **stable key**, global shape, dtype, tensor role (for example, main weight or optimizer moment), canonical element order, and offsets within the global tensor. The physical checkpoint files may still contain chunks shaped by the save topology; topology independence comes from describing where those chunks belong in the global tensor. For example, changing from EP8 to EP4 changes the number of experts held by each EP-MP rank, not the expert identities or their order. FP32 main weights and optimizer states are persisted, while BF16 compute weights, MXFP8 compute-weight caches, communication buffers, and process groups are derived for the active run.

Olmo 用以下信息标识每个全局 checkpoint tensor: **稳定 key**, 全局形状, dtype, tensor 角色 (例如主权重或优化器矩), 规范的元素顺序, 以及在全局 tensor 中的偏移. 物理的 checkpoint 文件里, chunk 的形状仍可能由保存时的拓扑决定; 与拓扑无关, 靠的是写明这些 chunk 在全局 tensor 中的位置. 例如从 EP8 换到 EP4, 变的是每个 EP-MP rank 持有几个 expert, expert 的身份和顺序不变. 持久化的是 FP32 主权重和优化器状态; BF16 计算权重, MXFP8 计算权重缓存, 通信 buffer 和进程组都是为当前运行重新导出的.

## 12.2 Low-Memory Online Conversion · 低显存的在线转换

During saving, dense tensors are already exposed in their checkpoint DTensor layouts (PyTorch Contributors, 2026c). Expert tensors use a **checkpoint-only flat view** that orders the local EP-MP expert shards and records EP-DP sharding or replication. In the normal path this view aliases the live optimizer storage. The distributed checkpoint writer serializes each rank’s local chunks and their global coordinates without first gathering the complete expert tensor on GPU. PP contributes globally named layer keys from each stage rather than encoding PP rank IDs in those keys. In one controlled FP8 development run, save-time peak allocated and reserved memory remained at their pre-save values of 93.1 and 121.4 GiB; this is a save-side measurement only.

保存时, dense tensor 本来就以 checkpoint 所用的 DTensor 布局暴露出来 (PyTorch Contributors, 2026c). expert tensor 用一个**只给 checkpoint 用的扁平视图**, 它给本地的 EP-MP expert 分片排好顺序, 并记录 EP-DP 上是分片还是复制. 正常路径下, 这个视图直接别名到活着的优化器存储上. 分布式 checkpoint writer 序列化每个 rank 的本地 chunk 及其全局坐标, 不需要先在 GPU 上 gather 出完整的 expert tensor. PP 的每个 stage 提交带全局名字的层 key, 不把 PP rank ID 编进 key. 在一次受控的 FP8 开发期运行中, 保存时的峰值 allocated 和 reserved 显存保持在保存前的 93.1 GiB 和 121.4 GiB; 这只是保存一侧的测量.

During loading, the destination run first constructs the shards required by its requested topology (PyTorch Contributors, 2026g). The reader stages saved chunks on CPU, copies the intersections needed by those targets, and restores the FP32 main weights maintained by the distributed optimizer. A direct training load then reconstructs the BF16 compute weights and MXFP8 compute-weight caches.

加载时, 目标运行先按它要的拓扑构造所需的分片 (PyTorch Contributors, 2026g). reader 把保存的 chunk 暂放在 CPU 上, 拷贝这些目标分片需要的交集部分, 恢复由分布式优化器维护的 FP32 主权重. 直接用于训练的加载随后再重建 BF16 计算权重和 MXFP8 计算权重缓存.

<!-- page 99 of 168 -->

## 12.3 Topology Changes and Model Conversion · 拓扑变化与模型转换

Topology-agnostic loading changes placement, not the model schema. The source and destination must agree on parameter names, shapes, tensor roles, and canonical ordering. Changing DP, EP, EP-DP, or PP is a **topology change** that redistributes those same global tensors; changing the number of experts, hidden width, or layer structure is a **model conversion**.

与拓扑无关的加载只改摆放, 不改模型结构. 源和目标在参数名, 形状, tensor 角色和规范顺序上必须一致. 改 DP, EP, EP-DP 或 PP 属于**拓扑变化**, 只是把同一组全局 tensor 重新分布; 改 expert 数, 隐层宽度或层结构属于**模型转换**.

As a result, one checkpoint can resume or resize an experiment under a different DP, EP, or PP layout, and it can be inspected or converted without a separate full-checkpoint GPU conversion job.

因此, 同一个 checkpoint 可以在不同的 DP, EP 或 PP 布局下续训或改变实验规模, 也可以直接检查或转换, 不需要另跑一个针对完整 checkpoint 的 GPU 转换任务.

## 13 Activation Recompute · Activation recompute

**Recompute converts retained-activation memory into repeated forward computation.** Persistent training state—parameters, gradient buffers, and optimizer states—is fixed by the model and its sharding (Sections 4 and 12). Saved activations behave differently: they grow with the rank microbatch, the sequence length, and the number of blocks whose backward has not yet run, and they dominate the transient part of peak memory. Activation checkpointing reduces this component by retaining a checkpoint region’s boundary input instead of all of its internal forward activations (Chen et al., 2016). Before the region’s backward computation, the forward operations are recomputed to regenerate the values that backward needs. Figure 60 shows this trade for a mixed four-layer example.

**recompute 把保留 activation 的显存换成重复的 forward 计算.** 常驻的训练状态, 即参数, 梯度 buffer 和优化器状态, 由模型和它的分片方式决定 (§4 和 §12). 保存的 activation 不同: 它随 rank microbatch, 序列长度, 以及还没跑 backward 的 block 数增长, 是峰值显存里瞬态部分的大头. activation checkpointing 只保留 checkpoint 区域的边界输入, 不保留区域内全部 forward activation, 以此压低这一部分 (Chen et al., 2016). 在该区域的 backward 之前, 重新跑一遍 forward, 生成 backward 需要的值. Figure 60 用一个混合的四层例子展示这种取舍.

![Image block](images/p99-figure-60-layer-recompute-trades-additional-forward-work-for.jpg)

Figure 60 Layer recompute trades additional forward work for lower activation memory. In this illustrative schedule, F0 and F1 are checkpointed, whereas F2 and F3 retain their backward-needed activations. Checkpointing discards F0/F1’s internal activations but retains their boundary inputs; the two forwards are therefore recomputed immediately before B1 and B0. The 5 GB increments and smooth memory curve illustrate the accounting and are not measurements from a training run.

The amount of recomputation also depends on the checkpoint implementation. PyTorch’s non-reentrant variant stops recomputing once it has regenerated every tensor needed by the pending backward computation, rather than necessarily executing the entire checkpointed region again (PyTorch Contributors, 2026e). Figure 61 illustrates this early-stop behavior.

重算量还取决于 checkpoint 的实现. PyTorch 的 non-reentrant 版本一旦重新生成了待执行的 backward 所需的全部 tensor, 就停止重算, 不一定把整个 checkpoint 区域再跑一遍 (PyTorch Contributors, 2026e). Figure 61 展示这种提前停止.

<!-- page 100 of 168 -->

![Image block](images/p100-regular-forward-backward.jpg)

> 图注: regular forward backward.

Regular Forward-Backward

![Image block](images/p100-figure-61-non-reentrant-checkpointing-can-stop-recomputation-early.jpg)

> 图注: figure 61 non reentrant checkpointing can stop recomputation early.

Checkpointed Forward-Backward

Figure 61 Non-reentrant checkpointing can stop recomputation early. A regular forward saves the intermediate values required by each backward operator. A checkpointed forward instead retains the region input $x _ { 0 }$ and discards $x _ { 1 }$ and $x _ { 2 } .$ During backward, the region is recomputed until those required values have been regenerated. In this simplified example, Op 3’s forward need not be recomputed because Op 3 backward requires $x _ { 2 }$ , while the original checkpoint output $x _ { 3 }$ remains available to downstream computation. The general stopping condition is determined by backward’s tensor requirements, not merely by the position of an operator in the region.

## 13.1 Choosing Recompute Granularity · 选择 recompute 粒度

The choice of checkpoint region determines which activations are retained and which operations repeat (Ko rthikanti et al., 2023; Jain et al., 2020). The DDP training stack selects among block-level and sub-block regions through its model configuration, summarized in Table 28. Per-block recompute, which the production recipes call per-layer recompute, wraps every transformer block, so backward holds only one block’s regenerated activations at a time. Chunk recompute instead wraps the entire block stack in a single region: only the embedding output is retained, and the stack recomputes from that boundary during backward. Selectedblock recompute wraps only blocks named by key, and two sub-block options wrap the attention region or the routed-expert compute and unpermute region inside an otherwise unwrapped block. The stack accepts one block-level policy at a time, and TBO (Section 15.3) rejects configurations that enable per-block recompute.

checkpoint 区域怎么划, 决定了保留哪些 activation, 重复哪些运算 (Korthikanti et al., 2023; Jain et al., 2020). DDP 训练栈通过模型配置在 block 级和 sub-block 级区域之间选择, 汇总见 Table 28. per-block recompute (生产配方里叫 per-layer recompute) 给每个 transformer block 各包一层, 所以 backward 任一时刻只持有一个 block 重新生成的 activation. chunk recompute 则把整个 block 栈包成一个区域: 只保留 embedding 输出, backward 时整个栈从这个边界重算. selected-block recompute 只包按 key 指定的 block; 另有两个 sub-block 选项, 在不整体包裹的 block 内部, 分别只包 attention 区域, 或只包 routed-expert 计算加 unpermute 区域. 训练栈一次只接受一种 block 级策略, TBO (§15.3) 会拒绝开启了 per-block recompute 的配置.

Recomputation must be deterministic to be correct. The wrappers do not snapshot random-number-generator state: the DDP block rejects dropout by construction, and router jitter is disabled in every recipe in this report, so a recomputed forward is a pure function of the retained boundary input. The DeepEP v2 path was additionally validated with the reentrant checkpoint variant under compilation, which always recomputes the complete region.

重算必须是确定性的才正确. 这些 wrapper 不保存随机数发生器的状态快照: DDP block 在构造上就拒绝 dropout, 本报告所有配方都关掉了 router jitter, 所以重算的 forward 是保留下来的边界输入的纯函数. DeepEP v2 路径还额外在编译模式下用 reentrant checkpoint 版本验证过, 这个版本总是把整个区域重算一遍.

<!-- page 101 of 168 -->

| Policy | Checkpointed region | Retained at the boundary |
| --- | --- | --- |
| Per-block | Every transformer block | Each block's input; used by the measured endpoint below and, per layer, by the Ultra production recipe of Section 14 |
| Chunk | The whole block stack as one region | Only the embedding output; maximal recomputation for minimal retention |
| Selected blocks | Blocks named by key | The named blocks' inputs; other blocks save normally |
| Attention region | The attention sub-region of a block | The sub-region input; expert compute and EP transport save normally |
| MoE expert region | The routed-expert compute and the unpermute that follow dispatch, on the block all-to-all EP path | The permuted expert input; dispatch and combine transport save normally |

## 13.2 Recomputing a Routed Block Repeats Its Communication · 重算 routed block 会重复它的通信

For a dense block, recomputation repeats local compute. For a routed block, the checkpointed region contains the router, dispatch, expert compute, and combine, so recomputation also **re-executes the expert-parallel communication** during backward. The recomputed forward reproduces the same scores and the same top-K routes from the same boundary input, so the re-executed dispatch moves the same rows to the same destination ranks. The memory–time trade for a routed block therefore counts repeated transport, not only repeated FLOPs, and the measured cost below includes both.

对 dense block, 重算只重复本地计算. 对 routed block, checkpoint 区域里包含 router, dispatch, expert 计算和 combine, 所以重算会在 backward 期间**再执行一遍 expert 并行通信**. 重算的 forward 从同一个边界输入得到相同的分数和相同的 top-K 路由, 因此再执行的 dispatch 把同样的行送到同样的目标 rank. 所以 routed block 的显存与时间取舍, 要算上重复的传输, 不只是重复的 FLOPs; 下文的实测开销两者都包含了.

Checkpointing also changes the rowwise path’s buffer policy. The lease system of Section 5.7 exists to keep a symmetric-memory payload alive from forward to its backward consumer. Under a checkpointed forward, the first pass discards its intermediates, and the recompute pass regenerates payloads immediately before they are consumed. The rowwise path therefore detects that it is running inside a checkpoint region and switches from leased symmetric buffers to per-call scratch buffers for combine outputs, rather than holding pool blocks whose saved contents no backward will read.

checkpointing 还改变了 rowwise 路径的 buffer 策略. §5.7 的租约机制, 是为了让 symmetric memory 里的负载从 forward 一直活到它在 backward 的消费方. 在 checkpoint 过的 forward 下, 第一遍会丢掉中间结果, 重算那一遍在消费前一刻才重新生成负载. 所以 rowwise 路径会检测自己是否运行在 checkpoint 区域内; 如果是, combine 输出就不再用租来的 symmetric buffer, 改用每次调用的临时 buffer, 免得占着一些池块, 里面存的内容却没有任何 backward 会读.

**Metrics are accumulated only once.** Router statistics, load-balancing metrics, and auxiliary-loss accumulators are forward side effects, and a recomputed forward would count every routed microbatch twice. The checkpoint context therefore distinguishes the original forward from recomputation, and the router and rowwise paths accumulate metrics and auxiliary-loss statistics **only in the original pass**. This keeps the balance-scope accounting of Section 10 intact under any recompute policy.

**指标只累计一次.** router 统计, 负载均衡指标和辅助 loss 的累加器都是 forward 的副作用, 重算的 forward 会把每个 routed microbatch 算两遍. 所以 checkpoint 上下文会区分原始 forward 和重算, router 与 rowwise 路径**只在原始那一遍**累计指标和辅助 loss 统计. 这样不管用哪种 recompute 策略, §10 按 balance scope 的统计都不受影响.

One recompute mechanism in the router is independent of block policy. The router computes its logits from an FP32 cast of the block’s BF16 activation. Saving that cast would retain a four-byte copy of every routed token solely for the router linear’s backward, so the router materializes the FP32 input through an **outputdiscard checkpoint**: the storage is released after the logits are produced and regenerated immediately before the router linear’s backward consumes it. The BF16 activation remains the only persistent copy.

router 里有一处重算机制与 block 策略无关. router 用 block 的 BF16 activation 转成 FP32 后的值来算 logits. 如果把这份 FP32 副本存下来, 就要为每个 routed token 多留一份 4 字节的拷贝, 只为了 router linear 的 backward. 所以 router 通过一个 **output-discard checkpoint** 生成这份 FP32 输入: 算完 logits 就释放存储, 等 router linear 的 backward 要用之前再重新生成. 常驻的只有 BF16 activation 这一份.

## 13.3 Composition with Pipeline Schedules · 与 pipeline 调度的组合

In the pipeline schedules of Section 6, a stage retains activations for every in-flight microbatch, so its activation footprint is **the product of the in-flight count and the per-microbatch footprint**. Recompute shrinks the second factor: a stage that checkpoints its blocks holds boundary inputs for each in-flight microbatch instead of full activation sets, at the cost of recomputing those blocks inside the backward phase of the schedule. This is the regime in which the production Ultra operating points run: at 58B active parameters with PP8, the recipe of Section 14 combines MXFP8 with per-layer recompute to stay within the memory budget. Recomputation can also repeat communication: regenerating the needed activations may require rerunning

<!-- page 102 of 168 -->

collectives, such as context-parallel attention or a routed block’s dispatch and combine. Sub-block policies can keep these operations outside the recomputed region.

在 §6 的 pipeline 调度里, 一个 stage 要为每个在途 microbatch 保留 activation, 所以它的 activation 占用是**在途 microbatch 数乘以单个 microbatch 的占用**. recompute 缩小的是第二个因子: 对 block 做了 checkpoint 的 stage, 为每个在途 microbatch 只存边界输入, 不存完整的 activation 集合, 代价是在调度的 backward 阶段里重算这些 block. 生产环境的 Ultra 工作点就在这个区间: 激活 58B, PP8, §14 的配方把 MXFP8 和 per-layer recompute 结合起来, 才压进显存预算. 重算也可能重复通信: 重新生成所需 activation 时, 可能要重跑 collective, 例如 context-parallel attention, 或 routed block 的 dispatch 和 combine. sub-block 策略可以把这些操作留在重算区域之外.

## 13.4 Measured Memory–Throughput Trade-Off · 实测的显存与吞吐取舍

We measured full per-block recompute in a matched four-GPU training run whose configuration is summarized in Table 29. Throughput is total useful tokens divided by total elapsed time over the timed window, repeated in three fresh processes with the execution order balanced across variants.

我们在一组对齐的 4 卡训练里测了完整的 per-block recompute, 配置见 Table 29. 吞吐取计时窗口内的有效 token 总数除以总耗时, 每种变体在三个全新进程里各重复一次, 变体之间的执行顺序做了平衡.

| Setting | Value |
| --- | --- |
| Model | One dense block followed by seven MoE blocks; d<sub>model</sub> = 4096; expert hidden size 4096 |
| Experts and routing | 32 routed experts, top-4, one shared expert; uniform routes and zero token drops |
| Hardware and parallelism | Four B300 GPUs, EP = 4 |
| Batch | Two 8192-token sequences per rank microbatch; 524,288 tokens per optimizer step |
| Matched across variants | BF16 execution, identical normally initialized weights, identical input batches |
| Timing window | Steps 1-14 untimed (compilation and caches); throughput over steps 15-24 |
| Repetitions | Three fresh processes per variant |

![Image block](images/p102-figure-62-block-recompute-removes-nearly-two-thirds-of.jpg)

> 图注: figure 62 block recompute removes nearly two thirds of.

Bars: arithmetic means · dots: three independent 10-step windows · whiskers: ±1 sample SD (smaller than the dots here) · lower segment: persistent memory resident between steps

**Figure 62 Block recompute removes nearly two thirds of activation memory at a one-fifth throughput cost in this matched configuration.** Bars show the arithmetic mean of three fresh-process repetitions; dots show the individual ten-step windows, and the sample standard deviations are smaller than the dot markers. Normal training in this campaign sustains 54.68K tokens/s/GPU at 103.03 GiB peak active memory; recomputing every transformer block sustains 43.22K tokens/s/GPU at 76.90 GiB, 20.95% lower throughput for 26.13 GiB (25.36%) less peak memory. The lower segment of each memory bar, labeled “persistent”, is the memory resident between steps (parameters, gradient buffers, optimizer states, and persistent buffers), 62.21 GiB in both modes; the reduction therefore falls entirely on the transient activation part, which shrinks from 40.82 to 14.69 GiB. Measurements use four NVIDIA B300 GPUs and the fixed model, batch, routing, and timing protocol described in the text.

The saving comes entirely out of activations. Persistent state—the parameters, gradient buffers, optimizer states, and persistent buffers resident between steps—is identical in both variants, so the 26.13 GiB reduction removes nearly two thirds of the transient part of the peak.

省下的显存全部来自 activation. 常驻状态, 即步与步之间驻留的参数, 梯度 buffer, 优化器状态和常驻 buffer, 在两种变体里完全相同, 所以减少的 26.13 GiB 拿掉了峰值里瞬态部分的近三分之二.

The profile shows which work repeats. A normal train\_batch contains 64 projected block-forward ranges: eight blocks across eight rank-local microbatches. Per-block recompute raises that count to 128 because each block forward is recomputed during backward, and for the seven routed blocks each recomputation includes dispatch and combine. The summed GEMM and attention kernel duration rises by 24.8%, while the projected rank-0 GPU span rises by 26.7%, closely matching the independently measured 26.5% increase in time per unit of useful work. These duration sums are work indicators rather than an additive wall-time decomposition because kernels on different streams can overlap.

profile 显示了哪些工作被重复. 正常的一个 `train_batch` 包含 64 段 block forward: 8 个 block 乘 8 个 rank 本地 microbatch. per-block recompute 把这个数提到 128, 因为每个 block 的 forward 都在 backward 时重算一遍; 7 个 routed block 的每次重算都包含 dispatch 和 combine. GEMM 与 attention kernel 的总时长增加 24.8%, rank 0 的 GPU span 增加 26.7%, 与独立测得的「单位有效工作耗时增加 26.5%」很接近. 这些时长之和只是工作量指标, 不能相加成 wall time 的分解, 因为不同 stream 上的 kernel 会重叠.

> **拆开:** §13.4 里 per-block recompute 把 block forward 从 64 段翻到 128 段, 为什么 GEMM 与 attention kernel 时间只涨 24.8%, 低于「backward 约为 forward 两倍, 多一遍 forward 就多 1/3」给出的约 33%?
> 答: 先对数: 单位工作耗时涨 26.5%, 对应吞吐降到 $1/1.265\approx0.790$, 正好是 Figure 62 的 -20.95%, 两个口径自洽. 33% 的估算假设 backward 恰好是 forward 的 2 倍. 偏低的可能来源有三处. 第一, attention backward 要重算 softmax, 通常比 forward 贵出两倍以上, 分母变大, 比例就下降. 第二, 输出 logits 和 LM head 不在 transformer block 里, 不参与重算, 却算在 GEMM 总时长里; Table 32 的说明提到 logits 在 40.8 GiB 瞬态峰值里有份, 说明这部分不小. 第三, 正常模式下 router 输入本来就走 §13.2 的 output-discard checkpoint, 两种模式都有这一点重算, 抵掉了一小截差值. §13 引言说的 non-reentrant 提前停止也可能少算最后一个算子. 各项各占多少报告没拆, 只是从已知数字推出的说法, 没有数据验证. 能确定的是 24.8%, 26.7%, 26.5% 三个数很接近, 说明多出来的时间基本就是重复计算本身, 重跑 dispatch 和 combine 没有引入明显的额外等待.

<!-- page 103 of 168 -->

Full per-block recompute is useful when the 26.13 GiB reduction enables a larger microbatch, a deeper pipeline stage, or a model that would otherwise not fit, and this is how the Ultra production recipe uses it. When memory already fits, the measured 20.95% throughput cost favors retaining activations or selecting a narrower checkpoint region from Table 28. The report makes no timing claim for the chunk, selected-block, or sub-block policies; their checkpoint mechanism is the same, but their region boundaries and retained inputs differ.

当这 26.13 GiB 能换来更大的 microbatch, 更深的 pipeline stage, 或者让本来放不下的模型放得下时, 完整的 per-block recompute 就有用; Ultra 生产配方正是这样用它的. 如果显存本来就够, 实测 20.95% 的吞吐代价说明应该保留 activation, 或者从 Table 28 里选一个更窄的 checkpoint 区域. 报告对 chunk, selected-block 和 sub-block 策略不做耗时上的结论; 它们的 checkpoint 机制相同, 但区域边界和保留的输入不同.

## 13.5 Choosing a Recompute Policy · 选择 recompute 策略

Transient memory can also be reduced through microbatch size and activation precision. A smaller rank microbatch reduces every saved activation at once but pushes grouped GEMMs toward the throughput crossover of Section 9, since fewer rows reach each expert. MXFP8 activation saving (Section 11) stores selected saved activations as qdata and scales instead of BF16, shrinking them without repeating any forward work. Recompute removes saved activations entirely, at the price of the recomputed region’s forward time. The Ultra recipe of Section 14 combines MXFP8 compute with per-layer recompute to keep the model within device memory.

瞬态显存也可以靠 microbatch 大小和 activation 精度来压. 更小的 rank microbatch 一次缩小所有保存的 activation, 但每个 expert 拿到的行变少, grouped GEMM 会被推向 §9 的吞吐交叉点. MXFP8 activation saving (§11) 把选定的保存 activation 存成 qdata 和 scales 而不是 BF16, 不重复任何 forward 就能缩小它们. recompute 则彻底去掉保存的 activation, 代价是重算区域的 forward 时间. §14 的 Ultra 配方把 MXFP8 计算和 per-layer recompute 结合起来, 让模型放进单卡显存.

Choosing a region starts with how much memory must be freed and which operations would repeat. A useful starting point is the smallest region that meets the memory budget, preferably excluding expert-parallel transport. The sub-block regions of Table 28 repeat attention or the routed-expert compute and unpermute, and neither repeats expert-parallel transport. Selected blocks cover a moderate shortfall at a cost proportional to the share of blocks named. Per-block recompute can accommodate a deep pipeline stage with many inflight microbatches, at about a quarter more time per unit of useful work in this shape. Chunk recompute, which retains only the embedding output, remains for models that do not fit even with per-block boundary inputs.

选区域先看要腾出多少显存, 以及哪些操作会被重复. 一个好用的起点是满足显存预算的最小区域, 最好不包含 expert 并行传输. Table 28 的两个 sub-block 区域分别重复 attention, 或 routed-expert 计算加 unpermute, 都不重复 expert 并行传输. selected blocks 适合缺口不大的情况, 代价与被指定的 block 占比成正比. per-block recompute 能撑住在途 microbatch 很多的深 pipeline stage, 在这个形状下单位有效工作耗时多约四分之一. chunk recompute 只保留 embedding 输出, 留给连 per-block 边界输入都放不下的模型.

**Section takeaway.** Checkpoint-region selection determines both memory savings and repeated work. For a complete routed block, that work includes dispatch and combine; metrics, however, are accumulated only on the original forward. At the measured operating point, per-block recompute removes nearly two thirds of activation memory, or one quarter of the peak, at a one-fifth throughput cost. The Ultra recipes accept this cost because the model otherwise exceeds the memory budget.

**本节要点.** checkpoint 区域的选择同时决定省多少显存和重复多少工作. 对完整的 routed block, 重复的工作包括 dispatch 和 combine; 但指标只在原始 forward 上累计. 在实测工作点上, per-block recompute 去掉近三分之二的 activation 显存, 即峰值的四分之一, 吞吐代价是五分之一. Ultra 配方接受这个代价, 因为不这样模型就超出显存预算.

## 14 Production Training Throughput · 生产训练吞吐

The preceding sections measured individual mechanisms and controlled combinations. Here we report **complete training configurations**, from Tiny to Ultra, with their model scale, batch, topology, precision, recompute policy, and useful-model TFLOP/s/GPU. These runs establish feasible operating points; their different configurations limit comparisons between them.

前面各节测的是单个机制和受控的组合. 这里报告从 Tiny 到 Ultra 的**完整训练配置**, 包括模型规模, batch, 拓扑, 精度, recompute 策略和有效模型 TFLOP/s/GPU. 这些运行证明了哪些工作点可行; 它们彼此配置不同, 相互之间能比的东西有限.

## 14.1 Production Run Matrix · 生产运行矩阵

**The headline runs use random routing.** Random routing removes the changing expert-load distribution of a learned router and gives a quickly stable reference for the training system. It does not measure model quality or the throughput ultimately reached by a learned router, so every row in Table 30 is labeled as a systems reference rather than a time-to-quality result. All runs use sequence length 8192, top-4 routing, one shared expert, NVIDIA B300 GPUs, and eight GPUs per node. Tiny uses 16 GPUs, Small and Medium use 128, and Large and Ultra use 512.

**主表的运行都用随机路由.** 随机路由去掉了学习型 router 不断变化的 expert 负载分布, 给训练系统一个很快就稳定下来的参照. 它测不了模型质量, 也测不了学习型 router 最终能达到的吞吐, 所以 Table 30 每一行都标为系统参照, 不是达到某个质量所需时间的结果. 所有运行都用序列长度 8192, top-4 路由, 1 个 shared expert, NVIDIA B300, 每节点 8 卡. Tiny 用 16 卡, Small 和 Medium 用 128 卡, Large 和 Ultra 用 512 卡.

Each run contributes a representative rate read from its throughput curve, and we select the **highest observed rate** across each configuration’s runs. Some configurations were launched more than once; environmental problems were suspected in the lower-rate repeats, but their causes were not established. These readings are neither repetition averages nor estimates of the hardware ceiling, and they do not come from one synchronized timing window.

每次运行从吞吐曲线上读一个代表性速率, 每个配置取其各次运行中的**最高观测速率**. 有些配置启动过不止一次; 速率较低的那几次怀疑是环境问题, 但原因没有查实. 这些读数既不是重复的平均值, 也不是硬件上限的估计, 而且不来自同一个同步的计时窗口.

<!-- page 104 of 168 -->

We report **BF16-reference MFU** (Equation 95), using the B300’s dense BF16 peak of 2,250 TFLOP/s/GPU (NVIDIA, 2026r). These percentages are derived from the throughput readings, not separately measured. We keep the same denominator for MXFP8, whose execution mixes precisions; its percentage is therefore a BF16 reference, not utilization of the FP8 peak. The table also gives the parameter activation ratio $\alpha _ { P } = P _ { \mathrm { a c t i v e } } / P _ { \mathrm { t o t a l } }$ defined in Equation 3.

我们报告 **BF16 参照 MFU** (式 95), 分母用 B300 的 dense BF16 峰值 2,250 TFLOP/s/GPU (NVIDIA, 2026r). 这些百分比由吞吐读数换算而来, 没有单独测量. MXFP8 的执行混合了多种精度, 我们沿用同一个分母, 所以它的百分比是 BF16 参照值, 不是 FP8 峰值的利用率. 表里还给出式 3 定义的参数激活比 $\alpha _ { P } = P _ { \mathrm { a c t i v e } } / P _ { \mathrm { t o t a l } }$.

| Operating point | Active @ total Parameter activation | GBS | EP / PP | Precision | Recompute | TFLOP/s/GPU MFU (BF16 ref.) |
| --- | --- | --- | --- | --- | --- | --- |
| Tiny-64E | 1.59B @ 12.91B$\alpha_P = 12.3\%$ | 8 Mi | 1 / 1 | BF16 | No | 90340.1% |
| Small-64E | 4.29B @ 40.86B$\alpha_P = 10.5\%$ | 24 Mi | 8 / 1 | BF16 | No | 84137.4% |
| Medium-64E | 7.37B @ 70.22B$\alpha_P = 10.5\%$ | 16 Mi | 8 / 2 | BF16 | No | 85337.9% |
| Medium-96E | 7.38B @ 103.75B$\alpha_P = 7.11\%$ | 24 Mi | 8 / 2 | BF16 | No | 85538.0% |
| Medium-128E | 7.38B @ 137.27B$\alpha_P = 5.38\%$ | 24 Mi | 8 / 4 | BF16 | No | 84337.5% |
| Large-128E | 15.14B @ 295.99B$\alpha_P = 5.12\%$ | 32 Mi | 8 / 4 | BF16 | No | 76834.1% |
| Ultra-128E | 58.36B @ 1.200T$\alpha_P = 4.86\%$ | 64 Mi | 8 / 8 | MXFP8 | Yes | 85838.1% |
| Ultra-256E | 58.41B @ 2.380T$\alpha_P = 2.45\%$ | 64 Mi | 32 / 8 | MXFP8 | Yes | $689^‡$30.6% |

## 14.2 Throughput Across Model Sizes · 不同模型规模下的吞吐

**Stored expert capacity grows faster than active compute.** The three Medium configurations hold active parameters nearly constant while increasing total capacity from 70.22B to 137.27B. Their selected observed throughputs remain in a narrow 843–855 TFLOP/s/GPU band, but their global batches and PP degrees are not all matched. The result shows feasible operating points at each capacity; it does not isolate the cost of adding experts.

**存储的 expert 容量涨得比激活计算快.** 三个 Medium 配置的激活参数几乎不变, 总容量从 70.22B 增加到 137.27B. 它们选出的观测吞吐落在 843 到 855 TFLOP/s/GPU 的窄带里, 但全局 batch 和 PP 度并不都一致. 这个结果说明每种容量下都有可行的工作点, 但没有单独剥离出加 expert 的代价.

**Learned routing runs below the random reference.** The learned-routing companions in Appendix B.10 show a gap of about one percent at Tiny without EP, and about nine percent at Small with EP8, where a learned router’s changing expert loads reduce throughput. These companions show how optimistic the random-routing reference can be; Section 10 examines the associated load imbalance.

**学习型路由的吞吐低于随机参照.** 附录 B.10 的学习型路由对照组显示: Tiny 不开 EP 时差约 1%, Small 开 EP8 时差约 9%, 后者是学习型 router 不断变化的 expert 负载拖慢了吞吐. 这些对照说明随机路由参照可能偏乐观到什么程度; 相应的负载不均见 §10.

**Memory capacity limits the largest operating points.** Large-128E runs at the smallest rank microbatch of any BF16 operating point in the matrix, a choice made under memory pressure. At Ultra scale,

<!-- page 105 of 168 -->

MXFP8 is as much a capacity strategy as a compute format, and the recipe still requires per-layer recomputation (Section 13). Recomputing those activations adds forward work, so despite MXFP8, Ultra-128E’s 858 TFLOP/s/GPU stays close to the smaller BF16 points. Its 64-Mi-token global batch and PP8 topology also differ from Large-128E’s 32-Mi-token batch and PP4 topology, preventing a precision-only comparison. Ultra-256E further changes EP from 8 to 32 and uses the DeepEP v2 path; its nine measured steps establish only that the configuration ran at the reported rate during a short, still-changing window.

**显存容量限制了最大的几个工作点.** 在矩阵里所有 BF16 工作点中, Large-128E 的 rank microbatch 最小, 这是在显存压力下做的选择. 到 Ultra 规模, MXFP8 既是计算格式, 也是一种容量手段, 而且配方仍需 per-layer recompute (§13). 重算这些 activation 增加了 forward 工作, 所以尽管用了 MXFP8, Ultra-128E 的 858 TFLOP/s/GPU 仍与较小的 BF16 工作点相近. 它的 64 Mi token 全局 batch 和 PP8 拓扑也与 Large-128E 的 32 Mi token batch 和 PP4 拓扑不同, 无法只比精度. Ultra-256E 进一步把 EP 从 8 改到 32, 并走 DeepEP v2 路径; 它只测了 9 步, 只能证明这个配置在一个短的, 仍在变化的窗口里跑到了报告的速率.

Across these configurations, the stack supports 12.9 billion to 1.2 trillion total parameters, with the 2.38- trillion-parameter extension demonstrated in the short run described above.

在这些配置上, 训练栈支持 12.9B 到 1.2T 的总参数量; 2.38T 参数的扩展只在上面那次短运行里演示过.

## 15 Optimization Attempts and Lessons · 尝试过的优化与教训

We also tested approaches that we did not adopt in the training recipes. They targeted saved activations, exposed communication, conversion kernels, host launch overhead, and the number of separate kernels in the MoE path. In several cases, reducing one cost increased another: offload exceeded the host-link bandwidth budget, overlap slowed concurrent kernels, and preserving the natural MXFP8 layout made Wgrad slower. Other attempts required more integration work than their prototypes justified. CUDA Graph replay needed pipeline-aware activation storage, while the megakernel needed a complete distributed training runtime.

我们还测试过一些最终没有进入训练配方的方案. 它们针对的分别是保存的 activation, 暴露在外的通信, 转换 kernel, host 侧 launch 开销, 以及 MoE 路径里独立 kernel 的数量. 有几项是降了一种开销又抬高另一种: offload 超出了 host 链路的带宽预算, overlap 拖慢了并发的 kernel, 保留天然 MXFP8 布局让 Wgrad 变慢. 另一些则需要的集成工作量超过了原型能证明的收益: CUDA Graph replay 需要感知 pipeline 的 activation 存储, megakernel 需要一整套分布式训练运行时.

| Direction | Intended benefit | Why it was not adopted | Limiting requirement |
| --- | --- | --- | --- |
| CPU activation offload | Lower saved-activation memory | The GPU produces activation bytes about six times faster than PCIe can move them to and from host memory; pinned host memory and prefetch scheduling add substantial machinery. | Host bandwidth or compression sufficient to match activation production. |
| Wave overlap | Hide dispatch and combine under expert compute | Waves reduce expert-GEMM size, while concurrent GPU communication stretches both the communication and GEMM regions on many tested shapes. | Enough hidden communication to offset smaller GEMMs and concurrent-kernel slowdown. |
| Two-batch overlap | Pipeline two half-batches through adjacent MoE blocks | The rowwise NVSHMEM kernels and the other lane's compute compete for the same GPU resources; the extra lane also increases host scheduling. | Lower communication interference or less host work through replay. |
| MegaMoE megakernel | Coordinate communication and expert compute inside persistent CUDA kernels | The kernel grew into a distributed training-runtime project before it had a production backward and inter-node path. | Production-shaped forward scheduling, full backward, and inter-node transport. |
| Natural-layout MXFP8 Wgrad | Eliminate global dequantization before Wgrad | The naturally produced scales do not match Wgrad's reduction layout; the prototype lost to global dequantization plus tuned BF16 grouped GEMM. | Wgrad-oriented requantization plus native block-scaled GEMM faster than the converted path. |
| Static CUDA Graphs | Remove repeated host launch work | Stable graph addresses conflict with several live pipeline microbatches; safe staging adds copies and memory. | Schedule-indexed saved-context storage with replay savings that exceed staging and retention costs. |

<!-- page 106 of 168 -->

## 15.1 CPU Activation Offload Was Limited by PCIe · CPU activation offload 受限于 PCIe

CPU activation offload exchanges GPU memory for host-link traffic. After a forward layer produces tensors that autograd will need later, the runtime copies selected tensors from device to host (D2H), releases their GPU storage, and copies them back from host to device (H2D) before the corresponding backward operation. Every offloaded byte therefore crosses the host link twice over one training step. Overlap can hide these copies only if the link drains tensors at least as quickly as the forward pass produces them and returns them within the backward prefetch window. Activation offload follows a line of work exemplified by vDNN (Rhu et al., 2016); the decision here concerns its service-rate balance on the measured Olmo workload.

CPU activation offload 用 host 链路流量换 GPU 显存. 某个 forward 层产出 autograd 之后要用的 tensor 后, 运行时把选定的 tensor 从 device 拷到 host (D2H), 释放它们的 GPU 存储, 在对应的 backward 运算之前再从 host 拷回 device (H2D). 所以在一个训练步里, 每个被 offload 的字节都要过两次 host 链路. 只有当链路排出 tensor 的速度不低于 forward 产生它们的速度, 并且能在 backward 的预取窗口内送回时, overlap 才能把这些拷贝藏住. activation offload 属于以 vDNN (Rhu et al., 2016) 为代表的一类工作; 这里的取舍看的是它在实测 Olmo 负载上的服务速率是否平衡.

Let A be the selected activation bytes produced during one layer interval, $t _ { f }$ the corresponding forward production interval, and $t _ { b }$ the usable backward prefetch interval. If $B _ { \mathrm { D 2 H } }$ and $B _ { \mathrm { H 2 D } }$ are the sustained pinned-memory bandwidths, necessary service-rate conditions are

设 $A$ 为一个层间隔内产生的选定 activation 字节数, $t _ { f }$ 为对应的 forward 产出时间, $t _ { b }$ 为 backward 可用的预取时间. 若 $B _ { \mathrm { D 2 H } }$ 和 $B _ { \mathrm { H 2 D } }$ 为 pinned memory 的持续带宽, 服务速率的必要条件是:

$$
B _ {\mathrm{D2H}} \geq \frac {A}{t _ {f}}, \qquad B _ {\mathrm{H2D}} \geq \frac {A}{t _ {b}}.\tag{61}
$$

When $A / t _ { f }$ exceeds $B _ { \mathrm { D 2 H } }$ , each layer produces a larger copy backlog than PCIe can retire. Moving the copy earlier cannot remove that backlog, even on a separate CUDA stream; it only changes where the eventual wait appears. We write the required-to-available D2H bandwidth ratio as $\rho = ( A / t _ { f } ) / B _ { \mathrm { D 2 H } }$

当 $A / t _ { f }$ 超过 $B _ { \mathrm { D 2 H } }$ 时, 每一层积压的拷贝都多于 PCIe 能清掉的量. 把拷贝提前发出, 哪怕放在单独的 CUDA stream 上, 也消不掉这份积压, 只是改变最终的等待出现在哪里. 我们把 D2H 的所需带宽与可用带宽之比记为 $\rho = ( A / t _ { f } ) / B _ { \mathrm { D 2 H } }$.

Table 32 works the inequality for the routed block of the four-B300 benchmark of Section 13, using that profile’s GPU-projected layer timings and an activation inventory implied by the block’s autograd graph at its shape $( T = 1 6 { , } 3 8 4$ tokens per rank microbatch, $d = h = 4 0 9 6$ , top-4 routing, one shared expert, BF16). The inventory counts valid routed rows only. As an aggregate consistency check, the inventory summed over the seven routed blocks, the dense block, and the output logits is within a few percent of the measured 40.8 GiB transient peak. The logits are not offload candidates, so the table’s whole-microbatch traffic excludes them.

Table 32 针对 §13 那组 4 张 B300 基准里的 routed block, 把这个不等式算了一遍. 时间取那份 profile 里投影到 GPU 上的层耗时; activation 清单按该 block 在此形状下的 autograd 图推出 (每个 rank microbatch $T = 16{,}384$ 个 token, $d = h = 4096$, top-4 路由, 1 个 shared expert, BF16). 清单只计有效的 routed 行. 作为整体一致性检查, 把 7 个 routed block, 1 个 dense block 和输出 logits 的清单加起来, 与实测的 40.8 GiB 瞬态峰值相差在几个百分点以内. logits 不是 offload 候选, 所以表中整个 microbatch 的流量不含 logits.

| One routed block, one rank microbatch | Size | Value |
| --- | --- | --- |
| Saved activations multiples of T×d BF16 elements |  |  |
| Attention: block input, normed input, grouped-query attention q/k/v, attention output | 4.5 Td | 0.60 GB |
| MoE norm inputs: residual and normed | 2 Td | 0.27 GB |
| Routed experts: received rows, up/gate output, SwiGLU output, expert outputs | 20 Td | 2.68 GB |
| (K = 4) |  |  |
| Shared expert: up/gate output, SwiGLU output | 3 Td | 0.40 GB |
| Candidate bytes A | 29.5 Td | 3.96 GB |
| Timing GPU-projected ranges of the Section 13 profile |  |  |
| Forward of one routed block, tf |  | 10.3 ms |
| Backward of one routed block, t<sub>b</sub>, its share of the 198 ms microbatch backward |  | 22 ms |
| One microbatch's share of the step (forward, backward, optimizer) |  | 295 ms |
| Required versus available GB/s per direction |  |  |
| Required: D2H during forward, A/tf |  | 384 |
| Required: H2D before backward, A/t<sub>b</sub> |  | 180 |
| Required: averaged over the whole microbatch, 30.6 GB each way |  | 104 |
| Available: PCIe Gen5 x16, specification |  | 63 |
| Available: pinned copy, one GPU alone, measured on a Gen5 host |  | 53 |
| Required over available, ρ = (A/tf)/BD2H, specification link |  | 6.1 |
| Selective offload bound, f ≤ 1/ρ |  | ≈ 1/6 |

**Table 32 The estimated activation-offload rate exceeds PCIe bandwidth by six to seven times for one GPU.** GB is $1 0 ^ { 9 }$ bytes. The inventory is analytic (saved tensors implied by the block’s autograd graph, uniform routing, valid rows only); the timings are the Section 13 profile on B300 GPUs; the link rates are the PCIe Gen5 x16 specification and pinned-memory copies measured on an H100 host with the same link generation. Against the measured 53 GB/s copy rate rather than the specification, $\rho$ rises to 7.2. The B300 host link itself was not measured.

<!-- page 107 of 168 -->

A routed block produces its 3.96 GB of candidate activations in 10.3 ms, a 384 $\mathrm { G B / s }$ stream, against a 63 GB/s link, so $\rho \approx 6$ with the link entirely to itself and above 7 at the copy rate actually measured on a host of the same link generation. Even spread over the entire 295 ms microbatch, the traffic is still 104 GB/s in each direction, and the measured copies lose a further 15–25% of their rate when both directions run at once. A node’s eight GPUs offloading together would push about $3 ~ \mathrm { T B / s }$ into host memory, more than a two-socket DDR5 host can absorb regardless of link generation; a PCIe Gen6 host link would halve $\rho$ but leave both the $\scriptstyle { \mathrm { p e r - G P U } }$ forward-rate mismatch and the host-memory limit.

一个 routed block 在 10.3 ms 内产出 3.96 GB 候选 activation, 即 384 GB/s 的数据流, 而链路只有 63 GB/s. 所以即使链路完全独占, $\rho \approx 6$; 按同代链路主机上实测的拷贝速率算, 超过 7. 即使把流量摊到整个 295 ms 的 microbatch 上, 每个方向仍有 104 GB/s, 而且实测两个方向同时拷贝时, 速率还要再掉 15% 到 25%. 一个节点 8 张卡同时 offload, 会向 host 内存灌入约 3 TB/s, 不管链路是哪一代, 都超过双路 DDR5 主机能吸收的量; 换成 PCIe Gen6 链路能把 $\rho$ 减半, 但单卡的 forward 速率失配和 host 内存上限都还在.

Faster compute further narrows the offload window unless host bandwidth increases with it. The activationproduction rate in Table 32 is Blackwell’s, since the block timings come from B300 GPUs, while the link is the same $\mathrm { P C I e }$ Gen5 x16 that served Hopper hosts. At Hopper’s roughly 2.3× lower BF16 peak (Table 21), scaling the block time inversely with peak arithmetic throughput would put $\rho$ near 3, still above the available bandwidth. This is an estimate, not a Hopper measurement.

除非 host 带宽同步增长, 算得越快, offload 的窗口就越窄. Table 32 里的 activation 产出速率是 Blackwell 的, 因为 block 耗时来自 B300; 链路却还是 Hopper 主机上那条 PCIe Gen5 x16. Hopper 的 BF16 峰值约低 2.3 倍 (Table 21), 若 block 耗时与峰值算力成反比, $\rho$ 会在 3 附近, 仍高于可用带宽. 这是估算, 不是 Hopper 上的实测.

A selective policy can offload at most approximately a fraction $f \; \leq \; 1 / \rho$ of the candidate bytes without building a sustained D2H backlog. $At $\rho \approx 6$$ that is about one sixth, roughly 0.65 GB per block or about 5 GB over a microbatch: less than a fifth of what per-block recompute removes at the same operating point (Figure 62), for a new subsystem with its own failure modes. That reduction is too small to justify the subsystem in the current recipe.

选择性策略在不形成持续 D2H 积压的前提下, 最多只能 offload 约 $f \leq 1 / \rho$ 比例的候选字节. $\rho \approx 6$ 时约为六分之一, 每个 block 约 0.65 GB, 整个 microbatch 约 5 GB: 不到同一工作点上 per-block recompute 所省显存的五分之一 (Figure 62), 却要引入一个有自己失效模式的新子系统. 在当前配方下, 这点节省撑不起这个子系统.

> **问:** §15.1 用 $\rho\approx6$ 否掉了 CPU offload, 但 §11.4.3 的 MXFP8 activation saving 能把要搬的字节减半左右, 两者叠起来够不够满足式 (61)?
> 答: 按 Table 32 的数字算. MXFP8 每元素 1 字节, 外加每 32 元素 1 字节 scale, 候选字节 $A$ 从 3.96 GB 降到约 $3.96\times(1+1/32)/2\approx2.04$ GB, $A/t_f\approx198$ GB/s. 对 63 GB/s 的规格带宽 $\rho\approx3.1$, 对实测的 53 GB/s 约 3.7, 式 (61) 仍不成立. 节点层面 8 卡合计约 1.6 TB/s, 和正文的 3 TB/s 相比减半, 但正文没给双路 DDR5 主机的吸收上限具体是多少, 能不能装下核不了. 若只按 $f\le1/\rho$ 做选择性 offload, 可卸载份额从约 1/6 提到约 1/3, 每个 block 约 0.66 GB 的 MXFP8 字节, 对应约 1.3 GB 的 BF16 activation, 整个 microbatch 约 10 GB, 仍不到 per-block recompute 所省 26.13 GiB (Figure 62) 的一半, 而且要同时付 Q/DQ 和 offload 子系统两份代价. 报告没测这种组合, 以上是按表中数字推的.

## 15.2 Wave Overlap Was Not a Reliable Win · Wave overlap 不是稳定的收益

Wave scheduling divides one MoE invocation into several route groups. While experts compute one wave, another CUDA stream can dispatch a later wave or combine an earlier one. This creates an opportunity to hide communication, but it also replaces one larger grouped GEMM with several smaller grouped GEMMs and runs communication beside compute on the same GPU. Fine-grained overlap systems such as COMET and Lancet show why this direction is attractive (Zhang et al., 2025; Jiang et al., 2024b). Its benefit depends on how much both communication and compute slow down when run together.

wave 调度把一次 MoE 调用分成几组路由. expert 计算某一个 wave 时, 另一个 CUDA stream 可以 dispatch 后面的 wave, 或 combine 前面的 wave. 这样有机会把通信藏起来, 但也把一个较大的 grouped GEMM 换成几个较小的 grouped GEMM, 并让通信和计算在同一张 GPU 上并排跑. COMET 和 Lancet 这类细粒度 overlap 系统说明了这个方向为什么诱人 (Zhang et al., 2025; Jiang et al., 2024b). 它的收益取决于通信和计算并发时各自变慢多少.

The controlled measurements in Section 5.9 show why stream concurrency was not enough. In an isolated two-node $EP-MP =16$ experiment, rowwise NVSHMEM dispatch or combine slowed the concurrent expert GEMM by about 23–27% across the tested communication-block sweep. The communication region also stretched. Even a one-block communication kernel did not protect the GEMM; it mainly made communication take longer. A DeepEP v2 sweep found the wave path slower than the no-wave path at the tested communication settings of 4, 6, 16, 32, and 64 SMs on its own two-node EP-MP = 16 shape.

§5.9 的受控测量说明了为什么光靠 stream 并发不够. 在一个孤立的双节点 EP-MP = 16 实验里, rowwise NVSHMEM 的 dispatch 或 combine 让并发的 expert GEMM 变慢约 23% 到 27%, 在测过的整个通信 block 数扫描范围内都是如此. 通信区段本身也被拉长. 即使通信 kernel 只占 1 个 block, 也护不住 GEMM, 主要效果是通信变得更慢. DeepEP v2 的扫描在它自己的双节点 EP-MP = 16 形状上发现, 通信分别占 4, 6, 16, 32, 64 个 SM 时, wave 路径都比不分 wave 的路径慢.

The measurements do not identify the interference mechanism. The rowwise path executes GPU warps that issue one-sided transfers and stream barriers, so candidate causes include SM issue pressure, NVSHMEM progress work, L2 or memory-fabric contention, and barrier overhead. Wave partitioning independently reduces GEMM efficiency. Other measured shapes include both wins and losses, so the result does not show that communication–compute overlap is never useful. Concurrent kernels can still take longer to finish (Lee et al., 2025). For the tested setup, phase-sequential execution is the appropriate reference; the current evidence does not establish that overlap improves the complete forward and backward path.

这些测量没有定位干扰机制. rowwise 路径靠 GPU warp 发出单边传输和 stream barrier, 所以候选原因包括 SM 发射压力, NVSHMEM 的 progress 工作, L2 或内存互连上的争用, 以及 barrier 开销. wave 切分本身也会降低 GEMM 效率. 在其他测过的形状上有赢有输, 所以这个结果不能说明通信与计算 overlap 永远没用. 并发的 kernel 仍可能更晚完成 (Lee et al., 2025). 对测过的配置, 按阶段顺序执行才是合适的参照; 现有证据不能证明 overlap 会让完整的 forward 加 backward 路径变快.

## 15.3 Two-Batch Overlap · Two-batch overlap

**Two-batch overlap (TBO)** applies the overlap idea at a larger granularity. It splits the local microbatch into two half-batch lanes and interleaves their work across adjacent MoE blocks (Figure 63). While one lane runs attention or expert GEMMs, rowwise dispatch or combine for the other lane can remain pending on the EP communication stream. We implemented this BF16 rowwise schedule and tried it during development, but decided not to use it in our current training recipes. DeepEP documents a contrasting legacy TBO path designed around low-interference communication (DeepSeek-AI, 2026).

**Two-batch overlap (TBO)** 在更粗的粒度上用 overlap 的思路. 它把本地 microbatch 拆成两条各占一半的 lane, 在相邻的 MoE block 之间交错执行两条 lane 的工作 (Figure 63). 一条 lane 跑 attention 或 expert GEMM 时, 另一条 lane 的 rowwise dispatch 或 combine 可以挂在 EP 通信 stream 上执行. 我们实现了这套 BF16 rowwise 调度, 在开发期试过, 但决定不放进当前的训练配方. DeepEP 文档里描述了一条与此不同的旧版 TBO 路径, 是围绕低干扰通信设计的 (DeepSeek-AI, 2026).

Figure 64 reports a matched end-to-end comparison using the four-GPU configuration and timing protocol of Section 13: TBO improves throughput by one percent and trims peak active memory by about 1.5 GiB. The figure also draws what ideal overlap would gain. EP transport occupies a seventh of the normal run’s GPU span, so even a scheme that hid every millisecond of it without slowing the compute beside it would

<!-- page 108 of 168 -->

![Image block](images/p108-figure-63-two-batch-overlap-interleaves-two-half-microbatch.jpg)

Figure 63 Two-batch overlap interleaves two half-microbatch lanes across adjacent MoE blocks. Blue and green denote lanes 0 and 1. The schedule interleaves attention, expert computation, and expert-parallel dispatch and combine so that communication from one lane can run alongside computation from the other. The arrows show data dependencies; the visual overlap alone does not imply a wall-time speedup.

gain seventeen percent; TBO achieves a one-percent gain. This is a small positive result for one operating point, not evidence that TBO is generally faster.

Figure 64 用 §13 的 4 卡配置和计时规程做了对齐的端到端比较: TBO 让吞吐提高 1%, 峰值活跃显存少约 1.5 GiB. 图里还画出了理想 overlap 能拿到的收益. EP 传输占正常运行 GPU span 的七分之一, 所以即便某个方案把它每一毫秒都藏住, 而且不拖慢旁边的计算, 也只能多拿 17%; TBO 拿到的是 1%. 这是单个工作点上的一个小的正结果, 不能证明 TBO 普遍更快.

![Image block](images/p108-figure-64-two-batch-overlap-improves-throughput-by-1.jpg)

Figure 64 Two-batch overlap improves throughput by 1%, compared with a 17% ideal-overlap estimate. Filled bars show TBO’s change of the three-repetition mean relative to normal rowwise training, with the individual ten-step windows as dots. The dashed outline is ideal overlap, the most any scheme could gain on this workload: EP transport occupies 14.8% of the normal run’s GPU span on rank 0, so hiding all of it with no slowdown of the concurrent compute would raise throughput by 17%. Normal training sustains 54.68K tokens/s/GPU at 103.03 GiB peak active memory; TBO sustains 55.22K at 101.57 GiB. Same four-GPU B300 configuration, matched model, batch, routing, and timing protocol as Figure 62.

**Concurrent kernels take longer under TBO.** Olmo’s rowwise NVSHMEM communication is not an SM-free direct memory access (DMA) transfer. Its route-level PUT and GET kernels use SM scheduling and memory-system resources also needed by expert GEMMs. In the profile, TBO overlaps 503.6 ms of communication and compute, equal to 72.2% of the EP transport interval. At the same time, the summed EP-transport duration grows by 98.9%, the GEMM duration by 20.4%, and attention duration by 16.5%. These sums combine contention with the lower efficiency of two smaller lane kernels and can overlap with one another; they are not an additive wall-time decomposition. Taking the union of the intervals, the projected GPU span falls by 0.9%, consistent with the independent 1.00% throughput gain. Thus contention is real, but it does not quite erase the overlap benefit in this configuration. NCCL All-to-All can have a different contention profile, but it also retains the packing and unpacking permutations that rowwise EP removes.

**TBO 下并发 kernel 耗时更长.** Olmo 的 rowwise NVSHMEM 通信不是不占 SM 的直接内存访问 (DMA) 传输. 它在路由粒度上的 PUT 和 GET kernel 要用 SM 调度和内存系统资源, 而 expert GEMM 也要用这些资源. profile 里, TBO 让 503.6 ms 的通信与计算重叠, 相当于 EP 传输区间的 72.2%. 与此同时, EP 传输的总时长增加 98.9%, GEMM 增加 20.4%, attention 增加 16.5%. 这些总和把争用和两条 lane 上更小 kernel 的效率下降混在一起, 彼此之间也可能重叠, 不能相加成 wall time 的分解. 取各区间的并集, GPU span 下降 0.9%, 与独立测得的 1.00% 吞吐提升一致. 所以争用确实存在, 但在这个配置下还没有完全吃掉 overlap 的收益. NCCL All-to-All 的争用特征可能不同, 但它保留了 rowwise EP 去掉的打包和解包置换.

> **对一下:** §15.3 把 TBO 只拿到 1% 归因于 rowwise NVSHMEM 的 PUT/GET kernel 占 SM, 那么 DeepEP 文档里那条「围绕低干扰通信设计」的旧版 TBO, 和 Olmo 这条的差别落在哪一层?
> 答: Figure 64 的数字给出上限: EP 传输占 GPU span 的 14.8%, 全藏住是 $1/(1-0.148)\approx1.17$, 即 17%. Olmo 实际藏住了 72.2% 的传输区间, 若无争用应得约 $1/(1-0.148\times0.722)\approx1.12$, 实得 1%, 差额全被三类 kernel 变慢 (传输 +98.9%, GEMM +20.4%, attention +16.5%) 吃掉. 所以瓶颈在通信 kernel 与计算 kernel 抢同一批 SM 和内存带宽. DeepEP 的思路是让通信尽量少占计算资源, 例如它的低延迟 kernel 用 hook 方式接收, 通信期间不占 SM, 报告只用一句话带过, 没给对照数据. 按本报告的因果链, 要让 TBO 在 Olmo 上划算, 需要的就是 §15 开头那张表里 TBO 一行写的「更低的通信干扰」, 换 kernel 实现比调调度更关键. DeepEP 那条路径在 Olmo 的形状上能拿多少, 报告里没写.

**Splitting the microbatch roughly doubles the host scheduling work.** Each half-batch lane has its own attention, dispatch, expert, combine, and synchronization stages. The profile records 89.8% more kernel launches and 126.4% more CUDA API calls than normal execution. Kernel-idle gaps of at least 10 µs also become 2.09× as frequent, although total idle time within the projected range rises by only 9.7 ms. The CPU remains far enough ahead at this rank-local microbatch size, so launch work does not erase the small win. At smaller microbatches or on a faster kernel path, the same extra submission work moves the system closer to a launch-limited regime. CUDA Graph replay could lower this cost, but the current stack has no stable graph path that captures this schedule end to end.

**拆分 microbatch 让 host 调度工作大约翻倍.** 每条半 batch 的 lane 都有自己的 attention, dispatch, expert, combine 和同步阶段. profile 记录到 kernel launch 比正常执行多 89.8%, CUDA API 调用多 126.4%. 不短于 10 µs 的 kernel 空闲间隙出现频率也变成原来的 2.09 倍, 不过投影区间内的总空闲时间只增加 9.7 ms. 在这个 rank 本地 microbatch 大小下, CPU 仍领先得足够多, 所以 launch 工作没有吃掉那点小收益. 换成更小的 microbatch 或更快的 kernel 路径, 同样多出来的提交工作会把系统推向受 launch 限制的区间. CUDA Graph replay 能降低这个开销, 但当前训练栈没有一条能端到端捕获这套调度的稳定 graph 路径.

<!-- page 109 of 168 -->

**TBO adds coordination to the pipeline schedule.** The implementation carries two live lanes, separate communication buffers, and stream-ordering dependencies across neighboring blocks. Pipeline parallelism (PP) already imposes its own microbatch order and point-to-point dependencies, so combining the two schedules requires additional coordination rather than a local MoE-layer change. The measured one-percent gain came from a no-PP configuration; we did not adopt the additional schedule-dependent coordination for that gain. A different microbatch size, transport, interconnect, or pipeline schedule can change the balance between hidden communication and the costs of contention, smaller kernels, and extra launches.

**TBO 给 pipeline 调度增加了协调工作.** 实现里要同时维持两条活着的 lane, 各自的通信 buffer, 以及相邻 block 之间的 stream 顺序依赖. pipeline 并行 (PP) 本身已经规定了 microbatch 顺序和点对点依赖, 所以把两套调度合在一起, 需要额外的协调, 不是在 MoE 层内局部改一下就行. 实测的 1% 收益来自不开 PP 的配置; 为这点收益, 我们没有引入依赖调度的额外协调. 换一种 microbatch 大小, 传输方式, 互连或 pipeline 调度, 藏住的通信与争用, 小 kernel, 额外 launch 这几项代价之间的平衡都可能变.

## 15.4 The MegaMoE Kernel Became a Runtime Project · MegaMoE kernel 变成了一个运行时项目

To control this interference directly, a persistent MoE kernel can assign explicit roles to communication, scheduling, and tensor-core work. **MegaMoE**, our prototype of such a persistent MoE megakernel, explored this direction by bringing route dispatch, persistent expert scheduling, the two expert linear layers, the activation, and weighted combine under one Olmo-controlled CUDA implementation.

要直接控制这种干扰, 可以用一个 persistent MoE kernel, 给通信, 调度和 tensor core 计算分配明确的角色. **MegaMoE** 是我们做的这类 persistent MoE megakernel 原型, 它把路由 dispatch, 常驻的 expert 调度, 两个 expert linear 层, 激活函数和加权 combine 都放进一份由 Olmo 控制的 CUDA 实现里.

**The prototype needed a complete distributed execution path.** A usable training backend still needed a production tensor-core and data-movement scheduler, cross-rank signaling, reusable peer workspaces, returned expert outputs, backward for activations and both expert weights, and inter-node transport. These pieces are coupled: a fast local forward body cannot replace the rowwise path if backward or remote movement returns to a separate, incompatible schedule. The prototype grew across Python, C++, CUDA, and distributed-runtime code before it had a production training backward.

**原型需要一整条分布式执行路径.** 要成为能用的训练后端, 它还缺: 生产级的 tensor core 与数据搬运调度器, 跨 rank 的信号机制, 可复用的 peer 工作区, expert 输出的回传, 对 activation 和两个 expert 权重的 backward, 以及节点间传输. 这些部件相互耦合: 如果 backward 或跨机搬运又回到另一套不兼容的调度上, 本地 forward 主体再快也替代不了 rowwise 路径. 在还没有生产级训练 backward 之前, 原型就已经铺到了 Python, C++, CUDA 和分布式运行时代码里.

We removed that path and kept rowwise EP as the end-to-end baseline. The prototype’s tensor-core body ran as a serialized debug version, so its timing does not estimate the performance of the intended persistent implementation.

我们删掉了这条路径, 保留 rowwise EP 作为端到端基线. 原型的 tensor core 主体是以串行化的调试版本跑的, 所以它的耗时不能用来估计预想中 persistent 实现的性能.

## 15.5 Wgrad Needed a Different Scale Layout · Wgrad 需要另一种 scale 布局

The rowwise MXFP8 forward path naturally represents activations and output gradients with scales $s _ { A } [ m , k _ { b } ]$ and $s _ { d Y } [ m , n _ { b } ]$ , where m is a routed-token row and $k _ { b }$ and $n _ { b }$ are feature blocks. Expert weight-gradient computation is

rowwise MXFP8 forward 路径天然地用 scale $s _ { A } [ m , k _ { b } ]$ 和 $s _ { d Y } [ m , n _ { b } ]$ 表示 activation 和输出梯度, 其中 $m$ 是 routed token 的行号, $k _ { b }$ 和 $n _ { b }$ 是特征维上的块号. expert 权重梯度的计算是:

$$
d W _ {e} = A _ {e} ^ {\mathsf {T}} d Y _ {e},\tag{62}
$$

so its reduction dimension is the token index m. The natural scale factors therefore change along the Wgrad reduction. Blackwell’s native block-scaled matrix instructions expect scale factors arranged according to their supported GEMM reduction layout; the already-available rowwise representation is not that layout.

所以它的 reduction 维度是 token 下标 $m$. 天然的 scale 因子因此沿着 Wgrad 的 reduction 方向变化. Blackwell 原生的 block-scaled 矩阵指令要求 scale 因子按它支持的 GEMM reduction 布局排列; 手头已有的 rowwise 表示不是那种布局.

The exact-natural prototype handled the mismatch by dequantizing tiles into BF16 shared memory and using BF16 tensor-core arithmetic. Table 33 shows that it was substantially slower than two global dequantization kernels followed by the tuned BF16 grouped Wgrad. Despite doing a separate global conversion, that path benefits from the faster GEMM implementation.

严格沿用天然布局的原型这样处理失配: 把 tile 反量化到 BF16 的 shared memory 里, 用 BF16 的 tensor core 运算. Table 33 显示, 它比「两个全局反量化 kernel 加调优过的 BF16 grouped Wgrad」慢得多. 后者虽然多做了一次单独的全局转换, 但得益于更快的 GEMM 实现.

| K = N | Exact-natural prototype | Global DQ + BF16 grouped Wgrad |
| --- | --- | --- |
| 2,048 | 0.380 ms | 0.118 ms |
| 4,096 | 1.449 ms | 0.334 ms |
| 8,192 | 5.522 ms | 1.232 ms |

The current path therefore dequantizes the saved MXFP8 activation and output gradient, then calls BF16 grouped GEMM for Wgrad. This does not imply that native MXFP8 Wgrad is impossible. Such a path would deliberately requantize or repack the operands into a Wgrad-oriented scale layout before calling a native block-scaled grouped GEMM. Its cost includes that conversion as part of the complete backward region. The

<!-- page 110 of 168 -->

prototype measurements favor the converted layout and tuned BF16 GEMM over directly consuming the forward layout.

因此当前路径先把保存的 MXFP8 activation 和输出梯度反量化, 再调用 BF16 grouped GEMM 算 Wgrad. 这不代表原生 MXFP8 Wgrad 做不到. 那样的路径要先专门把操作数重新量化或重排成面向 Wgrad 的 scale 布局, 再调用原生的 block-scaled grouped GEMM; 它的代价要把这次转换算进完整的 backward 区域里. 原型的测量结果支持「转换布局后用调优的 BF16 GEMM」, 而不是直接吃 forward 的布局.

## 15.6 Static CUDA Graphs Need Pipeline-Aware Storage · 静态 CUDA Graph 需要感知 pipeline 的存储

CUDA Graph replay targets a different cost: repeated host submission. As Section 8 explains, replay can be attractive when the GPU executes small regions faster than Python and the CUDA runtime can submit them. The static PyTorch capture/replay path considered here records a fixed launch sequence with stable tensor addresses, then replays that sequence with much less host work. CUDA also provides graph-update APIs that can change node parameters, including memory addresses; those mechanisms are outside this static prototype (NVIDIA, 2026l; PyTorch Contributors, 2026f).

CUDA Graph replay 针对的是另一种开销: 重复的 host 提交. 如 §8 所述, 当 GPU 执行小区段的速度快过 Python 和 CUDA runtime 提交它们的速度时, replay 就有吸引力. 这里考虑的是 PyTorch 静态 capture/replay 路径: 先记录一段 tensor 地址固定的 launch 序列, 之后以少得多的 host 工作重放. CUDA 也提供 graph 更新 API, 能改节点参数, 包括内存地址; 这些机制不在这个静态原型的范围内 (NVIDIA, 2026l; PyTorch Contributors, 2026f).

Host submission can dominate a short operation. In a standalone single-GPU grouped-linear microbenchmark, the captured device sequence for a short MXFP8 expert operation runs more than twice as fast as its BF16 baseline while under ordinary eager submission the same operation is slower than BF16 (Table 48 in Appendix B.6).

对短操作, host 提交可能占主导. 在一个独立的单卡 grouped-linear microbenchmark 里, 一个短的 MXFP8 expert 操作被捕获成 device 序列后, 比 BF16 基线快两倍以上; 而在普通 eager 提交下, 同一个操作比 BF16 还慢 (附录 B.6 的 Table 48).

**Stable graph addresses conflict with live pipeline activations.** A pipeline stage can execute several microbatch forward passes before their corresponding backward passes. If every replay of one layer uses the same activation slot, a later forward overwrites data that an earlier backward will read. A pipeline-compatible design can assign a graph runner and static activation slot to every simultaneously live (layer, microbatch) interval, or capture a larger fixed schedule containing the forward–backward reuse order. Separate slots increase graph pools and retained activation memory. Copying live tensors into graph-owned staging storage stabilizes their addresses but adds device-to-device copies. Staging, graph-pool memory, activation retention, and capture cost all count against replay savings. Figure 65 illustrates the separate-slot design with three in-flight microbatches.

**graph 的固定地址与 pipeline 里活着的 activation 冲突.** 一个 pipeline stage 可能先跑完几个 microbatch 的 forward, 再跑它们对应的 backward. 如果某一层每次 replay 都用同一个 activation 槽位, 后一个 forward 就会覆盖前一个 backward 还要读的数据. 与 pipeline 兼容的设计有两种: 给每个同时存活的 (层, microbatch) 区间分配一个 graph runner 和一个静态 activation 槽位; 或者捕获一个更大的固定调度, 把 forward 与 backward 的复用顺序包含进去. 独立槽位会增加 graph 池和保留的 activation 显存. 把活着的 tensor 拷进 graph 自有的暂存区, 能让地址固定, 但多了 device 到 device 的拷贝. 暂存, graph 池显存, activation 保留和捕获开销, 都要从 replay 的节省里扣掉. Figure 65 用三个在途 microbatch 展示独立槽位的设计.

## (a) No pipeline: each microbatch finishes before the next starts

![Image block](images/p110-figure-65-under-a-pipeline-schedule-static-per-layer.jpg)

![Image block](images/p110-figure-65-under-a-pipeline-schedule-static-per-layer-2.jpg)

> 图注: figure 65 under a pipeline schedule static per layer 2.

Three slots, each with its own graph and static buffers, recycled when its microbatch’s backward for this layer has run.

**Figure 65 Under a pipeline schedule, static per-layer replay needs one saved-context slot per in-flight microbatch.** (a) Without a pipeline the backward of each microbatch consumes the layer’s saved context before the next forward overwrites it, so one graph per layer serves every microbatch. (b) With three microbatches in flight, a shared slot is overwritten by F1 and F2 before B0 reads it; three slots, each with its own graph and static buffers, are recycled as each microbatch’s backward for the layer completes. Conceptual illustration after the design described for Megatron-Core (Yan et al., 2026); no measured quantities.

<!-- page 111 of 168 -->

The prototype could capture a narrow rowwise forward core in non-pipeline and smoke-test configurations, but it did not establish a beneficial complete PP training path. Marking more tensors as static did not solve the scheduling problem, because the number and reuse order of safe slots depends on the pipeline schedule. We therefore retired the graph-specific backend rather than maintain a second rowwise implementation with an incomplete memory trade-off.

在不开 pipeline 的配置和冒烟测试配置里, 原型能捕获 rowwise forward 里很窄的一段核心, 但没能做出一条有收益的完整 PP 训练路径. 把更多 tensor 标成 static 也解决不了调度问题, 因为安全槽位的数量和复用顺序取决于 pipeline 调度. 所以我们下线了专为 graph 做的后端, 不去维护第二套显存取舍还不完整的 rowwise 实现.

Megatron-Core implements the separate-slot design: one graph per layer and microbatch under pipeline parallelism, graphs captured in execution order so that they share one memory pool, and static buffers reused by the pipeline order, for which it reports about a ten percent end-to-end speedup at roughly 7 GB of extra memory on a DeepSeek-V3 configuration (Yan et al., 2026). This result includes the schedule-dependent storage that our isolated forward capture lacked.

Megatron-Core 实现了独立槽位的设计: 在 pipeline 并行下每个 (层, microbatch) 一张 graph, 按执行顺序捕获, 让它们共用一个内存池, 静态 buffer 按 pipeline 顺序复用. 它在一个 DeepSeek-V3 配置上报告了约 10% 的端到端加速, 额外显存约 7 GB (Yan et al., 2026). 这个结果包含了依赖调度的存储, 而这正是我们孤立的 forward 捕获所缺的.

## 15.7 Local Savings Must Survive the Training Schedule · 局部节省要经得住完整训练调度

These decisions favor the complete training path over savings in an isolated region. The offload budget exceeds host-link bandwidth; wave overlap must pay for smaller GEMMs and interference; and TBO’s small gain did not justify its additional schedule coordination. For Wgrad, global conversion followed by a tuned GEMM beat direct consumption of the forward layout. The graph and megakernel prototypes lacked the storage or distributed execution needed to carry their local operations through training.

这些决定看重的是完整训练路径, 不是孤立区段里的节省. offload 需要的带宽超过 host 链路; wave overlap 要为更小的 GEMM 和干扰买单; TBO 那点小收益抵不上额外的调度协调. 对 Wgrad, 先全局转换再用调优的 GEMM, 胜过直接吃 forward 布局. graph 和 megakernel 原型缺少把局部操作带进完整训练所需的存储机制或分布式执行能力.

<!-- page 112 of 168 -->

## Part IV

## Findings and Outlook · 发现与展望

The remaining sections examine training-recipe choices and a separate benchmarking lesson. We begin with learning-rate scaling and upcycling, turn to operand-value effects in GEMM measurements, then return to shared-expert structure and activation merging. We close with post-training and a comparison with related systems.

余下各节讨论训练配方上的选择, 以及一条单独的基准测试教训. 先讲学习率随 batch 的缩放和 upcycling, 再讲 GEMM 测量中操作数取值的影响, 然后回到 shared expert 的结构和激活合并. 最后讲后训练, 并与相关系统做比较.

## 16 Learning Rate Scaling with Global Batch Size · 学习率随全局 batch 大小的缩放

Batch-size warmup increases the amount of data processed by each optimizer step as training progresses. It can reduce the number of synchronization and optimizer steps required to process a fixed token budget, but the learning rate must change with the batch. In our batch-size-warmup run, square-root scaling left visible changes in the loss curve at later batch increases.

batch-size warmup 让每个优化器步处理的数据量随训练推进而增加. 它能减少处理固定 token 预算所需的同步次数和优化器步数, 但学习率必须跟着 batch 变. 在我们的 batch-size warmup 运行里, 平方根缩放在后面几次 batch 增大时, 让 loss 曲线留下了肉眼可见的变化.

A common recipe uses the square-root rule (Hoffer et al., 2017), which Malladi et al. (2022) derive for Adam: if the batch grows from B to NB, then

常见配方用平方根规则 (Hoffer et al., 2017), Malladi et al. (2022) 为 Adam 推导过它: 若 batch 从 $B$ 增大到 $NB$, 则

$$
\eta (N B) = \eta (B) N ^ {\alpha}, \quad \alpha = \frac {1}{2}.\tag{63}
$$

This is the rule used by the batch-size-warmup experiments of Merrill et al. (2025), where the batch grows only after the measured critical batch size has increased. The derivation of Malladi et al. (2022) rests on a stochastic-differential-equation analysis whose same-trajectory condition also scales Adam’s moment coefficients and ϵ together with the learning rate. Olmo changes only the learning rate. These results motivate square-root scaling, but do not imply that a single exponent preserves the training trajectory at every batch transition.

Merrill et al. (2025) 的 batch-size warmup 实验用的就是这条规则, 他们只在实测的临界 batch 大小变大之后才增大 batch. Malladi et al. (2022) 的推导建立在随机微分方程分析上, 其中「轨迹不变」的条件要求 Adam 的矩系数和 $\epsilon$ 也随学习率一起缩放. Olmo 只改学习率. 这些结果为平方根缩放提供了依据, 但并不意味着单一指数能在每一次 batch 切换时都保持训练轨迹不变.

## 16.1 Critical Batch Size Defines the Useful Batch Regime · 临界 batch 大小划定有用的 batch 区间

Let $g _ { i }$ be the gradient from one training example, $G   =   \mathbb { E } [ g _ { i } ]$ the full gradient, and $\Sigma   =   \mathrm { C o v } ( g _ { i } )$ the perexample gradient covariance. For a batch of B independently sampled examples,

设 $g _ { i }$ 为单个训练样本的梯度, $G = \mathbb { E } [ g _ { i } ]$ 为全梯度, $\Sigma = \mathrm { C o v } ( g _ { i } )$ 为单样本梯度的协方差. 对 $B$ 个独立采样样本组成的 batch,

$$
\widehat {G} _ {B} = \frac {1}{B} \sum_ {i = 1} ^ {B} g _ {i}, \qquad \mathbb {E} [ \widehat {G} _ {B} ] = G, \qquad \mathrm{Cov} (\widehat {G} _ {B}) = \frac {\Sigma}{B}.\tag{64}
$$

Larger batches therefore give less noisy gradient estimates. Under a local quadratic approximation with Hessian $H ,$ the expected loss after one stochastic-gradient update is

所以 batch 越大, 梯度估计的噪声越小. 在 Hessian 为 $H$ 的局部二次近似下, 一次随机梯度更新后的期望 loss 为:

$$
\mathbb {E} \Big [ L (\theta - \eta \widehat {G} _ {B}) \Big ] \approx L (\theta) - \eta \| G \| ^ {2} + \frac {\eta^ {2}}{2} \left(G ^ {\top} H G + \frac {\mathrm{tr} (H \Sigma)}{B}\right).\tag{65}
$$

Minimizing Equation 65 gives

对式 65 求最小, 得到:

$$
\begin{array}{c} \eta_ {\mathrm{opt}} (B) = \frac {\eta_ {\mathrm{max}}}{1 + \mathcal {B} _ {\mathrm{noise}} / B}, \\ \mathcal {B} _ {\mathrm{noise}} = \frac {\operatorname{tr} (H \Sigma)}{G ^ {\top} H G}. \end{array}
$$

$$
\eta_ {\mathrm{max}} = \frac {\| G \| ^ {2}}{G ^ {\top} H G},\tag{66}
$$

This model predicts two regimes (McCandlish et al., 2018). When $B \: \ll \: \mathcal { B } _ { \mathrm { n o i s e } } ,$ the optimal stochastic gradient descent (SGD) step grows approximately in proportion to B. When $B \gg \mathcal { B } _ { \mathrm { n o i s e } } ,$ it approaches η<sub>max</sub>, so enlarging the batch yields diminishing optimization benefit. The often-used **simplified noise scale**,

<!-- page 113 of 168 -->

$$
\mathcal {B} _ {\text {simple}} = \frac {\operatorname{tr} (\Sigma)}{\| G \| ^ {2}},\tag{67}
$$

follows only after removing the Hessian weighting. It is therefore a useful intuition for the turnover, not an exact critical-batch estimator. Large empirical studies likewise find that the useful degree of data parallelism depends on the workload, optimizer, tuning protocol, and target quality (Shallue et al., 2019).

这个模型预测了两个区间 (McCandlish et al., 2018). 当 $B \ll \mathcal { B } _ { \mathrm { n o i s e } }$ 时, 随机梯度下降 (SGD) 的最优步长大致与 $B$ 成正比增长. 当 $B \gg \mathcal { B } _ { \mathrm { n o i s e } }$ 时, 最优步长趋近 $\eta_{\mathrm{max}}$, 再增大 batch, 优化上的收益越来越小. 常用的**简化噪声尺度** (式 67) 要去掉 Hessian 加权才能得到. 所以它适合用来直观理解拐点在哪, 不是临界 batch 的精确估计量. 大规模实证研究同样发现, 数据并行度用到多大还有用, 取决于任务负载, 优化器, 调参规程和目标质量 (Shallue et al., 2019).

For language-model training, rather than inferring critical batch size from gradient noise, Merrill et al. (2025) branch from a checkpoint and directly find the largest batch whose loss still matches a smaller-batch reference after the same number of tokens. For an Adam branch with batch multiplier $k ,$ they set $B _ { k }   =   k B$ and $\eta _ { k } = \sqrt { k } \eta$ , measure its smoothed loss $L _ { k }$ after a fixed token budget, and, with a small loss tolerance ε, define

对语言模型训练, Merrill et al. (2025) 没有从梯度噪声去推临界 batch, 而是从一个 checkpoint 分叉, 直接找出这样的最大 batch: 训练同样多的 token 后, 它的 loss 仍与较小 batch 的参照一致. 对 batch 倍数为 $k$ 的 Adam 分支, 他们设 $B _ { k } = k B$, $\eta _ { k } = \sqrt { k } \eta$, 在固定 token 预算后测平滑后的 loss $L _ { k }$, 并取一个小的 loss 容差 $\varepsilon$, 定义:

$$
k ^ {*} = \max \{k: L _ {k} \leq L _ {j} + \varepsilon \text {for every} j <   k \}, \quad B ^ {*} = k ^ {*} B.\tag{68}
$$

They find that this **empirical critical batch size** starts small, grows rapidly, and then plateaus. They also find that the simplified noise scale can underestimate the directly measured value by orders of magnitude and can follow a different trend. Equation 68 tests the useful batch range while taking square-root learning-rate scaling as an input. Critical batch size therefore answers when a larger batch remains token-efficient; it does not determine the exact Adam learning-rate multiplier needed at that transition.

他们发现这个**经验临界 batch 大小**起初很小, 随后快速增长, 再进入平台. 他们还发现, 简化噪声尺度可能把直接测得的值低估几个数量级, 走势也可能不同. 式 68 检验的是有用的 batch 范围, 平方根学习率缩放是它的输入条件. 所以临界 batch 大小回答的是「更大的 batch 什么时候仍然 token 高效」, 它不决定这次切换时 Adam 学习率到底该乘多少.

## 16.2 Adam Does Not Imply One Universal Exponent · Adam 不对应一个通用指数

## Square-Root Scaling Is a Local Approximation · 平方根缩放只是局部近似

Two independent effects keep the batch exponent from being universal: the optimal step saturates as the batch approaches the turnover scale, and Adam’s slowly adapting second moment lags an abrupt change in gradient noise. The first makes the exponent depend on where the batch sits relative to the turnover; the second pushes it above one half at a batch transition. Neither fixes its value.

有两个相互独立的效应, 使 batch 指数不可能通用. 一是 batch 接近拐点尺度时, 最优步长会饱和; 二是 Adam 的二阶矩适应得慢, 跟不上梯度噪声的突变. 前者让指数取决于 batch 相对拐点所处的位置; 后者在 batch 切换时把指数推到 1/2 以上. 两者都定不出指数的具体值.

For learning-rate searches, McCandlish et al. (2018) use a more general saturating curve, which we write as

做学习率搜索时, McCandlish et al. (2018) 用了一条更一般的饱和曲线, 我们写成:

$$
\eta (B) = \frac {\eta_ {\infty}}{(1 + B _ {\mathrm{turn}} / B) ^ {\alpha}},\tag{69}
$$

where $B _ { \mathrm { t u r n } }$ is the fitted turnover scale and $\eta _ { \infty }$ is the large-batch limit. These names distinguish this fitted curve from the directly measured $B ^ { * }$ above. Its local log–log slope is

其中 $B _ { \mathrm { t u r n } }$ 是拟合出的拐点尺度, $\eta _ { \infty }$ 是大 batch 极限. 这样命名, 是为了把这条拟合曲线与上文直接测得的 $B ^ { * }$ 区分开. 它在对数坐标下的局部斜率为:

$$
\alpha_ {\mathrm{eff}} (B) = \frac {\mathrm{d} \log \eta}{\mathrm{d} \log B} = \alpha \frac {B _ {\mathrm{turn}}}{B + B _ {\mathrm{turn}}}.\tag{70}
$$

The curve behaves like a power law well below the turnover, but its **effective exponent** decreases toward zero as the batch grows. A fixed power law is thus at best a local approximation, even before accounting for optimizer state.

远低于拐点时, 这条曲线表现得像幂律, 但随着 batch 增大, 它的**有效指数**逐渐降到零. 所以即使还没考虑优化器状态, 固定的幂律最多也只是局部近似.

Adam adds another reason for the exponent to vary. For coordinate i, its update has the form

Adam 又给指数的变化添了一条原因. 对第 $i$ 个坐标, 它的更新形式为:

$$
\Delta \theta_ {i} = - \eta \frac {\mathbb {E} _ {\beta_ {1}} [ G _ {i} ]}{\sqrt {\mathbb {E} _ {\beta_ {2}} [ G _ {i} ^ {2} ]} + \epsilon_ {\mathrm{Adam}}}.\tag{71}
$$

Ignoring the exponential moving averages and $\epsilon _ { \mathrm { A d a m } }$ for intuition gives

为了直观, 忽略指数滑动平均和 $\epsilon _ { \mathrm { A d a m } }$, 得到:

$$
\Delta \theta_ {i} \approx - \eta \frac {\mathrm{sign} (\mathbb {E} [ G _ {i} ])}{\sqrt {1 + s _ {i} / \mathbb {E} [ G _ {i} ] ^ {2}}},\tag{72}
$$

<!-- page 114 of 168 -->

where $s _ { i }$ is the step-to-step variance of that gradient coordinate. If batch sampling dominates this variance, then $s _ { i } \propto 1 / B$ . This motivates square-root scaling for Adam. In practice, however, $\beta _ { 2 }$ is commonly close to one, so the second-moment accumulator reacts slowly to an abrupt change in gradient noise. McCandlish et al. (2018) argue that this lag moves the useful exponent from 0.5 toward the SGD limit of 1.0; their measured Adam and RMSProp exponents lie between these values before the learning rate eventually flattens. This theory supports our suspicion that $\alpha   =   0 . 5$ can slightly under-correct a batch transition, but it does not predict a specific replacement exponent.

其中 $s _ { i }$ 是该梯度坐标在步与步之间的方差. 若这个方差主要来自 batch 采样, 则 $s _ { i } \propto 1 / B$, 这就是 Adam 采用平方根缩放的依据. 但实际中 $\beta _ { 2 }$ 通常接近 1, 二阶矩累加器对梯度噪声的突变反应很慢. McCandlish et al. (2018) 认为, 这种滞后把有用的指数从 0.5 推向 SGD 的极限 1.0; 他们测得的 Adam 和 RMSProp 指数, 在学习率最终走平之前都落在这两个值之间. 这套理论支持我们的怀疑: $\alpha = 0.5$ 在 batch 切换时可能修正得略微不足. 但它预测不出该换成哪个指数.

## 16.3 An Empirical Exponent of 0.53 Smoothed Batch Transitions · 经验指数 0.53 让 batch 切换更平滑

Figure 66 follows one 3.21B@23.10B (active@total parameters) MoE with 24 layers, 48 routed experts, top-4 routing, and one shared expert. Its global batch increases through 1, 2, 3, 6, 9, 15, and 24 Mi tokens while the learning rate follows Equation 63. At the later, larger-batch transitions, the smoothed loss shows a visible downward change in curvature. The effect is consistent with the effective learning rate becoming slightly smaller at the transition: multiplying by $N ^ { 1 / 2 }$ did not fully preserve the local training trajectory.

Figure 66 跟踪一个 3.21B@23.10B (激活@总参数) 的 MoE, 24 层, 48 个 routed expert, top-4 路由, 1 个 shared expert. 它的全局 batch 依次增大到 1, 2, 3, 6, 9, 15, 24 Mi token, 学习率按式 63 调整. 在后面几次较大 batch 的切换处, 平滑后的 loss 出现肉眼可见的向下弯折. 这与切换时有效学习率略微变小的情况一致: 乘以 $N ^ { 1 / 2 }$ 并没有完全保持局部训练轨迹.

![Image block](images/p114-figure-66-square-root-learning-rate-scaling-leaves-visible.jpg)

Figure 66 Square-root learning-rate scaling leaves visible curvature changes at large batch-size transitions. Training cross-entropy loss is shown against cumulative tokens for a 3.21B@23.10B MoE trained for approximately 2.07 trillion tokens. The light trace is the raw loss and the dark trace is a time-weighted exponential moving average (TWEMA). Dotted lines mark each global-batch increase, labeled with the new batch in Mi tokens (written as M in the figure); the batch progresses through 1, 2, 3, 6, 9, 15, and 24 Mi tokens, and the later transitions occur at approximately 409B, 777B, and 1.375T cumulative tokens. Appendix B.8 records the run’s recipe and reproduction artifacts.

Across repeated internal tuning runs, we found $\alpha   =   0 . 5 3$ to be a useful empirical setting: it removed the visible change in curvature at the batch increase more consistently than $\alpha = 0 . 5$ . This is a small correction; for a batch doubling, it raises the learning rate only $2^{0.03}-1\approx2.1\%$ above square-root scaling. Its direction is consistent with the slow-adapting Adam second moment discussed above, but its value was selected from experiments rather than derived from the theory or fitted to the single curve in Figure 66. We therefore present 0.53 as an Olmo training recipe, not as a universal scaling exponent.

在多次内部调参运行中, 我们发现 $\alpha = 0.53$ 是个好用的经验设置: 与 $\alpha = 0.5$ 相比, 它更稳定地消除了 batch 增大处肉眼可见的弯折. 这个修正很小; batch 翻倍时, 学习率只比平方根缩放高 $2^{0.03}-1\approx2.1\%$. 修正的方向与上文 Adam 二阶矩适应慢的解释一致, 但具体数值是从实验里挑出来的, 不是从理论推出, 也不是拟合 Figure 66 那一条曲线得到的. 所以我们把 0.53 当作 Olmo 的训练配方给出, 不当作通用的缩放指数.

> 答: 累计倍数是 $24^{0.53}/24^{0.5}=24^{0.03}\approx1.10$, 走完整个 warmup 后学习率比平方根规则高约 10%. 单次看, 6→9 约 1.2%, 9→15 约 1.5%, 15→24 约 1.4%, 每次都很小, 但会一直叠加到训练结束. 两种解释的时间特征不同. 二阶矩滞后: batch 变大后梯度噪声下降, 但 $\mathbb{E}_{\beta_2}[G_i^2]$ 里还留着旧的大噪声, 式 (71) 的分母偏大, 步长偏小, 等累加器追上 (约 $1/(1-\beta_2)$ 步) 后自行恢复; 这是暂时的. 指数偏小造成的学习率不足则一直存在. 把 $\alpha$ 从 0.5 改成 0.53, 是用一个永久的学习率上调去补一个本应暂时的滞后, 两者在机理上并不一一对应. 若主因是滞后, 更对口的做法是切换后短时间内放大学习率再回落, 或同时调 $\beta_2$, 也就是 Malladi et al. 那种连矩系数一起缩放的做法. 报告没给 $\beta_2$ 的值, 也没在 Figure 66 里放 $\alpha=0.53$ 的对照曲线, 读者没法区分两种解释, 也核不了「0.53 消除了弯折」这一句.

**Section takeaway.** Critical batch size identifies when a larger batch remains useful; the Adam learning-rate multiplier still needs tuning. In our batch-size transitions, α = 0.53 preserved the local loss trajectory more closely than square-root scaling.

**本节要点.** 临界 batch 大小告诉我们更大的 batch 什么时候仍然有用; Adam 的学习率倍数仍需调. 在我们的 batch 切换中, $\alpha = 0.53$ 比平方根缩放更好地保持了局部 loss 轨迹.

<!-- page 115 of 168 -->

## 17 Scaling Expert Learning Rate with Sparsity Did Not Help · 按稀疏度缩放 expert 学习率没有帮助

Each routed expert sees only a fraction of the global tokens. This motivates a simple heuristic: if K of N experts are selected for each token, reduce the expert learning rate by the square root of the activation ratio,

每个 routed expert 只看到全局 token 的一小部分. 由此有一个简单的启发式: 若每个 token 从 $N$ 个 expert 里选 $K$ 个, 就按激活比的平方根降低 expert 学习率,

$$
\eta_ {\mathrm{expert}} = \eta_ {\mathrm{main}} \sqrt {K / N}.\tag{73}
$$

We are not aware of an established expert-learning-rate rule of this form; we tested it as a direct analogy to the square-root batch-size rule of Section 16. For top-4 routing over 64 experts, this sets the expert learning rate to one quarter of the main learning rate. This analogy assumes that expert-gradient noise follows the same scaling as an ordinary independently sampled batch. Routed tokens, router specialization, Adam preconditioning, and correlations between experts need not satisfy that assumption. OLMoE’s routing analyses, for example, find domain and vocabulary specialization rather than identical random subsamples across experts (Muennighoff et al., 2024).

我们不知道有这种形式的公认 expert 学习率规则; 我们是把它当作 §16 平方根 batch 规则的直接类推来测的. 对 64 个 expert 的 top-4 路由, 它把 expert 学习率设成主学习率的四分之一. 这个类推假设 expert 梯度噪声的缩放与普通独立采样的 batch 相同. 被路由的 token, router 的专门化, Adam 的预条件, 以及 expert 之间的相关性, 都未必满足这个假设. 例如 OLMoE 的路由分析发现, 各 expert 拿到的是按领域和词表专门化的 token, 不是同分布的随机子样本 (Muennighoff et al., 2024).

We tested the heuristic with 0.43B@2.51B MoEs using 64 routed experts and top-4 routing. Each point trains one model to 150B tokens. One sweep uses the same learning rate for all parameters; the other applies Equation 73 to the routed-expert parameters while sweeping the main learning rate. The unscaled sweep reached a lower best validation loss than the sparsity-scaled sweep, even after the main learning rate was retuned for each: the smaller expert learning rate did not improve this controlled model family.

我们用 0.43B@2.51B 的 MoE 测试这个启发式, 64 个 routed expert, top-4 路由. 每个点各训一个模型到 150B token. 一组扫描对所有参数用同一个学习率; 另一组在扫主学习率的同时, 对 routed-expert 参数套用式 73. 即使两组各自重新调过主学习率, 不缩放的那组仍拿到更低的最佳验证 loss: 在这个受控的模型族里, 更小的 expert 学习率没有带来改进.

![Image block](images/p115-figure-67-sparsity-scaled-expert-learning-rates-did-not.jpg)

Figure 67 Sparsity-scaled expert learning rates did not improve the tested sweep. Each point is one 0.43B@2.51B, top-4-of-64 MoE trained for 150B tokens. The teal sweep uses one learning rate for all parameters; the orange sweep sets $\eta _ { \mathrm { e x p e r t } } = \eta _ { \mathrm { m a i n } } \sqrt { K / N } = \eta _ { \mathrm { m a i n } } / 4$ . Both sweeps cover the same nine main learning rates; markers are observed runs and connecting lines are visual guides. After independently tuning the main learning rate, the best unscaled run reaches C4 (Raffel et al., 2020) validation loss 2.873 at $8 \times 1 0 ^ { - 4 }$ , while the best sparsity-scaled run reaches 2.878 at $2 \times 1 0 ^ { - 3 }$ . Each point is a single run without seed replication, so the comparison is directional rather than a precise estimate of the gap.

In this sweep, the activation ratio alone did not justify square-root down-scaling. Our default is therefore to use the same learning rate for routed experts and the rest of the model unless a matched sweep for the target model supports a different choice.

在这组扫描里, 单凭激活比不足以支持按平方根下调. 所以我们的默认做法是 routed expert 与模型其余部分用同一个学习率, 除非针对目标模型的对齐扫描支持别的选择.

## 18 Why We Do Not Upcycle · 我们为什么不做 upcycling

**We train the target MoE architecture from the beginning.** This is a recipe choice for the long training horizon considered in this report, not a general conclusion that upcycling is ineffective. In **sparse upcycling**, a pretrained dense checkpoint is converted into an MoE, typically by copying or mapping its feed-forward weights into multiple experts, initializing a router, and then continuing training (Komatsuzaki et al., 2023). This can provide a useful head start when a suitable dense checkpoint already exists. When dense pretraining

<!-- page 116 of 168 -->

and sparse continuation share one fixed compute budget, however, the dense prefix also consumes tokens that could have trained the target sparse model directly.

**我们从一开始就训练目标 MoE 架构.** 这是针对本报告所考虑的长训练周期做的配方选择, 不是「upcycling 没用」的一般结论. **sparse upcycling** 把一个预训练好的 dense checkpoint 转成 MoE: 通常是把它的 feed-forward 权重复制或映射到多个 expert 上, 初始化一个 router, 然后继续训练 (Komatsuzaki et al., 2023). 手头已经有合适的 dense checkpoint 时, 这能提供一个有用的起步优势. 但如果 dense 预训练和稀疏续训共用一个固定的算力预算, dense 前缀消耗的 token 本可以直接拿来训目标稀疏模型.

The published OLMoE study tested this trade-off. It converted an OLMo-1B checkpoint trained for 2T tokens into a top-2-of-8 MoE, then compared continued training with a sparse model trained from scratch. The upcycled model was better early in the continuation, but the scratch model caught up after roughly 500B tokens and began to outperform it near 600B tokens (Muennighoff et al., 2024). That crossover matters for our setting: the target OLMoE recipe was designed for 5T tokens, far longer than the roughly 500B tokens over which the upcycled model led. A dense checkpoint was therefore not a compelling prerequisite for the training run.

已发表的 OLMoE 研究测过这个取舍. 它把一个训了 2T token 的 OLMo-1B checkpoint 转成 8 选 2 的 MoE, 再把续训结果与从头训的稀疏模型对比. upcycled 模型在续训早期更好, 但从头训的模型大约在 500B token 后追上, 在 600B token 附近开始反超 (Muennighoff et al., 2024). 这个交叉点对我们的场景很关键: 目标 OLMoE 配方按 5T token 设计, 远长于 upcycled 模型领先的那约 500B token. 所以 dense checkpoint 算不上这次训练非有不可的前提.

Upcycling also couples the target model to the source architecture and its initialization. Copying one dense multilayer perceptron into several routed experts starts those experts from the same function; the router and subsequent gradients must then create specialization. Olmo-core includes prototype conversion paths for copying the dense MLP into routed or shared branches and for the virtual-group initialization that He et al. (2024) introduce for upcycling into fine-grained experts, but changing the mapping does not remove the underlying budget decision. For a new model whose sparse architecture and training recipe are known in advance, direct sparse training lets the router and independently initialized experts adapt together over the entire run.

upcycling 还把目标模型绑在源模型的架构和初始化上. 把同一个 dense 多层感知机复制成几个 routed expert, 这些 expert 就从同一个函数出发, 之后得靠 router 和后续梯度把它们分化开. Olmo-core 有一些原型转换路径: 把 dense MLP 复制进 routed 或 shared 分支, 以及 He et al. (2024) 为 upcycling 到细粒度 expert 提出的 virtual-group 初始化. 但换一种映射方式, 并不能免掉背后的预算取舍. 对一个稀疏架构和训练配方都事先确定的新模型, 直接稀疏训练能让 router 和独立初始化的 expert 在整个训练过程中一起适应.

This decision is conditional. Drop-Upcycling shows that partially reinitializing copied experts can improve specialization and long-run learning relative to direct copying (Nakamura et al., 2025). Scaling-law results likewise show that the preferred path depends on how much compute has already been spent on the dense checkpoint and how much sparse continuation remains (Liew et al., 2025). Upcycling may therefore be attractive when a compatible dense checkpoint is already valuable and the continuation is short. For our long training horizon and target architecture, the available evidence did not justify making it the default.

这个决定是有条件的. Drop-Upcycling 表明, 对复制出的 expert 做部分重新初始化, 相比直接复制, 能改善专门化和长程学习 (Nakamura et al., 2025). Scaling Laws 的结果同样表明, 选哪条路取决于 dense checkpoint 上已经花了多少算力, 以及还剩多少稀疏续训 (Liew et al., 2025). 所以当兼容的 dense checkpoint 本身已有价值, 续训又较短时, upcycling 可能是好选择. 对我们这种长训练周期和这个目标架构, 现有证据不足以让它成为默认做法.

## 19 GEMM Timing Depends on Operand Values · GEMM 耗时取决于操作数的取值

While comparing rowwise expert parallelism (EP) with DeepEP v2, we initially observed different expert-GEMM times after matching tensor shapes and routing. The two paths did not, however, contain comparable weights: one used normally initialized BF16 values, while the other consumed storage created with torch.empty(), whose documented contents are uninitialized (PyTorch Contributors, 2026h). Once both paths used the same normal initialization and routing, the apparent rowwise advantage disappeared.

在比较 rowwise expert 并行 (EP) 和 DeepEP v2 时, 我们起初发现, 对齐了 tensor 形状和路由之后, 两边的 expert GEMM 耗时仍不一样. 但两条路径里的权重其实不可比: 一边用正态初始化的 BF16 值, 另一边读的是 `torch.empty()` 创建的存储, 文档写明其内容未初始化 (PyTorch Contributors, 2026h). 两边改用同样的正态初始化和路由之后, rowwise 表面上的优势就消失了.

The effect reproduced without MoE, communication, routing, or Olmo-core. A minimal Blackwell benchmark measured one PyTorch grouped GEMM and one dense matrix multiplication while changing only the BF16 weight values. Table 34 shows the resulting median kernel times.

去掉 MoE, 通信, 路由和 Olmo-core, 这个效应照样能复现. 一个最小的 Blackwell 基准只改变 BF16 权重的取值, 测一个 PyTorch grouped GEMM 和一个 dense 矩阵乘. Table 34 给出 kernel 耗时的中位数.

| Weight values | Grouped GEMM | Dense GEMM |
| --- | --- | --- |
| Normal random | 31.059 ms | 24.724 ms |
| Uniform random | 31.682 ms | 25.829 ms |
| Random sign, fixed magnitude | 25.979 ms | 24.160 ms |
| All zeros | 18.896 ms | 19.424 ms |
| Constant fill | 20.606 ms | 24.350 ms |
| Uninitialized storage | 30.213 ms | 24.321 ms |

**Table 34 Operand values changed GEMM timing at fixed shape, layout, and dtype.** The grouped operation used eight groups with 16,384 rows per group and 8192 × 16384 BF16 weights; the dense operation used the corresponding M = 131,072, K = 8192, N = 16,384 shape. Measurements use one NVIDIA B300 GPU, two warmup iterations, and five timed iterations; the table reports their median. Bold marks the times that depart clearly from the normalrandom baseline. Uninitialized storage is shown only to expose the original benchmark error; it is not a meaningful model-like weight-value distribution. The reproducer, recovered summary data, and provenance notes are bundled with the report’s experiment artifacts.

<!-- page 117 of 168 -->

Relative to normally distributed weights, zeros reduced the grouped-GEMM time by 39%, a constant fill reduced it by 34%, and random signs at a fixed magnitude reduced it by 16%. The dense GEMM also took 21% less time with zero weights, but its constant-fill time remained close to the normal case. The effect is therefore neither unique to grouped GEMM nor a simple monotonic law of value entropy. This is a single run that preserved medians but not individual samples, clocks, power, temperature, or the complete software environment. The percentages characterize this run rather than a general Blackwell performance law.

相对正态分布的权重, 全零让 grouped GEMM 耗时降 39%, 常数填充降 34%, 固定幅值加随机符号降 16%. dense GEMM 在全零权重下也少用 21% 的时间, 但常数填充时的耗时与正态情况接近. 所以这个效应既不只出现在 grouped GEMM 上, 也不是随取值熵单调变化的简单规律. 这只是一次运行, 只保留了中位数, 没保留单次样本, 时钟, 功耗, 温度和完整的软件环境. 这些百分比描述的是这次运行, 不是 Blackwell 的一般性能规律.

## 19.1 Operand-Dependent Hardware Behavior Has Prior Evidence · 硬件行为随操作数变化, 已有先例

On an NVIDIA A100, Bhalachandra et al. (2022) measured the same 16,384<sup>3</sup> DGEMM with fixed and random matrix values. The fixed-valued case reached 19.4 TFLOP/s, whereas the random case reached 18.6 TFLOP/s, about 4% lower, while drawing 67% more average power. Their measurements show that operand values affect the physical workload even when matrix dimensions match.

Bhalachandra et al. (2022) 在 NVIDIA A100 上用固定值和随机值分别测了同一个 $16{,}384^3$ 的 DGEMM. 固定值达到 19.4 TFLOP/s, 随机值达到 18.6 TFLOP/s, 低约 4%, 平均功耗却高 67%. 他们的测量表明, 即使矩阵尺寸相同, 操作数的取值也会影响实际的物理负载.

Other studies also find value-dependent power, without always observing a runtime difference. ALUPower measured substantial value-dependent energy variation in GPU arithmetic (Lucas and Juurlink, 2016). More recently, Gregersen et al. (2024) varied GEMM value distributions, bit similarity, placement, and sparsity on A100, H100, V100, and RTX 6000 GPUs. They found power changes approaching 40%. In their main A100 experiments, however, the average CUTLASS GEMM runtime for a fixed datatype remained consistent to the microsecond level. Together, these studies establish that operand bits can change physical GPU activity. They do not establish that every GPU, shape, or power regime will turn that change into a runtime difference.

其他研究也发现功耗随取值变化, 但不一定看到运行时间的差异. ALUPower 测到 GPU 算术的能耗随取值有明显变化 (Lucas and Juurlink, 2016). 更近一些, Gregersen et al. (2024) 在 A100, H100, V100 和 RTX 6000 上改变 GEMM 的取值分布, 比特相似度, 摆放和稀疏度, 发现功耗变化接近 40%. 但在他们主要的 A100 实验里, 固定数据类型下 CUTLASS GEMM 的平均运行时间一直稳定到微秒级. 这些研究合起来说明, 操作数的比特能改变 GPU 的物理活动; 但不能说明每种 GPU, 每种形状, 每种功耗区间都会把这种变化转成运行时间的差异.

## 19.2 Possible Mechanisms and Their Evidence · 可能的机制及其证据

Our benchmark did not isolate a hardware mechanism. A plausible explanation is data-dependent switching activity. Similar bit patterns and low Hamming weight can reduce bit transitions through arithmetic and memory datapaths, which changes dynamic power. If a power-limited GPU responds by changing its operating frequency, the same instruction stream can then take a different amount of time. This explanation is consistent with the prior power studies, but our run did not record power or SM clocks and therefore does not test the causal chain.

我们的基准没有分离出具体的硬件机制. 一个说得通的解释是随数据变化的翻转活动. 相似的比特模式和低 Hamming 重量, 能减少算术与访存数据通路上的比特翻转, 从而改变动态功耗. 如果一张受功耗限制的 GPU 通过调整工作频率来响应, 同样的指令流就会耗时不同. 这个解释与前面的功耗研究一致, 但我们的运行没有记录功耗和 SM 时钟, 所以没有检验这条因果链.

Separate B300 stress measurements show that power limiting can reduce clocks and throughput. The grouped GEMM diagnostic of Section 9 (Appendix A.12) drove B300 GPUs against their board power limit with very large expert shapes: the software power-cap limiter was active in effectively every telemetry sample, the median SM clock fell from 1174 to 960 MHz, and median grouped-GEMM throughput fell from 1366 to 1163 TFLOP/s, while per-trial throughput per MHz (each trial’s throughput divided by its mean SM clock) had per-shape medians within 1.16–1.19 TFLOP/s/MHz on the same kernel template. That run varied shape rather than operand values, so it speaks to how this hardware responds rather than to what triggered the response in Table 34. In the stress diagnostic, throughput fell with the lower clock. These measurements do not establish why operand values changed timing in the original run. Table 35 collects the observations relevant to the power-and-clock hypothesis. Matching operands, as described in Section 19.3, controls the observed timing effect without requiring a choice among mechanisms.

另一组 B300 压力测量表明, 功耗限制会压低时钟和吞吐. §9 的 grouped GEMM 诊断 (附录 A.12) 用极大的 expert 形状把 B300 顶到板卡功耗上限: 几乎每个遥测样本里软件功耗上限限制器都处于激活状态, SM 时钟中位数从 1174 MHz 降到 960 MHz, grouped GEMM 吞吐中位数从 1366 TFLOP/s 降到 1163 TFLOP/s; 而每次试验的每 MHz 吞吐 (该次吞吐除以它的平均 SM 时钟), 在同一个 kernel 模板上按形状取中位数, 都落在 1.16 到 1.19 TFLOP/s/MHz. 那次运行改的是形状而非操作数取值, 所以它说明这款硬件如何响应, 回答不了 Table 34 里是什么触发了响应. 在压力诊断里, 吞吐随时钟降低而下降. 这些测量不能说明原始运行里操作数取值为什么改变了耗时. Table 35 汇总了与「功耗加时钟」假说相关的观测. 按 §19.3 的做法对齐操作数, 就能控制住观测到的耗时效应, 不必先在几种机制之间做出判断.

> **回看:** §19.2 用 B300 压力测试里「每 MHz 吞吐近乎恒定」去支撑功耗降频假说, 可 Table 34 里 dense GEMM 在常数填充下几乎不变 (24.350 对 24.724 ms), grouped GEMM 却快了 34%; 单靠「比特翻转少, 功耗低, 时钟高」解释得了这个差别吗?
> 答: 按降频假说, 时间与时钟成反比, 常数填充时两种 GEMM 的翻转都应该很少. 若都处在功耗上限, 两者应该一起变快; dense 不变, 说明至少 dense 那次没有被功耗卡住, 或者它的耗时主要不由时钟决定. 一种可能是工作点不同: grouped GEMM 8 组各 16,384 行, 总量与 dense 的 $M=131{,}072$ 相同, 但 kernel 模板和 tile 调度不同, 各自离功耗上限多远可以不一样, 离得近的那个才对比特翻转敏感. 全零时 dense 也降了 21%, 与「零值翻转最少, 把 dense 也压到上限以下」相符. 这条推断要靠同时记录 SM 时钟和功耗来验证, 正文承认这次运行没记; 按 Table 35 只能确认「功耗限制会降频」和「取值会改功耗」两段, 中间「本次运行确实触发了降频」这一环没有数据, 只是从已知数字推出的说法, 没有数据验证.

Inline compression is another possible mechanism, but we have no evidence that it was active in this experiment. NVIDIA documents that Hopper can transfer compressible global memory using fewer physical bytes and thereby exceed nominal uncompressed bandwidth (NVIDIA, 2026s). This is an opt-in property of an individual allocation, requested through the CUDA Driver API; it is not a general promise that ordinary tensors are compressed (NVIDIA, 2026o). Our benchmark used ordinary PyTorch allocations on a Blackwell B300 and never requested the compressible-memory attribute. A later check on the same GPU class with the current PyTorch allocator found that an ordinary tensor, when it could be queried at all, reported no compression attribute; that check describes the current allocator rather than the environment of the original run. The high arithmetic intensity of these GEMMs and the different constant-fill behavior of grouped and dense kernels also argue against assuming a single bandwidth-only explanation.

inline 压缩是另一种可能的机制, 但我们没有证据表明它在这次实验里生效. NVIDIA 文档写明, Hopper 传输可压缩的全局内存时能用更少的物理字节, 从而超过名义上的未压缩带宽 (NVIDIA, 2026s). 这是单个内存分配需要主动开启的属性, 要通过 CUDA Driver API 申请; 并不是说普通 tensor 都会被压缩 (NVIDIA, 2026o). 我们的基准在 Blackwell B300 上用的是普通 PyTorch 分配, 从没申请过可压缩内存属性. 之后在同类 GPU 上用当前的 PyTorch 分配器检查过: 普通 tensor 只要能查询, 都显示没有压缩属性; 这次检查描述的是当前分配器, 不是原始运行时的环境. 这些 GEMM 的算术强度很高, grouped 和 dense kernel 在常数填充下的表现又不一样, 这两点也说明不该假定只有带宽这一种解释.

The public GEMM interfaces do not declare that zero or constant operands may skip mathematical work, so we do not interpret the result as semantic zero skipping. We also did not preserve a kernel-identity or instruction trace that would rule out every library- or kernel-specific effect. The claim this report makes is

<!-- page 118 of 168 -->

| Observation | What was measured | Source |
| --- | --- | --- |
| Operand values change dynamic | Random values drew 67% more average power than fixed | A100, prior work |
| power | values in a 16,384<sup>3</sup> DGEMM; value distributions moved GEMM power by up to about 40% |  |
| A power-limited GPU lowers its | Power-cap limiter active in 99.3% of telemetry samples; | B300, Section 9 |
| clock | SM clock 1174 to 960 MHz |  |
| Lower throughput tracks the | Throughput 1366 to 1163 TFLOP/s at a nearly constant | B300, Appendix A.12 |
| lower clock | 1.16-1.19 TFLOP/s per MHz (per-shape medians), same kernel template |  |
| Operand values change time | Grouped-GEMM time fell by 16-39% and dense-GEMM time by up to 21% at fixed shape, layout, and dtype | B300, Table 34 |

limited to the observation: operand values changed the time of an otherwise identical GEMM. The measurements do not identify which combination of switching power, clock response, and memory-system behavior produced it.

公开的 GEMM 接口没有声明零值或常数操作数可以跳过数学运算, 所以我们不把这个结果解读为语义上的跳零. 我们也没有保留 kernel 身份或指令 trace, 无法排除所有库或 kernel 特有的效应. 本报告的结论只限于观测本身: 在其他条件完全相同时, 操作数取值改变了 GEMM 的耗时. 这些测量没有确定是翻转功耗, 时钟响应和内存系统行为中哪几项的组合造成了它.

## 19.3 Use the Same Initialization in Every Comparison · 每次比较都用同样的初始化

## Operands Are Part of the Benchmark Configuration · 操作数属于基准配置的一部分

For a backend comparison, use identical loaded weights whenever possible. Otherwise, use the same initializer, seed, scale, dtype, and layout on every path. Matching only the GEMM dimensions is insufficient.

做后端比较时, 能用同一份加载的权重就用同一份. 做不到时, 每条路径都用同样的初始化器, 种子, 尺度, dtype 和布局. 只对齐 GEMM 的尺寸是不够的.

This control should be applied after sharding, conversion, or expert placement so that no path retains uninitialized local storage. End-to-end comparisons should load the same checkpoint. Synthetic comparisons should use the same initialization method and random seed. Zeros, constant fills, and torch.empty() are useful diagnostic cases, but they are not substitutes for model-like values. If a communication change appears to alter an otherwise unchanged GEMM, operand statistics, clocks, and power should be checked before attributing the difference to the communication backend.

这项控制要在分片, 转换或 expert 摆放之后执行, 确保没有哪条路径还留着未初始化的本地存储. 端到端比较应加载同一个 checkpoint. 合成比较应使用同样的初始化方法和随机种子. 全零, 常数填充和 `torch.empty()` 适合做诊断用例, 但替代不了接近真实模型的取值. 如果某个通信改动看上去改变了一个本来没动的 GEMM, 先查操作数的统计, 时钟和功耗, 再考虑把差异归到通信后端头上.

## 20 One Shared Expert Is All You Need · 一个 shared expert 就够了

**Multiple ungated shared experts can be merged.** Several recent MoE designs expose the number of always-active shared experts as a choice; Olmo-core supports at most one, because any larger count expresses the same model. Suppose every token is sent to several shared experts, every shared expert receives the same input, and their outputs are added without expert-specific, input- or task-dependent gates. The same function can be computed by one shared multilayer perceptron (MLP) whose intermediate width is the sum of their widths (Figure 68). The number of named shared experts is therefore only a partitioning choice; the architectural quantity is the **total shared width**.

**多个不带门控的 shared expert 可以合并.** 近来有几种 MoE 设计把常驻激活的 shared expert 个数当作可调选项; Olmo-core 最多只支持一个, 因为个数再多, 表达的也是同一个模型. 假设每个 token 都送到几个 shared expert, 每个 shared expert 收到相同的输入, 它们的输出直接相加, 没有按 expert, 输入或任务区分的门控. 那么同一个函数可以用一个 shared 多层感知机 (MLP) 算出来, 它的中间宽度是各 shared expert 宽度之和 (Figure 68). 所以有几个具名的 shared expert, 只是一种切分方式; 真正属于架构的量是 **shared 总宽度**.

MoEfication uses the same intermediate-dimension partition of a Transformer feed-forward network, and DSMoE writes the equivalence explicitly for a SwiGLU MLP (Zhang et al., 2022; Lv et al., 2025). At fixed total shared width, changing only the number of ungated shared modules does not change the function class.

MoEfication 对 Transformer feed-forward 网络用的就是同样的中间维切分, DSMoE 则对 SwiGLU MLP 显式写出了这个等价关系 (Zhang et al., 2022; Lv et al., 2025). 在 shared 总宽度固定时, 只改变不带门控的 shared 模块个数, 不改变函数类.

<!-- page 119 of 168 -->

![Image block](images/p119-figure-68-combining-ungated-shared-experts-into-one-wider.jpg)

Figure 68 Combining ungated shared experts into one wider MLP. Every token reaches all $N _ { s }$ shared experts, and their outputs are added with fixed unit coefficients, so the sum equals one MLP whose intermediate width is the sum of the branch widths (Equation 76). The dashed marks show where each original partition sits after concatenating the up and gate projections and stacking the down projections; box widths are drawn proportional to intermediate widths.

## 20.1 The Collapse Is Exact · 合并是严格等价的

Let shared expert $j$ have intermediate width $m _ { j }$ . Using row-vector notation, write its SwiGLU computation as (Shazeer, 2020)

设共享专家 $j$ 的中间宽度为 $m _ { j }$. 用行向量记号, 它的 SwiGLU 计算写成 (Shazeer, 2020)

$$
E _ {j} (x) = \left[ \mathrm{SiLU} \Bigl (x W _ {g} ^ {(j)} \Bigr) \odot \Bigl (x W _ {u} ^ {(j)} \Bigr) \right] W _ {d} ^ {(j)}.\tag{74}
$$

Each gate and up projection has $m _ { j }$ columns, and the down projection has $m _ { j }$ rows. Form one wider MLP by concatenating the gate and up projections and stacking the down projections:

gate 投影和 up 投影各有 $m _ { j }$ 列, down 投影有 $m _ { j }$ 行. 把各专家的 gate, up 投影按列拼接, down 投影按行堆叠, 就得到一个更宽的 MLP:

$$
W _ {g} ^ {\star} = \left[ \begin{array}{c c c} W _ {g} ^ {(1)} & \dots & W _ {g} ^ {(N _ {s})} \end{array} \right], \qquad W _ {u} ^ {\star} = \left[ \begin{array}{c c c} W _ {u} ^ {(1)} & \dots & W _ {u} ^ {(N _ {s})} \end{array} \right], \qquad W _ {d} ^ {\star} = \left[ \begin{array}{c} W _ {d} ^ {(1)} \\ \vdots \\ W _ {d} ^ {(N _ {s})} \end{array} \right].\tag{75}
$$

Because SiLU and the elementwise product act independently along the intermediate dimension, multiplication by the stacked down projection adds the partitions:

SiLU 和逐元素乘积在中间维上各分量互不影响, 所以乘上堆叠后的 down 投影, 结果正好是各分块输出之和:

$$
E _ {\star} (x) = \left[ \operatorname{SiLU} \left(x W _ {g} ^ {\star}\right) \odot \left(x W _ {u} ^ {\star}\right) \right] W _ {d} ^ {\star} = \sum_ {j = 1} ^ {N _ {s}} E _ {j} (x), \quad \text {width} \left(E _ {\star}\right) = \sum_ {j = 1} ^ {N _ {s}} m _ {j}.\tag{76}
$$

The same construction applies to an ordinary two-layer MLP. Fixed expert-specific coefficients do not change the result: for $\textstyle \sum _ { j } c _ { j } E _ { j } ( x )$ , absorb each constant $c _ { j }$ into the corresponding rows of ${ W _ { d } ^ { ( j ) } }$ . A single input- or task-dependent gate shared by the entire branch also does not require several experts, since

同样的构造也适用于普通的两层 MLP. 每个专家各带一个固定系数, 结论不变: 对 $\textstyle \sum _ { j } c _ { j } E _ { j } ( x )$, 把常数 $c _ { j }$ 乘进 ${ W _ { d } ^ { ( j ) } }$ 的对应行即可. 整条分支共用一个依赖输入或任务的门, 同样用不着多个专家, 因为

$$
a (x) \sum_ {j} E _ {j} (x) = a (x) E _ {\star} (x).\tag{77}
$$

Only distinct input- or task-dependent coefficients $a _ { j } ( x , t )$ generally prevent this fixed reparameterization.

一般只有各专家各不相同, 且依赖输入或任务的系数 $a _ { j } ( x , t )$, 才会让这种固定的重参数化失效.

The wide and partitioned forms have the same parameters and ideal model FLOPs. Their parameter gradients also map slice by slice when initialization, optimizer settings, and optimizer variables are mapped in the same way. Separate kernels may accumulate floating-point terms in a different order, and the two layouts may have different systems performance, but neither effect creates a new represented function.

宽形式和分块形式的参数相同, 理想模型 FLOPs 也相同. 只要初始化, 优化器设置和优化器变量按同样方式对应, 两者的参数梯度也逐片一一对应. 分开的 kernel 累加浮点项的顺序可能不同, 两种排布的系统性能也可能不同, 但这两点都不会让模型多表示出一个新函数.

## 20.2 Dynamic Gates Preserve Expert Identity · 动态门让专家保持各自身份

Multiple shared experts become a real architectural choice when the branches are no longer fixed partitions of one MLP. Let $h _ { j } ( x )$ denote expert j’s intermediate activation of width $m _ { j } ,$ , and let $g _ { j } ( x , t )$ be its coefficient

<!-- page 120 of 168 -->

for input x and, when applicable, task t. Concatenate the activations as $H ( x ) { = } [ h _ { 1 } ( x ) \cdots h _ { N _ { s } } ( x ) ]$ . The gated merge can then be written as

只有当各分支不再是同一个 MLP 的固定分块时, 用多个共享专家才是真正的架构选择. 记 $h _ { j } ( x )$ 为专家 $j$ 宽度为 $m _ { j }$ 的中间激活, $g _ { j } ( x , t )$ 为它在输入 $x$ (以及适用时的任务 $t$) 下的系数. 把各激活拼成 $H ( x ) { = } [ h _ { 1 } ( x ) \cdots h _ { N _ { s } } ( x ) ]$, 带门的合并就可以写成

$$
\begin{array}{l} y (x, t) = \sum_ {j = 1} ^ {N _ {s}} g _ {j} (x, t) h _ {j} (x) W _ {d} ^ {(j)} = H (x) D (g (x, t)) W _ {d} ^ {\star}, \\ \quad D (g) = \text {blockdiag} \big (g _ {1} I _ {m _ {1}}, \ldots , g _ {N _ {s}} I _ {m _ {N _ {s}}} \big). \end{array}\tag{78}
$$

When the coefficients differ by expert, $D ( g ( x , t ) )$ changes with the input or task and cannot generally be absorbed into the fixed down projection $W _ { d } ^ { \star }$ . This is the precise boundary of the collapse. A common scalar $a ( x , t )$ applied to the whole sum does not change this: then $D = a I ,$ the experts still collapse into $E _ { \star } ,$ and only the outer branch gate remains. Conditional selection, per-expert normalization, different inputs, and branch-specific operations also preserve expert identity.

系数因专家而异时, $D ( g ( x , t ) )$ 随输入或任务变化, 一般没法吸收进固定的 down 投影 $W _ { d } ^ { \star }$. 合并成立与否的边界就在这里. 给整个求和乘一个公共标量 $a ( x , t )$ 改变不了这一点: 此时 $D = a I$, 各专家仍合并成 $E _ { \star }$, 只剩外层的分支门. 条件选择, 逐专家归一化, 各专家输入不同, 分支上各做不同的运算, 这几种情况同样会让专家保持各自身份.

| Architecture Adaptive local experts (Jacobs et al., 1991) | Expert structure Common expert bank; every expert receives the input | Gate and evaluation Normalized, input-dependent responsibilities for individual experts | Wdishtyinecxtperts stay Each expert receives a different dynamic coefficient |
| --- | --- | --- | --- |
| Hierarchical MoE (Jordan and Jacobs, 1994) | Experts organized beneath a tree of gates | Input-dependent coefficients composed along each path | The effective coefficient varies by expert and input |
| Sparsely-gated MoE | Globally available | Noisy top-K routing evaluates | Both the coefficients and |
| (Shazeer et al., 2017) | feed-forward expert bank | and weights a selected subset | executed experts vary |
| One-gate Mixture-of-Experts | One expert pool supplies | One input-dependent vector | One gating network still |
| (OMoE) | all task towers | gate forms a common dense | emits one coefficient per |
| (Ma et al., 2018) |  | mixture | expert |
| Multi-gate | Expert parameters are | Each task has its own | The same input can |
| Mixture-of-Experts (MMoE) | shared across tasks | input-dependent softmax vector | expose a different |
| (Ma et al., 2018) |  |  | mixture to each task |
| CGC / PLE | Multiple shared experts coexist with task-specific | Task gates separately weight both groups; PLE stacks these | Every shared expert remains separately |
| (Tang et al., 2020) | experts | units | addressable |

In the one-gate baseline, “one gate” means one network that emits a vector of expert coefficients, not one scalar multiplying the sum. Multi-gate Mixture-of-Experts (MMoE) makes the task dependence explicit, while Customized Gate Control and PLE add separately gated task-specific and shared banks. Dense vector gating and sparse top-K routing both prevent the collapse for the same algebraic reason; sparsity additionally changes which expert computations execute.

单门基线里的「一个门」, 指的是一个输出整组专家系数向量的网络, 不是乘在求和外面的一个标量. Multi-gate Mixture-of-Experts (MMoE) 把对任务的依赖显式写出来, Customized Gate Control 和 PLE 则加上各自带门的任务专属专家组和共享专家组. 稠密的向量门和稀疏的 top-K 路由阻止合并的代数原因相同; 稀疏还额外改变了哪些专家的计算会真正执行.

<!-- page 121 of 168 -->

## 20.3 Expert Count Is Not Shared Capacity · 专家个数不等于共享容量

The equivalence changes how shared-expert designs and ablations should be reported. For an ungated shared branch, the primary capacity variable is

这个等价关系改变了共享专家设计与消融的汇报方式. 对不带门的共享分支, 首要的容量变量是

$$
\left| m _ {s} = \sum_ {j = 1} ^ {N _ {s}} m _ {j}, \right.\tag{79}
$$

not $N _ { s }$ alone. Increasing the number of fixed-width shared experts increases $m _ { s } ,$ so it tests additional unconditional capacity and compute rather than an independent benefit from having more expert identities. A count ablation isolates expert partitioning only when total shared width remains fixed; under the assumptions above, such an ablation should differ only through numerical and systems effects.

而不只是 $N _ { s }$. 增加固定宽度共享专家的个数会让 $m _ { s }$ 变大, 所以这类实验测的是多出来的无条件容量和计算量, 测不出「专家身份更多」本身带来的好处. 只有保持共享总宽度不变, 个数消融才能单独考察专家分块; 在上面的假设下, 这样的消融只会在数值和系统层面有差别.

DeepSeekMoE provides a prominent always-active shared-expert construction (Dai et al., 2024). The collapse is compatible with useful shared capacity, since an unconditional branch may still capture common knowledge; it shows only that several unweighted shared partitions can be represented as one wider branch with the same total capacity.

DeepSeekMoE 是常开共享专家结构的代表 (Dai et al., 2024). 合并结论和共享容量有用并不矛盾, 无条件分支仍可能学到通用知识; 它只说明, 几个不加权的共享分块可以表示成一个总容量相同的更宽分支.

## 20.4 Shared and Routed Widths Are Independent · 共享宽度与路由宽度相互独立

This result directly motivates Olmo’s representation. Olmo uses one shared MLP and chooses its intermediate width independently from the width of one routed expert. There is no mathematical reason for the two widths to match. The shared width controls unconditional capacity applied to every token; the routed width controls the capacity contributed by each selected route.

Olmo 的表示方式直接来自这个结论. Olmo 只用一个共享 MLP, 它的中间宽度与单个路由专家的宽度分开选. 两个宽度在数学上没有理由必须相等. 共享宽度决定作用于每个 token 的无条件容量; 路由宽度决定每条被选中路由贡献的容量.

For example, the configuration analyzed in Section 21 uses routed-expert width 2,560 and shared width 1,280. Calling the latter “half of one routed expert” is only a comparison of widths. It is already the complete shared branch. Splitting it into two width-640 modules and adding their outputs would produce no new model function; combining two width-1,280 modules would simply create one width-2,560 shared MLP in partitioned form.

例如第 21 节分析的配置, 路由专家宽 2,560, 共享分支宽 1,280. 把后者叫作「半个路由专家」, 只是在比宽度. 它本身已经是完整的共享分支. 把它拆成两个宽 640 的模块再把输出相加, 得不到新的模型函数; 把两个宽 1,280 的模块合在一起, 也只是以分块形式写出的一个宽 2,560 的共享 MLP.

One wider MLP can also expose a larger GEMM and fewer module launches, but the mathematical identity alone does not predict throughput. Tensor placement, quantization scales, and available kernels can make one physical layout faster than another. Olmo’s use of one shared MLP follows from the functional equivalence, not a measured performance advantage. Its total width remains a model-recipe choice independent of routedexpert width.

一个更宽的 MLP 还能给出更大的 GEMM, 模块启动次数也更少, 但单凭数学恒等式推不出吞吐. 张量放置, 量化 scale 和可用的 kernel 都可能让某一种物理排布更快. Olmo 用一个共享 MLP, 依据是函数上的等价, 不是实测的性能优势. 它的总宽度仍是模型配方里的选择, 与路由专家宽度无关.

## 21 Merging Routed and Shared Expert Activations · 路由专家与共享专家输出的合并

Section 20 established that several ungated shared-expert partitions collapse into one wider shared MLP. After choosing that shared branch, the model recipe must specify how to weight it against the token-dependent routed branches.

第 20 节证明了几个不带门的共享专家分块可以合并成一个更宽的共享 MLP. 选定共享分支之后, 模型配方还要规定它与随 token 变化的路由分支之间怎么加权.

An MoE layer may contain both routed experts, selected separately for each token, and a shared expert, evaluated for every token. The routed and shared branches are projected back to the same model width before they are added, but that does not determine how strongly each branch should enter the sum. A normalization that appears innocuous can shrink the MoE output, change its Jacobian, and rescale the gradients of routed and shared parameters by different amounts.

一个 MoE 层可以同时含路由专家 (每个 token 单独选) 和共享专家 (每个 token 都算). 路由分支和共享分支相加之前都投影回同一个模型宽度, 但这并不决定各分支在求和里占多大分量. 一个看似无害的归一化, 可能让 MoE 输出变小, 改变它的 Jacobian, 并让路由参数和共享参数的梯度按不同倍数缩放.

For token $x ,$ let $S ( x )$ contain the K selected routed experts, let $f _ { i } ( x ) \in \mathbb { R } ^ { d _ { \mathrm { m o d e l } } }$ be routed expert i’s output, and let $g ( x ) \in \mathbb { R } ^ { d _ { \mathrm { m o d e l } } }$ be the shared-expert output. We write the merge as

对 token $x$, 令 $S ( x )$ 为被选中的 K 个路由专家, $f _ { i } ( x ) \in \mathbb { R } ^ { d _ { \mathrm { m o d e l } } }$ 为路由专家 $i$ 的输出, $g ( x ) \in \mathbb { R } ^ { d _ { \mathrm { m o d e l } } }$ 为共享专家的输出. 合并写成

$$
y _ {\mathrm{MoE}} (x) = \sum_ {i \in \mathcal {S} (x)} r _ {i} (x) f _ {i} (x) + s (x) g (x), \qquad | \mathcal {S} (x) | = K.\tag{80}
$$

The coefficients $r _ { i } ( x )$ determine the routed contribution, while $s ( x )$ sets the gain of the shared branch (Figure 69). As Appendix E shows, public MoE implementations make substantially different choices for both quantities (DeepSeek-AI et al., 2024; Muennighoff et al., 2024; Yan et al., 2026). We therefore treat the merge rule as part of the model and initialization recipe.

系数 $r _ { i } ( x )$ 决定路由部分的贡献, $s ( x )$ 设定共享分支的增益 (Figure 69). 附录 E 显示, 公开的 MoE 实现对这两个量的取法差别很大 (DeepSeek-AI et al., 2024; Muennighoff et al., 2024; Yan et al., 2026). 因此我们把合并规则看作模型与初始化配方的一部分.

<!-- page 122 of 168 -->

![Image block](images/p122-figure-69-merging-four-routed-expert-outputs-with-one.jpg)

Figure 69 Merging four routed-expert outputs with one shared-expert output. In the Olmo rule, selected routed coefficients vary by token but sum to $K = 4$ , so their mean is one; the shared-expert coefficient is also one. Routed and shared experts may have different intermediate widths because every branch returns a model-width tensor before the addition. Conceptual illustration with no measured quantities.

## 21.1 A Dense MLP Provides the Scale Reference · 用稠密 MLP 作尺度参照

A dense SwiGLU MLP provides a useful reference because its intermediate dimension can be partitioned exactly. Split its up, gate, and down-projection weights into K blocks of width $d _ { r }$ and one block of width $d _ { s }$ Matrix multiplication distributes across this partition, giving

稠密的 SwiGLU MLP 是个好参照, 因为它的中间维可以严格分块. 把它的 up, gate, down 投影权重切成 K 块宽 $d _ { r }$ 和一块宽 $d _ { s }$. 矩阵乘法对这种分块满足分配律, 于是

$$
f _ {\mathrm{dense}} (x) = \sum_ {i = 1} ^ {K} f _ {i} (x) + g (x), \qquad d _ {\mathrm{act}} = K d _ {r} + d _ {s}.\tag{81}
$$

Unit coefficients exactly recover a dense MLP formed by concatenating the active intermediate blocks. For the initialization-scale experiment below, $K = 4 ,   d _ { r } = 2 5 6 0$ , and $d _ { s } = 1 2 8 0$ , so the matched dense width is

系数全取 1 时, 恰好还原成把这些激活的中间块拼起来的稠密 MLP. 下文初始化尺度实验取 $K = 4 ,   d _ { r } = 2 5 6 0$, $d _ { s } = 1 2 8 0$, 对应的稠密宽度为

$$
d _ {\mathrm{act}} = 4 \times 2 5 6 0 + 1 2 8 0 = 1 1, 5 2 0.\tag{82}
$$

Routing replaces the four unit routed coefficients with data-dependent route weights. Let $p _ { i } ( x )$ denote the selected router probabilities after L1 normalization, so $\textstyle \sum _ { i } p _ { i } ( x ) = 1$ . Olmo-core uses

路由把这四个为 1 的路由系数换成随数据变化的路由权重. 记 $p _ { i } ( x )$ 为 L1 归一化后的被选 router 概率, 满足 $\textstyle \sum _ { i } p _ { i } ( x ) = 1$. Olmo-core 取

$$
r _ {i} (x) = K p _ {i} (x), \quad s (x) = 1.\tag{83}
$$

If the selected probabilities are uniform, $p _ { i } = 1 / K$ and every active branch again has coefficient one. The routed mixture therefore approaches the exact dense decomposition continuously as the selected probabilities approach a uniform distribution.

被选概率均匀时 $p _ { i } = 1 / K$, 每个激活分支的系数又回到 1. 所以被选概率越接近均匀分布, 路由混合就越连续地接近严格的稠密分解.

This choice also accounts for different expert widths without an additional width multiplier. Define the **width-weighted mean coefficient**

这种取法也不用额外的宽度乘子就能处理专家宽度不同的情况. 定义**宽度加权平均系数**

$$
\bar {a} _ {w} = \frac {d _ {r} \sum_ {i} r _ {i} + d _ {s} s}{K d _ {r} + d _ {s}}.\tag{84}
$$

Equation 83 gives $\bar { a } _ { w } = 1$ for any $d _ { r }$ and $d _ { s } .$ Since the width-weighted mean is already one, a further common factor would rescale the whole MoE output rather than compensate for unequal widths. The narrower shared expert already contributes fewer independently initialized intermediate units, so multiplying its output by a second width fraction would count the same width difference twice under this initialization.

按式 (83), 不论 $d _ { r }$ 和 $d _ { s }$ 取多少, 都有 $\bar { a } _ { w } = 1$. 宽度加权平均已经是 1, 再乘一个公共因子只会缩放整个 MoE 输出, 起不到补偿宽度差异的作用. 更窄的共享专家本来就只贡献更少的独立初始化中间单元, 在这种初始化下再给它的输出乘一个宽度比例, 同一个宽度差就被算了两次.

## Matching the Coefficients of a Partitioned Dense MLP · 与分块稠密 MLP 的系数对齐

Selected router probabilities have mean $1 / K$ Multiplying them by K makes the mean routed coefficient one, matching the coefficient of each block in an additively partitioned dense MLP. The shared branch then enters the same sum with unit gain.

被选 router 概率的均值是 $1 / K$. 乘上 K 后, 路由系数的均值变成 1, 与加法分块稠密 MLP 中每一块的系数一致. 共享分支再以增益 1 进入同一个求和.

<!-- page 123 of 168 -->

## 21.2 Predicting Variance at Initialization · 预测初始化时的方差

The dense decomposition also yields a simple scale prediction. Assume the randomly initialized branch outputs are centered and approximately independent, and that output variance is proportional to intermediate width under the common initialization. Conditional on the router coefficients, the MoE-to-dense outputvariance ratio is

稠密分解还能给出一个简单的尺度预测. 假设随机初始化后各分支输出均值为零, 近似相互独立, 并且在通用初始化下输出方差与中间宽度成正比. 给定 router 系数, MoE 输出方差与稠密输出方差之比为

$$
R _ {\mathrm{var}} \approx \frac {d _ {r} \sum_ {i} r _ {i} ^ {2} + d _ {s} s ^ {2}}{K d _ {r} + d _ {s}}.\tag{85}
$$

For the Olmo rule,

对 Olmo 规则,

$$
R _ {\mathrm{var}} ^ {\mathrm{Olmo}} \approx \frac {d _ {r} K ^ {2} \sum_ {i} p _ {i} ^ {2} + d _ {s}}{K d _ {r} + d _ {s}}.\tag{86}
$$

Uniform routing gives $\textstyle \sum _ { i } p _ { i } ^ { 2 } = 1 / K$ and hence $R _ { \mathrm { v a r } } ^ { \mathrm { O l m o } } = 1$ . Router concentration increases the ratio according to the concentration term $\sum _ { i } p _ { i } ^ { 2 }$

均匀路由下 $\textstyle \sum _ { i } p _ { i } ^ { 2 } = 1 / K$, 因而 $R _ { \mathrm { v a r } } ^ { \mathrm { O l m o } } = 1$. router 越集中, 方差比就按集中度项 $\sum _ { i } p _ { i } ^ { 2 }$ 升高.

Table 37 contrasts this rule with the three alternatives used in our controlled experiment. All four define valid model parameterizations, but they do not begin at the same forward or backward scale.

Table 37 把这条规则与对照实验里用到的另外三种取法并列. 四种都是合法的模型参数化, 但它们起步时的前向尺度和反向尺度并不相同.

<table><tbody><tr><td>Convention</td><td colspan="2">Coefficients</td><td>Immediate effect</td></tr><tr><td>Olmo</td><td>r<sub>i</sub> = Kp<sub>i</sub>,</td><td>s = 1</td><td>Unit-average routed coefficients and a unit-gain shared branch.</td></tr><tr><td>Routed unit sum</td><td>r<sub>i</sub> = p<sub>i</sub>,</td><td>s = 1</td><td>The routed mixture receives one unit in to-tal, while the shared branch independently receives unit gain.</td></tr><tr><td>Equal branch mass</td><td>ri = 12pi,</td><td>s = 12</td><td>Runoiuttoefdcaonedfficsiheanrtedmacossn.tributions split one</td></tr><tr><td>Width-proportional unit sum</td><td>r<sub>i</sub> = Kdr <sub>pi</sub>, dact</td><td>s = ds d<sub>act</sub></td><td>Ain spirnogpleorutinoint toof caocteiffiveciiennttermmaesdsiaistedwiviiddtehd.</td></tr></tbody></table>

## 21.3 The Measured Forward and Backward Scales Agree · 实测的前向与反向尺度与预测一致

We test the prediction in a controlled random-initialization experiment summarized in Figure 70. The forward study uses $d _ { \mathrm { m o d e l } } = 2 5 6 0 ,   d _ { r } = 2 5 6 0 ,   d _ { s } = 1 2 8 0 ,   N = 4 8$ routed experts, and $K = 4 .$ . It evaluates 512 random tokens for each of eight seeds. The dense reference concatenates the same selected and shared weights into an exact width-11,520 SwiGLU MLP, so differences arise from merge coefficients rather than different sampled parameters.

我们用一个受控的随机初始化实验检验这个预测, 结果汇总在 Figure 70. 前向实验取 $d _ { \mathrm { m o d e l } } = 2 5 6 0 ,   d _ { r } = 2 5 6 0 ,   d _ { s } = 1 2 8 0 ,   N = 4 8$ 个路由专家, $K = 4$, 8 个随机种子各评估 512 个随机 token. 稠密参照把同一批被选权重和共享权重拼成一个严格宽 11,520 的 SwiGLU MLP, 所以差异只来自合并系数, 不来自采样到的参数不同.

The backward study retains all 48 routed experts while scaling every dimension down by a factor of ten to make repeated gradient measurements practical. It uses 1024 tokens for each of twelve seeds and applies the same random upstream gradient to every normalization. We report input gradients with router coefficients both fixed and differentiable, separating the expert-path Jacobian from the additional gradient through the router.

反向实验保留全部 48 个路由专家, 但把每个维度缩小到十分之一, 以便反复测梯度. 12 个种子各用 1024 个 token, 每种归一化都喂同一个随机上游梯度. 输入梯度分 router 系数固定和可微两种情况报告, 以便把专家路径的 Jacobian 与经 router 多出来的梯度分开.

The selected probabilities have $\textstyle \mathbb { E } [ \sum _ { i } p _ { i } ^ { 2 } ] = 0 . 2 5 8 9$ , only slightly above the uniform top-4 value of 0.25. Substituting this measurement into Equation 86 predicts a variance ratio of 1.032, matching the measured va<u>lue to with</u>in 0.03 percentage points. The shared-to-routed branch RMS ratio is0.7082 ± 0.0028, close to $\sqrt { 1 2 8 0 / 2 5 6 0 } = 0 . 7 0 7 1$ . This confirms that intermediate width already controls branch scale under the tested initialization.

被选概率的 $\textstyle \mathbb { E } [ \sum _ { i } p _ { i } ^ { 2 } ] = 0 . 2 5 8 9$, 只比均匀 top-4 的 0.25 略高. 把这个实测值代入式 (86), 预测方差比为 1.032, 与实测值相差不到 0.03 个百分点. 共享分支与路由分支的 RMS 比为 0.7082 ± 0.0028, 接近 $\sqrt { 1 2 8 0 / 2 5 6 0 } = 0 . 7 0 7 1$. 这说明在所测的初始化下, 中间宽度本身已经决定了分支尺度.

The backward results expose a second advantage of the Olmo parameterization. With router coefficients fixed, its input-Jacobian scale remains close to the dense reference. Its routed and shared down-projection gradients also retain the unit-coefficient scale. By contrast, routed-unit-sum normalization reduces the routed down-projection gradient RMS to 0.25× the Olmo value for $K = 4$ , while leaving the shared down-projection

<!-- page 124 of 168 -->

![Image block](images/p124-a-forward-output-rms-relative-to-matched-dense.jpg)

(a) Forward output RMS relative to matched dense

![Image block](images/p124-b-input-gradient-rms-relative-to-matched-dense.jpg)

(b) Input-gradient RMS relative to matched dense

![Image block](images/p124-c-weight-gradient-rms-relative-to-the-olmo.jpg)

> 图注: c weight gradient rms relative to the olmo.

(c‌) Weight-gradient RMS relative to the Olmo rule

![Image block](images/p124-figure-70-olmo-s-merge-rule-preserves-dense-like.jpg)

(d) Cosine similarity to matched dense output

Figure 70 Olmo’s merge rule preserves dense-like scale at random initialization. The four conventions are those of Table 37. (a) The Olmo output RMS is 1.016× the matched dense reference, corresponding to a 1.032× variance ratio. (b) Its fixed-router input-gradient RMS is also 1.016× dense; differentiating through the router raises the ratio to 1.054×. (c) Alternatives that constrain the routed or total coefficient mass to one reduce the routed down-projection gradient to a quarter or less of the Olmo value while the shared gradient stays at one or falls with it. (d) Olmo’s output also stays closest in direction to the dense output. Forward measurements use the full-size initialization configuration; backward measurements use the dimensionally scaled surrogate described in the text.

gradient unchanged. Changing the merge rule is therefore also a parameter-family-specific learning-rate change unless the initialization and optimizer are adjusted with it.

反向结果显示了 Olmo 参数化的第二个好处. router 系数固定时, 它的输入 Jacobian 尺度与稠密参照接近, 路由和共享 down 投影的梯度也保持系数为 1 时的尺度. 相比之下, 在 $K = 4$ 时, routed-unit-sum 归一化把路由 down 投影梯度的 RMS 降到 Olmo 的 0.25 倍, 共享 down 投影的梯度却不变. 所以, 除非初始化和优化器跟着一起调, 改合并规则也等于按参数族分别改了学习率.

> **问:** routed-unit-sum 让路由 down 投影梯度降到 0.25×; 训练用的是 AdamW, 梯度的整体缩放会被二阶矩归一化抵消, 为什么还说它等于改学习率?
> 答: 0.25 就是系数比 $p_i/(Kp_i)=1/K$: 式 (80) 里 $f_i$ 被乘 $r_i$, 所以 $\partial L/\partial W_d^{(i)}$ 同比例缩放. 对 Adam 而言, 一个参数张量的梯度整体乘常数, 更新量 $m/\sqrt{v}$ 基本不变 (只在梯度量级接近 $\epsilon$ 时才有差别), 被抵消的是「梯度小 4 倍」这一半. 没被抵消的是另一半: 同样大小的 $\Delta W_d^{(i)}$ 经过系数 $p_i$ 而非 $Kp_i$ 作用到输出, 对 $y_{\mathrm{MoE}}$ 的影响小 $K$ 倍, 而共享分支的有效步长不变. 所以在 Adam 下, 「路由参数族的有效学习率相对共享参数族变了 $K$ 倍」这一结论仍然成立, 只是来源从梯度大小换成了输出端的系数. 报告 §21.4 把 weight decay 和梯度裁剪也列进去, 裁剪按全局范数作用, 路由梯度变小会改变裁剪触发点, 这一点在 Adam 下不会被抵消. 报告没有给训练中的对照实验, 上面的 Adam 分析是推断.

## 21.4 Scope of the Initialization Result · 初始化结论的适用范围

Olmo’s $r _ { i } = K p _ { i } , \; s = 1$ rule preserves dense-like forward and expert-path backward scale under the stated architecture, initialization, and approximately uniform selected routing. It has a direct additive interpretation, handles unequal expert widths without a second width penalty, and makes its departure from dense scale predictable through $\sum _ { i } p _ { i } ^ { 2 }$

在上述架构, 初始化和被选路由近似均匀的条件下, Olmo 的 $r _ { i } = K p _ { i } , \; s = 1$ 规则让前向尺度和专家路径的反向尺度都接近稠密. 它可以直接按加法分块来理解, 处理专家宽度不等时不用再加一层宽度惩罚, 与稠密尺度的偏离也能用 $\sum _ { i } p _ { i } ^ { 2 }$ 预测.

The result does not establish a universal MoE normalization. Public models use retained routed mass below one, unit routed mass, learned shared gates, and model-specific routed scales; Appendix E provides a sourcepinned comparison. These recipes also differ in initialization, upcycling, router form, and expert width, so their coefficients cannot be ranked in isolation.

这个结果并不构成通用的 MoE 归一化方案. 公开模型里, 有的保留的路由总质量小于 1, 有的路由总质量为 1, 有的给共享分支学一个门, 有的用模型特定的路由缩放; 附录 E 给出了对应到具体源码版本的对比. 这些配方在初始化, upcycling, router 形式和专家宽度上也各不相同, 所以不能脱离配方单独给它们的系数排高下.

Fixed coefficient changes can often be absorbed into expert down projections, but that reparameterization does not make the training recipes identical. It changes initial parameter scale, optimizer states, weight decay, gradient clipping, and effective learning rates. The measurements here characterize random initialization and local backward scale; they do not measure trained language-model quality.

固定系数的改动通常可以吸收进专家的 down 投影, 但这种重参数化并不让训练配方变得等同. 它会改变初始参数尺度, 优化器状态, weight decay, 梯度裁剪和有效学习率. 这里的测量刻画的是随机初始化和局部的反向尺度, 没有测训练后语言模型的质量.

<!-- page 125 of 168 -->

## 22 Beyond Pretraining · 预训练之外

When the same distributed MoE learner is used for post-training, parameter placement and gradient synchronization are still needed for a model whose capacity exceeds one device, but supervision, additional model copies, and rollout generation change the workload. We map those requirements onto the sparse learner and identify the systems needed around it. **This section is a design mapping:** we report no integrated MoE post-training run, throughput, or quality result.

把同一套分布式 MoE learner 用于后训练时, 模型容量仍超过单卡, 参数放置和梯度同步照样需要; 但监督方式, 额外的模型副本和 rollout 生成会改变负载. 我们把这些需求映射到稀疏 learner 上, 并指出它周围还需要哪些系统. **本节只做设计映射:** 不报告任何集成的 MoE 后训练运行, 吞吐或质量结果.

Ai2’s open-instruct codebase provides implementations of several post-training workloads, while the Tülu 3 report documents an earlier actor-critic reinforcement-learning recipe (Ai2, 2026; Lambert et al., 2024). This section considers four workloads: supervised fine-tuning (SFT), Direct Preference Optimization (DPO), Group Relative Policy Optimization (GRPO) (Shao et al., 2024), and Proximal Policy Optimization (PPO) with a critic (Schulman et al., 2017). The open-instruct implementations use different backends: cachedreference DPO uses Accelerate and one GRPO path uses Olmo-core FSDP, while open-instruct’s SFT support includes OLMoE models. Reusing a post-training objective does not require copying its original distributed backend. Table 38 decomposes each workload into its components and marks what this report’s mechanisms could contribute to each. Every workload contains a learner. Preference and reinforcement-learning workloads add reference policies or other model copies, and reinforcement learning also needs a rollout inference system.

Ai2 的 open-instruct 代码库实现了几种后训练负载, Tülu 3 报告记录了更早的一套 actor-critic 强化学习配方 (Ai2, 2026; Lambert et al., 2024). 本节考虑四种负载: 监督微调 (SFT), Direct Preference Optimization (DPO), Group Relative Policy Optimization (GRPO) (Shao et al., 2024), 以及带 critic 的 Proximal Policy Optimization (PPO) (Schulman et al., 2017). open-instruct 的各实现后端不同: 缓存 reference 的 DPO 用 Accelerate, 有一条 GRPO 路径用 Olmo-core FSDP, open-instruct 的 SFT 支持 OLMoE 模型. 复用一个后训练目标, 并不需要照搬它原来的分布式后端. Table 38 把每种负载拆成组件, 并标出本报告的机制能为每个组件提供什么. 每种负载都有一个 learner. 偏好训练和强化学习负载还要加 reference policy 或其他模型副本, 强化学习另外需要一个 rollout 推理系统.

## 22.1 Response-Only Supervision Uses Label Masking · 只监督回复部分靠 label mask 实现

Supervised fine-tuning (Wei et al., 2022; Ouyang et al., 2022) trains on supervised input–target examples, such as instructions paired with demonstrations.

监督微调 (Wei et al., 2022; Ouyang et al., 2022) 在带监督的输入-目标样本上训练, 例如指令配示范回答.

Here we consider a response-only objective: the prompt conditions the prediction, while only response tokens contribute direct loss terms. Olmo’s label-mask path can express this choice by marking prompt labels as ignored. The DDP train module excludes those labels from the loss denominator and identifies them through label\_ignore\_index (default −100); it derives per-batch labels when the data loader does not supply them. A supervised batch therefore differs from a pretraining batch in the contents of the label tensor and in the resulting denominator, not in the forward path, the routed expert computation, or the gradient reduction.

这里考虑只监督回复的目标: prompt 作为预测的条件, 只有回复 token 直接贡献 loss 项. Olmo 的 label-mask 路径把 prompt 的 label 标为忽略即可表达这一点. DDP train module 通过 label\_ignore\_index (默认 −100) 识别这些 label, 并把它们排除在 loss 分母之外; data loader 不提供 label 时, 它按批次自行推出. 因此监督批次与预训练批次的区别只在 label 张量的内容和由此得到的分母, 前向路径, 路由专家计算和梯度归约都一样.

**Masked positions still execute the MoE layer.** Packed, padded, and interleaved fixed-sequence-length datasets are available in the data layer, and the choice among them determines how many real tokens each rank microbatch carries. This matters more under sparse routing than under dense training. Every position present in the microbatch is routed, dispatched to its selected experts, computed, and combined, whether or not its label contributes to the loss. Padding and masked prompt positions consume dispatch bandwidth, expert GEMM rows, and activation memory even when they have no direct loss term. Under EP, masked rows still cross the interconnect during dispatch and combine. Sequence packing reduces this overhead by reducing padding. The useful-token accounting used throughout Section 14 should be recomputed against supervised token counts rather than raw positions before any post-training throughput number is compared with a pretraining one.

**被 mask 的位置照样执行 MoE 层.** 数据层提供 packed, padded 和 interleaved 三种定长序列数据集, 选哪一种决定了每个 rank 的 microbatch 里有多少真实 token. 这一点在稀疏路由下比在稠密训练下更要紧. microbatch 里的每个位置, 不论它的 label 是否计入 loss, 都要经过路由, dispatch 到被选专家, 计算, 再 combine. padding 位置和被 mask 的 prompt 位置即使没有直接的 loss 项, 也照样占用 dispatch 带宽, 专家 GEMM 的行和激活显存. 在 EP 下, 被 mask 的行在 dispatch 和 combine 时同样要走互连. sequence packing 通过减少 padding 降低这部分开销. 把后训练吞吐与预训练吞吐相比之前, 第 14 节一直使用的有效 token 统计应改用监督 token 数重算, 而不是用原始位置数.

**Instance-level filtering keeps removed tokens in the denominator.** The separate instance-mask path removes whole sequences from the objective but adds their token counts back into the loss denominator. Those tokens therefore contribute zero loss over a nonzero count, lowering the reported loss relative to an exact denominator over the retained instances. This accounting avoids the distributed cost of computing that denominator exactly; the bias depends on how many instances the filter removes. Comparisons of supervised loss curves across stages must account for that difference in the denominator.

**实例级过滤把被移除的 token 留在分母里.** 另一条 instance-mask 路径把整条序列从目标中去掉, 却把它们的 token 数加回 loss 分母. 这些 token 于是以零 loss 占着非零的计数, 报告出的 loss 会比只在保留实例上精确求分母时低. 这种计法省去了在分布式下精确计算分母的开销; 偏差大小取决于过滤掉了多少实例. 跨阶段比较监督 loss 曲线时, 必须考虑分母上的这个差别.

> 答: `ddp_train_module.py` 里是 `batch_num_tokens_for_loss += (~instance_mask).sum() * (labels.shape[1] - 1)`, 即每条被删序列按「序列长 - 1」个 token 计 (shift 后最后一个位置无 label), 不看这条序列里实际有多少非忽略 label. 代码注释也写明这会让 loss「artificially low」, 理由是分布式下精确统计又难又慢, 且要让每个 rank 公平参与. 若设保留实例的有效 label 数为 $n$, 被删 $m$ 条, 长度 $L$, 报告值是真值乘 $n/(n+m(L-1))$. 训练时会记录 `train/masked instances (%)`, 有这个比例和 label 统计就能事后近似还原; 但它同时缩放了梯度, 所以过滤比例随步变化时, 等于每步的有效学习率在随之波动, 这一点报告没提.

## 22.2 Preference Training Scores Two Sequences Against a Reference · 偏好训练要对照 reference 给两条序列打分

**DPO scores paired sequences under a policy and a reference model.** DPO computes its loss from a chosen and a rejected continuation of the same prompt, scored under both the trained policy and a frozen reference policy (Rafailov et al., 2023). One logical example becomes two sequences. Their combined lengths determine the routed token count, so the effective rank microbatch must be re-derived; the memory headroom measured for pretraining does not transfer unchanged. The paired sequences also share a prompt prefix

<!-- page 126 of 168 -->

| Component | Com SFT | ponent DPO | in wor GRPO | kload PPO | Transfer | What transfers |
| --- | --- | --- | --- | --- | --- | --- |
| Policy learner: the | ✓ | ✓ | ✓ | ✓ | Learner | The mechanisms in Parts II and III apply to the |
| trained MoE |  |  |  |  | mechanisms | learner: distributed data parallel (DDP) synchronization and the sharded optimizer (Section 4), expert parallel (EP) placement and sync-free rowwise movement (Section 5), pipeline parallel (PP) layer placement (Section 6), grouped GEMM, MXFP8 (Section 11), recompute, and topology-agnostic checkpoints (Section 12). Response-only SFT changes the learner's label tensor and loss denominator while retaining these mechanisms. |
| Reference policy: | - | ✓ | ✓ | ✓ | Forward path | The forward path only: sync-free dispatch, grouped |
| frozen, forward only |  |  |  |  | only | GEMM, and the MXFP8 forward caches. DPO can cache reference log-probabilities before updates, as open-instruct does, avoiding a separate resident reference model. A resident reference adds parameter storage and forward activations, but no gradient buffers or optimizer states. |
| Critic: trained value | - | - | - | ✓ | Second | A trained value model. If it uses the same MoE |
| model |  |  |  |  | learner | backbone as the policy, the learner mechanisms apply to both; its actual architecture determines the added memory. GRPO removes this model by using group-relative advantages. |
| Reward: verifier or | - | - | ◦ | ◦ | None needed, | A CPU-based checker needs no learner GPU, but |
| reward model |  |  |  |  | or forward path only | verification cost depends on the task and execution environment. A learned reward model adds a separate forward-only workload. |
| Rollout | - | - | ◦ | ◦ | Insight only, | An inference system outside this report's |
| generation: |  |  |  |  | not code | measurements. At small decode batches, rows per |
| inference engine |  |  |  |  |  | expert can fall below the grouped-GEMM crossover (Section 9); batching and routing determine that count. Host-visible route metadata (Section 8), load imbalance (Section 10), and operand-dependent GEMM time (Section 19) are relevant costs, but the training measurements do not quantify them in a serving engine. |
| Weight transfer: | - | - | ◦ | ◦ | Substrate | The topology-agnostic checkpoint tensors of |
| learner to inference |  |  |  |  | only | Section 12 are the substrate, since they already separate stored tensors from the EP and PP layout that produced them; their latency inside a rollout loop is not measured here. |

**Table 38 Components of post-training workloads and their mapping to the sparse learner.** Transfer categories describe reuse of learner mechanisms, not demonstrated end-to-end integration with these trainers. A check mark (✓) marks a component that the workload contains and that this report’s mechanisms serve; an open circle (◦) marks a component the workload contains outside the learner, which this report does not measure; a dash marks a component the workload does not have. The reference row assumes reference-regularized GRPO and PPO. SFT, cached-reference DPO, and GRPO orchestration follow open-instruct (Ai2, 2026); the PPO configuration follows the Tülu 3 RLVR recipe (Lambert et al., 2024). Both RL examples use vLLM rollout engines (Kwon et al., 2023) and verifiable rewards. Reinforcement learning from a learned reward model adds that model to the reward row.

whose routed computation is performed twice unless the implementation deliberately shares it. Reference log-probabilities require either a second resident model, which uses memory alongside the learner, or a precomputation pass whose outputs are cached and read back. Precomputation removes the resident model’s memory cost but fixes the reference policy for the run.

**DPO 在 policy 和 reference 模型下给成对序列打分.** DPO 的 loss 来自同一 prompt 的一条 chosen 续写和一条 rejected 续写, 两条都要在被训练的 policy 和冻结的 reference policy 下打分 (Rafailov et al., 2023). 一个逻辑样本变成两条序列. 两条的总长度决定路由 token 数, 所以有效的 rank microbatch 要重新推导; 预训练时测出的显存余量不能原样照搬. 成对序列还共享一段 prompt 前缀, 除非实现上有意共享, 这段前缀的路由计算会做两遍. reference 的 log 概率有两种来源: 常驻第二个模型, 和 learner 一起占显存; 或者先跑一遍预计算, 把结果缓存起来训练时读回. 预计算省掉了常驻模型的显存, 但整个运行期间 reference policy 就固定了.

The cached-reference DPO implementation in open-instruct scores the dataset with the initial policy before updating it, then reads those scores during training (Ai2, 2026; Lambert et al., 2024). This avoids allocating a second resident reference copy. Its existing trainer uses Accelerate; a sparse DPO adaptation could instead

<!-- page 127 of 168 -->

supply the objective to the learner described here. The paired-sequence and reference accounting would still apply, but this report makes no throughput or quality claim for that adaptation.

open-instruct 的缓存 reference 版 DPO 在更新之前先用初始 policy 给整个数据集打分, 训练时再读这些分数 (Ai2, 2026; Lambert et al., 2024). 这样就不用再分配一份常驻的 reference 副本. 它现有的 trainer 基于 Accelerate; 稀疏版 DPO 可以改为把这个目标交给本文描述的 learner. 成对序列和 reference 的那些开销统计依然适用, 但本报告对这种改造不做任何吞吐或质量上的断言.

## 22.3 RLVR Adds Systems Outside the Learner · RLVR 在 learner 之外加了一整套系统

**RLVR surrounds the learner with a rollout and verification system.** Reinforcement Learning with Verifiable Rewards (RLVR) (Lambert et al., 2024) generates rollouts from the current policy, verifies them against a programmatic checker, and updates the policy from the resulting rewards. GRPO and the actorcritic PPO configuration considered here differ inside the learner: PPO trains a value model alongside the policy, whereas GRPO estimates advantages from a group of rollouts (Schulman et al., 2017; Shao et al., 2024). A sparse GRPO policy therefore needs one learner; PPO adds value-model training, with a cost set by the chosen critic architecture. DeepSeek-R1 is a public example applied to an MoE policy (Guo et al., 2025), and HybridFlow makes the boundary between the rollout system and the learner explicit (Sheng et al., 2025). The learner described in this report is one component of that arrangement. The additional components—rollout generation at inference precision and batch shape, reward verification, actor orchestration, and repeated transfer of updated weights from the learner to the inference engine—are a separate systems problem whose costs are not addressed by any measurement in this report.

**RLVR 在 learner 外面套了一层 rollout 和校验系统.** Reinforcement Learning with Verifiable Rewards (RLVR) (Lambert et al., 2024) 用当前 policy 生成 rollout, 交给程序化的检查器校验, 再根据得到的奖励更新 policy. GRPO 和这里考虑的 actor-critic PPO 配置的区别在 learner 内部: PPO 在 policy 之外还要训练一个 value 模型, GRPO 则用一组 rollout 估计优势 (Schulman et al., 2017; Shao et al., 2024). 所以稀疏 GRPO policy 只要一个 learner; PPO 再加一个 value 模型的训练, 代价由所选的 critic 架构决定. DeepSeek-R1 是用在 MoE policy 上的公开例子 (Guo et al., 2025), HybridFlow 则把 rollout 系统与 learner 之间的边界明确划了出来 (Sheng et al., 2025). 本报告描述的 learner 只是这套安排里的一个组件. 其余组件, 即按推理精度和推理批形状生成 rollout, 奖励校验, actor 编排, 以及把更新后的权重反复从 learner 传到推理引擎, 是另一个系统问题, 本报告的测量都没有涉及它们的开销.

**Online weight transfer requires a separate latency budget.** Olmo-core can already export a trained MoE checkpoint into a Hugging Face model definition, and it contains a generation module and sampling path. Those provide an offline route from a training checkpoint to an inference engine for evaluation. Online reinforcement learning requires repeated, low-latency propagation of updated expert weights from the training topology into a serving topology whose expert placement is chosen for inference rather than for training. The topology-agnostic checkpoint representation of Section 12 is the natural substrate for that transfer, since it already decouples stored tensors from the EP and PP layout that produced them. Whether it is fast enough to sit inside a rollout loop is untested here.

**在线权重传输需要单独的延迟预算.** Olmo-core 已经能把训好的 MoE checkpoint 导出成 Hugging Face 模型定义, 自身也带生成模块和采样路径. 这些提供了一条离线路线, 把训练 checkpoint 送进推理引擎做评测. 在线强化学习则要把更新后的专家权重反复, 低延迟地从训练拓扑传到推理拓扑, 而推理拓扑的专家放置是按推理需要选的, 不是按训练. 第 12 节与拓扑无关的 checkpoint 表示是做这种传输的现成基础, 因为它已经把存储的张量与产生它们的 EP, PP 排布解耦. 它够不够快, 能不能放进 rollout 循环, 这里没有测试.

## 22.4 Supervised and Routed Token Rates Measure Different Work · 监督 token 速率与路由 token 速率衡量的是不同的工作量

Comparisons across stages should state the base checkpoint, learner configuration, batch construction, and token accounting. The same number of supervised tokens can require different numbers of routed tokens because prompts, padding, and preference pairs still execute the model. Reporting supervised tokens per second alongside routed tokens per second makes that difference visible.

跨阶段比较时, 应写明基础 checkpoint, learner 配置, 批次构造方式和 token 计数口径. 同样多的监督 token 可能对应不同数量的路由 token, 因为 prompt, padding 和偏好对都照样要跑模型. 把每秒监督 token 数和每秒路由 token 数并列报告, 这个差别就看得出来.

## 23 Related MoE Systems Make Different Trade-Offs · 相关 MoE 系统各有取舍

MoE systems differ in which tensors they move, which weights remain in memory between uses, how long buffers remain valid, and which numerical representations determine the optimizer update. We compare those choices here, including systems that use the same terms—expert parallelism, distributed optimization, FP8, or overlap—for different implementations. Table 39 summarizes four design axes. The comparison covers the mechanism families used in this report rather than an exhaustive survey of MoE implementations. Relative performance requires matched experiments; another system’s reported results are not performance measurements for Olmo-core. The quantitative results discussed here apply to their stated models, software, and hardware; they do not establish portability or scaling beyond those settings.

各个 MoE 系统的差别在于: 搬哪些张量, 哪些权重在两次使用之间常驻显存, buffer 有效多久, 以及优化器更新由哪种数值表示决定. 这里比较这些选择, 也包括那些用同一组术语 (专家并行, 分布式优化, FP8, overlap) 指代不同实现的系统. Table 39 汇总了四条设计轴. 比较范围是本报告用到的几类机制, 不是对 MoE 实现的全面综述. 相对性能需要对齐条件的实验才能下结论; 别的系统报告的结果不是 Olmo-core 的性能测量. 这里讨论的定量结果只适用于它们各自注明的模型, 软件和硬件, 不能据此推出可移植性, 也不能推出在这些条件之外的扩展性.

## 23.1 Conditional Compute Shifts Work to Systems · 条件计算把工作转给了系统

Sparse activation separates stored expert capacity from per-token computation. Sparsely gated MoE layers established this construction (Shazeer et al., 2017); Switch Transformers simplified routing to top-1 (Fedus et al., 2022); GShard demonstrated automatic sharding of conditional computation (Lepikhin et al., 2021); and GLaM applied sparse activation to large-scale language models (Du et al., 2022).

稀疏激活把存储的专家容量与每个 token 的计算量分开. Sparsely gated MoE 层确立了这种构造 (Shazeer et al., 2017); Switch Transformers 把路由简化为 top-1 (Fedus et al., 2022); GShard 演示了条件计算的自动分片 (Lepikhin et al., 2021); GLaM 把稀疏激活用到大规模语言模型上 (Du et al., 2022).

Inactive experts still contribute parameter, optimizer, and checkpoint storage, and selected tokens must reach the ranks holding their experts. Conditional computation reduces active arithmetic while adding expert placement, token movement, and distinct gradient-reduction and optimizer requirements.

没被激活的专家照样占用参数, 优化器状态和 checkpoint 的存储, 被选中的 token 也必须送到持有对应专家的 rank. 条件计算减少了实际执行的算术, 同时带来了专家放置, token 搬运, 以及各不相同的梯度归约和优化器需求.

<!-- page 128 of 168 -->

<table><tbody><tr><td>System</td><td>Weight materialization</td><td>Route representation</td><td>Update tensor precision</td><td>Overlap resource control</td></tr><tr><td>Olmo-core DDP</td><td>Rank-local compute</td><td>Fixed-capacity,</td><td>FP32 main weights,</td><td>Phase-sequential by</td></tr><tr><td rowspan="4">(this report)</td><td>weights stay resident</td><td>route-indexed rowwise</td><td>optimizer states, and</td><td>default; wave and</td></tr><tr><td>across microbatches;</td><td>movement with</td><td>gradients are</td><td>two-batch overlap</td></tr><tr><td>experts partitioned by</td><td>device-side agreement;</td><td>authoritative; BF16 and</td><td>measured and not</td></tr><tr><td>EP</td><td>no host split lists</td><td>MXFP8 are derived caches and payloads</td><td>adopted</td></tr><tr><td>Megatron-Core</td><td>Distributed optimizer:</td><td>Dispatch as a backend</td><td>Configurable; example:</td><td>Hiding conditioned on</td></tr><tr><td rowspan="4">MoE</td><td>resident local compute</td><td>choice, collective and</td><td>FP32 main weights and</td><td>sufficient independent</td></tr><tr><td>weights; FSDP is a</td><td>optimized,</td><td>gradients, BF16</td><td>work; SM carve-out</td></tr><tr><td>separate sharded-weight</td><td>drop-and-pad or</td><td>moments; FP32 update</td><td>with a reported GEMM</td></tr><tr><td>option</td><td>dropless</td><td>arithmetic</td><td>cost</td></tr><tr><td rowspan="5">PyTorch FSDP</td><td>Full-reshard policy:</td><td>Not MoE-specific</td><td>FSDP2: original-dtype</td><td>Parameter prefetch; not</td></tr><tr><td>gather weights before</td><td></td><td>parameter shards for</td><td>an MoE dispatch</td></tr><tr><td>forward and backward;</td><td></td><td>optimizer; compute and</td><td>concern</td></tr><tr><td>release gathered copies</td><td></td><td>reduction dtypes</td><td></td></tr><tr><td>after each</td><td></td><td>configurable</td><td></td></tr><tr><td rowspan="3">DeepSpeed-MoE</td><td>Gather/retention policy</td><td>MoE-specific collectives</td><td>Main-weight, gradient,</td><td>Not its emphasis</td></tr><tr><td>not specified in cited</td><td>at scale</td><td>and moment dtypes not</td><td></td></tr><tr><td>MoE paper</td><td></td><td>specified in cited MoE paper</td><td></td></tr><tr><td rowspan="3">MegaBlocks</td><td>Gather/retention policy</td><td>Block-sparse expert</td><td>Megatron-LM mixed</td><td>Not its emphasis</td></tr><tr><td>not specified in cited</td><td>kernels keep every</td><td>precision; update-tensor</td><td></td></tr><tr><td>paper</td><td>assignment without capacity padding</td><td>dtypes not specified in cited paper</td><td></td></tr><tr><td>DeepSeek-V3 and</td><td>V3 training: ZeRO-1</td><td>Optimized dispatch and</td><td>V3 training: FP32</td><td>Communication SMs</td></tr><tr><td rowspan="4">DeepEP</td><td>retains full local</td><td>combine kernels;</td><td>master weights and</td><td>assigned explicitly;</td></tr><tr><td>compute weights;</td><td>DeepEP v2 lowers</td><td>accumulation gradients;</td><td>cache and compute</td></tr><tr><td>experts partitioned by</td><td>communication's SM</td><td>BF16 AdamW moments</td><td>interference</td></tr><tr><td>EP</td><td>footprint</td><td></td><td>acknowledged</td></tr></tbody></table>

## 23.2 Token and Weight Movement Costs Differ · 搬 token 与搬权重的代价不同

PyTorch FSDP is a general answer to model-memory pressure. It shards parameters, gradients, and optimizer state and materializes parameters for computation (Zhao et al., 2023; PyTorch Contributors, 2026d). Large dense matrix multiplications can amortize those gather and reshard operations. For routed experts, however, the stored pool may be much larger than the weights used by any token. Olmo-core’s DDP path keeps assigned weights in device memory across microbatches to avoid repeatedly materializing that expert capacity.

PyTorch FSDP 是应对模型显存压力的通用方案. 它把参数, 梯度和优化器状态分片, 计算时再把参数物化出来 (Zhao et al., 2023; PyTorch Contributors, 2026d). 大的稠密矩阵乘法能摊薄这些 gather 和 reshard 操作. 但对路由专家来说, 存储的专家池可能比任何一个 token 用到的权重大得多. Olmo-core 的 DDP 路径让分到本 rank 的权重跨 microbatch 常驻显存, 避免反复物化这部分专家容量.

ZeRO established the broader optimizer-state and gradient-partitioning design space (Rajbhandari et al., 2020). DeepSpeed-MoE then combined these ideas with expert parallelism and MoE-specific communication at scale (Rajbhandari et al., 2022). Olmo’s distributed optimizer belongs to this family, while its step ordering and multi-group reducer are specific to the implementation described here.

ZeRO 奠定了优化器状态与梯度分区这一更大的设计空间 (Rajbhandari et al., 2020). DeepSpeed-MoE 随后把这些思路与专家并行, MoE 专用通信结合起来, 用在大规模上 (Rajbhandari et al., 2022). Olmo 的分布式优化器属于这一族, 它的 step 顺序和多组 reducer 则是本文实现特有的.

Keeping local compute weights materialized increases the persistent training-state footprint, so FSDP can remain useful for memory-constrained MoEs. EP can reduce that footprint by partitioning experts, but then selected token rows must travel to the ranks that hold them. How long full weights remain materialized and where experts are placed are separate decisions, which can in principle be composed in several ways. The current measurements do not fully isolate the cost of keeping assigned weights materialized from expert placement, so they establish neither a universal wall-time advantage nor a universal memory advantage over full-reshard FSDP.

让本地计算权重一直保持物化, 会增大常驻的训练状态占用, 所以对显存吃紧的 MoE, FSDP 仍然有用. EP 可以通过切分专家来减小这部分占用, 但被选中的 token 行就得送到持有专家的 rank 上. 完整权重保持物化多久, 专家放在哪里, 是两个独立的决定, 原则上可以有多种组合. 目前的测量没有把「保持分配权重物化」的代价与专家放置完全分离, 所以既不能证明它相对 full-reshard FSDP 在墙钟时间上普遍占优, 也不能证明它在显存上普遍占优.

Megatron-Core’s parallel folding allows dense and sparse portions of a layer to use different parallel map pings. Its MoE technical report (Yan et al., 2026) describes this design in Megatron-LM (NVIDIA, 2026d),

<!-- page 129 of 168 -->

together with its interactions with dispatch, expert compute, load balance, memory, distributed optimization, checkpointing, reduced precision, and overlap.

Megatron-Core 的 parallel folding 允许一层里稠密部分和稀疏部分用不同的并行映射. 它的 MoE 技术报告 (Yan et al., 2026) 描述了 Megatron-LM 中的这一设计 (NVIDIA, 2026d), 以及它与 dispatch, 专家计算, 负载均衡, 显存, 分布式优化, checkpoint, 低精度和 overlap 之间的相互作用.

Olmo-core represents the same dense–sparse distinction with a dense mesh and an MoE mesh with EP-DP and EP-MP axes. Comparing these mappings requires following their effects on gradient reduction, optimizer state, runtime caches, and checkpoint views.

Olmo-core 用一个稠密 mesh 和一个带 EP-DP, EP-MP 两条轴的 MoE mesh 来表示同样的稠密/稀疏区分. 要比较这两种映射, 得追踪它们对梯度归约, 优化器状态, 运行时缓存和 checkpoint 视图分别有什么影响.

## 23.3 Route Representations Trade Compactness for Regularity · 路由表示在紧凑与规整之间取舍

A routed layer must represent a data-dependent number of token assignments. One design family packs tokens and launches variable-size collectives described by per-rank counts. This represents the accepted payload compactly, but a host-facing collective or grouped-GEMM interface can make GPU route counts part of the CPU launch dependency. Another family reserves bounded capacity and keeps a GPU-side map from each accepted route to its destination. That removes the split-list dependency, but requires capacity, route metadata, agreement, and a precisely defined overflow policy.

路由层要表示数量随数据而变的 token 分配. 一类设计把 token 打包, 再按每个 rank 的计数发起变长 collective. 这样能紧凑地表示被接收的载荷, 但面向 host 的 collective 或 grouped GEMM 接口, 可能让 GPU 上的路由计数变成 CPU 发射的依赖. 另一类设计预留有上界的容量, 在 GPU 上维护从每条被接收路由到目的地的映射. 这去掉了对 split 列表的依赖, 但需要容量, 路由元数据, 各 rank 间的一致性约定, 以及定义精确的溢出策略.

Tutel studies adaptive MoE dispatch and parallel placement across different cluster and model configurations (Hwang et al., 2023). MegaBlocks instead uses block-sparse kernels to preserve token assignments without padding every expert to the same capacity (Gale et al., 2023). These systems illustrate that token layout, communication, and expert-kernel shape must be considered together; the collective’s name alone determines none of their costs.

Tutel 研究在不同集群和模型配置下自适应的 MoE dispatch 与并行放置 (Hwang et al., 2023). MegaBlocks 则用块稀疏 kernel 保留全部 token 分配, 不必把每个专家都 pad 到同样的容量 (Gale et al., 2023). 这些系统说明 token 排布, 通信和专家 kernel 形状必须放在一起考虑; 单看 collective 叫什么名字, 一项代价也定不下来.

Megatron-Core presents token dispatch as a first-class backend choice, including collective and optimized alternatives (Yan et al., 2026; NVIDIA, 2026d). Olmo-core’s rowwise backend uses fixed-capacity routeindexed movement and GPU-side agreement, with communication payloads in preallocated symmetric buffers managed by the rowwise runtime. DeepEP supplies another optimized dispatch design and, in its v2 path, explicitly reduces the SM footprint devoted to communication (Zhao et al., 2025b).

Megatron-Core 把 token dispatch 作为一等的后端选项, 既有 collective 实现, 也有优化过的替代实现 (Yan et al., 2026; NVIDIA, 2026d). Olmo-core 的 rowwise 后端用固定容量, 按路由索引的搬运和 GPU 侧的一致性约定, 通信载荷放在 rowwise 运行时管理的预分配 symmetric buffer 里. DeepEP 提供了另一种优化过的 dispatch 设计, 它的 v2 路径明确减少了通信占用的 SM (Zhao et al., 2025b).

A compact variable payload may expose a host dependency, while a bounded payload may reserve unused rows or drop overflow; an optimized GPU transport can also compete with expert compute for device resources. Comparing these representations requires holding accepted work and expert shape fixed, then accounting for host gaps, bytes, drops, capacity, and maximum-rank time.

紧凑的变长载荷可能暴露出对 host 的依赖, 有上界的载荷则可能预留用不上的行, 或者丢掉溢出部分; 优化过的 GPU 传输还可能和专家计算争设备资源. 比较这几种表示, 要先固定被接收的工作量和专家形状, 再统计 host 空隙, 字节数, 丢弃量, 容量和最慢 rank 的时间.

Dynamic shape also raises a buffer-reuse question that transport APIs alone do not answer. A dispatched activation saved for Wgrad may outlive the call that moved it, especially under recomputation or a pipeline schedule. Olmo makes that dependency explicit with autograd-visible leases on symmetric payloads (Section 5.7). Keeping more dispatched activations for backward requires more simultaneous symm buffers. Reusing a buffer sooner saves memory, but is safe only after every consumer operator of its previous contents has finished.

动态形状还带来一个 buffer 复用问题, 光看传输 API 回答不了. 为 Wgrad 保存的 dispatch 后激活, 寿命可能比搬运它的那次调用更长, 在重算或流水线调度下尤其如此. Olmo 在 symmetric 载荷上加了 autograd 可见的 lease, 把这种依赖显式化 (Section 5.7). 为反向保留的 dispatch 激活越多, 同时存在的 symm buffer 就要越多. 更早复用 buffer 能省显存, 但只有在它旧内容的所有消费算子都结束之后才安全.

## 23.4 Placement Determines Replica Groups · 放置决定副本组

Once experts are partitioned, a local model part contains different kinds of replication. Dense parameters may agree over the folded dense group, while a local expert shard agrees only with copies of that shard. A system can encode that distinction in module decomposition, parallel mappings, reducer metadata, optimizer state, or some combination. The choice changes both the stored tensors and the gradient traffic for each rank.

专家一旦切分, 本地的模型部分就包含了不同种类的副本关系. 稠密参数在折叠后的稠密组内保持一致, 本地专家分片只与同一分片的其他副本保持一致. 系统可以把这种区别编码进模块拆分, 并行映射, reducer 元数据, 优化器状态, 或者其中几项的组合. 选哪种方式, 既改变每个 rank 存的张量, 也改变它的梯度流量.

Megatron-Core includes distributed optimization and checkpointing inside its MoE system boundary (Yan et al., 2026). Olmo-core uses a per-parameter process-group selector in its DDP reducer, carries the same parameter families into high-precision optimizer state, and exposes topology-independent checkpoint views. In the save-side measurement of Section 12, this path leaves peak memory at its pre-save values without assembling any full expert tensor on one GPU.

Megatron-Core 把分布式优化和 checkpoint 都划在它的 MoE 系统边界之内 (Yan et al., 2026). Olmo-core 在 DDP reducer 里按参数选择 process group, 把同样的参数族划分带进高精度优化器状态, 并提供与拓扑无关的 checkpoint 视图. 在第 12 节保存侧的测量中, 这条路径让显存峰值保持在保存前的水平, 也不在任何一张 GPU 上拼出完整的专家张量.

GShard and DeepSpeed-MoE likewise couple expert placement to the process groups that synchronize or shard model state (Lepikhin et al., 2021; Rajbhandari et al., 2022). Like Olmo-core, these systems derive their synchronization and sharding groups from the chosen parallel placement; Olmo-core differs in the particular reducer, optimizer-state, and checkpoint interfaces described here.

GShard 和 DeepSpeed-MoE 同样把专家放置与负责同步或分片模型状态的 process group 绑在一起 (Lepikhin et al., 2021; Rajbhandari et al., 2022). 和 Olmo-core 一样, 这些系统的同步组与分片组都由所选的并行放置推出; Olmo-core 的不同之处在于这里描述的具体 reducer, 优化器状态和 checkpoint 接口.

<!-- page 130 of 168 -->

## 23.5 Conversion Costs and Communication–Compute Interference · 转换开销与通信-计算干扰

Reduced precision lowers arithmetic, communication, or storage cost only by introducing another encoding of each model value. Megatron-Core treats reduced precision and recomputation as parts of its integrated MoE performance problem (Yan et al., 2026). In Olmo-core, FP32 main weights, optimizer states, and accumulated gradients determine the training update. BF16 compute weights and oriented MXFP8 weight caches are derived from those main weights; MXFP8 activation payloads are derived runtime representations. Conversion, cache refresh, transport, memory, and loss behavior are therefore all part of the BF16-versus-MXFP8 comparison; raw GEMM time alone does not characterize the training trade-off.

低精度要降低算术, 通信或存储开销, 前提是给每个模型数值再引入一种编码. Megatron-Core 把低精度和重算都当作它整体 MoE 性能问题的一部分 (Yan et al., 2026). 在 Olmo-core 里, 训练更新由 FP32 主权重, 优化器状态和累积梯度决定. BF16 计算权重和带方向的 MXFP8 权重缓存都由主权重派生; MXFP8 激活载荷是运行时派生的表示. 所以转换, 缓存刷新, 传输, 显存和 loss 表现都属于 BF16 与 MXFP8 的比较范围; 只看 GEMM 本身的时间, 刻画不了训练上的取舍.

FP8 training and the later OCP microscaling formats provide the numerical and hardware context for this design (Micikevicius et al., 2022; Rouhani et al., 2023; Open Compute Project, 2023), and DeepSeek-V3 is the prominent production example of FP8 training with fine-grained block scaling (DeepSeek-AI et al., 2024). The Olmo-core-specific questions are where quantization occurs, which representations cross operator or communication boundaries, and whether the subsequent GEMM or transfer saves more time than the conversion takes.

FP8 训练和后来的 OCP microscaling 格式是这一设计的数值与硬件背景 (Micikevicius et al., 2022; Rouhani et al., 2023; Open Compute Project, 2023), DeepSeek-V3 是用细粒度块缩放做 FP8 训练的代表性生产例子 (DeepSeek-AI et al., 2024). Olmo-core 要回答的问题是: 量化发生在哪里, 哪些表示会跨过算子或通信边界, 后续 GEMM 或传输省下的时间是否多于转换花掉的时间.

DeepSeek-V3 and Megatron-Core issue token movement beside independent expert computation, but both expose the resource budget behind the overlap: DeepSeek-V3 assigns communication SMs and discusses cache/compute interference, while Megatron-Core conditions hiding on sufficient independent work and reports a GEMM cost from its SM carve-out (DeepSeek-AI et al., 2024; Yan et al., 2026). DeepEP v2 lowers communication’s SM footprint (Zhao et al., 2025b); fewer communication SMs do not guarantee that concurrent kernels retain standalone speed.

DeepSeek-V3 和 Megatron-Core 都让 token 搬运与独立的专家计算并行发出, 但两者都公开了 overlap 背后的资源预算: DeepSeek-V3 专门分配通信用的 SM, 并讨论了缓存与计算之间的干扰; Megatron-Core 把能否隐藏通信的前提设为有足够的独立工作, 并报告了划出 SM 给通信后 GEMM 付出的代价 (DeepSeek-AI et al., 2024; Yan et al., 2026). DeepEP v2 降低了通信占用的 SM (Zhao et al., 2025b); 但通信用的 SM 少了, 并不保证并发 kernel 还能保持单独运行时的速度.

COMET makes the same concern explicit: coarse waves and separate-stream scheduling can reduce expertcompute efficiency, motivating finer-grained fused resource control (Zhang et al., 2025). A broader distributedtraining study observes compute stretch under communication while still finding overlap beneficial on average in its own suite (Lee et al., 2025). These results depend on how resources are allocated for the measured shape, transport, and platform.

COMET 明确提出了同样的担忧: 粗粒度的 wave 和分流调度会降低专家计算效率, 因此需要更细粒度的融合式资源控制 (Zhang et al., 2025). 一项覆盖面更广的分布式训练研究观察到计算在通信并发时被拉长, 但在它自己的测试集上 overlap 平均仍有收益 (Lee et al., 2025). 这些结果取决于针对所测形状, 传输方式和平台的资源分配.

Lancet schedules MoE communication and computation jointly, while MegaScale-MoE combines several parallel and communication optimizations for large training runs (Jiang et al., 2024b; Jin et al., 2025). Both treat overlap as a scheduling and resource-allocation problem, with explicit coordination between communication and compute.

Lancet 联合调度 MoE 的通信与计算, MegaScale-MoE 则为大规模训练组合了多种并行与通信优化 (Jiang et al., 2024b; Jin et al., 2025). 两者都把 overlap 当作调度与资源分配问题, 在通信和计算之间做显式协调.

Olmo evaluates overlap in two separate studies. A model-level two-batch overlap (TBO) study evaluates two lanes in flight. A separate same-batch EP-wave study compares overlap with both a wave-sequential control and an unsplit no-wave baseline. The unsplit baseline is needed because an overlapped timeline can still lose to a larger, more efficient unsplit GEMM.

Olmo 在两项独立研究中评估 overlap. 模型级的 two-batch overlap (TBO) 研究评估两条 lane 同时在跑的情况. 另一项同批次 EP-wave 研究, 把 overlap 同时与按 wave 顺序执行的对照和不切分, 无 wave 的基线比较. 之所以需要不切分的基线, 是因为 overlap 后的时间线仍可能输给一个更大, 更高效的不切分 GEMM.

## 23.6 Expert Placement Connects Token Movement and Updates · 专家放置把 token 搬运和参数更新连在一起

Olmo-core combines resident rank-local compute weights with route-indexed token movement and replicaspecific updates. EP determines which experts a rank stores and which token rows it receives; the reducer synchronizes each expert’s gradients only with replicas of that expert. Keeping those choices consistent is what lets the resident-weight design extend from forward execution to optimizer updates and checkpoint export.

Olmo-core 把常驻的 rank 本地计算权重, 按路由索引的 token 搬运和按副本区分的更新组合在一起. EP 决定一个 rank 存哪些专家, 接收哪些 token 行; reducer 只在同一专家的副本之间同步该专家的梯度. 这几个选择保持一致, 常驻权重的设计才能从前向执行延伸到优化器更新和 checkpoint 导出.

## 24 Conclusion

Olmo-core’s DDP stack reduces the parameter movement and host synchronization that made our early MoE baselines slow. In the capacity sweep, the composed DDP and EP stack keeps throughput within a modest margin of the dense reference as the expert pool grows. Separate production-scale runs cover a 12.9-billion parameter model on 16 GPUs through a 1.2-trillion-parameter model on 512 GPUs. Those headline rates use random routing and different operating configurations; they demonstrate the stack’s capacity and throughput, not a controlled scaling curve or a time-to-quality result.

Olmo-core 的 DDP 栈减少了参数搬运和 host 同步, 正是这两项使早期的 MoE 基线跑得很慢. 在容量扫描中, 随着专家池变大, DDP 与 EP 组合后的栈把吞吐保持在离稠密参照不远的范围内. 另外几次生产规模的运行, 从 16 张 GPU 上的 129 亿参数模型, 一直覆盖到 512 张 GPU 上的 1.2 万亿参数模型. 这些对外公布的速率用的是随机路由和各不相同的运行配置; 它们展示的是这套栈能承载的规模和吞吐, 不是受控的扩展曲线, 也不是达到某个质量所需的时间.

<!-- page 131 of 168 -->

## 24.1 Reducing Costs That Repeat Across the Step · 削减一步之内反复出现的开销

Sparse routing limits the arithmetic per token, but it does not by itself limit weight movement, gradient traffic, or optimizer memory. Keeping rank-local model partitions resident removes repeated weight materialization; EP reduces the expert parameters held by each rank and routes token rows to them instead. The trillionparameter recipes also need sharded optimizer state, MXFP8 storage, and per-layer recompute to fit in device memory. These changes affect both how fast a configuration runs and whether it fits at all.

稀疏路由限制了每个 token 的算术量, 但它本身并不限制权重搬运, 梯度流量或优化器显存. 让 rank 本地的模型分片常驻, 去掉了反复的权重物化; EP 减少每个 rank 持有的专家参数, 改为把 token 行路由过去. 万亿参数的配方还需要分片的优化器状态, MXFP8 存储和逐层重算, 才能放进显存. 这些改动既影响一个配置跑多快, 也决定它能不能放得下.

An operation’s total cost scales with how often it runs. Routing runs for every token in every MoE layer, buffer allocation and reuse must accommodate each microbatch, and kernel launches repeat on every rank. In the original MoE path, all-to-all split sizes and grouped-GEMM group sizes both required routing counts on the CPU. Copying those counts back to the host repeatedly interrupted submission of GPU work. Device-resident metadata removes these two recurring waits without changing the routing calculation.

一个操作的总开销随它的执行次数成比例增长. 路由在每个 MoE 层对每个 token 都要跑, buffer 的分配和复用要适应每个 microbatch, kernel 启动在每个 rank 上都会重复. 在最初的 MoE 路径里, all-to-all 的 split 大小和 grouped GEMM 的分组大小都要求 CPU 上有路由计数. 把这些计数拷回 host, 一再打断 GPU 工作的提交. 元数据常驻设备后, 这两处反复出现的等待就没有了, 路由的计算本身不变.

A bandwidth budget can also rule out an optimization before implementation. For the routed block analyzed in the offload study, the estimated activation production rate is about six times the theoretical host-link bandwidth. Scheduling can shift when copies occur, but cannot sustain full offload at that production rate. This is a bandwidth budget for the stated workload and link, not a claim that all forms of activation offload are ineffective.

带宽预算还能在动手实现之前就排除某项优化. 对 offload 研究中分析的路由块, 估算的激活产生速率约为 host 链路理论带宽的六倍. 调度可以改变拷贝发生的时机, 但在这个产生速率下撑不住全量 offload. 这是针对所述负载和链路的带宽预算, 不是说所有形式的激活 offload 都无效.

## 24.2 What the Measurements Do and Do Not Establish · 测量能证明什么, 不能证明什么

Several optimizations looked promising in isolation but offered little or no end-to-end benefit. Communication and expert compute can overlap on a timeline while slowing each other through resource contention. Quantizing attention projections made their GEMMs faster, but conversion and layout work consumed much of the benefit in the complete step. In the weight-gradient prototype comparison, global dequantization followed by tuned BF16 grouped GEMM was faster than preserving the natural MXFP8 scale layout, despite adding a conversion kernel. Component timings explain these outcomes; they cannot replace a measurement of the full execution path.

有几项优化单独看很有希望, 端到端却几乎没有收益. 通信和专家计算可以在时间线上重叠, 同时又因争资源而互相拖慢. 量化 attention 投影让这些 GEMM 变快了, 但在完整的一步里, 转换和排布工作吃掉了大部分收益. 在权重梯度原型的对比中, 先全局反量化再跑调优过的 BF16 grouped GEMM, 比保留 MXFP8 的自然 scale 排布更快, 尽管前者多了一个转换 kernel. 分组件的计时能解释这些结果, 但代替不了对完整执行路径的测量.

Even a kernel benchmark needs more than shapes and dtypes to be reproducible. We measured different GEMM times with identical shapes, layouts, and precision when the operand values changed. The effect was measured only at the kernel level, but it changes how we construct and interpret microbenchmarks.

即使是 kernel 基准, 光给形状和 dtype 也不足以复现. 我们测到, 形状, 排布和精度完全相同, 只要操作数的数值变了, GEMM 时间就会不同. 这个效应只在 kernel 层面测过, 但它改变了我们构造和解读 microbenchmark 的方式.

A related measurement problem arises in load balancing. The Switch-style scalar is a cross-term between soft router scores and hard expert counts. It can decrease as soft score mass shifts even when the requested routes remain imbalanced. A lower scalar therefore does not establish better load balance. Requested and kept route counts must be inspected directly; the scalar’s value, its gradient, and the resulting routing behavior are distinct parts of the analysis.

负载均衡上也有一个相关的测量问题. Switch 式的标量是软 router 分数与硬专家计数之间的交叉项. 即使请求的路由仍不均衡, 软分数的质量一挪动, 这个标量就可能下降. 所以标量变小不能证明负载更均衡. 必须直接查看请求的路由数和保留下来的路由数; 标量的值, 它的梯度, 以及由此产生的路由行为, 是分析中各自独立的几部分.

## 24.3 Precision, Memory, and Scheduling Interact · 精度, 显存与调度相互牵连

MXFP8 affects more than GEMM time: it reduces EP payloads and saved activations, and changes the operand layouts required by the GEMMs. Recomputing a routed block repeats dispatch and combine as well as expert arithmetic. Concurrent dispatch and expert kernels share SMs, caches, and memory bandwidth. These interactions explain why the combined recipe must be measured even when each component has already been benchmarked.

MXFP8 影响的不只是 GEMM 时间: 它缩小了 EP 载荷和保存的激活, 也改变了 GEMM 所需的操作数排布. 重算一个路由块时, 除了专家算术, dispatch 和 combine 也要重做. 并发的 dispatch kernel 和专家 kernel 共享 SM, 缓存和显存带宽. 这些相互作用说明了为什么即使每个组件都单独测过, 组合后的配方仍然要测.

Pipeline scheduling adds a correctness constraint. Activations from several microbatches can remain live for backward, along with the communication payloads they reference. Those buffers can be reused only after the last consumer has finished, even if their addresses are fixed for graph replay (Sections 5.7 and 15).

流水线调度还多了一条正确性约束. 多个 microbatch 的激活, 连同它们引用的通信载荷, 可能都要为反向保留着. 这些 buffer 只有在最后一个消费者结束后才能复用, 即使它们的地址为了 graph replay 是固定的 (Sections 5.7 and 15).

These dependencies need to be explicit at component interfaces. A quantizer must produce a layout the transport and GEMM can consume without avoidable conversion. A buffer pool must be sized for the pipeline schedule’s maximum concurrency, not just one forward pass. Device memory, SM capacity, network bandwidth, and host submission time all constrain the same training step. We report unsuccessful optimizations as well as adopted ones because a small timing gain may not justify the additional scheduling or memory complexity.

这些依赖要在组件接口上明确写出来. 量化器产出的排布, 要让传输和 GEMM 不经多余转换就能直接用. buffer 池的大小要按流水线调度的最大并发来定, 不能只按一次前向. 显存, SM 容量, 网络带宽和 host 提交时间, 约束的是同一个训练步. 我们把没成功的优化和采用了的优化一起报告, 因为一点计时上的收益, 未必抵得上它带来的额外调度或显存复杂度.

<!-- page 132 of 168 -->

## 24.4 What Carries Forward · 哪些结论可以带走

The measured crossovers are specific to the hardware and configurations in this report. A different fabric, expert shape, or GEMM implementation can change whether overlap helps. Faster activation production would make full offload harder if host-link bandwidth stayed fixed; a different link or a more selective offload policy changes that calculation. Reusing a result requires checking those conditions, including the frequency of each cost and the maximum number of live microbatches.

测到的各个交叉点只对本报告的硬件和配置成立. 换一种互连, 专家形状或 GEMM 实现, overlap 有没有用就可能改变. 如果 host 链路带宽不变, 激活产生得更快会让全量 offload 更难; 换一种链路或更有选择的 offload 策略, 这笔计算就要重做. 复用某个结论之前, 要先核对这些条件, 包括每项开销出现的频率和同时存活的 microbatch 的最大数量.

The training mechanisms also offer a starting point for the learner in supervised fine-tuning, preference training, and reinforcement learning. Those workloads add different combinations of frozen models, generation, and data movement; the pretraining measurements do not establish their end-to-end performance. Routing, expert shapes, and operand values also matter for the surrounding inference systems; this report makes no claim about inference performance.

这些训练机制也可以作为监督微调, 偏好训练和强化学习中 learner 的起点. 这些负载会加上冻结模型, 生成和数据搬运的不同组合; 预训练的测量不能说明它们的端到端性能. 路由, 专家形状和操作数数值对周边的推理系统同样有影响; 本报告对推理性能不做任何断言.

The result of this work is a training stack with substantially less repeated parameter movement, GPU-resident routing metadata, and memory policies that support trillion-parameter configurations. Its performance depends on how these mechanisms are combined. The configurations, profiles, and negative results in this report document those dependencies so that subsequent changes can be evaluated against the complete training step.

这项工作的成果是一套训练栈: 反复的参数搬运大幅减少, 路由元数据常驻 GPU, 显存策略支持万亿参数配置. 它的性能取决于这些机制怎么组合. 本报告里的配置, profile 和负面结果记录了这些依赖关系, 以后的改动可以放在完整训练步上评估.

## Acknowledgments

This material is based upon work supported by the National Science Foundation under Award No. 2413244.

<!-- page 133 of 168 -->

## Appendices

## A Kernel Interfaces and Profiling Reference · Kernel 接口与 profiling 参考

This appendix documents the interfaces and profiling methods used by the expert-parallel, grouped-GEMM, and MXFP8 implementations (Sections 5, 9, and 11). It records the operation boundaries, payload requirements, and measurements needed to reproduce and maintain these paths.

本附录记录专家并行, grouped GEMM 和 MXFP8 实现所用的接口和 profiling 方法 (Sections 5, 9, and 11), 包括复现和维护这些路径所需的操作边界, 载荷要求和测量项.

## A.1 Rowwise Dispatch and Combine Use PUT/GET · Rowwise 的 dispatch 与 combine 用 PUT/GET 实现

The rowwise operation stack has four conceptual levels: model-level MoE phase, Python autograd function, Python C++/CUDA extension wrapper, and CUDA kernel using NVSHMEM PUT/GET primitives (NVIDIA, 2026t,h).

rowwise 操作栈在概念上分四层: 模型层面的 MoE 阶段, Python autograd 函数, Python 侧的 C++/CUDA 扩展封装, 以及使用 NVSHMEM PUT/GET 原语的 CUDA kernel (NVIDIA, 2026t,h).

The phase name does not determine the transport primitive; dispatch and combine each use PUT in one direction and GET in the other:

阶段名并不决定传输原语; dispatch 和 combine 都是一个方向用 PUT, 另一个方向用 GET:

| MoE phase | Transport | Why |
| --- | --- | --- |
| Dispatch forward | PUT | Source-token rank holds the input row and pushes it to the rank that stores the selected expert. |
| Combine forward | GET | Source-token rank produces the combined output and pulls expert rows back. |
| Combine backward | PUT | Source-token rank pushes weighted output gradients to expert-output gradi-ents. |
| Dispatch backward | GET | Source-token rank pulls route gradients and sums them into token gradients. |

The autograd node names below are private implementation classes and change with the code; the wrapper names are the stable interface. The BF16 separate autograd nodes are:

下面的 autograd 节点名是私有实现类, 会随代码变化; 封装函数名才是稳定接口. BF16 下分开的 autograd 节点如下:

| Autograd node | Forward wrapper | Backward wrapper |
| --- | --- | --- |
| _DispatchRowwiseAutograd | rowwise_dispatch_put | rowwise_combine_get |
| _RowwiseCombineWeightedAutograd | rowwise_combine_get | rowwise_dispatch_put |

| Autograd node | Forward wrapper | Backward wrapper |
| --- | --- | --- |
| _DispatchRowwiseFP8Autograd | rowwise_dispatch_put_scaled | rowwise_combine_get_scaled |
| _RowwiseCombineWeightedFP8Autograd | rowwise_combine_get_scaled | rowwise_dispatch_put_scaled |

The fused FP8 node, \_RowwiseFP8DispatchExpertsCombineAutograd, exposes the whole routed expert region as one autograd node. Its forward half covers scaled rowwise dispatch, up/gate scaled grouped GEMM, SwiGLU, down scaled grouped GEMM, and scaled rowwise combine. Its backward half runs the adjoint sequence: combine backward through scaled dispatch, down dgrad/wgrad, SwiGLU backward, up/gate dgrad/wgrad, and dispatch backward through scaled combine.

融合的 FP8 节点 \_RowwiseFP8DispatchExpertsCombineAutograd 把整个路由专家区域作为一个 autograd 节点暴露出来. 前向半段依次是带 scale 的 rowwise dispatch, up/gate 的带 scale grouped GEMM, SwiGLU, down 的带 scale grouped GEMM, 以及带 scale 的 rowwise combine. 反向半段按伴随顺序执行: 经带 scale 的 dispatch 做 combine 的反向, down 的 dgrad/wgrad, SwiGLU 反向, up/gate 的 dgrad/wgrad, 最后经带 scale 的 combine 做 dispatch 的反向.

<!-- page 134 of 168 -->

## A.2 Rowwise Wrappers Enforce Runtime Requirements · Rowwise 封装函数负责运行时约束

| Wrapper | Requirement |
| --- | --- |
| rowwise_dispatch_put | Push rows from local input to peer out according to dst_ranks and dst_rows; optional probs applies route weighting. |
| rowwise_dispatch_put_scaled | Quantize high-precision rows to MXFP8 qdata/scales, then PUT qdata and scales into separate peer buffers. |
| rowwise_combine_get | GET remote expert rows into local route scratch and reduce [N, K, D] into [N, D], optionally weighted by route probabilities. |
| rowwise_combine_get_scaled | GET qdata and scales, dequantize/reduce locally, and optionally save gathered routes for router-probability gradients. |
| rowwise_gather_get | One-to-one GET helper used by scaled combine and other route-gather cases. |
| rowwise_combine_get_fused | BF16/half extension path that combines GET and reduction in one CUDA ker-nel. |

The regular path materializes two physical route tensors, dst\_ranks[N, K] and dst\_rows[N, K], where N is the number of local token rows (the T of Section 5.4) and K is top-K. Combine wrappers may pass those same tensors under source-oriented argument names; there are not four independent route maps.

常规路径物化两个物理路由张量 dst\_ranks[N, K] 和 dst\_rows[N, K], 其中 N 是本地 token 行数 (即 Section 5.4 中的 T), K 是 top-K. combine 的封装函数可能用面向源端的参数名传入同样这两个张量; 并不存在四张独立的路由表.

Invalid routes use negative rank or row values. PUT kernels skip invalid routes. BF16 combine can zero-fill invalid gathered rows. FP8 scaled combine masks invalid routes before reduction.

无效路由用负的 rank 或行号表示. PUT kernel 跳过无效路由. BF16 combine 可以把收集到的无效行填零. FP8 带 scale 的 combine 在归约前把无效路由 mask 掉.

| Operation | Pre-barrier | Post-barrier |
| --- | --- | --- |
| Dispatch PUT | false | true |
| Combine GET | true | false |

> **确认:** 上表里 dispatch PUT 只要后置 barrier, combine GET 只要前置 barrier; 这两处 barrier 各自保护的是什么, 能不能省?
> 答: 这是单边通信的可见性要求. PUT 是源 rank 往对端 buffer 写, 写完后对端要开始 grouped GEMM, 必须等所有源 rank 的写入落地, 所以 barrier 放在 PUT 之后; PUT 之前不需要, 因为对端的接收 buffer 由 lease 保证此时没人在读 (§5.7). GET 是本 rank 去对端读专家输出, 读之前必须等所有对端的专家计算写完, 所以 barrier 放在 GET 之前; 读完之后只改本地 scratch, 不需要再同步. 代码 `kernels/cuda/olmo_symm_mem_rowwise.cuh` 里每个 wrapper 都带 `pre_barrier`/`post_barrier` 两个开关, 实现就是 `nvshmemx_barrier_on_stream`. 一个后果是每次 dispatch 加 combine 至少两次全组 barrier, 等于每层两个同步点, 最慢 rank 决定进度; DeepEP 用逐 rank 的信号计数代替全组 barrier, 可以只等与自己有数据往来的 rank. 报告没讨论两者的开销差别.

## A.3 CUDA/NVSHMEM Kernels Operate per Route · CUDA/NVSHMEM kernel 按路由逐条处理

The rowwise CUDA implementation is route-oriented. A route id is token\_row \* top\_k + k.

rowwise 的 CUDA 实现以路由为单位. 路由 id 为 token\_row \* top\_k + k.

The important CUDA kernels are:

主要的 CUDA kernel 如下:

| CUDA kernel | Transport primitive | Role |
| --- | --- | --- |
| dispatchRowsPut | nvshmemx_putmem_warp | Unweighted row dispatch PUT. |
| dispatchRowsPutWeighted | nvshmemx_putmem_warp | Weighted row PUT when route probabil-ities are supplied. |
| gatherRowsGet | nvshmemx_getmem_warp | Gather remote rows into local route scratch. |
| combineRowsReduceKernel | local CUDA | Reduce gathered [N, K, D] into [N, D]. |
| combineRowsGetKernel | nvshmemx_getmem_warp | Optional fused BF16/half GET plus re-duce path. |

For dispatch, each route derives the source row, peer rank, and destination row, then PUTs input[src\_ row] into out[dst\_row] on the peer. For gather/combine, each route derives the peer and source row, GETs expert\_out[src\_row] into local route scratch, and reduces gathered [token\_row, :, :] routes into output[token\_row, :].

dispatch 时, 每条路由算出源行, 对端 rank 和目的行, 然后把 input[src\_ row] PUT 到对端的 out[dst\_row]. gather/combine 时, 每条路由算出对端和源行, 把 expert\_out[src\_row] GET 到本地路由 scratch, 再把收集到的 [token\_row, :, :] 各路由归约到 output[token\_row, :].

## A.4 FP8 Transport Requires Compatible Layouts · FP8 传输要求排布兼容

Rowwise FP8 communication carries two payload families: MXFP8 qdata and MXFP8 row scales, usually with block size 32. BF16 dispatch writes dispatch\_out[capacity\_rows, hidden], while FP8 dispatch writes dispatch\_out\_q[capacity\_rows, hidden] and dispatch\_out\_scales[capacity\_rows, hidden / block\_size].

rowwise FP8 通信传两类载荷: MXFP8 qdata 和 MXFP8 行 scale, 块大小通常为 32. BF16 dispatch 写 dispatch\_out[capacity\_rows, hidden], FP8 dispatch 则写 dispatch\_out\_q[capacity\_rows, hidden] 和 dispatch\_out\_scales[capacity\_rows, hidden / block\_size].

<!-- page 135 of 168 -->

The exact scale layout depends on the consuming grouped GEMM path, not just the numerical format. Transformer Engine, for example, uses different scale layouts for communication and GEMM and swizzles between them (NVIDIA, 2026w). In Olmo’s rowwise path, the received qdata and scales are passed to grouped GEMM through its prequantized-LHS interface. This reuses the quantized payload; the consumer still converts unblocked row scales to its blocked GEMM layout.

scale 的具体排布取决于消费它的 grouped GEMM 路径, 不只取决于数值格式. 例如 Transformer Engine 在通信和 GEMM 中用不同的 scale 排布, 两者之间做 swizzle (NVIDIA, 2026w). 在 Olmo 的 rowwise 路径中, 收到的 qdata 和 scale 经 prequantized-LHS 接口交给 grouped GEMM. 这样复用了量化后的载荷; 但消费端仍要把未分块的行 scale 转成 GEMM 需要的分块排布.

## A.5 Blackwell MXFP8 Uses Block-Scaled Tensor Core MMA · Blackwell 上的 MXFP8 使用块缩放 Tensor Core MMA

Three related terms describe different levels of the MXFP8 compute path. Olmo calls PyTorch’s scaled\_ mm operator and requests a BF16 result. The selected device kernel implements a tiled general matrix multiplication (GEMM), including operand movement, a Tensor Core main loop, and an output epilogue. Within that main loop, the Blackwell instruction-level primitive is the fifth-generation Tensor Core matrix multiply–accumulate (MMA), exposed by the PTX tcgen05.mma family (NVIDIA, 2026j,u).

三个相关的术语分别描述 MXFP8 计算路径的不同层次. Olmo 调用 PyTorch 的 scaled\_ mm 算子, 要求输出 BF16. 被选中的设备 kernel 实现分块的通用矩阵乘 (GEMM), 包括操作数搬运, Tensor Core 主循环和输出 epilogue. 在主循环内部, Blackwell 指令级的原语是第五代 Tensor Core 的矩阵乘累加 (MMA), 由 PTX 的 tcgen05.mma 指令族提供 (NVIDIA, 2026j,u).

| Level | Term and responsibility |
| --- | --- |
| PyTorch operator | scaled_mm: accepts qdata and scale tensors, selects a backend, and returns the requested output dtype. |
| Device kernel | Block-scaled GEMM: tiles the matrices, moves operands and scales, runs the reduction over K, and applies the output epilogue. |
| Tensor Core instruction | tcgen05.mma: computes one matrix tile update into an accumulator. |

**Table 40 Operator, kernel, and instruction levels of MXFP8 GEMM.** The operator, kernel, and instruction names refer to different levels of the same MXFP8 matrix multiplication.

For BF16 operands, the corresponding Blackwell instruction family uses the kind::f16 modifier. Native MXFP8 uses kind::mxf8f6f4 together with block\_scale; its full PTX family includes the choice of one- or two-CTA execution:

对 BF16 操作数, 对应的 Blackwell 指令族用 kind::f16 修饰符. 原生 MXFP8 用 kind::mxf8f6f4 加 block\_scale; 完整的 PTX 指令族还包括选择单 CTA 或双 CTA 执行:

$$
\text {tcgen05.mma.cta\_group::\{1|2\}.kind::mxf8f6f4.block\_scale.}
$$

For the MXFP8 case, the instruction applies the two block-scale tensors during the reduction. Its numerical operation is

在 MXFP8 情形下, 这条指令在归约过程中施加两个块 scale 张量. 它的数值运算为

$$
D _ {i j} = C _ {i j} + \sum_ {k = 0} ^ {K - 1} \left(S _ {i, \lfloor k / 3 2 \rfloor} ^ {(A)} A _ {i k}\right) \left(S _ {\lfloor k / 3 2 \rfloor , j} ^ {(B)} B _ {k j}\right),\tag{87}
$$

where each E8M0 entry in $S ^ { ( A ) }$ or $S ^ { ( B ) }$ scales a block of 32 consecutive E4M3 values along the GEMM-K dimension. The logical scale grids shown in Figure 47 are the operator-facing view. The Blackwell main loop stages qdata in shared memory, copies scale factors into Tensor Memory, and keeps the FP32 accumulator in Tensor Memory; the scale grids must therefore be swizzled into the blocked physical layout expected by the kernel (NVIDIA, 2026u)

其中 $S ^ { ( A ) }$ 或 $S ^ { ( B ) }$ 的每个 E8M0 元素, 给沿 GEMM 的 K 维连续的 32 个 E4M3 值作缩放. Figure 47 画的逻辑 scale 网格是面向算子的视图. Blackwell 主循环把 qdata 暂存在 shared memory, 把 scale 因子拷进 Tensor Memory, FP32 累加器也放在 Tensor Memory; 因此 scale 网格必须 swizzle 成 kernel 要求的分块物理排布 (NVIDIA, 2026u).

The raw block-scaled MMA does not directly define a BF16 result. It updates an FP32 accumulator in Tensor Memory. The GEMM epilogue reads that accumulator and converts it to the output dtype requested by scaled\_mm. In the current Olmo path, that requested dtype is BF16.

块缩放 MMA 本身并不直接产出 BF16 结果, 它更新的是 Tensor Memory 里的 FP32 累加器. GEMM 的 epilogue 读出累加器, 再转成 scaled\_mm 要求的输出 dtype. 在目前的 Olmo 路径中, 这个 dtype 是 BF16.

## A.6 Availability of Device-Side Grouped GEMM · 设备侧 grouped GEMM 的可用范围

The PyTorch source snapshot audited for this report distinguishes the public grouped-matrix-multiplication operation from the backend selected at runtime. For CUDA, the architecture gate used by the device offset fast path admits only compute-capability major versions 9 (SM90) and 10 (SM100 family) (PyTorch Contributors, 2026i). Table 41 summarizes the resulting behavior.

本报告审阅的 PyTorch 源码快照, 把公开的 grouped 矩阵乘操作与运行时选中的后端区分开. 在 CUDA 上, 设备侧 offset 快速路径的架构门槛只放行计算能力主版本号为 9 (SM90) 和 10 (SM100 系列) 的设备 (PyTorch Contributors, 2026i). Table 41 汇总了由此产生的行为.

The BF16 fallback makes the behavioral difference explicit: it calls offs.cpu() and then launches one matrix multiplication per group (PyTorch Contributors, 2026j). The fast CUDA implementation, by contrast, instantiates CUTLASS SM90 and SM100-family grouped kernels. This is a boundary of the current PyTorch

<!-- page 136 of 168 -->

| PyTorch entry point | CC major 9 or 10 | Other CUDA architectures |
| --- | --- | --- |
| BF16 torch._grouped_mm | Device-offset fast path; no offset copy to the host | Host-loop fallback; offsets are copied to the CPU before the per-group GEMMs |
| Scaled torch._scaled_grouped_mm | Architecture gate passes | Rejected by the architecture gate rather than routed to the host-loop fallback |

integration, not evidence that SM120 lacks Tensor Core matrix multiplication. The CUTLASS source bundled with the same $\mathrm { P y }$ Torch snapshot contains an SM120 grouped-GEMM example (NVIDIA, 2026n), and Table 21 records the SM120 mma.sync instruction family. In particular, the restriction is not a lack of $``   WMMA$ support: WMMA is a programming interface, while the underlying matrix-instruction family differs across GPU architectures.

BF16 的回退路径把行为差异摆得很明白: 它调用 offs.cpu(), 然后每组各发起一次矩阵乘 (PyTorch Contributors, 2026j). 快速的 CUDA 实现则实例化 CUTLASS 的 SM90 和 SM100 系列 grouped kernel. 这是当前 PyTorch 集成的边界, 不能说明 SM120 缺少 Tensor Core 矩阵乘. 同一 PyTorch 快照附带的 CUTLASS 源码里就有 SM120 的 grouped GEMM 示例 (NVIDIA, 2026n), Table 21 也记录了 SM120 的 mma.sync 指令族. 尤其要说明, 这个限制也不是因为缺少 WMMA 支持: WMMA 是编程接口, 底层的矩阵指令族在不同 GPU 架构上各不相同.

## A.7 Common Grouped-GEMM Shapes in Training · 训练中常见的 grouped GEMM 形状

The matrix row count seen by grouped GEMM follows the rank-local microbatch and the routing multiplicity. For $B _ { \mu }$ sequences of length L and top-K routing, balanced expert parallelism gives

grouped GEMM 看到的矩阵行数, 由 rank 本地的 microbatch 和路由倍数决定. 对 $B _ { \mu }$ 条长为 $L$ 的序列和 top-K 路由, 均衡的专家并行给出

$$
M _ {\mathrm{rank}} \simeq B _ {\mu} L K, \quad \overline {{M}} _ {e} = \frac {M _ {\mathrm{rank}}}{N _ {\mathrm{local}}}, \quad N _ {\mathrm{local}} = \frac {N}{M _ {E}}.\tag{88}
$$

The EP degree does not divide $M _ { \mathrm { r a n k } } .$ an EP-MP group of size $M _ { E }$ contributes that many source microbatches before distributing the routed rows over the same number of destination ranks. Table 42 shows the resulting shapes for representative training configurations. Shared-expert computation is separate, and load imbalance can move an individual rank away from the balanced expectation.

EP 度数并不会除掉 $M _ { \mathrm { r a n k } }$: 大小为 $M _ { E }$ 的 EP-MP 组先贡献 $M_E$ 份源 microbatch, 再把路由后的行分到同样多个目的 rank 上. Table 42 列出了几个代表性训练配置下的形状. 共享专家的计算另算, 负载不均衡会让个别 rank 偏离均衡时的期望值.

> **拆开:** 式 (88) 里 $M_{\mathrm{rank}}\simeq B_\mu LK$ 与 EP 度数 $M_E$ 无关, 但 $\overline M_e$ 却随 $M_E$ 变; 拿 Table 42 的 Ultra-2 对一下, 加大 EP 对 grouped GEMM 意味着什么?
> 答: 每个 rank 发出 $B_\mu LK$ 条路由, 组内 $M_E$ 个 rank 共发出 $M_E B_\mu LK$ 条, 均匀落到 $M_E$ 个目的 rank 上, 每个 rank 收到的仍是 $B_\mu LK$, 所以 $M_{\mathrm{rank}}$ 不含 $M_E$. 但本地专家数 $N_{\mathrm{local}}=N/M_E$ 随 EP 变小, 每个专家分到的行 $\overline M_e = M_E B_\mu LK/N$ 就随 EP 线性变大. Ultra-2: $2\times 8\mathrm K\times 4=64\mathrm K$, $N_{\mathrm{local}}=128/32=4$, $\overline M_e=16\mathrm K$; 若同样配置 EP=8, $\overline M_e$ 只有 4K. 所以加大 EP 在通信上要付出更多跨节点流量, 换来的是每个专家的 GEMM 行数更多, 离 A.8 式 (91) 的平衡点更远. Large-2 的 $\overline M_e=2\mathrm K$ 是表里最小的; 对照本节 $d=h=2048$ 的扫描, BMM 与 grouped GEMM 的交叉点在总行数 8K–16K, 即每专家 0.5K–1K 行, 2K 仍在 grouped GEMM 更快的一侧. 这层取舍报告没直接写, 是从式 (88) 推出来的.

<table><tr><td rowspan="2">Scale</td><td colspan="3">Rank-local microbatch</td><td colspan="3">Expert layout</td><td colspan="2">Projection</td><td colspan="2">Routed rows</td></tr><tr><td> $B_{\mu}$ </td><td>L</td><td>K</td><td> $M_E$ </td><td>N</td><td> $N_{local}$ </td><td>d</td><td>h</td><td> $M_{rank}$ </td><td> $\overline{M_e}$ </td></tr><tr><td>Small-2</td><td>3</td><td>8K</td><td>4</td><td>8</td><td>64</td><td>8</td><td>2048</td><td>2560</td><td>96K</td><td>12K</td></tr><tr><td>Small-3</td><td>4</td><td>4K</td><td>8</td><td>8</td><td>64</td><td>8</td><td>2048</td><td>2560</td><td>128K</td><td>16K</td></tr><tr><td>Small-4</td><td>3</td><td>8K</td><td>8</td><td>8</td><td>128</td><td>16</td><td>1536</td><td>1536</td><td>192K</td><td>12K</td></tr><tr><td>Medium-2</td><td>3</td><td>8K</td><td>4</td><td>8</td><td>128</td><td>16</td><td>3584</td><td>4096</td><td>96K</td><td>6K</td></tr><tr><td>Large-2</td><td>1</td><td>8K</td><td>4</td><td>8</td><td>128</td><td>16</td><td>6144</td><td>8192</td><td>32K</td><td>2K</td></tr><tr><td>Ultra-2</td><td>2</td><td>8K</td><td>4</td><td>32</td><td>128</td><td>4</td><td>8192</td><td>10240</td><td>64K</td><td>16K</td></tr></table>

The smaller configurations in the table use expert widths between 1536 and 2560 and route 96K–192K rows per rank. To complement the $d   =   h   =   4 0 9 6$ result in the main text, we repeat the same isolated BF16 projection benchmark with $d   =   h   =   2 0 4 8$ , 16 local experts, and $M = 4 \mathrm { K }$ through 256K. The BMM path again executes exactly 1.25× per-expert capacity. Its regular kernel is faster at 4K and 8K total rows; grouped GEMM becomes faster between 8K and 16K and remains faster through the rest of the sweep. At 128K total rows, BMM takes 15.4% longer.

表中较小的配置, 专家宽度在 1536 到 2560 之间, 每个 rank 路由 96K–192K 行. 作为正文 $d   =   h   =   4 0 9 6$ 结果的补充, 我们用 $d   =   h   =   2 0 4 8$, 16 个本地专家, $M = 4 \mathrm { K }$ 到 256K, 重复同样的单独 BF16 投影基准. BMM 路径同样严格执行每专家 1.25× 的容量. 总行数为 4K 和 8K 时, BMM 的规整 kernel 更快; grouped GEMM 在 8K 到 16K 之间反超, 并在之后的扫描范围内一直更快. 总行数 128K 时, BMM 多花 15.4% 的时间.

<!-- page 137 of 168 -->

Grouped MM wins across the small-model routed-row range $(d = h = 2,048)$

![Image block](images/p137-figure-71-grouped-gemm-also-wins-across-the-small.jpg)

![Image block](images/p137-figure-71-grouped-gemm-also-wins-across-the-small-2.jpg)

> 图注: figure 71 grouped gemm also wins across the small 2.

Total routed rows across 16 local experts (M)

**Figure 71 Grouped GEMM also wins across the small-model training range.** This one-B300 experiment fixes 16 local experts and a square BF16 projection with $d   =   h   =   2 0 4 8$ . The green band marks the 96K–192K routed-row range represented by the small configurations in Table 42; their exact widths and local expert counts vary, so the band is an operating-range guide rather than an exact reconstruction of every model. BMM reserves 1.25× capacity per expert, while grouped GEMM executes only valid rows. Each point averages 20 queued CUDA-event samples after 10 warm-ups.

## A.8 Equal Compute Can Require More HBM Traffic · 计算量相同, HBM 流量可能更多

Small expert batches perform less arithmetic per weight load. A roofline model makes this limit explicit before routing, synchronization, or kernel scheduling overhead is counted. For one GPU operation, let $F _ { g }$ be its arithmetic work, $Q _ { g }$ its high-bandwidth memory (HBM) traffic, $T _ { g }$ its elapsed time, and $I = F _ { g } / \bar { Q _ { g } }$ its arithmetic intensity. With compute ceiling $C _ { \mathrm { p e a k } }$ and HBM bandwidth ceiling $B _ { \mathrm { H B M } }$ , the idealized roofline gives (Austin et al., 2025)

专家批次小时, 每读一次权重做的算术就少. roofline 模型在还没算上路由, 同步或 kernel 调度开销之前, 就把这个上限明确写了出来. 对一个 GPU 操作, 令 $F _ { g }$ 为它的算术量, $Q _ { g }$ 为它的高带宽显存 (HBM) 流量, $T _ { g }$ 为耗时, $I = F _ { g } / \bar { Q _ { g } }$ 为算术强度. 设计算上限为 $C _ { \mathrm { p e a k } }$, HBM 带宽上限为 $B _ { \mathrm { H B M } }$, 理想化的 roofline 给出 (Austin et al., 2025)

$$
T _ {g} \geq \max \left(\frac {F _ {g}}{C _ {\text {peak}}}, \frac {Q _ {g}}{B _ {\text {HBM}}}\right), \quad \frac {F _ {g}}{T _ {g}} \leq \min (C _ {\text {peak}}, I B _ {\text {HBM}}).\tag{89}
$$

For a BF16 expert projection $[ M _ { e } , d _ { \operatorname { i n } } ] [ d _ { \operatorname { i n } } , d _ { \operatorname { o u t } } ] \to [ M _ { e } , d _ { \operatorname { o u t } } ]$ $M _ { e }$ is the token-row count and $d _ { \mathrm { i n } } , d _ { \mathrm { o u t } }$ are the input and output widths. For this forward projection, reading both operands once from HBM and writing a BF16 result gives

对 BF16 专家投影 $[ M _ { e } , d _ { \operatorname { i n } } ] [ d _ { \operatorname { i n } } , d _ { \operatorname { o u t } } ] \to [ M _ { e } , d _ { \operatorname { o u t } } ]$, $M _ { e }$ 是 token 行数, $d _ { \mathrm { i n } } , d _ { \mathrm { o u t } }$ 是输入和输出宽度. 这个前向投影从 HBM 各读一次两个操作数, 写一次 BF16 结果, 得到

$$
I = \frac {2 M _ {e} d _ {\mathrm{in}} d _ {\mathrm{out}}}{2 (M _ {e} d _ {\mathrm{in}} + d _ {\mathrm{in}} d _ {\mathrm{out}} + M _ {e} d _ {\mathrm{out}})}.\tag{90}
$$

When $M _ { e } \ll d _ { \operatorname { i n } } , d _ { \operatorname { o u t } }$ , this is approximately $M _ { e }$ FLOP/byte: fewer rows per expert reduce weight reuse. For a stated BF16 compute reference and HBM bandwidth, the balance point is

当 $M _ { e } \ll d _ { \operatorname { i n } } , d _ { \operatorname { o u t } }$ 时, 它约为 $M _ { e }$ FLOP/byte: 每个专家的行越少, 权重复用越少. 给定 BF16 计算参照和 HBM 带宽, 平衡点为

$$
I _ {\star} = \frac {C _ {\mathrm{BF16}}}{B _ {\mathrm{HBM}}} \quad \text {FLOP / byte}.\tag{91}
$$

Under this HBM traffic model, even a zero-overhead projection below that intensity cannot reach the compute peak. Cache reuse, tiling, operand precision, and actual HBM traffic change the bound. This compute– bandwidth balance point is distinct from the measured grouped-GEMM-versus-BMM crossover in Section 9.6.

在这个 HBM 流量模型下, 强度低于平衡点的投影, 即使零开销也达不到计算峰值. 缓存复用, 分块方式, 操作数精度和实际 HBM 流量都会改变这个界. 这个计算-带宽平衡点, 和 Section 9.6 实测的 grouped GEMM 对 BMM 的交叉点是两回事.

**Dense and MoE forward GEMMs with equal FLOPs.** Figure 2 fixes the original token count $T ,$ input width d, and useful GEMM FLOPs. The dense FFN has hidden width Kh; the MoE has E experts of hidden width h and selects K per token. Assume balanced routes with every expert used, so each expert receives $M _ { e } = T K / E$ rows. Dense executes the fused up/gate product $[ T , d ] [ d , 2 K h ]$ followed, after the pointwise activation, by the

<!-- page 138 of 168 -->

down product $[ T , K h ] [ K h , d ]$ . Grouped GEMM executes $E$ corresponding pairs with shapes $[ T K / E , d ] [ d , 2 h ]$ and $[ T K / E , h ] \dot { [ } h , d ]$ . Both perform

**FLOPs 相同的稠密与 MoE 前向 GEMM.** Figure 2 固定原始 token 数 $T$, 输入宽度 $d$ 和有效 GEMM FLOPs. 稠密 FFN 的隐藏宽度为 $Kh$; MoE 有 $E$ 个隐藏宽度为 $h$ 的专家, 每个 token 选 $K$ 个. 假设路由均衡且每个专家都被用到, 每个专家收到 $M _ { e } = T K / E$ 行. 稠密路径先执行融合的 up/gate 乘积 $[ T , d ] [ d , 2 K h ]$, 经逐点激活后再执行 down 乘积 $[ T , K h ] [ K h , d ]$. grouped GEMM 执行 $E$ 对相应的乘积, 形状为 $[ T K / E , d ] [ d , 2 h ]$ 和 $[ T K / E , h ] \dot { [ } h , d ]$. 两者的计算量都是

$$
F _ {\mathrm{up}} = 4 T K d h, \qquad F _ {\mathrm{down}} = 2 T K d h, \qquad F _ {\mathrm{pair}} = 6 T K d h.\tag{92}
$$

For BF16 arrays, Table 43 counts the bytes read and written by these GEMMs. The MoE inputs are separate, already-materialized route rows; the writes that created them are outside this accounting. The down GEMM writes TK output rows before combine, whereas dense writes $T ;$ combine is not folded into these GEMM writes.

对 BF16 数组, Table 43 统计了这些 GEMM 读写的字节数. MoE 的输入是已经物化好的, 各自独立的路由行; 生成它们的写入不在统计范围内. down GEMM 在 combine 之前写出 $TK$ 行输出, 稠密只写 $T$ 行; combine 不算进这些 GEMM 写入.

| HBMtraffic category | Densebytes | MoEbytes | MoE/dense |
| --- | --- | --- | --- |
| Weight reads | 6Kdh | 6Edh | E/K |
| FFN input reads | 2Td | 2TKd | K |
| Output writes, before combine | 2Td | 2TKd | K |
| Up/gate writes + down input reads | 6TKh | 6TKh | 1 |

The equal last-row count follows from the matched-compute widths, not from eliminating MoE intermediates. Dense produces [T, 2Kh] up/gate values and consumes [T, Kh] activated values; the corresponding routed tensors are [TK, 2h] and [TK, h]. Each pair has equal element counts. In a grad-enabled BF16 forward, both paths execute a separate SwiGLU expression between the GEMMs. Its own accesses, any temporary tensors, and cache effects are outside the GEMM-only model; tensor shapes alone do not establish measured HBM traffic.

最后一行两边相等, 是因为两者的宽度按计算量对齐了, 并不是 MoE 省掉了中间张量. 稠密产生 [T, 2Kh] 的 up/gate 值, 消费 [T, Kh] 的激活值; 路由路径对应的张量是 [TK, 2h] 和 [TK, h]. 每一对的元素个数相等. 在开启梯度的 BF16 前向中, 两条路径都在两个 GEMM 之间单独执行一个 SwiGLU 表达式. 它自身的访存, 临时张量和缓存效应都不在这个只算 GEMM 的模型里; 单看张量形状不能确定实测的 HBM 流量.

For each layout, separate the HBM bytes of the two GEMMs:

对每种排布, 把两个 GEMM 的 HBM 字节分开写:

$$
\begin{array}{l l} Q _ {\text {dense,up}} = 2 (T d + 2 K d h + 2 T K h), & Q _ {\text {dense,down}} = 2 (T K h + K h d + T d), \\ Q _ {\text {MoE,up}} = 2 (T K d + 2 E d h + 2 T K h), & Q _ {\text {MoE,down}} = 2 (T K h + E h d + T K d). \end{array}\tag{93}
$$

The two GEMM passes are sequential, so their modeled times add:

两个 GEMM 依次执行, 所以模型时间相加:

$$
\widehat {t} = \sum_ {j \in \{\text {up, down} \}} \max \left(\frac {F _ {j}}{C _ {\mathrm{BF16}}}, \frac {Q _ {j}}{B _ {\mathrm{HBM}}}\right), \quad \widehat {R} = \frac {F _ {\text {pair}}}{\widehat {t}}.\tag{94}
$$

The figure plots $\widehat { R } / C _ { \mathrm { B F 1 6 } }$ as T varies, with $E = 6 4 ,   K = 4$ , and $d = h = 4 0 9 6$ It uses the nominal B300 BF16 compute-to-HBM-bandwidth ratio (NVIDIA, 2026r,b); the vertical axis labels the common reference as peak FLOPs, not an achievable kernel rate. This is a roofline expressed against token count rather than arithmetic intensity. The hardware reference is identical; the different HBM byte counts produce different curves. At small batches, weight reads dominate and MoE reuses each weight across only $T K / E$ tokens instead of T. Larger batches amortize those reads, and both modeled curves eventually reach the common compute ceiling for these widths.

图中画的是 $\widehat { R } / C _ { \mathrm { B F 1 6 } }$ 随 $T$ 的变化, 取 $E = 6 4 ,   K = 4$, $d = h = 4 0 9 6$. 它用 B300 名义上的 BF16 算力与 HBM 带宽之比 (NVIDIA, 2026r,b); 纵轴把这个共同参照标为峰值 FLOPs, 不是 kernel 实际能达到的速率. 这是按 token 数而不是按算术强度画的 roofline. 硬件参照相同, HBM 字节数不同, 于是曲线不同. 批次小时, 权重读取占主导, MoE 的每个权重只在 $T K / E$ 个 token 上复用, 稠密则在 $T$ 个上复用. 批次变大后这部分读取被摊薄, 在这组宽度下两条模型曲线最终都到达共同的计算上限.

**The HBM traffic model defines the scope.** This is a single-GPU forward GEMM-pair comparison, not the complete FFN or training step. Balanced, all-used routing is an analytical assumption, not a guarantee for random or learned routes. Equal FLOPs do not imply equal parameter capacity or model quality. The model assumes no cache reuse between operand arrays and omits tiling-induced rereads; caching or fused indexed input access can reduce the counted HBM traffic, while rereads can increase it. Packing, route merging, activation functions, backward, inter-GPU communication, gradient synchronization, and optimizer work are excluded. Fusion or pipelining across the two GEMM passes can change their HBM traffic and timing. The curves are ceilings within these assumptions, not measured rates or an end-to-end MFU bound. Measured projection efficiency appears in Section 9.6.

**HBM 流量模型限定了适用范围.** 这是单 GPU 上一对前向 GEMM 的比较, 不是完整的 FFN, 也不是完整的训练步. 路由均衡且每个专家都被用到, 是分析用的假设, 随机路由或学到的路由并不保证这一点. FLOPs 相等不意味着参数容量或模型质量相等. 模型假设操作数数组之间没有缓存复用, 也不计分块导致的重复读取; 缓存或融合的按索引读输入能减少统计到的 HBM 流量, 重复读取则会增加它. packing, 路由合并, 激活函数, 反向, GPU 间通信, 梯度同步和优化器工作都不在内. 两个 GEMM 之间做融合或流水, 也会改变它们的 HBM 流量和耗时. 这些曲线是在上述假设下的上限, 不是实测速率, 也不是端到端的 MFU 上界. 实测的投影效率见 Section 9.6.

<!-- page 139 of 168 -->

## A.9 The Maximum Load Does Not Specify the Expert Histogram · 最大负载不能确定专家负载分布

The maximum-to-mean ratio $I _ { \mathrm { m a x } }$ records only the largest expert load. It does not record how much work is concentrated among the other experts. Figure 72 constructs a direct counterexample with 16 local experts. The matched single-spike assignment gives one expert 31.67% of all rows and divides the remainder across 15 experts. The three-hot assignment gives the same number of rows to each of three experts, so those three receive approximately 95% in total and the other 13 divide the remaining 5%. After eight-row alignment, both have $I _ { \mathrm { m a x } } \approx 5 . 0 7$ , the same total rows, and the same useful FLOPs.

最大值与均值之比 $I _ { \mathrm { m a x } }$ 只记录负载最大的那个专家, 不反映其余专家之间工作量怎么集中. Figure 72 用 16 个本地专家构造了一个直接的反例. 对照用的单尖峰分配给一个专家 31.67% 的行, 其余行分给另外 15 个专家. 三热点分配给三个专家各分同样多的行, 这三个合计约占 95%, 剩下 13 个分剩余的 5%. 按 8 行对齐后, 两者都有 $I _ { \mathrm { m a x } } \approx 5 . 0 7$, 总行数相同, 有效 FLOPs 也相同.

The three-hot assignment has lower mean grouped GEMM throughput at all four row counts. Its additional loss relative to the matched single spike ranges from 3 to 11 percentage points. The condition ranges overlap at some shapes, so the experiment does not make $I _ { \mathrm { m a x } }$ or any other single summary a complete timing model. It establishes the narrower point: two assignments with the same maximum load can present different collections of matrix problems to grouped GEMM and take different amounts of time.

在全部四种行数下, 三热点分配的 grouped GEMM 平均吞吐都更低, 相对单尖峰多损失 3 到 11 个百分点. 某些形状下两种条件的取值范围有重叠, 所以这个实验并不让 $I _ { \mathrm { m a x } }$ 或其他任何单一指标成为完整的计时模型. 它证明的是一个更窄的结论: 最大负载相同的两种分配, 交给 grouped GEMM 的矩阵问题集合可以不同, 耗时也不同.

## $I _ { \mathsf { m a x } }$ does not describe the complete expert-load histogram

![Image block](images/p139-chart.jpg)

![Image block](images/p139-figure-72-the-same-can-describe-different-grouped-gemm.jpg)

Figure 72 The same $I _ { \mathrm { m a x } }$ can describe different grouped GEMM workloads. Left: sorted expert loads for a representative 64K-row case. Right: rank-local grouped GEMM throughput normalized to the balanced assignment in the same process. Large markers report arithmetic means, while small translucent points show five independent runs on the same B300. In each run, let a be the base expert index. The matched single spike overloads expert a, while the three-hot assignment overloads experts $( a , a + 5 , a + 1 0 )$ mod 16; the five values of a are 0, 3, 6, 9, and 12. Every run averages 20 queued CUDA-event samples after 10 warm-ups. The benchmark isolates one BF16 $d = h = 4 0 9 6$ projection and excludes dispatch, communication, and cross-rank waiting.

## A.10 Grouped-GEMM Capacity Benchmark Details · Grouped GEMM 容量基准的细节

The benchmark in Section 9 uses 16 local experts, $d = h = 4 0 9 6 .$ and BF16 operands. It isolates one square forward projection and compares exact device-sized grouped GEMM with BMM at $C = \lceil 1 . 2 5   \overline { { M } } _ { e }   \rceil$ rows per expert. We fix capacity at 1.25 times the mean rather than the observed maximum, so balanced routes still incur the configured padding. Both paths receive the same seeded valid activations and expert weights and write into preallocated outputs. Routing, communication, activation functions, and backward are outside the timed region, so the result identifies a kernel crossover rather than predicting complete expert-MLP time.

Section 9 的基准用 16 个本地专家, $d = h = 4 0 9 6$, BF16 操作数. 它单独测一个方阵前向投影, 比较按设备侧实际大小执行的 grouped GEMM 与每专家 $C = \lceil 1 . 2 5   \overline { { M } } _ { e }   \rceil$ 行的 BMM. 容量固定为均值的 1.25 倍, 而不是观测到的最大值, 所以即使路由均衡也照样有配置好的 padding. 两条路径拿到同一个种子生成的有效激活和专家权重, 都写入预分配的输出. 路由, 通信, 激活函数和反向都不在计时区内, 所以结果给出的是 kernel 层面的交叉点, 不能用来预测完整专家 MLP 的耗时.

The raw per-call timings, validation output, and manifests are retained in the experiment package bundled with this report.

每次调用的原始计时, 校验输出和清单文件都保存在本报告附带的实验包里.

<!-- page 140 of 168 -->

## A.11 Matched Grouped–Dense Projection Benchmark · 对齐条件的 grouped 与稠密投影基准

This benchmark compares three mathematically equivalent BF16 projections. We initialize one canonical $W _ { \mathrm { d e n s e } } \in \mathbb { R } ^ { 8 1 9 2 \times 8 1 9 2 0 }$ and partition its output columns in two ways: four expert matrices of shape $8 1 9 2   \times   2 0 4 8 0$ or eight expert matrices of shape $8 1 9 2 \times 1 0 2 4 0$ . Both grouped layouts contain the exact dense BF16 values. One seeded input X is physically repeated for each grouped problem, and sampled output rows match bitwise at every measured T.

这个基准比较三种数学上等价的 BF16 投影. 先初始化一个标准的 $W _ { \mathrm { d e n s e } } \in \mathbb { R } ^ { 8 1 9 2 \times 8 1 9 2 0 }$, 再按两种方式切分它的输出列: 4 个形状为 $8 1 9 2   \times   2 0 4 8 0$ 的专家矩阵, 或 8 个形状为 $8 1 9 2 \times 1 0 2 4 0$ 的专家矩阵. 两种 grouped 排布含有的都是与稠密完全相同的 BF16 值. 同一个种子生成的输入 X 为每个 grouped 子问题在物理上复制一份, 在每个测量的 $T$ 下, 抽样的输出行都逐位一致.

All three paths execute $2 T \times 8 1 9 2 \times 8 1 9 2 0$ useful FLOPs and access the same number of weight and output elements. They do not have identical input traffic: the grouped paths supply X to four or eight GEMMs. The experiment isolates this projection and excludes the activation function, down projection, routing, communication, shared experts, and backward.

三条路径都执行 $2 T \times 8 1 9 2 \times 8 1 9 2 0$ 有效 FLOPs, 访问的权重元素和输出元素数量也相同. 输入流量则不同: grouped 路径要把 X 分别提供给 4 个或 8 个 GEMM. 实验只测这一个投影, 不含激活函数, down 投影, 路由, 通信, 共享专家和反向.

We sweep powers of two from $T = 1$ through 65536 in eight paired trials, one on each of eight B300 GPUs. Every GPU measures both grouped partitions and their corresponding dense controls; partition order and backend order are counterbalanced. After ten direct warm-up calls, calibration chooses an adaptive CUDA Graph work unit targeting approximately 100 ms per replay. Each backend then receives a three-second pilot and a final batch containing at least eight seconds of uninterrupted same-path conditioning immediately followed by at least 1.5 seconds of measurement. The host submits both phases behind one device gate before releasing the GPU, with no synchronization or bookkeeping at the phase boundary.

我们在 8 组配对试验中扫描 $T = 1$ 到 65536 的 2 的幂, 8 张 B300 每张各跑一组. 每张 GPU 都测两种 grouped 切分及各自对应的稠密对照; 切分顺序和后端顺序做了平衡. 先直接调用 10 次预热, 再经校准选定一个自适应的 CUDA Graph 工作单元, 目标是每次 replay 约 100 ms. 之后每个后端先跑 3 秒试运行, 再跑一个最终批次: 至少 8 秒不间断的同路径预热, 紧接着至少 1.5 秒的测量. host 把这两段都提交在同一个设备闸门之后, 再放开 GPU, 两段交界处没有同步, 也没有统计操作.

| T | Dense | 4 experts | 4 / dense | 8 experts | 8 / dense |
| --- | --- | --- | --- | --- | --- |
| 1 | 7 | 4 | 0.588 | 4 | 0.620 |
| 16 | 111 | 67 | 0.601 | 68 | 0.608 |
| 128 | 854 | 520 | 0.608 | 548 | 0.643 |
| 256 | 1126 | 1086 | 0.964 | 1085 | 0.963 |
| 512 | 1293 | 1236 | 0.956 | 1230 | 0.951 |
| 1024 | 1381 | 1306 | 0.945 | 1298 | 0.941 |
| 2048 | 1422 | 1356 | 0.953 | 1350 | 0.949 |
| 4096 | 1401 | 1335 | 0.953 | 1331 | 0.950 |
| 8192 | 1416 | 1252 | 0.884 | 1250 | 0.882 |
| 16384 | 1412 | 1186 | 0.840 | 1184 | 0.839 |
| 32768 | 1413 | 1168 | 0.827 | 1169 | 0.827 |
| 65536 | 1411 | 1167 | 0.827 | 1167 | 0.827 |

Both grouped layouts approach the dense projection at $T \; = \; 2 5 6$ and sustain roughly 94–96% of dense throughput through $T = 4 0 9 6$ . Their close agreement shows that dividing the fixed projection into eight half-width GEMMs adds little cost beyond the four-way partition in this range. At 32K and 64K, all paths operate under the software power limit and grouped throughput settles at approximately 82.7% of dense, or 1.17 versus 1.41 $\mathrm{PFLOP/s}$ . These oversized cases diagnose large-matrix behavior; they are not representative training shapes.

两种 grouped 排布在 $T \; = \; 2 5 6$ 时接近稠密投影, 一直到 $T = 4 0 9 6$ 都保持在稠密吞吐的 94–96% 左右. 两者结果接近, 说明在这个范围内, 把固定的投影切成 8 个半宽 GEMM, 比切成 4 份几乎不多花代价. 在 32K 和 64K 时, 所有路径都处在软件功耗限制下, grouped 吞吐稳定在稠密的约 82.7%, 即 1.17 对 1.41 $\mathrm{PFLOP/s}$. 这些超大规模的情形用来诊断大矩阵下的行为, 并不代表训练中的形状.

## A.12 Very Large Grouped GEMMs Enter a Power-Limited Clock Regime · 超大 grouped GEMM 进入功耗受限的降频区

The main sweep stops at $M = 1 2 8 \mathrm { K }$ total rows, or $M _ { e }   =   8 \mathrm { K }$ rows per local expert. We separately stresstested $M _ { e } = 4 \mathrm { K }$ through 32K, reaching 512K total rows across 16 experts. The 16K and 32K per-expert cases are deliberately outside realistic Olmo training shapes; they expose the power-and-clock response behind the large-shape throughput decline.

主扫描停在总行数 $M = 1 2 8 \mathrm { K }$, 即每个本地专家 $M _ { e }   =   8 \mathrm { K }$ 行. 我们另外对 $M _ { e } = 4 \mathrm { K }$ 到 32K 做了压力测试, 16 个专家总共到 512K 行. 每专家 16K 和 32K 的情形有意超出 Olmo 实际训练的形状, 用来揭示大形状下吞吐下降背后的功耗与时钟响应.

The diagnostic uses eight counterbalanced trials across four B300 GPUs. Each backend and shape receives an uninterrupted three-second pilot followed by an eight-second conditioning region and a 1.5-second measured region. Shape and backend order vary across trials. The host submitted work at least 25 times faster than the

<!-- page 141 of 168 -->

GPU executed it, so CPU launch gaps were not on the measured path. All trials used the same initialization method, and grouped GEMM and BMM received identical valid activations and expert weights.

这项诊断在 4 张 B300 上做了 8 组顺序平衡的试验. 每个后端和形状都先跑不间断的 3 秒试运行, 再跑 8 秒预热区和 1.5 秒测量区. 形状和后端的顺序在各组试验间轮换. host 提交工作的速度至少是 GPU 执行速度的 25 倍, 所以 CPU 发射空隙不在测量路径上. 所有试验用同一种初始化方法, grouped GEMM 和 BMM 拿到的有效激活和专家权重完全相同.

Figure 73 shows the relevant comparison. From $M _ { e } = 4 \mathrm { K }$ to 32K, median grouped GEMM throughput falls from 1366 to 1163 $\mathrm{TFLDP/s}$ while its median SM clock falls from 1174 to 960 MHz. Per-trial useful through put per MHz (each trial’s throughput divided by its mean SM clock) has per-shape medians between 1.16 and 1.19 TFL $\dot{\mathrm{uOP/s/MHz.}}$ The equal-FLOP dense control remains approximately flat at 1.41–1.42 PFLOP/s, and the unplotted capacity-BMM control remains approximately flat at 1.21–1.22 $\mathrm{PFLOP/s}$

Figure 73 给出相关的对比. 从 $M _ { e } = 4 \mathrm { K }$ 到 32K, grouped GEMM 的吞吐中位数从 1366 降到 1163 TFLOP/s, SM 时钟中位数从 1174 MHz 降到 960 MHz. 每组试验的每 MHz 有效吞吐 (该组吞吐除以其平均 SM 时钟), 按形状取中位数在 1.16 到 1.19 TFLOP/s/MHz 之间. 同 FLOPs 的稠密对照基本持平在 1.41–1.42 PFLOP/s, 图中未画的容量 BMM 对照也基本持平在 1.21–1.22 $\mathrm{PFLOP/s}$.

**Very large grouped GEMMs enter a lower-clock power-limited regime**

![Image block](images/p141-chart.jpg)

![Image block](images/p141-figure-73-the-very-large-m-e-grouped-gemm.jpg)

Figure 73 The very-large-M<sub>e</sub> grouped GEMM slowdown follows SM clock, not per-clock efficiency. Lines show medians and bands show the full range across eight trials. Both paths execute the same useful FLOPs, although the dense control reuses one weight matrix while grouped GEMM reads 16 expert matrices. The software power-cap limiter was active in 99.3% of telemetry samples; no thermal, hardware-brake, or reliability limiter was observed.

Nsight timelines at $M _ { e } = 2 \mathrm { K }$ and 32K show the same CUTLASS grouped-GEMM kernel template. Together with the nearly constant throughput per MHz, this rules out a $\operatorname { h i g h - } M _ { e }$ dispatch change and provides no evidence of an algorithmic scaling collapse. Instead, sustained very-large grouped GEMMs settle at a lower clock while operating near the 1.1 kW board power limit. The precise microarchitectural reason for this lower operating point is not established. These extreme-shape timings need to be interpreted alongside clocks, power, and operand values.

$M _ { e } = 2 \mathrm { K }$ 和 32K 的 Nsight 时间线显示用的是同一个 CUTLASS grouped GEMM kernel 模板. 加上每 MHz 吞吐几乎不变, 这就排除了大 $M_e$ 时换了 kernel 分派的可能, 也没有证据表明出现了算法层面的扩展崩溃. 实际情况是, 持续运行的超大 grouped GEMM 在接近 1.1 kW 板卡功耗上限时稳定在一个更低的时钟. 这个更低工作点的具体微架构原因尚未确定. 这些极端形状下的计时, 要结合时钟, 功耗和操作数数值一起解读.

> **停一下:** A.12 把 grouped GEMM 变慢归到功耗墙下的降频, 但同 FLOPs 的稠密对照一直持平在 1.41–1.42 PFLOP/s; 同样的算术量, 为什么 grouped GEMM 的时钟被压得更低?
> 答: 先看 A.11: $T$ 为 32K 和 64K 时「all paths operate under the software power limit」, 稠密也在功耗墙下, 只是在墙下仍跑出 1.41 PFLOP/s, grouped 则稳定在它的 82.7%, 与这里 1163/1411 约 0.82 一致. 所以问题其实是: 同样卡在约 1.1 kW, 为什么 grouped 每焦耳做的有效 FLOPs 更少. Figure 73 图注给了线索: 稠密复用一个权重矩阵, grouped 读 16 个专家矩阵. 按 A.8 的式 (90), $M_e\ge 4\mathrm K$ 时两者的算术强度都在数千 FLOP/byte, 不受带宽限制, 但多出来的权重读取仍要消耗 HBM 和 L2 的能量, 同样的功耗预算留给 Tensor Core 的就少, 时钟被压低. 每 MHz 吞吐几乎不变 (1.16–1.19) 说明每个时钟周期的效率没变, 变的只是时钟. BMM 同样读 16 个矩阵, 吞吐平在 1.21–1.22 PFLOP/s, 报告没给它的时钟, 判断不了它是否也降了频. §19 说操作数数值会改变 GEMM 时间, 数值翻转率也影响功耗, 是另一个可能的因素. 报告明说「precise microarchitectural reason ... is not established」, 上面能耗分配的解释没有数据验证.

## A.13 Grouped Kernels Accept Managed Buffers · Grouped kernel 接受外部管理的 buffer

The BF16 grouped GEMM wrapper accepts explicit buffers:

BF16 grouped GEMM 的封装函数接受显式传入的 buffer:

```bazel
grouped_mm(
    mat_a,
    mat_b,
    offs=expert_offsets,
    out=optional_forward_output,
    input_grad_out=optional_dgrad_output,
)
```

The explicit out and input\_grad\_out buffers matter because expert compute often writes into buffers whose reuse point is chosen by the MoE runtime rather than by the PyTorch allocator.

显式的 out 和 input\_grad\_out buffer 之所以要紧, 是因为专家计算常常写入的 buffer, 何时可复用由 MoE 运行时决定, 而不是由 PyTorch 分配器决定.

The MXFP8 grouped GEMM wrapper has two important forms:

MXFP8 grouped GEMM 的封装函数有两种主要形式:

<!-- page 142 of 168 -->

```bazel
scaled_grouped_mm_q(
    mat_a,
    mat_b,
    offs=expert_offsets,
    prequantized_lhs=optional_lhs_q_scales,
    prequantized_rhs=optional_rhs_q_scales,
    prequantized_rhs_for_dgrad=optional_transposed_rhs_q_scales,
)
```

and:

以及:

```python
scaled_grouped_mm_q_fp8_weight(
    mat_a,
    grad_anchor,
    offs=expert_offsets,
    prequantized_lhs=optional_lhs_q_scales,
    prequantized_rhs Cameroon Required_rhs_q_scales,
    prequantized_rhs_for_dgrad=required_transposed_rhs_q_scales,
    wgrad_sink=optional_fp8_weight_grad_sink,
)
```

Forward and dgrad can use the scaled grouped GEMM backend. Wgrad has a different current policy: the fused rowwise path dequantizes the required operands, executes BF16 F.grouped\_mm, and accumulates the result into the FP8-weight gradient buffer. The integrated path has no native MXFP8 grouped Wgrad.

前向和 dgrad 可以用带 scale 的 grouped GEMM 后端. Wgrad 目前的策略不同: 融合的 rowwise 路径先把所需操作数反量化, 执行 BF16 的 F.grouped\_mm, 再把结果累加进 FP8 权重的梯度 buffer. 集成路径里没有原生的 MXFP8 grouped Wgrad.

## A.14 Fused FP8 Autograd Saves the Values Needed by Backward · 融合 FP8 autograd 保存反向需要的值

The fused rowwise FP8 autograd node primarily prevents communication and expert buffers from being reused before backward finishes. When its configurable SwiGLU-recompute mode is enabled, it saves:

融合的 rowwise FP8 autograd 节点主要用来防止通信 buffer 和专家 buffer 在反向结束前被复用. 开启可配置的 SwiGLU 重算模式时, 它保存:

• route maps and route probabilities

• 路由表和路由概率

• optional gathered combine routes for router-probability gradients

• 可选: 为 router 概率梯度保存的 combine 收集路由

• up\_gate\_q/scales for SwiGLU backward and BF16 SwiGLU recompute

• up\_gate\_q/scales, 供 SwiGLU 反向和 BF16 SwiGLU 重算使用

• dispatched input dispatch\_out\_q/scales for up/gate wgrad

• dispatch 后的输入 dispatch\_out\_q/scales, 供 up/gate 的 wgrad 使用

• grouped GEMM offsets

• grouped GEMM 的 offset

In that mode, backward restores BF16 up\_gate, recomputes h = swiglu(up\_gate), and uses the recomputed value for down Wgrad. The configuration default enables this policy, but the production recipe explicitly disables it. Because the choice changes both retained activations and backward work, it is part of the measured workload definition.

在这个模式下, 反向先还原 BF16 的 up\_gate, 重算 h = swiglu(up\_gate), 再用重算的值做 down 的 Wgrad. 配置默认开启这一策略, 但生产配方显式关掉了它. 这个选择同时改变保留的激活和反向的工作量, 所以它属于所测负载定义的一部分.

**Base-transformer recompute alternatives.** Outside the DDP stack described in Table 28, the base transformer additionally exposes module-pattern, operator-save-list, and compiler-budget modes. The operator save list always retains flash-attention outputs (Dao et al., 2022), reduce-scatter results, and the abs/max reductions reused as low-precision amax statistics, and saves every second matrix multiplication. These alternatives are separate from the DDP policies measured in Section 13.

**基础 transformer 的其他重算方式.** 在 Table 28 描述的 DDP 栈之外, 基础 transformer 还提供按模块模式, 按算子保存列表和按编译器预算三种模式. 算子保存列表始终保留 flash-attention 的输出 (Dao et al., 2022), reduce-scatter 的结果, 以及被复用为低精度 amax 统计的 abs/max 归约, 矩阵乘则每隔一个保存一个. 这些方式与 Section 13 测量的 DDP 策略是分开的.

**PP and TBO composition constraint.** The pipeline schedule counts one model forward while two TBO lanes may each acquire a lease (Section 5.7). This report makes no measured claim about the slot-count factor under combined PP and TBO.

**PP 与 TBO 组合时的约束.** 流水线调度把一次模型前向记为一次, 而两条 TBO lane 可能各自申请一个 lease (Section 5.7). 对于 PP 与 TBO 同时开启时 slot 数要乘的倍数, 本报告没有给出实测结论.

<!-- page 143 of 168 -->

## A.15 Some Kernel Prototypes Are Not Integrated · 部分 kernel 原型尚未集成

The table separates the live kernel paths from retained prototypes and identifies the conversion costs that remain in the live path.

下表把正在使用的 kernel 路径与保留下来的原型分开, 并指出在用路径里仍存在的转换开销.

| Boundary | Current path | Prototype or remaining cost |
| --- | --- | --- |
| Weighted FP8 combine back- ward | Integrated weighting plus row quantization avoids a BF16 [N, K, D] intermediate; qdata and scales then use separate PUTs | A direct weighted-quantize+NVSHMEM-PUT kernel exists only as an unwired bench- mark prototype |
| Qdata/scale transport | Separate regular transfers in the integrated path | Paired and packed transfers are benchmark prototypes, not live training |
| Natural-layout MXFP8 grouped Wgrad | Operands dequantize and use BF16 F.grouped_mm | Native MXFP8 grouped Wgrad ex- ists only as a prototype; this report makes no end-to-end claim about it. |
| Scale swizzling and RHS pre- quantization | FP8 reduces payload size but adds separate quantization and scale- layout time, which can dominate small profiles | An RHS cache amortizes only the weight-side conversion; activation- side quantization and layout recur every microbatch |

## A.16 Kernel Profiles Separate Transport and Compute Costs · Kernel profile 把传输开销与计算开销分开

Kernel profiles are interpreted through the following quantities:

解读 kernel profile 时看以下几项:

| Measurement | Why it matters |
| --- | --- |
| Kernel launch count per MoE block | Shows whether fusion reduces Python/autograd fragmentation. |
| Dispatch PUT time | Measures route-indexed one-sided send cost. |
| Gather GET time | Measures remote row pull cost during combine and dispatch backward. |
| Combine reduce time | Separates transport from local weighted reduction. |
| Grouped GEMM time and achieved | Identifies whether expert compute or communication dominates. |
| utilization |  |
| Padding/capacity overhead | Captures wasted grouped GEMM work from routing imbalance. |
| FP8 quantization time | Shows whether reduced communication payload offsets quantization cost. |
| Scale swizzle/layout time | Detects hidden FP8 layout overhead. |
| BF16 Wgrad time in the MXFP8 path | Quantifies the cost of the current non-native MXFP8 Wgrad policy. |
| Peak allocated memory by phase | Connects kernel behavior to lease high-water and PP/recompute pres-sure. |
| Rowwise stream wait time under TBO | Measures whether ordering waits erase overlap. |

## B Reproducible Experiment Configurations and Metrics · 可复现的实验配置与指标

This appendix records the hardware and workloads behind the report’s quantitative results and defines their accounting conventions. Experiment records vary in which configurations, environment details, raw logs, profiles, and plotting sources were retained; the individual descriptions state that coverage. Credentials and secret environment variables are excluded.

本附录记录报告中定量结果背后的硬件和负载, 并定义它们的统计口径. 各项实验保留下来的配置, 环境细节, 原始日志, profile 和绘图源文件不尽相同; 各条描述里写明了覆盖范围. 凭据和保密的环境变量不在其中.

## B.1 Audited Hardware and Software · 审阅过的硬件与软件

Table 45 records the allocation inspected on 2026-07-10, which hosted the profiling and kernel experiments; the production-throughput runs of Section 14 used larger allocations of the same node type (Appendix B.10). These are hardware and link properties, not measured collective bandwidth.

Table 45 记录了 2026-07-10 检查的那批机器, profiling 和 kernel 实验都在上面跑; Section 14 的生产吞吐运行用的是同型节点的更大分配 (Appendix B.10). 表中是硬件与链路的属性, 不是实测的 collective 带宽.

Software-environment fields identify the activated interpreter, PyTorch, NCCL, NVSHMEM, Transformer Engine/torchao, compiler, and extension versions where recorded. A non-login shell can select a different

<!-- page 144 of 168 -->

| Item | Audited value |
| --- | --- |
| Compute | Four homogeneous nodes; eight NVIDIA B300 SXM6 AC GPUs per node; 32 GPUs total |
| GPU memory | 275,040 MiB reported per GPU |
| Driver/toolkit | NVIDIA driver 590.48.01; driver CUDA compatibility 13.1; installed CUDA toolkit 13.0.88 |
| Intra-node fabric | Every GPU pair reported as NV18; 18 links per GPU at 53.125 GB/s per link |
| Inter-node fabric | Eight active nominal 800-Gb/s XDR InfiniBand rails per node, one PXB-local rail aligned with each GPU; additional 100-Gb/s HDR ports present |
| Shared storage | Olmo-core checkout on WekaFS, visible identically from all four nodes |
| Olmo-core | The DDP training stack of this report at the revision audited on 2026-07-10, with a clean working tree |

Python or omit the CUDA toolkit from PATH, so the machine inventory alone does not identify the software that executed a run. Network-interface and HCA selection likewise belongs to the realized launch environment rather than a machine-level default.

软件环境字段记录了激活的解释器, PyTorch, NCCL, NVSHMEM, Transformer Engine/torchao, 编译器和扩展的版本 (有记录的部分). 非登录 shell 可能选中另一个 Python, 或者 PATH 里没有 CUDA toolkit, 所以光看机器清单确定不了一次运行实际用的软件. 网卡和 HCA 的选择同样取决于实际的启动环境, 不是机器层面的默认值.

## B.2 Audited Workload Roles · 审阅过的负载角色

| Role | Model and batch | Topology/precision | Experiment purpose |
| --- | --- | --- | --- |
| Profiling | 8 blocks, 32 routed ex-perts, top-8, d = 1536, sequence 8192, 0.75-Mi-token global batch | EP-MP 8; 1-4 nodes; BF16 rowwise by default; no PP, CP, TP, TBO, or recom-pute | Host-visible route-shape profile; synchronized/rowwise/DeepEP topology comparison; initial multi-node scaling |
| 30-block ref- | 30 blocks, 128 routed ex- | EP-MP 8; BF16 rowwise; | Full-reshard FSDP versus DDP- |
| erence | perts, top-8, d = 1536, se-quence 8192, 18-Mi-token global batch | no PP, CP, TP, TBO, or re-compute in the base recipe | based training; production-scale throughput, efficiency, traffic, variance, and reliability |

## B.3 The Main FSDP Comparison Uses Full Resharding · 主 FSDP 对比使用 full reshard

The main-text FSDP comparison uses the no-PP FSDP2 path with **full resharding**: each wrapped block all-gathers its full weights for forward, reshards them, all-gathers them again for backward, and reducescatters its gradients. This is the minimum-persistent-parameter-memory endpoint compared with Olmo’s DDP path, which keeps each rank’s assigned weights in device memory. FSDP2 can retain unsharded weights through backward or across intermediate accumulation backwards, but the latter policy makes peak parameter memory approach that of the DDP path with sharded optimizer state; it is therefore a mechanism ablation rather than a primary competing design in this report (Zhao et al., 2023; PyTorch Contributors, 2026d).

正文的 FSDP 对比用的是不带 PP 的 FSDP2 路径, 采用 **full reshard**: 每个被包装的 block 在前向时 all-gather 完整权重, 用完重新分片, 反向时再 all-gather 一次, 梯度做 reduce-scatter. 与让每个 rank 的分配权重常驻显存的 Olmo DDP 路径相比, 这是常驻参数显存最小的那一端. FSDP2 也可以在反向期间, 或在中间各次梯度累积的反向之间保留未分片的权重, 但后一种策略会让参数显存峰值接近带分片优化器状态的 DDP 路径; 所以在本报告里它只算机制消融, 不作为主要的竞争设计 (Zhao et al., 2023; PyTorch Contributors, 2026d).

Those retention policies lie between the two endpoints in parameter memory and communication; the main text analyzes only the full-reshard endpoint. FSDP and hybrid sharded data parallelism (HSDP) are also distinct configurations rather than interchangeable labels.

这些保留策略在参数显存和通信量上都介于两个端点之间; 正文只分析 full reshard 这一端. FSDP 和 hybrid sharded data parallelism (HSDP) 也是两种不同的配置, 不能混为一谈.

## B.4 Reduced Profiling Changes the Workload · 缩小后的 profiling 负载已是另一种负载

The 30-block reference recipe and its reduced profiling sibling exercise the same general BF16 rowwise path, but they are different sparse workloads. Based on configuration-derived counts, the reference recipe has

30-block 参考配方和它缩小后的 profiling 版本走的是同一条通用 BF16 rowwise 路径, 但两者是不同的稀疏负载. 按配置推算的数量, 参考配方的规模见下表.

<!-- page 145 of 168 -->

| Quantity | 30-block reference | Profiling workload |
| --- | --- | --- |
| Blocks and width | 30 blocks; first 2 dense, remaining 28 routed; d = 1536 | 8 blocks; first 2 dense, remaining 6 routed; same width and mixer family |
| Routed layer | N = 128, K = 8, routed hidden width 1536, one shared expert | N = 32, K = 8, with the same expert widths and shared branch |
| Routing and capacity | Softmax top-K, normalized route weights, capacity factor 1.25 | Same |
| Sequence and global batch | 8192 tokens; 18 Mi tokens per optimizer step | 8192 tokens; 0.75 Mi tokens per opti-mizer step |
| Configuration-derived size | 26.688B total, 2.906B active | 2.014B total, 0.995B active |
| Parallel/precision path | EP-MP 8; BF16 rowwise; no PP, CP, TP, TBO, or recompute | Same core path, with profiling callbacks and deliberately reduced model and batch |

The Introduction’s wall-time examples came from separate early comparisons in Megatron-LM and legacy Olmo-core. Their complete software and hardware environments have not been reconstructed. They therefore illustrate the observed slowdown that motivated this work, but do not provide a matched cross-framework benchmark.

Introduction 里的墙钟时间例子, 来自早期在 Megatron-LM 和旧版 Olmo-core 上分别做的对比. 它们完整的软硬件环境没有还原. 因此这些例子只说明了促成这项工作的那次观察到的变慢, 不构成条件对齐的跨框架基准.

For the profiling workload, the default rank microbatch is three sequences (24,576 tokens). The 0.75-Mi-token global batch yields four accumulation microbatches on one eight-GPU node and one on the 32-GPU pool. The profiling callbacks, reduced layers/experts, and smaller batch are profiling-specific; the BF16 rowwise routed-token path, EP-MP degree, lack of PP/CP/TP/TBO/recompute, and FP32 gradient and optimizer policy are shared with the 30-block reference.

profiling 负载默认每个 rank 的 microbatch 为 3 条序列 (24,576 个 token). 0.75 Mi token 的全局批, 在一个 8 卡节点上是 4 个累积 microbatch, 在 32 卡池上是 1 个. profiling 回调, 缩减的层数和专家数, 以及更小的批, 是 profiling 专有的; BF16 rowwise 路由 token 路径, EP-MP 度数, 不开 PP/CP/TP/TBO/重算, 以及 FP32 梯度与优化器策略, 都与 30-block 参考配方相同.

## B.5 Captured Submission-Regime Profiles · 采集到的两种提交模式 profile

Section 8.1 describes two submission regimes: a host wait inside every routed block that holds the CPU and GPU in lock step, and a synchronization-free path in which the CPU runs ahead of the device. Figure 74 shows one captured Nsight Systems timeline for each regime, and Figure 75 magnifies their GPU kernel rows.

Section 8.1 描述了两种提交模式: 一种是每个路由块里都有一次 host 等待, CPU 必须等待 GPU 完成对应工作; 另一种是无同步路径, CPU 可以跑在设备前面. Figure 74 给出两种模式各一条采集到的 Nsight Systems 时间线, Figure 75 放大了它们的 GPU kernel 行.

## B.6 Verifying the Sync-Free Path · 验证无同步路径

To check the sync-free property described in Section 8.5, we inspect the executed timeline. A qualifying steady-state trace contains no blocking D2H call and no submission-bound idle interval, which is what the captured pair in Figures 74 and 75 shows for the rowwise path. Step time alone cannot identify a submission problem. A useful profile reports CPU API and framework time, GPU kernel and communication time, the distance from CPU launch to GPU start, GPU idle intervals, blocking D2H calls, and end-to-end tokens/s, aligned at both the kernel level and larger NVTX ranges such as a transformer block or microbatch. PyTorch provides an experimental synchronization debug mode, but its coverage is incomplete for distributed and sparse operations; it is an audit aid rather than a substitute for a timeline (PyTorch Contributors, 2026l).

要检查 Section 8.5 所说的无同步性质, 我们直接看执行时间线. 合格的稳态 trace 里没有阻塞的 D2H 调用, 也没有因提交跟不上造成的空闲区间; Figures 74 和 75 中 rowwise 路径的那对采集结果正是如此. 只看 step 时间判断不出提交问题. 有用的 profile 要报告 CPU API 和框架时间, GPU kernel 和通信时间, 从 CPU 发射到 GPU 开始执行的间隔, GPU 空闲区间, 阻塞的 D2H 调用, 以及端到端 tokens/s, 并且在 kernel 粒度和更大的 NVTX 范围 (如一个 transformer block 或一个 microbatch) 上都对齐. PyTorch 提供了一个实验性的同步调试模式, 但它对分布式和稀疏操作覆盖不全; 它只能辅助审查, 不能代替时间线 (PyTorch Contributors, 2026l).

A standalone single-GPU grouped-linear microbenchmark from the MXFP8 study (Section 11) isolates the submission tax that this checklist is meant to expose. Graph replay appears in this report only as a measuring instrument; the production training path never captures or replays a graph (Section 15.6). Table 48 compares ordinary eager submission with CUDA Graph replay for a locally adapted OLMoE-family benchmark (Muennighoff et al., 2024). Its 1536 → 3072 up projection and 16 balanced local expert groups are settings of this single-B300 benchmark, not the published OLMoE configuration. “Prequantized” begins with MXFP8

MXFP8 研究 (Section 11) 中有一个独立的单 GPU grouped-linear 微基准, 它单独测出了这份检查清单要暴露的提交开销. graph replay 在本报告里只作测量工具; 生产训练路径从不捕获也不 replay graph (Section 15.6). Table 48 在一个本地改编的 OLMoE 系列基准上, 比较普通 eager 提交与 CUDA Graph replay (Muennighoff et al., 2024). 其中 1536 → 3072 的 up 投影和 16 个均衡的本地专家组, 是这个单 B300 基准的设置, 不是已发表的 OLMoE 配置.

<!-- page 146 of 168 -->

![Image block](images/p146-image.jpg)

![Image block](images/p146-figure-74-captured-timelines-show-the-two-submission-regimes.jpg)

(a) Synchronized EP8 path.

(b) Rowwise EP8 path.

Figure 74 Captured timelines show the two submission regimes. Both Nsight Systems profiles run the same eight-layer development model (128 routed experts, top-8, one shared expert, EP8, BF16, two sequences per rank microbatch) on eight B300 $\mathrm { G P U s } ;$ only the expert-parallel path differs. This capture predates and differs from the reduced profiling workload of Table 46. In the synchronized trace (a), the per-block host wait appears as cudaEventSynchronize in the CUDA API lane, the CPU and GPU ranges of each forward block stay in lock step, and the GPU kernel rows show recurring gaps. In the rowwise trace (b), no host wait interrupts submission: the CPU finishes submitting the microbatch while the GPU is still executing earlier work, and the GPU-side forward blocks run back to back. Each panel is one captured instance of one rank; the two traces are separate runs, so this figure illustrates the submission mechanism rather than a controlled throughput comparison.

input; “including $\mathrm { Q } ^ { \prime \prime }$ also charges the activation-quantization (Q) step. Every number is a speedup over the matching BF16 grouped GEMM.

「Prequantized」一列的输入已经是 MXFP8; 「including Q」一列把激活量化 (Q) 这一步也算进时间. 每个数都是相对同形状 BF16 grouped GEMM 的加速比.

At $M = 1 2 8 ,$ the captured device sequence is more than $2 \times$ faster than the BF16 baseline while ordinary eager execution is slower. At $M = 3 2 { , } 7 6 8 { , }$ , the eager and graph results converge. The convergence indicates that host submission affects short-operator timings. The eager–graph gap is still not a clean measure of

<!-- page 147 of 168 -->

![Image block](images/p147-a-synchronized-ep8-path.jpg)

(a) Synchronized EP8 path.

![Image block](images/p147-b-rowwise-ep8-path.jpg)

(b) Rowwise EP8 path.

|  | Prequan | tizedinput | Inclu | dingQ |
| --- | --- | --- | --- | --- |
| RowsM | Eager | Graph | Eager | Graph |
| 128 | 0.66× | 2.17× | 0.34× | 2.03× |
| 4,096 | 0.65× | 1.26× | 0.32× | 1.06× |
| 32,768 | 1.43× | 1.42× | 1.21× | 1.22× |

CPU launch time: replay changes the cache regime and excludes graph-launch latency, and the benchmark omits routing, communication, autograd, and the rest of the training step. The relevant end-to-end metric therefore remains eager training wall time.

在 $M = 128$ 时, 捕获成 graph 的设备端序列比 BF16 基线快 2 倍以上, 普通 eager 执行反而更慢. 到 $M = 32{,}768$, eager 与 graph 的结果趋于一致. 这种收敛说明 host 端提交会影响短算子的计时. 不过 eager 与 graph 的差距仍不能干净地度量 CPU launch 时间: replay 改变了缓存状态, 也不计 graph launch 的延迟; 而且这个基准不含路由, 通信, autograd 和训练步的其余部分. 所以相关的端到端指标仍是 eager 训练的墙钟时间.

> **看表:** 页 147 的表里, $M = 128$ 时「含 Q」的 eager 只有 0.34×, graph 却有 2.03×; 激活量化在 eager 下为什么这么贵?
> 答: 同一行里, 预量化输入的 graph 是 2.17×, 含 Q 的 graph 是 2.03×, 说明 GPU 上真正花在激活量化上的时间很少. eager 下从 0.66× 掉到 0.34×, 几乎慢了一倍, 多出来的主要是量化 kernel (算 block scale, 写 qdata) 在 host 端的 launch: $M = 128$ 时每个 kernel 的 GPU 时间很短, 提交开销占了大头, graph replay 正好把这部分去掉. 到 $M = 32{,}768$, 从预量化到含 Q, eager 是 1.43× 降到 1.21×, graph 是 1.42× 降到 1.22×, 两种执行方式降幅一致, 说明这时量化的代价是真实的 GPU 时间, 含 Q 的总时间里约 15% 花在量化上. 量化具体拆成几个 kernel, 报告这一段没写.

Removing the split-list round trip is also only one side of the trade-off: direct row movement adds its own route construction, capacity storage, and completion costs. Several experiments examine different parts of that trade-off. The profiled example of Section 5.4 localizes the shorter dispatch-and-combine path, the captured timelines above show the two submission regimes, the microbenchmark isolates the submission tax on short expert operations, and the feasibility point of Table 6 shows one complete operating point without attributing its throughput to a single mechanism.

去掉 split-list 的往返也只是取舍的一面: 直接搬运行 (row) 有它自己的开销, 包括构造路由, 存放 capacity 和完成通知. 几组实验分别考察这笔取舍的不同部分. 第 5.4 节的 profile 例子定位到更短的 dispatch-combine 路径; 上面捕获的时间线展示两种提交方式; 微基准单独测出短 expert 算子上的提交开销; Table 6 的可行性点给出一个完整的工作点, 但不把它的吞吐归到某一个机制上.

## B.7 Checkpoint-Branched LBL-Coefficient Runs · 从 checkpoint 分叉的 LBL 系数对照 run

Figures 45 and 46 derive from archived metric histories of two trajectories of the production pretraining project. The experiment package bundled with this report holds the run manifests with full effective configurations, the merged metric histories and their merge report, and the plotting script.

图 45 和图 46 来自生产预训练项目中两条轨迹的归档指标历史. 随本报告发布的实验包里有: 带完整生效配置的 run manifest, 合并后的指标历史及合并报告, 以及绘图脚本.

• **Model.** 48 transformer blocks at $d _ { \mathrm { m o d e l } }   =   2 0 4 8 ;$ block 0 is dense, and each of the 47 MoE blocks uses 64 experts, top-4 selection, sigmoid gating, dropless dispatch, and expert hidden size 2048; grouped-query attention (Ainslie et al., 2023) with 16 query and 4 key/value heads; dolma2 tokenizer (Allen Institute for AI, 2024).

• **模型.** 48 个 transformer block, $d_{\mathrm{model}} = 2048$; block 0 是稠密层, 其余 47 个 MoE block 各有 64 个 expert, top-4 选择, sigmoid 门控, dropless dispatch, expert 隐藏维度 2048; 使用 grouped-query attention (Ainslie et al., 2023), 16 个 query 头, 4 个 key/value 头; tokenizer 为 dolma2 (Allen Institute for AI, 2024).

<!-- page 148 of 168 -->

• **Data and batch.** OLMo-mix-0625 at sequence length 8,192; global batch 4,194,304 tokens per step.

• **数据与 batch.** OLMo-mix-0625, 序列长度 8,192; 全局 batch 为每步 4,194,304 个 token.

• **Objective.** Instance-granularity LBL without per-layer rescaling; LM-head z-loss 10<sup>−5</sup>; router z-loss disabled. The branched quantity is the LBL coefficient: 0.05 on the original trajectory and 0.005 on the branch.

• **目标函数.** instance 粒度的 LBL, 不做逐层缩放; LM head 的 z-loss 系数为 $10^{-5}$; 关闭 router z-loss. 分叉时改的量是 LBL 系数: 原轨迹为 0.05, 分支为 0.005.

> **拆开:** 「instance 粒度, 不做逐层缩放」意味着 0.05 这个系数实际作用在多大的总损失上?
> 答: 看 `src/olmo_core/nn/moe/router.py` 的 `forward`: 每个 MoE 层的 router 各自算一份 `lb_loss`, 乘同一个 `lb_loss_weight` 后作为该层的 aux loss 返回, 没有按层数做除法. 所以 47 个 MoE block 的 LBL 是累加的. 如果各层 LBL 量级相近, 0.05 换成「按层平均」的口径约等于 2.35, 分支的 0.005 约等于 0.235; 同一个系数也就不能直接搬到层数不同的模型上. instance 粒度在 `src/olmo_core/nn/moe/loss.py` 里是按 batch 维逐条序列统计 expert 负载 (`batched_batch_size_per_expert`, 开 CP 时先在 CP 组内 all-reduce), 约束比按整个本地 batch 统计更紧. 两种粒度对第 10 节结论有什么影响, 本附录没写.

• **Optimizer.** Skip-step AdamW (Loshchilov and Hutter, 2019) at learning rate $3   \times   1 0 ^ { - 5 }$ with betas (0.9, 0.95), weight decay 0.1 (zero on embeddings), a warmup–stable–decay schedule (Hu et al., 2024; Hägele et al., 2024) with a 2,000-step warmup, and gradient clipping at norm 1.

• **优化器.** Skip-step AdamW (Loshchilov and Hutter, 2019), 学习率 $3 \times 10^{-5}$, betas 为 (0.9, 0.95), 权重衰减 0.1 (embedding 上为 0), warmup-stable-decay 调度 (Hu et al., 2024; Hägele et al., 2024), warmup 2,000 步, 梯度按范数 1 裁剪.

• **Execution.** HSDP data parallelism with BF16 parameters; FP8 is disabled. These trajectories run the production pretraining stack rather than the expert-parallel paths of this report; the two branches differ only in the LBL coefficient, and no systems claim rests on them.

• **执行.** HSDP 数据并行, 参数为 BF16; 不开 FP8. 这两条轨迹跑在生产预训练栈上, 没有走本报告的 expert 并行路径; 两个分支只差 LBL 系数, 报告中没有任何系统层面的结论依赖它们.

• **Branch protocol.** The branch reloads the original run’s model and optimizer checkpoint at step 17,000 (71.3 billion tokens) and changes only the coefficient. The archive covers steps 1–25,669 of the original run and 17,001–81,084 of the branch. The Section 10 windows compare medians over steps 17,001–17,999 and 24,000–25,669, before the branch’s batch-size transition at step 40,000.

• **分叉方式.** 分支在第 17,000 步 (71.3B token) 载入原 run 的模型与优化器 checkpoint, 只改系数. 归档覆盖原 run 的第 1–25,669 步和分支的第 17,001–81,084 步. 第 10 节比较的两个窗口取第 17,001–17,999 步和第 24,000–25,669 步的中位数, 都在分支于第 40,000 步切换 batch size 之前.

## B.8 Batch-Size Warmup Run · batch size warmup 的 run

This subsection records the training run behind Figure 66 in Section 16.

本小节记录第 16 节图 66 背后的训练 run.

• **Model.** 24 transformer blocks; 48 routed experts with top-4 selection and one shared expert; 3.21B active and 23.10B total parameters.

• **模型.** 24 个 transformer block; 48 个 routed expert, top-4 选择, 外加 1 个 shared expert; 激活参数 3.21B, 总参数 23.10B.

• **Batch schedule.** The global batch increases through 1, 2, 3, 6, 9, 15, and 24 Mi tokens over approximately 2.07 trillion training tokens; the later transitions fall near 409B, 777B, and 1.375T cumulative tokens.

• **batch 调度.** 在约 2.07T 训练 token 内, 全局 batch 依次增大为 1, 2, 3, 6, 9, 15, 24 Mi token; 后面几次切换大约发生在累计 409B, 777B 和 1.375T token 处.

• **Learning rate.** Square-root batch scaling (Equation 63 with $\alpha = { \textstyle { \frac { 1 } { 2 } } ) }$ applied at each batch increase.

• **学习率.** 每次增大 batch 时, 学习率按 batch 的平方根缩放 (式 63, 取 $\alpha = \frac{1}{2}$).

• **Provenance.** The figure stitches 26 run segments of one training campaign from its archived metric histories; at every overlapping step the newest segment’s value is retained. The artifact bundled with this report contains the raw exported metric histories, a per-segment run manifest, the stitched and plotted series, and the scripts that regenerate the figure from the archive alone.

• **来源.** 该图把同一次训练中 26 段 run 的归档指标历史拼接起来; 步数重叠处保留最新一段的值. 随报告发布的产物包含原始导出的指标历史, 每段的 run manifest, 拼接后实际绘图的序列, 以及只凭归档就能重新生成该图的脚本.

• **Scope.** The bundle preserves metric histories and figure provenance. The resolved optimizer configuration lives in the serialized run configurations of the underlying segments and is not re-audited here.

• **范围.** 这个产物包保存的是指标历史和图的来源. 解析后的优化器配置存放在各段 run 的序列化配置里, 这里没有重新审查.

## B.9 Experiment Artifact Contents · 实验产物包含的内容

The following fields describe the configuration and evidence relevant to replicating a run. They define how this report describes its experiment records, not a claim that every archived artifact contains every field. Availability is stated with each experiment.

下面这些字段描述复现一个 run 所需的配置和证据. 它们规定本报告用什么口径描述实验记录, 并不表示每份归档产物都包含全部字段. 哪些字段可得, 随各个实验分别说明.

• **Provenance.** Repository and dependency revisions, patch/diff, command, run name, and configuration after all overrides;

• **来源.** 仓库及依赖的版本, patch/diff, 启动命令, run 名称, 以及所有覆盖项生效后的配置;

• **Model and workload.** Total and active parameters, layers, mixers, experts, top-K, shared experts, capacity/drop policy, sequence, local/global useful batch, and random seeds;

• **模型与负载.** 总参数和激活参数, 层数, mixer, expert 数, top-K, shared expert, capacity/丢弃策略, 序列长度, 本地/全局有效 batch, 以及随机种子;

• **Topology.** Nodes/GPUs and DP, CP, EP-DP, EP-MP, PP, VPP, microbatch, accumulation, and schedule;

• **拓扑.** 节点/GPU 数, 以及 DP, CP, EP-DP, EP-MP, PP, VPP, microbatch, 梯度累积和调度;

• **Precision and layout.** Parameter, activation, accumulation, reduction, optimizer, communication, cache, and checkpoint dtypes and layouts;

• **精度与布局.** 参数, 激活, 累加, 规约, 优化器, 通信, 缓存和 checkpoint 各自的 dtype 与布局;

• **Environment.** GPU clocks/power mode, driver/toolkit, activated software versions, NCCL/NVSHMEM interfaces and HCAs, compiler/cache controls, and relevant non-secret environment;

• **环境.** GPU 时钟/功耗模式, 驱动/工具链, 实际启用的软件版本, NCCL/NVSHMEM 使用的网络接口和 HCA, 编译器/缓存控制, 以及相关的非机密环境变量;

• **Measurement protocol.** Data-prewarm, compile, symmetric-pool prewarm, warmup, measured steps, repetitions, synchronization points, exclusions, and failure/retry policy;

• **测量协议.** 数据预热, 编译, 对称内存池预热, warmup, 计入测量的步数, 重复次数, 同步点, 剔除规则, 以及失败/重试策略;

• **Raw outputs.** Raw logs, rank-level metric tables, profiler captures, allocator traces, checkpoint metadata, and plotting scripts.

• **原始输出.** 原始日志, rank 级指标表, profiler 抓取结果, 分配器 trace, checkpoint 元数据和绘图脚本.

<!-- page 149 of 168 -->

The effective serialized configuration, rather than the command string alone, determines the realized topology and workload after command-line overrides.

实际拓扑和负载由命令行覆盖之后的有效序列化配置决定, 单看命令字符串不够.

## B.10 Production-Throughput Run Details · 生产吞吐 run 的细节

This subsection is the run-level companion to Table 30. All rows use sequence length 8192, top-4 routing, and one shared expert. The main table selects one random-routing systems reference per operating point; the tables below preserve the learned-routing companions and the alternate batches and topologies. A trackingsystem status of “crashed” for these short systems runs can reflect manual termination after the desired observations and is not, by itself, evidence that training failed.

本小节是 Table 30 在 run 层面的配套材料. 所有行的序列长度都是 8192, top-4 路由, 1 个 shared expert. 主表在每个工作点只选一个随机路由的系统参照; 下面两张表保留了学习路由的配套 run, 以及换了 batch 或拓扑的备选 run. 这些短时系统 run 在跟踪系统里的状态如果是「crashed」, 可能只是拿到所需观测后被手动终止, 单凭这一点不能说明训练失败.

| Configuration | Model | Batch and scale | Parallel topology | Numeric/runtime path |
| --- | --- | --- | --- | --- |
| Tiny-64E, no EP | 16 layers; 64 routed experts; 1.59B active, 12.91B total | GBS 8 Mi; rank microbatch 65,536; 2 nodes, 16 B300s | 16 / 16 / 1 / 1 | BF16; no recompute; local expert execution |
| Tiny-64E, EP8 | Same model as Tiny-64E, no EP | GBS 8 Mi; rank microbatch 65,536; 2 nodes, 16 B300s | 16 / 2 / 8 / 1 | BF16; rowwise NVSHMEM; no recompute |
| Small-64E, 24 Mi | 32 layers; 64 routed experts; 4.29B active, 40.86B total | GBS 24 Mi; rank microbatch 24,576; 16 nodes, 128 B300s | 128 / 16 / 8 / 1 | BF16; rowwise NVSHMEM; no recompute |
| Small-64E, 16 Mi | Same Small-64E model | GBS 16 Mi; rank microbatch 16,384; 16 nodes, 128 B300s | 128 / 16 / 8 / 1 | BF16; rowwise NVSHMEM; no recompute |
| Medium-64E | 39 layers; 64 routed experts; 7.37B active, 70.22B total | GBS 16 Mi; rank microbatch 16,384; 16 nodes, 128 B300s | 64 / 8 / 8 / 2 | BF16; rowwise NVSHMEM; no recompute |
| Medium-96E | 39 layers; 96 routed experts; 7.38B active, 103.75B total | GBS 24 Mi; rank microbatch 16,384; 16 nodes, 128 B300s | 64 / 8 / 8 / 2 | BF16; rowwise NVSHMEM; no recompute |
| Medium-128E | 39 layers; 128 routed experts; 7.38B active, 137.27B total | GBS 24 Mi; rank microbatch 16,384; 16 nodes, 128 B300s | 32 / 4 / 8 / 4 | BF16; rowwise NVSHMEM; no recompute |
| Large-128E, PP4 | 47 layers; 128 routed experts; 15.14B active, 295.99B total | GBS 32 Mi; rank microbatch 8192; 64 nodes, 512 B300s | 128 / 16 / 8 / 4 | BF16; rowwise NVSHMEM; no recompute |
| Large-128E, PP8 | Same Large-128E model | GBS 24 Mi; rank microbatch 8192; 64 nodes, 512 B300s | 64 / 8 / 8 / 8 | BF16; rowwise NVSHMEM; no recompute |
| Ultra-128E | 63 layers; 128 routed experts; 58.36B active, 1.200T total | GBS 64 Mi; rank microbatch 8192; 64 nodes, 512 B300s | 64 / 8 / 8 / 8 | MXFP8 attention and MLP compute; rowwise NVSHMEM; per-layer recompute |
| Ultra-256E | 63 layers; 256 routed experts; 58.41B active, 2.380T total | GBS 64 Mi; rank microbatch 16,384; 64 nodes, 512 B300s | 64 / 2 / 32 / 8 | MXFP8 attention and MLP compute; DeepEP v2; per-layer recompute |

<!-- page 150 of 168 -->

| Configuration | Routing | TFLOP/s/GPU | Observation and use |
| --- | --- | --- | --- |
| Tiny-64E, no EP | Learned | 895 | Began near 870 and stabilized after roughly 100 steps; learned-routing companion |
| Tiny-64E, no EP | Random | 903 | Headline; random-routing curve was nearly stable from the first step |
| Tiny-64E, EP8 | Learned | 820 | Began near 799, then stabilized; retained as the learned EP8 companion |
| Small-64E, 24 Mi | Learned | 768 | Learned-routing companion |
| Small-64E, 24 Mi | Random | 841 | Headline |
| Small-64E, 16 Mi | Random | 821 | Alternate smaller GBS and rank microbatch; not a repeat of the 24-Mi run |
| Medium-64E | Random | 853 | Headline |
| Medium-96E | Random | 855 | Headline |
| Medium-128E | Random | 843 | Headline |
| Large-128E, PP4 | Random | 768 | Headline |
| Large-128E, PP8 | Random | 757 | Alternate PP8 and 24-Mi GBS; not a repeat of the headline run |
| Ultra-128E | Random | 858 | Headline |
| Ultra-256E | Random | 689 | Headline short-run observation; nine steps and no stabilized plateau |

Slower launches of the Medium-96E and Medium-128E configurations are omitted from the headline selection. Environmental problems were suspected, but the specific cause was not established. The headline table reports the highest rate observed for each configuration, which is neither a repetition mean nor an estimate of the hardware limit.

Medium-96E 和 Medium-128E 有几次启动跑得较慢, 没有选进主表. 怀疑是环境问题, 但没有查明具体原因. 主表报告的是每个配置观测到的最高速率, 它既不是多次重复的均值, 也不是对硬件上限的估计.

> **问:** 主表用随机路由的 run 当 headline, 它和学习路由的差距说明什么?
> 答: `src/olmo_core/nn/moe/router.py` 的 `forward` 里, `random_expert_assignment` 打开时执行 `scores = scores * 0 + torch.rand_like(scores)`: router 仍在 autograd 图里, 计算和通信的形状不变, 只是 top-K 的落点变成与 token 无关的均匀随机. 均匀随机让各 expert 和各 EP rank 的负载近似均衡, 所以 headline 测的是负载均衡时的系统吞吐. 第二张表里能配对的两组: Tiny-64E 无 EP 是 903 对 895, 差不到 1%; Small-64E 24 Mi (EP8) 是 841 对 768, 学习路由低约 9%. 无 EP 时负载不均只改变本地 grouped GEMM 的形状; 开 EP8 后, 负载最重的 rank 还会拖长 dispatch/combine 和 expert 计算, 其他 rank 要等它, 差距随之放大. 因此 headline 更接近「路由均衡时的上界」, 真实训练的吞吐取决于学到的路由有多均衡, 也和第 10 节的 LBL 设置有关. 更大的配置上学习路由会差多少, 报告里没写.

## B.11 Metrics Track Useful Work, Time, and Memory · 指标跟踪有效工作量, 时间与内存

Table 51 defines the quantities used to compare useful work, time, and memory. Each experiment specifies which metrics and supplemental diagnostics were retained; a definition here does not imply that the quantity was measured in every run.

Table 51 定义了比较有效工作量, 时间和内存时用到的各个量. 每个实验会说明保留了哪些指标和辅助诊断; 这里给出定义, 不代表每个 run 都测了这个量.

For an optimizer step with $F _ { \mathrm { s t e p } }$ useful model FLOPs, elapsed time $T _ { \mathrm { s t e p } }$ in seconds, and G GPUs, the report uses

对一个优化器步, 设有效模型 FLOPs 为 $F_{\mathrm{step}}$, 耗时为 $T_{\mathrm{step}}$ 秒, GPU 数为 $G$, 本报告使用:

$$
\mathrm{MFU} _ {\mathrm{BF16-ref}} = \frac {F _ {\mathrm{step}}}{G T _ {\mathrm{step}} C _ {\mathrm{BF16}}}, \qquad C _ {\mathrm{BF16}} = 2. 2 5 \times 1 0 ^ {1 5} \mathrm{FLOP/s} \quad \text {per B300 GPU}.\tag{95}
$$

This is the dense BF16 Tensor Core peak, not NVIDIA’s doubled 2:4-sparse peak (NVIDIA, 2026r); selecting a subset of experts does not make their weight matrices 2:4 sparse. The numerator counts active-model work, excluding activation recomputation, while elapsed time includes the complete step. We retain this BF16 reference for MXFP8 runs so the normalization is consistent; those values are not utilization of the FP8 peak.

$C_{\mathrm{BF16}}$ 是稠密 BF16 Tensor Core 峰值, 不是 NVIDIA 翻倍后的 2:4 稀疏峰值 (NVIDIA, 2026r); 只选一部分 expert, 并不会让它们的权重矩阵变成 2:4 稀疏. 分子只计激活模型的工作量, 不含激活重算; 耗时则包含整个训练步. MXFP8 的 run 也沿用这个 BF16 参照, 保证归一化口径一致; 这些值不能读作 FP8 峰值的利用率.

> 答: 按式 (95), 858 / 2250 ≈ 38.1% 的 BF16 参照 MFU. B.10 第一张表里 Ultra-128E 开了逐层重算, 反向之前要把每层的前向再算一遍. 按「前向 1 份, 反向 2 份」的常用比例粗估, 实际执行的矩阵乘约为有效工作量的 4/3, 即约 1144 TFLOP/s/GPU, 合 BF16 峰值的 51% 左右. 对照 Medium-64E 的 853: 它是 BF16, 不重算, 853 就是实际执行量. 两行数字接近, 但 Ultra-128E 背后硬件多做了约三分之一的工作, 而且它的 attention 和 MLP 矩阵乘走 MXFP8, 相对 FP8 峰值的利用率还会更低. 4/3 这个系数是按经验比例估的, 逐层重算是否覆盖 attention 内部, 报告里没写, 只是从已知数字推出的说法, 没有数据验证.

<!-- page 151 of 168 -->

| Metric | Definition |
| --- | --- |
| Steady-state step time | Wall time from the start of an optimizer step's first forward to completion of optimizer update and required cache refresh, after declared startup/warmup. Depending on the retained samples, summaries may include median, mean, standard deviation, and tails |
| Useful tokens/s/GPU | Global non-padding tokens contributing to the normalized loss per measured step, divided by synchronized step time and GPU count; capacity-dropped routes are a separate quantity rather than silently removed |
| Useful-model MFU | Useful active-model FLOPs divided by elapsed time, GPU count, and the stated per-GPU compute peak. Sections 2 and 14 use the B300 dense BF16 peak of 2250 TFLOP/s/GPU for every row, including MXFP8, and label this common BF16-reference normalization explicitly. It is not utilization of the FP8 peak. Recompute and inactive experts add no useful FLOPs to the numerator |
| D2H route-shape wall time | Count and duration of host waits/copies causally between router metadata production and dependent dispatch/compute launches, plus the corresponding CPU launch gap and GPU idle interval from the same timeline |
| Communication exposure | Dispatch/combine or weight/gradient communication time not hidden by useful compute, with bytes, primitive, process group, and forward/backward scope identified |
| Route/drop statistics | Offered and accepted assignments, total and per-source drop rate, per-expert load distribution, capacity utilization, and rank skew |
| Peak device memory | Maximum allocated and reserved bytes per rank after a declared reset point. Supplemental diagnostics, where recorded, give max/median ranks and whether compiler/graph memory pools, symmetric pools, derived caches, and checkpoint staging were allocated at reset and remained allocated through the measured window |
| Lease high-water | Maximum concurrently checked-out saved-payload slots by block/payload/pipeline part. A schedule-derived prediction and transient shared scratch usage are separate diagnostics where available |
| Checkpoint peak/time | Pre-save and peak allocated/reserved bytes, and elapsed save or load time. Supplemental diag-nostics include bytes written/read, retries, and caches allocated at the measurement boundary, where recorded |
| Scaling efficiency | Measured useful throughput relative to the declared one-node or smallest valid topology refer-ence under a stated strong/weak-scaling batch rule; rank variance is a supplemental diagnostic where recorded |

## C Glossary of Parallelism, Routing, and Training Storage · 并行, 路由与训练存储术语表

The same object can have a model meaning, a runtime placement, and a checkpoint representation. This glossary fixes the terms used for those layers.

同一个对象可能同时有模型上的含义, 运行时的放置方式和 checkpoint 中的表示. 这份术语表规定了这几层分别用什么术语.

## C.1 Parallel Dimensions and Mesh Axes · 并行维度与 mesh 轴

| Term | Meaning |
| --- | --- |
| P / PP | Pipeline degree. PP partitions layers and changes execution order, not which data-parallel ranks replicate each parameter. |
| D / DP | Dense data-parallel degree. With CP, ordinary dense gradients reduce over tchaetefdolodveedr DDPP×aCnPd dreupplliiccaatpeodoal;crdoesnsseCPop. timizer state is sharded or repli- |
| C / CP | Context-parallel degree. CP shards sequence before the PP schedule and participates in the folded expert pool. |
| D<sub>E</sub> / EP-DP | Expert replica degree. Ranks on this axis hold the same local EP-MP expert shard and reduce its ordinary gradients together. |
| M<sub>E</sub> / EP-MP | Expert-sharding degree. Ranks on this axis hold different routed-expert shards; it is not a gradient all-reduce group. |
| EP | Expert parallelism, used generically for distributing routed experts and mov-ing token rows to ranks that store the selected experts. |

<!-- page 152 of 168 -->

| Term | Meaning |
| --- | --- |
| TP | Tensor parallelism, which partitions individual parameter tensors and their operations. |
| dense mesh | Device-mesh view (pp?, dp, cp?). |
| MoE mesh | View of the same ranks as (pp?, ep_dp, ep_mp). Within a PP stage, DC = D<sub>E</sub>M<sub>E</sub>. |

## C.2 Model Capacity and Routing Quantities · 模型容量与路由相关的量

| Symbol or term | Meaning |
| --- | --- |
| d / d_model | Transformer hidden width. |
| h<sub>e</sub> | Routed expert intermediate width. |
| N / num_experts | Total routed-expert count in an MoE layer. |
| K / top_k | Number of routed experts selected per token. |
| S | Sequence length before context-parallel sharding. |
| T | Number of input tokens before top-K expansion and capacity handling. |
| B / m | Useful tokens processed per rank in one optimizer step / number of micro-batches in that step, when used in the cost ledger before model parallelism. |
| num_local_experts | Routed experts stored on one EP-MP rank, normally N/M<sub>E</sub>. |
| active parameters P<sub>active</sub> | Parameters used by one token; routed expert work scales with K, not N. |
| total parameters P<sub>total</sub> | Full persistent parameter pool; optimizer tensors and checkpoint size scale with this quantity. |
| P<sub>local</sub> | Parameter capacity held by one rank after PP and EP placement. This is neither the model-wide total parameter count nor the per-token active pa-rameter count. |
| PE / Pdens<sub>e</sub> | Routed-expert and dense (non-expert) parameter counts of the whole model; one rank holds about PE/ME of the expert part. |
| expert activation ratio α<sub>E</sub> | Fraction of routed experts selected for one token, K/N. |
| parameter activation ratio α<sub>P</sub> | Fraction of total model parameters active for one token, P<sub>a</sub>ctive/Ptota<sub>l</sub>. It generally differs from α<sub>E</sub> because part of the model is always active. |
| Γ<sub>capacity</sub> | Model-wide capacity-to-active gap, Ptotal/Pactive = 1/αP. It is not itself an overhead or a conversion from bytes or launches to elapsed time. |
| routed experts | Sparse branch selected by the router and partitioned over EP-MP. |
| shared expert | Always-active branch that remains in the dense parameter family. |
| router | Projection and policy producing selected expert indices, route weights, and load-balancing metadata. |
| expert offsets/counts | GPU or host metadata delimiting unequal per-expert row ranges for grouped computation. |

## C.3 Runtime Buffers and Reuse Terms · 运行时缓冲区与复用术语

| Term | Meaning |
| --- | --- |
| persistent training state | Compute weights, accumulated gradients, FP32 main weights, and optimizer states that must remain available across microbatches or update boundaries. |
| execution working memory | Activations, routing and communication buffers, and workspaces used by execution. A preallocated fixed-address buffer can still belong to this class. |
| static placement / shape | A stable placement, buffer identity or address, capacity, shape, or graph structure. Static values need not be immutable. |
| symmetric memory | Collectively established storage that ranks in one team can address through one-sided operations. |
| Olmo symmetric memory | Current rowwise backend built around Olmo's CUDA/NVSHMEM wrapper rather than the legacy Torch symmetric-memory path. |

<!-- page 153 of 168 -->

| Term | Meaning |
| --- | --- |
| dispatch / combine | Movement from token order to expert-buffer order / return and router-weighted accumulation into token order. |
| lease | Reservation of a symmetric payload that must remain valid for a later back-ward. Autograd releases it after the consumer finishes. |
| shared transient slot | Bounded scratch reused across blocks or lanes; its existence does not indi-cate when a saved payload may be overwritten. |
| fixed per-block cache | Stable cached storage used when sharing is disabled or unsafe; a cache hit alone does not show that backward has finished with the previous contents. |
| high-water | Maximum simultaneous live payload count predicted or observed for a stage and storage family. |
| qdata-scale payload | One MXFP8 value represented by quantized data and its block scales. Both components must remain valid and be released together. |
| BF16 anchor | Temporary initialization value and cache seed for an FP8WeightStore-backed parameter. It may be released after optimizer setup and is not an independent checkpoint source. |
| MXFP8 compute-weight | Derived orientation-specific qdata/scale compute weight, refreshed from the |
| cache | FP32 main weight. |
| MXFP8 runtime payload | Derived qdata/scale representation for activation or communication data. |

## C.4 Optimizer and Checkpoint Terms · 优化器与 checkpoint 术语

| Term | Meaning |
| --- | --- |
| MultiGroupDistributedData | Olmo reducer assigning a process group per parameter family and keeping |
| Parallel | persistent bucket views. |
| dense bucket | Gradient bucket reduced over the folded DP×CP replica group. |
| expert bucket | Routed-expert bucket reduced over EP-DP, the group holding replicas of the same expert shard. |
| OLMoDDPOptimizer | Olmo optimizer that manages FP32 main weights, optimizer states, gradient intake, global gradient norm, copy-back, and checkpoint views. |
| compute weight | Weight representation consumed by forward or backward computation: a BF16 tensor for an ordinary parameter or a derived, orientation-specific MXFP8 qdata/scale cache for a selected linear. |
| FP32 main weight | FP32 parameter value updated by the optimizer and used to refresh its com-pute weights. |
| main_grad | Optimizer-facing high-precision gradient slice. |
| copy-back | Reconstruction of compute weights after a successful update or load. |
| FP8WeightStore | Trainable FP8-weight interface with high-precision gradients and de-rived orientation-specific MXFP8 compute-weight caches; not an FP8 nn.Parameter. |
| checkpoint-view DTensor | Global tensor view exposed to distributed checkpointing, normally without a full GPU expert tensor. |
| topology portability | Ability to restore complete model and optimizer tensors under a changed DP, EP, or PP parameter-placement map. |

## D System Method Trade-Off Matrix · 系统方法的取舍矩阵

The methods in this report solve different parts of the MoE systems problem. Figure 76 collects their direct first-order effects in one place. The matrix separates a general parallelism mechanism from its implementation or schedule. General Expert Parallelism (Gen. EP), for example, describes expert sharding and its unavoidable token movement; one-dimensional all-to-all (1D-A2A) and rowwise all-to-all (Row-A2A) describe two implementations of that movement. Similarly, general Pipeline Parallelism (Gen. PP) describes layer sharding, while Interleaved-1F1B (I-1F1B) and 1F1B-V describe two schedules.

本报告的各个方法解决的是 MoE 系统问题的不同部分. 图 76 把它们直接的一阶影响汇总在一处. 矩阵把通用的并行机制和它的具体实现或调度分开列. 例如通用 Expert Parallelism (Gen. EP) 描述的是 expert 分片以及随之无法避免的 token 搬运; 一维 all-to-all (1D-A2A) 和按行 all-to-all (Row-A2A) 是这种搬运的两种实现. 同理, 通用 Pipeline Parallelism (Gen. PP) 描述按层切分, Interleaved-1F1B (I-1F1B) 和 1F1B-V 是它的两种调度.

<!-- page 154 of 168 -->

|  | DDP | FSDP | Dist Opt | Gen. EP | 1D-A2A | Row-A2A | Gen. PP | I-1F1B | 1F1B-V | CP | Recomp | Grp GEMM | MXFP8 | Sync-Free | CUDA Graph | Overlap | HW Map | Topo-Agst Ckpt | CPU Offload | MegaMot |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Persistent training-state memory | - | + | + | + |  |  | + |  |  |  |  |  | - |  |  |  |  |  |  |  |
| Weight materialization and refresh | + | - | △ | + |  |  | + |  |  |  |  |  | - |  |  |  |  |  |  |  |
| Saved activation memory |  |  |  |  |  |  | △ | △ | + | + | + |  | + |  | △ |  |  |  | + |  |
| Activation-retention imbalance |  |  |  |  |  |  | - | - | + |  | + |  |  |  |  |  |  |  |  |  |
| Temporary/runtime buffers |  | - |  | - | - | △ | - |  |  | - | △ |  | + | △ | - | - |  |  | - | - |
| Optimizer update work | - | + | △ | + |  |  | + |  |  |  |  |  | - |  |  |  |  |  |  |  |
| Gradient/weight synchronization | + | - | - | + |  |  | + |  |  |  |  |  |  |  |  |  | + |  |  |  |
| Expert dispatch/combine traffic |  |  |  | - | - | - |  |  |  |  | △ |  | + |  |  | △ | + |  |  | △ |
| Pipeline-boundary traffic |  |  |  |  |  |  | - | △ | △ | △ |  |  |  |  |  | △ | + |  |  |  |
| Host-device traffic |  |  |  |  |  |  |  |  |  |  |  |  |  | + | △ |  |  | △ | - |  |
| Inter-node traffic | - | - | - | - | - | - | - |  |  | - |  |  | + |  |  |  | + |  |  |  |
| Routing/layout permutations |  |  |  | - | - | + |  |  |  |  | △ | △ | △ |  |  |  |  |  |  | + |
| Padding and wasted expert FLOPs |  |  |  | △ | △ | △ |  |  |  |  |  | + |  |  |  |  |  |  |  | + |
| Small/irregular expert GEMMs |  |  |  | △ | △ | △ |  |  |  |  |  | + | △ |  |  |  |  |  |  | △ |
| Model compute throughput |  |  |  | △ |  |  | △ | △ | △ | △ | - | + | + |  |  | △ |  |  | - | △ |
| Additional recompute FLOPs |  |  |  |  |  |  |  |  |  |  | - |  |  |  |  |  |  |  | △ |  |
| Quantization/swizzle overhead |  |  |  |  |  |  |  |  |  |  |  |  | - |  |  |  |  |  |  | △ |
| Dynamic route/GEMM shapes |  |  |  | - | - | + |  |  |  |  |  | △ |  | + | - |  |  |  |  | △ |
| Device-host synchronization |  |  |  | △ | - | + |  |  |  |  |  | △ |  | + | + |  |  |  |  | △ |
| CPU launch overhead |  | - |  | - | - | △ | - | - | - | - | - | + | - | + | + | - |  |  | - | + |
| Pipeline bubbles |  |  |  |  |  |  | - | + | - | △ |  |  |  |  |  | △ | △ |  |  |  |
| Expert/stage load imbalance |  |  |  | - | - | - | - | △ |  |  |  | △ |  |  |  | △ | + |  |  | △ |
| Exposed communication | - | - | - | - | - | △ | - | △ | △ | - |  |  | + |  |  | + | + |  | - |  |
| Communication-compute contention |  |  |  | △ | △ | - | △ |  |  | △ |  |  | △ |  |  | - | + |  | - | △ |
| Checkpoint peak memory |  | + |  | △ |  |  | △ |  |  |  |  |  |  |  |  |  |  | + | △ |  |
| Topology-dependent restart |  | △ |  | △ |  |  | △ |  |  | △ |  |  |  |  |  |  |  | + |  |  |
| Save/load conversion time |  |  |  |  |  |  |  |  |  |  |  |  | △ |  |  |  |  | - |  |  |
| Integration complexity | △ | △ | - | - | - | - | - | - | - | - | △ | - | - | - | - | - | △ | △ | △ | - |

<!-- page 155 of 168 -->

The remaining headers abbreviate Distributed Data Parallel (DDP), Fully Sharded Data Parallel (FSDP), distributed optimizer (Dist Opt), Context Parallelism (CP), activation recomputation (Recomp), grouped general matrix multiplication (Grp GEMM), microscaling FP8 (MXFP8), synchronization-free execution (Sync-Free), CUDA Graph execution (CUDA Graph), communication–compute overlap (Overlap), hardwareaware topology mapping (HW Map), topology-agnostic checkpointing (Topo-Agst Ckpt), CPU activation offload (CPU Offload), and the fused MegaMoE prototype (MegaMoE).

其余表头缩写分别是: Distributed Data Parallel (DDP), Fully Sharded Data Parallel (FSDP), 分布式优化器 (Dist Opt), Context Parallelism (CP), 激活重算 (Recomp), 分组通用矩阵乘 (Grp GEMM), microscaling FP8 (MXFP8), 无同步执行 (Sync-Free), CUDA Graph 执行 (CUDA Graph), 通信与计算重叠 (Overlap), 感知硬件的拓扑映射 (HW Map), 与拓扑无关的 checkpoint (Topo-Agst Ckpt), CPU 激活卸载 (CPU Offload), 以及融合的 MegaMoE 原型 (MegaMoE).

A green plus means that the method directly reduces the named bottleneck. A red minus means that it introduces or increases that cost. An amber triangle marks an effect that depends materially on model shape, topology, schedule, hardware, or implementation. An empty cell means that the method has no direct first-order effect; it does not mean that the two are independent in a complete training run. The matrix is a qualitative design guide, not a performance ranking, and combinations of methods can change the individual effects.

绿色加号表示该方法直接缓解所列瓶颈. 红色减号表示它引入或加重这项开销. 黄色三角表示效果在很大程度上取决于模型形状, 拓扑, 调度, 硬件或实现. 空格表示该方法对这一项没有直接的一阶影响, 这不等于两者在完整的训练 run 中互不相关. 这个矩阵是定性的设计参考, 不是性能排名; 方法组合起来以后, 各自的效果也可能改变.

## E Expert-Merge Normalization in Public MoE Models · 公开 MoE 模型中的 expert 合并归一化

Section 21 motivates Olmo’s routed/shared merge from its dense-MLP decomposition and initialization scale. This appendix places that choice beside public model and framework implementations (Table 52). The comparison is based on the cited reports, released configurations, and source code.

第 21 节从稠密 MLP 的分解和初始化尺度出发, 给出了 Olmo 合并 routed 与 shared 两路的依据. 本附录把这个选择和公开的模型及框架实现放在一起比较 (Table 52). 比较依据是所引的报告, 已发布的配置和源代码.

For consistency with Equation 80, let $p _ { i }$ denote selected routed scores when they are renormalized to sum to one, let α be any additional routed scale, so that the routed coefficients are $r _ { i } = \alpha p _ { i }$ , and let $s ( x )$ be the shared-expert coefficient. A rule that instead retains the top-K probabilities $q _ { i } ( x )$ of a softmax over all N experts has token-dependent routed mass $m _ { K } ( x ) { = } \textstyle \sum _ { i \in \mathcal { S } ( x ) } q _ { i } ( x ) { < } 1$ These are separate design choices: normalizing the selected routed scores does not determine either α or s(x).

为与式 (80) 一致, 设 $p_i$ 为被选中 routed expert 的分数在重归一化 (和为 1) 后的值, $\alpha$ 为额外的 routed 缩放, 于是 routed 系数为 $r_i = \alpha p_i$; 再设 $s(x)$ 为 shared expert 的系数. 另一种规则是对全部 $N$ 个 expert 做 softmax 后直接保留 top-K 概率 $q_i(x)$, 这时 routed 总质量 $m_K(x) = \sum_{i \in \mathcal{S}(x)} q_i(x) < 1$, 且随 token 变化. 这几项是彼此独立的设计选择: 对被选 routed 分数做归一化, 既不决定 $\alpha$, 也不决定 $s(x)$.

Megatron-Core illustrates the distinction between a framework default and a model recipe particularly clearly. Its current examples use routed scales of 2.5 for DeepSeek-V3, 2.827 for Kimi K2, and either 2.5 or 5.0 for the surveyed Nemotron 3 variants, rather than deriving one scale from K or expert width. The examples establish that the mechanism supports model-specific choices; they are not a controlled ablation showing that one value is preferable (NVIDIA, 2026d).

Megatron-Core 把框架默认值和模型配方的区别体现得很清楚. 它当前的示例里, DeepSeek-V3 的 routed 缩放是 2.5, Kimi K2 是 2.827, 所调查的几个 Nemotron 3 变体是 2.5 或 5.0, 没有一个是从 K 或 expert 宽度推出来的. 这些示例说明该机制支持按模型选值; 它们也没有做对照消融, 不能说明哪个值更好 (NVIDIA, 2026d).

The released DeepSeek-V3 reference requires a similar qualification. Its inference code applies the routed scale 2.5, while the DeepSeek-V3 report’s routing equations describe normalized selected sigmoid affinities and an additive shared branch. The original large-scale training implementation is not public, so the released inference setting does not establish the exact pretraining merge formula.

已发布的 DeepSeek-V3 参考实现也要加类似的限定. 它的推理代码使用 routed 缩放 2.5, 而 DeepSeek-V3 报告里的路由公式写的是: 对被选的 sigmoid 亲和度做归一化, 再加上一路 shared 分支. 原始的大规模训练实现没有公开, 所以已发布的推理设置不能确定预训练时的确切合并公式.

Across these systems, routed mass may be below one, equal to one, multiplied by a model-specific constant, or equal to $K ;$ the shared contribution may be absent, have unit gain, or use a learned gate. Expert widths and initialization histories also differ, and Qwen’s upcycling changes the relevant starting point. The initializationscale rationale in Section 21 applies to Olmo’s architecture. These public implementations do not establish a universal or uniquely optimal merge normalization.

在这些系统里, routed 总质量可以小于 1, 等于 1, 乘上某个模型特定的常数, 或者等于 $K$; shared 一路可以没有, 可以是单位增益, 也可以带学习的门. 各家的 expert 宽度和初始化历史也不同, Qwen 的 upcycling 还改变了相关的起点. 第 21 节关于初始化尺度的理由只适用于 Olmo 的架构. 这些公开实现不能说明存在一种通用的或唯一最优的合并归一化.

## F Context Parallelism and MoE Parallel Folding · Context Parallelism 与 MoE parallel folding

Long sequences create an activation-memory and attention-computation problem that Expert Parallelism (EP) does not address. **Context Parallelism (CP)** divides the sequence dimension among ranks that process the same training examples. With a CP degree C, each rank enters a Transformer block with approximately $S / C$ of the sequence positions. CP therefore reduces the local size of sequence-shaped activations, but it does not itself partition parameters or create additional data-parallel examples. Routed-expert parameter placement remains the job of EP.

长序列带来的是激活内存和注意力计算的问题, Expert Parallelism (EP) 不处理这一点. **Context Parallelism (CP)** 把序列维分给处理同一批训练样本的多个 rank. CP 度为 $C$ 时, 每个 rank 进入 Transformer block 时只拿约 $S/C$ 个序列位置. 因此 CP 减小的是序列形状激活在本地的大小, 它本身不切分参数, 也不增加数据并行的样本数. routed expert 参数的放置仍由 EP 负责.

Olmo-core uses the **Ulysses** form of CP for the MoE path (Jacobs et al., 2023). Before attention, each rank holds queries, keys, and values in a context-sharded layout. An all-to-all operation changes that layout as follows for batch size B, sequence length S, head count H, and head width $d _ { h }$

<!-- page 156 of 168 -->

| Model or implementation | Routed coefficients | Shared branch | Interpretation |
| --- | --- | --- | --- |
| Olmo, this report | Selected normalization followed by $\alpha = K$; hence $\sum_{i} r_{i} = K$. | Unit gain, $s = 1$. | Unit-average selected coefficients; matches the additive dense-block reference under uniform selected routing. |
| Megatron-Core default, when shared experts are enabled | Post-top-$K$ softmax with $\alpha = 1$ by default; $\alpha$ is configurable. | Unit gain by default; an optional learned sigmoid gate is available. | A configurable framework rather than one prescribed model recipe (Yan et al., 2026; NVIDIA, 2026d). |
| DeepSeek-V3 released reference | Selected sigmoid affinities are renormalized and multiplied by $\alpha = 2.5$. | Unit gain. | A model-specific routed scale between one and $K = 8$ (DeepSeek-AI et al., 2024; DeepSeek-AI, 2025a). |
| Qwen1.5-MoE and Qwen2-MoE released models | Full softmax over all experts followed by top-$K$ without selected renormalization; routed mass is $m_{K}(x) < 1$. | Learned sigmoid gate. | An upcycled recipe in which routed mass and shared gain are both token dependent (Qwen Team, 2024a; Yang et al., 2024; Qwen Team, 2024b,c; Qwen Team et al., 2024). |
| Qwen3.5 MoE public implementation | Selected top-$K$ probabilities are renormalized to sum to one. | Learned sigmoid gate. | Unit routed mass with a token-dependent shared contribution (Qwen Team, 2026b; Hugging Face, 2026). |
| Mixtral | Softmax over the selected logits; routed mass is one. | No shared expert. | A routed-only weighted-average convention (Jiang et al., 2024a; Mistral AI, 2026). |
| OLMoE-1B-7B | Full softmax over 64 experts followed by top-8 without selected renormalization; routed mass is below one. | No shared expert. | The merge rule in this report is not inherited from the earlier OLMoE model (Muennighoff et al., 2024). |
| MegaBlocks options | Selected route weights may remain unnormalized or receive an $L_{p}$ normalization. | Direct addition by default; an option uses routed coefficient $K/(K + 1)$ and shared coefficient $1/(K + 1)$. | Exposes normalization as a configurable recipe choice rather than a fixed framework identity (Databricks, 2026). |

$$
[ B, S / C, H, d _ {h} ] \quad \longrightarrow \quad [ B, S, H / C, d _ {h} ],\tag{96}
$$

so each rank evaluates the full sequence for a subset of attention heads, which requires C to divide H. A second all-to-all returns the output to the context-sharded layout. The remaining operations in the Transformer block continue on local token rows. In particular, the MoE router receives the local $S / C$ rows directly; the model does not gather the full sequence before routing.

Olmo-core 在 MoE 路径上使用 **Ulysses** 形式的 CP (Jacobs et al., 2023). 进入注意力之前, 每个 rank 按上下文切分的布局持有 query, key 和 value. 设 batch 大小为 $B$, 序列长度为 $S$, 头数为 $H$, 头宽为 $d_h$, 一次 all-to-all 按式 (96) 改变布局, 于是每个 rank 对一部分注意力头计算完整序列, 这要求 $C$ 整除 $H$. 第二次 all-to-all 把输出换回按上下文切分的布局. Transformer block 里的其余运算继续在本地 token 行上进行. 尤其是 MoE router 直接接收本地的 $S/C$ 行, 模型在路由前不会 gather 完整序列.

> **确认:** 式 (96) 只要求 $C$ 整除 $H$; 在 GQA 下 key/value 头更少, 约束是否更紧?
> 答: 更紧. `src/olmo_core/nn/attention/backend.py` 的 Ulysses 分支对 q 调 `all_to_all_single_cp2hp`, 对 k, v 调 `all_to_all_cp2hp`; 后者在 `src/olmo_core/distributed/parallel/context_parallel.py` 里把 `[B, T/CP, H, D]` 直接 `view` 成 `[B, T/CP, CP, H/CP, D]`. 对 k, v 来说这里的 $H$ 就是 KV 头数, 代码没有先复制 KV 头再切, 切完才用 `n_rep = n_heads // n_kv_heads` 在本地展开. 所以 $C$ 必须同时整除 query 头数和 KV 头数. 以 B.7 的模型为例 (16 个 query 头, 4 个 KV 头), Ulysses CP 最多开到 4. 有的实现在 CP 大于 KV 头数时会先复制 KV 头再切, Olmo-core 当前代码里没有这条路径, 报告也没提.

CP ranks are not independent data-parallel replicas because they contribute different sequence slices of the same examples. This distinction matters when CP is combined with EP. Let D and C be the dense Data Parallelism (DP) and CP degrees within one pipeline stage, and let $D _ { E }$ and $M _ { E }$ be the expert-replica and expert-sharding degrees. Olmo-core forms two views of the same per-stage rank set:

CP 的各个 rank 不是相互独立的数据并行副本, 因为它们贡献的是同一批样本的不同序列片段. CP 与 EP 组合时, 这个区别很关键. 设 $D$ 和 $C$ 为同一个流水线 stage 内稠密 Data Parallelism (DP) 与 CP 的度, $D_E$ 和 $M_E$ 为 expert 副本度与 expert 分片度. Olmo-core 对同一个 stage 内的 rank 集合构造两种视图:

$$
\mathcal {G} _ {\text {stage}} = \mathcal {A} _ {\mathrm{DP}} \times \mathcal {A} _ {\mathrm{CP}} = \mathcal {A} _ {\mathrm{EP-DP}} \times \mathcal {A} _ {\mathrm{EP-MP}}, \quad D C = D _ {E} M _ {E}.\tag{97}
$$

The dense view keeps CP visible to attention and input preparation. Dense gradients reduce over the combined $\mathrm { D P   \times   C P }$ group. The MoE view instead uses EP-MP to partition routed experts and EP-DP to synchronize copies of the same expert shard. Dispatch and combine operate over the folded expert groups, so routed tokens from all DP and CP coordinates can reach the ranks that store their selected experts.

稠密视图让注意力和输入准备能看到 CP, 稠密梯度在合并后的 $\mathrm{DP} \times \mathrm{CP}$ 组上规约. MoE 视图则用 EP-MP 切分 routed expert, 用 EP-DP 同步同一 expert 分片的各个副本. dispatch 和 combine 在折叠后的 expert 组上进行, 因此任意 DP, CP 坐标上的 routed token 都能到达存有其所选 expert 的 rank.

<!-- page 157 of 168 -->

This construction is a focused application of **MoE parallel folding**, which allows dense attention and sparse expert layers to use different parallel mappings on the same devices (Liu et al., 2025a). For example, four ranks can form a dense mesh with $D = 2$ and $C = 2 .$ , then be viewed by the MoE layers as $D _ { E } = 1$ and $M _ { E }   =   4$ . Enabling $\mathrm { C P }   =   2$ and $EP-MP =4$ therefore still uses four ranks within the stage, rather than allocating an independent four-rank expert group for each CP coordinate. More generally, parallel folding prevents CP and EP from being treated as orthogonal multipliers when their layer-local work can share the same ranks.

这种构造是 **MoE parallel folding** 的一个具体应用: 它允许稠密注意力层和稀疏 expert 层在同一批设备上使用不同的并行映射 (Liu et al., 2025a). 例如 4 个 rank 可以组成 $D = 2$, $C = 2$ 的稠密 mesh, 在 MoE 层看来则是 $D_E = 1$, $M_E = 4$. 因此同时开 $\mathrm{CP} = 2$ 和 $\text{EP-MP} = 4$, 一个 stage 内仍只用 4 个 rank, 不需要给每个 CP 坐标各配一个独立的 4 rank expert 组. 更一般地说, 当 CP 和 EP 在层内的工作可以共用同一批 rank 时, parallel folding 避免把两者当成相乘的正交维度.

Pipeline Parallelism (PP) adds an outer partition over layers. Within each PP stage, inputs and labels are sequence-sharded before the pipeline schedule starts, while the original sequence length is retained for positional encoding. Later stages receive already-sharded activations and do not apply CP a second time. Equation 97 then holds independently inside every pipeline stage. Within this layout, CP assigns sequence rows, EP assigns routed experts, and PP assigns layers to ranks.

Pipeline Parallelism (PP) 在层的方向上再加一层外部切分. 在每个 PP stage 内, 输入和标签在流水线调度开始前就按序列切好, 同时保留原始序列长度供位置编码使用. 后面的 stage 收到的已是切好的激活, 不会再做一次 CP. 于是式 (97) 在每个流水线 stage 内各自成立. 在这个布局下, CP 把序列行分给 rank, EP 把 routed expert 分给 rank, PP 把层分给 rank.

CP lowers the per-rank footprint of many sequence-shaped activations and makes longer contexts feasible, while Ulysses adds attention-layout all-to-alls. Parallel folding does not remove that communication; it prevents CP from unnecessarily multiplying the device count required by EP and gives attention and routed experts the process groups that match their respective computation.

CP 降低了许多序列形状激活在每个 rank 上的占用, 让更长的上下文变得可行, 代价是 Ulysses 引入了注意力布局变换的 all-to-all. parallel folding 并不消除这部分通信; 它的作用是避免 CP 无谓地成倍增加 EP 所需的设备数, 并给注意力和 routed expert 各自配上与其计算相匹配的进程组.

## G Author Contributions · 作者贡献

**Tianhua Tao** led the project and carried out its core research and development: conceptualization, system design and implementation, experimental evaluation, profiling, analysis, visualization, and manuscript preparation.

**Akshita Bhagia** contributed broadly to the Olmo-core software, including but not limited to MoE code refactoring and integration, software maintenance, and testing.

**Dirk Groeneveld, Pete Walsh, and Tyler Romero** made foundational contributions to Olmo-core and early MoE prototyping, establishing the software foundation on which the Olmo-core DDP system described in this report builds.

**Yashas Samaga and Jacob Morrison** participated in technical discussions on MoE integration and downstream use. Their experience with the software informed feedback on design, training workflows, and usability.

**Iz Beltagy** provided team leadership, project direction, and strategic coordination.

**Taira Anderson** provided technical program management, including compute-resource allocation, scheduling, project administration, and coordination.

**Noah A. Smith and Hannaneh Hajishirzi** provided strategic guidance and research advising. Hannaneh Hajishirzi also served as the project’s primary academic advisor.

## G.1 Use of AI Tools · AI 工具的使用

We used AI tools to assist with developing the codebase and GPU kernels, drafting and revising this report, managing experiments, and creating visualizations. Building and documenting the training stack required repeated iteration across distributed systems code, kernel behavior, experiment orchestration, and technical explanation. We used AI assistance to support that iteration, explore implementation alternatives, and reduce repetitive coding and editorial work. This was a practical part of a human-led research process: the research direction, design decisions, and interpretation of results remained the responsibility of the authors.

我们用 AI 工具辅助开发代码库和 GPU kernel, 起草和修改本报告, 管理实验, 以及制作可视化. 搭建训练栈并把它写成文档, 需要在分布式系统代码, kernel 行为, 实验编排和技术解释之间反复迭代. 我们用 AI 辅助支撑这种迭代, 尝试不同的实现方案, 减少重复的编码和编辑工作. 这是一个由人主导的研究过程中的实际环节: 研究方向, 设计决策和对结果的解读仍由作者负责.

AI-generated suggestions were assessed through code inspection, testing, profiling, experimental comparisons, and source checks, as appropriate to the task. We also kept a citation audit that records source evidence and review notes for individual cited claims. These checks can themselves miss errors; AI assistance does not transfer responsibility for the work. The authors remain responsible for the methods, results, and statements in this report.

对 AI 生成的建议, 我们按任务需要, 通过代码审查, 测试, profiling, 实验对比和来源核查来评估. 我们还维护了一份引用审计, 为每条被引用的论断记录来源证据和审阅意见. 这些检查本身也可能漏掉错误; 使用 AI 辅助并不转移对这项工作的责任. 本报告中的方法, 结果和陈述仍由作者负责.

<!-- page 158 of 168 -->

## References

Samira Abnar, Harshay Shah, Dan Busbridge, Alaaeldin El-Nouby, Joshua M. Susskind, and Vimal Thilak. Parameters vs FLOPs: Scaling laws for optimal sparsity for mixture-of-experts language models. In Proceedings of the 42nd International Conference on Machine Learning, volume 267 of Proceedings of Machine Learning Research, pages 204–230. PMLR, 2025. [https://proceedings.mlr.press/v267/abnar25a.html.](https://proceedings.mlr.press/v267/abnar25a.html)

Ai2. open-instruct: Ai2’s post-training codebase. GitHub repository, 2026. [https://github.com/allenai/open-instruct/tree/b9269782a3d2c81f2e43ce14ba5290417923f4c0.](https://github.com/allenai/open-instruct/tree/b9269782a3d2c81f2e43ce14ba5290417923f4c0) Commit b9269782a3d2c81f2e43ce14ba5290417923f4c0; accessed 2026-09-19.

Joshua Ainslie, James Lee-Thorp, Michiel de Jong, Yury Zemlyanskiy, Federico Lebrón, and Sumit Sanghai. GQA: Training generalized multi-query transformer models from multi-head checkpoints. In Proceedings of the 2023 Conference on Empirical Methods in Natural Language Processing, pages 4895–4901, 2023. [https://aclanthology.org/2023.emnlp-main.298/.](https://aclanthology.org/2023.emnlp-main.298/)

Allen Institute for AI. Dolma2 tokenizer, 2024. [https://huggingface.co/allenai/dolma2-tokenizer/blob/5292e5d6c0f40b67cc765fe41bec991cf4345b5c/README.md.](https://huggingface.co/allenai/dolma2-tokenizer/blob/5292e5d6c0f40b67cc765fe41bec991cf4345b5c/README.md)Tokenizer repository created July 12, 2024; revision 5292e5d6c0f40b67cc765fe41bec991cf4345b5c; accessed 2026-09-19.

Jason Ansel, Edward Yang, Horace He, Natalia Gimelshein, Animesh Jain, Michael Voznesensky, Bin Bao, Peter Bell, David Berard, Evgeni Burovski, et al. PyTorch 2: Faster machine learning through dynamic Python bytecode transformation and graph compilation. In Proceedings of the 29th ACM International Conference on Architectural Support for Programming Languages and Operating Systems, Volume 2, pages 929–947, 2024. [https://doi.org/10.1145/3620665.3640366.](https://doi.org/10.1145/3620665.3640366)

Jacob Austin, Sholto Douglas, Roy Frostig, Anselm Levskaya, et al. All about rooflines. How To Scale Your Model, Part 1, 2025. [https://jax-ml.github.io/scaling-book/roofline/.](https://jax-ml.github.io/scaling-book/roofline/) Published 2025-02-04; accessed 2026-09-18.

Sridutt Bhalachandra, Brian Austin, Samuel Williams, and Nicholas J. Wright. Understanding the impact of input entropy on FPU, CPU, and GPU power. arXiv preprint arXiv:2212.08805, 2022. doi: 10.48550/arXiv.2212.08805. [https://arxiv.org/abs/2212.08805](https://arxiv.org/abs/2212.08805).

Tianqi Chen, Bing Xu, Chiyuan Zhang, and Carlos Guestrin. Training deep nets with sublinear memory cost. arXiv preprint arXiv:1604.06174, 2016. [https://arxiv.org/abs/1604.06174.](https://arxiv.org/abs/1604.06174)

Aakanksha Chowdhery et al. PaLM: Scaling language modeling with pathways. Journal of Machine Learning Research, 24(240):1–113, 2023. [https://jmlr.org/papers/v24/22-1144.html.](https://jmlr.org/papers/v24/22-1144.html)

Aidan Clark, Diego De Las Casas, Aurelia Guy, Arthur Mensch, Michela Paganini, Jordan Hoffmann, Bogdan Damoc, Blake Hechtman, Trevor Cai, Sebastian Borgeaud, George Bm Van Den Driessche, Eliza Rutherford, Tom Hennigan, Matthew J. Johnson, Albin Cassirer, Chris Jones, Elena Buchatskaya, David Budden, Laurent Sifre, Simon Osindero, Oriol Vinyals, Marc’Aurelio Ranzato, Jack Rae, Erich Elsen, Koray Kavukcuoglu, and Karen Simonyan. Unified scaling laws for routed language models. In Proceedings of the 39th International Conference on Machine Learning, volume 162 of Proceedings of Machine Learning Research, pages 4057–4086. PMLR, 2022. [https://proceedings.mlr.press/v162/clark22a.html.](https://proceedings.mlr.press/v162/clark22a.html)

Damai Dai, Chengqi Deng, Chenggang Zhao, R. X. Xu, Huazuo Gao, Deli Chen, Jiashi Li, Wangding Zeng, Xingkai Yu, Y. Wu, Zhenda Xie, Y. K. Li, Panpan Huang, Fuli Luo, Chong Ruan, Zhifang Sui, and Wenfeng Liang. DeepSeekMoE: Towards ultimate expert specialization in mixture-of-experts language models. In Proceedings of the 62nd Annual Meeting of the Association for Computational Linguistics (Volume 1: Long Papers), pages 1280–1297, 2024. doi: 10.18653/v1/2024.acl-long.70. [https://aclanthology.org/2024.acl-long.70/.](https://aclanthology.org/2024.acl-long.70/)

Tri Dao, Dan Fu, Stefano Ermon, Atri Rudra, and Christopher Ré. FlashAttention: Fast and memory-efficient exact attention with IO-awareness. In Advances in Neural Information Processing Systems, volume 35, 2022. [https://proceedings.neurips.cc/paper\_files/paper/2022/hash/67d57c32e20fd0a7a302cb81d36e40d5-Abstract-Conference.html.](https://proceedings.neurips.cc/paper_files/paper/2022/hash/67d57c32e20fd0a7a302cb81d36e40d5-Abstract-Conference.html)

Databricks. MegaBlocks source code. GitHub, 2026. [https://github.com/databricks/megablocks/tree/952db33d6eac334d22c61e47a0d5d41446298784.](https://github.com/databricks/megablocks/tree/952db33d6eac334d22c61e47a0d5d41446298784) Router and shared-expert merge paths audited at commit 952db33d6eac334d22c61e47a0d5d41446298784.

Databricks AI Research Team. Introducing DBRX: A new state-of-the-art open LLM, March 2024. [https://www.databricks.com/blog/introducing-dbrx-new-state-art-open-llm.](https://www.databricks.com/blog/introducing-dbrx-new-state-art-open-llm)

<!-- page 159 of 168 -->

DeepSeek-AI. DeepSeek-V3 reference implementation. GitHub, 2025a. [https://github.com/deepseek-ai/DeepSeek-V3/tree/9b4e9788e4a3a731f7567338ed15d3ec549ce03b.](https://github.com/deepseek-ai/DeepSeek-V3/tree/9b4e9788e4a3a731f7567338ed15d3ec549ce03b) Released inference implementation audited at commit 9b4e9788e4a3a731f7567338ed15d3ec549ce03b.

DeepSeek-AI. DualPipe: Bidirectional pipeline parallelism for computation–communication overlap. GitHub, 2025b. [https://github.com/deepseek-ai/DualPipe/tree/030ce4325f4ebeb437da4ebc6d00a70469dd58ae.](https://github.com/deepseek-ai/DualPipe/tree/030ce4325f4ebeb437da4ebc6d00a70469dd58ae)Parameter-memory comparison audited at commit 030ce4325f4ebeb437da4ebc6d00a70469dd58ae.

DeepSeek-AI. DeepEP: Legacy low-latency and two-batch-overlap documentation, 2026. [https://github.com/deepseek-ai/DeepEP/blob/60d44037a702f651a6e18bd4aea65ed8409051c2/docs/legacy.md.](https://github.com/deepseek-ai/DeepEP/blob/60d44037a702f651a6e18bd4aea65ed8409051c2/docs/legacy.md)Commit 60d44037a702f651a6e18bd4aea65ed8409051c2; accessed 2026-07-13.

DeepSeek-AI et al. DeepSeek-V3 technical report. Technical Report arXiv:2412.19437v2, DeepSeek-AI, 2024. [https://arxiv.org/abs/2412.19437v2](https://arxiv.org/abs/2412.19437v2).

DeepSeek-AI et al. DeepSeek-V4: Towards highly efficient million-token context intelligence. arXiv preprint arXiv:2606.19348, 2026. doi: 10.48550/arXiv.2606.19348. [https://arxiv.org/abs/2606.19348.](https://arxiv.org/abs/2606.19348)

Nan Du et al. GLaM: Efficient scaling of language models with mixture-of-experts. In Proceedings of the 39th International Conference on Machine Learning, volume 162 of Proceedings of Machine Learning Research, pages 5547–5569, 2022. [https://proceedings.mlr.press/v162/du22c.html.](https://proceedings.mlr.press/v162/du22c.html)

William Fedus, Barret Zoph, and Noam Shazeer. Switch Transformers: Scaling to trillion parameter models with simple and efficient sparsity. Journal of Machine Learning Research, 23(120):1–39, 2022. [https://www.jmlr.org/papers/v23/21-0998.html.](https://www.jmlr.org/papers/v23/21-0998.html)

Trevor Gale, Deepak Narayanan, Cliff Young, and Matei Zaharia. MegaBlocks: Efficient sparse training with mixture-of-experts. In Proceedings of Machine Learning and Systems, volume 5, pages 288–304, 2023. [https://proceedings.mlsys.org/paper\_files/paper/2023/hash/5a54f79333768effe7e8927bcccffe40-Abstract-mlsys2023.html.](https://proceedings.mlsys.org/paper_files/paper/2023/hash/5a54f79333768effe7e8927bcccffe40-Abstract-mlsys2023.html)

Gemma Team. Gemma 4 model card, 2026. [https://ai.google.dev/gemma/docs/core/model\_card\_4.](https://ai.google.dev/gemma/docs/core/model_card_4)

GLM-5 Team et al. GLM-5: From vibe coding to agentic engineering. arXiv preprint arXiv:2602.15763, 2026. doi: 10.48550/arXiv.2602.15763. [https://arxiv.org/abs/2602.15763.](https://arxiv.org/abs/2602.15763)

Theo Gregersen, Pratyush Patel, and Esha Choukse. Input-dependent power usage in GPUs. In SC24-W: Workshops of the International Conference for High Performance Computing, Networking, Storage and Analysis, pages 1872–1877. IEEE, 2024. doi: 10.1109/SCW63240.2024.00235. [https://arxiv.org/abs/2409.18324.](https://arxiv.org/abs/2409.18324)

Daya Guo et al. DeepSeek-R1 incentivizes reasoning in LLMs through reinforcement learning. Nature, 645:633–638, 2025. doi: 10.1038/s41586-025-09422-z. [https://doi.org/10.1038/s41586-025-09422-z.](https://doi.org/10.1038/s41586-025-09422-z)

Alexander Hägele, Elie Bakouch, Atli Kosson, Loubna Ben Allal, Leandro von Werra, and Martin Jaggi. Scaling laws and compute-optimal training beyond fixed training durations. In Advances in Neural Information Processing Systems, volume 37, pages 76232–76264, 2024. [https://proceedings.neurips.cc/paper\_files/paper/2024/hash/8b970e15a89bf5d12542810df8eae8fc-Abstract-Conference.html.](https://proceedings.neurips.cc/paper_files/paper/2024/hash/8b970e15a89bf5d12542810df8eae8fc-Abstract-Conference.html)

Ethan He, Abhinav Khattar, Ryan Prenger, Vijay Korthikanti, Zijie Yan, Tong Liu, Shiqing Fan, Ashwath Aithal, Mohammad Shoeybi, and Bryan Catanzaro. Upcycling large language models into mixture of experts. Technical Report 2410.07524, arXiv, 2024. [https://arxiv.org/abs/2410.07524.](https://arxiv.org/abs/2410.07524)

Elad Hoffer, Itay Hubara, and Daniel Soudry. Train longer, generalize better: Closing the generalization gap in large batch training of neural networks. In Advances in Neural Information Processing Systems, volume 30, 2017. [https://proceedings.neurips.cc/paper/2017/hash/a5e0ff62be0b08456fc7f1e88812af3d-Abstract.html.](https://proceedings.neurips.cc/paper/2017/hash/a5e0ff62be0b08456fc7f1e88812af3d-Abstract.html)

Shengding Hu, Yuge Tu, Xu Han, Chaoqun He, Ganqu Cui, Xiang Long, Zhi Zheng, Yewei Fang, Yuxiang Huang, Weilin Zhao, et al. MiniCPM: Unveiling the potential of small language models with scalable training strategies. Technical Report 2404.06395, arXiv, 2024. [https://arxiv.org/abs/2404.06395.](https://arxiv.org/abs/2404.06395)

Howard Huang, Will Constable, Ke Wen, Jeffrey Wan, Haoci Zhang, Dong Li, and Weiwei Chu. Training with zero-bubble pipeline parallelism. PyTorch Forums, Distributed with TorchTitan, 2024. [https://discuss.pytorch.org/t/distributed-w-torchtitan-training-with-zero-bubble-pipeline-parallelism/214420.](https://discuss.pytorch.org/t/distributed-w-torchtitan-training-with-zero-bubble-pipeline-parallelism/214420)Accessed 2026-07-13.

Yanping Huang, Youlong Cheng, Ankur Bapna, Orhan Firat, Dehao Chen, Mia Chen, HyoukJoong Lee, Jiquan Ngiam, Quoc V. Le, Yonghui Wu, and Zhifeng Chen. GPipe: Efficient training of giant neural networks using

<!-- page 160 of 168 -->

pipeline parallelism. In Advances in Neural Information Processing Systems, volume 32, 2019. [https://proceedings.neurips.cc/paper/2019/hash/093f65e080a295f8076b1c5722a46aa2-Abstract.html.](https://proceedings.neurips.cc/paper/2019/hash/093f65e080a295f8076b1c5722a46aa2-Abstract.html)

Hugging Face. Qwen3.5-MoE implementation in Transformers. GitHub, 2026. [https://github.com/huggingface/transformers/blob/01dd2fd817a51a67eeb9126233faf9cbb380a17c/src/transformers/models/qwen3\_5\_moe/modeling\_qwen3\_5\_moe.py.](https://github.com/huggingface/transformers/blob/01dd2fd817a51a67eeb9126233faf9cbb380a17c/src/transformers/models/qwen3_5_moe/modeling_qwen3_5_moe.py) Audited at commit 01dd2fd817a51a67eeb9126233faf9cbb380a17c.

Changho Hwang, Wei Cui, Yifan Xiong, Ziyue Yang, Ze Liu, Han Hu, Zilong Wang, Rafael Salas, Jithin Jose, Prabhat Ram, HoYuen Chau, Peng Cheng, Fan Yang, Mao Yang, and Yongqiang Xiong. Tutel: Adaptive mixture-of-experts at scale. In Proceedings of Machine Learning and Systems, volume 5, pages 269–287, 2023. [https://proceedings.mlsys.org/paper\_files/paper/2023/hash/5616d34cf8ff73942cfd5aa922842556-Abstract-mlsys2023.html.](https://proceedings.mlsys.org/paper_files/paper/2023/hash/5616d34cf8ff73942cfd5aa922842556-Abstract-mlsys2023.html)

Robert A. Jacobs, Michael I. Jordan, Steven J. Nowlan, and Geoffrey E. Hinton. Adaptive mixtures of local experts. Neural Computation, 3(1):79–87, 1991. doi: 10.1162/neco.1991.3.1.79. [https://doi.org/10.1162/neco.1991.3.1.79.](https://doi.org/10.1162/neco.1991.3.1.79)

Sam Ade Jacobs, Masahiro Tanaka, Chengming Zhang, Minjia Zhang, Shuaiwen Leon Song, Samyam Rajbhandari, and Yuxiong He. DeepSpeed Ulysses: System optimizations for enabling training of extreme long sequence transformer models. Technical Report arXiv:2309.14509v2, Microsoft, 2023. [https://arxiv.org/abs/2309.14509v2](https://arxiv.org/abs/2309.14509v2). Version 2.

Paras Jain, Ajay Jain, Aniruddha Nrusimha, Amir Gholami, Pieter Abbeel, Joseph E. Gonzalez, Kurt Keutzer, and Ion Stoica. Checkmate: Breaking the memory wall with optimal tensor rematerialization. In Proceedings of Machine Learning and Systems, volume 2, pages 497–511, 2020. [https://proceedings.mlsys.org/paper\_files/paper/2020/hash/0b816ae8f06f8dd3543dc3d9ef196cab-Abstract.html.](https://proceedings.mlsys.org/paper_files/paper/2020/hash/0b816ae8f06f8dd3543dc3d9ef196cab-Abstract.html)

Albert Q. Jiang, Alexandre Sablayrolles, Antoine Roux, et al. Mixtral of experts. arXiv preprint arXiv:2401.04088, 2024a. doi: 10.48550/arXiv.2401.04088. [https://arxiv.org/abs/2401.04088.](https://arxiv.org/abs/2401.04088)

Chenyu Jiang, Ye Tian, Zhen Jia, Shuai Zheng, Chuan Wu, and Yida Wang. Lancet: Accelerating mixture-of-experts training via whole graph computation-communication overlapping. In Proceedings of Machine Learning and Systems, volume 6, pages 74–86, 2024b. [https://proceedings.mlsys.org/paper\_files/paper/2024/hash/339caf45a6fa281cae8adc6465343464-Abstract-Conference.html.](https://proceedings.mlsys.org/paper_files/paper/2024/hash/339caf45a6fa281cae8adc6465343464-Abstract-Conference.html)

Chao Jin, Ziheng Jiang, Zhihao Bai, Zheng Zhong, Juncai Liu, Xiang Li, Ningxin Zheng, Xi Wang, Cong Xie, Qi Huang, Wen Heng, Yiyuan Ma, Wenlei Bao, Size Zheng, Yanghua Peng, Haibin Lin, Xuanzhe Liu, Xin Jin, and Xin Liu. MegaScale-MoE: Large-scale communication-efficient training of mixture-of-experts models in production. arXiv preprint arXiv:2505.11432, 2025. [https://arxiv.org/abs/2505.11432.](https://arxiv.org/abs/2505.11432)

Keller Jordan, Yuchen Jin, Vlado Boza, Jiacheng You, Franz Cesista, Laker Newhouse, and Jeremy Bernstein. Muon: An optimizer for hidden layers in neural networks, 2024. [https://kellerjordan.github.io/posts/muon/.](https://kellerjordan.github.io/posts/muon/)

Michael I. Jordan and Robert A. Jacobs. Hierarchical mixtures of experts and the EM algorithm. Neural Computation, 6(2):181–214, 1994. doi: 10.1162/neco.1994.6.2.181. [https://doi.org/10.1162/neco.1994.6.2.181.](https://doi.org/10.1162/neco.1994.6.2.181)

Kimi Team. Kimi K3: Open frontier intelligence, 2026. [https://github.com/MoonshotAI/Kimi-K3/blob/main/k3\_tech\_report.pdf.](https://github.com/MoonshotAI/Kimi-K3/blob/main/k3_tech_report.pdf)

Diederik P. Kingma and Jimmy Ba. Adam: A method for stochastic optimization. In International Conference on Learning Representations, 2015. [https://arxiv.org/abs/1412.6980.](https://arxiv.org/abs/1412.6980)

Aran Komatsuzaki, Joan Puigcerver, James Lee-Thorp, Carlos Riquelme, Basil Mustafa, Joshua Ainslie, Yi Tay, Mostafa Dehghani, and Neil Houlsby. Sparse upcycling: Training mixture-of-experts from dense checkpoints. In International Conference on Learning Representations, 2023. [https://openreview.net/forum?id=T5nUQDrM4u.](https://openreview.net/forum?id=T5nUQDrM4u)

Vijay Anand Korthikanti, Jared Casper, Sangkug Lym, Lawrence McAfee, Michael Andersch, Mohammad Shoeybi, and Bryan Catanzaro. Reducing activation recomputation in large transformer models. In Proceedings of Machine Learning and Systems, volume 5, pages 341–353, 2023. [https://proceedings.mlsys.org/paper\_files/paper/2023/hash/80083951326cf5b35e5100260d64ed81-Abstract-mlsys2023.html.](https://proceedings.mlsys.org/paper_files/paper/2023/hash/80083951326cf5b35e5100260d64ed81-Abstract-mlsys2023.html)

Woosuk Kwon, Zhuohan Li, Siyuan Zhuang, Ying Sheng, Lianmin Zheng, Cody Hao Yu, Joseph E. Gonzalez, Hao Zhang, and Ion Stoica. Efficient memory management for large language model serving with PagedAttention. In

<!-- page 161 of 168 -->

Proceedings of the 29th Symposium on Operating Systems Principles (SOSP), pages 611–626, 2023. doi: 10.1145/3600006.3613165.

Nathan Lambert, Jacob Morrison, Valentina Pyatkin, Shengyi Huang, Hamish Ivison, Faeze Brahman, Lester James V. Miranda, Alisa Liu, Nouha Dziri, Shane Lyu, et al. Tülu 3: Pushing frontiers in open language model post-training. Technical Report 2411.15124, arXiv, 2024. [https://arxiv.org/abs/2411.15124.](https://arxiv.org/abs/2411.15124)

Robert Tjarko Lange, Yuki Imajuku, and Edoardo Cetin. ShinkaEvolve: Towards open-ended and sample-efficient program evolution. In The Fourteenth International Conference on Learning Representations, 2026. [https://openreview.net/forum?id=lKEdGCoDNC.](https://openreview.net/forum?id=lKEdGCoDNC)

Seonho Lee, Jihwan Oh, Junkyum Kim, Seokjin Go, Jongse Park, and Divya Mahajan. Characterizing compute-communication overlap in GPU-accelerated distributed deep learning: Performance and power implications. Technical Report arXiv:2507.03114v1, arXiv, 2025. [https://arxiv.org/abs/2507.03114v1.](https://arxiv.org/abs/2507.03114v1)

Dmitry Lepikhin, HyoukJoong Lee, Yuanzhong Xu, Dehao Chen, Orhan Firat, Yanping Huang, Maxim Krikun, Noam Shazeer, and Zhifeng Chen. GShard: Scaling giant models with conditional computation and automatic sharding. In International Conference on Learning Representations, 2021. [https://openreview.net/forum?id=qrwe7XHTmYb.](https://openreview.net/forum?id=qrwe7XHTmYb)

Mike Lewis, Shruti Bhosale, Tim Dettmers, Naman Goyal, and Luke Zettlemoyer. BASE layers: Simplifying training of large, sparse models. In Proceedings of the 38th International Conference on Machine Learning, volume 139 of Proceedings of Machine Learning Research, pages 6265–6274, 2021. [https://proceedings.mlr.press/v139/lewis21a.html.](https://proceedings.mlr.press/v139/lewis21a.html)

Shen Li, Yanli Zhao, Rohan Varma, Omkar Salpekar, Pieter Noordhuis, Teng Li, Adam Paszke, Jeff Smith, Brian Vaughan, Pritam Damania, and Soumith Chintala. PyTorch Distributed: Experiences on accelerating data parallel training. Proceedings of the VLDB Endowment, 13(12):3005–3018, 2020. doi: 10.14778/3415478.3415530. [https://www.vldb.org/pvldb/vol13/p3005-li.pdf.](https://www.vldb.org/pvldb/vol13/p3005-li.pdf)

Xinyu Lian, Sam Ade Jacobs, Lev Kurilenko, Masahiro Tanaka, Stas Bekman, Olatunji Ruwase, and Minjia Zhang. Universal checkpointing: A flexible and efficient distributed checkpointing system for Large-Scale DNN training with reconfigurable parallelism. In 2025 USENIX Annual Technical Conference (USENIX ATC 25), pages 1519–1534. USENIX Association, 2025. [https://www.usenix.org/conference/atc25/presentation/lian.](https://www.usenix.org/conference/atc25/presentation/lian)

Seng Pei Liew, Takuya Kato, and Sho Takase. Scaling laws for upcycling mixture-of-experts language models. In Proceedings of the 42nd International Conference on Machine Learning, volume 267 of Proceedings of Machine Learning Research, pages 37682–37704, 2025. [https://proceedings.mlr.press/v267/liew25a.html.](https://proceedings.mlr.press/v267/liew25a.html)

Dennis Liu, Zijie Yan, Xin Yao, Tong Liu, Vijay Korthikanti, Evan Wu, Shiqing Fan, Gao Deng, Hongxiao Bai, Jianbin Chang, Ashwath Aithal, Michael Andersch, Mohammad Shoeybi, Jiajie Yao, Chandler Zhou, David Wu, Xipeng Li, and June Yang. MoE Parallel Folding: Heterogeneous parallelism mappings for efficient large-scale MoE model training with Megatron Core. Technical Report arXiv:2504.14960v3, NVIDIA, 2025a. [https://arxiv.org/abs/2504.14960v3](https://arxiv.org/abs/2504.14960v3). Version 3.

Hao Liu, Matei Zaharia, and Pieter Abbeel. RingAttention with blockwise transformers for near-infinite context. In The Twelfth International Conference on Learning Representations, 2024. [https://openreview.net/forum?id=WsRHpHH4s0.](https://openreview.net/forum?id=WsRHpHH4s0)

Jingyuan Liu, Jianlin Su, Xingcheng Yao, Zhejun Jiang, Guokun Lai, Yulun Du, Yidao Qin, Weixin Xu, Enzhe Lu, Junjie Yan, et al. Muon is scalable for LLM training. Technical Report 2502.16982, arXiv, 2025b. [https://arxiv.org/abs/2502.16982](https://arxiv.org/abs/2502.16982).

Yuxi Liu. Mixture of experts. Yuxi on the Wired, January 2024. [https://yuxi.ml/essays/mixture-of-experts.](https://yuxi.ml/essays/mixture-of-experts)Published 2024-01-23; accessed 2026-07-15.

Ilya Loshchilov and Frank Hutter. Decoupled weight decay regularization. In International Conference on Learning Representations, 2019. [https://openreview.net/forum?id=Bkg6RiCqY7.](https://openreview.net/forum?id=Bkg6RiCqY7)

Jan Lucas and Ben Juurlink. ALUPower: Data dependent power consumption in GPUs. In 2016 IEEE 24th International Symposium on Modeling, Analysis and Simulation of Computer and Telecommunication Systems, pages 95–104, 2016. doi: 10.1109/MASCOTS.2016.21. [https://doi.org/10.1109/MASCOTS.2016.21.](https://doi.org/10.1109/MASCOTS.2016.21)

Jan Ludziejewski, Jakub Krajewski, Kamil Adamczewski, Maciej Pióro, Michał Krutul, Szymon Antoniak, Kamil Ciebiera, Krystian Król, Tomasz Odrzygóźdź, Piotr Sankowski, Marek Cygan, and Sebastian Jaszczur. Scaling laws for fine-grained mixture of experts. In Proceedings of the 41st International Conference on Machine Learning,

<!-- page 162 of 168 -->

volume 235 of Proceedings of Machine Learning Research, pages 33270–33288. PMLR, 2024. [https://proceedings.mlr.press/v235/ludziejewski24a.html.](https://proceedings.mlr.press/v235/ludziejewski24a.html)

Minxuan Lv, Zhenpeng Su, Leiyu Pan, Yizhe Xiong, Zijia Lin, Hui Chen, Wei Zhou, Jungong Han, Guiguang Ding, Wenwu Ou, Di Zhang, Kun Gai, and Songlin Hu. DSMoE: Matrix-partitioned experts with dynamic routing for computation-efficient dense LLMs. In Proceedings of the 2025 Conference on Empirical Methods in Natural Language Processing, pages 19711–19722, 2025. doi: 10.18653/v1/2025.emnlp-main.997. [https://aclanthology.org/2025.emnlp-main.997/.](https://aclanthology.org/2025.emnlp-main.997/)

Jiaqi Ma, Zhe Zhao, Xinyang Yi, Jilin Chen, Lichan Hong, and Ed H. Chi. Modeling task relationships in multi-task learning with multi-gate mixture-of-experts. In Proceedings of the 24th ACM SIGKDD International Conference on Knowledge Discovery and Data Mining, pages 1930–1939, 2018. doi: 10.1145/3219819.3220007. [https://doi.org/10.1145/3219819.3220007.](https://doi.org/10.1145/3219819.3220007)

Sadhika Malladi, Kaifeng Lyu, Abhishek Panigrahi, and Sanjeev Arora. On the SDEs and scaling rules for adaptive gradient algorithms. In Advances in Neural Information Processing Systems, volume 35, pages 7697–7711, 2022. [https://proceedings.neurips.cc/paper\_files/paper/2022/hash/32ac710102f0620d0f28d5d05a44fe08-Abstract.html.](https://proceedings.neurips.cc/paper_files/paper/2022/hash/32ac710102f0620d0f28d5d05a44fe08-Abstract.html)

Pak Markthub, Jim Dinan, Sreeram Potluri, and Seth Howell. Improving network performance of HPC systems using NVIDIA Magnum IO NVSHMEM and GPUDirect Async. NVIDIA Technical Blog, November 2022. [https://developer.nvidia.com/blog/improving-network-performance-of-hpc-systems-using-nvidia-magnum-io-nvshmem-and-gpudirect-async/.](https://developer.nvidia.com/blog/improving-network-performance-of-hpc-systems-using-nvidia-magnum-io-nvshmem-and-gpudirect-async/)Published 2022-11-22; InfiniBand GPUDirect Async section and Figure 2; accessed 2026-09-19.

Sam McCandlish, Jared Kaplan, Dario Amodei, and OpenAI Dota Team. An empirical model of large-batch training. Technical Report arXiv:1812.06162, OpenAI, 2018. [https://arxiv.org/abs/1812.06162.](https://arxiv.org/abs/1812.06162)

Will Merrill, Shane Arora, Dirk Groeneveld, and Hanna Hajishirzi. Critical batch size revisited: A simple empirical approach to large-batch language model training. In Advances in Neural Information Processing Systems, volume 38, pages 116936–116959, 2025. [https://proceedings.neurips.cc/paper\_files/paper/2025/hash/a99f732df9b668284b449da0214a3286-Abstract-Conference.html.](https://proceedings.neurips.cc/paper_files/paper/2025/hash/a99f732df9b668284b449da0214a3286-Abstract-Conference.html)

Meta AI. The Llama 4 herd: The beginning of a new era of natively multimodal AI innovation, April 2025. [https://ai.meta.com/blog/llama-4-multimodal-intelligence/.](https://ai.meta.com/blog/llama-4-multimodal-intelligence/)

Paulius Micikevicius, Sharan Narang, Jonah Alben, Gregory Diamos, Erich Elsen, David Garcia, Boris Ginsburg, Michael Houston, Oleksii Kuchaiev, Ganesh Venkatesh, and Hao Wu. Mixed precision training. In International Conference on Learning Representations, 2018. [https://openreview.net/forum?id=r1gs9JgRZ.](https://openreview.net/forum?id=r1gs9JgRZ)

Paulius Micikevicius, Dusan Stosic, Neil Burgess, Marius Cornea, Pradeep Dubey, Richard Grisenthwaite, Sangwon Ha, Alexander Heinecke, Patrick Judd, John Kamalu, Naveen Mellempudi, Stuart Oberman, Mohammad Shoeybi, Michael Siu, and Hao Wu. FP8 formats for deep learning. arXiv preprint arXiv:2209.05433, 2022. [https://arxiv.org/abs/2209.05433](https://arxiv.org/abs/2209.05433).

MiniMax. MiniMax-M3 model card, 2026. [https://huggingface.co/MiniMaxAI/MiniMax-M3.](https://huggingface.co/MiniMaxAI/MiniMax-M3) Accessed 2026-07-10.

Asit Mishra, Dusan Stosic, and Simon Layton. Recipes for pre-training LLMs with MXFP8. Technical Report arXiv:2506.08027v1, arXiv, 2025. [https://arxiv.org/abs/2506.08027v1.](https://arxiv.org/abs/2506.08027v1) Version 1.

Mistral AI. Mistral Inference. GitHub, 2026. [https://github.com/mistralai/mistral-inference/tree/9eaeb91c17450e09021b6065a1d5cc69876507c8.](https://github.com/mistralai/mistral-inference/tree/9eaeb91c17450e09021b6065a1d5cc69876507c8)Mixtral routing implementation audited at commit 9eaeb91c17450e09021b6065a1d5cc69876507c8.

Mistral AI Team. Mixtral of experts, December 2023. [https://mistral.ai/news/mixtral-of-experts/.](https://mistral.ai/news/mixtral-of-experts/) Release announcement, December 11, 2023; accessed 2026-09-19.

Moonshot AI. Kimi-K2.5 model card, 2026. [https://huggingface.co/moonshotai/Kimi-K2.5/blob/4d01dfe0332d63057c186e0b262165819efb6611/README.md.](https://huggingface.co/moonshotai/Kimi-K2.5/blob/4d01dfe0332d63057c186e0b262165819efb6611/README.md)Model Summary; revision 4d01dfe0332d63057c186e0b262165819efb6611; accessed 2026-09-19.

Niklas Muennighoff, Luca Soldaini, Dirk Groeneveld, Kyle Lo, Jacob Morrison, Sewon Min, Weijia Shi, Pete Walsh, Oyvind Tafjord, Nathan Lambert, Yuling Gu, Shane Arora, Akshita Bhagia, Dustin Schwenk, David Wadden, Alexander Wettig, Binyuan Hui, Tim Dettmers, Douwe Kiela, Ali Farhadi, Noah A. Smith, Pang Wei Koh, Amanpreet Singh, and Hannaneh Hajishirzi. OLMoE: Open mixture-of-experts language models. arXiv preprint arXiv:2409.02060, 2024. doi: 10.48550/arXiv.2409.02060. [https://arxiv.org/abs/2409.02060.](https://arxiv.org/abs/2409.02060)

<!-- page 163 of 168 -->

Taishi Nakamura, Takuya Akiba, Kazuki Fujii, Yusuke Oda, Rio Yokota, and Jun Suzuki. Drop-upcycling: Training sparse mixture of experts with partial re-initialization. In International Conference on Learning Representations, 2025. [https://proceedings.iclr.cc/paper\_files/paper/2025/hash/d24b7366d714b09a977946ef0d9bf3ad-Abstract-Conference.html.](https://proceedings.iclr.cc/paper_files/paper/2025/hash/d24b7366d714b09a977946ef0d9bf3ad-Abstract-Conference.html)

Deepak Narayanan, Aaron Harlap, Amar Phanishayee, Vivek Seshadri, Nikhil R. Devanur, Gregory R. Ganger, Phillip B. Gibbons, and Matei Zaharia. PipeDream: Generalized pipeline parallelism for DNN training. In Proceedings of the 27th ACM Symposium on Operating Systems Principles, pages 1–15, 2019. doi: 10.1145/3341301.3359646. [https://doi.org/10.1145/3341301.3359646.](https://doi.org/10.1145/3341301.3359646)

Deepak Narayanan, Mohammad Shoeybi, Jared Casper, Patrick LeGresley, Mostofa Patwary, Vijay Anand Korthikanti, Dmitri Vainbrand, Prethvi Kashinkunti, Julie Bernauer, Bryan Catanzaro, Amar Phanishayee, and Matei Zaharia. Efficient large-scale language model training on GPU clusters using Megatron-LM. In Proceedings of the International Conference for High Performance Computing, Networking, Storage and Analysis, pages 1–15, 2021. doi: 10.1145/3458817.3476209. [https://doi.org/10.1145/3458817.3476209.](https://doi.org/10.1145/3458817.3476209)

NVIDIA. Parallel Thread Execution ISA 8.8, 2025a. [https://docs.nvidia.com/cuda/archive/12.9.1/parallel-thread-execution/index.html.](https://docs.nvidia.com/cuda/archive/12.9.1/parallel-thread-execution/index.html) CUDA 12.9.1 archive; accessed 2026-07-13.

NVIDIA. NVIDIA RTX PRO Blackwell GPU Architecture. Technical report, NVIDIA Corporation, 2025b. [https://www.nvidia.com/content/dam/en-zz/Solutions/design-visualization/quadro-product-literature/pdf/NVIDIA-RTX-Blackwell-PRO-GPU-Architecture-v1\_1.pdf.](https://www.nvidia.com/content/dam/en-zz/Solutions/design-visualization/quadro-product-literature/pdf/NVIDIA-RTX-Blackwell-PRO-GPU-Architecture-v1_1.pdf) Version 1.1; accessed 2026-07-13.

NVIDIA. CUDA GPUDirect RDMA, 2026a. [https://docs.nvidia.com/cuda/gpudirect-rdma/index.html.](https://docs.nvidia.com/cuda/gpudirect-rdma/index.html)Accessed 2026-07-13.

NVIDIA. Components. NVIDIA HGX AI Factory Enterprise Reference Architecture, 2026b. [https://docs.nvidia.com/enterprise-reference-architectures/hgx-ai-factory/latest/components.html.](https://docs.nvidia.com/enterprise-reference-architectures/hgx-ai-factory/latest/components.html)Accessed 2026-07-13.

NVIDIA. Megatron Core TransformerConfig API. Developer documentation, 2026c. [https://docs.nvidia.com/megatron-core/developer-guide/latest/apidocs/core/core.transformer.transformer\_config.html.](https://docs.nvidia.com/megatron-core/developer-guide/latest/apidocs/core/core.transformer.transformer_config.html)Documents expert-level and expert-rank MoE capacity factors; accessed 2026-07-16.

NVIDIA. Megatron-LM, 2026d. [https://github.com/NVIDIA/Megatron-LM.](https://github.com/NVIDIA/Megatron-LM) MoE merge paths audited at commit 48a887fecd01674346f724dcf44f417f455989f0; standard distributed-optimizer layout audited at commit 4bf7fca050ae55ef58e299003fd12d769aac81e0.

NVIDIA. Megatron-LM: Buffered global load-balancing loss implementation. Source code, 2026e. [https://github.com/NVIDIA/Megatron-LM/tree/addc601f57ed539506183b704bb9d08f459d7f50/megatron/core/transformer/moe](https://github.com/NVIDIA/Megatron-LM/tree/addc601f57ed539506183b704bb9d08f459d7f50/megatron/core/transformer/moe). router.py and moe\_utils.py; commit addc601f57ed539506183b704bb9d08f459d7f50; accessed 2026-09-19.

NVIDIA. NCCL collective operations, 2026f. [https://docs.nvidia.com/deeplearning/nccl/user-guide/docs/usage/collectives.html.](https://docs.nvidia.com/deeplearning/nccl/user-guide/docs/usage/collectives.html) Accessed 2026-07-13.

NVIDIA. Nemotron 3 Ultra: Open, efficient mixture-of-experts hybrid Mamba-transformer model for agentic reasoning. Technical Report arXiv:2606.15007, NVIDIA, 2026g. [https://arxiv.org/abs/2606.15007.](https://arxiv.org/abs/2606.15007)

NVIDIA. NVSHMEM memory model, 2026h. [https://docs.nvidia.com/nvshmem/api/gen/mem-model.html.](https://docs.nvidia.com/nvshmem/api/gen/mem-model.html)Accessed 2026-07-13.

NVIDIA. Quantum-X800 InfiniBand Platform, 2026i. [https://www.nvidia.com/en-us/networking/products/infiniband/quantum-x800/.](https://www.nvidia.com/en-us/networking/products/infiniband/quantum-x800/) Accessed 2026-07-13.

NVIDIA. Blackwell SM100 GEMMs, 2026j. [https://docs.nvidia.com/cutlass/latest/media/docs/cpp/blackwell\_functionality.html.](https://docs.nvidia.com/cutlass/latest/media/docs/cpp/blackwell_functionality.html) CUTLASS documentation; accessed 2026-07-13.

NVIDIA. CUDA Programming Guide: Asynchronous execution, 2026k. [https://docs.nvidia.com/cuda/cuda-programming-guide/02-basics/asynchronous-execution.html.](https://docs.nvidia.com/cuda/cuda-programming-guide/02-basics/asynchronous-execution.html)Accessed 2026-07-12.

<!-- page 164 of 168 -->

NVIDIA. CUDA Programming Guide: CUDA graphs, 2026l. [https://docs.nvidia.com/cuda/cuda-programming-guide/04-special-topics/cuda-graphs.html.](https://docs.nvidia.com/cuda/cuda-programming-guide/04-special-topics/cuda-graphs.html) Accessed 2026-07-12.

NVIDIA. CUTLASS: Grouped kernel schedulers, 2026m. [https://docs.nvidia.com/cutlass/4.3.5/media/docs/cpp/grouped\_scheduler.html.](https://docs.nvidia.com/cutlass/4.3.5/media/docs/cpp/grouped_scheduler.html) Accessed 2026-07-13.

NVIDIA. CUTLASS SM120 grouped GEMM example, 2026n. https://github.com/NVIDIA/cutlass/blob/da5e086dab31d63815acafdac9a9c5893b1c69e2/examples/79[blackwell\_geforce\_gemm/79d\_blackwell\_geforce\_nvfp4\_grouped\_gemm.cu.](https://github.com/NVIDIA/cutlass/blob/da5e086dab31d63815acafdac9a9c5893b1c69e2/examples/79_blackwell_geforce_gemm/79d_blackwell_geforce_nvfp4_grouped_gemm.cu) Pinned source snapshot bundled with the audited PyTorch tree; accessed 2026-07-15.

NVIDIA. Compressible memory, 2026o. [https://docs.nvidia.com/cuda/cuda-programming-guide/04-special-topics/virtual-memory-management.html#compressible-memory.](https://docs.nvidia.com/cuda/cuda-programming-guide/04-special-topics/virtual-memory-management.html#compressible-memory) CUDA Programming Guide; accessed 2026-07-13.

NVIDIA. cuBLAS: 16/32-element 1D block scaling for FP8 and FP4 data types, 2026p. [https://docs.nvidia.com/cuda/cublas/#element-1d-block-scaling-for-fp8-and-fp4-data-types.](https://docs.nvidia.com/cuda/cublas/#element-1d-block-scaling-for-fp8-and-fp4-data-types)Accessed 2026-07-12.

NVIDIA. NVIDIA H100 Tensor Core GPU product specifications, 2026q. [https://www.nvidia.com/en-us/data-center/h100/.](https://www.nvidia.com/en-us/data-center/h100/) Accessed 2026-07-12.

NVIDIA. NVIDIA HGX B200/B300 platform specifications, 2026r. [https://www.nvidia.com/en-us/data-center/hgx/.](https://www.nvidia.com/en-us/data-center/hgx/) Accessed 2026-09-18.

NVIDIA. Hopper Tuning Guide: Inline compression, 2026s. [https://docs.nvidia.com/cuda/hopper-tuning-guide/index.html#inline-compression.](https://docs.nvidia.com/cuda/hopper-tuning-guide/index.html#inline-compression) Section 1.4.2.3; accessed 2026-07-13.

NVIDIA. NVSHMEM: Using NVSHMEM, 2026t. [https://docs.nvidia.com/nvshmem/api/using.html.](https://docs.nvidia.com/nvshmem/api/using.html) Accessed 2026-07-12.

NVIDIA. tcgen05 MMA programming guide, 2026u. [https://docs.nvidia.com/cutlass/latest/media/docs/pythonDSL/guides/mma/tcgen05\_programming.html.](https://docs.nvidia.com/cutlass/latest/media/docs/pythonDSL/guides/mma/tcgen05_programming.html)CUTLASS documentation; accessed 2026-07-13.

NVIDIA. TensorRT support matrix: GPU architecture and precision support, 2026v. [https://docs.nvidia.com/deeplearning/tensorrt/latest/getting-started/support-matrix.html.](https://docs.nvidia.com/deeplearning/tensorrt/latest/getting-started/support-matrix.html)Interactive multi-release matrix; TensorRT 10.14.1 rows consulted; accessed 2026-07-13.

NVIDIA. Transformer Engine: MXFP8 training, 2026w. [https://docs.nvidia.com/deeplearning/transformer-engine/features/low\_precision\_training/mxfp8/mxfp8.html.](https://docs.nvidia.com/deeplearning/transformer-engine/features/low_precision_training/mxfp8/mxfp8.html) Transformer Engine 2.19.0 documentation; accessed 2026-09-19.

Open Compute Project. OCP Microscaling Formats (MX) Specification, version 1.0. Technical report, Open Compute Project Foundation, 2023. [https://www.opencompute.org/documents/ocp-microscaling-formats-mx-v1-0-spec-final-pdf.](https://www.opencompute.org/documents/ocp-microscaling-formats-mx-v1-0-spec-final-pdf)

OpenAI. gpt-oss-120b & gpt-oss-20b model card. arXiv preprint arXiv:2508.10925, 2025. doi: 10.48550/arXiv.2508.10925. [https://arxiv.org/abs/2508.10925.](https://arxiv.org/abs/2508.10925)

Long Ouyang, Jeffrey Wu, Xu Jiang, Diogo Almeida, Carroll Wainwright, Pamela Mishkin, Chong Zhang, Sandhini Agarwal, Katarina Slama, Alex Ray, et al. Training language models to follow instructions with human feedback. In Advances in Neural Information Processing Systems, volume 35, 2022. [https://proceedings.neurips.cc/paper\_files/paper/2022/hash/b1efde53be364a73914f58805a001731-Abstract-Conference.html.](https://proceedings.neurips.cc/paper_files/paper/2022/hash/b1efde53be364a73914f58805a001731-Abstract-Conference.html)

Pitch Patarasuk and Xin Yuan. Bandwidth optimal all-reduce algorithms for clusters of workstations. Journal of Parallel and Distributed Computing, 69(2):117–124, 2009. doi: 10.1016/j.jpdc.2008.09.002. [https://doi.org/10.1016/j.jpdc.2008.09.002.](https://doi.org/10.1016/j.jpdc.2008.09.002)

PyTorch Contributors. Distributed data parallel notes, 2026a. [https://docs.pytorch.org/docs/stable/notes/ddp.html.](https://docs.pytorch.org/docs/stable/notes/ddp.html) Accessed 2026-07-13.

PyTorch Contributors. Distributed communication package: all\_to\_all\_single, 2026b. [https://docs.pytorch.org/docs/stable/distributed.html.](https://docs.pytorch.org/docs/stable/distributed.html) Accessed 2026-07-13.

<!-- page 165 of 168 -->

PyTorch Contributors. torch.distributed.tensor (DTensor), 2026c. [https://docs.pytorch.org/docs/stable/distributed.tensor.html.](https://docs.pytorch.org/docs/stable/distributed.tensor.html) Accessed 2026-08-29.

PyTorch Contributors. fully\_shard: FSDP2 documentation, 2026d. [https://docs.pytorch.org/docs/stable/distributed.fsdp.fully\_shard.html.](https://docs.pytorch.org/docs/stable/distributed.fsdp.fully_shard.html) Accessed 2026-07-13.

PyTorch Contributors. torch.utils.checkpoint, 2026e. [https://docs.pytorch.org/docs/stable/checkpoint.html.](https://docs.pytorch.org/docs/stable/checkpoint.html)Accessed 2026-07-13.

PyTorch Contributors. CUDA Semantics, 2026f. [https://docs.pytorch.org/docs/main/notes/cuda.html.](https://docs.pytorch.org/docs/main/notes/cuda.html)Accessed 2026-07-12.

PyTorch Contributors. torch.distributed.checkpoint, 2026g. [https://docs.pytorch.org/docs/stable/distributed.checkpoint.html.](https://docs.pytorch.org/docs/stable/distributed.checkpoint.html) Accessed 2026-07-13.

PyTorch Contributors. torch.empty documentation, 2026h. [https://docs.pytorch.org/docs/stable/generated/torch.empty.html.](https://docs.pytorch.org/docs/stable/generated/torch.empty.html) Accessed 2026-07-13.

PyTorch Contributors. CUDA Grouped Matrix Multiplication Backend, 2026i. [https://github.com/pytorch/pytorch/blob/1c23e463efdf735913fabb00c48f0d0e5f6e2282/aten/src/ATen/native/cuda/GroupedBlas.cpp.](https://github.com/pytorch/pytorch/blob/1c23e463efdf735913fabb00c48f0d0e5f6e2282/aten/src/ATen/native/cuda/GroupedBlas.cpp)Pinned source snapshot audited for this report; accessed 2026-07-15.

PyTorch Contributors. Grouped matrix multiplication fallback, 2026j. [https://github.com/pytorch/pytorch/blob/1c23e463efdf735913fabb00c48f0d0e5f6e2282/aten/src/ATen/native/GroupedMMUtils.h.](https://github.com/pytorch/pytorch/blob/1c23e463efdf735913fabb00c48f0d0e5f6e2282/aten/src/ATen/native/GroupedMMUtils.h) Pinned source snapshot audited for this report; accessed 2026-07-15.

PyTorch Contributors. torch.nonzero, 2026k. [https://docs.pytorch.org/docs/stable/generated/torch.nonzero.html.](https://docs.pytorch.org/docs/stable/generated/torch.nonzero.html) Accessed 2026-07-12.

PyTorch Contributors. torch.cuda.set\_sync\_debug\_mode, 2026l. [https://docs.pytorch.org/docs/stable/generated/torch.cuda.set\_sync\_debug\_mode.html.](https://docs.pytorch.org/docs/stable/generated/torch.cuda.set_sync_debug_mode.html) Accessed 2026-07-12.

Penghui Qi, Xinyi Wan, Nyamdavaa Amar, and Min Lin. Pipeline parallelism with controllable memory. In Advances in Neural Information Processing Systems, volume 37, pages 46539–46566, 2024a. [https://papers.nips.cc/paper\_files/paper/2024/hash/527dad0b9159805289906d5740a0bdd3-Abstract-Conference.html.](https://papers.nips.cc/paper_files/paper/2024/hash/527dad0b9159805289906d5740a0bdd3-Abstract-Conference.html)

Penghui Qi, Xinyi Wan, Guangxing Huang, and Min Lin. Zero bubble (almost) pipeline parallelism. In International Conference on Learning Representations, 2024b. [https://openreview.net/forum?id=tuzTN0eIO5.](https://openreview.net/forum?id=tuzTN0eIO5)

Zihan Qiu, Zeyu Huang, Bo Zheng, Kaiyue Wen, Zekun Wang, Rui Men, Ivan Titov, Dayiheng Liu, Jingren Zhou, and Junyang Lin. Demons in the detail: On implementing load balancing loss for training specialized mixture-of-expert models. In Proceedings of the 63rd Annual Meeting of the Association for Computational Linguistics (Volume 1: Long Papers), pages 5005–5018, Vienna, Austria, July 2025. Association for Computational Linguistics. doi: 10.18653/v1/2025.acl-long.249. [https://aclanthology.org/2025.acl-long.249/.](https://aclanthology.org/2025.acl-long.249/)

Qwen Team. Qwen1.5-MoE: Matching 7B model performance with 1/3 activated parameters, 2024a. [https://qwenlm.github.io/blog/qwen-moe/.](https://qwenlm.github.io/blog/qwen-moe/)

Qwen Team. Qwen1.5-MoE-A2.7B released model configuration, 2024b. [https://huggingface.co/Qwen/Qwen1.5-MoE-A2.7B/blob/1a758c50ecb6350748b9ce0a99d2352fd9fc11c9/config.json.](https://huggingface.co/Qwen/Qwen1.5-MoE-A2.7B/blob/1a758c50ecb6350748b9ce0a99d2352fd9fc11c9/config.json)Revision 1a758c50ecb6350748b9ce0a99d2352fd9fc11c9; accessed 2026-09-19.

Qwen Team. Qwen2-57B-A14B released model configuration, 2024c. [https://huggingface.co/Qwen/Qwen2-57B-A14B/blob/f29d6a182178ddf39f68f403361779b2d37fdce8/config.json.](https://huggingface.co/Qwen/Qwen2-57B-A14B/blob/f29d6a182178ddf39f68f403361779b2d37fdce8/config.json)Revision f29d6a182178ddf39f68f403361779b2d37fdce8; accessed 2026-09-19.

Qwen Team. Qwen3.5-35B-A3B model card, 2026a. [https://huggingface.co/Qwen/Qwen3.5-35B-A3B.](https://huggingface.co/Qwen/Qwen3.5-35B-A3B)

Qwen Team. Qwen3.5-397B-A17B model card, 2026b. [https://huggingface.co/Qwen/Qwen3.5-397B-A17B.](https://huggingface.co/Qwen/Qwen3.5-397B-A17B)

Qwen Team, Alibaba Group, and Hugging Face Team. Qwen2 MoE implementation in Transformers, 2024. [https://github.com/huggingface/transformers/blob/573565e35a5cc68f6cfb6337f5a93753ab16c65b/src/transformers/models/qwen2\_moe/modeling\_qwen2\_moe.py.](https://github.com/huggingface/transformers/blob/573565e35a5cc68f6cfb6337f5a93753ab16c65b/src/transformers/models/qwen2_moe/modeling_qwen2_moe.py) Transformers v4.41.2; commit 573565e35a5cc68f6cfb6337f5a93753ab16c65b; Qwen2MoeSparseMoeBlock; accessed 2026-09-19.

Rafael Rafailov, Archit Sharma, Eric Mitchell, Christopher D. Manning, Stefano Ermon, and Chelsea Finn. Direct preference optimization: Your language model is secretly a reward model. In Advances in Neural Information

<!-- page 166 of 168 -->

Processing Systems, volume 36, pages 53728–53741, 2023. [https://proceedings.neurips.cc/paper\_files/paper/2023/hash/a85b405ed65c6477a4fe8302b5e06ce7-Abstract-Conference.html.](https://proceedings.neurips.cc/paper_files/paper/2023/hash/a85b405ed65c6477a4fe8302b5e06ce7-Abstract-Conference.html)

Colin Raffel, Noam Shazeer, Adam Roberts, Katherine Lee, Sharan Narang, Michael Matena, Yanqi Zhou, Wei Li, and Peter J. Liu. Exploring the limits of transfer learning with a unified text-to-text transformer. Journal of Machine Learning Research, 21(140):1–67, 2020. [https://jmlr.org/papers/v21/20-074.html.](https://jmlr.org/papers/v21/20-074.html)

Samyam Rajbhandari, Jeff Rasley, Olatunji Ruwase, and Yuxiong He. ZeRO: Memory optimizations toward training trillion parameter models. In Proceedings of the International Conference for High Performance Computing, Networking, Storage and Analysis, pages 1–16, 2020. doi: 10.1109/SC41405.2020.00024. [https://doi.org/10.1109/SC41405.2020.00024.](https://doi.org/10.1109/SC41405.2020.00024)

Samyam Rajbhandari, Conglong Li, Zhewei Yao, Minjia Zhang, Reza Yazdani Aminabadi, Ammar Ahmad Awan, Jeff Rasley, and Yuxiong He. DeepSpeed-MoE: Advancing mixture-of-experts inference and training to power next-generation AI scale. In Proceedings of the 39th International Conference on Machine Learning, volume 162 of Proceedings of Machine Learning Research, pages 18332–18346, 2022. [https://proceedings.mlr.press/v162/rajbhandari22a.html.](https://proceedings.mlr.press/v162/rajbhandari22a.html)

Minsoo Rhu, Natalia Gimelshein, Jason Clemons, Arslan Zulfiqar, and Stephen W. Keckler. vDNN: Virtualized deep neural networks for scalable, memory-efficient neural network design. In 49th Annual IEEE/ACM International Symposium on Microarchitecture (MICRO), pages 1–13, 2016. doi: 10.1109/MICRO.2016.7783721. [https://arxiv.org/abs/1602.08124](https://arxiv.org/abs/1602.08124).

Bita Darvish Rouhani et al. Microscaling data formats for deep learning. arXiv preprint arXiv:2310.10537, 2023. [https://arxiv.org/abs/2310.10537](https://arxiv.org/abs/2310.10537).

John Schulman, Filip Wolski, Prafulla Dhariwal, Alec Radford, and Oleg Klimov. Proximal policy optimization algorithms. arXiv preprint arXiv:1707.06347, 2017. [https://arxiv.org/abs/1707.06347.](https://arxiv.org/abs/1707.06347)

Christopher J. Shallue, Jaehoon Lee, Joseph Antognini, Jascha Sohl-Dickstein, Roy Frostig, and George E. Dahl. Measuring the effects of data parallelism on neural network training. Journal of Machine Learning Research, 20 (112):1–49, 2019. [https://www.jmlr.org/papers/v20/18-789.html.](https://www.jmlr.org/papers/v20/18-789.html)

Zhihong Shao, Peiyi Wang, Qihao Zhu, Runxin Xu, Junxiao Song, Xiao Bi, Haowei Zhang, Mingchuan Zhang, Y. K. Li, Y. Wu, and Daya Guo. DeepSeekMath: Pushing the limits of mathematical reasoning in open language models. arXiv preprint arXiv:2402.03300, 2024. [https://arxiv.org/abs/2402.03300.](https://arxiv.org/abs/2402.03300)

Noam Shazeer. GLU variants improve transformer. arXiv preprint arXiv:2002.05202, 2020. [https://arxiv.org/abs/2002.05202](https://arxiv.org/abs/2002.05202).

Noam Shazeer, Azalia Mirhoseini, Krzysztof Maziarz, Andy Davis, Quoc Le, Geoffrey Hinton, and Jeff Dean. Outrageously large neural networks: The sparsely-gated mixture-of-experts layer. In International Conference on Learning Representations, 2017. [https://openreview.net/forum?id=B1ckMDqlg.](https://openreview.net/forum?id=B1ckMDqlg)

Guangming Sheng, Chi Zhang, Zilingfeng Ye, Xibin Wu, Wang Zhang, Ru Zhang, Yanghua Peng, Haibin Lin, and Chuan Wu. HybridFlow: A flexible and efficient RLHF framework. In Proceedings of the Twentieth European Conference on Computer Systems, pages 1279–1297, 2025. doi: 10.1145/3689031.3696075. [https://doi.org/10.1145/3689031.3696075.](https://doi.org/10.1145/3689031.3696075)

Mohammad Shoeybi, Mostofa Patwary, Raul Puri, Patrick LeGresley, Jared Casper, and Bryan Catanzaro. Megatron-LM: Training multi-billion parameter language models using model parallelism. arXiv preprint arXiv:1909.08053, 2019. [https://arxiv.org/abs/1909.08053.](https://arxiv.org/abs/1909.08053)

Snowflake AI Research. Snowflake Arctic: The best LLM for enterprise AI — efficiently intelligent, truly open, April 2024. [https://www.snowflake.com/en/blog/arctic-open-efficient-foundation-language-models-snowflake/.](https://www.snowflake.com/en/blog/arctic-open-efficient-foundation-language-models-snowflake/)

Jianlin Su. MoE travelogue 2: On load imbalance. Scientific Spaces, February 2025. [https://spaces.ac.cn/archives/10735.](https://spaces.ac.cn/archives/10735) Blog post in Chinese, title translated; published 2025-02-21; accessed 2026-07-15.

Hongyan Tang, Junning Liu, Ming Zhao, and Xudong Gong. Progressive layered extraction (PLE): A novel multi-task learning (MTL) model for personalized recommendations. In Fourteenth ACM Conference on Recommender Systems, pages 269–278, 2020. doi: 10.1145/3383313.3412236. [https://doi.org/10.1145/3383313.3412236.](https://doi.org/10.1145/3383313.3412236)

<!-- page 167 of 168 -->

Team Olmo et al. Olmo 3. arXiv preprint arXiv:2512.13961, 2025. doi: 10.48550/arXiv.2512.13961. [https://arxiv.org/abs/2512.13961](https://arxiv.org/abs/2512.13961).

Philippe Tillet, H. T. Kung, and David Cox. Triton: An intermediate language and compiler for tiled neural network computations. In Proceedings of the 3rd ACM SIGPLAN International Workshop on Machine Learning and Programming Languages, pages 10–19, 2019. [https://doi.org/10.1145/3315508.3329973.](https://doi.org/10.1145/3315508.3329973)

Ashish Vaswani, Noam Shazeer, Niki Parmar, Jakob Uszkoreit, Llion Jones, Aidan N. Gomez, Łukasz Kaiser, and Illia Polosukhin. Attention is all you need. In Advances in Neural Information Processing Systems, volume 30, 2017. [https://proceedings.neurips.cc/paper/2017/hash/3f5ee243547dee91fbd053c1c4a845aa-Abstract.html.](https://proceedings.neurips.cc/paper/2017/hash/3f5ee243547dee91fbd053c1c4a845aa-Abstract.html)

Lean Wang, Huazuo Gao, Chenggang Zhao, Xu Sun, and Damai Dai. Auxiliary-loss-free load balancing strategy for mixture-of-experts. arXiv preprint arXiv:2408.15664, 2024. [https://arxiv.org/abs/2408.15664.](https://arxiv.org/abs/2408.15664)

Jason Wei, Maarten Bosma, Vincent Y. Zhao, Kelvin Guu, Adams Wei Yu, Brian Lester, Nan Du, Andrew M. Dai, and Quoc V. Le. Finetuned language models are zero-shot learners. In International Conference on Learning Representations, 2022. [https://openreview.net/forum?id=gEZrGCozdqR.](https://openreview.net/forum?id=gEZrGCozdqR)

Xiaomi MiMo Team. MiMo-V2.5-Pro model card, 2026. [https://huggingface.co/XiaomiMiMo/MiMo-V2.5-Pro.](https://huggingface.co/XiaomiMiMo/MiMo-V2.5-Pro)

Zijie Yan, Hongxiao Bai, Xin Yao, Dennis Liu, Tong Liu, Hongbin Liu, Pingtian Li, Evan Wu, Shiqing Fan, Li Tao, Robin Zhang, Yuzhong Wang, Shifang Xu, Jack Chang, Xuwen Chen, Kunlun Li, Yan Bai, Gao Deng, Nan Zheng, Vijay Anand Korthikanti, Abhinav Khattar, Ethan He, Soham Govande, Sangkug Lym, Zhongbo Zhu, Qi Zhang, Haochen Yuan, Xiaowei Ren, Deyu Fu, Tailai Ma, Shunkang Zhang, Jiang Shao, Ray Wang, Vasudevan Rengasamy, Rachit Garg, Santosh Bhavani, Xipeng Li, Chandler Zhou, David Wu, Yingcan Wei, Ashwath Aithal, Michael Andersch, Mohammad Shoeybi, Jiajie Yao, and June Yang. Scalable training of mixture-of-experts models with Megatron Core. Technical Report arXiv:2603.07685v2, NVIDIA, 2026. [https://arxiv.org/abs/2603.07685v2](https://arxiv.org/abs/2603.07685v2). Version 2.

An Yang et al. Qwen2 technical report. arXiv preprint arXiv:2407.10671, 2024. doi: 10.48550/arXiv.2407.10671. [https://arxiv.org/abs/2407.10671](https://arxiv.org/abs/2407.10671).

An Yang et al. Qwen3 technical report. arXiv preprint arXiv:2505.09388, 2025. doi: 10.48550/arXiv.2505.09388. [https://arxiv.org/abs/2505.09388](https://arxiv.org/abs/2505.09388).

Z.ai. GLM-5.2 model card and release, 2026. [https://huggingface.co/zai-org/GLM-5.2.](https://huggingface.co/zai-org/GLM-5.2) Expert configuration from the released model configuration; the 744B-A40B parameter figure from the model table of the GLM-5 repository.

Shulai Zhang, Ningxin Zheng, Haibin Lin, Ziheng Jiang, Wenlei Bao, Chengquan Jiang, Qi Hou, Weihao Cui, Size Zheng, Li-Wen Chang, Quan Chen, and Xin Liu. COMET: Fine-grained computation-communication overlapping for mixture-of-experts. In Proceedings of Machine Learning and Systems, volume 7, 2025. [https://proceedings.mlsys.org/paper\_files/paper/2025/hash/e27ea0cd50b798ff8942caf9203f0992-Abstract-Conference.html.](https://proceedings.mlsys.org/paper_files/paper/2025/hash/e27ea0cd50b798ff8942caf9203f0992-Abstract-Conference.html)

Zhengyan Zhang, Yankai Lin, Zhiyuan Liu, Peng Li, Maosong Sun, and Jie Zhou. MoEfication: Transformer feed-forward layers are mixtures of experts. In Findings of the Association for Computational Linguistics: ACL 2022, pages 877–890, 2022. doi: 10.18653/v1/2022.findings-acl.71. [https://aclanthology.org/2022.findings-acl.71/.](https://aclanthology.org/2022.findings-acl.71/)

Chenggang Zhao, Zhean Xu, Liang Zhao, Jiashi Li, Chenhao Xu, Anyi Xu, Shengyu Liu, Kexing Zhou, and Kuai Yu. DeepGEMM: Clean and efficient BLAS kernel library on GPU. [https://github.com/deepseek-ai/DeepGEMM,](https://github.com/deepseek-ai/DeepGEMM)2025a. Includes the fused Mega MoE expert-parallel megakernel; README audited on August 25, 2026.

Chenggang Zhao, Shangyan Zhou, Liyue Zhang, Chengqi Deng, Zhean Xu, Yuxuan Liu, Kuai Yu, Jiashi Li, and Liang Zhao. DeepEP: An efficient expert-parallel communication library. [https://github.com/deepseek-ai/DeepEP,](https://github.com/deepseek-ai/DeepEP) 2025b. V2 documentation audited at commit 60d44037a702f651a6e18bd4aea65ed8409051c2.

Yanli Zhao, Andrew Gu, Rohan Varma, Liang Luo, Chien-Chin Huang, Min Xu, Less Wright, Hamid Shojanazeri, Myle Ott, Sam Shleifer, Alban Desmaison, Can Balioglu, Pritam Damania, Bernard Nguyen, Geeta Chauhan, Yuchen Hao, Ajit Mathews, and Shen Li. PyTorch FSDP: Experiences on scaling fully sharded data parallel. Proceedings of the VLDB Endowment, 16(12):3848–3860, 2023. doi: 10.14778/3611540.3611569. [https://www.vldb.org/pvldb/vol16/p3848-huang.pdf.](https://www.vldb.org/pvldb/vol16/p3848-huang.pdf)

<!-- page 168 of 168 -->

Yanqi Zhou, Tao Lei, Hanxiao Liu, Nan Du, Yanping Huang, Vincent Zhao, Andrew M. Dai, Zhifeng Chen, Quoc V. Le, and James Laudon. Mixture-of-experts with expert choice routing. In Advances in Neural Information Processing Systems, volume 35, pages 7103–7114, 2022. [https://proceedings.neurips.cc/paper\_files/paper/2022/hash/2f00ecd787b432c1d36f3de9800728eb-Abstract-Conference.html.](https://proceedings.neurips.cc/paper_files/paper/2022/hash/2f00ecd787b432c1d36f3de9800728eb-Abstract-Conference.html)

Barret Zoph, Irwan Bello, Sameer Kumar, Nan Du, Yanping Huang, Jeff Dean, Noam Shazeer, and William Fedus. ST-MoE: Designing stable and transferable sparse expert models. Technical Report 2202.08906, arXiv, 2022. [https://arxiv.org/abs/2202.08906](https://arxiv.org/abs/2202.08906).
