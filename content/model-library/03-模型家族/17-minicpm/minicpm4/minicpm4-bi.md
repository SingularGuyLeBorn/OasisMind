---
title: "MiniCPM4 · 对照译稿"
category: "模型库"
tags: ["MiniCPM", "对照译稿"]
published: true
excerpt: "MiniCPM4 公开材料的逐段中英对照译稿，附读报告时的疑问块。"
---
<!-- page 1 of 44 -->

arXiv:2506.07900v2 [cs.CL] 4 Sep 2025

arXiv 编号 2506.07900 第 2 版，分类 cs.CL，日期 2025 年 9 月 4 日。

MiniCPM4

3 OpenBMB

# MiniCPM4: Ultra-Efficient LLMs on End Devices（MiniCPM4：端侧设备上的超高效大语言模型）

**MiniCPM Team**

MiniCPM 团队。下面三个链接依次是 MiniCPM4-8B 和 MiniCPM4.1-8B 的 Hugging Face 模型页，以及 GitHub 代码仓库。

[https://huggingface.co/openbmb/MiniCPM4-8B](https://huggingface.co/openbmb/MiniCPM4-8B)

[https://huggingface.co/openbmb/MiniCPM4.1-8B](https://huggingface.co/openbmb/MiniCPM4.1-8B)

[https://github.com/openbmb/minicpm](https://github.com/openbmb/minicpm)

## Abstract

This paper introduces MiniCPM4, a highly efficient large language model (LLM) designed explicitly for end-side devices. We achieve this efficiency through systematic innovation in four key dimensions: model architecture, training data, training algorithms, and inference systems. Specifically, in terms of model architecture, we propose InfLLM v2, a trainable sparse attention mechanism that accelerates both prefilling and decoding phases for long-context processing. Regarding training data, we propose UltraClean, an efficient and accurate pre-training data filtering and generation strategy, and UltraChat v2, a comprehensive supervised fine-tuning dataset. These datasets enable satisfactory model performance to be achieved using just 8 trillion training tokens. Regarding training algorithms, we propose ModelTunnel v2 for efficient pre-training strategy search, and improve existing post-training methods by introducing chunk-wise rollout for load-balanced reinforcement learning and data-efficient tenary LLM, BitCPM. Regarding inference systems, we propose CPM.cu that integrates sparse attention, model quantization, and speculative sampling to achieve efficient prefilling and decoding. To meet diverse on-device requirements, MiniCPM4 is available in two versions, with 0.5B and 8B parameters, respectively. Furthermore, we construct a hybrid reasoning model, MiniCPM4.1, which can be used in both deep reasoning mode and non-reasoning mode. Evaluation results demonstrate that MiniCPM4 and MiniCPM4.1 outperform similar-sized open-source models across benchmarks, with the 8B variants showing significant speed improvements on long sequence understanding and generation.

本文介绍 MiniCPM4，一个专为端侧设备设计的高效大语言模型（LLM）。效率来自四个方向上的系统性创新：模型架构，训练数据，训练算法和推理系统。架构上，我们提出 InfLLM v2，一种可训练的稀疏注意力机制，在长上下文处理中同时加速预填充（prefilling）和解码（decoding）两个阶段。训练数据上，我们提出 UltraClean，一套高效且准确的预训练数据过滤与生成策略，以及 UltraChat v2，一个覆盖全面的监督微调数据集。靠这些数据，只用 8 万亿（8T）个训练 token 就能得到令人满意的模型效果。训练算法上，我们提出 ModelTunnel v2 做高效的预训练策略搜索，并改进现有后训练方法：用分块 rollout (chunk-wise rollout) 做负载均衡的强化学习，再得到数据高效的三值 LLM BitCPM。推理系统上，我们提出 CPM.cu，把稀疏注意力，模型量化和投机采样整合在一起，实现高效的预填充和解码。为满足不同的端侧需求，MiniCPM4 提供 0.5B 和 8B 两个参数版本。此外，我们构建了混合推理模型 MiniCPM4.1，既能用深度推理模式，也能用非推理模式。评测结果显示，MiniCPM4 和 MiniCPM4.1 在各项基准上都超过同等规模的开源模型，其中 8B 版本在长序列理解与生成上速度提升明显。

Jetson AGX Orin (64 G)

![Chart block](images/p01-chart.png)

![Chart block](images/p01-chart-2.png)

![Chart block](images/p01-figure-1-inference-speed-evaluation-on-end-side-gpus.png)

Figure 1: Inference Speed Evaluation on end-side GPUs.

图 1：端侧 GPU 上的推理速度评测。

RTX 4090 (24 G)

![Chart block](images/p01-1.png)

这四张柱状图按 MinerU 的排列顺序，前两张（p01-chart, p01-chart-2）是 Jetson AGX Orin (64G) 上的预填充和解码吞吐，后两张（p01-figure-1, p01-1）是 RTX 4090 (24G) 上的预填充和解码吞吐，单位都是 token/s，横轴是 32k，64k，96k，128k 四档上下文长度。图例四种颜色：青色 Llama-3-8B，绿色 GLM-4-9B，蓝色 Qwen-3-8B，橙色 MiniCPM4-8B. 目测读数：Orin 解码在 128k 时 Qwen-3-8B 约 6 token/s，MiniCPM4-8B 约 46; 4090 解码在 32k 时 MiniCPM4-8B 约 224，其余三个在 65 到 75 之间；4090 预填充在 128k 时 MiniCPM4-8B 约 7150，Qwen-3-8B 约 2800。

> **看表：** 图 1 的两张预填充图左右各有一根纵轴，数字该读哪一根？
> 本文第 1 页 Orin 预填充图左轴 0 到 1400，右轴 0 到 70; 4090 预填充图左轴 0 到 9000，右轴 0 到 250。图例只有四个模型，没有哪一组柱子标明对应右轴，两根轴的比值又是固定的（1400/70 = 20, 9000/250 = 36），看起来是作图时留下的副轴。按左轴读，4090 上 128k 预填充 MiniCPM4-8B 约 7150，Qwen-3-8B 约 2800，约 2.5 倍；Orin 上约 1100 对 230，约 4.8 倍。两张解码图只有一根轴。第 31 到 32 页正文只报了 Orin 上解码约 7 倍，没给预填充倍数，所以预填充只能按左轴目测，右轴可以不管。

– 1

<!-- page 2 of 44 -->

MiniCPM4

OpenBMB

## Contents（目录）

- 1 Introduction 4
- 2 Efficient Architecture and Pre-training 6
  - 2.1 InfLLM v2: Trainable Sparse Attention for Prefilling and Decoding 7
    - 2.1.1 Overall Framework of InfLLM v2 7
    - 2.1.2 Dynamic Contextual Block Selection 8
    - 2.1.3 Design Principles for Trainable Sparse Attention 9
  - 2.2 UltraClean: High-Quality Pre-Training Data Filtering and Generation 10
    - 2.2.1 High-Quality Knowledge-Intensive Data Filtering 10
    - 2.2.2 High-Quality Reasoning-Intensive Data Generation 13
    - 2.2.3 Discussion for Future Training Data 14
  - 2.3 ModelTunnel v2: Efficient Pre-Training Strategy Search 14
    - 2.3.1 Efficient Predictable Scaling with Improved Performance Indicator 14
    - 2.3.2 Pre-Training Engineering 16
- 3 Efficient Post-Training 17
  - 3.1 UltraChat v2: Foundational Capability Enhanced SFT Data Generation 17
    - 3.1.1 Knowledge-Intensive Data 17
    - 3.1.2 Reasoning-Intensive Data 17
    - 3.1.3 Instruction Following Data 18
    - 3.1.4 Long-Context Data 18
    - 3.1.5 Tool Use Data 19
  - 3.2 Chunk-wise Rollout: Deep Reasoning with Load-Balanced Reinforcement Learning 19
    - 3.2.1 RL Data Curation 19
    - 3.2.2 Training Recipe 20
    - 3.2.3 Stabilized Chunk-wise Rollout 21
    - 3.2.4 Experimental Analysis 22
    - 3.2.5 Implement Details 22
  - 3.3 BitCPM4: Quantization-Aware Training for Ternary LLMs 22
    - 3.3.1 Efficient Quantization-Aware Training 23
    - 3.3.2 Discussion for Extremely Low-Bit LLMs 23
- 4 Efficient Inference and Deployment 24
  - 4.1 CPM.cu: Lightweight and Efficient CUDA Inference Framework 24
    - 4.1.1 Frequency-Ranked Vocabulary Construction and Draft Verification 25
    - 4.1.2 P-GPTQ: Prefix-Aware Post-Training Quantization for End-side Devices 26
    - 4.1.3 Speculative Sampling Meets Quantization and Long-Context 26
  - 4.2 ArkInfer: Cross-Platform Deployment System 27
    - 4.2.1 Cross-Platform Compatible Architecture Design 27

目录（本页）：1 引言，第 4 页；2 高效架构与预训练，第 6 页；2.1 InfLLM v2：可同时加速预填充和解码的可训练稀疏注意力，第 7 页；2.1.1 InfLLM v2 的总体框架；2.1.2 动态上下文块选择，第 8 页；2.1.3 可训练稀疏注意力的设计原则，第 9 页；2.2 UltraClean：高质量预训练数据的过滤与生成，第 10 页；2.2.1 高质量知识密集型数据过滤；2.2.2 高质量推理密集型数据生成，第 13 页；2.2.3 对未来训练数据的讨论，第 14 页；2.3 ModelTunnel v2：高效的预训练策略搜索；2.3.1 用改进的性能指标做高效的可预测扩展；2.3.2 预训练工程，第 16 页；3 高效后训练，第 17 页；3.1 UltraChat v2：增强基础能力的 SFT 数据生成；3.1.1 知识密集型数据；3.1.2 推理密集型数据；3.1.3 指令遵循数据，第 18 页；3.1.4 长上下文数据；3.1.5 工具使用数据，第 19 页；3.2 分块 rollout：用负载均衡的强化学习做深度推理；3.2.1 RL 数据整理；3.2.2 训练配方，第 20 页；3.2.3 稳定化的分块 rollout，第 21 页；3.2.4 实验分析，第 22 页；3.2.5 实现细节；3.3 BitCPM4：三值 LLM 的量化感知训练；3.3.1 高效的量化感知训练，第 23 页；3.3.2 关于极低比特 LLM 的讨论；4 高效推理与部署，第 24 页；4.1 CPM.cu：轻量高效的 CUDA 推理框架；4.1.1 按频率排序的词表构建与草稿验证，第 25 页；4.1.2 P-GPTQ：面向端侧设备的前缀感知训练后量化，第 26 页；4.1.3 投机采样遇上量化与长上下文；4.2 ArkInfer：跨平台部署系统，第 27 页；4.2.1 跨平台兼容的架构设计。

<!-- page 3 of 44 -->

MiniCPM4

OpenBMB

    - 4.2.2 Reusable and Efficient Speculative and Constrained Decoding Schemes 28
    - 4.2.3 Extensible Model Zoo Frontend 28
- 5 Evaluations 29
  - 5.1 Experimental Settings 29
  - 5.2 Standard Evaluation 29
  - 5.3 Long-Context Evaluation 30
  - 5.4 Efficiency Evaluation 31
- 6 Applications 32
  - 6.1 MiniCPM4-Survey: Trustworthy Survey Generation 33
    - 6.1.1 Data Construction 33
    - 6.1.2 Training Strategy 34
    - 6.1.3 Evaluations 35
  - 6.2 MiniCPM4-MCP: Tool Use with Model Context Protocol 36
    - 6.2.1 Data Construction 36
    - 6.2.2 Training Strategy 36
    - 6.2.3 Evaluation 37
- 7 Conclusion and Future Works 38
- 8 Contributions and Acknowledgments 38

目录（续）：4.2.2 可复用的高效投机解码与约束解码方案，第 28 页；4.2.3 可扩展的模型库前端；5 评测，第 29 页；5.1 实验设置；5.2 标准评测；5.3 长上下文评测，第 30 页；5.4 效率评测，第 31 页；6 应用，第 32 页；6.1 MiniCPM4-Survey：可信的综述生成，第 33 页；6.1.1 数据构建；6.1.2 训练策略，第 34 页；6.1.3 评测，第 35 页；6.2 MiniCPM4-MCP：基于模型上下文协议的工具使用，第 36 页；6.2.1 数据构建；6.2.2 训练策略；6.2.3 评测，第 37 页；7 结论与未来工作，第 38 页；8 贡献与致谢，第 38 页。

– 3

<!-- page 4 of 44 -->

MiniCPM4

OpenBMB

## 1 Introduction（引言）

Large language models (LLMs) (Brown et al., 2020; OpenAI, 2023), also known as foundation models (Bommasani et al., 2021), have become the core driving force in the field of artificial intelligence (AI) (Qiu et al., 2020; Han et al., 2021). These large models exhibit impressive abilities to handle diverse tasks, from helpful chatbot systems (Ouyang et al., 2022) to complex reasoning systems (OpenAI, 2024b; DeepSeek et al., 2025), significantly enhancing the quality and efficiency of human-machine interaction. However, as the size of models continues to expand (Kaplan et al., 2020; Hoffmann et al., 2022), the requirement for computational resources grows exponentially, resulting in these models being primarily deployed on cloud servers and accessed through API interfaces.

大语言模型（LLM）也称基础模型，已经成为人工智能领域的核心驱动力。这些大模型能处理各类任务，从有用的聊天机器人到复杂的推理系统，明显提升了人机交互的质量和效率。但随着模型规模不断扩大，对算力的需求呈指数增长，这些模型因此主要部署在云端服务器上，通过 API 接口访问。

The development of LLMs is currently facing an important trend toward miniaturization and increased efficiency. From the LLM application perspective, efficient models can reduce deployment costs and expand application scenarios, particularly in environments with limited computational resources such as end-side devices and mobile terminals (Gunter et al., 2024; OpenAI, 2024a). From the technical development perspective, as model sizes continue to grow, improving computational efficiency becomes crucial for overcoming performance bottlenecks with limited resources (DeepSeek et al., 2024). Therefore, efficient model architectures and algorithms that maintain model capabilities while minimizing computational requirements are of considerable theoretical and practical significance.

LLM 的发展眼下有一个重要趋势：走向小型化和高效化。从应用角度看，高效模型能降低部署成本，扩展应用场景，尤其是端侧设备和移动终端这类算力受限的环境。从技术发展角度看，模型越来越大，在有限资源下提升计算效率就成了突破性能瓶颈的关键。所以，在保持模型能力的同时尽量压低计算需求的高效架构与算法，有相当的理论和实际意义。

Aligning with this move towards more efficient LLMs, our team has consistently concentrated on building efficient end-side MiniCPM models (Hu et al., 2024; Yao et al., 2024). In this paper, we further boost model efficiency through systematic innovation in four key dimensions: model architecture, training data, training algorithms, and inference systems. Based on these advancements, we successfully develop MiniCPM4, an 8B LLM capable of efficient computation on edge-side chips. Notably, compared to the effective LLM Qwen3-8B, MiniCPM4 achieves comparable performance using 22% of its training data, while simultaneously demonstrating a 7-fold speed improvement in processing 128K-length documents on end-side devices.

顺着这个方向，我们团队一直专注于打造高效的端侧 MiniCPM 模型。本文从模型架构，训练数据，训练算法和推理系统四个维度做系统性创新，进一步提升模型效率。在此基础上，我们开发出 MiniCPM4，一个能在边缘芯片上高效计算的 8B LLM。值得一提的是，与高效的 LLM Qwen3-8B 相比，MiniCPM4 只用其 22% 的训练数据就达到了相当的性能，同时在端侧设备上处理 128K 长度文档时速度提升 7 倍。

Specifically, MiniCPM4 is featured with the following technologies to improve computational efficiency while maintaining model capabilities:

具体来说，MiniCPM4 用下面这些技术，在保持模型能力的同时提升计算效率：

**Model Architecture: Trainable Sparse Attention** With the widespread application of LLMs in long-context processing (OpenAI, 2025; Jimenez et al., 2023) and the drive for deep reasoning capabilities (DeepSeek et al., 2025; OpenAI, 2024b), the need for LLMs to comprehend and generate long sequences has become increasingly critical. However, the computational and memory demands of self-attention mechanisms pose significant challenges for efficiently processing lengthy documents on end-side devices. We propose a sparse attention architecture, enabling efficient long-context processing while maintaining model performance.

**模型架构：可训练稀疏注意力** LLM 被广泛用于长上下文处理，加上对深度推理能力的追求，理解和生成长序列的需求越来越关键。但自注意力机制的计算和内存开销，让端侧设备高效处理长文档面临很大挑战。我们提出一种稀疏注意力架构，在保持模型性能的同时实现高效的长上下文处理。

• InfLLM v2 – Trainable Sparse Attention Capable of Prefilling and Decoding Acceleration: Building upon our dynamic sparse attention architecture, InfLLM (Xiao et al., 2024b), we introduce InfLLM v2, which features efficient kernel design and end-to-end specialized training. Its kernel facilitates token-level sparse attention computation at the query level, yielding significant speed improvements in both long-context prefilling and decoding phases. Additionally, we develop a specialized training framework that further enhances the sparsity of the attention mechanism and improves long-context processing capabilities.

• InfLLM v2，能加速预填充和解码的可训练稀疏注意力：在我们的动态稀疏注意力架构 InfLLM 基础上，我们推出 InfLLM v2，它有高效的算子设计和端到端的专门训练。其算子支持在 query 层面做 token 级稀疏注意力计算，在长上下文预填充和解码两个阶段都带来明显提速。此外，我们开发了专门的训练框架，进一步提高注意力的稀疏度，并增强长上下文处理能力。

**Training Data: Efficient Training Enhanced by High-Quality Data** High-quality data is crucial for enhancing the capability density of LLMs (Xiao et al., 2024a). While massive internet corpora offer abundant training signals, they inevitably contain noise that leads to suboptimal performance. Building upon existing approaches to data cleaning and filtering (Penedo et al., 2024), we introduce an efficient iterative data cleaning strategy, UltraClean, which yields UltraFineWeb (Wang et al., 2025b), a high-quality knowledge-intensive dataset. Additionally, recognizing the scarcity of reasoning-intensive data, we conduct large-scale data synthesis specifically for mathematics and coding. These approaches enable us to develop a model with satisfactory performance using only 8 trillion tokens of pre-training data.

**训练数据：高质量数据带来的高效训练** 高质量数据对提升 LLM 的能力密度至关重要。海量互联网语料提供了丰富的训练信号，但不可避免地含有噪声，导致性能不够理想。在已有数据清洗与过滤方法的基础上，我们提出高效的迭代式数据清洗策略 UltraClean，由此得到高质量知识密集型数据集 UltraFineWeb。另外，考虑到推理密集型数据稀缺，我们专门针对数学和代码做了大规模数据合成。这些做法让我们只用 8 万亿 token 的预训练数据就得到了效果令人满意的模型。

• UltraClean – High-Quality Pre-Training Data Filtering: We develop an efficient and effective data filtering strategy, UltraClean, which features an efficient verification strategy and an efficient quality classifier. Specifically, in contrast to conventional approaches that verify data quality by training LLMs from scratch using candidate corpora, our proposed efficient verification strategy leverages a nearly-trained LLM as a foundation. We incorporate candidate corpora during the final training steps and utilize the resulting performance improvement as a metric for assessing data quality. This verification strategy significantly enhances evaluation efficiency while maintaining quality assessment accuracy. Based on our efficient

• UltraClean，高质量预训练数据过滤：我们开发了高效且有效的数据过滤策略 UltraClean，特点是一套高效的验证策略和一个高效的质量分类器。传统做法用候选语料从头训练 LLM 来验证数据质量；我们的高效验证策略则以一个接近训练完成的 LLM 为基础，在最后的训练步骤里掺入候选语料，用由此带来的性能提升作为衡量数据质量的指标。这种验证策略在保持质量评估准确度的同时，大幅提高了评估效率。基于这一高效

<!-- page 5 of 44 -->

MiniCPM4

OpenBMB

verification strategy, we can impartially select high-quality seed data for classifier training. Building upon the assumption that “high-quality seed data is beneficial for LLM training”，we develop and optimize the strategy for selecting classifier training seeds and recipes, while carefully curating balanced sets of both positive and negative samples to ensure classifier quality and robustness. We apply the proposed data filtering pipeline to the FineWeb (Penedo et al., 2024) and Chinese FineWeb (Yu et al., 2025b) datasets, collectively termed **UltraFineWeb**. This pipeline not only improves filtering efficiency, classifier quality, and robustness, but also significantly reduces experimental and inference costs.

验证策略，我们可以不偏不倚地挑选高质量种子数据来训练分类器。基于 「高质量种子数据对 LLM 训练有益」 这一假设，我们设计并优化了分类器训练种子和配方的选择策略，同时仔细整理正负样本平衡的集合，保证分类器的质量和鲁棒性。我们把这套数据过滤流水线应用到 FineWeb 和 Chinese FineWeb 数据集上，得到的结果统称 **UltraFineWeb**。这套流水线不仅提高了过滤效率，分类器质量和鲁棒性，还大幅降低了实验和推理成本。

UltraChat v2 – High-Quality Supervised Fine-Tuning Data Generation: Building upon UltraChat (Ding et al., 2023), we introduce a high-quality dialogue construction strategy that enables the efficient generation of reasoning-intensive data for LLM training and evaluation. Specifically, in contrast to conventional instruction-tuning datasets that prioritize coverage or surface-level diversity, our proposed strategy focuses on multi-turn interactions with deep reasoning, contextual consistency, and task complexity. We leverage a combination of expert models and prompt engineering to produce dialogues that challenge LLMs across a range of reasoning types, including multi-hop inference, commonsense reasoning, and domain-specific problem-solving. This approach not only enhances data quality but also supports the creation of robust and challenging benchmarks for fine-tuning and evaluation. Based on this reasoning-intensive generation pipeline, we construct high-quality seed data and optimize the design of prompts, dialogue structures, and quality control mechanisms. We further adopt a dual-stage filtering process that combines automated verification with selective human review to ensure response accuracy, coherence, and diversity. We apply the proposed pipeline to generate UltraChat v2, a reasoning-intensive extension of existing instruction-tuning corpora. This pipeline not only improves data generation quality and filtering efficiency, but also significantly enhances the reasoning capabilities of LLMs fine-tuned on this data.

UltraChat v2，高质量监督微调数据生成：在 UltraChat 的基础上，我们提出一种高质量对话构建策略，能高效生成推理密集型数据，用于 LLM 的训练和评测。传统指令微调数据集侧重覆盖面或表层多样性；我们的策略则聚焦于带深度推理，上下文一致性和任务复杂度的多轮交互。我们结合专家模型和提示工程，生成在多种推理类型上考验 LLM 的对话，包括多跳推理，常识推理和特定领域的问题求解。这种做法既提升数据质量，也支持构建鲁棒且有挑战性的基准，用于微调和评测。基于这条推理密集型生成流水线，我们构建了高质量种子数据，并优化了提示，对话结构和质量控制机制的设计。我们还采用两阶段过滤流程，把自动验证和有选择的人工审核结合起来，保证回答的准确性，连贯性和多样性。用这条流水线生成的 UltraChat v2，是对现有指令微调语料的推理密集型扩展。这条流水线不仅提高了数据生成质量和过滤效率，也明显增强了在这些数据上微调的 LLM 的推理能力。

**Training Algorithms: Multi-Dimensional Training Optimization Strategies** The scaling law of LLMs indicates that performance improves with increased training volume (Kaplan et al., 2020). Reducing training costs is therefore essential for sustainable model scaling. In Hu et al. (2024), we develop ModelTunnel to search for the optimal training strategy by conducting a series of experiments on small-scale models. In developing MiniCPM4, we further improve the search accuracy and introduce ModelTunnel v2. For efficient post-training mechanism, we employ a load-balanced rollout strategy for the reinforcement learning (RL) process, which can make better use of the computational resources during the rollout process. Besides, to reduce the storage requirements, we introduce a ternary LLM, BitCPM4.

**训练算法：多维度训练优化策略** LLM 的 scaling law 表明，性能随训练量增加而提升。因此，降低训练成本对模型的可持续扩展至关重要。在 Hu et al. (2024) 中，我们开发了 ModelTunnel，通过在小规模模型上做一系列实验来搜索最优训练策略。开发 MiniCPM4 时，我们进一步提升搜索精度，推出 ModelTunnel v2。在高效后训练方面，我们在强化学习（RL）过程中采用负载均衡的 rollout 策略，更好地利用 rollout 阶段的算力。此外，为降低存储需求，我们推出三值 LLM BitCPM4。

• ModelTunnel v2 – Efficient Training Strategy Search: Following our ModelTunnel (Hu et al., 2024), we develop ModelTunnel v2, which advances in two aspects: (1) Improved performance indicator: Due to the emergenet abilities (Wei et al., 2022), previous predictable scaling methods cannot effectively predict the performance of downstream tasks. In MiniCPM4, we construct ScalingBench (Xiao et al., 2024a) and establish the relationship between the loss of ScalingBench and downstream performance. Therefore, instead of using language model loss as the performance indicator for predictable scaling, we can use ScalingBench as the performance indicator, which can improve the hyper-parameter searching effectiveness. (2) Search effectiveness validation: Utilizing Scaling-Bench (Xiao et al., 2024a), we systematically validate the effectiveness of the identified parameters. Our experimental results demonstrate that the maximal-updateparameterization (µP) (Yang et al., 2022) combined with our hyperparameter search achieves performance comparable to state-of-the-art industry methods and our method can significantly reduce the searching costs.

• ModelTunnel v2，高效训练策略搜索：继 ModelTunnel 之后，我们开发了 ModelTunnel v2，在两方面有进展：（1）改进的性能指标：由于涌现能力的存在，以往的可预测扩展方法无法有效预测下游任务表现。在 MiniCPM4 中，我们构建了 ScalingBench，并建立起 ScalingBench 上的 loss 与下游表现之间的关系。因此，可预测扩展不再用语言模型 loss 作性能指标，而改用 ScalingBench，这能提升超参数搜索的效果。（2）搜索有效性验证：借助 ScalingBench，我们系统验证了搜出的参数是否有效。实验结果表明，最大更新参数化（µP）结合我们的超参数搜索，效果与业界最先进的方法相当，且能大幅降低搜索成本。

• Chunk-wise Rollout – Load-Balanced Reinforcement Learning: We implement a chunk-wise rollout strategy to improve RL training efficiency, which limits the maximum output token budget for each rollout phase and resumes the generation of incomplete trajectories in subsequent iterations, significantly reducing idle computations caused by lengthy trajectories. Additionally, to address the instability introduced by the chunk-wise rollout strategy, we incorporate several stabilization techniques, including KL loss, dual-clip, chunk-level importance sampling, and garble filter. Collectively, these enhancements ensure stable and efficient scaling of long chain-of-thought (CoT) RL training.

• 分块 rollout，负载均衡的强化学习：我们实现了分块 rollout 策略来提高 RL 训练效率：限制每个 rollout 阶段的最大输出 token 预算，并在之后的迭代中续写未完成的轨迹，大幅减少个别超长轨迹造成的空转计算。另外，为应对分块 rollout 带来的不稳定，我们加入了几项稳定化技术，包括 KL loss，dual-clip，块级重要性采样和乱码过滤器。这些改进合在一起，保证长 CoT 的 RL 训练能稳定高效地扩展。

• BitCPM4 – Quantization-Aware Training for Ternary LLMs: We design a two-stage training framework that substantially reduces quantization-aware training (QAT) costs by initializing the quantization phase with our pre-trained high-precision model. Integrated with ModelTunnel v2, our method achieves comparable performance to existing QAT approaches while using 10× fewer training tokens. For those extremely resource-limited devices, we adapt MiniCPM4 to the ternary version BitCPM4 and show promising results.

• BitCPM4，三值 LLM 的量化感知训练：我们设计了两阶段训练框架，用预训练好的高精度模型初始化量化阶段，大幅降低量化感知训练（QAT）的成本。结合 ModelTunnel v2，我们的方法用少 10 倍的训练 token 就达到了与现有 QAT 方法相当的效果。对资源极其有限的设备，我们把 MiniCPM4 改造成三值版本 BitCPM4，结果很有希望。

• Efficient Training Engineering: Inspired by DeepSeek et al. (2024), we implement both the multi-token prediction training objective (Gloeckle et al., 2024) and the FP-8 mixed-precision training framework. Multi-token prediction can introduce more intensive supervision signals and make the additional head

• 高效训练工程：受 DeepSeek et al. (2024) 启发，我们实现了多 token 预测训练目标和 FP8 混合精度训练框架。多 token 预测能引入更密集的监督信号，并让额外的预测头

<!-- page 6 of 44 -->

MiniCPM4

OpenBMB

achieve a higher acceptance length in speculative sampling. FP-8 mixed-precision training can make full use of the computational power of our GPU clusters.

在投机采样中获得更长的接受长度。FP8 混合精度训练能充分利用我们 GPU 集群的算力。

**Inference Systems: High-Performance Inference Framework for End-Side Devices** End-side devices have limited computational power and storage resources. To fully utilize these devices, we customize a high-performance inference framework.

**推理系统：面向端侧设备的高性能推理框架** 端侧设备的算力和存储资源都有限。为了充分利用这些设备，我们定制了一个高性能推理框架。

• CPM.cu – Lightweight and Efficient CUDA Inference Framework: We first develop a lightweight inference framework featuring static memory management, kernel fusion, and efficient speculative sampling implementation, achieving efficient prefilling and decoding speed. Building upon this framework, we integrate efficient sparse attention kernels for InfLLM v2, further improve speculative drafting speed with FR-Spec (Zhao et al., 2025), introduce the more effective prefix-aware quantization method P-GPTQ, and investigate the combined effect of speculative sampling and quantization through SpecMQuant (Zhang et al., 2025b).

• CPM.cu，轻量高效的 CUDA 推理框架：我们先开发了一个轻量推理框架，具备静态内存管理，算子融合和高效的投机采样实现，预填充和解码速度都很快。在此框架上，我们集成了 InfLLM v2 的高效稀疏注意力算子，用 FR-Spec 进一步加快投机采样的起草速度，引入更有效的前缀感知量化方法 P-GPTQ，并通过 SpecMQuant 研究投机采样与量化结合的效果。

• ArkInfer – Cross-Platform Deployment Framework: To address the challenge of deploying LLMs across diverse hardware platforms, we design ArkInfer with a unified executor-based architecture and adaptive backend interfaces. We integrate multiple inference frameworks (NeuroPilot, Genie, RK-LLM, TensorRT-LLM, and llama.cpp) through standardized APIs and employ advanced optimization techniques like typical speculative sampling and quantization methods. This design enables seamless cross-platform deployment with native multimodal capabilities, flexible sampling strategies, and comprehensive performance evaluation tools, significantly simplifying the integration of MiniCPM models across various end-side devices beyond NVIDIA chips.

• ArkInfer，跨平台部署框架：为应对在多种硬件平台上部署 LLM 的难题，我们设计了 ArkInfer，采用统一的基于执行器的架构和自适应后端接口。我们通过标准化 API 集成多个推理框架（NeuroPilot，Genie，RK-LLM，TensorRT-LLM 和 llama.cpp），并采用典型的投机采样和量化方法等优化技术。这种设计实现了无缝跨平台部署，自带多模态能力，采样策略灵活，还有完整的性能评测工具，大大简化了 MiniCPM 模型在 NVIDIA 芯片以外的各种端侧设备上的集成。

Based on the above techniques, we build MiniCPM4 with two parameter versions: 0.5B and 8B, each with general and deep inference variants. During pre-training, we train the 8B model on 8.3T high-quality tokens. We adopt the warmup-stable-decay (WSD) learning rate scheduler (Hu et al., 2024), allocating 7T tokens for the warmup and stable phases and 1.3T tokens for the annealing phase. Following this, we conduct long-context pre-training to extend the context window of MiniCPM4 from 4K to 128K tokens. Subsequently, we perform supervised fine-tuning (SFT) post-training to enable the model to follow user instructions. To further develop a hybrid reasoning model, MiniCPM4.1, we utilize long CoT data for SFT and implement reinforcement learning with mathematics and coding tasks. MiniCPM4.1 is trained based on MiniCPM4 with improved post-training corpus. MiniCPM4.1 is a hybrid model, and can be used in both reasoning and non-reasoning modes. We evaluate MiniCPM4 and MiniCPM4.1 on a series of widely-used benchmarks. MiniCPM4 and MiniCPM4.1 outperform typical baselines with similar parameter sizes and becomes one of the most effective and efficient open-source LLMs.

基于上述技术，我们构建了 0.5B 和 8B 两个参数版本的 MiniCPM4，每个版本都有通用和深度推理两种变体。预训练阶段，8B 模型在 8.3T 高质量 token 上训练。我们采用 warmup-stable-decay (WSD) 学习率调度器，预热和稳定阶段分配 7T token，退火阶段分配 1.3T token。之后做长上下文预训练，把 MiniCPM4 的上下文窗口从 4K 扩展到 128K token。随后做监督微调（SFT）后训练，让模型能遵循用户指令。为了进一步得到混合推理模型 MiniCPM4.1，我们用长 CoT 数据做 SFT，并在数学和代码任务上做强化学习。MiniCPM4.1 在 MiniCPM4 的基础上，用改进后的后训练语料训练而成。MiniCPM4.1 是混合模型，推理模式和非推理模式都能用。我们在一系列常用基准上评测了 MiniCPM4 和 MiniCPM4.1。它们超过了参数规模相近的典型基线，成为最有效，最高效的开源 LLM 之一。

Finally, based on MiniCPM4, we develop three applications to present the effectiveness of MiniCPM4 and explore advanced technology, including trustworthy survey generation and tool use with model context protocol (MCP). All three applications require the model to be able to generate long sequences with high coherence and logicality, invoke complex functions to obtain external resources, and write creatively. The results show that MiniCPM4 presents promising results on these applications, and we encourage the community to explore more interesting applications based on our MiniCPM4.

最后，我们基于 MiniCPM4 开发了三个应用，展示 MiniCPM4 的效果并探索前沿技术，包括可信的综述生成，以及基于模型上下文协议（MCP）的工具使用。这三个应用都要求模型能生成高度连贯，有逻辑的长序列，能调用复杂函数获取外部资源，还要能做创意写作。结果显示 MiniCPM4 在这些应用上表现很有希望，我们也鼓励社区基于 MiniCPM4 探索更多有意思的应用。

## 2 Efficient Architecture and Pre-training（高效架构与预训练）

In this section, we introduce the model architecture and training algorithms applied in MiniCPM4, which features efficient sparse attention layers and an efficient training pipeline. In this section, we will first introduce the details of our proposed InfLLM v2, supporting efficient long-context processing. Specifically, InfLLM v2 enables MiniCPM4 to achieve comparable long-context processing ability with the full attention mechanism with 81% attention sparsity. Then, we describe the pre-training data management methods, enabling efficient knowledge learning. Finally, we present our pre-training pipeline, including ModelTunnel v2 for hyperparameter search as well as engineering for pre-training objective and long-context extension. All these methods enable MiniCPM4-8B to achieve comparable results with Qwen3-8B using only 22% of the pre-training tokens of Qwen3-8B.

本节介绍 MiniCPM4 所用的模型架构和训练算法，特点是高效的稀疏注意力层和高效的训练流水线。我们先介绍提出的 InfLLM v2 的细节，它支撑高效的长上下文处理。具体来说，InfLLM v2 让 MiniCPM4 在 81% 注意力稀疏度下，长上下文处理能力与全注意力机制相当。接着介绍预训练数据的管理方法，它让知识学习更高效。最后介绍预训练流水线，包括用于超参数搜索的 ModelTunnel v2，以及预训练目标和长上下文扩展方面的工程。这些方法让 MiniCPM4-8B 只用 Qwen3-8B 预训练 token 的 22%，就取得了与之相当的结果。

<!-- page 7 of 44 -->

MiniCPM4

OpenBMB

![Image block](images/p07-figure-2-the-illustration-of-infllm-v2-each-query-group.png)

Figure 2: The illustration of InfLLM v2. Each query group selects parts of key-value blocks for attention computation, where the initial tokens and local tokens in the sliding window are always selected.

图 2: InfLLM v2 示意图。每个 query 组选出一部分 key-value 块参与注意力计算，开头的 token 和滑动窗口内的局部 token 总会被选中。

图分上下两层。下层 「Stage 1: Contextual Block Selection」 把分块后的 KV cache 画成一排色块，左端绿色是开头块，右端紫色是局部窗口块，中间黄色块之上引出一个个语义核（Semantic Kernels），每个语义核跨在相邻两块的交界上；语义核与右侧的 query 组一起送进 「Relevance Score & Top-k」，打勾的是被选中的块。上层 「Stage 2: Sparse Attention Computation」 里，query 组只连向绿色块，紫色块和两个被选中的黄色块，浅色块被跳过。

## 2.1 InfLLM v2: Trainable Sparse Attention for Prefilling and Decoding（InfLLM v2：可同时加速预填充和解码的可训练稀疏注意力）

Following most open-source LLMs, we adopt Transformer (Vaswani et al., 2017) as our basic architecture. In consideration of the emerging needs to process long sequences, many efforts have been devoted to designing a training-free sparse attention mechanism to dynamically select relevant context tokens for long-context processing (Xiao et al., 2023; Jiang et al., 2024; Xu et al., 2025; Zhang et al., 2025a). These models can only be applied in prefilling acceleration due to their unsatisfactory sparsity.

和多数开源 LLM 一样，我们采用 Transformer 作为基础架构。考虑到处理长序列的需求日益增长，已有很多工作设计免训练的稀疏注意力机制，为长上下文处理动态挑选相关的上下文 token。这些模型的稀疏度不够理想，只能用于加速预填充。

Recently, MoBA (Lu et al., 2025) and NSA (Yuan et al., 2025) apply sparse attention in the pre-training stage to improve model performance. However, MoBA utilizes the design of query blocks, which prevents it from achieving acceleration during the decoding phase. Besides, according to our observations, the relevant contexts between adjacent tokens usually vary greatly. Therefore, forcing adjacent tokens to share the same context may lead to sub-optimal performance, and at the same time, the sparsity of attention cannot be improved. NSA introduces three different attention components to capture long-distance information. The three attention components introduce additional parameters, which will lead to increased computational overhead for short sequences and threefold key-value storage costs for pre-training.

最近，MoBA 和 NSA 在预训练阶段就使用稀疏注意力来提升模型性能。但 MoBA 采用 query 块的设计，因而在解码阶段无法加速。此外，据我们观察，相邻 token 的相关上下文往往差别很大。强迫相邻 token 共享同一段上下文，可能导致次优的性能，注意力的稀疏度也提不上去。NSA 引入三种不同的注意力组件来捕捉长距离信息。这三个组件带来额外参数，会增加短序列的计算开销，并在预训练时带来三倍的 key-value 存储成本。

In this section, based on our previous sparse attention model, InfLLM (Xiao et al., 2024b), we design a trainable sparse attention, InfLLM v2, to reduce the computation and memory access costs for both prefilling and decoding phrases. InfLLM v2 does not introduce additional parameters for attention output and will not influence the inference for short sequences. Besides, we propose an efficient Top-K context block selection method, which can reduce 60% computational costs compared with NSA. In the following paragraphs, we will introduce the algorithm design of InfLLM v2.

本节在我们之前的稀疏注意力模型 InfLLM 基础上，设计可训练的稀疏注意力 InfLLM v2，降低预填充和解码两个阶段的计算和访存成本。InfLLM v2 不给注意力输出引入额外参数，也不影响短序列的推理。此外，我们提出一种高效的 Top-K 上下文块选择方法，比 NSA 减少 60% 的计算成本。下面几段介绍 InfLLM v2 的算法设计。

## 2.1.1 Overall Framework of InfLLM v2（InfLLM v2 的总体框架）

In a sparse attention mechanism, we only select parts of context tokens for attention computation. Following InfLLM, we split the key-value cache into block-level units, and each query token will select blocks with the highest relevance scores for attention. Formally, in each attention layer, the input is a sequence of hidden vectors, with each vector representing the contextual information of a token. Given an input sequence $\mathbf { X } = \{ \mathbf { x } _ { 1 } , \mathbf { x } _ { 2 } , \ldots , \mathbf { x } _ { l } \}$ , the self-attention mechanism first maps this sequence to query, key, and value vectors $\mathbf { Q } = \{ \mathbf { q } _ { 1 } , \mathbf { q } _ { 2 } , \ldots , \mathbf { q } _ { l } \} , \mathbf { K } = \{ \mathbf { k } _ { 1 } , \mathbf { k } _ { 2 } , \ldots , \mathbf { k } _ { l } \} , \mathbf { V } = \{ \mathbf { v } _ { 1 } , \mathbf { \dot { v } } _ { 2 } , \ldots , \mathbf { \dot { v } } _ { l } \}$ Here, l is the length of the input sequence. In a dense attention mechanism, each token needs to attend all preceding tokens, which can be expressed as $\mathbf { o } _ { i } = \operatorname { A t t e n t i o n } \left( \mathbf { q } _ { i } , \left( \mathbf { K } _ { 1 : i } , \mathbf { V } _ { 1 : i } \right) \right)$ . In contrast, a sparse attention mechanism selectively attends to only a subset of relevant tokens. We partition the key-value cache into blocks to avoid fine-grained token-level relevance computation and memory access, thereby improving the efficiency of sparse attention. Specifically, InfLLM v2 divides the key-value cache into equal-sized blocks, with each block containing m tokens. The key-

在稀疏注意力机制中，我们只挑一部分上下文 token 参与注意力计算。沿用 InfLLM 的做法，我们把 key-value cache 切成块级单元，每个 query token 选出相关性得分最高的块做注意力。形式化地说，在每个注意力层，输入是一串隐向量，每个向量表示一个 token 的上下文信息。给定输入序列 $\mathbf{X}=\{\mathbf{x}_1,\ldots,\mathbf{x}_l\}$，自注意力机制先把它映射为 query，key，value 向量 $\mathbf{Q},\mathbf{K},\mathbf{V}$，其中 l 是输入序列长度。在稠密注意力中，每个 token 都要关注前面所有 token，可写成 $\mathbf{o}_i=\mathrm{Attention}(\mathbf{q}_i,(\mathbf{K}_{1:i},\mathbf{V}_{1:i}))$。稀疏注意力则只选择性地关注一部分相关 token。我们把 key-value cache 分块，避免细粒度的 token 级相关性计算和访存，从而提高稀疏注意力的效率。具体来说，InfLLM v2 把 key-value cache 切成等大小的块，每块含 m 个 token。于是 key-

<!-- page 8 of 44 -->

MiniCPM4

OpenBMB

value cache is thus partitioned into blocks $\mathcal { B } = \{ \mathbf { B } _ { 0 } , \ldots , \mathbf { B } _ { \lfloor \frac { l } { m } \rfloor - 1 } \}$ , where $\mathbf { B } _ { j } = \left( \mathbf { K } _ { j m : ( j + 1 ) m } , \mathbf { V } _ { j m : ( j + 1 ) m } \right)$ Here, m is the block size for key-value blocks.

value cache 被划分为块集合 $\mathcal{B}=\{\mathbf{B}_0,\ldots,\mathbf{B}_{\lfloor l/m\rfloor-1}\}$，其中 $\mathbf{B}_j=(\mathbf{K}_{jm:(j+1)m},\mathbf{V}_{jm:(j+1)m})$，m 是 key-value 块的块大小。

The sparse attention computation of InfLLM $\mathrm { v 2 }$ consists of two stages. In the first stage, we dynamically select relevant blocks from B based on the query token $\mathbf { q } _ { i }$ . To this end, we need to compute the relevance score $r _ { \mathrm { b l o c k } } ( \mathbf { q } _ { i } , \mathbf { B } _ { j } )$ between the query token $\mathbf { q } _ { i }$ and each block, and then select the blocks with the highest relevance scores. In the second phase, based on the blocks selected in the first stage, we compute attention between $\mathbf { q } _ { i }$ and all tokens within these selected blocks. In the following sections, we will introduce the details about these two stages.

InfLLM v2 的稀疏注意力计算分两个阶段。第一阶段根据 query token $\mathbf{q}_i$ 从 $\mathcal{B}$ 中动态挑选相关块。为此要计算 $\mathbf{q}_i$ 与每个块之间的相关性得分 $r_{\mathrm{block}}(\mathbf{q}_i,\mathbf{B}_j)$，再选出得分最高的若干块。第二阶段基于第一阶段选出的块，计算 $\mathbf{q}_i$ 与这些块内全部 token 之间的注意力。下面几节分别介绍这两个阶段的细节。

## 2.1.2 Dynamic Contextual Block Selection（动态上下文块选择）

The most critical component of InfLLM v2 is the relevance score computation between query tokens and key-value blocks. To avoid token-by-token relevance calculations, InfLLM (Xiao et al., 2024b) selects representative tokens from each block to serve as the block representation, defining the relevance score as the dot product between the query token and these representative tokens. While this approach can capture important semantic information within blocks, the selection of representative tokens involves token-level computation and memory access, becoming one of InfLLM’s efficiency bottlenecks. Therefore, we introduce fine-grained semantic kernels to capture block semantics and avoid token-level memory access. Besides, we require query heads in the same group to share the same key-value blocks to reduce memory access costs.

InfLLM v2 最关键的组件是 query token 与 key-value 块之间的相关性得分计算。为避免逐 token 计算相关性，InfLLM 从每个块中挑出代表 token 作为块的表示，把相关性得分定义为 query token 与这些代表 token 的点积。这种做法能抓住块内重要的语义信息，但挑代表 token 本身涉及 token 级计算和访存，成了 InfLLM 的效率瓶颈之一。因此我们引入细粒度语义核来捕捉块的语义，避开 token 级访存。此外，我们要求同一组内的 query head 共享同一批 key-value 块，以降低访存成本。

**Semantic Kernels** InfLLM v2 further improves the relevance score computation method. Since sparse attention mechanisms need to minimize discontinuities in memory access, InfLLM v2 requires coarse-grained block partitioning of key-value sequences, with the block size m typically being a relatively large value. If we use only one vector to represent the semantics of each block, we will inevitably encounter the problem of information loss. To achieve more accurate relevance computation, InfLLM $\mathrm { v 2 }$ introduces fine-grained semantic kernels to construct representations for each key-value block. Specifically, InfLLM $\mathrm { v 2 }$ partitions the key-value sequence at a finer granularity, producing several semantic kernels. To ensure that each semantic span in the input sequence is contained within a complete semantic kernel, these kernels need to overlap with each other. Formally, InfLLM $\mathrm { v 2 }$ divides the input sequence into semantic kernels of a size $p ,$ with a stride s between adjacent kernels. Thus, K is partitioned into $\{ \mathcal { S } = \{ \mathbf { S } _ { 0 } , \dots , \mathbf { S } _ { \lfloor \frac { l } { s } \rfloor - 1 } \}$ , where $\mathbf { S } _ { \hat { j } } = \mathbf { \hat { K } } _ { \hat { j } s : \hat { j } s + p } .$ Since semantic kernels only participate in relevance computation, only the key vectors need to be retained.

**语义核** InfLLM v2 进一步改进了相关性得分的计算方法。稀疏注意力要尽量减少访存的不连续，所以 InfLLM v2 要求对 key-value 序列做粗粒度分块，块大小 m 通常取得比较大。如果每个块只用一个向量表示语义，难免会丢信息。为了算得更准，InfLLM v2 引入细粒度语义核，为每个 key-value 块构建表示。具体来说，InfLLM v2 以更细的粒度切分 key-value 序列，得到若干语义核。为保证输入序列里每段语义都完整落在某个语义核内，这些核之间需要相互重叠。形式化地说，InfLLM v2 把输入序列切成大小为 p 的语义核，相邻核之间步长为 s. 于是 K 被划分为 $\mathcal{S}=\{\mathbf{S}_0,\ldots,\mathbf{S}_{\lfloor l/s\rfloor-1}\}$，其中 $\mathbf{S}_{\hat j}=\mathbf{K}_{\hat j s:\hat j s+p}$。语义核只参与相关性计算，所以只需保留 key 向量。

InfLLM v2 uses the mean pooling operator to compute the representation of each semantic kernel Mean $( \mathbf { K } _ { \hat { j } s : \hat { j } s + p } )$ , and the relevance score between a query token $\mathbf { q _ { i } }$ and a semantic kernel is defined as $r _ { \mathsf { k e r n e l } } ( \mathbf { q _ { i } } , \mathbf { \hat { S } } _ { j } ) \overset { \cdot } { = } \mathsf { s o f t m a x } ( \mathbf { q _ { i } } \cdot \mathbf { M e a n } ( \mathbf { K } _ { \hat { j } s : \hat { j } s + p } ) )$ . The relevance score between query token $\mathbf { q _ { i } }$ and block $\mathbf { B } _ { j }$ can then be represented as the maximum relevance score of all semantic kernels that intersect with $\mathbf { B } _ { j } \mathbf { : }$

InfLLM v2 用均值池化算子计算每个语义核的表示 $\mathrm{Mean}(\mathbf{K}_{\hat j s:\hat j s+p})$，query token $\mathbf{q}_i$ 与语义核的相关性得分定义为 $r_{\mathrm{kernel}}(\mathbf{q}_i,\mathbf{S}_{\hat j})=\mathrm{softmax}(\mathbf{q}_i\cdot\mathrm{Mean}(\mathbf{K}_{\hat j s:\hat j s+p}))$。这样，query token $\mathbf{q}_i$ 与块 $\mathbf{B}_j$ 的相关性得分，就可以表示为所有与 $\mathbf{B}_j$ 相交的语义核的最大相关性得分，见式（1）。

$$
r _ {\text {block}} \left(\mathbf {q} _ {\mathrm{i}}, \mathbf {B} _ {j}\right) = \max r _ {\text {kernel}} \left(\mathbf {q} _ {\mathrm{i}}, \mathbf {S} _ {j}\right), \quad \mathbf {S} _ {\hat {j}} \in \mathcal {S} \quad \text {and} \quad \mathbf {B} _ {j} \cap \mathbf {S} _ {\hat {j}} \neq \emptyset .\tag{1}
$$

Based on the relevance scores $r _ { \mathrm { b l o c k } } ( \mathbf { q _ { i } } , \mathbf { B } _ { j } )$ , InfLLM v2 selects the k blocks with the highest relevance. Then, InfLLM v2 computes attention between the query token $\mathbf { q _ { i } }$ and all tokens within these selected blocks to produce the final output $\mathbf { o _ { i } }$

根据相关性得分 $r_{\mathrm{block}}(\mathbf{q}_i,\mathbf{B}_j)$，InfLLM v2 选出相关性最高的 k 个块。然后计算 query token $\mathbf{q}_i$ 与这些块内全部 token 的注意力，得到最终输出 $\mathbf{o}_i$。

Notably, considering that the initial tokens as well as the tokens within the local window usually contribute a lot to the final outputs, InfLLM $\mathrm { v 2 }$ sets the relevance scores between each query token $\mathbf { q _ { i } }$ and the initial key-value blocks $\mathbf { B } _ { 0 }$ and local window blocks to infinity. This mechanism ensures that each query token can attend both the initial blocks and the blocks within the local window. When the text length is short and does not exceed the total length of k blocks, InfLLM v2 degrades to the vanilla dense attention mechanism.

值得注意的是，开头的 token 和局部窗口内的 token 通常对最终输出贡献很大，所以 InfLLM v2 把每个 query token $\mathbf{q}_i$ 与开头块 $\mathbf{B}_0$ 以及局部窗口块之间的相关性得分设为无穷大。这保证每个 query token 总能关注到开头块和局部窗口内的块。当文本较短，总长度不超过 k 个块时，InfLLM v2 就退化为普通的稠密注意力。

**Top-K Blocks Sharing** Current LLM architectures typically adopt grouped query attention layers, where multiple queries share a single key-value head. In InfLLM $\mathrm { v } 2 .$ , we require query heads within the same group to share the same top-k relevant blocks. This allows us to minimize memory access as much as possible. Specifically, after each query head computes relevance scores with semantic kernels, we average the relevance scores within the group and use this average as the relevance score for the query group.

**Top-K 块共享** 当前的 LLM 架构通常采用分组 query 注意力（GQA）层，多个 query 共享一个 key-value head。在 InfLLM v2 中，我们要求同一组内的 query head 共享同一批 top-k 相关块，这样能尽可能减少访存。具体做法是：每个 query head 与语义核算出相关性得分后，在组内取平均，用这个平均值作为整个 query 组的相关性得分。

**Efficient Top-K Implementation** Top-K selection involves three sequential steps: 1) Computing relevance scores between query tokens and each semantic kernel, followed by the softmax normalization. 2) Aggregating relevance scores for each semantic kernel across the query group dimension. 3) Selecting the top-K context blocks for each query token based on the aggregated scores. This operation constitutes the computational bottleneck in the sparse attention mechanism.

**高效的 Top-K 实现** Top-K 选择包含三个顺序步骤：1) 计算 query token 与每个语义核的相关性得分，再做 softmax 归一化。2) 沿 query 组维度聚合每个语义核的相关性得分。3) 根据聚合后的得分，为每个 query token 选出 top-K 上下文块。这个操作是稀疏注意力机制的计算瓶颈。

<!-- page 9 of 44 -->

MiniCPM4

OpenBMB

Traditional dense attention mechanisms typically employ the FlashAttention algorithm (Dao et al., 2022) to reduce memory usage and accelerate attention computation. Specifically, FlashAttention leverages online softmax to minimize HBM access operations during the attention computation process. However, Top-K selection differs fundamentally from the attention computation process, as it requires precise numerical values of relevance scores between each query group and each semantic kernel. Since relevance computation, softmax normalization, and score aggregation across the query group dimension do not satisfy the commutative property, online softmax cannot be utilized. Consequently, Top-K selection requires two passes of memory access and computation on semantic kernels, where the first pass is used to compute the LogSumExp (LSE) and the second pass is used to calculate the final relevance scores.

传统稠密注意力通常用 FlashAttention 算法减少显存占用，加快注意力计算。具体来说，FlashAttention 借助 online softmax 减少注意力计算过程中的 HBM 访问。但 Top-K 选择和注意力计算有本质不同：它需要每个 query 组与每个语义核之间相关性得分的精确数值。由于相关性计算，softmax 归一化和沿 query 组维度的得分聚合三者不满足交换律，online softmax 用不上。因此 Top-K 选择需要对语义核做两遍访存和计算，第一遍算 LogSumExp (LSE)，第二遍算最终的相关性得分。

Top-K selection is the bottleneck of InfLLM $\mathrm { v 2 }$ for long-context processing. To reduce the computational costs, we propose an efficient LSE approximation method. Different from computing the dot product results between query tokens and all semantic kernels, we attempt to approximate the LSE value by introducing coarse-grained semantic kernels, whose kernel size $s _ { c }$ is much larger than s. Then we compute the LSE of the relevance scores between query tokens and coarse-grained semantic kernels. The computational and memory access costs of this method require only $\frac { s } { s _ { c } }$ of the original approach.

Top-K 选择是 InfLLM v2 处理长上下文时的瓶颈。为降低计算成本，我们提出一种高效的 LSE 近似方法。不去计算 query token 与所有语义核的点积，而是引入粗粒度语义核来近似 LSE 值，其核大小 $s_c$ 远大于 s. 然后计算 query token 与粗粒度语义核之间相关性得分的 LSE。这种方法的计算和访存成本只有原方法的 $s/s_c$。

## 2.1.3 Design Principles for Trainable Sparse Attention（可训练稀疏注意力的设计原则）

With the development of those applications requiring long-context processing and deep reasoning abilities, trainable sparse attention mechanisms show great potential to improve the efficiency of pre-training and inference. In this section, we discuss several key features and design principles for InfLLM v2. We hope these discussions can promote future advancements of trainable sparse attention mechanisms.

随着需要长上下文处理和深度推理能力的应用不断发展，可训练的稀疏注意力机制在提升预训练和推理效率上显示出很大潜力。本节讨论 InfLLM v2 的几个关键特性和设计原则，希望这些讨论能推动可训练稀疏注意力机制的后续发展。

**Complexity Analysis** InfLLM v2 enables each token to compute attention with only the top-k key-value blocks, significantly reducing the computational and memory access overhead of attention mechanisms. In this paragraph, we analyze the computational and memory access complexity of InfLLM $\mathrm { v 2 }$ . In stage 1, we need to calculate relevance scores between the query token and each semantic kernel. For a query token with the context length l, there are $\left\lfloor \frac { l } { s } \right\rfloor$ semantic kernels. Therefore, this query token requires $\left\lfloor \frac { l } { s } \right\rfloor$ vector multiplications and memory accesses. In stage 2, we need to compute the relevance scores between the query token and k key-value blocks. During this process, the query token requires 2km vector multiplications and memory accesses. Compared to dense attention mechanisms, which require 2l vector operations and memory accesses, when the sequence is very long $( l \gg m )$ , InfLLM v2 can reduce computational overhead and memory accesses to $\frac { 1 } { s } .$ We can see that the computational complexity of stage 1 remains $O ( l ^ { 2 } )$ , while the computational complexity of stage 2 is $O ( l )$ . Thus, if we want to further improve the efficiency of sparse attention, we are supposed to devote more efforts to relevant blocks retrieval.

**复杂度分析** InfLLM v2 让每个 token 只与 top-k 个 key-value 块计算注意力，大幅降低注意力机制的计算和访存开销。这里分析 InfLLM v2 的计算和访存复杂度。第 1 阶段要计算 query token 与每个语义核的相关性得分。对上下文长度为 l 的 query token，共有 $\lfloor l/s\rfloor$ 个语义核，所以该 query token 需要 $\lfloor l/s\rfloor$ 次向量乘法和访存。第 2 阶段要计算 query token 与 k 个 key-value 块之间的注意力（原文此处写作 relevance scores），这一过程需要 2km 次向量乘法和访存。稠密注意力需要 2l 次向量运算和访存；当序列非常长（$l\gg m$）时，InfLLM v2 能把计算开销和访存降到 $1/s$。可以看到，第 1 阶段的计算复杂度仍是 $O(l^2)$，第 2 阶段是 $O(l)$。所以想进一步提升稀疏注意力的效率，应当把更多精力放在相关块的检索上。

> **停一下：** 稠密是 2l 次，稀疏是 l/s 加 2km 次，比值怎么会是 1/s?
> 按本文第 9 页自己给的计数，第 1 阶段每个 query 做 ⌊l/s⌋ 次，第 2 阶段做 2km 次，稠密做 2l 次（K 和 V 各一遍）。l 远大于 km 时 2km 可以忽略，比值是（l/s）/(2l) = 1/(2s)，不是 1/s. 只有把稠密那边按 key 一侧的 l 次点积来数，才得到 1/s. 正文没交代口径，两种读法差一个 2 倍。结论方向不受影响：第 10 页给出 s = 16，长序列下主要开销在第 1 阶段，它对每个 query 仍随 l 线性增长 (整条序列累计 O(l^2))，所以第 9 页前一段才要用粗粒度核把第 1 阶段再压到 s/s_c。

**Different Granularity for Query and Key-Value Tokens** In InfLLM $\mathrm { v 2 } ,$ we allow each query token to compute attention with different key-value blocks. Here, the computational unit for queries is token-level, while the computational unit for key-values is block-level. Many previous sparse attention approaches (Xu et al., 2025; Zhang et al., 2025a) also segment the query sequence into blocks, where all query tokens within a block share the same top-k key-value blocks. However, query blocking operations can only accelerate long-sequence prefilling but cannot speed up the decoding process, as decoding requires token-by-token generation, and in most cases, query tokens cannot form a complete block. Therefore, using block-level units for queries during training leads to training-inference inconsistency during decoding, which subsequently degrades model performance.

**query 与 key-value 采用不同粒度** 在 InfLLM v2 中，每个 query token 可以与不同的 key-value 块计算注意力。也就是说，query 的计算单元是 token 级，key-value 的计算单元是块级。此前很多稀疏注意力方法也把 query 序列切块，块内所有 query token 共享同一批 top-k key-value 块。但 query 分块只能加速长序列预填充，加速不了解码：解码是逐 token 生成的，多数情况下 query token 凑不成完整的块。所以训练时对 query 用块级单元，会导致解码时训练与推理不一致，进而损害模型性能。

**Trainable Context Selection** In sparse attention mechanisms, the top-k selection operation is non-differentiable. This means that the representation of semantic kernels cannot be optimized through the sparse attention computation in stage 2. Therefore, in InfLLM v2, we choose to use mean pooling, a parameter-free operation, to construct the representation of semantic kernels. Additionally, mean pooling has the advantage of ensuring that the representation of semantic kernels remains in the same semantic space as token-level key vectors. In this way, we can indirectly optimize the representation of semantic kernels by optimizing token-level key vectors. NSA (Yuan et al., 2025) employs a compressed attention mechanism, adding the output of context selection to the attention output, thereby enabling optimization of block representations. However, this operation adds significant overhead for short texts. In contrast, the mean pooling operation adopted by InfLLM v2 does not affect efficiency for short texts, offering greater practical value.

**可训练的上下文选择** 稀疏注意力中的 top-k 选择操作不可微。这意味着语义核的表示无法通过第 2 阶段的稀疏注意力计算得到优化。因此在 InfLLM v2 中，我们选择用无参数的均值池化来构建语义核的表示。均值池化还有一个好处：它保证语义核的表示与 token 级 key 向量处在同一语义空间。这样，优化 token 级 key 向量，就能间接优化语义核的表示。NSA 采用压缩注意力机制，把上下文选择的输出加到注意力输出上，从而能优化块表示。但这一操作给短文本增加了不小的开销。相比之下，InfLLM v2 采用的均值池化不影响短文本的效率，更有实用价值。

**Hyper-Parameter Recommendation** Efficient training and inference of sparse attention mechanisms require highly coordinated algorithm design and operator design. Therefore, from the perspectives of algorithmic effectiveness and hardware constraints, the hyperparameter design in InfLLM v2 needs to satisfy certain

**超参数建议** 稀疏注意力的高效训练与推理，需要算法设计和算子设计高度配合。因此从算法效果和硬件约束两个角度看，InfLLM v2 的超参数设计需要满足一定

<!-- page 10 of 44 -->

MiniCPM4

3 OpenBMB

![Image block](images/p10-figure-3-the-illustration-of-high-quality-data.png)

Figure 3: The illustration of high-quality data filtering pipelines. Traditional model-based data filtering methods (a) and (b) rely on human expertise for seed data selection and lack data quality verification.

图 3：高质量数据过滤流水线示意图。传统的基于模型的数据过滤方法（a）和（b）依赖人工经验挑选种子数据，且缺少对数据质量的验证。

图中三条流水线。（a）基于 LLM 标注：数据池经 LLM 标注出种子，训练分类器，再训练 LLM，产出高质量数据。（b）基于人工种子：人工挑选种子，其余同（a）。（c）基于高效验证：种子池先经 「Efficient Verification」 筛出高质量种子，与数据池一起形成种子配方，训练分类器；分类器的过滤结果再过一遍高效验证，不通过（No）就回头调整（Adjust）配方，通过（Yes）才产出高质量数据，并反过来更新（Update）高质量种子。右上角框内画的是高效验证本身：1B LLM 用 WSD 训练 1.1T token 得到预训练模型，再做两阶段退火，共 10B token，其中 70% 是默认混合数据，30% 是待验证数据。

conditions. Regarding the choice of semantic kernel size, smaller kernel sizes enable more precise relevance score computation; however, smaller kernel sizes also incur greater computational overhead. Thus, to achieve a good balance between effectiveness and efficiency, we chose to set the kernel size to 32 and the stride to 16. Constrained by the Matrix Multiplication Accumulation instructions of GPU tensor cores, a query group must contain at least 16 heads to ensure hardware is fully utilized.

条件。关于语义核大小的选择：核越小，相关性得分算得越准，但计算开销也越大。为了在效果和效率之间取得平衡，我们把核大小设为 32，步长设为 16。受 GPU tensor core 矩阵乘累加（MMA）指令的约束，一个 query 组至少要包含 16 个 head，硬件才能被充分利用。

> **问：** 16 个 head 是说 GQA 每组至少 16 个 query head 吗？MiniCPM4 的 head 配置是多少？
> 本文第 10 页原话是 「a query group must contain at least 16 heads」，照字面就是共享同一个 KV head 的一组 query head 至少 16 个，原因是 MMA 指令的矩阵形状下限。但全文 44 页没有列出 MiniCPM4-8B 或 0.5B 的层数，隐藏维度，query head 数或 KV head 数；第 8 页只说 「当前 LLM 通常采用 GQA」，第 29 页只说基础架构是 µP. 块大小 m 和选块数 k 也没有直接给出，只有第 31 页 「每个 token 只需关注 6K 个上下文 token」 可以当作 k 乘 m 的量级。所以这条约束在 MiniCPM4 上具体怎么满足，本文给不出答案，能确定的只是 「每组至少 16 个 head」 这个设计条件本身。

## 2.2 UltraClean: High-Quality Pre-Training Data Filtering and Generation（UltraClean：高质量预训练数据的过滤与生成）

With the rapid development of LLMs, data quality has become one of the key factors in improving model performance. Therefore, to enhance the capability density of MiniCPM4, we conduct extensive data engineering, including filtering high-quality knowledge-intensive data from massive internet sources and utilizing existing LLMs to generate high-quality reasoning-intensive data. Specifically, we introduce UltraClean, an efficient pre-training filtering technology, based on which we can achieve comparable performance with Qwen3-8B trained with 36 trillion tokens using only 8 trillion tokens.

随着 LLM 快速发展，数据质量已经成为提升模型性能的关键因素之一。因此，为提升 MiniCPM4 的能力密度，我们做了大量数据工程，包括从海量互联网来源中过滤出高质量知识密集型数据，以及用现有 LLM 生成高质量推理密集型数据。具体来说，我们提出高效的预训练过滤技术 UltraClean，借助它只用 8 万亿 token 就达到了用 36 万亿 token 训练的 Qwen3-8B 的相当水平。

## 2.2.1 High-Quality Knowledge-Intensive Data Filtering（高质量知识密集型数据过滤）

With the rapid development of LLMs, data quality has become one of the key factors for improving model performance. Leveraging model-based classifiers to filter data and extract high-quality knowledge-intensive samples can not only enhance model effectiveness but also reduce training costs by achieving better performance with fewer tokens. However, current approaches still face two major challenges: (1) the lack of efficient data verification strategies makes it difficult to provide timely feedback on data quality; (2) the selection of seed data for training classifiers lacks clear standards and heavily relies on human expertise, which introduces subjective biases. To address these issues, we propose an efficient data verification strategy that can rapidly evaluate the actual impact of data on LLM training at minimal computational costs. Building on this, we optimize the positive and negative sample selection process based on the hypothesis that high-quality seed data contributes to better LLM performance, and construct an efficient data filtering pipeline. Our approach yields a more robust and higher-quality knowledge-intensive classifier, while also significantly improving the overall quality of pre-training data.

随着 LLM 快速发展，数据质量已经成为提升模型性能的关键因素之一。用基于模型的分类器过滤数据，抽取高质量的知识密集型样本，不仅能提升模型效果，还能用更少的 token 取得更好的性能，从而降低训练成本。但现有方法仍面临两大挑战：（1）缺少高效的数据验证策略，难以及时反馈数据质量；（2）训练分类器所用的种子数据缺少明确的选择标准，严重依赖人工经验，会带入主观偏差。为解决这些问题，我们提出一种高效的数据验证策略，能以极低的计算成本快速评估数据对 LLM 训练的实际影响。在此基础上，基于 「高质量种子数据能带来更好的 LLM 性能」 这一假设，我们优化了正负样本的选择流程，构建了高效的数据过滤流水线。这种方法得到了更鲁棒，质量更高的知识密集型分类器，也大幅提升了预训练数据的整体质量。

**Overall Workflow** The overall workflow is illustrated in Figure 3(c). We begin by applying the efficient verification strategy to evaluate the initial pool of candidate seed samples, selecting high-quality data that significantly improves training performance as positive seeds for classifier training. Meanwhile, negative samples are randomly drawn from the raw data pool to construct a balanced training set. To more efficiently assess the actual effectiveness of the classifier, we also apply an efficient verification strategy to evaluate its filtering results. Based on the feedback from verification, we iteratively update the high-quality seed pool, dynamically adjust the ratio of positive to negative samples, and fine-tune the training hyperparameters of the classifier, thereby continuously optimizing the data filtering strategy. Only classifiers demonstrating stable and reliable performance under efficient verification are used for large-scale data filtering and subsequent

**整体流程** 整体流程如图 3(c) 所示。我们先用高效验证策略评估初始的候选种子样本池，选出能明显提升训练表现的高质量数据，作为训练分类器的正样本种子。同时从原始数据池随机抽取负样本，构成平衡的训练集。为了更高效地评估分类器的实际效果，我们也用高效验证策略评估它的过滤结果。根据验证反馈，我们迭代更新高质量种子池，动态调整正负样本比例，并微调分类器的训练超参数，持续优化数据过滤策略。只有在高效验证下表现稳定可靠的分类器，才会被用于大规模数据过滤和后续

<!-- page 11 of 44 -->

MiniCPM4

3 OpenBMB

Table 1: The comparison of the computational costs across different verification strategies on an LLM with 1B parameters.

表 1：在 1B 参数 LLM 上，不同验证策略的计算成本对比。从头训练 100B token 需 1,200 GPU 小时，从头训练 380B token 需 4,600 GPU 小时，高效验证策略只需 110 GPU 小时。

|  | 100B from scratch | 380B from scratch | Efficient verification Strategy |
| --- | --- | --- | --- |
| GPU Hours | 1,200 | 4,600 | 110 |

model training. It is worth emphasizing that the final high-quality classifier is applied to the entire web-scale pre-training dataset to extract high-quality knowledge-intensive training samples, fundamentally improving the efficiency and effectiveness of large-scale model training.

模型训练。需要强调的是，最终的高质量分类器会被应用到整个 web 规模的预训练数据集上，抽取高质量的知识密集型训练样本，从根本上提升大规模模型训练的效率和效果。

**Efficient Verification Strategy** Under limited token budgets, performance differences in LLM training often fail to reach statistical significance, and the inherent instability of the training process further undermines the reliability of verification results. Effective verification of pre-training data typically requires at least 100B tokens. As shown in Table 1, training 100B tokens on an LLM with 1B parameters requires approximately 1,200 GPU hours, equivalent to running 64 GPUs continuously for nearly 19 hours. Such high computational costs make it impractical to perform efficient verification during the iterative development of high-quality data classifiers. To address this, we draw inspiration from the design of Llama 3.1 (Dubey et al., 2024) and propose an efficient verification strategy. Specifically, we pre-train a 1B-parameter LLM using the WSD scheduler (Hu et al., 2024), covering a total of 1.1 trillion (T) tokens. This includes a stable training phase over 1T tokens and a decay phase over an additional 0.1T tokens. On this foundation, we introduce a two-stage annealing training process, where fine-tuning is conducted on 10B tokens, with 30% of the data reserved for validation and the remaining 70% following the default mixed-data ratio. Compared to the full training cost of 1,200 GPU hours, this strategy reduces training time to approximately 110 hours (i.e., fewer than 3.5 hours on 32 GPUs), significantly lowering computational demands and greatly improving the efficiency and iterability of the data filtering pipeline. We use a two-stage annealing training process with the original mixed-data ratio as a comparison baseline. This verification strategy enables efficient evaluation of the impact of candidate data on model training across multiple metrics, balancing accuracy and cost-effectiveness, and providing a practical and closed-loop optimization path for the data selection process.

**高效验证策略** 在有限的 token 预算下，LLM 训练中的性能差异往往达不到统计显著，训练过程本身的不稳定也会进一步削弱验证结果的可靠性。有效验证预训练数据通常至少需要 100B token。如表 1 所示，在 1B 参数的 LLM 上训练 100B token 大约需要 1,200 GPU 小时，相当于 64 张 GPU 连续运行将近 19 小时。如此高的计算成本，让高质量数据分类器在迭代开发中做高效验证变得不现实。为此，我们借鉴 Llama 3.1 的设计，提出一种高效验证策略。具体来说，我们用 WSD 调度器预训练一个 1B 参数的 LLM，总共 1.1 万亿（T）token，其中稳定训练阶段 1T token，衰减阶段再加 0.1T token。在此基础上，我们引入两阶段退火训练，在 10B token 上微调，其中 30% 的数据留给待验证的候选数据，其余 70% 沿用默认的混合数据配比。与 1,200 GPU 小时的完整训练成本相比，这一策略把训练时间降到约 110 小时（即 32 张 GPU 不到 3.5 小时），大幅降低计算需求，也大大提高了数据过滤流水线的效率和可迭代性。我们用原始混合数据配比的两阶段退火训练作为对照基线。这种验证策略能在多项指标上高效评估候选数据对模型训练的影响，兼顾准确性和成本，为数据选择过程提供了实用的闭环优化路径。

**Classifier Training Recipes** Currently, the selection of positive seed samples for classifier training primarily relies on LLM scoring or manual curation. However, the former is susceptible to biases inherent in LLMs, which may introduce systematic noise and annotation artifacts, while the latter depends heavily on human expertise and lacks rigorous evaluation of seed data effectiveness. Moreover, the reliability of manual selection is often judged indirectly through the downstream performance of LLMs trained on the filtered data, making the verification process both expensive and indirect. These limitations hinder the adaptability and generalization ability of classifiers across different tasks. To address this, we propose a core hypothesis: high-quality seed data that can improve LLM performance should also be beneficial for training classifiers capable of identifying high-quality training samples. As shown in Figure 3(c), we first apply our efficient verification strategy to the initial pool of candidate seed samples and select those that yield significant performance gains in LLM training as positive samples for classifier training. We evaluate a large number of candidate seeds and ultimately curate a set of high-quality, empirically verified positive samples. These include: high-quality in-domain data with LLM scores above 4, instruction-formatted datasets (e.g., OH-2.5 and ELI5), real-world educational materials, LLM-synthesized textbook-style content, and curated high-quality web data. This process not only ensures the overall quality of positive samples but also significantly improves filtering efficiency, providing a strong foundation for classifier training. To enhance classifier robustness, we construct negative samples using raw data from diverse sources. English negative samples are drawn from FineWeb, C4, Dolma, The Pile, and RedPajama, while Chinese negatives include CCI3, ChineseWebtext, and other mainstream corpora. Experimental results further demonstrate that incorporating diversified data sources for negative samples significantly improves classifier generalization and cross-domain adaptability. After the initial training, we adopt an iterative training mechanism: the positive and negative samples inferred by the current classifier version are used as new training data for the next round, continuously optimizing classifier performance. Through this iterative process, we further improve the precision and stability of the classifier for large-scale data filtering tasks.

**分类器训练配方** 目前，训练分类器所用正样本种子的选择主要依赖 LLM 打分或人工整理。前者容易受 LLM 自身偏差影响，可能引入系统性噪声和标注伪迹；后者严重依赖人工经验，缺少对种子数据有效性的严格评估。而且，人工选择是否可靠，通常只能间接地通过在过滤后数据上训练的 LLM 的下游表现来判断，验证过程既昂贵又间接。这些局限妨碍了分类器在不同任务间的适应和泛化能力。为此我们提出一个核心假设：能提升 LLM 性能的高质量种子数据，也应当有利于训练出能识别高质量训练样本的分类器。如图 3(c) 所示，我们先用高效验证策略评估初始候选种子池，选出在 LLM 训练中带来明显性能提升的样本，作为分类器训练的正样本。我们评估了大量候选种子，最终整理出一组经实证验证的高质量正样本，包括：LLM 打分高于 4 的高质量领域内数据，指令格式的数据集（例如 OH-2.5 和 ELI5），真实的教育材料，LLM 合成的教科书风格内容，以及精选的高质量网页数据。这一流程既保证了正样本的整体质量，也大幅提高了过滤效率，为分类器训练打下坚实基础。为增强分类器的鲁棒性，我们用来源多样的原始数据构造负样本。英文负样本取自 FineWeb，C4，Dolma，The Pile 和 RedPajama，中文负样本包括 CCI3，ChineseWebtext 等主流语料。实验结果进一步表明，负样本来源多样化能明显提升分类器的泛化和跨领域适应能力。初始训练后，我们采用迭代训练机制：当前版本分类器推断出的正负样本，作为下一轮的新训练数据，持续优化分类器性能。通过这一迭代过程，我们进一步提高了分类器在大规模数据过滤任务中的精度和稳定性。

**FastText-based Quality Filtering** Current high-quality data classifiers can be broadly categorized into LLM-based approaches (Penedo et al., 2024; Yu et al., 2025b) and fastText-based methods (Li et al., 2024b; Shao et al., 2024b). While LLM-based classifiers generally offer strong performance, they incur significantly higher inference costs. To address this, we adopt a fastText-based classifier, which drastically reduces inference overhead while maintaining competitive performance under certain conditions. This approach not only minimizes resource consumption but also accelerates the iteration cycle of data filtering experiments.

**基于 fastText 的质量过滤** 现有的高质量数据分类器大致分为基于 LLM 的方法和基于 fastText 的方法。基于 LLM 的分类器通常效果强，但推理成本高得多。为此我们采用基于 fastText 的分类器，大幅降低推理开销，同时在一定条件下保持有竞争力的效果。这种做法既减少资源消耗，也加快了数据过滤实验的迭代周期。

<!-- page 12 of 44 -->

MiniCPM4

3 OpenBMB

Table 2: The comparison of individual results on English and Chinese datasets.

表 2：英文和中文数据集上各项结果的对比。上半部分是英文，三列为 FineWeb，FineWeb-edu，UltraFineWeb-en，后两列里带加减号的数字是相对 FineWeb 的差值；下半部分是中文，三列为 Chinese-FineWeb，Chinese-FineWeb-edu-v2，UltraFineWeb-zh，差值相对 Chinese-FineWeb。

| Metrics | FineWeb | FineWeb-edu | UltraFineWeb-en |
| --- | --- | --- | --- |
| MMLU | 28.84 | 31.80+2.96 | 32.24+3.40 |
| ARC-C | 25.17 | 34.56+9.39 | 35.67+10.50 |
| ARC-E | 59.18 | 69.95+10.77 | 70.62+11.44 |
| CommonSenseQA | 34.32 | 31.53-2.79 | 36.45+2.13 |
| HellaSwag | 42.91 | 42.17-0.74 | 42.76-0.15 |
| OpenbookQA | 22.20 | 25.20+3.00 | 26.20+4.00 |
| PIQA | 73.29 | 72.14-1.15 | 73.67+0.38 |
| SIQA | 38.95 | 38.13-0.82 | 39.61+0.66 |
| Winogrande | 55.64 | 55.56-0.08 | 55.80+0.16 |
| Average | 42.28 | 44.56+2.282 | 45.89+3.613 |
| Metrics | Chinese-FineWeb | Chinese-FineWeb-edu-v2 | UltraFineWeb-zh |
| C-Eval | 33.95 | 34.17+0.22 | 34.26+0.31 |
| CMMLU | 32.41 | 34.93+2.52 | 36.06+3.65 |
| Average | 33.18 | 34.55+1.37 | 35.16+1.98 |

For example, processing 15 trillion (15T) tokens using an LLM-based classifier requires approximately 6,000 hours on GPUs, whereas fastText can complete the same task on a non-GPU server using 80 CPUs in under 1,000 hours, offering a substantial efficiency gain. Notably, most of our large-scale experiments are conducted on a distributed Spark cluster <sup>1</sup>. In the data preprocessing stage, we apply a series of essential steps, including the removal of redundant blank lines and excessive whitespace, stripping of diacritics, and normalization of English text to lowercase. We use the tokenizer from DeepSeek-V2 (Liu et al., 2024a), which outperforms traditional tokenization methods (e.g., space-based tokenization for English and Jieba for Chinese <sup>2</sup>). At the same time, we preserve structural tokens such as \n, \t, and \r. For training, we configure the fastText classifier with the following hyperparameters: the vector dimension is set to 256, the learning rate is set to 0.1, the maximum n-gram length is set to 3, the minimum word frequency is set to 5, and the number of training epochs is set to 3. During inference, we adopt the default classification threshold of 0.5 to simplify the workflow and ensure consistency across experiments, avoiding the need for additional hyperparameter tuning. During inference, we adopt a default classification threshold of 0.5 to simplify the workflow and ensure consistency across experiments, avoiding additional hyperparameter tuning.

例如，用基于 LLM 的分类器处理 15 万亿（15T）token 大约需要 6,000 GPU 小时，而 fastText 在一台非 GPU 服务器上用 80 个 CPU 不到 1,000 小时就能完成同样的任务，效率提升很可观。值得一提的是，我们大部分大规模实验都在分布式 Spark 集群上进行。在数据预处理阶段，我们做了一系列必要步骤，包括删除多余空行和过多空白，去掉变音符号，以及把英文文本统一为小写。我们使用 DeepSeek-V2 的分词器，它优于传统分词方法（例如英文按空格切分，中文用 Jieba 分词）。同时保留 \n，\t 和 \r 这类结构性 token。训练时，fastText 分类器的超参数配置为：向量维度 256，学习率 0.1，最大 n-gram 长度 3，最小词频 5，训练 3 个 epoch。推理时采用默认分类阈值 0.5，以简化流程并保证各实验之间的一致性，省去额外的超参数调优。（原文把推理阈值这句重复写了两遍。）

**Results and Analysis** In our experiments, we utilize the MiniCPM-1.2B model architecture with the MiniCPM3-4B tokenizer. Each experiment involves training on approximately 100B tokens. We employ the Lighteval library (Fourrier et al., 2023) for model evaluation, mirroring the setup used with FineWeb (Penedo et al., 2024) and CCI3-HQ (Wang et al., 2024a). All evaluation metrics are based on a zero-shot setting. As shown in Table 2, on the English metrics, UltraFineWeb-en demonstrates significant improvements in performance on multiple tasks, including MMLU, ARC-C, ARC-E, CommonSenseQA, and OpenBookQA. Specifically, UltraFineWeb outperforms FineWeb in these tasks, with only a slight drop of 0.15 percentage points (pp) in HellaSwag compared to FineWeb, but a 0.6pp improvement over FineWeb-edu. The English average score for UltraFineWeb-en (45.891pp) is 3.61pp higher than that of FineWeb (42.287pp) and 1.3pp higher than FineWeb-edu (44.560pp). On the Chinese metrics, UltraFineWeb-zh also outperforms both FineWeb-zh and FineWeb-edu-zh on C-Eval and CMMLU. Specifically, UltraFineWeb-zh improves by 0.31pp and 3.65pp over Chinese FineWeb and Chinese FineWeb-edu-v2 on C-Eval and CMMLU, respectively, and by 0.09pp and 0.13pp compared to FineWeb-edu-zh. The Chinese average score for UltraFineWeb-zh increases by 1.98pp and 0.61pp, respectively, compared to FineWeb-zh and FineWeb-edu-zh. These results indicate that our proposed High-Quality Data Filtering Pipeline significantly improves data quality, leading to notable improvements in model performance.

**结果与分析** 实验中，我们使用 MiniCPM-1.2B 的模型架构和 MiniCPM3-4B 的分词器。每组实验训练约 100B token。我们用 Lighteval 库做模型评测，设置与 FineWeb 和 CCI3-HQ 一致。所有评测指标都是 zero-shot 设定。如表 2 所示，在英文指标上，UltraFineWeb-en 在 MMLU，ARC-C，ARC-E，CommonSenseQA 和 OpenBookQA 等多项任务上明显提升。具体来说，UltraFineWeb 在这些任务上都超过 FineWeb，只在 HellaSwag 上比 FineWeb 略低 0.15 个百分点（pp），但比 FineWeb-edu 高 0.6pp. UltraFineWeb-en 的英文平均分（45.891pp）比 FineWeb (42.287pp) 高 3.61pp，比 FineWeb-edu (44.560pp) 高 1.3pp。在中文指标上，UltraFineWeb-zh 在 C-Eval 和 CMMLU 上也同时超过 FineWeb-zh 和 FineWeb-edu-zh。具体来说，UltraFineWeb-zh 在 C-Eval 和 CMMLU 上分别比 Chinese FineWeb 和 Chinese FineWeb-edu-v2 提升 0.31pp 和 3.65pp，比 FineWeb-edu-zh 分别提升 0.09pp 和 0.13pp. UltraFineWeb-zh 的中文平均分相对 FineWeb-zh 和 FineWeb-edu-zh 分别提高 1.98pp 和 0.61pp。这些结果表明，我们提出的高质量数据过滤流水线明显提升了数据质量，带来显著的模型性能提升。

> **核对：** 这段正文里的几个差值，和表 2 里的数对得上吗？
> 用本文第 12 页表 2 自己算。英文九项平均：FineWeb 42.278，FineWeb-edu 44.560，UltraFineWeb-en 45.891，差值 2.282 和 3.613 与表中一致；正文把 FineWeb 写成 42.287，是后两位数字写反了，3.61 这个差值本身没错。HellaSwag 上 UltraFineWeb-en 比 FineWeb-edu 高 42.76 - 42.17 = 0.59，正文的 0.6pp 是取整。中文部分有两处岔子：UltraFineWeb-zh 的 C-Eval 34.26，CMMLU 36.06，与 Chinese-FineWeb (33.95, 32.41) 相比才是 0.31 和 3.65，正文却写成 「分别比 Chinese FineWeb 和 Chinese FineWeb-edu-v2」；与 Chinese-FineWeb-edu-v2 (34.17, 34.93) 相比，C-Eval 差 0.09 对得上，CMMLU 差 1.13，正文写成了 0.13。平均分的 1.98 和 0.61 与表一致（35.16 - 33.18, 35.16 - 34.55）。正文里的 FineWeb-zh 和 FineWeb-edu-zh 就是表里的 Chinese-FineWeb 和 Chinese-FineWeb-edu-v2。

<small><span class="docvortex-page-footnote" data-block-type="page_footnote" style="color:#6b7280"><sup>1</sup>[https://spark.apache.org/](https://spark.apache.org/)</span></small>

脚注 1: Apache Spark 官网。

<small><span class="docvortex-page-footnote" data-block-type="page_footnote" style="color:#6b7280"><sup>2</sup>[https://pypi.org/project/jieba/](https://pypi.org/project/jieba/)</span></small>

脚注 2: Jieba 分词在 PyPI 上的页面。

<!-- page 13 of 44 -->

MiniCPM4

OpenBMB

## 2.2.2 High-Quality Reasoning-Intensive Data Generation（高质量推理密集型数据生成）

In the pre-training process of building high-performance LLMs, reasoning ability is widely considered to be one of the core indicators of general intelligence. The development of this ability largely depends on the quality, structure, and knowledge density of pre-training data. However, current typical pre-training corpora, such as Common Crawl and large-scale web-crawled datasets, still face significant challenges in supporting complex reasoning skills. Specifically, two core issues are commonly observed in existing corpora: (1) Although web data features diverse linguistic forms and broad coverage, much of it consists of advertisements, template texts, superficial dialogues, and various redundant information. These contents typically exhibit low knowledge density and weak logical structure. Even with high-quality data classifiers for filtering, the extracted content often lacks accurate reasoning chains and systematic knowledge organization, making it difficult for models to acquire transferable thought patterns and reasoning paradigms. (2) Current data construction processes have a clear scale-depth trade-off. The corpora for training LLMs heavily rely on long-tail content with low information density to pursue broad coverage and diversity. In contrast, truly structured and knowledge-rich texts, such as textbooks, academic materials, and systematically explanatory content, constitute only a small fraction. This imbalanced data structure limits the model’s ability to learn deep semantic relationships and complex logical structures. As a result, while models may generate fluent language, they often lack depth in reasoning and may even produce hallucinations in reasoning-intensive tasks.

在构建高性能 LLM 的预训练过程中，推理能力被普遍视为通用智能的核心指标之一。这种能力的形成很大程度上取决于预训练数据的质量，结构和知识密度。然而，目前典型的预训练语料，比如 Common Crawl 和大规模网页爬取数据集，在支撑复杂推理技能方面仍面临明显挑战。具体来说，现有语料普遍存在两个核心问题：（1）网页数据语言形式多样，覆盖面广，但其中很大一部分是广告，模板文本，浅层对话和各类冗余信息。这些内容通常知识密度低，逻辑结构弱。即使用高质量数据分类器过滤，抽出来的内容也常常缺少准确的推理链和系统的知识组织，模型难以从中习得可迁移的思维模式和推理范式。（2）当前的数据构建流程存在明显的规模与深度之间的取舍。为追求广覆盖和多样性，训练 LLM 的语料严重依赖信息密度低的长尾内容。相比之下，真正结构化，知识丰富的文本，如教科书，学术材料和系统性讲解内容，只占很小一部分。这种失衡的数据结构限制了模型学习深层语义关系和复杂逻辑结构的能力。结果是，模型或许能生成流畅的语言，但推理上常常缺乏深度，在推理密集型任务中甚至会产生幻觉。

To address these challenges, we propose a high-quality, reasoning-intensive data generation pipeline to improve reasoning capabilities. This task-oriented and training-efficient pipeline integrates seed data selection with structured data curation and generation. Through multi-round iteration, we gradually build pretraining data that is high in knowledge density, clearly structured, logically coherent, and linguistically diverse. This not only improves model performance on general benchmarks, but also fosters stronger reasoning transferability and generalization at a foundational capability level.

为应对这些挑战，我们提出一条高质量，推理密集型的数据生成流水线来提升推理能力。这条面向任务，训练高效的流水线把种子数据选择与结构化的数据整理和生成结合起来。通过多轮迭代，我们逐步构建出知识密度高，结构清晰，逻辑连贯，语言多样的预训练数据。这不仅提升了模型在通用基准上的表现，也在基础能力层面带来更强的推理迁移和泛化。

**Seed Data Selection** For selecting seed data, we focus on two core objectives: high knowledge density and domain diversity. On the one hand, we leverage the high-quality data classifier built on the UltraFineWeb dataset to filter out knowledge-intensive, logically complete, and well-structured content from large-scale web corpora. The selected content can serve as high-quality seed data for general domains. These data fragments exhibit strong contextual coherence and conceptual richness, offering structured linguistic templates and knowledge expressions for synthetic models. On the other hand, to support higher-order domain-specific reasoning capabilities, we conduct manual curation targeting key fields such as mathematics, programming, and natural sciences. We select high-quality open-source web content, textbooks, and QA materials as domain-specific seeds. These resources typically feature highly structured expressions and clear knowledge organization. By combining automated filtering with human curation, we construct a seed pool that balances generality and specialization, laying a solid foundation for subsequent reasoning-intensive data generation.

**种子数据选择** 选择种子数据时，我们聚焦两个核心目标：高知识密度和领域多样性。一方面，我们利用基于 UltraFineWeb 数据集构建的高质量数据分类器，从大规模网页语料中筛出知识密集，逻辑完整，结构良好的内容，作为通用领域的高质量种子数据。这些数据片段上下文连贯，概念丰富，为合成模型提供结构化的语言模板和知识表达。另一方面，为支撑更高阶的领域推理能力，我们针对数学，编程和自然科学等关键领域做人工整理，挑选高质量的开源网页内容，教科书和问答材料作为领域种子。这些资源通常表达高度结构化，知识组织清晰。把自动过滤和人工整理结合起来，我们构建了一个兼顾通用性与专业性的种子池，为后续的推理密集型数据生成打下坚实基础。

**Structured Data Curation and Generation** To effectively enhance the knowledge density and reasoning capabilities, we design a structured data curation and generation mechanism centered on clear structure, semantic richness, and logical progression. Traditional web corpora often present information in fragmented and unstructured forms. To address this, we adopt a structure-first principle, using open-source LLMs under 10B parameters to automatically edit and restructure web text. Key operations include denoising and cleansing, semantic integration, and logical completion, resulting in mid-length to short-length passages that are well-formed, logically coherent, and hierarchically organized.

**结构化数据整理与生成** 为有效提升知识密度和推理能力，我们设计了一套以结构清晰，语义丰富，逻辑递进为核心的结构化数据整理与生成机制。传统网页语料常以碎片化，非结构化的形式呈现信息。为此我们采用 「结构优先」 原则，用 10B 参数以下的开源 LLM 自动编辑和重组网页文本。关键操作包括去噪清洗，语义整合和逻辑补全，最终得到格式规范，逻辑连贯，层次分明的中短篇段落。

Additionally, based on high-quality open-source web corpora, textbooks, and QA materials, we abstract two typical paradigms of knowledge construction (textbook and forum), and develop corresponding synthetic strategies. For the textbook paradigm, we emphasize systematicity and progression, building a layered structure consisting of knowledge points, multi-round explanations, summaries, and practice questions. For the forum paradigm, we simulate authentic user discussions by generating multi-turn QA exchanges and viewpoint debates around a central topic, thereby enhancing diversity and realism. These generation approaches not only preserve high knowledge density but also offer multiple reasoning paths and cognitive frameworks for the model, facilitating the development of more generalized and critical-thinking language models.

此外，基于高质量的开源网页语料，教科书和问答材料，我们抽象出两种典型的知识构建范式（教科书和论坛），并设计了相应的合成策略。教科书范式强调系统性和递进性，构建由知识点，多轮讲解，总结和练习题组成的层级结构。论坛范式模拟真实的用户讨论，围绕一个中心话题生成多轮问答交流和观点辩论，增强多样性和真实感。这些生成方式既保持了高知识密度，也为模型提供多条推理路径和认知框架，有助于训练出泛化更好，更具批判性思维的语言模型。

Notably, the constructed data are fed back into the original seed pool for subsequent rounds of evolutionary generation. This gives the data generation process a self-enhancing nature, whereby multi-round iterative evolution progressively builds richer and deeper high-quality reasoning corpora, providing the model with continuously optimized training signals and a more resilient cognitive support structure.

值得注意的是，构建出的数据会回流到原始种子池，参与后续轮次的演化式生成。这让数据生成过程具有自我增强的性质：经过多轮迭代演化，逐步构建出更丰富，更深入的高质量推理语料，为模型提供持续优化的训练信号和更有韧性的认知支撑结构。

<!-- page 14 of 44 -->

MiniCPM4

OpenBMB

## 2.2.3 Discussion for Future Training Data（对未来训练数据的讨论）

We systematically introduce the high-quality data construction strategies employed in the pretraining of MiniCPM4, covering high-quality knowledge-intensive data filtering and reasoning-intensive data generation. Without increasing, and in some cases even reducing, the training tokens, we significantly improve the knowledge density and logical complexity of the corpus through automated filtering and structured generation. The experimental results show that this strategy yields performance comparable to, or even surpassing, that of models trained on the full-scale corpus across a range of downstream tasks. In particular, for knowledge-intensive and reasoning-intensive tasks, the optimized data more effectively enhances models’ general capabilities and knowledge transfer abilities, further validating the principle that data quality outweighs data quantity.

我们系统介绍了 MiniCPM4 预训练所用的高质量数据构建策略，涵盖高质量知识密集型数据过滤和推理密集型数据生成。在不增加，某些情况下甚至减少训练 token 的前提下，我们通过自动过滤和结构化生成，明显提升了语料的知识密度和逻辑复杂度。实验结果显示，这一策略在一系列下游任务上取得了与全量语料训练的模型相当，甚至更好的表现。尤其在知识密集和推理密集型任务上，优化后的数据更有效地增强了模型的通用能力和知识迁移能力，进一步验证了 「数据质量胜过数据数量」 的原则。

Despite the promising results, several open questions remain for future exploration. First, the current data filtering and generation pipelines still rely partially on human-designed heuristics. Leveraging the capabilities of LLMs to construct self-supervised mechanisms for data quality assessment and structural optimization is a key direction for improving both efficiency and quality. Second, in the evolutionary generation process, balancing corpus diversity with task relevance remains challenging, requiring finer-grained feedback mechanisms to prevent semantic mode collapse. Lastly, extending this strategy to multilingual, cross-task, and even multimodal settings represents a crucial step toward building the next generation of high-performance foundation models.

尽管结果很有希望，仍有几个开放问题值得未来探索。第一，目前的数据过滤和生成流水线仍部分依赖人工设计的启发式规则。借助 LLM 的能力构建数据质量评估与结构优化的自监督机制，是同时提升效率和质量的关键方向。第二，在演化式生成过程中，平衡语料多样性与任务相关性仍有难度，需要更细粒度的反馈机制来防止语义模式坍缩。最后，把这一策略扩展到多语言，跨任务乃至多模态场景，是构建下一代高性能基础模型的关键一步。

## 2.3 ModelTunnel v2: Efficient Pre-Training Strategy Search（ModelTunnel v2：高效的预训练策略搜索）

Training LLMs requires enormous computational costs, making it a critical challenge to maximize model performance while minimizing computational resource consumption. In our previous work (Hu et al., 2024), we have built a ModelTunnel based on predictable scaling technology. This enables us to search for training strategies on small models and transfer them to train large models, thereby reducing the experimental costs of determining optimal training configurations for large models. During the training process of MiniCPM4, we reuse the relevant configurations from our ModelTunnel and develop ModelTunnel v2, which features improvements for search precision and provides systematic validation of $\mu \mathrm { P ^ { \prime } s }$ effectiveness. Furthermore, to enhance model training efficiency, we implement engineering optimizations in both the pre-training objectives and the infrastructure. Next, we will provide detailed descriptions of these improvements for the pre-training of MiniCPM4.

训练 LLM 需要巨大的计算成本，如何在尽量少消耗算力的同时最大化模型性能，是一项关键挑战。在之前的工作中，我们基于可预测扩展技术搭建了 ModelTunnel。它让我们能在小模型上搜索训练策略，再迁移到大模型的训练上，从而降低为大模型确定最优训练配置的实验成本。在 MiniCPM4 的训练过程中，我们复用 ModelTunnel 的相关配置，开发了 ModelTunnel v2，提升了搜索精度，并系统验证了 µP 的有效性。此外，为提升训练效率，我们在预训练目标和基础设施两方面都做了工程优化。下面详细介绍 MiniCPM4 预训练中的这些改进。

## 2.3.1 Efficient Predictable Scaling with Improved Performance Indicator（用改进的性能指标做高效的可预测扩展）

As model parameter scales continue to increase, the cost of conducting model training experiments rises correspondingly, with a single model training requiring hundreds of thousands of GPU hours. This makes traditional methods like grid search for model training configuration search increasingly impractical. In MiniCPM-1, we systematically construct a ModelTunnel that conducts extensive experiments on models with only millions of parameters to determine optimal hyperparameters. In constructing MiniCPM4, we make improvements in the following aspects:

随着模型参数规模不断增大，做模型训练实验的成本也水涨船高，单次训练就需要数十万 GPU 小时。这让网格搜索这类传统的训练配置搜索方法越来越不现实。在 MiniCPM-1 中，我们系统搭建了 ModelTunnel，在只有数百万参数的模型上做大量实验来确定最优超参数。构建 MiniCPM4 时，我们在以下几方面做了改进：

1) **More Reasonable Performance Indicators** In MiniCPM-1, we use the model’s language model loss on open-source pretraining corpora as the performance indicator, assuming that lower language model loss indicates superior model performance. However, loss on open-source pretraining datasets cannot accurately reflect model performance on downstream tasks. Therefore, we construct ScalingBench and establish the relationship between loss on the ScalingBench and downstream task performance (Xiao et al., 2024a).

1) **更合理的性能指标** 在 MiniCPM-1 中，我们用模型在开源预训练语料上的语言模型 loss 作为性能指标，假定语言模型 loss 越低，模型性能越好。但开源预训练数据集上的 loss 不能准确反映模型在下游任务上的表现。因此我们构建了 ScalingBench，并建立 ScalingBench 上的 loss 与下游任务表现之间的关系。

Since most models trained in the Wind Tunnel have very limited parameters and training data, they often fail to demonstrate non-random performance on downstream tasks, making direct evaluation of small models from the Wind Tunnel on downstream tasks unreliable. Therefore, we attempt to construct an evaluation dataset where the loss correlates well with downstream task performance through a functional mapping relationship. To achieve this goal, we construct ScalingBench from the validation datasets of downstream tasks. In the original downstream datasets, each instance consists of a user instruction and a human-annotated label that usually contains a few words. In ScalingBench, we use GPT-4o (OpenAI, 2023) to generate reasoning steps for all test instances. Then we directly calculate the conditional loss on the reasoning steps and labels, specifically the loss incurred when the model generates answers given task inputs. The loss can serve as a reasonable performance indicator.

风洞（即 ModelTunnel）里训练的模型大多参数和训练数据都非常有限，在下游任务上往往做不出高于随机水平的表现，所以直接用下游任务评测风洞里的小模型并不可靠。为此，我们尝试构建一个评测数据集，使其上的 loss 能通过函数映射与下游任务表现良好相关。为实现这一目标，我们从下游任务的验证集构建 ScalingBench。原始下游数据集中，每个样例由一条用户指令和一个人工标注的标签组成，标签通常只有几个词。在 ScalingBench 中，我们用 GPT-4o 为所有测试样例生成推理步骤，然后直接计算推理步骤和标签上的条件 loss，也就是模型在给定任务输入时生成答案所产生的 loss。这个 loss 可以作为合理的性能指标。

<!-- page 15 of 44 -->

MiniCPM4

3 OpenBMB

![Image block](images/p15-figure-4-the-sigmoid-relationship-between-loss-and.png)

Figure 4: The sigmoid relationship between loss and downstream performance on ScalingBench.

图 4: ScalingBench 上 loss 与下游表现之间的 sigmoid 关系。

图里八个子图：MMLU, CMMLU, CEVAL, BBH, MATH, HUMANEVAL, MBPP, AVERAGE。横轴是 ScalingBench loss，从左到右递减；纵轴是下游表现。浅红圆点是参与拟合的模型，紫色曲线是拟合出的 sigmoid，红色三角是不参与拟合的 7B 和 80B 模型。

To verify the effectiveness of ScalingBench and establish the relationship between the loss and downstream performance, we evaluate the loss and performance of multiple models on ScalingBench. These models are trained by our team at different periods with identical vocabularies, making their losses comparable. The models range from 0.36B to 4B parameters with varying training data sources and scales. All models demonstrate the same trend on ScalingBench: a sigmoid function relationship between ScalingBench loss and downstream performance. As shown in Figure 4, red triangles represent 7B and 80B parameter models that do not participate in function fitting and serve as test points for the curve. Their ScalingBench scores and performance on the corresponding tasks are also consistent with the sigmoid relationship. These results show that our constructed ScalingBench effectively establishes the relationship between loss and downstream task performance, demonstrating that loss on ScalingBench serves as a highly effective performance indicator.

为验证 ScalingBench 的有效性并建立 loss 与下游表现之间的关系，我们在 ScalingBench 上评测了多个模型的 loss 和表现。这些模型是我们团队在不同时期训练的，词表相同，所以 loss 可以相互比较。模型参数从 0.36B 到 4B 不等，训练数据的来源和规模各异。所有模型在 ScalingBench 上呈现相同趋势：ScalingBench loss 与下游表现之间是 sigmoid 函数关系。如图 4 所示，红色三角代表 7B 和 80B 参数的模型，它们不参与函数拟合，作为曲线的检验点。它们的 ScalingBench 分数和对应任务上的表现也符合 sigmoid 关系。这些结果表明，我们构建的 ScalingBench 有效建立了 loss 与下游任务表现之间的关系，说明 ScalingBench 上的 loss 是非常有效的性能指标。

> **再看：** 图 4 的红色三角真的都落在曲线上吗？
> 回到本文第 15 页的图 4 逐格看。MMLU，BBH，MATH，HUMANEVAL，AVERAGE 五格里两个三角都贴着紫线。CMMLU 和 CEVAL 各有一个三角明显在曲线上方，高出约 10 分。MBPP 的两个三角都在曲线下方，右边那个（loss 约 0.13）在 86 左右，曲线在那里已接近 95，偏得最多。正文说检验点 「也符合 sigmoid 关系」，按趋势讲成立，按点位讲有三格偏离。另外正文没说哪个三角是 7B，哪个是 80B，也没给拟合优度，这张图只能当定性证据用。

2) **Comparison between** $\mu \mathbf { P }$ **and Vanilla Architecture** Leveraging predictable scaling for hyperparameter search represents a critical pathway for reducing experimental costs while maximizing model performance. This direction has garnered significant attention recently, and research in this area broadly falls into two categories: architecture-driven hyperparameter transfer (Yang et al., 2022; Everett et al., 2024; Lingle, 2024; Bordelon et al., 2023) and data-driven hyperparameter transfer (Kaplan et al., 2020; Bjorck et al., 2024; Li et al., 2025a). The former modifies the model’s computational process to ensure hyperparameter settings can be shared between small and large models. The latter determines optimal hyperparameter configurations for LLMs by analyzing the relationship between hyperparameters and model parameter scale. In MiniCPM-series models, we adopt $\mu \mathrm { P }$ (Yang et al., 2022) as our basic architecture, which assumes that hyperparameters such as learning rate can be transferred between different model sizes under certain constraints. And most existing open-source models adopt the data-driven methods to search for hyperparameters.

2) **µP 与普通架构的对比** 借助可预测扩展做超参数搜索，是在降低实验成本的同时最大化模型性能的关键途径。这个方向最近备受关注，相关研究大致分两类：架构驱动的超参数迁移和数据驱动的超参数迁移。前者修改模型的计算过程，使超参数设置能在小模型和大模型之间共享；后者通过分析超参数与模型参数规模的关系，为 LLM 确定最优超参数配置。在 MiniCPM 系列模型中，我们以 µP 作为基础架构，它假设学习率等超参数在一定约束下可以在不同规模的模型之间迁移。而多数现有开源模型采用数据驱动的方法搜索超参数。

In MiniCPM4, we compare the $\mu \mathrm { P }$ architecture with the vanilla model format. Recently, various approaches to hyperparameter search have been proposed, with StepLaw (Li et al., 2025a) being one notable method in this area. However, our analysis reveals a significant discrepancy between the experimental configurations in the original StepLaw study and our practical training requirements. Given the potential benefits of both StepLaw and $\mu \mathbf { P }$ for hyperparameter optimization, we seek to systematically evaluate their relative performance in our specific training context. To this end, we design a comprehensive comparative study between StepLaw and the $\mu \mathrm { P }$ method.

在 MiniCPM4 中，我们把 µP 架构与普通模型形式做了对比。最近出现了多种超参数搜索方法，StepLaw 是其中值得注意的一种。但我们的分析发现，原始 StepLaw 研究的实验配置与我们实际的训练需求差异很大。考虑到 StepLaw 和 µP 在超参数优化上都可能有好处，我们希望在自己的训练场景下系统评估两者的相对表现。为此，我们设计了 StepLaw 与 µP 方法之间的全面对比研究。

We conduct our experiments by first computing predicted hyperparameters using StepLaw, specifically focusing on batch size and learning rate predictions. We then implement batch size selection through nearest-neighbor quantization by choosing the 16-divisible value closest to the StepLaw batch prediction to ensure computational efficiency. We compare two distinct training configurations: a standard architecture without $\mu \mathbf { P }$ using the learning rate predicted by StepLaw, and a $\mu \mathrm { P }$ architecture with empirically optimized learning rate parameters. We evaluate the performance of both trained models using training loss metrics and ScalingBench, providing a comprehensive assessment of each approach’s effectiveness in our specific training context.

实验中，我们先用 StepLaw 计算预测的超参数，重点是 batch size 和学习率。然后用最近邻量化选 batch size：取最接近 StepLaw 预测值的 16 的倍数，以保证计算效率。我们比较两种训练配置：一种是不带 µP 的标准架构，用 StepLaw 预测的学习率；另一种是 µP 架构，用经验上调优过的学习率参数。我们用训练 loss 和 ScalingBench 评估两种模型，全面衡量每种方法在我们特定训练场景下的效果。

<!-- page 16 of 44 -->

MiniCPM4

OpenBMB

Table 3: Comparison of hyperparameter search computational cost and performance between $\mu \mathrm { P }$ and StepLaw.

表 3: µP 与 StepLaw 在超参数搜索计算成本和性能上的对比。列是三档模型规模（150M, 360M, 700M）和各自的训练 token 数；「GPU Hour」 一列里 Vanilla（即按 StepLaw 配置的普通架构）记为 1M，µP 记为 32；行分别是 LM loss 和 ScalingBench 两项指标。

<table><tr><td colspan="2"># Model Params</td><td>GPU</td><td>150M</td><td>150M</td><td>150M</td><td>360M</td><td>360M</td><td>360M</td><td>700M</td><td>700M</td></tr><tr><td colspan="2"># Training Tokens</td><td>Hour</td><td>4B</td><td>10B</td><td>20B</td><td>20B</td><td>40B</td><td>100B</td><td>40B</td><td>100B</td></tr><tr><td rowspan="2">LM Loss</td><td>Vanilla</td><td>1M</td><td>2.1834</td><td>2.0335</td><td>1.9608</td><td>1.8510</td><td>1.7755</td><td>1.7274</td><td>1.6956</td><td>1.6391</td></tr><tr><td>μP</td><td>32</td><td>2.1797</td><td>2.0491</td><td>1.9666</td><td>1.8547</td><td>1.7721</td><td>1.7174</td><td>1.7091</td><td>1.6419</td></tr><tr><td rowspan="2">ScalingBench</td><td>Vanilla</td><td>1M</td><td>0.4310</td><td>0.3897</td><td>0.3685</td><td>0.3383</td><td>0.3172</td><td>0.3004</td><td>0.2984</td><td>0.2805</td></tr><tr><td>μP</td><td>32</td><td>0.4434</td><td>0.3915</td><td>0.3677</td><td>0.3371</td><td>0.3196</td><td>0.3045</td><td>0.3013</td><td>0.2789</td></tr></table>

As shown in Table 3, steplaw demonstrates slightly more instances of advantage, but the differences in both loss values and scalingbench scores between the two methods remain minimal, with neither approach exhibiting consistently stable superiority. We attribute the comparable effectiveness of hyperparameter search in the $\mu \mathbf { P }$ framework to steplaw under our experimental conditions to the following factors: 1) Practical hardware constraints prevent strict adherence to steplaw’s prescribed batch size. 2) The experiments employ the WSD learning rate schedule, and different data allocations are used for stable and decay phases, whereas step-law experiments utilize cosine decay. 3) We apply ScalingBench in the model evaluation, while step-law’s fitting process relies on training loss. Additionally, randomness exists in both the training process and evaluation metrics. We further note that reproducing steplaw’s work incurs significant expense, whereas $\mu \mathbf { P }$ search requires minimal GPU hours. This makes it accessible to common researchers. In conclusion, we believe that $\mu \mathbf { P }$ with a hyperparameter search method can use real training configurations and data to conduct a low-cost hyperparameter search in a new experiment. Steplaw still shows strong performance in experimental environments with many changes, and in many cases, can be used as a comparison standard for parameter search methods.

如表 3 所示，StepLaw 占优的次数略多，但两种方法在 loss 和 ScalingBench 分数上的差别都很小，哪一方都没有表现出持续稳定的优势。我们认为，在我们的实验条件下 µP 框架中的超参数搜索与 StepLaw 效果相当，原因有以下几点：1) 实际硬件约束使我们无法严格采用 StepLaw 规定的 batch size. 2) 实验采用 WSD 学习率调度，稳定阶段和衰减阶段使用不同的数据配比，而 StepLaw 的实验用的是余弦衰减。3) 我们在模型评测中使用 ScalingBench，而 StepLaw 的拟合过程依赖训练 loss。此外，训练过程和评测指标本身都有随机性。我们还注意到，复现 StepLaw 的工作开销很大，而 µP 搜索只需极少的 GPU 小时，普通研究者也用得起。总之，我们认为 µP 配合超参数搜索方法，可以在新实验中用真实的训练配置和数据做低成本的超参数搜索。StepLaw 在变化较多的实验环境中仍有很强的表现，很多情况下可以作为参数搜索方法的对比标准。

> **拆开：** 表 3 里 「StepLaw 占优的次数略多」 是几比几？1M 和 32 又是什么？
> 把本文第 16 页表 3 的 16 个格子逐个拆开，两行指标都是越低越好（ScalingBench 这里取的也是 loss）。LM loss 一行，Vanilla 更低的有 150M 的 10B 和 20B，360M 的 20B，700M 的 40B 和 100B，共五格；µP 更低的是 150M 的 4B，360M 的 40B 和 100B，共三格。ScalingBench 一行，Vanilla 更低的是 150M 的 4B 和 10B，360M 的 40B 和 100B，700M 的 40B，共五格；µP 更低的是 150M 的 20B，360M 的 20B，700M 的 100B，共三格。合计 10 比 6，这就是 「略多」，最大的一格差值也只有 0.0156（150M，10B 的 LM loss）。「GPU Hour」 列里 Vanilla 行写 1M，µP 行写 32，结合同页正文 「复现 StepLaw 开销很大，µP 搜索只需极少 GPU 小时」 来读，是两种方法搜超参数的 GPU 小时，约一百万对 32。正文没说 1M 是否就是 StepLaw 原研究的花费。

## 2.3.2 Pre-Training Engineering（预训练工程）

To improve model training efficiency, inspired by DeepSeek et al. (2024), we adopt multi-token prediction (Gloeckle et al., 2024) as our training objective to introduce denser supervision signals and improve data efficiency. For training infrastructure, we implement an FP8 mixed-precision computation framework.

为提升模型训练效率，受 DeepSeek et al. (2024) 启发，我们采用多 token 预测作为训练目标，引入更密集的监督信号，提高数据效率。训练基础设施方面，我们实现了 FP8 混合精度计算框架。

**Multi-Token Prediction** Traditional LLM pre-training usually adopts next token prediction as the training objective, which requires the model to predict the next token based on the preceding context. Multi-token prediction (MTP) requires the LLM to output multiple tokens with additional prediction heads. Here, the additional prediction heads are a one-layer Transformer (Vaswani et al., 2017) with embedding layers and output heads shared with the main model. Specifically, given the input tokens $\{ x _ { 0 } , x _ { 1 } , . . . , x _ { l - 1 } \}$ , the main model will generate a sequence of hidden vectors $\mathbf { H } \doteq \{ \mathbf { h } _ { 0 } , \mathbf { h } _ { 1 } , . . . , \mathbf { \bar { h } } _ { l - 1 } \}$ . Then the next token prediction objective can be computed as follows:

**多 token 预测** 传统 LLM 预训练通常以下一个 token 预测为训练目标，要求模型根据前文预测下一个 token。多 token 预测（MTP）要求 LLM 借助额外的预测头输出多个 token。这里的额外预测头是一层 Transformer，其嵌入层和输出头与主模型共享。具体来说，给定输入 token $\{x_0,\ldots,x_{l-1}\}$，主模型生成一串隐向量 $\mathbf{H}=\{\mathbf{h}_0,\ldots,\mathbf{h}_{l-1}\}$。于是下一个 token 预测目标可按式（2）计算。

$$
\mathcal {L} _ {\mathrm{NTP}} = \frac {1}{l} \sum_ {i} \text {CrossEntropy} \left(\text {OutputHead} (\mathbf {h} _ {i}), x _ {i + 1}\right).\tag{2}
$$

Then the inputs of the additional prediction heads are the concatenation of hidden vectors and the embedding of the next tokens:

然后，额外预测头的输入是隐向量与下一个 token 嵌入的拼接，两者各自先做归一化，见式（3）。

$$
\hat {\mathbf {h}} _ {i} = \operatorname{Concat} (\operatorname{Norm} (\mathbf {h} _ {i}), \operatorname{Norm} (\operatorname{Emb} (x _ {i + 1}))).\tag{3}
$$

Then the MTP training objective can be defined as:

MTP 训练目标由式（4）和式（5）定义：把拼接后的向量过一层线性层和一层 Transformer，得到 $\mathbf{h}^{\mathrm{MTP}}_i$，再用输出头预测再往后一位的 token $x_{i+2}$，取交叉熵。

$$
\{\mathbf {h} _ {0} ^ {\mathrm{MTP}}, \mathbf {h} _ {1} ^ {\mathrm{MTP}}, \dots , \mathbf {h} _ {l - 2} ^ {\mathrm{MTP}} \} = \text {Transformer} (\text {Linear} (\{\hat {\mathbf {h}} _ {0}, \hat {\mathbf {h}} _ {1}, \dots , \hat {\mathbf {h}} _ {l - 2} \})),\tag{4}
$$

$$
\mathcal {L} _ {\mathrm{MTP}} = \frac {1}{l - 1} \sum_ {i} \text {CrossEntropy} \left(\text {OutputHead} (\mathbf {h} _ {i} ^ {\mathrm{MTP}}, x _ {i + 2})\right).\tag{5}
$$

The final pre-training objective is the weighted sum of these two training objectives: $\mathcal { L } = \mathcal { L } _ { \mathrm { N T P } } + \lambda \mathcal { L } _ { \mathrm { M T P } }$

最终的预训练目标是这两个目标的加权和：$\mathcal{L}=\mathcal{L}_{\mathrm{NTP}}+\lambda\mathcal{L}_{\mathrm{MTP}}$。

**FP8 Mix-Precision Training** Considering that NVIDIA’s Tensor Core GPUs have powerful FP8 computing capabilities, we adopt the FP8 mix-precision in training. Following DeepSeek et al. (2024), we apply online block-wise FP8 quantization to both parameters and activations, using a block size of 128×128 for parameters and 128×1 for activations. After quantization, we adopt the FP8 Matrix Multiply Accumulate (MMA) instruction and use FP32 as the accumulator’s precision. To avoid the instability caused by FP8, we only apply FP8 on the linear projection. Specifically, we employ FP8 only in the computation of activations during the forward pass and in the calculation of input gradients during the backward pass. Considering that parameters are extremely sensitive to precision, the parameter gradients are computed in BF16 format.

**FP8 混合精度训练** 考虑到 NVIDIA 的 Tensor Core GPU 有强大的 FP8 计算能力，我们在训练中采用 FP8 混合精度。沿用 DeepSeek et al. (2024) 的做法，我们对参数和激活都做在线分块 FP8 量化，参数的块大小为 128×128，激活为 128×1。量化之后，我们使用 FP8 矩阵乘累加（MMA）指令，累加器精度用 FP32。为避免 FP8 带来的不稳定，我们只在线性投影上使用 FP8。具体来说，只在前向传播的激活计算和反向传播的输入梯度计算中使用 FP8。考虑到参数对精度极其敏感，参数梯度用 BF16 格式计算。

<!-- page 17 of 44 -->

MiniCPM4

OpenBMB

## 3 Efficient Post-Training（高效后训练）

In this section, we present our approach to post-training large models after the pre-training phase, enabling them to leverage the world knowledge acquired during pre-training to follow user instructions. During the supervised fine-tuning stage, we construct a diverse and comprehensive set of instructions to fully activate the capabilities of the LLMs, ensuring a strong foundational competence. To this end, following our previous work (Ding et al., 2023), we construct UltraChat v2, a large-scale SFT dataset covering abilities including knowledge application, reasoning, tool use, and long context processing.

本节介绍预训练之后对大模型做后训练的方法，让模型能利用预训练中习得的世界知识来遵循用户指令。在监督微调阶段，我们构建了一套多样，全面的指令集，充分激活 LLM 的能力，保证扎实的基础能力。为此，沿用我们之前的工作，构建了大规模 SFT 数据集 UltraChat v2，覆盖知识应用，推理，工具使用和长上下文处理等能力。

Furthermore, to enhance the model’s deep reasoning ability, we employ supervised fine-tuning augmented with long chain-of-thought reasoning and integrate reinforcement learning techniques. The rollout process of RL usually suffers from the unbalanced load challenge, which can lead to very inefficient computations. To address this issue, we propose a load-balanced RL strategy – chunk-wise rollout.

此外，为增强模型的深度推理能力，我们采用加入长 CoT 推理的监督微调，并结合强化学习技术。RL 的 rollout 过程通常面临负载不均衡的问题，可能导致计算非常低效。为此我们提出一种负载均衡的 RL 策略：分块 rollout。

In the following paragraphs, we will provide details on supervised fine-tuning and reinforcement learning techniques used to enhance foundational capabilities and reasoning abilities.

下面几段详细介绍用于增强基础能力和推理能力的监督微调与强化学习技术。

## 3.1 UltraChat v2: Foundational Capability Enhanced SFT Data Generation（UltraChat v2：增强基础能力的 SFT 数据生成）

To improve LLMs’ core competencies, we design a synthetic data generation framework focused on taskoriented capabilities. Guided by key capability dimensions, the framework generates high-quality QA-style data covering a wide range of skills, providing more targeted and structured signals during post-training. We systematically develop synthetic data tracks across five key skill areas: knowledge applications, reasoning, instruction following, long-context processing, and tool use. Each track is tailored to the input-output patterns and cognitive demands of its target skill, providing diverse, task-driven, and transferable training examples. This approach helps the model improve consistently across key foundational capabilities.

为提升 LLM 的核心能力，我们设计了一个聚焦任务能力的合成数据生成框架。该框架以关键能力维度为导向，生成覆盖广泛技能的高质量问答式数据，在后训练中提供更有针对性，更结构化的信号。我们在五个关键技能领域系统开发了合成数据方向：知识应用，推理，指令遵循，长上下文处理和工具使用。每个方向都按目标技能的输入输出模式和认知需求定制，提供多样，任务驱动，可迁移的训练样例。这种做法帮助模型在各项关键基础能力上稳定提升。

## 3.1.1 Knowledge-Intensive Data（知识密集型数据）

We begin by extracting and organizing knowledge points from domain-specific corpora, exam syllabi, and textbook materials across various disciplines, thereby constructing a comprehensive and well-structured knowledge framework. Based on this framework, we leverage LLMs to generate practice question-answer pairs targeting individual knowledge points, thus forming the initial stage of a knowledge-driven QA dataset.

我们先从各学科的领域语料，考试大纲和教材中抽取并整理知识点，构建一个全面，结构清晰的知识框架。基于这个框架，我们用 LLM 针对单个知识点生成练习问答对，形成知识驱动问答数据集的初始版本。

To further enhance the diversity and generalization capability of the data, we apply two evolution strategies to the initial practice QA pairs: (1) **Instruction evolution**, which rewrites prompts in diverse ways to simulate various questioning styles and task formulations; and (2) **Answer diversity evolution**, which guides the model to generate plausible and stylistically varied answers, thereby improving the model’s robustness in knowledge understanding and expression.

为进一步提高数据的多样性和泛化能力，我们对初始练习问答对施加两种演化策略：（1）**指令演化**，用多种方式改写提示，模拟不同的提问风格和任务表述；（2）**答案多样性演化**，引导模型生成合理且风格各异的答案，提升模型在知识理解和表达上的鲁棒性。

## 3.1.2 Reasoning-Intensive Data（推理密集型数据）

Reasoning ability is a fundamental skill that enables LLMs to manage complex tasks and generalize knowledge across diverse domains. Unlike standard question-answering tasks, reasoning tasks demand more than factual retrieval. They require models to perform multi-step logical inference and integrate information across contexts, while maintaining coherence and structural clarity in their responses. To improve LLMs’ abilities in mathematical reasoning, logical modeling, and procedural thinking, we develop two specialized datasets: one focused on mathematical reasoning, and the other on code-based reasoning. These datasets are designed to strengthen the model’s reasoning capacity and support the development of more robust and transferable logical skills.

推理能力是一项基础技能，让 LLM 能处理复杂任务，并在不同领域间泛化知识。与标准问答任务不同，推理任务要的不只是事实检索，还要求模型做多步逻辑推断，跨上下文整合信息，同时保持回答的连贯和结构清晰。为提升 LLM 在数学推理，逻辑建模和程序化思维方面的能力，我们开发了两个专门数据集：一个聚焦数学推理，一个聚焦基于代码的推理。它们用来加强模型的推理能力，支撑更稳健，更可迁移的逻辑技能。

**Math Reasoning Data** We start by systematically categorizing mathematical knowledge across core domains, including linear algebra, calculus, probability, statistics, differential equations, discrete mathematics, and differential geometry. These topics are further organized by educational level—from elementary to university— to establish a clear hierarchy of difficulty. Based on these topics, we either use curated seed data or prompt LLMs directly to generate relevant questions. The model is then guided to produce both answers and self-reflections to improve logical consistency and correctness.

**数学推理数据** 我们先系统地给核心领域的数学知识分类，包括线性代数，微积分，概率，统计，微分方程，离散数学和微分几何。这些主题再按教育阶段，从小学到大学，组织成清晰的难度层级。基于这些主题，我们或用整理好的种子数据，或直接提示 LLM 生成相关题目。然后引导模型同时给出答案和自我反思，提高逻辑一致性和正确性。

<!-- page 18 of 44 -->

MiniCPM4

OpenBMB

In our methodology for generating math problems, we focus on two dimensions: instruction diversity and solution path variety. On the one hand, we extend basic problems into various formats—including multiple choice, fill-in-the-blank, and open-ended questions—to enhance both expressive diversity and structural complexity. On the other hand, we generate multiple valid solution paths for the same problem, thereby expanding the model’s ability to explore the reasoning space and generalize its problem-solving strategies. The generation process is guided by a set of heuristic rules, such as instruction adherence and response length control, to ensure mathematical validity and answer verifiability. This results in a math-focused data subset with both instructional value and reasoning depth. Additionally, we implement difficulty-based stratification, actively reducing the proportion of easy questions during training. This encourages the model to focus on medium-to-high-difficulty problems, effectively strengthening its ability to construct reasoning chains and handle complex logical structures.

在生成数学题的方法上，我们关注两个维度：指令多样性和解题路径多样性。一方面，把基础题扩展成多种题型，包括选择题，填空题和开放题，提高表达多样性和结构复杂度。另一方面，为同一道题生成多条有效的解题路径，扩展模型探索推理空间的能力，使其解题策略更能泛化。生成过程由一组启发式规则引导，例如遵循指令和控制回答长度，保证数学上的正确性和答案的可验证性。由此得到一个既有教学价值又有推理深度的数学数据子集。此外，我们按难度分层，在训练中主动降低简单题的比例，促使模型聚焦中高难度题目，有效加强它构建推理链和处理复杂逻辑结构的能力。

**Code Reasoning Data** To enhance the code programming capabilities of LLMs, we design a code reasoning data generation pipeline tailored to real-world development scenarios. First, we manually define various coding contexts, problem categories (such as semantic completion, bug localization, and complex logic understanding), and difficulty levels to ensure that the constructed tasks closely resemble real-world engineering scenarios and have explicit reasoning objectives. In the data construction process, we extract high-quality code snippets, such as function definitions, algorithmic segments, and class structures, from authentic GitHub repositories, coding challenge libraries, or open-source scripts to serve as contextual foundations for question generation. Leveraging these predefined contexts and snippet structures, we employ LLMs to generate contextually relevant code reasoning problems. These problems encourage the model to comprehend program structure, simulate execution paths, and perform multi-step symbolic reasoning. Moreover, for each generated problem, we create accompanying unit tests and input-output examples to provide executable validation signals, ensuring that the model not only understands code semantics during training but also demonstrates behaviorally verifiable performance. Building on this foundation, we further diversify the problems by converting them into various formats, such as output prediction, logical diagnosis, and code rewriting, and by introducing cross-language translations (e.g., Python to Java, C++ to Rust) to enhance both contextual and logical diversity. This strategy not only broadens data coverage and generalization ability but also promotes the learning of unified reasoning patterns and program semantics across different syntactic structures and type systems. As a result, it strengthens the model’s cross-language transferability and adaptability to real-world development tasks.

**代码推理数据** 为增强 LLM 的编程能力，我们设计了一条贴合真实开发场景的代码推理数据生成流水线。首先，人工定义各种编码场景，问题类别（如语义补全，bug 定位，复杂逻辑理解）和难度等级，保证构造的任务贴近真实工程场景，且推理目标明确。数据构造过程中，我们从真实的 GitHub 仓库，编程挑战题库或开源脚本中抽取高质量代码片段，如函数定义，算法片段和类结构，作为出题的上下文基础。借助这些预定义的场景和片段结构，用 LLM 生成与上下文相关的代码推理题。这些题目促使模型理解程序结构，模拟执行路径，做多步符号推理。此外，我们为每道生成的题目配上单元测试和输入输出样例，提供可执行的验证信号，保证模型不仅在训练中理解代码语义，也表现出行为上可验证的能力。在此基础上，我们把题目转换成多种形式，如输出预测，逻辑诊断和代码改写，并引入跨语言翻译（例如 Python 到 Java，C++ 到 Rust），进一步提高上下文和逻辑上的多样性。这一策略不仅扩大了数据覆盖面和泛化能力，也促进模型学习跨不同语法结构和类型系统的统一推理模式和程序语义，从而增强模型的跨语言迁移能力和对真实开发任务的适应性。

## 3.1.3 Instruction Following Data（指令遵循数据）

**Progressive Construction of Complex Instructions** We begin by generating simple base instructions and iteratively increase their complexity by layering additional requirements related to style, format, and content. This bottom-up strategy allows for a controlled progression from basic to more intricate tasks, enabling the model to better generalize across instruction complexities.

**渐进式构造复杂指令** 我们先生成简单的基础指令，再逐层叠加风格，格式和内容方面的额外要求，迭代地提高复杂度。这种自底向上的策略能让任务从基础到复杂受控地递进，使模型在不同复杂度的指令间泛化得更好。

**Result-Verifiable Instruction Generation** We construct instructions with explicitly verifiable constraints, such as length limits, required content, or structural requirements. These constraints enable automatic validation of model outputs through rule-based filtering. By generating multiple outputs under varied decoding parameters, we can efficiently identify and retain only those responses that strictly satisfy the given conditions— thus supporting scalable and accurate data generation.

**结果可验证的指令生成** 我们构造带明确可验证约束的指令，比如长度限制，必须包含的内容或结构要求。这些约束使模型输出能通过基于规则的过滤自动验证。在不同解码参数下生成多个输出，就能高效找出并只保留严格满足条件的回答，从而支撑可扩展且准确的数据生成。

**Enhancing Instruction Diversity** To enrich the diversity of the instruction set, we incorporate prompts from a wide range of domains and contexts. Inspired by the approach proposed in Ge et al. (2024), we combine domain-specific knowledge with various persona settings to generate instructions that reflect a broader spectrum of real-world applications.

**增强指令多样性** 为丰富指令集的多样性，我们纳入来自广泛领域和场景的提示。受 Ge et al. (2024) 方法启发，我们把领域知识与各种人设（persona）组合，生成能反映更广泛真实应用的指令。

**Reverse Instruction Generation from Existing Data** Beyond generating instructions from scratch, we also employ a reverse instruction generation strategy—treating existing high-quality text as target outputs and generating corresponding instructions that could plausibly lead to them. This technique enables us to leverage valuable unlabeled corpora to augment instruction-following datasets.

**从已有数据反向生成指令** 除了从零生成指令，我们还采用反向指令生成策略：把现有高质量文本当作目标输出，生成可能引出这些文本的对应指令。这让我们能利用有价值的无标注语料来扩充指令遵循数据集。

## 3.1.4 Long-Context Data（长上下文数据）

Inspired by LongAlign (Bai et al., 2024), we construct long-context supervised fine-tuning data from existing pretraining corpora. We sample a document d from various sources in the pretraining corpus, including web pages, source code, mathematical content, encyclopedic texts, etc. For each document d, we use an LLM to

受 LongAlign 启发，我们从现有预训练语料构造长上下文监督微调数据。我们从预训练语料的多种来源中采样文档 d，包括网页，源代码，数学内容，百科文本等。对每个文档 d，我们用 LLM

<!-- page 19 of 44 -->

MiniCPM4

OpenBMB

generate a set of n task-oriented queries $Q = q _ { 1 } , q _ { 2 } , \ldots , q _ { n }$ , covering a range of objectives such as extraction, summarization, reasoning, and open-domain question answering. To simulate long-context reasoning, we retrieve related but potentially irrelevant documents to form a challenging long-context input, simulating distractor-heavy settings. For each query $q _ { j } \in Q$ , we retrieve k related documents $d _ { j , 1 } , d _ { j , 2 } , \ldots , d _ { j , k }$ from an indexed corpus. We then concatenate the original document d with the retrieved documents to form an extended context $C _ { j } = \mathsf { C o n c a t } ( d _ { j , 1 } , \ldots , d _ { j , m - 1 } , \tilde { d } , d _ { j , m } , \ldots , d _ { j , k } )$ , where d is inserted at a randomly selected position $m \in \dot { 1 , 2 , \ldots , k + 1 }$ within the sequence. An LLM is prompted with each query $q _ { j }$ alongside the context $C _ { j }$ , and tasked with generating an answer $a _ { j }$

生成一组 n 个面向任务的查询 $Q=q_1,\ldots,q_n$，覆盖抽取，摘要，推理和开放域问答等目标。为模拟长上下文推理，我们检索相关但可能无关紧要的文档，组成有挑战性的长上下文输入，模拟干扰项很多的场景。对每个查询 $q_j\in Q$，我们从索引语料中检索 k 篇相关文档 $d_{j,1},\ldots,d_{j,k}$。然后把原始文档 d 与检索到的文档拼接成扩展上下文 $C_j$，d 插在序列中随机选定的位置 m，m 取自 1 到 k+1。用每个查询 $q_j$ 和上下文 $C_j$ 提示 LLM，让它生成答案 $a_j$。

This design helps the model learn to locate relevant content and perform reasoning across long inputs with mixed relevance. To ensure coverage across different context lengths, we control the total token count of $C _ { j }$ to be uniformly distributed between 8K and 64K tokens.

这种设计帮助模型学会在相关度混杂的长输入中定位相关内容并做推理。为覆盖不同的上下文长度，我们把 $C_j$ 的总 token 数控制在 8K 到 64K 之间均匀分布。

## 3.1.5 Tool Use Data（工具使用数据）

**Function Calling** The function calling dataset combines publicly available sources such as xlam-function-calling-60k (Liu et al., 2024c) and glaive-function-calling-v2 <sup>3</sup>, with a substantial amount of in-house data generated via in-context learning. To ensure data quality, we apply strict filtering criteria. Specifically, we remove samples where the tool invoked in the ground truth is not included in the available tool set, or where the parameter names or types are inconsistent with the tool schema. Additionally, we prepend a chain-of-thought reasoning step before the tool invocation. Empirically, we find that this improves model performance by guiding it to better understand the task and select appropriate tools and arguments.

**函数调用** 函数调用数据集把 xlam-function-calling-60k 和 glaive-function-calling-v2 等公开数据，与大量通过上下文学习生成的内部数据结合起来。为保证数据质量，我们采用严格的过滤标准：删除标准答案中调用的工具不在可用工具集里的样本，以及参数名或参数类型与工具 schema 不一致的样本。此外，我们在工具调用前加一步 CoT 推理。经验上，这能引导模型更好地理解任务，选对工具和参数，从而提升模型表现。

**Code Interpreter** To enhance the model’s ability in code generation and reasoning, we construct a collection of data examples focused on solving problems with the help of a code interpreter. This includes both curated open-source datasets and internal data designed to reflect real-world coding scenarios.

**代码解释器** 为增强模型的代码生成与推理能力，我们构建了一批借助代码解释器解题的数据样例，包括整理过的开源数据集和反映真实编码场景的内部数据。

For open-source datasets, we utilize resources such as CodeAct (Wang et al., 2024b) and Code-Feedback (Zheng et al., 2024). To ensure compatibility with our execution environment, we preprocess the data by analyzing the abstract syntax tree (AST) of each code snippet and filtering out those that import external packages or rely on user interaction.

开源数据集方面，我们使用 CodeAct 和 Code-Feedback 等资源。为与我们的执行环境兼容，预处理时分析每段代码的抽象语法树（AST），过滤掉导入外部包或依赖用户交互的代码。

For in-house data, we collect various types of files, including CSVs, PDFs, images, and videos, and prompt an LLM to generate realistic, code-solvable problems related to the content of each file. Then the model is prompted to solve the task using a code interpreter, and is allowed to iteratively generate and execute code in a sandboxed environment. After each execution, the result is fed back to the model. If the model fails to solve the problem within 10 attempts, the data point is discarded. This approach helps create feedback-driven examples that teach the model how to use code to solve real-world tasks more effectively.

内部数据方面，我们收集各类文件，包括 CSV，PDF，图片和视频，提示 LLM 针对每个文件的内容生成真实的，可用代码求解的问题。然后提示模型用代码解释器解题，允许它在沙箱环境里迭代地生成和执行代码。每次执行后，结果反馈给模型。如果模型 10 次尝试内都没解出，这条数据就丢弃。这种做法能产出由反馈驱动的样例，教模型更有效地用代码解决真实任务。

## 3.2 Chunk-wise Rollout: Deep Reasoning with Load-Balanced Reinforcement Learning（分块 rollout：用负载均衡的强化学习做深度推理）

Recent research has demonstrated that RL can enhance the deep reasoning capabilities of LLMs (OpenAI, 2024b; DeepSeek et al., 2025). However, directly applying RL to an end-side base model often leads to unstable training and slow convergence. Thus, we first perform SFT on the base model using long-CoT distilled data. This step equips the model with basic reasoning abilities and provides a better initialization for RL. Subsequently, we proceed with RL to further enhance the model’s performance. To improve training efficiency, we carefully curate the training data and introduce a chunk-wise rollout strategy, which significantly accelerates the RL process by optimizing GPU utilization and minimizing computational waste.

最近的研究表明，RL 能增强 LLM 的深度推理能力。但直接在端侧基座模型上做 RL，往往训练不稳定，收敛慢。因此我们先用长 CoT 蒸馏数据对基座模型做 SFT，让模型具备基本推理能力，也为 RL 提供更好的初始化。随后再做 RL 进一步提升模型表现。为提高训练效率，我们仔细整理训练数据，并引入分块 rollout 策略，通过优化 GPU 利用率，减少计算浪费，大幅加快 RL 过程。

## 3.2.1 RL Data Curation（RL 数据整理）

We collect a large amount of high-quality data in mathematics and programming to enhance the model’s reasoning ability. We found that the quality and difficulty of the data play an important role in improving the model’s reasoning capabilities.

我们收集了大量数学和编程方面的高质量数据来增强模型的推理能力。我们发现，数据的质量和难度对提升推理能力起着重要作用。

<small><span class="docvortex-page-footnote" data-block-type="page_footnote" style="color:#6b7280"><sup>3</sup>https://huggingface.co/datasets/glaiveai/glaive-function-calling-v2</span></small>

脚注 3: glaive-function-calling-v2 数据集的 Hugging Face 页面。

<!-- page 20 of 44 -->

MiniCPM4

OpenBMB

<div class="docvortex-algorithm" style="white-space: pre-wrap; font-family:monospace;">
Algorithm 1 Chunk-wise Rollout-based Policy Optimization
Input initial policy model $\pi_{\theta}$; reward model $R$; task prompts $\mathcal{D}$; hyperparameters $\varepsilon_{\text{low}}, \varepsilon_{\text{high}}$
Initialize replay buffer $\mathcal{R} \leftarrow \emptyset$, dynamic sampling buffer $\mathcal{B} \leftarrow \emptyset$, log-prob buffer $\mathcal{L} \leftarrow \emptyset$
for step = 1,...,M do
    Sample a batch $\mathcal{D}_b$ from $\mathcal{D}$
    if replay buffer $\mathcal{R}$ is not empty then
        Append unfinished queries $q$ from $\mathcal{R}$ to $\mathcal{D}_b$
    Update old policy model $\pi_{\theta_{\text{old}}} \leftarrow \pi_{\theta}$
    for each $q \in \mathcal{D}_b$ do
        for $i = 1$ to $G$ do
            Generate a chunked output $o_i \sim \pi_{\theta_{\text{old}}}(\cdot \mid q)$
            if $o_i$ is unfinished: store $(q, i, o_i)$ in replay buffer $\mathcal{R}$
            if all $G$ outputs for $q$ are completed:
                Compute rewards $\{r_i\}_{i=1}^G$ for each sampled output $o_i$ by running $R$
                Filter out $o_i$ and add the remaining to the dynamic sampling buffer $\mathcal{B}$ ??
    if $|\mathcal{B}| &lt; N$: continue
        Sample a train batch $\mathcal{B}_{\text{train}} \subset \mathcal{B}$ of size $N$ for training
        Let $\mathcal{B}_{\text{rest}} = \mathcal{B} \setminus \mathcal{B}_{\text{train}}$
        Combine $\mathcal{B}_{\text{rest}}$ and $\mathcal{R}$ for current-policy log-prob estimation
        Compute $\log \pi_{\theta}(o_{i,t})$ for all cached chunks in $\mathcal{B}_{\text{rest}} \cup \mathcal{R}$
        Store log-probs in log-prob buffer $\mathcal{L} \leftarrow \mathcal{L} \cup \{\log \pi_{\theta}(o_{i,t})\}$
        Compute token-level advantage $\hat{A}_{i,t}$ for each sample in $\mathcal{B}_{\text{train}}$
        for iteration = 1, ..., $\mu$ do
            Update policy $\pi_{\theta}$ by maximizing the objective (Equation (6))
Output $\pi_{\theta}$
</div>

算法 1：基于分块 rollout 的策略优化。输入：初始策略模型 $\pi_\theta$，奖励模型 R，任务提示集 $\mathcal{D}$，超参数 $\varepsilon_{\text{low}}$ 和 $\varepsilon_{\text{high}}$。先把回放缓冲区 $\mathcal{R}$，动态采样缓冲区 $\mathcal{B}$，对数概率缓冲区 $\mathcal{L}$ 初始化为空。每一步（共 M 步）：从 $\mathcal{D}$ 采样一个批次 $\mathcal{D}_b$；若回放缓冲区非空，把其中未完成的查询并入 $\mathcal{D}_b$；把旧策略更新为当前策略。对批次里每个 q 生成 G 个分块输出；某个输出没写完，就把（q, i, o_i）存入回放缓冲区；某个 q 的 G 个输出都写完了，就用 R 计算奖励，过滤后把剩下的放入动态采样缓冲区。若 $|\mathcal{B}|$ 小于 N 就继续采样；否则从中取大小为 N 的训练批次，剩余部分与回放缓冲区合起来，用当前策略计算所有缓存块的对数概率并存入 $\mathcal{L}$；为训练批次里每个样本计算 token 级优势 $\hat A_{i,t}$；然后做 μ 轮迭代，每轮最大化式（6）的目标来更新策略。最后输出 $\pi_\theta$.（英文算法里 「Filter out」 那一行末尾的 「??」 在源文里就是这样。）

**Mathematics** We collect verifiable mathematical data primarily from DAPO, Deepscaler, Numina, Prime, and other sources. During the evaluation phase, outputs that do not conform to the expected reasoning format are assigned a reward of zero. To determine correctness, we employ a combination of rule-based matching and symbolic verification using SymPy.

**数学** 可验证的数学数据主要来自 DAPO，Deepscaler，Numina，Prime 等来源。评估阶段，不符合预期推理格式的输出奖励记为零。判断对错时，我们结合基于规则的匹配和用 SymPy 做的符号验证。

**Code** The code-related data is mainly sourced from LeetCode, TACO, Kodcode, Codeforces, and similar platforms. We execute Python code within a Firejail sandbox environment<sup>4</sup>. For problems with multiple test cases, the reward is calculated based on the proportion of test cases passed, with a full reward of 1.0 assigned when all test cases pass.

**代码** 代码相关数据主要来自 LeetCode，TACO，Kodcode，Codeforces 等平台。我们在 Firejail 沙箱环境中执行 Python 代码。对有多个测试用例的题目，奖励按通过的测试用例比例计算，全部通过时给满分 1.0。

**Data Filtering** After data collection, we perform deduplication on both the reinforcement learning (RL) training data and the supervised fine-tuning (SFT) data using Semhash (van Dongen & Tulkens, 2025). To retain more challenging samples, we use DeepSeek-R1-Distill-Qwen-1.5B to generate four predictions for each training example and filter out those for which all four predictions are correct. Since the amount of code data is significantly smaller than the math data, we upsample high-quality code samples multiple times to increase their proportion in the training set.

**数据过滤** 收集数据后，我们用 Semhash 对强化学习（RL）训练数据和监督微调（SFT）数据都做了去重。为保留更有挑战的样本，我们用 DeepSeek-R1-Distill-Qwen-1.5B 为每个训练样例生成四个预测，把四个预测全对的样例过滤掉。由于代码数据量明显少于数学数据，我们对高质量代码样本做多次上采样，提高它们在训练集中的比例。

## 3.2.2 Training Recipe（训练配方）

Building upon recent advancements in the research community, we adopt a modified version of Group Relative Policy Optimization (GRPO) (Shao et al., 2024b). In addition to the original GRPO algorithm, we incorporate the following improvements:

在社区近期进展的基础上，我们采用改进版的组相对策略优化（GRPO）。在原始 GRPO 算法之外，我们加入以下改进：

**Dynamic Sampling** During the RL rollout phase, we filter out prompts whose responses are all right or wrong, ensuring that all prompts in the batch contribute effective gradients while maintaining a consistent batch size. This strategy mitigates high variance in the gradient, thereby improving training efficiency and stability.

**动态采样** 在 RL rollout 阶段，我们过滤掉回答全对或全错的提示，保证批次中每个提示都贡献有效梯度，同时保持批次大小不变。这一策略缓解梯度的高方差，从而提高训练效率和稳定性。

<small><span class="docvortex-page-footnote" data-block-type="page_footnote" style="color:#6b7280"><sup>4</sup>https://github.com/netblue30/firejail</span></small>

脚注 4: Firejail 的 GitHub 仓库。

<!-- page 21 of 44 -->

MiniCPM4

OpenBMB

Table 5: Performance Comparison between Vanilla Rollout and Chunk-wise Rollout Strategy

表 5：普通 rollout 与分块 rollout 策略的性能对比。「Timings」 下两列是每步训练时间（Step）和每步采样时间（Sampling），「Performance」 下两列是 AIME 2024 和 AIME 2025 分数。行依次为：起点模型 Distill-Qwen-1.5B，普通 rollout，以及每轮最多生成 4k，8k，16k token 的分块 rollout。

<table><tbody><tr><td rowspan="2">Strategy</td><td colspan="2">Timings</td><td colspan="2">Performance</td></tr><tr><td>Step</td><td>Sampling</td><td>AIME 2024</td><td>AIME 2025</td></tr><tr><td>Distill-Qwen-1.5B</td><td>/</td><td>/</td><td>29.79</td><td>23.96</td></tr><tr><td>Vanilla</td><td>488.57</td><td>392.61</td><td>32.91</td><td>25.21</td></tr><tr><td>Chunk-4k</td><td>281.27</td><td>148.14</td><td>32.71</td><td>26.04</td></tr><tr><td>Chunk-8k</td><td>286.31</td><td>173.97</td><td>34.79</td><td>26.67</td></tr><tr><td>Chunk-16k</td><td>360.79</td><td>250.88</td><td>32.50</td><td>25.63</td></tr></tbody></table>

**Clip-Higher Strategy** We raise the upper clipping threshold for the importance sampling ratio. This adjustment alleviates entropy collapse in later training stages and encourages greater exploration, helping the model realize its full potential.

**Clip-Higher 策略** 我们调高重要性采样比率的上截断阈值。这一调整缓解训练后期的熵坍缩，鼓励更多探索，帮助模型发挥全部潜力。

**Token-level Policy Gradient Loss** Instead of averaging loss at the sample level, we compute the loss at the token level. This gives longer sequences a proportionally greater weight in the gradient update, which promotes the model to learn complex reasoning patterns and suppresses undesirable behaviors such as verbosity and repetition, ultimately improving training stability and generation quality.

**token 级策略梯度损失** 我们不在样本级别平均 loss，而是在 token 级别计算 loss。这让更长的序列在梯度更新中按比例获得更大权重，促使模型学习复杂的推理模式，同时抑制啰嗦和重复等不良行为，最终提升训练稳定性和生成质量。

**Overlong Sample Filtering** We exclude responses that are truncated due to length constraints from the loss computation. This prevents penalizing valid reasoning trajectories that are prematurely cut off, thereby encouraging the model to engage in deeper reasoning.

**超长样本过滤** 因长度限制被截断的回答不计入 loss。这样不会惩罚那些被提前截断但本身有效的推理轨迹，从而鼓励模型做更深入的推理。

## 3.2.3 Stabilized Chunk-wise Rollout（稳定化的分块 rollout）

To mitigate inference throughput degradation caused by lengthy trajectories during the rollout phase, we propose a chunk-wise rollout strategy to maximize computational resource utilization. The workflow of this strategy consists of three steps: (1) The policy model generates trajectories of a fixed chunk length for all input samples. (2) Trajectories that are either fully completed or have reached the maximum generation length are used for training. For the incomplete ones, their log probabilities are computed and stored for later use in importance sampling. (3)The unfinished trajectories are merged with the next batch of new inputs, then the process returns to step (1). By adopting this strategy, we significantly improve GPU utilization and effectively reduce computational waste caused by excessively long outputs within a single rollout iteration. The full algorithm can be found in Algorithm 4

为缓解 rollout 阶段超长轨迹造成的推理吞吐下降，我们提出分块 rollout 策略，最大化计算资源利用率。该策略的流程分三步：（1）策略模型为所有输入样本生成固定块长度的轨迹。（2）已完整结束或达到最大生成长度的轨迹用于训练；未完成的轨迹，计算并存储其对数概率，留待之后做重要性采样。（3）未完成的轨迹与下一批新输入合并，回到第（1）步。采用这一策略，我们大幅提高了 GPU 利用率，有效减少了单轮 rollout 中超长输出带来的计算浪费。完整算法见算法 4。

Since the chunk-wise rollout strategy breaks down long responses into smaller chunks across iterations, this may lead to distributional shifts in partially sampled trajectories after the policy model is updated, which can compromise training stability. To address this challenge and ensure a more stable training process, we introduce the following techniques:

由于分块 rollout 把长回答拆成跨多次迭代的小块，策略模型更新后，部分采样的轨迹可能出现分布偏移，损害训练稳定性。为应对这一挑战，保证训练过程更稳定，我们引入以下技术：

**Chunk-level importance sampling** As trajectories generated through the chunk-wise rollout strategy span multiple policy model versions, we apply importance sampling at the chunk level to account for distributional differences. Each chunk is weighted independently based on its originating policy. We found this technique to be critical for maintaining stable and efficient policy optimization.

**块级重要性采样** 分块 rollout 生成的轨迹跨越多个策略模型版本，所以我们在块级别做重要性采样来修正分布差异。每个块根据它来源的策略独立加权。我们发现这项技术对保持策略优化的稳定高效至关重要。

**Dual-clip** The chunk-wise strategy introduces partial off-policy rollouts, which often lead to spikes in training loss due to high variance in sampled trajectories. To mitigate this, we incorporate dual-clip (Ye et al., 2020), which constrains the policy update range from both directions, effectively reducing instability caused by large discrepancies in trajectory distributions.

**Dual-clip** 分块策略引入了部分离策略（off-policy）的 rollout，采样轨迹方差大，常导致训练 loss 出现尖峰。为缓解这一点，我们加入 dual-clip，从两个方向约束策略更新范围，有效减少轨迹分布差异过大带来的不稳定。

**KL regularization with dynamic reference updates** In contrast to recent works that remove KL loss (Yu et al., 2025a; Xia et al., 2025), we observe that retaining the KL penalty is essential for the stable training of chunk-wise rollouts. To avoid overly restricting the policy model’s potential, we periodically update the reference model, striking a balance between training stability and model performance.

**带动态参考模型更新的 KL 正则** 与近期去掉 KL loss 的工作不同，我们观察到保留 KL 惩罚对分块 rollout 的稳定训练必不可少。为避免过度限制策略模型的潜力，我们定期更新参考模型，在训练稳定性和模型性能之间取得平衡。

**Garble filter** Since the chunk-wise rollout strategy reuses incomplete trajectories from previous policy models, the risk of generating corrupted or incoherent text (e.g., garbled output, excessive repetition) increases. To prevent these abnormal trajectories from destabilizing training, we introduce a garble filter that detects and excludes such samples from loss computation.

**乱码过滤器** 分块 rollout 会复用之前策略模型留下的未完成轨迹，生成损坏或不连贯文本（例如乱码输出，过度重复）的风险随之增加。为防止这些异常轨迹破坏训练稳定性，我们引入乱码过滤器，检测这类样本并把它们排除在 loss 计算之外。

<!-- page 22 of 44 -->

MiniCPM4

OpenBMB

Based on the aforementioned techniques, for each specific question-answer pair $( q , a )$ , the behavior policy $\pi _ { \theta _ { \mathrm { o l d } } }$ samples a group of G individual responses $\{ \dot { o _ { i } } \} _ { i = 1 } ^ { G }$ , we reformulate the original policy optimization objective to support our proposed chunk-wise rollout. The modified objective is formally defined as follows:

基于上述技术，对每个问答对 $(q,a)$，行为策略 $\pi_{\theta_{\mathrm{old}}}$ 采样一组 G 个回答 $\{o_i\}_{i=1}^G$。我们改写原始的策略优化目标，以支持提出的分块 rollout。修改后的目标见式（6）和式（7）：总目标是截断项减去 β 倍 KL 项；截断项里，优势为正时取普通 clip 目标，优势非正时再与 $c\cdot\hat A_{i,t}$ 取 max，这就是 dual-clip；重要性比率 $r_{i,t}$ 的分母是生成第 t 个 token 所在块时的策略 $\pi_{\theta_{c(t)}}$，这就是块级重要性采样；约束 「0 < 正确回答数 < G」 对应动态采样。

> **回看：** 正文说 「完整算法见算法 4」，可第 20 页的算法框写的是 Algorithm 1；式（8）没有内容，表格编号也跳过了表 4。这几处编号能对上吗？
> 回看本文全文，算法框只有第 20 页这一个，标题是 「Algorithm 1 Chunk-wise Rollout-based Policy Optimization」，第 21 页正文的 「Algorithm 4」 指的只能是它。第 22 页式（7）之后单独一行 「(8)」，没有公式内容；算法 1 最后一行写的是 「maximizing the objective (Equation (6))」，所以式（6）和（7）就是完整目标，（8）是空编号。表格方面，第 16 页是表 3，第 21 页直接是表 5，全文找不到表 4。第 22 页 3.2.4 节正文把基线叫 「Naive」，表 5 里对应的行叫 「Vanilla」，两者是同一个东西。这些都是排版编号问题，不影响内容。

$$
\mathcal {J} (\theta) = \mathcal {J} _ {\mathrm{clip}} (\theta) - \beta \cdot \mathcal {J} _ {\mathrm{KL}} (\theta),\tag{6}
$$

$$
\begin{array}{l} \mathcal {J} _ {\mathrm{clip}} (\theta) = \mathbb {E} _ {(q, a) \sim \mathcal {D}, \{o _ {i} \} _ {i = 1} ^ {G} \sim \pi_ {\theta_ {c (t)}} (\cdot | q)} \bigg [ \frac {1}{\sum_ {i = 1} ^ {G} | o _ {i} |} \sum_ {i = 1} ^ {G} \sum_ {t = 1} ^ {| o _ {i} |} \\ \left\{ \begin{array}{l l} \min \left(r _ {i, t} (\theta) \cdot \hat {A} _ {i, t}, \operatorname{clip} (r _ {i, t} (\theta), 1 - \varepsilon_ {\text {low}}, 1 + \varepsilon_ {\text {high}}) \cdot \hat {A} _ {i, t}\right), & \text {if} \hat {A} _ {i, t} > 0 \\ \max \left(\min \left(r _ {i, t} (\theta) \cdot \hat {A} _ {i, t}, \operatorname{clip} (r _ {i, t} (\theta), 1 - \varepsilon_ {\text {low}}, 1 + \varepsilon_ {\text {high}}) \cdot \hat {A} _ {i, t}\right), c \cdot \hat {A} _ {i, t}\right), & \text {if} \hat {A} _ {i, t} \leq 0 \end{array} \right], \\ \text {s.t.} \quad 0 <   \left| \{o _ {i} \mid \text {is\_equivalent} (a, o _ {i}) \} \right| <   G, \\ \mathcal {J} _ {\mathrm{KL}} (\theta) = D _ {\mathrm{KL}} \left(\pi_ {\theta} \| \pi_ {\text {ref}}\right), \quad r _ {i, t} (\theta) = \frac {\pi_ {\theta} (o _ {i , t} \mid q , o _ {i , <   t})}{\pi_ {\theta_ {c (t)}} (o _ {i , t} \mid q , o _ {i , <   t})}. \end{array}\tag{7}
$$

(8)

## 3.2.4 Experimental Analysis（实验分析）

We train DeepSeek-R1-Distill-Qwen-1.5B on the DAPO dataset for 150 steps to evaluate our proposed chunk-wise rollout strategy. The experiments are conducted on 64 A800 GPUs, using a batch size of 64 and a learning rate of $3 \times 1 0 ^ { - \tilde { 6 } }$ . During training, we set the number of rollouts per sample to 8. For evaluation, we report the average performance over 16 independent runs. The results are presented in Table 5. "Naive" refers to generating a full response for each query during the rollout phase; "Chunk-nk" denotes our chunk-wise rollout strategy, which generates up to nk tokens per input during each rollout. The metrics "step" and "sampling" represent the average time per training step and the average time spent sampling trajectories per step, respectively. All timing values are normalized with respect to the naive dynamic sampling baseline.

我们在 DAPO 数据集上训练 DeepSeek-R1-Distill-Qwen-1.5B 150 步，以评估提出的分块 rollout 策略。实验在 64 张 A800 GPU 上进行，batch size 64，学习率 $3\times10^{-6}$。训练中每个样本的 rollout 数设为 8。评测时报告 16 次独立运行的平均表现。结果见表 5。「Naive」 指 rollout 阶段为每个查询生成完整回答；「Chunk-nk」 指我们的分块 rollout 策略，每轮 rollout 中每个输入最多生成 nk 个 token。指标 「step」 和 「sampling」 分别表示每个训练步的平均时间和每步采样轨迹的平均耗时。所有时间值都相对 naive 动态采样基线做了归一化。

From the experimental results, we can observe that the chunk-wise rollout strategy effectively reduces both training and sampling time per step while maintaining performance. As the chunk size decreases, the sampling time per step steadily declines, confirming that this strategy mitigates long trajectory-induced bubbles during sampling and improves GPU utilization. However, when the chunk size is reduced from 8k to 4k, although the sampling time per step is obviously reduced, the total training time per step remains largely unchanged. This is because the smaller chunk size, while alleviating sampling bottlenecks, introduces more frequent log probability computations for chunk-level importance sampling. As a result, the overall training efficiency sees little improvement. In future work, we will further optimize this trade-off to achieve a better balance between sampling speed and log probability calculation.

从实验结果可以看到，分块 rollout 策略在保持性能的同时，有效减少了每步的训练时间和采样时间。随着块变小，每步采样时间稳步下降，证实这一策略缓解了采样中长轨迹引起的气泡，提高了 GPU 利用率。但块大小从 8k 降到 4k 时，虽然每步采样时间明显减少，每步总训练时间却基本不变。原因是更小的块虽然缓解了采样瓶颈，却让块级重要性采样所需的对数概率计算更频繁。结果整体训练效率几乎没有提升。未来工作中，我们会进一步优化这一取舍，在采样速度与对数概率计算之间取得更好的平衡。

> **问：** 表 5 说时间 「相对 naive 基线做了归一化」，为什么 Vanilla 行不是 1.0?
> 本文第 21 页表 5 里 Vanilla 行是 488.57 和 392.61，分块各行是 281.27/148.14, 286.31/173.97, 360.79/250.88，没有一行等于 1 或 100。真按基线归一化，基线行应当是 1.0（或 100），这些数更像原始秒数。按比值算，Chunk-8k 的每步时间是 Vanilla 的 286.31/488.57，约 0.59，采样时间是 173.97/392.61，约 0.44；Chunk-4k 采样降到约 0.38，每步时间约 0.58，和第 22 页正文 「4k 比 8k 采样更快，总步时基本不变」 一致。所以结论可以照读，只是 「归一化」 这句与表中数字对不上，单位本文没给。性能上 Chunk-8k 的 AIME 2024 为 34.79，反而比 Vanilla 的 32.91 高。

## 3.2.5 Implement Details（实现细节）

We set the training batch size to 256 and the mini-batch size to 128. A constant learning rate of $1 e - 5$ is used throughout training. To accommodate the architectural design of MiniCPM4, we adopt the $\mu \mathrm { P }$ learning rate strategy. Unlike recent approaches that remove the KL penalty and introduce an entropy constraint in the policy loss, we retain the KL penalty with a coefficient of 0.001 and remove the entropy constraint to ensure stable training. The maximum response length is set to 32,768 tokens, which enables the model to perform extended chain-of-thought reasoning. During the rollout phase, both the temperature and top-p are set to 1.0 to encourage broader exploration. For each query, we generate 16 rollouts to promote diversity and robustness.

我们把训练 batch size 设为 256，mini-batch size 设为 128。整个训练使用 1e-5 的恒定学习率。为适配 MiniCPM4 的架构设计，我们采用 µP 的学习率策略。与近期去掉 KL 惩罚并在策略 loss 中加入熵约束的做法不同，我们保留系数为 0.001 的 KL 惩罚，去掉熵约束，以保证训练稳定。最大回答长度设为 32,768 个 token，让模型能做较长的 CoT 推理。rollout 阶段，temperature 和 top-p 都设为 1.0，鼓励更广的探索。每个查询生成 16 个 rollout，以提升多样性和鲁棒性。

## 3.3 BitCPM4: Quantization-Aware Training for Ternary LLMs（BitCPM4：三值 LLM 的量化感知训练）

Deploying LLMs is challenging due to their high computational and memory demands. Model quantization addresses this challenge by lowering parameter precision, leading to efficient inference with reduced resource consumption. Extremely low-bit quantization (e.g., 1-bit, 2-bit) has recently garnered significant interest and shows great promise (Wang et al., 2023; Ma et al., 2024; Xu et al.). However, to build these extremely low-bit LLMs, PTQ methods (Frantar et al., 2023) may not be sufficient to maintain the model performance,

LLM 的计算和内存需求高，部署起来很有挑战。模型量化通过降低参数精度来应对这一挑战，以更少的资源消耗实现高效推理。极低比特量化（例如 1 比特，2 比特）最近备受关注，前景很好。但要构建这类极低比特 LLM，训练后量化（PTQ）方法可能不足以保持模型性能，

<!-- page 23 of 44 -->

MiniCPM4

3 OpenBMB

![Chart block](images/p23-fp8-tokens-all-tokens.png)

FP8 tokens / All tokens (%)

（横轴标签：FP8 训练 token 占全部 token 的百分比。）

Figure 5: The relationship between language modeling loss and ratio of QAT post-training tokens (proportion of full stable-phase tokens).

图 5：语言建模 loss 与 QAT 后训练 token 比例（占完整稳定阶段 token 的比例）之间的关系。

图中只有一条折线，图例 「Continual-training scheduling」，纵轴 Training Loss，横轴 FP8 tokens / All tokens (%)，取 0, 10, ..., 90。目测读数：0% 处约 3.14, 10% 到 60% 在 3.15 到 3.24 之间起伏，其中 40% 处约 3.15; 70% 处跳到约 3.38, 80% 和 90% 约 3.43 和 3.44。

> **看表：** 图题说横轴是 「QAT token 比例」，图上横轴写的却是 「FP8 token 占比」，该怎么读？
> 按本文第 23 页正文的实验设计读：总 token 固定，先训 FP8 模型再做 QAT，两段加起来是 100%。所以横轴的 FP8 占比 x 对应 QAT 占比 100 - x，最左边 x = 0 就是从头 QAT，loss 约 3.14。正文说 「QAT 占比超过 40% 时 loss 接近从头 QAT」，对应横轴 x 不超过 60 这一段，图上 0 到 60 确实都在 3.14 到 3.24 之间，到 x = 70（QAT 只剩 30%）才跳到 3.38。图题的 「ratio of QAT post-training tokens」 与坐标轴是互补关系，图题没交代。另外图题括号里说比例是 「占完整稳定阶段 token」，正文说的是占总训练 token，两个口径本文没有统一。

necessitating more effective QAT methods (Liu et al., 2024b). Some recent efforts, such as BitNet (Ma et al., 2025), even train extremely low-bit LLMs from scratch. This paper introduces an efficient QAT method to construct an effective ternary model BitCPM4, and demonstrates the feasibility of adapting high-precision LLMs to extremely low-bit versions. This means that we can greatly reduce the additional overhead caused by quantization and dequantization during QAT.

因此需要更有效的 QAT 方法。近期一些工作，比如 BitNet，甚至从头训练极低比特 LLM。本文提出一种高效的 QAT 方法，构建出效果不错的三值模型 BitCPM4，并证明把高精度 LLM 改造成极低比特版本是可行的。这意味着我们可以大幅减少 QAT 中量化和反量化带来的额外开销。

## 3.3.1 Efficient Quantization-Aware Training（高效的量化感知训练）

For prevailing quantization methods, both weights and activations are typically quantized. Our preliminary experiments indicate that for extremely low-bit quantized LLMs, quantizing activations increases the QAT overhead without reducing too much inference costs on end-side devices. Consequently, we apply ternary quantization to model weights rather than activations. The current state-of-the-art ternary LLM, BitNet-2B (Ma et al., 2025), is trained from scratch using QAT on 4T tokens and achieves impressive performance. In contrast, our strategy involves initializing the ternary model with a pre-trained high-precision checkpoint to reduce the required training tokens for QAT.

在主流量化方法中，权重和激活通常都要量化。我们的初步实验表明，对极低比特量化的 LLM 来说，量化激活会增加 QAT 开销，却不会明显降低端侧设备上的推理成本。因此我们只对模型权重做三值量化，不量化激活。目前最先进的三值 LLM BitNet-2B 在 4T token 上用 QAT 从头训练，效果很好。相比之下，我们的策略用预训练好的高精度检查点初始化三值模型，减少 QAT 所需的训练 token。

To validate the feasibility of applying QAT to a model initialized from a high-precision checkpoint, we first conduct preliminary experiments on a 5M-parameter model in our ModelTunnel, using a total of 2B (400N) tokens. For these experiments, we employ the whole WSD learning rate scheduler, where the combined warm-up and stable phases account for 80% of the total tokens, and the decay phase accounts for the remaining 20%. These preliminary experiments involve two training stages: initially training an FP8 model, and then converting this FP8 model to a ternary model through QAT. Sufficient experiments in our ModelTunnel show that the re-warmup of the learning rate at the beginning of the second stage is critical for maintaining the performance of the FP8 model. To this end, we employ a learning rate of 1e-2 in the first stage, while in the second stage, we use a learning rate of 5e-3. While keeping the total number of training tokens constant, we adjust the allocation ratio between the FP8 training stage and the QAT stage, and record the final converged loss for each configuration.

为验证对高精度检查点初始化的模型做 QAT 是否可行，我们先在 ModelTunnel 中对一个 5M 参数的模型做初步实验，共用 2B (400N) token。这些实验采用完整的 WSD 学习率调度，预热和稳定阶段合计占总 token 的 80%，衰减阶段占剩下的 20%。初步实验包含两个训练阶段：先训练一个 FP8 模型，再通过 QAT 把这个 FP8 模型转成三值模型。ModelTunnel 中的充分实验表明，第二阶段开始时重新预热学习率，对保持 FP8 模型的性能至关重要。为此，第一阶段学习率用 1e-2，第二阶段用 5e-3。在总训练 token 数不变的前提下，我们调整 FP8 训练阶段与 QAT 阶段的分配比例，记录每种配置最终收敛的 loss。

As shown in Figure 5, when the proportion of tokens dedicated to QAT exceeds 40% of the total training tokens, i.e., equivalent to twice the number of tokens used in the learning rate decay phase, the final loss closely approaches that of training the ternary model from scratch via QAT. Furthermore, we conduct verification experiments on a 150M-parameter model, and the results confirm that reasonable continual-training scheduling can achieve the same effect as performing QAT from scratch to get effective ternary models. To this end, we build BitCPM4 using only twice the number of tokens used in the learning rate decay phase.

如图 5 所示，当 QAT 所占 token 超过总训练 token 的 40%，也就是相当于学习率衰减阶段 token 数的两倍时，最终 loss 已非常接近从头用 QAT 训练三值模型的结果。我们又在一个 150M 参数的模型上做了验证实验，结果证实合理的续训调度能达到与从头 QAT 相同的效果，得到有效的三值模型。为此，我们只用学习率衰减阶段两倍的 token 数来构建 BitCPM4。

## 3.3.2 Discussion for Extremely Low-Bit LLMs（关于极低比特 LLM 的讨论）

We finally train two sizes of ternary models: one is BitCPM4-0.5B trained based on MiniCPM4-0.5B, and the other 1B-parameter model is trained based on the internal experimental model. The whole QAT process uses 350B tokens.

我们最终训练了两种规模的三值模型：一个是基于 MiniCPM4-0.5B 训练的 BitCPM4-0.5B，另一个 1B 参数模型基于内部实验模型训练。整个 QAT 过程用了 350B token。

We compare our models with those of other related models, and the results are shown in Table 6. At the 0.5B-parameter level, BitCPM4-0.5B outperforms qwen3-0.6B on knowledge-related tasks (MMLU, CMMLU, C-EVAL, etc). At the 1B-parameter level, BitCPM4-1B performs similarly to competing 2B-parameter models.

我们把这两个模型与其他相关模型做了对比，结果见表 6。在 0.5B 参数量级，BitCPM4-0.5B 在知识类任务（MMLU，CMMLU，C-EVAL 等）上超过 Qwen3-0.6B. 在 1B 参数量级，BitCPM4-1B 的表现与 2B 参数的竞品模型相当。

<!-- page 24 of 44 -->

MiniCPM4

3 OpenBMB

Table 6: The comparison of BitCPM4 with other representative models. The data marked with asterisks are from the original paper of the model, and the rest of the data are reproduced by ourselves.

表 6: BitCPM4 与其他代表性模型的对比。带星号的数据来自对应模型的原论文，其余数据由我们自己复现。表中 Qwen3-0.6B，Llama3.2-1B，Gemma3-1B 是 BF16 精度，BitNet-2B 和两个 BitCPM4 是三值精度。

| Model | Qwen3 | Llama3.2 | Gemma3 | BitNet | BitCPM4 | BitCPM4 |
| --- | --- | --- | --- | --- | --- | --- |
| # Parameter | 0.6B | 1B | 1B | 2B | 0.5B | 1B |
| Precision | BF16 | BF16 | BF16 | Ternary | Ternary | Ternary |
| MMLU | 42.95 | 46.89 | 41.64 | 53.17* | 49.88 | 59.24 |
| CMMLU | 42.05 | 23.73 | 25.09 | 27.61 | 55.88 | 68.84 |
| CEval | 45.53 | 36.74 | 31.83 | 29.36 | 57.51 | 69.06 |
| BBH | 28.32 | 25.42 | 33.21 | 49.83 | 43.13 | 57.64 |
| GSM8K | 61.71 | 39.76 | 61.26 | 58.63* | 25.55 | 60.80 |
| MATH500 | 50.20 | 17.20 | 43.20 | 42.40 | 10.20 | 34.00 |
| MBPP | 47.86 | 47.47 | 59.92 | 47.08 | 46.69 | 61.48 |
| HumanEval | 40.85 | 40.85 | 42.07 | 38.40 | 29.88 | 37.20 |
| Average | 44.93 | 34.76 | 42.28 | 43.31 | 39.84 | 56.03 |

As the number of tokens required for BitCPM4 is only 10% of that for BitNet-2B, this means that implementing QAT from scratch is not necessary, and further shows that our proposed QAT method can deliver competitive results while requiring less training costs.

BitCPM4 所需 token 只有 BitNet-2B 的 10%，这说明没有必要从头做 QAT，也进一步表明我们提出的 QAT 方法能以更低的训练成本取得有竞争力的结果。

However, our 0.5B-parameter model exhibits relatively weaker performance on more challenging mathematical and coding tasks, which we attribute to that smaller model size restricts reasoning capabilities. Existing quantization efforts suggest that the quantization effectiveness follows a scaling law related to the model size (Ouyang et al., 2024; Kumar et al., 2024). Based on this law, we plan to apply our QAT method to larger models in our future work. Moreover, the operators for extremely low-bit models are also an issue that needs to be fully considered, and this will also be our future work.

不过，我们的 0.5B 模型在更难的数学和代码任务上表现相对较弱，我们认为这是模型规模较小限制了推理能力。已有的量化研究表明，量化效果遵循与模型规模相关的 scaling law。基于这一规律，我们计划在未来把 QAT 方法用到更大的模型上。此外，极低比特模型的算子也是需要充分考虑的问题，这也是我们未来的工作。

> **确认：** BitCPM4 的 token 真是 BitNet 的 10% 吗？0.5B 说 「超过 Qwen3-0.6B」 又是在哪些项上？
> 本文第 23 页写整个 QAT 用了 350B token，同页写 BitNet-2B 用 4T token, 350B/4T = 8.75%。第 24 页说 「只有 10%」，第 5 页说 「少 10 倍」，都是取整的说法，方向成立。350B 是两个三值模型合计还是各自用量，正文没分开说。表 6 里 BitCPM4-0.5B 对 Qwen3-0.6B: MMLU 49.88 对 42.95，CMMLU 55.88 对 42.05，CEval 57.51 对 45.53，BBH 43.13 对 28.32，这四项领先；GSM8K 25.55 对 61.71，MATH500 10.20 对 50.20，MBPP 46.69 对 47.86，HumanEval 29.88 对 40.85，这四项落后，平均 39.84 低于 44.93。所以第 23 页 「在知识类任务上超过」 这个限定是必要的，第 24 页也自己承认数学和代码偏弱。BitCPM4-1B 平均 56.03，高于 BitNet-2B 的 43.31。

## 4 Efficient Inference and Deployment（高效推理与部署）

Due to strict constraints on compute, storage capacity, and power consumption of end-side devices such as mobile devices and personal computers, how to achieve efficient inference of LLMs under limited hardware resources has become a key technical challenge. In this section, we will introduce our inference system, CPM.cu, and deployment system, ArkInfer.

手机和个人电脑这类端侧设备在算力，存储容量和功耗上都有严格限制，如何在有限硬件资源下实现 LLM 的高效推理，已成为关键技术挑战。本节介绍我们的推理系统 CPM.cu 和部署系统 ArkInfer。

## 4.1 CPM.cu: Lightweight and Efficient CUDA Inference Framework（CPM.cu：轻量高效的 CUDA 推理框架）

We first develop a lightweight inference framework optimized for end-side NVIDIA chips. Beyond the basic features, such as static memory management and kernel fusion, we implement a highly efficient speculative sampling and integrate efficient sparse attention kernels for InfLLM v2. Speculative sampling is a critical technique for accelerating LLM inference (Leviathan et al., 2023; Chen et al., 2023; Cai et al., 2024; Li et al., 2024c), particularly in resource-constrained end-side devices. This approach employs a draft-then-verify paradigm where a lightweight draft model generates candidate token sequences, which are subsequently verified by the target LLM in parallel. The recent advances in speculative sampling, such as EAGLE-2 (Li et al., 2024c), utilize a tree-style drafting process. By designing efficient attention kernels tailored for treebased speculative sampling and implementing fused verification kernels, we achieve an optimized speculative sampling speed. We also implement an efficient InfLLM v2 sparse attention kernel within the framework.

我们先开发了一个针对端侧 NVIDIA 芯片优化的轻量推理框架。除了静态内存管理和算子融合这类基础功能，我们还实现了高效的投机采样，并集成了 InfLLM v2 的高效稀疏注意力算子。投机采样是加速 LLM 推理的关键技术，在资源受限的端侧设备上尤其如此。它采用 「先起草，再验证」 的范式：一个轻量的草稿模型生成候选 token 序列，目标 LLM 随后并行验证。投机采样的近期进展，如 EAGLE-2，采用树状起草过程。我们为树状投机采样设计了专门的高效注意力算子，并实现了融合的验证算子，从而优化了投机采样速度。我们还在框架内实现了高效的 InfLLM v2 稀疏注意力算子。

Based on the framework, we identify that the efficiency bottleneck in speculative sampling for end-side models lies in the language modeling head of the draft model. To address this, we propose FR-Spec (Zhao et al., 2025), which prunes the draft model’s vocabulary based on the token frequency while preserving the full vocabulary of the target model to maintain its generation quality. We further explore combining speculative sampling with 4-bit quantized GPTQ (Frantar et al., 2023) models. To maintain model performance, we first explore an improved quantization scheme, P-GPTQ, and subsequently validate the feasibility of integrating speculative sampling with quantization in SpecMQuant (Zhang et al., 2025b) and with long-context processing.

基于这个框架，我们发现端侧模型投机采样的效率瓶颈在草稿模型的语言建模头（LM head）。为此我们提出 FR-Spec：按 token 频率裁剪草稿模型的词表，同时保留目标模型的完整词表，以维持生成质量。我们还探索了把投机采样与 4 比特量化的 GPTQ 模型结合。为保持模型性能，我们先探索了一种改进的量化方案 P-GPTQ，随后在 SpecMQuant 中验证了投机采样与量化结合的可行性，也验证了它与长上下文处理结合的可行性。

<!-- page 25 of 44 -->

MiniCPM4

OpenBMB

![Image block](images/p25-figure-6-the-illustration-of-fr-spec-which-requires-the.png)

Figure 6: The illustration of FR-Spec, which requires the draft model to use a reduced vocabulary subset.

图 6: FR-Spec 示意图，它要求草稿模型使用缩减后的词表子集。

图左半是原始投机采样的起草过程：每一步都是 Embed，Draft Layer 1，LM Head 三块，连跑三步，LM Head 画得和 Draft Layer 一样宽。中间是草稿树：从 「It (1.0)」 出发，分出 「is (0.6)」 和 「has (0.2)」，再往下是 「a (0.48)」，「the (0.06)」，「to (0.14)」，「a (0.02)」，最底层是 「good (0.34)」，「nice (0.05)」，「be (0.08)」，「do (0.03)」，深色节点是保留下来的候选。右半是 FRSpec 的起草过程，结构相同，只是 LM 块被截短，后面剩下虚线框，表示只算高频词那一部分。

## It is has a the to good be Embe 4.1.1 Frequency-Ranked Vocabulary Construction and Draft Verification（按频率排序的词表构建与草稿验证；标题前的 「It is has a the to good be Embe」 是 MinerU 把图 6 里的词混进了标题）

1 The effectiveness of speculative sampling relies heavily on the efficiency of both the drafting and verification arge ayer phases. Recent advances such as EAGLE-2 (Li et al., 2024c) have made remarkable progress in reducing 1 1 1the⋯ drafting overhead through extremely lightweight architectures, by employing single-layer Transformers for the 1 1 1 to drafting process. Contemporary models tend to adopt larger vocabularies to improve tokenization efficiency, 1 1 1 1 good introducing significant computational overhead in the language modeling head, making the drafting process 1 1 1 1 be  ea slow, although it has only a single layer. Our investigation reveals that the transition from small to large vocabulary models substantially increases drafting time, creating a new performance bottleneck that limits the effectiveness of speculative sampling techniques.

投机采样的效果很大程度上取决于起草和验证两个阶段的效率。EAGLE-2 等近期进展用极轻量的架构，即单层 Transformer 起草，在降低起草开销上取得了显著进步。当代模型倾向于采用更大的词表来提高分词效率，这给语言建模头带来很大的计算开销，使起草过程即便只有一层也很慢。我们的研究发现，从小词表模型换到大词表模型，起草时间大幅增加，形成了限制投机采样效果的新性能瓶颈。（这段英文里夹杂的 「arge ayer」，「1 1 1the⋯」，「be ea」 等碎片同样来自图 6，不属于正文。）

To address this challenge, we introduce FR-Spec (Zhao et al., 2025), a frequency-ranked speculative sampling framework that optimizes draft candidate selection through strategic vocabulary space compression. Our approach leverages the well-documented long-tail distribution of token frequencies in natural language, where a small subset of high-frequency tokens accounts for the majority of occurrences. By restricting the draft search to a frequency-prioritized subset of tokens, FR-Spec reduces the computational overhead of the language modeling head by up to 75% while maintaining the mathematical equivalence of the verification process and preserving the correctness of the final output distribution.

为应对这一挑战，我们提出 FR-Spec，一个按频率排序的投机采样框架，通过有策略地压缩词表空间来优化草稿候选的选择。我们的方法利用自然语言中 token 频率众所周知的长尾分布：一小部分高频 token 占了绝大多数出现次数。把草稿搜索限制在按频率优先的 token 子集内，FR-Spec 最多能把语言建模头的计算开销降低 75%，同时保持验证过程在数学上的等价性，保证最终输出分布的正确性。

FR-Spec introduces a frequency-ranked approach to speculative sampling that strategically optimizes the drafting phase while preserving the mathematical equivalence of the verification process. As shown in Figure 6, the framework operates on the principle of vocabulary space compression, where the draft model’s computational scope is restricted to a subset of high-frequency tokens, thereby reducing overhead while maintaining acceptable drafting quality.

FR-Spec 引入按频率排序的投机采样方法，有策略地优化起草阶段，同时保持验证过程在数学上等价。如图 6 所示，该框架基于词表空间压缩的原理：草稿模型的计算范围被限制在高频 token 子集内，从而在保持可接受的起草质量的同时降低开销。

**Frequency-Based Vocabulary Subset Construction.** The foundation of FR-Spec lies in the systematic identification and selection of high-frequency tokens. We perform corpus-level analysis on large-scale pre-training data to establish comprehensive token frequency rankings. Let $\bar { f } ( t )$ denote the frequency of token t in the corpus C. We sort all tokens $t \in \mathcal { V }$ in descending order of frequency and select the top-k tokens to form our reduced vocabulary subset: $\mathcal { V } _ { \mathrm { h i g h } } = \{ t _ { 1 } , t _ { 2 } , \ldots , \bar { t _ { k } } \}$ where $\tilde { f ( t _ { 1 } ) } \; \dot { \geq } \; f ( t _ { 2 } ) \geq \cdots \geq \tilde { f ( t _ { k } ) }$ . Our empirical analysis indicates that selecting approximately 25% of the vocabulary $\dot { ( k = 0 . 2 5 \times | \mathcal { V } | ) }$ provides optimal performance, capturing 95% of token occurrences while achieving substantial computational reduction.

**基于频率的词表子集构建。** FR-Spec 的基础是系统地识别和挑选高频 token。我们在大规模预训练数据上做语料级分析，建立完整的 token 频率排名。令 $f(t)$ 表示 token t 在语料 C 中的频率。我们把词表 $\mathcal{V}$ 中所有 token 按频率降序排列，取前 k 个组成缩减后的词表子集 $\mathcal{V}_{\mathrm{high}}=\{t_1,\ldots,t_k\}$，其中 $f(t_1)\ge f(t_2)\ge\cdots\ge f(t_k)$。我们的经验分析表明，选取约 25% 的词表（$k=0.25\times|\mathcal{V}|$）效果最佳，能覆盖 95% 的 token 出现次数，同时大幅减少计算。

**Modified Drafting Computation.** In standard speculative sampling, the draft model computes probability distributions over the entire vocabulary V. FR-Spec modifies this process by restricting computations to the reduced vocabulary subset $\mathcal { V } _ { \mathrm { h i g h } }$ . Given the original language modeling head matrix $\mathbf { W } _ { \mathrm { L M } }   \in   \mathbb { R } ^ { | \mathcal { V } | \times d }$ , we construct a reduced matrix $\mathbf { \tilde { W } _ { \mathrm { L M } } } \in \mathbb { R } ^ { | \mathcal { V } _ { \mathrm { h i g h } } | \times d }$ by extracting rows corresponding to high-frequency tokens:

**修改后的起草计算。** 在标准投机采样中，草稿模型要在整个词表 $\mathcal{V}$ 上计算概率分布。FR-Spec 把计算限制在缩减后的词表子集 $\mathcal{V}_{\mathrm{high}}$ 上。给定原始语言建模头矩阵 $\mathbf{W}_{\mathrm{LM}}\in\mathbb{R}^{|\mathcal{V}|\times d}$，我们抽取高频 token 对应的行，构造缩减矩阵 $\tilde{\mathbf{W}}_{\mathrm{LM}}\in\mathbb{R}^{|\mathcal{V}_{\mathrm{high}}|\times d}$，见式（9）。

$$
\tilde {\mathbf {W}} _ {\mathrm{LM}} [ i, \cdot ] = \mathbf {W} _ {\mathrm{LM}} [ \mathcal {V} _ {\text {high}} (i), \cdot ], \quad i = 1, \dots , | \mathcal {V} _ {\text {high}} |.\tag{9}
$$

The modified drafting computation becomes:

修改后的起草计算如式（10）所示。

$$
\mathcal {D} _ {\mathrm{FR}} (\mathbf {x}) = \text {Softmax} (\mathbf {H} _ {\text {draft}} (\mathbf {x}) \tilde {\mathbf {W}} _ {\mathrm{LM}} ^ {T}),\tag{10}
$$

where $\mathbf { H } _ { \mathrm { d r a f t } } ( \mathbf { x } ) \in \mathbb { R } ^ { n \times d }$ represents the hidden states from the draft model for the input sequence x.

其中 $\mathbf{H}_{\mathrm{draft}}(\mathbf{x})\in\mathbb{R}^{n\times d}$ 是草稿模型对输入序列 x 给出的隐状态。

**Verification Process.** A critical design principle of FR-Spec is maintaining the mathematical correctness and distributional equivalence of the verification process. The target LLM continues to operate over the complete vocabulary space V, ensuring that the final output distribution remains identical to standard speculative sampling methods: $\mathcal { P } _ { \mathrm { t a r g e t } } ( \mathbf { x } ) = \mathrm { S o f t m a x } ( \mathbf { H } _ { \mathrm { t a r g e t } } ^ { - 1 } ( \mathbf { x } ) \mathbf { W } _ { \mathrm { L M } } ^ { T } )$ This preservation guarantees that FR-Spec produces statistically equivalent results while achieving computational speedup.

**验证过程。** FR-Spec 的一条关键设计原则是保持验证过程在数学上正确，分布上等价。目标 LLM 仍在完整词表空间 $\mathcal{V}$ 上运算，保证最终输出分布与标准投机采样方法完全相同：$\mathcal{P}_{\mathrm{target}}(\mathbf{x})=\mathrm{Softmax}(\mathbf{H}_{\mathrm{target}}(\mathbf{x})\mathbf{W}_{\mathrm{LM}}^T)$。这保证 FR-Spec 在获得计算加速的同时，产出统计上等价的结果。

**Computational Complexity Analysis.** The computational benefits of FR-Spec are substantial and welldefined. The language modeling head computation complexity reduces from $\mathrm { O } ( \bar { n d } | \mathcal { V } | ) \; \mathrm { t o } \; \mathrm { O } ( n d | \mathcal { V } _ { \mathrm { h i g h } } | )$ , where

**计算复杂度分析。** FR-Spec 的计算收益可观且明确。语言建模头的计算复杂度从 $O(nd|\mathcal{V}|)$ 降到 $O(nd|\mathcal{V}_{\mathrm{high}}|)$，其中

<!-- page 26 of 44 -->

MiniCPM4

OpenBMB

n is the draft sequence length and d is the hidden dimension. The reduction factor is $\frac { | \mathcal { V } | } { | \mathcal { V } _ { \mathrm { h i g h } } | }$ . Similarly, the softmax computation scales down proportionally, as the input dimension reduces from $\mathbb { R } ^ { n \times | \mathcal { V } | } \operatorname { t o } \mathbb { R } ^ { n \times | \mathcal { V } _ { \mathrm { h i g h } } | }$ For typical configurations where $| \mathcal { V } _ { \mathrm { h i g h } } ^ { \mathrm { ~ \bf ~ \cdot ~ } } | = 0 . 2 5 \times | \mathcal { V } |$ , this represents a 4× reduction in computational overhead for the language modeling head of drafting models.

n 是草稿序列长度，d 是隐藏维度。缩减倍数为 $|\mathcal{V}|/|\mathcal{V}_{\mathrm{high}}|$。同样，softmax 的计算也按比例缩小，因为输入维度从 $\mathbb{R}^{n\times|\mathcal{V}|}$ 降到 $\mathbb{R}^{n\times|\mathcal{V}_{\mathrm{high}}|}$。在 $|\mathcal{V}_{\mathrm{high}}|=0.25\times|\mathcal{V}|$ 的典型配置下，草稿模型语言建模头的计算开销减为原来的四分之一。

FR-Spec is designed as a plug-and-play enhancement that seamlessly integrates with existing speculative sampling techniques without requiring model retraining or architectural modifications. The method can be applied to various speculative sampling frameworks by simply replacing the standard drafting computation with the frequency-ranked variant.

FR-Spec 设计为即插即用的增强模块，能与现有投机采样技术无缝集成，不需要重新训练模型或修改架构。只要把标准起草计算换成按频率排序的版本，就能用到各种投机采样框架上。

## 4.1.2 P-GPTQ: Prefix-Aware Post-Training Quantization for End-side Devices（P-GPTQ：面向端侧设备的前缀感知训练后量化）

As we mentioned above, PTQ and QAT are both important approaches for model quantization. Compared with QAT, PTQ is lighter and easier to conduct. PTQ for on-device deployment necessitates simultaneous quantization of both weights and activations due to constrained computational resources.

如前所述，PTQ 和 QAT 都是模型量化的重要途径。与 QAT 相比，PTQ 更轻量，更容易实施。由于算力受限，端侧部署的 PTQ 需要同时量化权重和激活。

Recent studies demonstrate that most LLMs exhibit massive activations (Sun et al., 2024b) at initial token positions, substantially degrading activation quantization fidelity. To address this challenge, we follow the PrefixQuant method (Chen et al., 2024) to isolate these initial token activation outliers. Specifically, our solution stores initial key-value activations during preprocessing, thereby preventing excessive activation magnitudes throughout the forward propagation of the first few input tokens.

近期研究表明，多数 LLM 在开头的 token 位置上存在巨大激活（massive activations），严重降低激活量化的保真度。为应对这一问题，我们沿用 PrefixQuant 方法隔离开头 token 的激活离群值。具体来说，我们的方案在预处理阶段存下开头的 key-value 激活，从而避免开头几个输入 token 在整个前向传播中出现过大的激活值。

Although PrefixQuant to some extent addresses activation outliers during inference, we observe that initial token bias also significantly impacts the weight quantization calibration process. Building on this insight, we develop Prefix-Aware GPTQ (P-GPTQ), an extension of the GPTQ method (Frantar et al., 2023) that eliminates initial token interference during Hessian computation. Formally, GPTQ computes the Hessian matrix H from the calibration data $\mathbf { X } \in \mathbb { R } ^ { \tilde { n } \times d }$ as

虽然 PrefixQuant 在一定程度上解决了推理时的激活离群值，我们观察到开头 token 的偏差也会明显影响权重量化的校准过程。基于这一发现，我们开发了前缀感知 GPTQ (P-GPTQ)，它扩展了 GPTQ 方法，在计算 Hessian 时排除开头 token 的干扰。形式化地说，GPTQ 从校准数据 $\mathbf{X}\in\mathbb{R}^{n\times d}$ 计算 Hessian 矩阵 H，见式（11）。

$$
\mathbf {H} = \mathbf {X} ^ {\top} \mathbf {X}.\tag{11}
$$

Our experimental analysis on MiniCPM4 shows that, when computing the covariance matrix H for downprojection layers, particularly in those deeper Transformer blocks, the beginning of sentence token and some initial tokens consistently introduce significant statistical bias. These initial positions exhibit activation magnitudes 10× larger than subsequent tokens, disproportionately dominating the covariance structure and leading to suboptimal quantization parameters. To mitigate this bias, P-GPTQ implements a position-aware calibration strategy. Through empirical analysis across multiple layers, we find that token positions starting from s = 4 exhibit stable statistical features. We compute the Hessian matrix only considering stable token positions as

我们在 MiniCPM4 上的实验分析显示，为 down-projection 层计算协方差矩阵 H 时，尤其在较深的 Transformer 块中，句首 token 和一些开头 token 始终带来明显的统计偏差。这些开头位置的激活幅度比后续 token 大 10 倍，不成比例地主导协方差结构，导致量化参数不够理想。为缓解这一偏差，P-GPTQ 采用位置感知的校准策略。通过对多层的经验分析，我们发现从 s = 4 开始的 token 位置统计特征稳定。我们只用稳定的 token 位置计算 Hessian 矩阵，见式（12）。

$$
\hat {\mathbf {H}} = \mathbf {X} _ {\text {valid}} ^ {\top} \mathbf {X} _ {\text {valid}},\tag{12}
$$

where $\mathbf { X } _ { \mathrm { v a l i d } } = \mathbf { X } _ { [ s : ] }$ ]excludes the first s positions. The idea of P-GPTQ maintains the compatibility with other quantization techniques, including rotation methods like Quarot (Ashkboos et al., 2024) and smoothing methods like AWQ (Lin et al., 2024b), enabling seamless integration into existing quantization pipelines.

其中 $\mathbf{X}_{\mathrm{valid}}=\mathbf{X}_{[s:]}$ 去掉了前 s 个位置。P-GPTQ 的思路与其他量化技术保持兼容，包括 QuaRot 这类旋转方法和 AWQ 这类平滑方法，能无缝接入现有量化流水线。

We evaluate P-GPTQ and its extension under the setting where all linear layers are quantized to a per-group INT4 format. The calibration employs 1,024 randomly selected sequences from the training dataset. Table 7 presents comparative results across quantization methods, where S denotes the smoothing process applied via AWQ preprocessing. The results demonstrate that S-P-GPTQ achieves superior performance among quantized methods, exhibiting the smallest performance degradation compared to the FP16 baseline.

我们在所有线性层都量化为按组 INT4 格式的设定下评估 P-GPTQ 及其扩展。校准使用从训练集中随机选取的 1,024 条序列。表 7 给出各量化方法的对比结果，其中 S 表示用 AWQ 预处理做的平滑。结果表明，S-P-GPTQ 在各量化方法中效果最好，相对 FP16 基线的性能下降最小。

## 4.1.3 Speculative Sampling Meets Quantization and Long-Context（投机采样遇上量化与长上下文）

**Quantization for Target Model** In SpecMQuant (Zhang et al., 2025b), we provide a systematic analysis of key factors to consider when applying speculative sampling to quantized models. For example, when using EAGLE-2 with W4A16 target models (such as the model quantized by GPTQ (Frantar et al., 2023)), the drafting process should use fewer draft tokens compared to non-quantized target models since the quantization model has alleviated the memory access bottleneck of target models. Specifically, denote the verification time of n draft tokens as $T _ { v } ( n )$ and the vanilla decoding time of the target model as $T _ { t } ,$ , the verification-to-decoding time ratio $T _ { v } ( n ) / T _ { t }$ grows significantly faster with increasing n in the quantized model compared to that in

**对目标模型做量化** 在 SpecMQuant 中，我们系统分析了把投机采样用于量化模型时需要考虑的关键因素。例如，用 EAGLE-2 配合 W4A16 目标模型（比如 GPTQ 量化的模型）时，起草应比非量化目标模型用更少的草稿 token，因为量化模型已经缓解了目标模型的访存瓶颈。具体来说，记 n 个草稿 token 的验证时间为 $T_v(n)$，目标模型普通解码时间为 $T_t$，那么在量化模型上，验证与解码的时间比 $T_v(n)/T_t$ 随 n 增大增长得比

<!-- page 27 of 44 -->

MiniCPM4

3 OpenBMB

Table 7: The evaluation results of different quantization methods.

表 7：不同量化方法的评测结果。列依次是 FP16 基线，GPTQ，P-GPTQ，S-GPTQ，S-P-GPTQ；行是七项基准和平均分，平均分分别为 75.58, 74.31, 74.76, 74.63, 74.91。

| Benchmark | FP16 | GPTQ | P-GPTQ | S-GPTQ | S-P-GPTQ |
| --- | --- | --- | --- | --- | --- |
| MMLU | 75.55 | 75.01 | 75.21 | 75.05 | 75.40 |
| CMMLU | 82.12 | 81.36 | 81.36 | 81.39 | 81.95 |
| CEval | 81.42 | 80.08 | 80.92 | 80.71 | 80.70 |
| BBH | 70.70 | 69.78 | 69.97 | 70.17 | 70.17 |
| GSM8K | 82.41 | 80.71 | 80.53 | 79.83 | 80.67 |
| Math500 | 60.20 | 59.72 | 59.62 | 59.80 | 60.00 |
| MBPP | 76.65 | 73.54 | 75.68 | 75.49 | 75.49 |
| Average | 75.58 | 74.31 | 74.76 | 74.63 | 74.91 |

the non-quantized model. This results in the increased acceptance length from using more draft tokens being offset by the significant extension in verification time.

非量化模型快得多。结果是，用更多草稿 token 换来的接受长度增加，被验证时间的大幅延长抵消了。

**Quantization for Draft Model** We further apply quantization to the EAGLE-2 draft model. This could make the drafting process even faster. Additionally, compressing the draft model to a 4-bit version also makes it suitable for memory-constrained end-side deployment. However, QSpec (Zhao et al., 2024) finds that using GPTQ on EAGLE-2 would lead to substantial degradation of the acceptance rate. Therefore, we change to using QAT (Section 3.3) on EAGLE-2. We verify that the EAGLE-2 quantized by our QAT method does no harm to the average acceptance length of the speculative sampling process.

**对草稿模型做量化** 我们进一步对 EAGLE-2 草稿模型做量化，让起草更快。此外，把草稿模型压缩成 4 比特版本，也让它适合内存受限的端侧部署。但 QSpec 发现，对 EAGLE-2 用 GPTQ 会导致接受率大幅下降。因此我们改用 QAT（第 3.3 节）量化 EAGLE-2。我们验证了用我们的 QAT 方法量化的 EAGLE-2 不会损害投机采样过程的平均接受长度。

**InfLLM v2 for Target Model** We implement the InfLLM v2 sparse attention kernel for long-context scenarios. To support tree-style draft verification in speculative sampling, assuming the total number of drafted tokens is n, we only construct a local 2d attention mask for the last n × n region and compress the mask via uint64 bit-packing before passing it to the InfLLM v2 kernel.

**目标模型使用 InfLLM v2** 我们为长上下文场景实现了 InfLLM v2 稀疏注意力算子。为支持投机采样中的树状草稿验证，假设草稿 token 总数为 n，我们只为最后 n × n 区域构造局部二维注意力掩码，并用 uint64 位打包压缩掩码，再传给 InfLLM v2 算子。

**Sliding Window for Draft Model** For long-context scenarios, if the draft model in speculative sampling uses full attention, it will significantly increase the model’s first-token latency. Following the approach in TriForce (Sun et al., 2024a), we apply sliding window attention to the draft model. Our experiments show that this not only minimizes the impact on first-token latency but also improves drafting accuracy.

**草稿模型使用滑动窗口** 在长上下文场景中，如果投机采样的草稿模型用全注意力，会明显增加模型的首 token 延迟。沿用 TriForce 的做法，我们对草稿模型采用滑动窗口注意力。实验显示，这不仅把对首 token 延迟的影响降到最低，还提高了起草准确率。

## 4.2 ArkInfer: Cross-Platform Deployment System（ArkInfer：跨平台部署系统）

Beyond the challenges of limited computational resources, the fragmentation of end-side chips presents another significant hurdle. This fragmentation necessitates adapting models to multiple platforms and chip types for each new model release, leading to complex adaptation and deployment. This results in a great amount of engineering effort, making it nearly impossible for models to run efficiently across all platforms.

除了算力有限的挑战，端侧芯片的碎片化是另一个大障碍。碎片化意味着每发布一个新模型，都要适配多个平台和芯片类型，适配和部署都很复杂。这带来大量工程投入，几乎不可能让模型在所有平台上都高效运行。

The core of this problem lies in decoupling and efficient code reuse: How can a single technical development and engineering effort be automatically applied across multiple platforms?

问题的核心在于解耦和高效的代码复用：怎样让一次技术开发和工程投入自动适用于多个平台？

To address these pain points, we propose ArkInfer, a novel cross-platform deployment system. ArkInfer is designed to overcome the fragmentation of end-side chips by providing highly efficient inference speed and serving as a versatile cross-platform compatibility layer for various model applications. To achieve this, we introduce three key solutions: (1) a cross-platform compatible architecture design, (2) reusable and efficient speculative and constrained decoding schemes, and (3) an extensible model zoo frontend.

为解决这些痛点，我们提出新的跨平台部署系统 ArkInfer. ArkInfer 用来克服端侧芯片的碎片化，既提供高效的推理速度，又充当各种模型应用的通用跨平台兼容层。为此我们引入三项关键方案：（1）跨平台兼容的架构设计，（2）可复用的高效投机解码与约束解码方案，（3）可扩展的模型库前端。

## 4.2.1 Cross-Platform Compatible Architecture Design（跨平台兼容的架构设计）

ArkInfer’s architectural design is fundamentally driven by the need for unified, efficient deployment across a fragmented landscape of end-side hardware. Supporting diverse platforms such as MediaTek, Nvidia, Qualcomm, and Rockchip, each with its native inference frameworks (e.g., NeuroPilot, Genie, RK-LLM, TensorRT-LLM, and llama.cpp for CPU), ArkInfer seamlessly integrates these as adaptable backends.

ArkInfer 的架构设计从根本上源于一个需求：在碎片化的端侧硬件格局中统一，高效地部署。它支持联发科（MediaTek），Nvidia，高通（Qualcomm）和瑞芯微（Rockchip）等多种平台，各平台都有自己的原生推理框架（例如 NeuroPilot，Genie，RK-LLM，TensorRT-LLM，以及 CPU 上的 llama.cpp），ArkInfer 把它们无缝集成为可适配的后端。

At its core, ArkInfer implements a powerful abstraction layer. This layer features a system of adapters that normalize the varied APIs of different backends, presenting a consistent interface to higher-level components.

ArkInfer 的核心是一个强大的抽象层。这一层有一套适配器系统，把不同后端各异的 API 规范化，向上层组件提供一致的接口。

<!-- page 28 of 44 -->

MiniCPM4

OpenBMB

This ensures seamless interaction regardless of the underlying hardware or framework. Data handling is further streamlined through a unified Tensor structure, which wraps diverse data types and dimensions for consistent manipulation across the system. Critical for LLM efficiency, a dedicated KV cache manager intelligently orchestrates historical state storage and retrieval, optimizing subsequent token generation.

这保证无论底层是什么硬件或框架，交互都能无缝进行。数据处理通过统一的 Tensor 结构进一步简化，它封装各种数据类型和维度，让整个系统能一致地操作数据。对 LLM 效率至关重要的是，一个专门的 KV cache 管理器智能地协调历史状态的存储与读取，优化后续 token 的生成。

The central component of this architecture is an abstract executor interface, which governs the runtime execution of all model-related processes, with inputs and outputs defined by fundamental tensor types. This encompasses core neural network execution (handling the encoding of various input modalities like text, images, and audio, and autoregressive decoding), sophisticated sampling techniques for generating diverse outputs, and comprehensive preprocessing capabilities to prepare data for model input. Beyond these, ArkInfer also orchestrates complex pre-trained models by composing these fundamental executors and manages interactions with external tool-calling functionalities.

这一架构的中心组件是抽象执行器接口，它管理所有与模型相关的过程的运行时执行，输入输出都用基本张量类型定义。这包括核心神经网络执行（处理文本，图像，音频等各种输入模态的编码，以及自回归解码），生成多样输出的复杂采样技术，以及为模型输入准备数据的完整预处理能力。此外，ArkInfer 还通过组合这些基本执行器来编排复杂的预训练模型，并管理与外部工具调用功能的交互。

This design enables heterogeneous scheduling at the executor granularity, allowing us to fully leverage diverse computing resources. Furthermore, by tracing executor execution, we can track the flow of data and operations, which greatly facilitates debugging and performance analysis, particularly for crucial per-stage precision alignment—a common pain point in end-side adaptation.

这种设计支持以执行器为粒度的异构调度，让我们能充分利用各种计算资源。此外，通过追踪执行器的执行，可以跟踪数据和操作的流向，大大方便调试和性能分析，尤其是逐阶段的精度对齐，这是端侧适配中常见的痛点。

## 4.2.2 Reusable and Efficient Speculative and Constrained Decoding Schemes（可复用的高效投机解码与约束解码方案）

Efficient LLM inference techniques generally fall into three categories: quantization, sparsity, and acceleration of the autoregressive process. While the first two, such as GPTQ, MoE, and our InfLLMv2, are often deeply coupled with specific hardware or operator implementations, acceleration techniques like speculative sampling and constrained decoding are relatively loosely coupled with the underlying hardware. This decoupling allows us to implement these optimizations once within a deployment framework and enable them across multiple chip architectures. Therefore, ArkInfer integrates both speculative sampling and constrained decoding functionalities. Our design philosophy centers on achieving universal applicability and ease of integration within the existing execution backends.

高效 LLM 推理技术大致分三类：量化，稀疏化，以及自回归过程的加速。前两类，如 GPTQ，MoE 和我们的 InfLLM v2，往往与特定硬件或算子实现深度耦合；而投机采样和约束解码这类加速技术与底层硬件的耦合相对松散。这种解耦让我们能在部署框架里只实现一次这些优化，就在多种芯片架构上启用。因此 ArkInfer 集成了投机采样和约束解码两项功能。我们的设计理念是做到普遍适用，并便于接入现有的执行后端。

Central to ArkInfer’s ability to generate output tokens is a core component that takes processed input and orchestrates the autoregressive generation process. This component supports a range of advanced decoding strategies to meet diverse inference needs:

ArkInfer 生成输出 token 的核心是一个组件，它接收处理好的输入，编排自回归生成过程。该组件支持一系列高级解码策略，满足不同的推理需求：

**Accelerated Speculative Decoding** For enhanced inference speed, besides the above-mentioned speculative sampling methods, ArkInfer incorporates an advanced speculative decoding mechanism based on the BiTA algorithm (Lin et al., 2024a). This technique is a strategic choice because it dramatically boosts performance without requiring additional draft models or specialized architectural changes, simplifying deployment on resource-constrained end-side devices while maintaining high output quality.

**加速的投机解码** 为提高推理速度，除了上面提到的投机采样方法，ArkInfer 还加入了基于 BiTA 算法的高级投机解码机制。选它有策略上的考虑：它不需要额外的草稿模型或专门的架构改动就能大幅提升性能，简化在资源受限端侧设备上的部署，同时保持高输出质量。

**Constrained Decoding** To ensure outputs adhere to specific formats, such as JSON or SQL, ArkInfer employs a powerful constrained decoding method leveraging the Guidance algorithm. This approach is selected for its superior ability to enforce structural adherence and provide deterministic responses, which is crucial for applications that demand structured or precise outputs.

**约束解码** 为保证输出符合 JSON 或 SQL 等特定格式，ArkInfer 采用基于 Guidance 算法的约束解码方法。选择它是因为它在强制结构合规，给出确定性回答方面能力出众，这对要求结构化或精确输出的应用至关重要。

## 4.2.3 Extensible Model Zoo Frontend（可扩展的模型库前端）

A key hurdle in deploying models on edge-side devices stems from the fragmented nature of model file structures. Various chip manufacturers frequently impose their own distinct requirements and formats, resulting in a convoluted and inefficient deployment workflow. We contend that the optimal approach involves maintaining a centralized model zoo offering a broad selection of pre-adapted models.

在边缘设备上部署模型的一个关键障碍，来自模型文件结构的碎片化。各芯片厂商常常有各自不同的要求和格式，导致部署流程繁琐低效。我们认为最优的做法是维护一个集中的模型库，提供大量预先适配好的模型。

To tackle this, we engineer an extensible, cross-platform frontend for ArkInfer. This interface allows users to directly access and execute various models in our model zoo, thereby notably streamlining the deployment of MiniCPM and other models across diverse devices. In addition to accelerating the growth and maintenance of our model zoo, we also create an automated model conversion pipeline. This system can efficiently convert models into the formats required by different platforms, greatly accelerating the ongoing development of our model zoo.

为此，我们为 ArkInfer 打造了一个可扩展的跨平台前端。用户可以通过这个接口直接访问并运行模型库中的各种模型，大大简化 MiniCPM 和其他模型在各类设备上的部署。为加快模型库的扩充和维护，我们还搭建了自动化的模型转换流水线，能高效地把模型转成不同平台要求的格式，大大加快模型库的持续建设。

<!-- page 29 of 44 -->

MiniCPM4

OpenBMB

Table 8: Evaluation results of MiniCPM4 and other open-source LLMs.

表 8: MiniCPM4 与其他开源 LLM 的评测结果。左边四列是 1B 以下一档（Qwen3-0.6B, Llama3.2-1B, Gemma3-1B, MiniCPM4-0.5B），右边六列是 8B 到 14B 一档（Qwen3-8B, GLM4-9B, Gemma3-12B, LLaMA3.1-8B, Phi4-14B, MiniCPM4-8B）。「# Train Data」 一行是训练数据量，MiniCPM4-0.5B 记 1T，MiniCPM4-8B 记 8T，两个 Qwen3 都记 36T. 平均分最高的两列是 MiniCPM4-8B 81.13 和 Qwen3-8B 80.55。

| Models | Qwen3 | Llama3.2 | Gemma3 | MiniCPM4 | Qwen3 | GLM4 | Gemma3 | LLaMA3.1 | Phi4 | MiniCPM4 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| # Parameter | 0.6B | 1B | 1B | 0.5B | 8B | 9B | 12B | 8B | 14B | 8B |
| # Train Data | 36T | 9T | 2T | 1T | 36T | 10T | 12T | 15T | 10T | 8T |
| MMLU | 42.95 | 46.89 | 41.64 | 55.55 | 77.55 | 75.90 | 73.36 | 69.38 | 81.61 | 75.83 |
| CMMLU | 42.05 | 23.73 | 25.09 | 65.22 | 77.58 | 74.49 | 62.52 | 54.41 | 67.56 | 80.62 |
| CEval | 45.53 | 36.74 | 31.83 | 66.11 | 80.35 | 74.09 | 62.23 | 52.66 | 64.28 | 81.36 |
| BBH | 28.32 | 25.42 | 33.21 | 49.87 | 69.43 | 61.36 | 66.66 | 44.34 | 72.79 | 76.73 |
| GSM8K | 61.71 | 39.76 | 61.26 | 52.08 | 93.25 | 89.39 | 94.16 | 84.08 | 94.77 | 91.51 |
| MATH500 | 50.20 | 17.20 | 43.20 | 29.60 | 83.20 | 66.00 | 82.20 | 48.20 | 79.60 | 78.60 |
| MBPP | 47.86 | 47.47 | 59.92 | 59.14 | 77.04 | 74.71 | 84.44 | 68.09 | 80.54 | 78.99 |
| HumanEval | 40.85 | 40.85 | 42.07 | 46.34 | 85.98 | 82.32 | 83.54 | 70.73 | 86.59 | 85.37 |
| Average | 44.93 | 34.76 | 42.28 | 52.99 | 80.55 | 74.78 | 76.14 | 61.49 | 78.47 | 81.13 |

## 5 Evaluations（评测）

Based on the efficient training and inference mechanism, we bulid MiniCPM4-8B and MiniCPM4-0.5B. In this section, we evaluate the effectiveness and efficiency of our models on several open-source benchmarks.

基于高效的训练和推理机制，我们构建了 MiniCPM4-8B 和 MiniCPM4-0.5B. 本节在若干开源基准上评估模型的效果和效率。

## 5.1 Experimental Settings（实验设置）

**Benchmarks** MiniCPM4 was primarily pre-trained on Chinese and English corpora. Therefore, we select the following datasets to evaluate our model, including knowledge-intensive evaluation sets MMLU (Hendrycks et al., 2020), CMMLU (Li et al., 2024a), and CEval (Huang et al., 2023) for English and Chinese, and reasoning evaluation sets including general reasoning BigBench Hard (BBH) (Suzgun et al., 2023), mathematical reasoning GSM8K (Cobbe et al., 2021), MATH500 (Hendrycks et al., 2021), and AIME (MAA), and code reasoning MBPP (Austin et al., 2021), HumanEval (Chen et al., 2021), and LiveCodeBench (LCB) (Jain et al., 2024). We adopt OpenCompass (Contributors, 2023) as our evaluation framework.

**基准** MiniCPM4 主要在中英文语料上预训练。因此我们选择以下数据集评测模型：知识密集型评测集，英文的 MMLU，中文的 CMMLU 和 CEval；推理评测集，包括通用推理 BigBench Hard (BBH)，数学推理 GSM8K，MATH500 和 AIME，以及代码推理 MBPP，HumanEval 和 LiveCodeBench (LCB)。我们采用 OpenCompass 作为评测框架。

**Baseline Models** We compare MiniCPM4-8B and MiniCPM4-0.5B with several widely-adopted open-source LLMs. Specifically, for MiniCPM4-0.5B, we select several models with approximately 1 billion parameters, including Qwen3-0.5B (Yang et al., 2025), Llama3.2-1B (Dubey et al., 2024), Gemma3-1B (Team et al., 2025). These models are well-trained with trillions of tokens and trained with knowledge distillation, which ensures their effectiveness. For MiniCPM4-8B, we select models with approximately 10 billions parameters as baselines, including Qwen3-8B (Yang et al., 2025), GLM4 (0414 version) (GLM et al., 2024), Gemma3-12B (Team et al., 2025), and Phi4-14B (Abdin et al., 2024).

**基线模型** 我们把 MiniCPM4-8B 和 MiniCPM4-0.5B 与若干广泛使用的开源 LLM 做对比。对 MiniCPM4-0.5B，我们选择约 10 亿参数的几个模型，包括 Qwen3-0.5B, Llama3.2-1B, Gemma3-1B. 这些模型用数万亿 token 训练，并经过知识蒸馏，效果有保障。对 MiniCPM4-8B，我们选择约 100 亿参数的模型作为基线，包括 Qwen3-8B, GLM4（0414 版），Gemma3-12B 和 Phi4-14B.（正文写 Qwen3-0.5B，表 8 里对应列是 0.6B；表 8 还多了一列 LLaMA3.1-8B，正文此处没提。）

**Pre-training Pipeline** We adopt µP as our basic model architecture. Before model pre-training, we first search for hyperparameters, including learning rate, batch size, and parameter initial settings, with models containing millions of parameters. Then we follow a four-stage pipeline to pre-train MiniCPM4. First, we conduct a stable pre-training stage using 7 trillion tokens with a learning rate as 7 × 10−3. Then we perform an annealing pre-training stage using 1 trillion tokens. For these two stages, the context length is set as 4K. To enable long-sequence processing, we extend the context window from 4K to 32K. In this stage, we train our model with 20 billion tokens and use LongRoPE (Ding et al., 2024) as our position encoding. Notably, though we only train our model in 32K context, MiniCPM4 can process 128K sequences with YaRN (Peng et al., 2023). Following three pre-training stages, we conduct hybrid supervised fine-tuning and reinforcement learning to construct a hybrid reasoning model, MiniCPM4.1. To achieve ultimate inference speedup, we further conduct additional training for the speculative head to improve the acceptance length of the draft model.

**预训练流程** 我们以 µP 作为基础模型架构。预训练前，先用数百万参数的模型搜索超参数，包括学习率，batch size 和参数初始化设置。然后按四阶段流程预训练 MiniCPM4。第一，用 7 万亿 token 做稳定预训练阶段，学习率 7 × 10^-3。然后用 1 万亿 token 做退火预训练阶段。这两个阶段的上下文长度都是 4K. 为了能处理长序列，我们把上下文窗口从 4K 扩展到 32K；这一阶段用 200 亿 token 训练，位置编码采用 LongRoPE。值得注意的是，虽然只在 32K 上下文上训练，MiniCPM4 借助 YaRN 能处理 128K 序列。三个预训练阶段之后，我们做混合的监督微调和强化学习，构建混合推理模型 MiniCPM4.1。为了达到极致的推理加速，我们还对投机头做了额外训练，提高草稿模型的接受长度。

> **拆开：** 预训练到底用了多少 token? 第 6 页写 8.3T，第 29 页写 7T 加 1T，表 8 又写 8T。
> 把本文几处数字拆开对：第 6 页说 8B 模型在 8.3T token 上训练，WSD 的预热加稳定 7T，退火 1.3T. 第 29 页的四阶段流程写稳定阶段 7T，退火阶段 1T，长上下文扩展 20B，合计约 8.02T. 表 8 的 「# Train Data」 记 8T；摘要和第 4 页的 「8 万亿」，第 10 页的 「只用 8 万亿」，以及第 30 页 「8 万亿对 Qwen3 的 36 万亿，占 22%」 都按 8T 算（8/36 约 22.2%）。差别就在退火阶段是 1.3T 还是 1T，本文没有解释；按 8.3T 算比例是 23%，结论不变。另外第 6 页说长上下文训练把窗口从 4K 扩到 128K，第 29 页说训练只到 32K，128K 靠 YaRN 外推，两处要合起来读。这里说的 「四阶段」 实际只列了三个预训练阶段加一个后训练阶段。

## 5.2 Standard Evaluation（标准评测）

We show the evaluation results of MiniCPM4 and baseline models in Table 8. From the results, we can observe that: 1) Both of our models achieve state-of-the-art performance among models of similar size, demonstrating

表 8 给出 MiniCPM4 与基线模型的评测结果。从结果可以看到：1) 我们的两个模型在同等规模的模型中都达到了最先进的水平，证明了

<!-- page 30 of 44 -->

MiniCPM4

OpenBMB

Table 9: Evaluation results of MiniCPM4.1 and other open-source LLMs for deep reasoning tasks.

表 9: MiniCPM4.1 与其他开源 LLM 在深度推理任务上的评测结果。列依次为 Qwen3-8B, R1-Qwen3-8B, GLM-Z1-9B, MiMo-0530-7B, Nemotron-Nano-v2-9B（以上均为全注意力），以及 MiniCPM4.1-8B 的全注意力版和稀疏注意力版；行分知识，数学，代码，其他四组，最后一行是平均分。

<table><tr><td>Models# ParameterAttention</td><td>Qwen38BFull</td><td>R1-Qwen38BFull</td><td>GLM-Z19BFull</td><td>MiMo-05307BFull</td><td>Nemotron-Nano-v29BFull</td><td>MiniCPM4.18BFull</td><td>MiniCPM4.18BSparse</td></tr><tr><td colspan="8">Knowledge</td></tr><tr><td>MMLU</td><td>86.05</td><td>85.36</td><td>85.01</td><td>81.54</td><td>84.57</td><td>86.38</td><td>86.66</td></tr><tr><td>MMLU-Redux</td><td>87.33</td><td>86.25</td><td>86.50</td><td>82.62</td><td>84.98</td><td>86.41</td><td>86.05</td></tr><tr><td>CMMLU</td><td>81.68</td><td>80.53</td><td>76.00</td><td>66.10</td><td>61.59</td><td>84.94</td><td>84.72</td></tr><tr><td>CEval</td><td>84.84</td><td>84.44</td><td>77.11</td><td>66.99</td><td>63.62</td><td>84.38</td><td>85.75</td></tr><tr><td colspan="8">Math</td></tr><tr><td>GSM8K</td><td>95.30</td><td>93.86</td><td>95.91</td><td>96.13</td><td>95.22</td><td>94.16</td><td>94.01</td></tr><tr><td>MATH500</td><td>96.40</td><td>97.20</td><td>96.00</td><td>97.20</td><td>95.80</td><td>95.60</td><td>97.40</td></tr><tr><td>AIME24</td><td>73.33</td><td>83.33</td><td>75.62</td><td>78.12</td><td>71.67</td><td>83.33</td><td>80.83</td></tr><tr><td>AIME25</td><td>66.67</td><td>75.21</td><td>55.42</td><td>72.50</td><td>56.67</td><td>73.33</td><td>72.08</td></tr><tr><td colspan="8">Code</td></tr><tr><td>HumanEval</td><td>93.90</td><td>95.73</td><td>95.12</td><td>95.73</td><td>93.90</td><td>95.73</td><td>91.46</td></tr><tr><td>MBPP</td><td>81.32</td><td>92.61</td><td>89.49</td><td>91.83</td><td>93.39</td><td>92.22</td><td>91.05</td></tr><tr><td>LCB-v5</td><td>56.89</td><td>62.87</td><td>49.10</td><td>59.88</td><td>68.26</td><td>58.68</td><td>56.89</td></tr><tr><td>LCB-v6</td><td>48.57</td><td>53.14</td><td>42.29</td><td>52.00</td><td>60.00</td><td>52.00</td><td>51.43</td></tr><tr><td>MultiPL-E</td><td>59.22</td><td>54.09</td><td>49.48</td><td>53.26</td><td>57.50</td><td>57.73</td><td>56.84</td></tr><tr><td colspan="8">Other</td></tr><tr><td>IFEval</td><td>84.66</td><td>74.12</td><td>80.59</td><td>58.04</td><td>86.69</td><td>75.23</td><td>77.45</td></tr><tr><td>BBH</td><td>74.17</td><td>76.99</td><td>75.48</td><td>73.42</td><td>74.28</td><td>82.40</td><td>82.68</td></tr><tr><td>Average</td><td>78.02</td><td>79.72</td><td>75.27</td><td>75.02</td><td>76.54</td><td>80.17</td><td>79.69</td></tr></table>

the effectiveness of our training strategies. Furthermore, our models outperform several open-source large language models with significantly more parameters. For instance, MiniCPM4-0.5B achieves superior performance compared to Llama3.2-1B and Gemma3-1B, despite these models having twice the parameter scale of MiniCPM4. Similarly, MiniCPM4-8B surpasses Gemma3-12B and Phi4-14B. This further validates that by leveraging high-quality data and efficient learning algorithms, MiniCPM4 can achieve exceptional performance. 2) Compared to these open-source models, MiniCPM4 achieves excellent performance with significantly lower training costs. Specifically, MiniCPM4 demonstrates comparable performance to Qwen3, while Qwen3 utilizes 36 trillion tokens for training compared to MiniCPM4’s 8 trillion tokens – representing only 22% of Qwen3’s training data scale. 3) Among the baseline models, including Qwen3-0.6B/8B, Llama3.2-1B, and Gemma3-1B/12B, employ knowledge distillation training strategies, using larger teacher models to guide the training of end-side models. Our experimental results show that despite using only ground-truth as the supervision signals, our model still exhibits strong performance. The distillation process requires substantial computational resources to deploy teacher models. In the future, we will explore more efficient model distillation strategies to further enhance the performance of our end-side models.

我们训练策略的有效性。此外，我们的模型还超过了参数量大得多的几个开源大语言模型。比如 MiniCPM4-0.5B 优于 Llama3.2-1B 和 Gemma3-1B，尽管后两者的参数规模是 MiniCPM4 的两倍。同样，MiniCPM4-8B 超过了 Gemma3-12B 和 Phi4-14B. 这进一步证明，借助高质量数据和高效学习算法，MiniCPM4 能取得出色表现。2) 与这些开源模型相比，MiniCPM4 以低得多的训练成本取得了优秀的表现。具体来说，MiniCPM4 与 Qwen3 表现相当，而 Qwen3 训练用了 36 万亿 token，MiniCPM4 只用 8 万亿，仅为 Qwen3 训练数据规模的 22%. 3) 基线模型中，Qwen3-0.6B/8B，Llama3.2-1B 和 Gemma3-1B/12B 都采用知识蒸馏训练策略，用更大的教师模型指导端侧模型的训练。实验结果显示，尽管我们只用真实标注（ground-truth）作为监督信号，模型仍表现强劲。蒸馏过程需要大量计算资源来部署教师模型。未来我们会探索更高效的模型蒸馏策略，进一步提升端侧模型的表现。

We present the results of MiniCPM4.1-8B in Table 9. From the results, we can observe that: 1) MiniCPM4.1-8B achieves competitive performance with an overall average score of 79.93, outperforming similar-sized models. It demonstrates strong deep reasoning capabilities across various tasks. 2) The comparison between full attention (79.93 average) and sparse attention (79.14 average) shows only a 0.79-point difference, indicating that sparse attention has negligible impact on model performance while providing significant computational efficiency gains. This makes the sparse variant an attractive option for practical deployment where inference speed is crucial.

表 9 给出 MiniCPM4.1-8B 的结果。从结果可以看到：1) MiniCPM4.1-8B 取得了有竞争力的表现，总平均分 79.93，超过同等规模的模型，在各类任务上都展现出很强的深度推理能力。2) 全注意力（平均 79.93）与稀疏注意力（平均 79.14）只差 0.79 分，说明稀疏注意力对模型性能的影响可以忽略，同时带来明显的计算效率收益。这让稀疏版本在重视推理速度的实际部署中很有吸引力。

> **核对：** 正文的 79.93 和 79.14 在表 9 的哪里？
> 本文第 30 页表 9 最后一行 Average 写的是全注意力 80.17，稀疏注意力 79.69，差 0.48。用表里 15 项分数逐列求平均，七列依次是 78.02, 79.72, 75.27, 75.02, 76.54, 80.17, 79.69，与 Average 行完全一致。所以表本身自洽，正文的 79.93, 79.14 和 0.79 在表里找不到来源，可能出自表格更新前的版本。两套数字的结论方向一样：MiniCPM4.1-8B 全注意力平均分最高，稀疏版比全注意力低不到 1 分。细看还有一点正文没提：稀疏版 79.69 比 R1-Qwen3-8B 的 79.72 低 0.03，「超过同等规模模型」 只对全注意力版严格成立。

## 5.3 Long-Context Evaluation（长上下文评测）

In MiniCPM4, we extend the context window to 32K using the sparse attention mechanism. In this paragraph, we evaluate MiniCPM4 on long sequence understanding task. Specifically, we follow Hsieh et al. (2024) and evaluate our model on the needle in a haystack task (RULER-NIAH). We apply YaRN (Peng et al., 2023) to extend the context window of MiniCPM4 to 128K and evaluate MiniCPM4 with 128K NIAH.

在 MiniCPM4 中，我们用稀疏注意力机制把上下文窗口扩展到 32K. 本段评估 MiniCPM4 的长序列理解能力。具体来说，我们沿用 Hsieh et al. (2024)，在大海捞针任务（RULER-NIAH）上评测模型。我们用 YaRN 把 MiniCPM4 的上下文窗口扩展到 128K，并在 128K 的 NIAH 上评测。

<!-- page 31 of 44 -->

MiniCPM4

OpenBMB

![Chart block](images/p31-figure-7-the-evaluation-results-for-long-sequence.png)

Figure 7: The evaluation results for long sequence prefilling with sparse attention.

图 7：用稀疏注意力做长序列预填充的评测结果。

图本身是一张热力图，标题 「Pressure Testing MiniCPM-4-8B via RULER-NIAH」。横轴是上下文 token 数，从 0 到 131072 分几十档；纵轴是针插入的深度百分比，0 到 100 分 10 档；色条从 0（红）到 1（绿）。所有格子都是绿色，即每个长度和深度下都找到了针。

> **再看：** 图 7 的图题说是 「长序列预填充的评测结果」，图上却是大海捞针的热力图，该信哪个？
> 再看本文第 31 页的图：标题栏写 「Pressure Testing MiniCPM-4-8B via RULER-NIAH」，横轴是上下文长度（到 131072），纵轴是针的深度，色条是得分，没有任何速度或吞吐的量。引用它的正文（第 30 到 31 页 5.3 节）讲的也是 NIAH 准确率。所以图的内容是 128K 以内的 NIAH 结果，图题里的 「prefilling」 只能理解为 「这些长序列是用稀疏注意力预填充的」，不是速度测量。速度数据在第 1 页的图 1。

Table 10: Evaluation results of MiniCPM4.1 on RULER (32K).

表 10: MiniCPM4.1 在 RULER (32K) 上的评测结果。列是九个子任务（四种 NIAH 变体，两个 QA，变量追踪 VT，常见词抽取 CWE，高频词抽取 FWE）和加权平均 wAvg.；全注意力与稀疏版差距最大的是 NIAH-MK，100.00 对 87.33，稀疏版在 NIAH-MV 和 QA2 上反而更高。

| Datasets | NIAH-S | NIAH-MK | NIAH-MV | NIAH-MQ | QA1 | QA2 | VT | CWE | FWE | wAvg. |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| MiniCPM4.1 (Full) | 100.00 | 100.00 | 91.50 | 99.50 | 76.00 | 54.00 | 85.20 | 62.60 | 87.33 | 88.93 |
| MiniCPM4.1 (Sparse) | 100.00 | 87.33 | 94.50 | 98.50 | 72.00 | 56.00 | 85.20 | 60.40 | 87.33 | 85.84 |

The results are shown in Figure 7. From the results, we can observe that: 1) MiniCPM4 can achieve satisfactory performance on long sequences and achieve 100% accuracy on the needle in a haystack task. And for each token, MiniCPM4 only requires the model to attend 6K context tokens, which means on 128K context, the sparsity of MiniCPM4 is only 5%. 2) MiniCPM4 has good performance on context window extrapolation. Even we only pre-train the model on 32K context, MiniCPM4 can achieve 100% accuracy on 4× context length. In the following sections, we apply MiniCPM4 on the survey generation task, which requires the model to read and write long documents. And MiniCPM4 can achieve better performance than other baseline models, showing the effectiveness of MiniCPM4 on long-sequence processing.

结果见图 7。可以看到：1) MiniCPM4 在长序列上表现令人满意，在大海捞针任务上达到 100% 准确率。而且每个 token 只需关注 6K 个上下文 token，这意味着在 128K 上下文上，MiniCPM4 的稀疏度只有 5%. 2) MiniCPM4 的上下文窗口外推能力良好。即使只在 32K 上下文上预训练，它在 4 倍上下文长度上仍能达到 100% 准确率。在后面的小节中，我们把 MiniCPM4 用于综述生成任务，这需要模型阅读和撰写长文档。MiniCPM4 的表现优于其他基线模型，说明它在长序列处理上是有效的。

> **想：** 第 6 页说 「81% 注意力稀疏度」，这里说 「稀疏度只有 5%」，同一个词怎么一个大一个小？
> 两处 「sparsity」 的方向相反。本文第 31 页的算法是：每个 token 关注 6K 个上下文 token，128K 上下文里 6K/128K 约 4.7%，所以这里的 「稀疏度 5%」 指的是保留下来参与计算的比例。第 6 页 「81% attention sparsity」 按常规说法指被跳过的比例，即只算 19%。两个数字没有给在同一个上下文长度上：如果每个 token 固定看约 6K，19% 对应的上下文大约是 6K/0.19，约 32K，恰好是第 29 页说的训练长度。这是按本文数字推出来的一种读法，本文没有直接写 81% 是在多长的序列上统计的。

Based on the experimental results in Table 10, MiniCPM4.1 demonstrates strong long-context performance on the RULER benchmark. The sparse attention variant offers several advantages: 1) Maintained competitive performance: Despite a modest 3.09 percentage point decrease in weighted average (85.84% vs 88.93%), sparse attention can achieve comparable results on many long sequence tasks. 2) Computational efficiency: The minimal performance trade-off suggests that sparse attention effectively preserves long-context understanding capabilities while providing significant computational savings, making it particularly suitable for resourceconstrained applications requiring extended sequence processing.

根据表 10 的实验结果，MiniCPM4.1 在 RULER 基准上展现出很强的长上下文能力。稀疏注意力版本有几点优势：1) 保持有竞争力的表现：尽管加权平均下降了 3.09 个百分点（85.84% 对 88.93%），稀疏注意力在很多长序列任务上仍能取得相当的结果。2) 计算效率：性能代价很小，说明稀疏注意力在带来明显计算节省的同时，有效保留了长上下文理解能力，尤其适合需要处理长序列的资源受限应用。

## 5.4 Efficiency Evaluation（效率评测）

To achieve ultimate inference acceleration, we construct a sparse attention mechanism, InfLLM v2, in MiniCPM4, employ speculative sampling algorithms, FR-Spec, propose prefix-aware quantization algorithms, and build our specialized inference framework to realize ultimate speedup on end-side devices. To validate the effectiveness of our proposed algorithms, we test our model’s efficiency on two typical end-side chips in this section. Specifically, we select two edge chips: Jetson AGX Orin and RTX 4090. The former is widely deployed in end-side scenarios such as automotive chips and robotics, while the latter is primarily used as computing equipment in personal computers.

为达到极致的推理加速，我们在 MiniCPM4 中构建了稀疏注意力机制 InfLLM v2，采用投机采样算法 FR-Spec，提出前缀感知量化算法，并搭建专门的推理框架，在端侧设备上实现极致提速。为验证这些算法的有效性，本节在两种典型端侧芯片上测试模型效率。具体来说，我们选择两款边缘芯片：Jetson AGX Orin 和 RTX 4090。前者广泛用于汽车芯片和机器人等端侧场景，后者主要用作个人电脑中的计算设备。

The evaluation results are shown in Figure 1. We evaluate the throughput speed of Llama3-8B (Dubey et al., 2024), GLM4-9B (GLM et al., 2024), Qwen3-8B (Yang et al., 2025), and MiniCPM4 on sequences ranging from 32K to 128K. From the results, we can observe that: 1) Compared with open-source LLMs with similar

评测结果见图 1。我们在 32K 到 128K 的序列上评测了 Llama3-8B，GLM4-9B，Qwen3-8B 和 MiniCPM4 的吞吐速度。从结果可以看到：1) 与参数规模相近的开源 LLM 相比，我们

<!-- page 32 of 44 -->

MiniCPM4

OpenBMB

![Image block](images/p32-figure-8-the-outline-of-minicpm4-survey.png)

Figure 8: The outline of MiniCPM4-Survey.

图 8: MiniCPM4-Survey 的总体框架。

图分三块。上方 「Survey Generation Framework」：用户查询（示例是 「写一份 NLP 对比预训练技术的全面指南」）经 Agent-Planner 生成全局提纲（Global Plan，含 Abstract，Introduction，Fundamentals 及其下各级小节，Conclusion）；Agent-Writer 生成检索关键词，检索论文（示例有 SimCSE 等），从中抽取内容写出新段落，再更新当前综述，这几步多轮循环。左下 「Supervised Fine-Tuning Data Collection」：论文数据经引用匹配，综述论文经规则过滤，得到过滤后的论文，再由 LLM 改写与合成，输出段落，全局提纲，关键词三类数据，用来监督微调得到 SFT LLM。右下 「Two-stage Reinforcement Learning」：先做章节级强化学习，用段落，全局提纲，关键词和章节级奖励得到 RL-stage1 LLM；再做综述级强化学习，用当前综述和综述级奖励得到 RL-stage2 LLM。

parameter size, we can achieve consistent speedup in both prefilling and decoding scenarios. Specifically, compared to Qwen3-8B, we achieve approximately 7x decoding acceleration on Jetson AGX Orin. The results demonstrate the effectiveness of our approach. 2) As the text length increases, the efficiency advantage of our model becomes more pronounced. This is because the sparse attention mechanism can effectively reduce the computational and memory access overhead for long texts. As the text length that the model needs to process gradually increases, the memory access overhead of traditional dense attention mechanisms grows rapidly, while the number of context blocks that InfLLM v2 needs to access remains constant, with only the representation of semantic kernels growing slowly with sequence length. Therefore, in long sequence processing, MiniCPM4 can consistently handle long texts efficiently.

能在预填充和解码两种场景下都稳定提速。具体来说，与 Qwen3-8B 相比，我们在 Jetson AGX Orin 上实现约 7 倍的解码加速。结果证明了方法的有效性。2) 随着文本长度增加，模型的效率优势越发明显。这是因为稀疏注意力机制能有效降低长文本的计算和访存开销。随着模型需要处理的文本越来越长，传统稠密注意力的访存开销迅速增长，而 InfLLM v2 需要访问的上下文块数量保持不变，只有语义核的表示随序列长度缓慢增长。因此在长序列处理中，MiniCPM4 能始终高效地处理长文本。

## 6 Applications（应用）

The efficiency of MiniCPM4 unlock compelling capabilities across diverse scenarios. We highlight three key applications: (1) **Trustworthy Survey Generation** demonstrates its strength in efficient long-sequence processing, crucial for understanding and synthesizing complex information from large documents to produce accurate summaries. (2) **Tool Use with Model Context Protocol** is pivotal for agent-centric deployments, enabling MiniCPM4 to reliably interpret instructions, context, and state information to seamlessly interact with external tools and APIs – essential for building robust, capable agents.

MiniCPM4 的效率在多种场景中释放出有吸引力的能力。我们重点介绍三个关键应用：（1）**可信的综述生成** 展示它在高效长序列处理上的优势，这对理解和综合大量文档中的复杂信息，产出准确的总结至关重要。（2）**基于模型上下文协议的工具使用** 对以 Agent 为中心的部署很关键，让 MiniCPM4 能可靠地理解指令，上下文和状态信息，与外部工具和 API 无缝交互，这是构建稳健，能干的 Agent 的基础。

> **问：** 第 6 页和第 32 页都说 「三个应用」，为什么只列出两个？
> 本文第 32 页第 6 节开头写 「We highlight three key applications」，后面只有（1）综述生成和（2）MCP 工具使用，没有（3）。第 6 页引言也说 「三个应用」，括号里同样只举这两个，但描述要求时提到 「高度连贯的长序列生成」，「调用复杂函数获取外部资源」 和 「创意写作」 三种能力，前两种对应综述和 MCP，第三种写作没有对应的小节。第 3 页目录里第 6 节下也只有 6.1 和 6.2。所以本文实际只写了两个应用，「三个」 这个数字在正文里没有落实。

<!-- page 33 of 44 -->

MiniCPM4

OpenBMB

## 6.1 MiniCPM4-Survey: Trustworthy Survey Generation（MiniCPM4-Survey：可信的综述生成）

Developing a comprehensive literature survey presents a significant challenge, even for experienced researchers. This endeavor necessitates sophisticated capabilities, including collecting pertinent resources, aggregating and synthesizing diverse information, pinpointing critical challenges, and forecasting future research trajectories. Fortunately, the swift evolution of AI technologies, spurred by LLMs, is rendering automated deep research increasingly feasible. Recent efforts (Wang et al., 2024c; Li et al., 2025b; Wang et al., 2025a), such as projects like OpenAI Deep Research<sup>5</sup>and Gemini Deep Research<sup>6</sup>, leverage the long-form reasoning capabilities of modern LLMs to construct practical survey systems, simplifying the process for human researchers to assimilate extensive academic literature and rapidly grasp new fields of study.

写一篇全面的文献综述，即使对经验丰富的研究者也是很大的挑战。这项工作需要多种高阶能力，包括收集相关资源，汇总综合各类信息，找出关键难题，预判未来研究方向。好在由 LLM 推动的 AI 技术快速演进，让自动化的深度研究越来越可行。近期的工作，如 OpenAI Deep Research 和 Gemini Deep Research 等项目，借助现代 LLM 的长篇推理能力构建实用的综述系统，让人类研究者更容易消化大量学术文献，快速把握新的研究领域。

On-device survey systems present important advantages complementary to cloud-based services. Crucially, for users with strict confidentiality needs who cannot upload resources to the cloud, locally deployed, in-house models are the only viable option. This maintains data integrity and control. Furthermore, deploying smallerscale models on-device significantly cuts computational costs during inference, a key consideration given the high token consumption inherent in the survey writing process. This makes localized systems both secure and economically sensible for many applications.

端侧综述系统具有与云服务互补的重要优势。最关键的是，对保密要求严格，不能把资料上传到云端的用户来说，本地部署的自有模型是唯一可行的选择，这能保持数据的完整性和可控性。此外，在端侧部署较小规模的模型能大幅降低推理时的计算成本；考虑到综述写作过程本身消耗的 token 很多，这一点很重要。这让本地化系统在很多应用中既安全又经济。

To this end, we propose **MiniCPM4-Survey**, a model built upon MiniCPM4-8B that is capable of generating trustworthy, long-form survey papers while maintaining competitive performance relative to significantly larger models. Specifically, our model works in a Plan-Retrieve-Write manner, wherein it operates through three core stages: (1) Planning: defining the overall structure of the survey from a global perspective, specifying the content to be addressed in each section, subsection, and paragraph; (2) Retrieval: generating appropriate retrieval keywords based on the planner-generated outline and querying a knowledge base to obtain relevant literature; and (3) Writing: synthesizing the retrieved information to generate coherent section-level content, iteratively proceeding until the entire survey is complete.

为此我们提出 **MiniCPM4-Survey**，一个基于 MiniCPM4-8B 构建的模型，能生成可信的长篇综述论文，表现与规模大得多的模型相当。具体来说，模型按 「规划，检索，写作」（Plan-Retrieve-Write）的方式工作，分三个核心阶段：（1）规划：从全局视角确定综述的整体结构，明确每一节，每一小节和每一段要写的内容；（2）检索：根据规划器生成的提纲生成合适的检索关键词，查询知识库获取相关文献；（3）写作：综合检索到的信息，生成连贯的章节级内容，迭代推进直到整篇综述完成。

To augment the capabilities of MiniCPM4-8B for this task, we curate and process a large corpus of expertauthored survey papers to construct a high-quality training dataset. Concurrently, we compile an extensive collection of research papers to build a retrieval database. We further introduce a multi-stage training pipeline comprising: supervised fine-tuning, section-level reinforcement learning, and survey-level reinforcement learning. By combining the efficiency of a compact model with a rigorous training methodology, MiniCPM4- Survey delivers performance on par with, and in some cases exceeding, that of large-scale LLMs, while remaining accessible and cost-efficient.

为增强 MiniCPM4-8B 在这项任务上的能力，我们收集并处理了大量专家撰写的综述论文，构建高质量训练数据集。同时，我们汇编了大量研究论文来搭建检索数据库。我们还引入多阶段训练流程：监督微调，章节级强化学习和综述级强化学习。把紧凑模型的效率与严谨的训练方法结合起来，MiniCPM4-Survey 的表现与大规模 LLM 相当，某些情况下还更好，同时易于获取，成本低。

## 6.1.1 Data Construction（数据构建）

As previously outlined, the survey generation pipeline involves several key stages, including planning, iterative retrieval, and content generation, which necessitate training data covering each of these stages comprehensively. To improve the survey generation capabilities of MiniCPM4, we prioritized constructing high-quality datasets derived primarily from academic surveys, ensuring robust training outcomes. Specifically, we collected approximately 2.71 million paper abstracts from Kaggle<sup>7</sup>as foundational data. Subsequently, we built an efficient retrieval index using MiniCPM-Embedding-Light<sup>8</sup>in conjunction with Faiss<sup>9</sup>.

如前所述，综述生成流程包括规划，迭代检索和内容生成等几个关键阶段，需要全面覆盖每个阶段的训练数据。为提升 MiniCPM4 的综述生成能力，我们优先构建主要来自学术综述的高质量数据集，以保证训练效果。具体来说，我们从 Kaggle 收集了约 271 万篇论文摘要作为基础数据。随后用 MiniCPM-Embedding-Light 配合 Faiss 搭建了高效的检索索引。

To ensure the usability and quality of the data, raw data underwent rigorous preprocessing steps before constructing the training dataset. These steps included filtering out multimodal elements, such as tables and images, removing references not indexed in the database, and standardizing data formats. It is important to note that, beyond simple rule-based methods, we significantly utilized Large Language Models (LLMs) to rewrite and refine the raw data, thereby enhancing its consistency and relevance. Additionally, adhering to the survey generation framework proposed by Wang et al. (2025a), we synthesized three distinct types of data—queries, plans, and retrieval keywords—from the preprocessed data. These synthesized datasets were systematically structured according to the Query2Plan and Plan2Survey stages, yielding 3,750 and 61,684 training samples respectively.

为保证数据的可用性和质量，构建训练集之前，原始数据经过了严格的预处理，包括过滤表格和图片等多模态元素，删除数据库中没有收录的参考文献，以及统一数据格式。值得注意的是，除了简单的规则方法，我们还大量使用大语言模型（LLM）改写和润色原始数据，提高一致性和相关性。此外，按照 Wang et al. (2025a) 提出的综述生成框架，我们从预处理后的数据中合成了三类数据：查询，提纲和检索关键词。这些合成数据按 Query2Plan 和 Plan2Survey 两个阶段组织，分别得到 3,750 和 61,684 条训练样本。

<small><span class="docvortex-page-footnote" data-block-type="page_footnote" style="color:#6b7280"><sup>5</sup>[https://openai.com/index/introducing-deep-research](https://openai.com/index/introducing-deep-research)</span></small>

脚注 5: OpenAI 介绍 Deep Research 的页面。

<small><span class="docvortex-page-footnote" data-block-type="page_footnote" style="color:#6b7280"><sup>6</sup>[https://gemini.google/overview/deep-research](https://gemini.google/overview/deep-research)</span></small>

脚注 6: Gemini Deep Research 的概览页。

<small><span class="docvortex-page-footnote" data-block-type="page_footnote" style="color:#6b7280"><sup>7</sup>[https://www.kaggle.com/api/v1/datasets/download/Cornell-University/arxiv](https://www.kaggle.com/api/v1/datasets/download/Cornell-University/arxiv)</span></small>

脚注 7: Kaggle 上 Cornell University arXiv 数据集的下载地址。

<small><span class="docvortex-page-footnote" data-block-type="page_footnote" style="color:#6b7280"><sup>8</sup>[https://huggingface.co/openbmb/MiniCPM-Embedding-Light](https://huggingface.co/openbmb/MiniCPM-Embedding-Light)</span></small>

脚注 8: MiniCPM-Embedding-Light 的 Hugging Face 页面。

<small><span class="docvortex-page-footnote" data-block-type="page_footnote" style="color:#6b7280"><sup>9</sup>[https://github.com/facebookresearch/faiss](https://github.com/facebookresearch/faiss)</span></small>

脚注 9: Faiss 的 GitHub 仓库。

<!-- page 34 of 44 -->

MiniCPM4

OpenBMB

Table 11: Reward System for different agent abilities.

表 11：面向不同 Agent 能力的奖励体系。规划能力：结构合理性（LLM 加规则判断，提纲是否合理），结构相似度（规则，是否接近标准提纲），真实性（LLM，提纲内容是否真实可靠）。检索能力：召回分（LLM，召回的论文是否包含标准论文）。内容写作：长度（规则，各节长度是否合理），语言（规则，是否只用英文），相关性（是否聚焦用户查询），覆盖度（是否覆盖广泛的相关主题），深度（是否有深入，有层次的论述），新颖性（是否覆盖用户查询的若干新角度），冗余度（是否简洁，无重复章节），这五项都由 LLM 判断。引用写作：幻觉（规则，所有引用是否都出现在检索到的信息中），事实分（LLM，事实陈述是否与引用一致）。

<table><tr><td>Agent Ability</td><td>Metrics</td><td>Judgement</td><td>Description</td></tr><tr><td rowspan="3">Planning</td><td>Structure Rationality</td><td>LLM &amp; Rule</td><td>Whether the outline is reasonable.</td></tr><tr><td>Structure Similarity</td><td>Rule</td><td>Whether similar to the golden plan.</td></tr><tr><td>Truthfulness</td><td>LLM</td><td>Whether the content in the plan is real and reliable.</td></tr><tr><td>Searching</td><td>Recall Score</td><td>LLM</td><td>Whether the recalled papers include the golden papers.</td></tr><tr><td rowspan="7">Content Writing</td><td>Length</td><td>Rule</td><td>Whether the length of each section is reasonable.</td></tr><tr><td>Language (en)</td><td>Rule</td><td>Whether the response is in English only.</td></tr><tr><td>Relevance</td><td>LLM</td><td>Whether focus on the user&#x27;s query.</td></tr><tr><td>Coverage</td><td>LLM</td><td>Whether covers a wide range of related topics.</td></tr><tr><td>Depth</td><td>LLM</td><td>Whether reflects deep and dynamic discourse.</td></tr><tr><td>Novelty</td><td>LLM</td><td>Whether covers several new aspects of the user&#x27;s query.</td></tr><tr><td>Redundancy</td><td>LLM</td><td>Whether concise and no repeat sections.</td></tr><tr><td rowspan="2">Citation Writing</td><td>Hallucination</td><td>Rule</td><td>Whether all the citations appear in the retrieved information.</td></tr><tr><td>Fact Score</td><td>LLM</td><td>Whether the fact claims are consistent with citations.</td></tr></table>

## 6.1.2 Training Strategy（训练策略）

Given that survey generation poses considerable complexity for foundational models, we first employed small-scale Supervised Fine-Tuning (SFT) with a limited dataset to achieve effective cold-start performance and boost the likelihood of positive example sampling. Subsequently, we transitioned to a Reinforcement Learning (RL) phase, enabling steady and sustained performance enhancement. Importantly, we decomposed the RL process into two distinct phases: initially optimizing rewards at the chapter-level to ensure contextual coherence and structural precision within each chapter, followed by shifting the optimization target towards overall survey-level objectives, enhancing global coherence, depth, and thematic relevance. This progressively challenging optimization strategy significantly enhanced the final performance of the model.

综述生成对基础模型来说相当复杂，所以我们先用有限的数据做小规模监督微调（SFT），实现有效的冷启动，提高采到正例的概率。随后转入强化学习（RL）阶段，让性能稳定持续地提升。重要的是，我们把 RL 过程拆成两个阶段：先在章节级优化奖励，保证每章内部的上下文连贯和结构准确；再把优化目标转向整篇综述层面，增强全局连贯性，深度和主题相关性。这种逐步加码的优化策略明显提升了模型的最终表现。

It is important to highlight three primary challenges encountered during training for survey generation capabilities. First, the quality of generated surveys is difficult to reliably assess using traditional metrics such as perplexity (PPL), necessitating the creation of a dedicated reward system. Second, survey generation involves multiple complex stages, demanding robust context management to ensure retention of essential information while facilitating efficient reasoning. Third, the iterative retrieval and evaluation inherent in the generation process demand low-latency interactions to maintain efficient RL training cycles. To address these challenges, we specifically implemented the following optimizations:

需要强调训练综述生成能力时遇到的三个主要挑战。第一，生成综述的质量很难用困惑度（PPL）这类传统指标可靠评估，必须专门建立奖励体系。第二，综述生成涉及多个复杂阶段，需要稳健的上下文管理，既保留关键信息又支持高效推理。第三，生成过程中固有的迭代检索和评估，要求低延迟交互，才能保持 RL 训练周期的效率。为应对这些挑战，我们专门做了以下优化：

**Reward Design:** Recognizing the crucial role reward design plays in reinforcement learning, we established a comprehensive reward framework to assess key model capabilities, including planning, retrieval, content creation, and citation accuracy. This system evaluates model performance across multiple metrics—such as structural coherence, authenticity, recall precision, relevance, content depth, coverage breadth, novelty, redundancy, hallucination frequency, and factual accuracy—leveraging both large-scale language models and rule-based evaluations. Detailed descriptions can be found in Table 11.

**奖励设计：** 奖励设计在强化学习中起关键作用，我们为此建立了全面的奖励框架，评估规划，检索，内容创作和引用准确性等关键能力。该体系从多项指标评估模型表现，如结构连贯性，真实性，召回精度，相关性，内容深度，覆盖广度，新颖性，冗余度，幻觉频率和事实准确性，同时借助大语言模型和基于规则的评估。详见表 11。

**Context Manager:** The inherent complexity of multi-step reinforcement learning requires robust, dynamic context management. Our context manager incorporates three essential functionalities:

**上下文管理器：** 多步强化学习本身的复杂性，需要稳健，动态的上下文管理。我们的上下文管理器包含三项基本功能：

• Prompt Updating: Dynamically adjusts prompts according to historical interactions.

• 提示更新：根据历史交互动态调整提示。

• Historical Recording: Maintains a detailed record of interactions—including prompts, responses, penalties, retrieval actions, and evaluation scores—enabling precise reconstruction of learning trajectories.

• 历史记录：详细记录交互，包括提示，回答，惩罚，检索动作和评估分数，能精确重建学习轨迹。

• Advantage Allocation: Assigns finely-tuned advantage scores through a combination of step-level format penalties and trajectory-level rewards, thus facilitating accurate token-level optimizations.

• 优势分配：结合步级格式惩罚和轨迹级奖励，分配精细调整的优势分数，从而支持准确的 token 级优化。

**Parallel Environment Interaction:** To mitigate latency caused by asynchronous external dependencies such as retrieval and evaluation systems, we employed parallel environment interactions using dedicated server instances. Drawing inspiration from recent developments in asynchronous API-driven multi-turn RL systems, this strategy markedly enhanced training efficiency by reducing feedback loop bottlenecks.

**并行环境交互：** 为缓解检索和评估系统等异步外部依赖带来的延迟，我们用专用服务器实例做并行环境交互。这一策略借鉴了近期异步，API 驱动的多轮 RL 系统的进展，通过减少反馈回路的瓶颈明显提升了训练效率。

<!-- page 35 of 44 -->

MiniCPM4

OpenBMB

Table 12: Performance comparison of the survey generation systems。“G2FT” stands for Gemini-2.0-Flash-Thinking, and “WTR1-7B” denotes Webthinker-R1-7B. FactScore evaluation was omitted for Webthinker, as it does not include citation functionality, and for OpenAI Deep Research, which does not provide citations when exporting the results.

表 12：各综述生成系统的性能对比。「G2FT」 指 Gemini-2.0-Flash-Thinking，「WTR1-7B」 指 Webthinker-R1-7B. Webthinker 不带引用功能，OpenAI Deep Research 导出结果时不提供引用，所以这两者没有做 FactScore 评估。表中内容质量四项（相关性，覆盖度，深度，新颖性）及其平均是 GPT-4o 评出的分数，最后一列事实分是百分比。

<table><tr><td rowspan="2">Method</td><td colspan="5">Content Quality</td><td rowspan="2">Faithfulness Fact Score</td></tr><tr><td>Relevance</td><td>Coverage</td><td>Depth</td><td>Novelty</td><td>Avg.</td></tr><tr><td>Naive RAG (driven by G2FT)</td><td>3.25</td><td>2.95</td><td>3.35</td><td>2.60</td><td>3.04</td><td>43.68</td></tr><tr><td>AutoSurvey (driven by G2FT)</td><td>3.10</td><td>3.25</td><td>3.15</td><td>3.15</td><td>3.16</td><td>46.56</td></tr><tr><td>Webthinker (driven by WTR1-7B)</td><td>3.30</td><td>3.00</td><td>2.75</td><td>2.50</td><td>2.89</td><td>-</td></tr><tr><td>Webthinker (driven by QwQ-32B)</td><td>3.40</td><td>3.30</td><td>3.30</td><td>2.50</td><td>3.13</td><td>-</td></tr><tr><td>OpenAI Deep Research (driven by GPT-4o)</td><td>3.50</td><td>3.95</td><td>3.55</td><td>3.00</td><td>3.50</td><td>-</td></tr><tr><td>MiniCPM4-Survey</td><td>3.45</td><td>3.70</td><td>3.85</td><td>3.00</td><td>3.50</td><td>68.73</td></tr><tr><td>w/o RL</td><td>3.55</td><td>3.35</td><td>3.30</td><td>2.25</td><td>3.11</td><td>50.24</td></tr></table>

## 6.1.3 Evaluations（评测）

**Baselines** To validate the effectiveness of our model, we also examine its performance relative to the following representative baseline systems. These systems were chosen to cover a spectrum of established approaches and provide a comprehensive benchmark for comparison: (1)Naive RAG is a straightforward retrieval-augmented generation method. It directly inputs all query-retrieved documents to the model, which then generates a comprehensive survey in a single, non-iterative pass. (2) AutoSurvey (Wang et al., 2024c) is a structured framework for automated academic survey generation, typically employing systematic processes such as planning, multi-source literature retrieval, and coherent content synthesis for its outputs. (3) WebThinker (Li et al., 2025b) is a deep research framework powered by large reasoning models for tasks like QA or report generation. We evaluate training-free configurations using QwQ-32B (Team, 2025) and the DeepSeek-R1-Distill-Qwen-7B model as comparative baselines. (4) OpenAI Deep Research is an OpenAI system employing multi-step online information acquisition to generate detailed reports from user queries, utilizing long-form reasoning capabilities of GPT. Note that both AutoSurvey and Naive RAG are training-free methods. We use gemini-2.0-flash-thinking- exp-1219<sup>10</sup> as the backbone for them.

**基线** 为验证模型的有效性，我们还考察了它相对以下代表性基线系统的表现。选这些系统是为了覆盖一系列成熟做法，提供全面的对比基准：（1）Naive RAG 是直接的检索增强生成方法，把查询检索到的所有文档直接输入模型，模型一次性，非迭代地生成完整综述。（2）AutoSurvey 是自动生成学术综述的结构化框架，通常采用规划，多源文献检索和连贯内容综合等系统化流程。（3）WebThinker 是由大型推理模型驱动的深度研究框架，用于问答或报告生成等任务。我们用 QwQ-32B 和 DeepSeek-R1-Distill-Qwen-7B 模型评估其免训练配置，作为对比基线。（4）OpenAI Deep Research 是 OpenAI 的系统，通过多步在线信息获取，利用 GPT 的长篇推理能力，根据用户查询生成详细报告。注意 AutoSurvey 和 Naive RAG 都是免训练方法，我们用 gemini-2.0-flash-thinking-exp-1219 作为它们的底座。

**Evaluation Details** We use the SurveyEval dataset released by Wang et al. (2025a) as the test set, which includes 20 test examples. Inspired by STORM (Shao et al., 2024a) and FactScore (Min et al., 2023), we use the following four metrics to assess the quality of model-generated surveys: (1) Relevance assesses whether the survey effectively maintains clear focus on, and direct relevance to, the user’s specific query, avoiding unrelated tangents or digressions. (2) Coverage evaluates whether the survey offers comprehensive coverage of the designated topic, thoroughly exploring its key sub-areas, diverse facets, and important established knowledge within the field. (3) Depth determines whether the survey thoroughly examines the core topic and its related areas, providing sufficient analytical detail, critical evaluation, and meaningful insight into complex underlying issues. (4) Novelty judges whether the survey introduces genuinely novel perspectives, original interpretations, or significant previously unarticulated connections pertinent to the user’s initial query. (5) Fact Score quantifies the proportion of discrete, verifiable atomic facts presented within the survey that are accurately and explicitly substantiated by appropriate and credible cited references. We use the GPT-4o as a judge to evaluate these metrics.

**评测细节** 我们使用 Wang et al. (2025a) 发布的 SurveyEval 数据集作为测试集，共 20 个测试样例。受 STORM 和 FactScore 启发，我们用以下四项指标评估模型生成综述的质量：（1）相关性：综述是否始终清晰聚焦于用户的具体查询，直接相关，不跑题。（2）覆盖度：综述是否全面覆盖指定主题，深入探讨其关键子领域，不同侧面和领域内重要的既有知识。（3）深度：综述是否深入考察核心主题及相关领域，提供足够的分析细节，批判性评估和对复杂深层问题的有意义洞见。（4）新颖性：综述是否提出真正新颖的视角，原创的解读，或与用户初始查询相关的，此前未被阐明的重要联系。（5）事实分：量化综述中那些离散，可验证的原子事实里，有多大比例能被恰当可信的引用准确，明确地支撑。我们用 GPT-4o 作为评委评估这些指标。（原文说 「四项指标」，实际列了五项。）

**Results** As shown in Table 12, our proposed method surpasses baseline systems driven by both open-source (e.g., Webthinker) and closed-source models (e.g., AutoSurvey) in content-related metrics. Our approach achieves performance comparable to OpenAI Deep Research, highlighting its effectiveness and competitiveness. Furthermore, our method attains the highest scores among the examined systems for factual metrics. Furthermore, the MiniCPM4-Survey shows significant improvement from SFT to RL, underscoring the efficacy of the RL component introduced in the latter stages. Specifically, enhancements are observed in Coverage, Depth, and Novelty, indicating strengthened exploration and planning capabilities. Despite these gains, MiniCPM4-Survey still lags behind some baseline methods in Coverage and Novelty, suggesting further opportunities to enhance its strategic planning and exploratory capacity.

**结果** 如表 12 所示，我们的方法在内容相关指标上超过了由开源模型（如 Webthinker）和闭源模型（如 AutoSurvey）驱动的基线系统。我们的方法达到与 OpenAI Deep Research 相当的表现，显示出有效性和竞争力。此外，在事实类指标上，我们的方法在所考察的系统中得分最高。MiniCPM4-Survey 从 SFT 到 RL 有明显提升，说明后期引入的 RL 组件是有效的。具体来说，覆盖度，深度和新颖性都有提升，表明探索和规划能力得到加强。尽管如此，MiniCPM4-Survey 在覆盖度和新颖性上仍落后于部分基线方法，说明它的策略规划和探索能力还有提升空间。

<small><span class="docvortex-page-footnote" data-block-type="page_footnote" style="color:#6b7280">10<a href="https://ai.google.dev/gemini-api/docs/models"><sub>https</sub>://ai.google.dev/gemini-api/docs/models</a></span></small>

脚注 10: Gemini API 的模型文档页。

<!-- page 36 of 44 -->

MiniCPM4

OpenBMB

## 6.2 MiniCPM4-MCP: Tool Use with Model Context Protocol（MiniCPM4-MCP：基于模型上下文协议的工具使用）

The interaction logic between large language models (LLMs) and external tools has traditionally been statically designed and lacks standardization, which is not compatible with the rapid, independent evolution of agents and tools. This incompatibility leads to high maintenance costs, poor scalability, limited reusability of prior interaction patterns, and fragmented design standards, ultimately resulting in redundant development efforts (Hou et al., 2025). To solve the issue, MCP establishes a universal and standardized framework that enables LLMs to connect with diverse tools in a seamless and secure manner, thereby facilitating coordinated utilization of various resources.

大语言模型（LLM）与外部工具之间的交互逻辑，传统上是静态设计的，缺乏标准化，跟不上 Agent 和工具各自快速独立演进的节奏。这种不兼容导致维护成本高，扩展性差，已有交互模式难以复用，设计标准碎片化，最终造成重复开发。为解决这一问题，MCP 建立了一个通用，标准化的框架，让 LLM 能无缝，安全地连接各种工具，从而协同利用各类资源。

Recently, various MCP servers with tools have been constructed in the open-source community (Hou et al., 2025), aiming to enable LLMs to discover, select, and orchestrate different tools for real-world task-solving demands. To align with the rapid development of MCP servers, we investigate the potential of enabling MiniCPM4 with MCP tool-calling capabilities.

最近，开源社区搭建了各种带工具的 MCP 服务器，目标是让 LLM 能发现，选择和编排不同工具，满足真实任务的求解需求。为跟上 MCP 服务器的快速发展，我们研究了让 MiniCPM4 具备 MCP 工具调用能力的潜力。

To this end, we propose MiniCPM4-MCP, a model built upon MiniCPM4-8B that is capable of solving a wide range of real-world tasks by interacting with various tool and data resources through MCP. We present the process of adapting MiniCPM4 to master MCP servers with tools. The overall model performance on our human-annotated MCP-tool-calling test data demonstrate the effectiveness of MiniCPM4-MCP.

为此我们提出 MiniCPM4-MCP，一个基于 MiniCPM4-8B 构建的模型，能通过 MCP 与各种工具和数据资源交互，解决广泛的真实任务。我们介绍了让 MiniCPM4 掌握带工具的 MCP 服务器的适配过程。模型在我们人工标注的 MCP 工具调用测试数据上的整体表现，证明了 MiniCPM4-MCP 的有效性。

## 6.2.1 Data Construction（数据构建）

Our data construction process consists of three main parts, including data generation, reverse data generation, and the conversion of existing function call datasets into the MCP tool using format, where reverse data generation contains single-tool and cross-tool settings. All data undergo both manual and LLM-assisted quality check procedures. More details are as follows.

我们的数据构建过程包括三个主要部分：数据生成，反向数据生成，以及把现有函数调用数据集转换为 MCP 工具使用格式；其中反向数据生成包含单工具和跨工具两种设定。所有数据都经过人工和 LLM 辅助的质量检查。细节如下。

**Data Generation** Many existing datasets contain high-quality queries along with annotations of the final results. We focus on identifying those queries that can be effectively addressed with the assistance of MCP servers. To this end, we manually examined the scenarios covered by publicly available datasets and selected a subset of relevant ones. For each selected dataset, we performed sampling of query completion processes using a client equipped with LLMs and MCP servers integrated in the environment. Trajectories whose final outcomes are consistent with the original annotations are retained and used for constructing training data.

**数据生成** 很多现有数据集包含高质量的查询以及最终结果的标注。我们着重找出那些借助 MCP 服务器能有效解决的查询。为此，我们人工检查了公开数据集覆盖的场景，选出一部分相关数据集。对每个选中的数据集，我们用一个配备 LLM，且环境中集成了 MCP 服务器的客户端，对查询的完成过程做采样。最终结果与原始标注一致的轨迹被保留下来，用于构建训练数据。

**Reverse Data Generation** For the servers and tools integrated within the environment, we employ Claude-3.7-Sonnet to perform reverse query construction based on the description of each tool. Specifically, Claude-3.7-Sonnet generates queries that would necessitate the use of the target tool, and then calls the tool to solve the constructed queries. This process results in the creation of a single-tool data instance and is referred to as single-tool data reverse construction. In addition, to train MiniCPM4’s cross-tool calling capabilities, we construct cross-tool data by selecting two tools under the same server along with their respective descriptions. Claude-3.7-Sonnet then generates queries that require the simultaneous use of both tools and is constrained to call both specified tools to solve the queries.

**反向数据生成** 对环境中集成的服务器和工具，我们用 Claude-3.7-Sonnet 根据每个工具的描述反向构造查询。具体来说，Claude-3.7-Sonnet 生成必须用到目标工具的查询，再调用该工具解决构造出的查询。这一过程产出一条单工具数据，称为单工具数据反向构造。此外，为训练 MiniCPM4 的跨工具调用能力，我们选取同一服务器下的两个工具及其描述来构造跨工具数据。Claude-3.7-Sonnet 生成需要同时用到这两个工具的查询，并被约束必须调用这两个指定工具来解决。

**Conversion from Existing Tool Learning Data** We collected publicly available datasets related to tool usage and extracted data that could be parsed and converted into trajectory formats consistent with the MCP tool calling schema. These data were used to train MiniCPM4 with the aim of equipping it with fundamental capabilities such as adherence to tool invocation formats, accurate interpretation of user instructions, and correct filling of specified parameters. The dataset comprises approximately 140,000 instances.

**从现有工具学习数据转换** 我们收集了与工具使用相关的公开数据集，从中抽取能解析并转换为符合 MCP 工具调用 schema 的轨迹格式的数据。这些数据用于训练 MiniCPM4，目的是让它具备基本能力，比如遵守工具调用格式，准确理解用户指令，正确填写指定参数。这部分数据约 14 万条。

All constructed data undergo a dual-phase quality inspection, involving both human evaluation and verification by a large language model (LLM). Trajectories that pass human inspection are prioritized as test data, while those that pass LLM inspection but have not been manually verified are retained as training data.

所有构建的数据都经过两阶段质量检查，包括人工评估和大语言模型（LLM）验证。通过人工检查的轨迹优先用作测试数据；通过 LLM 检查但未经人工核实的轨迹留作训练数据。

## 6.2.2 Training Strategy（训练策略）

We primarily adopt a learning-from-demonstration approach to train our model. The demonstrations are generated through continuous interactions between an LLM and the MCP environment. Therefore, in this section, we first introduce the key feature in building the environment. We then present the key feature of the client designed for interacting with the environment. Finally, we describe how MiniCPM learns from these demonstrations.

我们主要采用从示范中学习的方法训练模型。示范由 LLM 与 MCP 环境的持续交互生成。因此本节先介绍搭建环境的关键要点，再介绍为与环境交互而设计的客户端的关键特性，最后描述 MiniCPM 如何从这些示范中学习。

<!-- page 37 of 44 -->

MiniCPM4

OpenBMB

Table 13: MCP tool use accuracy (%), where “func”，“param”，and “p\_v”，denote function name, parameter name, and parameter value of a tool call, respectively。“Average” stands for sample-weighted average accuracy across the MCP servers.

表 13: MCP 工具使用准确率（%）。「func」，「param」，「p_v」 分别指工具调用的函数名，参数名和参数值。「Average」 是按样本数加权的各 MCP 服务器平均准确率。三组列依次是 GPT-4o，Qwen3-8B 和 MiniCPM4-MCP（表头被 MinerU 拆成了 「Min | iCPM4-M | CP」），行是 16 个 MCP 服务器。平均行：GPT-4o 80.2, 70.2, 49.1; Qwen3-8B 83.5, 67.7, 43.8; MiniCPM4-MCP 88.3, 76.1, 51.2.

|  |  | GPT-4o |  |  | Qwen3 8B |  | Min | iCPM4-M | CP |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| MCP Servers | func | param | p_v | func | param | p_v | func | param | p_v |
| Airbnb | 89.3 | 67.9 | 53.6 | 92.8 | 60.7 | 50.0 | 96.4 | 67.9 | 50.0 |
| Amap-Maps | 79.8 | 77.5 | 50.0 | 74.4 | 72.0 | 41.0 | 89.3 | 85.7 | 39.9 |
| Arxiv-MCP-Server | 85.7 | 85.7 | 85.7 | 81.8 | 54.5 | 50.0 | 57.1 | 57.1 | 52.4 |
| Calculator | 100.0 | 100.0 | 20.0 | 80.0 | 80.0 | 13.3 | 100.0 | 100.0 | 6.67 |
| Computor-Control-MCP | 90.0 | 90.0 | 90.0 | 90.0 | 90.0 | 90.0 | 90.0 | 90.0 | 86.7 |
| Desktop-Commander | 100.0 | 100.0 | 100.0 | 100.0 | 100.0 | 100.0 | 100.0 | 100.0 | 100.0 |
| Filesystem | 63.5 | 63.5 | 31.3 | 69.7 | 69.7 | 26.0 | 83.3 | 83.3 | 42.7 |
| Github | 92.0 | 80.0 | 58.0 | 80.5 | 50.0 | 27.7 | 62.8 | 25.7 | 17.1 |
| Gaode | 71.1 | 55.6 | 17.8 | 68.8 | 46.6 | 24.4 | 68.9 | 46.7 | 15.6 |
| MCP-Code-Executor | 85.0 | 80.0 | 70.0 | 80.0 | 80.0 | 70.0 | 90.0 | 90.0 | 65.0 |
| MCP-Docx | 95.8 | 86.7 | 67.1 | 94.9 | 81.6 | 60.1 | 95.1 | 86.6 | 76.1 |
| PPT | 72.6 | 49.8 | 40.9 | 85.9 | 50.7 | 37.5 | 91.2 | 72.1 | 56.7 |
| PPTx | 64.2 | 53.7 | 13.4 | 91.0 | 68.6 | 20.9 | 91.0 | 58.2 | 26.9 |
| Simple-Time-Server | 90.0 | 70.0 | 70.0 | 90.0 | 90.0 | 90.0 | 90.0 | 60.0 | 60.0 |
| Slack | 100.0 | 90.0 | 70.0 | 100.0 | 100.0 | 65.0 | 100.0 | 100.0 | 100.0 |
| Whisper | 90.0 | 90.0 | 90.0 | 90.0 | 90.0 | 90.0 | 90.0 | 90.0 | 30.0 |
| Average | 80.2 | 70.2 | 49.1 | 83.5 | 67.7 | 43.8 | 88.3 | 76.1 | 51.2 |

**MCP Environment Construction** The setup of the MCP environment involves a substantial workload and a lengthy debugging process. To minimize the effort required from developers and to enable a plugand-play configuration, we have adopted a Docker-based approach in which all servers are installed within Docker containers. Specifically, we collect frequently used and prevalent MCP servers from both official and community MCP websites, spanning various domains such as office productivity, daily life, communication, information services, and work management. These servers are then debugged within the Docker container until they can be successfully launched.

**MCP 环境搭建** 搭建 MCP 环境工作量大，调试过程漫长。为尽量减少开发者的工作，做到即插即用的配置，我们采用基于 Docker 的方式，把所有服务器都装在 Docker 容器里。具体来说，我们从官方和社区的 MCP 网站收集常用，流行的 MCP 服务器，覆盖办公效率，日常生活，通信，信息服务和工作管理等领域。然后在 Docker 容器内调试这些服务器，直到能成功启动。

**MCP Environment Interaction** In the MCP, the client component is responsible for interacting with the MCP servers, including performing handshakes with servers to retrieve the list of available tools. However, many MCP servers available on the market are independently deployed by community developers and have not undergone rigorous testing or quality assurance. Directly exposing all listed tools to the LLM may lead to frequent tool-calling failures, which can disrupt the execution of tasks and impair the model’s performance. To address this issue, we incorporated a tool quality inspection mechanism into the client. Specifically, we prompt Claude-4 to generate 10 queries, each of which is required to invoke the current tool, based on the description and metadata of the given tool. If the execution of these queries via an LLM returns a response from the tool, regardless of whether the response is correct, this indicates that communication with the tool is functioning properly. Tools that achieve a 100% success rate in this test are exposed to the LLM alongside their corresponding servers.

**MCP 环境交互** 在 MCP 中，客户端组件负责与 MCP 服务器交互，包括与服务器握手以获取可用工具列表。但市面上很多 MCP 服务器由社区开发者独立部署，没有经过严格的测试或质量保证。直接把列出的所有工具暴露给 LLM，可能导致工具调用频繁失败，打断任务执行，损害模型表现。为解决这一问题，我们在客户端中加入了工具质量检查机制。具体来说，我们提示 Claude-4 根据给定工具的描述和元数据生成 10 条查询，每条都必须调用当前工具。如果通过 LLM 执行这些查询能从工具拿到返回，不论返回是否正确，都说明与该工具的通信正常。在这项测试中成功率达到 100% 的工具，才会连同其服务器一起暴露给 LLM。

**Learning from the Demonstration** Based on the MCP Client, LLMs (e.g., MiniCPM4-MCP) communicate with the Docker container, enabling seamless interaction between the LLMs and the constructed environment. We adopt a client equipped with a strong LLM to perform interaction with our constructed environment. The accumulated interaction experience is filtered to form the SFT training data of MiniCPM4.

**从示范中学习** 基于 MCP 客户端，LLM（例如 MiniCPM4-MCP）与 Docker 容器通信，实现 LLM 与所搭建环境之间的无缝交互。我们用一个配备强 LLM 的客户端与所搭建的环境交互，积累的交互经验经过过滤，形成 MiniCPM4 的 SFT 训练数据。

## 6.2.3 Evaluation（评测）

**Evaluation Details** Following the existing commonly adopted evaluation metrics (Qin et al., 2024), we evaluate the accuracy of the tool name, parameter names, and parameter values for each tool call in our human-annotated test data. For those traces containing multiple steps of tool calls, we evaluate the accuracy of the current step by giving the previous ground-truth steps.

**评测细节** 沿用现有常用的评测指标，我们在人工标注的测试数据上评估每次工具调用的工具名，参数名和参数值的准确率。对包含多步工具调用的轨迹，我们给定之前各步的标准答案，评估当前步的准确率。

<!-- page 38 of 44 -->

MiniCPM4

OpenBMB

**Results** The overall results of model performance on our human-annotated MCP-tool-calling test data are shown in Table 13. According to the experimental results, we find that Qwen3-8B possesses the basic MCP Tool calling capability, demonstrating a competent understanding and usage of MCP tools, primarily because the experience of invoking MCP tools overlaps significantly with that of invoking regular tools. However, when it comes to newer tools or tools in more specialized domains (e.g., arXiv, airbnb, etc.), Qwen3 appears less familiar. It tends to apply prior knowledge from other tools when generating parameter names and passing parameter values, without adequately adjusting or adapting to the specific requirements of the given MCP tool. In comparison, MiniCPM4 learns from the demonstrations and thus knows the characteristics of our collected MCP servers and tools, which leads to a better performance on the test data.

**结果** 模型在人工标注的 MCP 工具调用测试数据上的整体结果见表 13。根据实验结果，我们发现 Qwen3-8B 具备基本的 MCP 工具调用能力，对 MCP 工具有合格的理解和使用，主要原因是调用 MCP 工具的经验与调用普通工具有很大重合。但遇到较新的工具或更专业领域的工具（例如 arXiv，airbnb 等）时，Qwen3 显得不太熟悉。它在生成参数名和传递参数值时倾向于套用其他工具的已有知识，没有充分适配给定 MCP 工具的具体要求。相比之下，MiniCPM4 从示范中学习，了解我们收集的 MCP 服务器和工具的特点，因而在测试数据上表现更好。

> **看表：** 正文说 MiniCPM4 对 arXiv，airbnb 这类较新的工具比 Qwen3 熟，表 13 里是这样吗？
> 看本文第 37 页表 13. Airbnb 一行成立：MiniCPM4-MCP 函数名 96.4，参数名 67.9，参数值 50.0，Qwen3-8B 是 92.8, 60.7, 50.0. Arxiv-MCP-Server 一行情况不同：MiniCPM4-MCP 是 57.1, 57.1, 52.4，Qwen3-8B 是 81.8, 54.5, 50.0，GPT-4o 三项都是 85.7；MiniCPM4-MCP 的函数名准确率是三者里最低的，只有参数名和参数值略高于 Qwen3-8B. Github 一行 MiniCPM4-MCP 的参数名只有 25.7，远低于 GPT-4o 的 80.0 和 Qwen3-8B 的 50.0。平均行 MiniCPM4-MCP 三项都最高（88.3, 76.1, 51.2），但它按样本数加权，各服务器的样本数本文没列，无法复算；按 16 行简单平均，MiniCPM4-MCP 是 87.2, 75.8, 51.6，GPT-4o 是 85.6, 77.5, 58.0，参数两项反而是 GPT-4o 更高。所以 「新工具上更熟」 对 airbnb 成立，对 arXiv 的函数名一项不成立。

## 7 Conclusion and Future Works（结论与未来工作）

In this technical report, we present MiniCPM4, which features efficient pre-training and inference. Thanks to the efficient pre-training data and infrastructure, we can use only 8 trillion tokens to reach comparable performance with existing open-source models. And the efficient architecture and inference systems, we can achieve 5× speedup for long-sequence processing. To facilitate the development of open-source community, we release the model parameters and inference code of MiniCPM4.

本技术报告介绍了 MiniCPM4，它的特点是高效的预训练和推理。得益于高效的预训练数据和基础设施，我们只用 8 万亿 token 就达到了与现有开源模型相当的性能。借助高效的架构和推理系统，长序列处理能提速 5 倍。为促进开源社区发展，我们发布了 MiniCPM4 的模型参数和推理代码。

> **对一下：** 结论说长序列提速 5 倍，引言说 7 倍，哪个是准数？
> 对一下本文三处：第 4 页引言说 「在端侧设备上处理 128K 长度文档速度提升 7 倍」，第 32 页效率评测说 「与 Qwen3-8B 相比，在 Jetson AGX Orin 上解码约 7 倍」，第 38 页结论说 「长序列处理提速 5 倍」。用第 1 页图 1 目测：Orin 解码在 128k 时 MiniCPM4-8B 约 46 token/s，Qwen-3-8B 约 6，七倍多；在 32k 时约 59 对 14，约 4 倍；4090 解码在 128k 时约 148 对 28，约 5 倍；4090 预填充在 128k 时约 2.5 倍。7 倍来自 Orin 上 128k 解码这一格，5 倍大致对得上 4090 解码或更笼统的说法。本文没有说明 5 倍是在哪个芯片，哪个长度上算的，引用时应带上 「Orin，128K，解码，对比 Qwen3-8B」 这些条件。

In the future, we will continually investigate efficient training and inference of LLMs. In terms of model architecture, we will devote our effort to the efficient sparse model architecture with the target to enable LLMs process infinitely long sequences on end-side devices. In terms of data construction, our research will focus on improving the quality of existing corpus and synthesise large-scale reasoning-intensive pre-training datasets, which can significantly improve the foundational capabilities of LLMs. In addition, we will continually explore the great potential of reinforcement learning to enable LLMs to learn skills from various environments. As for the inference systems, we plan to develop efficient systems for most end-side platforms, which can help the community to run and evaluate our model.

未来我们会持续研究 LLM 的高效训练与推理。模型架构方面，我们将致力于高效的稀疏模型架构，目标是让 LLM 在端侧设备上处理无限长的序列。数据构建方面，研究将聚焦于提升现有语料的质量，合成大规模推理密集型预训练数据集，这能大幅提升 LLM 的基础能力。此外，我们会继续挖掘强化学习的巨大潜力，让 LLM 从各种环境中学习技能。推理系统方面，我们计划为大多数端侧平台开发高效系统，帮助社区运行和评测我们的模型。

## 8 Contributions and Acknowledgments（贡献与致谢）

MiniCPM4 and MiniCPM4.1 are the result of the collective efforts of all members of our team.

MiniCPM4 和 MiniCPM4.1 是我们团队全体成员共同努力的成果。

**Project Design and Coordination** Chaojun Xiao, Yuxuan Li, Xu Han

**项目设计与协调**：Chaojun Xiao, Yuxuan Li, Xu Han。

**Contributors** (Ordered by the last name) Yuzhuo Bai, Jie Cai, Haotian Chen, Wentong Chen, Xin Cong, Ganqu Cui, Ning Ding, Shengda Fan, Yewei Fang, Zixuan Fu, Wenyu Guan, Yitong Guan, Junshao Guo, Yufeng Han, Bingxiang He, Yuxiang Huang, Baoxi Ji, Cunliang Kong, Qiuzuo Li, Siyuan Li, Wenhao Li, Xin Li, Yanghao Li, Yishan Li, Zhen Li, Dan Liu, Biyuan Lin, Yankai Lin, Xiang Long, Quanyu Lu, Yaxi Lu, Peiyan Luo, Hongya Lyu, Litu Ou, Yinxu Pan, Lushi Pu, Zekai Qu, Qundong Shi, Zijun Song, Jiayuan Su, Zhou Su, Ao Sun, Xianghui Sun, Peijun Tang, Fangzheng Wang, Feng Wang, Shuo Wang, Yudong Wang, Zheng Wang, Yesai Wu, Zhenyu Xiao, Jie Xie, Zihao Xie, Xiaoyue Xu, Yukun Yan, Jiarui Yuan, Jinqian Zhang, Kaihuo Zhang, Lei Zhang, Linyue Zhang, Xueren Zhang, Yudi Zhang, Hengyu Zhao, Weilin Zhao, Weilun Zhao, Yuanqian Zhao, Zhi Zheng, Chuyue Zhou, Ge Zhou, Jie Zhou, Wei Zhou, Yanghao Zhou, Zihan Zhou, Zixuan Zhou

**贡献者**（按姓氏排序）：名单见上方英文。

**Supervision** Xu Han, Zhiyuan Liu, Guoyang Zeng, Chao Jia, Dahai Li, Maosong Sun

**指导**：Xu Han, Zhiyuan Liu, Guoyang Zeng, Chao Jia, Dahai Li, Maosong Sun。

<!-- page 39 of 44 -->

MiniCPM4

OpenBMB

## References（参考文献）

Marah Abdin, Jyoti Aneja, Harkirat Behl, Sébastien Bubeck, Ronen Eldan, Suriya Gunasekar, Michael Harrison, Russell J Hewett, Mojan Javaheripi, Piero Kauffmann, et al. Phi-4 technical report. arXiv preprint arXiv:2412.08905, 2024.

Saleh Ashkboos, Amirkeivan Mohtashami, Maximilian L Croci, Bo Li, Pashmina Cameron, Martin Jaggi, Dan Alistarh, Torsten Hoefler, and James Hensman. Quarot: Outlier-free 4-bit inference in rotated llms. Proceedings of NeurIPS, 37:100213–100240, 2024.

Jacob Austin, Augustus Odena, Maxwell Nye, Maarten Bosma, Henryk Michalewski, David Dohan, Ellen Jiang, Carrie Cai, Michael Terry, Quoc Le, et al. Program synthesis with large language models. arXiv preprint arXiv:2108.07732, 2021.

Yushi Bai, Xin Lv, Jiajie Zhang, Yuze He, Ji Qi, Lei Hou, Jie Tang, Yuxiao Dong, and Juanzi Li. LongAlign: A recipe for long context alignment of large language models. In Findings of ACL: EMNLP 2024, pp. 1376–1395, Miami, Florida, USA, November 2024. Association for Computational Linguistics. doi: 10.18653/v1/2024.findings-emnlp.74.

Johan Bjorck, Alon Benhaim, Vishrav Chaudhary, Furu Wei, and Xia Song. Scaling optimal lr across token horizons. arXiv preprint arXiv:2409.19913, 2024.

Rishi Bommasani, Drew A. Hudson, Ehsan Adeli, Russ Altman, Simran Arora, Sydney von Arx, Michael S. Bernstein, Jeannette Bohg, Antoine Bosselut, Emma Brunskill, Erik Brynjolfsson, Shyamal Buch, Dallas Card, Rodrigo Castellon, Niladri S. Chatterji, Annie S. Chen, Kathleen Creel, Jared Quincy Davis, Dorottya Demszky, Chris Donahue, Moussa Doumbouya, Esin Durmus, Stefano Ermon, John Etchemendy, Kawin Ethayarajh, Li Fei-Fei, Chelsea Finn, Trevor Gale, Lauren Gillespie, Karan Goel, Noah D. Goodman, Shelby Grossman, Neel Guha, Tatsunori Hashimoto, Peter Henderson, John Hewitt, Daniel E. Ho, Jenny Hong, Kyle Hsu, Jing Huang, Thomas Icard, Saahil Jain, Dan Jurafsky, Pratyusha Kalluri, Siddharth Karamcheti, Geoff Keeling, Fereshte Khani, Omar Khattab, Pang Wei Koh, Mark S. Krass, Ranjay Krishna, Rohith Kuditipudi, and et al. On the opportunities and risks of foundation models. CoRR, abs/2108.07258, 2021.

Blake Bordelon, Lorenzo Noci, Mufan Bill Li, Boris Hanin, and Cengiz Pehlevan. Depthwise hyperparameter transfer in residual networks: Dynamics and scaling limit. In Proceedings of ICLR, 2023.

Tom B. Brown, Benjamin Mann, Nick Ryder, Melanie Subbiah, Jared Kaplan, Prafulla Dhariwal, Arvind Neelakantan, Pranav Shyam, Girish Sastry, Amanda Askell, Sandhini Agarwal, Ariel Herbert-Voss, Gretchen Krueger, Tom Henighan, Rewon Child, Aditya Ramesh, Daniel M. Ziegler, Jeffrey Wu, Clemens Winter, Christopher Hesse, Mark Chen, Eric Sigler, Mateusz Litwin, Scott Gray, Benjamin Chess, Jack Clark, Christopher Berner, Sam McCandlish, Alec Radford, Ilya Sutskever, and Dario Amodei. Language models are few-shot learners. In Proceedings of NeurIPS, 2020.

Tianle Cai, Yuhong Li, Zhengyang Geng, Hongwu Peng, Jason D Lee, Deming Chen, and Tri Dao. Medusa: Simple llm inference acceleration framework with multiple decoding heads. In Proceedings of ICML, pp. 5209–5235. PMLR, 2024.

Charlie Chen, Sebastian Borgeaud, Geoffrey Irving, Jean-Baptiste Lespiau, Laurent Sifre, and John Jumper. Accelerating large language model decoding with speculative sampling. arXiv preprint arXiv:2302.01318, 2023.

Mark Chen, Jerry Tworek, Heewoo Jun, Qiming Yuan, Henrique Ponde De Oliveira Pinto, Jared Kaplan, Harri Edwards, Yuri Burda, Nicholas Joseph, Greg Brockman, et al. Evaluating large language models trained on code. arXiv preprint arXiv:2107.03374, 2021.

Mengzhao Chen, Yi Liu, Jiahao Wang, Yi Bin, Wenqi Shao, and Ping Luo. Prefixquant: Static quantization beats dynamic through prefixed outliers in llms. arXiv preprint arXiv:2410.05265, 2024.

Karl Cobbe, Vineet Kosaraju, Mohammad Bavarian, Mark Chen, Heewoo Jun, Lukasz Kaiser, Matthias Plappert, Jerry Tworek, Jacob Hilton, Reiichiro Nakano, et al. Training verifiers to solve math word problems. arXiv preprint arXiv:2110.14168, 2021.

OpenCompass Contributors. Opencompass: A universal evaluation platform for foundation models. [https://github.com/open-compass/opencompass](https://github.com/open-compass/opencompass), 2023.

本页参考文献：Abdin 等，Phi-4 技术报告；Ashkboos 等，QuaRot，旋转后无离群值的 4 比特推理；Austin 等，用大语言模型做程序合成（MBPP）；Bai 等，LongAlign，大模型长上下文对齐配方；Bjorck 等，跨 token 规模的最优学习率；Bommasani 等，基础模型的机遇与风险；Bordelon 等，残差网络中按深度的超参数迁移；Brown 等，语言模型是少样本学习者（GPT-3）；Cai 等，Medusa，多解码头推理加速框架；Chen 等，用投机采样加速大模型解码；Chen 等，评估在代码上训练的大语言模型（HumanEval）；Chen 等，PrefixQuant，借助前缀离群值的静态量化；Cobbe 等，训练验证器解数学应用题（GSM8K）；OpenCompass，通用基础模型评测平台。

<!-- page 40 of 44 -->

MiniCPM4

3 OpenBMB

Tri Dao, Dan Fu, Stefano Ermon, Atri Rudra, and Christopher Ré. Flashattention: Fast and memory-efficient exact attention with io-awareness. Proceedings of NeurIPS, 35:16344–16359, 2022.

Team DeepSeek, Aixin Liu, Bei Feng, Bing Xue, Bingxuan Wang, Bochao Wu, Chengda Lu, Chenggang Zhao, Chengqi Deng, Chenyu Zhang, Chong Ruan, et al. Deepseek-v3 technical report. arXiv preprint arXiv:2412.19437, 2024.

Team DeepSeek, Daya Guo, Dejian Yang, Haowei Zhang, Junxiao Song, Ruoyu Zhang, Runxin Xu, Qihao Zhu, Shirong Ma, Peiyi Wang, Xiao Bi, et al. Deepseek-r1: Incentivizing reasoning capability in llms via reinforcement learning. arXiv preprint arXiv:2501.12948, 2025.

Ning Ding, Yulin Chen, Bokai Xu, Yujia Qin, Shengding Hu, Zhiyuan Liu, Maosong Sun, and Bowen Zhou. Enhancing chat language models by scaling high-quality instructional conversations. In Proceedings of EMNLP, pp. 3029–3051, 2023.

Yiran Ding, Li Lyna Zhang, Chengruidong Zhang, Yuanyuan Xu, Ning Shang, Jiahang Xu, Fan Yang, and Mao Yang. Longrope: Extending LLM context window beyond 2 million tokens. CoRR, abs/2402.13753, 2024. doi: 10.48550/ARXIV.2402.13753.

Abhimanyu Dubey, Abhinav Jauhri, Abhinav Pandey, Abhishek Kadian, Ahmad Al-Dahle, Aiesha Letman, Akhil Mathur, Alan Schelten, Amy Yang, Angela Fan, et al. The llama 3 herd of models. arXiv preprint arXiv:2407.21783, 2024.

Katie E Everett, Lechao Xiao, Mitchell Wortsman, Alexander A Alemi, Roman Novak, Peter J Liu, Izzeddin Gur, Jascha Sohl-Dickstein, Leslie Pack Kaelbling, Jaehoon Lee, et al. Scaling exponents across parameterizations and optimizers. In Proceedings of ICML, pp. 12666–12700. PMLR, 2024.

Clémentine Fourrier, Nathan Habib, Hynek Kydlícek, Thomas Wolf, and Lewis Tunstall. Lighteval: A ˇ lightweight framework for llm evaluation, 2023. URL [https://github.com/huggingface/lighteval](https://github.com/huggingface/lighteval).

Elias Frantar, Saleh Ashkboos, Torsten Hoefler, and Dan Alistarh. GPTQ: Accurate post-training compression for generative pretrained transformers. In Proceedings of ICLR, 2023.

Tao Ge, Xin Chan, Xiaoyang Wang, Dian Yu, Haitao Mi, and Dong Yu. Scaling synthetic data creation with 1,000,000,000 personas. arXiv preprint arXiv:2406.20094, 2024.

Team GLM, Aohan Zeng, Bin Xu, Bowen Wang, Chenhui Zhang, Da Yin, Dan Zhang, Diego Rojas, Guanyu Feng, Hanlin Zhao, et al. Chatglm: A family of large language models from glm-130b to glm-4 all tools. arXiv preprint arXiv:2406.12793, 2024.

Fabian Gloeckle, Badr Youbi Idrissi, Baptiste Rozière, David Lopez-Paz, and Gabriel Synnaeve. Better & faster large language models via multi-token prediction. In Proceedings of ICML, pp. 15706–15734, 2024.

Tom Gunter, Zirui Wang, Chong Wang, Ruoming Pang, Andy Narayanan, Aonan Zhang, Bowen Zhang, Chen Chen, Chung-Cheng Chiu, David Qiu, et al. Apple intelligence foundation language models. CoRR, abs/2407.21075, 2024. doi: 10.48550/ARXIV.2407.21075.

Xu Han, Zhengyan Zhang, Ning Ding, Yuxian Gu, Xiao Liu, Yuqi Huo, Jiezhong Qiu, Yuan Yao, Ao Zhang, Liang Zhang, Wentao Han, Minlie Huang, Qin Jin, Yanyan Lan, Yang Liu, Zhiyuan Liu, Zhiwu Lu, Xipeng Qiu, Ruihua Song, Jie Tang, Ji-Rong Wen, Jinhui Yuan, Wayne Xin Zhao, and Jun Zhu. Pre-trained models: Past, present and future. AI Open, 2:225–250, 2021.

Dan Hendrycks, Collin Burns, Steven Basart, Andy Zou, Mantas Mazeika, Dawn Song, and Jacob Steinhardt. Measuring massive multitask language understanding. In International Conference on Learning Representations, 2020.

Dan Hendrycks, Collin Burns, Saurav Kadavath, Akul Arora, Steven Basart, Eric Tang, Dawn Song, and Jacob Steinhardt. Measuring mathematical problem solving with the math dataset. In Proceedings of NeurIPS: Datasets and Benchmarks Track, 2021.

Jordan Hoffmann, Sebastian Borgeaud, Arthur Mensch, Elena Buchatskaya, Trevor Cai, Eliza Rutherford, Diego de Las Casas, Lisa Anne Hendricks, Johannes Welbl, Aidan Clark, Tom Hennigan, Eric Noland, Katie Millican, George van den Driessche, Bogdan Damoc, Aurelia Guy, Simon Osindero, Karen Simonyan, Erich Elsen, Jack W. Rae, Oriol Vinyals, and Laurent Sifre. Training compute-optimal large language models. CoRR, abs/2203.15556, 2022. doi: 10.48550/ARXIV.2203.15556.

本页参考文献：Dao 等，FlashAttention，感知 IO 的快速省显存精确注意力；DeepSeek，DeepSeek-V3 技术报告；DeepSeek，DeepSeek-R1，用强化学习激励推理能力；Ding 等，扩大高质量指令对话提升聊天模型（UltraChat）；Ding 等，LongRoPE，把上下文窗口扩到 200 万 token 以上；Dubey 等，Llama 3 模型群；Everett 等，不同参数化与优化器下的扩展指数；Fourrier 等，Lighteval 轻量评测框架；Frantar 等，GPTQ，生成式预训练 Transformer 的训练后压缩；Ge 等，用十亿人设扩大合成数据；GLM 团队，ChatGLM，从 GLM-130B 到 GLM-4 All Tools；Gloeckle 等，多 token 预测让大模型更好更快；Gunter 等，Apple Intelligence 基础语言模型；Han 等，预训练模型的过去，现在与未来；Hendrycks 等，大规模多任务语言理解（MMLU）；Hendrycks 等，MATH 数据集；Hoffmann 等，训练计算最优的大语言模型。

<!-- page 41 of 44 -->

MiniCPM4

3 OpenBMB

Xinyi Hou, Yanjie Zhao, Shenao Wang, and Haoyu Wang. Model Context Protocol (MCP): Landscape, Security Threats, and Future Research Directions, April 2025.

Cheng-Ping Hsieh, Simeng Sun, Samuel Kriman, Shantanu Acharya, Dima Rekesh, Fei Jia, and Boris Ginsburg. Ruler: What’s the real context size of your long-context language models? In First Conference on Language Modeling, 2024.

Shengding Hu, Yuge Tu, Xu Han, Chaoqun He, Ganqu Cui, Xiang Long, Zhi Zheng, Yewei Fang, Yuxiang Huang, Weilin Zhao, et al. Minicpm: Unveiling the potential of small language models with scalable training strategies. CoRR, abs/2404.06395, 2024. doi: 10.48550/ARXIV.2404.06395.

Yuzhen Huang, Yuzhuo Bai, Zhihao Zhu, Junlei Zhang, Jinghan Zhang, Tangjun Su, Junteng Liu, Chuancheng Lv, Yikai Zhang, Yao Fu, et al. C-eval: A multi-level multi-discipline chinese evaluation suite for foundation models. Proceedings of NeurIPS, 36:62991–63010, 2023.

Naman Jain, King Han, Alex Gu, Wen-Ding Li, Fanjia Yan, Tianjun Zhang, Sida Wang, Armando Solar-Lezama, Koushik Sen, and Ion Stoica. Livecodebench: Holistic and contamination free evaluation of large language models for code. In The Thirteenth International Conference on Learning Representations, 2024.

Huiqiang Jiang, Yucheng Li, Chengruidong Zhang, Qianhui Wu, Xufang Luo, Surin Ahn, Zhenhua Han, Amir H Abdi, Dongsheng Li, Chin-Yew Lin, et al. Minference: Accelerating pre-filling for long-context llms via dynamic sparse attention. In Workshop on Efficient Systems for Foundation Models II@ ICML2024, 2024.

Carlos E Jimenez, John Yang, Alexander Wettig, Shunyu Yao, Kexin Pei, Ofir Press, and Karthik R Narasimhan. Swe-bench: Can language models resolve real-world github issues? In Proceedings of ICLR, 2023.

Jared Kaplan, Sam McCandlish, Tom Henighan, Tom B. Brown, Benjamin Chess, Rewon Child, Scott Gray, Alec Radford, Jeffrey Wu, and Dario Amodei. Scaling laws for neural language models. CoRR, abs/2001.08361, 2020.

Tanishq Kumar, Zachary Ankner, Benjamin F. Spector, Blake Bordelon, Niklas Muennighoff, Mansheej Paul, Cengiz Pehlevan, Christopher Ré, and Aditi Raghunathan. Scaling laws for precision, 2024.

Yaniv Leviathan, Matan Kalman, and Yossi Matias. Fast inference from transformers via speculative decoding. In Proceedings of ICML, pp. 19274–19286. PMLR, 2023.

Haonan Li, Yixuan Zhang, Fajri Koto, Yifei Yang, Hai Zhao, Yeyun Gong, Nan Duan, and Timothy Baldwin. Cmmlu: Measuring massive multitask language understanding in chinese. In Findings of ACL: ACL 2024, pp. 11260–11285, 2024a.

Houyi Li, Wenzheng Zheng, Jingcheng Hu, Qiufeng Wang, Hanshan Zhang, Zili Wang, Shijie Xuyang, Yuantao Fan, Shuigeng Zhou, Xiangyu Zhang, and Daxin Jiang. Predictable scale: Part i – optimal hyperparameter scaling law in large language model pretraining, 2025a.

Jeffrey Li, Alex Fang, Georgios Smyrnis, Maor Ivgi, Matt Jordan, Samir Gadre, Hritik Bansal, Etash Guha, Sedrick Keh, Kushal Arora, et al. Datacomp-lm: In search of the next generation of training sets for language models. arXiv preprint arXiv:2406.11794, 2024b.

Xiaoxi Li, Jiajie Jin, Guanting Dong, Hongjin Qian, Yutao Zhu, Yongkang Wu, Ji-Rong Wen, and Zhicheng Dou. Webthinker: Empowering large reasoning models with deep research capability. arXiv preprint arXiv:2504.21776, 2025b.

Yuhui Li, Fangyun Wei, Chao Zhang, and Hongyang Zhang. Eagle-2: Faster inference of language models with dynamic draft trees. In Proceedings of EMNLP, pp. 7421–7432, 2024c.

Feng Lin, Hanling Yi, Hongbin Li, Yifan Yang, Xiaotian Yu, Guangming Lu, and Rong Xiao. Bita: Bidirectional tuning for lossless acceleration in large language models, 2024a.

Ji Lin, Jiaming Tang, Haotian Tang, Shang Yang, Wei-Ming Chen, Wei-Chen Wang, Guangxuan Xiao, Xingyu Dang, Chuang Gan, and Song Han. Awq: Activation-aware weight quantization for on-device llm compression and acceleration. Proceedings of MLSys, 6:87–100, 2024b.

Lucas Lingle. A large-scale exploration of mu-transfer. arXiv preprint arXiv:2404.05728, 2024.

本页参考文献：Hou 等，模型上下文协议（MCP）的现状，安全威胁与研究方向；Hsieh 等，RULER，长上下文模型的真实上下文长度；Hu 等，MiniCPM，用可扩展训练策略挖掘小模型潜力；Huang 等，C-Eval 中文多层级多学科评测集；Jain 等，LiveCodeBench，全面且无污染的代码评测；Jiang 等，MInference，用动态稀疏注意力加速预填充；Jimenez 等，SWE-bench，语言模型能否解决真实 GitHub issue；Kaplan 等，神经语言模型的 scaling law；Kumar 等，精度的 scaling law；Leviathan 等，用投机解码快速推理；Li 等，CMMLU 中文多任务语言理解；Li 等，可预测规模第一部分，大模型预训练中最优超参数的 scaling law（即 StepLaw）；Li 等，DataComp-LM，寻找下一代训练集；Li 等，WebThinker，给大型推理模型加上深度研究能力；Li 等，EAGLE-2，用动态草稿树加速推理；Lin 等，BiTA，双向微调实现无损加速；Lin 等，AWQ，激活感知的权重量化；Lingle，µ-transfer 的大规模探索。

<!-- page 42 of 44 -->

MiniCPM4

OpenBMB

Aixin Liu, Bei Feng, Bin Wang, Bingxuan Wang, Bo Liu, Chenggang Zhao, Chengqi Dengr, Chong Ruan, Damai Dai, Daya Guo, et al. Deepseek-v2: A strong, economical, and efficient mixture-of-experts language model. arXiv preprint arXiv:2405.04434, 2024a.

Zechun Liu, Barlas Oguz, Changsheng Zhao, Ernie Chang, Pierre Stock, Yashar Mehdad, Yangyang Shi, Raghuraman Krishnamoorthi, and Vikas Chandra. LLM-QAT: Data-free quantization aware training for large language models. In Lun-Wei Ku, Andre Martins, and Vivek Srikumar (eds.), Findings of ACL: ACL 2024, pp. 467–484, Bangkok, Thailand, August 2024b. Association for Computational Linguistics. doi: 10.18653/v1/2024.findings-acl.26.

Zuxin Liu, Thai Hoang, Jianguo Zhang, Ming Zhu, Tian Lan, Juntao Tan, Weiran Yao, Zhiwei Liu, Yihao Feng, Rithesh RN, et al. Apigen: Automated pipeline for generating verifiable and diverse function-calling datasets. Proceedings of NeurIPS, 37:54463–54482, 2024c.

Enzhe Lu, Zhejun Jiang, Jingyuan Liu, Yulun Du, Tao Jiang, Chao Hong, Shaowei Liu, Weiran He, Enming Yuan, Yuzhi Wang, et al. Moba: Mixture of block attention for long-context llms. arXiv preprint arXiv:2502.13189, 2025.

Shuming Ma, Hongyu Wang, Lingxiao Ma, Lei Wang, Wenhui Wang, Shaohan Huang, Li Dong, Ruiping Wang, Jilong Xue, and Furu Wei. The era of 1-bit llms: All large language models are in 1.58 bits. arXiv preprint arXiv:2402.17764, 2024.

Shuming Ma, Hongyu Wang, Shaohan Huang, Xingxing Zhang, Ying Hu, Ting Song, Yan Xia, and Furu Wei. Bitnet b1.58 2b4t technical report, 2025.

MAA. American invitational mathematics examination-aime. URL [https://maa.org/maa-invitational-competitions/](https://maa.org/maa-invitational-competitions/).

Sewon Min, Kalpesh Krishna, Xinxi Lyu, Mike Lewis, Wen-tau Yih, Pang Wei Koh, Mohit Iyyer, Luke Zettlemoyer, and Hannaneh Hajishirzi. Factscore: Fine-grained atomic evaluation of factual precision in long form text generation. arXiv preprint arXiv:2305.14251, 2023.

OpenAI. GPT-4 technical report. CoRR, abs/2303.08774, 2023.

OpenAI. Gpt-4o mini: advancing cost-efficient intelligence. Technical Report, 2024a. URL [https://openai.com/index/gpt-4o-mini-advancing-cost-efficient-intelligence/](https://openai.com/index/gpt-4o-mini-advancing-cost-efficient-intelligence/).

OpenAI. Openai o1 system card. CoRR, abs/2412.16720, 2024b.

OpenAI. Introducing deep research. [https://openai.com/index/introducing-deep-research/](https://openai.com/index/introducing-deep-research/), 2025.

Long Ouyang, Jeffrey Wu, Xu Jiang, Diogo Almeida, Carroll L. Wainwright, Pamela Mishkin, Chong Zhang, Sandhini Agarwal, Katarina Slama, Alex Ray, John Schulman, Jacob Hilton, Fraser Kelton, Luke Miller, Maddie Simens, Amanda Askell, Peter Welinder, Paul F. Christiano, Jan Leike, and Ryan Lowe. Training language models to follow instructions with human feedback. In Proceedings of NeurIPS, 2022.

Xu Ouyang, Tao Ge, Thomas Hartvigsen, Zhisong Zhang, Haitao Mi, and Dong Yu. Low-bit quantization favors undertrained llms: Scaling laws for quantized llms with 100t training tokens, 2024.

Guilherme Penedo, Hynek Kydlícek, Anton Lozhkov, Margaret Mitchell, Colin A Raffel, Leandro Von Werra, ˇ Thomas Wolf, et al. The fineweb datasets: Decanting the web for the finest text data at scale. Proceedings of NeurIPS, 37:30811–30849, 2024.

Bowen Peng, Jeffrey Quesnelle, Honglu Fan, and Enrico Shippole. Yarn: Efficient context window extension of large language models. CoRR, abs/2309.00071, 2023.

Yujia Qin, Shihao Liang, Yining Ye, Kunlun Zhu, Lan Yan, Yaxi Lu, Yankai Lin, Xin Cong, Xiangru Tang, Bill Qian, Sihan Zhao, Lauren Hong, Runchu Tian, Ruobing Xie, Jie Zhou, Mark Gerstein, dahai li, Zhiyuan Liu, and Maosong Sun. ToolLLM: Facilitating large language models to master 16000+ real-world APIs. In Proceedings of ICLR, 2024.

Xipeng Qiu, Tianxiang Sun, Yige Xu, Yunfan Shao, Ning Dai, and Xuanjing Huang. Pre-trained models for natural language processing: A survey. CoRR, abs/2003.08271, 2020.

本页参考文献：Liu 等，DeepSeek-V2，强大，经济，高效的 MoE 语言模型；Liu 等，LLM-QAT，无数据的量化感知训练；Liu 等，APIGen，生成可验证且多样的函数调用数据（xlam）；Lu 等，MoBA，面向长上下文的块注意力；Ma 等，1 比特 LLM 时代，所有大模型都是 1.58 比特；Ma 等，BitNet b1.58 2B4T 技术报告；MAA，美国数学邀请赛 AIME；Min 等，FactScore，长文本事实精度的细粒度原子评估；OpenAI，GPT-4 技术报告；OpenAI，GPT-4o mini；OpenAI，o1 系统卡；OpenAI，介绍 Deep Research；Ouyang 等，用人类反馈训练语言模型遵循指令；Ouyang 等，低比特量化偏爱训练不足的 LLM；Penedo 等，FineWeb 数据集；Peng 等，YaRN，高效扩展上下文窗口；Qin 等，ToolLLM，让大模型掌握 16000 多个真实 API；Qiu 等，自然语言处理预训练模型综述。

<!-- page 43 of 44 -->

MiniCPM4

3 OpenBMB

Yijia Shao, Yucheng Jiang, Theodore A Kanell, Peter Xu, Omar Khattab, and Monica S Lam. Assisting in writing wikipedia-like articles from scratch with large language models. arXiv preprint arXiv:2402.14207, 2024a.

Zhihong Shao, Peiyi Wang, Qihao Zhu, Runxin Xu, Junxiao Song, Xiao Bi, Haowei Zhang, Mingchuan Zhang, YK Li, Y Wu, et al. Deepseekmath: Pushing the limits of mathematical reasoning in open language models. arXiv preprint arXiv:2402.03300, 2024b.

Hanshi Sun, Zhuoming Chen, Xinyu Yang, Yuandong Tian, and Beidi Chen. Triforce: Lossless acceleration of long sequence generation with hierarchical speculative decoding. In Proceedings of CoLM, 2024a.

Mingjie Sun, Xinlei Chen, J Zico Kolter, and Zhuang Liu. Massive activations in large language models. arXiv preprint arXiv:2402.17762, 2024b.

Mirac Suzgun, Nathan Scales, Nathanael Schärli, Sebastian Gehrmann, Yi Tay, Hyung Won Chung, Aakanksha Chowdhery, Quoc V Le, Ed H Chi, Denny Zhou, et al. Challenging big-bench tasks and whether chain-of-thought can solve them. In Findings of ACL: ACL 2023, 2023.

Gemma Team, Aishwarya Kamath, Johan Ferret, Shreya Pathak, Nino Vieillard, Ramona Merhej, Sarah Perrin, Tatiana Matejovicova, Alexandre Ramé, Morgane Rivière, et al. Gemma 3 technical report. arXiv preprint arXiv:2503.19786, 2025.

Qwen Team. Qwq-32b: Embracing the power of reinforcement learning, March 2025. URL [https://qwenlm.github.io/blog/qwq-32b/](https://qwenlm.github.io/blog/qwq-32b/).

Thomas van Dongen and Stephan Tulkens. Semhash: Fast semantic text deduplication & filtering, 2025. URL [https://github.com/MinishLab/semhash](https://github.com/MinishLab/semhash).

Ashish Vaswani, Noam Shazeer, Niki Parmar, Jakob Uszkoreit, Llion Jones, Aidan N. Gomez, Lukasz Kaiser, and Illia Polosukhin. Attention is all you need. In Proceedings of NeurIPS, pp. 5998–6008, 2017.

Haoyu Wang, Yujia Fu, Zhu Zhang, Shuo Wang, Zirui Ren, Xiaorong Wang, Zhili Li, Chaoqun He, Bo An, Zhiyuan Liu, and Maosong Sun. Llm×mapreduce-v2: Entropy-driven convolutional test-time scaling for generating long-form articles from extremely long resources, 2025a.

Hongyu Wang, Shuming Ma, Li Dong, Shaohan Huang, Huaijie Wang, Lingxiao Ma, Fan Yang, Ruiping Wang, Yi Wu, and Furu Wei. Bitnet: Scaling 1-bit transformers for large language models. arXiv preprint arXiv:2310.11453, 2023.

Liangdong Wang, Bo-Wen Zhang, Chengwei Wu, Hanyu Zhao, Xiaofeng Shi, Shuhao Gu, Jijie Li, Quanyue Ma, TengFei Pan, and Guang Liu. Cci3. 0-hq: a large-scale chinese dataset of high quality designed for pre-training large language models. arXiv preprint arXiv:2410.18505, 2024a.

Xingyao Wang, Yangyi Chen, Lifan Yuan, Yizhe Zhang, Yunzhu Li, Hao Peng, and Heng Ji. Executable code actions elicit better llm agents. In Proceedings of ICML, 2024b.

Yidong Wang, Qi Guo, Wenjin Yao, Hongbo Zhang, Xin Zhang, Zhen Wu, Meishan Zhang, Xinyu Dai, Qingsong Wen, Wei Ye, et al. Autosurvey: Large language models can automatically write surveys. Advances in Neural Information Processing Systems, 37:115119–115145, 2024c.

Yudong Wang, Zixuan Fu, Jie Cai, Peijun Tang, Hongya Lyu, Yewei Fang, Zhi Zheng, Jie Zhou, Guoyang Zeng, Chaojun Xiao, et al. Ultra-fineweb: Efficient data filtering and verification for high-quality llm training data. arXiv preprint arXiv:2505.05427, 2025b.

Jason Wei, Yi Tay, Rishi Bommasani, Colin Raffel, Barret Zoph, Sebastian Borgeaud, Dani Yogatama, Maarten Bosma, Denny Zhou, Donald Metzler, et al. Emergent abilities of large language models. TMLR, 2022.

Bingquan Xia, Bowen Shen, Dawei Zhu, Di Zhang, Gang Wang, Hailin Zhang, Huaqiu Liu, Jiebao Xiao, Jinhao Dong, Liang Zhao, et al. Mimo: Unlocking the reasoning potential of language model–from pretraining to posttraining. arXiv preprint arXiv:2505.07608, 2025.

Chaojun Xiao, Jie Cai, Weilin Zhao, Guoyang Zeng, Biyuan Lin, Jie Zhou, Zhi Zheng, Xu Han, Zhiyuan Liu, and Maosong Sun. Densing law of llms. arXiv preprint arXiv:2412.04315, 2024a.

本页参考文献：Shao 等，用大模型从零撰写维基百科式文章（STORM）；Shao 等，DeepSeekMath（提出 GRPO）；Sun 等，TriForce，用分层投机解码无损加速长序列生成；Sun 等，大语言模型中的巨大激活；Suzgun 等，BIG-Bench 难题以及 CoT 能否解决它们（BBH）；Gemma 团队，Gemma 3 技术报告；Qwen 团队，QwQ-32B；van Dongen 和 Tulkens，Semhash 语义去重与过滤；Vaswani 等，Attention is all you need；Wang 等，LLM×MapReduce-V2，从超长资料生成长文；Wang 等，BitNet，1 比特 Transformer；Wang 等，CCI3.0-HQ 高质量中文预训练数据集；Wang 等，可执行代码动作让 LLM Agent 更好（CodeAct）；Wang 等，AutoSurvey，大模型自动写综述；Wang 等，Ultra-FineWeb，高效数据过滤与验证；Wei 等，大语言模型的涌现能力；Xia 等，MiMo，从预训练到后训练释放推理潜力；Xiao 等，大模型的 Densing law（能力密度规律）。

<!-- page 44 of 44 -->

MiniCPM4

3 OpenBMB

Chaojun Xiao, Pengle Zhang, Xu Han, Guangxuan Xiao, Yankai Lin, Zhengyan Zhang, Zhiyuan Liu, and Maosong Sun. Infllm: Training-free long-context extrapolation for llms with an efficient context memory. In Proceedings of NeurIPS, 2024b.

Guangxuan Xiao, Yuandong Tian, Beidi Chen, Song Han, and Mike Lewis. Efficient streaming language models with attention sinks. CoRR, abs/2309.17453, 2023.

Ruyi Xu, Guangxuan Xiao, Haofeng Huang, Junxian Guo, and Song Han. Xattention: Block sparse attention with antidiagonal scoring. arXiv preprint arXiv:2503.16428, 2025.

Yuzhuang Xu, Xu Han, Zonghan Yang, Shuo Wang, Qingfu Zhu, Zhiyuan Liu, Weidong Liu, and Wanxiang Che. Onebit: Towards extremely low-bit large language models. In The Thirty-eighth Annual Conference on Neural Information Processing Systems.

An Yang, Anfeng Li, Baosong Yang, Beichen Zhang, Binyuan Hui, Bo Zheng, Bowen Yu, Chang Gao, Chengen Huang, Chenxu Lv, et al. Qwen3 technical report. arXiv preprint arXiv:2505.09388, 2025.

Greg Yang, Edward J Hu, Igor Babuschkin, Szymon Sidor, Xiaodong Liu, David Farhi, Nick Ryder, Jakub Pachocki, Weizhu Chen, and Jianfeng Gao. Tensor programs v: Tuning large neural networks via zero-shot hyperparameter transfer. arXiv preprint arXiv:2203.03466, 2022.

Yuan Yao, Tianyu Yu, Ao Zhang, Chongyi Wang, Junbo Cui, Hongji Zhu, Tianchi Cai, Haoyu Li, Weilin Zhao, Zhihui He, et al. Minicpm-v: A gpt-4v level mllm on your phone. arXiv preprint arXiv:2408.01800, 2024.

Deheng Ye, Zhao Liu, Mingfei Sun, Bei Shi, Peilin Zhao, Hao Wu, Hongsheng Yu, Shaojie Yang, Xipeng Wu, Qingwei Guo, et al. Mastering complex control in moba games with deep reinforcement learning. In Proceedings of AAAI, volume 34, pp. 6672–6679, 2020.

Qiying Yu, Zheng Zhang, Ruofei Zhu, Yufeng Yuan, Xiaochen Zuo, Yu Yue, Tiantian Fan, Gaohong Liu, Lingjun Liu, Xin Liu, et al. Dapo: An open-source llm reinforcement learning system at scale. arXiv preprint arXiv:2503.14476, 2025a.

Yijiong Yu, Ziyun Dai, Zekun Wang, Wei Wang, Ran Chen, and Ji Pei. Opencsg chinese corpus: A series of high-quality chinese datasets for llm training. arXiv preprint arXiv:2501.08197, 2025b.

Jingyang Yuan, Huazuo Gao, Damai Dai, Junyu Luo, Liang Zhao, Zhengyan Zhang, Zhenda Xie, YX Wei, Lean Wang, Zhiping Xiao, et al. Native sparse attention: Hardware-aligned and natively trainable sparse attention. arXiv preprint arXiv:2502.11089, 2025.

Jintao Zhang, Chendong Xiang, Haofeng Huang, Jia Wei, Haocheng Xi, Jun Zhu, and Jianfei Chen. Spargeattn: Accurate sparse attention accelerating any model inference. arXiv preprint arXiv:2502.18137, 2025a.

Yudi Zhang, Weilin Zhao, Xu Han, Tiejun Zhao, Wang Xu, Hailong Cao, and Conghui Zhu. Speculative decoding meets quantization: Compatibility evaluation and hierarchical framework design. arXiv preprint arXiv:2505.22179, 2025b.

Juntao Zhao, Wenhao Lu, Sheng Wang, Lingpeng Kong, and Chuan Wu. Qspec: Speculative decoding with complementary quantization schemes. arXiv preprint arXiv:2410.11305, 2024.

Weilin Zhao, Tengyu Pan, Xu Han, Yudi Zhang, Ao Sun, Yuxiang Huang, Kaihuo Zhang, Weilun Zhao, Yuxuan Li, Jianyong Wang, et al. Fr-spec: Accelerating large-vocabulary language models via frequency-ranked speculative sampling. arXiv preprint arXiv:2502.14856, 2025.

Tianyu Zheng, Ge Zhang, Tianhao Shen, Xueling Liu, Bill Yuchen Lin, Jie Fu, Wenhu Chen, and Xiang Yue. Opencodeinterpreter: Integrating code generation with execution and refinement. arXiv preprint arXiv:2402.14658, 2024.

本页参考文献：Xiao 等，InfLLM，借助高效上下文记忆免训练外推长上下文；Xiao 等，带 attention sink 的高效流式语言模型；Xu 等，XAttention，反对角打分的块稀疏注意力；Xu 等，OneBit，迈向极低比特大模型；Yang 等，Qwen3 技术报告；Yang 等，Tensor Programs V，零样本超参数迁移（µP 出处）；Yao 等，MiniCPM-V，手机上的 GPT-4V 级多模态模型；Ye 等，用深度强化学习掌握 MOBA 游戏的复杂控制（dual-clip 出处）；Yu 等，DAPO，开源的大规模 LLM 强化学习系统；Yu 等，OpenCSG 中文语料；Yuan 等，NSA，硬件对齐，原生可训练的稀疏注意力；Zhang 等，SpargeAttn，加速任意模型推理的稀疏注意力；Zhang 等，投机解码遇上量化（SpecMQuant）；Zhao 等，QSpec，互补量化方案下的投机解码；Zhao 等，FR-Spec，按频率排序的投机采样加速大词表模型；Zheng 等，OpenCodeInterpreter（Code-Feedback 出处）。

44