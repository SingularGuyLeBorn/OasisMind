<!-- page 1 of 18 -->

arXiv:2507.19427v1 [cs.LG] 25 Jul 2025

# Step-3 is Large yet Affordable: Model-system Co-design for Cost-effective Decoding

StepFun Inc.

## Abstract

Large language models (LLMs) face low hardware efficiency during decoding, especially for long-context reasoning tasks. This paper introduces Step-3, a 321B-parameter VLM with hardware-aware model-system co-design optimized for minimizing decoding costs. Step-3 innovates in two key dimensions: (1) A novel Multi-Matrix Factorization Attention (MFA) mechanism that significantly reduces both KV cache size and computation while maintaining high attention expressiveness, and (2) Attention-FFN Disaggregation (AFD), a distributed inference system that decouples attention and Feed-Forward Network (FFN) layers into specialized subsystems. This co-design achieves unprecedented cost efficiency: Step-3 significantly reduces theoretical decoding costs compared with models like DeepSeek-V3 and Qwen3 MoE 235B, with the gains widening at longer context. Step-3 achieves low cost while activating 38B parameters per token (more than DeepSeek-V3 and Qwen3 MoE 235B), demonstrating that hardware-aligned attention arithmetic intensity, MoE sparsity, and AFD are critical to cost-effectiveness. We perform a head-to-head comparison with DeepSeek-V3 in its favorable scenarios. Our implementation on Hopper GPUs achieves a decoding throughput of up to 4,039 tokens per second per GPU under 50ms TPOT SLA (4K context, FP8, no MTP). It is higher than DeepSeek-V3’s 2,324 in the same setup and sets a new Pareto frontier for LLM decoding.

大型语言模型 (LLMs) 在解码阶段硬件效率低下, 长上下文推理任务尤其如此. 本文提出 Step-3: 一个 321B 参数的 VLM, 采用硬件感知的模型-系统协同设计, 目标是最小化解码成本. Step-3 在两个关键维度上创新: (1) 全新的多矩阵分解注意力 (MFA) 机制, 在保持高注意力表达能力的同时显著降低 KV cache 大小与计算量; (2) 注意力-FFN 解耦 (AFD), 一种把注意力层与前馈网络 (FFN) 层拆分到专用子系统的分布式推理架构. 这套协同设计带来前所未有的成本效率: 与 DeepSeek-V3 和 Qwen3 MoE 235B 等模型相比, Step-3 大幅降低了理论解码成本, 且上下文越长优势越大. Step-3 每个 token 激活 38B 参数 (多于 DeepSeek-V3 与 Qwen3 MoE 235B), 这说明与硬件对齐的注意力算术强度, MoE 稀疏性与 AFD 是成本效益的关键. 我们在对 DeepSeek-V3 有利的场景下与之正面对比. 我们在 Hopper GPU 上的实现在 50ms TPOT SLA 下达到每 GPU 每秒 4,039 token 的解码吞吐 (4K 上下文, FP8, 无 MTP), 高于同设置下 DeepSeek-V3 的 2,324, 刷新了 LLM 解码的 Pareto 前沿.

## 1 Introduction

This paper presents the model-system co-design of Step-3, specifically engineered for the test-time scaling paradigm with the primary optimization objective of minimizing decoding costs. Step-3 has 321 billion total parameters, while for each text token, 38B parameters are activated. We will demonstrate that, although Step-3 is in the multi-hundred billion parameter range and the activated parameters are slightly larger than representative open-weight models like DeepSeek V3 (DSv3) [4], we achieve significantly lower decoding costs with model-system co-design.

本文介绍 Step-3 的模型-系统协同设计, 它专为 test-time scaling 范式打造, 首要优化目标是最小化解码成本. Step-3 总参数 3,210 亿, 每个文本 token 激活 38B 参数. 我们将证明: 尽管 Step-3 处于数千亿参数区间, 激活参数也略大于 DeepSeek V3 (DSv3) [4] 等代表性开源权重模型, 但凭借模型-系统协同设计, 我们实现了显著更低的解码成本.

We focus on optimizing decoding because 1) it is the most

![Chart block](images/p01-figure-1-the-pareto-frontier-of-recent-models-regarding.png)

Figure 1: The Pareto frontier of recent models regarding activated parameters and decoding costs. The darker area is GQA models’ Pareto frontier. Note: Step-3 also has the highest attention effective rank [7], the same as DSv3 and doubling some other models like Qwen3 MoE 235B and Kimi K2.

expensive per token (because of low MFU) compared with training and prefill. 2) For reasoning models, longer thinking leads to higher intelligence, so lowering decoding costs can translate to higher intelligence for fixed-budget scenarios. 3) Faster and cheaper decoding also speeds up the RL training. 4) There is a large room for optimization and is therefore more technically interesting.

我们聚焦解码优化, 因为: 1) 与训练和 prefill 相比, 解码的每 token 成本最高 (MFU 低); 2) 对推理模型来说, 思考越长智能越高, 降低解码成本就能在固定预算下换来更高的智能; 3) 更快更省的解码也能加速 RL 训练; 4) 这里的优化空间很大, 技术上更有意思.

Recently, there emerged several large open-weight models. Some of them explored novel architecture changes on top of traditional Transformers. The innovations focus on the two main Transformer components – there are new attention designs to reduce KV cache overhead during inference, and there are Mixture-of-Experts (MoE) structures to enhance FFN while limiting the growth of computation requirements.

近来涌现出多个大型开源权重模型, 其中一些在传统 Transformer 之上探索了新的架构变化. 创新集中在 Transformer 的两大组件上: 一边是有助于降低推理 KV cache 开销的新注意力设计, 另一边是用 MoE 结构增强 FFN, 同时限制计算需求的增长.

We also started to work on model architecture exploration, e.g., through MoE model development (Step-2 [20]) since late 2023 and MFA [7], a new attention architecture released in late 2024. In the process, observing the recent open-weight models, we identify two common suboptimal practices:

我们也较早开展了模型架构探索, 例如 2023 年末起的 MoE 模型开发 (Step-2 [20]), 以及 2024 年末发布的新注意力架构 MFA [7]. 在此过程中, 观察近来的开源权重模型, 我们识别出两种常见的次优实践:

<!-- page 2 of 18 -->

• For attention, some are overly emphasizing on reducing KV cache sizes, at excessive cost of computation load. It makes the model less cost-effective to run on more affordable but weaker hardware. Meanwhile, it limits the room for other acceleration techniques like quantization and speculative decoding.

• 注意力方面, 有些设计过度强调减小 KV cache, 代价是计算负载过高. 这让模型在更便宜但算力较弱的硬件上运行时性价比变差, 也压缩了量化, 投机解码等其他加速技术的空间.

• For FFN, some are overly emphasizing on pursuing sparser architectures without considering whether they fit today’s hardware. It either harms the hardware efficiency, or lowering model performance without gaining cost advantages.

• FFN 方面, 有些设计过度追求更稀疏的架构, 却不考虑它是否匹配当今硬件. 结果是要么损害硬件效率, 要么是性能下降却换不到成本优势.

Hoping to inspire more discussion and rethinking about the above trends, we report our recent progress, Step-3, and the analysis and rationale behind its design. The outcome is promising – in Figure 1, we show the best theoretical decoding costs of Step-3 and recent models. For each model, we searched for the best deployment strategy based on Attention-FFN Disaggregation (AFD, §3), which we advocate, and any combination of H800, H20, A800 or Ascend 910B.<sup>1</sup> Step-3 largely improves the Pareto frontier of activated parameters and decoding costs. Though not shown in the figure, its advantage continues to widen with longer context.<sup>2</sup>

希望引发对这些趋势的更多讨论与反思, 我们报告近期的进展 Step-3, 以及设计背后的分析与理由. 结果令人鼓舞—Figure 1 展示了 Step-3 与近期模型的最优理论解码成本. 对每个模型, 我们都在自己倡导的注意力-FFN 解耦 (AFD, §3) 框架下, 搜索 H800, H20, A800 或 Ascend 910B 任意组合下的最优部署策略. Step-3 大幅推进了激活参数与解码成本的 Pareto 前沿. 图中没有画出的是, 它的优势随上下文变长还在继续扩大.

Our work is based on the assumption of deploying prior work of Prefill-Decoding (PD) disaggregation [18, 31]. With it, we can focus only on optimizing decoding, without worrying about the impact on prefill. Readers will see similar benefits of deploying AFD, i.e., how it allows us to divideand-conquer attention and FFN designs. It leads to a model architecture whose both parts are more cost-effective. We implement the inference system and show that Step-3 indeed achieves much lower decoding costs compared with other multi-billion parameter models.

我们的工作建立在部署已有 Prefill-Decoding (PD) 解耦 [18, 31] 的前提上. 有了它, 我们只需专注优化解码, 不必担心对 prefill 的影响. 读者将看到部署 AFD 的类似收益: 它让我们对注意力与 FFN 设计分而治之, 得到两部分都更具成本效益的模型架构. 我们实现了这套推理系统, 并表明 Step-3 确实比其他数百亿参数模型实现了低得多的解码成本.

Below is a summary of our findings.

以下是我们发现的总结.

• **Decoding costs go beyond parameter count:** Neither the total parameter count or activated parameter count is a good indicator for decoding costs.

• **解码成本不能只看参数量:** 总参数量和激活参数量都不是解码成本的好指标.

– For example, Qwen-3 MoE 235B exhibits only 10% lower theoretical decoding cost (on H20, the best hardware for it) than DSv3 (on H800, the best hardware for DSv3) despite having 65% fewer total parameters and 40% fewer activated parameters.

– 例如, Qwen-3 MoE 235B 的总参数少 65%, 激活参数少 40%, 但其理论解码成本 (在其最优硬件 H20 上) 仅比 DSv3 (在其最优硬件 H800 上) 低 10%.

– Step-3 achieves ∼ 40% decoding cost reduction versus both models despite its total parameter count being between the two models and having the highest activation parameters.

– Step-3 的总参数量介于两者之间, 激活参数却是最高, 但相对这两个模型都实现了约 40% 的解码成本下降.

• **The attention design dominates decoding costs:** With AFD, we decouple the cost analysis of attention and FFN because we can run them in the most cost-effective way, respectively. Then it becomes apparent that the attention design has a larger impact on decoding costs than (total or

activated) parameter count.

• **注意力设计主导解码成本:** 有了 AFD, 注意力与 FFN 可以各自以最具成本效益的方式运行, 我们将两者的成本分析解耦. 于是可以清楚看到: 注意力设计对解码成本的影响大于 (总或激活) 参数量.

• **KV cache size is not the single factor impacting attention costs:** We find that some attention designs requires too much computation (too high arithmetic intensity) for lowercost hardware platforms. More importantly, we are the first to show this problem indeed affects the final decoding costs and thus leaves large room for Step-3 to achieve significant cost savings.

• **KV cache 大小不是影响注意力成本的唯一因素:** 我们发现, 某些注意力设计对低成本硬件平台而言计算量 (算术强度) 过高. 更重要的是, 我们首次证明这个问题确实会影响最终解码成本, 也因此给 Step-3 留出了大幅降低成本的空间.

• **MoE needs hardware-aware design:** The degree of MoE sparsity must joinly consider hardware’s computation power, memory bandwidth and network bandwidth. Overly sparse models may have small activated parameters on paper, but run inefficiently on today’s hardware.

• **MoE 需要硬件感知的设计:** MoE 稀疏程度必须联合考虑硬件算力, 内存带宽与网络带宽. 过度稀疏的模型纸面激活参数虽小, 在当今硬件上的运行效率却很差.

• **For decoding acceleration, the devil is in the details:** Linear attention, quantization, and MTP are all promising directions to accelerate decoding. However, some design points that may seem nuance can remove most of the benefits in decoding.

• **解码加速, 成败在细节:** 线性注意力, 量化与 MTP 都是有前景的解码加速方向. 但有些看似细微的设计差异, 就可能抹掉解码收益的大部分.

• **AFD deployment:** We believe it is the superior decoding system design compared with existing solutions, because of the following unique advantages:

• **AFD 部署:** 我们相信它是比现有方案更优的解码系统设计, 因为它有以下几个独特优势:

– Facilitating divide-and-conquer model design.

– 便于模型设计分而治之.

– Easy scaling of attention instances to handle dynamic context length.

– 注意力实例易于扩展, 应对动态上下文长度.

– Always keeping an ideal batch size for FFN to achieve high MFU, independent from attention.

– FFN 始终保有理想 batch size 以实现高 MFU, 不受注意力侧影响.

– Overlapping communication overhead with a perfectly balanced pipeline.

– 通信开销可与完美均衡的流水线重叠.

– Reducing the scale requirement compared with DeepEP [30], and getting better reliability and less EP imbalance.

– 相比 DeepEP [30] 降低了对集群规模的要求, 可靠性更好, EP 负载不均也更小.

– Allowing the use of heterogeneous hardware to further reduce decoding costs.

– 允许使用异构硬件, 进一步降低解码成本.

## 2 Step-3 Model Card

Before diving into the model-system co-design details, we briefly describe Step-3.



进入模型-系统协同设计细节之前, 先简要交代 Step-3.

Step-3 is built upon the Transformer architecture [24], with each Transformer block comprising an attention module and a Feed-Forward Network (FFN). For the attention mechanism, we introduce Multi-Matrix Factorization Attention (MFA) [7], which leverages low-rank matrix factorization in the Query-Key (QK) circuit [5]. This design enables parameter-efficient scaling of both the number and dimensionality of attention heads while minimizing KV cache overhead. For FFNs, we adopt a shared expert design inspired by DeepSeekMoE, incorporating Mixture-of-Experts (MoE) layers. Our configuration includes 61 Transformer layers with a hidden dimension of 7168. For MFA, we configure 64 query heads and they share a Key and a Value head, all with a dimension of 256. The query dimension is down-projected from 7168 to a lower-rank of 2048, followed by a normalization, and then up-projected to 64\*256. MoE layers are applied to all FFNs except the first four and the last layer. Under this setup, Step-3 comprises



Step-3 建在 Transformer [24] 上, 每块含 attention 与 FFN. attention 侧引入 Multi-Matrix Factorization Attention (MFA) [7], 在 Query-Key (QK) 电路 [5] 做低秩矩阵分解, 以便用较少参数放大 head 数与维度, 同时压低 KV cache. FFN 侧采用受 DeepSeekMoE 启发的共享专家设计, 并接入 MoE 层. 配置为 61 层 Transformer, 隐宽 7168. MFA: 64 个 query head, 共享 1 个 Key 与 1 个 Value head, 头维均为 256. query 从 7168 下投影到低秩 2048, 经归一化后再上投影到 64×256. 除前四层与最后一层外, FFN 全部走 MoE. 在此设定下 Step-3 包含

<small><span class="docvortex-page-footnote" data-block-type="page_footnote" style="color:#6b7280"><sup>1</sup>In practice, the FFN part of DSv3, Kimi K2 and Llama 4 Maverick may suffer from MoE over-sparsity (§5.4) and be farther from theoretical costs. In Figure 1, we give them a favor by ignoring the issue.</span></small>

<small><span class="docvortex-page-footnote" data-block-type="page_footnote" style="color:#6b7280"><sup>2</sup>Some may wonder about hybrid linear attention models like MiniMax M1. We will discuss more in §4.3.</span></small>

<!-- page 3 of 18 -->

316 billion parameters, with 38 billion activated per token. There is an additional vision encoder of 5 billion parameters, which we do not discuss in this paper because it is irrelevant to decoding.



316B 参数, 每 token 激活 38B. 另有 5B 视觉编码器, 本文不讨论, 因其与 decoding 无关.

In the future, we will release more details on the model side for Step-3.



未来会再公开更多 Step-3 模型侧细节.

|  | Step-3 |
| --- | --- |
| # Layers | 61 |
| Hidden Dimension | 7168 |
| Attention Mechanism | MFA |
| Low-rank Query Dimension | 2048 |
| # Query Heads | 64 |
| Head Dimension | 256 |
| # Shared Experts | 1 |
| MoE Layer Configuration | All layers except the first four and last layer |
| Total Parameters (LLM) | 316 Billion |
| Activated Params per Token | 38 Billion |
| Total Parameters (VLM) | 321 Billion |

Table 1: Model card for Step-3.

|  | Step-3 |
| --- | --- |
| 层数 | 61 |
| 隐宽 | 7168 |
| Attention 机制 | MFA |
| Query 低秩维 | 2048 |
| Query head 数 | 64 |
| 头维 | 256 |
| 共享专家数 | 1 |
| MoE 层配置 | 除前四层与最后一层外全部 |
| 总参数 (LLM) | 316 Billion |
| 每 token 激活参数 | 38 Billion |
| 总参数 (VLM) | 321 Billion |

表 1: Step-3 模型卡.

> **想:** Table 1 写 LLM 总参 316B, VLM 总参 321B, 正文又说视觉编码器 5B 且「irrelevant to decoding」. 解码成本账里有没有把这 5B 算进去?
> 没有. 页 3 原句是 「we do not discuss in this paper because it is irrelevant to decoding」. Table 2–6 与 §7 吞吐对照都只谈文本 decoding; 5B 编码器不进本文理论成本与 Hopper 实测.

## 3 Attention-FFN Disaggregation

We start by describing Step-3 inference system, which may be one of the first production quality serving systems that leverages the Attention-FFN Disaggregation (AFD) idea and achieves high-throughput decoding under strict SLO constraints. First, we elaborate on the rationale behind the AFD design.



先写 Step-3 推理系统: 可能是最早一批把 Attention-FFN Disaggregation (AFD) 做到生产级, 并在严格 SLO 下拿到高吞吐 decoding 的系统. 先讲 AFD 的动机.

**Rationale.** LLMs are typically composed of interleaved attention and Feed-Forward Network (FFN) layers, each exhibiting distinct computational and memory access patterns. For example, attention layers typically have a smaller number of parameters, but require storing the key-value cache (KV-cache) for each token, which is memory-intensive during inference. In contrast, FFN layers generally take up a much larger parameter count, especially for MoE models, yet do not require storing intermediate computation results. We will dive into the operational characteristics and inference costs of attention and FFN layers in §4.



**动机.** LLM 通常交替叠 attention 与 FFN, 两者的算力与访存形态不同. 例如 attention 参数量通常较小, 但推理时要按 token 存 KV-cache, 访存重; FFN 尤其是 MoE 往往占更大参数量, 却不必存中间结果. §4 再拆两者的运行特征与推理成本.

Existing serving systems often treat these layers as monolithic blocks and overlook their intrinsic differences, leading to suboptimal GPU utilization. Hence, by disaggregating the attention and FFN components, we can better exploit their respective hardware affinities and optimize throughput. In addition, the disaggregation provides us with an opportunity to make an assumption: Both the attention and FFN parts can operate under ideal hardware conditions and can achieve high MFU, respectively.



现有 serving 常把这些层当整块, 忽略内在差异, GPU 利用率偏弱. 把 attention 与 FFN 拆开, 才能各自贴合硬件亲和并抬吞吐. 拆分还给了一个分析假设: attention 与 FFN 都能在理想硬件条件下各自逼近高 MFU.

This idea is based on the Prefill-Decoding (PD) disaggregation approach [31], which advocates separating the prefill and decoding stages to optimize resource utilization. Hence, we focus on the decoding stage with AFD without worrying about the impact on prefill. The analysis will become much simpler with this divide-and-conquer approach.



该想法建立在 Prefill-Decoding (PD) 拆分 [31] 之上: 先拆 prefill 与 decoding 以优化资源. 因此本文用 AFD 只盯 decoding, 不必担心对 prefill 的牵连. divide-and-conquer 后分析会简单很多.

### 3.1 Design Goals

AFD deploys the attention and FFN layers onto separate sets of GPUs. This architectural separation allows each subsystem to adopt different parallelism strategies that best suit their computational characteristics. During layer-wise decoding, hidden states are transmitted between the attention and FFN subsystems through high-speed network communication. This interleaved communication pattern forms a tightly coupled pipeline, where attention and FFN act as upstream and downstream stages for each other.



AFD 把 attention 与 FFN 分到不同 GPU 集合. 架构拆开后, 各子系统可选用最贴合自身算力特征的并行策略. 按层 decoding 时, hidden state 经高速网络在两侧之间传递, 形成紧耦合流水线, attention 与 FFN 互为上下游.

Furthermore, network transmission latency must also be taken into account. In such fine-grained scenarios, its magnitude is comparable to the computation time of both attention and FFN stages. This means that the communication stage should also be considered when orchestrating the pipeline.



网络传输延迟也必须计入. 在这种细粒度设定下, 其量级与 attention / FFN 计算时间相当, 编排流水线时通信阶段同样要当成一级.

To achieve optimal overall performance, the processing latency of both sides must be precisely matched; any imbalance leads to pipeline stalls or under-utilized resources. Therefore, it is essential to jointly orchestrate the performance of A/F and communication stages.



要拿整体最优, 两侧处理延迟必须精确匹配; 一旦失衡就会流水线空泡或资源闲置. 因此必须联合编排 A/F 与通信各阶段的性能.

We summarize the design goals of AFD as follows, which will be discussed in detail later:



AFD 设计目标汇总如下, 后文展开:

• Performance target: 50ms time per output token (TPOT, ≥ 20 tokens/sec) via a 3-stage pipeline, with 16.6ms per stage for A/F/communication, respectively. Here the time is accumulated across all model layers.<sup>3</sup>

• 性能目标: 经 3 级流水线达到 50ms TPOT (≥ 20 tokens/sec), A/F/通信各约 16.6ms; 时间为全模型各层累计.<sup>3</sup>

• Pipeline optimization: Resource allocation and performance tuning that enable perfect A/F/communication multi-stages pipelining, hiding communication latency.

• 流水线优化: 资源分配与性能调优, 使 A/F/通信多级完美流水, 把通信延迟藏起来.

• Independent design of A/F: With AFD, we can independently analyze the operational characteristics of attention and FFN. This separation not only enables optimal optimization for each subsystem, but also allows for flexible architectural modifications to the model itself.

• A/F 独立设计: 有了 AFD, 可分别分析 attention 与 FFN 的运行特征; 既便于各子系统最优优化, 也允许对模型本身做灵活架构改动.

• Hardware selection: Independent hardware selection for attention and FFN subsystems based on their operational characteristics.

• 硬件选型: 按运行特征分别为 attention 与 FFN 子系统选硬件.

### 3.2 Comparisons with Related Work

**DeepSeek EP.** Large Expert Parallelism (EP) architecture is introduced in DeepSeek-V3 [4] to improve serving efficiency. Although EP also facilitates batch size amplification by distributing expert weights to multiple devices, we argue that this approach exhibits fundamental limitations compared to AFD.



**DeepSeek EP.** DeepSeek-V3 [4] 引入大规模 Expert Parallelism (EP) 以抬 serving 效率. EP 通过把专家权重摊到多卡也能放大 batch, 但作者认为相对 AFD 仍有根本局限.

<small><span class="docvortex-page-footnote" data-block-type="page_footnote" style="color:#6b7280"><sup>3</sup>Alternatively, we can also use a 4-stage pipeline: A -> communication -> F -> communication, with a 12.5ms budget for each stage.</span></small>

<!-- page 4 of 18 -->

• Deployment scale: A key advantage of AFD is its ability to operate efficiently at a smaller deployment scale. As mentioned before, DSv3 requires 320 GPUs for a decoding instance, while Step-3 only uses 32 GPUs (§7.3). If the deployment scale expands significantly, network congestion becomes a critical issue [29], resulting in increased and unpredictable latency. This heightened latency can severely impact the serving system’s ability to meet inference SLA.

• 部署规模: AFD 的关键优势是能在更小部署规模上高效运行. 前文已写, DSv3 一个 decoding 实例要 320 GPU, Step-3 只用 32 GPU (§7.3). 部署规模显著膨胀时, 网络拥塞会成关键问题 [29], 延迟升高且不可预测, 严重威胁推理 SLA.

• Context-length efficiency: Long-context processing disproportionately burdens EP’s attention layers, causing FFN under-utilized due to fixed expert-node allocation. AFD resolves this via decoupled scaling of attention and FFN. We will present quantitative results on different context lengths in §4.

• 上下文长度效率: 长上下文会不成比例地压住 EP 的 attention, 而专家节点配额固定又使 FFN 吃不饱. AFD 用 attention 与 FFN 解耦扩展解决. §4 给出不同上下文长度的定量结果.

• Load imbalance issue: EP suffers from the well-known workload imbalanced issue [13, 14]. DeepSeek-V3 alleviates this issue using duplicated experts that can balance each GPU’s workload in an ad-hoc manner. But this approach incurs additional memory overhead, and is inflexible to dynamic workload changes, especially when the data distribution shifts significantly. On the other hand, AFD can easily leverage hybrid TP-EP strategy to strike a balance between computation efficiency, communication traffic, and load balancing.

• 负载不均: EP 有经典负载不均问题 [13, 14]. DeepSeek-V3 用复制专家 ad-hoc 均衡各卡负载, 但吃额外显存, 且对动态负载与分布漂移不灵活. AFD 可轻松用 hybrid TP-EP, 在算力效率, 通信流量与负载均衡之间折中.

• Heterogeneous hardware constraints: AFD enables more flexible hardware deployment, in that attention and FFN instances can be mapped to heterogeneous hardware tailored to their respective compute and memory requirements, while EP forces homogeneous hardware deployment, limiting specialization benefits.

• 异构硬件约束: AFD 允许更灵活的硬件部署—attention 与 FFN 实例可映射到各适配算力/访存需求的异构硬件; EP 则强迫同构部署, 限制特化收益.

Performance modeling: Our following analytical framework leverages the architectural disaggregation of attention and FFN. This separation provides methodological clarity due to their divergent computational profiles, which enables more accurate modeling of performance ceilings while substantially narrowing the gap between theoretical projections and empirical measurements. Contrarily, EP-only architecture lacks this divide-and-conquer clarity, suffering from inherent analytical ambiguity when modeling coupled subsystems.



性能建模: 后续分析框架利用 attention 与 FFN 的架构拆分. 因两者算力画像不同, 拆分带来方法清晰度, 既能更准地建模性能天花板, 也大幅收窄理论投影与实测落差. 相反, 纯 EP 架构缺少 divide-and-conquer 清晰度, 耦合子系统建模时天然含糊.

In particular, we note that AFD is not a replacement for EP, but rather a complementary approach. In fact, Step-3 can be combined with the TP-EP strategy to achieve better performance and cost-effectiveness. The above analysis is against the EP-only architecture that does not employ AFD, which is commonly used in existing serving systems [4, 33].



特别说明: AFD 不是 EP 的替代品, 而是互补. Step-3 可与 TP-EP 策略组合以拿到更好性能与成本. 上文批评的是不采用 AFD 的纯 EP 架构, 而这正是现有 serving 常见做法 [4, 33].

**Megascale-Infer.** To our knowledge, Megascale-Infer [32] is the first to build a disaggregated serving system leveraging the AFD idea. However, it focuses on high throughput rather than providing a practical implementation to achieve the low latency target (i.e., 50ms TPOT) simultaneously. In fact, according to [32], the reported latency per token of Megascale-Infer is 150ms, which is significantly higher than ours. Such high latency is not applicable for real-time applications like



**Megascale-Infer.** 据作者所知, Megascale-Infer [32] 是最早用 AFD 思路做拆分 serving 的系统. 但它侧重高吞吐, 并未同时给出可落地的低延迟目标 (即 50ms TPOT). 按 [32], 其每 token 延迟报 150ms, 明显高于本文. 这种高延迟不适合实时应用, 例如

chatbots. Moreover, the core of Step-3 is in model-system co-design, and we use the AFD idea to design Step-3’s model architecture for attention and FFN layers, while Megascale-Infer primarily only focuses on system-level optimizations. We believe the co-design brings more opportunities to thoroughly exploit the hardware capabilities.



聊天机器人. 此外, Step-3 的核心在模型-系统协同设计, 用 AFD 思路反过来设计 attention 与 FFN 的模型架构; Megascale-Infer 主要只做系统层优化. 作者认为协同设计更能把硬件能力吃透.

## Cost Analysis for LLM Decoding

Given the important assumption that, with AFD, the attention part and the FFN part can operate near hardware limitations, we will now delve into the theoretical costs of each model. We compare Step-3 with several recently released models, namely DSv3 [4], Kimi K2 [17], Qwen3-235B-A22B [8] (Qwen3- MoE for brevity), Qwen3-32B [25], Llama 4 Maverick [15], MiniMax M1 [16] (MM M1), ERNIE 4.5 [22], and Pangu Pro MoE [21].



在 「AFD 下 attention 与 FFN 都能逼近硬件极限」 这一关键假设下, 下文展开各模型的理论成本. 对照包括 DSv3 [4], Kimi K2 [17], Qwen3-235B-A22B [8] (简称 Qwen3-MoE), Qwen3-32B [25], Llama 4 Maverick [15], MiniMax M1 [16] (MM M1), ERNIE 4.5 [22], Pangu Pro MoE [21].

### 4.1 Theoretical Flops and Memory Access

We begin by examining the overall memory access and computational operations required for decoding each token.



先看每解码一个 token 的总体访存与计算量.

Given that various quantization methods directly impact memory access and the type of floating point computation, we select widely used quantized versions for each model:



量化方式直接影响访存与浮点计算类型, 因此为各模型选取常用量化版本:

• **MLA family:** The official implementation of DSv3 uses BF16 for attention, with other parts in FP8. However, recognizing the existence of an FP8 quantized version of MLA within the open-source community, we adopt FP8 quantization for the whole model. The same quantization is applied to Kimi K2.

• **MLA 族:** DSv3 官方实现 attention 用 BF16, 其余 FP8. 但开源社区已有 MLA 的 FP8 量化版, 本文对整模采用 FP8. Kimi K2 同样.

**GQA family:** The official release of Qwen3 includes full FP8 quantization, which we will use. For other models like ERNIE 4.5 and Pangu Pro MoE, to align with Qwen3, we also use the same quantization. We believe the risk of losing model accuracy is low given our own experience with GQA models.



**GQA 族:** Qwen3 官方发布含全 FP8 量化, 本文采用. ERNIE 4.5 与 Pangu Pro MoE 等为与 Qwen3 对齐也用同一量化. 作者基于自有 GQA 经验, 认为精度损失风险较低.

**Hybrid models:** The official quantization of Llama 4 Maverick and MiniMax M1 is conservative, especially for attention. As hybrid attention model’s quantization remains largely unexplored for us, we mostly follow the official setup, i.e., BF16 KV for full attention layers because they are critical for long context tasks. We use FP32 for Mini-Max M1’s Lightning Attention states, the same as its official setup. We give Llama 4 Maverick a favor for using FP8 for its chunked GQA attention, again based on our experience with GQA. For all the other parts we adopt the same aggressive FP8 quantization like all other evaluated models, to have a fair comparison.



**混合模型:** Llama 4 Maverick 与 MiniMax M1 官方量化偏保守, 尤其 attention. 混合 attention 量化对作者仍大体未探索完, 故基本跟官方: 全注意力层用 BF16 KV (对长上下文关键). MiniMax M1 的 Lightning Attention 状态用 FP32, 同官方. Llama 4 Maverick 的 chunked GQA attention 则按作者 GQA 经验给 FP8 优待. 其余部分与其他评测模型一样用激进 FP8, 以求公平对照.

• **Step-3:** we have successfully quantized Step-3 to be a full FP8 model without losing model accuracy. So we use full FP8 quantization, which aligns with MLA and GQA faimly.

• **Step-3:** 已成功量化为全 FP8 且不损精度, 故用全 FP8, 与 MLA / GQA 族对齐.

If the hardware does not support FP8 quantization, we assume the use of INT8 weights and INT8 KV cache instead of FP8, so the memory access remains the same. The computa-



若硬件不支持 FP8, 则假设用 INT8 权重与 INT8 KV cache 替代, 使访存量不变. 计

<!-- page 5 of 18 -->

<table><tbody><tr><td rowspan="2">Model</td><td rowspan="2">KV/State Memory Access (bytes)</td><td rowspan="2">Attention Computation w/o Linear (FLOPs)</td><td rowspan="2">Linear before and af-terAttention (FLOPs)</td><td rowspan="2">FFN Computation (FLOPs)</td></tr><tr></tr><tr><td>DSv3</td><td>2.88×10<sup>8</sup></td><td>1.47×1011</td><td>2.28×1010</td><td>4.84×1010</td></tr><tr><td>Kimi K2</td><td>2.88×10<sup>8</sup></td><td>7.37×1010</td><td>1.23×1010</td><td>4.84×1010</td></tr><tr><td>Qwen3 MoE</td><td>7.89×10<sup>8</sup></td><td>2.52×1010</td><td>1.34×1010</td><td>2.84×1010</td></tr><tr><td>Qwen3 32B</td><td>1.07×10<sup>9</sup></td><td>1.72×1010</td><td>1.21×1010</td><td>5.03×1010</td></tr><tr><td>Llama 4 M</td><td>1.01×10<sup>9</sup></td><td>8.05×10<sup>9</sup></td><td>6.04×10<sup>9</sup></td><td>2.42×1010</td></tr><tr><td>MM M1</td><td>9.23×10<sup>8</sup></td><td>3.42×10<sup>9</sup></td><td>3.75×1010</td><td>5.44×1010</td></tr><tr><td>ERNIE 4.5</td><td>9.06×10<sup>8</sup></td><td>1.45×1010</td><td>1.63×1010</td><td>7.61×1010</td></tr><tr><td>Pangu Pro</td><td>8.05×10<sup>8</sup></td><td>8.05×10<sup>9</sup></td><td>6.04×10<sup>9</sup></td><td>2.38×1010</td></tr><tr><td>Step-3</td><td>2.56×10<sup>8</sup></td><td>3.27×1010</td><td>2.07×1010</td><td>5.33×1010</td></tr></tbody></table>

Table 2: Theoretical computation and memory access per decoding token at 8K context length.

表 2: 8K 上下文下, 每解码 token 的理论计算与访存.

<table><tbody><tr><td rowspan="2">Model</td><td rowspan="2">KV/State Memory Access (bytes)</td><td rowspan="2">Attention Computation w/o Linear (FLOPs)</td><td rowspan="2">Linear before and af-terAttention (FLOPs)</td><td rowspan="2">FFN Computation (FLOPs)</td></tr><tr></tr><tr><td>DSv3</td><td>1.15×10<sup>9</sup></td><td>5.89×1011</td><td>2.28×1010</td><td>4.84×1010</td></tr><tr><td>Kimi K2</td><td>1.15×10<sup>9</sup></td><td>2.95×1011</td><td>1.23×1010</td><td>4.84×1010</td></tr><tr><td>Qwen3 MoE</td><td>3.15×10<sup>9</sup></td><td>1.01×1011</td><td>1.34×1010</td><td>2.84×1010</td></tr><tr><td>Qwen3 32B</td><td>4.29×10<sup>9</sup></td><td>6.87×1010</td><td>1.21×1010</td><td>5.03×1010</td></tr><tr><td>Llama 4 M</td><td>2.21×10<sup>9</sup></td><td>1.41×1010</td><td>6.04×10<sup>9</sup></td><td>2.42×1010</td></tr><tr><td>MM M1</td><td>1.93×10<sup>9</sup></td><td>1.15×1010</td><td>3.75×1010</td><td>5.44×1010</td></tr><tr><td>ERNIE 4.5</td><td>3.62×10<sup>9</sup></td><td>5.80×1010</td><td>1.63×1010</td><td>7.61×1010</td></tr><tr><td>Pangu Pro</td><td>3.22×10<sup>9</sup></td><td>3.22×1010</td><td>6.04×10<sup>9</sup></td><td>2.38×1010</td></tr><tr><td>Step-3</td><td>1.02×10<sup>9</sup></td><td>1.31×1011</td><td>2.07×1010</td><td>5.33×1010</td></tr></tbody></table>

Table 3: Theoretical computation and memory access per decoding token at 32K context length.

表 3: 32K 上下文下, 每解码 token 的理论计算与访存.

tion will be in BF16 or FP16.



算将以 BF16 或 FP16 进行.

The results are listed in Table 2 and 3. With the assumption of AFD, we divide the model costs into three parts: attention (without linear projection), the linear projection before and after attention, and FFN. For the first part, we consider the KV cache size and the computation simultaneously, since they grow linearly with batch size and context length.



结果见表 2 与表 3. 在 AFD 假设下, 成本拆成三块: attention (不含线性投影), attention 前后线性投影, 以及 FFN. 第一块同时看 KV cache 体积与计算, 因为二者随 batch 与上下文长度线性增长.

For the linear projection before and after attention, we assume they can achieve compute-bound performance with sufficient batching. In this case, the memory access of the weights is amortized, and the costs will be determined by FLOPs. There is an exception where the q/k/v\_pro j of MLA and MFA may not be able to run in H800’s compute-bound area, due to those parts not being TP-friendly and may not have a large enough batch size for H800. This means we slightly underestimate MLA and MFA costs on H800. However, this is a relatively small part of the total costs and specific to H800, so we omit it for simplicity.



对 attention 前后线性投影, 假设充足 batching 下可进 compute-bound; 此时权重访存被摊薄, 成本由 FLOPs 决定. 例外是 MLA / MFA 的 q/k/v_proj 可能进不了 H800 的 compute-bound 区, 因为这些部分不友好于 TP, 且 batch 可能不够大. 这意味着在 H800 上略低估了 MLA / MFA 成本. 但相对总成本较小且专属于 H800, 文中为简略省略.

case, over-sparse models like DSv3, Kimi K2 and Llama 4 Marverick may see their FFN cost doubling or even tripling on H800 in real deployment. For now, we omit it for simplicity and give them a favor.



在最坏情况下, DSv3, Kimi K2, Llama 4 Maverick 这类过稀模型在 H800 实部上 FFN 成本可能翻倍甚至三倍. 目前为简略省略, 并给它们优待.

We also omit the embedding table and the final output linear layer since they consume relatively small (< 5%) memory access and computation for these models, and they are not too different across different models.



也省略 embedding 表与最终输出线性层, 因其在这些模型上访存与计算占比相对小 (< 5%), 且跨模型差异不大.

For FFN, we focus only on the activated computation volume because, using AFD for not-too-sparse MoE, sufficient batching can always be accumulated for FFN to reach high MFU and amortize the memory access for weights. Further details on MoE sparsity are discussed in the §5. In the worst



对 FFN, 只盯激活计算量: 对不过稀的 MoE, 用 AFD 总能攒够 batch 让 FFN 进高 MFU 并摊薄权重访存. MoE 稀疏细节见 §5. 在最坏

### 4.2 Theoretical Decoding Cost in USD

Next, we can calculate the theoretical decoding costs of the models on different accelerators. Table 4 shows the accelerator specifications and their estimated prices on public clouds.



接下来可算各加速器上的理论 decoding 成本. Table 4 给出加速器规格与公有云估价.

Suppose, in the theoretically ideal case, accelerators constantly at their peak FLOPs and maximum memory bandwidth, we derive the unit costs of a floating-point operation $( U _ { F L O P } )$ and a byte of memory access $( U _ { b y t e } )$ , in Table 5.



假设理论上加速器始终满峰 FLOPs 与最大内存带宽, 可导出每次浮点运算单价 $(U_{FLOP})$ 与每字节访存单价 $(U_{byte})$, 见表 5.

The theoretical cost of the attention part is the larger of the attention’s core computation and memory access costs, plus the linear computation before and after:



attention 部分的理论成本取核心计算与访存成本的较大者, 再加上前后线性计算:

$$
\max \left(F L O P _ {A t t n} U _ {F L O P}, B y t e _ {K V} U _ {b y t e}\right) + F L O P _ {\text {Linear}} U _ {F L O P}
$$

Assuming, with AFD, we can keep the FFN part in the



假设在 AFD 下能把 FFN 部分保持在

> **问:** 式中 attention 成本取 $\max(FLOP_{Attn} U_{FLOP}, Byte_{KV} U_{byte})$ 再加线性项. 这是不是说 KV 再小, 只要算术强度过高仍可能被算力侧卡住?
> 是. 页 5 原句把 attention 成本写成二者取大再加线性. §5.1 进一步用 MFA 算术强度 128 vs MLA 512 解释: Table 2 里 Step-3 相对 DSv3 的 KV 访存只少约 10%, 但 Table 6 上许多硬件 attention 成本可减半或更多, 根因是强度匹配, 不是单看 KV 体积.

<!-- page 6 of 18 -->

| Accelerator | Price per card per hour (USD) | BF16/FP16FLOPs | FP8 FLOPs | Memory bandwidth (B/s) | Compute-bandwidth ratio (roofline) |
| --- | --- | --- | --- | --- | --- |
| NVIDIA H800 | 2 | 9.89×1014 | 1.98×1015 | 3.35×1012 | 591 |
| NVIDIA H20 | 0.8 | 1.48×1014 | 2.96×1014 | 4.00×1012 | 74 |
| NVIDIA A800 | 0.75 | 3.12×1014 | N/A | 2.00×1012 | 156 |
| Ascend 910B | 0.67* | 2.80×1014 | N/A | 1.60×1012 | 175 |

Table 4: Comparison of accelerator specifications. \*We do not have publicly available 910B pricing. We estimate its price proportionally based on its FLOPs and A800’s. As far as we know, there are multiple versions of 910B. We show the weakest and (presumably) most affordable one that we know.

表 4: 加速器规格对照. \*无公开 910B 定价; 按 FLOPs 相对 A800 比例估价. 已知 910B 有多版本, 文中取所知最弱, 大概最便宜的一版.

| Accelerator | Cost per FLOP | Cost per byte of memory access |
| --- | --- | --- |
| H800 | 2.80×10-19 | 1.66×10-16 |
| H20 | 7.51×10-19 | 5.56×10-17 |
| A800 | 6.68×10-19 | 1.04×10-16 |
| 910B | 6.65×10-19 | 1.16×10-1<sup>6</sup> |

Table 5: The unit cost of different accelerators assuming full utilization for the whole month. For FLOP costs, we consider FP8 for H800 and H20, BF16/FP16 for A800 and 910B.

表 5: 假设整月满利用下的单价. FLOP 成本: H800/H20 按 FP8; A800/910B 按 BF16/FP16.

compute-bound region, the theoretical cost of the FFN part is simply the computation cost $F L O P _ { F F N } U _ { F L O P }$



compute-bound 区, 则 FFN 理论成本就是计算成本 $FLOP_{FFN} U_{FLOP}$.

Combining the attention and FFN parts, we obtain Table 6. The final costs of different deployment choices can be directly computed. For example, we can add the attention and FFN parts together for different context on each hardware. For AFD, we choose the cheapest hardware for attention cost and FFN cost, respectively, and then sum them up. We assume all communication time on network can be overlapped by computation in a multi-batch pipeline, so the communication costs are ignored.



合并 attention 与 FFN 得到 Table 6. 不同部署选择的最终成本可直接加总. 例如各硬件上对不同上下文把 attention 与 FFN 相加. 对 AFD, 分别为 attention 成本与 FFN 成本选最便宜硬件再求和. 假设多 batch 流水线能把网络通信时间全部用计算重叠掉, 故忽略通信成本.

For brevity, we only show the results of Qwen family (representative for GQA models), DSv3 (representative for MLA models), and Step-3 in Figure 2. With all the results shown, we make the following observations:



为简略, Figure 2 只展示 Qwen 族 (代表 GQA), DSv3 (代表 MLA) 与 Step-3. 综合全部结果, 有如下观察:

**Observation 1: Step-3 has the lowest decoding costs.** When at 8K context length, Step-3 is the most cost-effective at 0.055 per 1M decoding tokens (with AFD, H800 and H20), lower than DSv3’s 0.068 (with EP and H800) and Qwen MoE’s 0.062 (with AFD, H800 and H20). The advantage is larger at 32K context, with Step-3 at 0.129, significantly lower than DSv3’s 0.211 and Qwen-3 MoE’s 0.193.



**观察 1: Step-3 的 decoding 成本最低.** 8K 上下文时, Step-3 最省, 每 1M decoding token 0.055 (AFD, H800+H20), 低于 DSv3 的 0.068 (EP+H800) 与 Qwen MoE 的 0.062 (AFD, H800+H20). 32K 时优势更大: Step-3 0.129, 显著低于 DSv3 0.211 与 Qwen-3 MoE 0.193.

**Observation 2: Total and activated parameter numbers are bad indicator for decoding costs.** Qwen3 32B has much less total parameters than DSv3 and Step-3, and also slightly less activated parameters. However, the decoding cost of Qwen3 32B is the highest among all models in Figure 2.



**观察 2: 总参与激活参都不是 decoding 成本的好指标.** Qwen3 32B 总参远少于 DSv3 与 Step-3, 激活参也略少, 但在 Figure 2 所有模型里 decoding 成本最高.

**Observation 3: The cost of attention is dominating the**

**total decoding cost.** It is clear in Table 6, at 8K context length, attention is already significantly more expensive than FFN. The gap grows quickly with longer context, given that FFN’s cost is irrelevant to context length. This means the attention design matters much more than activated number of parameters – that’s the reason for Observation 2.



**观察 3: attention 成本主导总 decoding 成本.** Table 6 很清楚: 8K 时 attention 已显著贵过 FFN; 上下文加长后差距迅速拉大, 因为 FFN 成本与上下文无关. 因此 attention 设计远比激活参数个数重要—这正是观察 2 的原因.

**Observation 4: Hardware friendliness.** DSv3’s MLA is quite unfriendly to hardware other than H800, resulting in multi-fold increase when running on hardware weaker than H800. GQA models like Qwen3 are quite unfriendly to hardware other than H20, because of large KV sizes. In contrast, Step-3’s MFA is more hardware-friendly, with minimal cost differences for weaker hardware. We show this in Figure 2.



**观察 4: 硬件友好度.** DSv3 的 MLA 对非 H800 硬件很不友好, 弱于 H800 时成本可涨数倍. Qwen3 一类 GQA 因 KV 大, 对非 H20 也不友好. 相较之下 Step-3 的 MFA 更硬件友好, 弱硬件上成本差最小. 见图 2.

### 4.3 Demystifying Model Design Choices

In this section, we discuss some ongoing model design trends in the community. We especially focus on the decoding phase.



本节讨论社区若干进行中的模型设计趋势, 尤其聚焦 decoding 阶段.

**Linear attention and hybrid models.** Linear attention is a promising direction but still faces challenges in long context tasks. A practical workaround is “hybrid models”, which consist of two types of attention layers; most are linear attention, while the rest are traditional full attention. For example, MM M1, using a hybrid architecture with 70 layers of linear attention and 10 layers of GQA full attention, exhibits significantly slower KV growth with context length compared to full-GQA models like Qwen3. The design of Llama 4 Maverick is similar except for the layer numbers.



**线性注意力与混合模型.** 线性注意力方向有前景, 但长上下文任务仍有挑战. 实务折中是 「hybrid models」: 多数层线性注意力, 其余传统全注意力. 例如 MM M1 用 70 层线性 + 10 层 GQA 全注意力, 相对 Qwen3 一类全 GQA, KV 随上下文增长明显更慢. Llama 4 Maverick 设计类似, 只是层数不同.

However, such hybrid models have two additional challenges for inference systems.



但这类混合模型给推理系统带来两点额外挑战.

First, while the number of full attention layers seems small, they may still ruin the point of using linear attention for saving KV cache. MM M1 and Llama 4 Maverick’s full attention part alone (based on the official quantization scheme) has a larger KV cache volume than Step-3’s entire model. No matter how much the rest of the linear attention layers save, no matter how long the context is, the total memory access will be larger than Step-3, as shown in Figure 3.



第一, 全注意力层数看起来少, 仍可能毁掉线性注意力省 KV 的初衷. 按官方量化方案, MM M1 与 Llama 4 Maverick 的全注意力部分单独算, KV cache 体积已大于 Step-3 整模. 不论其余线性层省多少, 不论上下文多长, 总访存都会大于 Step-3, 见图 3.

Second, the time spent on each layer will be largely unbalanced – when running with long context, the full GQA layers consume much more time than the linear attention layers. This may not be a problem for single-node inference deployment,



第二, 各层耗时会严重不均—长上下文时全 GQA 层远慢于线性注意力层. 单机推理部署或许还好,

<!-- page 7 of 18 -->

<table><tbody><tr><td rowspan="2">Model</td><td colspan="4">Attention cost per 1M tokens (8k)</td><td colspan="4">Attention cost per 1M tokens (32k)</td><td colspan="4">FFN cost per 1M tokens</td></tr><tr><td>H800</td><td>H20</td><td>A800</td><td>910B</td><td>H800</td><td>H20</td><td>A800</td><td>910B</td><td>H800</td><td>H20</td><td>A800</td><td>910B</td></tr><tr><td>DSv3</td><td>0.054</td><td>0.128</td><td>0.114</td><td>0.113</td><td>0.197</td><td>0.460</td><td>0.409</td><td>0.407</td><td>0.014</td><td>0.036</td><td>0.032</td><td>0.032</td></tr><tr><td>Kimi K2</td><td>0.051</td><td>0.065</td><td>0.057</td><td>0.057</td><td>0.194</td><td>0.231</td><td>0.205</td><td>0.204</td><td>0.014</td><td>0.036</td><td>0.032</td><td>0.032</td></tr><tr><td>Qwen3 MoE</td><td>0.135</td><td>0.054</td><td>0.091</td><td>0.101</td><td>0.527</td><td>0.185</td><td>0.338</td><td>0.376</td><td>0.008</td><td>0.021</td><td>0.019</td><td>0.019</td></tr><tr><td>Qwen3 32B</td><td>0.181</td><td>0.069</td><td>0.120</td><td>0.133</td><td>0.716</td><td>0.248</td><td>0.455</td><td>0.508</td><td>0.014</td><td>0.038</td><td>0.034</td><td>0.033</td></tr><tr><td>Llama 4 M</td><td>0.169</td><td>0.060</td><td>0.109</td><td>0.121</td><td>0.369</td><td>0.128</td><td>0.235</td><td>0.262</td><td>0.007</td><td>0.018</td><td>0.016</td><td>0.016</td></tr><tr><td>MM M1</td><td>0.164</td><td>0.079</td><td>0.121</td><td>0.132</td><td>0.330</td><td>0.135</td><td>0.226</td><td>0.249</td><td>0.015</td><td>0.041</td><td>0.036</td><td>0.036</td></tr><tr><td>ERNIE 4.5</td><td>0.155</td><td>0.063</td><td>0.105</td><td>0.116</td><td>0.606</td><td>0.214</td><td>0.388</td><td>0.432</td><td>0.021</td><td>0.057</td><td>0.051</td><td>0.051</td></tr><tr><td>Pangu Pro MoE</td><td>0.135</td><td>0.049</td><td>0.088</td><td>0.098</td><td>0.536</td><td>0.183</td><td>0.340</td><td>0.379</td><td>0.007</td><td>0.018</td><td>0.016</td><td>0.016</td></tr><tr><td>Step-3</td><td>0.048</td><td>0.040</td><td>0.040</td><td>0.043</td><td>0.176</td><td>0.114</td><td>0.120</td><td>0.133</td><td>0.015</td><td>0.040</td><td>0.036</td><td>0.035</td></tr></tbody></table>

Table 6: Theoretical decoding cost analysis for each model on each hardware, in USD. As a reminder, these models have different number of activated parameters: DSv3 37B, Qwen3 MoE 22B, Qwen3 32B, MM M1 46B, ERNIE 4.5 47B, Pangu Pro MoE 16.5B and Step-3 38B.

表 6: 各模型各硬件理论 decoding 成本 (USD). 提醒激活参不同: DSv3 37B, Qwen3 MoE 22B, Qwen3 32B, MM M1 46B, ERNIE 4.5 47B, Pangu Pro MoE 16.5B, Step-3 38B.

![Chart block](images/p07-chart.png)

![Chart block](images/p07-figure-2-decoding-costs-per-1m-tokens-of-different.png)

Figure 2: Decoding costs (per 1M tokens) of different models and inference configurations. For AFD, we combine the lowest costs on different hardware for attention and FFN, respectively. Reminder: Step-3 has the most activated parameters among them.



图 2: 不同模型与推理配置的 decoding 成本 (每 1M tokens). AFD 分别取 attention / FFN 在各硬件上的最低成本再合并. 提醒: 这些模型里 Step-3 激活参最多.

but can be quite troublesome for distributed inference deploy ment (especially AFD) when one tries to build a pipeline to hide communication time. The imbalance of layer times can cause significant pipeline bubbles.



但对分布式推理 (尤其 AFD) 要靠流水线藏通信时就很麻烦. 层耗时不均会造成明显流水线空泡.

In Figure 3, we compare MM M1 and Llama 4 Maverick with Step-3 using a single hardware (H800) setup. Due to the reason above, they always have higher decoding costs than Step-3 despite most of their layers being linear attention. Admittedly, using hardware with cheaper memory bandwidth (like H20) can largely narrow the gap. But fundamentally, they require more KV cache access than Step-3 in the end.



Figure 3 在单硬件 (H800) 设定下对照 MM M1, Llama 4 Maverick 与 Step-3. 因上述原因, 即便多数层是线性注意力, 它们的 decoding 成本始终高于 Step-3. 诚然用内存带宽更便宜的硬件 (如 H20) 可大幅收窄差距, 但根本上它们最终需要更多 KV cache 访存.

We call for hybrid model designs that are more friendly to inference systems. One should design the full attention part carefully so that it does not ruin the cost saving from linear attention. Also, try to make every layer hybrid so that the time for each layer is balanced, instead of having a few slow layers that may limit the potentials of running in a distributed pipeline.



作者呼吁设计对推理系统更友好的混合模型: 全注意力部分要精心设计, 别毁掉线性注意力省下的成本; 并尽量让每层都 hybrid, 使层耗时均衡, 而不是少数慢层卡住分布式流水线潜力.

**“Hardware-optimized design” – for training or decoding?** Designing a model that is optimized for a given hardware is



**「硬件优化设计」—为训练还是为 decoding?** 针对给定硬件优化模型并

![Chart block](images/p07-chart-2.png)

![Chart block](images/p07-figure-3-total-kv-cache-size-and-decoding-cost.png)

Figure 3: Total KV cache size and decoding cost comparison on H800 with hybrid linear attention models like MiniMax M1 and Llama 4 Maverick.



图 3: H800 上与 MiniMax M1, Llama 4 Maverick 一类混合线性注意力模型的总 KV cache 体积与 decoding 成本对照.

> **核对:** 页 6–7 写 MM M1 / Llama 4 Maverick 「full attention part alone ... has a larger KV cache volume than Step-3’s entire model」. 这句是不是说混合模型线性层一多, 总访存终会低于 Step-3?
> 不是. 同页原句明确: 「No matter how much the rest of the linear attention layers save, no matter how long the context is, the total memory access will be larger than Step-3, as shown in Figure 3.」 全注意力残段单独已大于 Step-3 整模 KV; 线性层再省也翻不过这条下界.

not a new concept. In this paper, we include Pangu Pro MoE, a model claimed to be specifically optimized for Huawei’s own accelerator, 910B.



不是新概念. 本文纳入 Pangu Pro MoE, 其声称专为华为自家加速器 910B 优化.

However, in our analysis, the decoding cost of Pangu Pro MoE on 910B is not low – it is theoretically much larger than



但分析显示, Pangu Pro MoE 在 910B 上的 decoding 成本并不低—理论上远高于

<!-- page 8 of 18 -->

![Chart block](images/p08-figure-4-step-3-and-pangu-pro-moe-have-very-different.png)

Figure 4: Step-3 and Pangu Pro MoE have very different trends of decoding cost and training cost.



图 4: Step-3 与 Pangu Pro MoE 的 decoding 成本与训练成本走势差异很大.

Step-3 (Figure 4). Remember, Pangu Pro MoE has only 16.5B activated parameters, less than half of Step-3’s! It is evident that Pangu Pro MoE’s decoding on 910B is not cost-effective at all.



Step-3 (Figure 4). 记住 Pangu Pro MoE 激活参仅 16.5B, 不到 Step-3 一半! 可见其在 910B 上 decoding 并不划算.

To be fair, the main focus of Pangu Pro MoE was not about decoding cost, it was about training. We also show a rough estimation of training cost per 1M token assuming 100% MFU,<sup>4</sup> purely based on the theoretical FLOPs. We see that Pangu Pro MoE indeed is more than 50% cheaper than Step-3 to train, reflecting the difference in activated parameters.



公平地说, Pangu Pro MoE 主目标不是 decoding 成本而是训练. 文中另给假设 100% MFU<sup>4</sup>, 纯按理论 FLOPs 的每 1M token 训练成本粗估: Pangu Pro MoE 训练确实比 Step-3 便宜 50% 以上, 反映激活参差异.

The lesson is, be clear about the goal during model-system co-design. Training and inference can be vastly different. Training costs are largely tied to the number of activated parameters, while lowering decoding costs requires additional model-system co-design. We will discuss the co-design points immediately.



教训: 模型-系统协同设计时目标要清楚. 训练与推理可以天差地别. 训练成本大体绑在激活参数个数上; 压 decoding 成本则还需额外模型-系统协同. 下文立刻谈协同点.

## 5 Model-System Co-design

### 5.1 Matching Attention Arithmetic Intensity with Hardware

Readers paying attention (pun intended) may notice that in Tables 2 and 3, Step-3 ’s MFA exhibits only a 10% reduction in KV memory access volume compared with DSv3’s MLA. Yet in Table 6, Step-3 ’s attention cost is reduced by half or more in many cases. Why? The result stems from the design of MFA.



细心读者会注意到: Table 2/3 里 Step-3 的 MFA 相对 DSv3 的 MLA, KV 访存量只少约 10%; 但 Table 6 里许多情形 attention 成本减半或更多. 为什么? 答案来自 MFA 设计.

As pointed out in prior work [26, 27], each attention design has an inherent property called arithmetic intensity. It is the ratio of the arithmetic operations needed for each byte of KV accessed from memory. Different batch sizes or context lengths do not change the arithmetic intensity.



如先前工作 [26, 27] 所指出, 每种 attention 设计有固有属性 arithmetic intensity: 每从内存读一字节 KV 所需算术运算数之比. 不同 batch 或上下文长度不改变该强度.

The better the match between attention’s arithmetic intensity and a hardware’s “computation-bandwidth ratio” (or referred to as roofline) (see Table 4), the more likely it is to achieve good efficiency on that hardware. Otherwise, significant bottlenecks may occur, either compute-bound or memory-



attention 的算术强度与硬件 「算力-带宽比」 (又称 roofline, 见表 4) 匹配越好, 越可能在该硬件上拿到好效率; 否则会出现显著瓶颈, 要么算力受限要么内存

![Chart block](images/p08-figure-5-the-compute-and-memory-access-of-different.png)

Figure 5: The compute and memory access of different attention designs during decoding, including DSv3’s MLA, Qwen3 MoE’s GQA and Step-3’s MFA. The compute-memorybandwidth ratios of different hardware are also plotted.



图 5: decoding 时不同 attention 设计的计算与访存, 含 DSv3 的 MLA, Qwen3 MoE 的 GQA 与 Step-3 的 MFA; 同时画出各硬件算力-内存带宽比.

bound.



受限.

With Step-3’s MFA design, its arithmetic intensity is 128 (assuming 8-bit quantization of KV). It is much closer to A800 (roofline is 156) and 910B (roofline is 175) than DSv3’s MLA (arithmetic intensity is 512). On H20 (roofline is 74), Step-3’s gap is also not too large compared with Qwen3 MoE (arithmetic intensity is 32). To better illustrate, we show the above models and hardware in Figure 5. We show how compute and memory access grows with context length, from 8K to 32K, for each model. Correspondingly, we also plot a line for each hardware with the slope based on their computationbandwidth ratio.



Step-3 的 MFA 算术强度为 128 (假设 KV 8-bit 量化), 比 DSv3 MLA (512) 更接近 A800 (roofline 156) 与 910B (175). 在 H20 (roofline 74) 上, Step-3 与 Qwen3 MoE (强度 32) 相比差距也不算过大. Figure 5 画出上述模型与硬件: 各模型从 8K 到 32K 的计算与访存增长, 以及按各硬件算力-带宽比画的斜率线.

In Figure 5, it is also clear that Step-3’s MFA achieves low computation and memory access simultaneously. Namely, its required computation is one-fourth of DSv3’s, and its required memory access is one-third of Qwen3’s. This enables Step-3 to maintain low costs even on accelerators whose roofline does not match Step-3 well.



Figure 5 也清楚显示 MFA 同时压低计算与访存: 所需计算约为 DSv3 的四分之一, 所需访存约为 Qwen3 的三分之一. 即使加速器 roofline 与 Step-3 不完全匹配, 也能维持低成本.

Step-3’ MFA achieves the more balanced arithmetic intensity and low overhead without cutting corners. In fact, its attention effective rank [7] is 16,384, the same as DSv3’s MLA and larger than Qwen3 MoE’s 8,192.



MFA 拿到更均衡的算术强度与低开销, 并非偷工减料. 其 attention effective rank [7] 为 16,384, 与 DSv3 MLA 相同, 大于 Qwen3 MoE 的 8,192.

Step-3 chooses slightly lower arithmetic intensity than most of the hardware’s roofline, to leave room for future optimizations like quantization and MTP, as discussed next.



Step-3 把算术强度选得略低于多数硬件 roofline, 以便给后续量化与 MTP 留空间, 下文讨论.

> **看表:** §5.1 写 MFA 算术强度 128, MLA 512, GQA 32; Table 4 里 H800 roofline 591, H20 74, A800 156, 910B 175. MFA 128 更贴哪几张卡?
> 原文写 MFA 128 「much closer to A800 (156) and 910B (175) than DSv3’s MLA (512)」; 相对 H20 (74) 「gap is also not too large compared with Qwen3 MoE (32)」. 对 H800 (591) 则是刻意略低, 给量化/MTP 留余量—不是去贴 H800 的峰值强度.

### 5.2 Discussion: Quantization and MTP

**Quantization:** All models can adopt more aggressive quantization strategies than those we have assumed. A particularly noteworthy quantization approach is low-bit storage with high-bit computation, e.g., storing KV in 4-bit but performing attention calculation in 8-bit. This effectively doubles the arithmetic intensity of each attention design. Such a change has different meanings for different attention designs. We still use DSv3, Qwen3, and Step-3 as examples:



**量化:** 各模型都可采用比文中假设更激进的量化. 尤其值得注意的是低比特存储 + 高比特计算, 例如 KV 存 4-bit 但 attention 算 8-bit, 这相当于把各 attention 设计的算术强度翻倍. 对不同设计含义不同. 仍以 DSv3, Qwen3, Step-3 为例:

<small><span class="docvortex-page-footnote" data-block-type="page_footnote" style="color:#6b7280"><sup>4</sup>One can assume a more practical MFU like 40%, but the trend will not reverse.</span></small>

<!-- page 9 of 18 -->

• Implications for DSv3: Because DSv3’s arithmetic intensity is already close to H800’s roofline and much higher than other hardware, such quantization scheme will not improve efficiency.

• 对 DSv3: 因其算术强度已贴近 H800 roofline 且远高于其他硬件, 该量化方案不会抬效率.

• Implications for Qwen3: It might enable GQA-family models to get closer to or surpass H20’s roofline. It can benefit on all hardware listed.

• 对 Qwen3: 可能让 GQA 族更接近或超过 H20 roofline, 所列硬件皆可能受益.

Implications for Step-3: This could potentially turn arithmetic intensity to exceed the roofline of A800 and 910B, but still not far off. There should be moderate performance gain. It may benefit a lot on H800 with higher roofline.



对 Step-3: 可能使算术强度超过 A800 / 910B 的 roofline, 但不会偏离太远, 应有中等收益; 在更高 roofline 的 H800 上可能收益更大.

For quantization schemes that use the same format for KV storage and attention computation (assuming the hardware has native support), we anticipate that those will not significantly alter the overall trends of different models.



若 KV 存储与 attention 计算用同一格式 (假设硬件原生支持), 作者预计不会显著改变各模型总体趋势.

Regarding hybrid models like MM M1, many (including ourselves) may wonder if aggressive KV quantization is feasible. However, given that there are only 8 layers of full attention and they might be more sensitive to quantized KV, we adopt a more conservative approach – using the official setup – in this paper. We look forward to more in-depth research on this topic.



对 MM M1 一类混合模型, 很多人 (含作者) 会想激进 KV 量化是否可行. 但全注意力仅约 8 层且可能对量化 KV 更敏感, 本文采取更保守做法—跟官方设定. 期待该题有更深入研究.

**Multi-Token Prediction (MTP):** MTP and the "low-bit storage, high-bit computation" quantization scheme have similar effects on arithmetic intensity – doubling (or even multiplying) it. Therefore, similar to the previous discussion, DSv3 is the least MTP-friendly model. GQA and MFA (Step-3) models can leverage MTP to enhance throughput on various hardware.



**Multi-Token Prediction (MTP):** MTP 与 「低比特存储, 高比特计算」 量化对算术强度效果类似—翻倍 (甚至更多倍). 因此同前, DSv3 最不友好于 MTP; GQA 与 MFA (Step-3) 可借 MTP 在多种硬件上抬吞吐.

However, MTP’s impact is global – enabling MTP also alters the computation load of FFN. Under the assumption of AFD, where FFN can always get enough batch to run with high MFU (see the next section), MTP could actually incur additional costs. MTP is not 100% accurate in predicting additional tokens, yet FFN’s cost is always increased regardless of prediction accuracy. One must be very careful in deciding whether to enable MTP.



但 MTP 影响是全局的—启用也会改 FFN 计算负载. 在 AFD 假设下 FFN 总能攒够 batch 跑高 MFU (见下节), MTP 反而可能带来额外成本: 额外 token 预测并非 100% 准确, 而 FFN 成本无论预测准不准都会上升. 是否开 MTP 必须非常谨慎.

**Summary:** Step-3’s MFA design and its arithmetic intensity allows applying further KV quantization or enabling MTP to gain further cost savings than the results in Table 6. In principle, Qwen3 and other GQA-based models could benefit from similar mechanisms. However, due to the high arithmetic intensity of its MLA, DSv3 may not see substantial benefits from further KV storage quantization or enabling MTP in large-batch, high-throughput scenarios.



**小结:** Step-3 的 MFA 及其算术强度, 允许进一步 KV 量化或开 MTP, 相对 Table 6 再省成本. 原则上 Qwen3 及其他 GQA 基模型也可受益. 但因 MLA 算术强度高, DSv3 在大 batch 高吞吐场景下, 进一步 KV 存储量化或开 MTP 未必有实质收益.

> **拆开:** §5.2 说 MTP 会把算术强度翻倍, 又说在 AFD 下 「MTP could actually incur additional costs」. 这两句是否矛盾?
> 不矛盾. 前半针对 attention: 强度翻倍可能抬 attention 侧效率; 后半针对 FFN: 「FFN’s cost is always increased regardless of prediction accuracy」. AFD 已让 FFN 高 MFU, 多出来的错误预测仍照付 FFN 账单. 是否启用要两边一起算.

### 5.3 FFN’s Batch Requirement for High MFU

Next, we discuss the costs of the Feed-Forward Network (FFN). The majority of FFN computation involves matrix multiplications, with a very small portion for activation functions. Most memory accesses are for model weights, with a very smaller portion for input and output hidden features. For simplicity, we will focus on matrix multiplications and model



接下来讨论 FFN 成本. FFN 计算主体是矩阵乘, 激活函数占比很小; 访存主体是模型权重, 输入输出 hidden 占比更小. 为简略, 只盯矩阵乘与模型

weight accesses.



权重访存.

For the matrix multiplication in FFN computation, the number of floating-point operations (FLOPs) is given by:



FFN 矩阵乘的 FLOPs 为:

$$
2 \times N _ {\text {token}} \times W _ {\text {FFN}}
$$

where $N _ { \mathrm { t o k e n } }$ represents the number of tokens processed in a batched FFN computation. In decoding, it is equivalent to the batch size B entering the FFN (without MTP). W<sub>FFN</sub> denotes the number of model weights in the FFN. Clearly, the computation-to-memory access ratio (assuming 8-bit weight storage) is $2 \times N _ { \mathrm { t o k e n } } , \mathrm { o r } 2 \times B .$



其中 $N_{\mathrm{token}}$ 是 batched FFN 处理的 token 数; decoding 下等价于进入 FFN 的 batch size $B$ (无 MTP). $W_{\mathrm{FFN}}$ 是 FFN 权重个数. 显然算力-访存比 (假设权重 8-bit 存储) 为 $2\times N_{\mathrm{token}}$, 即 $2\times B$.

In the roofline model, to achieve good MFU, the computation-to-memory access ratio should at least match the hardware’s roofline, as shown in Table 4. The corresponding ideal batch size, denoted as $B _ { \mathrm { d e n s e } } ,$ , should at least be:



在 roofline 模型中, 要拿好 MFU, 算力-访存比至少要匹配硬件 roofline (表 4). 对应理想 batch $B_{\mathrm{dense}}$ 至少满足:

$$
2 \times B _ {\text {dense}} \geq \frac {\text {FLOPs}}{\text {Bandwidth}}
$$

With a batch size that activates all experts, MoE increases the proportion between memory accesses and computation. We define the sparsity of MoE as S. For example: - If 2 experts are chosen from 8, then $\begin{array} { r } { S = \frac { 1 } { 4 } . \textrm { - } \mathrm { I f }   8 } \end{array}$ experts are chosen from 256 plus one shared expert, then $\textstyle S = { \frac { 9 } { 2 5 6 } }$



在激活全部相关专家的 batch 下, MoE 抬高访存相对计算的比例. 定义 MoE 稀疏度 $S$. 例如: 从 8 里选 2, 则 $S=1/4$; 从 256 里选 8 再加 1 个共享专家, 则 $S=9/256$.

For MoE models, the ideal batch size for high MFU is:



对 MoE, 高 MFU 理想 batch 为:

$$
\left| B _ {\mathrm{MoE}} = \frac {B _ {\text {dense}}}{S} \right.
$$

which can be several to tens of times larger than in dense models. Combined with the above equations, we get:



可比稠密模型大数倍到数十倍. 合并上式得:

$$
B _ {\mathrm{MoE}} \geq \frac {\text {FLOPs}}{2 \times S \times \text {Bandwidth}}
$$

### 5.4 Optimal MoE Sparsity vs. Hardware

For contemporary models with hundreds of billions of parameters and long sequence inference, the memory capacity of a single machine often cannot support the appropriate batch size, necessitating distributed deployment. Whether using EP deployment [30] or AFD in this paper, the hardware running FFN computations needs to receive input hidden features (with dimension H) via the network and transmit the FFN computation results back via the network. Assuming 8-bit precision dispatch and 16-bit precision combine, and a batch size that meets high MFU requirements, the total transmission volume is:



当代数百 B 参数模型加长序列推理时, 单机显存往往撑不住合适 batch, 必须分布式部署. 无论 EP [30] 还是本文 AFD, 跑 FFN 的硬件都要通过网络收输入 hidden (维 $H$) 并把 FFN 结果传回. 假设 dispatch 8-bit, combine 16-bit, 且 batch 满足高 MFU, 总传输量为:

$$
3 \times H \times B _ {\mathrm{MoE}}
$$

With AFD and an ideal three-stage pipeline and the TPOT target of 50ms, we need to keep the network communication time below 50ms/3 = 16.6ms. We denote network bandwidth as Net, distinguished from memory bandwidth Bandwidth, we get:



在 AFD 理想三级流水与 50ms TPOT 目标下, 网络通信需低于 50/3 = 16.6ms. 记网络带宽为 Net (区别于内存带宽 Bandwidth), 有:

$$
\frac {3 \times H \times B _ {\mathrm{MoE}}}{\mathrm{Net}} \leq \frac {1 6 . 6 \mathrm{ms}}{L}
$$

<!-- page 10 of 18 -->

where L is the number of model layers. Substituting the expression for $B _ { \mathrm { M o E } }$ , we obtain:



其中 $L$ 为模型层数. 代入 $B_{\mathrm{MoE}}$ 表达式得:

$$
\frac {H \times \text {FLOPs} \times L}{\text {Net} \times S \times \text {Bandwidth}} \leq \frac {1 6 . 6 \mathrm{ms} \times 2}{3} = 1 1. 1 \mathrm{ms}
$$

We can derive the "optimal MoE sparsity" acceptable by the hardware, referring to the sparsest MoE configuration that the hardware can support to achieve ideal MFU while perfectly hiding network communication:



可导出硬件可接受的 「最优 MoE 稀疏度」: 在仍能拿理想 MFU 且完美藏住网络通信的前提下, 硬件能撑住的最稀 MoE 配置:

$$
S \geq \frac {H \times \text {FLOPs} \times L}{\text {Net} \times \text {Bandwidth} \times 1 1 . 1 \mathrm{ms}}
$$

Next, we use Step-3’s MoE architecture as an example. Its hidden feature size is 7168 and the number of layers L is 61. Those numbers are identical to DSv3. We substitute the hardware parameters for each accelerator. We assume H800 and H20 use $4 0 0 G b p s \times 8$ NICs, while A800 and 910B use $2 0 0 G b p s \times 8 \; \mathrm { N I C s } ^ { 5 }$ . Table 7 shows the results.



以 Step-3 的 MoE 架构为例: hidden 7168, 层数 $L$=61, 与 DSv3 相同. 代入各加速器硬件参数. 假设 H800/H20 用 $400\mathrm{Gbps}\times 8$ NIC, A800/910B 用 $200\mathrm{Gbps}\times 8$ NIC<sup>5</sup>. 结果见表 7.

| Accelerator | H800 | H20 | A800 | 910B |
| --- | --- | --- | --- | --- |
| Minimum S | 0.058 | 0.007 | 0.031 | 0.034 |

Table 7: Minimum MoE sparsity for different hardware platforms to achieve good MFU, where $H = 7 1 6 8 , L = 6 1$

表 7: 各硬件平台拿好 MFU 所需的最小 MoE 稀疏度 ($H=7168$, $L=61$).

It is clear that the optimal MoE sparsity varies significantly across hardware platforms. H20 can accommodate the sparsest MoE configuration due to its lower computational power and higher memory bandwidth, allowing it to achieve high MFU with a smaller batch size and better tolerate MoE sparsity. H800 is the least friendly to very sparse MoE. However, H800 has the most affordable unit cost per FLOP (Table 5).



显然最优 MoE 稀疏度跨硬件差异很大. H20 因算力较低, 内存带宽较高, 可用更小 batch 拿高 MFU, 更能容忍稀疏, 因而可撑最稀配置. H800 对极稀 MoE 最不友好; 但其每 FLOP 单价最便宜 (Table 5).

To ensure that Step-3 can leverage high-roofline hardware like H800, we make sure Step-3 is not sparser than 0.058. In contrast, DSv3, for example, would require (256 + 1) × 0.058 − 1 = 14 MoE experts<sup>6</sup>to be activated to achieve good MFU on H800, which is much larger than the official 8 activated experts. In other words, if DSv3 activates more experts, the decoding costs may not rise much. It means it may be leaving extra model performance on the table.



为保证 Step-3 能用上 H800 一类高 roofline 硬件, 使其稀疏度不稀于 0.058. 相对地, 例如 DSv3 要在 H800 上拿好 MFU, 需激活 $(256+1)\times 0.058-1=14$ 个 MoE 专家<sup>6</sup>, 远大于官方 8 个激活专家. 换言之, 若 DSv3 多激活专家, decoding 成本未必升多少—等于可能把额外模型性能留在桌上没用.

Even worse, unideal hardware efficiency may exaggerate the problem. For example, on the H800 platform with DeepEP [30], the measured average throughput per network card is 40GB/s instead of 50GB/s, which can lead to a 25% increase in the optimal sparsity, e.g., 0.073 for H800. Considering all these, Step-3 chooses a sparsity of around 0.08 (including shared expert).



更糟的是, 非理想硬件效率会放大问题. 例如 H800 + DeepEP [30] 实测每网卡平均吞吐 40GB/s 而非 50GB/s, 可使最优稀疏度再抬约 25%, 如 H800 上到 0.073. 综合这些, Step-3 选择约 0.08 的稀疏度 (含共享专家).

Being even sparser, Llama 4 Maverick and Kimi K2 will be even further from the high MFU region when running on H800.



更稀的 Llama 4 Maverick 与 Kimi K2 在 H800 上会离高 MFU 区更远.

To clarify, all the theoretical cost analysis in §4 ignores the network bottleneck by assuming all network communication



澄清: §4 全部理论成本分析都忽略网络瓶颈, 假设网络通信

can be overlapped and all FFNs can run in high MFU states. The network bottleneck and MoE sparsity problems discussed in this section will further increase the actual costs of oversparse models like DSv3, Kimi K2, and Llama 4 Maverick.



都能被重叠, 且 FFN 都能跑在高 MFU. 本节讨论的网络瓶颈与 MoE 稀疏问题, 会进一步抬高 DSv3, Kimi K2, Llama 4 Maverick 一类过稀模型的实际成本.

> **确认:** Table 7 给 H800 最小 $S=0.058$, 正文又写 Step-3 选约 0.08. 这 0.08 是不是把 DeepEP 实测 40GB/s 的 25% 上调也算进去了?
> 原文顺序是: 先保证 「not sparser than 0.058」; 再举 DeepEP 实测可使最优稀疏抬到 0.073; 然后 「Considering all these, Step-3 chooses a sparsity of around 0.08 (including shared expert)」.0.08 是综合 roofline 下限与非理想网卡吞吐后的选型, 不是 Table 7 格子里的另一个独立公式解.

### 5.5 Discussion: Workaround for Over-sparsity

The above analysis regarding sparsity S is based on AFD’s deployment philosophy – using just enough FFN instances and accumulating a large batch size for high MFU. In a relatively small TP or EP deployment, the MoE sparsity S on each FFN instance is the same as the whole model. For example, two FFN instances running DSv3’s 8-in-256 with $E P   =   2$ (in terms of servers) mean each instance runs 4-in-128. S remains the same for each server.



上述关于稀疏度 $S$ 的分析基于 AFD 部署哲学: 只用刚好够的 FFN 实例, 攒大 batch 拿高 MFU. 在相对小的 TP 或 EP 部署里, 每个 FFN 实例上的 $S$ 与整模相同. 例如两台 FFN 跑 DSv3 的 8-in-256 且 $EP=2$ (按服务器计), 则每实例跑 4-in-128, 各服务器 $S$ 不变.

However, there are workarounds that may increase S, to alleviate the network bottleneck, but at the cost of other aspects.



也有 workaround 可抬高 $S$ 以缓解网络瓶颈, 但要付出其他代价.

**Workaround 1: Large EP.** When EP (in terms of servers) is sufficiently large, especially exceeding K (the number of activated experts), the network traffic volume required by each FFN (or EP) server is reduced. This is the case for DSv3’s official deployment that uses more than 10 servers as a giant EP deployment.



**Workaround 1: 大 EP.** 当 EP (按服务器) 足够大, 尤其超过 $K$ (激活专家数) 时, 每台 FFN/EP 服务器所需网络流量下降. DSv3 官方部署用超过 10 台服务器做巨型 EP 即属此类.

**Workaround 2: MoE Routing Restrictions.** Limiting token routing to adjacent experts can also make each local portion of the model not as sparse as the entire model.



**Workaround 2: MoE 路由限制.** 限制 token 只路由到邻近专家, 也可使模型局部不比整模那么稀.

DSv3 employs both methods to mitigate the issue of its over-sparsity for the H800 platform. Kimi K2 follows DSv3 on Workaround 1, but removes Workaround 2. This may make the network bottleneck even worse than DSv3.



DSv3 两种手段都用, 以缓解其在 H800 上的过稀. Kimi K2 跟 DSv3 用 Workaround 1, 但去掉 Workaround 2, 网络瓶颈可能比 DSv3 更糟.

We must note that both approaches come with costs: 1) Workaround 1 is more susceptible to expert imbalance issues, reducing actual efficiency. 2) Workaround 2 adversely affects the model’s expressiveness. The impact on model performance has not been well studied yet.



必须指出两者都有代价: 1) Workaround 1 更易受专家不均影响, 降低实际效率; 2) Workaround 2 损害模型表达力, 对最终效果的影响尚未研究充分.

Step-3’s design avoids this sparsity issue, allowing it to use small TP, EP or TP + EP hybrid approaches during AFD. This minimizes the performance impact of expert imbalance and eliminates the need for any routing restrictions.



Step-3 的设计避开该稀疏问题, AFD 下可用小 TP, EP 或 TP+EP 混合, 从而最小化专家不均对性能的影响, 且无需任何路由限制.

## 6 Non-Flagship Hardware Support

With AFD, both the attention and FFN components can be easily scaled, respectively. This creates more opportunities to leverage non-flagship hardware for the attention part, or FFN part, or both.



有了 AFD, attention 与 FFN 可分别扩展, 更有机会让非旗舰硬件承担 attention, 或 FFN, 或两者.

For example, Step-3’s MFA workload running on H800 is memory bandwidth bound. It can be replaced by four L20s, on which MFA is still memory bandwidth bound. L20’s memory bandwidth is more than 25% of H800’s, so in theory, with a 25% batch size on each L20, four L20s can run as fast as an H800 in a DP manner. Thanks to AFD, we do not need to worry about the FFN part – it can remain unchanged when we discuss the attention part. For network communication, an L20 server needs 25% of bandwidth compared with an H800



例如 Step-3 的 MFA 在 H800 上是内存带宽受限, 可用四张 L20 替换, 其上 MFA 仍带宽受限. L20 内存带宽大于 H800 的 25%, 理论上每张 L20 用 25% batch, 四卡 DP 可与一张 H800 一样快. 多亏 AFD, 讨论 attention 时不必改 FFN. 网络上, 一台 L20 服务器相对一台 H800 只需 25% 带宽

<small><span class="docvortex-page-footnote" data-block-type="page_footnote" style="color:#6b7280"><sup>5</sup>The maximum network bandwidth is determined by PCIe generations.</span></small>

<small><span class="docvortex-page-footnote" data-block-type="page_footnote" style="color:#6b7280"><sup>6</sup>The +1 and −1 in the formula is for shared expert.</span></small>

<!-- page 11 of 18 -->

server, i.e., 4 × 200Gbps vs. $8 \times 4 0 0 G b p s .$ It is also easy to satisfy.



即 $4\times 200\mathrm{Gbps}$ vs $8\times 400\mathrm{Gbps}$, 也易满足.

The main limitation is that, for both attention and FFN servers, weaker hardware must still meet the latency requirements for AFD’s three or four-stage pipeline to meet SLA. For instance, a three-stage pipeline requires both attention and FFN computations to be kept within $\frac{16.6 ms }{61 layers } \approx 272\mu s$ for Step-3. We illustrate this with L20.



主要限制是: attention 与 FFN 服务器上的更弱硬件仍须满足 AFD 三/四级流水的延迟, 才能保住 SLA. 例如三级流水要求 Step-3 的 attention 与 FFN 计算都落在 $\frac{16.6\mathrm{ms}}{61\text{ layers}}\approx 272\mu s$ 内. 下文用 L20 说明.

**Attention:** We consider the memory access requirement as a necessary condition for satisfying the latency requirement. One L20 can access 864 $\mathrm{GB} / \mathrm{s} \times 272 \mu \mathrm{s}=235$ MB within 272µs. The linear parts<sup>7</sup>require memory access of 67 MB in total. Thus, kvcache cannot exceed $235-67=168  MB$ With each token’s KV being 512 bytes, the total inference context length cannot exceed approximately 328K tokens. This means that if the average context length is 8K tokens, keeping the batch size below 41 is sufficient. The maximum context length for a single request is up to 328K, which is still reasonable. Of course, the hardware cannot always run at its peak memory bandwidth, and there is inter-GPU communication overhead we omit. But we think L20 in general is capable of running Step-3’s attention part.



**Attention:** 把访存需求当作满足延迟的必要条件. 一张 L20 在 272µs 内可访存 $864\mathrm{GB/s}\times 272\mu s=235$ MB. 线性部分<sup>7</sup>共需 67 MB, 故 kvcache 不得超过 $235-67=168$ MB. 每 token KV 为 512 字节, 则总推理上下文约不超过 328K tokens. 若平均上下文 8K, 保持 batch 低于 41 即可; 单请求最大上下文可达 328K, 仍合理. 当然硬件不能始终满峰带宽, 且文中省略了卡间通信开销, 但作者认为 L20 大体能跑 Step-3 的 attention.

However, using even weaker accelerators like L4 with a memory bandwidth of 300 GB/s would spend most of the $2 7 2 \mu \mathrm { s }$ timeframe just to access the linear part’s 67 MB. Consequently, L4 is unlikely usable for Step-3’s attention. We recommend accelerators that are at least as powerful as L20.



但若用更弱的 L4 (内存带宽 300 GB/s), 272µs 窗口大半要花在读线性部分的 67 MB 上, 因而 L4 不太可能用于 Step-3 attention. 建议至少 L20 级加速器.

Given that Step-3’s MFA has the smallest KV volume and moderate arithmetic intensity, it is relatively hardwarefriendly for weaker hardware than other recent models with similar sizes.



因 MFA 的 KV 体积最小且算术强度适中, 相对同档近期模型, 对更弱硬件更友好.

**FFN:** Similarly to attention, each FFN layer must complete within 272µs. Both computation and memory access must finish within this timeframe. Computation scales with batch size, and we aim to maximize batch size to push FFN into the compute-bound (high MFU) region. For convenience, we assume an appropriate batch size pushes FFN into the compute-bound region, utilizing only 50% of the memory bandwidth. Real-world scenarios might vary, but we use this for illustration.



**FFN:** 同理, 每层 FFN 须在 272µs 内完成, 计算与访存都要落在窗口内. 计算随 batch 缩放, 目标是尽量加大 batch 把 FFN 推进 compute-bound (高 MFU). 为方便, 假设合适 batch 已把 FFN 推进 compute-bound, 且只吃 50% 内存带宽. 真实场景可能不同, 此处仅作说明.

For an L20, this means it can support FFN up to 864 GB/s× $50\% \times 272\mu  s  = 117  MB$ . For 61 layers in Step-3, this totals 7.1 GB. There are eight L20s per server, which can accommodate 56.8 GB of FFN weights. For the size of Step-3 (around 300 GB FFN weights), we need six L20 servers, or 48 cards, to run in EP to meet the performance requirements. We consider this number reasonable, especially as it is still much smaller than DSv3’s deployment.



对 L20, 意味着可支撑 FFN 至 $864\mathrm{GB/s}\times 50\%\times 272\mu s=117$ MB; 61 层合计 7.1 GB. 每服务器 8 张 L20, 可装 56.8 GB FFN 权重. Step-3 约 300 GB FFN 权重, 需 6 台 L20 服务器即 48 卡做 EP 才能满足性能. 作者认为这数字合理, 尤其仍远小于 DSv3 部署规模.

Again, we consider a weaker card L4, whose memory bandwidth is only one third of L20. It means we need 144 cards to meet the FFN latency requirement for Step-3. At this scale, we



再看更弱的 L4, 内存带宽仅约 L20 的三分之一, 则需 144 卡才能满足 Step-3 的 FFN 延迟. 到此规模,

![Image block](images/p11-figure-6-module-disaggregation-in-afd-architecture-ffn.png)

Figure 6: Module disaggregation in AFD architecture. FFN can be deployed in TP-only, EP-only, or a hybrid TP+EP way, depending on hardware and model architecture.



图 6: AFD 架构中的模块拆分. FFN 可按硬件与模型架构部署为纯 TP, 纯 EP, 或 TP+EP 混合.

start to be concerned about other issues like expert imbalance, stability, etc.



开始担心专家不均, 稳定性等问题.

The primary influencing factor here is the total number of FFN parameters. The larger the total parameters, the less friendly it is to weaker hardware. Step-3 strikes a good balance at the level of L20 cards.



这里的主因是 FFN 总参数量: 越大对弱硬件越不友好. Step-3 在 L20 卡这一档取得较好平衡.

**Summary:** For models with hundreds of billions of parameters, using at least L20 or stronger cards is recommended. Stronger cards reduce the number of required FFN servers, benefiting system reliability and MoE load balancing.



**小结:** 对数百 B 参数模型, 建议至少 L20 或更强卡. 更强卡减少所需 FFN 服务器数, 有利于系统可靠性与 MoE 负载均衡.

> **回看:** 页 11 用 $\frac{16.6\mathrm{ms}}{61}\approx 272\mu s$ 作为每层预算. 这 16.6ms 来自哪里?
> 来自 §3.1 性能目标: 50ms TPOT 的 3 级流水, 「16.6ms per stage for A/F/communication」. 脚注 3 另给 4 级流水每级 12.5ms. L20 可行性推演用的是 3 级预算, 不是另造的延迟常数.

## 7 Implementation and Results

### 7.1 System Workflow and Optimizations

We describe our AFD system implementation details in this section. As shown in Figure 6, the AFD architecture is composed of two main components: (1) Attention instances: responsible for computing the attention modules, managing the KV cache, and performing the non-expert computation operations in MoE modules (e.g., routers). For Step-3, we employ a local DP attention mechanism in which each GPU handles a batch of independent data. (2) FFN instances: directly handle the pure MoE computation and multi-GPU communication necessary for TP or EP. Since FFN can be deployed in TP-only, or EP-only, or a hybrid TP+EP manner, the FFN instance is designed and implemented to be flexible and can be configured accordingly. We use TP-only FFN as an example, where the weights of all MoE experts are sharded in a tensor parallelism manner. As an FFN instance receives data from attention instances, it first performs an all-gather operation to collect the data from the TP region. After computation, it performs a reduce-scatter operation to aggregate and scatter the results back to the original GPUs, followed by the token transmission back to the attention instances.



本节描述 AFD 系统实现. 如图 6, AFD 由两大组件构成: (1) Attention 实例: 负责 attention 模块计算, 管理 KV cache, 以及 MoE 中非专家计算 (如 router). Step-3 用本地 DP attention, 每 GPU 处理一批独立数据. (2) FFN 实例: 直接处理纯 MoE 计算及 TP/EP 所需多卡通信. 因 FFN 可纯 TP / 纯 EP / TP+EP 混合, 实例设计为可灵活配置. 文中以纯 TP FFN 为例: 全部 MoE 专家权重按张量并行切分. FFN 实例从 attention 收到数据后先 all-gather 收集 TP 域数据; 计算后再 reduce-scatter 聚合并散回原 GPU, 随后把 token 传回 attention 实例.

<small><span class="docvortex-page-footnote" data-block-type="page_footnote" style="color:#6b7280">7<sup>o</sup><sub>pro</sub> j uses TP=8, while other linear parts are replicated across 8 GPUs.</span></small>

<!-- page 12 of 18 -->

![Image block](images/p12-figure-7-communication-topology-and-the-multi-stages.png)

Figure 7: Communication topology and the multi-stages pipeline of the AFD architecture.



图 7: AFD 架构的通信拓扑与多级流水线.

The system can be configured to support multiple attention and FFN instances simultaneously. During communication, the attention instances broadcast the FP8 tokens (quantized from the BF16 activation after the upstream normalization) to the FFN instances; conversely, the FFN instances return BF16 output to the attention instances to preserve high residual precision. For Step-3, since the FFN instances spans multiple machines in a hybrid EP+TP way, the attention instances introduce a reduction module to combine all partial EP results from multiple FFN nodes. In addition, the attention instances also need to transfer some small metadata, such as the expert distribution and FP8 tensor scale factors, to the FFN. The expert distribution is then used to dispatch the tokens and form an organized input for efficient expert computation. The metadata is typically small compared to the hidden state, and hence can be transferred with negligible overhead.



系统可同时配置多个 attention 与 FFN 实例. 通信时, attention 把 FP8 tokens (由上游归一化后的 BF16 激活量化而来) 广播给 FFN; 反过来 FFN 返回 BF16 输出以保持残差高精度. Step-3 的 FFN 以 hybrid EP+TP 跨多机, 故 attention 侧引入 reduction 模块合并多 FFN 节点的 EP 部分结果. 此外 attention 还需向 FFN 传少量元数据, 如 expert distribution 与 FP8 tensor scale. expert distribution 用于 dispatch token 并组织高效专家计算输入. 元数据相对 hidden state 通常很小, 开销可忽略.

The design of our AFD system is simple, allowing for easy integration of different models and serving frameworks. For example, our attention instances are developed based on vLLM [12] with minimal changes, while FFN instances are implemented merely on top of a lightweight C++ communication library (will be introduced in §7.2) and simple PyTorch interfaces with no special dependencies.



AFD 系统设计简单, 便于接入不同模型与 serving 框架. 例如 attention 实例基于 vLLM [12] 做最小改动; FFN 实例仅建在轻量 C++ 通信库 (§7.2) 与简单 PyTorch 接口上, 无特殊依赖.

**Multi-stages Pipeline.** Step-3 adopts a multi-stages pipeline to hide communication overhead and thus maximize overall throughput. Figure 7 illustrates the data flow in the multi-stages pipeline. Starting from the attention instance, the system receives three input samples (D1, D2, D3). These samples are processed sequentially and then transmitted over the network to the FFN instance for computation. With careful workload orchestration, the computation time for each computation stage is made nearly identical, enabling efficient pipelining and minimizing idle periods. The communication topology enables direct RDMA between GPUs, allowing data to be streamed in parallel with minimal latency, which can be easily hidden by the computation. Note that the figure distinguishes A→F and F→A communication paths for simplicity. However, they represent two independent communication and do not compete for network bandwidth, allowing them to execute concurrently in practice. As (D1, D2, D3) returns to the attention instance sequentially, the system can start processing the next layer in a streaming way, noted as (D1’, D2’,



**多级流水线.** Step-3 用多级流水线藏通信开销以最大化总吞吐. Figure 7 画数据流: 从 attention 实例起接收三个输入样本 (D1, D2, D3), 顺序处理后经网络送 FFN 计算. 仔细编排工作负载使各计算阶段耗时近乎相同, 从而高效流水并减少空闲. 通信拓扑支持 GPU 间直连 RDMA, 数据可并行流式传输且延迟极低, 易被计算掩盖. 图中为清晰区分 A→F 与 F→A; 实际是两路独立通信, 不争用网络带宽, 可并发. 当 (D1, D2, D3) 顺序回到 attention 后, 系统可流式开始下一层, 记为 (D1’, D2’,

D3’) in Figure 7. This design allows the system to achieve high throughput while maintaining low latency, as the critical path does not delay the processing of each sample.



D3’). 该设计在保低延迟的同时拿高吞吐, 因为关键路径不拖延每个样本的处理.

**Other Implementation Details.** We place the embedding and the LM head layers together with the attention instances since they incur small computation overhead. We develop tailored kernel optimizations for most kernels in the critical path, such as the FP8 GEMM and Flash Attention. For efficient NVLink communication for TP or EP within a single node, we leverage the NVLS APIs to implement the all-gather and reduce-scatter operations that not only can saturate NVLink bandwidth, but also can significantly reduce the GPU SM usage (particularly, our all-gather op is SM-free). The low SM usage is crucial for efficient communication-computation overlap, as revealed in previous work [2, 28].



**其他实现细节.** embedding 与 LM head 与 attention 实例放在一起, 因其计算开销小. 关键路径多数 kernel 做了定制优化, 如 FP8 GEMM 与 Flash Attention. 单节点内 TP/EP 的高效 NVLink 通信借助 NVLS API 实现 all-gather / reduce-scatter, 既吃满 NVLink 带宽, 又显著降低 GPU SM 占用 (尤其 all-gather 为 SM-free). 低 SM 占用对高效算通重叠至关重要, 见先前工作 [2, 28].

### 7.2 StepMesh: AFD Communication Library

AFD presents stringent performance challenges for communication libraries. For a 3-stage pipeline, AFD demands to complete transmission of FP8 tokens, scales, expert distribution, and BF16 activation between all attention and FFN instances within 272 µs (§6). Existing communication libraries struggle to consistently meet the requirement. Moreover, current libraries like NCCL and DeepEP introduce additional GPU SM usage dedicated to communication, inherently compromising the computation speed of attention and FFN. AFD also introduces a novel communication pattern, distinct from existing collectives and not well-supported. While workarounds like ncclSend/ncclRecv can be employed, they inevitably sacrifice performance. Addressing these challenges, we develop StepMesh, a specialized communication library for AFD based on GPUDirect RDMA, offering ultra-low latency, zero SM usage, and flexible communication.



AFD 对通信库提出严苛性能挑战. 3 级流水下, 需在 272 µs 内 (§6) 完成所有 attention 与 FFN 实例之间 FP8 tokens, scales, expert distribution 与 BF16 激活的传输. 现有通信库难以稳定达标. 且 NCCL, DeepEP 一类库会额外占用 GPU SM 做通信, 天生拖慢 attention / FFN 计算. AFD 还引入不同于既有集合通信, 支持不足的新通信模式; ncclSend/ncclRecv 一类 workaround 难免牺牲性能. 为此开发 StepMesh: 基于 GPUDirect RDMA 的 AFD 专用通信库, 提供超低延迟, 零 SM 占用与灵活通信.

**Communication Workflow Tailored for AFD Pipelines.** Figure 8 illustrates the design choices of StepMesh to optimally align with the AFD pipeline stages. 1) Asynchronous APIs and dedicated threads: StepMesh offers asynchronous APIs and utilizes independent threads for network receiving and sending. The CPU latency of each thread is meticulously designed to meet stringent latency requirements, ensuring smooth and efficient data flow. 2) CPU-Based operation execution: To avoid contention for GPU SM resources with computation threads, StepMesh executes all communication operations—such as RDMA PostSend—on CPUs. It leverages NUMA-aware CPU core binding to minimize processing jitters and ensure stable performance. However, we continue to observe certain jitters originating from GPU APIs, such as the GPU kernel synchronization API (cudaEventSync). In future iterations, we plan to explore IBGDA [9] to eliminate GPU kernel synchronization on CPUs, thereby further reducing communication latency. 3) Pre-registered tensors for efficient communication: StepMesh supports direct memory transmission for GPU tensors, eliminating the need for



**面向 AFD 流水线的通信工作流.** Figure 8 展示 StepMesh 为对齐 AFD 流水各级所做的设计选择. 1) 异步 API 与专用线程: 收发网络用独立线程, 各线程 CPU 延迟精心设计以满足严苛延迟. 2) CPU 侧执行操作: 为避免与计算线程抢 GPU SM, 所有通信操作 (如 RDMA PostSend) 在 CPU 上执行, 并用 NUMA 感知绑核降抖动. 但仍观察到若干来自 GPU API 的抖动, 如 cudaEventSync; 后续计划探索 IBGDA [9] 去掉 CPU 上的 GPU kernel 同步以再降延迟. 3) 预注册 tensor 以实现高效通信: StepMesh 支持 GPU tensor 直接内存传输, 无需

<!-- page 13 of 18 -->

![Image block](images/p13-figure-8-stepmesh-communication-workflow-tailored-for.png)

Figure 8: StepMesh communication workflow tailored for AFD.



图 8: 面向 AFD 的 StepMesh 通信工作流.

![Image block](images/p13-figure-9-stepmesh-framework-for-multiple-accelerators.png)

Figure 9: StepMesh framework for multiple accelerators. AF-TensorWorker and AFTensorServer APIs are for attention and FFN instances respectively.



图 9: 面向多加速器的 StepMesh 框架. AF-TensorWorker / AFTensorServer API 分别服务 attention 与 FFN 实例.

serialization/deserialization or memory copying. StepMesh requires users to register tensors, identified by unique tensor keys, before initiating communication. This registration process is flexible and can remove some time-consuming operations. For instance, FFN does not need to concatenate tensors from different attention instances. Instead, these tensors can be directly sliced from contiguous GPU memory that has been pre-registered, streamlining the communication process and improving efficiency.



序列化/反序列化或内存拷贝. 通信前需用唯一 tensor key 注册 tensor. 注册过程灵活, 可去掉若干耗时操作. 例如 FFN 不必拼接来自不同 attention 实例的 tensor, 可直接从已预注册的连续 GPU 内存切片, 从而简化通信并提效.

**Support Heterogeneous Accelerators.** Figure 9 presents the StepMesh framework, designed to be highly extensible and capable of integrating new types of accelerators. This framework treats accelerators as backends and establishes a set of backend interfaces that are crucial for AFD communication. These interfaces encompass essential functionalities such as memory allocation and stream synchronization. By adhering to these well-defined interfaces, new accelerators can be effortlessly integrated into the StepMesh framework. This streamlined and future-proof integration process allows for the rapid adoption of emerging hardware technologies, ensuring that the system remains at the cutting edge of performance and efficiency. StepMesh enables seamless communication between heterogeneous accelerators, fostering an environment where different types of hardware can collaborate effectively. This capability is essential for building cost-effective AFD systems that leverage a mix of accelerators to achieve optimal



**支持异构加速器.** Figure 9 给出高可扩展的 StepMesh 框架, 可接入新型加速器. 框架把加速器当 backend, 定义对 AFD 通信关键的 backend 接口, 涵盖内存分配与 stream 同步等. 遵守这些接口即可轻松接入新加速器. 该集成路径利于快速采用新兴硬件. StepMesh 支持异构加速器间无缝通信, 使不同硬件有效协作. 这对构建混用加速器, 追求最优

performance and resource utilization.



性能与资源利用率的高性价比 AFD 系统至关重要.

**Co-evolution with Networks.** Our AFD system operates on a Rail-Optimized RoCE network. The following optimizations have been implemented for deploying AFD over RoCE. 1) Topology-aware deployment: Attention and FFN instances are strategically connected to the same Top-of-Rack (ToR) switches. This deployment ensures that communication be tween any attention and FFN instance experiences uniform network latency, resulting in balanced communication costs and mitigating straggling issues, where certain nodes lag behind others, causing bottlenecks. 2) PFC-Only Transport: We disable congestion control and rely solely on ToR-NIC Priority Flow Control (PFC). PFC maintains a lossless network environment, crucial for the high-performance and low-latency requirements of AFD pipelines. 3) Balancing traffic between NIC ports: In our network, each GPU connects to the network through two NIC ports configured with link aggregation. To fully leverage the available bandwidth, for every communication pair (e.g., between an attention and FFN instance), we establish two RDMA Queue Pairs and assign them to the respective ports. This setup effectively balances traffic across both ports, optimizing data transmission efficiency and ensuring that the combined bandwidth is utilized effectively.



**与网络协同演进.** AFD 系统跑在 Rail-Optimized RoCE 网络上, 部署优化包括: 1) 拓扑感知部署: attention 与 FFN 实例策略性接到同一 ToR, 使任意一对通信延迟均匀, 通信成本均衡并缓解掉队. 2) 仅 PFC 传输: 关闭拥塞控制, 只靠 ToR-NIC 的 PFC 保无损网络, 对 AFD 流水的高性能低延迟关键. 3) NIC 端口流量均衡: 每 GPU 经两路链路聚合 NIC 入网; 对每个通信对建立两个 RDMA QP 并分到两端口, 以吃满合并带宽.

StepMesh is developed based on [10], and we also make it available as an open-source project. Interested developers can access, contribute to, and utilize the library by visiting [https://github.com/stepfun-ai/StepMesh](https://github.com/stepfun-ai/StepMesh).



StepMesh 基于 [10] 开发并开源: https://github.com/stepfun-ai/StepMesh.

### 7.3 Performance Results

**End-to-End Performance.** We compare Step-3 with DSv3, since it proposed the most representative distributed inference solution. Its official blog reports sustained average decoding throughput of 1,850 tokens/GPU/s (TGS) on H800, with 4,989 context on average. A higher peak performance in profiling is reported in [3], at 2,324 TGS with 4,096 context length on H800. Both numbers are obtained under 20 tokens/s decoding SLA.<sup>8</sup>



**端到端性能.** 与 DSv3 对照, 因其提出了最具代表性的分布式推理方案. 官方博客报 H800 上持续平均 decoding 吞吐 1,850 tokens/GPU/s (TGS), 平均上下文 4,989. 剖析峰值更高: [3] 报 H800, 上下文 4,096 时 2,324 TGS. 两数均在 20 tokens/s decoding SLA 下取得.<sup>8</sup>

<small><span class="docvortex-page-footnote" data-block-type="page_footnote" style="color:#6b7280"><sup>8</sup>We are also aware of higher numbers like [23]. However, we do not compare with them because they do not run with the same 20 tokens/s decoding SLA or have shorter context length.</span></small>

<!-- page 14 of 18 -->

| Model | Context Len (avg) | # Hopper GPUs | Peak TGS |
| --- | --- | --- | --- |
| DSv3-blog [1] | 4989 | 144 | 1850 |
| DSv3-profile [3] | 4096 | 128 | 2324 |
| Step-3 (BF16 attention) | 4096 | 40(3A2F) | 3321 |
| Step-3 (FP8 attention) | 4096 | 32(2A2F) | 4039 |
| Step-3 (FP8 attention) | 8192 | 48(4A2F) | 2643 |

Table 8: Performance comparison with reported number of DSv3 under 20 tokens/s decoding SLA. TGS: Tokens/GPU/s.

表 8: 在 20 tokens/s decoding SLA 下与已报道 DSv3 数字对照. TGS: Tokens/GPU/s.

To have a direct comparison, we also test Step-3’s decoding with 4,096 average context length on latest Hopper GPUs. GEMM runs in FP8 precision. While adhering to 20 tokens/s decoding SLA, Step-3 achieves 3,910 TGS on long-term average and 4,039 TGS (with FP8 attention) in a peak minute, around 74% higher than DSv3. We summarize the results in Table 8. We acknowledge that there is room for further improving DSv3 with more quantization, kernel optimizations, or better Hopper GPUs. However, we are confident that with the same level of optimizations and hardware, Step-3 can still achieve significantly higher throughput than DSv3.



为直接对照, 也在最新 Hopper 上测 Step-3, 平均上下文 4,096 的 decoding. GEMM 走 FP8. 在遵守 20 tokens/s SLA 下, Step-3 长期平均 3,910 TGS, 峰值分钟 4,039 TGS (FP8 attention), 约比 DSv3 高 74%. 汇总见表 8. 作者承认 DSv3 仍可通过更多量化, kernel 优化或更好 Hopper 再抬; 但有信心在同级优化与硬件下 Step-3 仍显著更高吞吐.

We are still working on a few implementation details to reduce jitter and bring the average throughput closer to the peak throughput. Those numbers are obtained without MTP. As §5.2 explained, Step-3 can benefit from MTP significantly on accelerators other than H20. A rough estimate is a 50% (or more, for longer context) improvement, given that the attention efficiency can double with MTP while FFN remains the same (MFU is already high without MTP).



仍在做若干实现细节以降抖动, 让平均吞吐更接近峰值. 上述数字均无 MTP. 如 §5.2 所述, Step-3 在非 H20 加速器上可显著受益于 MTP. 粗估可提升 50% (更长上下文更多), 因为 MTP 可使 attention 效率翻倍, 而 FFN 不变 (无 MTP 时 MFU 已高).

For the above 4K context length case, we use “2A2F” deployment, which means two attention instances plus two FFN instances, in total 32 GPUs. The total batch size is 6144, divided into three micro batches of 2,048 to fill the 3-stage pipeline. For different average context lengths, we can simply scale attention instances. For example, for 8K average context length, we can use “4A2F” and keep the same total batch size as 6144. The latency and MFU for each component and the total network traffic will remain the same, so the SLA still holds and total throughput remains the same. The peak TGS will fall to around 4039 × (2 + 2)/(4 + 2) = 2693. Readers can extrapolate the deployment solution and performance numbers for longer context, e.g., “16A2F” for average 32K context length with 898 TGS, etc.



上述 4K 情形用 「2A2F」: 两 attention + 两 FFN, 共 32 GPU. 总 batch 6144, 拆成三个微批各 2048 填满 3 级流水. 不同平均上下文可只扩 attention 实例: 例如平均 8K 用 「4A2F」, 总 batch 仍 6144. 各组件延迟与 MFU 及总网络流量不变, 故 SLA 仍成立, 总吞吐不变; 峰值 TGS 约降为 $4039\times(2+2)/(4+2)=2693$. 读者可外推更长上下文, 例如平均 32K 用 「16A2F」 得 898 TGS 等.

Note that the above scenarios are where Step-3 has the least advantage in cost saving compared with DSv3 using EP deployment. Step-3’s advantage will widen with longer context and on cheaper hardware than H800 (§4).



注意: 上述场景恰是 Step-3 相对 DSv3 EP 部署成本优势最小的情形. 上下文更长, 硬件比 H800 更便宜时, 优势会继续拉大 (§4).

**Ablation: Attention Quantization.** Our previous results on Step-3 are with FP8 attention. We also test BF16 attention to



**消融: Attention 量化.** 前述 Step-3 结果用 FP8 attention. 也测了 BF16 attention, 以

<table><tbody><tr><td rowspan="2">Context Length</td><td rowspan="2">Attention Type</td><td>Time Per Attention Layer (us)</td></tr><tr><td>H800 H20 A800</td></tr><tr><td rowspan="3">8k</td><td>MFA-Step3</td><td>281 438 531</td></tr><tr><td>MLA-DSv3</td><td>372 1252 -</td></tr><tr><td>GQA-Qwen3</td><td>382 812 791</td></tr><tr><td rowspan="3">32k</td><td>MFA-Step3</td><td>791 1452 1484</td></tr><tr><td>MLA-DSv3</td><td>1125 4817 -</td></tr><tr><td>GQA-Qwen3</td><td>1391 3042 3010</td></tr></tbody></table>

Table 9: Performance comparison of MFA/MLA/GQA. For MLA, we use FlashMLA which does not have official SM80 implementation, so its A800 number is not tested. We use FA3 (SM90) and FA2 (SM80) for MFA/GQA. Here the attention layer includes the linear projection before and after the core attention op. Each experiment uses 4 GPUs and a total batch size of 256. Both MFA and MLA use DP attention, while GQA uses TP attention. GEMM runs with FP8 (SM90) or INT8 (SM80) while attention runs with BF16.

表 9: MFA/MLA/GQA 性能对照. MLA 用 FlashMLA (无官方 SM80 实现), 故未测 A800. MFA/GQA 用 FA3 (SM90) 与 FA2 (SM80). 此处 attention 层含核心 attention 前后线性投影. 每实验 4 GPU, 总 batch 256. MFA 与 MLA 用 DP attention, GQA 用 TP attention. GEMM: SM90 上 FP8 / SM80 上 INT8; attention 跑 BF16.

understand the gain from quantization. Since the attention cost increases, we use “3A2F” with a total batch size of 6048, close to the previous 6144. Each attention instance then processes 6048/3/3=672 samples for each micro batch. As shown in Table 8, the result is 3,321 TGS, around 18% lower than FP8 attention. But it still outperforms DSv3 by a large margin.



理解量化收益. 因 attention 成本上升, 改用 「3A2F」, 总 batch 6048, 接近先前 6144. 每 attention 实例每微批处理 $6048/3/3=672$ 样本. 见表 8, 结果 3,321 TGS, 约比 FP8 attention 低 18%, 但仍大幅超过 DSv3.

**Ablation: MFA.** To further understand the performance gain, we conduct an ablation study on the attention layer of Step-3, DSv3 and Qwen3-235B. They represent three different attention designs – MFA, MLA and GQA, respectively. Since we only test the attention layer, the number also indicates the performance of an attention instance in real AFD deployment. As shown in Table 9, MFA-Step3 achieves the lowest latency, followed by MLA-DSv3 and GQA-Qwen3. The performance gap is widened on H20 and A800, indicating that MFA is more efficient on lower-end accelerators. Also, the gap is larger on longer context lengths, which aligns with our analysis in §5.



**消融: MFA.** 进一步在 Step-3 / DSv3 / Qwen3-235B 的 attention 层做消融, 分别代表 MFA / MLA / GQA. 只测 attention 层, 数字也对应真实 AFD 中 attention 实例表现. 见表 9: MFA-Step3 延迟最低, 其次 MLA-DSv3, 再 GQA-Qwen3. 差距在 H20 与 A800 上拉大, 说明 MFA 在更低端加速器上更高效; 长上下文差距也更大, 与 §5 分析一致.

**Ablation: Scaling Step-3 to > 600B.** Readers may wonder how much Step-3’s advantage is due to having fewer total parameters than DSv3. We consider the case to upcycle [6,11] Step-3’s MoE FFN into the 600B parameters region, a similar size to DSv3. Since FFN is doubled, we will need “4F” instead of “2F” to keep per-token latency the same. However, suppose we do not increase activated parameters per token, upcycled Step-3 will have the same over-sparse problem as DSv3 and face network bandwidth limit. Calculation shows the 400Gbps × 8 network can only sustain a micro batch of 3,072 (8-bit dispatch, 16-bit combine) for each FFN instance. Thus, the final solution is “3A4F” running three micro batches of 3,072. Each A and F has the same or less load than the original Step-3, so the 50ms TPOT SLA still holds. In this case, the TGS is 3,291. It shows the impact of over-sparsity (§5.4),



**消融: 把 Step-3 扩到 >600B.** 读者或许会问优势有多少来自总参少于 DSv3. 考虑把 Step-3 的 MoE FFN upcycle [6,11] 到约 600B 参量区, 尺寸接近 DSv3. FFN 翻倍则需用 「4F」 而非 「2F」 以保持每 token 延迟. 但若每 token 激活参不增加, upcycled Step-3 会与 DSv3 同患过稀并撞网络带宽上限. 计算显示 $400\mathrm{Gbps}\times 8$ 网络每 FFN 实例只能撑微批 3072 (8-bit dispatch, 16-bit combine). 最终方案为 「3A4F」, 跑三个微批各 3072. 每个 A 与 F 负载不超过原 Step-3, 故 50ms TPOT SLA 仍成立. 此时 TGS 为 3,291. 这显示过稀 (§5.4) 的影响,

> **停一下:** Table 8 峰值 4039 TGS 用 32 卡 「2A2F」; 正文外推 8K 用 「4A2F」 得约 2693, 又写表里 8K 实测峰值 2643. 2693 与 2643 该怎么读?
> 外推值 2693 是按 $4039\times 4/6$ 的外推公式; Table 8 行 「8192 / 48(4A2F) / 2643」 是实测峰值. 二者接近但非同一数: 外推忽略实现抖动与非理想重叠, 以表内 2643 为 8K 实测口径.

<!-- page 15 of 18 -->

compared with the original Step-3’s 4,039. Nevertheless, it is still much higher than DSv3’s 2,324 with DeepEP. If we further align with the official DSv3 on running attention with BF16, based on profiling we estimate such upcycled Step-3 will run at around 2,880 TGS – it shows the advantage of AFD over pure EP.



相对原 Step-3 的 4,039. 尽管如此仍远高于 DSv3+DeepEP 的 2,324. 若再对齐官方 DSv3 用 BF16 attention, 按剖析估计 upcycled Step-3 约 2,880 TGS—显示 AFD 相对纯 EP 的优势.

## 8 Conclusion and Future Work

This paper presents Step-3, and how its model-system co-design achieves state-of-the-art level of decoding efficiency among LLMs of similar sizes. Meanwhile, we also explain how we leverage AFD for analysis and realize Step-3’s potentials. The immediate next step for us is to enable MTP and evaluate its performance gain for decoding. In the future, we will work on exploring new attention variants that continue to push the Pareto frontier of model volume and system costs. We also analyzed that today’s interconnect limits the sparsity of MoE FFN if the goal is efficient decoding. To mitigate this problem, we are working with hardware vendors on novel high bandwidth domain designs [19]. With appropriate interconnect, we will pursue more sparsity for FFN.

本文介绍了 Step-3, 以及它的模型-系统协同设计如何在同等规模 LLM 中达到最先进的解码效率. 同时, 我们也解释了如何借助 AFD 进行分析, 把 Step-3 的潜力兑现出来. 接下来的当务之急是启用 MTP 并评估它带来的解码收益. 未来, 我们将探索新的注意力变体, 继续推进模型体量与系统成本之间的 Pareto 前沿. 我们还分析指出: 若以高效解码为目标, 当今的互连带宽限制了 MoE FFN 的稀疏度. 为缓解这一问题, 我们正在与硬件厂商合作设计新型高带宽域 [19]. 有了合适的互连, 我们会进一步追求 FFN 的稀疏化.

## References

[1] DeepSeek AI. Deepseek-v3 inference system. https://github.com/deepseek-ai/open-infra-index/blob/main/202502OpenSourceWeek/, 2025.

[2] Li-Wen Chang, Wenlei Bao, Qi Hou, Chengquan Jiang, Ningxin Zheng, Yinmin Zhong, Xuanrun Zhang, Zuquan Song, Chengji Yao, Ziheng Jiang, Haibin Lin, Xin Jin, and Xin Liu. Flux: Fast software-based communication overlap on gpus through kernel fusion, 2024.

[3] DeepSeek. Profiling data in deepseek infra. [https://github.com/deepseek-ai/profile-data/](https://github.com/deepseek-ai/profile-data/), 2025.

[4] DeepSeek-AI. Deepseek-v3 technical report, 2025.

[5] Nelson Elhage, Neel Nanda, Catherine Olsson, Tom Henighan, Nicholas Joseph, Ben Mann, Amanda Askell, Yuntao Bai, Anna Chen, Tom Conerly, Nova DasSarma, Dawn Drain, Deep Ganguli, Zac Hatfield-Dodds, Danny Hernandez, Andy Jones, Jackson Kernion, Liane Lovitt, Kamal Ndousse, Dario Amodei, Tom Brown, Jack Clark, Jared Kaplan, Sam McCandlish, and Chris Olah. A mathematical framework for transformer circuits. Transformer Circuits Thread, 2021. https://transformer-circuits.pub/2021/framework/index.html.

[6] Ethan He, Abhinav Khattar, Ryan Prenger, Vijay Korthikanti, Zijie Yan, Tong Liu, Shiqing Fan, Ashwath Aithal, Mohammad Shoeybi, and Bryan Catanzaro. Upcycling large language models into mixture of experts. arXiv preprint arXiv:2410.07524, 2025.

[7] Jingcheng Hu, Houyi Li, Yinmin Zhang, Zili Wang, Shuigeng Zhou, Xiangyu Zhang, Heung-Yeung Shum,

and Daxin Jiang. Multi-matrix factorization attention, 2025.

[8] Alibaba Inc. Qwen3: Think deeper, act faster, 2025.

[9] Nvidia Inc. Improving network performance of hpc systems using nvidia magnum io nvshmem and gpudirect async, 2025.

[10] Yimin Jiang, Yibo Zhu, Chang Lan, Bairen Yi, Yong Cui, and Chuanxiong Guo. A unified architecture for accelerating distributed {DNN} training in heterogeneous {GPU/CPU} clusters. In 14th USENIX Symposium on Operating Systems Design and Implementation (OSDI 20), pages 463–479, 2020.

[11] Aran Komatsuzaki, Joan Puigcerver, James Lee-Thorp, Carlos Riquelme Ruiz, Basil Mustafa, Joshua Ainslie, Yi Tay, Mostafa Dehghani, and Neil Houlsby. Sparse upcycling: Training mixture-of-experts from dense checkpoints. In ICLR, 2023.

[12] Woosuk Kwon, Zhuohan Li, Siyuan Zhuang, Ying Sheng, Lianmin Zheng, Cody Hao Yu, Joseph E. Gonzalez, Hao Zhang, and Ion Stoica. Efficient memory management for large language model serving with pagedattention, 2023.

[13] Jiamin Li, Yimin Jiang, Yibo Zhu, Cong Wang, and Hong Xu. Accelerating distributed MoE training and inference with lina. In 2023 USENIX Annual Technical Conference (USENIX ATC 23), pages 945–959, 2023.

[14] Juncai Liu, Jessie Hui Wang, and Yimin Jiang. Janus: A unified distributed training framework for sparse mixture-of-experts models. In Proceedings of the ACM SIGCOMM 2023 Conference, pages 486–498, 2023.

[15] Meta. Llama 4. [https://www.llama.com/models/llama-4/](https://www.llama.com/models/llama-4/), 2025.

[16] MiniMax. Minimax-m1: Scaling test-time compute efficiently with lightning attention, 2025.

[17] Moonshoot-AI. Kimi k2: Open agentic intelligence. [https://moonshotai.github.io/Kimi-K2/](https://moonshotai.github.io/Kimi-K2/), 2025.

[18] Pratyush Patel, Esha Choukse, Chaojie Zhang, Íñigo Goiri, Aashaka Shah, Saeed Maleki, and Ricardo Bianchini. Splitwise: Efficient generative llm inference using phase splitting, 2023.

[19] Chenchen Shou, Guyue Liu, Hao Nie, Huaiyu Meng, Yu Zhou, Yimin Jiang, Wenqing Lv, Yelong Xu, Yuanwei Lu, Zhang Chen, et al. Infinitehbd: Building datacenter-scale high-bandwidth domain for llm with optical circuit switching transceivers. arXiv preprint arXiv:2502.03885, 2025.

<!-- page 16 of 18 -->

[20] StepFun. Step 2. [https://platform.stepfun.com/docs/llm/text](https://platform.stepfun.com/docs/llm/text), 2025.

[21] Yehui Tang, Xiaosong Li, Fangcheng Liu, Wei Guo, Hang Zhou, Yaoyuan Wang, Kai Han, Xianzhi Yu, Jinpeng Li, Hui Zang, Fei Mi, Xiaojun Meng, Zhicheng Liu, Hanting Chen, Binfan Zheng, Can Chen, Youliang Yan, Ruiming Tang, Peifeng Qin, Xinghao Chen, Dacheng Tao, and Yunhe Wang. Pangu pro moe: Mixture of grouped experts for efficient sparsity, 2025.

[22] ERNIE Team. Ernie 4.5 technical report, 2025.

[23] The SGLang Team. Deploying deepseek with pd disaggregation and large-scale expert parallelism on 96 h100 gpus. [https://lmsys.org/blog/2025-05-05-large-scale-ep/](https://lmsys.org/blog/2025-05-05-large-scale-ep/), 2025.

[24] Ashish Vaswani, Noam Shazeer, Niki Parmar, Jakob Uszkoreit, Llion Jones, Aidan N Gomez, Łukasz Kaiser, and Illia Polosukhin. Attention is all you need. Neural Information Processing Systems, 2017.

[25] An Yang, Anfeng Li, Baosong Yang, Beichen Zhang, Binyuan Hui, Bo Zheng, Bowen Yu, Chang Gao, Chengen Huang, Chenxu Lv, Chujie Zheng, Dayiheng Liu, Fan Zhou, Fei Huang, Feng Hu, Hao Ge, Haoran Wei, Huan Lin, Jialong Tang, Jian Yang, Jianhong Tu, Jianwei Zhang, Jianxin Yang, Jiaxi Yang, Jing Zhou, Jingren Zhou, Junyang Lin, Kai Dang, Keqin Bao, Kexin Yang, Le Yu, Lianghao Deng, Mei Li, Mingfeng Xue, Mingze Li, Pei Zhang, Peng Wang, Qin Zhu, Rui Men, Ruize Gao, Shixuan Liu, Shuang Luo, Tianhao Li, Tianyi Tang, Wenbiao Yin, Xingzhang Ren, Xinyu Wang, Xinyu Zhang, Xuancheng Ren, Yang Fan, Yang Su, Yichang Zhang, Yinger Zhang, Yu Wan, Yuqiong Liu, Zekun Wang, Zeyu Cui, Zhenru Zhang, Zhipeng Zhou, and Zihan Qiu. Qwen3 technical report, 2025.

[26] Songlin Yang, Bailin Wang, Yikang Shen, Rameswar Panda, and Yoon Kim. Gated linear attention transformers with hardware-efficient training, 2024.

[27] Jingyang Yuan, Huazuo Gao, Damai Dai, Junyu Luo, Liang Zhao, Zhengyan Zhang, Zhenda Xie, Y. X. Wei, Lean Wang, Zhiping Xiao, Yuqing Wang, Chong Ruan, Ming Zhang, Wenfeng Liang, and Wangding Zeng. Native sparse attention: Hardware-aligned and natively trainable sparse attention, 2025.

[28] Zili Zhang, Yinmin Zhong, Ranchen Ming, Hanpeng Hu, Jianjian Sun, Zheng Ge, Yibo Zhu, and Xin Jin. Disttrain: Addressing model and data heterogeneity with disaggregated training for multimodal large language models, 2024.

[29] Chenggang Zhao, Chengqi Deng, Chong Ruan, Damai Dai, Huazuo Gao, Jiashi Li, Liyue Zhang, Panpan Huang, Shangyan Zhou, Shirong Ma, Wenfeng Liang, Ying He, Yuqing Wang, Yuxuan Liu, and Y.X. Wei. Insights into deepseek-v3: Scaling challenges and reflections on hardware for ai architectures. In Proceedings of the 52nd Annual International Symposium on Computer Architecture, ISCA ’25, page 1731–1745, 2025.

[30] Chenggang Zhao, Shangyan Zhou, Liyue Zhang, Chengqi Deng, Zhean Xu, Yuxuan Liu, Kuai Yu, Jiashi Li, and Liang Zhao. Deepep: an efficient expertparallel communication library. [https://github.com/deepseek-ai/DeepEP](https://github.com/deepseek-ai/DeepEP), 2025.

[31] Yinmin Zhong, Shengyu Liu, Junda Chen, Jianbo Hu, Yibo Zhu, Xuanzhe Liu, Xin Jin, and Hao Zhang. {DistServe}: Disaggregating prefill and decoding for goodput-optimized large language model serving. In 18th USENIX Symposium on Operating Systems Design and Implementation (OSDI 24), pages 193–210, 2024.

[32] Ruidong Zhu, Ziheng Jiang, Chao Jin, Peng Wu, Cesar A. Stuardo, Dongyang Wang, Xinlei Zhang, Huaping Zhou, Haoran Wei, Yang Cheng, Jianzhe Xiao, Xinyi Zhang, Lingjun Liu, Haibin Lin, Li-Wen Chang, Jianxi Ye, Xiao Yu, Xuanzhe Liu, Xin Jin, and Xin Liu. Megascale-infer: Serving mixture-of-experts at scale with disaggregated expert parallelism, 2025.

[33] Pengfei Zuo, Huimin Lin, Junbo Deng, Nan Zou, Xingkun Yang, Yingyu Diao, Weifeng Gao, Ke Xu, Zhangyu Chen, Shirui Lu, Zhao Qiu, Peiyang Li, Xianyu Chang, Zhengzhong Yu, Fangzheng Miao, Jia Zheng, Ying Li, Yuan Feng, Bei Wang, Zaijian Zong, Mosong Zhou, Wenli Zhou, Houjiang Chen, Xingyu Liao, Yipeng Li, Wenxiao Zhang, Ping Zhu, Yinggang Wang, Chuanjie Xiao, Depeng Liang, Dong Cao, Juncheng Liu, Yongqiang Yang, Xiaolong Bai, Yi Li, Huaguo Xie, Huatao Wu, Zhibin Yu, Lv Chen, Hu Liu, Yujun Ding, Haipei Zhu, Jing Xia, Yi Xiong, Zhou Yu, and Heng Liao. Serving large language models on huawei cloudmatrix384, 2025.

<!-- page 17 of 18 -->

All author lists are in alphabetical order.

## Core System Contributors

| Bin Wang | Hao Nie | Xiaoniu Song | Yibo Zhu |
| --- | --- | --- | --- |
| Bojun Wang | Mingliang Li | Xing Chen | Yimin Jiang |
| Changyi Wan | Nuo Chen | Xingping Yang | Yu Zhou |
| Guanzhe Huang | Siyu Chen | Xuelin Zhang | Yuanwei Lu |
| Hanpeng Hu | Song Yuan | Yanbo Yu |  |
| Haonan Jia | Wuxun Xie | Yaoyu Wang |  |

## Core Model Architecture Contributors

| Houyi Li | Jingcheng Hu | Ka Man Lo |
| --- | --- | --- |

## Contributors (Pretrain, Post-train, Multi-modal, System, Data)

| Ailin Huang | Hongyuan Wang | Longlong Gu | Wang You |
| --- | --- | --- | --- |
| Binxing Jiao | Huiyong Guo | Mei Chen | Wei Ji |
| Bo Li | Jia Wang | Mengqiang Ren | Wen Sun |
| Boyu Chen | Jiahao Gong | Ming Li | Wenjin Deng |
| Changxin Miao | Jialing Xie | Mingzhe Chen | Wenqing He |
| Chao Lou | Jian Zhou | Na Wang | Wenzhen Zheng |
| Chen Hu | Jianjian Sun | Nan Wu | Xi Chen |
| Chen Xu | Jiaoren Wu | Qi Han | Xiangwen Kong |
| Chenfeng Yu | Jiaran Zhang | Qian Zhao | Xianzhen Luo |
| Chengyuan Yao | Jiayu Liu | Qiang Zhang | Xiaobo Yang |
| Daokuan Lv | Jie Cheng | Qianni Liu | Xiaojia Liu |
| Dapeng Shi | Jie Luo | Qiaohui Chen | Xiaoxiao Ren |
| Deshan Sun | Jie Yan | Qiling Wu | Xin Han |
| Ding Huang | Jie Yang | Qinglin He | Xin Li |
| Dingyuan Hu | Jieyi Hou | Qinyuan Tan | Xin Wu |
| Dongqing Pang | Jinguang Zhang | Qiufeng Wang | Xu Zhao |
| Enle Liu | Jinlan Cao | Qiuyan Liang | Yanan Wei |
| Fajie Zhang | Jisheng Yin | Qiuping Wu | Yang Li |
| Fanqi Wan | Junfeng Liu | Quan Sun | Yangguang Li |
| Gulin Yan | Junhao Huang | Rui Li | Yangshijie Xu |
| Han Zhang | Junzhe Lin | Ruihang Miao | Yanming Xu |
| Han Zhou | Kaijun Tan | Ruosi Wan | Yaqiang Shi |
| Hanghao Wu | Kaixiang Li | Ruyan Guo | Yeqing Shen |
| Hangyu Guo | Kang An | Shangwu Zhong | Yi Yang |
| Hanqi Chen | Kangheng Lin | Shaoliang Pang | Yifei Yang |
| Hanshan Zhang | Kenkun Liu | Shengjie Fan | Yifeng Gong |
| Hao Wu | Lei Yang | Shijie Shang | Yihan Chen |
| Haocheng Zhang | Liang Zhao | Shilei Jiang | Yijing Yang |
| Haolong Yan | Liangyu Chen | Shiliang Yang | Yinmin Zhang |
| Haoran Lv | Lieyu Shi | Shiming Hao | Yizhuang Zhou |
| Haoran Wei | Liguo Tan | Shuli Gao | Yuanhao Ding |
| Hebin Zhou | Lin Lin | Siming Huang | Yuantao Fan |
| Heng Wang | Lin Zhang | Siqi Liu | Yuanzhen Yang |
| Heng Wang | Lina Chen | Tiancheng Cao | Yuchu Luo |
| Hongxin Li | Liwen Huang | Tianhao Cheng | Yue Peng |
| Hongyu Zhou | Liying Shi | Tianhao Peng | Yufan Lu |

<!-- page 18 of 18 -->

Yuhang Deng Yuhe Yin Yujie Liu Yukun Chen Yuling Zhao Yun Mou Yunlong Li

**Sponsors**

Binxing Jiao Daxin Jiang

Yunzhou Ju Yusheng Li Yuxiang Yang Yuxiang Zhang Yuyang Chen Zejia Weng Zhe Xie

Zheng Ge Zheng Gong Zhenyi Lu Zhewei Huang Zhichao Chang Zhiguo Huang Zhirui Wang

Heung-Yeung Shum Xiangyu Zhang

Yibo Zhu

Zidong Yang Zili Wang Ziqi Wang Zixin Zhang

> **再看:** 页 14–15 把 Step-3 FFN upcycle 到约 600B 后 TGS 从 4039 落到 3291, BF16 attention 对齐后再估 2880, 仍高于 DSv3 的 2324. 这组消融证明的是 「总参变大就一定会输」, 还是 「过稀 + 纯 EP 才是吞吐杀手」?
> 原文结论指向后者: 「It shows the impact of over-sparsity (§5.4)」; 随后 「it shows the advantage of AFD over pure EP」. 总参对齐后 Step-3 仍更高, 说明优势不单靠更少总参; 过稀迫使微批缩小与 「3A4F」 扩卡, 才是相对原 4039 掉点的主因.

> **对一下:** Figure 1 脚注 1 写给 DSv3 / Kimi K2 / Llama 4 Maverick 「a favor by ignoring」 过稀问题. Table 6 / Figure 2 的理论美元成本, 是已经计入过稀惩罚, 还是仍偏袒对照模型?
> 仍偏袒对照. 页 2 脚注 1 与页 10 末段写明: §4 理论分析假设网络全可重叠且 FFN 高 MFU; 过稀带来的额外实际成本被忽略. 因此 Figure 1 / Table 6 上 Step-3 的优势是下界叙事—实部上对照模型可能更差.
