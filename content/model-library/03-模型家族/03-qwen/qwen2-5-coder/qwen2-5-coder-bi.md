---
title: "Qwen2.5-Coder · 对照译稿"
category: "模型库"
tags: ["Qwen", "对照译稿"]
published: true
excerpt: "Qwen2.5-Coder 公开材料的逐段中英对照译稿，附读报告时的疑问块。"
---
<!-- page 1 of 32 -->

arXiv:2409.12186v3 [cs.CL] 12 Nov 2024

Technical Report

# Qwen2.5-Coder Technical Report

**Binyuan Hui\* Jian Yang\* Zeyu Cui\* Jiaxi Yang\*** Dayiheng Liu Lei Zhang Tianyu Liu Jiajun Zhang Bowen Yu Keming Lu Kai Dang Yang Fan Yichang Zhang An Yang Rui Men Fei Huang Bo Zheng Yibo Miao Shanghaoran Quan Yunlong Feng Xingzhang Ren Xuancheng Ren Jingren Zhou Junyang Lin† **Qwen Team Alibaba Group**

[https://hf.co/Qwen/Qwen2.5-Coder-32B-Instruct](https://hf.co/Qwen/Qwen2.5-Coder-32B-Instruct) · [https://github.com/QwenLM/Qwen2.5-Coder](https://github.com/QwenLM/Qwen2.5-Coder)

## Abstract

In this report, we introduce the Qwen2.5-Coder series, a significant upgrade from its predecessor, CodeQwen1.5. This series includes six models: Qwen2.5-Coder-(0.5B/1.5B/3B/7B/14B/32B). As a code-specific model, Qwen2.5-Coder is built upon the Qwen2.5 architecture and continues pre-trained on a vast corpus of over 5.5 trillion tokens. Through meticulous data cleaning, scalable synthetic data generation, and balanced data mixing, Qwen2.5-Coder demonstrates impressive code generation capabilities while retaining general and math skills. These models have been evaluated on a wide range of code-related tasks, achieving state-of-the-art (SOTA) performance across more than 10 benchmarks, including code generation, completion, reasoning, and repair, consistently outperforming larger models of the same model size. We believe that the release of the Qwen2.5-Coder series will advance research in code intelligence and, with its permissive licensing, support wider adoption by developers in real-world applications.

本报告推出 Qwen2.5-Coder 系列, 是前代 CodeQwen1.5 的大幅升级. 共六档: Qwen2.5-Coder-(0.5B/1.5B/3B/7B/14B/32B). 作为代码专用模型, 它建在 Qwen2.5 架构上, 在超过 5.5 trillion token 的语料上继续预训练. 经由细致数据清洗, 可扩展的合成数据生成, 以及均衡的数据混合, Qwen2.5-Coder 在代码生成上表现突出, 同时保住通用与数学能力. 模型在广泛代码相关任务上评测, 在超过 10 个基准(含生成, 补全, 推理与修复)上达到 SOTA, 并持续超过同规模更大的对照模型. 作者相信该系列的发布将推进代码智能研究, 且许可宽松, 便于开发者在真实应用中更广泛采用.

Qwen2.5-Coder-32B

![Image block](images/p01-1.png)

<small><span class="docvortex-page-footnote" data-block-type="page_footnote" style="color:#6b7280"><sup>∗</sup>Equal core contribution, <sup>†</sup>Corresponding author</span></small>

<!-- page 2 of 32 -->

Technical Report

## Contents

- 1 Introduction 3
- 2 Model Architecture 3
- 3 Pre-training 4
  - 3.1 Pretraining Data 4
    - 3.1.1 Data Composition 5
    - 3.1.2 Data Mixture 6
  - 3.2 Training Policy 6
    - 3.2.1 File-Level Pretraining 6
    - 3.2.2 Repo-Level Pretraining 7
- 4 Post-training 7
  - 4.1 A Recipe for Instruction Data 7
  - 4.2 Training Policy 9
- 5 Decontamination 9
- 6 Evaluation on Base Models 10
  - 6.1 Code Generation 10
  - 6.2 Code Completion 11
  - 6.3 Code Reasoning 14
  - 6.4 Math Reasoning 15
  - 6.5 General Natural Language 15
  - 6.6 Long-Context Evaluation 16
- 7 Evaluation on Instruct Models 16
  - 7.1 Code Generation 18
  - 7.2 Code Reasoning 22
  - 7.3 Code Editing 23
  - 7.4 Text-to-SQL 25
  - 7.5 Math Reasoning and General Natural Language 27
  - 7.6 Table Understanding 27
- 8 Discussion: Scaling is All You Need 28
- 9 Conclusion 28

<!-- page 3 of 32 -->

Technical Report

## 1 Introduction

With the rapid development of large language models (LLMs) (Brown, 2020; Achiam et al., 2023; Touvron et al., 2023; Dubey et al., 2024; Jiang et al., 2023; Bai et al., 2023; Yang et al., 2024; Anthropic, 2024; OpenAI, 2024), code-specific language models have garnered significant attention in the community. Built upon pre-trained LLMs, code LLMs such as the StarCoder series (Li et al., 2023; Lozhkov et al., 2024), CodeLlama series (Roziere et al., 2023), DeepSeek-Coder series (Guo et al., 2024a), CodeQwen1.5 (Qwen, 2024), and CodeStral (MistralAI, 2024), have demonstrated superior performance in coding evaluations (Chen et al., 2021; Austin et al., 2021; Cassano et al., 2022; Jain et al., 2024; Liu et al., 2024a; Li et al., 2024b; Guo et al., 2024b; Wu et al., 2024b). However, in comparison with the recently state-of-the-art proprietary LLMs, Claude-3.5-Sonnet (Anthropic, 2024) and GPT-4o (OpenAI, 2024), the code LLMs are still falling behind, either open-source or proprietary models.

大语言模型(LLM)快速发展后, 代码专用语言模型在社区获得大量关注. 建在预训练 LLM 之上, StarCoder 系列, CodeLlama 系列, DeepSeek-Coder 系列, CodeQwen1.5 与 CodeStral 等代码 LLM 已在各类编码评测中表现突出. 但与近期 SOTA 专有模型 Claude-3.5-Sonnet 与 GPT-4o 相比, 无论开源还是专有代码 LLM, 仍有差距.

Building upon our previous work, CodeQwen1.5, we are excited to introduce **Qwen2.5-Coder**, a new series of language models designed to achieve top-tier performance in coding tasks at various model sizes. Qwen2.5-Coder models are derived from the Qwen2.5 LLMs, inheriting their advanced architecture and tokenizer. These models are trained on extensive datasets and further fine-tuned on carefully curated instruction datasets specifically designed for coding tasks. We are committed to fostering research and innovation in the field of code LLMs, coding agents, and coding assistant applications. Therefore, we release the **Powerful**, **Diverse**, and **Practical** Qwen2.5-Coder series, dedicated to continuously promoting the development of Open CodeLLMs. (1) **Powerful**: Qwen2.5-Coder-32B-Instruct has become the current SOTA open-source code model, matching the coding capabilities of GPT-4o. While demonstrating strong and comprehensive coding abilities, it also possesses good general and mathematical skills. (2) **Diverse**: Qwen2.5-Coder series brings six model sizes, including 0.5B/1.5B/3B/7B/14B/32B. Qwen2.5-Coder has covered six mainstream model sizes to meet the needs of different developers. (3) **Practical**: We explore the practicality of Qwen2.5-Coder in two scenarios, including code assistants and Artifacts, with some examples showcasing the potential applications of Qwen2.5-Coder in real-world scenarios

承接前作 CodeQwen1.5, 作者推出 **Qwen2.5-Coder**, 目标是在多种规模上把编码任务做到顶档. 模型来自 Qwen2.5 LLM, 继承其架构与分词器; 在大规模数据上训练, 再在面向编码的精选指令数据上微调. 团队希望推动代码 LLM, coding agent 与编码助手应用的研究与创新, 因而发布 **Powerful**, **Diverse**, **Practical** 的 Qwen2.5-Coder 系列, 持续促进 Open CodeLLM 发展. (1) **Powerful**: Qwen2.5-Coder-32B-Instruct 已成为当前 SOTA 开源代码模型, 编码能力对齐 GPT-4o; 在全面编码能力之外, 仍保有不错的通用与数学能力. (2) **Diverse**: 六档规模 0.5B/1.5B/3B/7B/14B/32B, 覆盖主流部署档位. (3) **Practical**: 在代码助手与 Artifacts 两类场景探索实用性, 并给出若干真实应用示例.

Significant efforts have been dedicated to constructing a large-scale, coding-specific pretraining dataset comprising over 5.5 trillion tokens. This dataset is sourced from a broad range of public code repositories, such as those on GitHub, as well as large-scale web-crawled data containing code-related texts. We have implemented sophisticated procedures to recall and clean potential code data and filter out low-quality content using weak model based classifiers and scorers. Our approach encompasses both file-level and repository-level pretraining to ensure comprehensive coverage. To optimize performance and balance coding expertise with general language understanding, we have carefully curated a data mixture that includes code, mathematics, and general texts. To transform models into coding assistants for downstream applications, we have developed a well-designed instruction-tuning dataset. This dataset includes a wide range of coding-related problems and solutions, sourced from real-world applications and synthetic data generated by code-focused LLMs, covering a broad spectrum of coding tasks.

团队投入大量工作, 构造了超过 5.5 trillion token 的大规模代码向预训练数据. 来源包括 GitHub 等公开代码仓库, 以及含代码相关文本的大规模网页抓取. 他们用复杂流程召回与清洗潜在代码数据, 并用基于弱模型的分类器与打分器滤掉低质内容. 训练覆盖文件级与仓库级预训练, 以求覆盖更全. 为兼顾编码专长与通用语言理解, 仔细设计了含代码, 数学与通用文本的数据混合. 为把模型变成下游可用的编码助手, 又构造了精心设计的指令微调数据: 含广泛编码相关问题与解答, 来自真实应用与代码向 LLM 合成数据, 覆盖多种编码任务.

To evaluate the effectiveness of Qwen2.5-Coder, we conducted an extensive evaluation on a suite of popular benchmarks. The results highlight Qwen2.5-Coder's superior code generation capabilities, achieving state-of-the-art performance across more than ten codefocused benchmarks while maintaining robust general and mathematical reasoning abilities. This model outperforms larger code models on a variety of tasks. The release of these models aims to advance code intelligence research and promote widespread adoption in real-world applications, facilitated by permissive licensing.

为评估有效性, 作者在一组流行基准上做了广泛评测. 结果显示 Qwen2.5-Coder 代码生成能力突出, 在超过十个代码向基准上达到 SOTA, 同时保住稳健的通用与数学推理. 该模型在多种任务上超过更大的代码模型. 发布旨在推进代码智能研究, 并在宽松许可下促进真实应用中的广泛采用.

<!-- page 4 of 32 -->

Technical Report

## 2 Model Architecture 模型架构

**Architecture** The architecture of Qwen2.5-Coder is derived directly from Qwen2.5. Table 1 outlines the architecture of Qwen2.5-Coder across six different model sizes: 0.5B, 1.5B, 3B, 7B, 14B, and 32B parameters. While all sizes share the same architecture in terms of head size, they differ in several other key aspects. With exceptions like the 1.5B model having a larger intermediate size and the 3B model having more layers, most parameters generally

**架构** Qwen2.5-Coder 的结构直接承自 Qwen2.5. Table 1 列出六档规模: 0.5B, 1.5B, 3B, 7B, 14B, 32B. 各档 head size 相同, 其余关键量随规模变. 例外包括 1.5B 的 intermediate size 偏大, 以及 3B 层数更多; 多数参数大体

<!-- page 5 of 32 -->

Technical Report

increase as the model size scales up. Comparing the 7B and 32B models for instance: the 7B model features a hidden size of 3,584, whereas the 32B model has a hidden size of 5,120. The 7B model uses 28 query heads and 4 key-value heads, while the 32B model uses 40 query heads and 8 key-value heads, reflecting its enhanced capacity. Similarly, the intermediate size scales with model size, being 18,944 for the 7B model and 27,648 for the 32B model. Additionally, smaller models use embedding tying, while larger models do not. Both models have a vocabulary size of 151,646 tokens and are trained on 5.5 trillion tokens.

随规模增大. 以 7B 与 32B 为例: hidden size 分别是 3,584 与 5,120; query 头 28 vs 40, KV 头 4 vs 8. intermediate size 为 18,944 vs 27,648. 小模型做 embedding tying, 大模型不做. 词表一律 151,646, 训练 token 一律 5.5T.

> **想:** 14B 与 32B 的 hidden size 都是 5120, 差在哪?
> Table 1: 层数 48 vs 64, intermediate 13824 vs 27648, KV 头同为 8. 宽度打平后靠加深与加宽 FFN 把 14B 拉到 32B.


> **问:** 1.5B 的 intermediate size 为什么比 3B 还大?
> Table 1 写明 1.5B 是 8,960, 3B 只有 4,864; 文中也点了这个例外, 不是排版错误.


**Tokenization** Qwen2.5-Coder inherits the vocabulary from Qwen2.5 but introduces several special tokens to help the model better understand code. Table 2 presents an overview of the special tokens added during training to better capture different forms of code data. These tokens serve specific purposes in the code-processing pipeline. For instance, <|endoftext|> marks the end of a text or sequence, while the <|fim\_prefix|>, <|fim\_middle|>, and <|fim\_suffix|> tokens are used to implement the Fill-in-the-Middle (FIM) (Bavarian et al., 2022) technique, where a model predicts the missing parts of a code block. Additionally, <|fim\_pad|> is used for padding during FIM operations. Other tokens include <|repo\_name|>, which identifies repository names, and <|file\_sep|>, used as a file separator to better manage repository-level information. These tokens are essential in helping the model learn from diverse code structures and enable it to handle longer and more complex contexts during both file-level and repo-level pretraining.

**分词** 词表承自 Qwen2.5, 另加一批代码专用特殊 token, 见表 2. `<|endoftext|>` 标序列结束; `<|fim_prefix|>`, `<|fim_middle|>`, `<|fim_suffix|>` 支撑 FIM (Bavarian et al., 2022), 让模型补代码中间缺失段; `<|fim_pad|>` 做 FIM padding; `<|repo_name|>` 标仓库名, `<|file_sep|>` 做文件分隔, 方便仓库级上下文. 文件级与仓库级预训练都靠它们组织结构.

| Configuration | 0.5B | 1.5B | 3B | 7B | 14B | 32B |
| --- | --- | --- | --- | --- | --- | --- |
| Hidden Size | 896 | 1,536 | 2048 | 3,584 | 5120 | 5120 |
| # Layers | 24 | 28 | 36 | 28 | 48 | 64 |
| # Query Heads | 14 | 12 | 16 | 28 | 40 | 40 |
| # KV Heads | 2 | 2 | 2 | 4 | 8 | 8 |
| Head Size | 128 | 128 | 128 | 128 | 128 | 128 |
| Intermediate Size | 4,864 | 8,960 | 4,864 | 18,944 | 13824 | 27648 |
| Embedding Tying | ! | ! | ! | % | % | % |
| Vocabulary Size | 151,646 | 151,646 | 151,646 | 151,646 | 151,646 | 151,646 |
| # Trained Tokens | 5.5T | 5.5T | 5.5T | 5.5T | 5.5T | 5.5T |

Table 1: Architecture of Qwen2.5-Coder.

表 1:Qwen2.5-Coder 架构一览.

| Token | Token ID | Description |
| --- | --- | --- |
| &lt;\|endoftext\|&gt; | 151643 | end of text/sequence |
| &lt;\|fim_prefix\|&gt; | 151659 | FIM prefix |
| &lt;\|fim_middle\|&gt; | 151660 | FIM middle |
| &lt;\|fim_suffix\|&gt; | 151661 | FIM suffix |
| &lt;\|fim_pad\|&gt; | 151662 | FIM pad |
| &lt;\|repo_name\|&gt; | 151663 | repository name |
| &lt;\|file_sep\|&gt; | 151664 | file separator |

Table 2: Overview of the special tokens.

表 2:特殊 token 一览.

## 3 Pre-training 预训练

### 3.1 Pretraining Data 预训练数据

Large-scale, high-quality, and diverse data forms the foundation of pre-trained models. To this end, we constructed a dataset named Qwen2.5-Coder-Data. This dataset comprises five key data types: Source Code Data, Text-Code Grounding Data, Synthetic Data, Math Data and Text Data. In this section, we provide a brief overview of the sources and cleaning methods applied to these datasets.

大规模, 高质量, 多样的数据是预训练底座. 作者构造了 Qwen2.5-Coder-Data, 含五类: 源码, Text-Code Grounding, 合成数据, 数学数据, 通用文本. 下文简述来源与清洗.

<!-- page 6 of 32 -->

Technical Report

#### 3.1.1 Data Composition 数据构成

**Source Code** We collected public repositories from GitHub created before February 2024, spanning 92 programming languages. Similar to StarCoder2 (Lozhkov et al., 2024) and DS-Coder (Guo et al., 2024a), we applied a series of rule-based filtering methods. In addition to raw code, we also collected data from Pull Requests, Commits, Jupyter Notebooks, and Kaggle datasets, all of which were subjected to similar rule-based cleaning techniques.

**源码** 取 GitHub 上 2024 年 2 月前创建的公开仓库, 覆盖 92 种语言. 规则过滤对齐 StarCoder2 与 DS-Coder. 除生代码外, 还收 Pull Request, Commit, Jupyter Notebook, Kaggle 数据, 同样走规则清洗.

![Chart block](images/p05-figure-1-number-of-data-tokens-across-different-cc.png)

Figure 1: Number of data tokens across different cc-stages, and the validation effectiveness1 of training Qwen2.5-Coder using corresponding data.

图 1｜不同 cc-stage 的数据 token 量, 以及用对应数据训 Qwen2.5-Coder 的验证效果.

**Text-Code Grounding Data** We curated a large-scale and high-quality text-code mixed dataset from Common Crawl, which includes code-related documentation, tutorials, blogs, and more. Instead of the conventional URL-based multi-stage recall method, we developed a coarse-to-fine hierarchical filtering approach for raw data. This method offers two key advantages:

**Text-Code Grounding 数据** 从 Common Crawl 整理大规模文本-代码混合集, 含文档, 教程, 博客等. 不用传统按 URL 多级召回, 而做粗到细的层级过滤, 两点好处:

1. It enables precise control over each filter's responsibility, ensuring comprehensive handling of each dimension.

1. 每级过滤器职责可精确控制, 维度覆盖更全.

2. It naturally assigns quality scores to the dataset, with data retained in the final stage being of higher quality, providing valuable insights for quality-driven data mixing.

2. 自然给出质量分层: 留到最后一级的质量更高, 便于按质量做混合.

We designed a cleaning pipeline for the Text-Code Grounding Data, where each filter level is built using smaller models, such as fastText. Although we experimented with larger models, they did not yield significant benefits. A likely explanation is that smaller models focus more on surface-level features, avoiding unnecessary semantic complexity.

清洗流水线每级用较小模型(如 fastText). 试过更大模型并无明显收益; 作者猜测小模型更盯表层特征, 少卷进多余语义复杂度.

In Qwen2.5-Coder, we applied this process iteratively. As shown in Figure 1, each iteration resulted in improvement for Qwen2.5-Coder-1.5B. Through 4-stage filtering, the average scores on HumanEval and MBPP increased from 41.6% to 46.8% compared to the baseline, demonstrating the value of high-quality Text-Code Grounding Data for code generation.

该流程迭代使用. Figure 1 显示每次迭代都抬了 Qwen2.5-Coder-1.5B. 四级过滤后, HumanEval 与 MBPP 平均分相对基线从 41.6% 提到 46.8%, 说明高质量 Text-Code Grounding 对代码生成有用.

> **核对:** 41.6%→46.8% 是绝对分还是相对提升?
> 正文写 average scores ... increased from 41.6% to 46.8% compared to the baseline, 是分数本身从 41.6 到 46.8, 不是相对涨 46.8%.


> **看表:** fastText 这种「小」分类器, 怎么反而比大模型更合适?
> 作者的解释是: 清洗要的是表层质量信号, 大模型容易被语义带偏; 小模型更贴过滤目标.


**Synthetic Data** Synthetic data offers a promising way to address the anticipated scarcity of training data. We used CodeQwen1.5, the predecessor of Qwen2.5-Coder, to generate large-scale synthetic datasets. To mitigate the risk of hallucinations during this process, we introduced an executor for validation, ensuring that only executable code was retained.

**合成数据** 用来缓解训练数据将短缺的问题. 用前代 CodeQwen1.5 生成大规模合成集; 为压幻觉, 加执行器校验, 只留可执行代码.

**Math Data** To enhance the mathematical capabilities of Qwen2.5-Coder, we integrated the pre-training corpus from Qwen2.5-Math into the Qwen2.5-Coder dataset. Importantly, the inclusion of mathematical data did not negatively impact the model's performance on code tasks. For further details on the collection and cleaning process, please refer to the Qwen2.5-Math technical report.

**数学数据** 并入 Qwen2.5-Math 的预训练语料以抬数学能力; 文中强调这不伤代码任务. 收集与清洗细节见 Qwen2.5-Math 技术报告.

<!-- page 7 of 32 -->

Technical Report

**Text Data** Similar to the Math Data, we included high-quality general natural language data from the pre-training corpus of the Qwen2.5 model to preserve Qwen2.5-Coder's general capabilities. This data had already passed stringent quality checks during the cleaning phase of Qwen2.5's dataset, so no further processing was applied. However, all code segments were removed from the general Text data to avoid overlap with our code data, ensuring the independence of different data sources.

**文本数据** 同样从 Qwen2.5 预训练语料抽高质量通用自然语言, 保住通用能力. 这批已在 Qwen2.5 清洗阶段过严检, 不再二次处理; 但会去掉其中全部代码段, 避免与代码数据重叠, 保持源独立.

#### 3.1.2 Data Mixture 数据配比

Balancing Code, Math, and Text data is crucial for building a foundational model. Although the research community has explored this balance before, there is limited evidence regarding its scalability to large datasets. To address this, we conducted empirical experiments with different ratios of Code, Math, and Text data, designing multiple experiments to identify an optimal combination rapidly. Specifically, as shown in Table 3, we compared three different Code for Qwen2.5-Coder-7B: Text ratios — 100:0:0, 85:10:5, and 70:20:10.

Code / Math / Text 的平衡是底座关键. 社区讨论过, 但大语料上证据仍少. 作者在 Qwen2.5-Coder-7B 上试了三档配比(Table 3): 100:0:0, 85:10:5(文中写作 Code:Text 叙述略乱, 表头对应 Code/Text/Math), 70:20:10.

Interestingly, we found that the 7:2:1 ratio outperformed the others, even surpassing the performance of groups with a higher proportion of code. A possible explanation is that Math and Text data may positively contribute to code performance, but only when their concentration reaches a specific threshold. In future work, we plan to explore more efficient ratio mechanisms and investigate the underlying causes of this phenomenon. Ultimately, we selected a final mixture of 70% Code, 20% Text, and 10% Math. The final training dataset comprises 5.2 trillion tokens.

有意思的是 7:2:1 反而最好, 甚至超过代码占比更高的组. 作者猜测 Math 与 Text 要到一定浓度才正反馈代码. 最终定 70% Code, 20% Text, 10% Math, 合计 5.2T token.

> **拆开:** 5.5T 训练 token 和 5.2T 数据集是不是一回事?
> Table 1 写各档 # Trained Tokens 都是 5.5T; 3.1.2 写最终训练集 5.2T. 前者更像总训练量(可能含重复/后续阶段), 后者是配比后的主料规模; 两数并存, 不要混成一个.


> **确认:** 纯代码 100% 不是应该代码分最高吗?
> Table 3 里 100:0:0 的 Coding Common 49.8 略高于 70:20:10 的 48.3, 但 MATH/GSM8K/MMLU 等塌得很厉害, 平均分只有 31.3 vs 55.0. 「最好」指的是综合平均, 不是单一代码列.


| To Code | ken Ra Text | tio Math | Coding Common | BCB | M MATH | athGSM8K | MMLU | General CEval | HellaSwag | Average |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 100 | 0 | 0 | 49.8 | 40.3 | 10.3 | 23.8 | 42.8 | 35.9 | 58.3 | 31.3 |
| 85 | 15 | 5 | 43.3 | 36.2 | 26.1 | 52.5 | 56.8 | 57.1 | 70.0 | 48.9 |
| 70 | 20 | 10 | 48.3 | 38.3 | 33.2 | 64.5 | 62.9 | 64.0 | 73.5 | 55.0 |

Table 3: The performance of Qwen2.5-Coder training on different data mixture policy.

表 3:不同数据配比下的表现(表头 OCR 略乱, 数字以源文为准).

### 3.2 Training Policy 训练策略

![Image block](images/p06-figure-2-the-three-stage-training-pipeline-for-qwen2-5.png)

Figure 2: The three-stage training pipeline for Qwen2.5-Coder.

图 2｜Qwen2.5-Coder 三阶段训练流水线.

As shown in 2, we employed a three-stage training approach to train Qwen2.5-Coder, including file-level pretraining, repo-level pretraining, and instruction tuning.

如图 2, 三阶段: 文件级预训练, 仓库级预训练, 指令微调.

#### 3.2.1 File-Level Pretraining 文件级预训练

File-level pretraining focuses on learning from individual code files. In this stage, the maximum training sequence length is set to 8,192 tokens, covering 5.2T of high-quality data. The training objectives include next token prediction and fill-in-the-middle (FIM) (Bavarian et al., 2022). The specific FIM format is shown in Figure 3.

文件级以单文件为样本. 最大序列长 8,192, 覆盖 5.2T 高质量数据. 目标含 next-token prediction 与 FIM (Bavarian et al., 2022), 格式见图 3.

![Image block](images/p06-figure-3-file-level-fim-format.png)

Figure 3: File-Level FIM format.

图 3｜文件级 FIM 格式.

<!-- page 8 of 32 -->

Technical Report

#### 3.2.2 Repo-Level Pretraining 仓库级预训练

After file-level pretraining, we turn to repo-level pretraining, aimed at enhancing the model's long-context capabilities. In this stage, the context length is extended from 8,192 tokens to 32,768 tokens, and RoPE's base frequency is adjusted from 10,000 to 1,000,000. To further leverage the model's extrapolation potential, we applied the YARN mechanism (Peng et al., 2023), enabling the model to handle sequences up to 131,072 (128K) tokens.

文件级之后做仓库级, 专攻长上下文. 上下文从 8,192 拉到 32,768, RoPE base 从 10,000 调到 1,000,000. 再叠 YaRN (Peng et al., 2023), 使序列可到 131,072 (128K) token.

In this stage, we used a large amount of high-quality, long-context code data (≈ 300B) and extended file-level FIM to the repo-level FIM followed by methods described in Lozhkov et al. (2024), with the specific format shown in Figure 4.

本阶段用约 300B 高质量长上下文代码, 并把文件级 FIM 扩展到仓库级 FIM(对齐 Lozhkov et al., 2024), 格式见图 4.

![Image block](images/p07-figure-4-repo-level-fim-format.png)

Figure 4: Repo-Level FIM format.

图 4｜仓库级 FIM 格式.

## 4 Post-training 后训练

### 4.1 A Recipe for Instruction Data 指令数据配方

**Multilingual Programming Code Identification** We fine-tune a CodeBERT (Feng et al., 2020) to perform the language identification model to categorize documents into nearly 100 programming languages. We keep the instruction data of the mainstream programming languages and randomly discard a portion of the instruction data of the long-tail languages. If a given sample contains very little code data or even no code snippets, the sample will possibly be classified into "No Programming Language" tag. Since too many instruction samples without code snippets hurt the model performance on code generation tasks (e.g. MultiPL-E, McEval, and MdEval), we remove most of the samples without code snippets to keep the code generation capability of our instruction model.

**多语言代码识别** 微调 CodeBERT (Feng et al., 2020) 做近 100 种语言识别. 主流语言指令保留, 长尾语言随机丢掉一部分. 几乎无代码的样本可能标成 「No Programming Language」; 这类样本太多会伤 MultiPL-E, McEval, MdEval 等生成指标, 因此大部分去掉.

**Instruction Synthesis from GitHub** For the unsupervised data (code snippets) massively existing in many websites (e.g. GitHub), we try to construct the supervised instruction dataset using LLM. Specifically, we use the LLM to generate the instruction from the code snippets within 1024 tokens and then we use the code LLM to generate the response (Wei et al., 2024; Sun et al., 2024; Yu et al., 2024). Finally, we use the LLM scorer to filter the low-quality ones to obtain the final pair. Given the code snippets of different programming languages, we construct an instruction dataset from the code snippets. To fully unleash the potential of our proposed method, we also include the open-source instruction dataset (e.g. McEval-Instruct for massively multilingual code generation and debugging<sup>1</sup>) in the seed instruction dataset. Finally, we combine the instruction data from the GitHub code snippet and open-source instructions for supervised fine-tuning.

**从 GitHub 合成指令** 对网上大量无监督代码片段, 用 LLM 造监督对: 先从 ≤1024 token 的片段生成指令, 再用代码 LLM 生成回复, 最后用 LLM scorer 滤低质. 种子集还并入开源指令(如 McEval-Instruct). 最终 GitHub 合成与开源指令合并做 SFT.

**Multilingual Code Instruction Data** To bridge the gap among different programming languages, we propose a multilingual multi-agent collaborative framework to synthesize the multilingual instruction corpora. We introduce language-specific agents, where a set of

**多语言代码指令** 为弥合语言间差距, 提出多语言多智能体协同框架合成语料. 引入语言专用 agent, 其中一组

<small><span class="docvortex-page-footnote" data-block-type="page_footnote" style="color:#6b7280"><sup>1</sup>[https://huggingface.co/datasets/Multilingual-Multimodal-NLP/McEval-Instruct](https://huggingface.co/datasets/Multilingual-Multimodal-NLP/McEval-Instruct)</span></small>

<!-- page 9 of 32 -->

Technical Report

specialized agents are created and each dedicated to a particular programming language. These agents are initialized with language-specific instruction data derived from the limited existing multilingual instruction corpora. The multilingual data generation process can be split into: (1) Language-Specific Intelligent Agents: We create a set of specialized agents, each dedicated to a particular programming language. These agents are initialized with language-specific instruction data derived from curated code snippets. (2) Collaborative Discussion Protocol: Multiple language-specific agents engage in a structured dialogue to formulate new instructions and solutions. This process can result in either enhancing existing language capabilities or generating instructions for a novel programming language. (3) Adaptive Memory System: Each agent maintains a dynamic memory bank that stores its generation history to avoid generating the similar samples. (4) Cross-Lingual Discussion: We implement a novel knowledge distillation technique that allows agents to share insights and patterns across language boundaries, fostering a more comprehensive understanding of programming concepts. (5) Synergy Evaluation Metric: We develop a new metric to quantify the degree of knowledge sharing and synergy between different programming languages within the model. (6) Adaptive Instruction Generation: The framework includes a mechanism to dynamically generate new instructions based on identified knowledge gaps across languages.

专用 agent, 每语言一个, 用有限多语言指令语料初始化. 生成流程拆成六步: (1) 语言专用智能体; (2) 协同讨论协议, 可增强已有语言或造新语言指令; (3) 自适应记忆库, 避重复; (4) 跨语言讨论与知识蒸馏; (5) 协同度量; (6) 按跨语言知识缺口自适应生成新指令.

**Checklist-based Scoring for Instruction Data** To completely evaluate the quality of the created instruction pair, we introduce several scoring points for each sample: (1) Question&Answer Consistency: Whether Q&A are consistent and correct for fine-tuning. (2) Question&Answer Relevance: Whether Q&A are related to the computer field. (3) Question&Answer Difficulty: Whether Q&A are sufficiently challenging. (4) Code Exist: Whether the code is provided in question or answer. (5) Code Correctness: Evaluate whether the provided code is free from syntax errors and logical flaws. (6) Consider factors like proper variable naming, code indentation, and adherence to best practices. (7) Code Clarity: Assess how clear and understandable the code is. Evaluate if it uses meaningful variable names, proper comments, and follows a consistent coding style. (8) Code Comments: Evaluate the presence of comments and their usefulness in explaining the code's functionality. (9) Easy to Learn: determine its educational value for a student whose goal is to learn basic coding concepts. After gaining all scores $\left( s _ { 1 } , \cdots , s _ { n } \right)$ , we can get the final score with $s = w _ { 1 } s _ { 1 } + \cdot \cdot \cdot + w _ { n } s _ { n } ,$ where $\left( w _ { 1 } , \cdots , w _ { n } \right)$ are a series of pre-defined weights.

**清单式打分** 对每条指令对打多维分: (1) 问答一致性; (2) 是否与计算机相关; (3) 难度; (4) 是否含代码; (5) 代码正确性; (6) 命名/缩进/最佳实践; (7) 清晰度; (8) 注释; (9) 易学性. 总分 $s = w_1 s_1 + \cdots + w_n s_n$, 权重预定义.

**A multilingual sandbox for code verification** To further verify the correctness of the code syntax, we use the code static checking for all extracted code snippets of programming languages (e.g. Python, Java, and C++). We parse the code snippet into the abstract syntax tree and filter out the code snippet, where the parsed nodes in code snippet have parsing errors. We create a multilingual sandbox to support the code static checking for the main programming language. Further, the multilingual sandbox is a comprehensive platform designed to validate code snippets across multiple programming languages. It automates the process of generating relevant unit tests based on language-specific samples and evaluates whether the provided code snippets can successfully pass these tests. Especially, only the self-contained (e.g. algorithm problems) code snippet will be fed into the multilingual sandbox. The multilingual verification sandbox is mainly comprised of five parts:

**多语言沙箱** 对抽取代码做静态检查: 解析 AST, 有解析错误的丢掉. 沙箱覆盖主流语言, 可按语言样本自动生成单测并验证能否通过; 只喂自包含片段(如算法题). 沙箱五块:

1. Language Support Module

• Implements support for multiple languages (e.g., Python, Java, C++, JavaScript)

• Maintains language-specific parsing and execution environments

• Handles syntax and semantic analysis for each supported language

1. 语言支持模块: 多语言解析与执行环境, 处理句法与语义.

2. Sample Code Repository

• Stores a diverse collection of code samples for each supported language

• Organizes samples by language, difficulty level, and programming concepts

• Regularly updated and curated by language experts

2. 样例代码库: 按语言, 难度, 概念组织, 专家维护.

3. Unit Test Generator

• Analyzes sample code to identify key functionalities and edge cases

• Automatically generates unit tests based on the expected behavior

• Produces test cases covering various input scenarios and expected outputs

3. 单测生成器: 抓关键功能与边界, 自动出测例.

<!-- page 10 of 32 -->

Technical Report

4. Code Execution Engine

• Provides isolated environments for executing code snippets securely

• Supports parallel execution of multiple test cases

• Handles resource allocation and timeout mechanisms

4. 代码执行引擎: 隔离执行, 并行测例, 资源与超时.

5. Result Analyzer

• Compares the output of code snippets against expected results from unit tests

• Generates detailed reports on test case successes and failures

• Provides suggestions for improvements based on failed test cases

5. 结果分析器: 对照期望输出, 出成败报告与改进建议.

### 4.2 Training Policy 训练策略

**Coarse-to-fine Fine-tuning** We first synthesized tens of millions of low-quality but diverse instruction samples to fine-tune the base model. In the second stage, we adopt millions of high-quality instruction samples to improve the performance of the instruction model with rejection sampling and supervised fine-tuning. For the same query, we use the LLM to generate multiple candidates and then use the LLM to score the best one for supervised fine-tuning.

**由粗到细微调** 先用数千万低质但多样的指令微调 base; 第二阶段用数百万高质量样本, 结合拒采样与 SFT. 同 query 多候选, LLM 打分取最优再 SFT.

> **停一下:** 第一阶段「低质」数据不会把模型带坏吗?
> 作者的顺序是先拓覆盖, 再靠第二阶段高质量 + 拒采样把能力拉回来; 不是只用低质收工.


**Mixed Tuning** Since most instruction data have a short length, we construct the instruction pair with the FIM format to keep the long context capability of the base model. Inspired by programming language syntax rules and user habits in practical scenarios, we leverage the tree-sitter-languages2to parse the code snippets and extract the basic logic blocks as the middle code to infill. For example, the abstract syntax tree (AST) represents the structure of Python code in a tree format, where each node in the tree represents a construct occurring in the source code. The tree's hierarchical nature reflects the syntactic nesting of constructs in the code and includes various elements such as expressions, statements, and functions. By traversing and manipulating the AST, we can randomly extract the nodes of multiple levels and use the code context of the same file to uncover the masked node. Finally, we optimize the instruction model with a majority of standard SFT data and a small part of FIM instruction samples.

**混合微调** 多数指令偏短, 于是构造 FIM 格式指令对, 保住 base 的长上下文. 用 tree-sitter-languages 解析, 抽基本逻辑块作 middle 去填. 以 Python AST 为例, 可随机抽多层节点, 用同文件上下文还原被掩节点. 最终以大量标准 SFT + 少量 FIM 指令优化.

**Direct Preference Optimization for Code** After obtaining the SFT model, we further align the Qwen2.5-Coder with the help of offline direct preference optimization (DPO) (Rafailov et al., 2023). Given that human feedback is highly labor-intensive, we use a multilingual code sandbox to provide code execution feedback, while an LLM is utilized for human judgment feedback. For the algorithm-like and self-contained code snippets, we generate the test cases to check the correctness of the code as the code execution feedback, including Python, Java, and other languages. For other complex code snippets, we use LLM-as-ajudge (Zheng et al., 2023) to decide which code snippet is better. Further, we combine the code DPO data and common data for offline DPO training.

**面向代码的 DPO** SFT 之后做离线 DPO (Rafailov et al., 2023). 人力反馈贵, 故用多语言沙箱给执行反馈, 用 LLM 模拟人判. 算法类自包含片段生成测例验对错; 复杂片段用 LLM-as-a-judge. 代码 DPO 与通用数据合并做离线 DPO.

## 5 Decontamination 去污染

To ensure that Qwen2.5-Coder does not produce inflated results due to test set leakage, we performed decontamination on all data, including both pre-training and post-training datasets. We removed key datasets such as HumanEval, MBPP, GSM8K, and MATH. The filtering was done using a 10-gram overlap method, where any training data with a 10-gram word-level overlap with the test data was removed.

为防测试泄漏抬分, 预训练与后训练数据都做去污染. 剔除 HumanEval, MBPP, GSM8K, MATH 等关键集; 用 10-gram 词级重叠过滤, 有重叠即删.

> **对一下:** 只去这四个测试集够吗?
> 正文写 key datasets such as ..., 点名四套; 是否覆盖 MultiPL-E / LiveCodeBench 等没有写明. 能确认的是这四套走了 10-gram.


<small><span class="docvortex-page-footnote" data-block-type="page_footnote" style="color:#6b7280"><sup>2</sup>[https://pypi.org/project/tree-sitter-languages/](https://pypi.org/project/tree-sitter-languages/)</span></small>

<!-- page 11 of 32 -->

Technical Report

## 6 Evaluation on Base Models Base 模型评测

For the base model, we conducted a comprehensive and fair evaluation in six key aspects, including code generation, code completion, code reasoning, mathematical reasoning, general natural language understanding and long-context modeling. To ensure the reproducibility of all results, we made all evaluation codes publicly available<sup>3</sup>. For comparing models, we chose the most popular and powerful open source language models, including the StarCoder2 and DeepSeek-Coder series. Below is the list of artifacts used in the evaluation for this section.

Base 侧从六面评: 代码生成, 补全, 推理, 数学, 通用自然语言, 长上下文. 评测代码公开. 对照含 StarCoder2 与 DeepSeek-Coder 系列. 本节产物链接如下.

| Artifact | Public link |
| --- | --- |
| Qwen2.5-Coder-0.5B | https://hf.co/Qwen/Qwen2.5-Coder-0.5B |
| Qwen2.5-Coder-1.5B | https://hf.co/Qwen/Qwen2.5-Coder-1.5B |
| Qwen2.5-Coder-3B | https://hf.co/Qwen/Qwen2.5-Coder-3B |
| Qwen2.5-Coder-7B | https://hf.co/Qwen/Qwen2.5-Coder-7B |
| Qwen2.5-Coder-14B | https://hf.co/Qwen/Qwen2.5-Coder-14B |
| Qwen2.5-Coder-32B | https://hf.co/Qwen/Qwen2.5-Coder-32B |
| CodeQwen1.5-7B | https://hf.co/Qwen/CodeQwen1.5-7B |
| StarCoder2-3B | https://hf.co/bigcode/starcoder2-3b |
| StarCoder2-7B | https://hf.co/bigcode/starcoder2-7b |
| StarCoder2-15B | https://hf.co/bigcode/starcoder2-15b |
| DS-Coder-1.3B-Base | https://hf.co/deepseek-ai/deepseek-coder-1.3b-base |
| DS-Coder-6.7B-Base | https://hf.co/deepseek-ai/deepseek-coder-6.7b-base |
| DS-Coder-33B-Base | https://hf.co/deepseek-ai/deepseek-coder-33b-base |
| DS-Coder-V2-Lite-Base | https://hf.co/deepseek-ai/DeepSeek-Coder-V2-Lite-Base |
| DS-Coder-V2-Base | https://hf.co/deepseek-ai/DeepSeek-Coder-V2-Base |

Table 4: All artifacts released and used in this section.

表 4:本节用到的模型产物.

### 6.1 Code Generation 代码生成

**HumanEval and MBPP** Code generation serves as a fundamental capability for code models to handle more complex tasks. We selected two popular code generation benchmarks to evaluate Qwen2.5-Coder, namely HumanEval (Chen et al., 2021) and MBPP (Austin et al., 2021). HumanEval consists of 164 manually written programming tasks, each providing a Python function signature and a docstring as input to the model. MBPP, on the other hand, comprises 974 programming problems created by crowdsource contributors. Each problem includes a problem statement (i.e., a docstring), a function signature, and three test cases.

**HumanEval 与 MBPP** 代码生成是更复杂任务的底座能力. HumanEval 含 164 道手写题; MBPP 含 974 道众包题, 每题有题面, 签名与三个测例.

To further ensure accurate evaluation, EvalPlus (Liu et al., 2023) extends HumanEval into HumanEval+ by adding 80 times more unique test cases and correcting inaccurate groundtruth solutions in HumanEval. Similarly, MBPP+ offers 35 times more test cases than the original MBPP.

EvalPlus 把 HumanEval 扩成 HumanEval+(测例约 80×, 并修正错误 ground truth); MBPP+ 测例约 35×.

Additionally, we should notice that MBPP 3-shot is particularly suitable for monitoring model convergence during training. Early in the convergence process, the model tends to be unstable, causing significant fluctuation in metrics, and simple 3-shot examples effectively mitigate it. Therefore, we also report the results of MBPP 3-shot performance.

另: MBPP 3-shot 特别适合盯训练收敛——早期指标抖得厉害, 简单 3-shot 能稳住. 故也报 MBPP 3-shot.

As shown in Table 5, Qwen2.5-Coder have shown impressive performance in basic code generation, achieving state-of-the-art results among open-source models of the same size and surpassing even larger models. In particular, Qwen2.5-Coder-7B outperforms the previous best dense model, DS-Coder-33B, across all five metrics.

Table 5 显示同规模开源里领先, 甚至超过更大模型. 尤其 Qwen2.5-Coder-7B 在五项指标上全面超过此前最强 dense 的 DS-Coder-33B.

> **想:** 7B 真能五项都压过 33B?
> Table 5: HE 61.6 vs 54.9, HE+ 53.0 vs 47.6, MBPP 76.9 vs 74.2, MBPP+ 62.9 vs 60.7, 3-shot 68.8 vs 66.0. 数字对得上.


**BigCodeBench-Complete** BigCodeBench (Zhuo et al., 2024) is a recent and more challenging benchmark for code generation, primarily aimed at evaluating the ability of tool-use and complex instruction following. The base model generates the expected code through a

BigCodeBench-Complete 更难, 侧重工具使用与复杂指令遵循. base 以补全模式, 给定签名与文档生成代码.

<small><span class="docvortex-page-footnote" data-block-type="page_footnote" style="color:#6b7280"><sup>3</sup>[https://github.com/QwenLM/Qwen2.5-Coder](https://github.com/QwenLM/Qwen2.5-Coder)</span></small>

<!-- page 12 of 32 -->

Technical Report

completion mode, given a function signature and documentation, which is referred to as BigCodeBench-Complete. It consists of two subsets: the full set and the hard set. Compared to HumanEval and MBPP, BigCodeBench is suited for out-of-distribution (OOD) evaluation.

Table 5 illustrates that Qwen2.5-Coder continues to show strong performance on BigCodeBench-Complete, underscoring the model's generalization potential.

Table 5 显示 BigCodeBench-Complete 上依然强, 泛化可观. 含 Full 与 Hard 两子集, 相对 HumanEval/MBPP 更偏 OOD.

**Multi-Programming Language** The evaluations mentioned above focus on the Python language. However, we expect a strong code model to be not only proficient in Python but also versatile across multiple programming languages to meet the complex and evolving demands of software development. To more comprehensively evaluate Qwen2.5-Coder's proficiency in handling multiple programming languages, we selected the MultiPL-E (Cassano et al., 2022) and chose to evaluate eight mainstream languages from this benchmark, including Python, C++, Java, PHP, TypeScript, C#, Bash and JavaScript.

As shown in the table 6, Qwen2.5-Coder also achieved state-of-the-art results in the multi-programming language evaluation, with its capabilities well-balanced across various languages. It scored over 60% in five out of the eight languages.

**多语言** 上面偏 Python; MultiPL-E 评八种主流语言. Table 6 同样 SOTA, 八种里有五种超过 60%.

<table><tr><td rowspan="2">Model</td><td rowspan="2">Size</td><td colspan="2">HumanEval</td><td rowspan="2">MBPP</td><td rowspan="2">MBPP+</td><td rowspan="2">3-shot</td><td colspan="2">BigCodeBench</td></tr><tr><td>HE</td><td>HE+</td><td>Full</td><td>Hard</td></tr><tr><td colspan="9">0.5B+ Models</td></tr><tr><td>Qwen2.5-Coder-0.5B</td><td>0.5B</td><td>28.0</td><td>23.8</td><td>52.9</td><td>47.1</td><td>40.4</td><td>16.1</td><td>4.7</td></tr><tr><td colspan="9">1B+ Models</td></tr><tr><td>DS-Coder-1.3B</td><td>1.3B</td><td>34.8</td><td>26.8</td><td>55.6</td><td>46.9</td><td>46.2</td><td>26.1</td><td>3.4</td></tr><tr><td>Qwen2.5-Coder-1.5B</td><td>1.5B</td><td>43.9</td><td>36.6</td><td>69.2</td><td>58.6</td><td>59.2</td><td>34.6</td><td>9.5</td></tr><tr><td colspan="9">3B+ Models</td></tr><tr><td>StarCoder2-3B</td><td>3B</td><td>31.7</td><td>27.4</td><td>60.2</td><td>49.1</td><td>47.4</td><td>21.4</td><td>4.7</td></tr><tr><td>Qwen2.5-Coder-3B</td><td>3B</td><td>52.4</td><td>42.7</td><td>72.2</td><td>61.4</td><td>65.2</td><td>41.1</td><td>11.5</td></tr><tr><td colspan="9">6B+ Models</td></tr><tr><td>StarCoder2-7B</td><td>7B</td><td>35.4</td><td>29.9</td><td>54.4</td><td>45.6</td><td>51.8</td><td>27.7</td><td>8.8</td></tr><tr><td>DS-Coder-6.7B-Base</td><td>6.7B</td><td>47.6</td><td>39.6</td><td>70.2</td><td>56.6</td><td>60.6</td><td>41.1</td><td>11.5</td></tr><tr><td>DS-Coder-V2-Lite-Base</td><td>2.4/16B</td><td>40.9</td><td>34.1</td><td>71.9</td><td>59.4</td><td>62.6</td><td>30.6</td><td>8.1</td></tr><tr><td>CodeQwen1.5-7B</td><td>7B</td><td>51.8</td><td>45.7</td><td>72.2</td><td>60.2</td><td>61.8</td><td>45.6</td><td>15.5</td></tr><tr><td>Qwen2.5-Coder-7B</td><td>7B</td><td>61.6</td><td>53.0</td><td>76.9</td><td>62.9</td><td>68.8</td><td>45.8</td><td>16.2</td></tr><tr><td colspan="9">14B+ Models</td></tr><tr><td>StarCoder2-15B</td><td>15B</td><td>46.3</td><td>37.8</td><td>66.2</td><td>53.1</td><td>57.0</td><td>38.4</td><td>12.2</td></tr><tr><td>Qwen2.5-Coder-14B</td><td>14B</td><td>64.0</td><td>57.9</td><td>81.0</td><td>66.7</td><td>71.4</td><td>51.8</td><td>22.3</td></tr><tr><td colspan="9">20B+ Models</td></tr><tr><td>DS-Coder-33B-Base</td><td>33B</td><td>54.9</td><td>47.6</td><td>74.2</td><td>60.7</td><td>66.0</td><td>49.1</td><td>20.3</td></tr><tr><td>DS-Coder-V2-Base</td><td>21/236B</td><td>50.0</td><td>43.3</td><td>82.5</td><td>65.7</td><td>71.2</td><td>48.7</td><td>21.6</td></tr><tr><td>Qwen2.5-Coder-32B</td><td>32B</td><td>65.9</td><td>60.4</td><td>83.0</td><td>68.2</td><td>76.4</td><td>53.6</td><td>26.4</td></tr></table>

Table 5: Performance of various models on HumanEval, MBPP and the "complete" task of BigCodeBench.

表 5:HumanEval, MBPP 与 BigCodeBench-Complete.

### 6.2 Code Completion 代码补全

Many developer aid tools rely on the capability to autocomplete code based on preceding and succeeding code snippets. Qwen2.5-Coder utilizes the Fill-In-the-Middle (FIM) training strategy, as introduced in Bavarian et al. (2022), enabling the model to generate code that is contextually coherent. To assess its code completion proficiency, we utilize the HumanEval-FIM benchmark (Allal et al., 2023), CrossCodeEval (Ding et al., 2024), Cross-CodeLongEval (Wu et al., 2024a), RepoEval (Zhang et al., 2023) and SAFIM (Gong et al.,

开发辅助常要前后文补全. Qwen2.5-Coder 用 FIM 训练. 评测集: HumanEval-FIM, CrossCodeEval, CrossCodeLongEval, RepoEval, SAFIM.

> **问:** FIM 训练了, 为啥还要单独报 HumanEval-FIM?
> 生成基准(HumanEval)测的是从签名写整函数; HumanEval-FIM 测的是给定前后文填一行. 训练目标和解题协议不是同一张表.


<!-- page 13 of 32 -->

Technical Report

<table><tr><td>Model</td><td>Size</td><td>Python</td><td>C++</td><td>Java</td><td>PHP</td><td>TS</td><td>C#</td><td>Bash</td><td>JS</td><td>Average</td></tr><tr><td colspan="11">0.5B+ Models</td></tr><tr><td>Qwen2.5-Coder-0.5B</td><td>0.5B</td><td>28.0</td><td>25.5</td><td>22.8</td><td>23.6</td><td>30.8</td><td>31.0</td><td>7.0</td><td>29.2</td><td>24.7</td></tr><tr><td colspan="11">1B+ Models</td></tr><tr><td>DS-Coder-1.3B-Base</td><td>1.3B</td><td>34.8</td><td>31.1</td><td>32.3</td><td>24.2</td><td>28.9</td><td>36.7</td><td>10.1</td><td>28.6</td><td>28.3</td></tr><tr><td>Qwen2.5-Coder-1.5B</td><td>1.5B</td><td>42.1</td><td>42.9</td><td>38.6</td><td>41.0</td><td>49.1</td><td>46.2</td><td>20.3</td><td>49.1</td><td>41.1</td></tr><tr><td colspan="11">3B+ Models</td></tr><tr><td>StarCoder2-3B</td><td>3B</td><td>31.7</td><td>30.4</td><td>29.8</td><td>32.9</td><td>39.6</td><td>34.8</td><td>13.9</td><td>35.4</td><td>31.1</td></tr><tr><td>Qwen2.5-Coder-3B</td><td>3B</td><td>52.4</td><td>52.8</td><td>44.9</td><td>49.1</td><td>55.4</td><td>51.3</td><td>24.7</td><td>53.4</td><td>48.0</td></tr><tr><td colspan="11">6B+ Models</td></tr><tr><td>StarCoder2-7B</td><td>7B</td><td>35.4</td><td>40.4</td><td>38.0</td><td>30.4</td><td>34.0</td><td>46.2</td><td>13.9</td><td>36.0</td><td>34.3</td></tr><tr><td>DS-Coder-6.7B-Base</td><td>6.7B</td><td>49.4</td><td>50.3</td><td>43.0</td><td>38.5</td><td>49.7</td><td>50.0</td><td>28.5</td><td>48.4</td><td>44.7</td></tr><tr><td>DS-Coder-V2-Lite-Base</td><td>2.4/16B</td><td>40.9</td><td>45.9</td><td>34.8</td><td>47.2</td><td>48.4</td><td>41.7</td><td>19.6</td><td>44.7</td><td>40.4</td></tr><tr><td>CodeQwen1.5-7B</td><td>7B</td><td>51.8</td><td>52.2</td><td>42.4</td><td>46.6</td><td>52.2</td><td>55.7</td><td>36.7</td><td>49.7</td><td>48.4</td></tr><tr><td>Qwen2.5-Coder-7B</td><td>7B</td><td>61.6</td><td>62.1</td><td>53.2</td><td>59.0</td><td>64.2</td><td>60.8</td><td>38.6</td><td>60.3</td><td>57.5</td></tr><tr><td colspan="11">14B+ Models</td></tr><tr><td>StarCoder2-15B</td><td>15B</td><td>46.3</td><td>47.2</td><td>46.2</td><td>39.1</td><td>42.1</td><td>53.2</td><td>15.8</td><td>43.5</td><td>41.7</td></tr><tr><td>Qwen2.5-Coder-14B</td><td>14B</td><td>64.0</td><td>69.6</td><td>46.8</td><td>64.6</td><td>69.2</td><td>63.3</td><td>39.9</td><td>61.5</td><td>59.9</td></tr><tr><td colspan="11">20B+ Models</td></tr><tr><td>DS-Coder-33B-Base</td><td>33B</td><td>56.1</td><td>58.4</td><td>51.9</td><td>44.1</td><td>52.8</td><td>51.3</td><td>32.3</td><td>55.3</td><td>50.3</td></tr><tr><td>DS-Coder-V2-Base</td><td>21/236B</td><td>50.0</td><td>59.6</td><td>50.0</td><td>55.3</td><td>58.5</td><td>45.6</td><td>36.1</td><td>59.6</td><td>51.8</td></tr><tr><td>Qwen2.5-Coder-32B</td><td>32B</td><td>65.9</td><td>68.3</td><td>70.9</td><td>64.6</td><td>66.0</td><td>68.4</td><td>39.9</td><td>67.1</td><td>63.9</td></tr></table>

Table 6: Performance of different models on MultiPL-E.

表 6:MultiPL-E 多语言表现.

2024). Figure 5 shows the overall evaluation results of Qwen2.5-Coder-32B on different code completion benchmarks.

![Chart block](images/p12-figure-5-the-code-completion-performance-of-competitive.png)

Figure 5: The code completion performance of competitive models on five benchmarks,1 Humaneval-FIM, SAFIM, CrossCodeEval, RepoEval, CrossCodeLongEval.

图 5｜五套补全基准上的对照表现.

Humaneval-FIM benchmark challenges the model to accurately predict missing sections of code within tasks derived from Humaneval. We use the single-line infilling settings across Python, Java, and JavaScript, focusing on predicting a single line of code within given contexts. Performance was measured using the Exact Match metric, which determines the proportion of the first generated code line that precisely match the ground truth. The table 7 illustrates that Qwen2.5-Coder surpasses alternative models concerning model size. Specifically, Qwen2.5-Coder-1.5B achieves an average performance improvement of 3.7%, rivaling the majority of models exceeding 6 billion parameters. Moreover, Qwen2.5-Coder-7B stands as the leading model among those over 6 billion parameters, matching the performance of the formidable 33 billion parameter model, DS-Coder-33B-Base. Notably, we excluded DS-Coder-v2-236B from comparison due to its design focus not being on code completion tasks.

HumanEval-FIM 做单行填空(Python/Java/JS), 指标 Exact Match. Table 7: 1.5B 平均相对提升约 3.7%, 已可比多数 6B+; 7B 在 6B+ 里领先, 追平 DS-Coder-33B-Base. 未比 DS-Coder-v2-236B, 因其设计重心不在补全.

<!-- page 14 of 32 -->

Technical Report

<table><tr><td rowspan="2">Model</td><td rowspan="2">Size</td><td colspan="4">Humaneval-FIM</td></tr><tr><td>Python</td><td>Java</td><td>JavaScript</td><td>Average*</td></tr><tr><td colspan="6">0.5B+ Models</td></tr><tr><td>Qwen2.5-Coder-0.5B</td><td>0.5B</td><td>70.3</td><td>78.1</td><td>81.2</td><td>77.7</td></tr><tr><td colspan="6">1B+ Models</td></tr><tr><td>DS-Coder-1.3B-Base</td><td>1.3B</td><td>72.8</td><td>84.3</td><td>81.7</td><td>80.7</td></tr><tr><td>Qwen2.5-Coder-1.5B</td><td>1.5B</td><td>77.0</td><td>85.6</td><td>85.0</td><td>83.5</td></tr><tr><td colspan="6">3B+ Models</td></tr><tr><td>StarCoder2-3B</td><td>3B</td><td>70.9</td><td>84.4</td><td>81.8</td><td>80.4</td></tr><tr><td>Qwen2.5-Coder-3B</td><td>3B</td><td>78.7</td><td>88.0</td><td>87.4</td><td>85.7</td></tr><tr><td colspan="6">6B+ Models</td></tr><tr><td>StarCoder2-7B</td><td>7B</td><td>70.8</td><td>86.0</td><td>84.4</td><td>82.0</td></tr><tr><td>DS-Coder-6.7B-Base</td><td>6.7B</td><td>78.1</td><td>87.4</td><td>84.1</td><td>84.0</td></tr><tr><td>DS-Coder-V2-Lite-Base</td><td>2.4/16B</td><td>78.7</td><td>87.8</td><td>85.9</td><td>85.0</td></tr><tr><td>CodeQwen1.5-7B</td><td>7B</td><td>75.8</td><td>85.7</td><td>85.0</td><td>83.3</td></tr><tr><td>Qwen2.5-Coder-7B</td><td>7B</td><td>79.7</td><td>88.5</td><td>87.6</td><td>86.2</td></tr><tr><td colspan="6">14B+ Models</td></tr><tr><td>StarCoder2-15B</td><td>15B</td><td>74.2</td><td>85.2</td><td>84.6</td><td>82.6</td></tr><tr><td>Qwen2.5-Coder-14B</td><td>14B</td><td>80.5</td><td>91.0</td><td>88.5</td><td>87.7</td></tr><tr><td colspan="6">20B+ Models</td></tr><tr><td>CodeStral-22B</td><td>22B</td><td>76.7</td><td>82.5</td><td>86.0</td><td>82.7</td></tr><tr><td>DS-Coder-33B-Base</td><td>33B</td><td>80.1</td><td>89.0</td><td>86.8</td><td>86.2</td></tr><tr><td>Qwen2.5-Coder-32B</td><td>32B</td><td>81.5</td><td>91.0</td><td>89.4</td><td>88.3</td></tr></table>

Table 7: Performance of different approaches on the Humaneval-FIM Tasks. ∗Average refers to a weighted mean calculated based on the number of samples for each language.

表 7:HumanEval-FIM. *Average 按各语言样本数加权.

In real-world scenarios, code completion often depends on accessing cross-file context and dependencies. CrossCodeEval is a benchmark that requires a deep understanding of this cross-file context to accurately complete the code. In our evaluation, we set a maximum sequence length of 8192 tokens, designate a maximum output length of 50 tokens, and impose a limit of 2048 tokens for the cross-file context. For the cross-file context, we use the official BM25 search results provided by Ding et al. (2024). We evaluate performance using Exact Match (EM) and Edit Similarity (ES) metrics. Table 8 shows that the Qwen2.5-Coder-32B achieves state-of-the-art performance with a 3.7% improvement. Qwen2.5-Coder outperforms all the models with a comparable model size. Meanwhile, Qwen2.5-Coder-7B has a comparable performance with other models exceeding 20 billion parameters.

CrossCodeEval 测跨文件补全. 设定: 最大序列 8192, 最大输出 50, 跨文件上下文上限 2048, 检索用官方 BM25. 指标 EM/ES. Table 8: 32B 相对提升约 3.7% SOTA; 7B 可比 20B+ 对照.

> **核对:** 「3.7% improvement」是相对谁?
> 正文写 32B 达到 SOTA 并带 3.7% improvement; 具体对照行看 Table 8 平均 EM 57.1 (32B) vs DS-Coder-33B 的 48.8 等, 以表为准核对差值.


CrossCodeLongEval is a long context benchmark on cross file code completion tasks. In our evaluation, we set a maximum sequence length of 8192 tokens and set the maximum output as 256 tokens for function completion and 50 tokens for other tasks. The cross-file context is truncated to 2048 tokens. For the cross-file context, we use the official BM25 search results provided by Wu et al. (2024a). We evaluate performance using Exact Match (EM) and Edit Similarity (ES) metrics. Qwen2.5-Coder-32B achieves state-of-the-art performance, as detailed in Table 9. The Qwen2.5-Coder series surpasses all other models of a similar size. All models demonstrate low Exact Match (EM) results on function completion tasks, likely due to the complexity of generating multi-line code snippets that are challenging to match precisely.

CrossCodeLongEval: 序列 8192, 函数补全输出上限 256, 其他 50, 跨文件上下文 2048. Table 9 中 32B SOTA; 函数补全 EM 普遍偏低, 作者归因于多行精确匹配难.

RepoEval is a benchmark designed to evaluate repository-level code completion capabilities across three granularities: line, API invocation, and function body completion. In our evaluation, we set a maximum sequence length of 8192 tokens, set the maximum output as 256 tokens for function completion and 50 tokens for other tasks, and impose a limit of 2048

RepoEval 三粒度: 行, API 调用, 函数体. 设定同系: 序列 8192, 函数输出 256, 其他 50, 跨文件 2048.

<!-- page 15 of 32 -->

Technical Report

tokens for the cross-file context. Besides, we utilize the official sparse retriever (Lu et al., 2022) to extract the cross-file context. We evaluate performance using Exact Match (EM) and Edit Similarity (ES) metrics. As shown in Table 10, Qwen2.5-Coder-32B achieves stateof-the-art performance with an average improvement of 7.9% EM and 4.2% ES compared to DS-Coder-33B-Base. Furthermore, Qwen2.5-Coder-14B and Qwen2.5-Coder-7B achieve comparable performance to models with more than 20B parameters, while maintaining state-of-the-art results among models of similar size.

跨文件用官方稀疏检索 (Lu et al., 2022). Table 10: 32B 相对 DS-Coder-33B-Base 平均 EM +7.9%, ES +4.2%; 14B/7B 也可比 20B+.

SAFIM is a syntax-aware fill-in-the-middle benchmark that emphasizes AST-based code completion, specifically targeting algorithmic blocks, control-flow expressions, and API function calls. The benchmark consists of 17,720 examples from 8,590 code files created after April 2022, deliberately avoiding overlap with mainstream pretraining corpora. For evaluation, we use pass@1 rate as the metric for algorithmic and control-flow tasks, and Exact Match (EM) for API completion tasks.

SAFIM 强调 AST 感知补全(算法块, 控制流, API). 17,720 例, 来自 2022 年 4 月后 8,590 文件, 刻意避开主流预训练重叠. 算法/控制流用 pass@1, API 用 EM.

### 6.3 Code Reasoning 代码推理

Code is a highly abstract form of logical language, and reasoning based on code helps us determine whether a model truly understands the reasoning flow behind the code. We selected CRUXEval (Gu et al., 2024) as the benchmark, which includes 800 Python functions along with corresponding input-output examples. It consists of two distinct tasks: CRUXEval-I, where the large language model (LLM) must predict the output based on a given input; and CRUXEval-O, where the model must predict the input based on a known output. For both CRUXEval-I and CRUXEval-O, we used a chain-of-thought (CoT) approach, requiring the LLM to output steps sequentially during simulated execution.

代码是高度抽象的逻辑语言. CRUXEval 含 800 个 Python 函数及 I/O: I 是给输入预测输出, O 是给输出预测输入; 两边都走 CoT, 要求逐步模拟执行.

<!-- page 16 of 32 -->

Technical Report

<table><tr><td rowspan="2">Model</td><td colspan="2">Python</td><td colspan="2">Java</td><td colspan="2">TypeScript</td><td colspan="2">C#</td><td colspan="2">Average</td></tr><tr><td>EM</td><td>ES</td><td>EM</td><td>ES</td><td>EM</td><td>ES</td><td>EM</td><td>ES</td><td>EM</td><td>ES</td></tr><tr><td colspan="11">0.5B+ Models</td></tr><tr><td>Qwen2.5-Coder-0.5B</td><td>22.7</td><td>66.2</td><td>21.7</td><td>66.8</td><td>21.9</td><td>67.2</td><td>32.1</td><td>75.4</td><td>24.6</td><td>68.9</td></tr><tr><td colspan="11">1B+ Models</td></tr><tr><td>DS-Coder-1.3B-Base</td><td>33.4</td><td>72.6</td><td>34.9</td><td>74.5</td><td>36.7</td><td>76.4</td><td>46.6</td><td>83.5</td><td>37.9</td><td>76.8</td></tr><tr><td>Qwen2.5-Coder-1.5B</td><td>35.5</td><td>74.3</td><td>37.9</td><td>76.5</td><td>37.6</td><td>77.4</td><td>49.8</td><td>84.5</td><td>40.2</td><td>78.2</td></tr><tr><td colspan="11">3B+ Models</td></tr><tr><td>StarCoder2-3B</td><td>11.0</td><td>62.7</td><td>11.6</td><td>69.7</td><td>8.8</td><td>75.8</td><td>8.2</td><td>71.2</td><td>9.9</td><td>69.8</td></tr><tr><td>Qwen2.5-Coder-3B</td><td>38.4</td><td>76.1</td><td>42.8</td><td>79.8</td><td>41.6</td><td>80.5</td><td>56.7</td><td>87.1</td><td>44.9</td><td>80.9</td></tr><tr><td colspan="11">6B+ Models</td></tr><tr><td>StarCoder2-7B</td><td>10.9</td><td>63.1</td><td>8.3</td><td>71.0</td><td>6.7</td><td>76.8</td><td>7.3</td><td>72.1</td><td>8.3</td><td>70.8</td></tr><tr><td>DS-Coder-6.7B-Base</td><td>41.1</td><td>79.2</td><td>39.9</td><td>80.1</td><td>46.3</td><td>82.4</td><td>55.0</td><td>86.9</td><td>45.6</td><td>82.1</td></tr><tr><td>DS-Coder-V2-Lite-Base</td><td>41.8</td><td>78.3</td><td>46.1</td><td>81.2</td><td>44.6</td><td>81.4</td><td>58.7</td><td>87.9</td><td>47.8</td><td>82.2</td></tr><tr><td>CodeQwen1.5-7B</td><td>40.7</td><td>77.8</td><td>47.0</td><td>81.6</td><td>45.8</td><td>82.2</td><td>59.7</td><td>87.6</td><td>48.3</td><td>82.3</td></tr><tr><td>Qwen2.5-Coder-7B</td><td>42.4</td><td>78.6</td><td>48.1</td><td>82.6</td><td>46.8</td><td>83.4</td><td>59.7</td><td>87.9</td><td>49.3</td><td>83.1</td></tr><tr><td colspan="11">14B+ Models</td></tr><tr><td>StarCoder2-15B</td><td>28.2</td><td>70.5</td><td>26.7</td><td>71.0</td><td>24.7</td><td>76.3</td><td>25.2</td><td>74.2</td><td>26.2</td><td>73.0</td></tr><tr><td>Qwen2.5-Coder-14B</td><td>47.7</td><td>81.7</td><td>54.7</td><td>85.7</td><td>52.9</td><td>86.0</td><td>66.4</td><td>91.1</td><td>55.4</td><td>86.1</td></tr><tr><td colspan="11">20B+ Models</td></tr><tr><td>CodeStral-22B</td><td>49.3</td><td>82.7</td><td>44.1</td><td>71.1</td><td>51.0</td><td>85.0</td><td>53.7</td><td>83.6</td><td>49.5</td><td>80.6</td></tr><tr><td>DS-Coder-33B-Base</td><td>44.2</td><td>80.4</td><td>46.5</td><td>82.7</td><td>49.2</td><td>84.0</td><td>55.2</td><td>87.8</td><td>48.8</td><td>83.7</td></tr><tr><td>Qwen2.5-Coder-32B</td><td>49.2</td><td>82.1</td><td>56.4</td><td>86.6</td><td>54.9</td><td>87.0</td><td>68.0</td><td>91.6</td><td>57.1</td><td>86.8</td></tr></table>

Table 8: Performance of different approaches on the CrossCodeEval Tasks.

表 8:CrossCodeEval.

As shown in Table 11, Qwen2.5-Coder delivered highly promising results, achieving a score of 56.5 on CRUXEval-I and 56.0 on CRUXEval-O, thanks to our focus on executable quality during the code cleaning process.

Table 11: 7B 上 CRUXEval-I 56.5, O 56.0; 作者归因于清洗时强调可执行质量.

### 6.4 Math Reasoning 数学推理

Mathematics and coding have always been closely intertwined. Mathematics forms the foundational discipline for coding, while coding serves as a vital tool in mathematical fields. As such, we expect an open and powerful code model to exhibit strong mathematical capabilities as well. To assess Qwen2.5-Coder's mathematical performance, we selected five popular benchmarks, including MATH (Hendrycks et al., 2021), GSM8K (Cobbe et al., 2021), MMLU-STEM (Hendrycks et al., 2020) and TheoremQA (Chen et al., 2023). Table 12 highlights Qwen2.5-Coder's strengths in mathematics, which likely stem from two key factors: first, the model's strong foundation built on Qwen2.5, and second, the careful mixing of code and mathematical data during training, which has ensured a well-balanced performance across these domains.

数学与代码互相支撑. 评 MATH, GSM8K, MMLU-STEM, TheoremQA(正文写五个, 表 12 列四个主项). Table 12 的优势, 作者归为 Qwen2.5 底座 + 训练时 code/math 混得稳.

> **看表:** 正文说五个基准, 表 12 怎么只有四列?
> Table 12 列 MATH, GSM8K, MMLU STEM, TheoremQA 四项; 「五个」与表列不一致, 以表为准, 可能另有未列表项或笔误.


### 6.5 General Natural Language 通用自然语言

In addition to mathematical ability, we aim to retain as much of the base model's general-purpose capabilities as possible, such as general knowledge. To evaluate general natural language understanding, we selected MMLU (Hendrycks et al., 2021) and its variant MMLU-Redux (Gema et al., 2024), along with four other benchmarks: ARC-Challenge (Clark et al., 2018), TruthfulQA (Lin et al., 2021), WinoGrande (Sakaguchi et al., 2019), and HellaSwag (Zellers et al., 2019). Similar to the results in mathematics, Table 14 highlights Qwen2.5-

除数学外还要保住通用能力. 评 MMLU / MMLU-Redux, 以及 ARC-Challenge, TruthfulQA, WinoGrande, HellaSwag. Table 14 继续显示相对其他 coder 的优势, 印证配比策略.

<!-- page 17 of 32 -->

Technical Report

<table><tr><td rowspan="2">Model</td><td colspan="2">Chunk Completion</td><td colspan="2">Function completion</td><td colspan="2">Average</td></tr><tr><td>EM</td><td>ES</td><td>EM</td><td>ES</td><td>EM</td><td>ES</td></tr><tr><td colspan="7">0.5B+ Models</td></tr><tr><td>Qwen2.5-Coder-0.5B</td><td>29.8</td><td>64.2</td><td>9.5</td><td>38.0</td><td>19.7</td><td>51.1</td></tr><tr><td colspan="7">1B+ Models</td></tr><tr><td>DS-Coder-1.3B-Base</td><td>40.6</td><td>71.9</td><td>9.6</td><td>39.4</td><td>25.1</td><td>55.7</td></tr><tr><td>Qwen2.5-Coder-1.5B</td><td>44.2</td><td>73.9</td><td>12.4</td><td>44.4</td><td>28.3</td><td>59.2</td></tr><tr><td colspan="7">3B+ Models</td></tr><tr><td>StarCoder2-3B</td><td>18.5</td><td>62.0</td><td>10.2</td><td>39.2</td><td>14.3</td><td>50.6</td></tr><tr><td>Qwen2.5-Coder-3B</td><td>46.6</td><td>76.1</td><td>13.5</td><td>46.4</td><td>30.0</td><td>61.3</td></tr><tr><td colspan="7">6B+ Models</td></tr><tr><td>StarCoder2-7B</td><td>19.4</td><td>63.6</td><td>10.2</td><td>40.0</td><td>14.8</td><td>51.8</td></tr><tr><td>DS-Coder-6.7B-Base</td><td>48.4</td><td>78.2</td><td>10.7</td><td>42.4</td><td>29.6</td><td>60.3</td></tr><tr><td>DS-Coder-V2-Lite-Base</td><td>49.5</td><td>77.1</td><td>11.4</td><td>43.1</td><td>30.4</td><td>60.1</td></tr><tr><td>CodeQwen1.5-7B</td><td>48.2</td><td>77.5</td><td>6.4</td><td>30.6</td><td>27.3</td><td>54.1</td></tr><tr><td>Qwen2.5-Coder-7B</td><td>52.4</td><td>79.3</td><td>14.4</td><td>48.4</td><td>33.4</td><td>63.8</td></tr><tr><td colspan="7">14B+ Models</td></tr><tr><td>StarCoder2-15B</td><td>21.3</td><td>53.7</td><td>7.8</td><td>30.5</td><td>14.6</td><td>42.1</td></tr><tr><td>Qwen2.5-Coder-14B</td><td>56.9</td><td>81.8</td><td>15.4</td><td>49.8</td><td>36.1</td><td>65.8</td></tr><tr><td colspan="7">20B+ Models</td></tr><tr><td>CodeStral-22B</td><td>56.7</td><td>81.8</td><td>10.5</td><td>37.8</td><td>33.6</td><td>59.8</td></tr><tr><td>DS-Coder-33B-Base</td><td>52.0</td><td>79.9</td><td>11.9</td><td>44.3</td><td>32.0</td><td>62.1</td></tr><tr><td>Qwen2.5-Coder-32B</td><td>57.3</td><td>82.1</td><td>16.4</td><td>50.8</td><td>36.9</td><td>66.4</td></tr></table>

Table 9: Performance of different approaches on the CrossCodeLongEval Tasks.

表 9:CrossCodeLongEval.(注: 源表 StarCoder2-15B 行 OCR 可能错位, 数字以源 md 为准.)

Coder's advantage in general natural language capabilities compared to other coders, further validating the effectiveness of Qwen2.5-Coder data mixing strategy.

### 6.6 Long-Context Evaluation 长上下文评测

Long context capability is crucial for code LLMs, serving as the core skill for understanding repository-level code and becoming a code agent. However, most of the current code models still have very limited support for length, which hinders their potential for practical application. Qwen2.5-Coder aims to further advance the progress of open-source code models in long context modeling. To achieve this, we have collected and constructed long sequence code data at the repository level for pre-training. Through careful data proportioning and organization, we have enabled it to support input lengths of up to 128K tokens.

长上下文是仓库级理解与 code agent 的核心技能. 多数代码模型长度仍紧. Qwen2.5-Coder 用仓库级长序列预训练, 经配比与组织, 支持最长 128K token 输入.

> **拆开:** 仓库级阶段只训到 32K, 128K 靠什么站住?
> 3.2.2: 训练窗 32,768 + RoPE base 调到 1,000,000 + YaRN 外推到 131,072. Needle in the Code (Figure 6) 是 128K 验证, 不是又训了 128K 全长.


**Needle in the Code** We created a simple but basic synthetic task called Needle in the Code, inspired by popular long-context evaluations in the text domain. In this task, we inserted a very simple custom function at various positions within a code repo (we chose Megatron <sup>4</sup>to honor its contributions to open-source LLMs!) and tested whether the model could replicate this function at the end of the codebase. The figure below shows that Qwen2.5-Coder is capable of successfully completing this task within a 128k length range.

**Needle in the Code** 仿文本域「大海捞针」: 在仓库(选 Megatron)各位置插入简单自定义函数, 看模型能否在仓末复现. 下图显示 128K 范围内可完成.

## 7 Evaluation on Instruct Models Instruct 模型评测

For the evaluation of the instruct models, we rigorously assessed six core areas: code generation, code reasoning, code editing, text-to-sql, mathematical reasoning and general natural language

Instruct 评六块: 代码生成, 推理, 编辑, Text-to-SQL, 数学, 通用自然语言.

<small><span class="docvortex-page-footnote" data-block-type="page_footnote" style="color:#6b7280"><sup>4</sup>[https://github.com/NVIDIA/Megatron-LM](https://github.com/NVIDIA/Megatron-LM)</span></small>

<!-- page 18 of 32 -->

Technical Report

<table><tr><td rowspan="2">Model</td><td colspan="2">Line</td><td colspan="2">Function</td><td colspan="2">API</td><td colspan="2">Average</td></tr><tr><td>EM</td><td>ES</td><td>EM</td><td>ES</td><td>EM</td><td>ES</td><td>EM</td><td>ES</td></tr><tr><td colspan="9">0.5B+ Models</td></tr><tr><td>Qwen2.5-Coder-0.5B</td><td>44.2</td><td>72.6</td><td>4.6</td><td>48.0</td><td>35.6</td><td>68.5</td><td>28.1</td><td>63.0</td></tr><tr><td colspan="9">1B+ Models</td></tr><tr><td>DS-Coder-1.3B-Base</td><td>58.7</td><td>80.4</td><td>6.2</td><td>48.8</td><td>45.8</td><td>75.0</td><td>36.9</td><td>68.1</td></tr><tr><td>Qwen2.5-Coder-1.5B</td><td>59.8</td><td>82.6</td><td>10.6</td><td>52.4</td><td>51.0</td><td>80.1</td><td>40.5</td><td>71.7</td></tr><tr><td colspan="9">3B+ Models</td></tr><tr><td>StarCoder2-3B</td><td>22.3</td><td>67.4</td><td>3.1</td><td>51.6</td><td>20.6</td><td>70.1</td><td>15.3</td><td>63.0</td></tr><tr><td>Qwen2.5-Coder-3B</td><td>64.9</td><td>85.0</td><td>12.3</td><td>55.8</td><td>54.7</td><td>81.3</td><td>44.0</td><td>74.0</td></tr><tr><td colspan="9">6B+ Models</td></tr><tr><td>StarCoder2-7B</td><td>19.5</td><td>67.6</td><td>4.0</td><td>53.5</td><td>19.1</td><td>72.8</td><td>14.2</td><td>64.7</td></tr><tr><td>DS-Coder-6.7B-Base</td><td>63.1</td><td>85.5</td><td>9.9</td><td>53.3</td><td>52.3</td><td>81.7</td><td>41.7</td><td>73.5</td></tr><tr><td>DS-Coder-V2-Lite-Base</td><td>66.5</td><td>85.4</td><td>10.8</td><td>53.9</td><td>53.1</td><td>81.3</td><td>43.4</td><td>73.5</td></tr><tr><td>CodeQwen1.5-7B</td><td>59.7</td><td>81.5</td><td>4.8</td><td>44.3</td><td>46.1</td><td>77.5</td><td>36.9</td><td>67.8</td></tr><tr><td>Qwen2.5-Coder-7B</td><td>67.3</td><td>86.1</td><td>13.2</td><td>55.2</td><td>58.4</td><td>83.9</td><td>46.3</td><td>75.1</td></tr><tr><td colspan="9">14B+ Models</td></tr><tr><td>StarCoder2-15B</td><td>30.9</td><td>62.5</td><td>5.5</td><td>43.7</td><td>21.7</td><td>60.3</td><td>19.4</td><td>55.5</td></tr><tr><td>Qwen2.5-Coder-14B</td><td>74.3</td><td>90.1</td><td>14.1</td><td>59.5</td><td>63.4</td><td>87.3</td><td>50.6</td><td>79.0</td></tr><tr><td colspan="9">20B+ Models</td></tr><tr><td>Codestral-22B-v0.1</td><td>40.9</td><td>51.7</td><td>9.9</td><td>49.2</td><td>24.8</td><td>40.8</td><td>30.0</td><td>46.6</td></tr><tr><td>DS-Coder-33B-Base</td><td>66.5</td><td>86.6</td><td>10.3</td><td>52.9</td><td>54.2</td><td>83.5</td><td>43.7</td><td>74.3</td></tr><tr><td>Qwen2.5-Coder-32B</td><td>76.1</td><td>90.5</td><td>13.6</td><td>57.5</td><td>65.1</td><td>87.6</td><td>51.6</td><td>78.5</td></tr></table>

Table 10: Performance of different approaches on the RepoEval Tasks.

表 10:RepoEval.

<table><tr><td rowspan="2">Model</td><td rowspan="2">Size</td><td colspan="2">CRUXEval</td></tr><tr><td>Input-CoT</td><td>Output-CoT</td></tr><tr><td colspan="4">0.5B+ Models</td></tr><tr><td>Qwen2.5-Coder-0.5B</td><td>0.5B</td><td>35.2</td><td>23.0</td></tr><tr><td colspan="4">1B+ Models</td></tr><tr><td>DS-Coder-1.3B-Base</td><td>1.3B</td><td>32.1</td><td>28.2</td></tr><tr><td>Qwen2.5-Coder-1.5B</td><td>1.5B</td><td>43.8</td><td>34.6</td></tr><tr><td colspan="4">3B+ Models</td></tr><tr><td>StarCoder2-3B</td><td>3B</td><td>42.1</td><td>29.2</td></tr><tr><td>Qwen2.5-Coder-3B</td><td>3B</td><td>46.5</td><td>43.8</td></tr><tr><td colspan="4">6B+ Models</td></tr><tr><td>StarCoder2-7B</td><td>7B</td><td>39.5</td><td>35.1</td></tr><tr><td>DS-Coder-6.7B-Base</td><td>6.7B</td><td>39.0</td><td>41.0</td></tr><tr><td>DS-Coder-V2-Lite-Base</td><td>2.4/16B</td><td>53.4</td><td>46.1</td></tr><tr><td>CodeQwen1.5-7B</td><td>7B</td><td>44.8</td><td>40.1</td></tr><tr><td>Qwen2.5-Coder-7B</td><td>7B</td><td>56.5</td><td>56.0</td></tr><tr><td colspan="4">14B+ Models</td></tr><tr><td>StarCoder2-15B</td><td>15B</td><td>46.1</td><td>47.6</td></tr><tr><td>Qwen2.5-Coder-14B</td><td>14B</td><td>60.6</td><td>66.4</td></tr><tr><td colspan="4">20B+ Models</td></tr><tr><td>DS-Coder-33B-Base</td><td>33B</td><td>50.6</td><td>48.8</td></tr><tr><td>DS-Coder-V2-Base</td><td>21/236B</td><td>62.7</td><td>67.4</td></tr><tr><td>Qwen2.5-Coder-32B</td><td>32B</td><td>62.5</td><td>69.4</td></tr></table>

Table 11: Performance of different models on CRUXEval with Input-CoT and Output-CoT settings.

表 11:Base 的 CRUXEval (Input-CoT / Output-CoT).

![Chart block](images/p17-figure-6-the-long-context-ability-of-qwen2-5-coder.png)

Figure 6: The long context ability of Qwen2.5-Coder, evaluated by Needle in the Code.

图 6｜Needle in the Code 长上下文能力.

understanding. The evaluation was structured to ensure a fair and thorough comparison across models. All evaluation code is publicly accessible for reproducibility<sup>5</sup>. To ensure a broad comparison, we included some of the most popular and widely-used open-source instruction-tuned models, notably versions from the DeepSeek-Coder series and Codestral models. Below is a list of all artifacts referenced in this section.

评测代码公开. 对照含 DeepSeek-Coder 与 Codestral 等主流 Instruct.

<small><span class="docvortex-page-footnote" data-block-type="page_footnote" style="color:#6b7280"><sup>5</sup>[https://github.com/QwenLM/Qwen2.5-Coder](https://github.com/QwenLM/Qwen2.5-Coder)</span></small>

<!-- page 19 of 32 -->

Technical Report

<table><tr><td>Model</td><td>Size</td><td>MATH4-shot</td><td>GSM8K4-shot</td><td>MMLU STEM5-shot</td><td>TheoremQA5-shot</td></tr><tr><td colspan="6">0.5B+ Models</td></tr><tr><td>Qwen2.5-Coder-0.5B</td><td>0.5B</td><td>15.4</td><td>34.5</td><td>34.4</td><td>14.3</td></tr><tr><td colspan="6">1B+ Models</td></tr><tr><td>DS-Coder-1.3B-Base</td><td>1.3B</td><td>4.6</td><td>4.4</td><td>24.5</td><td>8.9</td></tr><tr><td>Qwen2.5-Coder-1.5B</td><td>1.5B</td><td>30.9</td><td>65.8</td><td>49.0</td><td>21.4</td></tr><tr><td colspan="6">3B+ Models</td></tr><tr><td>StarCoder2-3B</td><td>3B</td><td>10.8</td><td>21.6</td><td>34.9</td><td>12.1</td></tr><tr><td>Qwen2.5-Coder-3B</td><td>3B</td><td>40.0</td><td>75.7</td><td>56.0</td><td>29.5</td></tr><tr><td colspan="6">6B+ Models</td></tr><tr><td>StarCoder2-7B</td><td>7B</td><td>14.6</td><td>32.7</td><td>39.8</td><td>16.0</td></tr><tr><td>DS-Coder-6.7B-Base</td><td>6.7B</td><td>10.3</td><td>21.3</td><td>34.2</td><td>13.6</td></tr><tr><td>DS-Coder-V2-Lite-Base</td><td>2.4/16B</td><td>39.0</td><td>67.1</td><td>58.5</td><td>29.3</td></tr><tr><td>CodeQwen1.5-7B</td><td>7B</td><td>10.6</td><td>37.7</td><td>39.6</td><td>15.8</td></tr><tr><td>Qwen2.5-Coder-7B</td><td>7B</td><td>46.6</td><td>83.9</td><td>67.6</td><td>34.0</td></tr><tr><td colspan="6">14B+ Models</td></tr><tr><td>StarCoder2-15B</td><td>15B</td><td>23.7</td><td>57.7</td><td>49.2</td><td>20.5</td></tr><tr><td>Qwen2.5-Coder-14B</td><td>14B</td><td>52.8</td><td>88.7</td><td>73.9</td><td>39.6</td></tr><tr><td colspan="6">20B+ Models</td></tr><tr><td>DS-Coder-33B-Base</td><td>33B</td><td>14.4</td><td>35.4</td><td>39.5</td><td>17.5</td></tr><tr><td>DS-Coder-V2-Base</td><td>21/236B</td><td>50.6</td><td>85.8</td><td>76.0</td><td>39.4</td></tr><tr><td>Qwen2.5-Coder-32B</td><td>32B</td><td>57.2</td><td>91.1</td><td>75.1</td><td>43.1</td></tr></table>

Table 12: Performance of various models on four math benchmarks, named MATH, GSM8K, MMLU STEM and TheoremQA respectively.

表 12:四项数学基准.

### 7.1 Code Generation 代码生成

Building on the performance improvements of the Qwen2.5-Coder series base models, our Qwen2.5-Coder series instruct models similarly demonstrated outstanding performance in code generation tasks.

Instruct 在生成任务上同样突出.

**HumanEval and MBPP** We also assessed the code generation capabilities of the Qwen2.5-Coder series instruction models using the EvalPlus (Liu et al., 2023) dataset. As shown by the results in Table 16, our Qwen2.5-Coder-7B-Instruct model demonstrated exceptional accuracy, significantly outperforming other models with a comparable parameter count. Remarkably, it even surpassed larger models with over 20 billion parameters, such as CodeStral-22B and DS-Coder-33B-Instruct. Furthermore, our Qwen2.5-Coder-32B-Instruct model achieved the highest performance on EvalPlus, even outperforming DS-Coder-V2-Instruct, making it the most powerful open-source code model to date.

Table 16: 7B-Instruct 明显强于同规模, 并超过 CodeStral-22B, DS-Coder-33B-Instruct 等 20B+; 32B-Instruct 在 EvalPlus 上最高, 超过 DS-Coder-V2-Instruct.

**BigCodeBench-Instruct** The instruct split provided by BigCodeBench (Zhuo et al., 2024) is designed to evaluate the code generation capabilities of instruction-based models. We evaluated the Qwen2.5-Coder series instruct models on the BigCodeBench-Instruct dataset. As indicated in Table 16, the Qwen2.5-Coder-7B-Instruct model outperformed other instruct models with comparable parameter sizes, achieving notably high accuracy scores on both the full and hard subsets, reaching 41.0% on the full subset and 18.2% on the hard subset. This highlights the robust code generation capabilities of the Qwen2.5-Coder instruct models. Furthermore, the Qwen2.5-Coder-32B-Instruct achieved accuracy rates of 49.6% on the complete split and 27.0% on the hard split, establishing it as the best-performing open-source code generation model and surpassing several closed-source APIs.

BigCodeBench-Instruct: 7B Full 41.0%, Hard 18.2%; 32B Full 49.6%, Hard 27.0%, 开源最强并超过部分闭源 API.

**LiveCodeBench** LiveCodeBench (Jain et al., 2024) is a comprehensive and contaminationfree benchmark designed to evaluate the coding capabilities of LLMs. It continuously gathers new problems from leading competitive programming platforms like LeetCode<sup>6</sup>, AtCoder<sup>7</sup>, and CodeForces<sup>8</sup>, ensuring an up-to-date and diverse set of challenges. Currently, it hosts over 600 high-quality coding problems published between May 2023 and September 2024.

LiveCodeBench 是持续更新的抗污染基准, 从 LeetCode, AtCoder, CodeForces 等竞赛平台不断收新题; 现有 600+ 题, 发布于 2023.05–2024.09.

To further demonstrate our model's effectiveness on real-world competitive programming tasks, we evaluated the Qwen-2.5-Coder series instruct models on the LiveCodeBench (2407-2409) dataset. As shown in Table 16, the Qwen-2.5-Coder-7B-Instruct model achieved an impressive Pass@1 accuracy of 37.6%, significantly outperforming other models with similar parameter counts. Notably, it also outperformed larger models, such as CodeStral-22B-v0.1 and DS-Coder-33B-Instruct. Additionally, our Qwen-2.5-Coder-32B-Instruct model achieved an accuracy of 31.4%, surpassing all open-source code generation models and reaching a level comparable to many closed-source APIs.

LiveCodeBench (2024-07 至 2024-09). 正文写 7B-Instruct Pass@1 37.6%, 32B 31.4%.

> **确认:** 正文 7B 是 37.6%, Table 16 却是 18.2%?
> Table 16 里 7B-Instruct 的 LiveCodeBench 列是 18.2, 32B 是 31.4. 正文 37.6% 与表不一致; 读数以 Table 16 为准, 并把正文当疑点记下.


<!-- page 20 of 32 -->

Technical Report

<table><tr><td rowspan="2">Model</td><td rowspan="2">Size</td><td colspan="3">MMLU</td></tr><tr><td>Base</td><td>Pro</td><td>Redux</td></tr><tr><td colspan="5">0.5B+ Models</td></tr><tr><td>Qwen2.5-Coder-0.5B</td><td>0.5B</td><td>42.0</td><td>13.3</td><td>40.6</td></tr><tr><td colspan="5">1B+ Models</td></tr><tr><td>DS-Coder-1.3B-Base</td><td>1.3B</td><td>25.8</td><td>11.4</td><td>24.5</td></tr><tr><td>Qwen2.5-Coder-1.5B</td><td>1.5B</td><td>53.6</td><td>23.1</td><td>50.9</td></tr><tr><td colspan="5">3B+ Models</td></tr><tr><td>StarCoder2-3B</td><td>3B</td><td>36.6</td><td>15.5</td><td>37.0</td></tr><tr><td>Qwen2.5-Coder-3B</td><td>3B</td><td>61.2</td><td>32.0</td><td>59.5</td></tr><tr><td colspan="5">6B+ Models</td></tr><tr><td>StarCoder2-7B</td><td>7B</td><td>38.8</td><td>17.2</td><td>38.6</td></tr><tr><td>DS-Coder-6.7B-Base</td><td>6.7B</td><td>36.4</td><td>16.7</td><td>36.5</td></tr><tr><td>DS-Coder-V2-Lite-Base</td><td>2.4/16B</td><td>60.5</td><td>33.4</td><td>58.3</td></tr><tr><td>CodeQwen1.5-7B</td><td>7B</td><td>40.5</td><td>17.2</td><td>41.2</td></tr><tr><td>Qwen2.5-Coder-7B</td><td>7B</td><td>68.0</td><td>40.1</td><td>66.6</td></tr><tr><td colspan="5">14B+ Models</td></tr><tr><td>StarCoder2-15B</td><td>15B</td><td>64.1</td><td>24.3</td><td>48.8</td></tr><tr><td>Qwen2.5-Coder-14B</td><td>14B</td><td>75.2</td><td>49.3</td><td>72.4</td></tr><tr><td colspan="5">20B+ Models</td></tr><tr><td>DS-Coder-33B-Base</td><td>33B</td><td>39.4</td><td>18.4</td><td>38.7</td></tr><tr><td>Qwen2.5-Coder-32B</td><td>32B</td><td>79.1</td><td>50.4</td><td>77.5</td></tr></table>

Table 13: MMLU results of different models, a general benchmark for common knowledge.

表 13:MMLU / Pro / Redux.

**Multi-Programming Language** The Qwen2.5-Coder series instruct models have inherited the high performance of the base model on the Multi-Programming Language. To further evaluate their capabilities, we tested the instruct models on two specific benchmarks: MultiPL-E (Cassano et al., 2022) and McEval (Chai et al., 2024).

**MultiPL-E** As shown by the evaluation results in Table 17, Qwen2.5-Coder-7B-Instruct consistently outperforms other models with similar parameter counts, such as DS-Coder-

Instruct 继承 base 的多语言能力; 另测 MultiPL-E 与 McEval. Table 17: 7B-Instruct 持续超过同规模(如 DS-Coder-V2-Lite-Instruct).

<small><span class="docvortex-page-footnote" data-block-type="page_footnote" style="color:#6b7280"><sup>6</sup>[https://leetcode.com](https://leetcode.com)</span></small>
<small><span class="docvortex-page-footnote" data-block-type="page_footnote" style="color:#6b7280"><sup>7</sup>[https://atcoder.jp](https://atcoder.jp)</span></small>
<small><span class="docvortex-page-footnote" data-block-type="page_footnote" style="color:#6b7280"><sup>8</sup>[https://codeforces.com](https://codeforces.com)</span></small>

<!-- page 21 of 32 -->

Technical Report

<table><tr><td>Model</td><td>Size</td><td>ARC-Challenge</td><td>TruthfulQA</td><td>WinoGrande</td><td>HellaSwag</td></tr><tr><td colspan="6">0.5B+ Models</td></tr><tr><td>Qwen2.5-Coder-0.5B</td><td>0.5B</td><td>34.4</td><td>42.7</td><td>54.8</td><td>48.4</td></tr><tr><td colspan="6">1B+ Models</td></tr><tr><td>DS-Coder-1.3B-Base</td><td>1.3B</td><td>25.4</td><td>42.7</td><td>53.3</td><td>39.5</td></tr><tr><td>Qwen2.5-Coder-1.5B</td><td>1.5B</td><td>45.2</td><td>44.0</td><td>60.7</td><td>61.8</td></tr><tr><td colspan="6">3B+ Models</td></tr><tr><td>StarCoder2-3B</td><td>3B</td><td>34.2</td><td>40.5</td><td>57.1</td><td>48.1</td></tr><tr><td>Qwen2.5-Coder-3B</td><td>3B</td><td>52.9</td><td>49.2</td><td>67.4</td><td>70.9</td></tr><tr><td colspan="6">6B+ Models</td></tr><tr><td>StarCoder2-7B</td><td>7B</td><td>38.7</td><td>42.0</td><td>57.1</td><td>52.4</td></tr><tr><td>DS-Coder-6.7B-Base</td><td>6.7B</td><td>36.4</td><td>40.2</td><td>57.6</td><td>53.8</td></tr><tr><td>DS-Coder-V2-Lite-Base</td><td>2.4/16B</td><td>57.3</td><td>38.8</td><td>72.9</td><td>76.1</td></tr><tr><td>CodeQwen1.5-7B</td><td>7B</td><td>35.7</td><td>42.2</td><td>59.8</td><td>56.0</td></tr><tr><td>Qwen2.5-Coder-7B</td><td>7B</td><td>60.9</td><td>50.6</td><td>72.9</td><td>76.8</td></tr><tr><td colspan="6">14B+ Models</td></tr><tr><td>StarCoder2-15B</td><td>15B</td><td>47.2</td><td>37.9</td><td>64.3</td><td>64.1</td></tr><tr><td>Qwen2.5-Coder-14B</td><td>14B</td><td>66.0</td><td>55.2</td><td>76.8</td><td>80.2</td></tr><tr><td colspan="6">20B+ Models</td></tr><tr><td>DS-Coder-33B-Base</td><td>33B</td><td>42.2</td><td>40.0</td><td>62.0</td><td>60.2</td></tr><tr><td>DS-Coder-V2-Base</td><td>21/236B</td><td>64.3</td><td>41.4</td><td>83.7</td><td>86.0</td></tr><tr><td>Qwen2.5-Coder-32B</td><td>32B</td><td>70.5</td><td>54.2</td><td>80.8</td><td>83.0</td></tr></table>

Table 14: General performance of different models on four popular general benchmarks, ARC-Challenge, TruthfulQA, WinoGrande and HellaSwag.

表 14:四项通用基准.

| Artifact | Public link |
| --- | --- |
| Qwen2.5-Coder-0.5B-Instruct | https://hf.co/Qwen/Qwen2.5-Coder-0.5B-Instruct |
| Qwen2.5-Coder-1.5B-Instruct | https://hf.co/Qwen/Qwen2.5-Coder-1.5B-Instruct |
| Qwen2.5-Coder-3B-Instruct | https://hf.co/Qwen/Qwen2.5-Coder-3B-Instruct |
| Qwen2.5-Coder-7B-Instruct | https://hf.co/Qwen/Qwen2.5-Coder-7B-Instruct |
| Qwen2.5-Coder-14B-Instruct | https://hf.co/Qwen/Qwen2.5-Coder-14B-Instruct |
| Qwen2.5-Coder-32B-Instruct | https://hf.co/Qwen/Qwen2.5-Coder-32B-Instruct |
| CodeQwen1.5-7B-Chat | https://hf.co/Qwen/CodeQwen1.5-7B-Chat |
| CodeLlama-7B-Instruct | https://hf.co/meta-llama/CodeLlama-7b-Instruct-hf |
| CodeLlama-13B-Instruct | https://hf.co/meta-llama/CodeLlama-13b-Instruct-hf |
| CodeLlama-34B-Instruct | https://hf.co/meta-llama/CodeLlama-34b-Instruct-hf |
| CodeLlama-70B-Instruct | https://hf.co/meta-llama/CodeLlama-70b-Instruct-hf |
| DS-Coder-1.3B-instruct | https://hf.co/deepseek-ai/deepseek-coder-1.3b-instruct |
| DS-Coder-6.7B-instruct | https://hf.co/deepseek-ai/deepseek-coder-6.7b-instruct |
| DS-Coder-33B-instruct | https://hf.co/deepseek-ai/deepseek-coder-33b-instruct |
| DS-Coder-V2-Lite-Instruct | https://hf.co/deepseek-ai/DeepSeek-Coder-V2-Lite-Instruct |
| DS-Coder-V2-Instruct | https://hf.co/deepseek-ai/DeepSeek-Coder-V2-Instruct |
| Starcoder2-15B-Instruct-v0.1 | https://hf.co/bigcode/starcoder2-15b-instruct-v0.1 |
| CodeStral-22B-v0.1 | https://hf.co/mistralai/Codestral-22B-v0.1 |
| Yi-Coder-1.5B-Chat | https://hf.co/01-ai/Yi-Coder-1.5B-Chat |
| Yi-Coder-9B-Chat | https://hf.co/01-ai/Yi-Coder-9B-Chat |

Table 15: All artifacts released and used in this section.

表 15:Instruct 节产物链接.

V2-Lite-Instruct, in code generation tasks across eight programming languages. Both Qwen2.5-Coder-7B-Instruct and Qwen2.5-Coder-14B-Instruct even surpass larger models, like CodeStral-22B and DS-Coder-33B-Instruct (which have over 20 billion parameters), underscoring their strong code generation capabilities across multiple languages. Our Qwen2.5-Coder-32B-Instruct model achieves comparable performance to the DS-Coder-V2-

7B/14B-Instruct 甚至超过 20B+ 的 CodeStral-22B 与 DS-Coder-33B-Instruct; 32B-Instruct 与 DS-Coder-V2-

<!-- page 22 of 32 -->

Technical Report

<table><tr><td rowspan="2">Model</td><td rowspan="2">Size</td><td colspan="2">HumanEval</td><td colspan="2">MBPP</td><td colspan="2">BigCodeBench</td><td rowspan="2">LiveCodeBench Pass@1</td></tr><tr><td>HE</td><td>HE+</td><td>MBPP</td><td>MBPP+</td><td>Full</td><td>Hard</td></tr><tr><td colspan="9">0.5B+ Models</td></tr><tr><td>Qwen2.5-Coder-0.5B-Instruct</td><td>0.5B</td><td>61.6</td><td>57.3</td><td>52.4</td><td>43.7</td><td>11.1</td><td>1.4</td><td>2.0</td></tr><tr><td colspan="9">1B+ Models</td></tr><tr><td>DS-Coder-1.3B-Instruct</td><td>1.3B</td><td>65.9</td><td>60.4</td><td>65.3</td><td>54.8</td><td>22.8</td><td>3.4</td><td>5.1</td></tr><tr><td>Yi-Coder-1.5B-Chat</td><td>1.5B</td><td>69.5</td><td>64.0</td><td>65.9</td><td>57.7</td><td>23.8</td><td>11.5</td><td>4.8</td></tr><tr><td>Qwen2.5-Coder-1.5B-Instruct</td><td>1.5B</td><td>70.7</td><td>66.5</td><td>69.2</td><td>59.4</td><td>32.5</td><td>6.8</td><td>6.1</td></tr><tr><td colspan="9">3B+ Models</td></tr><tr><td>Qwen2.5-Coder-3B-Instruct</td><td>3B</td><td>84.1</td><td>80.5</td><td>73.6</td><td>62.4</td><td>35.8</td><td>14.2</td><td>10.8</td></tr><tr><td colspan="9">6B+ Models</td></tr><tr><td>CodeLlama-7B-Instruct</td><td>7B</td><td>40.9</td><td>33.5</td><td>54.0</td><td>44.4</td><td>21.9</td><td>3.4</td><td>7.1</td></tr><tr><td>DS-Coder-6.7B-Instruct</td><td>6.7B</td><td>74.4</td><td>71.3</td><td>74.9</td><td>65.6</td><td>35.5</td><td>10.1</td><td>15.5</td></tr><tr><td>CodeQwen1.5-7B-Chat</td><td>7B</td><td>83.5</td><td>78.7</td><td>77.7</td><td>67.2</td><td>39.6</td><td>18.9</td><td>7.9</td></tr><tr><td>Yi-Coder-9B-Chat</td><td>9B</td><td>82.3</td><td>74.4</td><td>82.0</td><td>69.0</td><td>38.1</td><td>11.5</td><td>17.2</td></tr><tr><td>DS-Coder-V2-Lite-Instruct</td><td>2.4/16B</td><td>81.1</td><td>75.6</td><td>82.8</td><td>70.4</td><td>36.8</td><td>16.2</td><td>16.3</td></tr><tr><td>Qwen2.5-Coder-7B-Instruct</td><td>7B</td><td>88.4</td><td>84.1</td><td>83.5</td><td>71.7</td><td>41.0</td><td>18.2</td><td>18.2</td></tr><tr><td colspan="9">13B+ Models</td></tr><tr><td>CodeLlama-13B-Instruct</td><td>13B</td><td>40.2</td><td>32.3</td><td>60.3</td><td>51.1</td><td>28.5</td><td>9.5</td><td>6.1</td></tr><tr><td>Starcoder2-15B-Instruct-v0.1</td><td>15B</td><td>67.7</td><td>60.4</td><td>78.0</td><td>65.1</td><td>37.2</td><td>11.5</td><td>12.1</td></tr><tr><td>Qwen2.5-Coder-14B-Instruct</td><td>14B</td><td>89.6</td><td>87.2</td><td>86.2</td><td>72.8</td><td>48.4</td><td>22.2</td><td>23.4</td></tr><tr><td colspan="9">20B+ Models</td></tr><tr><td>CodeLlama-34B-Instruct</td><td>34B</td><td>48.2</td><td>40.2</td><td>61.1</td><td>50.5</td><td>29.0</td><td>8.8</td><td>8.4</td></tr><tr><td>CodeStral-22B-v0.1</td><td>22B</td><td>81.1</td><td>73.2</td><td>78.2</td><td>62.2</td><td>41.8</td><td>16.9</td><td>22.6</td></tr><tr><td>DS-Coder-33B-Instruct</td><td>33B</td><td>81.1</td><td>75.0</td><td>80.4</td><td>70.1</td><td>42.0</td><td>17.6</td><td>21.3</td></tr><tr><td>CodeLlama-70B-Instruct</td><td>70B</td><td>72.0</td><td>65.9</td><td>77.8</td><td>64.6</td><td>40.7</td><td>11.5</td><td>3.3</td></tr><tr><td>DS-Coder-V2-Instruct</td><td>21/236B</td><td>85.4</td><td>82.3</td><td>89.4</td><td>75.1</td><td>48.2</td><td>24.3</td><td>27.9</td></tr><tr><td>Qwen2.5-Coder-32B-Instruct</td><td>32B</td><td>92.7</td><td>87.2</td><td>90.2</td><td>75.1</td><td>49.6</td><td>27.0</td><td>31.4</td></tr><tr><td colspan="9">Closed-APIs</td></tr><tr><td>Claude-3.5-Sonnet-20240620</td><td>-</td><td>89.0</td><td>81.1</td><td>87.6</td><td>72.0</td><td>45.3</td><td>25.7</td><td>32.1</td></tr><tr><td>Claude-3.5-Sonnet-20241022</td><td>-</td><td>92.1</td><td>86.0</td><td>91.0</td><td>74.6</td><td>45.3</td><td>23.6</td><td>31.6</td></tr><tr><td>GPT-4o-mini-2024-07-18</td><td>-</td><td>87.8</td><td>84.8</td><td>86.0</td><td>72.2</td><td>46.9</td><td>23.6</td><td>28.3</td></tr><tr><td>GPT-4o-2024-08-06</td><td>-</td><td>92.1</td><td>86.0</td><td>86.8</td><td>72.5</td><td>50.1</td><td>25.0</td><td>34.6</td></tr><tr><td>o1-mini</td><td>-</td><td>97.6</td><td>90.2</td><td>93.9</td><td>78.3</td><td>46.3</td><td>23.0</td><td>60.0</td></tr><tr><td>o1-preview</td><td>-</td><td>95.1</td><td>88.4</td><td>93.4</td><td>77.8</td><td>49.3</td><td>27.7</td><td>43.1</td></tr></table>

Table 16: The performance of different instruct models on code generation by HumanEval, MBPP, bigcodebench and livecodebench. For bigcodebench here, we report "instruct" tasks score.

表 16:Instruct 代码生成主表. LiveCodeBench 以本表为准.

Instruct model with only 32 billion parameters, bringing it very close to the performance of several closed-source APIs.

Instruct 仅用 32B 参数即接近 DS-Coder-V2-Instruct, 并逼近若干闭源 API.

**McEval** To comprehensively assess the code generation capabilities of the Qwen2.5-Coder series models across a broader range of programming languages, we evaluated them on the McEval benchmark (Chai et al., 2024), which spans 40 programming languages and includes 16,000 test cases. As shown in Figure 7, the Qwen2.5-Coder-32B-Instruct model excels when compared to other open-source models on the McEval benchmark, particularly across a wide range of programming languages.

**McEval** 覆盖 40 种语言, 16,000 测例. Figure 7: 32B-Instruct 在开源对照中突出.

**MdEval** Qwen2.5-Coder is further evaluated on the comprehensive multilingual code debugging benchmark MdEval (Liu et al., 2024b) across 18 languages. Compared to the multilingual code generation benchmark McEval (Chai et al., 2024), MdEval provides the buggy code with example test cases (1.2K samples) to LLM for generating the correct code. Figure 8 demonstrates that the Qwen2.5-Coder-32B-Instruct achieves a comparable or better performance even compared to LLMs with larger model sizes.

**MdEval** 18 语言调试基准, 约 1.2K 带 bug 样本. Figure 8: 32B-Instruct 可比甚至优于更大模型.

**Human Preference Alignment** To evaluate the alignment performance of Qwen2.5-Coder-32B-Instruct with the human preferences, we adopted an internal annotated evaluation benchmark called CodeArena, including nearly 400 human-curated samples. Similar to

**人类偏好对齐** 内部基准 CodeArena, 近 400 条人工样本.

<!-- page 23 of 32 -->

Technical Report

<table><tr><td>Model</td><td>Size</td><td>Python</td><td>Java</td><td>C++</td><td>C#</td><td>TS</td><td>JS</td><td>PHP</td><td>Bash</td><td>Average</td></tr><tr><td colspan="11">0.5B+ Models</td></tr><tr><td>Qwen2.5-Coder-0.5B-Instruct</td><td>0.5B</td><td>62.8</td><td>46.2</td><td>43.5</td><td>62.7</td><td>50.3</td><td>50.3</td><td>52.8</td><td>27.8</td><td>49.6</td></tr><tr><td colspan="11">1B+ Models</td></tr><tr><td>DS-Coder-1.3B-Instruct</td><td>1.3B</td><td>65.2</td><td>51.9</td><td>45.3</td><td>55.1</td><td>59.7</td><td>52.2</td><td>45.3</td><td>12.7</td><td>48.4</td></tr><tr><td>Yi-Coder-1.5B-Chat</td><td>1.5B</td><td>67.7</td><td>51.9</td><td>49.1</td><td>57.6</td><td>57.9</td><td>59.6</td><td>52.2</td><td>19.0</td><td>51.9</td></tr><tr><td>Qwen2.5-Coder-1.5B-Instruct</td><td>1.5B</td><td>71.2</td><td>55.7</td><td>50.9</td><td>64.6</td><td>61.0</td><td>62.1</td><td>59.0</td><td>29.1</td><td>56.7</td></tr><tr><td colspan="11">3B+ Models</td></tr><tr><td>Qwen2.5-Coder-3B-Instruct</td><td>3B</td><td>83.5</td><td>74.7</td><td>68.3</td><td>78.5</td><td>79.9</td><td>75.2</td><td>73.3</td><td>43.0</td><td>72.1</td></tr><tr><td colspan="11">6B+ Models</td></tr><tr><td>CodeLlama-7B-Instruct</td><td>7B</td><td>34.8</td><td>30.4</td><td>31.1</td><td>21.6</td><td>32.7</td><td>-</td><td>28.6</td><td>10.1</td><td>-</td></tr><tr><td>DS-Coder-6.7B-Instruct</td><td>6.7B</td><td>78.6</td><td>68.4</td><td>63.4</td><td>72.8</td><td>67.2</td><td>72.7</td><td>68.9</td><td>36.7</td><td>66.1</td></tr><tr><td>CodeQwen1.5-7B-Chat</td><td>7B</td><td>84.1</td><td>73.4</td><td>74.5</td><td>77.8</td><td>71.7</td><td>75.2</td><td>70.8</td><td>39.2</td><td>70.8</td></tr><tr><td>Yi-Coder-9B-Chat</td><td>9B</td><td>85.4</td><td>76.0</td><td>67.7</td><td>76.6</td><td>72.3</td><td>78.9</td><td>72.1</td><td>45.6</td><td>71.8</td></tr><tr><td>DS-Coder-V2-Lite-Instruct</td><td>2.4/16B</td><td>81.1</td><td>76.6</td><td>75.8</td><td>76.6</td><td>80.5</td><td>77.6</td><td>74.5</td><td>43.0</td><td>73.2</td></tr><tr><td>Qwen2.5-Coder-7B-Instruct</td><td>7B</td><td>87.8</td><td>76.5</td><td>75.6</td><td>80.3</td><td>81.8</td><td>83.2</td><td>78.3</td><td>48.7</td><td>76.5</td></tr><tr><td colspan="11">13B+ Models</td></tr><tr><td>CodeLlama-13B-Instruct</td><td>13B</td><td>42.7</td><td>40.5</td><td>42.2</td><td>24.0</td><td>39.0</td><td>-</td><td>32.3</td><td>13.9</td><td>-</td></tr><tr><td>Starcoder2-15B-Instruct-v0.1</td><td>15B</td><td>68.9</td><td>53.8</td><td>50.9</td><td>62.7</td><td>57.9</td><td>59.6</td><td>53.4</td><td>24.7</td><td>54.0</td></tr><tr><td>Qwen2.5-Coder-14B-Instruct</td><td>14B</td><td>89.0</td><td>79.7</td><td>85.1</td><td>84.2</td><td>86.8</td><td>84.5</td><td>80.1</td><td>47.5</td><td>79.6</td></tr><tr><td colspan="11">20B+ Models</td></tr><tr><td>CodeLlama-34B-Instruct</td><td>34B</td><td>41.5</td><td>43.7</td><td>45.3</td><td>31.0</td><td>40.3</td><td>-</td><td>36.6</td><td>19.6</td><td>-</td></tr><tr><td>CodeStral-22B-v0.1</td><td>22B</td><td>81.1</td><td>63.3</td><td>65.2</td><td>43.7</td><td>68.6</td><td>-</td><td>68.9</td><td>42.4</td><td>-</td></tr><tr><td>DS-Coder-33B-Instruct</td><td>33B</td><td>79.3</td><td>73.4</td><td>68.9</td><td>74.1</td><td>67.9</td><td>73.9</td><td>72.7</td><td>43.0</td><td>69.2</td></tr><tr><td>CodeLlama-70B-Instruct</td><td>70B</td><td>67.8</td><td>58.2</td><td>53.4</td><td>36.7</td><td>39.0</td><td>-</td><td>58.4</td><td>29.7</td><td>-</td></tr><tr><td>DS-Coder-V2-Instruct</td><td>21/236B</td><td>90.2</td><td>82.3</td><td>84.8</td><td>82.3</td><td>83.0</td><td>84.5</td><td>79.5</td><td>52.5</td><td>79.9</td></tr><tr><td>Qwen2.5-Coder-32B-Instruct</td><td>32B</td><td>92.7</td><td>80.4</td><td>79.5</td><td>82.9</td><td>86.8</td><td>85.7</td><td>78.9</td><td>48.1</td><td>79.4</td></tr><tr><td colspan="11">Closed-APIs</td></tr><tr><td>Claude-3.5-Sonnet-20240620</td><td>-</td><td>89.6</td><td>86.1</td><td>82.6</td><td>85.4</td><td>84.3</td><td>84.5</td><td>80.7</td><td>48.1</td><td>80.2</td></tr><tr><td>Claude-3.5-Sonnet-20241022</td><td>-</td><td>93.9</td><td>86.7</td><td>88.2</td><td>87.3</td><td>88.1</td><td>91.3</td><td>82.6</td><td>52.5</td><td>83.8</td></tr><tr><td>GPT-4o-mini-2024-07-18</td><td>-</td><td>87.2</td><td>75.9</td><td>77.6</td><td>79.7</td><td>79.2</td><td>81.4</td><td>75.2</td><td>43.7</td><td>75.0</td></tr><tr><td>GPT-4o-2024-08-06</td><td>-</td><td>90.9</td><td>83.5</td><td>76.4</td><td>81.0</td><td>83.6</td><td>90.1</td><td>78.9</td><td>48.1</td><td>79.1</td></tr><tr><td>o1-mini</td><td>-</td><td>95.7</td><td>90.5</td><td>93.8</td><td>77.2</td><td>91.2</td><td>92.5</td><td>84.5</td><td>55.1</td><td>85.1</td></tr><tr><td>o1-preview</td><td>-</td><td>96.3</td><td>88.0</td><td>91.9</td><td>84.2</td><td>90.6</td><td>93.8</td><td>90.1</td><td>47.5</td><td>85.3</td></tr></table>

Table 17: The performance of different models on instruct format MultiPL-E.

表 17:Instruct 版 MultiPL-E.

Chatbot Arena (Chiang et al., 2024), we use CodeArena to emulate user code-related prompts in realistic environments. We use GPT-4o as the evaluation model for preference alignment, employing an "A vs. B win" evaluation method, which measures the percentage of instances in the test set where the score of A exceeds the score of B. The results in Figure 9 demonstrate the advantage of Qwen2.5-Coder-32B-Instruct in preference alignment.

仿 Chatbot Arena, 用 GPT-4o 做 A vs B win. Figure 9 显示 32B-Instruct 偏好对齐优势.

> **回看:** 用 GPT-4o 当裁判, 会不会偏向「像 GPT」的回答?
> 正文明确 CodeArena 用 GPT-4o 做偏好裁判; 这是 LLM-as-a-judge 的固有风险, 报告未另做人类复核对照, 读 Figure 9 时把裁判模型记上.


### 7.2 Code Reasoning 代码推理

To evaluate the code reasoning capabilities of the Qwen2.5-Coder series instruct models, we conducted an assessment on the CRUXEval (Gu et al., 2024) dataset. As shown in Table 18, the Qwen2.5-Coder-7B-Instruct model achieved Input-CoT and Output-CoT accuracies of 65.8% and 65.9%, respectively—demonstrating a substantial improvement over the DS-Coder-V2-Lite-Instruct model, with gains of 12.8% in Input-CoT accuracy and 13.0% in Output-CoT accuracy. Additionally, the Qwen2.5-Coder-7B-Instruct model outperformed larger models, including CodeStral-22B and DS-Coder-33B-Instruct, highlighting its advanced code reasoning capabilities despite its smaller size. Notably, our Qwen2.5-Coder-32B-Instruct model achieved accuracies of 75.2% and 83.4% on Input-CoT and Output-CoT, respectively, significantly outperforming other open-source code models (including DS-Coder-V2-Instruct) and underscoring its robust performance in code reasoning.

Table 18: 7B-Instruct Input/Output-CoT 65.8% / 65.9%, 相对 DS-Coder-V2-Lite-Instruct 约 +12.8 / +13.0; 32B-Instruct 75.2% / 83.4%.

Figure 10 illustrates the relationship between model sizes and code reasoning capabilities. The Qwen2.5-Coder instruct models stand out for delivering superior code reasoning

Figure 10 展示规模与代码推理关系; Qwen2.5-Coder Instruct 以更少参数给出更强推理.

<!-- page 24 of 32 -->

Technical Report

![Chart block](images/p23-figure-7-the-mceval-performance-of-qwen2-5-coder-32b.png)

Figure 7: The McEval Performance of Qwen2.5-Coder-32B-Instruct compared with popular1 open-source large code models with similar size.

图 7｜McEval:32B-Instruct 与同规模开源对照.

performance with the fewest parameters, surpassing the results of other open-source large language models by a significant margin.

### 7.3 Code Editing 代码编辑

**Aider** Aider<sup>9</sup> has created a code editing benchmark designed to quantitatively measure its collaboration with large language models (LLMs). Drawing from a set of 133 Python exercises sourced from Exercism<sup>10</sup>, the benchmark tests the ability of Aider and LLMs to interpret natural language programming requests and translate them into executable code that successfully passes unit tests. This assessment goes beyond evaluating raw coding proficiency; it also examines how effectively LLMs can edit existing code and format those modifications for seamless integration with Aider's system, ensuring that local source files can be updated without issues. The comprehensive nature of this benchmark reflects both the technical aptitude of the LLMs and their consistency in task completion. Table 19 highlights the performance of several language models in the Code Editing task. Among these models, Qwen2.5-Coder-7B-Instruct exhibits exceptional code repair capabilities. Despite its relatively modest scale of 7 billion parameters, it achieves an impressive PASS@1 accuracy of 51.9%, significantly outperforming comparable models. Remarkably, it also surpasses larger models such as CodeStral-22B and DS-Coder-33B-Instruct , highlighting

**Aider** 用 Exercism 的 133 道 Python 题测自然语言请求→可过单测的编辑, 并检查与 Aider 系统的格式对接. 正文写 7B-Instruct PASS@1 51.9%.

> **停一下:** 正文 51.9% 和 Table 19 对得上吗?
> Table 19 里 7B-Instruct 是 Pass@1 55.6, Pass@2 68.4; 51.9 恰好是 DS-Coder-V2-Instruct 的 Pass@1. 正文疑似张冠李戴, 以表为准.


<small><span class="docvortex-page-footnote" data-block-type="page_footnote" style="color:#6b7280"><sup>9</sup>[https://github.com/paul-gauthier/aider](https://github.com/paul-gauthier/aider)</span></small>
<small><span class="docvortex-page-footnote" data-block-type="page_footnote" style="color:#6b7280"><sup>10</sup>[https://github.com/exercism/python](https://github.com/exercism/python)</span></small>

<!-- page 25 of 32 -->

Technical Report

![Chart block](images/p24-1-figure-8-the-mdeval-performance-of-qwen2-5-coder-32b.png)

1 Figure 8: The MdEval Performance of Qwen2.5-Coder-32B-Instruct compared with popular open-source large code models with similar size.

图 8｜MdEval:32B-Instruct 对照.

![Chart block](images/p24-figure-9-the-codearena-performance-of-qwen2-5-coder-32b.png)

Figure 9: The CodeArena Performance of Qwen2.5-Coder-32B-Instruct compared with1 popular open-source large code models with similar size.

图 9｜CodeArena 偏好对齐.

its remarkable efficiency and effectiveness in code editing tasks. Our Qwen2.5-Coder-32B-Instruct model achieves even higher accuracy, with Pass@1 and Pass@2 rates reaching 60.9% and 73.7%, respectively.

32B-Instruct: Pass@1 60.9%, Pass@2 73.7%(与 Table 19 一致).

**CodeEditorBench** An effective code assistant must excel in generating code based on given specifications, as well as in modifying or debugging existing code to meet evolving requirements or resolve issues. In evaluating Qwen2.5-Coders proficiency in code modification tasks, we focused on the CodeEditorBench (Guo et al., 2024b) suite, which assesses performance across four key dimensions: Debugging, Translation, Switching, and Polishing. We employed the same evaluation approach used in the original paper, relying on win rate as the metric for overall performance across diverse problem types. The win rate was computed for each problem category and then averaged across all categories to obtain the overall score. The results in Figure 11 show that Qwen2.5-Coder-32B-Instruct achieves a win rate comparable to DS-Coder-V2-Instruct (86.2% win rate), which features a significantly larger 236 billion parameter scale.

**CodeEditorBench** 四维: Debugging, Translation, Switching, Polishing; 指标为各类 win rate 再平均. Figure 11: 32B-Instruct 的 win rate 可比参数量大得多的 DS-Coder-V2-Instruct(86.2%).

<!-- page 26 of 32 -->

Technical Report

<table><tr><td rowspan="2">Model</td><td rowspan="2">Size</td><td colspan="2">CRUXEval</td></tr><tr><td>Input-CoT</td><td>Output-CoT</td></tr><tr><td colspan="4">0.5B+ Models</td></tr><tr><td>Qwen2.5-Coder-0.5B-Instruct</td><td>0.5B</td><td>33.9</td><td>27.8</td></tr><tr><td colspan="4">1B+ Models</td></tr><tr><td>DS-Coder-1.3B-Instruct</td><td>1.3B</td><td>12.9</td><td>28.1</td></tr><tr><td>Yi-Coder-1.5B-Chat</td><td>1.5B</td><td>19.9</td><td>24.9</td></tr><tr><td>Qwen2.5-Coder-1.5B-Instruct</td><td>1.5B</td><td>45.4</td><td>37.5</td></tr><tr><td colspan="4">3B+ Models</td></tr><tr><td>Qwen2.5-Coder-3B-Instruct</td><td>3B</td><td>53.2</td><td>56.0</td></tr><tr><td colspan="4">6B+ Models</td></tr><tr><td>CodeLlama-7B-Instruct</td><td>7B</td><td>36.1</td><td>36.2</td></tr><tr><td>DS-Coder-6.7B-Instruct</td><td>6.7B</td><td>42.6</td><td>45.1</td></tr><tr><td>CodeQwen1.5-7B-Chat</td><td>7B</td><td>44.0</td><td>38.8</td></tr><tr><td>Yi-Coder-9B-Chat</td><td>9B</td><td>47.5</td><td>55.6</td></tr><tr><td>DS-Coder-V2-Lite-Instruct</td><td>2.4/16B</td><td>53.0</td><td>52.9</td></tr><tr><td>Qwen2.5-Coder-7B-Instruct</td><td>7B</td><td>65.8</td><td>65.9</td></tr><tr><td colspan="4">13B+ Models</td></tr><tr><td>CodeLlama-13B-Instruct</td><td>13B</td><td>47.5</td><td>41.1</td></tr><tr><td>Starcoder2-15B-Instruct-v0.1</td><td>15B</td><td>45.5</td><td>50.9</td></tr><tr><td>Qwen2.5-Coder-14B-Instruct</td><td>14B</td><td>69.5</td><td>79.5</td></tr><tr><td colspan="4">20B+ Models</td></tr><tr><td>CodeLlama-34B-Instruct</td><td>34B</td><td>48.5</td><td>47.1</td></tr><tr><td>CodeStral-22B-v0.1</td><td>22B</td><td>61.3</td><td>63.5</td></tr><tr><td>DS-Coder-33B-Instruct</td><td>33B</td><td>47.3</td><td>50.6</td></tr><tr><td>CodeLlama-70B-Instruct</td><td>70B</td><td>56.5</td><td>57.8</td></tr><tr><td>DS-Coder-V2-Instruct</td><td>21/236B</td><td>70.0</td><td>75.1</td></tr><tr><td>Qwen2.5-Coder-32B-Instruct</td><td>32B</td><td>75.2</td><td>83.4</td></tr><tr><td colspan="4">Closed-APIs</td></tr><tr><td>Claude-3.5-Sonnet-20240620</td><td>-</td><td>75.5</td><td>81.8</td></tr><tr><td>Claude-3.5-Sonnet-20241022</td><td>-</td><td>84.4</td><td>87.2</td></tr><tr><td>GPT-4o-mini-2024-07-18</td><td>-</td><td>67.5</td><td>78.4</td></tr><tr><td>GPT-4o-2024-08-06</td><td>-</td><td>78.6</td><td>89.2</td></tr><tr><td>o1-mini</td><td>-</td><td>91.6</td><td>96.2</td></tr><tr><td>o1-preview</td><td>-</td><td>86.5</td><td>81.4</td></tr></table>

Table 18: The CRUXEval performance of different instruct models, with Input-CoT and Output-CoT settings.

表 18:Instruct 的 CRUXEval.

### 7.4 Text-to-SQL Text-to-SQL

SQL is one of the essential tools in daily software development and production, but its steep learning curve often hinders free interaction between non-programming experts and databases. To address this issue, the Text-to-SQL task was introduced, aiming for models to automatically map natural language questions to structured SQL queries. Previous improvements in Text-to-SQL focused primarily on structure-aware learning, domainspecific pre-training, and sophisticated prompt designs.

Thanks to the use of finely crafted synthetic data during both pre-training and fine-tuning, we significantly enhanced Qwen2.5-Coder's capability in Text-to-SQL tasks. We selected two well-known benchmarks, Spider (Yu et al., 2018) and BIRD (Li et al., 2024a), for comprehensive evaluation. To ensure a fair comparison between Qwen2.5-Coder and other open-source language models on this task, we used a unified prompt template as input, following the work of Chang & Fosler-Lussier (2023). The evaluation prompt consists of table representations aligned with database instructions, examples of table content, optional additional knowledge, and natural language questions. This standardized prompt template minimizes biases that may arise from prompt variations. As shown in Figure 12, Qwen2.5-Coder outperforms other code models of the same size on the Text-to-SQL task.

SQL 学习曲线陡. 借助预训练与微调中的精细合成数据抬 Text-to-SQL. 评 Spider 与 BIRD, 统一 prompt(表结构, 样例行, 可选知识, 自然语言问题). Figure 12: 同规模对照中领先.

<!-- page 27 of 32 -->

Technical Report

![Chart block](images/p26-figure-10-the-relationship-between-model-sizes-and-code.png)

Figure 10: The relationship between model sizes and code reasoning capabilities. The x-axis represents the parameter sizes of different models, and the y-axis indicates the CRUXEval-O (CoT) scores respectively.

图 10｜模型规模 vs CRUXEval-O (CoT).

![Chart block](images/p26-figure-11-the-evaluation-results-on-codeeditbench.png)

Figure 11: The evaluation results on CodeEditBench.

图 11｜CodeEditorBench / CodeEditBench 结果.

![Chart block](images/p26-figure-12-the-text-to-sql-evaluation-on-various.png)

Figure 12: The text-to-SQL evaluation on various instruct code models.

图 12｜Text-to-SQL 对照.

![Chart block](images/p26-1-figure-13-the-table-understanding-evaluation-on.png)

1 Figure 13: The table understanding evaluation on TableBench.

图 13｜TableBench 表格理解.

<!-- page 28 of 32 -->

Technical Report

<table><tr><td rowspan="2">Model</td><td rowspan="2">Size</td><td colspan="2">Aider</td></tr><tr><td>Pass@1</td><td>Pass@2</td></tr><tr><td colspan="4">0.5B+ Models</td></tr><tr><td>Qwen2.5-Coder-0.5B-Instruct</td><td>0.5B</td><td>14.3</td><td>14.3</td></tr><tr><td colspan="4">1B+ Models</td></tr><tr><td>DS-Coder-1.3B-Instruct</td><td>1.3B</td><td>18.0</td><td>18.8</td></tr><tr><td>Yi-Coder-1.5B-Chat</td><td>1.5B</td><td>17.3</td><td>17.3</td></tr><tr><td>Qwen2.5-Coder-1.5B-Instruct</td><td>1.5B</td><td>28.6</td><td>31.6</td></tr><tr><td colspan="4">3B+ Models</td></tr><tr><td>Qwen2.5-Coder-3B-Instruct</td><td>3B</td><td>33.8</td><td>39.1</td></tr><tr><td colspan="4">6B+ Models</td></tr><tr><td>CodeLlama-7B-Instruct</td><td>7B</td><td>1.5</td><td>1.5</td></tr><tr><td>DS-Coder-6.7B-Instruct</td><td>6.7B</td><td>37.6</td><td>44.4</td></tr><tr><td>CodeQwen1.5-7B-Chat</td><td>7B</td><td>24.8</td><td>38.3</td></tr><tr><td>Yi-Coder-9B-Chat</td><td>9B</td><td>45.9</td><td>54.1</td></tr><tr><td>DS-Coder-V2-Lite-Instruct</td><td>2.4/16B</td><td>44.4</td><td>52.6</td></tr><tr><td>Qwen2.5-Coder-7B-Instruct</td><td>7B</td><td>55.6</td><td>68.4</td></tr><tr><td colspan="4">13B+ Models</td></tr><tr><td>CodeLlama-13B-Instruct</td><td>13B</td><td>1.5</td><td>1.5</td></tr><tr><td>Qwen2.5-Coder-14B-Instruct</td><td>14B</td><td>58.6</td><td>69.2</td></tr><tr><td colspan="4">20B+ Models</td></tr><tr><td>CodeLlama-34B-Instruct</td><td>34B</td><td>1.5</td><td>1.5</td></tr><tr><td>CodeStral-22B-v0.1</td><td>22B</td><td>36.8</td><td>51.1</td></tr><tr><td>DS-Coder-33B-Instruct</td><td>33B</td><td>50.4</td><td>54.5</td></tr><tr><td>CodeLlama-70B-Instruct</td><td>70B</td><td>12.8</td><td>15.0</td></tr><tr><td>DS-Coder-V2-Instruct</td><td>21/236B</td><td>51.9</td><td>73.7</td></tr><tr><td>Qwen2.5-Coder-32B-Instruct</td><td>32B</td><td>60.9</td><td>73.7</td></tr><tr><td colspan="4">Closed-APIs</td></tr><tr><td>Claude-3.5-Sonnet-20240620</td><td>-</td><td>59.4</td><td>66.2</td></tr><tr><td>Claude-3.5-Sonnet-20241022</td><td>-</td><td>71.4</td><td>86.5</td></tr><tr><td>GPT-4o-mini-2024-07-18</td><td>-</td><td>43.6</td><td>55.6</td></tr><tr><td>GPT-4o-2024-08-06</td><td>-</td><td>56.8</td><td>74.4</td></tr><tr><td>o1-mini</td><td>-</td><td>49.6</td><td>70.7</td></tr><tr><td>o1-preview</td><td>-</td><td>69.9</td><td>88.0</td></tr></table>

Table 19: The code editing ability of different instruct models evaluated by Aider benchmark. The whole edit-format was consistently applied across all our experiments.

表 19:Aider 代码编辑. 7B-Instruct 以本表 55.6 / 68.4 为准.

### 7.5 Math Reasoning and General Natural Language 数学与通用自然语言

In this section, we provide a comparative analysis of the performance between our Qwen2.5-Coder series models and the DS-Coder-V2 series models, with a focus on both mathematical computation and general natural language processing tasks. The results in Table 20 highlight the versatility of the Qwen2.5-Coder series, which excels not only in complex coding tasks but also in advanced general-purpose tasks, setting it apart from its competitors.

Table 20 对照 DS-Coder-V2: Qwen2.5-Coder 在复杂代码之外, 数学与通用任务也站得住.

### 7.6 Table Understanding 表格理解

To evaluate the understanding capabilities of structured data, we further evaluate the Qwen2.5-Coder on a comprehensive and complex benchmark TableBench (Wu et al., 2024b), which includes 18 fields within four major categories of table question answering (TableQA) capabilities. We compare Qwen2.5-Coder with other LLMs under the textual chain-of-

TableBench: 18 个字段, 四大类 TableQA. 在 textual CoT (TCoT) 设定下与其他 LLM 比.

<!-- page 29 of 32 -->

Technical Report

| Model | Size | MATH | GSM8K | GaoKao2023en | OlympiadBench | CollegeMath | AIME24 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| DS-Coder-V2-Lite-Instruct | 2.4/16B | 61.0 | 87.6 | 56.1 | 26.4 | 39.8 | 6.7 |
| DS-Coder-V2-Instruct | 21/236B | 74.2 | 94.5 | 65.7 | 37.8 | 45.9 | 6.7 |
| Qwen2.5-Coder-3B-Instruct | 3B | 58.1 | 80.7 | 48.8 | 23.6 | 39.7 | 6.7 |
| Qwen2.5-Coder-7B-Instruct | 7B | 66.8 | 86.7 | 60.5 | 29.8 | 43.5 | 10.0 |
| Qwen2.5-Coder-14B-Instruct | 14B | 66.8 | 94.2 | 66.0 | 40.1 | 47.3 | 10.0 |
| Qwen2.5-Coder-32B-Instruct | 32B | 76.4 | 93.0 | 68.3 | 42.5 | 47.7 | 20.0 |
| Model | Size | AMC23 | MMLU | MMLU-Pro | IFEval | CEval | GPQA |
| DS-Coder-V2-Lite-Instruct | 2.4/16B | 40.4 | 42.5 | 60.6 | 38.6 | 60.1 | 27.6 |
| DS-Coder-V2-Instruct | 21/236B | 52.5 | 76.7 | 65.6 | 40.9 | 73.4 | 44.3 |
| Qwen2.5-Coder-3B-Instruct | 3B | 25.0 | 56.5 | 35.2 | 44.2 | 53.9 | 28.3 |
| Qwen2.5-Coder-7B-Instruct | 7B | 42.5 | 68.7 | 45.6 | 58.6 | 61.4 | 35.6 |
| Qwen2.5-Coder-14B-Instruct | 14B | 50.0 | 71.7 | 55.6 | 66.5 | 66.2 | 36.8 |
| Qwen2.5-Coder-32B-Instruct | 32B | 55.0 | 77.6 | 62.3 | 79.9 | 68.9 | 41.8 |

Table 20: The performance of math and general.

表 20:数学与通用对照.

thought (TCoT) setting. Figure 13 demonstrates that Qwen2.5-Coder-32B-Instruct gets the best performance 45.1 on TableBench.

Figure 13: 32B-Instruct 在 TableBench 上拿到 45.1, 文中写为最佳.

## 8 Discussion: Scaling is All You Need 讨论:Scaling is All You Need

In Figure 14, We present a comparison of different sizes of Qwen2.5-Coder with other open-source LLMs on MBPP-3shot and LiveCodeBench. For the base LLM, we choose MBPP-3shot as the evaluation metric. Our extensive experiments show that MBPP-3shot is more suitable for evaluating base models and correlates well with the actual performance of the models. For the instruction model, we select the latest 4 months of LiveCodeBench (2024.07∼2024.11) questions as the evaluation to strictly avoid test data contamination, truly reflecting the OOD capabilities of the LLM. There is a positive correlation between model size and model performance, and Qwen2.5-Coder has achieved state-of-the-art performance across all sizes, encouraging us to continue exploring larger sizes of code LLM.

Figure 14: Base 用 MBPP-3shot, Instruct 用 LiveCodeBench 近四月题(2024.07–2024.11)防污染. 规模与表现正相关; 各档均 SOTA, 作者据此鼓励继续做更大代码模型.

![Chart block](images/p28-chart.png)

![Chart block](images/p28-figure-14-the-evaluation-results-of-qwen2-5-coder.png)

Figure 14: The evaluation results of Qwen2.5-Coder models with different sizes on MBPP-3shot and LiveCodeBench.

图 14｜各规模在 MBPP-3shot 与 LiveCodeBench 上的表现.

> **对一下:** Discussion 标题写 Scaling is All You Need, 证据只是正相关曲线吗?
> 正文证据是 Figure 14 的规模-分数正相关 + 各档 SOTA; 没有单独的 Scaling Laws 拟合式. 标题是口号, 实证是「越大越好」的对照曲线.


## 9 Conclusion

This work introduces Qwen2.5-Coder, the latest addition to the Qwen series. Built upon Qwen2.5, a top-tier open-source LLM, Qwen2.5-Coder has been developed through extensive pre-training and post-training of Qwen2.5-0.5B/1.5B/3B/7B/14B/32B on large-scale datasets. To ensure the quality of the pre-training data, we have curated a dataset by collecting public code data and extracting high-quality code-related content from web texts, while filtering out low-quality data using advanced classifiers. Additionally, we have constructed a meticulously designed instruction-tuning dataset to transform the base code LLM into a strong coding assistant.

本工作推出 Qwen2.5-Coder, 是 Qwen 系列的最新成员. 它建在顶档开源 LLM Qwen2.5 之上, 对 Qwen2.5-0.5B/1.5B/3B/7B/14B/32B 在大规模数据上做了充分的预训练与后训练. 为保证预训练数据质量, 团队收集公开代码数据, 并从网页文本中抽取高质量代码相关内容, 再用先进分类器滤掉低质数据. 另外还构造了精心设计的指令微调数据, 把 base 代码 LLM 变成强编码助手.

Looking ahead, our research will focus on exploring the impact of scaling up code LLMs in terms of both data size and model size. We will also continue to enhance the reasoning capabilities of these models, aiming to push the boundaries of what code LLMs can achieve.

展望未来, 研究将继续探索从数据规模与模型规模两侧放大代码 LLM 的影响, 并持续增强推理能力, 推动代码 LLM 能力边界.

<!-- page 30 of 32 -->

Technical Report

## References

Josh Achiam, Steven Adler, Sandhini Agarwal, Lama Ahmad, Ilge Akkaya, Florencia Leoni Aleman, Diogo Almeida, Janko Altenschmidt, Sam Altman, Shyamal Anadkat, et al. Gpt-4 technical report. arXiv preprint arXiv:2303.08774, 2023.

Loubna Ben Allal, Raymond Li, Denis Kocetkov, Chenghao Mou, Christopher Akiki, Carlos Munoz Ferrandis, Niklas Muennighoff, Mayank Mishra, Alex Gu, Manan Dey, et al. Santacoder: don't reach for the stars! arXiv preprint arXiv:2301.03988, 2023.

Anthropic. Claude 3.5 sonnet. [https://www.anthropic.com/news/claude-3-5-sonnet](https://www.anthropic.com/news/claude-3-5-sonnet), 2024. 2024.06.21.

Jacob Austin, Augustus Odena, Maxwell Nye, Maarten Bosma, Henryk Michalewski, David Dohan, Ellen Jiang, Carrie Cai, Michael Terry, Quoc Le, et al. Program synthesis with large language models. arXiv preprint arXiv:2108.07732, 2021.

Jinze Bai, Shuai Bai, Yunfei Chu, Zeyu Cui, Kai Dang, Xiaodong Deng, Yang Fan, Wenbin Ge, Yu Han, Fei Huang, et al. Qwen technical report. arXiv preprint arXiv:2309.16609, 2023.

Mohammad Bavarian, Heewoo Jun, Nikolas Tezak, John Schulman, Christine McLeavey, Jerry Tworek, and Mark Chen. Efficient training of language models to fill in the middle. arXiv preprint arXiv:2207.14255, 2022.

Tom B Brown. Language models are few-shot learners. arXiv preprint arXiv:2005.14165, 2020.

Federico Cassano, John Gouwar, Daniel Nguyen, Sydney Nguyen, Luna Phipps-Costin, Donald Pinckney, Ming-Ho Yee, Yangtian Zi, Carolyn Jane Anderson, Molly Q Feldman, et al. Multipl-e: A scalable and extensible approach to benchmarking neural code generation. arXiv preprint arXiv:2208.08227, 2022.

Linzheng Chai, Shukai Liu, Jian Yang, Yuwei Yin, Ke Jin, Jiaheng Liu, Tao Sun, Ge Zhang, Changyu Ren, Hongcheng Guo, et al. Mceval: Massively multilingual code evaluation. arXiv preprint arXiv:2406.07436, 2024.

Shuaichen Chang and Eric Fosler-Lussier. How to prompt llms for text-to-sql: A study in zero-shot, single-domain, and cross-domain settings. arXiv preprint arXiv:2305.11853, 2023.

Mark Chen, Jerry Tworek, Heewoo Jun, Qiming Yuan, Henrique Ponde De Oliveira Pinto, Jared Kaplan, Harri Edwards, Yuri Burda, Nicholas Joseph, Greg Brockman, et al. Evaluating large language models trained on code. arXiv preprint arXiv:2107.03374, 2021.

Wenhu Chen, Ming Yin, Max Ku, Pan Lu, Yixin Wan, Xueguang Ma, Jianyu Xu, Xinyi Wang, and Tony Xia. Theoremqa: A theorem-driven question answering dataset. In Proceedings of the 2023 Conference on Empirical Methods in Natural Language Processing, pp. 7889–7901, 2023.

Wei-Lin Chiang, Lianmin Zheng, Ying Sheng, Anastasios Nikolas Angelopoulos, Tianle Li, Dacheng Li, Hao Zhang, Banghua Zhu, Michael Jordan, Joseph E Gonzalez, et al. Chatbot arena: An open platform for evaluating llms by human preference. arXiv preprint arXiv:2403.04132, 2024.

Peter Clark, Isaac Cowhey, Oren Etzioni, Tushar Khot, Ashish Sabharwal, Carissa Schoenick, and Oyvind Tafjord. Think you have solved question answering? try arc, the ai2 reasoning challenge. arXiv preprint arXiv:1803.05457, 2018.

Karl Cobbe, Vineet Kosaraju, Mohammad Bavarian, Mark Chen, Heewoo Jun, Lukasz Kaiser, Matthias Plappert, Jerry Tworek, Jacob Hilton, Reiichiro Nakano, et al. Training verifiers to solve math word problems. arXiv preprint arXiv:2110.14168, 2021.

<!-- page 31 of 32 -->

Technical Report

Yangruibo Ding, Zijian Wang, Wasi Ahmad, Hantian Ding, Ming Tan, Nihal Jain, Murali Krishna Ramanathan, Ramesh Nallapati, Parminder Bhatia, Dan Roth, et al. Crosscodeeval: A diverse and multilingual benchmark for cross-file code completion. Advances in Neural Information Processing Systems, 36, 2024.

Abhimanyu Dubey, Abhinav Jauhri, Abhinav Pandey, Abhishek Kadian, Ahmad Al-Dahle, Aiesha Letman, Akhil Mathur, Alan Schelten, Amy Yang, Angela Fan, et al. The llama 3 herd of models. arXiv preprint arXiv:2407.21783, 2024.

Zhangyin Feng, Daya Guo, Duyu Tang, Nan Duan, Xiaocheng Feng, Ming Gong, Linjun Shou, Bing Qin, Ting Liu, Daxin Jiang, and Ming Zhou. Codebert: A pre-trained model for programming and natural languages. In Trevor Cohn, Yulan He, and Yang Liu (eds.), Findings of the Association for Computational Linguistics: EMNLP 2020, Online Event, 16-20 November 2020, volume EMNLP 2020 of Findings of ACL, pp. 1536–1547. Association for Computational Linguistics, 2020. doi: 10.18653/V1/2020.FINDINGS-EMNLP.139. URL [https://doi.org/10.18653/v1/2020.findings-emnlp.139](https://doi.org/10.18653/v1/2020.findings-emnlp.139).

Aryo Pradipta Gema, Joshua Ong Jun Leang, Giwon Hong, Alessio Devoto, Alberto Carlo Maria Mancino, Rohit Saxena, Xuanli He, Yu Zhao, Xiaotang Du, Mohammad Reza Ghasemi Madani, et al. Are we done with mmlu? arXiv preprint arXiv:2406.04127, 2024.

Linyuan Gong, Sida Wang, Mostafa Elhoushi, and Alvin Cheung. Evaluation of llms on syntax-aware code fill-in-the-middle tasks. arXiv preprint arXiv:2403.04814, 2024.

Alex Gu, Baptiste Roziere, Hugh Leather, Armando Solar-Lezama, Gabriel Synnaeve, and \` Sida I Wang. Cruxeval: A benchmark for code reasoning, understanding and execution. arXiv preprint arXiv:2401.03065, 2024.

Daya Guo, Qihao Zhu, Dejian Yang, Zhenda Xie, Kai Dong, Wentao Zhang, Guanting Chen, Xiao Bi, Yu Wu, YK Li, et al. Deepseek-coder: When the large language model meets programming–the rise of code intelligence. arXiv preprint arXiv:2401.14196, 2024a.

Jiawei Guo, Ziming Li, Xueling Liu, Kaijing Ma, Tianyu Zheng, Zhouliang Yu, Ding Pan, Yizhi Li, Ruibo Liu, Yue Wang, et al. Codeeditorbench: Evaluating code editing capability of large language models. arXiv preprint arXiv:2404.03543, 2024b.

Dan Hendrycks, Collin Burns, Steven Basart, Andy Zou, Mantas Mazeika, Dawn Song, and Jacob Steinhardt. Measuring massive multitask language understanding. arXiv preprint arXiv:2009.03300, 2020.

Dan Hendrycks, Collin Burns, Saurav Kadavath, Akul Arora, Steven Basart, Eric Tang, Dawn Song, and Jacob Steinhardt. Measuring mathematical problem solving with the math dataset. arXiv preprint arXiv:2103.03874, 2021.

Naman Jain, King Han, Alex Gu, Wen-Ding Li, Fanjia Yan, Tianjun Zhang, Sida Wang, Armando Solar-Lezama, Koushik Sen, and Ion Stoica. Livecodebench: Holistic and contamination free evaluation of large language models for code. arXiv preprint arXiv:2403.07974, 2024.

AQ Jiang, A Sablayrolles, A Mensch, C Bamford, DS Chaplot, D de las Casas, F Bressand, G Lengyel, G Lample, L Saulnier, et al. Mistral 7b (2023). arXiv preprint arXiv:2310.06825, 2023.

Jinyang Li, Binyuan Hui, Ge Qu, Jiaxi Yang, Binhua Li, Bowen Li, Bailin Wang, Bowen Qin, Ruiying Geng, Nan Huo, et al. Can llm already serve as a database interface? a big bench for large-scale database grounded text-to-sqls. Advances in Neural Information Processing Systems, 36, 2024a.

Raymond Li, Loubna Ben Allal, Yangtian Zi, Niklas Muennighoff, Denis Kocetkov, Chenghao Mou, Marc Marone, Christopher Akiki, Jia Li, Jenny Chim, et al. Starcoder: may the source be with you! arXiv preprint arXiv:2305.06161, 2023.

<!-- page 32 of 32 -->

Technical Report

Ziming Li, Qianbo Zang, David Ma, Jiawei Guo, Tianyu Zheng, Xinyao Niu, Xiang Yue, Yue Wang, Jian Yang, Jiaheng Liu, et al. Autokaggle: A multi-agent framework for autonomous data science competitions. arXiv preprint arXiv:2410.20424, 2024b.

Stephanie Lin, Jacob Hilton, and Owain Evans. Truthfulqa: Measuring how models mimic human falsehoods. arXiv preprint arXiv:2109.07958, 2021.

J Liu, CS Xia, Y Wang, and L Zhang. Is your code generated by chatgpt really correct? rigorous evaluation of large language models for code generation. arxiv preprint arxiv: 230501210. 2023, 2023.

Jiaheng Liu, Ken Deng, Congnan Liu, Jian Yang, Shukai Liu, He Zhu, Peng Zhao, Linzheng Chai, Yanan Wu, Ke Jin, et al. M2rc-eval: Massively multilingual repository-level code completion evaluation. arXiv preprint arXiv:2410.21157, 2024a.

Shukai Liu, Linzheng Chai, Jian Yang, Jiajun Shi, He Zhu, Liran Wang, Ke Jin, Wei Zhang, Hualei Zhu, Shuyue Guo, et al. Mdeval: Massively multilingual code debugging. arXiv preprint arXiv:2411.02310, 2024b.

Anton Lozhkov, Raymond Li, Loubna Ben Allal, Federico Cassano, Joel Lamy-Poirier, Nouamane Tazi, Ao Tang, Dmytro Pykhtar, Jiawei Liu, Yuxiang Wei, et al. Starcoder 2 and the stack v2: The next generation. arXiv preprint arXiv:2402.19173, 2024.

Shuai Lu, Nan Duan, Hojae Han, Daya Guo, Seung-won Hwang, and Alexey Svyatkovskiy. Reacc: A retrieval-augmented code completion framework. arXiv preprint arXiv:2203.07722, 2022.

MistralAI. Codestral. [https://mistral.ai/news/codestral](https://mistral.ai/news/codestral), 2024. 2024.05.29.

OpenAI. Gpt-4o. [https://openai.com/index/hello-gpt-4o](https://openai.com/index/hello-gpt-4o), 2024. 2024.05.13.

Bowen Peng, Jeffrey Quesnelle, Honglu Fan, and Enrico Shippole. Yarn: Efficient context window extension of large language models. arXiv preprint arXiv:2309.00071, 2023.

Qwen. Code with codeqwen1.5, April 2024. URL [https://qwenlm.github.io/blog/codeqwen1.5/](https://qwenlm.github.io/blog/codeqwen1.5/).

Rafael Rafailov, Archit Sharma, Eric Mitchell, Stefano Ermon, Christopher D Manning, and Chelsea Finn. Direct preference optimization: Your language model is secretly a reward model. arXiv preprint arXiv:2305.18290, 2023.

Baptiste Roziere, Jonas Gehring, Fabian Gloeckle, Sten Sootla, Itai Gat, Xiaoqing Ellen Tan, Yossi Adi, Jingyu Liu, Romain Sauvestre, Tal Remez, et al. Code llama: Open foundation models for code. arXiv preprint arXiv:2308.12950, 2023.

Keisuke Sakaguchi, Ronan Le Bras, Chandra Bhagavatula, and Yejin Choi. An adversarial winograd schema challenge at scale. arXiv preprint arXiv:1907.10641, 2019.

Tao Sun, Linzheng Chai, Jian Yang, Yuwei Yin, Hongcheng Guo, Jiaheng Liu, Bing Wang, Liqun Yang, and Zhoujun Li. Unicoder: Scaling code large language model via universal code. In Lun-Wei Ku, Andre Martins, and Vivek Srikumar (eds.), Proceedings of the 62nd Annual Meeting of the Association for Computational Linguistics (Volume 1: Long Papers), ACL 2024, Bangkok, Thailand, August 11-16, 2024, pp. 1812–1824. Association for Computational Linguistics, 2024. URL [https://aclanthology.org/2024.acl-long.100](https://aclanthology.org/2024.acl-long.100).

Hugo Touvron, Louis Martin, Kevin Stone, Peter Albert, Amjad Almahairi, Yasmine Babaei, Nikolay Bashlykov, Soumya Batra, Prajjwal Bhargava, Shruti Bhosale, et al. Llama 2: Open foundation and fine-tuned chat models. arXiv preprint arXiv:2307.09288, 2023.

Yuxiang Wei, Zhe Wang, Jiawei Liu, Yifeng Ding, and Lingming Zhang. Magicoder: Empowering code generation with oss-instruct. In Forty-first International Conference on Machine Learning, ICML 2024, Vienna, Austria, July 21-27, 2024. OpenReview.net, 2024. URL [https://openreview.net/forum?id=XUeoOBid3x](https://openreview.net/forum?id=XUeoOBid3x).

Di Wu, Wasi Uddin Ahmad, Dejiao Zhang, Murali Krishna Ramanathan, and Xiaofei Ma. Repoformer: Selective retrieval for repository-level code completion. arXiv preprint arXiv:2403.10059, 2024a.

Xianjie Wu, Jian Yang, Linzheng Chai, Ge Zhang, Jiaheng Liu, Xinrun Du, Di Liang, Daixin Shu, Xianfu Cheng, Tianzhen Sun, et al. Tablebench: A comprehensive and complex benchmark for table question answering. arXiv preprint arXiv:2408.09174, 2024b.

An Yang, Baosong Yang, Binyuan Hui, Bo Zheng, Bowen Yu, Chang Zhou, Chengpeng Li, Chengyuan Li, Dayiheng Liu, Fei Huang, et al. Qwen2 technical report. arXiv preprint arXiv:2407.10671, 2024.

Tao Yu, Rui Zhang, Kai Yang, Michihiro Yasunaga, Dongxu Wang, Zifan Li, James Ma, Irene Li, Qingning Yao, Shanelle Roman, et al. Spider: A large-scale human-labeled dataset for complex and cross-domain semantic parsing and text-to-sql task. arXiv preprint arXiv:1809.08887, 2018.

Zhaojian Yu, Xin Zhang, Ning Shang, Yangyu Huang, Can Xu, Yishujie Zhao, Wenxiang Hu, and Qiufeng Yin. Wavecoder: Widespread and versatile enhancement for code large language models by instruction tuning. In Lun-Wei Ku, Andre Martins, and Vivek Srikumar (eds.), Proceedings of the 62nd Annual Meeting of the Association for Computational Linguistics (Volume 1: Long Papers), ACL 2024, Bangkok, Thailand, August 11-16, 2024, pp. 5140–5153. Association for Computational Linguistics, 2024. doi: 10.18653/V1/2024. ACL-LONG.280. URL [https://doi.org/10.18653/v1/2024.acl-long.280](https://doi.org/10.18653/v1/2024.acl-long.280).

Rowan Zellers, Ari Holtzman, Yonatan Bisk, Ali Farhadi, and Yejin Choi. Hellaswag: Can a machine really finish your sentence? arXiv preprint arXiv:1905.07830, 2019.

Fengji Zhang, Bei Chen, Yue Zhang, Jacky Keung, Jin Liu, Daoguang Zan, Yi Mao, Jian-Guang Lou, and Weizhu Chen. Repocoder: Repository-level code completion through iterative retrieval and generation. arXiv preprint arXiv:2303.12570, 2023.

Lianmin Zheng, Wei-Lin Chiang, Ying Sheng, Siyuan Zhuang, Zhanghao Wu, Yonghao Zhuang, Zi Lin, Zhuohan Li, Dacheng Li, Eric Xing, et al. Judging llm-as-a-judge with mt-bench and chatbot arena. Advances in Neural Information Processing Systems, 36:46595–46623, 2023.

Terry Yue Zhuo, Minh Chien Vu, Jenny Chim, Han Hu, Wenhao Yu, Ratnadira Widyasari, Imam Nur Bani Yusuf, Haolan Zhan, Junda He, Indraneil Paul, et al. Bigcodebench: Benchmarking code generation with diverse function calls and complex instructions. arXiv preprint arXiv:2406.15877, 2024.

32
