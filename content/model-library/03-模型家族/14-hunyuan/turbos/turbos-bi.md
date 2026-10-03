---
title: "Hunyuan-TurboS · 对照译稿"
category: "模型库"
tags: ["Hunyuan", "对照译稿"]
published: true
excerpt: "Hunyuan-TurboS 公开材料的逐段中英对照译稿，附读报告时的疑问块。"
---
<!-- page 1 of 26 -->

arXiv:2505.15431v3 [cs.CL] 4 Jul 2025

arXiv 编号 2505.15431，第 3 版，分类 cs.CL，2025 年 7 月 4 日。

Tencent Hunyuan

腾讯混元。

2025-07-08

日期 2025 年 7 月 8 日。

# Hunyuan-TurboS: Advancing Large Language Models through Mamba-Transformer Synergy and Adaptive Chain-of-Thought

Hunyuan-TurboS：用 Mamba 与 Transformer 协同，加上自适应CoT，推进大语言模型。

**Tencent Hunyuan Team**

**腾讯混元团队**

## Abstract

As Large Language Models (LLMs) rapidly advance, we introduce Hunyuan-TurboS, a novel large hybrid Transformer-Mamba Mixture of Experts (MoE) model. It synergistically combines Mamba's long-sequence processing efficiency with Transformer's superior contextual understanding. Hunyuan-TurboS features an adaptive long-short chain-of-thought (CoT) mechanism, dynamically switching between rapid responses for simple queries and deep "thinking" modes for complex problems, optimizing computational resources. Architecturally, this 56B activated (560B total) parameter model employs 128 layers (Mamba2, Attention, FFN) with an innovative AMF/MF block pattern. Faster Mamba2 ensures linear complexity, Grouped-Query Attention minimizes KV cache, and FFNs use an MoE structure. Pre-trained on 16T high-quality tokens, it supports a 256K context length and is the first industry-deployed large-scale Mamba model. Our comprehensive post-training strategy enhances capabilities via Supervised Fine-Tuning (3M instructions), a novel Adaptive Long-short CoT Fusion method, Multi-round Deliberation Learning for iterative improvement, and a two-stage Large-scale Reinforcement Learning process targeting STEM and general instruction-following. Evaluations show strong performance: overall top 7 rank on LMSYS Chatbot Arena with a score of 1356, outperforming leading models like Gemini-2.0-Flash-001 (1352) and o4-mini-2025-04-16 (1345). TurboS also achieves an average of 77.9% across 23 automated benchmarks. Hunyuan-TurboS balances high performance and efficiency, offering substantial capabilities at lower inference costs than many reasoning models, establishing a new paradigm for efficient large-scale pre-trained models.

大语言模型（LLM）发展很快。我们推出 Hunyuan-TurboS，一个大型的 Transformer-Mamba 混合结构 MoE 模型。它把 Mamba 处理长序列的效率和 Transformer 更强的上下文理解结合起来。Hunyuan-TurboS 带有自适应长短 CoT 机制：简单问题快速作答，复杂问题切到深度 「thinking」 模式，以此节省计算资源。架构上，这个模型激活参数 56B，总参数 560B，共 128 层（Mamba2, Attention, FFN），采用新的 AMF/MF 块模式。更快的 Mamba2 保证线性复杂度，Grouped-Query Attention 压低 KV cache，FFN 采用 MoE 结构。模型在 16T 高质量 token 上预训练，支持 256K 上下文长度，是业界第一个落地部署的大规模 Mamba 模型。后训练包括：监督微调（300 万条指令），新的自适应长短 CoT 融合方法，用于迭代改进的多轮 Deliberation Learning，以及面向 STEM 和通用指令遵循的两阶段大规模强化学习。评测结果：在 LMSYS Chatbot Arena 上以 1356 分进入总榜前 7，高于 Gemini-2.0-Flash-001 (1352) 和 o4-mini-2025-04-16 (1345). TurboS 在 23 个自动化基准上平均 77.9%. Hunyuan-TurboS 兼顾性能和效率，推理成本低于许多推理模型，作者称这为高效的大规模预训练模型建立了新范式。

![Chart block](images/p01-figure-1-benchmark-performance-of-hunyuan-turbos.png)

(图：分组柱状图，纵轴是 Performance / Percentile (%)，0 到 100。横轴七组基准：AIME 2025, Chatbot Arena, MMLU-PRO, IFEval, Arena Hard, GPQA diamond, LiveCodeBench。每组五根柱，依次是 Hunyuan-TurboS（斜线填充），Qwen Max, GPT 4.5, Claude 3.7 Sonnet, DeepSeek-V3 0324. TurboS 七组读数依次是 40.0, 1356, 78.0, 87.6, 91.9, 62.1, 43.0. Chatbot Arena 一组柱顶标的是 Arena 分数 1356, 1338, 1395, 1297, 1369，柱子画到七十多到九十多之间，高度不等于分数。)

Figure 1: Benchmark performance of Hunyuan-TurboS.

图 1: Hunyuan-TurboS 的基准表现。

> **再看：** 图 1 里 Claude 3.7 Sonnet 的 Arena 柱标着 1297，这是哪一个 Claude?
> 第 26 页附录表里有两行 Claude: Claude_3..7_Sonnet (thinking-32k) 是 1297，不带括号的 Claude_3..7_Sonnet 是 1287。图 1 用的是 thinking-32k 那一行的分数，图例只写 Claude 3.7 Sonnet。另外四根能在附录表对上：TurboS 1356, Qwen2..5-Max 1338, GPT-4..5-Preview 1395, DeepSeek-V3-0324 1369。这一组柱高按纵轴的 Percentile 画，1395 画到九十多，1297 只到四十多，图注没有说百分位是在哪个模型集合里算的。其余六组的柱高就是分数本身，和第 15 页表 4 的格子一致，比如 Qwen Max 的 AIME 2025 是 26.7，对应表 4 的 Qwen2.5max。

<!-- page 2 of 26 -->

## 1 Introduction（引言）

Large Language Models (LLMs) have witnessed unprecedented acceleration in their development, rapidly advancing towards artificial general intelligence (AGI) through recent breakthroughs in foundation models. Advanced systems such as GPT-4o (OpenAI, 2024a), Gemini 2.5 (DeepMind, 2025), DeepSeek-R1 (Guo et al., 2025), and Qwen3 (Yang et al., 2025b) now demonstrate capabilities that significantly narrow the gap between specialized AI and the generalized intelligence humans have long sought to create. Aiming to further push these boundaries, we introduce Hunyuan-TurboS, a large hybrid Transformer-Mamba Mixture of Experts (MoE) model.

大语言模型（LLM）的发展空前加速，基础模型接连突破，让它快速接近通用人工智能（AGI）。GPT-4o (OpenAI, 2024a), Gemini 2.5 (DeepMind, 2025), DeepSeek-R1 (Guo et al., 2025), Qwen3 (Yang et al., 2025b) 等先进系统，已经大大缩小了专用 AI 和人们长期追求的通用智能之间的距离。为了继续往前推，我们推出 Hunyuan-TurboS，一个大型的 Transformer-Mamba 混合结构 MoE 模型。

Hunyuan-TurboS exhibits several innovative characteristics that establish it as a powerful LLM achieving an excellent balance between performance and efficiency. First, it synergistically combines the efficient long-sequence processing capabilities of the Mamba (Gu & Dao, 2023) architecture with the superior contextual understanding of the Transformer (Vaswani et al., 2017) architecture. Second, it employs an adaptive long-short chain-of-thought mechanism. This integrates the advantages of short chainof-thought models (e.g., GPT-4o (OpenAI, 2024a)), such as rapid response and computation-friendly inference, with the excellent complex reasoning capabilities of long chain-of-thought models (e.g., o3 (OpenAI, 2025)). When faced with simple questions, TurboS automatically activates a "no thinking" mode to deliver results of sufficient quality at minimal computational cost. Conversely, when encountering complex problems, TurboS automatically switches to a "thinking" mode, employing deep reasoning methods such as step-by-step analysis, self-reflection, and backtracking to arrive at highly accurate answers.

Hunyuan-TurboS 有几个新特点，让它在性能和效率之间平衡得很好。第一，它把 Mamba (Gu & Dao, 2023) 架构处理长序列的效率，和 Transformer (Vaswani et al., 2017) 架构更强的上下文理解结合在一起。第二，它采用自适应长短 CoT机制。短 CoT模型 (如 GPT-4o (OpenAI, 2024a)) 响应快，推理省计算；长 CoT模型 (如 o3 (OpenAI, 2025)) 擅长复杂推理。这一机制把两边的长处合到一起。遇到简单问题，TurboS 自动启用 「no thinking」 模式，用最少的计算给出够用的结果。遇到复杂问题，TurboS 自动切到 「thinking」 模式，用逐步分析，自我反思，回溯等深度推理方法得到高准确度的答案。

Hunyuan-TurboS is a hybrid architecture that integrates Transformer, Mamba2 (Dao & Gu, 2024), and Feed-Forward Network (FFN) components, designed for scalability and efficiency in both training and inference. With 128 layers (57 Mamba, 7 Attention, and 64 FFN), the model scales to 56B activated parameters and 560B total parameters. The architecture employs an "AMF" (Attention → Mamba2 → FFN) and "MF" (Mamba2 → FFN) block pattern to balance performance and efficiency, for long-context tasks. Mamba2 layers achieve linear complexity, while Grouped-Query Attention (GQA) (Ainslie et al., 2023) further minimizes KV cache overhead. The FFN layers use an MoE structure with 32 experts, activating 1 shared and 2 specialized experts per token. Hunyuan-TurboS is pre-trained on a 16T highquality token dataset, supporting a context length of up to 256K. Notably, Hunyuan-TurboS is the first industry-deployed large-scale Mamba-based model, setting a new paradigm for efficient large-scale pre-trained models.

Hunyuan-TurboS 是混合架构，由 Transformer, Mamba2 (Dao & Gu, 2024) 和前馈网络（FFN）三类组件构成，训练和推理都照顾到可扩展性与效率。模型共 128 层（57 层 Mamba，7 层 Attention，64 层 FFN），激活参数 56B，总参数 560B. 架构用 「AMF」（Attention → Mamba2 → FFN）和 「MF」（Mamba2 → FFN）两种块模式，在长上下文任务上平衡性能和效率。Mamba2 层是线性复杂度，Grouped-Query Attention (GQA) (Ainslie et al., 2023) 进一步压低 KV cache 开销。FFN 层采用 MoE 结构，共 32 个专家，每个 token 激活 1 个共享专家和 2 个专项专家。Hunyuan-TurboS 在 16T 高质量 token 的数据集上预训练，支持最长 256K 的上下文。作者还指出，Hunyuan-TurboS 是业界第一个落地部署的大规模 Mamba 模型，为高效的大规模预训练模型建立了新范式。

> **核对：** 57 层 Mamba，7 层 Attention，64 层 FFN，加起来是不是正好 128?
> 是。57 加 7 等于 64，再加 64 等于 128。第 4 页 2.2 节写明每个 Attention，FFN，Mamba2 块各算一层，所以 128 数的是这三类子层，不是 AMF 块或 MF 块的个数。同一节给的比例也对得上：FFN 占 50%，即 64/128；Attention 占 5.5%，7/128 约 5.47%；Mamba2 占 44.5%，57/128 约 44.53%。第 5 页表 1 的 # Layers 也是 128。

> **拆开：** 「32 experts」 和 「1 shared and 2 specialized」 写在同一句里，32 里包不包括共享专家？
> 不包括。这一句把两件事并在一起，容易读成 32 个专家里挑 3 个。第 4 页 2.2 节拆开写了：每个 FFN 层有 1 个共享专家和 32 个专项专家，每次前向激活 1 个共享加 2 个专项。第 5 页表 1 也分成三行：共享专家 1，专项专家 32，激活的专项专家 2。所以 32 是专项专家那一列，共享专家另占一列。每个 FFN 层一共 33 个专家，每个 token 走其中 3 个。

> **想：** 这一页先说 thinking 模式，后说 256K. thinking 想得越深，是不是就用上了更长的窗口？
> 不是同一根轴。thinking 是推理时多算，也就是 TestingTime：同一个模型碰到难题多写推理步骤，第 9 到 10 页 3.2 节讲的是怎么训练模型自己选长 CoT 还是短 CoT. 256K 是窗口长度，第 5 到 6 页 2.4 节在预训练末期用 NTK-aware 位置编码，分阶段从 4K 扩到 32K 再到 256K，定下的是一次能放进多少上下文。第 16 页表 5 里 TurboS 平均只输出 1207.8 个 token，离 256K 很远。一个管每次回答花多少计算，一个管一次能读写多长，两者互不决定。

Our post-training strategy for Hunyuan-TurboS encompasses four critical modules designed to significantly enhance its capabilities. Initially, Supervised Fine-Tuning establishes a robust foundation by methodically curating 3M natural and synthetic (Wang et al., 2022; Luo et al., 2023b; Zeng et al., 2024; Luo et al., 2023a; Wei et al., 2023b) instruction data, categorized by comprehensively delineated topics across diverse domains and implementing multi-dimensional metrics for rigorous filtering and quality assurance. We then introduce a novel Adaptive Long-short Chain-of-Thought Fusion method, enabling the model to autonomously select optimal reasoning strategies, efficiently allocate computational resources, and enhance response readability through lossless compression and reformatting of lengthy chains of thoughts, achieved via a teacher model refined through dedicated SFT and a unique reinforcement learning framework with difficulty-adaptive and CoT compression rewards. Subsequently, Multi-round Deliberation Learning involves the SFT model comparing other cutting-edge Hunyuan models in a simulated evaluation environment, an iterative refinement cycle driven by evaluations from a multi-LLM judge ensemble and human expert oversight to strategically identify and address capability gaps, informing subsequent SFT iterations. Finally, a Two-stage Large-scale Reinforcement Learning process, leveraging GRPO, further hones the model. The first stage focuses on bolstering reasoning capabilities, while the second stage aims to improve general instruction-following proficiency across all domains. This synergistic, multi-faceted strategy aims to cultivate a highly capable, efficient, and adaptable language model.

Hunyuan-TurboS 的后训练有四个关键模块。第一是监督微调：系统地整理 300 万条自然和合成（Wang et al., 2022; Luo et al., 2023b; Zeng et al., 2024; Luo et al., 2023a; Wei et al., 2023b）的指令数据，按覆盖多个领域的细分主题归类，用多维指标严格过滤，保证质量，打下基础。第二是新的自适应长短 CoT融合方法：模型自己选择推理策略，高效分配计算资源，并对冗长的CoT做无损压缩和重排，让回答更好读。这一步靠一个教师模型完成，教师模型先经过专门的 SFT，再经过一个带难度自适应奖励和 CoT 压缩奖励的强化学习框架。第三是多轮 Deliberation Learning: SFT 模型在模拟的评测环境里和其他前沿混元模型比较，由多 LLM 评审团和人类专家监督驱动迭代，有针对性地找出并补上能力短板，结果反馈给下一轮 SFT。最后是基于 GRPO 的两阶段大规模强化学习，继续打磨模型。第一阶段加强推理能力，第二阶段提升所有领域的通用指令遵循。这几步配合起来，目标是得到能力强，效率高，适应面广的语言模型。

Both human and automated evaluations demonstrate the competitive capabilities of Hunyuan-TurboS. In the LMSys Chatbot Arena, known for its blind, side-by-side human evaluations that minimize bias and offer objective capability assessment, Hunyuan-TurboS achieved a notable score of 1356. This places it among the top 7 models, outperforming strong contenders like Gemini-2.0-Flash-001, o4- mini and Gemma-3-27B-it. Notably, in categories such as Math, Multi-Turn, and Longer Query, our model ranks among the top 5. For comprehensive automated assessment, we evaluated Hunyuan-TurboS across 23 benchmarks encompassing mathematical reasoning, logical reasoning, code generation, knowledge, alignment tasks, and instruction following. The model achieved an average score of 77.9%, significantly outperforming comparable non-reasoning models. While its performance approaches that of computationally intensive reasoning models, Hunyuan-TurboS demonstrates a remarkable balance of efficiency and effectiveness, particularly considering its substantially lower inference costs.

人工评测和自动评测都说明 Hunyuan-TurboS 有竞争力。LMSys Chatbot Arena 用盲测，两个模型并排由人打分，偏差小，评价比较客观。Hunyuan-TurboS 在这里拿到 1356 分，进入前 7，高于 Gemini-2.0-Flash-001，o4-mini 和 Gemma-3-27B-it。在 Math，Multi-Turn，Longer Query 等类别里，模型排进前 5。自动评测方面，我们在 23 个基准上评测 Hunyuan-TurboS，覆盖数学推理，逻辑推理，代码生成，知识，对齐任务和指令遵循。模型平均得分 77.9%，明显高于同类非推理模型。它的表现接近计算量大的推理模型，推理成本却低得多，效率和效果兼顾。

<!-- page 3 of 26 -->

Our main contribution includes:

我们的主要贡献如下：

## Pre-Training:（预训练）

(1) **Data Recipe:** We developed a meticulous data curation pipeline for 16T high-quality tokens, improving quantity, quality, and diversity through systematic filtering, deduplication, and specialized content extraction modules.

(1) 数据配方：我们为 16T 高质量 token 建了一条细致的数据整理流水线，通过系统的过滤，去重和专门的内容抽取模块，提升数量，质量和多样性。

(2) **560B Mamba:** We designed a novel 560B total parameter hybrid Transformer-Mamba2-MoE architecture, featuring innovative AMF/MF block patterns. This synergizes Mamba2's efficiency with Transformer's contextual understanding.

(2) 560B Mamba：我们设计了新的 Transformer-Mamba2-MoE 混合架构，总参数 560B，采用新的 AMF/MF 块模式，把 Mamba2 的效率和 Transformer 的上下文理解结合起来。

(3) **Annealing:** We implemented multi-stage pre-training refinements including an annealing phase with diverse data and curriculum-based long-context extension up to 256K tokens using NTK-aware positional encoding.

(3) 退火：我们做了多阶段的预训练改进，包括一个用多样数据的退火阶段，以及按课程式逐步把上下文扩到 256K token 的长上下文扩展，位置编码用 NTK-aware 方法。

## Post-Training:（后训练）

(1) **Data Recipe:** We curated a 3M instruction dataset for robust Supervised Fine-Tuning, categorized by diverse topics with rigorous quality assurance, establishing strong foundational capabilities for the model.

(1) 数据配方：我们整理了 300 万条指令数据做监督微调，按多种主题归类，严格把关质量，为模型打下基础能力。

(2) **Adaptive CoT Fusion:** We developed an Adaptive Long-short Chain-of-Thought Fusion method, enabling dynamic selection of reasoning strategies via a specially trained teacher model and reinforcement learning. Notably, our model delivers performance comparable to that of top-tier reasoning model in the LMSYS Chatbot Arena while utilizing only about 50% of the generation tokens, highlighting significant improvements in token efficiency which directly translate to reduced generation costs.

(2) 自适应 CoT 融合：我们提出自适应长短 CoT融合方法，借助专门训练的教师模型和强化学习，让模型动态选择推理策略。在 LMSYS Chatbot Arena 上，我们的模型和顶级推理模型表现相当，生成 token 只用了约 50%，token 效率明显提高，生成成本直接下降。

(3) **Deliberation Learning:** We implemented Multi-round Deliberation Learning, where the SFT model iteratively refines its capabilities by competing against other models, guided by an LLM-judge ensemble and Human expert oversight.

(3) Deliberation Learning：我们实施多轮 Deliberation Learning，SFT 模型在 LLM 评审团和人类专家的监督下，通过和其他模型竞争，迭代提升能力。

(4) **Two-stage GRPO:** We employed a two-stage Large-scale Reinforcement Learning (GRPO) process, first targeting STEM reasoning and then general instruction-following, guided by a comprehensive general reward system.

(4) 两阶段 GRPO：我们采用两阶段大规模强化学习（GRPO），先针对 STEM 推理，再针对通用指令遵循，由一套完整的通用奖励系统引导。

## Infrastructures:（基础设施）

(1) **Angel-RL:** We built Angel-RL, an efficient reinforcement learning framework integrating training and inference, incorporating comprehensive parallelism (TP, PP, EP, CP) and innovative statepassing for context parallelism.

(1) Angel-RL：我们搭建了 Angel-RL，一个训推一体的高效强化学习框架，集成全套并行方式（TP, PP, EP, CP），并为上下文并行设计了新的状态传递方法。

(2) **Mamba MoE:** We optimized inference via AngelHCF, featuring Mamba kernel enhancements (prefill/decode), MoE expert parallelism, and fp32 precision for Mamba states to improve longtext generation quality. It ultimately achieving a 1.8x speedup compared to Hunyuan-Turbo, which is a pure Transformers MoE model.

(2) Mamba MoE：我们用 AngelHCF 优化推理，包括 Mamba kernel 增强（prefill 和 decode），MoE 专家并行，以及 Mamba 状态改用 fp32 精度来提升长文本生成质量。最终比 Hunyuan-Turbo 快 1.8 倍，Hunyuan-Turbo 是纯 Transformer 的 MoE 模型。

## Summary of Core Evaluation Results:（核心评测结果）

(1) **LMSYS Chatbot Arena:** Hunyuan-TurboS achieved a 1356 Arena score, ranking top 7 overall. It excelled with top 1 in Chinese, French, and Spanish, and top 5 in tasks like Hard Prompts, Creative Writing, Multi-Turn, and Longer Queries.

(1) LMSYS Chatbot Arena: Hunyuan-TurboS 拿到 1356 的 Arena 分数，总榜前 7。中文，法语，西班牙语排第 1，Hard Prompts，Creative Writing，Multi-Turn，Longer Queries 等任务进入前 5。

(2) **Automatic Evaluations:** The model demonstrated strong performance across 23 automated benchmarks, achieving an average of 77.9%, with notable results in mathematics, coding and general domains.

(2) 自动评测：模型在 23 个自动化基准上平均 77.9%，数学，代码和通用领域的结果比较突出。

(3) **Balance efficiency and performance:** Our model effectively balances high performance and computational efficiency, delivering substantial capabilities comparable to larger reasoning models but at significantly lower inference costs across diverse evaluations.

(3) 效率与性能的平衡：模型兼顾高性能和计算效率，能力接近更大的推理模型，在各类评测中推理成本都明显更低。

<!-- page 4 of 26 -->

## 2 Pre-Training（预训练）

In this section, we will introduce the details of our pre-training stage in Hunyuan-TurboS, including (a) data for pre-training, which provides a systematic pipeline for data quality control and data mix, providing fundamental information for the capability acquisition of LLMs, (b) model structure, which proposes a novel hybrid Transformer-Mamba structure for effective and efficient LLM training and serving, with comprehensive design motivations and details, and (c) annealing and long-context pre-training recipes, with several insights during these two essential stages in pre-training. These techniques build the foundation of our Hunyuan-TurboS's remarkable capability to facilitate downstream applications.

本节介绍 Hunyuan-TurboS 预训练阶段的细节，包括三部分：（a）预训练数据，给出一条系统的数据质量控制和数据配比流水线，这是 LLM 获得能力的基础；（b）模型结构，提出新的 Transformer-Mamba 混合结构，让 LLM 的训练和服务都高效，并交代完整的设计动机和细节；（c）退火和长上下文预训练的配方，以及这两个关键阶段里的几点经验。这些技术是 Hunyuan-TurboS 能力的基础，支撑下游应用。

## 2.1 Data for Pre-training（预训练数据）

Pre-training data are the fundamental fuel of LLMs. Compared to Hunyuan-Large (Sun et al., 2024), we enhance the data used for the pre-training stage in three key dimensions: quantity, quality, and diversity.

预训练数据是 LLM 的基本燃料。和 Hunyuan-Large (Sun et al., 2024) 相比，我们从数量，质量，多样性三个维度改进了预训练数据。

![Image block](images/p04-figure-2-the-curation-pipeline-of-pre-training-data-in.png)

（图：从左到右的流程图。Source Corpus 先进 Pre-Processing 框，框内四项：url-level deduplication, url filtering, pruning, topic classification。再进 Model-based Extraction 框，框内两项：text extraction model, math/code extraction module。最后进 Post-Processing 框，框内两项：heuristic filtering, semantic-level deduplication.）

Figure 2: The curation pipeline of pre-training data in Hunyuan-TurboS.

图 2: Hunyuan-TurboS 预训练数据的整理流水线。

We rigorously refine our curation pipeline to efficiently process diverse raw data sources, as illustrated in Figure 2. The process begins with URL-level deduplication and filtering of the varied-format source data to eliminate redundant items. Additionally, we utilize precise block-level pruning techniques to remove noisy content within each instance, further reducing the volume of low-quality data and accelerating downstream processes. Each piece of raw content is then annotated with a specific topic label by our topic classification model, which facilitates subsequent processing stages. Following this, a content extraction model processes the previously cleaned data to extract plain text. To ensure the acquisition of high-quality STEM and code data, we construct several domain-specific extraction modules. Additionally, we employ comprehensive heuristic filtering methods to discard low-qualified extracted content, and implement global-scale semantic-level deduplication to produce the final data.

我们仔细改进了整理流水线，以便高效处理各种原始数据源，如图 2 所示。流程先对不同格式的源数据做 URL 级去重和过滤，去掉冗余条目。再用精确的块级剪枝去掉每条数据内部的噪声，进一步减少低质数据，也让后续处理更快。然后主题分类模型给每条原始内容打上主题标签，方便后面的阶段。接着内容抽取模型从清洗过的数据里抽出纯文本。为了拿到高质量的 STEM 和代码数据，我们建了几个领域专用的抽取模块。此外，用一套启发式过滤丢掉抽取质量差的内容，再做全局规模的语义级去重，得到最终数据。

Furthermore, we optimize our quality and diversity assurance systems by developing comprehensive critique models and data mixture models. We introduce several foundational quality criteria with dozens of well-organized domain type labels into our critique models, enabling principled data selection and integration. Across different phases of pre-training, we employ effective mixture models to provide varied data mixture recipes that ensure optimal data utilization.

我们还开发了完整的评判模型（critique model）和数据配比模型，来优化质量和多样性的保障体系。评判模型里引入了几条基础质量标准，以及几十个组织好的领域类型标签，让数据的选择和整合有章可循。在预训练的不同阶段，配比模型给出不同的数据配方，让数据得到最好的利用。

Overall, Hunyuan-TurboS is trained on a corpus comprising 16 trillion tokens in our tokenizer, which is the same as the tokenizer used in Hunyuan-Large employing a vocabulary consisting of 128K tokens.

总的来说，Hunyuan-TurboS 在 16 万亿 token 的语料上训练，token 数按我们的分词器计。分词器和 Hunyuan-Large 相同，词表大小 128K。

## 2.2 Model Architecture（模型架构）

Hunyuan-TurboS is a hybrid architecture that combines Transformer (Vaswani et al., 2017), Mamba2 (Dao & Gu, 2024), and Feed-Forward Network (FFN) components. Designed in compliance with scaling laws and optimized for both training and inference efficiency, the model was scaled to 56B activated parameters and 560B total parameters. The architecture comprises 128 layers (where each Attention, FFN, and Mamba2 block counts as one layer). Each FFN layer adopts an MoE structure following similar strategies used in Hunyuan-Large (Sun et al., 2024), consisting of 1 shared expert and 32 specialized experts, with 1 shared + 2 specialized experts activated per forward pass. The Mamba2 layers employ a state-space model (SSM) architecture achieving linear sequence-length complexity (O(n)). We extensively explored various combinations of Attention (A), Mamba2 (M), and FFN (F) layers to optimize model performance while maintaining efficiency under fixed activated and total parameter budgets. The ratio of Attention layers significantly impacts model performance, validation loss, key-value (KV) cache overhead, and inference efficiency. To maximize training efficiency and model effectiveness, we maintained FFN layers at 50% percent of the total, with 5.5% Attention and 44.5% Mamba2 layers. The Attention layers utilize Grouped-Query Attention (GQA) to minimize KV cache memory usage. Additionally, QK normalization was implemented in the Attention blocks to enhance the training stability.

Hunyuan-TurboS 是混合架构，组合了 Transformer (Vaswani et al., 2017), Mamba2 (Dao & Gu, 2024) 和前馈网络（FFN）三类组件。架构按 scaling laws 设计，训练和推理效率都做了优化，最终规模是激活参数 56B，总参数 560B. 架构共 128 层（每个 Attention，FFN，Mamba2 块各算一层）。每个 FFN 层采用 MoE 结构，策略和 Hunyuan-Large (Sun et al., 2024) 相近，由 1 个共享专家和 32 个专项专家组成，每次前向激活 1 个共享专家加 2 个专项专家。Mamba2 层用状态空间模型（SSM）架构，复杂度随序列长度线性增长 (O(n))。在激活参数和总参数预算固定的前提下，我们试了 Attention (A), Mamba2 (M), FFN (F) 层的多种组合，在保持效率的同时优化性能。Attention 层的占比对模型性能，验证损失，key-value (KV) cache 开销和推理效率影响很大。为了兼顾训练效率和模型效果，FFN 层保持在总层数的 50%，Attention 占 5.5%，Mamba2 占 44.5%. Attention 层用 Grouped-Query Attention (GQA) 压低 KV cache 显存。Attention 块里还加了 QK normalization，提高训练稳定性。

For the specific architecture, We define the "AMF" block (Attention→Mamba2→FFN) emerged as an optimal atomic configuration, effectively balancing efficiency. We also adopt the "MF" block in our

具体架构上，我们把 「AMF」 块（Attention→Mamba2→FFN）定为最优的原子配置，它在效率上取得平衡。为了进一步提效，结构里也用了 「MF」 块（句子接到下一页）。

<!-- page 5 of 26 -->

structure for further efficiency. Hunyuan-TurboS employs an interleaved architecture of "AMF" and "MF" blocks.

（接上页）Hunyuan-TurboS 采用 「AMF」 块和 「MF」 块交错排列的架构。

> **停一下：** 全模型只有 7 个 Attention，如果每个 Attention 都在一个 AMF 块里，剩下的全是 MF 块，层数能不能凑回 57 和 64?
> 凑不回。7 个 AMF 块用掉 7 个 Attention，7 个 Mamba2, 7 个 FFN。剩下 50 个 Mamba2 全配成 MF 块，只能再带 50 个 FFN，FFN 合计 57，比第 2 页和第 4 页写的 64 少 7 个。7 × 3 + 50 × 2 = 121，离 128 还差 7 层，差的正好是这 7 个 FFN。论文只写 「AMF 和 MF 交错」，没有给逐层顺序，也没有提单独的 F 块。57 + 7 + 64 = 128 这个总数成立，多出来的 7 个 FFN 放在哪里，本文没有交代。

**Model Hyper-parameters.** Hunyuan-TurboS uses a hidden dimension of 5,120, while each expert's intermediate dimension is set to 17,024. In the Attention layers, we configure 64 Attention heads with 8 KV heads. For the Mamba2 blocks, we use 64 parallel heads with a SSM group size of 16. The chunk size in Mamba2 layer is 128.

模型超参数。Hunyuan-TurboS 的隐藏维度是 5,120，每个专家的中间维度是 17,024. Attention 层配 64 个注意力头，8 个 KV 头。Mamba2 块用 64 个并行头，SSM group size 为 16. Mamba2 层的 chunk size 是 128。

**Training Hyper-parameters.** Key hyper-parameters of Hunyuan-TurboS are listed in Table 1. We train the base model with a sequence length of 4, 096 tokens for a total of 16 trillion tokens. The optimization uses AdamW $( \beta _ { 1 } = 0 . 9 , \dot { \beta } _ { 2 } = 0 . 9 5 )$ with weight decay $\lambda = 0 . 1$ . For Mixture of Experts training, we set the capacity factor $\gamma = 1 . 5$ to ensure adequate expert coverage.

训练超参数。关键超参数列在表 1。基座模型用 4,096 token 的序列长度训练，共 16 万亿 token。优化器是 AdamW (β1 = 0.9, β2 = 0.95)，权重衰减 λ = 0.1. MoE 训练的 capacity factor 设为 γ = 1.5，保证专家覆盖充分。（源文公式里 β2 头上多了一个点，是公式识别带进来的。）

Table 1: Overview of the key hyper-parameters of Hunyuan-TurboS.

表 1: Hunyuan-TurboS 关键超参数一览。

| Configuration | Value |
| --- | --- |
| # Layers | 128 |
| # Attention Heads | 64 |
| # Key/Value Heads | 8 |
| # Mamba2 SSM Groups | 16 |
| # Shared Experts of MoE Layers | 1 |
| # Specialized Experts of MoE Layers | 32 |
| # Activated Specialized Experts of MoE Layers | 2 |
| # Trained Tokens | 16T |
| Mamba2 d state size | 128 |
| Mamba2 chunk size | 128 |
| Vocabulary Size | 128K |
| Hidden Size | 5120 |

表：层数 128。注意力头 64. KV 头 8. Mamba2 SSM 组数 16. MoE 层共享专家 1. MoE 层专项专家 32. MoE 层激活的专项专家 2。训练 token 16T. Mamba2 d state 大小 128. Mamba2 chunk size 128。词表 128K. 隐藏维 5120。

> **看表：** 正文写 「SSM group size of 16」，表 1 写 「# Mamba2 SSM Groups 16」，16 是每组的大小，还是组的个数？
> 两处说法对不上。「group size」 读作每组 16，「# Groups」 读作一共 16 组。按 64 个并行头算，前一种读法是 4 组，后一种是每组 4 个头。本文只在这两处提到它，没有第三个数能判定。表 1 还少两格：Mamba2 的 64 个并行头和专家中间维 17,024 只出现在第 5 页 「Model Hyper-parameters」 这一段。反过来，表里的 d state 128 在正文里没有出现；chunk size 128 两处一致。

> **确认：** 表 1 的 5120 和正文的 17,024，能不能估出专家部分占了多少参数？
> 能估出量级，但要加一个本文没写的假设。如果每个专家是三个矩阵的门控 FFN，一个专家约 3 × 5120 × 17024 ≈ 0.26B 参数。每层 33 个专家，64 个 FFN 层，合计约 552B，和总参数 560B 在同一量级。每层激活 3 个，合计约 50B，和激活参数 56B 在同一量级。剩下的差额要由 Mamba2，Attention 和词表嵌入（128K × 5120 ≈ 0.66B，一份）来补。这只是按表 1 和第 5 页正文做的估算，本文没有给参数分解，也没写 FFN 用几个矩阵。

## 2.3 Annealing（退火）

Following the completion of our pre-training stage, we introduce an annealing stage designed to rapidly decay the learning rate and refine the capabilities of the base model. This stage begins from the terminal learning rate of pre-training and applies a fast cosine decay schedule down to a minimal learning rate of 5e-6. We configure a sequence length of 4,096 tokens and a batch size corresponding to approximately 9 million tokens. We allocate 300B tokens for the annealing stage. This setup facilitates efficient largecontext training while maintaining computational tractability. To ensure comprehensive performance and robustness, the annealing stage is trained on a heterogeneous mixture of data, including high-quality pre-training data, code, mathematics, STEM-related corpora, instruction-following datasets (such as long-CoT data), and other synthetically generated samples. We conduct extensive data ablation and composition studies to optimize the data distribution, addressing model deficiencies and enhancing generalization. Several key insights that emerged during this stage are as follows.

预训练结束后，我们加一个退火阶段，快速衰减学习率，打磨基座模型的能力。这一阶段从预训练末端的学习率开始，按快速的 cosine 衰减降到最小学习率 5e-6。序列长度 4,096 token，batch size 约合 900 万 token。退火阶段分配 300B token。这样的设置让大上下文训练高效，计算量也可控。为了保证整体性能和鲁棒性，退火阶段用异构的数据混合训练，包括高质量预训练数据，代码，数学，STEM 语料，指令遵循数据（如长 CoT 数据）和其他合成样本。我们做了大量数据消融和配比实验来优化数据分布，补模型短板，增强泛化。这一阶段得到的几点关键经验如下。

(1) Retaining high-quality data from pre-training is of critical importance. Through extensive empirical studies, we carefully curated the composition and proportion of this subset, and found that such optimization leads to substantial improvements in both downstream task performance and generalization ability.

(1) 保留预训练里的高质量数据很关键。经过大量实证研究，我们仔细调整了这部分数据的构成和比例，发现这种优化能明显提升下游任务表现和泛化能力。

(2) A substantial portion of instruction-following data is advanced into the annealing stage. This strategy reduces the amount of instruction tuning required during the SFT stage and facilitates greater capacity for improvement in the subsequent RL stage.

(2) 相当一部分指令遵循数据被提前放进退火阶段。这样能减少 SFT 阶段需要的指令微调量，也给后面的 RL 阶段留出更大的提升空间。

(3) A moderate proportion of web-crawled content is retained, and target loss is selectively applied to QA-style data. This combination helps prevent the base model from drifting into generating test-like questions when it is supposed to continue open-ended text.

(3) 保留适量的网页爬取内容，并只对问答式数据施加 target loss。两者结合，能防止基座模型在本该续写开放文本的时候，漂移成生成考题式的问题。

(4) Sequence truncation is carefully processed, particularly for long-CoT data. To avoid discarding critical answer content, sequences exceeding the context window are deferred to the long-context training phase.

(4) 序列截断要仔细处理，长 CoT 数据尤其如此。为了不丢掉关键的答案内容，超出上下文窗口的序列推迟到长上下文训练阶段再用。

## 2.4 Long-Context Extension（长上下文扩展）

In the final phase of pre-training, we employ a curriculum-based strategy to progressively expand the model's context window. The context is scaled from 4K tokens to 32K tokens, and ultimately to 256K tokens, as in Hunyuan-Large. This staged expansion is facilitated by NTK-aware (Peng & Quesnelle,

预训练的最后阶段，我们用课程式策略逐步扩大模型的上下文窗口。上下文从 4K token 扩到 32K token，最后到 256K token，做法和 Hunyuan-Large 相同。这种分阶段扩展借助 NTK-aware (Peng & Quesnelle，（句子接到下一页）

<!-- page 6 of 26 -->

2023) positional encoding, incorporating scaling parameters α = 50 for the 32K stage and α = 1000 for the 256K stage. Throughout this stage, we maintain a constant learning rate of 5e-6 and a batch size of approximately 9 million tokens, consistent with the annealing stage. To balance capacity preservation with context extension, we adopt a cautious training strategy that leverages slightly increased token volumes, i.e., 30B for 32K and 20B for 256K, with a 3:1 ratio of short-context to long-context data. We also carefully curate a collection of long documents that span diverse domains and genres, which are relatively scarce in natural distributions but play a crucial role in enhancing the performance of downstream tasks.

（接上页）2023) 位置编码实现，32K 阶段取 α = 50, 256K 阶段取 α = 1000。整个阶段学习率固定在 5e-6，batch size 约 900 万 token，和退火阶段一致。为了在扩展上下文的同时保住已有能力，我们采用谨慎的训练策略，token 量略有增加：32K 阶段 30B，256K 阶段 20B，短上下文和长上下文数据的比例为 3:1。我们还精心收集了一批跨领域，跨体裁的长文档，这类文档在自然分布里比较少，对提升下游任务表现却很关键。

> **对一下：** 「slightly increased token volumes」 后面给的是 30B 和 20B，256K 阶段反而比 32K 阶段少，增加是和什么比？
> 本文没有给参照。能对照的只有第 5 到 6 页的数字：32K 阶段 30B，256K 阶段 20B，两段合计 50B，退火阶段是 300B. 「略有增加」 没写基线是哪一个。另一个能算的量是每个 batch 里的序列条数：batch 约 900 万 token，在 4,096 长度下约 2,200 条，在 256K 长度下只有约 34 条。3:1 是按条数还是按 token 计，本文也没说，所以 256K 阶段真正的长序列到底有多少条，算不出来。

## 2.5 Evaluations on Pre-Trained Model（预训练模型评测）

In this section, we evaluate the performance of Hunyuan-TurboS pre-trained model across a broad range of widely-used benchmarks, demonstrating its strong fundamental capabilities in diverse tasks.

本节在一系列常用基准上评测 Hunyuan-TurboS 的预训练模型，展示它在各类任务上的基础能力。

## 2.5.1 Benchmarks and Experimental Settings（基准与实验设置）

**Key Benchmarks.** We evaluated Hunyuan-TurboS on a comprehensive set of widely-used benchmarks spanning multiple tasks, including commonsense reasoning, reading comprehension, question answering, mathematical problem solution, coding, and aggregated tasks, in both English and Chinese. We conduct extensive evaluations on the following benchmarks:

关键基准。我们在一套覆盖面广的常用基准上评测 Hunyuan-TurboS，任务包括常识推理，阅读理解，问答，数学解题，代码和综合任务，中英文都有。具体基准如下：

**Aggregated knowledge:** We evaluate knowledge coverage using MMLU (Hendrycks et al., 2021), MMLU-Pro (Wang et al., 2024b), MMLU-Redux (Gema et al., 2024), BBH (Suzgun et al., 2022), CMMLU (Li et al., 2023a), C-Eval (Huang et al., 2024), CCPM (Li et al., 2021), and SuperGPQA (Du et al., 2025).

综合知识：用 MMLU，MMLU-Pro，MMLU-Redux，BBH，CMMLU，C-Eval，CCPM，SuperGPQA 评估知识覆盖。

• **Commonsense reasoning:** For commonsense understanding, we use HellaSwag (Zellers et al., 2019), WinoGrande (Sakaguchi et al., 2021), and PIQA (Bisk et al., 2020).

• 常识推理：常识理解用 HellaSwag, WinoGrande, PIQA。

**Question answering & reading comprehension:** We assess fundamental NLP abilities with DROP (Dua et al., 2019) and NaturalQuestions (Kwiatkowski et al., 2019), while ARC-C (Clark et al., 2018) and TriviaQA (Joshi et al., 2017) evaluate science and world knowledge.

问答与阅读理解：用 DROP 和 NaturalQuestions 评估基础 NLP 能力，用 ARC-C 和 TriviaQA 评估科学知识和世界知识。

• **Mathematical reasoning:** Mathematical proficiency is tested via GSM8k (Cobbe et al., 2021), MATH (Hendrycks et al., 2021), CMATH (Wei et al., 2023a), and MGSM (Shi et al., 2022).

• 数学推理：数学能力用 GSM8k，MATH，CMATH，MGSM 衡量。

• **Coding:** Coding ability is evaluated using EvalPlus (Chen et al., 2021), MultiPL-E (Cassano et al., 2022), MBPP (Austin et al., 2021), CRUXEval (Gu et al., 2024), and LiveCodeBench (Jain et al., 2024).

• 代码：代码能力用 EvalPlus，MultiPL-E，MBPP，CRUXEval，LiveCodeBench 评估。

**Evaluation Settings and Baselines.** We adhere to standard evaluation protocols across benchmarks, including established metrics and shot configurations. Specifically, we employ zero-shot for TriviaQA, PIQA, C3, EvalPlus, MultiPL-E, LiveCodeBench, CRUXEval, and CCPM; 3-shot evaluation for BBH, MBPP, and DROP; 4-shot evaluation for GSM8K, MATH, and CMATH; 5-shot evaluation for MMLU, MMLU-Pro, MMLU-Redux, SuperGPQA, C-Eval, CMMLU, WinoGrande, and NaturalQuestions; 7-shot evaluation for CommonsenseQA; 8-shot evaluation for MGSM; 10-shot evaluation for HellaSwag; 25-shot evaluation for ARC-C. We compare Hunyuan-TurboS against state-of-the-art pre-trained base models of comparable parameter scales, including: Llama-4-Maverick (Meta, 2025), DeepSeek-V3 (Liu et al., 2024), and Qwen3-235B-A22B (Yang et al., 2025a). Owing to the architectural advantage of Mamba2 and Attention hybrid design, our model achieves significantly lower downstream deployment costs. For fairness, we report the highest performance among publicly available results.

评测设置与基线。各基准都按标准评测协议做，包括既定指标和 shot 配置。具体来说：TriviaQA，PIQA，C3，EvalPlus，MultiPL-E，LiveCodeBench，CRUXEval，CCPM 用 zero-shot；BBH，MBPP，DROP 用 3-shot；GSM8K，MATH，CMATH 用 4-shot；MMLU，MMLU-Pro，MMLU-Redux，SuperGPQA，C-Eval，CMMLU，WinoGrande，NaturalQuestions 用 5-shot；CommonsenseQA 用 7-shot；MGSM 用 8-shot；HellaSwag 用 10-shot；ARC-C 用 25-shot。我们把 Hunyuan-TurboS 和参数规模相当的最先进预训练基座模型比较，包括 Llama-4-Maverick (Meta, 2025), DeepSeek-V3 (Liu et al., 2024), Qwen3-235B-A22B (Yang et al., 2025a)。由于 Mamba2 和 Attention 混合设计的架构优势，我们模型的下游部署成本明显更低。为公平起见，对手分数取公开结果里的最高值。

## 2.5.2 Model Performance of Pre-Training（预训练模型表现）

As illustrated in Table 2, the results demonstrate the robust capabilities of Hunyuan-TurboS compared to other state-of-the-art models. As the largest model in this comparison with 56B activated parameters and 560B total parameters, Hunyuan-TurboS delivers leading performance across multiple domains while maintaining efficient inference capabilities through optimized hybrid Mamba2, Attention, and MoE architecture.

如表 2 所示，Hunyuan-TurboS 相对其他最先进模型能力扎实。作为这组对比里 「最大」 的模型（激活参数 56B，总参数 560B），Hunyuan-TurboS 在多个领域领先，同时靠 Mamba2，Attention，MoE 的混合架构保持推理高效。

> **回看：** 「the largest model in this comparison」，按表 2 的哪一行算最大？
> 只有激活参数那一行成立。第 7 页表 2 的激活参数是 17B，37B，22B，56B，TurboS 最大。总参数一行是 402B，671B，235B，560B，DeepSeek-V3 的 671B 比 TurboS 大。原句把两个量放在同一个括号式的定语里说 「最大」，只有激活参数撑得住这个说法。

In English tasks, Hunyuan-TurboS achieves first-tier results, notably attaining 54.63 on SuperGPQA (exceeding all competitors by over 10%) and 89.76 on BBH. While slightly trailing Qwen3-235B-A22B in MMLU-Redux (87.11 vs 87.40), our model demonstrates particularly strong reasoning capabilities with 92.22 on TriviaQA. Besides, Hunyuan-TurboS shows balanced strengths across various domains, achieving nearly state-of-the-art performance in WinoGrande (86.5) and PIQA (86.7). For Chinese capabilities, Hunyuan-TurboS reaches new height with 90.57 on CMMLU while maintaining competitive performance on C-Eval (88.7). Mathematical reasoning showcases Hunyuan-TurboS's most dramatic improvements, achieving 81.4 on MATH while maintaining parity with Qwen3-235B-A22B on GSM8K (both 94.39). Coding tasks emerges as another standout domain, where our model achieves the overall highest score compared to other models.

英文任务上，Hunyuan-TurboS 达到第一梯队，SuperGPQA 拿到 54.63（比所有对手高出 10% 以上），BBH 拿到 89.76. MMLU-Redux 略低于 Qwen3-235B-A22B（87.11 对 87.40），但 TriviaQA 的 92.22 显示出很强的推理能力。Hunyuan-TurboS 在各领域也比较均衡，WinoGrande (86.5) 和 PIQA (86.7) 接近最先进水平。中文方面，CMMLU 达到新高 90.57, C-Eval (88.7) 也有竞争力。数学推理是 Hunyuan-TurboS 提升最大的部分，MATH 达到 81.4，GSM8K 和 Qwen3-235B-A22B 持平（都是 94.39）。代码是另一个亮点，我们的模型总体得分在所有对比模型里最高。

<!-- page 7 of 26 -->

Table 2: Performance of pre-trained Hunyuan-TurboS and other open-source base models.

表 2: Hunyuan-TurboS 预训练模型和其他开源基座模型的表现。

| Model | LLama-4-Maverick | DeepSeek-V3 | Qwen3-235B-A22B | Hunyuan-TurboS |
| --- | --- | --- | --- | --- |
| Architecture | MoE | MoE | MoE | MoE |
| # Activated Params | 17B | 37B | 22B | 56B |
| # Total Params | 402B | 671B | 235B | 560B |
| Context Length | 256K | 128K | 128K | 256K |
| English |  |  |  |  |
| MMLU | 85.16 | 87.19 | 87.81 | 87.94 |
| MMLU-Pro | 63.91 | 59.84 | 68.18 | 65.11 |
| MMLU-Redux | 84.05 | 86.14 | 87.40 | 87.11 |
| BBH | 83.62 | 86.22 | 88.87 | 89.76 |
| SuperGPQA | 40.85 | 41.53 | 44.06 | 54.63 |
| HellaSwag | - | 88.9 | - | 87.1 |
| WinoGrande | - | 84.9 | - | 86.5 |
| PIQA | - | 84.7 | - | 86.7 |
| NaturalQuestions | - | 40.0 | - | 45.6 |
| DROP | - | 89.0 | - | 85.3 |
| ARC-C | - | 95.3 | - | 97.32 |
| TriviaQA | - | 82.9 | - | 92.22 |
| Chinese |  |  |  |  |
| CMMLU | - | 88.8 | - | 90.57 |
| C-Eval | - | 90.1 | - | 88.7 |
| CCPM | - | 92.0 | - | 90.11 |
| Math |  |  |  |  |
| MGSM | 79.69 | 82.68 | 83.53 | 77.64 |
| GSM8K | 87.72 | 87.57 | 94.39 | 94.39 |
| MATH | - | 61.6 | - | 81.4 |
| CMATH | - | 90.7 | - | 91.83 |
| Code |  |  |  |  |
| EvalPlus | 68.23 | 63.75 | 77.60 | 78.99 |
| MultiPL-E | 57.28 | 62.26 | 65.94 | 67.13 |
| MBPP | 75.40 | 74.20 | 81.40 | 85.45 |
| CRUX-I | - | 67.3 | - | 68.88 |
| CRUX-O | 77.0 | 69.9 | 79.0 | 75.88 |
| LiveCodeBench | - | 19.4 | - | 23.49 |

表：四列依次是 LLama-4-Maverick，DeepSeek-V3，Qwen3-235B-A22B，Hunyuan-TurboS，架构都是 MoE。激活参数 17B, 37B, 22B, 56B. 总参数 402B, 671B, 235B, 560B. 上下文长度 256K, 128K, 128K, 256K. TurboS 一列：英文部分 MMLU 87.94, MMLU-Pro 65.11, MMLU-Redux 87.11, BBH 89.76, SuperGPQA 54.63, HellaSwag 87.1, WinoGrande 86.5，PIQA 86.7，NaturalQuestions 45.6，DROP 85.3，ARC-C 97.32，TriviaQA 92.22；中文部分 CMMLU 90.57，C-Eval 88.7，CCPM 90.11；数学部分 MGSM 77.64，GSM8K 94.39，MATH 81.4，CMATH 91.83；代码部分 EvalPlus 78.99, MultiPL-E 67.13, MBPP 85.45, CRUX-I 68.88, CRUX-O 75.88, LiveCodeBench 23.49。表里的 「-」 本文没有解释。

> **看表：** 正文说代码 「总体最高」，表 2 里 TurboS 是不是每一行都领先？
> 不是。代码五行里，CRUX-O 是 75.88，低于 Llama-4-Maverick 的 77.0 和 Qwen3-235B-A22B 的 79.0；CRUX-I 和 LiveCodeBench 只有 DeepSeek-V3 一个对手有数。其他领域也有落后的格：MMLU-Pro 65.11 低于 Qwen3 的 68.18，MGSM 77.64 是四列里最低，DROP 85.3 低于 DeepSeek-V3 的 89.0，C-Eval 88.7 和 CCPM 90.11 也低于 DeepSeek-V3。第 6 页 2.5.2 节只提了 MMLU-Redux 的落后。另外第 6 页的 shot 设置里列了 C3 和 CommonsenseQA，表 2 没有这两行。

<!-- page 8 of 26 -->

![Image block](images/p08-figure-3-a-diagram-illustrating-the-four-steps-of.png)

（图：四步横向流程，左端 Hunyuan Base，右端 Hunyuan TurboS. Step 1: Fusion Supervised Fine-Tuning，Reasoning Adaptive Teacher 产出 Reasoning Data，和 Non-Reasoning Data 一起进入 Fusion Supervised Fine-Tuning. Step 2: Deliberation Learning SFT，上方是三个人像围着放大镜的 Weakness Deliberation，下方是循环箭头 Multi Round Deliberation Learning. Step 3: Reasoning GRPO，Policy Model 指向 Reference Model，下接 Reasoning Reward System，格子为 Math, Science, Code, Logic. Step 4: General GRPO，同样是 Policy Model 和 Reference Model，下接 General Reward System，格子有 Reasoning Reward System, Agent, Text Understanding, Complex Instruct, QA, Finance/Legal/Medical, Creative Writing, Role Play, Multilingual, Multi-turn, Long Context, Translation, Safety, RAG.）

Figure 3: A diagram illustrating the four steps of Hunyuan-TurboS post-training.

图 3: Hunyuan-TurboS 后训练四个步骤的示意图。

## 3 Post-training（后训练）

As shown in the Figure 3, our approach to post-train Hunyuan-TurboS encompasses four critical modules:

如图 3 所示，Hunyuan-TurboS 的后训练包括四个关键模块：

(1) **Supervised Fine-Tuning**: We categorize instruction data collection by comprehensively delineated topics across diverse domains. This methodical approach facilitates specialized data curation while implementing multi-dimensional metrics for rigorous filtering and quality assurance, establishing a robust foundation for the model's fundamental capabilities.

(1) 监督微调：指令数据按覆盖多个领域的细分主题收集。这样便于按主题专门整理数据，同时用多维指标严格过滤，保证质量，为模型的基础能力打好底子。

(2) **Adaptive Long-short Chain-of-Thought Fusion**: We propose a novel method to enable the model to autonomously select optimal reasoning strategies and efficiently allocate computational resources based on task requirements. This approach also enhances the readability of responses through lossless compression and reformatting of lengthy chains of thoughts.

(2) 自适应长短 CoT融合：我们提出一种新方法，让模型根据任务需要自己选择最合适的推理策略，高效分配计算资源。这一方法还对冗长的CoT做无损压缩和重排，提升回答的可读性。

(3) **Multi-round Deliberation Learning**: The SFT model will compete with other cutting-edge Hunyuan models across an extensive instruction collection, with a strategic focus on identifying and addressing capability gaps between Hunyuan-TurboS and other top-tier Hunyuan models.

(3) 多轮 Deliberation Learning: SFT 模型在大量指令上和其他前沿混元模型竞争，重点是找出并弥补 Hunyuan-TurboS 和其他顶级混元模型之间的能力差距。

(4) **Two-stage Large-scale Reinforcement Learning**: Our reinforcement learning begins with STEM-focused GRPO training to enhance reasoning capabilities, followed by general domain GRPO to improve instruction-following proficiency across all areas.

(4) 两阶段大规模强化学习：先做面向 STEM 的 GRPO 训练增强推理能力，再做通用领域 GRPO 提升各方面的指令遵循。

## 3.1 Supervised Fine-tuning（监督微调）

This section details the supervised fine-tuning (SFT) phase of Hunyuan-TurboS. Quality and diversity of SFT data are critical for LLM performance across diverse tasks. We categorize SFT data into fine-grained topics, curating high-quality samples for each and integrating them into a unified dataset. The data construction for each topic is detailed below.

本节介绍 Hunyuan-TurboS 的监督微调（SFT）阶段。SFT 数据的质量和多样性对 LLM 在各类任务上的表现很关键。我们把 SFT 数据分成细粒度主题，为每个主题整理高质量样本，再合并成一个统一的数据集。各主题的数据构建如下。

(1) **Math:** We collect math problems from diverse educational sources (textbooks, exams, competitions), spanning difficulties from elementary to academic competitions. Generative reward models and verifiers ensure CoT quality through evaluation and iterative refinement.

(1) 数学：从多种教育来源（教材，考试，竞赛）收集数学题，难度从小学到学术竞赛。生成式奖励模型和验证器通过评估和迭代打磨保证 CoT 质量。

(2) **Coding:** A pipeline creates high-quality instruction data from source code. Code snippets from open-source repositories (e.g., GitHub) are transformed into instructional pairs (Wei et al., 2024), categorized and optimized for diverse task types, languages, and knowledge. Data quality is ensured by multi-stage filtering with critic models and sandbox execution.

(2) 代码：一条流水线从源代码构造高质量指令数据。开源仓库（如 GitHub）的代码片段被转成指令对（Wei et al., 2024），按任务类型，编程语言和知识点分类并优化。数据质量靠 critic 模型的多阶段过滤和沙箱执行保证。

(3) **Logic:** We extract data from public/licensed sources and use an automated synthesis pipeline (akin to ZebraLogic (Lin et al., 2025)) to scale volume. Data is categorized by question type and difficulty. Quality is ensured by tiered validation: models for standard cases, human experts for complex ones, balancing accuracy and efficiency.

(3) 逻辑：从公开或授权来源抽取数据，再用自动合成流水线 (类似 ZebraLogic (Lin et al., 2025)) 扩大数量。数据按题型和难度分类。质量靠分层验证：普通样本交给模型，复杂样本交给人类专家，兼顾准确和效率。

<!-- page 9 of 26 -->

(4) **Science:** We collected diverse data (physics, chemistry, biology) from middle school to graduate level. LLMs mark difficulty/quality; difficult questions (e.g., Olympiads, university-level) are selected for post-training. An LLM-based Verifier with CoT checks if generated answers match references, handling complex checks like unit conversion, approximations, and equivalent forms (e.g., chemical names, equations).

(4) 科学：收集物理，化学，生物等多种数据，难度从初中到研究生。LLM 标注难度和质量，难题（如奥赛，大学水平）选进后训练。一个带 CoT 的 LLM 验证器检查生成答案和参考答案是否一致，能处理单位换算，近似，等价形式（如化学名称，方程式）这类复杂情况。

(5) **Language-Centric Tasks:** Focuses on language understanding, translation, and generation. Strict filtering and rewriting ensure data quality; model verification removes meaningless/ambiguous instructions. Generative reward models score responses via joint evaluation of paired responses, mitigating reward hacking. Expert rewriting and iterative refinement further optimize outputs.

(5) 语言类任务：关注语言理解，翻译和生成。严格过滤和改写保证数据质量，模型验证去掉无意义或有歧义的指令。生成式奖励模型对成对回答联合打分，减轻 reward hacking。专家改写和迭代打磨进一步优化输出。

(6) **Creative Writing:** Multi-dimensional labels (genre, style, etc.) ensure instruction set richness and diversity. A discriminant RM filters samples with low scores/high variance to retain valuable instructions. Expert rewriting and model self-refinement build high-quality responses.

(6) 创意写作：多维标签（体裁，风格等）保证指令集丰富多样。判别式 RM 过滤掉低分或高方差的样本，留下有价值的指令。专家改写和模型自我打磨构建高质量回答。

(7) **English and Multilingual:** Diverse instruction data are created through document augmentation, instruction evolution (Xu et al., 2024), and back-translation (Li et al., 2023b). A well-trained team of human experts will annotate high-quality responses.

(7) 英语与多语言：通过文档增广，指令进化（Xu et al., 2024）和回译（Li et al., 2023b）构造多样的指令数据。一支训练有素的人类专家团队标注高质量回答。

(8) **Complex Instruction:** For complex instructions, we vary constraint numbers/types for difficulty, with rule-based filters checking satisfaction. For long-context, questions require integrating multiple context segments. For agent, diverse scenarios are created by combining tool usage, decision types, and multi-turn dynamics.

(8) 复杂指令：对复杂指令，改变约束的数量和类型来调节难度，用规则过滤器检查是否满足。对长上下文，问题要求整合多个上下文片段。对 agent，组合工具使用，决策类型和多轮动态，构造多样的场景。

(9) **Role Play:** Diverse character profiles are created from typical personality traits. Conversational data is generated via prompt engineering, with responses assessed for instruction comprehension, trait representation, and emotional empathy.

(9) 角色扮演：从典型性格特征出发构造多样的角色设定。对话数据用提示工程生成，回答按指令理解，性格表现和情感共情评估。

(10) **Knowledge QA:** To reduce hallucinations, we optimize performance on knowledge-intensive tasks. For general knowledge, cross-validation and critic models filter errors and select best answers (Ke et al., 2024; Wang et al., 2024a).

(10) 知识问答：为了减少幻觉，我们优化知识密集型任务的表现。对通用知识，用交叉验证和 critic 模型过滤错误，挑出最佳答案（Ke et al., 2024; Wang et al., 2024a）。

(11) **Multi-turn:** Multi-turn dialogues are divided into 6 categories. For each, diverse data is constructed via open-source collection, procurement, synthesis, instruction evolution, and pseudomulti-turn synthesis.

(11) 多轮：多轮对话分成 6 类。每一类的数据通过开源收集，采购，合成，指令进化和伪多轮合成构造。

(12) **Finance/Legal/Medical:** Experts in legal, financial, and medical fields label data for high-quality training sets.

(12) 金融/法律/医疗：法律，金融，医疗领域的专家标注数据，形成高质量训练集。

(13) **Safety:** Nearly 1,000 safety categories measure diversity and coverage to address vulnerabilities. A classification model continuously identifies risky data. A red team conducts adversarial testing to uncover security flaws.

(13) 安全（Safety）：近 1,000 个类别。

Based on above topics, we create an SFT dataset of 3 million samples (reasoning and non-reasoning). Complex reasoning tasks requiring longer CoT undergo additional processing:

基于以上主题，我们构建了 300 万条样本的 SFT 数据集（含推理和非推理）。需要较长 CoT 的复杂推理任务还要额外处理：

(1) **Reasoning Data.** Math, coding, science and logic are categorized as reasoning data. While models like DeepSeek-R1 (Guo et al., 2025) and OpenAI-o1 (OpenAI, 2024b) improve on such tasks, they can overthink simple questions. We create adaptive long-short CoT responses using an internal teacher model (Section 3.2) to address this. Unlike prior work (DeepSeek-AI et al., 2025; Yang et al., 2025b) using system prompts, our reasoning data is uniformly structured as &lt;problem, response&gt;, with responses potentially including detailed reasoning. This allows the model to dynamically activate thinking mode based on problem difficulty.

(1) 推理数据。数学，代码，科学和逻辑归为推理数据。DeepSeek-R1 (Guo et al., 2025) 和 OpenAI-o1 (OpenAI, 2024b) 等模型在这类任务上有进步，但会对简单问题想得过多。我们用内部教师模型（3.2 节）构造自适应长短 CoT 回答来解决这个问题。之前的工作（DeepSeek-AI et al., 2025; Yang et al., 2025b）用系统提示切换模式，我们的推理数据则统一组织成 `<problem, response>` 的形式，response 里可能带详细推理。这样模型能按题目难度动态启用 thinking 模式。

(2) **Non-Reasoning Data.** For non-reasoning data, original responses from diverse topics are used directly in SFT.

(2) 非推理数据。非推理数据直接用各主题的原始回答做 SFT。

## 3.2 Adaptive Long-short Chain-of-Thought Fusion（自适应长短 CoT融合）

The short chain-of-thought mode excels at quick, heuristic decision-making and is suitable for solving simple problems. The long chain-of-thought mode relies on deep reasoning to make more accurate judgments and reduce biases, making it appropriate for complex problems. If an LLM operates solely in the short CoT mode, it struggles with complex and difficult problems. Conversely, if it operates only in the long CoT mode, many everyday problems requiring quick responses would consume excessive inference resources. We propose an adaptive long-short CoT fusion method that creatively integrates these two reasoning modes into a single model, allowing the LLM to autonomously decide whether to use long or short CoT and determine the depth of reasoning based on the complexity of the problem. Previous studies (Guo et al., 2025; OpenAI, 2024b) have revealed that long CoT is particularly effective in reasoning fields such as mathematics. Therefore, we apply adaptive long-short CoT fusion for reasoning data (e.g., mathematics, STEM), while primarily utilizing the short CoT mode for non-reasoning data. We

短 CoT模式擅长快速，启发式的决策，适合简单问题。长 CoT模式靠深度推理做出更准确的判断，减少偏差，适合复杂问题。如果 LLM 只用短 CoT，难题就吃力；如果只用长 CoT，许多需要快速回答的日常问题会耗掉过多推理资源。我们提出自适应长短 CoT 融合方法，把两种推理模式放进同一个模型，让 LLM 按问题复杂度自己决定用长 CoT 还是短 CoT，以及推理多深。已有研究（Guo et al., 2025; OpenAI, 2024b）表明长 CoT 在数学等推理领域特别有效。所以推理数据（如数学，STEM）用自适应长短 CoT 融合，非推理数据主要用短 CoT 模式。我们（句子接到下一页）

<!-- page 10 of 26 -->

trained an adaptive long-short CoT fusion teacher model to generate training data for the first SFT stage of Hunyuan-TurboS. The training of this teacher model includes two stages: supervised fine-tuning and reinforcement learning.

（接上页）训练了一个自适应长短 CoT 融合教师模型，为 Hunyuan-TurboS 的第一个 SFT 阶段生成训练数据。教师模型的训练分两个阶段：监督微调和强化学习。

## 3.2.1 Adaptive Long-Short CoT SFT Training（自适应长短 CoT 的 SFT 训练）

First, we train Hunyuan-Base to obtain a short CoT model using reasoning data. Then, we use this model to infer answers on all reasoning data and perform consistency checks. For one data sample, if the short CoT model gives a correct answer, it will be directly added as a training sample. If the short CoT model gets it wrong on the first attempt, we will feed the question and the short CoT's incorrect response into Hunyuan-T1 to continue generating the subsequent reasoning process and answer, and then convert this extended reasoning process and answer into the short CoT response style. We will repeatedly apply this Hunyuan-T1 generation process until a correct answer is obtained for the given question. Then, we will concatenate all failed attempts along with the correct response to serve as the training response for our adaptive long-short fusion teacher model.Finally, we use the adaptive short-long CoT data generated through the process described above to train Hunyuan-Base, thereby obtaining an adaptive SFT model.

首先，用推理数据训练 Hunyuan-Base，得到一个短 CoT 模型。然后用这个模型在全部推理数据上推断答案，做一致性检查。对一条数据，短 CoT 模型答对就直接加入训练样本。第一次答错，就把题目和短 CoT 的错误回答一起交给 Hunyuan-T1，让它接着生成后面的推理过程和答案，再把这段延伸出来的推理和答案改写成短 CoT 的回答风格。这个 Hunyuan-T1 生成过程反复进行，直到这道题得到正确答案。然后把所有失败尝试和正确回答拼起来，作为自适应长短融合教师模型的训练回答。最后，用上面这套流程生成的自适应长短 CoT 数据训练 Hunyuan-Base，得到自适应 SFT 模型。

## 3.2.2 Reinforcement Learning for Adaptive Long-Short CoT（自适应长短 CoT 的强化学习）

Our long-short adaptive reward framework enables LLMs to choose appropriate thinking modes based on problem difficulty:

我们的长短自适应奖励框架让 LLM 按问题难度选择合适的思考模式：

(1) **Difficulty-Adaptive Reward:** During GRPO sampling, we generate responses with varying depths of reasoning for each prompt. An online rejection sampling mechanism evaluates prompt difficulty and selects the appropriate mode - assigning long CoT to complex problems and short CoT to simpler ones.

(1) 难度自适应奖励：GRPO 采样时，每个 prompt 生成推理深度不同的多条回答。一个在线拒绝采样机制评估 prompt 难度，选出合适的模式：复杂问题配长 CoT，简单问题配短 CoT。

(2) **Long CoT Compression Reward:** For long reasoning chains, we apply a length penalty during the calculation of the reward. When multiple reasoning paths achieve equal correctness, shorter traces receive higher rewards, minimizing redundancy while maintaining accuracy.

(2) 长 CoT 压缩奖励：对长推理链，计算奖励时加长度惩罚。几条推理路径正确性相同时，更短的轨迹奖励更高，在保持准确的同时减少冗余。

The proposed reinforce framework generates significantly adaptive CoTs, achieving a balance between reasoning quality and computational efficiency.

这个强化框架生成的 CoT 自适应性明显，在推理质量和计算效率之间取得平衡。

## 3.3 Deliberation Learning（审议学习）

To enhance the capabilities of our Hunyuan-TurboS after its initial pre-training and foundational SFT, and inspired by Luo et al. (2024), we propose a new iterative refinement strategy of human-LLM collaboration grounded in the principles of Deliberation Learning. This approach leverages a data flywheel, where models progressively improve by competing with each other, with weakness profiles identified by powerful LLM-based judges and human experts to inform subsequent SFT iterations.

为了在初始预训练和基础 SFT 之后继续增强 Hunyuan-TurboS，受 Luo et al. (2024) 启发，我们按 Deliberation Learning 的原则提出一种人与 LLM 协作的迭代改进策略。这一方法用的是数据飞轮：模型之间相互竞争，逐步提升，由强大的 LLM 评审和人类专家找出弱点画像，指导后续的 SFT 迭代。

## 3.3.1 Training Powerful Judge LLMs to Simulate Human Annotators（训练强评审 LLM 模拟人类标注员）

To effectively simulate human annotators and mitigate individual LLM biases, we developed and trained a panel of Judge Models based on Hunyuan-TurboS. Instead of relying on a single holistic score, model responses were assessed across multiple predefined dimensions: accuracy, helpfulness, harmlessness, coherence, conciseness, and adherence to instructions. For each pairwise comparison, each judge provided scores along these dimensions, often supplementing them with textual rationales. A consensus mechanism, such as majority voting or a weighted scoring system, aggregated these multi-dimensional judgments. This multi-judge, multi-dimensional approach was designed to bolster the robustness of our evaluations and more closely align automated judgments with human preferences. Furthermore, the judging protocol underwent regular calibration against evaluations from human experts to ensure its continuous refinement.

为了有效模拟人类标注员，减轻单个 LLM 的偏差，我们基于 Hunyuan-TurboS 开发并训练了一组评审模型。模型回答不只得一个整体分，要在几个预设维度上分别评估：准确性，有用性，无害性，连贯性，简洁性，指令遵循。每次成对比较，每个评审在这些维度上打分，常常附带文字理由。共识机制（如多数投票或加权打分）汇总这些多维判断。多评审，多维度的设计是为了让评估更稳健，让自动判断更贴近人类偏好。评审协议还定期对照人类专家的评估做校准，持续改进。

## 3.3.2 Build a Data Flywheel to Post-train Hunyuan-TurboS（搭建数据飞轮后训练 Hunyuan-TurboS）

Our core innovation lies in an iterative improvement cycle that continuously enhances Hunyuan-TurboS' capabilities through competitive evaluation and targeted Supervised Fine-Tuning (SFT). This cyclical process encompasses three key phases:

我们的核心创新是一个迭代改进循环，通过竞争式评估和有针对性的监督微调（SFT）持续提升 Hunyuan-TurboS 的能力。这个循环包括三个关键阶段：

(1) **Judging:** We initialize a competitive environment with our Hunyuan-TurboS SFT model and our cutting-edge Hunyuan models, such as Hunyuan Large, Hunyuan Turbo, and Hunyuan T1. In each pair-wise comparison, all models generate responses to identical prompts from our curated training split. These responses are then meticulously assessed by our multi-LLM judge ensemble.

(1) 评审：用 Hunyuan-TurboS SFT 模型和前沿混元模型（如 Hunyuan Large, Hunyuan Turbo, Hunyuan T1）搭一个竞争环境。每次成对比较，所有模型对精选训练集里的同一批 prompt 生成回答，再由多 LLM 评审团仔细评估。

<!-- page 11 of 26 -->

(2) **Weakness Deliberation:** We identify model weaknesses using human expert and LLM oversight. While automated metrics offer initial indicators, domain experts review intricate comparison outcomes and nuanced model failures missed by automated systems. Experts compare Hunyuan-TurboS with competitors, using deep contextual understanding to find capability gaps across diverse domains, tasks, and challenging prompts. This expert analysis, often with collaborative adjudication, creates a detailed "weakness profile" informing data selection and augmentation.

(2) 弱点审议：借助人类专家和 LLM 监督找出模型弱点。自动指标给出初步信号，领域专家再审查复杂的比较结果，以及自动系统漏掉的细微失败。专家把 Hunyuan-TurboS 和对手比较，凭对上下文的深入理解，找出不同领域，任务和难题上的能力差距。这种专家分析常常经过多人协作裁定，形成一份详细的 「弱点画像」，用来指导数据选择和增广。

(3) **Iterative SFT:** Guided by this profile, we develop tailored training batches for identified deficiencies frequently incorporating "loss data". These training batches will be carefully annotated by human experts with high-quality outputs, which will be added incrementally to the training process. Our approach uses curriculum learning, progressively increasing task complexity and skill subtlety as the model shows mastery. After each SFT iteration, the updated model is re-evaluated, closing the loop and perpetuating the data flywheel. This cyclical refinement yields incremental enhancements for identified weaknesses. Our methodology aims to preserve strengths while addressing deficiencies, fostering robust and well-rounded performance.

(3) 迭代 SFT：按这份画像，为发现的短板定制训练批次，常常加入 「loss data」（比输了的样本）。这些批次由人类专家仔细标注高质量输出，逐步加入训练。方法采用课程学习，模型掌握一层就提高一层任务复杂度和技能精细度。每轮 SFT 后重新评估更新后的模型，闭合循环，让数据飞轮一直转下去。循环式打磨让已发现的弱点逐步改善。目标是在补短板的同时保住长处，得到稳健，全面的表现。

## 3.4 General Reward System（通用奖励系统）

To facilitate effective reinforcement learning, we design a general reward system organized around three key components: a Generative Reward Model with reference answers that covers most scenarios, an Answer Consistency Model for tasks such as mathematics where ground-truth answers exist, a code Sandbox that executes unit tests for programming problems. Finally, a Reward Aggregation module incorporates domain-specific rules to produce a unified score. Overall, the system spans 16 sub-topics and more than 30 scoring services, each of which relies on specialized models or rule-based heuristics tailored to its specific evaluation scenario.

为了让强化学习有效，我们设计了一套通用奖励系统，围绕三个关键组件：覆盖大多数场景的带参考答案的生成式奖励模型；用于数学等有标准答案任务的答案一致性模型；为编程题执行单元测试的代码沙箱。最后由奖励聚合模块结合领域规则给出统一分数。整个系统覆盖 16 个子主题和 30 多个打分服务，每个服务都依赖为具体评估场景定制的模型或规则启发式。

**Generative Reward Model with Reference Answer.** Following (Zhang et al., 2024; Mahan et al., 2024; Xu et al., 2025), we employ a generative reward model (GRM) that compares candidate answers against a reference answer. For tasks with a single deterministic solution, such as closed-book factual QA, the reference is the ground-truth answer. For open-ended tasks (e.g., creative writing or open-domain dialogue) we still provide a carefully curated reference; however, the GRM treats it only as a semantic anchor rather than expecting an exact match.

带参考答案的生成式奖励模型。参照（Zhang et al., 2024; Mahan et al., 2024; Xu et al., 2025），我们用生成式奖励模型（GRM）把候选答案和参考答案作比较。闭卷事实问答这类只有唯一确定解的任务，参考就是标准答案。开放任务（如创意写作或开放域对话）也提供精心准备的参考，但 GRM 只把它当语义锚点，不要求完全匹配。

We train the GRM using a pairwise preference scheme: given two candidate answers to the same prompt, it predicts which one is better. To construct the training corpus, we sample diverse responses from multiple Hunyuan-TurboS checkpoints, ensuring broad coverage. Human annotators then label these pairs, achieving inter-annotator agreement above 93%. In total, we collect about 200K high-confidence annotations. To mitigate the well-known position bias, we swap the left/right order of the candidates to augment the training data.

GRM 用成对偏好方案训练：给定同一 prompt 的两个候选答案，预测哪个更好。训练语料从多个 Hunyuan-TurboS 检查点采样多样的回答，保证覆盖广。人类标注员给这些答案对打标签，标注员之间一致率超过 93%。总共收集约 20 万条高置信标注。为缓解常见的位置偏差，把候选的左右顺序对调来增广训练数据。

The GRM can optionally ingest Chain-of-Thought (CoT) reasoning traces, yielding a variant we call GRM-CoT. Supplying rationales markedly improves judgment accuracy on multi-step reasoning tasks, albeit at increased computational cost. We also employ a critic model capable of invoking external tools for verification. The critic reports explicit length statistics and checks outputs against task-specific constraints. Leveraging the GRM-CoT approach together with carefully crafted prompts, the critic assesses answer correctness.

GRM 可以选择读入 CoT 推理轨迹，这个变体叫 GRM-CoT。提供推理依据能明显提高多步推理任务上的判断准确率，代价是计算量增加。我们还用一个能调用外部工具做验证的 critic 模型。critic 报告明确的长度统计，并按任务约束检查输出。结合 GRM-CoT 和精心设计的 prompt，critic 判定答案是否正确。

**Answer Consistency Model.** This lightweight classifier verifies if the generated final answer matches the reference, providing a binary reward (1 for a match, 0 otherwise). It is designed to normalize superficial differences, such as variations in whitespace, unit formats, or synonyms, to minimize false negatives. Due to its speed and robustness, this model serves as both a hard filter during data curation and a complementary reward signal during RL training.

答案一致性模型。这个轻量分类器检查生成的最终答案是否和参考一致，给出二值奖励（一致为 1，否则为 0）。它会把空白，单位格式，同义词这类表面差异规范化，尽量减少假阴性。因为快而稳，它既在数据整理时当硬过滤器，也在 RL 训练时当补充奖励信号。

**Sandbox.** We have built a multilingual code sandbox that supports 36 programming languages. These include, but are not limited to, Python, C, C++, Java, Go, JavaScript, C#, CoffeeScript, Common Lisp, Dart, Elixir, Emacs Lisp, Erlang, F#, Fortran, Groovy, Haskell, Julia, Kotlin, Lua, Pascal, Perl, PHP, PowerShell, Racket, R, Ruby, Rust, Scala, Scheme, Shell, Swift, Tcl, TypeScript, VimScript, and Visual Basic. The code sandbox is deployed on a distributed CPU cluster capable of handling over 1000 concurrent executions. Strict security measures such as file and network isolation are in place to prevent the execution of harmful code.

沙箱。我们搭建了支持 36 种编程语言的多语言代码沙箱，包括但不限于 Python, C, C++, Java, Go, JavaScript, C#, CoffeeScript, Common Lisp, Dart, Elixir, Emacs Lisp, Erlang, F#, Fortran, Groovy, Haskell, Julia, Kotlin, Lua, Pascal, Perl, PHP, PowerShell, Racket, R, Ruby, Rust, Scala, Scheme, Shell, Swift, Tcl, TypeScript, VimScript, Visual Basic。沙箱部署在分布式 CPU 集群上，能同时处理 1000 多个执行。沙箱带文件和网络隔离。

To address imbalances and insufficient diversity in the post-training data such as skewed distributions and a lack of challenging cases, we have developed a multi-level knowledge classification framework that covers over 400 categories and 13K tags. This system ensures diverse prompt generation through data distribution adjustments and incorporates a difficulty grading mechanism based on the number and complexity of instructions.

后训练数据有不平衡和多样性不足的问题，比如分布偏斜，缺少难例。为此我们开发了多级知识分类框架，覆盖 400 多个类别和 1.3 万个标签。这套体系通过调整数据分布让 prompt 生成保持多样，并按指令的数量和复杂度做难度分级。

<!-- page 12 of 26 -->

By leveraging high-quality open-source seed code fragments and pre-training data, we synthesize executable code complete with unit tests. Our approach considers boundary cases in inputs to yield verified outputs via sandbox execution. In total, over 800K executable, unit-tested data samples have been created, with mainstream programming languages (Python, C, C++, Java, Go, and JavaScript) contributing 100K samples each and long-tail languages contributing 10K samples each.

我们用高质量的开源种子代码片段和预训练数据，合成带单元测试的可执行代码。方法会考虑输入的边界情况，通过沙箱执行得到验证过的输出。总共生成 80 万条以上可执行，带单元测试的数据，其中主流语言（Python, C, C++, Java, Go, JavaScript）各 10 万条，长尾语言各 1 万条。

> **拆开：** 80 万条里，主流 6 种各 10 万，长尾各 1 万，算下来一共覆盖多少种语言？
> 6 × 10 万 = 60 万，剩下的 20 万按每种 1 万算，是 20 种长尾语言，合计 26 种。第 11 页说沙箱支持 36 种，名单也正好列了 36 个。80 万前面有 「over」，长尾可能多于 20 种，但本文没有给长尾语言的名单，26 和 36 之间差的 10 种有没有合成数据，本文没有说。

**Reward Aggregation.** A single prompt may trigger multiple scoring services. The outputs from these services are applied with domain-specific custom rules and then combined by scoring fusion. We aggregate complementary scores, for example, by merging reward scores with repetition penalties, or by combining scores from creative evaluation models with those from critic models. During RL training, directly using raw reward values can lead to instability in advantage estimation. We therefore introduce group-level normalization. For each prompt, rewards within a group of generated responses are rescaled such that poorly performing answers receive negative advantages and well-performing answers receive positive advantages. This ensures more stable policy updates during RL training.

奖励聚合。一个 prompt 可能触发多个打分服务。这些服务的输出先套用领域定制规则，再通过分数融合合并。互补的分数会被合在一起，例如把奖励分和重复惩罚合并，或者把创意评估模型的分数和 critic 模型的分数合并。RL 训练里直接用原始奖励值，优势估计会不稳定，所以我们引入组级归一化。对每个 prompt，一组生成回答内部的奖励被重新标定，让表现差的回答得到负优势，表现好的回答得到正优势。这让 RL 训练中的策略更新更稳定。

## 3.5 RL Training（RL 训练）

To align and optimize our language models for diverse, domain-specific requirements, we adopt an incremental, domain-focused reinforcement learning (RL) pipeline based on the Generative Reward Preference Optimization (GRPO) framework (Shao et al., 2024). Our GRPO training involves a two-stage strategy, detailed below, alongside key implementation choices.

为了让语言模型对齐并满足各领域的具体需求，我们采用渐进式，按领域推进的强化学习（RL）流水线，基于 Generative Reward Preference Optimization (GRPO) 框架（Shao et al., 2024）。GRPO 训练分两个阶段，下面给出细节和关键的实现选择。

> **问：** 这里把 GRPO 展开成 Generative Reward Preference Optimization，引用的是 Shao et al.，2024，名字和出处对得上吗？
> 对不上。第 24 页参考文献里 Shao et al.，2024 是 DeepSeekMath，那篇里的 GRPO 是 Group Relative Policy Optimization。本文的做法也是组内比较：第 12 页 「Reward Aggregation」 在每个 prompt 的一组回答内部归一化，第 13 页 「Group Reward Adjustment」 同样按组重新标定奖励。全文只有这一处展开了缩写，写成 Generative Reward Preference Optimization。

## 3.5.1 Two-Stage GRPO Training Strategy（两阶段 GRPO 训练策略）

Our GRPO training incrementally integrates knowledge and optimization objectives from multiple domains. For each domain, we curate specific datasets and define training recipes. The reward signals for these domains are derived from our General Reward System, and the resulting optimization tasks are merged into the main GRPO curriculum.

GRPO 训练逐步整合多个领域的知识和优化目标。每个领域有专门的数据集和训练配方。这些领域的奖励信号来自通用奖励系统，得到的优化任务并入 GRPO 主课程。

In Stage I, we enhance reasoning abilities (e.g., in domains such as Logic, Coding, Mathematics, and Science). In Stage II, we boost general performance (e.g., in domains such as Text Understanding, Translation, Long Context processing, and Creative Writing). We present the details of the two-stage GRPO with corresponding topic domains.

第一阶段增强推理能力（如逻辑，代码，数学，科学等领域）。第二阶段提升通用表现（如文本理解，翻译，长上下文处理，创意写作等领域）。下面按对应的主题领域介绍两阶段 GRPO 的细节。

**Stage I: Reasoning GRPO.** This stage targets Logic, Coding, Mathematics, and Science domains. 300K training data are mixed with a ratio of Code : Mathematics : Logic&Science = 2 : 2 : 1. Given that the Supervised Fine-Tuned (SFT) backbone model already demonstrates strong performance on these tasks and exhibits low output entropy, we apply a relatively small Kullback-Leibler (KL) divergence constraint to encourage broader exploration during this stage.

第一阶段：推理 GRPO。这一阶段面向逻辑，代码，数学和科学。30 万条训练数据按 代码：数学：逻辑与科学 = 2 : 2 : 1 混合。SFT 后的主干模型在这些任务上已经不错，输出熵也低，所以这一阶段用较小的 KL 散度约束，鼓励更广的探索。

Each of the following reasoning domains is backed by its own reward service, dedicated preference data and evaluation rules, as well as domain-specific prompt construction.

下面每个推理领域都有自己的奖励服务，专门的偏好数据和评估规则，以及领域专用的 prompt 构造。

(1) **Logic.** Prompts exhibiting instability, identified through high variance in accuracy across multiple generated samples, are targeted. A curated set of short-answer, validated items is used to strengthen the model's logical robustness.

(1) 逻辑。针对不稳定的 prompt，即多次采样的准确率方差高的题。用一批精选，验证过的短答案题增强模型在逻辑上的稳健性。

(2) **Coding.** Challenging programming prompts are selected and paired with automated evaluation systems. Rejection sampling and difficulty-aware filtering techniques are employed to curate high-quality data for RL.

(2) 代码。选出有挑战的编程 prompt，配上自动评测系统。用拒绝采样和难度感知过滤整理 RL 用的高质量数据。

(3) **Mathematics.** We collect challenging mathematical problems, excluding proof-based questions, multiple-choice, and true/false formats. Edge cases are converted into more tractable forms. Model-based rejection sampling is used to refine this corpus.

(3) 数学。收集有挑战的数学题，排除证明题，选择题和判断题。边界情况改写成更好处理的形式。用基于模型的拒绝采样打磨这批语料。

(4) **Science.** A generative verifier is trained to assess the consistency of answers against reference solutions. This model is capable of handling multi-step reasoning, unit conversions, approximations, formula equivalence, and chemical notations, thereby generating reward signals used for both rejection sampling and RL.

(4) 科学。训练一个生成式验证器，判断答案和参考解是否一致。它能处理多步推理，单位换算，近似，公式等价和化学记号，产出的奖励信号同时用于拒绝采样和 RL。

**Stage II: General GRPO.** In this stage, optimization is extended to general tasks, with a focus on balancing performance across various domains. We continue to include 10% reasoning data from Stage I in the training mix. Hyperparameters from Stage I (e.g., clipping range, learning rate) are largely retained, but the KL divergence penalty coefficient is increased to mitigate issues like catastrophic forgetting or performance collapse during training on 160k general RL instructions.

第二阶段：通用 GRPO。这一阶段把优化扩展到通用任务，重点是平衡各领域的表现。训练数据里继续保留 10% 第一阶段的推理数据。第一阶段的超参数（如 clip 范围，学习率）大体沿用，但调高 KL 散度惩罚系数，缓解在 16 万条通用 RL 指令上训练时的灾难性遗忘或性能崩溃。

To ensure balanced general capabilities, every subsequent track is supported by a dedicated reward service, corresponding preference datasets and rules, and specially designed data construction pipelines.

为了让通用能力均衡，下面每条赛道都有专门的奖励服务，对应的偏好数据集和规则，以及专门设计的数据构造流水线。

<!-- page 13 of 26 -->

(1) **Text Understanding.** Two reward models are utilized: a consistency model for objective Q&A and a comparative GRM for subjective or open-ended tasks.

(1) 文本理解。用两个奖励模型：客观问答用一致性模型，主观或开放任务用比较式 GRM。

(2) **Translation.** Domain experts annotate parallel corpora; GRMs trained on these annotations provide faithful reward signals.

(2) 翻译。领域专家标注平行语料，在这些标注上训练的 GRM 提供可靠的奖励信号。

(3) **Long Context.** For long-context tasks, an additional hallucination-focused critic model and online RL further enhance stability.

(3) 长上下文。长上下文任务额外用一个专盯幻觉的 critic 模型和在线 RL 提高稳定性。

(4) **Creative Writing.** For creative writing, paired GRMs based on relative preference judgments are used to mitigate reward hacking. During RL, creative rewards are blended with automated checks for instruction adherence, balancing creativity, fluency, and compliance.

(4) 创意写作。用基于相对偏好判断的成对 GRM 缓解 reward hacking. RL 中把创意奖励和指令遵循的自动检查结合起来，平衡创意，流畅和合规。

(5) **Agents.** Action-level rule-based rewards and extensive step-wise data markedly improve multi-step reasoning capabilities.

(5) Agents。动作级的规则奖励和大量逐步数据明显提升多步推理能力。

(6) **Multi-Turn Dialogue.** We refine dialogue-specific critic models and general rewards, mining unstable conversations.

(6) 多轮对话。改进对话专用的 critic 模型和通用奖励，挖出不稳定的对话。

(7) **Complex Instructions.** We utilize constraint-extraction and satisfaction tools, complemented by general critic and reward models.

(7) 复杂指令。用约束抽取和满足度检查工具，辅以通用 critic 和奖励模型。

(8) **Role-Playing.** We evaluate instruction comprehension, character consistency, and empathy, then generate corresponding data using generalized critic and reward models.

(8) 角色扮演。评估指令理解，角色一致性和共情，再用通用 critic 和奖励模型生成相应数据。

(9) **Safety.** For safety alignment, safe response pairs are identified using classifiers and refusal heuristics, then incorporated into preference datasets.

(9) 安全（Safety）。

(10) **Knowledge QA.** For knowledge question-answering, rewards from hallucination detection models (both with and without access to references) and user-experience-focused models are jointly optimized to reduce hallucination risk.

(10) 知识问答。联合优化两类奖励来降低幻觉风险：幻觉检测模型（有参考和无参考两种）的奖励，以及注重用户体验的模型的奖励。

(11) **Multilingual.** For multilingual capabilities, SFT answers are sampled and scored using GRMs. A prompt is kept if it has high diversity, high answer variance and high quality.

(11) 多语言。采样 SFT 回答，用 GRM 打分。多样性高，答案方差高且质量高的 prompt 才保留。

(12) **Finance, Legal, and Medical Domains.** For specialized domains like Finance, Legal, and Medical, consistency-based rewards identify unstable items from professional exams, which then supply preference data for targeted domain-specific improvements.

(12) 金融，法律和医疗领域。在这些专业领域，基于一致性的奖励从专业考试里找出不稳定的题，再为有针对性的领域改进提供偏好数据。

## 3.5.2 More Details on GRPO Implementation（GRPO 实现的更多细节）

Practical experience indicates that several engineering choices are decisive for achieving GRPO training that is both stable and sample-efficient. Following (Liu et al., 2024; Yu et al.), we mention some additional details applied, unless otherwise noted, across all domains and training stages.

实践经验表明，有几项工程选择决定了 GRPO 训练能不能既稳定又省样本。参照（Liu et al., 2024; Yu et al.），下面补充几项细节，除非另有说明，它们适用于所有领域和训练阶段。

**GRPO Loss.** We reformulate the GRPO loss at the token level, which markedly improves KL-stability during training. An approximate K3 KL loss term is clipped to the range [0, 10] to prevent issues arising from extreme log-probability spikes and potential divergence or model collapse. Best-of-N (BON) loss is applied selectively only to samples exhibiting positive advantage. This strategy helps preserve policy entropy, prevent premature convergence, and encourage continued exploration.

GRPO 损失。我们在 token 级重新表述 GRPO 损失，训练中的 KL 稳定性明显改善。近似的 K3 KL 损失项被裁剪到 [0, 10]，防止极端的 log-probability 尖峰带来发散或模型崩溃。Best-of-N (BON) 损失只用在优势为正的样本上。这样能保住策略熵，防止过早收敛，鼓励继续探索。

**Prompt Filtering.** We filter prompts by excluding extreme cases where the model consistently succeeds or fails. Conversely, we retain unstable prompts, for which the model's sampled outputs show substantial disagreement, as these provide ideal adversarial examples for RL.

Prompt 过滤。排除模型总是答对或总是答错的极端 prompt。保留不稳定的 prompt，即模型多次采样的输出分歧大的题，它们是 RL 理想的对抗样本。

**Sampling.** The sampling temperature for generating responses during RL is set to 1.0. Experiments with lower temperatures indicated that they led to rapid entropy decay, which hindered exploration and ultimately capped performance improvements. As model capabilities evolve during training, prompts that were once difficult may become trivial. Inspired by (Yu et al.), we implement a dynamic sampling strategy. Samples yielding zero advantage are dropped during batch formation, which helps accelerate convergence and improve overall training stability.

采样。RL 中生成回答的采样温度设为 1.0。实验发现更低的温度会让熵迅速衰减，妨碍探索，最后压住性能提升。训练中模型能力在变，曾经难的 prompt 可能变得简单。受（Yu et al.）启发，我们实现了动态采样：组 batch 时丢掉优势为零的样本，这样收敛更快，整体训练也更稳。

**Group Reward Adjustment.** Standard relative normalization can sometimes assign unintended positive advantages to poor-quality answers. Our group reward adjustment scheme addresses this by rescaling rewards within each prompt's response group, ensuring that undesirable responses receive negative advantages and desirable ones receive positive advantages, thereby promoting stable policy updates.

组奖励调整。标准的相对归一化有时会给差答案意外地分到正优势。我们的组奖励调整在每个 prompt 的回答组内重新标定奖励，保证不理想的回答得到负优势，理想的回答得到正优势，让策略更新更稳定。

## 4 Hunyuan-TurboS Evaluation（Hunyuan-TurboS 评测）

## 4.1 LMSYS Chatbot Arena（LMSYS Chatbot Arena 榜单）

In this section, we report the performance of our model Hunyuan-TurboS-20250416 on LMSYS Chatbot Arena (Chiang et al., 2024). LMSYS Chatbot Arena uses blind side-by-side evaluations by human raters

本节报告我们的模型 Hunyuan-TurboS-20250416 在 LMSYS Chatbot Arena (Chiang et al., 2024) 上的表现。LMSYS Chatbot Arena 由人类评分者做盲测并排评估（句子接到下一页）

<!-- page 14 of 26 -->

with less biases and more objective evaluation of the chatbots' capabilities. We report the overall rank in Table 3 and Appendix A, and the detailed results are as following:

（接上页）偏差更小，对聊天机器人能力的评估更客观。总排名见表 3 和附录 A，详细结果如下：

(1) Hunyuan-TurboS-20250416 obtains an overall score of 1356, is among the **top 7** best models in total 239 models, and outperforming leading reasoning models like o4-mini-2025-04-16.

(1) Hunyuan-TurboS-20250416 总分 1356，在全部 239 个模型里位列 **前 7**，高于 o4-mini-2025-04-16 等领先的推理模型。

(2) Hunyuan-TurboS-20250416 achieves **top 1** in **Chinese**, **French**, **Spanish**, and **top 2** in **Korean** languages. This shows the comprehensiveness and advancement of our model in terms of multilingualism and internationalization.

(2) Hunyuan-TurboS-20250416 在 **中文**，**法语**，**西班牙语** 上排 **第 1**，**韩语** 排 **第 2**。作者据此说模型在多语言和国际化上全面而领先。

(3) Hunyuan-TurboS-20250416 achieves **top 5** in various main Arena tasks, such as **Hard Prompts**, **Creative Writing**, **Multi-Turn**, and **Longer Queries**.

(3) Hunyuan-TurboS-20250416 在 **Hard Prompts**，**Creative Writing**，**Multi-Turn**，**Longer Queries** 等主要 Arena 任务上进入 **前 5**。

| Rank | Model | Arena Score | 95% CI | Votes | Organization |
| --- | --- | --- | --- | --- | --- |
| 1 | Gemini-2.5-Pro-Preview-05-06 | 1446 | +8/-7 | 5696 | Google |
| 2 | o3-2025-04-16 | 1409 | +5/-8 | 7621 | OpenAI |
| 2 | ChatGPT-4o-latest (2025-03-26) | 1405 | +6/-6 | 10284 | OpenAI |
| 2 | Grok-3-Preview-02-24 | 1399 | +4/-5 | 14845 | xAI |
| 4 | GPT-4.5-Preview | 1395 | +3/-5 | 15275 | OpenAI |
| 4 | Gemini-2.5-Flash-Preview-04-17 | 1389 | +8/-6 | 6622 | Google |
| 7 | DeepSeek-V3-0324 | 1369 | +5/-6 | 9404 | DeepSeek |
| 7 | GPT-4.1-2025-04-14 | 1365 | +7/-7 | 5778 | OpenAI |
| 7 | Hunyuan-TurboS-20250416 | 1356 | +7/-7 | 4863 | Tencent |
| 8 | DeepSeek-R1 | 1355 | +3/-4 | 19066 | DeepSeek |
| 9 | Gemini-2.0-Flash-001 | 1352 | +5/-4 | 24922 | Google |
| 9 | o4-mini-2025-04-16 | 1345 | +7/-9 | 5763 | OpenAI |
| 10 | o1-2024-12-17 | 1347 | +3/-3 | 29038 | OpenAI |
| 11 | Mistral Medium 3 | 1339 | +10/-12 | 2838 | Mistral |
| 12 | Qwen3-235B-A22B | 1339 | +9/-8 | 4457 | Alibaba |
| 13 | Gemma-3-27B-it | 1338 | +5/-5 | 12721 | Google |
| 13 | Qwen2.5-Max | 1338 | +3/-4 | 23176 | Alibaba |
| 14 | o1-preview | 1332 | +3/-3 | 33173 | OpenAI |
| 16 | Qwen3-32B | 1325 | +8/-6 | 3662 | Alibaba |
| 18 | GPT-4.1-mini-2025-04-14 | 1320 | +7/-8 | 5616 | OpenAI |
| 18 | Gemma-3-12B-it | 1318 | +9/-9 | 3593 | Google |
| 19 | o3-mini-high | 1321 | +4/-5 | 19405 | OpenAI |
| 19 | DeepSeek-V3 | 1315 | +4/-3 | 22834 | DeepSeek |
| 21 | QwQ-32B | 1310 | +5/-4 | 9941 | Alibaba |
| 21 | Gemini-2.0-Flash-Lite | 1310 | +3/-4 | 25654 | Google |
| 21 | GLM-4-Plus-0111 | 1308 | +8/-5 | 6025 | Zhipu |
| 21 | Qwen-Plus-0125 | 1307 | +7/-7 | 6058 | Alibaba |

表：列为排名，模型，Arena 分数，95% 置信区间，票数，机构，共 27 行。第 1 是 Gemini-2.5-Pro-Preview-05-06 (1446). Hunyuan-TurboS-20250416 排名 7，分数 1356，区间 +7/-7，票数 4863，同为排名 7 的还有 DeepSeek-V3-0324 (1369) 和 GPT-4.1-2025-04-14 (1365)。紧随其后的是 DeepSeek-R1（排名 8, 1355），Gemini-2.0-Flash-001（排名 9, 1352），o4-mini-2025-04-16（排名 9, 1345），o1-2024-12-17（排名 10, 1347）。表末是 Qwen-Plus-0125（排名 21, 1307）。

Table 3: Leaderboard of LMSYS Chatbot Arena by May 18, 2025. More details are in Appendix A.

表 3：截至 2025 年 5 月 18 日的 LMSYS Chatbot Arena 排行榜，更多细节见附录 A。

> **看表：** 「top 7」 的 7 在表 3 第几行？o4-mini 1345 排第 9，o1 1347 反而排第 10，排名是按什么排的？
> TurboS 在表 3 第 9 行。前 8 行里有一个第 1，三个并列第 2，两个并列第 4，两个并列第 7，所以排名一列不是数行数。第 26 页附录表把这一列标成 「Rank*(UB)」，本文没有解释 UB 怎么算，只能看到排名不随分数单调：o4-mini 区间是 +7/-9，比 o1 的 +3/-3 宽，分数低却排得更前。附录还有一列 Rank (StyleCtrl)，TurboS-20250416 在那一列是 13。正文和 Abstract 引用的 「top 7」 只来自前一列。

## 4.2 Auto Evaluation Results（自动评测结果）

## 4.2.1 Evaluation Benchmarks（评测基准）

In Table 4, we show the performance of our model in key benchmarks, compared against several industryleading models including open-source and closed-source. For closed-source models, evaluations are performed through their respective APIs. We conduct comprehensive evaluations of our model and focus on performance in knowledge, reasoning, mathematics, coding, Alignment Task, and instruction following. Hunyuan-TurboS achieves state-of-the-art performance on these dimensions and is comparable to leading models in the industry.

表 4 给出我们的模型在关键基准上的表现，并和几个业界领先的开源，闭源模型比较。闭源模型通过各自的 API 评测。评测覆盖面广，重点是知识，推理，数学，代码，对齐任务和指令遵循。Hunyuan-TurboS 在这些维度上达到最先进水平，和业界领先模型相当。

• **Mathematics**: For mathematics skill, we utilize math benchmarks including MATH(5-shot), GSM8k(4-shot), and high-level competitions including AIME(2024, 2025), and OlympiadBench.

• 数学：数学能力用 MATH (5-shot), GSM8k (4-shot) 等数学基准，以及 AIME (2024, 2025) 和 OlympiadBench 等高水平竞赛。

> **对一下：** 第 6 页预训练评测写 MATH 用 4-shot，这里写 MATH (5-shot)，两处是同一套设置吗？
> 不是。第 6 页 2.5.1 节的 4-shot 评的是基座模型，第 7 页表 2 里 TurboS 的 MATH 是 81.4。这里评的是后训练的 Hunyuan-TurboS-20250416，第 15 页表 4 里 MATH 是 90.0。评的模型不同，shot 数也不同，本文没有说为什么改。GSM8k 两处都写 4-shot，分数 94.39 和 94.4 几乎一样。所以 MATH 从 81.4 到 90.0，里面混着模型不同和 shot 不同两个因素，不能全算到后训练头上。

• **Reasoning**: For logical reasoning skills, we employ high-level benchmarks including BBH(3-shot), DROP(3-shot), and ZebraLogic.

• 推理：逻辑推理用 BBH (3-shot), DROP (3-shot) 和 ZebraLogic 等高水平基准。

• **Coding**: To test the model's ability in coding tasks, we use livecodeBench (2408-2411) and HumanEval.

• 代码：代码能力用 livecodeBench (2408-2411) 和 HumanEval。

<!-- page 15 of 26 -->

|  |  | GPT4.5 | Claude3.7Sonnet | DeepSeekV30324 | DeepseekV3 | Qwen2.5max | Doubao1.5Pro-32k | Hunyuan-TurboS-20250416 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Math | GSM8kMATHAIME2024AIME2025OlympiadBench | 91.986.236.730.067.6 | 86.656.823.310.054.6 | 93.389.159.450.079.5 | 91.683.239.216.755.9 | 92.378.927.626.753.4 | 95.688.633.320.059.8 | 94.490.056.740.076.1 |
| Reasoning | BBH DROP Zebra-logic | 76.383.353.7 | 84.685.947.4 | 90.991.584.7 | 90.491.640.6 | 89.688.227.7 | 91.693.036.0 | 90.889.881.7 |
| Code | HumanEval | 93.0 | 95.0 | 95.0 | 90.0 | 93.0 | 91.0 | 89.0 |
| Tasks | LiveCodeBench | 43.4 | 44.1 | 49.2 | 37.6 | 38.7 | 28.9 | 43.0 |
| Knowledge | MMLU MMLU-pro | 87.681.0 | 85.257.0 | 86.781.2 | 88.575.9 | 86.476.1 | 88.680.1 | 85.878.0 |
| Tasks | GPQA-diamond Chinese-SimpleQA | 68.272.5 | 68.059.0 | 68.473.6 | 59.164.8 | 60.169.0 | 61.563.6 | 62.169.6 |
| Chinese | C-Eval | 78.4 | 55.4 | 88.2 | 86.5 | 89.4 | 91.8 | 88.1 |
| Tasks | CMMLU | 82.7 | 77.9 | 88.6 | 85.5 | 90.2 | 90.9 | 89.4 |
| Alignment | LiveBench Arena-Hard AlignmentBench MTBench AlpacaEval | 70.092.18.89.264.2 | 62.091.58.49.257.4 | 70.094.68.79.182.9 | 61.086.28.49.064.9 | 62.291.48.49.056.2 | 60.381.28.58.839.5 | 67.091.98.89.376.0 |
| Instruction | IF-Eval | 88.9 | 90.8 | 82.6 | 84.5 | 85.8 | 89.5 | 87.6 |
| Following | SysBench AVG. | 82.975.0 | 80.469.4 | 82.780.2 | 79.271.8 | 80.671.6 | 67.670.7 | 81.877.9 |

表：MinerU 把同一格里的几个分数粘在了一起，按行拆开后，Hunyuan-TurboS-20250416 一列是：GSM8k 94.4, MATH 90.0, AIME2024 56.7, AIME2025 40.0, OlympiadBench 76.1; BBH 90.8, DROP 89.8, Zebra-logic 81.7; HumanEval 89.0, LiveCodeBench 43.0; MMLU 85.8, MMLU-pro 78.0, GPQA-diamond 62.1, Chinese-SimpleQA 69.6; C-Eval 88.1, CMMLU 89.4; LiveBench 67.0, Arena-Hard 91.9, AlignmentBench 8.8, MTBench 9.3, AlpacaEval 76.0; IF-Eval 87.6, SysBench 81.8; AVG. 77.9。其他列的 AVG。依次是 GPT4.5 75.0, Claude3.7Sonnet 69.4, DeepSeekV30324 80.2, DeepseekV3 71.8, Qwen2.5max 71.6, Doubao1.5Pro-32k 70.7。表注说的加粗和下划线，md 里没有保留。

Table 4: Comparison among Hunyuan-TurboS-20250416 and other AI models. The highest and secondbest scores are shown in bold and underlined, respectively.

表 4: Hunyuan-TurboS-20250416 和其他 AI 模型的对比。最高分和次高分分别用加粗和下划线标出。

• **Knowledge & Chinese Tasks**: We utilize benchmarks including MMLU(5-shot), MMLU-Pro(5- shot), GPQA-Diamond, C-Eval(5-shot), Chinese SimpleQA, and CMMLU(5-shot).

• 知识与中文任务：用 MMLU (5-shot), MMLU-Pro (5-shot), GPQA-Diamond, C-Eval (5-shot), Chinese SimpleQA, CMMLU (5-shot) 等基准。

• **Alignment Tasks**: To assess alignment with human preferences on general topics, we utilize AlignBench v1.1, MTBench, Arena-Hard, and AlpacaEval. The full score of both AlimentBench and MTBench is 10 points. When calculating the average scores for alignment tasks, we converted the scores to a 100-point scale through linear mapping.

• 对齐任务：评估通用话题上和人类偏好的对齐程度，用 AlignBench v1.1, MTBench, Arena-Hard, AlpacaEval. AlimentBench 和 MTBench 满分都是 10 分。算对齐任务的平均分时，把分数线性映射到 100 分制。（AlimentBench 是 AlignmentBench 的拼写错误。）

> **核对：** AVG。这一格的 77.9，是表 4 这 23 个基准的平均吗？
> 个数对得上，数值对不上。表 4 七组依次是 5, 3, 2, 4, 2, 5, 2 个基准，合计 23。按上面这条说明把 AlignmentBench 和 MTBench 乘 10，再对 TurboS 一列 23 格直接平均，得到约 78.69，不是 77.9。同样算法在其他列也有偏差：GPT4.5 算得 74.37，表上 75.0；Claude3.7Sonnet 算得 67.34，表上 69.4；DeepSeekV30324 算得 80.87，表上 80.2；只有 Doubao 算得 70.67，和表上 70.7 对得上。本文没有写 AVG。用什么权重，也没写是否先按组平均，这一格在本文里复原不出来。

• **Instruction following**: For instruction-following performance, we report accuracy of IFEval and score of SysBench, a benchmark that systematically analyzes system message following ability.

• 指令遵循：报告 IFEval 的准确率和 SysBench 的分数，SysBench 是系统分析 system message 遵循能力的基准。

## 4.2.2 Benchmark Results（基准结果）

The Hunyuan-TurboS model demonstrates significant performance improvements through innovative methodologies including hybrid long-short chain-of-thought integration and multi-phase reinforcement learning. Our comprehensive evaluation reveals the following key findings:

Hunyuan-TurboS 通过长短 CoT混合集成和多阶段强化学习等方法取得明显提升。评测的主要发现如下：

**Mathematical Reasoning** Hunyuan-TurboS achieves state-of-the-art performance among no-reasoning models, ranking second only to DeepSeek-v3-0324. The performance gap manifests primarily in AIME2024 and AIME2025 benchmarks (1-3 sample difference), while showing substantial advantages over other no-reasoning models across multiple datasets including GSM8k (hunyuan 94.4% vs gpt4.5 91.9%), MATH (hunyuan 90% vs gpt4.5 86.2%), and OlympiadBench (hunyuan 76.1% vs gpt4.5 67.6%).

数学推理。Hunyuan-TurboS 在非推理模型里达到最先进水平，仅次于 DeepSeek-v3-0324。差距主要在 AIME2024 和 AIME2025（差 1 到 3 道题），在 GSM8k（混元 94.4% 对 gpt4.5 91.9%），MATH（混元 90% 对 gpt4.5 86.2%），OlympiadBench（混元 76.1% 对 gpt4.5 67.6%）等多个数据集上明显领先其他非推理模型。

**Logical Reasoning** On complex benchmark suites (BBH, DROP, Zebra-Logic), Hunyuan-TurboS and DeepSeek-V3-0324 establish new performance plateaus, demonstrating substantial advantages over conventional no-reasoning models.

逻辑推理。在复杂基准组（BBH, DROP, Zebra-Logic）上，Hunyuan-TurboS 和 DeepSeek-V3-0324 达到新的水平，明显领先常规非推理模型。

**Coding** Code generation capabilities are competitive with Qwen2.5-Max, showing equivalent performance to industry-leading models. The model shows significant advantages over Doubao1.5-Pro-32k (+6.0) and DeepSeek V3(+2.2) in programming tasks.

代码。代码生成能力和 Qwen2.5-Max 相当，和业界领先模型持平。编程任务上明显领先 Doubao1.5-Pro-32k (+6.0) 和 DeepSeek V3 (+2.2).

**Knowledge & Chinese Tasks** In terms of knowledge retention and factual accuracy, Hunyuan-TurboS achieves state-of-the-art (SOTA) performance comparable to leading foundation models. Benchmark evaluations reveal its robust capabilities in knowledge-intensive tasks, with particularly strong performance on Chinese-oriented knowledge assessments including C-Eval, CMMLU, and C-SimpleQA.

知识与中文任务。在知识保持和事实准确性上，Hunyuan-TurboS 达到最先进（SOTA）水平，和领先的基础模型相当。基准结果显示它在知识密集型任务上能力扎实，在 C-Eval，CMMLU，C-SimpleQA 等中文知识评测上尤其强。

**Alignment Tasks** Our evaluation demonstrates that Hunyuan-TurboS achieves significant performance improvements in alignment tasks, surpassing GPT-4.5 across multiple benchmarks. Specifically, Hunyuan-TurboS attains an average score 11.8 points higher than GPT-4.5 on AlpacaEval, while achieving state-of-

对齐任务。评测显示 Hunyuan-TurboS 在对齐任务上提升明显，多个基准超过 GPT-4.5。具体来说，Hunyuan-TurboS 在 AlpacaEval 上平均比 GPT-4.5 高 11.8 分，同时在（句子接到下一页）

<!-- page 16 of 26 -->

| Models | Average Output Tokens |
| --- | --- |
| DeepseekR1 | 2283.5 |
| Qwen3-235B-A22B | 2979.2 |
| Hunyuan-TurboS | 1207.8 |

表：平均输出 token 数：DeepseekR1 2283.5, Qwen3-235B-A22B 2979.2, Hunyuan-TurboS 1207.8。

Table 5: The Results of token output from various API responses to STEM and general tasks. Hunyuan-TurboS achieves more cost-efficient output generation.

表 5：各模型 API 在 STEM 和通用任务上的输出 token 数。Hunyuan-TurboS 的输出生成更省成本。

the-art results with first-place rankings in both AlignmentBench and MTBench evaluations.

（接上页）AlignmentBench 和 MTBench 上都排第一，达到最先进水平。

**Instruction Following** The model achieves state-of-the-art alignment performance, outperforming DeepSeek-V3-0324 by 5.0 points on IF-Eval. Its performance profile parallels Claude3.7 and GPT-4.5, with particularly strong results in multi-turn dialogue and constraint-based task execution.

指令遵循。模型的对齐表现达到最先进水平，IF-Eval 比 DeepSeek-V3-0324 高 5.0 分。表现和 Claude3.7，GPT-4.5 相近，在多轮对话和带约束的任务执行上尤其强。

## 4.2.3 Inference efficiency of Adaptive CoT.（自适应 CoT 的推理效率）

Efficient Inference is paramount for the practical application of LLMs, particularly in interactive scenarios that demand rapid responses and cost-effective operation. To assess the serving efficiency of Hunyuan-TurboS in comparison to other leading reasoning models, we conducted inference cost evaluations across a diverse set of tasks. The 6k evaluation dataset comprised 30% STEM data and 70% general domain data. To ensure statistical robustness and mitigate measurement bias, each inference request was executed five times, and the average values were subsequently reported for analysis.

高效推理对 LLM 的实际应用极其重要，在需要快速响应，运行成本低的交互场景里更是这样。为了评估 Hunyuan-TurboS 相对其他领先推理模型的服务效率，我们在多样的任务上做了推理成本评测。这套 6k 条的评测集由 30% STEM 数据和 70% 通用领域数据组成。为了统计稳健，减少测量偏差，每个推理请求执行五次，报告平均值。

As detailed in Table 5 and Table 3, the results demonstrate that Hunyuan-TurboS achieves the most cost-efficient output generation among all evaluated models. Notably, our model delivers performance comparable to that of Deepseek-R1 in the LMSYS Chatbot Arena while utilizing only 52.8% of the tokens, highlighting significant improvements in token efficiency which directly translate to reduced generation costs. Furthermore, Hunyuan-TurboS requires merely 40.5% of Qwen3-235B-A22B's generation cost. These findings demonstrate the effectiveness of our proposed Adaptive Long-short Chain-of-Thought Fusion approach, also underscore Hunyuan-TurboS's strong capabilities in providing high-performance LLM inference with superior cost-effectiveness.

如表 5 和表 3 所示，Hunyuan-TurboS 在所有被评模型里输出生成最省成本。我们的模型在 LMSYS Chatbot Arena 上和 Deepseek-R1 表现相当，只用了 52.8% 的 token，token 效率明显提高，生成成本直接下降。此外，Hunyuan-TurboS 的生成成本只有 Qwen3-235B-A22B 的 40.5%。作者认为这说明自适应长短 CoT融合方法有效，也说明 Hunyuan-TurboS 能以更高的性价比提供高性能的 LLM 推理。

> **确认：** 52.8% 和 40.5% 是用表 5 的哪两个数除出来的？第 3 页还写过 「about 50%」。
> 1207.8 / 2979.2 ≈ 40.5%，和正文一致。1207.8 / 2283.5 ≈ 52.9%，正文写 52.8%，差 0.1 个百分点。第 3 页贡献列表的 「about 50%」 就是这组对 DeepSeek-R1 的比值取整。Arena 那一半来自表 3: TurboS 1356, DeepSeek-R1 1355。这些比例比的都是输出 token 数，正文把 40.5% 说成 「generation cost」，表 5 里只有 token 数，没有价格，也没有时延。

![Image block](images/p16-image.png)

（图：标题 State passing with sequential context parallelism，标题上半截被裁掉。cp0 的初始状态标 Initialized with zeros，和 cp0 的 decay chunk 相乘，再加上本段的 states，得到 out_states. out_states 经黄色箭头 p2p send 传给 cp1，当作 cp1 的初始状态，同样乘 cp1 的 decay chunk，加 states，得到 cp1 的 out_states。图底有一条虚线，和下面那张图是上下两半。）

![Image block](images/p16-figure-4-a-diagram-illustrating-the-context-parallelism.png)

（图：标题 State passing with parallel context parallelism. cp0 和 cp1 的初始状态都是全零。虚线框标 all-gathered decay_chunk，两个 rank 都拿到 cp0 和 cp1 的 decay chunk，各自并行做乘和加，得到 tmp_states。黄色箭头把各 rank 的中间状态汇到底部，经 reduce-scatter 得到 out_states，分成 cp_0 和 cp_1 两份。）

Figure 4: A diagram illustrating the Context Parallelism of Hunyuan-TurboS infrastructures.

图 4: Hunyuan-TurboS 基础设施里上下文并行的示意图。

> **回看：** 这一页两张图只有一个图注；附录又写了 「Figure 5」，images 目录里却没有第五张编号图。5 张 PNG 各对应什么？
> p16-image.png 没有自己的图注，画的是顺序式状态传递；带 Figure 4 图注的那张画的是并行式。第 17 页正文说两种方式 「as illustrated in Figure 4」，所以这两张是图 4 的上下两半，抽取时切成了两块。第 26 页的 「Figure 5」 在 md 里是一张表，没有 PNG。所以 5 张图是：第 1 页图 1，第 4 页图 2，第 8 页图 3，第 16 页图 4 的两半。

<!-- page 17 of 26 -->

## 5 Infrastructures（基础设施）

**Reinforcement Training Framework.** The reinforcement training of Hunyuan-TurboS is based on Angel-RL, an efficient and lightweight reinforcement learning framework developed by Tencent that integrates both training and inference capabilities. Angel-RL is built upon Tencent's proprietary large-model training framework, AngelPTM (Nie et al., 2023), and the large-model inference framework, AngelHCF.

强化训练框架。Hunyuan-TurboS 的强化训练基于 Angel-RL，这是腾讯开发的高效，轻量，训推一体的强化学习框架。Angel-RL 建在腾讯自研的大模型训练框架 AngelPTM (Nie et al., 2023) 和大模型推理框架 AngelHCF 之上。

To achieve highly efficient reinforcement training for Hunyuan-TurboS, we have implemented meticulous engineering optimizations. Specifically, on the training side, we comprehensively integrate all model parallelism techniques and optimization strategies, including Tensor Parallelism (TP), Pipeline Parallelism (PP), Expert Parallelism (EP), Context Parallelism (CP), and sequence concatenation optimization to improve efficiency. As for context parallelism in particular, we implemented two state-passing approaches for context parallelism, namely the sequential and parallel paradigms, as illustrated in Figure 4. The sequential implementation operates by having the preceding CP rank compute the final state, which is subsequently propagated to the next CP rank. The subsequent CP rank then employs this received state as the initial state to perform state passing computations. In contrast, the parallel approach first executes an all-gather operation on decay<sub>chunk</sub> within the CP group, enabling all CP ranks to concurrently conduct state passing computations. This parallel computation strategically omits calculations pertaining to decay<sub>chunk</sub> × states that reside on non-local CP ranks. Ultimately, the output states generated through parallel computation undergo a reduce-scatter operation to yield the final consolidated results. On the sampling side, we support INT8 quantization (Dettmers et al., 2022).

为了让 Hunyuan-TurboS 的强化训练高效，我们做了细致的工程优化。训练侧全面整合各种模型并行技术和优化策略，包括张量并行（TP），流水线并行（PP），专家并行（EP），上下文并行（CP）和序列拼接优化。上下文并行方面，我们实现了两种状态传递方法：顺序式和并行式，如图 4 所示。顺序式由前一个 CP rank 算出最终状态，再传给下一个 CP rank。下一个 CP rank 把收到的状态当作初始状态，做状态传递计算。并行式则先在 CP 组内对 decay_chunk 做 all-gather，让所有 CP rank 同时做状态传递计算。这种并行计算有意跳过落在非本地 CP rank 上的 decay_chunk × states 计算。最后，并行计算得到的输出状态经过 reduce-scatter，得到最终合并的结果。采样侧支持 INT8 量化（Dettmers et al., 2022）。

Secondly, leveraging Tencent's custom-built Starlink Network, we effectively implement communicationcomputation overlap strategies, enabling a more seamless integration of communication and computation processes, thereby enhancing the overall system efficiency.

其次，借助腾讯自建的 Starlink Network，我们实现了通信和计算重叠，让两者衔接更顺，提升整体系统效率。

Furthermore, considering that reinforcement training often involves multiple large models for both training and inference, GPU memory typically becomes a bottleneck. To address this challenge, we have designed a multi-model reinforcement training workflow that combines hybrid and dedicated resource allocation. Additionally, using AngelPTM's ZeroCache technology, we reduce the GPU memory pressure during large model reinforcement training by storing deduplicated model states and offloading them to CPU memory.

此外，强化训练常常同时涉及多个大模型的训练和推理，GPU 显存往往成为瓶颈。为此我们设计了多模型强化训练工作流，结合混用式和专用式两种资源分配。另外借助 AngelPTM 的 ZeroCache 技术，把去重后的模型状态存下来并卸载到 CPU 内存，减轻大模型强化训练时的 GPU 显存压力。

These innovations ensure that models with over 500 billion parameters can be efficiently trained within the Angel-RL framework. This not only expands the range of model sizes that can be handled but also advances the capabilities of large-scale model training in the field of artificial intelligence.

这些改进保证 5000 亿参数以上的模型能在 Angel-RL 框架里高效训练。能处理的模型规模扩大了，人工智能领域大规模模型训练的能力也随之推进。

**Inference and Deployment.** Compared with prior Hunyuan-Turbo model, Hunyuan-TurboS were designed for high efficiency and low latency at all context lengths. The inference of the Hunyuan-TurboS model is powered by the AngelHCF Inference Acceleration Framework. For the Mamba Hybrid architecture of the TurboS model, we have implemented optimizations across folloing three key dimensions, ultimately achieving a 1.8x speedup compared to Hunyuan-Turbo, which is a pure Transformers MoE model:

推理与部署。和之前的 Hunyuan-Turbo 相比，Hunyuan-TurboS 在所有上下文长度上都按高效率，低延迟设计。Hunyuan-TurboS 的推理由 AngelHCF 推理加速框架支撑。针对 TurboS 的 Mamba 混合架构，我们在下面三个关键维度做了优化，最终比纯 Transformer MoE 模型 Hunyuan-Turbo 快 1.8 倍：

(1) **Mamba Kernel Optimization**:

(1) Mamba kernel 优化：

• **Prefill Phase**: By exploiting the structural features of Mamba2, we aimed to augment computational parallelism. The workload was partitioned into several parallelizable General Matrix Multiply (GEMM) operations, and a chunkscan block-wise parallel computation strategy was implemented.

• Prefill 阶段：利用 Mamba2 的结构特点提高计算并行度。把工作量拆成几个可并行的通用矩阵乘（GEMM）操作，并实现 chunkscan 分块并行计算。

• **Decode Phase**: In order to mitigate memory bandwidth limitations, the SelectivescanUpdate kernel was devised. This kernel facilitates more accurate read and update operations on Mamba state vectors at specified locations.

• Decode 阶段：为缓解显存带宽限制，设计了 SelectivescanUpdate kernel。它能更精确地在指定位置读取和更新 Mamba 状态向量。

(2) **MoE Optimization**: Beyond conventional Tensor Parallel partitioning, we prioritized Expert Parallel to mitigate memory bottlenecks during decoding. We employed intelligent redundant expert allocation to balance computational load across GPUs. In collaboration with the networking team, we optimized communication for both dispatch and combine phases while implementing computation-communication overlap, achieving significant throughput improvements.

(2) MoE 优化：在常规的张量并行切分之外，优先用专家并行缓解解码阶段的显存瓶颈。用智能的冗余专家分配平衡各 GPU 的计算负载。和网络团队合作，优化 dispatch 和 combine 两个阶段的通信，并做计算通信重叠，吞吐明显提升。

(3) **Hybrid Architecture Precision Optimization**: While Mamba's linear structure offers computational efficiency advantages over attention mechanisms in long-context scenarios, its inherent lack of global attention capture can lead to repetitive generation issues when using standard fp16/bf16 for Mamba state. To address this, we innovatively adopted fp32 precision for Mamba state at the kernel level, elevating the long-text generation quality of the hybrid architecture to match that of Full Attention models. This optimization reduced token consumption by 35%-45% in mathematically intensive and programming competition-level reasoning tasks (compared to the original fp16/bf16 approach).

(3) 混合架构精度优化：Mamba 的线性结构在长上下文场景下比注意力机制省计算，但它本身抓不到全局注意力，Mamba 状态用标准 fp16/bf16 时容易重复生成。为此我们在 kernel 层让 Mamba 状态改用 fp32 精度，把混合架构的长文本生成质量提到和 Full Attention 模型相当。在数学密集型和编程竞赛级的推理任务上，这项优化让 token 消耗减少 35% 到 45%（相对原来的 fp16/bf16 做法）。

<!-- page 18 of 26 -->

## 6 Conclusion（结论）

In this report, we introduced Hunyuan-TurboS, a novel large hybrid Transformer-Mamba Mixtureof-Experts (MoE) model. It uniquely synergizes Mamba's long-sequence processing efficiency with Transformer's superior contextual understanding, incorporating an innovative AMF/MF block pattern and an adaptive long-short Chain-of-Thought (CoT) mechanism. Pre-trained on 16T high-quality tokens and supporting a 256K context length, this 56B activated parameter (560B total) model stands as the first industry-deployed large-scale Mamba architecture. Our comprehensive post-training regimen, featuring Supervised Fine-Tuning, Adaptive Long-short CoT Fusion, Multi-round Deliberation Learning, and a two-stage Reinforcement Learning process, significantly enhanced its capabilities. Hunyuan-TurboS demonstrates strong performance, achieving a 1356 LMSYS Chatbot Arena score and averaging 77.9% across 23 automated benchmarks. Critically, Hunyuan-TurboS strikes an effective balance between high performance and computational efficiency, delivering substantial capabilities at lower inference costs than many reasoning models. This work establishes a new paradigm for efficient, large-scale pre-trained models, advancing the development of accessible and powerful AI systems.

本报告介绍了 Hunyuan-TurboS，一个新的大型 Transformer-Mamba 混合结构 MoE 模型。它把 Mamba 处理长序列的效率和 Transformer 更强的上下文理解结合起来，采用新的 AMF/MF 块模式和自适应长短 CoT 机制。模型在 16T 高质量 token 上预训练，支持 256K 上下文长度，激活参数 56B（总参数 560B），是业界第一个落地部署的大规模 Mamba 架构。后训练包括监督微调，自适应长短 CoT 融合，多轮 Deliberation Learning 和两阶段强化学习，明显增强了模型能力。Hunyuan-TurboS 在 LMSYS Chatbot Arena 得分 1356, 23 个自动化基准平均 77.9%。更重要的是，它在高性能和计算效率之间取得了平衡，推理成本低于许多推理模型。作者称这项工作为高效的大规模预训练模型建立了新范式，推动易用而强大的 AI 系统发展。

<!-- page 19 of 26 -->

## 7 Authors（作者）

Within each role, authors are listed alphabetically.

每个角色内，作者按字母顺序排列。

**Core Contributors** Ao Liu Botong Zhou Can Xu Chayse Zhou ChenChen Zhang Chengcheng Xu Chenhao Wang Decheng Wu Dengpeng Wu Dian Jiao Dong Du Dong Wang Feng Zhang Fengzong Lian Guanghui Xu Guanwei Zhang Hai Wang Haipeng Luo Han Hu Huilin Xu Jiajia Wu Jianchen Zhu Jianfeng Yan Jiaqi Zhu Jihong Zhang Jinbao Xue Jun Xia Junqiang Zheng Kai Liu Kai Zhang Kai Zheng Kejiao Li Keyao Wang Lan Jiang Lixin Liu Lulu Wu Mengyuan Huang Peijie Yu Peiqi Wang Qian Wang Qianbiao Xiang Qibin Liu Qingfeng Sun Richard Guo Ruobing Xie Saiyong Yang Shaohua Chen Shihui Hu Shuai Li Shuaipeng Li Shuang Chen Suncong Zheng Tao Yang Tian Zhang Tinghao Yu Weidong Han Weijie Liu Weijin Zhou

核心贡献者（Core Contributors）名单，人名不译。

Weikang Wang Wesleye Chen Xiao Feng Xiaoqin Ren Xingwu Sun Xiong Kuang Xuemeng Huang Xun Cao Yanfeng Chen Yang Du Zhen Yang Yangyu Tao Yaping Deng Yi Shen Yigeng Hong Yiqi Chen Yiqing Huang Yuchi Deng Yue Mao Yulong Wang Yuyuan Zeng Zenan Xu Zhanhui Kang Zhe Zhao ZhenXiang Yan Zheng Fang Zhichao Hu Zhongzhi Chen Zhuoyu Li Zongwei Li

（核心贡献者名单续完。）

**Contributors** Alex Yan Ande Liang Baitong Liu Beiping Pan Bin Xing Binghong Wu Bingxin Qu Bolin Ni Boyu Wu Chen Li Cheng Jiang Cheng Zhang Chengjun Liu Chengxu Yang Chengzhong Xu Chiyu Wang Chong Zha Daisy Yi Di Wang Fanyang Lu Fei Chen Feifei Liu Feng Zheng Guanghua Yu Guiyang Li Guohua Wang Haisheng Lin

贡献者（Contributors）名单开始，接到下一页。

<!-- page 20 of 26 -->

Han Liu Han Wang Hao Fei Hao Lu Haoqing Jiang Haoran Sun Haotian Zhu Huangjin Dai Huankui Chen Huawen Feng Huihui Cai Huxin Peng Jackson Lv Jiacheng Shi Jiahao Bu Jianbo Li Jianglu Hu Jiangtao Guan Jianing Xu Jianwei Cai Jiarong Zhang Jiawei Song Jie Jiang Jie Liu Jieneng Yang Jihong Zhang Jin lv Jing Zhao Jinjian Li Jinxing Liu Jun Zhao Juntao Guo Kai Wang Kan Wu Lei Fu Lei He Lei Wang Li Liu Liang Dong Liya Zhan Long Cheng Long Xu Mao Zheng Meng Liu Mengkang Hu Nanli Chen Peirui Chen Peng He Pengju Pan Pengzhi Wei Qi Yang Qi Yi Roberts Wang Rongpeng Chen Rui Sun Rui Yang Ruibin Chen Ruixu Zhou Shaofeng Zhang Sheng Zhang Shihao Xu Shuaishuai Chang Shulin Liu

（贡献者名单续。）

SiQi Wang Songjia Feng Songling Yuan Tao Zhang Tianjiao Lang Tongkai Li Wei Deng Wei Li Weichao Wang Weigang Zhang Weixuan Sun Wen Ouyang Wenxiang Jiao Wenzhi Sun Wenzhuo Jia Xiang Zhang Xiangyu He Xianshun Ren XiaoYing Zhu Xiaolong Guo Xiaoxue Li Xiaoyu Ma Xican Lu Xinhua Feng Xinting Huang Xinyu Guan Xirui Li Xu Zhang Xudong Gao Xun Luo Xuxiang Qi Yangkun Chen Yangyu Tao Yanling Xiao Yantao Mai Yanze Chen Yao Ding Yeting Yang YiFan Song Yifan Yang Yijiao Zhu Yinhe Wu Yixian Liu Yong Yang Yuanjun Cai Yuanlin Tu Yue Zhang Yufei Huang Yuhang Zhou Yuhao Jiang Yuhong Liu Yuhui Hu Yujin Lin Yun Yang Yunhao Wang Yusong Zhang Zekun Wu Zelong Zhang Zhan Yu Zhaoliang Yang Zhe Zhao Zheng Li Zhenyu Huang

（贡献者名单续。）

<!-- page 21 of 26 -->

Zhiguang Liu Zhijiang Xu Zhiqing Kui Zhiyin Zeng Zhiyuan Xiong Zhuo Han Zifan Wu

（贡献者名单续。）

Zigang Geng Zilong Zhao Ziyan Tang Ziyuan Zhu Zonglei Zhu Zhijiang Xu

（贡献者名单到此结束。Zhijiang Xu 在这一页出现了两次。）

<!-- page 22 of 26 -->

## References（参考文献）

Joshua Ainslie, James Lee-Thorp, Michiel de Jong, Yury Zemlyanskiy, Federico Lebron, and Sumit ´ Sanghai. Gqa: Training generalized multi-query transformer models from multi-head checkpoints, 2023. URL [https://arxiv.org/abs/2305.13245](https://arxiv.org/abs/2305.13245).

Jacob Austin, Augustus Odena, Maxwell Nye, Maarten Bosma, Henryk Michalewski, David Dohan, Ellen Jiang, Carrie Cai, Michael Terry, Quoc Le, et al. Program synthesis with large language models. arXiv preprint arXiv:2108.07732, 2021.

Yonatan Bisk, Rowan Zellers, Jianfeng Gao, Yejin Choi, et al. PIQA: Reasoning about physical commonsense in natural language. In Proceedings of AAAI, 2020.

Federico Cassano, John Gouwar, Daniel Nguyen, Sydney Nguyen, Luna Phipps-Costin, Donald Pinckney, Ming-Ho Yee, Yangtian Zi, Carolyn Jane Anderson, Molly Q Feldman, et al. Multipl-e: A scalable and extensible approach to benchmarking neural code generation. arXiv preprint arXiv:2208.08227, 2022.

Mark Chen, Jerry Tworek, Heewoo Jun, Qiming Yuan, Henrique Ponde De Oliveira Pinto, Jared Kaplan, Harri Edwards, Yuri Burda, Nicholas Joseph, Greg Brockman, et al. Evaluating large language models trained on code. arXiv preprint arXiv:2107.03374, 2021.

Wei-Lin Chiang, Lianmin Zheng, Ying Sheng, Anastasios Nikolas Angelopoulos, Tianle Li, Dacheng Li, Banghua Zhu, Hao Zhang, Michael Jordan, Joseph E Gonzalez, et al. Chatbot arena: An open platform for evaluating llms by human preference. In Forty-first International Conference on Machine Learning, 2024.

Peter Clark, Isaac Cowhey, Oren Etzioni, Tushar Khot, Ashish Sabharwal, Carissa Schoenick, and Oyvind Tafjord. Think you have Solved Question Answering? Try ARC, the AI2 Reasoning Challenge. arXiv preprint arXiv:1803.05457, 2018.

Karl Cobbe, Vineet Kosaraju, Mohammad Bavarian, Mark Chen, Heewoo Jun, Lukasz Kaiser, Matthias Plappert, Jerry Tworek, Jacob Hilton, Reiichiro Nakano, et al. Training verifiers to solve math word problems. arXiv preprint arXiv:2110.14168, 2021.

Tri Dao and Albert Gu. Transformers are ssms: Generalized models and efficient algorithms through structured state space duality. arXiv preprint arXiv:2405.21060, 2024.

Google DeepMind. Gemini 2.5, 2025. URL [https://blog.google/technology/google-deepmind/gemini-model-thinking-updates-march-2025/](https://blog.google/technology/google-deepmind/gemini-model-thinking-updates-march-2025/).

DeepSeek-AI, Aixin Liu, Bei Feng, Bing Xue, Bingxuan Wang, Bochao Wu, Chengda Lu, Chenggang Zhao, Chengqi Deng, Chenyu Zhang, Chong Ruan, Damai Dai, Daya Guo, Dejian Yang, Deli Chen, Dongjie Ji, Erhang Li, Fangyun Lin, Fucong Dai, Fuli Luo, Guangbo Hao, Guanting Chen, Guowei Li, H. Zhang, Han Bao, Hanwei Xu, Haocheng Wang, Haowei Zhang, Honghui Ding, Huajian Xin, Huazuo Gao, Hui Li, Hui Qu, J. L. Cai, Jian Liang, Jianzhong Guo, Jiaqi Ni, Jiashi Li, Jiawei Wang, Jin Chen, Jingchang Chen, Jingyang Yuan, Junjie Qiu, Junlong Li, Junxiao Song, Kai Dong, Kai Hu, Kaige Gao, Kang Guan, Kexin Huang, Kuai Yu, Lean Wang, Lecong Zhang, Lei Xu, Leyi Xia, Liang Zhao, Litong Wang, Liyue Zhang, Meng Li, Miaojun Wang, Mingchuan Zhang, Minghua Zhang, Minghui Tang, Mingming Li, Ning Tian, Panpan Huang, Peiyi Wang, Peng Zhang, Qiancheng Wang, Qihao Zhu, Qinyu Chen, Qiushi Du, R. J. Chen, R. L. Jin, Ruiqi Ge, Ruisong Zhang, Ruizhe Pan, Runji Wang, Runxin Xu, Ruoyu Zhang, Ruyi Chen, S. S. Li, Shanghao Lu, Shangyan Zhou, Shanhuang Chen, Shaoqing Wu, Shengfeng Ye, Shengfeng Ye, Shirong Ma, Shiyu Wang, Shuang Zhou, Shuiping Yu, Shunfeng Zhou, Shuting Pan, T. Wang, Tao Yun, Tian Pei, Tianyu Sun, W. L. Xiao, Wangding Zeng, Wanjia Zhao, Wei An, Wen Liu, Wenfeng Liang, Wenjun Gao, Wenqin Yu, Wentao Zhang, X. Q. Li, Xiangyue Jin, Xianzu Wang, Xiao Bi, Xiaodong Liu, Xiaohan Wang, Xiaojin Shen, Xiaokang Chen, Xiaokang Zhang, Xiaosha Chen, Xiaotao Nie, Xiaowen Sun, Xiaoxiang Wang, Xin Cheng, Xin Liu, Xin Xie, Xingchao Liu, Xingkai Yu, Xinnan Song, Xinxia Shan, Xinyi Zhou, Xinyu Yang, Xinyuan Li, Xuecheng Su, Xuheng Lin, Y. K. Li, Y. Q. Wang, Y. X. Wei, Y. X. Zhu, Yang Zhang, Yanhong Xu, Yanhong Xu, Yanping Huang, Yao Li, Yao Zhao, Yaofeng Sun, Yaohui Li, Yaohui Wang, Yi Yu, Yi Zheng, Yichao Zhang, Yifan Shi, Yiliang Xiong, Ying He, Ying Tang, Yishi Piao, Yisong Wang, Yixuan Tan, Yiyang Ma, Yiyuan Liu, Yongqiang Guo, Yu Wu, Yuan Ou, Yuchen Zhu, Yuduan Wang, Yue Gong, Yuheng Zou, Yujia He, Yukun Zha, Yunfan Xiong, Yunxian Ma, Yuting Yan, Yuxiang Luo, Yuxiang You, Yuxuan Liu, Yuyang Zhou, Z. F. Wu, Z. Z. Ren, Zehui Ren, Zhangli Sha, Zhe Fu, Zhean Xu, Zhen Huang, Zhen Zhang, Zhenda Xie, Zhengyan Zhang, Zhewen Hao, Zhibin Gou, Zhicheng Ma, Zhigang Yan, Zhihong Shao, Zhipeng Xu, Zhiyu Wu, Zhongyu Zhang, Zhuoshu Li, Zihui Gu, Zijia Zhu, Zijun Liu, Zilin Li, Ziwei Xie, Ziyang Song, Ziyi Gao, and Zizheng Pan. Deepseek-v3 technical report, 2025. URL [https://arxiv.org/abs/2412.19437](https://arxiv.org/abs/2412.19437).

（第 22 页参考文献 11 条，条目保留原文。最后一条 DeepSeek-V3 技术报告和第 23 页的 Liu et al.，2024 是同一篇 arXiv:2412.19437.）

<!-- page 23 of 26 -->

Tim Dettmers, Mike Lewis, Younes Belkada, and Luke Zettlemoyer. Gpt3. int8 (): 8-bit matrix multi-plication for transformers at scale. Advances in neural information processing systems, 35:30318–30332, 2022.

Xinrun Du, Yifan Yao, Kaijing Ma, Bingli Wang, Tianyu Zheng, King Zhu, Minghao Liu, Yiming Liang, Xiaolong Jin, Zhenlin Wei, et al. Supergpqa: Scaling llm evaluation across 285 graduate disciplines. arXiv preprint arXiv:2502.14739, 2025.

Dheeru Dua, Yizhong Wang, Pradeep Dasigi, Gabriel Stanovsky, Sameer Singh, and Matt Gardner. Drop: A reading comprehension benchmark requiring discrete reasoning over paragraphs. arXiv preprint arXiv:1903.00161, 2019.

Aryo Pradipta Gema, Joshua Ong Jun Leang, Giwon Hong, Alessio Devoto, Alberto Carlo Maria Mancino, Rohit Saxena, Xuanli He, Yu Zhao, Xiaotang Du, Mohammad Reza Ghasemi Madani, et al. Are we done with mmlu? arXiv preprint arXiv:2406.04127, 2024.

Albert Gu and Tri Dao. Mamba: Linear-time sequence modeling with selective state spaces. arXiv preprint arXiv:2312.00752, 2023.

Alex Gu, Baptiste Roziere, Hugh Leather, Armando Solar-Lezama, Gabriel Synnaeve, and Sida I \` Wang. Cruxeval: A benchmark for code reasoning, understanding and execution. arXiv preprint arXiv:2401.03065, 2024.

Daya Guo, Dejian Yang, Haowei Zhang, Junxiao Song, Ruoyu Zhang, Runxin Xu, Qihao Zhu, Shirong Ma, Peiyi Wang, Xiao Bi, et al. DeepSeek-R1: Incentivizing reasoning capability in LLMs via reinforcement learning. arXiv preprint arXiv:2501.12948, 2025.

Dan Hendrycks, Collin Burns, Saurav Kadavath, Akul Arora, Steven Basart, Eric Tang, Dawn Song, and Jacob Steinhardt. Measuring mathematical problem solving with the math dataset. arXiv preprint arXiv:2103.03874, 2021.

Yuzhen Huang, Yuzhuo Bai, Zhihao Zhu, Junlei Zhang, Jinghan Zhang, Tangjun Su, Junteng Liu, Chuancheng Lv, Yikai Zhang, Yao Fu, et al. C-Eval: A multi-level multi-discipline chinese evaluation suite for foundation models. In Proceedings of NeurIPS, 2024.

Naman Jain, King Han, Alex Gu, Wen-Ding Li, Fanjia Yan, Tianjun Zhang, Sida Wang, Armando Solar-Lezama, Koushik Sen, and Ion Stoica. Livecodebench: Holistic and contamination free evaluation of large language models for code. arXiv preprint arXiv:2403.07974, 2024.

Mandar Joshi, Eunsol Choi, Daniel S Weld, and Luke Zettlemoyer. TriviaQA: A large scale distantly supervised challenge dataset for reading comprehension. arXiv preprint arXiv:1705.03551, 2017.

Pei Ke, Bosi Wen, Zhuoer Feng, Xiao Liu, Xuanyu Lei, Jiale Cheng, Shengyuan Wang, Aohan Zeng, Yuxiao Dong, Hongning Wang, Jie Tang, and Minlie Huang. Critiquellm: Towards an informative critique generation model for evaluation of large language model generation, 2024. URL [https://arxiv.org/abs/2311.18702](https://arxiv.org/abs/2311.18702).

Tom Kwiatkowski, Jennimaria Palomaki, Olivia Redfield, Michael Collins, Ankur Parikh, Chris Alberti, Danielle Epstein, Illia Polosukhin, Jacob Devlin, Kenton Lee, et al. Natural questions: a benchmark for question answering research. TACL, 2019.

Haonan Li, Yixuan Zhang, Fajri Koto, Yifei Yang, Hai Zhao, Yeyun Gong, Nan Duan, and Timothy Baldwin. CMMLU: Measuring massive multitask language understanding in chinese. arXiv preprint arXiv:2306.09212, 2023a.

Wenhao Li, Fanchao Qi, Maosong Sun, Xiaoyuan Yi, and Jiarui Zhang. Ccpm: A chinese classical poetry matching dataset. arXiv preprint arXiv:2106.01979, 2021.

Xian Li, Ping Yu, Chunting Zhou, Timo Schick, Omer Levy, Luke Zettlemoyer, Jason Weston, and Mike Lewis. Self-alignment with instruction backtranslation. arXiv preprint arXiv:2308.06259, 2023b.

Bill Yuchen Lin, Ronan Le Bras, Kyle Richardson, Ashish Sabharwal, Radha Poovendran, Peter Clark, and Yejin Choi. Zebralogic: On the scaling limits of llms for logical reasoning, 2025. URL [https://arxiv.org/abs/2502.01100](https://arxiv.org/abs/2502.01100).

Aixin Liu, Bei Feng, Bing Xue, Bingxuan Wang, Bochao Wu, Chengda Lu, Chenggang Zhao, Chengqi Deng, Chenyu Zhang, Chong Ruan, et al. Deepseek-v3 technical report. arXiv preprint arXiv:2412.19437, 2024.

（第 23 页参考文献 18 条，条目保留原文。）

<!-- page 24 of 26 -->

Haipeng Luo, Qingfeng Sun, Can Xu, Pu Zhao, Jianguang Lou, Chongyang Tao, Xiubo Geng, Qingwei Lin, Shifeng Chen, and Dongmei Zhang. Wizardmath: Empowering mathematical reasoning for large language models via reinforced evol-instruct. arXiv preprint arXiv:2308.09583, 2023a.

Haipeng Luo, Qingfeng Sun, Can Xu, Pu Zhao, Qingwei Lin, Jian-Guang Lou, Shifeng Chen, Yansong Tang, and Weizhu Chen. Wizardarena: Post-training large language models via simulated offline chatbot arena. Advances in Neural Information Processing Systems, 37:111544–111570, 2024.

Ziyang Luo, Can Xu, Pu Zhao, Qingfeng Sun, Xiubo Geng, Wenxiang Hu, Chongyang Tao, Jing Ma, Qingwei Lin, and Daxin Jiang. Wizardcoder: Empowering code large language models with evolinstruct. arXiv preprint arXiv:2306.08568, 2023b.

Dakota Mahan, Duy Van Phung, Rafael Rafailov, Chase Blagden, Nathan Lile, Louis Castricato, Jan-Philipp Franken, Chelsea Finn, and Alon Albalak. Generative reward models. ¨ arXiv preprint arXiv:2410.12832, 2024.

Meta. The llama 4 herd: The beginning of a new era of natively multimodal ai innovation. 2025. URL [https://ai.meta.com/blog/llama-4-multimodal-intelligence/](https://ai.meta.com/blog/llama-4-multimodal-intelligence/).

Xiaonan Nie, Yi Liu, Fangcheng Fu, Jinbao Xue, Dian Jiao, Xupeng Miao, Yangyu Tao, and Bin Cui. Angel-ptm: A scalable and economical large-scale pre-training system in tencent. arXiv preprint arXiv:2303.02868, 2023.

OpenAI. Hello GPT-4o, 2024a. URL [https://openai.com/index/hello-gpt-4o/](https://openai.com/index/hello-gpt-4o/).

OpenAI. Learning to reason with LLMs, 2024b. URL [https://openai.com/index/learning-to-reason-with-llms/](https://openai.com/index/learning-to-reason-with-llms/).

OpenAI. Introducing openai o3 and o4-mini, 2025. URL [https://openai.com/index/introducing-o3-and-o4-mini/](https://openai.com/index/introducing-o3-and-o4-mini/).

Bowen Peng and Jeffrey Quesnelle. Ntk-aware scaled rope allows llama models to have extended (8k+) context size without any fine-tuning and minimal perplexity degradation, 2023.

Keisuke Sakaguchi, Ronan Le Bras, Chandra Bhagavatula, and Yejin Choi. WinoGrande: An adversarial winograd schema challenge at scale. Communications of the ACM, 2021.

Zhihong Shao, Peiyi Wang, Qihao Zhu, Runxin Xu, Junxiao Song, Xiao Bi, Haowei Zhang, Mingchuan Zhang, YK Li, Y Wu, et al. Deepseekmath: Pushing the limits of mathematical reasoning in open language models. arXiv preprint arXiv:2402.03300, 2024.

Freda Shi, Mirac Suzgun, Markus Freitag, Xuezhi Wang, Suraj Srivats, Soroush Vosoughi, Hyung Won Chung, Yi Tay, Sebastian Ruder, Denny Zhou, et al. Language models are multilingual chain-of-thought reasoners. arXiv preprint arXiv:2210.03057, 2022.

Xingwu Sun, Yanfeng Chen, Yiqing Huang, Ruobing Xie, Jiaqi Zhu, Kai Zhang, Shuaipeng Li, Zhen Yang, Jonny Han, Xiaobo Shu, et al. Hunyuan-large: An open-source moe model with 52 billion activated parameters by tencent. arXiv preprint arXiv:2411.02265, 2024.

Mirac Suzgun, Nathan Scales, Nathanael Scharli, Sebastian Gehrmann, Yi Tay, Hyung Won Chung, ¨ Aakanksha Chowdhery, Quoc V Le, Ed H Chi, Denny Zhou, et al. Challenging big-bench tasks and whether chain-of-thought can solve them. arXiv preprint arXiv:2210.09261, 2022.

Ashish Vaswani, Noam Shazeer, Niki Parmar, Jakob Uszkoreit, Llion Jones, Aidan N Gomez, Lukasz Kaiser, and Illia Polosukhin. Attention is all you need. In Proceedings of NIPS, 2017.

Binjie Wang, Steffi Chern, Ethan Chern, and Pengfei Liu. Halu-j: Critique-based hallucination judge, 2024a. URL [https://arxiv.org/abs/2407.12943](https://arxiv.org/abs/2407.12943).

Yizhong Wang, Yeganeh Kordi, Swaroop Mishra, Alisa Liu, Noah A Smith, Daniel Khashabi, and Hannaneh Hajishirzi. Self-instruct: Aligning language models with self-generated instructions. arXiv preprint arXiv:2212.10560, 2022.

Yubo Wang, Xueguang Ma, Ge Zhang, Yuansheng Ni, Abhranil Chandra, Shiguang Guo, Weiming Ren, Aaran Arulraj, Xuan He, Ziyan Jiang, et al. MMLU-Pro: A more robust and challenging multi-task language understanding benchmark. In Proceedings of NeurIPS, 2024b.

Tianwen Wei, Jian Luan, Wei Liu, Shuang Dong, and Bin Wang. CMATH: Can your language model pass chinese elementary school math test? arXiv preprint arXiv:2306.16636, 2023a.

（第 24 页参考文献 20 条，条目保留原文。第 12 页 GRPO 引用的 Shao et al.，2024 就是这里的 DeepSeekMath.）

<!-- page 25 of 26 -->

Yuxiang Wei, Zhe Wang, Jiawei Liu, Yifeng Ding, and Lingming Zhang. Magicoder: Empowering code generation with oss-instruct. arXiv preprint arXiv:2312.02120, 2023b.

Yuxiang Wei, Zhe Wang, Jiawei Liu, Yifeng Ding, and Lingming Zhang. Magicoder: Empowering code generation with OSS-instruct. In Proceedings of the 41st International Conference on Machine Learning, volume 235 of Proceedings of Machine Learning Research, pp. 52632–52657. PMLR, 21–27 Jul 2024. URL [https://proceedings.mlr.press/v235/wei24h.html](https://proceedings.mlr.press/v235/wei24h.html).

Can Xu, Qingfeng Sun, Kai Zheng, Xiubo Geng, Pu Zhao, Jiazhan Feng, Chongyang Tao, Qingwei Lin, and Daxin Jiang. Wizardlm: Empowering large pre-trained language models to follow complex instructions. In The Twelfth International Conference on Learning Representations, 2024.

Wenyuan Xu, Xiaochen Zuo, Chao Xin, Yu Yue, Lin Yan, and Yonghui Wu. A unified pairwise framework for rlhf: Bridging generative reward modeling and policy optimization, 2025. URL [https://arxiv.org/abs/2504.04950](https://arxiv.org/abs/2504.04950).

An Yang, Anfeng Li, Baosong Yang, Beichen Zhang, Binyuan Hui, Bo Zheng, Bowen Yu, Chang Gao, Chengen Huang, Chenxu Lv, Chujie Zheng, Dayiheng Liu, Fan Zhou, Fei Huang, Feng Hu, Hao Ge, Haoran Wei, Huan Lin, Jialong Tang, Jian Yang, Jianhong Tu, Jianwei Zhang, Jianxin Yang, Jiaxi Yang, Jing Zhou, Jingren Zhou, Junyang Lin, Kai Dang, Keqin Bao, Kexin Yang, Le Yu, Lianghao Deng, Mei Li, Mingfeng Xue, Mingze Li, Pei Zhang, Peng Wang, Qin Zhu, Rui Men, Ruize Gao, Shixuan Liu, Shuang Luo, Tianhao Li, Tianyi Tang, Wenbiao Yin, Xingzhang Ren, Xinyu Wang, Xinyu Zhang, Xuancheng Ren, Yang Fan, Yang Su, Yichang Zhang, Yinger Zhang, Yu Wan, Yuqiong Liu, Zekun Wang, Zeyu Cui, Zhenru Zhang, Zhipeng Zhou, and Zihan Qiu. Qwen3 technical report, 2025a. URL [https://arxiv.org/abs/2505.09388](https://arxiv.org/abs/2505.09388).

An Yang, Anfeng Li, Baosong Yang, Beichen Zhang, Binyuan Hui, Bo Zheng, Bowen Yu, Chang Gao, Chengen Huang, Chenxu Lv, et al. Qwen3 technical report. arXiv preprint arXiv:2505.09388, 2025b.

Qiying Yu, Zheng Zhang, Ruofei Zhu, Yufeng Yuan, Xiaochen Zuo, Yu Yue, Tiantian Fan, Gaohong Liu, Lingjun Liu, Xin Liu, et al. Dapo: An open-source llm reinforcement learning system at scale, 2025. URL https://arxiv. org/abs/2503.14476.

Rowan Zellers, Ari Holtzman, Yonatan Bisk, Ali Farhadi, and Yejin Choi. HellaSwag: Can a machine really finish your sentence? In Proceedings of ACL, 2019.

Weihao Zeng, Can Xu, Yingxiu Zhao, Jian-Guang Lou, and Weizhu Chen. Automatic instruction evolving for large language models. In Proceedings of the 2024 Conference on Empirical Methods in Natural Language Processing, pp. 6998–7018, 2024.

Lunjun Zhang, Arian Hosseini, Hritik Bansal, Mehran Kazemi, Aviral Kumar, and Rishabh Agarwal. Generative verifiers: Reward modeling as next-token prediction. arXiv preprint arXiv:2408.15240, 2024.

（第 25 页参考文献 10 条，条目保留原文。Magicoder 出现了两次（2023b 预印本和 2024 会议版），Qwen3 技术报告也出现了两次（2025a 和 2025b），都是同一个 arXiv 编号。正文里的 「Yu et al.」 没有年份，对应这里的 DAPO.）

<!-- page 26 of 26 -->

## A Appendix（附录）

Figure 5 present the full result of Leaderboard of LMSYS Chatbot Arena by May 18, 2025.

图 5 给出截至 2025 年 5 月 18 日 LMSYS Chatbot Arena 排行榜的完整结果。

| Rank*(UB) | Rank (StyleCtrl) | Model | Arena Score | 95% CI | Votes | Organizatio | License |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | 1 | Gemini-2..5-Pro-Preview-05-06 | 1446 | +8/-7 | 5696 | Google | Proprietary |
| 2 | 1 | o3-2025-04-16 | 1409 | +5/-8 | 7621 | OpenAI | Proprietary |
| 2 | 3 | ChatGPT-4o-latest_(2025-03-26). | 1405 | +6/-6 | 10284 | OpenAI | Proprietary |
| 2 | 5 | Grok-3-Preview-02-24 | 1399 | +4/-5 | 14845 | xAI | Proprietary |
| 4 | 3 | GPT-4..5-Preview | 1395 | +3/-5 | 15275 | OpenAI | Proprietary |
| 4 | 5 | Gemini-2..5-Flash-Preview-04-17 | 1389 | +8/-6 | 6622 | Google | Proprietary |
| 7 | 5 | DeepSeek-V3-0324 | 1369 | +5/-6 | 9404 | DeepSeek | MIT |
| 7 | 5 | GPT-4..1-2025-04-14 | 1365 | +7/-7 | 5778 | OpenAI | Proprietary |
| 7 | 13 | Hunyuan-Turbos-20250416 | 1356 | +7/-7 | 4863 | Tencent | Proprietary |
| 8 | 8 | DeepSeek-R1 | 1355 | +3/-4 | 19066 | DeepSeek | MIT |
| 9 | 16 | Gemini-2..0-Flash-001 | 1352 | +5/-4 | 24922 | Google | Proprietary |
| 9 | 5 | o4-mini-2025-04-16 | 1345 | +7/-9 | 5763 | OpenAI | Proprietary |
| 10 | 8 | o1-2024-12-17 | 1347 | +3/-3 | 29038 | OpenAI | Proprietary |
| 11 | 13 | Mistral_Medium_3 | 1339 | +10/-12 | 2838 | Mistral | Proprietary |
| 12 | 16 | Qwen3-235B-A22B | 1339 | +9/-8 | 4457 | Alibaba | Apache 2.0 |
| 13 | 16 | Gemma-3-27B-it | 1338 | +5/-5 | 12721 | Google | Gemma |
| 13 | 16 | Qwen2..5-Max | 1338 | +3/-4 | 23176 | Alibaba | Proprietary |
| 14 | 12 | o1-preview | 1332 | +3/-3 | 33173 | OpenAI | Proprietary |
| 16 | 22 | Qwen3-32B | 1325 | +8/-6 | 3662 | Alibaba | Apache 2.0 |
| 18 | 14 | GPT-4..1-mini-2025-04-14 | 1320 | +7/-8 | 5616 | OpenAI | Proprietary |
| 18 | 25 | Gemma-3-12B-it | 1318 | +9/-9 | 3593 | Google | Gemma |
| 19 | 16 | o3-mini-high | 1321 | +4/-5 | 19405 | OpenAI | Proprietary |
| 19 | 21 | DeepSeek-V3 | 1315 | +4/-3 | 22834 | DeepSeek | DeepSeek |
| 21 | 29 | QwQ-32B | 1310 | +5/-4 | 9941 | Alibaba | Apache 2.0 |
| 21 | 25 | Gemini-2..0-Flash-Lite | 1310 | +3/-4 | 25654 | Google | Proprietary |
| 21 | 28 | GLM-4-Plus-0111 | 1308 | +8/-5 | 6025 | Zhipu | Proprietary |
| 21 | 25 | Qwen-Plus-0125 | 1307 | +7/-7 | 6058 | Alibaba | Proprietary |
| 24 | 25 | Command_A_(03-2025). | 1302 | +6/-5 | 11208 | Cohere | CC-BY-NC-4.0 |
| 24 | 29 | Step-2-16K-Exp | 1301 | +7/-7 | 5128 | StepFun | Proprietary |
| 24 | 24 | Hunyuan-TurboS-20250226 | 1299 | +10/-10 | 2452 | Tencent | Proprietary |
| 25 | 25 | o3-mini | 1302 | +4/-4 | 24924 | OpenAI | Proprietary |
| 26 | 30 | o1-mini | 1301 | +2/-2 | 54959 | OpenAI | Proprietary |
| 26 | 10 | Claude_3..7_Sonnet (thinking-32k). | 1297 | +6/-5 | 12688 | Anthropic | Proprietary |
| 27 | 25 | Gemini-1..5-Pro-002 | 1299 | +2/-2 | 58636 | Google | Proprietary |
| 27 | 25 | Hunyuan-Turbo-0110 | 1293 | +8/-11 | 2511 | Tencent | Proprietary |
| 28 | 29 | Llama-3..3-Nemotron-Super-49B-v1 | 1293 | +7/-12 | 2368 | Nvidia | Nvidia |
| 33 | 13 | Claude_3..7_Sonnet | 1287 | +6/-3 | 18068 | Anthropic | Proprietary |

表：列为 Rank*(UB), Rank (StyleCtrl)，模型，Arena 分数，95% 置信区间，票数，机构（表头少了末尾的 n），许可证，共 37 行。前 27 行和表 3 的模型，分数，区间，票数一致，多了 StyleCtrl 排名和许可证两列。Hunyuan-Turbos-20250416 一行是 7 / 13, 1356, +7/-7, 4863, Tencent, Proprietary。另外两行混元：Hunyuan-TurboS-20250226 排 24 / 24, 1299，票数 2452；Hunyuan-Turbo-0110 排 27 / 25, 1293，票数 2511。模型名里 「2..5」，「4..1」 这类双点是识别噪声，原本是单点。Claude 3.7 Sonnet 有两行：thinking-32k 是 1297，不带括号的是 1287。

Figure 5: Full Leaderboard of LMSYS Chatbot Arena by May 18, 2025.

图 5：截至 2025 年 5 月 18 日的 LMSYS Chatbot Arena 完整排行榜。

26
