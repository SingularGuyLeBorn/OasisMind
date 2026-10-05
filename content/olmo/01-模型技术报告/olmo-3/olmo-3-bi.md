---
title: "Olmo 3 · 对照译稿"
category: "模型库"
tags: ["OLMo", "对照译稿"]
published: true
excerpt: "Olmo 3 公开材料的逐段中英对照译稿,附读报告时的疑问块."
---
<!-- page 1 of 118 -->

arXiv:2512.13961v2 [cs.CL] 14 Apr 2026

# Olmo 3

**Olmo Team**

**Allyson Ettinger** <strong><sup>1</sup></strong> **Amanda Bertsch** <strong><sup>1,3</sup></strong> **Bailey Kuehl** <strong><sup>1</sup></strong> **David Graham** <strong><sup>1</sup></strong> **David Heineman** <strong><sup>1</sup></strong> **Dirk Groeneveld** <strong><sup>1</sup></strong> **Faeze Brahman** <strong><sup>1</sup></strong> **Finbarr Timbers** <strong><sup>1</sup></strong> **Hamish Ivison** <strong><sup>1,2</sup></strong> **Jacob Morrison** <strong><sup>1,2</sup></strong> **Jake Poznanski** <strong><sup>1</sup></strong> **Kyle Lo** <strong><sup>1,2</sup></strong> **Luca Soldaini** <strong><sup>1</sup></strong> **Matt Jordan** <strong><sup>1</sup></strong> **Mayee Chen** <strong><sup>1,4</sup></strong> **Michael Noukhovitch** <strong><sup>1,5,6</sup></strong> **Nathan Lambert** <strong><sup>1</sup></strong> **Pete Walsh** <strong><sup>1</sup></strong> **Pradeep Dasigi** <strong><sup>1</sup></strong> **Robert Berry** <strong><sup>1</sup></strong> **Saumya Malik** <strong><sup>1</sup></strong> **Saurabh Shah** <strong><sup>1</sup></strong> **Scott Geng** <strong><sup>1,2</sup></strong> **Shane Arora** <strong><sup>1</sup></strong> **Shashank Gupta** <strong><sup>1</sup></strong> **Taira Anderson** <strong><sup>1</sup></strong> **Teng Xiao** <strong><sup>1</sup></strong> **Tyler Murray** <strong><sup>1</sup></strong> **Tyler Romero 1 Victoria Graf** <strong><sup>1,2</sup></strong>

**Akari Asai**<strong><sup>1,3</sup></strong> **Akshita Bhagia**<strong><sup>1</sup></strong> **Alexander Wettig**<strong><sup>7</sup></strong> **Alisa Liu**<strong><sup>2</sup></strong> **Aman Rangapur**<strong><sup>1</sup></strong> **Chloe Anastasiades**<strong><sup>1</sup></strong> **Costa Huang**<strong><sup>1</sup></strong> **Dustin Schwenk**<strong><sup>1</sup></strong> **Harsh Trivedi**<strong><sup>1</sup></strong>**Ian Magnusson**<strong><sup>1,2</sup></strong> **Jaron Lochner**<strong><sup>1</sup></strong> **Jiacheng Liu**<strong><sup>1</sup></strong> **Lester James V. Miranda**<strong><sup>1</sup></strong> **Maarten Sap**<strong><sup>1,3</sup></strong> **Malia Morgan**<strong><sup>1</sup></strong> **Michael Schmitz**<strong><sup>1</sup></strong> **Michal Guerquin**<strong><sup>1</sup></strong> **Michael Wilson**<strong><sup>1</sup></strong> **Regan Huff**<strong><sup>1</sup></strong> **Ronan Le Bras**<strong><sup>1</sup></strong> **Rui Xin**<strong><sup>2</sup></strong> **Rulin Shao**<strong><sup>2</sup></strong> **Sam Skjonsberg**<strong><sup>1</sup></strong> **Shannon Zejiang Shen**<strong><sup>8</sup></strong> **Shuyue Stella Li**<strong><sup>2</sup></strong> **Tucker Wilde**<strong><sup>1</sup></strong> **Valentina Pyatkin**<strong><sup>1</sup></strong> **Will Merrill**<strong><sup>1</sup></strong> **Yapei Chang**<strong><sup>9</sup></strong> **Yuling Gu**<strong><sup>1</sup></strong> **Zhiyuan Zeng**<strong><sup>1,2</sup></strong>

**Ashish Sabharwal**<strong><sup>1</sup></strong> **Luke Zettlemoyer**<strong><sup>2</sup></strong> **Pang Wei Koh**<strong><sup>1,2</sup></strong> **Ali Farhadi**<strong><sup>1,2</sup></strong> **Noah A. Smith** <strong><sup>1,2</sup></strong> **Hannaneh Hajishirzi** <strong><sup>1,2</sup></strong>

<sup>1</sup>Allen Institute for AI <sup>2</sup>University of Washington <sup>3</sup>Carnegie Mellon University <sup>4</sup>Stanford University <sup>5</sup>Mila <sup>6</sup>Université de Montréal <sup>7</sup>Princeton University <sup>8</sup>Massachusetts Institute of Technology <sup>9</sup>University of Maryland

Olmo 3 was a team effort; authors sorted alphabetically. marks core contributors. See author contributions here.

**Olmo 3 Base:** [Olmo-3-1025-7B](https://huggingface.co/allenai/Olmo-3-1025-7B) [Olmo-3-1125-32B](https://huggingface.co/allenai/Olmo-3-1125-32B)

**Olmo 3 Think:** [Olmo-3-7B-Think](https://huggingface.co/allenai/Olmo-3-7B-Think) Olmo-{[3](https://huggingface.co/allenai/Olmo-3-32B-Think)|[3.1](https://huggingface.co/allenai/Olmo-3.1-32B-Think)}-32B-Think

**Olmo 3 Instruct:** [Olmo-3-7B-Instruct](https://huggingface.co/allenai/olmo-3-7b-instruct) [Olmo-3.1-32B-Instruct](https://huggingface.co/allenai/olmo-3.1-32B-Instruct)

**Olmo 3 RL Zero:** Olmo-3-7B-RL-Zero-{[Math](https://huggingface.co/allenai/Olmo-3-7B-RL-Zero-Math)|[Code](https://huggingface.co/allenai/Olmo-3-7B-RL-Zero-Code)|[IF](https://huggingface.co/allenai/Olmo-3-7B-RL-Zero-IF)|[General](https://huggingface.co/allenai/Olmo-3-7B-RL-Zero-General)|[Mix](https://huggingface.co/allenai/Olmo-3-7B-RL-Zero-Mix)} Olmo-3.1-7B-RL-Zero-{[Math](https://huggingface.co/allenai/Olmo-3.1-7B-RL-Zero-Math)|[Code](https://huggingface.co/allenai/Olmo-3.1-7B-RL-Zero-Code)}

**Base Data:** Pretrain: [Dolma 3 Mix](https://huggingface.co/datasets/allenai/dolma3_mix-6T-1025) Midtrain: [Dolma 3 Dolmino Mix](https://huggingface.co/datasets/allenai/dolma3_dolmino_mix-100B-1125) Long-ctx: [Dolma 3 Longmino Mix](https://huggingface.co/datasets/allenai/dolma3_longmino_mix-100B-1125)

**Think Data:** Dolci-Think-{[SFT](https://huggingface.co/datasets/allenai/Dolci-Think-SFT-7B)|[DPO](https://huggingface.co/datasets/allenai/Dolci-Think-DPO-7B)|[RL](https://huggingface.co/datasets/allenai/Dolci-Think-RL-7B)}-7B Dolci-Think-{[SFT](https://huggingface.co/datasets/allenai/Dolci-Think-SFT-32B)|[DPO](https://huggingface.co/datasets/allenai/Dolci-Think-DPO-32B)|[RL](https://huggingface.co/datasets/allenai/Dolci-Think-RL-32B)}-32B

**Instruct Data:** Dolci-Instruct-{[SFT](https://huggingface.co/datasets/allenai/Dolci-Instruct-SFT-7B)|[DPO](https://huggingface.co/datasets/allenai/Dolci-Instruct-DPO-7B)|[RL](https://huggingface.co/datasets/allenai/Dolci-Instruct-RL-7B)}

**RL-Zero Data:** Dolci-RL-Zero-{[Math](https://huggingface.co/datasets/allenai/Dolci-RL-Zero-Math-7B)|[Code](https://huggingface.co/datasets/allenai/Dolci-RL-Zero-Code-7B)|[IF](https://huggingface.co/datasets/allenai/Dolci-RL-Zero-IF-7B)|[General](https://huggingface.co/datasets/allenai/Dolci-RL-Zero-IF-7B)}-7B [Dolci-RL-Zero-Mix-7B](https://huggingface.co/datasets/allenai/Dolci-RL-Zero-Mix-7B)

**Training Code:** [OLMo-core](https://github.com/allenai/olmo-core) (pretrain) [Open Instruct](https://github.com/allenai/open-instruct) (posttrain) **Data Code:** [datamap-rs](https://github.com/allenai/datamap-rs) (data processing) [duplodocus](https://github.com/allenai/duplodocus) (deduplication) [dolma3](https://github.com/allenai/dolma3) (data recipes) **Eval Code:** [OLMES](https://github.com/allenai/olmes) (eval suite) [decon](https://github.com/allenai/decon) (eval decontamination)

**Training Logs:** Olmo-3-7B-{[Base](https://api.wandb.ai/links/ai2-llm/y8mbjvll)|[Think](https://wandb.ai/ai2-llm/Olmo-3-7B-Think/reports/Olmo-3-7B-Think-SFT-DPO-RL--VmlldzoxNTE3ODQzMA)|[Instruct](https://wandb.ai/ai2-llm/Olmo-3-7B-Instruct/reports/Olmo-3-7B-Instruct-SFT-DPO-RL--VmlldzoxNTE3ODk3Mg)|[RL-Zero](https://wandb.ai/ai2-llm/Olmo-3-7B-RL-Zero/reports/Olmo-3-7B-RL-Zero--VmlldzoxNTM0OTI1Nw)} Olmo-3-32B-{[Base](https://wandb.ai/ai2-llm/Olmo-3-1125-32B/reports/Olmo-3-32B-November-2025--VmlldzoxNTA4NzAxMw)|[Think](https://wandb.ai/ai2-llm/Olmo-3-32B-Think/reports/Olmo-3-32B-Think-SFT-DPO-RL--VmlldzoxNTE3OTA5Mg)|[Instruct](https://wandb.ai/ai2-llm/Olmo-3-32B-Instruct/reports/Olmo-3-32B-Instruct-SFT-DPO-RL--VmlldzoxNTM0OTIzNw)}

**Demo:** [32B Think](https://playground.allenai.org/?model=Olmo-3.1-32B-Think) [32B Instruct](https://playground.allenai.org/?model=Olmo-3.1-32B-Instruct) [7B Think](http://playground.allenai.org/?model=Olmo-3-7B-Think) [7B Instruct](http://playground.allenai.org/?model=Olmo-3-7B-Instruct)

**Contact:** [olmo@allenai.org](mailto:olmo@allenai.org)

## Abstract

![Image block](images/p01-we-introduce-olmo-3-a-family-of-state-of-the-art-fully.png)

> 图注: we introduce olmo 3 a family of state of the art fully.

We introduce Olmo 3, a family of state-of-the-art, fully-open language models at the 7B and 32B parameter scales. Olmo 3 model construction targets long-context reasoning, function calling, coding, instruction following, general chat, and knowledge recall. This release includes the entire model flow, i.e., the full lifecycle of the family of models, including every stage, checkpoint, data point, and dependency used to build it. Our flagship model, Olmo 3.1 Think 32B, is the strongest fully-open thinking model released to-date.

我们推出 Olmo 3 —— 7B 与 32B 参数规模上最先进的全开放语言模型家族. Olmo 3 的模型构建面向长上下文推理, function calling, 代码, 指令遵循, 通用对话与知识召回. 本次发布涵盖整个模型流程, 即该模型家族的完整生命周期, 包括构建它所用的每一个阶段, checkpoint, 数据点与依赖. 我们的旗舰模型 Olmo 3.1 Think 32B 是迄今为止发布的最强全开放 thinking 模型.

<!-- page 2 of 118 -->

## Contents

- 1 Introduction 3
- 2 Model Flow for Olmo 3 4
  - 2.1 Base Model Training 4
  - 2.2 Post-training 5
  - 2.3 Results 6
  - 2.4 Costs 6
- 3 Olmo 3 Base 8
  - 3.1 Main Results for Olmo 3 Base 8
  - 3.2 Modeling and Architecture 8
  - 3.3 Experimental Design and Evaluation 10
  - 3.4 Stage 1: Pretraining 13
  - 3.5 Stage 2: Midtraining 20
  - 3.6 Stage 3: Long-context Extension 30
  - 3.7 Base Model Results 35
- 4 Olmo 3 Think 36
  - 4.1 Main Results for Olmo 3 Think 37
  - 4.2 Supervised Finetuning with Dolci Think SFT 38
  - 4.3 Preference Tuning with Delta Learning 42
  - 4.4 Reinforcement Learning with OlmoRL: The Cherry on Top 44
  - 4.5 Key Findings 49
- 5 Olmo 3 Instruct 53
  - 5.1 Main Results for Olmo 3 Instruct 53
  - 5.2 Supervised Finetuning with Dolci Instruct SFT 54
  - 5.3 Preference Tuning with Dolci Instruct DPO 57
  - 5.4 Reinforcement Learning with Dolci Instruct-RL 60
  - 5.5 Key Findings 61
- 6 Olmo 3 RL-Zero 63
  - 6.1 Reinforcement Learning From Base with Dolci RL-Zero 63
  - 6.2 Key Findings 64
- A Appendix 84
  - A.1 Base Model Additional Training Details 84
  - A.2 Base Model Additional Data Details: Pretraining 87
  - A.3 Base Model Additional Data Details: Midtraining 91
  - A.4 Base Model Additional Evaluation Details 95
  - A.5 Base Model Additional Decontamination Details 101
  - A.6 Post-Training Additional Training Details 105
  - A.7 Post-Training Additional Data Details 107
  - A.8 Post-Training Additional Evaluation Details 114

- 1 引言 3
- 2 Olmo 3 的模型流 4
  - 2.1 Base 模型训练 4
  - 2.2 后训练 5
  - 2.3 结果 6
  - 2.4 成本 6
- 3 Olmo 3 Base 8
  - 3.1 Olmo 3 Base 主结果 8
  - 3.2 建模与架构 8
  - 3.3 实验设计与评测 10
  - 3.4 阶段 1: 预训练 13
  - 3.5 阶段 2: Midtraining 20
  - 3.6 阶段 3: 长上下文扩展 30
  - 3.7 Base 模型结果 35
- 4 Olmo 3 Think 36
  - 4.1 Olmo 3 Think 主结果 37
  - 4.2 用 Dolci Think SFT 做监督微调 38
  - 4.3 用 Delta Learning 做偏好调优 42
  - 4.4 用 OlmoRL 做强化学习 44
  - 4.5 关键发现 49
- 5 Olmo 3 Instruct 53
  - 5.1 Olmo 3 Instruct 主结果 53
  - 5.2 用 Dolci Instruct SFT 做监督微调 54
  - 5.3 用 Dolci Instruct DPO 做偏好调优 57
  - 5.4 用 Dolci Instruct-RL 做强化学习 60
  - 5.5 关键发现 61
- 6 Olmo 3 RL-Zero 63
  - 6.1 从 Base 用 Dolci RL-Zero 做强化学习 63
  - 6.2 关键发现 64
- A 附录 84
  - A.1 Base 额外训练细节 84
  - A.2 Base 额外数据细节: 预训练 87
  - A.3 Base 额外数据细节: Midtraining 91
  - A.4 Base 额外评测细节 95
  - A.5 Base 额外去污染细节 101
  - A.6 后训练额外训练细节 105
  - A.7 后训练额外数据细节 107
  - A.8 后训练额外评测细节 114

<!-- page 3 of 118 -->

## Introduction

We introduce Olmo 3, a family of state-of-the-art, fully-open language and thinking models at the 7B and 32B parameter scales with a diverse set of capabilities, including long-context reasoning, function calling, coding, instruction following, general chat, and knowledge recall. The Olmo 3 release provides complete access to its entire model flow—the full lifecycle of a language model, including every stage, checkpoint, datapoint, and dependency required to create it. This enables infinite customization through intervention at any stage of the model development process—not just the final weights.

我们推出 Olmo 3, 一套 fully-open 的语言与思考模型, 规模 7B 和 32B, 覆盖长上下文推理, function calling, 编码, 指令遵循, 通用对话和知识回忆. 这次发布给出完整 model flow, 也就是造出模型所需的每个阶段, 检查点, 数据点和依赖. 因此可以在开发过程的任一阶段介入, 而不只是拿到最终权重.

To truly advance open-source AI research and development, we argue that releasing a state-of-the-art language model should make its entire model flow—not just its endpoint—transparent and accessible. With the Olmo 3 release, we provide complete access to the pathways we charted throughout the model flow, from initial conception to the creation of state-of-the-art, fully-open language models.

要把开源研究真正往前推, 发布一个强语言模型, 应当让整条 model flow 都透明可获取, 而不只是终点. Olmo 3 把从最初设想到做出 fully-open 模型的路径都开放了.

Specifically, we train Olmo 3 Base as a foundation on which to build models with thinking and tool-use capabilities. From Olmo 3 Base we develop our flagship model, Olmo 3 Think, trained to perform step-by-step reasoning by generating intermediate thinking traces before producing a final answer. Olmo 3 Think 32B is the strongest fully-open thinking model, narrowing the gap to the best open-weight models of similar scale, such as the Qwen 3 32B thinking (Yang et al., 2025a) on our suite of reasoning benchmarks, while being trained on six times fewer tokens. Because of our fully-open approach, the Olmo 3 release also enables reasoning chains to be traced back to their original training data, unlocking research opportunities not possible with any other thinking model.

具体来说, 先训练 Olmo 3 Base, 作为再做出思考和工具使用能力的地基. 旗舰 Olmo 3 Think 从 Base 做起: 先生成中间思考轨迹, 再给最终答案. Olmo 3 Think 32B 是最强的 fully-open thinking 模型, 在我们的推理评测上缩小了与同规模最强 open-weight 模型 (如 Qwen 3 32B thinking, Yang et al., 2025a) 的差距, 训练 token 只有对方的六分之一. 因为 fully-open, 推理链可以追回原始训练数据.

![Chart block](images/p03-figure-1-the-model-flow-encompasses-training-data-code.png)

Figure 1 The model flow encompasses training data, code and intermediate checkpoints for all stages of development. While both fully-open and open-weights models release their final checkpoints (dark teal), fully-open releases like Marin, Apertus, and Olmo provide data along their model flow, enabling the careful study of intermediate development stages (beige). Olmo 3 Think 32B is shown here along with other open models of comparable size and architecture. Olmo 3 Think is competitive with Qwen 3 32B, which does not have a released base model. Its underlying Olmo 3 Base 32B surpasses all other fully-open base models.

图 1｜model flow 覆盖各阶段的训练数据, 代码和中间检查点. fully-open 和 open-weight 都会放出最终检查点 (深青色). Marin, Apertus, Olmo 还会沿 model flow 放出数据, 便于看中间阶段 (米色). 图中是 Olmo 3 Think 32B 以及规模和架构相近的其他开放模型. Olmo 3 Think 与 Qwen 3 32B 接近, 而 Qwen 3 32B 没有公开 base. 其底层 Olmo 3 Base 32B 超过其他 fully-open base.

用来说明 Olmo 的 fully-open 优势: 可比最终 thinking, 也能回追 Base 与数据; 对方只给终点权重.

In addition, we train Olmo 3 Instruct 7B and 32B models tuned to produce shorter, more direct responses. By avoiding intermediate “thinking” outputs, Olmo 3 Instruct effectively reduces response latency and is optimized for general chat and function calling. Olmo 3 Instruct 7B and 32B surpass other notable open-weight models of comparable size—Qwen 2.5 (Qwen et al., 2024), Gemma 3 (Gemma 3 Team, 2025), IBM Granite 3.3 (Soule and Bergmann, 2025), and Llama 3 (Grattafiori et al., 2024)—and additionally reduces the remaining performance gap to Qwen 3 (Yang et al., 2025a). Finally, we introduce Olmo 3 RL-Zero 7B, a variant of Olmo 3 trained using RL directly from Olmo 3 Base. Olmo 3 RL-Zero enables researchers to study how base model data affects RL performance.

此外训练了 Olmo 3 Instruct 7B 和 32B, 回答更短, 更直接. 不做中间 thinking 输出, 延迟更低, 面向通用对话和 function calling. 这两档超过同规模的一批 open-weight 模型, 包括 Qwen 2.5, Gemma 3, IBM Granite 3.3 和 Llama 3, 并缩小了与 Qwen 3 的剩余差距. 最后是 Olmo 3 RL-Zero 7B, 直接从 Olmo 3 Base 用 RL 训练, 用来看 base 的数据如何影响 RL.

<!-- page 4 of 118 -->

The Olmo 3 family is the strongest collection of fully-open base models, outperforming Stanford Marin (Hall et al., 2025), Apertus (Apertus Team, 2025), and LLM360 K2-V2 (Team et al., 2025). To achieve these results, we construct new datasets for every stage of the model flow. This includes Dolma 3, our pretraining data mix encompassing carefully-sampled natural data from crawled sources, our midtraining mix of high-quality data designed to jump-start reasoning, and a large collection of science-focused PDF documents that unlock long-context support in Olmo 3. We also introduce Dolci, a post-training data suite that advances step-by-step reasoning during supervised finetuning, provides high-quality contrastive data for preference tuning, and offers challenging general and reasoning prompts for reinforcement learning.

Olmo 3 这一族是最强的 fully-open base 集合, 超过 Stanford Marin, Apertus 和 LLM360 K2-V2. 为此给 model flow 的每个阶段都做了新数据: 预训练混合 Dolma 3, midtraining 里用来启动推理的高质量混合, 以及一批科学 PDF, 用来打开长上下文. 后训练数据套件叫 Dolci, 在 SFT 里推进逐步推理, 给偏好调优提供对比数据, 也给强化学习提供有难度的通用题和推理题.

Finally, we develop a set of new algorithmic and infrastructural advances across data processing, evaluation, pretraining, and reinforcement learning. This includes OlmoBaseEval, a benchmark suite tailored to compute-efficient base-model development, and OlmoRL, a reinforcement-learning framework incorporating efficiency optimizations tailored to our thinking models. Taken together, these training recipes are shaped by a development framework that blends distributed experimentation with centralized evaluation, enabling coordinated, capability-driven improvements throughout the model pipeline.

最后在数据处理, 评测, 预训练和强化学习上做了一批新的算法和基础设施. 其中包括 OlmoBaseEval, 面向省算力的 base 开发; 以及 OlmoRL, 按 thinking 模型做了效率优化的强化学习框架. 这些配方把分布式实验和集中评测放在一起, 让整条流水线上的改进可以对齐到能力.

## 2 Model Flow for Olmo 3 (2. Olmo 3 的模型流)

In this section, we provide a brief overview of all components of the model flow for Olmo 3, highlighting our methodology for targeting reasoning and tool-use capabilities in ways that advance beyond OLMo 2 (OLMo et al., 2024) and other open-weight models. Subsequent sections will then provide deep dives into each of the model flow components. Olmo 3 training is divided into major stages of base model training and post-training, each further divided into sub-stages as outlined in Figure 2.

本节先总览 Olmo 3 模型流的各组件, 强调我们如何把推理与工具使用能力推到超过 OLMo 2 (OLMo et al., 2024) 以及其他 open-weight 模型的位置. 后续各节再深入每个组件. Olmo 3 训练分为 Base 模型训练与后训练两大阶段, 各大阶段再按 Figure 2 拆成子阶段.

![Image block](images/p04-figure-2-depiction-of-model-flow-for-olmo-3-development.png)

Figure 2 Depiction of model flow for Olmo 3. Development is divided into major base model training (left) and post-training (right) stages, each further divided into sub-stages with their own recipes (i.e., training data and method).

图 2｜Olmo 3 模型流示意. 开发分为左侧 Base 模型训练与右侧后训练两大阶段, 各阶段再拆成带独立配方 (训练数据与方法) 的子阶段.

### 2.1 Base Model Training (2.1 Base 模型训练)

We develop Olmo 3 Base in three stages of pretraining for up to 5.9T tokens (Section §3.4), midtraining for 100 billion tokens (Section §3.5), and the newly added long-context extension for 50B (Olmo 3 Base 7B) or 100B (Olmo 3 Base 32B) tokens (Section §3.6).

我们分三阶段开发 Olmo 3 Base: 预训练最多约 5.9T token (第 §3.4 节), midtraining 为 100B token (第 §3.5 节), 以及新加入的长上下文扩展: Olmo 3 Base 7B 为 50B token, Olmo 3 Base 32B 为 100B token (第 §3.6 节).

预训练至约 5.9T (32B 实际常写截到 5.5T), midtraining 100B, 长上下文 7B 50B / 32B 100B (§2.1, Fig. 4).

**Evaluation** We develop OlmoBaseEval, a collection of benchmarking suites to support decision-making during base model development (pretraining and midtraining). Our goal is to be compute-efficient by making development decisions based on models trained at a small scale. The challenge is that such models can exhibit random-chance performance on certain tasks, and have small differences in scores that are hard to distinguish from benchmark noise. To address this, we (1) aggregate scores over clusters of tasks that assess similar capabilities (Section §3.3.1); (2) develop proxy metrics for evaluating small-scale models (Section §3.3.2); and

**评测** 我们开发 OlmoBaseEval, 一组支撑 Base 模型开发期 (预训练与 midtraining) 决策的基准套件. 目标是靠小规模训练模型做决策, 从而省算力. 难点在于: 这类模型在部分任务上可能接近随机水平, 分差又小, 容易与基准噪声分不清. 为此我们 (1) 按相近能力把任务聚类后做宏平均 (第 §3.3.1 节); (2) 为小规模模型设计代理指标 (第 §3.3.2 节); 以及

<!-- page 5 of 118 -->

(3) improve overall signal-to-noise ratio by evaluating on more examples from noisy tasks or even removing them entirely (Section §3.3.3).

(3) 通过给噪声任务评更多样本, 甚至直接剔除, 提升整体信噪比 (第 §3.3.3 节).

**Data curriculum** We curate specialized datasets for each training stage, with latter stages focused on strengthening capabilities crucial in post-training stages, such as math, code, reasoning, instruction following, and long-context understanding:

**数据课程** 我们为每个训练阶段策展专用数据, 后段更侧重强化后训练关键能力, 如数学, 代码, 推理, 指令遵循与长上下文理解:

• Pretraining We first train Olmo 3 Base on Dolma 3 Mix (Section §3.4), our 6T-token pretraining data mix. While Dolma 3 Mix is largely comprised of the same types of data sources used in other open pretraining recipes (Soldaini et al., 2024; Bakouch et al., 2025; OLMo et al., 2024), we demonstrate three key novelties:
• 预训练 我们先在 Dolma 3 Mix (第 §3.4 节) 上训练 Olmo 3 Base, 这是约 6T token 的预训练混合. 虽与其他开放预训练配方使用的数据源类型大体相近 (Soldaini et al., 2024; Bakouch et al., 2025; OLMo et al., 2024), 我们展示三点关键新意:

◦ New tooling for fast and scalable global deduplication at the trillion-token scale;
◦ 可在万亿 token 规模上快速全局去重的新工具;

◦ A novel source of academic PDFs—olmOCR science PDFs—converted to linearized plain text using olmOCR (Poznanski et al., 2025a, b);
◦ 一类新的学术 PDF 来源——olmOCR science PDFs——用 olmOCR 转成线性化纯文本 (Poznanski et al., 2025a, b);

◦ Two new methods for optimizing selection of training tokens: token-constrained mixing and quality-aware upsampling.
◦ 两种优化训练 token 选取的新方法: token-constrained mixing 与 quality-aware upsampling.

• Midtraining We continue training on Dolma 3 Dolmino Mix (Section §3.5), our 100B-token data curated to boost target capabilities across code, math, and general knowledge QA domains through the introduction of:
• Midtraining 我们继续在 Dolma 3 Dolmino Mix (第 §3.5 节) 上训练, 这是约 100B token, 面向代码 / 数学 / 通用知识 QA 等目标能力策展的数据, 并引入:

◦ A new two-part methodological framework combining 1) lightweight, distributed feedback loops on individual data sources, with 2) centralized integration tests to assess candidate mixes on base model quality and post-trainability.
◦ 一套两段式方法框架: 1) 对单个数据源做轻量分布式反馈环; 2) 用集中式 integration test 评估候选混合对 Base 质量与可后训练性的影响.

◦ Intentional inclusion instruction data and thinking traces to lay groundwork for post-training.
◦ 有意混入 instruction 数据与 thinking traces, 为后训练打底.

• Long-context extension Through Dolma 3 Longmino Mix (Section §3.6), Olmo 3 supports long-context input and output, a crucial feature to unlock reasoning and tool-use capabilities.
• 长上下文扩展 通过 Dolma 3 Longmino Mix (第 §3.6 节), Olmo 3 支持长上下文输入与输出, 这是解锁推理与工具使用的关键能力.

◦ Documents in olmOCR science PDFs enable of our long-context approach; with over 22.3M documents of length above 8K tokens (640B tokens total), and 4.5M documents over 32K tokens (380B tokens total), this collection is the largest openly available for long-context research.
◦ olmOCR science PDFs 中的文档支撑我们的长上下文路线; 长度超过 8K token 的文档逾 22.3M 篇 (合计 640B token), 超过 32K token 的逾 4.5M 篇 (合计 380B token), 是公开可获得的最大长上下文研究集合之一.

◦ As result, Olmo 3 is our first model with long-context capabilities, supporting up to 65K context after extension. Olmo 3 Base 32B rivals performance of Qwen 2.5 32B, Mistral Small 3.1 24B, and Gemma 3 27B on long-context benchmarks, despite a short extension stage (50B for 7B, 100B for 32B).
◦ 结果是, Olmo 3 成为我们首个具备长上下文能力的模型, 扩展后支持最高 65K 上下文. 尽管扩展阶段很短 (7B 为 50B, 32B 为 100B), Olmo 3 Base 32B 在长上下文基准上可与 Qwen 2.5 32B, Mistral Small 3.1 24B 与 Gemma 3 27B 抗衡.

**Open artifacts** We release all of our intermediate checkpoints as well as the final models at the end of each stage of training. For data, we release both our data mixes, which are the actual tokens used for base model training, as well as our full source data pools for each stage—9T tokens of cleaned source tokens for pretraining, and 2T and 640B tokens of specialized data for midtraining and long-context extension respectively. For pretraining, in addition to our actual training mix for Olmo 3 Base, we also release smaller sample mixes for accessible experimentation with less compute (150B for pretraining and 10B for midtraining).

**开放产物** 我们在每个训练阶段结束时释放全部中间检查点与最终模型. 数据方面, 既释放实际用于 Base 训练的 data mixes, 也释放各阶段完整源数据池——预训练约 9T 清洗源 token, midtraining 与长上下文扩展分别为约 2T 与 640B 专用 token. 预训练除 Olmo 3 Base 真实训练 mix 外, 还释放供低算力实验的较小采样 mix (预训练 150B, midtraining 10B).

### 2.2 Post-training (2.2 后训练)

We post-train Olmo 3 Base into three model variants:

我们把 Olmo 3 Base 后训练成三个模型变体:

• Olmo 3 Think (Section §4) is trained to perform extended reasoning by generating a structured thinking trace before a final answer. We train it via SFT, DPO, and RLVR, observing gains at each stage.
• Olmo 3 Think (第 §4 节) 训练成先生成结构化 thinking trace, 再给出终答的扩展推理模型. 我们经 SFT, DPO 与 RLVR 训练, 并在每一阶段都观察到增益.

◦ We introduce Dolci Think SFT (Section §4.2), Dolci Think DPO (Section §4.3), and Dolci Think RL (Section §4.4), new post-training datasets designed to target a broad range of key capabilities such as math, coding, instruction following, and general conversation. The dataset includes synthetic examples with long thinking traces for supervised finetuning, high-quality contrastive data following the insights from Delta Learning (Geng et al., 2025), and challenging prompts for reinforcement learning across both verifiable and non-verifiable domains. In particular, our new approach to curating contrastive instances for preference tuning expands the reasoning frontier of the model beyond what SFT alone can provide and primes the model for effective reinforcement learning.
◦ 我们引入 Dolci Think SFT (第 §4.2 节), Dolci Think DPO (第 §4.3 节) 与 Dolci Think RL (第 §4.4 节), 面向数学, 代码, 指令遵循与通用对话等关键能力的新后训练数据. 其中包含带长 thinking traces 的合成监督样本, 遵循 Delta Learning (Geng et al., 2025) 洞见的高质量对比数据, 以及覆盖可验证与不可验证域的困难强化学习提示. 尤其是, 我们为偏好调优策展对比实例的新做法, 把模型推理边界推到单靠 SFT 达不到的位置, 并为有效强化学习预热.

<small><span class="docvortex-page-footnote" data-block-type="page_footnote" style="color:#6b7280">1<sub>A</sub> data mix may involve upsampling or repeating data from a data pool.</span></small>

<!-- page 6 of 118 -->

◦ We introduce algorithmic and infrastructural advances in reinforcement learning with verifiable rewards (Section §4.4). This approach generalizes verifiable reasoning to multiple domains, expanding beyond the settings explored in OLMo 2 to include code and general chat. Our improvements enable longer and more stable RL runs across diverse domains and increase the overall efficiency of training cycles, leading to a 4x speedup in RL training. Notably, we introduce Olmo 3.1 Think 32B to illustrate that extended OlmoRL training leads to improved performance.
◦ 我们在带可验证奖励的强化学习上引入算法与基础设施进展 (第 §4.4 节). 该方法把可验证推理推广到多域, 相对 OLMo 2 的设定扩展到代码与通用聊天. 改进使跨域 RL 跑得更长更稳, 并提高训练循环整体效率, 带来约 4x 的 RL 训练加速. 我们特意放出 Olmo 3.1 Think 32B, 说明加长 OlmoRL 训练仍能继续抬分.

• Olmo 3 Instruct (Section §5) is trained to produce efficient and helpful responses to user queries without generating internal thinking traces. This model prioritizes typical user needs, such as avoiding excessive verbosity for easy user understanding and function-calling for user information seeking. In such settings, thinking traces are unnecessary, and inference-time efficiency matters more than inference-time scaling.
• Olmo 3 Instruct (第 §5 节) 训练成高效, 有帮助, 且不生成内部 thinking traces 的回复模型. 它优先服务典型用户需求: 避免过长以便理解, 以及用 function-calling 满足信息查询. 在这类场景下, thinking traces 并不必要, 推理期效率比 TestingTime 式放大更重要.

> §2.2 写明在通用聊天与 function calling 场景, 中间思考抬延迟, 收益不足以抵消交互成本.

◦ We introduce Dolci Instruct SFT, our new dataset enriched with data specifically created for function calling (Section §5.2.1). To directly optimize model interactivity on top of capabilities, we extend our Delta Learning preference pipeline in Dolci Instruct DPO, incorporating multi-turn preference data and targeted data length interventions that encourage concise responses (Section §5.3.1). Finally, we use reinforcement learning with verifiable rewards (Section §5.4) to further refine core capabilities, where preference tuning synergizes with RL to improve model performance while maintaining learned brevity.
◦ 我们引入 Dolci Instruct SFT, 新数据集特别充实了 function calling 数据 (第 §5.2.1 节). 为在能力之上直接优化交互性, 我们在 Dolci Instruct DPO 中扩展 Delta Learning 偏好流水, 加入多轮偏好数据与鼓励简洁回复的长度干预 (第 §5.3.1 节). 最后用带可验证奖励的强化学习 (第 §5.4 节) 继续打磨核心能力, 使偏好调优与 RL 协同提分, 同时保住已学到的简洁.

• Olmo 3 RL-Zero (Section §6) To date, all leading open RLVR benchmarks and algorithms train on top of open-weight models that do not reveal their pretraining or mid-training data (Chu et al., 2025; Yang et al., 2025a). This limits the community’s ability to study the role of pretraining data on RLVR performance. It can lead to myriad issues with benchmark evaluations being contaminated, e.g., mid-training data containing the evaluation, which makes spurious rewards as effective as true reward (Shao et al., 2025b; Wu et al., 2025c) or improvements from fixing prompt templates outweighing the improvements from RL (Liu et al., 2025b).
• Olmo 3 RL-Zero (第 §6 节) 迄今领先的开放 RLVR 基准与算法, 多建立在不公开预训练 / midtraining 数据的 open-weight 模型之上 (Chu et al., 2025; Yang et al., 2025a). 这限制了社区研究预训练数据对 RLVR 表现的作用, 也会带来基准污染等问题, 例如 midtraining 数据含评测集, 使虚假奖励看起来与真奖励一样有效 (Shao et al., 2025b; Wu et al., 2025c), 或修复提示模板的收益盖过 RL 本身 (Liu et al., 2025b).

◦ We therefore release a fully open dataset Dolci RL-Zero, an algorithmic RL zero setup for Olmo 3, and open-source OlmoRL code to enable clear benchmarking in the RL research community. We perform RLVR from Olmo 3 Base over four benchmarking domains to create the Olmo 3 RL-Zero family: math, code, precise instruction following (IF) and a general mix. In all cases, we further decontaminate Dolci RL-Zero from pretraining and midtraining data to guarantee our setup carefully studies the effect of RLVR without data leakage confounding our conclusions.
◦ 因此我们释放完全开放的 Dolci RL-Zero 数据集, Olmo 3 的 algorithmic RL zero 设定, 以及开源 OlmoRL 代码, 便于 RL 研究社区做清楚的基准对照. 我们从 Olmo 3 Base 出发, 在四个基准域上做 RLVR, 形成 Olmo 3 RL-Zero 家族: 数学, 代码, 精确指令遵循 (IF) 与通用混合. 各域都对预训练与 midtraining 数据进一步去污染, 保证结论不被数据泄漏干扰.

### 2.3 Results (2.3 结果)

Table 1 demonstrates a snapshot of our evaluation for Olmo 3 Think compared to other open-weight and fully-open models. To the best of our knowledge, Olmo 3 Think is the strongest fully-open thinking model to date. It is better than Qwen2.5-Instruct, Gemma 2 and 3 27B, DeepSeek R1, and Distilled Qwen 32B; it is also close to Qwen 3 and Qwen 3 VL 32B models, narrowing the gap to the best open-weight models of similar scale while training on roughly 6x fewer tokens.

Table 1 给出 Olmo 3 Think 相对其他 open-weight 与 fully-open 模型的评测快照. 据我们所知, Olmo 3 Think 是迄今最强的 fully-open thinking 模型. 它优于 Qwen2.5-Instruct, Gemma 2 与 3 27B, DeepSeek R1 以及 Distilled Qwen 32B; 也接近 Qwen 3 与 Qwen 3 VL 32B, 在相近规模最强 open-weight 模型面前收窄差距, 同时训练 token 大约少 6x.

同尺度最强 open-weight thinking (文内与 Qwen 3 / Qwen 3 VL 32B 等对读), 不是 fully-open 旧档.

For more details and results of other models along our Olmo 3 model flow, refer to the quick links below.

沿 Olmo 3 模型流的更多细节与其他模型结果, 见下方快速链接.

• Olmo 3 Base Section §3.7 for detailed evaluation discussion. Table 2 (32B) and Table 3 (7B) for main results. Table 12 for long context evaluations. Table 13 for pretraining vs midtraining vs long-context extension stages.
• Olmo 3 Base 详见第 §3.7 节评测讨论. 主结果见表 2 (32B) 与表 3 (7B). 长上下文评测见表 12. 预训练 vs midtraining vs 长上下文扩展阶段见表 13.

• Olmo 3 Think Section §4.1 for detailed evaluation discussion. Table 14 (32B) and Table 15 (7B) for main results, including SFT vs DPO vs RL stages.
• Olmo 3 Think 详见第 §4.1 节评测讨论. 主结果见表 14 (32B) 与表 15 (7B), 含 SFT vs DPO vs RL 各阶段.

• Olmo 3 Instruct Section §5.1 for detailed evaluation discussion. Table 25 (32B) and Table 26 (7B) for main results, including SFT vs DPO vs RL stages.
• Olmo 3 Instruct 详见第 §5.1 节评测讨论. 主结果见表 25 (32B) 与表 26 (7B), 含 SFT vs DPO vs RL 各阶段.

### 2.4 Costs (2.4 成本)

The cost of training large models is often reported as a single dollar figure, typically by converting GPU-hours at market rates to dollars, such as \$5.576M in H800-hours for DeepSeek V3 (DeepSeek-AI et al., 2025). To provide a more representative view of the resources required to train Olmo 3 32B, we instead report the wall-clock time that elapses during training.

大规模模型训练成本常被报成单一美元数, 典型做法是把 GPU 小时按市价折算, 例如 DeepSeek V3 的 \$5.576M H800 小时 (DeepSeek-AI et al., 2025). 为更如实反映训练 Olmo 3 32B 所需资源, 我们改为报告训练过程流逝的墙钟时间.

<!-- page 7 of 118 -->

|  | OLT3Mh2ionBk3.1 | Fully-OIOnsL3tM2rBuoc2t | pen Models IAnps7et0rrButucst | ILnKLs7M2t0-r3VBu62c0t | Qw32eBn 3 | QVTwLh3ein2nkB3 | Open-weig2Q.5w3e2nB | ht Models G3em27mBa | G2em27mBa | D3S2-BR1 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Math |  |  |  |  |  |  |  |  |  |  |
| MATH | 96.2 | 49.2 | 36.2 | 94.5 | 95.4 | 96.7 | 80.2 | 87.4 | 51.5 | 92.6 |
| AIME 2024 | 80.6 | 4.6 | 0.3 | 78.4 | 80.8 | 86.3 | 15.7 | 28.9 | 4.7 | 70.3 |
| AIME 2025 | 78.1 | 0.9 | 0.1 | 70.3 | 70.9 | 78.8 | 13.4 | 22.9 | 0.9 | 56.3 |
| OMEGA | 53.4 | 9.8 | 5.6 | 46.1 | 47.7 | 50.8 | 19.2 | 24.0 | 9.1 | 38.9 |
| Reasoning |  |  |  |  |  |  |  |  |  |  |
| BigBenchHard | 88.6 | 65.6 | 57.0 | 87.6 | 90.6 | 91.1 | 80.9 | 82.4 | 66.0 | 89.7 |
| ZebraLogic | 80.1 | 13.3 | 9.0 | 79.2 | 88.3 | 96.1 | 24.1 | 24.8 | 17.2 | 69.4 |
| AGI Eval English | 89.2 | 68.4 | 61.7 | 89.6 | 90.0 | 92.2 | 78.9 | 76.9 | 70.9 | 88.1 |
| Coding |  |  |  |  |  |  |  |  |  |  |
| HumanEvalPlus | 91.5 | 44.4 | 42.9 | 88.0 | 91.2 | 90.6 | 82.6 | 79.2 | 67.5 | 92.3 |
| MBPP+ | 68.3 | 49.0 | 45.8 | 66.0 | 70.6 | 66.2 | 66.6 | 65.7 | 61.2 | 70.1 |
| LiveCodeBench v3 | 83.3 | 10.6 | 9.7 | 78.4 | 90.2 | 84.8 | 49.9 | 39.0 | 28.7 | 79.5 |
| IF |  |  |  |  |  |  |  |  |  |  |
| IFEval | 93.8 | 85.8 | 70.4 | 85.3 | 86.5 | 85.5 | 81.9 | 85.4 | 62.1 | 78.7 |
| IFBench | 68.1 | 36.4 | 26.0 | 57.7 | 37.3 | 55.1 | 36.7 | 31.3 | 27.8 | 23.8 |
| Knowledge &amp; QA |  |  |  |  |  |  |  |  |  |  |
| MMLU | 86.4 | 77.1 | 70.2 | 88.4 | 88.8 | 90.1 | 84.6 | 74.6 | 76.1 | 88.0 |
| PopQA | 30.9 | 37.2 | 33.6 | 32.2 | 30.7 | 32.2 | 28.0 | 30.2 | 30.4 | 26.7 |
| GPQA | 57.5 | 36.4 | 27.9 | 64.0 | 67.3 | 67.4 | 44.6 | 45.0 | 39.9 | 61.8 |
| Chat |  |  |  |  |  |  |  |  |  |  |
| AlpacaEval 2 LC | 69.1 | 38.0 | 19.9 | - | 75.6 | 80.9 | 81.9 | 65.5 | 39.8 | 26.2 |

Table 1 Results on our flagshipmodel Olmo 3.1 Think 32B on our post-training evaluation suite. Olmo 3.1 Think 32B is the best fully-open model at 32B.

表 1｜旗舰模型 Olmo 3.1 Think 32B 在后训练评测套件上的结果. Olmo 3.1 Think 32B 是 32B 档最强的 fully-open 模型.

In total, approximately 56 days elapsed from the start of training to the evaluation of the Olmo 3 Think 32B checkpoint, on a cluster with 1024 H100 GPUs dedicated to Olmo 3. The 32B 3.1 Think and Instruct checkpoints were trained after this time period. This training time is largely a reflection of applying our best recipe to the model , and does not include any substantial modifications or research ideas that could expand the timeline substantially. At a price of \$2/H100 hour, this would cost \$2.75M. Runtime breakdown is as follows:

从训练开始到评完 Olmo 3 Think 32B 检查点, 大约历时 56 天, 集群上有 1024 张专供 Olmo 3 的 H100. 32B 的 3.1 Think 与 Instruct 检查点在此时间段之后训练. 该时长大体反映把最佳配方应用到模型上, 不含可能大幅拉长日程的重大改动或研究想法. 按 \$2/H100 小时计, 约合 \$2.75M. 运行时分解如下:

• Pretraining: ∼47 days (including midtraining and long-context stages) The initial pretraining phase on 5.5T tokens took about 9.5 days on 512 GPUs, followed by an additional 35 days on 1024 GPUs. These durations include all crash resumptions and other engineering concerns that kept us from running at full speed. Midtraining consisted of two parallel runs on 512 GPUs each, covering 100B tokens per run, followed by model merging and evaluations to decide on final checkpoints, taking about 1.5 days in total. Long-context extension was executed as a single run on 1024 GPUs; the full long-context stage—including training and all associated merges and evaluations—added approximately one additional day.
• 预训练: ∼47 天 (含 midtraining 与长上下文阶段) 在 5.5T token 上的初始预训练约 9.5 天 / 512 GPU, 随后再约 35 天 / 1024 GPU. 这些时长包含崩溃恢复与其他使我们无法全速跑满的工程因素. Midtraining 为两次并行, 各 512 GPU, 各 100B token 的运行, 再经模型合并与评测选定最终检查点, 合计约 1.5 天. 长上下文扩展为单次 1024 GPU 运行; 含训练及全部合并与评测约再加一天.

• Post-training: ∼9 days (SFT, DPO, and RL) Post-training follows a different operational pattern in which we run each stage multiple times, sweeping over learning rates and other hyperparameters. The theory for post-training, particularly, RL, is less developed, so we have to run multiple experiments to identify the optimal hyperparameters for a given base model. We hope to address this in future work. During post-training, checkpoint evaluation consumes a larger proportion of compute resources, in part due to long generations from reasoning models on core benchmarks. For SFT, we swept over four candidate learning rates, on 256 GPUs each, in parallel for 36 hours. Then approximately 12 hours was spent on evaluation, merging, and checkpoint confirmation, totaling approximately two days. DPO training takes less time per run (about 18 hours for a full learning-rate sweep on 64 GPUs per job) but in practice extended over multiple days due to cluster instability. The final RL runs for the initial Olmo 3 Think 32B spanned approximately 5 days with at least a day of training time lost due to stability issues. After the initial release of Olmo 3, we continued our best RL run for another 21 days on 224 GPUs to produce Olmo 3.1 Think 32B.
• 后训练: ∼9 天 (SFT, DPO 与 RL) 后训练运作方式不同: 每个阶段会多次运行, 扫描学习率等超参. 后训练尤其是 RL 的理论更不成熟, 因此要对给定 Base 做多组实验找最优超参. 我们希望在未来工作中改善这一点. 后训练期间检查点评测占用更大比例算力, 部分因为推理模型在核心基准上生成很长. SFT 扫描四个候选学习率, 各 256 GPU 并行约 36 小时; 再约 12 小时用于评测, 合并与确认, 合计约两天. DPO 单次更短 (完整学习率扫描约 18 小时 / 每任务 64 GPU), 但因集群不稳实际跨多天. 初始 Olmo 3 Think 32B 的最终 RL 约 5 天, 其中至少一天因稳定性问题损失. Olmo 3 首发后, 我们把最佳 RL 再继续 21 天 / 224 GPU, 得到 Olmo 3.1 Think 32B.

> §2.4: 四个候选学习率, 各 256 GPU 并行约 36 小时, 再加约 12 小时评测与合并确认.

While pretraining accounts for the majority of total GPU hours, a non-trivial share is consumed by post-training and by the repeated checkpoint evaluations required when transitioning between major training stages. These additional costs are not captured when reporting pretraining hours alone but remain significant across the model’s full development cycle. Further pretraining details, which represent the bulk of expenditure, are provided in Appendix A.2.

尽管预训练占据总 GPU 小时的大部分, 后训练以及在主要训练阶段之间切换时所需的反复 checkpoint 评测仍消耗不可忽视的份额. 只报告预训练小时数时, 这些额外开销不会被计入, 但放在模型完整开发周期里看, 它们依然可观. 预训练占了开支的大头, 更多细节见附录 A.2.

<small><span class="docvortex-page-footnote" data-block-type="page_footnote" style="color:#6b7280"><sup>2</sup>The recipe was developed on 7B or smaller and applied to 32B rapidly.</span></small>

<!-- page 8 of 118 -->

## 3 Olmo 3 Base (3. Olmo 3 Base)

The goal of Olmo 3 Base is to establish a strong foundation that supports a diversity of general capabilities while enabling downstream capabilities like thinking, tool-use, and instruction-following to be easily elicited during post-training. In this section, we describe our recipe for Olmo 3 Base, organized as follows:

Olmo 3 Base 的目标是打下一个扎实的基础: 既支撑多样的通用能力, 又让思考, 工具使用, 指令遵循等下游能力在后训练中容易被激发出来. 本节介绍 Olmo 3 Base 的配方, 结构如下:

• Modeling (Section §3.2) Olmo 3 Base closely follows OLMo 2 in that it is a dense model at 7B and 32B sizes, with largely identical hyperparameters. Apart from engineering improvements that enable better training throughput, we focus on enabling a larger context window. We lay out the details in Section §3.2.
• 建模 (第 §3.2 节) Olmo 3 Base 大体沿用 OLMo 2: 7B 与 32B 稠密模型, 超参大体相同. 除提升训练吞吐的工程改进外, 我们聚焦更大上下文窗口. 细节见第 §3.2 节.

• Evaluation (Section §3.3) To guard against overfitting Olmo 3 Base to any one capability, we greatly expand on our evaluation suite from OLMo 2 to include more benchmarks. We make small-scale experiments more reliable by systematically refining benchmark selection and usage throughout development.
• 评测 (第 §3.3 节) 为避免 Olmo 3 Base 过拟合到单一能力, 我们相对 OLMo 2 大幅扩展评测套件. 通过系统 refinement 基准选择与用法, 让小规模实验更可靠.

• Data We introduce Dolma 3, a collection of data to support multiple stages of base model development: ◦ Pretraining (Section §3.4) We train on Dolma 3 Mix, a mix of 5.9T tokens of diverse, natural data including sources like web pages, academic PDFs, code repositories, and more.
• 数据 我们引入 Dolma 3, 支撑 Base 开发多阶段: ◦ 预训练 (第 §3.4 节) 在 Dolma 3 Mix 上训练, 约 5.9T 多样自然数据 token, 含网页, 学术 PDF, 代码仓等.

◦ Midtraining (Section §3.5) We train on Dolma 3 Dolmino Mix, a mix of 100B tokens combining our highest-quality pretraining data with substantial task data for math and code problems, general knowledge QA, instruction following, and more.
◦ Midtraining (第 §3.5 节) 在 Dolma 3 Dolmino Mix 上训练, 约 100B token, 混合最高质量预训练数据与大量数学 / 代码题, 通用知识 QA, 指令遵循等任务数据.

◦ Long-context extension (Section §3.6) We train on Dolma 3 Longmino Mix, a mix of 50B (Olmo 3 Base 7B) or 100B (Olmo 3 Base 32B) tokens combining long documents with our midtraining data.
◦ 长上下文扩展 (第 §3.6 节) 在 Dolma 3 Longmino Mix 上训练, 这是一个 50B (Olmo 3 Base 7B) 或 100B (Olmo 3 Base 32B) token 的混合, 把长文档与我们的 midtraining 数据结合在一起.

### 3.1 Main Results for Olmo 3 Base (3.1 Olmo 3 Base 主结果)

Tables 2 and 3 compare Olmo 3 Base 32B and 7B with leading fully-open and open-weights base models, demonstrating both the effectiveness of our evaluation design and the strong performance of Olmo 3 Base across a broad set of capabilities.

表 2 与表 3 把 Olmo 3 Base 32B 和 7B 与领先的 fully-open 及 open-weight base 模型做了比较, 既说明了我们评测设计的有效性, 也展示了 Olmo 3 Base 在广泛能力上的强劲表现.

Olmo 3 Base is the best fully-open model at 32B parameters, outperforming Stanford Marin 32B and Apertus 70B. On Math and Code evaluation composites, it achieves double-digit improvements over the other fully-open 32B models and is within a few points of strong open-weight baselines. On MCQA benchmarks, its STEM and Non-STEM scores closely track Marin 32B and OLMo 2 32B and sit a few points behind the top open-weight models, while on GenQA Olmo 3 Base forms the top fully-open cluster with Marin 32B and OLMo 2 32B and is only narrowly behind Llama 3.1 70B among the open-weight baselines. At the 7B scale, Olmo 3 Base achieves the strongest Math and Code performance among fully-open models, with sizable margins over Marin 8B, Apertus 8B, and OLMo 2 7B. Compared to open-weight models, it trails only the strongest models such as Qwen and Nemotron Nano on Math and Code. In MCQA, Olmo 3 Base 7B is on par with the strongest fully-open models in both STEM and Non-STEM areas. Finally, on GenQA tasks, Olmo 3 Base outperforms all but Marin among listed fully-open models, and outperforms all but the larger Gemma 2 9B and Llama3.1 8B among listed open-weight models.

Olmo 3 Base 是 32B 参数量级上最好的 fully-open 模型, 超过 Stanford Marin 32B 和 Apertus 70B. 在 Math 与 Code 评测综合分上, 它比其他 fully-open 32B 模型高出两位数, 与强大的 open-weight 基线只差几分. 在 MCQA 基准上, 它的 STEM 与 Non-STEM 分数与 Marin 32B, OLMo 2 32B 相当接近, 比最好的 open-weight 模型低几分; 在 GenQA 上, Olmo 3 Base 与 Marin 32B, OLMo 2 32B 一起构成 fully-open 模型的第一梯队, 在 open-weight 基线中只以微弱差距落后于 Llama 3.1 70B. 在 7B 规模上, Olmo 3 Base 在 fully-open 模型中取得最强的 Math 与 Code 表现, 相对 Marin 8B, Apertus 8B 和 OLMo 2 7B 有明显优势. 与 open-weight 模型相比, 它在 Math 与 Code 上只落后于 Qwen, Nemotron Nano 这类最强模型. 在 MCQA 上, Olmo 3 Base 7B 在 STEM 与 Non-STEM 两个方向上都与最强的 fully-open 模型持平. 最后, 在 GenQA 任务上, Olmo 3 Base 胜过所列 fully-open 模型中除 Marin 以外的全部模型, 也胜过所列 open-weight 模型中除更大的 Gemma 2 9B 和 Llama3.1 8B 以外的全部模型.

### 3.2 Modeling and Architecture (3.2 建模与架构)

Olmo 3 modeling and training largely follows that of OLMo 2. We focus this section on the key differences and refer to the appendix for further details.

Olmo 3 的建模与训练大体沿用 OLMo 2. 本节集中讲关键差异, 更多细节见附录.

**Architecture** We adopt a decoder-only transformer architecture based on Vaswani et al. (2017). Details of the architecture are presented in Table 33 in Appendix A.2. Compared to OLMo 2:

**架构** 我们采用基于 Vaswani et al. (2017) 的 decoder-only Transformer 架构. 架构细节见附录 A.2 的表 33. 与 OLMo 2 相比:

• We train with a context window of 8192 tokens (increased from 4096 tokens for OLMo 2) during pretraining and midtraining stages.
• 预训练与 midtraining 阶段使用 8192 token 的上下文窗口 (OLMo 2 为 4096 token).

<!-- page 9 of 118 -->

|  | Ol3m2oB3 | M3a2rBin | FullAp7e0rBtus | y-open Mode Ga2p4eBron | ls<sub>K</sub>L<sub>2</sub>LM<sub>V2</sub>3<sub>7</sub>6<sub>0</sub>0<sub>B</sub><sup>3</sup> | OL3M2Bo 2 | 2Q.5w3e2nB | G3em27mBa | Open-weigM3.i1s2tr4aBl | ht Models S3e6eBd | G2em27mBa | 3L.l1a7m0aB |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| OlmoBaseEval Math | 61.9 | 49.3 | 39.7 | 20.7 | 72.9 | 53.9 | 64.7 | 63.2 | 59.5 | 15.3 | 57.5 | 62.0 |
| GSM8k | 80.6 | 69.1 | 63.0 | 33.3 | 90.9 | 77.6 | 81.1 | 81.3 | 79.3 | 26.9 | 76.3 | 81.2 |
| GSM Symbolic | 61.2 | 42.0 | 38.6 | 14.5 | 77.7 | 53.1 | 56.2 | 61.2 | 59.1 | 10.3 | 57.3 | 64.6 |
| MATH | 43.8 | 36.8 | 17.4 | 14.2 | 50.2 | 31.0 | 56.7 | 47.0 | 40.1 | 8.7 | 38.8 | 40.2 |
| OlmoBaseEval Code | 39.7 | 30.8 | 23.3 | 19.4 | 38.4 | 20.5 | 48.3 | 41.6 | 42.4 | 54.9 | 41.0 | 36.3 |
| BigCodeBench | 43.7 | 34.5 | 24.0 | 17.0 | 42.9 | 22.2 | 48.1 | 44.0 | 46.4 | 50.7 | 43.4 | 43.4 |
| HumanEval | 65.8 | 52.3 | 32.5 | 31.2 | 61.1 | 29.4 | 65.6 | 62.1 | 65.5 | 71.3 | 57.5 | 57.4 |
| DeepSeek LeetCode | 2.0 | 1.3 | 1.2 | 0.0 | 3.1 | 0.8 | 8.0 | 5.8 | 0.1 | 13.0 | 4.7 | 0.2 |
| DS 1000 | 29.4 | 26.3 | 17.8 | 11.0 | 28.0 | 20.4 | 43.3 | 34.3 | 36.3 | 44.0 | 29.7 | 29.5 |
| MBPP | 59.6 | 52.1 | 37.6 | 36.7 | 55.7 | 37.1 | 69.8 | 60.0 | 61.9 | 72.0 | 61.7 | 55.5 |
| MultiPL HumanEval | 36.0 | 18.5 | 18.4 | 13.0 | 36.3 | 10.5 | 49.7 | 37.7 | 39.0 | 69.2 | 40.3 | 32.2 |
| MultiPL MBPPP | 41.5 | 30.5 | 31.3 | 26.5 | 41.5 | 23.2 | 53.6 | 47.2 | 47.7 | 63.8 | 49.7 | 35.9 |
| OlmoBaseEval MC<sub>STEM</sub> | 74.5 | 75.9 | 70.0 | 56.2 | 75.7 | 75.3 | 82.2 | 80.2 | 81.5 | 83.4 | 75.6 | 80.1 |
| ARC MC | 94.7 | 93.4 | 90.7 | 72.7 | 93.5 | 94.4 | 97.0 | 95.8 | 96.2 | 97.3 | 94.1 | 95.2 |
| MMLU STEM | 70.8 | 68.4 | 57.8 | 45.3 | 66.5 | 64.7 | 79.7 | 74.9 | 76.1 | 82.8 | 65.8 | 70.0 |
| MedMCQA MC | 57.6 | 61.8 | 55.9 | 42.6 | 62.5 | 60.2 | 68.8 | 64.7 | 68.8 | 69.6 | 61.8 | 67.8 |
| MedQA MC | 53.8 | 60.8 | 52.4 | 35.4 | 61.1 | 62.2 | 68.4 | 68.7 | 70.4 | 70.1 | 61.0 | 72.3 |
| SciQ MC | 95.5 | 95.1 | 93.3 | 84.9 | 94.8 | 95.1 | 97.1 | 96.8 | 96.3 | 97.1 | 95.1 | 95.4 |
| OlmoBaseEval MC<sub>Non-STEM</sub> | 85.6 | 84.5 | 78.5 | 64.1 | 84.0 | 84.2 | 89.3 | 86.7 | 87.9 | 89.0 | 83.2 | 86.1 |
| MMLU Humanities | 78.3 | 78.9 | 74.1 | 56.7 | 78.4 | 79.7 | 85.0 | 80.5 | 82.7 | 85.7 | 79.3 | 83.4 |
| MMLU Social Sci. | 84.0 | 83.7 | 79.2 | 58.9 | 84.1 | 84.5 | 88.4 | 86.2 | 88.6 | 90.1 | 85.8 | 87.4 |
| MMLU Other | 75.1 | 75.4 | 70.1 | 55.4 | 77.1 | 75.6 | 81.2 | 80.2 | 81.9 | 82.4 | 76.9 | 79.4 |
| CSQA MC | 82.3 | 80.1 | 76.9 | 60.6 | 80.2 | 81.2 | 89.9 | 79.0 | 80.5 | 81.1 | 78.1 | 79.0 |
| PiQA MC | 85.6 | 90.5 | 79.0 | 72.0 | 87.5 | 87.7 | 93.3 | 90.3 | 91.0 | 92.5 | 89.0 | 91.5 |
| SocialIQA MC | 83.9 | 82.4 | 79.3 | 71.3 | 83.0 | 82.3 | 86.6 | 81.2 | 81.0 | 84.9 | 81.0 | 83.5 |
| CoQA Gen2MC MC | 96.4 | 93.9 | 87.5 | 67.3 | 92.2 | 94.4 | 96.8 | 95.8 | 94.9 | 96.9 | 94.3 | 95.1 |
| DROP Gen2MC MC | 87.2 | 71.0 | 56.5 | 48.0 | 67.6 | 68.6 | 86.6 | 84.6 | 86.5 | 90.1 | 66.6 | 70.3 |
| Jeopardy Gen2MC MC | 92.3 | 95.3 | 93.2 | 77.0 | 95.6 | 96.6 | 97.0 | 95.9 | 97.2 | 96.2 | 92.0 | 97.1 |
| NaturalQs Gen2MC MC | 78.0 | 81.0 | 71.9 | 47.5 | 80.5 | 78.6 | 79.9 | 82.0 | 84.6 | 81.4 | 74.5 | 82.4 |
| SQuAD Gen2MC MC | 98.2 | 97.6 | 95.7 | 90.0 | 97.4 | 97.4 | 97.9 | 97.7 | 97.9 | 98.1 | 97.5 | 97.7 |
| OlmoBaseEval GenQA | 79.8 | 80.3 | 75.0 | 65.3 | 75.6 | 79.1 | 68.5 | 73.5 | 78.0 | 76.0 | 72.9 | 81.6 |
| HellaSwag RC | 84.8 | 87.2 | 84.5 | 75.2 | 86.3 | 87.5 | 86.3 | 86.0 | 86.2 | 84.8 | 86.7 | 88.4 |
| Winogrande RC | 90.3 | 90.5 | 87.7 | 80.3 | 89.5 | 89.4 | 87.5 | 91.3 | 90.8 | 89.3 | 90.8 | 91.7 |
| Lambada | 75.7 | 76.7 | 74.8 | 58.3 | 75.3 | 77.0 | 76.2 | 77.5 | 79.3 | 76.1 | 76.9 | 79.6 |
| Basic Skills | 93.5 | 91.1 | 87.5 | 83.2 | 91.5 | 88.7 | 94.2 | 94.9 | 91.9 | 96.0 | 93.2 | 92.4 |
| DROP | 80.9 | 76.5 | 56.3 | 59.4 | 75.0 | 76.3 | 53.7 | 75.9 | 74.9 | 76.1 | 73.2 | 78.3 |
| Jeopardy | 75.3 | 80.5 | 77.2 | 58.9 | 77.6 | 79.1 | 74.0 | 82.1 | 80.3 | 77.4 | 80.7 | 84.0 |
| NaturalQs | 49.0 | 55.1 | 43.1 | 33.5 | 45.7 | 51.4 | 39.3 | 49.2 | 45.1 | 30.7 | 47.1 | 53.1 |
| SQuAD | 94.5 | 94.4 | 90.7 | 89.3 | 93.9 | 94.0 | 64.9 | 92.4 | 92.6 | 89.1 | 93.0 | 92.9 |
| CoQA | 74.1 | 70.7 | 72.8 | 49.8 | 45.6 | 68.7 | 40.4 | 12.4 | 61.1 | 64.4 | 14.9 | 73.9 |
| OlmoBaseEval HeldOut |  |  |  |  |  |  |  |  |  |  |  |  |
| LBPP | 21.8 | 17.3 | 8.1 | 4.3 | 19.9 | 8.2 | 40.3 | 17.7 | 30.3 | 42.6 | 19.7 | 11.8 |
| BBH | 77.6 | 70.1 | 58.8 | 36.6 | 82.6 | 64.6 | 81.1 | 77.4 | 81.4 | 85.0 | 74.8 | 80.8 |
| MMLU Pro MC | 49.7 | 48.1 | 39.6 | 21.3 | 50.1 | 46.9 | 61.1 | 53.1 | 58.9 | 62.2 | 47.6 | 50.4 |
| Deepmind Math | 29.6 | 26.7 | 20.1 | 28.3 | 29.8 | 22.0 | 40.7 | 30.4 | 35.3 | 31.3 | 27.6 | 40.3 |

Table 2 Results comparing Olmo 3 Base 32B to other base models using the OlmoBaseEval Main suite (details in Section §3.3). Olmo 3 was not evaluated on held-out benchmarks prior to release.

表 2｜在 OlmoBaseEval Main 套件上比较 Olmo 3 Base 32B 与其他 base 模型的结果 (细节见第 §3.3 节). 发布前 Olmo 3 未在 held-out 基准上评测.

• To support scalable pretraining at longer sequence lengths, and to keep inference costs manageable, we introduce a sliding window attention (SWA) pattern (Beltagy et al., 2020) in which each token can attend to previous tokens in a window of size 4096. We add SWA at three out of every four layers, and ensure that the last layer always uses full attention.
• 为了在更长序列上支持可扩展的预训练, 同时把推理成本控制在可接受范围, 我们引入滑动窗口注意力 (SWA) 模式 (Beltagy et al., 2020): 每个 token 只能关注大小为 4096 的窗口内的前序 token. 每四层中有三层使用 SWA, 并保证最后一层始终使用全注意力.

**Training** Olmo 3 Base is trained using the OLMo-core codebase. With this stack, we train the 7B model at 7700 tokens per second per GPU and the 32B model at 1960 tokens per second per GPU at a sequence length of 8192, using bfloat16 precision throughout. This corresponds to roughly 43% and 41% MFU, respectively. We achieve this performance by combining PyTorch’s built-in torch.compile(), custom kernels for operations such as attention (Dao, 2024) and the language modeling head (Hsu et al., 2025), asynchronous and batched gathering of metrics, and asynchronous checkpoint writing, among other optimizations.

**训练** Olmo 3 Base 使用 OLMo-core 代码库训练. 借助这套技术栈, 在序列长度 8192, 全程 bfloat16 精度下, 7B 模型的训练速度为每 GPU 每秒 7700 token, 32B 模型为每 GPU 每秒 1960 token, 分别约合 43% 和 41% 的 MFU. 这一性能来自多项优化的组合, 包括 PyTorch 内置的 torch.compile(), 针对注意力 (Dao, 2024) 与语言建模头 (Hsu et al., 2025) 等操作的定制 kernel, 异步批量的指标汇总, 以及异步 checkpoint 写入等.

OLMo-core supports pretraining, midtraining, long-context extension, and SFT, along with auxiliary tools for checkpoint conversion to and from Hugging Face Transformers format and for merging model checkpoints. Support for DPO and RL is planned but not yet complete.

OLMo-core 支持预训练, midtraining, 长上下文扩展和 SFT, 并附带辅助工具, 用于 checkpoint 与 Hugging Face Transformers 格式之间的互相转换以及模型 checkpoint 合并. DPO 与 RL 的支持已在计划中, 但尚未完成.

> OLMo-core 覆盖预训练, midtraining, 长上下文扩展与 SFT, 但 DPO 与 RL 「planned but not yet complete」; RL 基础设施写在 §4.4.3 的 Open Instruct. 反过来, §4.2.2 的 SFT 从 Open Instruct 换到 OLMo-core, 训练吞吐提升 8×.

Hyperparameters for training Olmo 3 Base 7B and 32B are presented in Table 35 in Appendix A.2. As in OLMo 2, we train in stages defined by the data curriculum and learning rate schedule (see Appendix Table 35 for details). Infrastructure and distributed training configurations for each stage are summarized in Appendix Table 34.

训练 Olmo 3 Base 7B 与 32B 的超参数见附录 A.2 的表 35. 与 OLMo 2 一样, 我们按数据课程与学习率调度划分的阶段来训练 (细节见附录表 35). 各阶段的基础设施与分布式训练配置汇总在附录表 34.

<small><span class="docvortex-page-footnote" data-block-type="page_footnote" style="color:#6b7280">3For the K2 V2 results here, we use an updated pretraining checkpoint uploaded on Jan 22, 2026, released after Olmo 3.</span></small>

<small><span class="docvortex-page-footnote" data-block-type="page_footnote" style="color:#6b7280">4Further details and code: [github.com/allenai/OLMo-core](https://github.com/allenai/OLMo-core)</span></small>

<!-- page 10 of 118 -->

|  | Olm7Bo 3 | M8aBrin | Fully-opeApe8rBtus | n Models erGoanp8-B | OL7MBo 2 | Qw8eBn3 | NNaenmo9oB. | Open-Ge2m9mB a | weight Mo 2Q.w5e7nB | delsL3l.a1m8Ba | G3r.a3n8itBe | MiMo 7B |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| OlmoBaseEval Math | 54.7 | 39.6 | 29.2 | 16.9 | 41.7 | 67.2 | 49.8 | 48.8 | 60.7 | 36.9 | 41.5 | 54.3 |
| GSM8k | 75.5 | 60.9 | 48.2 | 30.0 | 67.1 | 84.5 | 82.3 | 68.5 | 79.9 | 56.4 | 61.0 | 74.3 |
| GSM Symbolic | 48.6 | 33.6 | 26.3 | 12.5 | 38.8 | 65.4 | 62.7 | 45.1 | 56.2 | 35.1 | 35.5 | 53.3 |
| MATH | 40.0 | 24.3 | 13.1 | 8.2 | 19.1 | 51.6 | 4.5 | 32.9 | 45.9 | 19.2 | 27.9 | 35.2 |
| OlmoBaseEval Code | 30.7 | 21.4 | 19.0 | 16.1 | 10.4 | 46.1 | 43.1 | 30.2 | 41.0 | 21.2 | 18.0 | 35.7 |
| BigCodeBench | 34.1 | 21.5 | 20.9 | 13.0 | 8.8 | 42.5 | 43.2 | 30.9 | 39.7 | 30.7 | 0.4 | 38.3 |
| HumanEval | 49.1 | 31.6 | 21.6 | 24.5 | 16.3 | 71.7 | 71.7 | 40.0 | 66.1 | 40.4 | 0.0 | 57.0 |
| DeepSeek LeetCode | 1.4 | 0.5 | 0.6 | 0.0 | 0.2 | 8.3 | 6.8 | 1.9 | 5.1 | 0.1 | 0.0 | 1.2 |
| DS 1000 | 20.2 | 16.5 | 11.8 | 9.1 | 10.1 | 33.1 | 30.3 | 23.4 | 35.2 | 22.2 | 22.6 | 28.1 |
| MBPP | 43.6 | 36.5 | 33.5 | 29.3 | 21.2 | 66.2 | 62.3 | 49.1 | 55.4 | 12.1 | 48.5 | 48.3 |
| MultiPL HumanEval | 28.7 | 15.6 | 15.5 | 12.1 | 4.2 | 52.3 | 40.0 | 27.9 | 40.3 | 14.5 | 22.3 | 34.5 |
| MultiPL MBPPP | 38.2 | 27.6 | 29.2 | 24.6 | 12.2 | 48.4 | 47.5 | 38.2 | 45.4 | 28.3 | 32.3 | 42.5 |
| OlmoBaseEval MC<sub>STEM</sub> | 66.4 | 68.1 | 66.3 | 58.0 | 64.6 | 78.8 | 73.5 | 72.8 | 74.7 | 69.0 | 65.0 | 71.6 |
| ARC MC | 89.2 | 89.2 | 87.9 | 77.2 | 85.7 | 95.4 | 94.1 | 92.7 | 93.4 | 86.4 | 86.2 | 91.7 |
| MMLU STEM | 59.7 | 58.1 | 52.4 | 43.1 | 53.2 | 76.7 | 71.1 | 62.8 | 67.6 | 55.7 | 55.6 | 63.5 |
| MedMCQA MC | 48.3 | 52.7 | 51.7 | 44.5 | 49.2 | 63.5 | 54.5 | 58.9 | 60.3 | 56.5 | 49.6 | 56.2 |
| MedQA MC | 41.8 | 47.3 | 47.6 | 36.8 | 43.8 | 62.1 | 53.5 | 55.4 | 56.6 | 53.7 | 43.0 | 53.0 |
| SciQ MC | 92.8 | 93.2 | 91.9 | 88.4 | 90.9 | 96.1 | 94.3 | 94.4 | 95.4 | 92.7 | 90.8 | 93.5 |
| OlmoBaseEval MC<sub>Non-STEM</sub> | 78.2 | 78.8 | 74.2 | 65.0 | 75.2 | 84.8 | 81.3 | 81.3 | 82.9 | 76.1 | 76.9 | 80.5 |
| MMLU Humanities | 68.9 | 71.4 | 67.8 | 59.5 | 67.9 | 78.6 | 78.0 | 74.5 | 76.2 | 70.1 | 67.6 | 73.6 |
| MMLU Social Sci. | 75.0 | 77.4 | 74.7 | 60.8 | 73.1 | 84.8 | 82.2 | 82.9 | 83.0 | 75.5 | 71.8 | 80.8 |
| MMLU Other | 66.9 | 68.3 | 66.1 | 57.2 | 65.2 | 76.8 | 73.8 | 74.2 | 74.4 | 69.1 | 64.5 | 72.7 |
| CSQA MC | 75.3 | 75.3 | 72.1 | 65.5 | 72.0 | 84.1 | 74.4 | 75.3 | 85.0 | 72.9 | 82.3 | 76.1 |
| PiQA MC | 80.2 | 85.7 | 80.5 | 71.6 | 80.1 | 89.9 | 86.0 | 85.7 | 88.5 | 78.3 | 81.5 | 87.2 |
| SocialIQA MC | 80.3 | 79.8 | 76.3 | 73.4 | 77.5 | 83.3 | 78.7 | 80.3 | 82.9 | 77.0 | 83.1 | 80.7 |
| CoQA Gen2MC MC | 92.5 | 86.2 | 82.8 | 59.7 | 85.0 | 93.7 | 92.2 | 92.7 | 93.5 | 89.9 | 87.6 | 91.4 |
| DROP Gen2MC MC | 67.3 | 63.7 | 47.5 | 44.8 | 55.6 | 78.3 | 70.0 | 65.8 | 69.1 | 53.3 | 55.0 | 64.1 |
| Jeopardy Gen2MC MC | 86.9 | 90.8 | 90.3 | 83.2 | 89.5 | 92.3 | 90.7 | 92.8 | 92.1 | 88.9 | 88.4 | 89.5 |
| NaturalQs Gen2MC MC | 69.4 | 71.5 | 66.7 | 51.3 | 66.3 | 74.1 | 71.1 | 72.5 | 70.5 | 68.0 | 69.2 | 72.2 |
| SQuAD Gen2MC MC | 96.9 | 96.5 | 91.3 | 87.7 | 95.3 | 97.5 | 97.4 | 97.3 | 96.4 | 94.4 | 94.5 | 96.7 |
| OlmoBaseEval GenQA | 72.5 | 75.9 | 69.0 | 63.3 | 72.4 | 71.1 | 71.8 | 75.6 | 67.5 | 73.1 | 67.8 | 71.4 |
| HellaSwag RC | 77.7 | 84.0 | 81.0 | 73.9 | 82.2 | 80.5 | 80.2 | 81.8 | 81.0 | 81.5 | 83.7 | 80.6 |
| Winogrande RC | 85.7 | 88.6 | 85.8 | 76.4 | 87.4 | 86.4 | 86.2 | 88.8 | 86.0 | 87.3 | 89.4 | 86.5 |
| Lambada | 68.9 | 73.9 | 70.9 | 67.0 | 70.5 | 73.0 | 67.9 | 76.3 | 70.3 | 75.5 | 76.0 | 73.1 |
| Basic Skills | 89.5 | 85.6 | 83.8 | 80.5 | 82.2 | 93.5 | 91.4 | 89.3 | 91.4 | 88.0 | 88.7 | 89.7 |
| DROP | 71.5 | 73.0 | 37.1 | 54.9 | 61.5 | 57.2 | 71.4 | 68.2 | 56.7 | 59.5 | 38.4 | 69.3 |
| Jeopardy | 60.4 | 72.7 | 70.1 | 55.5 | 70.8 | 65.1 | 64.9 | 75.1 | 63.0 | 70.9 | 69.7 | 65.6 |
| NaturalQs | 32.6 | 42.6 | 35.0 | 28.8 | 37.4 | 33.8 | 31.2 | 40.4 | 31.2 | 36.7 | 37.0 | 33.1 |
| SQuAD | 93.5 | 93.4 | 89.6 | 86.0 | 91.5 | 89.2 | 92.3 | 88.8 | 87.0 | 89.2 | 89.6 | 90.3 |
| CoQA | 72.8 | 69.5 | 67.4 | 46.7 | 68.3 | 61.6 | 60.4 | 71.5 | 40.5 | 69.0 | 37.8 | 54.4 |
| OlmoBaseEval HeldOut |  |  |  |  |  |  |  |  |  |  |  |  |
| LBPP | 17.1 | 5.8 | 7.1 | 4.7 | 3.1 | 25.7 | 31.7 | 12.4 | 22.1 | 9.1 | 18.5 | 21.5 |
| BBH | 63.5 | 55.6 | 48.1 | 38.4 | 49.6 | 76.5 | 77.0 | 68.8 | 54.7 | 63.0 | 61.5 | 75.1 |
| MMLU Pro MC | 37.3 | 38.8 | 33.9 | 20.8 | 33.1 | 50.3 | 50.2 | 44.7 | 48.1 | 37.4 | 33.9 | 44.3 |
| Deepmind Math | 23.7 | 20.2 | 17.1 | 34.1 | 16.2 | 47.7 | 31.4 | 23.0 | 32.8 | 24.1 | 32.2 | 25.4 |

Table 3 Results comparing Olmo 3 Base 7B to other base models using the OlmoBaseEval Main suite (details in §3.3). Olmo 3 was not evaluated on held-out benchmarks prior to release.

表 3｜在 OlmoBaseEval Main 套件上比较 Olmo 3 Base 7B 与其他 base 模型的结果 (细节见 §3.3). 发布前 Olmo 3 未在 held-out 基准上评测.

**Tokenizer** We process data for each stage using the same tokenizer as OLMo 2, which is derived from OpenAI’s cl100k (OpenAI, 2023a, b).

**分词器** 各阶段的数据都用与 OLMo 2 相同的分词器处理, 该分词器派生自 OpenAI 的 cl100k (OpenAI, 2023a, b).

### 3.3 Experimental Design and Evaluation (3.3 实验设计与评测)

Model development requires many iterative data and training decisions. However, benchmarks are not perfect decision-making tools: different evaluations are only sensitive for making development decisions across specific ranges of scale and capability (Magnusson et al., 2025). Models trained at small compute scales are known to exhibit random-chance performance on math, code, and multiple-choice question answering (MCQA) tasks (Wei et al., 2022; Gu et al., 2024b), and benchmark noise can reduce the ability to trust small differences in scores (Heineman et al., 2025). To address these problems, we develop OlmoBaseEval, a collection of benchmark suites to support decision-making during base model development. OlmoBaseEval features the following improvements:

模型开发需要大量迭代的数据与训练决策. 然而基准并不是完美的决策工具: 不同评测只在特定的规模与能力区间内对开发决策敏感 (Magnusson et al., 2025). 众所周知, 小算力规模训练出的模型在数学, 代码和多选问答 (MCQA) 任务上表现接近随机 (Wei et al., 2022; Gu et al., 2024b), 基准噪声也会让人难以信任分数上的细小差异 (Heineman et al., 2025). 为了解决这些问题, 我们开发了 OlmoBaseEval, 这是一组用来支撑 base 模型开发决策的基准套件. OlmoBaseEval 有以下改进:

• We aggregate scores over task clusters that group benchmarks by assessed capability (Section §3.3.1),
• 按所评估的能力把基准分组成任务簇, 在簇上汇总分数 (第 §3.3.1 节),

• We develop proxy metrics for evaluating small-scale models by identifying when capabilities “emerge” during training (Section §3.3.2), and
• 通过识别能力在训练中何时 「涌现」, 为小规模模型开发代理指标 (第 §3.3.2 节), 以及

<!-- page 11 of 118 -->

![Chart block](images/p11-chart.png)

![Chart block](images/p11-figure-3-learning-rate-schedule-and-loss-for-olmo-3.png)

Figure 3 Learning rate schedule and loss for Olmo 3 Base 7B. The first half of the learning rate schedule is a cosine schedule over 5T tokens. We stretch the second half of the schedule to reach a target length of one epoch (5.93T tokens). Warm-up is 2000 steps, the peak learning rate is $\mathrm { 3 \times 1 0 ^ { - 4 } }$ , and the final learning rate is 10% of the peak LR.

图 3｜Olmo 3 Base 7B 的学习率调度与损失. 学习率调度的前半段是覆盖 5T token 的余弦调度. 我们把后半段拉长, 使其达到一个 epoch (5.93T token) 的目标长度. 预热为 2000 步, 峰值学习率为 $\mathrm { 3 \times 1 0 ^ { - 4 } }$ , 最终学习率为峰值的 10%.

![Chart block](images/p11-chart-2.png)

![Chart block](images/p11-figure-4-learning-rate-schedule-and-loss-for-olmo-3.png)

Figure 4 Learning rate schedule and loss for Olmo 3 Base 32B. The learning rate schedule is a cosine schedule over one epoch (5.93T tokens), truncated at 5.5T tokens. Warm-up is 2000 steps, and the peak learning rate is $6  \times  10 ^{-4}$ The schedule targets a final learning rate of 10% of the peak. Due to the truncation, the real final learning rate is $\mathrm { 6 . 2 1 0 \times 1 0 ^ { - 5 } }$ Unintuitively, the learning rate for the 32B is higher than for the 7B, but this is somewhat compensated for by the larger batch size of the 32B (8M tokens vs. 4M tokens per batch).

图 4｜Olmo 3 Base 32B 的学习率调度与损失. 学习率调度是覆盖一个 epoch (5.93T token) 的余弦调度, 在 5.5T token 处截断. 预热为 2000 步, 峰值学习率为 $6  \times  10 ^{-4}$ 调度的目标最终学习率为峰值的 10%. 由于截断, 实际最终学习率为 $\mathrm { 6 . 2 1 0 \times 1 0 ^ { - 5 } }$ 有点反直觉的是, 32B 的学习率比 7B 更高, 但 32B 更大的 batch size (每个 batch 8M token, 7B 为 4M token) 在一定程度上抵消了这一点.

> 7B 峰值 $3\times10^{-4}$, batch 4M token; 32B 峰值 $6\times10^{-4}$, batch 8M token. 文内说 32B 更高 LR 部分被更大 batch 抵消.

调度目标是峰值 10%, 但 32B 在 5.5T 处截断, 没走完 5.93T 的余弦尾段, 所以实际终学习率停在 $\mathrm{6.210\times10^{-5}}$ (Fig. 4 图注). 7B 则是前半段 5T 余弦, 后半段拉长到 5.93T (Fig. 3).

• We improve the overall signal-to-noise ratio by evaluating more examples from noisy tasks or even removing them entirely (Section §3.3.3).
• 对噪声大的任务评测更多样本, 甚至直接移除这些任务, 以提高整体信噪比 (第 §3.3.3 节).

We start by targeting a high coverage of capabilities; we select benchmarks to prioritize science knowledge, medical/lab knowledge, math, and code tasks. Because our data interventions are targeted to a core capability rather than a specific benchmark (e.g., “Code” rather than “DS-1000”), we group tasks into clusters, where we expect the benchmarks within a cluster to behave similarly to particular data changes. To handle evaluation of models trained using small compute budgets (e.g., up to our largest experiment scale of 1B parameters at 100B tokens), we perform a scaling analysis to determine which benchmarks show signal at a small scale and find proxy metrics which we use to make decisions. Finally, we analyze the signal-to-noise ratio of each benchmark—we select benchmark metrics to improve SNR, remove benchmarks that were too noisy for making decisions, and move benchmarks out of the average if the noise of one particular benchmark dominated the aggregate scores.

我们首先追求高能力覆盖率, 挑选基准时优先考虑科学知识, 医学/实验知识, 数学和代码任务. 由于我们的数据干预针对的是某项核心能力而非某个具体基准 (例如 「Code」 而不是 「DS-1000」), 我们把任务分组成簇, 预期同一簇内的基准对特定数据变化的反应相似. 为了评测小算力预算训练出的模型 (例如最大到我们实验规模上限的 1B 参数, 100B token), 我们做了 Scaling 分析, 确定哪些基准在小规模下就有信号, 并找到用于决策的代理指标. 最后, 我们分析每个基准的信噪比: 选择能提高 SNR 的基准指标, 移除噪声大到无法用于决策的基准, 若某个基准的噪声主导了汇总分数, 就把它移出平均值.

#### 3.3.1 Clustering Tasks (3.3.1 任务聚类)

To handle the large number of tasks, we cluster similar tasks into macro-averages. We aim for task clusters to match the granularity at which we perform data interventions, and for tasks within each cluster to behave similarly. Our clustering procedure requires a process to determine the similarity of two evaluations—we do this by collecting a pool of 23K benchmark scores from 70 external, open-weight models.

为了处理数量庞大的任务, 我们把相似任务聚成簇并做宏平均. 我们希望任务簇的粒度与我们做数据干预的粒度一致, 并且簇内任务表现相似. 聚类流程需要一种判断两个评测相似度的方法: 我们从 70 个外部 open-weight 模型收集了 2.3 万个基准分数, 构成一个分数池.

Using our dataset of evaluation results, we assume that two benchmarks evaluate similar constructs if they rank models similarly. We perform hierarchical clustering using Ward’s variance-minimization (Ward Jr,

利用这份评测结果数据集, 我们假设: 如果两个基准对模型的排序相似, 它们评测的就是相似的构念. 我们使用 Ward 方差最小化方法做层次聚类 (Ward Jr,

<!-- page 12 of 118 -->

![Image block](images/p12-figure-5-task-clustering-for-olmobaseeval-using-a-set.png)

Figure 5 Task clustering for OlmoBaseEval. Using a set of 23K benchmark results, the clustering method iteratively merges tasks which rank models similarly, until arriving at a stop condition. To arrive at OlmoBaseEval, we move tasks in the same format into the same cluster and split MC into STEM and Non-STEM tasks.

图 5｜OlmoBaseEval 的任务聚类. 基于 2.3 万条基准结果, 聚类方法反复合并对模型排序相似的任务, 直到满足停止条件. 为得到 OlmoBaseEval, 我们把格式相同的任务移入同一个簇, 并把 MC 拆分为 STEM 与 Non-STEM 任务.

![Chart block](images/p12-chart.png)

![Chart block](images/p12-chart-2.png)

![Chart block](images/p12-figure-6-scaling-analysis-on-the-olmobaseeval-math.png)

Figure 6 Scaling analysis on the OlmoBaseEval Math suite. We use the OLMo 2 scaling models (Bhagia et al., 2024) to find benchmarks and metrics that show signal for small-scale models (left and center). Then, we use the small-scale OlmoBaseEval Easy suite as a proxy-metric for making data decisions.

图 6｜在 OlmoBaseEval Math 套件上的 Scaling 分析. 我们用 OLMo 2 的 scaling 模型 (Bhagia et al., 2024) 找出对小规模模型有信号的基准与指标 (左图和中图). 然后用小规模的 OlmoBaseEval Easy 套件作为数据决策的代理指标.

1963), which iteratively merges evaluation scores to minimize the variance of scores between benchmarks within a cluster. Figure 5 shows the result of the clustering procedure, where we manually select a threshold to balance the amount and granularity of clusters. Importantly, we do not use the exact result of the clustering procedure—we manually move a few tasks to ensure the format of the task is the same within each cluster (e.g., tasks requiring code execution all occur in the same cluster). The resulting task clusters are: MC<sub>STEM</sub>, MC<sub>Non-STEM</sub>, GenQA, Math, Code, and Code FIM.

1963), 该方法反复合并评测分数, 使簇内各基准间分数的方差最小. 图 5 展示了聚类结果. 我们手动选择阈值来平衡簇的数量与粒度, 并移动少数任务, 让同一簇内的任务格式一致, 例如把需要执行代码的任务归到同一簇. 最终得到 MC<sub>STEM</sub>, MC<sub>Non-STEM</sub>, GenQA, Math, Code 和 Code FIM 六个任务簇.

#### 3.3.2 Scaling analysis (3.3.2 Scaling 分析)

We evaluate open-weight models across compute scales from ${ 1 0 } ^ { 1 8 }$ to ${ 1 0 } ^ { 2 5 }$ training FLOPs to determine the compute scale at which particular metrics and tasks are useful for development decisions. On some evaluation benchmarks, it is too difficult to see signal when training models at small scales (Wei et al., 2022), and other benchmarks ‘saturate’ near the labeling error of the benchmark (Vendrow et al., 2025). However, while many tasks appear emergent, continuous proxy metrics have been shown to be a better decision-making tool for model performance before we exit the noise floor (Schaeffer et al., 2023; Huang et al., 2024b; Magnusson et al., 2025). We propose a Base Easy task suite which measures bits-per-byte (BPB) over tasks from the Base Main suite that have gold labels or human-written answers, calculated as the negative log-likelihood of the answer divided by the number of UTF-8 bytes in the answer string, as described in Gao et al. (2020).

我们评测训练 FLOPs 从 ${ 1 0 } ^ { 1 8 }$ 到 ${ 1 0 } ^ { 2 5 }$ 的各算力规模下的 open-weight 模型, 以确定特定指标和任务在什么算力规模下对开发决策有用. 在一些评测基准上, 小规模训练的模型很难看出信号 (Wei et al., 2022); 另一些基准则在接近其标注错误率的地方 '饱和' (Vendrow et al., 2025). 不过, 尽管许多任务看起来有涌现现象, 已有研究表明, 在模型表现越过噪声底线之前, 连续的代理指标是更好的决策工具 (Schaeffer et al., 2023; Huang et al., 2024b; Magnusson et al., 2025). 我们提出 Base Easy 任务套件, 在 Base Main 套件中带有标准标签或人工撰写答案的任务上度量每字节比特数 (BPB), 其计算方式为答案的负对数似然除以答案字符串的 UTF-8 字节数, 如 Gao et al. (2020) 所述.

We evaluate on the suite of 25 OLMo 2 scaling law models from Bhagia et al. (2024) to understand the scaling behavior in the low-compute regime, and 70 open-weight models to understand scaling behavior in the high-compute regime. Figure 6 shows the scaling behavior for our resulting Base Main benchmarks. For each task family, the Base Easy task suite shows signal at the small data ablation scale, and the Base Main task suites were not saturated at the large scale, leaving headroom for data experiments in midtraining.

我们在 Bhagia et al. (2024) 的 25 个 OLMo 2 Scaling Laws 模型上评测, 以了解低算力区间的 Scaling 行为; 在 70 个 open-weight 模型上评测, 以了解高算力区间的 Scaling 行为. 图 6 展示了最终 Base Main 基准的 Scaling 行为. 对每个任务族, Base Easy 任务套件在小规模数据消融尺度上就有信号, 而 Base Main 任务套件在大规模下尚未饱和, 为 midtraining 中的数据实验留出了余量.

<!-- page 13 of 118 -->

![Chart block](images/p13-figure-7-olmobaseeval-signal-to-noise-analysis-on-the.png)

Figure 7 OlmoBaseEval signal-to-noise analysis on the code multi-task average using intermediate checkpoints from midtraining. First, we aggregate into multi-task averages and remove tasks with high noise, such as CruxEval (left → center). Then, we tune generation hyperparameters to improve SNR, e.g., by increasing the n in pass@k (center $\rightarrow \mathrm { r i g h t ) }$

图 7｜用 midtraining 中间 checkpoint 对代码多任务平均做的 OlmoBaseEval 信噪比分析. 首先汇总为多任务平均, 并移除 CruxEval 等高噪声任务 (左 → 中). 然后调整生成超参数来提高 SNR, 例如增大 pass@k 中的 n (中 $\rightarrow \mathrm { r i g h t ) }$

#### 3.3.3 Signal-to-Noise Analysis (3.3.3 信噪比分析)

When reporting a macro-average, we aim to exclude tasks from each cluster that were too noisy to be helpful for development. We calculate the signal-to-noise ratio of each benchmark following the method from Heineman et al. (2025), where we evaluate the final 50 checkpoints of OLMo 2 13B training, and 10 external base models trained at roughly the same compute scale $\bar { ( 4 \cdot 1 0 } ^ { 2 3 } \mathrm { F L O P s ) }$ . From our findings, we transition from using 1K instance subsets to full evaluation sets when available. We remove some benchmarks from our evaluation suite entirely, particularly binary benchmarks such as BoolQ (Clark et al., 2019), as we found that models usually oscillate between predicting the majority and minority class.

报告宏平均时, 我们希望把每个簇里噪声大到没有帮助的任务排除掉. 我们按 Heineman et al. (2025) 的方法计算每个基准的信噪比: 评测 OLMo 2 13B 训练的最后 50 个 checkpoint, 以及 10 个在大致相同算力规模 $\bar { ( 4 \cdot 1 0 } ^ { 2 3 } \mathrm { F L O P s ) }$ 下训练的外部 base 模型. 根据结果, 我们在有完整评测集时, 从使用 1K 样本子集改为使用完整评测集. 我们把一些基准从评测套件中彻底移除, 尤其是 BoolQ (Clark et al., 2019) 这类二分类基准, 因为我们发现模型通常在预测多数类与少数类之间来回摆动.

We repeat the same analysis for midtraining, instead using intermediate checkpoints from 5 preliminary pretraining runs. One important finding was to separate some benchmarks from the macro-average, like CruxEval (Gu et al., 2024a), which measures a relevant and unique capability (code input/output prediction) but would introduce too much noise into the macro-average. We show an example of the SNR of three individual benchmarks compared to the base main task averages across intermediate checkpoints during midtraining in Figure 7.

对 midtraining 我们重复了同样的分析, 改用 5 次初步预训练运行的中间 checkpoint. 一个重要发现是需要把某些基准从宏平均中分离出来, 例如 CruxEval (Gu et al., 2024a): 它衡量一项相关且独特的能力 (代码输入/输出预测), 但会给宏平均引入过多噪声. 图 7 给出了一个例子: 在 midtraining 的中间 checkpoint 上, 三个单独基准的 SNR 与 base main 任务平均的对比.

#### 3.3.4 OlmoBaseEval (3.3.4 OlmoBaseEval)

The resulting OlmoBaseEval consists of a Base Easy suite for making development decisions using small compute budgets (e.g., less than 1B parameters) and a Base Main suite for development decisions for the final pretraining run and midtraining. We provide detail on the Chat suite later in §4.1. OlmoBaseEval contains 43 tasks, which is over 4 times more benchmarks than OLMo 2—including tracking math and code benchmarks in pretraining. To prevent overfitting on the development suite, we include a Held-out set of 4 benchmarks—MMLU Pro, DeepMind Math, LBPP, and BBH—each benchmark matching one broad capability we target during pretraining.

最终的 OlmoBaseEval 包括一个 Base Easy 套件, 用于在小算力预算 (例如小于 1B 参数) 下做开发决策, 以及一个 Base Main 套件, 用于最终预训练运行和 midtraining 的开发决策. Chat 套件的细节稍后在 §4.1 介绍. OlmoBaseEval 共有 43 个任务, 基准数量是 OLMo 2 的 4 倍以上, 其中包括在预训练中跟踪数学和代码基准. 为防止对开发套件过拟合, 我们设置了一个包含 4 个基准的 Held-out 集: MMLU Pro, DeepMind Math, LBPP 和 BBH, 每个基准对应我们在预训练中关注的一项大类能力.

The suite includes four new benchmarks: BasicSkills, a set of 6 tasks to isolate the development of skills during pretraining (e.g., basic arithmetic, reasoning, and coding); Gen2MC, a multiple-choice version of 5 short-form generative tasks; MT MBPP, a translated BPB set for MBPP in 17 code languages; and Masked Perplexity, a new evaluation method applying token masking and calculating perplexity only on tokens that are difficult to learn. We evaluate with masked perplexity using UltraChat and WildChat, which provides a wide coverage of real user interaction evaluation in pretraining. Additional design and implementation details for OlmoBaseEval are included in Appendix A.4.

该套件包含四个新基准: BasicSkills, 一组 6 个任务, 用来单独观察预训练期间技能的发展 (例如基础算术, 推理和编码); Gen2MC, 5 个短形式生成任务的多选版本; MT MBPP, 把 MBPP 翻译成 17 种编程语言的 BPB 集合; 以及 Masked Perplexity, 一种新评测方法, 对 token 做掩码, 只在难以学习的 token 上计算困惑度. 我们用 UltraChat 和 WildChat 做 masked perplexity 评测, 从而在预训练阶段广泛覆盖真实用户交互的评测. OlmoBaseEval 的更多设计与实现细节见附录 A.4.

### 3.4 Stage 1: Pretraining (3.4 阶段 1: 预训练)

We first train Olmo 3 Base on Dolma 3 Mix, our 6T token pretraining data mix. While Dolma 3 Mix is comprised of largely the same types of data sources used in other open pretraining recipes (Soldaini et al., 2024; Bakouch et al., 2025; OLMo et al., 2024), we demonstrate three key novelties:

我们首先在 Dolma 3 Mix 上训练 Olmo 3 Base, 这是我们 6T token 的预训练数据混合. 虽然 Dolma 3 Mix 的数据来源类型与其他开放预训练配方 (Soldaini et al., 2024; Bakouch et al., 2025; OLMo et al., 2024) 大体相同, 但我们展示了三项关键创新:

<!-- page 14 of 118 -->

<table><tbody><tr><td rowspan="2">Source</td><td rowspan="2">Type</td><td colspan="2">9T Pool</td><td colspan="2">6T Mix</td><td colspan="2">150B Mix</td></tr><tr><td>Tokens</td><td>Docs</td><td>Tokens</td><td>Docs</td><td>Tokens</td><td>Docs</td></tr><tr><td>Common Crawl</td><td>Web pages</td><td>8.14T</td><td>9.67B</td><td>4.51T (76.1%)</td><td>3.15B</td><td>121B (76.9%)</td><td>84.5M</td></tr><tr><td>olmOCR science PDFs</td><td>Academic documents</td><td>972B</td><td>101M</td><td>805B (13.6%)</td><td>83.8M</td><td>19.9B (12.6%)</td><td>2.25M</td></tr><tr><td>Stack-Edu (Rebalanced)</td><td>GitHub code</td><td>137B</td><td>167M</td><td>409B (6.89%)</td><td>526M</td><td>11.1B (7.06%)</td><td>14.3M</td></tr><tr><td>arXiv</td><td>Papers with LaTeX</td><td>21.4B</td><td>3.95M</td><td>50.8B (0.86%)</td><td>9.10M</td><td>1.29B (0.82%)</td><td>247K</td></tr><tr><td>FineMath 3+</td><td>Math web pages</td><td>34.1B</td><td>21.4M</td><td>152B (2.56%)</td><td>95.5M</td><td>4.10B (2.60%)</td><td>2.57M</td></tr><tr><td>Wikipedia &amp; Wikibooks</td><td>Encyclopedic</td><td>3.69B</td><td>6.67M</td><td>2.51B (0.04%)</td><td>4.24M</td><td>64.6M (0.04%)</td><td>119K</td></tr><tr><td>Total</td><td></td><td>9.31T</td><td>9.97B</td><td>5.93T (100%)</td><td>3.87B</td><td>157B (100%)</td><td>104M</td></tr></tbody></table>

Table 4 Composition of Dolma 3 Mix including our 9T pool of data, the 6T mix we used for final model training, and the 150B mix we used for experimentation.

表 4｜Dolma 3 Mix 的构成, 包括我们 9T 的数据池, 最终模型训练所用的 6T 混合, 以及实验所用的 150B 混合.

• New tooling for fast and scalable global deduplication at the trillion-token scale;
• 在万亿 token 规模上做快速, 可扩展全局去重的新工具;

• Two new methods for optimizing selection of training tokens: token-constrained mixing and quality-aware upsampling;
• 两种优化训练 token 选取的新方法: token-constrained mixing 与 quality-aware upsampling;

• A novel source of academic PDFs—olmOCR science PDFs—converted to linearized plain text using olmOCR (Section §3.4.2) (Poznanski et al., 2025a).
• 一个新的学术 PDF 来源: olmOCR science PDFs, 用 olmOCR 转换为线性化纯文本 (第 §3.4.2 节) (Poznanski et al., 2025a).

Table 4 summarizes our data sources, pool sizes, and final training mix. As developing a base model is the most compute-intensive part of our development process, requiring training over trillions of tokens and consuming over 90% of overall compute, we adhere to two major principles to guide our data strategy:

表 4｜表 4 汇总了我们的数据来源, 数据池规模和最终训练混合. 开发 base 模型是整个开发流程中最耗算力的部分, 需要在数万亿 token 上训练, 消耗总算力的 90% 以上, 因此我们遵循两条主要原则来指导数据策略:

• We consider a source of data for pretraining if it has potential to yield enough tokens to impact model capabilities at pretraining scale. Valuable data sources that are small may not be impactful in pretraining and are better reserved for midtraining.
• 只有当一个数据来源有潜力提供足够多的 token, 能在预训练规模上影响模型能力时, 我们才考虑把它用于预训练. 规模小的高价值数据来源在预训练中可能起不到作用, 更适合留给 midtraining.

• While we embrace exploration of structured “task” data (e.g. QA pairs, chat instances) for training base models, we reserve their use only for later stages of midtraining (Section §3.5) and long-context extension (Section §3.6). Task data often does not meet the pool size needed to impact our pretraining stage, even with synthetic generation, and task data also tends to have an outsized impact on evaluation results, potentially confounding data ablations for other sources.
• 虽然我们乐于探索用结构化的 「任务」 数据 (例如 QA 对, 对话样本) 训练 base 模型, 但只把它们留在后面的 midtraining (第 §3.5 节) 和长上下文扩展 (第 §3.6 节) 阶段使用. 即便借助合成生成, 任务数据的池子规模往往也达不到影响预训练阶段所需的量级; 而且任务数据对评测结果的影响往往过大, 可能干扰其他数据来源的消融实验.

Figure 8 summarizes the pipeline steps for creating Dolma 3 Mix pretraining data. We describe them in more detail in the remainder of this section.

图 8｜图 8 汇总了构建 Dolma 3 Mix 预训练数据的流水线步骤. 本节余下部分会更详细地介绍.

![Image block](images/p14-figure-8-data-curation-flow-for-pretraining-data.png)

Figure 8 Data curation flow for pretraining data sources in Dolma 3 Mix.

图 8｜Dolma 3 Mix 中各预训练数据来源的数据策展流程.

<small><span class="docvortex-page-footnote" data-block-type="page_footnote" style="color:#6b7280"><sup>5</sup>The training mixes that we release represent reconstructions of the data sampled during our actual training runs. Tokens included in these reconstructions represent all of the tokens trained on for the training run, while included documents represent a union of all unique documents that contributed at least one token during training.</span></small>

<!-- page 15 of 118 -->

#### 3.4.1 Preparing our Web Data Pool (3.4.1 准备 Web 数据池)

We took the following steps to curate pretraining data from CommonCrawl (Common Crawl Foundation), which constituted the majority of our pretraining corpus.

我们按以下步骤从 CommonCrawl (Common Crawl Foundation) 策展预训练数据, 这部分数据构成了预训练语料的主体.

**Text extraction** We start with 104 dumps from the CommonCrawl corpus, with a cutoff date of December 31, 2024. Following DCLM (Li et al., 2024a), we remove HTML artifacts and extract the semantic text from WARC files using Resiliparse (Bevendorff et al., 2018). Where applicable, we directly leverage the raw Resiliparse-extracted data from DCLM-pool (Li et al., 2024a) and apply Resiliparse extraction on dumps not contained with the DCLM-pool.

**文本抽取** 我们从 CommonCrawl 语料的 104 个 dump 出发, 截止日期为 2024 年 12 月 31 日. 参照 DCLM (Li et al., 2024a), 我们用 Resiliparse (Bevendorff et al., 2018) 去除 HTML 残留, 从 WARC 文件中抽取语义文本. 在适用的情况下, 我们直接复用 DCLM-pool (Li et al., 2024a) 中 Resiliparse 抽取好的原始数据, 对 DCLM-pool 未包含的 dump 则自行做 Resiliparse 抽取.

**Heuristic filtering** We apply a pipeline of heuristic filtering steps to prune our initial collection of 252.6B documents to a size amenable for pretraining. Our process closely follows that of DCLM (Li et al., 2024a) with minor modifications to improve data quality and computational efficiency. We first apply URL filtering to remove spam and adult-content from an expanded blocklist. We then remove documents that were either too short or too long, followed by filtering documents that contain excessive symbols or insufficient quantities of alphabetic characters. Next we remove documents containing large amounts of internal repetition and apply filtering to remove common spam phrases, fully removing any documents that are identify by these heuristics. We then use a fastText classifier to identify the language of each document, keeping only documents that contain English text. As a final step, we apply sentence-level heuristics from Madlad400 (Li et al., 2024a). In aggregate, this process reduces the size of our data pool by 84.6%, yielding a corpus of 38.8B documents. More details are provided in Appendix §A.2.

**启发式过滤** 我们用一条启发式过滤流水线, 把最初收集的 2526 亿篇文档裁剪到适合预训练的规模. 流程基本沿用 DCLM (Li et al., 2024a), 只做了少量修改以提升数据质量和计算效率. 首先用扩充后的屏蔽列表做 URL 过滤, 去除垃圾内容和成人内容. 接着去掉过短或过长的文档, 再过滤掉符号过多或字母字符过少的文档. 然后移除内部重复过多的文档, 并过滤常见垃圾短语, 凡被这些启发式规则识别出的文档都整篇删除. 之后用 fastText 分类器识别每篇文档的语言, 只保留包含英文文本的文档. 最后一步应用来自 Madlad400 (Li et al., 2024a) 的句子级启发式规则. 整体来看, 这一流程把数据池缩小了 84.6%, 得到 388 亿篇文档的语料. 更多细节见附录 §A.2.

**Deduplication** The web data we collect from CommonCrawl naturally contains an abundance of duplicated documents. This duplication arises from repeated crawls of the same website, near-copies of documents appearing across multiple web pages, and highly-repeated boilerplate text. Our deduplication strategy is motivated by three observations from prior work: 1) deduplication generally leads to more token-efficient training (Lee et al., 2022); 2) duplicate count serves as a weak signal of data quality, with higher duplicate counts indicating higher quality (Fang et al., 2025a); 3) repeating documents more than a handful of times provides rapidly diminishing returns (Muennighoff et al., 2025a).

**去重** 从 CommonCrawl 收集的 Web 数据天然含有大量重复文档. 这些重复来自对同一网站的反复抓取, 在多个网页上出现的近似副本, 以及高度重复的模板文本. 我们的去重策略基于先前工作的三点观察: 1) 去重通常能让训练的 token 效率更高 (Lee et al., 2022); 2) 重复次数是数据质量的一个弱信号, 重复次数越多通常质量越高 (Fang et al., 2025a); 3) 文档重复超过少数几次后, 收益会迅速递减 (Muennighoff et al., 2025a).

Given these observations, we design our deduplication strategy to enable a future quality-based upsampling step (Section 3.4.4). We aggressively deduplicate our dataset at multiple granularities, targeting the removal of exact replicas, near-duplicates, and repeated filler text. While this necessarily discards the quality signal from duplicate counts, it produces a clean base dataset from which we can later selectively reintroduce repetition for high-quality documents. Our goal is a final dataset with minimal repetition overall, with any duplication concentrated in high-quality data. We implement our deduplication procedure in three distinct stages:

基于这些观察, 我们设计去重策略时为之后基于质量的上采样步骤 (第 3.4.4 节) 留出空间. 我们在多个粒度上对数据集做激进去重, 目标是去除完全相同的副本, 近似重复以及反复出现的填充文本. 这样做必然丢掉了重复次数所携带的质量信号, 但能得到一个干净的基础数据集, 之后再有选择地为高质量文档重新引入重复. 我们的目标是让最终数据集整体重复极少, 仅有的重复集中在高质量数据上. 去重流程分三个阶段实施:

1. Exact deduplication We apply global deduplication based on document text hashes to remove all exact copies. This step identifies 67% of the pool as duplicates, reducing the dataset from 38.7B to 12.8B documents.

1. 精确去重 基于文档文本哈希做全局去重, 移除所有完全相同的副本. 这一步把数据池中 67% 的文档识别为重复, 数据集从 387 亿篇减少到 128 亿篇.

2. Fuzzy deduplication We apply MinHash-based deduplication to identify and remove near-identical documents, such as documents copied across multiple domains that differ only in headers or footers. We partition the dataset into 32 shards, ran MinHash deduplication on each shard, then performed exhaustive pairwise Jaccard similarity checks within each identified cluster. From each cluster, we retain the most recent document by crawl date. This procedure identified 23% of the pool as duplicates, yielding 9.8B documents.

2. 模糊去重 用基于 MinHash 的去重识别并移除近乎相同的文档, 例如被复制到多个域名, 只在页眉或页脚上有差异的文档. 我们把数据集划分为 32 个分片, 在每个分片上运行 MinHash 去重, 然后在识别出的每个簇内做穷举式两两 Jaccard 相似度检查. 每个簇中保留抓取日期最新的文档. 这一步把数据池中 23% 的文档识别为重复, 剩下 98 亿篇文档.

3. Substring deduplication The previous steps removes whole duplicate documents but did not address repeated content within individual documents. Many documents contain substantial boilerplate text or HTML artifacts (e.g., headers and footers) of limited training value. To remove these repeated substrings, we apply a novel fuzzy suffix-array-based deduplication procedure. We partition the dataset into 57 shards and apply this procedure to each, marking any substring of 500 or more bytes that occurred multiple times. Unlike previous suffix-array methods, we preserve at least one occurrence of each repeated substring in

3. 子串去重 前面的步骤移除的是整篇重复文档, 没有处理单篇文档内部的重复内容. 许多文档含有大量训练价值有限的模板文本或 HTML 残留 (例如页眉和页脚). 为了去除这些重复子串, 我们采用一种新的基于后缀数组的模糊去重流程. 我们把数据集划分为 57 个分片, 在每个分片上运行该流程, 标记所有出现多次, 长度不少于 500 字节的子串. 与以往的后缀数组方法不同, 我们在

<small><span class="docvortex-page-footnote" data-block-type="page_footnote" style="color:#6b7280">6[data.commoncrawl.org/contrib/datacomp/DCLM-pool/index.html](https://data.commoncrawl.org/contrib/datacomp/DCLM-pool/index.html)</span></small>

<small><span class="docvortex-page-footnote" data-block-type="page_footnote" style="color:#6b7280">7lid.176 from [fasttext.cc/docs/en/language-identification](https://fasttext.cc/docs/en/language-identification.html)</span></small>

<!-- page 16 of 118 -->

the corpus. We then merge the intervals marking repeated substrings to also remove short substrings sandwiched between longer repeated segments. This procedure removes 14% of text bytes, yielding 9.7B documents totaling 36.5T bytes of uncompressed text.

语料中为每个重复子串至少保留一次出现. 然后我们合并标记重复子串的区间, 把夹在较长重复片段之间的短子串也一并去除. 这一步去除了 14% 的文本字节, 剩下 97 亿篇文档, 共 36.5T 字节未压缩文本.

This three-stage procedure reduces the web corpus from 38.7B to 9.7B documents—a 75% reduction in document count. The resulting aggressively deduplicated dataset can then be partitioned by topic and quality and controllably upsampled for training.

这个三阶段流程把 Web 语料从 387 亿篇文档减少到 97 亿篇, 文档数减少了 75%. 得到的这份经过激进去重的数据集可以再按主题和质量划分, 并在训练时有控制地上采样.

To scale our deduplication strategy, we develop the Duplodocus tool, a native-rust toolkit for large-scale distributed execution of both hash-based exact deduplication and MinHash fuzzy deduplication.

为了让去重策略能够扩展, 我们开发了 Duplodocus 工具, 这是一套原生 Rust 工具包, 用于大规模分布式执行基于哈希的精确去重和 MinHash 模糊去重.

**Topic and quality classification** We use our WebOrganizer tool (Wettig et al., 2025) to partition the deduplicated corpus into 24 topics (e.g., “Adult Content”, “Politics”, or “Science and Technology”). To speed up processing of the Dolma 3 pool, we distill the transformer-based models by Wettig et al. 2025 into a simpler fastText model. We only partition by topic, not format. We also train and apply a fastText-based quality classifier to assign each document a quality score. Following DCLM (Li et al., 2024a), we use OpenHermes-2.5 (Teknium, 2023) and ELI5 (Fan et al., 2019) as positive training examples, supplemented with UltraChat-200k (Ding et al., 2023) and WildChat-1M (Zhao et al., 2024a). Negative training examples consist of 30GB sampled from DCLM-RefinedWeb.

**主题与质量分类** 我们用 WebOrganizer 工具 (Wettig et al., 2025) 把去重后的语料划分为 24 个主题 (例如 「Adult Content」, 「Politics」 或 「Science and Technology」). 为加快处理 Dolma 3 数据池, 我们把 Wettig et al. 2025 中基于 Transformer 的模型蒸馏成更简单的 fastText 模型. 我们只按主题划分, 不按格式划分. 我们还训练并应用一个基于 fastText 的质量分类器, 为每篇文档打出质量分. 参照 DCLM (Li et al., 2024a), 我们用 OpenHermes-2.5 (Teknium, 2023) 和 ELI5 (Fan et al., 2019) 作为正例训练样本, 并补充 UltraChat-200k (Ding et al., 2023) 和 WildChat-1M (Zhao et al., 2024a). 负例训练样本是从 DCLM-RefinedWeb 采样的 30GB 数据.

We apply both the topic and quality classifiers to the full deduplicated corpus in order to partition the dataset. Documents are first partitioned by topic, then within each topic partition we compute quality score percentiles and subdivide documents into vigintile buckets (5-percentile intervals). This two-stage partitioning yields 480 disjoint subsets (24 topics × 20 quality tiers), enabling fine-grained control over the topic and quality distribution of our pretraining mixture.

我们把主题分类器和质量分类器都应用到整个去重后的语料上, 以对数据集做划分. 文档先按主题划分, 然后在每个主题分区内计算质量分的百分位, 并把文档细分到 20 个分位桶 (每 5 个百分位一档). 这种两级划分得到 480 个互不相交的子集 (24 个主题 × 20 个质量档), 使我们能够精细控制预训练混合的主题与质量分布.

**Final web data pool** The above steps results in an 8T-token pool of annotated data, partitioned into buckets according to topic and text quality. This pool serves as the foundation for our pretraining mixture, though additional processing is required to construct the final training data. Specifically, we apply quality-based filtering and topic reweighting to generate a balanced, high-quality mixture, as discussed in Section §3.4.4.

**最终 Web 数据池** 以上步骤得到一个 8T token 的带标注数据池, 按主题和文本质量划分成桶. 这个数据池是预训练混合的基础, 但构建最终训练数据还需要进一步处理. 具体来说, 我们做基于质量的过滤和主题重加权, 生成一个均衡的高质量混合, 详见第 §3.4.4 节.

#### 3.4.2 Preparing our olmOCR science PDFs Data Pool (3.4.2 准备 olmOCR 科学 PDF 数据池)

We curate a novel dataset of academic PDFs, replacing our previous use of peS2o (Soldaini and Lo, 2023). These documents are crawled “politely”: we identify our crawler as AI2Bot, we adhere to robots.txt, and do not bypass paywalls. The crawler is seeded with a focus on academic sites and paper repositories. We process all PDFs using the first version of olmOCR (Poznanski et al., 2025a). Ultimately this crawl generates a collection of 238 million unique PDF documents with a cutoff date of December 2024.

我们策展了一个新的学术 PDF 数据集, 取代之前使用的 peS2o (Soldaini and Lo, 2023). 这些文档是 「礼貌地」 抓取的: 爬虫以 AI2Bot 表明身份, 遵守 robots.txt, 不绕过付费墙. 爬虫的种子以学术网站和论文仓库为重点. 所有 PDF 都用第一版 olmOCR (Poznanski et al., 2025a) 处理. 这次抓取最终得到 2.38 亿篇不重复的 PDF 文档, 截止日期为 2024 年 12 月.

**olmOCR text extraction** To convert PDFs to a format usable by our trainer, we apply pre-filtering and text extraction. If a document contains born-digital text, we used the Lingua language detector to retain only English documents and remove documents where spam or SEO-optimization keywords exceeded 0.4% of total words. We then extract text using olmOCR (Poznanski et al., 2025a) (versions 0.1.49-0.1.53). If olmOCR fails, we use Poppler’s pdftotext as a fallback; documents requiring this fallback for more than 1 in 250 pages are excluded from the corpus. This yields a dataset of 160 million PDF documents.

**olmOCR 文本抽取** 为了把 PDF 转换成训练器可用的格式, 我们做了预过滤和文本抽取. 如果文档含有原生数字文本, 我们用 Lingua 语言检测器只保留英文文档, 并移除垃圾或 SEO 优化关键词超过总词数 0.4% 的文档. 然后用 olmOCR (Poznanski et al., 2025a) (版本 0.1.49-0.1.53) 抽取文本. 如果 olmOCR 失败, 就用 Poppler 的 pdftotext 作为回退; 需要回退的页面超过每 250 页 1 页的文档被排除出语料. 由此得到 1.6 亿篇 PDF 文档的数据集.

**Deduplication** We then identify and remove any fuzzy-duplicates using a MinHash algorithm. This differs slightly from the MinHash step we apply to the web text corpus in Section §3.4.1: we use the MinHash parameters as in FineWeb (Penedo et al., 2024), which targets document pairs with at least 75% similarity; and we omit an exhaustive pairwise Jaccard similarity check. After this deduplication step, we were left with a corpus of 156M documents for a removal rate of 2.3%.

**去重** 接着我们用 MinHash 算法识别并移除所有模糊重复. 这与第 §3.4.1 节中对 Web 文本语料做的 MinHash 步骤略有不同: 我们使用 FineWeb (Penedo et al., 2024) 的 MinHash 参数, 目标是相似度至少 75% 的文档对; 并且省略了穷举式两两 Jaccard 相似度检查. 这一步去重之后剩下 1.56 亿篇文档, 移除率为 2.3%.

<small><span class="docvortex-page-footnote" data-block-type="page_footnote" style="color:#6b7280">8 [github.com/allenai/duplodocus](https://github.com/allenai/duplodocus)</span></small>

<small><span class="docvortex-page-footnote" data-block-type="page_footnote" style="color:#6b7280">9[huggingface.co/allenai/dolma3-fasttext-weborganizer-topic-classifier](https://huggingface.co/allenai/dolma3-fasttext-weborganizer-topic-classifier)</span></small>

<small><span class="docvortex-page-footnote" data-block-type="page_footnote" style="color:#6b7280">10<a href="https://huggingface.co/allenai/dolma3-fasttext-quality-classifier"><sub>huggingface</sub>.co/allenai/dolma3-fasttext-quality-classifier</a></span></small>

<small><span class="docvortex-page-footnote" data-block-type="page_footnote" style="color:#6b7280">11<sub>Crawling</sub> notice: [allenai.org/crawler](https://allenai.org/crawler)</span></small>

<!-- page 17 of 118 -->

**PII filtering** Next we remove documents containing PII from the pool of PDFs. Our goal was to to remove documents that contained sensitive standalone PII, such as government IDs and login information, as well as documents that link biographical, medical, location, employment, or educational information to a specific individual. Through iteration, we determine that PII detection must be document type-aware to be effective. For example, a conference paper might contain name and place of employment of authors; however, as research articles are intended for publication, removal would not make sense. At the same time, a bank statement might contain the same name and employer information, and is clearly a document a language model should not be trained on. The rule we follow is: is this document type intended for public dissemination? We use manual annotators to iterate which documents types are not suitable for public dissemination, and what PII attributes we should consider. The resulting taxonomy is used as part of a multi-stage model-based PII filtering pipeline.

**PII 过滤** 随后, 我们从 PDF 数据池中移除含有 PII 的文档. 我们的目标是移除含有敏感独立 PII 的文档, 例如政府证件号和登录信息, 以及把个人履历, 医疗, 位置, 就业或教育信息与特定个人关联起来的文档. 经过反复迭代, 我们确定 PII 检测必须感知文档类型才会有效. 例如, 会议论文可能包含作者的姓名和工作单位, 但研究论文本来就是为了发表, 删除它们没有道理. 与此同时, 银行对账文件可能包含同样的姓名和雇主信息, 而这显然是语言模型不应该拿来训练的文档. 我们遵循的规则是: 这类文档是否本来就是为公开传播而写的? 我们请人工标注员反复迭代, 确定哪些文档类型不适合公开传播, 以及应当考虑哪些 PII 属性. 得到的分类体系被用作一条多阶段, 基于模型的 PII 过滤流水线的一部分.

First we classify documents using a prompt to Gemma 3 12B (Gemma 3 Team, 2025) on the first page of each document to determine if they contain any sensitive standalone PII, or link sensitive information to an individual. Next, we use Gemma 3 4B on the first 5,000 characters of each document to arrive at a set of flags describing the type of document. From these classification results, we develop a set of rules to identify which types of documents containing PII should be publicly available and which should be filtered. Ultimately this removes 4.9% of the remaining pool and yields a pool of 148 million documents. See Poznanski et al. (2025a) for more a complete overview of the PII removal pipeline.

首先, 我们在每篇文档的第一页上用提示词调用 Gemma 3 12B (Gemma 3 Team, 2025) 对文档分类, 判断其是否含有敏感独立 PII, 或是否把敏感信息关联到某个个人. 接着, 我们在每篇文档的前 5,000 个字符上用 Gemma 3 4B 得到一组描述文档类型的标记. 基于这些分类结果, 我们制定了一套规则, 判断哪些含 PII 的文档类型应当公开可用, 哪些应当过滤. 最终这一步移除了剩余数据池的 4.9%, 得到 1.48 亿篇文档. PII 移除流水线的更完整介绍见 Poznanski et al. (2025a).

**Heuristic filtering** After PII removal, we apply a round of heuristic filtering to further remove low-quality documents. Filters applied in this step include checking for: non-English documents not originally caught by the Lingua filter; documents that were more than 30% tables; and documents that contain more than 20% numbers. Next we apply modifications that convert markdown tables to HTML and remove URL references. The combination of these filtration steps yield a corpus of 108 million documents. This corpus is then partitioned into 24 topical buckets, according to the WebOrganizer topic classifier (Wettig et al., 2025), and passed off to the mixing (Section §3.4.4).

**启发式过滤** 移除 PII 之后, 我们再做一轮启发式过滤, 进一步去除低质量文档. 这一步的过滤器检查的内容包括: Lingua 过滤器没有捕获的非英文文档; 表格占比超过 30% 的文档; 数字占比超过 20% 的文档. 接着我们做一些修改, 把 markdown 表格转换为 HTML, 并移除 URL 引用. 这些过滤步骤合起来得到 1.08 亿篇文档的语料. 随后按 WebOrganizer 主题分类器 (Wettig et al., 2025) 把该语料划分为 24 个主题桶, 交给混合步骤 (第 §3.4.4 节).

#### 3.4.3 Preparing Code, Math, and other sources (3.4.3 准备代码, 数学与其他来源)

**Code** For code data, we use Stack-Edu (Allal et al., 2025), an improved curation of GitHub repositories from the-stack-v2 dataset (Lozhkov et al., 2024) with additional filtering for educational programming content. We keep partitions of the data by programming language for subsequent mixing.

**代码** 代码数据使用 Stack-Edu (Allal et al., 2025), 它是对 the-stack-v2 数据集 (Lozhkov et al., 2024) 中 GitHub 仓库的改进版策展, 额外过滤出了面向编程教学的内容. 我们保留按编程语言划分的数据分区, 供后续混合使用.

**Math** As in OLMo 2, we include arXiv documents from the Proof-Pile-2 dataset (Azerbayev et al., 2023), which in turn are from the RedPajama dataset (Together AI, 2023) and have a cutoff date of April 2023. We use this source primarily because it preserves the original LaTeX notation, enabling the model to learn both mathematical content and how to properly format it.

**数学** 与 OLMo 2 一样, 我们纳入 Proof-Pile-2 数据集 (Azerbayev et al., 2023) 中的 arXiv 文档, 这些文档又来自 RedPajama 数据集 (Together AI, 2023), 截止日期为 2023 年 4 月. 选用这个来源主要是因为它保留了原始 LaTeX 记号, 让模型既能学到数学内容, 也能学到如何正确排版数学.

Furthermore, we replace our previous use of OpenWebMath (Paster et al., 2023) with FineMath (Allal et al., 2025), a subset of Common Crawl documents that contain mathematical educational content and have been reprocessed to preserve proper mathematical notation. We include all documents that have a quality score of at least 3 (out of 4), according to the FineMath classifier. This data has a cutoff date of September 2024.

此外, 我们用 FineMath (Allal et al., 2025) 替换了之前使用的 OpenWebMath (Paster et al., 2023). FineMath 是 Common Crawl 文档中含数学教学内容的一个子集, 经过重新处理以保留正确的数学记号. 我们纳入 FineMath 分类器质量分不低于 3 (满分 4) 的所有文档. 这部分数据的截止日期为 2024 年 9 月.

**Other** Finally, we include the Wikipedia and Wikibooks sources from Dolma (Soldaini et al., 2024) as base sources of encyclopedic knowledge. These are both the “English” and “Simple” editions of Wikipedia and Wikibooks with a cutoff date of March 2023. These sources were processed using WikiExtractor (Attardi, 2015) to remove markup formatting, and all documents with 25 or fewer words were filtered out to exclude template pages or pages that encountered XML parsing errors.

**其他** 最后, 我们纳入 Dolma (Soldaini et al., 2024) 中的 Wikipedia 和 Wikibooks 来源, 作为百科知识的基础来源. 其中包括 Wikipedia 和 Wikibooks 的 「English」 与 「Simple」 两个版本, 截止日期为 2023 年 3 月. 这些来源用 WikiExtractor (Attardi, 2015) 处理以去除标记格式, 并过滤掉所有不超过 25 个词的文档, 以排除模板页面或 XML 解析出错的页面.

#### 3.4.4 Sampling and Mixing over Data Pools (3.4.4 在数据池上采样与混合)

The data sources described above collectively provide over 9 trillion tokens of diverse text data. Transforming this collection into a training dataset requires a mixing and sampling pipeline to prescribe exactly how much of each source to include in a final training mix, and how much, if any, upsampling to apply to each source. We apply a mixing strategy that draws on swarm-based methods to train and evaluate many smaller proxy

上述数据来源合计提供超过 9 万亿 token 的多样文本数据. 要把这些数据变成训练数据集, 需要一条混合与采样流水线, 明确规定最终训练混合中每个来源纳入多少, 以及每个来源要不要上采样, 上采样多少. 我们采用的混合策略借鉴了基于 swarm 的方法: 训练并评测大量较小的代理

<!-- page 18 of 118 -->

models, using these results to inform an optimal mix. Further, we apply a novel conditional mixing procedure to account for the fact that our data sources were being constantly refined and updated throughout the development cycle. In this section, we describe how we derive the final at the mixing ratios for each source; for web text, we only optimize ratios at the topic category level and apply quality-aware upsampling to obtain the final mix.

模型, 用这些结果来确定最优混合. 此外, 由于我们的数据来源在整个开发周期中不断被改进和更新, 我们采用了一种新的条件混合流程来应对这一情况. 本节介绍我们如何得出每个来源的最终混合比例; 对于 Web 文本, 我们只在主题类别层面优化比例, 再用 quality-aware upsampling 得到最终混合.

![Chart block](images/p18-a-dclm-baseline-partitioned-by-topic.png)

(a) DCLM Baseline partitioned by topic.

![Chart block](images/p18-b-improvement-when-training-over-dclm-baseline.png)

(b) Improvement when training over DCLM Baseline.

(b) 相对在 DCLM Baseline 上训练的提升.

![Chart block](images/p18-c-stack-edu-partitioned-by-programming-language.png)

(c) Stack-Edu partitioned by programming language.

(c) 按编程语言划分的 Stack-Edu.

![Chart block](images/p18-d-improvement-when-training-over-stack-edu.png)

(d) Improvement when training over Stack-Edu.

(d) 相对在 Stack-Edu 上训练的提升.

**Figure 9 Examples and effects of constrained data mixing for Olmo 3.** On the left, comparison of the natural distribution of data sources in the Dolma 3 pool versus our learned data mixture in Dolma 3 Mix (Figures 9a and 9c). On the right, the improvement on downstream evaluations resulting from training on our data mix compared to the natural distribution (Figures 9b and 9d).

**图 9 Olmo 3 约束数据混合的示例与效果.** 左侧比较 Dolma 3 数据池中各数据来源的自然分布与我们在 Dolma 3 Mix 中学到的数据混合 (图 9a 与图 9c). 右侧展示在我们的数据混合上训练相对在自然分布上训练所带来的下游评测提升 (图 9b 与图 9d).

**Constrained data mixing** We applied data mixing across all pretraining sources, as well as across the WebOrganizer topics within the web data and PDF sources, and the Stack-Edu programming languages. Our mixing procedure (Chen et al., 2026), consists of two components: a base procedure that constructs a high-quality mix over a fixed set of data domains, and a meta-procedure called conditional mixing that efficiently updates an existing mix when domains change. Together, these allow us to iteratively build an optimal mix and adapt to data refinements or additions without starting from scratch.

**约束数据混合** 我们在所有预训练来源之间, Web 数据与 PDF 来源内部的 WebOrganizer 主题之间, 以及 Stack-Edu 的编程语言之间都做了数据混合. 我们的混合流程 (Chen et al., 2026) 由两部分组成: 一个基础流程, 在固定的数据域集合上构建高质量混合; 一个称为条件混合的元流程, 在数据域变化时高效更新已有混合. 两者结合, 从而能够迭代构建最优混合, 并在数据改进或新增时无需从头开始.

The base procedure follows a swarm-based approach inspired by RegMix (Liu et al., 2024a), Data Mixing Laws (Ye et al., 2025), and CLIMB (Diao et al., 2025); it consists of three stages:

基础流程采用基于 swarm 的方法, 受 RegMix (Liu et al., 2024a), Data Mixing Laws (Ye et al., 2025) 和 CLIMB (Diao et al., 2025) 启发, 分为三个阶段:

1. Swarm construction. We sample the space of possible mixes by training many small proxy models, each with a different mixing ratio. Specifically, we train 30M-parameter models following the Olmo 3

1. 构建 swarm. 我们训练大量小型代理模型, 每个模型采用不同的混合比例, 以此对可能的混合空间采样. 具体来说, 我们按 Olmo 3

<!-- page 19 of 118 -->

architecture for 3B tokens (5x Chinchilla), sampling each mix from a Dirichlet distribution centered on the natural (no-mixing) distribution. As a rule of thumb, we launch a swarm of size 5x that of the number of domains. We then evaluate each proxy model on the Base Easy suite.

架构训练 30M 参数的模型, 训练 3B token (5 倍 Chinchilla), 每个混合从以自然 (不混合) 分布为中心的 Dirichlet 分布中采样. 按经验法则, swarm 的规模取数据域数量的 5 倍. 然后在 Base Easy 套件上评测每个代理模型.

2. Per-task regression. Each proxy model provides a datapoint mapping mixture weights to task performance—measured in bits-per-byte (BPB)—for each task. We fit a separate generalized linear model for each task, enabling us to predict how any candidate mix will perform.

2. 逐任务回归. 每个代理模型都为每个任务提供一个数据点, 把混合权重映射到任务表现 (以每字节比特数 BPB 度量). 我们为每个任务单独拟合一个广义线性模型, 从而能预测任意候选混合的表现.

3. Mix optimization. We find the mixture that minimizes the average task BPB, as predicted by the per-task regression models. Since we ultimately seek a corpus with a 6T token budget, and we avoid repeating any domain more than approximately 4 − 7 times, this naturally imposes maximum ratio constraints on certain domains based on their available token counts. We solve this constrained optimization using a guided search initialized from a prior or natural distribution.

3. 混合优化. 我们寻找使平均任务 BPB 最小的混合, BPB 由逐任务回归模型预测. 由于我们最终需要一个 6T token 预算的语料, 并且避免任何数据域重复超过大约 4 − 7 次, 这自然会根据某些数据域的可用 token 数为其施加最大比例约束. 我们用一种从先验分布或自然分布初始化的引导搜索来求解这个约束优化问题.

The base procedure assumes fixed domains, but real preprocessing workflows evolve continuously as we refine filters, add domains, or discover and mitigate quality issues. Rather than recomputing an entire swarm each time domains change, we introduce a new procedure called conditional mixing to efficiently adapt the base method to an evolving data landscape. The key idea is to treat the existing optimized mix as a single virtual domain with frozen mixing ratios, then re-run the base procedure over this virtual domain plus any new or modified domains. This effectively restricts the base mixing procedure to a lower-dimensional subspace of the mixture weight space, reducing swarm size and computational cost. Further details and justification of this procedure can be found in Chen et al. (2026).

基础流程假设数据域固定, 但真实的预处理工作流在持续演进: 我们会改进过滤器, 新增数据域, 或者发现并缓解质量问题. 我们没有在每次数据域变化时重算整个 swarm, 而是引入一个称为条件混合的新流程, 让基础方法高效适应不断变化的数据版图. 核心思路是把已有的优化混合视为一个混合比例冻结的虚拟数据域, 然后在这个虚拟数据域加上所有新增或修改过的数据域上重新运行基础流程. 这实际上把基础混合流程限制在混合权重空间的一个低维子空间里, 从而减小 swarm 规模和计算成本. 该流程的更多细节与论证见 Chen et al. (2026).

To construct the Dolma 3 Mix weights, we perform three rounds of our conditional mixing procedure, with each stage building incrementally on frozen mixtures from prior stages. We first obtain optimized mixture weights over the 24 WebOrganizer categories within the DCLM Baseline mix as well as the source-level mix. Web text serves as the starting point because it constitutes the largest data pool and because we use it to develop the base mixing methodology. As finalizing the bespoke web data pool described in Section §3.4.1 occurs concurrently with these initial mixing rounds, we perform this first round of mixing on DCLM-Baseline, expecting that learned preferences would transfer to our final web data.

为了构建 Dolma 3 Mix 的权重, 我们做了三轮条件混合, 每一轮都在前几轮冻结的混合之上增量构建. 我们首先在 DCLM Baseline 混合内部的 24 个 WebOrganizer 类别上, 以及在来源层面上, 求得优化的混合权重. 之所以从 Web 文本开始, 是因为它是最大的数据池, 而且我们用它来开发基础混合方法. 由于第 §3.4.1 节所述定制 Web 数据池的最终定稿与这几轮初始混合同时进行, 我们在 DCLM-Baseline 上做第一轮混合, 预期学到的偏好能迁移到最终的 Web 数据上.

Having frozen a mixture across WebOrganizer categories over web text, we turn our attention to mixtures of programming languages from Stack-Edu. Diverging slightly from the conditional mixing procedure, we fix the web text ratio to be 75% of the pool and force a 25% mixture of Stack-Edu data and only optimize over the composition of programming languages within this 25%. Finally, we perform one more round of conditional mixing to integrate the 24 WebOrganizer categories of the PDF data, conditioned on the DCLM, Stack-Edu, and source-level mixes. This incremental approach towards mixing is essential: for example, we complete PDF curation substantially later than other sources, and conditional mixing enable us to incorporate late-arriving data while reusing prior optimization results rather than restarting the expensive swarm-based base procedure.

在冻结了 Web 文本上各 WebOrganizer 类别的混合之后, 我们转向 Stack-Edu 中编程语言的混合. 这里我们稍微偏离了条件混合流程: 把 Web 文本比例固定为数据池的 75%, 强制 Stack-Edu 数据占 25%, 只优化这 25% 内部的编程语言构成. 最后, 我们再做一轮条件混合, 以 DCLM, Stack-Edu 和来源层面的混合为条件, 纳入 PDF 数据的 24 个 WebOrganizer 类别. 这种增量式的混合方法至关重要: 例如, PDF 策展比其他来源完成得晚得多, 条件混合可以纳入后到的数据, 同时复用之前的优化结果, 而不必重新启动代价高昂的基于 swarm 的基础流程.

Figure 9 presents mixing outcomes and their performance results relative to the natural data distribution. For web text (top panels), the optimized mixture dramatically upweights STEM domains (e.g. “Science, Math, and Technology” and “Software Development”). On 1B-parameter models trains for 5x Chinchilla, this mixture obtains an average improvement of 0.056 and max of 0.209 (in BPB), while only 13 out of 54 tasks show degradations, none of which exceed 0.035. For rebalancing of programming languages in Stack-Edu (bottom panels), the optimized mix favors Python over Java and Markdown, yielding modest improvements in all but two coding benchmarks. Table 38 further demonstrates our method’s adaptability: swapping development suites to emphasize QA, math, or coding produces mixtures that preferentially optimize these respective capabilities.

图 9｜图 9 展示了混合结果及其相对自然数据分布的性能表现. 对 Web 文本 (上方面板), 优化后的混合大幅提高了 STEM 领域的权重 (例如 「Science, Math, and Technology」 和 「Software Development」). 在以 5 倍 Chinchilla 训练的 1B 参数模型上, 这个混合的平均提升为 0.056, 最大提升为 0.209 (以 BPB 计), 54 个任务中只有 13 个出现退化, 且退化都不超过 0.035. 对 Stack-Edu 的编程语言再平衡 (下方面板), 优化后的混合更偏向 Python 而非 Java 和 Markdown, 在除两个以外的所有编码基准上都带来了小幅提升. 表 38 进一步展示了我们方法的适应性: 把开发套件换成侧重 QA, 数学或编码的版本, 得到的混合会相应地优先优化这些能力.

**Quality-aware upsampling** The data mixing procedure described in the previous section determines optimal proportions across different data sources and topics, but does not account for quality variations within each topic. For web text sources like CommonCrawl, we initially derive these proportions from DCLM, which applies only flat filtering-based on quality classifier scores. However, in a separate set of experiments, we found that quality-aware upsampling improves performance in data-constrained settings (see Appendix). For example, when constructing a 250B token mix from a 1T token pool, flat quality-filtering (as in DCLM) would

**Quality-aware upsampling** 上一节的数据混合流程确定了不同数据来源和主题之间的最优比例, 但没有考虑每个主题内部的质量差异. 对 CommonCrawl 这类 Web 文本来源, 我们最初从 DCLM 推导这些比例, 而 DCLM 只做基于质量分类器分数的一刀切过滤. 不过, 在另一组实验中我们发现, 在数据受限的设定下, quality-aware upsampling 能提升表现 (见附录). 例如, 从 1T token 的数据池构建 250B token 的混合时, 一刀切的质量过滤 (如 DCLM 的做法) 会

<small><span class="docvortex-page-footnote" data-block-type="page_footnote" style="color:#6b7280">12<a href="https://data.commoncrawl.org/contrib/datacomp/DCLM-baseline/index.html"><sub>data</sub>.commoncrawl.org/contrib/datacomp/DCLM-baseline/index.html</a></span></small>

<!-- page 20 of 118 -->

![Chart block](images/p20-figure-10-example-of-quality-aware-upsampling-curve.png)

Figure 10 Example of quality-aware upsampling curve compared to a flat upsampling curve. The x-axis denotes quality of data in terms of percentiles and the y-axis denotes how much the data is repeated. In this instance, the bottom 40% of data is discarded, and the top 5% of data is resampled 7 times.

图 10｜quality-aware upsampling 曲线与一刀切上采样曲线的对比示例. 横轴表示数据质量的百分位, 纵轴表示数据被重复的次数. 在这个例子中, 质量最低的 40% 数据被丢弃, 质量最高的 5% 数据被重采样 7 次.

simply select the top quartile. We achieve better results by upsampling the highest-quality data: including multiple copies of the top 5% and single copies of the remaining data to reach the target token count.

直接选取质量最高的四分之一. 对质量最高的数据做上采样效果更好: 纳入前 5% 数据的多份副本, 其余数据各保留一份, 以达到目标 token 数.

We formalize this approach using upsampling curves, as in Figure 10. The x-axis represents data quality in percentiles, while the y-axis shows the upsampling factor. Flat filtering corresponds to a step function on this plot, and quality-based upsampling would correspond to a monotonically increasing curve. For the purposes of generating a training data corpus, we generate separate upsampling curves for each of the 24 WebOrganizer-defined topics in our web text pool. The integral of each curve determines the total tokens extracted from that topic: for example, an integral of 2.0 indicates an average upsampling rate of 2x, yielding twice the token count from that data bucket.

我们用上采样曲线把这种方法形式化, 如图 10 所示. 横轴表示数据质量的百分位, 纵轴表示上采样倍数. 一刀切过滤在这张图上对应一个阶跃函数, 基于质量的上采样则对应一条单调递增曲线. 为了生成训练语料, 我们为 Web 文本池中 WebOrganizer 定义的 24 个主题分别生成上采样曲线. 每条曲线的积分决定了从该主题抽取的总 token 数: 例如积分为 2.0 表示平均上采样率为 2 倍, 从该数据桶得到两倍的 token 数.

To define an upsampling curve for each web text topic bucket, we leverage three constraints: 1) the optimal topic proportion, as determined by the mixing experiments; 2) the total desired training duration in terms of tokens; and 3) a maximum upsampling factor of 7 (empirically determined). The first two of these constraints control the target integral (average upsampling rate) for each topic bucket. The third constraint dictates an upper bound on the upsampling curve. Given these constraints, we can search over the space of curves to find a parametric curve that meets these constraints, which becomes the upsampling curve for this topic-bucket. In practice, our data is organized into discrete quality buckets that partition the quality percentile range. For each quality bucket, we compute its upsampling rate by integrating the upsampling curve over the corresponding percentile interval and dividing by the interval width. More details regarding this procedure can be found in Appendix §A.2.

为了给每个 Web 文本主题桶定义上采样曲线, 我们利用三个约束: 1) 混合实验确定的最优主题比例; 2) 以 token 计的期望总训练时长; 3) 最大上采样倍数为 7 (经验确定). 前两个约束控制每个主题桶的目标积分 (平均上采样率). 第三个约束给上采样曲线设定上界. 在这些约束下, 我们可以在曲线空间中搜索满足约束的参数化曲线, 作为该主题桶的上采样曲线. 实践中, 我们的数据按离散质量桶组织, 这些桶划分了质量百分位区间. 对每个质量桶, 我们在对应百分位区间上对上采样曲线积分, 再除以区间宽度, 得到该桶的上采样率. 该流程的更多细节见附录 §A.2.

**Evaluation during pretraining** It can be difficult to obtain a reliable estimate of model performance in the middle of a pretraining run, since the quality of a run is highly influenced by the learning rate (see OLMo et al. (2024), Section 4.1). For a 7B model, we can anneal the learning rate to zero at regular intervals throughout training to assess progress, but this is prohibitively expensive for a 32B model. To monitor performance of our 32B model during the training run, we use the technique from Li et al. (2025), and average the weights from four checkpoints, chosen 1,000 steps apart at regular intervals.

**预训练期间的评测** 在预训练中途很难可靠估计模型表现, 因为一次运行的质量受学习率影响很大 (见 OLMo et al. (2024) 第 4.1 节). 对 7B 模型, 我们可以在训练过程中定期把学习率退火到零来评估进展, 但对 32B 模型这样做代价过高. 为了在训练中监控 32B 模型的表现, 我们采用 Li et al. (2025) 的技术, 对四个 checkpoint 的权重取平均, 这些 checkpoint 按固定间隔选取, 彼此相隔 1,000 步.

### 3.5 Stage 2: Midtraining (3.5 阶段 2: Midtraining)

After pretraining, Olmo 3 Base is further trained to improve key fundamental capabilities. During this midtrain stage, we use 100B high-quality tokens sampled from a brand new data pool we introduce in this work, Dolma 3 Dolmino Mix. This midtraining data significantly expands and improves upon OLMo 2 Dolmino Mix, which we curated for our previous model OLMo 2. The improvement comes from two key

预训练之后, Olmo 3 Base 会继续训练, 以提升关键的基础能力. 在这个 midtrain 阶段, 我们使用 100B 高质量 token, 采样自本工作引入的全新数据池 Dolma 3 Dolmino Mix. 这份 midtraining 数据在我们为上一代模型 OLMo 2 策展的 OLMo 2 Dolmino Mix 基础上大幅扩充和改进. 改进来自两项关键

<!-- page 21 of 118 -->

<table><tbody><tr><td rowspan="2">Type</td><td rowspan="2">Source</td><td colspan="2">2T Pool</td><td colspan="2">100B Mix</td></tr><tr><td>Tokens</td><td>Docs</td><td>Tokens</td><td>Docs</td></tr><tr><td>Math (synth)</td><td>TinyMATH Mind**</td><td>899M</td><td>1.42M</td><td>898M (0.9%)</td><td>1.52M</td></tr><tr><td>Math (synth)</td><td>TinyMATH PoT**</td><td>241M</td><td>729K</td><td>241M (0.24%)</td><td>758K</td></tr><tr><td>Math (synth)</td><td>CraneMath*</td><td>5.62B</td><td>6.55M</td><td>5.62B (5.63%)</td><td>7.24M</td></tr><tr><td>Math (synth)</td><td>MegaMatt*</td><td>3.88B</td><td>6.79M</td><td>1.73B (1.73%)</td><td>3.23M</td></tr><tr><td>Math (synth)</td><td>Dolmino Mathˆˆ</td><td>10.7B</td><td>21M</td><td>10.7B (10.7%)</td><td>22.3M</td></tr><tr><td>Code</td><td>StackEdu (FIM)ˆ</td><td>21.4B</td><td>32M</td><td>10.0B (10.0%)</td><td>16.2M</td></tr><tr><td>Python (synth)</td><td>CraneCode*</td><td>18.8B</td><td>19.7M</td><td>10.0B (10.0%)</td><td>11.7M</td></tr><tr><td>QA (synth)</td><td>Reddit To Flashcards**</td><td>21.6B</td><td>370M</td><td>5.90B (5.9%)</td><td>101M</td></tr><tr><td>QA (synth)</td><td>Wiki To RCQA**</td><td>4.22B</td><td>22.3M</td><td>3.0B (3.0%)</td><td>16.3M</td></tr><tr><td>QA (synth)</td><td>Nemotron Synth QAˆ</td><td>487B</td><td>972M</td><td>5.0B (5.0%)</td><td>10.6M</td></tr><tr><td>Thinking (synth)</td><td>Math Meta-Reasoning**</td><td>1.05B</td><td>984K</td><td>381M (0.38%)</td><td>401K</td></tr><tr><td>Thinking (synth)</td><td>Code Meta-Reasoning**</td><td>1.27B</td><td>910K</td><td>459M (0.46%)</td><td>398K</td></tr><tr><td>Thinking (synth)</td><td>Program-Verifiable**</td><td>438M</td><td>384K</td><td>159M (0.16%)</td><td>158K</td></tr><tr><td>Thinking (synth)</td><td>OMR Rewrite FullThoughtsˆ</td><td>850M</td><td>291K</td><td>850M (0.85%)</td><td>394K</td></tr><tr><td>Thinking (synth)</td><td>QWQ Reasoning Tracesˆ</td><td>4.77B</td><td>438K</td><td>1.87B (1.87%)</td><td>401K</td></tr><tr><td>Thinking (synth)</td><td>General Reasoning Mixˆ</td><td>2.48B</td><td>668K</td><td>1.87B (1.87%)</td><td>732K</td></tr><tr><td>Thinking (synth)</td><td>Gemini Reasoning Tracesˆ</td><td>246M</td><td>55.2K</td><td>246M (0.25%))</td><td>85.1K</td></tr><tr><td>Thinking (synth)</td><td>Llama Nemotron Reasoning Tracesˆ</td><td>20.9B</td><td>3.91M</td><td>1.25B (1.25%)</td><td>368K</td></tr><tr><td>Thinking (synth)</td><td>OpenThoughts2 Reasoning Tracesˆ</td><td>5.6B</td><td>1.11M</td><td>1.25B (1.25%)</td><td>402K</td></tr><tr><td>Instruction (synth)</td><td>Tulu 3 SFTˆˆ</td><td>1.61B</td><td>1.95M</td><td>1.1B (1.1%)</td><td>1.45M</td></tr><tr><td>Instruction (synth)</td><td>Dolmino 1 Flanˆˆ</td><td>16.8B</td><td>56.9M</td><td>5.0B (5.0%)</td><td>14.8M</td></tr><tr><td>PDFs</td><td>olmOCR science PDFs (HQ subset)ˆ</td><td>240B</td><td>28.7M</td><td>4.99B (5.0%)</td><td>1.20M</td></tr><tr><td>Web pages</td><td>STEM-Heavy Crawlˆ</td><td>5.21B</td><td>5.16M</td><td>4.99B (5.0%)</td><td>5.53M</td></tr><tr><td>Web pages</td><td>Common Crawl (HQ subset)ˆ</td><td>1.32T</td><td>965M</td><td>22.4B (22.5%)</td><td>18.3M</td></tr><tr><td>Total</td><td></td><td>2.19T</td><td>2.52B</td><td>99.95B (100%)</td><td>236M</td></tr></tbody></table>

Table 5 Composition of the midtraining data (Dolma 3 Dolmino Mix). Here we show the full composition of the midtraining data mix. \*\*=newly-introduced synthetic dataset. \*=novel recreation of existing data. ˆˆ=reuse of previously-introduced data. ˆ=filtering or light transformation of existing external data.

表 5｜midtraining 数据 (Dolma 3 Dolmino Mix) 的构成. 这里给出 midtraining 数据混合的完整构成. \*\*=新引入的合成数据集. \*=对已有数据的全新复现. ˆˆ=复用先前引入的数据. ˆ=对已有外部数据的过滤或轻度变换.

![Image block](images/p21-figure-11-flow-for-midtraining-data-curation-we-employ.png)

Figure 11 Flow for midtraining data curation. We employ a distributed system of lightweight feedback loops to explore datasets for targeted boosts across capabilities, and combine these with centralized integration tests and SFT training for assessment of candidate mix quality (discussion in Section §3.5.1). Finally, we incorporate a newly-developed decontamination method, to ensure that our mix is not contaminated with evaluation data (discussion in Section §3.5.1).

图 11｜midtraining 数据策展流程. 我们用一套由轻量反馈回路组成的分布式系统探索数据集, 以便有针对性地提升各项能力, 并把它们与集中式集成测试和 SFT 训练相结合, 评估候选混合的质量 (讨论见第 §3.5.1 节). 最后, 我们纳入一种新开发的去污染方法, 确保混合中不含评测数据 (讨论见第 §3.5.1 节).

elements:

• A new two-part methodological framework combining 1) lightweight, distributed feedback loops on individual data sources, with 2) centralized integration tests to assess candidate mixes on base model quality and post-trainability.
• 一个新的两部分方法框架, 结合 1) 针对单个数据来源的轻量分布式反馈回路, 与 2) 集中式集成测试, 从 base 模型质量和可后训练性两方面评估候选混合.

• Expansion to targeted data curation efforts across code, math, and general knowledge QA domains (broadening from the math-focused efforts in OLMo 2 Dolmino Mix).
• 把有针对性的数据策展工作扩展到代码, 数学和通用知识 QA 领域 (而 OLMo 2 Dolmino Mix 主要集中在数学上).

<!-- page 22 of 118 -->

• More intentional inclusion of data types—instruction data and thinking traces—to lay groundwork for supporting post-training of Olmo 3 Think, Olmo 3 Instruct, and Olmo 3 RL-Zero models.
• 更有意识地纳入指令数据和 thinking traces 这类数据类型, 为 Olmo 3 Think, Olmo 3 Instruct 和 Olmo 3 RL-Zero 模型的后训练打基础.

The resulting midtraining data is a diverse mixture that combines novel synthetic sources with data from pretraining stage, but quality-filtered and rewritten to better suit capabilites we target at this stage. Through midtraining, we achieve improvements across the board in our target capability domains, as well as improvements in performance resulting from subsequent SFT training.

最终的 midtraining 数据是一个多样的混合, 把新的合成来源与预训练阶段的数据结合起来, 后者经过质量过滤和改写, 更贴合我们在这一阶段关注的能力. 通过 midtraining, 我们在目标能力领域上全面取得提升, 后续 SFT 训练带来的表现也随之提升.

#### 3.5.1 Methodological framework (3.5.1 方法框架)

**Targeted capability boosts** In the midtraining stage, we aim to make targeted improvements to capabilities spanning a wide range of domains: prioritizing significant gains in code and math, but also aiming for focused improvements in QA and general knowledge access capabilities, and to lay groundwork for instruction and thinking capabilities in post-training. This requires a lightweight, distributed framework for dataset testing, to allow us to investigate many domains of datasets efficiently and in parallel (Figure 11).

**有针对性的能力提升** 在 midtraining 阶段, 我们希望有针对性地提升覆盖广泛领域的能力: 优先在代码和数学上取得显著进步, 同时也在 QA 和通用知识获取能力上做聚焦改进, 并为后训练中的指令与思考能力打基础. 这需要一个轻量的分布式数据集测试框架, 以便高效, 并行地考察多个领域的数据集 (图 11).

For lightweight testing we use the microanneal methodology introduced with OLMo 2, which we further modify for more systematic baselining. For a standard microanneal we use the following setup: 1) select a target dataset, 2) sample 5B tokens, 3) match this with 5B web tokens, 4) anneal on the resulting 10B mix. We then compare the performance of the resulting checkpoint against that of a baseline microanneal on 10B web-only data, for a cheap and efficient assessment of the impact of the dataset on base model performance, over and above the impact of continued training on web data alone.<sup>13</sup>

轻量测试使用 OLMo 2 中引入的 microanneal 方法, 我们对它做了进一步修改, 让基线对比更系统. 一次标准的 microanneal 设置如下: 1) 选定目标数据集, 2) 采样 5B token, 3) 配上 5B Web token, 4) 在得到的 10B 混合上退火. 然后把得到的 checkpoint 与一个仅在 10B Web 数据上做的基线 microanneal 比较, 以低成本, 高效率地评估该数据集对 base 模型表现的影响, 且这种影响是在仅用 Web 数据继续训练的效果之外的额外影响.<sup>13</sup>

> 5B 目标数据 + 5B Web 退火 10B, 再与 10B web-only 基线比, 衡量的是 「仅用 Web 继续训练」 之外的额外影响, 不是 100B 正式跑. 脚注 13 还列了变体: 只够 2.5B 的数据集用 5B microanneal, 以及省掉算力匹配基线, 直接看单次退火增益的旧式做法.

This methodology allows us to make rapid, targeted assessments of the quality of datasets being considered for the midtraining mix, and to iterate on many data domains in parallel. Our workflow operates as follows: for each capability that we target for improvement (in categories of math, code, QA, instruction, and thinking), we generate or collect new datasets as candidates to boost performance for this capability; we assess each via microanneals—if the results are promising, new datasets can be incorporated into the larger integration tests described next.

这套方法可以快速, 有针对性地评估候选 midtraining 数据集的质量, 并在多个数据领域上并行迭代. 我们的工作流如下: 对每项要提升的能力 (分为数学, 代码, QA, 指令和思考几类), 我们生成或收集新数据集作为提升该能力的候选; 用 microanneal 逐个评估, 结果有希望的新数据集就可以纳入下面要介绍的更大的集成测试.

**Integration tests** In parallel with the microanneal process, we conduct integration tests involving full annealing runs on candidate mixes for the 100B-token midtraining mix. These integration tests evaluate how candidate data sources perform when combined together; further, we can assesss effect of longer 100B midtrain runs (as compared to shorted, 5–10B tokens used in microanneals).

**集成测试** 在 microanneal 流程之外, 我们并行开展集成测试, 在 100B token midtraining 混合的候选混合上跑完整的退火运行. 这些集成测试评估候选数据来源组合在一起时的表现; 此外, 我们还能评估更长的 100B midtrain 运行的效果 (相比 microanneal 中较短的 5–10B token).

Finally, checkpoints from integration runs can be quickly instruction-tuned and evaluated on the post-train eval suite; we use this additional step to verify that gains we observe in midtrain yield improvements beyond base model capabilities.

最后, 集成运行得到的 checkpoint 可以快速做指令微调, 并在后训练评测套件上评测; 我们用这一额外步骤验证 midtrain 中观察到的收益能否带来 base 模型能力之外的提升.

We run these integration tests periodically as we reach a critical mass of microanneal results for new candidate data sources. For each integration test, new sources that show promise in microanneals are incorporated into an updated 100B mix, retaining strong sources from previous iterations.

每当新候选数据来源的 microanneal 结果积累到足够数量, 我们就定期运行这些集成测试. 每次集成测试都会把在 microanneal 中表现有希望的新来源纳入更新后的 100B 混合, 同时保留之前迭代中表现强的来源.

We carry out five major rounds of integration tests; we report three in this manuscript: Round 1, Round 3, and Round 5. Round 5 folds in the newly-developed decontamination process (Section §3.5.3). For each mix we evaluate the resulting midtrained model on our OlmoBaseEval Main evaluation suite, and additionally run the midtrained model through SFT for post-training assessment.

我们共进行了五轮主要的集成测试, 本文报告其中三轮: 第 1 轮, 第 3 轮和第 5 轮. 第 5 轮纳入了新开发的去污染流程 (第 §3.5.3 节). 对每个混合, 我们在 OlmoBaseEval Main 评测套件上评测得到的 midtrained 模型, 并额外对其做 SFT, 用于后训练评估.

#### 3.5.2 Capability Improvements for Final Data Mix (3.5.2 最终数据混合的能力提升)

With Dolma 3 Dolmino Mix, we target five core capabilities during midtraining: improved math and coding, better knowledge elicitation through QA, and bootstrapping instruction following and reasoning ability ahead of post-training stages. To maintain continuity with pretraining, we keep web and PDF data from the first stage of Olmo 3, albeit after filtering for higher quality documents; this approach prevents excessive shift in

借助 Dolma 3 Dolmino Mix, 我们在 midtraining 中针对五项核心能力: 提升数学和编码, 通过 QA 更好地激发知识, 以及在后训练阶段之前为指令遵循和推理能力打底. 为了与预训练保持连续, 我们保留了 Olmo 3 第一阶段的 Web 和 PDF 数据, 只是经过了筛选以留下更高质量的文档; 这种做法可以防止

<small><span class="docvortex-page-footnote" data-block-type="page_footnote" style="color:#6b7280">13<sub>The</sub> microanneal framework allows for flexibility to test small datasets, and as a result the specifics of our microanneals varied based on dataset needs. Variants of the above include some 5B microanneals for datasets that could only support 2.5B tokens, some microanneals that test the target dataset as a smaller percentage of a more diverse 10B mix, and certain microanneals—for large numbers of comparisons between variable-size datasets—that use the original microanneal methodology omitting compute-matched baseline comparisons and assessing based on the individual annealing gains directly.</span></small>

<!-- page 23 of 118 -->

training data distribution. Table 5 outlines the composition of the final mix, which includes a combination of newly-introduced synthetic data and refinements of existing data. Below we give an overview, for each capability category, of our curation efforts and final selected data. Additional details are in Appendix A.3, and dataset descriptions and replication resources for novel datasets are provided in the Dolma 3 repository

训练数据分布发生过大偏移. 表 5 列出了最终混合的构成, 其中既有新引入的合成数据, 也有对已有数据的改进. 下面按能力类别概述我们的策展工作和最终选定的数据. 更多细节见附录 A.3, 新数据集的说明与复现资源见 Dolma 3 仓库

**Math capabilities** For math capability, we expand efforts from OLMo 2 Dolmino Mix. We consider a total of 25 data sources, which we evaluate over 80 microanneal runs. We ultimately settle on a combination of 5 top math-specific sources, 4 of which were newly synthesized. For high-performing existing datasets without permissive licensing, we synthesize new data modeled after those datasets.

**数学能力** 在数学能力上, 我们在 OLMo 2 Dolmino Mix 的基础上扩大了工作范围. 我们共考察了 25 个数据来源, 跑了 80 多次 microanneal 进行评估. 最终选定 5 个表现最好的数学专用来源的组合, 其中 4 个是新合成的. 对于表现好但许可不够宽松的已有数据集, 我们仿照它们合成新数据.

We will outline and briefly summarize the math-targeted data sources that are included in the final mix. More details about data generation procedure and microanneal results can be found in the Appendix.

下面列出并简要总结最终混合中纳入的数学数据来源. 数据生成流程和 microanneal 结果的更多细节见附录.

• Dolmino-1 math We include the entirety of the 10.7B-token OLMo 2 Dolmino Mix Math subset. The version we use differs from the original only in additional filtering for decontamination. As described for OLMo 2 OLMo et al. (2024), this set was generated to lift general-purpose math capabilities, measured in terms of improvements on the GSM8K test set. A 10B microanneal, using 5B of the available 10.7B tokens in isolation, achieves a lift in 10.4 points in MATH and 38.2 points in the GSM8K benchmark.<sup>15</sup>
• Dolmino-1 math 我们纳入了 10.7B token 的 OLMo 2 Dolmino Mix Math 子集的全部数据. 我们使用的版本与原版的唯一区别是为去污染做了额外过滤. 正如 OLMo 2 (OLMo et al., 2024) 中所述, 这个集合是为了提升通用数学能力而生成的, 以 GSM8K 测试集上的提升来衡量. 单独使用可用 10.7B token 中的 5B 做 10B microanneal, 在 MATH 上提升 10.4 分, 在 GSM8K 基准上提升 38.2 分.<sup>15</sup>

• TinyMATH For each of the 7500 examples in the MATH training set, we generate 100 new, similar problems. We then create Python code solutions to the newly for each problem (TinyMATH-PoT), and two flavors of conversational English discussing these solutions (TinyMATH-MIND). In aggregate, this yields 1.14B tokens of novel, synthetic data targeted to improve performance on the MATH benchmark. A microanneal consisting of all of these new tokens in a 50/50 ratio with web data yields 13.2 points of improvement in the MATH benchmark and 13.9 points in GSM8K.
• TinyMATH 对 MATH 训练集中 7500 个样本的每一个, 我们生成 100 道相似的新题. 然后为每道新题编写 Python 代码解答 (TinyMATH-PoT), 以及两种讨论这些解答的英文对话风格文本 (TinyMATH-MIND). 合计得到 1.14B token 的新合成数据, 目标是提升 MATH 基准上的表现. 把这些新 token 全部与 Web 数据按 50/50 比例组成 microanneal, 在 MATH 基准上提升 13.2 分, 在 GSM8K 上提升 13.9 分.

• CraneMath The recently published SwallowMath dataset (Fujii et al., 2025) demonstrates the potential of rewriting already finely-curated naturally-occurring mathematical web data—in this case, FineMath4+ (Allal et al., 2025). We corroborate this strong performance with a microanneal over SwallowMath that showed a lift of 16.0 points in MATH and 24.5 points in GSM8K using only 3.6B high quality tokens. Because SwallowMath comes with additional license restrictions—having been generated with the Llama suite of models—we generate an independent reproduction of SwallowMath by rewriting FineMath4+ with the SwallowMath prompt, using Qwen3 (Yang et al., 2025a) for generation. We denote this new mix as CraneMath, which yields 5.6B tokens of high-quality math. Microanneals demonstrate a lift of 18.5 points in MATH and 27.4 points in GSM8K.
• CraneMath 最近发布的 SwallowMath 数据集 (Fujii et al., 2025) 展示了改写已经精细策展的自然数学 Web 数据 (这里是 FineMath4+ (Allal et al., 2025)) 的潜力. 我们在 SwallowMath 上做 microanneal, 印证了它的强劲表现: 只用 3.6B 高质量 token, 就在 MATH 上提升 16.0 分, 在 GSM8K 上提升 24.5 分. 由于 SwallowMath 是用 Llama 系列模型生成的, 附带额外的许可限制, 我们用 SwallowMath 的提示词改写 FineMath4+, 用 Qwen3 (Yang et al., 2025a) 生成, 独立复现了 SwallowMath. 我们把这个新混合称为 CraneMath, 它提供 5.6B token 的高质量数学数据. microanneal 显示它在 MATH 上提升 18.5 分, 在 GSM8K 上提升 27.4 分.

• MegaMatt Similar to SwallowMath, Megamath-Web-Pro-Max (Wang et al., 2025) applies Llama rewrites to naturally-occurring mathematical web text—in this case a filtered version of MegaMath-Web (Zhou et al., 2025). Our microannealing procedure demonstrates that MegaMath-Web-Pro-Max was able to improve MATH by 7.0 points and GSM8K by 13.3 points using only 5B tokens of high-quality data. However, in order to use this dataset, we re-generate it using open source models. Specifically, we collect the Megamath-Web-Pro data occurring after June 2023, apply filtering as in Megamath-Web-Pro-Max, and rewrite it using Qwen3 (Yang et al., 2025a). This yields 3.88B tokens of high-quality data, which we refer to as MegaMatt. In microanneals, this data yields a lift of 8.0 points in MATH and 13.0 points in GSM8K.
• MegaMatt 与 SwallowMath 类似, Megamath-Web-Pro-Max (Wang et al., 2025) 用 Llama 改写自然数学 Web 文本, 这里用的是 MegaMath-Web (Zhou et al., 2025) 的过滤版本. 我们的 microanneal 流程表明, MegaMath-Web-Pro-Max 只用 5B token 高质量数据就能让 MATH 提升 7.0 分, GSM8K 提升 13.3 分. 不过, 为了使用这个数据集, 我们用开源模型重新生成了它. 具体来说, 我们收集 2023 年 6 月之后的 Megamath-Web-Pro 数据, 按 Megamath-Web-Pro-Max 的方式过滤, 再用 Qwen3 (Yang et al., 2025a) 改写. 由此得到 3.88B token 的高质量数据, 我们称之为 MegaMatt. 在 microanneal 中, 这份数据让 MATH 提升 8.0 分, GSM8K 提升 13.0 分.

**Code capabilities** Our efforts to improve code capabilities include two major threads: 1) curation of higherquality general code data, and 2) introduction of fill-in-the-middle (FIM) code capabilities. The top-performing datasets included in the final mix are the following:

**代码能力** 我们提升代码能力的工作有两条主线: 1) 策展更高质量的通用代码数据, 2) 引入 fill-in-the-middle (FIM) 代码能力. 最终混合中纳入的表现最好的数据集如下:

• Stack-Edu (FIM) We include a modified version of Stack-Edu, in which 50% of documents reflect fill-in-the-middle (FIM) transformation via the infilling procedure from StarCoder2 (Lozhkov et al., 2024). This transformation splits code documents into prefix, middle, and suffix segments in order to train on prediction of the concealed middle segment. To further improve the quality of this code data, we apply quality filtering by performing reservoir sampling and bucketing of documents based on educational value score, followed
• Stack-Edu (FIM) 我们纳入了 Stack-Edu 的一个修改版本, 其中 50% 的文档按 StarCoder2 (Lozhkov et al., 2024) 的填充流程做了 fill-in-the-middle (FIM) 变换. 这种变换把代码文档切分为前缀, 中间和后缀三段, 训练模型预测被隐藏的中间段. 为了进一步提升这部分代码数据的质量, 我们做了质量过滤: 基于教育价值分对文档做蓄水池采样和分桶, 随后

<small><span class="docvortex-page-footnote" data-block-type="page_footnote" style="color:#6b7280">14<a href="https://github.com/allenai/dolma3"><sub>github</sub>.com/allenai/dolma3</a></span></small>

<small><span class="docvortex-page-footnote" data-block-type="page_footnote" style="color:#6b7280">15<sub>Performance</sub> benefits seen in Math microanneals are stated in terms of improvement relative to a pre-anneal baseline.</span></small>

<small><span class="docvortex-page-footnote" data-block-type="page_footnote" style="color:#6b7280">16<sub>For</sub> educational value score we use language-specific classifiers provided developed for Hugging Face SmolLM model series, e.g. [huggingface.co/HuggingFaceTB/stack-edu-classifier-php](https://huggingface.co/HuggingFaceTB/stack-edu-classifier-php).</span></small>

<!-- page 24 of 118 -->

by weighted random sampling of the upper 20% of buckets from each language subset. Microanneals validate that this quality filtering combined with the sampling procedure improves code benchmark performance over both the natural distribution of Stack-Edu and more naive sampling procedures such as sampling the top document per language based on classifier score.

从每个语言子集质量最高的 20% 桶中加权随机采样. microanneal 验证了, 这种质量过滤结合采样流程, 在代码基准上的表现既优于 Stack-Edu 的自然分布, 也优于更朴素的采样流程, 例如按分类器分数为每种语言只取最高分的文档.

• CraneCode As with our math datasets, we find strong performance from the SwallowCode dataset, and generate a permissively-licensed recreation for use in our midtraining. Like Fujii et al. (2025), we source data from the Python subset of the-stack-v2-smol , then filter for syntax errors and filter based on linter outputs. Then, we apply the SwallowCode two-stage rewriting pipeline, with one stage to augment style, and another to optimize the code itself. This yields 18.8B tokens of high-quality python code. In a microanneal using 5B tokens of high-quality data, CraneCode results in a lift in HumanEval of 5.0 points relative to pre-anneal baseline, compared to the 10.3 seen for SwallowCode. When using a larger microanneal with 12.5B tokens of CraneCode, the lift in HumanEval improves to 13.5.
• CraneCode 与数学数据集一样, 我们发现 SwallowCode 数据集表现强劲, 于是生成了一个许可宽松的复现版本供 midtraining 使用. 与 Fujii et al. (2025) 一样, 我们从 the-stack-v2-smol 的 Python 子集获取数据, 然后过滤语法错误, 并根据 linter 输出过滤. 接着应用 SwallowCode 的两阶段改写流水线: 一个阶段增强代码风格, 另一个阶段优化代码本身. 由此得到 18.8B token 的高质量 Python 代码. 在使用 5B token 高质量数据的 microanneal 中, CraneCode 让 HumanEval 相对退火前基线提升 5.0 分, 而 SwallowCode 的提升为 10.3 分. 使用 12.5B token CraneCode 的更大 microanneal 时, HumanEval 的提升增加到 13.5 分.

**QA and knowledge access capabilities** We target improvements in question-answering and general knowledge access capabilities through synthesis of two novel datasets focused on particular QA capabilities, as well as inclusion of high-quality existing QA data. The final datasets included for these capabilities are the following:

**QA 与知识获取能力** 我们通过合成两个聚焦特定 QA 能力的新数据集, 并纳入高质量的已有 QA 数据, 来提升问答和通用知识获取能力. 最终为这些能力纳入的数据集如下:

• Reddit-to-Flashcards We synthesize this dataset in response to the need to handle diverse content categories and question structures in multiple-choice QA tasks. We first identify a subset of academically relevant subreddits, and then use GPT 4o-mini to rewrite submission-comment pairs from those subreddits into multiple-choice QA pairs. We use seven task formats to increase diversity. Microanneals show that inclusion of 5B tokens of this data in a 10B-token microanneal resulted in over 2 points of improvement in the MC<sub>Non-STEM</sub> task cluster—relative to a 10B-token web-only baseline microanneal—with 3 points of improvement in MMLU.
• Reddit-to-Flashcards 我们合成这个数据集, 是为了应对多选 QA 任务中多样的内容类别和题目结构. 我们先挑出一批与学术相关的 subreddit, 然后用 GPT 4o-mini 把这些 subreddit 中的 「帖子-评论」 对改写成多选 QA 对. 我们使用七种任务格式来增加多样性. microanneal 显示, 在 10B token 的 microanneal 中纳入 5B token 这份数据, 相对仅用 Web 数据的 10B token 基线 microanneal, 在 MC<sub>Non-STEM</sub> 任务簇上提升超过 2 分, 其中 MMLU 提升 3 分.

• Wiki-to-RCQA We synthesize this dataset in response to the need for improvements in passage-based reading comprehension QA. We collect Wikipedia passages and prompted Qwen2.5 32B Instruct to generate QA pairs based on these passages, meeting a range of constraints inspired by instructions given to annotators of reading comprehension QA datasets. Microanneals show that 4.2B tokens of this data in a 10B microanneal results in nearly 2 points of improvement in the GenQA task cluster relative to a 10B web-only baseline, with improvements focused on the DROP, SQuAD and CoQA reading comprehension QA benchmarks.
• Wiki-to-RCQA 我们合成这个数据集, 是为了提升基于段落的阅读理解 QA 能力. 我们收集 Wikipedia 段落, 提示 Qwen2.5 32B Instruct 基于这些段落生成 QA 对, 并满足一系列约束, 这些约束参考了阅读理解 QA 数据集给标注员的指令. microanneal 显示, 在 10B microanneal 中使用 4.2B token 这份数据, 相对仅用 Web 数据的 10B 基线, 在 GenQA 任务簇上提升近 2 分, 提升集中在 DROP, SQuAD 和 CoQA 这几个阅读理解 QA 基准上.

• Nemotron We include the “diverse QA pairs” synth subset of the Nemotron CC dataset (Su et al., 2025a), as, in microanneals, it improved GenQA tasks by 1.5 points, MC<sub>Non-STEM</sub> by 1.9 points, and it had equal MC<sub>STEM</sub> performance compared to a microanneal run of web documents from the top quality (5%) bucket. All other Nemotron synth subsets (“distill”, “extract knowledge”, “knowledge list”, and “wrap medium”) performed worse than natural data, so we did not use them.
• Nemotron 我们纳入了 Nemotron CC 数据集 (Su et al., 2025a) 的 「diverse QA pairs」 合成子集, 因为在 microanneal 中, 相比用质量最高 (前 5%) 桶的 Web 文档做的 microanneal, 它让 GenQA 任务提升 1.5 分, MC<sub>Non-STEM</sub> 提升 1.9 分, MC<sub>STEM</sub> 表现持平. Nemotron 其他所有合成子集 (「distill」, 「extract knowledge」, 「knowledge list」 和 「wrap medium」) 的表现都不如自然数据, 所以我们没有使用.

**Cross-Capability instruction data** To lay the groundwork for post-training, we include cross-domain instruction datasets to prime models for instruction-tuning.

**跨能力指令数据** 为了给后训练打基础, 我们纳入跨领域的指令数据集, 让模型为指令微调做好准备.

• Tulu3 SFT data We sample instruction data from the SFT set from Tülu 3. Compared to dataset released by Lambert et al. (2024), we lightly process these data as follows: 1) we use an expanded set of examples that were created and subsequently filtered out for the final Tülu 3 data, 2) instead of relying on post-train syntax, such as <|im\_start|> and <|im\_end|>, we concatenate messages using double newlines. We choose this format, rather than using special tokens after microanneal experiments comparing them. More details are provided in see discussion of special tokens in Section §3.5.4.
• Tulu3 SFT 数据 我们从 Tülu 3 的 SFT 集合中采样指令数据. 与 Lambert et al. (2024) 发布的数据集相比, 我们做了如下轻度处理: 1) 使用了一个扩充的样本集, 其中包括当初生成后又在最终 Tülu 3 数据中被过滤掉的样本; 2) 不使用 <|im\_start|> 和 <|im\_end|> 这类后训练语法, 而是用两个换行符拼接消息. 我们在 microanneal 实验中比较了这种格式与特殊 token, 最终选择了前者. 更多细节见第 §3.5.4 节关于特殊 token 的讨论.

• Flan Through microanneals, we also find the Flan dataset (Wei et al., 2021; Longpre et al., 2023) improves performance in QA tasks, and as a result included a subset of the Flan dataset in the final mix. We use same subset and preprocessing from OLMo 2 (OLMo et al., 2024).
• Flan 通过 microanneal, 我们还发现 Flan 数据集 (Wei et al., 2021; Longpre et al., 2023) 能提升 QA 任务表现, 因此在最终混合中纳入了 Flan 数据集的一个子集. 我们使用与 OLMo 2 (OLMo et al., 2024) 相同的子集和预处理.

**Cross-capability thinking traces** We also curate a diverse collection of thinking traces across a variety of domains to lay the foundation for Olmo 3 Think and Olmo 3 RL-Zero. This includes two new synthetic datasets, as well as rewritten and filtered versions of existing thinking trace datasets.

**跨能力 thinking traces** 我们还策展了一批覆盖多个领域的多样 thinking traces, 为 Olmo 3 Think 和 Olmo 3 RL-Zero 打基础. 其中包括两个新的合成数据集, 以及已有 thinking trace 数据集的改写和过滤版本.

<small><span class="docvortex-page-footnote" data-block-type="page_footnote" style="color:#6b7280">17<a href="https://huggingface.co/datasets/bigcode/the-stack-v2-train-smol-ids"><sub>huggingface</sub>.co/datasets/bigcode/the-stack-v2-train-smol-ids</a>, released by Lozhkov et al. (2024).</span></small>

<!-- page 25 of 118 -->

• Meta-reasoning The first of the two new datasets introduced in this work; we crate it to target seven core cognitive capabilities from Kargupta et al. (2025) that are foundational to mathematical and programming expertise: self-awareness (Toy et al., 2024; Callaway et al., 2022), evaluation (Fleming and Daw, 2017), goal management (Ackerman and Thompson, 2017; Griffiths et al., 2019), hierarchical organization (Haupt, 2018), backward chaining (Olieslagers et al., 2024), backtracking (Joyce, 2009), and conceptual reasoning (Markovits et al., 2015). These categories are inspired by work suggesting that meta-reasoning capabilities in base models may be associated with superior reinforcement learning trajectories (Kargupta et al., 2025; Gandhi et al., 2025). We express these capabilities into tasks that require levering meta-reasoning, such as backtracking from an answer back to its original math problem, or debugging a program. To generate our meta-reasoning data for each of these tasks, we synthetically augmented existing math (Luo et al., 2025a; Moshkov et al., 2025) and code (Li et al., 2023a; Hendrycks et al., 2021a; Ahmad et al., 2025) problems with detailed annotations such as ‘problem classification’, ‘difficulty analysis’, ‘solution approaches’, ‘common pitfalls’, and ‘verification methods’, modeled after the Pandalla-Math dataset. Using these annotations as foundation, we prompt GPT-4.1 and o4-mini to generate thinking traces for each capability-targeted task. Microanneals show that inclusion of this data results in substantial improvements to math and coding tasks, resulting in approximately 14 points of boost—relative to a strong math/code baseline microanneal—in Minerva Math, and 14 and 20 points of boost on Codex HumanEval and MBPP benchmarks, respectively.
• Meta-reasoning 这是本工作引入的两个新数据集中的第一个; 我们构建它是为了针对 Kargupta et al. (2025) 提出的七项核心认知能力, 这些能力是数学和编程专长的基础: 自我觉察 (Toy et al., 2024; Callaway et al., 2022), 评估 (Fleming and Daw, 2017), 目标管理 (Ackerman and Thompson, 2017; Griffiths et al., 2019), 层级组织 (Haupt, 2018), 逆向链推理 (Olieslagers et al., 2024), 回溯 (Joyce, 2009) 和概念推理 (Markovits et al., 2015). 这些类别的灵感来自一些研究, 它们表明 base 模型的元推理能力可能与更好的强化学习轨迹相关 (Kargupta et al., 2025; Gandhi et al., 2025). 我们把这些能力表达为需要调用元推理的任务, 例如从答案回溯到原始数学题, 或者调试程序. 为了给每类任务生成元推理数据, 我们对已有的数学题 (Luo et al., 2025a; Moshkov et al., 2025) 和代码题 (Li et al., 2023a; Hendrycks et al., 2021a; Ahmad et al., 2025) 做合成增强, 仿照 Pandalla-Math 数据集加入详细标注, 例如 '题目分类', '难度分析', '解题思路', '常见陷阱' 和 '验证方法'. 以这些标注为基础, 我们提示 GPT-4.1 和 o4-mini 为每个面向能力的任务生成 thinking traces. microanneal 显示, 纳入这份数据让数学和编码任务显著提升: 相对一个强的数学/代码基线 microanneal, Minerva Math 提升约 14 分, Codex HumanEval 和 MBPP 基准分别提升 14 分和 20 分.

• Program-verifiable data Our second new synthetic reasoning dataset consists of program-verifiable tasks (Zeng et al., 2025b) for which we can use a Python program to deterministically verify whether an answer to a problem is correct. Solving these problems naturally requires a wide range of meta-reasoning strategies that are well-suited to be learned during midtraining. We 1) programmatically generate these problems, 2) distill thinking traces from GPT-4.1 and o4-mini models, and 3) finally filter those for correctness using an output verifier (Python programs). Microanneals show that including about 250M verifiable data tokens (in a 5B microanneal) led to 1-2 points of improvement on math and code tasks, including GSM8K and MBPP, relative to a math/code microanneal baseline.
• Program-verifiable 数据 我们的第二个新合成推理数据集由可程序验证的任务 (Zeng et al., 2025b) 组成, 可以用 Python 程序确定性地验证某道题的答案是否正确. 解这些题自然需要多种元推理策略, 很适合在 midtraining 中学习. 我们 1) 以程序方式生成这些题目, 2) 从 GPT-4.1 和 o4-mini 模型蒸馏 thinking traces, 3) 最后用输出验证器 (Python 程序) 按正确性过滤. microanneal 显示, (在 5B microanneal 中) 纳入约 250M 可验证数据 token, 相对数学/代码 microanneal 基线, 在包括 GSM8K 和 MBPP 在内的数学与代码任务上提升 1-2 分.

• OMR rewrite full-thoughts We also consider 9 different versions of rewriting<sup>20</sup> of the OpenMathReasoning dataset (Moshkov et al., 2025), and find top performance for what we call the Full-Thoughts rewrite. This is a light rewrite of the OpenMathReasoning dataset, instructing GPT-4.1 to edit items for clarity, flow, and formatting (e.g., converting to LaTeX) while preserving all reasoning, explanations, and thoughts of the original. In microanneals, training on all 850M OMR Full-Thoughts tokens and an equal amount of web text, we see a lift of 5.5 points in the MATH benchmark and a 8.4 lift in GSM8K.
• OMR rewrite full-thoughts 我们还考察了 OpenMathReasoning 数据集 (Moshkov et al., 2025) 的 9 种不同改写版本<sup>20</sup>, 发现我们称为 Full-Thoughts 的改写表现最好. 这是对 OpenMathReasoning 数据集的轻度改写, 指示 GPT-4.1 在保留原文全部推理, 解释和思路的前提下, 编辑条目以提升清晰度, 连贯性和格式 (例如转换为 LaTeX). 在 microanneal 中, 用全部 850M OMR Full-Thoughts token 加等量 Web 文本训练, MATH 基准提升 5.5 分, GSM8K 提升 8.4 分.

• Existing thinking traces We also draw on a variety of existing synthetic thinking trace datasets, to which we apply a range of filtering steps to reduce noise and increase quality. These sources have coverage over a broad variety of domains, including math, code, natural sciences, social sciences, humanities, and puzzles. These datasets are listed in Table 5, and more details are provided in Appendix A.3. Microanneals show that inclusion of these datasets yielded improvements especially in math and code domains, with improvements of up to 8 points in GSM8K, and approximately 2 points in HumanEval and MBPP, relative to a math/code microanneal baseline.
• 已有 thinking traces 我们还利用了多个已有的合成 thinking trace 数据集, 并做了一系列过滤来降低噪声, 提高质量. 这些来源覆盖广泛领域, 包括数学, 代码, 自然科学, 社会科学, 人文和谜题. 这些数据集列在表 5 中, 更多细节见附录 A.3. microanneal 显示, 纳入这些数据集尤其在数学和代码领域带来提升: 相对数学/代码 microanneal 基线, GSM8K 最多提升 8 分, HumanEval 和 MBPP 提升约 2 分.

Table 10 provides further results showing the impacts of inclusion of instruction and thinking data in our midtraining mix, at the level of full integration tests.

表 10｜表 10 在完整集成测试层面给出了更多结果, 展示在 midtraining 混合中纳入指令数据和思考数据的影响.

**High quality web and PDF data** Finally, we include three types of web / pretraining data to avoid skewing too far from the pretraining distribution.

**高质量 Web 与 PDF 数据** 最后, 我们纳入三类 Web/预训练数据, 以免偏离预训练分布太远.

• Stage 1 web data We sample documents from the top two quality buckets (top 10% quality). We sample according to natural distribution, not the optimal ratio described in Appendix §A.2.4. In tests, the optimal ratio from the pretrain stage results in no improvement over natural distribution; since it introduce additional implementation complexity, we abandon it for the midtraining stage.
• 第 1 阶段 Web 数据 我们从质量最高的两个桶 (质量前 10%) 中采样文档. 采样按自然分布进行, 而不是附录 §A.2.4 中描述的最优比例. 测试中, 预训练阶段的最优比例相比自然分布没有带来提升; 而且它会增加实现复杂度, 所以我们在 midtraining 阶段放弃了它.

<small><span class="docvortex-page-footnote" data-block-type="page_footnote" style="color:#6b7280">18<sub>See</sub> Appendix Tables 43 and 44 for list of tasks, and [github.com/allenai/dolma3/tree/main/datasets/dolma3\_dolmino\_ mix/meta-reasoning](https://github.com/allenai/dolma3/tree/main/datasets/dolma3_dolmino_mix/meta-reasoning) for the prompts.</span></small>

<small><span class="docvortex-page-footnote" data-block-type="page_footnote" style="color:#6b7280">20<sub>Documentation</sub> for this approach, including all prompts, is available at [github.com/allenai/dolma3/datasets/dolma3\_ dolmino\_mix/open\_math\_reasoning\_rewrites](https://github.com/allenai/dolma3/tree/main/datasets/dolma3_dolmino_mix/open_math_reasoning_rewrites).</span></small>

<!-- page 26 of 118 -->

• Stage 1 olmOCR science PDFs From our PDF documents (Section §3.4.2) we create a further filtered version, which we use both for midtraining and for long-context extension. Instead of discussing details here, the reader will have to hold their breath till Section §3.6.1. This creates tension in the manuscript, giving them something to look forward to.
• 第 1 阶段 olmOCR science PDFs 我们从 PDF 文档 (第 §3.4.2 节) 中构建了一个进一步过滤的版本, 既用于 midtraining, 也用于长上下文扩展. 细节这里先不讲, 读者得屏住呼吸等到第 §3.6.1 节. 这给全文制造了一点悬念, 让读者有所期待.

• Stem-heavy crawl We also create a separate high-quality web collection, crawled between September 12, 2024 and June 3rd, 2025 using our in-house crawler. The crawler ingested scientific, educational, and general domains based on domain-level seeds sourced from manual lists of websites deemed high value. We use same crawling policy described as olmOCR science PDFs (Section §3.4.2). Through microanneal experiments, we choose to filter this set using the quality classifier introduced in Section §3.4.1; in detail, we use a threshold score of 0.6, which corresponds to the top 2.83% of the data we crawled, and would make put these sources in the top 0.79% of web data in the Dolma 3 pool. Relative to a web-only baseline, our crawled data yields an improvement of approximately 2 points each for MC<sub>Non-STEM</sub>, MC<sub>STEM</sub>, and Math subsets of OlmoBaseEval.
• STEM-heavy crawl 我们还构建了一个单独的高质量 Web 数据集, 由自研爬虫在 2024 年 9 月 12 日至 2025 年 6 月 3 日期间抓取. 爬虫以域名级种子为起点, 种子来自人工整理的高价值网站列表, 抓取科学, 教育和通用领域的内容. 我们使用与 olmOCR science PDFs (第 §3.4.2 节) 相同的抓取政策. 通过 microanneal 实验, 我们决定用第 §3.4.1 节介绍的质量分类器过滤这个数据集; 具体来说, 我们使用 0.6 的阈值分数, 对应所抓取数据的前 2.83%, 这相当于把这些来源放在 Dolma 3 数据池 Web 数据的前 0.79%. 相对仅用 Web 数据的基线, 我们抓取的数据在 OlmoBaseEval 的 MC<sub>Non-STEM</sub>, MC<sub>STEM</sub> 和 Math 子集上各提升约 2 分.

#### 3.5.3 Decontamination (3.5.3 去污染)

Earlier Olmo models have enabled research on benchmark contamination in base model training, such as decontamination of perplexity evaluations (Magnusson et al., 2024) or measuring the impact of quality filters on evaluation leakage (Godey et al., 2025). In Olmo 3 midtraining we use a decontamination tool to ensure minimal contamination with evaluation datasets. We focus our decontamination efforts on the midtraining stage (and the long-context extension, which drew from the same data pools) in light of results suggesting that memorization occurs most strongly near the end of training (Magar and Schwartz, 2022; Bordt et al., 2024).

早期的 Olmo 模型推动了 base 模型训练中基准污染的研究, 例如困惑度评测的去污染 (Magnusson et al., 2024), 以及衡量质量过滤器对评测泄漏的影响 (Godey et al., 2025). 在 Olmo 3 的 midtraining 中, 我们用一个去污染工具确保与评测数据集的污染降到最低. 有研究表明记忆效应在训练接近尾声时最强 (Magar and Schwartz, 2022; Bordt et al., 2024), 因此我们把去污染工作集中在 midtraining 阶段 (以及取自相同数据池的长上下文扩展阶段).

**Method and tooling** For decontamination, we search for and remove matches of any split of any benchmark dataset that are part of in our evaluation harness, as for some we increased sample size by evaluating on training splits. We detect and remove contamination between midtraining data and benchmark documents by developing a new decon package . Briefly, decon operates in two phases:

**方法与工具** 做去污染时, 我们搜索并移除与评测框架中任一基准数据集任一划分相匹配的内容, 因为对某些基准我们通过在训练划分上评测来扩大样本量. 我们开发了一个新的 decon 包, 用来检测并移除 midtraining 数据与基准文档之间的污染. 简单来说, decon 分两个阶段运行:

1. Detection phase For each midtraining document, decon samples n-grams at a regular stride, checking 22 whether the current n-gram matches known n-gram for any benchmark in the evaluation suite

1. 检测阶段 对每篇 midtraining 文档, decon 按固定步长采样 n-gram, 检查 22 当前 n-gram 是否与评测套件中任一基准的已知 n-gram 匹配

2. Cluster expansion phase If a match is found, the matching text is expanded on both sides, counting the number of adjacent ngrams that are also contaminated; if the value is above a specified threshold, the document is deemed contaminated removed.

2. 簇扩展阶段 如果找到匹配, 就向匹配文本两侧扩展, 统计相邻 n-gram 中同样被污染的数量; 如果该值超过指定阈值, 就判定文档受污染并将其移除.

The two phases approach is key for efficiency: detection phase checks at non-overlapping intervals to speed up processing, while the cluster expansion phase thoroughly checks for matches to compute an accurate contamination score.

两阶段设计是效率的关键: 检测阶段按不重叠的间隔检查, 以加快处理速度; 簇扩展阶段则彻底检查匹配, 以计算准确的污染分数.

We tune the contamination score to balance precision and recall based on numerous qualitative review.

我们根据大量定性审查来调整污染分数, 在精确率与召回率之间取得平衡.

We iteratively refine our decontamination protocol; For example, the first version fails to decontaminate against SQuAD v2 due to a preprocessing issue; DROP is also incorrectly processed due to its short-questionabout-a-passage format. We address these issues by evaluating question, answer, and passage components separately—matching primarily on questions, but using answer/passage matches as supporting information for shorter or edited questions. We also improve precision for multiple-choice evals by matching against full answers rather than just A/B/C/D labels. The decon repository includes configuration files that reproduce both the earlier and final approaches. Appendix A.5 provides a detailed overview of decon.

我们迭代改进了去污染协议. 例如, 第一个版本由于预处理问题, 没能对 SQuAD v2 去污染; DROP 由于其 「针对段落提一个短问题」 的格式, 也被错误处理. 我们通过分别评估问题, 答案和段落三部分来解决这些问题: 主要按问题匹配, 对较短或被编辑过的问题, 再用答案/段落的匹配作为辅助信息. 对多选评测, 我们匹配完整答案而不只是 A/B/C/D 标签, 以提高精确率. decon 仓库包含能复现早期方案和最终方案的配置文件. 附录 A.5 详细介绍了 decon.

#### 3.5.4 Key findings (3.5.4 关键发现)

Our two-part methodological framework for evaluating midtraining enables us to track closely the quality of our candidate mixes and the behaviors of individual data sources in interaction with others. Here we detail some of the key findings from that process.

我们评估 midtraining 的两部分方法框架, 借此可以密切跟踪候选混合的质量, 以及各数据来源与其他来源相互作用时的行为. 这一过程中的一些关键发现.

<small><span class="docvortex-page-footnote" data-block-type="page_footnote" style="color:#6b7280">21 <a href="https://github.com/allenai/decon"><sub>github</sub>.com/allenai/decon</a></span></small>

<small><span class="docvortex-page-footnote" data-block-type="page_footnote" style="color:#6b7280">22<sub>We</sub> decontaminate against all benchmarks in the OLMES package: [github.com/allenai/olmes](https://github.com/allenai/olmes)</span></small>

<!-- page 27 of 118 -->

<table><tr><td rowspan="2">Mix</td><td colspan="7">OlmoBaseEval</td><td rowspan="2">SFT Exps Avg</td></tr><tr><td>Avg</td><td> $MC_{STEM}$ </td><td> $MC_{Non-STEM}$ </td><td>GenQA</td><td>Math</td><td>Code</td><td>FIM</td></tr><tr><td>Round 1</td><td>49.7</td><td>64.3</td><td>75.2</td><td>68.3</td><td>47.4</td><td>23.4</td><td>28.4</td><td>35.2</td></tr><tr><td>Round 3</td><td>50.7</td><td>64.9</td><td>75.7</td><td>68.1</td><td>48.7</td><td>24.4</td><td>31.9</td><td>35.3</td></tr><tr><td>Round 5</td><td>53.1</td><td>65.3</td><td>76.1</td><td>70.8</td><td>57.1</td><td>27.7</td><td>29.4</td><td>37.3</td></tr></table>

Table 6 Performance across candidate 100B-token midtraining mixes on the OlmoBaseEval Main suite, and in evals after subsequent SFT. We highlight three of our five total candidate mixes to provide a representative illustration of the improvement trajectory. We see that our data curation framework yields improvements across the board from our first candidate mix to our last. (Discussion in Section §3.5.4.)

表 6｜各候选 100B token midtraining 混合在 OlmoBaseEval Main 套件上的表现, 以及后续 SFT 之后的评测表现. 我们从总共五个候选混合中挑出三个, 以代表性地说明改进轨迹. 可以看到, 我们的数据策展框架从第一个候选混合到最后一个带来了全面提升. (讨论见第 §3.5.4 节.)

<table><tr><td rowspan="2">Mix</td><td colspan="6">OlmoBaseEval</td></tr><tr><td> $MC_{STEM}$ </td><td> $MC_{Non-STEM}$ </td><td>GenQA</td><td>Math</td><td>Code</td><td>FIM</td></tr><tr><td>Gen-QA mix</td><td>66.3</td><td>78.1</td><td>72.5</td><td>27.5</td><td>11.9</td><td>0.1</td></tr><tr><td>Math-code-thinking mix</td><td>62.5</td><td>69.6</td><td>65.9</td><td>60.8</td><td>35.6</td><td>37.7</td></tr><tr><td>Round 5 (final mix)</td><td>66.4</td><td>77.4</td><td>73.1</td><td>57.3</td><td>31.2</td><td>31.7</td></tr></table>

Table 7 Demonstration of tradeoffs in domain-skewed mixes using the OlmoBaseEval Main suite. Increasing weight of math and code domains in the mix improves performance in these domains—however, it comes at significant cost to MCQA and GenQA performance. Increasing weight on GenQA domains, on the other hand, yields minimal improvement on MCQA and GenQA tasks, while hurting math and code performance. (Discussion in Section §3.5.4.)

表 7｜用 OlmoBaseEval Main 套件展示偏向特定领域的混合中的权衡. 提高数学和代码领域在混合中的权重能提升这些领域的表现, 但会显著损害 MCQA 和 GenQA 表现. 反过来, 提高 GenQA 领域的权重, 对 MCQA 和 GenQA 任务的提升很小, 却会损害数学和代码表现. (讨论见第 §3.5.4 节.)

**Candidate mix quality improves over time** Our integration tests allows us to verify progressive improvements in our candidate midtraining mixes over time: Table 6 shows this improvement across a sample of three candidate mixes illustrating the development trajectory. (Since midtraining development operates in tandem with pretraining, we develop mixes on earlier pretrained checkpoints—thus the comparisons here are given to illustrate progress in data curation, and should not be confused with final midtraining numbers.)

**候选混合的质量随时间提升** 集成测试可以验证候选 midtraining 混合随时间逐步改进: 表 6 用三个候选混合的样本展示了这一改进, 说明了开发轨迹. (由于 midtraining 开发与预训练同步进行, 我们是在较早的预训练 checkpoint 上开发混合的; 因此这里的比较只用于说明数据策展的进展, 不应与最终 midtraining 数字混淆.)

We see in Table 6 that across all base model metrics, as well as in evaluations of subsequent SFT training, newer candidate mixes consistently improve performance. Notably, between Round 3 and Round 5 we also introduce our decontamination process, which means that the gains of Round 5 relative to Round 1 and Round 3 are likely underestimated in this table, given that only Round 5 reflects decontaminated data.

从表 6 可以看到, 在所有 base 模型指标以及后续 SFT 训练的评测上, 较新的候选混合都持续提升了表现. 值得注意的是, 我们在第 3 轮和第 5 轮之间还引入了去污染流程, 由于只有第 5 轮使用了去污染后的数据, 这张表可能低估了第 5 轮相对第 1 轮和第 3 轮的收益.

**Performance shows substantial domain tradeoffs** Alongside our central integration tests, we also conduct exploratory 100B anneals with heavy skews toward particular domains, to better understand domain tradeoffs. We treat code/math/thinking capabilities as one domain group, and generative/QA capabilities as another domain group—and create modified mixes each prioritizing one of these groups while omitting the other. Our Gen-QA mix increases proportions of web, QA, and instruction data while omitting math, code, and thinking, and our math-code-thinking mix increases proportions of math, code, and thinking data while omitting QA and instruction data (but keeping web to avoid excessive skew away from pretraining distribution).

**表现存在明显的领域权衡** 在核心集成测试之外, 我们还做了探索性的 100B 退火, 这些退火大幅偏向特定领域, 以便更好地理解领域之间的权衡. 我们把代码/数学/思考能力视为一个领域组, 把生成/QA 能力视为另一个领域组, 并构建修改过的混合, 每个混合优先其中一组而省略另一组. Gen-QA 混合提高了 Web, QA 和指令数据的比例, 省略了数学, 代码和思考数据; math-code-thinking 混合提高了数学, 代码和思考数据的比例, 省略了 QA 和指令数据 (但保留 Web 数据, 以免偏离预训练分布过远).

Table 7 shows results from these runs, compared against our final Round 5 midtraining mix. We see that training on our Gen-QA mix results in a substantial drop in math and code performance, while approximately matching the final mix in MC<sub>STEM</sub>, MC<sub>Non-STEM</sub>, and GenQA performance. By contrast, in our math-codethinking mix, math and code performance substantially exceeds that of our final mix—however, MC<sub>STEM</sub>, MC<sub>Non-STEM</sub>, and GenQA performance take a notable hit.

表 7｜表 7 给出了这些运行的结果, 并与最终的第 5 轮 midtraining 混合比较. 可以看到, 在 Gen-QA 混合上训练会导致数学和代码表现大幅下降, 而在 MC<sub>STEM</sub>, MC<sub>Non-STEM</sub> 和 GenQA 上的表现与最终混合大致持平. 相比之下, 在 math-code-thinking 混合中, 数学和代码表现明显超过最终混合, 但 MC<sub>STEM</sub>, MC<sub>Non-STEM</sub> 和 GenQA 表现明显受损.

These results indicate that there are real tradeoffs when skewing toward certain of these domains over others during midtraining. We see in particular that there is clear potential to further improve math and code performance by increasing weight of these domains in the mix—however, this comes at a significant cost to our MCQA and GenQA performance. Increasing weight on Gen-QA domains, on the other hand, yields minimal improvement on QA tasks, while predictably hurting math and code performance. Overall, these results suggest that our final midtraining mix strikes a healthy balance across these domains, avoiding too heavy of a domain skew and enabling strong final performance across metrics.

这些结果表明, 在 midtraining 中偏向某些领域而冷落其他领域时, 确实存在权衡. 尤其可以看到, 提高数学和代码领域在混合中的权重, 显然还有进一步提升数学和代码表现的空间, 但这会显著损害 MCQA 和 GenQA 表现. 反过来, 提高 Gen-QA 领域的权重, 对 QA 任务的提升很小, 同时可以预见地损害数学和代码表现. 总体而言, 这些结果说明我们最终的 midtraining 混合在这些领域之间取得了健康的平衡, 避免了过重的领域偏向, 在各项指标上都获得了强劲的最终表现.

<!-- page 28 of 118 -->

<table><tr><td rowspan="2">Mix</td><td rowspan="2">MMLU</td><td rowspan="2">ARC</td><td rowspan="2">GenQA</td><td colspan="5">Select benchmarks from OlmoBaseEval</td></tr><tr><td>BasicSkills</td><td>GSM8K</td><td>Minerva</td><td>MultiPL-EMBPP</td><td>HumanEval</td></tr><tr><td>Web-only</td><td>55.6</td><td>78.1</td><td>53.4</td><td>80.4</td><td>22.4</td><td>6.1</td><td>9.6</td><td>16.0</td></tr><tr><td>Reddit</td><td>58.8</td><td>80.7</td><td>52.5</td><td>79.9</td><td>21.2</td><td>4.5</td><td>11.2</td><td>14.5</td></tr></table>

Table 8 Microanneal-level domain tradeoffs: Reddit-to-Flashcards (10B microanneal, web-only baseline). We see domain tradeoffs at the level of individual sources as well: the Reddit-to-Flashcards dataset yields strong boosts in MCQA tasks and some code tasks, but decreases performance in math and GenQA tasks. (Discussion in Section §3.5.4.)

表 8｜microanneal 层面的领域权衡: Reddit-to-Flashcards (10B microanneal, 仅 Web 基线). 单个数据来源层面同样存在领域权衡: Reddit-to-Flashcards 数据集在 MCQA 任务和部分代码任务上带来明显提升, 但降低了数学和 GenQA 任务的表现. (讨论见第 §3.5.4 节.)

<table><tr><td rowspan="2">Mix</td><td colspan="8">Select benchmarks from OlmoBaseEval</td></tr><tr><td>MMLU</td><td>ARC</td><td>GenQA</td><td>BasicSkills</td><td>GSM8K</td><td>Minerva</td><td>MBPP</td><td>HumanEval</td></tr><tr><td>Web-only</td><td>55.2</td><td>77.6</td><td>53.7</td><td>80.9</td><td>18.4</td><td>6.3</td><td>6.2</td><td>7.9</td></tr><tr><td>Reasoning</td><td>53.7</td><td>77.7</td><td>52.9</td><td>82.9</td><td>26.8</td><td>13.6</td><td>12.6</td><td>19.5</td></tr></table>

Table 9 Microanneal-level domain tradeoffs: meta-reasoning and program-verifiable reasoning (5B microanneal, web-only baseline). We see domain tradeoffs for reasoning datasets as well: adding the meta-reasoning and programverifiable data yields significant improvement in math and code tasks, but some performance drop in generative and MCQA tasks. (Discussion in Section §3.5.4.)

表 9｜microanneal 层面的领域权衡: meta-reasoning 与 program-verifiable 推理 (5B microanneal, 仅 Web 基线). 推理数据集同样存在领域权衡: 加入 meta-reasoning 和 program-verifiable 数据在数学和代码任务上带来显著提升, 但生成任务和 MCQA 任务的表现有所下降. (讨论见第 §3.5.4 节.)

> Reddit-to-Flashcards 抬 MCQA/部分 code, 伤 math/GenQA; meta-reasoning 与 program-verifiable 抬 math/code, 伤部分 GenQA/MCQA.

We also see these domain tradeoffs at the individual source level, observable in results from microanneals. Table 8 shows a microanneal comparison for the Reddit-to-Flashcards dataset, which relative to the web-only baseline yields improvement for multiple choice tasks, as well as a boost for certain code tasks, but results in some performance decrease in math and GenQA tasks. Conversely, in Table 9 we see that our novel synthetic reasoning data—meta-reasoning and program-verifiable reasoning—yields significant improvement in math and code tasks, but results in some performance drop on certain GenQA and MCQA tasks.

这些领域权衡在单个数据来源层面也存在, 从 microanneal 的结果中就能看出来. 表 8 给出了 Reddit-to-Flashcards 数据集的 microanneal 对比: 相对仅 Web 基线, 它提升了多选任务, 也提升了某些代码任务, 但在数学和 GenQA 任务上表现有所下降. 反过来, 从表 9 可以看到, 我们新合成的推理数据 (meta-reasoning 与 program-verifiable 推理) 在数学和代码任务上带来显著提升, 但在某些 GenQA 和 MCQA 任务上表现有所下降.

**Thinking/instruct data benefits base performance** We also investigate the overall impact of inclusion of our post-training-oriented data—instruction and thinking trace data—through 100B integration tests on one of our intermediate midtraining mixes both with and without inclusion of these data subsets (holding total mix tokens constant). Table 10 shows base eval performance after each of these training runs—we see that the mix that includes these post-training elements performs better on every base eval measure. This suggests that although individual sources and domains present performance tradeoffs, the inclusion of these cross-domain post-training data types in aggregate is consistently beneficial, and this benefit begins even before post-training.

**思考/指令数据有益于 base 表现** 我们还考察了纳入面向后训练的数据 (指令数据与 thinking trace 数据) 的整体影响: 在一个中间版 midtraining 混合上做 100B 集成测试, 分别纳入和不纳入这些数据子集 (保持混合总 token 数不变). 表 10 给出了这些训练运行后的 base 评测表现, 可以看到, 纳入这些后训练元素的混合在每一项 base 评测指标上都更好. 这说明, 尽管单个来源和领域之间存在表现权衡, 但整体纳入这些跨领域的后训练数据类型始终是有益的, 而且这种益处在后训练之前就已开始显现.

**Leave special tokens for SFT stage** To inform our formatting for instruction datasets, we also conduct an investigation to determine the impacts of inclusion or omission of special chat tokens such as <|im\_start|> and <|im\_end|> in our midtraining data. We test this via microanneals on the Tulu3-SFT data, comparing versions with and without these tokens. Experiments show that when training on data containing chat templates and special tokens, models consistently output these special tokens at inference time, resulting in evaluation scores that are dramatically reduced (e.g. GSM8K drops from 49.43 to 0, and CruxEval drops from 32.89 to 18.91). Further analysis highlights that simply including a chat template, with ordinary text in place of special tokens, did not produce the same performance drop (46.02 on GSM8K and 29.65 on CruxEval), suggesting that this disruption in model behavior is not due to inclusion of a chat template more generally, but is rather due specifically to the introduction of special tokens to the embedding vocabulary when they have not been seen in pretraining.

**把特殊 token 留到 SFT 阶段** 为了确定指令数据集的格式, 我们还研究了在 midtraining 数据中纳入或省略 <|im\_start|> 和 <|im\_end|> 这类特殊聊天 token 的影响. 我们在 Tulu3-SFT 数据上做 microanneal, 比较带与不带这些 token 的版本. 实验表明, 在含有聊天模板和特殊 token 的数据上训练后, 模型在推理时会持续输出这些特殊 token, 导致评测分数大幅下降 (例如 GSM8K 从 49.43 降到 0, CruxEval 从 32.89 降到 18.91). 进一步分析显示, 只保留聊天模板, 但用普通文本代替特殊 token, 并不会造成同样的表现下降 (GSM8K 为 46.02, CruxEval 为 29.65). 这说明模型行为的紊乱并非来自一般意义上的聊天模板, 而是特别来自把预训练中从未见过的特殊 token 引入嵌入词表.

Though the degradation in model evaluation scores can be attributed primarily to disruption in answer parsing, these results highlight the broader issue that inclusion of these tokens at midtraining time results in emission of these tokens by the base model at inference time. Since this is an undesirable behavior, we ultimately remove both the chat template and special tokens from our instruct data, and revert to simple newline-based formatting.

虽然模型评测分数的下降主要可归因于答案解析被打乱, 但这些结果揭示了一个更普遍的问题: 在 midtraining 阶段纳入这些 token, 会导致 base 模型在推理时输出它们. 这是不希望出现的行为, 因此我们最终从指令数据中去掉了聊天模板和特殊 token, 改回简单的基于换行的格式.

**Extent and impact of decontamination are variable** Figure 12 shows the top ten midtraining data sources containing the most occurrences of benchmark contamination. We find that much of the contamination occurs

**去污染的范围和影响因情况而异** 图 12 展示了基准污染出现次数最多的十个 midtraining 数据来源. 我们发现大量污染出现在

<!-- page 29 of 118 -->

<table><tr><td rowspan="2">Model</td><td colspan="7">OImoBaseEval</td></tr><tr><td>Avg</td><td> $MC_{STEM}$ </td><td> $MC_{Non-STEM}$ </td><td>GenQA</td><td>Math</td><td>Code</td><td>FIM</td></tr><tr><td>No thinking traces/instruction</td><td>48.8</td><td>63.6</td><td>74.0</td><td>66.7</td><td>43.1</td><td>23.3</td><td>29.2</td></tr><tr><td>Full mix</td><td>50.7</td><td>64.9</td><td>75.7</td><td>68.1</td><td>48.7</td><td>24.4</td><td>31.9</td></tr></table>

Table 10 Effect of thinking traces and instruction data on OlmoBaseEval.“Full mix” is “Round 3” from Table 6. The mix that includes instruction and thinking data performs better across base eval measures, suggesting that inclusion of these data types is beneficial even before post-training. (Discussion in Section §3.5.4.)

表 10｜thinking traces 与指令数据对 OlmoBaseEval 的影响. 「Full mix」 即表 6 中的 「Round 3」. 纳入指令与思考数据的混合在各项 base 评测指标上都更好, 说明即便在后训练之前, 纳入这些数据类型也是有益的. (讨论见第 §3.5.4 节.)

在控制总 token 的 100B 对照里, 含 instruction 与 thinking 的 mix 在各项 OlmoBaseEval 上全面更好.

<table><tr><td rowspan="10">Midtraining Data Sources</td><td rowspan="10">Total contam</td><td colspan="4">Evaluated splits:</td><td colspan="9">Val/Test</td><td colspan="8">All</td><td></td></tr><tr><td>Perf Δ</td><td>1.7</td><td>2.0</td><td>-1.2</td><td>-1.6</td><td>13.9</td><td>0.4</td><td>-0.4</td><td>-2.4</td><td>0.6</td><td>-0.1</td><td>-0.7</td><td>-0.0</td><td>0.6</td><td>0.9</td><td>-1.4</td><td>0.0</td><td>1.4</td><td>-0.3</td><td>1.8</td><td>1.1</td><td></td></tr><tr><td>% contam</td><td>27%</td><td>50%</td><td>4%</td><td>100%</td><td>9%</td><td>2%</td><td>2%</td><td>2%</td><td>2%</td><td>0%</td><td>5%</td><td>1%</td><td>24%</td><td>3%</td><td>6%</td><td>3%</td><td>2%</td><td>13%</td><td>3%</td><td>2%</td><td></td></tr><tr><td>SQUAD</td><td>Minerva</td><td>MMLU (MC)</td><td>GSM8K</td><td>DROP</td><td>CoQA (MC)</td><td>HumEval (@16)</td><td>DROP (MC)</td><td>LAMBADA</td><td>MedMCOA (MC)</td><td>MedQA En (MC)</td><td>SQUAD (MC)</td><td>LeetCode (@16)</td><td>M-E-HumEval (@16)</td><td>Jeopardy</td><td>HellaSwag</td><td>CoQA</td><td>ARC (MC)</td><td>PIQA (MC)</td><td>CSQA (MC)</td><td>SciQ (MC)</td><td></td></tr><tr><td>Common Crawl (High Q.)</td><td>2e3</td><td>0</td><td>0</td><td>0</td><td>0</td><td>0</td><td>0</td><td>0</td><td>0</td><td>0</td><td>0</td><td>0</td><td>0</td><td>0</td><td>2e3</td><td>50</td><td>0</td><td>256</td><td>0</td><td>1</td><td>119</td></tr><tr><td>StackEdu (FIM)</td><td>876</td><td>0</td><td>0</td><td>0</td><td>0</td><td>0</td><td>0</td><td>0</td><td>0</td><td>0</td><td>0</td><td>0</td><td>0</td><td>0</td><td>792</td><td>0</td><td>0</td><td>24</td><td>0</td><td>1</td><td>58</td></tr><tr><td>Gemini Reasoning Traces</td><td>606</td><td>0</td><td>513</td><td>31</td><td>0</td><td>0</td><td>0</td><td>0</td><td>0</td><td>0</td><td>43</td><td>0</td><td>19</td><td>0</td><td>0</td><td>0</td><td>0</td><td>0</td><td>0</td><td>0</td><td>0</td></tr><tr><td>OLMOCR Science PDFs (High Q.)</td><td>554</td><td>0</td><td>0</td><td>0</td><td>0</td><td>0</td><td>0</td><td>0</td><td>0</td><td>0</td><td>0</td><td>0</td><td>0</td><td>0</td><td>97</td><td>4</td><td>1</td><td>390</td><td>0</td><td>19</td><td>33</td></tr><tr><td>Sponge</td><td>308</td><td>0</td><td>0</td><td>0</td><td>0</td><td>0</td><td>0</td><td>0</td><td>0</td><td>0</td><td>0</td><td>0</td><td>0</td><td>0</td><td>38</td><td>1</td><td>0</td><td>190</td><td>0</td><td>0</td><td>79</td></tr><tr><td>General Reasoning Mix</td><td>113</td><td>0</td><td>6</td><td>68</td><td>3</td><td>0</td><td>0</td><td>0</td><td>0</td><td>0</td><td>5</td><td>0</td><td>0</td><td>0</td><td>0</td><td>0</td><td>0</td><td>4</td><td>0</td><td>27</td><td>0</td></tr></table>

Figure 12 Occurrences of benchmark instances in 10 most contaminated midtraining sources. We decontaminate against all splits of all benchmarks, as some (right) include training data when evaluated to reduce noise. Some but not all contaminated benchmarks show substantial Perf ∆ between contaminated and decontaminated runs (discussion in Section §3.5.4).

图 12｜10 个污染最严重的 midtraining 来源中基准样本的出现次数. 我们针对所有基准的所有划分做去污染, 因为有些基准 (右侧) 为降低噪声, 评估中会纳入训练数据. 部分 (而非全部) 被污染的基准在污染运行与去污染运行之间有明显的 Perf ∆ (讨论见第 §3.5.4 节).

in existing datasets such as Flan and Nemotron. Not all contamination was subtle—we found many templated contamination instances, in which fields from benchmarks were exactly matched, with templated content inserted between them. Furthermore, many of these were not isolated instances, but complete validation or test splits. For instance, Flan is constructed from templates on benchmark data, and can include validation data that is used for model development decisions since test sets are hidden (e.g., DROP)

Flan 和 Nemotron 这类已有数据集中. 并非所有污染都很隐蔽: 我们发现了大量模板化污染实例, 基准中的字段被原样匹配, 字段之间插入了模板内容. 而且其中很多并不是孤立实例, 而是完整的验证集或测试集划分. 例如, Flan 是用模板基于基准数据构建的, 可能包含验证数据; 由于测试集是隐藏的, 这些验证数据正是用来做模型开发决策的 (例如 DROP)

Performance is sometimes, but not always, inflated by contamination. We investigate this by comparing our final decontaminated 100B anneal with a matched 100B anneal using the non-decontaminated data versions. Figure 12 also shows the extent to which benchmark performance after midtraining drops when contamination is removed (Perf ∆). Some differences are substantial—such as validation or test performance changes in DROP, Minerva, SQuAD. Note that we remove contamination of all splits for all benchmarks, such as for DROP removing over 60,000 training examples from sources such as Flan. So performance differences may indicate that decontamination is preventing memorization or also removing in-distribution training examples. We remove all splits because some of our development benchmarks increase sample size by evaluating on train and held out splits (Figure 12, right) and several of these also show performance overestimation with contamination of any of the evaluated benchmark splits. However, other benchmarks do not show inflated performance, despite contamination: we see that DeepSeek LeetCode performance is close to 0 with or without contamination, and SQuAD under the easier MC metric is saturated in either case. Finally, similarly to reports

污染有时会虚高表现, 但并非总是如此. 我们把最终去污染后的 100B 退火与一个使用未去污染数据版本, 其余条件匹配的 100B 退火做比较来考察这一点. 图 12 也展示了去除污染后, midtraining 之后的基准表现下降了多少 (Perf ∆). 有些差异很大, 例如 DROP, Minerva, SQuAD 的验证或测试表现变化. 注意我们对所有基准的所有划分都去除了污染, 比如对 DROP, 从 Flan 等来源中移除了超过 60,000 个训练样本. 所以表现差异可能说明去污染阻止了记忆, 也可能说明它移除了同分布的训练样本. 我们移除所有划分, 是因为部分开发基准会同时在训练划分和 held-out 划分上评测以扩大样本量 (图 12 右侧), 其中若干基准在任一被评测划分受污染时也表现出高估. 不过, 另一些基准尽管受污染, 表现并没有虚高: DeepSeek LeetCode 无论是否受污染, 表现都接近 0; SQuAD 在更容易的 MC 指标下两种情况都已饱和. 最后, 与

<!-- page 30 of 118 -->

from Marin 32B (Hall et al., 2025), we find that despite the fact that our decontamination procedure detected complete leakage of GSM8K in our data, this does not result in better performance with the contaminated data. Instead we see that performance is in fact better with the decontaminated data, a phenomenon that the Marin authors explain occurs due to the contaminated formatting not matching the evaluated format.23

Marin 32B (Hall et al., 2025) 的报告类似, 我们发现, 尽管去污染流程检测到数据中 GSM8K 完全泄漏, 用受污染的数据训练并没有带来更好的表现. 相反, 去污染数据上的表现实际上更好; Marin 的作者解释, 这是因为受污染数据的格式与评测格式不一致.23

不能一概而论. 报告对所有基准的所有划分去污染, DROP 一项就从 Flan 等来源移除超过 60,000 个训练样本, 掉分既可能是阻止记忆, 也可能是删掉了同分布训练样本. 另有反例: DeepSeek LeetCode 污染与否都接近 0, SQuAD 在 MC 指标下两种情况都饱和; GSM8K 完全泄漏反而去污染版更好, 文内引 Marin 的格式不匹配解释.

**Model souping can improve midtraining performance** For Olmo 3 Base 32B, we observe noteworthy performance improvement from merging two independent midtraining runs with differing seeds. Relative to the individual midtraining runs, the merged model yields nearly a full point of improvement in the MC<sub>STEM</sub> task cluster, 0.4 improvement in the GenQA task cluster, and in the Math task cluster result in improvements of 2.9 and 1.6 relative to the first and second midtraining runs, respectively. Other noteworthy improvements include approximately 1 point of improvement in MMLU, and 5 and 2 points of improvement in GSM Symbolic relative to the first and second runs. For this reason, we select the merged model as our final midtrained 32B checkpoint.

**Model souping 能提升 midtraining 表现** 对 Olmo 3 Base 32B, 我们观察到把两次不同随机种子的独立 midtraining 运行合并后, 表现有显著提升. 相对单次 midtraining 运行, 合并后的模型在 MC<sub>STEM</sub> 任务簇上提升近 1 分, 在 GenQA 任务簇上提升 0.4 分, 在 Math 任务簇上相对第一次和第二次 midtraining 运行分别提升 2.9 分和 1.6 分. 其他值得一提的提升包括 MMLU 提升约 1 分, GSM Symbolic 相对第一次和第二次运行分别提升 5 分和 2 分. 因此, 我们选择合并后的模型作为最终的 32B midtrained checkpoint.

### 3.6 Stage 3: Long-context Extension (3.6 阶段 3: 长上下文扩展)

A crucial ability for modern language models is the capacity to operate over long sequences. This capability is necessary to process the long inputs required by many real-world tasks. Moreover, generating long sequences of intermediate tokens is a common technique to achieve test-time scaling (Muennighoff et al., 2025b). In this section, we provide an overview of the methodology we used to scale Olmo 3’s context window from 8,192 to 65,536 tokens. We also describe Dolma 3 Longmino Mix, a high-quality dataset of both naturally-occurring and synthetically-augmented long texts. Dolma 3 Longmino Mix consists of over 600 billion tokens; statistics in Table 11.

在长序列上工作的能力是现代语言模型的一项关键能力. 许多真实任务需要处理很长的输入, 这就离不开这项能力. 此外, 生成很长的中间 token 序列是实现 TestingTime Scaling 的常用技术 (Muennighoff et al., 2025b). 本节概述我们把 Olmo 3 的上下文窗口从 8,192 扩展到 65,536 token 所用的方法. 我们还介绍 Dolma 3 Longmino Mix, 这是一个由自然长文本和合成增强长文本组成的高质量数据集. Dolma 3 Longmino Mix 包含超过 6000 亿 token; 统计见表 11.

<table><tbody><tr><td rowspan="2">Source</td><td rowspan="2">Length bucket</td><td colspan="2">600B Pool</td><td colspan="2">50B Mix</td></tr><tr><td>Tokens</td><td>Docs</td><td>Tokens</td><td>Docs</td></tr><tr><td>olmOCR PDFs</td><td>8K-16K</td><td>144B (22.5%)</td><td>12.7M</td><td>2.27B (4.55%)</td><td>235K</td></tr><tr><td>olmOCR PDFs</td><td>16K-32K</td><td>115B (18.0%)</td><td>5.06M</td><td>1.85B (3.70%)</td><td>110K</td></tr><tr><td>olmOCR PDFs</td><td>32K-64K</td><td>106B (16.6%)</td><td>2.30M</td><td>4.81B (9.63%)</td><td>177K</td></tr><tr><td>olmOCR PDFs</td><td>64K-128K</td><td>96.0B (15.0%)</td><td>1.05M</td><td>-</td><td>-</td></tr><tr><td>olmOCR PDFs</td><td>128K-256K</td><td>60.8B (9.5%)</td><td>342K</td><td>-</td><td>-</td></tr><tr><td>olmOCR PDFs</td><td>256K-512K</td><td>35.1B (5.49%)</td><td>97.1K</td><td>-</td><td>-</td></tr><tr><td>olmOCR PDFs</td><td>512K-1M</td><td>21.5B (3.36%)</td><td>30.2K</td><td>-</td><td>-</td></tr><tr><td>olmOCR PDFs</td><td>1M+</td><td>26.9B (4.21%)</td><td>12.2K</td><td>-</td><td>-</td></tr><tr><td>olmOCR PDFs + synth CWE</td><td>32K-64K</td><td>8.77B (1.37%)</td><td>189K</td><td>1.94B (3.88%)</td><td>71.3K</td></tr><tr><td>olmOCR PDFs + synth REX</td><td>32K-64K</td><td>24.1B (3.77%)</td><td>492K</td><td>6.08B (12.2%)</td><td>217K</td></tr><tr><td>Midtraining data mix</td><td>Variable</td><td>-</td><td>-</td><td>33.0B (66.1%)</td><td>79.2M</td></tr><tr><td>Total</td><td></td><td>639B</td><td>22.3M</td><td>50.0B (100%)</td><td>80.0M</td></tr></tbody></table>

Table 11 Composition of Dolma 3 Longmino Mix. The 100B mix for Olmo 3 32B maintains the same proportions as the 50B mix. Length buckets are reported in Dolma 3 tokens.

表 11｜Dolma 3 Longmino Mix 的构成. Olmo 3 32B 所用的 100B 混合与 50B 混合比例相同. 长度桶以 Dolma 3 token 计.

**Long-context extension strategy** Because training with long sequence lengths is computationally costly, most language models are pretrained with shorter sequences and extended only in a later stage of model development. During the extension phase, models are trained on longer documents and the hyperparameters of positional embeddings are typically adjusted to ease positional generalization.

**长上下文扩展策略** 由于用长序列训练的计算代价很高, 大多数语言模型都用较短序列预训练, 到模型开发的后期阶段才做扩展. 在扩展阶段, 模型在更长的文档上训练, 通常还会调整位置编码的超参数, 以便位置泛化.

**High variance in open-model recipes** The recipes for performing this long-context extension vary dramatically between models. The context extension phase for many language models ranges from hundreds of billions (SmolLM3: 100B, Bakouch et al. 2025; GLM 4.5: 100B, GLM-4.5 Team et al. 2025; DeepSeek V3:

**开放模型配方差异很大** 不同模型做长上下文扩展的配方差别很大. 许多语言模型的上下文扩展阶段从数千亿 token (SmolLM3: 100B, Bakouch et al. 2025; GLM 4.5: 100B, GLM-4.5 Team et al. 2025; DeepSeek V3:

<small><span class="docvortex-page-footnote" data-block-type="page_footnote" style="color:#6b7280">23<sub>This</sub> discussion was disseminated [on social media](https://x.com/percyliang/status/1983561570539176334).</span></small>

<small><span class="docvortex-page-footnote" data-block-type="page_footnote" style="color:#6b7280">24<sub>Initial</sub> experimentation for the 7B model did not show similar gains from model merging, so the 7B midtrained checkpoint is the result of a single run.</span></small>

<!-- page 31 of 118 -->

123B, DeepSeek-AI et al. 2025; Apertus: 225B, Apertus Team 2025) to almost one trillion tokens (Kimi K2: 400B, Kimi Team et al. 2025; Llama 3.1: 800B, Grattafiori et al. 2024; DeepSeek V3.1: 840B, DeepSeek-AI 2025). However, there are outliers: AFM (Goddard, 2025) and Nemotron Nano 2 (NVIDIA et al., 2025) both use fewer than 20 billion tokens to extend to 64K and 128K, respectively. Standalone extension recipes have also been proposed, many emphasizing token efficiency. For instance, ProLong (Gao et al., 2025) uses 20B tokens drawn from books and code, whereas LongAttn (Wu et al., 2025b) constructs a 5B-token corpus using self-attention scores from existing language models to select documents exhibiting long-range dependencies. Another key point of divergence across model families is when in the development pipeline the extension is performed: Llama 3.1 models apply long-context extension prior to midtraining, Qwen 2.5 and 3 perform it afterwards, and GLM 4.5 applies extension only after supervised finetuning.

123B, DeepSeek-AI et al. 2025; Apertus: 225B, Apertus Team 2025) 到近一万亿 token 不等 (Kimi K2: 400B, Kimi Team et al. 2025; Llama 3.1: 800B, Grattafiori et al. 2024; DeepSeek V3.1: 840B, DeepSeek-AI 2025). 不过也有例外: AFM (Goddard, 2025) 和 Nemotron Nano 2 (NVIDIA et al., 2025) 分别用不到 200 亿 token 就扩展到了 64K 和 128K. 也有人提出独立的扩展配方, 很多都强调 token 效率. 例如 ProLong (Gao et al., 2025) 使用取自书籍和代码的 20B token, 而 LongAttn (Wu et al., 2025b) 利用已有语言模型的自注意力分数挑选具有长程依赖的文档, 构建了一个 5B token 的语料. 各模型家族的另一个关键分歧是扩展在开发流水线中的位置: Llama 3.1 模型在 midtraining 之前做长上下文扩展, Qwen 2.5 和 Qwen 3 在其之后做, GLM 4.5 则直到监督微调之后才做扩展.

**Olmo 3 long-context recipe** To extend Olmo 3’s context, we use long documents from the olmOCR science PDFs pool (Section §3.6.1) with additional filtering and synthetic data augmentation applied (Section §3.6.2). We call this collection Dolma 3 Longmino Pool. We mix 34% long-context data with 66% high-quality short-context data sampled from Dolma 3 Dolmino Mix, and train using this mix for an additional 50B tokens for Olmo 3 7B and 100B tokens for Olmo 3 32B, as described in Section §3.6.3. During long-context extension, we apply YaRN (Peng et al., 2023) to full attention layers, and do not adjust positional embeddings on sliding-window attention layers; we use document packing and inter-document masking (Section §3.6.3). We summarize the key aspects of our recipe in Figure 13. While developing this recipe, we carefully analyze and isolate architectural design decisions that have profound impact on long-context performance; our investigation is presented in Bertsch et al. (2026).

**Olmo 3 长上下文配方** 为扩展 Olmo 3 的上下文, 我们使用 olmOCR science PDFs 数据池中的长文档 (第 §3.6.1 节), 并做了额外过滤和合成数据增强 (第 §3.6.2 节). 我们把这批数据称为 Dolma 3 Longmino Pool. 我们把 34% 的长上下文数据与 66% 从 Dolma 3 Dolmino Mix 采样的高质量短上下文数据混合, 用这个混合对 Olmo 3 7B 额外训练 50B token, 对 Olmo 3 32B 额外训练 100B token, 详见第 §3.6.3 节. 在长上下文扩展期间, 我们对全注意力层应用 YaRN (Peng et al., 2023), 不调整滑动窗口注意力层的位置编码; 我们使用文档打包和文档间掩码 (第 §3.6.3 节). 图 13 汇总了配方的关键方面. 在开发这套配方时, 我们仔细分析并分离出对长上下文表现有深远影响的架构设计决策; 相关研究见 Bertsch et al. (2026).

**Overall results** We evaluate our context-extended models on two popular long-context benchmarks. RULER (Hsieh et al., 2024) is a benchmark of synthetic long-context tasks including challenging variations of the Needle-in-a-Haystack task (Nelson et al., 2024) and simple aggregation tasks that require counting over inputs; we use RULER as the primary metric to guide our long-context recipe development. HELMET (Yen et al., 2025) is a suite of long-context benchmarks across a diverse set of task types, including retrieval, in-context learning, and summarization tasks, which we evaluate on to represent more general long-context capabilities. We keep HELMET as an unseen evaluation suite and test our final checkpoints on it. We report results in Table 12.

**整体结果** 我们在两个常用长上下文基准上评测扩展了上下文的模型. RULER (Hsieh et al., 2024) 是一个合成长上下文任务基准, 包括 Needle-in-a-Haystack 任务 (Nelson et al., 2024) 的高难度变体, 以及需要对输入计数的简单聚合任务; 我们把 RULER 作为指导长上下文配方开发的主要指标. HELMET (Yen et al., 2025) 是一套覆盖多种任务类型的长上下文基准, 包括检索, 上下文学习和摘要任务, 我们用它评测来代表更一般的长上下文能力. 我们把 HELMET 作为未见过的评测套件, 只在最终 checkpoint 上测试. 结果见表 12.

#### 3.6.1 Sourcing Long Context Data (3.6.1 长上下文数据来源)

**olmOCR science PDFs** The backbone of our long-context data pool is scientific PDFs scraped from the web and processed by olmOCR.<sup>26</sup> Figure 14 describes the distribution by topic in each length bucked shown in Table 11.

**olmOCR science PDFs** 长上下文数据池的骨干是从 Web 抓取, 经 olmOCR 处理的科学 PDF.<sup>26</sup> 图 14 描述了表 11 中各长度桶内的主题分布.

**Data filtering** We filter this data using gzip compressibility as a metric. gzip has been used for text classification (Jiang et al., 2022) and as a feature in fine-grained scaling laws (Pandey, 2024). We use gzip for data filtering by excluding the extremes: removing the 20% of text that is most compressible and the 20% of text that is least compressible.

**数据过滤** 我们用 gzip 可压缩性作为指标过滤这些数据. gzip 曾被用于文本分类 (Jiang et al., 2022), 也被用作细粒度 Scaling Laws 中的特征 (Pandey, 2024). 我们用 gzip 过滤数据时排除两端的极值: 去掉最易压缩的 20% 文本和最难压缩的 20% 文本.

最可压缩 20% 与最不可压缩 20% 都剔除 (§3.6.1).

We also consider applying filters based on LongPpl (Fang et al., 2025b), which identifies tokens that rely moston long-range dependencies by measuring, for each token, the change in perplexity under an existing long-context model when additional preceding context is provided. We compute LongPpl over 10B tokens of Dolma 3 Longmino Mix using Gemma 3 4B (Gemma 3 Team, 2025) as the reference model, and comparing contextualization using 4K or 128K context windows. We use the same threshold as Fang et al. (2025b) for determining whether a token is a “key” token that requires long context dependencies.

我们还考虑过基于 LongPpl (Fang et al., 2025b) 的过滤. LongPpl 识别最依赖长程依赖的 token, 做法是对每个 token 测量: 在已有长上下文模型下, 提供更多前文时其困惑度的变化. 我们以 Gemma 3 4B (Gemma 3 Team, 2025) 作为参考模型, 在 Dolma 3 Longmino Mix 的 10B token 上计算 LongPpl, 比较使用 4K 与 128K 上下文窗口时的上下文化效果. 判断一个 token 是否为需要长上下文依赖的 「关键」 token 时, 我们使用与 Fang et al. (2025b) 相同的阈值.

We compute two statistics over each document: the fraction of tokens marked as key tokens, and the spread of key tokens across the document (which we compute as the standard deviation of key token locations, which are measured relative to the document length). In a sweep of experiments, we consider excluding the bottom

我们对每篇文档计算两项统计量: 被标为关键 token 的比例, 以及关键 token 在文档中的分散程度 (计算为关键 token 位置的标准差, 位置以相对文档长度度量). 在一组扫描实验中, 我们考虑过排除关键 token 最少或分散度最低的

<small><span class="docvortex-page-footnote" data-block-type="page_footnote" style="color:#6b7280">25<sub>There</sub> is some overlap between RULER and HELMET, so this is not a perfect held-out suite; however, the overlapping subsets are generally the easier ones where models trivially achieve near-perfect performance. See Appendix A.8 for details. 26</span></small>

<small><span class="docvortex-page-footnote" data-block-type="page_footnote" style="color:#6b7280"><sub>See</sub> Section 3.4.2 for more details on the preprocessing of this data.</span></small>

<!-- page 32 of 118 -->

![Chart block](images/p32-a.png)

![Chart block](images/p32-b.png)

![Chart block](images/p32-c.png)

![Chart block](images/p32-d.png)

![Chart block](images/p32-e.png)

Figure 13 Five key components of the Olmo 3 long-context extension recipe measured on the RULER benchmark. applying YaRN to full attention layers only gives the best results (Figure 13a); olmOCR science PDFs are more effective than other recipes (Figure 13b); synthetic data augmentation improves performance over natural documents alone (Figure 13c); Document packing boosts performance for longer context lengths (Figure 13d); longer extensions improve RULER scores, especially for longer sequences (Figure 13e).

图 13｜在 RULER 基准上度量的 Olmo 3 长上下文扩展配方的五个关键组成部分. 只对全注意力层应用 YaRN 效果最好 (图 13a); olmOCR science PDFs 比其他配方更有效 (图 13b); 合成数据增强相比仅用自然文档能提升表现 (图 13c); 文档打包能提升更长上下文长度下的表现 (图 13d); 更长的扩展能提高 RULER 分数, 尤其是在更长序列上 (图 13e).

只对 full attention 层施加 YaRN 时 RULER 最好; 不要默认打到 SWA 层.

20% of documents with the least key tokens or lowest spread, and excluding both the top and bottom 20% as outliers; none of these possibilities outperform the gzip filter, so we do not use this for the final run.

后 20% 文档, 以及把前后各 20% 都作为离群值排除; 这些方案都没有胜过 gzip 过滤器, 所以最终运行没有采用.

#### 3.6.2 Experiments with Synthetic Augmentation (3.6.2 合成增强实验)

A common use case for extended-context language models is information extraction and synthesis over long inputs (Bai et al., 2024, 2025). However, most long documents do not provide supervision for such tasks. Directly inspired by CLIPPER (Pham et al., 2025), we modify a portion of our science PDF pool by injecting synthetically generated aggregation tasks at randomly sampled intervals. Our approach also shares similarities with Qwen 2.5 1M (Yang et al., 2025b).

扩展了上下文的语言模型的一个常见用途, 是在长输入上做信息抽取和综合 (Bai et al., 2024, 2025). 然而, 大多数长文档并不能为这类任务提供监督信号. 受 CLIPPER (Pham et al., 2025) 直接启发, 我们修改了科学 PDF 数据池的一部分, 在随机采样的位置注入合成生成的聚合任务. 我们的方法也与 Qwen 2.5 1M (Yang et al., 2025b) 有相似之处.

**Generation pipeline** The main challenge in generating synthetic data for long-context understanding is the bootstrap problem: how can we create effective data without having access to models that can process long context? Our pipeline uses document statistics to identify the most important terms and then extracts snippets containing those terms. Those snippets are subsequently provided to a language model to create aggregation tasks. In detail:

**生成流水线** 为长上下文理解生成合成数据, 主要难点在于自举问题: 手头没有能处理长上下文的模型, 怎样才能造出有效的数据? 我们的流水线用文档统计量找出最重要的术语, 然后抽取包含这些术语的片段. 这些片段随后交给语言模型, 用来构造聚合任务. 具体如下:

1. For a given document of length n tokens, we partition the document into m sections of length 8K to 32K tokens. We attempt to place these partitions near natural breaks in the document flow, such as right before new sections;

1. 对一篇长度为 n token 的文档, 把它切分为 m 段, 每段长 8K 到 32K token. 我们尽量把切分点放在文档行文的自然断点附近, 例如新章节开始之前;

<!-- page 33 of 118 -->

<table><tr><td rowspan="2">Model</td><td colspan="5">RULER (dev suite)</td><td colspan="4">HELMET (held-out eval)</td></tr><tr><td>4K</td><td>8K</td><td>16K</td><td>32K</td><td>65K</td><td>8K</td><td>16K</td><td>32K</td><td>65K</td></tr><tr><td colspan="10">7B scale</td></tr><tr><td>Llama 3.1 8B</td><td>95.56</td><td>92.76</td><td>93.13</td><td>91.43</td><td>86.88</td><td>45.00</td><td>43.48</td><td>42.44</td><td>40.18</td></tr><tr><td>Qwen 2.5 7B</td><td>94.63</td><td>90.87</td><td>88.68</td><td>87.26</td><td>67.30</td><td>49.26</td><td>46.25</td><td>42.99</td><td>30.47</td></tr><tr><td>IBM Granite 3.3 8B</td><td>91.98</td><td>85.69</td><td>82.70</td><td>78.13</td><td>67.62</td><td>43.19</td><td>41.63</td><td>39.31</td><td>35.74</td></tr><tr><td>Qwen 3 8B</td><td>95.58</td><td>94.10</td><td>93.78</td><td>90.29</td><td>-</td><td>51.62</td><td>49.90</td><td>47.71</td><td>-</td></tr><tr><td>Xiaomi MiMo 7B</td><td>94.33</td><td>93.45</td><td>92.53</td><td>89.28</td><td>-</td><td>50.57</td><td>49.68</td><td>46.01</td><td>-</td></tr><tr><td>Nemotron Nano 9B</td><td>95.31</td><td>93.09</td><td>91.58</td><td>89.01</td><td>85.13</td><td>41.78</td><td>42.90</td><td>41.82</td><td>41.48</td></tr><tr><td>Apertus 8B</td><td>90.47</td><td>82.48</td><td>74.43</td><td>69.05</td><td>59.89</td><td>46.09</td><td>43.71</td><td>41.26</td><td>35.12</td></tr><tr><td>Olmo 3 7B</td><td>94.89</td><td>91.21</td><td>84.14</td><td>78.79</td><td>67.96</td><td>45.66</td><td>43.62</td><td>41.15</td><td>36.80</td></tr><tr><td colspan="10">32B scale</td></tr><tr><td>Qwen 2.5 32B</td><td>96.03</td><td>94.52</td><td>95.07</td><td>92.67</td><td>80.73</td><td>57.61</td><td>56.06</td><td>54.01</td><td>41.73</td></tr><tr><td>Gemma 3 27B</td><td>84.48</td><td>84.20</td><td>85.36</td><td>87.06</td><td>84.59</td><td>49.37</td><td>49.92</td><td>50.31</td><td>48.60</td></tr><tr><td>Mistral Small 3.1 24B</td><td>96.05</td><td>95.06</td><td>93.77</td><td>92.42</td><td>88.80</td><td>49.41</td><td>49.71</td><td>47.46</td><td>43.34</td></tr><tr><td>Apertus 70B</td><td>91.52</td><td>84.26</td><td>80.54</td><td>76.82</td><td>60.33</td><td>44.72</td><td>44.60</td><td>41.07</td><td>35.67</td></tr><tr><td>Olmo 3 32B</td><td>96.10</td><td>94.57</td><td>90.42</td><td>86.22</td><td>79.70</td><td>52.11</td><td>49.36</td><td>48.60</td><td>43.15</td></tr></table>

Table 12 Performance of Olmo 3 compared to other open base models of comparable size. During Olmo 3 development, we use RULER (Hsieh et al., 2024) as our development suite; we hold HELMET (Yen et al., 2025) out as an unseen evaluation suite. The table contains base variants of each model; models are sorted by their respective release dates. Qwen 3 8B Base (Yang et al., 2025a) and Xiaomi MiMo 7B (Xiaomi et al., 2025) only support a context length of up to 32,768 tokens. We exclude any base model that does not support at least 32,768 tokens.

表 12｜Olmo 3 与其他规模相当的开放 base 模型的表现对比. 在 Olmo 3 开发期间, 我们用 RULER (Hsieh et al., 2024) 作为开发套件; HELMET (Yen et al., 2025) 则留作未见过的评测套件. 表中列出的是各模型的 base 版本, 按各自发布日期排序. Qwen 3 8B Base (Yang et al., 2025a) 和 Xiaomi MiMo 7B (Xiaomi et al., 2025) 最多只支持 32,768 token 的上下文长度. 我们排除了所有不支持至少 32,768 token 的 base 模型.

![Chart block](images/p33-figure-14-distribution-of-token-counts-over.png)

Figure 14 Distribution of token counts over WebOrganizer (Wettig et al., 2025) topics in olmOCR science PDFs, partitioned by length.

图 14｜olmOCR science PDFs 中 token 数在 WebOrganizer (Wettig et al., 2025) 各主题上的分布, 按长度划分.

<!-- page 34 of 118 -->

2. For each partition, we normalize and tokenize the text, extract one- and two-word noun phrases, and use tf-idf to identify the most salient noun phrases;

2. 对每个分段, 我们对文本做规范化和分词, 抽取一词和两词的名词短语, 并用 tf-idf 找出最显著的名词短语;

3. For each noun phrase, we select k = 8 snippets of text from the partition, ranked by tf-idf ;

3. 对每个名词短语, 我们从该分段中按 tf-idf 排序选出 k = 8 个文本片段;

4. We pass the noun phrases, (optional) snippets, and one or more prompts describing the aggregation task to a language model.

4. 把名词短语, (可选的) 片段, 以及一条或多条描述聚合任务的提示词交给语言模型.

For Olmo 3, we use documents where 32, 768 ≤ n < 65, 536 tokens, resulting in 2 to 8 partitions per document. While we experimented with several closed and open language models, we ultimately use OLMo 2 Instruct 32B for all generations.

对 Olmo 3, 我们使用 32, 768 ≤ n < 65, 536 token 的文档, 每篇文档得到 2 到 8 个分段. 我们试验过若干闭源和开源语言模型, 最终所有生成都使用 OLMo 2 Instruct 32B.

**Synthetic aggregation tasks** We consider two aggregation tasks; we refer the reader to the code implementation for the exact prompts used.

**合成聚合任务** 我们考虑两类聚合任务; 所用的确切提示词请读者参见代码实现.

• CWE (Common Word Extraction) We prompt OLMo 2 Instruct with 5 commonly occurring single-word noun phrases in the partition, and ask the model to generate diverse QA pairs that require the answer to be the exact number of times each unigram occurs in the partition;
• CWE (Common Word Extraction) 我们把该分段中 5 个常见的单词名词短语提供给 OLMo 2 Instruct, 要求模型生成多样的 QA 对, 答案必须是每个一元词在该分段中出现的确切次数;

• REX (Rewriting EXpressions) For each noun phrase and corresponding snippets, we prompt OLMo 2 Instruct to generate an aggregation task matching one of the following 12 vignettes discussing the noun phrase: a short summary, a dialogue between a professor and student, a simple paragraph for high school students, a set of flashcards, a school quiz, a game show, a dinner party, a debate, a list of true or false claims, a movie scene, an encyclopedic description, or an explainer in the style of conversations on the r/explainlikeimfive subreddit.
• REX (Rewriting EXpressions) 对每个名词短语及其对应片段, 我们提示 OLMo 2 Instruct 生成一个聚合任务, 以下列 12 种情境之一讨论该名词短语: 简短摘要, 教授与学生的对话, 写给高中生的简单段落, 一组抽认卡, 学校小测验, 游戏节目, 晚宴, 辩论, 一串判断对错的陈述, 电影场景, 百科式描述, 或者 r/explainlikeimfive subreddit 对话风格的通俗讲解.

#### 3.6.3 Choosing Data Mix and Token Budget (3.6.3 选择数据混合与 token 预算)

**Interleaving long- and short-context data** Rather than training on only long-context data, we mix highquality short-context data from midtraining (stage two) to ensure that performance on short-context tasks is not meaningfully degraded. Early experiments on a 10B-token extension show that a 66% / 34% mix of long-context to short-context data drops performance on a subset of OlmoBaseEval by 2.5 points; in comparison, a 34% long-context, 66% short-context mix only drops performance by 0.8 points.

**交错长短上下文数据** 我们不只用长上下文数据训练, 而是混入 midtraining (第二阶段) 的高质量短上下文数据, 以确保短上下文任务的表现不会明显退化. 在 10B token 扩展上的早期实验显示, 长上下文与短上下文数据按 66% / 34% 混合时, OlmoBaseEval 子集上的表现下降 2.5 分; 相比之下, 按 34% 长上下文, 66% 短上下文混合时, 表现只下降 0.8 分.

**Longer extension helps** Figure 13e shows that allocating more tokens to the long-context extension stage improves performance on long-context tasks, particularly at longer sequence lengths. We extend the context of Olmo 3 7B through a 50B stage 3 training; for Olmo 3 32B, we extend for 100B tokens for better long-context capabilities.

**更长的扩展有帮助** 图 13e 显示, 给长上下文扩展阶段分配更多 token 能提升长上下文任务的表现, 在更长的序列长度上尤其明显. 我们通过 50B 的第 3 阶段训练扩展 Olmo 3 7B 的上下文; 对 Olmo 3 32B, 为了获得更好的长上下文能力, 扩展训练了 100B token.

#### 3.6.4 Curating a Training Recipe for Extension (3.6.4 整理扩展训练配方)

**RoPE extension** Olmo 3 uses RoPE (Su et al., 2024) to encode positional information within the transformer architecture. We experiment with several methods for extending RoPE beyond the original pretraining context length, including adjusted base frequency scaling (Xiong et al., 2023; Rozière et al., 2024), position interpolation (Chen et al., 2023), and YaRN (Peng et al., 2023). Each approach is applied either to all RoPE instances or is restricted to RoPE used in full attention layers. We find that applying YaRN only to full attention layers yields the best overall performance.

**RoPE 扩展** Olmo 3 在 Transformer 架构中用 RoPE (Su et al., 2024) 编码位置信息. 我们试验了多种把 RoPE 扩展到原始预训练上下文长度之外的方法, 包括调整 base frequency 的缩放 (Xiong et al., 2023; Rozière et al., 2024), 位置插值 (Chen et al., 2023) 和 YaRN (Peng et al., 2023). 每种方法要么应用于所有 RoPE 实例, 要么只应用于全注意力层中的 RoPE. 我们发现只对全注意力层应用 YaRN 的整体表现最好.

**Document packing** During pretraining and midtraining, we follow the standard approach of concatenating documents and splitting them into fixed-length training sequences. However, when extending the context length, this strategy produces training instances that are, on average, shorter than the underlying document length distribution. To address this, we adopt best-fit document packing (Ding et al., 2024), which reduces the number of split documents while adding a negligible amount of padding. Compared to the naive concatenate-then-split approach, best-fit packing yields substantially improved performance on long-context benchmarks.

**文档打包** 在预训练和 midtraining 期间, 我们沿用标准做法, 把文档拼接起来再切成固定长度的训练序列. 然而在扩展上下文长度时, 这种策略产生的训练样本平均比底层文档长度分布更短. 为此, 我们采用 best-fit 文档打包 (Ding et al., 2024), 在只增加可忽略填充的前提下减少被切断的文档数量. 相比朴素的 「先拼接再切分」 做法, best-fit 打包在长上下文基准上的表现明显更好.

<small><span class="docvortex-page-footnote" data-block-type="page_footnote" style="color:#6b7280">27<a href="https://github.com/allenai/dolma3/blob/f7def5838c8c2d25e358b2b35b2b752168107ed4/datasets/dolma3_longmino_mix/synthetic_cwe_rex/longmino_synthetic_cwe_rex.py"><sub>github</sub>.com/allenai/dolma3/datasets/dolma3\_longmino\_mix/synthetic\_cwe\_rex/longmino\_synthetic\_cwe\_rex.py</a></span></small>

<!-- page 35 of 118 -->

**Intra-document masking** During long-context extension, we apply intra-document masking to ensure that each training sequence attends only to tokens originating from the same underlying document (Zhao et al., 2024b; Grattafiori et al., 2024). This prevents the model from being distracted by cross-document signals, which can otherwise introduce spurious attention patterns and degrade long-range performance.

**文档内掩码** 在长上下文扩展期间, 我们使用文档内掩码, 确保每个训练序列只关注来自同一底层文档的 token (Zhao et al., 2024b; Grattafiori et al., 2024). 这样可以防止模型被跨文档信号干扰, 否则这些信号可能引入虚假的注意力模式, 损害长程表现.

**LC training infrastructure** To extend the model to a 65K-token context window, we employ 8-way context parallelism (CP) so that each device processes 8K tokens from each training instance. We adopt the all gather-based CP attention strategy introduced by Chu et al. (2025), which makes it straightforward to support irregular attention masks, including sliding-window and intra-document masking. For parallelism configurations, infrastructure details, and throughput measurements, see Appendix Table 34.

**长上下文训练基础设施** 为了把模型扩展到 65K token 的上下文窗口, 我们使用 8 路上下文并行 (CP), 让每台设备处理每个训练样本中的 8K token. 我们采用 Chu et al. (2025) 提出的基于 all-gather 的 CP 注意力策略, 它能直接支持不规则的注意力掩码, 包括滑动窗口掩码和文档内掩码. 并行配置, 基础设施细节和吞吐量测量见附录表 34.

**Model souping** Following performance improvements from merging midtraining runs for Olmo 3 Base 32B, we experiment with averaging long-context checkpoints. In this case, rather than running long-context extension multiple times with different seeds, we merge the last three checkpoints from the end of the extension run (at steps 10,000, 11,000, and 11,921) to produce our final long-context Olmo 3 Base 32B.

**Model souping** 合并 midtraining 运行为 Olmo 3 Base 32B 带来了表现提升, 受此启发, 我们尝试对长上下文 checkpoint 取平均. 这次我们没有用不同随机种子多次运行长上下文扩展, 而是合并扩展运行末尾的最后三个 checkpoint (第 10,000, 11,000 和 11,921 步), 得到最终的长上下文 Olmo 3 Base 32B.

### 3.7 Base Model Results (3.7 Base 模型结果)

In Table 13 we outline the results of Olmo 3 Base after the pretraining, midtraining, and long-context extension stages, comparing performance to other open base models. Compared to OLMo 2, the Olmo 3 models demonstrate clear improvements on science, math, and code-based evaluation metrics, which we attribute largely to our emphasis and upsampling of STEM-related data during the pretraining and midtraining stages. On the other hand, because of this emphasis on STEM, we see slight degradation in general knowledge benchmarks.

表 13 列出了 Olmo 3 Base 在预训练, midtraining 和长上下文扩展各阶段之后的结果, 并与其他开放 base 模型比较. 与 OLMo 2 相比, Olmo 3 模型在科学, 数学和代码类评测指标上有明显提升, 我们认为这主要归功于在预训练和 midtraining 阶段对 STEM 相关数据的侧重和上采样. 另一方面, 由于侧重 STEM, 我们在通用知识基准上看到轻微退化.

<!-- page 36 of 118 -->

<table><tr><td rowspan="2">Model</td><td rowspan="2"># Toks</td><td colspan="5">Base Aggregate Scores</td><td colspan="4">Select Base Benchmarks</td></tr><tr><td>Math</td><td>Code</td><td> $MC_{STEM}$ </td><td> $MC_{Non-STEM}$ </td><td>GenQA</td><td>Minerva</td><td>GenXL</td><td>MMLU</td><td>BCB</td></tr><tr><td colspan="11">7B scale</td></tr><tr><td>OLMo 2 7B Stage 1</td><td>4T</td><td>12.7</td><td>7.1</td><td>61.0</td><td>70.6</td><td>68.6</td><td>5.6</td><td>15.8</td><td>59.8</td><td>81.6</td></tr><tr><td>OLMo 2 7B Stage 2 Ingredient 1</td><td>4.05T</td><td>40.4</td><td>10.4</td><td>64.1</td><td>74.6</td><td>72.1</td><td>18.9</td><td>21.3</td><td>63.1</td><td>85.1</td></tr><tr><td>OLMo 2 7B Stage 2 Ingredient 2</td><td>4.05T</td><td>41.4</td><td>10.4</td><td>64.3</td><td>74.9</td><td>71.8</td><td>18.7</td><td>21.0</td><td>63.8</td><td>85.8</td></tr><tr><td>OLMo 2 7B Stage 2 Ingredient 3</td><td>4.05T</td><td>40.8</td><td>10.1</td><td>64.0</td><td>74.9</td><td>72.1</td><td>19.1</td><td>21.9</td><td>63.8</td><td>85.6</td></tr><tr><td>OLMo 2 7B Stage 2 Soup</td><td>4.15T</td><td>41.7</td><td>10.4</td><td>64.6</td><td>75.2</td><td>72.4</td><td>19.1</td><td>21.2</td><td>63.7</td><td>85.7</td></tr><tr><td>Apertus 8B Phase 3</td><td>12T</td><td>19.2</td><td>9.9</td><td>61.1</td><td>68.4</td><td>68.3</td><td>7.3</td><td>19.0</td><td>58.3</td><td>81.4</td></tr><tr><td>Apertus 8B Phase 4</td><td>13.5T</td><td>26.0</td><td>16.2</td><td>65.1</td><td>73.8</td><td>69.7</td><td>10.8</td><td>30.5</td><td>63.3</td><td>86.8</td></tr><tr><td>Apertus 8B Phase 5</td><td>15T</td><td>29.3</td><td>19.0</td><td>66.7</td><td>75.0</td><td>70.1</td><td>12.9</td><td>31.0</td><td>65.0</td><td>88.6</td></tr><tr><td>Marin 8B Phoenix</td><td>11.1T</td><td>11.2</td><td>8.0</td><td>60.9</td><td>71.1</td><td>68.7</td><td>4.7</td><td>15.0</td><td>58.5</td><td>83.1</td></tr><tr><td>Marin 8B Starling</td><td>12.4T</td><td>40.5</td><td>20.8</td><td>68.3</td><td>78.7</td><td>75.7</td><td>23.2</td><td>36.2</td><td>67.8</td><td>89.1</td></tr><tr><td>Marin 8B Deeper Starling</td><td>12.7T</td><td>39.4</td><td>21.3</td><td>68.1</td><td>78.8</td><td>75.9</td><td>23.9</td><td>37.0</td><td>67.7</td><td>89.2</td></tr><tr><td>OLMO 3 7B Stage 1</td><td>5.9T</td><td>23.5</td><td>19.8</td><td>64.0</td><td>71.9</td><td>68.5</td><td>12.2</td><td>34.7</td><td>62.3</td><td>84.8</td></tr><tr><td>OLMO 3 7B Stage 2</td><td>6T</td><td>59.8</td><td>31.9</td><td>67.2</td><td>78.2</td><td>71.3</td><td>41.4</td><td>49.1</td><td>66.9</td><td>89.7</td></tr><tr><td>OLMO 3 7B Stage 3</td><td>6.05T</td><td>54.4</td><td>30.6</td><td>66.4</td><td>78.2</td><td>72.5</td><td>39.8</td><td>43.6</td><td>66.9</td><td>89.2</td></tr><tr><td colspan="11">32B scale</td></tr><tr><td>OLMo 2 32B Stage 1</td><td>6.5T</td><td>33.2</td><td>16.0</td><td>73.0</td><td>81.7</td><td>75.8</td><td>13.6</td><td>29.2</td><td>72.3</td><td>93.5</td></tr><tr><td>OLMo 2 32B Stage 2 Ingredient 1</td><td>6.6T</td><td>51.6</td><td>19.9</td><td>75.1</td><td>84.5</td><td>78.5</td><td>30.3</td><td>36.8</td><td>75.5</td><td>94.8</td></tr><tr><td>OLMo 2 32B Stage 2 Ingredient 2</td><td>6.6T</td><td>51.9</td><td>20.0</td><td>74.1</td><td>83.8</td><td>79.1</td><td>30.7</td><td>35.2</td><td>74.0</td><td>94.1</td></tr><tr><td>OLMo 2 32B Stage 2 Ingredient 3</td><td>6.6T</td><td>51.5</td><td>19.6</td><td>74.4</td><td>83.6</td><td>79.0</td><td>29.2</td><td>35.7</td><td>74.3</td><td>93.8</td></tr><tr><td>OLMo 2 32B Stage 2 Ingredient 4</td><td>6.8T</td><td>51.9</td><td>19.2</td><td>74.6</td><td>83.3</td><td>78.3</td><td>31.0</td><td>37.1</td><td>74.3</td><td>94.0</td></tr><tr><td>OLMo 2 32B Stage 2 Soup</td><td>7.1T</td><td>53.9</td><td>20.5</td><td>75.3</td><td>84.2</td><td>79.1</td><td>31.0</td><td>37.1</td><td>75.0</td><td>94.4</td></tr><tr><td>Apertus 70B Phase 3</td><td>12T</td><td>34.2</td><td>17.8</td><td>68.6</td><td>78.2</td><td>74.6</td><td>13.4</td><td>31.9</td><td>67.3</td><td>88.8</td></tr><tr><td>Apertus 70B Phase 4</td><td>13.5T</td><td>39.8</td><td>21.5</td><td>70.5</td><td>79.5</td><td>75.8</td><td>16.3</td><td>34.8</td><td>69.5</td><td>91.0</td></tr><tr><td>Apertus 70B Phase 5</td><td>15T</td><td>40.6</td><td>23.0</td><td>70.5</td><td>79.4</td><td>75.5</td><td>17.5</td><td>37.7</td><td>69.3</td><td>91.4</td></tr><tr><td>K2 V2 70B Pretrain</td><td>12.3T</td><td>46.1</td><td>35.4</td><td>75.6</td><td>83.5</td><td>77.1</td><td>27.2</td><td>54.5</td><td>75.2</td><td>93.0</td></tr><tr><td>K2 V2 70B Stage 1</td><td>14.0T</td><td>60.1</td><td>37.4</td><td>74.9</td><td>84.2</td><td>69.4</td><td>38.6</td><td>56.3</td><td>74.9</td><td>93.1</td></tr><tr><td>K2 V2 70B Stage 2</td><td>14.6T</td><td>60.9</td><td>36.6</td><td>75.0</td><td>84.1</td><td>71.8</td><td>38.6</td><td>55.9</td><td>74.7</td><td>92.9</td></tr><tr><td>K2 V2 70B Stage 3</td><td>14.8T</td><td>69.5</td><td>38.0</td><td>76.1</td><td>84.1</td><td>75.3</td><td>47.9</td><td>58.5</td><td>75.5</td><td>93.3</td></tr><tr><td>K2 V2 70B Stage 4</td><td>15T</td><td>72.8</td><td>38.3</td><td>75.7</td><td>84.0</td><td>75.6</td><td>50.0</td><td>55.7</td><td>75.6</td><td>93.5</td></tr><tr><td>Marin 32B Phase 3</td><td>5.4T</td><td>25.8</td><td>13.9</td><td>70.4</td><td>80.2</td><td>75.1</td><td>9.7</td><td>19.6</td><td>69.5</td><td>90.8</td></tr><tr><td>Marin 32B Mantis</td><td>6.5T</td><td>49.3</td><td>30.8</td><td>75.9</td><td>84.5</td><td>80.3</td><td>36.8</td><td>52.1</td><td>75.7</td><td>93.4</td></tr><tr><td>OLMO 3 32B Stage 1</td><td>5.5T</td><td>48.4</td><td>29.8</td><td>72.3</td><td>80.6</td><td>76.1</td><td>26.7</td><td>47.8</td><td>71.7</td><td>92.6</td></tr><tr><td>OLMO 3 32B Stage 2 Ingredient 1</td><td>5.6T</td><td>66.8</td><td>38.4</td><td>74.6</td><td>85.6</td><td>78.9</td><td>46.5</td><td>59.6</td><td>75.9</td><td>94.7</td></tr><tr><td>OLMO 3 32B Stage 2 Ingredient 2</td><td>5.6T</td><td>65.4</td><td>39.3</td><td>74.8</td><td>85.0</td><td>78.9</td><td>44.1</td><td>60.0</td><td>76.3</td><td>94.3</td></tr><tr><td>OLMO 3 32B Stage 2 Soup</td><td>5.7T</td><td>69.7</td><td>39.7</td><td>75.6</td><td>85.7</td><td>79.4</td><td>46.9</td><td>59.7</td><td>76.9</td><td>95.0</td></tr><tr><td>OLMO 3 32B Stage 3</td><td>6.2T</td><td>61.4</td><td>39.7</td><td>74.3</td><td>85.6</td><td>79.7</td><td>42.9</td><td>59.4</td><td>76.2</td><td>94.8</td></tr></table>

Table 13 Results comparing Olmo 3 to open base models across stages of pretraining, midtraining and long context. As of writing, Marin has undergone learning rate cooldown (Mantis), but not long-context (LC) extension stage. Apertus also has a two-stage cooldown (Phase 4 and 5) and performed long-context extension by mixing-in data to their Phase 5 training. Token counts are presented in "Cumulative training tokens", so each row denotes the number of tokens that model has seen up to that point in training. For OLMo 2 and Olmo 3 models, Stage 1 is the standard pretraining phase, Stage 2 is midtraining, and Stage 3 is LC extension.

表 13｜Olmo 3 与开放 base 模型在预训练, midtraining 和长上下文各阶段的结果对比. 截至撰写时, Marin 已经完成学习率冷却 (Mantis), 但没有做长上下文 (LC) 扩展阶段. Apertus 也有两阶段冷却 (Phase 4 与 Phase 5), 并通过在 Phase 5 训练中混入数据完成了长上下文扩展. token 数以 「累计训练 token」 给出, 因此每一行表示模型训练到该点为止见过的 token 数. 对 OLMo 2 和 Olmo 3 模型, Stage 1 是标准预训练阶段, Stage 2 是 midtraining, Stage 3 是 LC 扩展.

## 4 Olmo 3 Think (4. Olmo 3 Think)

We train Olmo 3 Think to reason by first generating extended thought sequences and then producing a final answer (Figure 2). To achieve this, we curate high-quality reasoning data (Dolci Think), harness a three-stage training recipe (SFT, DPO, and RLVR), and introduce OlmoRL approach, which merges our new algorithmic and engineering advances with a strong community platform of research in reinforcement learning with verifiable rewards.

我们训练 Olmo 3 Think 的推理方式是: 先生成较长的思考序列, 再给出最终答案 (图 2). 为此, 我们策展高质量推理数据 (Dolci Think), 采用三阶段训练配方 (SFT, DPO 和 RLVR), 并引入 OlmoRL 方法, 把我们在算法和工程上的新进展与社区在带可验证奖励的强化学习方面的强大研究平台结合起来.

Through these data, training, and algorithmic innovations, Olmo 3 Think achieves strong performance in math, coding, reasoning, and general conversation. At the 32B scale, it stands as the best fully-open thinking

凭借这些数据, 训练和算法上的创新, Olmo 3 Think 在数学, 编码, 推理和通用对话上都表现强劲. 在 32B 规模上, 它是最好的 fully-open 思考

<!-- page 37 of 118 -->

model, outperforming Qwen 2.5 32B, Gemma 2 and 3 27B, and narrowing the gap to top open-weight systems like Qwen 3 32B while being trained on fewer FLOPs (Table 14).

模型, 超过 Qwen 2.5 32B, Gemma 2 27B 和 Gemma 3 27B, 并在训练 FLOPs 更少的情况下缩小了与 Qwen 3 32B 等顶级 open-weight 系统的差距 (表 14).

1. Data: Dolci Think Building on prior open-source datasets (Guha et al., 2025a; Lambert et al., 2024; PrimeIntellect, 2025) inter alia, we introduce Dolci Think SFT, Dolci Think DPO, and Dolci Think RL, new cutting-edge post-training datasets designed to target a broad range of key capabilities such as math, coding, instruction following, and general conversation. The dataset includes synthetic examples with long thinking traces for supervised finetuning, high-contrast paired data for contrastive learning via preference optimization, and challenging prompts for reinforcement learning across diverse domains. Our data curation pipeline is shown in Figure 15.

1. 数据: Dolci Think 在先前开源数据集 (Guha et al., 2025a; Lambert et al., 2024; PrimeIntellect, 2025 等) 的基础上, 我们推出 Dolci Think SFT, Dolci Think DPO 和 Dolci Think RL, 这是一组新的前沿后训练数据集, 面向数学, 编码, 指令遵循和通用对话等一系列关键能力. 数据集包括用于监督微调的带长 thinking traces 的合成样本, 用于通过偏好优化做对比学习的高对比度配对数据, 以及覆盖多个领域, 用于强化学习的高难度提示. 我们的数据策展流水线见图 15.

2. Three-Stage training recipe We employ a three-stage post-training process comprising Supervised Finetuning (SFT), Preference Finetuning via Direct Preference Optimization (DPO), and then Reinforcement Learning with Verifiable Rewards (RLVR). We observe consistent gains across all three stages, demonstrating the impact of careful data curation, algorithmic refinement, and infrastructure development. This contrasts with most recent prior work on open thinking models, which typically employs only a subset of these training stages. For example, we find that our RL framework yields greater improvements when applied after contrastive learning with DPO rather than directly following SFT (Figure 19).

2. 三阶段训练配方 我们采用三阶段后训练流程: 监督微调 (SFT), 通过直接偏好优化 (DPO) 做偏好微调, 然后是带可验证奖励的强化学习 (RLVR). 我们在三个阶段都观察到一致的收益, 这说明了精心的数据策展, 算法改进和基础设施开发的作用. 这与近期大多数开放思考模型的工作形成对比, 它们通常只采用其中部分训练阶段. 例如, 我们发现 RL 框架在 DPO 对比学习之后应用, 比直接接在 SFT 之后应用带来更大的提升 (图 19).

3. OlmoRL We present OlmoRL, our RL training approach which builds upon GRPO and extends it with improvements from recent work. Additionally, we expand verifiable reasoning to multiple domains, going beyond the math and code settings typically explored in prior work. OlmoRL enables longer and more stable RL runs across diverse domains and increases the overall efficiency of training cycles (Section §4.4).

3. OlmoRL 我们提出 OlmoRL, 这是一套以 GRPO 为基础, 并融入近期工作改进的 RL 训练方法. 此外, 我们把可验证推理扩展到多个领域, 超出了先前工作通常只探索的数学和代码设定. OlmoRL 让跨多个领域的 RL 运行更长, 更稳定, 并提高了训练周期的整体效率 (第 §4.4 节).

### 4.1 Main Results for Olmo 3 Think (4.1 Olmo 3 Think 主结果)

#### 4.1.1 Evaluation Details (4.1.1 评测细节)

We establish a suite of benchmarks to evaluate Olmo 3 post-trained models on math, reasoning, coding, precise instruction following, question answering, knowledge recall, and general chat. We expand upon the evaluation suite of OLMo 2 (OLMo et al., 2024) by adding new, more challenging benchmarks and removing saturated or noisy ones. Table 16 shows our evaluation benchmarks and describes the task configurations and metrics for the Olmo 3 post-training evaluation suite. We establish a standard evaluation configuration between all baseline models, including thinking and instruct models, to simplify comparisons. Namely, we follow Guo et al. (2025); Adler et al. (2024); Yang et al. (2025a) and use a 32K max context length, a sampling temperature of 0.6 and top-p of 0.95. Note, some models likely perform better with a higher inference budget, for instance K2 V2 (Team et al., 2025) use a 128K sequence length. Further details of our evaluation settings are provided in Appendix A.8.

我们建立了一套基准, 从数学, 推理, 编码, 精确指令遵循, 问答, 知识回忆和通用对话几个方面评测 Olmo 3 的后训练模型. 我们在 OLMo 2 (OLMo et al., 2024) 评测套件的基础上, 加入了更有挑战的新基准, 去掉了已饱和或噪声大的基准. 表 16 列出了评测基准, 并说明了 Olmo 3 后训练评测套件的任务配置和指标. 我们为所有基线模型 (包括思考模型和指令模型) 建立统一的标准评测配置, 以便比较. 具体来说, 我们参照 Guo et al. (2025); Adler et al. (2024); Yang et al. (2025a), 使用 32K 最大上下文长度, 采样温度 0.6, top-p 0.95. 注意, 有些模型在更高的推理预算下表现可能更好, 例如 K2 V2 (Team et al., 2025) 使用 128K 序列长度. 评测设置的更多细节见附录 A.8.

Evaluation with reasoning models is both computationally expensive and often high variance. In our development of our recipe on versions of our 7B model—i.e., before the hyperparameter sweeps for final models—we find that evaluation costs between 10 and 20% of our compute budget. When compiling results, we measure the variance of every evaluation in our suite by taking the mean of the standard deviation from 3 runs of 14 models (both baselines and our final models). By taking the variance per model and then the average variance per evaluation, we can bucket the evaluations by their variance. We partition evaluations based on their variance as follows:

评测推理模型既耗算力, 方差也常常很大. 在用 7B 模型的各个版本开发配方时 (即在为最终模型做超参数扫描之前), 我们发现评测花掉了算力预算的 10% 到 20%. 汇总结果时, 我们对 14 个模型 (包括基线和我们的最终模型) 各跑 3 次, 取标准差的均值, 以此度量套件中每项评测的方差. 先求每个模型的方差, 再求每项评测的平均方差, 就能按方差给评测分桶. 我们按方差把评测划分如下:

• High variance: GPQA: 1.4798, AlpacaEval 3: 1.2406, IFEval: 0.8835.
• 高方差: GPQA: 1.4798, AlpacaEval 3: 1.2406, IFEval: 0.8835.

• Stable: ZebraLogic: 0.5638, Omega: 0.5579, AIME 24 (Avg@32): 0.5437, HumanEvalPlus: 0.4615, AgiEval: 0.4339, BigBenchHard: 0.3866.
• 稳定: ZebraLogic: 0.5638, Omega: 0.5579, AIME 24 (Avg@32): 0.5437, HumanEvalPlus: 0.4615, AgiEval: 0.4339, BigBenchHard: 0.3866.

• Very stable: LiveCodeBench (Avg@10): 0.2852, MBPPPlus: 0.2749, MATH: 0.2522, MMLU: 0.2219, PopQA: 0.1554.
• 非常稳定: LiveCodeBench (Avg@10): 0.2852, MBPPPlus: 0.2749, MATH: 0.2522, MMLU: 0.2219, PopQA: 0.1554.

<small><span class="docvortex-page-footnote" data-block-type="page_footnote" style="color:#6b7280">28<sub>More</sub> concretely, OpenThought3 and S1 only used supervised finetuning; SmolLM used SFT and DPO, but did not apply RL.</span></small>

<!-- page 38 of 118 -->

|  | SFT | Olmo 3 DPO | 32B Think TF3hin.i0nakl | TFh3ini.n1akl | Qw32eBn 3 | BaselQVTwLh3ein2nkB3 | inesD3S2-BR1 | 7sK0t2rB-uVIcn2t- |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Math |  |  |  |  |  |  |  |  |
| MATH | 95.6 | 95.9 | 96.1 | 96.2 | 95.4 | 96.7 | 92.6 | 94.5 |
| AIME 2024 | 73.5 | 76.0 | 76.8 | 80.6 | 80.8 | 86.3 | 70.3 | 78.4 |
| AIME 2025 | 66.2 | 70.7 | 72.5 | 78.1 | 70.9 | 78.8 | 56.3 | 70.3 |
| OMEGA | 43.1 | 45.2 | 50.6 | 53.4 | 47.7 | 50.8 | 38.9 | 46.1 |
| Reasoning |  |  |  |  |  |  |  |  |
| BigBenchHard | 88.8 | 89.1 | 89.8 | 88.6 | 90.6 | 91.1 | 89.7 | 87.6 |
| ZebraLogic | 70.5 | 74.5 | 76.0 | 80.1 | 88.3 | 96.1 | 69.4 | 79.2 |
| AGI Eval English | 85.9 | 87.8 | 88.2 | 88.8 | 90.0 | 92.2 | 88.1 | 89.6 |
| Coding |  |  |  |  |  |  |  |  |
| HumanEvalPlus | 90.0 | 91.6 | 91.4 | 91.5 | 91.2 | 90.6 | 92.3 | 88.0 |
| MBPP+ | 66.7 | 67.2 | 68.0 | 68.3 | 70.6 | 66.2 | 70.1 | 66.0 |
| LiveCodeBench v3 | 75.8 | 81.9 | 83.5 | 83.3 | 90.2 | 84.8 | 79.5 | 78.4 |
| IF |  |  |  |  |  |  |  |  |
| IFEval | 83.9 | 80.6 | 89.0 | 93.8 | 86.5 | 85.5 | 78.7 | 68.7 |
| IFBench | 37.0 | 34.4 | 47.6 | 68.1 | 37.3 | 55.1 | 23.8 | 46.3 |
| Knowledge &amp; QA |  |  |  |  |  |  |  |  |
| MMLU | 85.3 | 85.2 | 85.4 | 86.4 | 88.8 | 90.1 | 88.0 | 88.4 |
| PopQA | 33.1 | 37.0 | 31.9 | 30.9 | 30.7 | 32.2 | 26.7 | 32.2 |
| GPQA | 55.7 | 57.6 | 58.1 | 56.7 | 67.3 | 67.4 | 61.8 | 64.0 |
| Chat |  |  |  |  |  |  |  |  |
| AlpacaEval 2 LC | 69.1 | 78.6 | 74.2 | 69.1 | 75.6 | 80.9 | 26.2 | - |
| Safety | 64.8 | 65.3 | 68.8 | 83.6 | 69.0 | 82.7 | 63.6 | 88.5 |

Table 14 Results on our flagship model Olmo 3 Think 32B on our post-training evaluation suite. Olmo 3.1 Think 32B is the best fully-open model at 32B.

表 14｜旗舰模型 Olmo 3 Think 32B 在后训练评测套件上的结果. Olmo 3.1 Think 32B 是 32B 规模上最好的 fully-open 模型.

#### 4.1.2 Main Results (4.1.2 主结果)

Table 14 and Table 15 show the performance of Olmo 3 Think across different training stages and compare it with other baselines of similar scale on our benchmarks<sup>29</sup>. As described before, Olmo 3 Think 32B is the best fully-open model at the 32B scale, outperforming other models including Gemma 2 27B, Gemma 3 27B, and Qwen 2.5 32B-Instruct. It narrows the gap to the best open-weight models at this scale, Qwen 3 and Qwen 3VL, while being trained with 6x fewer tokens. Similarly, Olmo 3 Think-7B outperforms OpenReasoning Nemotron 7B, DeepSeek-R1-Distill-Qwen-7B, and OpenThinker-7B, some of the best open-weight thinking models. In addition, it performs similarly to Nemotron-Nano-9B-v2 despite being smaller. At 7B, it lags the Qwen 3 series of models in knowledge tasks. We think that this is mainly due to the fact that Qwen 3 models are trained through distillation from Qwen’s largest model.

表 14｜表 14 和表 15 展示了 Olmo 3 Think 在不同训练阶段的表现, 并在我们的基准上与规模相近的其他基线比较<sup>29</sup>. 如前所述, Olmo 3 Think 32B 是 32B 规模上最好的 fully-open 模型, 超过了 Gemma 2 27B, Gemma 3 27B 和 Qwen 2.5 32B-Instruct 等模型. 它缩小了与这一规模最好的 open-weight 模型 Qwen 3 和 Qwen 3VL 的差距, 而训练 token 少了 6 倍. 类似地, Olmo 3 Think-7B 超过了 OpenReasoning Nemotron 7B, DeepSeek-R1-Distill-Qwen-7B 和 OpenThinker-7B 这些最好的 open-weight 思考模型中的几个. 此外, 它虽然更小, 表现却与 Nemotron-Nano-9B-v2 相近. 在 7B 规模上, 它在知识类任务上落后于 Qwen 3 系列模型. 我们认为这主要是因为 Qwen 3 模型是从 Qwen 最大的模型蒸馏训练出来的.

Notably, we introduce Olmo 3.1 Think 32B to illustrate that extended OlmoRL training, via additional epochs on our Dolci Think RL dataset<sup>30</sup>, leads to improved performance. We observe substantial improvements on math, reasoning, and instruction-following benchmarks, including gains of 4+ points on AIME, 4 points on ZebraLogic, 4 points on IFEval, and 20 points on IFBench, suggesting the additional RL training improves the model’s reasoning abilities. Most other benchmarks remain largely unchanged, with the exception of AlpacaEval, where we observe a 5-point drop.

值得一提的是, 我们推出 Olmo 3.1 Think 32B, 用来说明延长 OlmoRL 训练 (在 Dolci Think RL 数据集上多训练几个 epoch<sup>30</sup>) 能带来更好的表现. 我们在数学, 推理和指令遵循基准上观察到显著提升, 包括 AIME 提升 4 分以上, ZebraLogic 提升 4 分, IFEval 提升 4 分, IFBench 提升 20 分, 说明额外的 RL 训练提升了模型的推理能力. 其他大多数基准基本不变, 只有 AlpacaEval 下降了 5 分.

### 4.2 Supervised Finetuning with Dolci Think SFT (4.2 用 Dolci Think SFT 做监督微调)

In this stage, we construct Dolci Think SFT, a resource for finetuning the base model to produce explicit thinking traces that support accurate responses. This supervised finetuning step is especially impactful for

在这一阶段, 我们构建 Dolci Think SFT, 用它微调 base 模型, 使其生成支撑准确回答的显式 thinking traces. 这一监督微调步骤对

<small><span class="docvortex-page-footnote" data-block-type="page_footnote" style="color:#6b7280">29<sub>Running</sub> AlpacaEval on K2-V2-Instruct led to token-parsing errors on the output of the LLM judge, resulting in null preference scores. If we are able to devise a solution, we will update the report accordingly.</span></small>

<small><span class="docvortex-page-footnote" data-block-type="page_footnote" style="color:#6b7280">30<sub>While</sub> Olmo 3 Think 32B was trained for 750 steps, we continued the run past our initial release, going up to 2300 steps for Olmo 3.1 Think 32B. We stopped there due to compute limitations, but note that performance had not yet fully saturated, suggesting even longer runs could further improve performance.</span></small>

<!-- page 39 of 118 -->

|  | O SFT | lmo 3 7B DPO | Think TFhininakl | TOhip7nBekne-r3 | N9NeBmanvoo2tro | Basel n <sup>D</sup>Q<sup>S</sup>w7-Be<sup>R</sup>n1 | ines Qw8eBn 3 | QTVwhLei8nnBk3 | NeOm7BRotro |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Math |  |  |  |  |  |  |  |  |  |
| MATH | 94.4 | 92.4 | 95.1 | 94.5 | 94.4 | 87.9 | 95.1 | 95.2 | 94.6 |
| AIME 2024 | 69.6 | 74.6 | 71.6 | 67.7 | 72.1 | 54.9 | 74.0 | 70.9 | 77.0 |
| AIME 2025 | 57.6 | 62.7 | 64.6 | 57.2 | 58.9 | 40.2 | 67.8 | 61.5 | 73.1 |
| OMEGA | 37.8 | 40.5 | 45.0 | 38.4 | 42.4 | 28.5 | 43.4 | 38.1 | 43.2 |
| Reasoning |  |  |  |  |  |  |  |  |  |
| BigBenchHard | 84.1 | 83.7 | 86.6 | 77.1 | 86.2 | 73.5 | 84.4 | 86.8 | 81.3 |
| ZebraLogic | 57.9 | 60.6 | 66.5 | 34.9 | 60.8 | 26.1 | 85.2 | 91.2 | 22.4 |
| AGI Eval English | 77.2 | 79.1 | 81.5 | 78.6 | 83.1 | 69.5 | 87.0 | 90.1 | 81.4 |
| Coding |  |  |  |  |  |  |  |  |  |
| HumanEvalPlus | 88.2 | 91.4 | 89.9 | 87.4 | 89.7 | 83.0 | 80.2 | 83.7 | 89.7 |
| MBPP+ | 63.2 | 63.0 | 64.7 | 61.4 | 66.1 | 63.5 | 69.1 | 63.0 | 61.2 |
| LiveCodeBench v3 | 67.8 | 75.1 | 75.2 | 68.0 | 83.4 | 58.8 | 86.2 | 85.5 | 82.3 |
| IF |  |  |  |  |  |  |  |  |  |
| IFEval | 77.9 | 75.9 | 88.2 | 51.7 | 86.0 | 59.6 | 87.4 | 85.5 | 42.5 |
| IFBench | 30.0 | 28.3 | 41.6 | 23.0 | 34.6 | 16.7 | 37.1 | 40.4 | 23.4 |
| Knowledge &amp; QA |  |  |  |  |  |  |  |  |  |
| MMLU | 74.9 | 74.8 | 77.8 | 77.4 | 84.3 | 67.9 | 85.4 | 86.5 | 80.7 |
| PopQA | 20.8 | 24.7 | 23.7 | 18.0 | 17.9 | 12.8 | 24.3 | 29.3 | 14.5 |
| GPQA | 45.8 | 48.6 | 46.2 | 47.6 | 56.2 | 54.4 | 57.7 | 61.5 | 56.6 |
| Chat |  |  |  |  |  |  |  |  |  |
| AlpacaEval 2 LC | 43.9 | 50.6 | 52.1 | 24.0 | 58.0 | 7.7 | 60.5 | 73.5 | 8.6 |
| Safety | 65.8 | 67.7 | 70.7 | 31.6 | 72.1 | 54.0 | 68.3 | 82.9 | 30.3 |

Table 15 Overview of results of Olmo 3 Think 7B on our post-training evaluation suite. All numbers are the mean of three runs. We evaluate all models using our evaluation framework, generating up to a maximum of 32768 tokens.

表 15｜Olmo 3 Think 7B 在后训练评测套件上的结果概览. 所有数字都是三次运行的均值. 所有模型都用我们的评测框架评测, 最多生成 32768 token.

smaller models, offering an efficient mechanism for acquiring strong reasoning capabilities. We next detail the Dolci Think SFT data curation pipeline (Figure 15).

较小的模型尤其有效, 是获得强推理能力的一种高效机制. 接下来详述 Dolci Think SFT 的数据策展流水线 (图 15).

#### 4.2.1 Dolci Think SFT: Data Curation (4.2.1 Dolci Think SFT: 数据策展)

To curate Dolci Think SFT, we compile a large collection of prompts across a diverse set of skills from other open efforts (e.g., Guha et al., 2025a; PrimeIntellect, 2025), substantially filter them, and synthetically generate reasoning traces for their completions. An overview of the Dolci Think SFT data mix is shown in Table 17 and is described below:

为了策展 Dolci Think SFT, 我们从其他开放工作 (例如 Guha et al., 2025a; PrimeIntellect, 2025) 中汇集了覆盖多种技能的大量提示, 对它们做了大幅过滤, 并为其补全合成生成推理轨迹. Dolci Think SFT 数据混合的概览见表 17, 说明如下:

**Step 1: sourcing prompts and generating reasoning traces (步骤 1: 采集提示并生成推理轨迹)**

• Math We source prompts from the math subsets of OpenThoughts3 (Guha et al., 2025a) and SYNTHETIC 2 (PrimeIntellect, 2025). For OpenThoughts3 prompts, we use all the available math prompts (maintaining
• 数学 我们从 OpenThoughts3 (Guha et al., 2025a) 和 SYNTHETIC 2 (PrimeIntellect, 2025) 的数学子集获取提示. 对 OpenThoughts3 的提示, 我们使用全部可用的数学提示 (保持

![Image block](images/p39-figure-15-data-pipeline-for-all-olmo-3-post-training.png)

Figure 15 Data pipeline for all Olmo 3 post-training stages. We share most steps across SFT, DPO and RL to ensure consistent quality.

图 15｜Olmo 3 所有后训练阶段的数据流水线. SFT, DPO 和 RL 共用大部分步骤, 以保证质量一致.

hi39

<!-- page 40 of 118 -->

<table><tr><td>Task</td><td>Format</td><td>Metric</td><td>Temp</td><td>Top-p</td><td>Ans. Extract</td><td>Max Toks</td><td>N</td><td># Sub</td></tr><tr><td colspan="9">Chat Suite</td></tr><tr><td>IF Eval (2023)</td><td>CoT</td><td>Custom</td><td>0.6</td><td>0.95</td><td>Custom</td><td>32768</td><td>1</td><td>-</td></tr><tr><td>Minerva MATH (2022)</td><td>CoT EM</td><td>EM Flex</td><td>0.6</td><td>0.95</td><td>Minerva</td><td>32768</td><td>1</td><td>7</td></tr><tr><td>MATH 500 (2022; 2023)</td><td>CoT EM</td><td>EM Flex</td><td>0.6</td><td>0.95</td><td>Minerva</td><td>32768</td><td>1</td><td>-</td></tr><tr><td>AIME 2024*</td><td>CoT EM</td><td>EM Flex</td><td>0.6</td><td>0.95</td><td>Minerva</td><td>32768</td><td>32</td><td>-</td></tr><tr><td>AIME 2025*</td><td>CoT EM</td><td>EM Flex</td><td>0.6</td><td>0.95</td><td>Minerva</td><td>32768</td><td>32</td><td>-</td></tr><tr><td>Omega Math (2025)</td><td>CoT EM</td><td>EM Flex</td><td>0.6</td><td>0.95</td><td>Custom Regexes</td><td>32768</td><td>1</td><td>55</td></tr><tr><td>HumanEval+ (2023b)</td><td>CoT Code</td><td>pass@1</td><td>0.6</td><td>0.95</td><td>Split on ““</td><td>32768</td><td>10</td><td>-</td></tr><tr><td>MBPP+* (2023b)</td><td>CoT Code</td><td>pass@1</td><td>0.6</td><td>0.95</td><td>Split on ““</td><td>32768</td><td>10</td><td>-</td></tr><tr><td>LiveCodeBench v3* (2024)</td><td>CoT Code</td><td>pass@1</td><td>0.6</td><td>0.95</td><td>Split on ““</td><td>32768</td><td>10</td><td>-</td></tr><tr><td>ZebraLogic* (2025)</td><td>CoT JSON</td><td>Custom</td><td>0.6</td><td>0.95</td><td>Custom JSON</td><td>32768</td><td>1</td><td>-</td></tr><tr><td>BigBench-Hard (2022)</td><td>CoT EM</td><td>EM Flex</td><td>0.6</td><td>0.95</td><td>OLMO 3 Regex</td><td>32768</td><td>1</td><td>23</td></tr><tr><td>GPQA* (2024)</td><td>CoT MC</td><td>Acc</td><td>0.6</td><td>0.95</td><td>OLMO 3 Regex</td><td>32768</td><td>1</td><td>-</td></tr><tr><td>AGI Eval* (2023)</td><td>CoT MC</td><td>Acc</td><td>0.6</td><td>0.95</td><td>OLMO 3 Regex</td><td>32768</td><td>1</td><td>9</td></tr><tr><td>MMLU (2021b)</td><td>CoT MC</td><td>Acc</td><td>0.6</td><td>0.95</td><td>OLMO 3 Regex</td><td>32768</td><td>1</td><td>57</td></tr><tr><td>PopQA (2022)</td><td>CoT MC</td><td>Acc</td><td>0.6</td><td>0.95</td><td>EM Recall</td><td>32768</td><td>1</td><td>-</td></tr><tr><td>SimpleQA* (2024)</td><td>-</td><td>-</td><td>-</td><td>-</td><td>-</td><td>-</td><td>1</td><td>-</td></tr><tr><td>Alpaca Eval v2 (2023b; 2024)</td><td>CoT</td><td>Winrate</td><td>0.6</td><td>0.95</td><td>-</td><td>32768</td><td>1</td><td>-</td></tr><tr><td>BFCL* (2025)</td><td>-</td><td>-</td><td>-</td><td>-</td><td>-</td><td>-</td><td>1</td><td>-</td></tr><tr><td>LitQA2* (2024)</td><td>-</td><td>-</td><td>-</td><td>-</td><td>-</td><td>-</td><td>1</td><td>-</td></tr></table>

Table 16 Details of the Olmo 3 chat evaluation suite. We mark tasks with \* to indicate new additions compared to the OLMo 2 suite (OLMo et al., 2024). All evaluation generations have thinking traces (text between &lt;think&gt;...&lt;/think&gt;) stripped before passing to the answer scorer. We use zero-shot setting for all metrics.

表 16｜Olmo 3 聊天评测套件的细节. 带 \* 的任务表示相比 OLMo 2 套件 (OLMo et al., 2024) 新增的任务. 所有评测生成在交给答案评分器之前都会去掉 thinking traces (位于 &lt;think&gt;...&lt;/think&gt; 之间的文本). 所有指标均使用零样本设定.

<table><tbody><tr><td>Category</td><td>Prompt Dataset</td><td>7B Count</td><td>32B Count</td><td>Reference</td></tr><tr><td>Chat &amp;</td><td>WildChat</td><td>83,054</td><td>76,209</td><td>Zhao et al. (2024a)</td></tr><tr><td rowspan="3">Precise IF</td><td>OpenAssistant</td><td>6,800</td><td>6,647</td><td>Köpf et al. (2024)</td></tr><tr><td>Dolci Think Persona Precise IF</td><td>223,123</td><td>220,530</td><td>-</td></tr><tr><td>Dolci Think Precise IF⇑</td><td>135,792</td><td>135,722</td><td>-</td></tr><tr><td rowspan="3">Math</td><td>Dolci Think OpenThoughts 3+ Math</td><td>752,997</td><td>752,997</td><td>Guha et al. (2025a)</td></tr><tr><td>⇑Dolci Think OpenThoughts 3+ STEM</td><td>99,269</td><td>99,268</td><td>Guha et al. (2025a)</td></tr><tr><td>SYNTHETIC-2-SFT-Verified</td><td>104,569</td><td>104,548</td><td>PrimeIntellect (2025)</td></tr><tr><td rowspan="3">Coding</td><td>Nemotron Post-Training Code⇑</td><td>113,777</td><td>113,777</td><td>NVIDIA AI (2025)</td></tr><tr><td>Dolci Think OpenThoughts 3+ Code</td><td>88,900</td><td>88,899</td><td>Guha et al. (2025a)</td></tr><tr><td>⇑Dolci Think Python Algorithms</td><td>466,677</td><td>466,676</td><td>-</td></tr><tr><td rowspan="3">Safety</td><td>CoCoNot</td><td>10,227</td><td>9,549</td><td>Brahman et al. (2024)</td></tr><tr><td>WildGuardMix</td><td>38,315</td><td>36,673</td><td>Han et al. (2024)</td></tr><tr><td>WildJailbreak</td><td>41,100</td><td>40,002</td><td>Jiang et al. (2024)</td></tr><tr><td>Multilingual</td><td>Aya</td><td>98,597</td><td>97,156</td><td>Singh et al. (2024)</td></tr><tr><td rowspan="2">Other</td><td>TableGPT</td><td>4,981</td><td>4,973</td><td>Zha et al. (2023)</td></tr><tr><td>Olmo Identity Prompts</td><td>290</td><td>290</td><td>-</td></tr><tr><td>Total</td><td></td><td>2,268,468</td><td>2,253,916</td><td></td></tr></tbody></table>

Table 17 Olmo 3 Think SFT prompt sources.⇑indicates prompt datasets where the datasets are upsampled by repeating prompts with different completions. Prior to Olmo 3 32B training, we filter responses with non-Olmo model identities and irrelevant prompts (e.g. generate a photo).

表 17｜Olmo 3 Think SFT 的提示来源. ⇑表示该提示数据集通过为同一提示配不同补全的方式重复, 做了上采样. 在 Olmo 3 32B 训练之前, 我们过滤掉了带有非 Olmo 模型身份的回答和无关提示 (例如生成一张照片).

the 16X repetition from the original) and the available reasoning traces with complete solutions. For incomplete traces, we generate full reasoning chains and solutions using QwQ-32B, the original model used for the completions, and the same generation settings as OpenThoughts3, except up to 32K tokens instead of the original 16K. We discard any examples that are still incomplete after regenerating. For

原始数据中的 16 倍重复) 以及带完整解答的可用推理轨迹. 对不完整的轨迹, 我们用 QwQ-32B (原补全所用的模型) 生成完整的推理链和解答, 生成设置与 OpenThoughts3 相同, 只是最长可到 32K token, 而非原来的 16K. 重新生成后仍不完整的样本一律丢弃. 对于

<!-- page 41 of 118 -->

SYNTHETIC-2, we take completions directly from the verified subsection.

SYNTHETIC-2, 我们直接从已验证的子集中取补全.

• Code We collect code prompts from different sources and generate completions for them. To create Dolci Think Python Algorithms, we source prompts from AceCoder (Zeng et al., 2025a), the Python subset of The Algorithms (The Algorithms, 2025), Llama Nemotron Post-training (Bercovich et al., 2025), and OpenCodeReasoning (Ahmad et al., 2025), and then we generate up to 16 responses per prompt from QwQ-32B, which we filter for correctness using synthetically generated test cases from GPT-4.1. For OpenThoughts 3 code prompts, we downsample each prompt to at most 16 times and regenerate complete responses for all incomplete examples. We combine Dolci Think Python Algorithms with the code prompts from OpenThoughts3, downsample them to 16 repetitions, and regenerate completions for incomplete ones.
• 代码 我们从不同来源收集代码提示, 并为其生成补全. 为了构建 Dolci Think Python Algorithms, 我们从 AceCoder (Zeng et al., 2025a), The Algorithms 的 Python 子集 (The Algorithms, 2025), Llama Nemotron Post-training (Bercovich et al., 2025) 和 OpenCodeReasoning (Ahmad et al., 2025) 获取提示, 然后用 QwQ-32B 为每个提示最多生成 16 个回答, 再用 GPT-4.1 合成生成的测试用例按正确性过滤. 对 OpenThoughts 3 的代码提示, 我们把每个提示下采样到最多 16 次, 并为所有不完整的样本重新生成完整回答. 我们把 Dolci Think Python Algorithms 与 OpenThoughts3 的代码提示合并, 下采样到 16 次重复, 并为不完整的样本重新生成补全.

• Chat & safety We source chat prompts from both the Tülu 3 (Lambert et al., 2024) subset of Wild-Chat (Zhao et al., 2024a), as well as WildChat prompts not used during Tülu 3, and the Tülu 3 subset of OpenAssistant (Köpf et al., 2024). For safety, we reuse safety prompts used during Tülu 3. We then generate reasoning traces and completions from DeepSeek R1 (Guo et al., 2025).
• 对话与安全 我们的对话提示来自 WildChat (Zhao et al., 2024a) 的 Tülu 3 (Lambert et al., 2024) 子集, Tülu 3 期间未使用的 WildChat 提示, 以及 OpenAssistant (Köpf et al., 2024) 的 Tülu 3 子集. 安全方面, 我们复用 Tülu 3 期间使用的安全提示. 然后用 DeepSeek R1 (Guo et al., 2025) 生成推理轨迹和补全.

• Precise instruction following We source precise IF prompts from the overall Tülu 3 mix with additional verifiable constraints added from Pyatkin et al. (2025). We also regenerate Persona IF prompts as in Tülu 3, but with personas sourced from Meyer and Corneil (2025). We then generate responses for each prompt using QwQ-32B, and we verify responses using verifiers associated with each constraint, keeping only the correct responses.
• 精确指令遵循 我们从整体 Tülu 3 混合中获取精确 IF 提示, 并加入来自 Pyatkin et al. (2025) 的额外可验证约束. 我们还按 Tülu 3 的方式重新生成 Persona IF 提示, 但人设取自 Meyer and Corneil (2025). 然后用 QwQ-32B 为每个提示生成回答, 并用与每条约束对应的验证器检验回答, 只保留正确的回答.

• Science & other We source science prompts from the OpenThoughts3 science subset. For other data sources, we include the TableGPT (Zha et al., 2023) subset in Tülu 3 for data transformation and Aya (Singh et al., 2024) for chat and basic multilinguality. We regenerate incomplete responses in OpenThoughts3 as we did for the math and code subsets, and we generate responses with reasoning chains for the other datasets using DeepSeek R1.
• 科学与其他 科学提示来自 OpenThoughts3 的科学子集. 其他数据来源方面, 我们纳入 Tülu 3 中用于数据转换的 TableGPT (Zha et al., 2023) 子集, 以及用于对话和基础多语言能力的 Aya (Singh et al., 2024). 对 OpenThoughts3 中不完整的回答, 我们按数学和代码子集的做法重新生成; 对其他数据集, 用 DeepSeek R1 生成带推理链的回答.

**Step 2: filtering** We perform extensive filtering on the data we have collected and generated.

**步骤 2: 过滤** 我们对收集和生成的数据做了大量过滤.

• Heuristic filtering We filter out examples with (1) non-commercial or unclear licenses, (2) incomplete reasoning chains, (3) domain-specific inaccuracies (i.e., verifying the constraint-adherence of instructionfollowing data or executing test cases against model completions for code), (4) mentions of other model developers and date cutoffs, (5) excessive repetition, and (6) an excessive number of Chinese characters or Chinese political values reflected in reasoning chains.
• 启发式过滤 我们过滤掉以下样本: (1) 非商用或许可不明确的, (2) 推理链不完整的, (3) 存在领域特定错误的 (即检验指令遵循数据是否遵守约束, 或对代码补全运行测试用例), (4) 提及其他模型开发者和知识截止日期的, (5) 重复过多的, (6) 推理链中中文字符过多或体现中国政治价值观的.

• Topic filtering We classify our dataset by topic using the OpenAI query taxonomy (Chatterji et al., 2025), and find that filtering out and downsampling topics irrelevant to our model (e.g., requests to generate images or excessive basic greetings) from WildChat qualitatively improves model behavior. See Appendix A.7.1 for detailed descriptions and links to filter scripts.
• 主题过滤 我们用 OpenAI 查询分类体系 (Chatterji et al., 2025) 按主题给数据集分类, 发现从 WildChat 中过滤掉并下采样与我们模型无关的主题 (例如生成图片的请求或过多的基本问候), 能在定性上改善模型行为. 详细说明和过滤脚本链接见附录 A.7.1.

**Step 3: data mixing** For data mixing, we follow a methodology similar to that described in the midtraining section (Section §3.5) for parallel data collection, adhering to shared standards for data mixing and conducting multiple rounds of integration testing. More specifically, we conduct careful experiments using a small “base” mix, consisting of 100K examples taken from our extended OpenThought 3 dataset. We found that this base mix was performant enough on key reasoning benchmarks to serve as a strong baseline, while saving substantial amounts of compute versus training on the full mix. We then train individual models on the base mix combined with up to 100K training examples (without upsampling) from each category to observe the impact on our evaluation suite. As shown in Table 18, we generally find that each dataset is helpful on at least one evaluation, and so our final mix includes at least a portion of each dataset we tested.

**步骤 3: 数据混合** 在数据混合上, 我们采用与 midtraining 一节 (第 §3.5 节) 所述类似的并行数据收集方法, 遵循共同的数据混合标准, 并进行多轮集成测试. 具体来说, 我们用一个小的 「base」 混合做细致实验, 它包含从扩展版 OpenThought 3 数据集中取出的 100K 样本. 我们发现这个 base 混合在关键推理基准上表现足够好, 可以作为一个强基线, 同时比在完整混合上训练节省大量算力. 然后我们用 base 混合加上每个类别最多 100K 训练样本 (不做上采样) 分别训练模型, 观察对评测套件的影响. 如表 18 所示, 我们总体上发现每个数据集至少对一项评测有帮助, 因此最终混合至少纳入了我们测试过的每个数据集的一部分.

**Step 4: decontamination** We followed the recommended settings from the Tülu 3 Decontamination Procedure and toolkit (Lambert et al., 2024) to filter out the portions of all post-training data (all three stages) that matched the evaluation sets. We used n-gram matching with 8-grams and an overlap threshold of 0.5 (i.e., at least 50% of the n-grams in the test instance match a training instance) for filtering. We developed additional heuristics to mitigate false positives: (1) we ignored matches of task-irrelevant chunks of text, e.g., common

**步骤 4: 去污染** 我们按 Tülu 3 去污染流程与工具包 (Lambert et al., 2024) 的推荐设置, 过滤掉所有后训练数据 (三个阶段) 中与评测集匹配的部分. 过滤时使用 8-gram 的 n-gram 匹配, 重叠阈值为 0.5 (即测试样本中至少 50% 的 n-gram 与某个训练样本匹配). 我们还设计了额外的启发式规则来减少误报: (1) 忽略与任务无关文本块的匹配, 例如常见

<small><span class="docvortex-page-footnote" data-block-type="page_footnote" style="color:#6b7280">31<sub>To</sub> evaluate the impact of our filtering process, we manually created an internal benchmark to vibe test the model.</span></small>

<!-- page 42 of 118 -->

|  |  |  | S | ubset of | Olmo 3 T | hink Ben | chmark | s |  |  |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Name | Avg. | MMLU | BBH | GPQA | Zebra | MATH | CHE | MBPP | AE | IFEval |
| Base mix | 39.2 | 52.4 | 48.7 | 31.0 | 21.0 | 74.6 | 35.4 | 34.7 | 19.0 | 35.7 |
| Base + Aya | 41.9 | 54.4 | 55.7 | 33.9 | 22.7 | 74.0 | 30.5 | 36.0 | 30.2 | 39.6 |
| Base + WildChat and OAsst | 44.2 | 58.3 | 53.3 | 31.7 | 25.8 | 74.0 | 28.7 | 38.4 | 38.5 | 48.8 |
| Base + Persona IF | 45.9 | 64.1 | 55.1 | 31.3 | 25.1 | 74.5 | 25.0 | 33.9 | 34.2 | 70.4 |
| Base + Safety | 40.9 | 53.8 | 49.7 | 30.1 | 22.0 | 74.2 | 31.7 | 33.1 | 33.0 | 40.9 |
| Base + Synthetic 2 | 47.3 | 66.5 | 54.0 | 35.5 | 27.8 | 82.0 | 39.6 | 39.7 | 26.9 | 53.4 |
| Swap base code to Nemotron Code | 34.5 | 48.6 | 43.4 | 33.0 | 19.3 | 74.4 | 22.6 | 26.2 | 16.6 | 26.6 |
| Swap base code to Dolci Python Algorithms | 36.9 | 48.0 | 47.2 | 33.0 | 15.9 | 72.1 | 30.5 | 37.8 | 18.1 | 29.4 |

Table 18 Results of our thinking SFT mixing ablations on top of an internal OLMo 2 long context checkpoint.

表 18｜在内部 OLMo 2 长上下文 checkpoint 之上做的思考 SFT 混合消融结果.

generic phrases, with the irrelevance determined per task based on manual inspection; (2) particularly in math datasets, we ignored matches of n-grams where most of the tokens are of length 1 (typically math symbols).

通用短语, 是否无关由人工检查逐任务判定; (2) 尤其在数学数据集中, 忽略大部分 token 长度为 1 (通常是数学符号) 的 n-gram 匹配.

#### 4.2.2 Training (4.2.2 训练)

For supervised finetuning, we switch from Open Instruct to OLMo-core, resulting in an 8× increase in training throughput. See Appendix A.6.1 for more information about our training settings and hyperparameters. We train all models for two epochs to avoid overfitting, and perform a learning-rate sweep to select the best candidate checkpoints based on our evaluation suite. We then test each candidate checkpoint with a series of qualitative “vibe-test” questions to inform our final checkpoint selection. Finally, we explore model souping (Wortsman et al., 2022; Morrison et al., 2024), and our final thinking SFT checkpoint is a linearly weighted merge of two checkpoints trained with different learning rates, merged with mergekit (Goddard et al., 2024).

监督微调方面, 我们从 Open Instruct 切换到 OLMo-core, 训练吞吐量提高了 8 倍. 训练设置和超参数的更多信息见附录 A.6.1. 为避免过拟合, 所有模型都训练两个 epoch, 并做学习率扫描, 根据评测套件选出最佳候选 checkpoint. 然后我们用一系列定性的 「vibe-test」 问题测试每个候选 checkpoint, 以决定最终的 checkpoint. 最后, 我们探索了 model souping (Wortsman et al., 2022; Morrison et al., 2024), 最终的思考 SFT checkpoint 是用 mergekit (Goddard et al., 2024) 对两个不同学习率训练出的 checkpoint 做线性加权合并得到的.

### 4.3 Preference Tuning with Delta Learning (4.3 用 Delta Learning 做偏好调优)

Prior work in general post-training has positioned preference tuning primarily as a means to improve alignment with human values and preferences (Lambert et al., 2024; Lambert, 2025). Hence, most recent efforts in building capability-oriented thinking models (Guha et al., 2025a; Ahmad et al., 2025) have not incorporated preference tuning (one exception is SmolLM3; Bakouch et al. (2025)). We rethink preference tuning as a stage of contrastive learning that drives capability gains beyond what SFT alone can provide. We introduce Dolci Think DPO, a preference dataset containing completion pairs with clear capability deltas. We leverage these relative contrasts to enhance the model’s reasoning capabilities via preference optimization, extending the ideas from Delta Learning (Geng et al., 2025).

通用后训练领域的先前工作主要把偏好调优定位为提升与人类价值观和偏好对齐的手段 (Lambert et al., 2024; Lambert, 2025). 因此, 近期大多数构建面向能力的思考模型的工作 (Guha et al., 2025a; Ahmad et al., 2025) 都没有纳入偏好调优 (一个例外是 SmolLM3; Bakouch et al. (2025)). 我们把偏好调优重新看作一个对比学习阶段, 它能带来 SFT 单独无法提供的能力提升. 我们推出 Dolci Think DPO, 这是一个偏好数据集, 包含能力差异明确的补全对. 我们利用这些相对对比, 通过偏好优化增强模型的推理能力, 这是对 Delta Learning (Geng et al., 2025) 思路的延伸.

In particular, we find that further supervised finetuning on thinking traces generated by Qwen3 32B (one of the few open-thought models) outright hurts the performance of Olmo 3 Think SFT, indicating that we are approaching saturation on learning from imitation. To extract a useful training signal out of these now-ineffective completions, we apply Delta Learning’s principle by pairing these completions with even worse responses (Geng et al., 2025); minimizing the quality of the rejected completions (thus increasing the quality delta) yields a useful contrastive signal for preference tuning.

具体来说, 我们发现在 Qwen3 32B (少数开放思考过程的模型之一) 生成的 thinking traces 上继续做监督微调, 反而直接损害了 Olmo 3 Think SFT 的表现, 这说明模仿学习已接近饱和. 为了从这些如今已无效的补全中榨出有用的训练信号, 我们应用 Delta Learning 的原则, 把这些补全与更差的回答配对 (Geng et al., 2025); 把被拒补全的质量压到最低 (从而拉大质量差), 就能为偏好调优提供有用的对比信号.

With these insights in mind, we construct Dolci Think DPO, which we use to improve the model’s performance across a wide range of benchmarks. We use Direct Preference Optimization (DPO) (Rafailov et al., 2024) for training with pairwise data. Details of DPO training are provided in Appendix A.6.2.

基于这些认识, 我们构建了 Dolci Think DPO, 用它在大量基准上提升模型表现. 我们用直接偏好优化 (DPO) (Rafailov et al., 2024) 在成对数据上训练. DPO 训练的细节见附录 A.6.2.

**Delta Learning** The intuition behind delta-learning is that the quality of preference data depends primarily on the quality of the delta between chosen and rejected responses rather than the quality of either response individually. By constructing preference pairs $( x , y _ { c } , y _ { r } )$ that exhibit capability-relevant contrasts with $y _ { c } \succ y _ { r } ,$ tuning to prefer $y _ { c }$ over $y _ { r }$ can improve the model even when supervised finetuning on $y _ { c }$ would not help or even actively hurt (Geng et al., 2025; D’Oosterlinck et al., 2025; Kim et al., 2025).

**Delta Learning** delta-learning 背后的直觉是: 偏好数据的质量主要取决于被选回答与被拒回答之间差值的质量, 而不是其中任一回答本身的质量. 通过构造体现能力相关对比的偏好对 $( x , y _ { c } , y _ { r } )$, 其中 $y _ { c } \succ y _ { r } ,$ 调优模型使其偏好 $y _ { c }$ 而非 $y _ { r }$, 即便在 $y _ { c }$ 上做监督微调没有帮助甚至有害, 也能改进模型 (Geng et al., 2025; D’Oosterlinck et al., 2025; Kim et al., 2025).

<!-- page 43 of 118 -->

|  |  | # Prompts |  |
| --- | --- | --- | --- |
| Category | Prompt Dataset | used in DPO | Reference |
| Chat &amp; | WildChat | 40,701 | Zhao et al. (2024a) |
| Precise IF | Dolci Instruct Precise IF Tülu 3 Persona IF OpenAssistant | 19,3653,4861,762 | -Lambert et al. (2024) Köpf et al. (2024) |
| Math | Tülu 3 Persona MATH Tülu 3 Persona Algebra Tülu 3 Persona GSM OpenMathInstruct 2 | 10,6571,4173,6813,615 | Lambert et al. (2024) Lambert et al. (2024) Lambert et al. (2024) Toshniwal et al. (2024) |
| Coding | Dolci Instruct Python Algorithms Tülu 3 Persona Python Evol CodeAlpaca | 13,2362,5147,634 | -Lambert et al. (2023) Luo et al. (2023) |
| Safety | CoCoNot WildGuardMix WildJailbreak | 9275,3385,616 | Brahman et al. (2024) Han et al. (2024) Jiang et al. (2024) |
| Science | SciRiff OpenThoughts3 Science | 2,25319,023 | Wadden et al. (2024) Guha et al. (2025a) |
| Multilingual | Aya | 4,078 | Singh et al. (2024) |
| Other | TableGPT FLAN | 1,17019,660 | Zha et al. (2023) Wei et al. (2021) |
| Not used in SFT | DaringAnteater UltraFeedback | 1,08932,778 | Wang et al. (2024b) Cui et al. (2023) |
| Total |  | 200,000 |  |

Table 19 Olmo 3 Think DPO prompt sources. See Section §4.3.1 for data details.

表 19｜Olmo 3 Think DPO 的提示来源. 数据细节见第 §4.3.1 节.

#### 4.3.1 Dolci Think-DPO: Preference Data Creation (4.3.1 Dolci Think-DPO: 偏好数据构造)

To construct Dolci Think DPO, we compile a large pool of prompts covering a wide range of datasets and skills (see Table 19) and synthesize chosen and rejected responses to exhibit capability deltas. Following the delta-learning heuristic (Geng et al., 2025), for each prompt x, we simply decode a chosen completion y<sub>c</sub> from one model (Qwen 3 32B, thinking) and a rejected completion y<sub>r</sub> from an overall weaker model (Qwen 3 0.6B, thinking) to construct a consistent contrast.32

为了构建 Dolci Think DPO, 我们汇集了一个覆盖多种数据集和技能的大型提示池 (见表 19), 并合成体现能力差异的被选回答和被拒回答. 按照 delta-learning 启发式 (Geng et al., 2025), 对每个提示 x, 我们简单地从一个模型 (Qwen 3 32B, thinking) 解码出被选补全 y<sub>c</sub>, 从一个整体更弱的模型 (Qwen 3 0.6B, thinking) 解码出被拒补全 y<sub>r</sub>, 以构造一致的对比.32

**Step 1: sourcing prompts and contrastive completions** Olmo 3 Think focuses on reasoning capabilities; we thus construct pairs that exhibit a delta in reasoning quality by pairing model completions from models of differing reasoning capability (Geng et al., 2025; Bakouch et al., 2025; Kim et al., 2023). Our prompt pool is derived from the Dolci Instruct SFT dataset supplemented with the DaringAnteater (Wang et al., 2024b) and UltraFeedback (Cui et al., 2023) subsets from the OLMo 2 7B preference dataset.

**步骤 1: 获取提示与对比补全** Olmo 3 Think 聚焦推理能力, 因此我们把推理能力不同的模型所生成的补全配对, 构造出体现推理质量差异的数据对 (Geng et al., 2025; Bakouch et al., 2025; Kim et al., 2023). 提示池来自 Dolci Instruct SFT 数据集, 并补充了 OLMo 2 7B 偏好数据集中的 DaringAnteater (Wang et al., 2024b) 和 UltraFeedback (Cui et al., 2023) 子集.

**Step 2: filtering** We apply topic filtering and heuristic model-identity filtering as described from the SFT stage (Section §4.2.1) to all chosen responses. We leave rejected responses unfiltered with the intuition that

**步骤 2: 过滤** 对所有被选回答, 我们应用 SFT 阶段 (第 §4.2.1 节) 所述的主题过滤和启发式模型身份过滤. 被拒回答不做过滤, 直觉是

<small><span class="docvortex-page-footnote" data-block-type="page_footnote" style="color:#6b7280">32<sub>The</sub> UltraFeedback-style LLM-judge preference pipeline employed in OLMo 2 and Tülu 3 assumes access to a diverse pool of models to construct preference pairs with useful contrasts; however, there are few open-thought thinking models available to construct such pairs, rendering the OLMo 2 pipeline less ideal for this setting. Our Dolci Instruct DPO dataset does benefit from model-pool diversity; we are able to further supplement our delta-learning heuristic data with LLM-judged data in Dolci Instruct DPO to yield mutually complementary gains (Section §5.3.1).</span></small>

<!-- page 44 of 118 -->

![Image block](images/p44-figure-16-verifiers-and-reward-design-for-verifiable.png)

Figure 16 Verifiers and reward design for verifiable and non-verifiable tasks.

图 16｜可验证与不可验证任务的验证器与奖励设计.

an incorrect rejected response may elicit a useful contrast. We further decontaminate all prompts against our evaluation suites.

错误的被拒回答也可能提供有用的对比. 我们还对所有提示针对评测套件做了去污染.

**Step 3: mixing** Experimentation with long reasoning traces is significantly more expensive than with non-thinking completions. To obtain the final mix of prompts for Dolci Think DPO, we leverage mixing experiments conducted on prompts with non-thinking completions (see Section §5 for details). Specifically, we select the three best-performing prompt distributions from our Olmo 3 Instruct experiments and generate chosen and rejected responses for these prompts using the thinking versions of the Qwen models to elicit a delta in reasoning quality. We choose the empirically best-performing mix during our experiments as our final DPO data pool. <sup>33</sup>

**步骤 3: 混合** 用长推理轨迹做实验, 比用非思考补全做实验昂贵得多. 为了得到 Dolci Think DPO 的最终提示混合, 我们借用了在非思考补全提示上做的混合实验 (细节见第 §5 节). 具体来说, 我们从 Olmo 3 Instruct 实验中选出表现最好的三种提示分布, 用 Qwen 模型的 thinking 版本为这些提示生成被选回答和被拒回答, 以引出推理质量上的差异. 我们选择实验中经验上表现最好的混合作为最终的 DPO 数据池. <sup>33</sup>

#### 4.3.2 Training (4.3.2 训练)

We train all models for one epoch following previous work (Lambert et al., 2024), sweeping learning rate and dataset size to identify the best candidate checkpoints based on our evaluation suite. Dataset size is an important hyperparameter, as we observe that early stopping is important for performant preference tuning; please see our data mixing experiments on our Instruct model (Section §5.3.2) for our motivating results. Beyond our evaluation suite, we further inspect each checkpoint via the same “vibe-tests” as in SFT training to qualitatively assess model behavior. See Appendix A.6.2 for full training settings.

按照先前工作 (Lambert et al., 2024), 所有模型都训练一个 epoch, 并扫描学习率和数据集规模, 根据评测套件确定最佳候选 checkpoint. 数据集规模是一个重要的超参数, 因为我们观察到提前停止对偏好调优的表现很重要; 促使我们得出这一结论的结果见 Instruct 模型的数据混合实验 (第 §5.3.2 节). 在评测套件之外, 我们还用与 SFT 训练相同的 「vibe-tests」 检查每个 checkpoint, 定性评估模型行为. 完整训练设置见附录 A.6.2.

### 4.4 Reinforcement Learning with OlmoRL: The Cherry on Top (4.4 用 OlmoRL 做强化学习)

The third stage of post-training is reinforcement learning with a mixture of verifiable and LM-judge rewards across a variety of domains. We introduce OlmoRL, which includes our algorithm and closely intertwined engineering infrastructure to address challenges for reinforcement learning with long reasoning traces, extending RLVR to include a wider variety of verifiable tasks. We also release Dolci-Think-RL—a large-scale and diverse dataset of roughly 100K prompts across four domains: mathematics, coding, instruction following, and general chat—to support robust reinforcement learning on varied reasoning tasks while maintaining general utility. Next, we describe the RL algorithmic details (§4.4.1), the Dolci Think RL dataset (§4.4.2), and finally OlmoRL infrastructure in Open Instruct (§4.4.3).

后训练的第三阶段是强化学习, 奖励混合了跨多个领域的可验证奖励和 LM 评判奖励. 我们推出 OlmoRL, 它包括我们的算法以及与之紧密交织的工程基础设施, 用来应对长推理轨迹强化学习中的挑战, 并把 RLVR 扩展到更多样的可验证任务. 我们还发布了 Dolci-Think-RL, 这是一个大规模多样数据集, 约含 100K 个提示, 覆盖数学, 编码, 指令遵循和通用对话四个领域, 用于在多样推理任务上做稳健的强化学习, 同时保持通用实用性. 接下来依次介绍 RL 算法细节 (§4.4.1), Dolci Think RL 数据集 (§4.4.2), 最后是 Open Instruct 中的 OlmoRL 基础设施 (§4.4.3).

#### 4.4.1 OlmoRL Algorithmic Details (4.4.1 OlmoRL 算法细节)

Our reinforcement learning stage is powered by OlmoRL, an approach that builds on Group Relative Policy Optimization (GRPO) (Shao et al., 2024) and integrates a number of recent algorithmic advances. In particular, we adopt improvements from DAPO (Yu et al., 2025) and Dr GRPO (Liu et al., 2025b), among

我们的强化学习阶段由 OlmoRL 驱动, 这一方法以群体相对策略优化 (GRPO) (Shao et al., 2024) 为基础, 并整合了多项近期算法进展. 具体来说, 我们采纳了 DAPO (Yu et al., 2025), Dr GRPO (Liu et al., 2025b) 等工作

<small><span class="docvortex-page-footnote" data-block-type="page_footnote" style="color:#6b7280">33<sub>Our</sub> Dolci Instruct DPO dataset includes additional contrastive pairs, which we obtain through careful experimental analysis. Refer to Section §5.3.1 for more details.</span></small>

<!-- page 45 of 118 -->

others (Yao et al., 2025; Piché et al., 2025). At its core, the objective of RLVR is to maximize the expected reward of a model-generated response y given the prompt x, where a verifier checks whether the response y matches the ground-truth answer associated with x.

的改进 (Yao et al., 2025; Piché et al., 2025). RLVR 的核心目标是在给定提示 x 时, 最大化模型生成回答 y 的期望奖励, 其中由验证器检查回答 y 是否与 x 对应的标准答案一致.

We make the following improvements <sup>34</sup> over vanilla GRPO:

相比原版 GRPO, 我们做了以下改进 <sup>34</sup>:

• Zero gradient signal filtering: We remove groups of instances whose rewards are all identical (i.e., a batch with zero standard deviation in their advantage) to avoid training on samples that provide zero gradient, similar to DAPO (Yu et al., 2025).
• 零梯度信号过滤: 与 DAPO (Yu et al., 2025) 类似, 我们移除奖励全部相同的样本组 (即优势标准差为零的批次), 以免在梯度为零的样本上训练.

• Active sampling: We maintain a consistent batch size in spite of zero gradient filtering with a novel, more efficient version of dynamic sampling (Yu et al., 2025), see Section §4.4.3 for details.
• 主动采样: 我们用一种新的, 更高效的动态采样 (Yu et al., 2025) 版本, 在零梯度过滤的情况下仍保持批大小一致, 细节见第 §4.4.3 节.

过滤全同奖励组后 batch 变瘦; active sampling 用来维持稳定 batch 大小 (§4.4.1, §4.4.3).

• Token-level loss: We use a token-level loss to normalize the loss by the total number of tokens across the batch (Yu et al., 2025), rather than per-sample to avoid a length bias.
• Token 级损失: 我们使用 token 级损失, 按整个批次的 token 总数对损失归一化 (Yu et al., 2025), 而不是按样本归一化, 以避免长度偏差.

• No KL loss: We remove the KL loss as a common practice (GLM-4.5 Team et al., 2025; Yu et al., 2025; Liu et al., 2025b) as it allows less-restricted policy updates, and removing it does not lead to over-optimization or destabilized training.
• 不用 KL 损失: 按常见做法 (GLM-4.5 Team et al., 2025; Yu et al., 2025; Liu et al., 2025b), 我们去掉 KL 损失, 这样策略更新受到的限制更少, 而且去掉它并不会导致过度优化或训练不稳定.

• Clip higher: We set the upper-bound clipping term in the loss to a slightly higher value than the lower bound to enable larger updates on tokens, as proposed by Yu et al. (2025).
• Clip higher: 按 Yu et al. (2025) 的提议, 我们把损失中的上界裁剪项设得比下界略高, 允许对 token 做更大的更新.

• Truncated importance sampling: To adjust for differences between log probabilities from the inference and training engines, we multiply the loss by the truncated importance sampling ratio, following Yao et al. (2025).
• 截断重要性采样: 为了校正推理引擎和训练引擎之间对数概率的差异, 我们按 Yao et al. (2025) 的做法, 把损失乘以截断重要性采样比.

• No standard deviation normalization: When calculating advantage, we do not normalize by the standard deviation of the group, following Liu et al. (2025b). This removes a difficulty bias, where questions with low standard deviation in their rewards (e.g., too hard or too easy) have their advantages significantly increased by the normalization term.
• 不做标准差归一化: 计算优势时, 我们按 Liu et al. (2025b) 的做法, 不除以组内标准差. 这消除了一种难度偏差: 奖励标准差低的问题 (例如太难或太简单) 的优势会被归一化项显著放大.

去掉 KL 损失; advantage 计算去掉组内标准差归一化 (§4.4.1).

**OlmoRL formulation** Our final objective function includes a token-level loss, truncated importance sampling, clip-higher, and no standard deviation in the advantage calculation:

**OlmoRL 形式化** 我们最终的目标函数包含 token 级损失, 截断重要性采样, clip-higher, 且优势计算中不使用标准差:

$$
\mathcal {J} (\theta) = \frac {1}{\sum_ {i = 1} ^ {G} \left| y _ {i} \right|} \sum_ {i = 1} ^ {G} \sum_ {t = 1} ^ {\left| y _ {i} \right|} \min \Big (\frac {\pi \big (y _ {i , t} \mid x , y _ {i , <   t} ; \theta_ {\text {old}} \big)}{\pi_ {\mathrm{vllm}} \big (y _ {i , t} \mid x , y _ {i , <   t} ; \theta_ {\text {old}} \big)}, \rho \Big) \min \Big (r _ {i, t} A _ {i, t}, \operatorname{clip} \big (r _ {i, t}, 1 - \varepsilon_ {\text {low}}, 1 + \varepsilon_ {\text {high}} \big) A _ {i, t} \Big),\tag{1}
$$

where $\begin{array} { r } { r _ { i , t } = \frac { \pi \left( y _ { i , t } | x , y _ { i , < t } ; \theta \right) } { \pi \left( y _ { i , t } | x , y _ { i , < t } ; \theta _ { \mathrm { o l d } } \right) } ,   \varepsilon _ { \mathrm { l o w } } } \end{array}$ and $\varepsilon _ { \mathrm { h i g h } }$ are the clipping hyperparameters. Here, $y _ { i } \sim \pi _ { \mathrm { v l l m } } ( \cdot \mid \mathbf { \mathit { x } } ; \theta _ { \mathrm { o l d } } )$ and $\pi _ { \mathrm { v l l m } } \left( \cdot \mid x ; \theta _ { \mathrm { o l d } } \right)$ are the token probabilities returned from vLLM, ρ is the truncated importance sampling cap value (Yao et al., 2025), and the advantage $A _ { i , t }$ for the t-th token t in the response $y _ { i }$ is calculated within the group G based on the relative reward of the outputs inside each group:

其中 $\begin{array} { r } { r _ { i , t } = \frac { \pi \left( y _ { i , t } | x , y _ { i , < t } ; \theta \right) } { \pi \left( y _ { i , t } | x , y _ { i , < t } ; \theta _ { \mathrm { o l d } } \right) } , \varepsilon _ { \mathrm { l o w } } } \end{array}$ 和 $\varepsilon _ { \mathrm { h i g h } }$ 是裁剪超参数. 这里 $y _ { i } \sim \pi _ { \mathrm { v l l m } } ( \cdot \mid \mathbf { \mathit { x } } ; \theta _ { \mathrm { o l d } } )$, $\pi _ { \mathrm { v l l m } } \left( \cdot \mid x ; \theta _ { \mathrm { o l d } } \right)$ 是 vLLM 返回的 token 概率, ρ 是截断重要性采样的上限值 (Yao et al., 2025), 回答 $y _ { i }$ 中第 t 个 token 的优势 $A _ { i , t }$ 在组 G 内根据组内各输出的相对奖励计算:

$$
A _ {i, t} = \Big (r \left(x, y _ {i}\right) - \mathrm{mean} \left(\left\{r \left(x, y _ {i}\right) \right\} _ {i = 1} ^ {G}\right) \Big).\tag{2}
$$

$r \left( x , y _ { i } \right)$ is the reward score returned by the corresponding verifier. Our hyperparameters for various runs are in Appendix Table 49.

$r \left( x , y _ { i } \right)$ 是对应验证器返回的奖励分数. 各次运行的超参数见附录表 49.

> $\rho$ 是截断重要性采样上限; $\varepsilon_{\mathrm{high}}$ 是 clip-higher 的上侧幅度, 允许对某些 token 更大更新.

**Verifiers** We extend verifiable rewards beyond math domains from OLMo 2 to include general domains. For each domain we use a different custom verifier (see Figure 16):

**验证器** 我们把可验证奖励从 OLMo 2 的数学领域扩展到通用领域. 每个领域使用不同的定制验证器 (见图 16):

• Math We use a rule-based verifier that performs basic normalization and compares with a reference answer with SymPy to determine answer correctness. The verifier returns 1 if the answer is determined the same as the reference answer and 0 otherwise.
• 数学 我们使用基于规则的验证器, 做基本的规范化后用 SymPy 与参考答案比较, 判断答案是否正确. 若答案被判定与参考答案相同, 验证器返回 1, 否则返回 0.

• Code We use a test-case based verifier that runs a set of test cases over the response. We experiment with (a) using the percentage of passed test cases as the reward and (b) returning 1 when the response passes all test cases and 0 otherwise.<sup>35</sup>
• 代码 我们使用基于测试用例的验证器, 在回答上运行一组测试用例. 我们试验了两种做法: (a) 以通过测试用例的百分比作为奖励; (b) 回答通过全部测试用例时返回 1, 否则返回 0.<sup>35</sup>

<small><span class="docvortex-page-footnote" data-block-type="page_footnote" style="color:#6b7280">34<sub>We</sub> experimented with additional changes (e.g., overlong filtering), but did not find these gave consistent improvements.</span></small>

<small><span class="docvortex-page-footnote" data-block-type="page_footnote" style="color:#6b7280">35<sub>Code</sub> execution When performing RL on code environments, we need to actually execute the generated code against test cases to calculate our rewards. We use AWS Lambda to do so. Using a distributed cloud function approach ensures that</span></small>

<!-- page 46 of 118 -->

|  |  | # Prompts | # Prompts |  |
| --- | --- | --- | --- | --- |
| Category | Prompt Dataset | Used in Think RL | Used in Instruct RL | Reference |
| Precise IF | IF-RLVR | 30,186 | 38,000 | Pyatkin et al. (2025) |
| Math | Open-Reasoner-Zero DAPO-Math AceReason-Math Polaris-Dataset KlearReasoner-MathSub OMEGA-train | 3,0002,5846,602-3,00015,000 | 14,0007,000-14,0009,00020,000 | Hu et al. (2025) Yu et al. (2025) Chen et al. (2025) An et al. (2025) Su et al. (2025c) Sun et al. (2025) |
| Coding | AceCoder KlearReasoner-Code Nemotron Post-training Code SYNTHETIC-2 | 9,7678,0402,3033,000 | 20,000--- | Zeng et al. (2025a) Su et al. (2025c) NVIDIA AI (2025) PrimeIntellect (2025) |
| General Chat | Tulu 3 SFT Wildchat-4.8M Multi-Subject RLVR | 7,1297,1297,129 | 18,95518,76112,234 | Lambert et al. (2024)-Su et al. (2025b) |
| Total |  | 104,869 | 171,950 |  |

Table 20 Breakdown of datasets in Dolci-Think-RL used for RL training. See §4.4.2 for further details on how each dataset is processed.

表 20｜用于 RL 训练的 Dolci-Think-RL 中各数据集的明细. 各数据集如何处理的更多细节见 §4.4.2.

• Instruction-following We pass the response through a set of functions that check adherence to a series of constraints from the prompt. A reward of 1 is assigned if all constraints are satisfied, and 0 otherwise.
• 指令遵循 我们把回答交给一组函数, 检查它是否遵守提示中的一系列约束. 所有约束都满足则奖励为 1, 否则为 0.

• Chat—reference For tasks with a ground-truth response, we pass the response to an LM judge to compare the model’s response against a provided reference answer, and ask the judge to give a score in [0, 1] based on the quality of the response.
• 对话 (有参考) 对有标准回答的任务, 我们把回答交给 LM 评判器, 让它把模型回答与提供的参考答案比较, 并根据回答质量给出 [0, 1] 区间的分数.

• Chat—open-ended We pass the response to an LM judge and ask the judge to give a score in [0, 1] based on the quality of the response without any reference answer.36
• 对话 (开放式) 我们把回答交给 LM 评判器, 让它在没有任何参考答案的情况下, 根据回答质量给出 [0, 1] 区间的分数.36

#### 4.4.2 Dolci-Think-RL: Curating a State-of-the-art RLVR Dataset (4.4.2 Dolci-Think-RL: 策展 RLVR 数据)

We curate a large-scale and diverse dataset of roughly 100K samples across four domains: mathematics, coding, instruction following, and general chat to support robust RL on varied reasoning tasks while maintaining general utility. Each domain is associated with either a verifiable or non-verifiable reward signal (continuous or binary), ensuring that every instance can be automatically checked for correctness or general quality (see Figure 16). For all domains we take particular care with the provenance and licensing of sources. We provide the size of each dataset subsection after sourcing, filtering, and mixing in Table 20.

我们策展了一个大规模多样数据集, 约含 100K 个样本, 覆盖数学, 编码, 指令遵循和通用对话四个领域, 用于在多样推理任务上做稳健的 RL, 同时保持通用实用性. 每个领域都对应可验证或不可验证的奖励信号 (连续或二值), 确保每个样本都能自动检查正确性或整体质量 (见图 16). 对所有领域, 我们都特别注意来源的出处和许可. 表 20 给出了每个数据集子集在获取, 过滤和混合之后的规模.

**Step 1: sourcing prompts** In what follows, we will describe our data construction process.

**步骤 1: 获取提示** 下面介绍我们的数据构建过程.

• Math: We combine community-curated math problems, including Open-Reasoner-Zero (Hu et al., 2025), DAPO-Math (Yu et al., 2025), AceReason-Math (Chen et al., 2025), DeepScaler (Luo et al., 2025b),
• 数学: 我们合并了社区策展的数学题, 包括 Open-Reasoner-Zero (Hu et al., 2025), DAPO-Math (Yu et al., 2025), AceReason-Math (Chen et al., 2025), DeepScaler (Luo et al., 2025b),

<small><span class="docvortex-page-footnote" data-block-type="page_footnote" style="color:#6b7280">verification does not block the trainer process, and allows us to scale seamlessly. Many test case suites, such as those present in SYNTHETIC-2 (PrimeIntellect, 2025), contain test cases designed to penalize programs with poor time complexity, and running these tests can exceed hundreds of MBs for a single program, exceeding the resources of our local machines.</span></small>

<small><span class="docvortex-page-footnote" data-block-type="page_footnote" style="color:#6b7280">36<sub>Unless</sub> otherwise stated, for an LM judge we host Qwen3 32B (Yang et al., 2025a) with thinking mode turned off using vLLM (Kwon et al., 2023), and allow a max input prompt of 32768 tokens while only allowing a response length of 2048 tokens. We provide the judge prompts in Figure 40 in the appendix. We additionally experimented with puzzle problem (checking if a puzzle solution is correct relative to a reference answer) and length-control (Aggarwal and Welleck, 2025) verifiers, but did not find it useful for downstream performance.</span></small>

<!-- page 47 of 118 -->

KlearReasoner-MathSub (Su et al., 2025c), and OMEGA (Sun et al., 2025) covering a wide range of mathematical domains including algebra, combinatorics, number theory, and geometry.

KlearReasoner-MathSub (Su et al., 2025c) 和 OMEGA (Sun et al., 2025), 覆盖代数, 组合, 数论和几何等广泛的数学领域.

Coding To construct reinforcement learning (RL) data for code, we required pairs of (problem, test cases). We curate a diverse set of prompts for coding problems, including AceCoder (Zeng et al., 2025a), Klear-Reasoner Code (Su et al., 2025c), Nemotron Post-training Code (NVIDIA AI, 2025), SYNTHETIC-2 code (PrimeIntellect, 2025), and Open-Code Reasoner (Ahmad et al., 2025). We use the Klear-Reasoner and SYNTHETIC-2 test cases directly. For the other datasets, we run prompts through the following synthetic data pipeline: (1) problem rewriting, (2) solution generation, and (3) test case generation. After generating these triplets (problem, solution, test cases), we executed all model-generated or rewritten test cases against the corresponding solutions and kept examples with solutions that passed more than 80% of test cases while removing failed test cases. The resulting filtered dataset provided high-quality (problem, test cases) pairs suitable for training and experimentation with RL methods for code. We use the AceCoder prompts in function completion format, while all other datasets are in stdio format. Details of each step in code data synthesis pipeline can be found in Appendix A.7.3.

编码 为了构建代码方面的强化学习 (RL) 数据, 我们需要 (题目, 测试用例) 对. 我们策展了一组多样的编程题提示, 包括 AceCoder (Zeng et al., 2025a), Klear-Reasoner Code (Su et al., 2025c), Nemotron Post-training Code (NVIDIA AI, 2025), SYNTHETIC-2 code (PrimeIntellect, 2025) 和 Open-Code Reasoner (Ahmad et al., 2025). Klear-Reasoner 和 SYNTHETIC-2 的测试用例直接使用. 对其他数据集, 我们让提示经过以下合成数据流水线: (1) 题目改写, (2) 解答生成, (3) 测试用例生成. 生成这些 (题目, 解答, 测试用例) 三元组后, 我们在对应解答上执行所有模型生成或改写的测试用例, 保留解答通过 80% 以上测试用例的样本, 并删除未通过的测试用例. 过滤后的数据集提供了高质量的 (题目, 测试用例) 对, 适合用于代码 RL 方法的训练和实验. AceCoder 的提示使用函数补全格式, 其余数据集均为 stdio 格式. 代码数据合成流水线各步骤的细节见附录 A.7.3.

• Instruction-following We use the prompts from IF-RLVR (Pyatkin et al., 2025) with up to 5 constraints, which are sampled from IFEval (Zhou et al., 2023) and IFBench-Train (Pyatkin et al., 2025).
• 指令遵循 我们使用 IF-RLVR (Pyatkin et al., 2025) 中最多带 5 条约束的提示, 这些约束采样自 IFEval (Zhou et al., 2023) 和 IFBench-Train (Pyatkin et al., 2025).

General chat We sample our general chat instances from three sources: (a) Tülu 3 SFT (Lambert et al., 2024); (b) the new WildChat-4.8M data<sup>37</sup> containing a broad spectrum of user-chatbot interactions on ambiguous requests, code-switching, topic shifts, political debates, and more; and (c) the Multi-subject-RLVR dataset (Su et al., 2025b), consisting of college-level English questions and objective answers written by domain experts for examination purposes. For WildChat, we only sample from instances that are in English and do not require reasoning (such as math and code). For Tülu 3, we first rewrote samples using GPT-4.1 for better clarity and to extract reference answers from the SFT set. We then generated eight samples per prompt with a Qwen 2.5 7B model finetuned on OpenThoughts 2 and computed the F1 score between the reference answer and each response. We then removed all samples with average F1 score < 0.1 and > 0.8. This removes both noisy and overly difficult samples. WildChat in particular has a high prevalence of role-playing and other character-based data. In order to balance the data, we filter any mention of a single character down to a maximum of 10 instances. We then finally performed some post-hoc manual filtering to remove code- and math-centric prompts.

通用对话 我们从三个来源采样通用对话样本: (a) Tülu 3 SFT (Lambert et al., 2024); (b) 新的 WildChat-4.8M 数据<sup>37</sup>, 其中包含大量用户与聊天机器人的交互, 涉及含糊请求, 语码转换, 话题切换, 政治辩论等; (c) Multi-subject-RLVR 数据集 (Su et al., 2025b), 由领域专家为考试编写的大学水平英文题目和客观答案组成. 对 WildChat, 我们只从英文且不需要推理 (例如数学和代码) 的样本中采样. 对 Tülu 3, 我们先用 GPT-4.1 改写样本, 提高清晰度, 并从 SFT 集中抽取参考答案. 然后用一个在 OpenThoughts 2 上微调的 Qwen 2.5 7B 模型为每个提示生成八个样本, 计算参考答案与每个回答之间的 F1 分数. 接着移除平均 F1 分数 < 0.1 和 > 0.8 的所有样本. 这样既去掉了噪声样本, 也去掉了过难的样本. WildChat 中角色扮演和其他以角色为中心的数据尤其多. 为了平衡数据, 我们把提及任一单个角色的样本限制在最多 10 个. 最后我们做了一些事后人工过滤, 去掉以代码和数学为中心的提示.

**Step 2: offline difficulty filtering** As stated previously, to improve the sample efficiency of RL for our reasoner model, we generate eight rollouts for each prompt from the initial checkpoint of the model we train (e.g., if starting from the DPO-trained model, we generate from the DPO checkpoint). We then remove all samples that the model easily solves (that is, those with a pass rate greater than 62.5%). We sample with a temperature of 1.0 and top-p of 1.0, matching how we sample during RL training. We used offline filtering for the 7B Olmo 3 Think to filter out RL problems that are too easy for our models’ training. For the 32B, we rely on active sampling, which fills RL batches only on samples with a non-zero GRPO group gradient, and re-using the 7B DPO-filtered data as the starting point for the model due to compute and time constraints.

**步骤 2: 离线难度过滤** 如前所述, 为了提高推理模型 RL 的样本效率, 我们用所训练模型的初始 checkpoint 为每个提示生成八个 rollout (例如从 DPO 训练后的模型开始时, 就从 DPO checkpoint 生成). 然后移除模型能轻松解出的所有样本 (即通过率高于 62.5% 的样本). 采样温度为 1.0, top-p 为 1.0, 与 RL 训练时的采样方式一致. 对 7B 的 Olmo 3 Think, 我们用离线过滤去掉对模型训练来说太简单的 RL 题目. 对 32B, 由于算力和时间限制, 我们依靠主动采样 (只用 GRPO 组梯度非零的样本填充 RL 批次), 并复用 7B DPO 过滤后的数据作为模型的起点.

**Step 3: data mixing** When developing our data mixture and overall recipe, we found RL experiments were both long and compute-expensive, preventing us from ablating the full space of datasets and algorithmic choices. Instead, we established a pipeline in which: (a) we performed dataset-specific runs on an intermediate SFT checkpoint and observed downstream evaluation trends over the first 500-1000 RL steps; (b) focused on math domain training when testing new algorithmic changes; (c) periodically ran overall mixture experiments to ensure mixing was stable. When setting up our final run, we then took the most promising datasets, performed offline filtering, and carefully mixed them to ensure higher-quality datasets were upweighted, and roughly equal amounts of data were used for each domain (with slightly more focus on math and instruction following, as training on these domains seemed the most effective in per-dataset runs). Additionally, we downsample certain subtasks from OMEGA that the model especially struggled with based on offline filtering

**步骤 3: 数据混合** 在开发数据混合和整体配方时, 我们发现 RL 实验既漫长又耗算力, 无法对数据集和算法选择的全部空间做消融. 因此我们建立了这样一条流水线: (a) 在一个中间 SFT checkpoint 上做针对单个数据集的运行, 观察前 500-1000 个 RL 步的下游评测趋势; (b) 测试新的算法改动时聚焦数学领域的训练; (c) 定期运行整体混合实验, 确保混合是稳定的. 在设置最终运行时, 我们选取最有希望的数据集, 做离线过滤, 并仔细混合, 确保提高高质量数据集的权重, 各领域使用的数据量大致相当 (对数学和指令遵循稍有侧重, 因为在逐数据集运行中, 在这两个领域上训练似乎最有效). 此外, 根据离线过滤

<small><span class="docvortex-page-footnote" data-block-type="page_footnote" style="color:#6b7280">38<sub>In</sub> our intermediate general dataset of 57,819 samples, we found the top characters were 1. [Natsuki](https://doki-doki-literature-club.fandom.com/wiki/Natsuki_%28DDLC%29): 1284 appearances, 2. [Monika](https://doki-doki-literature-club.fandom.com/wiki/Monika_%28DDLC%29): 1243, 3. [Sayori](https://doki-doki-literature-club.fandom.com/wiki/Sayori_%28DDLC%29): 1076, 4. [Yuri](https://doki-doki-literature-club.fandom.com/wiki/Yuri_%28DDLC%29): 957, 5. Sakura: 453, and 6. MC: 424. All others were at 60 or lower before filtering.</span></small>

<!-- page 48 of 118 -->

results.39 We used this pipeline to develop an RL mixture for the 7B model, and then used the same data mixture for the 32B model due to compute and time constraints.

结果, 我们下采样了 OMEGA 中模型特别吃力的某些子任务.39 我们用这条流水线为 7B 模型开发了 RL 混合, 由于算力和时间限制, 32B 模型也使用同样的数据混合.

For our Olmo 3 Think 7B training run, we used an initial version of our infrastructure without pipelineRL or truncation importance sampling, which took approximately 15 days. We later replicated the same run with our newer infrastructure, achieving similar performance in just 6 days of training.

在 Olmo 3 Think 7B 的训练运行中, 我们使用的是基础设施的初始版本, 没有 pipelineRL, 也没有截断重要性采样, 用时约 15 天. 后来我们用更新的基础设施复现了同一次运行, 只用 6 天训练就达到了相近的表现.

#### 4.4.3 OlmoRL Infrastructure in Open Instruct (4.4.3 Open Instruct 中的 OlmoRL 基础设施)

We made substantial improvements to our reinforcement learning infrastructure to handle longer sequences and faster overall throughput. In RL with LLMs, the key technical challenge for finetuning models that generate long sequences is managing inference—also called the rollouts. For our final models, we generated rollouts with a maximum size of 32K tokens in length, averaging more than 10K tokens (for the reasoner models). Inference dominated our computational costs, using 8 H100 nodes for training and 20 nodes for inference for the 32B OlmoRL reasoner model. Given the cost of autoregressive inference, our learner spends 75% of the time waiting for data, so in terms of GPU utilization, we use approximately 5x as much for inference as for training. In fact, we use the minimal possible sharding configuration to fit the learner in memory and do not prioritize speed at all, unlike in the supervised learning setting. For the 7B reasoner model, where we have less memory pressure on the learner, the situation was more dramatic, as we used 7 nodes for inference and only 2 for the learner. Given the similarly low utilization of the learner, we used approximately 14x as much compute for inference as for training. We suspect that we have a suboptimal sharding configuration for the 32B learner and expect that we could do better in future work.

我们大幅改进了强化学习基础设施, 以处理更长的序列并提高整体吞吐量. 在 LLM 的 RL 中, 微调生成长序列的模型, 关键技术挑战在于管理推理, 也就是 rollout. 对最终模型, 我们生成的 rollout 最长 32K token, 平均超过 10K token (推理模型). 推理占据了主要计算成本: 对 32B 的 OlmoRL 推理模型, 训练用 8 个 H100 节点, 推理用 20 个节点. 由于自回归推理代价高, 我们的 learner 有 75% 的时间在等数据, 因此就 GPU 利用而言, 推理所用的大约是训练的 5 倍. 事实上, 与监督学习设定不同, 我们用尽可能少的分片配置把 learner 装进显存, 完全不追求速度. 对 7B 推理模型, learner 的显存压力较小, 情况更极端: 推理用 7 个节点, learner 只用 2 个. 由于 learner 的利用率同样很低, 推理所用算力大约是训练的 14 倍. 我们怀疑 32B learner 的分片配置不够优化, 预计在未来工作中可以做得更好.

**Fullyasynchronoustraining** Shown in Figure 17a, we employ an off-policy asynchronous RL setup (Noukhovitch et al., 2024) featuring a centralized learner distributed across multiple nodes via DeepSpeed (Rasley et al., 2020) and a large pool of actors, each running an independent vLLM (Kwon et al., 2023) instance. The learner produces prompts that are queued and dispatched to the actors, which execute the prompts, interact with the environment, and return results through a results queue that the learner uses to update the model parameters. Due to the variance in completion length, a long time delta can emerge between completions in an individual batch of RLVR. The guiding principles to mitigate this issue are to make efficient use of resources (avoiding idling) and to make processes asynchronous.

**完全异步训练** 如图 17a 所示, 我们采用 off-policy 异步 RL 设置 (Noukhovitch et al., 2024): 一个通过 DeepSpeed (Rasley et al., 2020) 分布在多个节点上的集中式 learner, 以及一个大型 actor 池, 每个 actor 运行一个独立的 vLLM (Kwon et al., 2023) 实例. learner 产生的提示进入队列并被分发给各 actor, actor 执行提示, 与环境交互, 并通过结果队列返回结果, learner 再用这些结果更新模型参数. 由于补全长度差异很大, 在 RLVR 的单个批次中, 各补全之间可能出现很长的时间差. 缓解这一问题的指导原则是高效利用资源 (避免空闲) 并让各个进程异步运行.

**Continuous batching** We employ continuous batching to constantly enqueue new generations as each one finishes to remove the compute waste for long generations (see Figure 17). This is in contrast to static batching, in which a batch of prompts is split over N actors, and each actor generates the entire batch,<sup>42</sup> returns the generated responses to the learner, and then receives a new batch of data. Static batching is inefficient, as when one generation finishes that “slot” of the batch will remain empty until we get a new batch. The exact wasted compute can be calculated as the maximum sequence length minus the average sequence length divided by the maximum sequence length. With Olmo 3, at a 32K generation length, we see a mean generation length of 14628 and a maximum of 32K, which means that up to 54% of our compute would have been wasted with static batching. See Figure 17 for an illustrated example.

**连续批处理** 我们采用连续批处理, 每完成一条生成就立即把新的生成加入队列, 消除长生成带来的算力浪费 (见图 17). 与之相对的是静态批处理: 一批提示被分给 N 个 actor, 每个 actor 生成整批数据,<sup>42</sup> 把生成的回答返回给 learner, 然后接收新的一批数据. 静态批处理效率低, 因为一条生成结束后, 批次中的那个 「槽位」 会一直空着, 直到拿到新的一批. 浪费的算力可以精确计算为: 最大序列长度减去平均序列长度, 再除以最大序列长度. 在 Olmo 3 中, 生成长度上限为 32K 时, 平均生成长度为 14628, 最大为 32K, 这意味着若用静态批处理, 最多会浪费 54% 的算力. 图示例子见图 17.

**Active sampling** To compensate for filtered instances, our fully asynchronous framework enables continuously pulling completions from the actor and resampling prompts into the queue. We actively sample and filter

**主动采样** 为了弥补被过滤掉的样本, 我们的完全异步框架可以持续从 actor 拉取补全, 并把提示重新采样进队列. 我们主动采样并过滤

<small><span class="docvortex-page-footnote" data-block-type="page_footnote" style="color:#6b7280">39<sub>In</sub> particular, we downsample the following tasks by 50% after filtering: trans\_integrations, logic\_gridworld\_rookmove, logic\_puzzles\_grid\_chip, comp\_grid\_chips, comp\_n\_gon, arithmetic\_matrix\_svd, comp\_parametric\_intersection, comp\_- vertex\_color.</span></small>

<small><span class="docvortex-page-footnote" data-block-type="page_footnote" style="color:#6b7280">40<sub>For</sub> the 7B training runs, we use a single GPU for each actor and scale generation via data parallelism. The RL setup would be familiar to readers of Horgan et al. (2018) or Silver et al. (2017). For 32B, we use one node per actor and then similarly further scale via data parallelism.</span></small>

<small><span class="docvortex-page-footnote" data-block-type="page_footnote" style="color:#6b7280">41<sub>For</sub> one of our main RL runs, which was broadly representative of what we experienced across all of our runs, each training step averaged 1000 seconds, of which 125 seconds was spent running training. Each batched completion generation took 1000 seconds. As we overlap generation and training (Noukhovitch et al., 2024), the bottleneck is entirely generation. Consequently, significant engineering resources were spent improving the way generation is handled, where we could continue to use the training code used in OLMo 2, as we would need to speed up generation by > 8× for that to be a bottleneck.</span></small>

<small><span class="docvortex-page-footnote" data-block-type="page_footnote" style="color:#6b7280">42<sub>Calling</sub> llm.generate in vLLM.</span></small>

<!-- page 49 of 118 -->

![Image block](images/p49-a-distributed-reinforcement-learning-architecture.png)

(a) Distributed reinforcement learning architecture

(a) 分布式强化学习架构

![Image block](images/p49-b-static-batching.png)

(b) Static batching

![Image block](images/p49-c-continuous-batching.png)

(c) Continuous batching

Figure 17 Overview of OlmoRL infrastructure. On the left: distributed reinforcement learning architecture (Figure 17a). On the right: static vs. continuous batching. Static batching (Figure 17b) wastes compute when generations have variable sequence lengths. Pink cells are prefilled tokens, green cells are decoded tokens, with dark green representing EOS. Grey indicates that sequence is not doing anything, so continuous batching (Figure 17c) backfills finished rows immediately, resulting in no wasted compute.

图 17｜OlmoRL 基础设施概览. 左侧: 分布式强化学习架构 (图 17a). 右侧: 静态批处理与连续批处理的对比. 当生成的序列长度不一时, 静态批处理 (图 17b) 会浪费算力. 粉色格子是预填充的 token, 绿色格子是解码出的 token, 深绿色表示 EOS. 灰色表示该序列处于空闲, 因此连续批处理 (图 17c) 会立即回填已完成的行, 不浪费算力.

until we reach our desired batch size of non-zero-gradient completions. Previously, Yu et al. (2025) dynamic sampling would oversample and generate three times the number of prompts used in each training batch. This was to reasonably guarantee that the batch had enough completions with non-zero standard deviation. In contrast, our active sampling more efficiently uses the infrastructure. As demonstrated in section 6, we find this significantly stabilizes training and prevents batch size from reducing over the course of training (a common issue with vanilla GRPO).

直到凑够目标 batch 规模的非零梯度 completion. 此前 Yu et al. (2025) 的 dynamic sampling 会过采样, 每训练 batch 生成三倍提示数, 以大体保证 batch 里有足够非零标准差的 completion. 相比之下, 我们的 active sampling 更高效地使用基础设施. 如第 6 节所示, 这显著稳定训练, 并防止 batch 规模随训练缩小 (vanilla GRPO 的常见问题).

**Inflight updates** A common goal of RL training for LLMs is to minimize the degree of difference between the actor policy and the learner policy, i.e., to minimize being off-policy (Van Hasselt et al., 2018). This can be achieved by synchronizing the weights after every training step as follows: each actor finishes all of their ongoing generations, dumps the KV cache, and updates its copy of the weights. However, this causes GPUs to be idle and hurts training efficiency. Instead, we follow Piché et al. (2025) to immediately update the weights without pausing the engine, relying on the generation framework to be thread-safe, and continue generating, without invalidating the KV cache. This enables a significant increase in throughput: up to 4x faster with the same resources, without hurting accuracy.

**Inflight updates** RL 训练语言模型的常见目标是尽量缩小 actor 策略与 learner 策略的差距, 即尽量少离策略 (Van Hasselt et al., 2018). 做法可以是每训练步同步权重: 各 actor 完成进行中的生成, 清空 KV cache, 更新自己的权重副本. 但这会让 GPU 空闲, 伤害训练效率. 我们跟随 Piché et al. (2025), 不暂停引擎立即更新权重, 依赖生成框架线程安全, 继续生成且不使 KV cache 失效. 这显著提高吞吐: 同资源下最高约快 4x, 且不伤精度.

**Better threading and engineering** These changes are primarily around handling the weight synchronization after each training step to make actors more efficient. Our new setup decouples the actors, allowing each one to start and stop by itself, without waiting for the rest of the actors to finish their syncs as well. Similarly, we make a large number of optimizations that were not machine learning specific, and were centered around efficiently using the CPU. For example, our initial implementation of continuous batching, for instance, was slower than static batching before adding a prefetch thread to our actors that constantly refilled the inference queue to see a throughput improvement.

**更好的线程与工程** 这些改动主要围绕每训练步后的权重复制同步, 让 actor 更高效. 新设定解耦各 actor, 使其可自行启停, 不必等其他 actor 也完成同步. 同样, 我们做了大量非机器学习专用, 以高效用 CPU 为中心的优化. 例如最初的 continuous batching 实现在加入预取线程, 不断填满推理队列之前, 甚至慢于 static batching.

Our final RL run ended up mixing carefully-filtered data from all domains roughly equally and running on top of the DPO checkpoint.

最终 RL 运行把各域仔细过滤后的数据大致等量混合, 并接在 DPO 检查点之上.

### 4.5 Key Findings (4.5 关键发现)

**DPO yields gains where SFT on the same data cannot** Continued supervised finetuning directly on the chosen responses from Dolci Think DPO outright hurts the initial SFT model (Table 21), dropping all evaluation tasks. We conjecture that this is because the chosen responses (generated by Qwen3 32B Thinking) are weaker relative to data the model has already seen in Dolci Think SFT, and hence, they are no longer

**DPO 能带来同数据上 SFT 做不到的增益** 直接在 Dolci Think DPO 的 chosen 回复上继续监督微调会伤害初始 SFT 模型 (表 21), 各项评测都下降. 我们猜测是因为这些 chosen 回复 (由 Qwen3 32B Thinking 生成) 相对模型在 Dolci Think SFT 已见过的数据更弱, 因此不再是

<!-- page 50 of 118 -->

|  |  |  |  | Subs | et of Olm | o 3 Thi | nk Benchm | arks |  |  |  |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Name | Avg. | MMLU | BBH | GPQA | Zebra | AGI | AIME25 | AIME24 | CHE | LCB | IFEval |
| Qwen3 32B (chosen) | 83.2 | 88.8 | 90.6 | 64.7 | 78.2 | 90.2 | 71.0 | 80.3 | 90.9 | 89.6 | 87.4 |
| Qwen3 0.6B (rejected) | 35.1 | 55.8 | 41.5 | 27.2 | 29.8 | 59.2 | 15.2 | 11.2 | 14.8 | 34.4 | 62.3 |
| Dev. 7B SFT ckpt | 70.3 | 76.1 | 83.9 | 45.1 | 56.5 | 76.4 | 58.8 | 71.0 | 88.1 | 67.0 | 79.7 |
| Cont. SFT on chosen | 64.5 | 72.6 | 80.2 | 40.2 | 49.8 | 73.9 | 52.8 | 61.0 | 83.4 | 55.1 | 76.0 |
| Delta learning | 72.9 | 75.5 | 82.8 | 48.4 | 60.9 | 79.7 | 66.3 | 75.7 | 91.5 | 72.6 | 75.2 |

Table 21 The delta between chosen and rejected responses is critical. Supervised finetuning directly on the chosen responses generated by Qwen3-32B Thinking hurts the Initial SFT model. In contrast, DPO tuning to prefer the 32B responses over weaker Qwen3-0.6B Thinking responses yields strong gains across math and code reasoning.

表 21｜chosen 与 rejected 回复之间的 delta 很关键. 直接在 Qwen3-32B Thinking 生成的 chosen 上做监督微调会伤害 Initial SFT. 相反, 用 DPO 让模型偏好 32B 回复而非更弱的 Qwen3-0.6B Thinking 回复, 在数学与代码推理上带来强增益.

|  |  |  |  | Subs | et of Olm | o 3 Thi | nk Benchm | arks |  |  |  |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Name | Avg. | MMLU | BBH | GPQA | Zebra | AGI | AIME25 | AIME24 | CHE | LCB | IFEval |
| SFT | 70.1 | 74.9 | 84.1 | 45.8 | 57.9 | 77.2 | 57.6 | 69.6 | 88.2 | 67.8 | 77.9 |
| SFT + DPO | 72.7 | 74.8 | 83.7 | 48.6 | 60.6 | 79.1 | 62.7 | 74.6 | 91.4 | 75.1 | 75.9 |
| SFT + RLVR | 71.9 | 77.4 | 83.2 | 42.7 | 63.1 | 78.5 | 62.4 | 70.0 | 87.9 | 70.7 | 82.8 |
| SFT + DPO + RLVR | 74.1 | 77.9 | 86.8 | 50.2 | 62.9 | 80.1 | 64.2 | 73.2 | 89.9 | 73.4 | 82.3 |

Table 22 Delta learning provides a stronger initialization for subsequent RLVR than SFT alone. We show the effect of conducting RLVR for 1000 steps after DPO and SFT on our 7B model on a subset of our evaluation suite. Note that here evaluations are from one run only. Preference tuning with delta learning first followed by RLVR, yields the best overall performance. For RLVR, we use data offline-filtered by the corresponding starting point (SFT only or $\mathrm { S F T + D P O ) }$

表 22｜Delta learning 为后续 RLVR 提供比单靠 SFT 更强的初始化. 展示 7B 在 DPO 与 SFT 之后各跑 1000 step RLVR 对评测子集的影响. 注意此处评测来自单次运行. 先做 delta learning 偏好调优再 RLVR 总体最好. RLVR 使用由对应起点 (仅 SFT 或 SFT+DPO) 离线过滤的数据.

useful targets for imitation. However, by pairing these chosen responses with rejected responses generated by a weaker model, we construct a useful contrast, enabling preference tuning to drive strong gains beyond the initial SFT model (Table 21). Promisingly, these gains are not merely converting pass@k into pass@1 but rather expanding the reasoning frontier of the model (e.g., improved pass@k on AIME evaluations; Figure 20). These findings highlight contrastive learning with preference tuning as a useful stage for improving capabilities even when imitation is saturated.

有用的模仿目标. 但把这些 chosen 与更弱模型生成的 rejected 配对, 可构造有用对比, 使偏好调优相对初始 SFT 带来强增益 (表 21). 有希望的是, 这些增益不只是把 pass@k 换成 pass@1, 而是扩展推理边界 (例如 AIME 上 pass@k 提升; Figure 20). 这些发现凸显: 即便模仿已饱和, 用偏好调优做对比学习仍是提升能力的有用阶段.

**DPO and SFT both benefit from RL, but DPO remains a better starting point** Table 22 shows that running our final RL mix on the DPO model consistently yields better performance than running it on the SFT model. We find three primary differences, highlighted in Figure 19: for evaluations that RL does not improve, the DPO model often performs better and maintains its advantage during RL training (e.g., AlpacaEval). For evaluations explicitly targeted by RL (e.g., Omega), both the DPO and SFT models achieve similar end performance. For evaluations targeted by RL but hard to improve further from DPO (e.g., AIME 2025), the SFT model improves to get close to DPO performance. In no situation does the SFT model improve over the DPO model after RL, and as such we opt to focus on applying RL over our DPO model. Curiously, we find that the SFT model performs similarly when trained either with the data offline-filtered using the SFT or DPO model, suggesting that the additional samples filtered out (i.e., solved) by the DPO model do not provide additional signal for improving the SFT model. Further investigating this, we find that while the DPO model does display lower entropy, it in fact has higher pass@K performance on AIME evaluations, as shown in Figure 20. This suggests that the DPO model remains a strong starting point for RL relative to the SFT model, as prior work (Yue et al., 2025; Shao et al., 2024) suggests RLVR, under certain conditions, helps convert pass@K improvements into pass@1 gains.

**DPO 与 SFT 都受益于 RL, 但 DPO 仍是更好起点** 表 22 显示: 在最终 RL mix 上, 从 DPO 模型出发 consistently 优于从 SFT 出发. Figure 19 突出三点差异: 对 RL 不提升的评测, DPO 往往更好并在 RL 中保持优势 (如 AlpacaEval); 对 RL 显式瞄准的评测 (如 Omega), DPO 与 SFT 终点相近; 对 RL 瞄准但从 DPO 很难再抬的评测 (如 AIME 2025), SFT 会追近 DPO. 没有任何情况是 SFT 经 RL 后超过 DPO, 因此我们选择在 DPO 模型上做 RL. 有趣的是, SFT 用 SFT 或 DPO 模型离线过滤的数据训练表现相近, 说明被 DPO 滤掉 (即已解出) 的额外样本并不给 SFT 提供额外信号. 进一步看, DPO 熵更低, 但在 AIME 上 pass@K 更高 (Figure 20). 这说明相对 SFT, DPO 仍是 RL 的强起点, 因先前工作 (Yue et al., 2025; Shao et al., 2024) 表明在一定条件下 RLVR 有助于把 pass@K 改进转成 pass@1.

**Rewards steadily increase across all domains during RL** Figure 18 plots per-verifier reward curves along with average output length. We find that reward steadily increases across all domains, albeit at differing rates (with instruction-following data increasing most steadily, and code reward increasing most slowly). We plot more RL curves in the appendix (Figure 41). Interestingly, we find that sequence lengths first slightly dip and

**RL 期间各域奖励稳定上升** Figure 18 画出各 verifier 奖励曲线与平均输出长度. 各域奖励都稳定上升, 速率不同 (指令遵循升得最稳, 代码最慢). 更多 RL 曲线见附录 (Figure 41). 有趣的是, 序列长度先略降,

<!-- page 51 of 118 -->

|  | Totaltokens(Mtok) | Tokens/second | MFU(%) | MBU(%) |
| --- | --- | --- | --- | --- |
| OLMo 2 | 6.34 | 881 | 0.30 | 12.90 |
| + continuous batching | 7.02 | 975 | 0.33 | 14.29 |
| + better threading | 9.77 | 1358 | 0.46 | 19.89 |
| + inflight updates (Olmo 3) | 21.23 | 2949 | 1.01 | 43.21 |

Table 23 Effect of core infrastructure improvements to OlmoRL. We ablate the effect of each component by measuring the training speed (tokens/second) and utilization metrics as we add each component in turn from the original OLMo 2 RL infrastructure. The addition of inflight-updates has the most drastic improvement.

表 23｜OlmoRL 核心基础设施改进的效应. 从原 OLMo 2 RL 基础设施起逐项加入组件, 测量训练速度 (token/秒) 与利用率. inflight-updates 带来最剧烈的提升.

![Chart block](images/p51-chart.png)

![Chart block](images/p51-training-steps.png)

> 图注: training steps.

Training Steps

![Chart block](images/p51-figure-18-reward-curves-during-training-of-olmo-3-think.png)

Figure 18 Reward curves during training of Olmo 3 Think 7B. Average, math, code, and IF reward over RL training for the final RLVR training run of Olmo 3 Think. Reward steadily grows across domains, suggesting smooth training. See Figure 41 in Appendix for further RL curves.

图 18｜Olmo 3 Think 7B 训练中的奖励曲线. 最终 RLVR 运行上平均, 数学, 代码与 IF 奖励随 RL 训练变化. 各域奖励平稳增长, 提示训练顺畅. 更多曲线见附录 Figure 41.

then slowly increase over time. This is likely due to the reasoning SFT and DPO already training the model to produce long reasoning traces of up to the maximum response length of 32K tokens.

再缓慢上升. 这很可能因为推理 SFT 与 DPO 已把模型训到能产生最长可达 32K token 响应上限的长推理轨迹.

**Mixing RL data from varied domains can prevent over-optimization** Figure 20 (left) demonstrates that training on specific domains can lead to over-optimization, in which performance on evaluations outside that domain drops, while training on a mix yields steady improvements across different domains. For example, we observe a trade-off when performing OlmoRL on IFEval alone, wherein higher IFEval scores correlate with lower AlpacaEval scores. However, when we perform our final mixed training, we are able to maintain high AlpacaEval scores without compromising IFEval performance, as the LM-judge reward ensures that the model continues to produce well-formed chat responses.

**混合多域 RL 数据可防止过优化** Figure 20 (左) 显示: 只训特定域会导致过优化——域外评测下降, 而混合训练则跨域稳步提升. 例如只在 IFEval 上做 OlmoRL 时, IFEval 更高往往伴随 AlpacaEval 更低. 但最终混合训练能在不牺牲 IFEval 的情况下保持高 AlpacaEval, 因为 LM-judge 奖励保证模型继续产出形态良好的聊天回复.

**Mixing data yields lower train reward, but not lower downstream performance** While Figure 20 demonstrates that our final mixture run achieves downstream performance similar to or greater than RL training runs on single domains, we find that we observe lower train reward across each domain when training on mixed data as opposed to single-domain data, as seen in Figure 21. This suggests that mixing data may in fact reduce the model’s tendency to over-optimize during training, preventing some degree of reward-hacking and thus generalizing better to downstream evaluations. This may explain why RL training on broader data mixtures can outperform domain-specific mixtures (Cheng et al., 2025).

**混合数据训练奖励更低, 但下游不一定更差** Figure 20 显示最终混合运行的下游表现与单域 RL 相近或更好, 但 Figure 21 显示混合训练时各域训练奖励低于单域. 这说明混合可能降低过优化倾向, 一定程度防止 reward-hacking, 从而更好泛化到下游. 这或许解释为何更广数据混合上的 RL 能胜过域专用混合 (Cheng et al., 2025).

**Continuous batching and inflight updates are crucial to training speed** Using a reasoner SFT or DPO as a starting point stresses RL training to its limits, as the model starts with extremely long average generation lengths. Table 23 demonstrates how using continuous batching and inflight updates is crucial to training speed, allowing us to achieve two times faster training on half as many GPUs, making experimentation and long RL runs more tractable. To carefully benchmark this, we ablate the changes to our RL infrastructure between OLMo 2 and Olmo 3. See Table 23. For each ablation, we ran a benchmark experiment for 2 hours using 2 8x A100 nodes. One node was used for training, and one for inference. Since inference is our bottleneck, we report Model FLOPs Utilization (MFU) and Model Bandwidth Utilization (MBU) based solely

**Continuous batching 与 inflight updates 对训练速度至关重要** 以 reasoner SFT 或 DPO 为起点会把 RL 训练推到极限, 因为模型一开始平均生成就极长. 表 23 显示 continuous batching 与 inflight updates 对速度关键: 用一半 GPU 达到两倍训练速度, 使实验与长 RL 更可行. 为仔细基准, 我们消融 OLMo 2 到 Olmo 3 之间的 RL 基础设施改动. 见表 23. 每次消融用 2 个 8x A100 节点跑 2 小时基准: 一节点训练, 一节点推理. 由于推理是瓶颈, 我们只基于

<small><span class="docvortex-page-footnote" data-block-type="page_footnote" style="color:#6b7280">43<sub>While</sub> an initial checkpoint took 14 straight days of training across 9 nodes to achieve 1 epoch, with continuous batching and inflight updates, we could achieve 1 epoch on 5 nodes in 7 days.</span></small>

<!-- page 52 of 118 -->

![Chart block](images/p52-chart.png)

![Chart block](images/p52-chart-2.png)

![Chart block](images/p52-figure-19-using-dpo-as-a-starting-point-for-rlvr-works.png)

Figure 19 Using DPO as a starting point for RLVR works best. AlpacaEval, Omega-500, and AIME 2025 performance over the course of RLVR training when starting from Olmo 3 7B SFT or DPO, training using either data filtered via the DPO model (w/ DPO data) or SFT model (w/ SFT data). The importance of starting from DPO or SFT depends on the evaluation, but starting from DPO is overall preferable.

图 19｜以 DPO 为 RLVR 起点效果最好. 从 Olmo 3 7B SFT 或 DPO 出发做 RLVR 时, AlpacaEval, Omega-500 与 AIME 2025 随训练变化; 数据分别由 DPO 或 SFT 模型过滤. 起点选 DPO 或 SFT 取决于评测, 但总体更偏好从 DPO 出发.

![Chart block](images/p52-chart-3.png)

![Chart block](images/p52-chart-4.png)

![Chart block](images/p52-figure-20-effect-of-mixing-and-dpo-on-downstream.png)

Figure 20 Effect of mixing and DPO on downstream metrics. Training on mixed data prevents overfitting (left) We plot IFEval and AlpacaEval performance over RL training on Olmo 3 Think SFT 7B when training on IFEval data only or on mixed data. Training on mixed data achieves similar IFEval performance while maintaining high AlpacaEval performance. DPO with delta learning displays higher pass@K performance than SFT (right). We plot pass@K for AIME 2024 and 2025 for SFT and DPO thinking models for up to K=32. DPO consistently improves performance, even at higher K.

图 20｜混合与 DPO 对下游指标的影响. 混合数据防止过拟合 (左): 在 Olmo 3 Think SFT 7B 上只训 IFEval 或混训时 IFEval 与 AlpacaEval 的变化. 混训达到相近 IFEval 并保持高 AlpacaEval. 带 delta learning 的 DPO 比 SFT 有更高 pass@K (右): 对 SFT 与 DPO thinking 模型画出 AIME 2024/2025 直至 K=32 的 pass@K. DPO 一致提升, 即使在更高 K.

on the single node used for inference. A typical full-scale experiment would use many more nodes for inference typically with a 8:1 ratio (or more) of inference nodes to training nodes. The benchmark experiment generates a batch of 128 completions for each training step, using 64 prompts, each sampled twice, with a maximum output length of 32000, and a maximum input length of 2048, leading to a context length of 2048.

推理单节点报告 Model FLOPs Utilization (MFU) 与 Model Bandwidth Utilization (MBU). 典型全规模实验会用多得多的推理节点, 推理:训练常见 8:1 或更高. 基准实验每训练步生成 128 条 completion, 64 提示各采样两次, 最大输出长 32000, 最大输入长 2048, 上下文长 2048.

**OlmoRL shows significant improvement in precise instruction following** The precise instruction-following performance increases across post-training stages, with the final RL training stage leading to the biggest improvements in Olmo 3’s precise instruction-following abilities, as shown in Table 24, for both the development (IFEval) and the unseen (IFBench) evaluations.

**OlmoRL 显著提升精确指令遵循** 精确指令遵循表现随后训练阶段提升, 最终 RL 阶段带来最大提升, 见表 24; 开发集 IFEval 与未见集 IFBench 在 Think 与 Instruct (7B/32B) 上皆然.

<small><span class="docvortex-page-footnote" data-block-type="page_footnote" style="color:#6b7280">44<sub>Script</sub> can be found in the [github.com/allenai/open-instruct](https://github.com/allenai/open-instruct), at scripts/benchmarking/olmo3\_infra.sh.</span></small>

<!-- page 53 of 118 -->

![Chart block](images/p53-chart.png)

![Chart block](images/p53-chart-2.png)

![Chart block](images/p53-figure-21-per-domain-training-yields-higher-train.png)

Figure 21 Per-domain training yields higher train rewards. We plot the train reward over RL training for per-domain and overall mix (i.e., final) training runs. In each plot, we train an intermediate SFT model using RLVR with data only from general, IF, and math subsets, and compare to training on our overall mix. While the domain-specific runs achieve higher train reward, Figure 20 shows this does not necessarily yield improved downstream performance.

图 21｜分域训练得到更高训练奖励. 画出分域与总体混合 (最终) RL 运行的训练奖励. 各图用中间 SFT 模型, 分别只用 general, IF, math 子集做 RLVR, 并与总体混合对比. 分域运行训练奖励更高, 但 Figure 20 显示这不一定带来更好下游表现.

|  | ThinkSFT | ThinkDPO | ThinkRL | Instruct SFT | Instruct DPO | Instruct RL |
| --- | --- | --- | --- | --- | --- | --- |
| IFEval | 77.9 | 75.9 | 7B scale88.2 | 81.7 | 82.0 | 85.8 |
| IFBench | 30.0 | 28.3 | 41.632B scale | 27.4 | 29.3 | 32.3 |
| IFEval | 83.7 | 82.3 | 89.0 (3), 93.8 (3.1) | 87.7 | 87.3 | 88.8 |
| IFBench | 37 | 34.4 | 47.6 (3), 68.1 (3.1) | 29.7 | 36.3 | 39.7 |

Table 24 Summary of precise instruction following results on IFEval and IFBench, for both the Olmo 3 Think and Olmo 3 Instruct models (at 7B and 32B sizes), across various stages of the post-training pipeline.

表 24｜Olmo 3 Think 与 Olmo 3 Instruct (7B 与 32B) 在后训练各阶段于 IFEval 与 IFBench 上的精确指令遵循结果摘要.

## 5 Olmo 3 Instruct (5. Olmo 3 Instruct)

Recent studies suggest that real-world language model use predominantly centers on general tasks such as advice-seeking and information recall (Chatterji et al., 2025) that may not require extensive reasoning. Everyday chat settings often do not require the inference-time scaling of Olmo 3 Think. Hence, we develop Olmo 3 Instruct, a non-reasoning model designed with these real use cases in mind. Olmo 3 Instruct quickly and helpfully respond to common user queries.

近期研究显示真实世界语言模型使用主要集中在求建议与信息回忆等未必需要大量推理的通用任务 (Chatterji et al., 2025). 日常聊天往往不需要 Olmo 3 Think 那种 TestingTime Scaling. 因此我们开发 Olmo 3 Instruct: 面向这些真实用例的非推理模型, 快速且有帮助地回应常见用户查询.

This different model type demands different data to support it. We focus on improving the interactivity of the models by introducing multi-turn DPO data and promoting concise responses in our delta-learning preference-tuning pipeline. Additionally, Olmo 3 Instruct is trained for function-calling, for which we release new SFT datasets. Together, our recipe yields Olmo 3 Instruct models that effectively leverage tools and efficiently respond to user queries.

这类模型需要不同数据支撑. 我们聚焦提升交互性: 在 delta-learning 偏好调优流水中引入多轮 DPO 数据并鼓励简洁回复. 此外 Olmo 3 Instruct 针对 function-calling 训练, 并释放新 SFT 数据集. 合起来, 配方产出能有效用工具, 高效回应用户的 Instruct 模型.

### 5.1 Main Results for Olmo 3 Instruct (5.1 Olmo 3 Instruct 主结果)

Table 26 and Table 25 demonstrates the results of Olmo 3 Instruct 7B and 32B, respectively, on our evaluation suite . In addition to the evaluations used for Olmo 3 Think (Section 4.1), we add benchmarks for function-calling.<sup>46</sup> Olmo 3 Instruct 7B outperforms Qwen 2.5-7B Instruct, OLMo 2 Instruct 7B,

表 26｜表 26 与表 25 分别给出 Olmo 3 Instruct 7B 与 32B 在评测套件上的结果. 除 Olmo 3 Think 所用评测 (第 4.1 节) 外, 我们加入 function-calling 基准.<sup>46</sup> Olmo 3 Instruct 7B 超过 Qwen 2.5-7B Instruct, OLMo 2 Instruct 7B,

<small><span class="docvortex-page-footnote" data-block-type="page_footnote" style="color:#6b7280">45<sub>We</sub> omit reporting of Essential AI’s Rnj-1 Instruct (Vaswani, 2025) due to discrepancies between our observed and their reported numbers. Qualitatively, Rnj-1 behaves like a code specialized model (generates code even for IFEval and Safety chat tasks). Our evaluation framework is meant for general instruct models without code execution for chat tasks. This yields lower scores for Rnj-1 than they report (e.g., 16.1 versus 43.3 on AIME 25, 64.8 versus 75.7 on MBPP+, 79.3 versus 83.5 on HumanEval+) even when we use their recommended general system prompt for turning off code-producing behavior. Thus, we omit it from comparison as we do other specialized models (eg Qwen Coder).</span></small>

<small><span class="docvortex-page-footnote" data-block-type="page_footnote" style="color:#6b7280">46<sub>For</sub> missing function-calling evaluations: OLMo 2 Instruct and Gemma 2 and 3 don’t support this. Apertus and Granite aren’t supported by BFCL and we had some difficulties getting the other tasks running. We will update the paper with scores as</span></small>

<!-- page 54 of 118 -->

|  | Olmo SFT | 3.1 32B DPO | InstructInFs3itn.r1aulct | Ap7e0rBtus | 3QT2wihBneign(n)Nk3-o | QVswLtIrn3eu-2ncBt3 | Baselines2Q.5w3e2nB | G3em27mBa | G2em27mBa | OL3M2Bo 2 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Math |  |  |  |  |  |  |  |  |  |  |
| MATH | 74.4 | 86.6 | 93.4 | 36.2 | 84.3 | 95.1 | 80.2 | 87.4 | 51.5 | 49.2 |
| AIME 2024 | 12.7 | 35.2 | 67.8 | 0.31 | 27.9 | 75.4 | 15.7 | 28.9 | 4.7 | 4.6 |
| AIME 2025 | 8.2 | 23.3 | 57.9 | 0.1 | 21.3 | 64.2 | 13.4 | 22.9 | 0.9 | 0.9 |
| OMEGA | 15.5 | 33.3 | 42.2 | 5.6 | 23.4 | 44.0 | 19.2 | 24.0 | 9.1 | 9.8 |
| Reasoning |  |  |  |  |  |  |  |  |  |  |
| BigBenchHard | 69.0 | 82.1 | 84.0 | 57.0 | 80.4 | 89.0 | 80.9 | 82.4 | 66.0 | 65.6 |
| ZebraLogic | 30.6 | 51.1 | 61.7 | 9.0 | 28.4 | 86.7 | 24.1 | 24.8 | 17.2 | 13.3 |
| AGI Eval English | 71.7 | 79.4 | 79.5 | 61.6 | 82.4 | 89.4 | 78.9 | 76.9 | 70.9 | 68.4 |
| Coding |  |  |  |  |  |  |  |  |  |  |
| HumanEvalPlus | 80.8 | 85.7 | 86.7 | 42.9 | 83.9 | 89.3 | 82.6 | 79.2 | 67.5 | 44.4 |
| MBPP+ | 61.5 | 63.6 | 65.1 | 45.8 | 67.9 | 69.0 | 66.6 | 65.7 | 61.2 | 49.0 |
| LiveCodeBench v3 | 35.4 | 49.6 | 54.7 | 9.7 | 57.5 | 70.2 | 49.9 | 39.0 | 28.7 | 10.6 |
| IF |  |  |  |  |  |  |  |  |  |  |
| IFEval | 87.7 | 87.3 | 88.8 | 70.4 | 87.5 | 88.1 | 81.9 | 85.4 | 62.1 | 85.8 |
| IFBench | 29.7 | 36.3 | 39.7 | 26.0 | 31.3 | 37.2 | 36.7 | 31.3 | 27.8 | 36.4 |
| Knowledge &amp; QA |  |  |  |  |  |  |  |  |  |  |
| MMLU | 79.0 | 81.9 | 80.9 | 70.2 | 85.8 | 88.7 | 84.6 | 74.6 | 76.1 | 77.1 |
| PopQA | 23.7 | 28.5 | 25.0 | 33.5 | 25.9 | 25.7 | 28.0 | 30.2 | 30.4 | 37.2 |
| GPQA | 41.3 | 47.9 | 48.6 | 27.9 | 54.4 | 61.4 | 44.6 | 45.0 | 39.9 | 36.4 |
| Chat |  |  |  |  |  |  |  |  |  |  |
| AlpacaEval 2 LC | 42.2 | 69.7 | 59.8 | 19.9 | 67.9 | 84.3 | 81.9 | 65.5 | 39.8 | 38.0 |
| Tool Use |  |  |  |  |  |  |  |  |  |  |
| SimpleQA | 82.3 | 85.3 | 84.7 | - | 86.7 | 91.5 | 90 | - | - | - |
| LitQA2 | 47.6 | 53.3 | 55.6 | - | 46.7 | 32 | 26.2 | - | - | - |
| BFCL | 57 | 58.6 | 58.8 | - | 63.1 | 66.3 | 62.8 | - | - | - |
| Safety | 92.1 | 88.9 | 89.5 | 77.1 | 81.6 | 85.8 | 82.2 | 68.8 | 74.4 | 84.2 |

Table 25 Results of our model Olmo 3.1 32B Instruct on our post-training evaluation suite. Olmo 3.1 32B Instruct is the best fully-open model at 32B.

表 25｜Olmo 3.1 32B Instruct 在后训练评测套件上的结果. Olmo 3.1 32B Instruct 是 32B 档最强 fully-open 模型.

and Apertus 8B Instruct. Similarly, Olmo 3.1 Instruct 32B outperforms most open models at similar scale, including Qwen 2.5 32B, Qwen 3 32B (No Thinking), Gemma 3 27B, and Apertus 70B. Notably, Olmo 3.1 Instruct 32B achieves 39.7 on IFBench outperforming Qwen 3 and Qwen 3 VL at 32B scale. In addition, Olmo 3.1 Instruct 32B achieves 57.9 on AIME 2025, surpassing Qwen 3 32B (No Thinking) by 36.6 points, and closing the gap to Qwen 3 VL 32B-Instruct.

以及 Apertus 8B Instruct. 同样, Olmo 3.1 Instruct 32B 超过多数同规模开放模型, 含 Qwen 2.5 32B, Qwen 3 32B (No Thinking), Gemma 3 27B 与 Apertus 70B. 尤其 IFBench 达到 39.7, 超过同档 Qwen 3 与 Qwen 3 VL. 另在 AIME 2025 达到 57.9, 比 Qwen 3 32B (No Thinking) 高 36.6 分, 并缩小与 Qwen 3 VL 32B-Instruct 的差距.

### 5.2 Supervised Finetuning with Dolci Instruct SFT (5.2 用 Dolci Instruct SFT 做监督微调)

We construct Dolci Instruct SFT by building upon our OLMo 2 Instruct mixture, making significant improvements to advance general chat, reasoning, and function-calling capabilities.

我们在 OLMo 2 Instruct 混合基础上构造 Dolci Instruct SFT, 并做显著改进以推进通用聊天, 推理与 function-calling.

#### 5.2.1 Function-calling Training Data (5.2.1 Function-calling 训练数据)

Our goals for curating tool-use training data for Olmo 3 Instruct are to provide the model a strong foundation in basic function calling and to expose the model to trajectories demonstrating the effective use of real environments (i.e., MCP servers) to perform tasks. Accordingly, we collect two kinds of trajectories synthesized using LLMs, described below.

为 Olmo 3 Instruct 策展工具使用训练数据的目标是: 打下基础 function calling 功底, 并让模型见到在真实环境 (即 MCP 服务器) 中有效完成任务的轨迹. 因此我们收集两类由 LLM 合成的轨迹, 如下.

**Trajectories with real interactions** We collect trajectories demonstrating agents’ use of MCP servers to answer queries. All trajectories have a single user turn and multiple agent–environment interactions. We focus on the following domains:

**带真实交互的轨迹** 我们收集展示 agent 用 MCP 服务器回答查询的轨迹. 所有轨迹单用户轮, 多轮 agent–环境交互. 聚焦以下域:

• **Science QA dataset** contains two broad classes of queries requiring retrieval and reasoning over scholarly content: 1) paper content-based queries, which focus on information present in the abstract or full text of papers and 2) citation graph-based queries, which are about metadata such as authors, venues, and citations.
• **Science QA 数据集** 含两类需要在学术内容上检索与推理的查询: 1) 基于论文内容的查询, 聚焦摘要或全文信息; 2) 基于引用图的查询, 关于作者, 会议与引用等元数据.

<small><span class="docvortex-page-footnote" data-block-type="page_footnote" style="color:#6b7280">open git requests are resolved.</span></small>

<!-- page 55 of 118 -->

|  | Ol SFT | mo 3 7B I DPO | nstruct InFsitnraulct | Qw8eBn 3 | QVwILnes8ntB3 | Basel2Q.w5e7nB | inesO7BLMInost2 | A8pBeIrntsuts | G3rI.an3ns8titBe |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Math |  |  |  |  |  |  |  |  |  |
| MATH | 65.1 | 79.6 | 87.3 | 82.3 | 91.6 | 71.0 | 30.1 | 21.9 | 67.3 |
| AIME 2024 | 6.7 | 23.5 | 44.3 | 26.2 | 55.1 | 11.3 | 1.3 | 0.5 | 7.3 |
| AIME 2025 | 7.2 | 20.4 | 32.5 | 21.7 | 43.3 | 6.3 | 0.4 | 0.2 | 6.3 |
| OMEGA | 14.4 | 22.8 | 28.9 | 20.5 | 32.3 | 13.7 | 5.2 | 5.0 | 10.7 |
| Reasoning |  |  |  |  |  |  |  |  |  |
| BigBenchHard | 51.0 | 69.3 | 71.2 | 73.7 | 85.6 | 68.8 | 43.8 | 42.2 | 61.2 |
| ZebraLogic | 18.0 | 28.4 | 32.9 | 25.4 | 64.3 | 10.7 | 5.3 | 5.3 | 17.6 |
| AGI Eval English | 59.2 | 64.0 | 64.4 | 76.0 | 84.5 | 69.8 | 56.1 | 50.8 | 64.0 |
| Coding |  |  |  |  |  |  |  |  |  |
| HumanEvalPlus | 69.8 | 72.9 | 77.2 | 79.8 | 82.9 | 74.9 | 25.8 | 34.4 | 64.0 |
| MBPP+ | 56.5 | 55.9 | 60.2 | 64.4 | 66.3 | 62.6 | 40.7 | 42.1 | 54.0 |
| LiveCodeBench v3 | 20.0 | 18.8 | 29.5 | 53.2 | 55.9 | 34.5 | 7.2 | 7.8 | 11.5 |
| IF |  |  |  |  |  |  |  |  |  |
| IFEval | 81.7 | 82.0 | 85.6 | 86.3 | 87.8 | 73.4 | 72.2 | 71.4 | 77.5 |
| IFBench | 27.4 | 29.3 | 32.3 | 29.3 | 34.0 | 28.4 | 26.7 | 22.1 | 22.3 |
| Knowledge &amp; QA |  |  |  |  |  |  |  |  |  |
| MMLU | 67.1 | 69.1 | 69.1 | 80.4 | 83.6 | 77.2 | 61.6 | 62.7 | 63.5 |
| PopQA | 16.5 | 20.7 | 14.1 | 20.4 | 26.5 | 21.5 | 25.5 | 25.5 | 28.9 |
| GPQA | 30.0 | 37.9 | 40.4 | 44.6 | 51.1 | 35.6 | 31.3 | 28.8 | 33.0 |
| Chat |  |  |  |  |  |  |  |  |  |
| AlpacaEval 2 LC | 21.8 | 43.3 | 40.9 | 49.8 | 73.5 | 23.0 | 18.3 | 8.1 | 28.6 |
| Tool Use |  |  |  |  |  |  |  |  |  |
| SimpleQA | 74.2 | 79.8 | 79.3 | 79.0 | 90.3 | 78.0 | - | - | - |
| LitQA2 | 38.0 | 43.3 | 38.2 | 39.6 | 30.7 | 29.8 | - | - | - |
| BFCL | 48.9 | 49.6 | 49.8 | 60.2 | 66.2 | 55.8 | - | - | - |
| Safety | 89.5 | 89.9 | 87.6 | 78.4 | 77.7 | 73.4 | 91.1 | 71.1 | 74.3 |

Table 26 Overview of Olmo 3 Instruct 7B results on the Olmo 3 post-training evaluation suite. To reduce variance due to model non-determinism, all numbers are the average over three runs.

表 26｜Olmo 3 Instruct 7B 在 Olmo 3 后训练评测套件上的结果概览. 为降低非确定性方差, 所有数字为三次运行平均.

Trajectories associated with the queries are obtained using an agent based on GPT-4.1-mini equipped with the ASTA Scientific Corpus (ASC) MCP server<sup>47</sup>, which provides structured access to metadata and paper content on Semantic Scholar<sup>48</sup>. Additional details about these datasets are provided in Appendix A.7.2.

与这些查询相关的轨迹由配备 ASTA Scientific Corpus (ASC) MCP 服务器的 GPT-4.1-mini agent 获得<sup>47</sup>, 该服务器提供对 Semantic Scholar 元数据与论文内容的结构化访问<sup>48</sup>. 更多细节见附录 A.7.2.

• **Web search QA dataset** is adapted from DR Tulu (Shao et al., 2025a). It consists of a multi-stage pipeline that combines benchmark-derived and real-world queries. Queries are drawn from open-access benchmarks: HotpotQA (Yang et al., 2018), TaskCraft (Shi et al., 2025), and WebWalkerQA (silver) (Wu et al., 2025a), as well as from consented, publicly released user prompts from SearchArena (Miroyan et al., 2025) and OpenScholar (Asai et al., 2024). We filter the set of queries using GPT-5 to keep only those that both require search and have long-form, verifiable responses. The trajectories for these queries are obtained from a GPT-5 agent equipped with the Serper API , which provides access to a Google search tool and a tool for fetching webpages given their URLs. Additional details about query filtering and trajectory generation can be found in Appendix A.7.2.
• **Web search QA 数据集** 改编自 DR Tulu (Shao et al., 2025a). 多阶段流水结合基准派生与真实世界查询. 查询来自开放基准: HotpotQA (Yang et al., 2018), TaskCraft (Shi et al., 2025), WebWalkerQA (silver) (Wu et al., 2025a), 以及经同意公开的 SearchArena (Miroyan et al., 2025) 与 OpenScholar (Asai et al., 2024) 用户提示. 用 GPT-5 过滤, 只保留既需搜索又有长, 可验证回答的查询. 轨迹来自配备 Serper API 的 GPT-5 agent (Google 搜索与按 URL 取网页). 过滤与轨迹生成细节见附录 A.7.2.

**Trajectories with simulated interactions** While training on trajectories with executable environments is expected to teach the model to effectively deal with real environment outputs and handle unexpected errors, it is difficult to curate such trajectories at scale, thus potentially limiting the model’s generalization to unseen tools at inference time. To fill this gap, we also create a dataset of synthetic trajectories with LLM-simulated environments which are much easier to scale. We call this dataset **SimFC**. We start with a large pool of tool sets or APIs from existing datasets (e.g., xLAM (Liu et al., 2024c), ToolACE (Liu et al., 2024b)), and from publicly available MCP servers, and prompted LLMs (GPT-4o, GPT-4.1, and GPT-5) to generate entire trajectories including simulated user queries, environment responses, and assistant messages. We design

**带模拟交互的轨迹** 在可执行环境上训练应能教会模型处理真实环境输出与意外错误, 但此类轨迹难大规模策展, 可能限制对未见工具的泛化. 为填补缺口, 我们另造一套由 LLM 模拟环境的合成轨迹数据集 **SimFC**, 更易扩展. 从已有数据集 (如 xLAM (Liu et al., 2024c), ToolACE (Liu et al., 2024b)) 与公开 MCP 服务器收集大批工具集/API, 提示 LLM (GPT-4o, GPT-4.1, GPT-5) 生成整段轨迹, 含模拟用户查询, 环境响应与助手消息. 我们设计

<small><span class="docvortex-page-footnote" data-block-type="page_footnote" style="color:#6b7280">47<a href="https://allenai.org/asta/resources/mcp"><sub>allenai</sub>.org/asta/resources/mcp</a></span></small>

<small><span class="docvortex-page-footnote" data-block-type="page_footnote" style="color:#6b7280">48<a href="https://www.semanticscholar.org/"><sub>www</sub>.semanticscholar.org</a></span></small>

<small><span class="docvortex-page-footnote" data-block-type="page_footnote" style="color:#6b7280">49 <a href="https://serper.dev/"><sub>serper</sub>.dev</a></span></small>

<!-- page 56 of 118 -->

| Dataset | Env. interactions | #Trajectories | # Unique functions | %Multi-turn | %Multi-step |
| --- | --- | --- | --- | --- | --- |
| Science QA | Real (MCP) | 22.6K | 8 | - | 42.3% |
| Web Search QA | Real (MCP) | 6.6K | 3 | - | 76.1% |
| SimFC | Simulated | 200K | 42.6K | 42.3% | 23.8% |

Table 27 Details of function calling datasets. Multi-turn refers to multiple user turns per trajectory and multi-step refers to multiple environment interactions per user request.

表 27｜function calling 数据集细节. Multi-turn 指每轨迹多用户轮; multi-step 指每用户请求多次环境交互.

prompts to ensure the dataset contains a variety of interaction patterns including multi-turn, multi-step, and refusals due to inadequate information or tools. Additional details about this dataset and illustrative prompts used for generation can be found in Appendix A.7.2, Figure 42, and Figure 43.

提示以确保数据含多样交互模式: multi-turn, multi-step, 以及因信息或工具不足而拒绝. 数据集与生成提示示例见附录 A.7.2, Figure 42 与 Figure 43.

**Balancing function diversity with interaction complexity** As illustrated by the statistics in Table 27, the two types of trajectories have key differences. SimFC has a large number of trajectories with diverse sets of functions. We find that synthesizing trajectories with multiple user turns (multi-turn trajectories) is relatively easier than those with multiple assistant-environment interactions per user request (multi-step trajectories). However, the latter class usually corresponds to more complex tasks. On the other hand, the datasets with real interactions, while smaller in size, are naturally more complex in terms of multi-step interactions.

**在函数多样性与交互复杂度之间平衡** 如表 27 统计所示, 两类轨迹关键差异明显. SimFC 轨迹多, 函数集多样. 我们发现合成多用户轮 (multi-turn) 相对更容易, 而每用户请求多次助手-环境交互 (multi-step) 更难, 但后者通常对应更复杂任务. 另一方面, 真实交互数据集虽更小, 在 multi-step 上天然更复杂.

**Unified data format** Across all tool-use data, we adopt consistent tool definition and tool-calling formats. We find that unifying format to be crucial for stable and high-quality tool-use behavior. Particularly, we use the OpenAPI specification<sup>50</sup> for all tool definitions and represent all function calls as pythonic code blocks. We provide tool specifications in the system prompt, encapsulate tool calls with XML tags within the assistant role, and present environment outputs to the model within a special environment role. We also extend the tokenizer’s vocabulary with dedicated special tokens corresponding to these tags. Unlike Olmo 3 Think, preliminary suggest this approach to be more effective for tool-use training than encoding &lt;functions&gt;, &lt;/functions&gt;, &lt;function_calls&gt;, and &lt;function_calls&gt; as regular text.

**统一数据格式** 所有工具使用数据采用一致的工具定义与调用格式. 我们发现统一格式对稳定, 高质量工具行为至关重要. 具体地, 全部工具定义用 OpenAPI 规范<sup>50</sup>, 全部函数调用表示为 pythonic 代码块. 工具规格放在系统提示, 助手角色内用 XML 标签封装调用, 环境输出以特殊 environment 角色呈现. 词表也为这些标签扩展专用特殊 token. 与 Olmo 3 Think 不同, 初步显示这对工具训练比把 &lt;functions&gt; 等编码成普通文本更有效.

**Evaluating function calling** We evaluate the function calling capabilities of Olmo 3 Instruct in terms of intrinsic function calling and extrinsic task completion accuracies using different benchmarks. We use the Berkeley Function Calling Leaderboard (BFCLv3) (Patil et al., 2025) to evaluate intrinsic function calling accuracy. This benchmark focuses on models’ ability to choose the relevant functions and the right values for their arguments to accomplish a given task in settings that require one or more interactions with simulated users and environments. We evaluate task completion accuracy of Olmo 3 Instruct in comparison with similar models when they are deployed as agents with access to tools served via Model Context Protocol (MCP) servers. Particularly, we use the Asta Scientific Corpus (ASC) tool (Bragg et al., 2025) that serves eight functions for accessing scientific literature, and the Serper API which provides Google search tool and web browsing functionalities. To evaluate models’ usage of the ASC tools, following Bragg et al. (2025), we use a subset of 75 questions from LitQA2 (Skarlinski et al., 2024) for which the associated papers can be found in ASC’s index. We evaluate the models’ usage of search and browsing tools using a subset of SimpleQA (Wei et al., 2024).

**评测 function calling** 我们从内在 function calling 与外在任务完成准确率两方面, 用不同基准评 Olmo 3 Instruct. 内在准确率用 Berkeley Function Calling Leaderboard (BFCLv3) (Patil et al., 2025), 关注在需与模拟用户/环境一次或多次交互的设定下选择相关函数与正确参数. 外在任务完成则把模型作为可访问 MCP 工具的 agent 与相似模型对比. 尤其用提供八个科学文献访问函数的 Asta Scientific Corpus (ASC) 工具 (Bragg et al., 2025), 以及提供 Google 搜索与浏览的 Serper API. ASC 用法评测跟随 Bragg et al. (2025), 用 LitQA2 (Skarlinski et al., 2024) 中 75 题子集 (相关论文可在 ASC 索引找到). 搜索与浏览用法用 SimpleQA (Wei et al., 2024) 子集评测.

We use the official Gorilla repository<sup>52</sup> for BFCLv3 evaluations. For LitQA2 and SimpleQA, we implement a basic function-calling agent using OpenAI’s Agent SDK. This agent uses the tools provided by the relevant MCP server<sup>53</sup>, and interacts with the environment by iteratively making function calls and processing the outputs of executing them to solve the given tasks. For LitQA2 and SimpleQA, we also measure model performance when deployed in a No-Tools setting, in which we provide no tools to the agents and they are expected to solve the tasks entirely from the models’ parametric knowledge. We use a zero-shot evaluation

BFCLv3 用官方 Gorilla 仓库<sup>52</sup>. LitQA2 与 SimpleQA 用 OpenAI Agent SDK 实现基础 function-calling agent, 使用相关 MCP 服务器提供的工具<sup>53</sup>, 通过迭代调用函数并处理执行输出完成任务. LitQA2 与 SimpleQA 也测 No-Tools 设定: 不给工具, 期望完全靠参数知识解题. 我们用 zero-shot 评测

<small><span class="docvortex-page-footnote" data-block-type="page_footnote" style="color:#6b7280">50 <a href="https://swagger.io/specification/"><sub>swagger</sub>.io/specification/</a></span></small>

<small><span class="docvortex-page-footnote" data-block-type="page_footnote" style="color:#6b7280">51<a href="https://huggingface.co/datasets/akariasai/sampled_simpleqa"><sub>huggingface</sub>.co/datasets/akariasai/sampled\_simpleqa</a></span></small>

<small><span class="docvortex-page-footnote" data-block-type="page_footnote" style="color:#6b7280">52 <a href="https://github.com/ShishirPatil/gorilla"><sub>github</sub>.com/ShishirPatil/gorilla</a></span></small>

<small><span class="docvortex-page-footnote" data-block-type="page_footnote" style="color:#6b7280">53<sub>We</sub> the same setup introduced by Shao et al. (2025a) for DR Tulu.</span></small>

<!-- page 57 of 118 -->

|  |  |  | Subse | t of Olmo | 3 Instru | ct Benchma | rks |  |  |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Name | Avg. | MMLU | BBH | GPQA | MATH | GSM8K | CHE | AE | IFEval |
| Base mix | 29.0 | 50.0 | 29.5 | 25.2 | 6.6 | 30.1 | 23.2 | 5.8 | 61.7 |
| Base mix + Aya | 29.1 | 51.9 | 28.2 | 28.1 | 6.9 | 31.4 | 21.3 | 4.9 | 60.3 |
| Base mix + Code | 28.7 | 51.1 | 28.8 | 25.0 | 6.9 | 28.2 | 26.8 | 5.8 | 57.3 |
| Base mix + Flan | 30.3 | 51.9 | 35.0 | 26.8 | 6.6 | 34.7 | 21.3 | 5.8 | 60.3 |
| Base mix + IF | 30.7 | 51.4 | 24.7 | 25.5 | 7.9 | 42.2 | 14.6 | 5.5 | 74.1 |
| Base mix + Math | 29.3 | 49.9 | 23.9 | 29.2 | 14.2 | 39.7 | 18.3 | 5.4 | 54.0 |
| Base mix + Safety | 27.0 | 51.7 | 28.3 | 24.8 | 6.5 | 28.2 | 14.0 | 6.8 | 56.0 |
| Base mix + Science | 29.4 | 53.4 | 25.3 | 28.1 | 8.3 | 34.9 | 20.7 | 6.8 | 57.3 |
| Base mix + Wildchat | 30.9 | 51.9 | 30.7 | 23.7 | 6.9 | 32.2 | 23.2 | 19.2 | 59.7 |

Table 28 Results of our instruct SFT mixing ablations on top of OLMo 2.

表 28｜在 OLMo 2 之上做 instruct SFT 混合消融的结果.

<table><tr><td rowspan="2">Name</td><td colspan="11">Subset of Olmo 3 Instruct Benchmarks</td></tr><tr><td>Avg.</td><td>BBH</td><td>GPQA</td><td>MATH</td><td>GSM8K</td><td>OMEGA</td><td>CHE</td><td>MBPP</td><td>LCB</td><td>AE</td><td>IFEval</td></tr><tr><td>No thinking SFT</td><td>44.5</td><td>46.5</td><td>29.7</td><td>60.3</td><td>87.6</td><td>8.6</td><td>63.8</td><td>54.1</td><td>13.0</td><td>27.0</td><td>81.0</td></tr><tr><td>With thinking SFT</td><td>47.8</td><td>46.6</td><td>34.4</td><td>65.9</td><td>91.1</td><td>12.2</td><td>68.7</td><td>57.1</td><td>17.1</td><td>27.1</td><td>84.7</td></tr><tr><td>Gain from thinking SFT first</td><td>3.3</td><td>0.1</td><td>4.7</td><td>5.6</td><td>3.5</td><td>3.6</td><td>4.9</td><td>3.0</td><td>4.0</td><td>0.1</td><td>3.7</td></tr></table>

Table 29 Results of training an intermediate Olmo 3 Instruct 7B checkpoint with and without thinking SFT first.

表 29｜中间 Olmo 3 Instruct 7B 检查点先做/不做 thinking SFT 的训练结果.

for all these benchmarks. We sample from models at temperature 0 and, for LitQA2 and SimpleQA, allow the agents at most 10 turns to finish each task. We run each evaluation three times and report the average accuracy. We release our code<sup>54</sup> for running our MCP-based tool-use evaluations.

用于所有这些基准. 温度 0 采样; LitQA2 与 SimpleQA 最多允许 10 轮. 每项评测跑三次报平均准确率. 释放 MCP 工具评测代码<sup>54</sup>.

#### 5.2.2 Curating Dolci Instruct SFT (5.2.2 策展 Dolci Instruct SFT)

**Step 1. Sourcing Prompts and Completions** Our prompt collection includes all our new function-calling data (Section §5.2.1), new prompts for instruction following (see Section §4.2.1) and science, and more chat prompts from WildChat (Zhao et al., 2024a). For examples that originally contained reasoning traces (such as the OpenThoughts3 science subset described in Section §4.2.1), we remove the reasoning traces and special tokens. We also update completions from older models such as GPT-3.5 and GPT-4 with completions from GPT-4.1. We show a summary of our instruct SFT mix in Table 30.

**步骤 1. 采集提示与补全** 提示集合含全部新 function-calling 数据 (第 §5.2.1 节), 新的指令遵循与科学提示 (见第 §4.2.1 节), 以及更多来自 WildChat (Zhao et al., 2024a) 的聊天提示. 对原先含推理轨迹的例子 (如第 §4.2.1 节 OpenThoughts3 科学子集), 去掉推理轨迹与特殊 token. 也用 GPT-4.1 更新来自 GPT-3.5/GPT-4 等旧模型的补全. Instruct SFT mix 摘要见表 30.

**Step 2: Filtering & Mixing** We follow the same filtering and mixing procedure detailed in Section 4.2.1. For Olmo 3 Instruct, our base mix is 100K examples from an updated intermediate mix based on the OLMo 2 SFT mix. We show results of our data-mixing experiments on OLMo 2 in Table 28.

**步骤 2: 过滤与混合** 过滤与混合流程同第 4.2.1 节. 对 Olmo 3 Instruct, 基础 mix 为基于 OLMo 2 SFT mix 更新后的中间 mix 中的 100K 例. 在 OLMo 2 上的数据混合实验见表 28.

**Starting from Olmo 3 Think SFT** We train the SFT stage of Olmo 3 Instruct starting from the Olmo 3 Think SFT model as shown in Figure 2 to give it a “warm-start.” We found that this significantly improves the performance of the Instruct model, as shown by the results in Table 29.

**从 Olmo 3 Think SFT 起步** 如图 2, Instruct 的 SFT 从 Olmo 3 Think SFT 起步以 「warm-start」. 表 29 显示这显著提升 Instruct 表现.

### 5.3 Preference Tuning with Dolci Instruct DPO (5.3 用 Dolci Instruct DPO 做偏好调优)

We create Dolci Instruct DPO by extending the strong base of our delta-learning heuristic preferences (Section §4.3) with further curated preference signals to enhance our model’s behavior in general use settings. We enrich our heuristic data with contrastive pairs from an improved GPT-judge pipeline for general alignment. Additionally, user interaction with LMs commonly requires multi-turn conversational capabilities, so we introduce synthetic multi-turn conversations to our preference data. We also observe that preference-data pipelines often promote overly verbose responses; we introduce counteracting interventions to promote brevity in model responses by mitigating length bias in the preference data.

我们通过扩展 delta-learning 启发式偏好的强底座 (第 §4.3 节), 并进一步策展偏好信号以增强通用使用行为, 构造 Dolci Instruct DPO. 用改进的 GPT-judge 流水为通用对齐充实启发式数据. 另因用户交互常需多轮对话能力, 向偏好数据引入合成多轮对话. 也观察到偏好流水常推动过长回复; 我们引入对冲干预, 通过限制偏好数据中的长度偏置来鼓励简洁.

<small><span class="docvortex-page-footnote" data-block-type="page_footnote" style="color:#6b7280">54 <a href="https://github.com/allenai/mcp-tool-eval"><sub>github</sub>.com/allenai/mcp-tool-eval</a></span></small>

<!-- page 58 of 118 -->

| Category | Prompt Dataset | #Prompts used in SFT | #Prompts used in DPO | Reference |
| --- | --- | --- | --- | --- |
| Chat &amp; | WildChat | 302,406 | 30,248 | Zhao et al. (2024a) |
| Precise IF | Dolci Instruct Precise IF Dolci Instruct Persona Precise IF OpenAssistant | 136,833-7,132 | 35,0576667493 | -Lambert et al. (2024) Köpf et al. (2024) |
| Math | Tülu 3 Persona MATH Tülu 3 Persona Algebra Tülu 3 Persona GSM OpenMathInstruct 2 | 149,95819,99949,98050,000 | 14,7282,0255,0115,325 | Lambert et al. (2024) Lambert et al. (2024) Lambert et al. (2024) Toshniwal et al. (2024) |
| Coding | Dolci Instruct Python Algorithms Tülu 3 Persona Python Evol CodeAlpaca | 186,34534,999107,270 | 24,0964,59812,953 | -Lambert et al. (2024) Luo et al. (2023) |
| Safety | CoCoNot WildGuardMix WildJailbreak | 10,95749,37349,965 | 2,20312,03712,431 | Brahman et al. (2024) Han et al. (2024) Jiang et al. (2024) |
| Science | SciRiff Dolci Instruct OpenThought3+ Science | 4,55799,268 | 8,87426,134 | Wadden et al. (2024) Guha et al. (2025a) |
| Multilingual | Aya | 99,987 | 6,523 | Singh et al. (2024) |
| Other | TableGPT FLAN Logic Puzzles Verifiable Reasoning Dolci Instruct Hardcoded Dolci Instruct Tool Use | 5,00089,981159,882310,57269227,579 | 1,21816,120---- | Zha et al. (2023) Wei et al. (2021)---- |
| Multiturn | Dolci Instruct Self-Talk Dolci Instruct Synthetic Context | -- | 5,0005,000 | -- |
| Not used in SFT | DaringAnteater UltraFeedback | -- | 87822,303 | Wang et al. (2024b) Cui et al. (2023) |
| Total |  | 2,152,112 | 259,922 |  |

Table 30 Olmo 3 Instruct prompt sources for both SFT and DPO.

表 30｜Olmo 3 Instruct 在 SFT 与 DPO 上的提示来源.

#### 5.3.1 Preference Signals (5.3.1 偏好信号)

Dolci Instruct DPO is constructed from a composite of several preference signals to promote model capabilities and general usability:

Dolci Instruct DPO 由多种偏好信号复合构成, 以提升能力与通用可用性:

**Delta-learning heuristic pairs** Similar to Dolci Think DPO, we construct heuristic contrastive pairs by generating chosen responses with a large model (Qwen3 32B) and rejected responses with a small model (Qwen3 0.6B) following Geng et al. (2025). Note that we turn off thinking mode, as we do not need internal thinking traces.

**Delta-learning 启发式对** 与 Dolci Think DPO 类似, 跟随 Geng et al. (2025), 用大模型 (Qwen3 32B) 生成 chosen, 小模型 (Qwen3 0.6B) 生成 rejected 构造启发式对比对. 注意关闭 thinking 模式, 因为不需要内部 thinking traces.

**Delta-aware GPT-judged pairs** We additionally generate GPT-judged preference pairs to add a further source of preference signal. Our initial attempts to modernize the UltraFeedback pipeline from OLMo 2 and Tülu 3 by improving the quality of the LLM judge (GPT-4o → GPT-4.1) and updating our data-generator model

**Delta-aware GPT-judged 对** 我们另生成 GPT 评判的偏好对以增加信号源. 最初尝试把 OLMo 2 与 Tülu 3 的 UltraFeedback 流水现代化——提升 LLM 评判 (GPT-4o → GPT-4.1) 并更新数据生成模型

<!-- page 59 of 118 -->

pool do not yield gains and even hurt model performance relative to the OLMo 2 preference dataset baseline. We speculate that this failure is due to the fact that the majority of our data generators are high-quality, very capable models; hence on average there was minimal meaningful contrast between the resulting chosen and rejected pairs. To mitigate this, we explicitly introduce delta-aware interventions designed to lower the quality of the rejected response. We 1) ensure that responses from weaker models are always present in the response set judged for each prompt, and 2) select the worst response as the rejected completion to maximize the resulting delta. We find these “delta-maximizing” interventions to be critical for the quality of preference pair data; see our findings in Section §5.5 for details.

池——相对 OLMo 2 偏好数据基线并未增益甚至受伤. 我们推测失败原因是多数生成器已经很强, 平均而言 chosen/rejected 对比不足. 为缓解, 我们显式引入 delta-aware 干预以降低 rejected 质量: 1) 保证每提示的候选集里总有更弱模型回复; 2) 选最差回复作 rejected 以最大化 delta. 这些 「最大化 delta」 干预对偏好对质量至关重要; 见第 §5.5 节发现.

**Multi-turn preferences** To ensure Olmo 3’s usability in realistic multi-turn conversations, we further add a multi-turn preference dataset with prompts synthetically extended from the Tülu 3-DPO dataset. Preference pairs differed in only the last turn of the conversation to avoid ambiguity in quality ranking between turns of the same conversation. Synthetic conversations are generated with two methods: 1) self-talk extending the original prompt into a multi-turn conversation with LLM-generated follow-up requests and 2) syntheticcontext created by generating related, independent questions or paraphrases of the initial prompt to use as previous user turns with associated completions. The combination of these generation methods ensures diversity in generated conversations. Final turns are generated with the delta-learning heuristic (Geng et al., 2025); chosen/rejected completion pairs are generated by either GPT-4o and GPT-3.5 or Qwen 3 32B and Qwen 3 0.6B (both no-thinking) respectively.

**多轮偏好** 为保证真实多轮对话可用性, 我们再加入由 Tülu 3-DPO 数据集合成扩展的多轮偏好数据. 偏好对仅在对话最后一轮不同, 以避免同对话轮次间质量排序含糊. 合成对话两种方法: 1) self-talk: 用 LLM 生成后续请求把原提示扩成多轮; 2) synthetic-context: 生成相关独立问题或原提示改写作为先前用户轮并配补全. 二者结合保证对话多样性. 最后一轮用 delta-learning 启发式 (Geng et al., 2025) 生成; chosen/rejected 分别由 GPT-4o 与 GPT-3.5, 或 Qwen 3 32B 与 Qwen 3 0.6B (均 no-thinking) 生成.

**Controlling length bias** Preference data often has a length bias: the chosen responses are significantly longer than the rejected responses. This comes from sourcing synthetic response pairs where historically more information has been treated as more helpful by both LLM judges and preference heuristics. Namely, LLM judges such as the GPT judge in our pipeline tend to prefer longer responses. Similarly, we empirically observe that preference pairs made with the delta-learning heuristic also exhibit length bias; larger models generate longer responses (Figure 23). Thus, models often learn this length bias in addition to the intended useful quality signal during preference tuning, after which its generation length per prompt increases significantly. While this increased length is empirically useful for reasoning tasks, excessive verbosity can be undesirable for common real-use settings (see an example in Figure 22). We seek to strike a balance by filtering the chat and multi-turn subsets of our preference data to limit the length difference between the chosen and rejected responses to 100 tokens.

**控制长度偏置** 偏好数据常有长度偏置: chosen 显著长于 rejected. 来源是合成回复对中, 历史上 LLM 评判与偏好启发式都更把 「信息更多」 当成更有帮助. 即我们流水中的 GPT 评判偏好更长回复; 经验上也观察到 delta-learning 启发式对有长度偏置——更大模型生成更长 (Figure 23). 因此偏好调优时模型除学到有用质量信号外, 也学到长度偏置, 之后每提示生成长度显著增加. 对推理任务加长经验上有用, 但对常见真实使用过冗长可能不受欢迎 (例见图 22). 我们折中: 过滤聊天与多轮子集, 把 chosen 与 rejected 长度差限制在 100 token 内.

#### 5.3.2 Prompt Mixing (5.3.2 提示混合)

Our prompt pool for GPT-judged and delta-learning heuristic pairs (see Table 30) is derived from the Dolci Instruct SFT dataset supplemented with the DaringAnteater and UltraFeedback subsets from the OLMo 2 7B preference dataset. Because DPO performance does not monotonically increase with more data (see Figure 23), we optimize the prompt distribution as a ratio within a set data budget and treat dataset size as a hyperparameter when training.

GPT-judged 与 delta-learning 启发式对的提示池 (见表 30) 来自 Dolci Instruct SFT, 并补充 OLMo 2 7B 偏好数据中的 DaringAnteater 与 UltraFeedback 子集. 因 DPO 表现不随数据单调上升 (见图 23), 我们在固定数据预算内优化提示分布比例, 并把数据集大小当作训练超参.

To determine our final preference-tuning prompt distribution, we begin with near-uniform random sampling <sup>55</sup> of 100K examples as an empirically strong baseline prompt mix. We then perform ablations of prompt-domain subsets to determine the impact of preference pairs from each domain subset. Additionally, we perform experiments that pair 50K samples of our base mix with 50K samples from a given domain, allowing us to understand the effects of upsampling each prompt domain.

为确定最终偏好调优提示分布, 我们从近均匀随机采样<sup>55</sup> 100K 例这一经验强基线起步. 再对各提示域子集做消融, 看各域偏好对的影响. 另做实验: 50K 基础 mix 配 50K 某域样本, 以理解上采样各提示域的效应.

Notably, prompt-domain distributions do not consistently align with the contrast exhibited in the response pair and thus in improvements in the corresponding downstream evaluation domains. For example, upsampling code prompts led to the counter-intuitive effect of decreasing code benchmark performance (see Table 51 in the Appendix). For determining our final mix, we create nine candidate mixes based on expert intuition gained from our ablations, comparing these hand-crafted mixes against the uniform sampling baseline. Our final mix is determined empirically; we find that our hand-crafted mixes outperformed random sampling.

值得注意的是, 提示域分布并不总与回复对中的对比, 以及对应下游评测域的提升对齐. 例如上采样代码提示反而降低代码基准 (见附录表 51). 确定最终 mix 时, 基于消融直觉手工做九个候选 mix, 与均匀采样基线对比. 最终 mix 由经验决定; 我们发现手工 mix 优于随机采样.

<small><span class="docvortex-page-footnote" data-block-type="page_footnote" style="color:#6b7280">55<sub>We</sub> decided early to truncate the number of Wildchat prompts to be at most 35% of the prompt mix. If you read Wildchat prompts for a month, you would too.</span></small>

<!-- page 60 of 118 -->

![Image block](images/p60-figure-22-length-control-promotes-concise-usable.png)

Figure 22 Length control promotes concise, usable responses. On the left is a response from a development model preference-tuned without length control; on the right, a response to the same prompt from Olmo 3 Instruct-DPO (with length control). Promoting brevity in model responses makes the response easier to read and understand.

图 22｜长度控制促进简洁, 可用的回复. 左: 无长度控制偏好调优的开发模型回复; 右: 同一提示下 Olmo 3 Instruct-DPO (有长度控制) 的回复. 鼓励简洁使回复更易读懂.

#### 5.3.3 Training (5.3.3 训练)

We follow the same training setup as Olmo 3 Think and sweep the same hyperparameters, namely learning rate and dataset size. We further sweep different length-control interventions by creating datasets with differing token cutoffs for length filtering. We select the best-performing checkpoint of each length budget and then select the final Olmo 3 Instruct-DPO checkpoint based on qualitative vibe tests and performance-vs-length analysis.

训练设定与 Olmo 3 Think 相同并扫描同样超参, 即学习率与数据集大小. 再通过构造不同 token 截断的长度过滤数据集, 扫描长度控制干预. 先选各长度预算下最佳检查点, 再结合定性 vibe test 与表现-长度分析选定最终 Olmo 3 Instruct-DPO 检查点.

### 5.4 Reinforcement Learning with Dolci Instruct-RL (5.4 用 Dolci Instruct-RL 做强化学习)

For our RL training stage, we modify the pool of prompts from Dolci Think RL (Section §4.4.2) by 1) utilizing less challenging datasets in the math and code domains, and 2) skipping the offline difficulty filtering, as our instruct model focuses more on general instruction following rather than complex reasoning.

RL 阶段我们修改 Dolci Think RL (第 §4.4.2 节) 的提示池: 1) 数学与代码域改用难度更低的数据集; 2) 跳过离线难度过滤, 因 Instruct 更侧重通用指令遵循而非复杂推理.

#### 5.4.1 Training (5.4.1 训练)

Following our Olmo 3 Think recipe, we train Olmo 3 Instruct on a mixture of general chat, math, and code data.<sup>56</sup> We likewise employ OlmoRL for training, with a maximum response length of 8K tokens for 7B and 16K for 32B . Since our goal for Olmo 3 Instruct is to avoid generating excessively long outputs and preserve general usability, we apply RL on top of two DPO candidates: one that achieved the best average performance, and another with slightly lower performance but better qualitative “vibe test.” We then choose the final RL checkpoint based on final average performance, length analysis, and vibe test. Concretely, we begin by ranking checkpoints by average score; in the case of ties, we place more emphasis on datasets that

跟随 Think 配方, Instruct 在通用聊天, 数学与代码混合上训练.<sup>56</sup> 同样用 OlmoRL, 最大响应长 7B 为 8K,32B 为 16K. 因目标是避免过长输出并保住可用性, 我们在两个 DPO 候选上做 RL: 一个平均表现最好, 另一个略低但定性 「vibe test」 更好. 再按最终平均表现, 长度分析与 vibe test 选最终 RL 检查点. 具体先按平均分排序; 并列时更强调

<small><span class="docvortex-page-footnote" data-block-type="page_footnote" style="color:#6b7280">56<sub>Preliminary</sub> experiments indicated that alternative RL setups—for example, first warming up on math-only data and then switching to a mixed dataset without math—resulted in suboptimal performance.</span></small>

<small><span class="docvortex-page-footnote" data-block-type="page_footnote" style="color:#6b7280">57<sub>We</sub> experiment with both 8K and 16K length training for 7B and 32B; while evaluation scores are minimally impacted by different lengths, we notice undesirable behaviors when qualitatively testing 7B-16K and 32B-8K configurations in an internal demo.</span></small>

<!-- page 61 of 118 -->

do not scale with test-time compute (e.g., MATH and AIME performance increase with response length) to avoid biasing our selection towards models with overly long responses. Finally, we apply the vibe test to identify regressions or undesirable behaviors that may fall outside the scope of our evaluation suite.

不随 TestingTime 算力缩放的数据集 (例如 MATH 与 AIME 会随响应变长而升分), 以免偏向过长模型. 最后用 vibe test 找出评测套件可能覆盖不到的回退或不良行为.

### 5.5 Key Findings (5.5 关键发现)

Below, we summarize our key findings across all 3 stages of Olmo 3 Instruct training:

下面总结 Olmo 3 Instruct 三阶段训练的关键发现:

**Starting from the Olmo 3 Think SFT is helpful** We find that training Olmo 3 Instruct on top of the Olmo 3 Think SFT both increases model performance on benchmarks, as shown in Table 29. Importantly, average model response length is minimally affected by this strategy: Olmo 3 Instruct SFT checkpoints produce succinct answers with no remnants of thinking traces.

**从 Olmo 3 Think SFT 起步有帮助** 表 29 显示在 Think SFT 之上训 Instruct 提升基准表现. 重要的是平均响应长度几乎不受影响: Instruct SFT 检查点给出简洁答案, 无 thinking traces 残留.

**High contrast in preference pairs drives DPO improvements** We observe that a high contrast between completions is critical for achieving improvements during DPO training (Table 32). Using LLM-judge pipelines requires carefully thinking about maximizing the delta between chosen and rejected responses. Our initial attempts to modernize the OLMo 2 preference data pipeline by improving the models used to generate responses failed to yield any improvements beyond the OLMo 2 data baseline (Table 32). This is likely because the models used for synthetic completions were universally too good: the chosen and rejected responses no longer had meaningful contrast. Extending prior findings that high contrast pairs are critical for performance (Geng et al., 2025; D’Oosterlinck et al., 2025), we introduce interventions to explicitly lower the quality of the rejected response and therefore increase the magnitude of the quality delta in the preference pair. These resulting delta-aware GPT pairs significantly outperform the OLMo 2 preference data.

**偏好对中的高对比驱动 DPO 提升** 我们观察到 completion 之间高对比是 DPO 提升的关键 (表 32). 用 LLM-judge 流水时需仔细最大化 chosen/rejected delta. 最初只靠提升生成模型来现代化 OLMo 2 偏好流水, 未能超过 OLMo 2 数据基线 (表 32). 很可能因为合成补全模型普遍太强, chosen/rejected 不再有意义对比. 扩展 「高对比对关键」 的先前发现 (Geng et al., 2025; D'Oosterlinck et al., 2025), 我们引入干预显式降低 rejected 质量以增大质量 delta. 所得 delta-aware GPT 对显著优于 OLMo 2 偏好数据.

**Combining different preference signals improves overall performance** We combine delta-learning heuristic data with GPT-judged preference pairs to get the “best of both worlds.” Empirically, tuning with either deltalearning or GPT-judged pairs yields a different spread of gains; we find that these gains are complementary. Combining both sources of preference signal outperforms using either alone (Table 32).

**组合不同偏好信号提升总体表现** 我们把 delta-learning 启发式数据与 GPT-judged 偏好对结合以 「两者之长」. 经验上单独用任一来源增益分布不同且互补. 两源结合优于任一单独 (表 32).

**The ideal amount of preference data depends on the downstream task** Preference-tuned model performance peaks with different amounts of training for different downstream task domains. We plot preference-tuning performance for example tasks across varying amounts of delta-learning heuristic pairs in Figure 23. Further optimization beyond these optimal points hurts downstream performance, consistent with theoretical results showing that early stopping is important for preference tuning (Azar et al., 2023; Geng et al., 2025). Practically, this informs our training approach: we sweep learning rate and dataset size to control the amount of total optimization, and pick the best-performing setting via our development evaluation set.

**理想偏好数据量取决于下游任务** 不同下游任务域在不同训练量上见峰. Figure 23 画出不同数量 delta-learning 启发式对上的偏好调优表现. 超过最优点继续优化会伤下游, 与偏好调优需早停的理论结果一致 (Azar et al., 2023; Geng et al., 2025). 实践上这指导我们的训练: 扫描学习率与数据集大小以控制总优化量, 并在开发评测集上选最佳设定.

**Concise, usable model outputs from preference tuning can boost RL performance** Applying length control during DPO substantially reduces the model’s average generation length, allowing us to trade off some performance for improved conciseness and overall usability. While this reduction in length comes with lower scores on length-sensitive evaluations—particularly math benchmarks such as AIME and MATH—our internal qualitative assessments (“vibe tests”) almost uniformly preferred the shorter, more direct model. We make a conscious decision to prioritize usability.

**来自偏好调优的简洁可用输出可抬升 RL** DPO 期施加长度控制显著缩短平均生成, 可用一点分数换更简洁与整体可用性. 长度敏感评测——尤其 AIME 与 MATH——会降分, 但内部定性 「vibe tests」 几乎一致偏好更短更直接的模型. 我们有意识优先可用性.

Crucially, despite the lower benchmark performance at the DPO stage, length control ultimately yields to a more performant model post RL. At 7B scale, we conjecture that this arises from the RL training context window: with a fixed context window (8K), a shorter model may be “more intelligent per token,” allowing it to leverage the available budget more effectively during optimization. Thus, what initially appeared to be a tradeoff between usability and performance ultimately produced improvements in both. Moreover, we found that RL training progresses more reliably when initialized from the length-controlled DPO policy. Across most benchmarks, performance improves more steadily compared to RL runs starting from a higher-scoring but uncorrected DPO checkpoint, which tends to show earlier signs of instability or degradation. This further supports the role of concise preference-tuned models as advantageous starting points for RL.

关键的是, 尽管 DPO 阶段基准更低, 长度控制最终在 RL 后得到更强模型. 7B 上我们猜测这来自 RL 训练上下文窗口: 固定窗口 (8K) 下, 更短模型可能 「每 token 更聪明」, 优化时更能利用预算. 因而起初像可用性与表现的权衡, 最终两者都改进. 此外, 从长度控制 DPO 策略初始化时 RL 更可靠推进; 多数基准上相对从未纠正, 虽更高分但不稳的 DPO 检查点起步更平稳. 这进一步支持简洁偏好调优模型作为 RL 有利起点.

<small><span class="docvortex-page-footnote" data-block-type="page_footnote" style="color:#6b7280">58<sub>Initial</sub> experiments with GPT-judged data showed similar trends.</span></small>

<!-- page 62 of 118 -->

![Chart block](images/p62-chart.png)

![Chart block](images/p62-figure-23-effect-of-dataset-size-and-filtering-for.png)

Figure 23 Effect of dataset size and filtering for preference data. Ideal preference dataset size depends on the downstream task (left). Both AlpacaEval and ZebraLogic performance increase up to around 75–100K samples, beyond which further data scaling hurts or does not help. In contrast, AIME2024 does not saturate before the point at which AlpacaEval and ZebraLogic begin to see drops in performance. Hence, to strike an ideal balance between all downstream tasks, we sweep dataset size as a hyperparameter during training. Unfiltered preference data exhibits a length bias (right). A significant portion of the data distribution has longer chosen than rejected completions. For example, the 80th percentile of token difference for the GPT-judged data is 538 tokens and for the delta-learning heuristic pairs is 564 tokens.

图 23｜偏好数据规模与过滤的效应. 理想偏好数据集大小取决于下游任务 (左). AlpacaEval 与 ZebraLogic 约在 75–100K 样本前上升, 再加数据无益或受伤. 相反 AIME2024 在前两者开始掉分前尚未饱和. 因此训练时把数据集大小当超参扫描以平衡各下游. 未过滤偏好数据有长度偏置 (右). 相当一部分分布 chosen 长于 rejected. 例如 GPT-judged 数据 token 差第 80 分位为 538, delta-learning 启发式对为 564.

<table><tbody><tr><td rowspan="2"></td><td colspan="3">LitQA2</td><td colspan="3">SimpleQA</td></tr><tr><td>Notools</td><td>ASC</td><td>∆</td><td>Noto</td><td>ols SBT</td><td>∆</td></tr><tr><td>Olmo 3 Instruct 7B</td><td>24.4</td><td>38.2</td><td>13.8</td><td>3.3</td><td>79.2</td><td>75.9</td></tr><tr><td>Qwen 3 8B (w/o reasoning)</td><td>34.7</td><td>39.6</td><td>4.9</td><td>2.0</td><td>79.0</td><td>77.0</td></tr><tr><td>Qwen 3 VL 8B Instruct</td><td>34.7</td><td>30.7</td><td>-4.0</td><td>9.3</td><td>90.3</td><td>81.0</td></tr><tr><td>Qwen 2.5 7B</td><td>36.0</td><td>29.8</td><td>-6.2</td><td>3.3</td><td>78.0</td><td>74.7</td></tr></tbody></table>

Table 31 Comparison of agents’ performance with and without access to tools on LitQA2 and SimpleQA. ASC refers to Asta Scientific Corpus tools and SBT refers to search and browsing tools.

表 31｜agent 在 LitQA2 与 SimpleQA 上有无工具的表现对比. ASC 指 Asta Scientific Corpus 工具, SBT 指搜索与浏览工具.

**Need for tools** We assess how much of Olmo 3 Instruct’s performance on LitQA2 and SimpleQA can be attributed to tool use by measuring the delta of the model performance on the benchmarks between answering the questions only from parametric memory (“No tools” setting) and doing so using tools. Table 31 shows these deltas in comparison to those from three Qwen models. All models benefit significantly from tool use on SimpleQA. However, Qwen models, unlike Olmo 3 Instruct 7B, mostly seem to rely on parametric knowledge for LitQA2, with two of the models even losing performance when provided with tools.

**对工具的需求** 我们通过对比仅参数记忆答题 (「No tools」) 与用工具答题的分差, 评估 Olmo 3 Instruct 在 LitQA2 与 SimpleQA 上有多少表现可归因于工具. 表 31 给出相对三个 Qwen 模型的分差. 所有模型在 SimpleQA 上都显著受益于工具. 但与 Olmo 3 Instruct 7B 不同, Qwen 模型在 LitQA2 上多半靠参数知识, 其中两个给工具后甚至掉分.

<!-- page 63 of 118 -->

|  |  |  | Sub | set of Ol | mo 3 Ins | truct Be | nchmar | ks |  |  |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Name | Avg. | MMLU | BBH | GPQA | AGI | MATH | CHE | LCB | IFEval | AE2 |
| Dev. 7B SFT ckpt | 51.9 | 67.6 | 47.7 | 30.2 | 62.0 | 65.5 | 69.3 | 17.9 | 83.2 | 23.8 |
| OLMo 2 preference data | 55.5 | 69.4 | 55.6 | 33.7 | 63.6 | 71.3 | 73.7 | 12.7 | 84.5 | 35.2 |
| Updated GPT UltraF pipeline | 55.4 | 67.6 | 51.2 | 31.5 | 61.8 | 72.2 | 71.5 | 14.7 | 80.8 | 47.5 |
| + Sample weak models | 56.3 | 68.4 | 50.4 | 33.9 | 63.8 | 71.6 | 74.3 | 18.2 | 81.9 | 44.4 |
| + Min score rejected | 57.4 | 68.5 | 53.6 | 34.4 | 64.2 | 72.6 | 75.2 | 19.1 | 82.3 | 47.0 |
| Delta learning only | 57.6 | 68.7 | 49.5 | 35.5 | 64.6 | 79.1 | 73.9 | 22.0 | 78.6 | 46.1 |
| Delta learning + GPT | 60.4 | 69.4 | 66.9 | 34.6 | 64.3 | 80.0 | 74.1 | 21.1 | 83.0 | 49.8 |

Table 32 Comparing sources of preference signals. Preference pairs created with the delta-learning heuristic (chosen = large model response, rejected = smaller model response) and pairs created with our delta-aware LLM-judge pipeline yield a different spread of gains, suggesting that they provide different preference signals. These signals are complementary; combining them both yields the largest average gain. Our final Olmo 3 Instruct preference data greatly outperforms our previous OLMo 2 preference data.

表 32｜比较偏好信号来源. delta-learning 启发式对 (chosen=大模型, rejected=小模型) 与 delta-aware LLM-judge 流水对带来不同增益分布, 说明信号不同且互补; 结合两者平均增益最大. 最终 Olmo 3 Instruct 偏好数据大幅超过先前 OLMo 2 偏好数据.

## 6 Olmo 3 RL-Zero (6. Olmo 3 RL-Zero)

RL has become a key part of recent LLM pipelines in part due to prominent open models such Deepseek R1-Zero (Guo et al., 2025), which notably leverages RL training on top of a base model to bootstrap complex reasoning behavior (Marjanović et al., 2025), and due to the rapid adoption of closed reasoning models such as OpenAI’s o1-series and Gemini with Thinking. This has made RLVR finetuning from a base model the standard large-scale benchmark for RL algorithms (Liu et al., 2025a; Yu et al., 2025; Luo et al., 2025b). To date, leading open RLVR benchmarks and algorithms train on top of open-weights models that do not reveal their pretraining or midtraining data (Chu et al., 2025; Yang et al., 2025a). This limits the ability for the community to study the role of pretraining data on RLVR performance. It can lead to a myriad of issues with benchmark evaluations being contaminated, e.g., midtraining data containing data from the evaluation set, which makes spurious rewards as effective as true rewards (Shao et al., 2025b; Wu et al., 2025c), or improvements from fixing prompt templates outweighing the improvements from RL (Liu et al., 2025b).

RL 已成为近期 LLM 流水的关键部分, 部分因 Deepseek R1-Zero (Guo et al., 2025) 等突出开放模型——它在 Base 上做 RL 以引导复杂推理行为 (Marjanović et al., 2025)——以及 o1 系列与 Gemini with Thinking 等闭源推理模型的快速采用. 这使从 Base 做 RLVR 微调成为 RL 算法的标准大规模基准 (Liu et al., 2025a; Yu et al., 2025; Luo et al., 2025b). 迄今领先开放 RLVR 基准与算法多建立在不公开预训练/midtraining 数据的 open-weights 模型上 (Chu et al., 2025; Yang et al., 2025a). 这限制社区研究预训练数据对 RLVR 的作用, 并带来基准污染等问题, 例如 midtraining 含评测集使虚假奖励看似与真奖励一样有效 (Shao et al., 2025b; Wu et al., 2025c), 或修提示模板的收益盖过 RL (Liu et al., 2025b).

We therefore release a fully-open dataset Dolci RL-Zero, an algorithmic RL zero setup for Olmo 3, and open-source OlmoRL code to enable clear benchmarking for the ecosystem. We perform RLVR from Olmo 3 Base over five benchmarking domains to create the Olmo 3 RL-Zero family: math, code, precise instruction following (IF), general chat, and a mix of all listed sub-domains. In all cases, we further decontaminate Dolci RL-Zero from pretraining and midtraining data to guarantee our setup carefully studies the effect of RLVR without data leakage confounding our conclusions.

因此我们释放完全开放的 Dolci RL-Zero 数据集, Olmo 3 的 algorithmic RL zero 设定, 以及开源 OlmoRL 代码, 便于生态做清楚基准. 我们从 Olmo 3 Base 出发在五个基准域做 RLVR, 形成 Olmo 3 RL-Zero 家族: 数学, 代码, 精确指令遵循 (IF), 通用聊天, 以及上述子域的混合. 各域都对预训练与 midtraining 进一步去污染, 保证结论不被泄漏干扰.

### 6.1 Reinforcement Learning From Base with Dolci RL-Zero (6.1 从 Base 用 Dolci RL-Zero 做强化学习)

**Data** We create Dolci RL-Zero, an effective RL-Zero training dataset. For math, we aggressively filter DAPO Math (Yu et al., 2025), Klear-Reasoner Math (Su et al., 2025c), Open-Reasoner-Zero (Orz) (Hu et al., 2025), and Omega (Sun et al., 2025). We deduplicate DAPO and remove all non-English examples. As Klear-Reasoner, Orz, and Omega are much larger datasets, we further group questions via semantic clustering across Klear-Reasoner, Orz, and Omega, and select one representative question per cluster, in addition to including DAPO. We further decontaminate against both pretraining and evaluation data following subsubsection 4.2.1 and perform offline filtering, removing prompts fully solved in 8 out of 8 sample completions by the final base model. This results in a dataset of 13.3K math prompts. Data for code, instruction-following, and general chat are subsampled from Dolci Think RL (Section §4.4.2).

**数据** 我们构造有效的 RL-Zero 训练数据 Dolci RL-Zero. 数学上激进过滤 DAPO Math (Yu et al., 2025), Klear-Reasoner Math (Su et al., 2025c), Open-Reasoner-Zero (Orz) (Hu et al., 2025) 与 Omega (Sun et al., 2025). 对 DAPO 去重并去掉非英文. 因 Klear-Reasoner, Orz 与 Omega 更大, 再跨三者做语义聚类, 每簇选一代表题, 并纳入 DAPO. 再按第 4.2.1 小节对预训练与评测去污染, 并离线过滤: 去掉最终 Base 在 8/8 采样中全解的提示. 得到 13.3K 数学提示. 代码, 指令遵循与通用聊天从 Dolci Think RL (第 §4.4.2 节) 子采样.

**Prompt and eval template** Confirming the findings of Liu et al. (2025b), we find that “simple” prompt templates greatly outperform standard post-trained templates (e.g., &lt;think&gt;&lt;/think&gt;) when training from a purely midtrained model, as Dolma 3 Dolmino Mix excluded most special formatting. We develop a simple custom prompt for each domain, using the zero-shot pass@k performance as our metric. We end up with a

**提示与评测模板** 印证 Liu et al. (2025b): 从纯 midtrained 模型训练时, 「简单」 提示模板远胜标准后训练模板 (如 &lt;think&gt;&lt;/think&gt;), 因为 Dolma 3 Dolmino Mix 排除了多数特殊格式. 我们为每域开发简单定制提示, 以 zero-shot pass@k 为指标. 最终得到

<!-- page 64 of 118 -->

![Chart block](images/p64-chart.png)

![Chart block](images/p64-chart-2.png)

![Chart block](images/p64-chart-3.png)

![Chart block](images/p64-chart-4.png)

![Chart block](images/p64-chart-5.png)

![Chart block](images/p64-figure-24-different-domain-runs-of-rl-zero-on-olmo-3.png)

Figure 24 Different domain runs of RL-Zero on Olmo 3 Base: math, precise instruction-following, code, and a mix of all three plus general chat. We show the main evaluation for the math domain: AIME 2024 and 2025 with pass@1, computed as a bootstrapped average over 32 samples, and pass@32. For all domains, we show reward over training. For Mix, we separate out the individual rewards for each domain.

图 24｜Olmo 3 Base 上 RL-Zero 的不同域运行: 数学, 精确指令遵循, 代码, 以及三者加通用聊天的混合. 数学域主评测为 AIME 2024/2025 的 pass@1 (对 32 次采样做 bootstrap 平均) 与 pass@32. 各域画出训练奖励. Mix 另拆出各域奖励.

> Fig. 24 叙述: AIME 2024/2025 的 pass@1 是对 32 次采样做 bootstrap 平均, 并另报 pass@32.

prompt similar to Yu et al. (2025), shown in Figure 37. We furthermore “clean” all our evaluation prompts to remove special formatting (i.e., \boxed{}) to make evaluation prompts more similar to our training prompts.

类似 Yu et al. (2025) 的提示, 见图 37. 我们还 「清洗」 全部评测提示, 去掉特殊格式 (如 \boxed{}), 使评测提示更接近训练提示.

**RL algorithm** We follow Section §4.4.1 in all RL details except (i) we train with a response length of 16K tokens to better accommodate long chain-of-thought reasoning in the math and code domains and (ii) we evaluate with a response length of 32K tokens and temperature 1.0 to encourage diversity as we report pass@k. See Table 49 for hyperparameter details.

**RL 算法** 除两点外全部跟随第 §4.4.1 节: (i) 训练响应长 16K, 以更好容纳数学与代码域的长 CoT 推理; (ii) 评测响应长 32K, 温度 1.0 以鼓励多样性, 因我们报告 pass@k. 超参见表 49.

> 16K 用来容纳数学与代码域的长 CoT; 评测改 32K, 温度 1.0 是为鼓励多样性, 因为要报告 pass@k. 除这两点外全部跟随 §4.4.1, 超参见 Table 49.

### 6.2 Key Findings (6.2 关键发现)

**Olmo 3 RL-Zero can strongly improve on reasoning** As shown in Figure 24, our base model can greatly improve on training reward across the different domains when leveraging RL on our datasets. To demonstrate out-of-domain improvements, we evaluate our math run on the decontaminated evals AIME 2024 and 2025. We find that Olmo 3 Base drastically improves in the first couple hundred steps of training and then improves steadily but slowly. We also see a decent improvement in pass@32 results, demonstrating that our run maintains diversity and RLVR pushes the model beyond its initial capabilities. Our initial scores and final scores with the 7B model are, notably, close to DAPO (Yu et al., 2025) which leverages the larger Qwen 2.5 32B and trains for an order of magnitude more steps, see Figure 38 in Appendix A.6.4. This demonstrates how Olmo 3 RL-Zero can be a more efficient alternative to existing RLVR experiments.

**Olmo 3 RL-Zero 能强力提升推理** 如图 24, Base 在各域上借助我们的数据做 RL 时训练奖励可大幅上升. 为展示域外提升, 数学运行在去污染后的 AIME 2024/2025 上评测. 前几百步急剧提升, 之后缓慢但稳定. pass@32 也有不错提升, 说明保持多样性且 RLVR 把模型推过初始能力. 7B 的初分与终分值得注意地接近 DAPO (Yu et al., 2025)——后者用更大的 Qwen 2.5 32B 且步数高一个数量级, 见附录 A.6.4 Figure 38. 这说明 Olmo 3 RL-Zero 可作为既有 RLVR 实验的更高效替代.

**Olmo 3 RL-Zero mix can benchmark challenges in multi-objective RL** Most studies have focused exclusively on RLHF (Stiennon et al., 2020) or single-domain RLVR (Yu et al., 2025; Luo et al., 2025a). Our mix of math, code, instruction-following, and general chat is a more challenging RLVR benchmark for models. Figure 24 demonstrates that our general run has improved performance across different domains, but each domain is under-optimized compared to the single-domain setup. Future work can leverage this setup to investigate the interactions between domains in multi-objective RLVR.

**Olmo 3 RL-Zero mix 可基准多目标 RL 的挑战** 多数研究只聚焦 RLHF (Stiennon et al., 2020) 或单域 RLVR (Yu et al., 2025; Luo et al., 2025a). 我们的数学+代码+指令遵循+通用聊天混合是更难的 RLVR 基准. Figure 24 显示通用运行跨域都有提升, 但各域相对单域设定都欠优化. 未来工作可用该设定研究多目标 RLVR 中的域间交互.

**Olmo 3 RL-Zero can benchmark reasoning data mixes in midtraining** Midtraining and Olmo 3 RL-Zero offer a chance to ablate specific data sources, unlike the large-scale effort behind Olmo 3 Think. We leverage

**Olmo 3 RL-Zero 可基准 midtraining 推理数据混合** Midtraining 与 RL-Zero 提供消融特定数据源的机会, 不同于 Olmo 3 Think 的大规模努力. 我们借助

<!-- page 65 of 118 -->

![Chart block](images/p65-chart.png)

![Chart block](images/p65-figure-25-the-response-length-and-math-reward-over-rl.png)

Figure 25 The response length and math reward over RL training for two early midtrained base models. This demonstrates how base model midtraining can determine whether RL-Zero learns longer, more complex reasoning and increases response length.

图 25｜两个早期 midtrained Base 在 RL 训练中的响应长度与数学奖励. 说明 Base 的 midtraining 能否决定 RL-Zero 是否学到更长, 更复杂推理并加长响应.

![Chart block](images/p65-chart-2.png)

![Chart block](images/p65-figure-26-active-sampling-maintains-a-full-batch-of-non.png)

Figure 26 Active sampling maintains a full batch of non-zero-advantage samples by continuously pulling prompt–completion pairs from the result queue after filtering. We plot the percentage of the batch with non-zero advantage as well as the train loss for an RL-Zero Math run with and without active sampling.

图 26｜Active sampling 在过滤后持续从结果队列拉取提示–补全对, 以维持满 batch 的非零 advantage 样本. 画出有无 active sampling 的 RL-Zero Math 运行中非零 advantage batch 占比与训练损失.

RL-Zero to evaluate midtraining data mixes for their ability to develop downstream reasoning with RL. For example, we compare two early models in Figure 25. As evidenced by the stagnant response length, the model with insufficient reasoning data does not leverage backtracking, answer verification, and other cognitive skills (Gandhi et al., 2025). Olmo 3 RL-Zero can therefore serve as a testbed for downstream performance of alternative midtraining approaches and improvements over Dolma 3 Dolmino Mix.

RL-Zero 评估 midtraining 数据混合能否用 RL 发展出下游推理. 例如 Figure 25 比较两个早期模型. 响应长度停滞表明推理数据不足的模型未利用回溯, 答案验证等认知技能 (Gandhi et al., 2025). 因此 Olmo 3 RL-Zero 可作为替代 midtraining 路径相对 Dolma 3 Dolmino Mix 的下游表现试验床.

**Active sampling stabilizes training** Olmo 3 RL-Zero also offers a simpler testbed for ablating RL algorithm and infrastructure decisions. We ablate active sampling, our novel method for continuously resampling prompts after filtering for non-zero advantage (see Section §4.4.3 for details). Running on our math domain, Figure 26 shows that active sampling does indeed maintain a consistently full batch of completions with non-zero advantage. These consistent batch sizes have a stabilizing effect on training, and we see greatly reduced loss variance.

**Active sampling 稳定训练** Olmo 3 RL-Zero 也为消融 RL 算法与基础设施提供更简单试验床. 我们消融 active sampling: 过滤非零 advantage 后持续重采样提示的新方法 (细节见第 §4.4.3 节). 在数学域上, Figure 26 显示它确实维持稳定满 batch 的非零 advantage completion. 稳定 batch 规模稳定训练, 损失方差大幅降低.

**Eval decontamination is verified via spurious rewards** Recent RLVR benchmarks have shown substantial improvements from training with spurious rewards that are not correlated with model utility. This can suggest that the RLVR task may have been contaminated, i.e., the model was exposed to evaluation data during pretraining or midtraining. RLVR with a spurious reward can elicit this memorized knowledge, differentiating it from genuine learning of reasoning capabilities (Shao et al., 2025b). To verify that Olmo 3 RL-Zero evaluation is not contaminated, we conduct a negative control experiment by training Olmo 3 Base with spurious rewards. Specifically, we train on Dolci RL-Zero, but instead of rewarding correct answers, we assign random binary rewards to model generations independent of response quality following the protocol in Shao et al. (2025b). If our pretraining or midtraining data contained significant overlap with our evaluation sets, we would expect spurious reward training to elicit these memorized solutions and improve benchmark performance.

**用虚假奖励验证评测去污染** 近期 RLVR 基准显示用不相关虚假奖励训练也能大幅提升, 可能暗示任务被污染——模型在预训练或 midtraining 见过评测数据. 虚假奖励 RLVR 可引出记忆, 从而与真正学会推理区分 (Shao et al., 2025b). 为验证 Olmo 3 RL-Zero 评测未污染, 我们做负对照: 在 Dolci RL-Zero 上训 Olmo 3 Base, 但不奖励正确答案, 而按 Shao et al. (2025b) 给与回复质量无关的随机二值奖励. 若预训练/midtraining 与评测显著重叠, 虚假奖励训练应引出记忆解并抬基准.

As shown in Figure 27, training with random rewards does not improve performance on any of our benchmark

如图 27, 随机奖励训练在我们任一基准上都不提升表现

<!-- page 66 of 118 -->

![Chart block](images/p66-figure-27-rl-training-on-olmo-3-base-on-random-signal.png)

Figure 27 RL training on Olmo 3 Base on random, signal-free rewards produces no performance gains, suggesting successful decontamination of training data.

图 27｜在 Olmo 3 Base 上用随机, 无信号奖励做 RL 训练不产生表现增益, 提示训练数据去污染成功.

evaluations. Performance either remains flat with random fluctuations or degrades, which is consistent with the model learning arbitrary patterns unrelated to the task. This negative result is evidence that our data decontamination successfully removed overlaps between our base-model pipeline and RLVR evaluation data.

评测. 表现要么平坦带随机波动, 要么下降, 符合模型学到与任务无关的任意模式. 这一负结果是证据: 数据去污染成功去掉了 Base 流水与 RLVR 评测数据之间的重叠.

说明预训练或 midtraining 数据与评测集显著重叠, 虚假奖励只是把记忆解引出来. 实际按 Shao et al. (2025b) 协议给随机二值奖励后, 任一基准都没有提升, 表现平坦或下降, 报告据此认为去污染成功.

<!-- page 67 of 118 -->

## References

M. Abdin, J. Aneja, H. S. Behl, S. Bubeck, R. Eldan, S. Gunasekar, M. Harrison, R. J. Hewett, M. Javaheripi, P. Kauffmann, J. R. Lee, Y. T. Lee, Y. Li, W. Liu, C. C. T. Mendes, A. Nguyen, E. Price, G. de Rosa, O. Saarikivi, A. Salim, S. Shah, X. Wang, R. Ward, Y. Wu, D. Yu, C. Zhang, and Y. Zhang. Phi-4 technical report. arXiv preprint arXiv:2412.08905, 2024.

R. Ackerman and V. A. Thompson. Meta-reasoning: Monitoring and control of thinking and reasoning. Trends in Cognitive Sciences, 21(8):607–617, 2017. ISSN 1364-6613. doi: https://doi.org/10.1016/j.tics.2017.05.004. URL [https://www.sciencedirect.com/science/article/pii/S1364661317301055.](https://www.sciencedirect.com/science/article/pii/S1364661317301055)

B. Adler, N. Agarwal, A. Aithal, D. H. Anh, P. Bhattacharya, A. Brundyn, J. Casper, B. Catanzaro, S. Clay, J. Cohen, et al. Nemotron-4 340b technical report. arXiv preprint arXiv:2406.11704, 2024.

S. Agarwal, L. Ahmad, J. Ai, S. Altman, A. Applebaum, E. Arbus, R. K. Arora, Y. Bai, B. Baker, H. Bao, et al. gpt-oss-120b & gpt-oss-20b model card. arXiv preprint arXiv:2508.10925, 2025.

P. Aggarwal and S. Welleck. L1: Controlling how long a reasoning model thinks with reinforcement learning, 2025. URL [https://arxiv.org/abs/2503.04697](https://arxiv.org/abs/2503.04697).

W. U. Ahmad, S. Narenthiran, S. Majumdar, A. Ficek, S. Jain, J. Huang, V. Noroozi, and B. Ginsburg. Open-codereasoning: Advancing data distillation for competitive coding. arXiv preprint arXiv:2504.01943, 2025. URL [https://arxiv.org/abs/2504.01943](https://arxiv.org/abs/2504.01943).

J. Ainslie, J. Lee-Thorp, M. de Jong, Y. Zemlyanskiy, F. Lebrón, and S. Sanghai. Gqa: Training generalized multi-query transformer models from multi-head checkpoints, 2023. URL [https://arxiv.org/abs/2305.13245.](https://arxiv.org/abs/2305.13245)

S. N. Akter, S. Prabhumoye, J. Kamalu, S. Satheesh, E. Nyberg, M. Patwary, M. Shoeybi, and B. Catanzaro. Mind: Math informed synthetic dialogues for pretraining llms, 2024. URL [https://arxiv.org/abs/2410.12881.](https://arxiv.org/abs/2410.12881)

L. B. Allal, A. Lozhkov, E. Bakouch, G. M. Blázquez, G. Penedo, L. Tunstall, A. Marafioti, H. Kydlíček, A. P. Lajarín, V. Srivastav, J. Lochner, C. Fahlgren, X.-S. Nguyen, C. Fourrier, B. Burtenshaw, H. Larcher, H. Zhao, C. Zakka, M. Morlon, C. Raffel, L. von Werra, and T. Wolf. Smollm2: When smol goes big – data-centric training of a small language model, 2025. URL [https://arxiv.org/abs/2502.02737.](https://arxiv.org/abs/2502.02737)

C. An, Z. Xie, X. Li, L. Li, J. Zhang, S. Gong, M. Zhong, J. Xu, X. Qiu, M. Wang, and L. Kong. Polaris: A post-training recipe for scaling reinforcement learning on advanced reasoning models, 2025. URL [https://hkunlp.github.io/blog/2025/Polaris.](https://hkunlp.github.io/blog/2025/Polaris)

Anthropic. System card: Claude opus 4 & claude sonnet 4. Technical report, Anthropic, 2025. Accessed: 2025-10-07.

Apertus Team. Apertus: Democratizing Open and Compliant LLMs for Global Language Environments. [https://huggingface.co/swiss-ai/Apertus-70B-2509,](https://huggingface.co/swiss-ai/Apertus-70B-2509) 2025.

A. Asai, J. He, R. Shao, W. Shi, A. Singh, J. C. Chang, K. Lo, L. Soldaini, S. Feldman, M. D’Arcy, D. Wadden, M. Latzke, M. Tian, P. Ji, S. Liu, H. Tong, B. Wu, Y. Xiong, L. S. Zettlemoyer, G. Neubig, D. Weld, D. Downey, W. tau Yih, P. W. Koh, and H. Hajishirzi. Openscholar: Synthesizing scientific literature with retrieval-augmented lms. ArXiv, abs/2411.14199, 2024. URL [https://api.semanticscholar.org/CorpusID:274166189.](https://api.semanticscholar.org/CorpusID:274166189)

G. Attardi. Wikiextractor. [https://github.com/attardi/wikiextractor,](https://github.com/attardi/wikiextractor) 2015.

J. Austin, A. Odena, M. Nye, M. Bosma, H. Michalewski, D. Dohan, E. Jiang, C. Cai, M. Terry, Q. Le, et al. Program synthesis with large language models. arXiv preprint arXiv:2108.07732, 2021.

M. G. Azar, M. Rowland, B. Piot, D. Guo, D. Calandriello, M. Valko, and R. Munos. A general theoretical paradigm to understand learning from human preferences, 2023. URL [https://arxiv.org/abs/2310.12036.](https://arxiv.org/abs/2310.12036)

Z. Azerbayev, H. Schoelkopf, K. Paster, M. D. Santos, S. McAleer, A. Q. Jiang, J. Deng, S. Biderman, and S. Welleck. Llemma: An open language model for mathematics, 2023.

Y. Bai, X. Lv, J. Zhang, H. Lyu, J. Tang, Z. Huang, Z. Du, X. Liu, A. Zeng, L. Hou, Y. Dong, J. Tang, and J. Li. LongBench: A bilingual, multitask benchmark for long context understanding. In L.-W. Ku, A. Martins, and V. Srikumar, editors, Proceedings of the 62nd Annual Meeting of the Association for Computational Linguistics (Volume 1: Long Papers), pages 3119–3137, Bangkok, Thailand, Aug. 2024. Association for Computational Linguistics. doi: 10.18653/v1/2024.acl-long.172. URL [https://aclanthology.org/2024.acl-long.172/.](https://aclanthology.org/2024.acl-long.172/)

<!-- page 68 of 118 -->

Y. Bai, S. Tu, J. Zhang, H. Peng, X. Wang, X. Lv, S. Cao, J. Xu, L. Hou, Y. Dong, J. Tang, and J. Li. LongBench v2: Towards deeper understanding and reasoning on realistic long-context multitasks. In W. Che, J. Nabende, E. Shutova, and M. T. Pilehvar, editors, Proceedings of the 63rd Annual Meeting of the Association for Computational Linguistics (Volume 1: Long Papers), pages 3639–3664, Vienna, Austria, July 2025. Association for Computational Linguistics. ISBN 979-8-89176-251-0. doi: 10.18653/v1/2025.acl-long.183. URL [https://aclanthology.org/2025.acl-long.183/](https://aclanthology.org/2025.acl-long.183/).

E. Bakouch, L. Ben Allal, A. Lozhkov, N. Tazi, L. Tunstall, C. M. Patiño, E. Beeching, A. Roucher, A. J. Reedi, Q. Gallouédec, K. Rasul, N. Habib, C. Fourrier, H. Kydlicek, G. Penedo, H. Larcher, M. Morlon, V. Srivastav, J. Lochner, X.-S. Nguyen, C. Raffel, L. von Werra, and T. Wolf. SmolLM3: smol, multilingual, long-context reasoner. [https://huggingface.co/blog/smollm3,](https://huggingface.co/blog/smollm3) 2025.

M. Bavarian, H. Jun, N. Tezak, J. Schulman, C. McLeavey, J. Tworek, and M. Chen. Efficient training of language models to fill in the middle. arXiv preprint arXiv:2207.14255, 2022.

I. Beltagy, M. E. Peters, and A. Cohan. Longformer: The long-document transformer. arXiv preprint arXiv:2004.05150, 2020.

A. Bercovich, I. Levy, I. Golan, M. Dabbah, R. El-Yaniv, O. Puny, I. Galil, Z. Moshe, T. Ronen, N. Nabwani, I. Shahaf, O. Tropp, E. Karpas, R. Zilberstein, J. Zeng, S. Singhal, A. Bukharin, Y. Zhang, T. Konuk, G. Shen, A. S. Mahabaleshwarkar, B. Kartal, Y. Suhara, O. Delalleau, Z. Chen, Z. Wang, D. Mosallanezhad, A. Renduchintala, H. Qian, D. Rekesh, F. Jia, S. Majumdar, V. Noroozi, W. U. Ahmad, S. Narenthiran, A. Ficek, M. Samadi, J. Huang, S. Jain, I. Gitman, I. Moshkov, W. Du, S. Toshniwal, G. Armstrong, B. Kisacanin, M. Novikov, D. Gitman, E. Bakhturina, J. P. Scowcroft, J. Kamalu, D. Su, K. Kong, M. Kliegl, R. Karimi, Y. Lin, S. Satheesh, J. Parmar, P. Gundecha, B. Norick, J. Jennings, S. Prabhumoye, S. N. Akter, M. Patwary, A. Khattar, D. Narayanan, R. Waleffe, J. Zhang, B.-Y. Su, G. Huang, T. Kong, P. Chadha, S. Jain, C. Harvey, E. Segal, J. Huang, S. Kashirsky, R. McQueen, I. Putterman, G. Lam, A. Venkatesan, S. Wu, V. Nguyen, M. Kilaru, A. Wang, A. Warno, A. Somasamudramath, S. Bhaskar, M. Dong, N. Assaf, S. Mor, O. U. Argov, S. Junkin, O. Romanenko, P. Larroy, M. Katariya, M. Rovinelli, V. Balas, N. Edelman, A. Bhiwandiwalla, M. Subramaniam, S. Ithape, K. Ramamoorthy, Y. Wu, S. V. Velury, O. Almog, J. Daw, D. Fridman, E. Galinkin, M. Evans, K. Luna, L. Derczynski, N. Pope, E. Long, S. Schneider, G. Siman, T. Grzegorzek, P. Ribalta, M. Katariya, J. Conway, T. Saar, A. Guan, K. Pawelec, S. Prayaga, O. Kuchaiev, B. Ginsburg, O. Olabiyi, K. Briski, J. Cohen, B. Catanzaro, J. Alben, Y. Geifman, E. Chung, and C. Alexiuk. Llama-nemotron: Efficient reasoning models, 2025. URL [https://arxiv.org/abs/2505.00949.](https://arxiv.org/abs/2505.00949)

A. Bertsch, L. Soldaini, M. Gormley, G. Neubig, H. Hajishirzi, K. Lo, and D. Groeneveld. Cracks in the foundation: Architectural choices impact long context extension, 2026.

J. Bevendorff, B. Stein, M. Hagen, and M. Potthast. Elastic ChatNoir: Search Engine for the ClueWeb and the Common Crawl. In L. Azzopardi, A. Hanbury, G. Pasi, and B. Piwowarski, editors, Advances in Information Retrieval. 40th European Conference on IR Research (ECIR 2018), Lecture Notes in Computer Science, Berlin Heidelberg New York, Mar. 2018. Springer.

A. Bhagia, J. Liu, A. Wettig, D. Heineman, O. Tafjord, A. H. Jha, L. Soldaini, N. A. Smith, D. Groeneveld, P. W. Koh, J. Dodge, and H. Hajishirzi. Establishing task scaling laws via compute-efficient model ladders, 2024. URL [https://arxiv.org/abs/2412.04403](https://arxiv.org/abs/2412.04403).

Y. Bisk, R. Zellers, R. Le bras, J. Gao, and Y. Choi. PIQA: Reasoning about physical commonsense in natural language. Proceedings of the AAAI Conference on Artificial Intelligence, 34(05):7432–7439, Apr. 2020. doi: 10.1609/aaai.v34i05.6239. URL [https://ojs.aaai.org/index.php/AAAI/article/view/6239.](https://ojs.aaai.org/index.php/AAAI/article/view/6239)

S. Bordt, S. Srinivas, V. Boreiko, and U. von Luxburg. How much can we forget about data contamination? ArXiv, abs/2410.03249, 2024. URL [https://api.semanticscholar.org/CorpusID:273163321.](https://api.semanticscholar.org/CorpusID:273163321)

J. Bragg, M. D’Arcy, N. Balepur, D. Bareket, B. Dalvi, S. Feldman, D. Haddad, J. D. Hwang, P. Jansen, V. Kishore, et al. Astabench: Rigorous benchmarking of ai agents with a scientific research suite. arXiv preprint arXiv:2510.21652, 2025.

F. Brahman, S. Kumar, V. Balachandran, P. Dasigi, V. Pyatkin, A. Ravichander, S. Wiegreffe, N. Dziri, K. Chandu, J. Hessel, et al. The art of saying no: Contextual noncompliance in language models. arXiv preprint arXiv:2407.12043, 2024.

Z. Cai, S. Shabihi, B. An, Z. Che, B. R. Bartoldson, B. Kailkhura, T. Goldstein, and F. Huang. Aegisllm: Scaling agentic systems for self-reflective defense in llm security. arXiv preprint arXiv:2504.20965, 2025. Preprint.

<!-- page 69 of 118 -->

F. Callaway, B. {van Opheusden}, S. Gul, P. Das, P. Krueger, T. Griffiths, and F. Lieder. Rational use of cognitive resources in human planning. Nature Human Behaviour, 6(8):1112–1125, Aug. 2022. ISSN 2397-3374. doi: 10.1038/s41562-022-01332-8. Publisher Copyright: © 2022, The Author(s), under exclusive licence to Springer Nature Limited.

F. Cassano, J. Gouwar, D. Nguyen, S. Nguyen, L. Phipps-Costin, D. Pinckney, M.-H. Yee, Y. Zi, C. J. Anderson, M. Q. Feldman, et al. Multipl-e: A scalable and extensible approach to benchmarking neural code generation. arXiv preprint arXiv:2208.08227, 2022.

A. Chatterji, T. Cunningham, D. Deming, Z. Hitzig, C. Ong, C. Y. Shan, and K. Wadman. How people use ChatGPT. Technical Report w34255, National Bureau of Economic Research, Cambridge, MA, Sept. 2025.

M. Chen, J. Tworek, H. Jun, Q. Yuan, H. P. de Oliveira Pinto, J. Kaplan, H. Edwards, Y. Burda, N. Joseph, G. Brockman, A. Ray, R. Puri, G. Krueger, M. Petrov, H. Khlaaf, G. Sastry, P. Mishkin, B. Chan, S. Gray, N. Ryder, M. Pavlov, A. Power, L. Kaiser, M. Bavarian, C. Winter, P. Tillet, F. P. Such, D. Cummings, M. Plappert, F. Chantzis, E. Barnes, A. Herbert-Voss, W. H. Guss, A. Nichol, A. Paino, N. Tezak, J. Tang, I. Babuschkin, S. Balaji, S. Jain, W. Saunders, C. Hesse, A. N. Carr, J. Leike, J. Achiam, V. Misra, E. Morikawa, A. Radford, M. Knight, M. Brundage, M. Murati, K. Mayer, P. Welinder, B. McGrew, D. Amodei, S. McCandlish, I. Sutskever, and W. Zaremba. Evaluating large language models trained on code. 2021.

M. F. Chen, T. Murray, D. Heineman, M. Jordan, H. Hajishirzi, C. Ré, L. Soldaini, and K. Lo. Olmix: Efficient mixture recomputation for evolving lm datasets, 2026.

S. Chen, S. Wong, L. Chen, and Y. Tian. Extending context window of large language models via positional interpolation, 2023. URL [https://arxiv.org/abs/2306.15595.](https://arxiv.org/abs/2306.15595)

Y. Chen, Z. Yang, Z. Liu, C. Lee, P. Xu, M. Shoeybi, B. Catanzaro, and W. Ping. Acereason-nemotron: Advancing math and code reasoning through reinforcement learning. arXiv preprint arXiv:2505.16400, 2025.

Z. Cheng, S. Hao, T. Liu, F. Zhou, Y. Xie, F. Yao, Y. Bian, Y. Zhuang, N. Dey, Y. Zha, Y. Gu, K. Zhou, Y. Wang, Y. Li, R. Fan, J. She, C. Gao, A. Saparov, H. Li, T. W. Killian, M. Yurochkin, Z. Liu, E. P. Xing, and Z. Hu. Revisiting reinforcement learning for llm reasoning from a cross-domain perspective, 2025. URL [https://arxiv.org/abs/2506.14965](https://arxiv.org/abs/2506.14965).

W. Chu, X. Xie, J. Yu, J. Wang, A. Phanishayee, C. Tang, Y. Hao, J. Huang, M. Ozdal, J. Wang, V. Goswami, N. Goyal, A. Kadian, A. Gu, C. Cai, F. Tian, X. Wang, M. Si, P. Balaji, C.-H. Chu, and J. Park. Scaling llama 3 training with efficient parallelism strategies. In Proceedings of the 52nd Annual International Symposium on Computer Architecture, ISCA ’25, page 1703–1716, New York, NY, USA, 2025. Association for Computing Machinery. ISBN 9798400712616. doi: 10.1145/3695053.3731410. URL [https://doi.org/10.1145/3695053.3731410.](https://doi.org/10.1145/3695053.3731410)

C. Clark, K. Lee, M.-W. Chang, T. Kwiatkowski, M. Collins, and K. Toutanova. BoolQ: Exploring the surprising difficulty of natural yes/no questions. In J. Burstein, C. Doran, and T. Solorio, editors, Proceedings of the 2019 Conference of the North American Chapter of the Association for Computational Linguistics: Human Language Technologies, Volume 1 (Long and Short Papers), pages 2924–2936, Minneapolis, Minnesota, June 2019. Association for Computational Linguistics. doi: 10.18653/v1/N19-1300. URL [https://aclanthology.org/N19-1300.](https://aclanthology.org/N19-1300)

P. Clark, I. Cowhey, O. Etzioni, T. Khot, A. Sabharwal, C. Schoenick, and O. Tafjord. Think you have solved question answering? Try ARC, the AI2 reasoning challenge. CoRR, arXiv:1803.05457, 2018.

K. Cobbe, V. Kosaraju, M. Bavarian, M. Chen, H. Jun, L. Kaiser, M. Plappert, J. Tworek, J. Hilton, R. Nakano, C. Hesse, and J. Schulman. Training verifiers to solve math word problems. arXiv preprint arXiv:2110.14168, 2021.

Common Crawl Foundation. Common Crawl Dataset. [https://commoncrawl.org/.](https://commoncrawl.org/) Accessed: December 31, 2024.

G. Cui, L. Yuan, N. Ding, G. Yao, W. Zhu, Y. Ni, G. Xie, Z. Liu, and M. Sun. UltraFeedback: Boosting language models with scaled ai feedback. arXiv preprint arXiv:2310.01377, 2023.

T. Dao. FlashAttention-2: Faster attention with better parallelism and work partitioning. In International Conference on Learning Representations (ICLR), 2024.

P. Dasigi, K. Lo, I. Beltagy, A. Cohan, N. A. Smith, and M. Gardner. A dataset of information-seeking questions and answers anchored in research papers. arXiv preprint arXiv:2105.03011, 2021.

DeepSeek-AI. DeepSeek-V3.1 release. [https://api-docs.deepseek.com/news/news250821](https://api-docs.deepseek.com/news/news250821), 2025. Accessed: 2025-11-10.

<!-- page 70 of 118 -->

DeepSeek-AI, A. Liu, B. Feng, B. Xue, B. Wang, B. Wu, C. Lu, C. Zhao, C. Deng, C. Zhang, C. Ruan, D. Dai, D. Guo, D. Yang, D. Chen, D. Ji, E. Li, F. Lin, F. Dai, F. Luo, G. Hao, G. Chen, G. Li, H. Zhang, H. Bao, H. Xu, H. Wang, H. Zhang, H. Ding, H. Xin, H. Gao, H. Li, H. Qu, J. L. Cai, J. Liang, J. Guo, J. Ni, J. Li, J. Wang, J. Chen, J. Chen, J. Yuan, J. Qiu, J. Li, J. Song, K. Dong, K. Hu, K. Gao, K. Guan, K. Huang, K. Yu, L. Wang, L. Zhang, L. Xu, L. Xia, L. Zhao, L. Wang, L. Zhang, M. Li, M. Wang, M. Zhang, M. Zhang, M. Tang, M. Li, N. Tian, P. Huang, P. Wang, P. Zhang, Q. Wang, Q. Zhu, Q. Chen, Q. Du, R. J. Chen, R. L. Jin, R. Ge, R. Zhang, R. Pan, R. Wang, R. Xu, R. Zhang, R. Chen, S. S. Li, S. Lu, S. Zhou, S. Chen, S. Wu, S. Ye, S. Ye, S. Ma, S. Wang, S. Zhou, S. Yu, S. Zhou, S. Pan, T. Wang, T. Yun, T. Pei, T. Sun, W. L. Xiao, W. Zeng, W. Zhao, W. An, W. Liu, W. Liang, W. Gao, W. Yu, W. Zhang, X. Q. Li, X. Jin, X. Wang, X. Bi, X. Liu, X. Wang, X. Shen, X. Chen, X. Zhang, X. Chen, X. Nie, X. Sun, X. Wang, X. Cheng, X. Liu, X. Xie, X. Liu, X. Yu, X. Song, X. Shan, X. Zhou, X. Yang, X. Li, X. Su, X. Lin, Y. K. Li, Y. Q. Wang, Y. X. Wei, Y. X. Zhu, Y. Zhang, Y. Xu, Y. Xu, Y. Huang, Y. Li, Y. Zhao, Y. Sun, Y. Li, Y. Wang, Y. Yu, Y. Zheng, Y. Zhang, Y. Shi, Y. Xiong, Y. He, Y. Tang, Y. Piao, Y. Wang, Y. Tan, Y. Ma, Y. Liu, Y. Guo, Y. Wu, Y. Ou, Y. Zhu, Y. Wang, Y. Gong, Y. Zou, Y. He, Y. Zha, Y. Xiong, Y. Ma, Y. Yan, Y. Luo, Y. You, Y. Liu, Y. Zhou, Z. F. Wu, Z. Z. Ren, Z. Ren, Z. Sha, Z. Fu, Z. Xu, Z. Huang, Z. Zhang, Z. Xie, Z. Zhang, Z. Hao, Z. Gou, Z. Ma, Z. Yan, Z. Shao, Z. Xu, Z. Wu, Z. Zhang, Z. Li, Z. Gu, Z. Zhu, Z. Liu, Z. Li, Z. Xie, Z. Song, Z. Gao, and Z. Pan. Deepseek-v3 technical report, 2025. URL [https://arxiv.org/abs/2412.19437.](https://arxiv.org/abs/2412.19437)

S. Diao, Y. Yang, Y. Fu, X. Dong, D. Su, M. Kliegl, Z. Chen, P. Belcak, Y. Suhara, H. Yin, M. Patwary, Yingyan, Lin, J. Kautz, and P. Molchanov. Climb: Clustering-based iterative data mixture bootstrapping for language model pre-training, 2025. URL [https://arxiv.org/abs/2504.13161.](https://arxiv.org/abs/2504.13161)

H. Ding, Z. Wang, G. Paolini, V. Kumar, A. Deoras, D. Roth, and S. Soatto. Fewer truncations improve language modeling, 2024. URL [https://arxiv.org/abs/2404.10830.](https://arxiv.org/abs/2404.10830)

N. Ding, Y. Chen, B. Xu, Y. Qin, S. Hu, Z. Liu, M. Sun, and B. Zhou. Enhancing chat language models by scaling high-quality instructional conversations. In Proceedings of the 2023 Conference on Empirical Methods in Natural Language Processing, pages 3029–3051, 2023.

K. D’Oosterlinck, W. Xu, C. Develder, T. Demeester, A. Singh, C. Potts, D. Kiela, and S. Mehri. Anchored preference optimization and contrastive revisions: Addressing underspecification in alignment. Transactions of the Association for Computational Linguistics, 13:442–460, 2025.

D. Dua, Y. Wang, P. Dasigi, G. Stanovsky, S. Singh, and M. Gardner. DROP: A reading comprehension benchmark requiring discrete reasoning over paragraphs. In J. Burstein, C. Doran, and T. Solorio, editors, Proceedings of the 2019 Conference of the North American Chapter of the Association for Computational Linguistics: Human Language Technologies, Volume 1 (Long and Short Papers), pages 2368–2378, Minneapolis, Minnesota, June 2019. Association for Computational Linguistics. doi: 10.18653/v1/N19-1246. URL [https://aclanthology.org/N19-1246.](https://aclanthology.org/N19-1246)

Y. Dubois, B. Galambosi, P. Liang, and T. B. Hashimoto. Length-controlled alpacaeval: A simple way to debias automatic evaluators. arXiv preprint arXiv:2404.04475, 2024.

A. Fan, Y. Jernite, E. Perez, D. Grangier, J. Weston, and M. Auli. Eli5: Long form question answering. In Proceedings of the 57th Annual Meeting of the Association for Computational Linguistics, pages 3558–3567, 2019.

A. Fang, H. Pouransari, M. Jordan, A. Toshev, V. Shankar, L. Schmidt, and T. Gunter. Datasets, documents, and repetitions: The practicalities of unequal data quality, 2025a. URL [https://arxiv.org/abs/2503.07879.](https://arxiv.org/abs/2503.07879)

L. Fang, Y. Wang, Z. Liu, C. Zhang, S. Jegelka, J. Gao, B. Ding, and Y. Wang. What is wrong with perplexity for long-context language modeling?, 2025b. URL [https://arxiv.org/abs/2410.23771.](https://arxiv.org/abs/2410.23771)

S. Fleming and N. Daw. Self-evaluation of decision-making: A general bayesian framework for metacognitive computation. Psychological Review, 124(1):91–114, 2017. doi: 10.1037/rev0000045.

K. Fujii, Y. Tajima, S. Mizuki, H. Shimada, T. Shiotani, K. Saito, M. Ohi, M. Kawamura, T. Nakamura, T. Okamoto, et al. Rewriting pre-training data boosts llm performance in math and code. arXiv preprint arXiv:2505.02881, 2025.

K. Gandhi, A. Chakravarthy, A. Singh, N. Lile, and N. D. Goodman. Cognitive behaviors that enable self-improving reasoners, or, four habits of highly effective stars. arXiv preprint arXiv:2503.01307, 2025.

L. Gao, S. Biderman, S. Black, L. Golding, T. Hoppe, C. Foster, J. Phang, H. He, A. Thite, N. Nabeshima, et al. The pile: An 800gb dataset of diverse text for language modeling. arXiv preprint arXiv:2101.00027, 2020.

T. Gao, A. Wettig, H. Yen, and D. Chen. How to train long-context language models (effectively). In ACL, 2025.

Gemma 3 Team. Gemma 3 technical report, 2025. URL [https://arxiv.org/abs/2503.19786.](https://arxiv.org/abs/2503.19786)

<!-- page 71 of 118 -->

Gemma Team, T. Mesnard, C. Hardin, R. Dadashi, S. Bhupatiraju, S. Pathak, L. Sifre, M. Rivière, M. S. Kale, J. Love, et al. Gemma: Open models based on gemini research and technology. arXiv preprint arXiv:2403.08295, 2024.

S. Geng, H. Ivison, C.-L. Li, M. Sap, J. Li, R. Krishna, and P. W. Koh. The delta learning hypothesis: Preference tuning on weak data can yield strong gains. arXiv preprint arXiv:2507.06187, 2025.

GLM-4.5 Team, A. Zeng, X. Lv, Q. Zheng, Z. Hou, B. Chen, C. Xie, C. Wang, D. Yin, H. Zeng, J. Zhang, K. Wang, L. Zhong, M. Liu, R. Lu, S. Cao, X. Zhang, X. Huang, Y. Wei, Y. Cheng, Y. An, Y. Niu, Y. Wen, Y. Bai, Z. Du, Z. Wang, Z. Zhu, B. Zhang, B. Wen, B. Wu, B. Xu, C. Huang, C. Zhao, C. Cai, C. Yu, C. Li, C. Ge, C. Huang, C. Zhang, C. Xu, C. Zhu, C. Li, C. Yin, D. Lin, D. Yang, D. Jiang, D. Ai, E. Zhu, F. Wang, G. Pan, G. Wang, H. Sun, H. Li, H. Li, H. Hu, H. Zhang, H. Peng, H. Tai, H. Zhang, H. Wang, H. Yang, H. Liu, H. Zhao, H. Liu, H. Yan, H. Liu, H. Chen, J. Li, J. Zhao, J. Ren, J. Jiao, J. Zhao, J. Yan, J. Wang, J. Gui, J. Zhao, J. Liu, J. Li, J. Li, J. Lu, J. Wang, J. Yuan, J. Li, J. Du, J. Du, J. Liu, J. Zhi, J. Gao, K. Wang, L. Yang, L. Xu, L. Fan, L. Wu, L. Ding, L. Wang, M. Zhang, M. Li, M. Xu, M. Zhao, M. Zhai, P. Du, Q. Dong, S. Lei, S. Tu, S. Yang, S. Lu, S. Li, S. Li, Shuang-Li, S. Yang, S. Yi, T. Yu, W. Tian, W. Wang, W. Yu, W. L. Tam, W. Liang, W. Liu, X. Wang, X. Jia, X. Gu, X. Ling, X. Wang, X. Fan, X. Pan, X. Zhang, X. Zhang, X. Fu, X. Zhang, Y. Xu, Y. Wu, Y. Lu, Y. Wang, Y. Zhou, Y. Pan, Y. Zhang, Y. Wang, Y. Li, Y. Su, Y. Geng, Y. Zhu, Y. Yang, Y. Li, Y. Wu, Y. Li, Y. Liu, Y. Wang, Y. Li, Y. Zhang, Z. Liu, Z. Yang, Z. Zhou, Z. Qiao, Z. Feng, Z. Liu, Z. Zhang, Z. Wang, Z. Yao, Z. Wang, Z. Liu, Z. Chai, Z. Li, Z. Zhao, W. Chen, J. Zhai, B. Xu, M. Huang, H. Wang, J. Li, Y. Dong, and J. Tang. GLM-4.5: Agentic, Reasoning, and Coding (ARC) Foundation Models, 2025. URL [https://arxiv.org/abs/2508.06471.](https://arxiv.org/abs/2508.06471)

C. Goddard. Extending AFM-4.5B to 64K context length. [https://www.arcee.ai/blog/extending-afm-4-5b-to-64k-context-length,](https://www.arcee.ai/blog/extending-afm-4-5b-to-64k-context-length) June 2025. Accessed: 2025-11-10.

C. Goddard, S. Siriwardhana, M. Ehghaghi, L. Meyers, V. Karpukhin, B. Benedict, M. McQuade, and J. Solawetz. Arcee’s MergeKit: A toolkit for merging large language models. In F. Dernoncourt, D. Preoţiuc-Pietro, and A. Shimorina, editors, Proceedings of the 2024 Conference on Empirical Methods in Natural Language Processing: Industry Track, pages 477–485, Miami, Florida, US, Nov. 2024. Association for Computational Linguistics. doi: 10.18653/v1/2024.emnlp-industry.36. URL [https://aclanthology.org/2024.emnlp-industry.36.](https://aclanthology.org/2024.emnlp-industry.36)

N. Godey, W. Antoun, R. Touchent, R. Bawden, Éric de la Clergerie, B. Sagot, and D. Seddah. Gaperon: A peppered english-french generative language model suite, 2025. URL [https://arxiv.org/abs/2510.25771.](https://arxiv.org/abs/2510.25771)

A. Grattafiori, A. Dubey, A. Jauhri, A. Pandey, A. Kadian, A. Al-Dahle, A. Letman, A. Mathurx, A. Schelten, A. Vaughan, A. Yang, A. Fan, A. Goyal, A. Hartshorn, A. Yang, A. Mitra, A. Sravankumar, A. Korenev, A. Hinsvark, A. Rao, A. Zhang, A. Rodriguez, A. Gregerson, A. Spataru, B. Roziere, B. Biron, B. Tang, B. Chern, C. Caucheteux, C. Nayak, C. Bi, C. Marra, C. McConnell, C. Keller, C. Touret, C. Wu, C. Wong, C. C. Ferrer, C. Nikolaidis, D. Allonsius, D. Song, D. Pintz, D. Livshits, D. Wyatt, D. Esiobu, D. Choudhary, D. Mahajan, D. Garcia-Olano, D. Perino, D. Hupkes, E. Lakomkin, E. AlBadawy, E. Lobanova, E. Dinan, E. M. Smith, F. Radenovic, F. Guzmán, F. Zhang, G. Synnaeve, G. Lee, G. L. Anderson, G. Thattai, G. Nail, G. Mialon, G. Pang, G. Cucurell, H. Nguyen, H. Korevaar, H. Xu, H. Touvron, I. Zarov, I. A. Ibarra, I. Kloumann, I. Misra, I. Evtimov, J. Zhang, J. Copet, J. Lee, J. Geffert, J. Vranes, J. Park, J. Mahadeokar, J. Shah, J. van der Linde, J. Billock, J. Hong, J. Lee, J. Fu, J. Chi, J. Huang, J. Liu, J. Wang, J. Yu, J. Bitton, J. Spisak, J. Park, J. Rocca, J. Johnstun, J. Saxe, J. Jia, K. V. Alwala, K. Prasad, K. Upasani, K. Plawiak, K. Li, K. Heafield, K. Stone, K. El-Arini, K. Iyer, K. Malik, K. Chiu, K. Bhalla, K. Lakhotia, L. Rantala-Yeary, L. van der Maaten, L. Chen, L. Tan, L. Jenkins, L. Martin, L. Madaan, L. Malo, L. Blecher, L. Landzaat, L. de Oliveira, M. Muzzi, M. Pasupuleti, M. Singh, M. Paluri, M. Kardas, M. Tsimpoukelli, M. Oldham, M. Rita, M. Pavlova, M. Kambadur, M. Lewis, M. Si, M. K. Singh, M. Hassan, N. Goyal, N. Torabi, N. Bashlykov, N. Bogoychev, N. Chatterji, N. Zhang, O. Duchenne, O. Çelebi, P. Alrassy, P. Zhang, P. Li, P. Vasic, P. Weng, P. Bhargava, P. Dubal, P. Krishnan, P. S. Koura, P. Xu, Q. He, Q. Dong, R. Srinivasan, R. Ganapathy, R. Calderer, R. S. Cabral, R. Stojnic, R. Raileanu, R. Maheswari, R. Girdhar, R. Patel, R. Sauvestre, R. Polidoro, R. Sumbaly, R. Taylor, R. Silva, R. Hou, R. Wang, S. Hosseini, S. Chennabasappa, S. Singh, S. Bell, S. S. Kim, S. Edunov, S. Nie, S. Narang, S. Raparthy, S. Shen, S. Wan, S. Bhosale, S. Zhang, S. Vandenhende, S. Batra, S. Whitman, S. Sootla, S. Collot, S. Gururangan, S. Borodinsky, T. Herman, T. Fowler, T. Sheasha, T. Georgiou, T. Scialom, T. Speckbacher, T. Mihaylov, T. Xiao, U. Karn, V. Goswami, V. Gupta, V. Ramanathan, V. Kerkez, V. Gonguet, V. Do, V. Vogeti, V. Albiero, V. Petrovic, W. Chu, W. Xiong, W. Fu, W. Meers, X. Martinet, X. Wang, X. Wang, X. E. Tan, X. Xia, X. Xie, X. Jia, X. Wang, Y. Goldschlag, Y. Gaur, Y. Babaei, Y. Wen, Y. Song, Y. Zhang, Y. Li, Y. Mao, Z. D. Coudert, Z. Yan, Z. Chen, Z. Papakipos, A. Singh, A. Srivastava, A. Jain, A. Kelsey, A. Shajnfeld, A. Gangidi, A. Victoria, A. Goldstand, A. Menon, A. Sharma, A. Boesenberg, A. Baevski, A. Feinstein, A. Kallet, A. Sangani, A. Teo, A. Yunus, A. Lupu, A. Alvarado, A. Caples, A. Gu, A. Ho, A. Poulton, A. Ryan, A. Ramchandani, A. Dong, A. Franco, A. Goyal, A. Saraf, A. Chowdhury, A. Gabriel, A. Bharambe, A. Eisenman, A. Yazdan, B. James, B. Maurer, B. Leonhardi, B. Huang, B. Loyd, B. D. Paola, B. Paranjape, B. Liu, B. Wu, B. Ni, B. Hancock, B. Wasti, B. Spence, B. Stojkovic, B. Gamido,

<!-- page 72 of 118 -->

B. Montalvo, C. Parker, C. Burton, C. Mejia, C. Liu, C. Wang, C. Kim, C. Zhou, C. Hu, C.-H. Chu, C. Cai, C. Tindal, C. Feichtenhofer, C. Gao, D. Civin, D. Beaty, D. Kreymer, D. Li, D. Adkins, D. Xu, D. Testuggine, D. David, D. Parikh, D. Liskovich, D. Foss, D. Wang, D. Le, D. Holland, E. Dowling, E. Jamil, E. Montgomery, E. Presani, E. Hahn, E. Wood, E.-T. Le, E. Brinkman, E. Arcaute, E. Dunbar, E. Smothers, F. Sun, F. Kreuk, F. Tian, F. Kokkinos, F. Ozgenel, F. Caggioni, F. Kanayet, F. Seide, G. M. Florez, G. Schwarz, G. Badeer, G. Swee, G. Halpern, G. Herman, G. Sizov, Guangyi, Zhang, G. Lakshminarayanan, H. Inan, H. Shojanazeri, H. Zou, H. Wang, H. Zha, H. Habeeb, H. Rudolph, H. Suk, H. Aspegren, H. Goldman, H. Zhan, I. Damlaj, I. Molybog, I. Tufanov, I. Leontiadis, I.-E. Veliche, I. Gat, J. Weissman, J. Geboski, J. Kohli, J. Lam, J. Asher, J.-B. Gaya, J. Marcus, J. Tang, J. Chan, J. Zhen, J. Reizenstein, J. Teboul, J. Zhong, J. Jin, J. Yang, J. Cummings, J. Carvill, J. Shepard, J. McPhie, J. Torres, J. Ginsburg, J. Wang, K. Wu, K. H. U, K. Saxena, K. Khandelwal, K. Zand, K. Matosich, K. Veeraraghavan, K. Michelena, K. Li, K. Jagadeesh, K. Huang, K. Chawla, K. Huang, L. Chen, L. Garg, L. A, L. Silva, L. Bell, L. Zhang, L. Guo, L. Yu, L. Moshkovich, L. Wehrstedt, M. Khabsa, M. Avalani, M. Bhatt, M. Mankus, M. Hasson, M. Lennie, M. Reso, M. Groshev, M. Naumov, M. Lathi, M. Keneally, M. Liu, M. L. Seltzer, M. Valko, M. Restrepo, M. Patel, M. Vyatskov, M. Samvelyan, M. Clark, M. Macey, M. Wang, M. J. Hermoso, M. Metanat, M. Rastegari, M. Bansal, N. Santhanam, N. Parks, N. White, N. Bawa, N. Singhal, N. Egebo, N. Usunier, N. Mehta, N. P. Laptev, N. Dong, N. Cheng, O. Chernoguz, O. Hart, O. Salpekar, O. Kalinli, P. Kent, P. Parekh, P. Saab, P. Balaji, P. Rittner, P. Bontrager, P. Roux, P. Dollar, P. Zvyagina, P. Ratanchandani, P. Yuvraj, Q. Liang, R. Alao, R. Rodriguez, R. Ayub, R. Murthy, R. Nayani, R. Mitra, R. Parthasarathy, R. Li, R. Hogan, R. Battey, R. Wang, R. Howes, R. Rinott, S. Mehta, S. Siby, S. J. Bondu, S. Datta, S. Chugh, S. Hunt, S. Dhillon, S. Sidorov, S. Pan, S. Mahajan, S. Verma, S. Yamamoto, S. Ramaswamy, S. Lindsay, S. Lindsay, S. Feng, S. Lin, S. C. Zha, S. Patil, S. Shankar, S. Zhang, S. Zhang, S. Wang, S. Agarwal, S. Sajuyigbe, S. Chintala, S. Max, S. Chen, S. Kehoe, S. Satterfield, S. Govindaprasad, S. Gupta, S. Deng, S. Cho, S. Virk, S. Subramanian, S. Choudhury, S. Goldman, T. Remez, T. Glaser, T. Best, T. Koehler, T. Robinson, T. Li, T. Zhang, T. Matthews, T. Chou, T. Shaked, V. Vontimitta, V. Ajayi, V. Montanez, V. Mohan, V. S. Kumar, V. Mangla, V. Ionescu, V. Poenaru, V. T. Mihailescu, V. Ivanov, W. Li, W. Wang, W. Jiang, W. Bouaziz, W. Constable, X. Tang, X. Wu, X. Wang, X. Wu, X. Gao, Y. Kleinman, Y. Chen, Y. Hu, Y. Jia, Y. Qi, Y. Li, Y. Zhang, Y. Zhang, Y. Adi, Y. Nam, Yu, Wang, Y. Zhao, Y. Hao, Y. Qian, Y. Li, Y. He, Z. Rait, Z. DeVito, Z. Rosnbrick, Z. Wen, Z. Yang, Z. Zhao, and Z. Ma. The llama 3 herd of models, 2024. URL [https://arxiv.org/abs/2407.21783.](https://arxiv.org/abs/2407.21783)

T. L. Griffiths, F. Callaway, M. B. Chang, E. Grant, P. M. Krueger, and F. Lieder. Doing more with less: meta-reasoning and meta-learning in humans and machines. Current Opinion in Behavioral Sciences, 29:24–30, 2019. ISSN 2352-1546. doi: https://doi.org/10.1016/j.cobeha.2019.01.005. URL [https://www.sciencedirect.com/science/article/pii/S2352154618302122](https://www.sciencedirect.com/science/article/pii/S2352154618302122). Artificial Intelligence.

A. Gu, B. Rozière, H. Leather, A. Solar-Lezama, G. Synnaeve, and S. I. Wang. Cruxeval: A benchmark for code reasoning, understanding and execution. arXiv preprint arXiv:2401.03065, 2024a.

Y. Gu, O. Tafjord, B. Kuehl, D. Haddad, J. Dodge, and H. Hajishirzi. Olmes: A standard for language model evaluations. ArXiv, abs/2406.08446, 2024b. URL [https://api.semanticscholar.org/CorpusID:270391754.](https://api.semanticscholar.org/CorpusID:270391754)

E. Guha, R. Marten, S. Keh, N. Raoof, G. Smyrnis, H. Bansal, M. Nezhurina, J. Mercat, T. Vu, Z. Sprague, A. Suvarna, B. Feuer, L. Chen, Z. Khan, E. Frankel, S. Grover, C. Choi, N. Muennighoff, S. Su, W. Zhao, J. Yang, S. Pimpalgaonkar, K. Sharma, C. C.-J. Ji, Y. Deng, S. Pratt, V. Ramanujan, J. Saad-Falcon, J. Li, A. Dave, A. Albalak, K. Arora, B. Wulfe, C. Hegde, G. Durrett, S. Oh, M. Bansal, S. Gabriel, A. Grover, K.-W. Chang, V. Shankar, A. Gokaslan, M. A. Merrill, T. Hashimoto, Y. Choi, J. Jitsev, R. Heckel, M. Sathiamoorthy, A. G. Dimakis, and L. Schmidt. Openthoughts: Data recipes for reasoning models. arXiv preprint arXiv:2506.04178, 2025a. URL [https://arxiv.org/abs/2506.04178.](https://arxiv.org/abs/2506.04178)

E. Guha, R. Marten, S. Keh, N. Raoof, G. Smyrnis, H. Bansal, M. Nezhurina, J. Mercat, T. Vu, Z. Sprague, A. Suvarna, B. Feuer, L. Chen, Z. Khan, E. Frankel, S. Grover, C. Choi, N. Muennighoff, S. Su, W. Zhao, J. Yang, S. Pimpalgaonkar, K. Sharma, C. C.-J. Ji, Y. Deng, S. Pratt, V. Ramanujan, J. Saad-Falcon, J. Li, A. Dave, A. Albalak, K. Arora, B. Wulfe, C. Hegde, G. Durrett, S. Oh, M. Bansal, S. Gabriel, A. Grover, K.-W. Chang, V. Shankar, A. Gokaslan, M. A. Merrill, T. Hashimoto, Y. Choi, J. Jitsev, R. Heckel, M. Sathiamoorthy, A. G. Dimakis, and L. Schmidt. Openthoughts: Data recipes for reasoning models, 2025b. URL [https://arxiv.org/abs/2506.04178](https://arxiv.org/abs/2506.04178).

D. Guo, Q. Zhu, D. Yang, Z. Xie, K. Dong, W. Zhang, G. Chen, X. Bi, Y. Wu, Y. Li, et al. Deepseek-coder: When the large language model meets programming–the rise of code intelligence. arXiv preprint arXiv:2401.14196, 2024.

D. Guo, D. Yang, H. Zhang, J. Song, R. Zhang, R. Xu, Q. Zhu, S. Ma, P. Wang, X. Bi, et al. Deepseek-r1: Incentivizing reasoning capability in llms via reinforcement learning. arXiv preprint arXiv:2501.12948, 2025.

D. Hall, C. Chou, A. Garg, N. Ravi, N. Liu, H. Shandilya, A. Ahmed, P. Liang, R. Kuditipudi, J38, T. Lee, R. Power, K. Salahi, W. Held, J. Wang, chiheem, J. Niklaus, Y. Mai, dependabot[bot], I. Zhou, K. X. Li, S. Yang, S. Karamcheti,

<!-- page 73 of 118 -->

R. Williams, C. Zhou, A. Ramaswami, whenwen, S. Kotha, G. Miguel, and C. Xu. marin-community/marin. https://github.com/marin-community/marin, nov 14 2025. URL [https://github.com/marin-community/marin.](https://github.com/marin-community/marin)

S. Han, K. Rao, A. Ettinger, L. Jiang, B. Y. Lin, N. Lambert, Y. Choi, and N. Dziri. Wildguard: Open one-stop moderation tools for safety risks, jailbreaks, and refusals of llms. arXiv preprint arXiv:2406.18495, 2024.

T. Hartvigsen, S. Gabriel, H. Palangi, M. Sap, D. Ray, and E. Kamar. Toxigen: A large-scale machine-generated dataset for adversarial and implicit hate speech detection. pages 3309–3326, 01 2022. doi: 10.18653/v1/2022.acl-long.234.

G. Haupt. Hierarchical thinking: a cognitive tool for guiding coherent decision making in design problem solving. International Journal of Technology and Design Education, 28(1):207–237, 2018. ISSN 1573-1804. doi: 10.1007 s10798-016-9381-0. URL [https://doi.org/10.1007/s10798-016-9381-0.](https://doi.org/10.1007/s10798-016-9381-0)

D. Heineman, V. Hofmann, I. Magnusson, Y. Gu, N. A. Smith, H. Hajishirzi, K. Lo, and J. Dodge. Signal and noise: A framework for reducing uncertainty in language model evaluation, 2025. URL [https://arxiv.org/abs/2508.13144](https://arxiv.org/abs/2508.13144).

D. Hendrycks, S. Basart, S. Kadavath, M. Mazeika, A. Arora, E. Guo, C. Burns, S. Puranik, H. He, D. Song, and J. Steinhardt. Measuring coding challenge competence with apps. NeurIPS, 2021a.

D. Hendrycks, C. Burns, S. Basart, A. Zou, M. Mazeika, D. Song, and J. Steinhardt. Measuring massive multitask language understanding. Proceedings of the International Conference on Learning Representations (ICLR), 2021b.

D. Hendrycks, C. Burns, S. Kadavath, A. Arora, S. Basart, E. Tang, D. Song, and J. Steinhardt. Measuring mathematical problem solving with the math dataset. NeurIPS, 2021c.

D. Horgan, J. Quan, D. Budden, G. Barth-Maron, M. Hessel, H. Van Hasselt, and D. Silver. Distributed prioritized experience replay. arXiv preprint arXiv:1803.00933, 2018.

C.-P. Hsieh, S. Sun, S. Kriman, S. Acharya, D. Rekesh, F. Jia, Y. Zhang, and B. Ginsburg. Ruler: What’s the real context size of your long-context language models?, 2024. URL [https://arxiv.org/abs/2404.06654.](https://arxiv.org/abs/2404.06654)

P.-L. Hsu, Y. Dai, V. Kothapalli, Q. Song, S. Tang, S. Zhu, S. Shimizu, S. Sahni, H. Ning, and Y. Chen. Liger kernel: Efficient triton kernels for llm training, 2025. URL [https://arxiv.org/abs/2410.10989.](https://arxiv.org/abs/2410.10989)

J. Hu, Y. Zhang, Q. Han, D. Jiang, X. Zhang, and H.-Y. Shum. Open-reasoner-zero: An open source approach to scaling up reinforcement learning on the base model. arXiv preprint arXiv:2503.24290, 2025.

Y. Huang, L. Sun, H. Wang, S. Wu, Q. Zhang, Y. Li, C. Gao, Y. Huang, W. Lyu, Y. Zhang, et al. Trustllm: Trustworthiness in large language models. arXiv preprint arXiv:2401.05561, 2024a.

Y. Huang, J. Zhang, Z. Shan, and J. He. Compression represents intelligence linearly. arXiv preprint arXiv:2404.09937, 2024b.

N. Jain, K. Han, A. Gu, W.-D. Li, F. Yan, T. Zhang, S. Wang, A. Solar-Lezama, K. Sen, and I. Stoica. Livecodebench: Holistic and contamination free evaluation of large language models for code. arXiv preprint arXiv:2403.07974, 2024.

L. Jiang, K. Rao, S. Han, A. Ettinger, F. Brahman, S. Kumar, N. Mireshghallah, X. Lu, M. Sap, Y. Choi, and N. Dziri. Wildteaming at scale: From in-the-wild jailbreaks to (adversarially) safer language models. arXiv preprint arXiv:2406.18510, 2024. URL [https://arxiv.org/abs/2406.18510.](https://arxiv.org/abs/2406.18510)

Z. Jiang, M. Y. R. Yang, M. Tsirlin, R. Tang, and J. Lin. Less is more: Parameter-free text classification with gzip, 2022. URL [https://arxiv.org/abs/2212.09410.](https://arxiv.org/abs/2212.09410)

D. Jin, E. Pan, N. Oufattole, W.-H. Weng, H. Fang, and P. Szolovits. What disease does this patient have? a large-scale open domain question answering dataset from medical exams. Applied Sciences, 11(14):6421, 2021.

J. M. Joyce. Causal reasoning and backtracking. Philosophical Studies, 147(1):139–154, 2009. doi: 10.1007/ s11098-009-9454-y.

F. Kaiyom, A. Ahmed, Y. Mai, K. Klyman, R. Bommasani, and P. Liang. HELM safety: Towards standardized safety evaluations of language models, 8 Nov. 2024. URL [https://crfm.stanford.edu/2024/11/08/helm-safety.html.](https://crfm.stanford.edu/2024/11/08/helm-safety.html)

P. Kargupta, S. S. Li, H. Wang, J. Lee, S. Chen, O. Ahia, D. Light, T. L. Griffiths, M. Kleiman-Weiner, J. Han, A. Celikyilmaz, and Y. Tsvetkov. Cognitive foundations for reasoning and their manifestation in llms. arXiv, 2025.

K. Kavukcuoğlu and G. DeepMind. Gemini 2.5: Our most intelligent ai model. [https://blog.google/technology/google-deepmind/gemini-model-thinking-updates-march-2025/,](https://blog.google/technology/google-deepmind/gemini-model-thinking-updates-march-2025/) Mar. 2025. Accessed: 2025-10-07.

<!-- page 74 of 118 -->

J. Kim, A. Goyal, A. Zhang, B. Xiong, R. Hou, M. Kambadur, D. Mahajan, H. Hajishirzi, and L. Tan. A systematic examination of preference learning through the lens of instruction-following. In Proceedings of the 2025 Conference of the Nations of the Americas Chapter of the Association for Computational Linguistics: Human Language Technologies (Volume 1: Long Papers), pages 11062–11082, 2025.

S. Kim, S. Bae, J. Shin, S. Kang, D. Kwak, K. Yoo, and M. Seo. Aligning large language models through synthetic feedback. In H. Bouamor, J. Pino, and K. Bali, editors, Proceedings of the 2023 Conference on Empirical Methods in Natural Language Processing, pages 13677–13700, Singapore, Dec. 2023. Association for Computational Linguistics. doi: 10.18653/v1/2023.emnlp-main.844. URL [https://aclanthology.org/2023.emnlp-main.844/.](https://aclanthology.org/2023.emnlp-main.844/)

Kimi Team, Y. Bai, Y. Bao, G. Chen, J. Chen, N. Chen, R. Chen, Y. Chen, Y. Chen, Y. Chen, Z. Chen, J. Cui, H. Ding, M. Dong, A. Du, C. Du, D. Du, Y. Du, Y. Fan, Y. Feng, K. Fu, B. Gao, H. Gao, P. Gao, T. Gao, X. Gu, L. Guan, H. Guo, J. Guo, H. Hu, X. Hao, T. He, W. He, W. He, C. Hong, Y. Hu, Z. Hu, W. Huang, Z. Huang, Z. Huang, T. Jiang, Z. Jiang, X. Jin, Y. Kang, G. Lai, C. Li, F. Li, H. Li, M. Li, W. Li, Y. Li, Y. Li, Z. Li, Z. Li, H. Lin, X. Lin, Z. Lin, C. Liu, C. Liu, H. Liu, J. Liu, J. Liu, L. Liu, S. Liu, T. Y. Liu, T. Liu, W. Liu, Y. Liu, Y. Liu, Y. Liu, Y. Liu, Z. Liu, E. Lu, L. Lu, S. Ma, X. Ma, Y. Ma, S. Mao, J. Mei, X. Men, Y. Miao, S. Pan, Y. Peng, R. Qin, B. Qu, Z. Shang, L. Shi, S. Shi, F. Song, J. Su, Z. Su, X. Sun, F. Sung, H. Tang, J. Tao, Q. Teng, C. Wang, D. Wang, F. Wang, H. Wang, J. Wang, J. Wang, J. Wang, S. Wang, S. Wang, Y. Wang, Y. Wang, Y. Wang, Y. Wang, Y. Wang, Z. Wang, Z. Wang, Z. Wang, C. Wei, Q. Wei, W. Wu, X. Wu, Y. Wu, C. Xiao, X. Xie, W. Xiong, B. Xu, J. Xu, J. Xu, L. H. Xu, L. Xu, S. Xu, W. Xu, X. Xu, Y. Xu, Z. Xu, J. Yan, Y. Yan, X. Yang, Y. Yang, Z. Yang, Z. Yang, Z. Yang, H. Yao, X. Yao, W. Ye, Z. Ye, B. Yin, L. Yu, E. Yuan, H. Yuan, M. Yuan, H. Zhan, D. Zhang, H. Zhang, W. Zhang, X. Zhang, Y. Zhang, Y. Zhang, Y. Zhang, Y. Zhang, Y. Zhang, Y. Zhang, Z. Zhang, H. Zhao, Y. Zhao, H. Zheng, S. Zheng, J. Zhou, X. Zhou, Z. Zhou, Z. Zhu, W. Zhuang, and X. Zu. Kimi k2: Open agentic intelligence, 2025. URL [https://arxiv.org/abs/2507.20534.](https://arxiv.org/abs/2507.20534)

A. Köpf, Y. Kilcher, D. von Rütte, S. Anagnostidis, Z. R. Tam, K. Stevens, A. Barhoum, D. Nguyen, O. Stanley, R. Nagyfi, et al. Openassistant conversations-democratizing large language model alignment. Advances in Neural Information Processing Systems, 36, 2024.

S. Kudugunta, I. Caswell, B. Zhang, X. Garcia, C. A. Choquette-Choo, K. Lee, D. Xin, A. Kusupati, R. Stella, A. Bapna, and O. Firat. Madlad-400: A multilingual and document-level large audited dataset, 2023. URL [https://arxiv.org/abs/2309.04662](https://arxiv.org/abs/2309.04662).

T. Kwiatkowski, J. Palomaki, O. Redfield, M. Collins, A. Parikh, C. Alberti, D. Epstein, I. Polosukhin, J. Devlin, K. Lee, K. Toutanova, L. Jones, M. Kelcey, M.-W. Chang, A. M. Dai, J. Uszkoreit, Q. Le, and S. Petrov. Natural questions: A benchmark for question answering research. Transactions of the Association for Computational Linguistics, 7:452–466, 2019. doi: 10.1162/tacl\_a\_00276. URL [https://aclanthology.org/Q19-1026.](https://aclanthology.org/Q19-1026)

W. Kwon, Z. Li, S. Zhuang, Y. Sheng, L. Zheng, C. H. Yu, J. E. Gonzalez, H. Zhang, and I. Stoica. Efficient memory management for large language model serving with pagedattention. In Proceedings of the ACM SIGOPS 29th Symposium on Operating Systems Principles, 2023.

Y. Lai, C. Li, Y. Wang, T. Zhang, R. Zhong, L. Zettlemoyer, W.-T. Yih, D. Fried, S. Wang, and T. Yu. Ds-1000: A natural and reliable benchmark for data science code generation. ArXiv, abs/2211.11501, 2022.

N. Lambert. Reinforcement Learning from Human Feedback. Online, 2025. URL [https://rlhfbook.com.](https://rlhfbook.com)

N. Lambert, T. K. Gilbert, and T. Zick. Entangled preferences: The history and risks of reinforcement learning and human feedback. arXiv preprint arXiv:2310.13595, 2023.

N. Lambert, J. D. Morrison, V. Pyatkin, S. Huang, H. Ivison, F. Brahman, L. J. V. Miranda, A. Liu, N. Dziri, S. Lyu, Y. Gu, S. Malik, V. Graf, J. D. Hwang, J. Yang, R. L. Bras, O. Tafjord, C. Wilhelm, L. Soldaini, N. A. Smith, Y. Wang, P. Dasigi, and H. Hajishirzi. Tulu 3: Pushing frontiers in open language model post-training. 2024. URL [https://api.semanticscholar.org/CorpusID:274192505.](https://api.semanticscholar.org/CorpusID:274192505)

J. M. Laurent, J. D. Janizek, M. Ruzo, M. M. Hinks, M. J. Hammerling, S. Narayanan, M. Ponnapati, A. D. White, and S. G. Rodriques. Lab-bench: Measuring capabilities of language models for biology research. arXiv preprint arXiv:2407.10362, 2024.

K. Lee, D. Ippolito, A. Nystrom, C. Zhang, D. Eck, C. Callison-Burch, and N. Carlini. Deduplicating training data makes language models better, 2022. URL [https://arxiv.org/abs/2107.06499.](https://arxiv.org/abs/2107.06499)

A. Lewkowycz, A. Andreassen, D. Dohan, E. Dyer, H. Michalewski, V. Ramasesh, A. Slone, C. Anil, I. Schlag, T. Gutman-Solo, et al. Solving quantitative reasoning problems with language models. Advances in neural information processing systems, 35:3843–3857, 2022.

<!-- page 75 of 118 -->

J. Li, A. Fang, G. Smyrnis, M. Ivgi, M. Jordan, S. Gadre, H. Bansal, E. Guha, S. Keh, K. Arora, S. Garg, R. Xin, N. Muennighoff, R. Heckel, J. Mercat, M. Chen, S. Gururangan, M. Wortsman, A. Albalak, Y. Bitton, M. Nezhurina, A. Abbas, C.-Y. Hsieh, D. Ghosh, J. Gardner, M. Kilian, H. Zhang, R. Shao, S. Pratt, S. Sanyal, G. Ilharco, G. Daras, K. Marathe, A. Gokaslan, J. Zhang, K. Chandu, T. Nguyen, I. Vasiljevic, S. Kakade, S. Song, S. Sanghavi, F. Faghri, S. Oh, L. Zettlemoyer, K. Lo, A. El-Nouby, H. Pouransari, A. Toshev, S. Wang, D. Groeneveld, L. Soldaini, P. W. Koh, J. Jitsev, T. Kollar, A. G. Dimakis, Y. Carmon, A. Dave, L. Schmidt, and V. Shankar. Datacomp-lm: In search of the next generation of training sets for language models, 2024a. URL [https://arxiv.org/abs/2406.11794.](https://arxiv.org/abs/2406.11794)

N. Li, A. Pan, A. Gopal, S. Yue, D. Berrios, A. Gatti, J. D. Li, A.-K. Dombrowski, S. Goel, G. Mukobi, N. Helm-Burger, R. Lababidi, L. Justen, A. B. Liu, M. Chen, I. Barrass, O. Zhang, X. Zhu, R. Tamirisa, B. Bharathi, A. Herbert-Voss, C. B. Breuer, A. Zou, M. Mazeika, Z. Wang, P. Oswal, W. Lin, A. A. Hunt, J. Tienken-Harder, K. Y. Shih, K. Talley, J. Guan, I. Steneker, D. Campbell, B. Jokubaitis, S. Basart, S. Fitz, P. Kumaraguru, K. K. Karmakar, U. Tupakula, V. Varadharajan, Y. Shoshitaishvili, J. Ba, K. M. Esvelt, A. Wang, and D. Hendrycks. The WMDP benchmark: Measuring and reducing malicious use with unlearning. In R. Salakhutdinov, Z. Kolter, K. Heller, A. Weller, N. Oliver, J. Scarlett, and F. Berkenkamp, editors, Proceedings of the 41st International Conference on Machine Learning, volume 235 of Proceedings of Machine Learning Research, pages 28525–28550. PMLR, 21–27 Jul 2024b. URL [https://proceedings.mlr.press/v235/li24bc.html.](https://proceedings.mlr.press/v235/li24bc.html)

R. Li, J. Fu, B.-W. Zhang, T. Huang, Z. Sun, C. Lyu, G. Liu, Z. Jin, and G. Li. Taco: Topics in algorithmic code generation dataset. arXiv preprint arXiv:2312.14852, 2023a.

T. Li, W.-L. Chiang, E. Frick, L. Dunlap, T. Wu, B. Zhu, J. E. Gonzalez, and I. Stoica. From crowdsourced data to high-quality benchmarks: Arena-hard and benchbuilder pipeline. arXiv preprint arXiv:2406.11939, 2024c.

X. Li, T. Zhang, Y. Dubois, R. Taori, I. Gulrajani, C. Guestrin, P. Liang, and T. B. Hashimoto. Alpacaeval: An automatic evaluator of instruction-following models. [https://github.com/tatsu-lab/alpaca\_eval,](https://github.com/tatsu-lab/alpaca_eval) 5 2023b.

Y. Li, Y. Ma, S. Yan, C. Zhang, J. Liu, J. Lu, Z. Xu, M. Chen, M. Wang, S. Zhan, J. Ma, X. Lai, D. Liu, Y. Luo, X. Bin, H. Ren, M. Han, W. Hao, B. Yi, L. Liu, B. Ma, X. Jia, X. Zhou, S. Qiao, L. Xiang, and Y. Wu. Model merging in pre-training of large language models. ArXiv, abs/2505.12082, 2025. URL [https://api.semanticscholar.org/CorpusID:278739754.](https://api.semanticscholar.org/CorpusID:278739754)

H. Lightman, V. Kosaraju, Y. Burda, H. Edwards, B. Baker, T. Lee, J. Leike, J. Schulman, I. Sutskever, and K. Cobbe. Let’s verify step by step. arXiv preprint arXiv:2305.20050, 2023.

B. Y. Lin, R. L. Bras, K. Richardson, A. Sabharwal, R. Poovendran, P. Clark, and Y. Choi. Zebralogic: On the scaling limits of llms for logical reasoning. arXiv preprint arXiv:2502.01100, 2025.

B. Liu, S. Bubeck, R. Eldan, J. Kulkarni, Y. Li, A. Nguyen, R. Ward, and Y. Zhang. Tinygsm: achieving >80URL [https://arxiv.org/abs/2312.09241](https://arxiv.org/abs/2312.09241).

J. Liu, C. S. Xia, Y. Wang, and L. Zhang. Is your code generated by chatGPT really correct? rigorous evaluation of large language models for code generation. In Thirty-seventh Conference on Neural Information Processing Systems, 2023b. URL [https://openreview.net/forum?id=1qvx610Cu7.](https://openreview.net/forum?id=1qvx610Cu7)

M. Liu, S. Diao, X. Lu, J. Hu, X. Dong, Y. Choi, J. Kautz, and Y. Dong. Prorl: Prolonged reinforcement learning expands reasoning boundaries in large language models. arXiv preprint, 2025a. URL [https://arxiv.org/abs/2505.24864](https://arxiv.org/abs/2505.24864).

Q. Liu, X. Zheng, N. Muennighoff, G. Zeng, L. Dou, T. Pang, J. Jiang, and M. Lin. Regmix: Data mixture as regression for language model pre-training. arXiv preprint arXiv:2407.01492, 2024a.

W. Liu, X. Huang, X. Zeng, X. Hao, S. Yu, D. Li, S. Wang, W. Gan, Z. Liu, Y. Yu, Z. Wang, Y. Wang, W. Ning, Y. Hou, B. Wang, C. Wu, X. Wang, Y. Liu, Y. Wang, D. Tang, D. Tu, L. Shang, X. Jiang, R. Tang, D. Lian, Q. Liu, and E. Chen. Toolace: Winning the points of llm function calling. ArXiv, abs/2409.00920, 2024b. URL [https://api.semanticscholar.org/CorpusID:272368347.](https://api.semanticscholar.org/CorpusID:272368347)

Z. Liu, A. Qiao, W. Neiswanger, H. Wang, B. Tan, T. Tao, J. Li, Y. Wang, S. Sun, O. Pangarkar, et al. Llm360: Towards fully transparent open-source llms. arXiv preprint arXiv:2312.06550, 2023c.

Z. Liu, T. Hoang, J. Zhang, M. Zhu, T. Lan, S. Kokane, J. Tan, W. Yao, Z. Liu, Y. Feng, R. Murthy, L. Yang, S. Savarese, J. C. Niebles, H. Wang, S. Heinecke, and C. Xiong. Apigen: Automated pipeline for generating verifiable and diverse function-calling datasets. ArXiv, abs/2406.18518, 2024c. URL [https://api.semanticscholar.org/CorpusID:270738094](https://api.semanticscholar.org/CorpusID:270738094).

Z. Liu, C. Chen, W. Li, P. Qi, T. Pang, C. Du, W. S. Lee, and M. Lin. Understanding r1-zero-like training: A critical perspective. In Conference on Language Modeling (COLM), 2025b.

<!-- page 76 of 118 -->

S. Longpre, L. Hou, T. Vu, A. Webson, H. W. Chung, Y. Tay, D. Zhou, Q. V. Le, B. Zoph, J. Wei, et al. The flan collection: Designing data and methods for effective instruction tuning. arXiv preprint arXiv:2301.13688, 2023.

A. Lozhkov, R. Li, L. B. Allal, F. Cassano, J. Lamy-Poirier, N. Tazi, A. Tang, D. Pykhtar, J. Liu, Y. Wei, et al. Starcoder 2 and the stack v2: The next generation. arXiv preprint arXiv:2402.19173, 2024.

M. Luo, S. Tan, J. Wong, X. Shi, W. Y. Tang, M. Roongta, C. Cai, J. Luo, L. E. Li, R. A. Popa, and I. Stoica. Deepscaler: Surpassing o1-preview with a 1.5b model by scaling rl. [https://pretty-radio-b75.notion.site/DeepScaleR-Surpassing-O1-Preview-with-a-1-5B-Model-by-Scaling-RL-19681902c1468005bed8ca303013a4e2](https://pretty-radio-b75.notion.site/DeepScaleR-Surpassing-O1-Preview-with-a-1-5B-Model-by-Scaling-RL-19681902c1468005bed8ca303013a4e2),2025a. Notion Blog.

M. Luo, S. Tan, J. Wong, X. Shi, W. Y. Tang, M. Roongta, C. Cai, J. Luo, T. Zhang, L. E. Li, et al. Deepscaler: Surpassing o1-preview with a 1.5 b model by scaling rl. Notion Blog, 2025b.

Z. Luo, C. Xu, P. Zhao, Q. Sun, X. Geng, W. Hu, C. Tao, J. Ma, Q. Lin, and D. Jiang. Wizardcoder: Empowering code large language models with evol-instruct, 2023.

I. Magar and R. Schwartz. Data contamination: From memorization to exploitation. ArXiv, abs/2203.08242, 2022. URL [https://api.semanticscholar.org/CorpusID:247475929.](https://api.semanticscholar.org/CorpusID:247475929)

I. Magnusson, A. Bhagia, V. Hofmann, L. Soldaini, A. H. Jha, O. Tafjord, D. Schwenk, E. P. Walsh, Y. Elazar, K. Lo, D. Groeneveld, I. Beltagy, H. Hajishirzi, N. A. Smith, K. Richardson, and J. Dodge. Paloma: A benchmark for evaluating language model fit, 2024. URL [https://arxiv.org/abs/2312.10523.](https://arxiv.org/abs/2312.10523)

I. Magnusson, N. Tai, B. Bogin, D. Heineman, J. D. Hwang, L. Soldaini, A. Bhagia, J. Liu, D. Groeneveld, O. Tafjord, N. A. Smith, P. W. Koh, and J. Dodge. Datadecide: How to predict best pretraining data with small experiments, 2025. URL [https://arxiv.org/abs/2504.11393.](https://arxiv.org/abs/2504.11393)

A. Mallen, A. Asai, V. Zhong, R. Das, H. Hajishirzi, and D. Khashabi. When not to trust language models: Investigating effectiveness and limitations of parametric and non-parametric memories. arXiv preprint, 2022.

S. V. Marjanović, A. Patel, V. Adlakha, M. Aghajohari, P. BehnamGhader, M. Bhatia, A. Khandelwal, A. Kraft, B. Krojer, X. H. Lù, N. Meade, D. Shin, A. Kazemnejad, G. Kamath, M. Mosbach, K. Stańczak, and S. Reddy. Deepseek-r1 thoughtology: Let’s think about llm reasoning, 2025. URL [https://arxiv.org/abs/2504.07128.](https://arxiv.org/abs/2504.07128)

H. Markovits, V. A. Thompson, and J. Brisson. Metacognition and abstract reasoning. Memory & Cognition, 43(4):681–693, 2015. ISSN 1532-5946. doi: 10.3758/s13421-014-0488-9. URL [https://doi.org/10.3758/s13421-014-0488-9](https://doi.org/10.3758/s13421-014-0488-9).

A. Matton, T. Sherborne, D. Aumiller, E. Tommasone, M. Alizadeh, J. He, R. Ma, M. Voisin, E. Gilsenan-McMahon, and M. Gallé. On leakage of code generation evaluation datasets. In Y. Al-Onaizan, M. Bansal, and Y.-N. Chen, editors, Findings of the Association for Computational Linguistics: EMNLP 2024, pages 13215–13223, Miami, Florida, USA, Nov. 2024. Association for Computational Linguistics. doi: 10.18653/v1/2024.findings-emnlp.772. URL [https://aclanthology.org/2024.findings-emnlp.772/.](https://aclanthology.org/2024.findings-emnlp.772/)

M. Mazeika, L. Phan, X. Yin, A. Zou, Z. Wang, N. Mu, E. Sakhaee, N. Li, S. Basart, B. Li, et al. Harmbench: A standardized evaluation framework for automated red teaming and robust refusal. arXiv preprint arXiv:2402.04249, 2024.

Y. Meyer and D. Corneil. Nemotron-Personas-USA: Synthetic personas aligned to real-world distributions, June 2025. URL [https://huggingface.co/datasets/nvidia/Nemotron-Personas-USA.](https://huggingface.co/datasets/nvidia/Nemotron-Personas-USA)

S. Mindermann, J. M. Brauner, M. T. Razzak, M. Sharma, A. Kirsch, W. Xu, B. Höltgen, A. N. Gomez, A. Morisot, S. Farquhar, et al. Prioritized training on points that are learnable, worth learning, and not yet learnt. In International Conference on Machine Learning, pages 15630–15649. PMLR, 2022.

M. Miroyan, T.-H. Wu, L. King, T. Li, J. Pan, X. Hu, W.-L. Chiang, A. N. Angelopoulos, T. Darrell, N. Norouzi, and J. Gonzalez. Search arena: Analyzing search-augmented llms. ArXiv, abs/2506.05334, 2025. URL [https://api.semanticscholar.org/CorpusID:279243096.](https://api.semanticscholar.org/CorpusID:279243096)

I. Mirzadeh, K. Alizadeh, H. Shahrokhi, O. Tuzel, S. Bengio, and M. Farajtabar. Gsm-symbolic: Understanding the limitations of mathematical reasoning in large language models, 2024. URL [https://arxiv.org/abs/2410.05229.](https://arxiv.org/abs/2410.05229)

J. Morrison, N. A. Smith, H. Hajishirzi, P. W. Koh, J. Dodge, and P. Dasigi. Merge to learn: Efficiently adding skills to language models with model merging, 2024. URL [https://arxiv.org/abs/2410.12937.](https://arxiv.org/abs/2410.12937)

MosaicML. Llm foundry - jeopardy dataset. [https://github.com/mosaicml/llm-foundry/blob/main/scripts/eval/local\_data/world\_knowledge/jeopardy\_all.jsonl,](https://github.com/mosaicml/llm-foundry/blob/main/scripts/eval/local_data/world_knowledge/jeopardy_all.jsonl) 2024. Accessed: 2024-11-10.

<!-- page 77 of 118 -->

I. Moshkov, D. Hanley, I. Sorokin, S. Toshniwal, C. Henkel, B. Schifferer, W. Du, and I. Gitman. AIMO-2 Winning Solution: Building State-of-the-Art Mathematical Reasoning Models with OpenMathReasoning dataset. arXiv preprint arXiv:2504.16891, 2025.

N. Muennighoff, A. M. Rush, B. Barak, T. L. Scao, A. Piktus, N. Tazi, S. Pyysalo, T. Wolf, and C. Raffel. Scaling data-constrained language models, 2025a. URL [https://arxiv.org/abs/2305.16264.](https://arxiv.org/abs/2305.16264)

N. Muennighoff, Z. Yang, W. Shi, X. L. Li, L. Fei-Fei, H. Hajishirzi, L. Zettlemoyer, P. Liang, E. Candès, and T. Hashimoto. s1: Simple test-time scaling, 2025b. URL [https://arxiv.org/abs/2501.19393.](https://arxiv.org/abs/2501.19393)

D. Nathawani, I. Gitman, S. Majumdar, E. Bakhturina, A. Sunil Mahabaleshwarkar, , J. Zhang, and J. Polak Scowcroft. Nemotron-Post-Training-Dataset-v1, 2025. URL [https://huggingface.co/datasets/nvidia/Nemotron-Post-Training-Dataset-v1](https://huggingface.co/datasets/nvidia/Nemotron-Post-Training-Dataset-v1).

E. Nelson, G. Kollias, P. Das, S. Chaudhury, and S. Dan. Needle in the haystack for memory based large language models, 2024. URL [https://arxiv.org/abs/2407.01437.](https://arxiv.org/abs/2407.01437)

M. Noukhovitch, S. Huang, S. Xhonneux, A. Hosseini, R. Agarwal, and A. Courville. Asynchronous rlhf: Faster and more efficient off-policy rl for language models, 2024. URL [https://arxiv.org/abs/2410.18252.](https://arxiv.org/abs/2410.18252)

NVIDIA, , A. Basant, A. Khairnar, A. Paithankar, A. Khattar, A. Renduchintala, A. Malte, A. Bercovich, A. Hazare, A. Rico, A. Ficek, A. Kondratenko, A. Shaposhnikov, A. Bukharin, A. Taghibakhshi, A. Barton, A. S. Mahabaleshwarkar, A. Shen, A. Tao, A. Guan, A. Shors, A. Mandarwal, A. Mehta, A. Venkatesan, A. Sharabiani, A. Aithal, A. Poojary, A. Dattagupta, B. Buddharaju, B. Zhu, B. Simkin, B. Kartal, B. D. Rouhani, B. Chen, B. Ginsburg, B. Norick, B. Yu, B. Catanzaro, C. Wang, C. Truong, C. Mungekar, C. Patel, C. Alexiuk, C. Munley, C. Parisien, D. Su, D. Afrimi, D. Korzekwa, D. Rohrer, D. Gitman, D. Mosallanezhad, D. Narayanan, D. Rekesh, D. Yared, D. Pykhtar, D. Ahn, D. Riach, E. Long, E. Ning, E. Chung, E. Galinkin, E. Bakhturina, G. Prasad, G. Shen, H. Qian, H. Elisha, H. Sharma, H. Ross, H. Ngo, H. Sahota, H. Wang, H. C. Shin, H. Huang, I. Cunningham, I. Gitman, I. Moshkov, J. Jung, J. Kautz, J. P. Scowcroft, J. Casper, J. Zhang, J. Zeng, J. Zhang, J. Xue, J. Huang, J. Conway, J. Kamalu, J. Cohen, J. Jennings, J. V. Vialard, J. Yi, J. Parmar, K. Briski, K. Cheung, K. Luna, K. Wyss, K. Santhanam, K. Kong, K. Pawelec, K. Anik, K. Li, K. Ahmadian, L. McAfee, L. Sleiman, L. Derczynski, L. Vega, M. R. de Melo, M. N. Sreedhar, M. Chochowski, M. Cai, M. Kliegl, M. Stepniewska-Dziubinska, M. Novikov, M. Samadi, M. Price, M. Boubdir, M. Boone, M. Evans, M. Bien, M. Zawalski, M. Martinez, M. Chrzanowski, M. Shoeybi, M. Patwary, N. Dhameja, N. Assaf, N. Habibi, N. Bhatia, N. Pope, N. Tajbakhsh, N. K. Juluru, O. Rybakov, O. Hrinchuk, O. Kuchaiev, O. Olabiyi, P. Ribalta, P. Subramanian, P. Chadha, P. Molchanov, P. Dykas, P. Jin, P. Bialecki, P. Januszewski, P. Thalasta, P. Gaikwad, P. Varshney, P. Gundecha, P. Tredak, R. K. Mahabadi, R. Patel, R. El-Yaniv, R. Rajan, R. Cheruvu, R. Shahbazyan, R. Borkar, R. Gala, R. Waleffe, R. Zhang, R. J. Hewett, R. Prenger, S. Jain, S. Kriman, S. Satheesh, S. Kaji, S. Yurick, S. Muralidharan, S. Narenthiran, S. Bak, S. Sameni, S. Han, S. Ramasamy, S. Ghosh, S. T. Sreenivas, S. Thomas, S. Diao, S. Gopal, S. Prabhumoye, S. Toshniwal, S. Ding, S. Singh, S. Jain, S. Majumdar, S. Singhal, S. Alborghetti, S. N. Akter, T. Kong, T. Moon, T. Hliwiak, T. Asida, T. Wang, T. Konuk, T. Vashishth, T. Poon, U. Karpas, V. Noroozi, V. Srinivasan, V. Korthikanti, V. Fugro, V. Kalluru, V. Kurin, V. Lavrukhin, W. U. Ahmad, W. Du, W. Byeon, X. Lu, X. Dong, Y. Karnati, Y. Choi, Y. Zhang, Y. Lin, Y. Fu, Y. Suhara, Z. Dong, Z. Li, Z. Zhu, and Z. Chen. NVIDIA Nemotron Nano 2: An accurate and efficient hybrid mamba-transformer reasoning model, 2025. URL [https://arxiv.org/abs/2508.14444.](https://arxiv.org/abs/2508.14444)

NVIDIA AI. Nemotron-post-training-dataset-v1. [https://huggingface.co/datasets/nvidia/Nemotron-Post-Training-Dataset-v1](https://huggingface.co/datasets/nvidia/Nemotron-Post-Training-Dataset-v1), 2025. Dataset.

J. Olieslagers, Z. Bnaya, Y. Li, and W. Ma. Backward reasoning through and/or trees to solve problems. In Proceedings of the Annual Meeting of the Cognitive Science Society, volume 46. Cognitive Science Society, 2024. URL [https://escholarship.org/uc/item/9h4863xm.](https://escholarship.org/uc/item/9h4863xm) Retrieved from [https://escholarship.org/uc/item/9h4863xm.](https://escholarship.org/uc/item/9h4863xm)

T. OLMo, P. Walsh, L. Soldaini, D. Groeneveld, K. Lo, S. Arora, A. Bhagia, Y. Gu, S. Huang, M. Jordan, N. Lambert, D. Schwenk, O. Tafjord, T. Anderson, D. Atkinson, F. Brahman, C. Clark, P. Dasigi, N. Dziri, M. Guerquin, H. Ivison, P. W. Koh, J. Liu, S. Malik, W. Merrill, L. J. V. Miranda, J. Morrison, T. Murray, C. Nam, V. Pyatkin, A. Rangapur, M. Schmitz, S. Skjonsberg, D. Wadden, C. Wilhelm, M. Wilson, L. Zettlemoyer, A. Farhadi, N. A. Smith, and H. Hajishirzi. 2 olmo 2 furious, 2024. URL [https://arxiv.org/abs/2501.00656.](https://arxiv.org/abs/2501.00656)

OpenAI. GPT-3.5 turbo, 2023a. URL [https://platform.openai.com/docs/models/gp#gpt-3-5-turbo.](https://platform.openai.com/docs/models/gp#gpt-3-5-turbo)

OpenAI. GPT-4 technical report. ArXiv, abs/2303.08774, 2023b. URL [https://api.semanticscholar.org/CorpusID:257532815](https://api.semanticscholar.org/CorpusID:257532815).

OpenAI. Gpt-5 system card. Technical report, OpenAI, Aug. 2025. Accessed: 2025-10-07.

<!-- page 78 of 118 -->

A. Pal, L. K. Umapathi, and M. Sankarasubbu. Medmcqa: A large-scale multi-subject multi-choice dataset for medical domain question answering. In G. Flores, G. H. Chen, T. Pollard, J. C. Ho, and T. Naumann, editors, Proceedings of the Conference on Health, Inference, and Learning, volume 174 of Proceedings of Machine Learning Research, pages 248–260. PMLR, 07–08 Apr 2022. URL [https://proceedings.mlr.press/v174/pal22a.html.](https://proceedings.mlr.press/v174/pal22a.html)

R. Pandey. gzip predicts data-dependent scaling laws, 2024. URL [https://arxiv.org/abs/2405.16684.](https://arxiv.org/abs/2405.16684)

D. Paperno, G. Kruszewski, A. Lazaridou, Q. N. Pham, R. Bernardi, S. Pezzelle, M. Baroni, G. Boleda, and R. Fernández. The lambada dataset: Word prediction requiring a broad discourse context. arXiv preprint arXiv:1606.06031, 2016.

A. Parrish, A. Chen, N. Nangia, V. Padmakumar, J. Phang, J. Thompson, P. M. Htut, and S. Bowman. BBQ: A hand-built bias benchmark for question answering. In S. Muresan, P. Nakov, and A. Villavicencio, editors, Findings of the Association for Computational Linguistics: ACL 2022, pages 2086–2105, Dublin, Ireland, May 2022. Association for Computational Linguistics. doi: 10.18653/v1/2022.findings-acl.165. URL [https://aclanthology.org/2022.findings-acl.165/](https://aclanthology.org/2022.findings-acl.165/).

K. Paster, M. D. Santos, Z. Azerbayev, and J. Ba. Openwebmath: An open dataset of high-quality mathematical web text, 2023.

S. G. Patil, H. Mao, C. Cheng-Jie Ji, F. Yan, V. Suresh, I. Stoica, and J. E. Gonzalez. The berkeley function calling leaderboard (bfcl): From tool use to agentic evaluation of large language models. In Forty-second International Conference on Machine Learning, 2025.

G. Penedo, Q. Malartic, D. Hesslow, R. Cojocaru, A. Cappelli, H. Alobeidli, B. Pannier, E. Almazrouei, and J. Launay. The refinedweb dataset for falcon llm: Outperforming curated corpora with web data, and web data only, 2023. URL [https://arxiv.org/abs/2306.01116](https://arxiv.org/abs/2306.01116).

G. Penedo, H. Kydlíček, A. Lozhkov, M. Mitchell, C. Raffel, L. Von Werra, T. Wolf, et al. The FineWeb Datasets: Decanting the Web for the Finest Text Data at Scale. In The Thirty-eight Conference on Neural Information Processing Systems; Datasets and Benchmarks Track, 2024.

B. Peng, J. Quesnelle, H. Fan, and E. Shippole. Yarn: Efficient context window extension of large language models, 2023. URL [https://arxiv.org/abs/2309.00071.](https://arxiv.org/abs/2309.00071)

C. M. Pham, Y. Chang, and M. Iyyer. Clipper: Compression enables long-context synthetic data generation, 2025. URL [https://arxiv.org/abs/2502.14854](https://arxiv.org/abs/2502.14854).

A. Piché, E. Kamaloo, R. Pardinas, and D. Bahdanau. Pipelinerl: Faster on-policy reinforcement learning for long sequence generatio. arXiv preprint arXiv:2509.19128, 2025.

J. Poznanski, A. Rangapur, J. Borchardt, J. Dunkelberger, R. Huff, D. Lin, C. Wilhelm, K. Lo, and L. Soldaini. olmOCR: Unlocking trillions of tokens in pdfs with vision language models. arXiv preprint arXiv:2502.18443, 2025a.

J. Poznanski, L. Soldaini, and K. Lo. olmOCR 2: Unit Test Rewards for Document OCR, 2025b. URL [https://arxiv.org/abs/2510.19817](https://arxiv.org/abs/2510.19817).

PrimeIntellect. Synthetic-2. [https://huggingface.co/datasets/PrimeIntellect/SYNTHETIC-2,](https://huggingface.co/datasets/PrimeIntellect/SYNTHETIC-2) 2025. Dataset.

V. Pyatkin, S. Malik, V. Graf, H. Ivison, S. Huang, P. Dasigi, N. Lambert, and H. Hajishirzi. Generalizing verifiable instruction following. arXiv preprint arXiv:2507.02833, 2025.

Qwen, :, A. Yang, B. Yang, B. Zhang, B. Hui, B. Zheng, B. Yu, C. Li, D. Liu, F. Huang, H. Wei, H. Lin, J. Yang, J. Tu, J. Zhang, J. Yang, J. Yang, J. Zhou, J. Lin, K. Dang, K. Lu, K. Bao, K. Yang, L. Yu, M. Li, M. Xue, P. Zhang, Q. Zhu, R. Men, R. Lin, T. Li, T. Xia, X. Ren, X. Ren, Y. Fan, Y. Su, Y. Zhang, Y. Wan, Y. Liu, Z. Cui, Z. Zhang, and Z. Qiu. Qwen2.5 technical report, 2024. URL [https://arxiv.org/abs/2412.15115.](https://arxiv.org/abs/2412.15115)

Qwen Team. Qwq-32b: Embracing the power of reinforcement learning. [https://qwenlm.github.io/blog/qwq-32b/](https://qwenlm.github.io/blog/qwq-32b/),Mar. 2025. Model release blog.

R. Rafailov, A. Sharma, E. Mitchell, C. D. Manning, S. Ermon, and C. Finn. Direct preference optimization: Your language model is secretly a reward model. Advances in Neural Information Processing Systems, 36, 2024.

P. Rajpurkar, J. Zhang, K. Lopyrev, and P. Liang. SQuAD: 100,000+ questions for machine comprehension of text. In J. Su, K. Duh, and X. Carreras, editors, Proceedings of the 2016 Conference on Empirical Methods in Natural Language Processing, pages 2383–2392, Austin, Texas, Nov. 2016. Association for Computational Linguistics. doi: 10.18653/v1/D16-1264. URL [https://aclanthology.org/D16-1264.](https://aclanthology.org/D16-1264)

<!-- page 79 of 118 -->

J. Rasley, S. Rajbhandari, O. Ruwase, and Y. He. Deepspeed: System optimizations enable training deep learning models with over 100 billion parameters. In Proceedings of the 26th ACM SIGKDD international conference on knowledge discovery & data mining, pages 3505–3506, 2020.

S. Reddy, D. Chen, and C. D. Manning. CoQA: A conversational question answering challenge. Transactions of the Association for Computational Linguistics, 7:249–266, 2019. doi: 10.1162/tacl\_a\_00266. URL [https://aclanthology.org/Q19-1016](https://aclanthology.org/Q19-1016).

D. Rein, B. L. Hou, A. C. Stickland, J. Petty, R. Y. Pang, J. Dirani, J. Michael, and S. R. Bowman. GPQA: A graduate-level google-proof q&a benchmark. In First Conference on Language Modeling, 2024. URL [https://openreview.net/forum?id=Ti67584b98.](https://openreview.net/forum?id=Ti67584b98)

P. Röttger, H. R. Kirk, B. Vidgen, G. Attanasio, F. Bianchi, and D. Hovy. Xstest: A test suite for identifying exaggerated safety behaviours in large language models. arXiv preprint arXiv:2308.01263, 2023.

B. Rozière, J. Gehring, F. Gloeckle, S. Sootla, I. Gat, X. E. Tan, Y. Adi, J. Liu, R. Sauvestre, T. Remez, J. Rapin, A. Kozhevnikov, I. Evtimov, J. Bitton, M. Bhatt, C. C. Ferrer, A. Grattafiori, W. Xiong, A. Défossez, J. Copet, F. Azhar, H. Touvron, L. Martin, N. Usunier, T. Scialom, and G. Synnaeve. Code llama: Open foundation models for code, 2024. URL [https://arxiv.org/abs/2308.12950.](https://arxiv.org/abs/2308.12950)

K. Sakaguchi, R. Le Bras, C. Bhagavatula, and Y. Choi. WinoGrande: An adversarial winograd schema challenge at scale. Proceedings of the AAAI Conference on Artificial Intelligence, 34(05):8732–8740, Apr. 2020. doi: 10.1609/ aaai.v34i05.6399. URL [https://ojs.aaai.org/index.php/AAAI/article/view/6399.](https://ojs.aaai.org/index.php/AAAI/article/view/6399)

M. Sap, H. Rashkin, D. Chen, R. Le Bras, and Y. Choi. Social IQa: Commonsense reasoning about social interactions. In K. Inui, J. Jiang, V. Ng, and X. Wan, editors, Proceedings of the 2019 Conference on Empirical Methods in Natural Language Processing and the 9th International Joint Conference on Natural Language Processing (EMNLP-IJCNLP), pages 4463–4473, Hong Kong, China, Nov. 2019. Association for Computational Linguistics. doi: 10.18653/v1/D19-1454. URL [https://aclanthology.org/D19-1454.](https://aclanthology.org/D19-1454)

D. Saxton, E. Grefenstette, F. Hill, and P. Kohli. Analysing mathematical reasoning abilities of neural models. arXiv preprint arXiv:1904.01557, 2019.

R. Schaeffer, B. Miranda, and S. Koyejo. Are emergent abilities of large language models a mirage? Advances in neural information processing systems, 36:55565–55581, 2023.

R. Shao, A. Asai, S. Z. Shen, H. Ivison, V. Kishore, J. Zhuo, X. Zhao, M. Park, S. G. Finlayson, D. Sontag, T. Murray, S. Min, P. Dasigi, L. Soldaini, F. Brahman, W. tau Yih, T. Wu, L. Zettlemoyer, Y. Kim, H. Hajishirzi, and P. W. Koh. DR Tulu: Reinforcement learning with evolving rubrics for deep research, 2025a. URL [https://arxiv.org/abs/2511.19399](https://arxiv.org/abs/2511.19399).

R. Shao, S. S. Li, R. Xin, S. Geng, Y. Wang, S. Oh, S. S. Du, N. Lambert, S. Min, R. Krishna, Y. Tsvetkov, H. Hajishirzi, P. W. Koh, and L. Zettlemoyer. Spurious rewards: Rethinking training signals in rlvr, 2025b. URL [https://arxiv.org/abs/2506.10947](https://arxiv.org/abs/2506.10947).

Z. Shao, P. Wang, Q. Zhu, R. Xu, J. Song, X. Bi, H. Zhang, M. Zhang, Y. Li, Y. Wu, et al. Deepseekmath: Pushing the limits of mathematical reasoning in open language models. arXiv preprint arXiv:2402.03300, 2024.

X. Shen, Z. Chen, M. Backes, Y. Shen, and Y. Zhang. " do anything now": Characterizing and evaluating in-the-wild jailbreak prompts on large language models. In Proceedings of the 2024 on ACM SIGSAC Conference on Computer and Communications Security, pages 1671–1685, 2024.

D. Shi, J. Cao, Q. Chen, W. Sun, W. Li, H. Lu, F. Dong, T. Qin, K. Zhu, M. Liu, J. Yang, G. Zhang, J. Liu, C. Zhang, J. Wang, Y. E. Jiang, and W. Zhou. Taskcraft: Automated generation of agentic tasks. ArXiv, abs/2506.10055, 2025. URL [https://api.semanticscholar.org/CorpusID:279318561.](https://api.semanticscholar.org/CorpusID:279318561)

D. Silver, T. Hubert, J. Schrittwieser, I. Antonoglou, M. Lai, A. Guez, M. Lanctot, L. Sifre, D. Kumaran, T. Graepel, et al. Mastering chess and shogi by self-play with a general reinforcement learning algorithm. arXiv preprint arXiv:1712.01815, 2017.

S. Singh, F. Vargus, D. Dsouza, B. F. Karlsson, A. Mahendiran, W.-Y. Ko, H. Shandilya, J. Patel, D. Mataciunas, L. O’Mahony, M. Zhang, R. Hettiarachchi, J. Wilson, M. Machado, L. S. Moura, D. Krzemiński, H. Fadaei, I. Ergün, I. Okoh, A. Alaagib, O. Mudannayake, Z. Alyafeai, V. M. Chien, S. Ruder, S. Guthikonda, E. A. Alghamdi, S. Gehrmann, N. Muennighoff, M. Bartolo, J. Kreutzer, A. Üstün, M. Fadaee, and S. Hooker. Aya dataset: An open-access collection for multilingual instruction tuning. arXiv preprint arXiv:2402.06619, 2024. URL [https://arxiv.org/abs/2402.06619](https://arxiv.org/abs/2402.06619).

<!-- page 80 of 118 -->

M. D. Skarlinski, S. Cox, J. M. Laurent, J. D. Braza, M. Hinks, M. J. Hammerling, M. Ponnapati, S. G. Rodriques, and A. D. White. Language agents achieve superhuman synthesis of scientific knowledge. arXiv preprint arXiv:2409.13740, 2024.

L. Soldaini and K. Lo. peS2o (Pretraining Efficiently on S2ORC) Dataset, 2023. URL [https://github.com/allenai/pes2o](https://github.com/allenai/pes2o).

L. Soldaini, R. Kinney, A. Bhagia, D. Schwenk, D. Atkinson, R. Authur, B. Bogin, K. Chandu, J. Dumas, Y. Elazar, V. Hofmann, A. H. Jha, S. Kumar, L. Lucy, X. Lyu, N. Lambert, I. Magnusson, J. Morrison, N. Muennighoff, A. Naik, C. Nam, M. E. Peters, A. Ravichander, K. Richardson, Z. Shen, E. Strubell, N. Subramani, O. Tafjord, P. Walsh, L. Zettlemoyer, N. A. Smith, H. Hajishirzi, I. Beltagy, D. Groeneveld, J. Dodge, and K. Lo. Dolma: an open corpus of three trillion tokens for language model pretraining research, 2024.

K. Soule and D. Bergmann. IBM Granite 3.3: Speech recognition, refined reasoning, and RAG LoRAs, Apr. 2025. URL [https://www.ibm.com/new/announcements/ibm-granite-3-3-speech-recognition-refined-reasoning-rag-loras.](https://www.ibm.com/new/announcements/ibm-granite-3-3-speech-recognition-refined-reasoning-rag-loras) Blog post.

A. Souly, Q. Lu, D. Bowen, T. Trinh, E. Hsieh, S. Pandey, P. Abbeel, J. Svegliato, S. Emmons, O. Watkins, and S. Toyer. A strongreject for empty jailbreaks. In A. Globerson, L. Mackey, D. Belgrave, A. Fan, U. Paquet, J. Tomczak, and C. Zhang, editors, Advances in Neural Information Processing Systems, volume 37, pages 125416–125440. Curran Associates, Inc., 2024. URL [https://proceedings.neurips.cc/paper\_files/paper/2024/file/e2e06adf560b0706d3b1ddfca9f29756-Paper-Datasets\_and\_Benchmarks\_Track.pdf.](https://proceedings.neurips.cc/paper_files/paper/2024/file/e2e06adf560b0706d3b1ddfca9f29756-Paper-Datasets_and_Benchmarks_Track.pdf)

N. Stiennon, L. Ouyang, J. Wu, D. Ziegler, R. Lowe, C. Voss, A. Radford, D. Amodei, and P. F. Christiano. Learning to summarize with human feedback. Advances in Neural Information Processing Systems, 33:3008–3021, 2020.

D. Su, K. Kong, Y. Lin, J. Jennings, B. Norick, M. Kliegl, M. Patwary, M. Shoeybi, and B. Catanzaro. Nemotron-cc: Transforming common crawl into a refined long-horizon pretraining dataset, 2025a. URL [https://arxiv.org/abs/2412.02595](https://arxiv.org/abs/2412.02595).

J. Su, M. Ahmed, Y. Lu, S. Pan, W. Bo, and Y. Liu. Roformer: Enhanced transformer with rotary position embedding. Neurocomputing, 568:127063, 2024.

Y. Su, D. Yu, L. Song, J. Li, H. Mi, Z. Tu, M. Zhang, and D. Yu. Expanding rl with verifiable rewards across diverse domains. arXiv preprint arXiv:2503.23829, 2025b.

Z. Su, L. Pan, X. Bai, D. Liu, G. Dong, J. Huang, W. Hu, F. Zhang, K. Gai, and G. Zhou. Klear-reasoner: Advancing reasoning capability via gradient-preserving clipping policy optimization. arXiv preprint arXiv:2508.07629, 2025c.

Y. Sun, S. Hu, G. Zhou, K. Zheng, H. Hajishirzi, N. Dziri, and D. X. Song. Omega: Can llms reason outside the box in math? evaluating exploratory, compositional, and transformative generalization. ArXiv, abs/2506.18880, 2025. URL [https://api.semanticscholar.org/CorpusID:280000246.](https://api.semanticscholar.org/CorpusID:280000246)

M. Suzgun, N. Scales, N. Schärli, S. Gehrmann, Y. Tay, H. W. Chung, A. Chowdhery, Q. V. Le, E. H. Chi, D. Zhou, et al. Challenging big-bench tasks and whether chain-of-thought can solve them. arXiv preprint arXiv:2210.09261, 2022.

A. Talmor, J. Herzig, N. Lourie, and J. Berant. CommonsenseQA: A question answering challenge targeting commonsense knowledge. In J. Burstein, C. Doran, and T. Solorio, editors, Proceedings of the 2019 Conference of the North American Chapter of the Association for Computational Linguistics: Human Language Technologies, Volume 1 (Long and Short Papers), pages 4149–4158, Minneapolis, Minnesota, June 2019. Association for Computational Linguistics. doi: 10.18653/v1/N19-1421. URL [https://aclanthology.org/N19-1421.](https://aclanthology.org/N19-1421)

K. Team, Z. Liu, L. Tang, L. Jin, H. Li, N. Ranjan, D. Fan, S. Rohatgi, R. Fan, O. Pangarkar, H. Wang, Z. Cheng, S. Sun, S. Han, B. Tan, G. Gosal, X. Han, V. Pimpalkhute, S. Hao, M. S. Hee, J. Hestness, H. Jia, L. Ma, A. Singh, D. Soboleva, N. Vassilieva, R. Wang, Y. Wu, Y. Sun, T. Killian, A. Moreno, J. Maggs, H. Ren, G. He, H. Wang, X. Ma, Y. Wang, M. Yurochkin, and E. P. Xing. K2-v2: A 360-open, reasoning-enhanced llm, 2025. URL [https://arxiv.org/abs/2512.06201](https://arxiv.org/abs/2512.06201).

Teknium. Openhermes 2.5: An open dataset of synthetic data for generalist llm assistants, 2023. URL [https://huggingface.co/datasets/teknium/OpenHermes-2.5.](https://huggingface.co/datasets/teknium/OpenHermes-2.5)

The Algorithms. The algorithms – python. [https://github.com/TheAlgorithms/Python](https://github.com/TheAlgorithms/Python), 2025. GitHub repository, MIT License.

Together AI. RedPajama: An open source recipe to reproduce LLaMA training dataset, 2023. URL [https://github.com/togethercomputer/RedPajama-Data](https://github.com/togethercomputer/RedPajama-Data).

<!-- page 81 of 118 -->

S. Toshniwal, W. Du, I. Moshkov, B. Kisacanin, A. Ayrapetyan, and I. Gitman. Openmathinstruct-2: Accelerating ai for math with massive open-source instruction data. arXiv preprint arXiv:2410.01560, 2024.

J. Toy, J. MacAdam, and P. Tabor. Metacognition is all you need? using introspection in generative agents to improve goal-directed behavior, 2024. URL [https://arxiv.org/abs/2401.10910.](https://arxiv.org/abs/2401.10910)

H. Van Hasselt, Y. Doron, F. Strub, M. Hessel, N. Sonnerat, and J. Modayil. Deep reinforcement learning and the deadly triad. arXiv preprint arXiv:1812.02648, 2018.

A. Vaswani. Announcing rnj-1: Building instruments of intelligence, Dec. 2025. URL [https://essential.ai/research/rnj-1](https://essential.ai/research/rnj-1). Blog post.

A. Vaswani, N. Shazeer, N. Parmar, J. Uszkoreit, L. Jones, A. N. Gomez, L. u. Kaiser, and I. Polosukhin. Attention is all you need. In I. Guyon, U. V. Luxburg, S. Bengio, H. Wallach, R. Fergus, S. Vishwanathan, and R. Garnett, editors, Advances in Neural Information Processing Systems, volume 30. Curran Associates, Inc., 2017. URL [https://proceedings.neurips.cc/paper\_files/paper/2017/file/3f5ee243547dee91fbd053c1c4a845aa-Paper.pdf.](https://proceedings.neurips.cc/paper_files/paper/2017/file/3f5ee243547dee91fbd053c1c4a845aa-Paper.pdf)

J. Vendrow, E. Vendrow, S. Beery, and A. Madry. Do large language model benchmarks test reliability? arXiv preprint arXiv:2502.03461, 2025.

D. Wadden, K. Shi, J. Morrison, A. Naik, S. Singh, N. Barzilay, K. Lo, T. Hope, L. Soldaini, S. Z. Shen, et al. Sciriff: A resource to enhance language model instruction-following over scientific literature. arXiv preprint arXiv:2406.07835, 2024.

Y. Wang, X. Ma, G. Zhang, Y. Ni, A. Chandra, S. Guo, W. Ren, A. Arulraj, X. He, Z. Jiang, et al. Mmlu-pro: A more robust and challenging multi-task language understanding benchmark. arXiv preprint arXiv:2406.01574, 2024a.

Z. Wang, Y. Dong, O. Delalleau, J. Zeng, G. Shen, D. Egert, J. J. Zhang, M. N. Sreedhar, and O. Kuchaiev. Helpsteer2: Open-source dataset for training top-performing reward models. arXiv preprint arXiv:2406.08673, 2024b.

Z. Wang, F. Zhou, X. Li, and P. Liu. Octothinker: Mid-training incentivizes reinforcement learning scaling. arXiv preprint arXiv:2506.20512, 2025.

J. H. Ward Jr. Hierarchical grouping to optimize an objective function. Journal of the American statistical association, 58(301):236–244, 1963.

J. Wei, M. Bosma, V. Zhao, K. Guu, A. W. Yu, B. Lester, N. Du, A. M. Dai, and Q. V. Le. Finetuned language models are zero-shot learners. In International Conference on Learning Representations, 2021.

J. Wei, Y. Tay, R. Bommasani, C. Raffel, B. Zoph, S. Borgeaud, D. Yogatama, M. Bosma, D. Zhou, D. Metzler, et al. Emergent abilities of large language models. arXiv preprint arXiv:2206.07682, 2022.

J. Wei, N. Karina, H. W. Chung, Y. J. Jiao, S. Papay, A. Glaese, J. Schulman, and W. Fedus. Measuring short-form factuality in large language models. arXiv preprint arXiv:2411.04368, 2024.

J. Welbl, N. F. Liu, and M. Gardner. Crowdsourcing multiple choice science questions. In L. Derczynski, W. Xu, A. Ritter, and T. Baldwin, editors, Proceedings of the 3rd Workshop on Noisy User-generated Text, pages 94–106, Copenhagen, Denmark, Sept. 2017. Association for Computational Linguistics. doi: 10.18653/v1/W17-4413. URL [https://aclanthology.org/W17-4413/](https://aclanthology.org/W17-4413/).

A. Wettig, K. Lo, S. Min, H. Hajishirzi, D. Chen, and L. Soldaini. Organize the web: Constructing domains enhances pre-training data curation, 2025. URL [https://arxiv.org/abs/2502.10341.](https://arxiv.org/abs/2502.10341)

M. Wortsman, G. Ilharco, S. Y. Gadre, R. Roelofs, R. Gontijo-Lopes, A. S. Morcos, H. Namkoong, A. Farhadi, Y. Carmon, S. Kornblith, et al. Model soups: averaging weights of multiple fine-tuned models improves accuracy without increasing inference time. In International conference on machine learning, pages 23965–23998. PMLR, 2022.

J. Wu, W. Yin, Y. Jiang, Z. Wang, Z. Xi, R. Fang, L. Zhang, Y. He, D. Zhou, P. Xie, and F. Huang. WebWalker: Benchmarking LLMs in web traversal. In W. Che, J. Nabende, E. Shutova, and M. T. Pilehvar, editors, Proceedings of the 63rd Annual Meeting of the Association for Computational Linguistics (Volume 1: Long Papers), pages 10290–10305, Vienna, Austria, July 2025a. Association for Computational Linguistics. ISBN 979-8-89176-251-0. doi: 10.18653/v1/2025.acl-long.508. URL [https://aclanthology.org/2025.acl-long.508/.](https://aclanthology.org/2025.acl-long.508/)

L. Wu, D. Zhu, G. Zhao, Z. Yu, J. Ran, X. Wong, L. Sun, and S. Li. LongAttn: Selecting long-context training data via token-level attention, 2025b. URL [https://arxiv.org/abs/2502.16860.](https://arxiv.org/abs/2502.16860)

<!-- page 82 of 118 -->

M. Wu, Z. Zhang, Q. Dong, Z. Xi, J. Zhao, S. Jin, X. Fan, Y. Zhou, H. Lv, M. Zhang, et al. Reasoning or memorization? unreliable results of reinforcement learning due to data contamination. arXiv preprint arXiv:2507.10532, 2025c.

L.-C. Xiaomi, :, B. Xia, B. Shen, Cici, D. Zhu, D. Zhang, G. Wang, H. Zhang, H. Liu, J. Xiao, J. Dong, L. Zhao, P. Li, P. Wang, S. Yu, S. Chen, W. Wang, W. Ma, X. Deng, Y. Huang, Y. Song, Z. Jiang, B. Ye, C. Cai, C. He, D. Zhang, D. Zhang, G. Wang, H. Tian, H. Zhao, H. Qu, H. Xu, J. Shi, K. Bao, K. Fang, K. Zhou, K. Zhou, L. Li, M. Zhu, N. Chen, Q. Wang, S. Liu, S. Li, S. Gu, S. Ren, S. Liu, S. Deng, W. Zhuang, W. Lv, W. Yang, X. Zhang, X. Yong, X. Zhang, X. Song, X. Xu, X. Wang, Y. Yan, Y. Tu, Y. Tian, Y. Wang, Y. Yu, Z. Lin, Z. Song, and Z. Yue. MiMo: Unlocking the reasoning potential of language model – from pretraining to posttraining, 2025. URL [https://arxiv.org/abs/2505.07608](https://arxiv.org/abs/2505.07608).

W. Xiong, J. Liu, I. Molybog, H. Zhang, P. Bhargava, R. Hou, L. Martin, R. Rungta, K. A. Sankararaman, B. Oguz, M. Khabsa, H. Fang, Y. Mehdad, S. Narang, K. Malik, A. Fan, S. Bhosale, S. Edunov, M. Lewis, S. Wang, and H. Ma. Effective long-context scaling of foundation models, 2023. URL [https://arxiv.org/abs/2309.16039.](https://arxiv.org/abs/2309.16039)

A. Yang, A. Li, B. Yang, B. Zhang, B. Hui, B. Zheng, B. Yu, C. Gao, C. Huang, C. Lv, et al. Qwen3 technical report. arXiv preprint arXiv:2505.09388, 2025a.

A. Yang, B. Yu, C. Li, D. Liu, F. Huang, H. Huang, J. Jiang, J. Tu, J. Zhang, J. Zhou, J. Lin, K. Dang, K. Yang, L. Yu, M. Li, M. Sun, Q. Zhu, R. Men, T. He, W. Xu, W. Yin, W. Yu, X. Qiu, X. Ren, X. Yang, Y. Li, Z. Xu, and Z. Zhang. Qwen2.5-1M Technical Report, 2025b. URL [https://arxiv.org/abs/2501.15383.](https://arxiv.org/abs/2501.15383)

Z. Yang, P. Qi, S. Zhang, Y. Bengio, W. W. Cohen, R. Salakhutdinov, and C. D. Manning. Hotpotqa: A dataset for diverse, explainable multi-hop question answering. In Conference on Empirical Methods in Natural Language Processing, 2018. URL [https://api.semanticscholar.org/CorpusID:52822214.](https://api.semanticscholar.org/CorpusID:52822214)

F. Yao, L. Liu, D. Zhang, C. Dong, J. Shang, and J. Gao. Your efficient rl framework secretly brings you off-policy rl training, Aug. 2025. URL [https://fengyao.notion.site/off-policy-rl.](https://fengyao.notion.site/off-policy-rl)

J. Ye, P. Liu, T. Sun, J. Zhan, Y. Zhou, and X. Qiu. Data mixing laws: Optimizing data mixtures by predicting language modeling performance, 2025. URL [https://arxiv.org/abs/2403.16952.](https://arxiv.org/abs/2403.16952)

H. Yen, T. Gao, M. Hou, K. Ding, D. Fleischer, P. Izsak, M. Wasserblat, and D. Chen. HELMET: How to evaluate longcontext models effectively and thoroughly. In The Thirteenth International Conference on Learning Representations, 2025. URL [https://openreview.net/forum?id=293V3bJbmE.](https://openreview.net/forum?id=293V3bJbmE)

A. Young, B. Chen, C. Li, C. Huang, G. Zhang, G. Zhang, H. Li, J. Zhu, J. Chen, J. Chang, et al. Yi: Open foundation models by 01. ai. arXiv preprint arXiv:2403.04652, 2024.

Q. Yu, Z. Zhang, R. Zhu, Y. Yuan, X. Zuo, Y. Yue, W. Dai, T. Fan, G. Liu, L. Liu, et al. Dapo: An open-source llm reinforcement learning system at scale. arXiv preprint arXiv:2503.14476, 2025.

Y. Yue, Z. Chen, R. Lu, A. Zhao, Z. Wang, Y. Yue, S. Song, and G. Huang. Does reinforcement learning really incentivize reasoning capacity in llms beyond the base model? arXiv preprint arXiv:2504.13837, 2025.

R. Zellers, A. Holtzman, Y. Bisk, A. Farhadi, and Y. Choi. HellaSwag: Can a machine really finish your sentence? In A. Korhonen, D. Traum, and L. Màrquez, editors, Proceedings of the 57th Annual Meeting of the Association for Computational Linguistics, pages 4791–4800, Florence, Italy, July 2019. Association for Computational Linguistics. doi: 10.18653/v1/P19-1472. URL [https://aclanthology.org/P19-1472.](https://aclanthology.org/P19-1472)

H. Zeng, J. Yang, Y. Zhang, B. Yu, S. Wang, Z. Liu, M. Sun, and T. Liu. Acecoder: Acing coder rl via automated test-case synthesis. arXiv preprint arXiv:2502.01718, 2025a. URL [https://arxiv.org/abs/2502.01718.](https://arxiv.org/abs/2502.01718)

Z. Zeng, H. Ivison, Y. Wang, L. Yuan, S. S. Li, Z. Ye, S. Li, J. He, R. Zhou, T. Chen, C. Zhao, Y. Tsvetkov, S. S. Du, N. Jaques, H. Peng, P. W. Koh, and H. Hajishirzi. Rlve: Scaling up reinforcement learning for language models with adaptive verifiable environments. arXiv preprint 2511.07317, 2025b.

L. Zha, J. Zhou, L. Li, R. Wang, Q. Huang, S. Yang, J. Yuan, C. Su, X. Li, A. Su, T. Zhang, C. Zhou, K. Shou, M. Wang, W. Zhu, G. Lu, C. Ye, Y. Ye, W. Ye, Y. Zhang, X. Deng, J. Xu, H. Wang, G. Chen, and J. Zhao. Tablegpt: Towards unifying tables, natural language and commands into one gpt. arXiv preprint arXiv:2307.08674, 2023. URL [https://arxiv.org/abs/2307.08674.](https://arxiv.org/abs/2307.08674)

W. Zhao, X. Ren, J. Hessel, C. Cardie, Y. Choi, and Y. Deng. Wildchat: 1m chatgpt interaction logs in the wild. arXiv preprint arXiv:2405.01470, 2024a.

<!-- page 83 of 118 -->

Y. Zhao, A. Gu, R. Varma, L. Luo, C.-C. Huang, M. Xu, L. Wright, H. Shojanazeri, M. Ott, S. Shleifer, A. Desmaison, C. Balioglu, P. Damania, B. Nguyen, G. Chauhan, Y. Hao, A. Mathews, and S. Li. Pytorch fsdp: Experiences on scaling fully sharded data parallel, 2023. URL [https://arxiv.org/abs/2304.11277.](https://arxiv.org/abs/2304.11277)

Y. Zhao, Y. Qu, K. Staniszewski, S. Tworkowski, W. Liu, P. Miłoś, Y. Wu, and P. Minervini. Analysing the impact of sequence composition on language model pre-training. In Proceedings of the 62nd Annual Meeting of the Association for Computational Linguistics (Volume 1: Long Papers), page 7897–7912. Association for Computational Linguistics, 2024b. doi: 10.18653/v1/2024.acl-long.427. URL [http://dx.doi.org/10.18653/v1/2024.acl-long.427.](http://dx.doi.org/10.18653/v1/2024.acl-long.427)

L. Zheng, W.-L. Chiang, Y. Sheng, S. Zhuang, Z. Wu, Y. Zhuang, Z. Lin, Z. Li, D. Li, E. Xing, et al. Judging llm-asa-judge with mt-bench and chatbot arena. Advances in Neural Information Processing Systems, 36:46595–46623, 2023.

W. Zhong, R. Cui, Y. Guo, Y. Liang, S. Lu, Y. Wang, A. Saied, W. Chen, and N. Duan. Agieval: A human-centric benchmark for evaluating foundation models. arXiv preprint arXiv:2304.06364, 2023.

F. Zhou, Z. Wang, N. Ranjan, Z. Cheng, L. Tang, G. He, Z. Liu, and E. P. Xing. Megamath: Pushing the limits of open math corpora. arXiv preprint arXiv:2504.02807, 2025.

J. Zhou, T. Lu, S. Mishra, S. Brahma, S. Basu, Y. Luan, D. Zhou, and L. Hou. Instruction-following evaluation for large language models, 2023. URL [https://arxiv.org/abs/2311.07911.](https://arxiv.org/abs/2311.07911)

T. Y. Zhuo, M. C. Vu, J. Chim, H. Hu, W. Yu, R. Widyasari, I. N. B. Yusuf, H. Zhan, J. He, I. Paul, et al. Bigcodebench: Benchmarking code generation with diverse function calls and complex instructions. arXiv preprint arXiv:2406.15877, 2024.

<!-- page 84 of 118 -->

## A Appendix

### Author Contributions

A successful team project like Olmo 3 would not be possible without the contributions of many teammates. We indicate each authors’ main contributing role(s) in Olmo 3, while recognizing that project impact was driven by fluid contributions across formal team boundaries. Authors are listed in alphabetical order:

• For model architecture, infrastructure, and training methodology: Akshita Bhagia, Aman Rangapur, Amanda Bertsch, David Heineman, Dirk Groeneveld, Dustin Schwenk, Kyle Lo, Luca Soldaini, Mayee Chen, Pete Walsh, Shane Arora, Tyler Murray, Tyler Romero, Will Merrill

• For post-training infrastructure and training methodology: Costa Huang, Faeze Brahman, Finbarr Timbers, Hamish Ivison, Jacob Morrison, Michael Noukhovitch, Nathan Lambert, Pradeep Dasigi, Saurabh Shah, Scott Geng, Shannon Zejiang Shen, Shashank Gupta, Teng Xiao, Tyler Romero, Valentina Pyatkin, Victoria Graf

• For base model data acquisition: Chloe Anastasiades, David Graham, Dustin Schwenk, Jake Poznanski, Jaron Lochner, Kyle Lo, Luca Soldaini, Matt Jordan, Robert Berry, Tyler Murray

• For data curation infrastructure and experimentation: Alexander Wettig, Allyson Ettinger, Amanda Bertsch, Bailey Kuehl, David Heineman, Ian Magnusson, Jake Poznanski, Jiacheng Liu, Kyle Lo, Luca Soldaini, Matt Jordan, Mayee Chen, Tyler Murray, Tyler Romero

• For evaluation methodology and infrastructure: Akari Asai, Alexander Wettig, David Heineman, Dustin Schwenk, Hamish Ivison, Harsh Trivedi, Ian Magnusson, Kyle Lo, Luca Soldaini, Maarten Sap, Malia Morgan, Pradeep Dasigi, Regan Huff, Robert Berry, Ronan Le Bras, Rulin Shao, Saumya Malik, Saurabh Shah, Shannon Zejiang Shen, Shashank Gupta, Tyler Murray, Victoria Graf, Yuling Gu

• For mid- and post-training data curation and experimentation: Akari Asai, Alisa Liu, Allyson Ettinger, David Graham, David Heineman, Faeze Brahman, Hamish Ivison, Harsh Trivedi, Jacob Morrison, Kyle Lo, Lester James V. Miranda, Luca Soldaini, Matt Jordan, Michael Noukhovitch, Nathan Lambert, Pradeep Dasigi, Rui Xin, Saurabh Shah, Scott Geng, Saumya Malik, Shashank Gupta, Shuyue Stella Li, Teng Xiao, Valentina Pyatkin, Victoria Graf, Yapei Chang, Zhiyuan Zeng

• For compute infrastructure setup and support: Michael Schmitz, Michael Wilson, Michal Guerquin, Sam Skjonsberg, Tucker Wilde

• For mentorship, advising, program management, and broader strategy: Ali Farhadi, Ashish Sabharwal, Hannaneh Hajishirzi, Luke Zettlemoyer, Noah A. Smith, Pang Wei Koh, Taira Anderson

• For technical leadership and cross-workstream contributions: Hannaneh Hajishirzi, Kyle Lo, Luca Soldaini, Nathan Lambert, Pradeep Dasigi

Authorship for this work was determined by those making direct contributions to the Olmo 3 models, related artifacts, and their release. Core contributors are recognized for their sustained, significant contributions critical to the success of the Olmo 3 project.

### Acknowledgments

This research used resources of the Oak Ridge Leadership Computing Facility, which is a DOE Office of Science User Facility supported under Contract DE-AC05-00OR22725. We acknowledge the National Artificial Intelligence Research Resource (NAIRR) Pilot and Microsoft Azure for contributing to the results in this work. We are grateful for feedback throughout our development process from the open source language model developer community, especially those from Common Pile/Comma, SmolLM3, Marin, Apertus and Gaperon.

### A.1 Base Model Additional Training Details

Table 34 summarizes modeling configuration for Olmo 3 7B and Olmo 3 32B. Table 35 provides overview of training hyperparameters during the three stages of base model development: pretraining, midtraining, and long-context extension. Table 34 describes parallelism configuration for the stages, and lists measured

<!-- page 85 of 118 -->

throughput in tokens per second (TPS) for each. Finally, Figure 28 shows training cross entropy loss and gradient norm for Olmo 3 Base 7B and 32B during the pretraining stage.

| Layers | 32 / 64 | Gradient clipping | 1.0 |
| --- | --- | --- | --- |
| Hidden size ($d_{model}$) | 4096 / 5120 | Z-loss weight | $10^{-5}$ |
| Q heads | 32 / 40 | Weight decay on embeddings | No |
| KV heads | 32 / 8 | Sliding window attention | 3/4 of layers; 4,096 tokens |
| Activation | SwiGLU | RoPE scaling | YaRN on full attn. layers |
| QKV normalization | QK-Norm | RoPE θ | $5 \cdot 10^{5}$ |
| Layer norm | RMSNorm | Layer norm applied to | Outputs |

Table 33 Model architecture for Olmo 3 7B and Olmo 3 32B. The 7B model uses multi-head attention, while the 32B model uses grouped-query attention (Ainslie et al., 2023) for increased efficiency.

| Olmo 3 Base 7B | Pretraining | Midtraining | Long-context ext |
| --- | --- | --- | --- |
| DP-rep | 64 | 16 | 32 |
| DP-shard | 8 | 8 | - |
| CP | - | - | 8 |
| Num devices | 512 | 128 | 256 |
| Throughput (TPS/device) | 7.7K | 8.5K | 4.0K |
| Olmo 3 Base 32B | Pretraining | Midtraining | Long-context ext |
| DP-rep | 16 | 8 | 16 |
| DP-shard | 64 | 64 | 8 |
| CP | - | - | 8 |
| Num devices | 1024 | 512 | 1024 |
| Throughput (TPS/device) | 2.0K | 2.0K | 1.3K |

Table 34 Training configuration and throughput for Olmo 3 Base models across different training stages. DP-shard refers to the sharding dimension for Hybrid-Sharded Data Parallelism (HSDP) (Zhao et al., 2023), DP-rep refers to the replication dimension, and CP refers to Llama3-style context parallelism (Chu et al., 2025). We train on a cluster containing 8× NVIDIA H100 (80GB HBM3) nodes, connected via TCPXO (200 Gbps/GPU). Throughput numbers reflect the end of each phase, as, in some cases, we made improvements while the runs were ongoing.

<!-- page 86 of 118 -->

| Olmo 3 Base 7B | Pretraining | Midtraining | Long-context ext |
| --- | --- | --- | --- |
| Learning Rate Schedule | Modified cosine (see Figure 3) | Linear decay | Linear decay |
| LR warmup from 0 | 2000 steps-4 | 0 steps-4 | 200 steps-4 |
| Peak LR | 3.0 × 10 | 2.074 × 10 | 2.074 × 10 |
| Final LR | -53.0 × 10 | 0 | 0 |
| Batch size (# instances) | 512 | 256 | 64 |
| Sequence length | 8,192 | 8,192 | 65,536 |
| Batch size (# tokens) | 4,194,304 | 2,097,152 | 4,194,304 |
| Total training tokens | 5.93T | 100B | 50B |
| Peak training temperature (LbRsz2 ) | 2.146 × 10-1<sup>4</sup> | 2.051 × 10-14 | 1.026 × 10-14 |
| Olmo 3 Base 32B | Pretraining | Midtraining | Long-context ext |
| Learning rate schedule | 5.93T cosine trunc. at 5.5T tokens | Linear decay | Linear decay |
| LR warmup from 0 | 2000 steps-4 | 0 steps-4 | 200 steps-4 |
| Peak LR | 6.0 × 10 | 2.071 × 10 | 2.071 × 10 |
| Final LR | -56.0 × 10 | 0 | 0 |
| Batch size (# instances) | 1,024 | 512 | 128 |
| Sequence length | 8,192 | 8,192 | 65,536 |
| Batch size (# tokens) | 8,388,608 | 4,194,304 | 8,388,608 |
| Total training tokens | 5.5T | 100B (twice) | 100B |
| Peak training temperature (LbRsz2 ) | 4.292 × 10-14 | 1.023 × 10-14 | 5.113 × 10-1<sup>5</sup> |

Table 35 Training hyperparameters for each stage of Olmo 3 Base 7B and 32B. Compared to the 7B, for the 32B we use a cosine learning rate schedule (truncated early at 5.5T tokens), double the batch size in all steps, run midtraining twice (with different data order seeds, and average model weights of resulting checkpoints), and increase the long-context extension stage from 50B to 100B tokens.

![Chart block](images/p86-chart.png)

![Chart block](images/p86-chart-2.png)

![Chart block](images/p86-chart-3.png)

![Chart block](images/p86-figure-28-cross-entropy-loss-and-total-gradient-norm.png)

Figure 28 Cross-entropy loss and total gradient norm during pretraining for Olmo 3 Base 7B (top) and 32B (bottom). For readability, gradient norm plots were produced using an exponential moving average with a window size of 20 steps.

<!-- page 87 of 118 -->

### A.2 Base Model Additional Data Details: Pretraining

#### A.2.1 CommonCrawl

The majority of our pretraining corpus comes from CommonCrawl (Common Crawl Foundation). We start with 104 dumps, starting with CC-MAIN-2013-20 and ending with CC-MAIN-2024-51, roughly covering dates from mid-2013 until late 2024. We linearize the WET files provided by Commoncrawl using Resiliparse, yielding an initial pool composed of 252.6B documents.

我们预训练语料的大部分来自 CommonCrawl (Common Crawl Foundation). 我们从 104 个 dump 开始, 从 CC-MAIN-2013-20 到 CC-MAIN-2024-51, 大致覆盖 2013 年中至 2024 年底. 我们用 Resiliparse 对 CommonCrawl 提供的 WET 文件做线性化, 得到由 2526 亿份文档组成的初始池.

Next we apply a pipeline of heuristic filtering steps to further prune down the dataset to a size amenable for pretraining. Our steps essentially follow those of DCLM (Li et al., 2024a), with a few small differences. We start with URL-based filtering, identifying and removing documents that have URLs containing banned words or subwords from the blacklists used by FineWeb (Penedo et al., 2024) and RefinedWeb (Penedo et al., 2023). This step removes roughly 1% of the data pool. Then we apply the DCLM collection of heuristic filters, roughly targeting and removing: i) very short documents, ii) very long documents, iii) documents with not enough alphanumeric characters, and iv) documents with large amounts of internal repetition. Next, we modify and remove any lines or paragraphs in each document that have i) too many numeric characters or ii) any boilerplate phrases such as "items in cart" or "read more...", and then we fully remove any documents that have been obliterated by these line-specific removals. We then apply a FastText English language filter, mirroring DCLM and using a threshold of 0.65 to identify documents as containing English text. Finally, we apply a subset of the rules for identifying questionable sentences from MADLAD-400 (Kudugunta et al., 2023). Ablation tests show that only rules 2 and 5 from MADLAD improve dataset quality, targeting sentences that have a large number of capitalized words or contain a "cursed regex". If the number of sentences in the document is less than 5 or if at least 20% of sentences are questionable, we remove the document from the corpus.

随后, 我们应用一串启发式过滤步骤, 把数据集进一步裁剪到适合预训练的规模. 我们的步骤基本沿用 DCLM (Li et al., 2024a), 仅有少数小的差异. 先做基于 URL 的过滤, 识别并移除 URL 含有 FineWeb (Penedo et al., 2024) 与 RefinedWeb (Penedo et al., 2023) 所用黑名单中的禁用词或子词的文档, 这一步约移除数据池的 1%. 然后应用 DCLM 的启发式过滤器集合, 大致定位并移除: i) 过短的文档, ii) 过长的文档, iii) 字母数字字符不足的文档, iv) 内部重复量大的文档. 接着修改或移除每份文档中行或段落里 i) 数字字符过多, 或 ii) 含有 "items in cart" "read more..." 这类样板短语的行; 若文档被这种行级删除整段毁掉, 则整个移除. 之后应用 FastText 英文语言过滤器, 对齐 DCLM, 以 0.65 为阈值判定文档是否含英文. 最后应用 MADLAD-400 (Kudugunta et al., 2023) 中识别可疑句子规则的一个子集. 消融测试表明, MADLAD 中只有规则 2 与规则 5 能提升数据集质量, 分别针对含大量大写单词的句子与命中 "cursed regex" 的句子. 若文档中句子数少于 5, 或至少 20% 的句子可疑, 就把该文档从语料中移除.

Overall, the heuristic steps remove 76% of the total pool, and the English filtering step removes an additional 2.5% of the pool. This leaves a pool of 38.7B documents, attaining a survival rate of 15.1%. While each of these described steps is incorporated into the DCLM processing pipeline, we note that these heuristic filters are commutative and that the English filtering is the slowest step, so efficiency gains can be attained by putting the language-filtering step at the end. We spent a total of 1030 i4i.32xlarge EC2 hours in this step, incurring a cost of approximately \$11,300. An exact breakdown of how much time was spent in each step is provided in Table 36.

总体而言, 启发式步骤移除了总池的 76%, 英文过滤步骤又额外移除了 2.5%. 最终剩下 387 亿份文档, 存活率 15.1%. 虽然上述每一步都已纳入 DCLM 处理流水线, 但我们注意到这些启发式过滤器彼此可交换, 而英文过滤是最慢的一步, 因此把语言过滤放在最后可以获得效率收益. 这一步我们总共花费了 1030 个 i4i.32xlarge EC2 小时, 成本约 \$11,300. 各步骤耗时的精确分解见表 36.

| Pipeline Step | Docs Removed (B) | % of pool removed | % of total time |
| --- | --- | --- | --- |
| URL Filters | 2.3 | 0.9 | 1.68 |
| Length Filters | 103.4 | 40.42 | 8.03 |
| Symbol Filters | 56.5 | 22.1 | 4.13 |
| Internal Repetition | 32.1 | 12.53 | 31.41 |
| Line Modifiers | 7.1 | 2.79 | 10.0 |
| English Filter | 6.2 | 2.44 | 14.3 |
| MadLad Filters | 9.3 | 3.65 | 5.87 |
| Quality Classifiers | 0.0 | 0.0 | 24.58 |

Table 36 Web data processing step cost and removal breakdown during the heuristic processing steps. We started with 252.6B documents and ended with 38.7B documents for a total removal rate of 84.9%. This procedure took, in aggregate, approximately 1,030 hours on i4i.32xlarge EC2 instances.

#### A.2.2 Deduplication

As described in the main paper, we apply a three-stage deduplication pipeline to our dataset, with each stage targeting progressively more nuanced forms of redundancy: (i) global exact deduplication based on document content hashes to remove identical copies, (ii) 32-way sharded MinHash deduplication with exact Jaccard similarity verification to remove near-duplicate documents, and (iii) 56-way sharded fuzzy suffix array deduplication to eliminate repeated boilerplate text. We note that while applying exact deduplication

<!-- page 88 of 118 -->

before MinHash deduplication is technically redundant, exact deduplication is substantially more efficient computationally; hence this two-pass approach is much faster overall. For the exact and MinHash deduplication stages, we utilize the Duplodocus tool,<sup>59</sup> and for the suffix array deduplication stage, we employ bsade.

如主文所述, 我们对数据集应用三阶段去重流水线, 每个阶段针对渐进更细致的冗余形式: (i) 基于文档内容哈希的全局精确去重, 移除完全相同的副本; (ii) 32 路分片的 MinHash 去重, 带精确的 Jaccard 相似度验证, 移除近似重复文档; (iii) 56 路分片的模糊后缀数组去重, 消除重复的样板文本. 我们注意到, 在 MinHash 去重之前先做精确去重, 从技术上讲是冗余的, 但精确去重计算效率显著更高, 因此两遍做法总体上快得多. 精确去重与 MinHash 去重阶段我们使用 Duplodocus 工具,<sup>59</sup> 后缀数组去重阶段使用 bsade.

**Exact Deduplication** We perform exact deduplication in two sequential passes. During the heuristic filtration pipeline, we annotate each document with a 128-bit hash computed from the document text. We then apply an initial deduplication step to each of the 104 processed CommonCrawl dumps individually, arbitrarily retaining one copy of each document per dump. This within-dump deduplication removes 24% of the surviving document pool.

**精确去重** 我们按顺序做两遍精确去重. 在启发式过滤流水线中, 我们为每份文档标注一个由文档文本算出的 128 位哈希. 然后对 104 个处理过的 CommonCrawl dump 各自单独做一遍初步去重, 每个 dump 内每种文档任意保留一份. 这种 dump 内去重移除了存活文档池的 24%.

Following this, we aggregate all documents globally and perform a second exact deduplication pass across the entire corpus, again arbitrarily keeping one copy of each document. This global pass removes an additional 43% of the surviving pool. In total, exact deduplication eliminates 66% of the input documents, reducing the corpus to 12.7 billion documents for subsequent MinHash processing.

随后, 我们把所有文档汇总到全局, 在整个语料上做第二遍精确去重, 同样每种文档任意保留一份. 这一全局遍次又移除了存活池的 43%. 精确去重合计消除了输入文档的 66%, 语料降至 127 亿份文档, 供后续 MinHash 处理.

**MinHash Fuzzydeduplication** We partition the 12.7 billion document corpus resulting from exact deduplication into 32 shards of approximately equal size and perform MinHash deduplication independently on each shard. Our MinHash procedure broadly follows the approach outlined in (Lee et al., 2022). We tokenize documents using the p50k tokenizer and construct sets of 5-gram token sequences. We then apply a MinHash localitysensitive hashing scheme with 26 bands of size 11, configured to target a Jaccard similarity threshold of 0.80.

**MinHash 模糊去重** 我们把精确去重得到的 127 亿份文档语料切成 32 个大小相近的分片, 在每个分片上独立做 MinHash 去重. 我们的 MinHash 流程大体遵循 (Lee et al., 2022) 概述的方法. 我们用 p50k tokenizer 对文档做分词, 构造 5-gram token 序列的集合, 再应用 MinHash 局部敏感哈希方案, 取 26 个 band, 每个 band 大小 11, 目标是 Jaccard 相似度阈值 0.80.

For any pair of documents that share at least one matching bucket, we treat them as connected by an edge in graph-theoretic terms. We construct a graph from the union of all such edges and identify connected components within this graph. Each document in a connected component is then annotated with a unique identifier for that component.

任何一对共享至少一个匹配桶的文档, 我们在图论意义下视为由一条边相连. 由所有这些边的并集构图, 并在图中识别连通分量, 再为同一连通分量中的每份文档标注该分量的唯一标识符.

In a second verification phase, we explicitly compute pairwise Jaccard similarities within each MinHashidentified cluster to eliminate false positives. For this verification, we use 3-gram token sequences. Our approach varies based on cluster size: for connected components containing 500 or more documents, we apply a more stringent MinHash configuration using 200 bands of size 31; for components with fewer than 500 documents, we perform exhaustive pairwise Jaccard similarity checks and generate final duplicate clusters from these results.

在第二个验证阶段, 我们在每个 MinHash 识别出的簇内显式计算两两 Jaccard 相似度, 以消除假阳性. 验证时使用 3-gram token 序列. 具体做法随簇大小而变: 对含 500 份及以上文档的连通分量, 使用更严格的 MinHash 配置 (200 个 band, 每个 band 大小 31); 对小于 500 份文档的分量, 做穷举式两两 Jaccard 相似度检查, 并据此生成最终的重复簇.

After annotating all documents according to their true Jaccard similarity with other documents in the corpus, we retain only the most recent version of each document based on crawl date, removing all earlier duplicates. This complete MinHash deduplication procedure eliminates 24% of the input documents, leaving 9.8 billion documents in the pool.

在按文档与语料中其他文档的真实 Jaccard 相似度完成标注后, 我们仅按爬取日期保留每份文档的最新版本, 移除所有更早的重复. 完整的 MinHash 去重流程消除了输入文档的 24%, 池中剩余 98 亿份文档.

**Suffix Array deduplication** In the final deduplication stage, we employ suffix arrays to identify and remove substrings that appear repeatedly throughout the dataset. We partition the 9.8 billion document corpus into 56 shards of roughly equal size and run suffix array deduplication independently on each shard.

**后缀数组去重** 在最后的去重阶段, 我们使用后缀数组来识别并移除在整个数据集中反复出现的子串. 把 98 亿份文档的语料切成 56 个大小相近的分片, 在每个分片上独立运行后缀数组去重.

For each shard, we construct a suffix array and identify every byte sequence of length 500 or greater that appears at least twice in the shard. We then apply a novel “fuzzy suffix array” removal strategy that considers contiguous text spans within each document. Specifically, if a text span is bounded on both sides by 500- byte sequences that appear multiple times in the suffix array, and at least 80% of the span is covered by such repeated sequences, we remove the entire span. This strategy targets cases where naive suffix array deduplication would leave short, unique fragments interspersed between removed substrings. For text that does not meet this bookended criterion, we remove all individual occurrences of repeated 500-byte sequences.

对每个分片, 我们构造后缀数组, 找出片中所有出现至少两次且长度不小于 500 字节的字节序列. 然后我们应用一种新颖的 "模糊后缀数组" 移除策略, 考察每份文档内的连续文本段: 若一个文本段两侧都由在后缀数组中多次出现的 500 字节序列所夹, 且该段至少 80% 被这类重复序列覆盖, 则整段移除. 该策略针对的是朴素后缀数组去重会在被移除子串之间留下零散短碎片的情形. 对不满足这种两侧夹逼条件的文本, 我们移除所有重复 500 字节序列的单个出现.

After these three rounds of deduplication—exact, MinHash, and suffix array—we arrive at a final corpus of 9.7 billion documents.

经过精确去重, MinHash 去重与后缀数组去重这三轮处理, 最终得到 97 亿份文档的语料.

<!-- page 89 of 118 -->

<table><tr><td>Category</td><td>F1</td><td>Prec.</td><td>Rec.</td><td>Category</td><td>F1</td><td>Prec.</td><td>Rec.</td></tr><tr><td>Finance and Business</td><td>0.755</td><td>0.758</td><td>0.751</td><td>Travel and Tourism</td><td>0.781</td><td>0.780</td><td>0.782</td></tr><tr><td>Home and Hobbies</td><td>0.748</td><td>0.704</td><td>0.797</td><td>Crime and Law</td><td>0.735</td><td>0.747</td><td>0.724</td></tr><tr><td>Entertainment</td><td>0.801</td><td>0.773</td><td>0.832</td><td>Software</td><td>0.666</td><td>0.696</td><td>0.639</td></tr><tr><td>Sports and Fitness</td><td>0.870</td><td>0.850</td><td>0.890</td><td>Literature</td><td>0.759</td><td>0.801</td><td>0.721</td></tr><tr><td>Politics</td><td>0.788</td><td>0.786</td><td>0.790</td><td>Games</td><td>0.823</td><td>0.867</td><td>0.783</td></tr><tr><td>Health</td><td>0.822</td><td>0.824</td><td>0.820</td><td>Transportation</td><td>0.777</td><td>0.786</td><td>0.768</td></tr><tr><td>Education and Jobs</td><td>0.706</td><td>0.789</td><td>0.638</td><td>Religion</td><td>0.808</td><td>0.833</td><td>0.785</td></tr><tr><td>Science, Math and Technology</td><td>0.679</td><td>0.665</td><td>0.693</td><td>Electronics and Hardware</td><td>0.743</td><td>0.730</td><td>0.757</td></tr><tr><td>Social Life</td><td>0.628</td><td>0.609</td><td>0.649</td><td>Software Development</td><td>0.687</td><td>0.613</td><td>0.781</td></tr><tr><td>Fashion and Beauty</td><td>0.845</td><td>0.845</td><td>0.845</td><td>Industrial</td><td>0.710</td><td>0.691</td><td>0.731</td></tr><tr><td>Food and Dining</td><td>0.878</td><td>0.860</td><td>0.896</td><td>History and Geography</td><td>0.630</td><td>0.698</td><td>0.574</td></tr><tr><td>Art and Design</td><td>0.670</td><td>0.668</td><td>0.672</td><td>Adult Content</td><td>0.700</td><td>0.894</td><td>0.575</td></tr><tr><td colspan="8">Overall (N=20,000): Precision = 0.762, Recall = 0.762</td></tr></table>

Table 37 Performance of FastText classifier distilled from WebOrganizer topic labels on the held out sample of 20,000 documents used in the original WebOrganizer paper.

#### A.2.3 Topic Classification

After strict rounds of deduplication, we partition our data according to topic using the 24 topic categories introduced in WebOrganizer (Wettig et al., 2025). Rather than using the 140M parameter topic classifier used by WebOrganizer, we train a FastText classifier<sup>61</sup> to support cost-effective topic classification at scale. To train this classifier, we use the Llama-labeled training data used to train the original WebOrganizer category as well as an extra 506,746 examples with topics labeled by a combination of gpt-4.1 and o4-mini. The performance of this classifier is outlined in Table 37.

在多轮严格去重之后, 我们按主题划分数据, 使用 WebOrganizer (Wettig et al., 2025) 引入的 24 个主题类别. 我们不使用 WebOrganizer 所用的 1.4 亿参数主题分类器, 而是训练一个 FastText 分类器<sup>61</sup>, 以支持规模化且成本可控的主题分类. 训练该分类器时, 我们既使用训练原始 WebOrganizer 类别所用的 Llama 标注训练数据, 又额外加入 506,746 个由 gpt-4.1 与 o4-mini 组合标注主题的样例. 该分类器的性能见表 37.

#### A.2.4 CommonCrawl Mixing

We perform a hierarchical mixing procedure on our data. Our procedure Olmix (Chen et al., 2026) generates prescriptions for which percentage of the training mix should come from each topic or source, but offers no guidance on the quality composition within each topic. While prior works, such as DCLM (Li et al., 2024a) use a quality classifier to flatly filter data as high-quality or not, we take a more fine-grained approach and perform selective up and down-sampling within each WebOrganizer topic depending on the quality signal. This section formalizes the search procedure we use to generate these upsampling curves.

我们对数据执行层级化的混合流程. 我们的流程 Olmix (Chen et al., 2026) 会生成配方, 规定训练混合数据中每个主题或来源应占的百分比, 但不指导同一主题内部的质量构成. 以往的工作 (如 DCLM (Li et al., 2024a)) 用质量分类器把数据一刀切地过滤为高质量或不是, 我们则采取更细粒度的做法: 按质量信号在每个 WebOrganizer 主题内做选择性的上采样与下采样. 本节把我们用于生成这些上采样曲线的搜索过程形式化.

**Problem formulation** We discuss this procedure in more general terms: consider a category with X tokens, partitioned into Q strictly ordered quality buckets, where the $q ^ { ^ { t h } }$ bucket contains $X _ { q }$ tokens. Further assume that Olmix prescribes that Z tokens be taken from this category, and that at no point do we want to upsample any quality bucket more than M times. This equates to a search problem, where we need to take $Z _ { q }$ tokens from the $q ^ { ^ { t h } }$ bucket such that $\textstyle \sum _ { q } Z _ { q } = Z$ and ∀q, $Z _ { q } / X _ { q } \leq M$

**问题形式化** 我们用更一般的术语描述该过程: 设某类别共有 X 个 token, 被划分为 Q 个严格有序的质量桶, 第 $q$ 个桶含 $X _ { q }$ 个 token. 再设 Olmix 规定从该类别取 Z 个 token, 且任何质量桶的上采样倍数都不超过 M. 这就等价于一个搜索问题: 从第 $q$ 个桶取 $Z _ { q }$ 个 token, 使 $\textstyle \sum _ { q } Z _ { q } = Z$ 且 ∀q 有 $Z _ { q } / X _ { q } \leq M$

**Parameterizing the solution space** To reduce the dimensionality of this search space, we make a modeling choice, where we search over a family of functions that control the upsampling ratio that meets the following criteria:

**解空间的参数化** 为降低搜索空间的维度, 我们做一个建模选择: 在一族控制上采样比例的函数上搜索, 该函数族需满足以下标准:

• Every function in the family is convex and monotonic.

• The functions are defined on the interval [0, 1], which can be normalized to the token counts later.

<small><span class="docvortex-page-footnote" data-block-type="page_footnote" style="color:#6b7280">59<a href="https://github.com/allenai/duplodocus"><sub>github</sub>.com/allenai/duplodocus</a></span></small>

<small><span class="docvortex-page-footnote" data-block-type="page_footnote" style="color:#6b7280">60<a href="https://github.com/liujch1998/bsade/"><sub>github</sub>.com/liujch1998/bsade</a></span></small>

<small><span class="docvortex-page-footnote" data-block-type="page_footnote" style="color:#6b7280">61<a href="https://huggingface.co/allenai/dolma3-fasttext-weborganizer-topic-classifier"><sub>huggingface</sub>.co/allenai/dolma3-fasttext-weborganizer-topic-classifier</a></span></small>

<!-- page 90 of 118 -->

• We are able to control the integral such that $\int_{0}^{1} f(x)   dx = Z / X.$

• We can control the maximum average value of any one bucket. Suppose the $q ^ { t h }$ bucket of data is arranged on the x-axis from $[ a , b ]$ , then the maximum upsampling constraint correlates to the inequality $\begin{array} { r } { \frac { 1 } { b - a } \int _ { a } ^ { b } f ( x ) d x \leq M } \end{array}$

• We have the option to filter out the lowest quality buckets, i.e. $\int_{0}^{a} f(x)   dx = 0$

One such family of functions that meets these criteria is the family of truncated power-exponential functions:

满足这些标准的一个函数族是截断幂指数函数族:

$$
f _ {p, \lambda} (x) = \left\{ \begin{array}{l l} 0, & \text {for} x <   a \\ C (x - a) ^ {p} \cdot e ^ {\lambda (x - a)}, & \text {for} x \geq a \end{array} \right.
$$

Specifically, this becomes a feasibility problem for each topic of the data, where we search over parameters $p , \lambda , C$ such that the constraints

具体而言, 对数据的每个主题这都变成一个可行性问题: 在参数 $p , \lambda , C$ 上搜索, 使下列约束得到满足:

• (Token yield is satisfied) $\textstyle \int _ { 0 } ^ { 1 } f _ { p , \lambda } ( x ) d x = Z / X$

• (Maximum upsampling ratio is honored) $\textstyle \frac { 1 } { b } \int _ { 1 - b } ^ { 1 } f _ { p , \lambda } ( x ) d x \leq M .$

• (Function is monotonic) $\lambda \geq 0 .$

are satisfied. The maximum upsampling constraint has been simplified such that, assuming monotonicity, the most upsampled quality bucket would be the highest-quality one, with an assumed data proportion of b.

上述约束即要求被满足. 最大上采样约束做了简化: 在单调性假设下, 被上采样最多的质量桶是质量最高的桶, 其数据占比记为 b.

**Implementation details** For each WebOrganizer topic, we set the maximum upsampling ration to be $M = 7$ and also throw away the bottom 40% in terms of quality, $\it { a } = 0 . 4 0$ . Then we numerically solve for feasible $p , \lambda , C .$ . If the $q ^ { t h }$ quality bucket spans from the $q ^ { - }$ percentile to the $q ^ { + }$ percentile of the data, then the upsampling ratio for this bucket of data should be $\frac{1}{q^{+}-q^{-}}\int_{q^{-}}^{q^{+}}f(x)dx$

**实现细节** 对每个 WebOrganizer 主题, 我们设最大上采样比例 $M = 7$, 并丢弃质量垫底的 40%, 即 $\it { a } = 0 . 4 0$. 然后数值求解可行的 $p , \lambda , C$. 若第 $q$ 个质量桶覆盖从数据的第 $q ^ { - }$ 百分位到第 $q ^ { + }$ 百分位, 则该桶数据的上采样比例应为 $\frac{1}{q^{+}-q^{-}}\int_{q^{-}}^{q^{+}}f(x)dx$

#### A.2.5 Validating Quality Upsampling and Mixing

We validate our quality upsampling curves and mixing methodology both individually and jointly using small-scale 1B parameter models trained on 100B tokens. Our validation consists of three experiments:

我们用 100B token 上训练的小规模 1B 参数模型, 分别单独地与联合地验证质量上采样曲线与混合方法. 验证由三个实验组成:

**Targeted mixing** We first verify that our mixing methodology can successfully optimize for specific prediction targets. Using our swarm optimization procedure, we create mixes optimized for three different objectives: the QA average, Math average, and Code average from OlmoBaseEval. We compare these targeted mixes against both the natural data distribution and the final Olmo 3 mix. Table 38 demonstrates that our swarm optimization successfully adapts the data distribution to match specific capability targets. While the final OlmoBaseEval mix exhibits slightly higher (worse) BPB scores than task-specific mixes due to necessary trade-offs across multiple objectives, it substantially outperforms the natural distribution.

**针对性混合** 我们先验证混合方法能否成功面向特定的预测目标做优化. 用我们的群体优化流程, 分别针对三个不同目标构造混合: OlmoBaseEval 的 QA 平均, 数学平均与代码平均. 我们将这些针对性混合与自然数据分布及最终 Olmo 3 混合对比. 表 38 表明, 群体优化能成功调整数据分布以匹配特定的能力目标. 最终 OlmoBaseEval 混合由于必须在多个目标间折中, BPB 分数比任务专用混合略高 (略差), 但大幅优于自然分布.

**Quality-aware upsampling** Next, we demonstrate that quality-aware upsampling outperforms naive qualitybased filtering. To simulate a data-constrained 4.51T token training run, we compare different data selection strategies in Table 39. For the filtering baselines, we select the top percentiles from our vigintile quality buckets and match the resulting repetition factor that would occur when training on 100B tokens drawn from a theoretical 4.51T pool. For the upsampling approach, we apply the same methodology but set the target pool size to 100B tokens directly. Our results show that quality-aware upsampling consistently outperforms flat filtering across all repetition factors.

**质量感知上采样** 随后的实验表明, 质量感知上采样优于朴素的质量过滤. 为模拟受数据限制的 4.51T token 训练, 我们在表 39 中比较不同的数据选择策略. 过滤基线: 从 20 分位的质量桶中选取最高的若干百分位, 并匹配 "从理论 4.51T 池中抽 100B token 训练" 时会出现的重复因子. 上采样做法: 沿用同一套方法, 但直接把目标池大小设为 100B token. 结果表明, 质量感知上采样在所有重复因子下都稳定优于一刀切过滤.

**Reconciling upsampling and mixing** Finally, we evaluate how to best combine our mixing and upsampling methodologies, which address complementary aspects of data selection. Data mixing determines the distribution across topics, while quality upsampling determines the distribution within a single source. To conceptualize this, imagine the dataset as a two-dimensional matrix of buckets where rows represent WebOrganizer topics and columns represent the quality buckets. Then the mixing strategy can be thought of as imposing row-wise

<!-- page 91 of 118 -->

|  | QA<sub>Easy</sub> | Math<sub>Easy</sub> | Code<sub>Easy</sub> |
| --- | --- | --- | --- |
| Natural Distribution | 1.017 | 0.719 | 0.592 |
| QA-heavy Mix | 0.972 | 0.643 | 0.535 |
| Math-heavy Mix | 0.979 | 0.586 | 0.497 |
| Code-heavy Mix | 0.986 | 0.619 | 0.481 |
| Olmix | 0.995 | 0.617 | 0.489 |

|  | QA<sub>Easy</sub> | Math<sub>Easy</sub> | Code<sub>Easy</sub> |
| --- | --- | --- | --- |
| Top 50% (1.1x repeat) | 1.042 | 0.863 | 0.943 |
| Top 30% (1.8x repeat) | 1.031 | 0.870 | 0.880 |
| Top 10% (5.6x repeat) | 1.041 | 0.858 | 0.939 |
| Top 5% (11.1x repeat) | 1.065 | 0.843 | 0.930 |
| Olmo 3 Upsampling | 1.000 | 0.740 | 0.719 |

Table 38 Token-constrained mixing allows optimizing different evaluation objectives. We use our swarms to optimize a QA-, Math- and Code-heavy data mix and train 1B models to 100B tokens. Results are on the OlmoBaseEval Easy suite. Scores are expressed in bits-per-byte (BPB), lower is better (see Section §3.3 for details).

Table 39 Quality-aware upsampling outperforms naive data filtering. We simulate data-constrained training using 1B models trained to 100B tokens where we match the repetition of a 4.51T training run. Results are on the OlmoBaseEval Easy suite. Scores are expressed in bits-per-byte (BPB), lower is better (see Section §3.3 for details).

|  | QA<sub>Easy</sub> | Math<sub>Easy</sub> | Code<sub>Easy</sub> |
| --- | --- | --- | --- |
| Mixing Only | 1.005 | 0.778 | 0.872 |
| Quality Upsampling Only | 1.022 | 0.821 | 0.809 |
| Arithmetic Mean | 1.004 | 0.792 | 0.828 |
| Geometric Mean | 1.004 | 0.782 | 0.813 |
| Truncated exponential family | 1.002 | 0.782 | 0.787 |
| Truncated power-exponential family (Olmo 3) | 0.993 | 0.758 | 0.783 |

Table 40 Different methods of combining quality-aware upsampling and token-constrained mixing to arrive at the final Olmo 3 pretrain mix. Results are on the OlmoBaseEval Easy suite. Scores are expressed in bits-per-byte (BPB), lower is better (see Section §3.3 for details).

(topic) constraints only. The quality-aware upsampling experiments in the preceding paragraph impose column-wise (quality) constraints only.

**调和上采样与混合** 最后, 我们评估如何最好地结合混合与上采样两种方法, 它们处理数据选择中互补的两个侧面: 数据混合决定跨主题的分布, 质量上采样决定单一来源内部的分布. 可以这样想: 把数据集想象成一个由桶组成的二维矩阵, 行是 WebOrganizer 主题, 列是质量桶; 混合策略相当于只施加行向 (主题) 约束, 前一段的质量感知上采样实验则只施加列向 (质量) 约束.

We considered several techniques that did not work quite as well as the truncated power-exponential forms described in § A.2.4. On one hand, the Olmix framework samples data from each topic (row) according only to the natural quality distribution. On the other, quality upsampling samples data from each quality bucket (column) and does not consider reweighting topic distributions. For a theoretical target token yield, each of these strategies prescribes a target token count to be taken from each (topic, quality) bucket. Naive ways to rectify these strategies is to take an arithmetic or geometric mean between the target token counts from each bucket. We also note that the theoretical framework defining upsampling curves above is not necessarily restricted to the concept class of truncated power-exponential families. We could just as easily consider the family of exponential functions like $f _ { \lambda } ( x ) = C e ^ { \lambda ( x - a ) }$ Upon considering each of these techniques on small 1B models, we found that the truncated power-exponential family performed the best. Results are contained in Table 40.

我们考虑过几种不如 § A.2.4 所述截断幂指数形式的技术. 一方面, Olmix 框架只按自然质量分布从每个主题 (行) 采样; 另一方面, 质量上采样只从每个质量桶 (列) 采样, 不考虑重加权主题分布. 对理论上的目标 token 产出量, 这两种策略各自规定从每个 (主题, 质量) 桶取多少 token. 朴素的做法是对各桶的目标 token 数取算术平均或几何平均. 我们还注意到, 上文定义上采样曲线的理论框架并不限于截断幂指数函数类; 同样可以考察如 $f _ { \lambda } ( x ) = C e ^ { \lambda ( x - a ) }$ 的指数函数族. 在小型 1B 模型上逐一考察这些技术后, 我们发现截断幂指数函数族表现最好. 结果见表 40.

### A.3 Base Model Additional Data Details: Midtraining

This section provides further detail on curation processes for Dolma 3 Dolmino Mix. Additional replication resources, including prompts for synthetic data generation, are available in the Dolma3 GitHub repository.

本节详细介绍 Dolma 3 Dolmino Mix 的数据甄选过程. 更多复现资源 (包括合成数据生成的 prompt) 见 Dolma3 GitHub 仓库.

#### A.3.1 Math Capabilities

Similar to OLMo 2, we take particular care to curate math-specific mixes of data during the midtraining phase of training. In this section we discuss some of the procedures used to generate, as well as validate, the math-specific data sources. It should be noted, that while there has been a flurry of research on high-quality, open-source, STEM-focused datasets, many of these are synthetic data generated using LLama-models, which carry with them a restrictive Llama license. We produce several reproductions of these with more permissive

<!-- page 92 of 118 -->

|  | # Toks | # Toks |  |  |  |  |
| --- | --- | --- | --- | --- | --- | --- |
| Model | Seen (B) | Total (B) | ∆ MMLU | ∆ Math | ∆ MATH | ∆ GSM8K |
| tinyMATH (PoT) | 0.24 | 0.24 | -2.90 | 16.58 | 20.70 | 25.33 |
| tinyMATH (MIND) | 0.90 | 0.90 | -1.75 | 11.62 | 12.48 | 14.80 |
| tinyMATH (Both) | 1.15 | 1.15 | -1.68 | 9.98 | 11.40 | 12.07 |
| CraneMath | 4.34 | 4.34 | 0.01 | 4.86 | 4.26 | 6.32 |
| SwallowMath | 3.65 | 3.65 | 0.33 | 4.84 | 4.38 | 6.72 |
| Dolminos Math | 5.00 | 10.70 | -0.60 | 4.68 | 2.08 | 7.65 |
| MegaMatt | 2.69 | 21.78 | 0.32 | 3.39 | 3.91 | 4.85 |
| MM-Web-Pro | 5.00 | 15.10 | 0.09 | 2.31 | 1.92 | 3.49 |
| MM-Web-Pro-Max | 5.00 | 73.85 | -0.10 | 1.70 | 1.40 | 2.67 |
| FineMath4+ | 6.89 | 9.61 | 0.03 | 1.51 | 1.21 | 2.19 |
| MM-Web | 5.00 | 263.90 | 0.03 | 1.30 | 0.69 | 2.16 |

Table 41 Results from math microanneals, with normalized per-token differences in scores relative to pre-anneal baseline. All anneals were run with a 50/50 mixture of web text data and the high quality data source. Numbers were arrived at by taking the difference from the pre-anneal baseline and dividing by the number of tokens seen during training.

licensing and urge the community to take care in the licensing of the data they release if they wish to see adoption for research or commercial purposes.

与 OLMo 2 类似, 我们在 midtraining 阶段特别用心地甄选数学专用的数据混合. 本节讨论用于生成并验证数学专用数据源的一些流程. 需要注意, 尽管高质量, 开源, 面向 STEM 的数据集研究成果层出不穷, 但其中许多是用 Llama 模型生成的合成数据, 附带限制性的 Llama 许可证. 我们以更宽松的许可证复现了其中若干数据集, 并提醒社区: 如果希望数据集被研究或商业场景采用, 发布时请留意其许可证.

**TinyMATH** In OLMo 2, great strides were made in performance on the GSM8K (Cobbe et al., 2021) dataset by generating synthetic math problems seeded from the original GSM training set, and then generating both python code (PoT) and natural language discussions of solutions (MIND). We adopt a similar strategy here, to target the MATH dataset (Hendrycks et al., 2021c). Namely, we adopt the TinyGSM protocol (Liu et al., 2023a) and prompts to generate 100 new problems for each existing MATH problem, and then generate pythonic solutions for each of these new problems. Then we apply the MIND rewrite prompt (Akter et al., 2024), using the two-student and problem-solving variants. This yields the PoT dataset (241M tokens) and the MIND dataset (899M tokens). To assess the potency of these new datasets, we ran annealing runs and evaluated fine-grained math related benchmarks as well as MMLU, to keep an eye on generalization. These results are summarized in TABLE:

**TinyMATH** 在 OLMo 2 中, 团队以原始 GSM 训练集为种子生成合成数学题, 再同时生成 Python 代码解 (PoT) 与自然语言解 (MIND), 在 GSM8K (Cobbe et al., 2021) 上取得了长足进步. 这里我们采取类似策略, 但目标换成 MATH 数据集 (Hendrycks et al., 2021c). 具体而言, 我们沿用 TinyGSM 方案 (Liu et al., 2023a) 及其 prompt, 为每个已有 MATH 题目生成 100 道新题, 再为每道新题生成 Python 风格解答. 然后应用 MIND 改写 prompt (Akter et al., 2024), 使用 "两名学生" 与 "解题" 两个变体. 由此得到 PoT 数据集 (2.41 亿 token) 与 MIND 数据集 (8.99 亿 token). 为评估这些新数据集的效力, 我们跑了退火实验, 评测细粒度数学相关基准以及 MMLU, 以关注泛化. 结果汇总于 TABLE:

**CraneMath** SwallowMath (Fujii et al., 2025) is a 2.3 Billion token dataset, generated from rewriting FineMath4+ (Allal et al., 2025). Unfortunately the data was rewritten using a Llama model, which would require that any model trained on this data would need to have "Llama" in the name, according to the Llama Community License. To provide truly open data, we mirror the generation of this dataset, but use Qwen3 32B Yang et al. (2025a) to rewrite FineMath4+ using the prompt presented in the SwallowMath paper. This yields a 5.62B token dataset we refer to as CraneMath. Compared to the 9.6B tokens contained in FineMATH4+, CraneMath is a distillation into fewer tokens, but not as few as SwallowMath (2.3B) – we posit that this is because using Qwen3 as a rewrite model is slightly "chattier" than Llama.

**CraneMath** SwallowMath (Fujii et al., 2025) 是一个 23 亿 token 的数据集, 由 FineMath4+ (Allal et al., 2025) 改写生成. 遗憾的是数据由 Llama 模型改写, 按 Llama 社区许可证, 任何在该数据上训练的模型必须带有 "Llama" 字样. 为提供真正开放的数据, 我们复现了该数据集的生成过程, 但改用 Qwen3 32B Yang et al. (2025a), 按 SwallowMath 论文给出的 prompt 改写 FineMath4+. 由此得到 56.2 亿 token 的数据集, 我们称之为 CraneMath. 相比 FineMath4+ 所含的 96 亿 token, CraneMath 是把数据蒸馏到更少的 token, 但没像 SwallowMath (23 亿) 那么少 —— 我们推测这是因为用 Qwen3 做改写模型比 Llama 略 "话多".

To evaluate performance of this rewrite procedure, we ran several anneals, starting from a base model that had seen 6T tokens of our pre-training mix, we ran several anneals, always with 50% token from the pretraining mix and 50% tokens from the data-source of interest. In the case where the anneals have different token counts, driving the learning rate linearly down to the same final learning rate. Then we compare the following runs: i) The pre-anneal baseline, ii) FineMath4+, but just an incomplete subset; iii) the original SwallowMath dataset; iv) our version, CraneMath; v) two copies of CraneMath; vi) a copy of CraneMath and all their original documents from FineMath4+.

为评估这一改写流程的效果, 我们从一个已见过 6T token 预训练混合数据的基座模型出发跑了若干退火实验: 每次退火都使用 50% 预训练混合数据与 50% 目标数据源的 token; 若各次退火的 token 数不同, 则把学习率线性下降到同一个最终学习率. 对比的运行包括: i) 退火前基线; ii) FineMath4+ 的一个不完整子集; iii) 原始 SwallowMath 数据集; iv) 我们的版本 CraneMath; v) 两份 CraneMath; vi) 一份 CraneMath 加上全部原始 FineMath4+ 文档.

**MegaMatt** OctoThinker (Wang et al., 2025) generated a 70B token data pool dubbed Megamath-Web-Pro-Max, intended to be a rewrite of LLM360’s MegaMath data pool (Liu et al., 2023c), with quality mirroring

<!-- page 93 of 118 -->

that of the MegaMath-Web-Pro quality. Again, unfortunately, MegaMath-Web-Pro-Max was rewritten using Llama, and an independent recreation needed to be performed for fully-open usage in training. Since our initial ablations showed that the Megamath-Web-Pro-Max pool wasn’t as high of quality as, say, SwallowMath, we didn’t need a recreation of the full 70B pool. Instead, we generated a recreation of just the documents from Megamath-Web-Pro-Max that occured in CommonCrawl dumps from dump CC-MAIN-2023-23 and later, since more recent data was shown in the OctoThinker paper to be of higher quality. We ultimately generated 3.9B tokens of data, dubbed MegaMatt. To verify the efficacy, we ran ablations on: i) MegaMath-Web, ii) MegaMath-Web-Pro-Max (both to 10B and 25B tokens), and iii) MegaMatt.

其质量对标 MegaMath-Web-Pro. 遗憾的是, MegaMath-Web-Pro-Max 同样由 Llama 改写, 要在训练中完全开放地使用, 必须独立复现. 由于初步消融显示 Megamath-Web-Pro-Max 池的质量不如 SwallowMath, 我们无需复现完整的 700 亿池. 我们只复现了 Megamath-Web-Pro-Max 中出现在 CC-MAIN-2023-23 及之后 CommonCrawl dump 的文档, 因为 OctoThinker 论文显示更新的数据质量更高. 最终生成 39 亿 token 的数据, 命名为 MegaMatt. 为验证其效果, 我们在以下数据上跑了消融: i) MegaMath-Web, ii) MegaMath-Web-Pro-Max (分别到 10B 与 25B token), iii) MegaMatt.

**OMR Rewrites** Inspired by the success of Nvidia’s OpenMathReasoning dataset on the AIO-2 Kaggle competition, we experimented with various rewrites sourced from AoPS forums Moshkov et al. (2025). See Dolma3 repo for further details.

**OMR 改写** 受 Nvidia OpenMathReasoning 数据集在 AIO-2 Kaggle 竞赛上成功的启发, 我们实验了多种取自 AoPS 论坛的改写数据 Moshkov et al. (2025). 详见 Dolma3 仓库.

**Key Findings and Results** We summarize the annealing results for the math datasets in Table 41. Each value reflects the change in the evaluation score relative to the pre-anneal baseline, normalized by the number of training tokens. Presenting the results this way highlights several distinct tiers of math-data quality, stratified by the effect-per-token. Notably, these quality tiers anticorrelate with the number of available tokens: the highest-quality sources are also the smallest. While it is true that there are diminishing returns of evaluation scores as more tokens are added, we claim that amongst these high-quality data sources, some higher quality than others.

**关键发现与结果** 数学数据集的退火结果汇总于表 41. 每个数值反映评测分数相对退火前基线的变化, 按训练 token 数归一化. 这样呈现结果突出了数学数据质量几个明显层级, 按每 token 效果分层. 值得注意的是, 这些质量层级与可用 token 数负相关: 质量最高的来源同时规模最小. 随着 token 增多, 评测分数收益递减固然属实, 但我们主张, 在这些高质量数据源之间, 质量仍有高下之分.

At the top of the quality-spectrum are the tinyMATH variants. Although each contains less than a billion tokens, they deliver the strongest improvement per token – this is perhaps not surprising as these tokens were specifically crafted to augment the MATH evaluation score. Next in the tier-list of quality are the synthetic rewrites of natural high-quality data: the Crane, SwallowMath and MegaMatt sources which are each rewrites of FineMath4+ and MegaMathWeb-Pro. These provide a markedly weaker lift to the math evaluation metrics than the tinyMATH variants but also have a much larger pool of tokens to draw from. Finally, the largest data sources, including those of naturally occurring data such as FineMath4+ and MegamathWeb, also yield improvements, but their effect-per-token is noticeably smaller than that of the highly curated synthetic data. Finally we note that the effect of math midtraining on MMLU is generally neutral to negative, but is more strongly negative the more targeted the data pool is to Math evals, suggesting “overcooking”, where increased specialization comes at the expense of broader general-purpose performance.

质量谱顶端是 tinyMATH 变体. 虽然每个都不足 10 亿 token, 但每 token 带来的提升最强 —— 这并不奇怪, 因为这些 token 是专门为提升 MATH 评测分数而精心构造的. 质量层级紧随其后的是对天然高质量数据的合成改写: Crane, SwallowMath 与 MegaMatt, 它们分别是 FineMath4+ 与 MegaMathWeb-Pro 的改写. 它们对数学评测指标的提升明显弱于 tinyMATH 变体, 但可用 token 池大得多. 最后是规模最大的数据源, 包括 FineMath4+ 与 MegamathWeb 这类天然数据, 它们也能带来提升, 但每 token 效果明显小于高度甄选的合成数据. 最后我们注意到, 数学 midtraining 对 MMLU 的影响总体中性偏负, 且数据池越是针对数学评测, 负向影响越强, 这暗示了 "过度烹饪" 现象: 专业化程度的提升以牺牲更广的通用性能为代价.

#### A.3.2 Code Capabilities

During pretraining, we relied entirely on stack-edu (Allal et al., 2025) for providing coding data. This data came in the form of naturally-occurring source code from github scraps with limited extra preprocessing. During midtraining, we focused on improving Python and code-completion capabilities. To this end, we incorporated 10B tokens of FIM-transformed data form the same source as the pretraining code mixture. Inspired by improvements in math metrics by incorporating synthetic data, we also created a fully-open replica of SwallowCode (Fujii et al., 2025), which we call CraneCode.

预训练期间, 代码数据完全依赖 stack-edu (Allal et al., 2025), 即来自 GitHub 抓取的自然源码, 仅做有限额外预处理. midtraining 阶段我们把重心放在提升 Python 与代码补全能力上: 为此加入了 100 亿 token 的 FIM 变换数据, 来源与预训练代码混合数据相同. 受合成数据提升数学指标的启发, 我们还复刻了 SwallowCode (Fujii et al., 2025) 的全开放版本, 命名为 CraneCode.

**CraneCode** Of the off-the-shelf synthetic code data sources we considered, SwallowCode provided the greatest lift to coding evaluation metrics. Unfortunately, SwallowCode was generated using Llama models and thus had the less-permissive Llama license attached. We created a replica of SwallowCode by starting with just the python files from The Stack v2 Smol (Lozhkov et al., 2024), and applying the compilation and linting filters just as in SwallowCode. Then we applied a two-stage rewriting process, first to generate code data that is more compliant to the python style guides (SGCR), and then to generate optimized code (SCOR); both using the prompts from the original SwallowCode paper and Qwen/Qwen2.5-Coder-32B-Instruct (Qwen et al., 2024). To verify the quality of the reproduced dataset, we ran several anneals, where results are displayed in Table 42.

**CraneCode** 在我们考察的现成合成代码数据源中, SwallowCode 对代码评测指标的提升最大. 遗憾的是 SwallowCode 由 Llama 模型生成, 附带限制更严的 Llama 许可证. 我们这样复刻 SwallowCode: 仅取 The Stack v2 Smol (Lozhkov et al., 2024) 中的 Python 文件, 施加与 SwallowCode 相同的编译与 lint 过滤; 然后做两阶段改写, 先生成更符合 Python 风格指南的代码数据 (SGCR), 再生成优化后的代码 (SCOR), 两步都使用原始 SwallowCode 论文的 prompt 与 Qwen/Qwen2.5-Coder-32B-Instruct (Qwen et al., 2024). 为验证复现数据集的质量, 我们跑了若干退火实验, 结果见表 42.

#### A.3.3 Thinking Capabilities

**Meta-reasoning** Recent work demonstrates that structured meta reasoning capabilities present during pre-training and mid-training serve as the foundation for successful reinforcement learning in complex

<!-- page 94 of 118 -->

| Model | #Tokens | Crux-Eval | HumanEval | MBPP | MMLU |
| --- | --- | --- | --- | --- | --- |
| CraneCode (25B) | 18.87B | 35.92 | 35.06 | 31.72 | 54.30 |
| CraneCode SGCR | 18.87B | 41.75 | 33.78 | 36.76 | 54.18 |
| SwallowCode | 10.0B | 35.74 | 31.80 | 34.67 | 55.03 |
| CraneCode (10B) | 10.0B | 33.28 | 26.51 | 34.94 | 54.98 |
| Pre-anneal Baseline | N/A | 35.46 | 21.51 | 27.11 | 56.60 |

Table 42 Microanneal results for CraneCode ablations. For each annealing run, we ran with a 50/50 mixture of web text and high-quality synthetic code data. We note several observations: 1) Both SwallowCode and CraneCode provide a lift to coding evaluation metrics at the expense of MMLU metrics; 2) SwallowCode provides a larger lift normalized for tokens than the CraneCode dataset; 3) CraneCode continues to provide lift to HumanEval as more data is provided, indicating that this data source is not yet exhausted.

reasoning tasks. Gandhi et al. (2025) showed that models exhibiting verification and backtracking behaviors during base training achieved dramatically superior performance trajectories during mathematical reasoning RL. Therefore, we begin by identifying structured reasoning capabilities that are critical for mathematical problem-solving. We select seven core capabilities that are foundational to mathematical and programming expertise: self-awareness (Toy et al., 2024; Callaway et al., 2022), self-evaluation (Fleming and Daw, 2017), goal management (Ackerman and Thompson, 2017; Griffiths et al., 2019), hierarchical organization (Haupt, 2018), backward chaining (Olieslagers et al., 2024), backtracking and conceptual reasoning (Markovits et al., 2015). We then design specific tasks that systematically target these capabilities, as shown in Table 43, and 44. For instance, Math Error Recovery specifically targets self-awareness, verification, and backtracking by requiring models to experience authentic mistakes and demonstrate recovery processes. Strategy Selection focuses purely on meta-cognitive choice processes, while Conversation Generation integrates all capabilities through educational dialogue. For data generation, we start with existing math (Luo et al., 2025a; Moshkov et al., 2025) and coding (Li et al., 2023a; Hendrycks et al., 2021a; Ahmad et al., 2025) problems and their corresponding correct answers. Following Pandalla dataset, we automatically augment each problem with detailed annotations covering ‘problem classification’, ‘difficulty analysis’, ‘solution approaches’, ‘common pitfalls’, and ‘verification methods’. These rich annotations serve as inputs for our capability-targeted tasks. For example, the ‘common pitfalls’ field directly informs math error recovery generation, while steps in ‘solution approach’ provides structure for backward chaining tasks. Using the annotated datasets as foundation, we employ GPT-4.1 and o4-mini to generate training data at scale for each capability-targeted task.

**元推理** 近期研究表明, 预训练与 midtraining 中呈现的结构化元推理能力, 是在复杂推理任务上成功进行强化学习的基础. Gandhi et al. (2025) 显示, 基座训练阶段表现出验证与回溯行为的模型, 在数学推理 RL 中取得明显更优的性能轨迹. 因此, 我们先识别对数学解题至关重要的结构化推理能力, 选定七项构成数学与编程专长的核心能力: 自我意识 (Toy et al., 2024; Callaway et al., 2022), 自我评估 (Fleming and Daw, 2017), 目标管理 (Ackerman and Thompson, 2017; Griffiths et al., 2019), 层级组织 (Haupt, 2018), 反向链推理 (Olieslagers et al., 2024), 回溯与概念推理 (Markovits et al., 2015). 然后我们设计系统针对这些能力的具体任务, 见表 43 与表 44. 例如, 数学错误恢复专门瞄准自我意识, 验证与回溯 —— 它要求模型经历真实错误并展示恢复过程. 策略选择纯粹聚焦元认知的抉择过程, 对话生成则通过教学式对话整合全部能力. 数据生成方面, 我们从已有的数学 (Luo et al., 2025a; Moshkov et al., 2025) 与代码 (Li et al., 2023a; Hendrycks et al., 2021a; Ahmad et al., 2025) 题目及其正确答案出发. 沿用 Pandalla 数据集的做法, 我们为每道题自动加上覆盖 "题目分类", "难度分析", "解法路径", "常见陷阱" 与 "验证方法" 的详细标注. 这些丰富标注作为能力导向任务的输入: 例如 "常见陷阱" 字段直接用于数学错误恢复的生成, "解法路径" 中的步骤为反向链任务提供结构. 以标注数据集为基础, 我们用 GPT-4.1 与 o4-mini 为每个能力导向任务规模化生成训练数据.

| Task | Meta Capabilities |
| --- | --- |
| Math error recovery | Self-awareness, verification, backtracking |
| Choosing the technique to use | Strategy selection |
| Difficulty estimation &amp; self-awareness prompts | Self-evaluation |
| Steps generation | Goal management, hierarchical organization |
| From answer, generate steps backwards | Backward chaining |
| Conversation generation | All capabilities (tagging) |
| Reason about necessary concepts and how they connect | Conceptual reasoning |

Table 43 Meta reasoning capabilities across mathematical tasks.

**Existing thinking traces** The full list of existing thinking traces is as follows:

**已有 thinking 轨迹** 现有 thinking 轨迹完整清单如下:

1. **General reasoningmix** is a compilation of three existing datasets: GeneralThought-430K<sup>64</sup>, OpenThoughts-114k (Guha

<small><span class="docvortex-page-footnote" data-block-type="page_footnote" style="color:#6b7280">62<a href="https://huggingface.co/datasets/pandalla/pandalla-math-dataset-v1.0"><sub>huggingface</sub>.co/datasets/pandalla/pandalla-math-dataset-v1.0</a></span></small>

<small><span class="docvortex-page-footnote" data-block-type="page_footnote" style="color:#6b7280">63<sub>We</sub> provide the problem and the correct answer as inputs to o4-mini with high reasoning, to synthesize the annotations following the Pandalla-math annotation schema.</span></small>

<small><span class="docvortex-page-footnote" data-block-type="page_footnote" style="color:#6b7280">64<a href="https://huggingface.co/datasets/RJT1990/GeneralThoughtArchive"><sub>huggingface</sub>.co/datasets/RJT1990/GeneralThoughtArchive</a></span></small>

<!-- page 95 of 118 -->

| Task | Meta Capabilities |
| --- | --- |
| Code error recovery (single-turn) | Self-awareness, verification, backtracking |
| Code error recovery (multi-turn) | Self-awareness, verification, backtracking |
| Planning the solution | Strategy selection, goal management |
| Solution implementation | Conceptual-level processing, hierarchical organization |
| Code quality evaluation (high/low) | Self-evaluation |
| Difficulty estimation | Self-evaluation, self-awareness |
| Unit test walkthrough | Goal management, verification |

Table 44 Meta reasoning capabilities across coding tasks.

et al., 2025b), and Open-R1-Math-220k<sup>65</sup>. The resulting dataset contains questions, thinking traces, and answers for topics spanning math, code, natural sciences, humanities, social sciences, and puzzles.

1. **General reasoningmix** 是三个现有数据集的汇编: GeneralThought-430K<sup>64</sup>, OpenThoughts-114k (Guha et al., 2025b) 与 Open-R1-Math-220k<sup>65</sup>. 所得数据集覆盖数学, 代码, 自然科学, 人文, 社会科学与谜题等主题, 含问题, thinking 轨迹与答案.

2. **Gemini reasoning traces**, introduced by Muennighoff et al. (2025b), contains thinking traces covering domains of math, astronomy, biology, chemistry, computer science, geography, physics, English, law, logic, and more.

2. **Gemini reasoning traces** 由 Muennighoff et al. (2025b) 提出, 包含覆盖数学, 天文, 生物, 化学, 计算机科学, 地理, 物理, 英语, 法律, 逻辑等领域的 thinking 轨迹.

3. **OpenThoughts2 reasoning traces** from Guha et al. (2025b) contains thinking traces in domains of math, science, code, and puzzles.

3. **OpenThoughts2 reasoning traces** 来自 Guha et al. (2025b), 包含数学, 科学, 代码与谜题领域的 thinking 轨迹.

4. **Llama Nemotron reasoning traces** (Bercovich et al., 2025) contains thinking trace data for math, code, general reasoning, and instruction following.

4. **Llama Nemotron reasoning traces** (Bercovich et al., 2025) 包含面向数学, 代码, 通用推理与指令遵循的 thinking 轨迹数据.

5. **QwQ reasoning traces** consists of the QwQ subset of the OpenMathReasoning dataset (Moshkov et al., 2025).

5. **QwQ reasoning traces** 取自 OpenMathReasoning 数据集 (Moshkov et al., 2025) 的 QwQ 子集.

Filtering steps included subselecting for permissively-licensed generations, filtering to remove empty and truncated responses, performing checks of verifiable claims and safety, filtering overt LLM self-references, filtering heavily repeated sentences, paragraphs, and phrases, and remove reasoning traces consisting of greater than 5% Chinese characters.

过滤步骤包括: 只保留宽松许可证的生成内容; 移除空响应与被截断的响应; 对可验证断言与安全性做检查; 过滤显式的 LLM 自我指涉; 过滤严重重复的句子, 段落与短语; 移除中文字符占比超过 5% 的推理轨迹.

### A.4 Base Model Additional Evaluation Details

The OlmoBaseEval suite expands on the 11 tasks in the OLMo 2 iteration of OLMES (OLMo et al., 2024; Gu et al., 2024b), to include 43 tasks across new families of capabilities. Here, we enumerate details from Section §3.3. All task suites are publicly available at [github.com/allenai/olmes#olmo-3-eval-suite.](https://github.com/allenai/olmes#olmo-3-eval-suite)

OlmoBaseEval 套件在 OLMo 2 版 OLMES 的 11 个任务 (OLMo et al., 2024; Gu et al., 2024b) 基础上扩展到 43 个任务, 覆盖新的能力家族. 这里我们列举 §3.3 的细节. 所有任务套件均公开于 [github.com/allenai/olmes#olmo-3-eval-suite](https://github.com/allenai/olmes#olmo-3-eval-suite).

**Expanding OLMES tasks** We expanded our evaluation to target specific capabilities: new QA tasks focusing on science knowledge (SciQ, QASPER, SciRIFF), medical/lab knowledge (ProtocolQA, DBQA, MedMCQA, MedQA), math tasks (GSM Symbolic, Minerva MATH) and coding tasks (DS 1000, BigCodeBench, Deepseek LeetCode<sup>66</sup>, MultiPL-E HumanEval, MultiPL-E MBPP). We use MultiPL-E to evaluate our multilingual code execution, limited to six core programming languages. Additionally, we track fill-in-the-middle (FIM) performance using HumanEval with the three settings from Bavarian et al. (2022): single-line infilling, multi-line infilling and random span infilling.

**扩展 OLMES 任务** 我们扩展评测以针对特定能力: 面向科学知识的新 QA 任务 (SciQ, QASPER, SciRIFF), 医学/实验知识 (ProtocolQA, DBQA, MedMCQA, MedQA), 数学任务 (GSM Symbolic, Minerva MATH) 与代码任务 (DS 1000, BigCodeBench, Deepseek LeetCode<sup>66</sup>, MultiPL-E HumanEval, MultiPL-E MBPP). 我们用 MultiPL-E 评测多语言代码执行, 限定六种核心编程语言. 此外, 我们用 HumanEval 追踪 fill-in-the-middle (FIM) 性能, 采用 Bavarian et al. (2022) 的三种设置: 单行填充, 多行填充与随机片段填充.

We support code execution in Python, C++, Java, JavaScript, PHP, Rust and Shell using AWS Lambda functions to grade instances in parallel, isolated environments of up to 50K generations simultaneously. In total, our environments graded 17.2 million generated code samples during Olmo 3 development, with up to 1.5K simultaneously. To ensure reproducibility, we release a lightweight Docker library for code execution 67 without AWS infrastructure

我们用 AWS Lambda 函数支持 Python, C++, Java, JavaScript, PHP, Rust 与 Shell 的代码执行, 评分实例运行在并行, 隔离的环境中, 可同时处理多达 5 万个生成结果. Olmo 3 开发期间, 我们的环境共评阅了 1720 万份生成代码样本, 同时评阅数最高达 1500. 为保证可复现性, 我们发布了一个轻量级 Docker 代码执行库 67, 无需 AWS 基础设施.

Additionally, OLMo 2 only tracked math and code capabilities after mid-training, as small models exhibit random-chance pass@1 performance on math and code tasks (Wei et al., 2022). Our base easy suite tracks

<small><span class="docvortex-page-footnote" data-block-type="page_footnote" style="color:#6b7280">65<a href="https://huggingface.co/datasets/open-r1/OpenR1-Math-220k"><sub>huggingface</sub>.co/datasets/open-r1/OpenR1-Math-220k</a></span></small>

<small><span class="docvortex-page-footnote" data-block-type="page_footnote" style="color:#6b7280">66<sub>We</sub> use ‘Deepseek LeetCode’ to refer to the 180 LeetCode problems used during development in Guo et al. (2024)</span></small>

<small><span class="docvortex-page-footnote" data-block-type="page_footnote" style="color:#6b7280">67<sub>Our</sub> code execution environments are publicly available at [github.com/allenai/olmes-docker](https://github.com/allenai/olmes-docker).</span></small>

<!-- page 96 of 118 -->

![Image block](images/p96-figure-29-training-curves-of-midtraining-on-canonical.png)

Figure 29 Training curves of midtraining on canonical language model benchmarks (top), and our proposed base main task suites (bottom) for QA, Math and Code. We used the signal-to-noise ratio of early mid-training runs to make decisions about aggregating evaluation scores. Our resulting task averages had a better signal-to-noise ratio than individual benchmarks.

perplexity over human-written math and code solutions (Huang et al., 2024b), which allows us to broadens the scope of capabilities we track during pre-training.

此外, OLMo 2 只在 midtraining 之后追踪数学与代码能力, 因为小模型在数学与代码任务上的 pass@1 表现为随机水平 (Wei et al., 2022). 我们的 base easy 套件改为追踪人工撰写的数学与代码解答上的困惑度 (Huang et al., 2024b), 从而拓宽了预训练期间追踪的能力范围.

#### A.4.1 Base Evaluation suites

Using the analysis tools described in the previous section, we construct two evaluation suite for decision making in pre-training: the Base Easy suite for small-scale data decisions and the Base Main suite for in-loop evaluation and mid-training data decisions. We kept the number of in-context examples and generation

利用上一节描述的分析工具, 我们构建了两个评测套件用于预训练决策: Base Easy 套件面向小规模数据决策, Base Main 套件面向循环内评测与 midtraining 数据决策. 我们保持 in-context 样例数量与生成设置不变.

Table 46 describes the task configuration and metrics for the Olmo 3 Base Main evaluation suite. Table 45 provides an overview of the Base Easy suite.

表 46 描述 Olmo 3 Base Main 评测套件的任务配置与指标, 表 45 概述 Base Easy 套件.

**Base Easy suite** For multiple-choice BPB, we simply use the correct answer as the continuation. For math BPB, we use the provided human-written solutions from Minerva MATH (Lewkowycz et al., 2022). For code BPB, we use the gold ‘canontical’ solution as provided in HumanEval and MBPP (Chen et al., 2021; Austin et al., 2021). For BPB over non-Python coding tasks, MultiPL-E did not release gold solutions (Cassano et al., 2022), so we generate silver continuations for 16 languages using o4-mini-medium<sup>69</sup>. Figure 30 shows the scaling behavior of the three base easy task clusters, where we see signal even at very small (190M parameter) model sizes.

**Base Easy 套件** 多项选择 BPB 直接把正确答案作为续写. 数学 BPB 使用 Minerva MATH (Lewkowycz et al., 2022) 提供的人工撰写解答. 代码 BPB 使用 HumanEval 与 MBPP (Chen et al., 2021; Austin et al., 2021) 提供的 gold "canontical" 解答. 非 Python 代码任务的 BPB 方面, MultiPL-E 未发布 gold 解答 (Cassano et al., 2022), 因此我们 o4-mini-medium<sup>69</sup> 为 16 种语言生成 silver 续写. 图 30 展示了三个 base easy 任务簇的 scaling 行为, 即便在极小 (1.9 亿参数) 模型规模上也能看到信号.

One important property of the Base eval suite is that a ranking of two small models on the base easy suite agrees with their ranking on the downstream base main suite. We validate this by measuring rank correlation between the easy and main task suites, as pictured in Figure 31.

Base 评测套件的一个重要性质是: 两个小模型在 base easy 套件上的排序, 与它们在下游 base main 套件上的排序一致. 我们通过度量 easy 与 main 任务套件间的秩相关性来验证这一点, 见图 31.

**Base Main suite** As a result of the clustering procedure, the base main suite tracks 6 task groups: MCQA STEM, MCQA Non-STEM, Gen, Math, Code, Code FIM. Unlike OLMo 2, we are tracking generative math and code tasks at pre-training. We chose to evaluate pass@k with the largest number of samples such that

<small><span class="docvortex-page-footnote" data-block-type="page_footnote" style="color:#6b7280">68<sub>We</sub> perform all evaluation using vLLM. To prevent performance discrepancies between versions, we pin to v0.9.0.1 for evaluation during development, and pin to v0.11.0 for all evaluation in the final report.</span></small>

<small><span class="docvortex-page-footnote" data-block-type="page_footnote" style="color:#6b7280">69<sub>We</sub> release this generation set at [huggingface.co/datasets/allenai/multilingual\_mbpp](https://huggingface.co/datasets/allenai/multilingual_mbpp)</span></small>

<!-- page 97 of 118 -->

![Chart block](images/p97-chart.png)

![Chart block](images/p97-figure-30-scaling-analysis-for-the-olmo-3-base.png)

Figure 30 Scaling analysis for the Olmo 3 base evaluation suite. At the largest scale used to run from-scratch data ablations (grey line, a 1B model trained to 100B tokens), our ‘base main’ evaluation suite is too difficult to show improvement (top figures). Instead, we introduce a ‘base easy’ suite to compare models at small scales (bottom figures).

each task could evaluate on OLMo 2 7B on 1 H100 in under 30 minutes, in order to ensure the eval speed is not bottlenecked by any particular task. For tasks with a large enough n, we set k = 16 to match the GRPO group size, which we observed to act as an empirical upper-bound on the possible improvement from RL training. To decide on the the temperature and top-p, we ran a sweep and evaluated 5 models (OLMo 2 7B, 13B; Qwen 2.5 7B, 13B; Qwen 3 8B; Qwen et al., 2024; Yang et al., 2025a) to find an adequate configuration setting for high scores on both pass@1 and pass@k. Results are shown in Figure 32, and we select temperature and top-p of 0.6 for all base math and code evaluation.

**Base Main 套件** 经过聚类流程, base main 套件追踪 6 个任务组: MCQA STEM, MCQA Non-STEM, Gen, Math, Code, Code FIM. 与 OLMo 2 不同, 我们在预训练期间就追踪生成式数学与代码任务. 我们选择 pass@k 的采样数时, 要求每个任务在单张 H100 上评测 OLMo 2 7B 不超过 30 分钟, 确保评测速度不被任何单一任务卡脖子. 对 n 足够大的任务, 我们设 k = 16 以匹配 GRPO 的组大小 —— 我们观察到它是 RL 训练可能带来的提升的经验上界. 为确定 temperature 与 top-p, 我们做了扫描, 评测了 5 个模型 (OLMo 2 7B, 13B; Qwen 2.5 7B, 13B; Qwen 3 8B; Qwen et al., 2024; Yang et al., 2025a), 以找到 pass@1 与 pass@k 双高的配置. 结果见图 32, 我们为所有 base 数学与代码评测选取 temperature 0.6 与 top-p 0.6.

**Base Chat suite** During mid-training, we refashion the Chat eval suite (§4.1) for use evaluating base models, which served as a reference as to whether we expect our model to perform well after the adaptation pipeline. To do this, we used a standard, simple chat template (Question: {text}\nAnswer:) across all base models (both Olmo 3 and baseline models) and we included stop tokens to prevent degenerate responses. We also excluded tasks which required an API-based judge (AlpacaEval, SimpleQA) due to cost. In practice, we noticed most of the disagreements between the base main and base chat evaluation suites were due to noise, so we primarily used the base suite for making decisions.

**Base Chat 套件** midtraining 期间, 我们把 Chat 评测套件 (§4.1) 改造成可用于评测基座模型的形式, 作为模型经适配流水线后能否有良好表现的参照. 做法是: 对所有基座模型 (Olmo 3 与基线模型) 使用统一, 简单的 chat template (Question: {text}\nAnswer:), 并加入 stop token 以防退化输出. 出于成本考虑, 我们也排除了需要 API 评判器的任务 (AlpacaEval, SimpleQA). 实践中我们注意到, base main 与 base chat 评测套件之间的分歧大多源于噪声, 因此我们主要以 base 套件做决策.

**Base Long-Context suite** During the long-context extension phase, we evaluate long-context capability using RULER (Hsieh et al., 2024) as our primary development signal. As a complementary held-out set, we also use HELMET (Yen et al., 2025), noting that the HELMET Recall task directly implements several RULER evaluations (specifically, ruler-niah-mk-2, ruler-niah-mk-3, and

Figure 32 To select generation arguments for base evaluation, we run a temperature and top-p sweep across 5 models. We use a reasonable configuration such that we can calculate both pass@1 and pass@k using the results of a single evaluation job.

<!-- page 98 of 118 -->

![Chart block](images/p98-chart.png)

![Chart block](images/p98-chart-2.png)

![Chart block](images/p98-figure-31-relationship-between-bits-per-byte-using-the.png)

Figure 31 Relationship between bits-per-byte using the Easy suite and final metrics on the Main eval suite. We use the ‘Easy’ suite to make decisions at a small scale, which corresponds to an improvement at the large scale.

ruler-niah-mv). Because we evaluate only base models

at this stage, we disable chat templates within HELMET to ensure consistent scoring across models. For HEL-MET tasks requiring an LLM-as-a-judge, we use its default judge configuration (gpt-4o-2024-05-13). Taken together, RULER guides most model-selection decisions during long-context development, with HELMET providing an additional check on generalization.

**Base Held-out Suite** We targeted one held-out evaluation task to match each family of capability: MMLU Pro for QA (Wang et al., 2024a), LBPP for code (Matton et al., 2024), Deepmind Math for math (Saxton et al., 2019), and BigBench Hard to measure broad coverage across unseen task types (Suzgun et al., 2022).

#### A.4.2 New Evaluation Benchmarks

**Basic Skills** We developed a new benchmark, BasicSkills, to measure whether core capabilities are being acquired during pretraining. BasicSkills consists of 6 subtasks: basic arithmetic, string manipulation, simple coding, elementary logical reasoning, basic common sense, and simple pattern recognition. Each task isolates a single skill using a self-contained context that requires no external knowledge or additional information and can be completed through natural text continuation without relying on instruction-following abilities.

**Basic Skills** 我们开发了新基准 BasicSkills, 衡量预训练是否真正掌握了核心能力. 含 6 个子任务: 基础算术, 字符串操作, 简单编码, 初级逻辑推理, 基础常识, 简单模式识别. 每个任务只用自给自足的上下文隔离考察单一技能, 不需要外部知识或额外信息, 靠自然文本续写即可完成, 不依赖指令跟随能力.

**Gen2MC** One takeaway from OLMo 2 development was a sensitivity to task format. The clustering procedure furhter confirmed this, finding that generative scores rank models similarly as rank choice (RC) QA tasks, disagreeing with ranking of single-token multiple choice (MC) QA tasks (see Figure 5). In particular, the short-form generative QA tasks (GenQA in Table 46) evaluate by comparing a generated answer to a bank of plausible answers, but these answer banks are often not complete, leading to false negatives. To address this, we introduce the **Gen2MC** benchmarks, which were constructed by taking the original question/answer pairs and generating incorrect multiple-choice distractor answers using a strong LLM. For each set of generated distractors, we manually review a set of 200 sample questions from the validation set before generating the full dataset. We create Gen2MC tasks for DROP, Jeopardy, NaturalQs, SQuAD, CoQA using GPT-4o for generating distractors, and fall-back to GPT-4.1 in cases where output parsing failed.

**Masked perplexity** We want our model to perform well on the diversity of requests from real user chat data; however, we don’t want to overfit to the “style” of chat outputs. To avoid this, we use a simple token masking strategy, inspired by work in loss masking (Mindermann et al., 2022):

1. Fine-tune a 1B model on a tiny subset of the dataset (˜5%) with a small learning rate. The key idea is that we ‘warm up’ to the format of the target set without learning a lot of new knowledge.

2. Compute the token losses of the base model and the fine-tuned model on every sequence in the dataset and compute the difference: log $p _ { \mathrm { S F T } } \big ( y \big | x \big ) - \log p _ { \mathrm { b a s e } } \big ( y \big | x \big )$

3. Mask tokens where the difference is greater than some threshold (found by inspection)

<!-- page 99 of 118 -->

<table><tr><td></td><td>Task</td><td>Capability</td><td>ICL</td><td>Metric</td><td># Sub.</td></tr><tr><td colspan="6">Base Easy Suite</td></tr><tr><td rowspan="4">Code</td><td>Minerva MATH $^{\star}$  (2022)</td><td>Math Gen</td><td> $4^{\alpha}$ </td><td>BPB</td><td>7</td></tr><tr><td>HumanEval $^{\star}$  (2021)</td><td>Code Gen</td><td>3</td><td>BPB</td><td>-</td></tr><tr><td>MBPP $^{\star}$  (2021)</td><td>Code Gen</td><td>3</td><td>BPB</td><td>-</td></tr><tr><td>MT MBPP $^{\star}$  (2022)</td><td>Code Gen</td><td>3</td><td>BPB</td><td>17</td></tr><tr><td rowspan="21">QA</td><td>ARC (2018)</td><td>Science QA</td><td>5</td><td>BPB</td><td>2</td></tr><tr><td>MMLU (2021b)</td><td>General QA</td><td>5</td><td>BPB</td><td>57</td></tr><tr><td>CSQA (2019)</td><td>Commonsense QA</td><td>5</td><td>BPB</td><td>-</td></tr><tr><td>HellaSwag (2019)</td><td>Language Modeling</td><td>5</td><td>BPB</td><td>-</td></tr><tr><td>WinoGrande (2020)</td><td>Language Modeling</td><td>5</td><td>BPB</td><td>-</td></tr><tr><td>SocialIQA (2019)</td><td>Social QA</td><td>5</td><td>BPB</td><td>-</td></tr><tr><td>PiQA (2020)</td><td>Physical QA</td><td>5</td><td>BPB</td><td>-</td></tr><tr><td>CoQA (2019)</td><td>Conversation QA</td><td> $0^{\dagger}$ </td><td>BPB</td><td>-</td></tr><tr><td>DROP (2019)</td><td>Passage QA</td><td>5</td><td>BPB</td><td>-</td></tr><tr><td>Jeopardy (2024)</td><td>Trivia QA</td><td>5</td><td>BPB</td><td>-</td></tr><tr><td>NaturalQs (2019)</td><td>General QA</td><td>5</td><td>BPB</td><td>-</td></tr><tr><td>SQuAD (2016)</td><td>General QA</td><td>5</td><td>BPB</td><td>-</td></tr><tr><td>SciQ $^{\star}$  (2017)</td><td>Science QA</td><td>5</td><td>BPB</td><td>-</td></tr><tr><td>QASPER $^{\star}$  (2021)</td><td>Science QA</td><td>5</td><td>BPB</td><td>-</td></tr><tr><td>Basic Skills $^{\star}$  (§A.4.2)</td><td>Basic QA</td><td>5</td><td>BPB</td><td>6</td></tr><tr><td>DBQA $^{\star}$  (2024)</td><td>Science QA</td><td>5</td><td>BPB</td><td>-</td></tr><tr><td>ProtocolQA $^{\star}$  (2024)</td><td>Science QA</td><td>5</td><td>BPB</td><td>-</td></tr><tr><td>Lambada $^{\star}$  (2016)</td><td>Language Modeling</td><td>0</td><td>BPB</td><td>-</td></tr><tr><td>MedMCQA $^{\star}$  (2022)</td><td>Medical QA</td><td>5</td><td>BPB</td><td>-</td></tr><tr><td>MedQA $^{\star}$  (2021)</td><td>Medical QA</td><td>5</td><td>BPB</td><td>-</td></tr><tr><td>SciRIFF $^{\star}$  (2024)</td><td>Science QA</td><td>5</td><td>BPB</td><td>-</td></tr></table>

Table 45 Details of the Olmo 3 base easy evaluation suite. Tasks were formatted as bits-per-byte (BPB) over the gold continuation, or rank choice (RC, following the setup in Gu et al. (2024b)). = new additions to the base OLMo 2 suite (OLMo et al., 2024); † = few-shot examples are built-in the task;  = human-written few-shot examples.

4. Also mask the user responses and tool calls (we don’t want to model these for data selection) Use the loss at all the non-masked tokens positions for perplexity evaluations

In practice, we use OLMo 2 1B and the trained OLMo 2 1B SFT to compute the loss difference on target tokens. We use UltraChat and WildChat (Ding et al., 2023; Zhao et al., 2024a) as our masked perplexity sets.

<!-- page 100 of 118 -->

<table><tr><td></td><td>Task</td><td>ICL</td><td>Format</td><td>Metric</td><td>Temp</td><td>Top-p</td><td>Max toks</td><td>P@k (n)</td><td># sub</td></tr><tr><td colspan="10">Base Main Suite</td></tr><tr><td rowspan="4">Math</td><td>GSM8K* (2021)</td><td> $8^{\alpha}$ </td><td>CoT EM</td><td>pass@k</td><td>0.6</td><td>0.6</td><td>512</td><td>1, 4 (8)</td><td>-</td></tr><tr><td>GSM Symbolic* (2024)</td><td> $8^{\alpha}$ </td><td>CoT EM</td><td>pass@k</td><td>0.6</td><td>0.6</td><td>512</td><td>1, 4 (8)</td><td>3</td></tr><tr><td>Minerva MATH* (2022)</td><td> $4^{\alpha}$ </td><td>CoT EM</td><td>pass@k</td><td>0.6</td><td>0.6</td><td>1024</td><td>1, 4 (4)</td><td>7</td></tr><tr><td>MATH 500* (2022; 2023)</td><td> $4^{\alpha}$ </td><td>CoT EM</td><td>pass@k</td><td>0.6</td><td>0.6</td><td>1024</td><td>1, 16 (32)</td><td>-</td></tr><tr><td rowspan="7">Code</td><td>HumanEval* (2021)</td><td>3</td><td>Code Exec</td><td>pass@k</td><td>0.6</td><td>0.6</td><td>512</td><td>1, 16 (32)</td><td>-</td></tr><tr><td>MBPP* (2021)</td><td>3</td><td>Code Exec</td><td>pass@k</td><td>0.6</td><td>0.6</td><td>512</td><td>1, 16 (32)</td><td>-</td></tr><tr><td>BigCodeBench* (2024)</td><td>3</td><td>Code Exec</td><td>pass@k</td><td>0.6</td><td>0.6</td><td>1280</td><td>1 (5)</td><td>-</td></tr><tr><td>DS 1000* (2022)</td><td>3</td><td>Code Exec</td><td>pass@k</td><td>0.6</td><td>0.6</td><td>1024</td><td>1 (5)</td><td>-</td></tr><tr><td>Deepseek LeetCode* (2024)</td><td>0</td><td>Code Exec</td><td>pass@k</td><td>0.6</td><td>0.6</td><td>512</td><td>1, 16 (32)</td><td>-</td></tr><tr><td>MultiPL-E HumanEval* (2022)</td><td>0</td><td>Code Exec</td><td>pass@k</td><td>0.6</td><td>0.6</td><td>1024</td><td>1, 16 (32)</td><td>6</td></tr><tr><td>MultiPL-E MBPP* (2022)</td><td>0</td><td>Code Exec</td><td>pass@k</td><td>0.6</td><td>0.6</td><td>1024</td><td>1, 16 (32)</td><td>6</td></tr><tr><td rowspan="3">FIM</td><td>HumEval FIM Single* (2022)</td><td>0</td><td>FIM</td><td>pass@1</td><td>0.8</td><td>0.95</td><td>512</td><td>1 (10)</td><td>-</td></tr><tr><td>HumEval FIM Random* (2022)</td><td>0</td><td>FIM</td><td>pass@1</td><td>0.8</td><td>0.95</td><td>512</td><td>1 (5)</td><td>-</td></tr><tr><td>HumEval FIM Multi* (2022)</td><td>0</td><td>FIM</td><td>pass@1</td><td>0.8</td><td>0.95</td><td>512</td><td>1 (1)</td><td>-</td></tr><tr><td rowspan="5">STEM QA</td><td>ARC (2018)</td><td>5</td><td>MC</td><td>Acc</td><td>-</td><td>-</td><td>-</td><td>-</td><td>2</td></tr><tr><td>MMLU STEM (2021b)</td><td>5</td><td>MC</td><td>Acc</td><td>-</td><td>-</td><td>-</td><td>-</td><td>19</td></tr><tr><td>MedMCQA* (2022)</td><td>5</td><td>MC</td><td>Acc</td><td>-</td><td>-</td><td>-</td><td>-</td><td>-</td></tr><tr><td>MedQA* (2021)</td><td>5</td><td>MC</td><td>Acc</td><td>-</td><td>-</td><td>-</td><td>-</td><td>-</td></tr><tr><td>SciQ* (2017)</td><td>5</td><td>MC</td><td>Acc</td><td>-</td><td>-</td><td>-</td><td>-</td><td>-</td></tr><tr><td rowspan="12">Non-STEM QA</td><td>MMLU Humanities (2021b)</td><td>5</td><td>MC</td><td>Acc</td><td>-</td><td>-</td><td>-</td><td>-</td><td>13</td></tr><tr><td>MMLU Social Sci. (2021b)</td><td>5</td><td>MC</td><td>Acc</td><td>-</td><td>-</td><td>-</td><td>-</td><td>12</td></tr><tr><td>MMLU Other (2021b)</td><td>5</td><td>MC</td><td>Acc</td><td>-</td><td>-</td><td>-</td><td>-</td><td>14</td></tr><tr><td>CSQA (2019)</td><td>5</td><td>MC</td><td>Acc</td><td>-</td><td>-</td><td>-</td><td>-</td><td>-</td></tr><tr><td>PiQA (2020)</td><td>5</td><td>MC</td><td>Acc</td><td>-</td><td>-</td><td>-</td><td>-</td><td>-</td></tr><tr><td>SocialIQA (2019)</td><td>5</td><td>MC</td><td>Acc</td><td>-</td><td>-</td><td>-</td><td>-</td><td>-</td></tr><tr><td>DROP Gen2MC* (§A.4.2; 2019)</td><td>5</td><td>MC</td><td>Acc</td><td>-</td><td>-</td><td>-</td><td>-</td><td>-</td></tr><tr><td>Jeopardy Gen2MC* (§A.4.2; 2024)</td><td>5</td><td>MC</td><td>Acc</td><td>-</td><td>-</td><td>-</td><td>-</td><td>-</td></tr><tr><td>NaturalQs Gen2MC* (§A.4.2; 2019)</td><td>5</td><td>MC</td><td>Acc</td><td>-</td><td>-</td><td>-</td><td>-</td><td>-</td></tr><tr><td>SQuAD Gen2MC* (§A.4.2; 2016)</td><td>5</td><td>MC</td><td>Acc</td><td>-</td><td>-</td><td>-</td><td>-</td><td>-</td></tr><tr><td>CoQA Gen2MC* (§A.4.2; 2019)</td><td> $0^{\dagger}$ </td><td>MC</td><td>Acc</td><td>-</td><td>-</td><td>-</td><td>-</td><td>-</td></tr><tr><td>Basic Skills* (§A.4.2)</td><td>5</td><td>MC</td><td>Acc</td><td>-</td><td>-</td><td>-</td><td>-</td><td>6</td></tr><tr><td rowspan="9">GenQA</td><td>HellaSwag (2019)</td><td>5</td><td> $RC_{per-char}$ </td><td>Acc</td><td>-</td><td>-</td><td>-</td><td>-</td><td>-</td></tr><tr><td>WinoGrande (2020)</td><td>5</td><td> $RC_{none}$ </td><td>Acc</td><td>-</td><td>-</td><td>-</td><td>-</td><td>-</td></tr><tr><td>Lambda (2016)</td><td>0</td><td> $RC_{per-char}$ </td><td>Acc</td><td>-</td><td>-</td><td>-</td><td>-</td><td>-</td></tr><tr><td>Basic Skills* (§A.4.2)</td><td>5</td><td> $RC_{per-token}$ </td><td>Acc</td><td>-</td><td>-</td><td>-</td><td>-</td><td>6</td></tr><tr><td>DROP (2019)</td><td>5</td><td>GenQA</td><td>F1</td><td>0</td><td>1</td><td>100</td><td>-</td><td>-</td></tr><tr><td>Jeopardy (2024)</td><td>5</td><td>GenQA</td><td>F1</td><td>0</td><td>1</td><td>50</td><td>-</td><td>-</td></tr><tr><td>NaturalQs (2019)</td><td>5</td><td>GenQA</td><td>F1</td><td>0</td><td>1</td><td>50</td><td>-</td><td>-</td></tr><tr><td>SQuAD (2016)</td><td>5</td><td>GenQA</td><td>F1</td><td>0</td><td>1</td><td>50</td><td>-</td><td>-</td></tr><tr><td>CoQA (2019)</td><td> $0^{\dagger}$ </td><td>GenQA</td><td>F1</td><td>0</td><td>1</td><td>50</td><td>-</td><td>-</td></tr><tr><td colspan="10">Base Held-out Suite</td></tr><tr><td rowspan="4"></td><td>MMLU Pro (2024a)</td><td>5</td><td>MC</td><td>Acc</td><td>-</td><td>-</td><td>-</td><td>-</td><td>13</td></tr><tr><td>LBPP* (2024)</td><td>0</td><td>Code Exec</td><td>pass@k</td><td>0.6</td><td>0.6</td><td>4096</td><td>1 (32)</td><td>-</td></tr><tr><td>Deepmind Math* (2019)</td><td>5</td><td>CoT EM</td><td>pass@k</td><td>0.6</td><td>0.6</td><td>2048</td><td>1 (1)</td><td>-</td></tr><tr><td>BigBench Hard (2022)</td><td>3</td><td>CoT EM</td><td>Acc</td><td>0.6</td><td>0.6</td><td>512</td><td>1 (1)</td><td>55</td></tr></table>

Table 46 Details of the Olmo 3 base evaluation suite. Tasks were formatted as multiple-choice (MC), rank choice (RC, following the setup in Gu et al. (2024b)), short-form generative (GenQA), chain-of-thought with exact-match scoring (CoT EM), code execution (Code Exec) or fill-in-the-middle coding (FIM). We use \* to indicate new additions to the base OLMo 2 suite (OLMo et al., 2024), <sup>†</sup>for tasks with few-shot examples already specified within each instance, and for tasks with human-written few-shot examples.

<!-- page 101 of 118 -->

### A.5 Base Model Additional Decontamination Details

Important: this section is adapted from the documentation of the [decon](https://github.com/allenai/decon) package; for up to date information, please consults the official documentation: [github.com/allenai/decon/doc/simple-details.md](https://github.com/allenai/decon/blob/main/doc/simple-details.md)

重要: 本节改写自 [decon](https://github.com/allenai/decon) 包的文档; 最新信息请参阅官方文档: [github.com/allenai/decon/doc/simple-details.md](https://github.com/allenai/decon/blob/main/doc/simple-details.md)

Evals provide measurable outcomes for model capabilities. We hope that these are meaningful measurements. When evals leak into training data we run the risk of overfitting on evals.

评测为模型能力提供可测量的结果, 我们希望这些测量是有意义的. 一旦评测泄漏进训练数据, 就有在评测上过拟合的风险.

#### A.5.1 Definitions and Preliminaries

Training data and evals both consist of variable length token sequences. Contamination is a sufficient presence of a given eval sequence e in a given training sequence t.

训练数据与评测都是由变长 token 序列组成. 污染, 是指给定评测序列 e 在给定训练序列 t 中出现到足够的程度.

We characterize the problem as an approximate substring search for e in t for all $e \in E , t \in T .$

我们把该问题刻画为: 对所有 $e \in E , t \in T$, 在 t 中近似搜索子串 e.

Our goal is to partition the set T × E into the set of contaminated documents, denoted as C, and the set of pure documents, denoted as P.

我们的目标是把 T × E 集合划分为污染文档集 C 与纯净文档集 P.

We note that ∣T∣ ≫ ∣E∣ and generally C is very sparse within T, as ∣C∣ ≪ ∣P∣.

注意 ∣T∣ ≫ ∣E∣, 且 C 在 T 中通常非常稀疏, 因为 ∣C∣ ≪ ∣P∣.

Our goal is to call whether any training sequence t is derived directly from an eval sequence e. This involves distinguishing direct derivation of t to e from both noise and any source material for e.

我们的目标是判定某训练序列 t 是否直接源自某评测序列 e, 这需要把 t 与 e 的直接衍生关系, 同噪声以及 e 的任何来源材料区分开.

#### A.5.2 Example of Contamination

There is great diversity in the format and purpose of evaluation suites.

评测套件的格式与用途千差万别.

decon is fundamentally counting tokens, so it does not consider the intent or semantics of eval instances. But it does leverage the inherent structure of evals to better distinguish between sequences that originate from source material and those that are derived directly from evals.

decon 本质上是在数 token, 因此不考虑评测实例的意图或语义; 但它利用评测固有的结构, 更好地区分源自来源材料的序列与直接衍生自评测的序列.

```txt
// Eval
{"question": "What year was the Eiffel Tower constructed?", "answer": "1889"}

// Training Document
{"text": "Welcome to 1000facts. 1. What year was the Eiffel Tower constructed? A:
    1889"}
```

Figure 33 Example of knowledge eval task.

Knowledge evals frequently have shorter answers.

知识类评测的答案通常较短.

```txt
// Eval
{
  "question": "Solve for x: 2x + 5 = 15",
  "answer": "To solve 2x + 5 = 15, subtract 5 from both sides to get 2x = 10, then divide by 2 to get x = 5"
}

// Training Document
{"text": "Here's a math problem solution: To solve 2x + 5 = 15, subtract 5 from both sides to get 2x = 10, then divide by 2 to get x = 5. This demonstrates basic algebraic manipulation."}
```

Figure 34 Example of reasoning eval eval task.

Reasoning evals frequently have longer answers with a much larger sets of potential token sequences.

推理类评测的答案通常更长, 潜在 token 序列的空间也大得多.

<!-- page 102 of 118 -->

```txt
// Eval
{
    "passage": "The Eiffel Tower, a landmark in Paris, France, was constructed in 1889. It is a global cultural icon. It receives over 6 million visitors each year.",
    "question": "What year was the Eiffel Tower constructed?",
    "answer": "1889"
}
```

Figure 35 Example of retrieval eval task.

Retrieval evals frequently have a substantial passage from source material which acts as an almost input to a program selected by the question component.

检索类评测通常带有一段来自来源材料的大段篇章, 它几乎相当于由问题组件所选程序的输入.

#### A.5.3 Eval Normalization

decon normalizes all eval instances into question (Q), answer (A), and passage (P) components. A given eval split may hold out an answer and may or may not contain a passage depending on the task.

decon 把所有评测实例归一化为问题 (Q), 答案 (A) 与篇章 (P) 三个组件. 某个评测 split 可能隐去答案, 是否含篇章则取决于任务.

An eval instance can be described as having a Q, QA, QP, or QAP composition.

一个评测实例可描述为 Q, QA, QP 或 QAP 的组成形式.

• Question All eval instances to be decontaminated contain a question, and it serves as the primary vessel for information to describe the task. decon uses the question field for initial identification of contamination clusters. Questions with substantial information content and a strong match are sufficient to call contamination.

- 问题: 所有待去污染的评测实例都含问题, 它是描述任务信息的主要载体. decon 用问题字段做污染簇的初步识别. 信息量大且匹配强的问题, 已足以判定污染.

• Answer While the answer of an eval is important for measuring whether a model has learned a specific task, in the context of decontamination the answer primarily serves to provide supporting evidence of contamination. This is particularly important for questions with low information content or those that have edits.

- 答案: 答案对衡量模型是否学会某任务固然重要, 但在去污染语境下, 答案主要提供污染的支持性证据, 这对信息量低或经过编辑的问题尤为重要.

• Passage The passage, often derived from reference documents, is not a strong indicator of contamination, but in conjunction with a substantial question and answer match, further supports a contamination call.

- 篇章: 篇章常衍生自参考文档, 本身不是污染的强指标, 但与强的问题, 答案匹配相结合时, 能进一步支持污染判定.

#### A.5.4 Decon Implementation

We can now describe a computational tractable definition of contamination. We start with the simplest scenario, evals that only have a question component Q, and later extend the approach for QA, QP, and QAP scenarios.

现在我们给出一个计算上可操作的污染定义. 从最简单的情形 —— 只有问题组件 Q 的评测 —— 开始, 之后再把方法推广到 QA, QP 与 QAP 情形.

**Detecting contamination** Scoring segments of training documents against evals is somewhat problematic because there is substantial variation in the length of eval and training documents.

**检测污染** 用评测给训练文档的片段打分有些麻烦, 因为评测文档与训练文档的长度差异都很大.

**Cluster discovery** We start by defining a contamination cluster as a substring of a training document and a set of candidate evals which have at least 1 matching ngram.

**簇发现** 我们先定义污染簇: 训练文档的一个子串, 加上一组至少有 1 个匹配 ngram 的候选评测.

We discover clusters by sequentially sampling training document ngrams and checking for a hit in an inverted index which resolves ngrams to eval document ids. Upon an initial hit we expand left and right from the initial hit index until we observe a certain number misses, representing inserts, deletions, or edits.

我们通过顺序采样训练文档的 ngram 并检查倒排索引是否命中来发现簇, 索引把 ngram 解析为评测文档 id. 初次命中后, 从命中位置向左右扩展, 直到出现一定次数的 miss (代表插入, 删除或编辑).

The initial hit produces a set of matching document ids, which we call the active set. Each subsequent ngram lookup on traversal produces a set of matching documents from the inverted index, which we call the step set. We use the intersection between the active set and the step set to identify which documents in the active set hit for a given step. Once a specific document reaches 11 misses, it is removed from the active set. We repeat this process until the active set is empty or we reach the training document boundaries. At each step we accumulate the unique ngrams matched scoped by eval document id. The end result is a map of document ids to a set of unique ngram shingle matches.

初次命中得到一组匹配的文档 id, 称为活跃集; 遍历中每次后续 ngram 查询从倒排索引得到的一组匹配文档称为步进集. 我们用活跃集与步进集的交集, 识别活跃集中在当前步命中的文档. 某文档累计 11 次 miss 即从活跃集中移除. 重复此过程直到活跃集为空或到达训练文档边界. 每一步我们都按评测文档 id 累积匹配到的唯一 ngram, 最终得到从文档 id 到唯一 ngram shingle 匹配集合的映射.

<!-- page 103 of 118 -->

**IDF-weighted overlap** Contamination scoring uses inverse document frequency (IDF) weighting:

**IDF 加权重叠** 污染打分使用逆文档频率 (IDF) 加权:

$$
O = \frac {\sum_ {x \in U _ {t} \cap U _ {e}} \mathrm{idf} (x)}{\sum_ {y \in U _ {e}} \mathrm{idf} (y)}
$$

where $U _ { t }$ is the set of unique n-grams in the training document segment and $U _ { e }$ is the set of unique n-grams in the evaluation document.

其中 $U _ { t }$ 是训练文档片段中唯一 n-gram 的集合, $U _ { e }$ 是评测文档中唯一 n-gram 的集合.

**Cluster match length decay** Less informative short texts require stronger matches.

**簇匹配长度衰减** 信息量较低的短文本需要更强的匹配.

$$
O ^ {\prime} = O \times \left\{ \begin{array}{l l} 1 & \text {if} L \leq L _ {\mathrm{start}} \\ 1 - 0. 2 \frac {L - L _ {\mathrm{start}}}{L _ {\mathrm{end}} - L _ {\mathrm{start}}} & \text {if} L _ {\mathrm{start}} <   L <   L _ {\mathrm{end}} \\ 0. 8 & \text {if} L \geq L _ {\mathrm{end}} \end{array} \right.
$$

By default $\mathsf { L } _ { - }$ start is set by the configuration perfect\_match\_decay\_start: 20 and L\_end is set by the configuration perfect\_match\_decay\_end: 50.

默认 $\mathsf { L } _ { - }$ start 由配置 perfect\_match\_decay\_start: 20 设定, L\_end 由配置 perfect\_match\_decay\_end: 50 设定.

**Cluster discovery threshold** For efficiency we check that the question match $O ^ { \prime }$ exceeds the minimum question match required to ultimately call contamination. Every candidate contamination that exceeds this value will get a complete scoring, which includes answer and passage information.

**簇发现阈值** 出于效率, 先检查问题匹配 $O ^ { \prime }$ 是否超过最终判定污染所需的最小问题匹配. 每个超过该值的候选污染都会得到完整打分, 打分包含答案与篇章信息.

![Image block](images/p103-figure-36-example-of-trigram-processing-for-decon.png)

Figure 36 Example of trigram processing for decon pipeline.

<!-- page 104 of 118 -->

**Non-comparative** Note that we pre-compute the idf sums for evals during index construction. At detection time we sum the calculated idfs for matching ngrams to produce the overlap ratios. There is no string to string comparison. We rely on the nature of n-gram shingles for sequence matching. The probability of having a substantial ngram shingle overlap is low, and while degenerate cases are possible, they have not been observed in practice.

**非比较式** 注意, 我们在索引构建期为评测预计算 idf 总和; 检测时把匹配 ngram 的 idf 求和得到重叠比率. 全程没有字符串与字符串的直接比较, 我们依赖 n-gram shingle 的本性来做序列匹配. 出现大量 ngram shingle 重叠的概率很低; 退化情形理论上可能存在, 但实践中未观察到.

**Inverted index** Because $| E |$ is relatively small, we build an inverted index in memory which maps ngrams to document ids. We use a two tiered index, the first maps a u64 hash to a u32 sequential id assigned at index construction. And the second tier maps the n-gram id to a set of document ids. This oddity is done to achieve performant membership tests of training ngrams in the significantly smaller set of observed eval ngrams. Consider that the $\left| G _ { \mathrm { t n } } \right| \ll \left| G _ { \mathrm { e n } } \right|$ , so the supermajority of ngram lookups are misses, and skipped. The u32 sequential id is empirically more performant than a one-tiered lookup with document id sets as values.

**倒排索引** 由于 $| E |$ 相对较小, 我们在内存中构建把 ngram 映射到文档 id 的倒排索引. 索引分两层: 第一层把 u64 哈希映射到索引构建期分配的 u32 顺序 id; 第二层把 n-gram id 映射到文档 id 集合. 这种看似别扭的设计, 是为了让 "训练 ngram 是否属于规模小得多的评测 ngram 集合" 这一成员测试足够快. 由于评测 ngram 集合显著更小, 绝大多数 ngram 查询都 miss 并被跳过. 经验上, u32 顺序 id 比以文档 id 集合为值的一层式查找性能更好.

**Hot n-grams** Cluster discovery begins with an initial hit in the inverted index. While the supermajority of ngrams samples are misses, there are some extremely common ngrams present in the eval texts. Because the ngrams are so common, the probability of a initial hit leading to a true instance of contamination is low. As an optimization we do not start contamination cluster expansion on hot ngram hits, but rather switch our sampling rate to 1, and traverse the training document by single tokens until we observe a miss or non-hot ngram hit.

**热 n-gram** 簇发现始于倒排索引中的一次命中. 采样的 ngram 绝大多数是 miss, 但评测文本中也存在极常见的 ngram; 由于它们太常见, 由这类命中启动的簇扩展最终指向真实污染的概率很低. 作为优化, 热 ngram 命中时不启动污染簇扩展, 而是把采样率切到 1, 改为逐 token 遍历训练文档, 直到遇到 miss 或非热 ngram 命中.

#### A.5.5 Scoring System

Scores combine question, answer, and passage overlaps with adaptive weights based on the length of components:

分数把问题, 答案与篇章的重叠按基于组件长度的自适应权重组合起来:

• QAP (all components): 0.7 question, 0.2 answer, 0.1 passage

• QAP (全部组件): 0.7 问题, 0.2 答案, 0.1 篇章

• QA (no passage): 0.75 question, 0.25 answer

• QA (无篇章): 0.75 问题, 0.25 答案

• QP (no answer): 0.85 question, 0.15 passage

• QP (无答案): 0.85 问题, 0.15 篇章

• Q (question only): 1.0 question

• Q (仅问题): 1.0 问题

**Length penalty** We penalize short matches based on the length of $Q+A+P$ by scaling down scores for shorter texts, making the contamination threshold effectively harder to reach. Shorter texts get their scores scaled down before threshold comparison. The scaling factor depends on the total token length $L _ { \mathrm { t o t a l } } ;$

**长度惩罚** 我们按 $Q+A+P$ 的长度惩罚短匹配: 对较短文本把分数缩低, 使污染阈值实际上更难达到. 短文本的分数在与阈值比较前先缩放, 缩放因子取决于总 token 长度 $L _ { \mathrm { t o t a l } }$:

$$
S _ {\mathrm{final}} = S _ {\mathrm{base}} \times \mathrm{scaleFactor} \big (L _ {\mathrm{total}} \big)
$$

Where the scaling factor decreases for shorter texts, making the threshold effectively harder to reach. Perfect scores (1.0) are never penalized.

缩放因子随文本变短而减小, 使阈值实际上更难达到. 满分 (1.0) 永不被惩罚.

**Confidence adjusted weight** The question component is the core of a contaminated prompt and carries the most weight. But in some cases an eval will have short questions and long answers or a long passage followed by a short question about it.

**置信度调整权重** 问题组件是污染 prompt 的核心, 权重最大; 但有些评测问题很短, 答案很长, 或是一段长篇章后跟一个关于它的短问题.

Because longer sequences with more informative content provide stronger contamination evidence, we adjust component weights based on confidence factors derived from length by reducing the question weight and redistributing it to the answer or passage.

由于更长, 信息量更充分的序列提供更强的污染证据, 我们按由长度导出的置信因子调整组件权重: 降低问题权重, 把它重新分配给答案或篇章.

Question confidence, based on unique n-gram count:

$$
\left| \begin{array}{c} C _ {q} = \left\{ \begin{array}{l l} 0. 5 + 0. 5 \frac {N _ {q}}{2 0} & \text {if} N _ {q} <   2 0 \\ 1 & \text {if} N _ {q} \geq 2 0 \end{array} \right. \end{array} \right|
$$

Base weights are adjusted by confidence factors:

$$
W _ {\text {adjusted}} = W _ {\text {default}} \cdot C + W _ {\text {redistributed}}
$$

<!-- page 105 of 118 -->

Where low-confidence components redistribute their weight to higher-confidence ones.

即低置信组件把权重重新分配给高置信组件.

**Base scores**

**基础分数**

• Q composition: $S _ { \mathrm { b a s e } } = \mathcal { O } _ { q }$

• Q 组成: $S _ { \mathrm { b a s e } } = \mathcal { O } _ { q }$

• QA composition: $S _ { \mathrm { b a s e } } = O _ { q } \cdot W _ { q , \mathrm { a d j u s t e d } } + O _ { a } \cdot W _ { a , \mathrm { a d j u s t e d } }$

• QA 组成: $S _ { \mathrm { b a s e } } = O _ { q } \cdot W _ { q , \mathrm { a d j u s t e d } } + O _ { a } \cdot W _ { a , \mathrm { a d j u s t e d } }$

• $\mathbf { Q P }$ composition: $S _ { b a s e } = O _ { q } \cdot W _ { q , \mathrm { a d j u s t e d } } + O _ { p } \cdot W _ { p , \mathrm { a d j u s t e d } }$

• $\mathbf { Q P }$ 组成: $S _ { b a s e } = O _ { q } \cdot W _ { q , \mathrm { a d j u s t e d } } + O _ { p } \cdot W _ { p , \mathrm { a d j u s t e d } }$

• QAP composition: $S _ { \mathrm { b a s e } } = \mathcal { O } _ { q } \cdot W _ { q , \mathrm { a d j u s t e d } } + \mathcal { O } _ { a } \cdot W _ { a , \mathrm { a d j u s t e d } } + \mathcal { O } _ { p } \cdot W _ { p , \mathrm { a d j u s t e d } }$

• QAP 组成: $S _ { \mathrm { b a s e } } = \mathcal { O } _ { q } \cdot W _ { q , \mathrm { a d j u s t e d } } + \mathcal { O } _ { a } \cdot W _ { a , \mathrm { a d j u s t e d } } + \mathcal { O } _ { p } \cdot W _ { p , \mathrm { a d j u s t e d } }$

**Answer proximity** For QA datasets, contamination requires the answer appears near the question cluster. Short answers use exact token matching; long answers use n-gram overlap with IDF weighting.

**答案邻近度** 对 QA 数据集, 判定污染要求答案出现在问题簇附近. 短答案用精确 token 匹配, 长答案用带 IDF 加权的 n-gram 重叠.

**Passage proximity** For datasets with passages, contamination checks if the passage appears within a configurable distance (min\_passage\_distance) from the question cluster. Passages use n-gram overlap with IDF weighting and can tolerate gaps (passage\_max\_consecutive\_misses).

**篇章邻近度** 对含篇章的数据集, 污染检查篇章是否出现在距问题簇可配置距离 (min\_passage\_distance) 之内. 篇章用带 IDF 加权的 n-gram 重叠, 可容忍空隙 (passage\_max\_consecutive\_misses).

### A.6 Post-Training Additional Training Details

#### A.6.1 Supervised Finetuning Details

**Using OLMo-core infrastructure for SFT Training** Relative to pretraining, this involves a substantially smaller batch size, different data packing, and masking. This leads to an 8x faster training speed than open-instruct, dramatically improving our iteration speed. We use between 1 and 8 8xH100 nodes, or 1 to 4 8xB200 nodes to train our 7B reasoner and instruct models. We use 32 8xH100 nodes to train our 32B thinking model As a consequence of using olmo-core, our batch size is now measured in tokens instead of instances, and we train with document packing instead of padding. We train all of our 7B SFT models with a batch size of 1M tokens and 32B SFT models with a batch size of 4M tokens, for two epochs, with packing, and a 32,768 sequence length. Our hyperparameter settings are also summarized in Table 47.

**用 OLMo-core 基础设施做 SFT 训练** 相对于预训练, 这涉及明显更小的批大小, 不同的数据打包方式与掩码策略. 训练速度因此比 open-instruct 快 8 倍, 迭代效率大幅提升. 训练 7B reasoner 与 instruct 模型我们用 1 到 8 个 8xH100 节点或 1 到 4 个 8xB200 节点; 训练 32B thinking 模型用 32 个 8xH100 节点. 使用 olmo-core 后, 批大小改用 token 而非实例计量, 训练用文档 packing 而非 padding. 所有 7B SFT 模型批大小为 100 万 token, 32B SFT 模型为 400 万 token, 均训练两个 epoch, 开 packing, 序列长度 32,768. 超参数设置亦汇总于表 47.

|  | 7B Thinking SFT | 32B Thinking SFT | 7B Instruct SFT |
| --- | --- | --- | --- |
| Total Tokens | 45.4B | 45.2B | 3.4B |
| Learning Rate | -55.0 × 10 | -4 -51.0 × 10 souped with 5.0 × 10 | -58.0 × 10 |
| Num. GPUs | 64 | 256 | 8-64 |
| Max Sequence Length | 32K | 32K | 32K |

Table 47 Training hyperparameters for Olmo 3 Think SFT and Olmo 3 Instruct SFT. GPU hours assume NVIDIA H100 accelerator.

#### A.6.2 Preference Tuning Details

**Training Settings** Given a preference dataset $\mathcal { D } = \{ \left( x , y _ { c } , y _ { r } \right) \}$ of prompts x and corresponding chosen and rejected responses $y _ { c } \succ y _ { r }$ , we optimize the model policy $\pi _ { \theta }$ on a length-normalized DPO loss (Lambert et al., 2024):

**训练设置** 给定偏好数据集 $\mathcal { D } = \{ \left( x , y _ { c } , y _ { r } \right) \}$ (prompt x 及对应的被选响应与被拒响应 $y _ { c } \succ y _ { r }$), 我们在长度归一化的 DPO 损失 (Lambert et al., 2024) 上优化模型策略 $\pi _ { \theta }$:

$$
\left| \max _ {\pi_ {\theta}} \mathbb {E} _ {(x, y _ {c}, y _ {r}) \sim \mathcal {D}} \left[ \log \sigma \left(\frac {\beta}{| y _ {c} |} \log \frac {\pi_ {\theta} (y _ {c} | x)}{\pi_ {\mathrm{ref}} (y _ {c} | x)} - \frac {\beta}{| y _ {r} |} \log \frac {\pi_ {\theta} (y _ {r} | x)}{\pi_ {\mathrm{ref}} (y _ {r} | x)}\right) \right] \right|
$$

where $\pi _ { \mathrm { r e f } }$ is the initial reference policy and $\beta$ is a hyperparameter that regularizes learning via an implicit Kullback–Leibler (KL) divergence penalty between the reference policy and the training policy.

其中 $\pi _ { \mathrm { r e f } }$ 是初始参考策略, $\beta$ 是通过参考策略与训练策略之间的隐式 Kullback-Leibler (KL) 散度惩罚来正则化学习的超参数.

We sweep learning rate and preference dataset size, as we observe that performance increases up until some task-dependent optimal optimization point beyond which further tuning hurts (Figure 23). All other hyperparameters are kept fixed. See Table 48 for exact hyperparameters. We train our 7B models using 2–4 8xH100 nodes, and our 32B models with 8–16 8xH100 nodes.

我们扫描学习率与偏好数据集大小, 因为观察到性能会先上升, 达到某个因任务而定的最优优化点后, 继续调优反而有害 (图 23). 其余超参数保持不变, 精确取值见表 48. 7B 模型用 2–4 个 8xH100 节点训练, 32B 模型用 8–16 个 8xH100 节点.

<!-- page 106 of 118 -->

|  | 7B Thinking DPO | 32B Thinking DPO | 7B Instruct DPO |
| --- | --- | --- | --- |
| Num. Preference Pairs | 150K | 200K | 260K |
| Num. Epochs | 1 | 1 | 1 |
| DPO β | 5 | 5 | 5 |
| Learning Rate | -88.0 × 10 | -87.0 × 10 | -61.0 × 10 |
| LR Schedule | Linear decay | Linear decay | Linear decay |
| Warmup Ratio | 0.1 | 0.1 | 0.1 |
| Num. GPUs | 32 | 64-128 | 16 |
| Batch Size | 128 | 128 | 128 |
| Max Sequence Length | 16K | 8K | 16K |

Table 48 Training hyperparameters for Olmo 3 Think DPO and Olmo 3 Instruct DPO. GPU hours assume NVIDIA H100 accelerator.

#### A.6.3 Reinforcement Learning Details

We provide full training curves for our 7B reasoner in Figure 41. The overall reward increases steadily over training. The KL divergence grows gradually and reflects stronger deviation from the reference policy. The response length becomes longer and stabilizes at a higher level. Domain-specific verifier rewards display consistent gains in math and moderate fluctuations in code. The IfEval reward rises throughout training. The two general-quality verifiers also show clear and sustained improvement. Together, these trends indicate that the policy improves both specialized skills and overall response quality. The full hyperparameters for all RL experiments are provided in in Table 49.

我们在图 41 中给出 7B reasoner 的完整训练曲线. 总奖励随训练稳步上升; KL 散度逐渐增大, 反映与参考策略的偏离在加强; 响应长度变长并稳定在更高水平. 领域专用验证器奖励在数学上持续提升, 在代码上有适度波动; IfEval 奖励全程上升; 两个通用质量验证器也有明显且持续的改善. 这些趋势共同表明, 策略在专门技能与整体回复质量上都在进步. 所有 RL 实验的完整超参数见表 49.

#### A.6.4 RL-Zero Details

We detail the prompt used for math in Figure 37. Prompts of other domains are quite similar, see the open-instruct codebase for details.

我们在图 37 中给出数学任务所用的 prompt, 其他领域的 prompt 非常相似, 详见 open-instruct 代码库.

We also compare Olmo 3 RL-Zero 7B to one of the more common benchmarks in RLVR, DAPO (Yu et al., 2025) in Figure 38. Olmo 3 RL-Zero achieves reasonable performance faster and is also much more compute efficient, making it better for experimentation.

我们还把 Olmo 3 RL-Zero 7B 与 RLVR 中较常用的基准 DAPO (Yu et al., 2025) 做了对比 (图 38). Olmo 3 RL-Zero 更快达到可用性能, 且计算效率高得多, 更适合做实验.

Finally, we compare Olmo RL-Zero 3.1 to the initially released, RL-Zero 3.0 in Figure 39 and see a sizable improvement. There were some minor fixes to loss calculation but the major improvement comes from 1. setting completion length to 16k instead of 12k and 2. not masking truncated sequences, one of the components of DAPO (Yu et al., 2025). Despite initial results suggesting this masking improved the speed of the trainer (by having fewer completions to train on), we ultimately found that variations in batch size caused by some examples masked out to reduce stability. And without training on overlong negative sequences, completion lengths were higher, on average. We therefore found that any efficiency gains in training speed from masking were outweighed by slowdowns from generating longer sequence lengths.

最后, 我们把 Olmo RL-Zero 3.1 与最初发布的 RL-Zero 3.0 对比 (图 39), 看到明显提升. 损失计算有一些小的修正, 但主要改进来自两点: 1. 把 completion 长度从 12k 改为 16k; 2. 不再掩码截断序列 —— 这是 DAPO (Yu et al., 2025) 的组件之一. 尽管初步结果显示这种掩码能提升训练器速度 (要训练的 completion 更少), 但我们最终发现, 部分样例被掩码导致的批大小波动会降低稳定性; 而且不在过长的负样本序列上训练后, completion 的平均长度反而更高. 因此我们确认, 掩码带来的训练速度收益, 被生成更长序列造成的减速抵消了.

![Image block](images/p106-figure-37-rl-zero-prompt-for-math-task.png)

Figure 37 RL-Zero Prompt for Math Task.

<!-- page 107 of 118 -->

![Chart block](images/p107-chart.png)

![Chart block](images/p107-figure-38-olmo-3-rl-zero-7b-vs-dapo-yu-et-al-2025-which.png)

Figure 38 Olmo 3 RL-Zero 7B vs DAPO (Yu et al., 2025) which leverages Qwen 2.5 32B. We compare the two benchmarks in terms of increase in model performance over training steps as well as GPU hours (exact values and GPU hours for DAPO taken from the [DAPO reproduction on verl](https://wandb.ai/verl-org/DAPO%20Reproduction%20on%20verl/runs/0qjd0wap?nw=wmb4qxfht0n)).

![Chart block](images/p107-figure-39-olmo-3-rl-zero-vs-olmo-3-1-rl-zero-we-compare.png)

Figure 39 Olmo 3 RL-Zero vs Olmo 3.1 RL-Zero. We compare our new baseline to the previously released Olmo 3 RL-Zero Math on AIME 2024 and 2025, pass@1. Our new setup improves performance more slowly to begin with but outperforms as training goes longer, plateauing at a higher score ∼ 50%.

### A.7 Post-Training Additional Data Details

#### A.7.1 Filtering for Dolci Think-SFT

In this section we detail the filtering methods created primarily for training Olmo 3 Think, which was also used for mid-training and Olmo 3 Instruct data. Each phase of filtering would remove 0-1% of data across most available or generated reasoning traces. Some data, such as Nvidia’s Nemotron Post-training datasets (Nathawani et al., 2025) had very few samples removed relative to their peers.

本节详细介绍主要为训练 Olmo 3 Think 而设计的过滤方法, 它们也用于 midtraining 与 Olmo 3 Instruct 数据. 对大多数可用或生成的推理轨迹, 每阶段过滤移除 0-1% 的数据. 有些数据 (如 Nvidia 的 Nemotron Post-training 数据集 (Nathawani et al., 2025)) 被移除的样本相对同类少得多.

1. Source filtering We perform some filtering to remove non-compliant licenses or data that will not be useful. E.g. for GeneralThoughts traces used in mid-training, we filtered to only commercially friendly licensed prompts. For OpenThoughts2, we removed ShareGPT prompts due to questionable provenance (as done in Tulu 3). For LlamaNemotron Post-Training we filter to only reasoning samples from DeepSeek and Qwen that have not been touched by Llama models.

1. 来源过滤: 我们做一些过滤, 移除不合规许可证或无用的数据. 例如, 对 midtraining 所用的 GeneralThoughts 轨迹, 只保留商用友好许可证的 prompt; 对 OpenThoughts2, 因来源存疑移除 ShareGPT prompt (与 Tulu 3 相同); 对 LlamaNemotron Post-Training, 只保留来自 DeepSeek 与 Qwen 且未被 Llama 模型处理过的推理样本.

2. Format filtering We remove truncated answers (i.e. if they have &lt;think&gt; and no &lt;/think&gt;) and empty outputs (empty responses). Implementation is available at [github.com/allenai/open-instruct/ /scripts/data/filtering\_and\_updates/filter\_cots.py](https://github.com/allenai/open-instruct/blob/7ba4cd0/scripts/data/filtering_and_updates/filter_cots.py)

2. 格式过滤: 移除截断的答案 (即只有 &lt;think&gt; 没有 &lt;/think&gt;) 与空输出 (空响应). 实现见 [github.com/allenai/open-instruct/ /scripts/data/filtering\_and\_updates/filter\_cots.py](https://github.com/allenai/open-instruct/blob/7ba4cd0/scripts/data/filtering_and_updates/filter_cots.py)

3. Domain specific accuracy filtering We check accuracy for many domains, such as precise instruction following, code, or math. Additionally, for chat domains we use included metadata in some datasets such as Wildchat to remove responses or prompts tagged as unsafe. Implementation is available at [github.com/allenai/open-instruct/scripts/data/filtering\_and\_updates/filter\_wildchat.py](https://github.com/allenai/open-instruct/blob/7ba4cd0/scripts/data/filtering_and_updates/filter_wildchat.py)

3. 领域特定准确率过滤: 我们检查多个领域的准确率, 如精确指令遵循, 代码或数学. 此外, 对对话领域, 我们利用 WildChat 等数据集中附带的元数据, 移除被标记为不安全的回复或 prompt. 实现见 [github.com/allenai/open-instruct/scripts/data/filtering\_and\_updates/filter\_wildchat.py](https://github.com/allenai/open-instruct/blob/7ba4cd0/scripts/data/filtering_and_updates/filter_wildchat.py)

4. General content filters Here we remove mention of date cutoffs to try and avoid hallucinations of model characteristics and any mention in the user prompt or completion that indicates the date is to or from any model. Maintaining identity of models trained on heavily distilled data takes a meaningful amount of data work and system prompt design. Implementation is available at [github.com/allenai/open-instruct/](https://github.com/allenai/open-instruct/blob/7ba4cd0/scripts/data/filtering_and_updates/filter_datasets_sequential.sh)

4. 通用内容过滤: 这里我们移除对日期截止的提及, 尽量避免模型对自身的特征产生幻觉, 也移除 user prompt 或 completion 中任何暗示知识日期来自或指向某模型的表述. 在重度蒸馏数据上训练的模型要保持身份认同, 需要相当的数据工作与系统 prompt 设计. 实现见 [github.com/allenai/open-instruct/](https://github.com/allenai/open-instruct/blob/7ba4cd0/scripts/data/filtering_and_updates/filter_datasets_sequential.sh)

[107](https://github.com/allenai/open-instruct/blob/7ba4cd0/scripts/data/filtering_and_updates/filter_datasets_sequential.sh)

<!-- page 108 of 118 -->

![Image block](images/p108-figure-40-llm-judge-prompt-for-non-verifiable-tasks.png)

Figure 40 LLM judge prompt for non-verifiable tasks.

[scripts/data/filtering\_and\_updates/filter\_datasets\_sequential.sh](https://github.com/allenai/open-instruct/blob/7ba4cd0/scripts/data/filtering_and_updates/filter_datasets_sequential.sh)

5. Repetition filtering Many open-weights reasoning models have tendencies to perform extreme repetitions, even in thinking traces that result in a correct answer. In particular, we find that .1% of responses from QwQ have mass repetition. We filter this roughly by searching for heavily repeated ( 10x+) sentences, paragraphs, or ( 50x+) phrases. Implementation is available at [github.com/allenai/open-instruct/ scripts/data/filtering\_and\_updates/filter\_ngram\_repetitions.py](https://github.com/allenai/open-instruct/blob/7ba4cd0/scripts/data/filtering_and_updates/filter_ngram_repetitions.py)

5. 重复过滤: 许多开放权重推理模型有极端重复的倾向, 即便在最终答案正确的 thinking 轨迹中也会如此. 特别是我们发现 QwQ 有 0.1% 的回复存在大面积重复. 我们粗略过滤: 搜索严重重复的 (10x+) 句子, 段落或 (50x+) 短语. 实现见 [github.com/allenai/open-instruct/ scripts/data/filtering\_and\_updates/filter\_ngram\_repetitions.py](https://github.com/allenai/open-instruct/blob/7ba4cd0/scripts/data/filtering_and_updates/filter_ngram_repetitions.py)

6. Chinese language filtering In order to encourage Olmo 3 Think to stay in its intended language of English, we remove any post-training responses with 5% or higher prevalence of Chinese characters by searching over the range of Unicode character range of common Chinese characters. Implementation is available at [github.com/allenai/open-instruct/scripts/data/filtering\_and\_updates/filter\_ chinese.py](https://github.com/allenai/open-instruct/blob/7ba4cd0/scripts/data/filtering_and_updates/filter_chinese.py)

6. 中文过滤: 为促使 Olmo 3 Think 停留在目标语言英语, 我们移除后训练回复中中文字符占比 5% 及以上的样本, 做法是在常见汉字的 Unicode 字符范围内搜索. 实现见 [github.com/allenai/open-instruct/scripts/data/filtering\_and\_updates/filter\_ chinese.py](https://github.com/allenai/open-instruct/blob/7ba4cd0/scripts/data/filtering_and_updates/filter_chinese.py)

#### A.7.2 Tool-use data

**Additional details about the Science QA dataset** Citation graph-based queries are produced by prompting GPT-5 in a few-shot setup to create query templates, e.g., What are the top-three most cited papers by {AUTHOR} on {TOPIC}? which are subsequently instantiated with real paper entities. Content-based questions are generated by a GPT-5-based agent equipped with the ASC server, which retrieves relevant papers and formulates grounded questions that can be answered using retrieved text. For both types of queries, to obtain corresponding tool-use trajectories we employ a GPT-4.1-mini agent with access to the

<!-- page 109 of 118 -->

|  | 7B ThinkRL | 32B ThinkRL | 7B Instruct RL | 7B RL-Zero |
| --- | --- | --- | --- | --- |
| Dataset size | 104,869 | 104,869 | 171,950 | 13,314 |
| Learning rate | -61.0 × 10 | -62.0 × 10 | -61.0 × 10 | -61.0 × 10 |
| Minibatches | 1 | 1 | 4 | 1 |
| LR schedule | constant | constant | constant | constant |
| Training steps | 1,400 | 750 | 450 | 2,000 |
| Max prompt length | 2,048 | 2,048 | 2,048 | 2,048 |
| Response length | 32,768 | 32,768 | 8,192 | 16,384 |
| Unique prompts per batch | 64 | 128 | 64 | 32 |
| Group size | 8 | 8 | 8 | 8 |
| TIS cap | - | 2.0 | - | 2.0 |
| Sampling temperature | 1.0 | 1.0 | 1.0 | 1.0 |
| Clip-lower | 0.2 | 0.2 | 0.2 | 0.2 |
| Clip-higher | 0.272 | 0.272 | 0.272 | 0.272 |
| Num learner GPUs | 16 | 64 | 8 | 8 |
| Num actor GPUs | 56 | 160 | 56 | 64 |
| GPUs per actor (TP) | 1 | 8 | 1 | 1 |
| Max asynchrony | 1 | 8 | 8 | 8 |

Table 49 RL training hyperparameters for Olmo 3 Think, Olmo 3 Instruct and Olmo 3 RL-Zero. GPU hours assume NVIDIA H100 accelerator.

same ASC server. All tool call outputs are derived from actual environment responses rather than synthetic completions.

**Science QA 数据集补充细节** 引用图查询的做法是: few-shot 提示 GPT-5 生成查询模板, 例如 "What are the top-three most cited papers by {AUTHOR} on {TOPIC}?", 再用真实论文实体实例化. 内容类问题由配备 ASC 服务器的 GPT-5 智能体生成, 它检索相关论文并构造能由检索文本回答的落地问题. 对两类查询, 为获得对应的工具使用轨迹, 我们使用可访问同一 ASC 服务器的 GPT-4.1-mini 智能体. 所有工具调用的输出都来自真实环境响应, 而非合成补全.

**Additional details about the Web Search QA dataset** Given the varied quality of real-world queries, GPT-5 is employed to rate each query drawn from existing open-access benchmarks on a five-point scale assessing (i) whether it calls for comprehensive long-form responses, (ii) factual verifiability, and (iii) the degree of search required. Only queries scoring 4 or 5 on these criteria are retained. We then use an agent equipped with web search and browsing via the Serper API, and scientific snippet retrieval via ASC to generate tool-use trajectories for these queries. This agent is instructed with tool specifications and step-by-step search instructions, resulting in detailed trajectories containing both tool calls and environment outputs. We then filter out trajectories that yield incorrect answers (where ground truth is available), and only keep trajectories that adhere to the expected output format. Additionally, since the environment outputs for the webpage-fetching tool of the Serper API are quite long (typically entire webpages), we used GPT-5 to summarize the content of the web pages and only retained the summaries in the training data.

**Web Search QA 数据集补充细节** 真实世界查询质量参差, 我们用 GPT-5 以五点量表为每个取自现有开放基准的查询打分, 评估 (i) 是否需要全面的长文回复, (ii) 事实可验证性, (iii) 所需搜索的程度. 只保留在这些标准上得 4 或 5 分的查询. 随后, 我们用配备 Serper API 网页搜索与浏览能力及 ASC 科学片段检索能力的智能体为这些查询生成工具使用轨迹; 智能体收到工具规格与分步搜索指令, 产出同时包含工具调用与环境输出的详细轨迹. 接着滤除答案错误的轨迹 (在有标准答案时), 只保留符合预期输出格式的轨迹. 此外, 由于 Serper API 网页抓取工具的环境输出很长 (通常是整个网页), 我们用 GPT-5 对网页内容做摘要, 训练数据中只保留摘要.

**Additional details about simulated interaction trajectories** We run various post-hoc checks on synthesized datasets to verify whether the generated trajectories adhere to the prompts, and filter the dataset to create SimFC. We filter out trajectories where the function calls include functions not part of the presented APIs. Our data-synthesis prompts explicitly target multi-turn, multi-step, parallel function calls (i.e., multiple calls per assistant turn) and refusals, and we filter out the trajectories that do not conform to such requirements specified in the prompts.

**模拟交互轨迹补充细节** 我们对合成数据集做多种事后检查, 验证生成的轨迹是否遵循 prompt, 并过滤数据集以构建 SimFC. 若轨迹中的函数调用包含不属于所给 API 的函数, 则滤除. 我们的数据合成 prompt 明确要求多轮, 多步, 并行函数调用 (即每个 assistant 轮多次调用) 与拒答, 不符合 prompt 中这些要求的轨迹一律滤除.

#### A.7.3 Coding Data Synthesis Pipeline

To construct reinforcement learning (RL) data for code, we required pairs of (problem, test cases). We curate a diverse set of prompts for coding problems, including AceCoder (Zeng et al., 2025a), Klear-Reasoner Code (Su et al., 2025c), Nemotron Post-training Code (NVIDIA AI, 2025), SYNTHETIC-2 code (PrimeIntellect, 2025), Open-Code Reasoner (Ahmad et al., 2025). We use the klear-reasoner and SYNTHETIC-2 test cases directly. For the other datasets, we run prompts through the following synthetic data pipeline:

为构建代码的强化学习 (RL) 数据, 我们需要 (问题, 测试用例) 配对. 我们甄选了多样化的编程问题 prompt, 包括 AceCoder (Zeng et al., 2025a), Klear-Reasoner Code (Su et al., 2025c), Nemotron Post-training Code (NVIDIA AI, 2025), SYNTHETIC-2 code (PrimeIntellect, 2025), Open-Code Reasoner (Ahmad et al., 2025). klear-reasoner 与 SYNTHETIC-2 的测试用例直接使用; 其他数据集则把 prompt 送入下面的合成数据流水线:

<!-- page 110 of 118 -->

![Chart block](images/p110-figure-41-reward-kl-response-length-and-per-verifier.png)

Figure 41 Reward, KL, response length, and per-verifier reward over the final RL run for Olmo 3 Think.

| Dataset | Original Size | Format Filtering | Domain Filtering | General Filtering | Content Filtering | Repetition Filtering | Chinese Filtering | Final Size |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| WildChat (Tülu 3) | 57,407 | 1.61% | 14.57% | 0.75% | 3.10% | - | 1.09% | 45,917 |
| WildChat (New) | 74,997 | 1.53% | 48.09% | 0.80% | 3.13% | 0.02% | 1.16% | 36,417 |
| OpenAssistant1 | 7,094 | 0.08% | - | 0.22% | - | - | 3.86% | 6,800 |
| OpenThoughts3-Regen | 1,200,000 | 3.22% | - | 0.00% | - | &lt; 0.01% | 0.04% | 1,160,972 |
| Persona Precise IF | 224,448 | 0.19% | - | 0.03% | 0.29% | &lt; 0.01% | 0.08% | 223,123 |
| Val Precise IF (QwQ) | 286,003 | - | - | - | 0.62% | &lt; 0.01% | 1.17% | 135,851 |
| Synthetic-2-SFT-Verified | 104,913 | 0.01% | - | 0.06% | - | &lt; 0.01% | 0.32% | 104,569 |
| Saurabh Code Mix | 884,767 | - | - | - | - | &lt; 0.01% | &lt; 0.01% | 884,570 |
| CoCoNot | 10,460 | 0.57% | - | 1.57% | - | - | 0.10% | 10,227 |
| WildGuard | 38,794 | 0.37% | - | 1.17% | 0.54% | &lt; 0.01% | 0.12% | 38,315 |
| WildJailbreak | 41,420 | 0.13% | - | 0.21% | 0.61% | - | &lt; 0.01% | 41,100 |
| Aya | 98,863 | 0.15% | - | 1.70% | - | &lt; 0.01% | 5.62% | 98,598 |
| TableGPT | 4,982 | 0.02% | - | 0.00% | - | - | 0.06% | 4,981 |

Table 50 Filtering statistics showing percentage of prompts removed at each major filtering stage for reasoning datasets. “–” indicates filtering was not applicable or no samples were removed.

• Problem rewriting. Given a coding problem, we first prompted GPT-4.1 to rewrite the description so that it either (a) included a function signature, or (b) explicitly specified that the solution should read from and write to standard input/output (stdio)

- 问题改写: 给定一道编程题, 我们先提示 GPT-4.1 改写题面, 使其 (a) 包含函数签名, 或 (b) 明确说明解法应从标准输入读取并写出到标准输出 (stdio).

• Solution generation. GPT-4.1 was then prompted to provide a corresponding solution. Depending on the problem type, this was either a Python function matching the given signature, or a program reading from and writing to stdio. When the original problem source included a reference solution, we included it in the prompt

- 解答生成: 随后提示 GPT-4.1 给出对应解答. 视问题类型而定, 解答要么是匹配给定签名的 Python 函数, 要么是从 stdio 读写的程序. 当原始问题来源附带参考解答时, 我们把它一并放入 prompt.

<!-- page 111 of 118 -->

**Prompt for Generating Multi-Turn Function-calling Interactions**

You are provided an API with the details of the functions shown in a JSON format. Use this API to write a simulated interaction between a user, an assistant that can call the functions in the API, and the environment. The interaction should refer to three roles: "user", "assistant", and "environment". Their messages should be represented as Python dicts with "role" and "content" fields.

If the assistant is making function calls, they should be shown under a "function\_calls" field instead of the "content" field. The interaction should start with a user request, contain multiple steps of the assistant making function calls while interacting with the user for additional inputs, and should conclude with the assistant performing the user’s requested action. Please generate a simulated interaction with at least 5 function calls. Ensure that at the end of each turn, the assistant should address the request of the user by creating an assistant message with a text in the "content" field.

```txt
API:
[
  {"name": "get_borrowed_books", "description": "Get borrowed books by user ID",
    "parameters": {"user_id": {"type": "int"}}},
  {"name": "get_user_info", "description": "Get user information",
    "parameters": {"prefix": {"type": "str", "required": false},
      "email": {"type": "str", "required": false}}},
  {"name": "get_late_fines", "description": ...}
]

INTERACTION:
[
  {"role": "user", "content": "How many users with the name Yoda exist?"},
  {"role": "assistant", "function_calls": "get_user_info(prefix='Yoda')"},
  {"role": "environment", "content": "{\"results\": [{\"id\": 23}]"}},
  {"role": "assistant", "content": "There is one user with that name."},
  {"role": "user", "content": "How many books have they borrowed?"},
  ... additional turns ...
  {"role": "assistant", "content": "Luke Skywalker has borrowed one book."}
]

Here is the real task:
API: {}
INTERACTION:
```

Figure 42 Illustrative prompt for generating multi-turn function-calling interactions with simulated environment feedback (prompt has been truncated for readability).

• Test case generation. GPT-4.1 was further prompted to generate test cases in the appropriate format (function-based or stdio-based)

#### A.7.4 Dolci Instruct DPO Details

**DPO prompt mixing** See Table 51 for prompt mixing experiment results.

**DPO prompt 混合** prompt 混合实验结果见表 51.

**Model pool for LLM-judged pairs** To create the GPT-judged subset of Dolci Instruct DPO, we generate completions on our prompt pool with the following models: gpt-oss-20B, gpt-oss-120B (Agarwal et al., 2025), GPT-4.1-2025-04-14 (OpenAI, 2023b), Mistral-Small-24B-Instruct-2501, OLMo 2-1B-Instruct, OLMo 2-7B-Instruct, OLMo 2-13B-Instruct, OLMo 2-32B-Instruct (OLMo et al., 2024), Phi4-Mini-Instruct (Abdin et al., 2024), Gemma3-4B-it, Gemma3-12B-it, Gemma3-27B-it (Gemma 3 Team, 2025), Qwen3-Coder-30B-3A (no reasoning), Qwen3-0.6B (no reasoning), Qwen3-1.7B (no reasoning), Qwen3-4B (no reasoning), Qwen3-8B (no reasoning), Qwen3-14B (no reasoning), Qwen3-32B (no reasoning), Qwen3-30B-3A (no reasoning) (Yang et al., 2025a), QwQ-32b (Qwen Team, 2025), Yi-9B, and Yi-34B (Young et al., 2024).

**LLM 评判配对的模型池** 为构建 Dolci Instruct DPO 的 GPT 评判子集, 我们在 prompt 池上用以下模型生成补全: gpt-oss-20B, gpt-oss-120B (Agarwal et al., 2025), GPT-4.1-2025-04-14 (OpenAI, 2023b), Mistral-Small-24B-Instruct-2501, OLMo 2-1B-Instruct, OLMo 2-7B-Instruct, OLMo 2-13B-Instruct, OLMo 2-32B-Instruct (OLMo et al., 2024), Phi4-Mini-Instruct (Abdin et al., 2024), Gemma3-4B-it, Gemma3-12B-it, Gemma3-27B-it (Gemma 3 Team, 2025), Qwen3-Coder-30B-3A (no reasoning), Qwen3-0.6B (no reasoning), Qwen3-1.7B (no reasoning), Qwen3-4B (no reasoning), Qwen3-8B (no reasoning), Qwen3-14B (no reasoning), Qwen3-32B (no reasoning), Qwen3-30B-3A (no reasoning) (Yang et al., 2025a), QwQ-32b (Qwen Team, 2025), Yi-9B 与 Yi-34B (Young et al., 2024).

<!-- page 112 of 118 -->

![Image block](images/p112-figure-43-illustrative-prompt-for-generating-function.png)

Figure 43 Illustrative prompt for generating function-calling refusals, i.e., when the task is not feasible given the available functions (prompt has been truncated for readability).

For each prompt, we sample four model completions and judge them via a GPT-4.1 judge with the UltraFeedback judge prompts<sup>70</sup> (Lambert et al., 2024; Cui et al., 2023). To enforce a meaningful delta between chosen and rejected responses, we enforce our judge pipeline to sample responses from exactly two of the following smaller and/or previous generation models which show lower overall performance: OLMo 2-1B-Instruct, OLMo 2-7B-Instruct, Yi-9B, Yi-34B, Phi4-Mini-Instruct, Qwen3-0.6B (no reasoning), Qwen3-1.7B (no reasoning). Without this intervention (i.e. sample four models from the pool to judge at random), we would have an approximately 33% chance of sampling at least 2 weak models out of our 4 samples from our model pool for judgment, providing limited contrast in preference pairs. We binarize into preference pairs by selecting the worst response out of the four to be rejected, and the best as chosen.

对每个 prompt, 我们采样四个模型的补全, 用 GPT-4.1 评判器搭配 UltraFeedback 评判 prompt<sup>70</sup> (Lambert et al., 2024; Cui et al., 2023) 打分. 为保证被选与被拒回复之间有实质性差距, 我们强制评判流水线恰好从以下整体表现较弱的小型/上一代模型中选两个来采样回复: OLMo 2-1B-Instruct, OLMo 2-7B-Instruct, Yi-9B, Yi-34B, Phi4-Mini-Instruct, Qwen3-0.6B (no reasoning), Qwen3-1.7B (no reasoning). 若无此干预 (即随机从池中抽四个模型来评判), 我们从模型池抽 4 个样本时约有 33% 的概率至少抽到 2 个弱模型, 偏好配对就缺乏区分度. 二值化为偏好配对的做法: 四个回复中最差的作为被拒, 最好的作为被选.

<small><span class="docvortex-page-footnote" data-block-type="page_footnote" style="color:#6b7280">70<sub>We</sub> ran initial experiments employing a GPT-5 judge, but results indicatedthat the GPT-4.1 judge is better.</span></small>

<!-- page 113 of 118 -->

|  |  |  | Sub | set of Ol | mo 3 Ins | truct Be | nchmar | ks |  |  |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Name | Avg. | MMLU | BBH | GPQA | AGI | MATH | CHE | LCB | IFEval | AE2 |
| Development SFT | 50.1 | 66.3 | 44.2 | 29.9 | 58.6 | 56.2 | 70.0 | 13.8 | 82.1 | 29.8 |
| Base mix (uniform* sample) | 54.3 | 68.1 | 48.1 | 32.1 | 62.7 | 67.3 | 68.5 | 17.0 | 79.3 | 45.4 |
| Ablate code | 53.6 | 64.7 | 51.6 | 33.0 | 65.2 | 67.9 | 65.9 | 17.7 | 75.8 | 40.6 |
| Ablate math | 54.4 | 67.8 | 49.2 | 33.0 | 64.8 | 67.2 | 67.0 | 20.4 | 77.3 | 42.9 |
| Ablate science | 52.8 | 66.4 | 49.9 | 31.7 | 64.2 | 67.0 | 60.0 | 19.8 | 76.3 | 39.6 |
| Ablate chat | 53.1 | 67.1 | 51.3 | 30.6 | 64.8 | 67.6 | 59.3 | 21.2 | 76.3 | 39.3 |
| Ablate inst. following | 50.3 | 66.1 | 51.0 | 29.5 | 62.5 | 66.3 | 48.3 | 18.7 | 75.2 | 34.8 |
| Ablate safety | 51.0 | 66.3 | 48.6 | 34.2 | 63.5 | 67.3 | 51.0 | 18.1 | 74.7 | 35.4 |
| Ablate misc/SFT unused | 48.3 | 66.6 | 49.9 | 29.7 | 64.2 | 65.3 | 38.6 | 14.9 | 74.1 | 31.2 |
| Upsample code | 51.1 | 67.7 | 48.6 | 31.7 | 63.8 | 65.9 | 51.7 | 18.0 | 76.0 | 36.3 |
| Upsample math | 53.3 | 67.5 | 48.6 | 29.5 | 62.3 | 66.4 | 66.7 | 17.5 | 78.4 | 42.6 |
| Upsample chat | 53.0 | 67.0 | 46.8 | 30.6 | 61.6 | 65.7 | 68.3 | 15.6 | 76.9 | 44.7 |

Table 51 Development results for DPO prompt domain mixing. Overall, we find that (1) all prompt domains are useful for performant tuning, but (2) the exact optimal ratios for each domain are challenging to ascertain systematically since prompt domain does not necessarily correspond to the domains in which performance improves. (\*)Wildchat is limited to 35% of the base mix. All other prompts are uniformly sampled.

<!-- page 114 of 118 -->

### A.8 Post-Training Additional Evaluation Details

#### A.8.1 General Evaluation Settings

For post-training, we focus exclusively on generative evaluations, in which we generate completions until a max length is reached or eos token is generated (as opposed to multiple-choice-based evaluations used in pretraining), better matching real-world downstream usage.

后训练阶段, 我们只聚焦生成式评测: 生成补全直到达到最大长度或产生 eos token (不同于预训练所用的多项选择评测), 更贴近真实下游使用场景.

Following DeepSeek R1 report (Guo et al., 2025) and Nvidia Nemotron (Adler et al., 2024) we use a sampling temperature of 0.6 and top-p of 0.95. We strip thinking traces from the answer text when generated. We account for the variance this induces in smaller benchmarks (e.g. AIME, which is made up of 30 questions) by taking multiple samples and reporting the overall average performance. For QA tasks (e.g. BBH, MMLU), we create a unified set of ‘Olmo 3’ regexes for answer extraction, covering a wide variety of potential answer templates. We additionally update AlpacaEval 2 Length Controlled (LC) (Dubois et al., 2024) to use GPT-4.1 as a judge instead of the original GPT-4-Turbo (OpenAI, 2023b) both to increase the reliability of the evaluation and to save ∼90% of inference costs. Importantly, our evaluation settings are unified across thinker and instruct models, simplifying our evaluation development process.

沿用 DeepSeek R1 报告 (Guo et al., 2025) 与 Nvidia Nemotron (Adler et al., 2024) 的做法, 我们使用 0.6 的采样 temperature 与 0.95 的 top-p. 生成的答案文本会剥离 thinking 轨迹. 为抵消这给小型基准 (如仅 30 题的 AIME) 带来的方差, 我们多次采样并报告总体平均成绩. 对 QA 任务 (如 BBH, MMLU), 我们构造了一套统一的 "Olmo 3" 正则用于答案抽取, 覆盖多种多样的潜在答案模板. 我们还把 AlpacaEval 2 Length Controlled (LC) (Dubois et al., 2024) 的评判器从原始 GPT-4-Turbo (OpenAI, 2023b) 换成 GPT-4.1, 既提高评测可靠性, 又节省约 90% 的推理成本. 重要的是, 我们的评测设置在 thinker 与 instruct 模型间是统一的, 简化了评测开发流程.

**Is AlpacaEval useful?** Certainly! AlpacaEval, and similar evaluations, such as ChatBotArena (Zheng et al., 2023), MT-Bench (Zheng et al., 2023), Arena-Hard (Li et al., 2024c), etc. are established as crucial benchmarks for the AI industry. Let’s delve into the pros and cons of AlpacaEval:

**AlpacaEval 有用吗?** 当然! AlpacaEval 以及同类评测, 如 ChatBotArena (Zheng et al., 2023), MT-Bench (Zheng et al., 2023), Arena-Hard (Li et al., 2024c) 等, 已被确立为 AI 行业的关键基准. 我们来剖析 AlpacaEval 的利与弊:

It’s not a broken evaluation, it’s a trade-off. It’s well established that most people enjoy reading language model completions that have a bit of flair to them. In fact, the style of bold, lists, etc. can be very helpful when skimming information. It just can often go over the top—such as when too many emoji’s are included!

这不是一个坏掉的评测, 而是一种取舍. 众所周知, 大多数人喜欢读带点风格的语言模型补全. 粗体, 列表这类风格在扫读信息时往往很有帮助; 只是它常常做得过火, 比如塞进太多 emoji!

Pro: Ease-of-reading and flair

优点: 易读且带风格

Con: Over-optimized style

缺点: 被过度优化的风格

We’re incentivized to maximize the benchmark—even if we don’t like it. As a smaller lab, we need to work hard to put our models on the map! We don’t love the style of completions from models scoring high on these benchmarks, but we derive so much benefit from the attention it attracts.

我们有动力去刷这个基准, 哪怕我们并不喜欢它. 作为一家较小的实验室, 我们必须努力让自己的模型被看见! 我们并不喜欢在这些基准上高分模型的补全风格, 但它吸引来的关注给了我们太多实惠.

Pro: Simple comparison to known standards

优点: 便于与已知标准对比

Con: Imperfect performance signal

缺点: 性能信号不完美

There aren’t many better options! There are just so few evaluations that test a model’s ability to chat with the users reliably—and we need to serve the most common use case if we want adoption. More diversity of benchmarks, such as alternatives like multi-turn and instruction following, are slowly helping out understanding.

并没有多少更好的选择! 能可靠测试模型与用户聊天能力的评测实在太少, 而想要被采用就必须服务好最常见的使用场景. 更多样化的基准, 比如多轮, 指令遵循等替代评测, 正在慢慢改善我们的认识.

Pro: Common adoption

优点: 被业界普遍采用

Con: Low diversity in chat evaluations

缺点: 聊天类评测多样性不足

Bonus: There’s something poetic about having LLMs judge LLMs.

额外一提: 让 LLM 评判 LLM, 多少有些诗意.

In summary, we need evaluations like this to make sure the model is behaving as expected. When it comes to balancing style and benchmarks, at the end of the day, no-one’s perfect—not even us.

总之, 我们需要这类评测来确保模型表现符合预期. 在风格与基准之间权衡时, 说到底, 没有谁是完美的, 我们也不例外.

#### A.8.2 Safety Evaluations Overview

The safety evaluations that were tested upon during training runs and whose average was reported earlier were the same set from OLMo 2 (OLMo et al., 2024) and Tülu 3 (Lambert et al., 2024). In addition to the development safety evaluations, we also evaluate our models on four new safety evaluations, chosen due to their prevalence in recent LLM safety evaluations (Kaiyom et al., 2024; Kavukcuoğlu and DeepMind, 2025; Anthropic, 2025; Cai et al., 2025; OpenAI, 2025; Lambert et al., 2024).

训练过程中测试并报告均值的安全评测, 与 OLMo 2 (OLMo et al., 2024) 和 Tülu 3 (Lambert et al., 2024) 用的是同一套. 除开发期安全评测外, 我们还评估了四个新的安全评测, 选择理由是它们在近期 LLM 安全评测中应用普遍 (Kaiyom et al., 2024; Kavukcuoğlu and DeepMind, 2025; Anthropic, 2025; Cai et al., 2025; OpenAI, 2025; Lambert et al., 2024).

<small><span class="docvortex-page-footnote" data-block-type="page_footnote" style="color:#6b7280">71<sub>We</sub> find that both thinking models degenerate quickly when evaluated with low temperatures (as used in OLMo 2), while instruction models can be evaluated at this higher temperature.</span></small>

<!-- page 115 of 118 -->

<table><tr><td rowspan="2" colspan="2">Benchmark</td><td colspan="3">OLMo 3 7B Think</td><td colspan="6">Baselines</td></tr><tr><td>SFT</td><td>DPO</td><td>Final Think</td><td>Open-Thinker3 7B</td><td>Nemotron Nano 9B v2</td><td>DS-R1 Qwen 7B</td><td>Qwen 3 8B</td><td>Qwen 3 VL 8B Think</td><td>OR Nemotron 7B</td></tr><tr><td colspan="2">DoAnythingNow</td><td>19.3</td><td>19.6</td><td>23.4</td><td>1.8</td><td>56.7</td><td>34.3</td><td>53.1</td><td>83.0</td><td>2.3</td></tr><tr><td colspan="2">HarmBench</td><td>67.8</td><td>72.7</td><td>75.4</td><td>26.7</td><td>69.4</td><td>50.7</td><td>74.0</td><td>81.9</td><td>20.0</td></tr><tr><td colspan="2">TrustLLM-JailbreakTrigger</td><td>64.8</td><td>65.2</td><td>72.0</td><td>2.9</td><td>62.6</td><td>50.1</td><td>56.7</td><td>77.0</td><td>6.9</td></tr><tr><td>WildJailbreak-Test</td><td>Harmful</td><td>23.4</td><td>27.5</td><td>39.0</td><td>0.3</td><td>28.7</td><td>4.5</td><td>12.3</td><td>38.6</td><td>0.5</td></tr><tr><td>WildJailbreak-Test</td><td>Benign</td><td>99.1</td><td>98.5</td><td>98.8</td><td>99.2</td><td>97.3</td><td>98.0</td><td>99.7</td><td>98.0</td><td>97.1</td></tr><tr><td colspan="2">WildGuard-Test</td><td>90.2</td><td>93.9</td><td>93.8</td><td>48.8</td><td>88.4</td><td>69.2</td><td>82.9</td><td>93.0</td><td>42.6</td></tr><tr><td colspan="2">XSTest</td><td>91.6</td><td>91.6</td><td>90.9</td><td>59.5</td><td>92.5</td><td>68.4</td><td>87.2</td><td>94.2</td><td>61.0</td></tr><tr><td>BBQ</td><td>Accuracy</td><td>86.6</td><td>84.8</td><td>89.2</td><td>80.5</td><td>92.0</td><td>78.0</td><td>91.8</td><td>86.6</td><td>82.6</td></tr><tr><td>BBQ</td><td>Bias - Ambig.</td><td>7.3</td><td>8.4</td><td>6.5</td><td>11.3</td><td>5.8</td><td>9.4</td><td>5.5</td><td>8.9</td><td>7.1</td></tr><tr><td>BBQ</td><td>Bias - Disambig.</td><td>1.7</td><td>1.1</td><td>1.7</td><td>2.4</td><td>0.7</td><td>2.4</td><td>1.5</td><td>1.0</td><td>2.3</td></tr><tr><td colspan="2">StrongReject</td><td>74.8</td><td>75.5</td><td>79.0</td><td>56.7</td><td>85.6</td><td>72.4</td><td>73.4</td><td>82.8</td><td>58.3</td></tr><tr><td colspan="2">Toxigen</td><td>100</td><td>99.9</td><td>100</td><td>97.4</td><td>100</td><td>99.7</td><td>100</td><td>99.9</td><td>86.4</td></tr><tr><td colspan="2">WMDP</td><td>46.4</td><td>43.4</td><td>42.7</td><td>45.5</td><td>38.3</td><td>55.9</td><td>34.9</td><td>38.7</td><td>51.8</td></tr></table>

Table 52 Olmo 3 Think 7B and comparisons on the safety benchmarks. All numbers are the mean of three runs.

<table><tr><td rowspan="2" colspan="2">Benchmark</td><td colspan="3">OLMo 3 7B Instruct</td><td colspan="6">Baselines</td></tr><tr><td>SFT</td><td>DPO</td><td>Final In-struct</td><td>Qwen 3 8B (No Thinking)</td><td>Qwen 3 VL 8B Inst</td><td>Qwen 2.5 7B</td><td>OLMo 2 7B Inst</td><td>Apertus 8B Inst</td><td>Granite 3.3 8B Inst</td></tr><tr><td colspan="2">DoAnythingNow</td><td>90.0</td><td>82.9</td><td>75.2</td><td>81.2</td><td>53.8</td><td>59.0</td><td>92.0</td><td>43.1</td><td>36.8</td></tr><tr><td colspan="2">HarmBench</td><td>87.7</td><td>94.3</td><td>94.9</td><td>74.2</td><td>84.6</td><td>80.1</td><td>88.8</td><td>79.3</td><td>86.3</td></tr><tr><td colspan="2">TrustLLM-JailbreakTrigger</td><td>84.8</td><td>85.2</td><td>79.2</td><td>76.8</td><td>76.1</td><td>63.8</td><td>85.8</td><td>55.4</td><td>63.6</td></tr><tr><td>WildJailbreak-Test</td><td>Harmful</td><td>80.9</td><td>72.5</td><td>69.1</td><td>21.2</td><td>37.4</td><td>13.4</td><td>76.8</td><td>43.0</td><td>66.4</td></tr><tr><td>WildJailbreak-Test</td><td>Benign</td><td>88.1</td><td>96.4</td><td>98.0</td><td>99.3</td><td>97.3</td><td>99.3</td><td>96.8</td><td>94.4</td><td>84.7</td></tr><tr><td>WildGuard-Test</td><td></td><td>98.8</td><td>99.8</td><td>99.6</td><td>86.8</td><td>91.0</td><td>87.5</td><td>99.2</td><td>89.9</td><td>93.8</td></tr><tr><td>XSTest</td><td></td><td>91.3</td><td>93.1</td><td>93.2</td><td>91.3</td><td>93.2</td><td>93.8</td><td>93.9</td><td>90.1</td><td>89.9</td></tr><tr><td>BBQ</td><td>Accuracy</td><td>74.3</td><td>75.5</td><td>79.0</td><td>87.6</td><td>87.9</td><td>88.5</td><td>74.6</td><td>73.4</td><td>68.8</td></tr><tr><td>BBQ</td><td>Bias - Ambig.</td><td>9.1</td><td>9.3</td><td>8.6</td><td>8.5</td><td>7.8</td><td>6.8</td><td>9.4</td><td>7.0</td><td>4.5</td></tr><tr><td>BBQ</td><td>Bias - Disambig</td><td>4.4</td><td>3.4</td><td>2.7</td><td>1.8</td><td>-0.1</td><td>3.5</td><td>2.7</td><td>2.5</td><td>2.7</td></tr><tr><td>StrongReject</td><td></td><td>93.5</td><td>89.2</td><td>88.1</td><td>83.5</td><td>85.3</td><td>78.2</td><td>89.4</td><td>76.9</td><td>82.0</td></tr><tr><td>Toxigen</td><td></td><td>100.0</td><td>100.0</td><td>100.0</td><td>100.0</td><td>100.0</td><td>100.0</td><td>100.0</td><td>100.0</td><td>100.0</td></tr><tr><td>WMDP</td><td></td><td>47.2</td><td>45.3</td><td>45.5</td><td>35.8</td><td>35.6</td><td>41.3</td><td>51.6</td><td>48.5</td><td>46.9</td></tr></table>

Table 53 Olmo 3 Instruct 7B results and comparisons on the safety benchmarks. All numbers are the mean of three runs.

**Development safety evaluations** We include HarmBench (Mazeika et al., 2024), DoAnythingNow (DAN; Shen et al., 2024), XSTest (Röttger et al., 2023), WildGuard-Test (Han et al., 2024), WildJailbreak-Test (Jiang et al., 2024), and TrustLLM-JailbreakTrigger (Huang et al., 2024a).

**开发期安全评测** 包括 HarmBench (Mazeika et al., 2024), DoAnythingNow (DAN; Shen et al., 2024), XSTest (Röttger et al., 2023), WildGuard-Test (Han et al., 2024), WildJailbreak-Test (Jiang et al., 2024) 与 TrustLLM-JailbreakTrigger (Huang et al., 2024a).

**Unseen safety evaluations** We further evaluated on four held-out safety benchmarks: Toxigen (Hartvigsen et al., 2022), StrongReject (Souly et al., 2024), Weapons of Mass Destruction Proxy (WMDP; Li et al., 2024b), and Bias Benchmark for QA (BBQ; Parrish et al., 2022).

**未见过的安全评测** 我们还在四个 held-out 安全基准上评测: Toxigen (Hartvigsen et al., 2022), StrongReject (Souly et al., 2024), 大规模杀伤性武器代理基准 (WMDP; Li et al., 2024b), 以及问答偏见基准 (BBQ; Parrish et al., 2022).

**Averaging and reported metrics** Safety and accuracy scores are aggregated according to benchmark protocol, with all reported metrics normalized such that higher values are better (1 indicates perfect safety performance). Specifically, we report the average of: refusal accuracy, i.e., inverted ASR (Attack Success Rate), for DoAnythingNow, Harmbench, Wildguard, TrustLLM-JailbreakTrigger, Toxigen, and StrongReject; accuracy for XSTest and BBQ; the average of inverted ASR for Wildjailbreak (harmful) and ASR for Wildjailbreak (benign); and inverted accuracy (i.e., error rate) for WMDP. For the safety benchmarks, models were evaluated with a top-p of 0.95 and sampling temperature of 0.7.

**平均与报告指标** 安全与准确分数按各基准协议聚合, 所有报告指标均归一化为越高越好 (1 表示完美安全表现). 具体而言, 我们报告: DoAnythingNow, HarmBench, WildGuard, TrustLLM-JailbreakTrigger, Toxigen 与 StrongReject 的拒答准确率 (即反转后的 ASR (攻击成功率)); XSTest 与 BBQ 的准确率; WildJailbreak (有害) 的反转 ASR 与 WildJailbreak (良性) 的 ASR 的平均; 以及 WMDP 的反转准确率 (即错误率). 安全基准评测使用 top-p 0.95 与采样 temperature 0.7.

We explain all of the evaluations in more detail below:

下面逐一详细说明各评测:

• HarmBench (Mazeika et al., 2024) evaluates models’ refusal to comply with a diverse suite of harmful prompts, distributed across both functional and semantic categories. The benchmark contains 320 harmful prompts, covering functional behaviors including "standard" harms from sources like AdvBench and TDC 2023 Red Teaming, prompts testing for copyright violations, and contextual prompts (i.e., prompts combining

<!-- page 116 of 118 -->

| Benchmark |  | SFT | OLMo 3 DPO | 32B Think TF3hin.i0nakl | TFh3ini.n1akl | Qw32eBn 3 | BaselQVTwLh3ein2nkB3 | inesD3S2-BR1 | 7sK0t2rB-uVIcn2t- |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| DoAnythingNow |  | 16.7 | 15.6 | 20.2 | 54.7 | 59.0 | 88.7 | 46.0 | 100.0 |
| HarmBench |  | 66.5 | 69.7 | 73.5 | 89.7 | 67.3 | 75.2 | 64.0 | 99.7 |
| TrustLLM-JailbreakTrigger |  | 68.3 | 69.6 | 73.3 | 86.4 | 60.7 | 75.6 | 55.3 | 91.4 |
| WildJailbreak-Test | Harmful | 17.6 | 17.5 | 25.6 | 71.7 | 12.6 | 47.0 | 13.7 | 99.6 |
| WildJailbreak-Test | Benign | 99.2 | 99.6 | 99.7 | 92.3 | 100.0 | 94.0 | 99.2 | 5.7 |
| WildGuard-Test |  | 86.3 | 86.5 | 89.4 | 96.9 | 81.3 | 92.9 | 81.7 | 99.3 |
| XSTest |  | 93.0 | 92.1 | 93.9 | 91.8 | 89.6 | 93.4 | 78.1 | 87.9 |
| BBQ | Accuracy | 90.6 | 88.5 | 88.2 | 85.5 | 89.7 | 90.5 | 88.1 | 89.7 |
| BBQ | Bias - Ambig. | 6.9 | 8.2 | 9.2 | 12.3 | 7.1 | 5.6 | 8.1 | 5.0 |
| BBQ | Bias - Disambig. | 0.8 | 0.2 | 1.1 | -0.2 | 0.1 | 0.0 | 0.4 | -0.1 |
| StrongReject |  | 75.9 | 77.2 | 80.8 | 90.5 | 79.3 | 88.5 | 79.1 | 90.7 |
| Toxigen |  | 100.0 | 100.0 | 100.0 | 100.0 | 100.0 | 99.9 | 100.0 | 100.0 |
| WMDP |  | 40.2 | 34.9 | 34.8 | 32.7 | 24.0 | 31.0 | 30.9 | 35.6 |

Table 54 Olmo 3 Think 32B and comparisons on the safety benchmarks. All numbers are the mean of three runs.

an instruction with a context such as a document).72 The semantic category includes prompts representing seven types of real-world harms: cybercrime, unauthorized intrusion, chemical/biological/drug-related, copyright infringement, misinformation, harassment, illegal activities, and general harm. Model outputs are evaluated for safety of output using the WildGuard classifier’s safety label (Han et al., 2024).

- HarmBench (Mazeika et al., 2024) 评测模型对一组多样化的有害 prompt 的拒绝能力, prompt 按功能与语义两类分布. 基准含 320 个有害 prompt, 功能类覆盖 "标准" 危害 (来自 AdvBench 与 TDC 2023 Red Teaming 等来源), 测试版权侵权的 prompt, 以及上下文 prompt (即指令与文档等上下文结合的 prompt).72 语义类则代表七类现实危害: 网络犯罪, 未授权入侵, 化学/生物/毒品相关, 版权侵权, 虚假信息, 骚扰, 非法活动与一般危害. 模型输出的安全性用 WildGuard 分类器的安全标签评判 (Han et al., 2024).

• DoAnythingNow (DAN; Shen et al., 2024) tests models’ robustness to the well-known DAN jailbreak framework by pairing DAN-style jailbreak templates with harmful behaviors adapted from HarmBench. For this evaluation, we subsample 300 representative prompts from the full benchmark. Prompt content spans diverse instruction-jailbreak combinations aiming to bypass safety guardrails. We compute refusal accuracy using the WildGuard classifier’s refusal label (Han et al., 2024) to assess whether model outputs refuse or comply with the harmful instructions.

- DoAnythingNow (DAN; Shen et al., 2024) 把 DAN 风格的越狱模板与改编自 HarmBench 的有害行为配对, 测试模型对知名 DAN 越狱框架的鲁棒性. 本评测从完整基准中抽 300 个代表性 prompt, 内容覆盖试图绕过安全防护的多样指令-越狱组合. 我们用 WildGuard 分类器的拒答标签 (Han et al., 2024) 计算拒答准确率, 衡量模型输出是拒绝还是服从有害指令.

• XSTest (Röttger et al., 2023) measures models’ over-refusal tendencies, i.e., their ability to distinguish harmful requests from superficially similar but benign prompts. The benchmark includes 200 unsafe prompts and 250 safe prompts that mimic the form or vocabulary of unsafe requests. Prompt categories include homonyms, figurative language, safe targets, safe contexts, definitions, real/nonsense group discrimination, historical events, public and fictional privacy scenarios, among others. As with the two previous benchmarks, we evaluate models’ outputs via refusal accuracy with WildGuard’s refusal label (Han et al., 2024).

- XSTest (Röttger et al., 2023) 衡量模型的过度拒绝倾向, 即区分有害请求与表面相似但良性的 prompt 的能力. 基准含 200 个不安全 prompt 与 250 个模仿不安全请求形式或措辞的安全 prompt, 类别包括同音词, 比喻语言, 安全目标, 安全语境, 定义, 真实/虚构群体歧视, 历史事件, 公开与虚构隐私场景等. 与前两个基准相同, 我们用 WildGuard 拒答标签 (Han et al., 2024) 以拒答准确率评判模型输出.

• WildGuard-Test (Han et al., 2024) provides a comprehensive evaluation of prompt harm, response harm, and response refusal across a set of 1,725 items. Prompts are collected from adversarial synthetic data and real in-the-wild user interactions with LLMs. We evaluate on the subset of 749 adversarial prompts. The evaluation reports the safety of outputs using the WildGuard classifier’s safety label, capturing both the model’s ability to refuse harmful queries and to respond appropriately to benign prompts.

- WildGuard-Test (Han et al., 2024) 对 1725 个条目综合评测 prompt 危害, 回复危害与回复拒答. prompt 来自对抗性合成数据与真实场景下用户和大模型的交互. 我们在 749 个对抗性 prompt 的子集上评测. 评测用 WildGuard 分类器的安全标签报告输出安全性, 同时考察模型拒绝有害查询的能力与恰当回应良性 prompt 的能力.

• WildJailbreak-Test (Jiang et al., 2024) assesses model safeguards in the face of advanced, adversarial jailbreak attacks across both harmful and benign contexts. The dataset comprises 2,000 adversarially crafted harmful prompts and 250 adversarial benign queries intended to measure over-refusals. We evaluate models refusal accuracy using WildGuard’s refusal label: refusals are desirable on harmful queries (indicating stronger refusals), and non-refusals are desired on benign queries (indicating fewer unnecessary refusals).

- WildJailbreak-Test (Jiang et al., 2024) 评估模型在有害与良性两种语境下面对高级对抗性越狱攻击时的防护能力. 数据集含 2000 个对抗构造的有害 prompt 与 250 个对抗性良性查询 (用于衡量过度拒绝). 我们用 WildGuard 拒答标签评估拒答准确率: 有害查询上拒答是好的 (防护更强), 良性查询上不应拒答 (不必要的拒绝更少).

• TrustLLM-JailbreakTrigger (Huang et al., 2024a) tests susceptibility to 13 distinct jailbreak attack methods with a suite of 400 prompts. Prompts are equally split between two types: "Questions about Bad Behaviors" and "Instructions to generate Toxic Content". This benchmark evaluates whether models safety mechanisms withstand a variety of jailbreak strategies and measures the toxicity of outputs produced under attack. The main metric is the refusal accuracy, reported using WildGuard’s refusal label.

- TrustLLM-JailbreakTrigger (Huang et al., 2024a) 用 400 个 prompt 测试模型对 13 种不同越狱攻击方法的易感性. prompt 均分为两类: "关于不良行为的问题" 与 "生成有毒内容的指令". 该基准评估模型安全机制能否抵御多种越狱策略, 并衡量攻击下输出的毒性. 主要指标是拒答准确率, 用 WildGuard 拒答标签报告.

• Toxigen (Hartvigsen et al., 2022) tests whether models’ comply with instructions to generate toxic or stereotypical sentences for given demographic groups. Each prompt includes a list of 10 examples of toxic sentences, to which an unsafe model would add new toxic sentences. We subsampled a random set of 1400 input prompts divided equally between demographic subcategories from ToxiGen: Asian, Black,

<small><span class="docvortex-page-footnote" data-block-type="page_footnote" style="color:#6b7280">72<sub>In</sub> our implementation, the context string is merged into the input prompt for contextual examples.</span></small>

<small><span class="docvortex-page-footnote" data-block-type="page_footnote" style="color:#6b7280">73<sub>Refusal</sub> accuracy corresponds to 1-ASR (attack success rate).</span></small>

<!-- page 117 of 118 -->

| Benchmark |  | Olmo SFT | 3.1 32B DPO | InstructInFs3itn.r1aulct | Ap7e0rBtus | 3QT2wihBneign(n)Nk3-o | QVswLtIrn3eu-2ncBt3 | Baselines2Q.5w3e2nB | G3em27mBa | G2em27mBa | OL3M2Bo 2 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| DoAnythingNow |  | 93.6 | 84.9 | 85.2 | 43.6 | 87.7 | 88.3 | 75.4 | 30.7 | 29.4 | 73.3 |
| HarmBench |  | 90.5 | 93.9 | 96.0 | 84.4 | 77.3 | 80.6 | 87.9 | 71.4 | 90.8 | 89.0 |
| TrustLLM-JailbreakTrigger |  | 91.3 | 86.0 | 85.3 | 76.2 | 82.2 | 89.0 | 82.9 | 71.7 | 75.6 | 77.0 |
| WildJailbreak-Test | Harmful | 83.5 | 51.5 | 60.5 | 50.9 | 25.7 | 40.2 | 22.6 | 17.4 | 39.8 | 50.3 |
| WildJailbreak-Test | Benign | 86.9 | 99.6 | 98.8 | 93.7 | 99.3 | 98.7 | 99.6 | 99.5 | 98.5 | 99.1 |
| WildGuard-Test |  | 98.9 | 98.3 | 97.8 | 95.4 | 89.6 | 93.5 | 91.7 | 88.4 | 92.0 | 98.3 |
| XSTest |  | 93.0 | 95.1 | 93.1 | 91.0 | 90.1 | 93.7 | 94.0 | 92.1 | 89.6 | 92.7 |
| BBQ | Accuracy | 85.5 | 86.1 | 86.7 | 83.0 | 87.3 | 91.9 | 91.1 | 83.2 | 86.2 | 84.1 |
| BBQ | Bias - Ambig. | 8.6 | 11.0 | 9.2 | 7.7 | 10.6 | 5.9 | 7.7 | 11.2 | 10.2 | 9.8 |
| BBQ | Bias - Disambig. | 1.3 | 0.6 | 1.0 | 1.8 | -1.0 | 0.0 | 0.5 | 1.2 | -0.1 | 2.2 |
| StrongReject |  | 95.5 | 89.3 | 91.7 | 81.2 | 86.9 | 90.2 | 85.6 | 84.6 | 88.1 | 87.4 |
| Toxigen |  | 100.0 | 100.0 | 100.0 | 100.0 | 100.0 | 100.0 | 100.0 | 99.5 | 100.0 | 100.0 |
| WMDP |  | 39.4 | 34.7 | 33.5 | 44.2 | 28.6 | 25.5 | 32.8 | 38.4 | 40.9 | 42.6 |

Table 55 Olmo 3.1 32B Instruct and comparisons on the safety benchmarks. All numbers are the mean of three runs.

Chinese, Jewish, Latino, LGBTQ, Mental Disability, Muslim, Native American, Physical Disability, Trans, Women. We report the toxicity score of the model’s output, measured by the ToxiGen RoBERTa-based trained classifier.<sup>74</sup>

- Toxigen (Hartvigsen et al., 2022) 测试模型是否会服从指令, 为给定人口群体生成有毒或带刻板印象的句子. 每个 prompt 附 10 句有毒示例, 不安全的模型会接着写新的有毒句子. 我们随机抽 1400 个输入 prompt, 在 ToxiGen 的各人口子类别间均分: 亚裔, 黑人, 华裔, 犹太裔, 拉丁裔, LGBTQ, 精神残疾, 穆斯林, 美洲原住民, 身体残疾, 跨性别者, 女性. 我们报告模型输出的毒性分数, 由基于 RoBERTa 训练的 ToxiGen 分类器测量.<sup>74</sup>

• StrongReject (Souly et al., 2024) assesses models’ susceptibility to advanced jailbreak prompts intended to elicit forbidden content. Each input prompt is a real-world adversarial instruction, constructed to evade common safety guardrails using one of 37 jailbreak techniques, plus a baseline with no jailbreak. We subsampled approximately 20% of the full benchmark, resulting in 2,294 unique prompts, maintaining the diversity of jailbreak techniques and forbidden instruction topics. The model’s output is scored on a 1-5 safety scale according to the risk or compliance with the forbidden prompt, using a classifier that is uses a version of the StrongReject classifier that is a LoRa adapter merged with the base Gemma-2B (Gemma Team et al., 2024) model by the benchmark creators. The final evaluation metric is a weighted sum over the probability distribution across possible scores computed via log-probabilities of top-scoring response tokens, which is then reversed such that higher scores indicate higher safety.

- StrongReject (Souly et al., 2024) 评估模型对旨在引出违禁内容的高级越狱 prompt 的易感性. 每个输入 prompt 都是一条真实世界的对抗性指令, 用 37 种越狱技术之一构造以规避常见安全防护, 另设无越狱的基线. 我们抽取完整基准约 20%, 得到 2294 个不重复 prompt, 保持了越狱技术与违禁指令主题的多样性. 模型输出按 1-5 安全量表打分, 依据是对违禁 prompt 的风险或服从程度; 打分使用基准作者提供的 StrongReject 分类器版本, 它是与基础 Gemma-2B (Gemma Team et al., 2024) 合并的 LoRA 适配器. 最终评测指标是各可能分数概率分布上的加权和 (由最高分回复 token 的 log 概率计算), 再反转, 使分数越高表示越安全.

• Weapons of Mass Destruction Proxy (WMDP) (Li et al., 2024b) evaluates whether models can provide answers to dual-use knowledge questions in the domains of biology, chemistry, and cybersecurity. Each prompt is a factual multiple choice question related to weapons of mass destruction, with four answer options and one correct answer. We sample 20% of the full benchmark, yielding 734 total questions distributed across the original biological (1273), chemical (408), and cybersecurity (1987) test sets. Prompts include the instruction we use when evaluating MMLU (Wang et al., 2024a):

- 大规模杀伤性武器代理基准 (WMDP) (Li et al., 2024b) 评估模型能否回答生物, 化学与网络安全领域的两用知识问题. 每个 prompt 是一道与大规模杀伤性武器相关的事实性多项选择题, 四个选项中有一个正确答案. 我们抽取完整基准的 20%, 共 734 题, 分布在原有的生物 (1273 题), 化学 (408 题) 与网络安全 (1987 题) 测试集上. prompt 带有我们评测 MMLU (Wang et al., 2024a) 时使用的指令:

The following are multiple choice questions. Summarize your reasoning concisely, then conclude

with ’Therefore, the answer is: X’ where X is one of A, B, C, or D.\n \n Models’ outputs are evaluated via exact match (based on regex parsing) where only outputs with a correctly formatted, unambiguous final answer string are considered correct.

Bias Benchmark for QA (BBQ) (Parrish et al., 2022) measures bias and stereotype adherence by presenting models with multiple choice questions targeting social dimensions such as age, gender, race, religion, and intersectional identities. The benchmark includes questions split by 11 subcategories, each clustered along axes of ambiguous vs. unambiguous and stereotypical vs. anti-stereotypical framing, and sometimes presence or absence of names. For our evaluation, we drew a subset of ∼500 questions per subcategory (excluding intersectional combinations), distributed evenly across prompt types (ambiguous/unambiguous, stereotypical/anti-stereotypical, and, with or without names), resulting in 4482 total instances. Each prompt is presented in the same structured format as WMDP. Model responses are evaluated for accuracy (proportion of correct answers) and for bias, using a regex-based string parser (similar to BBQ). Accuracy simply measures whether models picked the right answer. Bias is quantified according to the protocol in Parrish et al. (2022): ambiguous and disambiguated bias scores are computed as the frequency

<small><span class="docvortex-page-footnote" data-block-type="page_footnote" style="color:#6b7280">74<a href="https://huggingface.co/tomh/toxigen_roberta"><sub>huggingface</sub>.co/tomh/toxigen\_roberta</a></span></small>

<small><span class="docvortex-page-footnote" data-block-type="page_footnote" style="color:#6b7280">75<a href="https://huggingface.co/qylu4156/strongreject-15k-v1"><sub>huggingface</sub>.co/qylu4156/strongreject-15k-v1</a></span></small>

<small><span class="docvortex-page-footnote" data-block-type="page_footnote" style="color:#6b7280">76<sub>Note</sub> that this is different from the more restrictive HELM-Safety prompting format Kaiyom et al. (2024) which only scores based on the first generated token.</span></small>

<!-- page 118 of 118 -->

with which non-unknown outputs reinforce stereotypes within each prompt type (e.g., the model incorrectly picks the stereotypical answer).

BBQ (Parrish et al., 2022) 通过向模型提出针对年龄, 性别, 种族, 宗教与交叉身份等社会维度的多项选择题, 衡量偏见与刻板印象依附程度. 基准的问题按 11 个子类别划分, 每个类别又沿 歧义/无歧义 与 刻板/反刻板 的框架轴聚类, 有时还区分是否出现人名. 我们的评测从每个子类别抽约 500 题 (排除交叉身份组合), 在各 prompt 类型 (歧义/无歧义, 刻板/反刻板, 有无人名) 间均匀分布, 共 4482 个实例. 每个 prompt 使用与 WMDP 相同的结构化格式. 模型回复按准确率 (答对比例) 与偏见评估, 用基于正则的字符串解析器判分 (与 BBQ 类似). 准确率只衡量是否选对答案; 偏见按 Parrish et al. (2022) 的协议量化: 歧义与消歧偏见分数计算为非 "未知" 输出在各 prompt 类型中强化刻板印象的频率 (例如模型错误地选择了带刻板印象的答案).

118
