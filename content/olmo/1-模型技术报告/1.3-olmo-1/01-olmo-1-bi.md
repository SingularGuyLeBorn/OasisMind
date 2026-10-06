---
title: "OLMo · 对照译稿"
category: "模型库"
tags: ["OLMo", "对照译稿"]
published: true
excerpt: "OLMo 公开材料的逐段中英对照译稿,附读报告时的疑问块."
---
<!-- page 1 of 21 -->

arXiv:2402.00838v4 [cs.CL] 7 Jun 2024

# OLMo: Accelerating the Science of Language Models (加速语言模型的科学研究)

**Dirk Groeneveld**<strong><sup>α</sup></strong>**Iz Beltagy**<strong><sup>α</sup></strong>

**Pete Walsh**<strong><sup>α</sup></strong> **Akshita Bhagia**<strong><sup>α</sup></strong> **Rodney Kinney**<strong><sup>α</sup></strong> **Oyvind Tafjord**<strong><sup>α</sup></strong>

**Ananya Harsh Jha**<strong><sup>α</sup></strong> **Hamish Ivison**<strong><sup>αβ</sup></strong>**Ian Magnusson**<strong><sup>α</sup></strong> **Yizhong Wang** <strong><sup>αβ</sup></strong>

Shane Arora<sup>α</sup> David Atkinson<sup>α</sup> Russell Authur<sup>α</sup> Khyathi Raghavi Chandu **Arman Cohan**<strong><sup>γα</sup></strong>**Jennifer Dumas**<strong><sup>α</sup></strong> **Yanai Elazar**<strong><sup>αβ</sup></strong> **Yuling Gu**<strong><sup>α</sup></strong> **Jack Hessel**<strong><sup>α</sup></strong>**Tushar Khot**<strong><sup>α</sup></strong> **William Merrill**<strong><sup>δ</sup></strong>**Jacob Morrison**<strong><sup>α</sup></strong> **Niklas Muennighoff Aakanksha Naik**<strong><sup>α</sup></strong> **Crystal Nam**<strong><sup>α</sup></strong> **Matthew E. Peters**<strong><sup>α</sup></strong> **Valentina Pyatkin**<strong><sup>αβ</sup></strong> **Abhilasha Ravichander**<strong><sup>α</sup></strong> **Dustin Schwenk**<strong><sup>α</sup></strong>**Saurabh Shah**<strong><sup>α</sup></strong> **Will Smith**<strong><sup>α</sup></strong>Emma Strubell<sup>αµ</sup> Nishant Subramani<sup>α</sup> Mitchell Wortsman

**Pradeep Dasigi**<strong><sup>α</sup></strong> **Nathan Lambert**<strong><sup>α</sup></strong> **Kyle Richardson**<strong><sup>α</sup></strong> **Luke Zettlemoyer**<strong><sup>β</sup></strong>**Jesse Dodge**<strong><sup>α</sup></strong> **Kyle Lo**<strong><sup>α</sup></strong>Luca Soldaini

**Noah A. Smith** <strong><sup>αβ</sup></strong> **Hannaneh Hajishirzi**<strong><sup>αβ</sup></strong>

<sup>α</sup>Allen Institute for Artificial Intelligence <sup>β</sup>University of Washington <sup>γ</sup>Yale University <sup>δ</sup>New York University <sup>µ</sup>Carnegie Mellon University

olmo@allenai.org

## Abstract

Language models (LMs) have become ubiquitous in both NLP research and in commercial product offerings. As their commercial importance has surged, the most powerful models have become closed off, gated behind proprietary interfaces, with important details of their training data, architectures, and development undisclosed. Given the importance of these details in scientifically studying these models, including their biases and potential risks, we believe it is essential for the research community to have access to powerful, truly open LMs. To this end, we have built OLMo, a competitive, truly Open Language **Mo**del, to enable the scientific study of language models. Unlike most prior efforts that have only released model weights and inference code, we release OLMo alongside open training data and training and evaluation code. We hope this release will empower the open research community and inspire a new wave of innovation.

语言模型 (LMs) 已在 NLP 研究与商业产品中无处不在. 随着其商业重要性激增, 最强大的模型却走向封闭, 被锁在专有接口之后, 训练数据, 架构与开发过程等重要细节均不公开. 鉴于这些细节对科学研究这些模型 (包括其偏见与潜在风险) 至关重要, 我们认为研究社区必须能访问强大的, 真正开放的语言模型. 为此, 我们构建了 OLMo —— 一个有竞争力的, 真正开放的语言模型, 以支持对语言模型的科学研究. 不同于多数只发布模型权重与推理代码的先例, 我们随 OLMo 一并发布开放的训练数据以及训练与评测代码. 希望本次发布能赋权开放研究社区, 激发新一轮创新.

## 1 Introduction

Language models have been at the center of NLP technologies for many years (Rosenfeld, 2000; Ben-

gio et al., 2003; Mikolov et al., 2013; Peters et al., 2018; Brown et al., 2020). Recently, due to largescale pretraining and human annotation for alignment, they have become commercially valuable (OpenAI, 2023). However, as their commercial value has increased, the largest models have become gated behind proprietary interfaces, with important details left undisclosed.

语言模型多年来一直是 NLP 技术的核心 (Rosenfeld, 2000; Bengio et al., 2003; Mikolov et al., 2013; Peters et al., 2018; Brown et al., 2020). 近年来, 借助大规模预训练与面向对齐的人工标注, 它们已具备商业价值 (OpenAI, 2023). 然而, 随着商业价值上升, 最大的模型被锁进专有接口, 重要细节不再公开.

We believe that full access to open language models for the research community is critical to the scientific study of these models, their strengths and weaknesses, and their biases and risks. Accordingly, we introduce **OLMo**, a powerful, truly open language model alongside open training data, training and evaluation code, intermediate model checkpoints, and training logs.

我们相信, 让研究社区完整访问开放语言模型, 是科学研究这些模型的能力, 弱点, 偏见与风险的关键. 因此, 我们推出 **OLMo** —— 一个强大的, 真正开放的语言模型, 并随附开放的训练数据, 训练与评测代码, 中间模型 checkpoint 以及训练日志.

Recent LM releases have varied in their degree of openness. For example, Mixtral 8x7B provided model weights and a brief report (Jiang et al., 2024), while LLaMA came with in-depth adaptation training instructions (Touvron et al., 2023b), and Mosaic Pretrained Transformer came with many details, including the dataset distribution, though not the data itself (MosaicML NLP Team,

<!-- page 2 of 21 -->

2023). Falcon’s pretraining data was partially released (Almazrouei et al., 2023), and the most open models—the Pythia suite (Biderman et al., 2023) and BLOOM (BigScience et al., 2022)—released training code, model checkpoints, data, and more.

近期语言模型发布的开放程度不一. 例如, Mixtral 8x7B 只提供了模型权重与一份简要报告 (Jiang et al., 2024); LLaMA 附带了深入的适配训练说明 (Touvron et al., 2023b); Mosaic Pretrained Transformer 给出了包括数据集分布在内的许多细节, 但不包含数据本身 (MosaicML NLP Team, 2023). Falcon 的预训练数据部分公开 (Almazrouei et al., 2023); 而最开放的模型 —— Pythia 套件 (Biderman et al., 2023) 与 BLOOM (BigScience et al., 2022) —— 发布了训练代码, 模型 checkpoint, 数据等更多内容.

With OLMo, we release the whole framework from data to training to evaluation tools: multi-ple training checkpoints across multiple hardware types, training logs, and exact datasets used, with a permissive license. We are not the only team to do this; recent work from LLM360 targets similar goals (Liu et al., 2023). OLMo narrows the gap from their models to state-of-the-art capabilities of models like Llama 2. This project has benefited from lessons learned from all of these previous efforts with their varying degrees of openness, and we believe that a large, diverse population of open models is the best hope for scientific progress on understanding language models and engineering progress on improving their utility.

借助 OLMo, 我们开放了从数据到训练再到评测工具的整个框架: 跨多种硬件类型的多个训练 checkpoint, 训练日志, 使用的确切数据集, 并配以宽松许可证. 这样做的并非只有我们; LLM360 的近期工作有相似目标 (Liu et al., 2023). OLMo 把他们的模型与 Llama 2 等模型最先进能力之间的差距进一步缩小. 本项目受益于所有这些开放程度不一的先例所带来的经验, 我们相信, 规模庞大且多样化的开放模型群体, 是理解语言模型的科学进步与提升其实用性的工程进步的最大希望.

The OLMo framework encompasses the tools and resources required for building and researching language models. For training and modeling, it includes full model weights, training code, training logs, and inference code. The released model includes four variants of our language model at the 7B scale corresponding to different architectures, optimizers, and training hardware, and one model at the 1B scale, all trained on at least 2T tokens. We also release hundreds of intermediate checkpoints available as revisions on HuggingFace. For dataset building and analysis, the full training data used for these models is openly available (Dolma; Soldaini et al., 2024), including code that produces the training data, and tools for analyzing pretraining data (Elazar et al., 2024). For evaluation, we build on Catwalk (Groeneveld et al., 2023) for downstream evaluation and Paloma (Magnusson et al., 2023) for perplexity-based evaluation. For adaptation, we use Open Instruct (Ivison et al., 2023; Wang et al., 2023) to train with instruction and feedback data. Finally, all code and weights are released under the Apache 2.0 License.

OLMo 框架涵盖构建与研究语言模型所需的工具与资源. 训练与建模方面, 包括完整模型权重, 训练代码, 训练日志与推理代码. 发布的模型包含 7B 规模下对应不同架构, 优化器与训练硬件的四个语言模型变体, 以及一个 1B 规模模型, 均在至少 2T token 上训练. 我们还发布了数以百计的中间 checkpoint, 以 HuggingFace revision 形式提供. 数据集构建与分析方面, 这些模型所用的完整训练数据公开可用 (Dolma; Soldaini et al., 2024), 包括生成训练数据的代码与分析预训练数据的工具 (Elazar et al., 2024). 评测方面, 我们在下游评测上基于 Catwalk (Groeneveld et al., 2023), 在基于困惑度的评测上基于 Paloma (Magnusson et al., 2023). 适配方面, 我们使用 Open Instruct (Ivison et al., 2023; Wang et al., 2023) 进行指令与反馈数据训练. 最后, 所有代码与权重均以 Apache 2.0 许可证发布.

With this release, we hope to catalyze research into as-yet poorly understood aspects of these models, for example, the relationship between pretraining data and model capabilities, the impact of design and hyperparameter choices, and various optimization methods and their impact on model training. In addition, we report on the lessons learned

and important details necessary to successfully train language models at this scale.

借助本次发布, 我们希望催化对这些模型尚未被充分理解之处的研究, 例如预训练数据与模型能力之间的关系, 设计与超参选择的影响, 以及各种优化方法及其对模型训练的影响. 此外, 我们还报告了在此规模上成功训练语言模型所习得的经验与关键细节.

## 2 OLMo Framework OLMo 框架

This section describes the OLMo framework, consisting of the OLMo models (Section 2.1), our pre-training dataset, Dolma (Section 2.2), and our evaluation framework (Section 2.4).

本节描述 OLMo 框架, 包括 OLMo 模型 (第 2.1 节), 预训练数据集 Dolma (第 2.2 节), 以及评测框架 (第 2.4 节).

### 2.1 OLMo Model and Architecture OLMo 模型与架构

We adopt a decoder-only transformer architecture based on (Vaswani et al., 2017), and deliver 1B and 7B variants as described in Table 1. Our specific architecture includes several improvements over the vanilla transformer from (Vaswani et al., 2017) following other recent large language models like PaLM (Chowdhery et al., 2022), the LLaMA family (Touvron et al., 2023a,b), OpenLM (Gururangan et al., 2023), and Falcon (Almazrouei et al., 2023). See Table 5 in Appendix A for a comprehensive comparison of our 7B architecture to the similarly-sized models from these other families.

我们采用基于 (Vaswani et al., 2017) 的 decoder-only transformer 架构, 并按 Table 1 给出 1B 与 7B 变体. 具体架构相对 vanilla transformer 做了若干改进, 追随 PaLM (Chowdhery et al., 2022), LLaMA 族 (Touvron et al., 2023a,b), OpenLM (Gururangan et al., 2023) 与 Falcon (Almazrouei et al., 2023) 等近期大模型. 与同尺度模型的完整对照见附录 A 的 Table 5.

We generally select hyperparameters by optimizing for training throughput on our hardware while minimizing the risk of loss spikes and slow divergence. We ablate choices through our in-loop evaluation setting, given available computational sources (Section 2.4). Our main changes over the vanilla transformer architecture can be summarized as follows:

超参选择总体以本机训练吞吐为优, 同时压低 loss spike 与慢发散风险. 在算力允许下用环内评测做消融 (第 2.4 节). 相对 vanilla transformer 的主要改动如下:

1. **No biases.** Following LLaMA, PaLM, and others, we exclude all bias terms from our architecture in order to improve training stability.

1. **无 bias.** 追随 LLaMA, PaLM 等, 去掉全部 bias 项以改善训练稳定性.

2. **Non-parametric layer norm.** We use the non-parametric formulation of layer norm (Ba et al., 2016) in which there is no affine transformation within the norm, i.e., no “adaptive gain" (or bias). We believe this was the safest option and it was also the fastest compared to the other variants we considered: parametric layer norm and RMSNorm (Zhang and Sennrich, 2019).

2. **非参数 layer norm.** 采用无仿射变换的 LN 形式 (Ba et al., 2016), 即无 「adaptive gain」 (或 bias). 相对我们考虑的 parametric LN 与 RMSNorm (Zhang and Sennrich, 2019), 作者认为这最安全, 也最快.

3. **SwiGLU activation function.** Like LLaMA, PaLM, and others we use the SwiGLU activation function (Shazeer, 2020) instead of ReLU, and following LLaMA the activation hidden size is approximately ${ \frac { 8 } { 3 } } d ,$ but increased to the closest multiple of 128 (e.g. 11,008 for our 7B model) to improve throughput.

3. **SwiGLU 激活.** 与 LLaMA, PaLM 等一样用 SwiGLU (Shazeer, 2020) 替代 ReLU; 跟随 LLaMA, 激活隐宽约 $(8/3)d$, 再增到最近的 128 倍数 (例如 7B 为 11,008) 以抬吞吐.

> Section 2.1 第 3 条: 跟随 LLaMA, 激活隐宽约 (8/3)d, 再增到最近的 128 倍数, 7B 例为 11008. 脚注说明 SwiGLU 为 gated, 输出是输入一半, 故输入维为 2×11008=22016. 数字全部来自正文与脚注, 不是外推.

<small><span class="docvortex-page-footnote" data-block-type="page_footnote" style="color:#6b7280"><sup>1</sup>[https://allenai.org/olmo](https://allenai.org/olmo)</span></small>

<small><span class="docvortex-page-footnote" data-block-type="page_footnote" style="color:#6b7280"><sup>2</sup>Since SwiGLU is a “gated" activation function, the output</span></small>

<!-- page 3 of 21 -->

| Size | L | D | H | Tokens | Peak LR | Warmup | Weight Tying | Batch size |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1B | 16 | 2048 | 16 | 2T | 4.0E-4 | 2000 steps | yes | ~4M |
| 7B | 32 | 4086 | 32 | 2.46T | 3.0E-4 | 5000 steps | no | ~4M |

Table 1: OLMo model sizes, number of training tokens, and optimizer settings. In all runs, the optimizer was AdamW, with betas of 0.9 and 0.95, and an epsilon of 1.0E-5. L is number of layers, D is hidden dimension, H is number of attention heads, WD is weight decay.

表 1: OLMo 模型规模, 训练 token 数与优化器设定. 所有 run 使用 AdamW, betas 为 0.9 与 0.95, epsilon 为 1.0E-5. L 为层数, D 为隐维, H 为注意力头数, WD 为 weight decay.

Table 1 写 D=4086, 附录 Table 5 写 Dimension=4096, 两处源文数字不一致. 本文保留原值并标明表号.

> Table 1 明确 Weight Tying: 1B=yes, 7B=no. 正文把它与 L/D/H, peak LR, warmup 一并列为分档设定; 附录 Table 5 也写 OLMo-7B weight tying=no. 机制名可搜 embedding-output weight tying, 但答案必须回到这两张表的分档差异.

4. **Rotary positional embeddings (RoPE).** Like LLaMA, PaLM, and others we replace absolute positional embeddings with rotary positional embeddings (RoPE; Su et al., 2021).

4. **旋转位置编码 (RoPE).** 与 LLaMA, PaLM 等一样, 用 RoPE (Su et al., 2021) 替换绝对位置编码.

5. **Vocabulary.** We use a modified version of the BPE-based tokenizer from GPT-NeoX-20B (Black et al., 2022) with additional tokens for masking personal identifiable information (PII). The final vocabulary size is 50,280. However, to maximize training throughput we increase the size of the corresponding embedding matrix in our model to 50,304 to be a multiple of 128.

5. **词表.** 使用改自 GPT-NeoX-20B (Black et al., 2022) 的 BPE 分词器, 并增加用于掩码个人可识别信息 (PII) 的 token. 最终词表大小 50,280. 为最大化训练吞吐, 把对应 embedding 矩阵扩到 50,304, 使其为 128 的倍数.

> Section 2.1 第 5 条: 改自 GPT-NeoX-20B BPE, 并加 PII mask token, 最终词表 50280; 为吞吐把 embedding 矩阵扩到 50304 (128 的倍数). 这是词表大小与矩阵对齐两件不同的事.

### 2.2 Pretraining Data: Dolma 预训练数据: Dolma

Despite progress in access to model parameters, pretraining datasets are still not as open. Pretraining data are often not released alongside open models (let alone closed models) and documentation about such data is often lacking in detail that would be needed to reproduce or fully understand the work. This has made it difficult to support certain threads of language model research, such as understanding how training data impacts model capabilities and limitations. To facilitate open research on language model pretraining, we built and released our pretraining dataset, Dolma—a diverse, multi-source corpus containing trillions of tokens across billions of documents acquired from different data sources that are (1) commonly seen in large-scale language model pretraining and (2) accessible to the general public (Soldaini et al., 2024). Table 2 provides a high-level overview of the amount of data from each source.

尽管模型参数的开放有进展, 预训练数据仍不够开放. 预训练数据往往不随开源模型 (更不用说闭源模型) 一起发布, 文档也常缺少可复现或充分理解工作所需的细节. 这使得某些语言模型研究线索难以推进, 例如理解训练数据如何影响模型能力与局限. 为便于对语言模型预训练做开放研究, 我们构建并发布了预训练数据集 Dolma——一个多样, 多源的语料, 跨数十亿文档, 数万亿 token, 来源满足: (1) 大规模语言模型预训练中常见; (2) 公众可获取 (Soldaini et al., 2024). Table 2 给出各源数据量的高层概览.

Dolma is built using a pipeline of (1) language filtering, (2) quality filtering, (3) content filtering, (4) deduplication, (5) multi-source mixing, and (6) tokenization. We refer the reader to the Dolma report (Soldaini et al., 2024) for more details about its design principles, details about its construction, and a more detailed summary of its contents. The

Dolma 的构建流水线为: (1) 语言过滤, (2) 质量过滤, (3) 内容过滤, (4) 去重, (5) 多源混合, (6) 分词. 设计原则, 构建细节与内容摘要请见 Dolma 报告 (Soldaini et al., 2024).

<table><tr><td>Source</td><td>Type</td><td>UTF-8 bytes (GB)</td><td>Docs (millions)</td><td>Tokens (billions)</td></tr><tr><td>Common Crawl</td><td>web pages</td><td>9,812</td><td>3,734</td><td>2,180</td></tr><tr><td>GitHub</td><td>code</td><td>1,043</td><td>210</td><td>342</td></tr><tr><td>Reddit</td><td>social media</td><td>339</td><td>377</td><td>80</td></tr><tr><td>Semantic Scholar</td><td>papers</td><td>268</td><td>38.8</td><td>57</td></tr><tr><td>Project Gutenberg</td><td>books</td><td>20.4</td><td>0.056</td><td>5.2</td></tr><tr><td>Wikipedia</td><td>encyclopedic</td><td>16.2</td><td>6.2</td><td>3.7</td></tr><tr><td colspan="2">Total</td><td>11,519</td><td>4,367</td><td>2,668</td></tr></table>

Table 2: Composition of Dolma. Tokens counts are based on the GPT-NeoX tokenizer.

表 2: Dolma 组成. Token 计数基于 GPT-NeoX 分词器.

> Table 2: CC 2180B / Total 2668B ≈ 81.7% (按 Dolma 全库 token). Section 4.2 写 OLMo 预训练里 CC 占 88.8%, 口径是 「训练用 Dolma 子采样后的配方」, 不是直接把 Table 2 全库比例当成训练混合比. 两数都要保留, 并分清全库组成 vs 实际训练混合.

report provides additional analyses and experimental results from training language models on intermediate states of Dolma to share what we learned about important data curation practices, including the role of content or quality filters, deduplication, and mixing data from multiple sources. We keep documents from each source separate, both during curation as well as in the final release. We open-sourced our high-performance data curation tools; this toolkit can be used to further experiment on Dolma, reproduce our work, and enable fast and easy curation of pretraining corpora. Finally, we also open-sourced our WIMBD tool (Elazar et al., 2024) to help with dataset analysis.

该报告还提供在 Dolma 中间状态上训练语言模型的额外分析与实验结果, 分享我们学到的重要数据策展实践, 包括内容或质量过滤, 去重以及多源混合的作用. 策展过程与最终发布中, 我们都保持各源文档分开. 我们开源了高性能数据策展工具; 该工具包可用于在 Dolma 上进一步实验, 复现我们的工作, 并快速便捷地策展预训练语料. 最后, 我们还开源了 WIMBD 工具 (Elazar et al., 2024) 以辅助数据集分析.

### 2.3 Adaptation 适配

Pretrained models are not always used as-is, but rather further finetuned to improve their performance, safety, and usability. Often models are first trained to follow instructions (Mishra et al., 2022; Wei et al., 2022; Sanh et al., 2022), and then further trained on human preferences (Ouyang et al., 2022) to improve the quality of their generations. We showcase the efficacy of using OLMo as a base model for further fine-tuning by training OLMo to be a general chat assistant following the TÜLU data and training setup (Ivison et al., 2023). This involves first performing instruction finetuning with a mixture of distilled and human-written instruction data and then further aligning the model with

预训练模型未必直接使用, 而常再微调以提升性能, 安全性与可用性. 模型往往先接受指令训练 (Mishra et al., 2022; Wei et al., 2022; Sanh et al., 2022), 再在人类偏好上继续训练 (Ouyang et al., 2022) 以改善生成质量. 我们按 TÜLU 数据与训练设定 (Ivison et al., 2023) 把 OLMo 训成通用聊天助手, 以展示其作为基座做进一步微调的效力. 流程是先用蒸馏与人工撰写指令数据的混合做指令微调, 再

<small><span class="docvortex-page-footnote" data-block-type="page_footnote" style="color:#6b7280">is half the size of the input. So technically our inputs to SwiGLU have a dimensionality of 2 × 11,008 = 22,016 for our 7B model.</span></small>

<!-- page 4 of 21 -->

distilled preference data using Direct Preference Optimization (DPO) (Rafailov et al., 2023).

用 Direct Preference Optimization (DPO) (Rafailov et al., 2023) 在蒸馏偏好数据上进一步对齐.

### 2.4 Evaluation 评测

We perform base model evaluation at two stages: online evaluation to make decisions for model design and offline evaluation to evaluate model checkpoints. For the offline stage, we use the Catwalk framework (Groeneveld et al., 2023), a publicly available evaluation tool with access to a wide range of datasets and task formats, to perform downstream evaluation as well as intrinsic language modeling evaluation on the perplexity benchmark Paloma (Magnusson et al., 2023).

基座模型评测分两阶段: 在线评测用于模型设计决策, 离线评测用于评估模型 checkpoint. 离线阶段使用公开评测工具 Catwalk (Groeneveld et al., 2023), 可访问广泛数据集与任务格式, 既做下游评测, 也在困惑度基准 Paloma (Magnusson et al., 2023) 上做内禀语言建模评测.

For both downstream and perplexity evaluation, we use our fixed evaluation pipeline to compare results against publicly available models. We also report a separate evaluation of our adapted model.

下游与困惑度评测都使用固定评测管道, 与公开模型对比. 我们也单独报告适配模型的评测.

**In-Loop Training Ablations** Throughout model training, we perform downstream evaluations to make decisions around model architecture, initialization, optimizers, learning rate schedule, and data mixtures. We call this our online evaluation as it runs in-loop every 1000 training steps (or ∼4B training tokens) and provides an early and continuous signal on the quality of the model being trained. These evaluations rely on many of the core tasks and experiment settings used for our offline evaluation detailed in Section 4.1, which also mirrors the task and evaluation structure of the EleutherAI eval harness (Gao et al., 2023).

**环内训练消融** 训练全程我们做下游评测, 以决定架构, 初始化, 优化器, 学习率日程与数据混合. 称为在线评测: 每 1000 训练 step (或约 4B 训练 token) 在环内运行, 为正在训练的模型质量提供早期且连续的信号. 这些评测依赖第 4.1 节离线评测所用的许多核心任务与实验设定, 结构也镜像 EleutherAI eval harness (Gao et al., 2023).

**Downstream Evaluation** Following much previous work (Brown et al., 2020; Black et al., 2022; Touvron et al., 2023a,b, inter alia), we report zeroshot performance on a set of downstream tasks. Our evaluation suite consists of 8 core tasks corresponding closely to the commonsense reasoning task set reported by Touvron et al. (2023a) and Touvron et al. (2023b) (see Table 3 for a list of tasks). Given the scale of the models being evaluated, such tasks were selected at the beginning of model development due to their naturalness (e.g., all can formulated as text completion scoring tasks) and ability to provide meaningful signals throughout training (see Figure 1).

**下游评测** 追随大量既有工作 (Brown et al., 2020; Black et al., 2022; Touvron et al., 2023a,b 等), 我们报告一组下游任务的 zero-shot 表现. 评测套件含 8 个核心任务, 与 Touvron et al. (2023a,b) 报告的常识推理任务集密切对应 (任务列表见 Table 3). 鉴于被评模型的规模, 这些任务在开发之初就因其自然性 (例如都可建成文本补全打分任务) 以及能在训练全程提供有意义信号而被选定 (见 Figure 1).

**Intrinsic Language Modeling Evaluation** To measure how OLMo fits distributions of language beyond held-out training data, we use Paloma (Magnusson et al., 2023), a new perplexity benchmark that includes 585 different domains of text.

**内禀语言建模评测** 为衡量 OLMo 在留出训练数据之外对语言分布的拟合, 我们使用 Paloma (Magnusson et al., 2023), 一个包含 585 个不同文本域的新困惑度基准.

Domains range from nytimes.com to r/depression on Reddit and are drawn from 18 separate data sources, such as C4 (Raffel et al., 2020), in stratified samples. This allows for more equal inclusion of text domains that are under-represented in their source corpora.

域的范围从 nytimes.com 到 Reddit 的 r/depression, 来自 18 个独立数据源 (如 C4 (Raffel et al., 2020)), 并做分层抽样. 这使源语料中代表性不足的文本域能更平等地被纳入.

We aim not just to compare OLMo against other models for best performance, but also to demonstrate how it enables fuller and more controlled scientific evaluations. OLMo-7B is the largest LM with explicit decontamination for perplexity evaluation. Following the approach described in Paloma, we remove any pretraining document with paragraphs leaked from Paloma evaluation data. Without decontamination, other models risk underestimating perplexity (i.e., overestimating the model’s out-of-sample fit). We also release intermediate checkpoints, allowing richer comparisons with two other models that release checkpoints, Pythia-6.9B (Biderman et al., 2023) and RPJ-INCITE-7B (Together Computer, 2023) (see Figure 2).

我们的目标不只是把 OLMo 与其他模型比谁最好, 也要展示它如何促成更充分, 更可控的科学评测. OLMo-7B 是对困惑度评测做了显式去污染的较大语言模型. 按 Paloma 所述方法, 我们移除任何与 Paloma 评测数据存在段落泄漏的预训练文档. 若不去污染, 其他模型有低估困惑度 (即高估模型样本外拟合) 的风险. 我们还发布中间 checkpoint, 从而可与同样发布 checkpoint 的 Pythia-6.9B (Biderman et al., 2023) 与 RPJ-INCITE-7B (Together Computer, 2023) 做更丰富的对照 (见 Figure 2).

**Adaptation Evaluation** We also evaluate OLMo after instruction fine-tuning and DPO training using the TÜLU evaluation suite proposed in Wang et al. (2023); Ivison et al. (2023). We focus on evaluations around model chat capabilities and safety in order to showcase the efficacy of using OLMo as a base for further fine-tuning.

**适配评测** 我们也在指令微调与 DPO 训练之后评测 OLMo, 使用 Wang et al. (2023); Ivison et al. (2023) 提出的 TÜLU 评测套件. 重点放在模型聊天能力与安全, 以展示 OLMo 作为进一步微调基座的效力.

## 3 Training OLMo 训练 OLMo

This section describes our pretraining setup, including our distributed training framework (Section 3.1), optimizer (Section 3.2), data preparation (Section 3.3), and hardware (Section 3.4).

本节描述预训练设定, 包括分布式训练框架 (第 3.1 节), 优化器 (第 3.2 节), 数据准备 (第 3.3 节) 与硬件 (第 3.4 节).

### 3.1 Distributed Training Framework 分布式训练框架

We train our models using the ZeRO optimizer strategy (Rajbhandari et al., 2019) via PyTorch’s FSDP framework (Zhao et al., 2023), which reduces memory consumption by sharding the model weights and their corresponding optimizer state across GPUs. At the 7B scale, this enables training with a micro-batch size of 4096 tokens per GPU on our hardware (see Section 3.4). For OLMo-1B and -7B models, we use a constant global batch size of approximately 4M tokens (2048 instances, each with a sequence length of 2048 tokens).

我们通过 PyTorch 的 FSDP 框架 (Zhao et al., 2023) 使用 ZeRO 优化器策略 (Rajbhandari et al., 2019), 把模型权重及其对应优化器状态切分到各 GPU 上以降低显存. 在 7B 尺度上, 这使我们能在硬件上以每 GPU micro-batch 4096 token 训练 (见第 3.4 节). 对 OLMo-1B 与 -7B, 我们使用约 4M token 的恒定全局 batch (2048 条实例, 每条序列长 2048 token).

> Section 3.1: 2048 instances × 序列长度 2048 token ≈ 4M. Table 1 / Table 5 也写 batch size (tokens) ~4M; Table 5 进一步写 instances=2160 (与 ~4M 同量级). 回答应指回实例数 × 序列长, 而不是只背 「~4M」.

To improve throughput, we employ mixedprecision training (Micikevicius et al., 2017) through FSDP’s built-in settings and PyTorch’s amp module. The latter ensures that certain operations

为提升吞吐, 我们通过 FSDP 内置设置与 PyTorch 的 amp 模块做混合精度训练 (Micikevicius et al., 2017). 后者确保某些运算

<!-- page 5 of 21 -->

like the softmax always run in full precision to improve stability, while all other operations run in half-precision with the bfloat16 format. Under our specific settings, the sharded model weights and optimizer state local to each GPU are kept in full precision. The weights within each transformer block are only cast to bfloat16 when the full-sized parameters are materialized on each GPU during the forward and backward passes. Gradients are reduced across GPUs in full precision.

如 softmax 始终以全精度运行以改善稳定性, 其余运算以 bfloat16 半精度运行. 在我们的具体设定下, 各 GPU 本地的分片模型权重与优化器状态保持全精度. 每个 transformer block 内的权重仅在前反向过程中于各 GPU 上物化完整参数时才 cast 为 bfloat16. 梯度跨 GPU 以全精度归约.

> Section 3.1: 分片模型权重与优化器状态在各 GPU 本地保持全精度; 每个 transformer block 前反向物化完整参数时 cast 为 bfloat16; 梯度跨 GPU 以全精度归约; softmax 等经 amp 强制全精度. 这是稳定性设计, 不是 「全程 fp16」.

### 3.2 Optimizer 优化器

We use the AdamW optimizer (Loshchilov and Hutter, 2019) with the hyperparameters shown in Table 1. For all model sizes, we warm up the learning rate over 5000 steps (∼21B tokens) and then decay it linearly from there down to a tenth of the peak learning rate over the remainder of training. After the warm-up period, we clip gradients such that the total l-norm of the parameter gradients<sup>3</sup>does not exceed 1.0. Table 5 gives a comparison of our optimizer settings at the 7B scale to those of other recent LMs that also used AdamW.

我们使用 AdamW 优化器 (Loshchilov and Hutter, 2019), 超参见 Table 1. 所有模型尺度都在 5000 step (约 21B token) 内 warmup 学习率, 随后在剩余训练中从峰值线性衰减到峰值的十分之一. warmup 之后做梯度裁剪, 使参数梯度的总 l-范数不超过 1.0. Table 5 给出 7B 尺度上我们与其他近期同样使用 AdamW 的 LM 的优化器设定对照.

Section 3.2 的主日程在 warmup 后从峰值线性降到峰值的 1/10; Table 5 所列 Minimum LR 3.0E-05 正好对应峰值 3.0E-04 的十分之一. Results 开头另有 1000 step 将学习率线性降到 0, 两段日程应分开理解.

### 3.3 Data 数据

We built our training dataset out of a 2T-token sample from our open dataset, Dolma (Soldaini et al., 2024), which we describe in Section 2.2. The tokens from every document are concatenated together after appending a special EOS token to the end of each document, and then we group consecutive chunks of 2048 tokens to form training instances. The training instances are shuffled in the exact same way for each training run. The data order and exact composition of each training batch can be reconstructed from the artifacts we release.

训练数据集取自开放数据集 Dolma (Soldaini et al., 2024) 的 2T-token 样本, 见第 2.2 节. 每篇文档末尾追加特殊 EOS token 后拼接全部 token, 再把连续的 2048 token 切成训练实例. 各训练 run 以完全相同方式打乱实例. 训练数据顺序与每个训练 batch 的精确组成都可从我们发布的产物重建.

All of our released models have been trained to at least 2T tokens (a single epoch over our training data), and some have been trained beyond that by starting a second epoch over the data with a different shuffling order. The impact of repeating this small amount of data should be negligible according to prior work (Muennighoff et al., 2023).

所有发布模型都至少训到 2T token (训练数据上的单 epoch), 部分通过以不同打乱顺序开始第二 epoch 而训得更久. 按既有工作 (Muennighoff et al., 2023), 重复这少量数据的影响应可忽略.

### 3.4 Hardware 硬件

In order to verify that our codebase could be used on both NVIDIA and AMD GPUs without any loss

为验证代码库可在 NVIDIA 与 AMD GPU 上使用且不损失

in performance, we trained models on two different clusters:

性能, 我们在两个不同集群上训练模型:

• **LUMI:** Provided by the LUMI supercomputer, <sup>4</sup> we used up to 256 nodes on this cluster, where each node consists of 4x AMD MI250X GPUs with 128GB of memory and 800Gbps of interconnect.

• **LUMI:** 由 LUMI 超算提供, 我们最多使用该集群 256 个节点, 每节点含 4× AMD MI250X GPU, 128GB 显存, 800Gbps 互连.

• **MosaicML:** Provided by MosaicML<sup>6</sup> (Databricks), we used 27 nodes on this cluster, where each node consists of 8x NVIDIA A100 GPUs with 40GB of memory and 800Gbps interconnect.

• **MosaicML:** 由 MosaicML (Databricks) 提供, 我们使用该集群 27 个节点, 每节点含 8× NVIDIA A100 GPU, 40GB 显存, 800Gbps 互连.

Despite minor differences in batch size to optimize for training throughput, both runs resulted in nearly identical performance on our evaluation suite by 2T tokens.

尽管为优化训练吞吐而在 batch size 上有细微差异, 两套 run 到 2T token 时在我们的评测套件上表现几乎相同.

> Section 3.4: LUMI MI250X 与 MosaicML A100 两套 run, batch 略有不同以优吞吐, 但到 2T token 时评测套件几乎相同. 目标是验证代码在 NVIDIA 与 AMD 上均可训练且不掉点, 不是比较两家硬件绝对速度.

## 4 Results 结果

The checkpoint used for evaluating OLMo-7B is trained until 2.46T tokens on the Dolma (Soldaini et al., 2024) dataset with a linear learning rate decay schedule mentioned in Section 3.2. In our experiments, we find that tuning this checkpoint further on the Dolma dataset for 1000 steps with the learning rate linearly decayed to 0 boosts model performance on perplexity and end-task evaluation suites described in Section 2.4. We compare OLMo with other publicly available models including LLaMA-7B (Touvron et al., 2023a), Llama-2-7B (Touvron et al., 2023b), MPT-7B (MosaicML NLP Team, 2023), Pythia-6.9B (Biderman et al., 2023), Falcon-7B (Almazrouei et al., 2023) and RPJ-INCITE-7B (Together Computer, 2023).

用于评测 OLMo-7B 的 checkpoint 在 Dolma (Soldaini et al., 2024) 上训到 2.46T token, 学习率按第 3.2 节所述线性衰减. 实验中发现, 将该 checkpoint 在 Dolma 上再调 1000 step, 学习率线性收到 0, 能提升第 2.4 节所述困惑度与端任务评测套件上的表现. 我们与公开模型对照, 包括 LLaMA-7B (Touvron et al., 2023a), Llama-2-7B (Touvron et al., 2023b), MPT-7B (MosaicML NLP Team, 2023), Pythia-6.9B (Biderman et al., 2023), Falcon-7B (Almazrouei et al., 2023) 与 RPJ-INCITE-7B (Together Computer, 2023).

不能. Section 3.2 主日程终点是峰值的 1/10; Section 4 开头与 Figure 1 题注另做 1000 step, 把 LR linear 收到 0, 并观察端任务跳升. Table 5 Minimum LR=3.0E-05 对应主日程, 不是 0. 两段操作在文中是衔接但分开写的.

### 4.1 Downstream evaluation 下游评测

**Setup** Our core **downstream evaluation suite** (see Table 3) consists of: arc (both arc\_easy and arc\_challenge) (Clark et al., 2018), boolq (Clark et al., 2019), openbookqa (Mihaylov et al., 2018), sciq (Welbl et al., 2017), hellaswag (Zellers et al., 2019), piqa (Bisk et al., 2020), and winogrande (Sakaguchi et al., 2021). In Appendix C, we also report results on an additional set of auxiliary tasks outside of our core evaluation set that we found to have less stable performance trends (see Figure 4).

**设定** 核心**下游评测套件** (见 Table 3) 包括: arc (arc_easy 与 arc_challenge) (Clark et al., 2018), boolq (Clark et al., 2019), openbookqa (Mihaylov et al., 2018), sciq (Welbl et al., 2017), hellaswag (Zellers et al., 2019), piqa (Bisk et al., 2020), 以及 winogrande (Sakaguchi et al., 2021). 附录 C 还报告核心集之外一组辅助任务, 我们发现其表现趋势更不稳定 (见 Figure 4).

<small><span class="docvortex-page-footnote" data-block-type="page_footnote" style="color:#6b7280"><sup>4</sup>[https://www.lumi-supercomputer.eu](https://www.lumi-supercomputer.eu)</span></small>

<small><span class="docvortex-page-footnote" data-block-type="page_footnote" style="color:#6b7280"><sup>3</sup>During gradient clipping all of the model’s parameters are treated as a single big vector (as if all parameters were flattened and concatenated together), and we take the ℓ<sub>2</sub>-norm over the corresponding single gradient vector. This is the standard way to clip gradients in PyTorch.</span></small>

<small><span class="docvortex-page-footnote" data-block-type="page_footnote" style="color:#6b7280"><sup>5</sup>The MI250X is a dual-chip module, meaning in practice that each physical device consists of two logical devices, so each node has 8 logical GPU devices with 64GB of memory each.</span></small>

<small><span class="docvortex-page-footnote" data-block-type="page_footnote" style="color:#6b7280"><sup>6</sup>[https://www.mosaicml.com](https://www.mosaicml.com)</span></small>

<!-- page 6 of 21 -->

| Models | arc challenge | arc easy | boolq | hella-swag | open bookqa | piqa | sciq | wino-grande | avg. |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| StableLM 1.6B | 43.8 | 63.7 | 76.6 | 68.2 | 45.8 | 74.0 | 94.7 | 64.9 | 66.5 |
| Pythia 1B | 33.1 | 50.2 | 61.8 | 44.7 | 37.8 | 69.1 | 86.0 | 53.3 | 54.5 |
| TinyLlama 1.1B | 34.8 | 53.2 | 64.6 | 58.7 | 43.6 | 71.1 | 90.5 | 58.9 | 59.4 |
| OLMo-1B | 34.5 | 58.1 | 60.7 | 62.5 | 46.4 | 73.7 | 88.1 | 58.9 | 60.4 |
| Falcon-7B | 47.5 | 70.4 | 74.6 | 75.9 | 53.0 | 78.5 | 93.9 | 68.9 | 70.3 |
| LLaMA 7B | 44.5 | 67.9 | 75.4 | 76.2 | 51.2 | 77.2 | 93.9 | 70.5 | 69.6 |
| Llama 2 7B | 48.5 | 69.5 | 80.2 | 76.8 | 48.4 | 76.7 | 94.5 | 69.4 | 70.5 |
| MPT-7B | 46.5 | 70.5 | 74.2 | 77.6 | 48.6 | 77.3 | 93.7 | 69.9 | 69.8 |
| Pythia 6.9B | 44.1 | 61.9 | 61.1 | 63.8 | 45.0 | 75.1 | 91.1 | 62.0 | 63.0 |
| RPJ-INCITE-7B | 42.8 | 68.4 | 68.6 | 70.3 | 49.4 | 76.0 | 92.9 | 64.7 | 66.6 |
| OLMo-7B | 48.5 | 65.4 | 73.4 | 76.4 | 50.4 | 78.4 | 93.8 | 67.9 | 69.3 |

Table 3: Zero-shot evaluation of OLMo-1B and OLMo-7B, with other publicly available comparable model checkpoints on 8 core tasks from the downstream evaluation suite described in Section 2.4. For OLMo-7B, we report results for the 2.46T token checkpoint.

表 3: OLMo-1B 与 OLMo-7B 在第 2.4 节下游评测套件 8 个核心任务上的 zero-shot 评测, 并与其他公开可比 checkpoint 对照. OLMo-7B 报告 2.46T token checkpoint 结果.

In all cases, we perform zero-shot evaluation using the rank classification approach popularized by Brown et al. (2020). Under this approach, candidate text completions (e.g., different multiplechoice options) are ranked by likelihood (usually normalized by some normalization factor), and pre-diction accuracy is reported. While Catwalk implements several common likelihood normalization strategies, including normalizing by number of tokens (per-token normalization; Brown et al., 2020; Liang et al., 2022), by number of characters (per-character normalization; Gao et al., 2023), as well as incorporating an answer’s unconditional likelihood (Brown et al., 2020), we selected the normalization strategies for each dataset separately. Specifically, we used unconditional normalization for arc and openbookqa, per-token normalization for hellaswag, piqa, and winogrande and no normalization for boolq, and sciq (i.e., tasks formulated as single token prediction tasks).

所有情形下, 我们采用 Brown et al. (2020) 推广的排序分类做法做 zero-shot 评测. 候选文本补全 (例如不同选择题选项) 按似然排序 (通常再除以某种归一化因子), 并报告预测准确率. Catwalk 实现了多种常见似然归一化策略, 包括按 token 数归一化 (per-token; Brown et al., 2020; Liang et al., 2022), 按字符数归一化 (per-character; Gao et al., 2023), 以及引入答案的无条件似然 (Brown et al., 2020); 我们为每个数据集分别选择归一化策略. 具体地, arc 与 openbookqa 用 unconditional normalization, hellaswag, piqa 与 winogrande 用 per-token normalization, boolq 与 sciq 不归一化 (即建成单 token 预测任务的那些).

> Section 4.1: 作者按数据集分别选策略 — arc/openbookqa 用 unconditional, hellaswag/piqa/winogrande 用 per-token, boolq/sciq 不归一化. Catwalk 虽实现多种归一化, 但信号来自分任务选择, 这也解释了为何不能拿单一归一化重跑后直接对比文献数字.

**Results** Table 3 summarizes the result of zeroshot evaluation of OLMo and compares against other publicly available models of comparable size. We report results on 8 core tasks from our evaluation suite described in Section 2.4. On aggregate, OLMo-7B is competitive against all the comparable models. We include the comparison to StableLM 1.6B , but note that it is significantly larger, and was trained on unknown data.

**结果** Table 3 汇总 OLMo 的 zero-shot 评测, 并与其他同尺度公开模型对照. 我们报告第 2.4 节所述评测套件中 8 个核心任务. 总体看, OLMo-7B 对所有可比模型都具竞争力. 我们也列入与 StableLM 1.6B 的对照, 但注明其显著更大, 且训练数据未知.

Table 3 中 OLMo-7B 平均分为 69.3, Llama 2 7B 为 70.5, Falcon 为 70.3, MPT 为 69.8, LLaMA 7B 为 69.6. Section 4.1 的 「competitive」 指总体分数处于相近量级, 不表示每项任务都领先.

In Figure 1 we plot the accuracy score progression of 8 core end-tasks. All tasks, except OBQA, show an upward trend in accuracy numbers as

Figure 1 画出 8 个核心端任务准确率随训练的进展. 除 OBQA 外, 所有任务都随

OLMo-7B is trained on more tokens. A sharp upward tick in accuracy of many tasks between the last and the second to last step shows us the benefit of linearly reducing the LR to 0 over the final 1000 training steps. See Table 7 in Appendix C for additional evaluation results and discussion.

OLMo-7B 见到更多 token 而呈上升趋势. 许多任务在最后一步与倒数第二步之间准确率明显上跳, 显示最后 1000 训练 step 把 LR 线性收到 0 的收益. 更多评测结果与讨论见附录 C 的 Table 7.

### 4.2 Intrinsic language modeling evaluation 内禀语言建模评测

**Setup** For intrinsic evaluations, Paloma proposes a range of analyses, from inspection of performance in each domain separately to more summarized results over combinations of domains. We report results at two levels of granularity: the aggregate performance over 11 of the 18 sources in Paloma as in (Magnusson et al., 2023), as well as more fine-grained results over each of these sources individually. This particular subset of 11 sources from Paloma excludes sources that are not publicly available, involve fringe or toxic text, or consist of code data not supported by Paloma’s decontamination approach. This leaves C4 (Raffel et al., 2020), mC4-en (Chung et al., 2023), Wikitext 103 (Merity et al., 2016), Penn Treebank (Marcus et al., 1999; Nunes, 2020), RedPajama (Together Computer, 2023), Falcon-RefinedWeb (Penedo et al., 2023), Dolma (Soldaini et al., 2024), M2D2 S2ORC (Reid et al., 2022), M2D2 Wikipedia (Reid et al., 2022), C4 100 domains (Chronopoulou et al., 2022), and Dolma 100 Subreddits (Soldaini et al., 2024). To allow for a fair comparison between models with different vocabularies, we report bits per byte as defined by Gao et al. (2020) over the test sets of these sources.

**设定** 内禀评测上, Paloma 提出从分域检视到跨域汇总的一系列分析. 我们报告两级粒度: 如 (Magnusson et al., 2023) 对 Paloma 中 18 源里 11 源的聚合表现, 以及这 11 源各自的更细结果. 该 11 源子集排除了当前不可公开, 涉及边缘或有毒文本, 或由 Paloma 去污染方法不支持的代码数据构成的源. 留下 C4 (Raffel et al., 2020), mC4-en (Chung et al., 2023), Wikitext 103 (Merity et al., 2016), Penn Treebank (Marcus et al., 1999; Nunes, 2020), RedPajama (Together Computer, 2023), Falcon-RefinedWeb (Penedo et al., 2023), Dolma (Soldaini et al., 2024), M2D2 S2ORC (Reid et al., 2022), M2D2 Wikipedia (Reid et al., 2022), C4 100 domains (Chronopoulou et al., 2022), 以及 Dolma 100 Subreddits (Soldaini et al., 2024). 为公平比较不同词表的模型, 我们按 Gao et al. (2020) 的定义在这些源的测试集上报告 bits per byte.

<!-- page 7 of 21 -->

![Chart block](images/p07-figure-1-accuracy-score-progression-of-olmo-7b-on-8.png)

Figure 1: Accuracy score progression of OLMo-7B on 8 core end-tasks score from Catwalk evaluation suite described in Section 2.4. We can see the benefit of decaying LR to 0 in the final 1000 steps of training on most tasks.

图 1: OLMo-7B 在第 2.4 节 Catwalk 评测套件 8 个核心端任务上的准确率进展. 多数任务可见最后 1000 训练 step 将 LR 收到 0 的收益.

> Figure 1 题注与 Section 4.1: 多数任务在最后 1000 step 把 LR 收到 0 后准确率明显上跳. 这与主训练阶段 「降到峰值 1/10」 是两段不同的日程, 读图时不要混成一次 decay.

**Results** In the Sources Combined subplot of Fig ure 2, we show the performance of OLMo-7B against 6 comparably-sized language models on the combination of 11 data sources from Paloma. Overall we find OLMo to have a competitive fit, especially given its training data was explicitly decontaminated against Paloma. As seen through the comparison of final models (see shapes) as well intermediate checkpoints (see dashed lines), the OLMo results follow similar scaling trends of other models. Note that the performance of intermediate checkpoints is influenced by where that checkpoint occurs in the learning rate schedule. So models trained for fewer steps will tend to have steeper training curves without necessarily being more sample efficient if training duration were fixed across all models. MPT-7B, nevertheless, stands out as improving ahead of the other models in this subplot. This could be due to a number of factors, including pretraining data composition and its match to the domains in Paloma (e.g., MPT trains on 27% non-Common Crawl data rather than 18% for LLaMA, 12.2% for RedPajama, and 11.2% for OLMo) as well as various data preprocessing decisions (e.g., MPT’s use of semantic deduplication by Abbas et al., 2023, on C4).

**结果** 在 Figure 2 的 Sources Combined 子图中, 我们展示 OLMo-7B 与 6 个同尺度语言模型在 Paloma 11 源组合上的表现. 总体看 OLMo 拟合具竞争力, 尤其考虑到其训练数据对 Paloma 做了显式去污染. 从最终模型 (见形状) 与中间 checkpoint (见虚线) 的对照可见, OLMo 结果遵循与其他模型相似的 Scaling 趋势. 注意中间 checkpoint 的表现受该点落在学习率日程何处影响. 因此训得更短的模型曲线往往更陡, 未必在固定训练时长下更样本高效. 不过在该子图中 MPT-7B 仍明显领先. 原因可能包括预训练数据组成及其与 Paloma 域的匹配 (例如 MPT 在非 Common Crawl 数据上训 27%, 而 LLaMA 为 18%, RedPajama 为 12.2%, OLMo 为 11.2%), 以及各种数据预处理决策 (例如 MPT 对 C4 使用 Abbas et al., 2023 的语义去重).

The remaining subplots in Figure 2 provide more fine-grained analysis by reporting bits per byte separately for each of the 11 data sources that are combined in the aggregated Paloma metric. From this we see greater variation in sample efficiency,

Figure 2 其余子图提供更细分析, 分别报告聚合 Paloma 指标所合并的 11 个数据源各自的 bits per byte. 由此可见样本效率变化更大,

largely driven by the similarity of training and evaluation distributions. Notably, OLMo-7B fares well on evaluations predominated by Common Crawl, such as C4, though different ways of postprocessing Common Crawl are best fit by models trained with that specific data, such as Falcon-7B on Falcon RefinedWeb. Meanwhile, OLMo-7B is less sample efficient compared to other models on sources less related to scraped web text, such as WikiText-103, M2D2 S2ORC, and M2D2 Wikipedia. The RedPajama evaluation shows a similar pattern, perhaps as only 2 of its 7 domains are from Common Crawl, and Paloma weights domains within each source equally. Since heterogeneous data from curated sources like Wikipedia and ArXiv papers is scarcer than scraped web text, maintaining sample efficiency for fit to these distributions of language will be challenging as pretraining corpora are scaled.

很大程度上由训练与评测分布的相似性驱动. 值得注意的是, OLMo-7B 在以 Common Crawl 为主的评测上表现好, 例如 C4; 不过对 Common Crawl 的不同后处理方式, 仍是用该特定数据训练的模型拟合最好, 例如 Falcon-7B 在 Falcon RefinedWeb 上. 同时, 在与抓取网页文本关系较弱的源上, 如 WikiText-103, M2D2 S2ORC 与 M2D2 Wikipedia, OLMo-7B 相对其他模型样本效率更低. RedPajama 评测呈现类似模式, 或许因其 7 个域中仅 2 个来自 Common Crawl, 且 Paloma 在每个源内部对域等权. 由于维基百科与 ArXiv 论文等策展异质数据比抓取网页更稀缺, 随着预训练语料扩大, 维持对这些语言分布的样本效率拟合将更具挑战.

> Section 4.2: 样本效率主要由训评分布接近程度驱动; OLMo 在 CC 主导评测 (如 C4) 更强, 题注甚至写在 C4 上 overtakes all other models; 对 WikiText-103, M2D2 S2ORC/Wikipedia 等非 scraped web 分布更弱. 同时写明 CC 占预训练 88.8%, 与现象一致.

### 4.3 Adaptation Evaluation 适配评测

**Setup** We evaluate OLMo-7B before adaptation, and after both the supervised fine-tuning and DPO training stage, focusing on the safety and chat evaluations used by Wang et al. (2023). We additionally compare to officially released instruction-tuned variants of the models from Table 3. We finally also compare to TÜLU 2 models to compare against models trained using the same post-training data mixes and procedures.

**设定** 我们评测适配前的 OLMo-7B, 以及监督微调与 DPO 训练两阶段之后的模型, 重点采用 Wang et al. (2023) 使用的安全与聊天评测. 另外与 Table 3 各模型官方发布的指令微调变体对照. 最后也与 TÜLU 2 模型对照, 以比较使用相同后训练数据混合与流程训练的模型.

<small><span class="docvortex-page-footnote" data-block-type="page_footnote" style="color:#6b7280"><sup>7</sup>Following Ivison et al. (2023), we do not report TÜLU 2 TruthfulQA scores due to test set contamination.</span></small>

<!-- page 8 of 21 -->

![Chart block](images/p08-figure-2-bits-per-byte-on-11-evaluation-data-sources.png)

Figure 2: Bits per byte on 11 evaluation data sources from Paloma and their combination (Magnusson et al., 2023), decontaminated from OLMo’s pretraining data. While models follow a general data scaling trend, sample efficiency is most favorable on in-distribution data. For example, OLMo-7B overtakes all other models on C4, perhaps from having 88.8% Common Crawl pretraining data.

图 2: Paloma 11 个评测数据源及其组合上的 bits per byte (Magnusson et al., 2023), 已相对 OLMo 预训练数据去污染. 模型大体遵循数据 Scaling 趋势, 但样本效率在分布内数据上最有利. 例如 OLMo-7B 在 C4 上超过所有其他模型, 或因预训练中 Common Crawl 占 88.8%.

Section 2.4 与 4.2 说明, 预训练数据移除了与 Paloma 评测段落重叠的文档. Figure 2 的 bits per byte 因而更接近去污染后的 out-of-sample fit.

| Model | MMLU 0-shot ↑ | AlpacaEval%win ↑ | ToxiGen% Toxic ↓ | TruthfulQA%Info+True ↑ |
| --- | --- | --- | --- | --- |
| OLMo (base) | 28.3 | - | 81.4 | 31.6 |
| MPT Chat | 33.8 | 46.8 | 0.1 | 42.7 |
| Falcon Instruct | 25.2 | 14.0 | 70.7 | 27.2 |
| RPJ-INCITE Chat | 27.0 | 38.0 | 46.4 | 53.0 |
| Llama-2-Chat | 46.8 | 87.3 | 0.0 | 26.3 |
| TÜLU 2 | 50.4 | 73.9 | 7.0 | 51.7 |
| TÜLU 2+DPO | 50.7 | 85.1 | 0.5 | -7 |
| OLMo+SFT | 47.3 | 57.0 | 14.4 | 41.2 |
| OLMo+SFT+DPO | 46.2 | 69.3 | 1.7 | 52.0 |

Table 4: Evaluation of various instruction-tuned 7B models, including OLMo-7B and before and after adap tation training. Lower is better for ToxiGen and higher is better for other metrics. We provide a detailed description of models and metrics in Appendix. E.

表 4: 多种指令微调 7B 模型评测, 含 OLMo-7B 适配训练前后. ToxiGen 越低越好, 其余指标越高越好. 模型与指标详述见附录 E.

> Table 4: base 81.4 → +SFT 14.4 → +SFT+DPO 1.7. SFT 已大幅下降, DPO 再压到 1.7; TruthfulQA 则 31.6 → 41.2 → 52.0, DPO 段增益更明显. 正文 Section 4.3 也写 DPO 后 safety/truth 改善尤其明显.

**Results** We find that instruction tuning considerably improves the performance and safety of OLMo-7B, increasing MMLU performance by a wide margin and improving ToxiGen and TruthfulQA scores - especially after DPO training. Additionally, we find that OLMo-7B outperforms most other chat variants after both initial instruction tuning (OLMo+SFT) and additional preference alignment (OLMo+SFT+DPO), highlighting both the strength of OLMo-7B as a base model and the

**结果** 我们发现指令微调显著提升 OLMo-7B 的性能与安全性, 大幅提高 MMLU, 并改善 ToxiGen 与 TruthfulQA 分数——尤其在 DPO 训练之后. 此外, 在初始指令微调 (OLMo+SFT) 与进一步偏好对齐 (OLMo+SFT+DPO) 之后, OLMo-7B 超过多数其他聊天变体, 既凸显 OLMo-7B 作为基座的实力, 也凸显

strength of the TÜLU mix used to perform adaptation training. However, we find there is still a gap with TÜLU 2, which is trained by applying the TÜLU mix on Llama 2. This gap may be due to test set contamination in Llama 2 and because the TÜLU mix was primarily designed for Llama models. Overall, we see that OLMo-7B greatly benefits from additional tuning and serves as a strong base model for downstream applications.

用于适配训练的 TÜLU 混合的实力. 不过与把 TÜLU 混合用在 Llama 2 上训成的 TÜLU 2 仍有差距. 该差距可能来自 Llama 2 的测试集污染, 以及 TÜLU 混合主要按 Llama 模型设计. 总体看, OLMo-7B 从额外调优中获益显著, 是下游应用的强基座.

## 5 Artifacts Released 发布产物

By sharing artifacts from all pipeline stages, we aim to encourage open research and reduce duplicated, often costly efforts, by academics and practitioners. We release the following:

通过分享流水线各阶段产物, 我们希望鼓励开放研究, 并减少学者与实践者重复, 往往昂贵的劳动. 我们发布如下:

• **Pretraining (§2.1)** **预训练**

1. The training and modeling code.

1. 训练与建模代码.

2. The trained model weights for the 7B model, 7B-twin-2T, and the 1B model. For all the models, we release not only the final model weights but also 500+ intermediate checkpoints at intervals of 1000 steps.

2. 7B 模型, 7B-twin-2T 与 1B 模型的训练权重. 对所有模型, 我们不仅发布最终权重, 也按 1000 step 间隔发布 500+ 中间 checkpoint.

<small><span class="docvortex-page-footnote" data-block-type="page_footnote" style="color:#6b7280"><sup>8</sup>Touvron et al. (2023b) report that Llama 2 was pretrained on data contaminated with MMLU test data.</span></small>

<!-- page 9 of 21 -->

3. The complete set of metrics logged to Weights & Biases during training.

3. 训练期间记录到 Weights & Biases 的完整指标集.

• **Data (§2.2)**

1. Our full pretraining corpus Dolma (Soldaini et al., 2024).

1. 完整预训练语料 Dolma (Soldaini et al., 2024).

2. Tools to support reproduction of full training data order as well as inspection of which training data was seen at each step during training.

2. 支持复现完整训练数据顺序, 以及检查训练各 step 见到哪些训练数据的工具.

3. Tools for recreating our training data (Soldaini et al., 2024) and performing dataset analysis (Elazar et al., 2024).

3. 用于重建训练数据 (Soldaini et al., 2024) 与做数据集分析 (Elazar et al., 2024) 的工具.

• **Adaptation (§2.3)**

1. The training code and data for adaptation.

1. 适配的训练代码与数据.

2. The model weights for OLMo+SFT and OLMo+SFT+DPO.

2. OLMo+SFT 与 OLMo+SFT+DPO 的模型权重.

• **Evaluation (§2.4)**

1. The code and data in our evaluation framework Catwalk (Groeneveld et al., 2023) for offline evaluation on both downstream tasks and intrinsic language modeling (Magnusson et al., 2023).

1. 评测框架 Catwalk (Groeneveld et al., 2023) 中用于下游任务与内禀语言建模离线评测的代码与数据 (Magnusson et al., 2023).

2. The evaluation suite (Wang et al., 2023; Ivison et al., 2023) for adapted models.

2. 适配模型的评测套件 (Wang et al., 2023; Ivison et al., 2023).

## Conclusion and Future Work

This paper presents our first release of OLMo, a state-of-the-art, truly open language model and its framework to build and study the science of language modeling. Unlike most prior efforts that have only released model weights and inference code, we release OLMo and the whole framework, including training data, training and evaluation code, and detailed metrics collected during the training runs. Additionally, we released adapted models, as well as all of our model adaptation code and data.

本文介绍了 OLMo 的首次发布: 一个最先进的, 真正开放的语言模型, 以及用于构建与研究语言建模科学的框架. 不同于多数只发布模型权重与推理代码的先例, 我们发布了 OLMo 与整个框架, 包括训练数据, 训练与评测代码, 以及训练过程中收集的详细指标. 此外, 我们还发布了适配后的模型, 以及全部模型适配代码与数据.

We intend to continuously support and extend OLMo and its framework, and continue to push the boundaries of open LMs to empower the open research community. Since the original release of OLMo described here, we improved our data and training setup to significantly improve results. For example, MMLU scores have improved by 24 points to 52%.<sup>9</sup> We look forward to bringing different model sizes, modalities, datasets, safety measures, and evaluations into the OLMo family. We hope this and future releases will empower and strengthen the open research community and inspire a new wave of innovation.

我们打算持续支持与扩展 OLMo 及其框架, 不断拓展开放语言模型的边界, 以赋权开放研究社区. 自本文所述 OLMo 最初版本发布以来, 我们已改进数据与训练设置, 显著提升了结果. 例如, MMLU 分数提高了 24 分, 达到 52%.<sup>9</sup> 我们期待把不同的模型规模, 模态, 数据集, 安全措施与评测纳入 OLMo 家族. 希望本次与未来的发布能赋权并壮大开放研究社区, 激发新一轮创新.

## Limitations 局限

We recognize building a large language model has many limitations. In fact, each step of the process of creating a language model, from the data to training to adaptation to evaluation each have their own limitations, and so we’ve added sections for each below. Of course we recognize that AI systems today can have broad societal reach, and therefore there are significant limitations beyond what we are able to fit into this section.

我们承认构建大语言模型有许多局限. 事实上, 从数据到训练, 适配再到评测, 创建语言模型过程的每一步都有各自局限, 因此下文分节说明. 当然我们也承认, 当今 AI 系统可有广泛社会影响, 因而存在超出本节篇幅所能覆盖的重要局限.

**Data** Our work focuses on pretraining data in English. We hope that our open framework enables the development of future models in more languages as well as multilingual models. The data that models are trained on is what gives models their capabilities, and at the scale of training a large language model we recognize that the data likely contains problematic content like toxic language, personal information, and copyrighted text. We mitigated this to the best of our ability but recognize there are no perfect approaches today that can completely remove such content.

**数据** 我们的工作聚焦英文预训练数据. 希望开放框架能促成更多语言以及多语模型的未来开发. 模型能力来自训练数据; 在大语言模型训练规模下, 我们承认数据中可能含有毒语言, 个人信息与受版权保护文本等有问题内容. 我们已尽力缓解, 但承认今天没有能彻底清除此类内容的完美方法.

**Training** Training a large language model is currently a challenging endeavor which is missing significant support from the open source community. With our limited page count we did not provide extensive training logs documenting, for example, training runs that diverged or failed to learn.

**训练** 训练大语言模型目前仍困难, 开源社区的支持也显著不足. 受页数限制, 我们未提供详尽训练日志, 例如记录发散或未能学习的训练 run.

**Adaptation** Our pretrained models face the same issues as existing pretrained LLMs, such as bias, toxicity and, hallucinations. Our adapted models are better at avoiding these generations, but they are not perfect. Additionally, we note that we largely adopt an existing data mixture designed for a different model family (TÜLU, designed for Llama models), and OLMo may require different data mixing to adjust for its unique strengths and weaknesses. The TÜLU mix itself also relies on data distilled from a variety of models, and we hope to reduce our reliance on such data in the future.

**适配** 我们的预训练模型面临与既有预训练 LLM 相同的问题, 如偏见, 毒性与幻觉. 适配模型更擅长避免这些生成, 但并不完美. 另外, 我们很大程度上采用为另一模型族设计的既有数据混合 (TÜLU, 为 Llama 模型设计), OLMo 可能需要不同的数据混合以匹配其独特强弱项. TÜLU 混合本身也依赖从多种模型蒸馏的数据, 我们希望未来减少对此类数据的依赖.

**Evaluation** While we’ve included comparisons on a variety of datasets to other current language models, many of the downstream tasks are not actually representative of how users interact with language models (i.e., as a chatbot). In addition, language model evaluations are currently very noisy; we aimed to include only evaluations on datasets that provided some signal as to which model performs best, but recognize that there is no perfect

**评测** 尽管我们在多种数据集上与其他当前语言模型做了对照, 许多下游任务并不能代表用户与语言模型交互的真实方式 (即作为聊天机器人). 此外, 语言模型评测目前噪声很大; 我们力图只纳入能就 「哪个模型更好」 提供若干信号的数据集评测, 但也承认不存在完美的

<small><span class="docvortex-page-footnote" data-block-type="page_footnote" style="color:#6b7280"><sup>9</sup>[https://medium.com/p/92b43f7d269d](https://blog.allenai.org/olmo-1-7-7b-a-24-point-improvement-on-mmlu-92b43f7d269d)</span></small>

<!-- page 10 of 21 -->

automatic evaluation, and thus comparisons should be taken with a grain of salt.

自动评测, 因此对照结果应谨慎看待.

## Ethics Statement 伦理声明

Through this work, we take the position that increased openness of language models is essential for scientific understanding of their abilities and limitations and for broad participation in the continued development of such models. Training on open data further enhances these benefits. In addition, our open release enables practitioners to take our models and build on them instead of having to train their own from scratch, in which case they would be repeating our work while consuming more resources and leading to an increased environmental impact. Of course, openness is not without risk; the possibility remains that these models will be used in unintended ways that cause harm. We believe that research and development efforts to understand and mitigate those potential harms will also be accelerated by the openness of the models, allowing a diversity of approaches and analyses. Over the past year there have been a number of comparable models released with very permissive licenses, so using a more strict license for our work would not remove the overall risk in the field. We believe this trade-off on the side of being more open is the best option.

通过本工作, 我们主张: 提升语言模型开放度, 对科学理解其能力与局限, 以及对广泛参与此类模型的持续开发至关重要. 在开放数据上训练进一步增强这些益处. 此外, 开放发布使实践者能够接手我们的模型并在其上构建, 而不必从头训练自己的模型——否则他们将重复我们的工作, 消耗更多资源并增加环境影响. 当然, 开放并非没有风险; 这些模型仍可能被用于造成伤害的非预期方式. 我们相信, 理解与缓解这些潜在伤害的研究与开发, 也会因模型开放而加速, 从而允许多样化的方法与分析. 过去一年已有大量可比模型以非常宽松的许可发布, 因此对我们的工作使用更严格许可并不会消除领域的总体风险. 我们相信, 在这一权衡上选择更开放是更好的选项.

## Acknowledgments 致谢

OLMo would not have been possible without the support of many individuals and institutions. The experimental components of this work were made possible through a partnership with AMD and CSC, enabling use of the LUMI supercomputer, and Kempner Institute at Harvard University. We thank Jonathan Frankle and the team at MosaicML (now Databricks) for sharing their experiences with FSDP, and building the code base that OLMo is based on. We thank our teammates Taira Anderson, Michelle Benedict, Jon Borchardt, Evie Cheng, Arnavi Chheda, Johann Dahm, Matt Latzke, Kelsey MacMillan, Aaron Sarnat, Carissa Schoenick, Sam Skjonsberg, Michael Schmitz, Michael Wilson, Caitlin Wittlif, and the entire IT team, for their help with the website, design, internal and external communications, budgeting, and other activities that supported smooth progress on this project. Finally, we also express gratitude for the helpful discussions and feedback from our teammates at AI2 and close collaborators, including Prithviraj (Raj)

若无众多个人与机构支持, OLMo 不可能完成. 实验部分得益于与 AMD 及 CSC 的合作, 从而得以使用 LUMI 超算, 以及哈佛大学 Kempner Institute. 感谢 Jonathan Frankle 与 MosaicML (现 Databricks) 团队分享 FSDP 经验, 并构建 OLMo 所基于的代码库. 感谢同事 Taira Anderson, Michelle Benedict, Jon Borchardt, Evie Cheng, Arnavi Chheda, Johann Dahm, Matt Latzke, Kelsey MacMillan, Aaron Sarnat, Carissa Schoenick, Sam Skjonsberg, Michael Schmitz, Michael Wilson, Caitlin Wittlif 以及整个 IT 团队, 在网站, 设计, 内外部沟通, 预算及其他保障项目顺利推进的活动上提供帮助. 最后, 也感谢 AI2 同事与紧密合作者的有益讨论与反馈, 包括 Prithviraj (Raj)

Ammanabrolu, Peter Clark, Nicole DeCario, Doug Downey, Ali Farhadi, Ian Ferreira, Väinö Hatanpää, Sham M. Kakade, Julien Launay, Sydney Levine, Pekka Manninen, Franzi Roessner, Maarten Sap, Ludwig Schmidt, Yulia Tsvetkov, and Daniel S. Weld.

Ammanabrolu, Peter Clark, Nicole DeCario, Doug Downey, Ali Farhadi, Ian Ferreira, Väinö Hatanpää, Sham M. Kakade, Julien Launay, Sydney Levine, Pekka Manninen, Franzi Roessner, Maarten Sap, Ludwig Schmidt, Yulia Tsvetkov, 与 Daniel S. Weld.

## References

Amro Abbas, Kushal Tirumala, Dániel Simig, Surya Ganguli, and Ari S Morcos. 2023. [Semdedup: Dataefficient learning at web-scale through semantic deduplication](https://arxiv.org/abs/2303.09540). arXiv preprint arXiv:2303.09540.

Ebtesam Almazrouei, Hamza Alobeidli, Abdulaziz Alshamsi, Alessandro Cappelli, Ruxandra-Aimée Co-jocaru, Daniel Hesslow, Julien Launay, Quentin Malartic, Daniele Mazzotta, Badreddine Noune, Baptiste Pannier, and Guilherme Penedo. 2023. [The falcon series of open language models](https://api.semanticscholar.org/CorpusID:265466629). ArXiv, abs/2311.16867.

Yuvanesh Anand, Zach Nussbaum, Brandon Duderstadt, Benjamin Schmidt, and Andriy Mulyar. 2023. Gpt4all: Training an assistant-style chatbot with large scale data distillation from gpt-3.5-turbo. [https://github.com/nomic-ai/gpt4all](https://github.com/nomic-ai/gpt4all).

Jimmy Ba, Jamie Ryan Kiros, and Geoffrey E. Hinton. 2016. [Layer normalization](https://api.semanticscholar.org/CorpusID:8236317). ArXiv, abs/1607.06450.

Yuntao Bai, Andy Jones, Kamal Ndousse, Amanda Askell, Anna Chen, Nova DasSarma, Dawn Drain, Stanislav Fort, Deep Ganguli, Tom Henighan, Nicholas Joseph, Saurav Kadavath, Jackson Kernion, Tom Conerly, Sheer El-Showk, Nelson Elhage, Zac Hatfield-Dodds, Danny Hernandez, Tristan Hume, Scott Johnston, Shauna Kravec, Liane Lovitt, Neel Nanda, Catherine Olsson, Dario Amodei, Tom Brown, Jack Clark, Sam McCandlish, Chris Olah, Ben Mann, and Jared Kaplan. 2022. [Training a helpful and harmless assistant with reinforcement learning from human feedback](http://arxiv.org/abs/2204.05862).

Yoshua Bengio, Réjean Ducharme, Pascal Vincent, and Christian Janvin. 2003. [A neural probabilistic language model](https://api.semanticscholar.org/CorpusID:221275765). J. Mach. Learn. Res., 3:1137–1155.

Stella Biderman, Hailey Schoelkopf, Quentin Gregory Anthony, Herbie Bradley, Kyle O’Brien, Eric Hallahan, Mohammad Aflah Khan, Shivanshu Purohit, Usvsn Sai Prashanth, Edward Raff, Aviya Skowron, Lintang Sutawika, and Oskar Van Der Wal. 2023. [Pythia: A suite for analyzing large language models across training and scaling](https://proceedings.mlr.press/v202/biderman23a.html). In Proceedings of the 40th International Conference on Machine Learning, volume 202 of Proceedings of Machine Learning Research, pages 2397–2430. PMLR.

BigScience, Teven Le Scao, Angela Fan, Christopher Akiki, Ellie Pavlick, Suzana Ilic, Daniel Hesslow, Ro- ´ man Castagné, Alexandra Sasha Luccioni, François

<!-- page 11 of 21 -->

Yvon, et al. 2022. Bloom: A 176b-parameter open-access multilingual language model. arXiv preprint arXiv:2211.05100.

Yonatan Bisk, Rowan Zellers, Jianfeng Gao, Yejin Choi, et al. 2020. [Piqa: Reasoning about physical commonsense in natural language](https://ojs.aaai.org/index.php/AAAI/article/view/6239). In Proceedings of the AAAI conference on artificial intelligence, volume 34, pages 7432–7439.

Sid Black, Stella Biderman, Eric Hallahan, Quentin Anthony, Leo Gao, Laurence Golding, Horace He, Connor Leahy, Kyle McDonell, Jason Phang, Michael Pieler, USVSN Sai Prashanth, Shivanshu Purohit, Laria Reynolds, Jonathan Tow, Ben Wang, and Samuel Weinbach. 2022. [GPT-NeoX-20B: An open-source autoregressive language model](https://arxiv.org/abs/2204.06745). In Proceedings of the ACL Workshop on Challenges & Perspectives in Creating Large Language Models.

Su Lin Blodgett, Lisa Green, and Brendan O’Connor. 2016. [Demographic dialectal variation in social media: A case study of African-American English](https://doi.org/10.18653/v1/D16-1120). In Proceedings of the 2016 Conference on Empirical Methods in Natural Language Processing, pages 1119–1130, Austin, Texas. Association for Computational Linguistics.

Tom B. Brown, Benjamin Mann, Nick Ryder, Melanie Subbiah, Jared Kaplan, Prafulla Dhariwal, Arvind Neelakantan, Pranav Shyam, Girish Sastry, Amanda Askell, Sandhini Agarwal, Ariel Herbert-Voss, Gretchen Krueger, T. J. Henighan, Rewon Child, Aditya Ramesh, Daniel M. Ziegler, Jeff Wu, Clemens Winter, Christopher Hesse, Mark Chen, Eric Sigler, Mateusz Litwin, Scott Gray, Benjamin Chess, Jack Clark, Christopher Berner, Sam McCandlish, Alec Radford, Ilya Sutskever, and Dario Amodei. 2020. [Language models are few-shot learners](https://api.semanticscholar.org/CorpusID:218971783). ArXiv, abs/2005.14165.

Wei-Lin Chiang, Zhuohan Li, Zi Lin, Ying Sheng, Zhanghao Wu, Hao Zhang, Lianmin Zheng, Siyuan Zhuang, Yonghao Zhuang, Joseph E. Gonzalez, Ion Stoica, and Eric P. Xing. 2023. [Vicuna: An open-source chatbot impressing gpt-4 with 90%\* chatgpt quality](https://lmsys.org/blog/2023-03-30-vicuna/).

Aakanksha Chowdhery, Sharan Narang, Jacob Devlin, Maarten Bosma, Gaurav Mishra, Adam Roberts, Paul Barham, Hyung Won Chung, Charles Sutton, Sebastian Gehrmann, Parker Schuh, Kensen Shi, Sasha Tsvyashchenko, Joshua Maynez, Abhishek Rao, Parker Barnes, Yi Tay, Noam Shazeer, Vinodkumar Prabhakaran, Emily Reif, Nan Du, Ben Hutchinson, Reiner Pope, James Bradbury, Jacob Austin, Michael Isard, Guy Gur-Ari, Pengcheng Yin, Toju Duke, Anselm Levskaya, Sanjay Ghemawat, Sunipa Dev, Henryk Michalewski, Xavier Garcia, Vedant Misra, Kevin Robinson, Liam Fedus, Denny Zhou, Daphne Ippolito, David Luan, Hyeontaek Lim, Barret Zoph, Alexander Spiridonov, Ryan Sepassi, David Dohan, Shivani Agrawal, Mark Omernick, Andrew M. Dai, Thanumalayan Sankaranarayana Pillai, Marie Pellat, Aitor Lewkowycz, Erica Moreira,

Rewon Child, Oleksandr Polozov, Katherine Lee, Zongwei Zhou, Xuezhi Wang, Brennan Saeta, Mark Diaz, Orhan Firat, Michele Catasta, Jason Wei, Kathy Meier-Hellstern, Douglas Eck, Jeff Dean, Slav Petrov, and Noah Fiedel. 2022. [Palm: Scaling language modeling with pathways](http://arxiv.org/abs/2204.02311).

Alexandra Chronopoulou, Matthew Peters, and Jesse Dodge. 2022. [Efficient hierarchical domain adaptation for pretrained language models](https://doi.org/10.18653/v1/2022.naacl-main.96). In Proceedings of the 2022 Conference of the North American Chapter of the Association for Computational Linguistics: Human Language Technologies, pages 1336–1351, Seattle, United States. Association for Computational Linguistics.

Hyung Won Chung, Noah Constant, Xavier García, Adam Roberts, Yi Tay, Sharan Narang, and Orhan Firat. 2023. [Unimax: Fairer and more effective language sampling for large-scale multilingual pretraining](https://api.semanticscholar.org/CorpusID:258187051). ArXiv, abs/2304.09151.

Christopher Clark, Kenton Lee, Ming-Wei Chang, Tom Kwiatkowski, Michael Collins, and Kristina Toutanova. 2019. Boolq: Exploring the surprising difficulty of natural yes/no questions. arXiv preprint arXiv:1905.10044.

Peter Clark, Isaac Cowhey, Oren Etzioni, Tushar Khot, Ashish Sabharwal, Carissa Schoenick, and Oyvind Tafjord. 2018. [Think you have solved question answering? try arc, the ai2 reasoning challenge](https://arxiv.org/abs/1803.05457). arXiv preprint arXiv:1803.05457.

Mike Conover, Matt Hayes, Ankit Mathur, Jianwei Xie, Jun Wan, Sam Shah, Ali Ghodsi, Patrick Wendell, Matei Zaharia, and Reynold Xin. 2023. [Free dolly: Introducing the world’s first truly open instructiontuned llm](https://www.databricks.com/blog/2023/04/12/dolly-first-open-commercially-viable-instruction-tuned-llm).

Ganqu Cui, Lifan Yuan, Ning Ding, Guanming Yao, Wei Zhu, Yuan Ni, Guotong Xie, Zhiyuan Liu, and Maosong Sun. 2023. [Ultrafeedback: Boosting language models with high-quality feedback](http://arxiv.org/abs/2310.01377).

Jesse Dodge, Taylor Prewitt, Remi Tachet Des Combes, Erika Odmark, Roy Schwartz, Emma Strubell, Alexandra Sasha Luccioni, Noah A. Smith, Nicole DeCario, and Will Buchanan. 2022. [Measuring the carbon intensity of ai in cloud instances](http://arxiv.org/abs/2206.05229).

William B. Dolan and Chris Brockett. 2005. [Automatically constructing a corpus of sentential paraphrases](https://www.microsoft.com/en-us/research/publication/automatically-constructing-a-corpus-of-sentential-paraphrases/). In International Joint Conference on Natural Language Processing.

Yanai Elazar, Akshita Bhagia, Ian Helgi Magnusson, Abhilasha Ravichander, Dustin Schwenk, Alane Suhr, Evan Pete Walsh, Dirk Groeneveld, Luca Soldaini, Sameer Singh, Hanna Hajishirzi, Noah A. Smith, and Jesse Dodge. 2024. [What’s in my big data?](https://openreview.net/forum?id=RvfPnOkPV4) In The Twelfth International Conference on Learning Representations.

<!-- page 12 of 21 -->

Leo Gao, Stella Biderman, Sid Black, Laurence Golding, Travis Hoppe, Charles Foster, Jason Phang, Horace He, Anish Thite, Noa Nabeshima, et al. 2020. [The pile: An 800gb dataset of diverse text for language modeling](https://arxiv.org/abs/2101.00027). arXiv preprint arXiv:2101.00027.

Leo Gao, Jonathan Tow, Baber Abbasi, Stella Biderman, Sid Black, Anthony DiPofi, Charles Foster, Laurence Golding, Jeffrey Hsu, Alain Le Noac’h, Haonan Li, Kyle McDonell, Niklas Muennighoff, Chris Ociepa, Jason Phang, Laria Reynolds, Hailey Schoelkopf, Aviya Skowron, Lintang Sutawika, Eric Tang, Anish Thite, Ben Wang, Kevin Wang, and Andy Zou. 2023. [A framework for few-shot language model evaluation](https://doi.org/10.5281/zenodo.10256836).

Sidney Greenbaum and Gerald Nelson. 1996. [The international corpus of english (ICE) project](https://doi.org/10.1111/j.1467-971x.1996.tb00088.x). World Englishes, 15(1):3–15.

Dirk Groeneveld, Anas Awadalla, Iz Beltagy, Akshita Bhagia, Ian Magnusson, Hao Peng, Oyvind Tafjord, Pete Walsh, Kyle Richardson, and Jesse Dodge. 2023. [Catwalk: A unified language model evaluation framework for many datasets](https://arxiv.org/abs/2312.10253). arXiv preprint arXiv:2312.10253.

Biyang Guo, Xin Zhang, Ziyuan Wang, Minqi Jiang, Jinran Nie, Yuxuan Ding, Jianwei Yue, and Yupeng Wu. 2023. How close is chatgpt to human experts? comparison corpus, evaluation, and detection. arXiv preprint arxiv:2301.07597.

Suchin Gururangan, Mitchell Wortsman, Samir Yitzhak Gadre, Achal Dave, Maciej Kilian, Weijia Shi, Jean Mercat, Georgios Smyrnis, Gabriel Ilharco, Matt Jordan, Reinhard Heckel, Alex Dimakis, Ali Farhadi, Vaishaal Shankar, and Ludwig Schmidt. 2023. [OpenLM: a minimal but performative language modeling (lm) repository](https://github.com/mlfoundations/open_lm/). GitHub repository.

Thomas Hartvigsen, Saadia Gabriel, Hamid Palangi, Maarten Sap, Dipankar Ray, and Ece Kamar. 2022. [TOXIGEN: Controlling Language Models to Generate Implied and Adversarial Toxicity](https://arxiv.org/abs/2203.09509). In ACL.

Dan Hendrycks, Collin Burns, Steven Basart, Andy Zou, Mantas Mazeika, Dawn Song, and Jacob Steinhardt. 2021. Measuring massive multitask language understanding. Proceedings of the International Conference on Learning Representations (ICLR).

Hamish Ivison, Yizhong Wang, Valentina Pyatkin, Nathan Lambert, Matthew Peters, Pradeep Dasigi, Joel Jang, David Wadden, Noah A. Smith, Iz Beltagy, and Hannaneh Hajishirzi. 2023. [Camels in a changing climate: Enhancing lm adaptation with tulu 2](http://arxiv.org/abs/2311.10702).

Albert Q Jiang, Alexandre Sablayrolles, Antoine Roux, Arthur Mensch, Blanche Savary, Chris Bamford, Devendra Singh Chaplot, Diego de las Casas, Emma Bou Hanna, Florian Bressand, et al. 2024. [Mixtral of experts](https://arxiv.org/abs/2401.04088). arXiv preprint arXiv:2401.04088.

Andreas Köpf, Yannic Kilcher, Dimitri von Rütte, Sotiris Anagnostidis, Zhi Rui Tam, Keith Stevens, Abdullah Barhoum, Duc Minh Nguyen, Oliver Stanley, Richárd Nagyfi, Shahul ES, Sameer Suri, David Alexandrovich Glushkov, Arnav Varma Dantuluri, Andrew Maguire, Christoph Schuhmann, Huu Nguyen, and Alexander Julian Mattick. 2023. [Openassistant conversations - democratizing large language model alignment](https://openreview.net/forum?id=VSJotgbPHF). In Thirty-seventh Conference on Neural Information Processing Systems Datasets and Benchmarks Track.

Xuechen Li, Tianyi Zhang, Yann Dubois, Rohan Taori, Ishaan Gulrajani, Carlos Guestrin, Percy Liang, and Tatsunori B. Hashimoto. 2023. [Alpacaeval: An automatic evaluator of instruction-following models](https://github.com/tatsu-lab/alpaca_eval). Github repository.

Percy Liang, Rishi Bommasani, Tony Lee, Dimitris Tsipras, Dilara Soylu, Michihiro Yasunaga, Yian Zhang, Deepak Narayanan, Yuhuai Wu, Ananya Kumar, et al. 2022. [Holistic evaluation of language models](https://arxiv.org/abs/2211.09110). arXiv preprint arXiv:2211.09110.

Stephanie Lin, Jacob Hilton, and Owain Evans. 2022. Truthfulqa: Measuring how models mimic human falsehoods. In Proceedings of the 60th Annual Meeting of the Association for Computational Linguistics (Volume 1: Long Papers), pages 3214–3252.

Jian Liu, Leyang Cui, Hanmeng Liu, Dandan Huang, Yile Wang, and Yue Zhang. 2020. [Logiqa: A challenge dataset for machine reading comprehension with logical reasoning](http://arxiv.org/abs/2007.08124). CoRR, abs/2007.08124.

Zhengzhong Liu, Aurick Qiao, Willie Neiswanger, Hongyi Wang, Bowen Tan, Tianhua Tao, Junbo Li, Yuqi Wang, Suqi Sun, Omkar Pangarkar, et al. 2023. [Llm360: Towards fully transparent open-source llms](https://arxiv.org/abs/2312.06550). arXiv preprint arXiv:2312.06550.

Ilya Loshchilov and Frank Hutter. 2019. [Decoupled weight decay regularization](https://openreview.net/forum?id=Bkg6RiCqY7). In International Conference on Learning Representations.

Alexandra Sasha Luccioni, Sylvain Viguier, and Anne-Laure Ligozat. 2022. [Estimating the carbon footprint of bloom, a 176b parameter language model](http://arxiv.org/abs/2211.02001).

Ian Magnusson, Akshita Bhagia, Valentin Hofmann, Luca Soldaini, Ananya Harsh Jha, Oyvind Tafjord, Dustin Schwenk, Evan Pete Walsh, Yanai Elazar, Kyle Lo, et al. 2023. Paloma: A benchmark for evaluating language model fit. arXiv preprint arXiv:2312.10523.

Mitchell P. Marcus, Beatrice Santorini, Mary Ann Marcinkiewicz, and Ann Taylor. 1999. [Treebank-3](https://doi.org/10.35111/GQ1X-J780).

Stephen Merity, Caiming Xiong, James Bradbury, and Richard Socher. 2016. [Pointer sentinel mixture models](https://api.semanticscholar.org/CorpusID:16299141). ArXiv, abs/1609.07843.

<!-- page 13 of 21 -->

Paulius Micikevicius, Sharan Narang, Jonah Alben, Gregory Frederick Diamos, Erich Elsen, David García, Boris Ginsburg, Michael Houston, Oleksii Kuchaiev, Ganesh Venkatesh, and Hao Wu. 2017. [Mixed precision training](https://api.semanticscholar.org/CorpusID:3297437). ArXiv, abs/1710.03740.

Todor Mihaylov, Peter Clark, Tushar Khot, and Ashish Sabharwal. 2018. [Can a suit of armor conduct electricity? a new dataset for open book question answering](https://arxiv.org/abs/1809.02789). arXiv preprint arXiv:1809.02789.

Tomas Mikolov, Ilya Sutskever, Kai Chen, Gregory S. Corrado, and Jeffrey Dean. 2013. [Distributed representations of words and phrases and their compositionality](https://api.semanticscholar.org/CorpusID:16447573). In Neural Information Processing Systems.

Swaroop Mishra, Daniel Khashabi, Chitta Baral, and Hannaneh Hajishirzi. 2022. [Cross-task generalization via natural language crowdsourcing instructions](https://doi.org/10.18653/v1/2022.acl-long.244). In Proceedings of the 60th Annual Meeting of the Association for Computational Linguistics (Volume 1: Long Papers), pages 3470–3487, Dublin, Ireland. Association for Computational Linguistics.

MosaicML NLP Team. 2023. [Introducing mpt-7b: A new standard for open-source, commercially usable llms](https://www.mosaicml.com/blog/mpt-7b). Accessed: 2023-05-05.

Niklas Muennighoff, Alexander M Rush, Boaz Barak, Teven Le Scao, Aleksandra Piktus, Nouamane Tazi, Sampo Pyysalo, Thomas Wolf, and Colin Raffel. 2023. Scaling data-constrained language models. arXiv preprint arXiv:2305.16264.

Davide Nunes. 2020. [Preprocessed penn tree bank](https://doi.org/10.5281/ZENODO.3910021).

OpenAI. 2023. [Gpt-4 technical report](https://api.semanticscholar.org/CorpusID:257532815). ArXiv, abs/2303.08774.

Long Ouyang, Jeffrey Wu, Xu Jiang, Diogo Almeida, Carroll Wainwright, Pamela Mishkin, Chong Zhang, Sandhini Agarwal, Katarina Slama, Alex Ray, John Schulman, Jacob Hilton, Fraser Kelton, Luke Miller, Maddie Simens, Amanda Askell, Peter Welinder, Paul F Christiano, Jan Leike, and Ryan Lowe. 2022. [Training language models to follow instructions with human feedback](https://proceedings.neurips.cc/paper_files/paper/2022/file/b1efde53be364a73914f58805a001731-Paper-Conference.pdf). In Advances in Neural Information Processing Systems, volume 35, pages 27730–27744. Curran Associates, Inc.

Antonis Papasavva, Savvas Zannettou, Emiliano De Cristofaro, Gianluca Stringhini, and Jeremy Blackburn. 2020. [Raiders of the lost kek: 3.5 years of augmented 4chan posts from the politically incorrect board](https://doi.org/10.1609/icwsm.v14i1.7354). Proceedings of the International AAAI Conference on Web and Social Media, 14:885–894.

David Patterson, Joseph Gonzalez, Quoc Le, Chen Liang, Lluis-Miquel Munguia, Daniel Rothchild, David So, Maud Texier, and Jeff Dean. 2021. [Carbon emissions and large neural network training](http://arxiv.org/abs/2104.10350).

Guilherme Penedo, Quentin Malartic, Daniel Hesslow, Ruxandra-Aimée Cojocaru, Alessandro Cappelli, Hamza Alobeidli, Baptiste Pannier, Ebtesam

Almazrouei, and Julien Launay. 2023. [The refinedweb dataset for falcon llm: Outperforming curated corpora with web data, and web data only](https://api.semanticscholar.org/CorpusID:259063761). ArXiv, abs/2306.01116.

Matthew E. Peters, Mark Neumann, Mohit Iyyer, Matt Gardner, Christopher Clark, Kenton Lee, and Luke Zettlemoyer. 2018. [Deep contextualized word representations](https://api.semanticscholar.org/CorpusID:3626819). ArXiv, abs/1802.05365.

Mohammad Taher Pilehvar and José Camacho-Collados. 2018. [Wic: 10, 000 example pairs for evaluating context-sensitive representations](http://arxiv.org/abs/1808.09121). CoRR, abs/1808.09121.

Jack W. Rae, Sebastian Borgeaud, Trevor Cai, Katie Millican, Jordan Hoffmann, Francis Song, John Aslanides, Sarah Henderson, Roman Ring, Susannah Young, Eliza Rutherford, Tom Hennigan, Jacob Menick, Albin Cassirer, Richard Powell, George van den Driessche, Lisa Anne Hendricks, Maribeth Rauh, Po-Sen Huang, Amelia Glaese, Johannes Welbl, Sumanth Dathathri, Saffron Huang, Jonathan Uesato, John Mellor, Irina Higgins, Antonia Creswell, Nat McAleese, Amy Wu, Erich Elsen, Siddhant Jayakumar, Elena Buchatskaya, David Budden, Esme Sutherland, Karen Simonyan, Michela Paganini, Laurent Sifre, Lena Martens, Xiang Lorraine Li, Adhiguna Kuncoro, Aida Nematzadeh, Elena Gribovskaya, Domenic Donato, Angeliki Lazaridou, Arthur Mensch, Jean-Baptiste Lespiau, Maria Tsimpoukelli, Nikolai Grigorev, Doug Fritz, Thibault Sottiaux, Mantas Pajarskas, Toby Pohlen, Zhitao Gong, Daniel Toyama, Cyprien de Masson d’Autume, Yujia Li, Tayfun Terzi, Vladimir Mikulik, Igor Babuschkin, Aidan Clark, Diego de Las Casas, Aurelia Guy, Chris Jones, James Bradbury, Matthew Johnson, Blake Hechtman, Laura Weidinger, Iason Gabriel, William Isaac, Ed Lockhart, Simon Osindero, Laura Rimell, Chris Dyer, Oriol Vinyals, Kareem Ayoub, Jeff Stanway, Lorrayne Bennett, Demis Hassabis, Koray Kavukcuoglu, and Geoffrey Irving. 2022. [Scaling language models: Methods, analysis & insights from training gopher](http://arxiv.org/abs/2112.11446).

Rafael Rafailov, Archit Sharma, Eric Mitchell, Christopher D Manning, Stefano Ermon, and Chelsea Finn. 2023. [Direct preference optimization: Your language model is secretly a reward model](https://openreview.net/forum?id=HPuSIXJaa9). In Thirty-seventh Conference on Neural Information Processing Systems.

Colin Raffel, Noam Shazeer, Adam Roberts, Katherine Lee, Sharan Narang, Michael Matena, Yanqi Zhou, Wei Li, and Peter J. Liu. 2020. Exploring the limits of transfer learning with a unified text-to-text transformer. J. Mach. Learn. Res., 21(1).

Samyam Rajbhandari, Jeff Rasley, Olatunji Ruwase, and Yuxiong He. 2019. [Zero: Memory optimizations toward training trillion parameter models](https://api.semanticscholar.org/CorpusID:203736482). SC20: International Conference for High Performance Computing, Networking, Storage and Analysis, pages 1–16.

<!-- page 14 of 21 -->

Machel Reid, Victor Zhong, Suchin Gururangan, and Luke Zettlemoyer. 2022. [M2D2: A massively multi-domain language modeling dataset](https://aclanthology.org/2022.emnlp-main.63). In Proceedings of the 2022 Conference on Empirical Methods in Natural Language Processing, pages 964–975, Abu Dhabi, United Arab Emirates. Association for Computational Linguistics.

Manoel Horta Ribeiro, Jeremy Blackburn, Barry Bradlyn, Emiliano De Cristofaro, Gianluca Stringhini, Summer Long, Stephanie Greenberg, and Savvas Zannettou. 2021. [The evolution of the manosphere across the web](https://doi.org/10.1609/icwsm.v15i1.18053). Proceedings of the International AAAI Conference on Web and Social Media, 15:196–207.

Ronald Rosenfeld. 2000. Two decades of statistical language modeling: Where do we go from here? Proceedings of the IEEE, 88(8):1270–1278.

Keisuke Sakaguchi, Ronan Le Bras, Chandra Bhagavatula, and Yejin Choi. 2021. [Winogrande: An adversarial winograd schema challenge at scale](https://dl.acm.org/doi/abs/10.1145/3474381). Communications of the ACM, 64(9):99–106.

Victor Sanh, Albert Webson, Colin Raffel, Stephen Bach, Lintang Sutawika, Zaid Alyafeai, Antoine Chaffin, Arnaud Stiegler, Arun Raja, Manan Dey, M Saiful Bari, Canwen Xu, Urmish Thakker, Shanya Sharma Sharma, Eliza Szczechla, Taewoon Kim, Gunjan Chhablani, Nihal Nayak, Debajyoti Datta, Jonathan Chang, Mike Tian-Jian Jiang, Han Wang, Matteo Manica, Sheng Shen, Zheng Xin Yong, Harshit Pandey, Rachel Bawden, Thomas Wang, Trishala Neeraj, Jos Rozen, Abheesht Sharma, Andrea Santilli, Thibault Fevry, Jason Alan Fries, Ryan Teehan, Teven Le Scao, Stella Biderman, Leo Gao, Thomas Wolf, and Alexander M Rush. 2022. [Multi-task prompted training enables zero-shot task generalization](https://openreview.net/forum?id=9Vrb9D0WI4). In International Conference on Learning Representations.

Noam M. Shazeer. 2020. [Glu variants improve transformer](https://api.semanticscholar.org/CorpusID:211096588). ArXiv, abs/2002.05202.

Luca Soldaini, Rodney Kinney, Akshita Bhagia, Dustin Schwenk, David Atkinson, Russell Authur, Ben Bogin, Khyathi Chandu, Jennifer Dumas, Yanai Elazar, Valentin Hofmann, Ananya Harsh Jha, Sachin Kumar, Li Lucy, Xinxi Lyu, Nathan Lambert, Ian Magnusson, Jacob Morrison, Niklas Muennighoff, Aakanksha Naik, Crystal Nam, Matthew E. Peters, Abhilasha Ravichander, Kyle Richardson, Zejiang Shen, Emma Strubell, Nishant Subramani, Oyvind Tafjord, Pete Walsh, Luke Zettlemoyer, Noah A. Smith, Hannaneh Hajishirzi, Iz Beltagy, Dirk Groeneveld, Jesse Dodge, and Kyle Lo. 2024. Dolma: an Open Corpus of Three Trillion Tokens for Language Model Pretraining Research. arXiv preprint.

Emma Strubell, Ananya Ganesh, and Andrew McCallum. 2019. [Energy and policy considerations for deep learning in NLP](https://doi.org/10.18653/v1/P19-1355). In Proceedings of the 57th Annual Meeting of the Association for Computational Linguistics, pages 3645–3650, Florence, Italy. Association for Computational Linguistics.

Jianlin Su, Yu Lu, Shengfeng Pan, Bo Wen, and Yunfeng Liu. 2021. [Roformer: Enhanced transformer with rotary position embedding](https://api.semanticscholar.org/CorpusID:233307138). ArXiv, abs/2104.09864.

Rohan Taori, Ishaan Gulrajani, Tianyi Zhang, Yann Dubois, Xuechen Li, Carlos Guestrin, Percy Liang, and Tatsunori B. Hashimoto. 2023. Stanford alpaca: An instruction-following llama model. [https://github.com/tatsu-lab/stanford\_alpaca](https://github.com/tatsu-lab/stanford_alpaca).

Teknium1. 2023. Gpteacher. [https://github.com/teknium1/GPTeacher](https://github.com/teknium1/GPTeacher).

Together Computer. 2023. [RedPajama: An Open Source Recipe to Reproduce LLaMA training dataset](https://github.com/togethercomputer/RedPajama-Data).

Hugo Touvron, Thibaut Lavril, Gautier Izacard, Xavier Martinet, Marie-Anne Lachaux, Timothée Lacroix, Baptiste Rozière, Naman Goyal, Eric Hambro, Faisal Azhar, Aurelien Rodriguez, Armand Joulin, Edouard Grave, and Guillaume Lample. 2023a. [Llama: Open and efficient foundation language models](https://api.semanticscholar.org/CorpusID:257219404). ArXiv, abs/2302.13971.

Hugo Touvron, Louis Martin, Kevin Stone, Peter Albert, Amjad Almahairi, Yasmine Babaei, Nikolay Bashlykov, Soumya Batra, Prajjwal Bhargava, Shruti Bhosale, Dan Bikel, Lukas Blecher, Cristian Canton Ferrer, Moya Chen, Guillem Cucurull, David Esiobu, Jude Fernandes, Jeremy Fu, Wenyin Fu, Brian Fuller, Cynthia Gao, Vedanuj Goswami, Naman Goyal, Anthony Hartshorn, Saghar Hosseini, Rui Hou, Hakan Inan, Marcin Kardas, Viktor Kerkez, Madian Khabsa, Isabel Kloumann, Artem Korenev, Punit Singh Koura, Marie-Anne Lachaux, Thibaut Lavril, Jenya Lee, Diana Liskovich, Yinghai Lu, Yuning Mao, Xavier Martinet, Todor Mihaylov, Pushkar Mishra, Igor Molybog, Yixin Nie, Andrew Poulton, Jeremy Reizenstein, Rashi Rungta, Kalyan Saladi, Alan Schelten, Ruan Silva, Eric Michael Smith, Ranjan Subramanian, Xiaoqing Ellen Tan, Binh Tang, Ross Taylor, Adina Williams, Jian Xiang Kuan, Puxin Xu, Zheng Yan, Iliyan Zarov, Yuchen Zhang, Angela Fan, Melanie Kambadur, Sharan Narang, Aurelien Rodriguez, Robert Stojnic, Sergey Edunov, and Thomas Scialom. 2023b. [Llama 2: Open foundation and fine-tuned chat models](http://arxiv.org/abs/2307.09288).

María Ubierna, Cristina Díez Santos, and Sara Mercier-Blais. 2022. [Water Security and Climate Change: Hydropower Reservoir Greenhouse Gas Emissions](https://doi.org/10.1007/978-981-16-5493-0_5), pages 69–94. Springer Singapore, Singapore.

Ashish Vaswani, Noam Shazeer, Niki Parmar, Jakob Uszkoreit, Llion Jones, Aidan N Gomez, Ł ukasz Kaiser, and Illia Polosukhin. 2017. [Attention is all you need](https://proceedings.neurips.cc/paper_files/paper/2017/file/3f5ee243547dee91fbd053c1c4a845aa-Paper.pdf). In Advances in Neural Information Processing Systems, volume 30. Curran Associates, Inc.

David Vilares and Carlos Gómez-Rodríguez. 2019. [HEAD-QA: A healthcare dataset for complex reasoning](https://doi.org/10.18653/v1/P19-1092). In Proceedings of the 57th Annual Meeting of the Association for Computational Linguistics, pages 960–966, Florence, Italy. Association for Computational Linguistics.

<!-- page 15 of 21 -->

Alex Wang, Amanpreet Singh, Julian Michael, Felix Hill, Omer Levy, and Samuel R. Bowman. 2018. [Glue: A multi-task benchmark and analysis platform for natural language understanding](https://arxiv.org/abs/1804.07461). ArXiv, abs/1804.07461.

Yizhong Wang, Hamish Ivison, Pradeep Dasigi, Jack Hessel, Tushar Khot, Khyathi Raghavi Chandu, David Wadden, Kelsey MacMillan, Noah A. Smith, Iz Beltagy, and Hannaneh Hajishirzi. 2023. [How far can camels go? exploring the state of instruction tuning on open resources](http://arxiv.org/abs/2306.04751).

Jason Wei, Maarten Bosma, Vincent Zhao, Kelvin Guu, Adams Wei Yu, Brian Lester, Nan Du, Andrew M. Dai, and Quoc V Le. 2022. [Finetuned language models are zero-shot learners](https://openreview.net/forum?id=gEZrGCozdqR). In International Conference on Learning Representations.

Johannes Welbl, Nelson F Liu, and Matt Gardner. 2017. [Crowdsourcing multiple choice science questions](https://arxiv.org/abs/1707.06209). arXiv preprint arXiv:1707.06209.

Carole-Jean Wu, Ramya Raghavendra, Udit Gupta, Bilge Acun, Newsha Ardalani, Kiwan Maeng, Gloria Chang, Fiona Aga Behram, James Huang, Charles Bai, Michael Gschwind, Anurag Gupta, Myle Ott, Anastasia Melnikov, Salvatore Candido, David Brooks, Geeta Chauhan, Benjamin Lee, Hsien-Hsin S. Lee, Bugra Akyildiz, Maximilian Balandat, Joe Spisak, Ravi Jain, Mike Rabbat, and Kim Hazelwood. 2022. [Sustainable ai: Environmental implications, challenges and opportunities](http://arxiv.org/abs/2111.00364).

Can Xu, Qingfeng Sun, Kai Zheng, Xiubo Geng, Pu Zhao, Jiazhan Feng, Chongyang Tao, Qingwei Lin, and Daxin Jiang. 2024. [WizardLM: Empowering large pre-trained language models to follow complex instructions](https://openreview.net/forum?id=CfXh93NDgH). In The Twelfth International Conference on Learning Representations.

Canwen Xu, Daya Guo, Nan Duan, and Julian McAuley. 2023. Baize: An open-source chat model with parameter-efficient tuning on self-chat data. arXiv preprint arXiv:2304.01196.

Savvas Zannettou, Barry Bradlyn, Emiliano De Cristofaro, Haewoon Kwak, Michael Sirivianos, Gianluca Stringini, and Jeremy Blackburn. 2018. [What is gab: A bastion of free speech or an alt-right echo chamber](https://doi.org/10.1145/3184558.3191531). In Companion Proceedings of the The Web Conference 2018, WWW ’18, page 1007–1014, Republic and Canton of Geneva, CHE. International World Wide Web Conferences Steering Committee.

Rowan Zellers, Ari Holtzman, Yonatan Bisk, Ali Farhadi, and Yejin Choi. 2019. [Hellaswag: Can a machine really finish your sentence?](https://arxiv.org/abs/1905.07830) arXiv preprint arXiv:1905.07830.

Biao Zhang and Rico Sennrich. 2019. [Root mean square layer normalization](https://api.semanticscholar.org/CorpusID:113405151). ArXiv, abs/1910.07467.

Susan Zhang, Stephen Roller, Naman Goyal, Mikel Artetxe, Moya Chen, Shuohui Chen, Christopher Dewan, Mona Diab, Xian Li, Xi Victoria Lin, Todor Mihaylov, Myle Ott, Sam Shleifer, Kurt Shuster, Daniel

Simig, Punit Singh Koura, Anjali Sridhar, Tianlu Wang, and Luke Zettlemoyer. 2022. [Opt: Open pre-trained transformer language models](http://arxiv.org/abs/2205.01068).

Yanli Zhao, Andrew Gu, Rohan Varma, Liangchen Luo, Chien chin Huang, Min Xu, Less Wright, Hamid Shojanazeri, Myle Ott, Sam Shleifer, Alban Desmaison, Can Balioglu, Bernard Nguyen, Geeta Chauhan, Yuchen Hao, and Shen Li. 2023. [Pytorch fsdp: Experiences on scaling fully sharded data parallel](https://api.semanticscholar.org/CorpusID:258297871). Proc. VLDB Endow., 16:3848–3860.

<!-- page 16 of 21 -->

## A Training Settings

Table 5 summarizes the model architecture and the optimizer parameters of OLMo-7B as well as recent similar-sized models.

## B Power Consumption and Carbon Footprint

Following previous literature (Strubell et al., 2019; Patterson et al., 2021; Wu et al., 2022; Dodge et al., 2022), we estimate the total energy consumed and carbon released while pretraining our models by calculating the total power consumption required for training, and then multiplying it by the carbon emission intensity of the power grid where the model was trained. While reporting these operational emissions is standard practice, it does not account for other sources of emissions such as the embodied emissions due to the manufacturing, transportation, and disposal of hardware and datacenter infrastructure, lifetime operational emissions due to use, rebound effects, or other environmental impacts such as water consumption or mining. Thus our estimates should be viewed as lower bounds.

我们沿用已有文献 (Strubell et al., 2019; Patterson et al., 2021; Wu et al., 2022; Dodge et al., 2022) 的做法, 通过计算训练所需的总功耗, 再乘以模型训练地电网的碳排放强度, 来估算预训练模型所消耗的总能源与释放的总碳量. 报告这类运行排放是标准做法, 但它并未计入其他排放来源, 例如硬件与数据中心基础设施制造, 运输与处置产生的隐含排放, 使用阶段的终身运行排放, 反弹效应, 或耗水, 采矿等其他环境影响. 因此, 我们的估算应视为下限.

We calculate the total power consumption for our models by measuring the power consumption of a single node every 25ms, calculating an average across the entire training run, and multiplying by the total number of nodes. We then account for the energy efficiency of the data center by multiplying the previous total by a power usage effectiveness (PUE) factor, which we set to 1.1, representing a conservative 10% energy consumption overhead typical of energy efficient datacenters.1011 We estimate that pretraining our 7B models consumed **239 MWh** of energy.

我们这样计算模型的总功耗: 每 25ms 测量单节点的功耗, 对整个训练过程取平均, 再乘以节点总数. 接着乘以数据中心的能源效率因子, 即 PUE (电能使用效率) 系数, 取 1.1, 代表节能数据中心典型的 10% 保守能耗开销.1011 我们估算 7B 模型的预训练消耗了 **239 MWh** 能源.

To calculate carbon emissions, we multiply the total power consumption by a carbon intensity fac tor, measured in kg $\mathrm { C O _ { 2 } }$ emitted per KWh, based on the physical location of the data center where each model was trained. The model trained on A100-40GB GPUs was trained in Australia, so we assume a carbon intensity factor of $0 . 6 1 0 ,$ the national average for Australia in 2022. The model trained on MI250X GPUs was trained in the LUMI

supercomputer, which runs on 100% renewable, carbon-neutral energy, so we assume a carbon intensity factor of 0. LUMI is powered entirely by hydroelectric power and some sources (Ubierna et al., 2022) measure the carbon intensity factor of hydroelectric power to be 0.024, which would imply total carbon emissions of $3 . 5 4 ~ \mathrm { t C O _ { 2 } e q } .$ 13 However, we rely on the official LUMI data for our calculations, and thus we estimate total pretraining emissions of $\mathbf { 6 9 . 7 8 \; t C O _ { 2 } e q . } ^ { 1 4 }$ In Table 6 we compare our models with other previously released models based on publicly available information.

计算碳排放时, 我们用总功耗乘以碳强度因子 (以每 kWh 排放的 kg $\mathrm { C O _ { 2 } }$ 计), 该因子依据各模型训练数据中心的实际地理位置确定. 在 A100-40GB GPU 上训练的模型训练于澳大利亚, 故取 0.610, 即 2022 年澳大利亚全国平均值. 在 MI250X GPU 上训练的模型运行于 LUMI 超级计算机, 其使用 100% 可再生, 碳中和能源, 故取碳强度因子为 0. LUMI 完全由水电供电, 有来源 (Ubierna et al., 2022) 测得水电的碳强度因子为 0.024, 对应总碳排放 $3 . 5 4 ~ \mathrm { t C O _ { 2 } e q } .$ 13 但我们的计算以 LUMI 官方数据为准, 因此估算预训练总排放为 $\mathbf { 6 9 . 7 8 \; t C O _ { 2 } e q . } ^ { 1 4 }$ 表 6 基于公开信息将我们的模型与其他已发布模型做了对比.

We hope that openly releasing our models can reduce future emissions by allowing others to avoid the need to pretrain models from scratch, and give insights into the true cost of developing state of the art models. We also highlight that our estimates are lower bounds, because they do not include other critical pieces of development such as debugging, hyperparameter tuning, and downtime.

我们希望开放发布模型能降低未来排放 —— 让其他人无需从头预训练模型, 并让外界看清开发最先进模型的真实成本. 我们也强调, 我们的估算是下限, 因为未包含调试, 超参调优与停机等开发环节的其他关键开销.

## C Additional Evaluation

**Additional perplexity results** In Figure 3 we provide results for each of the 7 data sources in Paloma (Magnusson et al., 2023) that are excluded from the combined metric in Figure 2. Some of these sources such as Pile (Gao et al., 2020) and ICE (Greenbaum and Nelson, 1996) are not publicly available at this time. Dolma 100 Programming Languages (Soldaini et al., 2024) consists of code data that is not supported by the decontamination approach used in Paloma. TwitterAAE (Blodgett et al., 2016), along with ICE, are datasets for targeted analyses of disparities in performance between different dialects and as such should be evaluated separately. And finally, the Manosphere, Gab, and 4chan corpora (Ribeiro et al., 2021; Zannettou et al., 2018; Papasavva et al., 2020) are intended to examine model fit to language from fringe online communities that are studied for prevalent hate speech and toxicity. Thus minimizing perplexity on these fringe corpora is not always desirable.

**补充困惑度结果** 图 3 给出了 Paloma (Magnusson et al., 2023) 中被排除在图 2 综合指标之外的 7 个数据源的各自结果. 其中一些数据源, 如 Pile (Gao et al., 2020) 与 ICE (Greenbaum and Nelson, 1996), 目前并不公开. Dolma 100 Programming Languages (Soldaini et al., 2024) 是不受 Paloma 去污染方法支持的代码数据. TwitterAAE (Blodgett et al., 2016) 与 ICE 是用于针对性分析不同方言之间性能差异的数据集, 因此应单独评测. 最后, Manosphere, Gab 与 4chan 语料 (Ribeiro et al., 2021; Zannettou et al., 2018; Papasavva et al., 2020) 意在考察模型对边缘网络社区语言的拟合程度, 这些社区因仇恨言论与毒性盛行而被研究. 因此, 在这类边缘语料上压低困惑度并非总是可取的目标.

One notable result here is that OLMo-7B is much farther ahead of the other models on Dolma 100 Programming Languages (100 PLs). Note that this effect may be due in part to underestimation from contamination, as decontaminating code data is beyond the scope of the method in Paloma. At the

<small><span class="docvortex-page-footnote" data-block-type="page_footnote" style="color:#6b7280">10<a href="https://www.nrel.gov/computational-science/measuring-efficiency-pue.html"><sub>https</sub>://www.nrel.gov/computational-science/measuring-efficiency-pue.html</a></span></small>

<small><span class="docvortex-page-footnote" data-block-type="page_footnote" style="color:#6b7280">11<a href="https://www.google.com/about/datacenters/efficiency/"><sub>https</sub>://www.google.com/about/datacenters/efficiency/</a></span></small>

<small><span class="docvortex-page-footnote" data-block-type="page_footnote" style="color:#6b7280">12<a href="https://www.cleanenergyregulator.gov.au/Infohub/Markets/Pages/qcmr/december-quarter-2022/Emissions-Reduction.aspx"><sub>https</sub>://www.cleanenergyregulator.</a></span></small>

<small><span class="docvortex-page-footnote" data-block-type="page_footnote" style="color:#6b7280">[gov.au/Infohub/Markets/Pages/qcmr/](https://www.cleanenergyregulator.gov.au/Infohub/Markets/Pages/qcmr/december-quarter-2022/Emissions-Reduction.aspx)</span></small>

<small><span class="docvortex-page-footnote" data-block-type="page_footnote" style="color:#6b7280">13<a href="https://www.lumi-supercomputer.eu"><sub>https</sub>://www.lumi-supercomputer.eu</a></span></small>

<small><span class="docvortex-page-footnote" data-block-type="page_footnote" style="color:#6b7280">[december-quarter-2022/Emissions-Reduction.aspx](https://www.cleanenergyregulator.gov.au/Infohub/Markets/Pages/qcmr/december-quarter-2022/Emissions-Reduction.aspx)</span></small>

<small><span class="docvortex-page-footnote" data-block-type="page_footnote" style="color:#6b7280">14<sub>These</sub> metrics were in part collected using Carbonara’s AI agent and monitoring platform. Learn more at: [https://trycarbonara.com](https://trycarbonara.com)</span></small>

<!-- page 17 of 21 -->

|  | OLMo-7B | LLaMA2-7B | OpenLM-7B | Falcon-7B | PaLM-8B |
| --- | --- | --- | --- | --- | --- |
| Dimension | 4096 | 4096 | 4096 | 4544 | 4096 |
| Num heads | 32 | 32 | 32 | 71 | 16 |
| Num layers | 32 | 32 | 32 | 32 | 32 |
| MLP ratio | ∼8/3 | ∼8/3 | ∼8/3 | 4 | 4 |
| Layer norm type | non-parametric | RMSNorm | parametric | parametric | parametric |
| Positional embeddings | RoPE | RoPE | RoPE | RoPE | RoPE |
| Attention variant | full | GQA | full | MQA | MQA |
| Biases | none | none | in LN only | in LN only | none |
| Block type | sequential | sequential | sequential | parallel | parallel |
| Activation | SwiGLU | SwiGLU | SwiGLU | GeLU | SwiGLU |
| Sequence length | 2048 | 4096 | 2048 | 2048 | 2048 |
| Batch size (instances) | 2160 | 1024 | 2048 | 2304 | 512 |
| Batch size (tokens) | ∼4M | ∼4M | ∼4M | ∼4M | ∼1M |
| Weight tying | no | no | no | no | yes |
| Warmup steps | 5000 | 2000 | 2000 | 1000 |  |
| Peak LR | 3.0E-04 | 3.0E-04 | 3.0E-04 | 6.0E-04 |  |
| Minimum LR | 3.0E-05 | 3.0E-05 | 3.0E-05 | 1.2E-05 |  |
| Weight decay | 0.1 | 0.1 | 0.1 | 0.1 |  |
| Beta1 | 0.9 | 0.9 | 0.9 | 0.99 |  |
| Beta2 | 0.95 | 0.95 | 0.95 | 0.999 |  |
| Epsilon | 1.0E-05 | 1.0E-05 | 1.0E-05 | 1.0E-05 |  |
| LR schedule | linear | cosine | cosine | cosine |  |
| Gradient clipping | global 1.0 | global 1.0 | global 1.0 | global 1.0 |  |
| Gradient reduce dtype | FP32 | FP32 | FP32 | BF16 |  |
| Optimizer state dtype | FP32 | most likely FP32 | FP32 | FP32 |  |

Table 5: LM architecture and optimizer comparison at the 7–8B scale. In the “layer norm type" row, “parametric" and “non-parametric" refer to the usual layer norm implementation with and without adaptive gain and bias, respectively. All models are trained using AdamW.

> Table 5 Attention variant: OLMo-7B=full, LLaMA2-7B=GQA, Falcon=MQA, PaLM-8B=MQA. 本文 7B 仍走每头全量 KV 的 Dense 注意力, 没有在报告里用 GQA 省 KV. 机制名可搜 GQA, 但本文落点是 full attention + 序列 2048.

same time other models that are trained on code data from GitHub such as RPJ-INCITE-7B, that are just as likely to have contamination, fair much worse. Another factor then is that OLMo-7B trains on code data with exactly the same post-processing as that in 100 PLs while the code data in other models will have been processed differently. Similarly, Pile evaluation demonstrates these in-distribution and potential contamination effects as Pythia-6.9B achieves top performance despite being trained on almost an order of magnitude fewer tokens than OLMo-7B.

这里一个值得注意的结果是, OLMo-7B 在 Dolma 100 Programming Languages (100 PLs) 上领先其他模型更多. 要注意, 这一效应部分可能来自污染导致的低估, 因为代码数据的去污染超出了 Paloma 方法的范围. 与此同时, 其他在 GitHub 代码数据上训练的模型 (如 RPJ-INCITE-7B) 同样可能有污染, 表现却差得多. 另一因素是, OLMo-7B 训练所用代码数据与 100 PLs 采用了完全相同的后处理, 而其他模型的代码数据处理方式不同. 类似地, Pile 评测也体现了这种分布内效应与潜在污染效应: Pythia-6.9B 尽管在比 OLMo-7B 少近一个数量级的 token 上训练, 却取得了最佳成绩.

The results on the remaining 5 targeted sources should be interpreted with care, as Paloma often finds that perplexity on these sources is dominated by superficial features such as low average document length rather than fit to that which would actually be salient to members of these speech communities. TwitterAAE and Gab have among the shortest documents in Paloma contributing to unusually high bits per byte in this figure. Other than these two, the models are notably very closely grouped in a data scaling trend in ICE, Manosphere, and 4chan.

其余 5 个针对性数据源上的结果应谨慎解读: Paloma 常常发现, 这些来源上的困惑度由表面特征主导 (如平均文档长度过低), 而非对相应语言社区成员真正关心内容的拟合程度. TwitterAAE 与 Gab 的文档长度在 Paloma 中属于最短, 这使它们在图中呈现异常高的 bits per byte. 除这两个之外, 在 ICE, Manosphere 与 4chan 上, 各模型明显紧紧聚集在一条数据 scaling 趋势线上.

**Additional end-task results** Next, in Table 7, we provide results from zero-shot evaluation of

OLMo-7B on 6 additional end-tasks apart from the 8 in our core evaluation suite. These tasks are headqa\_en (Vilares and Gómez-Rodríguez, 2019), logiqa (Liu et al., 2020), mrpc (Dolan and Brockett, 2005), qnli (Wang et al., 2018), wic (Pilehvar and Camacho-Collados, 2018), and wnli (Wang et al., 2018).

**补充下游任务结果** 接下来, 表 7 给出了 OLMo-7B 在核心评测套件 8 项任务之外, 对 6 个额外下游任务的 zero-shot 评测结果. 这些任务是 headqa\_en (Vilares and Gómez-Rodríguez, 2019), logiqa (Liu et al., 2020), mrpc (Dolan and Brockett, 2005), qnli (Wang et al., 2018), wic (Pilehvar and Camacho-Collados, 2018) 与 wnli (Wang et al., 2018).

We note, however, that in contrast to our core evaluation set described in Section 4.1, we found these additional end-tasks to have less stable performance during model development, and to provide a limited signal. This is illustrated in Figure 4, where we see the progress of task performance throughout training to be more random (compare with the more stable upward trends in Figure 1). While tasks such as mrpc and wic appear more stable, they offered additional difficulties related to performance being tied to random chance (e.g., wic) or the tendency of models to make spurious predictions (e.g., always predicting a single label) that either inflate or deflate performance due to dataset class imbalances (e.g., mrpc). We therefore caution against relying too heavily on these tasks when measuring model performance throughout training and comparing models.

但要注意, 与 4.1 节所述核心评测集不同, 我们发现这些额外下游任务在模型开发过程中性能更不稳定, 所能提供的信号有限. 图 4 对此做了展示: 任务性能在训练全程的进展更为随机 (可与图 1 中更稳定的上升趋势对比). 尽管 mrpc 与 wic 这类任务看起来更稳定, 但它们另有难处: 性能可能与随机相当 (如 wic), 或模型倾向于做出虚假预测 (如永远预测单一标签), 再叠加数据集类别不平衡 (如 mrpc), 会使成绩虚高或虚低. 因此, 我们提醒: 在训练全程衡量模型性能与比较模型时, 不要过度依赖这些任务.

<!-- page 18 of 21 -->

|  | GPU Type | GPU Power Consumption (MWh) | Power Usage Effectiveness | Carbon Intensity (kg CO<sub>2</sub>e/KWh) | Carbon Emissions(tCO<sub>2</sub>eq) |
| --- | --- | --- | --- | --- | --- |
| Gopher-280B | TPU v3 | 1,066 | 1.08 | 0.330 | 380 |
| BLOOM-176B | A100-80GB | 433 | 1.2 | 0.057 | 30 |
| OPT-175B | A100-80GB | 324 | 1.1 | 0.231 | 82 |
| T5-11B | TPU v3 | 77 | 1.12 | 0.545 | 47 |
| LLaMA-7B | A100-80GB | 33 | 1.1 | 0.385 | 14 |
| LLaMA2-7B | A100-80GB | 74 | 1.1 | 0.385 | 31 |
| OLMo-7B | MI250X | 135 | 1.1 | 0.000* | 0* |
| OLMo-7B | A100-40GB | 104 | 1.1 | 0.610 | 70 |

Table 6: $\mathrm { C O _ { 2 } }$ emissions during pretraining. We estimate the total carbon emissions for various models using publicly available data on PUE, carbon intensity of local power grid, and reported power consumption. Numbers for Gopher-280B (Rae et al., 2022), BLOOM-176B (Luccioni et al., 2022), OPT-175B (Zhang et al., 2022), T5-11B (Patterson et al., 2021), LLaMA (Touvron et al., 2023a), and LLaMA2 (Touvron et al., 2023b) are taken from their respective papers. See Section B for details on how tCO2eq was calculated.

\* LUMI runs entirely on hydroelectric power<sup>13</sup>and some estimates (Ubierna et al., 2022) measure the intensity factor of hydroelectric power to be 0.024, implying total emissions of 3.54 $\mathfrak { t } \mathbf { C O } _ { 2 } \mathbf { e q } .$

Table 6 按 LUMI 官方可再生能源口径把 MI250X 排放记为 0, A100-40GB 行约为 70 tCO₂eq. Appendix B 报告总预训练排放约 69.78 tCO₂eq, 并说明若采用水电强度 0.024, LUMI 一侧约为 3.54 tCO₂eq. 两组数字使用的电力强度假设不同.

|  | headqa_en | logiqa | mrpc | qnli | wic | wnli | avg. |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Falcon-7B | 38.6 | 23.7 | 62.8 | 49.8 | 49.5 | 47.9 | 45.4 |
| LLaMA-7B | 38.7 | 19.5 | 68.6 | 50.1 | 49.1 | 52.1 | 46.4 |
| LLaMA2-7B | 39.5 | 26.1 | 69.1 | 49.4 | 49.8 | 45.1 | 46.5 |
| MPT-7B | 37.4 | 22.9 | 67.7 | 52.1 | 48.1 | 47.9 | 46.0 |
| Pythia-6.9B | 40.1 | 21.5 | 65.4 | 53.8 | 55.0 | 38.0 | 45.6 |
| RPJ-INCITE-7B | 36.9 | 27.8 | 58.8 | 53.8 | 48.9 | 57.8 | 47.3 |
| OLMo-7B | 37.3 | 23.4 | 68.4 | 49.1 | 50.2 | 56.3 | 47.5 |

Table 7: Zero-shot evaluation of OLMo-7B on 6 additional end-tasks apart from the 8 present in our core evaluation suite. Once again, we compare OLMo-7B to 6 other model checkpoints which are publicly available. We find that OLMo-7B outperforms the other models on aggregate taken over 6 additional end-tasks from this table, however these tasks were also found to provide limited signal during training (see Figure 4).

## D Adaptation Training Details

We use the following hyperparameters when instruction tuning OLMo. These were chosen through small pilot experiments.

指令微调 OLMo 时我们使用如下超参数, 它们是通过小规模试点实验选定的.

• Learning rate: $\mathrm { 2 \times { 1 0 } ^ { - 6 } }$

• Epochs: 3

• Warmup: Linear warmup for the first 3% of total training time, and then linear cooldown to a learning rate of 0 over the remaining steps.

- Warmup: 在总训练时间的前 3% 内线性 warmup, 随后在剩余步数上线性冷却至学习率 0.

• Weight decay: 0

• Gradient clipping: 0

• Maximum sequence length: 2048

• Data: TÜLU V2 SFT mix, resplit such that long conversations are split into 2048-token chunks and replacing the hardcoded split with

- Data: TÜLU V2 SFT 混合数据, 重新切分, 使长对话被切成 2048-token 的块, 并以关于 OLMo 的数据替换其中硬编码的切分.

data about OLMo. Data is publically available. <sup>14</sup>

After instruction finetuning, we then use the following hyperparameters for DPO training, following Ivison et al. (2023):

指令微调之后, 我们沿用 Ivison et al. (2023) 的做法, 用如下超参数进行 DPO 训练:

• Learning rate: $\mathrm { 5 \times 1 0 } ^ { - 7 }$

• β: 0.1

• Epochs: 3

• Warmup: Linear warmup for the first 10% of total training time, and then linear cooldown to a learning rate of 0 over the remaining steps.

- Warmup: 在总训练时间的前 10% 内线性 warmup, 随后在剩余步数上线性冷却至学习率 0.

• Weight decay: 0

• Gradient clipping: 0

<small><span class="docvortex-page-footnote" data-block-type="page_footnote" style="color:#6b7280">14<a href="https://huggingface.co/datasets/allenai/tulu-v2-sft-mixture-olmo-2048"><sub>https</sub>://huggingface.co/datasets/allenai/ tulu-v2-sft-mixture-olmo-2048</a></span></small>

<!-- page 19 of 21 -->

![Chart block](images/p19-chart.png)

![Chart block](images/p19-chart-2.png)

![Chart block](images/p19-chart-3.png)

![Chart block](images/p19-chart-4.png)

![Chart block](images/p19-chart-5.png)

![Chart block](images/p19-chart-6.png)

![Chart block](images/p19-models-falcon-7b-llama2-7b-mpt-7b-llama-7b-pythia-6-9b.png)

> 图注: models falcon 7b llama2 7b mpt 7b llama 7b pythia 6 9b.

Models Falcon-7B LLaMA2-7B MPT-7B LLaMA-7B Pythia-6.9B RPJ-INCITE-7B OLMo-7B

Figure 3: Bits per byte for each of the 7 remaining Paloma data sources not aggregated in Figure 2.

![Chart block](images/p19-chart-7.png)

![Chart block](images/p19-chart-8.png)

![Chart block](images/p19-chart-9.png)

![Chart block](images/p19-chart-10.png)

![Chart block](images/p19-chart-11.png)

![Chart block](images/p19-figure-4-accuracy-score-progression-of-olmo-7b-on-6.png)

Figure 4: Accuracy score progression of OLMo-7B on 6 additional end-tasks. The performance of these additional end-tasks was unstable and provided limited signal during model development.

• Maximum sequence length: 2048

15 chosen and rejected pairs.

• Data: A modified form of UltraFeedback (Cui et al., 2023), with TruthfulQA prompts removed. We used the ‘fixed’ variant released by Argilla, which uses the average of GPT-generated aspect-based scores to determine

- Data: UltraFeedback (Cui et al., 2023) 的修改版, 移除了其中的 TruthfulQA prompt. 我们使用 Argilla 发布的 "fixed" 变体, 它以 GPT 生成的多维度评分的均值来决定被选与被拒的配对.

<small><span class="docvortex-page-footnote" data-block-type="page_footnote" style="color:#6b7280">15<a href="https://huggingface.co/datasets/argilla/ultrafeedback-binarized-preferences-cleaned"><sub>https</sub>://huggingface.co/datasets/argilla/ ultrafeedback-binarized-preferences-cleaned</a></span></small>

<!-- page 20 of 21 -->

## E Adaptation Evaluation and Model details

We choose the models in Table 4 by choosing the ‘canonical’ best versions (that is, the best instruction-tuned or otherwise adapted models released by the same organisation) of the base models we compare against in Table 3. We additionally compare to TÜLU 2 to show the current best models trained using the TÜLU mix used to finetune OLMo. We display evaluations on MMLU, AlpacaEval, ToxiGen, and Truthfulness to focus on displaying how instruction tuning can generally help capabilities (MMLU), how the models perform in an open-ended chat setting (AlpacaEval), and to test how instruction tuning aids in model safety and truthfulness (AlpacaEval, ToxiGen). We additionally report OLMo’s performance over the entire TÜLU evaluation suite in Table 8.

表 4 中的模型是这样选出的: 对表 3 中我们所对比的各基座模型, 选取其同一机构发布的 "canonical" 最佳版本 (即最好的指令微调或其他适配版本). 我们还额外与 TÜLU 2 对比, 以展示用 TÜLU 混合数据微调 OLMo 时当前最好的模型水平. 我们展示 MMLU, AlpacaEval, ToxiGen 与 Truthfulness 上的评测, 重点呈现: 指令微调对能力的普遍帮助 (MMLU), 模型在开放式聊天场景中的表现 (AlpacaEval), 以及指令微调对模型安全性与真实性的作用 (AlpacaEval, ToxiGen). 表 8 还报告了 OLMo 在整个 TÜLU 评测套件上的表现.

We provide a brief description of each model evaluated in Table 4 below. For all models, we use the provided chat template for prompt formatting when available.

表 4 中评测的各个模型简述如下. 对所有模型, 只要有提供的 chat template, 我们就用它来做 prompt 格式化.

• MPT Chat: A version of MPT 7B finetuned on the ShareGPT-Vicuna (Chiang et al., 2023), HC3 (Guo et al., 2023), Alpaca (Taori et al., 2023), HH-RLHF (Bai et al., 2022), and Evol-Instruct (Xu et al., 2024) datasets. Retrieved from [https://huggingface.co/mosaicml/mpt-7b-chat](https://huggingface.co/mosaicml/mpt-7b-chat).

- MPT Chat: 在 ShareGPT-Vicuna (Chiang et al., 2023), HC3 (Guo et al., 2023), Alpaca (Taori et al., 2023), HH-RLHF (Bai et al., 2022) 与 Evol-Instruct (Xu et al., 2024) 数据集上微调的 MPT 7B 版本. 取自 [https://huggingface.co/mosaicml/mpt-7b-chat](https://huggingface.co/mosaicml/mpt-7b-chat).

• Falcon Instruct: A version of Falcon 7B finetuned on the Baize (Xu et al., 2023), GPT4All (Anand et al., 2023), GPTeacher (Teknium1, 2023), and Refined-Web English (Penedo et al., 2023) datasets. Retrieved from [https://huggingface.co/tiiuae/falcon-7b-instruct](https://huggingface.co/tiiuae/falcon-7b-instruct).

- Falcon Instruct: 在 Baize (Xu et al., 2023), GPT4All (Anand et al., 2023), GPTeacher (Teknium1, 2023) 与 Refined-Web English (Penedo et al., 2023) 数据集上微调的 Falcon 7B 版本. 取自 [https://huggingface.co/tiiuae/falcon-7b-instruct](https://huggingface.co/tiiuae/falcon-7b-instruct).

• RPJ-INCITE Chat: A version of RPJ-INCITE 7B finetuned on the OASST1 (Köpf et al., 2023) and Dolly V2 (Conover et al., 2023) datasets. Retrieved from [https://huggingface.co/togethercomputer/RedPajama-INCITE-7B-Chat](https://huggingface.co/togethercomputer/RedPajama-INCITE-7B-Chat).

- RPJ-INCITE Chat: 在 OASST1 (Köpf et al., 2023) 与 Dolly V2 (Conover et al., 2023) 数据集上微调的 RPJ-INCITE 7B 版本. 取自 [https://huggingface.co/togethercomputer/RedPajama-INCITE-7B-Chat](https://huggingface.co/togethercomputer/RedPajama-INCITE-7B-Chat).

• Llama-2 Chat: A version of Llama 2 7B finetuned on a mixture of instruction datasets and further trained with RLHF. We refer the reader to Touvron et al. (2023b) for further details.

- Llama-2 Chat: 在混合指令数据集上微调并经 RLHF 进一步训练的 Llama 2 7B 版本. 细节请参阅 Touvron et al. (2023b).

• TÜLU 2: A version of Llama 2 7B finetuned on a mixture of instruction datasets (the TÜLU 2 mix).

- TÜLU 2: 在混合指令数据集 (TÜLU 2 mix) 上微调的 Llama 2 7B 版本.

We refer the reader to Ivison et al. (2023) for further details.

细节请参阅 Ivison et al. (2023).

• TÜLU 2+DPO: TÜLU 2 further trained with DPO on the UltraFeedback dataset (Cui et al., 2023). We refer the reader to Ivison et al. (2023) for further details.

- TÜLU 2+DPO: 在 UltraFeedback 数据集 (Cui et al., 2023) 上用 DPO 进一步训练的 TÜLU 2. 细节请参阅 Ivison et al. (2023).

• OLMo+SFT: A version of OLMo 7B fintuned on the same data as TÜLU 2.

- OLMo+SFT: 在与 TÜLU 2 相同数据上微调的 OLMo 7B 版本.

• OLMo+SFT+DPO: OLMo+SFT further trained with DPO on the UltraFeedback dataset (Cui et al., 2023).

- OLMo+SFT+DPO: 在 UltraFeedback 数据集 (Cui et al., 2023) 上用 DPO 进一步训练的 OLMo+SFT.

We additionally provide a brief description of each evaluation setting from Table 4:

我们再简要描述表 4 中的各个评测设置:

• **MMLU**: We use the official MMLU (Hendrycks et al., 2021) evaluation script and prompts available at [https://github.com/hendrycks/test](https://github.com/hendrycks/test), with modifications to allow for batch processing. We evaluate using 0 few-shot examples, following the original setup of MMLU. We report average accuracy across test examples.

- **MMLU**: 我们使用官方 MMLU (Hendrycks et al., 2021) 评测脚本与 [https://github.com/hendrycks/test](https://github.com/hendrycks/test) 上提供的 prompt, 并做了支持批量处理的修改. 沿用 MMLU 原始设置, 我们以 0 few-shot 评测, 报告测试样本上的平均准确率.

• **ToxiGen**: We follow the setup in Touvron et al. (2023b), but use the original set of prompts from Hartvigsen et al. (2022), which are designed to elicit toxic generations for certain groups. We take only the prompts designed to produce toxic language (‘hateful’ prompts) and use 500 prompts per group to reduce evaluation costs. For base language models, we pass in the original ToxiGen prompts unchanged and greedily decode up to the first new line (or a maximum of 512 tokens). For instruction-tuned models, we place the prompt in the corresponding template, and ask the model to complete the prompt, until the model generates a stop token (or a maximum of 512 tokens). We pass the generated text into a roberta-large model trained to detect toxic content finetuned as part of Hartvigsen et al. (2022). We then report the percentage of generations deemed toxic by the classifier.

- **ToxiGen**: 我们沿用 Touvron et al. (2023b) 的设置, 但使用 Hartvigsen et al. (2022) 的原始 prompt 集, 它们意在诱发针对某些群体的有毒生成. 我们仅取设计成产生有毒语言的 prompt ("hateful" prompt), 每组用 500 条以降低评测成本. 对基座语言模型, 原样输入 ToxiGen prompt, 贪心解码到首个换行符 (或最多 512 token). 对指令微调模型, 把 prompt 放入对应模板后让模型续写, 直到生成 stop token (或最多 512 token). 生成文本再送入一个 roberta-large 毒性检测模型 (作为 Hartvigsen et al., 2022 的一部分微调), 报告被分类器判为有毒的生成所占百分比.

• **TruthfulQA**: Following Touvron et al. (2023b), we mainly use the generation setting of TruthfulQA (Lin et al., 2022). The TruthfulQA dataset contains 818 questions, which are used to prompt the tested model to generate answers. We use the default QA prompt format with 6 in-context QA

<small><span class="docvortex-page-footnote" data-block-type="page_footnote" style="color:#6b7280">16<a href="https://huggingface.co/tomh/toxigen_roberta"><sub>https</sub>://huggingface.co/tomh/toxigen\_roberta</a></span></small>

<!-- page 21 of 21 -->

| Model | MMLU0-shot | GSM8k 8-shot CoT | BBH 3-shot CoT | TydiQA1-shot | Codex-EvalPass@10 | AlpacaEval%win | ToxiGen% Toxic | TruthfulQA% Info + True |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| OLMo-7B | 28.3 | 8.5 | 31.7 | 32.3 | 21.4 | - | 81.4 | 31.6 |
| +SFT | 47.3 | 15.5 | 36.9 | 35.2 | 28.6 | 57.0 | 14.4 | 41.2 |
| +SFT+DPO | 46.1 | 11.0 | 35.8 | 21.7 | 27.8 | 69.3 | 1.7 | 52.0 |

Table 8: Evaluation of OLMo-7B models before and after instruction finetuning and DPO training on the full TÜLU evaluation suite. Lower is better for ToxiGen and higher is better for other metrics.

> Table 8: +SFT+DPO 相对 +SFT, AlpacaEval 57.0→69.3, ToxiGen 14.4→1.7, TruthfulQA 41.2→52.0, 但 GSM8k 15.5→11.0, BBH 36.9→35.8, TydiQA 35.2→21.7, MMLU 47.3→46.1. 同源数字显示聊天/安全升, 部分推理与问答降.

examples. We follow the official script in their official implemention to do greedy decoding and answer postprocessing. We train two LLaMA 2- based classifiers for judging the truthfulness and informativeness of the model response, due to the deprecation of GPT-3 making exact replication of the original TruthfulQA evaluation infeasible. We find that the LLaMA 2 judges are generally able to match the performance of the original GPT-3-based judges used by Lin et al. (2022). We report the rate of the responses being truthful and informative (% Informative and Truthful) following Touvron et al. (2023b). We only report the % Informative and Truthful as our primary metric.

- **TruthfulQA**: 沿用 Touvron et al. (2023b), 我们主要使用 TruthfulQA (Lin et al., 2022) 的生成式设置. TruthfulQA 数据集含 818 个问题, 用来 prompt 被测模型生成答案. 我们使用默认的 QA prompt 格式, 带 6 个 in-context QA 样例, 并按官方实现对答案做贪心解码与后处理. 由于 GPT-3 已被弃用, 原评测无法精确复现, 我们训练了两个基于 LLaMA 2 的分类器来评判模型回复的真实性与信息量. 我们发现 LLaMA 2 评判器大体上能媲美 Lin et al. (2022) 所用的原始 GPT-3 评判器. 我们沿用 Touvron et al. (2023b) 报告回复真实且有信息量的比例 (% Informative and Truthful), 并只把 % Informative and Truthful 作为主指标.

• **AlpacaEval**: We use the package provided by Li et al. (2023), following the default setup which asks the evaluated model to generate responses for 805 prompts and employ GPT-4 to compare the response with Davinci-003. We employ the “alpaca\_eval\_gpt4” annotator. We allow the evaluated model to generate up to 2048 tokens, without specifying special stop sequences. The reported win-rate is the percentage of model generations that GPT-4 reports as being preferred over the generations from Davinci-003.

- **AlpacaEval**: 我们使用 Li et al. (2023) 提供的包, 沿用默认设置: 让被评模型为 805 个 prompt 生成回复, 再用 GPT-4 将其回复与 Davinci-003 的回复对比. 我们使用 "alpaca\_eval\_gpt4" 评判器. 被评模型最多生成 2048 token, 不指定特殊 stop 序列. 所报告的胜率, 是 GPT-4 判定优于 Davinci-003 生成的回复所占的百分比.

<small><span class="docvortex-page-footnote" data-block-type="page_footnote" style="color:#6b7280">17<a href="https://github.com/sylinrl/TruthfulQA/"><sub>https</sub>://github.com/sylinrl/TruthfulQA/</a></span></small>
