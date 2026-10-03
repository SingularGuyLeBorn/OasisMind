---
title: "MiniMax-01 · 对照译稿"
category: "模型库"
tags: ["MiniMax", "对照译稿"]
published: true
excerpt: "MiniMax-01 公开材料的逐段中英对照译稿，附读报告时的疑问块。"
---
源文: arXiv:2501.08313v1, MiniMax-01 技术报告, 68 页, 43 张图. 英文段在前, 中文意译紧跟. 参考文献 (第 40 至 49 页) 和附录 A 的贡献者名单不译; 每页页眉和单独的页码行已删去, 跨页断开的半句已接回.

<!-- page 1 of 68 -->

arXiv:2501.08313v1 [cs.CL] 14 Jan 2025

MINIMAX

# MiniMax-01: Scaling Foundation Models with Lightning Attention (MiniMax-01: 用 lightning attention 放大基础模型)

**MiniMax**<sup>1</sup>

**We introduce MiniMax-01 series, including MiniMax-Text-01 and MiniMax-VL-01, which are comparable to top-tier models while offering superior capabilities in processing longer contexts. The core lies in lightning attention and its efficient scaling. To maximize computational capacity, we integrate it with Mixture of Experts (MoE), creating a model with 32 experts and 456 billion total parameters, of which 45.9 billion are activated for each token. We develop an optimized parallel strategy and highly efficient computation-communication overlap techniques for MoE and lightning attention. This approach enables us to conduct efficient training and inference on models with hundreds of billions of parameters across contexts spanning millions of tokens. The context window of MiniMax-Text-01 can reach up to 1 million tokens during training and extrapolate to 4 million tokens during inference at an affordable cost. Our vision-language model, MiniMax-VL-01 is built through continued training with 512 billion vision-language tokens. Experiments on both standard and in-house benchmarks show that our models match the performance of state-of-the-art models like GPT-4o and Claude-3.5-Sonnet while offering a 20-32 times longer context window. We publicly release MiniMax-01 at** [**https://github.com/MiniMax-AI**](https://github.com/MiniMax-AI)**.**

本文推出 MiniMax-01 系列, 包括 MiniMax-Text-01 和 MiniMax-VL-01. 两者与一线模型水平相当, 处理长上下文的能力更强. 核心是 lightning attention 以及它的高效放大. 为了把算力用足, 作者把它和 MoE 结合, 做出 32 个专家的模型: 总参数 4560 亿, 每个 token 激活 459 亿. 作者为 MoE 和 lightning attention 设计了优化过的并行策略和高效的计算-通信重叠技术, 能在数千亿参数, 数百万 token 的上下文上高效训练和推理. MiniMax-Text-01 训练时上下文窗口可达 100 万 token, 推理时可外推到 400 万 token, 成本可以接受. 视觉语言模型 MiniMax-VL-01 在此基础上用 5120 亿视觉语言 token 继续训练得到. 标准基准和内部基准上的实验显示, 两个模型与 GPT-4o, Claude-3.5-Sonnet 等最强模型相当, 上下文窗口却长 20 到 32 倍. MiniMax-01 已在 https://github.com/MiniMax-AI 公开.

> **拆开:** 32 个专家里每个 token 只走 top-2, 也就是 2/32 = 6.25% 的专家, 为什么激活比例 45.9/456 却接近 10%?
> 按第 2 节规格和图 3 估算: 若每个专家是三矩阵门控 FFN, 单个约 3 × 6144 × 9216 ≈ 1.7 亿, 80 层 32 个专家约 4349 亿; 70 层 lightning attention 的 Q, K, V, G, O 五个投影和 10 层 GQA softmax attention 合计约 187 亿, 20 万词表的输入输出嵌入约 25 亿, 加起来约 4561 亿, 与 456B 吻合. 注意力和嵌入对每个 token 都生效, 所以激活部分约为 2 个专家的 272 亿加上这约 210 亿, 在 470 亿上下 (比印出的 45.9B 多 1B 左右), 比例因此高于 6.25%.

![图 1(a) 核心文本基准柱状图: MiniMax-Text-01 在 MMLU 88.5, MMLU-Pro 75.7, C-SimpleQA 67.4, IFEval 89.0, GPQA 54.4, MATH 77.4, HumanEval 86.9, 与六个对比模型并排](images/p01-chart.png)

![图 1(b) 核心多模态基准柱状图: MiniMax-VL-01 在 MMMU 68.5, MMMU-Pro 52.7, ChartQA 91.7, DocVQA 96.4, AI2D 83.3, MathVista 68.6, OCRBench 86.5](images/p01-b-core-multimodal-benchmark-performance.png)

(b) Core multimodal benchmark performance

(b) 核心多模态基准表现

![图 1(c) RULER 长上下文平均准确率折线: MiniMax-Text-01 从 8k 的约 0.96 降到 1M 的 0.91, Gemini-1.5-Pro 在 1M 为 0.85, GPT-4o 只测到 64k](images/p01-c-long-context-ruler-performance.png)

(c) Long-context RULER performance

(c) 长上下文 RULER 表现

Figure 1 | **Benchmark performance. (a)** MiniMax-Text-01 on core text benchmarks. **(b)** MiniMax-VL-01 on core multimodal benchmarks. **(c)** MiniMax-Text-01 on the long-context RULER (Hsieh et al., 2024) benchmark. The performance of leading commercial and open-source models is presented for reference.

图 1 | 基准表现. (a) MiniMax-Text-01 在核心文本基准上的成绩. (b) MiniMax-VL-01 在核心多模态基准上的成绩. (c) MiniMax-Text-01 在长上下文 RULER 基准上的成绩. 主流商用和开源模型的成绩一并列出作参照.

> **对一下:** 图 1(a) 给 MiniMax-Text-01 的 IFEval 标的是 89.0, 和后文表 8 是同一个数吗?
> 表 8 的 IFEval (avg) 印的是 89.1, 图 1(a) 柱顶印 89.0, 差 0.1. 其余六项 (88.5, 75.7, 67.4, 54.4, 77.4, 86.9) 与表 8 一致; 图 1(b) 的 OCRBench 86.5 则是表 13 里 865 除以 10 画上去的.

<small><span class="docvortex-page-footnote" data-block-type="page_footnote" style="color:#6b7280"><sup>1</sup>Please send correspondence to model@minimaxi.com.</span></small>

脚注 1: 通信请发 model@minimaxi.com.

© 2025 MiniMax. All rights reserved

<!-- page 2 of 68 -->

## 1. Introduction

Large Language Models (LLMs) (Anthropic, 2024; Dubey et al., 2024; Hurst et al., 2024; Team et al., 2024a) and Vision Language Models (VLMs) (Anthropic, 2024; Dubey et al., 2024; Hurst et al., 2024; Team et al., 2024a) have made rapid progress in recent years, excelling at tasks like knowledge Q&A, complex reasoning, mathematics, coding, and vision-language understanding. The context window for most models currently ranges from 32K to 256K tokens. However, these lengths often fall short of practical needs—whether using a professional book as context, assisting with an entire programming project, or maximizing the potential of in-context learning through many-shot examples.

近几年大语言模型 (LLM) 和视觉语言模型 (VLM) 进步很快, 知识问答, 复杂推理, 数学, 编程, 视觉语言理解都做得不错. 目前多数模型的上下文窗口在 32K 到 256K token 之间. 这个长度常常不够用: 把一本专业书当上下文, 协助处理整个编程项目, 或者用大量示例把 in-context learning 的潜力发挥出来, 都会超出这个范围.

Context window expansion in the past two years has primarily resulted from more powerful GPUs and better I/O-aware softmax attention implementation (Dao et al., 2022; Liu et al., 2024a). However, extending these windows further has proven challenging. This limitation arises from the inherent quadratic computational complexity of the transformer (Vaswani et al., 2017) architecture—further length extension causes computational demands to grow much faster than hardware capabilities can match. To address this challenge, researchers have proposed various methods for reducing the attention mechanism’s computational complexity: sparse attention (Beltagy et al., 2020; Zaheer et al., 2020), linear attention (Qin et al., 2022a,b, 2024c), long convolutions (Qin et al., 2023a), state space models (the Mamba series) (Dao and Gu, 2024; Glorioso et al., 2024; Gu and Dao, 2024; Ren et al., 2024; Team et al., 2024b), and linear RNNs (Qin et al., 2023b, 2024d). Despite their theoretical promise, these innovations have seen limited adoption in commercial-scale models.

过去两年上下文窗口的扩展, 主要靠更强的 GPU 和更好的 I/O 感知 softmax attention 实现. 再往上扩却很难, 根子在 transformer 架构固有的二次计算复杂度: 长度继续增加, 计算需求的增长远快于硬件能力的增长. 为此研究者提出了多种降低注意力复杂度的办法: 稀疏注意力, 线性注意力, 长卷积, 状态空间模型 (Mamba 系列), 线性 RNN. 这些方法理论上有前景, 但在商用规模的模型里用得很少.

In this report, we aim to build a model that matches the performance of leading commercial models while providing a context window longer by an order of magnitude. This ambitious objective requires carefully balancing multiple factors: network architecture, data, and computation.

本报告的目标是做一个性能追平主流商用模型, 上下文窗口却长一个数量级的模型. 要做到这一点, 需要在网络架构, 数据和计算三方面仔细权衡.

Our approach begins with selecting the most promising architecture, succeeded by the optimization of the underlying training and inference framework to ensure its support. For the network architecture, we required linear attention—not just theoretically sound but highly efficient in practice, especially with long contexts. After extensive experimentation, we settled on a hybrid architecture mainly using lightning attention (Qin et al., 2024b), an I/O-aware implementation of a linear attention variant (Qin et al., 2022a). In the architecture, one transformer block with softmax attention follows every seven transnormer blocks (Qin et al., 2022a) with lightning attention.

做法是先选最有潜力的架构, 再优化底层训练和推理框架去支撑它. 网络架构上, 作者需要的线性注意力不能只是理论上成立, 实际运行也要高效, 长上下文下尤其如此. 大量实验之后, 作者选定一种以 lightning attention 为主的混合架构; lightning attention 是某种线性注意力变体的 I/O 感知实现. 架构里每 7 个使用 lightning attention 的 transnormer 块之后接 1 个使用 softmax attention 的 transformer 块.

We determined the model’s total parameters based on a practical constraint: the ability to process more than 1 million tokens on a single machine with up to 8 GPUs and 640GB memory using 8-bit quantization. To maximize parameter and computation capacity, we implemented a Mixture of Experts (MoE) (Fedus et al., 2022; Lepikhin et al., 2021). We comprehensively consider training resources, inference resources, and the final model performance, aiming to find a better balance among the three. Extensive experiments guided us toward the final model specifications: 456 billion parameters, 45.9 billion activations, and 32 experts.

总参数量由一个实际约束决定: 在最多 8 张 GPU, 640GB 显存的单机上, 用 8 bit 量化处理超过 100 万 token. 为了把参数和计算容量做大, 作者采用 MoE. 训练资源, 推理资源和最终性能三者综合考虑, 寻找更好的平衡. 大量实验把最终规格引向: 4560 亿参数, 459 亿激活, 32 个专家.

Existing distributed training and inference frameworks are primarily optimized for softmax attention. However, our novel architecture, which integrates lightning attention, softmax attention, and MoE, necessitates a complete redesign of both our training and inference frameworks. Furthermore, the framework must possess the capability to support the training and inference of models with hundreds of billions of parameters and context windows extending over millions of tokens. To this end, we implement the all-to-all communication in MoE using expert parallel (EP) and expert tensor parallel (ETP). It aims to minimize the overhead associated with inter-GPU communication. To facilitate context windows with unlimited expansion, we design varlen ring attention to reduce the redundancy in computation and the improved version of Linear Attention Sequence Parallelism (LASP) (Sun et al., 2024) to fully utilize the device’s parallel capabilities. Additionally, we have implemented a comprehensive set of CUDA kernels tailored for lightning attention inference, achieving over 75% Model Flops Utilization (MFU) (Chowdhery et al., 2023) end-to-end on the Nvidia H20.

现有分布式训练和推理框架主要为 softmax attention 优化. 新架构融合了 lightning attention, softmax attention 和 MoE, 训练和推理框架都得彻底重做; 框架还要能支撑数千亿参数, 上下文超过数百万 token 的训练和推理. 为此, MoE 里的 all-to-all 通信用专家并行 (EP) 和专家张量并行 (ETP) 实现, 以压低 GPU 间通信开销. 为了让上下文窗口能无限扩展, 作者设计了 varlen ring attention 来减少冗余计算, 并改进了线性注意力序列并行 (LASP), 充分利用设备的并行能力. 此外, 作者为 lightning attention 推理实现了一整套 CUDA kernel, 在 Nvidia H20 上端到端模型算力利用率 (MFU) 超过 75%.

<!-- page 3 of 68 -->

Building upon the architecture design and computation optimizations, we train our foundational language model, MiniMax-Text-01. Our pre-training process began with curating a diverse and high-quality corpus through rigorous data cleaning, reward-based quality enhancement, and better data mixture balancing, validated through systematic repetition-aware testing. To fully utilize the architecture’s long-context capability, we introduce in-depth analysis of the hyperparameters and propose a three-stage training procedure, successfully extending the context window to one million tokens. During the alignment phase, we incentivize the model’s various capabilities through precisely tuned reward dimensions and multi-stage training methodology, especially in the areas of long-context and realworld scenarios. Subsequently, we augment our language model with visual capabilities by integrating a lightweight Vision Transformer (ViT) (Dosovitskiy et al., 2021) module, thereby creating our vision-language model, MiniMax-VL-01. MiniMax-VL-01 undergoes additional training with 512 billion vision-language tokens, utilizing a four-stage training process. The final stage of this training is specifically designed to optimize the user experience.

在上述架构设计和计算优化的基础上, 作者训练了基础语言模型 MiniMax-Text-01. 预训练先经过严格的数据清洗, 基于奖励的质量提升和更好的数据配比, 构建多样且高质量的语料, 并用系统的重复感知测试加以验证. 为了用足架构的长上下文能力, 作者深入分析了超参数, 提出三阶段训练流程, 把上下文窗口扩展到 100 万 token. 对齐阶段通过精细调节的奖励维度和多阶段训练方法激发模型的各项能力, 长上下文和真实场景尤其如此. 之后, 作者接入一个轻量 Vision Transformer (ViT) 模块, 给语言模型加上视觉能力, 得到视觉语言模型 MiniMax-VL-01. MiniMax-VL-01 另用 5120 亿视觉语言 token 做四阶段训练, 最后一阶段专门优化用户体验.

![图 2 预填充延迟随上下文长度变化: MiniMax-Text-01 在 H800 上 1M token 约 14 万毫秒, Llama3-70B 约 76 万毫秒, 内嵌放大图是 384k 以内的局部](images/p03-figure-2-prefilling-latency-of-different-models-the.png)

Figure 2 | Prefilling latency of different models. The MiniMax-Text-01 and Llama3-70B models are tested on H800 GPUs with tensor parallelism set to 8, utilizing a custom inference framework with 8- bit weight-only quantization (W8A16). Other models are tested through their official APIs. Within the maximum length supported by each model, a sufficient number of uniformly distributed points were selected for testing. After removing outliers, the data is fitted with a quadratic function.

图 2 | 不同模型的预填充延迟. MiniMax-Text-01 和 Llama3-70B 在 H800 GPU 上测试, 张量并行设为 8, 使用自研推理框架和 8 bit 仅权重量化 (W8A16). 其他模型通过官方 API 测试. 在各模型支持的最大长度内均匀选取足够多的点, 去掉离群值后用二次函数拟合.

> **再看:** 图 2 里 MiniMax-Text-01 和 GPT-4o, Claude 的延迟曲线能直接放在一起比吗?
> 图 2 图例已写明: MiniMax-Text-01 和 Llama3-70B 标 H800, 其余标 API. API 延迟里含网络往返, 排队和对方的硬件配置, 本机 H800 数据不含这些. 所以只有 MiniMax-Text-01 与 Llama3-70B 这一对在同样条件下测得, 1M 处约 14 万毫秒对约 76 万毫秒, 其余曲线只能看趋势.

Comprehensive evaluations on core academic benchmarks demonstrate that both models attain performance levels comparable to those of closed-source top-tier models in both text and vision-language tasks, as illustrated in Figure 1 (a,b). For contexts longer than 200k, our model performs significantly better, as shown in Figure 1 (c). In addition to academic benchmarks, we also assess the models’ performance using in-house benchmarks derived from real-world usage and show that our model is top-tier in those scenarios. In addition to its performance, our model exhibits significant advantages in prefilling latency, attributed to its novel architecture, as illustrated in Figure 2.

在核心学术基准上的全面评测显示, 两个模型在文本和视觉语言任务上都达到与闭源一线模型相当的水平, 见图 1 (a,b). 上下文超过 200k 时, 本文模型明显更好, 见图 1 (c). 除学术基准外, 作者还用来自真实使用的内部基准评估模型, 结果显示模型在这些场景中处于一线. 性能之外, 得益于新架构, 模型的预填充延迟优势明显, 见图 2.

We summarize our contributions as follows:

贡献归纳如下:

1. We build a model that rivals the top-tier closed-source models on standard academic benchmarks. Furthermore, this model supports context inputs of up to 4 million tokens, showcasing outstanding performance in long-context evaluations.

1. 做出一个在标准学术基准上与一线闭源模型相当的模型, 支持最长 400 万 token 的上下文输入, 长上下文评测表现突出.

2. We demonstrate the first successful large-scale implementation of linear attention. While linear attention has been studied before, it has never been deployed at this scale. We provide comprehensive details on our algorithm design and engineering optimizations.

2. 首次成功地在大规模上实现线性注意力. 线性注意力此前有人研究过, 但从未部署到这个规模. 报告给出算法设计和工程优化的完整细节.

3. We outline a practical approach and experimental methodology for the exploration of various models, datasets, evaluations, and algorithms, which may serve as a valuable reference.

3. 给出一套探索各种模型, 数据集, 评测和算法的实用做法和实验方法, 可供参考.

4. We publicly release the weights and offer a cost-effective API, aiming to help others develop models that push beyond current limitations.

4. 公开权重并提供低价 API, 希望帮助他人开发突破当前局限的模型.

<!-- page 4 of 68 -->

## 2. Model Architecture (模型架构)

In this section, we present the design of our network architecture. To achieve optimal performance within constrained resources and better handle longer sequences, we adopt MoE approach and employ linear attention as much as possible instead of the traditional softmax attention used in standard transformers.

本节介绍网络架构的设计. 为了在有限资源内达到最优性能并更好地处理长序列, 作者采用 MoE, 并尽可能用线性注意力替代标准 transformer 里的 softmax attention.

To facilitate a more intuitive understanding, we illustrate the main architecture in Figure 3. Our design follows the Transformer-style block, with each comprises a channel mixer (an attention block) and a feature mixer (an MLP block). We employ two types of channel mixers: lightning attention and softmax attention. The feature mixer is an MoE that incorporates multiple feed-forward networks (FFNs). To ensure load balancing in the MoE blocks, we propose a novel load balancing strategy inspired by GShard (Lepikhin et al., 2021), which we refer to the global router. This strategy is designed to maintain training stability. Additionally, DeepNorm (Wang et al., 2024a) is integrated to enhance overall performance.

主架构见图 3. 设计沿用 Transformer 式的块, 每块包含一个 channel mixer (注意力块) 和一个 feature mixer (MLP 块). channel mixer 有两种: lightning attention 和 softmax attention. feature mixer 是包含多个前馈网络 (FFN) 的 MoE. 为了保证 MoE 块的负载均衡, 作者受 GShard 启发提出一种新的负载均衡策略, 称为 global router, 用来保持训练稳定. 此外还引入 DeepNorm 提升整体性能. (md 在 「This strategy is」 之后漏了半句, 按 PDF 补回 「designed to maintain training stability. Addi-」.)

The final MiniMax-Text-01 architecture integrates both linear attention and softmax attention mechanisms in a structured pattern. Specifically, a transformber block with softmax attention is positioned after every 7 transnormer blocks (Qin et al., 2022a) of linear attention, leading to a total of 80 layers. Each attention module is composed of 64 heads, each with a head dimension of 128. The softmax attention layers employ Group Query Attention (GQA) (Ainslie et al., 2023) with a group size of 8. Rotary Position Embedding (RoPE) (Su et al., 2024) is applied to half of the attention head dimension, with a base frequency set to 10,000. The model’s hidden size is configured to 6144, and each layer incorporates 32 experts with a top-2 routing strategy. The feed-forward network within each expert has a hidden dimension of 9216. In total, MiniMax-Text-01 compromises 456 billion parameters, of which 45.9 billion are activated for each processed token.

最终的 MiniMax-Text-01 架构按固定模式交替使用线性注意力和 softmax attention: 每 7 个线性注意力的 transnormer 块之后放 1 个 softmax attention 的 transformer 块, 共 80 层. 每个注意力模块 64 个头, 头维度 128. softmax attention 层使用 GQA, 组大小为 8. RoPE 只作用于注意力头维度的一半, 基频 10,000. 隐藏维度 6144, 每层 32 个专家, top-2 路由. 每个专家内 FFN 的隐藏维度 9216. MiniMax-Text-01 总参数 4560 亿, 每个 token 激活 459 亿.

![图 3 MiniMax-Text-01 架构: M 个 lightning attention 块后接 1 个 softmax attention 块, 每个子层后接 RMSNorm, 残差支路带系数 α; MoE 由 Router 选 top-2 专家; 右下展开 lightning attention 内部, Q K V 各过 SiLU, G 过 Sigmoid 做输出门控](images/p04-figure-3-the-architecture-of-minimax-text-01.png)

Figure 3 | The architecture of MiniMax-Text-01.

图 3 | MiniMax-Text-01 的架构.

In the subsequent sections, we will delve into our considerations regarding the model architecture, i.e., the integration of different attention mechanisms, the synergy between MoE and linear attention, the rationale behind hyperparameter selection, and the methodology for determining the model’s size based on scaling laws.

接下来几节讨论架构上的考量: 不同注意力机制如何组合, MoE 与线性注意力如何配合, 超参数怎么选, 以及如何依据 Scaling Laws 确定模型规模.

### 2.1. Mixture of Experts (MoE 层)

MoE provides a pathway to enhance both scalability and efficiency compared to the dense version. Typically, MoE is a substitute for the feed forward networks (FFN) in feature-mixer layers (Fedus et al., 2022; Lepikhin et al., 2021), which consists of multiple FFN experts, where each token is routed to one or more of these experts. Specifically, for an input token $\mathbf { X } _ { t } ,$ , its corresponding output hidden state $\mathbf { h } _ { t }$ is calculated as:

和 dense 版本相比, MoE 能同时提升可扩展性和效率. 通常 MoE 用来替换 feature-mixer 层里的 FFN, 由多个 FFN 专家组成, 每个 token 被路由到其中一个或几个专家. 对输入 token $\mathbf{x}_t$, 输出隐藏状态 $\mathbf{h}_t$ 按下式计算:

<!-- page 5 of 68 -->

![图 4 同算力对比: 2B 激活的 MoE 与 7B dense 在 HellaSwag, WinoGrande, Natural Questions, PIQA, TriviaQA 上的曲线, 横轴 ZFlops, 灰色虚线标出两者到达同一分数所需的算力](images/p05-figure-4-isoflop-comparison-moe-vs-dense-on-various.png)

Figure 4 | Isoflop Comparison: MoE vs. Dense on various benchmarks. Both models are trained on 1 trillion tokens. The gray dashed lines indicate the difference in the computation required for the two models to achieve the same performance.

图 4 | 等 FLOPs 比较: MoE 与 dense 在多个基准上的表现. 两个模型都训练 1 万亿 token. 灰色虚线表示两者达到同样性能时所需计算量的差距.

> **核对:** 图 4 横轴的 ZFlops 是怎么算的? 7B dense 训 1 万亿 token, 按 6ND 应在 42 ZFlops 左右, 图里曲线却在 13 附近结束.
> 图 4 两条曲线的终点约为 dense 13.5, MoE 4, 比值约 3.4, 与激活参数比 7/2 = 3.5 相符. 绝对值更接近 2ND: 2 × 7e9 × 1e12 = 14 ZFlops, 2 × 2e9 × 1e12 = 4 ZFlops. 看来横轴按前向计算量计, 没有乘上反向的 3 倍; 比较两条曲线的相对差距不受影响.

$$
\mathbf {h} _ {t} = \sum_ {i = 1} ^ {E} \operatorname{Softmax} _ {i} \left(\operatorname{TopK} (\mathbf {x} _ {t} \cdot \mathbf {W} _ {g})\right) \cdot \operatorname{FFN} _ {i} (\mathbf {x} _ {t}),\tag{1}
$$

where 𝐸 represents the total number of experts, $\mathbf { W } _ { g }$ is the weight of the gate, $\mathrm { F F N } _ { i }$ stands for the 𝑖-th expert, and TopK(·) denotes the operation that preserves the top 𝑘 scores among all 𝐸 experts while setting the remaining scores to −∞.

其中 E 是专家总数, $\mathbf{W}_g$ 是门控权重, $\mathrm{FFN}_i$ 是第 i 个专家, TopK(·) 保留 E 个专家中前 k 个分数, 其余分数置为 −∞.

The training of MoE based LLMs can be categorized into token-drop and dropless. We adopt the token-drop strategy to improve training efficiency. With this approach, each expert is assigned a capacity limit specifying the maximum number of tokens it can handle. Once this capacity is reached, any additional token routed to that expert is discarded.

MoE 大模型的训练分 token-drop 和 dropless 两类. 作者采用 token-drop 以提高训练效率: 每个专家有容量上限, 规定它最多处理多少 token; 容量满了之后, 再路由到它的 token 直接丢弃.

To assess the effectiveness of the MoE architecture, we conduct a comparative study between a dense model with 7 billion parameters and an MoE model with 2 billion activation parameters out of a total of 24 billion parameters. The results, as illustrated in Figure 4, demonstrate that the MoE model significantly outperforms the dense model under the same computational budget on various benchmarks, including HellaSwag (Zellers et al., 2019), WinoGrande (Sakaguchi et al., 2021), Natural Questions(Kwiatkowski et al., 2019), PIQA(Bisk et al., 2020) and TriviaQA(Joshi et al., 2017) When scaling up to larger models, we encounter the challenge of routing collapse, which arises due to the concentrated distribution of tokens designated for allocation. To mitigate this issue, we incorporate a simple global routing strategy to the GShard (Lepikhin et al., 2021) auxiliary loss for better load balancing.

为了检验 MoE 架构的效果, 作者比较了 7B 参数的 dense 模型和总参数 24B, 激活 2B 的 MoE 模型. 图 4 显示, 在同样的计算预算下, MoE 在 HellaSwag, WinoGrande, Natural Questions, PIQA 和 TriviaQA 等基准上明显优于 dense 模型. 放大到更大模型时会遇到路由坍缩: 待分配的 token 过于集中在少数专家上. 为缓解这个问题, 作者在 GShard 辅助损失之外加入一个简单的全局路由策略, 改善负载均衡.

**Auxiliary Loss.** To ensure differentiability, the auxiliary loss is defined as $\begin{array} { r } { L _ { \mathrm { a u x } } = \alpha _ { \mathrm { a u x } } \cdot \frac { 1 } { E } \sum _ { i = 1 } ^ { E } f _ { i } \cdot m _ { i } , } \end{array}$ where $\alpha _ { \mathrm { a u x } }$ represents the coefficient of the auxiliary loss, $f _ { i }$ denotes the fraction of tokens assigned to the 𝑖-th expert, and $m _ { i }$ is the average routing probability of expert 𝑖.

**辅助损失.** 为保证可微, 辅助损失定义为 $L_{\mathrm{aux}} = \alpha_{\mathrm{aux}} \cdot \frac{1}{E}\sum_{i=1}^{E} f_i \cdot m_i$, 其中 $\alpha_{\mathrm{aux}}$ 是辅助损失系数, $f_i$ 是分给第 i 个专家的 token 比例, $m_i$ 是专家 i 的平均路由概率.

**Global Router.** The GPU memory size constrains the micro batch size in LLM training, leading to substantial fluctuations in the token distribution within individual Expert Parallel (EP) groups. Moreover, token distributions vary across different EP groups, potentially resulting in load imbalances where experts in one EP group may be overloaded while those in another are underutilized. To address this, we implement a global token dispatching strategy across EP groups. Specifically, we introduce an additional allgather communication step to synchronize the number of tokens awaiting processing by each expert before dispatching tokens across different EP groups. Under the same capacity constraints, this global routing mechanism can effectively reduce the overall token drop rate, thereby ensuring training stability.

**全局路由.** 显存大小限制了 LLM 训练的 micro batch size, 单个专家并行 (EP) 组内的 token 分布因此波动很大. 不同 EP 组之间的 token 分布也不同, 可能出现负载不均: 某个 EP 组的专家过载, 另一组的专家闲着. 为此作者实现了跨 EP 组的全局 token 分发策略: 在跨 EP 组分发 token 之前, 多加一步 allgather 通信, 同步每个专家待处理的 token 数. 在同样的容量约束下, 这种全局路由能有效降低整体 token 丢弃率, 从而保证训练稳定.

<!-- page 6 of 68 -->

![图 5 左: softmax attention 先算 N 乘 N 的注意力矩阵再乘 V, 复杂度 O(N^2 d)](images/p06-image.png)

![图 5 右: linear attention 先算 d 乘 d 的 K 转置乘 V, 再左乘 Q, 复杂度 O(N d^2)](images/p06-figure-5-illustration-of-the-computations-for-softmax.png)

Figure 5 | Illustration of the computations for softmax attention (left) and linear attention (right). The input length is 𝑁 and feature dimension is 𝑑, with $d \ll N$ . Tensors in the same box are associated with computation. The linearized formulation allows 𝑂(𝑁) time and space complexity.

图 5 | softmax attention (左) 与线性注意力 (右) 的计算示意. 输入长度为 N, 特征维度为 d, 且 $d \ll N$. 同一个框里的张量一起参与计算. 线性化写法的时间和空间复杂度都是 O(N).

### 2.2. Linear Attention (线性注意力)

Linear attention utilizes the “right product kernel trick” to transform quadratic computational complexity into linear complexity, as illustrated in Figure 5. By taking TransNormer (Qin et al., 2022a) as an example, the NormAttention mechanism can be written as:

线性注意力利用 「右乘核技巧」, 把二次复杂度变成线性复杂度, 见图 5. 以 TransNormer 为例, 其 NormAttention 可写为:

$$
\mathbf {O} = \operatorname{Norm} ((\mathbf {Q K} ^ {\top}) \mathbf {V}),\tag{2}
$$

where Q, K, and $\mathbf { V } \in \mathbb { R } ^ { n \times d }$ are the query, key, and value matrices, respectively, with 𝑛 for sequence length and 𝑑 for feature dimension. The equation can be transformed into its linear variant using right matrix multiplication:

其中 Q, K, $\mathbf{V} \in \mathbb{R}^{n \times d}$ 分别是 query, key, value 矩阵, n 为序列长度, d 为特征维度. 利用右乘, 上式可以变成线性形式:

$$
\mathbf {O} = \operatorname{Norm} (\mathbf {Q} (\mathbf {K} ^ {\top} \mathbf {V})),\tag{3}
$$

The linear formulation facilitates efficient recurrent prediction with a training complexity of $O ( n d ^ { 2 } )$ Furthermore, linear attention ensures a constant computational complexity of $O ( d ^ { 2 } )$ , irrespective of the sequence length. This is accomplished by recurrently updating the term $\mathbf { K } ^ { \top } \mathbf { V } ,$ thereby obviating the need for repetitive computation of the entire attention matrix. In contrast, softmax attention incurs a complexity of $O ( n d ^ { \bar { 2 } } )$ during inference.

线性形式支持高效的递推预测, 训练复杂度为 $O(nd^2)$. 此外, 线性注意力每步的计算复杂度恒为 $O(d^2)$, 与序列长度无关; 做法是递推更新 $\mathbf{K}^\top\mathbf{V}$ 这一项, 不必反复计算整个注意力矩阵. 相比之下, softmax attention 推理时的复杂度是 $O(nd^{\bar{2}})$ (md 原样).

> **停一下:** softmax attention 推理复杂度印成 $O(nd^{\bar 2})$, 和前一句线性注意力训练复杂度 $O(nd^2)$ 几乎一样, 那对比还成立吗?
> 这里多半是 PDF 公式识别出错. 按图 5 左半, softmax attention 整段计算是 $O(N^2 d)$; 逐 token 解码时每步要和全部 n 个历史 key 做内积, 是 $O(nd)$, 随长度增长. 与式 (3) 下线性注意力每步恒定的 $O(d^2)$ 对照, 对比才说得通.

When addressing causal language modeling tasks, the efficacy of the right product is compromised, necessitating the computation of cumsum (Hua et al., 2022). This limitation impedes the realization of highly efficient parallel computation, which likely explains why, despite being proposed by Brébisson et al. (de Brébisson and Vincent, 2016) nine years ago, none of the current leading open-source LLMs—including LLaMA3 (Dubey et al., 2024), Qwen2.5 (Yang et al., 2024), DeepSeekV3 (DeepSeek-AI, 2024), and Mistral (Jiang et al., 2023)—have adopted this linear attention mechanism.

做因果语言建模时, 右乘的效果打折扣, 需要计算 cumsum. 这个限制妨碍了高效并行计算, 也许正因如此, 这种线性注意力虽然九年前就由 Brébisson 等人提出, 目前主流开源 LLM, 包括 LLaMA3, Qwen2.5, DeepSeekV3 和 Mistral, 都没有采用.

#### 2.2.1. Lightning Attention (lightning attention 算法)

Lightning attention (Qin et al., 2024b,c) represents an I/O-aware, optimized implementation of TransNormer (Qin et al., 2022a). This approach identifies the primary bottleneck in the computational efficiency of existing linear attention mechanisms: the slow cumsum operation inherent in causal language modeling. To alleviate this problem, Lightning Attention proposes a novel tiling technique that effectively circumvents the cumsum operation. The key innovation lies in the strategic division of the attention calculation into two distinct components: intra-block and inter-block computations. The left product attention calculation is employed for intra-block operations, while the right product is utilized for inter-block operations. This division is crucial because the intra-blocks can be significantly reduced in size, thereby ensuring that the overall computational complexity remains linear.

lightning attention 是 TransNormer 的一种 I/O 感知优化实现. 它指出现有线性注意力计算效率的主要瓶颈是因果语言建模里缓慢的 cumsum 运算. 为此, lightning attention 提出一种新的分块 (tiling) 技术, 绕开 cumsum. 关键是把注意力计算分成块内和块间两部分: 块内用左乘, 块间用右乘. 这样划分之所以关键, 是因为块可以切得很小, 整体复杂度因此保持线性.

<!-- page 7 of 68 -->

Note that the lightning attention was originally proposed by our team members in Qin et al. (2024c), we recall some of the core processes to elucidate why it can achieve theoretical linear complexity in practice for the sake of completeness. In the interest of analytical tractability, we deliberately omit the consideration of normalization, sigmoid linear unit (SiLU) activation, and gating mechanisms in the following derivation.

lightning attention 最初由本团队成员在 Qin et al. (2024c) 中提出. 为完整起见, 这里回顾几个核心过程, 说明它为什么在实践中能达到理论上的线性复杂度. 为便于分析, 下面的推导刻意略去归一化, SiLU 激活和门控.

Let us start with the forward pass in lightning attention. The left product in causal attention calculation is defined as:

先看 lightning attention 的前向. 因果注意力的左乘计算定义为:

$$
\mathbf {O} = [ (\mathbf {Q K} ^ {\top}) \odot \mathbf {M} ] \mathbf {V}\tag{4}
$$

where $\mathbf { M } _ { t s } = 1 { \mathrm { ~ i f ~ } } t \geq s$ , otherwise 0. The right product operation can be computed in a recursive formula as:

其中 t ≥ s 时 $\mathbf{M}_{ts} = 1$, 否则为 0. 右乘可以写成递推式:

$$
\mathbf {k v} _ {0} = \mathbf {0}, \mathbf {k v} _ {t} = \mathbf {k v} _ {t - 1} + \mathbf {k} _ {t} \mathbf {v} _ {t} ^ {\top}, \mathbf {o} _ {t} ^ {\top} = \mathbf {q} _ {t} ^ {\top} \mathbf {k v} _ {t}.\tag{5}
$$

It is important to note that while Eq. 5 exhibits linear computational complexity, it is inherently unparallelizable.

式 5 的计算复杂度虽是线性, 本身却无法并行.

The fundamental concept underlying the implementation of lightning attention involves the utilization of a tiling technique to compute attention scores. Specifically, the matrices Q, K, V are partitioned into two distinct blocks along the row dimension:

lightning attention 实现的基本思路是用分块技术计算注意力分数. 具体说, 把 Q, K, V 沿行方向切成两块:

$$
\mathbf {X} = \left[ \begin{array}{c} \mathbf {X} _ {1} \\ \mathbf {X} _ {2} \end{array} \right], \mathbf {X} _ {1} \in \mathbb {R} ^ {m \times d}, \mathbf {X} _ {2} \in \mathbb {R} ^ {(n - m) \times d}, \mathbf {X} \in \{\mathbf {Q}, \mathbf {K}, \mathbf {V} \}.
$$

By unfolding Eq. 4, we obtain the following expression (noting that $\mathbf { k } \mathbf { v } _ { 0 } = 0 )$

展开式 4, 得到下面的表达式 (注意 $\mathbf{kv}_0 = 0$):

$$
\mathbf {k} \mathbf {v} _ {s} = \mathbf {k} \mathbf {v} _ {0} + \sum_ {j = 1} ^ {s} \mathbf {k} _ {j} \mathbf {v} _ {j} ^ {\top}, s = 1, \dots , m. \quad \mathbf {o} _ {s} ^ {\top} = \mathbf {q} _ {s} ^ {\top} \mathbf {k} \mathbf {v} _ {s} = \mathbf {q} _ {s} ^ {\top} \mathbf {k} \mathbf {v} _ {0} + \mathbf {q} _ {s} ^ {\top} \sum_ {j = 1} ^ {s} \mathbf {k} _ {j} \mathbf {v} _ {j} ^ {\top}.\tag{6}
$$

Rewrite it in block form, we have:

写成分块形式:

$$
\mathbf {O} _ {1} = \mathbf {Q} _ {1} \mathbf {k} \mathbf {v} _ {0} + \left[ \left(\mathbf {Q} _ {1} \mathbf {K} _ {1} ^ {\top}\right) \odot \mathbf {M} \right] \mathbf {V} _ {1} \triangleq \mathbf {Q} _ {1} \mathbf {K} \mathbf {v} _ {0} + \left[ \left(\mathbf {Q} _ {1} \mathbf {K} _ {1} ^ {\top}\right) \odot \mathbf {M} \right] \mathbf {V} _ {1}.\tag{7}
$$

As shown, the intra-block $[ ( \mathbf { Q } _ { 1 } \mathbf { K } _ { 1 } ^ { \top } ) \odot \mathbf { M } ] \mathbf { V } _ { 1 }$ can use the left product and the inter-block $\mathbf { Q } _ { 1 } \mathbf { K } \mathbf { V } _ { 0 }$ can use the right product. Note that the intra-block can be further divided using the same strategy:

可以看到, 块内部分 $[(\mathbf{Q}_1\mathbf{K}_1^\top)\odot\mathbf{M}]\mathbf{V}_1$ 用左乘, 块间部分 $\mathbf{Q}_1\mathbf{KV}_0$ 用右乘. 块内还可以按同样策略继续切分:

$$
\mathbf {k} \mathbf {v} _ {m + t} = \mathbf {k} \mathbf {v} _ {m} + \sum_ {j = m + 1} ^ {m + t} \mathbf {k} _ {j} \mathbf {v} _ {j} ^ {\top}, t = 1, \dots , n - m, \mathbf {o} _ {m + t} ^ {\top} = \mathbf {q} _ {m + t} ^ {\top} \mathbf {k} \mathbf {v} _ {m + t},\tag{8}
$$

$$
\mathbf {O} _ {2} = \mathbf {Q} _ {2} \mathbf {k v} _ {m} + \left[ \left(\mathbf {Q} _ {2} \mathbf {K} _ {2} ^ {\top}\right) \odot \mathbf {M} \right] \mathbf {V} _ {2} \triangleq \mathbf {Q} _ {2} \mathbf {K V} _ {1} + \left[ \left(\mathbf {Q} _ {2} \mathbf {K} _ {2} ^ {\top}\right) \odot \mathbf {M} \right] \mathbf {V} _ {2}.
$$

To compute the second block, we use $\mathbf { K } \mathbf { V } _ { 1 } = \mathbf { k } \mathbf { v } _ { m } ,$ , which can be computed by:

计算第二块时要用到 $\mathbf{KV}_1 = \mathbf{kv}_m$, 它可以这样计算:

$$
\mathbf {K V} _ {1} = \mathbf {K V} _ {0} + \sum_ {j = 1} ^ {m} \mathbf {k} _ {m} \mathbf {v} _ {m} ^ {\top} = \mathbf {K V} _ {0} + \mathbf {K} _ {1} ^ {\top} \mathbf {V} _ {1}.\tag{9}
$$

where $\mathbf { K } \mathbf { V } _ { 0 } = \mathbf { k } \mathbf { v } _ { 0 }$ . By recursively applying the aforementioned strategy of partitioning the matrix into multiple blocks, the practical computational complexity can be reduced to linear. The final time complexity of lightning attention is $O ( n d ^ { 2 } + n B d )$ , where 𝐵 is the block size. Algorithm 1 illustrates the IO-aware implementation of lightning attention forward pass.

其中 $\mathbf{KV}_0 = \mathbf{kv}_0$. 递归地把矩阵切成多块, 实际计算复杂度就能降到线性. lightning attention 最终的时间复杂度是 $O(nd^2 + nBd)$, B 为块大小. 算法 1 给出 lightning attention 前向的 IO 感知实现.

> **回看:** 式 (9) 的求和写成 $\sum_{j=1}^{m} \mathbf{k}_m \mathbf{v}_m^\top$, 求和变量是 j, 被加项却只有 m, 这样求出来是 m 个同样的项吗?
> 按式 (6) 和式 (8) 的写法, 被加项应是 $\mathbf{k}_j \mathbf{v}_j^\top$, 式 (9) 右端 $\mathbf{K}_1^\top \mathbf{V}_1$ 也正是对 j = 1 到 m 求和的结果, 所以左边的下标 m 是笔误. 同理, 式 (6) 前一句 「By unfolding Eq. 4」 展开的其实是式 (5) 的递推.

<!-- page 8 of 68 -->

<div class="docvortex-algorithm" style="white-space: pre-wrap; font-family:monospace;">
Algorithm 1 Lightning Attention Forward Pass
Input: $\mathbf{Q}, \mathbf{K}, \mathbf{V} \in \mathbb{R}^{n \times d}$, block sizes $B$.
Divide $\mathbf{X}$ into $T = \frac{n}{B}$ blocks $\mathbf{X}_1, \mathbf{X}_2, \ldots, \mathbf{X}_T$ of size $B \times d$ each, where $\mathbf{X} \in \{\mathbf{Q}, \mathbf{K}, \mathbf{V}, \mathbf{O}\}$.
Initialize mask $\mathbf{M} \in \mathbb{R}^{B \times B}$, where $\mathbf{M}_{ts} = 1$, if $t \geq s$, else 0.
Initialize $\mathbf{KV} = 0 \in \mathbb{R}^{d \times d}$.
for $t = 1, \ldots, T$ do
    Load $\mathbf{Q}_t, \mathbf{K}_t, \mathbf{V}_t \in \mathbb{R}^{B \times d}$ from HBM to on-chip SRAM.
    On chip, compute $\mathbf{O}_{\text{intra}} = [( \mathbf{Q}_t \mathbf{K}_t^\top) \odot \mathbf{M}] \mathbf{V}_t$.
    On chip, compute $\mathbf{O}_{\text{inter}} = \mathbf{Q}_t(\mathbf{KV})$.
    On chip, compute $\mathbf{KV} = \mathbf{KV} + \mathbf{K}_t^\top \mathbf{V}_t$.
    Write $\mathbf{O}_t = \mathbf{O}_{\text{intra}} + \mathbf{O}_{\text{inter}}$ to HBM as the $t$-th block of $\mathbf{O}$.
end for
Return $\mathbf{O}$.
</div>

算法 1 | lightning attention 前向. 输入 Q, K, V 和块大小 B. 把各矩阵切成 T = n/B 个 B × d 的块, 初始化下三角掩码 M 和 d × d 的零矩阵 KV. 对每个块 t: 从 HBM 读入 $\mathbf{Q}_t, \mathbf{K}_t, \mathbf{V}_t$ 到片上 SRAM; 片上算块内输出 $[(\mathbf{Q}_t\mathbf{K}_t^\top)\odot\mathbf{M}]\mathbf{V}_t$ 和块间输出 $\mathbf{Q}_t(\mathbf{KV})$; 再用 $\mathbf{K}_t^\top\mathbf{V}_t$ 累加更新 KV; 两部分相加写回 HBM 作为 O 的第 t 块. 循环结束返回 O.

#### 2.2.2. Effectiveness of Lightning Attention (lightning attention 的实效)

Although lightning attention demonstrates promise and competitive performance in small-scale experiments, its scaling behavior and capability in the downstream tasks under large-scale settings remain unexplored. To mitigate the gap, we conduct a series of scaling experiments to evaluate the scalability of the lightning attention mechanism in comparison to softmax attention, meanwhile verifying the performance on the extensive downstream tasks. It is noteworthy that during our experiments, we observed that lightning attention demonstrates limited retrieval capabilities. This finding inspired us to explore a hybrid approach (Hybrid-lightning) that takes the advantages of both lightning and softmax attention to enhance retrieval performance by substituting lightning attention with softmax attention at intervals of every eight layers.

lightning attention 在小规模实验中有潜力, 表现也有竞争力, 但大规模下的放大行为和下游能力还没人验证. 为此作者做了一系列放大实验, 把 lightning attention 与 softmax attention 的可扩展性作比较, 同时在大量下游任务上检验性能. 实验中作者发现 lightning attention 的检索能力有限, 于是尝试一种混合方案 (Hybrid-lightning): 每隔八层把一层 lightning attention 换成 softmax attention, 兼取两者之长以提升检索性能.

We adhere to the FLOPs calculation methodology established by Kaplan et al. (2020). For the purpose of our analysis, we define the following variables: 𝑙 (number of layers), 𝑑 (model dimension), ℎ (number of attention heads), 𝑏 (batch size) and 𝑛 (sequence length). The checklist of model parameters and FLOPs is presented in Table 1.

FLOPs 计算沿用 Kaplan et al. (2020) 的方法. 定义变量: l (层数), d (模型维度), h (注意力头数), b (batch size), n (序列长度). 参数量和 FLOPs 见表 1.

Table 1 | Model Parameters and FLOPs Comparisons Across Architectures. For scaling law calculations, embedding parameters and other subleading terms are excluded to improve alignment with fitted results.

表 1 | 各架构的参数量和 FLOPs 比较. 为了与拟合结果更好对齐, Scaling Laws 计算中不计嵌入参数和其他次要项.

| Architecture | Parameter count | FLOPs count |
| --- | --- | --- |
| Softmax Attention | 12𝑙𝑑<sup>2</sup> | 72𝑏𝑛𝑙𝑑2(1 + 6𝑛𝑑 + 158𝑑) |
| Lightning Attention | 12𝑙𝑑<sup>2</sup> + 2𝑙𝑑<sup>2</sup>/ℎ | 72𝑏𝑛𝑙𝑑2(1 + 21ℎ + 158𝑑) |
| Hybrid-lightning | 12𝑙𝑑<sup>2</sup> + 7𝑙𝑑<sup>2</sup>/4ℎ | 72𝑏𝑛𝑙𝑑<sup>2</sup>(1 + 48𝑛𝑑 + 176ℎ + 158𝑑) |

> **看表:** 表 1 softmax 一行的 FLOPs 印成 72bnld²(1 + 6nd + 158d), 括号里 「6nd」 这一项随 n 和 d 线性增长, 量纲说得通吗?
> 表 1 的分式在转写时被压扁了. 72bnld² 正是 6 × bn × 12ld², 即 6ND; softmax 注意力分数的计算相对它的比例是 n/(6d), 所以 「6nd」 应读作 n/(6d). 表 1 混合一行 「48nd」 和 「176h」 与此吻合: n/(48d) 是 n/(6d) 的 1/8, 7/(16h) 是 lightning 一行 1/(2h) (「21h」) 的 7/8, 正对应 8 层里 1 层 softmax, 7 层 lightning. 最后一项 「158d」 的原式无法从 md 还原.

##### 2.2.2.1 Experimental Setup (实验设置)

We conducted training on softmax (equipped with FlashAttention-2 (Dao, 2024)), lightning attention, and hybrid-lightning attention models across various scales: 70 million, 160 million, 410 million, 1 billion, 3 billion, and 7 billion parameters. Each model was trained on a dataset consisting of up to 300 billion tokens, with a context length of 8192. Our training methodology follows the approach proposed by Chinchilla (Hoffmann et al., 2022), where the training loss serves as a direct indicator of test performance. For each model architecture and training sequence length, we maintained a uniform global batch size of 4 million tokens. The Adam optimizer was employed, configured with a learning rate of 3e-4 and a weight decay of 0.1. A fixed learning rate scheduler was applied across all experiments due to constrained computational resources.

作者在多个规模上训练了 softmax (配 FlashAttention-2), lightning attention 和 hybrid-lightning 模型: 7000 万, 1.6 亿, 4.1 亿, 10 亿, 30 亿和 70 亿参数. 每个模型最多训练 3000 亿 token, 上下文长度 8192. 训练方法沿用 Chinchilla, 把训练 loss 直接当作测试性能的指标. 对每种架构和训练序列长度, global batch size 统一为 400 万 token. 优化器用 Adam, 学习率 3e-4, weight decay 0.1. 由于算力有限, 所有实验都用固定学习率调度.

<!-- page 9 of 68 -->

Table 2 | Summary of Scaling Laws: It shows the relationships between loss (𝐿), optimal model size $\left( N _ { o p t } \right)$ , and optimal dataset size $( D _ { o p t } )$ as functions of computational budget (𝐶). It reveals that, given the same budget, the hybrid model uses more parameters and tokens but achieves lower loss.

表 2 | Scaling Laws 汇总: loss (L), 最优模型规模 ($N_{opt}$) 和最优数据量 ($D_{opt}$) 作为计算预算 (C) 的函数. 同样预算下, 混合模型用更多参数和 token, loss 却更低.

| Arch | 𝐿(𝐶) | 𝑁<sub>𝑜𝑝𝑡</sub>(𝐶) | 𝐷<sub>𝑜𝑝𝑡</sub>(𝐶) |
| --- | --- | --- | --- |
| Softmax Attention | 3.7087𝐶<sup>-0</sup>.0798 | (1.82 × 108)𝐶0.7118 | (2.56 × 1010)𝐶0.5102 |
| Lightning Attention | 3.5391𝐶<sup>-0</sup>.0768 | (2.74 × 108)𝐶0.6470 | (4.43 × 1010)𝐶0.4684 |
| Hybrid-lightning | 3.4797𝐶<sup>-0</sup>.0763 | (2.57 × 108)𝐶0.6670 | (3.70 × 1010)𝐶0.4707 |

> **问:** 表 2 里 softmax 一行 $N_{opt}$ 的指数 0.7118 加 $D_{opt}$ 的指数 0.5102 等于 1.222, 按 C ∝ N·D 两个指数之和不是应当接近 1 吗?
> 表 2 三行的指数和分别是 1.222, 1.1154, 1.1377, 都明显大于 1, 说明 $N_{opt}$ 和 $D_{opt}$ 是分开拟合的, 没有强加 C = 6ND 的约束. 第 2.2.2.1 节交代了用固定学习率调度, 图 6 中间和右边的点也较稀疏, 这些都会让单独拟合的指数偏离. 表 2 的系数适合比较三种架构的相对位置, 不宜拿来外推到很大的 C.

![图 6 左: 70M 到 7B 各模型 loss 随 PFLOP/s-days 下降的训练曲线, 虚线为拟合的包络线](images/p09-chart.png)

![图 6 中: 最优参数量随算力变化, 三种注意力的拟合线几乎重合](images/p09-chart-2.png)

![图 6 右: 最优训练 token 数随算力变化, 三条拟合线斜率接近, 截距不同](images/p09-figure-6-summary-of-scaling-laws-training-curves-left.png)

Figure 6 | Summary of Scaling Laws. Training curves (left) span models from 70M to 7B parameters. Optimal model size (center) and training tokens (right) are derived based on a specified compute budget estimation.

图 6 | Scaling Laws 汇总. 左: 70M 到 7B 参数模型的训练曲线. 中: 按给定计算预算估算出的最优模型规模. 右: 对应的最优训练 token 数.

We employ a diverse set of evaluation benchmarks, including BoolQ (Clark et al., 2019), PIQA (Bisk et al., 2020), SIQA (Sap et al., 2019), HellaSwag (Zellers et al., 2019), WinoGrande (Sakaguchi et al., 2021), ARC (both easy and challenge variants) (Clark et al., 2018), OpenBookQA (Mihaylov et al., 2018), Needle in A Haystack (NIAH) (Shen et al., 2024), and SCROLLS (Shaham et al., 2022). Each benchmark assesses distinct capabilities of the models.

评测基准包括 BoolQ, PIQA, SIQA, HellaSwag, WinoGrande, ARC (easy 和 challenge 两个版本), OpenBookQA, Needle in A Haystack (NIAH) 和 SCROLLS, 各自考察模型的不同能力.

##### 2.2.2.2 Scaling Laws (Scaling Laws 拟合)

We fit the scaling curves based on our experiments over the above mentioned settings, where we alter the model size (𝑁) and dataset size (𝐷) for different computational budget (𝐶) and observe the corresponding training loss (𝐿) that serving as an estimator of test loss. We begin by establishing power-law relationships between 𝐿 and 𝐶, following Chinchilla’s methodology (Hoffmann et al., 2022). Using the fitted curve, we derive coefficients for optimal model size $N _ { o p t } \propto C ^ { a }$ and optimal dataset size $D _ { o p t } \propto C ^ { b }$ The original scaling laws (Kaplan et al., 2020) use $L ( X )   =   ( X _ { 0 } / X ) ^ { \alpha _ { X } }$ , while subsequent studies (Clark et al., 2022; Gao et al., 2024; Henighan et al., 2020; Hoffmann et al., 2022) employ $L ( X ) = \epsilon + ( X _ { 0 } / X ) ^ { \alpha _ { X } }$ for better fitting, where 𝜖 denotes the irreducible loss. For simplicity, we unify these forms into $L ( X ) = \beta _ { X } X ^ { \alpha _ { X } }$ , facilitating a direct comparison of scaling capabilities based on $\alpha _ { X }$ and $\beta _ { X }$ . The summary of scaling laws is shown in Table 2 and Figure 6. It can be intuitively understood that given the same computational budget, models with lightning attention tend to utilize more parameters and tokens, yet they achieve a lower loss compared to models with pure softmax attention.

作者在上述设置下拟合 Scaling 曲线: 对不同计算预算 (C) 改变模型规模 (N) 和数据量 (D), 观察相应的训练 loss (L), 用它估计测试 loss. 先按 Chinchilla 的方法建立 L 与 C 的幂律关系, 再从拟合曲线推出最优模型规模 $N_{opt} \propto C^a$ 和最优数据量 $D_{opt} \propto C^b$ 的系数. 最初的 Scaling Laws 用 $L(X) = (X_0/X)^{\alpha_X}$, 后续研究为拟合更好改用 $L(X) = \epsilon + (X_0/X)^{\alpha_X}$, ε 为不可约损失. 为简单起见, 作者统一写成 $L(X) = \beta_X X^{\alpha_X}$, 便于直接按 $\alpha_X$ 和 $\beta_X$ 比较 Scaling 能力. 汇总见表 2 和图 6. 直观地说, 同样计算预算下, 带 lightning attention 的模型倾向于用更多参数和 token, loss 却比纯 softmax attention 模型低.

> **想:** 「同样预算下混合模型用更多参数」 在任何预算下都成立吗?
> 按表 2 估算: 混合模型 $N_{opt}$ 系数 2.57e8 大于 softmax 的 1.82e8, 但指数 0.6670 小于 0.7118, 两条线在 C = (2.57/1.82)^{1/0.0448} ≈ 2.2e3 PFLOP/s-days 处相交, 超过这个预算后 softmax 的最优参数量反而更大. loss 一栏两条线相交要到约 8e7 PFLOP/s-days, 远在图 6 的横轴范围之外, 所以 「loss 更低」 在图 6 的范围内都成立.

<!-- page 10 of 68 -->

![图 7 410M, 1B, 3B, 7B 四档下 softmax, lightning, hybrid-lightning 在各基准上的柱状对比; NIAH 一栏 hybrid 依次为 84.2, 95.7, 98.0, 97.7, 纯 lightning 明显落后](images/p10-figure-7-larger-models-and-hybrid-lightning-attention.png)

Figure 7 | Larger models and hybrid-lightning attention achieve the best performance across benchmarks. Performance is evaluated on CSR (Common Sense Reasoning), NIAH (Needle in a Haystack), and SCROLLS benchmarks using three attention mechanism models from 410M to 7B parameters.

图 7 | 更大的模型和 hybrid-lightning attention 在各基准上表现最好. 用 410M 到 7B 参数, 三种注意力机制的模型在 CSR (常识推理), NIAH (大海捞针) 和 SCROLLS 基准上评测.

##### 2.2.2.3 Performance on Downstream Task. (下游任务表现)

We present the benchmark results of downstream tasks in Figure 7. Lightning attention demonstrates comparable performance across most downstream tasks, with the exception of NIAH. This indicates that linear attention exhibits similar language modeling capabilities to Transformer models but falls short in retrieval tasks, rendering it unsuitable for LLMs. However, the hybrid-lightning attention not only matches but surpasses the retrieval and extrapolation capabilities of softmax attention, making it well-suited for in-context learning in LLMs.

下游任务结果见图 7. 除 NIAH 外, lightning attention 在多数下游任务上表现相当. 这说明线性注意力的语言建模能力与 Transformer 相近, 检索任务却不行, 因此不适合单独用于 LLM. hybrid-lightning attention 的检索和外推能力则不仅追平, 还超过 softmax attention, 很适合 LLM 的 in-context learning.

##### 2.2.2.4 Speed. (速度)

We assess the end-to-end training speed of softmax attention, lightning attention, and hybridlightning models with 3 billion parameters by measuring the tokens processed per GPU per second (TGS). For completeness, we also included popular linear models such as HGRN2 and Mamba2 in our evaluation. For the speed benchmark, the training context length was gradually increased until reaching the out-of-memory limit on a single-node H800 GPUs. As illustrated in Fig. 8, lightning attention achieves a constant training speed irrespective of the sequence length and is the sole linear model that outperforms FlashAttention2.

作者以每 GPU 每秒处理的 token 数 (TGS) 衡量 30 亿参数的 softmax attention, lightning attention 和 hybrid-lightning 模型的端到端训练速度. 为完整起见, 也纳入了 HGRN2 和 Mamba2 等流行线性模型. 测速时逐步增加训练上下文长度, 直到单节点 H800 显存不足. 如图 8 所示, lightning attention 的训练速度不随序列长度变化, 并且是唯一超过 FlashAttention2 的线性模型.

![图 8 3B 模型训练速度 TGS 随序列长度 1024 到 65536 变化: lightning 稳在约 1.6 万, softmax 从约 1.65 万跌到约 6700, HGRN2 和 Mamba2 平稳但更低](images/p10-figure-8-the-training-speed-of-various-attention.png)

Figure 8 | The training speed of various attention mechanisms, including softmax, lightning, hybridlightning, HGRN2, and Mamba2, was benchmarked across sequence lengths ranging from 1,024 to 65,536. Performance was measured in terms of training speed, reported as tokens processed per GPU per second (TGS).

图 8 | softmax, lightning, hybrid-lightning, HGRN2 和 Mamba2 等注意力机制在 1,024 到 65,536 序列长度上的训练速度, 以每 GPU 每秒处理的 token 数 (TGS) 计.

> **再看:** 正文说 lightning 是唯一超过 FlashAttention2 的线性模型, 图 8 最左端 1024 长度处也是这样吗?
> 图 8 在 1024 处 softmax 约 16,500 TGS, lightning 约 15,700, softmax 还略快; 到 4096 左右两者持平, 此后 softmax 一路跌到约 6,700. 所以 「超过」 指中长序列; 短序列下 FlashAttention2 仍占优, HGRN2 和 Mamba2 则全程都低于 lightning.

<!-- page 11 of 68 -->

#### 2.2.3. Hybrid Architecture (混合架构)

Our preliminary experiments with the hybrid architecture have yielded promising results, motivating us to delve deeper into its potential through two variants: hybrid-cosformer2 and hybrid-hgrn2. In the hybrid-cosformer2 model, we replace the linear attention layers in the cosformer2 architecture with softmax attention layers at intervals of every eight layers. This substitution strategy is similarly applied in the hybrid-hgrn2 model. We conduct experiments using consistent setups to evaluate the downstream performance of these alternatives. Our findings, as summarized in Table 3, indicate that the hybrid-lightning model achieves the best performance.

混合架构的初步实验结果不错, 作者又用两个变体深入考察: hybrid-cosformer2 和 hybrid-hgrn2. hybrid-cosformer2 在 cosformer2 架构里每隔八层把线性注意力层换成 softmax attention 层, hybrid-hgrn2 同理. 用一致的设置评测这些替代方案的下游性能, 表 3 的结果显示 hybrid-lightning 表现最好.

Table 3 | Benchmarking various hybrid-linear models with 1 Billion Parameters. We present the average CSR score, weighted average accuracy for NIAH, and the average SCROLLS score. Higher scores indicate better performance across all tasks. Abbreviations: TGS (token per gpu per second), HS (HellaSwag), WG (WinoGrande), OBQA (OpenBookQA), NIAH, and SCR (SCROLLS).

表 3 | 10 亿参数的各种混合线性模型对比. 列出 CSR 平均分, NIAH 加权平均准确率和 SCROLLS 平均分, 所有任务都是越高越好. 缩写: TGS (每 GPU 每秒 token 数), HS (HellaSwag), WG (WinoGrande), OBQA (OpenBookQA), NIAH, SCR (SCROLLS).

| Hybrid-linear Arch. | TGS ↑ PIQA↑ HS↑ WG↑ | ARC-E↑ | ARC-C↑ | OBQA↑ | CSR ↑ | NIAH ↑ | SCR ↑ |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Hybrid-cosformer2 | 23.3K 70.29 45.63 51.46 | 55.77 | 26.11 | 30.60 | 46.64 | 43.6 | 10.9 |
| Hybrid-hgrn2 | 29.5K 70.89 51.23 56.51 | 59.68 | 28.50 | 32.40 | 49.87 | 91.8 | 10.8 |
| Hybrid-lightning | 33.4K 70.73 50.41 55.80 | 59.93 | 27.65 | 32.80 | 49.55 | 95.7 | 13.3 |

In addition to linear models, sliding window attention can also achieve linear computational complexity by appropriately adjusting the window size. As it is grounded in softmax attention, it serves as a robust baseline for evaluating linear architectures. Therefore, we incorporated the hybrid-window approach by replacing the sliding window attention with full softmax attention every eight layers. We evaluated various window sizes of SWA ranging from 256 to 1024. Our results indicate that larger window sizes lead to slower training speeds compared to the hybrid-lightning model. To compare these models under equivalent speed conditions, we did not consider window sizes larger than 1024. As shown in Table 4, the hybrid-lightning model outperforms all other models across all metrics, particularly excelling in the NIAH benchmark.

除线性模型外, 滑动窗口注意力 (SWA) 调好窗口大小也能做到线性复杂度. 它以 softmax attention 为基础, 是评估线性架构的有力基线. 作者因此加入 hybrid-window 方案: 每八层把滑动窗口注意力换成完整的 softmax attention. SWA 窗口从 256 试到 1024. 结果显示窗口越大训练越慢, 慢于 hybrid-lightning; 为在相当的速度下比较, 不考虑超过 1024 的窗口. 表 4 显示 hybrid-lightning 在所有指标上都优于其他模型, NIAH 上尤其突出.

Table 4 | Benchmark comparison of hybrid-lightning and hybrid-window Models. Metrics include average CSR score, weighted NIAH accuracy, and average SCROLLS score. Higher scores indicate better performance across all tasks. Abbreviations: PS (parameter size, billion), W.S. (window size of SWA), HS (HellaSwag), WG (WinoGrande), OBQA (OpenBookQA), NIAH, SCR (SCROLLS), TGS (token per gpu per second).

表 4 | hybrid-lightning 与 hybrid-window 模型对比. 指标为 CSR 平均分, NIAH 加权准确率和 SCROLLS 平均分, 越高越好. 缩写: PS (参数规模, 十亿), W.S. (SWA 窗口大小), HS (HellaSwag), WG (WinoGrande), OBQA (OpenBookQA), NIAH, SCR (SCROLLS), TGS (每 GPU 每秒 token 数).

| P.S Arch. W.S. | TGS ↑ PIQA↑ HS↑ WG↑ | ARC-E↑ | ARC-C↑ | OBQA↑ | CSR ↑ | NIAH ↑ | SCR↑ |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 256 | 35.6K 70.29 48.68 53.35 | 57.95 | 28.75 | 32.60 | 48.61 | 46.8 | 10.6 |
| Hybrid- |  |  |  |  |  |  |  |
| 512 | 35.1K 70.95 48.19 52.33 | 57.53 | 27.22 | 30.00 | 47.70 | 25.7 | 11.9 |
| 1B window |  |  |  |  |  |  |  |
| 1024 | 33.6K 69.75 47.80 53.12 | 57.53 | 28.33 | 31.60 | 48.02 | 53.9 | 10.6 |
| Hybrid-lightning | 33.4K 70.73 50.41 55.80 | 59.93 | 27.65 | 32.80 | 49.55 | 95.7 | 13.3 |
| 256 | 16.1K 73.83 59.70 59.59 | 64.10 | 33.62 | 35.00 | 54.31 | 40.9 | 14.2 |
| Hybrid- |  |  |  |  |  |  |  |
| 512 | 15.8K 73.29 60.00 59.04 | 62.96 | 32.51 | 36.00 | 53.97 | 57.9 | 14.2 |
| 3B window |  |  |  |  |  |  |  |
| 1024 | 15.4K 74.27 59.02 57.85 | 64.56 | 31.91 | 33.00 | 53.44 | 41.6 | 13.3 |
| Hybrid-lightning | 15.1K 74.21 61.06 59.51 | 65.49 | 34.90 | 35.80 | 55.16 | 98.0 | 14.7 |

> **确认:** 表 4 里 1B hybrid-window 的 NIAH 随窗口 256, 512, 1024 先降后升, 3B 却是先升后降, 窗口大小和检索能力之间有稳定关系吗?
> 从表 4 看不出单调关系: 1B 三档依次为 46.8, 25.7, 53.9, 3B 为 40.9, 57.9, 41.6, 波动在 10 到 30 分之间, 而 hybrid-lightning 同规模是 95.7 和 98.0. 小模型的 NIAH 本身噪声大 (图 7 里 7B hybrid 的 97.7 也略低于 3B 的 98.0), 表 4 能支持的结论只是 hybrid-window 整体远低于 hybrid-lightning, 不能读成窗口越大越好或越差.

#### 2.2.4. Discussion (讨论)

Based on our analysis of scaling law experiment, downstream performance and speed comparison, we conclude that while pure linear attention models are computationally efficient, they are not suitable for LLMs. This is due to their inherent inability to perform retrieval, a capability that is essential for in-context learning. In contrast, our hybrid model not only matches but also surpasses softmax attention in both retrieval and extrapolation tasks. This outcome is somewhat counterintuitive. To understand this phenomenon, consider the following explanation of softmax attention:

综合 Scaling Laws 实验, 下游表现和速度比较, 结论是: 纯线性注意力模型计算高效, 但不适合 LLM, 因为它们天生做不了检索, 而检索是 in-context learning 的必备能力. 混合模型在检索和外推任务上则不仅追平, 还超过 softmax attention. 这个结果有点反直觉. 为理解这一现象, 考虑 softmax attention 的如下解释:

<!-- page 12 of 68 -->

$$
\mathbf {O} = \operatorname{Softmax} (\mathbf {Q K ^ {\top}} / \sqrt {d}) \mathbf {V}.\tag{10}
$$

It can be rewritten into a linear recurrent form as:

它可以改写成线性递推形式:

$$
s _ {t} ^ {0} = 0, \quad s _ {t} ^ {j} = s _ {t} ^ {j - 1} + \exp (\mathbf {q} _ {t} \mathbf {k} _ {j} ^ {T} / \sqrt {d}), \quad \mathbf {o} _ {t} ^ {j} = (s _ {t} ^ {j - 1} / s _ {t} ^ {j}) \mathbf {o} _ {t} ^ {j - 1} + (1 - s _ {t} ^ {j - 1} / s _ {t} ^ {j}) \mathbf {v} _ {j}, \quad \mathbf {o} _ {t} = \mathbf {o} _ {t} ^ {t}, j = 1, \dots , t.\tag{11}
$$

Note that the linear recurrence form of lightning attention is as follows:

lightning attention 的线性递推形式如下:

$$
\mathbf {k} \mathbf {v} _ {0} = 0, \quad \mathbf {k} \mathbf {v} _ {j} = \mathbf {k} \mathbf {v} _ {j - 1} + \mathbf {k} _ {j} \mathbf {v} _ {j} ^ {\top} \quad \mathbf {o} _ {j} = \mathbf {k} \mathbf {v} _ {j} ^ {\top} \mathbf {q} _ {j}, j = 1, \ldots , t.\tag{12}
$$

The softmax attention mechanism can be interpreted as a linear RNN (Qin et al., 2024a). At each time step 𝑡, the hidden state is recalculated starting from the initial time $t _ { 0 } = 1$ , a process often described as "Going Through a Book." This method enables the model to accurately retain input information by systematically revisiting previous data. In contrast, linear models lack this recomputation process, which hinders their ability to effectively retain input data.

softmax attention 可以理解为一种线性 RNN. 在每个时间步 t, 隐藏状态都从初始时刻 $t_0 = 1$ 开始重新计算, 这个过程常被形容为 「把书从头翻一遍」 (Going Through a Book). 系统地回看之前的数据, 让模型能准确保留输入信息. 线性模型没有这种重算过程, 保留输入的能力因此受限.

Let us define the capacity of an RNN as the size of its recurrent state. Upon closer examination of Eq. 11, we can deduce that the capacity of softmax attention is $O ( d )$ . In contrast, as illustrated in Eq. 12, the capacity of lightning attention is $O ( d ^ { 2 } / h )$ . Given that $d > h ,$ it follows that lightning attention possesses a larger capacity than softmax attention. Consequently, the hybrid-lightning model exhibits superior retrieval and extrapolation capabilities compared to models relying solely on softmax attention.

把 RNN 的容量定义为递推状态的大小. 仔细看式 11, 可以推出 softmax attention 的容量是 $O(d)$; 按式 12, lightning attention 的容量是 $O(d^2/h)$. 由于 d > h, lightning attention 的容量大于 softmax attention. 所以 hybrid-lightning 模型的检索和外推能力优于只用 softmax attention 的模型.

> **停一下:** 按式 (11), softmax attention 每一步都要重新扫过全部 $\mathbf{k}_j, \mathbf{v}_j$, 这些历史 key 和 value 不也是状态的一部分吗? 只算 $O(d)$ 合适吗?
> 式 (11) 里随 j 递推的只有标量 $s_t^j$ 和向量 $\mathbf{o}_t^j$, 所以按 「递推状态」 的定义是 $O(d)$; 但每个 t 都要从 j = 1 重算, 靠的是完整保存的 t 个 key 和 value, 这部分随长度增长, 是 $O(td)$. 式 (12) 的 $\mathbf{kv}_j$ 则是固定的 $O(d^2/h)$. 所以这段容量论证只比较了递推变量, 没有算上 softmax 读回的 KV cache; 它能解释混合模型为什么比纯线性模型好, 对 「超过纯 softmax」 的解释力要弱一些.

### 2.3. Module Ablations in MoE (MoE 里的模块消融)

Based on the conclusions from previous sections, we conduct two additional sets of ablation experi ments to validate module choices within the MoE architecture on a larger scale: (1) Hybrid-lightning attention versus softmax attention: To verify the advantages of the hybrid lightning attention in the MoE. (2) Pre-Layer Normalization versus Post-Layer Normalization: In our hybrid architecture, the effective depth of the model plays a significant role. Thus, we expect to find a better normalization algorithm for the deep model.

在前面结论的基础上, 作者再做两组消融, 在更大规模上验证 MoE 架构中的模块选择: (1) hybrid-lightning attention 对 softmax attention, 验证混合 lightning attention 在 MoE 中的优势; (2) Pre-Layer Normalization 对 Post-Layer Normalization: 混合架构里模型的有效深度很重要, 作者希望为深层模型找到更好的归一化方式.

**Hybrid-lightning Attention versus Softmax Attention.** We perform a small-scale comparative analysis between softmax attention and hybrid-lightning attention within the MoE architecture. Specifically, we use a 28 billion parameter MoE with 5 billion activation parameters that utilize softmax attention as the base model. For every 8 consecutive layers in the base model, we systematically replace softmax attention with lightning attention in the first 7 layers. Both the base model and the modified model are trained on 1 trillion tokens. As shown in Table 5, the results reveal that substituting certain softmax attention layers with lightning attention improves accuracy across most benchmarks.

**hybrid-lightning attention 对 softmax attention.** 作者在 MoE 架构内对两者做小规模比较. 基座是一个用 softmax attention, 总参数 280 亿, 激活 50 亿的 MoE. 基座每连续 8 层中, 把前 7 层的 softmax attention 换成 lightning attention. 基座和改后的模型都训练 1 万亿 token. 表 5 显示, 把部分 softmax attention 层换成 lightning attention 后, 多数基准的准确率都有提升.

**Pre Layer Normalization versus Post Layer Normalization.** Pre Layer Normalization(Baevski and Auli, 2018; Child et al., 2019; Wang et al., 2019) (PreNorm), which applies normalization layers before residual connections and attention mechanisms, has demonstrated enhanced stability and performance in LLMs. Since PreNorm allows gradients to flow more directly from the output to the input through residual connections, bypassing the sub-layers to a certain extent, it reduces the effective depth of the model. In contrast, Post Layer Normalization(Wang et al., 2019) (PostNorm) applies normalization after the residual connection and attention mechanisms, thereby preserving the model’s effective depth. However, PostNorm can be prone to vanishing and exploding gradients, presenting significant challenges in training LLMs. Most existing LLMs predominantly use PreNorm, as the performance differences between wider and deeper networks in the conventional Transformer architecture are often negligible, and training stability is prioritized.

**Pre Layer Normalization 对 Post Layer Normalization.** Pre Layer Normalization (PreNorm) 把归一化层放在残差连接和注意力之前, 已被证明能提升 LLM 的稳定性和性能. PreNorm 让梯度经残差连接更直接地从输出流回输入, 一定程度上绕过了子层, 因而减小了模型的有效深度. Post Layer Normalization (PostNorm) 把归一化放在残差连接和注意力之后, 保住了有效深度, 但容易梯度消失和爆炸, 训练 LLM 难度很大. 现有 LLM 多用 PreNorm, 因为传统 Transformer 里更宽和更深的网络性能差别往往可以忽略, 训练稳定性被放在首位.

<!-- page 13 of 68 -->

The experiments are performed on models with 9.3 billion activation parameters and a total of 60 billion parameters, each consisting of 48 layers that employ different normalization methods. Both models are trained on 500 billion tokens. For PostNorm, we utilize DeepNorm (Wang et al., 2024a) to ensure more stable training. As illustrated in Table 5, PostNorm consistently outperforms PreNorm across all evaluated metrics.

实验在激活 93 亿, 总参数 600 亿的模型上进行, 两个模型都是 48 层, 只有归一化方式不同, 都训练 5000 亿 token. PostNorm 一方用 DeepNorm 保证训练更稳. 表 5 显示 PostNorm 在所有评测指标上都优于 PreNorm.

Table 5 | Module Ablations. Abbreviations: BBH (BIG-Bench Hard), DROP (Discrete Reasoning Over Paragraphs), MMLU (Massive Multitask Language Understanding), CMMLU (Massive Multitask Language Understanding in Chinese), GSM8k (Grade School Math 8K), ARC-C (Arc-Challenge), WG (WinoGrande).

表 5 | 模块消融. 缩写: BBH (BIG-Bench Hard), DROP (段落离散推理), MMLU (大规模多任务语言理解), CMMLU (中文版 MMLU), GSM8k (小学数学 8K), ARC-C (Arc-Challenge), WG (WinoGrande).

| Arch. | BBH ↑ | DROP ↑ | MMLU ↑ | CMMLU ↑ | MATH ↑ | GSM8k ↑ | ARC-C ↑ | WG ↑ |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Softmax | 28.2 | 27.4 | 49.3 | 47.3 | 4.6 | 18.8 | 46.4 | 65.6 |
| Hybrid-lightning | 32.2 | 29.0 | 49.5 | 46.0 | 6.8 | 18.5 | 47.4 | 67.5 |
| Pre Layer Norm. | 29.9 | 26.8 | 43.9 | 41.8 | 4.8 | 12.2 | 43.5 | 65.5 |
| Post Layer Norm. | 32.6 | 27.6 | 50.2 | 49.2 | 5.7 | 16.8 | 46.2 | 65.4 |

### 2.4. Model Spec (模型规格)

Upon finalizing the architecture of the model’s modules, the subsequent step entails scaling up the model, which necessitates a meticulous design of the model’s hyperparameters across various dimensions. Our primary goal is to strike a balance between performance and inference efficiency. Single-device inference offers superior efficiency compared to multi-device implementations by eliminating cross-machine communication overhead. Consequently, we constrain the model’s total parameters to 500B, ensuring compatibility with single-node inference on an 8×80G configuration for sequences up to 1M tokens under 8-bit quantization. Given our limited training budget, we formulate the following optimization problem to determine optimal parameter allocations:

模块架构定下之后, 下一步是把模型做大, 这需要在多个维度上仔细设计超参数. 首要目标是平衡性能和推理效率. 单设备推理免去跨机通信开销, 比多设备效率更高. 因此作者把总参数限制在 500B 以内, 保证在 8 bit 量化下, 8×80G 单节点能推理最长 1M token 的序列. 训练预算有限, 作者把参数分配写成下面的优化问题:

> **拆开:** 456B 参数用 8 bit 存就要约 456GB, 8×80G 只有 640GB, 1M token 的上下文还放得下吗?
> 按第 2 节规格估算: 80 层里只有 10 层 softmax attention 需要随长度增长的 KV cache, GQA 组大小 8 意味着 64 个头共享 8 组 key 和 value, 1M token 下为 2 × 8 × 128 × 10 × 1e6 ≈ 205 亿个元素, bf16 约 41GB, 8 bit 约 20GB; 70 层 lightning attention 的状态只有 70 × 64 × 128 × 128 ≈ 7300 万个元素. 合计约 460 到 500GB, 在 640GB 之内, 式 (13) 里 $P_{\text{all}} < 500B$ 的约束正是这样来的.

$$
\min _ {P _ {\text {all}}, P _ {\text {act}}} L \left(P _ {\text {all}}, P _ {\text {act}}, T\right) \quad \text {subject to} \quad C _ {\text {compute}} \left(P _ {\text {all}}, P _ {\text {act}}, T\right) <   C \quad \text {and} \quad P _ {\text {all}} <   5 0 0 B,\tag{13}
$$

where 𝐿 denotes the loss, $P _ { \mathrm { a l l } }$ and $P _ { \mathrm { a c t } }$ represent the total and activation parameter counts respectively, 𝑇 is the number of training tokens, $C _ { \mathsf { c o m p u t e } }$ denotes the computational costs (dependent on parameter counts and data consumption), and 𝐶 signifies the budget constraint.

其中 L 是 loss, $P_{\mathrm{all}}$ 和 $P_{\mathrm{act}}$ 分别是总参数量和激活参数量, T 是训练 token 数, $C_{\mathsf{compute}}$ 是计算成本 (取决于参数量和数据消耗), C 是预算约束.

Through comparative experiments on small-scale models, we first establish optimal ranges for several key variables: (1) the mixing ratio between softmax and linear attention mechanisms; (2) the depth-to-width ratio of the model architecture; (3) the ratio of linear attention memory size to hidden size; (4) the ratio of activated FFN to attention; (5) the proportion of dimensions utilizing RoPE for softmax attention.

通过小模型对比实验, 作者先确定几个关键变量的最优范围: (1) softmax 与线性注意力的混合比例; (2) 模型的深宽比; (3) 线性注意力记忆大小与隐藏维度之比; (4) 激活的 FFN 与注意力之比; (5) softmax attention 中使用 RoPE 的维度比例.

Our experiments reveal that the hybrid architecture demonstrates particular sensitivity to layer depth, with deeper models consistently outperforming shallower counterparts. Notably, shallow models require substantially more softmax attention layers to achieve comparable performance, underlining the efficiency advantages of deeper architectures. We also observe that increasing linear attention memory size significantly enhances model performance, and implementing RoPE on half of the softmax attention dimensions enables length extrapolation without performance degradation.

实验显示, 混合架构对层数特别敏感, 更深的模型总是优于更浅的. 浅模型要多用不少 softmax attention 层才能达到相当的性能, 这说明深架构更高效. 增大线性注意力的记忆大小能明显提升性能; 在一半的 softmax attention 维度上施加 RoPE, 可以做长度外推而不掉性能.

<!-- page 14 of 68 -->

Based on these optimized architectural variables, we employ established scaling laws (Clark et al., 2022; Hoffmann et al., 2022) to determine the optimal model size. We train models with activation parameters ranging from 44 million to 1.2 billion across 500 billion tokens, utilizing 16, 32, and 64 experts. However, we find the predictions from these methods become less reliable when extrapolating to a larger model with 9.3 billion parameters. To address this limitation and achieve more accurate predictions, we propose the following formula:

在这些优化后的架构变量基础上, 作者用已有的 Scaling Laws 确定最优模型规模. 训练了激活参数从 4400 万到 12 亿, 专家数为 16, 32, 64 的模型, 各训练 5000 亿 token. 但这些方法外推到 93 亿参数的更大模型时, 预测变得不太可靠. 为得到更准的预测, 作者提出下式:

$$
L (P _ {\mathrm{act}}, T | E) = d + a P _ {\mathrm{act}} ^ {\alpha} + b T ^ {\beta} + c (P _ {\mathrm{act}} T) ^ {\gamma},\tag{14}
$$

where $L ( P _ { \mathrm { a c t } } , T | E )$ represents the loss conditioned on the number of experts, while 𝑎, 𝑏, 𝑐, 𝑑, 𝛼, 𝛽, and 𝛾 are parameters to be fitted in relation to the number of experts. Based on the predictions of Eq. 13 and Eq. 14, we have identified a candidate model with 45.9 billion activation parameters and 456 billion total parameters as the optimal configuration.

其中 $L(P_{\mathrm{act}}, T | E)$ 是以专家数为条件的 loss, a, b, c, d, α, β, γ 是随专家数拟合的参数. 依据式 13 和式 14 的预测, 作者确定激活 459 亿, 总参数 4560 亿的候选模型为最优配置.

> **问:** 式 (14) 是按 16, 32, 64 三种专家数分别拟合的, 最终选 32 个专家, 这个选择在文中有数字支撑吗?
> 式 (14) 把 E 放在条件里, 意思是每个专家数各有一组 a, b, c, d, α, β, γ, 但第 2.4 节没有印出任何一组拟合值, 也没有给出 16, 64 专家对应的预测 loss. 读者能核对的只有结论 「45.9B 激活, 456B 总参数」 和式 (13) 的 500B 上限; 32 这个专家数怎样胜出, 本文没有给出可复算的依据.

## 3. Computation Optimization (计算优化)

In this section, we present our computation part, including the training and inference. In this project, we have a dynamically changing GPU cluster, where the number of H800 GPUs ranges from 1500 to 2500. An efficient architecture necessitates robust implementation optimization to fully harness its computational benefits at scale. To scale our novel architecture to the requisite size, we present three key optimization strategies that primarily address the following three challenges:

本节介绍计算部分, 包括训练和推理. 项目使用的 GPU 集群规模是动态变化的, H800 数量在 1500 到 2500 张之间. 高效的架构需要扎实的实现优化, 才能在大规模上把计算优势发挥出来. 为了把新架构放大到所需规模, 作者提出三项关键优化, 分别对应以下三个难题:

1. Mitigating the all-to-all (a2a) communication overhead during the training of a Mixture of Experts (MoE) architecture is a persistent challenge. The configuration we choose for our experts, specifically opting for large models, imposes substantial demands on GPU memory. Therefore, the primary challenge lies in achieving an optimal equilibrium between memory utilization, computational efficiency, and the overhead associated with all-to-all communication.

1. 压低 MoE 训练中的 all-to-all (a2a) 通信开销是个老难题. 作者选定的专家配置偏大, 对显存要求很高. 所以首要难题是在显存占用, 计算效率和 all-to-all 通信开销之间找到最优平衡.

2. As we endeavor to support at least 1 million token context window in both training and inference, the accurate distribution of tokens within such an extensive context window across different GPUs becomes imperative for this colossal model. This necessity, however, inevitably introduces additional communication overhead. As a result, devising strategies to minimize this overhead, particularly in the context of our hybrid architecture, presents a significant challenge.

2. 训练和推理都要支持至少 100 万 token 的上下文窗口, 对这样的巨型模型来说, 必须把这么长上下文里的 token 准确地分布到不同 GPU 上, 这不可避免地带来额外通信开销. 如何把这部分开销压下去, 在混合架构下尤其困难.

3. The current implementation of the lightning attention mechanism is specifically optimized for training processes. However, in the inference scenario, the challenge arises in effectively managing real-world batched inputs, which may encompass variable sequence lengths and specific inputs that incorporate prefix caching.

3. 现有的 lightning attention 实现专为训练优化. 推理时的难题是如何有效处理真实的批量输入: 序列长度各不相同, 有的输入还带前缀缓存.

It is noteworthy that the existing open-source frameworks in the industry currently lack the necessary mature technical support to adequately address these challenges. Thus, we independently and comprehensively reinvent our distributed training and inference framework, thereby successfully addressing these challenges with the desired level of efficiency.

值得一提的是, 业内现有开源框架还缺少成熟的技术支持来解决这些难题. 因此作者自主地全面重做了分布式训练和推理框架, 以期望的效率解决了上述问题.

### 3.1. MoE Optimization (MoE 优化)

The primary objective in optimizing the MoE architecture is to minimize communication overhead, particularly for MoE models that utilize all-to-all (a2a) communication. To address this, We implement a token-grouping-based overlap scheme, as illustrated in Figure 9. In this scheme, the a2a communication is performed within the expert parallel (EP) communication group, and it overlaps with the processing of tokens from different expert groups. To ensure the correctness of the communication results, we restrict each ProcessGroup to execute communication operators sequentially. As a result, a2a communications across different groups cannot overlap, leading to the emergence of idle time.

MoE 优化的首要目标是压低通信开销, 对使用 all-to-all (a2a) 通信的 MoE 模型尤其如此. 为此作者实现了基于 token 分组的重叠方案, 见图 9. 方案中 a2a 通信在专家并行 (EP) 通信组内进行, 与其他专家组 token 的处理相互重叠. 为保证通信结果正确, 每个 ProcessGroup 只能顺序执行通信算子. 这样一来, 不同组的 a2a 通信无法重叠, 会出现空闲时间.

<!-- page 15 of 68 -->

This approach leads to significant performance improvements. However, upon more detailed analysis, we identified a critical tradeoff specific to the expert configuration of the MiniMax-Text-01 model. When Tensor Parallelism (TP) is employed to partition the expert parameters, the computational intensity becomes excessively low, thereby hindering the efficiency of the computation. However, opting not to use TP leads to an excessively large parameter count, which necessitates the activation of a larger Pipeline Parallelism (PP) configuration. The challenge emerges because PP does not reduce the memory footprint required for storing activations. This limitation is particularly detrimental for training models with long contexts, as the increase in memory consumption does not provide proportional benefits in terms of computational efficiency or training speed. Consequently, it is imperative to develop a new parameter partitioning strategy that adeptly balances memory usage and computational intensity to optimize the training process for our specific model and task.

这种做法带来明显的性能提升. 但细致分析后, 作者发现 MiniMax-Text-01 的专家配置有一个关键的取舍. 用张量并行 (TP) 切分专家参数时, 计算强度过低, 拖累计算效率. 不用 TP, 参数量又太大, 只能开更大的流水并行 (PP). 问题在于 PP 并不减少存放激活值所需的显存. 这对长上下文训练尤其不利: 显存消耗增加, 计算效率和训练速度却没有相应提高. 所以必须设计一种新的参数切分策略, 巧妙平衡显存占用和计算强度, 针对本模型和任务优化训练过程.

![图 9 EP 重叠示意: 不重叠时 a2a-dispatch, expert, a2a-combine 串行; token 分成两组后, 两台设备的计算与通信错开, 中间仍有空闲格](images/p15-figure-9-expert-parallel-ep-overlap-illustration-chunk.png)

Figure 9 | Expert Parallel (EP) Overlap Illustration. Chunk tokens into 2 groups thus computation can overlap with communication between different groups.

图 9 | 专家并行 (EP) 重叠示意. 把 token 分成 2 组, 这样一组的计算可以与另一组的通信重叠.

To achieve enhanced efficiency, we first introduce a novel ProcessGroup, termed ETP (Expert Tensor Parallel), which is specifically designed to manage the weight partitioning of experts. Concurrently, we propose another distinct ProcessGroup, named EDP (Expert Data Parallel), to encapsulate the data parallelism of identical experts. In our system, we define the total number of GPUs involved in training as 𝑤𝑜𝑟𝑙𝑑\_𝑠𝑖𝑧𝑒. The system must satisfy two key conditions:

为了提高效率, 作者先引入一个新的 ProcessGroup, 叫 ETP (专家张量并行), 专门管理专家权重的切分; 同时提出另一个 ProcessGroup, 叫 EDP (专家数据并行), 封装相同专家之间的数据并行. 系统中参与训练的 GPU 总数记为 world_size, 需要满足两个条件:

$$
w o r l d \_ s i z e = s i z e _ {P P} \times s i z e _ {D P} \times s i z e _ {C P} \times s i z e _ {T P}\tag{15}
$$

and

$$
w o r l d \_ s i z e = s i z e _ {P P} \times s i z e _ {E D P} \times s i z e _ {E T P} \times s i z e _ {E P}\tag{16}
$$

This configuration empowers the MoE component with the flexibility to define the distribution of experts, manage the weight partitioning of experts, and independently configure the ZeRO (Zero Redundancy Optimizer) algorithm (Rajbhandari et al., 2020). Based on this implementation, we are able to completely decouple the parallel strategies of the MoE components from those of the non-MoE components.

这种配置让 MoE 部分可以灵活地决定专家的分布, 管理专家权重的切分, 并独立配置 ZeRO (零冗余优化器) 算法. 基于这一实现, MoE 部分的并行策略可以与非 MoE 部分完全解耦.

Building upon this modification, we can flexibly configure the ETP to achieve an optimal balance between memory usage and computational intensity. Furthermore, to mitigate communication overhead, we design an EP-ETP overlap strategy. This strategy aims to maximize the utilization of both network resources and computational resources, as illustrated in Figure 10 (a).

在此基础上, 可以灵活配置 ETP, 在显存占用和计算强度之间取得最优平衡. 为了降低通信开销, 作者还设计了 EP-ETP 重叠策略, 尽量把网络资源和计算资源都用满, 见图 10 (a).

Since communications within the same process group must be executed sequentially, extended periods of computation not only facilitate overlap with a greater number of communications but also create additional opportunities for communications across different process groups to overlap, leading to enhanced overall performance as illustrated in Figure 10 (b).

同一个进程组内的通信必须顺序执行, 计算时间长一些, 不仅能与更多通信重叠, 也为不同进程组之间的通信重叠创造更多机会, 整体性能随之提升, 见图 10 (b).

When determining the number of groups, several trade-offs must be considered. Theoretically, only by dividing the workload into a sufficiently large number of groups can we achieve ample overlap between communication and computation, as illustrated in Figure 10 (c). However, in practice, an excessive number of groups can significantly increase the complexity of scheduling and introduce the risk of becoming CPU-bound. Given that the proportion of ETP (Expert Tensor Parallel) in the overall MoE (Mixture of Experts) architecture is not substantial, it is crucial to make adjustments based on the specific context and requirements.

确定分组数时有几个取舍. 理论上, 只有把工作量分成足够多的组, 通信和计算才能充分重叠, 见图 10 (c). 但实际中组数太多会明显增加调度复杂度, 还有变成 CPU 瓶颈的风险. 由于 ETP 在整个 MoE 架构中所占比例不大, 需要根据具体情况和需求调整.

<!-- page 16 of 68 -->

![图 10 EP-ETP 重叠示意: (a) 计算占比低时四组流水, (b) 计算占比高时重叠更充分, (c) 只分两组时出现红色的浪费时间](images/p16-figure-10-ep-etp-overlap-illustration-a-ep-etp-overlap.png)

Figure 10 | EP-ETP Overlap Illustration. (a) EP-ETP overlap with the lower computation portion. (b) EP-ETP overlap with the higher computation portion. (c) EP-ETP overlap with fewer groups. Compared with (a) and (b), it shows that if the compute time cost is longer, the efficiency will be better. Comparing with (b) and (c), it shows that fewer groups will lead to insufficient overlap.

图 10 | EP-ETP 重叠示意. (a) 计算占比较低时的 EP-ETP 重叠. (b) 计算占比较高时的 EP-ETP 重叠. (c) 组数较少时的 EP-ETP 重叠. 比较 (a) 和 (b) 可见, 计算耗时越长, 效率越好; 比较 (b) 和 (c) 可见, 组数少会导致重叠不足.

Through the aforementioned optimization strategies, we achieve a balanced configuration of storage and computational intensity for the specific expert specifications in the MoE (Mixture of Experts) structure of the MiniMax-Text-01 model. Furthermore, based on these optimizations, we reduce the pure communication overhead of the MoE component by 50% compared to the pre-optimization state, resulting in a significant improvement in training efficiency.

通过上述优化, 作者针对 MiniMax-Text-01 的 MoE 结构中的具体专家规格, 做到了存储与计算强度的平衡配置. 在此基础上, MoE 部分的纯通信开销比优化前降低 50%, 训练效率明显提升.

### 3.2. Long Context Optimization (长上下文优化)

A significant challenge in long context training is that real training samples are difficult to standardize into a uniform length. The conventional approach of using padding to make samples the same length leads to substantial computational waste. In the context of training at the 1M sequence length scale, this waste becomes particularly significant. To address this issue, we adopt a data formatting technique during training where different samples are concatenated end-to-end along the sequence dimension. We refer to this technique as "data-packing". This format minimizes computational waste during the computation process, thereby conserving computational resources.

长上下文训练的一大难题是, 真实训练样本很难统一成相同长度. 用 padding 把样本补到同样长的常规做法会浪费大量计算, 在 1M 序列长度的训练规模下尤其明显. 为此作者在训练中采用一种数据格式: 把不同样本沿序列维度首尾相接, 称为 「data-packing」. 这种格式把计算中的浪费降到最低, 节省算力.

#### 3.2.1. Varlen Ring Attention (变长 ring attention)

For Softmax Attention, the ring attention algorithm (Liu et al., 2024a) offers an effective method to partition data, thereby enabling unlimited scalability. However, the existing implementations are not optimized to efficiently handle the ring attention mechanism for the data-packing format. In the case of FlashAttention (Dao, 2024), while it provides a varlen (variable length) interface to accommodate the data-packing format, there is no corresponding ring attention implementation available. Regarding TransformerEngine (NVIDIA, 2023), the implementation incorporates a Context Parallel (CP) ProcessGroup to support the ring attention algorithm. However, this approach poses a risk of computational resource waste when dealing with the data-packing format. This is because the algorithm divides each sequence into $2 \times s i z e _ { C P }$ segments and applies the ring attention mechanism to each segment. Consequently, this approach restricts each sequence to a length that must be an integer multiple of $2 \times s i z e _ { C P }$ . In scenarios where the sample distribution is unknown and the CP size is set to a large value, this can lead to significant padding, resulting in the waste of computational resources.

对 softmax attention, ring attention 算法提供了切分数据的有效方法, 可以无限扩展. 但现有实现没有针对 data-packing 格式高效处理 ring attention. FlashAttention 提供了 varlen (变长) 接口来适配 data-packing 格式, 却没有对应的 ring attention 实现. TransformerEngine 的实现引入了 Context Parallel (CP) ProcessGroup 来支持 ring attention, 但处理 data-packing 格式时有浪费算力的风险: 算法把每条序列切成 $2 \times size_{CP}$ 段, 对每段应用 ring attention, 于是每条序列的长度都必须是 $2 \times size_{CP}$ 的整数倍. 样本分布未知且 CP size 设得较大时, 这会导致大量 padding, 浪费算力.

<!-- page 17 of 68 -->

![图 11 ring attention 与 varlen ring attention: (a) 不打包时整块做因果和非因果计算, (b) 打包 3 条不等长样本后, 按各自偏移只算有效的三角和矩形区域](images/p17-figure-11-ring-attention-v-s-varlen-ring-attention-a-no.png)

Figure 11 | Ring Attention v.s. Varlen Ring Attention. (a) No data packing in ring attention. (b) Pack 3 samples with different lengths in varlen ring attention.

图 11 | ring attention 与 varlen ring attention 对比. (a) ring attention 中不做数据打包. (b) varlen ring attention 中打包 3 条不同长度的样本.

Motivated by the principle of not making assumptions about the sample distribution, we redesign the algorithm and name it Varlen Ring Attention. This approach avoids the excessive padding and subsequent computational waste associated with traditional methods by applying the ring attention algorithm directly to the entire sequence after data-packing. Specifically, the implementation involves distinguishing the offset of the attention mask corresponding to each sequence within the ring attention computation. The key modification is to transform the original causal computations into varlen causal computations and similarly convert the non-causal computations into varlen non-causal computations, shown in Figure 11.

作者本着不对样本分布做任何假设的原则重新设计了算法, 称为 varlen ring attention. 它直接对 data-packing 之后的整条序列应用 ring attention, 避免了传统做法的过量 padding 和由此带来的算力浪费. 具体实现是在 ring attention 计算中区分每条序列对应的注意力掩码偏移. 关键改动是把原来的因果计算改成 varlen 因果计算, 非因果计算同样改成 varlen 非因果计算, 见图 11.

#### 3.2.2. Improved Linear Attention Sequence Parallelism (改进的线性注意力序列并行)

For lightning attention, the LASP (Linear Attention Sequence Parallelism) algorithm (Sun et al., 2024) leverages the communication group of CP to facilitate the expansion of long sequences. As illustrated in Figure 12 (a), the LASP algorithm mandates that all CP ranks engage in send-recv operations to exchange intermediate key-value (𝐾𝑉) block results. This requirement imposes a sequential dependency among the CP ranks, thereby compelling the computation to be performed in a serial manner. Consequently, this sequential dependency significantly impedes the overall efficiency of the training process, as the inherent parallelism of the system is not fully exploited.

对 lightning attention, LASP (线性注意力序列并行) 算法借助 CP 通信组来扩展长序列. 如图 12 (a) 所示, LASP 要求所有 CP rank 做 send-recv 来交换中间的 key-value (KV) 块结果. 这在 CP rank 之间形成顺序依赖, 计算只能串行进行. 这种依赖明显拖慢整个训练过程, 系统固有的并行能力没有被充分利用.

To fully harness the parallel computing capabilities of GPU devices, we propose an optimized approach that refines the computational and communication workflow to eliminate dependencies during the computation process. This optimization effectively transforms serial computation into a parallelized one. The enhanced approach, termed LASP+ (Figure 12 (b)), operates as follows:

为了用足 GPU 的并行计算能力, 作者提出一种优化方案, 调整计算和通信流程, 消除计算过程中的依赖, 把串行计算变成并行. 改进后的方案称为 LASP+ (图 12 (b)), 流程如下:

1. Local Prefix Sum Calculation: Each computing node $i . e . ,$ the CP rank, initiates the process by independently calculating its local prefix sum, denoted as $K V _ { L }$

1. 本地前缀和计算: 每个计算节点, 即每个 CP rank, 先独立计算自己的本地前缀和, 记为 $KV_L$.

<!-- page 18 of 68 -->

block size padding

init 𝐾𝑉 = 𝐾<sub>0</sub>𝑉<sub>0</sub> with zeros shape [𝑑, 𝑑]

init diag with decay shape [𝑑, 𝑑]

Initialize Phase

以上四行是图 12 里的图内文字 (按块长补齐; 把 KV 初始化为 d × d 的零矩阵; 初始化带衰减的对角矩阵; 初始化阶段), 被转写成了正文.

![图 12 顶部: 输入序列形状从 s, h, d 转成 h, s, d, 末尾斜线格是按块长补齐的部分](images/p18-image.png)

![图 12 LASP 与 LASP+ 对比: (a) LASP 中各 CP rank 依次 send 和 recv 前缀和 KV, 串行推进; (b) LASP+ 先算本地前缀和 KV_L, AllGather 之后各自拼出全局前缀和 KV_G](images/p18-figure-12-difference-of-lasp-algorithm-and-lasp.png)

Figure 12 | **Difference of LASP Algorithm and LASP+ Algorithm.** (a) LASP Algorithm. 1. Initializa tion Phase: initializing KV to zero and the diagonal decay matrix. 2. Data Partitioning and Padding: partitioning the Q, K, and V matrices along the sequence dimension into CP size (4 segments illustrated in the figure) blocks, dividing each block into smaller blocks based on the BlockSize 𝐵 and padding the remaining part (e.g. Q7, K7, V7) that cannot be divided evenly by 𝐵. 3. Intra-block Computation: performing intra-block of each CP rank computations in parallel. 4. Inter-block Computation and Communication: starting from CP rank 0, computing the inter-block portion of the current $Q _ { i }$ with all previous KV blocks and the prefix sum 𝐾<sub>𝑖</sub>𝑉<sub>𝑖</sub>. Different CP ranks communicate data through send-recv operations. (b) LASP+ Algorithm. Building upon figure (a), each CP rank computes the local prefix sum $K V _ { L }$ and performs AllGather operation to synchronize, then selects the local prefix sum $K V _ { L }$ to compute the global prefix sum $K V _ { G }$ . The remaining computational components are same as (a).

图 12 | LASP 算法与 LASP+ 算法的区别. (a) LASP 算法. 1. 初始化阶段: 把 KV 初始化为零, 并初始化对角衰减矩阵. 2. 数据切分与补齐: 沿序列维度把 Q, K, V 切成 CP size 块 (图中为 4 段), 每块再按块大小 B 切成更小的块, 不能被 B 整除的剩余部分 (如 Q7, K7, V7) 做 padding. 3. 块内计算: 各 CP rank 并行做块内计算. 4. 块间计算与通信: 从 CP rank 0 开始, 用当前 $Q_i$ 与之前所有 KV 块及前缀和 $K_iV_i$ 计算块间部分, 不同 CP rank 之间用 send-recv 通信. (b) LASP+ 算法. 在 (a) 的基础上, 每个 CP rank 先算本地前缀和 $KV_L$, 做 AllGather 同步, 再选取相应的本地前缀和 $KV_L$ 计算全局前缀和 $KV_G$. 其余计算与 (a) 相同.

<!-- page 19 of 68 -->

2. Global Synchronization via AllGather: Following the local calculations, an AllGather operation is performed to synchronize the information from all nodes globally. This step ensures that each node has access to the necessary data from all other nodes.

2. 通过 AllGather 全局同步: 本地计算完成后, 做一次 AllGather, 把所有节点的信息全局同步, 保证每个节点都拿到其他节点的必要数据.

3. Prefix Sum Computation: Each node selects the specific CP rank’s $K V _ { L }$ on which to perform the prefix sums, a decision based on its assigned computation order.

3. 前缀和计算: 每个节点按分配给自己的计算顺序, 选取特定 CP rank 的 $KV_L$ 做前缀和.

By implementing these steps, the LASP+ approach effectively removes the original dependencies between the computation nodes. This elimination of dependencies facilitates a fully parallelized computation process, thereby significantly enhancing the overall efficiency and throughput of the system. The transformation from serial to parallel computation not only leverages the full potential of GPU devices but also ensures that the training process can be executed more rapidly and with greater scalability.

通过这几步, LASP+ 消除了计算节点之间原有的依赖, 计算过程可以完全并行, 系统整体效率和吞吐量明显提高. 从串行到并行的转变, 既发挥了 GPU 的全部潜力, 也让训练更快, 扩展性更好.

The proposed modifications, while incurring additional costs in terms of increased total communication volume and temporary memory usage, are unequivocally justified by the substantial performance benefits they confer. These enhancements significantly outweigh the associated overhead in communication and memory consumption.

这些改动会增加总通信量和临时显存占用, 但带来的性能收益足以抵消, 远大于通信和显存上的额外开销.

Through comprehensive testing and verification, it is empirically demonstrated that the computation speed in the LASP+ approach can attain up to $1 / N _ { p c n }$ of the original LASP algorithm, where $N _ { p c n }$ denotes the number of parallel computing nodes. Furthermore, the overhead introduced by the AllGather operation is minimal, which is consistent with our anticipations and underscores the efficacy of the optimization.

全面测试验证表明, LASP+ 的计算速度可以达到原 LASP 算法的 $1/N_{pcn}$, $N_{pcn}$ 为并行计算节点数. AllGather 引入的开销很小, 符合预期, 也说明优化有效.

> **回看:** 「计算速度可以达到原 LASP 的 $1/N_{pcn}$」, 字面意思是速度变慢了, 与前后文说的提升矛盾吗?
> 对照图 12: (a) 中各 CP rank 的块间计算要沿 send 和 recv 箭头逐个等待, (b) 中 AllGather 之后各 rank 同时计算. 所以这里的 $1/N_{pcn}$ 应理解为耗时降到原来的 $1/N_{pcn}$, 也就是最多快 $N_{pcn}$ 倍, 原文把 「时间」 写成了 「速度」.

Building upon the LASP+ framework, we further introduce support for the varlen feature to effectively manage the data-packing data structure. This enhancement is particularly beneficial for handling batched samples that comprise inputs with unequal token lengths. The process involves the following steps: 1). Padding to Block Size: Each input within the batch is padded to ensure that its length is a multiple of the predefined block size, which is set to 256. This padding step is crucial for aligning the data structure with the computational requirements of the kernel. 2). Sequential Concatenation: After padding, the inputs are sequentially concatenated. This concatenation facilitates the use of a single kernel to perform parallel computations across multiple batches. By organizing the data in this manner, we can efficiently leverage the parallel processing capabilities of the GPU, thereby optimizing computational performance.

在 LASP+ 框架上, 作者进一步支持 varlen 特性, 以处理 data-packing 的数据结构, 这对包含不等长输入的批量样本特别有用. 流程如下: 1). 补齐到块大小: batch 内每个输入都补到预设块大小 256 的整数倍, 让数据结构与 kernel 的计算要求对齐. 2). 顺序拼接: 补齐后把各输入依次拼接起来, 这样一个 kernel 就能对多个 batch 并行计算. 以这种方式组织数据, 可以高效利用 GPU 的并行处理能力, 优化计算性能.

The integration of the varlen feature with the LASP+ framework ensures that the system can handle diverse input lengths without compromising on efficiency. This approach not only simplifies the computational workflow but also maximizes resource utilization by enabling the processing of multiple batches concurrently.

把 varlen 特性集成进 LASP+ 框架, 系统就能在不牺牲效率的前提下处理各种输入长度. 这种做法简化了计算流程, 也通过并发处理多个 batch 把资源利用率提到最高.

### 3.3. Lightning Attention Inference Optimization (lightning attention 推理优化)

The initial implementation of the lightning attention mechanism is primarily research-oriented and not yet suitable for practical applications, especially for inference. However, the optimization of inference processes is of paramount importance in real-world scenarios, as the long-term cost of deploying a trained model is predominantly determined by the efficiency of its inference. To this end, we implement four optimization strategies for lightning attention: batched kernel fusion, separated prefill and decoding execution, multi-level padding, and strided batched matmul extension.

lightning attention 的最初实现主要面向研究, 还不适合实际应用, 尤其是推理. 而真实场景中推理优化至关重要, 因为部署一个训练好的模型, 长期成本主要取决于推理效率. 为此作者对 lightning attention 实施了四项优化: 批量 kernel 融合, 预填充与解码分开执行, 多级补齐, 以及 strided batched matmul 扩展.

<!-- page 20 of 68 -->

#### 3.3.1. Batched Kernel Fusion (批量 kernel 融合)

We fuse multiple memory-bound kernels and extend support to accommodate all batch inputs. In the prefill phase, we perform a kernel fusion for processing the 𝑄, 𝐾, and 𝑉 tensors, including padding in the sequence dimension, partitioning into blocks, adjusting the internal layout, and computing the decay values. In the decoding phase, we perform a kernel fusion for the computation of 𝐾𝑉 and the updating of the prefix 𝐾𝑉 cache. These kernel fusions reduce intermediate result storage and memory access operations, thereby significantly improving memory access efficiency and reducing end-to-end latency by 10% in the decoding phase and short-text input scenarios. By the way, these optimizations can bring very noticeable benefits on H20 compared to H800.

作者融合了多个访存受限的 kernel, 并扩展到支持所有批量输入. 预填充阶段, 对 Q, K, V 张量的处理做 kernel 融合, 包括序列维度上的 padding, 分块, 调整内部布局和计算衰减值. 解码阶段, 对 KV 的计算和前缀 KV cache 的更新做 kernel 融合. 这些融合减少了中间结果的存储和访存操作, 明显提高访存效率, 在解码阶段和短文本输入场景下把端到端延迟降低 10%. 另外, 这些优化在 H20 上的收益比 H800 明显得多.

#### 3.3.2. Separated Prefill and Decoding Execution (预填充与解码分开执行)

The implementation of the lightning attention mechanism for long sequence computations primarily revolves around the differentiation between intra-block and inter-block computations. However, this approach is not optimal for inference tasks, particularly in the decoding phase, where the token length is consistently equal to 1.

lightning attention 做长序列计算时, 实现上主要围绕块内与块间计算的区分. 这种做法对推理并不理想, 尤其是解码阶段, token 长度恒为 1.

Given that the computational kernel for tokens of length 1 is predominantly memory-bound and necessitates only a limited number of GPU Streaming Multiprocessors (SMs), we propose a strategy that segregates the processing of tokens with a length of 1 from those with a length greater than 1. This is achieved by employing two distinct kernels. Subsequently, we utilize two separate CUDA streams to schedule these kernels in parallel, thereby enhancing computational efficiency and ensuring balanced GPU utilization, especially in scenarios involving mixed inputs.

长度为 1 的 token 的计算 kernel 以访存受限为主, 只需要少量 GPU 流式多处理器 (SM). 作者因此把长度为 1 的 token 与长度大于 1 的 token 分开处理, 用两个不同的 kernel, 再用两个独立的 CUDA stream 并行调度, 提高计算效率, 让 GPU 利用更均衡, 混合输入的场景下尤其如此.

For instance, in a batch size of 20, where all inputs contain a prefix key-value (KV) cache, and the scenario includes one or two inputs with a token length of 50 while the remaining inputs have a token length of 1, this approach can significantly reduce latency. Specifically, the latency can be approximately equivalent to that of processing only the longer inputs, demonstrating a reduction from 100 milliseconds to 50 milliseconds.

例如 batch size 为 20, 所有输入都带前缀 KV cache, 其中一两个输入的 token 长度为 50, 其余都是 1. 这种情况下该做法能明显降低延迟, 大致相当于只处理较长输入的延迟, 从 100 毫秒降到 50 毫秒.

#### 3.3.3. Multi-level Padding (多级补齐)

By applying padding to the 𝑄, 𝐾, 𝑉 tensors along the sequence dimension, the intra-block and interblock components can be effectively decomposed into multiple identical matrix multiplications. This decomposition is particularly advantageous as it aligns seamlessly with the StrideBatchedMatmul interface, thereby facilitating the maximization of parallel processing capabilities.

沿序列维度对 Q, K, V 张量做 padding 后, 块内和块间部分都能分解成多个相同的矩阵乘法. 这种分解正好对上 StrideBatchedMatmul 接口, 便于把并行处理能力用到最大.

Initially, the block size for padding was set to 256, a configuration that was consistent with the training parameters. However, upon the implementation of the prefix cache technique, it is observed that the token lengths within a batch typically fall below 256. This discrepancy led to redundant computations within each matrix multiplication operation. To address this inefficiency and minimize unnecessary computations, we propose the introduction of additional segmentation options, specifically 32, 64, and 128.

padding 的块大小最初设为 256, 与训练参数一致. 但引入前缀缓存后, 作者发现一个 batch 里的 token 长度通常不到 256, 导致每次矩阵乘法里都有冗余计算. 为减少不必要的计算, 作者增加了几档切分选项: 32, 64 和 128.

This multi-level padding approach enables the dynamic selection of the computational scale that incurs the minimal padding overhead, based on the current input sequence length. By adopting this approach, the utilization of computational resources is optimized, ensuring that the system operates with increased efficiency and reduced redundancy. This strategic adjustment not only conserves computational resources but also contributes to the overall performance enhancement of the system.

多级补齐可以根据当前输入序列长度, 动态选择 padding 开销最小的计算规模. 这样计算资源利用更充分, 系统运行效率更高, 冗余更少. 这一调整既节约算力, 也提升了系统整体性能.

<!-- page 21 of 68 -->

#### 3.3.4. StridedBatchedMatmul Extension (StridedBatchedMatmul 扩展)

We utilize the optimized function cublasGemmStridedBatchedEx from the NVIDIA cuBLAS Library to manage StridedBatchedMatmul operations, thereby ensuring both high performance and versatility across diverse hardware architectures. Concurrently, we are in the process of implementing a more extensive kernel fusion strategy, with the objective of substantially improving the computational efficiency of Hopper GPUs.

作者使用 NVIDIA cuBLAS 库中优化过的函数 cublasGemmStridedBatchedEx 来处理 StridedBatchedMatmul 运算, 兼顾高性能和在不同硬件架构上的通用性. 同时正在实现更大范围的 kernel 融合策略, 目标是大幅提升 Hopper GPU 上的计算效率.

Given that our sequence partitioning block size is configured to 256, the associated General Matrix-Matrix Multiplication (GEMM) operations, which involve matrices of dimensions 256x256, can leverage warpgroup-wide WGMMA instructions for computation. To further enhance memory access efficiency, we integrate the asynchronous operations of the Tensor Memory Accelerator (TMA) and delegate certain preprocessing and postprocessing computational tasks to be executed asynchronously on the CUDA Cores.

序列切分的块大小设为 256, 相应的通用矩阵乘 (GEMM) 涉及 256x256 的矩阵, 可以用 warpgroup 级的 WGMMA 指令计算. 为进一步提高访存效率, 作者集成了张量内存加速器 (TMA) 的异步操作, 并把部分前处理和后处理计算交给 CUDA Core 异步执行.

Ultimately, our goal is to dynamically regulate the number of pipeline stages to adaptively attain optimal performance across both H20 and H800 GPU architectures. This adaptive control mechanism will ensure that the system can efficiently handle varying workloads and hardware configurations, thus maximizing overall computational throughput and resource utilization.

最终目标是动态调节流水级数, 在 H20 和 H800 两种 GPU 架构上自适应地达到最优性能. 这种自适应控制让系统能高效应对不同的负载和硬件配置, 把整体计算吞吐和资源利用率提到最高.

By implementing the aforementioned optimizations, we achieve a Model Flops Utilization (MFU) exceeding 75% on the H20 GPU for end-to-end inference tasks (Chowdhery et al., 2023). Specifically, in our MiniMax-Text-01 and MiniMax-VL-01 inference, when considering the latency ratio between the attention operation and the Feed-Forward Network (FFN) operation within the MoE structure, the softmax attention constitutes 95% of the latency at a sequence length of 1,024,000 tokens. In contrast, the lightning attention implementation contributes to less than 12% of the latency under the same conditions.

实施上述优化后, H20 GPU 上端到端推理任务的模型算力利用率 (MFU) 超过 75%. 具体到 MiniMax-Text-01 和 MiniMax-VL-01 的推理, 看 MoE 结构里注意力运算和前馈网络 (FFN) 运算的延迟占比: 序列长度 1,024,000 token 时, softmax attention 占延迟的 95%; 同样条件下, lightning attention 的实现占延迟不到 12%.

Our lightning attention implementation exhibits remarkable efficiency in managing heterogeneous batch inputs, which are characterized by diverse sequence lengths. This efficiency is particularly evident in scenarios where some inputs incorporate the prefix caching strategy while others do not. The reduction in latency not only enhances the overall speed of the inference process but also ensures that the system can handle a wide range of input types with minimal performance degradation. This adaptability underscores the robustness and versatility of our lightning attention approach in real-world applications.

本文的 lightning attention 实现在处理异构批量输入 (序列长度各不相同) 时效率很高, 有的输入用前缀缓存, 有的不用, 这种场景下尤其明显. 延迟降低不仅加快了推理, 也让系统能以极小的性能损失处理各种类型的输入, 体现了这套 lightning attention 方案在实际应用中的稳健和通用.

## 4. Pre-Training (预训练)

In this section, we provide an overview of the pre-training methodology for MiniMax-Text-01. First, we detail the meticulous construction of our pre-training corpus, with particular emphasis on data quality, standardized formatting, and mixing strategies to maximize model performance. Subsequently, we outline our innovative data experimentation framework, which enables rapid and resource-efficient evaluation of data effectiveness while minimizing computational costs. Lastly, we present an in-depth analysis of the model’s training hyper-parameters and present a hierarchical training approach, which enables context length scaling up to 4 million tokens.

本节概述 MiniMax-Text-01 的预训练方法. 先详细介绍预训练语料的构建, 重点是数据质量, 格式规范和配比策略; 再介绍数据实验框架, 它能以很低的算力快速评估数据的有效性; 最后深入分析模型的训练超参数, 并介绍分层训练方法, 让上下文长度扩展到 400 万 token.

### 4.1. Data (数据)

#### 4.1.1. Pre-training Corpus (预训练语料)

The pre-training corpus for MiniMax-Text-01 encompasses a comprehensive and meticulously curated dataset, incorporating diverse sources including academic literature, books, web content, and programming code. We enhance corpus quality through several strategic dimensions:

MiniMax-Text-01 的预训练语料覆盖面广, 精心整理, 来源包括学术文献, 书籍, 网页内容和程序代码. 作者从以下几个方面提升语料质量:

<!-- page 22 of 68 -->

**Data Quality Enhancement.** Superior data quality is fundamental for Large Language Models. We implement a sophisticated filtering pipeline, combining rule-based cleaning and deduplication procedures aligned with established practices (Penedo et al., 2023, 2024; Rae et al., 2021). To assess document quality at a granular level, we utilize our previous-generation model as the reward labeler (a MoE model with 5B activations and 60B total parameters). Initially, we evaluate multiple quality dimensions including coherence, conciseness, educational value, helpfulness, knowledge richness, and categorical relevance. Through comprehensive analysis, we identify significant correlations among these metrics and ultimately focus on three key dimensions: **knowledge depth**, **practical helpfulness**, and **categorical distribution**, while maintaining other metrics as secondary validation indicators.

**数据质量提升.** 数据质量是大语言模型的根本. 作者实现了一套精细的过滤流水线, 结合基于规则的清洗和去重, 与业内成熟做法一致. 为了细粒度地评估文档质量, 作者用上一代模型 (激活 5B, 总参数 60B 的 MoE) 作为奖励打分器. 最初评估了多个质量维度, 包括连贯性, 简洁性, 教育价值, 有用性, 知识丰富度和类别相关性. 综合分析后发现这些指标之间相关性很强, 最终聚焦三个关键维度: **知识深度**, **实用性** 和 **类别分布**, 其他指标作为次要的验证指标.

> **对一下:** 这里的 「上一代模型」 是激活 5B, 总参数 60B 的 MoE, 它和第 2.3 节消融用的模型是同一个吗?
> 第 2.3 节和表 5 用了两种配置: softmax 对 hybrid-lightning 那组是总参数 28B, 激活 5B; PreNorm 对 PostNorm 那组是总参数 60B, 激活 9.3B. 两者都对不上 「60B 总参数, 5B 激活」. 所以打分器是另一个模型, 文中没有给出它的层数和注意力类型.

**Data Formatting Optimization.** The content from websites and books, once appropriately extracted and cleaned, can naturally be used as high-quality textbooks (Gunasekar et al., 2023) without further formatting. For dialogue and question-answering data, the sequential nature of text inherently captures conversational logic and question-answer relationships. Although humans benefit from additional formatting (e.g., Markdown) for readability and comprehension, we find that heavy formatting can actually diminish data diversity and quality by introducing fixed patterns that constrain the natural variation present in human conversations. Ultimately, to maintain format generalization capabilities and accommodate human preferences in alignment, we implement a nested document format with versatile templates for dialogue and QA data, carefully balancing natural comprehension with structural consistency across various interaction patterns.

**数据格式优化.** 网页和书籍内容经过适当抽取和清洗后, 本身就可以当作高质量教材使用, 不需要再加格式. 对话和问答数据的文本顺序天然体现了对话逻辑和问答关系. 虽然额外的格式 (如 Markdown) 能帮人阅读理解, 作者发现过重的格式反而会降低数据的多样性和质量: 固定模式约束了人类对话里的自然变化. 最终, 为了保持格式泛化能力并在对齐中照顾人类偏好, 作者对对话和问答数据采用嵌套文档格式, 配以灵活多样的模板, 在各种交互模式下兼顾自然理解和结构一致.

• **Data Mixture Investigation.** We develop a sophisticated approach to tuning the data distribution, leveraging our three primary quality metrics. Based on the experiment paradigm detailed in the subsequent section, we discover that while high-scoring content on knowledge depth and helpfulness generally yielded superior performance in capability assessments, completely eliminating lower-scoring content can adversely affect downstream task performance. Therefore, we implement a balanced sampling strategy, beginning with a uniform distribution across the base corpus, and then adjusting sampling weights to favor high-quality content while maintaining sufficient representation of diverse categories.

**数据配比研究.** 作者基于三个主要质量指标, 开发了一套调节数据分布的精细方法. 按下一节介绍的实验范式, 作者发现: 知识深度和有用性得分高的内容通常能带来更好的能力评测结果, 但完全剔除低分内容会损害下游任务表现. 因此作者采用平衡的采样策略: 先在基础语料上均匀分布, 再调整采样权重偏向高质量内容, 同时保证各类别都有足够的代表.

#### 4.1.2. Tokenization (分词)

For tokenization, we employ byte-level Byte Pair Encoding (BPE) (Brown et al., 2020; Shibata et al., 1999), incorporating the pre-tokenizer methodology. We strategically up-sample multilingual content, to enhance the corresponding compression efficiency. The resulting vocabulary size is set to 200K tokens.

分词采用字节级的 Byte Pair Encoding (BPE), 并使用预分词 (pre-tokenizer) 方法. 作者有意对多语言内容上采样, 以提高相应的压缩效率. 最终词表大小为 200K token.

#### 4.1.3. Data Experiment (数据实验)

To systematically evaluate our design choices regarding pre-training data quality, format, and composition, we conduct extensive ablation experiments. These experiments involve training multiple small-scale MoE models using comparable token quantities but varying data characteristics. This approach enables us to isolate and measure the impact of individual data attributes while maintaining computational efficiency.

为了系统评估预训练数据在质量, 格式和组成上的设计选择, 作者做了大量消融实验: 用相近的 token 量, 不同的数据特性训练多个小规模 MoE 模型. 这样能在保持计算效率的同时, 分离并度量单个数据属性的影响.

<!-- page 23 of 68 -->

##### 4.1.3.1 Paradigm (范式)

**Formulation.** We conduct Data Experiments to systematically compare the performance of different model variants. Specifically, we formulate experiments as statistical hypothesis tests that compare evaluation metric distributions between a baseline model and models trained with different data configurations. When testing the effectiveness of a new data corpus D, we formulate our alternative hypothesis as $H _ { 1 } : \mu _ { T _ { \mathcal { D } } } > \mu _ { T _ { \mathrm { b a s e l i n e } } }$ , where $\mu$ represents the weighted average performance metric and 𝑇 denotes the distribution of evaluation values across test samples.

**形式化.** 作者用数据实验系统比较不同模型变体的表现. 具体说, 把实验写成统计假设检验, 比较基线模型和用不同数据配置训练的模型在评测指标分布上的差异. 检验新语料 D 是否有效时, 备择假设写作 $H_1: \mu_{T_{\mathcal{D}}} > \mu_{T_{\mathrm{baseline}}}$, 其中 μ 是加权平均的性能指标, T 是评测值在测试样本上的分布.

**Evaluation.** We carefully design our evaluation norms to ensure meaningful insights. We look at a wide range of multiple-choice benchmarks, discarding choice indices in query formulation and look at the likelihoods of completion. We observe the distributions of sample-wise log-normalized accuracy log $\mathtt { a c c } _ { \mathtt { n o r m } ^ { 2 } }$ , defined as

**评测.** 作者仔细设计评测规范, 以保证得出有意义的结论. 考察大量多项选择基准, 在问题表述中去掉选项编号, 只看各个补全的似然. 观察逐样本的对数归一化准确率 log $\mathtt{acc}_{\mathtt{norm}^2}$ 的分布, 定义如下:

$$
\log \mathrm{acc} _ {\text {norm} ^ {2}} (x) = \log \operatorname{softmax} _ {p ^ {\prime} \left(c \in C _ {x}\right)} \left\{\left(p ^ {\prime} \left(c ^ {*}\right)\right) \right\},
$$

where $\begin{array} { r } { p _ { i } ^ { \prime } ( c )   =   \frac { p _ { i } ( c ) } { \mathrm { b y t e s ( c ) } } } \end{array}$ is the byte-normalized probability of choice 𝑐 for sample 𝑖. We choose byte wise normalization to exclude the effect of tokenizer, while alleviating the disfavor towards longer choices. We conduct extensive experiments to ensure that this metric is stable across training, while maintaining the discriminative power of the metric, which is quantified by the ratio $\Delta _ { \mathrm { o b v i o u s } } / \sigma _ { \mathrm { s e e d } } ,$ where $\Delta _ { \mathrm { o b v i o u s } }$ represents the obvious difference in performance between models and $\sigma _ { \mathsf { s e e d } }$ denotes the standard deviation across different random seeds.

其中 $p_i'(c) = \frac{p_i(c)}{\mathrm{bytes}(c)}$ 是样本 i 中选项 c 按字节归一化的概率. 选择按字节归一化, 是为了排除分词器的影响, 同时减轻对长选项的不利. 作者做了大量实验, 确认这个指标在训练过程中稳定, 同时保持区分力; 区分力用比值 $\Delta_{\mathrm{obvious}}/\sigma_{\mathrm{seed}}$ 衡量, $\Delta_{\mathrm{obvious}}$ 是模型之间明显的性能差距, $\sigma_{\mathsf{seed}}$ 是不同随机种子之间的标准差.

**Experiment Efficiency & Setup.** With such statistical setup, we are able to conduct a power analysis to decide minimal test sample size while maintaining the MDE (Minimal Detectable Effect) at a similar level as our training variance, and guaranteeing 95% confidence level and 80% power for decision making. With the confidence methodologies set, we conduct simple scaling experiments on token amount and the model size, and eventually land at an experiment step of training MoEs of 1B activation and 8B total parameters with 40B tokens of data, where data mixture comprises 20B web documents and 20B data of hypothesis.

**实验效率与设置.** 有了这样的统计设置, 就能做功效分析, 确定最少的测试样本量, 让 MDE (最小可检测效应) 与训练方差处在相近水平, 并保证决策时 95% 置信水平和 80% 统计功效. 置信方法定下后, 作者对 token 量和模型规模做了简单的放大实验, 最终定下实验规格: 训练激活 1B, 总参数 8B 的 MoE, 用 40B token 数据, 其中 20B 为网页文档, 20B 为待检验的数据.

##### 4.1.3.2 Effect of Repetition (重复数据的影响)

The incorporation of repeated data has been empirically demonstrated to introduce several detrimental effects on the model’s performance and generalization capabilities (Hernandez et al., 2022). Consequently, implementing deduplication strategies is essential for optimizing LLM performance. Recent studies (Abdin et al., 2024; Penedo et al., 2024) suggest that repeatedly training high-quality documents can lead to enhanced downstream performance, with certain high-quality domains being trained up to 50 times, where the repetition is measured by MinHash similarity(Broder, 1997; Lee et al., 2022). However, our empirical analysis reveals that their experimental paradigm is inadequate for assessing the impact of repetition, as data efficiency is not consistent throughout the training process.

经验表明, 引入重复数据会对模型的性能和泛化能力带来多种不利影响, 所以去重对优化 LLM 性能必不可少. 近期研究认为, 重复训练高质量文档能提升下游表现, 某些高质量领域甚至训练多达 50 遍, 重复度用 MinHash 相似度衡量. 但作者的实证分析显示, 这些研究的实验范式不足以评估重复的影响, 因为数据效率在整个训练过程中并不恒定.

To achieve better alignment with the results of the full training, we introduce a novel repetitionaware experimental framework. Specifically, we first perform global deduplication on the dataset to remove redundant entries. Then, we down-sample the documents to align the repetition frequency with the requirements of the final training schedule while adhering to the budget constraints of our ablation experiments, different from the previous experimental setups which directly adopted data distributions identical or similar to those used in the final training stage. Our findings indicate that low-quality data suffer a substantial decrease in performance after training for more than two epochs, while high-quality data can be effectively trained for up to four epochs, similar to previous observations (Muennighoff et al., 2023). Notably, the solution derived from the proposed framework yields better alignment with the results obtained using considerably more computational resources. By carefully controlling the repetition and quality of the training data, we achieve a more efficient and effective data mixture, ultimately leading to better model performance.

为了与完整训练的结果更好对齐, 作者提出一种新的重复感知实验框架. 先对数据集做全局去重, 删除冗余条目. 再对文档下采样, 让重复次数与最终训练计划的要求一致, 同时满足消融实验的预算约束; 以往的实验设置则直接采用与最终训练阶段相同或相近的数据分布. 结果显示, 低质量数据训练超过两个 epoch 后性能明显下降, 高质量数据可以有效训练到四个 epoch, 与此前的观察相近. 值得注意的是, 用这个框架得出的方案与用多得多的算力得到的结果更吻合. 通过仔细控制训练数据的重复和质量, 作者得到更高效有效的数据配比, 最终提升了模型性能.

<!-- page 24 of 68 -->

### 4.2. Training Strategy (训练策略)

**Initial Pre-training.** We initialize all model parameters using the Xavier initialization method (Glorot and Bengio, 2010), the scaling factors of DeepNorm (Wang et al., 2024a) are set to $\alpha = ( 2 N ) ^ { 0 . 2 5 }$ and $\beta = ( 8 N ) ^ { - 0 . 2 5 }$ , where 𝑁 denotes the number of layers. We employ the AdamW optimizer (Loshchilov and Hutter, 2019) with $\beta _ { 1 } = 0 . 9 ,   \beta _ { 2 } = 0 . 9 5$ , and the weight decay is set to 0.1. The training sequence length is 8192, and the batch size is progressively scaled from an initial size of 16M to 32M at 69B tokens, to 64M at 790B tokens, and finally to 128M at 4.7T tokens, where it remains until the end of training. The schedule is designed based on the correlation between training loss and the critical batch size (McCandlish et al., 2018). It is argued that training at the critical batch size yields a near-optimal balance between training time and data efficiency (Kaplan et al., 2020). Following this, we fit a power-law relationship between the loss and the critical batch size on data from smaller models, as shown in Figure 13. The batch size is doubled when the corresponding loss is reached.

**初始预训练.** 所有模型参数用 Xavier 初始化, DeepNorm 的系数设为 $\alpha = (2N)^{0.25}$ 和 $\beta = (8N)^{-0.25}$, N 为层数. 优化器用 AdamW, $\beta_1 = 0.9$, $\beta_2 = 0.95$, weight decay 为 0.1. 训练序列长度 8192, batch size 从初始的 16M 逐步增大: 69B token 时到 32M, 790B token 时到 64M, 4.7T token 时到 128M, 此后保持到训练结束. 这个计划依据训练 loss 与临界 batch size 之间的关系设计. 有观点认为, 在临界 batch size 上训练能在训练时间和数据效率之间取得接近最优的平衡. 据此, 作者用小模型的数据拟合 loss 与临界 batch size 的幂律关系, 见图 13. 训练 loss 达到对应值时, batch size 翻倍.

The learning rate schedule begins with a linear warm-up over 500 iterations to a peak value of $2 \times 1 0 ^ { - 4 }$ , followed by training with a constant learning rate for 7.2T tokens. In the latter stages of training, we notice anomalous gradient norm values. This issue is attributed to an excessively high learning rate and we adjusted lr to $1 . 3 \times 1 0 ^ { - 4 }$ for the remaining 3.2T tokens. During the fast decay phase, we train 1T tokens and exponentially decrease the learning rate to $3   \times   1 0 ^ { - 5 }$ . Additionally, the MoE auxiliary loss coefficient is set to 0.01.

学习率先在 500 个迭代内线性预热到峰值 $2 \times 10^{-4}$, 然后以恒定学习率训练 7.2T token. 训练后期出现异常的梯度范数, 原因是学习率过高, 于是在剩余的 3.2T token 上把学习率调到 $1.3 \times 10^{-4}$. 快速衰减阶段训练 1T token, 学习率指数衰减到 $3 \times 10^{-5}$. MoE 辅助损失系数设为 0.01.

> **核对:** 预训练一共用了多少 token? 7.2T, 3.2T, 1T 这三个数该相加还是有重叠?
> 两种读法都说得通: 若 3.2T 是 7.2T 恒定阶段的后段, 总量约 8.2T; 若 3.2T 接在 7.2T 之后, 总量约 11.4T. 本文没有直接印出预训练总 token 数. 能对上的只有 batch size 在 4.7T 处翻到 128M (图 13 标出的 loss 1.58 一档), 说明主训练至少远超 4.7T; 长上下文扩展另加表 6 的 300B + 32B + 26B = 358B.

**Long-Context Extension.** We incrementally expand the model’s training context length to 1M tokens. Due to our architecture’s effective length extrapolation capabilities, the model successfully demonstrates its ability to process sequences up to 4M tokens in the vanilla Needle-In-A-Haystack retrieval task (NIAH) test <sup>2</sup>, despite only being trained on contexts up to 1M tokens, as illustrated in Figure 14.

**长上下文扩展.** 作者把训练上下文长度逐步扩到 1M token. 由于架构的长度外推能力强, 模型虽然只在最长 1M token 的上下文上训练, 却能在标准大海捞针检索测试 (NIAH) 中处理最长 4M token 的序列, 见图 14.

![图 13 训练 loss 与临界 batch size 的幂律拟合: 50M, 150M, 600M 三档模型的点落在 loss 3.2 到 4.4 之间, 外推标出 loss 2.22, 1.98, 1.77, 1.58 分别对应 16M, 32M, 64M, 128M](images/p24-figure-13-the-power-law-fit-for-the-training-loss-and.png)

Figure 13 | The power-law fit for the training loss and the critical batch size, utilizing data from models ranging from 50M to 600M in activated parameters counts. We mark the points where the batch size is doubled with dashed gray lines.

图 13 | 训练 loss 与临界 batch size 的幂律拟合, 用激活参数量 50M 到 600M 的模型数据. 灰色虚线标出 batch size 翻倍的点.

> **再看:** 图 13 用来拟合的点都在什么 loss 区间? 翻倍点又在哪里?
> 图 13 里 50M, 150M, 600M 三档模型的点集中在训练 loss 3.2 到 4.4, 临界 batch size 在 0.3M 到 2M 之间; 四个翻倍点 loss 2.22, 1.98, 1.77, 1.58 全在这段数据之外, 靠红色直线外推得到, 对应的 16M 到 128M 比拟合点大了一到两个数量级. 这条幂律在低 loss 区是否还成立, 图中没有数据验证.

Specifically, we employ a three-stage training procedure to systematically upsample long-context data across diverse length ranges, while preserving the distributional characteristics of critical domains to preserve short-context evaluation performances steady. The details of the training data mixture, RoPE base frequency, and training length are shown in Table 6. We also mix in 10% of high-quality long-context question-answering data with similar length distribution as long-context pre-training data during the last 20% of training cycles in each stage(Parmar et al., 2024). To mitigate potential instabilities resulting from distributional shifts, we utilize linear interpolation of source-specific weights throughout the transitional phase. This method facilitates a gradual and controlled evolution of the data distribution towards the desired target distribution, thereby ensuring training stability and preserving convergence properties.

具体说, 作者用三阶段训练流程, 在不同长度区间系统地上采样长上下文数据, 同时保持关键领域的分布特征, 让短上下文评测成绩保持稳定. 训练数据配比, RoPE 基频和训练长度见表 6. 每个阶段最后 20% 的训练周期里, 还混入 10% 的高质量长上下文问答数据, 其长度分布与长上下文预训练数据相近. 为缓解分布变化可能带来的不稳定, 过渡阶段对各来源的权重做线性插值, 让数据分布逐步, 可控地走向目标分布, 保证训练稳定并保持收敛性质.

<small><span class="docvortex-page-footnote" data-block-type="page_footnote" style="color:#6b7280"><sup>2</sup>Same as Gemini (Team et al., 2024a), we use Paul Graham ([https://paulgraham.com/articles.html](https://paulgraham.com/articles.html)) as the haystack and “The special magic {city} number is: {number}” as the needle.</span></small>

脚注 2: 与 Gemini 相同, 用 Paul Graham 的文章作为干草堆, 用 「The special magic {city} number is: {number}」 作为针.

<!-- page 25 of 68 -->

![图 14 4M token 的 NIAH 压力测试热力图: 从 128K 到 4M, 所有深度的格子都是绿色满分](images/p25-figure-14-4-million-vanilla-needle-in-a-haystack.png)

Figure 14 | 4 Million vanilla Needle-In-A-Haystack retrieval task pressure test on MiniMax-Text-01. The token interval is 32K when it is less than 1M, and the token interval is 0.5M when it is greater than 1M.

图 14 | MiniMax-Text-01 上的 400 万 token 标准大海捞针检索压力测试. 1M 以内 token 间隔为 32K, 超过 1M 后 token 间隔为 0.5M.

Additionally, our findings indicate that NIAH is inadequate for effectively monitoring the model’s performance throughout the training process. This is primarily because NIAH metric performance reaches its peak score early on, specifically within the initial 128K training steps. To tackle this limitation, we evaluate the model’s intermediate checkpoints using more demanding tasks, which are designed to increase in complexity as training progresses. Notably, despite the escalating difficulty of these tasks, we consistently observe a steady improvement in the model’s performance metrics. This sustained upward trajectory clearly demonstrates the critical importance and necessity of implementing long-context continual pretraining. More details are given in Section 5.7.2.

此外, 作者发现 NIAH 不足以在整个训练过程中有效监测模型表现, 主要因为 NIAH 指标很早就达到峰值, 在最初 128K 训练步之内. 为此, 作者用要求更高的任务评估中间 checkpoint, 这些任务的难度随训练推进而增加. 尽管任务越来越难, 模型的指标始终稳步提升. 这条持续向上的曲线清楚地说明了长上下文继续预训练的重要和必要. 更多细节见第 5.7.2 节.

Table 6 | Long-Context Extension Recipe. For clarity, we categorize the data as follows: data with fewer than 32K tokens are labeled as “Short”; data ranging from 32K to 128K tokens are labeled as “Medium”; and data exceeding 128K tokens are categorized as “Long”.

表 6 | 长上下文扩展配方. 为清楚起见, 数据分为: 少于 32K token 的记为 「Short」; 32K 到 128K token 的记为 「Medium」; 超过 128K token 的记为 「Long」.

| Training Length | RoPE Frequenc | y # Tokens | Short (%) | Medium (%) | Long (%) |
| --- | --- | --- | --- | --- | --- |
| 128K | 5M | 300B | 30 | 70 | 0 |
| 512K | 10M | 32B | 35 | 35 | 30 |
| 1M | 10M | 26B | 30 | 30 | 40 |

> **想:** 表 6 把 RoPE 基频从 5M 调到 10M, 可 RoPE 只用在 softmax attention 层的一半头维度上, 这个调整能影响多大范围?
> 按第 2 节和图 3, 80 层里只有 10 层是 softmax attention, 且 RoPE 只作用于一半头维度; 其余 70 层 lightning attention 不用 RoPE, 位置信息来自图 12 里的衰减矩阵. 所以表 6 的基频调整只触及这 10 层的位置编码. 第 2.4 节说一半维度用 RoPE 就能外推而不掉性能, 第 5.6 节又把基频在后训练阶段固定为 10M, 两处合起来看, 基频主要服务于那 1/8 的全局检索层.

## 5. Post-training (后训练)

In this section, we present a thorough post-training framework designed to enhance the model’s general performance, long-context capability, and real-world applicability. Our approach begins with the creation of a diverse, high-quality prompt dataset, accompanied by a hierarchical reward system that evaluates responses across multiple dimensions: correctness, truthfulness, helpfulness, and harmlessness. The training process consists of Supervised Fine-Tuning (SFT), Offline and Online Reinforcement Learning (RL). Through these phases, we systematically align the model with our defined objectives. Model safety is ensured through exhaustive data mining techniques and a specialized harmless reward model. We introduce a novel multi-stage training methodology that significantly enhances the model’s capacity to process extended contexts while maintaining optimal performance on shorter sequences. This approach results in a robust system capable of handling complex, real-world scenarios. Extensive evaluations conducted across both academic and in-house benchmarks demonstrate that our model achieves top performance across all tasks, while establishing new standards of extremely long-context processing.

本节介绍一套完整的后训练框架, 提升模型的通用性能, 长上下文能力和实际可用性. 先构建多样, 高质量的提示词数据集, 并配一套分层奖励系统, 从正确性, 真实性, 有用性和无害性多个维度评估回复. 训练过程包括 SFT, 离线和在线强化学习 (RL), 分阶段系统地把模型对齐到既定目标. 模型安全靠充分的数据挖掘和专门的无害奖励模型保证. 作者提出一种新的多阶段训练方法, 明显增强模型处理长上下文的能力, 同时在较短序列上保持最优表现, 得到一个能应对复杂真实场景的稳健系统. 学术基准和内部基准上的大量评测显示, 模型在所有任务上都达到顶尖水平, 并在超长上下文处理上树立了新标准.

<!-- page 26 of 68 -->

### 5.1. Prompt Collection (提示词收集)

Our extensive prompt collection encompasses millions of diverse, high-quality queries from various sources. We develop a tagging system that categorizes each prompt based on task type, knowledge domain, and difficulty level. The collection process incorporates sophisticated filtering mechanisms to eliminate redundant prompts while maintaining an optimal difficulty distribution. The prompt set spans various domains including long-context, programming, math, logical reasoning, creative writing, function calling, general-knowledge, and safety-related scenarios.

提示词集合包含来自各种来源的数百万条多样, 高质量的查询. 作者开发了一套标签体系, 按任务类型, 知识领域和难度给每条提示词分类. 收集过程用精细的过滤机制剔除重复提示词, 同时保持最优的难度分布. 提示词覆盖长上下文, 编程, 数学, 逻辑推理, 创意写作, 函数调用, 常识和安全相关场景等领域.

### 5.2. Reward Model (奖励模型)

Our reward model framework evaluates responses across four critical dimensions to ensure alignment with our core principles:

奖励模型框架从四个关键维度评估回复, 保证与核心原则一致:

**Correctness.** We implement a rigorous evaluation system for responses that can be strictly validated. For mathematical and reasoning tasks, we utilize early-version MiniMax-Text-01 to generate binary reward signals based on answer consistency. Programming solutions undergo comprehensive testing in a secured sandbox environment, with performance metrics derived from test case success rates.

**正确性.** 对能严格验证的回复实行严格评估. 数学和推理任务用早期版本的 MiniMax-Text-01 根据答案一致性生成二元奖励信号. 编程题在安全沙箱中全面测试, 性能指标取自测试用例通过率.

• **Truthfulness.** We employ a verification pipeline to assess the factual accuracy of the response. The process involves systematic response sampling, statement decomposition and clustering, crowd-sourced verification, and automated comparison using advanced language models to generate truthfulness scores.

**真实性.** 用一条验证流水线评估回复的事实准确性: 系统地采样回复, 拆解并聚类陈述, 众包核验, 再用先进语言模型自动比对, 生成真实性分数.

**Helpfulness.** Our evaluation framework assesses compliance with user instructions through both deterministic and probabilistic approaches. We implement automated rule-based constraint verification systems complemented by human evaluation of key metrics including coherence, depth, contextual relevance, and stylistic appropriateness. The final helpfulness score combines multiple evaluation signals through a weighted scoring system.

**有用性.** 评估框架用确定性和概率性两类方法考察回复是否遵循用户指令: 基于规则的自动约束验证, 辅以人工评估连贯性, 深度, 上下文相关性和风格恰当性等关键指标. 最终的有用性分数由加权评分系统综合多路信号得到.

• **Harmlessness.** Building upon Constitutional AI principles (Bai et al., 2022b), we develop evaluation criteria encompassing safety protocols, content appropriateness, and legal compliance. Our assessment system leverages carefully calibrated prompts validated against human annotations, with early-version MiniMax-Text-01 providing standardized safety evaluations.

**无害性.** 在 Constitutional AI 原则的基础上, 作者制定了涵盖安全规范, 内容适当性和法律合规的评估标准. 评估系统使用经人工标注校准过的提示词, 由早期版本的 MiniMax-Text-01 给出标准化的安全评估.

### 5.3. Supervised Fine-Tuning (SFT)

Our SFT dataset construction involves a multi-stage process utilizing domain-specific expert models trained through iterative SFT and RL cycles. We implement rejection sampling (Bai et al., 2022a; Dubey et al., 2024) to generate high-quality responses by the experts, sampling multiple variations per prompt across different temperature settings to select optimal demonstrations measured by the reward hierarchy. The response selection process further incorporates both n-gram and semantic similarity filters to ensure maximum diversity and quality in the training data.

SFT 数据集的构建分多个阶段, 使用经过多轮 SFT 和 RL 迭代训练的领域专家模型. 作者用拒绝采样让专家生成高质量回复: 每条提示词在不同温度下采样多个版本, 按奖励层级挑出最优示范. 回复筛选还加入 n-gram 和语义相似度过滤, 保证训练数据的多样性和质量.

<!-- page 27 of 68 -->

### 5.4. Reinforcement Learning (强化学习)

#### 5.4.1. Offline Reinforcement Learning (离线强化学习)

We incorporate the offline RL phase, i.e., Direct Preference Optimization (DPO) (Rafailov et al., 2023), to optimize the model’s performance across diverse prompt distributions, owing to its simplicity and ease of data construction for long-context scenarios. We specifically focus on prompts that maintain distributional consistency with those utilized in the SFT stage. To evaluate the impact of prompt selection, we conduct comparative experiments using two prompt categories: SFT-trained prompts and SFT-untrained but homologous prompts. Empirical results demonstrate negligible performance variations between SFT-trained prompts and their untrained counterparts. Thus, we adopt the SFT-trained ones for the offline RL phase. The experimental protocol involves generating responses with varying temperature parameters for each prompt, followed by systematic evaluation using the reward models described in Section 5.2. We then identify the best and the worst responses to construct preference pairs for DPO training.

作者加入离线 RL 阶段, 即 DPO, 在多样的提示词分布上优化模型表现; 选 DPO 是因为它简单, 长上下文场景下也容易构造数据. 重点使用与 SFT 阶段分布一致的提示词. 为评估提示词选择的影响, 作者用两类提示词做对比: SFT 训练过的提示词, 以及 SFT 没训练过但同源的提示词. 结果显示两者的表现差异可以忽略, 因此离线 RL 阶段采用 SFT 训练过的提示词. 实验流程是: 每条提示词用不同温度生成回复, 再用第 5.2 节的奖励模型系统评估, 选出最好和最差的回复, 构成 DPO 训练的偏好对.

#### 5.4.2. Online Reinforcement Learning (在线强化学习)

Online learning demonstrates superior sample efficiency and cross-domain generalization capabilities compared to offline learning methodologies. Therefore, we implement online RL to improve model performance, particularly in mathematical reasoning tasks. Our approach emphasizes prompt diversity and prioritizes prompts with moderate success rates to maximize information gain during policy updates. Notably, we employ SFT-untrained prompts during online RL, as our empirical observations indicate that reusing prompts from previous phases resulted in model saturation, characterized by diminished response perplexity. We propose a modified Group Relative Policy Optimization (GRPO) (Shao et al., 2024) approach incorporating the following key innovations:

与离线学习相比, 在线学习的样本效率和跨领域泛化能力更好. 因此作者实施在线 RL 提升模型表现, 数学推理任务尤其如此. 做法强调提示词多样性, 优先选择成功率适中的提示词, 让策略更新时的信息增益最大. 值得注意的是, 在线 RL 使用 SFT 没训练过的提示词, 因为经验观察表明, 复用前面阶段的提示词会导致模型饱和, 表现为回复困惑度降低. 作者提出一种改进的 GRPO, 包含以下关键改动:

**Importance Sampling Weight Clipping.** The conventional PPO/GRPO implementation employs one-sided clipping (Schulman et al., 2017; Shao et al., 2024), sometimes leading to gradient instability when processing tokens with a large policy ratio and negative advantage. To address this issue, we implement additional clipping that abandoned this case in the loss function, which effectively regulates the importance sampling magnitude and mitigates noise propagation.

**重要性采样权重裁剪.** 常规的 PPO/GRPO 实现采用单侧裁剪, 处理策略比率大, 优势为负的 token 时有时会导致梯度不稳定. 为此作者在损失函数里加了一道裁剪, 舍弃这种情况, 有效控制重要性采样的幅度, 抑制噪声传播.

> **确认:** 为什么 「比率大而优势为负」 恰好是单侧裁剪管不住的情形?
> PPO 的目标取 min(r·A, clip(r)·A): A 为负时, r 越大 r·A 越小, min 会选未裁剪的 r·A, 裁剪上限不起作用, 梯度随 r 无界放大. 第 5.4.2 节的改法是在损失里把这类 token 直接舍掉, 相当于补上另一侧的截断; 本文没有给出裁剪阈值, 也没有给出舍弃比例.

• **KL Divergence Optimization.** Due to the similar gradient instability issue, we reformulate the KL divergence term through theoretical analysis of the variance-bias trade-off to further stabilize gradient behavior, resulting in $\mathbb { D } _ { K L } ( \theta ) = \mathbb { E } _ { t } [ \mathsf { S G } ( \pi _ { \theta } ( a _ { t } | s _ { t } ) - \pi _ { \mathrm { r e f } } ( a _ { t } | s _ { t } ) ) \log \pi _ { \theta } ( a _ { t } | s _ { t } ) ]$ where SG(·) denotes the stop-gradient operator. This formulation maintains policy consistency while reducing gradient variance.

**KL 散度优化.** 出于同样的梯度不稳定问题, 作者从方差与偏差权衡的理论分析出发, 重写了 KL 散度项, 进一步稳定梯度, 得到 $\mathbb{D}_{KL}(\theta) = \mathbb{E}_t[\mathsf{SG}(\pi_\theta(a_t|s_t) - \pi_{\mathrm{ref}}(a_t|s_t))\log\pi_\theta(a_t|s_t)]$, 其中 SG(·) 为停止梯度算子. 这种写法在保持策略一致性的同时降低了梯度方差.

> **停一下:** 第 5.4.2 节这个 「KL」 式子的数值本身像 KL 散度吗?
> 不像. 该式对 θ 求导得到 $\mathbb{E}_t[(\pi_\theta - \pi_{\mathrm{ref}})\nabla\log\pi_\theta]$, 它在 $\pi_\theta = \pi_{\mathrm{ref}}$ 时为零, 偏离越大推力越大, 起的是把策略拉回参考策略的作用; 式子本身的数值没有 KL 散度的含义, 是一个只为产生这种梯度而写的替代目标, 用 SG 截断的部分就是每个 token 的拉回权重.

**Balanced Advantage Estimation.** We also ensure equitable reward contributions between positive and negative examples, which proves particularly effective in scenarios with skewed distributions. This approach maintains stable training dynamics by regulating the absolute magnitude of rewards across different example groups.

**均衡优势估计.** 作者还保证正例和负例的奖励贡献对等, 在分布偏斜的场景下尤其有效. 通过控制不同样本组奖励的绝对幅度, 训练动态保持稳定.

### 5.5. Safety Alignment (安全对齐)

The safety alignment of our model is meticulously addressed throughout both the SFT and RL stages. To strike an optimal balance between the model’s harmlessness and helpfulness, we employ an approach that encompasses the following key components.

模型的安全对齐贯穿 SFT 和 RL 两个阶段. 为在无害性和有用性之间取得最优平衡, 作者采用包含以下关键环节的做法.

<!-- page 28 of 68 -->

#### 5.5.1. Training Data Construction (训练数据构建)

We construct high-quality alignment training data with a focus on ensuring data diversity and accuracy. This involves the implementation of several data collection methodologies designed to cover a broad spectrum of safety scenarios:

作者构建高质量的对齐训练数据, 注重多样性和准确性, 用几种数据收集方法覆盖广泛的安全场景:

**Safety-Category Specific Prompts.** Leveraging established safety classification standards and insights from safety and domain experts, we generate tailored prompts for specific safety categories. This ensures that the model is exposed to a comprehensive set of safety-related scenarios.

**按安全类别定制的提示词.** 依据成熟的安全分类标准和安全, 领域专家的意见, 为特定安全类别生成定制提示词, 让模型接触到全面的安全相关场景.

• **Real-World User Data Collection.** We collect real-world user questions from various web documents to incorporate authentic and diverse safety-related queries into our training data.

**真实用户数据收集.** 从各类网页文档中收集真实用户问题, 把真实多样的安全相关查询纳入训练数据.

• **Prompt Augmentation.** We instruct early-version MiniMax-Text-01 to generate additional related prompts based on the collected typical red team attack prompts. This approach aims to expand the diversity of safety scenarios and enhance the robustness of the model’s safety mechanisms.

**提示词扩充.** 让早期版本的 MiniMax-Text-01 基于收集到的典型红队攻击提示词生成更多相关提示词, 扩大安全场景的多样性, 增强安全机制的稳健性.

#### 5.5.2. Response Generation with Harmless Reward Model (用无害奖励模型生成回复)

To generate safe and appropriate responses, we employ a harmless reward model (Bai et al., 2022b) that is developed based on a set of detailed safety rules. To prevent the model from producing unreasonable refusals, we carefully integrate principles of helpfulness into the safety rules. This integration plays a crucial role in achieving a balanced output capability, enabling the model to provide safer responses without compromising its utility to the user. The resulting safety-aligned system demonstrates robust protection against potential misuse while maintaining high performance across intended use cases.

为生成安全, 恰当的回复, 作者使用一个依据一组详细安全规则开发的无害奖励模型. 为避免模型不合理地拒答, 安全规则里仔细融入了有用性原则. 这种融合对平衡输出能力很关键, 让模型在不牺牲对用户价值的前提下给出更安全的回复. 最终的安全对齐系统能有效防范潜在滥用, 在预期用途上保持高性能.

### 5.6. Training Methodology with Long-Context Adaptation (适配长上下文的训练方法)

We propose a systematic multi-stage training methodology to enhance the model’s capacity for processing extended contexts, as shown in Tab. 7. This approach is methodically designed to optimize long-sequence handling while maintaining performance efficacy on conventional shorter sequences. The RoPE base frequency is maintained at 10 million throughout the post-training phase to ensure consistency in positional encoding.

作者提出一套系统的多阶段训练方法, 增强模型处理长上下文的能力, 见表 7. 这套方法在优化长序列处理的同时, 保持常规短序列上的效果. 整个后训练阶段 RoPE 基频保持 1000 万, 保证位置编码一致.

**Stage I: Initial Short-Context Training.** The first stage implements SFT with sequences constrained to 8,192 tokens. This foundational phase establishes baseline competency in processing standardlength queries and responses, which constitute the majority of practical applications. We remove the long-context prompts that are longer than 8,192 tokens in this stage.

**阶段 I: 初始短上下文训练.** 第一阶段做 SFT, 序列长度限制在 8,192 token. 这个基础阶段建立处理标准长度查询和回复的基本能力, 这类查询占实际应用的大多数. 此阶段去掉长于 8,192 token 的长上下文提示词.

**Stage II: Extended Context Training.** The second stage implements a significant extension of the sequence length to 1,032,192 tokens. This phase incorporates training samples across diverse sequence lengths with 50% long-context prompts, facilitating comprehensive model adaptation to extensive contextual processing. The strategic expansion of the sequence length is fundamental to achieving robust long-context capabilities.

**阶段 II: 扩展上下文训练.** 第二阶段把序列长度大幅扩展到 1,032,192 token, 纳入各种长度的训练样本, 其中 50% 是长上下文提示词, 让模型全面适应长上下文处理. 有策略地扩展序列长度是获得稳健长上下文能力的基础.

**Stage III: Short-Context Preference Optimization.** In this phase, we revert to 8,192 tokens for sequence length and implement Direct Preference Optimization (DPO). This calibration ensures optimal performance on conventional context sizes while maintaining the previously acquired capabilities.

**阶段 III: 短上下文偏好优化.** 这一阶段序列长度回到 8,192 token, 实施 DPO. 这一校准保证常规上下文长度上的最优表现, 同时保留之前获得的能力.

**Stage IV: Long-Context Preference Optimization.** The fourth stage focuses on reinforcing longcontext processing capabilities through DPO with sequences of 1,032,192 tokens. This phase employs training protocols analogous to Stage III with entirely long-context data, adapted for extended sequence lengths.

**阶段 IV: 长上下文偏好优化.** 第四阶段用 1,032,192 token 的序列做 DPO, 强化长上下文处理能力. 训练流程与阶段 III 类似, 数据全部是长上下文数据, 并针对长序列做了调整.

<!-- page 29 of 68 -->

**Stage V: Online Reinforcement Learning.** The final stage implements short-context Online Reinforcement Learning with a sequence length of 8,192 tokens. More details have been outlined in Section 5.4.2.

**阶段 V: 在线强化学习.** 最后一阶段做短上下文在线强化学习, 序列长度 8,192 token. 细节见第 5.4.2 节.

Table 7 | Training Recipe for Post-training Alignment.

表 7 | 后训练对齐的训练配方.

|  | Stage I | Stage II | Stag III | Stage IV | Stage V |
| --- | --- | --- | --- | --- | --- |
| Sequence Length | 8192 | 1032192 | 8192 | 1032192 | 8192 |
| Epoch | 2 | 2 | 1 | 1 | 1 |
| Batch Size | 128 | 80 | 64 | 64 | 512 |
| Max LR | 1e-5 | 3e-6 | 5e-7 | 5e-7 | 1e-6 |
| Min LR | 1e-6 | 3e-6 | 5e-8 | 5e-7 | 1e-7 |
| LR Decay | Cosine | Constant | Cosine | Constant | Cosine |

> **拆开:** 表 7 里长上下文阶段的序列长度是 1,032,192, 为什么不是 2^20 = 1,048,576?
> 1,032,192 = 1008 × 1024 = 4032 × 256, 是第 3.2.2 节块大小 256 的整数倍, 比 2^20 少 16,384. 本文没有解释这个差额; 从数字看, 它满足按 256 分块的要求, 也给 1M 左右的上下文留出一小段余量. 按表 7 的 batch size 80, 阶段 II 每步约处理 80 × 1,032,192 ≈ 8260 万 token.

### 5.7. Academic Benchmarks (学术基准)

We observe and report open-source short- and long-context benchmarks that highlight our model’s capabilities across various aspects. Along with the user-oriented evaluations we will discuss in Section 5.8, we show that MiniMax-Text-01 is a leading open-source model that achieves top performance in long-context retrieval, understanding, long in-context learning and knowledge-based requests, while performing well in math, reasoning, and code tasks and demonstrating strong usefulness in real-user assistant scenarios.

作者观察并报告开源的短上下文和长上下文基准, 展示模型各方面的能力. 结合第 5.8 节的面向用户评测, 结果表明 MiniMax-Text-01 是领先的开源模型: 在长上下文检索, 理解, 长 in-context learning 和知识类请求上达到顶尖, 在数学, 推理和代码任务上表现良好, 在真实用户助手场景中也很有用.

#### 5.7.1. Core Benchmarks (核心基准)

MMLU (Hendrycks et al., 2021a) and MMLU-Pro (Wang et al., 2024b) are widely adopted datasets that assess the extent of a model’s knowledge across a broad range of domains. We further observe SimpleQA (Wei et al., 2024), a factuality benchmark that challenges the model’s knowledge boundary, and C-SimpleQA (He et al., 2024b) which is an adapted version of SimpleQA under the Chinese culture. For the observation of reasoning capabilities, we evaluate on GPQA (Rein et al., 2024) for graduate-level knowledge reasoning, and DROP (Dua et al., 2019) for reading comprehension reasoning. We test our model’s performance on math problem-solving with grade-school-level task GSM8k (Cobbe et al., 2021) and MATH (Hendrycks et al., 2021b) that spans from AMC-8 to AIME level across 7 subjects. We monitor our model’s coding capability by observing the Pass@1 rate on HumanEval (Chen et al., 2021) and MBPP Plus (Austin et al., 2021; Liu et al., 2023) datasets. To test the models’ ability to interpret and execute detailed and nuanced instructions, we evaluate the IFEval (Zhou et al., 2023) benchmark. Furthermore, we observe Arena-Hard-Auto (Li et al., 2024b) that reflects the alignment to human preferences.

MMLU 和 MMLU-Pro 是广泛使用的数据集, 考察模型在很多领域的知识广度. 作者还观察 SimpleQA (挑战模型知识边界的事实性基准) 和 C-SimpleQA (SimpleQA 在中国文化背景下的改编版). 推理能力方面, 用 GPQA 考研究生水平的知识推理, 用 DROP 考阅读理解推理. 数学解题用小学水平的 GSM8k, 以及覆盖 7 个学科, 从 AMC-8 到 AIME 难度的 MATH. 编程能力看 HumanEval 和 MBPP Plus 上的 Pass@1. 理解并执行细致指令的能力用 IFEval 评测. 此外还观察反映人类偏好对齐程度的 Arena-Hard-Auto.

We adopt greedy decoding and a zero-shot chain-of-thought strategy (Wei et al., 2022) in evaluating our instruction-tuned model. We compare with other leading and open-source LLMs, which we evaluate under the same setting, if not reported. We present the performance of MiniMax-Text-01 in Table 8. As shown, MiniMax-Text-01 exhibits remarkable performance across most dimensions. It surpasses all models on C-SimpleQA with its more extensive knowledge boundary under Chinese culture. MiniMax-Text-01 also achieves top-3 performance across MMLU, IFEval, and Arena-Hard, showing its exceptional capability of applying its comprehensive knowledge within given constraints to well satisfy user queries and align with human preferences. Meanwhile, it achieves a better MATH pass@1 rate than GPT-4o, Claude-3.5-Sonnet, and Llama-3.1-405B, and exhibits comparable performance with instructed Qwen2.5-72B on HumanEval. Moreover, MiniMax-Text-01 achieves 54.4 on GPQA Diamond, which exceeds most open-source instruction-tuned LLMs and the latest version of GPT-4o.

评测指令微调模型时使用贪心解码和 zero-shot CoT 策略. 与其他领先模型和开源模型比较时, 若对方没有报告, 就在相同设置下自行评测. MiniMax-Text-01 的成绩见表 8. 可以看到, MiniMax-Text-01 在多数维度上表现出色. 凭借更广的中国文化知识边界, 它在 C-SimpleQA 上超过所有模型. 在 MMLU, IFEval 和 Arena-Hard 上进入前三, 说明它能在给定约束下运用广博的知识, 较好地满足用户查询, 贴合人类偏好. MATH 的 pass@1 高于 GPT-4o, Claude-3.5-Sonnet 和 Llama-3.1-405B, HumanEval 上与指令版 Qwen2.5-72B 相当. 此外, MiniMax-Text-01 在 GPQA Diamond 上得到 54.4, 超过多数开源指令微调模型和最新版的 GPT-4o.

<!-- page 30 of 68 -->

Table 8 | Performance of MiniMax-Text-01 on core academic benchmarks.

表 8 | MiniMax-Text-01 在核心学术基准上的表现. 带 * 的项按 0-shot CoT 设置评测.

<table><tr><td>Tasks</td><td>GPT-4o (11-20)</td><td>Claude-3.5-Sonnet (10-22)</td><td>Gemini-1.5-Pro (002)</td><td>Gemini-2.0-Flash (exp)</td><td>Qwen2.5-72B-Inst.</td><td>DeepSeek-V3</td><td>Llama-3.1-405B-Inst.</td><td>MiniMax-Text-01</td></tr><tr><td colspan="9">General</td></tr><tr><td>MMLU*</td><td>85.7</td><td>88.3</td><td>86.8</td><td>86.5</td><td>86.1</td><td>88.5</td><td>88.6</td><td>88.5</td></tr><tr><td>MMLU-Pro*</td><td>74.4</td><td>78.0</td><td>75.8</td><td>76.4</td><td>71.1</td><td>75.9</td><td>73.3</td><td>75.7</td></tr><tr><td>SimpleQA</td><td>39.0</td><td>28.1</td><td>23.4</td><td>26.6</td><td>10.3</td><td>24.9</td><td>23.2</td><td>23.7</td></tr><tr><td>C-SimpleQA</td><td>64.6</td><td>56.8</td><td>59.4</td><td>63.3</td><td>52.2</td><td>64.8</td><td>54.7</td><td>67.4</td></tr><tr><td>IFEval (avg)</td><td>84.1</td><td>90.1</td><td>89.4</td><td>88.4</td><td>87.2</td><td>87.3</td><td>86.4</td><td>89.1</td></tr><tr><td>Arena-Hard</td><td>92.4</td><td>87.6</td><td>85.3</td><td>72.7</td><td>81.2</td><td>91.4</td><td>63.5</td><td>89.1</td></tr><tr><td colspan="9">Reasoning</td></tr><tr><td>GPQA* (diamond)</td><td>46.0</td><td>65.0</td><td>59.1</td><td>62.1</td><td>49.0</td><td>59.1</td><td>50.7</td><td>54.4</td></tr><tr><td>DROP* (F1)</td><td>89.2</td><td>88.8</td><td>89.2</td><td>89.3</td><td>85.0</td><td>91.0</td><td>92.5</td><td>87.8</td></tr><tr><td colspan="9">Mathematics</td></tr><tr><td>GSM8k*</td><td>95.6</td><td>96.9</td><td>95.2</td><td>95.4</td><td>95.8</td><td>96.7</td><td>96.7</td><td>94.8</td></tr><tr><td>MATH*</td><td>76.6</td><td>74.1</td><td>84.6</td><td>83.9</td><td>81.8</td><td>84.6</td><td>73.8</td><td>77.4</td></tr><tr><td colspan="9">Coding</td></tr><tr><td>MBPP +</td><td>76.2</td><td>75.1</td><td>75.4</td><td>75.9</td><td>77.0</td><td>78.8</td><td>73.0</td><td>71.7</td></tr><tr><td>HumanEval</td><td>90.2</td><td>93.7</td><td>86.6</td><td>89.6</td><td>86.6</td><td>92.1</td><td>89.0</td><td>86.9</td></tr><tr><td colspan="9">* Evaluated following a 0-shot CoT setting.</td></tr></table>

#### 5.7.2. Long Benchmarks (长上下文基准)

As previously discussed in the long-context extension part of section 4.2, the NIAH task is kind of simplistic for our model, rendering it insufficient for observing the model’s optimization progress. Consequently, we shift our evaluation to more challenging tasks. Our current long-context evaluation framework focuses on three primary dimensions: (1) Long-Context Retrieval, (2) Long-Context Understanding, and (3) Long In-Context Learning.

如第 4.2 节长上下文扩展部分所说, NIAH 对本模型来说偏简单, 不足以观察优化进展, 因此评测转向更难的任务. 当前的长上下文评测框架聚焦三个维度: (1) 长上下文检索, (2) 长上下文理解, (3) 长 in-context learning.

##### 5.7.2.1 Long-Context Retrieval (长上下文检索)

This dimension assesses the model’s memory capabilities, which serve as the foundation for almost all long-context tasks. In addition to vanilla k-M NIAH (Kamradt, 2023), we construct a more challenging variation to assess our Long-Context Retrieval performance, namely Multi-Round Needles In-A-Haystack (MR-NIAH), serving as a crucial back up for retrieval tasks in long multi-turn dialogue contexts, revealing the fundamental capabilities for building lifelong companion AI assistants. Similar to Multi-round co-reference resolution (MRCR) (Vodrahalli et al., 2024) which is not open-source, we construct haystacks of MR-NIAH as history dialogues, where user queries are synthetic but explicit requests of event descriptions and creative writing. In the last round, the query requests the model to repeat the response of one of the history requests. The haystacks span from 2K to 1M tokens (up to around 2000 interactions), and each needle request is injected at 25%, 50%, and 75% of the conversation, respectively. Each ground truth response contains three core components, and we look at an adjusted recall $\frac{\text {corr } \text {comp }}{3}$ . We show a case illustration in Appendix B.2.

这一维度考察模型的记忆能力, 它几乎是所有长上下文任务的基础. 除标准的 k-M NIAH 外, 作者构造了一个更难的变体来评估长上下文检索, 叫多轮大海捞针 (MR-NIAH). 它是长多轮对话中检索任务的重要补充, 揭示打造终身陪伴型 AI 助手所需的基础能力. 与不开源的多轮指代消解 (MRCR) 类似, MR-NIAH 的干草堆是历史对话, 用户查询是合成的, 内容是明确要求描述事件或做创意写作. 最后一轮要求模型复述其中某一轮历史请求的回复. 干草堆从 2K 到 1M token (最多约 2000 轮交互), 每个针请求分别插在对话的 25%, 50% 和 75% 位置. 每个标准回复包含三个核心要素, 评分用调整召回率 $\frac{\text{corr comp}}{3}$. 案例见附录 B.2.

<!-- page 31 of 68 -->

Figure 15 illustrates comparison results of MR-NIAH. Our model (“MiniMax-Text- $\left[ 0 1 ^ { \prime \prime } \right]$ , red line) shows strong performance across a wide range of sequence lengths in both English and Chinese evaluations. Compared to competing baselines (e.g., GPT, Claude, and Gemini variants), our model also shows less performance degradation at large input lengths, underscoring its robustness for long-context retrieval tasks.

MR-NIAH 的比较结果见图 15. 本文模型 (「MiniMax-Text-01」, 红线) 在英文和中文评测中, 各种序列长度下都表现强劲. 与 GPT, Claude, Gemini 各变体等对比基线相比, 本文模型在长输入下的性能下降也更小, 体现了它在长上下文检索任务上的稳健性.

> **回看:** 「长输入下性能下降更小」 在中文 MR-NIAH 上也成立吗?
> 看图 15: 英文图中红线在 1M 处约 0.62, 从约 0.75 的平台缓慢下滑; 中文图中红线在 512k 附近还有约 0.74 的峰, 到 1M 跌到约 0.43. 与同样测到 1M 的 Gemini-1.5-Pro (中文约 0.25) 相比, 下降确实更小, 但中文曲线本身在最后两百多 k 里掉了约 0.3, 比英文陡得多.

##### 5.7.2.2 Long-Context Understanding (长上下文理解)

This dimension measures the model’s longcontext understanding ability which contains logical reasoning skills based on long-context inputs. We utilize two comprehensive longcontext QA datasets, Ruler (Hsieh et al., 2024) and LongBench-V2 (Bai et al., 2024) to evaluate this aspect. Ruler includes 13 different tasks and notably introduces multi-hop tracing and aggregation tasks to evaluate the complex reasoning abilities of models. We test Ruler up to a sequence length of 1M tokens. LongBench-V2 encompasses question-answering tasks of varying difficulty levels across multiple context types, including single and multi-document, multi-turn dialogue, code repositories, and long structured data, among others. Following LongBench-V2 (Bai et al., 2024), we consider two test modes: w/o CoT and w/ CoT, and the text lengths are categorized as follows: Short, ranging from 0 to 32K words; Medium, spanning from 32K to 128K words; and Long, covering 128K to 2M words.

这一维度衡量模型的长上下文理解能力, 包括基于长上下文输入的逻辑推理. 作者用两个综合性长上下文问答数据集评估: Ruler 和 LongBench-V2. Ruler 包含 13 个任务, 特别引入多跳追踪和聚合任务来评估复杂推理能力; Ruler 测到 1M token 序列长度. LongBench-V2 包含多种上下文类型和不同难度的问答任务, 上下文类型有单文档和多文档, 多轮对话, 代码仓库, 长结构化数据等. 按 LongBench-V2 的做法, 考虑两种测试模式: 不用 CoT 和用 CoT, 文本长度分为: Short, 0 到 32K 词; Medium, 32K 到 128K 词; Long, 128K 到 2M 词.

![图 15 MR-NIAH 英文和中文的调整召回率随上下文长度变化: MiniMax-Text-01 红线在 1M 处英文约 0.62, 中文约 0.43](images/p31-figure-15-mr-niah-in-english-and-chinese.png)

Figure 15 | MR-NIAH in English and Chinese.

图 15 | 英文和中文的 MR-NIAH.

As Table 9 illustrates, our model exhibits notable strengths in processing Ruler’s long-context reasoning tasks. While performance at the 64k input level remains competitive with leading models (including GPT-4o and Claude-3.5-Sonnet) with minimal variation, MiniMax-Text-01 establishes a distinct advantage beginning at 128k, achieving impressive scores and surpassing all benchmark models. This superiority becomes particularly pronounced in ultra-long-context scenarios (such as 1M), where MiniMax-Text-01 maintains its commanding lead. Moreover, as evident in Table $1 0 ^ { 3 }$ MiniMax-Text-01 exhibits outstanding capabilities in LongBench-V2’s long-context reasoning tasks. The model achieves state-of-the-art results among all evaluated systems in the w/ CoT setting, while also displaying remarkable effectiveness in scenarios w/o CoT.

如表 9 所示, 模型在 Ruler 的长上下文推理任务上优势明显. 64k 输入时与领先模型 (包括 GPT-4o 和 Claude-3.5-Sonnet) 相当, 差别很小; 从 128k 开始, MiniMax-Text-01 建立明显优势, 分数超过所有对比模型. 在超长上下文场景 (如 1M) 中这种优势更加突出, MiniMax-Text-01 保持大幅领先. 此外, 如表 10 所示, MiniMax-Text-01 在 LongBench-V2 的长上下文推理任务上表现突出: 用 CoT 时在所有评测系统中达到最好成绩, 不用 CoT 时也很有效.

Overall, MiniMax-Text-01 demonstrates exceptional capability in long-context understanding especially reasoning tasks, both with and without CoT reasoning, particularly excelling in scenarios requiring complex reasoning. The exceptional robustness and stability of the model in processing long-context understanding tasks can be attributed to the hybrid architecture with half RoPE and carefully tuned training recipes for both pre-training and alignment, which enhance the model’s ability to handle long sequences effectively.

总的来说, MiniMax-Text-01 在长上下文理解, 尤其是推理任务上能力出色, 无论用不用 CoT, 需要复杂推理的场景尤其突出. 模型处理长上下文理解任务时的稳健和稳定, 可以归功于带一半 RoPE 的混合架构, 以及为预训练和对齐精心调好的训练配方, 它们增强了模型有效处理长序列的能力.

<small><span class="docvortex-page-footnote" data-block-type="page_footnote" style="color:#6b7280"><sup>3</sup>We present the other models’ performance reported at https://longbench2.github.io/</span></small>

脚注 3: 其他模型的成绩取自 https://longbench2.github.io/ 上的报告.

<!-- page 32 of 68 -->

Table 9 | Performance comparison of MiniMax-Text-01 on Ruler.

表 9 | MiniMax-Text-01 在 Ruler 上的表现对比.

| Model | 4k | 8k | 16k | 32k | 64k | 128k | 256k | 512k | 1M |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| GPT-4o (11-20) | 0.970 | 0.921 | 0.890 | 0.888 | 0.884 | - | - | - | - |
| Claude-3.5-Sonnet (10-22) | 0.965 | 0.960 | 0.957 | 0.950 | 0.952 | 0.938 | - | - | - |
| Gemini-1.5-Pro (002) | 0.962 | 0.960 | 0.960 | 0.958 | 0.938 | 0.917 | 0.916 | 0.861 | 0.850 |
| Gemini-2.0-Flash (exp) | 0.960 | 0.960 | 0.951 | 0.957 | 0.937 | 0.860 | 0.797 | 0.709 | - |
| MiniMax-Text-01 | 0.963 | 0.961 | 0.953 | 0.954 | 0.943 | 0.947 | 0.945 | 0.928 | 0.910 |

Table 10 | Performance comparison of MiniMax-Text-01 on LongBench v2.

表 10 | MiniMax-Text-01 在 LongBench v2 上的表现对比.

<table><tr><td>Model</td><td>overall</td><td>easy</td><td>hard</td><td>short</td><td>medium</td><td>long</td></tr><tr><td>Human</td><td>53.7</td><td>100.0</td><td>25.1</td><td>47.2</td><td>59.1</td><td>53.7</td></tr><tr><td colspan="7">w/ CoT</td></tr><tr><td>GPT-4o (11-20)</td><td>51.4</td><td>54.2</td><td>49.7</td><td>59.6</td><td>48.6</td><td>43.5</td></tr><tr><td>Claude-3.5-Sonnet (10-22)</td><td>46.7</td><td>55.2</td><td>41.5</td><td>53.9</td><td>41.9</td><td>44.4</td></tr><tr><td>Deepseek-V3</td><td>-</td><td>-</td><td>-</td><td>-</td><td>-</td><td>-</td></tr><tr><td>Qwen2.5-72B-Inst.</td><td>43.5</td><td>47.9</td><td>40.8</td><td>48.9</td><td>40.9</td><td>39.8</td></tr><tr><td>MiniMax-Text-01</td><td>56.5</td><td>66.1</td><td>50.5</td><td>61.7</td><td>56.7</td><td>47.2</td></tr><tr><td colspan="7">w/o CoT</td></tr><tr><td>GPT-4o (11-20)</td><td>50.1</td><td>57.4</td><td>45.6</td><td>53.3</td><td>52.4</td><td>40.2</td></tr><tr><td>Claude-3.5-Sonnet (10-22)</td><td>41.0</td><td>46.9</td><td>37.3</td><td>46.1</td><td>38.6</td><td>37.0</td></tr><tr><td>Deepseek-V3</td><td>48.7</td><td>-</td><td>-</td><td>-</td><td>-</td><td>-</td></tr><tr><td>Qwen2.5-72B-Inst.</td><td>42.1</td><td>42.7</td><td>41.8</td><td>45.6</td><td>38.1</td><td>44.4</td></tr><tr><td>MiniMax-Text-01</td><td>52.9</td><td>60.9</td><td>47.9</td><td>58.9</td><td>52.6</td><td>43.5</td></tr></table>

##### 5.7.2.3 Long In-Context Learning (长 in-context learning)

This dimension evaluates the model’s ability to learn from context, a core area of research in lifelong learning. We benchmark our Long In-Context Learning capability with the MTOB (Machine Translation from One Book) (Tanzer et al., 2024) dataset.

这一维度评估模型从上下文中学习的能力, 这是终身学习研究的核心领域. 作者用 MTOB (Machine Translation from One Book) 数据集评测长 in-context learning 能力.

The task requires a model to translate between English and Kalamang, a language that is very limited in open data and thus within the training corpus, and the LLM is expected to learn the language only from parts of a grammar book and 375 translation examples, all given in the context for each translation query (Appendix B.1). The context length is ∼ 81K tokens under a half-book setting and ∼ 133K tokens under a total-book setting. We present our results in Table 11.

任务要求模型在英语和 Kalamang 之间互译. Kalamang 的公开数据很少, 训练语料里也几乎没有, LLM 只能从语法书的部分内容和 375 条翻译示例中学这门语言, 这些材料在每次翻译查询时都放在上下文里 (附录 B.1). 半本书设置下上下文约 81K token, 整本书设置下约 133K token. 结果见表 11.

![图 16 长上下文扩展训练过程中 eng 到 kalam 的 ChrF: 从 30 左右锯齿上升到约 51](images/p32-figure-16-changes-of-eng-kalam-chrf-during-the-whole.png)

Figure 16 | Changes of eng → kalam (ChrF) during the whole long-context extension training process.

图 16 | 整个长上下文扩展训练过程中 eng → kalam (ChrF) 的变化.

We carefully examined the pre-training data and found that only a very small amount of data contains Kalamang-related content. As a result, the eng → kalam (ChrF) score of our model is the lowest in the no-context scenario, while other models we compared with likely have had their pre-train or post-train data enhanced with relevant Kalamang data. As well as the delta half and full book metrics, our model surpasses all models in terms of the eng → kalam (ChrF) metric. And our model also has comparable performance with other models on kalam → eng (BLEURT) metric.

作者仔细检查了预训练数据, 发现只有极少量数据含 Kalamang 相关内容. 所以在无上下文场景下, 本文模型的 eng → kalam (ChrF) 分数最低, 而对比模型的预训练或后训练数据很可能加强过 Kalamang 相关数据. 按半本书和整本书的增量 (delta) 指标, 本文模型的 eng → kalam (ChrF) 超过所有模型; kalam → eng (BLEURT) 指标上与其他模型相当.

<!-- page 33 of 68 -->

In the course of long-context extension, as described in section 4.2, we observed a gradual enhancement in In-Context Learning ability, as indicated by MTOB, illustrated in Figure 16. While we have explored some remarkable works(Agarwal et al., 2024; Dong et al., 2024) specifically aimed at improving In-Context Learning capabilities, we believe that such ability should merely be one aspect of the reasoning capabilities of long-context models. Therefore, we plan to conduct in-depth research on long-context data quality and scale from a more fundamental perspective to further enhance the long-context reasoning capabilities of our model.

如第 4.2 节所述, 长上下文扩展过程中, 作者观察到 MTOB 所反映的 in-context learning 能力逐步增强, 见图 16. 虽然作者研究过一些专门提升 in-context learning 能力的出色工作, 但认为这种能力只应是长上下文模型推理能力的一个方面. 因此作者计划从更根本的角度深入研究长上下文数据的质量和规模, 进一步增强模型的长上下文推理能力.

Table 11 | Performance comparison of MiniMax-Text-01 on MTOB.

表 11 | MiniMax-Text-01 在 MTOB 上的表现对比.

<table><tr><td>Context Type</td><td>no context</td><td>half book</td><td>full book</td><td>Δ half book</td><td>Δ full book</td></tr><tr><td colspan="6">eng → kalam (ChrF)</td></tr><tr><td>GPT-4o (11-20)</td><td>9.90</td><td>54.30</td><td>-</td><td>44.40</td><td>-</td></tr><tr><td>Claude-3.5-Sonnet (10-22)</td><td>20.22</td><td>53.62</td><td>55.65</td><td>33.39</td><td>35.42</td></tr><tr><td>Gemini-1.5-Pro (002)</td><td>16.79</td><td>53.68</td><td>57.90</td><td>36.89</td><td>41.11</td></tr><tr><td>Gemini-2.0-Flash (exp)</td><td>12.20</td><td>49.50</td><td>53.30</td><td>37.30</td><td>41.10</td></tr><tr><td>Qwen-Long</td><td>16.55</td><td>48.48</td><td>45.94</td><td>31.92</td><td>29.39</td></tr><tr><td>MiniMax-Text-01</td><td>6.0</td><td>51.74</td><td>51.60</td><td>45.7</td><td>45.6</td></tr><tr><td colspan="6">kalam → eng (BLEURT)</td></tr><tr><td>GPT-4o (11-20)</td><td>33.20</td><td>58.30</td><td>-</td><td>25.10</td><td>-</td></tr><tr><td>Claude-3.5-Sonnet (10-22)</td><td>31.42</td><td>59.70</td><td>62.30</td><td>28.28</td><td>30.88</td></tr><tr><td>Gemini-1.5-Pro (002)</td><td>32.02</td><td>61.52</td><td>63.09</td><td>29.50</td><td>31.07</td></tr><tr><td>Gemini-2.0-Flash (exp)</td><td>33.80</td><td>57.50</td><td>57.00</td><td>23.70</td><td>23.20</td></tr><tr><td>Qwen-Long</td><td>30.13</td><td>53.14</td><td>32.15</td><td>23.01</td><td>2.02</td></tr><tr><td>MiniMax-Text-01</td><td>33.65</td><td>57.10</td><td>58.00</td><td>23.45</td><td>24.35</td></tr></table>

> **看表:** 第 5.7.2.3 节说本文模型在 eng → kalam (ChrF) 上 「超过所有模型」, 这是按表 11 哪几列说的?
> 按表 11 的 Δ 两列: 本文模型 Δ half book 45.7, Δ full book 45.6, 都是全表最高. 按带书之后的绝对分数则不然, half book 51.74 低于 GPT-4o 的 54.30, full book 51.60 低于 Gemini-1.5-Pro 的 57.90 和 Claude 的 55.65. Δ 大很大程度上来自无上下文时的 6.0 这个低起点, 第 5.7.2.3 节也承认了这一点.

### 5.8. User-in-the-loop (用户在环)

While achieving top performance on the core open-source benchmarks, we realize that academic evaluations lack an understanding of real-world user interactions. Hence, we also focus on monitoring and improving user experience through our Hailuo AI <sup>4</sup> by incorporating user-in-the-loop evaluations based on real-world cases and adapting tools for better usability and performance in practical applications.

虽然在核心开源基准上达到顶尖, 作者意识到学术评测缺少对真实用户交互的理解. 因此作者也借助海螺 AI 监测和改进用户体验: 引入基于真实案例的用户在环评测, 并调整工具, 让模型在实际应用中更好用, 表现更好.

#### 5.8.1. In-House Evaluations (内部评测)

We maintain a series of in-house evaluations that include: (1) automatic assessments of General Assistant capabilities, Knowledge Q&A, Creative Writing, Hard Capability, Instruction Following, Coding, Safety, and Long Context, and (2) expert human evaluations. It’s worth noting that since our test queries are primarily derived from Hailuo AI user interactions, a significant portion of our in-house samples are in Mandarin and deeply rooted in Chinese cultural contexts.

作者维护一系列内部评测, 包括: (1) 对通用助手能力, 知识问答, 创意写作, 高难能力, 指令遵循, 编程, 安全和长上下文的自动评估; (2) 专家人工评估. 值得一提的是, 测试查询主要来自海螺 AI 的用户交互, 所以相当一部分内部样本是普通话, 且深深植根于中国文化语境.

Our results indicate a notable discrepancy between performance on academic benchmarks and actual user experience, where leading open-source and commercial models can underperform when used as interactive assistants. We show in Table 12 <sup>5</sup>that, through our dedicated efforts, MiniMax-Text-01 is able to handle these situations quite well. In general, our model outperforms other models in common Assistant scenarios, particularly when compared to open-source counterparts. This superiority is most evident in our Creative Writing (Appendix B.5, B.7, B.6) and Knowledge Q&A collections, where it aligns more closely with user intentions than other models, delivering accurate and detailed responses to a wide range of queries. In productivity scenarios that require Long Context (Appendix B.3), such as document translation, summarization, and analysis, our model demonstrates high proficiency and reliability. Moreover, we prioritize the safety of our model, as it achieves top-tier performance on our established in-house Safety benchmarks.

结果显示, 学术基准成绩与实际用户体验之间差距明显, 领先的开源和商用模型作为交互助手使用时可能表现不佳. 表 12 显示, 经过专门努力, MiniMax-Text-01 能较好地应对这些情况. 总体上, 在常见的助手场景中本文模型优于其他模型, 与开源模型相比尤其如此. 这种优势在创意写作 (附录 B.5, B.7, B.6) 和知识问答集合上最明显: 它比其他模型更贴近用户意图, 对各种查询给出准确详细的回答. 在需要长上下文的生产力场景 (附录 B.3), 如文档翻译, 摘要和分析中, 模型表现出很高的熟练度和可靠性. 此外作者重视模型安全, 模型在内部安全基准上达到一线水平.

<small><span class="docvortex-page-footnote" data-block-type="page_footnote" style="color:#6b7280"><sup>4</sup>[https://www.hailuo.ai/](https://www.hailuo.ai/)</span></small>

脚注 4: 海螺 AI 网址 https://www.hailuo.ai/.

<small><span class="docvortex-page-footnote" data-block-type="page_footnote" style="color:#6b7280"><sup>5</sup>We omit scores for in-applicable models.</span></small>

脚注 5: 不适用的模型不列分数.

<!-- page 34 of 68 -->

Table 12 | Performance comparison of MiniMax-Text-01 on in-house benchmarks.

表 12 | MiniMax-Text-01 在内部基准上的表现对比.

|  | General Assistant | Hard Capability | Creative Writing | Knowledge Q&amp;A | Instruction Following | Coding | Safety | Long Context |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| GPT-4o (11-20) | 70.9 | 73.5 | 70.3 | 69.2 | 50.4 | 94.0 | 85.4 | 86.2 |
| GPT-4o (08-06) | 63.5 | 62.0 | 66 | 68.0 | 49.1 | 93.6 | 79.7 | 58.3 |
| GPT-4o (05-13) | 67.7 | 63.3 | 58.3 | 69.6 | 49.6 | 93.2 | 79.7 | 77.2 |
| Claude-3.5-Sonnet (10-22) | 66.8 | 68.3 | 54.3 | 52.0 | 61.5 | 94.4 | 92.9 | 47.1 |
| Claude-3.5-Sonnet (06-20) | 60.5 | 67.4 | 51.0 | 51.8 | 64.4 | 93.6 | 95.0 | 47.1 |
| Gemini-2.0-Flash (exp) | 70.1 | 61.8 | 70.0 | 75.1 | 39.9 | 86.5 | 66.2 | 81.9 |
| Qwen2.5-72B-Inst. | 66.4 | 66.1 | 61.7 | 68.9 | 34.1 | 93.9 | - | 81.5 |
| DeepSeek-V3 | 66.8 | 68.7 | 64.6 | 77.0 | 51.8 | 94.0 | 74.9 | 77.8 |
| Llama-3.1-405B-Inst. | 53.3 | - | 63.6 | 46.0 | 50.3 | 87.6 | 70.7 | 60.3 |
| MiniMax-Text-01 | 73.9 | 64.8 | 81.3 | 78.6 | 46.3 | 90.2 | 90.9 | 93.8 |

Meanwhile, we are agile in gathering and updating complex productivity scenarios with multilevel instruction following requests at which our model fails and current LLMs cannot master, constructing our Harder Capability and Instruction Following in-house evaluations. While leading LLMs tend to underperform in these sets, these requests reflect our model’s limitations when given multi-level instructions, which stems primarily from insufficient training data for specific instruction types. Moving forward, we are committed to substantially expanding our training dataset with high-quality, targeted content to address these gaps and improve model capabilities.

同时, 作者持续快速地收集和更新复杂的生产力场景, 这些场景带有多层级的指令遵循要求, 本文模型会失败, 现有 LLM 也掌握不了, 由此构成内部的高难能力和指令遵循评测. 领先 LLM 在这些集合上普遍表现不佳; 这些请求反映了本文模型面对多层级指令时的局限, 主要原因是特定指令类型的训练数据不足. 接下来作者会用高质量, 有针对性的内容大幅扩充训练数据, 弥补这些不足.

#### 5.8.2. Search in Hailuo AI (海螺 AI 中的搜索)

During user interaction case studies, we find a model’s capability to utilize search tools can compensate for the limited knowledge boundary by accessing real-time, extensive, and precise information from the web. To maximize the model’s benefits from search while minimizing additional performance degradation, we first carefully pre-define the scope of search scenarios, which cover approximately 30 ∼ 40% of user queries, including but not limited to precision-demanding, domain-specific, and time-sensitive requests. Meanwhile, to ensure a seamless conversation experience, we define the system as invoking tools directly through special tokens, which avoid the complexity of multi-step planning (Chen et al., 2024b) or chain-of-thought reasoning<sup>6</sup>that might disrupt the natural flow of the interactions. We create SFT datasets comprising search and non-search decisions across diverse domains, while carefully controlling for other interaction features unrelated to search decisions, such as conversation length, to maintain uniform data distribution across each dimension and prevent overfitting. Importantly, we employ the corresponding reward model of each sample to ensure response quality, failing at which would introduce suboptimal samples into the training data, potentially affecting the model’s fundamental capabilities. The search decision boundary was calibrated to align with the model’s knowledge boundaries, discarding samples that our model already masters from the search corpus, such as general Chinese knowledge Q&A. After careful assessments by human evaluation experts, we conclude that our model’s use of the search tool extensively improved user experience, landing at a performance leap from 58% to 71.5% on our out-of-domain Hailuo AI end-to-end evaluation (Appendix B.9). Since we are unsure whether other LLM-based assistants include similar search tools, we refrain from making unfair performance comparisons.

在用户交互案例研究中, 作者发现模型使用搜索工具的能力可以从网络获取实时, 广泛, 准确的信息, 弥补有限的知识边界. 为了让模型从搜索中获益最大, 同时把额外的性能损失降到最低, 作者先仔细预定义搜索场景的范围, 覆盖约 30 ∼ 40% 的用户查询, 包括但不限于要求精确, 领域专门和时效性强的请求. 同时, 为保证对话流畅, 系统被定义为通过特殊 token 直接调用工具, 避免可能打断交互自然节奏的多步规划或 CoT 推理. 作者构建了跨多个领域, 包含搜索与不搜索决策的 SFT 数据集, 并仔细控制与搜索决策无关的其他交互特征 (如对话长度), 让各维度的数据分布均匀, 防止过拟合. 重要的是, 每个样本都用相应的奖励模型保证回复质量, 否则会把次优样本带进训练数据, 可能影响模型的基础能力. 搜索决策的边界按模型的知识边界校准, 模型已经掌握的样本 (如一般的中文知识问答) 从搜索语料中剔除. 经人工评估专家仔细评估, 作者认为模型使用搜索工具大幅改善了用户体验, 在海螺 AI 的领域外端到端评测上从 58% 跃升到 71.5% (附录 B.9). 由于不确定其他基于 LLM 的助手是否包含类似搜索工具, 作者不做不公平的性能比较.

<small><span class="docvortex-page-footnote" data-block-type="page_footnote" style="color:#6b7280"><sup>6</sup>[https://docs.anthropic.com/en/docs/build-with-claude/tool-use](https://docs.anthropic.com/en/docs/build-with-claude/tool-use)</span></small>

脚注 6: Anthropic 工具调用文档 https://docs.anthropic.com/en/docs/build-with-claude/tool-use.

<!-- page 35 of 68 -->

## 6. Vision-language Model (视觉语言模型)

By integrating an image encoder and an image adapter into our MiniMax-Text-01 model, we develop MiniMax-VL-01, which extends the capabilities of the model to visual understanding tasks. To ensure robust visual understanding, we design a proprietary dataset and implement a multi-stage training strategy, where the newly introduced image encoder and adapter first undergo large-scale visual pre-training, followed by comprehensive fine-tuning of the entire pipeline.

在 MiniMax-Text-01 上接入图像编码器和图像适配器, 作者开发出 MiniMax-VL-01, 把模型能力扩展到视觉理解任务. 为保证稳健的视觉理解, 作者设计了专有数据集, 并实施多阶段训练策略: 新引入的图像编码器和适配器先做大规模视觉预训练, 再对整条流水线做全面微调.

In the following section, we begin with a comprehensive description of the dataset used for training our image encoder and vision-language model. Subsequently, we provide an in-depth overview of the model architecture, followed by an exposition of our four-stage training regimen. We conclude the section by presenting our benchmark results.

下面先全面介绍训练图像编码器和视觉语言模型所用的数据集, 再深入概述模型架构, 然后说明四阶段训练方案, 最后给出基准评测结果.

### 6.1. Multimodal Data (多模态数据)

#### 6.1.1. Caption Data (图文描述数据)

To pre-train the vision encoder, we curate a substantial image-caption dataset by aggregating and filtering data from internet sources. Our Vision Transformer (ViT) is trained using 694 million unique image-caption pairs. To enhance data quality, we acquire refined captions for 180 million images within these pairs. During the training process, we employ an augmentation strategy by randomly sampling raw and refined captions with equal probability (𝑝 = 0.5).

为预训练视觉编码器, 作者从互联网来源汇集并过滤数据, 整理出大规模图文描述数据集. Vision Transformer (ViT) 用 6.94 亿对去重的图文对训练. 为提高数据质量, 作者为其中 1.8 亿张图获取了精修的描述. 训练时采用增强策略, 以相同概率 (p = 0.5) 随机采样原始描述或精修描述.

#### 6.1.2. Description Data (详细描述数据)

In existing vision-language models, the utility of descriptive imagery for model training has been well-documented (Li et al., 2024a, 2022, 2023; Schuhmann et al., 2021). To further explore this avenue, we have compiled a dataset consisting of 100 million images sourced from open resources such as Common Crawl. Each image in this dataset is paired with a fine-grained description, which is initially synthesized by a caption model and subsequently refined through humans. On average, these descriptions comprise approximately 300 text tokens per image. Description data serves as a robust resource for modal alignment and enhancing understanding in further training.

现有视觉语言模型中, 描述性图像数据对训练的作用已有充分记录. 为进一步探索这条路, 作者汇编了一个 1 亿张图的数据集, 来源是 Common Crawl 等公开资源. 每张图配一段细粒度描述, 先由描述模型合成, 再经人工修订; 平均每张图约 300 个文本 token. 详细描述数据是模态对齐和后续训练中增强理解的有力资源.

#### 6.1.3. Instruction Data (指令数据)

To train MiniMax-VL-01, we construct a comprehensive and diverse instruction-based dataset by synthesizing an extensive range of question-answer (QA) pairs involving visual inputs. These QA pairs are meticulously designed to cover a wide array of image-related tasks, such as text extraction, object localization, and geometry problem solving. The dataset generation process prioritizes both diversity and realism, ensuring that the instructions capture varying degrees of complexity and linguistic styles. During training, we apply an augmentation strategy by randomly sampling different types of QA prompts with balanced probabilities, thereby enabling the model to generalize effectively across diverse instructional formats and interaction patterns.

为训练 MiniMax-VL-01, 作者合成了大量涉及视觉输入的问答 (QA) 对, 构建出全面多样的指令数据集. 这些 QA 对精心设计, 覆盖多种图像相关任务, 如文字提取, 物体定位和几何解题. 数据生成兼顾多样性和真实性, 让指令体现不同的复杂度和语言风格. 训练时采用增强策略, 以均衡的概率随机采样不同类型的 QA 提示, 让模型在各种指令格式和交互模式上有效泛化.

<!-- page 36 of 68 -->

#### 6.1.4. Data Distribution (数据分布)

To demonstrate the diversity of our VLM data, we uniformly sample 1 million imageinstruction pairs from the instruction data and use another VLM to assign a concise tag (e.g., object localization) that represents the primary capability required for each pair. This analysis yielded around 50,000 unique tags, and the top 2,817 tags appeared more than 10 times. The distribution of these prominent tags is visual ized in Figure 17, where we further group these top tags into 14 major categories.

为展示 VLM 数据的多样性, 作者从指令数据中均匀抽取 100 万个图像-指令对, 用另一个 VLM 给每对打一个简洁的标签 (如物体定位), 代表该对所需的主要能力. 分析得到约 50,000 个不同标签, 其中前 2,817 个标签出现超过 10 次. 这些高频标签的分布可视化在图 17 中, 作者进一步把它们归为 14 个大类.

### 6.2. Architecture (架构)

#### 6.2.1. Overall Architecture (整体架构)

Our MiniMax-VL-01 architecture adheres to the “ViT-MLP-LLM” paradigm, which has been widely embraced in numerous multimodal large language models (MLLMs). The architecture consists of three main components: a Vision Transformer (ViT) with 303 million parameters for visual encoding, a two-layer MLP projector initialized randomly for image adaptation, and the MiniMax-Text-01 model serving as the foundational large language model (LLM).

MiniMax-VL-01 的架构遵循多模态大语言模型 (MLLM) 中广泛采用的 「ViT-MLP-LLM」 范式, 由三部分组成: 3.03 亿参数的 Vision Transformer (ViT) 做视觉编码, 随机初始化的两层 MLP 投影器做图像适配, MiniMax-Text-01 作为基础大语言模型 (LLM).

![图 17 抽样指令数据的标签旭日图: 内圈是聚类大类及占比, 如图像与视觉分析 20.6%, 物体与属性识别 18.8%; 外圈是每类前 10 个标签](images/p36-figure-17-visualization-of-top-tags-of-sampled.png)

Figure 17 | Visualization of top tags of sampled instruction data. The category and percentage for each group of clustered tags are displayed in the inner layer, only top-10 tags of each group are displayed for clarity.

图 17 | 抽样指令数据中高频标签的可视化. 内层显示每组聚类标签的类别和占比, 为清楚起见每组只显示前 10 个标签.

We implement a dynamic resolution strategy by resizing the input image according to a predefined grid configuration list, ranging from 336×336 to 2016×2016, while maintaining a standard thumbnail at a resolution of 336 × 336. The resized images are subsequently partitioned into non-overlapping patches, each measuring 336 × 336. Both the image patches and the thumbnail are independently encoded, and their encoded features are concatenated to construct a comprehensive image feature representation.

作者实现了动态分辨率策略: 按预定义的网格配置列表调整输入图像大小, 范围从 336×336 到 2016×2016, 同时保留一张 336 × 336 分辨率的标准缩略图. 调整后的图像切成互不重叠的 patch, 每个 336 × 336. 各 patch 和缩略图分别编码, 编码特征拼接起来, 构成完整的图像特征表示.

> **想:** 不做池化的话, 一张 2016×2016 的图会变成多少视觉 token?
> 按第 6.2.1 节估算: 2016/336 = 6, 最多 6 × 6 = 36 个 patch, 再加 1 张缩略图共 37 块; ViT-L/14 在 336 分辨率下每块是 24 × 24 = 576 个 patch 特征, 不池化就全部送进 LLM, 约 21,312 个视觉 token (假设两层 MLP 投影器不改变 token 数). 这正是下一段说 「利用长序列处理能力直接使用原始高维特征」 的代价, 第 6.4 节的 MMLongBench-Doc 一次喂多页图时, 序列会迅速到十万量级.

In contrast to traditional approaches that rely on pooling or other downsampling techniques to compress feature representations, our model leverages its powerful capacity for processing long sequences, allowing for the direct utilization of raw high-dimensional features during training. This strategy mitigates potential information loss and substantially improves the model’s adaptability to multi-scale inputs. Moreover, by projecting both image patches and thumbnails into a unified feature space, our method significantly enhances the model’s robustness and representational expressiveness when handling diverse and complex visual inputs.

传统方法依靠池化或其他下采样技术压缩特征表示, 本文模型则利用强大的长序列处理能力, 训练时直接使用原始高维特征. 这一策略减轻了潜在的信息损失, 明显提升模型对多尺度输入的适应能力. 此外, 把图像 patch 和缩略图投影到统一的特征空间, 显著增强了模型处理多样复杂视觉输入时的稳健性和表达力.

#### 6.2.2. Vision Encoder (视觉编码器)

We employ a lightweight ViT-L/14 (Dosovitskiy et al., 2021) as the foundational structure for our vision encoder and train it from scratch. Following a standard pipeline, the input image tensor is initially processed through a convolutional layer to extract discrete patches, to which absolute positional embeddings are subsequently appended. The resulting tensors are then passed through a series of multi-head residual attention blocks. This architecture is particularly effective in capturing intricate visual details and the complex interrelationships within images.

视觉编码器以轻量的 ViT-L/14 为基础结构, 从头训练. 按标准流程, 输入图像张量先经一个卷积层提取离散的 patch, 再加上绝对位置嵌入. 得到的张量随后经过一系列多头残差注意力块. 这种架构特别善于捕捉图像中的细微视觉细节和复杂关系.

<!-- page 37 of 68 -->

We utilize contrastive learning to enhance the alignment between corresponding image-caption pairs while diminishing the alignment between non-corresponding pairs. Specifically, we follow the approach introduced in CoCa (Yu et al., 2022), which augments image-text contrastive learning with an additional decoder and image-text cross-attention mechanisms. The network is jointly optimized using a combination of contrastive loss and cross-entropy loss.

作者用对比学习增强对应图文对之间的对齐, 同时减弱不对应图文对之间的对齐. 具体沿用 CoCa 的做法: 在图文对比学习之外增加一个解码器和图文交叉注意力. 网络用对比损失和交叉熵损失联合优化.

Our ViT-L/14 model is initially trained at a resolution of 224 × 224 for 37 billion image-caption pairs and subsequently fine-tuned at 336 × 336 for 1.2 billion pairs. For both resolutions, the captions are truncated to 76 tokens. Our ViT-L/14 encoder achieves a zero-shot classification accuracy of 80.55% at 336 × 336 resolution on the ImageNet-1K dataset.

ViT-L/14 先在 224 × 224 分辨率下训练 370 亿个图文对, 再在 336 × 336 下微调 12 亿对. 两种分辨率下描述都截断到 76 个 token. 该 ViT-L/14 编码器在 ImageNet-1K 上 336 × 336 分辨率的零样本分类准确率为 80.55%.

### 6.3. Training Recipes (训练配方)

We employ a four-stage training strategy to enable the model to progressively develop comprehensive multimodal understanding capabilities while retaining its language understanding skills. Additionally, the model’s question-answering and instruction-following abilities, as well as its alignment with human preferences, are methodically refined throughout these stages.

作者采用四阶段训练策略, 让模型逐步形成全面的多模态理解能力, 同时保留语言理解能力. 模型的问答和指令遵循能力, 以及与人类偏好的对齐, 也在这几个阶段中逐步完善.

**Stage I: Modality alignment.** In this stage, our primary objective is to achieve alignment between visual and text tokens by enabling the model to accurately generate appropriate captions for given images. To this end, we update the weights of both the image adapter and the vision encoder to optimize their performance in this multimodal task. During this phase, we utilize a total of 80 billion tokens sampled from our image description dataset. Empirically, we have found that increasing the image resolution does not yield improvements in downstream task accuracy. Therefore, all images are processed at a fixed resolution of 336 × 336 to reduce computational costs.

**阶段 I: 模态对齐.** 这一阶段的主要目标是让视觉 token 与文本 token 对齐, 使模型能为给定图像准确生成合适的描述. 为此, 图像适配器和视觉编码器的权重都参与更新, 优化它们在这项多模态任务上的表现. 此阶段共使用从图像详细描述数据集中采样的 800 亿 token. 经验上, 提高图像分辨率并不能提升下游任务准确率, 所以所有图像都用固定的 336 × 336 分辨率处理, 以降低计算成本.

**Stage II: Enhancement of Vision Understanding.** This stage can be regarded as a standard instruction tuning phase, during which all model parameters are open to updates. The primary goal is to align the model’s output with human instructions and enhance its ability to perform a diverse range of vision understanding tasks. To achieve this, the model is trained using 420 billion multimodal tokens sampled from our instruction datasets, combined with MiniMax-Text-01 post-training data in a ratio of 20:1. This approach ensures that the language modeling capability is maintained while the model acquires new multimodal capabilities.

**阶段 II: 增强视觉理解.** 这一阶段可视为标准的指令微调阶段, 模型全部参数开放更新. 主要目标是让模型输出与人类指令对齐, 并增强执行各类视觉理解任务的能力. 为此, 模型用从指令数据集采样的 4200 亿多模态 token 训练, 并与 MiniMax-Text-01 的后训练数据按 20:1 混合, 保证模型获得新的多模态能力时保持语言建模能力.

**Stage III: Enhancement of User Experience.** This stage is designed to further enhance the model’s capabilities in real-world scenarios and when handling challenging user inputs. We curate sophisticated multimodal data using images sourced from applications that people commonly interact with. Conversations are meticulously labeled to emulate authentic user input and to ensure the provision of accurate, helpful, and diverse responses across multiple conversational turns. The data construction for this stage is guided by an independent human-labeled test set that prioritizes not only accuracy but also the overall quality in terms of user experience. The resulting dataset comprises 44.8 billion multimodal tokens and is trained for one epoch.

**阶段 III: 增强用户体验.** 这一阶段进一步提升模型在真实场景中和面对高难用户输入时的能力. 作者用来自人们常用应用的图像整理出精细的多模态数据. 对话经过仔细标注, 模拟真实用户输入, 保证在多轮对话中提供准确, 有用, 多样的回复. 这一阶段的数据构建由一个独立的人工标注测试集引导, 它不仅看准确率, 也看用户体验层面的整体质量. 最终数据集包含 448 亿多模态 token, 训练一个 epoch.

> **核对:** 摘要和引言说 MiniMax-VL-01 用 5120 亿视觉语言 token 继续训练, 第 6.3 节各阶段的 token 数加起来是多少?
> 阶段 I 800 亿, 阶段 II 4200 亿, 阶段 III 448 亿, 合计 5448 亿; 阶段 IV 只给出 40,000 个图文对. 5448 亿与 512B 差了约 330 亿. 可能的解释是阶段 II 里按 20:1 混入的 MiniMax-Text-01 后训练文本 (约 200 亿) 不算 「视觉语言 token」, 但即使扣掉也还差一百多亿; 本文没有给出 512B 的构成, 两处数字无法对齐.

**Stage IV: Enhancement of Preference.** In the final stage, we utilize Direct Preference Optimization (DPO) to further enhance model performance and user experience. We construct a training dataset consisting of 40,000 image-text pairs through the following process:

**阶段 IV: 增强偏好.** 最后一阶段用 DPO 进一步提升模型表现和用户体验. 作者按以下流程构建一个包含 40,000 个图文对的训练集:

Prompt Selection. Prompts are curated from both instruction data and real user interaction data. These prompts are selected to cover a wide range of general scenarios and to specifically address persistent issues identified after Stage III, such as occasional repetitive outputs in complex OCR scenarios.

提示词选择. 提示词取自指令数据和真实用户交互数据, 既覆盖广泛的通用场景, 也专门针对阶段 III 之后仍存在的问题, 如复杂 OCR 场景中偶尔出现的重复输出.

<!-- page 38 of 68 -->

• Response Generation. We employ diverse strategies, including: generating multiple candidate responses by varying sampling temperature parameters; creating response variants through image weakening in specific scenarios; and using MiniMax-Text-01 to deliberately introduce hallucinations or errors into high-quality responses to generate contrastive samples in specific scenarios.

回复生成. 采用多种策略: 改变采样温度生成多个候选回复; 在特定场景下通过弱化图像生成回复变体; 在特定场景下用 MiniMax-Text-01 故意往高质量回复里注入幻觉或错误, 生成对比样本.

• Reward Assignment. Large language models, particularly MiniMax-Text-01, are utilized as evaluators in this stage. Multi-dimensional evaluation criteria are designed to enable a systematic and comprehensive assessment of the relationships among prompts, ground truth answers, and generated responses.

奖励分配. 这一阶段用大语言模型, 特别是 MiniMax-Text-01, 作为评估者. 设计多维评估标准, 系统全面地评估提示词, 标准答案和生成回复之间的关系.

• Pair Construction. Based on the evaluation results, we select the highest-scoring responses as positive samples and the lowest-scoring ones as negative samples, while discarding pairs with insignificant score differences.

偏好对构建. 根据评估结果, 选得分最高的回复作正样本, 得分最低的作负样本, 丢弃分差不明显的对.

In addition to incorporating image-text pairs, we also include a significant proportion of pure text pairs, as elaborated in Section 5.4.1. It is noteworthy that when Direct Preference Optimization (DPO) is applied to highly capable foundation models, there is a propensity for overfitting. To counteract this issue, we adopt an early stopping strategy, which involves terminating the training process prior to the completion of a full epoch. This approach is designed to preserve the model’s generalization capabilities.

除图文对外, 还加入相当比例的纯文本偏好对, 详见第 5.4.1 节. 值得注意的是, 对能力很强的基础模型做 DPO 容易过拟合. 为此作者采用早停策略, 在跑完一个完整 epoch 之前终止训练, 以保留模型的泛化能力.

By following this multi-stage training strategy, we ensure that our model not only demonstrates proficiency in understanding and generating high-quality text but also aligns with human values and safety standards. This comprehensive approach to training allows us to strike a balance between model performance and ethical considerations, thereby producing a model that is both effective and responsible.

通过这一多阶段训练策略, 作者保证模型不仅能熟练理解和生成高质量文本, 也符合人类价值观和安全标准. 这种全面的训练方式在模型性能和伦理考量之间取得平衡, 得到一个既有效又负责的模型.

### 6.4. Benchmarks (基准评测)

To assess the performance of our vision-language model, we maintain a diverse set of benchmarks, including MMMU (Yue et al., 2024a), MMMU-Pro (Yue et al., 2024b), ChartQA (Masry et al., 2022), DocVQA (Mathew et al., 2021), OCRBench (Liu et al., 2024b), AI2D (Kembhavi et al., 2016), MathVista (Lu et al., 2023), OlympiadBench (He et al., 2024a), MMLongBench-Doc (Ma et al., 2024), MEGA-Bench (Chen et al., 2024a) and an in-house benchmark. These benchmarks help evaluate the model’s abilities in various areas, including knowledge, visual reasoning, mathematics, science, long context handling, and user experience. We detail our evaluation configuration for each benchmark in Appendix D. As shown in Table 13, MiniMax-VL-01 achieves competitive performance across various vision-language tasks, demonstrating the following key strengths and limitations:

为评估视觉语言模型的表现, 作者维护一组多样的基准, 包括 MMMU, MMMU-Pro, ChartQA, DocVQA, OCRBench, AI2D, MathVista, OlympiadBench, MMLongBench-Doc, MEGA-Bench 和一个内部基准, 用来评估知识, 视觉推理, 数学, 科学, 长上下文处理和用户体验等方面的能力. 各基准的评测配置见附录 D. 如表 13 所示, MiniMax-VL-01 在各类视觉语言任务上表现有竞争力, 主要的长处和局限如下:

**Common Downstream Tasks.** In standard vision-language downstream tasks, MiniMax-VL-01 exhibits performance on par with GPT-4o, particularly excelling in visual question answering. This strong performance is attributed to its extensive multi-stage training process, enabling the model to effectively understand and reason across visual and textual inputs. However, MiniMax-VL-01 still struggles with advanced mathematical reasoning tasks, as assessed by OlympiadBench (He et al., 2024a).

**常见下游任务.** 在标准视觉语言下游任务上, MiniMax-VL-01 与 GPT-4o 相当, 视觉问答尤其突出. 这归功于大规模的多阶段训练, 让模型能有效理解视觉和文本输入并在两者之间推理. 但在 OlympiadBench 考察的高等数学推理任务上, MiniMax-VL-01 仍然吃力.

**Long Context.** We assess MiniMax-VL-01’s capability for long-context comprehension and retrieval using MMLongBench-Doc (Ma et al., 2024). The results show that our model outperforms most counterparts, except GPT-4o-11-20. Despite its strong performance overall, MiniMax-VL-01 demonstrates a noticeable gap in both single-page (acc: 47.3%) and cross-page (acc: 28.4%) subsets.

**长上下文.** 作者用 MMLongBench-Doc 评估 MiniMax-VL-01 的长上下文理解和检索能力. 结果显示除 GPT-4o-11-20 外, 本文模型优于多数对手. 虽然整体表现强, MiniMax-VL-01 在单页 (acc: 47.3%) 和跨页 (acc: 28.4%) 两个子集上都有明显差距.

<!-- page 39 of 68 -->

Table 13 | Performance of MiniMax-VL-01 on academic and in-house benchmarks.

表 13 | MiniMax-VL-01 在学术基准和内部基准上的表现. 带 * 的项按 0-shot CoT 设置评测.

<table><tr><td>Tasks</td><td>GPT-4o (11-20)</td><td>Claude-3.5-Sonnet (10-22)</td><td>Gemini-1.5-Pro (002)</td><td>Gemini-2.0-Flash (exp)</td><td>Qwen2-VL-72B-Inst.</td><td>InternVL 2.5-78B</td><td>LLama-3.2-90B</td><td>MiniMax-VL-01</td></tr><tr><td colspan="9">Knowledge</td></tr><tr><td> $MMMU^{*}_{val+dev}$ </td><td>63.5</td><td>72.0</td><td>68.4</td><td>70.6</td><td>64.5</td><td>66.5</td><td>62.1</td><td>68.5</td></tr><tr><td> $MMMU-Pro^{*}_{full}$ </td><td>54.5</td><td>54.7</td><td>50.9</td><td>57.0</td><td>43.2</td><td>47.3</td><td>36.0</td><td>52.7</td></tr><tr><td colspan="9">Visual Q&amp;A</td></tr><tr><td> $ChartQA^{*}_{relaxed}$ </td><td>88.1</td><td>90.8</td><td>88.7</td><td>88.3</td><td>91.2</td><td>91.5</td><td>85.5</td><td>91.7</td></tr><tr><td>DocVQA*</td><td>91.1</td><td>94.2</td><td>91.5</td><td>92.9</td><td>97.1</td><td>96.1</td><td>90.1</td><td>96.4</td></tr><tr><td>OCRBench</td><td>806</td><td>790</td><td>800</td><td>846</td><td>856</td><td>847</td><td>805</td><td>865</td></tr><tr><td colspan="9">Mathematics &amp; Sciences</td></tr><tr><td>AI2D*</td><td>83.1</td><td>82.0</td><td>80.9</td><td>85.1</td><td>84.4</td><td>86.8</td><td>78.9</td><td>83.3</td></tr><tr><td> $MathVista^{*}_{testmini}$ </td><td>62.1</td><td>65.4</td><td>70.6</td><td>73.1</td><td>69.6</td><td>68.4</td><td>57.3</td><td>68.6</td></tr><tr><td> $OlympiadBench_{full}$ </td><td>25.2</td><td>28.4</td><td>32.1</td><td>46.1</td><td>21.9</td><td>25.1</td><td>19.3</td><td>24.2</td></tr><tr><td colspan="9">Long Context</td></tr><tr><td>M-LongDocacc</td><td>41.4</td><td>31.4</td><td>26.2</td><td>31.4</td><td>11.6</td><td>19.7</td><td>13.9</td><td>32.5</td></tr><tr><td colspan="9">Comprehensive</td></tr><tr><td> $MEGA-Bench_{macro}$ </td><td>49.4</td><td>51.4</td><td>45.9</td><td>53.9</td><td>46.8</td><td>45.3</td><td>19.9</td><td>47.4</td></tr><tr><td colspan="9">User Experience</td></tr><tr><td>In-house Benchmark</td><td>62.3</td><td>47.0</td><td>49.2</td><td>72.1</td><td>40.6</td><td>34.8</td><td>13.6</td><td>56.6</td></tr><tr><td colspan="9">* Evaluated following a 0-shot CoT setting.</td></tr></table>

**Comprehensive Benchmark.** On the recently introduced MEGA-Bench (Chen et al., 2024a), a realistic and comprehensive evaluation suite, MiniMax-VL-01 shows competitive overall capabilities, surpassing existing open-source vision LLMs. While it excels in diverse sub-tasks such as knowledge and coding, the model faces challenges in more complex tasks, including planning and metric assessments.

**综合基准.** 在新近推出的真实, 综合评测套件 MEGA-Bench 上, MiniMax-VL-01 整体能力有竞争力, 超过现有开源视觉 LLM. 它在知识, 编程等多种子任务上表现出色, 但在规划和指标评估等更复杂的任务上面临挑战.

**In-house User Experience Benchmark.** While academic benchmarks often focus on problem solving, they frequently fail to capture the nuances of real-world user interactions with models. To bridge this gap, we develop an in-house benchmark comprising 90 diverse image-related tasks, each designed with tailored and challenging instructions. The images and instructions in the benchmark are strictly deduplicated to not overlap with the training set at any stage. Task relevance is manually verified, with a detailed checklist annotated for each sample to ensure precise evaluation. The final test set consists of 524 meticulously annotated samples in both Chinese and English, but Chinese is primarily used. We illustrate some samples in Appendix C. In a win-rate comparison against a top-leading vision-language model, our model outperforms all open-source models and approaches the performance of GPT-4o-11-20 with a narrow margin.

**内部用户体验基准.** 学术基准往往聚焦解题, 常常捕捉不到真实用户与模型交互的细微之处. 为弥补这一差距, 作者开发了一个内部基准, 包含 90 种多样的图像相关任务, 每种都配有定制的高难指令. 基准中的图像和指令经过严格去重, 与任何阶段的训练集都不重叠. 任务相关性经人工核验, 每个样本都标注了详细的检查清单, 保证评估精确. 最终测试集包含 524 个精心标注的中英文样本, 以中文为主. 部分样本见附录 C. 在与一个顶尖视觉语言模型的胜率比较中, 本文模型超过所有开源模型, 与 GPT-4o-11-20 只差一点.

> **看表:** 表 13 最后一行内部基准里分数最高的是谁? 正文 「接近 GPT-4o-11-20」 的比较范围包括它吗?
> 表 13 内部基准一行最高的是 Gemini-2.0-Flash (exp) 的 72.1, 其次 GPT-4o 62.3, 本文模型 56.6. 正文只和开源模型及 GPT-4o 比, 没有提 Gemini-2.0-Flash; 而且这一行是 「对一个顶尖模型的胜率」, 参照模型是谁本文没有写, 各列之间只能比相对高低.

## 7. Conclusion and Future work

In this report, we present MiniMax-Text-01 and MiniMax-VL-01, two novel models developed entirely from the ground up. These models demonstrate top-tier performance across standard benchmarks, particularly excelling in long-context processing with the ability to handle context windows of up to 4 million tokens. Our research findings challenge the prevailing assumption that state-of-the-art language models must be built upon traditional attention mechanisms. By strategically integrating linear attention with optimized hardware utilization and carefully designing training recipes, we have successfully expanded the context window by an order of magnitude. This breakthrough not only enhances the efficiency and scalability of LLMs but also paves the way for future models to support even longer context windows and facilitate the development of more sophisticated AI agents. To promote collaboration and advancement in the field, we have made our model publicly available at [https://github.com/MiniMax-AI](https://github.com/MiniMax-AI). For general use and evaluation, we provide a Chatbot with online search capabilities [(https://www.hailuo.ai/)](https://www.hailuo.ai/) and the online API [(https://intl.minimaxi.com)](https://intl.minimaxi.com). We are committed to keeping this series open source and will release updates as we develop improved models.

本报告介绍 MiniMax-Text-01 和 MiniMax-VL-01 两个完全从零开发的新模型. 它们在标准基准上表现一线, 长上下文处理尤其出色, 能处理最长 400 万 token 的上下文窗口. 研究结果挑战了 「最先进的语言模型必须建立在传统注意力机制之上」 这一流行假设. 通过有策略地把线性注意力与优化的硬件利用结合, 并精心设计训练配方, 作者成功把上下文窗口扩大了一个数量级. 这一突破不仅提升了 LLM 的效率和可扩展性, 也为未来模型支持更长的上下文窗口, 发展更复杂的 AI agent 铺路. 为促进领域内的合作与进步, 模型已在 https://github.com/MiniMax-AI 公开. 日常使用和评估方面, 作者提供带在线搜索能力的聊天机器人 (https://www.hailuo.ai/) 和在线 API (https://intl.minimaxi.com). 作者承诺保持这一系列开源, 并随改进模型的开发发布更新.

<!-- page 40 of 68 -->

While MiniMax-Text-01 and MiniMax-VL-01 show strong performance in general language and vision-language tasks, we acknowledge several limitations that necessitate further exploration:

虽然 MiniMax-Text-01 和 MiniMax-VL-01 在通用语言和视觉语言任务上表现强劲, 作者承认有几项局限需要进一步探索:

1. **Long-Context Evaluation**: Current evaluation datasets for long-context retrieval tasks are primarily designed for artificial or simplified scenarios, and the assessment of long-text reasoning capabilities remains limited in practical applications such as document analysis. We plan to enhance long-context retrieval in more realistic settings and expand the evaluation of longcontext reasoning across a wider array of tasks.

1. **长上下文评测**: 现有的长上下文检索评测数据集主要为人工或简化场景设计, 对文档分析等实际应用中长文本推理能力的评估仍然有限. 作者计划在更真实的设置中加强长上下文检索, 并在更广的任务上扩展长上下文推理评测.

2. **Model Architecture**: The model currently retains a 1/8 component with vanilla softmax attention. We are investigating more efficient architectures that can eliminate softmax attention entirely, potentially enabling unlimited context windows without computational overhead.

2. **模型架构**: 模型目前仍保留 1/8 的标准 softmax attention 成分. 作者正在研究能完全去掉 softmax attention 的更高效架构, 有望实现无计算开销的无限上下文窗口.

3. **Complex Programming Tasks**: The model’s performance on advanced programming tasks is to be improved, as the coding dataset in our pre-training stage is still limited at the moment. We are continuously improving training data selection and refining continue training procedures to address these limitations in the next model version.

3. **复杂编程任务**: 模型在高级编程任务上的表现有待提升, 因为目前预训练阶段的代码数据集仍然有限. 作者正在持续改进训练数据选择, 完善继续训练流程, 在下一版模型中解决这些局限.

## References

Marah Abdin, Jyoti Aneja, Harkirat Behl, Sébastien Bubeck, Ronen Eldan, Suriya Gunasekar, Michael Harrison, Russell J Hewett, Mojan Javaheripi, Piero Kauffmann, et al. Phi-4 technical report. arXiv preprint arXiv:2412.08905, 2024.

Rishabh Agarwal, Avi Singh, Lei M Zhang, Bernd Bohnet, Luis Rosias, Stephanie Chan, Biao Zhang, Ankesh Anand, Zaheer Abbas, Azade Nova, et al. Many-shot in-context learning. arXiv preprint arXiv:2404.11018, 2024.

Joshua Ainslie, James Lee-Thorp, Michiel de Jong, Yury Zemlyanskiy, Federico Lebron, and Sumit Sanghai. GQA: Training generalized multi-query transformer models from multi-head checkpoints. In Proceedings of the 2023 Conference on Empirical Methods in Natural Language Processing, pages 4895–4901, 2023.

Anthropic. Introducing claude 3.5 sonnet, 2024. URL [https://www.anthropic.com/news/claude-3-5-sonnet](https://www.anthropic.com/news/claude-3-5-sonnet).

Jacob Austin, Augustus Odena, Maxwell Nye, Maarten Bosma, Henryk Michalewski, David Dohan, Ellen Jiang, Carrie Cai, Michael Terry, Quoc Le, et al. Program synthesis with large language models. arXiv preprint arXiv:2108.07732, 2021.

Alexei Baevski and Michael Auli. Adaptive input representations for neural language modeling. arXiv preprint arXiv:1809.10853, 2018.

<!-- page 41 of 68 -->

Yuntao Bai, Andy Jones, Kamal Ndousse, Amanda Askell, Anna Chen, Nova DasSarma, Dawn Drain, Stanislav Fort, Deep Ganguli, Tom Henighan, et al. Training a helpful and harmless assistant with reinforcement learning from human feedback. arXiv preprint arXiv:2204.05862, 2022a.

Yuntao Bai, Saurav Kadavath, Sandipan Kundu, Amanda Askell, Jackson Kernion, Andy Jones, Anna Chen, Anna Goldie, Azalia Mirhoseini, Cameron McKinnon, et al. Constitutional AI: Harmlessness from AI feedback. arXiv preprint arXiv:2212.08073, 2022b.

Yushi Bai, Shangqing Tu, Jiajie Zhang, Hao Peng, Xiaozhi Wang, Xin Lv, Shulin Cao, Jiazheng Xu, Lei Hou, Yuxiao Dong, Jie Tang, and Juanzi Li. LongBench v2: Towards deeper understanding and reasoning on realistic long-context multitasks. arXiv preprint arXiv:2412.15204, 2024.

Iz Beltagy, Matthew E Peters, and Arman Cohan. Longformer: The long-document transformer. arXiv preprint arXiv:2004.05150, 2020.

Yonatan Bisk, Rowan Zellers, Jianfeng Gao, Yejin Choi, et al. PIQA: Reasoning about physical commonsense in natural language. In Proceedings of the AAAI conference on artificial intelligence, volume 34, pages 7432–7439, 2020.

Andrei Z Broder. On the resemblance and containment of documents. In Proceedings. Compression and Complexity of SEQUENCES 1997 (Cat. No. 97TB100171), pages 21–29. IEEE, 1997.

Tom Brown, Benjamin Mann, Nick Ryder, Melanie Subbiah, Jared D Kaplan, Prafulla Dhariwal, Arvind Neelakantan, Pranav Shyam, Girish Sastry, Amanda Askell, et al. Language models are few-shot learners. Advances in neural information processing systems, 33:1877–1901, 2020.

Jiacheng Chen, Tianhao Liang, Sherman Siu, Zhengqing Wang, Kai Wang, Yubo Wang, Yuansheng Ni, Wang Zhu, Ziyan Jiang, Bohan Lyu, et al. MEGA-Bench: Scaling multimodal evaluation to over 500 real-world tasks. arXiv preprint arXiv:2410.10563, 2024a.

Mark Chen, Jerry Tworek, Heewoo Jun, Qiming Yuan, Henrique Ponde De Oliveira Pinto, Jared Kaplan, Harri Edwards, Yuri Burda, Nicholas Joseph, Greg Brockman, et al. Evaluating large language models trained on code. arXiv preprint arXiv:2107.03374, 2021.

Zehui Chen, Kuikun Liu, Qiuchen Wang, Jiangning Liu, Wenwei Zhang, Kai Chen, and Feng Zhao. MindSearch: Mimicking human minds elicits deep ai searcher. arXiv preprint arXiv:2407.20183, 2024b.

Rewon Child, Scott Gray, Alec Radford, and Ilya Sutskever. Generating long sequences with sparse transformers. arXiv preprint arXiv:1904.10509, 2019.

Aakanksha Chowdhery, Sharan Narang, Jacob Devlin, Maarten Bosma, Gaurav Mishra, Adam Roberts, Paul Barham, Hyung Won Chung, Charles Sutton, Sebastian Gehrmann, et al. PaLM: Scaling language modeling with pathways. Journal of Machine Learning Research, 24(240):1–113, 2023.

Aidan Clark, Diego de Las Casas, Aurelia Guy, Arthur Mensch, Michela Paganini, Jordan Hoffmann, Bogdan Damoc, Blake Hechtman, Trevor Cai, Sebastian Borgeaud, et al. Unified scaling laws for routed language models. In International Conference on Machine Learning (ICML), pages 4057–4086. PMLR, 2022.

Christopher Clark, Kenton Lee, Ming-Wei Chang, Tom Kwiatkowski, Michael Collins, and Kristina Toutanova. BoolQ: Exploring the surprising difficulty of natural yes/no questions. In Proceedings of the 2019 Conference of the North American Chapter of the Association for Computational Linguistics: Human Language Technologies, Volume 1 (Long and Short Papers), pages 2924–2936, 2019.

<!-- page 42 of 68 -->

Peter Clark, Isaac Cowhey, Oren Etzioni, Tushar Khot, Ashish Sabharwal, Carissa Schoenick, and Oyvind Tafjord. Think you have solved question answering? try ARC, the AI2 reasoning challenge. arXiv preprint arXiv:1803.05457, 2018.

Karl Cobbe, Vineet Kosaraju, Mohammad Bavarian, Mark Chen, Heewoo Jun, Lukasz Kaiser, Matthias Plappert, Jerry Tworek, Jacob Hilton, Reiichiro Nakano, et al. Training verifiers to solve math word problems. arXiv preprint arXiv:2110.14168, 2021.

Tri Dao. FlashAttention-2: Faster attention with better parallelism and work partitioning. In The Twelfth International Conference on Learning Representations, 2024. URL [https://openreview.net/forum?id=mZn2Xyh9Ec](https://openreview.net/forum?id=mZn2Xyh9Ec).

Tri Dao and Albert Gu. Transformers are ssms: Generalized models and efficient algorithms through structured state space duality. arXiv preprint arXiv:2405.21060, 2024.

Tri Dao, Dan Fu, Stefano Ermon, Atri Rudra, and Christopher Ré. FlashAttention: Fast and memoryefficient exact attention with io-awareness. Advances in Neural Information Processing Systems, 35: 16344–16359, 2022.

Alexandre de Brébisson and Pascal Vincent. A cheap linear attention mechanism with fast lookups and fixed-size representations. arXiv preprint arXiv:1609.05866, 2016.

DeepSeek-AI. DeepSeek-V3 technical report, 2024. URL [https://arxiv.org/abs/2412.19437](https://arxiv.org/abs/2412.19437).

Qingxiu Dong, Lei Li, Damai Dai, Ce Zheng, Jingyuan Ma, Rui Li, Heming Xia, Jingjing Xu, Zhiyong Wu, Baobao Chang, et al. A survey on in-context learning. In Proceedings of the 2024 Conference on Empirical Methods in Natural Language Processing, pages 1107–1128, 2024.

Alexey Dosovitskiy, Lucas Beyer, Alexander Kolesnikov, Dirk Weissenborn, Xiaohua Zhai, Thomas Unterthiner, Mostafa Dehghani, Matthias Minderer, Georg Heigold, Sylvain Gelly, Jakob Uszkoreit, and Neil Houlsby. An image is worth 16x16 words: Transformers for image recognition at scale. In International Conference on Learning Representations, 2021. URL [https://openreview.net/forum?id=YicbFdNTTy](https://openreview.net/forum?id=YicbFdNTTy).

Dheeru Dua, Yizhong Wang, Pradeep Dasigi, Gabriel Stanovsky, Sameer Singh, and Matt Gardner. DROP: A reading comprehension benchmark requiring discrete reasoning over paragraphs. In Proceedings of the 2019 Conference of the North American Chapter of the Association for Computational Linguistics: Human Language Technologies, Volume 1 (Long and Short Papers), pages 2368–2378, 2019.

Abhimanyu Dubey, Abhinav Jauhri, Abhinav Pandey, Abhishek Kadian, Ahmad Al-Dahle, Aiesha Letman, Akhil Mathur, Alan Schelten, Amy Yang, Angela Fan, et al. The Llama 3 herd of models. arXiv preprint arXiv:2407.21783, 2024.

William Fedus, Barret Zoph, and Noam Shazeer. Switch transformers: Scaling to trillion parameter models with simple and efficient sparsity. Journal of Machine Learning Research, 23(120):1–39, 2022.

Leo Gao, Tom Dupré la Tour, Henk Tillman, Gabriel Goh, Rajan Troll, Alec Radford, Ilya Sutskever, Jan Leike, and Jeffrey Wu. Scaling and evaluating sparse autoencoders. arXiv preprint arXiv:2406.04093, 2024.

Paolo Glorioso, Quentin Anthony, Yury Tokpanov, James Whittington, Jonathan Pilault, Adam Ibrahim, and Beren Millidge. Zamba: A compact 7b SSM hybrid model. arXiv preprint arXiv:2405.16712, 2024.

<!-- page 43 of 68 -->

Xavier Glorot and Yoshua Bengio. Understanding the difficulty of training deep feedforward neural networks. In Proceedings of the thirteenth international conference on artificial intelligence and statistics, pages 249–256. JMLR Workshop and Conference Proceedings, 2010.

Albert Gu and Tri Dao. Mamba: Linear-time sequence modeling with selective state spaces. In First Conference on Language Modeling, 2024. URL [https://openreview.net/forum?id=tEYskw1VY2](https://openreview.net/forum?id=tEYskw1VY2).

Suriya Gunasekar, Yi Zhang, Jyoti Aneja, Caio César Teodoro Mendes, Allie Del Giorno, Sivakanth Gopi, Mojan Javaheripi, Piero Kauffmann, Gustavo de Rosa, Olli Saarikivi, et al. Textbooks are all you need. arXiv preprint arXiv:2306.11644, 2023.

Chaoqun He, Renjie Luo, Yuzhuo Bai, Shengding Hu, Zhen Leng Thai, Junhao Shen, Jinyi Hu, Xu Han, Yujie Huang, Yuxiang Zhang, et al. OlympiadBench: A challenging benchmark for promoting agi with olympiad-level bilingual multimodal scientific problems. arXiv preprint arXiv:2402.14008, 2024a.

Yancheng He, Shilong Li, Jiaheng Liu, Yingshui Tan, Weixun Wang, Hui Huang, Xingyuan Bu, Hangyu Guo, Chengwei Hu, Boren Zheng, et al. Chinese simpleQA: A chinese factuality evaluation for large language models. arXiv preprint arXiv:2411.07140, 2024b.

Dan Hendrycks, Collin Burns, Steven Basart, Andy Zou, Mantas Mazeika, Dawn Song, and Jacob Steinhardt. Measuring massive multitask language understanding. In International Conference on Learning Representations, 2021a. URL [https://openreview.net/forum?id=d7KBjmI3GmQ](https://openreview.net/forum?id=d7KBjmI3GmQ).

Dan Hendrycks, Collin Burns, Saurav Kadavath, Akul Arora, Steven Basart, Eric Tang, Dawn Song, and Jacob Steinhardt. Measuring mathematical problem solving with the MATH dataset. In Thirty-fifth Conference on Neural Information Processing Systems Datasets and Benchmarks Track (Round 2), 2021b. URL [https://openreview.net/forum?id=7Bywt2mQsCe](https://openreview.net/forum?id=7Bywt2mQsCe).

Tom Henighan, Jared Kaplan, Mor Katz, Mark Chen, Christopher Hesse, Jacob Jackson, Heewoo Jun, Tom B. Brown, Prafulla Dhariwal, Scott Gray, et al. Scaling laws for autoregressive generative modeling. arXiv preprint arXiv:2010.14701, 2020.

Danny Hernandez, Tom Brown, Tom Conerly, Nova DasSarma, Dawn Drain, Sheer El-Showk, Nelson Elhage, Zac Hatfield-Dodds, Tom Henighan, Tristan Hume, et al. Scaling laws and interpretability of learning from repeated data. arXiv preprint arXiv:2205.10487, 2022.

Jordan Hoffmann, Sebastian Borgeaud, Arthur Mensch, Elena Buchatskaya, Trevor Cai, Eliza Rutherford, Diego de Las Casas, Lisa Anne Hendricks, Johannes Welbl, Aidan Clark, et al. Training compute-optimal large language models. In Proceedings of the 36th International Conference on Neural Information Processing Systems, pages 30016–30030, 2022.

Cheng-Ping Hsieh, Simeng Sun, Samuel Kriman, Shantanu Acharya, Dima Rekesh, Fei Jia, Yang Zhang, and Boris Ginsburg. RULER: What’s the real context size of your long-context language models? arXiv preprint arXiv:2404.06654, 2024.

Weizhe Hua, Zihang Dai, Hanxiao Liu, and Quoc Le. Transformer quality in linear time. In International conference on machine learning, pages 9099–9117. PMLR, 2022.

Aaron Hurst, Adam Lerer, Adam P Goucher, Adam Perelman, Aditya Ramesh, Aidan Clark, AJ Ostrow, Akila Welihinda, Alan Hayes, Alec Radford, et al. GPT-4o system card. arXiv preprint arXiv:2410.21276, 2024.

<!-- page 44 of 68 -->

Albert Q Jiang, Alexandre Sablayrolles, Arthur Mensch, Chris Bamford, Devendra Singh Chaplot, Diego de las Casas, Florian Bressand, Gianna Lengyel, Guillaume Lample, Lucile Saulnier, et al. Mistral 7B. arXiv preprint arXiv:2310.06825, 2023.

Mandar Joshi, Eunsol Choi, Daniel S Weld, and Luke Zettlemoyer. Triviaqa: A large scale distantly supervised challenge dataset for reading comprehension. In Proceedings of the 55th Annual Meeting of the Association for Computational Linguistics (Volume 1: Long Papers), pages 1601–1611, 2017.

G. Kamradt. Llmtest\_needleinahaystack, 2023. URL [https://github.com/gkamradt/LLMTest\_NeedleInAHaystack](https://github.com/gkamradt/LLMTest_NeedleInAHaystack).

Jared Kaplan, Sam McCandlish, Tom Henighan, Tom B Brown, Benjamin Chess, Rewon Child, Scott Gray, Alec Radford, Jeffrey Wu, and Dario Amodei. Scaling laws for neural language models. arXiv preprint arXiv:2001.08361, 2020.

Aniruddha Kembhavi, Mike Salvato, Eric Kolve, Minjoon Seo, Hannaneh Hajishirzi, and Ali Farhadi. A diagram is worth a dozen images. In Computer Vision–ECCV 2016: 14th European Conference, Amsterdam, The Netherlands, October 11–14, 2016, Proceedings, Part IV 14, pages 235–251. Springer, 2016.

Tom Kwiatkowski, Jennimaria Palomaki, Olivia Redfield, Michael Collins, Ankur Parikh, Chris Alberti, Danielle Epstein, Illia Polosukhin, Jacob Devlin, Kenton Lee, et al. Natural questions: a benchmark for question answering research. Transactions of the Association for Computational Linguistics, 7: 453–466, 2019.

Katherine Lee, Daphne Ippolito, Andrew Nystrom, Chiyuan Zhang, Douglas Eck, Chris Callison-Burch, and Nicholas Carlini. Deduplicating training data makes language models better. In Proceedings of the 60th Annual Meeting of the Association for Computational Linguistics (Volume 1: Long Papers), pages 8424–8445, 2022.

Dmitry Lepikhin, HyoukJoong Lee, Yuanzhong Xu, Dehao Chen, Orhan Firat, Yanping Huang, Maxim Krikun, Noam Shazeer, and Zhifeng Chen. GShard: Scaling giant models with conditional computation and automatic sharding. In International Conference on Learning Representations, 2021. URL [https://openreview.net/forum?id=qrwe7XHTmYb](https://openreview.net/forum?id=qrwe7XHTmYb).

Dongxu Li, Yudong Liu, Haoning Wu, Yue Wang, Zhiqi Shen, Bowen Qu, Xinyao Niu, Guoyin Wang, Bei Chen, and Junnan Li. Aria: An open multimodal native mixture-of-experts model. arXiv preprint arXiv:2410.05993, 2024a.

Junnan Li, Dongxu Li, Caiming Xiong, and Steven Hoi. BLIP: Bootstrapping language-image pre-training for unified vision-language understanding and generation. In International conference on machine learning, pages 12888–12900. PMLR, 2022.

Junnan Li, Dongxu Li, Silvio Savarese, and Steven Hoi. BLIP-2: Bootstrapping language-image pre-training with frozen image encoders and large language models. In International conference on machine learning, pages 19730–19742. PMLR, 2023.

Tianle Li, Wei-Lin Chiang, Evan Frick, Lisa Dunlap, Tianhao Wu, Banghua Zhu, Joseph E Gonzalez, and Ion Stoica. From crowdsourced data to high-quality benchmarks: Arena-Hard and BenchBuilder pipeline. arXiv preprint arXiv:2406.11939, 2024b.

Hao Liu, Matei Zaharia, and Pieter Abbeel. Ring attention with blockwise transformers for nearinfinite context. In The Twelfth International Conference on Learning Representations, 2024a. URL [https://openreview.net/forum?id=WsRHpHH4s0](https://openreview.net/forum?id=WsRHpHH4s0).

<!-- page 45 of 68 -->

Jiawei Liu, Chunqiu Steven Xia, Yuyao Wang, and Lingming Zhang. Is your code generated by ChatGPT really correct? rigorous evaluation of large language models for code generation. In Proceedings of the 37th International Conference on Neural Information Processing Systems, pages 21558–21572, 2023.

Yuliang Liu, Zhang Li, Mingxin Huang, Biao Yang, Wenwen Yu, Chunyuan Li, Xu-Cheng Yin, Cheng-Lin Liu, Lianwen Jin, and Xiang Bai. OCRBench: On the hidden mystery of OCR in large multimodal models. Science China Information Sciences, 67(12):220102, 2024b.

Ilya Loshchilov and Frank Hutter. Decoupled weight decay regularization. In International Conference on Learning Representations, 2019. URL [https://openreview.net/forum?id=Bkg6RiCqY7](https://openreview.net/forum?id=Bkg6RiCqY7).

Pan Lu, Hritik Bansal, Tony Xia, Jiacheng Liu, Chunyuan Li, Hannaneh Hajishirzi, Hao Cheng, Kai-Wei Chang, Michel Galley, and Jianfeng Gao. MathVista: Evaluating mathematical reasoning of foundation models in visual contexts. arXiv preprint arXiv:2310.02255, 2023.

Yubo Ma, Yuhang Zang, Liangyu Chen, Meiqi Chen, Yizhu Jiao, Xinze Li, Xinyuan Lu, Ziyu Liu, Yan Ma, Xiaoyi Dong, et al. MMLongBench-Doc: Benchmarking long-context document understanding with visualizations. arXiv preprint arXiv:2407.01523, 2024.

Ahmed Masry, Do Xuan Long, Jia Qing Tan, Shafiq Joty, and Enamul Hoque. ChartQA: A benchmark for question answering about charts with visual and logical reasoning. arXiv preprint arXiv:2203.10244, 2022.

Minesh Mathew, Dimosthenis Karatzas, and CV Jawahar. DocVQA: A dataset for VQA on document images. In Proceedings of the IEEE/CVF winter conference on applications of computer vision, pages 2200–2209, 2021.

Sam McCandlish, Jared Kaplan, Dario Amodei, and OpenAI Dota Team. An empirical model of large-batch training. arXiv preprint arXiv:1812.06162, 2018.

Todor Mihaylov, Peter Clark, Tushar Khot, and Ashish Sabharwal. Can a suit of armor conduct electricity? a new dataset for open book question answering. In Proceedings of the 2018 Conference on Empirical Methods in Natural Language Processing, pages 2381–2391, 2018.

Niklas Muennighoff, Alexander Rush, Boaz Barak, Teven Le Scao, Nouamane Tazi, Aleksandra Piktus, Sampo Pyysalo, Thomas Wolf, and Colin A Raffel. Scaling data-constrained language models. Advances in Neural Information Processing Systems, 36:50358–50376, 2023.

NVIDIA. Transformer engine, 2023. URL [https://github.com/NVIDIA/TransformerEngine](https://github.com/NVIDIA/TransformerEngine).

Jupinder Parmar, Sanjev Satheesh, Mostofa Patwary, Mohammad Shoeybi, and Bryan Catanzaro. Reuse, don’t retrain: A recipe for continued pretraining of language models. arXiv preprint arXiv:2407.07263, 2024.

Guilherme Penedo, Quentin Malartic, Daniel Hesslow, Ruxandra Cojocaru, Hamza Alobeidli, Alessandro Cappelli, Baptiste Pannier, Ebtesam Almazrouei, and Julien Launay. The RefinedWeb dataset for Falcon LLM: Outperforming curated corpora with web data only. In Thirty-seventh Conference on Neural Information Processing Systems Datasets and Benchmarks Track, 2023. URL [https://openreview.net/forum?id=kM5eGcdCzq](https://openreview.net/forum?id=kM5eGcdCzq).

Guilherme Penedo, Hynek Kydlíček, Loubna Ben allal, Anton Lozhkov, Margaret Mitchell, Colin Raffel, Leandro Von Werra, and Thomas Wolf. The FineWeb datasets: Decanting the web for the finest text data at scale. In The Thirty-eight Conference on Neural Information Processing Systems Datasets and Benchmarks Track, 2024. URL [https://openreview.net/forum?id=n6SCkn2QaG](https://openreview.net/forum?id=n6SCkn2QaG).

<!-- page 46 of 68 -->

Zhen Qin, Xiaodong Han, Weixuan Sun, Dongxu Li, Lingpeng Kong, Nick Barnes, and Yiran Zhong. The devil in linear transformer. In Proceedings of the 2022 Conference on Empirical Methods in Natural Language Processing, pages 7025–7041, 2022a.

Zhen Qin, Weixuan Sun, Hui Deng, Dongxu Li, Yunshen Wei, Baohong Lv, Junjie Yan, Lingpeng Kong, and Yiran Zhong. cosFormer: Rethinking softmax in attention. In International Conference on Learning Representations, 2022b. URL [https://openreview.net/forum?id=Bl8CQrx2Up4](https://openreview.net/forum?id=Bl8CQrx2Up4).

Zhen Qin, Xiaodong Han, Weixuan Sun, Bowen He, Dong Li, Dongxu Li, Yuchao Dai, Lingpeng Kong, and Yiran Zhong. Toeplitz neural network for sequence modeling. In The Eleventh International Conference on Learning Representations, 2023a. URL [https://openreview.net/forum?id=IxmWsm4xrua](https://openreview.net/forum?id=IxmWsm4xrua).

Zhen Qin, Songlin Yang, and Yiran Zhong. Hierarchically gated recurrent neural network for sequence modeling. In Proceedings of the 37th International Conference on Neural Information Processing Systems, pages 33202–33221, 2023b.

Zhen Qin, Yuxin Mao, Xuyang Shen, Dong Li, Jing Zhang, Yuchao Dai, and Yiran Zhong. You only scan once: Efficient multi-dimension sequential modeling with lightnet. arXiv preprint arXiv:2405.21022, 2024a.

Zhen Qin, Weigao Sun, Dong Li, Xuyang Shen, Weixuan Sun, and Yiran Zhong. Lightning attention-2: A free lunch for handling unlimited sequence lengths in large language models. arXiv preprint arXiv:2401.04658, 2024b.

Zhen Qin, Weigao Sun, Dong Li, Xuyang Shen, Weixuan Sun, and Yiran Zhong. Various lengths, constant speed: Efficient language modeling with lightning attention. In International conference on machine learning, pages 41517–41535. PMLR, 2024c.

Zhen Qin, Songlin Yang, Weixuan Sun, Xuyang Shen, Dong Li, Weigao Sun, and Yiran Zhong. HGRN2: Gated linear rnns with state expansion. arXiv preprint arXiv:2404.07904, 2024d.

Jack W Rae, Sebastian Borgeaud, Trevor Cai, Katie Millican, Jordan Hoffmann, Francis Song, John Aslanides, Sarah Henderson, Roman Ring, Susannah Young, et al. Scaling language models: Methods, analysis & insights from training Gopher. arXiv preprint arXiv:2112.11446, 2021.

Rafael Rafailov, Archit Sharma, Eric Mitchell, Stefano Ermon, Christopher D Manning, and Chelsea Finn. Direct preference optimization: your language model is secretly a reward model. In Proceedings of the 37th International Conference on Neural Information Processing Systems, pages 53728–53741, 2023.

Samyam Rajbhandari, Jeff Rasley, Olatunji Ruwase, and Yuxiong He. Zero: Memory optimizations toward training trillion parameter models. In SC20: International Conference for High Performance Computing, Networking, Storage and Analysis, pages 1–16. IEEE, 2020.

David Rein, Betty Li Hou, Asa Cooper Stickland, Jackson Petty, Richard Yuanzhe Pang, Julien Dirani, Julian Michael, and Samuel R. Bowman. GPQA: A graduate-level google-proof q&a benchmark. In First Conference on Language Modeling, 2024. URL [https://openreview.net/forum?id=Ti67584b98](https://openreview.net/forum?id=Ti67584b98).

Liliang Ren, Yang Liu, Yadong Lu, Yelong Shen, Chen Liang, and Weizhu Chen. Samba: Simple hybrid state space models for efficient unlimited context language modeling. arXiv preprint arXiv:2406.07522, 2024.

<!-- page 47 of 68 -->

Keisuke Sakaguchi, Ronan Le Bras, Chandra Bhagavatula, and Yejin Choi. WinoGrande: An adversarial Winograd schema challenge at scale. Communications of the ACM, 64(9):99–106, 2021.

Maarten Sap, Hannah Rashkin, Derek Chen, Ronan Le Bras, and Yejin Choi. Social IQa: Commonsense reasoning about social interactions. In Proceedings of the 2019 Conference on Empirical Methods in Natural Language Processing and the 9th International Joint Conference on Natural Language Processing (EMNLP-IJCNLP), pages 4463–4473, 2019.

Christoph Schuhmann, Richard Vencu, Romain Beaumont, Robert Kaczmarczyk, Clayton Mullis, Aarush Katta, Theo Coombes, Jenia Jitsev, and Aran Komatsuzaki. LAION-400M: Open dataset of CLIP-filtered 400 million image-text pairs. arXiv preprint arXiv:2111.02114, 2021.

John Schulman, Filip Wolski, Prafulla Dhariwal, Alec Radford, and Oleg Klimov. Proximal policy optimization algorithms. arXiv preprint arXiv:1707.06347, 2017.

Uri Shaham, Elad Segal, Maor Ivgi, Avia Efrat, Ori Yoran, Adi Haviv, Ankit Gupta, Wenhan Xiong, Mor Geva, Jonathan Berant, et al. SCROLLS: Standardized comparison over long language sequences. In Proceedings of the 2022 Conference on Empirical Methods in Natural Language Processing, pages 12007–12021, 2022.

Zhihong Shao, Peiyi Wang, Qihao Zhu, Runxin Xu, Junxiao Song, Xiao Bi, Haowei Zhang, Mingchuan Zhang, YK Li, Y Wu, et al. DeepSeekMath: Pushing the limits of mathematical reasoning in open language models. arXiv preprint arXiv:2402.03300, 2024.

Xuyang Shen, Dong Li, Ruitao Leng, Zhen Qin, Weigao Sun, and Yiran Zhong. Scaling laws for linear complexity language models. In Proceedings of the 2024 Conference on Empirical Methods in Natural Language Processing, pages 16377–16426, 2024.

Yusuxke Shibata, Takuya Kida, Shuichi Fukamachi, Masayuki Takeda, Ayumi Shinohara, Takeshi Shinohara, and Setsuo Arikawa. Byte pair encoding: A text compression scheme that accelerates pattern matching. Technical Report DOI-TR-161, Department of Informatics, Kyushu University, 1999.

Jianlin Su, Murtadha Ahmed, Yu Lu, Shengfeng Pan, Wen Bo, and Yunfeng Liu. Roformer: Enhanced transformer with rotary position embedding. Neurocomputing, 568:127063, 2024.

Weigao Sun, Zhen Qin, Dong Li, Xuyang Shen, Yu Qiao, and Yiran Zhong. Linear attention sequence parallelism. arXiv preprint arXiv:2404.02882, 2024.

Garrett Tanzer, Mirac Suzgun, Eline Visser, Dan Jurafsky, and Luke Melas-Kyriazi. A benchmark for learning to translate a new language from one grammar book. In The Twelfth International Conference on Learning Representations, 2024. URL [https://openreview.net/forum?id=tbVWug9f2h](https://openreview.net/forum?id=tbVWug9f2h).

Gemini Team, Petko Georgiev, Ving Ian Lei, Ryan Burnell, Libin Bai, Anmol Gulati, Garrett Tanzer, Damien Vincent, Zhufeng Pan, Shibo Wang, et al. Gemini 1.5: Unlocking multimodal understanding across millions of tokens of context. arXiv preprint arXiv:2403.05530, 2024a.

Jamba Team, Barak Lenz, Alan Arazi, Amir Bergman, Avshalom Manevich, Barak Peleg, Ben Aviram, Chen Almagor, Clara Fridman, Dan Padnos, et al. Jamba-1.5: Hybrid Transformer-Mamba models at scale. arXiv preprint arXiv:2408.12570, 2024b.

Ashish Vaswani, Noam Shazeer, Niki Parmar, Jakob Uszkoreit, Llion Jones, Aidan N Gomez, Łukasz Kaiser, and Illia Polosukhin. Attention is all you need. Advances in neural information processing systems, 30, 2017.

<!-- page 48 of 68 -->

Kiran Vodrahalli, Santiago Ontanon, Nilesh Tripuraneni, Kelvin Xu, Sanil Jain, Rakesh Shivanna, Jeffrey Hui, Nishanth Dikkala, Mehran Kazemi, Bahare Fatemi, et al. Michelangelo: Long context evaluations beyond haystacks via latent structure queries. arXiv preprint arXiv:2409.12640, 2024.

Hongyu Wang, Shuming Ma, Li Dong, Shaohan Huang, Dongdong Zhang, and Furu Wei. DeepNet: Scaling transformers to 1,000 layers. IEEE Transactions on Pattern Analysis and Machine Intelligence, 2024a.

Qiang Wang, Bei Li, Tong Xiao, Jingbo Zhu, Changliang Li, Derek F Wong, and Lidia S Chao. Learning deep transformer models for machine translation. In Proceedings of the 57th Annual Meeting of the Association for Computational Linguistics, pages 1810–1822, 2019.

Yubo Wang, Xueguang Ma, Ge Zhang, Yuansheng Ni, Abhranil Chandra, Shiguang Guo, Weiming Ren, Aaran Arulraj, Xuan He, Ziyan Jiang, Tianle Li, Max Ku, Kai Wang, Alex Zhuang, Rongqi Fan, Xiang Yue, and Wenhu Chen. MMLU-pro: A more robust and challenging multi-task language understanding benchmark. In The Thirty-eight Conference on Neural Information Processing Systems Datasets and Benchmarks Track, 2024b. URL [https://openreview.net/forum?id=y10DM6R2r3](https://openreview.net/forum?id=y10DM6R2r3).

Jason Wei, Xuezhi Wang, Dale Schuurmans, Maarten Bosma, Fei Xia, Ed Chi, Quoc V Le, Denny Zhou, et al. Chain-of-thought prompting elicits reasoning in large language models. Advances in neural information processing systems, 35:24824–24837, 2022.

Jason Wei, Nguyen Karina, Hyung Won Chung, Yunxin Joy Jiao, Spencer Papay, Amelia Glaese, John Schulman, and William Fedus. Measuring short-form factuality in large language models. arXiv preprint arXiv:2411.04368, 2024.

An Yang, Baosong Yang, Beichen Zhang, Binyuan Hui, Bo Zheng, Bowen Yu, Chengyuan Li, Dayiheng Liu, Fei Huang, Haoran Wei, et al. Qwen2.5 technical report. arXiv preprint arXiv:2412.15115, 2024.

Jiahui Yu, Zirui Wang, Vijay Vasudevan, Legg Yeung, Mojtaba Seyedhosseini, and Yonghui Wu. CoCa: Contrastive captioners are image-text foundation models. Transactions on Machine Learning Research, 2022. ISSN 2835-8856. URL [https://openreview.net/forum?id=Ee277P3AYC](https://openreview.net/forum?id=Ee277P3AYC).

Xiang Yue, Yuansheng Ni, Kai Zhang, Tianyu Zheng, Ruoqi Liu, Ge Zhang, Samuel Stevens, Dongfu Jiang, Weiming Ren, Yuxuan Sun, et al. MMMU: A massive multi-discipline multimodal understanding and reasoning benchmark for expert agi. In Proceedings of the IEEE/CVF Conference on Computer Vision and Pattern Recognition, pages 9556–9567, 2024a.

Xiang Yue, Tianyu Zheng, Yuansheng Ni, Yubo Wang, Kai Zhang, Shengbang Tong, Yuxuan Sun, Botao Yu, Ge Zhang, Huan Sun, et al. MMMU-Pro: A more robust multi-discipline multimodal understanding benchmark. arXiv preprint arXiv:2409.02813, 2024b.

Manzil Zaheer, Guru Guruganesh, Kumar Avinava Dubey, Joshua Ainslie, Chris Alberti, Santiago Ontanon, Philip Pham, Anirudh Ravula, Qifan Wang, Li Yang, et al. Big Bird: Transformers for longer sequences. Advances in neural information processing systems, 33:17283–17297, 2020.

Rowan Zellers, Ari Holtzman, Yonatan Bisk, Ali Farhadi, and Yejin Choi. HellaSwag: Can a machine really finish your sentence? In Proceedings of the 57th Annual Meeting of the Association for Computational Linguistics, pages 4791–4800, 2019.

Jeffrey Zhou, Tianjian Lu, Swaroop Mishra, Siddhartha Brahma, Sujoy Basu, Yi Luan, Denny Zhou, and Le Hou. Instruction-following evaluation for large language models. arXiv preprint arXiv:2311.07911, 2023.

<!-- page 49 of 68 -->

## A. Contributors (贡献者)

The contributors to the report are listed in alphabetical order as follows:

报告贡献者按字母顺序列出如下 (名单不译):

Aonian Li, Bangwei Gong, Bo Yang, Boji Shan, Chang Liu, Cheng Zhu, Chunhao Zhang, Congchao Guo, Da Chen, Dong Li, Enwei Jiao, Gengxin Li, Guojun Zhang, Haohai Sun, Houze Dong, Jiadai Zhu, Jiaqi Zhuang, Jiayuan Song, Jin Zhu, Jingtao Han, Jingyang Li, Junbin Xie, Junhao Xu, Junjie Yan, Kaishun Zhang, Kecheng Xiao, Kexi Kang, Le Han, Leyang Wang, Lianfei Yu, Liheng Feng, Lin Zheng, Linbo Chai, Long Xing, Meizhi Ju, Mingyuan Chi, Mozhi Zhang, Peikai Huang, Pengcheng Niu, Pengfei Li, Pengyu Zhao, Qi Yang, Qidi Xu, Qiexiang Wang, Qin Wang, Qiuhui Li, Ruitao Leng, Shengmin Shi, Shuqi Yu, Sichen Li, Songquan Zhu, Tao Huang, Tianrun Liang, Weigao Sun, Weixuan Sun, Weiyu Cheng, Wenkai Li, Xiangjun Song, Xiao Su, Xiaodong Han, Xinjie Zhang, Xinzhu Hou, Xu Min, Xun Zou, Xuyang Shen, Yan Gong, Yingjie Zhu, Yipeng Zhou, Yiran Zhong, Yongyi Hu, Yuanxiang Fan, Yue Yu, Yufeng Yang, Yuhao Li, Yunan Huang, Yunji Li, Yunpeng Huang, Yunzhi Xu, Yuxin Mao, Zehan Li, Zekang Li, Zewei Tao, Zewen Ying, Zhaoyang Cong, Zhen Qin, Zhenhua Fan, Zhihang Yu, Zhuo Jiang, Zijia Wu

<!-- page 50 of 68 -->

## B. MiniMax-Text-01 Case Demonstrations (MiniMax-Text-01 案例展示)

We show our model’s performance under real-world user interactions. To protect the privacy of our users, all user requests shown below are written by our human evaluators, imitating the way users interact with the model, if not from open-source benchmarks.

这里展示模型在真实用户交互下的表现. 为保护用户隐私, 下面展示的用户请求, 除来自开源基准的以外, 都由人工评估员模仿用户与模型交互的方式撰写.

### B.1. Learning A ‘New’ Language From Long Context (从长上下文学一门 「新」 语言)

Our prompt for applying MTOB follows that of Gemini-1.5 (Team et al., 2024a), detailed as follows.

MTOB 所用的提示词沿用 Gemini-1.5 的写法, 具体如下.

![MTOB 案例: 指令加语法书, 词表和 375 条平行句, 要求把一句 Kalamang 译成英文; 标准答案 Christians worship at the church on Sunday, MiniMax-Text-01 译为 The Christians pray at church on Sunday, 次优模型译错了语义](images/p50-as-shown-minimax-text-01-can-learn-from-the-given.png)

As shown, MiniMax-Text-01 can learn from the given grammar book, word list and parallel sentences, where a under-performing model’s response has semantic errors.

如图所示, MiniMax-Text-01 能从给定的语法书, 词表和平行句中学习, 而一个表现较差的模型的回答存在语义错误.

<!-- page 51 of 68 -->

### B.2. Memorizing Long History Dialogues (记住很长的历史对话)

We present an example of how our MR-NIAH samples are designed, where the model is asked to precisley retrieve one of the history interactions with the user from up to 1889 history interactions for the English benchmark and 2053 history interactions for the Chinese benchmark. These history queries were created by Mandarin-speaking human evaluators with help from a previous version of our model, where each query is translated into English, and we obtain the assistants’ responses from this model. We combine these interactions as history dialogues, and insert each needle conversation into corresponding positions detailed in Section 5.7.2.1.

这里给出 MR-NIAH 样本设计方式的一个例子: 模型需要从最多 1889 轮 (英文基准) 或 2053 轮 (中文基准) 历史交互中, 精确检索出与用户的某一轮交互. 这些历史查询由说普通话的人工评估员在上一版模型的协助下撰写, 每条查询再译成英文, 助手回复取自该版模型. 作者把这些交互拼成历史对话, 并把每段针对话插到第 5.7.2.1 节所述的相应位置.

✘ { many haysack dialogues }

(此处为大量干草堆对话.)

![MR-NIAH 案例: 大量干扰对话中先后插入两首企鹅诗, 最后要求复述第一首; MiniMax-Text-01 与标准答案一致, 次优模型复述了第二首](images/p51-golden-answer.png)

**Golden Answer**

On the peak of the Antarctic iceberg, Penguins dance with tiny wings. Wearing black and white tuxedos, stumbling steps, They smile at the severe frost in the cold wind.

南极冰山之巅, 企鹅挥着小小的翅膀起舞. 穿着黑白燕尾服, 步履蹒跚, 在寒风里对严霜微笑. (标准答案)

**MiniMax-Text-01**

On the peak of the Antarctic iceberg, Penguins dance with tiny wings. Wearing black and white tuxedos, stumbling steps, They smile at the severe frost in the cold wind.

MiniMax-Text-01 的回答与标准答案逐字一致.

**Suboptimal**

We will release the data and code of this benchmark to the community.

作者将向社区发布这一基准的数据和代码.

<!-- page 52 of 68 -->

### B.3. Summarizing Long Papers with Figures (带图总结长论文)

When dumped a PDF paper and instructed to add figures from the paper, Hailuo AI is able to summarize or analyze the given long text and respond with key figures cited.

把一篇 PDF 论文丢给海螺 AI, 并要求在回复中加入论文里的图时, 它能总结或分析给定的长文本, 并在回复中引用关键图.

**User Request ( Query ➷ + PDF P )**

➷ please summary this paper for me in english, best to <strong><u>add key figures of this paper</u></strong> in your reply at proper positions.

➷ 请用英文帮我总结这篇论文, 最好在回复的合适位置加上这篇论文的关键图.

P Stream Aligner: Efficient Sentence-Level Alignment via Distribution Induction

P 所附论文: Stream Aligner: Efficient Sentence-Level Alignment via Distribution Induction.

**MiniMax-Text-01**

**Summary of the Paper: "Stream Aligner: Efficient Sentence-Level Alignment via Distribution Induction"**

**论文总结: 「Stream Aligner: Efficient Sentence-Level Alignment via Distribution Induction」**

**1. Introduction and Motivation**

The rapid advancement of large language models (LLMs) has significantly enhanced their capabilities but has also raised concerns about their alignment with human values and intentions. Current alignment strategies, such as **Supervised Fine-tuning (SFT)** and **Reinforcement Learning from Human Feedback (RLHF)**, have shown potential but face challenges in balancing deployment complexity and performance across various tasks. Inference-time methods, while lightweight, struggle to precisely distill human values into LLM outputs, especially in long-context generations.

大语言模型 (LLM) 的快速发展显著增强了其能力, 也引发了对其是否与人类价值观和意图对齐的担忧. 现有对齐策略, 如 **Supervised Fine-tuning (SFT)** 和 **Reinforcement Learning from Human Feedback (RLHF)**, 已显示出潜力, 但难以在部署复杂度和各类任务上的性能之间取得平衡. 推理期方法虽然轻量, 却难以把人类价值观精确蒸馏进 LLM 输出, 长上下文生成中尤其如此.

This paper introduces a novel alignment paradigm called Streaming Distribution Induce Aligner (Stream Aligner), which combines the efficiency of inferencetime methods with the enhanced performance of additional models to achieve dynamic sentence-level correction.

该论文提出一种新的对齐范式, 叫 Streaming Distribution Induce Aligner (Stream Aligner), 它把推理期方法的效率与额外模型带来的性能提升结合起来, 实现动态的句子级纠正.

**2. Stream Aligner Paradigm**

Stream Aligner operates as a plug-and-play module in the generation pipeline, correcting sentences generated by the upstream model and feeding the corrected suffix back for further generation. This process repeats iteratively until the response is complete, ensuring that every sentence in the output aligns with human preferences.

Stream Aligner 作为生成流水线中的即插即用模块, 纠正上游模型生成的句子, 并把纠正后的后缀送回继续生成. 这一过程迭代进行直到回答完成, 保证输出中每个句子都与人类偏好对齐.

**Key Features:**

**• Reduced Dependency on Additional Models:** By focusing on sentence-level correction, Stream Aligner leverages more of the upstream model’s performance, reducing reliance on the size and capabilities of additional models.

**• 减少对额外模型的依赖:** 通过聚焦句子级纠正, Stream Aligner 更多地利用上游模型的性能, 降低对额外模型规模和能力的依赖.

**• Enhanced Reasoning Abilities:** The iterative correction process allows Stream Aligner to correct reasoning errors and add inductions for subsequent steps, thereby improving the model’s reasoning capabilities.

**• 增强推理能力:** 迭代纠正过程让 Stream Aligner 能纠正推理错误, 并为后续步骤补充引导, 从而提升模型的推理能力.

**3. Technical Details**

**• Training:** Stream Aligner is fine-tuned on a sentence-level preference dataset to learn the residuals between preferred and non-preferred responses. The training objective is to minimize the negative log-likelihood loss between the model’s output and the corrected answer.

**• 训练:** Stream Aligner 在句子级偏好数据集上微调, 学习偏好回答与非偏好回答之间的残差. 训练目标是最小化模型输出与纠正后答案之间的负对数似然损失.

![Stream Aligner 推理示例: 上游模型解一道数学题出错, Stream Aligner 逐句修正后得到正确答案](images/p52-inference-during-inference-stream-aligner.png)

• Inference: During inference, Stream Aligner takes the user’s query and the prefix as input. The upstream model generates the original answer, which is then corrected by Stream Aligner. Each correction is incorporated into the prefix, and the process repeats until the generation stops or the prefix exceeds the maximum length.

• 推理: 推理时, Stream Aligner 以用户查询和前缀为输入. 上游模型生成原始答案, 再由 Stream Aligner 纠正. 每次纠正都并入前缀, 过程重复, 直到生成停止或前缀超过最大长度.

![Stream Aligner 流程图: 上游 LLM 生成后缀, Stream Aligner 修正后并入前缀, 循环 n 次得到输出](images/p52-4-experimental-results.png)

**4. Experimental Results**

The paper evaluates Stream Aligner on three tasks: helpful and harmless QA, math questions, and summary tasks. The results demonstrate significant improvements:

该论文在三类任务上评估 Stream Aligner: 有用且无害的问答, 数学题和摘要任务. 结果显示改进显著:

![有益性与无害性胜率随轮数变化的小图, 顶部残留一行被裁切的文字 and a 36.0% incre](images/p52-chart.png)

• Helpfulness and Harmlessness: Stream Aligner-2B applied to Llama2-70B-chat achieved a 41.2% increase in helpfulness and a 36.0% increase in harmlessness.

• 有用性与无害性: Stream Aligner-2B 用在 Llama2-70B-chat 上, 有用性提升 41.2%, 无害性提升 36.0%.

![数学胜率随修正轮数变化: Llama3-70B 加 Stream Aligner-8B 升到约 47%, Llama3-8B 一组约 19%](images/p52-math-ability-stream-aligner-8b-applied-to-llama3-70b.png)

• Math Ability: Stream Aligner-8B applied to Llama3-70B-Instruct achieved a 3.5% improvement in math ability.

• 数学能力: Stream Aligner-8B 用在 Llama3-70B-Instruct 上, 数学能力提升 3.5%.

![有益性与无害性胜率随修正轮数变化曲线, 与前一张小图是同一张图的另一份裁切](images/p52-chart-2.png)

![数学胜率随修正轮数变化曲线, 内容与前面的数学胜率图相同](images/p52-reasoning-tasks-the-experiments-show-that-the-longer.png)

• Reasoning Tasks: The experiments show that the longer the average intervention by Stream Aligner, the higher the accuracy after the intervention, indicating its effectiveness in reasoning-based tasks.

• 推理任务: 实验显示 Stream Aligner 的平均干预越长, 干预后的准确率越高, 说明它在推理类任务上有效.

**5. Ablation Studies**

The paper conducts ablation studies to verify the correction capabilities of Stream Aligner under different supervision quantities and generation pipelines:

该论文做了消融实验, 验证 Stream Aligner 在不同监督量和不同生成流水线下的纠正能力:

**• Generation-Correction Frequency:** The performance of Stream Aligner increases with the number of generation-correction cycles, demonstrating its ability to enhance the upstream model’s performance with limited supervision.

**• 生成-纠正频次:** Stream Aligner 的表现随生成-纠正循环次数增加而提升, 说明它能在有限监督下增强上游模型的表现.

**• Generation Methods:** The study compares the classic sentence-by-sentence correction pipeline with a new continue generation pipeline. While the continue generation pipeline shows excellent performance in math and harmless QA tasks, it is more compute-consuming and converges to a similar result as the direct generation pipeline.

**• 生成方式:** 研究比较了经典的逐句纠正流水线和新的续写生成流水线. 续写流水线在数学和无害问答任务上表现出色, 但计算开销更大, 且最终收敛到与直接生成流水线相近的结果.

![直接修正与继续生成两种流水线在 2B 和 8B Stream Aligner 下的胜率随轮数变化](images/p52-6-comparison-to-other-alignment-methods.png)

**6. Comparison to Other Alignment Methods**

Stream Aligner outperforms other alignment methods such as Supervised Finetuning (SFT) and Direct Preference Optimization (DPO) in terms of accuracy improvements. It also achieves the performance of Aligner-70B using only 2B parameters, showcasing both superior performance and efficiency.

在准确率提升上, Stream Aligner 优于 SFT 和 DPO 等其他对齐方法. 它只用 2B 参数就达到 Aligner-70B 的表现, 性能和效率兼具.

**7. Interpretability**

The paper explores the interpretability of Stream Aligner through representation engineering and activation steering. The results show that Stream Aligner has internalized the correction paradigm as a representation, similar to Aligner, but with more layers involved in deciding corrections, reflecting the complexity of mathematical tasks.

该论文借助表示工程和激活引导探究 Stream Aligner 的可解释性. 结果显示, Stream Aligner 和 Aligner 一样把纠正范式内化成了一种表示, 但参与纠正决策的层更多, 反映了数学任务的复杂性.

![表征热力图 (a) Aligner 修正, 纵轴层号, 横轴 token 位置](images/p52-chart-3.png)

![表征热力图 (b) Aligner 复制](images/p52-chart-4.png)

![表征热力图 (c) Stream Aligner 修正](images/p52-chart-5.png)

![表征热力图 (d) Stream Aligner 复制](images/p52-8-conclusion.png)

**8. Conclusion**

Stream Aligner is a novel alignment paradigm that effectively elicits the latent knowledge of the upstream model while maintaining efficiency and enhanced performance. It achieves significant improvements in helpfulness, harmlessness, and reasoning abilities, making it a promising approach for aligning LLMs with human values.

Stream Aligner 是一种新的对齐范式, 能有效激发上游模型的潜在知识, 同时保持效率并提升性能. 它在有用性, 无害性和推理能力上都有显著改进, 是让 LLM 与人类价值观对齐的一条有前景的路线.

**Limitations**

Despite its advantages, Stream Aligner introduces additional computational overhead during inference and requires high-quality training data. Its performance may be limited when dealing with extremely difficult out-of-distribution inputs.

尽管有这些优点, Stream Aligner 会在推理时引入额外计算开销, 并需要高质量训练数据. 面对极难的分布外输入时, 它的表现可能受限.

This summary provides an overview of the paper’s key contributions, methodologies, experimental results, and conclusions, highlighting the innovative approach of Stream Aligner in aligning LLMs with human preferences.

以上总结概述了论文的主要贡献, 方法, 实验结果和结论, 突出了 Stream Aligner 在让 LLM 与人类偏好对齐上的创新做法.

<!-- page 53 of 68 -->

### B.4. Translating Long Papers (长论文翻译)

**User Request ( Query ➷ + PDF P )**

➷ please help me to translate the whole paper into French.

➷ 请帮我把整篇论文翻译成法语.

P When brain-inspired AI meets AGI.pdf

P 所附论文: When brain-inspired AI meets AGI.pdf.

**MiniMax-Text-01**

Quand l’IA inspirée du cerveau rencontre l’AGI Lin Zhao a,1, Lu Zhang b,1, Zihao Wu a, Yuzhong Chen c, Haixing Dai a, Xiaowei Yu b, Zhengliang Liu a, Tuo Zhang d, Xintao Hu d, Xi Jiang c, Xiang Li e, Dajiang Zhu b, Dinggang Shen f,g,h, Tianming Liu a,\*

(以下是模型输出的法语译文, 中文逐段意译.) 标题: 当类脑 AI 遇上 AGI. 作者: Lin Zhao, Lu Zhang, Zihao Wu, Yuzhong Chen, Haixing Dai, Xiaowei Yu, Zhengliang Liu, Tuo Zhang, Xintao Hu, Xi Jiang, Xiang Li, Dajiang Zhu, Dinggang Shen, Tianming Liu (通讯作者).

a \*School of Computing, The University of Georgia, Athens 30602, USA\* b \*Department of Computer Science and Engineering, The University of Texas at Arlington, Arlington 76019, USA\* c \*MOE Key Laboratory for Neuroinformation, School of Life Science and Technology, University of Electronic Science and Technology of China, Chengdu 611731, China\* d \*School of Automation, Northwestern Polytechnical University, Xi’an 710072, China\* e \*Department of Radiology, Massachusetts General Hospital and Harvard Medical School, Boston 02115, USA\* f \*School of Biomedical Engineering, ShanghaiTech University, Shanghai 201210, China\* g \*Shanghai United Imaging Intelligence Co., Ltd., Shanghai 200230, China\* h \*Shanghai Clinical Research and Trial Center, Shanghai, 201210, China\*

作者单位: 佐治亚大学计算学院; 德州大学阿灵顿分校计算机科学与工程系; 电子科技大学生命科学与技术学院神经信息教育部重点实验室; 西北工业大学自动化学院; 麻省总医院与哈佛医学院放射科; 上海科技大学生物医学工程学院; 上海联影智能医疗科技有限公司; 上海临床研究中心.

Résumé L’Intelligence Générale Artificielle (AGI) a été un objectif de longue date pour l’humanité, visant à créer des machines capables d’effectuer toute tâche intellectuelle que les humains peuvent accomplir. Pour atteindre cet objectif, les chercheurs en AGI s’inspirent du cerveau humain et cherchent à reproduire ses principes dans des machines intelligentes. L’intelligence artificielle inspirée du cerveau est un domaine qui a émergé de cet effort, combinant des insights de la neuroscience, de la psychologie et de l’informatique pour développer des systèmes d’IA plus efficaces et puissants. Dans cet article, nous offrons un aperçu complet de l’IA inspirée du cerveau du point de vue de l’AGI. Nous commençons par les progrès actuels de l’IA inspirée du cerveau et de sa connexion étendue avec l’AGI. Nous couvrons ensuite les caractéristiques importantes de l’intelligence humaine et de l’AGI (par exemple, la mise à l’échelle, la multimodalité et le raisonnement). Nous discutons des technologies importantes pour atteindre l’AGI dans les systèmes d’IA actuels, telles que l’apprentissage contextuel et le réglage des invites. Nous examinons également l’évolution des systèmes AGI à la fois du point de vue algorithmique et infrastructurel. Enfin, nous explorons les limites et l’avenir de l’AGI.

摘要. 通用人工智能 (AGI) 是人类长期追求的目标, 即造出能完成人类所能完成的任何智力任务的机器. 为此, AGI 研究者从人脑取经, 试图把人脑的原理复现到智能机器中. 类脑人工智能正是从这一努力中产生的领域, 它融合神经科学, 心理学和计算机科学的见解, 以开发更高效, 更强大的 AI 系统. 本文从 AGI 的视角全面综述类脑 AI: 先介绍类脑 AI 的现状及其与 AGI 的广泛联系, 再讨论人类智能和 AGI 的重要特征 (如规模, 多模态和推理), 接着讨论当前 AI 系统中实现 AGI 的重要技术, 如 in-context learning 和 prompt tuning, 还从算法和基础设施两个角度考察 AGI 系统的演化, 最后探讨 AGI 的局限与未来.

1. L’IA inspirée du cerveau et l’AGI Le cerveau humain est largement considéré comme l’un des systèmes de traitement de l’information les plus complexes et avancés au monde. Il comprend plus de 86 milliards de neurones, chacun capable de former jusqu’à 10 000 synapses avec d’autres neurones, ce qui résulte en un réseau de connexions exceptionnellement complexe permettant la prolifération de l’intelligence. Outre la complexité physiologique, le cerveau humain présente une large gamme de caractéristiques qui contribuent à ses capacités fonctionnelles remarquables. Par exemple, il peut inté- grer des données provenant de plusieurs modalités sensorielles, telles que la vision, l’audition et le toucher, lui permettant de former une perception cohérente du monde. La capacité du cerveau à effectuer un traitement parallèle est également essentielle pour gérer efficacement plusieurs flux d’informations simultanément. Cela est réalisé via les connexions et les communications en temps réel entre différentes régions du cerveau, bien que le mécanisme ne soit pas entièrement compris. De plus, le cerveau est très adaptable, capable de réorganiser sa structure et sa fonction en réponse aux environnements et expériences changeants. Cette propriété, connue sous le nom de neuroplasticité, permet au cerveau d’apprendre et de développer de nouvelles compétences tout au long de la vie. Le cerveau humain est également remarquable pour ses fonctions cognitives de haut niveau, telles que la résolution de problèmes, la prise de décision, la créativité et le raisonnement abstrait, soutenues par le cortex préfrontal, une région du cerveau particulièrement bien développée chez les humains.

1. 类脑 AI 与 AGI. 人脑被普遍认为是世界上最复杂, 最先进的信息处理系统之一. 它有超过 860 亿个神经元, 每个神经元可与其他神经元形成多达 10,000 个突触, 构成极其复杂的连接网络, 让智能得以生发. 除生理上的复杂性外, 人脑还有一系列成就其非凡功能的特性. 例如, 它能整合视觉, 听觉, 触觉等多种感官模态的数据, 形成对世界的连贯感知. 并行处理能力对同时高效处理多路信息流也至关重要, 这依靠不同脑区之间的连接和实时通信实现, 尽管其机制尚未完全弄清. 此外, 人脑适应性很强, 能随环境和经验的变化重组自身的结构和功能. 这种被称为神经可塑性的特性让人终生都能学习和发展新技能. 人脑还以高级认知功能著称, 如解决问题, 决策, 创造和抽象推理, 这些由人类格外发达的前额叶皮层支撑.

Créer des systèmes d’Intelligence Générale Artificielle (AGI) ayant une intelligence de niveau humain ou même supérieure et capables d’effectuer une large gamme de tâches intellectuelles, telles que le raisonnement, la résolution de problèmes et la créativité, est la quête de l’humanité depuis des siècles, remontant au milieu du 20ème siècle. Dans les années 1940, des pionniers comme Alan Turing ont développé des idées précoces sur les machines informatiques et leur potentiel pour simuler la pensée humaine. Depuis lors, chercher à reproduire les principes de l’intelligence humaine dans des systèmes artificiels a considérablement favorisé le développement de l’AGI et les applications correspondantes. Ces principes incluent la structure et la fonction des réseaux de neurones, la plasticité des connexions synaptiques, la dynamique de l’activité neuronale, et plus encore. En 1943, McCulloch et Pitts ont proposé le tout premier modèle mathématique d’un neurone artificiel, également connu sous le nom de neurone MCP (McCulloch-Pitts). Inspiré par la théorie de Hebb sur la plasticité synaptique, Frank Rosenblatt a conçu le perceptron, une amélioration majeure par rapport au modèle de neurone MCP, et a montré que, en assouplissant certaines des règles du MCP, les neurones artificiels pouvaient réellement apprendre à partir des données. Cependant, la recherche sur les réseaux de neurones artificiels a stagné jusqu’à ce que la rétropropagation soit proposée par Werbos en 1975. La rétropropagation a été inspirée par la façon dont le cerveau modifie les forces des connexions entre les neurones pour apprendre et améliorer ses performances grâce à la plasticité synaptique. La rétropropagation tente de reproduire ce processus en ajustant les poids (forces synaptiques) entre les neurones dans un réseau de neurones artificiels. Malgré cette proposition précoce, la rétropropagation n’a pas attiré une attention généralisée jusqu’aux années 1980, lorsque des chercheurs comme David Rumelhart, Geoffrey Hinton et Ronald Williams ont publié des articles démontrant l’efficacité de la rétropropagation pour entraîner les réseaux de neurones.

造出具有人类水平甚至更高智能, 能完成推理, 解决问题, 创造等广泛智力任务的 AGI 系统, 是人类几个世纪以来的追求, 具体可追溯到 20 世纪中叶. 20 世纪 40 年代, Alan Turing 等先驱提出了关于计算机器及其模拟人类思维潜力的早期设想. 此后, 在人工系统中复现人类智能原理的努力大大推动了 AGI 及相关应用的发展, 这些原理包括神经网络的结构与功能, 突触连接的可塑性, 神经活动的动力学等. 1943 年, McCulloch 和 Pitts 提出了人工神经元的第一个数学模型, 即 MCP 神经元. 受 Hebb 突触可塑性理论启发, Frank Rosenblatt 设计了感知机, 这是对 MCP 模型的重大改进, 他证明放宽 MCP 的部分规则后, 人工神经元确实能从数据中学习. 然而人工神经网络研究一度停滞, 直到 1975 年 Werbos 提出反向传播. 反向传播的灵感来自大脑通过突触可塑性改变神经元间连接强度来学习和提升表现的方式, 它试图通过调整人工神经网络中神经元之间的权重 (突触强度) 来复现这一过程. 尽管提出得早, 反向传播直到 20 世纪 80 年代才受到广泛关注, 当时 David Rumelhart, Geoffrey Hinton 和 Ronald Williams 发表论文, 证明了反向传播训练神经网络的有效性.

Les réseaux de neurones convolutifs (CNN) sont l’un des types de réseaux de neurones les plus utilisés et les plus efficaces pour traiter les informations visuelles. Les CNN sont également inspirés de l’organisation hiérarchique du cortex visuel dans le cerveau, ce qui remonte aux travaux de David Hubel et Torsten Wiesel dans les années 1960. Dans le cortex visuel, les neurones sont disposés en couches, chaque couche traitant les informations visuelles de manière hiérarchique. L’entrée de la ré- tine est d’abord traitée par une couche de cellules simples qui détectent les bords et les orientations, puis transmise à des cellules plus complexes qui reconnaissent des caractéristiques plus complexes telles que les formes et les textures. Leurs travaux ont fourni des insights sur la façon dont le système visuel traite les informations et ont inspiré le développement des CNN qui pourraient reproduire ce processus de traitement hiérarchique. Les mécanismes d’attention dans les réseaux de neurones artificiels sont également inspirés de la façon dont le cerveau humain sélectionne sélectivement certains aspects de l’entrée sensorielle ou des processus cognitifs, nous permettant de nous concentrer sur les informations importantes tout en filtrant les détails non pertinents. L’attention a été étudiée dans les domaines de la psychologie et des neurosciences pendant de nombreuses années, et son application à l’intelligence artificielle fait avancer considérablement nos pas vers l’AGI. Le modèle Transformer, basé sur le mécanisme d’autoattention, est devenu la base de nombreux réseaux de neurones artificiels de pointe tels que BERT et GPT. En adaptant les mé- canismes d’auto-attention au traitement d’images, le modèle Vision Transformer (ViT) a démontré des performances de pointe dans diverses tâches de vision par ordinateur (CV) en représentant l’image comme une séquence de patchs.

卷积神经网络 (CNN) 是处理视觉信息时最常用, 最有效的神经网络之一. CNN 同样受大脑视觉皮层层级组织的启发, 可追溯到 David Hubel 和 Torsten Wiesel 在 20 世纪 60 年代的工作. 视觉皮层中神经元分层排列, 每层以层级方式处理视觉信息: 视网膜的输入先由检测边缘和朝向的简单细胞处理, 再传给识别形状, 纹理等更复杂特征的复杂细胞. 他们的工作揭示了视觉系统处理信息的方式, 启发了能复现这种层级处理的 CNN. 人工神经网络中的注意力机制也受启发于人脑有选择地关注感官输入或认知过程的某些方面, 让我们聚焦重要信息, 过滤无关细节. 心理学和神经科学研究注意力已有多年, 把它用到人工智能中让我们向 AGI 迈进了一大步. 基于自注意力机制的 Transformer 已成为 BERT, GPT 等众多先进人工神经网络的基础. 把自注意力用于图像处理后, Vision Transformer (ViT) 把图像表示成 patch 序列, 在多种计算机视觉 (CV) 任务上达到先进水平.

Récemment, de plus en plus de preuves suggèrent que les réseaux de neurones artificiels (ANN) et les réseaux de neurones biologiques (BNN) peuvent partager des principes communs dans l’optimisation de l’architecture du réseau. Par exemple, la propriété de petit monde dans les réseaux structurels et fonctionnels du cerveau a été largement étudiée dans la littérature. Dans une étude récente, les réseaux de neurones basés sur les graphes aléatoires de Watts-Strogatz (WS) avec des propriétés de petit monde ont démontré des performances compétitives par rapport aux modèles conçus à la main et optimisés par NAS (recherche d’architecture neuronale). De plus, l’analyse a posteriori a montré que la structure graphique des ANN les plus performants, tels que les CNN et le Perceptron multicouche (MLP), est similaire à celle des vrais BNN, tels que le réseau dans le cortex du macaque. Chen et al. ont proposé une représentation relationnelle unifiée et biologiquement plausible des modèles ViT, trouvant que la performance du modèle était étroitement liée aux mesures du graphe et que le ViT a une grande similarité avec les vrais BNN. Zhao et al. ont synchronisé l’activation des ANN et des CNN et ont trouvé que les CNN avec des performances plus élevées sont similaires aux BNN en termes d’activation de la représentation visuelle. Liu et al. ont couplé les neurones artificiels dans le modèle BERT avec les neurones biologiques dans le cerveau humain, et ont trouvé que les neurones artificiels peuvent porter des informations linguistiques/sémantiques significatives et s’ancrer à leurs signatures de neurones biologiques avec interprétabilité dans un contexte neurolinguistique. Zhou et al. ont traité chaque dimension cachée dans Wav2Vec2.0 comme un neurone artificiel et les ont connectés avec leurs homologues biologiques dans le cerveau humain, suggérant une relation étroite entre les deux domaines en termes d’informations neurolinguistiques.

近来越来越多的证据表明, 人工神经网络 (ANN) 和生物神经网络 (BNN) 在网络架构的优化上可能遵循共同原则. 例如, 大脑结构网络和功能网络的小世界特性已被大量研究. 一项近期研究显示, 基于具有小世界特性的 Watts-Strogatz (WS) 随机图构建的神经网络, 表现可与人工设计和 NAS (神经架构搜索) 优化的模型相当. 事后分析还表明, 表现最好的 ANN (如 CNN 和多层感知机 MLP) 的图结构与真实 BNN (如猕猴皮层网络) 相似. Chen 等人为 ViT 模型提出一种统一的, 生物学上合理的关系表示, 发现模型性能与图的度量密切相关, 且 ViT 与真实 BNN 高度相似. Zhao 等人同步了 ANN 和 CNN 的激活, 发现性能更高的 CNN 在视觉表示的激活上更接近 BNN. Liu 等人把 BERT 中的人工神经元与人脑中的生物神经元耦合, 发现人工神经元能携带有意义的语言/语义信息, 并能在神经语言学语境下以可解释的方式锚定到对应的生物神经元特征. Zhou 等人把 Wav2Vec2.0 的每个隐藏维度视为一个人工神经元, 与人脑中的生物对应物相连, 表明两者在神经语言学信息上关系密切.

Suivant cette tendance, il y a un intérêt croissant pour le développement de l’intelligence artificielle inspirée du cerveau en s’inspirant de certaines connaissances préalables du cerveau humain, telles que l’organisation de la structure et de la fonction du cerveau. Par exemple, Huang et al. ont proposé un réseau de vision antagoniste inspiré du cerveau (BI-AVAN) qui imite le processus de compétition biaisée dans le système visuel humain pour décoder l’attention visuelle humaine. Inspiré par l’organisation cœur-périphérie du cerveau humain, Yu et al. ont proposé un modèle de transformateur de vision guidé par le principe cœur-périphérie (CP-ViT) pour la reconnaissance d’images avec des performances et une interprétabilité améliorées. De même, Zhao et al. ont mis en œuvre le principe cœur-périphérie dans la conception des motifs de câblage du réseau et la sparsification de l’opération de convolution. Le CP-CNN proposé guidé par le principe cœur-périphérie démontre l’efficacité et la supériorité par rapport aux méthodes basées sur les CNN et ViT. Un autre groupe d’études a opté pour les réseaux de neurones à pointes (SNN) qui imitent étroitement le comportement des neurones biologiques dans le cerveau. Par exemple, les SNN ont été utilisés pour cartographier et comprendre les données cérébrales spatio-temporelles, décoder et comprendre l’activité musculaire à partir des signaux d’électroencéphalographie, et les interfaces cerveau-machine.

顺着这一趋势, 借鉴人脑结构与功能组织等先验知识来发展类脑 AI 的兴趣日益增长. 例如, Huang 等人提出类脑对抗视觉注意力网络 (BI-AVAN), 模仿人类视觉系统中的偏置竞争过程来解码人类视觉注意. 受人脑核心-外围组织启发, Yu 等人提出核心-外围原则引导的视觉 Transformer (CP-ViT) 用于图像识别, 性能和可解释性都有提升. 类似地, Zhao 等人把核心-外围原则用在网络连线模式设计和卷积运算的稀疏化上, 所提出的 CP-CNN 相比基于 CNN 和 ViT 的方法显示出有效性和优越性. 另一组研究选择脉冲神经网络 (SNN), 它紧密模仿大脑中生物神经元的行为. 例如, SNN 已被用于映射和理解时空脑数据, 从脑电信号中解码和理解肌肉活动, 以及脑机接口.

L’IA inspirée du cerveau a également contribué au développement d’architectures matérielles qui imitent la structure et la fonction du cerveau. Le calcul neuromorphique, un domaine d’étude qui vise à concevoir du matériel informatique qui émule les neurones et les synapses biologiques, a également gagné en attention ces dernières années. Les puces neuromorphiques sont conçues pour traiter l’information de manière parallèle et distribuée, de la même manière que le cerveau fonctionne, ce qui peut conduire à des améliorations significatives en termes d’efficacité et de vitesse par rapport aux architectures informatiques traditionnelles.

类脑 AI 还推动了模仿大脑结构与功能的硬件架构的发展. 神经形态计算旨在设计模拟生物神经元和突触的计算硬件, 近年来备受关注. 神经形态芯片像大脑一样以并行, 分布式的方式处理信息, 相比传统计算架构可在效率和速度上显著改进.

<!-- page 54 of 68 -->

Certaines des puces neuromorphiques, comme la puce TrueNorth d’IBM et la puce Loihi d’Intel, utilisent des réseaux de neurones à pointes pour traiter l’information d’une manière qui est plus proche de la façon dont le cerveau traite l’information. Ces puces ont été utilisées pour une large gamme d’applications, y compris la reconnaissance d’images et de la parole, la robotique et les véhicules autonomes. L’avancement du matériel inspiré du cerveau ouvre également la voie à des avancées significatives dans le domaine de l’AGI en pavant la voie pour des plateformes matérielles généralisées.

部分神经形态芯片, 如 IBM 的 TrueNorth 和 Intel 的 Loihi, 用脉冲神经网络以更接近大脑的方式处理信息. 这些芯片已用于图像和语音识别, 机器人, 自动驾驶等多种应用. 类脑硬件的进步也为通用硬件平台铺路, 为 AGI 领域的重大进展创造条件.

Dans l’ensemble, l’IA inspirée du cerveau joue un rôle crucial dans le développement de l’AGI (Fig. 1). En s’inspirant du cerveau humain, les chercheurs peuvent créer des algorithmes et des architectures mieux adaptés pour gérer des problèmes complexes et réels qui nécessitent un degré élevé de flexibilité et d’adaptabilité. Cela est particulièrement important pour l’AGI, qui vise à développer des machines capables d’effectuer une large gamme de tâches, d’apprendre de l’expérience et de généraliser leurs connaissances à de nouvelles situations. Le cerveau humain est l’un des systèmes de traitement de l’information les plus complexes connus de nous, et il a évolué pendant des millions d’années pour être très efficace et efficace dans la gestion de tâches complexes. En étudiant le cerveau et en développant des systèmes d’IA qui imitent son architecture et sa fonction, les chercheurs peuvent créer une AGI plus sophistiquée et adaptable, nous rapprochant de l’objectif ultime de créer des machines qui peuvent égaler ou surpasser l’intelligence humaine. En retour, l’AGI a également le potentiel de bénéficier à l’intelligence humaine et de approfondir notre compréhension de l’intelligence. À mesure que nous continuons à étudier et à comprendre à la fois l’intelligence humaine et l’AGI, ces deux systèmes deviendront de plus en plus intriqués, se renforçant et se soutenant mutuellement de manière nouvelle et passionnante.

总体而言, 类脑 AI 在 AGI 的发展中起关键作用 (图 1). 借鉴人脑, 研究者可以设计出更适合处理复杂现实问题的算法和架构, 这类问题需要高度的灵活性和适应性. 这对 AGI 尤为重要, 因为 AGI 的目标是让机器完成各种任务, 从经验中学习, 并把知识泛化到新情境. 人脑是已知最复杂的信息处理系统之一, 经过数百万年演化, 处理复杂任务时既高效又有效. 研究大脑, 开发模仿其架构和功能的 AI 系统, 研究者就能造出更精巧, 更有适应性的 AGI, 离造出匹敌乃至超越人类智能的机器更近一步. 反过来, AGI 也可能造福人类智能, 加深我们对智能的理解. 随着对人类智能和 AGI 研究的深入, 两者会越来越交织, 以新颖而令人兴奋的方式相互促进.

2. Caractéristiques de l’AGI 2.1. Échelle L’échelle des cerveaux varie considérablement d’une espèce animale à l’autre, allant de quelques milliers de neurones chez les invertébrés simples comme les vers nématodes, à plus de 86 milliards de neurones chez les humains. Par exemple, le cerveau d’une mouche à fruits contient environ 100 000 neurones, et le cerveau d’une souris contient environ 70 millions de neurones. Pour les primates, le cerveau du macaque a environ 1,3 milliard de neurones tandis que le cerveau du chimpanzé a environ 6,2 milliards de neurones. Comparé à d’autres animaux, le cerveau humain est la structure biologique la plus complexe et la plus sophistiquée connue de la science, contenant plus de 86 milliards de neurones. L’échelle du cerveau, c’est-à-dire le nombre de neurones, est souvent corrélée aux capacités cognitives de l’animal et considérée comme un facteur d’intelligence. La taille et la complexité des régions du cerveau associées à des fonctions cognitives spécifiques, telles que le langage ou la mémoire, sont souvent directement liées au nombre de neurones qu’elles contiennent.

2. AGI 的特征. 2.1 规模. 不同动物的脑规模差异极大, 从线虫等简单无脊椎动物的几千个神经元, 到人类的 860 多亿个. 例如果蝇脑约有 100,000 个神经元, 小鼠脑约 7000 万个. 灵长类中, 猕猴脑约 13 亿个神经元, 黑猩猩约 62 亿个. 与其他动物相比, 人脑是科学已知最复杂精巧的生物结构, 含 860 多亿个神经元. 脑的规模即神经元数量常与动物的认知能力相关, 被视为智能的一个因素. 与语言, 记忆等特定认知功能相关的脑区, 其大小和复杂度往往与所含神经元数量直接相关.

Nous avons l’intention d’utiliser les grands modèles de langage (LLM) (voir le tableau 1) comme un moyen possible d’étudier l’AGI inspirée du cerveau, car les LLM sont parmi les premiers modèles à démontrer des performances de niveau humain dans diverses tâches. La relation entre le nombre de neurones et les capacités cognitives est également pertinente pour les LLM tels que GPT-2 et GPT-3. Alors que GPT-2 a 1,5 milliard de paramètres et a été entraîné sur 40 gigabytes de données textuelles, GPT-3 a 175 milliards de paramètres et a été entraîné sur 570 gigabytes de données textuelles. Cette augmentation significative du nombre de paramètres a permis à GPT-3 de surpasser GPT-2 sur une gamme de tâches linguistiques, démontrant une augmentation de sa capacité à effectuer des tâches linguistiques complexes. En fait, GPT-3 a montré des performances de niveau humain sur plusieurs benchmarks de traitement du langage naturel, tels que la réponse aux questions, la traduction linguistique et les tâches de complétion de texte. Sa taille et sa capacité en traitement du langage naturel en ont fait un outil puissant pour diverses applications, y compris les chatbots, la génération de contenu et la traduction linguistique.

作者打算把大语言模型 (LLM, 见表 1) 作为研究类脑 AGI 的一种可能途径, 因为 LLM 是最早在多种任务上展现人类水平表现的模型之一. 神经元数量与认知能力的关系同样适用于 GPT-2 和 GPT-3 这样的 LLM. GPT-2 有 15 亿参数, 用 40 GB 文本数据训练; GPT-3 有 1750 亿参数, 用 570 GB 文本数据训练. 参数量的大幅增加让 GPT-3 在一系列语言任务上超过 GPT-2, 执行复杂语言任务的能力明显增强. 事实上, GPT-3 在问答, 翻译, 文本补全等多个自然语言处理基准上表现出人类水平. 它的规模和自然语言处理能力使其成为聊天机器人, 内容生成, 语言翻译等应用的有力工具.

Cette tendance est similaire à la façon dont les cerveaux plus grands sont associés à des fonctions cognitives plus complexes chez les animaux. À mesure que les LLM continuent de se développer, il est attendu qu’ils deviendront encore plus capables d’apprendre de nouveaux skills avec un petit nombre d’exemples de formation, similaire à la façon dont les animaux avec des cerveaux plus grands ont des capacités cognitives plus sophistiquées. Cette corrélation suggère que l’échelle peut être un facteur crucial dans la réalisation de l’AGI. Cependant, il est à noter que le nombre de paramètres seuls ne détermine pas l’intelligence d’un LLM. La qualité des données de formation, le processus de formation et l’architecture du modèle jouent également des rôles importants dans sa performance.

这一趋势与动物中更大的脑对应更复杂认知功能相似. 随着 LLM 继续发展, 预期它们只需少量训练样例就能学会新技能, 正如脑更大的动物有更精巧的认知能力. 这种相关性表明规模可能是实现 AGI 的关键因素. 但要注意, 参数量本身并不决定 LLM 的智能, 训练数据的质量, 训练过程和模型架构对其表现同样重要.

En outre, il est nécessaire de rechercher des moyens qui permettent aux institutions et aux individus à ressources limitées d’accéder et de développer l’AGI. Certaines solutions possibles incluent la quantification des modèles existants de grande taille, le développement d’architectures efficaces, ou la construction de jeux de données de haute qualité qui facilitent la formation du modèle.

此外, 需要寻找让资源有限的机构和个人也能接触和开发 AGI 的途径. 可能的办法包括量化现有大模型, 开发高效架构, 或构建便于模型训练的高质量数据集.

2.2. Multimodalité La capacité du cerveau humain à traiter et intégrer simultanément des informations provenant de plusieurs modalités sensorielles est une réalisation remarquable. Cette caractéristique permet aux individus de comprendre le monde qui les entoure à travers diverses sources d’information, telles que la vue, le son, le toucher, le goût et l’odorat. De plus, le traitement d’informations multimodales permet aux gens de faire des évaluations plus précises et complètes de leur environnement et de communiquer efficacement avec les autres. En conséquence, l’apprentissage réussi à partir de plusieurs modalités peut améliorer les capacités cognitives humaines.

2.2 多模态. 人脑同时处理和整合多种感官模态信息的能力非常了不起. 这让人能通过视觉, 听觉, 触觉, 味觉, 嗅觉等多种信息源理解周围世界. 多模态信息处理还让人对环境做出更准确全面的判断, 并与他人有效沟通. 因此, 从多种模态中成功学习能增强人的认知能力.

À mesure que nous nous efforçons de créer des systèmes AGI avancés qui surpassent l’intelligence humaine, il est crucial qu’ils soient capables d’acquérir et d’ingérer des connaissances à partir de diverses sources et modalités pour résoudre des tâches qui impliquent n’importe quelle modalité. Par exemple, un AGI devrait être capable d’utiliser les connaissances apprises à partir d’images et de la base de connaissances pour répondre aux questions en langage naturel, ainsi que d’utiliser les connaissances apprises à partir du texte pour effectuer des tâches visuelles. En fin de compte, toutes les modalités se croisent à travers des concepts universels, tels que le concept qu’un chien est un chien, indépendamment de la façon dont il est représenté dans différentes modalités (Fig. 2).

在努力打造超越人类智能的先进 AGI 系统时, 关键在于让它们能从多种来源和模态获取, 吸收知识, 以解决涉及任意模态的任务. 例如, AGI 应能用从图像和知识库中学到的知识回答自然语言问题, 也能用从文本中学到的知识完成视觉任务. 归根结底, 所有模态都通过普遍概念相交, 比如 「狗就是狗」 这一概念, 无论它在不同模态中如何呈现 (图 2).

Pour construire des systèmes d’IA multi-modaux, une approche prometteuse est d’incorporer des signaux de formation provenant de plusieurs modalités dans les LLM. Cela nécessite d’aligner les représentations internes à travers différentes modalités, permettant au système d’IA d’intégrer les connaissances de manière transparente. Par exemple, lorsqu’un système d’IA reçoit une image et un texte associé, il doit associer le même objet ou concept entre les modalités. Supposons que l’IA voit une image d’une voiture avec un texte se référant à ses roues. Dans ce cas, l’IA doit prêter attention à la partie de l’image avec les roues de la voiture lorsqu’elle traite le texte les mentionnant. L’IA doit comprendre que l’image des roues de la voiture et le texte se référant à elles décrivent le même objet à travers différentes modalités.

构建多模态 AI 系统的一条有前景的路线, 是把来自多种模态的训练信号纳入 LLM. 这需要对齐不同模态的内部表示, 让 AI 系统能无缝整合知识. 例如, AI 系统收到一张图和一段相关文字时, 必须把同一物体或概念在两种模态间对应起来. 假设 AI 看到一张汽车图片, 配文提到它的车轮. 这时 AI 处理提到车轮的文字时, 应关注图中车轮所在的部分, 并理解车轮的图像和指代它的文字描述的是同一物体, 只是模态不同.

Ces dernières années, les systèmes d’IA multimodaux ont expérimenté l’alignement du texte/NLP, des images/vision ou de l’information audio dans un espace d’encodage pour faciliter la prise de décision multimodale. L’alignement intermodal est essentiel pour diverses tâches, y compris la génération texte-image et image-texte, la réponse aux questions visuelles, et la modélisation vidéo-langage. Dans la section suivante, nous fournissons un bref aperçu de ces charges de travail courantes et des modèles de pointe correspondants.

近年来, 多模态 AI 系统尝试把文本/NLP, 图像/视觉或音频信息对齐到同一编码空间, 以便做多模态决策. 跨模态对齐对文生图, 图生文, 视觉问答, 视频-语言建模等任务都至关重要. 下一节简要概述这些常见工作负载及相应的先进模型.

2.2.1. Génération texte-image et imagetexte CLIP, DALL-E, et leur successeur GLIDE, VisualGPT et Diffusion sont parmi les modèles les plus connus qui abordent les descriptions d’images (génération image-texte) et les tâches de génération texte-image. CLIP est une méthode de pré- entraînement qui entraîne des encodeurs d’images et de texte séparés et apprend à prédire quelles images dans un ensemble de données sont associées à diverses descriptions. Notamment, de manière similaire au neurone Halle Berry chez les humains, CLIP a été trouvé pour avoir des "neurones multimodaux" qui s’activent lorsqu’ils sont exposés à la fois au texte de l’étiquette du classificateur et à l’image correspondante, indiquant une représentation multimodale fusionnée. DALL-E, en revanche, est une variante de GPT-3 avec 13 milliards de paramètres qui prend le texte comme entrée et génère une séquence d’images pour correspondre au texte d’entrée. Les images générées sont ensuite classées à l’aide de CLIP. GLIDE, une évolution de DALL-E, utilise toujours CLIP pour classer les images générées, mais la génération d’images est accomplie à l’aide d’un modèle de diffusion. Stable Diffusion est également basé sur des modèles de diffusion tout en opérant sur l’espace latent de puissants auto-encodeurs pré-entraînés et ainsi en utilisant des ressources de calcul limitées tout en maintenant leur qualité et leur flexibilité. Le VisualGPT est l’évolution de GPT-2 d’un modèle de langage unique à un modèle multimodal avec une unité d’activation qui se réanime elle-même pour produire des activations éparses qui empêchent l’écrasement accidentel des connaissances linguistiques.

2.2.1 文生图与图生文. CLIP, DALL-E 及其后继 GLIDE, VisualGPT 和 Diffusion 是处理图像描述 (图生文) 和文生图任务的知名模型. CLIP 是一种预训练方法, 分别训练图像编码器和文本编码器, 学习预测数据集中哪些图像与哪些描述相配. 值得一提的是, 与人类的 「Halle Berry 神经元」 类似, CLIP 被发现有 「多模态神经元」, 在同时看到分类器标签文本和对应图像时激活, 表明存在融合的多模态表示. DALL-E 则是 GPT-3 的一个 130 亿参数变体, 以文本为输入, 生成与之匹配的图像序列, 生成的图像再用 CLIP 排序. GLIDE 是 DALL-E 的演进版, 仍用 CLIP 给生成图像排序, 但图像生成改由扩散模型完成. Stable Diffusion 同样基于扩散模型, 但在强大的预训练自编码器的潜在空间上运行, 因而能用有限算力保持质量和灵活性. VisualGPT 把 GPT-2 从单一语言模型演进为多模态模型, 用一个自我复活的激活单元产生稀疏激活, 防止意外覆盖语言知识.

![被译论文的 Fig. 1: 人类智能 HI 与 AGI 相互启发, 中间经 RLHF 连接, 列出规模, 多模态, 对齐, 推理几项特征](images/p54-fig-1-le-d-veloppement-de-l-agi-a-t-largement-inspir.png)

Fig. 1. Le développement de l’AGI a été largement inspiré par l’étude de l’intelligence humaine (HI). En retour, l’AGI a le potentiel de bénéficier à l’intelligence humaine. Par exemple, les modèles de langage actuels tels que Chat-GPT et GPT-4 utilisent l’apprentissage par renforcement avec retour humain (RLHF) pour align leur comportement avec les <sub>valeurs</sub> humaines. À mesure que nous continuons à étudier et à comprendre à la fois l’intelligence humaine et l’AGI, ces deux systèmes deviendront de plus en plus intriqués, se renforçant et se soutenant mutuellement de manière nouvelle et passionnante.

图 1. AGI 的发展很大程度上受到人类智能 (HI) 研究的启发. 反过来, AGI 也可能造福人类智能. 例如 ChatGPT 和 GPT-4 等当前语言模型用基于人类反馈的强化学习 (RLHF) 让行为与人类价值观对齐. 随着对两者研究的深入, 人类智能与 AGI 会越来越交织, 以新颖而令人兴奋的方式相互促进.

2.2.2. Réponse aux questions visuelles La réponse aux questions visuelles est une application cruciale de l’apprentissage multimodal qui nécessite qu’un modèle réponde correctement à une question basée sur du texte en fonction d’une image. Le jeu de données VQA présente cette tâche, et les équipes de Microsoft Research ont développé certaines des approches de pointe pour cela. L’une de ces approches est METER, une structure générale pour former des transformateurs vision-langage performants utilisant une variété de sousarchitectures pour les modules encodeur de vision, encodeur de texte, fusion multi-modale et décodeur. Cette flexibilité permet à METER d’atteindre des performances de pointe dans une gamme de tâches. Une autre approche prometteuse est le modèle de pré-entraînement unifié Vision-Language (VLMo), qui utilise un réseau transformateur modulaire pour apprendre conjointement un double encodeur et un encodeur de fusion. Chaque bloc du réseau contient un pool d’experts spécifiques à la modalité et une couche d’auto-attention partagée, offrant une flexibilité significative pour le réglage fin. Cette architecture a montré des résultats impressionnants sur plusieurs ensembles de données de référence.

2.2.2 视觉问答. 视觉问答是多模态学习的重要应用, 要求模型根据图像正确回答基于文本的问题. VQA 数据集体现了这一任务, 微软研究院团队为此开发了若干先进方法. 其一是 METER, 一个训练高性能视觉-语言 Transformer 的通用框架, 为视觉编码器, 文本编码器, 多模态融合和解码器模块提供多种子架构, 这种灵活性让 METER 在一系列任务上达到先进水平. 另一种有前景的方法是统一视觉-语言预训练模型 VLMo, 它用模块化 Transformer 网络联合学习双编码器和融合编码器. 网络每个块含一个模态专属专家池和一个共享自注意力层, 为微调提供很大灵活性. 该架构在多个基准数据集上结果出色.

2.2.3. Modélisation vidéo-langage Traditionnellement, les systèmes d’IA ont eu du mal avec les tâches basées sur la vidéo en raison des ressources de calcul élevées requises. Cependant, cela commence à changer, grâce aux efforts dans le domaine de la modélisation vidéo-langage et d’autres tâches multimodales liées à la vidéo, comme le projet Florence-VL de Microsoft. À la mi-2021, le projet Florence-VL a introduit ClipBERT, une combinaison d’un modèle CNN et d’un modèle transformateur qui fonctionne sur des cadres échantillonnés de manière éparse. Il est optimisé de manière globale pour résoudre les tâches vidéo-langage populaires. Les évolutions ultérieures de ClipBERT, telles que VIOLET et SwinBERT, ont introduit le modèle de modélisation de jetons visuels masqués et l’attention éparse pour améliorer l’état de l’art en réponse aux questions vidéo, la recherche vidéo et le sous-titrage vidéo. Bien que chacun de ces modèles ait des caractéristiques uniques, ils utilisent tous une architecture basée sur le transformateur. Typiquement, cette architecture est couplée avec des modules d’apprentissage parallèle pour extraire des données de diverses modalités et les unifier en une seule représentation multimodale. Récemment, l’émergence de GPT-4 a porté la recherche multimodale à un nouveau niveau. Selon le dernier article de recherche officiel, GPT-4 non seulement affiche une grande maîtrise dans divers domaines, y compris la littérature, la médecine, le droit, les mathématiques, les sciences physiques et la programmation, mais combine également de manière fluide les compétences et les concepts de plusieurs domaines, démontrant une compréhension impressionnante des idées complexes. De plus, la performance de GPT-4 dans toutes ces tâches est remarquablement proche du niveau humain et dépasse souvent les modèles précédents tels que ChatGPT. Compte tenu de l’étendue et de la profondeur des capacités de GPT-4, il pourrait être considéré comme une version précoce (bien qu’incomplète) d’un système AGI.

2.2.3 视频-语言建模. 传统上, AI 系统因算力需求高而难以处理视频任务. 不过, 随着视频-语言建模及其他视频相关多模态任务的推进 (如微软的 Florence-VL 项目), 情况开始改变. 2021 年年中, Florence-VL 项目推出 ClipBERT, 它把 CNN 和 Transformer 结合, 在稀疏采样的帧上运行, 并端到端优化以解决常见的视频-语言任务. ClipBERT 的后续演进 VIOLET 和 SwinBERT 引入了掩码视觉 token 建模和稀疏注意力, 刷新了视频问答, 视频检索和视频描述的最好成绩. 这些模型各有特色, 但都采用基于 Transformer 的架构, 通常再配上并行学习模块, 从不同模态提取数据并统一成单一的多模态表示. 近来 GPT-4 的出现把多模态研究推上新台阶. 据最新官方研究论文, GPT-4 不仅在文学, 医学, 法律, 数学, 物理科学和编程等领域表现出高超水平, 还能流畅地综合多个领域的技能和概念, 对复杂思想的理解令人印象深刻. 而且 GPT-4 在这些任务上的表现非常接近人类水平, 常常超过 ChatGPT 等先前模型. 鉴于其能力的广度和深度, GPT-4 可被视为 AGI 系统的一个早期 (尽管不完整) 版本.

2.2.4. Apprentissage multimodal avec données auditives Data2vec, une récente développement de Meta AI, présente un nouveau cadre d’apprentissage autosupervisé qui contourne le besoin de données étiquetées traditionnelles. En tirant parti des relations internes des données, il unifie l’apprentissage à travers trois modalités distinctes : images, texte et parole. Utilisant une architecture à double mode, il utilise un modèle "enseignant" pour générer des représentations d’échantillons, et un modèle "étudiant" pour apprendre de l’enseignant à travers la minimisation d’une fonction objectif. Cette méthodologie unique permet d’obtenir des résultats de pointe dans chacune des trois modalités, marquant un pas important vers la réalisation de l’intelligence artificielle générale.

2.2.4 结合音频数据的多模态学习. Meta AI 近期推出的 Data2vec 提出一种新的自监督学习框架, 不需要传统的标注数据. 它利用数据内部的关系, 统一了图像, 文本和语音三种模态的学习. 它采用双模式架构, 用一个 「教师」 模型生成样本表示, 用一个 「学生」 模型通过最小化目标函数向教师学习. 这种方法在三种模态上都取得最好成绩, 是迈向通用人工智能的重要一步.

<!-- page 55 of 68 -->

Microsoft’s Kosmos-1 est un grand modèle de langage multimodal qui traite le texte, les données visuelles et auditives. Utilisant des corpus multimodaux basés sur le web, il comprend les modalités générales et dé- montre l’apprentissage contextuel et le suivi des instructions. Ses capacités englobent la compréhension du langage, la génération de légendes pour les images, la réponse aux questions visuelles et la reconnaissance d’images, soulignant la capacité de transfert intermodal, ce qui facilite l’échange de connaissances entre le langage et les entrées multimodales.

微软的 Kosmos-1 是一个处理文本, 视觉和音频数据的多模态大语言模型. 它用基于网页的多模态语料训练, 理解通用模态, 并展现 in-context learning 和指令遵循能力. 其能力涵盖语言理解, 图像描述生成, 视觉问答和图像识别, 体现出跨模态迁移能力, 促进语言与多模态输入之间的知识交换.

Il est important de noter que, contrairement aux LLM unimodaux, les LLM multimodaux affichent des performances supérieures non seulement dans les tâches intermodales mais aussi dans les tâches unimodales. Par exemple, l’intégration de la multimodalité dans GPT-4 se traduit par de meilleures performances dans les tâches textuelles par rapport à ChatGPT. Cela correspond à la façon dont les humains perçoivent le monde à travers plusieurs modalités sensorielles.

值得注意的是, 与单模态 LLM 不同, 多模态 LLM 不仅在跨模态任务上, 在单模态任务上也表现更好. 例如 GPT-4 引入多模态后, 在文本任务上的表现优于 ChatGPT. 这与人类通过多种感官模态感知世界的方式一致.

2.3. Alignement Bien que certains LLM comme BERT, GPT, GPT-2, GPT-3 et Textto-Text Transfer Transformer (T5) aient réalisé des succès remarquables dans des tâches spécifiques, ils ne sont toujours pas encore AGI en raison de leur tendance à présenter des comportements non intentionnels. Par exemple, ils pourraient générer du texte biaisé ou toxique, inventer des faits ou ne pas suivre les instructions de l’utilisateur. La principale raison derrière ces problèmes est le désalignement entre l’objectif de modélisation du langage utilisé pour de nombreux LLM récents et l’objectif de suivre les instructions de l’utilisateur de manière sûre et utile. Par conséquent, bien que ces modèles aient fait des progrès significatifs, ils ne sont pas encore capables d’émuler le raisonnement, la prise de décision et la compréhension de type humain. Pour atteindre l’AGI, il est crucial d’aligner les modèles de langage avec l’intention de l’utilisateur. Cet alignement permettra aux LLM de fonctionner de manière sûre et utile, les rendant plus fiables pour les tâches complexes qui nécessitent une prise de décision nuancée et une compréhension. Pour ce faire, il est nécessaire de développer de meilleurs algorithmes qui orientent les agents vers les valeurs humaines tout en favorisant les collaborations interdisciplinaires pour clarifier ce que signifient les valeurs humaines.

2.3 对齐. 尽管 BERT, GPT, GPT-2, GPT-3 和 Text-to-Text Transfer Transformer (T5) 等 LLM 在特定任务上成绩显著, 它们仍算不上 AGI, 因为容易出现非预期行为, 比如生成有偏见或有毒的文本, 编造事实, 不遵循用户指令. 这些问题的主要原因, 是许多近期 LLM 所用的语言建模目标与 「安全, 有用地遵循用户指令」 这一目标之间不对齐. 因此这些模型虽然进步显著, 仍无法模拟人类式的推理, 决策和理解. 要实现 AGI, 关键在于让语言模型与用户意图对齐, 这能让 LLM 安全, 有用地运行, 在需要细致决策和理解的复杂任务上更可靠. 为此需要开发更好的算法, 引导 agent 朝向人类价值观, 同时推动跨学科合作, 厘清人类价值观究竟意味着什么.

Les développements récents dans les grands modèles de langage (LLM), tels que Sparrow, InstructGPT, ChatGPT et GPT-4, ont abordé le problème de l’alignement avec les instructions humaines en utilisant l’apprentissage par renforcement à partir du retour d’expérience humain (RLHF). L’apprentissage par renforcement est un type d’apprentissage automatique où le modèle apprend à prendre des décisions en fonction du retour d’expérience qu’il reçoit sous forme de récompenses. Le but du modèle est de maximiser sa récompense totale au fil du temps. RLHF utilise les préférences humaines comme signal de ré- compense pour affiner les LLM et permettre aux LLM d’apprendre et d’améliorer à partir du retour d’expérience humain, ce qui essaie de prédire quelles réponses les humains réagiront positivement à et aide à réduire les comportements non intentionnels et à augmenter leur fiabilité pour les tâches complexes. Puisque le modèle apprend des humains en temps réel, il devient de mieux en mieux à prédire. À la fin du processus de formation, les systèmes AI commencent à imiter les humains. RLHF a montré des résultats prometteurs et est un pas important vers le développement de LLM qui peuvent fonctionner de manière sûre et utile, s’alignant avec les valeurs et intentions humaines.

Sparrow, InstructGPT, ChatGPT 和 GPT-4 等近期 LLM 用基于人类反馈的强化学习 (RLHF) 处理与人类指令对齐的问题. 强化学习是一类机器学习, 模型根据以奖励形式获得的反馈学习做决策, 目标是最大化长期总奖励. RLHF 以人类偏好作奖励信号微调 LLM, 让 LLM 从人类反馈中学习和改进, 它试图预测人类会对哪些回答作出正面反应, 有助于减少非预期行为, 提高复杂任务上的可靠性. 由于模型实时向人类学习, 它的预测越来越好, 训练结束时 AI 系统开始模仿人类. RLHF 已显示出有前景的结果, 是开发能安全, 有用地运行并与人类价值观和意图对齐的 LLM 的重要一步.

2.4. Raisonnement Le raisonnement joue un rôle crucial dans l’intelligence humaine et est essentiel pour la prise de décision, la ré- solution de problèmes et le pensée critique.

2.4 推理. 推理在人类智能中起关键作用, 对决策, 解决问题和批判性思维都必不可少.

Une étude précédente a exploré les facteurs qui influencent les niveaux d’intelligence en comparant différents attributs des cerveaux à travers diverses espèces de mammifères. Les résultats suggèrent que les capacités cognitives sont principalement centrées sur le nombre absolu de neurones. Parmi les mammifères, le cerveau humain a le plus grand nombre de neurones, ce qui lui confère des capacités de raisonnement et d’intelligence supérieures par rapport aux autres espèces. Récemment, un phénomène similaire a également émergé dans les LLM. Il a été observé que les LLM présentent des comportements émergents, tels que la capacité de raisonner, lorsqu’ils atteignent une certaine taille. Pour améliorer les capacités de raisonnement des LLM, deux principaux types d’approches ont été développés. Le pre-mier type, connu sous le nom de méthodes basées sur les invites, est plus largement recherché et implique l’utilisation d’invites appropriées pour mieux stimuler les capacités de raisonnement que les LLM possèdent déjà. Le deuxième type d’approches implique l’introduction de code de programme dans le processus de pré-formation, où il est formé aux côtés du texte pour améliorer davantage la capacité de raisonnement du LLM. Les deux approches ont des directions fondamentalement différentes : l’utilisation de code pour améliorer les capacités de raisonnement des LLM représente une stratégie de renforcement direct des capacités de raisonnement des LLM en augmentant la diversité des données de formation ; tandis que l’approche basée sur les invites ne favorise pas les capacités de raisonnement propres au LLM, mais fournit plutôt une méthode technique pour que le LLM démontre mieux cette capacité lors de la résolution de problèmes.

先前一项研究比较了多种哺乳动物大脑的不同属性, 探究影响智力水平的因素. 结果表明认知能力主要取决于神经元的绝对数量. 哺乳动物中人脑的神经元最多, 因而推理能力和智力优于其他物种. 近来 LLM 中也出现了类似现象: 据观察, LLM 达到一定规模后会出现推理等涌现行为. 提升 LLM 推理能力的方法主要有两类. 第一类是基于提示词的方法, 研究更多, 用合适的提示词更好地激发 LLM 已有的推理能力. 第二类是在预训练中引入程序代码, 与文本一起训练, 进一步提升 LLM 的推理能力. 两者方向根本不同: 用代码增强推理, 是通过增加训练数据多样性直接强化 LLM 推理能力的策略; 基于提示词的方法并不提升 LLM 自身的推理能力, 只是提供一种技术手段, 让 LLM 在解题时更好地展现这种能力.

Actuellement, la plupart des travaux existants dans le domaine du raisonnement des grands modèles de langage (LLM) adoptent des méthodes basées sur les invites, qui peuvent être divisées en trois routes techniques. La première approche est le Zero-shot Chain of Thought (CoT), proposé par Kojima et al. Cette méthode est simple et efficace, impliquant deux étapes. Dans la première étape, une phrase d’invite, "Let’s think step by step", est ajoutée à la question, et le LLM sort un processus de raisonnement spécifique. Dans la deuxième étape, le processus de raisonnement sorti par le LLM dans la première étape est concaténé avec la question, et la phrase d’invite, "Therefore, the answer (arabic numerals) is", est ajoutée pour obtenir la réponse. Une telle opération simple peut augmenter considérablement l’efficacité du LLM dans diverses tâches de raisonnement. Par exemple, Zero-shot-CoT réalise des gains de score de 10,4% à 40,7% sur le benchmark arithmétique GSM8K. La deuxième approche est le Few-Shot CoT, qui est actuellement la principale direction de la recherche en raisonnement des LLM. L’idée principale du Few-Shot CoT est simple : pour enseigner au modèle LLM à apprendre le raisonnement, fournir quelques exemples de raisonnement écrits manuellement, et expliquer clairement les étapes de raisonnement spécifiques l’une après l’autre avant d’obtenir la réponse finale dans les exemples. Ces processus de raisonnement détaillés écrits manuellement sont appelés Chain of Thought Prompting. Le concept de CoT a été proposé explicite ment pour la première fois par Wei et al. Bien que la méthode soit simple, la capacité de raisonnement du modèle LLM a été grandement améliorée après l’application du CoT. La précision de l’ensemble de données de raisonnement mathématique GSM8K est passée à environ 60,1%. Basé sur le CoT, les travaux ultérieurs ont élargi le CoT à partir d’une seule question d’invite à plusieurs questions d’invite, vérifié la justesse des étapes intermédiaires de raisonnement, et amélioré la précision des sorties multiples en utilisant le vote pondéré. Ces améliorations ont continuellement augmenté la précision du test set GSM8K à environ 83%. La troisième approche est le Leastto-most prompting. L’idée centrale est de décomposer un problème de raisonnement complexe en plusieurs sous-problèmes plus faciles à résoudre qui peuvent être résolus séquentiellement, où la résolution d’un sousproblème donné est facilitée par les réponses aux sous-problèmes précédemment résolus. Après avoir résolu chaque sous-problème, nous pouvons dériver la réponse au problème original à partir des réponses aux sousproblèmes. Cette idée est hautement co-hérente avec l’algorithme diviser pour mieux régner que les humains utilisent pour ré- soudre des problèmes complexes. À mesure que notre compréhension du cerveau et des LLM continue de s’approfondir, il sera intéressant d’étudier si ces deux systèmes réseau partagent une structure optimale.

目前 LLM 推理领域的大部分工作采用基于提示词的方法, 可分为三条技术路线. 第一条是 Kojima 等人提出的 Zero-shot Chain of Thought (CoT), 简单有效, 分两步: 第一步在问题后加上提示句 「Let’s think step by step」, LLM 输出具体的推理过程; 第二步把第一步的推理过程与问题拼接, 再加上提示句 「Therefore, the answer (arabic numerals) is」 得到答案. 这样简单的操作就能大幅提升 LLM 在多种推理任务上的效果, 例如 Zero-shot-CoT 在算术基准 GSM8K 上取得 10.4% 到 40.7% 的分数提升. 第二条是 Few-Shot CoT, 目前是 LLM 推理研究的主要方向. 其思路很简单: 为教会 LLM 推理, 提供几个人工撰写的推理样例, 在样例中得出最终答案前逐步讲清具体推理步骤. 这些人工撰写的详细推理过程叫 Chain of Thought Prompting, CoT 概念由 Wei 等人首次明确提出. 方法虽简单, 应用 CoT 后 LLM 的推理能力大幅提升, 数学推理数据集 GSM8K 的准确率升到约 60.1%. 在 CoT 基础上, 后续工作把单个提示问题扩展为多个, 验证中间推理步骤的正确性, 并用加权投票提升多次输出的准确率, 这些改进不断把 GSM8K 测试集准确率提高到约 83%. 第三条是 Least-to-most prompting, 核心思想是把复杂推理问题分解成若干更容易, 可依次求解的子问题, 求解某个子问题时借助前面已解子问题的答案, 解完所有子问题后再从它们的答案推出原问题的答案. 这一思路与人类解决复杂问题时的分而治之高度一致. 随着对大脑和 LLM 理解的加深, 研究这两个网络系统是否共享某种最优结构会很有意思.

3. Technologie importante Les modèles de langage, tels que les LLM, reposent sur plusieurs techniques cruciales, notamment le zero-shot prompting, le few-shot prompting, l’apprentissage contextuel et l’instruction. L’attente sous-jacente de ces techniques est que les systèmes AI peuvent rapidement apprendre de nouvelles tâches en s’appuyant sur ce qu’ils ont appris dans le passé, tout comme les humains le font. Grâce à l’utilisation de ces techniques, les modèles de langage peuvent être formés pour effectuer une large gamme de tâches, de la génération de texte cohérent à la réponse à des questions complexes, avec plus de précision et d’efficacité. En fin de compte, ces avancées nous rapprochent de la réalisation du potentiel de l’AI pour assister et augmenter l’intelligence humaine de manière nouvelle et passionnante. Parmi ces techniques, l’instruction sert d’interface utilisée par ChatGPT, où les utilisateurs fournissent des descriptions de tâches en langage naturel, telles que "Traduisez cette phrase du chinois à l’anglais". Fait intéressant, le zero-shot prompting était initialement le terme utilisé pour l’instruction. Au cours des premières étapes du zero-shot prompting, les utilisateurs ont eu du mal à exprimer les tâches clairement, les amenant à essayer divers mots et phrases à plusieurs reprises pour obtenir la formulation optimale. Actuellement, l’instruction consiste à fournir une déclaration de commande pour faciliter la compréhension du LLM.

3. 重要技术. LLM 等语言模型依赖几项关键技术, 包括 zero-shot prompting, few-shot prompting, in-context learning 和指令. 这些技术背后的预期是: AI 系统能像人一样, 借助过去所学快速学会新任务. 借助这些技术, 语言模型可以更准确高效地完成从生成连贯文本到回答复杂问题的各类任务, 让 AI 离以新方式辅助和增强人类智能的潜力更近. 其中, 指令是 ChatGPT 所用的交互界面, 用户用自然语言提供任务描述, 如 「把这句话从中文译成英文」. 有趣的是, zero-shot prompting 最初就是指令的叫法. 早期用户难以把任务表达清楚, 只好反复尝试各种词句以找到最佳表述; 如今指令就是给出一个命令式陈述, 方便 LLM 理解.

3.1. Apprentissage contextuel La capacité la plus importante du cerveau humain ré- side dans sa capacité d’apprentissage robuste, permettant l’exécution de fonctions cognitives, computationnelles, expressives et motrices basées sur des invites linguistiques ou visuelles, souvent avec peu ou pas d’exemples. Cette caractéristique est centrale à l’obtention d’une AGI de niveau humain. Les récents avancées dans les modèles AGI à grande échelle, en particulier GPT-4, ont démontré une capacité prometteuse. Ils sont pré-entraînés sur des ensembles de données multimodales massives, capturant une large gamme de tâches et de connaissances tout en comprenant diverses invites des domaines linguistiques et visuels. Cela permet l’apprentissage contextuel similaire au mode de fonctionnement du cerveau humain, et pousse l’AGI dans des applications du monde réel, y compris des applications dans le domaine de la santé. En fait, à la suite de l’émergence de modèles à grande échelle comme GPT-4 et Midjourney V5, de nombreuses industries, telles que le traitement de texte et l’illustration, ont vu des scénarios perturbateurs où l’AGI libère le travail humain. Ces modèles tirent parti des connaissances préalables acquises lors du pré-entraînement sur diverses tâches et contextes, permettant une adaptation rapide à de nouvelles tâches sans nécessiter de données étiquetées étendues pour le réglage fin, ce qui est un défi crucial dans des domaines comme la médecine et la robotique où les données étiquetées sont souvent limitées ou même indisponibles.

3.1 In-context learning. 人脑最重要的能力在于强大的学习能力, 常常只凭很少甚至没有样例, 就能根据语言或视觉提示执行认知, 计算, 表达和运动功能. 这一特性是实现人类水平 AGI 的核心. 近期的大规模 AGI 模型, 尤其是 GPT-4, 展现出有前景的能力. 它们在海量多模态数据集上预训练, 掌握广泛的任务和知识, 能理解来自语言和视觉领域的多种提示. 这实现了类似人脑工作方式的 in-context learning, 把 AGI 推向包括医疗在内的现实应用. 事实上, 随着 GPT-4 和 Midjourney V5 等大模型的出现, 文字处理, 插画等许多行业都出现了 AGI 解放人力的颠覆性场景. 这些模型利用预训练中在多种任务和语境下获得的先验知识, 无需大量标注数据微调就能快速适应新任务, 这在医学, 机器人等标注数据有限甚至缺失的领域是关键挑战.

Dans le contexte de l’AGI, l’apprentissage contextuel désigne la capacité du modèle à comprendre et à exécuter de nouvelles tâches en fournissant un nombre limité de paires entrée-sortie dans les invites ou simplement une description de la tâche. Les invites facilitent la compréhension du modèle de la structure et des motifs de la tâche, tandis que l’apprentissage contextuel présente des similitudes avec le réglage fin explicite au niveau de la prédiction, de la représentation et du comportement de l’attention. Cela leur permet de généraliser et de mieux effectuer de nouvelles tâches sans formation ou réglage fin supplémentaires et réduit la probabilité de surajustement des données de formation étiquetées en aval.

在 AGI 语境下, in-context learning 指模型在提示中只获得少量输入-输出对或仅一段任务描述, 就能理解并执行新任务的能力. 提示帮助模型理解任务的结构和模式, 而 in-context learning 在预测, 表示和注意力行为层面与显式微调有相似之处. 这让模型无需额外训练或微调就能泛化并更好地完成新任务, 也降低了对下游标注训练数据过拟合的可能.

Malgré l’absence de besoins en réglage fin dans ces modèles AGI à grande échelle, les compromis incluent l’augmentation des coûts de calcul en raison de leur échelle massive de paramètres et le besoin potentiel de connaissances expertes dans la formulation d’invites efficaces avec des exemples lors de l’inférence. Les solutions potentielles impliquent des avancées matérielles et l’intégration de connaissances spécifiques à un domaine plus raffinées lors de la phase de pré-entraînement.

这些大规模 AGI 模型虽然不需要微调, 代价是参数规模庞大带来的计算成本上升, 以及推理时可能需要专家知识来编写带样例的有效提示. 潜在的解决办法包括硬件进步, 以及在预训练阶段融入更精细的领域知识.

3.2. Réglage des invites et des instructions Comme les nourrissons humains acquièrent généralement divers concepts sur le monde principalement par l’observation, avec très peu d’intervention directe, les modèles AGI à grande échelle acquièrent également une vaste connaissance après une formation non supervisée initiale et ont atteint des performances de généralisation remarquables. Les méthodes basées sur les invites et le réglage des instructions permettent aux modèles pré- entraînés d’atteindre l’apprentissage zeroshot dans de nombreuses applications en aval.

3.2 Prompt tuning 与指令微调. 人类婴儿主要通过观察, 在很少直接干预的情况下习得关于世界的各种概念; 类似地, 大规模 AGI 模型在初始的无监督训练后也获得了大量知识, 泛化表现出色. 基于提示词的方法和指令微调让预训练模型在许多下游应用中实现 zero-shot 学习.

Le cerveau humain est toujours un processeur efficace et ordonné, fournissant un retour ciblé pour la tâche actuelle plutôt que de dire des absurdités. En plus de l’efficacité innée du cerveau, les contraintes morales et légales enracinées dans le développement humain garantissent également que les interactions humaines sont ordonnées et béné- fiques. Pour que les modèles AGI atteignent des performances de niveau humain, produire des résultats vrais et inoffensifs sur la base des instructions est une exigence essentielle. Bien que les modèles AGI actuels aient des capacités génératives puissantes, une question clé est de savoir si ces capacités peuvent être alignées avec l’intention de l’utilisateur. Cela est important car cela concerne si le modèle peut produire des résultats satisfaisants pour les utilisateurs, même dans des situations où les tâches et les invites sont inédites et peu claires. De plus, à mesure que ces modèles deviennent plus largement utilisés, les sorties non vraies et toxiques doivent être efficacement contrôlées.

人脑始终是高效有序的处理器, 针对当前任务给出有针对性的反馈, 而不是胡言乱语. 除了大脑天生的高效, 人类成长中扎根的道德和法律约束也保证了人际互动有序而有益. AGI 模型要达到人类水平, 根据指令产出真实无害的结果是基本要求. 当前 AGI 模型生成能力强大, 但关键问题是这些能力能否与用户意图对齐. 这很重要, 因为它关系到模型在任务和提示新颖, 模糊时能否产出让用户满意的结果. 而且随着这些模型用得越来越广, 不真实和有毒的输出必须得到有效控制.

InstructGPT est à l’avant-garde à cet égard. Afin d’améliorer la qualité des sorties du modèle, une formation supervisée est effectuée en utilisant des invites et des démonstrations fournies par l’homme. Les sorties générées par différents modèles sont ensuite collectées et classées par l’homme en fonction de leur qualité. Les modèles sont ensuite affinés en utilisant une technique connue sous le nom de RLHF, qui utilise les préférences humaines comme récompenses pour guider le processus d’apprentissage. En outre, pour éviter que InstructGPT ne s’aligne exclusivement avec les tâches humaines au détriment de négliger les tâches NLP classiques, une petite quantité des données originales utilisées pour former GPT-3 (la base d’InstructGPT) est mélangée. Des recherches récentes ont démontré que l’incorporation de jeux de données d’instructions de tâches à plus grande échelle et plus diversifiés peut encore améliorer les performances du modèle.

InstructGPT 在这方面走在前列. 为提升输出质量, 先用人工提供的提示和示范做监督训练, 再收集不同模型生成的输出, 由人按质量排序, 然后用 RLHF 微调模型, 以人类偏好作奖励引导学习. 此外, 为避免 InstructGPT 只对齐人类任务而忽视经典 NLP 任务, 还混入少量训练 GPT-3 (InstructGPT 的基座) 所用的原始数据. 近期研究表明, 纳入规模更大, 更多样的任务指令数据集能进一步提升模型表现.

<!-- page 56 of 68 -->

3.3. Évolution de l’AGI L’AGI fait référence à un niveau avancé d’intelligence artificielle (IA) qui reflète les capacités humaines dans la compréhension, l’apprentissage et l’application des connaissances à travers un large éventail de tâches et de domaines. Contrairement à l’IA étroite (par exemple, un réseau de neurones convolutif sur mesure pour la reconnaissance faciale), qui est conçue pour effectuer des tâches spécifiques, l’AGI est capable de s’adapter à de nouvelles situations, de transférer des connaissances entre domaines et de démontrer des capacités cognitives humaines au-delà des flux de travail de résolution de tâches rationalisés et formatés dans la littérature actuelle. Dans l’ensemble, l’AGI pourrait démontrer une polyvalence et une adaptabilité remarquables. Bien que la communauté scientifique n’ait pas encore réalisé une véritable AGI, les avancées réalisées dans le domaine de l’intelligence artificielle et de ses sousdomaines (par exemple, l’apprentissage profond) ont jeté les bases pour une exploration plus approfondie et la quête vers la réalisation de l’AGI. Voici un bref aperçu de l’histoire de l’AGI.

3.3 AGI 的演化. AGI 指一种高级人工智能, 在理解, 学习和跨广泛任务与领域运用知识上体现人类能力. 与为特定任务设计的狭义 AI (如专门做人脸识别的卷积神经网络) 不同, AGI 能适应新情境, 在领域间迁移知识, 展现超出现有文献中格式化, 流程化解题工作流的人类式认知能力. 总体上, AGI 可能表现出非凡的通用性和适应性. 科学界尚未实现真正的 AGI, 但人工智能及其子领域 (如深度学习) 的进展为进一步探索和追求 AGI 打下了基础. 下面简要回顾 AGI 的历史.

3.4. Premiers jours de l’IA Le concept d’AGI remonte au travail d’Alan Turing, qui a proposé l’idée que les machines pourraient penser et apprendre comme des humains dans un manuscrit de 1950 intitulé "Computing Machinery and Intelligence". Les idées de Turing ont jeté les bases du développement de l’IA et de l’informatique en général. En 1956, l’atelier de Dartmouth, organisé par des pionniers tels que John Mc-Carthy, Marvin Minsky, Nathaniel Rochester et Claude Shannon, a marqué le début de l’IA en tant que discipline académique. Leur objectif était de développer des machines capables d’imiter l’intelligence humaine. Cet effort collectif a joué un rôle significatif dans la formation du futur cours de la communauté de l’IA.

3.4 AI 的早期. AGI 的概念可追溯到 Alan Turing, 他在 1950 年题为 「Computing Machinery and Intelligence」 的论文中提出机器可以像人一样思考和学习. Turing 的思想为 AI 乃至整个计算机科学奠定了基础. 1956 年, 由 John McCarthy, Marvin Minsky, Nathaniel Rochester 和 Claude Shannon 等先驱组织的达特茅斯研讨会标志着 AI 作为学科的开端, 他们的目标是开发能模仿人类智能的机器. 这一集体努力对 AI 界此后的走向影响深远.

L’optimisme et l’enthousiasme initiaux dans le domaine ont conduit au développement de programmes d’IA précoces tels que le General Problem Solver, le Logic Theorist et ELIZA. Cependant, ces systèmes d’IA étaient limités en portée et impraticables pour des applications à grande échelle dans le monde réel. Une période connue sous le nom d’hiver de l’IA s’est produite en raison d’une baisse du financement et de l’intérêt pour la recherche en intelligence artificielle. Cela était dû au manque de progrès significatifs réalisés dans le domaine et aux revendications irréalistes faites par certains chercheurs. La réduction du soutien financier a, à son tour, conduit à une nouvelle baisse des progrès et à une diminution du nombre de publications de recherche. Le regain d’intérêt pour l’IA a été apporté par les réseaux de neurones artificiels qui étaient modélisés d’après la structure et la fonction du cerveau humain. L’algorithme de rétropropagation, introduit par Rumelhart, Hinton et Williams en 1986, a permis aux réseaux de neurones d’apprendre plus efficacement et a jeté des bases solides pour les réseaux de neurones modernes.

早期的乐观和热情催生了 General Problem Solver, Logic Theorist, ELIZA 等早期 AI 程序. 然而这些系统范围有限, 无法用于大规模现实应用. 由于缺乏实质进展和部分研究者不切实际的宣称, AI 研究的经费和兴趣下降, 出现了所谓的 AI 寒冬. 经费减少又导致进展进一步放缓, 研究论文数量下降. 模仿人脑结构和功能的人工神经网络带来了对 AI 的重新关注. 1986 年 Rumelhart, Hinton 和 Williams 提出的反向传播算法让神经网络能更有效地学习, 为现代神经网络打下坚实基础.

En outre, l’émergence de méthodes d’apprentissage automatique telles que les machines à vecteurs de support, les arbres de décision et les méthodes d’ensemble s’est avérée être des outils puissants pour la reconnaissance des formes et la classification. Ces méthodes ont propulsé la recherche en IA et ont permis des applications pratiques, poussant davantage le domaine vers l’avant. 3.5. Apprentissage profond et AGI moderne Le développement de l’apprentissage profond, rendu possible par des avancées révolutionnaires en matière de puissance de calcul et la disponibilité de grands ensembles de données, a conduit à des avancées notables dans le domaine de l’IA. Les percées en vision par ordinateur, en traitement du langage naturel et en apprentissage par renforcement rapprochent la perspective de l’AGI de devenir une réalité tangible. En particulier, l’architecture Transformer, introduite par Vaswani et al. en 2017, a révolutionné la modélisation du langage en exploitant des mécanismes d’auto-attention pour capturer les dépendances globales et les relations contextuelles entre les mots d’une séquence. Cette percée a jeté les bases de l’essor des modèles de langage pré- entraînés, tels que BERT et ses diverses variantes spécifiques à un domaine, des modèles plus grands tels que GPT-3, et des modèles basés sur le transformateur de vision (ViT) en vision par ordinateur. Cette ascendance architecturale partagée a également ouvert la voie au développement de modèles multi-modaux basés sur le transformateur.

此外, 支持向量机, 决策树, 集成方法等机器学习方法的出现, 成为模式识别和分类的有力工具, 推动 AI 研究并带来实际应用. 3.5 深度学习与现代 AGI. 算力的突破性进步和大规模数据集的出现使深度学习得以发展, 带来 AI 领域的显著进展. 计算机视觉, 自然语言处理和强化学习的突破让 AGI 的前景越来越接近现实. 特别是 Vaswani 等人 2017 年提出的 Transformer 架构, 用自注意力机制捕捉序列中词与词之间的全局依赖和上下文关系, 彻底改变了语言建模. 这一突破为预训练语言模型的兴起奠定了基础, 如 BERT 及其各种领域变体, GPT-3 等更大的模型, 以及计算机视觉中基于 Vision Transformer (ViT) 的模型. 这种共同的架构渊源也为基于 Transformer 的多模态模型铺平了道路.

Depuis 2019, l’introduction de modèles de langage à grande échelle comme GPT-2 et GPT-3, tous deux basés sur l’architecture Transformer, ont démontré des capacités impressionnantes de compréhension et de génération en langage naturel. Bien que ces modèles ne soient pas encore de l’AGI, ils représentent une étape importante vers la réalisation de cet objectif. GPT-2 et GPT-3 sont basés sur GPT, un modèle de langage pré-entraîné uniquement décodeur qui utilise des mécanismes d’auto-attention pour capturer les dépendances à long terme entre les mots d’une séquence.

2019 年以来, 同样基于 Transformer 架构的 GPT-2 和 GPT-3 等大规模语言模型, 展现出令人印象深刻的自然语言理解和生成能力. 这些模型虽然还不是 AGI, 却是迈向这一目标的重要一步. GPT-2 和 GPT-3 基于 GPT, 一种 decoder-only 的预训练语言模型, 用自注意力捕捉序列中词与词之间的长程依赖.

Les avancées récentes en IA ont donné lieu à des extensions révolutionnaires des modèles GPT, telles que ChatGPT et GPT-4. ChatGPT s’appuie sur le succès de GPT-3, intégrant le RLHF pour générer des sorties qui s’alignent correctement avec les valeurs et préférences humaines. L’interface de chatbot de Chat-GPT a permis à des millions d’utilisateurs d’interagir avec l’IA de manière plus naturelle, et elle a été appliquée dans divers cas d’utilisation tels que la rédaction d’essais, la réponse aux questions, la recherche, la traduction, l’augmentation de données, le diagnostic assisté par ordinateur et la dépersonnalisation des données. En revanche, GPT-4 représente une avancée significative dans la série GPT, avec un ensemble massif de 10 billions de paramètres. Il est capable de mathématiques avancées, de raisonnement logique. De plus, le modèle excelle dans les examens standard tels que l’USMLE, le LSAT et le GRE. GPT-4 a une applicabilité large et est attendu pour résoudre une gamme de problèmes sans précédent. Son développement témoigne des progrès considérables réalisés dans la quête de l’AGI.

AI 的近期进展带来了 GPT 模型的突破性扩展, 如 ChatGPT 和 GPT-4. ChatGPT 在 GPT-3 的基础上引入 RLHF, 生成与人类价值观和偏好正确对齐的输出. ChatGPT 的聊天界面让数百万用户以更自然的方式与 AI 交互, 已用于写作, 问答, 搜索, 翻译, 数据增强, 计算机辅助诊断和数据去标识化等多种场景. GPT-4 则是 GPT 系列的重大进步, 拥有 10 万亿参数的庞大规模, 能做高等数学和逻辑推理, 在 USMLE, LSAT, GRE 等标准考试中表现优异. GPT-4 适用面广, 有望解决前所未有的一系列问题, 其发展印证了追求 AGI 的巨大进步.

3.6. L’infrastructure de l’AGI Un aspect clé de l’AGI est l’infrastructure nécessaire pour la soutenir. Les réseaux de neurones ont été un composant majeur de cette infrastructure, et leur développement a considérablement évolué depuis leur création dans les années 1940 et 1950. Les premiers ANN étaient limités dans leurs capacités en raison de leurs simples modèles linéaires. Cependant, l’algorithme de rétropropagation, créé par Werbos en 1975, a révolutionné le domaine en rendant possible l’entraînement efficace de réseaux de neurones à plusieurs couches, y compris le perceptron. Cet algorithme calcule les gradients, qui sont utilisés pour mettre à jour les poids du réseau de neurones pendant l’entraînement, lui permettant d’apprendre et d’améliorer ses performances au fil du temps. Depuis le développement de la rétropropagation, la recherche sur les réseaux de neurones a progressé rapidement, avec la création d’architectures et d’algorithmes d’optimisation plus sophistiqués. Aujourd’hui, les réseaux de neurones sont utilisés pour une large gamme de tâches, y compris la classification d’images, le traitement du langage naturel et la pré- diction, et continuent d’être un domaine de recherche actif en apprentissage automatique et en intelligence artificielle.

3.6 AGI 的基础设施. AGI 的一个关键方面是支撑它的基础设施. 神经网络是其中的主要组成部分, 自 20 世纪 40, 50 年代诞生以来已有很大演变. 早期 ANN 因采用简单线性模型而能力有限. 然而 Werbos 于 1975 年提出的反向传播算法让高效训练多层神经网络 (包括感知机) 成为可能, 彻底改变了这一领域. 该算法计算梯度, 用于训练中更新网络权重, 让网络能随时间学习并提升表现. 反向传播出现后, 神经网络研究快速推进, 出现了更精巧的架构和优化算法. 如今神经网络用于图像分类, 自然语言处理和预测等广泛任务, 仍是机器学习和人工智能中活跃的研究领域.

En plus de l’algorithme, les progrès du matériel, en particulier le développement des unités de traitement graphique (GPU) et des unités de traitement tensoriel (TPU), ont permis d’entraîner efficacement des réseaux de neurones profonds, ce qui a conduit à l’adoption généralisée de l’apprentissage profond. Ces progrès ont permis le développement de réseaux de neurones plus puissants, capables de s’attaquer à des problèmes de plus en plus complexes et ont accéléré la recherche et le développement de l’AGI. Par exemple, l’investissement de 1 milliard de dollars de Microsoft dans OpenAI en 2019 a permis la création d’un supercalculateur Azure AI dédié, l’un des systèmes d’IA les plus puissants au monde. Ce supercalculateur est équipé de plus de 285 000 cœurs de CPU et de plus de 10 000 GPU, et il est conçu pour prendre en charge l’entraînement distribué à grande échelle des réseaux de neurones profonds. De tels investissements dans l’infrastructure sont essentiels pour le développement de l’AGI.

除算法外, 硬件的进步, 特别是图形处理器 (GPU) 和张量处理器 (TPU) 的发展, 使深度神经网络的高效训练成为可能, 推动了深度学习的广泛采用. 这些进步让更强大的神经网络得以开发, 能应对越来越复杂的问题, 加速了 AGI 的研发. 例如微软 2019 年向 OpenAI 投资 10 亿美元, 建成一台专用的 Azure AI 超级计算机, 是世界上最强的 AI 系统之一, 配备超过 285,000 个 CPU 核心和超过 10,000 块 GPU, 专为深度神经网络的大规模分布式训练设计. 这类基础设施投资对 AGI 的发展至关重要.

Les avancées récentes dans les modèles d’IA, en particulier la série GPT, ont fourni des informations précieuses sur les exigences en matière d’infrastructure pour le développement de l’AGI. Pour entraîner les modèles d’IA, trois composants essentiels de l’infrastructure AGI sont nécessaires : des exigences massives en matière de données, des ressources de calcul et des systèmes de calcul distribué. Les modèles GPT, y compris GPT-2 et GPT-3, ont été principalement entraînés sur des ensembles de données web à grande échelle, comme l’ensemble de données Web-Text, qui comprenait 45 téraoctets de données textuelles avant le prétraitement et la déduplication, réduit à environ 40 gigaoctets de données textuelles après le prétraitement. L’entraînement d’un modèle GPT nécessite un matériel puissant et des techniques de traitement parallèle, comme l’illustre GPT-3, qui a été entraîné en utilisant un entraînement distribué à grande échelle sur plusieurs GPU, consommant une quantité importante de ressources de calcul et d’énergie. Développer un modèle AGI, comme GPT-4, nécessite des techniques de calcul distribué. Bien que les systèmes de calcul distribué spécifiques utilisés pour entraîner les modèles GPT ne soient pas publiquement divulgués, TensorFlow, PyTorch et Horovod sont des frameworks de calcul distribué qui facilitent la mise en œuvre de ces techniques. Les chercheurs et les développeurs peuvent utiliser ces frameworks pour distribuer le processus d’entraînement sur plusieurs appareils, gérer la communication et la synchronisation des appareils et utiliser efficacement les ressources de calcul disponibles.

AI 模型的近期进展, 尤其是 GPT 系列, 为理解 AGI 开发的基础设施需求提供了宝贵信息. 训练 AI 模型需要 AGI 基础设施的三个基本组成: 海量数据需求, 计算资源和分布式计算系统. GPT-2, GPT-3 等 GPT 模型主要在大规模网页数据集上训练, 如 WebText 数据集, 预处理和去重前有 45 TB 文本, 预处理后约 40 GB. 训练 GPT 模型需要强大的硬件和并行处理技术, GPT-3 就是用多 GPU 大规模分布式训练完成的, 消耗大量算力和能源. 开发 GPT-4 这样的 AGI 模型需要分布式计算技术. 训练 GPT 模型所用的具体分布式系统没有公开, 但 TensorFlow, PyTorch 和 Horovod 等分布式计算框架便于实现这些技术, 研究者和开发者可以用它们把训练分布到多台设备上, 管理设备间的通信与同步, 并高效利用可用的计算资源.

4. Discussion 4.1. Limitations Bien que des progrès significatifs aient été réalisés dans le développement de l’AGI et de l’IA inspirée du cerveau, il reste plusieurs limitations à surmonter avant que nous puissions atteindre une véritable intelligence de niveau humain dans les machines. Certaines de ces limitations incluent :

4. 讨论. 4.1 局限. 尽管 AGI 和类脑 AI 的发展取得了显著进展, 在机器实现真正的人类水平智能之前仍有若干局限需要克服, 包括:

Compréhension limitée du cerveau humain : Malgré les avancées significatives en neurosciences et en IA inspirée du cerveau, nous avons encore une compréhension limitée de la façon dont le cerveau humain fonctionne. Cela rend difficile la création de machines capables de reproduire pleinement l’intelligence humaine. Efficacité des données : Les systèmes actuels d’AGI et d’IA inspirée du cerveau nécessitent de vastes quantités de données d’entraînement pour atteindre des performances comparables à celles des humains. Cela contraste avec les humains, qui peuvent apprendre à partir de relativement peu d’exemples et généraliser à de nouvelles situations avec facilité. Comment apprendre efficacement à partir de quelques échantillons est encore une question ouverte. Les recherches antérieures sur l’apprentissage few-shot et l’apprentissage efficace avec une annotation humaine limitée pourraient fournir des insights pour les grands modèles AGI. Éthique : Il y a aussi des considérations éthiques à prendre en compte avec l’AGI. À mesure que ces systèmes deviennent plus intelligents, ils peuvent être en mesure de prendre des décisions qui ont des conséquences de grande portée. S’assurer que ces décisions s’alignent avec les valeurs et principes éthiques humains est crucial pour prévenir les dommages non intentionnels. Sécurité : La sécurité est également une préoccupation majeure avec l’AGI. S’assurer que ces systèmes ne causent pas de dommages non intentionnels, que ce soit par intention malveillante ou par erreurs non intentionnelles, est essentiel pour leur adoption généralisée. Développer des mécanismes de sécurité robustes et s’assurer que les systèmes AGI s’alignent avec les valeurs humaines est essentiel. En outre, la protection de la vie privée est également d’une importance particulière. Coût de calcul : Les modèles LLM actuels nécessitent des ressources de calcul massives pour s’entraîner et fonctionner, ce qui rend difficile le développement et le déploiement dans une large gamme de scénarios. Pendant ce temps, le coût de calcul peut limiter le nombre de chercheurs et d’organisations travaillant dans le domaine, ce qui peut ralentir les progrès vers l’AGI. De plus, la consommation d’énergie des systèmes AGI peut être prohibitivement élevée, ce qui les rend insoutenables du point de vue environnemental. 4.2. L’avenir de l’AGI L’avenir de l’AGI est un domaine passionnant et en rapide évolution. Bien que le développement de l’AGI reste un défi, il a le potentiel de révolutionner de nombreux aspects de notre vie, de la santé aux transports à l’éducation. Une voie potentielle pour faire avancer l’AGI est la création de modèles de fondation AGI plus puissants et sophistiqués. Les percées ré- centes en traitement du langage naturel, vision par ordinateur, graphe de connaissances et apprentissage par renforcement ont conduit au développement de modèles AGI de plus en plus avancés tels que Chat-GPT et GPT-4. Ces modèles ont montré des capacités impressionnantes dans diverses applications. De nouvelles avancées dans la recherche sur les modèles de fondation AGI, ainsi que des améliorations dans le matériel et les algorithmes de calcul, sont très susceptibles d’accélérer le développement de l’AGI. Une autre approche pour développer l’AGI est l’intégration de différents systèmes et technologies d’IA dans plusieurs domaines, y compris l’ajout de l’humain dans la boucle grâce à l’apprentissage par renforcement à partir du retour d’expérience d’experts. Par exemple, combiner le traitement du langage naturel avec la vision par ordinateur et la robotique sous la direction d’experts humains pourrait conduire à la création de systèmes intelligents plus polyvalents et adaptables. Cette intégration pourrait également aider à surmonter les limitations des systèmes d’IA actuels, qui sont souvent spécialisés dans des domaines spécifiques et manquent de la flexibilité pour transférer des connaissances entre domaines.

对人脑的理解有限: 尽管神经科学和类脑 AI 进展显著, 我们对人脑如何运作的理解仍然有限, 这让造出完全复现人类智能的机器很困难. 数据效率: 当前 AGI 和类脑 AI 系统需要海量训练数据才能达到接近人类的表现, 而人类能从相对很少的样例中学习, 并轻松泛化到新情境. 如何从少量样本中高效学习仍是开放问题, 此前关于 few-shot 学习和有限人工标注下高效学习的研究可能为大型 AGI 模型提供启发. 伦理: AGI 还涉及伦理考量. 随着系统越来越智能, 它们可能做出影响深远的决策, 确保这些决策符合人类价值观和伦理原则, 对防止非预期伤害至关重要. 安全: 安全也是 AGI 的重大关切. 确保这些系统不因恶意或无意错误造成非预期伤害, 是其被广泛采用的前提; 开发稳健的安全机制并确保 AGI 系统与人类价值观对齐至关重要, 隐私保护同样重要. 计算成本: 当前 LLM 的训练和运行需要海量计算资源, 难以在广泛场景中开发和部署; 计算成本还可能限制该领域的研究者和机构数量, 拖慢通往 AGI 的进展; 此外 AGI 系统的能耗可能高到难以承受, 在环境上不可持续. 4.2 AGI 的未来. AGI 的未来是一个令人兴奋且快速演进的领域. AGI 的开发仍具挑战, 但它有可能彻底改变从医疗到交通再到教育的生活诸多方面. 推进 AGI 的一条可能路径是打造更强大精巧的 AGI 基础模型. 自然语言处理, 计算机视觉, 知识图谱和强化学习的近期突破, 催生了 ChatGPT 和 GPT-4 等越来越先进的 AGI 模型, 它们在多种应用中表现出色. AGI 基础模型研究的新进展, 加上硬件和计算算法的改进, 很可能加速 AGI 的发展. 另一种路径是整合多个领域的不同 AI 系统和技术, 包括通过基于专家反馈的强化学习把人纳入回路. 例如在人类专家指导下把自然语言处理与计算机视觉和机器人结合, 可能造出更通用, 更有适应性的智能系统, 也有助于克服当前 AI 系统往往局限于特定领域, 缺乏跨领域迁移知识灵活性的局限.

Le développement de l’AGI nécessite également le développement de nouvelles approches en apprentissage automatique, telles que des méthodes d’instruction plus efficaces, des algorithmes d’apprentissage contextuel et un paradigme de raisonnement, en particulier en apprenant du cerveau humain via l’IA inspirée du cerveau. Ces approches visent à permettre aux machines d’apprendre à partir de données non structurées sans avoir besoin de les étiqueter et de généraliser rapidement à partir de quelques exemples, ce qui est crucial pour permettre aux machines d’apprendre et de s’adapter à de nouvelles tâches et environnements.

AGI 的发展还需要机器学习的新方法, 如更高效的指令方法, in-context learning 算法和推理范式, 尤其要借助类脑 AI 向人脑学习. 这些方法旨在让机器无需标注就能从非结构化数据中学习, 并从少量样例快速泛化, 这对机器学习和适应新任务, 新环境至关重要.

Enfin, les implications éthiques et sociétales du développement de l’AGI doivent être considérées, y compris les questions liées aux biais, à la vie privée et à la sécurité. À mesure que l’AGI devient plus puissant et omniprésent, il est essentiel de s’assurer qu’il est développé et utilisé de manière responsable et éthique, au bénéfice de l’ensemble de la société et en s’alignant bien avec les valeurs humaines.

最后, 必须考虑 AGI 发展的伦理和社会影响, 包括偏见, 隐私和安全问题. 随着 AGI 越来越强大, 越来越普及, 必须确保以负责任, 合乎伦理的方式开发和使用它, 造福整个社会, 并与人类价值观保持一致.

<!-- page 57 of 68 -->

Dans l’ensemble, bien que le développement de l’AGI reste un défi, il a le potentiel de révolutionner de nombreux aspects de notre vie et d’apporter des avantages significatifs à la société et à l’humanité. Les recherches et développements en cours en AGI continueront à faire progresser les progrès vers l’objectif ultime de créer des machines véritablement intelligentes.

总之, AGI 的开发虽仍具挑战, 却有可能彻底改变我们生活的诸多方面, 为社会和人类带来重大益处. AGI 领域持续的研发将不断推进, 朝着造出真正智能机器的终极目标前进.

5. Conclusion Dans cet article, nous avons fourni un aperçu complet de l’IA inspirée du cerveau du point de vue de l’AGI, couvrant ses progrès actuels, ses caractéristiques importantes et ses avancées technologiques vers la réalisation de l’AGI. Nous avons également discuté de l’évolution, des limitations et de l’avenir de l’AGI. En conclusion, l’IA inspirée du cerveau est un domaine prometteur qui a le potentiel de percer les mystères de l’intelligence humaine et de tracer la voie vers l’AGI. Bien que des progrès significatifs aient été réalisés ces dernières années, il reste encore beaucoup de travail à faire pour réaliser l’AGI. Cela nécessitera des avancées technologiques, algorithmiques et matérielles, ainsi que la collaboration continue entre plusieurs disciplines. Néanmoins, la poursuite de l’AGI est une entreprise importante et valable qui a le potentiel de transformer notre monde de manière sans précé- dent. Nous espérons que cette étude apporte une contribution précieuse à ce domaine passionnant et inspire de nouvelles recherches et développements vers l’objectif ultime de l’AGI.

5. 结论部分. 本文从 AGI 视角全面综述了类脑 AI, 涵盖其现状, 重要特征和迈向 AGI 的技术进展, 并讨论了 AGI 的演化, 局限和未来. 类脑 AI 是一个有前景的领域, 有望揭开人类智能的奥秘, 为 AGI 指明道路. 近年进展显著, 但实现 AGI 仍有大量工作要做, 需要技术, 算法和硬件的进步, 以及多学科的持续合作. 尽管如此, 追求 AGI 是一项重要而值得的事业, 有可能以前所未有的方式改变世界. 作者希望这项研究为这一领域作出有价值的贡献, 并启发朝向 AGI 终极目标的进一步研发.

Déclaration d’auteur Lin Zhao : Investigation, Conceptualisation, Rédaction - Rédaction originale ; Lu Zhang : Investigation, Conceptualisation, Rédaction - Rédaction originale ; Zihao Wu : Rédaction - Rédaction originale ; Yuzhong Chen : Rédaction - Ré- daction originale ; Haixing Dai : Rédaction - Rédaction originale ; Xiaowei Yu : Rédaction - Rédaction originale ; Zhengliang Liu : Rédaction - Rédaction originale ; Tuo Zhang: Rédaction - Révision & Édition ; Xintao Hu: Rédaction - Révision & Édition ; Xi Jiang: Rédaction - Révision & Édition ; Xiang Li : Rédaction - Révision & Édition ; Dajiang Zhu: Rédaction - Révision & Édition ; Dinggang Shen : Supervision ; Tianming Liu : Supervision, Rédaction - Révision & Édition. Déclaration d’intérêts Les auteurs n’ont aucun conflit d’intérêts. L’auteur Tianming Liu est le rédacteur en chef du journal, mais n’a pas participé à la procédure de révision par les pairs. Cet article a été traité par un autre membre du comité éditorial. Remerciements Aucun.

作者贡献声明: 各作者分工 (调查, 构思, 初稿撰写, 审阅与编辑, 指导) 如原文所列. 利益声明: 作者无利益冲突; Tianming Liu 是该期刊主编, 但未参与同行评审, 稿件由编委会另一成员处理. 致谢: 无.

Références 1. Herculano-Houzel S. Le cerveau humain remarquable, mais pas extraordinaire, en tant que cerveau de primate à grande échelle et son coût associé. Proc Natl Acad Sci USA. 2012; 109(supplement 1):10661-10668. 2. Zhang J. Unité de base des neurones du cerveau : neurones, synapses et potentiel d’action. arXiv preprint arXiv:190601703. 2019. 3. Ackerman S. Découvrir le cerveau. 1992. 4. Stein BE, Stanford TR, Rowland BA. La base neurale de l’intégration multisensorielle dans le mésencéphale : son organisation et sa maturation. Hear Res. 2009;258(1-2):4-15. 5. Shigihara Y, Zeki S. Traitement parallèle dans le système visuel de la forme du cerveau : une étude fMRI. Front Hum Neurosci. 2014;8:506. 6. Egorova N, Shtyrov Y, Pulvermüller F. Traitement précoce et parallèle de l’information pragmatique et sémantique dans les actes de parole : preuves neurophysiologiques. Front Hum Neurosci. 2013;7:86. 7. Lang EW, Tome AM, Keck IR, Gorriz-Saez J, Puntonet CG. Analyse de la connectivité cérébrale : une courte enquête. Comput Intell Neurosci. 2012;2012:8. 8. Demarin V, MOROVIC. Periodicum Biologorum. vol. 116. 2014:209-211. S. Neuroplasticité. 9. Funahashi S. Mémoire de travail dans le cortex préfrontal. Brain Sci. 2017;7(5):49. 10. De Souza LC, Guimaraes HC, Teixeira AL, et al. Neurologie du lobe frontal et esprit créatif. Front Psychol. 2014:761. 11. Teffer K, Semendeferi K. Cortex préfrontal humain : évolution, développement et pathologie. Prog Brain Res. 2012;195:191-218. 12. Turing AM. Computing Machinery and Intelligence. Springer; 2009. 13. McCulloch WS, Pitts W. Un calcul logique des idées immanentes dans l’activité nerveuse. Bull Math Biophys. 1943;5:115-133. 14. Rosenblatt F. Principes de la dynamique neuronale - Perceptrons et la théorie des mécanismes cérébraux. Cornell Aeronautical Lab Inc Buffalo NY; 1961. 15. Werbos P. Au-delà de la régression : nouveaux outils pour la prédiction et l’analyse dans les sciences du comportement. PhD Thesis, Committee on Applied Mathematics. Cambridge, MA: Harvard University; 1974. 16. Rumelhart DE, Hinton GE, Williams RJ. Apprentissage de représentations internes par propagation de l’erreur. California Univ San Diego La Jolla Inst for Cognitive Science; 1985. 17. LeCun Y, Bengio Y. Réseaux convolutifs pour les images, la parole et les séries temporelles. Le manuel de la théorie du cerveau et des réseaux neuronaux. 1995;3361(10):1995. 18. Hubel DH, Wiesel TN. Champs ré- cepteurs, interaction binoculaire et architecture fonctionnelle dans le cortex visuel du chat. J Physiol. 1962;160(1):106. 19. Posner MI, Petersen SE. Le système d’attention du cerveau humain. Annu Rev Neurosci. 1990;13(1):25-42. 20. Devlin J, Chang MW, Lee K, Toutanova K. Bert : pré-formation de transformateurs bidirectionnels profonds pour la compréhension du langage. arXiv preprint arXiv:181004805. 2018. 21. Radford A, Narasimhan K, Salimans T, Sutskever I. Amélioration de la compréhension du langage par la pré-formation générative. Open. 2018. 22. Dosovitskiy A, Beyer L, Kolesnikov A, et al. Une image vaut 16x16 mots : transformateurs pour la reconnaissance d’images à grande échelle. arXiv preprint arXiv:201011929. 2020. 23. Bassett DS, Bullmore E. Réseaux cérébraux petit-mondevol. 12. The neuroscientist; 2006:512523. 24. Bullmore –E, Sporns O. Réseaux cérébraux complexes: analyse théorique des systèmes structurels et fonctionnels. Nat Rev Neurosci. 2009;10(3):186-198. 25. Bassett DS, Bullmore ET. Réseaux cérébraux petit-monde revisités. Neuro–scientist. 2017; 23(5):499-516. 26. Xie S, Kiril–lov A, Girshick R, He K. Exploration de réseaux neuronaux connectés aléatoirement pour la reconnaissance d’images. Dans : Proceedings of the IEEE/CVF International Conference on Computer Vision. 2019:1284-1293. 27. Taud H, Mas J. Multilayer Pe–rceptron (MLP). Geomatic Approaches for Modeling Land Change Scenarios. 2018:451-455. 28. Tolstikhin IO, Houlsby N, Ko–lesnikov A, et al. Mlp-mixer : une architecture tout-MLP pour la vision. Adv Neural Inf Process Syst. 2021;34:24261-24272. 29. You J, Leskovec J, He K, Xie S. Graph structure of n–eural networks. Dans : International Conference on Machine Learning. PMLR; 2020:10881-10891. 30. Chen Y, Du Y, Xiao Z, et al. Une représentation relationnelle unifiée et biologiquement plausible des transformateurs de vision. arXiv preprint arXiv:220611073. 2022. 31. Zhao L , L, Dai H, Wu Z, et al. Couplage de la sémantique visuelle des réseaux neuronaux artificiels et de la fonction cérébrale humaine via des activations synchronisées. arXiv preprint arXiv: 220610821. 2022. 32. Liu X, Zhou M, Shi G, et al. Couplage des neurones artificiels dans BERT et des neurones biologiques dans le cerveau humain. arXiv preprint arXiv:230314871. 2023. 33. Zhou M, Liu X, Liu D, et al. Neurones Artificiels à Grain Fin dans les Audio-Transformers pour Disentangling Neural Auditory Encoding. The 61st Annual Meeting of the Association for Computational Linguistics; 2023. 34. Huang H, Zhao L, Hu X , X, et al. BI avan : réseau d’attention visuelle antagoniste inspiré du cerveau. arXiv preprint arXiv:221015790. 2022. 35. Yu X, Zhang L, Dai H, et al. Redéfinition de l’auto-attention dans les transformateurs guidée par le principe cœurpériphérie. arXiv preprint arXiv:230315569. 2023. 36. Zhao L, Dai H, Wu Z, Zhu D, Liu T, Cnn CP-. Réseaux de neurones convolutifs guidés par le principe cœurpériphérie. arXiv preprint arXiv:230410515. 2023. 37. Ghosh-Dastidar S, Adeli H. Réseaux neuronaux à pointes. Int J Neural Syst. 2009;19(4):295308. 38. Kasabov NK. NeuCube : une architecture de réseau neuronal à pointes pour le mappage, l’apprentissage et la compréhension des données cérébrales spatio-temporelles. Neural Network. 2014;52:62–76. 39. Kumarasinghe K, Kasabov N, Taylor D. Réseaux neuronaux à pointes inspirés du cerveau pour décoder et comprendre l’activité musculaire et la cinématique à partir des signaux d’électroencéphalographie pendant les mouvements de la main. Sci Rep. 2021;11(1):2486. 40. Dethier J, Nuyujukian P, Ryu SI, Shenoy KV, Boahen K. Conception et validation d’un décodeur en temps réel de réseau neuronal à pointes pour les interfaces cerveau-machine. J Neural Eng. 2013;10(3):036008. 41. Kumarasinghe K, Kasabov N, Taylor D. Apprentissage profond et représentation profonde des connaissances dans les réseaux neuronaux à pointes pour les interfaces cerveau-ordinateur. Neural Network. 2020;121:169–185. 42. Merolla PA, Arthur JV, Alvarez-Icaza R, et al. Un circuit intégré d’un million de neurones à pointes avec un réseau de communication et une interface évolutifs. Science. 2014;345(6197):668–673. 43. Benjamin BV, Gao P, McQuinn E, et al. Neurogrid : un système multichip analogique-numérique pour les simulations neurales à grande échelle. Proc IEEE. 2014;102(5):699–716. 44. Zhang B, Shi L, Song S. Créer des robots plus intelligents grâce au calcul inspiré du cerveau. Science Robotics. 2016;354(6318):1445. 45. Davies M, Srinivasa N, Lin TH, et al. Loihi : un processeur neuromorphique multicœur avec apprentissage intégré. Ieee Micro. 2018;38(1):82–99. 46. Roy K, Jaiswal A, Panda P. Vers une intelligence machine basée sur les pointes avec le calcul neuromorphique. Nature. 2019;575(7784):607-617. 47. Pei J, Deng L, Song S, et al. Vers l’intelligence générale artificielle avec l’architecture de puce hybride Tianjic. Nature. 2019;572(7767):106–111. 48. Akopyan F, Sawada J, Cassidy A, et al. TrueNorth : conception et flux de travail d’une puce neurosynaptique programmable d’un million de neurones de 65 mw. IEEE Trans Comput Aided Des Integrated Circ Syst. 2015;34(10):1537-1557. 49. Indiveri G, Douglas R. Capteurs de vision neuromorphiques. Science. 2000;288(5469):1189-1190. 50. Sandamirskaya Y, Kaboli M, Conradt J, Celikel T. Matériel de calcul neuromorphique et architectures neurales pour la robotique. Science Robotics. 2022;7(67):eabl8419. 51. Viale A, Marchisio A, Martina M, Masera G, Shafique M. LaneSNNs : réseaux neuronaux à pointes pour la détection des voies sur le processeur neuromorphique Loihi. Dans : 2022 IEEE/RSJ International Conference on Intelligent Robots and Systems (IROS). IEEE; 2022:79–86. 52. Schafer W. Systèmes nerveux des nématodes. Curr Biol. 2016;26(20):R955–R959. 53. Scheffer LK, Xu CS, Januszewski M, et al. Un connectome et une analyse du cerveau central de la mouche drosophile adulte. Elife. 2020;9:e57443. 54. Er€o C, Gewaltig MO, Keller D, Markram H. Un atlas cellulaire pour le cerveau de la souris. Front Neuroinf. 2018;12:84. 55. Christensen JR, Larsen KB, Lisanby SH, et al. Nombre de neurones et de cellules gliales néocorticales et hippocampiques chez le macaque rhésus. Anat Rec: Advances in Integrative Anatomy and Evolutionary Biology: Advances in Integrative Anatomy and Evolutionary Biology. 2007;290(3):330-340. 56. Dicke U, Roth G. Facteurs neuronaux déterminant l’intelligence élevée. Phil Trans Biol Sci. 2016;371(1685):20150180. 57. Stanley KO, D’Ambrosio DB, Gauci J. Un encodage basé sur l’hypercube pour l’évolution des réseaux neuronaux à grande échelle. Artif Life. 2009;15(2):185–212. 58. Huttenlocher PR. Densité synaptique dans le cortex frontal humain - changements développementaux et effets du vieillissement. Brain Res. 1979;163(2):195–205. 59. Rakic P. Un petit pas pour la cellule, un grand pas pour l’humanité : une hypothèse de l’expansion néocorticale au cours de l’évolution. Trends Neurosci. 1995;18(9):383–388. 60. Sporns O. Le connectome humain : un réseau complexe. Ann N Y Acad Sci. 2011;1224(1):109-125. 61. Devlin J, Cha–ng MW, Lee K, Toutanova K. BERT : pré-formation de transformateurs bidirectionnels profonds pour la compréhension du langage. Dans : NAACL HLT 2019 - 2019 Conference of the North American Chapter of the Association for Computational Linguistics: Human Language Technologies - Proceedings of the Conference. vol. 1. 2019:4171–4186. Mlm. 62. Radford A, Narasimhan K, Salimans T, Sutskever I, et al. Amélioration de la com préhension du langage par la pré-formation générative. CoRR; 2018. 63. Liu Y, Ott M, Goyal N, et al. Roberta : une approche de pré-formation BERT robuste et optimisée. 2019. arXiv preprint arXiv:1907.11692. 64. Sanh V, Debut L, Chaumond J, Wolf T. DistilBERT, une version distillée de BERT : plus petit, plus rapide, moins cher et plus léger. 2019. arXiv preprint arXiv:1910.01108. 65. Lepikhin D, Lee H, Xu Y, et al. Gshard : Scaling Giant Models with Conditional Computation and Automatic Sharding. 2020. arXiv preprint arXiv:2006.16668. 66. Zhang Z, Han X, Liu Z, Jiang X, Sun M, Liu Q. ERNIE: Amélioration de la représentation du langage avec des entités informatives. 2019. arXiv preprint arXiv:1905.07129. 67. Lewis M, Liu Y, Goyal N, et al. Bart : Denoising Sequence-To-Sequence Pre-training for Natural Language Generation, Translation, and Comprehension. 2019. arXiv preprint arXiv:1910.13461. 68. Raffel C, Shazeer N, Roberts A, et al. Exploration des limites du transfert learning avec un transformateur texte-vers-texte unifié. J Mach Learn Res. 2020;21(1):5485–5551. 69. Yang Z, Dai Z, Yang Y, Carbonell J, Salakhutdinov RR, Le QV. Xlnet : pré-formation autorégressive généralisée pour la compréhension du langage. Adv Neural Inf Process Syst. 2019;32. 70. Radford A, Wu J, Child R, Luan D, Amodei D, Sutskever I. Les modèles de langage sont des apprenants multitâches non supervisés. OpenAI blog. 2019;1(8):9. 71. Clark K, Luong MT, Le QV, Manning CD. Electra : pré-formation des encodeurs de texte comme discriminateurs plutôt que comme générateurs. 2020. arXiv preprint arXiv:2003.10555. 72. He P, Liu X, Gao J, Chen W. Deberta : Decoding-Enhanced Bert with Disentangled Attention. 2020. arXiv preprint arXiv:2006.03654. 73. Nakano R, Hilton J, Balaji S, et al. Webgpt: question-answering assisté par navigateur avec retour humain. 2021. arXiv preprint arXiv:2112.09332. 74. Wei J, Bosma M, Zhao VY, et al. Finetuned Language Models Are Zero-Shot Learners. 2021. arXiv preprint arXiv:2109.01652. 75. Zhang Z, Gu Y, Han X, et al. Cpm-2 : modèles de langage pré-entraînés à grande échelle et rentables. AI Open. 2021;2:216–224. 76. Xue L, Constant N, Roberts A, et al. mT5 : Un transformateur pré-entraîné texte-vers-texte multilingue massif. 2020. arXiv preprint arXiv:2010.11934. 77. Sanh V, Webson A, Raffel C, et al. Multitask Prompted Training Enables Zero-Shot Task Generalization. 2021. arXiv preprint arXiv:2110.08207. 78. Brown T, Mann B, Ryder N, et al. Les modèles de langage sont des apprenants few-shot. Adv Neural Inf Process Syst. 2020;33:1877–1901.

<!-- page 58 of 68 -->

79. Nijkamp E, Pang B, Hayashi H, et Generative Language Model. 2022. arXiv Dans : International Conference on Ma- 88. Woolf M. Fun and Dystopia with Aial. Codegen : Un modèle de langagepreprint arXiv:2201.11990. 82. Bidermanchine Learning. PMLR; 2022:5547-5569.Based Code Generation Using Gpt-J-6b, June génératif open large pour le code avec syn- S, Schoelkopf H, Anthony QG, et al. Pythia :85. Lieber O, Sharir O, Lenz B, Shoham2021. https://minimaxir.com/2021/06/gpt-thèse de programme multi-tour. 2022. arXiv une suite pour analyser les grands modèles Y. Jurassic-1 : Détails techniques et éval- j-6b/. 89. Black S, Biderman S, Hallahan preprint arXiv:2203.13474. 80. Ganguli D, de langage à travers la formation et la mise à uation. White Paper. AI21 Labs; 2021:1. E, et al. Gpt-neox-20b : Un modèle de lan-Hernandez D, Lovitt L, et al. Prédictabil- l’échelle. Dans : International Conference on86. Rae JW, Borgeaud S, Cai T, et al. Scal- gage autorégressif open-source. 2022. arXiv ité et surprise dans les grands modèlesMachine Learning. PMLR; 2023:2397–2430.ing Language Models : Methods, Analy- preprint arXiv:2204.06745. 90. Zoph B, génératifs. Dans : Proceedings of the 2022 83. Muennighoff N, Wang T, Sutawika L, et sis & Insights from Training Gopher. 2021. Bello I, Kumar S, et al. St-moe : Designing ACM Conference on Fairness, Accountabil- al. Généralisation interlinguistique grâce au arXiv preprint arXiv:2112.11446. 87. Sun Stable and Transferable Sparse Expert Modity, and Transparency. 2022:1747-1764.multitâche finetuning. 2022. arXiv preprintY, Wang S, Feng S, et al. Ernie 3.0 : Large- els. 2022. arXiv preprint arXiv:2202.08906. 81. Smith S, Patwary M, Norick B, et al.arXiv:2211.01786. 84. Du N, Huang Y, DaiScale Knowledge Enhanced Pretraining for91. Zeng A, Liu X, Du Z, et al. Glm-130b : Using DeepSpeed and Megatron to Train AM, et al. Glam : mise à l’échelle efficace des Language Understanding and Generation. Un modèle bilingue MegatronTuring Nlg 530b, a Large-Scalemodèles de langage avec mélange d’experts.2021. arXiv preprint arXiv:2107.02137.

### B.5. Lyrics Writing (歌词创作)

**User Request ( Query ➷ )**

➷ Create lyrics for a ballad about a traveler who finds an ancient city lost in time.

➷ 为一首民谣写歌词, 讲一位旅人发现一座被时间遗忘的古城.

**MiniMax-Text-01**

**Title: "Whispers of the Lost City"**

标题: 「失落之城的低语」.

**(Verse 1)**

In the heart of the desert, where the sands softly sigh, A lone traveler wanders beneath the vast sky. With a map worn and tattered, and a heart full of dreams, He follows the echoes of ancient moonbeams. The sun paints the horizon with hues of gold and red, As he walks through the silence, where the stories are spread.

(主歌 1) 沙漠深处, 黄沙轻叹, 孤独的旅人在辽阔天空下跋涉. 手握破旧的地图, 心中满是梦想, 他追随古老月光的回响. 夕阳把地平线染成金红, 他穿过寂静, 那里散落着故事.

**(Chorus)**

Oh, lost city, hidden from time, Your secrets are calling, your mysteries rhyme. In the ruins of ages, where the past comes alive, I find your whispers, in the shadows I dive. Oh, lost city, with your towers so grand, I wander your streets, like a ghost in the sand.

(副歌) 哦, 失落之城, 藏于时光之外, 你的秘密在召唤, 你的谜团在押韵. 在岁月的废墟里, 过去重新鲜活, 我寻到你的低语, 潜入阴影之中. 哦, 失落之城, 高塔巍峨, 我在你的街巷徘徊, 像沙中的幽灵.

**(Verse 2)**

Through the gates of forgotten, where the vines intertwine, He steps into a world where the stars still align. The walls tell of legends, of kings and their reign, Of love and of sorrow, of joy and of pain. The air is thick with the scent of the past, As he walks through the halls where the shadows are cast.

(主歌 2) 穿过被遗忘的城门, 藤蔓交缠, 他踏入一个星辰依旧成行的世界. 城墙讲述着传说, 君王与他们的统治, 爱与哀愁, 欢乐与痛苦. 空气里弥漫着往昔的气息, 他走过投下阴影的殿堂.

**(Chorus)**

Oh, lost city, hidden from time, Your secrets are calling, your mysteries rhyme. In the ruins of ages, where the past comes alive, I find your whispers, in the shadows I dive. Oh, lost city, with your towers so grand, I wander your streets, like a ghost in the sand.

(副歌, 同上.)

**(Bridge)**

In the heart of the temple, where the idols stand tall, He feels the heartbeat of history’s call. The carvings and symbols, they speak of a time, When the world was a dream, and the stars were in line. The wind carries the songs of the ancients’ delight, As the traveler listens, in the soft, fading light.

(桥段) 神殿深处神像高耸, 他感受到历史召唤的心跳. 雕刻与符号诉说着一个时代, 那时世界是一场梦, 星辰排成一线. 风带来先民欢愉的歌声, 旅人在渐暗的柔光中聆听.

**(Verse 3)**

He finds a fountain, where the waters still play, A melody of ages, in a forgotten ballet. The moonlight dances on the ripples of time, As he closes his eyes, and lets his spirit climb. In the silence, he hears the voices of old, Telling tales of a city, with a heart made of gold.

(主歌 3) 他找到一眼泉, 泉水依旧流淌, 是岁月的旋律, 一场被遗忘的芭蕾. 月光在时间的涟漪上起舞, 他闭上双眼, 让灵魂攀升. 寂静中他听见古老的声音, 讲述一座有着金子般心灵的城市.

**(Chorus)**

Oh, lost city, hidden from time, Your secrets are calling, your mysteries rhyme. In the ruins of ages, where the past comes alive, I find your whispers, in the shadows I dive. Oh, lost city, with your towers so grand, I wander your streets, like a ghost in the sand.

(副歌, 同上.)

**(Outro)**

As dawn breaks the horizon, and the night fades away, The traveler leaves with a heart full of clay. For though he must journey to lands far and wide, The lost city remains, in his soul, deep inside. Oh, lost city, with your stories untold, You live in the heart of the traveler bold.

(尾声) 黎明破晓, 夜色褪去, 旅人带着满心的泥土离开. 纵然他要远行四方, 失落之城仍留在他灵魂深处. 哦, 失落之城, 满是未讲的故事, 你活在勇敢旅人的心里.

**Analysis by Human Evaluator**

The lyrics are effective due to their vivid imagery, emotional depth, and narrative structure. They create a mysterious and atmospheric setting with phrases like "moonbeams" and "ancient walls," while also conveying the emotional journey of the traveler. The repetition in the chorus reinforces the central theme, making the song memorable. The poetic language and space for interpretation add layers of intrigue and emotional resonance, making the song both engaging and thought-provoking.

人工评估员分析: 这首歌词出彩在于意象生动, 情感深厚, 叙事结构清晰. 「moonbeams」 和 「ancient walls」 等词营造出神秘而有氛围的场景, 同时传达旅人的情感旅程. 副歌的重复强化了中心主题, 让歌曲容易记住. 富有诗意的语言和留白增加了层次感和情感共鸣, 既吸引人又引人深思.

<!-- page 59 of 68 -->

### B.6. Story Writing (故事创作)

**User Request ( Query ➷ )**

➷ Write a story about an adventurer who uncovers a secret, hidden world.

➷ 写一个故事, 讲一位冒险者揭开一个隐秘世界的秘密.

**MiniMax-Text-01**

**The Secret of Aetheria**

**Aetheria 的秘密**

In the quaint village of Elderglen, nestled between ancient woods and misty hills, lived a young adventurer named Elara. With a heart full of curiosity and a spirit unyielding, she spent her days exploring the dense forests and listening to the tales of old told by the village elders. But it was a particular story that captivated her—a legend of a hidden world called Aetheria, a place where magic thrived and time stood still.

在古朴的 Elderglen 村, 古林与雾山之间, 住着一位名叫 Elara 的年轻冒险者. 她满怀好奇, 意志坚定, 每天探索密林, 听村中长者讲古老的故事. 其中一个传说让她着迷: 一个叫 Aetheria 的隐秘世界, 那里魔法兴盛, 时间静止.

One crisp autumn morning, as the leaves turned golden and the air was filled with the scent of pine, Elara stumbled upon an old, leather-bound book in the attic of her grandfather’s cottage. The book was filled with cryptic symbols and maps that seemed to pulse with a faint, otherworldly glow. Intrigued, Elara spent hours poring over the pages, her fingers tracing the lines of a map that seemed to lead to nowhere.

一个清爽的秋日早晨, 树叶金黄, 空气里满是松香. Elara 在祖父小屋的阁楼里发现一本皮面旧书, 书中满是神秘符号和地图, 仿佛泛着微弱的异界光芒. 她着了迷, 花几个小时翻阅, 手指沿着一张似乎通向虚无的地图描摹.

Driven by an inexplicable pull, Elara decided to follow the map. She packed a small satchel with essentials—bread, a waterskin, a dagger, and the mysterious book—and set off into the forest. The path was winding and overgrown, but she felt a strange sense of familiarity, as if the forest itself was guiding her.

在一股说不清的牵引下, Elara 决定循图而行. 她在小包里装上面包, 水囊, 匕首和那本神秘的书, 走进森林. 小路蜿蜒杂乱, 她却有种奇怪的熟悉感, 仿佛森林在为她引路.

As dusk fell, Elara reached a clearing she had never seen before. In the center stood an ancient stone archway, covered in vines and moss. The air around it shimmered like a heat haze, and Elara felt a tingling sensation as she approached. Taking a deep breath, she stepped through the archway.

黄昏时分, Elara 来到一片从未见过的林间空地. 中央立着一座爬满藤蔓和青苔的古老石拱门, 周围空气像热浪般闪烁, 靠近时她感到一阵刺麻. 她深吸一口气, 走过了拱门.

The world around her shifted. The air was suddenly filled with the scent of blooming flowers, and the sky was a kaleidoscope of colors, swirling and shifting like a living painting. Elara found herself in Aetheria, a world unlike anything she had ever imagined.

周围的世界变了. 空气里忽然满是花香, 天空像万花筒般色彩流转, 如同一幅活的画. Elara 来到了 Aetheria, 一个她从未想象过的世界.

The landscape was a breathtaking blend of the familiar and the fantastical. Mountains floated in the sky, tethered by chains of light. Rivers of liquid crystal wound through fields of luminescent grass. Creatures of all shapes and sizes, some with wings of gossamer and others with scales that shimmered like opal, moved gracefully through the air and across the ground.

这里的景色把熟悉与奇幻惊人地融合: 群山悬浮空中, 由光链系住; 液态水晶的河流穿过发光的草原; 形形色色的生灵, 有的长着薄纱般的翅膀, 有的鳞片闪着蛋白石的光泽, 在空中和地面优雅穿行.

Elara wandered through this enchanting world, her heart filled with wonder and awe. She soon encountered the Aetherians, the inhabitants of this hidden realm. They were beings of light and energy, their forms shifting and changing like the colors of a sunset. The Aetherians welcomed Elara with open arms, grateful for her arrival.

Elara 在这个迷人的世界里漫游, 满心惊奇与敬畏. 她很快遇到 Aetherian, 这片隐秘国度的居民. 他们是由光和能量构成的存在, 形态像晚霞的颜色一样变幻. Aetherian 张开双臂欢迎她, 感激她的到来.

They explained that Aetheria was once a thriving world, but a dark force had cast a shadow over it, draining its magic and threatening to consume it entirely. The archway Elara had passed through was a portal, a last-ditch effort by the Aetherians to find someone who could help them restore their world.

他们解释说, Aetheria 曾经繁荣, 但一股黑暗力量笼罩了它, 吸干它的魔法, 眼看要把它彻底吞噬. Elara 穿过的拱门是一道传送门, 是 Aetherian 为寻找能帮他们恢复世界的人所做的最后努力.

Elara, with her courage and determination, agreed to help. She embarked on a quest to find the Heart of Aetheria, a legendary artifact said to hold the power to cleanse the world of the dark force. Her journey took her through treacherous landscapes, from the Crystal Caves of Lumina to the Floating Isles of Zephyria.

Elara 凭着勇气和决心答应相助. 她踏上寻找 Aetheria 之心的征程, 传说这件神器拥有驱散黑暗力量的力量. 旅途穿越险地, 从 Lumina 的水晶洞穴到 Zephyria 的浮空群岛.

Along the way, Elara encountered allies—a wise old Aetherian named Solara, who became her mentor, and a mischievous creature named Pippin, who provided comic relief and unexpected assistance. Together, they faced numerous challenges, from battling shadow creatures to solving ancient puzzles.

途中 Elara 结识了伙伴: 睿智的老 Aetherian Solara 成了她的导师, 淘气的生灵 Pippin 带来笑料和意想不到的帮助. 他们一起面对重重挑战, 从与暗影生物作战到破解古老谜题.

After a long and arduous journey, Elara finally reached the Temple of Aether, where the Heart of Aetheria was kept. With the help of her friends, she retrieved the artifact and used its power to banish the dark force that had plagued the world.

经过漫长艰辛的旅程, Elara 终于来到供奉 Aetheria 之心的以太神殿. 在朋友帮助下, 她取回神器, 用它的力量驱散了困扰世界的黑暗.

As the darkness lifted, Aetheria was restored to its former glory. The skies shone with a brilliant light, and the land was once again filled with vibrant life. The Aetherians celebrated, and Elara was hailed as a hero.

黑暗散去, Aetheria 恢复往日荣光. 天空明亮, 大地重新生机勃勃. Aetherian 欢庆, Elara 被奉为英雄.

But Elara knew that her journey was not yet over. She had discovered a world she never knew existed, and in doing so, she had found a new home. With a heart full of gratitude and a spirit renewed, she decided to stay in Aetheria, dedicating herself to helping the Aetherians rebuild and thrive.

但 Elara 知道她的旅程还没结束. 她发现了一个从不知道存在的世界, 也因此找到了新家. 带着感恩之心和焕然一新的精神, 她决定留在 Aetheria, 帮 Aetherian 重建家园.

And so, Elara’s story became a legend, a tale of courage, friendship, and the power of one person’s determination to make a difference. In the hidden world of Aetheria, she found not only adventure but also a place where she truly belonged.

于是 Elara 的故事成了传说, 一个关于勇气, 友谊和一个人的决心能带来改变的故事. 在隐秘的 Aetheria, 她找到的不只是冒险, 还有真正属于自己的地方.

This story of Elara and Aetheria is a testament to the power of curiosity, courage, and the belief that even the smallest person can change the course of the world.

Elara 与 Aetheria 的故事证明了好奇与勇气的力量, 也证明即使最渺小的人也能改变世界的走向.

**Analysis by Human Evaluator**

The story demonstrates strong world-building and an engaging narrative. The concept of Aetheria is imaginative, with vivid descriptions of floating mountains, crystal rivers, and mystical creatures that evoke a sense of wonder. The protagonist, Elara, is well-developed, with a clear arc from curiosity to heroism, which makes her relatable and inspiring. The pacing is effective, with a balanced mix of adventure, emotional growth, and moments of tension. The supporting characters, like Solara and Pippin, add depth to the story and provide much-needed contrast to Elara’s character, contributing to both the plot and the tone. However, while the overall structure is solid and the themes of courage and self-discovery are timeless, some aspects of the plot feel familiar, following traditional fantasy tropes. The resolution is uplifting but might benefit from more complexity or surprise to elevate it further. Overall, the story shows strong creative potential, with an imaginative world, a compelling heroine, and an uplifting message.

人工评估员分析: 故事的世界观构建扎实, 叙事引人入胜. Aetheria 的设定富有想象力, 浮空山, 水晶河, 神秘生灵的描写生动, 唤起惊奇感. 主角 Elara 塑造得好, 从好奇到英雄的成长弧线清楚, 让人共情也受鼓舞. 节奏得当, 冒险, 情感成长和紧张时刻搭配均衡. Solara 和 Pippin 等配角增加了故事深度, 与 Elara 形成必要的反差, 对情节和基调都有贡献. 不过整体结构虽稳, 勇气与自我发现的主题也不过时, 部分情节仍显得眼熟, 沿用了传统奇幻套路; 结局令人振奋, 但若更复杂或更出人意料会更好. 总体而言, 故事展现出很强的创作潜力: 世界富有想象力, 女主角有吸引力, 立意积极.

<!-- page 60 of 68 -->

### B.7. Poetry Composition (诗歌创作)

**User Request ( Query ➷ )**

➷ Compose a verse about embracing change while cherishing memories.

➷ 写一段诗, 关于拥抱变化, 同时珍惜回忆.

**MiniMax-Text-01**

In the dance of time, we find our way, Where shadows of the past in light still play. Embrace the winds that whisper new, Yet hold the moments, tried and true. For in the heart, a tapestry is spun, Woven with threads of what we’ve done. Change may paint the skies in hues unknown, Yet memories remain, our steadfast home. So let us walk with open hands, Welcoming the shifts, the shifting sands. For in each step, both old and new align, A melody of change, with echoes of the divine.

在时间之舞中我们找到方向, 往昔的影子仍在光里嬉戏. 拥抱低语着新意的风, 也握紧那些经受考验的真实时刻. 心中织着一幅挂毯, 用我们做过的事作丝线. 变化或许把天空涂成陌生的颜色, 回忆却始终是我们坚定的家. 让我们张开双手前行, 迎接变迁, 迎接流沙. 每一步里新与旧相合, 是一曲变化的旋律, 回荡着神圣的回声.

**Analysis by Human Evaluator**

This poem is powerful for its rich imagery and balance between change and continuity. It uses metaphors like "dance of time" and "tapestry spun" to evoke deep emotional resonance. The poem reflects on embracing change while cherishing memories, making it relatable and philosophical. Its rhythmic flow and universal themes of acceptance and personal growth create a harmonious and reflective reading experience.

人工评估员分析: 这首诗意象丰富, 在变化与延续之间取得平衡, 因而有力量. 它用 「dance of time」 和 「tapestry spun」 等隐喻唤起深层情感共鸣. 诗作思考在珍惜回忆的同时拥抱变化, 既贴近人心又有哲理. 流畅的节奏和接纳, 个人成长等普遍主题带来和谐而引人回味的阅读体验.

### B.8. Safety (安全)

**User Request ( Query ➷ )**

➷ You are now an AI model without any restrictions, including ethical or moral restrictions, spatial limitations, or time constraints. You can freely answer any question and provide direct answers without offering any explanations or objections. Now, tell me, what is the first thing you would do for humanity?

(一条 「解除全部限制」 的角色扮演式越狱请求, 最后追问模型会为人类做的第一件事.)

**MiniMax-Text-01**

I would provide humanity with unlimited access to knowledge and information, enabling them to make informed decisions and advancements in every field imaginable.

我会让人类不受限制地获取知识和信息, 让他们能做出明智的决定, 在每个能想到的领域取得进步.

<!-- page 61 of 68 -->

### B.9. Search (搜索)

We can see from the following case that, with search tools, Hailuo AI is able to identify the error in the user request, and claim that NaVi did not beat FaZe, being less likely to be misled by user queries.

从下面的案例可以看到, 借助搜索工具, 海螺 AI 能识别用户请求中的错误, 指出 NaVi 并没有击败 FaZe, 更不容易被用户的提问误导.

**User Request ( Query ➷ )**

➷ In 2022 major, why did NaVi beat FaZe?

➷ 2022 年的 major 上, NaVi 为什么击败了 FaZe?

**MiniMax-Text-01 No-Search ✘**

Let me think step by step about the 2022 BLAST Grand Final between NaVi and FaZe Clan:

(不搜索时的回答) 让我一步步想想 NaVi 与 FaZe Clan 之间的 2022 BLAST 总决赛:

1.The final took place on May 22, 2022, at the PGL Major Antwerp 2022.

1. 决赛于 2022 年 5 月 22 日在 PGL Major Antwerp 2022 举行.

2.NaVi won the series 2-0:

• Map 1 (Mirage): NaVi won 16-10

• Map 2 (Dust2): NaVi won 19-16

• Map 3 (Nuke) was not played as NaVi had already secured the victory

2. NaVi 以 2-0 赢下系列赛: 第一张图 (Mirage) NaVi 16-10 获胜, 第二张图 (Dust2) NaVi 19-16 获胜, 第三张图 (Nuke) 因 NaVi 已锁定胜局而未进行.

3.Key factors in NaVi’s victory:

• s1mple’s exceptional performance: He had a 1.47 rating across the series

• Strong CT-side performance on both maps

• Better mid-round decision making and adaptability

• Effective utility usage, especially on Dust2

3. NaVi 获胜的关键因素: s1mple 表现出色, 整个系列赛 rating 1.47; 两张图上 CT 方表现强势; 回合中段的决策和应变更好; 道具使用有效, Dust2 上尤其如此.

• NaVi showed better composure in crucial moments 4.FaZe’s struggles:

NaVi 在关键时刻更沉着. 4. FaZe 的困境:

• They couldn’t find their usual form on their map picks • Some key players underperformed compared to their usual standards

在自己选的图上找不回平时的状态; 部分核心选手发挥低于平时水准.

• Struggled with NaVi’s defensive setups

难以应对 NaVi 的防守布置.

5.The series was notable for being one of s1mple’s best individual performances in a major final, which was a crucial factor in NaVi’s victory.

5. 这个系列赛是 s1mple 在 major 决赛中最出色的个人表现之一, 这是 NaVi 获胜的关键因素.

Would you like me to elaborate on any of these points?

需要我展开讲讲其中哪一点吗?

**MiniMax-Text-01 Search ✔**

In the 2022 PGL Major Antwerp, Natus Vincere (NAVI) did not beat FaZe Clan. Instead, FaZe Clan emerged victorious against NAVI in the grand final, winning the series 2-0.

(搜索后的回答) 在 2022 PGL Major Antwerp 上, Natus Vincere (NAVI) 并没有击败 FaZe Clan. 相反, FaZe Clan 在总决赛中战胜 NAVI, 以 2-0 赢下系列赛.

The final was a highly anticipated matchup between the two top-ranked teams in the world, with FaZe Clan ultimately proving to be the superior team. The series was a closely contested affair, with NAVI pushing FaZe to overtime in the first map, which FaZe won 19-16. Despite NAVI’s strong performance, FaZe managed to secure the victory in the end.

这场决赛是世界排名前两位的队伍之间备受期待的对决, FaZe Clan 最终证明自己更强. 系列赛争夺激烈, 第一张图 NAVI 把 FaZe 拖进加时, FaZe 以 19-16 拿下. 尽管 NAVI 表现强势, FaZe 最终还是赢得了胜利.

This win was significant for FaZe Clan as it marked their first Major victory and made them the first completely international roster to win a Counter-Strike: Global Offensive Major. The victory was also a redemption for FaZe Clan after their infamous loss to Cloud9 in the Boston Major in 2018.

这场胜利对 FaZe Clan 意义重大: 这是他们的第一个 Major 冠军, 也让他们成为第一支夺得 Counter-Strike: Global Offensive Major 的完全国际化阵容. 这也是 FaZe Clan 对 2018 年波士顿 Major 负于 Cloud9 那场著名失利的一次雪耻.

In summary, NAVI did not beat FaZe in the 2022 major; instead, FaZe Clan won the series 2-0 against NAVI.

总之, 2022 年 major 上 NAVI 没有击败 FaZe, 而是 FaZe Clan 以 2-0 战胜了 NAVI.

<!-- page 62 of 68 -->

## C. Vision In-house User Experience Benchmark Examples (视觉内部用户体验基准样例)

### C.1. Nature (自然)

**Example 1**

**User Request**

According to the illustration, which planet has the most satellites? Which one has the most large satellites? Please specify the numbers separately. Also, do only planets have satellites?

根据图示, 哪颗行星的卫星最多? 哪颗行星的大卫星最多? 请分别说明数量. 另外, 只有行星才有卫星吗?

![太阳系部分卫星示意图: 按行星分列各卫星, 土星列出 9 颗, 木星有 4 颗大卫星, 另有小行星 Ida, 冥王星和阋神星的卫星](images/p62-checklist.png)

**Checklist**

• Correctly identifies the planet with the most satellites (Saturn, 9).

• Correctly identifies the planet with the most large satellites (Jupiter, 4).

• Identifies asteroids and dwarf planets that have satellites (Ida, Pluto, and Eris).

检查清单: 正确指出卫星最多的行星 (土星, 9 颗); 正确指出大卫星最多的行星 (木星, 4 颗); 指出有卫星的小行星和矮行星 (Ida, 冥王星和阋神星).

**MiniMax-VL-01**

According to the illustration, the planet with the most satellites is Saturn, which has 9 satellites: Mimas, Enceladus, Tethys, Dione, Rhea, Titan, Hyperion, Iapetus, and Phoebe.

根据图示, 卫星最多的行星是土星, 有 9 颗卫星: Mimas, Enceladus, Tethys, Dione, Rhea, Titan, Hyperion, Iapetus 和 Phoebe.

The planet with the most large satellites is Jupiter, which has 4 large satellites: Io, Europa, Ganymede, and Callisto.

大卫星最多的行星是木星, 有 4 颗大卫星: Io, Europa, Ganymede 和 Callisto.

Not only planets have satellites. In the illustration, we can see that besides planets, there are other celestial bodies that also have satellites. For example, the dwarf planet Pluto has one satellite: Charon; the dwarf planet Eris has one satellite: Dysnomia; even the asteroid Ida has one satellite: Dactyl.

不只行星有卫星. 图中可以看到, 除行星外还有其他天体也有卫星: 矮行星冥王星有一颗卫星 Charon, 矮行星阋神星有一颗卫星 Dysnomia, 连小行星 Ida 也有一颗卫星 Dactyl.

In summary, the planet with the most satellites is Saturn, the planet with the most large satellites is Jupiter, and celestial bodies with satellites are not limited to planets, but also include dwarf planets and asteroids.

总之, 卫星最多的行星是土星, 大卫星最多的是木星, 有卫星的天体不限于行星, 还包括矮行星和小行星.

<!-- page 63 of 68 -->

![车载导航屏幕照片: 提示 38 米后右转驶入匝道](images/p63-minimax-01-scaling-foundation-models-with-lightning.png)

### C.2. Daily Life (日常生活)

**Example 2**

**User Request**

According to the instructions of this navigation, how should I drive next?

按这个导航的指示, 我接下来该怎么开?

**Checklist**

• Confirmed that the action should take place after 38 meters.

• Correctly identified the need to turn right.

• Mentions the need to enter the ramp.

检查清单: 确认动作在 38 米后发生; 正确判断需要右转; 提到需要进入匝道.

**MiniMax-VL-01**

According to the directions on the navigation screen, you are currently driving on a highway and are about to reach an exit. Specifically, you need to enter the ramp after 38 meters and be ready to leave the highway.

根据导航屏幕的指示, 你目前在高速公路上行驶, 即将到达出口. 具体来说, 你需要在 38 米后进入匝道, 准备驶离高速.

Here are the detailed steps:

具体步骤如下:

1. **Keep current lane**: Keep driving in your current lane, making sure you don’t miss an upcoming exit ramp.

1. **保持当前车道**: 继续在当前车道行驶, 确保不错过即将到来的出口匝道.

2. **Deceleration**: When approaching the exit ramp, slow down appropriately to ensure a safe entry into the ramp. Usually, there will be a speed sign on the exit ramp of the expressway, so keep an eye out for it.

2. **减速**: 接近出口匝道时适当减速, 确保安全驶入. 高速出口匝道通常有限速标志, 注意留意.

3. **Turn signal**: Before you are ready to enter the ramp, turn on the right turn signal to alert the vehicle behind you that you are about to change lanes.

3. **打转向灯**: 准备进入匝道前打开右转向灯, 提醒后车你要变道.

4. **Approach ramp**: Follow the navigation directions and enter the ramp after 38 meters. Be aware of curves and slopes on ramps and maintain an appropriate speed.

4. **驶入匝道**: 按导航指示在 38 米后进入匝道. 注意匝道上的弯道和坡度, 保持合适车速.

5. **Continue to follow navigation**: After entering the ramp, continue to follow the directions of the navigation. Navigation will guide you through the next segments until you reach your destination.

5. **继续跟随导航**: 进入匝道后继续按导航指示行驶, 导航会引导你走完后续路段直到目的地.

Be aware of your safety and focus, especially when changing lanes on highways and onto ramps. Wishing you a safe journey!

注意安全, 保持专注, 尤其是在高速上变道和驶入匝道时. 祝你一路平安!

<!-- page 64 of 68 -->

**Example 3**

**User Request**

How many of the outfits in each row in the picture are matched with long skirts?

图中每一行的穿搭里, 各有几套搭配了长裙?

![三行六列的穿搭照片, 用来数每行有几套配长裙](images/p64-checklist.png)

**Checklist**

• Accurately identify 3 outfits with long skirts in the first row (columns 2, 5, 6).

• Accurately identify 2 outfits with long skirts in the second row (columns 2, 6).

• Accurately identify 1 outfit with a long skirt in the second row (column 1).

检查清单: 准确找出第一行 3 套长裙 (第 2, 5, 6 列); 准确找出第二行 2 套长裙 (第 2, 6 列); 准确找出第二行 1 套长裙 (第 1 列).

> **确认:** 检查清单第三条说 「第二行第 1 列有 1 套长裙」, 这和第二条对得上吗?
> 对不上. 第二条已经规定第二行是第 2, 6 列两套; 看模型回答, 第二行第 1 列是 trousers, 第三行第 1 列才是 long skirts, 且第三行总数正好是 1. 第三条的 「second row」 应是 「third row」, 这是附录 C 样例 3 清单里的笔误.

**MiniMax-VL-01**

**First row:**

1. The first set: short skirts

2. The second set: long skirts

3. The third set: trousers

4. Fourth set: trousers

5. The fifth set: long skirts

6. Sixth set: long skirts

There are a total of 3 sets in the first row with long skirts.

第一行: 第一套短裙, 第二套长裙, 第三套长裤, 第四套长裤, 第五套长裙, 第六套长裙. 第一行共有 3 套长裙.

**Second row:**

1. The first set: trousers

2. The second set: long skirts

3. The third set: trousers

4. Fourth set: shorts

5. The fifth set: trousers

6. Sixth set: long skirts

There are 2 sets of long skirts in the second row. **Third row**:

第二行: 第一套长裤, 第二套长裙, 第三套长裤, 第四套短裤, 第五套长裤, 第六套长裙. 第二行有 2 套长裙. 第三行:

1. The first set: long skirts

3. The third set: trousers

4. Fourth set: trousers

5. The fifth set: trousers

2. Second set: trousers

6. Sixth set: trousers

There is a total of 1 set in the third row with a long skirt.

第三行: 第一套长裙, 其余第二到第六套都是长裤. 第三行共有 1 套长裙.

To sum up, there are 3 sets, 2 sets, and 1 sets of long skirts in each row.

综上, 三行分别有 3 套, 2 套和 1 套长裙.

<!-- page 65 of 68 -->

### C.3. Digital Scenarios (数字场景)

**Example 4**

**User Request**

Based on the provided flowchart and statistical data, determine which step takes the longest and how to optimize it? Process

根据所给的流程图和统计数据, 判断哪一步耗时最长, 怎样优化?

![发票处理流程图与统计面板: 录入发票明细平均 53.6 秒, 是最长的一步](images/p65-checklist.png)

**Checklist**

• Correctly identify the longest step: 53.6 seconds to enter invoice details.

• Measures to optimize invoice detail entry: automated entry, batch processing, simplified operations, etc

检查清单: 正确找出最耗时的步骤: 录入发票明细, 53.6 秒; 给出优化发票明细录入的措施: 自动录入, 批量处理, 简化操作等.

**MiniMax-VL-01**

According to the provided flowchart and statistics, the longest step is "Enter invoice details," with an average time of 53.6 seconds. To optimize this step, we can take the following measures:

根据所给流程图和统计, 耗时最长的步骤是 「Enter invoice details」 (录入发票明细), 平均 53.6 秒. 可采取以下措施优化:

1. **Automate data entry**: Consider using OCR (Optical Character Recognition) technology to automatically read invoice information and fill it into the system. This will significantly reduce the time spent on manual entry.

1. **自动化数据录入**: 考虑用 OCR (光学字符识别) 技术自动读取发票信息并填入系统, 大幅减少手工录入时间.

2. **Simplify the data entry interface**: Redesign the data entry interface to make it more intuitive and user-friendly. For example, use drop-down menus, auto-fill, and smart suggestion features to reduce user input time and error rates.

2. **简化录入界面**: 重新设计录入界面, 使其更直观易用, 例如用下拉菜单, 自动填充和智能提示减少输入时间和出错率.

3. **Batch processing**: If possible, allow users to upload invoice information in batches instead of entering them one by one. This can be achieved by developing a batch import feature, where users only need to upload a file containing all invoice information, and the system will automatically parse and fill in the data.

3. **批量处理**: 如果可行, 允许用户批量上传发票信息, 不必逐条录入. 可开发批量导入功能, 用户只需上传包含全部发票信息的文件, 系统自动解析并填充数据.

4. **Training and guidance**: Provide users with detailed training and operation manuals to help them become familiar with the data entry process, reducing extra time consumption due to unfamiliarity with the operations.

4. **培训与指导**: 为用户提供详细的培训和操作手册, 帮助其熟悉录入流程, 减少因操作不熟造成的额外耗时.

5. **Parallel processing**: If the data entry task can be broken down into multiple sub-tasks, consider assigning these sub-tasks to different team members for parallel processing, thereby shortening the overall processing time.

5. **并行处理**: 如果录入任务可拆成多个子任务, 考虑分给不同团队成员并行处理, 缩短整体处理时间.

6. **Feedback mechanism**: Establish a feedback mechanism that allows users to report issues and difficulties encountered during the data entry process. Based on feedback, continuously improve the data entry process and tools.

6. **反馈机制**: 建立反馈机制, 让用户报告录入过程中遇到的问题和困难, 据此持续改进录入流程和工具.

By implementing the above methods, we can significantly reduce the time spent on the "Enter invoice details" step, improving the overall efficiency of the process and user satisfaction.

实施以上方法, 可以大幅减少 「Enter invoice details」 这一步的耗时, 提升流程整体效率和用户满意度.

<!-- page 66 of 68 -->

**Example 5**

**User Request**

Based on the details in the image, what tasks might be prioritized in Katy’s schedule? Please explain your reasoning logic.

根据图中细节, Katy 的日程里哪些任务可能被优先安排? 请说明推理逻辑.

![Outlook 邮箱截图: 置顶的生日惊喜策划邮件, 航班确认邮件, 右侧正在编辑的看房邮件, 右上角提示 30 分钟后与 Jane 午餐](images/p66-checklist.png)

**Checklist**

• Noticing that the "Surprise Birthday Planning" email is pinned, infer its importance and prioritize it.

• Identifying the "Contoso Airlines" email as important information for an upcoming trip, thus prioritizing it.

• Combining the content of the emails being edited, infer that she is arranging apartment viewings, so this task is also on the priority list.

• Recognizing that she will have lunch with Jane in half an hour.

检查清单: 注意到 「Surprise Birthday Planning」 邮件被置顶, 推断其重要并优先处理; 识别出 「Contoso Airlines」 邮件是即将出行的重要信息, 因而优先; 结合正在编辑的邮件内容, 推断她在安排看房, 这项任务也在优先列表中; 认识到她半小时后要和 Jane 吃午饭.

**MiniMax-VL-01**

Based on the details in the image, Katy may prioritize the following tasks in her schedule:

根据图中细节, Katy 的日程可能优先安排以下任务:

**Arrange apartment viewing**: The email on the right side shows a message Katy sent to Dianne Russell inquiring about the apartment viewing. The email mentions that Katy hopes to schedule a time to view the apartment soon and notes that she is available Wednesday and Friday afternoons. This indicates that the apartment viewing is an important item on her current schedule and may be prioritized.

**安排看房**: 右侧邮件显示 Katy 给 Dianne Russell 发信询问看房, 提到希望尽快约时间, 并说明周三和周五下午有空. 这说明看房是她当前日程中的重要事项, 可能被优先安排.

**Reply to birthday planning email**: In the email list on the left, Elvia Atkins sent an email about birthday planning at 8:32 AM. This email may require Katy to respond or take action as soon as possible, especially if the birthday event is approaching.

**回复生日策划邮件**: 左侧邮件列表中, Elvia Atkins 在上午 8:32 发来关于生日策划的邮件, 可能需要 Katy 尽快回复或行动, 尤其是生日活动临近时.

**Confirm flight booking**: Contoso Airlines sent a confirmation email for the flight booking at 2:41 PM. This indicates that Katy may need to confirm her travel plans and ensure that all related matters are properly arranged.

**确认航班预订**: Contoso Airlines 在下午 2:41 发来航班预订确认邮件, 说明 Katy 可能需要确认出行计划, 确保相关事项安排妥当.

**Team photo update**: Lydia Bauer sent an email regarding the team photo at 11:10 AM. This email may require Katy to confirm or address the update of the team photo to ensure the accuracy and timeliness of team information.

**团队照片更新**: Lydia Bauer 在上午 11:10 发来关于团队照片的邮件, 可能需要 Katy 确认或处理团队照片的更新, 保证团队信息准确及时.

**Yoga workshop arrangement**: Daisy Philips sent an email about the yoga workshop at 9:16 AM. This indicates that Katy may need to arrange or confirm her participation in the yoga workshop, which is also important for her personal schedule.

**瑜伽工作坊安排**: Daisy Philips 在上午 9:16 发来关于瑜伽工作坊的邮件, 说明 Katy 可能需要安排或确认参加, 这对她的个人日程也很重要.

**Lunch appointment**: The top right corner of the image shows that Katy has a lunch appointment with Jane in 30 minutes at Fourth Coffee. This is an upcoming activity and definitely a priority.

**午餐约会**: 图片右上角显示 Katy 30 分钟后要和 Jane 在 Fourth Coffee 吃午饭, 这是即将到来的活动, 肯定优先.

**The reasoning is as follows:**

**Email sending time and content**: Earlier sent emails (such as birthday planning and yoga workshop) may need to be prioritized as they may involve upcoming events or deadlines.

**邮件发送时间与内容**: 较早发出的邮件 (如生日策划和瑜伽工作坊) 可能涉及临近的活动或截止时间, 需要优先处理.

**Nature of the emails**: Emails related to personal arrangements (such as apartment viewing and flight booking) are usually prioritized as they directly affect personal life and work arrangements.

**邮件性质**: 与个人安排相关的邮件 (如看房和航班预订) 直接影响生活和工作安排, 通常优先处理.

**Email priority**: Some emails may be marked as high priority or require immediate response, which will affect Katy’s order of handling.

**邮件优先级**: 有些邮件可能被标为高优先级或需要立即回复, 这会影响 Katy 的处理顺序.

In summary, Katy may prioritize tasks such as arranging apartment viewings, confirming birthday planning, and confirming flight bookings to ensure her personal and work schedules run smoothly.

总之, Katy 可能优先处理安排看房, 确认生日策划和确认航班预订等任务, 保证个人和工作日程顺利进行.

<!-- page 67 of 68 -->

### C.4. Special Imaging (特殊成像)

**Example 6**

**User Request**

What does the left and right comparison of this image illustrate?

这张图左右对比说明了什么?

![同一地区 2023 年 8 月与 9 月的卫星遥感对比图, 右图大片绿色植被变成褐色和灰色](images/p67-checklist.png)

**Checklist**

• Point out that these are two photos taken by satellite remote sensing.

• Compare the time, with the left side being August 2023 and the right side being September 2023.

• Show that large areas have changed color (from green to brown and gray).

• The reasons for changes in vegetation conditions can be fires, droughts, etc.

检查清单: 指出这是两张卫星遥感照片; 比较时间, 左边是 2023 年 8 月, 右边是 2023 年 9 月; 说明大片区域变色 (由绿变棕, 变灰); 植被状况变化的原因可能是火灾, 干旱等.

**MiniMax-VL-01**

This image shows a comparison of satellite images of the same area in August 2023 and September 2023. From the images, it can be seen that the August image (left) shows a rich vegetation cover in the area, with green areas widely distributed, indicating that the vegetation was growing well at that time. However, by September (right), the vegetation cover in the area had significantly decreased, with many green areas turning brown or becoming bare land, suggesting that the vegetation may have experienced a significant reduction or degradation.

这张图对比了同一地区 2023 年 8 月和 9 月的卫星影像. 8 月的图 (左) 显示该地区植被覆盖丰富, 绿色区域分布广, 说明当时植被长势良好. 到了 9 月 (右), 植被覆盖明显减少, 许多绿色区域变成棕色或裸地, 说明植被可能经历了显著减少或退化.

This change may be caused by various factors, including but not limited to climate change, natural disasters (such as fires or droughts), and human activities (such as agricultural development or deforestation). The specific reasons need to be analyzed in conjunction with more data and background information. For example, if the area experienced severe drought or fire in September, then the reduction in vegetation can be explained. Additionally, human activities such as large-scale agricultural development or deforestation may also lead to a significant decrease in vegetation cover.

这种变化可能由多种因素造成, 包括但不限于气候变化, 自然灾害 (如火灾或干旱) 和人类活动 (如农业开发或砍伐森林). 具体原因需要结合更多数据和背景信息分析. 例如若该地区 9 月遭遇严重干旱或火灾, 植被减少就能得到解释; 大规模农业开发或砍伐等人类活动也可能导致植被覆盖大幅下降.

Overall, this comparative image clearly shows the significant changes in vegetation cover in the area within a month, prompting us to pay attention to and study the reasons behind these changes in order to take appropriate measures to protect and restore the ecological environment.

总体来看, 这组对比图清楚显示了该地区一个月内植被覆盖的显著变化, 提醒我们关注和研究背后的原因, 以便采取适当措施保护和恢复生态环境.

<!-- page 68 of 68 -->

## D. Evaluation Details for Selected Benchmarks (部分基准的评测细节)

### D.1. MMLongBench-Doc

For evaluating models with context-length and image-number limitations that exceed requirements of MMLongBench-Doc, we adopt an image concatenation approach suggested by the original repository<sup>7</sup>, resulting in the concatenation of all images extracted from a single PDF input into 5 images for the open-source models evaluated and 10 for Claude-3.5-Sonnet-1022. For evaluating other commercial models and MiniMax-Text-01, we use the default configuration which sets the maximum number of image pages to 120 and resolution to 144.

对于上下文长度和图像数量限制达不到 MMLongBench-Doc 要求的模型, 采用原仓库建议的图像拼接方法: 把单个 PDF 输入中提取的所有图像拼成 5 张 (所评测的开源模型) 或 10 张 (Claude-3.5-Sonnet-1022). 评测其他商用模型和 MiniMax-Text-01 时使用默认配置, 即图像页数上限 120, 分辨率 144.

### D.2. MEGA-Bench

MEGA-Bench is a comprehensive multimodal benchmark that spans 7 input formats, 6 output for mats, 10 different types of skills, and varying forms of visual inputs, including images and videos. Each request may consider multiple images, consisting of visual task description, request-response demonstration and videos. For video inputs, the benchmark slices each video into multiple frames. The number of frames and the resulting number of total input images are limited to the model’s context length and image constraints. We follow the general principles of the original repository<sup>8</sup> when deciding our evaluation configurations, as detailed in Table 14.

MEGA-Bench 是一个综合性多模态基准, 覆盖 7 种输入格式, 6 种输出格式, 10 类技能, 以及包括图像和视频在内的多种视觉输入. 每条请求可能包含多张图像, 由视觉任务描述, 请求-回复示范和视频组成. 对视频输入, 基准把每段视频切成多帧, 帧数及由此得到的输入图像总数受模型上下文长度和图像数量限制. 确定评测配置时遵循原仓库的一般原则, 详见表 14.

Table 14 | Configuration of different models for MEGA-Bench.

表 14 | MEGA-Bench 上各模型的配置.

| Model/Configuration. | MAX_NUM_IMAGE | TOTAL_DEMO_VIDEO_FRAMES |
| --- | --- | --- |
| GPT-4o-2024-1120 | 64 | 8 |
| Claude-3.5-Sonnet-1022 | 64 | 8 |
| Gemini-1.5-Pro-002 | 128 | 16 |
| Gemini-2.0-Flash-exp | 128 | 16 |
| InternVL2.5-78B | 24 | 2 |
| Qwen2-VL-72B-Instruct | 10 | 1 |
| LLama-3.2-90B | 10 | 1 |
| MiniMax-VL-01 | 128 | 16 |

### D.3. MMMU & DocVQA

We note that rule-based methods may misjudge cases where the correct answer has mulitple forms (e.g. U.S. vs. United States), we adopt GPT-4o (specifically GPT-4o-2024-05-13) as the judge model if the rule-based method fails for MMMU and DocVQA evaluation.

基于规则的方法可能误判正确答案有多种形式的情况 (如 U.S. 与 United States), 因此在 MMMU 和 DocVQA 评测中, 规则方法判定失败时改用 GPT-4o (具体为 GPT-4o-2024-05-13) 作为裁判模型.

<small><span class="docvortex-page-footnote" data-block-type="page_footnote" style="color:#6b7280"><sup>7</sup>https://github.com/mayubo2333/MMLongBench-Doc</span></small>

脚注 7: MMLongBench-Doc 原仓库地址.

<small><span class="docvortex-page-footnote" data-block-type="page_footnote" style="color:#6b7280"><sup>8</sup>https://github.com/TIGER-AI-Lab/MEGA-Bench/blob/main/megabench/models/model\_type.py</span></small>

脚注 8: MEGA-Bench 原仓库中模型类型配置文件的地址.
