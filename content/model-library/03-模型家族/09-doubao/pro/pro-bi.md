---
title: "Doubao-1.5-pro · 对照译稿"
category: "模型库"
tags: ["Doubao", "对照译稿"]
published: true
excerpt: "Doubao-1.5-pro 公开材料的逐段中英对照译稿，附读报告时的疑问块。"
---
<!-- page 1 of 12 -->

ByteDance Seed

EN 川

2025.01.22

# Doubao-1.5-pro

The model uses an MoE architecture, and through a design that treats training and inference as one system, it looks for the best possible balance between model quality and serving performance. With only a relatively small number of activated parameters, Doubao-1.5-pro beats top-tier, very large dense pretrained models and scores well on many evaluation benchmarks.

模型使用 MoE 架构，并通过训练-推理一体化设计，探索模型性能和推理性能之间的极致平衡。Doubao-1.5-pro 仅用较小激活参数，即可超过一流超大稠密预训练模型的性能，并在多个评测基准上取得优异成绩。

![Image block](images/p01-image.png)

## Performance evaluation

## 性能评估

In this update, the Doubao-1.5-pro base model improves across the board and performs well on multiple public benchmarks.

本次更新，Doubao-1.5-pro 基础模型能力全面提升，在多个公开评测基准上表现优异。

<!-- page 2 of 12 -->

<table><tr><td colspan="2"></td><td>Doubao-1.5-pro</td><td>Llama3.1-405B</td><td>GPT4o-0806</td><td>Gemini-exp-1205</td><td>Claude-3.5-Sonnet-latest</td><td>Qwen2.5</td><td>DeepseekV3</td></tr><tr><td rowspan="3">Knowledge</td><td>MMLU</td><td>88.6</td><td>88.6</td><td>88.7</td><td>86.8</td><td>88.5</td><td>85.6</td><td>88.5</td></tr><tr><td>MMLU_PRO</td><td>80.1</td><td>73.3</td><td>74.9</td><td>76.4</td><td>78.0</td><td>71.1</td><td>75.9</td></tr><tr><td>GPQA</td><td>65.0</td><td>51.1</td><td>53.1</td><td>62.1</td><td>65.0</td><td>49.0</td><td>59.1</td></tr><tr><td rowspan="2">MATH</td><td>Math</td><td>88.6</td><td>73.8</td><td>75.9</td><td>89.7</td><td>78.3</td><td>83.1</td><td>87.8</td></tr><tr><td>OlympiadBench</td><td>59.8</td><td>34.1</td><td>40.7</td><td>64.7</td><td>43.5</td><td>50.0</td><td>59.1</td></tr><tr><td rowspan="3">Code</td><td>MBPP+</td><td>78.0</td><td>72.8</td><td>78.3</td><td>78.6</td><td>76.5</td><td>76.9</td><td>79.3</td></tr><tr><td>McEval</td><td>70.2</td><td>58.7</td><td>68.2</td><td>67.0</td><td>68.2</td><td>61.7</td><td>69.4</td></tr><tr><td>FullStackBench</td><td>65.1</td><td>53.6</td><td>61.8</td><td>62.6</td><td>60.3</td><td>56.9</td><td>63.3</td></tr><tr><td rowspan="2">Reasoning</td><td>BBH</td><td>91.6</td><td>89.2</td><td>91.7</td><td>92.6</td><td>92.6</td><td>88.3</td><td>92.3</td></tr><tr><td>DROP</td><td>93.0</td><td>91.2</td><td>79.8</td><td>89.7</td><td>88.3</td><td>87.4</td><td>91.6</td></tr><tr><td rowspan="2">Instruction Following</td><td>IFEVal</td><td>89.5</td><td>86.0</td><td>85.7</td><td>89.8</td><td>89.3</td><td>84.1</td><td>86.1</td></tr><tr><td>SysBench</td><td>67.6</td><td>58.9</td><td>62.2</td><td>69.0</td><td>69.0</td><td>47.2</td><td>66.3</td></tr><tr><td rowspan="2">Chinese</td><td>CMMLU</td><td>90.9</td><td>75.4</td><td>77.3</td><td>84.3</td><td>81.2</td><td>84.3</td><td>83.5</td></tr><tr><td>C-Eval</td><td>91.8</td><td>72.7</td><td>76.0</td><td>83.9</td><td>80.0</td><td>84.1</td><td>86.5</td></tr></table>

Evaluation results of Doubao-1.5-pro on multiple benchmarks.

Doubao-1.5-pro 在多个基准上的测评结果

In the table, the scores of the other models come from their official evaluation results; items not covered by the official results come from our internal evaluation platform.

表格中，其它模型的评测指标来自官方评测结果，官方评测结果中不含的部分来自内部评测平台结果

On public language-model benchmarks, GPT4o-0806 is clearly ahead of the other GPT4o versions; see: https://github.com/openai/simple-evals

GPT4o-0806 在语言模型公开评测指标中显著优于 GPT4o 其它版本，详见：https://github.com/openai/simple-evals

> **想：** MMLU 行 Doubao-1.5-pro 是 88.6，这一行它和谁打平，又输给了谁？
> 和 Llama3.1-405B 同为 88.6，比 GPT4o-0806 的 88.7 低 0.1，只比 Claude-3.5-Sonnet-latest 与 DeepseekV3 的 88.5 高 0.1；再往下看 GPQA 行，65.0 也只是和 Claude-3.5-Sonnet-latest 的 65.0 打平。这两行都算不上领先，0.1 的差距在上表里分不出高下。

> **问：** MATH 组两行的第一名是谁，Doubao 差多少？
> 两行都是 Gemini-exp-1205 第一：Math 89.7 对 88.6，差 1.1；OlympiadBench 64.7 对 59.8，差 4.9，这是全表最大的一处落后。OlympiadBench 上 Doubao 对 DeepseekV3 的 59.1 也只多 0.7。

> **核对：** Code 组三行和 Reasoning 组的 BBH，Doubao 都赢了吗？
> 没有。MBPP+ 行 Doubao 78.0，排在 DeepseekV3 79.3，Gemini-exp-1205 78.6，GPT4o-0806 78.3 之后，7 列里第 4；真正赢的是 McEval（70.2 对 DeepseekV3 的 69.4）和 FullStackBench（65.1 对 63.3）。BBH 行 91.6 低于 Gemini 与 Claude 的 92.6，DeepseekV3 的 92.3，GPT4o 的 91.7，只压过 Llama3.1-405B 和 Qwen2.5。

> **看表：** Instruction Following 两行怎么样，全表 14 行里 Doubao 严格第一的到底有几行？
> IFEVal 89.5 比 Gemini-exp-1205 的 89.8 低 0.3；SysBench 67.6 比 Gemini 与 Claude 并列的 69.0 低 1.4。逐行数下来，严格第一的是 MMLU_PRO，McEval，FullStackBench，DROP，CMMLU，C-Eval 共 6 行，GPQA 并列 1 行，其余 7 行不是第一；领先幅度最大的两行是中文组的 CMMLU（比第二名高 6.6）和 C-Eval（比 DeepseekV3 高 5.3）。

> **拆开：** 表下注说其它模型的数来自官方，官方没有的部分来自内部评测平台。表里哪些格子是内部跑的？
> 表里没有星号或颜色标记，读者分不出来。官方数各家用各自的 prompt 与 shot 数，内部数走字节的平台，两种来源排在同一行比；MMLU 差 0.1，BBH 差 0.1，IFEVal 差 0.3，MBPP+ 差 0.3 这类格子，换一种评测设置就可能翻转，在这张表里只能当持平读。

> **确认：** 这张表比的是基础模型，还是对话模型？
> 页 1 正文说「基础模型能力全面提升」，可表头的 GPT4o-0806，Claude-3.5-Sonnet-latest，Gemini-exp-1205 对外只有对话版；Qwen2.5 没写尺寸，DeepseekV3 没写 Base 还是 Chat，Doubao-1.5-pro 那一列也没写是哪个阶段的模型。表头给的信息不够，无法确认两边是同一类模型。

## Balancing model quality and inference performance

## 模型性能与推理性能的极致平衡

From the pretraining stage onward, the model follows a design that treats training and inference as one, so as to balance the strongest model quality against the lowest inference cost.

模型从预训练阶段就坚持训练-推理一体设计，以在最强的模型性能和最优的推理成本之间取得平衡。

### An efficient MoE model structure

### 高效 MoE 模型结构

For training and inference efficiency, Doubao-1.5-pro uses a sparse MoE architecture. In pretraining, an MoE model with only a small number of activated parameters already beats very large dense pretrained models such as Llama3.1-405B. By studying the sparsity Scaling Law, the team settled on a sparsity ratio that balances quality and efficiency, and used the MoE Scaling Law to establish that a model with a small activated parameter count can reach world-class performance.

从训练和推理效率的角度出发，Doubao-1.5-pro 使用稀疏 MoE 架构。在预训练阶段，仅用较小参数激活的 MoE 模型，性能即可超过Llama3.1-405B 等超大稠密预训练模型。团队通过对稀疏度 Scaling Law 的研究，确定了性能和效率比较平衡的稀疏比例，并根据 MoE Scaling Law 确定了小参数量激活的模型即可达到世界一流模型的性能。

> **回看：** 这段说「确定了性能和效率比较平衡的稀疏比例」，这个比例能从这一页核对出来吗？
> 不能。这段和页 3 的 loss 图，页 4 的 Performance 对比图都没有印出专家数，每 token 激活的专家数，总参数量或激活参数量，只给了页 3 的「激活参数仅为稠密模型参数量 1/7」这一个相对值，而那个稠密模型本身多大也没印。稀疏比例是多少，1/7 背后是哪两个绝对数，读者都无从复算。

<!-- page 3 of 12 -->

![Chart block](images/p03-loss.png)

Training loss curves.

训练 loss 图

> **停一下：** 这张训练 loss 图，能不能单独支撑「MoE 超过稠密模型」？
> 不够。图的横轴 Tokens(T) 只画到约 8T，正文说的是 9T tokens；前约 1.4T，Doubao-MoE 曲线高于 Doubao-Dense，之后低一些，到 7T 以后两条线基本重合，末端都落在约 1.60。从 loss 读只是追平，「略优于」的依据要到页 4 的 Performance 对比图去找。

The quality of an MoE model is usually expressed as a ratio: the total parameter count of a dense model that performs the same, divided by the MoE model's activated parameter count. In IBM's Granite series, for instance, an MoE model with 800M activated parameters comes close to a dense model with 2B total parameters, a ratio of about 2.5x (2000M/800M). Until now the industry norm for this leverage has been under 3x. Through changes to the model structure and the training algorithm, and under a controlled comparison on exactly the same partial training data (9T tokens), the team used an MoE model whose activated parameters are only 1/7 of the dense model's parameters to beat that dense model, raising the leverage to 7x.

MoE 模型的性能通常可以用表现相同的稠密模型的总参数量和 MoE 模型的激活参数量的比值来确定，比如 IBM 的 Granite 系列模型中，800M 激活的 MoE 模型性能可以接近 2B 总参数的稠密模型，性能比值大约在 2.5 倍（2000M/800M）。此前，业界在这一性能杠杆上的普遍水平为不到 3 倍。团队通过模型结构和训练算法优化，在完全相同的部分训练数据（9T tokens）对比验证下，用激活参数仅为稠密模型参数量 1/7 的 MoE 模型，超过了稠密模型的性能，将性能杠杆提升至 7 倍。

<!-- page 4 of 12 -->

Model Performance Relative to Doubao-Dense

![Chart block](images/p04-performance.png)

Performance comparison chart.

Performance 对比图

Doubao-Dense and Doubao-MoE are both intermediate checkpoints trained on 9T tokens, with an identical data distribution; the MoE model performs slightly better than a dense model whose total parameter count is 7 times the MoE's activated parameter count.

Doubao-Dense 和 Doubao-MoE 均为 9T tokens 的数据的阶段性结果，数据分布完全相同；MoE 模型的性能略优于整体参数量为 MoE 激活参数量 7 倍的稠密模。

> **再看：** 「MoE 模型的性能略优于稠密模型」，Performance 对比图里每个任务都优于吗？
> 不是。以 Doubao-Dense 为 100，Doubao-MoE 在 MATH 是 96.4，MMLU 是 99.2，都低于稠密模型；MBPP 正好 100.0 打平；明显领先的只有 GPQA 110.4 和 MMLU_PRO 107.5. 7 项简单平均约 102.0，去掉 GPQA 与 MMLU_PRO 后剩余 5 项平均约 99.2，「略优于」主要靠这两项撑起来。

Llama3.1-405B is the final result after 15T tokens, and its data distribution differs from the Doubao models; the Doubao dense model is also far smaller than Llama3.1-405B. The results suggest that Doubao's pretraining data quality and training hyperparameters are better. After full training, the MoE model improves considerably over the 9T-token intermediate version.

Llama3.1-405B 为 15T tokens 的最终结果，数据分布和 Doubao 模型不同，Doubao 稠密模型的参数量也远小于 Llama3.1-405B，从结果上可以看到Doubao 预训练的数据质量和训练超参更优；MoE 模型完整训练后的性能比 9T tokens 数据的中间版本有更大提升。

> **对一下：** 对比图里的 Llama3.1-405B 柱子，能证明 Doubao 预训练数据更好吗？
> 证明不了。图里 Llama3.1-405B 是 15T tokens 的最终结果，Doubao 两根柱是 9T tokens 的中间结果，参数量，token 数，数据分布三样同时不同；GPQA 那根 Llama 柱是斜线填充，没有数值；MMLU 上 Llama 的 99.3 比 Doubao-MoE 的 99.2 还高 0.1，MMLU_PRO 上 Llama 的 106.9 高过 Doubao-Dense 的 100。这张图只说明了各任务上的相对位置，分不出是哪个因素起了作用。

On top of the pretrained model, the algorithm team also designed a family of algorithms that adjust model parameters dynamically. Depending on what a given application needs, the model can be grown or shrunk along several dimensions, including depth, width, the number of MoE experts, the number of activated experts, and hidden-token reasoning, to reach the best trade-off between capability and inference cost. A smaller pretrained model also speeds up the team's iteration and lets it serve several product lines in parallel.

在预训练模型基础上，算法团队还设计了一系列模型参数动态调整算法。可以基于具体应用对模型性能的需求，从模型深度，宽度，MoE 专家数，激活专家数，隐藏 token 推理等不同维度，对模型参数进行扩增和缩小，达到模型能力和推理成本的最优平衡。同时，较小的预训练模型提高了团队迭代开发的效率，可以并发支持多个产品线。

### A high-performance inference system

### 高性能推理系统

Doubao-1.5-pro is a highly sparse MoE model. Across the four compute quadrants formed by Prefill/Decode and Attention/FFN, it shows markedly different compute and memory-access profiles. For these four quadrants we combine heterogeneous hardware with different low-precision optimizations, greatly raising throughput while keeping latency low, cutting total cost while still optimizing both TTFT and TPOT.

Doubao-1.5-pro 是一个高度稀疏的 MoE 模型，在 Prefill/Decode 与 Attention/FFN 构成的四个计算象限中，表现出显著不同的计算与访存特征。针对四个不同象限，我们采用异构硬件结合不同的低精度优化策略，在确保低延迟的同时大幅提升吞吐量，在降低总成本的同时兼顾 TTFT 和 TPOT 的最优化目标。

<!-- page 5 of 12 -->

![Chart block](images/p05-image.png)

Compute and memory-access profiles of the different stages.

不同阶段的计算和访存特征

In the Prefill stage, communication and memory access are not obvious bottlenecks, but compute easily becomes one. Given the one-directional nature of LLM attention, we run Chunk-PP Prefill Serving on several kinds of devices with a high compute-to-memory ratio, bringing Tensor Core utilization in the online system close to 60%.

Prefill 阶段，通信和访存瓶颈不明显，但容易达到计算瓶颈。考虑到 LLM 单向注意力的特点，我们在多种计算访存比高的设备上做Chunk-PP Prefill Serving，使线上系统 Tensor Core 的利用率接近 60%。

Prefill Attention: we extend the open-source FlashAttention 8-bit implementation with instructions such as MMA/WGMMA, and combine it with a Per N tokens Per Sequence quantization scheme so that this stage runs losslessly on GPUs of different architectures. We also model the Attention time of chunks of different lengths and combine this with dynamic cross-Query Batching, balancing load across cards during Chunk-PP Serving and removing idle time caused by load imbalance;

Prefill Attention：使用 MMA/WGMMA 等指令扩展开源的 FlashAttention 8-bit 实现，结合 Per N tokens Per Sequence 的量化策略，确保该阶段可以在不同架构的 GPU 上无损运行。同时，通过建模不同长度分片的 Attention 耗时，并结合动态跨 Query Batching 的策略，实现 Chunk-PP Serving 时的卡间均衡，有效消除负载不均衡引起的空跑；

Prefill FFN: we use W4A8 quantization, which effectively reduces the memory-access cost of the sparse MoE experts, and with cross-Query Batching we feed the FFN stage more input, raising MFU to 0.8.

Prefill FFN：采用 W4A8 量化，有效降低了稀疏 MoE 专家的访存开销，并通过跨 Query Batching 的策略，给到FFN阶段更多输入，使MFU 提升至 0.8。

> **想：** 页 5 的四象限图把 Prefill FFN 标成「强计算瓶颈」，为什么这里还要用 W4A8 去降访存？上一段的 60% 和这里的 0.8 是不是同一个数？
> 图上 Prefill FFN 是强计算瓶颈，右下的 Decode FFN 才是强访存瓶颈；这段说 W4A8 降的是「稀疏 MoE 专家的访存开销」，再靠跨 Query Batching 给 FFN 更多输入，每个专家分到的 token 够多，才稳在计算瓶颈一侧。60% 是整个 Prefill 线上系统的 Tensor Core 利用率，0.8 是 Prefill FFN 阶段的 MFU，口径和范围都不同，不能互相推。

In the Decode stage, compute is not an obvious bottleneck, but the demands on communication and memory access are high. We serve with devices that have a lower compute-to-memory ratio to get a better ROI, and use very low-cost Sampling together with Speculative Decoding to lower TPOT.

Decode 阶段，计算瓶颈不明显，但对通信和访存能力要求比较高。我们采用计算访存比较低的设备 Serving 来换取更高的 ROI，同时，采用极低成本的 Sampling 采样以及 Speculative Decoding 策略，降低 TPOT 指标。

Decode Attention: deployed with TP; heuristic search and an aggressive long-sequence splitting strategy handle the common case where Query KV lengths within a single batch differ widely. For precision we still use Per N tokens Per Sequence quantization. We also optimized the Attention computation during random sampling so that the KV Cache is read only once.

Decode Attention：采用 TP 方式部署，并通过启发式搜索以及激进的长句拆分策略，优化单 batch 内不同 Query KV 长度差异大的常见场景；精度上，依然采用 Per N tokens Per Sequence 量化方式；此外，还优化了随机采样过程中的 Attention 计算，保证 KV Cache只被访问一次。

Decode FFN: W4A8 quantization is kept, with EP deployment.

Decode FFN：保持 W4A8 量化，采用 EP 方式部署。

Overall, on the PD-disaggregated Serving system, we implemented the following optimizations:

整体来看，在 PD 分离的 Serving 系统上，我们实现了以下优化：

A custom RPC Backend built for Tensor transfer, with zero-copy, multi-stream parallelism and similar techniques to speed up Tensor transfer over TCP/RDMA networks, which in turn speeds up KV Cache transfer under PD disaggregation.

针对 Tensor 传输进行定制化的 RPC Backend，并通过零拷贝，多流并行等手段优化了 TCP/RDMA 网络上的 Tensor 传输效率，进而提升 PD 分离下的 KV Cache 传输效率。

Flexible ratios and dynamic scaling between the Prefill and Decode clusters, with independent HPA autoscaling for each role, so that neither Prefill nor Decode holds idle compute and the ratio between the two follows the real online traffic pattern.

支持 Prefill 跟 Decode 集群的灵活配比和动态扩缩，对每种角色独立做 HPA 弹性扩容，保障 Prefill 和 Decode 都无冗余算力，两边算力配比贴合线上实际流量模式。

In the framework, GPU compute and CPU pre/post-processing run asynchronously: while the GPU is computing step N, the CPU has already launched the Kernel for step N+1, keeping the GPU fully busy, so the framework's own processing adds zero overhead to GPU inference.

在框架上将 GPU 计算和 CPU 前后处理异步化，使得 GPU 推理第 N 步时 CPU 提前发射第 N+1 步 Kernel，保持 GPU 始终被打满，整个框架处理动作对 GPU 推理零开销。

<!-- page 6 of 12 -->

In addition, our in-house server-cluster design flexibly supports low-cost chips, bringing hardware cost far below industry solutions. Custom NICs and an in-house network protocol also markedly improve the efficiency of small-packet communication. At the operator level we achieve efficient Overlap of computation and communication, keeping multi-node distributed inference stable and efficient.

此外，凭借自研服务器集群方案，灵活支持低成本芯片，硬件成本比行业方案大幅度降低。我们还通过定制化网卡和自主研发的网络协议，显著优化了小包通信的效率。在算子层面，我们实现了计算与通信的高效重叠（Overlap），从而保证了多机分布式推理的稳定性和高效性。

## Solid data annotation, no shortcuts

## 扎实数据标注，坚持不走捷径

In the PostTraining stage we carefully built a highly self-reliant data production system. It tightly combines an efficient annotation team with model self-improvement techniques to keep improving data quality precisely, follows internal standards strictly, takes no shortcuts, and uses no data from any other model, so that data sources stay independent and reliable.

在 PostTraining 阶段，我们精心构建了一套高度自主的数据生产体系，该体系通过高效标注团队与模型自提升技术的深度融合，持续且精准地优化数据质量，严格遵循内部标准，坚持不走捷径，不使用任何其他模型的数据，确保数据来源的独立性和可靠性。

For SFT, we developed an algorithm-driven system for optimizing training data. It covers diversity optimization of training data and precise matching between annotators and questions, and together with model Self-evolve techniques it raises the diversity and difficulty of annotated data, creating a virtuous cycle of model improvement.

SFT 阶段，开发了一套算法驱动的训练数据优化系统，涵盖训练数据多样性优化以及精确人题匹配功能，并结合模型自演进（Self-evolve）技术，提升数据标注的多样性和难度，形成了模型性能提升的良性循环。

For the Reward Model, we built a complete data production pipeline covering prompt distribution optimization, response filtering, multi-round iteration and active learning. By blending synthetic and mined data of equal scale, we avoided data conflicts and pattern hacking. We designed a multi-stage Reward Model training framework that gives the model stable judgment across data distributions. Using gradient-based selection and iterative filtering, we reach nearly full-data training quality with 25% of the data, speeding up iteration. We deeply merged the Verifier with the Reward Model into a unified Reward framework, giving balanced gains across math, coding, knowledge, dialogue and other dimensions. We also proposed a generative RM modeling method, different from the traditional discriminative RM, with clear gains in OOD generalization and in defending against reward hacking.

Reward Model 部分，我们建立了包含 prompt 分布优化，response 筛选，多轮迭代和 active learning 的完整数据生产 pipeline。通过融合同等规模的合成与挖掘数据，有效规避了数据冲突和 pattern hacking 问题；设计了多阶段 Reward Model 训练框架，实现了模型在各类数据分布上的稳定判断能力；基于梯度筛选和迭代过滤技术，用 25% 的数据达到近似全量的训练效果，提高迭代效率；实现了 Verifier 和 Reward Model 的深度融合，构建了统一的 Reward 框架，实现了模型在数学，编程，知识，对话等多维度能力的均衡提升；提出了不同于传统判别式 RM 的生成式 RM 建模方法，在 OOD 泛化性能和 reward hacking 防御上取得显著提升。

For RL, we built on veRL a highly parallel, multi-role framework that unifies training and inference and supports different kinds of data and reward schemes. An adaptive data-distribution adjustment mechanism resolves conflicts in multi-task training. We overcame the difficulties of training the value function and achieved stable token-wise modeling, with convergence 4 times faster and gains of more than 10 absolute points on hard tasks. A contrastive learning method effectively improves the LLM and markedly reduces reward hacking. Scaling has been achieved across data, algorithms and models, turning compute into intelligence effectively.

RL 阶段，基于 veRL 打造了高并行化的多角色训练推理一体框架，兼容不同类型的数据和奖励方式；通过自适应数据分布调节机制，解决了多任务训练中的冲突问题；攻克了价值函数训练难点，实现 token-wise 稳定建模，收敛速度提升 4 倍，在高难度任务上的性能提升超过 10 个绝对点；通过对比学习方法，有效提升了 LLM 的表现并显著缓解了 reward hacking 问题。在数据，算法，模型层面全面实现了 Scaling，完成算力到智力的有效转换。

In addition, drawing on ByteDance's AB Test experience in recommendation, search and advertising, we built an efficient end-to-end PostTraining process driven by user feedback. Based on large-scale feedback from Doubao users, we built a closed-loop system running from problem discovery and data mining to human-machine annotation and fast iteration, using a user-data flywheel to keep improving the real user experience.

此外，依托字节在推荐，搜索和广告领域的 AB Test 经验，研发了基于用户反馈的高效 PostTraining 全流程，基于豆包的大规模用户反馈，我们构建了从问题发现，数据挖掘，人机结合标注到快速迭代的闭环优化系统，通过用户数据飞轮持续提升模型的实际使用体验。

## Across-the-board multimodal gains

## 多模态能力全面提升

Doubao-1.5-pro fuses and improves vision, speech and other multimodal abilities in a single model, giving users a more natural and richer interactive experience.

Doubao-1.5-pro 在同一模型中融合并提升了视觉，语音等多模态能力，可为用户带来更自然，更丰富的交互体验。

### Visual multimodality: stronger performance, ready for more complex scenarios

### 视觉多模态：性能进一步提升，从容应对更复杂场景

On the vision side, compared with the previous version, Doubao-1.5-pro brings comprehensive technical upgrades in multimodal data synthesis, dynamic resolution, multimodal alignment and mixed training. These further strengthen visual reasoning, text and document recognition, fine-grained understanding and instruction following, and make the model's replies more concise and friendly. Building strong visual understanding into the same model lets it understand all kinds of visual signals from both the virtual and the real world, helping people make better decisions.

视觉方面，相比于上一版本，Doubao-1.5-pro 在多模态数据合成，动态分辨率，多模态对齐，混合训练上进行了全面的技术提升，进一步增强了模型在视觉推理，文字文档识别，细粒度信息理解，指令遵循等方面的能力，并让模型的回复模式变得更加精简，友好。在同一模型中融入强大的视觉理解能力，使模型可以同时理解虚拟和现实世界的各类视觉信号，更好地辅助人类决策。

Doubao-1.5-pro's visual reasoning is strong, with excellent results on all kinds of benchmarks:

Doubao-1.5-pro 的视觉推理能力表现优越，在各类评测基准上均取得了优异表现：

<!-- page 7 of 12 -->

<table><tr><td></td><td>Benchmark</td><td>Doubao-1.5-pro</td><td>GPT4o-1120</td><td>Claude3.5-Sonnet</td><td>Gemini-2-flash</td><td>Qwen2-VL-72B</td><td>InternVL-2.5-78B</td></tr><tr><td rowspan="2">College-level Problems</td><td>MMMU(val)</td><td>73.8</td><td>70.7</td><td>70.4</td><td>70.7</td><td>64.5</td><td>70.1</td></tr><tr><td>MMMU-Pro</td><td>59.3</td><td>54.5</td><td>54.7</td><td>57.0</td><td>46.2</td><td>48.6</td></tr><tr><td rowspan="3">Mathematical Reasoning</td><td>MathVision</td><td>48.6</td><td>30.4</td><td>38.3</td><td>41.3</td><td>25.9</td><td>32.2</td></tr><tr><td>OlympiadBench</td><td>48.5</td><td>25.9</td><td>27.8</td><td>43.6</td><td>11.2</td><td>25.1</td></tr><tr><td>MathVista</td><td>78.8</td><td>63.8</td><td>65.4</td><td>73.1</td><td>70.5</td><td>76.6</td></tr><tr><td rowspan="5">Document and Diagrams Reading</td><td>TextVQA(val)</td><td>84.7</td><td>81.4</td><td>76.5</td><td>75.6</td><td>85.5</td><td>83.4</td></tr><tr><td>ChartQA(test avg.)</td><td>88.0</td><td>86.7</td><td>90.8</td><td>85.2</td><td>88.3</td><td>88.3</td></tr><tr><td>InfoVQA(test)</td><td>88.0</td><td>80.7</td><td>74.3</td><td>77.8</td><td>84.5</td><td>84.1</td></tr><tr><td>DocVQA(test)</td><td>96.7</td><td>91.1</td><td>95.2</td><td>92.1</td><td>96.5</td><td>95.1</td></tr><tr><td>Charxiv(RQ/DQ)</td><td>54.4 / 84.3</td><td>52.0 / 86.5</td><td>60.2/ 84.3</td><td>55.2/81.8</td><td>43.0 / 81.3</td><td>42.4 / 82.3</td></tr><tr><td rowspan="4">General Visual Question Answering</td><td>RealWorldQA</td><td>78.9</td><td>75.4</td><td>66.6</td><td>74.5</td><td>77.8</td><td>78.7</td></tr><tr><td>MMStar</td><td>71.9</td><td>63.9</td><td>65.1</td><td>69.4</td><td>68.6</td><td>73.1</td></tr><tr><td>MMBench-en</td><td>87.5</td><td>83.5</td><td>81.7</td><td>83.0</td><td>85.9</td><td>88.3</td></tr><tr><td>MMBench-cn</td><td>86.0</td><td>82.1</td><td>83.4</td><td>82.9</td><td>83.4</td><td>88.5</td></tr><tr><td rowspan="2">Spatial and Counting Understanding</td><td>Blink</td><td>68.4</td><td>68.0</td><td>59.6</td><td>62.6</td><td>61.1</td><td>63.8</td></tr><tr><td>CountBench</td><td>89.6</td><td>85.1</td><td>86.8</td><td>88.2</td><td>88.6</td><td>84.1</td></tr><tr><td rowspan="2">Video Understanding</td><td>Video-MME</td><td>74.1</td><td>73.4</td><td>61.7</td><td>78.2</td><td>71.2</td><td>72.1</td></tr><tr><td>EgoSchema-subest</td><td>75.4</td><td>74.8</td><td>64.4</td><td>71.8</td><td>80.6</td><td>78.2</td></tr></table>

Evaluation results of Doubao-1.5-pro on multiple vision benchmarks.

Doubao-1.5-pro 在多个视觉基准上的测评结果

> **问：** 上一页说视觉「在各类评测基准上均取得了优异表现」，这张 18 行的视觉表里 Doubao 没拿第一的是哪几行？
> 8 行：TextVQA(val) 84.7 输给 Qwen2-VL-72B 的 85.5；ChartQA 88.0 排在 Claude3.5-Sonnet 的 90.8 和两个 88.3 之后，第 4；Charxiv 两项都不是第一；MMStar，MMBench-en，MMBench-cn 三行都输给 InternVL-2.5-78B；Video-MME 74.1 输给 Gemini-2-flash 的 78.2；EgoSchema-subest 75.4 输给 Qwen2-VL-72B 的 80.6 和 InternVL 的 78.2。领先最稳的是 MMMU 两行和 Mathematical Reasoning 三行。

In our evaluation, GPT4o-1120 is stronger than GPT4o-0806 on multimodal ability.

评测中 GPT4o-1120 在多模态能力上优于 GPT4o-0806。

> **核对：** 两张表里的 GPT4o 为什么不是同一个版本？Charxiv 那一格又该怎么读？
> 页 2 文本表用 GPT4o-0806，理由是它在语言公开指标上优于其它版本；这张视觉表换成 GPT4o-1120，理由是它多模态更强。两处都挑对手在该方向最强的版本，比较更严格，但两张表的 GPT4o 不能拼在一起看。Charxiv 一格塞了 RQ/DQ 两个数：RQ 54.4 低于 Claude3.5-Sonnet 的 60.2 和 Gemini-2-flash 的 55.2，DQ 84.3 低于 GPT4o-1120 的 86.5，与 Claude 持平。

#### Efficient native dynamic-resolution training

#### 高效的原生动态分辨率训练

Resolution has long been a key factor in visual understanding, especially in the virtual world, where comprehension depends even more on resolution. To handle complex image inputs in all kinds of scenarios, Doubao-1.5-pro adopts a native dynamic-resolution architecture that accepts images of any resolution. Whether the input is a large high-definition image, a small low-resolution one, or an image with an extreme aspect ratio, the model extracts features accurately and computes efficiently. Thanks to the native-resolution design, the new model improves greatly on document recognition, fine-grained information recognition and similar tasks.

分辨率问题一直是影响视觉理解能力的关键因素，尤其在虚拟世界中，信息理解受分辨率的影响更为明显。为应对各类场景下的复杂图像输入，Doubao-1.5-pro 采用了原生动态分辨率架构设计，支持任意分辨率的图像输入。无论是高清大图还是低分辨率的小图，亦或是极端长宽比例的图像，模型都能实现精准的特征提取和高效的计算性能。借助于原生分辨率的设计，新模型在文档识别，细粒度信息识别等任务上实现了极大的效果提升。

Our in-house Doubao ViT, which supports dynamic resolution, performs very well across visual classification tasks. At just 2.4B parameters it reaches SOTA on the overall score, beating models 7 times its size.

我们自研的支持动态分辨率的 Doubao ViT 在多种视觉分类任务中表现优异，仅凭 2.4B 规模便在综合评分上取得 SOTA 表现，效果超越7 倍于自身规模的模型。

<!-- page 8 of 12 -->

| method | Doubao ViT | OpenCLIP-G/14 | DFN5B-CLIP-H/14+ | InternVL-C | EVA-CLIP-18B |
| --- | --- | --- | --- | --- | --- |
| Image#param. | 24B | 1.8B | 0.6B | 6.0B | 17.5B |
| ImageNet-1K | 84.3 | 80.4 | 84.3 | 83.2 | 83.8 |
| ImageNet-V2 | 78.5 | 73.6 | 78.3 | 77.3 | 77.9 |
| ImageNet-A | 87.8 | 69.3 | 79.6 | 83.8 | 87.3 |
| ImageNet-R | 95.4 | 92.8 | 94.9 | 95.7 | 95.7 |
| ImageNet-S | 74.6 | 69.9 | 73.6 | 74.3 | 74.7 |
| ObjectNet | 82.5 | 73.0 | 78.0 | 80.6 | 82.2 |
| AVG | 83.9 | 76.5 | 81.4 | 82.5 | 83.6 |

Doubao ViT's performance on a range of visual classification tasks.

Doubao ViT 在多种视觉分类任务中的表现

> **看表：** Doubao ViT 的参数量到底是 2.4B 还是 24B? 「超越 7 倍于自身规模的模型」指的是谁？
> 上一页正文写 2.4B，这张表的 Image#param。一行印的是 24B. 按 2.4B 算，EVA-CLIP-18B 的 17.5B 约是它的 7.3 倍，和「7 倍」对得上；按 24B 算，表里就没有比它更大的对手，所以表格那一格是漏了小数点。表内对比也不是全胜：ImageNet-1K 84.3 与 DFN5B-CLIP-H/14+ 打平，ImageNet-R 95.4 低于 InternVL-C 与 EVA-CLIP-18B 的 95.7，ImageNet-S 74.6 低于 EVA 的 74.7，AVG 83.9 只比 EVA 的 83.6 高 0.3。

During dynamic-resolution training, to ease load imbalance in the vision Encoder of the VLM, we designed forward and backward load-balancing algorithms in the training Infra specifically for dynamic resolution. Communication and transfer are used to remove the synchronization waits caused by uneven computation, raising overall training throughput by more than 60%.

在动态分辨率训练过程中，为了缓解 VLM 中视觉 Encoder 部分负载不均衡问题，我们在训练 Infra 上，精心设计了专门针对动态分辨率的前向和反向的负载优化算法，以通信传输消除不均衡计算带来的同步等待，整体训练吞吐提升了 60% 以上。

#### Diverse data-synthesis pipelines

#### 多样化的数据合成管线

Compared with plain-text corpora, which mostly come from the internet, the image-text data a VLM needs is harder to obtain. It takes finer pipelines to clean and process internet data, and sometimes synthetic data has to be built from scratch. For Doubao-1.5-pro, besides training on huge volumes of image-text pairs and interleaved image-text data from the search engine, we also used several synthesis methods, including rendering engines, traditional computer-vision models and model self-iteration, to obtain high-quality multimodal pretraining data.

相比于主要来自互联网的纯文本语料，VLM 所需要的图文数据获取更为复杂，需要更为精细的数据管线来对互联网数据进行清洗和加工，甚至需要从零开始构造合成数据。在 Doubao-1.5-pro 中，除了利用来自搜索引擎的海量图文对和图文交织数据进行训练外，还采用了基于渲染引擎，传统计算机视觉模型，模型自迭代等多种数据合成方式，以获取高质量的多模态预训练数据。

#### Mixed training on text and visual understanding

#### 文本与视觉理解混合训练

To improve both the visual and the language abilities of Doubao-1.5-pro, we mixed a certain proportion of plain-text data into several VLM training stages and balanced vision against language by adjusting the learning rate dynamically, so the model's language ability is not harmed. In PostTraining, the multimodal part also has a fully self-controlled data pipeline: we build a multimodal preference dataset from human annotation and data synthesized by our own model, and train it together with text data. We also put most of our post-training compute and data work into the RL stage, set different preference standards for different kinds of Prompt, and built an RM training set with the influence of length preference removed, balancing accuracy, length and information content so that multimodal replies stay concise while being as accurate and useful as possible.

为同时提升 Doubao-1.5-pro 的视觉能力和语言能力，我们在 VLM 的多个训练阶段，都混入了一定比例的纯文本数据，并通过动态调整学习率的方法平衡视觉与语言能力，确保模型的语言能力无损。在 PostTraining 阶段，多模态部分同样拥有完全自主可控的数据管线，我们利用人工标注与自身模型数据合成的方式，构建多模态偏好数据集，以和文本数据一同训练。同时，我们将绝大部分的后训练算力和数据工作都集中在 RL 阶段，根据不同类型的 Prompt 建立了不同的偏好标准，并构造了去除长度偏好影响的 RM 训练集，以平衡好回复准确性，长度和信息量的关系，使多模态模型的回复在尽可能准确，实用的前提下，保持简洁。

#### Demos

#### 效果演示

![Image block](images/p08-image.png)

"Actually, the reason large models are so smart and quick-witted is that they have mastered an advanced way of learning:"

其实大模型，之所以这么聪明又伶俐，是因为它掌握了一种高端的学习方法：

<!-- page 9 of 12 -->

![Image block](images/p09-image.png)

"So what is deep learning? No rush, let's first look at how humans learn."

啥是深度学习呢？不急，咱先看看人类咋学习的。

Whether it is a large high-definition image or a small low-resolution one

无论是高清大图，低分辨率小图

**Complex instruction following**

**复杂指令遵循能力**

**response**

**response**

**Checkpoint analysis:**

**检查点分析：**

1. Analysis of triggering a page refresh: in the current screenshot, there is no obvious icon or button for refreshing the page, and no common pull-to-refresh gesture area is visible either. Result: `<RESULT>FALSE</RESULT>` Confidence: `<CONFIDENCE>90</CONFIDENCE>`

1. 触发页面刷新分析：在当前截图中，未发现明显的用于触发页面刷新的图标或按钮，如常见的下拉刷新手势区域在截图中也未体现。结果：`<RESULT>FALSE</RESULT>` 置信度：`<CONFIDENCE>90</CONFIDENCE>`

2. Analysis of triggering a share: among the interaction buttons on the right side of the page there is clearly a share-arrow icon, showing a share count of 117,000（11.7万）；tapping this icon should trigger the share action.

2. 触发转发分析：在页面右侧交互按钮中，明确有一个转发箭头图标，且显示了转发数量为11.7万，点击该图标应该可以触发转发操作。

Result: `<RESULT>TRUE</RESULT>` Confidence: `<CONFIDENCE>95</CONFIDENCE>`

结果：`<RESULT>TRUE</RESULT>` 置信度：`<CONFIDENCE>95</CONFIDENCE>`

### Speech multimodality: unified understanding and generation, with both EQ and IQ

### 语音多模态：理解生成一体化，情商智商在线

For speech, we propose a new end-to-end Speech2Speech framework. It fuses the speech and text modalities deeply in a native way and achieves true end-to-end speech understanding and generation in spoken dialogue. Compared with the traditional cascade of ASR+LLM+TTS, the dialogue quality takes a qualitative leap. Doubao-1.5-pro not only understands well (high IQ) but also offers highly expressive and controllable speech, and the model as a whole carries emotion well in both the content and the voice of its replies.

在语音多模态上，我们提出了新的 Speech2Speech 的端到端框架，不仅通过原生方法将语音和文本模态进行深度融合，同时还实现了语音对话中真正意义上的语音理解生成端到端，相比传统的 ASR+LLM+TTS 的级联方式，在对话效果上有质的飞跃。Doubao-1.5-pro不仅拥有高理解力（高智商），还具备语音高表现力与高控制力，以及模型整体在回复内容和语音上的高情绪承接能力。

In the framework design, we fuse speech and text Tokens, which is a prerequisite for Scaling speech multimodal data. In the Pretrain stage we developed diverse ways to produce and use data and explored several effective training approaches, using Scaling to fuse speech and text abilities as deeply as possible. In the PostTraining stage, a balance between high-expressiveness data and IQ data, data filtering, and targeted improvements in the multimodal RL stage bring the model to its best in IQ, vocal expressiveness and other respects.

在框架设计上，我们将语音和文本 Token 进行融合，为语音多模态数据的 Scaling 提供了必要条件。在 Pretrain 阶段，我们开发了多样化的数据生产和使用方式，同时在训练上探索了多种有效方案，通过 Scaling 最大化地将语音和文本能力进行深度融合。在PostTraining 阶段，通过融合高表现力与智商数据的均衡，数据筛选以及多模态 RL 阶段的专项能力提升让模型在智商，语音表现力等多方面达到最优。

<!-- page 10 of 12 -->

![Image block](images/p10-image.png)

## Exploring the frontier of intelligence

## 探索智能的边界

Doubao deep-thinking mode

Doubao 深度思考模式

Reasoning is a key part of intelligence. The team is committed to improving the model's reasoning with large-scale RL and pushing out the frontier of what current models can do. Without using any data from other models, through breakthroughs in RL algorithms and engineering optimization, we made full use of the compute advantage of TestingTime Scaling, completed RL Scaling, and developed the Doubao deep-thinking mode.

推理能力是智能的重要组成部分，团队致力于使用大规模 RL 的方法不断提升模型的推理能力，拓宽当前模型的智能边界。在完全不使用其他模型数据的条件下，通过 RL 算法的突破和工程优化，充分发挥 TestingTime Scaling 的算力优势，完成了 RL Scaling，研发了Doubao 深度思考模式。

![Image block](images/p10-doubao-1-5-pro-as1-preview-aime.png)

Evaluation results of Doubao-1.5-pro-AS1-Preview on AIME.

Doubao-1.5-pro-AS1-Preview 在 AIME 上的评测结果

At this stage, the interim result Doubao-1.5-pro-AS1-Preview already surpasses reasoning models such as O1-preview and O1 on AIME. And as RL continues, the model keeps getting stronger. Along the way we have also seen reasoning ability generalize across domains; the frontier of intelligence is slowly being pushed outward.

目前，阶段性进展 Doubao-1.5-pro-AS1-Preview 在 AIME 上已经超过 O1-preview，O1 等推理模型。并且，随着 RL 的持续，模型能力还在不断提升中。在这一过程中，我们也看到了推理能力在不同领域的泛化，智能的边界正在被慢慢拓宽。

> **拆开：** 「在 AIME 上已经超过 O1-preview, O1」，AIME 那张小图里哪一行支持这句话？
> 只有 cons@k 一行：Doubao 86.7 对 O1 的 83.3，可 Doubao 标的是 cons@32，O1-preview 和 O1 标的是 cons@64，采样投票的次数不一样。pass@1 一行 Doubao 70.0 低于 O1 的 74.4，只超过 O1-preview 的 44.6。图里也没写 AIME 是哪一年的题。

<!-- page 11 of 12 -->

「宫廷玉液酒，ebay bar ebay」 - what does that mean?

宫廷玉液酒，ebay bar ebay是啥意思

The phrase 「宫廷玉液酒，ebaybarebay」 looks a bit odd. It may be a humorous expression, or a code phrase used in a particular context. Let's analyze what it means.

「宫廷玉液酒，ebaybarebay」这个词组看起来有点奇怪，它可能是一种幽默的表达或者是某种特定情境下的暗语。让我们来分析一下它的含义。

First，「宫廷玉液酒」 is a fairly common expression that may come from a comedy sketch or another cultural work. In the 1996 Spring Festival Gala, Zhao Lirong and Gong Hanlin performed the sketch 「打工奇遇」，which contains the classic line 「宫廷玉液酒，一百八一杯」（palace jade wine, 180 a glass）。The sketch satirizes false advertising and fraud; the 「宫廷玉液酒」 is actually ordinary erguotou diluted with plain water.

首先，「宫廷玉液酒」是一个比较常见的词汇，可能源自于某个小品或者其他的文化作品。在1996年春节联欢晚会上，赵丽蓉和巩汉林表演的小品「打工奇遇」中，有一句经典台词：「宫廷玉液酒，一百八一杯。」 这个小品讽刺了虚假宣传和欺诈行为，其中「宫廷玉液酒」实际上是普通的二锅头兑白开水。

However, the "ebaybarebay" part looks like a combination of English words, but its spelling and pronunciation may be meant to imitate some sound, or be deliberately misspelled for comic effect. Let's try to break it down:

然而，「ebaybarebay」这个部分看起来像是英文单词的组合，但它的拼写和发音可能是为了模仿某种语音或者是故意拼错以达到幽默效果。让我们尝试将其分解：

- "ebay" may refer to eBay, the well-known global online shopping platform.

- 「ebay」可能指的是全球知名的在线购物平台eBay。

- "bar" usually means a bar or a counter.

- 「bar」通常指酒吧或者柜台。

But put together, "ebaybarebay" has no clear meaning in English. It may sound similar to some Chinese phrase, or carry a special Aud in a particular context

但是，将它们组合在一起「ebaybarebay」并没有明确的英文含义。可能是发音上与中文的某个词语相似，或者是在特定的语境下有特殊的Aud

Since 「宫廷玉液酒」 comes from a comedy sketch full of humorous lines and performance，「ebaybarebay」 may imitate the pronunciation of another line from the sketch，「群英荟萃」。In the sketch, Zhao Lirong mishears 「群英荟萃」 as 「萝卜开会」，an ingredient of 「宫廷玉液酒」，and the pronunciation of 「ebaybarebay」 may resemble 「群英荟萃」，though this is only a guess.

考虑到「宫廷玉液酒」的出处是一个小品，其中有很多幽默的语言和表演，可能「ebaybarebay」是为了模仿小品中的另一句台词「群英荟萃」的发音。在小品中，赵丽蓉将「群英荟萃」误听为「宫廷玉液酒」的配料「萝卜开会」，而「ebaybarebay」的发音可能类似于「群英荟萃」的发音，但这只是一种猜测。

Another possibility is that "ebaybarebay" is internet slang or an in-group code word, with no direct link to the eBay platform itself. In internet culture, people often coin new words through homophones or deliberate misspellings to express particular feelings or meanings. To understand the phrase better, we can compare its pronunciation with Chinese words:

另一种可能是，「ebaybarebay」是一种网络用语或者是某个群体内部的暗号，与eBay平台本身并没有直接的关联。在网络文化中，人们常常使用谐音或者故意拼错的方式来创造新词，以表达特定的情感或者含义。为了更好地理解这个词组，我们可以尝试将其发音与中文词语进行对比：

- 「ebay」 sounds like 「一杯」（one glass）。

- 「ebay」发音类似于「一杯」。

- 「bar」 sounds like 「八」（eight）。

- 「bar」发音类似于「八」。

- The second 「ebay」 again sounds like 「一杯」。

- 再次出现的「ebay」又类似于「一杯」。

So the whole phrase 「ebaybarebay」 sounds like 「一杯八一杯」，which is related to the sketch's line 「宫廷玉液酒，一百八一杯」。It may imitate the rhythm and cadence of that line for humor or teasing.

这样，整个词组「ebaybarebay」听起来像是「一杯八一杯」，这与小品中「宫廷玉液酒，一百八一杯」的台词有一定的关联。可能是在模仿这句台词的节奏和韵律，以达到幽默或者调侃的效果。

In summary，「宫廷玉液酒，ebaybarebay」 is probably a humorous adaptation of the classic line from the sketch 「打工奇遇」，using the sounds of English words to mimic the rhythm of the Chinese line and create a comic effect. This kind of expression is common in internet culture and is often used to tease or satirize certain phenomena.

综上所述，「宫廷玉液酒，ebaybarebay」可能是一种对小品「打工奇遇」中经典台词的幽默改编，通过使用英文单词的发音来模仿中文台词的节奏，从而创造出一种诙谐的效果。这种表达方式在网络文化中比较常见，常常用于调侃或者讽刺某些现象。

Copyright© 2026 Bytedance Seed

## Setting out toward the infinite possibilities of intelligence

## 向智能的无限可能出发

Early generalization of reasoning ability

推理能力的初步泛化

[Website disclaimer / 网站声明](https://seed.bytedance.com/zh/disclaimer)

The Doubao model team has always aimed to explore the endless frontier of intelligence and unlock the infinite possibilities of general intelligence. We also believe that exploring the frontier of intelligence and serving users and industries are one and the same: the two reinforce each other and drive each other forward. Going forward, the team will keep increasing its investment in foundational research on large models and take on longer-horizon, potentially disruptive research problems in general intelligence.

豆包大模型团队一直以探索智能的无尽边界，解锁通用智能的无限可能为目标。同时，我们认为探索智能的边界与服务用户和行业是一体的关系，两者可以彼此增益，双向驱动。接下来，团队会继续加强对大模型基础研究的投入，挑战更长周期的，具有颠覆性的通用智能研究课题。

<!-- page 12 of 12 -->
