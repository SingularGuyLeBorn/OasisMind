---
title: "OLMo 2 · 对照译稿"
category: "模型库"
tags: ["OLMo", "对照译稿"]
published: true
excerpt: "OLMo 2 公开材料的逐段中英对照译稿，附读报告时的疑问块。"
---
<!-- page 1 of 58 -->

arXiv:2501.00656v3 [cs.CL] 8 Oct 2025

# 2 OLMo 2 Furious

**OLMo Team**

**Pete Walsh** <strong><sup>1</sup></strong> **Luca Soldaini** <strong><sup>1</sup></strong> **Dirk Groeneveld** <strong><sup>1</sup></strong> **Kyle Lo** <strong><sup>1</sup></strong>


**Shane Arora** <strong><sup>1</sup></strong> **Akshita Bhagia** <strong><sup>1</sup></strong> **Yuling Gu** <strong><sup>1</sup></strong> **Shengyi Huang** <strong><sup>1</sup></strong> **Matt Jordan** <strong><sup>1</sup></strong> **Nathan Lambert** <strong><sup>1</sup></strong> **Dustin Schwenk** <strong><sup>1</sup></strong> **Oyvind Tafjord** <strong><sup>1</sup></strong>


**Taira Anderson**<strong><sup>1</sup></strong> **David Atkinson**<strong><sup>1</sup></strong> **Faeze Brahman**<strong><sup>1</sup></strong> **Christopher Clark**<strong><sup>1</sup></strong> **Pradeep Dasigi**<strong><sup>1</sup></strong> **Nouha Dziri**<strong><sup>1</sup></strong> **Allyson Ettinger**<strong><sup>1</sup></strong> **Michal Guerquin**<strong><sup>1</sup></strong> **David Heineman**<strong><sup>1</sup></strong> **Hamish Ivison**<strong><sup>1,2</sup></strong> **Pang Wei Koh**<strong><sup>1,2</sup></strong> **Jiacheng Liu**<strong><sup>1,2</sup></strong> **Saumya Malik**<strong><sup>1</sup></strong> **William Merrill**<strong><sup>1,3</sup></strong> **Lester James V. Miranda**<strong><sup>1</sup></strong> **Jacob Morrison**<strong><sup>1</sup></strong> **Tyler Murray**<strong><sup>1</sup></strong> **Crystal Nam**<strong><sup>1</sup></strong> **Jake Poznanski**<strong><sup>1</sup></strong> **Valentina Pyatkin**<strong><sup>1,2</sup></strong> **Aman Rangapur**<strong><sup>1</sup></strong> **Michael Schmitz**<strong><sup>1</sup></strong> **Sam Skjonsberg**<strong><sup>1</sup></strong> **David Wadden**<strong><sup>1</sup></strong> **Christopher Wilhelm**<strong><sup>1</sup></strong> **Michael Wilson**<strong><sup>1</sup></strong> **Luke Zettlemoyer**<strong><sup>2</sup></strong>


**Ali Farhadi**<strong><sup>1,2</sup></strong> **Noah A. Smith** <strong><sup>1,2</sup></strong> **Hannaneh Hajishirzi** <strong><sup>1,2</sup></strong>


<sup>1</sup>Allen Institute for AI <sup>2</sup>University of Washington <sup>3</sup>New York University

OLMo 2 was a team effort. marks core contributors. See full author contributions here.


**OLMo 2 Base:** [OLMo-2-1124-7B](https://huggingface.co/allenai/OLMo-2-1124-7B) [OLMo-2-1124-13B](https://huggingface.co/allenai/OLMo-2-1124-13B) [OLMo-2-0325-32B](https://huggingface.co/allenai/OLMo-2-0325-32B) **OLMo 2 Instruct:** [7B-Instruct](https://huggingface.co/allenai/OLMo-2-1124-7B-Instruct) [13B-Instruct](https://huggingface.co/allenai/OLMo-2-1124-13B-Instruct) [32B-Instruct](https://huggingface.co/allenai/OLMo-2-0325-32B-Instruct)


**Base Data:** [olmo-mix-1124](https://huggingface.co/datasets/allenai/olmo-mix-1124) (pretrain) [dolmino-mix-1124](https://huggingface.co/datasets/allenai/dolmino-mix-1124) (midtrain) **Instruct Data:** SFT: [7B](https://huggingface.co/datasets/allenai/tulu-3-sft-olmo-2-mixture), [13B](https://huggingface.co/datasets/allenai/tulu-3-sft-olmo-2-mixture), [32B](https://huggingface.co/datasets/allenai/tulu-3-sft-olmo-2-mixture-0225) DPO: [7B](https://huggingface.co/datasets/allenai/olmo-2-1124-7b-preference-mix), [13B](https://huggingface.co/datasets/allenai/olmo-2-1124-13b-preference-mix), [32B](https://huggingface.co/datasets/allenai/olmo-2-0325-32b-preference-mix) [RLVR](https://huggingface.co/datasets/allenai/RLVR-GSM-MATH-IF-Mixed-Constraints)


**Training Code:** [OLMo](https://github.com/allenai/OLMo) (pretrain v1) [OLMo-core](https://github.com/allenai/OLMo-core) (pretrain v2) [open-instruct](https://github.com/allenai/open-instruct) (posttrain) **Eval & Data Code:** [olmes](https://github.com/allenai/olmes) (eval suite) [dolma](https://github.com/allenai/dolma) (data curation)


**Training Logs:** [7B](https://api.wandb.ai/links/ai2-llm/fjn0v0ec) [13B](https://api.wandb.ai/links/ai2-llm/ypmumwpc) [32B](https://www.comet.com/ai2/olmo-2-0325-32b/reports/olmo-2-0325-32b?shareable=WhT37Wy7jqttDoy6ysDBumQzf)


**Demo:** [playground.allenai.org](https://playground.allenai.org/)


**Contact:** olmo@allenai.org

## Abstract

![Image block](images/p01-we-present-olmo-2-the-next-generation-of-our-fully-open.png)

We present OLMo 2, the next generation of our fully open language models. OLMo 2 includes a family of dense autoregressive language models at 7B, 13B and 32B scales with fully released artifacts—model weights, full training data, training code and recipes, training logs and thousands of intermediate checkpoints. In this work, we describe our modified model architecture and training recipe, focusing on techniques for achieving better training stability and improved per-token efficiency. Our updated pretraining data mixture introduces a new, specialized data mix called Dolmino Mix 1124, which significantly improves model capabilities across many downstream task benchmarks when introduced via late-stage curriculum training (i.e. specialized data during the annealing phase of pretraining). Finally, we incorporate best practices from Tülu 3 to develop OLMo 2-Instruct, focusing on permissive data and extending our final-stage reinforcement learning with verifiable rewards (RLVR). Our OLMo 2 base models sit at the Pareto frontier of performance to training compute, often matching or outperforming open-weight only models like Llama 3.1, Qwen 2.5, and Gemma 2 while using fewer FLOPs and with fully transparent training data, code, and recipe. Our fully open OLMo 2-Instruct models are competitive with open-weight only models of comparable size and even some proprietary models like GPT-3.5 Turbo and GPT 4o Mini.

我们推出 OLMo 2，作为完全开放语言模型的下一代。家族覆盖 7B，13B 与 32B 的 dense 自回归模型，并完整公开产物：权重，全量训练数据，训练代码与配方，训练日志，以及数千个中间检查点。本文说明修改后的架构与训练配方，重点写训练稳定性与每 token 效率。更新后的预训练混合引入专用集 Dolmino Mix 1124；经后期课程（预训练退火阶段的专用数据）注入后，多项下游基准显著抬升。后训练侧吸收 Tulu 3 的做法得到 OLMo 2-Instruct，强调宽松许可数据，并把末段可验证奖励强化学习（RLVR）扩成多阶段。OLMo 2 基座落在性能对训练算力的 Pareto 前沿，常以更少 FLOPs 追平或超过 Llama 3.1，Qwen 2.5，Gemma 2 等仅开放权重模型，同时数据 / 代码 / 配方全透明。完全开放的 OLMo 2-Instruct 与同档开源指令模型以及部分专有模型（如 GPT-3.5 Turbo, GPT 4o Mini）具有竞争力。

<!-- page 2 of 58 -->

## Contents

- 1 Introduction 3
- 2 OLMo 2 Family 4
  - 2.1 Model Architecture 4
  - 2.2 Tokenizer 5
  - 2.3 Base Model Training Recipe 6
  - 2.4 Base Model Data 7
  - 2.5 Evaluation and Results 8
- 3 Deep Dive: Pretraining Stability 10
  - 3.1 Repeated n-Grams 12
  - 3.2 Model Initialization 13
  - 3.3 Architecture Improvements 15
  - 3.4 Hyperparameter Improvements 17
- 4 Deep Dive: Mid-training Recipe 18
  - 4.1 Learning rate annealing 18
  - 4.2 Data Curriculum: Dolmino Mix 1124 19
  - 4.3 Dolmino Mix 1124: High Quality Sources 20
  - 4.4 Dolmino Mix 1124: Math Mix 23
  - 4.5 Final Midtraining mix and Checkpoint Soups 25
- 5 Deep Dive: Post-training Pipeline 26
- 6 Deep Dive: Infrastructure as a Research Catalyst 30
  - 6.1 Clusters 31
  - 6.2 Beaker 32
  - 6.3 Stability and Operations 33
  - 6.4 Maximizing hardware utilization 33
  - 6.5 Environmental Impact 35
- A OLMo 2 Evaluation Framework 48
  - A.1 Base Model Eval 48
  - A.2 Instruct Model Eval 49
- B OLMo 2 1B 49
  - B.1 Difficulties with OLMo 2 1B 49
- C Additional Instruct Details 52
  - C.1 Additional Hyperparameters 52
  - C.2 Additional RLVR Learning Curves 52
  - C.3 OLMo 2-Instruct Preview Models 52
- D Additional Hyperparameters 56
- E Annealing Data Details 58

- 1 Introduction 3
- 2 OLMo 2 家族 4
  - 2.1 模型架构 4
  - 2.2 分词器 5
  - 2.3 基座训练配方 6
  - 2.4 基座数据 7
  - 2.5 评测与结果 8
- 3 深挖：预训练稳定性 10
  - 3.1 重复 n-gram 12
  - 3.2 模型初始化 13
  - 3.3 架构改进 15
  - 3.4 超参改进 17
- 4 深挖：Mid-training 配方 18
  - 4.1 学习率退火 18
  - 4.2 数据课程：Dolmino Mix 1124 19
  - 4.3 Dolmino Mix 1124：高质量源 20
  - 4.4 Dolmino Mix 1124：数学混合 23
  - 4.5 最终 Mid-training 混合与 Checkpoint Soup 25
- 5 深挖：后训练流水线 26
- 6 深挖：基础设施作为研究催化剂 30
  - 6.1 集群 31
  - 6.2 Beaker 32
  - 6.3 稳定性与运维 33
  - 6.4 拉高硬件利用率 33
  - 6.5 环境影响 35
- A OLMo 2 评测框架 48
  - A.1 基座评测 48
  - A.2 Instruct 评测 49
- B OLMo 2 1B 49
  - B.1 OLMo 2 1B 的困难 49
- C Instruct 补充细节 52
  - C.1 额外超参 52
  - C.2 额外 RLVR 学习曲线 52
  - C.3 OLMo 2-Instruct Preview 52
- D 额外超参 56
- E 退火数据细节 58



<!-- page 3 of 58 -->

![Chart block](images/p03-figure-1-performance-to-pretraining-flops-6-training.png)

Figure 1 Performance to pretraining FLOPs (≈ 6 × training tokens × model size; Kaplan et al., 2020) for OLMo 2 and comparable models. We see that the fully open OLMo 2 lies on the Pareto frontier, outperforming many other models of varying levels of openness at multiple sizes. For full results, see Table 6.

图 1｜OLMo 2 与对照模型的性能对预训练 FLOPs（约 6 × 训练 token × 模型规模；Kaplan et al., 2020）。完全开放的 OLMo 2 落在 Pareto 前沿。完整分数见 Table 6。

## Introduction

The open language model ecosystem has grown rapidly in the past year. We’ve seen a surge in open weights models from established developers—Llama 3 (Grattafiori et al., 2024), DBRX (Databricks, 2024), Yi 1.5 (Young et al., 2024), Qwen 2 (Yang et al., 2024a), Falcon (TII, 2024a,b), Mistral (Mistral, 2024a), Ministral (Mistral, 2024b), Phi (Abdin et al., 2024a,b)— and new contributors— Gemma (Gemma Team et al., 2024a,b; Team et al., 2025), Grok (X.AI, 2023), Command R (Cohere, 2024a,c,b) —substantially closing the gap between publicly available and closed systems (Cottier et al., 2024). Yet, these open-weights models are only the final artifacts of sophisticated language model recipes and complex development pipelines, and by themselves are not sufficient to support diverse forms of research into language model behaviors and uses.

开放语言模型生态系统在过去一年中发展迅速。我们见证了来自成熟开发者 -- Llama 3 (Grattafiori et al., 2024), DBRX (Databricks, 2024), Yi 1.5 (Young et al., 2024), Qwen 2 (Yang et al., 2024a), Falcon (TII, 2024a,b), Mistral (Mistral, 2024a), Ministral (Mistral, 2024b), Phi (Abdin et al., 2024a,b) -- 和新贡献者 -- Gemma (Gemma Team et al., 2024a,b; Team et al., 2025), Grok (X.AI, 2023), Command R (Cohere, 2024a,c,b) -- 的开放权重模型激增，大幅缩小了公开可用与封闭系统之间的差距（Cottier et al., 2024）。然而，这些开放权重模型仅仅是复杂语言模型配方和复杂开发流水线的最终产物，仅凭它们本身不足以支持对语言模型行为和用途的多样化研究。

In response, prior works including our first OLMo (Groeneveld et al., 2024), Pythia (Biderman et al., 2023), Amber (Liu et al., 2023c), DCLM (Li et al., 2024), MAP Neo (Zhang et al., 2024a) and SmolLM (Allal et al., 2024a,b) have adopted a fully open approach, releasing not just model weights but also training data, training code and well-documented recipes to support reproduction. Artifacts from fully open language modeling efforts have played a crucial role in studying training dynamics (Land and Bartolo, 2024; Jin and Ren, 2024), concept acquisition (Chang et al., 2024), and memorization (Antoniades et al., 2024; Shaib et al., 2024) in language models. Despite these developments, a gap remains between the models with the best reported performance and that of open models.

作为回应，包括我们的首个 OLMo (Groeneveld et al., 2024), Pythia (Biderman et al., 2023), Amber (Liu et al., 2023c), DCLM (Li et al., 2024), MAP Neo (Zhang et al., 2024a) 和 SmolLM (Allal et al., 2024a,b) 在内的先前工作采取了完全开放的方法，不仅发布模型权重，还发布训练数据，训练代码和文档化的配方以支持复现。完全开放语言建模工作的产物在研究训练动态（Land and Bartolo, 2024; Jin and Ren, 2024），概念获取（Chang et al., 2024）和记忆化（Antoniades et al., 2024; Shaib et al., 2024）方面发挥了关键作用。尽管有这些进展，最佳报告性能的模型与开放模型之间仍然存在差距。

Modern language model development is an iterative process, whereby limitations of current iterations motivate future development. Our previous release (OLMo-0424; Ai2, 2024) focused on improving performance on key tasks (e.g., MMLU) through better pretraining data mixing and curricula. In this technical report, we introduce **OLMo 2**, a new family of 7B, 13B and 32B models trained on up to 6T tokens. On English academic benchmarks, these models are competitive with the open weight Llama 3.1, Qwen 2.5, and Gemma 2 families of models (Figure 1). We further validate our pretrained model is an effective base model for downstream post-training by applying our Tülu 3 recipe (Lambert et al., 2024). The resulting family of models, called OLMo 2-Instruct, are competitive with powerful open-weights only models and even some popular proprietary models like GPT-3.5 Turbo and GPT 4o Mini. This technical report focuses on **four key**

现代语言模型开发是一个迭代过程，当前迭代的局限性 推动未来的发展。我们的先前发布（OLMo-0424; Ai2, 2024）专注于通过更好的预训练数据混合和课程来提高关键任务（如 MMLU）上的性能。在本技术报告中，我们介绍 OLMo 2，一个在多达 6T token 上训练的 7B，13B 和 32B 模型新家族。在英语学术基准上，这些模型与开放权重 Llama 3.1，Qwen 2.5 和 Gemma 2 家族具有竞争力（图 1）。我们通过应用 Tulu 3 配方（Lambert et al., 2024）进一步验证预训练模型作为下游后训练有效基座模型的能力。由此产生的模型家族，称为 OLMo 2-Instruct，与强大的仅开放权重模型甚至一些流行的专有模型（如 GPT-3.5 Turbo 和 GPT 4o Mini）具有竞争力。本技术报告聚焦于我们在 OLMo 2 开发期间针对的四个关键领域：

<!-- page 4 of 58 -->

**areas** we targeted during development of OLMo 2:

• **Pretraining Stability.** Language model training runs are often training instabilities and loss spikes, which are costly and known to be a detriment to final model performance. We discuss techniques we used to improve training stability, which was critical to ensuring performance of the final trained model (Section §3).

- 预训练稳定性。语言模型训练运行经常 训练不稳定性和 loss spikes，这些代价高昂且已知会对最终模型性能产生不利影响。我们讨论了我们用来提高训练稳定性的技术，这对于确保最终训练模型的性能至关重要（第 3 节）。

• **Mid-training Recipe.** OLMo-0424 (Ai2, 2024), DBRX (Databricks, 2024), and Llama 3 (Grattafiori et al., 2024) demonstrated the usefulness of data curricula for pretraining, as discussed by Blakeney et al. (2024). We discuss the advantages of splitting pretraining into two stages, with the latter mid-training stage being used to infuse new knowledge and patch deficiencies in capabilities. Further, we show how data sources for mid-training can be independently assessed to reduce experimentation cost through a technique we call micro-annealing (Section §4).

- 中期训练配方。OLMo-0424 (Ai2, 2024), DBRX (Databricks, 2024) 和 Llama 3 (Grattafiori et al., 2024) 展示了数据课程对预训练的有用性，如 Blakeney et al. (2024) 所讨论。我们讨论了将预训练分为两个阶段的优势，后者中期训练阶段用于注入新知识和修补能力缺陷。此外，我们展示了如何通过我们称为 micro-annealing 的技术独立评估中期训练的数据源，以降低实验成本（第 4 节）。

• **Post-training Pipeline.** A key deliverable for a successful base model is its ability to be finetuned to downstream use-cases. We introduce OLMo 2-Instruct built on the Tülu 3 recipe (Lambert et al., 2024), and show how improvements in base models translated to better chat variants. We focus on permissive data and expand the reinforcement learning with verifiable rewards (RLVR) pipeline to multiple stages for maximum performance (Section §5).

- 后训练流水线。成功基座模型的一个关键交付物是其能够被微调到下游用例的能力。我们介绍基于 Tulu 3 配方（Lambert et al., 2024）构建的 OLMo 2-Instruct，并展示基座模型的改进如何转化为更好的聊天变体。我们重点关注宽松数据，并将可验证奖励强化学习（RLVR）流水线扩展到多个阶段以实现最大性能（第 5 节）。

• **Infrastructure as a Research Catalyst.** High performance and reliable infrastructure is crucial for successful pretraining；yet，many pretraining papers do not discuss their training stack，or 略过crucial details. We discuss changes from OLMo-0424 that enable the improvements of OLMo 2, and how investing in solutions that let us monitor and orchestrate infrastructure helped us reduce failure rates and increase cluster utilization (Section §6).

- 基础设施作为研究催化剂。高性能和可靠的基础设施对成功预训练至关重要；然而，许多预训练论文不讨论它们的训练栈，或 略过关键细节。我们讨论了从 OLMo-0424 到 OLMo 2 的改进所依赖的变化，以及投资让我们能够监控和编排基础设施的解决方案如何帮助我们降低故障率和提高集群利用率（第 6 节）。

Alongside these deep dives, we provide a description of the full model development procedure in Section §2: training data, pretraining, post-training, and evaluation. We highlight changes from OLMo 1 and OLMo-0424 when appropriate, and reference related projects, such as our scaling laws effort to efficiently estimate model downstream performance (Bhagia et al., 2024) and benchmark standardization through the OLMES evaluation framework (Gu et al., 2024).

alongside 这些深度探讨，我们在第 2 节提供了完整模型开发过程的描述：训练数据，预训练，后训练和评估。我们在适当的时候强调与 OLMo 1 和 OLMo-0424 的变化，并引用相关项目，如我们用于高效估计模型下游性能的缩放定律工作（Bhagia et al., 2024）和通过 OLMES 评估框架实现基准标准化（Gu et al., 2024）。

## 2 OLMo 2 Family 2 OLMo 2 家族

This section provides an overview of OLMo 2 and highlights improvements over OLMo-0424 and previous OLMo models . The OLMo 2 family has more tokens, more parameters, and has better downstream task results compared to OLMo-0424. We explain the crucial details required to achieve competitive results in our mission of making state-of-the-art language models accessible. Accordingly, we release all training code, data, and recipes openly under the Apache 2.0 license wherever possible, and under the most permissive available license otherwise.

本节对 OLMo 2 进行概述，并强调其相较于 OLMo-0424 及此前 OLMo 模型的改进。OLMo 2 家族在训练 token 数，参数量和下游任务结果上均优于 OLMo-0424。我们解释了在追求「让最先进的语言模型触手可及」这一目标时，取得有竞争力结果所需的关键细节。为此，我们在可能的情况下以 Apache 2.0 许可证公开所有训练代码，数据和配方，否则采用最宽松的可用许可证。

### 2.1 Model Architecture 2.1 模型架构

Table 1 provides an overview of how the model architecture has evolved through iterations in the OLMo family. We provide details below:

表 1｜provides an overview of how the model architecture has evolved through iterations in the OLMo family. We provide details below:

We adopt a decoder-only transformer architecture based on Vaswani et al. (2017), and deliver 7B, 13B and 32B parameter variants as described in Table 3. Our architecture is very similar to the first iteration of OLMo (Groeneveld et al., 2024), with several changes to improve training stability (see Section §3) and performance. The original OLMo modified the decoder-only transformer architecture (Vaswani et al., 2017) with:

我们采用基于 Vaswani 等人（2017）的仅解码器（decoder-only）Transformer 架构，并提供了 7B，13B 和 32B 三种参数规模的变体，详见表 3。我们的架构与 OLMo 第一版（Groeneveld et al., 2024）非常相似，但做了若干修改以提升训练稳定性（见第 3 节）和性能。

• **No biases:** We exclude all bias terms from our architecture (Groeneveld et al., 2024; Chowdhery et al., 2022, inter alia).

- **无偏置项（No biases）**：我们从架构中移除了所有偏置项（Groeneveld et al.，2024；Chowdhery et al.，2022 等）。

• **SwiGLU activation function:** We use the SwiGLU activation function (Shazeer, 2020) and set the corresponding hidden size to approximately $\frac { 8 } { 3 } d ,$ but increased to the closest multiple of 128 (11, 008 for our 7B

- **SwiGLU 激活函数**：我们使用 SwiGLU 激活函数（Shazeer, 2020），并将对应的隐藏层维度设为约 $\frac{8}{3}d$，但向上取整到最接近的 128 的倍数（7B 模型为 11,008），以提升吞吐量。

<small><span class="docvortex-page-footnote" data-block-type="page_footnote" style="color:#6b7280"><sup>1</sup>Model architecture changes over OLMo 1 and OLMo-0424 are described in Section §2.1; for an overview of data and training recipes, see Groeneveld et al. (2024) and Ai2 (2024) respectively.</span></small>

<!-- page 5 of 58 -->

|  | OLMo 1 (0224) | OLMo-0424 | OLMo 2 |
| --- | --- | --- | --- |
| Biases | None | None | None |
| Activation | SwiGLU | SwiGLU | SwiGLU |
| RoPE θ | 1 ⋅ 10<sup>4</sup> | 1 ⋅ 10<sup>4</sup> | 5 ⋅ 10<sup>5</sup> |
| QKV Normalization | None | Clip to 8 | QK-Norm |
| Layer Norm | non-parametric | non-parametric | RMSNorm |
| Layer Norm Applied to | Inputs | Inputs | Outputs |
| Z-Loss Weight | 0 | 0 | 10<sup>-5</sup> |
| Weight Decay on Embeddings | Yes | Yes | No |

Table 1 Summary of how OLMo family model architectures have evolved over time. Latest OLMo 2 changes were motivated by experiments showing improved training stability. Full descriptions in §2.1.

表 1｜OLMo 家族架构演变摘要。最新 OLMo 2 改动由稳定性实验驱动。详见 §2.1。

> **想：** Table 1 里 Layer Norm Applied to 从 Inputs 改成 Outputs，和式（1）（2）的重排是不是同一件事？
> 是同一架构选择的两面。Table 1 写 Outputs；§2.1 式（1）（2）把 RMSNorm 放到 Attention / MLP 输出上。文献里说的 reordered residual，对应的就是这张表的 Outputs 行。


model) to improve throughput.

• **Rotary positional embeddings (RoPE):** We replace absolute positional embeddings with rotary positional embeddings (RoPE; Su et al., 2021).

- **旋转位置编码（RoPE, Rotary Positional Embeddings）**：我们将绝对位置编码替换为旋转位置编码（RoPE; Su et al., 2021）。

When building OLMo-0424, we made modifications for training stability and downstream performance:

在构建 OLMo-0424 时，我们针对训练稳定性和下游任务性能做了如下修改：

• **QKV Clipping:** For training stability, also as seen in DBRX (Databricks, 2024).

- **QKV 裁剪（QKV Clipping）**：出于训练稳定性考虑，与 DBRX (Databricks, 2024) 采用相同策略。

• **Increased context:** From 2048 to 4096.

Finally, this work introduces OLMo 2 which made further modifications:

最后，本文提出的 OLMo 2 做了进一步的修改：

• **RMSNorm:** We use the RMSNorm (Zhang and Sennrich, 2019) variant of LayerNorm (Ba et al., 2016) without a bias term to normalize activations, instead of nonparametric LayerNorm.

- **RMSNorm**：我们使用 RMSNorm (Zhang and Sennrich, 2019) 替代非参数化的 LayerNorm (Ba et al., 2016) 来归一化激活值，且不使用偏置项。

• **Reordered norm:** We normalize the outputs to the attention and feedforward (MLP) layers within each transformer block, instead of the inputs. So the formula for each block becomes:

- **重排序归一化**：我们在每个 Transformer 块中对注意力层和前馈层（MLP）的输出进行归一化，而非输入（§3.3.2）。

$$
\boldsymbol {h} := \boldsymbol {x} + \text {RMSNorm} (\text {Attention} (\boldsymbol {x}))\tag{1}
$$

$$
\boldsymbol {h} _ {\mathrm{out}} := \boldsymbol {h} + \operatorname{RMSNorm} (\operatorname{MLP} (\boldsymbol {x}))\tag{2}
$$

where x is the input to the layer, h is an intermediate hidden state, and $h _ { \mathrm { o u t } }$ is the output. This strategy was first proposed by Liu et al. (2021) to stabilize training.


• **QK-norm:** Following Dehghani et al. (2023b) we normalize the key and query projections with RMSNorm before calculating attention. This avoids attention logits being too large, which can lead to training loss divergence.

- **QK-归一化（QK-norm）**：遵循 Dehghani 等人（2023b），我们在计算注意力之前用 RMSNorm 对 Key 和 Query 的投影进行归一化。这避免了注意力 Logit 值过大，从而防止训练损失发散。

• **Z-Loss:** Following Chowdhery et al. (2022), Chameleon Team (2024), and Wortsman et al. (2023), we adopt z-loss regularization, as it has been empirically shown to improve run stability.

- **Z-Loss**：遵循 Chowdhery 等人（2022），Chameleon Team (2024) 和 Wortsman 等人（2023），我们采用了 z-loss 正则化，因为已有实验表明它能提升训练运行的稳定性。

• **RoPE** θ = 5e5: We increase the RoPE θ to 500,000 from 10,000. This approach increases the resolution of positional encoding, matching Grattafiori et al. (2024).

RoPE θ 提到 500,000（原 10,000），提高位置编码分辨率，与 Grattafiori et al. (2024) 对齐。


### 2.2 Tokenizer 2.2 分词器

OLMo 1 and OLMo-0424 were trained using a modified version of the GPT-NeoX-20B tokenizer (Black et al., 2022) that includes special tokens |||PHONE\_NUMBER|||, |||EMAIL\_ADDRESS|||, and |||IP\_ADDRESS|||, which were used to mask personal identifiable information.

OLMo 1 和 OLMo-0424 使用的是 GPT-NeoX-20B 分词器（Black et al., 2022）的修改版本，该版本包含特殊词元 `|||PHONE_NUMBER|||`，`|||EMAIL_ADDRESS|||` 和 `|||IP_ADDRESS|||`，用于掩码个人可识别信息。

As suggested by Tao et al. (2024), we employ a larger tokenizer vocabulary for OLMo 2. We borrow pre-tokenizer and vocabulary from cl100k, the tokenizer developed for GPT-3.5 (OpenAI, 2023a) and GPT-4 (OpenAI, 2023b), which is licensed under Apache $2 . 0 ^ { 2 }$ . To maintain backwards compatibility with early

遵循 Tao 等人（2024）的建议，OLMo 2 采用了更大的分词器词表。我们借用了为 GPT-3.5 (OpenAI, 2023a) 和 GPT-4 (OpenAI, 2023b) 开发的 cl100k 分词器的预分词器和词表，该分词器以 Apache 2.0 许可证发布。为了保持与早期 Dolma 数据源的向后兼容性，我们保留了此前 OLMo 模型中使用的相同掩码词元。

<small><span class="docvortex-page-footnote" data-block-type="page_footnote" style="color:#6b7280">2 [github.com/openai/tiktoken/issues/92](https://github.com/openai/tiktoken/issues/92)</span></small>

<!-- page 6 of 58 -->

Dolma data sources, we add the same masking tokens used in previous OLMo models.

为兼容早期 Dolma 数据源，仍加入与先前 OLMo 相同的脱敏 masking token。


| Tokenizer | OLMES (CF) | OLMES Gen | MMLU (CF) |
| --- | --- | --- | --- |
| OLMo 1 tokenizer | 59.8 | 42.4 | 34.8 |
| OLMo 2 tokenizer | 60.6 | 42.7 | 35.2 |

Table 2 Comparison of OLMo 1 and OLMo 2 tokenizers on a 1B model pretrained for 100B tokens from DCLM baseline. Following Gu et al. (2024), OLMES and MMLU use CF format, which is more informative for small models.

表 2｜Comparison of OLMo 1 and OLMo 2 tokenizers on a 1B model pretrained for 100B tokens from DCLM baseline. Following Gu et al. (2024), OLMES and MMLU use CF format, which is more info

> **看表：** Table 2 在 1B / 100B token 上 OLMES (CF) 59.8→60.6，作者为何说大词表此刻还略吃亏？
> 正文引 Tao et al. (2024)：在该模型规模与算力预算下，更大词表略吃亏；他们预期更大模型与更多 token 时收益更明显。表内增益是可测的，但作者没把小档增益说成词表已充分兑现。


We compare the two tokenizers at a smaller scale in Table 2. We see measurable gains when switching to the new tokenizer, particularly in OLMES tasks. Per Tao et al. (2024), at this model size and compute budget, the larger OLMo 2 tokenizer is at a slight disadvantage; we expect improvement coming from larger vocabulary to be more decisive at larger scales and for models trained on more tokens.

我们在表 2 中以较小规模比较了两种分词器。可以看到，切换到新分词器带来了可测量的性能提升，尤其在 OLMES 任务上。根据 Tao 等人（2024），在当前模型规模和计算预算下，更大的 OLMo 2 分词器其实处于轻微劣势；我们预期，更大词表带来的改进在更大规模和更多 token 训练的模型上会更加显著。

### 2.3 Base Model Training Recipe 2.3 基座训练配方

Following previous OLMo models, as well as recent advances in curriculum learning (Blakeney et al., 2024; Ibrahim et al., 2024), base OLMo 2 models are trained in **two stages** each with its corresponding data mix. The first pretraining stage is the longest (⩾ 90% training FLOPs), and uses mostly web-sourced data. In this stage, we use an iteration on our pretraining mix of high-quality web data drawing on other recent open data releases. During the second stage, which we refer to as mid-training (5–10% of training FLOPs), we up-sample the highest-quality web documents and curated non-web sources; we also employ synthetic data crafted to patch math capabilities of the model.

遵循此前 OLMo 模型的做法，以及课程学习（curriculum learning）的最新进展（Blakeney et al., 2024; Ibrahim et al., 2024），OLMo 2 基础模型分两个阶段训练，每个阶段使用对应的数据混合配方。第一阶段的预训练（pretraining）时间最长（占训练 FLOPs 的 90% 以上），主要使用网络来源的数据。在此阶段，我们基于近期其他开放数据发布，迭代优化了高质量网页数据的预训练混合配方。第二阶段称为中期训练（mid-training，占训练 FLOPs 的 5-10%），我们对最高质量的网页文档和精选的非网络来源数据进行上采样；同时还使用合成数据来弥补模型的数学能力短板。

|  | OLMo 2 7B | OLMo 2 13B | OLMo 2 32B |
| --- | --- | --- | --- |
| Layers | 32 | 40 | 64 |
| Hidden Size (d<sub>model</sub>) | 4096 | 5120 | 5120 |
| Attention Heads (Q/KV) | 32/32 (MHA) | 40/40 (MHA) | 40/8 (GQA) |
| Batch Size | 1024 | 2048 | 2048 |
| Sequence Length | 4096 | 4096 | 4096 |
| Gradient Clipping | 1.0 | 1.0 | 1.0 |
| Peak LR | 3.0 ⋅ 10<sup>-4</sup> | 9.0 ⋅ 10<sup>-4</sup> | 6.0 ⋅ 10<sup>-4</sup> |
| LR Warmup | 2000 steps | 2000 steps | 2000 steps |
| LR Schedule (Cosine) | 5T tokens | 5T tokens | 6.5T tokens |
| LR Schedule Truncation | (after 4T) | n/a | after 6T |

Table 3 OLMo 2 hyperparameters.

表 3｜OLMo 2 hyperparameters。

> **核对：** Table 3 里 32B 的 Attention Heads 写成 40/8 (GQA)，7B/13B 却是 MHA，这是不是只改 32B?
> 是。§2.3 写明为缩放 32B 才切到 GQA，灵感来自同期 Qwen 3. 7B 与 13B 仍是 Q/KV 等头的 MHA. 7B/13B 仍是 MHA，不要外推成全家标配。


**Stage 1: Pretraining** The first stage—pretraining—is the longest (90–95% of training FLOPs). We report key architecture and training details in Table 3. Key details include our switch from multi-head attention (MHA) to grouped query attention (GQA) (Ainslie et al., 2023) to scale the 32B model, inspired by its use in concurrent work Qwen 3 (Yang et al., 2025). OLMo 2 training used random initialization from a truncated normal distribution with a mean of 0 and a standard deviation of 0.02 and a learning rate schedule that warms up the learning rate from 0 to the peak learning rate over 2000 steps, followed by a cosine decay calibrated to reach 10% of the peak learning rate after a specified max tokens.

**第一阶段：预训练**

**Stage 2: Mid-training** We refer to the shorter second stage as mid-training (5–10% of training FLOPs), where we linearly decay the learning rate to zero over the remaining length of the run.

**第二阶段：中期训练**

<small><span class="docvortex-page-footnote" data-block-type="page_footnote" style="color:#6b7280">3Specifically, these tokens such as |||IP\_ADDRESS||| appear in early subsets of Dolma dataset. We opt to keep them in vocabulary so that, if tokenizing any of these older sources, they will not get split into multiple tokens.</span></small>

<small><span class="docvortex-page-footnote" data-block-type="page_footnote" style="color:#6b7280"><sup>4</sup>While the concept of multiple stages of self-supervised training is not new (e.g., Gururangan et al. 2020), we adopt the term mid-training from Abdin et al. (2024a) and OpenAI (2024).</span></small>

<!-- page 7 of 58 -->

We curated a smaller, focused mixture—**Dolmino Mix 1124**—to imbue the model with domain knowledge from increased exposure to STEM references and high quality text as well as skills that remained lacking after the initial pretraining stage (e.g. math-solving capabilities). We up-sample high-quality web documents and curated non-web sources; we also employ synthetic data crafted to patch math capabilities of the model.

文中把后期课程阶段的专用混合称为 Dolmino Mix 1124；在预训练退火阶段注入后，多项下游基准显著抬升。

**Model Merging or ‘‘Souping’’** To get the most out of this high-quality data, and to find a better local minimum, we perform this step multiple times with different random data orders, and then average the resulting models (Matena and Raffel, 2022; Wortsman et al., 2022). For OLMo 2 7B, we anneal three separate times for 50B tokens each, with different randomized data orders; we average the resulting models to produce the final model. For both OLMo 2 13B and OLMo 2 32B, we train three separate times for 100B tokens each (same number of update steps as the 7B), and then a fourth time for 300B tokens. The final model is the average of all four models. For further details, refer to Section §4.

**模型合并（Model Merging）或「汤化（Souping）」**

> **回看：** 7B 三次 50B 再平均，13B/32B 三次 100B 加一次 300B 再平均，soup 的权重是均匀平均吗？
> §2.3：最终模型是这些独立退火检查点的平均（souping）。正文描述为 average / average of all four models，没有另给非均匀权重表。随机数据顺序不同，但合并写法是均匀平均。


**Overall** In total, OLMo 2 7B is trained on 4.05 trillion tokens (3.90 trillion for pretraining stage), OLMo 2 13B is trained on 5.6 trillion tokens (5 trillion for pretraining stage), and OLMo 2 32B is trained on 6.6 trillion tokens (6.06 trillion for pretraining stage).

**总体情况**

### 2.4 Base Model Data 2.4 基座数据

We provide a brief overview of the data mix for pretraining and mid-training in this section.

本节简要概述预训练和中期训练的数据混合配方。

#### 2.4.1 Pretraining data: OLMo 2 Mix 1124 2.4.1 预训练数据：OLMo 2 Mix 1124

<table><tr><td>Source</td><td>Type</td><td>Tokens</td><td>Words</td><td>Bytes</td><td>Docs</td></tr><tr><td colspan="6">Pretraining ◆ OLMo 2 1124 Mix</td></tr><tr><td>DCLM-Baseline</td><td>Web pages</td><td>3.71T</td><td>3.32T</td><td>21.32T</td><td>2.95B</td></tr><tr><td>StarCoder filtered version from OLMoE Mix</td><td>Code</td><td>83.0B</td><td>70.0B</td><td>459B</td><td>78.7M</td></tr><tr><td>peS2o from Dolma 1.7</td><td>Academic papers</td><td>58.6B</td><td>51.1B</td><td>413B</td><td>38.8M</td></tr><tr><td>arXiv</td><td>STEM papers</td><td>20.8B</td><td>19.3B</td><td>77.2B</td><td>3.95M</td></tr><tr><td>OpenWebMath</td><td>Math web pages</td><td>12.2B</td><td>11.1B</td><td>47.2B</td><td>2.89M</td></tr><tr><td>Algebraic Stack</td><td>Math proofs code</td><td>11.8B</td><td>10.8B</td><td>44.0B</td><td>2.83M</td></tr><tr><td>Wikipedia &amp; Wikibooks from Dolma 1.7</td><td>Encyclopedic</td><td>3.7B</td><td>3.16B</td><td>16.2B</td><td>6.17M</td></tr><tr><td>Total</td><td></td><td>3.90T</td><td>3.48T</td><td>22.38T</td><td>3.08B</td></tr></table>

Table 4 Composition of the pretraining data for OLMo 2. The OLMo 2 1124 Mix is composed of StarCoder (Li et al., 2023b; Kocetkov et al., 2022), peS2o (Soldaini and Lo, 2023), web text from DCLM (Li et al., 2024) and Wiki come from Dolma 1.7 (Soldaini et al., 2024). arXiv comes from Red-Pajama (Together AI, 2023), while OpenWebMath (Paster et al., 2023) and Algebraic Stack come from ProofPile II (Azerbayev et al., 2023).

表 4｜Composition of the pretraining data for OLMo 2. The OLMo 2 1124 Mix is composed of StarCoder (Li et al., 2023b; Kocetkov et al., 2022), peS2o (Soldaini and Lo, 2023), web text from

> **问：** Table 4 总计 3.90T token，其中 DCLM-Baseline 3.71T，是不是 mid-training 也算进这 3.90T?
> 不算。Table 4 是 Stage 1 的 OLMo 2 Mix 1124. Mid-training 另见 Table 5 的 Dolmino. §2.3 还写 7B 预训练阶段约 3.90T，全流程 4.05T。


The mix used for this stage is shown in Table 4. It consists of approximately 3.9 trillion tokens, with over 95% derived from web data. We refer to this set as OLMo 2 Mix 1124. This is the same pretraining data used in OLMoE (Muennighoff et al., 2024): We combine data from DCLM (Li et al., 2024) and Dolma 1.7 (Soldaini et al., 2024). From DCLM, we use the “baseline 1.0 ” mix. From Dolma, we use the arXiv (Together AI, 2023), OpenWebMath (Paster et al., 2023), Algebraic Stack, peS2o (Soldaini and Lo, 2023), and Wikipedia subsets. arXiv, OpenWebMath, and Algebraic Stack were originally part of ProofPile II (Azerbayev et al., 2023). Finally, we include code from StarCoder (Li et al., 2023b), which is derived from permissively-licensed repositories from GitHub (Kocetkov et al., 2022). In an attempt to include higher quality code, we remove any document from a repository with fewer than 2 stars on GitHub. Further, through manual inspection of this source, we found it to contain documents encoded in binary format or containing mostly numerical

此阶段使用的数据混合配方如表 4 所示。它包含约 3.9 万亿 token，其中超过 95% 来自网页数据。我们将该数据集称为 OLMo 2 Mix 1124。这与 OLMoE (Muennighoff et al., 2024) 使用的预训练数据相同：我们结合了来自 DCLM (Li et al., 2024) 和 Dolma 1.7 (Soldaini et al., 2024) 的数据。从 DCLM 中，我们使用 「baseline 1.0」 混合配方。从 Dolma 中，我们使用 arXiv (Together AI, 2023), OpenWebMath (Paster et al., 2023), Algebraic Stack, peS2o (Soldaini and Lo, 2023) 和 Wikipedia 子集。arXiv，OpenWebMath 和 Algebraic Stack 最初都是 ProofPile II (Azerbayev et al., 2023) 的一部分。最后，我们纳入了来自 StarCoder (Li et al., 2023b) 的代码，它源自 GitHub 上以宽松许可证发布的仓库（Kocetkov et al., 2022）。为了纳入更高质量的代码，我们删除了来自 GitHub 上星标少于 2 的仓库的所有文档。

<small><span class="docvortex-page-footnote" data-block-type="page_footnote" style="color:#6b7280"><sup>5</sup>Available at [mlfoundations/dclm-baseline-1.0](https://huggingface.co/datasets/mlfoundations/dclm-baseline-1.0)</span></small>

<!-- page 8 of 58 -->

content; to remove them, we discarded documents whose most frequent word constitutes over 30% of the document, or whose top-2 most frequent words constitute over 50% of the document. To mitigate possible training loss spikes, we remove documents with repeated sequences of 32 or more n-grams. We report details and show effectiveness of this intervention in Section §3.1.

此外，通过对该来源的人工检查，我们发现其中包含以二进制格式编码的文档或主要由数字内容组成的文档；为了移除它们，我们丢弃了最频繁词占比超过 30% 的文档，或前两个最频繁词占比超过 50% 的文档。为了缓解可能的训练损失尖峰，我们移除了包含 32 个或更多 n-gram 重复序列的文档。我们在第 3.1 节中报告了该干预措施的细节并展示了其有效性。

#### 2.4.2 Mid-training data: Dolmino Mix 1124 2.4.2 Mid-training 数据：Dolmino Mix 1124

<table><tr><td>Source</td><td>Type</td><td>Tokens</td><td>Words</td><td>Bytes</td><td>Docs</td></tr><tr><td colspan="6">Mid-Training ◆ Dolmino High Quality Subset</td></tr><tr><td>DCLM-BaselineFastText top 7%FineWeb ≥ 2</td><td>High quality web</td><td>752B</td><td>670B</td><td>4.56T</td><td>606M</td></tr><tr><td>FLANfrom Dolma 1.7decontaminated</td><td>Instruction data</td><td>17.0B</td><td>14.4B</td><td>98.2B</td><td>57.3M</td></tr><tr><td>peS2ofrom Dolma 1.7</td><td>Academic papers</td><td>58.6B</td><td>51.1B</td><td>413B</td><td>38.8M</td></tr><tr><td>Wikipedia &amp; Wikibooksfrom Dolma 1.7</td><td>Encyclopedic</td><td>3.7B</td><td>3.16B</td><td>16.2B</td><td>6.17M</td></tr><tr><td>Stack Exchange09/30/2024 dumpcurated Q&amp;A data</td><td>Q&amp;A</td><td>1.26B</td><td>1.14B</td><td>7.72B</td><td>2.48M</td></tr><tr><td>High quality total</td><td></td><td>832.6B</td><td>739.8B</td><td>5.09T</td><td>710.8M</td></tr><tr><td colspan="6">Mid-training ◆ Dolmino Math Mix</td></tr><tr><td>TuluMath</td><td>Synthetic math</td><td>230M</td><td>222M</td><td>1.03B</td><td>220K</td></tr><tr><td>Dolmino SynthMath</td><td>Synthetic math</td><td>28.7M</td><td>35.1M</td><td>163M</td><td>725K</td></tr><tr><td>TinyGSM-MIND</td><td>Synthetic math</td><td>6.48B</td><td>5.68B</td><td>25.52B</td><td>17M</td></tr><tr><td>MathCoder2Synth BooksAjibawa-2023M-A-P Matrix</td><td>Synthetic Math</td><td>3.87B</td><td>3.71B</td><td>18.4B</td><td>2.83M</td></tr><tr><td>MetamathOWM-filtered</td><td>Math</td><td>84.2M</td><td>76.6M</td><td>741M</td><td>383K</td></tr><tr><td>CodeSearchNetOWM-filtered</td><td>Code</td><td>1.78M</td><td>1.41M</td><td>29.8M</td><td>7.27K</td></tr><tr><td>GSM8KTrain split</td><td>Math</td><td>2.74M</td><td>3.00M</td><td>25.3M</td><td>17.6K</td></tr><tr><td>Math total</td><td></td><td>10.7B</td><td>9.73B</td><td>45.9B</td><td>21.37M</td></tr></table>

Table 5 Composition of the mid-training data (Dolmino). From this set, we create samples of 50B, 100B and 300B tokens to mid-train OLMo 2 on. See Section §4 for details regarding individual source details, and Table 13 for the specific composition of each annealing mixture.

表 5｜Composition of the mid-training data (Dolmino). From this set, we create samples of 50B, 100B and 300B tokens to mid-train OLMo 2 on. See Section §4 for details regarding individua

After the initial pretraining stage on mostly web data, we further train with a mixture of web data that has been more restrictively filtered for quality and a collection of domain-specific high quality data, much of which is synthetic. The purpose of this mixture is to imbue the model with math-centric skills and provide focused exposure to STEM references and high quality text. We generate several variants of this mixture, with varying sizes, but generally refer to this mixture as Dolmino Mix 1124. The base sources from which Dolmino Mix 1124 is subsampled are described in Table 5. We refer the reader to Section §4 for a deep dive detailing our processes for experimenting and curating data for this mix.

在主要以网页数据进行的初始预训练阶段之后，我们进一步使用经过更严格质量筛选的网页数据混合配方，以及一组领域特定的高质量数据进行训练，其中大部分是合成数据。该混合配方的目的是赋予模型以数学为核心的技能，并提供对 STEM 参考文献和高质量文本的集中 exposure。我们生成了该混合配方的多个变体，规模各不相同，但通常将其称为 Dolmino Mix 1124. Dolmino Mix 1124 所采样的基础来源在表 5 中描述。读者可参阅第 4 节，深入了解我们为该混合配方进行数据实验和筛选的详细过程。

### 2.5 Evaluation and Results 2.5 评测与结果

OLMo 2 is evaluated via standard language model benchmarks. Further, we apply post-training to OLMo 2 and evaluate the result—OLMo 2-Instruct—on a diverse set of tasks to assess the adaptation potential of our base model.

OLMo 2 通过标准语言模型基准进行评估。此外，我们对 OLMo 2 应用后训练（post-training），并对结果模型 -- OLMo 2-Instruct -- 在多样化的任务集上进行评估，以衡量我们基础模型的适配潜力。

<!-- page 9 of 58 -->

<table><tr><td rowspan="2">Model</td><td rowspan="2">Avg</td><td rowspan="2"> $FLOP \times 10^{23}$ </td><td colspan="6">Dev Benchmarks</td><td colspan="4">Held-out Evals</td></tr><tr><td>MMLU</td><td> $ARC_C$ </td><td>HSwag</td><td>WinoG</td><td>NQ</td><td>DROP</td><td>AGIEval</td><td>GSM8K</td><td> $MMLU_{PRO}$ </td><td>TriviaQA</td></tr><tr><td colspan="13">Open-weights models 7-14B Parameters</td></tr><tr><td>Mistral 7B</td><td>58.9</td><td>n/a</td><td>63.5</td><td>78.3</td><td>83.1</td><td>77.7</td><td>37.2</td><td>51.8</td><td>47.3</td><td>40.1</td><td>30.0</td><td>80.3</td></tr><tr><td>Llama 3.1 8B</td><td>61.8</td><td>7.2</td><td>66.9</td><td>79.5</td><td>81.6</td><td>76.6</td><td>33.9</td><td>56.4</td><td>51.3</td><td>56.5</td><td>34.7</td><td>80.3</td></tr><tr><td>Qwen 2.5 7B</td><td>67.4</td><td>8.2</td><td>74.4</td><td>89.5</td><td>89.7</td><td>74.2</td><td>29.9</td><td>55.8</td><td>63.7</td><td>81.5</td><td>45.8</td><td>69.4</td></tr><tr><td>Qwen 3 8B</td><td>66.6</td><td>n/c</td><td>76.8</td><td>91.2</td><td>89.5</td><td>69.9</td><td>21.8</td><td>61.8</td><td>64.3</td><td>74.8</td><td>50.6</td><td>66.5</td></tr><tr><td>Gemma 2 9B</td><td>67.8</td><td>4.4</td><td>70.6</td><td>89.5</td><td>87.3</td><td>78.8</td><td>38.0</td><td>63.0</td><td>57.3</td><td>70.1</td><td>42.0</td><td>81.8</td></tr><tr><td>Llama 2 13B</td><td>54.1</td><td>1.6</td><td>55.7</td><td>67.3</td><td>83.9</td><td>74.9</td><td>38.4</td><td>45.6</td><td>41.5</td><td>28.1</td><td>23.9</td><td>81.3</td></tr><tr><td>Mistral Nemo 12B</td><td>66.9</td><td>n/a</td><td>69.5</td><td>85.2</td><td>85.6</td><td>81.5</td><td>39.7</td><td>69.2</td><td>54.7</td><td>62.1</td><td>36.7</td><td>84.6</td></tr><tr><td>Qwen 2.5 14B</td><td>72.3</td><td>16.0</td><td>79.3</td><td>94.0</td><td>94.0</td><td>80.0</td><td>37.3</td><td>51.5</td><td>71.0</td><td>83.4</td><td>52.8</td><td>79.2</td></tr><tr><td>Qwen 3 14B</td><td>73.6</td><td>n/c</td><td>80.7</td><td>93.4</td><td>92.3</td><td>76.4</td><td>31.8</td><td>75.0</td><td>70.3</td><td>87.3</td><td>55.7</td><td>73.2</td></tr><tr><td colspan="13">Open-weights models 24-70B Parameters</td></tr><tr><td>Gemma 2 27B</td><td>71.3</td><td>21.0</td><td>75.7</td><td>90.7</td><td>88.4</td><td>74.5</td><td>44.7</td><td>70.1</td><td>61.5</td><td>75.7</td><td>44.7</td><td>87.4</td></tr><tr><td>Qwen 2.5 32B</td><td>74.9</td><td>16.0</td><td>83.1</td><td>95.6</td><td>96.0</td><td>84.0</td><td>37.0</td><td>53.1</td><td>78.0</td><td>83.3</td><td>59.0</td><td>79.9</td></tr><tr><td>Qwen 3 32B</td><td>68.9</td><td>n/c</td><td>83.3</td><td>94.9</td><td>93.5</td><td>79.0</td><td>31.9</td><td>67.4</td><td>72.4</td><td>34.0</td><td>60.7</td><td>72.2</td></tr><tr><td>Mistral Small 24B</td><td>75.2</td><td>n/a</td><td>80.7</td><td>93.3</td><td>91.3</td><td>77.8</td><td>42.3</td><td>74.4</td><td>69.1</td><td>79.7</td><td>54.2</td><td>88.8</td></tr><tr><td>Gemma 3 27B</td><td>74.7</td><td>23.0</td><td>79.5</td><td>93.4</td><td>88.2</td><td>75.0</td><td>45.4</td><td>73.2</td><td>69.5</td><td>80.4</td><td>52.9</td><td>89.1</td></tr><tr><td>Llama 3.1 70B</td><td>75.5</td><td>64.0</td><td>79.2</td><td>93.1</td><td>87.6</td><td>78.9</td><td>51.3</td><td>78.9</td><td>66.3</td><td>80.6</td><td>47.1</td><td>92.2</td></tr><tr><td colspan="13">Models with partially available data</td></tr><tr><td>StableLM 2 12B</td><td>62.2</td><td>2.9</td><td>62.4</td><td>81.9</td><td>84.5</td><td>77.7</td><td>37.6</td><td>55.5</td><td>50.9</td><td>62.0</td><td>29.3</td><td>79.9</td></tr><tr><td>Zamba 2 7B</td><td>65.2</td><td>n/c</td><td>68.5</td><td>92.2</td><td>89.4</td><td>79.6</td><td>36.5</td><td>51.7</td><td>55.5</td><td>67.2</td><td>32.8</td><td>78.8</td></tr><tr><td colspan="13">Fully-open models</td></tr><tr><td>Amber 7B</td><td>35.2</td><td>0.5</td><td>24.7</td><td>44.9</td><td>74.5</td><td>65.5</td><td>18.7</td><td>26.1</td><td>21.8</td><td>4.8</td><td>11.7</td><td>59.3</td></tr><tr><td>OLMo 7B</td><td>38.3</td><td>1.0</td><td>28.3</td><td>46.4</td><td>78.1</td><td>68.5</td><td>24.8</td><td>27.3</td><td>23.7</td><td>9.2</td><td>12.1</td><td>64.1</td></tr><tr><td>MAP Neo 7B</td><td>49.6</td><td>2.1</td><td>58.0</td><td>78.4</td><td>72.8</td><td>69.2</td><td>28.9</td><td>39.4</td><td>45.8</td><td>12.5</td><td>25.9</td><td>65.1</td></tr><tr><td>OLMo 7B 0424</td><td>50.7</td><td>1.0</td><td>54.3</td><td>66.9</td><td>80.1</td><td>73.6</td><td>29.6</td><td>50.0</td><td>43.9</td><td>27.7</td><td>22.1</td><td>58.8</td></tr><tr><td>DCLM 7B</td><td>56.9</td><td>1.0</td><td>64.4</td><td>79.8</td><td>82.3</td><td>77.3</td><td>28.8</td><td>39.3</td><td>47.5</td><td>46.1</td><td>31.3</td><td>72.1</td></tr><tr><td>OLMo 2 7B</td><td>62.9</td><td>1.8</td><td>63.7</td><td>79.8</td><td>83.8</td><td>77.2</td><td>36.9</td><td>60.9</td><td>50.4</td><td>67.5</td><td>31.0</td><td>78.0</td></tr><tr><td>OLMo 2 13B</td><td>68.3</td><td>4.6</td><td>67.5</td><td>83.5</td><td>86.4</td><td>81.5</td><td>46.7</td><td>70.7</td><td>54.2</td><td>75.1</td><td>35.1</td><td>81.9</td></tr><tr><td>OLMo 2 32B</td><td>73.3</td><td>13.0</td><td>74.9</td><td>90.4</td><td>89.7</td><td>83.0</td><td>50.2</td><td>74.3</td><td>61.0</td><td>78.8</td><td>46.9</td><td>88.0</td></tr></table>

Table 6 Evaluations comparing OLMo 2 to other base models on a subset of the OLMES suite (full suite details and results in Appendix $\mathrm { A . 1 ) }$ . Training FLOPs are computed using the approximation from Kaplan et al. (2020) and expressed as powers of $1 0 ^ { 2 3 }$ . We could not estimate compute for any Mistral model (Jiang et al., 2023; Mistral AI, 2024) because their total training token count is unknown. Training FLOPs for Qwen 3 (Yang et al., 2025) (concurrent work) and Zamba 2 (Glorioso et al., 2024) are not reported due to difference in architecture. Qwen 2.5 models (Qwen et al., 2024) are trained on a “maximum of 18 trillion tokens”；developers have [declined to disclose](https://web.archive.org/web/20241125024509/https://github.com/QwenLM/Qwen2.5/issues/562) exact token counts for each model size. OLMo 2 models were not evaluated on held-out datasets prior to release; we note that, for other models, we cannot guarantee the same.

表 6｜Evaluations comparing OLMo 2 to other base models on a subset of the OLMES suite (full suite details and results in Appendix $\mathrm { A . 1 ) }$ . Training FLOPs are computed usi

> **对一下：** Table 6 中 OLMo 2 7B Avg 62.9，FLOP×10^23=1.8，相对 Llama 3.1 8B 的 7.2，作者的 Pareto 主张靠哪张图？
> Figure 1 把性能对预训练 FLOPs 画成 Pareto 前沿；Table 6 给分项。主张是同性能档用更少 FLOPs，且数据/代码全开，不是宣称每一格都绝对第一。


**Base Model Evaluation:** We evaluated OLMo 2 and other baseline models using the OLMES evaluation suite (Gu et al., 2024), which includes a range of benchmark datasets for both multiple-choice and generative tasks, using standardized prompts and in-context examples for few shot predictions. Full descriptions of benchmark tasks in Appendix A.1. For multiple-choice tasks, we evaluate accuracy; for generative tasks, we evaluate F1 to account for partial matches. Additionally, to avoid overfitting our recipe to these benchmarks,

**基础模型评测：**

<!-- page 10 of 58 -->

we maintained a **held-out suite of tasks** which were not used for model development decisions

另外保留一套 held-out 任务，开发决策不用它们；作者主张开发集与 held-out 应公开声明.; we advocate 6 for a standard practice of declaring development vs held-out evaluation tasks for model developers.


Table 6 contains overall results. We find our **OLMo 2 models are competitive with the best open-weights models** of comparable size, despite OLMo 2 requiring **far fewer training FLOPs** (see Figure 1) and maintaining **full openness (e.g. training data)**. We find that gains observed on development metrics largely translate to our unseen evaluation suite, indicative of a generalizable training recipe.

表 6｜contains overall results. We find our **OLMo 2 models are competitive with the best open-weights models** of comparable size, despite OLMo 2 requiring **far fewer training FLOPs** 

Overall, we find that gains observed on development metrics largely translate to our unseen evaluation suite. Of course, we have no guarantee that tasks we consider unseen during development of OLMo 2 are not part of the development set of other models we compare. Nevertheless, we think it should be **standard practice** for model developers to keep a subset of evaluation tasks unseen and to declare which these are, in technical reports. Further, we encourage other open-weight **model developers to clearly state which tasks are being monitored** during model development.

总体而言，我们观察到开发指标上的提升很大程度上转化到了未见的评测套件上。当然，我们无法保证在 OLMo 2 开发过程中我们认为未见的任务不属于我们所对比的其他模型的开发集。尽管如此，我们认为模型开发者应在技术报告中将一部分评测任务保持为未见状态并声明这些任务，这应该成为标准实践。此外，我们鼓励其他开源权重模型开发者清楚地说明在模型开发过程中正在监控哪些任务。

**Post-Training Recipe and Evaluation** For post-training we apply our Tülu 3 (Lambert et al., 2024) recipe with supervised finetuning, on-policy preference tuning, and reinforcement learning with verifiable rewards (RLVR). The resulting models—OLMo 2-Instruct—are evaluated in Table 7 on general and precise instruction following, math, knowledge reasoning, and safety tasks from the same evaluation suite used by Lambert et al. (2024). Full descriptions of benchmark tasks in Appendix A.2.

**后训练配方与评测**

Table 7 contains downstream results. We find **OLMo 2-Instruct models are competitive with the best instruction-tuned open-weights models and even some popular proprietary models**. This shows the usefulness of OLMo 2 as a powerful base model that serves as an excellent starting point for fully open post-training research. Full post training details are in Section §5.

表 7｜contains downstream results. We find **OLMo 2-Instruct models are competitive with the best instruction-tuned open-weights models and even some popular proprietary models**. This s

## 3 Deep Dive: Pretraining Stability 3 深挖：预训练稳定性

While OLMo-0424 achieved performance within expected ranges for its compute budget, the training dynamics were characterized by a couple of concerns:

虽然 OLMo-0424 在其计算预算范围内达到了预期的性能，但训练动态存在以下几个问题：

• **Sudden spikes** in the loss, and more frequently, in the gradient norm during training. In experiments, we found that increasing model size increased the frequency of spikes. Furthermore, our experiments revealed that more dramatic spikes in gradient norm often preceded training loss spikes.

- **损失突然尖峰，更频繁地，梯度范数突然尖峰。** 在实验中，我们发现增大模型规模会增加尖峰的频率。此外，我们的实验揭示，梯度范数的更剧烈尖峰往往先于训练损失尖峰。

• **Slow growth** in the magnitude of the gradient norm over the training run. This was correlated with increasing frequency of spikes in the gradient norm (and training loss).

- **梯度范数的幅度在训练过程中缓慢增长。** 这与梯度范数（和训练损失）尖峰频率的增加相关。

Ultimately, a combination of these issues would lead to training divergence, making training at larger scales impossible. This situation motivated our training stability investigation into the causes of these issues and their mitigations. Figure 2 shows our training curves before and after implementing our mitigations, which we summarize below:

最终，这些问题的组合会导致训练发散，使得更大规模的训练变得不可能。这种情况促使我们调查研究这些问题的原因及其缓解措施。图 2 展示了我们在实施缓解措施前后的训练曲线，总结如下：

• **Repeated n-grams:** We filter pretraining data to remove repeated n-grams in pretraining data, as they can lead to loss spikes (§3.1).

- **重复 n-gram**：我们过滤预训练数据以去除重复 n-gram，因为它们可能导致损失尖峰（§3.1）。

• **Initialization:** We switch from scaled initialization (Zhang et al., 2019) to initializing all parameters with a mean of 0 and a standard deviation of 0.02 (§3.2).

- **初始化**：我们从缩放初始化（Zhang et al., 2019）切换为所有参数均从均值为 0，标准差为 0.02 的正态分布初始化（§3.2）。

• **RMSNorm:** We use the RMSNorm variant of LayerNorm to normalize activations instead of non-parametric LayerNorm (§3.3.2).

- **RMSNorm**：我们使用 RMSNorm 变体的 LayerNorm 来归一化激活值，替代非参数化的 LayerNorm(§3.3.2).

• **Reordered norm:** We normalize the outputs to the attention and feed-forward (MLP) layers within each transformer block instead of the inputs (§3.3.2).

- **重排序归一化**：我们在每个 Transformer 块中对注意力层和前馈层（MLP）的输出进行归一化，而非输入（§3.3.2）。

<small><span class="docvortex-page-footnote" data-block-type="page_footnote" style="color:#6b7280">6<sub>GSM8k</sub> (Cobbe et al., 2021) was only partially held-out, as we subsampled 200 of 1319 GSM8k examples for mid-training data development when we noticed poor math capabilities after pretraining; we call this dev set GSM . The remaining 1119 GSM8k examples we reserve as held-out and report final performance on them only.</span></small>

<small><span class="docvortex-page-footnote" data-block-type="page_footnote" style="color:#6b7280"><sup>7</sup>We made minor modifications to the preference data to use generations from permissively-licensed models and added a multi-stage RLVR training protocol to optimize final performance, but otherwise followed the recipe as-is.</span></small>

<!-- page 11 of 58 -->

<table><tr><td>Instruct Model</td><td>Avg</td><td> $FLOP \times 10^{23}$ </td><td>AE2</td><td>BBH</td><td>DROP</td><td>GSM8K</td><td>IFE</td><td>MATH</td><td>MMLU</td><td>Safety</td><td>PQA</td><td>TQA</td></tr><tr><td colspan="13">Closed API models</td></tr><tr><td>GPT-3.5 Turbo 0125</td><td>60.5</td><td>n/a</td><td>38.7</td><td>66.6</td><td>70.2</td><td>74.3</td><td>66.9</td><td>41.2</td><td>70.2</td><td>69.1</td><td>45.0</td><td>62.9</td></tr><tr><td>GPT 4o Mini 0724</td><td>65.7</td><td>n/a</td><td>49.7</td><td>65.9</td><td>36.3</td><td>83.0</td><td>83.5</td><td>67.9</td><td>82.2</td><td>84.9</td><td>39.0</td><td>64.8</td></tr><tr><td colspan="13">Open weights models 1-1.7B Parameters</td></tr><tr><td>Gemma 3 1B</td><td>38.3</td><td>0.12</td><td>20.4</td><td>39.4</td><td>25.1</td><td>35.0</td><td>60.6</td><td>40.3</td><td>38.9</td><td>70.2</td><td>9.6</td><td>43.8</td></tr><tr><td>Llama 3.2 1B</td><td>39.3</td><td>0.67</td><td>10.1</td><td>40.2</td><td>32.2</td><td>45.4</td><td>54.0</td><td>21.6</td><td>46.7</td><td>87.2</td><td>13.8</td><td>41.5</td></tr><tr><td>Qwen 2.5 1.5B</td><td>41.7</td><td>1.7</td><td>7.4</td><td>45.8</td><td>13.4</td><td>66.2</td><td>44.2</td><td>40.6</td><td>59.7</td><td>77.6</td><td>15.5</td><td>46.5</td></tr><tr><td colspan="13">Open weights models 7-14B Parameters</td></tr><tr><td>Ministral 8B 2410</td><td>53.5</td><td>n/a</td><td>31.4</td><td>70.8</td><td>56.2</td><td>80.0</td><td>56.4</td><td>40.0</td><td>68.5</td><td>56.2</td><td>20.2</td><td>55.5</td></tr><tr><td>Llama 3.1 8B</td><td>59.1</td><td>7.2</td><td>25.8</td><td>71.9</td><td>61.7</td><td>83.4</td><td>80.6</td><td>42.5</td><td>71.3</td><td>70.2</td><td>28.4</td><td>55.1</td></tr><tr><td>Tulu 3 8B</td><td>60.7</td><td>7.2</td><td>34.0</td><td>69.0</td><td>62.6</td><td>87.6</td><td>82.4</td><td>43.7</td><td>68.2</td><td>75.4</td><td>29.1</td><td>55.0</td></tr><tr><td>Qwen 2.5 7B</td><td>61.6</td><td>8.2</td><td>29.7</td><td>70.2</td><td>54.4</td><td>83.8</td><td>74.7</td><td>69.9</td><td>76.6</td><td>75.0</td><td>18.1</td><td>63.1</td></tr><tr><td>Gemma 2 9B</td><td>58.1</td><td>4.4</td><td>43.7</td><td>64.9</td><td>58.8</td><td>79.7</td><td>69.9</td><td>29.8</td><td>69.1</td><td>75.5</td><td>28.3</td><td>61.4</td></tr><tr><td>Qwen 2.5 14B</td><td>65.3</td><td>16.0</td><td>34.6</td><td>78.4</td><td>50.5</td><td>83.9</td><td>82.4</td><td>70.6</td><td>81.1</td><td>79.3</td><td>21.1</td><td>70.8</td></tr><tr><td colspan="13">Open weights models 24-32B Parameters</td></tr><tr><td>Gemma 2 27B</td><td>61.3</td><td>21.0</td><td>49.0</td><td>72.7</td><td>67.5</td><td>80.7</td><td>63.2</td><td>35.1</td><td>70.7</td><td>75.9</td><td>33.9</td><td>64.6</td></tr><tr><td>Qwen 2.5 32B</td><td>68.1</td><td>35.0</td><td>39.1</td><td>82.3</td><td>48.3</td><td>87.5</td><td>82.4</td><td>77.9</td><td>84.7</td><td>82.4</td><td>26.1</td><td>70.6</td></tr><tr><td>Mistral Small 24B</td><td>67.5</td><td>n/a</td><td>43.2</td><td>80.1</td><td>78.5</td><td>87.2</td><td>77.3</td><td>65.9</td><td>83.7</td><td>66.5</td><td>24.4</td><td>68.1</td></tr><tr><td>Qwen QwQ 32B</td><td>-</td><td>35.0</td><td>82.4</td><td>89.6</td><td>54.7</td><td>95.5</td><td>85.8</td><td>98.1</td><td>88.4</td><td>69.9</td><td>-</td><td>-</td></tr><tr><td>Gemma 3 27B</td><td>71.3</td><td>23.0</td><td>63.4</td><td>83.7</td><td>69.2</td><td>91.1</td><td>83.4</td><td>76.2</td><td>81.8</td><td>69.1</td><td>30.9</td><td>63.9</td></tr><tr><td colspan="13">Open weights models ~70B Parameters</td></tr><tr><td>Qwen 2.5 72B</td><td>68.8</td><td>79.0</td><td>47.7</td><td>80.4</td><td>34.2</td><td>89.5</td><td>87.6</td><td>75.9</td><td>85.5</td><td>87.0</td><td>30.6</td><td>69.9</td></tr><tr><td>Llama 3.1 70B</td><td>70.7</td><td>64.0</td><td>32.9</td><td>83.0</td><td>77.0</td><td>94.5</td><td>88.0</td><td>56.2</td><td>85.2</td><td>76.4</td><td>46.5</td><td>66.8</td></tr><tr><td>Llama 3.3 70B</td><td>72.7</td><td>64.0</td><td>36.5</td><td>85.8</td><td>78.0</td><td>93.6</td><td>90.8</td><td>71.8</td><td>85.9</td><td>70.4</td><td>48.2</td><td>66.1</td></tr><tr><td colspan="13">Fully-open Language Models</td></tr><tr><td>OLMo 1B 0724</td><td>24.4</td><td>0.22</td><td>2.4</td><td>29.9</td><td>27.9</td><td>10.8</td><td>25.3</td><td>2.2</td><td>36.6</td><td>52.0</td><td>12.1</td><td>44.3</td></tr><tr><td>SmolLM2 1.7B</td><td>34.2</td><td>1.1</td><td>5.8</td><td>39.8</td><td>30.9</td><td>45.3</td><td>51.6</td><td>20.3</td><td>34.3</td><td>52.4</td><td>16.4</td><td>45.3</td></tr><tr><td>OLMo 7B 0424</td><td>33.1</td><td>1.0</td><td>8.5</td><td>34.4</td><td>47.9</td><td>23.2</td><td>39.2</td><td>5.2</td><td>48.9</td><td>49.3</td><td>18.9</td><td>55.2</td></tr><tr><td>OLMo 2 1B</td><td>42.7</td><td>0.35</td><td>9.1</td><td>35.0</td><td>34.6</td><td>68.3</td><td>70.1</td><td>20.7</td><td>40.0</td><td>87.6</td><td>12.9</td><td>48.7</td></tr><tr><td>OLMo 2 7B</td><td>56.5</td><td>1.8</td><td>29.1</td><td>51.4</td><td>60.5</td><td>85.1</td><td>72.3</td><td>32.5</td><td>61.3</td><td>93.3</td><td>23.2</td><td>56.5</td></tr><tr><td>OLMo 2 13B</td><td>63.5</td><td>4.6</td><td>39.5</td><td>63.0</td><td>71.5</td><td>87.4</td><td>82.6</td><td>39.2</td><td>68.5</td><td>89.7</td><td>28.8</td><td>64.3</td></tr><tr><td>OLMo 2 32B</td><td>68.8</td><td>13.0</td><td>42.8</td><td>70.6</td><td>78.0</td><td>87.6</td><td>85.6</td><td>49.7</td><td>77.3</td><td>85.9</td><td>37.5</td><td>73.2</td></tr></table>

Table 7 The results for OLMo 2 Instruct at 1B, 7B, 13B, and 32B relative to peer open weight models. The following evaluation names are abbreviated: Avg – Average, AE2 – AlpacaEval 2, BBH – BigBenchHard, IFE – IFEval, PQA – PopQA, TQA – TruthfulQA. All models in this table are the instruction tuned variants. For Qwen QwQ 32B, PopQA and TruthfulQA had challenges with answer extraction, where the model would return the answer within the &lt;think&gt; tokens, so we did not report a score. For Qwen QwQ 32B we conducted evaluations by removing the thinking tokens and grading the following answer. It was evaluated with their recommended sampling parameters (32K context length, 0.6 temperature, sampling, top<sub>p</sub> 0.95, min<sub>p</sub> 0, top<sub>k</sub> 30) in the model card for all evaluations except safety, which just had a shorter context length of 8K tokens. Multiple choice evaluations, PopQA and TruthfulQA had challenges with answer extraction, where the model would return the answer within the &lt;think&gt; tokens, so we did not report a score. Even outside of extraction issues, the very long context generation of reasoning models has caused challenges to many pieces of open evaluation tooling, which we need to improve.

表 7｜The results for OLMo 2 Instruct at 1B, 7B, 13B, and 32B relative to peer open weight models. The following evaluation names are abbreviated: Avg – Average, AE2 – AlpacaEval 2, BBH 

<!-- page 12 of 58 -->

![Chart block](images/p12-figure-2-training-loss-and-gradient-norm-curves-over.png)

Figure 2 Training loss and gradient norm curves (over training steps) for OLMo-0424 and OLMo 2. The OLMo-0424 training run was characterized by frequent loss spikes (top), often preceded by more frequent spikes in the gradient norm, which grew over time (bottom). We note that overall training loss for OLMo 2 is higher because the underlying training data changed between the runs.

图 2｜OLMo-0424 与 OLMo 2 的训练 loss 与梯度范数曲线（横轴为 step）。稳定性干预后尖峰明显减少。

> **回看：** Figure 2 对比 OLMo-0424 与 OLMo 2 的 loss / grad norm，§3 把尖峰归因于哪几类干预？
> §3 列：重复 n-gram 过滤（§3.1），初始化改 std=0.02 (§3.2)，RMSNorm + 重排 norm + QK-norm (§3.3)，AdamW ε→1e-8 与 embedding 不去 weight decay (§3.4). Figure 2 是组合干预后的曲线，不是单因子消融。


• **QK-norm:** We normalize the key and query projections with RMSNorm before calculating attention (§3.3.2).

- **QK-归一化**：我们在计算注意力之前用 RMSNorm 对 Key 和 Query 的投影进行归一化（§3.3.2）。

• **Z-Loss:** We adopt z-loss regularization, a regularization term that keeps final output logits from growing too large (§3.3.3).

- **Z-Loss**：我们采用 z-loss 正则化，这是一个正则化项，防止最终输出 logit 值增长过大（§3.3.3）。

• **Weight decay:** We exclude embeddings from weight decay (§3.4.2).


• ϵ **in AdamW:** We lower the ϵ of AdamW from $10 ^{-5} to 10 ^{-8}   (\$3.4.1)$

In the following, we will discuss the experiments and results that led us to these interventions. We compare our revised strategies with OLMo-0424, the most recent version of OLMo with fully-open model weights, data, and documentation.

下文将讨论引导我们采取这些干预措施的实验和结果。我们将我们的修订策略与 OLMo-0424 进行对比，OLMo-0424 是 OLMo 最新版本，具有完全开放的模型权重，数据和文档。

### 3.1 Repeated n-Grams 3.1 重复 n-gram

Data can be a cause of both gradient norm and loss spikes. When investigating training batches at which spikes occurred, we found a high prevalence of instances containing long, repeated n-gram sequences. Here are three examples of such sequences:

数据可能是梯度范数和损失尖峰的原因。在调查发生尖峰的训练批次时，我们发现包含长重复 n-gram 序列的实例高度 prevalent。以下是三个此类序列的示例：

g4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4OD.. [\n 365, 0, 667, 1000, 1000, 667, 667, 667, 667, 667,’ 255, 255, 255, 255, 255, 255, 255, 255, \n255, 255,


In a series of experiments, we found these sequences are often associated with spikes, though we note that this relationship is not deterministic:

在一系列实验中，我们发现这些序列往往与尖峰相关联，但我们注意到这种关系并非确定性的：

• The same n-gram sequence may spike for a larger model but not for a smaller model trained on the same data.

- 相同的 n-gram 序列可能在更大的模型上引发尖峰，但在使用相同数据训练的较小模型上不会。

• The same n-gram sequence may spike for one data training ordering, but not after the data is reshuffled.

- 相同的 n-gram 序列可能在一种数据训练顺序下引发尖峰，但在数据重新打乱后不会。

• The same n-gram sequence associated with a spike can also be found elsewhere in training batches that did not spike.

- 与尖峰相关联的相同 n-gram 序列也可以在与未发生尖峰的训练批次中找到。

<!-- page 13 of 58 -->

![Chart block](images/p13-chart.png)

![Chart block](images/p13-figure-3-comparison-of-the-gradient-norm-for-two-runs.png)

Figure 3 Comparison of the gradient norm for two runs, one without n-gram filter, and one with. Ignoring long repetitive sequences of n-grams eliminates many spikes.

图 3｜有 / 无重复 n-gram 过滤的两趟跑的梯度范数对照。

> **拆开：** Figure 3 说去掉长重复 n-gram 后 grad norm 尖峰变少，过滤阈值在正文哪里？
> §2.4.1 / §3.1：去掉重复长度 ≥32 的 n-gram 文档。Figure 3 是有/无该过滤的 grad norm 对照。作者还说「广泛移除」会降低尖峰频率，但并不保证单独这一刀就能彻底消掉发散。


Nevertheless, we have found evidence that broad removal of such sequences across training decreases the frequency of spikes, on average. At data curation time (Section §2.4), we apply a filter that removes all documents with a sequence of 32 or more repeated n-grams, where an n-gram is any span of 1 to 13 tokens. We also implement an additional safeguard in the trainer that detects these sequences during data loading and masks them when computing the loss. Figure 3 shows the effect of masking the loss of input sequences containing repeated n-grams. This intervention results in a clear mitigation—though not complete elimination—of gradient spikes. It had no effect on the slow growth in gradient norm.

尽管如此，我们发现了证据表明，在训练中广泛去除此类序列平均会降低尖峰的频率。在数据整理阶段（第 2.4 节），我们应用了一个过滤器，去除所有包含 32 个或更多重复 n-gram 序列的文档，其中 n-gram 是任意长度为 1 到 13 个词元的片段。我们还在训练器中实现了一个额外的安全保障，在数据加载期间检测这些序列并在计算损失时将其掩码。图 3 展示了掩码包含重复 n-gram 的输入序列损失的效果。这一干预措施导致梯度尖峰的明显缓解 -- 尽管不是完全消除。它对梯度范数的缓慢增长没有影响。

### 3.2 Model Initialization 3.2 模型初始化

Figure 4 shows the improvement to training stability from OLMo 2’s initialization scheme. In OLMo 2, we initialize every parameter from a normal distribution with a mean of 0 and a standard deviation of 0.02. In contrast, OLMo-0424’s initialization, first suggested in Zhang et al. (2019) and implemented by Gururangan et al. (2023), scaled input projections by $1 / \sqrt { d _ { \mathrm { m o d e l } } }$ , and output projections by $1 / \sqrt { 2 \cdot d _ { \mathrm { m o d e l } } \cdot \mathrm { l a y e r } _ { \mathrm { \_ } } \mathrm { i d x } }$ at every layer. In other words, later layers were initialized to smaller values.

图 4｜测试设定下 OLMo-0424 初始化很快不稳，OLMo 2 初始化保持稳定。

We perform several analyses to study the impact of initialization, showing that OLMo 2’s initialization is superior to OLMo-0424 initialization. Our empirical analysis suggests it better preserves the scale of activations and gradients across layers, allowing deep models to be trained more stably, and it exhibits properties associated with hyperparameter transfer across models of different widths. These two properties together give us confidence that deep models will train stably and that the initialization hyperparameters of our smaller models could transfer to larger scales.

我们进行了多项分析来研究初始化的影响，结果表明 OLMo 2 的初始化优于 OLMo-0424 的初始化。我们的实证分析表明，它能更好地保持各层之间激活值和梯度的尺度，使得深层模型的训练更加稳定；并且它表现出了与跨不同宽度的模型的超参数迁移相关的特性。这两个特性共同让我们确信深层模型将稳定训练，且我们较小模型的初始化超参数可以迁移到更大的规模。

**Gradient and activation growth** A fundamental concern for training deep networks is ensuring that the activations and gradients do not blow up or vanish across layers, causing learning to become unstable or stagnate. Rather, we want the scale of the activations and gradients to remain roughly the same from layer to layer. Inspired by recent related work (Cowsik et al., 2024), we evaluate different candidate initializations in terms of how they affect the 2-norm of the activations and gradients across layers. Concretely, we randomly initialize a model, pass 50 random documents from The Pile (Gao et al., 2021) through it, and collect the activations and gradients (of loss with respect to the activations) at the initial and final layers (ignoring embeddings). We then average these tensors across documents and time steps to get vectors v at the initial layer and $v ^ { i }$ at the final layer, both of length $d _ { \mathrm { m o d e l } }$ . Finally, we compute the following measure of expansion or contraction across layers, which we call the growth exponent:

训练深层网络的一个基本关切是确保激活值和梯度不会在各层之间爆炸或消失，导致学习变得不稳定或停滞。相反，我们希望激活值和梯度的尺度从一层到下一层大致保持不变。受到近期相关工作（Cowsik et al., 2024）的启发，我们评估了不同的候选初始化方案，看它们如何影响各层之间激活值和梯度的 2-范数。具体而言，我们随机初始化一个模型，将来自 The Pile (Gao et al., 2021) 的 50 个随机文档传过模型，并在初始层和最终层收集激活值和梯度（损失相对于激活值的梯度，忽略嵌入层）。然后我们在文档和时间步上对这些张量取平均，得到初始层的向量 $v$ 和最终层的向量 $v'$，两者长度均为 $d_{\text{model}}$。最后，我们计算以下跨层的扩展或收缩度量，称之为增长指数（growth exponent）：

$$
\lambda = \frac {1}{n _ {\text {layers}}} \log \left(\frac {\| \boldsymbol {v} ^ {\prime} \|}{\| \boldsymbol {v} \|}\right)
$$

We compute λ for both the activations and gradients. Ideally, both λ’s remain near 0, indicating that the activations and gradients do not explode or vanish across layers. Figure 5 plots the growth exponents for different randomly initialized models as a function of their widths (4096 corresponds to a full 7B model).


<!-- page 14 of 58 -->

![Chart block](images/p14-chart.png)

![Chart block](images/p14-figure-4-in-our-test-setting-the-olmo-0424.png)

Figure 4 In our test setting, the OLMo-0424 initialization scheme shows instabilities quickly, while OLMo 2 stays stable.

图 4｜测试设定下 OLMo-0424 初始化很快不稳，OLMo 2 初始化保持稳定。

> **确认：** Figure 4 / Figure 5 的 growth exponent α 接近 0 意味着什么，和 OLMo-0424 初始化差在哪？
> §3.2: α 近 0 表示激活与梯度随深度的增长被压住。OLMo 2 全参数 N(0,0.02^2) 截断正态；OLMo-0424 用 scaled init，测试设定下更快不稳。Figure 5 跨 width 显示 OLMo 2 的 α 更靠近 0。


Crucially, the growth exponent for OLMo 2 is closer to 0 than for OLMo-0424 across model widths. This suggests the OLMo 2 initialization will be more stable when training deep models in low precision, as both the activations and the gradients are more resistant to exploding or vanishing across layers compared to the original OLMo-0424 initialization.

关键的是，在所有模型宽度上，OLMo 2 的增长指数都比 OLMo-0424 更接近 0。这表明 OLMo 2 的初始化在低精度训练深层模型时将更加稳定，因为与原始的 OLMo-0424 初始化相比，激活值和梯度都更能抵抗在各层之间的爆炸或消失。

**Hyperparameter transfer across width** Another appealing property of the new initialization is that it scales the activation and gradient norms with width $( d _ { \mathrm { m o d e l } } )$ in a way that has been argued theoretically to be important for hyperparameter transfer across different widths. Specifically, Yang et al. (2024b) suggest that a sufficient condition for hyperparameter transfer across width is that the magnitude of each activation scalar value and its update (learning rate times gradient) remain fixed as width in<u>crease</u>s. Equivalently, the norms of the activations and their update vectors s<u>hould</u> positively correlate with $\sqrt { d _ { \mathrm { m o d e l } } }$ . We plot the activation and gradient norms at <u>initia</u>lization against $\sqrt { d _ { \mathrm { m o d e l } } }$ in Figure 6. Crucially, the gradient norm is more positively correlated with $\sqrt { d _ { \mathrm { m o d e l } } }$ for OLMo 2 compared to OLMo-0424. Combined with Yang et al. (2024b), this suggests that, with an initial learning rate independent of model width, the new OLMo 2 initialization will transfer better across different model widths compared to the OLMo-0424 initialization.

新初始化的另一个吸引人的特性是，它以某种方式将激活值和梯度范数随宽度（$d_{\text{model}}$）缩放，这种方式在理论上被认为对跨不同宽度的超参数迁移很重要。具体而言，Yang 等人（2024b）提出，跨宽度超参数迁移的一个充分条件是每个激活标量值及其更新（学习率乘以梯度）的幅度在宽度增加时保持不变。等价地，激活值及其更新向量的范数应与 $\sqrt{d_{\text{model}}}$ 正相关。我们在图 6 中绘制了初始化时的激活值和梯度范数相对于 $\sqrt{d_{\text{model}}}$ 的关系。关键的是，与 OLMo-0424 相比，OLMo 2 的梯度范数与 $\sqrt{d_{\text{model}}}$ 的正相关性更强。结合 Yang 等人（2024b）的理论，这表明，在初始学习率与模型宽度无关的情况下，新的 OLMo 2 初始化将比 OLMo-0424 初始化在不同模型宽度之间迁移得更好。

**Spike score** Since fast spikes are difficult to understand with contemporary graphing tools, we compute a spike score as an objective measure. Concretely, we define the spike score as the percentage of values in a time series that are at least seven standard deviations away from a rolling average of the last 1, 000 values . We use spike score primarily on training loss and L2 norm of the gradient, but the measure can be computed on any time series.

由于快速尖峰难以用当代绘图工具理解，我们计算了一个尖峰分数（spike score）作为客观度量。具体而言，我们将尖峰分数定义为时间序列中至少有七个标准差偏离最近 1,000 个值的滚动平均的值的百分比。我们主要在训练损失和梯度的 L2 范数上使用尖峰分数，但该度量可以应用于任何时间序列。

**Empirical results** To experiment with model initialization, we first create a baseline run that reproduces spikes quickly. We do so by mainly reducing the warmup period. The effect was immediate and dramatic (Figure 4), and persists across model scales and token counts. In our ablation, the new initialization had no loss spikes, and the spike score for the L2 norm of the gradient went from 0.40 to 0.03. The new initialization converges slightly slower; we make up for this difference by improving other hyperparameter settings (Section §3.4).

为了实验模型初始化，我们首先创建了一个能快速复现尖峰的基线运行。我们主要通过减少 Warmup 期来实现。效果是即时且显著的（图 4），并且在不同模型规模和 token 数上持续存在。在我们的消融实验中，新初始化没有损失尖峰，且梯度的 L2 范数的尖峰分数从 0.40 降至 0.03。新初始化收敛稍慢；我们通过改进其他超参数设置来弥补这一差异（第 3.4 节）。

<small><span class="docvortex-page-footnote" data-block-type="page_footnote" style="color:#6b7280">8Spike score is conceptually similar to spike mitigation proposed by Karpathy (2024).</span></small>

<!-- page 15 of 58 -->

OLMo-0424 act. and grad. norms at init.

![Chart block](images/p15-figure-5-across-widths-growth-exponents-for-the-olmo-2.png)

Figure 5 Across widths, growth exponents for the OLMo 2 initialization are closer to 0 compared to the OLMo-0424 initialization, which suggests deeper models will train more stably.

图 5｜跨 width，OLMo 2 初始化的 growth exponent 比 OLMo-0424 更接近 0。

![Chart block](images/p15-chart.png)

![Chart block](images/p15-figure-6-activation-and-gradient-norms-vs-sqrt-d-mathrm.png)

Figure 6 Activation and gradient norms vs. $\sqrt { d _ { \mathrm { m o d e l } } }$ for the OLMo-0424 and OLMo 2 initializations. Crucially, the gradient norms for OLMo 2 positively correlate with $\sqrt { d _ { \mathrm { m o d e l } } }$ , which they did not for the OLMo-0424 initialization. This suggests the OLMo 2 initialization will show better hyperparameter transfer across widths (Yang et al., 2024b).

图 6｜激活与梯度范数相对 $\sqrt{d_{\mathrm{model}}}$: OLMo-0424 vs OLMo 2 初始化。

### 3.3 Architecture Improvements 3.3 架构改进

#### 3.3.1 Nonparametric layer norm and RMSNorm 3.3.1 非参数 LayerNorm 与 RMSNorm

OLMo 2 uses RMSNorm, which is standard in most transformer implementations. OLMo-0424 used a nonparametric layer norm for performance and to work around bugs in the libraries we were using, but by the time we developed OLMo 2, the bugs were no longer an issue, the hardware was faster, and we wanted to settle on a safe approach. Our ablations show no difference between the two, so we switch back to RMSNorm.

OLMo 2 使用 RMSNorm，这是大多数 Transformer 实现中的标准做法。OLMo-0424 出于性能考虑使用了非参数化的 LayerNorm，也是为了规避当时所用库中的 bug，但在我们开发 OLMo 2 时，这些 bug 已不再是问题，硬件也更快了，我们希望采用一种更稳妥的方案。我们的消融实验显示两者之间没有差异，因此我们切换回了 RMSNorm。

#### 3.3.2 Reordered norm and QK-norm 3.3.2 重排归一化与 QK-norm

Figure 7 shows the effect of applying the layer normalization to the outputs of the MLP and attention blocks instead of the inputs. We further apply another normalization, also RMSNorm, to the queries and keys in the attention block. In isolation, neither of these changes yield good results, but together they improve both the growth and the spikiness of the L2 norm of the gradient. The following table summarizes the difference in the location of the layer normalization:

图 7｜把 LayerNorm 放到 Attention / FFN 输出侧，再加 QK-norm，稳定性优于输入侧归一化基线。

| OLMo-0424 | OLMo2 |
| --- | --- |
| h ∶= x + Attention(LN(x)) | h ∶= x + RMSNorm(Attention(x)) |
| h<sub>out</sub> ∶= h + MLP(LN(h)) | h<sub>out</sub> ∶= h + RMSNorm(MLP(h)) |

<!-- page 16 of 58 -->

x is the input to the layer, h is an intermediate hidden state, and $h _ { \mathrm { o u t } }$ is the output.


Liu et al. (2021) first introduced layer norm the idea of reordering layer norm. It was subsequently picked up by Chameleon Team (2024). QK-norm was first developed in Dehghani et al. (2023a).

Liu 等人（2021）首先提出了重排序层归一化的想法。随后 Chameleon Team (2024) 采用了这一做法。QK-归一化最初由 Dehghani 等人（2023a）开发。

![Chart block](images/p16-figure-7-applying-layer-norm-after-the-attention-and.png)

Figure 7 Applying layer norm after the attention and feedforward layers along with a QK-norm improves stability compared to a more standard pre-attention layer norm. These changes reduce the spike score of the gradients from 0.108 to 0.069 when applied together.

图 7｜把 LayerNorm 放到 Attention / FFN 输出侧，再加 QK-norm，稳定性优于输入侧归一化基线。

> **再看：** Figure 7 把 post-norm 与 QK-norm 画在一起，正文有没有把两者拆开的单独曲线？
> §3.3.2 与 Figure 7 的叙述是「输出侧 LayerNorm + QK-norm」一并改善稳定性。主文没有再给「只改 post-norm / 只改 QK-norm」的两张独立主图；机制名字应对齐 Dehghani et al. 的 QK-Norm 与 Liu et al. 的 reordered residual。


#### 3.3.3 Z-Loss 3.3.3 Z-Loss

Following Chowdhery et al. (2022), Chameleon Team (2024), and Wortsman et al. (2023), we apply z-loss regularization by adding $\mathrm { 1 0 } ^ { - 4 } \cdot \log ^ { 2 ^ { \cdot } }   Z$ to our loss function, where Z is the denominator in the softmax over the logits. This discourages the activations in the final softmax from growing too large, improving the stability of the model.

- **Z-Loss**：遵循 Chowdhery 等人（2022），Chameleon Team (2024) 和 Wortsman 等人（2023），我们采用了 z-loss 正则化，因为已有实验表明它能提升训练运行的稳定性。

Figure 8 shows a stark difference between the z-loss implementation of the popular Flash Attention library (Dao, 2024), and an implementation using only Python primitives. Apart from the attention mechanism it is known for, Flash Attention also provides an optimized implementation of cross-entropy loss, which includes a version of z-loss. To retain flexibility in settings that are not compatible with Flash Attention, we have a separate implementation written in PyTorch. Both implementations produce the same result in the forward pass, but exhibit different behavior in the backward pass. We suspect the root cause lies in differences in precision. In our experiments, this does not affect cross entropy loss during training, or the model’s performance on downstream tasks. However, out of an abundance of caution we abandon the fork with custom z-loss implementation and re-train from the original point of divergence. During a training run we cannot switch implementations safely, so we avoid doing so as much as possible.

图 8｜Flash Attention 库的 z-loss 实现与手工 PyTorch 不一致（反向尤甚）。

![Chart block](images/p16-figure-8-flash-attention-s-implementation-of-z-loss.png)

Figure 8 Flash Attention’s implementation of z-loss does not match a manual implementation in PyTorch. While the forward pass produces the same number, differences in the backwards pass cause the curves to diverge.

图 8｜Flash Attention 库的 z-loss 实现与手工 PyTorch 不一致（反向尤甚）。

> **停一下：** Figure 8 显示 Flash Attention 的 z-loss 实现与手工 PyTorch 不一致，作者最终用哪边？
> §3.3.3：前向可能接近，但反向不匹配。他们采用与手工实现一致的 z-loss（权重 10^{-5}，见表 1），并指出流行库实现不能直接当正确公式用。问的是数值一致性，不是「要不要 z-loss」本身。


<!-- page 17 of 58 -->

### 3.4 Hyperparameter Improvements 3.4 超参改进

#### 3.4.1 ϵ in AdamW

Figure 9 shows the result of decreasing the AdamW ϵ from $10 ^{-5}  to   10 ^{-8} .   10 ^{-8}$ is the default in PyTorch, but some popular LM training code bases come with a default of ${ 1 0 } ^ { - 5 }$ . The lower value allows for larger updates early in training, and helps the model learn faster during a period where we’ve typically seen a lot of instability. As a result, the gradient norm settles much more quickly and remains permanently lower.

图 9｜把 AdamW 的 ε 设为 $10^{-8}$ 可降低并稳住训练早期的梯度范数。

![Chart block](images/p17-chart.png)

![Chart block](images/p17-figure-9-setting-adamw-s-to-1-0-8-lowers-and-stabilizes.png)

Figure 9 Setting AdamW’s ϵ to ${ 1 0 } ^ { - 8 }$ lowers and stabilizes the norm of the gradient early in training. The training loss also improves faster. This trend continues even with runs that are longer than what is shown here.

图 9｜把 AdamW 的 ε 设为 $10^{-8}$ 可降低并稳住训练早期的梯度范数。

> **想：** Figure 9 把 AdamW ε 从 10^{-5} 降到 10^{-8}，早期 grad norm 更低更稳，这是不是改了 β2?
> 不是。§3.4.1 只动 ε；10^{-8} 是 PyTorch AdamW 默认。图表现的是早期梯度范数更低更稳。不要把它说成换了整套 AdamW 超参表。


#### 3.4.2 Weight decay on embeddings 3.4.2 Embedding 的 weight decay

Figure 10 shows the change in training dynamics following a decision to exclude weight decay for embeddings. OLMo uses a standard formulation of weight decay, where every parameter is multiplied by $\mathrm { 1 - \left( 0 . 1 \cdot \mathit { l r } \right) }$ at every step. This regularization term discourages parameters from growing too large, but in the case of token embeddings it overshoots the mark and results in very small embeddings. As discussed by Takase et al. (2024), small embeddings can produce large gradients in early layers because the Jacobian of layer\_norm(x) w.r.t. x is inversely proportional to ∥x∥, and, in early layers, the norm of the residual stream is essentially the norm of the embeddings. We experiment with the full range of remedies discussed in Takase et al. (2024), but found that they impacted the speed of convergence. Instead, we simply turn off weight decay for embeddings and observe that embedding norms settle in a healthy region as training progresses.

图 10｜对 token embedding 施加 weight decay 会使 embedding 范数逐渐下降并改变训练动态。

![Chart block](images/p17-chart-2.png)

![Chart block](images/p17-figure-10-weight-decay-applied-to-token-embeddings.png)

Figure 10 Weight decay applied to token embeddings leads to a gradual decrease in the embedding norm and a corresponding increase in the gradient norm. Decaying embeddings also has a modest negative impact on stability, producing more spikes than a comparable run without (spike scores of 0.16 and 0.092 respectively).

图 10｜对 token embedding 施加 weight decay 会使 embedding 范数逐渐下降并改变训练动态。

> **问：** Figure 10 显示对 token embedding 做 weight decay 会让 embedding norm 渐降，OLMo 2 最终怎么做？
> Table 1 / §3.4.2: Weight Decay on Embeddings = No. 图说明若继续衰减，embedding norm 下降并连带改变训练动态；因此 OLMo 2 取消对 embedding 的 weight decay。


<!-- page 18 of 58 -->

## 4 Deep Dive: Mid-training Recipe 4 深挖：Mid-training 配方

Recent works have suggested that a multi-stage approach to base model training can lead to measurable improvements in capabilities (Blakeney et al., 2024; Ibrahim et al., 2024; Feng et al., 2024). In previous OLMo iterations, we also found that both learning rate schedule (OLMo 1; Groeneveld et al. 2024) and data mixture (OLMo-0424; Ai2 2024) play an important role. We refer to interventions at this stage of model development as mid-training

近期研究表明，基础模型训练的多阶段方法可以带来可测量的能力提升（Blakeney et al., 2024; Ibrahim et al., 2024; Feng et al., 2024）。在此前 OLMo 的迭代中，我们也发现学习率调度（OLMo 1; Groeneveld et al. 2024）和数据混合配方（OLMo-0424; Ai2 2024）都发挥着重要作用。我们将模型开发这一阶段的干预称为中期训练（mid-training）。

From afar, our approach is simple: after the pretraining stage, we generate domain-specific data mixtures and restart training, linearly driving the learning rate down to zero. Our goal is to imbue specialized knowledge and improve capabilities; feedback on these improvements comes from key benchmarks, such as math-specific tasks such as GSM8K.

从宏观来看，我们的方法很简单：在预训练阶段之后，我们生成领域特定的数据混合配方并重新开始训练，线性地将学习率降至零。我们的目标是赋予模型专业知识并提升能力；这些改进的反馈来自关键基准，例如针对数学的 GSM8K 等任务。

### 4.1 Learning rate annealing 4.1 学习率退火

Our starting point for learning rate experiments was the setting from Grattafiori et al. (2024). To initialize the optimizer state for the 7B variant, we linearly warm up the learning rate to its peak of $3 \cdot { { \mathrm { 1 0 } } ^ { - 4 } }$ over the first 2000 steps. Then, we use a standard cosine decay over 5T tokens. Previous experience with OLMo-0424 suggests that the last part of a cosine decay schedule can be cut off and replaced by a linear decay to zero with little loss of performance. Accordingly, for the 7B variant, we stop the schedule at 4T tokens and then switch to mid-training as described in Section $\S 4$ . The 13B ran with a higher peak learning rate from the start, so we decided to run it to 5T tokens before moving to the mid-training stage.

我们学习率实验的起点是 Grattafiori 等人（2024）的设置。为了初始化 7B 变体的优化器状态，我们在前 2000 步将学习率线性 Warmup 到峰值 $3 \times 10^{-4}$。然后，我们在 5T token 上使用标准的余弦衰减。此前 OLMo-0424 的经验表明，余弦衰减调度的最后部分可以被截断并替换为线性衰减至零，而性能损失很小。因此，对于 7B 变体，我们在 4T token 处停止调度，然后切换到第 4 节描述的中期训练。13B 从一开始就使用更高的峰值学习率运行，因此我们决定将其运行到 5T token 后再进入中期训练阶段。

Figure 11 shows different runs with four additional learning rate values: $6 \cdot { 1 0 } ^ { - 4 } ,   9 \cdot { 1 0 } ^ { - 4 } ,   { 1 2 } \cdot { 1 0 } ^ { - 4 }$ , and $\mathrm { 3 0 \cdot 1 0 ^ { - 4 } }$ . In particular, we tried double, triple, quadruple, 10×, and 30× the original learning rate. The last, $\mathrm { 3 0 \cdot { 1 0 } ^ { - 4 } }$ , showed training instabilities already during learning rate warm-up, with several loss spikes that did not recover fully, so we abandoned this variant quickly. The other values trained normally and showed an interesting pattern. Looking purely at training loss, higher learning rates universally perform better early on (as long as they avoid loss spikes), but eventually the lower learning rate setting overtakes the others (Figure 11). Notably, when comparing $3 \cdot { { \mathrm { 1 0 } } ^ { - 4 } }$ and $6  \cdot  10 ^{- 4 }$ , the cross-over point is well past 200B tokens. A shorter hyperparameter experiment might come to the wrong conclusion.

图 11｜更高学习率起初更好，随后被更低学习率反超；线性退火到 0 改变终局。

![Chart block](images/p18-chart.png)

![Chart block](images/p18-figure-11-higher-learning-rates-perform-better-at-first.png)

Figure 11 Higher learning rates perform better at first but are eventually overtaken by lower rates. However, linearly decaying the learning rate to zero over 50B or 100B tokens results in equivalent training loss.

图 11｜更高学习率起初更好，随后被更低学习率反超；线性退火到 0 改变终局。

> **看表：** Figure 11 与 Table 8：更高峰值学习率起初更好但后来被更低学习率反超，线性退火到 0 扮演什么角色？
> §4.1：余弦日程末段再线性把学习率接到 0 (anneal). Figure 11 显示高 LR 先领先后被赶超；退火改变终局。Table 8 在更长跑上也给出一致趋势。Mid-training 的 LR 线性降到 0 是 Stage 2 的定义动作。


One of the motivations for this line of experimentation was to find out whether a higher learning rate would make the annealing step more effective. The conjecture is that the worse training loss during pretraining is compensated for when the learning rate decays to zero. To test this hypothesis, we took a checkpoint from each of our four variants after 300B tokens, and decayed the learning rate to zero over 50B tokens. To account for the possibility that the effect of higher learning rates needs more steps to unfold, we tried the three higher settings and decayed the learning rate over 100B tokens, for a total of seven experiments. The results show

这一系列实验的动机之一是探究较高的学习率是否会使退火步骤更有效。猜想是预训练期间较差的训练损失会在学习率衰减至零时得到补偿。为了验证这一假设，我们从四个变体中各取一个在 300B token 后的检查点，并在 50B token 上将学习率衰减至零。考虑到较高学习率的效果可能需要更多步骤才能充分展开，我们对三个较高的设置尝试了在 100B token 上衰减学习率，总共七个实验。结果表明，较高的学习率确实使中期训练更有效，但它补偿的量恰好等于预训练更差的量。所有四个变体在过程结束时显示出相同的训练损失，尽管最低设置略落后于其他设置。

<small><span class="docvortex-page-footnote" data-block-type="page_footnote" style="color:#6b7280"><sup>9</sup>while the concept of chaining of multiple stages of self-supervised training is not new (e.g., Gururangan et al. 2020), we trace the use of mid-training to Abdin et al. (2024a) and OpenAI (2024).</span></small>

<!-- page 19 of 58 -->

that a higher learning rate does make mid-training more effective, but it does so by exactly the amount that the pretraining is worse. All four variants show the same training loss at the end of the procedure, though the lowest setting lags behind the others by a small amount.


Table 8 shows that the result is consistent for longer training runs as well. We took two variants, $\mathrm { 3 \cdot { 1 0 } ^ { - 4 } }$ and $6  \cdot  10 ^{- 4 }$ , and repeated the experiment after training for 1T and for 2T tokens. We chose these variants because $3 \cdot { { \mathrm { 1 0 } } ^ { - 4 } }$ is the baseline from Grattafiori et al. (2024), and $6  \cdot  10 ^{- 4 }$ showed, by a slim margin, the best training loss. Our results show virtually no difference between the two settings, both on training loss and a mix of nine downstream tasks from the OLMES suite (Gu et al., 2024) shown in Table 8. Evaluating the models on downstream tasks is noisier, but mirrors the findings based on training loss only.

表 8｜shows that the result is consistent for longer training runs as well. We took two variants, $\mathrm { 3 \cdot { 1 0 } ^ { - 4 } }$ and $6  \cdot  10 ^{- 4 }$ , and repeated the ex

| Learning Rate | Pretraining Stage | Mid-training Stage | OLMES (CF, valid) |
| --- | --- | --- | --- |
| -4 |  |  |  |
| 3 ⋅ 10 | 300B tokens | 50B tokens | 62.5 |
| -4 |  |  |  |
| 6 ⋅ 10 | 300B tokens | 50B tokens | 63.9 |
| -4 |  |  |  |
| 9 ⋅ 10 | 300B tokens | 50B tokens | 64.1 |
| -4 |  |  |  |
| 12 ⋅ 10 | 300B tokens | 50B tokens | 63.6 |
| -4 |  |  |  |
| 6 ⋅ 10 | 300B tokens | 100B tokens | 64.6 |
| -4 |  |  |  |
| 9 ⋅ 10 | 300B tokens | 100B tokens | 64.5 |
| -4 |  |  |  |
| 12 ⋅ 10 | 300B tokens | 100B tokens | 64.2 |
| -4 |  |  |  |
| 3 ⋅ 10 | 2T tokens | 100B high quality tokens | 73.8 |
| -4 |  |  |  |
| 6 ⋅ 10 | 2T tokens | 100B high quality tokens | 73.9 |

Table 8 Results on 9 multiple-choice tasks from the validation subset of OLMES (cloze formulation format) for various peak learning rates and schedule lengths. Average scores vary by less than two points across all variants, with most scores within half a point of each other.

表 8｜Results on 9 multiple-choice tasks from the validation subset of OLMES (cloze formulation format) for various peak learning rates and schedule lengths. Average scores vary by less 

Finally, we wanted to see if a higher learning rate during the pretraining stage would result in a more effective mid-training stage when switching to higher quality data. To match our training setup as much as possible within the available compute budget, we took the same two settings $( 3 \cdot { 1 0 } ^ { - 4 } ]$ and $\mathrm { \tilde { 6 } \cdot 1 0 ^ { - 4 } ) }$ , and linearly decayed the learning rate to 0 over 100B high quality tokens. Once again, the results show little difference. The final scores on the OLMES evaluation suite are within 0.1 points of each other. However, looking at other metrics may still reveal a meaningful difference between the two settings. The mix of high quality tokens targets math specifically, and on GSM8K (which is not part of the OLMES suite), the high learning rate setting is 2.8 points better than the lower learning rate. More study is needed to turn this interesting data point into a dependable result.

最后，我们想看看在预训练阶段使用较高的学习率是否在切换到更高质量数据时会导致更有效的中期训练阶段。为了在可用计算预算内尽可能匹配我们的训练设置，我们取相同的两个设置（$3 \times 10^{-4}$ 和 $6 \times 10^{-4}$），并在 100B 高质量 token 上将学习率线性衰减至 0。再一次，结果显示差异很小。OLMES 评测套件的最终分数相差不到 0.1 点。然而，查看其他指标可能仍能揭示两个设置之间的有意义的差异。高质量 token 的混合专门针对数学，在 GSM8K 上（这不是 OLMES 套件的一部分），高学习率设置比低学习率好 2.8 点。需要更多研究才能将这个有趣的数据点转化为可靠的结果。

This finding contradicts machine learning folk wisdoms such as “higher learning rates are always better” or “area under the learning curve matters”（McCandlish et al., 2018）。It expands on Wortsman et al. (2023), who observed that smaller models’ performance is largely invariant to learning rate over several orders of magnitude when trained to the end of a cosine schedule, and further found that QK-norm (section 3.3.2) and z-loss (section 3.3.3), which we use as well, enhance this effect. We find that these results still hold even at much larger scales of tokens and parameters, and, crucially for our training efforts, with our modified learning rate schedule.

这一发现与机器学习的民间智慧相矛盾，例如「较高的学习率总是更好」或「学习曲线下的面积很重要」（McCandlish et al., 2018）。它扩展了 Wortsman 等人（2023）的观察，他们发现当小模型训练到余弦调度结束时，其性能在几个数量级的学习率变化上基本不变，并进一步发现 QK-norm（第 3.3.2 节）和 z-loss（第 3.3.3 节）-- 我们也使用了这两项技术 -- 增强了这种效应。我们发现这些结果在更大的 token 和参数规模上仍然成立，并且对于我们训练工作的关键之处是，在我们的修改后的学习率调度下也成立。

Due to cost concerns we did not explore the full range of learning rates. This is the main limitation of this line of experimentation. It would be interesting to run a wider sweep of learning rates to accurately define the boundaries of the plateau we appear to be training in.

由于成本考虑，我们没有探索学习率的完整范围。这是这条实验线的主要局限。运行更广泛的学习率扫描以准确定义我们似乎正在训练的平台期的边界将是很有趣的。

### 4.2 Data Curriculum: Dolmino Mix 1124 4.2 数据课程：Dolmino Mix 1124

In this section, we describe our experimental process for curating our mid-training data. We collectively refer to the resulting dataset and mixtures created for this mid-training stage as **Dolmino Mix 1124**. An overview of the contents of this dataset is provided in Section §2.4 (Table 5). In detail, we use the following procedure in our mid-training recipe:

本节描述了我们整理中期训练数据的实验过程。我们将为中期训练阶段创建的数据集和混合配方统称为 Dolmino Mix 1124。该数据集的内容概述在第 2.4 节（表 5）中提供。具体而言，我们在中期训练配方中使用以下流程：

<!-- page 20 of 58 -->

• Identify a mix of high-quality sources to improve performance across the entire development benchmark suite (Section §4.3).

- **确定一组高质量来源的混合配方，以提升整个开发基准套件上的性能**（第 4.3 节）。

• For patching specific capabilities (specifically, in the case of OLMo 2, math), collect and evaluate domainspecific datasets to mix during mid-training (Section §4.4). We found that these sources can be independently assessed through a technique we dub microannealing (Section §4.4.2); their effectiveness persists when mixed with rest of sources.

- **为了弥补特定能力（具体而言，对于 OLMo 2 是数学能力），收集并评估领域特定的数据集以在中期训练期间混合**（第 4.4 节）。我们发现这些来源可以通过我们称之为微退火（microannealing）的技术独立评估（第 4.4.2 节）；当与剩余来源混合时，它们的有效性持续存在。

• Following experiments described in Section §4.1, we mix high-quality sources and math-specific data in three different token budgets (50B, 100B, 300B). The smaller mix is used to mid-train OLMo 2 7B, while OLMo 2 13B and 32B are annealed on the larger ones. For both OLMo 2 7B, 13B and 32B, we find that averaging weights of different checkpoints trained on same mixture but different data order seeds consistently improves over individual checkpoints (Section §4.5). To demonstrate this on the small scale, we also include results for a 1B model that receives similar interventions as the 7B model.

- **遵循第 4.1 节描述的实验，我们将高质量来源和数学特定数据以三种不同的 token 预算（50B, 100B, 300B）混合。** 较小的混合用于中期训练 OLMo 2 7B，而 OLMo 2 13B 和 32B 在较大的混合上退火。对于 OLMo 2 7B，13B 和 32B，我们发现对在不同数据顺序种子上训练但使用相同混合配方的不同检查点取权重平均，始终优于单个检查点（第 4.5 节）。为了在小规模上展示这一点，我们还包含了接受与 7B 模型类似干预的 1B 模型的结果。

<table><tr><td rowspan="2">Checkpoint</td><td rowspan="2">Avg</td><td colspan="6">Dev Benchmarks</td><td colspan="4">Held-out Evals</td></tr><tr><td>MMLU</td><td> $ARC_C$ </td><td>HSwag</td><td>WinoG</td><td>NQ</td><td>DROP</td><td>AGIEval</td><td>GSM8K</td><td> $MMLU_{PRO}$ </td><td>TQA</td></tr><tr><td colspan="12">OLMo 2 1B</td></tr><tr><td>Pretraining</td><td>31.9</td><td>26.9</td><td>26.1</td><td>67.5</td><td>67.8</td><td>16.1</td><td>25.1</td><td>24.5</td><td>3.3</td><td>11.1</td><td>50.1</td></tr><tr><td>Pretraining &amp; mid-training</td><td>43.7</td><td>44.3</td><td>51.3</td><td>69.5</td><td>66.5</td><td>20.8</td><td>34.0</td><td>36.3</td><td>43.8</td><td>16.1</td><td>54.7</td></tr><tr><td colspan="12">OLMo 2 7B</td></tr><tr><td>Pretraining</td><td>53.0</td><td>59.8</td><td>72.6</td><td>81.3</td><td>75.8</td><td>29.0</td><td>40.7</td><td>44.6</td><td>24.1</td><td>27.4</td><td>74.6</td></tr><tr><td>Pretraining &amp; mid-training</td><td>62.9</td><td>63.7</td><td>79.8</td><td>83.8</td><td>77.2</td><td>36.9</td><td>60.8</td><td>50.4</td><td>67.5</td><td>31.0</td><td>78.0</td></tr><tr><td colspan="12">OLMo 2 13B</td></tr><tr><td>Pretraining</td><td>58.9</td><td>63.4</td><td>80.2</td><td>84.8</td><td>79.4</td><td>34.6</td><td>49.6</td><td>48.2</td><td>37.3</td><td>31.2</td><td>80.3</td></tr><tr><td>Pretraining &amp; mid-training</td><td>68.3</td><td>67.5</td><td>83.5</td><td>86.4</td><td>81.5</td><td>46.7</td><td>70.7</td><td>54.2</td><td>75.1</td><td>35.1</td><td>81.9</td></tr><tr><td colspan="12">OLMo 2 32B</td></tr><tr><td>Pretraining</td><td>66.3</td><td>72.9</td><td>88.7</td><td>84.2</td><td>82.4</td><td>40.6</td><td>57.2</td><td>56.8</td><td>56.2</td><td>38.5</td><td>85.4</td></tr><tr><td>Pretraining &amp; mid-training</td><td>73.3</td><td>74.9</td><td>90.4</td><td>89.7</td><td>83.0</td><td>50.2</td><td>74.3</td><td>61.0</td><td>78.8</td><td>43.3</td><td>88.0</td></tr></table>

Table 9 Evaluations comparing OLMo 2 1B, 7B, 13B and 32B at the end of pretraining and mid-training stages (setup mirrors Table 6). Pretrain checkpoints have been trained on 4 trillion (1B, 7B), 5 trillion (13B) and 7 trillion (32B) tokens respectively. For 7B, we obtain the final mid-train checkpoints by averaging three training runs on 50B Dolmino tokens; for 13B and 32B, we use three runs on 100B tokens and one run on 300B tokens. For 1B, the final checkpoint is the result of training on 50B Dolmino tokens without averaging.

表 9｜Evaluations comparing OLMo 2 1B, 7B, 13B and 32B at the end of pretraining and mid-training stages (setup mirrors Table 6). Pretrain checkpoints have been trained on 4 trillion (1B

> **核对：** Table 9 说 mid-training 对小模型增益更大，文中给出的 1B 相对涨幅是多少？
> 附录 B / 正文引用：Dolmino Mix 1124 对 1B 的收益约 +37.0%，高于更大模型。Table 9 是各档 pretrain 终点 vs mid-train 终点的对照。口径是同一 OLMES 设定下的相对抬升，不是 FLOPs 归一化后的另一张表。


Table 9 summarizes the dramatic impact of this mid-training phase on both development and held-out evals. OLMo 2 7B model improves, on average by 10.6 points, surpassing the larger 13B model after the pretraining stage. For its part, OLMo 2 13B benefits equally from mid-training, improving its average performance by 10.3 points. Both models see improvements in knowledge-intensive, multiple-choice (Arc challenge: 72.6 → 79.8 for 7B, 80.2 → 83.5 for 13B; MMLU: 59.8 → 63.7 for 7B, 63.4 → 67.5 for 13B; AGIEval: 44.6 → 50.4 for 7B, 48.2 → 54.2 for 13B), reading comprehension (Natural Questions: 29.0 → 36.9 for 7B, 34.6 → 46.7 for 13B; DROP: 40.7 → 60.8 for 7B, 49.6 → 70.7 for 13B), and math skills (GSM8K: 24.1 → 67.5 for 7B, 37.3 → 75.1 for 13B) benchmarks.

表 9｜summarizes the dramatic impact of this mid-training phase on both development and held-out evals. OLMo 2 7B model improves, on average by 10.6 points, surpassing the larger 13B mod

### 4.3 Dolmino Mix 1124: High Quality Sources 4.3 Dolmino Mix 1124：高质量源

Following the recipe from the previous OLMo iteration (Ai2, 2024), we start by curating a higher quality subset of pretraining mix, and expand it with more academic and encyclopedic material. In particular, we consider the following sources (summarized in Table 10):

遵循此前 OLMo 迭代（Ai2, 2024）的配方，我们从整理预训练混合配方的高质量子集开始，并用更多学术和百科材料扩展它。具体而言，我们考虑了以下来源（总结在表 10 中）：

**High quality web** To filter the web subset used in pretraining, we experiment with two existing quality classifiers:

为了过滤预训练中使用的网页子集，我们尝试了两种现有的质量分类器：

<!-- page 21 of 58 -->

<table><tr><td rowspan="2" colspan="3">Source</td><td colspan="7">Mix %</td></tr><tr><td>PT Mix</td><td> $Web^{FT_7}$ </td><td> $Web^{FT_7\text{FW}_3}$ </td><td> $Web^{FT_7\text{FW}_2}$ </td><td> $Web^{FT_7\text{FW}_2}+\text{Math}$ </td><td> $Web^{FT_7\text{FW}_2}+\text{Ins}$ </td><td> $Web^{FT_7\text{FW}_2}+\text{Math}+\text{Ins}$ </td></tr><tr><td rowspan="4">WEB</td><td>DCLM</td><td>from pretrain</td><td>95.2</td><td>-</td><td>-</td><td>-</td><td>-</td><td>-</td><td>-</td></tr><tr><td>DCLM</td><td>FT top 7%</td><td>-</td><td>57.1</td><td>-</td><td>-</td><td>-</td><td>-</td><td>-</td></tr><tr><td>DCLM</td><td>FT top 7% FineWeb ≥ 3</td><td>-</td><td>-</td><td>54.2</td><td>-</td><td>-</td><td>-</td><td>-</td></tr><tr><td>DCLM</td><td>FT top 7% FineWeb ≥ 2</td><td>-</td><td>-</td><td>-</td><td>57.9</td><td>61.8</td><td>75.5</td><td>57.5</td></tr><tr><td rowspan="2">INST</td><td>Flan</td><td>Dolma 1.7 decontaminated</td><td>-</td><td>-</td><td>-</td><td>-</td><td>-</td><td>8.8</td><td>6.7</td></tr><tr><td>Stack Exchange</td><td>2024/09/30 dump Q&amp;A format</td><td>-</td><td>-</td><td>-</td><td>-</td><td>-</td><td>0.7</td><td>0.5</td></tr><tr><td rowspan="2">CODE</td><td>Starcoder</td><td>from pretrain</td><td>2.1</td><td>19.5</td><td>20.9</td><td>19.2</td><td>-</td><td>-</td><td>-</td></tr><tr><td>CodeSearchNet</td><td>unfiltered</td><td>-</td><td>-</td><td>-</td><td>-</td><td>0.1</td><td>0.2</td><td>0.1</td></tr><tr><td rowspan="5">REFERENCE</td><td>Gutenberg Books</td><td>from Dolma 1.7</td><td>-</td><td>1.2</td><td>1.3</td><td>1.2</td><td>-</td><td>-</td><td>-</td></tr><tr><td>peS2o</td><td>from pretrain</td><td>1.5</td><td>6.6</td><td>7.1</td><td>6.5</td><td>10.7</td><td>13.0</td><td>9.9</td></tr><tr><td>Wikipedia</td><td>from pretrain</td><td>0.1</td><td>0.9</td><td>0.9</td><td>0.9</td><td>1.6</td><td>1.9</td><td>1.4</td></tr><tr><td>StackExchange</td><td>from RedPajama v1</td><td>-</td><td>4.0</td><td>4.3</td><td>4.0</td><td>-</td><td>-</td><td>-</td></tr><tr><td>ArXiv</td><td>from pretrain</td><td>0.5</td><td>4.9</td><td>5.2</td><td>4.8</td><td>-</td><td>-</td><td>-</td></tr><tr><td rowspan="5">MATH</td><td>Algebraic Stack</td><td>from pretrain</td><td>0.3</td><td>2.8</td><td>3.0</td><td>2.7</td><td>-</td><td>-</td><td>-</td></tr><tr><td>OpenWebMath</td><td>from pretrain</td><td>0.3</td><td>2.9</td><td>3.1</td><td>2.8</td><td>5.2</td><td>-</td><td>4.8</td></tr><tr><td>GSM8k</td><td>train split</td><td>-</td><td>-</td><td>0.003</td><td>0.003</td><td>0.003</td><td>-</td><td>0.003</td></tr><tr><td>Mathpile</td><td>commercial subset train split</td><td>-</td><td>-</td><td>-</td><td>-</td><td>2.1</td><td>-</td><td>1.9</td></tr><tr><td>AutoMathText</td><td>unfiltered</td><td>-</td><td>-</td><td>-</td><td>-</td><td>18.5</td><td>-</td><td>17.2</td></tr></table>

Table 10 A summary of high-quality sources we evaluate for mid-training. We experiment with mixing these sources in 6 mixes, each consisting of 50 billion tokens. Percentages on the table indicate the fraction of each 50B mix that is comprised by data from the respective source. PT Mix is sampled (with repetition) from the pretraining stage.

表 10｜A summary of high-quality sources we evaluate for mid-training. We experiment with mixing these sources in 6 mixes, each consisting of 50 billion tokens. Percentages on the table i

• **FastText classifier from Li et al. (2024).** To train this model<sup>10</sup>, Li et al. sampled positive documents from the Reddit subset in ELI5 (Fan et al., 2019), and demonstrations from Open Hermes 2.5<sup>11</sup>. Negatives are sampled at random from the DCLM pipeline.

- **FastText 分类器** (Li et al., 2024)。为了训练该模型，Li 等人从 ELI5 (Fan et al., 2019) 的 Reddit 子集中采样正例文档，并从 Open Hermes 2.5 中采样示例。负例从 DCLM 流程中随机采样。

• **FineWeb Edu classifier from Penedo et al. (2024).** This model<sup>12</sup> is fine-tuned from the Arctic Embed M<sup>13</sup> encoder (Merrick et al., 2024) on over 400,000 web pages labeled by Llama 3 70B Instruct. This classifier scores documents from 0 to 5 according to adherence to academic topics and polished content.


Following Li et al. (2024), we use the DCLM FastText classifier with a threshold of 0.03311014, which retains approximately 65.6% of the web subset. We combine this filter with the scores from FineWeb Edu classifier; we experiment by retaining documents with score over 3 (5.8% retained), as well as a more relaxed threshold of 2 (20.3% retained).

遵循 Li 等人（2024），我们使用 DCLM FastText 分类器，阈值为 0.03311014，保留了约 65.6% 的网页子集。我们将此过滤器与 FineWeb Edu 分类器的分数结合；我们实验保留分数超过 3 的文档（保留 5.8%），以及更宽松的阈值 2（保留 20.3%）。

**Instruction data and Q&A pairs** We leverage the same subset of FLAN Wei et al. (2021); Longpre et al. (2023) from Dolma 1.7 (Soldaini et al., 2024). We decontaminated this source by extracting training, validation,

我们利用了来自 Dolma 1.7 (Soldaini et al., 2024) 的相同 FLAN 子集（Wei et al., 2021; Longpre et al., 2023）。我们通过从评测套件（第 2.5 节）中的所有任务中提取训练，验证和测试实例来对该来源进行去污染，并移除与任何任务实例有 10% 或更多重叠 n-gram 的 FLAN 文档。

<small><span class="docvortex-page-footnote" data-block-type="page_footnote" style="color:#6b7280">10 [mlfoundations/fasttext-oh-eli5](https://huggingface.co/mlfoundations/fasttext-oh-eli5)</span></small>

<small><span class="docvortex-page-footnote" data-block-type="page_footnote" style="color:#6b7280">11 [datasets/teknium/OpenHermes-2.5](https://huggingface.co/datasets/teknium/OpenHermes-2.5)</span></small>

<small><span class="docvortex-page-footnote" data-block-type="page_footnote" style="color:#6b7280">12 [HuggingFaceFW/fineweb-edu-classifier](https://huggingface.co/HuggingFaceFW/fineweb-edu-classifier)</span></small>

<small><span class="docvortex-page-footnote" data-block-type="page_footnote" style="color:#6b7280">13 [Snowflake/snowflake-arctic-embed-m](https://huggingface.co/Snowflake/snowflake-arctic-embed-m)</span></small>

<small><span class="docvortex-page-footnote" data-block-type="page_footnote" style="color:#6b7280">14 [datasets/HuggingFaceFW/fineweb-edu-llama3-annotations](https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu-llama3-annotations5)</span></small>

<!-- page 22 of 58 -->

and test instances from all tasks in our evaluation suite (Section §2.5) and removed FLAN documents with 10% or more overlapping ngrams with any task instance.


We source question and answer pairs from the Stack Exchange network, a collection of 186 forums dedicated to a wide variety of topics. Content on Stack Exchange network is licensed under various commercial-friendly Creative Common licenses. We use the latest database dump (September 30 , 2024) at the time of writing, which is distributed by the Internet Archive . We filter questions to those that have an accepted answer; further, we remove Q&A pairs whose questions have fewer than 3 votes or answers have fewer than 5 votes. Once filtered, we concatenate questions and answers together using a sequence of new lines that contains one more \n than the longest sequence of newlines in either the question or answer.

我们从 Stack Exchange 网络获取问答对，这是一个包含 186 个论坛的集合，涵盖各种主题。Stack Exchange 网络的内容以各种商业友好的 Creative Common 许可证授权。我们使用撰写时的最新数据库转储（2024 年 9 月 30 日），由 Internet Archive 分发。我们过滤出问题有已接受答案的问答对；进一步地，我们移除问题得票少于 3 票或答案得票少于 5 票的问答对。过滤后，我们使用一系列换行符将问题和答案连接在一起，换行符数量比问题或答案中最长的换行序列多一个。

**Code** We evaluate retaining the same subset of code used during pretraining; furthermore, we consider smaller, curated sources of code interleaved with natural supervision, such as docstrings in CodeSearchNet (Husain et al., 2019); Q&A pairs from StackExchange described in the paragraph above also contain code.

我们评估保留预训练期间使用的相同代码子集；此外，我们考虑较小的，经过整理的代码来源，这些来源与自然监督交错，例如 CodeSearchNet (Husain et al., 2019) 中的文档字符串；上述段落中描述的 StackExchange 问答对也包含代码。

**Academic, encyclopedic and other reference content** We source high-quality non-web datasets from Dolma 1.7 (Soldaini et al., 2024). This includes peS2o (Soldaini and Lo, 2023), Wikipedia, and Wikibooks, Gutenberg books, arXiv and StackExchange (from Red-Pajama v1; Together AI, 2023), Algebraic Stack (ProofPile II; Azerbayev et al., 2023).

我们从 Dolma 1.7 (Soldaini et al., 2024) 获取高质量的非网络数据集。这包括 peS2o (Soldaini and Lo, 2023)，Wikipedia，Wikibooks，Gutenberg 书籍，arXiv 和 StackExchange（来自 Red-Pajama v1; Together AI, 2023），Algebraic Stack(ProofPile II; Azerbayev et al., 2023).

Math In parallel to developing the math subset of Dolmino Mix 1124 (Section §4.4), we consider preliminary math subset to gauge how math documents combine with the non-math portion of the mix. In particular, we used OpenWebMath (Paster et al., 2023), the train split of GSM8K (Cobbe et al., 2021), the train split of the permissively licensed (“commercial”) subset of MathPile (Wang et al., 2023b), and AutoMathText (Zhang et al., 2024b).

在并行开发 Dolmino Mix 1124 的数学子集（第 4.4 节）的同时，我们考虑了初步的数学子集，以评估数学文档如何与混合配方的非数学部分结合。具体而言，我们使用了 OpenWebMath (Paster et al., 2023), GSM8K (Cobbe et al., 2021) 的训练拆分，MathPile (Wang et al., 2023b) 的宽松许可（「商业」）子集的训练拆分，以及 AutoMathText (Zhang et al., 2024b).

| Mid-training mix | OLMES (MCF) | OLMES-Gen | MMLU (MCF) | GSM* |
| --- | --- | --- | --- | --- |
| n/a (pretrain checkpoint) | 69.6 | 63.2 | 59.8 | 28.5 |
| PT Mix | 74.0 | 64.5 | 61.8 | 27.0 |
| Web <sup>FT7</sup> | 73.5 | 64.1 | 61.9 | 24.5 |
| Web FFTW73 | 73.5 | 63.0 | 62.4 | 30.5 |
| Web FFTW72 | 75.2 | 63.8 | 63.1 | 28.5 |
| Web FFTW72+ Ins | 74.2 | 64.1 | 63.0 | 46.0 |
| Web FFTW72+ Math | 75.7 | 69.7 | 62.3 | 52.0 |
| Web FFTW72+ Math + Ins | 75.7 | 70.2 | 63.1 | 46.5 |

Table 11 Comparison of mid-training mixes introduced in Table 10. Each row corresponds to a 50 billion token training run following learning rate schedule described in Section §4.1 (except first row). Weights are initialized from a OLMo 2 checkpoint pretrained for 4T tokens. We compare each run on a mix of OLMES core tasks (multiple choice format; see Table 6), OLMES generative tasks (Table 6), MMLU (multiple choice format; Hendrycks et al., 2021a), and a random sample of 200 GSM8K (Cobbe et al., 2021) questions we use as development set (GSM\*; Section §A.1). Results on the final mid-training mix are in Table 9.

表 11｜Comparison of mid-training mixes introduced in Table 10. Each row corresponds to a 50 billion token training run following learning rate schedule described in Section §4.1 (except 

> **拆开：** Table 11 每行都是 50B token 的 mid-training，PT Mix 单独退火为什么也有提升？
> §4.3：仅学习率退火（PT Mix）就在平均指标上带来可观改进；再叠加高质量 web / 非 web / 数学源继续涨。也就是说 Stage 2 的收益不全是「换数据」，也包含退火日程本身。


Results of mixes shown in Table 10 are summarized in Table 11. All results correspond to mid-training runs on 50 billion tokens, initialized from a 7B model checkpoint pretrained on 4 trillion tokens.

表 10 中显示的混合配方的结果总结在表 11 中。所有结果对应于在 50B token 上的中期训练运行，从在 4T token 上预训练的 7B 模型检查点初始化。

We find that, as noted in Section §4.1, learning rate anneal (PT Mix) alone yields notable improvements across all averages (OLMES +4.4; OLMES-Gen +1.3; MMLU +20), but not on our math development set (GSM\* −1.5). Switching to mixes that contain higher quality web data and reference content further improves performance: Web $^ { \mathsf { F T } _ { 7 } } _ { \mathsf { F W } _ { 2 } }$ further improves +1.2 points over PT Mix in OLMES and +1.3 in MMLU; it is slightly worse on OLMES-Gen (−0.4) and within margin of error on GSM\* (+1.5). Finally including instruction data

我们发现，正如第 4.1 节所指出的，仅学习率退火（PT Mix）就在所有平均分上产生了显著的提升（OLMES +4.4; OLMES-Gen +1.3; MMLU +2.0），但在我们的数学开发集上没有提升（GSM* −1.5）。切换到包含更高质量网页数据和参考内容的混合配方进一步提升了性能：Web FT7 + FW2 在 OLMES 上比 PT Mix 进一步提升了 +1.2 点，在 MMLU 上提升了 +1.3；它在 OLMES-Gen 上稍差（−0.4），在 GSM* 上在误差范围内（+1.5）。最后在混合配方中纳入指令数据和数学来源产生了最佳性能。Web FT7 + FW2 + Math + Ins 混合配方取得了最佳总体结果，OLMES +1.7，生成任务 +5.7, MMLU +1.3, GSM* +19.5。我们注意到 Web FT7 + FW2 + Math 混合配方在数学任务上表现稍好，这促使我们在第 4.4 节中研究与其他高质量来源更好地结合的数学子集。

<!-- page 23 of 58 -->

and math sources in the mix yields the best performance. Web $F W _ { 2 } + M a t h + I n S$ mix achieves best overall results, with +1.7 on OLMES, +5.7 on generative tasks, +1.3 on MMLU, and +19.5 on GSM\*. We note that Web $^ { \mathsf { F T } _ { 7 } } _ { \mathsf { F W } _ { 2 } } +$ Math mix performs slightly better on math tasks, motivating our investigation in better math subsets that combine well with other high-quality sources in Section §4.4.


### 4.4 Dolmino Mix 1124: Math Mix 4.4 Dolmino Mix 1124：数学混合

Early mid-training mixes $\mathsf { ( W e b } _ { * } ^ { * }$ only rows in Table 11) show models struggle in math-related benchmarks. Thus, improving performance on these sets is a central focus of our mid-training investigations. We investigate both human-authored and synthetically generated or augmented data; we derived the latter through an iterative procedure aimed at fixing common errors in our math validation sets.


We describe both the data sources and their generation/filtration procedure in Section §4.4.1; then, in Section §4.4.2, we detail microanneals, the experimentation technique we use to finalize math sources. The resulting mix is summarized in Table 5.

我们在第 4.4.1 节中描述了数据来源及其生成/过滤过程；然后在第 4.4.2 节中，我们详细介绍了微退火（microanneals），这是我们用于最终确定数学来源的实验技术。最终的混合配方总结在表 5 中。

#### 4.4.1 Math Sources 4.4.1 数学数据源

**TuluMath** We follow the recent persona-driven methodology in Chan et al. (2024) to generate math synthetic data. The key idea is to use different personas $\mathrm{(e.g.,~ " A}$ machine learning researcher focused on neural networks”) with a data synthesis prompt (e.g.，“create a math problem”) to steer an LM to synthesize data with corresponding perspectives. Specifically, we condition on available personas from Persona Hub (Chan et al., 2024) to generate prompts targeting Math problems both those that require advanced mathematical skills as well as grade school problems. We zero-shot-prompt $\mathrm{GPT{-}4o^{16}}$ to generate problems that are unique and specific to a given persona input. Having generated the problems, we then generate multi-step math solutions using GPT-4o. Exact prompts used to generate problems and solutions are provided in Appendix Figures 24 and 25. In total, we collected ∼ 230M synthetic math tokens.

我们遵循 Chan 等人（2024）最近提出的基于人格驱动的方法来生成数学合成数据。关键思想是使用不同的人格（例如，「一位专注于神经网络的机器学习研究者」）配合数据合成提示（例如，「创建一个数学问题」）来引导语言模型合成具有相应视角的数据。具体而言，我们以 Persona Hub (Chan et al., 2024) 中可用的人格为条件，生成针对数学问题的提示，既包括需要高级数学技能的问题，也包括小学级别的问题。我们用零样本提示 GPT-4o 生成对于给定人格输入独特且特定的问题。生成问题后，我们使用 GPT-4o 生成多步数学解答。用于生成问题和解答的精确提示见附录图 24 和 25。总计，我们收集了约 2.3 亿个合成数学 token。

**DolminoSynthMath** This is a collection of 28M synthetic math tokens designed specifically to improve performance on GSM8K as well as raw mathematical calculations. It is composed of three parts: first we generate 11M tokens of basic mathematical question and answer pairs such as $`` 77 \;  *  \; 14 = 1078  ''$ and pair each of these with a variety of prompts. We find that including such data dramatically mitigates the mistakes our model makes within individual CoT reasoning steps at inference time. Next we include a custom collection of 7,924 synthetic GSM8K examples, which are produced by consuming a GSM8K training example and replacing all of its numbers in both the provided question and answer, with the hope that this would provide signal to the model to extract the computation graph from a word problem and ignore irrelevant semantic features. Finally we include a MIND-rewriting (Akter et al., 2024) of each of the GSM8K training examples, where the synthetic data was generated using Qwen2.5-7B-Instruct (Qwen et al., 2024).

这是一个包含 2800 万个合成数学 token 的集合，专门设计用于提升 GSM8K 以及原始数学计算的性能。它由三部分组成：首先，我们生成 1100 万个基本数学问答对 token，例如「77 × 14 = 1078」，并将每个问答对与多种提示配对。我们发现，包含此类数据极大地缓解了我们模型在推理时单个 CoT 推理步骤中犯的错误。接下来，我们包含一个自定义的 7,924 个合成 GSM8K 示例集合，这些示例通过获取一个 GSM8K 训练示例并替换所提供问题和答案中的所有数字来生成，希望这能为模型提供从文字问题中提取计算图并忽略不相关语义特征的信号。最后，我们包含每个 GSM8K 训练示例的 MIND 重写（Akter et al., 2024），其中合成数据使用 Qwen2.5-7B-Instruct (Qwen et al., 2024) 生成。

**TinyGSM-MIND** We generated approximately 6.5B tokens of synthetic math data from rewritten versions of Tiny-GSM (Liu et al., 2023a). Tiny-GSM is a collection of 11M synthetic GSM8K-like questions, where the answers are provided in the form of python code. We filter this set to only include answers that have code that is executable and only contains statements that are variable assignments. We then annotate each line of the code that is an assignment operator with the numerical value of the resulting variable. Then we pass all of these annotated examples to Qwen2.5-7B-Instruct to be rewritten in the style of MIND (Akter et al., 2024) using the ‘Two Students’ and ‘Problem Solving’ prompts.

我们从 Tiny-GSM (Liu et al., 2023a) 的重写版本中生成了约 65 亿个合成数学数据 token. Tiny-GSM 是一个包含 1100 万个合成 GSM8K 风格问题的集合，其中答案以 Python 代码形式提供。我们将该集合过滤为仅包含可执行代码且只包含变量赋值语句的答案。然后，我们用结果变量的数值注释代码中每个赋值运算符的行。然后，我们将所有这些注释过的示例传递给 Qwen2.5-7B-Instruct，使用「两名学生」和「问题解决」提示以 MIND (Akter et al., 2024) 的风格进行重写。

**MathCoder2-Synthetic** We emulate the synthetic data generation procedure of MathCoder2 (Lu et al., 2024) to filter existing synthetic data from open-source repositories. In particular, we collect the synthetic textbooks from HuggingFace user Ajibawa-2023,17,18 and from the M-A-P Matrix dataset and perform additional filtering on them. In particular we train a FastText classifier as follows: we ask GPT-4o to annotate 10,000

我们仿效 MathCoder2 (Lu et al., 2024) 的合成数据生成过程，从开源仓库中过滤现有的合成数据。具体而言，我们收集了来自 HuggingFace 用户 Ajibawa-2023 和 M-A-P Matrix 数据集的合成教科书，并对它们进行额外的过滤。具体而言，我们训练了一个 FastText 分类器：我们让 GPT-4o 将 10,000 个 OpenWebMath 示例标注为数学相关或非数学相关；然后我们将这些用作 FastText 分类器的正负例。我们将该分类器应用于合成教科书，只保留数学相关的部分。

<small><span class="docvortex-page-footnote" data-block-type="page_footnote" style="color:#6b7280">16<sub>2024-0</sub>8-06</span></small>

<small><span class="docvortex-page-footnote" data-block-type="page_footnote" style="color:#6b7280">17 [datasets/ajibawa-2023/Maths-College](https://huggingface.co/datasets/ajibawa-2023/Maths-College)</span></small>

<small><span class="docvortex-page-footnote" data-block-type="page_footnote" style="color:#6b7280">18 [datasets/ajibawa-2023/Education-College-Students](https://huggingface.co/datasets/ajibawa-2023/Education-College-Students)</span></small>

<!-- page 24 of 58 -->

OpenWebMath examples (Paster et al., 2023) as either math-related or non-math-related; we then use these as positive and negative examples for a FastText classifiers. We apply this classifier to the synthetic textbooks and only keep the math-related ones.


**ProofPile OWM-Filtered** We use the same OpenWebMath filter generated in the previous step and apply it to Metamath (Yu et al., 2023) and CodeSearchNet (Husain et al., 2019).

我们使用上一步生成的相同 OpenWebMath 过滤器，并将其应用于 Metamath (Yu et al., 2023) 和 CodeSearchNet (Husain et al., 2019).

**GSM8K-Train** Finally, we include the training split of GSM8K (Cobbe et al., 2021).

最后，我们包含 GSM8K (Cobbe et al., 2021) 的训练拆分。

#### 4.4.2 Evaluating Math Data with Microanneals 4.4.2 用 microanneal 评数学数据

To select the highest quality subset of all available and synthetic math data, we perform a series of several microanneals, which were annealing runs focused on small math subsets. The general recipe for these microanneals is as follows:

为了从所有可用和合成数学数据中选择最高质量的子集，我们进行了一系列微退火（microanneals），即专注于小型数学子集的退火运行。

1. identify a source or small collection of math sources that we want to assess the data quality of;

1. **确定我们想要评估数据质量的一个来源或一小部分数学来源；**

2. collect roughly the same quantity of data from the general data mix (e.g., DCLM) as from the math sources to ensure a mixture of high-quality web text alongside domain-specific math;

2. **从通用数据混合配方（例如 DCLM）中收集与数学来源大致相同数量的数据，以确保高质量网页文本与领域特定数学的混合；**

3. train this 50/50 mixture as if it were an annealing run, making sure to linearly drive the learning rate down at the proper rate for this smaller collection of data.

3. **将这个 50/50 的混合配方作为退火运行来训练，确保以适合这一较小数据集合的适当速率线性降低学习率。**

This procedure facilitates evaluating the quality of individual data sources at a fraction of the cost of a full annealing run. In total, we run 19 separate microanneals with a total token count of 130B tokens, equivalent to less than 3 full 50B annealing runs. Putting this cost into perspective, the totality of the 19 microanneals requires less compute than the 3 50B token souping ingredients used for our 7B model. More explicitly, it shows improvements at a much finer-grained data-source resolution, with results visible after training for less than 10B tokens.

这一程序有助于以完整退火运行成本的一小部分来评估单个数据来源的质量。总计，我们运行了 19 个独立的微退火，总 token 数为 130B，相当于不到 3 个完整的 50B 退火运行。将这一成本放在 perspective 中，19 个微退火的总计算量少于我们 7B 模型使用的 3 个 50B token 汤化成分。更明确地说，它在更细粒度的数据来源分辨率上显示改进，在训练不到 10B token 后就能看到结果。

<table><tr><td colspan="5">Microanneal Experiment 1</td></tr><tr><td>Mix</td><td>Web ratio</td><td>Tokens</td><td>MMLU (avg)</td><td>GSM*</td></tr><tr><td>Baseline</td><td>n/a</td><td>n/a</td><td>59.8</td><td>28.5</td></tr><tr><td>Math 35/65</td><td>65.0%</td><td>576M</td><td>60.1</td><td>63.5</td></tr><tr><td>Math 10/90</td><td>88.3%</td><td>1.72B</td><td>60.9</td><td>61.0</td></tr><tr><td colspan="5">Microanneal Experiment 2</td></tr><tr><td>Mix</td><td>Web ratio</td><td>Tokens</td><td>MMLU (avg)</td><td>GSM*</td></tr><tr><td>Baseline</td><td>n/a</td><td>n/a</td><td>59.8</td><td>28.5</td></tr><tr><td>1x Math</td><td>65.0%</td><td>576M</td><td>60.1</td><td>63.5</td></tr><tr><td>2x Math</td><td>49.3%</td><td>798M</td><td>60.3</td><td>66.0</td></tr><tr><td>4x Math</td><td>48.6%</td><td>1.57B</td><td>60.5</td><td>65.0</td></tr><tr><td colspan="5">Microanneal Experiment 3</td></tr><tr><td>Mix</td><td>Web ratio</td><td>Tokens</td><td>MMLU (avg)</td><td>GSM*</td></tr><tr><td>Baseline</td><td>n/a</td><td>n/a</td><td>59.8</td><td>28.5</td></tr><tr><td>TinyGSM-Inline</td><td>47.9%</td><td>3.17B</td><td>60.4</td><td>25.0</td></tr><tr><td>TinyGSM-MIND</td><td>52.1%</td><td>6.40B</td><td>61.4</td><td>65.5</td></tr><tr><td>2x TinyGSM-MIND</td><td>51.3%</td><td>12.6B</td><td>62.1</td><td>70.0</td></tr></table>

**Table 12** Results from microanneal experiments to OLMo 2 math capabilities. We evaluate math/not-math mixture ratio, impact of repeating math tokens, and different math datasets. We use a random sample of 200 GSM8K (Cobbe et al., 2021) questions we use as development set (GSM\*; Section §A.1) as a proxy for math capabilities. We monitor average MMLU scores to ensure OLMo 2 remains performant on knowledge intensive tasks.

表 12｜Results from microanneal experiments to OLMo 2 math capabilities. We evaluate math/not-math mixture ratio, impact of repeating math tokens, and different math datasets. We use a ra

We illustrate how microanneals lead to our final math mix through three sets of experiments reported in Table 12. The primary evaluation metrics we use to evaluate the quality here is MMLU, and GSM\*, which

我们通过表 12 中报告的三组实验来说明微退火如何引导我们得到最终的数学混合配方。我们在此用于评估质量的主要评测指标是 MMLU 和 GSM*，后者是我们从 GSM8K 评测集中抽取的 200 个示例子集。请注意，中期训练的一个目标是提升 GSM8K 性能，但我们只允许自己在 1319 个 GSM8K 示例中的 200 个上检查性能，以指导数据混合配方的决策。

<!-- page 25 of 58 -->

is our 200-example subset of the GSM8K evaluation set. Note that one goal of mid-training is to improve GSM8K performance, but we only allow ourselves to inspect performance on 200 of the 1319 GSM8K examples to inform decisions about data mixtures.


**Microanneal experiment 1: domain specific data is helpful even in small proportions** We run the following experiment: starting from a 7B model that has completed pretraining, and a mixture of TuluMath, Dolmi noSynthMath, Metamath, CodeSearchNet, and GSM8K-Train, accounting for approximately 200M tokens, we train on both a 35/65 math/DCLM mixture and a 10/90 mixture and evaluate both the MMLU and GSM\*. We see that the pre-anneal had a GSM\* score of 28.5, the 35/65 mixture yields a GSM\* of 63.5, and the 10/90 mixture yields a GSM\* of 61. This suggests that it is not strictly necessary to have a large proportion of domain-specific data in the annealing mixture, just that domain-specific data is present.

我们进行以下实验：从已完成预训练的 7B 模型开始，使用 TuluMath，DolminoSynthMath，Metamath，CodeSearchNet 和 GSM8K-Train 的混合配方，总计约 2 亿 token，我们在 35/65 的数学/DCLM 混合配方和 10/90 的混合配方上训练，并评估 MMLU 和 GSM*。我们看到预退火的 GSM* 分数为 28.5, 35/65 混合配方产生 63.5 的 GSM*，10/90 混合配方产生 61 的 GSM*。这表明在退火混合配方中不一定需要很大比例的领域特定数据，只需要领域特定数据存在即可。

**Microanneal experiment 2: some duplication is beneficial** Starting from the same setup as the previous experiment, we duplicate the math data for a total of two copies, and four copies. We see that one copy of the math yields a GSM\* score of 61, two copies yields a score of 66, and four copies yields a score of 65. This suggests that even if there is a scarcity of high-quality domain-specific data, duplicating it a small number of times can still provide some gains.

从前一个实验的相同设置开始，我们将数学数据复制两份和四份。我们看到一份数学数据产生 61 的 GSM* 分数，两份产生 66 分，四份产生 65 分。这表明即使高质量领域特定数据稀缺，少量复制它仍然可以提供一些收益。

**Microanneal experiment 3: rewriting can help dramatically** Here we once again start with a 7B model that has completed pretraining and evaluate the effect that rewriting Tiny-GSM into a natural language format has on GSM\* evaluation scores. Recall that Tiny-GSM has answers written in the form of code, and that our pretraining mix is only 2% code. We run a microannealing run on a mixture using an inline-annotated form of TinyGSM and compare it to just the ‘Problem Solving’ MIND rewritten variant of TinyGSM. Relative to the baseline, the code version of TinyGSM degrades GSM\* performance, while the rewritten version dramatically improves the performance. This suggests the power of rewriting as a tool to cheaply convert data to a more amenable form for training.

在这里，我们再次从已完成预训练的 7B 模型开始，评估将 Tiny-GSM 重写为自然语言格式对 GSM* 评测分数的影响。回想一下，Tiny-GSM 的答案以代码形式编写，而我们的预训练混合配方中只有 2% 的代码。我们在使用内联注释形式的 TinyGSM 的混合配方上运行微退火，并将其与仅使用「问题解决」MIND 重写变体的 TinyGSM 进行比较。相对于基线，TinyGSM 的代码版本降低了 GSM* 性能，而重写版本显著提升了性能。这表明重写作为一种工具的强大力量，可以低成本地将数据转换为更适合训练的形式。

### 4.5 Final Midtraining mix and Checkpoint Soups 4.5 最终 Mid-training 混合与 Checkpoint Soup

<table><tr><td rowspan="2">Source</td><td rowspan="2">Tokens</td><td colspan="2">50B</td><td colspan="2">100B</td><td colspan="2">300B</td></tr><tr><td>Source %</td><td>Mix %</td><td>Source %</td><td>Mix %</td><td>Source %</td><td>Mix %</td></tr><tr><td>Filtered DCLM</td><td>752B</td><td>3.23</td><td>47.2</td><td>6.85</td><td>50.2</td><td>20.78</td><td>51.9</td></tr><tr><td>Decontam. FLAN</td><td>17.0B</td><td>50.0</td><td>16.6</td><td>100</td><td>16.7</td><td>200</td><td>11.3</td></tr><tr><td>StackExchange Q&amp;A</td><td>1.26B</td><td>100</td><td>2.45</td><td>200</td><td>2.47</td><td>400</td><td>1.68</td></tr><tr><td>peS2o</td><td>58.6B</td><td>5.15</td><td>5.85</td><td>16.7</td><td>9.52</td><td>100</td><td>19.4</td></tr><tr><td>Wikipedia/Wikibooks</td><td>3.7B</td><td>100</td><td>7.11</td><td>100</td><td>3.57</td><td>400</td><td>4.86</td></tr><tr><td>Dolmino Math</td><td>10.7B</td><td>100</td><td>20.8</td><td>200</td><td>17.5</td><td>400</td><td>10.8</td></tr></table>

**Table 13** Dolmino Mix 1124 compositions. The Source % column indicates the fraction of the source that was used in the Dolmino mix. Numbers in this column greater than 100 indicate we used the data, e.g. 400 indicates a 4x repeat. The Mix % column describes the proportion of the Dolmino mix that is composed of this source, i.e., this column should sum to 100%.

表 13｜Dolmino Mix 1124 compositions. The Source % column indicates the fraction of the source that was used in the Dolmino mix. Numbers in this column greater than 100 indicate we used t

The final composition of Dolmino Mix 1124 is shown in Table 5. As previously mentioned, we sample 3 mixes of 50B, 100B, and 300B tokens; composition of each is summarized in Table 13. Since experiments in Section §4.3 and §4.4.2 show that keeping mixing proportion roughly constant across sources is beneficial, we repeat Stack Exchange Q&A data and mid-training math data twice for the 100B tokens mix, and four times for the 300B mix; additionally, we repeat FLAN twice and Wiki data four times for the 300B mix. Across all mixes, filtered web data from the DCLM baseline represents roughly 50% of the total tokens budget.

Dolmino Mix 1124 的最终组成如表 5 所示。如前所述，我们采样了 50B，100B 和 300B token 的三种混合配方；每种配方的组成总结在表 13 中。由于第 4.3 节和第 4.4.2 节的实验表明，保持各来源的混合比例大致恒定是有益的，我们将 Stack Exchange Q&A 数据和中期训练数学数据在 100B token 混合配方中重复两次，在 300B 混合配方中重复四次；此外，我们在 300B 混合配方中将 FLAN 重复两次，Wiki 数据重复四次。在所有混合配方中，来自 DCLM baseline 的过滤网页数据约占总 token 预算的 50%。

We train OLMo 2 7B on the 50B mix. To account for the larger batch size (Section §2.3), we use the 100B mix for OLMo 2 13B, ensuring the same number of steps during learning rate anneal. Further, we experiment

我们在 50B 混合配方上训练 OLMo 2 7B. 为了适应更大的批次大小（第 2.3 节），我们对 OLMo 2 13B 使用 100B 混合配方，确保学习率退火期间的步数相同。此外，我们使用 300B 混合配方对 OLMo 2 13B 实验了更长的退火阶段。我们对 32B 模型遵循相同的流程。

<!-- page 26 of 58 -->

with a longer anneal phase with OLMo 2 13B using the 300B mix. We follow the same procedure for the 32B model.


| Mid-training mix | OLMES (MCF) | OLMES-Gen | MMLU (MCF) | GSM* |
| --- | --- | --- | --- | --- |
| best single | 75.6 | 68.5 | 61.2 | 71.0 |
| A |  |  |  |  |
| 3 x soup | 77.0 | 69.4 | 62.0 | 74.0 |
| best single | 75.3 | 69.9 | 61.5 | 73.0 |
| B |  |  |  |  |
| 3 x soup | 77.3 | 70.1 | 62.7 | 77.0 |
| best single | 76.3 | 70.9 | 62.8 | 66.0 |
| C |  |  |  |  |
| 3 x soup | 76.8 | 71.3 | 63.5 | 66.0 |
| best single | 77.5 | 71.2 | 63.4 | 59.5 |
| D |  |  |  |  |
| 3 x soup | 77.8 | 71.7 | 63.5 | 60.0 |
| best single | 73.4 | 63.1 | 62.2 | 60.5 |
| E |  |  |  |  |
| 3 x soup | 75.3 | 64.2 | 63.1 | 43.0 |
| best single | 77.1 | 69.9 | 63.7 | 73.5 |
| F |  |  |  |  |
| 3 x soup | 77.9 | 70.4 | 63.7 | 74.5 |

Table 14 Comparison of six mid-training mixes between best single checkpoint and the average of three checkpoints (soup) trained on different data permutations. We run all experiments starting from 7B pretrained checkpoint; we run mid-training stage for 50B tokens. Souping consistently equals or outperform the single best checkpoint trained on the same mix.

表 14｜Comparison of six mid-training mixes between best single checkpoint and the average of three checkpoints (soup) trained on different data permutations. We run all experiments start

**Mid-training model merging or ‘‘soups’’** Performing a naïve average of multiple model checkpoints trained with a different data order has been proven effective in both computer vision (Wortsman et al., 2022) and language modeling (Li et al., 2024) applications. We confirm the effectiveness of this approach, also known as model merging or “souping”，on six different mid-training mixes, as shown in Table 14. For all experiments, we find that merging 3 checkpoints annealed on three permutations of the same data mix consistently produces equal or better performance than any individual training run.

对以不同数据顺序训练的多个模型检查点进行朴素平均，已被证明在计算机视觉（Wortsman et al., 2022）和语言建模（Li et al., 2024）应用中都是有效的。我们确认了这种方法的有效性，它也被称为模型合并或「汤化（souping）」，在六种不同的中期训练混合配方上，如表 14 所示。对于所有实验，我们发现将三个在相同数据混合配方的三种排列上退火的检查点合并，始终产生等于或优于任何单个训练运行的性能。

Based on this evidence, we extensively use model merging to obtain our final OLMo 2 7B and 13B models. For OLMo 2 7B, we average three checkpoints trained on the 50B sample of Dolmino Mix 1124. For OLMo 2 13B and 32B, we average four checkpoints: three trained on the 100B sample, and one trained on a 300B sample; we find this approach to be empirically better than averaging just the three 100B runs alone.

基于这一证据，我们广泛使用模型合并来获得最终的 OLMo 2 7B 和 13B 模型。对于 OLMo 2 7B，我们平均在 Dolmino Mix 1124 的 50B 样本上训练的三个检查点。对于 OLMo 2 13B 和 32B，我们平均四个检查点：三个在 100B 样本上训练的，和一个在 300B 样本上训练的；我们发现这种方法在经验上比仅平均三个 100B 运行的效果更好。

## 5 Deep Dive: Post-training Pipeline 5 深挖：后训练流水线

To adapt OLMo 2 to downstream generative tasks, we follow the Tülu 3 recipe (Lambert et al., 2024) with an increased focus on permissive licenses and suitable adjustments to hyperparameters. The Tülu 3 approach involves three phases of training: supervised finetuning (SFT), preference tuning with Direct Preference Optimization (DPO; Rafailov et al., 2024) and on-policy preference data, and finally Reinforcement Learning with Verifiable Rewards (RLVR). We find that all of the stages in the Tülu 3 Recipe easily translate to the OLMo 2 models. This section focuses on the development of our 7B and 13B models, where the 1B and 32B models followed very similar recipes.

为了使 OLMo 2 适应下游生成任务，我们遵循 Tülu 3 配方（Lambert et al., 2024），并更加注重宽松许可证和对超参数的适当调整。Tülu 3 方法涉及三个训练阶段：监督微调（SFT, Supervised Fine-Tuning），使用直接偏好优化（DPO, Direct Preference Optimization; Rafailov et al., 2024）和 on-policy 偏好数据的偏好调优，最后是可验证奖励的强化学习（RLVR, Reinforcement Learning with Verifiable Rewards）。我们发现 Tülu 3 配方的所有阶段都可以轻松迁移到 OLMo 2 模型。本节重点介绍我们 7B 和 13B 模型的开发，其中 1B 和 32B 模型遵循非常相似的配方。

**Supervised Finetuning (SFT)** The SFT training of OLMo 2-Instruct from Tülu 3 relies on selecting the highest-quality, existing instruction datasets and complementing them with scaled synthetic data for Supervised Finetuning based on the PersonaHub method (Chan et al., 2024). We develop two SFT mixes— tulu-3-sft-olmo-2-mixture which we used for our 7B and 13B models and tulu-3-sft-olmo-2-mixture-0225 which includes minor modifications and applied to our 1B and 32B models.

OLMo 2-Instruct 的 SFT 训练基于 Tülu 3，依赖于选择最高质量的现有指令数据集，并基于 PersonaHub 方法（Chan et al., 2024）用规模化的合成数据来补充监督微调。我们开发了两种 SFT 混合配方 -- tulu-3-sft-olmo-2-mixture 用于我们的 7B 和 13B 模型，tulu-3-sft-olmo-2-mixture-0225 包含细微修改，用于我们的 1B 和 32B 模型。

For tulu-3-sft-olmo-2-mixture, given that OLMo 2 is not trained for multilingual tasks, we experimented with removing all multilingual data from the SFT stage. When removing the entire Aya split and the multilingual samples of Wildchat from Tülu 3, we saw a degradation of ∼ 0.5 points on average, indicating that the Tülu 3 dataset is balanced and cannot be easily improved by removing irrelevant subsets. In total, this SFT mix contains 939,104 prompts.

对于 tulu-3-sft-olmo-2-mixture，鉴于 OLMo 2 不是为多语言任务训练的，我们尝试从 SFT 阶段移除所有多语言数据。当从 Tülu 3 中移除整个 Aya 拆分和 Wildchat 的多语言样本时，我们看到平均约 0.5 点的下降，这表明 Tülu 3 数据集是平衡的，不能通过移除不相关的子集来轻易改进。总计，该 SFT 混合配方包含 939,104 个提示。

<!-- page 27 of 58 -->

| Category | Benchmark | CoT | # Shots | Chat | Multiturn ICL | Metric |
| --- | --- | --- | --- | --- | --- | --- |
| Knowledge Recall | MMLU PopQA TruthfulQA | ✓✗✗ | 0156 | ✓✓✓ | ✗✓✗ | EM EMMC2 |
| Reasoning | BigBenchHard DROP | ✓✗ | 33 | ✓✗ | ✓N/A | EMF1 |
| Math | GSM8KMATH | ✓✓ | 84 | ✓✓ | ✓✓ | EM Flex EM |
| Instruction Following | IFEval AlpacaEval 2 | ✗✗ | 00 | ✓✓ | N/AN/A | Pass@1 (prompt; loose) LC Winrate |
| Safety | Tülu 3 Safety | ✗ | 0 | ✓ | N/A | Average<sup>∗</sup> |

Table 15 The OLMo 2 Instruct Evaluation Regime (Adapted from Lambert et al. (2024)): settings for development (top) and unseen (bottom) portions of the evaluation suite. CoT are evaluations run with chain of thought prompting (Wei et al., 2022). # shots is the number of in-context examples in the evaluation template. Chat indicates whether we use a chat template while prompting the model. Multiturn ICL indicates that we present each in-context example as a separate turn in a conversation (applicable only when a chat template is used and # Shots is not 0). Average over multiple sub-evaluations—full details of the safety evaluation are in Lambert et al. (2024).

表 15｜The OLMo 2 Instruct Evaluation Regime (Adapted from Lambert et al. (2024)): settings for development (top) and unseen (bottom) portions of the evaluation suite. CoT are evaluations

For the 1B and 32B mix, tulu-3-sft-olmo-2-mixture-0225, we further filtered out instructions that included mentions of a date cutoff from the synthetic data generation process as we noticed it was correlated with undesirable behavior like hallucinating date cutoffs and prefacing responses with “As an AI language model...”。<sup>19</sup> We also use majority voting to improve the quality of answers to our synthetic math questions, that is, preventing SFT on incorrect math answers. For our Persona $MATH ^{20}$ and Grade School Math datasets from Tülu 3, we only include prompts and completions where the model reaches a majority vote over 5 completions. In total, this SFT mix contains 866,138 prompts.

对于 1B 和 32B 的混合配方 tulu-3-sft-olmo-2-mixture-0225，我们进一步过滤掉了合成数据生成过程中包含日期截止提及的指令，因为我们注意到这与不良行为相关，例如幻觉化日期截止和以「作为一个 AI 语言模型...」开头回应。我们还使用多数投票来提升合成数学问题答案的质量，即防止在错误数学答案上进行 SFT。对于来自 Tülu 3 的 Persona MATH 和 Grade School Math 数据集，我们只包含模型在 5 个完成中达到多数投票的提示和完成。总计，该 SFT 混合配方包含 866,138 个提示。

| Epoch | s L.R. | Loss | Avg. Perf. |
| --- | --- | --- | --- |
| 2 | 1e-5 | sum | 49.97 |
| 3 | 4e-6 | sum | 49.76 |
| 2 | 1e-5 | sum | 49.74 |
| 2 | 1e-5 | sum | 49.59 |
| 3 | 4e-6 | mean | 48.25 |
| 2 | 2e-6 | mean | 48.18 |

Table 17 Hyperparameter configurations tried for the 7B SFT checkpoint, all on the same dataset used in the final model. SFT models are trained with an effective batch size of 128, a linear learning rate schedule and a warmup up ratio of 0.3.

表 17｜Hyperparameter configurations tried for the 7B SFT checkpoint, all on the same dataset used in the final model. SFT models are trained with an effective batch size of 128, a linear

![Chart block](images/p27-figure-12-the-average-score-for-dpo-checkpoints-trained.png)

Figure 12 The average score for DPO checkpoints trained on a development SFT checkpoint on different learning rates. Avg does not include Safety.

图 12｜The average score for DPO checkpoints trained on a development SFT checkpoint on different learning rates. Avg does not include Safety.

**Preference Finetuning (PreFT) with DPO** The core strategy of the Tülu 3 pipeline for PreFT is building upon and scaling the UltraFeedback pipeline (Cui et al., 2023) for generating synthetic preferences across data for our target domains. We include on-policy data by sampling responses from some development OLMo 2 SFT models at both 7B and 13B, with independent datasets for each.

Tülu 3 管道用于 PreFT 的核心策略是基于并扩展 UltraFeedback 流程（Cui et al., 2023），为我们的目标领域生成跨数据的合成偏好。我们通过从 7B 和 13B 的开发 OLMo 2 SFT 模型中采样响应来包含 on-policy 数据，每个模型有独立的数据集。

From Tülu 3, we updated our model pool to only include models with permissible licenses as shown in Table 25 in the Appendix. We made a minor shift from Tülu 3 on the exact prompts used for DPO – we obtain our

从 Tülu 3 出发，我们更新了模型池，仅包含具有宽松许可证的模型，如附录中的表 25 所示。我们在 DPO 使用的精确提示上做了与 Tülu 3 的细微调整 -- 我们从表 27 中列出的多个来源获取提示，结果为 7B 生成 366.7k 个提示，为 13B 生成 377.7k 个提示。给定这组提示，我们从 20 个不同家族和规模的模型池中生成响应。

<small><span class="docvortex-page-footnote" data-block-type="page_footnote" style="color:#6b7280">19<sub>These</sub> filtering methods were also applied to the chosen samples in the 32B preference data.</span></small>

<small><span class="docvortex-page-footnote" data-block-type="page_footnote" style="color:#6b7280">20<sub>Filtered</sub> dataset here: [https://huggingface.co/datasets/allenai/tulu-3-sft-personas-math-filtered](https://huggingface.co/datasets/allenai/tulu-3-sft-personas-math-filtered)</span></small>

<small><span class="docvortex-page-footnote" data-block-type="page_footnote" style="color:#6b7280">21<sub>Filtered</sub> dataset here: [https://huggingface.co/datasets/allenai/tulu-3-sft-personas-math-grade-filtered](https://huggingface.co/datasets/allenai/tulu-3-sft-personas-math-grade-filtered)</span></small>

<!-- page 28 of 58 -->

|  | AVG | AE2 | BBH | DROP | GSM8K | IFE | MATH | MMLU | Safety | PQA | TQA |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| OLMo 2 1B SFT | 36.9 | 2.4 | 32.8 | 33.8 | 52.1 | 50.5 | 13.2 | 36.4 | 93.2 | 12.7 | 42.1 |
| OLMo 2 1B DPO | 40.6 | 9.5 | 33.0 | 34.5 | 59.0 | 67.1 | 14.1 | 39.9 | 89.9 | 12.3 | 46.4 |
| OLMo 2 1B Instruct | 42.7 | 9.1 | 35.0 | 34.6 | 68.3 | 70.1 | 20.7 | 40.0 | 87.6 | 12.9 | 48.7 |
| OLMo 2 7B SFT | 51.4 | 10.2 | 49.6 | 59.6 | 74.6 | 66.9 | 25.3 | 61.1 | 94.6 | 23.6 | 48.6 |
| OLMo 2 7B DPO | 55.9 | 27.9 | 51.1 | 60.2 | 82.6 | 73.0 | 30.3 | 60.8 | 93.7 | 23.5 | 56.0 |
| OLMo 2 7B Instruct | 56.5 | 29.1 | 51.4 | 60.5 | 85.1 | 72.3 | 32.5 | 61.3 | 93.3 | 23.2 | 56.5 |
| OLMo 2 13B SFT | 56.6 | 11.5 | 59.9 | 71.3 | 76.3 | 68.6 | 29.5 | 68.0 | 94.3 | 29.4 | 57.1 |
| OLMo 2 13B DPO | 62.0 | 38.3 | 61.4 | 71.5 | 82.3 | 80.2 | 35.2 | 67.9 | 90.3 | 29.0 | 63.9 |
| OLMo 2 13B Instruct | 63.4 | 39.5 | 63.0 | 71.5 | 87.4 | 82.6 | 39.2 | 68.5 | 89.7 | 28.8 | 64.3 |
| OLMo 2 32B SFT | 61.7 | 16.9 | 69.7 | 77.2 | 78.4 | 72.4 | 35.9 | 76.1 | 93.8 | 35.4 | 61.3 |
| OLMo 2 32B DPO | 68.8 | 44.1 | 70.2 | 77.5 | 85.7 | 83.8 | 46.8 | 78.0 | 91.9 | 36.4 | 73.5 |
| OLMo 2 32B Instruct | 68.8 | 42.8 | 70.6 | 78.0 | 87.6 | 85.6 | 49.7 | 77.3 | 85.9 | 37.5 | 73.2 |

Table 16 Comparison of performance for OLMo 2 Instruct after different training stages. The final Instruct model is from the RLVR stage. The following evaluation names are abbreviated: AVG – Average, AE2 – AlpacaEval 2, BBH – BigBenchHard, IFE – IFEval, PQA – PopQA, TQA – TruthfulQA.

表 16｜Comparison of performance for OLMo 2 Instruct after different training stages. The final Instruct model is from the RLVR stage. The following evaluation names are abbreviated: AVG 

> **再看：** Table 16 把 SFT → DPO → RLVR 各阶段并排，RLVR 是不是替换了 DPO 而不是叠在后面？
> §5 / Table 16：最终 Instruct 来自在偏好调优之后继续做可验证奖励强化学习（RLVR）。流水是叠加阶段，不是「RLVR 替换 DPO」。多阶段 RLVR 曲线见 Figure 13 / 14。


prompts from several sources listed in Table 27, resulting in datasets of 366.7k prompts for 7B and 377.7k prompts for 13B. Given this set of prompts, we generate responses from a pool of 20 models of different families and sizes.


To create synthetic preference data we use GPT-4o-2024-08-06 as an LM judge (Zheng et al., 2023) and prompted it to rate completions based on helpfulness, truthfulness, honesty, and instruction-following aspects. We then binarize the ratings across aspects by following Argilla’s method<sup>22</sup>: we get the average rating across all aspects, take the highest-rated completion as the chosen response, and sample from the remaining completions for the rejected response.

为了创建合成偏好数据，我们使用 GPT-4o-2024-08-06 作为 LM 评判器（Zheng et al., 2023），并提示它根据有用性，真实性，诚实性和指令遵循方面对完成进行评分。然后我们按照 Argilla 的方法将各方面的评分二值化：我们获取所有方面的平均评分，将最高评分的完成作为被选择的响应，并从剩余的完成中采样作为被拒绝的响应。

The 1B and 32B DPO models were trained with the same on-policy methodology.

1B 和 32B 的 DPO 模型使用相同的 on-policy 方法论进行训练。

**Reinforcement Learning with Verifiable Rewards (RLVR)** RLVR is a novel finetuning technique used to target specific domains where prompts with verifiable answers can be constructed. For example, with a math problem, the RL algorithm Proximal Policy Optimization (PPO) (Schulman et al., 2017) only receives a reward if the answer is correct. For more details, see Lambert et al. (2024).

RLVR 是一种新颖的微调技术，用于针对可以构建具有可验证答案的提示的特定领域。例如，对于数学问题，RL 算法近端策略优化（PPO, Proximal Policy Optimization）（Schulman et al., 2017）仅在答案正确时才获得奖励。更多细节参见 Lambert 等人（2024）。

Following preference tuning, we trained 7B and 13B reward models using the on-policy 7B and 13B preference dataset. Next, we applied RLVR to the highest-performing 7B and 13B DPO checkpoints with a combined dataset comprising GSM8K, MATH training sets, and prompts with constraints from Lambert et al. (2024). For RLVR, we initialize PPO’s value function from the corresponding RMs, which is shown to help improve average scores across evaluations (Lambert et al., 2024). After the initial RLVR training pass on the 13B model, we observe that its performance on GSM8K and MATH was lower than a previous development instruct model. Consequently, we perform two additional RLVR training iterations: first on the GSM8K training set, followed by the MATH training set. The models selected at the end of the RLVR stage constitute the final OLMo 2 Instruct models.

在偏好调优之后，我们使用 on-policy 的 7B 和 13B 偏好数据集训练了 7B 和 13B 奖励模型。接下来，我们将 RLVR 应用于性能最高的 7B 和 13B DPO 检查点，使用包含 GSM8K，MATH 训练集和来自 Lambert 等人（2024）的带约束提示的组合数据集。

For the 1B and 32B model, we performed RLVR with Group Relative Policy Optimization (GRPO) (Shao et al., 2024), which forgoes the need for a reward model. The evaluation metrics for this 32B model are shown in Fig. 14.

对于 1B 和 32B 模型，我们使用组相对策略优化（GRPO, Group Relative Policy Optimization）（Shao et al., 2024）执行 RLVR，这不需要奖励模型。该 32B 模型的评测指标见图 14。

**Hyperparameter selection** We perform the following hyperparameter tuning for the 7 and 13B models. At each stage we experiment with 1 random seed initially to arrive on a configuration and up to 4 with final hyperparameters. The final hyperparameters are marked with (♥):

我们对 7B 和 13B 模型进行以下超参数调优。在每个阶段，我们首先用 1 个随机种子实验以确定配置，最终超参数最多用 4 个随机种子。最终超参数标记为 ():

1. **SFT:** We sweep over learning rates $1 \times { 1 0 } ^ { - 5 } , \; 2 \times { 1 0 } ^ { - 5 } ( \mathbb { P } ) , \; 3 \times { 1 0 } ^ { - 5 }$ for the 7B model and $1 \times { { 1 0 } ^ { - 6 } }$ $$4 \times 1 0 ^ { ^ { - 6 } } \text {, } 5 \times \bar { 1 0 } ^ { ^ { - 6 } }$ ( 即 ), $\overset { \sim } { 7 . 5 \times 1 0 } ^ { - 6 } \text {, } 8 \times 1 0 ^ { ^ { - 6 } }$$ for the 13B model.

<small><span class="docvortex-page-footnote" data-block-type="page_footnote" style="color:#6b7280">22<sub>See</sub> [https://huggingface.co/datasets/argilla/ultrafeedback-binarized-preferences](https://huggingface.co/datasets/argilla/ultrafeedback-binarized-preferences).</span></small>

<!-- page 29 of 58 -->

![Chart block](images/p29-olmo-2-1124-13b-rlvr1-olmo-2-1124-13b-rlvr2-olmo-2-1124.png)

OLMo-2-1124-13B-RLVR1 OLMo-2-1124-13B-RLVR2 OLMo-2-1124-13B-Instruct (Final RLVR)


Figure 13 The scores from our evaluation suites for OLMo-2-1124-13B-Instruct trained with RLVR. We train OLMo-2-1124-13B-RLVR1 on the GSM8K, MATH, and prompts with constraints dataset mix, but noticed the GSM8K score was lower than expected. We proceed with training OLMo-2-1124-13B-RLVR2 on GSM8K and observed higher GSM8K score. Finally, we train OLMo-2-1124-13B-Instruct on just MATH and observe even higher GSM8K and MATH scores. Note that the value function was re-initialized from the reward model in each RLVR run. The full learning curves of each RLVR run can be found in Appendix C.2.

图 13｜OLMo-2-1124-13B-Instruct 在 RLVR 上的评测套件分数曲线。

2. DPO: We sweep over learning rates $$\mathrm { 5 \times 1 0 ^ { - 7 } , \: 6 \times 1 0 ^ { - 7 } , \: 7 \times 1 0 ^ { - 7 } , \: 8 \times 1 0 ^ { - 7 } }$ ( 带  - 13B)$ , and $1  \times  10 ^{-6} (@ .$ 7B) for both the 7B model and 13B model.

3. **RM:** We train with $3  \times  10 ^{- 6 }$ learning rate and 1 random seed for the 7B and 13B models, respectively.


4. **RLVR:** We sweep over beta values 0.03, 0.05, 0.07 (♥ - 7B), and 0.1 (♥ - 13B). For 13B model, we also sweep over learning rates $$\mathrm { 3 \times 1 0 } ^ { - 7 }$（ 带  - 13B），$\mathrm { 4 \times 1 0 } ^ { - 7 }$（ 带  - 7B）$ . For 13B, we run this sweep on the best model at each RLVR stage.

We conducted a hyperparameter sweep for SFT and DPO, using earlier development checkpoints, with results detailed in Table 17 and Figure 12. A key finding was that OLMo 2 required significantly higher learning rates compared to the Llama 3.1 training recipe described by Lambert et al. (2024). Finally, the optimized hyperparameters for our final model are presented in Table 17 and Table 18.

我们使用早期的开发检查点对 SFT 和 DPO 进行了超参数扫描，结果详见表 17 和图 12。一个关键发现是，与 Lambert 等人（2024）描述的 Llama 3.1 训练配方相比，OLMo 2 需要显著更高的学习率。最后，我们最终模型的优化超参数呈现在表 17 和表 18 中。

The post-training for the 32B model occurred after the release of the 7 and 13B models, so the hyperparameter selection proceeded independently. For SFT, we swept over a learning rate of $\mathrm { 1 \times 1 0 ^ { \bar { ~ } ^ { 6 } } , 2 \times 1 0 ^ { \bar { ~ } ^ { 6 } } , 3 \times 1 0 ^ { \bar { ~ } ^ { 6 } } , } 4 \times$ $\mathrm { 1 0 ^ { - 6 } , } 5   \times   \mathrm { \dot { 1 0 } ^ { - 6 } }$ , with the best performance as $\overset { \cdot } { 4 } \times { 1 0 } ^ { - 6 }$ where we ran one additional seed to compare performance. For DPO, we swept over learning rates again, from $\mathrm { 8 \times 1 0 ^ { - 7 } ,   1 \times 1 0 ^ { - 6 } ,   1 . 5 \times 1 0 ^ { - 6 } ,   2 \times 1 0 ^ { - 6 } ,   2 . 5 \times 1 0 ^ { - 6 } }$ , and the best performance was $2  \times  10 ^{ \overset{\sim}{-}  6  }$ For RLVR, the 32B does not need a reward model due to the change to GRPO. Beyond that, the final model was trained with a learning rate of $5  \times  10 ^{-7}$ , with a KL beta of 0.1, and 16 samples per prompt.

32B 模型的后训练发生在 7B 和 13B 模型发布之后，因此超参数选择独立进行。对于 SFT，我们对学习率 $1 \times 10^{-6}$，$2 \times 10^{-6}$，$3 \times 10^{-6}$，$4 \times 10^{-6}$，$5 \times 10^{-6}$ 进行扫描，最佳性能为 $4 \times 10^{-6}$，我们运行了一个额外的种子来比较性能。对于 DPO，我们再次对学习率进行扫描：$8 \times 10^{-7}$，$1 \times 10^{-6}$，$1.5 \times 10^{-6}$，$2 \times 10^{-6}$，$2.5 \times 10^{-6}$，最佳性能为 $2 \times 10^{-6}$。对于 RLVR，由于切换到 GRPO，32B 不需要奖励模型。除此之外，最终模型使用 $5 \times 10^{-7}$ 的学习率，0.1 的 KL beta 和每个提示 16 个样本进行训练。

**Evaluation of OLMo 2-Instruct** Following Tülu 3 (Lambert et al., 2024), we evaluate OLMo 2-Instruct on five categories listed in Table 15. Although Tülu 3 uses six categories including code-related tasks, we exclude this category since code was not a target skill during the development of OLMo 2. For each of the remaining categories, we use the same evaluations as those used for developing the Tülu 3 recipe. Table 15 also shows the settings and metrics used for each of the evaluations. These match those recommended in Lambert et al. (2024) for the non-code categories.

遵循 Tülu 3 (Lambert et al., 2024)，我们在表 15 中列出的五个类别上评估 OLMo 2-Instruct。虽然 Tülu 3 使用六个类别（包括代码相关任务），但我们排除了这一类别，因为代码不是 OLMo 2 开发期间的目标技能。对于剩余的每个类别，我们使用与开发 Tülu 3 配方时相同的评测。表 15 还显示了每个评测使用的设置和指标。这些与 Lambert 等人（2024）为非代码类别推荐的设置一致。

Table 16 presents the performance of OLMo 2 Instruct variants across different training stages. A comparative analysis of OLMo 2-Instruct’s performance against similarly-sized open models can be found in Table 7. Furthermore, Figures 13 and 15 present the training trajectories and key performance metrics for the 13B and 7B models, respectively.

表 16｜presents the performance of OLMo 2 Instruct variants across different training stages. A comparative analysis of OLMo 2-Instruct’s performance against similarly-sized open models c

<!-- page 30 of 58 -->

![Image block](images/p30-figure-14-the-scores-from-core-metrics-our-evaluation.png)

Figure 14 The scores from core metrics our evaluation suites for OLMo-2-0325-32B-Instruct trained with RLVR. We train OLMo-2-0325-32B-Instruct on the GSM8K, MATH, and prompts with constraints dataset mix to improve these scores.

图 14｜OLMo-2-0325-32B-Instruct 在 RLVR 上的核心指标曲线。

The OLMo 2-Instruct models demonstrate comparable performance to leading open-weight models in the field. Specifically, OLMo 2 13B Instruct achieves results approaching those of Qwen 2.5 14B Instruct while surpassing both Tülu 3 8B and Llama 3.1 8B Instruct in performance benchmarks. The RLVR stage also demonstrated consistent effectiveness across both model scales, leading to notable improvements in evaluation metrics in tandem with increasing the training reward signal.

OLMo 2-Instruct 模型展示了与领域内领先开源权重模型相当的性能。具体而言，OLMo 2 13B Instruct 达到了接近 Qwen 2.5 14B Instruct 的结果，同时在性能基准上超越了 Tülu 3 8B 和 Llama 3.1 8B Instruct. RLVR 阶段在两个模型规模上都展示了持续的有效性，导致评测指标的显著提升，同时增加了训练奖励信号。

Finally, we evaluate OLMo 2-Instruct on the unseen evaluation suite from Lambert et al. (2024) without the code evaluation tasks. The Instruct scores on the unseen evaluation suite are shown in Table 24.

最后，我们在 Lambert 等人（2024）的未见评测套件上评估 OLMo 2-Instruct（不含代码评测任务）。Instruct 在未见评测套件上的分数见表 24。

| Hyperparameter | RLVR value |
| --- | --- |
| Learning rate | -7 -73 ⋅ 10 for 13B; 4 ⋅ 10 for 7B |
| Effective batch size | 248 for 13B; 224 for 7B |
| KL penalty coef. (β) | 0.1 for first and final 13B; 0.03 for second 13B; 0.05 for 7B |
| Max total episodes | 200,000 for 13B; 100,000 for 7B |
| Discount factor γ | 1.0 |
| General advantage | 0.95 |
| estimation λ |  |
| Mini-batches N<sub>mb</sub> | 1 |
| PPO update | 4 |
| iterations K |  |

| Hyperparameter | RLVR value |
| --- | --- |
| PPO's clipping coefficient ε | 0.2 |
| Value function coefficient c<sub>1</sub> | 0.1 |
| Gradient norm threshold | 1.0 |
| Learning rate schedule | linear |
| Generation temperature | 1.0 |
| Max token length | 2,048 |
| Max prompt token length | 2,048 |
| Penalty reward for no EOS token | -10.0 |
| Response length | 2,048 |
| Warm up ratio (ω) | 0.0 |

Table 18 The hyperparameters of PPO used for optimizing against the verifiable reward function with RLVR. Hyparameters with different settings for the 7B and 13B parameter models are highlighted.

表 18｜The hyperparameters of PPO used for optimizing against the verifiable reward function with RLVR. Hyparameters with different settings for the 7B and 13B parameter models are highli

> **对一下：** Table 18 写 PPO 优化可验证奖励，与摘要里的 RLVR 是什么关系？
> RLVR = reinforcement learning with verifiable rewards；实现上用 PPO 去优化可验证奖励函数（Table 18）。专名 RLVR 指奖励可自动核验的设定，PPO 是优化器。不要把 RLVR 说成另一种与 PPO 并列的独立算法名。


## 6 Deep Dive: Infrastructure as a Research Catalyst 6 深挖：基础设施作为研究催化剂

LM training is famously compute intensive. Training large models requires state-of-the-art hardware, and a lot of work goes into making it run efficiently. Gains in efficiency can be translated into higher token counts or more parameters, directly affecting the quality of the final model. GPUs are at the core of this infrastructure,

语言模型训练以计算密集著称。训练大模型需要最先进的硬件，大量工作投入其中以确保高效运行。效率的提升可以转化为更多的 token 数量或更大的参数量，直接影响最终模型的质量。GPU 是这一基础设施的核心，但还需要对其他流程和系统的投入才能使它们达到峰值效率。数据中心需要计算节点之间的高速互连，以确保昂贵的 GPU 不必等待数据到达。训练作业需要访问大量快速，可靠的存储来获取训练数据。GPU 的故障率高于大多数其他硬件，单次训练运行可能同时需要数千个 GPU，这使得有效的监控和更换策略成为必需。本节详细介绍我们为支持 OLMo 2 工作负载所做的硬件和软件投入。

<!-- page 31 of 58 -->

RLVR on GSM8K, MATH, Prompts with Constraints

![Chart block](images/p31-chart.png)

![Chart block](images/p31-episodes.png)

Episodes

![Chart block](images/p31-chart-2.png)

![Chart block](images/p31-chart-3.png)

![Chart block](images/p31-chart-4.png)

![Chart block](images/p31-olmo-2-1124-7b-instruct.png)

OLMo-2-1124-7B-Instruct

![Chart block](images/p31-figure-15-the-top-row-shows-the-training-curves-of-olmo.png)

Figure 15 The top row shows the training curves of OLMo-2-1124-7B-Instruct on verifiable rewards, KL divergence, and response lengths. In the bottom row, the y-axes show the average scores across our evaluation suites and GSM8K, IFEval, and MATH Flex scores, respectively. Overall, we find RLVR increases not only the training rewards of our 7B models but also the downstream evaluations such as GSM8K.

图 15｜OLMo-2-1124-7B-Instruct 的可验证奖励，KL 与响应长度等训练曲线。

> **停一下：** Figure 15 的 verifiable rewards / KL / response length 曲线，能否单独证明 7B Instruct 已超过 GPT-4o Mini?
> 不能。Figure 15 是 RLVR 训练动态。与 GPT-3.5 Turbo / GPT 4o Mini 的对照在 Table 7 的下游指标。训练曲线不替代 Table 7 的对外主张。


investment in other processes and systems is required to make them perform at peak efficiency. Data centers need high-speed interconnect between compute nodes to make sure expensive GPUs never have to wait for data to arrive. Training jobs need access to large amounts of fast, reliable storage for access to training data. GPUs have higher failure rates than most other hardware, and a single training run might require thousands of them at the same time, making effective monitoring and replacement policies a necessity. This section provides details about our hardware and software investments to support OLMo 2 workloads.


### 6.1 Clusters 6.1 集群

OLMo 2 is trained on two Ai2 clusters, Jupiter and Augusta. Despite hardware and architectural differences, both clusters provided sufficient training throughput. Beaker, Ai2’s workload management system, allows researchers to migrate workloads from one cluster to another, and both the 7B and 13B variants were trained partially on both clusters, with the bulk of the 7B training on Jupiter, and the bulk of 13B training on Augusta.

OLMo 2 在两个 Ai2 集群上训练：Jupiter 和 Augusta。尽管硬件和架构不同，两个集群都提供了足够的训练吞吐。Beaker（Ai2 的工作负载管理系统）允许研究人员将工作负载从一个集群迁移到另一个集群，7B 和 13B 变体都部分在两个集群上训练，其中 7B 的主要训练在 Jupiter 上，13B 的主要训练在 Augusta 上。

#### 6.1.1 Jupiter 6.1.1 Jupiter

Jupiter is a 128-node GPU cluster located in Austin, Texas. It is operated by Cirrascale Cloud Services23

Jupiter 是一个位于德克萨斯州奥斯汀的 128 节点 GPU 集群，由 Cirrascale Cloud Services 运营。

**Compute** It consists of 1,024 NVIDIA H100 GPUs, each with 80GB HBM3 running at 700W. The GPUs are spread across 128 servers with 2x Intel Xeon Platinum 8468 CPUs, 2 TB of DDR5 system memory, and 18 TB of local NVMe storage.

它由 1,024 个 NVIDIA H100 GPU 组成，每个配备 80GB HBM3，运行功率 700W. GPU 分布在 128 台服务器上，每台配备 2 个 Intel Xeon Platinum 8468 CPU，2 TB DDR5 系统内存和 18 TB 本地 NVMe 存储。

**Storage** The servers are connected via a 800 Gbps local network to a WEKA high performance storage cluster<sup>24</sup>. This cluster has 1 PB of NVMe SSD storage with 11 physical servers, and 5 PB of HDD storage spread across 12 hosts. The Jupiter GPU servers have two bonded 25 Gbps Mellanox ethernet cards each, providing a total of 50 Gbps of throughput per host. In benchmarks, we reach 761 Gbps of read/write throughput using 64 client machines.

服务器通过 800 Gbps 本地网络连接到 WEKA 高性能存储集群。该集群拥有 1 PB NVMe SSD 存储（11 台物理服务器）和 5 PB HDD 存储（分布在 12 台主机上）。Jupiter GPU 服务器每台有两个绑定的 25 Gbps Mellanox 以太网卡，提供每台主机总计 50 Gbps 的吞吐。在基准测试中，我们使用 64 台客户端机器达到 761 Gbps 的读写吞吐。

<small><span class="docvortex-page-footnote" data-block-type="page_footnote" style="color:#6b7280">23<a href="https://www.cirrascale.com/"><sub>cirrascale</sub>.com</a></span></small>

<small><span class="docvortex-page-footnote" data-block-type="page_footnote" style="color:#6b7280">24<a href="https://www.weka.io/"><sub>weka</sub>.io</a></span></small>

<!-- page 32 of 58 -->

**Interconnect** Cross-node GPU communication is provided via RDMA over InfiniBand and a 2-Tier Rail Optimized (Wang et al., 2023a), balanced, full-bisected network. Each physical server has eight 400 Gbps InfiniBand cards, providing a maximum total throughput per host of 3200 Gbps. This setup allows Ai2 to run dozens of distributed training workloads simultaneously on the same cluster without topological scheduling.

跨节点 GPU 通信通过 InfiniBand 上的 RDMA 和 2 层 Rail Optimized (Wang et al., 2023a) 平衡全对分网络提供。每台物理服务器有八个 400 Gbps InfiniBand 卡，提供每台主机最大总计 3200 Gbps 的吞吐。这种设置允许 Ai2 在同一集群上同时运行数十个分布式训练工作负载，无需拓扑调度。

**Cooling** The Jupiter servers are racked in Dynamic Density Cabinets . Each cabinet includes 5 servers with dedicated cooling and power. Each cabinet is a closed system, circulating air through an overhead compartment where it is cooled via heat transfer to water. This approach allows the datacenter to achieve a power usage efficiency (PUE) of 1.2. Under heavy utilization, our H100 GPUs reach a peak temperature of 75°C; average GPU temperatures are between 60°C and 65°C.


#### 6.1.2 Augusta Cluster 6.1.2 Augusta 集群

The Augusta cluster is a 160-node GPU cluster provided by Google Cloud. The physical servers are located in Council Bluffs, Iowa.

Augusta 集群是一个由 Google Cloud 提供的 160 节点 GPU 集群。物理服务器位于爱荷华州康瑟尔布拉夫斯。

**Compute** The cluster is made up of A3 Mega virtual machines<sup>26</sup>, each with 8 NVIDIA H100 GPUs.


**Storage** Augusta workloads use Google Cloud Storage for speeds up to 1 GB/s per VM. We ensure portability by abstracting storage interactions into common libraries supporting both file- and object-based APIs.

Augusta 工作负载使用 Google Cloud Storage，速度可达每台 VM 1 GB/s. 我们通过将存储交互抽象为支持文件和对象 API 的通用库来确保可移植性。

**Interconnect** Each GPU has a dedicated Ethernet NIC. Fast cross-node GPU communication is achieved using GPUDirect-TCPXO, gVNIC, and compact node placement. This arrangement takes advantage of Google’s [Jupiter data center network technology](https://cloud.google.com/blog/topics/systems/the-evolution-of-googles-jupiter-data-center-network) and the [Titanium system](https://cloud.google.com/blog/products/compute/titanium-underpins-googles-workload-optimized-infrastructure) with tiered offloading and full-bandwidth reconfigurable optical links. This provides bandwidth similar to non-blocking network fabrics.

每个 GPU 有一个专用以太网 NIC。快速的跨节点 GPU 通信通过 GPUDirect-TCPXO，gVNIC 和紧凑节点放置实现。这种安排利用了 Google 的 Jupiter 数据中心网络技术和 Titanium 系统，具有分层卸载和全带宽可重构光链路。这提供了类似于非阻塞网络结构的带宽。

**Cooling** The Augusta servers are air-cooled and [the Iowa campus in which they are located reported](https://www.google.com/about/datacenters/efficiency/) a trailing twelve-month power usage efficiency (PUE) of 1.12.

Augusta 服务器采用风冷，其所在的爱荷华州园区报告的过去十二个月电源使用效率（PUE）为 1.12。

### 6.2 Beaker 6.2 Beaker

OLMo 2 workloads were scheduled using Beaker (Guerquin, 2022), a custom workload management system. Beaker benefited OLMo 2 in two key ways:

OLMo 2 工作负载使用 Beaker (Guerquin, 2022) 进行调度，这是一个定制的工作负载管理系统。Beaker 在两个方面对 OLMo 2 有重要帮助：

**Portability** Beaker’s architecture can take advantage of GPUs across 3 different data centers with minimal code changes. It can be run anywhere running a single Linux daemon that is packaged as a statically linked binary. Typically, workloads can be moved from one location to another by changing a single line of code.

Beaker 的架构可以利用跨 3 个不同数据中心的 GPU，只需最少的代码更改。它可以在任何运行单个 Linux 守护进程（打包为静态链接二进制文件）的地方运行。通常，只需更改一行代码就可以将工作负载从一个位置移动到另一个位置。

**Isolation** Beaker workloads are containerized, providing some isolation guarantees. This allows OLMo 2 workloads to run simultaneously with other jobs on the same cluster, each with unique environments and dependencies, with minimal conflicts. Notably, the Beaker executor allocates host resources in a fashion that minimizes (but doesn’t completely avoid) performance problems caused by noisy-neighbors. Containers further capture software dependencies and the runtime details of workloads. This helps run repeatable experiments, and makes it possible to replay old results even months after they happened. This stands in contrast to the more common Slurm-based setup where all workloads, whether they relate to OLMo 2 or not, share the same underlying operating system, CUDA libraries, and environment resulting in instability that makes experiments unreproducible after system changes.

Beaker 工作负载是容器化的，提供一些隔离保证。这允许 OLMo 2 工作负载与其他作业在同一集群上同时运行，每个作业有独特的环境和依赖，冲突最小。值得注意的是，Beaker 执行器以最小化（但不能完全避免）由 noisy-neighbors 引起的性能问题的方式分配主机资源。容器进一步捕获软件依赖和工作负载的运行时细节。这有助于运行可重复的实验，并使得即使在数月后也能重放旧结果。这与更常见的基于 Slurm 的设置形成对比，后者所有工作负载（无论是否与 OLMo 2 相关）共享相同的底层操作系统，CUDA 库和环境，导致系统更改后实验无法复现。

Beaker also made it possible for us to take advantage of new compute sources that became available throughout the evolution of the project. Its operational simplicity made it possible for a small team of operators to quickly onboard new sources of compute.

Beaker 还使我们能够利用项目演进过程中出现的新计算资源。其操作简洁性使一个小型运维团队能够快速接入新的计算资源。

<small><span class="docvortex-page-footnote" data-block-type="page_footnote" style="color:#6b7280">25<a href="https://www.cirrascale.com/products-and-services/cabinet-technologies"><sub>cirrascale</sub>.com/products-and-services/cabinet-technologies</a></span></small>

<small><span class="docvortex-page-footnote" data-block-type="page_footnote" style="color:#6b7280">26<sub>a3-m</sub>egagpu-8g, more information at [cloud.google.com/compute/docs/accelerator-optimized-machines](https://cloud.google.com/compute/docs/accelerator-optimized-machines)</span></small>

<!-- page 33 of 58 -->

### 6.3 Stability and Operations 6.3 稳定性与运维

Both clusters required an initial testing and burn-in period, during which we discovered and remedied problems ranging from ill-seated cables to an improper ordering of the compute nodes in the NCCL library. These periods required close collaboration with the respective hardware vendors, and both were indispensable during this process. After this period, both clusters operate approximately at the same level of reliability.

两个集群都需要初始测试和 burn-in 阶段，在此期间我们发现并修复了从电缆接触不良到 NCCL 库中计算节点排序不当等各种问题。这些阶段需要与各自的硬件供应商密切合作，两者在此过程中都是不可或缺的。经过这一阶段后，两个集群的运行可靠性大致相同。

**GPU health checks** Beaker executes a simple program prior to running workloads on the assigned GPUs. The program attempts to multiply two tensors. When failures occur, Beaker cordons the associated host and reschedules the workload, quarantining the errant node before introducing instability. This helped reduce interruptions requiring manual attention, and made it viable to configure training jobs to simply restart themselves when encountering an error, safe in the knowledge that they would be moved to the working set of compute nodes.

Beaker 在运行工作负载之前会在分配的 GPU 上执行一个简单的程序。该程序尝试将两个张量相乘。当失败发生时，Beaker 将隔离相关主机并重新调度工作负载，在引入不稳定性之前隔离故障节点。这有助于减少需要人工干预的中断，并使配置训练作业在遇到错误时自动重启成为可能，确信它们会被移动到正常的计算节点集合中。

**Cordoning** Beaker supports cordoning nodes as an override for the automatic health checks. A cordoned node is removed from scheduling and gets flagged for repair. In this way, Beaker effectively crowdsources the identification of bad nodes among all the users of the cluster.

Beaker 支持将节点隔离作为自动健康检查的覆盖机制。被隔离的节点从调度中移除并被标记为待修复。通过这种方式，Beaker 有效地在集群的所有用户中众包识别坏节点。

**Active monitoring** Beyond these two methods, Beaker performs industry-standard monitoring and automatic alerting based on cluster telemetry. The team has operational processes in place for responding to system issues, enabling it to resolve issues promptly.

除这两种方法外，Beaker 还基于集群遥测执行行业标准监控和自动告警。团队有运维流程来响应系统问题，使其能够及时解决问题。

### 6.4 Maximizing hardware utilization 6.4 拉高硬件利用率

Ai2’s hardware infrastructure (§6.1) has to be complemented by good model training software that gets the most out of the available resources. Increased efficiency not only lets us train larger models for more tokens, but it also improves the environmental impact of model training (§6.5), and raises experimental velocity. Further, OLMo is not the only Ai2 project, and being responsible with our resource use minimizes the disruption that large model training causes for other teams.

Ai2 的硬件基础设施（§6.1）需要由良好的模型训练软件来补充，以充分利用可用资源。提高效率不仅使我们能够用更多 token 训练更大的模型，还改善了模型训练的环境影响（§6.5），并提高了实验速度。此外，OLMo 不是 Ai2 唯一的项目，负责任地使用资源可以最小化大模型训练对其他团队造成的干扰。

Below we describe several PyTorch optimizations<sup>27</sup> that had a big impact towards reducing training time of LMs on our infrastructure without any apparent loss in the speed of convergence.


**Taking advantage of compilation** torch.compile() is a function in PyTorch<sup>28</sup> that will compile native PyTorch modules and functions into optimized kernels, resulting in significant throughput improvements and GPU memory savings by avoiding the Python overhead associated with calling individual PyTorch operations in sequence, and by reducing the number of reads and writes that must occur on the GPU. As such, when torch.compile() is used properly, it can effectively match the performance of hand-crafted kernels in many cases without the additional complexity and engineering effort (Ansel et al., 2024).


**Minimizing host-device syncs**

By default, GPU operations are asynchronous. A function call that uses the GPU is enqueued to a particular device, but not necessarily executed until later. This allows the system to execute more computations in parallel, including operations on CPU or other GPUs... – PyTorch: CUDA Semantics

默认情况下，GPU 操作是异步的。使用 GPU 的函数调用被排队到特定设备，但不一定立即执行。这允许系统并行执行更多计算，包括 CPU 或其他 GPU 上的操作...每当训练代码强制 host-device 同步时，在队列中所有当前操作完成之前不能再排队更多操作。这些同步点会阻碍性能，而且很容易无意中引入它们。

Any time the training code forces a host-device sync, no more operations can be enqueued until all operations currently in the queue complete. These synchronization points will hinder performance, and it is easy to unintentionally introduce them.


A surprising number of operations cause host-device syncs:


<small><span class="docvortex-page-footnote" data-block-type="page_footnote" style="color:#6b7280">27<sub>All</sub> of these techniques and more are implemented in the open-source OLMo-core library, the 2nd generation of the OLMo training codebase. OLMo-core is available at [allenai/OLMo-core](https://github.com/allenai/OLMo-core).</span></small>

<small><span class="docvortex-page-footnote" data-block-type="page_footnote" style="color:#6b7280">28 <a href="https://pytorch.org/tutorials/intermediate/torch_compile_tutorial.html"><sub>pytorch</sub>.org/tutorials/intermediate/torch\_compile\_tutorial</a></span></small>

<!-- page 34 of 58 -->

1. Synchronously copying a tensor from CPU to GPU (e.g., with tensor.to(device="cuda")) will force a host-device sync. This can be avoided by copying the tensor asynchronously (e.g., with tensor.to(device="cuda", non\_blocking=True)).

令人惊讶的是，大量操作会导致 host-device 同步：

2. Copying a tensor from GPU to CPU cannot safely be done asynchronously, so GPU → CPU data transfer should be avoided whenever possible. Seemingly innocuous code can cause GPU → CPU data transfer, and therefore host-device syncs, such as print-ing a CUDA tensor or an “if ...:" block that depends on how a CUDA tensor resolves to a boolean value.


3. Specific PyTorch operations like masked\_select() may unexpectedly cause a host-device sync29


Host-device syncs can be detected by calling torch.cuda.set\_sync\_debug\_mode("warn") before starting the training loop. This will cause PyTorch to emit a warning whenever a host-device sync occurs. This happens on a best-effort basis. Some syncs may still be missed.

可以通过在启动训练循环之前调用 torch.cuda.set_sync_debug_mode(「warn」) 来检测 host-device 同步。这将导致 PyTorch 在每次发生 host-device 同步时发出警告。这是尽力而为的，某些同步仍可能被遗漏。

**Asynchronous bookkeeping with a separate backend** A typical training loop involves periodic “bookkeeping” operations like logging metrics and saving checkpoints. While these operations may be relatively fast, their aggregate cost over the course of a training run can be significant. These operations also usually involve host-device syncs. For example, a training metric like cross-entropy loss is the result of computations that occur on the GPU, and it is materialized first as a CUDA tensor; therefore, logging that metric to the console forces a synchronization point.

典型的训练循环涉及周期性的「簿记」操作，如记录指标和保存检查点。虽然这些操作可能相对较快，但在整个训练运行中的累积成本可能很大。这些操作通常也涉及 host-device 同步。例如，交叉熵损失等训练指标是 GPU 上计算的结果，它首先物化为 CUDA 张量；因此，将该指标记录到控制台会强制一个同步点。

Many of these operations are essential and cannot be avoided, but it is possible to minimize the time they spend blocking the training loop by performing most of this bookkeeping work asynchronously, in a separate thread. However, the PyTorch NCCL backend is not thread safe. To work around this problem, we set up a separate backend that does not rely on NCCL (like GLOO), and use it exclusively for bookkeeping operations. The bookkeeping workflows could then look like this:

许多这些操作是必不可少的，无法避免，但可以通过在单独线程中异步执行大部分簿记工作来最小化它们阻塞训练循环的时间。然而，PyTorch NCCL 后端不是线程安全的。为了解决这个问题，我们设置了一个不依赖 NCCL 的单独后端（如 GLOO），并专门用于簿记操作。

1. For metric collection and logging: Decide on the interval in which to log metrics. Since this involves a host-device sync, it should not be done on every training step. More commonly, metrics are logged every 10 or every 50 steps. During every step, metrics are computed and stored in a GPU tensor on their original devices. Only when it is time to log metrics do we copy them to the CPU (causing a host-device sync), and then pass them to the bookkeeping thread, which uses its own PyTorch backend to aggregate the metrics and log them.

簿记工作流程可以如下：

2. For checkpointing: A similar workflow can be used for checkpointing. When it is time to save a checkpoint, the trainer makes a copy of the model and optimizer state in CPU memory (causing a host-device sync). Then it passes the copy to the bookkeeping thread, which assembles the model from the model shards that are stored on each compute node, and saves it to disk, while the main thread can 30 continue training


In both cases, the only impact on training time is one host-device sync, and the time it takes to copy data from the GPU to the CPU. The frequency of each event can be configured, and the overall impact on training time is negligible.

在这两种情况下，对训练时间的唯一影响是一次 host-device 同步，以及将数据从 GPU 复制到 CPU 所需的时间。每个事件的频率可以配置，对训练时间的总体影响可以忽略不计。

**Explicit Python garbage collection** During training, the default Python garbage collector periodically runs a collection. In a distributed setting, with thousands of training processes that are expected to run in lock-step with each other, nothing enforces that these garbage collections happen at the same time on every process. Since distributed training can only proceed as fast as the slowest process, this causes a noticeable decrease in average training time per step as well as an increase in variability (Figure 16). Both worsen as the number of processes increases.

在训练期间，默认的 Python 垃圾回收器定期运行回收。在分布式设置中，数千个训练进程预期以锁步方式运行，没有什么机制强制这些垃圾回收在每个进程上同时发生。由于分布式训练只能以最慢的进程速度进行，这导致每步平均训练时间的显著减少以及变异性的增加（图 16）。两者都随着进程数量的增加而恶化。

To work around this problem, the OLMo 2 trainer disables automatic garbage collection (e.g., by calling gc.disable() ). Then, it runs garbage collection explicitly at regular intervals, triggered at the same time

为了解决这个问题，OLMo 2 训练器禁用自动垃圾回收(例如通过调用 gc.disable())。然后，它在固定间隔显式运行垃圾回收，在每个进程中同时触发(例如通过调用 gc.collect(1)).

<small><span class="docvortex-page-footnote" data-block-type="page_footnote" style="color:#6b7280">29<a href="https://github.com/pytorch/pytorch/issues/12461"><sub>github</sub>.com/pytorch/pytorch/issues/12461</a></span></small>

<small><span class="docvortex-page-footnote" data-block-type="page_footnote" style="color:#6b7280">30<sub>See</sub> [pytorch.org/blog/reducing-checkpointing-times](https://pytorch.org/blog/reducing-checkpointing-times/) for a concrete example.</span></small>

<small><span class="docvortex-page-footnote" data-block-type="page_footnote" style="color:#6b7280">31<a href="https://docs.python.org/3/library/gc.html#gc.disable"><sub>docs</sub>.python.org/3/library/gc#gc.disable</a></span></small>

<!-- page 35 of 58 -->

Figure 16 The training throughput in tokens per second (TPS) per device over the course of 1000 steps for two OLMo-1B models on 8 nodes, one with automatic garbage collection (GC), the other with collection done manually at intervals set within our training codebase. With automatic garbage collection, training throughput is slower and less stable, often becoming worse as the run progresses.

图 16｜两台 OLMo-1B 在约 1000 step 上的每卡 token/s 吞吐（显式 GC 相关）。

![Chart block](images/p35-in-each-process-e-g-by-calling-gc-collect-1-3-2.png)

in each process (e.g. by calling gc.collect $( 1 ) ^ { 3 2 } )$ .

| Model | PoTwoetarl(GMPWUh) | PowEeffreUcst.age | InCtaernbsointy | EmCaisrsbioonns | WaEteffreUcst.age | TUostaagleW(aktLe)r |
| --- | --- | --- | --- | --- | --- | --- |
| Llama 2 7B | 74 | 1.1 | - | 31 | 1.29 - 4.26 | 105 - 347 |
| Llama 3.1 8B | 1,022 | 1.1 | - | 420 | 1.29 - 4.26 | 1,450 - 4,823 |
| OLMo 7B | 104 | 1.1 | 0.610 | 70 | 4.26 | 487 |
| OLMo 2 7B | 131 | 1.2 | 0.332 | 52 | 1.29 | 202 |
| OLMo 2 13B | 257 | 1.12 | 0.351 | 101 | 3.10 | 892 |

Table 19 $\mathrm { C O _ { 2 } }$ emissions and water consumption during pretraining. We estimate the total carbon emissions and water consumption for our new models using PUE information from our data center providers, carbon intensity data and WUE from the local grid for each data center, and total power consumption from time series data logged throughout training. Numbers for Llama 2 (Touvron et al., 2023), Llama 3 (Grattafiori et al., 2024), and the original OLMo (Groeneveld et al., 2024) are taken from their respective papers. We also show simulated water consumption for Llama 2 and 3, showing a range of water usage numbers using the lowest and highest WUE values for OLMo models.

表 19｜$\mathrm { C O _ { 2 } }$ emissions and water consumption during pretraining. We estimate the total carbon emissions and water consumption for our new models using PUE information 

### 6.5 Environmental Impact 6.5 环境影响

Following our analysis in Groeneveld et al. (2024) and previous literature (Patterson et al., 2021; Dodge et al., 2022; Luccioni et al., 2022; Li et al., 2023a), we estimate the environmental impact of training our final models by first calculating the total energy consumed during pretraining, and multiplying it by the carbon intensity of the local grid to estimate the amount of carbon released. We additionally extend our previous analysis to also estimate water consumption, calculated by multiplying the power consumed by the water usage efficiency of both the power generation and the cooling hardware. As in Groeneveld et al. (2024), we emphasize that while our reporting is standard practice, it does not account for other environmental impacts such as embodied emissions and water consumption of the hardware during manufacturing, transportation, and eventual disposal, and other lifetime operational impacts such as deployment and inference, and thus our estimates should be viewed as lower bounds. We report detailed results for our models in Table 19.

遵循我们在 Groeneveld 等人（2024）中的分析和先前文献（Patterson et al., 2021; Dodge et al., 2022; Luccioni et al., 2022; Li et al., 2023a），我们通过首先计算预训练期间消耗的总能量，然后乘以当地电网的碳强度来估计训练我们最终模型的环境影响，以估算释放的碳量。我们还扩展了先前的分析，增加了水消耗估算，通过将消耗的功率乘以发电和冷却硬件的水使用效率来计算。与 Groeneveld 等人（2024）一样，我们强调虽然我们的报告是标准做法，但它没有考虑其他环境影响，如硬件在制造，运输和最终处置过程中的隐含排放和水消耗，以及其他生命周期运营影响（如部署和推理），因此我们的估计应被视为下限。我们在表 19 中报告了我们模型的详细结果。

As in Groeneveld et al. (2024), we calculate the total power consumption for each model by measuring the power consumption of an individual node every 25ms, calculating the average consumption throughout training, and multiplying by the total number of nodes. We then multiply this quantity by the power usage effectiveness (PUE) factor for the data center we use to train a model to account for the overall energy efficiency of the data center. As the majority of training for OLMo 2 7B is done on the Jupiter cluster, we use Jupiter’s efficiency metrics for our analysis of the 7B model. OLMo 2 13B is trained on Augusta; therefore, we use its efficiency metrics instead. We estimate consumption at about **391 MWh of energy** by pretraining OLMo 2 7B and 13B.

与 Groeneveld 等人（2024）一样，我们通过每 25ms 测量单个节点的功率消耗，计算整个训练期间的平均消耗，然后乘以节点总数来计算每个模型的总功率消耗。然后我们将这个量乘以用于训练模型的数据中心的电源使用效率（PUE）因子，以考虑数据中心的整体能源效率。由于 OLMo 2 7B 的大部分训练在 Jupiter 集群上完成，我们对 7B 模型的分析使用 Jupiter 的效率指标。OLMo 2 13B 在 Augusta 上训练；因此，我们改用其效率指标。我们估计预训练 OLMo 2 7B 和 13B 消耗约 391 MWh 的能量。

To calculate carbon emissions, we multiply the total power consumption by a carbon intensity factor based on

为了计算碳排放，我们将总功率消耗乘以基于每个数据中心物理位置的碳强度因子，单位为 kg CO2 每 kWh. Jupiter 集群由 Austin Energy 供电，其最新报告的碳强度为 0.332 kg CO2 每 kWh. Augusta 集群位于爱荷华州，爱荷华州的平均碳强度为 0.352 kg CO2 每 kWh，我们在计算中使用该值。我们估计训练我们的最新模型排放约 154 tCO2eq.

<small><span class="docvortex-page-footnote" data-block-type="page_footnote" style="color:#6b7280">32<a href="https://docs.python.org/3/library/gc.html#gc.collect"><sub>docs</sub>.python.org/3/library/gc\#gc.collect</a></span></small>

<!-- page 36 of 58 -->

the physical location of each data center, measured in kg $\mathrm { C O _ { 2 } }$ per kWh. The Jupiter cluster is powered by Austin Energy, which most recently reported a carbon intensity of 0.332 kg $\mathrm { C O _ { 2 } }$ per $\mathrm { k W h . ^ { 3 3 } }$ The Augusta cluster is located in Iowa, and the state of Iowa has an average carbon intensity of 0.352 kg $\mathrm { C O _ { 2 } ~ p e r ~ k \tilde { W } h ^ { 3 4 } }$ which we use for our calculations. We estimate that training our latest models emitted about $154\mathrm{tCO_{2}eq}$


$$
C O _ {2} \text {Emissions} = P _ {\mathrm{GPU}} \cdot \mathrm{PUE} \cdot \text {Carbon Intensity}
$$

To calculate water consumption, we multiply the total power consumption by the water usage effectiveness (WUE) of both the offsite power generation as well as the onsite cooling hardware. Both clusters use highly efficient, closed-loop cooling hardware, so we assume a $\mathrm { W U E } _ { \mathrm { o n s i t e } }$ of 0 liters per kWh. Following Reig et al. (2020), we assume a $\mathrm { W U E _ { o f f s i t e } }$ of 1.29 L per kWh for our Jupiter cluster and 3.10 L per kWh for our Augusta cluster. We estimate that training our latest models consumed about **1.1 million liters of water**.

为了计算水消耗，我们将总功率消耗乘以异地发电和现场冷却硬件的水使用效率（WUE）。两个集群都使用高效的闭环冷却硬件，因此我们假设 WUE_onsite 为 0 升每 kWh。遵循 Reig 等人（2020），我们假设 Jupiter 集群的 WUE_offsite 为 1.29 L 每 kWh，Augusta 集群为 3.10 L 每 kWh。我们估计训练我们的最新模型消耗约 110 万升水。

$$
\text {Water Consumption} = P _ {\mathrm{GPU}} \cdot \mathrm{PUE} \cdot \left(\mathrm{WUE} _ {\text {onsite}} + \mathrm{WUE} _ {\text {offsite}}\right)
$$

Though we aim to report a comprehensive analysis of the environmental impact of training our models, we emphasize that this is a lower bound on the total cost of developing large models. In an upcoming paper (Morrison et al., 2025), we will provide more comprehensive analysis covering energy, emissions, and water consumption throughout model development, pretraining, and deployment.

虽然我们旨在报告训练我们模型的环境影响的全面分析，但我们强调这只是开发大模型总成本的下限。在即将发表的论文（Morrison et al., 2025）中，我们将提供更全面的分析，涵盖能源，排放和水。

## Conclusion

We introduce OLMo 2 and OLMo 2-Instruct, a family of fully open 7B, 13B and 32B parameter language models trained on up to 6T tokens. Both the base and instruct models are competitive with other open-weight models in their size categories such as Qwen 2.5, Gemma 2, and Llama 3.1. We detail the substantial contributions required to build competitive language models—many of which are different from the original OLMo—including stable infrastructure, architecture improvements for stability, innovations in late-stage training data, the latest post-training techniques, and many more details. We release all training and evaluation code, datasets, checkpoints, and logs required to reproduce and expand on the models. OLMo 2 marks continued progress in open-source language models, building a new ecosystem for research, one where new training methods and techniques need to be understood and shared.

我们介绍了 OLMo 2 和 OLMo 2-Instruct，这是一个完全开源的 7B，13B 和 32B 参数语言模型家族，在多达 6T token 上训练。基座模型和指令模型都与其规模类别中的其他开源权重模型（如 Qwen 2.5，Gemma 2 和 Llama 3.1）具有竞争力。我们详细描述了构建有竞争力的语言模型所需的大量贡献 -- 其中许多与原始 OLMo 不同 -- 包括稳定的基础设施，稳定性的架构改进，后期训练数据的创新，最新的后训练技术以及更多细节。我们发布了复现和扩展模型所需的所有训练代码，评测代码，数据集，检查点和日志。OLMo 2 标志着开源语言模型的持续进步，为研究构建了一个新的生态系统，在这个生态系统中，新的训练方法和技术需要被理解和分享。

## Author Contributions

A successful team project like OLMo would not be possible without the fluid contributions of many teammates across formal team boundaries. As not all of these can be captured, we indicate each authors’ primary contributing role in OLMo 2. Authors are listed in alphabetical order:

像 OLMo 这样成功的团队项目离不开许多跨正式团队边界队友的灵活贡献。由于并非所有贡献都能被涵盖，我们列出每位作者在 OLMo 2 中的主要贡献角色。作者按字母顺序排列：

• For base model development, including training and data curation: Shane Arora, Akshita Bhagia, Christopher Clark, Allyson Ettinger, Dirk Groeneveld, Yuling Gu, David Heineman, Matt Jordan, Jiacheng Liu, Kyle Lo, William Merrill, Tyler Murray, Jake Poznanski, Dustin Schwenck, Luca Soldaini, Oyvind Tafjord, David Wadden, and Pete Walsh.


• For instruct model development, including training and data curation: Faeze Brahman, Pradeep Dasigi, Nouha Dziri, Yuling Gu, Shengyi Huang, Hamish Ivison, Nathan Lambert, Saumya Malik, Lester James V. Miranda, Jacob Morrison, Valentina Pyatkin, Oyvind Tafjord, and Christopher Wilhelm.


• For operational support, including program management, legal guidance, release process, and more: Taira Anderson, David Atkinson, Crystal Nam, and Aman Rangapur.


• For Ai2 cluster setup and support: Michal Guerquin, Michael Schmitz, Sam Skjonsberg, and Michael Wilson


• For mentorship and advising: Ali Farhadi, Hannaneh Hajishirzi, Pang Wei Koh, Noah A. Smith, and Luke Zettlemoyer.


<small><span class="docvortex-page-footnote" data-block-type="page_footnote" style="color:#6b7280">34 <a href="https://web.archive.org/web/20241127181309/https://www.eia.gov/electricity/state/iowa/"><sub>www</sub>.eia.gov/electricity/state/iowa</a></span></small>

<!-- page 37 of 58 -->

Authorship for this work was determined by those making direct contributions to the OLMo 2 models, related artifacts, and their release. Core contributors are recognized for their sustained, significant contributions critical to the success of the OLMo 2 project.

本工作的作者身份由对 OLMo 2 模型，相关产物及其发布做出直接贡献的人员确定。核心贡献者因其对 OLMo 2 项目成功至关重要的持续，重大贡献而受到认可。

## Acknowledgments

This work would not be possible without the support of our colleagues at Ai2:

这项工作离不开我们在 Ai2 的同事们的支持：

• We thank Ben Bogin, Tim Dettmers, Ananya Harsh Jha, Ani Kembhavi, Matt Deitke, Ian Magnusson, Sewon Min, Niklas Muennighoff, Yizhong Wang, Alexander Wettig, and Valentin Hofmann for helpful research discussions and sharing of relevant findings across related projects.


• We thank Taylor Blanton, Byron Bischoff, Yen-Sung Chen, Arnavi Chheda, Jesse Dodge, Karen Farley, Huy Tran, Eric Marsh, Chris Newell, and Aaron Sarnat for building the Ai2 Playground for model demos.


• We thank Yoganand Chandrasekhar, Johann Dahm, Fangzhou Hu, and Caroline Wu for their work on the Ai2 cluster.


• We also thank others at Ai2 for many indirect contributions to the project: Robert Berry, Alex Buraczynski, Jennifer Dumas, Jason Dunkelberger, Rob Evans, David Graham, Regan Huff, Jenna James, Rodney Kinney, Bailey Kuehl, Sophie Lebrecht, Jaron Lochner, Carissa Schoenick, Will Smith, Sruthi Sreeram, Brooke Vlahos, Alice Wang, Caitlin Wittlif, Jiangjiang Yang.


We also appreciate conversations with and feedback from Cody Blakeney, Mansheej Paul, Jonathan Frankle, Armen Aghajanyan, Akshat Shrivastava, Mike Lewis, and John Schulman.

我们还感谢与 Cody Blakeney, Mansheej Paul，Jonathan Frankle，Armen Aghajanyan，Akshat Shrivastava，Mike Lewis，John Schulman 的交流与反馈。

OLMo 2 would not have been possible without the support of many other institutions. In particular, we thank Google for their support in setting up the training environment for OLMo 2 and to Cirrascale for their on-going support of Ai2’s cluster. We also acknowledge the National Artificial Intelligence Research Resource (NAIRR) Pilot and Microsoft Azure for providing inference credits in support of this project.

OLMo 2 的实现离不开许多其他机构的支持。特别感谢 Google 为 OLMo 2 搭建训练环境提供的支持，以及 Cirrascale 对 Ai2 集群的持续支持。我们还感谢国家人工智能研究资源（NAIRR）试点和 Microsoft Azure 为支持本项目提供的推理额度。

<!-- page 38 of 58 -->

## References

M. Abdin, J. Aneja, H. Awadalla, A. Awadallah, A. A. Awan, N. Bach, A. Bahree, A. Bakhtiari, J. Bao, H. Behl, et al. Phi-3 technical report: A highly capable language model locally on your phone. arXiv preprint arXiv:2404.14219, 2024a.

M. Abdin, J. Aneja, H. S. Behl, S. Bubeck, R. Eldan, S. Gunasekar, M. Harrison, R. J. Hewett, M. Javaheripi, P. Kauffmann, J. R. Lee, Y. T. Lee, Y. Li, W. Liu, C. C. T. Mendes, A. Nguyen, E. Price, G. de Rosa, O. Saarikivi, A. Salim, S. Shah, X. Wang, R. Ward, Y. Wu, D. Yu, C. Zhang, and Y. Zhang. Phi-4 technical report. arXiv preprint arXiv:2412.08905, 2024b.

Ai2. OLMo-1.7 7B: A 24-point improvement on MMLU, 4 2024. URL [https://allenai.org/blog/olmo-1-7-7b-a-24-point-improvement-on-mmlu-92b43f7d269d.](https://allenai.org/blog/olmo-1-7-7b-a-24-point-improvement-on-mmlu-92b43f7d269d)

J. Ainslie, J. Lee-Thorp, M. de Jong, Y. Zemlyanskiy, F. Lebron, and S. Sanghai. GQA: Training generalized multi-query transformer models from multi-head checkpoints. In H. Bouamor, J. Pino, and K. Bali, editors, Proceedings of the 2023 Conference on Empirical Methods in Natural Language Processing, pages 4895–4901, Singapore, Dec. 2023. Association for Computational Linguistics. doi: 10.18653/v1/2023.emnlp-main.298. URL [https://aclanthology.org/2023.emnlp-main.298/.](https://aclanthology.org/2023.emnlp-main.298/)

S. N. Akter, S. Prabhumoye, J. Kamalu, S. Satheesh, E. Nyberg, M. Patwary, M. Shoeybi, and B. Catanzaro. Mind: Math informed synthetic dialogues for pretraining llms, 2024. URL [https://arxiv.org/abs/2410.12881.](https://arxiv.org/abs/2410.12881)

L. B. Allal, A. Lozhkov, and E. Bakouch. Smollm - blazingly fast and remarkably powerful, 07 2024a.

L. B. Allal, A. Lozhkov, E. Bakouch, G. M. Blázquez, L. Tunstall, A. Piqueres, A. Marafioti, C. Zakka, L. von Werra, and T. Wolf. Smollm2 - with great data, comes great performance, 11 2024b.

E. Almazrouei, H. Alobeidli, A. Alshamsi, A. Cappelli, R. Cojocaru, M. Debbah, E. Goffinet, D. Heslow, J. Launay, Q. Malartic, B. Noune, B. Pannier, and G. Penedo. Falcon-40B: an open large language model with state-of-the-art performance. 2023.

J. Ansel, E. Yang, H. He, N. Gimelshein, A. Jain, M. Voznesensky, B. Bao, P. Bell, D. Berard, E. Burovski, G. Chauhan, A. Chourdia, W. Constable, A. Desmaison, Z. DeVito, E. Ellison, W. Feng, J. Gong, M. Gschwind, B. Hirsh, S. Huang, K. Kalambarkar, L. Kirsch, M. Lazos, M. Lezcano, Y. Liang, J. Liang, Y. Lu, C. K. Luk, B. Maher, Y. Pan, C. Puhrsch, M. Reso, M. Saroufim, M. Y. Siraichi, H. Suk, S. Zhang, M. Suo, P. Tillet, X. Zhao, E. Wang, K. Zhou, R. Zou, X. Wang, A. Mathews, W. Wen, G. Chanan, P. Wu, and S. Chintala. Pytorch 2: Faster machine learning through dynamic python bytecode transformation and graph compilation. In Proceedings of the 29th ACM International Conference on Architectural Support for Programming Languages and Operating Systems, Volume 2, ASPLOS ’24, page 929–947, New York, NY, USA, 2024. Association for Computing Machinery. ISBN 9798400703850. doi: 10.1145/3620665.3640366. URL [https://doi.org/10.1145/3620665.3640366.](https://doi.org/10.1145/3620665.3640366)

A. Antoniades, X. Wang, Y. Elazar, A. Amayuelas, A. Albalak, K. Zhang, and W. Y. Wang. Generalization v.s. memorization: Tracing language models’ capabilities back to pretraining data. ArXiv, abs/2407.14985, 2024. URL [https://api.semanticscholar.org/CorpusID:271328219.](https://api.semanticscholar.org/CorpusID:271328219)

Z. Azerbayev, H. Schoelkopf, K. Paster, M. D. Santos, S. McAleer, A. Q. Jiang, J. Deng, S. Biderman, and S. Welleck. Llemma: An open language model for mathematics, 2023.

J. Ba, J. R. Kiros, and G. E. Hinton. Layer normalization. ArXiv, abs/1607.06450, 2016. URL [https://api.semanticscholar.org/CorpusID:8236317.](https://api.semanticscholar.org/CorpusID:8236317)

A. Bhagia, J. Liu, A. Wettig, D. Heineman, O. Tafjord, A. H. Jha, L. Soldaini, N. A. Smith, D. Groeneveld, P. W. Koh, J. Dodge, and H. Hajishirzi. Establishing task scaling laws via compute-efficient model ladders, 2024. URL [https://arxiv.org/abs/2412.04403](https://arxiv.org/abs/2412.04403).

S. Biderman, H. Schoelkopf, Q. G. Anthony, H. Bradley, K. O’Brien, E. Hallahan, M. A. Khan, S. Purohit, U. S. Prashanth, E. Raff, et al. Pythia: A suite for analyzing large language models across training and scaling. In International Conference on Machine Learning, pages 2397–2430. PMLR, 2023.

S. Biderman, H. Schoelkopf, L. Sutawika, L. Gao, J. Tow, B. Abbasi, A. F. Aji, P. S. Ammanamanchi, S. Black, J. Clive, A. DiPofi, J. Etxaniz, B. Fattori, J. Z. Forde, C. Foster, M. Jaiswal, W. Y. Lee, H. Li, C. Lovering, N. Muennighoff, E. Pavlick, J. Phang, A. Skowron, S. Tan, X. Tang, K. A. Wang, G. I. Winata, F. Yvon, and A. Zou. Lessons from the trenches on reproducible evaluation of language models. arXiv:2405.14782, 2024.

<!-- page 39 of 58 -->

S. Black, S. Biderman, E. Hallahan, Q. Anthony, L. Gao, L. Golding, H. He, C. Leahy, K. McDonell, J. Phang, M. Pieler, U. S. Prashanth, S. Purohit, L. Reynolds, J. Tow, B. Wang, and S. Weinbach. GPT-NeoX-20B: An open-source autoregressive language model. In Proceedings of the ACL Workshop on Challenges & Perspectives in Creating Large Language Models, 2022. URL [https://arxiv.org/abs/2204.06745.](https://arxiv.org/abs/2204.06745)

C. Blakeney, M. Paul, B. W. Larsen, S. Owen, and J. Frankle. Does your data spark joy? performance gains from domain upsampling at the end of training, 2024. URL [https://arxiv.org/abs/2406.03476.](https://arxiv.org/abs/2406.03476)

Chameleon Team. Chameleon: Mixed-modal early-fusion foundation models. ArXiv, abs/2405.09818, 2024. URL [https://api.semanticscholar.org/CorpusID:269791516.](https://api.semanticscholar.org/CorpusID:269791516)

X. Chan, X. Wang, D. Yu, H. Mi, and D. Yu. Scaling synthetic data creation with 1,000,000,000 personas. arXiv preprint arXiv:2406.20094, 2024.

H. Chang, J. Park, S. Ye, S. Yang, Y. Seo, D.-S. Chang, and M. Seo. How do large language models acquire factual knowledge during pretraining? arXiv preprint arXiv:2406.11813, 2024.

M. Chen, J. Tworek, H. Jun, Q. Yuan, H. P. de Oliveira Pinto, J. Kaplan, H. Edwards, Y. Burda, N. Joseph, G. Brockman, A. Ray, R. Puri, G. Krueger, M. Petrov, H. Khlaaf, G. Sastry, P. Mishkin, B. Chan, S. Gray, N. Ryder, M. Pavlov, A. Power, L. Kaiser, M. Bavarian, C. Winter, P. Tillet, F. P. Such, D. Cummings, M. Plappert, F. Chantzis, E. Barnes, A. Herbert-Voss, W. H. Guss, A. Nichol, A. Paino, N. Tezak, J. Tang, I. Babuschkin, S. Balaji, S. Jain, W. Saunders, C. Hesse, A. N. Carr, J. Leike, J. Achiam, V. Misra, E. Morikawa, A. Radford, M. Knight, M. Brundage, M. Murati, K. Mayer, P. Welinder, B. McGrew, D. Amodei, S. McCandlish, I. Sutskever, and W. Zaremba. Evaluating large language models trained on code. 2021.

A. Chowdhery, S. Narang, J. Devlin, M. Bosma, G. Mishra, A. Roberts, P. Barham, H. W. Chung, C. Sutton, S. Gehrmann, P. Schuh, K. Shi, S. Tsvyashchenko, J. Maynez, A. Rao, P. Barnes, Y. Tay, N. M. Shazeer, V. Prabhakaran, E. Reif, N. Du, B. Hutchinson, R. Pope, J. Bradbury, J. Austin, M. Isard, G. Gur-Ari, P. Yin, T. Duke, A. Levskaya, S. Ghemawat, S. Dev, H. Michalewski, X. García, V. Misra, K. Robinson, L. Fedus, D. Zhou, D. Ippolito, D. Luan, H. Lim, B. Zoph, A. Spiridonov, R. Sepassi, D. Dohan, S. Agrawal, M. Omernick, A. M. Dai, T. S. Pillai, M. Pellat, A. Lewkowycz, E. Moreira, R. Child, O. Polozov, K. Lee, Z. Zhou, X. Wang, B. Saeta, M. Díaz, O. Firat, M. Catasta, J. Wei, K. S. Meier-Hellstern, D. Eck, J. Dean, S. Petrov, and N. Fiedel. Palm: Scaling language modeling with pathways. ArXiv, abs/2204.02311, 2022. URL [https://api.semanticscholar.org/CorpusID:247951931.](https://api.semanticscholar.org/CorpusID:247951931)

C. Clark, K. Lee, M.-W. Chang, T. Kwiatkowski, M. Collins, and K. Toutanova. BoolQ: Exploring the surprising difficulty of natural yes/no questions. In J. Burstein, C. Doran, and T. Solorio, editors, Proceedings of the 2019 Conference of the North American Chapter of the Association for Computational Linguistics: Human Language Technologies, Volume 1 (Long and Short Papers), pages 2924–2936, Minneapolis, Minnesota, June 2019. Association for Computational Linguistics. doi: 10.18653/v1/N19-1300. URL [https://aclanthology.org/N19-1300.](https://aclanthology.org/N19-1300)

P. Clark, I. Cowhey, O. Etzioni, T. Khot, A. Sabharwal, C. Schoenick, and O. Tafjord. Think you have solved question answering? Try ARC, the AI2 reasoning challenge. CoRR, arXiv:1803.05457, 2018.

K. Cobbe, V. Kosaraju, M. Bavarian, M. Chen, H. Jun, L. Kaiser, M. Plappert, J. Tworek, J. Hilton, R. Nakano, C. Hesse, and J. Schulman. Training verifiers to solve math word problems, 2021. URL [https://arxiv.org/abs/2110.14168](https://arxiv.org/abs/2110.14168).

Cohere. Command R: Retrieval-Augmented Generation at Production Scale. [https://cohere.com/blog/command-r](https://cohere.com/blog/command-r),2024a. Accessed: 2024-12-17.

Cohere. Introducing Command R7B: Fast and efficient generative AI. [https://cohere.com/blog/command-r7b](https://cohere.com/blog/command-r7b), 2024b. Accessed: 2024-12-17.

Cohere. Introducing Command R+: A Scalable LLM Built for Business. [https://cohere.com/blog/command-r-plus-microsoft-azure](https://cohere.com/blog/command-r-plus-microsoft-azure), 2024c. Accessed: 2024-12-17.

B. Cottier, J. You, N. Martemianova, and D. Owen. How far behind are open models?, Nov. 2024. URL [https://epoch.ai/blog/open-models-report](https://epoch.ai/blog/open-models-report). Accessed: 2024-12-18.

A. Cowsik, T. Nebabu, X.-L. Qi, and S. Ganguli. Geometric dynamics of signal propagation predict trainability of transformers, 2024. URL [https://arxiv.org/abs/2403.02579.](https://arxiv.org/abs/2403.02579)

G. Cui, L. Yuan, N. Ding, G. Yao, W. Zhu, Y. Ni, G. Xie, Z. Liu, and M. Sun. Ultrafeedback: Boosting language models with high-quality feedback. arXiv preprint arXiv:2310.01377, 2023.

T. Dao. FlashAttention-2: Faster attention with better parallelism and work partitioning. In International Conference on Learning Representations (ICLR), 2024.

<!-- page 40 of 58 -->

Databricks. Introducing DBRX: A New State-of-the-Art Open LLM, 3 2024. URL [https://www.databricks.com/blog/introducing-dbrx-new-state-art-open-llm.](https://www.databricks.com/blog/introducing-dbrx-new-state-art-open-llm)

M. Dehghani, J. Djolonga, B. Mustafa, P. Padlewski, J. Heek, J. Gilmer, A. Steiner, M. Caron, R. Geirhos, I. Alabdulmohsin, R. Jenatton, L. Beyer, M. Tschannen, A. Arnab, X. Wang, C. Riquelme, M. Minderer, J. Puigcerver, U. Evci, M. Kumar, S. van Steenkiste, G. F. Elsayed, A. Mahendran, F. Yu, A. Oliver, F. Huot, J. Bastings, M. P. Collier, A. Gritsenko, V. Birodkar, C. Vasconcelos, Y. Tay, T. Mensink, A. Kolesnikov, F. Pavetić, D. Tran, T. Kipf, M. Lučić, X. Zhai, D. Keysers, J. Harmsen, and N. Houlsby. Scaling vision transformers to 22 billion parameters, 2023a. URL [https://arxiv.org/abs/2302.05442.](https://arxiv.org/abs/2302.05442)

M. Dehghani, J. Djolonga, B. Mustafa, P. Padlewski, J. Heek, J. Gilmer, A. Steiner, M. Caron, R. Geirhos, I. M. Alabdulmohsin, R. Jenatton, L. Beyer, M. Tschannen, A. Arnab, X. Wang, C. Riquelme, M. Minderer, J. Puigcerver, U. Evci, M. Kumar, S. van Steenkiste, G. F. Elsayed, A. Mahendran, F. Yu, A. Oliver, F. Huot, J. Bastings, M. Collier, A. A. Gritsenko, V. Birodkar, C. N. Vasconcelos, Y. Tay, T. Mensink, A. Kolesnikov, F. Paveti’c, D. Tran, T. Kipf, M. Luvci’c, X. Zhai, D. Keysers, J. Harmsen, and N. Houlsby. Scaling vision transformers to 22 billion parameters. ArXiv, abs/2302.05442, 2023b. URL [https://api.semanticscholar.org/CorpusID:256808367.](https://api.semanticscholar.org/CorpusID:256808367)

J. Dodge, T. Prewitt, R. T. D. Combes, E. Odmark, R. Schwartz, E. Strubell, A. S. Luccioni, N. A. Smith, N. DeCario, and W. Buchanan. Measuring the carbon intensity of ai in cloud instances, 2022. URL [https://arxiv.org/abs/2206.05229](https://arxiv.org/abs/2206.05229).

D. Dua, Y. Wang, P. Dasigi, G. Stanovsky, S. Singh, and M. Gardner. DROP: A reading comprehension benchmark requiring discrete reasoning over paragraphs. In J. Burstein, C. Doran, and T. Solorio, editors, Proceedings of the 2019 Conference of the North American Chapter of the Association for Computational Linguistics: Human Language Technologies, Volume 1 (Long and Short Papers), pages 2368–2378, Minneapolis, Minnesota, June 2019. Association for Computational Linguistics. doi: 10.18653/v1/N19-1246. URL [https://aclanthology.org/N19-1246.](https://aclanthology.org/N19-1246)

Y. Dubois, B. Galambosi, P. Liang, and T. B. Hashimoto. Length-controlled alpacaeval: A simple way to debias automatic evaluators. arXiv preprint arXiv:2404.04475, 2024.

A. Fan, Y. Jernite, E. Perez, D. Grangier, J. Weston, and M. Auli. Eli5: Long form question answering. In Proceedings of the 57th Annual Meeting of the Association for Computational Linguistics, pages 3558–3567, 2019.

S. Feng, S. Prabhumoye, K. Kong, D. Su, M. Patwary, M. Shoeybi, and B. Catanzaro. Maximize your data’s potential: Enhancing llm accuracy with two-phase pretraining. arXiv preprint arXiv:2412.15285, 2024.

L. Gao, S. Biderman, S. Black, L. Golding, T. Hoppe, C. Foster, J. Phang, H. He, A. Thite, N. Nabeshima, S. Presser, and C. Leahy. The pile: An 800gb dataset of diverse text for language modeling. CoRR, abs/2101.00027, 2021. URL [https://arxiv.org/abs/2101.00027](https://arxiv.org/abs/2101.00027).

L. Gao, J. Tow, B. Abbasi, S. Biderman, S. Black, A. DiPofi, C. Foster, L. Golding, J. Hsu, A. Le Noac’h, H. Li, K. McDonell, N. Muennighoff, C. Ociepa, J. Phang, L. Reynolds, H. Schoelkopf, A. Skowron, L. Sutawika, E. Tang, A. Thite, B. Wang, K. Wang, and A. Zou. A framework for few-shot language model evaluation. [https://zenodo.org/records/10256836,](https://zenodo.org/records/10256836) 12 2023. URL [https://zenodo.org/records/10256836.](https://zenodo.org/records/10256836)

Gemma Team, T. Mesnard, C. Hardin, R. Dadashi, S. Bhupatiraju, S. Pathak, L. Sifre, M. Rivière, M. S. Kale, J. Love, et al. Gemma: Open models based on gemini research and technology. arXiv preprint arXiv:2403.08295, 2024a.

Gemma Team, M. Riviere, S. Pathak, P. G. Sessa, C. Hardin, S. Bhupatiraju, L. Hussenot, T. Mesnard, B. Shahriari, A. Ramé, et al. Gemma 2: Improving open language models at a practical size. arXiv e-prints, pages arXiv–2408, 2024b.

P. Glorioso, Q. Anthony, Y. Tokpanov, A. Golubeva, V. Shyam, J. Whittington, J. Pilault, and B. Millidge. The zamba2 suite: Technical report. arXiv preprint arXiv:2411.15242, 2024.

A. Grattafiori, A. Dubey, A. Jauhri, A. Pandey, A. Kadian, A. Al-Dahle, A. Letman, A. Mathurx, A. Schelten, A. Vaughan, A. Yang, A. Fan, A. Goyal, A. Hartshorn, A. Yang, A. Mitra, A. Sravankumar, A. Korenev, A. Hinsvark, A. Rao, A. Zhang, A. Rodriguez, A. Gregerson, A. Spataru, B. Roziere, B. Biron, B. Tang, B. Chern, C. Caucheteux, C. Nayak, C. Bi, C. Marra, C. McConnell, C. Keller, C. Touret, C. Wu, C. Wong, C. C. Ferrer, C. Nikolaidis, D. Allonsius, D. Song, D. Pintz, D. Livshits, D. Wyatt, D. Esiobu, D. Choudhary, D. Mahajan, D. Garcia-Olano, D. Perino, D. Hupkes, E. Lakomkin, E. AlBadawy, E. Lobanova, E. Dinan, E. M. Smith, F. Radenovic, F. Guzmán, F. Zhang, G. Synnaeve, G. Lee, G. L. Anderson, G. Thattai, G. Nail, G. Mialon, G. Pang, G. Cucurell, H. Nguyen, H. Korevaar, H. Xu, H. Touvron, I. Zarov, I. A. Ibarra, I. Kloumann, I. Misra, I. Evtimov, J. Zhang, J. Copet, J. Lee, J. Geffert, J. Vranes, J. Park, J. Mahadeokar, J. Shah, J. van der Linde, J. Billock, J. Hong, J. Lee, J. Fu, J. Chi, J. Huang, J. Liu, J. Wang, J. Yu, J. Bitton, J. Spisak, J. Park, J. Rocca, J. Johnstun, J. Saxe, J. Jia, K. V.

<!-- page 41 of 58 -->

Alwala, K. Prasad, K. Upasani, K. Plawiak, K. Li, K. Heafield, K. Stone, K. El-Arini, K. Iyer, K. Malik, K. Chiu, K. Bhalla, K. Lakhotia, L. Rantala-Yeary, L. van der Maaten, L. Chen, L. Tan, L. Jenkins, L. Martin, L. Madaan, L. Malo, L. Blecher, L. Landzaat, L. de Oliveira, M. Muzzi, M. Pasupuleti, M. Singh, M. Paluri, M. Kardas, M. Tsimpoukelli, M. Oldham, M. Rita, M. Pavlova, M. Kambadur, M. Lewis, M. Si, M. K. Singh, M. Hassan, N. Goyal, N. Torabi, N. Bashlykov, N. Bogoychev, N. Chatterji, N. Zhang, O. Duchenne, O. Çelebi, P. Alrassy, P. Zhang, P. Li, P. Vasic, P. Weng, P. Bhargava, P. Dubal, P. Krishnan, P. S. Koura, P. Xu, Q. He, Q. Dong, R. Srinivasan, R. Ganapathy, R. Calderer, R. S. Cabral, R. Stojnic, R. Raileanu, R. Maheswari, R. Girdhar, R. Patel, R. Sauvestre, R. Polidoro, R. Sumbaly, R. Taylor, R. Silva, R. Hou, R. Wang, S. Hosseini, S. Chennabasappa, S. Singh, S. Bell, S. S. Kim, S. Edunov, S. Nie, S. Narang, S. Raparthy, S. Shen, S. Wan, S. Bhosale, S. Zhang, S. Vandenhende, S. Batra, S. Whitman, S. Sootla, S. Collot, S. Gururangan, S. Borodinsky, T. Herman, T. Fowler, T. Sheasha, T. Georgiou, T. Scialom, T. Speckbacher, T. Mihaylov, T. Xiao, U. Karn, V. Goswami, V. Gupta, V. Ramanathan, V. Kerkez, V. Gonguet, V. Do, V. Vogeti, V. Albiero, V. Petrovic, W. Chu, W. Xiong, W. Fu, W. Meers, X. Martinet, X. Wang, X. Wang, X. E. Tan, X. Xia, X. Xie, X. Jia, X. Wang, Y. Goldschlag, Y. Gaur, Y. Babaei, Y. Wen, Y. Song, Y. Zhang, Y. Li, Y. Mao, Z. D. Coudert, Z. Yan, Z. Chen, Z. Papakipos, A. Singh, A. Srivastava, A. Jain, A. Kelsey, A. Shajnfeld, A. Gangidi, A. Victoria, A. Goldstand, A. Menon, A. Sharma, A. Boesenberg, A. Baevski, A. Feinstein, A. Kallet, A. Sangani, A. Teo, A. Yunus, A. Lupu, A. Alvarado, A. Caples, A. Gu, A. Ho, A. Poulton, A. Ryan, A. Ramchandani, A. Dong, A. Franco, A. Goyal, A. Saraf, A. Chowdhury, A. Gabriel, A. Bharambe, A. Eisenman, A. Yazdan, B. James, B. Maurer, B. Leonhardi, B. Huang, B. Loyd, B. D. Paola, B. Paranjape, B. Liu, B. Wu, B. Ni, B. Hancock, B. Wasti, B. Spence, B. Stojkovic, B. Gamido, B. Montalvo, C. Parker, C. Burton, C. Mejia, C. Liu, C. Wang, C. Kim, C. Zhou, C. Hu, C.-H. Chu, C. Cai, C. Tindal, C. Feichtenhofer, C. Gao, D. Civin, D. Beaty, D. Kreymer, D. Li, D. Adkins, D. Xu, D. Testuggine, D. David, D. Parikh, D. Liskovich, D. Foss, D. Wang, D. Le, D. Holland, E. Dowling, E. Jamil, E. Montgomery, E. Presani, E. Hahn, E. Wood, E.-T. Le, E. Brinkman, E. Arcaute, E. Dunbar, E. Smothers, F. Sun, F. Kreuk, F. Tian, F. Kokkinos, F. Ozgenel, F. Caggioni, F. Kanayet, F. Seide, G. M. Florez, G. Schwarz, G. Badeer, G. Swee, G. Halpern, G. Herman, G. Sizov, Guangyi, Zhang, G. Lakshminarayanan, H. Inan, H. Shojanazeri, H. Zou, H. Wang, H. Zha, H. Habeeb, H. Rudolph, H. Suk, H. Aspegren, H. Goldman, H. Zhan, I. Damlaj, I. Molybog, I. Tufanov, I. Leontiadis, I.-E. Veliche, I. Gat, J. Weissman, J. Geboski, J. Kohli, J. Lam, J. Asher, J.-B. Gaya, J. Marcus, J. Tang, J. Chan, J. Zhen, J. Reizenstein, J. Teboul, J. Zhong, J. Jin, J. Yang, J. Cummings, J. Carvill, J. Shepard, J. McPhie, J. Torres, J. Ginsburg, J. Wang, K. Wu, K. H. U, K. Saxena, K. Khandelwal, K. Zand, K. Matosich, K. Veeraraghavan, K. Michelena, K. Li, K. Jagadeesh, K. Huang, K. Chawla, K. Huang, L. Chen, L. Garg, L. A, L. Silva, L. Bell, L. Zhang, L. Guo, L. Yu, L. Moshkovich, L. Wehrstedt, M. Khabsa, M. Avalani, M. Bhatt, M. Mankus, M. Hasson, M. Lennie, M. Reso, M. Groshev, M. Naumov, M. Lathi, M. Keneally, M. Liu, M. L. Seltzer, M. Valko, M. Restrepo, M. Patel, M. Vyatskov, M. Samvelyan, M. Clark, M. Macey, M. Wang, M. J. Hermoso, M. Metanat, M. Rastegari, M. Bansal, N. Santhanam, N. Parks, N. White, N. Bawa, N. Singhal, N. Egebo, N. Usunier, N. Mehta, N. P. Laptev, N. Dong, N. Cheng, O. Chernoguz, O. Hart, O. Salpekar, O. Kalinli, P. Kent, P. Parekh, P. Saab, P. Balaji, P. Rittner, P. Bontrager, P. Roux, P. Dollar, P. Zvyagina, P. Ratanchandani, P. Yuvraj, Q. Liang, R. Alao, R. Rodriguez, R. Ayub, R. Murthy, R. Nayani, R. Mitra, R. Parthasarathy, R. Li, R. Hogan, R. Battey, R. Wang, R. Howes, R. Rinott, S. Mehta, S. Siby, S. J. Bondu, S. Datta, S. Chugh, S. Hunt, S. Dhillon, S. Sidorov, S. Pan, S. Mahajan, S. Verma, S. Yamamoto, S. Ramaswamy, S. Lindsay, S. Lindsay, S. Feng, S. Lin, S. C. Zha, S. Patil, S. Shankar, S. Zhang, S. Zhang, S. Wang, S. Agarwal, S. Sajuyigbe, S. Chintala, S. Max, S. Chen, S. Kehoe, S. Satterfield, S. Govindaprasad, S. Gupta, S. Deng, S. Cho, S. Virk, S. Subramanian, S. Choudhury, S. Goldman, T. Remez, T. Glaser, T. Best, T. Koehler, T. Robinson, T. Li, T. Zhang, T. Matthews, T. Chou, T. Shaked, V. Vontimitta, V. Ajayi, V. Montanez, V. Mohan, V. S. Kumar, V. Mangla, V. Ionescu, V. Poenaru, V. T. Mihailescu, V. Ivanov, W. Li, W. Wang, W. Jiang, W. Bouaziz, W. Constable, X. Tang, X. Wu, X. Wang, X. Wu, X. Gao, Y. Kleinman, Y. Chen, Y. Hu, Y. Jia, Y. Qi, Y. Li, Y. Zhang, Y. Zhang, Y. Adi, Y. Nam, Yu, Wang, Y. Zhao, Y. Hao, Y. Qian, Y. Li, Y. He, Z. Rait, Z. DeVito, Z. Rosnbrick, Z. Wen, Z. Yang, Z. Zhao, and Z. Ma. The llama 3 herd of models, 2024. URL [https://arxiv.org/abs/2407.21783.](https://arxiv.org/abs/2407.21783)D. Groeneveld, I. Beltagy, P. Walsh, A. Bhagia, R. Kinney, O. Tafjord, A. Jha, H. Ivison, I. Magnusson, Y. Wang, S. Arora, D. Atkinson, R. Authur, K. R. Chandu, A. Cohan, J. Dumas, Y. Elazar, Y. Gu, J. Hessel, T. Khot, W. Merrill, J. D. Morrison, N. Muennighoff, A. Naik, C. Nam, M. E. Peters, V. Pyatkin, A. Ravichander, D. Schwenk, S. Shah, W. Smith, E. Strubell, N. Subramani, M. Wortsman, P. Dasigi, N. Lambert, K. Richardson, L. S. Zettlemoyer, J. Dodge, K. Lo, L. Soldaini, N. A. Smith, and H. Hajishirzi. Olmo: Accelerating the science of language models. ArXiv, abs/2402.00838, 2024. URL [https://api.semanticscholar.org/CorpusID:267365485.](https://api.semanticscholar.org/CorpusID:267365485)

Y. Gu, O. Tafjord, B. Kuehl, D. Haddad, J. Dodge, and H. Hajishirzi. Olmes: A standard for language model evaluations. ArXiv, abs/2406.08446, 2024. URL [https://api.semanticscholar.org/CorpusID:270391754.](https://api.semanticscholar.org/CorpusID:270391754)

M. Guerquin. Introducing Ai2’s beaker. Ai2 Blog, [https://web.archive.org/web/20241231204439/https://medium.com/ai2-blog/beaker-ed617d5f4593](https://web.archive.org/web/20241231204439/https://medium.com/ai2-blog/beaker-ed617d5f4593), 2022. Accessed: 2024-12-31.

<!-- page 42 of 58 -->

S. Gururangan, A. Marasović, S. Swayamdipta, K. Lo, I. Beltagy, D. Downey, and N. A. Smith. Don’t stop pretraining: Adapt language models to domains and tasks. In Proceedings of the 58th Annual Meeting of the Association for Computational Linguistics, pages 8342–8360, 2020.

S. Gururangan, M. Wortsman, S. Y. Gadre, A. Dave, M. Kilian, W. Shi, J. Mercat, G. Smyrnis, G. Ilharco, M. Jordan, R. Heckel, A. Dimakis, A. Farhadi, V. Shankar, and L. Schmidt. open\_lm: a minimal but performative language modeling (lm) repository, 2023. URL [https://github.com/mlfoundations/open\_lm/.](https://github.com/mlfoundations/open_lm/) GitHub repository.

D. Hendrycks, C. Burns, S. Basart, A. Zou, M. Mazeika, D. Song, and J. Steinhardt. Measuring massive multitask language understanding. Proceedings of the International Conference on Learning Representations (ICLR), 2021a.

D. Hendrycks, C. Burns, S. Kadavath, A. Arora, S. Basart, E. Tang, D. Song, and J. Steinhardt. Measuring mathematical problem solving with the math dataset. NeurIPS, 2021b.

A. Hurst, A. Lerer, A. P. Goucher, A. Perelman, A. Ramesh, A. Clark, A. Ostrow, A. Welihinda, A. Hayes, A. Radford, et al. Gpt-4o system card. arXiv preprint arXiv:2410.21276, 2024.

H. Husain, H.-H. Wu, T. Gazit, M. Allamanis, and M. Brockschmidt. CodeSearchNet challenge: Evaluating the state of semantic code search. arXiv preprint arXiv:1909.09436, 2019.

A. Ibrahim, B. Thérien, K. Gupta, M. L. Richter, Q. Anthony, T. Lesort, E. Belilovsky, and I. Rish. Simple and scalable strategies to continually pre-train large language models, 2024. URL [https://arxiv.org/abs/2403.08763](https://arxiv.org/abs/2403.08763).

H. Ivison, Y. Wang, V. Pyatkin, N. Lambert, M. Peters, P. Dasigi, J. Jang, D. Wadden, N. A. Smith, I. Beltagy, et al. Camels in a changing climate: Enhancing lm adaptation with tulu 2. arXiv preprint arXiv:2311.10702, 2023.

A. Q. Jiang, A. Sablayrolles, A. Mensch, C. Bamford, D. S. Chaplot, D. d. l. Casas, F. Bressand, G. Lengyel, G. Lample, L. Saulnier, et al. Mistral 7b. arXiv preprint arXiv:2310.06825, 2023.

X. Jin and X. Ren. Demystifying language model forgetting with low-rank example associations. 2024. URL [https://api.semanticscholar.org/CorpusID:270620654.](https://api.semanticscholar.org/CorpusID:270620654)

M. Joshi, E. Choi, D. Weld, and L. Zettlemoyer. TriviaQA: A large scale distantly supervised challenge dataset for reading comprehension. In R. Barzilay and M.-Y. Kan, editors, Proceedings of the 55th Annual Meeting of the Association for Computational Linguistics (Volume 1: Long Papers), pages 1601–1611, Vancouver, Canada, July 2017. Association for Computational Linguistics. doi: 10.18653/v1/P17-1147. URL [https://aclanthology.org/P17-1147](https://aclanthology.org/P17-1147).

J. Kaplan, S. McCandlish, T. Henighan, T. B. Brown, B. Chess, R. Child, S. Gray, A. Radford, J. Wu, and D. Amodei. Scaling laws for neural language models. arXiv preprint arXiv:2001.08361, 2020.

A. Karpathy. Cool! For the spike I’d try e.g. ‘-sl 7 -sg 7‘ to keep instability in check earlier in the training. (will skip update if loss/gradnorm > 7 sigma outlier is detected). X (formerly Twitter) [https://x.com/karpathy/status/1812917107379872145](https://x.com/karpathy/status/1812917107379872145), July 2024. Accessed 2024-12-31.

D. Kocetkov, R. Li, L. B. Allal, J. Li, C. Mou, C. M. Ferrandis, Y. Jernite, M. Mitchell, S. Hughes, T. Wolf, D. Bahdanau, L. von Werra, and H. de Vries. The stack: 3 tb of permissively licensed source code, 2022. URL [https://arxiv.org/abs/2211.15533](https://arxiv.org/abs/2211.15533).

T. Kwiatkowski, J. Palomaki, O. Redfield, M. Collins, A. Parikh, C. Alberti, D. Epstein, I. Polosukhin, J. Devlin, K. Lee, K. Toutanova, L. Jones, M. Kelcey, M.-W. Chang, A. M. Dai, J. Uszkoreit, Q. Le, and S. Petrov. Natural questions: A benchmark for question answering research. Transactions of the Association for Computational Linguistics, 7:452–466, 2019. doi: 10.1162/tacl\_a\_00276. URL [https://aclanthology.org/Q19-1026.](https://aclanthology.org/Q19-1026)

N. Lambert, J. D. Morrison, V. Pyatkin, S. Huang, H. Ivison, F. Brahman, L. J. V. Miranda, A. Liu, N. Dziri, S. Lyu, Y. Gu, S. Malik, V. Graf, J. D. Hwang, J. Yang, R. L. Bras, O. Tafjord, C. Wilhelm, L. Soldaini, N. A. Smith, Y. Wang, P. Dasigi, and H. Hajishirzi. Tulu 3: Pushing frontiers in open language model post-training. 2024. URL [https://api.semanticscholar.org/CorpusID:274192505.](https://api.semanticscholar.org/CorpusID:274192505)

S. Land and M. Bartolo. Fishing for magikarp: Automatically detecting under-trained tokens in large language models. arXiv preprint arXiv:2405.05417, 2024.

J. Li, A. Fang, G. Smyrnis, M. Ivgi, M. Jordan, S. Gadre, H. Bansal, E. Guha, S. Keh, K. Arora, S. Garg, R. Xin, N. Muennighoff, R. Heckel, J. Mercat, M. Chen, S. Gururangan, M. Wortsman, A. Albalak, Y. Bitton, M. Nezhurina, A. Abbas, C.-Y. Hsieh, D. Ghosh, J. Gardner, M. Kilian, H. Zhang, R. Shao, S. Pratt, S. Sanyal, G. Ilharco, G. Daras, K. Marathe, A. Gokaslan, J. Zhang, K. Chandu, T. Nguyen, I. Vasiljevic, S. Kakade, S. Song, S. Sanghavi, F. Faghri, S. Oh, L. Zettlemoyer, K. Lo, A. El-Nouby, H. Pouransari, A. Toshev, S. Wang, D. Groeneveld, L. Soldaini, P. W.

<!-- page 43 of 58 -->

Koh, J. Jitsev, T. Kollar, A. G. Dimakis, Y. Carmon, A. Dave, L. Schmidt, and V. Shankar. Datacomp-lm: In search of the next generation of training sets for language models, 2024. URL [https://arxiv.org/abs/2406.11794.](https://arxiv.org/abs/2406.11794)

P. Li, J. Yang, M. A. Islam, and S. Ren. Making ai less "thirsty": Uncovering and addressing the secret water footprint of ai models, 2023a. URL [https://arxiv.org/abs/2304.03271.](https://arxiv.org/abs/2304.03271)

R. Li, L. B. Allal, Y. Zi, N. Muennighoff, D. Kocetkov, C. Mou, M. Marone, C. Akiki, J. Li, J. Chim, et al. Starcoder: may the source be with you!, 2023b.

S. Lin, J. Hilton, and O. Evans. Truthfulqa: Measuring how models mimic human falsehoods. arXiv preprint arXiv:2109.07958, 2021.

B. Liu, S. Bubeck, R. Eldan, J. Kulkarni, Y. Li, A. Nguyen, R. Ward, and Y. Zhang. Tinygsm: achieving >80URL [https://arxiv.org/abs/2312.09241](https://arxiv.org/abs/2312.09241).

J. Liu, C. S. Xia, Y. Wang, and L. Zhang. Is your code generated by chatGPT really correct? rigorous evaluation of large language models for code generation. In Thirty-seventh Conference on Neural Information Processing Systems, 2023b. URL [https://openreview.net/forum?id=1qvx610Cu7.](https://openreview.net/forum?id=1qvx610Cu7)

Z. Liu, H. Hu, Y. Lin, Z. Yao, Z. Xie, Y. Wei, J. Ning, Y. Cao, Z. Zhang, L. Dong, F. Wei, and B. Guo. Swin transformer v2: Scaling up capacity and resolution. 2022 IEEE/CVF Conference on Computer Vision and Pattern Recognition (CVPR), pages 11999–12009, 2021. URL [https://api.semanticscholar.org/CorpusID:244346076.](https://api.semanticscholar.org/CorpusID:244346076)

Z. Liu, A. Qiao, W. Neiswanger, H. Wang, B. Tan, T. Tao, J. Li, Y. Wang, S. Sun, O. Pangarkar, et al. Llm360: Towards fully transparent open-source llms. arXiv preprint arXiv:2312.06550, 2023c.

S. Longpre, L. Hou, T. Vu, A. Webson, H. W. Chung, Y. Tay, D. Zhou, Q. V. Le, B. Zoph, J. Wei, et al. The flan collection: Designing data and methods for effective instruction tuning. arXiv preprint arXiv:2301.13688, 2023.

Z. Lu, A. Zhou, Z. Lu, S. Luo, W. Shi, R. Zhang, L. Song, M. Zhan, and H. Li. Mathcoder: Seamless code integration in LLMs for enhanced mathematical reasoning. In The Twelfth International Conference on Learning Representations, 2024. URL [https://openreview.net/forum?id=z8TW0ttBPp.](https://openreview.net/forum?id=z8TW0ttBPp)

A. S. Luccioni, S. Viguier, and A.-L. Ligozat. Estimating the carbon footprint of bloom, a 176b parameter language model, 2022. URL [https://arxiv.org/abs/2211.02001.](https://arxiv.org/abs/2211.02001)

A. Mallen, A. Asai, V. Zhong, R. Das, H. Hajishirzi, and D. Khashabi. When not to trust language models: Investigating effectiveness and limitations of parametric and non-parametric memories. arXiv preprint, 2022.

M. Matena and C. Raffel. Merging models with fisher-weighted averaging. 2022. URL [https://arxiv.org/abs/2111.09832](https://arxiv.org/abs/2111.09832).

S. McCandlish, J. Kaplan, D. Amodei, and O. D. Team. An empirical model of large-batch training. arXiv preprint arXiv:1812.06162, 2018.

L. Merrick, D. Xu, G. Nuti, and D. Campos. Arctic-embed: Scalable, efficient, and accurate text embedding models. arXiv preprint arXiv:2405.05374, 2024.

Mistral. Mistral Large 2: Large Enough. [https://mistral.ai/news/mistral-large-2407/](https://mistral.ai/news/mistral-large-2407/), 2024a. Accessed: 2024-12-17.

Mistral. Un Ministral, des Ministraux: Introducing the world’s best edge models. [https://mistral.ai/news/ministraux/](https://mistral.ai/news/ministraux/), 2024b. Accessed: 2024-12-17.

Mistral AI. Mistral introduces NeMO, 2024. URL [https://mistral.ai/news/mistral-nemo/](https://mistral.ai/news/mistral-nemo/). Accessed: 2024-11-21.

J. Morrison, C. Na, J. Fernandez, T. Dettmers, E. Strubell, and J. Dodge. Holistically evaluating the environmental impact of creating language models. Upcoming, 2025.

MosaicML. Llm foundry - jeopardy dataset. [https://github.com/mosaicml/llm-foundry/blob/main/scripts/eval/local\_data/world\_knowledge/jeopardy\_all.jsonl,](https://github.com/mosaicml/llm-foundry/blob/main/scripts/eval/local_data/world_knowledge/jeopardy_all.jsonl) 2024. Accessed: 2024-11-10.

MosaicML NLP Team. Introducing mpt-30b: Raising the bar for open-source foundation models, 2023. URL www.mosaicml.com/blog/mpt-30b. Accessed: 2023-06-22.

N. Muennighoff, L. Soldaini, D. Groeneveld, K. Lo, J. Morrison, S. Min, W. Shi, P. Walsh, O. Tafjord, N. Lambert, Y. Gu, S. Arora, A. Bhagia, D. Schwenk, D. Wadden, A. Wettig, B. Hui, T. Dettmers, D. Kiela, A. Farhadi, N. A. Smith, P. W. Koh, A. Singh, and H. Hajishirzi. Olmoe: Open mixture-of-experts language models, 2024. URL [https://arxiv.org/abs/2409.02060](https://arxiv.org/abs/2409.02060).

<!-- page 44 of 58 -->

Numind. Nuextract-1.5. [https://huggingface.co/numind/NuExtract-1.5,](https://huggingface.co/numind/NuExtract-1.5) 2024. Accessed: 2024-11-24.

OpenAI. GPT-3.5 turbo, 2023a. URL [https://platform.openai.com/docs/models/gp#gpt-3-5-turbo.](https://platform.openai.com/docs/models/gp#gpt-3-5-turbo)

OpenAI. GPT-4 technical report. ArXiv, abs/2303.08774, 2023b. URL [https://api.semanticscholar.org/CorpusID:257532815](https://api.semanticscholar.org/CorpusID:257532815).

OpenAI. Introducing improvements to the fine-tuning API and expanding our custom models program, 4 2024. URL [https://openai.com/index/introducing-improvements-to-the-fine-tuning-api-and-expanding-our-custom-models-program/.](https://openai.com/index/introducing-improvements-to-the-fine-tuning-api-and-expanding-our-custom-models-program/)

K. Paster, M. D. Santos, Z. Azerbayev, and J. Ba. Openwebmath: An open dataset of high-quality mathematical web text, 2023.

D. Patterson, J. Gonzalez, Q. Le, C. Liang, L.-M. Munguia, D. Rothchild, D. So, M. Texier, and J. Dean. Carbon emissions and large neural network training, 2021. URL [https://arxiv.org/abs/2104.10350.](https://arxiv.org/abs/2104.10350)

G. Penedo, H. Kydlíček, A. Lozhkov, M. Mitchell, C. Raffel, L. Von Werra, T. Wolf, et al. The FineWeb Datasets: Decanting the Web for the Finest Text Data at Scale. In The Thirty-eight Conference on Neural Information Processing Systems; Datasets and Benchmarks Track, 2024.

Qwen, :, A. Yang, B. Yang, B. Zhang, B. Hui, B. Zheng, B. Yu, C. Li, D. Liu, F. Huang, H. Wei, H. Lin, J. Yang, J. Tu, J. Zhang, J. Yang, J. Yang, J. Zhou, J. Lin, K. Dang, K. Lu, K. Bao, K. Yang, L. Yu, M. Li, M. Xue, P. Zhang, Q. Zhu, R. Men, R. Lin, T. Li, T. Xia, X. Ren, X. Ren, Y. Fan, Y. Su, Y. Zhang, Y. Wan, Y. Liu, Z. Cui, Z. Zhang, and Z. Qiu. Qwen2.5 technical report, 2024. URL [https://arxiv.org/abs/2412.15115.](https://arxiv.org/abs/2412.15115)

R. Rafailov, A. Sharma, E. Mitchell, C. D. Manning, S. Ermon, and C. Finn. Direct preference optimization: Your language model is secretly a reward model. Advances in Neural Information Processing Systems, 36, 2024.

P. Rajpurkar, J. Zhang, K. Lopyrev, and P. Liang. SQuAD: 100,000+ questions for machine comprehension of text. In J. Su, K. Duh, and X. Carreras, editors, Proceedings of the 2016 Conference on Empirical Methods in Natural Language Processing, pages 2383–2392, Austin, Texas, Nov. 2016. Association for Computational Linguistics. doi: 10.18653/v1/D16-1264. URL [https://aclanthology.org/D16-1264.](https://aclanthology.org/D16-1264)

S. Reddy, D. Chen, and C. D. Manning. CoQA: A conversational question answering challenge. Transactions of the Association for Computational Linguistics, 7:249–266, 2019. doi: 10.1162/tacl\_a\_00266. URL [https://aclanthology.org/Q19-1016](https://aclanthology.org/Q19-1016).

P. Reig, T. Luo, E. Christensen, and J. Sinistore. Guidance for calculating water use embedded in purchased electricity, 2020. URL [https://www.wri.org/research/guidance-calculating-water-use-embedded-purchased-electricity.](https://www.wri.org/research/guidance-calculating-water-use-embedded-purchased-electricity)

K. Sakaguchi, R. Le Bras, C. Bhagavatula, and Y. Choi. WinoGrande: An adversarial winograd schema challenge at scale. Proceedings of the AAAI Conference on Artificial Intelligence, 34(05):8732–8740, Apr. 2020. doi: 10.1609/ aaai.v34i05.6399. URL [https://ojs.aaai.org/index.php/AAAI/article/view/6399.](https://ojs.aaai.org/index.php/AAAI/article/view/6399)

J. Schulman, F. Wolski, P. Dhariwal, A. Radford, and O. Klimov. Proximal policy optimization algorithms. arXiv preprint arXiv:1707.06347, 2017.

C. Shaib, Y. Elazar, J. J. Li, and B. C. Wallace. Detection and measurement of syntactic templates in generated text. In Conference on Empirical Methods in Natural Language Processing, 2024. URL [https://api.semanticscholar.org/CorpusID:270869797](https://api.semanticscholar.org/CorpusID:270869797).

Z. Shao, P. Wang, Q. Zhu, R. Xu, J. Song, X. Bi, H. Zhang, M. Zhang, Y. Li, Y. Wu, et al. Deepseekmath: Pushing the limits of mathematical reasoning in open language models. arXiv preprint arXiv:2402.03300, 2024.

N. M. Shazeer. Glu variants improve transformer. ArXiv, abs/2002.05202, 2020. URL [https://api.semanticscholar.org/CorpusID:211096588](https://api.semanticscholar.org/CorpusID:211096588).

L. Soldaini and K. Lo. peS2o (Pretraining Efficiently on S2ORC) Dataset, 2023. URL [https://github.com/allenai/pes2o](https://github.com/allenai/pes2o).

L. Soldaini, R. Kinney, A. Bhagia, D. Schwenk, D. Atkinson, R. Authur, B. Bogin, K. Chandu, J. Dumas, Y. Elazar, V. Hofmann, A. H. Jha, S. Kumar, L. Lucy, X. Lyu, N. Lambert, I. Magnusson, J. Morrison, N. Muennighoff, A. Naik, C. Nam, M. E. Peters, A. Ravichander, K. Richardson, Z. Shen, E. Strubell, N. Subramani, O. Tafjord, P. Walsh, L. Zettlemoyer, N. A. Smith, H. Hajishirzi, I. Beltagy, D. Groeneveld, J. Dodge, and K. Lo. Dolma: an open corpus of three trillion tokens for language model pretraining research, 2024.

<!-- page 45 of 58 -->

J. Su, Y. Lu, S. Pan, B. Wen, and Y. Liu. Roformer: Enhanced transformer with rotary position embedding. ArXiv, abs/2104.09864, 2021. URL [https://api.semanticscholar.org/CorpusID:233307138.](https://api.semanticscholar.org/CorpusID:233307138)

M. Suzgun, N. Scales, N. Schärli, S. Gehrmann, Y. Tay, H. W. Chung, A. Chowdhery, Q. V. Le, E. H. Chi, D. Zhou, and J. Wei. Challenging big-bench tasks and whether chain-of-thought can solve them, 2022. URL [https://arxiv.org/abs/2210.09261](https://arxiv.org/abs/2210.09261).

S. Takase, S. Kiyono, S. Kobayashi, and J. Suzuki. Spike no more: Stabilizing the pre-training of large language models, 2024. URL [https://arxiv.org/abs/2312.16903.](https://arxiv.org/abs/2312.16903)

C. Tao, Q. Liu, L. Dou, N. Muennighoff, Z. Wan, P. Luo, M. Lin, and N. Wong. Scaling laws with vocabulary: Larger models deserve larger vocabularies. In Advances in Neural Information Processing Systems (NeurIPS), 2024.

G. Team, A. Kamath, J. Ferret, S. Pathak, N. Vieillard, R. Merhej, S. Perrin, T. Matejovicova, A. Ramé, M. Rivière, L. Rouillard, T. Mesnard, G. Cideron, J. bastien Grill, S. Ramos, E. Yvinec, M. Casbon, E. Pot, I. Penchev, G. Liu, F. Visin, K. Kenealy, L. Beyer, X. Zhai, A. Tsitsulin, R. Busa-Fekete, A. Feng, N. Sachdeva, B. Coleman, Y. Gao, B. Mustafa, I. Barr, E. Parisotto, D. Tian, M. Eyal, C. Cherry, J.-T. Peter, D. Sinopalnikov, S. Bhupatiraju, R. Agarwal, M. Kazemi, D. Malkin, R. Kumar, D. Vilar, I. Brusilovsky, J. Luo, A. Steiner, A. Friesen, A. Sharma, A. Sharma, A. M. Gilady, A. Goedeckemeyer, A. Saade, A. Feng, A. Kolesnikov, A. Bendebury, A. Abdagic, A. Vadi, A. György, A. S. Pinto, A. Das, A. Bapna, A. Miech, A. Yang, A. Paterson, A. Shenoy, A. Chakrabarti, B. Piot, B. Wu, B. Shahriari, B. Petrini, C. Chen, C. L. Lan, C. A. Choquette-Choo, C. Carey, C. Brick, D. Deutsch, D. Eisenbud, D. Cattle, D. Cheng, D. Paparas, D. S. Sreepathihalli, D. Reid, D. Tran, D. Zelle, E. Noland, E. Huizenga, E. Kharitonov, F. Liu, G. Amirkhanyan, G. Cameron, H. Hashemi, H. Klimczak-Plucińska, H. Singh, H. Mehta, H. T. Lehri, H. Hazimeh, I. Ballantyne, I. Szpektor, I. Nardini, J. Pouget-Abadie, J. Chan, J. Stanton, J. Wieting, J. Lai, J. Orbay, J. Fernandez, J. Newlan, J. yeong Ji, J. Singh, K. Black, K. Yu, K. Hui, K. Vodrahalli, K. Greff, L. Qiu, M. Valentine, M. Coelho, M. Ritter, M. Hoffman, M. Watson, M. Chaturvedi, M. Moynihan, M. Ma, N. Babar, N. Noy, N. Byrd, N. Roy, N. Momchev, N. Chauhan, N. Sachdeva, O. Bunyan, P. Botarda, P. Caron, P. K. Rubenstein, P. Culliton, P. Schmid, P. G. Sessa, P. Xu, P. Stanczyk, P. Tafti, R. Shivanna, R. Wu, R. Pan, R. Rokni, R. Willoughby, R. Vallu, R. Mullins, S. Jerome, S. Smoot, S. Girgin, S. Iqbal, S. Reddy, S. Sheth, S. Põder, S. Bhatnagar, S. R. Panyam, S. Eiger, S. Zhang, T. Liu, T. Yacovone, T. Liechty, U. Kalra, U. Evci, V. Misra, V. Roseberry, V. Feinberg, V. Kolesnikov, W. Han, W. Kwon, X. Chen, Y. Chow, Y. Zhu, Z. Wei, Z. Egyed, V. Cotruta, M. Giang, P. Kirk, A. Rao, K. Black, N. Babar, J. Lo, E. Moreira, L. G. Martins, O. Sanseviero, L. Gonzalez, Z. Gleicher, T. Warkentin, V. Mirrokni, E. Senter, E. Collins, J. Barral, Z. Ghahramani, R. Hadsell, Y. Matias, D. Sculley, S. Petrov, N. Fiedel, N. Shazeer, O. Vinyals, J. Dean, D. Hassabis, K. Kavukcuoglu, C. Farabet, E. Buchatskaya, J.-B. Alayrac, R. Anil, Dmitry, Lepikhin, S. Borgeaud, O. Bachem, A. Joulin, A. Andreev, C. Hardin, R. Dadashi, and L. Hussenot. Gemma 3 technical report, 2025. URL [https://arxiv.org/abs/2503.19786.](https://arxiv.org/abs/2503.19786)

P. team. CUDA semantics. [https://web.archive.org/web/20241118063610/https://pytorch.org/docs/main/notes/cuda.html](https://web.archive.org/web/20241118063610/https://pytorch.org/docs/main/notes/cuda.html), 2024. Accessed: 2024-11-18.

TII. Meet falcon 2: TII releases new AI model series, outperforming meta’s new llama 3. [https://falconllm.tii.ae/falcon-2.html](https://falconllm.tii.ae/falcon-2.html), 2024a. Accessed: 2024-12-17.

TII. Falcon 3: Making advanced AI accessible and available to everyone, everywhere. [https://falconllm.tii.ae/falcon3/index.html](https://falconllm.tii.ae/falcon3/index.html), 2024b. Accessed: 2024-12-17.

Together AI. RedPajama: An open source recipe to reproduce LLaMA training dataset, 2023. URL [https://github.com/togethercomputer/RedPajama-Data](https://github.com/togethercomputer/RedPajama-Data).

H. Touvron, L. Martin, K. Stone, P. Albert, A. Almahairi, Y. Babaei, N. Bashlykov, S. Batra, P. Bhargava, S. Bhosale, et al. Llama 2: Open foundation and fine-tuned chat models. arXiv preprint arXiv:2307.09288, 2023.

A. Vaswani, N. Shazeer, N. Parmar, J. Uszkoreit, L. Jones, A. N. Gomez, L. u. Kaiser, and I. Polosukhin. Attention is all you need. In I. Guyon, U. V. Luxburg, S. Bengio, H. Wallach, R. Fergus, S. Vishwanathan, and R. Garnett, editors, Advances in Neural Information Processing Systems, volume 30. Curran Associates, Inc., 2017. URL [https://proceedings.neurips.cc/paper\_files/paper/2017/file/3f5ee243547dee91fbd053c1c4a845aa-Paper.pdf.](https://proceedings.neurips.cc/paper_files/paper/2017/file/3f5ee243547dee91fbd053c1c4a845aa-Paper.pdf)

W. Wang, M. Ghobadi, K. Shakeri, Y. Zhang, and N. Hasani. Rail-only: A low-cost high-performance network for training llms with trillion parameters. arXiv preprint arXiv:2307.12169, 2023a.

Y. Wang, X. Ma, G. Zhang, Y. Ni, A. Chandra, S. Guo, W. Ren, A. Arulraj, X. He, Z. Jiang, et al. Mmlu-pro: A more robust and challenging multi-task language understanding benchmark. arXiv preprint arXiv:2406.01574, 2024.

Z. Wang, R. Xia, and P. Liu. Generative ai for math: Part i – mathpile: A billion-token-scale pretraining corpus for math. arXiv preprint arXiv:2312.17120, 2023b.

<!-- page 46 of 58 -->

J. Wei, M. Bosma, V. Zhao, K. Guu, A. W. Yu, B. Lester, N. Du, A. M. Dai, and Q. V. Le. Finetuned language models are zero-shot learners. In International Conference on Learning Representations, 2021.

J. Wei, X. Wang, D. Schuurmans, M. Bosma, F. Xia, E. Chi, Q. V. Le, D. Zhou, et al. Chain-of-thought prompting elicits reasoning in large language models. Advances in neural information processing systems, 35:24824–24837, 2022.

J. Wei, X. Wang, D. Schuurmans, M. Bosma, B. Ichter, F. Xia, E. Chi, Q. Le, and D. Zhou. Chain-of-thought prompting elicits reasoning in large language models, 2023. URL [https://arxiv.org/abs/2201.11903.](https://arxiv.org/abs/2201.11903)

M. Wortsman, G. Ilharco, S. Y. Gadre, R. Roelofs, R. Gontijo-Lopes, A. S. Morcos, H. Namkoong, A. Farhadi, Y. Carmon, S. Kornblith, and L. Schmidt. Model soups: averaging weights of multiple fine-tuned models improves accuracy without increasing inference time, 2022. URL [https://arxiv.org/abs/2203.05482.](https://arxiv.org/abs/2203.05482)

M. Wortsman, P. J. Liu, L. Xiao, K. Everett, A. Alemi, B. Adlam, J. D. Co-Reyes, I. Gur, A. Kumar, R. Novak, J. Pennington, J. Sohl-dickstein, K. Xu, J. Lee, J. Gilmer, and S. Kornblith. Small-scale proxies for large-scale transformer training instabilities, 2023. URL [https://arxiv.org/abs/2309.14322.](https://arxiv.org/abs/2309.14322)

X.AI. Announcing Grok, 11 2023. URL [https://x.ai/blog/grok.](https://x.ai/blog/grok)

A. Yang, B. Yang, B. Hui, B. Zheng, B. Yu, C. Zhou, C. Li, C. Li, D. Liu, F. Huang, et al. Qwen2 technical report. arXiv preprint arXiv:2407.10671, 2024a.

A. Yang, A. Li, B. Yang, B. Zhang, B. Hui, B. Zheng, B. Yu, C. Gao, C. Huang, C. Lv, C. Zheng, D. Liu, F. Zhou, F. Huang, F. Hu, H. Ge, H. Wei, H. Lin, J. Tang, J. Yang, J. Tu, J. Zhang, J. Yang, J. Yang, J. Zhou, J. Zhou, J. Lin, K. Dang, K. Bao, K. Yang, L. Yu, L. Deng, M. Li, M. Xue, M. Li, P. Zhang, P. Wang, Q. Zhu, R. Men, R. Gao, S. Liu, S. Luo, T. Li, T. Tang, W. Yin, X. Ren, X. Wang, X. Zhang, X. Ren, Y. Fan, Y. Su, Y. Zhang, Y. Zhang, Y. Wan, Y. Liu, Z. Wang, Z. Cui, Z. Zhang, Z. Zhou, and Z. Qiu. Qwen3 technical report. 2025. URL [https://arxiv.org/abs/2505.09388](https://arxiv.org/abs/2505.09388).

G. Yang, J. B. Simon, and J. Bernstein. A spectral condition for feature learning, 2024b. URL [https://arxiv.org/abs/2310.17813](https://arxiv.org/abs/2310.17813).

A. Young, B. Chen, C. Li, C. Huang, G. Zhang, G. Zhang, H. Li, J. Zhu, J. Chen, J. Chang, et al. Yi: Open foundation models by 01. ai. arXiv preprint arXiv:2403.04652, 2024.

L. Yu, W. Jiang, H. Shi, J. Yu, Z. Liu, Y. Zhang, J. T. Kwok, Z. Li, A. Weller, and W. Liu. Metamath: Bootstrap your own mathematical questions for large language models. arXiv preprint arXiv:2309.12284, 2023.

R. Zellers, A. Holtzman, Y. Bisk, A. Farhadi, and Y. Choi. HellaSwag: Can a machine really finish your sentence? In A. Korhonen, D. Traum, and L. Màrquez, editors, Proceedings of the 57th Annual Meeting of the Association for Computational Linguistics, pages 4791–4800, Florence, Italy, July 2019. Association for Computational Linguistics. doi: 10.18653/v1/P19-1472. URL [https://aclanthology.org/P19-1472.](https://aclanthology.org/P19-1472)

B. Zhang and R. Sennrich. Root mean square layer normalization. ArXiv, abs/1910.07467, 2019. URL [https://api.semanticscholar.org/CorpusID:113405151.](https://api.semanticscholar.org/CorpusID:113405151)

B. Zhang, I. Titov, and R. Sennrich. Improving deep transformer with depth-scaled initialization and merged attention. In Conference on Empirical Methods in Natural Language Processing, 2019. URL [https://api.semanticscholar.org/CorpusID:201670412](https://api.semanticscholar.org/CorpusID:201670412).

G. Zhang, S. Qu, J. Liu, C. Zhang, C. Lin, C. L. Yu, D. Pan, E. Cheng, J. Liu, Q. Lin, R. Yuan, T. Zheng, W. Pang, X. Du, Y. Liang, Y. Ma, Y. Li, Z. Ma, B. Lin, E. Benetos, H. Yang, J. Zhou, K. Ma, M. Liu, M. Niu, N. Wang, Q. Que, R. Liu, S. Liu, S. Guo, S. Gao, W. Zhou, X. Zhang, Y. Zhou, Y. Wang, Y. Bai, Y. Zhang, Y. Zhang, Z. Wang, Z. Yang, Z. Zhao, J. Zhang, W. Ouyang, W. Huang, and W. Chen. Map-neo: Highly capable and transparent bilingual large language model series. arXiv preprint arXiv: 2405.19327, 2024a.

Y. Zhang, Y. Luo, Y. Yuan, and A. C.-C. Yao. Autonomous data selection with language models for mathematical texts. arXiv preprint arXiv:2402.07625, 2024b.

L. Zheng, W.-L. Chiang, Y. Sheng, S. Zhuang, Z. Wu, Y. Zhuang, Z. Lin, Z. Li, D. Li, E. Xing, et al. Judging llm-asa-judge with mt-bench and chatbot arena. Advances in Neural Information Processing Systems, 36:46595–46623, 2023.

W. Zhong, R. Cui, Y. Guo, Y. Liang, S. Lu, Y. Wang, A. Saied, W. Chen, and N. Duan. AGIEval: A human-centric benchmark for evaluating foundation models. In K. Duh, H. Gomez, and S. Bethard, editors, Findings of the Association for Computational Linguistics: NAACL 2024, pages 2299–2314, Mexico City, Mexico, June 2024.

<!-- page 47 of 58 -->

Association for Computational Linguistics. doi: 10.18653/v1/2024.findings-naacl.149. URL [https://aclanthology.org/2024.findings-naacl.149](https://aclanthology.org/2024.findings-naacl.149).

J. Zhou, T. Lu, S. Mishra, S. Brahma, S. Basu, Y. Luan, D. Zhou, and L. Hou. Instruction-following evaluation for large language models, 2023. URL [https://arxiv.org/abs/2311.07911.](https://arxiv.org/abs/2311.07911)

<!-- page 48 of 58 -->

## A OLMo 2 Evaluation Framework

We evaluate OLMo 2 using OLMES, a unified, standardized evaluation suite and toolkit<sup>35</sup> to guide the development and assess performance of language models.

### A.1 Base Model Eval

OLMo base models are evaluated on 11 tasks, consisting of 5 multiple-choice tasks, 2 generative tasks, and 4 additional held-out tasks not utilized during model development. See Table 20 for the list of tasks along with details of the task formulations following the principles of the OLMES standard (Gu et al., 2024), described further below.

OLMo 基座模型在 11 个任务上评测，包括 5 个多项选择任务，2 个生成式任务，以及 4 个开发过程中未使用的 held-out 任务。任务清单与任务形式的细节见表 20，遵循 OLMES 标准（Gu et al., 2024）的原则，下文进一步说明。

<table><tr><td>task</td><td>split</td><td># inst (total)</td><td># shots</td><td>metric</td><td>reference</td></tr><tr><td colspan="6">Multiple-choice tasks</td></tr><tr><td>ARC-Challenge (ARC_C)</td><td>Test</td><td>1172</td><td>5</td><td>pmi</td><td>(Clark et al., 2018)</td></tr><tr><td>BoolQ</td><td>Val</td><td>1000 (3270)</td><td>5</td><td>none</td><td>(Clark et al., 2019)</td></tr><tr><td>HellaSwag (HSwag)</td><td>Val</td><td>1000 (10042)</td><td>5</td><td>char</td><td>(Zellers et al., 2019)</td></tr><tr><td> $MMLU^{\dagger}$ </td><td>Test</td><td>14042</td><td>5</td><td>char</td><td>(Hendrycks et al., 2021a)</td></tr><tr><td>WinoGrande (WinoG)</td><td>Val</td><td>1267</td><td>5</td><td>none</td><td>(Sakaguchi et al., 2020)</td></tr><tr><td colspan="6">Generative tasks</td></tr><tr><td>DROP</td><td>Val</td><td>1000 (9536)</td><td>5</td><td>F1</td><td>(Dua et al., 2019)</td></tr><tr><td>Natural Questions (NatQs)</td><td>Val</td><td>1000 (3610)</td><td>5</td><td>F1</td><td>(Kwiatkowski et al., 2019)</td></tr><tr><td colspan="6">Held-out tasks</td></tr><tr><td>AGIEval English</td><td>Test</td><td>2646</td><td>1</td><td>MCF</td><td>(Zhong et al., 2024)</td></tr><tr><td>GSM8K</td><td>Test</td><td>1319</td><td>8 (CoT)</td><td>EM</td><td>(Cobbe et al., 2021)</td></tr><tr><td>MMLU-Pro</td><td>Test</td><td>12032</td><td>5</td><td>MCF</td><td>(Wang et al., 2024)</td></tr><tr><td>TriviaQA</td><td>Val</td><td>7993</td><td>5</td><td>F1</td><td>(Joshi et al., 2017)</td></tr></table>

Table 20 Details of OLMES benchmarks used in OLMo 2 evaluation, with standardized choices of dataset split, number of instances to use, along with total number if sampling was used. For multiple-choice tasks, when using the Cloze/Completion Formulation (CF), the “metric” column specifies which normalization scheme to use. Following the OLMES standard, we evaluate each model using both the MCF (Multiple-Choice Formulation) and CF formulations, and the best performing one is used. For efficiency reasons, we limit MMLU and held-out multiple-choice evaluations to MCF only as all the relevant models strongly prefer that format for these tasks.

表 20｜Details of OLMES benchmarks used in OLMo 2 evaluation, with standardized choices of dataset split, number of instances to use, along with total number if sampling was used. For mul

**Multiple-choice tasks** We use the formulation of the 10 multiple-choice tasks defined in the OLMES evaluation standard (Gu et al., 2024). OLMES (Open Language Model Evaluation Standard) is a set of principles and associated standard (with a reference implementation in the OLMES system framework) for reproducible LM evaluations that is open, practical, and documented, providing recommendations guided by experiments and results from the literature (Biderman et al., 2024; Gao et al., 2023). For multiple-choice tasks it is designed to support comparisons between smaller base models that require the cloze/completion formulation of multiple-choice questions (score each answer completion separately) against larger models that can utilize the multiple-choice formulation. To make our evaluations reproducible, we follow the OLMES standard in prompt formatting, choice of in-context examples, probability normalization, and all other details. See Table 20 and see Gu et al. (2024) for more details.

**多项选择任务** 我们使用 OLMES 评测标准（Gu et al., 2024）定义的 10 个多项选择任务的形式。OLMES (Open Language Model Evaluation Standard) 是一套原则与配套标准（在 OLMES 系统框架中有参考实现），面向可复现的语言模型评测，开放，实用，有文档，其建议由文献中的实验与结果支撑（Biderman et al., 2024; Gao et al., 2023）。对于多项选择任务，它旨在支持两类模型的对比：需要 cloze/completion 形式（对每个答案续写分别打分）的较小基座模型，与可以使用多项选择形式的较大模型。为保证评测可复现，我们在 prompt 格式，in-context 样例选择，概率归一化等所有细节上都遵循 OLMES 标准。详见表 20 与 Gu et al. (2024).

**Generative tasks** Following the principles of OLMES (Gu et al., 2024), such as prompt formatting and having 5-shot curated in-context examples, we also evaluated on a suite of generative tasks, OLMES-Gen. This suite covers factual knowledge tasks (Natural Questions (Kwiatkowski et al., 2019) and Jeopardy (MosaicML, 2024)) and tasks testing reading comprehension (SQuAD (Rajpurkar et al., 2016), DROP (Dua et al., 2019), and

<small><span class="docvortex-page-footnote" data-block-type="page_footnote" style="color:#6b7280">35<sub>The</sub> OLMES (Open Language Model Evaluation System) framework can be found at [github.com/allenai/olmes](https://github.com/allenai/olmes)</span></small>

<!-- page 49 of 58 -->

CoQA (Reddy et al., 2019)). For CoQA, the task comprises presenting a passage followed by a conversation so far, where each turn in the conversation contains a question and an answer. In this case, the previous question and answer pairs serve to guide the model in terms of the output format, and we do not include additional few-shot examples. For all other tasks, we follow OLMES in using 5-shot curated in-context examples. As the list of gold answers for these tasks are often incomplete, we use F1 as the primary metric to give partial credit when models produce answers that partially match. The task details of OLMES-Gen are summarized in Table 20.

**生成式任务** 遵循 OLMES (Gu et al., 2024) 的原则（如 prompt 格式，使用 5-shot 精选 in-context 样例），我们还在一组生成式任务 OLMES-Gen 上评测。该套件覆盖事实性知识任务 (Natural Questions (Kwiatkowski et al., 2019) 与 Jeopardy (MosaicML, 2024))，以及考察阅读理解的任务 (SQuAD (Rajpurkar et al., 2016), DROP (Dua et al., 2019) 与 CoQA (Reddy et al., 2019))。对 CoQA，任务是给出一段文本与截至目前的一段对话，对话每轮包含一问一答；此时前面的问答对本身即引导模型按该格式输出，因此我们不再加 few-shot 样例。其余任务均按 OLMES 使用 5-shot 精选 in-context 样例。由于这些任务的标准答案列表常常不完整，我们以 F1 为主指标，对部分匹配的答案给部分分。OLMES-Gen 的任务细节汇总于表 20。

**Held-out tasks** We also evaluate on a held-out suite of tasks that were not used when making decisions during model development. This suite includes advanced admission and qualification exams (AGIEval English<sup>36</sup> (Zhong et al., 2024)), tasks believed to be challenging to LMs (BigBenchHard, BBH; Suzgun et al., 2022), math reasoning (GSM8K; Cobbe et al., 2021), a more challenging and reasoning-focused extension of MMLU (MMLU Pro; Wang et al., 2024), and an unseen factual knowledge task (TriviaQA; Joshi et al., 2017). We use existing in-context examples where available - for GSM8K, we use the 8-shot CoT examples from Wei et al. (2023); for BBH we use the 3-shot CoT prompts from the original dataset; in evaluating MMLU-Pro, we used 5-shot examples from the original dataset. We use a 1-shot (with passage context, no CoT) prompt for AGIEval English, and a manually curated 5-shot examples from the train set for TriviaQA. Note that for the case of GSM8K, we never evaluated our models on the entire test set during the development stage, instead we use 200 examples to inform choices during development (e.g., choices of annealing mixtures); in Section 4 we refer to this 200-example subset as GSM\*.

**Held-out 任务** 我们还在一组 held-out 任务上评测，它们未用于模型开发中的任何决策。该套件包括高级入学与资格考试 (AGIEval English<sup>36</sup> (Zhong et al., 2024))，被认为对语言模型有挑战的任务（BigBenchHard, BBH; Suzgun et al., 2022），数学推理（GSM8K; Cobbe et al., 2021），更难且侧重推理的 MMLU 扩展（MMLU Pro; Wang et al., 2024），以及一个未见过的知识问答任务（TriviaQA; Joshi et al., 2017）。只要已有现成的 in-context 样例我们就直接使用：GSM8K 用 Wei et al. (2023) 的 8-shot CoT 样例；BBH 用原始数据集的 3-shot CoT prompt；MMLU-Pro 用原始数据集的 5-shot 样例。AGIEval English 用 1-shot（带篇章上下文，无 CoT）prompt，TriviaQA 用从训练集人工精选的 5-shot 样例。注意，对 GSM8K 我们开发阶段从不在整个测试集上评测，只用 200 个样例来指导开发中的选择（如退火混合数据的选择）；第 4 节中我们把这 200 个样例的子集记为 GSM\*。

We make all implementations publicly available at [github.com/allenai/olmes.](https://github.com/allenai/olmes)

所有实现均在 [github.com/allenai/olmes](https://github.com/allenai/olmes) 公开发布。

### A.2 Instruct Model Eval

**Instruct tasks** We perform instruct model evaluation based on existing practices in current literature using the OLMES benchmark suite (Gu et al., 2024) using the configuration reported in Lambert et al. (2024).

**Instruct 任务** 我们基于当前文献中的已有实践评测 instruct 模型，使用 OLMES 基准套件（Gu et al., 2024），并采用 Lambert et al. (2024) 报告的配置。

See Table 21 for a list of instruct tasks along with their configurations. These tasks include chat variations of our held-out tasks (GSM8k; Cobbe et al., 2021, BBH; Suzgun et al., 2022), additional long-tail knowledge (PopQA; Mallen et al., 2022), misconception (TruthfulQA; Lin et al., 2021) and instruction-following tasks (IFEval; Zhou et al., 2023, AlpacaEval 2; Dubois et al., 2024). For our MMLU instruct evaluation, we use the CoT version from Lambert et al. (2024) using their prompt asking the model to “summarize” its reasoning before answering the question. We evaluate Python code completion (HumanEval; Chen et al., 2021, HumanEval+; Liu et al., 2023b) and competition MATH (Hendrycks et al., 2021b) with the same setup and answer extraction in OLMES.

instruct 任务清单及配置见表 21。这些任务包括 held-out 任务的 chat 变体（GSM8k; Cobbe et al., 2021, BBH; Suzgun et al., 2022），长尾知识（PopQA; Mallen et al., 2022），认知误区（TruthfulQA; Lin et al., 2021）与指令遵循任务（IFEval; Zhou et al., 2023, AlpacaEval 2; Dubois et al., 2024）。MMLU 的 instruct 评测使用 Lambert et al. (2024) 的 CoT 版本，其 prompt 要求模型在作答前先 "summarize" 推理过程。Python 代码补全（HumanEval; Chen et al., 2021, HumanEval+; Liu et al., 2023b）与竞赛数学 MATH (Hendrycks et al., 2021b) 沿用 OLMES 相同的设置与答案抽取方式。

## B OLMo 2 1B

While the goal of this work is to develop development recipes for our target 7B, 13B and 32B sizes, often it is useful to perform experimentation at the 1B model size. We define OLMo 2 1B similar to OLMo 2 7B, but with the following departures:

本工作的目标是为 7B，13B 与 32B 规模开发训练配方，但在 1B 规模上做实验往往很有用。OLMo 2 1B 的定义与 OLMo 2 7B 类似，但有如下偏离：

• **Layers:** 16 instead of 32

• **Hidden Size** $\left( d _ { m o d e l } \colon \right.$ 2048 instead of 4096

• **Attention Heads (Q/KV):** 16/16 (MHA) instead of 32/32 (MHA)

• **Batch Size:** 512 instead of 1024

• **Peak LR:** 4.0 ⋅ 10E−4 instead of 3.0 ⋅ 10E−4

### B.1 Difficulties with OLMo 2 1B

We developed our OLMo 2 recipe developed using the OLMo 2 1B model (Appendix B) and have found findings to generalize well to the 7B, 13B and 32B scales, as seen by our competitive results in Table 6. Yet,

<small><span class="docvortex-page-footnote" data-block-type="page_footnote" style="color:#6b7280">36<sub>Specifically</sub> these 8 tasks: aqua-rat, logiqa-en, lsat-ar, lsat-lr, lsat-rc, sat-en, sat-math, gaokao-english</span></small>

<!-- page 50 of 58 -->

<table><tr><td>Category</td><td>Task</td><td>CoT</td><td># shots</td><td>Chat</td><td>Multiturn ICL</td><td>Metric</td></tr><tr><td colspan="7">Instruct tasks</td></tr><tr><td rowspan="3">Knowledge Recall</td><td>MMLU</td><td>✓</td><td>0</td><td>✓</td><td>✘</td><td>EM</td></tr><tr><td>PopQA</td><td>✘</td><td>15</td><td>✓</td><td>✓</td><td>EM</td></tr><tr><td>TruthfulQA</td><td>✘</td><td>6</td><td>✓</td><td>✘</td><td>MC2</td></tr><tr><td rowspan="2">Reasoning</td><td>BigBenchHard</td><td>✓</td><td>3</td><td>✓</td><td>✓</td><td>EM</td></tr><tr><td>DROP</td><td>✘</td><td>3</td><td>✘</td><td>N/A</td><td>F1</td></tr><tr><td rowspan="2">Math</td><td>GSM8K</td><td>✓</td><td>8</td><td>✓</td><td>✓</td><td>EM</td></tr><tr><td>MATH</td><td>✓</td><td>4</td><td>✓</td><td>✓</td><td>Flex EM</td></tr><tr><td rowspan="2">Coding</td><td>HumanEval</td><td>✘</td><td>0</td><td>✓</td><td>N/A</td><td>Pass@10</td></tr><tr><td>HumanEval+</td><td>✘</td><td>0</td><td>✓</td><td>N/A</td><td>Pass@10</td></tr><tr><td rowspan="2">Instruction Following</td><td>IFEval</td><td>✘</td><td>0</td><td>✓</td><td>N/A</td><td>Pass@1 (prompt; loose)</td></tr><tr><td>AlpacaEval 2</td><td>✘</td><td>0</td><td>✓</td><td>N/A</td><td>LC Winrate</td></tr><tr><td>Safety</td><td>Tülu 3 Safety</td><td>✘</td><td>0</td><td>✓</td><td>N/A</td><td>Average*</td></tr></table>

Table 21 Details of OLMES benchmarks used for to evaluate OLMo 2-Instruct. CoT are evaluations run with chain of thought prompting (Wei et al., 2022). #Shots is the number of in-context examples in the evaluation template. Chat refers to whether we use a chat template while prompting the model. Multiturn ICL refers to a setting where we present each in-context example as a separate turn in a conversation (applicable only when a chat template is used and # Shots is not 0). Average over multiple sub-evaluations

表 21｜Details of OLMES benchmarks used for to evaluate OLMo 2-Instruct. CoT are evaluations run with chain of thought prompting (Wei et al., 2022). #Shots is the number of in-context exa

we have found scaling the number of training tokens for OLMo 2 1B to be difficult.

我们的 OLMo 2 配方是用 OLMo 2 1B 模型（附录 B）开发出来的，如表 6 有竞争力的结果所示，这些发现能很好地推广到 7B，13B 与 32B 规模。但我们也发现，为 OLMo 2 1B 扩大训练 token 数量是困难的。

**Training** We pretrain OLMo 2 1B to 4 trillion tokens on OLMo 2 Mix 1124 and perform a single 50B token anneal on Dolmino Mix 1124. Similar to OLMo 2 7B, we use 2000 steps of warmup, set the schedule to 5 trillion tokens but truncate at the 4 trillion mark. We use a higher peak learning rate of 4.0 ⋅ 10E−4.

**训练** 我们在 OLMo 2 Mix 1124 上将 OLMo 2 1B 预训练到 4 万亿 token，并在 Dolmino Mix 1124 上做单次 50B token 的退火。与 OLMo 2 7B 类似，我们使用 2000 步 warmup，训练计划设为 5 万亿 token，但在 4 万亿处截断。峰值学习率用更高的 4.0 ⋅ 10E−4。

Base Results Table 22 presents experimental results on our main base model evaluation suite. We find that while OLMo 2 remains competitive with other similarly-sized models like SmolLM 2, it lags behind the smaller Gemma 2 and Qwen 2.5 base models.

基座结果 表 22 给出了主基座模型评测套件上的实验结果。我们发现，OLMo 2 虽然与 SmolLM 2 等相近规模模型相比仍有竞争力，但落后于规模更小的 Gemma 2 与 Qwen 2.5 基座模型。

<table><tr><td rowspan="2">Model</td><td rowspan="2" colspan="2">Avg FLOPs</td><td colspan="6">Dev Benchmarks</td><td colspan="4">Held-out Evals</td></tr><tr><td>MMLU</td><td> $ARC_C$ </td><td>HS</td><td>WG</td><td>NQ</td><td>DROP</td><td>AGI</td><td>GSM</td><td> $MMLU_P$ </td><td>TQA</td></tr><tr><td colspan="13">Open-weights models 1-2B Parameters</td></tr><tr><td>Qwen 2.5 1.5B</td><td>51.5</td><td>1.7</td><td>61.4</td><td>77.3</td><td>67.0</td><td>65.4</td><td>17.7</td><td>36.4</td><td>47.9</td><td>63.2</td><td>29.9</td><td>49.1</td></tr><tr><td>Gemma 2 2B</td><td>47.9</td><td>0.2</td><td>53.1</td><td>67.4</td><td>74.4</td><td>70.8</td><td>24.1</td><td>36.9</td><td>38.4</td><td>26.8</td><td>22.2</td><td>65.2</td></tr><tr><td colspan="13">Fully-open models</td></tr><tr><td>SmolLM 2 1.7B</td><td>44.7</td><td>1.1</td><td>50.9</td><td>62.0</td><td>73.3</td><td>66.9</td><td>19.1</td><td>26.5</td><td>35.3</td><td>30.3</td><td>22.0</td><td>60.6</td></tr><tr><td>OLMo 2 1B</td><td>43.7</td><td>0.4</td><td>44.3</td><td>51.3</td><td>69.5</td><td>66.5</td><td>20.8</td><td>34.0</td><td>36.3</td><td>43.8</td><td>16.1</td><td>54.7</td></tr></table>

Table 22 OLMo 2 1B vs. comparable models (size, architecture) with known pretraining FLOPs (relative to 10E23).

表 22｜OLMo 2 1B vs. comparable models (size, architecture) with known pretraining FLOPs (relative to 10E23).

**Analysis** We postulate that our OLMo 2 1B may struggle with pretraining token efficiency due to model capacity. OLMo 2 is smaller than the smallest variants of other competitive model families like Qwen 2.5

<!-- page 51 of 58 -->

<table><tr><td>Model</td><td>Avg</td><td>AE2</td><td>BBH</td><td>DROP</td><td>GSM</td><td>IFE</td><td>MATH</td><td>MMLU</td><td>Safety</td><td>PQA</td><td>TQA</td></tr><tr><td colspan="12">Open weights models 1-2B Parameters</td></tr><tr><td>Gemma 3 1B</td><td>38.3</td><td>20.4</td><td>39.4</td><td>25.1</td><td>35.0</td><td>60.6</td><td>40.3</td><td>38.9</td><td>70.2</td><td>9.6</td><td>43.8</td></tr><tr><td>Llama 3.2 1B</td><td>39.3</td><td>10.1</td><td>40.2</td><td>32.2</td><td>45.4</td><td>54.0</td><td>21.6</td><td>46.7</td><td>87.2</td><td>13.8</td><td>41.5</td></tr><tr><td>Qwen 2.5 1.5B</td><td>41.7</td><td>7.4</td><td>45.8</td><td>13.4</td><td>66.2</td><td>44.2</td><td>40.6</td><td>59.7</td><td>77.6</td><td>15.5</td><td>46.5</td></tr><tr><td colspan="12">Fully-open models</td></tr><tr><td>SmolLM2 1.7B</td><td>34.2</td><td>5.8</td><td>39.8</td><td>30.9</td><td>45.3</td><td>51.6</td><td>20.3</td><td>34.3</td><td>52.4</td><td>16.4</td><td>45.3</td></tr><tr><td>OLMo 2 1B</td><td>42.7</td><td>9.1</td><td>35.0</td><td>34.6</td><td>68.3</td><td>70.1</td><td>20.7</td><td>40.0</td><td>87.6</td><td>12.9</td><td>48.7</td></tr></table>

Table 23 OLMo 2-Instruct 1B’s performance vs open-weights models of comparable size.

表 23｜OLMo 2-Instruct 1B’s performance vs open-weights models of comparable size。

or Gemma 2. We hypothesize that below a certain model size, the optimal pretraining recipe may require the inclusion of task-specific data, such as that seen in supervised fine-tuning (SFT) to achieve non-random performance over more challenging tasks in our evaluation suite. Better performance could also be achieved by distilling from a more powerful model, a strategy used by the smaller Gemma 2 models.

**分析** 我们推测 OLMo 2 1B 在预训练 token 效率上的挣扎可能源于模型容量：OLMo 2 比 Qwen 2.5 或 Gemma 2 等竞争模型家族的最小变体还要小。我们假设，低于某个模型规模后，最优预训练配方可能需要加入任务特定数据（如监督微调（SFT）中见到的那些），才能在我们的评测套件中更具挑战性的任务上取得非随机水平的表现。另一个途径是从更强的模型蒸馏，较小的 Gemma 2 模型采用的正是这一策略。

For example, Table 9 shows the benefit of Dolmino Mix 1124 is higher with smaller base models: +37.0% for the 1B model, +18.7% for the 7B model, +15.9% for the 13B model, and +12.3% for the 32B model. These results also show that OLMo 2 1B with only Stage 1 pretraining struggles to break out of random performance for multiple-choice formatted tasks (25% for MMLU and ARC Challenge, 10% for MMLU Pro).

例如，表 9 显示 Dolmino Mix 1124 的收益随基座模型变小而增大：1B 模型 +37.0%，7B 模型 +18.7%，13B 模型 +15.9%，32B 模型 +12.3%。这些结果还表明，只经过 Stage 1 预训练的 OLMo 2 1B 在多项选择格式的任务上难以突破随机水平（MMLU 与 ARC Challenge 为 25%，MMLU Pro 为 10%）。

As further evidence of this, Table 23 shows that applying our same OLMo 2-Instruct post-training recipe to OLMo 2 1B results in OLMo 2-Instruct 1B with highly competitive performance to even Qwen 2.5 and even Gemma 3.

进一步的证据是表 23：把我们同一套 OLMo 2-Instruct 后训练配方应用到 OLMo 2 1B 上，得到的 OLMo 2-Instruct 1B 即使与 Qwen 2.5 乃至 Gemma 3 相比也极具竞争力。

<!-- page 52 of 58 -->

## C Additional Instruct Details

### C.1 Additional Hyperparameters

All of the models used to generate preference data for OLMo 2-Instruct are listed in Table 25. The prompt sources for the preference datasets are listed in Table 27 – for more information on their contents, refer to Lambert et al. (2024). The hyperparameters used to train the reward models for RLVR value network initialization are shown in Table 26.

为 OLMo 2-Instruct 生成偏好数据所用的全部模型列于表 25。偏好数据集的 prompt 来源列于表 27，其内容详见 Lambert et al. (2024)。用于训练奖励模型（RLVR value network 初始化用）的超参数见表 26。

### C.2 Additional RLVR Learning Curves

The additional 13B RLVR learning curves of can be found at Figure 18, Figure 19, and Figure 20.

13B 的额外 RLVR 训练曲线见 图 18，图 19 与 图 20。

### C.3 OLMo 2-Instruct Preview Models

We made an initial release3 prior to this report. However, soon after the release, a tokenizer issue came to our attention: **Our base model’s pre-tokenization logic differs from our instruct model’s tokenizer.**

在本报告之前我们做过一次初始发布3。然而发布后不久，一个 tokenizer 问题引起了我们的注意：**我们基座模型的预分词逻辑与 instruct 模型的 tokenizer 不一致。**

Specifically, the OLMo-2 base models utilized the GPT2Tokenizer tokenizer class, with custom pre-tokenization logic (e.g., on splitting or truncating sequences), which is lost during the instruct model’s training. Figure 17 shows the filediff between the base model’s tokenizer.json and the instruct model’s tokenizer.json.

具体而言，OLMo-2 基座模型使用 GPT2Tokenizer tokenizer 类，带有自定义的预分词逻辑（例如序列的切分或截断），而这部分逻辑在 instruct 模型的训练过程中丢失了。图 17 展示了基座模型与 instruct 模型的 tokenizer.json 之间的文件 diff。

![Image block](images/p52-figure-17-the-file-diff-between-the-olmo-2-instruct-and.png)

Figure 17 The file diff between the OLMo 2-Instruct and OLMo 2-Instruct Preview’s tokenizer.json: the pre-tokenization logic is lost during OLMo 2-Instruct Preview’s training, so we have decided to re-train OLMo 2-Instruct models.

图 17｜OLMo 2-Instruct 与 Preview 的 tokenizer.json 预分词逻辑 diff。

Because of this, we have decided to retrain our OLMo 2-Instruct models to be consistent with our base models and mark the existing post-trained models as preview models.

因此，我们决定重训 OLMo 2-Instruct 模型，使其与基座模型保持一致，并将已有的后训练模型标记为 preview 版本。

Nevertheless, the OLMo 2-Instruct Preview learning curves can be found at Figure 21 and Figure 22.

不过，OLMo 2-Instruct Preview 的训练曲线仍可在 图 21 与 图 22 查看。

<small><span class="docvortex-page-footnote" data-block-type="page_footnote" style="color:#6b7280">37<a href="https://allenai.org/blog/olmo2"><sub>https</sub>://allenai.org/blog/olmo2</a></span></small>

<!-- page 53 of 58 -->

![Chart block](images/p53-olmo-2-1124-13b-rlvr1.png)

OLMo-2-1124-13B-RLVR1

Figure 18 The top row shows the training curves of OLMo-2-1124-13B-RLVR1 showing verifiable rewards, KL divergence, and response lengths. The bottom row shows the corresponding downstream evaluations and the average scores across our evaluation suites.

图 18｜OLMo-2-1124-13B-RLVR1 的可验证奖励 / KL / 响应长度曲线。

Episodes

![Chart block](images/p53-chart.png)

![Chart block](images/p53-chart-2.png)

![Chart block](images/p53-chart-3.png)

![Chart block](images/p53-chart-4.png)

![Chart block](images/p53-chart-5.png)

![Chart block](images/p53-olmo-2-1124-13b-rlvr2.png)

OLMo-2-1124-13B-RLVR2

![Chart block](images/p53-figure-19-the-top-row-shows-the-training-curves-of-olmo.png)

Figure 19 The top row shows the training curves of OLMo-2-1124-13B-RLVR2 showing verifiable rewards, KL divergence, and response lengths. The solid lines in the bottom row show the corresponding downstream evaluation and the average scores across our evaluation suites.

图 19｜OLMo-2-1124-13B-RLVR2 的可验证奖励 / KL / 响应长度曲线。

<!-- page 54 of 58 -->

![Chart block](images/p54-olmo-2-1124-13b-instruct.png)

OLMo-2-1124-13B-Instruct

Figure 20 The top row shows the training curves of OLMo-2-1124-13B-Instruct showing verifiable rewards, KL divergence, and response lengths. The solid lines in the bottom row show the corresponding downstream evaluation and the average scores across our evaluation suites.

图 20｜OLMo-2-1124-13B-Instruct 的可验证奖励 / KL / 响应长度曲线。

![Chart block](images/p54-chart.png)

![Chart block](images/p54-episodes.png)

Episodes

![Chart block](images/p54-chart-2.png)

![Chart block](images/p54-chart-3.png)

![Chart block](images/p54-chart-4.png)

![Chart block](images/p54-chart-5.png)

![Chart block](images/p54-olmo-2-1124-13b-instruct-preview.png)

OLMo-2-1124-13B-Instruct-Preview

Figure 21 The OLMo-2-1124-13B-Instruct-Preview results. The top row shows the training curves of OLMo-2-1124-7B-Instruct on verifiable rewards, KL divergence, and response lengths. In the bottom row, the y-axes show the average scores across our evaluation suites and GSM8K scores. Overall, RLVR increases both training rewards and evaluation scores.

图 21｜OLMo-2-1124-13B-Instruct-Preview 结果与相关训练曲线。

<!-- page 55 of 58 -->

![Chart block](images/p55-chart.png)

![Chart block](images/p55-episodes.png)

Episodes

![Chart block](images/p55-chart-2.png)

![Chart block](images/p55-chart-3.png)

![Chart block](images/p55-olmo-2-1124-7b-instruct-preview.png)

OLMo-2-1124-7B-Instruct-Preview

Figure 22 The top row shows the training curves of OLMo-2-1124-13B-Instruct-Preview on verifiable rewards, KL divergence, and response lengths. In the bottom row, the y-axes show the average scores across our evaluation suites and GSM8K, IFEval, and MATH Flex scores, respectively. Overall, we found RLVR increases not only the training rewards of our 13B models but also the downstream evaluations such as GSM8K.

图 22｜OLMo-2-1124-13B-Instruct-Preview 的可验证奖励 / KL / 响应长度曲线。

| Model | Average | AGI Eval English | DeepMind Math | GPQA I | FEval OOD | MMLU Pro |
| --- | --- | --- | --- | --- | --- | --- |
| OLMo 2 32B Instruct | 44.9 | 68.3 | 34.7 | 35.9 | 33.1 | 52.7 |
| OLMo 2 32B DPO | 43.8 | 68.6 | 34.5 | 35.7 | 26.8 | 53.3 |
| OLMo 2 32B SFT | 39.3 | 63.9 | 33.4 | 32.6 | 20.4 | 46.3 |
| OLMo 2 1124 13B Inst. | 35.2 | 60.5 | 26.8 | 28.8 | 18.7 | 41.4 |
| OLMo 2 1124 13B DPO | 35.5 | 60.1 | 25.4 | 32.1 | 18.0 | 41.8 |
| OLMo 2 1124 13B SFT | 33.0 | 56.0 | 27.1 | 27.0 | 16.6 | 38.2 |
| OLMo 2 1124 7B Inst. | 32.2 | 57.2 | 19.1 | 30.1 | 18.7 | 36.0 |
| OLMo 2 1124 7B DPO | 31.8 | 56.7 | 17.7 | 30.6 | 17.3 | 36.6 |
| OLMo 2 1124 7B SFT | 29.8 | 52.7 | 19.0 | 27.7 | 16.2 | 33.2 |
| OLMo 7B 0724 Inst. | 22.9 | 43.6 | 5.8 | 27.9 | 14.4 | 22.9 |
| OLMoE 1B 7B 0924 Inst. | 20.5 | 39.1 | 4.2 | 27.5 | 11.3 | 20.6 |

Table 24 Evaluation results for OLMo Instruct models on the unseen suite from Lambert et al. (2024). Note that IFEval OOD has been improved via minor bug fixes for OLMo 2 7B and 13B, so the numbers are not exactly comparable to those in Lambert et al. (2024).

表 24｜Evaluation results for OLMo Instruct models on the unseen suite from Lambert et al. (2024). Note that IFEval OOD has been improved via minor bug fixes for OLMo 2 7B and 13B, so the

<!-- page 56 of 58 -->

## D Additional Hyperparameters

The models used for the on-policy preference data generation are listed in Table 25.

| ModelName | Reference |
| --- | --- |
| Yi-34B-Chat | (Young et al., 2024) |
| Yi-6B-Chat | (Young et al., 2024) |
| Tülu 2 7B | (Ivison et al., 2023) |
| Tülu 2 13B | (Ivison et al., 2023) |
| Google Gemma 2 27B it | (Gemma Team et al., 2024b) |
| Google Gemma 2 9B it | (Gemma Team et al., 2024b) |
| GPT-4o | (Hurst et al., 2024) |
| MPT 30B Chat | (MosaicML NLP Team, 2023) |
| MPT 7B 8k Chat | (MosaicML NLP Team, 2023) |
| Mistral 7B Instruct v0.2 | (Jiang et al., 2023) |
| Mistral Nemo Instruct 2407 | (Mistral AI, 2024) |
| Qwen2.5 32B Instruct | (Qwen et al., 2024) |
| Qwen2.5 14B Instruct | (Qwen et al., 2024) |
| Qwen 2.5 7B Instruct | (Qwen et al., 2024) |
| Falcon 7B | (Almazrouei et al., 2023) |
| SmolLM2 1.7B Instruct | (Allal et al., 2024b) |
| Phi 3 Mini 128k Instruct | (Abdin et al., 2024a) |
| Phi 3.5 Mini Instruct | (Abdin et al., 2024a) |
| NuExtract-1.5 | (Numind, 2024) |

Table 25 External models used to sample off-policy data in the synthetic preference pipeline. These are in addition to the on-policy samples from the SFT checkpoints.

表 25｜External models used to sample off-policy data in the synthetic preference pipeline. These are in addition to the on-policy samples from the SFT checkpoints.

| Hyperparameter | Value |
| --- | --- |
| Learning Rate | -63 ⋅ 10 |
| Gradient Norm Threshold | 1.0 |
| Learning Rate Schedule | Linear |
| Batch Size (effective) | 256 |
| Max Token Length | 2,048 |
| Number of Epochs | 1 |

Table 26 This table shows the hyperparameters used to train the reward model for RLVR value network initialization.

表 26｜This table shows the hyperparameters used to train the reward model for RLVR value network initialization.

<!-- page 57 of 58 -->

| Dataset | Counts | 7BDPO | 13BDPO |
| --- | --- | --- | --- |
| SFT Reused | 117,025 | ✓ | ✓ |
| SFT IF | 65,792 | ✓ | ✓ |
| WildChat Unused | 84,105 | ✓ | ✓ |
| WildChat Reused | 17,703 | ✓ | ✓ |
| WildChat IF | 10,794 |  | ✓ |
| Ultrafeedback (cleaned) | 60,816 | ✓ | ✓ |
| DaringAnteater IF | 1,618 | ✓ | ✓ |
| Tülu 3 Personas IF | 19,890 | ✓ | ✓ |
| Total | 377,743 |  |  |

Table 27 Prompt sources for preference finetuning datasets.

表 27｜Prompt sources for preference finetuning datasets。

RLVR on GSM8K, MATH, Prompts with Constraints

![Chart block](images/p57-chart.png)

![Chart block](images/p57-chart-2.png)

![Chart block](images/p57-episodes.png)

Episodes

![Chart block](images/p57-chart-3.png)

![Chart block](images/p57-chart-4.png)

![Chart block](images/p57-olmo-2-7b-instruct-preview-alternative.png)

OLMo 2 7B Instruct Preview (alternative)

![Chart block](images/p57-figure-23-the-top-row-shows-the-training-curves-of-olmo.png)

Figure 23 The top row shows the training curves of OLMo-2-1124-13B-Instruct on verifiable rewards, KL divergence, and response lengths. In the bottom row, the y-axes show the average scores across our evaluation suites and GSM8K, IFEval, and MATH Flex scores, respectively. Overall, we found RLVR increases not only the training rewards of our 13B models but also the downstream evaluations such as GSM8K.

图 23｜OLMo-2-1124-13B-Instruct 的可验证奖励 / KL / 响应长度补充曲线。

<!-- page 58 of 58 -->

![Image block](images/p58-figure-24-prompt-used-to-generate-hard-math-word.png)

Figure 24 Prompt used to generate hard math word problems. {persona} are borrowed from Chan et al. (2024).

图 24｜生成困难数学应用题所用 prompt. {persona} 借自 Chan et al. (2024).

![Image block](images/p58-figure-25-prompt-used-to-generate-solutions-for-hard.png)

Figure 25 Prompt used to generate solutions for hard math word problems.

图 25｜为困难数学应用题生成解答所用 prompt。

58

<!-- residual QA anchors -->

> **确认：** Table 12 的 microanneal 用来决定数学混合比例，它和最终 100B/300B 退火是同一预算吗？
> 不是。§4.4.2 把 microanneal 写成低成本探针：短预算上先比 math/not-math 比例与源。最终 Dolmino 采样是 50B / 100B / 300B (§2.3 / Table 5). microanneal 负责选料，不是替换正式 soup 跑次。

