---
title: "MiMo-7B · 对照译稿"
category: "模型库"
tags: ["MiMo", "对照译稿"]
published: true
excerpt: "MiMo-7B 公开材料的逐段中英对照译稿,附读报告时的疑问块."
---
<!-- page 1 of 28 -->

arXiv:2505.07608v2 [cs.CL] 5 Jun 2025

Xiaomi MiMo

MI

# MiMo: Unlocking the Reasoning Potential of Language Model – From Pretraining to Posttraining

LLM-Core Xiaomi

## Abstract

We present MiMo-7B, a large language model born for reasoning tasks, with optimization across both pre-training and post-training stages. During pre-training, we enhance the data preprocessing pipeline and employ a three-stage data mixing strategy to strengthen the base model’s reasoning potential. MiMo-7B-Base is pre-trained on 25 trillion tokens, with additional Multi-Token Prediction objective for enhanced performance and accelerated inference speed. During post-training, we curate a dataset of 130K verifiable mathematics and programming problems for reinforcement learning, integrating a test-difficulty–driven code-reward scheme to alleviate sparse-reward issues and employing strategic data resampling to stabilize training. Extensive evaluations show that MiMo-7B-Base possesses exceptional reasoning potential, outperforming even much larger 32B models. The final RL-tuned model, MiMo-7B-RL, achieves superior performance on mathematics, code and general reasoning tasks, surpassing the performance of OpenAI o1-mini. The model checkpoints are available at [https://github.com/xiaomimimo/MiMo](https://github.com/xiaomimimo/MiMo).

我们提出面向推理任务而生的大语言模型 MiMo-7B, 在预训练与后训练两端都做了针对性优化. 预训练阶段强化数据预处理流水线, 并用三阶段数据混合抬高底座的推理潜力. MiMo-7B-Base 在 25 万亿 token 上预训练, 并加入 Multi-Token Prediction 目标以提升性能与推理速度. 后训练阶段整理 130K 道可核验数学与编程题做强化学习, 引入由测例难度驱动的代码奖励以缓解稀疏奖励, 再用策略性重采样稳住训练. 大量评测显示 MiMo-7B-Base 推理潜力突出, 甚至超过更大的 32B 模型. 最终 RL 调优的 MiMo-7B-RL 在数学, 代码与一般推理上表现更强, 超过 OpenAI o1-mini. 权重见 [https://github.com/xiaomimimo/MiMo](https://github.com/xiaomimimo/MiMo).

LiveCodeBench v5

![Chart block](images/p01-aime-2024-2025.png)

AIME 2024-2025

![Chart block](images/p01-figure-1-performance-of-mimo-7b-in-code-and-math.png)

Figure 1 Performance of MiMo-7B in code and math reasoning benchmark.
图 1 MiMo-7B 在代码与数学推理基准上的表现.

> **想:** Abstract 写 Base 在 25 万亿 token 上预训练, 又写后训练题库 130K. 正文 §2.1 与 §3.2 是否把这两个量分别落在预训练语料与 RL 题量, 而不是同一管道的累计?
> 是. §2.1 末句把约 25 trillion tokens 收在预训练数据集; §3.2 把数学约 100K 与代码约 30K 合成 RL 题库, 合计对应 Abstract 的 130K. 二者不是同一流水线的前后累计.

<!-- page 2 of 28 -->

## Contents

- 1 Introduction 3
- 2 Pre-Training 4
  - 2.1 Pre-Training Data 4
  - 2.2 Model Architecture 6
  - 2.3 Hyper-Parameters 7
  - 2.4 Pre-Training Evaluation 7
    - 2.4.1 Evaluation Setup 7
    - 2.4.2 Upper Bounds of Reasoning Capability 8
    - 2.4.3 Evaluation Results 8
- 3 Post-Training 10
  - 3.1 Supervised Fine-Tuning 10
  - 3.2 RL Data Curation 11
  - 3.3 RL Training Recipe 11
    - 3.3.1 Test Difficulty Driven Reward 12
    - 3.3.2 Easy Data Filter and Re-Sampling 13
    - 3.3.3 Hyper-Parameters 14
  - 3.4 RL Infrastructures 14
    - 3.4.1 Seamless Rollout Engine 14
    - 3.4.2 vLLM-based Inference Engine 16
  - 3.5 Post-Training Evaluation 17
    - 3.5.1 Evaluation Setup 17
    - 3.5.2 Evaluation Results 18
  - 3.6 Discussion 18
- 4 Conclusion 20
- A Contributions and Acknowledgments 28

<!-- page 3 of 28 -->

## 1 Introduction

Large language models (LLMs) with advanced reasoning capabilities, such as OpenAI o-series (OpenAI, 2024), DeepSeek R1 (Guo et al., 2025), and Claude 3.7 (Anthropic, 2025), have achieved remarkable performance in complex tasks like mathematical reasoning and code generation. Through large-scale reinforcement learning (RL), these models develop sophisticated reasoning patterns, including step-by-step analysis, self-reflection and backtracking, enabling more robust and accurate problem solving capabilities across diverse domains. This emerging paradigm represents a significant advancement in artificial intelligence’s approach for tackling intricate challenges.

具备强推理能力的大语言模型, 如 OpenAI o 系列, DeepSeek R1 与 Claude 3.7, 已在数学推理与代码生成等复杂任务上表现突出. 经大规模强化学习, 它们会形成逐步分析, 自我反思与回溯等推理模式, 从而在多域解题上更稳, 更准. 这一范式代表了 AI 处理复杂问题路径上的重要推进.

Currently, most successful RL works, including open-source research, rely on relatively large base models, e.g., 32B models, particularly for enhancing code reasoning capabilities. Moreover, it was widely considered that achieving uniform and simultaneous improvements in both mathematical and code capabilities within a small model is challenging. Nonetheless, we believe that the effectiveness of the RL trained reasoning model relies on the inherent reasoning potential of the base model. To fully unlock the reasoning potential of language models, efforts must focus not only on post-training but also on pre-training strategies tailored to reasoning.

眼下多数成功的 RL 工作 (含开源) 仍依赖相对更大的底座, 例如 32B, 在代码推理上尤其如此. 流行看法还认为, 在小模型里同时均匀抬升数学与代码能力很难. 作者则主张: RL 推理模型的效果取决于底座固有的推理潜力. 要充分释放潜力, 不能只做后训练, 也要做面向推理的预训练.

In this work, we present MiMo-7B, a series of models trained from scratch and born for reasoning tasks. Our RL experiments from MiMo-7B-Base show that our model possesses extraordinary reasoning potential, even outperforming much larger 32B models. Additionally, we perform RL training on a cold-started SFT model, resulting in MiMo-7B-RL, which demonstrates superior performance on both mathematics and code reasoning tasks, surpassing the performance of OpenAI o1-mini. Here are our detailed contributions:

本文提出从零训练, 面向推理而生的 MiMo-7B 系列. 从 MiMo-7B-Base 出发的 RL 实验显示其推理潜力突出, 甚至超过更大的 32B 模型. 另在冷启动 SFT 模型上做 RL, 得到 MiMo-7B-RL, 在数学与代码推理上超过 OpenAI o1-mini. 主要贡献如下.

### Pre-Training: Base Model Born for Reasoning 预训练: 为推理而生的底座

• We optimize data preprocessing pipeline, enhancing text extraction toolkits and applying multi-dimensional data filtering to increase reasoning pattern density in pre-training data. We also employ multiple strategies to generate massive diverse synthetic reasoning data.

• 优化数据预处理, 强化文本抽取工具, 并用多维过滤提高预训练数据中的推理模式密度; 同时用多种策略生成大量多样的合成推理数据.

• We adopt a three-stage data mixture strategy for pre-training. Overall, MiMo-7B-Base is pre-trained on approximately 25 trillion tokens.

• 采用三阶段数据混合; 总体而言 MiMo-7B-Base 约在 25 万亿 token 上预训练.

• We incorporate Multiple-Token Prediction as an additional training objective, which enhances model performance and accelerates inference.

• 加入 Multi-Token Prediction 作为额外训练目标, 既抬性能也加速推理.

### Post-Training Recipe: Pioneering Reasoning Model 后训练配方: 面向推理模型

• We curate 130K mathematics and code problems as RL training data, which can be verified by rule-based verifiers. Each problem undergoes careful cleaning and difficulty assessment to ensure quality. We employ only rule-based accuracy rewards to avoid potential reward hacking.

• 整理 130K 道可用规则核验器验证的数学与代码题作 RL 数据; 每题经清洗与难度评估; 只用规则准确率奖励以避免 reward hacking.

• To mitigate the sparse reward issue for challenging code problems, we introduce a test difficulty driven code reward. By assigning fine-grained scores for test cases with varying difficulty levels, the policy can be more effectively optimized via dense reward signal.

• 为缓解难题代码的稀疏奖励, 引入由测例难度驱动的代码奖励; 按难度层给细粒度分, 使策略能吃到更稠密的奖励信号.

• We implement a data re-sampling strategy to enhance rollout sampling efficiency and stabilize policy updates, particularly in the later phases of RL training.

• 实现数据重采样策略, 提高 rollout 采样效率并稳住策略更新, 尤其在 RL 后期.

<!-- page 4 of 28 -->

### RL Infrastructures 强化学习基建

• We develop a Seamless Rollout Engine to accelerate RL training and validation. Our design integrates continuous rollout, asynchronous reward computation, and early termination to minimize GPU idle time, achieving 2.29× faster training and 1.96× faster validation.

• 开发 Seamless Rollout Engine 加速 RL 训练与验证, 集成连续 rollout, 异步奖励计算与早停以降低 GPU 空闲, 训练加速 2.29×, 验证加速 1.96×.

• We support MTP in vLLM and enhance the robustness of the inference engine in RL system.

• 在 vLLM 中支持 MTP, 并增强 RL 系统里推理引擎的稳健性.

### Summary of Evaluation Results 评测结果摘要

• **MiMo-7B-Base** outperforms SoTA open-source models of approximately 7B parameters, excelling in general knowledge and coding tasks. On BBH, it achieves a score of 75.2, showcasing superior reasoning capabilities. Its strong performance on SuperGPQA further highlights its ability to handle complex graduate-level questions.

• **MiMo-7B-Base** 超过约 7B 参数档的开源 SoTA, 在一般知识与编码任务上表现突出. BBH 得分 75.2; SuperGPQA 上的表现进一步说明其处理研究生级复杂题的能力.

• **MiMo-7B-RL-Zero** surpasses the RL training performance of the 32B base model on both mathematics and code tasks. This underscore its efficiency and potential in RL training, positioning MiMo-7B as a compelling candidate for future advancements in RL.

• **MiMo-7B-RL-Zero** 在数学与代码上超过 32B 底座的 RL 训练表现, 凸显其 RL 效率与潜力.

• **MiMo-7B-RL** achieves excellent reasoning performance. It scores 55.4 on AIME 2025, exceeding o1-mini by 4.7 points. In algorithm code generation tasks, MiMo-7B-RL demonstrates extremely impressive results, significantly outperforming OpenAI o1-mini on both LiveCodeBench v5 and the latest v6, demonstrating robust and stable capabilities. MiMo-7B-RL also maintains competitive general performance.

• **MiMo-7B-RL** 推理表现优秀: AIME 2025 得 55.4, 比 o1-mini 高 4.7; 算法代码生成上在 LiveCodeBench v5 与最新 v6 均显著超过 o1-mini; 一般能力也保持竞争力.

**Open-Source** We open-source MiMo-7B series, including checkpoints of the base model, SFT model, RL model trained from base model, and RL model trained from the SFT model. We believe this report along with the models will provides valuable insights to develop powerful reasoning LLM that benefit the larger community.

**开源** 开源 MiMo-7B 系列, 含 Base, SFT, 从 Base 直 RL, 以及从 SFT 再 RL 的检查点. 作者希望报告与模型能为更强推理 LLM 的研发提供参考.

> **问:** Introduction 写 RL-Zero 「surpasses the RL training performance of the 32B base model」, 而 Fig. 3 的 pass@k 对照也点名 32B baseline. 文内有没有给出该 32B 底座的具体型号名称?
> 正文此处与 Fig. 3 均写 32B baseline / 32B base model, 未在对应句给出具体开源型号名. 引用时应保留 「32B baseline」 这一口径, 不要擅自填成某一确定权重名.

## 2 Pre-Training 预训练

In this section, we first detail our strategies to enhance reasoning capabilities during MiMo-7B pre-training process, encompassing pre-training data construction, model architecture design, and hyper-parameter settings. Then we demonstrate the reasoning potential of MiMo-7B-Base model.

本节先说明预训练中抬推理能力的策略: 数据构造, 架构与超参; 再展示 MiMo-7B-Base 的推理潜力.

数据, 架构与超参三者在后文 §2.1–§2.3 依次展开; §2.4 再用 pass@k 与多基准表把 「潜力」 落到可核对数字, 而不是停在口号.

### 2.1 Pre-Training Data 预训练数据

The pre-training corpus for MiMo-7B integrates diverse sources, including web pages, academic papers, books, programming code, and synthetic data. We believe that incorporating more data with high-quality reasoning patterns during pre-training stage can substantially enhance the reasoning potential of the resulting language model. To achieve this goal, we first optimize our natural text preprocessing pipeline to improve quality and most importantly, reasoning data density. Second, we leverage advanced reasoning models to generate extensive synthetic reasoning data. Finally, we implement a three-stage data mixture strategy to maximize our model’s reasoning potential across various tasks and domains.

MiMo-7B 预训练语料整合网页, 论文, 书籍, 代码与合成数据. 作者认为预训练阶段纳入更多高质量推理模式, 能显著抬高最终模型的推理潜力. 路径分三步: 优化自然语言预处理以提质并提高推理密度; 用强推理模型生成大量合成推理数据; 再用三阶段混合在多任务多域上尽量挖潜力.

**Better Reasoning Data Extraction** Web pages naturally contain content with high density reasoning patterns, such as coding tutorial and mathematics blogs. However, we discover that commonly used extractors (Barbaresi, 2021) often fail to preserve mathematics equations and

<!-- page 5 of 28 -->

code snippets embedded in the webpage. To address this limitation, we develop a novel HTML-extraction tool specially optimized for mathematics content (Liu et al., 2024c; Paster et al., 2024; Zhou et al., 2025), code blocks, and forum websites. For papers and books, we enhance PDF parsing toolkits to better handle STEM and code content. With these optimized extraction tools, we successfully preserved massive reasoning patterns for subsequent processing stages.

**更好的推理数据抽取** 网页天然含高密度推理内容 (如编程教程, 数学博客), 但常用抽取器常丢公式与内嵌代码. 作者为此开发面向数学, 代码块与论坛站的 HTML 抽取工具, 并增强 PDF 解析以更好处理 STEM 与代码. 这些工具为后续阶段保住了大量推理模式.

**Fast Global Deduplication** Data deduplication plays an important role in improving training efficiency and reducing overfitting. We adopt both URL deduplication and MinHash deduplication (Broder, 1997) across all webpage dumps. Through extreme engineering optimization, we can complete this global deduplication process within a single day. Since deduplication algorithms treat high-quality and low-quality text equally without content awareness, we subsequently adjust the final data distribution according to multi-dimension quality scores.

**快速全局去重** 去重提高训练效率并降低过拟合. 对全部网页 dump 做 URL 去重与 MinHash 去重, 工程优化后可在一天内完成全局去重. 因去重对好坏文本一视同仁, 随后再按多维质量分调整最终分布.

**Multi-Dimensional Data Filtering** High-quality pre-training data with rich reasoning patterns is crucial for developing models with strong reasoning capabilities. We find that commonly used heuristic rule-based filters (Penedo et al., 2023, 2024) incorrectly filter high-quality web pages containing substantial mathematical and code content. To address this limitation, we instead fine-tune small LLMs to serve as data quality taggers, performing domain classification and multi-dimensional quality assessment.

**多维数据过滤** 富含推理模式的高质量预训练数据对强推理模型至关重要. 常用启发式规则过滤会误杀含大量数学与代码的高质量页. 作者改为微调小 LLM 做质量标注器, 做领域分类与多维质量评估.

**Synthetic Reasoning Data** Another crucial source for reasoning patterns is synthetic data generated by advanced reasoning models. We employ multiple strategies to generate diverse synthetic reasoning responses. First, we select STEM content tagged with high reasoning depth and prompt models to develop insightful analyses and perform in-depth thinking based on the source materials. Second, we gather mathematics and code problems and prompt reasoning models to solve them. Additionally, we incorporate general domain queries, particularly creative writing tasks. Notably, our preliminary experiments reveal that, unlike non-reasoning data, synthetic reasoning data can be trained for extremely high number of epochs without overfitting risk.

**合成推理数据** 另一关键来源是强推理模型生成的合成数据. 策略包括: 选取高推理深度的 STEM 内容并提示模型做深入分析; 收集数学与代码题并让推理模型求解; 纳入通用域查询 (尤其创意写作). 初步实验表明, 与非推理数据不同, 合成推理数据可极高 epoch 训练而不易过拟合.

**Three-Stage Data Mixture** To optimize the pre-training data distribution, we adopt a three-stage data mixture strategy in the final model training:

**三阶段数据混合** 为优化预训练分布, 最终模型训练采用三阶段混合:

• **Stage 1**: We incorporate all data sources except synthetic responses for reasoning task queries. We downsample overrepresented content, such as ads, news, job postings, and materials with insufficient knowledge density and reasoning depth. We also upsample high-value data from professional domains with superior quality.

• **Stage 1**: 纳入除 「推理题查询的合成回复」 外的全部来源; 下采样广告, 新闻, 招聘及知识密度与推理深度不足的材料; 上采样高质量专业域数据.

**Stage 2**: Building on the curated distribution in Stage 1, we significantly increase mathematics and code related data to ∼70% of the mixture. This approach is expected to enhance specialized skills without compromising general language abilities (Zhu et al., 2024). The first two stages are trained with an 8,192-token context length.

• **Stage 2**: 在 Stage 1 分布上把数学与代码相关数据显著提高到混合的约 70%, 期望在不伤通用语言能力的前提下抬专项技能; 前两阶段上下文长度均为 8,192 token.

• **Stage 3**: To boost the capabilities for solving complex tasks, we further incorporate ∼10% synthetic responses for mathematics, code, and creative writing queries. Simultaneously, we extend the context length from 8,192 to 32,768 in the final stage.

• **Stage 3**: 为抬复杂任务能力, 再纳入约 10% 面向数学, 代码与创意写作查询的合成回复; 同时把上下文从 8,192 扩到 32,768.

Through this process, we build a large high-quality pre-training dataset comprising approximately **25 trillion** tokens.

经此过程, 构建约含 25 万亿 token 的大规模高质量预训练数据集.

> **核对:** Stage 2 写数学与代码相关数据约占混合的 70%, Stage 3 写再纳入约 10% 合成回复. 文内有没有声明这 10% 是在已含 70% 数理配比之上叠加, 还是 Stage 3 重新归一后的份额?
> §2.1 写 Stage 3 「further incorporate ∼10% synthetic responses」, 并同时扩上下文; 未给出 Stage 3 全混合的完整百分比表. 引用时应按 「再纳入约 10% 合成回复」 的原文口径, 不要自行假定 Stage 2 的 70% 在 Stage 3 仍精确保持.

<!-- page 6 of 28 -->

![Image block](images/p06-figure-2-implementation-of-multi-token-prediction-with.png)

Figure 2 Implementation of Multi-Token Prediction with MiMo-7B. During pre-training we use a single MTP layer, while the inference stage can use multiple MTP layers for additional speedup.
图 2 MiMo-7B 的 Multi-Token Prediction 实现. 预训练用单个 MTP 层; 推理阶段可用多个 MTP 层以进一步加速.

### 2.2 Model Architecture 模型架构

MiMo-7B follows the general decoder-only Transformer architecture (Radford et al., 2018; Vaswani et al., 2017), and consists of Grouped-Query Attention (GQA, Ainslie et al. 2023), pre-RMSNorm (Zhang and Sennrich, 2019), SwiGLU activation (Dauphin et al., 2017) and Rotary Positional Embedding (RoPE, Su et al. 2024), similar to Llama (Grattafiori et al., 2024; Touvron et al., 2023) and Qwen (Yang et al., 2024).

MiMo-7B 采用通用 decoder-only Transformer, 含 GQA, pre-RMSNorm, SwiGLU 与 RoPE, 与 Llama / Qwen 类似.

Reasoning models often face an inference speed bottleneck due to their lengthy auto-regressive generation process, despite the high correlation and predictability observed among consecutive tokens in their reasoning paths.

推理模型常因漫长自回归生成而受推理速度瓶颈约束, 尽管其推理路径上相邻 token 高度相关且可预测.

**MTP Modules** Inspired by DeepSeek-V3 (Liu et al., 2024a), we incorporate Multi-Token Prediction (MTP) (Gloeckle et al., 2024) as an additional training objective. This approach enables the model to strategically pre-plan and generate representations that facilitate more accurate and potentially faster prediction of future tokens. As shown in Figure 2, we implement distinct MTP setups for pre-training and inference. During pre-training, we utilize only a single MTP layer, as our preliminary studies show that multiple MTP layers yield no further improvement. In contrast, we find that multiple parallel MTP layers significantly accelerate inference through speculative decoding. To implement this, after pre-training, we replicate the pre-trained single MTP layer into two identical copies. Then, with the main model and first MTP layer frozen, we fine-tune two new MTP layers for inference speedup.

**MTP 模块** 受 DeepSeek-V3 启发, 加入 MTP 作为额外训练目标, 促使模型预规划并生成有利于更准, 可能更快预测未来 token 的表示. 如图 2, 预训练与推理采用不同 MTP 设置. 预训练只用单个 MTP 层, 因初步研究显示多层不再带来提升; 推理时多个并行 MTP 层可通过 speculative decoding 显著加速. 实现上, 预训练后把单层复制成两份相同拷贝, 冻结主模型与第一个 MTP 层, 再微调两个新 MTP 层以加速推理.

**MTP Inference Speedup** During inference, these MTP layers can be utilized for speculative decoding (Leviathan et al., 2023; Xia et al., 2023) to reduce generation latency. We evaluated the performance of the MTP layers on the AIME24 benchmark. The first MTP layer achieves a remarkably high acceptance rate about 90%, while even the third MTP layer maintains an acceptance rate above 75%. This high acceptance rate enables MiMo-7B to deliver enhanced decoding speed, particularly in reasoning scenarios requiring extremely long outputs.

**MTP 推理加速** 推理时这些 MTP 层可用于 speculative decoding 以降低生成延迟. 在 AIME24 上评估: 第一 MTP 层接受率约 90%, 第三层仍高于 75%. 高接受率使 MiMo-7B 在需要极长输出的推理场景下解码更快.

> **看表:** Fig. 2 说明预训练单层, 推理多层; 正文又写复制成两份后 「fine-tune two new MTP layers」, 并报告第一与第三层接受率. 按字面, 推理侧最终可见的 MTP 层数应如何数?
> 预训练保留 1 层; 复制得到相同拷贝后, 冻结主模型与第一 MTP 层, 再微调两个新层. 文中另报告第三层接受率 >75%, 说明推理侧至少讨论到第三 MTP 层. 精确层数应以 Fig. 2 与该段文字一并引用, 不要只写 「多层」 而不标接受率锚点.

<!-- page 7 of 28 -->

### 2.3 Hyper-Parameters 超参数

**Model Hyper-Parameters** We set the number of Transformer layers to 36 and the hidden dimension to 4,096. The intermediate hidden dimension of FFN is set to 11,008. The number of attention heads is 32 and there are 8 key-value groups.

**模型超参** Transformer 层数 36, hidden 4,096, FFN intermediate 11,008, 注意力头 32, KV group 8.

**Training Hyper-Parameters** For optimization, we use AdamW (Loshchilov and Hutter, 2019) with $\beta _ { 1 } = 0 . 9 ,   \beta _ { 2 } = 0 . 9 5$ , and weight decay of 0.1. We apply gradient clipping with a maximum norm of 1.0.

**训练超参** 优化器用 AdamW, $\beta_1=0.9$, $\beta_2=0.95$, weight decay 0.1; 梯度裁剪最大范数 1.0.

During the first two pre-training stages, the maximum sequence length is 8,192 tokens with the RoPE base of 10,000. Stage 3 expands these parameters to 32,768 tokens and 640,000, respectively.

前两阶段最大序列长度 8,192 token, RoPE base 10,000; Stage 3 分别扩到 32,768 token 与 640,000.

Our learning rate schedule begins in Stage 1 with a linear warmup from 0 to $1 . 0 7 \times 1 0 ^ { - 4 }$ over the first 84B tokens, followed by a constant phase at $1 . 0 7   \times   1 0 ^ { - 4 }$ for 10.2T tokens, and concludes with a cosine decay to $3 \times 1 0 ^ { - 5 }$ over 7.5T tokens. This rate of $3 \times 1 0 ^ { - 5 }$ is maintained throughout Stage 2 (4T tokens) and for the first 1.5T tokens of Stage 3. Subsequently, the learning rate decays via a cosine schedule to $1 \times 1 0 ^ { - 5 }$ over the final 500B tokens.

Stage 1 学习率: 前 84B token 从 0 线性暖到 $1.07\times10^{-4}$, 再常数 10.2T, 随后 7.5T 余弦降到 $3\times10^{-5}$. 该 $3\times10^{-5}$ 贯穿 Stage 2 (4T) 与 Stage 3 前 1.5T; 最后 500B 余弦降到 $1\times10^{-5}$.

We implement a linear batch size warmup to 2,560 over the first 168B tokens and maintain this value throughout the remainder of Stage 1 and Stage 2. In Stage 3, the batch size is fixed at 640.

batch size 在前 168B token 线性暖到 2,560, 并在 Stage 1 余下与 Stage 2 保持; Stage 3 固定 640.

The MTP loss weight is set to 0.3 for the first 10.3T tokens, then reduced to 0.1 for the remainder of pre-training.

MTP 损失权重前 10.3T token 为 0.3, 其后降为 0.1.

> **拆开:** §2.3 把 Stage 1 的 token 预算拆成 84B warmup + 10.2T constant + 7.5T cosine, Stage 2 另有 4T, Stage 3 为 1.5T + 500B. 这些段加总是否被正文写成等于约 25T?
> 按段相加约 84B+10.2T+7.5T+4T+1.5T+500B ≈ 23.784T, 与 §2.1 的 「approximately 25 trillion」 同属约数口径; 正文未给出逐段加总校对表. 引用应用 「约 25T」 与分阶段日程并列, 不要把分项和强行改成精确 25.000T.

> **看表:** 同节写 RoPE base 从 10,000 提到 640,000 与上下文 8,192→32,768 同步发生在 Stage 3. 文内有没有单独消融 「只扩上下文不改 base」 或 「只改 base 不扩上下文」?
> §2.3 将两项写成 Stage 3 同时扩展, 未提供拆开的消融表. 引用长上下文能力时应同时带上 Fig. 4 的 RULER 结果, 不要把增益只归因于其中一旋钮.

### 2.4 Pre-Training Evaluation 预训练评测

#### 2.4.1 Evaluation Setup 评测设置

We evaluate MiMo-7B-Base on a series of benchmarks, encompassing natural language understanding and reasoning, scientific question answering, reading comprehension, mathematics reasoning, coding, Chinese understanding, and long-context comprehension capabilities:

在自然语言理解与推理, 科学问答, 阅读理解, 数学推理, 编码, 中文理解与长上下文理解等基准上评测 MiMo-7B-Base:

**Language understanding and reasoning**: BBH (Suzgun et al., 2023), MMLU Hendrycks et al. (2021a), MMLU-Redux (Gema et al., 2024), MMLU-Pro (Wang et al., 2024), ARC (Clark et al., 2018), HellaSwag (Zellers et al., 2019), PIQA (Bisk et al., 2020).

**Closed-book question answering**: TriviaQA (Joshi et al., 2017), NaturalQuestions (Kwiatkowski et al., 2019).

**Scientific question answering**: GPQA (Rein et al., 2024), SuperGPQA (Du et al., 2025).

**Reading comprehension**: DROP (Dua et al., 2019), RACE (Lai et al., 2017).

**Mathematics reasoning**: AIME (MAA, 2024), GSM8K (Cobbe et al., 2021), MATH (Hendrycks et al., 2021b).

**Coding**: LiveCodeBench (Jain et al., 2024), HumanEval (Chen et al., 2021), HumanEval+ (Liu et al., 2023), MBPP (Austin et al., 2021), MBPP+ (Liu et al., 2023), CRUXEval (Gu et al., 2024).

**Miscellaneous**: WinoGrande (Sakaguchi et al., 2020), AGIEval (Zhong et al., 2024a).

**Chinese understanding**: C-Eval (Huang et al., 2023), CMMLU (Li et al., 2023).

**Long-Context Comprehension**: RULER (Hsieh et al., 2024)

<!-- page 8 of 28 -->

![Chart block](images/p08-figure-3-pass-k-curves-of-different-base-models-across.png)

Figure 3 Pass@k curves of different base models across multiple reasoning benchmarks.
图 3 不同底座模型在多条推理基准上的 pass@k 曲线.

We compare MiMo-7B-Base with other open-source base models of comparable size, including Llama-3.1-8B (Grattafiori et al., 2024), Gemma-2-9B (Team, 2024), and Qwen2.5-7B (Yang et al., 2024). The evaluation of all models shares the same evaluation settings.

对照同尺寸开源底座 Llama-3.1-8B, Gemma-2-9B 与 Qwen2.5-7B; 全部模型共用同一评测设定.

#### 2.4.2 Upper Bounds of Reasoning Capability 推理能力上界

Traditional evaluation methods often underestimate a model’s true reasoning potential by relying on single-pass success rates or average performance across multiple samplings. Following Yue et al. (2025), we adopt the pass@k metric, which considers a problem solved if any of k sampled solution is correct, to better assess the reasoning capacity boundary of different models.

传统评测常依赖单次成功率或多样本平均, 从而低估真实推理潜力. 本文按 Yue et al. (2025) 采用 pass@k: $k$ 次采样中任一次正确即算解出, 以更好评估能力边界.

As illustrated in Figure 3, MiMo-7B-Base achieves significantly higher pass@k scores than all compared models, including the 32B baseline, across all benchmarks and evaluated k values. Notably, the performance gap between MiMo-7B-Base and other baselines widens steadily as k increases, particularly on LiveCodeBench. These results demonstrates the superior reasoning potential of MiMo-7B-Base, which establishes a strong base policy for RL training.

如图 3, MiMo-7B-Base 在全部所示基准与各 $k$ 上显著高于对照 (含 32B baseline); 差距随 $k$ 增大稳步拉开, LiveCodeBench 上尤为明显. 这为其作为 RL 的强底座策略提供依据.

这里的 pass@k 属于评测侧多采样, 即 TestingTime 向的探查, 用来估计可被 RL 挖掘的上界; 它不替代 §2.1 里部署前的数据 Scaling.

> **确认:** Fig. 3 写差距随 $k$ 增大而拉开, 「particularly on LiveCodeBench」. 文内有没有给出某一 $k$ 上相对 32B baseline 的具体分差数值表?
> Fig. 3 以曲线展示趋势, §2.4.2 用定性语句描述拉开; 该小节未另附各 $k$ 的数值分差表. 引用时应回到图像趋势与 「including the 32B baseline」 句, 不要编造未印出的差值.

#### 2.4.3 Evaluation Results 评测结果

**General Reasoning** MiMo-7B-Base achieves superior performance in general knowledge and reasoning, outperforming open-source models of comparable size. On BBH, a benchmark evaluating language reasoning abilities, MiMo-7B-Base scores 75.2, surpassing Qwen2.5-7B by about 5 points. Furthermore, SuperGPQA results show our model’s robust performance in solving graduate-level problems. On DROP, a reading comprehension benchmark, MiMo-7B-Base outperforms compared

**一般推理** MiMo-7B-Base 在一般知识与推理上优于同尺寸开源底座. BBH 得 75.2, 约超 Qwen2.5-7B 5 分; SuperGPQA 显示研究生级问题上的稳健表现; DROP 上亦超过对照.

<!-- page 9 of 28 -->

| Benchmark | # Shots | Llama-3.1 8B Base | Gemma-2 9B Base | Qwen2.5 7B Base | MiMo-7B Base |
| --- | --- | --- | --- | --- | --- |
| General |  |  |  |  |  |
| BBH (EM) | 3-shot | 64.2 | 69.4 | 70.4 | 75.2 |
| GPQA-Diamond (EM) | 5-shot | 33.3 | 24.2 | 35.4 | 25.8 |
| SuperGPQA (EM) | 5-shot | 19.9<sup>∗</sup> | 22.6∗ | 24.6∗ | 25.1 |
| DROP (F1) | 3-shot | 59.5 | 67.9<sup>∗</sup> | 61.5<sup>∗</sup> | 69.2 |
| MMLU (EM) | 5-shot | 65.3 | 71.2 | 74.2 | 71.2 |
| MMLU-Redux (EM) | 5-shot | 58.4<sup>∗</sup> | 67.9 | 71.1 | 65.3 |
| MMLU-Pro (EM) | 5-shot | 37.1 | 44.7 | 45.0 | 41.9 |
| ARC-Easy (EM) | 25-shot | 84.3 | 88.3 | 86.4 | 85.2 |
| ARC-Challenge (EM) | 25-shot | 57.7 | 68.2 | 63.8 | 62.3 |
| HellaSwag (EM) | 10-shot | 82.0 | 81.9 | 80.4 | 80.0 |
| PIQA (EM) | 0-shot | 80.3 | 81.9 | 78.5 | 79.4 |
| WinoGrande (EM) | 5-shot | 60.5 | 73.9<sup>∗</sup> | 75.9 | 78.0 |
| RACE-High (EM) | 5-shot | 44.3 | 48.3 | 46.8 | 44.1 |
| TriviaQA (EM) | 5-shot | 70.6 | 76.5 | 60.0 | 60.8 |
| NaturalQuestions (EM) | 5-shot | 27.7 | 29.2 | 24.1 | 24.5 |
| AGIEval (EM) | 0-shot | 38.2<sup>∗</sup> | 21.6∗ | 44.4 | 48.3 |
| Mathematics |  |  |  |  |  |
| AIME 2024 (Pass@1) | 0-shot | 0.3<sup>∗</sup> | 0.0<sup>∗</sup> | 10.1<sup>∗</sup> | 32.9 |
| AIME 2025 (Pass@1) | 0-shot | 0.0<sup>∗</sup> | 0.0<sup>∗</sup> | 4.3<sup>∗</sup> | 24.3 |
| GSM8K (EM) | 8-shot | 48.5<sup>∗</sup> | 70.2<sup>∗</sup> | 80.2<sup>∗</sup> | 75.2 |
| MATH (EM) | 4-shot | 16.9<sup>∗</sup> | 36.4<sup>∗</sup> | 44.3<sup>∗</sup> | 37.4 |
| Code |  |  |  |  |  |
| LiveCodeBench v5 (Pass@1) | 0-shot | 0.4<sup>∗</sup> | 0.0<sup>∗</sup> | 5.0<sup>∗</sup> | 32.9 |
| HumanEval (Pass@1) | 1-shot | 37.8<sup>∗</sup> | 41.5<sup>∗</sup> | 56.7<sup>∗</sup> | 51.8 |
| HumanEval+ (Pass@1) | 1-shot | 31.7<sup>∗</sup> | 31.1<sup>∗</sup> | 50.0<sup>∗</sup> | 44.5 |
| MBPP (Pass@1) | 3-shot | 58.4 | 63.9 | 76.7 | 69.2 |
| MBPP+ (Pass@1) | 3-shot | 49.9 | 52.9 | 64.2 | 56.6 |
| CRUXEval-I (EM) | 2-shot | 41.5 | 49.8 | 52.4 | 47.6 |
| CRUXEval-O (EM) | 2-shot | 36.8 | 42.4 | 48.5 | 56.3 |
| Chinese |  |  |  |  |  |
| C-Eval (EM) | 5-shot | 52.2 | 57.0 | 81.8 | 68.7 |
| CMMLU (EM) | 5-shot | 52.1 | 58.4 | 82.7 | 70.9 |

Table 1 Comparison among MiMo-7B-Base and other open-source base models of comparable size. Results marked with \* are obtained using our internal evaluation framework.
表 1 MiMo-7B-Base 与同尺寸开源底座对照. 标 \* 的结果来自作者内部评测框架.

<!-- page 10 of 28 -->

![Chart block](images/p10-figure-4-results-of-long-context-comprehension-on-ruler.png)

Figure 4 Results of long-context comprehension on RULER. Our MiMo-7B-Base achieves nearperfect NIAH retrieval performance within the supported 32K context length, and delivers remarkable performance on Common Words Extraction (CWE), Frequent Words Extraction (FWE), and Variable Tracking (VT) that emphasizes long-context reasoning beyond retrieval.
图 4 RULER 长上下文理解结果. MiMo-7B-Base 在支持的 32K 上下文内 NIAH 检索近乎完美, 并在更强调长上下文推理的 CWE / FWE / VT 上表现突出.

models, showing advanced language understanding capability.

**Code and Mathematics Reasoning** MiMo-7B-Base demonstrates strong proficiency in coding and mathematics tasks. On LiveCodeBench v5, it scores 32.9, far surpassing Llama-3.1-8B and Qwen-2.5-7B. Similarly, on AIME 2024, our model achieves 32.9, significantly outperforming other comparably sized base models. These results highlight MiMo-7B-Base’s extraordinary problem-solving abilities and its huge potential for complex reasoning tasks.

**代码与数学推理** LiveCodeBench v5 得 32.9, 远超 Llama-3.1-8B 与 Qwen2.5-7B; AIME 2024 同样 32.9, 显著高于同尺寸底座. 这凸显其解题能力与复杂推理潜力.

**Long-Context Comprehension** The ability to understand and reason over long contexts is essential for modern thinking models (Liu et al., 2025), as it enables them to produce long and complex reasoning chains.

对现代 thinking 模型而言, 长上下文理解与推理至关重要, 因为它支撑长而复杂的推理链生成.

For the needle-in-a-haystack (NIAH) tasks (Single, Multi-keys, Multi-values, and Multi-queries NIAH) that focus on long-context retrieval, we aggregate their accuracy across varying depths and context lengths, as depicted in the leftmost panel of Figure 4. We observe that MiMo-7B achieves near-perfect retrieval performance across all positions within the 32K context window.

对聚焦检索的 NIAH 任务, 作者按深度与上下文长度汇总准确率 (图 4 最左). 在 32K 窗口内各位置近乎完美检索.

Beyond pure retrieval, MiMo-7B excels in tasks requiring long-context reasoning, including Common Words Extraction (CWE), Frequent Words Extraction (FWE), and Variable Tracking (VT). It delivers remarkable performance and surpasses Qwen2.5-7B in most scenarios. These results validate the efficacy of our strategy to incorporate diverse data with high-quality reasoning patterns during pre-training.

超越纯检索, 在 CWE / FWE / VT 等长上下文推理任务上表现突出, 多数情形超过 Qwen2.5-7B, 印证预训练纳入高密度推理数据的有效性.

> **拆开:** Tab. 1 中 MiMo-7B-Base 的 AIME 2024 与 LiveCodeBench v5 均为 Pass@1 32.9, 而 GPQA-Diamond 仅 25.8, 低于 Qwen2.5-7B 的 35.4. 正文有没有把 「推理潜力」 明确收窄到竞赛数学 / 算法代码, 而不是所有科学问答?
> §2.4.3 用 AIME / LiveCodeBench 论证 「extraordinary problem-solving」 与 RL 潜力; 同表 GPQA-Diamond 落后未在该小节改写成优势. 引用 「推理潜力」 时应回到 Fig. 3 与竞赛向列, 不要把 GPQA-Diamond 25.8 说成同样领先.

## 3 Post-Training 后训练

After the pre-training stage, post-training are implemented on MiMo-7B-Base. Specifically, we develop MiMo-7B-RL-Zero through direct RL from MiMo-7B-Base, and MiMo-7B-RL trained from an SFT version of MiMo-7B.

预训练之后在 MiMo-7B-Base 上做后训练: 从 Base 直 RL 得到 MiMo-7B-RL-Zero; 从 SFT 版再 RL 得到 MiMo-7B-RL.

两条路径的对照数字见后文 Tab. 5; Discussion (§3.6) 再用 Fig. 7 说明为何 「只做轻量格式 SFT」 不够.

### 3.1 Supervised Fine-Tuning 监督微调

**SFT Data** The SFT data consists of a combination of open-source and proprietary distilled data. To ensure optimal quality and diversity, we implement a three stage preprocessing pipeline. First, we eliminate all training queries that have 16-gram overlap with evaluation benchmarks to prevent data leakage. Then, we exclude samples with mixing language or incomplete response. Finally, we

**SFT 数据** 由开源与专有蒸馏数据组成. 三阶段预处理: 删除与评测基准存在 16-gram 重叠的训练查询以防泄漏; 排除混语或不完整回复; 最后

<!-- page 11 of 28 -->

capped the number of responses per query at eight, striking a balance between preserving diversity and preventing redundancy. Following this preprocessing, our final SFT dataset comprises about 500K samples.

把每查询回复数上限设为 8, 以在多样性与冗余之间折中. 最终 SFT 集约 500K 样本.

**SFT Hyper-parameters** We fine-tune the MiMo-7B-Base model with a constant learning rate of $3 \times 1 0 ^ { - 5 }$ and batch size of 128. Samples are packed to the maximum length of 32,768 tokens during training.

**SFT 超参** 常数学习率 $3\times10^{-5}$, batch size 128; 训练时样本 pack 到最大长度 32,768 token.

> **回看:** §3.1 写每查询最多 8 条回复, 最终约 500K 样本; §3.6 / Tab. 6 又出现 6M SFT. 主实验默认 SFT 规模应以哪一节为准?
> 主配方叙述在 §3.1 的约 500K; 6M 是 §3.6 讨论节的规模实验, Tab. 6 单列对照. 不要把讨论节的 6M 写回主实验结果表的默认设定.

### 3.2 RL Data Curation 强化学习数据整理

We utilize two categories of verifiable problems, mathematics and code, to formulate our RL training data. Our preliminary studies demonstrate that high-quality problem sets plays a critical role in stabilizing the RL training process and further enhancing the LLM’s reasoning capabilities.

RL 训练数据使用数学与代码两类可核验题. 初步研究表明高质量题集对稳住 RL 并进一步抬推理能力至关重要.

**Mathematical Data** Our mathematical problem set is drawn from diverse sources, including open-source datasets and proprietary collected competition-level collections. To mitigate the risk of reward hacking, we employ an LLM to filter proof-based and multiple-choice problems. Unlike recent approaches that modify problems to ensure integer answers, we preserve original problems to minimize reward hacking. Additionally, we perform global n-gram deduplication and carefully decontaminate of our problem set with evaluation benchmarks.

**数学数据** 来源含开源集与专有竞赛级题. 用 LLM 过滤证明题与选择题以降低 reward hacking; 与把题改成整数答案的近期做法不同, 本文保留原题. 另做全局 n-gram 去重, 并相对评测基准仔细去污染.

Model-based difficulty assessment is used to further improve the quality of our dataset. Initially, we filter out problems that cannot be solved by advanced reasoning models, identifying those that are either too difficult or contain incorrect answers. For the remaining problems, we rollout an SFT version of MiMo-7B 16 times, eliminating problems with a passrate exceeding 90%. Notably, this process removes approximately 50% of easy problems from the original problem set. After data cleaning, we establish a mathematical training set comprising 100K problems.

再用基于模型的难度评估提质: 先去掉高级推理模型也解不出的题 (过难或答案错误); 对其余题用 MiMo-7B 的 SFT 版 rollout 16 次, 去掉 passrate 超过 90% 的题, 约删除原集 50% 易题. 清洗后数学训练集 100K 题.

**Code Data** For coding problems, we curate a high-quality training set comprising open-source datasets and our newly collected problem set. We remove problems without test cases. For problems with golden solutions, we exclude those where the golden solution failed to pass all test cases. For problems without golden solution, we discard problems where no test case can be solved in 16 rollouts of advanced reasoning models. Similar to math data, we utilize an SFT version of MiMo-7B to filter out easy problems that are perfectly solved in all 16 rollouts. This rigorous cleaning process yields 30K code problems.

**代码数据** 含开源与新收集题. 去掉无测例题; 有黄金解则去掉黄金解未过全部测例者; 无黄金解则丢掉在高级推理模型 16 次 rollout 中无一测例可解的题. 同样用 MiMo SFT 版去掉 16 次全过的易题. 最终得 30K 代码题.

During each RL iteration, we evaluate thousands of problems to compute the rewards, with each problem potentially containing hundreds of test cases. To improve reward computing efficiency and eliminate GPU idle time, we developed an online judge environment that enables parallel execution of extremely high-volume unit tests.

每轮 RL 迭代要评数千题以算奖励, 每题可能含数百测例. 为提高奖励计算效率并消除 GPU 空闲, 作者开发可并行执行海量单测的在线评测环境.

**Reward Function** We employ only rule-based accuracy rewards in our training process. For mathematics data, we use the rule-based Math-Verify library to evaluate response correctness. For code problems, we implement a test difficulty driven reward as detailed in Section 3.3.1. No additional rewards, such as format reward and length penalty reward, is incorporated.

**奖励函数** 训练中只用规则准确率奖励. 数学用 Math-Verify; 代码用 §3.3.1 的测例难度驱动奖励. 不加入 format reward 或 length penalty.

> **核对:** §3.2 写数学清洗后 100K, 代码 30K; Abstract 写 130K. 三者是否在文内被写成同一 RL 题库的加总关系?
> 是. 100K+30K=130K, 与 Abstract 的 「130K verifiable mathematics and programming problems」 一致. SFT 的约 500K 属于 §3.1 另一管道, 不应与 130K 混加.

### 3.3 RL Training Recipe 强化学习训练配方

We employ a modified version of Group Relative Policy Optimization (GRPO) (Shao et al., 2024) with recently proposed improvement from the research community (Hu et al., 2025; Yu et al.,

采用改版 GRPO, 并吸收社区近期改进 (Hu et al., 2025; Yu et al.,

<!-- page 12 of 28 -->

2025). For each problem $q ,$ the algorithm samples a group of responses $\{ o _ { 1 } , o _ { 2 } , . . . , o _ { G } \}$ from the old policy $\pi _ { \theta _ { o l d } }$ , and update the policy $\pi _ { \theta }$ by maximizing the following objective:

2025). 对每个问题 $q$, 算法从旧策略 $\pi_{\theta_{old}}$ 采样一组回复 $\{o_1,\ldots,o_G\}$, 并通过最大化下列目标更新策略 $\pi_\theta$:

$$
\begin{array}{c} \mathcal {J} _ {\mathrm{GRPO}} (\theta) = \mathbb {E} _ {q \sim D, \left\{o _ {i} \right\} _ {i = 1} ^ {G} \sim \pi_ {\theta} (\cdot | q)} \\ \hline \left[ \frac {1}{\sum_ {i = 1} ^ {G} | o _ {i} |} \sum_ {i = 1} ^ {G} \sum_ {j = 1} ^ {| o _ {i} |} \min \left(\frac {\pi_ {\theta} (o _ {i} | q)}{\pi_ {\theta_ {o l d}} (o _ {i} | q)} A _ {i, j}, \operatorname{clip} \left(\frac {\pi_ {\theta} (o _ {i} | q)}{\pi_ {\theta_ {o l d}} (o _ {i} | q)}, 1 - \varepsilon_ {\text {low}}, 1 + \varepsilon_ {\text {high}}\right) A _ {i, j}\right) \right] \end{array}\tag{1}
$$

where $\varepsilon _ { \mathrm { l o w } }$ and $\varepsilon _ { \mathrm { h i g h } }$ are hyper-parameters. $A _ { i , j }$ is the advantage, which is computed by the rewards $\{ r _ { 1 } , r _ { 2 } , . . . , r _ { G } \}$ of responses in the same group:

其中 $\varepsilon_{\mathrm{low}}$ 与 $\varepsilon_{\mathrm{high}}$ 为超参. $A_{i,j}$ 为优势, 由同组回复奖励 $\{r_1,\ldots,r_G\}$ 计算:

$$
A _ {i, j} = \frac {r _ {i} - \mathrm{mean} (\{r _ {i} \} _ {i = 1} ^ {G})}{\mathrm{std} (\{r _ {i} \} _ {i = 1} ^ {G})}\tag{2}
$$

Upon the original GRPO algorithm, we incorporate several enhancements from recent research:

在原始 GRPO 之上并入若干近期增强:

• **Removal of KL Loss** (He et al., 2025; Hu et al., 2025): simply removing the KL loss effectively unleashes the full potential of the policy model without compromising training stability.

• **去掉 KL Loss**: 去掉 KL 损失即可更好释放策略潜力, 且不损害训练稳定性.

• **Dynamic Sampling** (Yu et al., 2025): in RL rollout phase, we over-sample and filter out prompts with passrate equal to 1 and 0, leaving all prompts in the batch with effective gradients while maintaining a consistent batch size. This strategy automatically calibrates problem difficulty throughout policy training.

• **Dynamic Sampling**: rollout 阶段超采并滤掉 passrate 为 1 或 0 的 prompt, 使 batch 内皆有有效梯度且 batch size 一致, 从而在训练过程中自动校准题目难度.

• **Clip-Higher** (Yu et al., 2025): we increase the upper clip bounds $\varepsilon _ { \mathrm { h i g h } }$ in Eq. 1, with a fixed lower clip bounds $\varepsilon _ { \mathrm { l o w } }$ . It can mitigate the entropy convergence problem and facilitate the policy to explore new solutions.

• **Clip-Higher**: 提高式 (1) 中上截断 $\varepsilon_{\mathrm{high}}$, 固定下截断 $\varepsilon_{\mathrm{low}}$, 以缓解熵收敛并利于探索新解.

During training, we identify two key challenges affecting model performance: sparse rewards for code problems and diminishing sampling efficiency of dynamic sampling. Therefore, we propose **test complexity driven reward** function and **easy data re-sampling** approach, respectively.

训练中识别出两个关键挑战: 代码题稀疏奖励, 以及动态采样的采样效率下降. 为此分别提出测例复杂度驱动奖励与易题重采样.

> **停一下:** 式 (1) 的归一化因子是 $1/\sum_i |o_i|$ (按 token 总数平均), 而式 (2) 的优势 $A_{i,j}$ 却只随回复级奖励 $r_i$ 变化. 文内是否声明同一回复内各 token 共享同一 $A_{i,j}$?
> 式 (2) 右侧只含 $r_i$ 的组内标准化, 下标写 $A_{i,j}$ 但公式未引入 token 级奖励. 按印刷公式, 同一回复内各位置共享由 $r_i$ 决定的优势; 文内未另给 token 级奖励定义.

#### 3.3.1 Test Difficulty Driven Reward 测例难度驱动奖励

Currently, for algorithm code generation tasks, existing RL works such as Deepseek-R1 Guo et al. (2025) adopt a rule-based reward strategy, where a solution is rewarded only if the generated code passes all the test cases for a given problem. However, for difficult algorithmic problems, the model might never receive any reward, preventing it from learning from these challenging cases and reducing training efficiency for dynamic sampling.

对算法代码生成, 既有 RL 工作 (如 DeepSeek-R1) 常采用 「通过全部测例才给奖」 的规则策略. 对很难的算法题, 模型可能永远拿不到奖励, 既学不到这些题, 也降低动态采样效率.

**Various Test Difficulty in IOI Scoring Rules** To address this limitation, we propose a new reward mechanism, test difficulty driven reward. The design is inspired by the scoring rule of the International Olympiad in Informatics (IOI, IOI 2024). In IOI contests, each complete problem is divided into multiple subtasks, and participants will obtain points for each subtask they successfully complete. Each subtask will have tests with different difficulty. Assigning different scores to subtasks better reflects how humans solve problems. For challenging problems, the model can still earn partial scores by solving some of the subtasks, which allows better utilization of these difficult examples during training.

**IOI 计分中的测例难度差异** 为此提出测例难度驱动奖励, 灵感来自 IOI 计分: 整题拆成多个子任务, 完成的子任务给分, 子任务测例难度不同. 对难题, 模型仍可通过部分子任务拿到部分分, 从而更好利用困难样本.

**Assigning Difficulty to Tests Based on Pass Rates** We propose a technique for grouping test cases based on their difficulty. We utilize several models to perform multiple rollouts on each

**按通过率给测例划分难度** 提出按难度分组测例的技术: 用多个模型对每题做多次 rollout,

<!-- page 13 of 28 -->

![Chart block](images/p13-figure-5-experiments-with-test-difficulty-driven-reward.png)

Figure 5 Experiments with test difficulty driven reward.
图 5 测例难度驱动奖励实验.

problem, and calculate the pass rate for each test case across all model-generated solutions. We then cluster the test cases into different difficulty levels according to their pass rates, with lower pass rates indicating higher difficulty. The left part of Figure 5 presents the pass rates and difficulty levels for each test case of certain problem. The results reveal a clear stratification of test difficulty, and demonstrate that more capable models achieve higher pass rates.

并计算每个测例在所有模型生成解上的通过率; 再按通过率聚类到不同难度层, 通过率越低难度越高. 图 5 左给出某题各测例的通过率与难度层, 可见清晰分层, 且更强模型通过率更高.

**Reward Rules** After categorizing the tests into different difficulty levels, we design two reward schemes based on these difficulty levels: a strict scheme and a soft scheme. (1) Strict Reward. Under the strict reward scheme, a solution receives the reward corresponding to a difficulty level only if it passes all tests in that group as well as in all lower-difficulty groups. (2) Soft Reward. In contrast, the soft reward scheme distributes the total score of each group equally among its tests. The final reward is the sum of the scores for all passed tests. The right part of Figure 5 compares the performance achieved by two reward schemes against the baseline without test difficulty driven reward.

**奖励规则** 分层后设计两种方案. (1) Strict: 只有通过该层及所有更易层的全部测例, 才获得该层对应奖励. (2) Soft: 把每层总分均分到该层测例, 最终奖励为所有通过测例得分之和. 图 5 右对照两种方案相对无难度驱动奖励基线的表现.

> **再看:** Fig. 5 右比较 Strict / Soft / baseline, 左展示单题测例分层. 正文有没有给出正式 RL 主实验默认采用 Strict 还是 Soft?
> §3.3.1 描述了两套规则并用 Fig. 5 右作对照, 但未在该小节用一句话写明主实验默认方案. 引用主结果时应避免把 Fig. 5 某条曲线未经说明地写成唯一正式设定.

#### 3.3.2 Easy Data Filter and Re-Sampling 易题过滤与重采样

During RL training, as the policy improves, an increasing number of problems achieve a perfect pass rate of 1. Under dynamic sampling mechanism, these problems are subsequently filtered from the batch for policy update. This filtration leads to drastic sampling efficiency degradation, as more rollouts are required to construct a batch of fixed size. A straightforward approach to address this efficiency issue would be to entirely remove problems with perfect pass rates from the training data. However, our preliminary studies show that this method introduces significant instability in policy updates.

随策略变强, 越来越多题达到完美 pass rate 1, 在动态采样下会被滤出更新 batch, 导致为凑满固定 batch 需要更多 rollout, 采样效率急剧下降. 直接从训练数据删除完美题看似省事, 但初步研究表明会显著破坏策略更新稳定性.

To improve sampling efficiency without risking policy collapse, we developed an easy data resampling strategy. During the training process, we maintain an easy data pool, where problems with perfect pass rates are stored. When performing rollouts, there is a probability 𝛼 (10% in our experiments) to sample data from this easy data pool. This strategy effectively stabilizes the policy update while improving sampling efficiency, especially in the later phases of RL training.

为在提效的同时避免策略坍塌, 作者维护易题池存放完美 pass rate 题; rollout 时以概率 $\alpha$ (10%) 从该池采样. 该策略在稳住更新的同时提高采样效率, 尤其在 RL 后期.

<!-- page 14 of 28 -->

#### 3.3.3 Hyper-Parameters 超参数

In our experiment, we employed a training batch size of 512, with an actor mini-batch size of 32. We executed 16 gradient updates per training iteration at a learning rate of 1e-6. The maximum sequence length was set to 32,768 tokens to facilitate complex reasoning tasks. During the training phase, both temperature and top-p parameters were configured at 1.0 to promote output diversity.

实验中训练 batch size 512, actor mini-batch 32; 每训练迭代做 16 次梯度更新, 学习率 1e-6; 最大序列长度 32,768; 训练阶段 temperature 与 top-p 均为 1.0 以促进多样性.

> **停一下:** §3.3.2 写 $\alpha=10\%$, §3.3.3 写每迭代 16 次梯度更新, mini-batch 32, 训练 batch 512. 文内有没有解释 16 次更新与 batch 512 / mini-batch 32 的整除关系是否刻意为之?
> 数字上 512/32=16, 与 「16 gradient updates per training iteration」 数字一致, 但正文未单独用一句话声明该整除关系是设计约束. 复现超参时应三项同时抄齐.

这些 RL 超参与 §2.3 预训练日程相互独立; 最大长度 32,768 与 Stage 3 / SFT pack 长度对齐, 便于承接长 CoT.

### 3.4 RL Infrastructures 强化学习基建

We develop the Seamless Rollout Engine and enhance vLLM’s robustness to enable efficient dynamic-sampling-based RL training. We construct our RL system based on verl (Sheng et al., 2024), an open-source RL training library. The library uses Ray (Moritz et al., 2018) to manage computation and communication, implementing the rollout and training phases in Ray Actors and exchanging training data through Ray Objects. Although verl supports flexible implementations of various RL algorithms, it suffers from GPU idle time during both rollout and reward computation phases. Due to the skewness in response lengths, we observe that most GPUs remain idle while waiting for a few long-sequence rollout workers, resulting in wasted computational resources and a slow training process. Several prior works have identified this issue and proposed system-level solutions (Seed et al., 2025; Team et al., 2025b; Zhong et al., 2024b). However, most of these solutions rely on asynchronous training, which modifies the underlying algorithm and introduces staleness in long-sequence responses. Rule-based reward computation is also time-consuming, particularly for code data, leading to idle periods for valuable GPU resources. Our use of dynamic sampling, while improving sample efficiency, exacerbates GPU idle time, and leads to wasted examples during multi-turn rollouts. To simultaneously optimize GPU utilization and reduce sample waste, we develop the Seamless Rollout Engine, opportunistically filling sample batches into rollout while performing asynchronous reward computation. Our system builds on the vLLM inference engine (Kwon et al., 2023), and we collaborate with the open-source community to enhance the robustness of vLLM’s “external launch” mode within the verl framework. Additionally, we implement MTP in vLLM to support both MiMo-7B and MiMo-7B-RL.

作者开发 Seamless Rollout Engine 并增强 vLLM 稳健性, 以支撑基于动态采样的高效 RL. 系统基于 verl, 用 Ray 管理计算与通信. verl 灵活但在 rollout 与奖励阶段易出现 GPU 空闲: 响应长度偏斜时多数 GPU 等待少数长序列 worker. 既有系统方案多依赖异步训练, 会改动算法语义并引入长序列陈旧性. 规则奖励 (尤其代码) 也耗时. 动态采样虽提高样本效率, 却加剧空闲与多样本浪费. Seamless Rollout Engine 在异步算奖的同时机会性地向 rollout 填充样本; 并在 verl 的 vLLM external launch 模式上增强稳健性, 同时实现 MTP 以支持 MiMo-7B 与 MiMo-7B-RL.

#### 3.4.1 Seamless Rollout Engine Seamless Rollout 引擎

Seamless Rollout Engine optimizes GPU utilization in rollout workers through efficient task scheduling, minimizing idle time during continuous operation. The engine consists of the following components: (a) continuous rollout, (b) asynchronous reward computation, and (c) early termination. It achieves a 2.29× speedup in training and a 1.96× speedup in validation.

该引擎通过高效任务调度优化 rollout worker 的 GPU 利用率, 含 (a) 连续 rollout, (b) 异步奖励计算, (c) 早停; 训练加速 2.29×, 验证加速 1.96×.

**Continuous Rollout** The core of Seamless Rollout Engine lies in proactively handling completed rollout tasks and initiating new rollouts. Unlike naive dynamic sampling implementations that delay reward computation until all rollout workers complete, Seamless Rollout Engine eliminates synchronization barriers between generation and reward phases. It actively monitors completed workers, immediately computes their rewards, and triggers new rollouts on demand. After computing rewards, we update the number of valid samples and the current step’s pass-rate statistics, then launch new rollout tasks if active tasks are insufficient to meet training demands based on these statistics. As illustrated in Figure 6, the Seamless Rollout Engine initiates a new task upon completing rollout tasks ③④①⑥ to meet demand, whereas after finishing tasks ②⑤⑦, it predicts that ongoing tasks are sufficient and thus schedules no additional ones.

**连续 Rollout** 核心是主动处理已完成任务并发起新 rollout, 消除生成与奖励之间的同步壁垒: 监控完成的 worker, 立即算奖, 按需触发新任务; 更新有效样本数与当前步 pass-rate 统计后, 若活跃任务不足以满足训练需求再启动新任务. 如图 6, 完成 ③④①⑥ 后会新开任务; 完成 ②⑤⑦ 后若预测进行中任务已够则不再追加.

<!-- page 15 of 28 -->

![Image block](images/p15-figure-6-an-overview-of-the-seamless-rollout-engine-for.png)

Figure 6 An overview of the Seamless Rollout Engine for MiMo-7B-RL.
图 6 MiMo-7B-RL 的 Seamless Rollout Engine 概览.

**Asynchronous Reward Computation** While reward computation for math data is rapid, judging code-related data incurs significant overhead, leading to prolonged GPU idle time. Additionally, the sequential nature of naive reward computation fails to utilize the multiprocessing capabilities of modern processing units. To resolve these issues, we employ Ray to launch asynchronous reward computation, which facilitates concurrent management of rollout and reward tasks. Upon task completion, the system dynamically forwards rollout outputs for reward evaluation or aggregates results to update the sample state, as shown in Figure 6. Dedicated servers are allocated for code-specific reward computation to prevent bottlenecks in the rollout pipeline.

**异步奖励计算** 数学奖励很快, 代码评判开销大, 易造成 GPU 长时间空闲; 朴素串行算奖也吃不满多核. 作者用 Ray 异步发起奖励计算, 使 rollout 与奖励可并发管理; 任务完成后动态转发输出去评奖或汇总以更新样本状态 (图 6). 代码奖励使用专用服务器, 以免成为 rollout 流水线瓶颈.

**Early Termination** When the number of valid samples exceeds the required training batch size, careful management of ongoing tasks becomes essential. Abrupt termination of ongoing tasks tends to suppress the generation of long-sequence responses, which could destabilize RL training dynamics. A straightforward solution involves waiting for all active tasks to complete before randomly sampling required batch from the outputs. However, this approach may extend waiting times if a long-sequence rollout initiates near the end of the dynamic sampling phase. To mitigate this delay while preserving data distribution integrity, we implement a first-in-first-out selection strategy. We terminate ongoing tasks only if the valid sample count meets the batch requirement and all tasks initiated prior to these selected samples have completed. In Figure 6, the last rollout is aborted since earlier samples already reach the required batch size.

**早停** 当有效样本超过所需训练 batch 时需谨慎管理进行中任务. 突然中止会压抑长序列生成, 可能扰动 RL 动态. 朴素做法是等全部活跃任务结束再随机抽 batch, 但若动态采样末段刚启动长序列, 等待会拉得很长. 作者采用 FIFO: 仅当有效样本已够, 且所有早于这些入选样本启动的任务均已完成时, 才终止进行中任务. 图 6 中最后一次 rollout 被中止, 因更早样本已凑满 batch.

**Experimental Analysis** We randomly choose a 5-step training trace to evaluate the performance of Seamless Rollout Engine. The experiment is conducted on 256 H20 GPUs, and the results are presented in Table 2. “Overall Speedup” measures end-to-end RL training efficiency; “Rollout Speedup” shows the acceleration of rollout and reward tasks; “Normalized GPU Idle Time” reflects the total idle GPU hours. The above metrics are normalized with respect to the naive dynamic sampling implementation. “GPU Idle Ratio” quantifies the average proportion of GPU inactivity during rollout and reward computation; “Sample Waste Ratio” represents the ratio of excess valid

**实验分析** 随机取 5-step 训练轨迹, 在 256 张 H20 上评测, 结果见表 2. Overall Speedup 衡量端到端 RL 训练效率; Rollout Speedup 衡量 rollout+奖励加速; Normalized GPU Idle Time 为归一化空闲 GPU 小时 (相对 naive dynamic sampling). GPU Idle Ratio 为 rollout 与奖励期间平均空闲比例; Sample Waste Ratio 为多余有效

<!-- page 16 of 28 -->

| Method | Overall Speedup ↑ | Rollout Speedup ↑ | Normalized GPU Idle Time ↓ | GPU Idle Ratio ↓ | Sample Waste Ratio ↓ |
| --- | --- | --- | --- | --- | --- |
| w/o Dynamic Sampling | 2.45× | 2.82× | 0.36 | 70.8% | / |
| Naive Dynamic Sampling | 1.00× | 1.00× | 1.00 | 69.3% | 22.1% |
| + Continous Rollout | 1.99× | 2.20× | 0.25 | 38.8% | 13.9% |
| + Async. Reward | 2.09× | 2.34× | 0.21 | 34.0% | 16.4% |
| + Early Termination | 2.29× | 2.61× | 0.15 | 27.7% | 12.9% |

Table 2 The experimental results of Seamless Rollout Engine compared with baseline methods.
表 2 Seamless Rollout Engine 相对基线的实验结果.

samples generated relative to the required batch size. In Seamless Rollout Engine, aborted tasks are considered in GPU idle time.

样本相对所需 batch 的比率. 在 Seamless Rollout Engine 中, 被中止的任务计入 GPU 空闲时间.

All three components contribute to faster dynamic sampling and smaller GPU idle time. Though the experiment without dynamic sampling can achieve higher throughput, it incurs significant sample inefficiency due to numerous zero-gradient training samples. These zero-gradient samples not only diminishes the effective training batch size, but also risk destabilizing the training dynamics of the RL algorithm. Given an average sample pass rate of 41% within this 5-step experiment, static sampling achieves a sample efficiency similar to naive dynamic sampling; the latter does not train zero-gradient data but incurs wasted samples. Equipped with all three components, Seamless Rollout Engine achieves a comparable one-step training time compared to static sampling while demonstrating superior sample efficiency. The sample pass rate of 41% leads to a sample waste ratio of 22% in the naive implementation; in practice, this ratio can be larger in different situations. Through continous rollout and dynamic launch scheduling, Seamless Rollout Engine reduces the sample waste ratio to around 15%.

三组件都带来更快的动态采样与更低空闲. 无动态采样吞吐更高, 但零梯度样本造成显著样本低效, 既缩小有效 batch, 也可能扰动 RL 动态. 该 5-step 实验平均 sample pass rate 约 41%, 静态采样与 naive 动态采样样本效率相近: 后者不训零梯度数据但有浪费. 三组件齐全时, Seamless Rollout 单步训练时间可比静态采样, 样本效率更好.41% pass rate 对应 naive 约 22% waste; 实际场景可能更高. 经连续 rollout 与动态调度, waste 降到约 15% (表中最终 12.9%).

**Accelerated Validation** During validation, we can directly stream the rollout and reward tasks using Seamless Rollout Engine. Similar to the naive implementation, currently we set the validation batch size equal to the dataset length and launch all rollout tasks simultaneously. Our implementation utilizes asynchronous reward computation, achieving a 1.96× speedup while reducing idle GPU time to 25%, as demonstrated in Table 3. Notably, the experimental results demonstrate Seamless Rollout Engine’s potential for static sampling, which also has one-pass rollout and reward computation. If the validation dataset is sufficiently large, further acceleration can be achieved by optimizing the batch size for validation and employing continuous rollout.

**加速验证** 验证阶段可直接用该引擎流式跑 rollout 与奖励. 当前仍将验证 batch 设为数据集长度并同时启动全部 rollout; 借助异步奖励达到 1.96× 加速, 并把空闲 GPU 时间降到 25% (表 3). 结果也显示该引擎对静态采样有潜力; 若验证集足够大, 还可通过优化验证 batch 与启用连续 rollout 进一步加速.

| Method | Speedup ↑ | Normalized GPU Idle Time ↓ | GPU Idle Ratio ↓ |
| --- | --- | --- | --- |
| Naive Validation | 1× | 1 | 65.8% |
| Seamless Rollout Engine | 1.96× | 0.25 | 32.9% |

Table 3 The validation speedup and GPU idle time of the naive implementation and the Seamless Rollout Engine. The experiment is conducted on 256 H20 GPUs using our full validation dataset.
表 3 朴素实现与 Seamless Rollout Engine 的验证加速与 GPU 空闲. 实验在 256 张 H20 上使用完整验证集.

> **对一下:** Tab. 2 最终行 Overall Speedup 2.29×, Sample Waste Ratio 12.9%; 正文又写 waste 「reduces ... to around 15%」. 应以哪一处为准引用最终配置?
> 表 2 最终配置给出精确 12.9%; 正文 「around 15%」 是对该量级的约述. 引用加速比与 waste 时优先用 Tab. 2 精确格, 并注明实验为 256 H20 上的 5-step trace.

#### 3.4.2 vLLM-based Inference Engine 基于 vLLM 的推理引擎

Our RL system employs vLLM (Kwon et al., 2023) as the inference engine. To accommodate our model’s new features, we have extended the framework with additional functionalities.

RL 系统以 vLLM 为推理引擎, 并为新特性做了扩展.

**MTP Support** As described in Section 2.2, our models integrate MTP modules to enhance performance. We have implemented and open-sourced MTP support for our models, enabling

**MTP 支持** 如 §2.2, 模型集成 MTP 模块. 作者实现并开源 MTP 支持, 使

<!-- page 17 of 28 -->

| Benchmark | GPT-4o0513 | Claude-3.5-Sonnet-1022 | OpenAIo1-mini | QwQ-32BPreview | R1-Distill-Qwen-14B | R1-Distill-Qwen-7B | MiMo-7B-RL |
| --- | --- | --- | --- | --- | --- | --- | --- |
| General |  |  |  |  |  |  |  |
| GPQA Diamond (Pass@1) | 49.9 | 65.0 | 60.0 | 54.5 | 59.1 | 49.1 | 54.4 |
| SuperGPQA (Pass@1) | 42.4 | 48.2 | 45.2 | 43.6 | 40.6 | 28.9 | 40.5 |
| DROP (3-shotF1) | 83.7 | 88.3 | 83.9 | 71.2 | 85.5 | 77.0 | 78.7 |
| MMLU-Pro (EM) | 72.6 | 78.0 | 80.3 | 52.0 | 68.8 | 53.5 | 58.6 |
| IF-Eval (PromptStrict) | 84.3 | 86.5 | 84.8 | 40.4 | 78.3 | 60.5 | 61.0 |
| Mathematics |  |  |  |  |  |  |  |
| MATH500 (Pass@1) | 74.6 | 78.3 | 90.0 | 90.6 | 93.9 | 92.8 | 95.8 |
| AIME 2024 (Pass@1) | 9.3 | 16.0 | 63.6 | 50.0 | 69.7 | 55.5 | 68.2 |
| AIME 2025 (Pass@1) | 11.6 | 7.4 | 50.7 | 32.4 | 48.2 | 38.8 | 55.4 |
| Code |  |  |  |  |  |  |  |
| LiveCodeBench v5 (Pass@1) | 32.9 | 38.9 | 53.8 | 41.9 | 53.1 | 37.6 | 57.8 |
| LiveCodeBench v6 (Pass@1) | 30.9 | 37.2 | 46.8 | 39.1 | 31.9 | 23.9 | 49.3 |

Table 4 Comparison between MiMo-7B-RL and other representative models.
表 4 MiMo-7B-RL 与其他代表性模型对照.

efficient inference for MTP-equipped architectures.

MTP 架构能够高效推理.

**Better Robustness** In verl, vLLM is deployed using the external launch mode, which may show instability in some scenarios. We’ve enhanced engine robustness to address these issues. We clear computed blocks in prefix caching during pre-emption to maintain KVCache consistency. We disable asynchronous output processing when increasing the number of scheduler steps to ensure compatibility and optimize performance.

**更好稳健性** verl 中 vLLM 以 external launch 部署, 某些场景可能不稳. 作者增强引擎稳健性: 抢占时清理 prefix caching 中已计算块以保持 KVCache 一致; 增加 scheduler steps 时关闭异步输出处理以保证兼容并优化性能.

### 3.5 Post-Training Evaluation 后训练评测

#### 3.5.1 Evaluation Setup 评测设置

We comprehensively evaluate reasoning models across a diverse range of benchmarks:

在多样基准上全面评测推理模型:

**Language understanding and reasoning**: MMLU-Pro (Wang et al., 2024).

**Scientific question answering**: GPQA Diamond (Rein et al., 2024) with averaged score of 8 repetitions; SuperGPQA (Du et al., 2025).

**Instruction following**: IFEval (Zhou et al., 2023) with averaged score of 8 repetitions.

**Reading comprehension**: DROP (Dua et al., 2019).

**Mathematics reasoning**: MATH500 (Lightman et al., 2024); AIME 2024 (MAA, 2024) and AIME 2025 (MAA, 2025) with averaged score of 32 repetitions.

**Coding**: LiveCodeBench v5 (20240801-20250201) (Jain et al., 2024) and LiveCodeBench v6 (20250201-20250501) (Jain et al., 2024) with averaged score of 8 repetitions.

During evaluation, we set the sampling temperature to 0.6 and top-p to 0.95 for all benchmarks. We set the maximum generation length to 32,768 tokens for mathematics reasoning, coding, and scientific question answering benchmarks, and to 8,192 tokens for other benchmarks.

评测温度 0.6, top-p 0.95; 数学, 代码与科学问答最大生成 32,768, 其他基准 8,192.

We compare MiMo-7B-RL against several strong baselines, including two non-reasoning models GPT-4o-0513, Claude-Sonnet-3.5-1022, and reasoning models OpenAI-o1-mini, QwQ-32B-Preview, DeepSeek-R1-Distill-Qwen-14B, and DeepSeek-R1-Distill-Qwen-7B.

对照含非推理模型 GPT-4o-0513, Claude-Sonnet-3.5-1022, 以及推理模型 o1-mini, QwQ-32B-Preview, R1-Distill-Qwen-14B / 7B.

<!-- page 18 of 28 -->

#### 3.5.2 Evaluation Results 评测结果

Table 4 shows the evaluation results. In mathematics reasoning, MiMo-7B-RL achieves top-tier performance among models of comparable parameter sizes, trailing only slightly behind DeepSeek-R1-Distill-Qwen-14B on AIME 2024. For algorithm code generation tasks, MiMo-7B-RL demonstrates extremely impressive results. On LiveCodeBench v5, it significantly outperforms OpenAI o1-mini, while on the latest LiveCodeBench v6, our model achieves a score of 49.3%, surpassing QwQ-32B-Preview by over 10 points, demonstrating its robust and stable capabilities. Notably, MiMo-7B-RL also maintains strong general performance, exceeding both QwQ-32B-Preview and DeepSeek-R1-Distill-Qwen-7B, though we only include mathematics and code problems for RL.

表 4 给出结果. 数学推理上 MiMo-7B-RL 在同参数量级居前列, AIME 2024 仅略低于 R1-Distill-Qwen-14B. 算法代码上 LiveCodeBench v5 显著超过 o1-mini; v6 得 49.3%, 超 QwQ-32B-Preview 逾 10 分. 尽管 RL 只用数学与代码题, 一般能力仍强于 QwQ-32B-Preview 与 R1-Distill-Qwen-7B.

> **再看:** Tab. 4 中 MiMo-7B-RL 的 LiveCodeBench v5 为 57.8, o1-mini 为 53.8; AIME 2025 为 55.4 vs o1-mini 50.7 (摘要称高 4.7). 摘要 「exceeding o1-mini by 4.7 points」 对应的是哪一列?
> Abstract / Summary 明确写 AIME 2025 55.4, exceeding o1-mini by 4.7 points; 55.4-50.7=4.7. 不要误接到 LiveCodeBench v5 的 57.8-53.8=4.0.

We also presents the evaluation results for different version of MiMo-7B in Table 5. MiMo-7B-RL-Zero is trained from MiMo-7B-Base, while MiMo-7B-RL is trained from MiMo-7B-SFT. As shown, RL from the base model exhibits a stronger growth trend, improving from 32.9% to on AIME 2024 for instance. Nonetheless, RL training from the SFT model achieves a higher performance ceiling, attaining the best results across all evaluated benchmarks.

表 5 给出系列版本对照: RL-Zero 从 Base 训, RL 从 SFT 训. 从 Base 直 RL 增长更陡 (如 AIME 2024 从 32.9% 起升); 从 SFT 再 RL 则天花板更高, 在所列基准上全面最佳.

| Benchmark | MiMo-7B-Base | MiMo-7B-RL-Zero | MiMo-7B-SFT | MiMo-7B-RL |
| --- | --- | --- | --- | --- |
| Mathematics |  |  |  |  |
| MATH500 | 37.4 | 93.6 | 93.0 | 95.8 |
| AIME 2024 | 32.9 | 56.4 | 58.7 | 68.2 |
| AIME 2025 | 24.3 | 46.3 | 44.3 | 55.4 |
| Code |  |  |  |  |
| LiveCodeBench v5 | 32.9 | 49.1 | 52.3 | 57.8 |
| LiveCodeBench v6 | 29.1 | 42.9 | 45.5 | 49.3 |

Table 5 Evaluation results of MiMo-Series models on mathematics and coding benchmarks
表 5 MiMo 系列在数学与代码基准上的评测结果

> **想:** Tab. 5 正文写 RL-Zero 在 AIME 2024 上 「improving from 32.9% to」, 句子在源文疑似截断. 表中 RL-Zero 的 AIME 2024 格是 56.4. 引用该增长时应以哪一数为终点?
> 以 Tab. 5 的 56.4 为 RL-Zero 终点; 正文残句未印出终点数字. 正式 RL 列为 68.2, 不要与 Zero 的 56.4 混淆.

### 3.6 Discussion 讨论

In this section, we share insights and observations from our exploration of MiMo-7B’s post-training process, which we hope will benefit the research community.

本节分享后训练探索中的观察, 供社区参考.

**SFT for Format Alignment** In the initial RL training steps from MiMo-7B-Base, we observe that the model primarily learns to adapt the answer extraction function, e.g., “\boxed{}” for mathematics problems. Therefore, we investigate a “light-weight” SFT to help the base model align with the expected answer format. However, as Figure 7 demonstrates, the resulting MiMo-7B-RL-LiteSFT model fails in both reasoning potential and final performance. While MiMo-7B-RL-LiteSFT begins with a higher performance than MiMo-7B-RL-Zero, it falls behind the base model’s trajectory after just 500 steps. Furthermore, when compared to MiMo-7B-RL, which undergoes “heavier” SFT, MiMo-7B-RL-LiteSFT exhibits a similar growth trend but significantly

**用于格式对齐的 SFT** 从 Base 直 RL 的最初若干步, 模型主要在学答案抽取格式 (如数学的 `\boxed{}`). 作者尝试用 「轻量」 SFT 对齐格式, 但图 7 显示 MiMo-7B-RL-LiteSFT 在推理潜力与最终表现上均失败: 起步高于 RL-Zero, 仅约 500 步后就落后于 Base 直 RL 轨迹; 相对经过更重 SFT 的 MiMo-7B-RL, 增长趋势类似但显著

![Chart block](images/p18-figure-7-performance-comparison-of-three-mimo-model.png)

Figure 7 Performance comparison of three MiMo model variants during the RL process.
图 7 三种 MiMo 变体在 RL 过程中的表现对照.

<!-- page 19 of 28 -->

underperforms due to its inferior starting point, ultimately leading to poorer final results.

更低 (起点更差), 最终结果更弱.

> **对一下:** Fig. 7 与正文写 LiteSFT 约 500 步后落后 Base 直 RL 轨迹. 文内有没有给出 LiteSFT 的数据量, 步数预算或学习率, 以便与 §3.1 的约 500K / $3\times10^{-5}$ 主 SFT 对照?
> §3.6 只定性称 「light-weight」 SFT 与 「heavier」 SFT, 并用 Fig. 7 给轨迹; 未在该段给出 LiteSFT 的样本量或优化超参表. 结论应回到 Fig. 7 的相对轨迹, 不要把 §3.1 主 SFT 超参抄成 LiteSFT.

**Interference Between Different Domains** During the later stages of RL training from MiMo-7B-Base, maintaining a performance balance between mathematics and coding tasks proves challenging. Between training steps 2000 and 2500, the model exhibits continuous improvement on code problems, while its performance on mathematical reasoning tasks fluctuates and declines. In contrast, RL training on the cold-started SFT model shows consistent improvements across both domains. Analysis of the model outputs reveals that the base model, with its strong exploration capabilities, tends to hack the reward for mathematics problems. For code problems, however, the test-case-based verifier makes reward exploitation significantly harder. This highlights the critical need for high-quality mathematical problem sets to ensure robust RL training.

**不同域之间的干扰** 从 Base 直 RL 的后期, 数学与代码难保持平衡: 约 2000–2500 步代码持续上升, 数学波动下降. 冷启动 SFT 后再 RL 则两域更同向改进. 输出分析显示 Base 探索强, 更易 hack 数学奖励; 代码侧测例核验更难刷分. 这强调高质量数学题集对稳健 RL 的重要性.

> **想:** §3.6 把域干扰窗口写在 steps 2000–2500. 文内有没有给出该窗口内数学 / 代码各自的具体分数曲线表, 还是只有定性描述?
> 正文为定性描述 (代码 continuous improvement, 数学 fluctuates and declines); 未在该段附数值表. 可核对锚点是步数窗口与 「Base 更易 hack 数学奖励」 的机制判断, 不要编造未给出的榜分.

**Language Mixing Penalty** Like DeepSeek-R1-Zero, we also observe language mixing issues during RL training on MiMo-7B-Base. To mitigate this problem, we introduce a language mixing penalty into the reward function. However, we find designing such a penalty function is challenging. While detecting Chinese characters in English responses is straightforward, the reverse is far more difficult, since mathematical equations and code inherently contain English words. As a result, the penalty not only fails to fully resolve language mixing but also introduces the risk of reward hacking, such as always generating English responses regardless of the question language.

**语言混合惩罚** 与 DeepSeek-R1-Zero 类似, Base 直 RL 也出现语言混合. 作者尝试加入语言混合惩罚, 但设计很难: 英答中检中文容易, 反向很难, 因公式与代码天然含英文. 结果是惩罚既去不干净混合, 又引入新的 reward hacking 风险 (例如无视题面语言总出英文).

> **看表:** §3.6 Language Mixing Penalty 段是否报告最终正式 MiMo-7B-RL 仍启用该惩罚, 还是仅作为失败尝试记录?
> 该段描述引入惩罚后的困难与风险, 未声明正式 RL 主结果仍默认开启该惩罚. 应读作探索记录; 主奖励叙述仍以 §3.2 的规则准确率奖励为准.

**Impact of SFT Data Scaling** Building upon preliminary experiments, our study significantly scaled the SFT dataset from approximately 500K to 6M instances. We empirically observed that this substantial expansion of SFT data resulted in marked improvements in the model’s reasoning abilities and its capacity for generalized dialogue, without compromising its potential for subsequent RL. As detailed in Table 6, the model trained with 6M SFT instances exhibited considerable advancements over its counterpart trained with 500K instances in areas such as mathematical reasoning, code reasoning, scientific reasoning and general dialogue capabilities. Importantly, models subsequently fine-tuned with RL following this enhanced SFT stage also demonstrated sustained performance improvements.

**SFT 数据 Scaling 的影响** 在初步实验基础上, 将 SFT 数据从约 500K 扩到 6M. 经验上, 这显著抬升推理与通用对话能力, 且不损害后续 RL 潜力. 如表 6, 6M SFT 在数学, 代码, 科学推理与通用对话上明显强于 500K; 在此增强 SFT 后再 RL 的模型也持续改进.

| Benchmark Mi | Mo-7B-SFT-500K | MiMo-7B-SFT-6M | MiMo-7B-RL | MiMo-7B-RL-0530 |
| --- | --- | --- | --- | --- |
| AIME 24 | 58.7 | 68.3 | 68.2 | 80.1 |
| AIME 25 | 44.3 | 50.9 | 55.4 | 70.2 |
| MATH500 | 93.0 | 94.8 | 95.8 | 97.2 |
| GPQA Diamond | 50.7 | 54.1 | 54.4 | 60.6 |
| LiveCodeBench v5 | 52.3 | 53.4 | 57.8 | 60.9 |
| Alignbench v1.1 | 6.7 | 7.1 | 6.9 | 7.4 |

Table 6 Model Performance Comparison on Various Benchmarks. MiMo-7B-RL-0530 was evaluated at a 48K context length, its training length, while the other three models were assessed at their 32K training context length. Evaluations for Alignbench v1.1 Liu et al. (2024b) were conducted using GPT-4.1 as the judge.
表 6 各基准上的模型表现对照. MiMo-7B-RL-0530 在其训练长度 48K 上下文评测, 其余三列在 32K 训练上下文评测. Alignbench v1.1 以 GPT-4.1 为裁判.

**On-Policy RL with Extended Generation Budget** Our prior empirical investigations indicated that a vanilla implementation of GRPO was markedly prone to premature performance saturation. To mitigate this, we adopted an on-policy RL algorithm, drawing parallels with the approach used in MiMo-VL-7B-RL Team et al. (2025a). Training with on-policy RL proved to be remarkably stable, while also enabling sustained growth in model efficacy throughout the learning process. Further

**带扩展生成预算的 On-Policy RL** 先前经验表明朴素 GRPO 易过早饱和. 作者改用 on-policy RL, 写法与 MiMo-VL-7B-RL (Team et al., 2025a) 平行. on-policy RL 训练更稳, 并能在学习过程中持续抬升效能.

<!-- page 20 of 28 -->

![Chart block](images/p20-figure-8-mimo-7b-rl-0530-performance-curves-on-aime24.png)

Figure 8 MiMo-7B-RL-0530 Performance Curves on AIME24.
图 8 MiMo-7B-RL-0530 在 AIME24 上的表现曲线.

extending our findings, we observed that continuous elevation of the generation length budget during on-policy RL training consistently boosts model performance. Specifically, our RL training protocol involved systematically increasing the model’s generation length from 32K to 38K, and subsequently to 48K. This progressive extension of the generation budget was instrumental in our 7B model ultimately achieving parity with the Deepseek-R1 performance in mathematical reasoning. The MiMo-7B-RL-0530 model has been open-sourced and is publicly available<sup>1</sup>.

进一步观察: 在 on-policy RL 中持续提高生成长度预算会稳定抬分. 协议将生成长度从 32K 提到 38K, 再提到 48K. 这一 TestingTime 向的预算加长, 帮助 7B 模型在数学推理上达到与 DeepSeek-R1 相当的表现. MiMo-7B-RL-0530 已开源<sup>1</sup>.

> **问:** Tab. 6 脚注写 RL-0530 在 48K 上下文评测, 其余三列在 32K; Fig. 8 给出 0530 的 AIME24 曲线. 正文把生成预算 32K→38K→48K 写成训练协议. 评测长度与训练生成预算是否被文内写成同一件事情?
> 训练侧明确写生成长度预算 32K→38K→48K; 评测侧脚注写 0530 用 48K context length (its training length). 二者对齐到 48K 终点, 但中间 38K 只出现在训练叙述. 引用时应区分训练预算日程与 Tab. 6 的评测上下文设定.

## 4 Conclusion

This work introduces MiMo-7B, a series of LLMs which unlock advanced reasoning capabilities through optimized pre-training and post-training process. Exposed to diverse reasoning patterns during pre-training, MiMo-7B-Base possesses exceptional reasoning potential, outperforming models of significantly larger scale. For post-training, with our robust and efficient RL frameworks, we trained MiMo-7B-RL-Zero and MiMo-7B-RL which demonstrate superior reasoning capabilities across mathematics, code and general tasks. We hope this work offers insights for developing more powerful reasoning models.

本文提出 MiMo-7B, 一系列通过优化预训练与后训练流程释放高级推理能力的 LLM. 预训练阶段接触多样化推理模式后, MiMo-7B-Base 具备超出自身规模的推理潜力, 胜过规模大得多的模型. 后训练阶段, 依托稳健高效的 RL 框架, 训出 MiMo-7B-RL-Zero 与 MiMo-7B-RL, 在数学, 代码与通用任务上都展现更强推理能力. 希望本工作为开发更强的推理模型提供参考.

## References

J. Ainslie, J. Lee-Thorp, M. de Jong, Y. Zemlyanskiy, F. Lebron, and S. Sanghai. GQA: Training generalized multi-query transformer models from multi-head checkpoints. In H. Bouamor, J. Pino, and K. Bali, editors, Proceedings of the 2023 Conference on Empirical Methods in

<small><span class="docvortex-page-footnote" data-block-type="page_footnote" style="color:#6b7280"><sup>1</sup>https://huggingface.co/XiaomiMiMo/MiMo-7B-RL-0530</span></small>

<!-- page 21 of 28 -->

Natural Language Processing, pages 4895–4901, Singapore, 2023. Association for Computational Linguistics. doi: 10.18653/v1/2023.emnlp-main.298. URL [https://aclanthology.org/2023.emnlp-main.298](https://aclanthology.org/2023.emnlp-main.298).

Anthropic. Claude 3.7 sonnet and claude code, 2025. URL [https://www.anthropic.com/claude/sonnet](https://www.anthropic.com/claude/sonnet).

J. Austin, A. Odena, M. Nye, M. Bosma, H. Michalewski, D. Dohan, E. Jiang, C. Cai, M. Terry, Q. Le, et al. Program synthesis with large language models. ArXiv preprint, abs/2108.07732, 2021. URL [https://arxiv.org/abs/2108.07732](https://arxiv.org/abs/2108.07732).

A. Barbaresi. Trafilatura: A web scraping library and command-line tool for text discovery and extraction. In H. Ji, J. C. Park, and R. Xia, editors, Proceedings of the 59th Annual Meeting of the Association for Computational Linguistics and the 11th International Joint Conference on Natural Language Processing: System Demonstrations, pages 122–131, Online, 2021. Association for Computational Linguistics. doi: 10.18653/v1/2021.acl-demo.15. URL [https://aclanthology.org/2021.acl-demo.15](https://aclanthology.org/2021.acl-demo.15).

Y. Bisk, R. Zellers, R. LeBras, J. Gao, and Y. Choi. PIQA: reasoning about physical commonsense in natural language. In The Thirty-Fourth AAAI Conference on Artificial Intelligence, AAAI 2020, The Thirty-Second Innovative Applications of Artificial Intelligence Conference, IAAI 2020, The Tenth AAAI Symposium on Educational Advances in Artificial Intelligence, EAAI 2020, New York, NY, USA, February 7-12, 2020, pages 7432–7439. AAAI Press, 2020. URL [https://aaai.org/ojs/index.php/AAAI/article/view/6239](https://aaai.org/ojs/index.php/AAAI/article/view/6239).

A. Z. Broder. On the resemblance and containment of documents. In Proceedings. Compression and Complexity of SEQUENCES 1997 (Cat. No. 97TB100171), pages 21–29. IEEE, 1997.

M. Chen, J. Tworek, H. Jun, Q. Yuan, H. P. D. O. Pinto, J. Kaplan, H. Edwards, Y. Burda, N. Joseph, G. Brockman, et al. Evaluating large language models trained on code. ArXiv preprint, abs/2107.03374, 2021. URL [https://arxiv.org/abs/2107.03374](https://arxiv.org/abs/2107.03374).

P. Clark, I. Cowhey, O. Etzioni, T. Khot, A. Sabharwal, C. Schoenick, and O. Tafjord. Think you have solved question answering? try arc, the ai2 reasoning challenge. ArXiv preprint, abs/1803.05457, 2018. URL [https://arxiv.org/abs/1803.05457](https://arxiv.org/abs/1803.05457).

K. Cobbe, V. Kosaraju, M. Bavarian, M. Chen, H. Jun, L. Kaiser, M. Plappert, J. Tworek, J. Hilton, R. Nakano, et al. Training verifiers to solve math word problems. ArXiv preprint, abs/2110.14168, 2021. URL [https://arxiv.org/abs/2110.14168](https://arxiv.org/abs/2110.14168).

Y. N. Dauphin, A. Fan, M. Auli, and D. Grangier. Language modeling with gated convolutional networks. In D. Precup and Y. W. Teh, editors, Proceedings of the 34th International Conference on Machine Learning, ICML 2017, Sydney, NSW, Australia, 6-11 August 2017, volume 70 of Proceedings of Machine Learning Research, pages 933–941. PMLR, 2017. URL [http://proceedings.mlr.press/v70/dauphin17a.html](http://proceedings.mlr.press/v70/dauphin17a.html).

X. Du, Y. Yao, K. Ma, B. Wang, T. Zheng, K. Zhu, M. Liu, Y. Liang, X. Jin, Z. Wei, et al. Supergpqa: Scaling llm evaluation across 285 graduate disciplines. ArXiv preprint, abs/2502.14739, 2025. URL [https://arxiv.org/abs/2502.14739](https://arxiv.org/abs/2502.14739).

D. Dua, Y. Wang, P. Dasigi, G. Stanovsky, S. Singh, and M. Gardner. DROP: A reading comprehension benchmark requiring discrete reasoning over paragraphs. In J. Burstein, C. Doran, and T. Solorio, editors, Proceedings of the 2019 Conference of the North American Chapter of the Association

<!-- page 22 of 28 -->

for Computational Linguistics: Human Language Technologies, Volume 1 (Long and Short Papers), pages 2368–2378, Minneapolis, Minnesota, 2019. Association for Computational Linguistics. doi: 10.18653/v1/N19-1246. URL [https://aclanthology.org/N19-1246](https://aclanthology.org/N19-1246).

A. P. Gema, J. O. J. Leang, G. Hong, A. Devoto, A. C. M. Mancino, R. Saxena, X. He, Y. Zhao, X. Du, M. R. G. Madani, et al. Are we done with mmlu? ArXiv preprint, abs/2406.04127, 2024. URL [https://arxiv.org/abs/2406.04127](https://arxiv.org/abs/2406.04127).

F. Gloeckle, B. Y. Idrissi, B. Rozière, D. Lopez-Paz, and G. Synnaeve. Better & faster large language models via multi-token prediction. In Forty-first International Conference on Machine Learning, ICML 2024, Vienna, Austria, July 21-27, 2024. OpenReview.net, 2024. URL [https://openreview.net/forum?id=pEWAcejiU2](https://openreview.net/forum?id=pEWAcejiU2).

A. Grattafiori, A. Dubey, A. Jauhri, A. Pandey, A. Kadian, A. Al-Dahle, A. Letman, A. Mathur, A. Schelten, A. Vaughan, et al. The llama 3 herd of models. ArXiv preprint, abs/2407.21783, 2024. URL [https://arxiv.org/abs/2407.21783](https://arxiv.org/abs/2407.21783).

A. Gu, B. Rozière, H. J. Leather, A. Solar-Lezama, G. Synnaeve, and S. Wang. Cruxeval: A benchmark for code reasoning, understanding and execution. In Forty-first International Conference on Machine Learning, ICML 2024, Vienna, Austria, July 21-27, 2024. OpenReview.net, 2024. URL [https://openreview.net/forum?id=Ffpg52swvg](https://openreview.net/forum?id=Ffpg52swvg).

D. Guo, D. Yang, H. Zhang, J. Song, R. Zhang, R. Xu, Q. Zhu, S. Ma, P. Wang, X. Bi, et al. Deepseek-r1: Incentivizing reasoning capability in llms via reinforcement learning. ArXiv preprint, abs/2501.12948, 2025. URL [https://arxiv.org/abs/2501.12948](https://arxiv.org/abs/2501.12948).

J. He, J. Liu, C. Y. Liu, R. Yan, C. Wang, P. Cheng, X. Zhang, F. Zhang, J. Xu, W. Shen, S. Li, L. Zeng, T. Wei, C. Cheng, B. An, Y. Liu, and Y. Zhou. Skywork open reasoner series. [https://capricious-hydrogen-41c.notion.site/Skywork-Open-Reaonser-Series-1d0bc9ae823a80459b46c149e4f51680](https://capricious-hydrogen-41c.notion.site/Skywork-Open-Reaonser-Series-1d0bc9ae823a80459b46c149e4f51680), 2025. Notion Blog.

D. Hendrycks, C. Burns, S. Basart, A. Zou, M. Mazeika, D. Song, and J. Steinhardt. Measuring massive multitask language understanding. In 9th International Conference on Learning Representations, ICLR 2021, Virtual Event, Austria, May 3-7, 2021. OpenReview.net, 2021a. URL [https://openreview.net/forum?id=d7KBjmI3GmQ](https://openreview.net/forum?id=d7KBjmI3GmQ).

D. Hendrycks, C. Burns, S. Kadavath, A. Arora, S. Basart, E. Tang, D. Song, and J. Steinhardt. Mea suring mathematical problem solving with the math dataset. ArXiv preprint, abs/2103.03874, 2021b. URL [https://arxiv.org/abs/2103.03874](https://arxiv.org/abs/2103.03874).

C.-P. Hsieh, S. Sun, S. Kriman, S. Acharya, D. Rekesh, F. Jia, Y. Zhang, and B. Ginsburg. Ruler: What’s the real context size of your long-context language models? ArXiv preprint, abs/2404.06654, 2024. URL [https://arxiv.org/abs/2404.06654](https://arxiv.org/abs/2404.06654).

J. Hu, Y. Zhang, Q. Han, D. Jiang, X. Zhang, and H.-Y. Shum. Open-reasoner-zero: An open source approach to scaling up reinforcement learning on the base model. ArXiv preprint, abs/2503.24290, 2025. URL [https://arxiv.org/abs/2503.24290](https://arxiv.org/abs/2503.24290).

Y. Huang, Y. Bai, Z. Zhu, J. Zhang, J. Zhang, T. Su, J. Liu, C. Lv, Y. Zhang, J. Lei, Y. Fu, M. Sun, and J. He. C-eval: A multi-level multi-discipline chinese evaluation suite for foundation models. In A. Oh, T. Naumann, A. Globerson, K. Saenko, M. Hardt, and S. Levine, editors, Advances in Neural Information Processing Systems 36: Annual Conference on Neural Information Processing Systems 2023, NeurIPS 2023, New Orleans, LA, USA, December 10 -

<!-- page 23 of 28 -->

16, 2023, 2023. URL [http://papers.nips.cc/paper\_files/paper/2023/hash/c6ec1844bec96d6d32ae95ae694e23d8-Abstract-Datasets\_and\_Benchmarks.html](http://papers.nips.cc/paper_files/paper/2023/hash/c6ec1844bec96d6d32ae95ae694e23d8-Abstract-Datasets_and_Benchmarks.html).

IOI. International olympiad in informatics, 2024. URL [https://ioinformatics.org/](https://ioinformatics.org/).

N. Jain, K. Han, A. Gu, W.-D. Li, F. Yan, T. Zhang, S. Wang, A. Solar-Lezama, K. Sen, and I. Stoica. Livecodebench: Holistic and contamination free evaluation of large language models for code. ArXiv preprint, abs/2403.07974, 2024. URL [https://arxiv.org/abs/2403.07974](https://arxiv.org/abs/2403.07974).

M. Joshi, E. Choi, D. Weld, and L. Zettlemoyer. TriviaQA: A large scale distantly supervised challenge dataset for reading comprehension. In R. Barzilay and M.-Y. Kan, editors, Proceedings of the 55th Annual Meeting of the Association for Computational Linguistics (Volume 1: Long Papers), pages 1601–1611, Vancouver, Canada, 2017. Association for Computational Linguistics. doi: 10.18653/v1/P17-1147. URL [https://aclanthology.org/P17-1147](https://aclanthology.org/P17-1147).

T. Kwiatkowski, J. Palomaki, O. Redfield, M. Collins, A. Parikh, C. Alberti, D. Epstein, I. Polosukhin, J. Devlin, K. Lee, K. Toutanova, L. Jones, M. Kelcey, M.-W. Chang, A. M. Dai, J. Uszkoreit, Q. Le, and S. Petrov. Natural questions: A benchmark for question answering research. Transactions of the Association for Computational Linguistics, 7:452–466, 2019. doi: 10.1162/tacl\_a\_00276. URL [https://aclanthology.org/Q19-1026](https://aclanthology.org/Q19-1026).

W. Kwon, Z. Li, S. Zhuang, Y. Sheng, L. Zheng, C. H. Yu, J. Gonzalez, H. Zhang, and I. Stoica. Efficient memory management for large language model serving with pagedattention. In Proceedings of the 29th Symposium on Operating Systems Principles, pages 611–626, 2023.

G. Lai, Q. Xie, H. Liu, Y. Yang, and E. Hovy. RACE: Large-scale ReAding comprehension dataset from examinations. In M. Palmer, R. Hwa, and S. Riedel, editors, Proceedings of the 2017 Conference on Empirical Methods in Natural Language Processing, pages 785–794, Copenhagen, Denmark, 2017. Association for Computational Linguistics. doi: 10.18653/v1/D17-1082. URL [https://aclanthology.org/D17-1082](https://aclanthology.org/D17-1082).

Y. Leviathan, M. Kalman, and Y. Matias. Fast inference from transformers via speculative decoding. In A. Krause, E. Brunskill, K. Cho, B. Engelhardt, S. Sabato, and J. Scarlett, editors, International Conference on Machine Learning, ICML 2023, 23-29 July 2023, Honolulu, Hawaii, USA, volume 202 of Proceedings of Machine Learning Research, pages 19274–19286. PMLR, 2023. URL [https://proceedings.mlr.press/v202/leviathan23a.html](https://proceedings.mlr.press/v202/leviathan23a.html).

H. Li, Y. Zhang, F. Koto, Y. Yang, H. Zhao, Y. Gong, N. Duan, and T. Baldwin. Cmmlu: Measuring massive multitask language understanding in chinese. ArXiv preprint, abs/2306.09212, 2023. URL [https://arxiv.org/abs/2306.09212](https://arxiv.org/abs/2306.09212).

H. Lightman, V. Kosaraju, Y. Burda, H. Edwards, B. Baker, T. Lee, J. Leike, J. Schulman, I. Sutskever, and K. Cobbe. Let’s verify step by step. In The Twelfth International Conference on Learning Representations, ICLR 2024, Vienna, Austria, May 7-11, 2024. OpenReview.net, 2024. URL [https://openreview.net/forum?id=v8L0pN6EOi](https://openreview.net/forum?id=v8L0pN6EOi).

A. Liu, B. Feng, B. Xue, B. Wang, B. Wu, C. Lu, C. Zhao, C. Deng, C. Zhang, C. Ruan, et al. Deepseek-v3 technical report. ArXiv preprint, abs/2412.19437, 2024a. URL [https://arxiv.org/abs/2412.19437](https://arxiv.org/abs/2412.19437).

J. Liu, C. S. Xia, Y. Wang, and L. Zhang. Is your code generated by chatgpt really correct? rigorous evaluation of large language models for code generation. In A. Oh, T. Naumann, A. Globerson, K. Saenko, M. Hardt, and S. Levine, editors, Advances in Neural Information Processing Systems

<!-- page 24 of 28 -->

36: Annual Conference on Neural Information Processing Systems 2023, NeurIPS 2023, New Orleans, LA, USA, December 10 - 16, 2023, 2023. URL [http://papers.nips.cc/paper\_files/paper/2023/hash/43e9d647ccd3e4b7b5baab53f0368686-Abstract-Conference.html](http://papers.nips.cc/paper_files/paper/2023/hash/43e9d647ccd3e4b7b5baab53f0368686-Abstract-Conference.html).

J. Liu, D. Zhu, Z. Bai, Y. He, H. Liao, H. Que, Z. Wang, C. Zhang, G. Zhang, J. Zhang, et al. A comprehensive survey on long context language modeling. ArXiv preprint, abs/2503.17407, 2025. URL [https://arxiv.org/abs/2503.17407](https://arxiv.org/abs/2503.17407).

X. Liu, X. Lei, S. Wang, Y. Huang, Z. Feng, B. Wen, J. Cheng, P. Ke, Y. Xu, W. L. Tam, X. Zhang, L. Sun, X. Gu, H. Wang, J. Zhang, M. Huang, Y. Dong, and J. Tang. Alignbench: Benchmarking chinese alignment of large language models, 2024b. URL [https://arxiv.org/abs/2311.18743](https://arxiv.org/abs/2311.18743).

Y. Liu, R. Jin, L. Shi, Z. Yao, and D. Xiong. Finemath: A fine-grained mathematical evaluation benchmark for chinese large language models. ArXiv preprint, abs/2403.07747, 2024c. URL [https://arxiv.org/abs/2403.07747](https://arxiv.org/abs/2403.07747).

I. Loshchilov and F. Hutter. Decoupled weight decay regularization. In 7th International Conference on Learning Representations, ICLR 2019, New Orleans, LA, USA, May 6-9, 2019. OpenReview.net, 2019. URL [https://openreview.net/forum?id=Bkg6RiCqY7](https://openreview.net/forum?id=Bkg6RiCqY7).

MAA. American invitational mathematics examination - aime. In American Invitational Mathematics Examination - AIME, 2024. URL [https://maa.org/math-competitions/american-invitational-mathematics-examination-aime](https://maa.org/math-competitions/american-invitational-mathematics-examination-aime).

MAA. American invitational mathematics examination - aime. In American Invitational Mathematics Examination - AIME, 2025. URL [https://maa.org/math-competitions/american-invitational-mathematics-examination-aime](https://maa.org/math-competitions/american-invitational-mathematics-examination-aime).

P. Moritz, R. Nishihara, S. Wang, A. Tumanov, R. Liaw, E. Liang, M. Elibol, Z. Yang, W. Paul, M. I. Jordan, et al. Ray: A distributed framework for emerging {AI} applications. In 13th USENIX symposium on operating systems design and implementation (OSDI 18), pages 561–577, 2018.

OpenAI. Learning to reason with llms, 2024. URL [https://openai.com/index/learning-to-reason-with-llms/](https://openai.com/index/learning-to-reason-with-llms/).

K. Paster, M. D. Santos, Z. Azerbayev, and J. Ba. Openwebmath: An open dataset of high-quality mathematical web text. In The Twelfth International Conference on Learning Representations, ICLR 2024, Vienna, Austria, May 7-11, 2024. OpenReview.net, 2024. URL [https://openreview.net/forum?id=jKHmjlpViu](https://openreview.net/forum?id=jKHmjlpViu).

G. Penedo, Q. Malartic, D. Hesslow, R. Cojocaru, A. Cappelli, H. Alobeidli, B. Pannier, E. Almazrouei, and J. Launay. The refinedweb dataset for falcon llm: outperforming curated corpora with web data, and web data only. ArXiv preprint, abs/2306.01116, 2023. URL [https://arxiv.org/abs/2306.01116](https://arxiv.org/abs/2306.01116).

G. Penedo, H. Kydlícek, L. B. Allal, A. Lozhkov, M. Mitchell, C. A. Raffel, L. von Werra, and T. Wolf. The fineweb datasets: Decanting the web for the finest text data at scale. In A. Globersons, L. Mackey, D. Belgrave, A. Fan, U. Paquet, J. M. Tomczak, and C. Zhang, editors, Advances in Neural Information Processing Systems 38: Annual Conference on Neural Information Processing Systems 2024, NeurIPS 2024, Vancouver, BC, Canada, December 10 - 15, 2024, 2024. URL [http://papers.nips.cc/paper\_files/paper/2024/hash/370df50ccfdf8bde18f8f9c2d9151bda-Abstract-Datasets\_and\_Benchmarks\_Track.html](http://papers.nips.cc/paper_files/paper/2024/hash/370df50ccfdf8bde18f8f9c2d9151bda-Abstract-Datasets_and_Benchmarks_Track.html).

<!-- page 25 of 28 -->

A. Radford, K. Narasimhan, T. Salimans, I. Sutskever, et al. Improving language understanding by generative pre-training. OpenAI, 2018.

D. Rein, B. L. Hou, A. C. Stickland, J. Petty, R. Y. Pang, J. Dirani, J. Michael, and S. R. Bowman. Gpqa: A graduate-level google-proof q&a benchmark. In First Conference on Language Modeling, 2024.

K. Sakaguchi, R. L. Bras, C. Bhagavatula, and Y. Choi. Winogrande: An adversarial winograd schema challenge at scale. In The Thirty-Fourth AAAI Conference on Artificial Intelligence, AAAI 2020, The Thirty-Second Innovative Applications of Artificial Intelligence Conference, IAAI 2020, The Tenth AAAI Symposium on Educational Advances in Artificial Intelligence, EAAI 2020, New York, NY, USA, February 7-12, 2020, pages 8732–8740. AAAI Press, 2020. URL [https://aaai.org/ojs/index.php/AAAI/article/view/6399](https://aaai.org/ojs/index.php/AAAI/article/view/6399).

B. Seed, Y. Yuan, Y. Yue, M. Wang, X. Zuo, J. Chen, L. Yan, W. Xu, C. Zhang, X. Liu, et al. Seed-thinking-v1. 5: Advancing superb reasoning models with reinforcement learning. ArXiv preprint, abs/2504.13914, 2025. URL [https://arxiv.org/abs/2504.13914](https://arxiv.org/abs/2504.13914).

Z. Shao, P. Wang, Q. Zhu, R. Xu, J. Song, X. Bi, H. Zhang, M. Zhang, Y. Li, Y. Wu, et al. Deepseekmath: Pushing the limits of mathematical reasoning in open language models. ArXiv preprint, abs/2402.03300, 2024. URL [https://arxiv.org/abs/2402.03300](https://arxiv.org/abs/2402.03300).

G. Sheng, C. Zhang, Z. Ye, X. Wu, W. Zhang, R. Zhang, Y. Peng, H. Lin, and C. Wu. Hybridflow: A flexible and efficient rlhf framework. ArXiv preprint, abs/2409.19256, 2024. URL [https://arxiv.org/abs/2409.19256](https://arxiv.org/abs/2409.19256).

J. Su, M. Ahmed, Y. Lu, S. Pan, W. Bo, and Y. Liu. Roformer: Enhanced transformer with rotary position embedding. Neurocomputing, 568:127063, 2024.

M. Suzgun, N. Scales, N. Schärli, S. Gehrmann, Y. Tay, H. W. Chung, A. Chowdhery, Q. Le, E. Chi, D. Zhou, and J. Wei. Challenging BIG-bench tasks and whether chain-of-thought can solve them. In A. Rogers, J. Boyd-Graber, and N. Okazaki, editors, Findings of the Association for Computational Linguistics: ACL 2023, pages 13003–13051, Toronto, Canada, 2023. Association for Computational Linguistics. doi: 10.18653/v1/2023.findings-acl.824. URL [https://aclanthology.org/2023.findings-acl.824](https://aclanthology.org/2023.findings-acl.824).

C. Team, Z. Yue, Z. Lin, Y. Song, W. Wang, S. Ren, S. Gu, S. Li, P. Li, L. Zhao, L. Li, K. Bao, H. Tian, H. Zhang, G. Wang, D. Zhu, Cici, C. He, B. Ye, B. Shen, Z. Zhang, Z. Jiang, Z. Zheng, Z. Song, Z. Luo, Y. Yu, Y. Wang, Y. Tian, Y. Tu, Y. Yan, Y. Huang, X. Wang, X. Xu, X. Song, X. Zhang, X. Yong, X. Zhang, X. Deng, W. Yang, W. Ma, W. Lv, W. Zhuang, W. Liu, S. Deng, S. Liu, S. Chen, S. Yu, S. Liu, S. Wang, R. Ma, Q. Wang, P. Wang, N. Chen, M. Zhu, K. Zhou, K. Zhou, K. Fang, J. Shi, J. Dong, J. Xiao, J. Xu, H. Liu, H. Xu, H. Qu, H. Zhao, H. Lv, G. Wang, D. Zhang, D. Zhang, D. Zhang, C. Ma, C. Liu, C. Cai, and B. Xia. Mimo-vl technical report, 2025a. URL [https://arxiv.org/abs/2506.03569](https://arxiv.org/abs/2506.03569).

G. Team. Gemma 2: Improving open language models at a practical size, 2024. URL [https://arxiv.org/abs/2408.00118](https://arxiv.org/abs/2408.00118).

K. Team, A. Du, B. Gao, B. Xing, C. Jiang, C. Chen, C. Li, C. Xiao, C. Du, C. Liao, et al. Kimi k1. 5: Scaling reinforcement learning with llms. ArXiv preprint, abs/2501.12599, 2025b. URL [https://arxiv.org/abs/2501.12599](https://arxiv.org/abs/2501.12599).

<!-- page 26 of 28 -->

H. Touvron, L. Martin, K. Stone, P. Albert, A. Almahairi, Y. Babaei, N. Bashlykov, S. Batra, P. Bhargava, S. Bhosale, et al. Llama 2: Open foundation and fine-tuned chat models. ArXiv preprint, abs/2307.09288, 2023. URL [https://arxiv.org/abs/2307.09288](https://arxiv.org/abs/2307.09288).

A. Vaswani, N. Shazeer, N. Parmar, J. Uszkoreit, L. Jones, A. N. Gomez, L. Kaiser, and I. Polosukhin. Attention is all you need. In I. Guyon, U. von Luxburg, S. Bengio, H. M. Wallach, R. Fergus, S. V. N. Vishwanathan, and R. Garnett, editors, Advances in Neural Information Processing Systems 30: Annual Conference on Neural Information Processing Systems 2017, December 4-9, 2017, Long Beach, CA, USA, pages 5998–6008, 2017. URL [https://proceedings.neurips.cc/paper/2017/hash/3f5ee243547dee91fbd053c1c4a845aa-Abstract.html](https://proceedings.neurips.cc/paper/2017/hash/3f5ee243547dee91fbd053c1c4a845aa-Abstract.html).

Y. Wang, X. Ma, G. Zhang, Y. Ni, A. Chandra, S. Guo, W. Ren, A. Arulraj, X. He, Z. Jiang, T. Li, M. Ku, K. Wang, A. Zhuang, R. Fan, X. Yue, and W. Chen. Mmlu-pro: A more robust and challenging multi-task language understanding benchmark. In A. Globersons, L. Mackey, D. Belgrave, A. Fan, U. Paquet, J. M. Tomczak, and C. Zhang, editors, Advances in Neural Information Processing Systems 38: Annual Conference on Neural Information Processing Systems 2024, NeurIPS 2024, Vancouver, BC, Canada, December 10 - 15, 2024, 2024. URL [http://papers.nips.cc/paper\_files/paper/2024/hash/ad236edc564f3e3156e1b2feafb99a24-Abstract-Datasets\_and\_Benchmarks\_Track.html](http://papers.nips.cc/paper_files/paper/2024/hash/ad236edc564f3e3156e1b2feafb99a24-Abstract-Datasets_and_Benchmarks_Track.html).

H. Xia, T. Ge, P. Wang, S.-Q. Chen, F. Wei, and Z. Sui. Speculative decoding: Exploiting speculative execution for accelerating seq2seq generation. In H. Bouamor, J. Pino, and K. Bali, editors, Findings of the Association for Computational Linguistics: EMNLP 2023, pages 3909–3925, Singapore, 2023. Association for Computational Linguistics. doi: 10.18653/v1/2023.finding s-emnlp.257. URL [https://aclanthology.org/2023.findings-emnlp.257](https://aclanthology.org/2023.findings-emnlp.257).

A. Yang, B. Yang, B. Zhang, B. Hui, B. Zheng, B. Yu, C. Li, D. Liu, F. Huang, H. Wei, et al. Qwen2. 5 technical report. ArXiv preprint, abs/2412.15115, 2024. URL [https://arxiv.org/abs/2412.15115](https://arxiv.org/abs/2412.15115).

Q. Yu, Z. Zhang, R. Zhu, Y. Yuan, X. Zuo, Y. Yue, T. Fan, G. Liu, L. Liu, X. Liu, et al. Dapo: An open-source llm reinforcement learning system at scale. ArXiv preprint, abs/2503.14476, 2025. URL [https://arxiv.org/abs/2503.14476](https://arxiv.org/abs/2503.14476).

Y. Yue, Z. Chen, R. Lu, A. Zhao, Z. Wang, Y. Yue, S. Song, and G. Huang. Does reinforcement learning really incentivize reasoning capacity in llms beyond the base model?, 2025. URL [https://arxiv.org/abs/2504.13837](https://arxiv.org/abs/2504.13837).

R. Zellers, A. Holtzman, Y. Bisk, A. Farhadi, and Y. Choi. HellaSwag: Can a machine really finish your sentence? In A. Korhonen, D. Traum, and L. Màrquez, editors, Proceedings of the 57th Annual Meeting of the Association for Computational Linguistics, pages 4791–4800, Florence, Italy, 2019. Association for Computational Linguistics. doi: 10.18653/v1/P19-1472. URL [https://aclanthology.org/P19-1472](https://aclanthology.org/P19-1472).

B. Zhang and R. Sennrich. Root mean square layer normalization. In H. M. Wallach, H. Larochelle, A. Beygelzimer, F. d’Alché-Buc, E. B. Fox, and R. Garnett, editors, Advances in Neural Information Processing Systems 32: Annual Conference on Neural Information Processing Systems 2019, NeurIPS 2019, December 8-14, 2019, Vancouver, BC, Canada, pages 12360–12371, 2019. URL [https://proceedings.neurips.cc/paper/2019/hash/1e8a19426224ca89e83cef47f1e7f53b-Abstract.html](https://proceedings.neurips.cc/paper/2019/hash/1e8a19426224ca89e83cef47f1e7f53b-Abstract.html).

W. Zhong, R. Cui, Y. Guo, Y. Liang, S. Lu, Y. Wang, A. Saied, W. Chen, and N. Duan. AGIEval: A human-centric benchmark for evaluating foundation models. In K. Duh, H. Gomez, and

<!-- page 27 of 28 -->

S. Bethard, editors, Findings of the Association for Computational Linguistics: NAACL 2024, pages 2299–2314, Mexico City, Mexico, 2024a. Association for Computational Linguistics. URL [https://aclanthology.org/2024.findings-naacl.149](https://aclanthology.org/2024.findings-naacl.149).

Y. Zhong, Z. Zhang, B. Wu, S. Liu, Y. Chen, C. Wan, H. Hu, L. Xia, R. Ming, Y. Zhu, et al. Rlhfuse: Efficient rlhf training for large language models with inter-and intra-stage fusion. ArXiv preprint, abs/2409.13221, 2024b. URL [https://arxiv.org/abs/2409.13221](https://arxiv.org/abs/2409.13221).

F. Zhou, Z. Wang, N. Ranjan, Z. Cheng, L. Tang, G. He, Z. Liu, and E. P. Xing. Megamath: Pushing the limits of open math corpora. ArXiv preprint, abs/2504.02807, 2025. URL [https://arxiv.org/abs/2504.02807](https://arxiv.org/abs/2504.02807).

J. Zhou, T. Lu, S. Mishra, S. Brahma, S. Basu, Y. Luan, D. Zhou, and L. Hou. Instruction-following evaluation for large language models, 2023. URL [https://arxiv.org/abs/2311.07911](https://arxiv.org/abs/2311.07911).

Q. Zhu, D. Guo, Z. Shao, D. Yang, P. Wang, R. Xu, Y. Wu, Y. Li, H. Gao, S. Ma, et al. Deepseekcoder-v2: Breaking the barrier of closed-source models in code intelligence. ArXiv preprint, abs/2406.11931, 2024. URL [https://arxiv.org/abs/2406.11931](https://arxiv.org/abs/2406.11931).

<!-- page 28 of 28 -->

## A Contributions and Acknowledgments

We would like to express our sincere gratitude to all contributors, including those not listed in the paper, for their invaluable support and efforts. Authors within each role are listed alphabetically by their first name.

| Core Contributors | Hongshen Xu |
| --- | --- |
| Bingquan Xia | Jun Shi |
| Bowen Shen | Kainan Bao |
| Cici | Kai Fang |
| Dawei Zhu | Kang Zhou |
| Di Zhang | Kangyang Zhou |
| Gang Wang | Lei Li |
| Hailin Zhang | Menghang Zhu |
| Huaqiu Liu | Nuo Chen |
| Jiebao Xiao | Qiantong Wang |
| Jinhao Dong | Shaohui Liu |
| Liang Zhao | Shicheng Li |
| Peidian Li | Shuhao Gu |
| Peng Wang | Shuhuai Ren |
| Shihua Yu | Shuo Liu |
| Shimao Chen | Sirui Deng |
| Weikun Wang | Weiji Zhuang |
| Wenhan Ma | Weiwei Lv |
| Xiangwei Deng | Wenyu Yang |
| Yi Huang | Xin Zhang |
| Yifan Song | Xing Yong |
| Zihan Jiang | Xing Zhang |
|  | Xingchen Song |
| Contributors | Xinzhe Xu |
| Bowen Ye | Xu Wang |
| Can Cai | Yihan Yan |
| Chenhong He | Yu Tu |
| Dong Zhang | Yuanyuan Tian |
| Duo Zhang | Yudong Wang |
| Guoan Wang | Yue Yu |
| Hao Tian | Zhenru Lin |
| Haochen Zhao | Zhichao Song |
| Heng Qu | Zihao Yue |

28
