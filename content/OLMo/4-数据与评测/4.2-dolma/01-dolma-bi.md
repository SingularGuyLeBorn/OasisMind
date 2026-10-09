---
title: "01 · Dolma：面向语言模型预训练研究的三万亿 Token 开放语料库 · 对照译稿"
category: "数据与评测"
tags: ["Dolma", "预训练数据", "数据治理", "开放语料"]
published: true
excerpt: "Dolma 公开三万亿 Token 语料及其收集、过滤、去重与混合流程，使预训练数据配方能够复查和复现。"
---

# Dolma: an Open Corpus of Three Trillion Tokens for Language Model Pretraining Research / Dolma：面向语言模型预训练研究的三万亿 Token 开放语料库

<!-- page 1 of 64 -->

# Dolma: an Open Corpus of Three Trillion Tokens for Language Model Pretraining Research

# Dolma：面向语言模型预训练研究的三万亿 Token 开放语料库

Luca Soldaini, Rodney Kinney, Akshita Bhagia, Dustin Schwenk, David Atkinson, Russell Authur, Ben Bogin, Khyathi Chandu, Jennifer Dumas, Yanai Elazar, Valentin Hofmann, Ananya Harsh Jha, Sachin Kumar, Li Lucy, Xinxi Lyu, Nathan Lambert, Ian Magnusson, Jacob Morrison, Niklas Muennighoff, Aakanksha Naik, Crystal Nam, Matthew E. Peters, Abhilasha Ravichander, Kyle Richardson, Zejiang Shen, Emma Strubell, Nishant Subramani, Oyvind Tafjord, Pete Walsh, Luke Zettlemoyer, Noah A. Smith, Hannaneh Hajishirzi, Iz Beltagy, Dirk Groeneveld, Jesse Dodge, Kyle Lo

Allen Institute for AI；University of California, Berkeley；Carnegie Mellon University；Spiffy AI；Massachusetts Institute of Technology；University of Washington

## Abstract

Information about pretraining corpora used to train the current best-performing language models is seldom discussed: commercial models rarely detail their data, and even open models are often released without accompanying training data or recipes to reproduce them. As a result, it is challenging to conduct and advance scientific research on language modeling, such as understanding how training data impacts model capabilities and limitations.

关于当前最佳语言模型所用预训练语料的信息很少得到讨论：商业模型极少详细说明其数据，即便是开放模型，发布时也常常不附训练数据或可复现配方。因此，要开展和推进语言建模科学研究——例如理解训练数据如何影响模型能力与局限——十分困难。

To facilitate scientific research on language model pretraining, we curate and release Dolma, a three-trillion-token English corpus, built from a diverse mixture of web content, scientific papers, code, public-domain books, social media, and encyclopedic materials. We extensively document Dolma, including its design principles, details about its construction, and a summary of its contents.

为促进语言模型预训练研究，我们整理并发布 Dolma：一个由网页内容、科学论文、代码、公版书籍、社交媒体和百科材料多样混合而成的三万亿 token 英语语料库。我们对 Dolma 做了广泛记录，包括设计原则、构建细节和内容概要。

We present analyses and experimental results on intermediate states of Dolma to share what we have learned about important data curation practices. Finally, we open-source our data curation toolkit to enable reproduction of our work as well as support further research in large-scale data curation.

我们展示 Dolma 中间状态的分析与实验结果，分享在重要数据整理实践上的经验。末尾，我们开源数据整理工具包，使他人能够复现本工作，并支持对大规模数据整理的进一步研究。

## 1 Introduction

Language models are now central to tackling myriad natural language processing tasks, including few-shot learning, summarization, question answering, and more. Increasingly, the most powerful language models are built by a few organizations who withhold most model development details. In particular, the composition of language model pretraining data is often vaguely described, even when the model itself is released for public use, such as Llama 2.

语言模型如今已成为解决少样本学习、摘要、问答等众多自然语言处理任务的核心工具。越来越多最强模型由少数机构构建，而这些机构保留了模型开发的大部分细节。尤其是，语言模型预训练数据的组成通常只被含糊描述，即使模型本身已公开发布，例如 Llama 2。

This hinders understanding of the effects of pretraining corpus composition on model capabilities and limitations, with impacts on scientific progress as well as on the public who interfaces with these models. Our aim is to increase participation in scientific research of language models through open corpora:

这阻碍了人们理解预训练语料组成对模型能力和局限的影响，既影响科学进展，也影响与这些模型交互的公众。我们的目标是通过开放语料，让更多人参与语言模型科学研究：

- Data transparency helps developers and users of applications that rely on language models to make more informed decisions. Models perform better on tasks more similar to their pretraining data, while social biases in pretraining data may require additional consideration in use.

- 数据透明度能帮助依赖语言模型的应用开发者和用户做出更知情的决定。模型往往在与预训练数据更相似的任务上表现更好，而预训练数据中的社会偏见也可能要求使用者做额外考量。

- Open pretraining data is necessary to analyze how its composition influences model behavior, allowing model trainers to interrogate and improve current data practices. Examples include memorization, deduplication, adversarial attacks, benchmark contamination, and training-data attribution.

- 要分析数据组成如何影响模型行为，开放预训练数据不可或缺；它使模型训练者能够审视并改进现有数据实践。相关研究包括记忆、去重、对抗攻击、基准污染和训练数据归因。

`hf.co/datasets/allenai/dolma` · `github.com/allenai/dolma`

Core authors are marked in the paper; see Appendix B for contributions. This manuscript was prepared for Dolma v1.6. Updated versions are available at the provided links.

论文以符号标出核心作者；贡献列表见附录 B。本文为 Dolma v1.6 撰写，更新版本见上述链接。
<!-- page 2 of 64 -->

**Table 1: The Dolma corpus at a glance.**

| Source | Document type | UTF-8 bytes (GB) | Documents (millions) | Unicode words (billions) | Llama tokens (billions) |
|---|---:|---:|---:|---:|---:|
| Common Crawl | web pages | 9,812 | 3,734 | 1,928 | 2,479 |
| GitHub | code | 1,043 | 210 | 260 | 411 |
| Reddit | social media | 339 | 377 | 72 | 89 |
| Semantic Scholar | papers | 268 | 38.8 | 50 | 70 |
| Project Gutenberg | books | 20.4 | 0.056 | 4.0 | 6.0 |
| Wikipedia, Wikibooks | encyclopedic | 16.2 | 6.2 | 3.7 | 4.3 |
| **Total** |  | **11,519** | **4,367** | **2,318** | **3,059** |

**表 1：Dolma 语料概览。** 它包含从多样领域采样的三万亿 token；整理前约有 200TB 原始文本，最终缩减为 11TB 数据集，并针对语言模型预训练做了广泛清洗。token 数使用 LLaMA tokenizer 计算。

To support broader participation and inquiry, we present Data for Open Language Models’ Appetite (Dolma), an open corpus of three trillion tokens. We use web text from Common Crawl, scientific research from Semantic Scholar, code from GitHub, public-domain books, Reddit posts, and Wikipedia encyclopedic materials. Compared with other public pretraining corpora, Dolma offers more tokens at comparable quality while retaining diverse composition.

为支持更广泛的参与和研究，我们提出 Data for Open Language Models’ Appetite（Dolma），一个三万亿 token 的开放语料库。其来源包括 Common Crawl 网页、Semantic Scholar 科研文本、GitHub 代码、公版书籍、Reddit 帖子和 Wikipedia 百科材料。与其他公开预训练语料相比，Dolma 在保持来源多样性的同时，以相当质量提供更大的 token 池。

Our contributions are twofold. We release a diverse, multi-source collection of 3T tokens across more than 4B documents from six publicly accessible sources commonly used in large-scale pretraining. We also open-source the high-performance, portable Dolma Toolkit, allowing practitioners to reproduce the dataset and study or improve data-curation practices.

我们的贡献有两项。其一，发布由六个常见且公众可访问来源组成的多源语料，覆盖 40 多亿文档和 3T token。其二，开源高性能、可移植的 Dolma Toolkit，使实践者既能复现数据集，也能研究并改进数据整理方法。

“Token” follows the subword definition of tokenizers such as LLaMA or GPT-NeoX, and differs from a “word” defined by Unicode text segmentation.

本文的“token”指 LLaMA、GPT-NeoX 等 tokenizer 得到的子词，不同于 Unicode 文本分割标准定义的“word”。

## 2 Related Work

**Closed data-curation practices.** Pretraining practices have become increasingly closed in both data access and documentation. Proprietary GPT-4, PaLM 2 and Claude disclose little or no corpus size or provenance and share no data. Powerful open models such as Llama 2, Mistral, Yi and Qwen also do not share sufficient data or reproduction details.

**封闭的数据整理实践。** 无论数据访问还是文档记录，预训练实践都日益封闭。GPT-4、PaLM 2、Claude 等专有模型很少披露语料规模或来源，也不共享数据。Llama 2、Mistral、Yi、Qwen 等强大的开放模型同样没有共享足够的数据或复现细节。

Exceptions that pair models with training data include T5/C4, BLOOM/ROOTS, GPT-J, GPT-NeoX and Pythia/Pile, and INCITE/RedPajama v1. Efforts with comparatively transparent curation documentation include LLaMA (model released, data unreleased), Gopher (model and data unreleased), and Falcon (model and partial data released). Appendix C compares these unknowns and the trend away from open-data practice.

同时发布模型与训练数据的例外包括 T5/C4、BLOOM/ROOTS、GPT-J、GPT-NeoX 与 Pythia/Pile，以及 INCITE/RedPajama v1。整理文档相对透明的项目包括 LLaMA（发布模型、未发数据）、Gopher（模型和数据均未发布）与 Falcon（发布模型和部分数据）。附录 C 比较这些未知项及逐渐远离开放数据实践的趋势。
<!-- page 3 of 64 -->

**Open corpora for language-model pretraining.** Prior open corpora motivate a new dataset. C4 (175B tokens) and Pile (387B) are high quality and proven, but limited in scale. ROOTS is about 400B tokens, yet only 30% is English, leaving too few tokens for English-only models. Scale and English concentration do not imply higher quality; they serve particular research needs.

**用于语言模型预训练的开放语料。** 既有开放语料的局限促使作者构建新数据集。C4（175B token）和 Pile（387B）质量较高且已有训练实践，但规模有限。ROOTS 约 400B token，不过英语仅占 30%，不足以支持目标中的纯英语训练。规模大、英语集中并不意味着质量更高，只是服务特定研究需求。

Falcon (580B) and RedPajama v2 (30T) meet the scale criterion but come entirely from Common Crawl, lacking source diversity such as papers and code. RedPajama v2 is lightly curated and distributes CCNet output mostly as-is, leaving filtering decisions to model developers.

Falcon（580B）和 RedPajama v2（30T）达到规模标准，但全部来自 Common Crawl，缺少论文、代码等大型模型常用的来源多样性。RedPajama v2 清理较轻，基本原样分发 CCNet 输出，把过滤决策留给模型开发者。

RedPajama v1 (about 1.2T) is closest to Dolma and inspired it, but specifically reproduces LLaMA data. Dolma has a broader target, including larger scientific-paper and Reddit collections. Studies also found RedPajama v1 quality issues requiring more cleanup. During review, FineWeb, Zyda, and datasets for LLM360 Amber, LLM360 K2 and MAP-Neo were released.

RedPajama v1（约 1.2T）与 Dolma 最接近，也是其设计灵感，但它专门复现 LLaMA 数据。Dolma 的复现目标更广，纳入更大的科研论文和 Reddit 集合。既有研究还发现 RedPajama v1 存在数据质量问题，昂贵训练前应进一步清理。论文评审期间又发布了 FineWeb、Zyda，以及 LLM360 Amber、LLM360 K2、MAP-Neo 使用的数据集。

## 3 Data Design Goals

The authors disclose goals to clarify strengths and limitations and encourage curation rationales and datasheet-style motivation.

作者公开设计目标，旨在说明 Dolma 的优势与局限，并推动数据整理研究说明理由、回答 datasheet 式动机问题。

**Be consistent with prior recipes.** Matching known sources and methods lets researchers study and scrutinize modern models, including closed ones. This reproduction goal scopes Dolma to English-only text, leveraging known practices and increasing comparability. The authors acknowledge that this reinforces English as the default and hope to expand languages.

**与既有配方保持一致。** 匹配已知来源与方法，使研究者能够研究和审视当代模型，包括闭源模型。为利用成熟整理实践并提高可比性，Dolma 因此限定为英语文本。作者承认这强化了“英语是默认语言”的假设，并希望未来扩展多语。

**Make evidence-backed decisions.** When no clear recipe exists or implementations subtly differ, choose decisions that maximize model performance over a diverse evaluation suite.

**用证据支持不确定决策。** 当没有明确最佳实践，或实现只在细节上不同时，优先选择能在多样评测集上最大化模型表现的方案。

**Large-scale data.** Scaling-law work suggests maintaining a relation between parameters and training tokens; Llama 2 indicates more tokens can still improve models. Dolma targets 2–3T tokens to study model–dataset scale.

**足够训练大模型的数据规模。** 缩放定律研究建议维持参数量与最低训练 token 的比例；Llama 2 表明继续增加 token 仍有提升空间。Dolma 以 2–3T token 为目标，支持模型与数据规模关系研究。

**Adjust to preserve openness.** Openness means sharing data and documenting curation. Legal, ethical and practical constraints sometimes require departing from known recipes. Dolma avoids Books3 amid copyright litigation and filters PII despite limited precedent.

**为保持开放而做必要调整。** 开放同时意味着共享数据并记录整理流程。法律、伦理和实践约束有时要求偏离已知配方。Dolma 避开处于版权诉讼中的 Books3，也在既有配方鲜少讨论的情况下过滤 PII。

## 4 Data Curation Methodology

### 4.1 The Dolma Toolkit

Pretraining curation transforms raw multi-source data into cleaned plain-text documents. Dolma provides a high-performance open toolkit for hundreds of terabytes and unifies operations as filtering and mixing.

预训练数据整理把多来源原始数据转换成干净的纯文本文档。Dolma 为数百 TB 内容提供高性能开源工具，并把操作统一为 filtering 与 mixing。
<!-- page 4 of 64 -->

**Filtering.** The toolkit unifies language, quality and content transformations. A configuration specifies a text unit (document, paragraph or sentence), a scoring method (linear classifier, language-model perplexity or regex), and a removal policy (delete or replace). It parallelizes identification and removal at scale. Dolma uses it for non-English, “low-quality” or unnatural text, toxicity and PII at document and sub-document levels.

**过滤。** Toolkit 统一语言、质量和内容变换。配置指定文本单元（文档、段落或句子）、评分方法（线性分类器、语言模型困惑度或正则匹配）以及移除策略（删除或字符串替换），并在大规模上并行识别和移除。Dolma 用它在文档和子文档层面过滤非英语、“低质量”或不自然文本、毒性和 PII。

A paragraph is a text span ending in newline `\n`. “Quality” does not objectively denote human-valued informativeness: such filters select according to inherently ideological criteria. “Toxicity” likewise has no single definition; it varies with task, curator identity and annotator belief, remains difficult to predict, and can discriminate against minoritized groups.

本文把段落定义为以换行符 `\n` 结束的文本区间。“质量”并非对人类重视的信息性或完整性的客观判断；这类过滤器按本质上带意识形态的标准选择文本。“毒性”也没有单一定义，会随任务、整理者身份和标注者信念变化，预测仍很困难，且可能歧视边缘群体。

In internal C4-reproduction tests, filtering cost 122 CPU hours per TB. Processing 200TB raw Dolma on one `c6a.48xlarge` with 192 vCPUs would take five days.

内部复现 C4 配方的测试中，过滤每 TB 需 122 CPU 小时；用一台 192 vCPU 的 `c6a.48xlarge` 处理 200TB raw Dolma 约需五天。

**Mixing.** A Rust module unifies cross-file up/down-sampling, deduplication and decontamination, producing fewer output files. Upsampling can repeatedly read the same paths. A compatible Bloom filter enables linear-time probabilistic duplicate detection; seeding it with test examples repurposes it for test-set decontamination.

**混合。** Rust 模块统一跨文件上/下采样、去重和去污染，并产出更少的文件。上采样可重复读取相同路径。兼容的 Bloom filter 以线性时间概率检测重复；先写入测试样本即可用于测试集去污染。

### 4.2 Data Ablations

For evidence-backed choices, the authors train on a dataset with a particular intervention and compare against a baseline while controlling model architecture and training, isolating effects of curation decisions.

为用证据做选择，作者在带特定整理干预的数据上训练模型，并在控制架构和训练的前提下与 baseline 比较，从而隔离数据整理决策的影响。

**Model training.** Ablations use a 1.2B-parameter decoder-only OLMo model. Full convergence for every decision is too expensive, so each model is stopped at 150B tokens.

**模型训练。** 消融使用 12 亿参数 decoder-only OLMo。为每项决策训练到完全收敛成本过高，因此每个模型在 150B token 时提前停止。

**Tasks.** Eight datasets were selected because they are used in prior pretraining evaluation, cover diverse knowledge and capabilities, and permit avoiding test contamination. Appendix L validates contamination choices.

**任务。** 八个数据集的选择标准是：既有预训练研究使用过、覆盖多样知识和能力、能够规避测试污染。附录 L 验证污染选择。

**Evaluation.** Models are evaluated with zero-shot in-context prompts, casting tasks as ranked text classification, using MetaICL-style truncation, PromptSource prompts and an in-house harness similar to EleutherAI's.

**评测。** 模型以 zero-shot 上下文提示评测，把任务转成排序式文本分类，采用 MetaICL 风格截断、PromptSource 提示和类似 EleutherAI 的内部评测框架。

## 5 Curating Dolma-Web

Dolma-Web contains 2.28T tokens from Common Crawl, which has over 250B pages crawled since 2007. Of 97 snapshots available by February 2024, Dolma uses 25 from `2020-05` through `2023-06`. To reduce storage and compute, only enough shards were acquired to reach the 2–3T target, assuming cleaning would reduce size at least tenfold.

Dolma-Web 含来自 Common Crawl 的 2.28T token；后者自 2007 年起已抓取 2500 多亿页面。截至 2024 年 2 月共有 97 个快照，Dolma 使用 `2020-05` 至 `2023-06` 的 25 个。为降低存储和计算成本，团队只取得足够达到 2–3T 目标的 shard，并假定清洗至少缩小十倍。

### 5.1 Acquisition and Language Filtering

CCNet applies FastText language ID and initial content deduplication. Dolma keeps pages with English score ≥0.5, removing 61.7% by bytes. CCNet groups shards within each snapshot and removes very common paragraphs, eliminating about 70% of paragraphs, mainly headers and navigation. Overall it filters 84.2%, reducing 175.1TB to 27.7TB.

CCNet 使用 FastText 语言识别并做初始内容去重。Dolma 保留英语分数 ≥0.5 的页面，按字节删除 61.7%。CCNet 在每个快照内把 shard 分成小组并删除高频段落，约去除 70% 段落，主要是页眉与导航。总体过滤 84.2%，把 175.1TB 降至 27.7TB。
<!-- page 5 of 64 -->

### 5.2 Quality Filtering

Web data requires substantial cleanup: HTML conversion introduces headers and malformed text, while many pages lack prose-like content. Following arguments against model-based quality filters, Dolma combines Gopher and C4 heuristics. It keeps all Gopher rules (`Gopher All`) and only C4's rule removing paragraphs that do not end in punctuation (`C4 NoPunc`), rather than all C4 rules.

网页数据需要大幅清理：HTML 转文本会引入页眉和格式错误，很多页面也缺少类散文内容。基于既有研究对模型式质量过滤的质疑，Dolma 组合 Gopher 与 C4 启发式。它保留全部 Gopher 规则（`Gopher All`），并只取 C4 中删除不以标点结尾段落的规则（`C4 NoPunc`），而不使用 C4 全部规则。

**Figure 1.** Web quality filters improve 1.2B-model HellaSwag performance across training steps over no filtering. Other datasets appear in Appendix O.

**图 1。** 与不过滤相比，网页质量过滤在不同训练步上改善 1.2B 模型的 HellaSwag 表现；其他评测见附录 O。

Ablations show C4 NoPunc alone outperforms C4 All and Gopher All on perplexity and downstream tasks; `Gopher All + C4 NoPunc` performs best. Gopher tags 15.23% and NoPunc 22.73% of UTF-8 characters for removal.

消融显示，C4 NoPunc 单独使用时在困惑度和下游任务上都优于 C4 All 与 Gopher All；`Gopher All + C4 NoPunc` 最好。Gopher 标记 15.23%、NoPunc 标记 22.73% 的 UTF-8 字符待删除。

CCNet's KenLM perplexity groups documents by Wikipedia-likeness into high (21.9%), medium (28.5%) and low (49.6%) quality. Heuristic filtering does not change these proportions, suggesting model-based and heuristic filters capture orthogonal signals.

CCNet 的 KenLM 困惑度按 Wikipedia 相似度把文档分为高（21.9%）、中（28.5%）、低（49.6%）质量。启发式过滤没有改变这些比例，说明模型式过滤和启发式过滤捕获近似正交的信号。

### 5.3 Content Filtering

For toxic content, the authors train two FastText classifiers on Jigsaw Toxic Comments, targeting `hate` and `NSFW`. They split Common Crawl into sentences with BlingFire and remove sentences above a threshold.

对有害内容，作者在 Jigsaw Toxic Comments 上训练两个 FastText 分类器，分别识别 `hate` 与 `NSFW`。他们用 BlingFire 切分 Common Crawl 句子，删除得分超过阈值的句子。

**Figure 2.** Content filters improve 1.2B-model HellaSwag performance across training steps over no filtering; other tasks are in Appendix O.

**图 2。** 与不过滤相比，内容过滤改善 1.2B 模型随训练推进的 HellaSwag 表现；其他任务见附录 O。

The “High Threshold” (`τ=0.4`) removes less content (5.5–7.3%) but generally yields lower performance than the “Low Threshold” (`τ=0.0004`), which removes 29.1–34.9%. Scores were bimodal near 0 and 1. “Low” removes even slightly toxic text; “High” limits total removal to preserve scale.

“高阈值”（`τ=0.4`）删除较少内容（5.5–7.3%），但总体表现低于删除 29.1–34.9% 的“低阈值”（`τ=0.0004`）。句子得分在 0 与 1 附近呈双峰；“低阈值”连轻微毒性也删除，“高阈值”则限制移除量以保住规模。

Dolma adopts the more permissive High threshold to meet the minimum token target, despite Low's better performance. Quality, content and deduplication filters overlap little, so combined removal compounds. Future versions can start from more Common Crawl shards and use stricter thresholds.

尽管低阈值表现更好，Dolma 为满足最低 token 目标采用更宽松的高阈值。质量、内容和去重过滤的命中重叠很少，串联后删除效应会叠加。未来版本可从更多 Common Crawl shard 起步，再采用更严格阈值。
<!-- page 6 of 64 -->

**Filtering Personally Identifiable Information.** Web data can leak PII, and models can reproduce it. At Dolma scale, model-based detectors such as Presidio are impractical, so the authors use carefully designed regexes that trade accuracy for speed. They target email, IP addresses and phone numbers.

**过滤个人身份信息。** 网页数据可能泄露 PII，模型也可能在推理时复现它。Dolma 的规模使 Presidio 等模型式检测器不切实际，因此作者使用精心设计的正则表达式，以部分准确率换取速度，聚焦邮箱、IP 地址和电话号码。

Documents with at most five PII spans have those spans replaced by special tokens such as `|||EMAIL_ADDRESS|||`, affecting 0.02% of documents. Documents with more spans are removed entirely, affecting 0.001%. Ablations find no performance difference between removal and replacement, expected given the tiny fraction.

PII 区间不超过 5 个的文档，以 `|||EMAIL_ADDRESS|||` 等特殊 token 替换，影响 0.02% 文档；更多时删除整篇，影响 0.001%。消融未发现删除和替换在模型表现上有差异，这与受影响比例极小相符。

### 5.4 Deduplication

Dolma performs three stages: (i) exact URL dedup removes 53.2% of documents; (ii) exact document dedup removes 14.9% of URL-deduped documents, including empty documents; (iii) exact paragraph dedup removes 18.7% of paragraphs from URL-deduped documents, including empty paragraphs.

Dolma 分三阶段去重：（i）精确 URL 去重删除 53.2% 文档；（ii）精确文档去重在 URL 去重后的文档中再删除 14.9%，包括空文档；（iii）精确段落去重在 URL 去重后的文档中删除 18.7% 段落，包括空段落。

URL dedup is computationally cheap and removes re-crawls. Exact document dedup catches identical pages under different URLs. Both happen early to reduce later work. Paragraph dedup removes boilerplate such as repeated bylines, but because it can disrupt content analysis it runs last. All use the Bloom filter.

URL 去重计算便宜，可移除重复抓取；精确文档去重捕获不同 URL 下的相同页面。二者提前执行以降低后续工作量。段落去重删除重复署名等模板内容，但可能扰乱内容分析，因而末尾运行。三者都使用 Bloom filter。

### 5.5 Putting It All Together

The web pipeline applies URL and document deduplication to CCNet output, then quality/content filtering, and finally paragraph deduplication.

网页管线先对 CCNet 输出做 URL 和文档去重，再做质量与内容过滤，末尾做段落去重。

**Figure 3.** Stacking quality filters, content filters and paragraph deduplication produces compounding positive effects on 1.2B-model HellaSwag performance over the no-filtering baseline. Other tasks appear in Appendix O.

**图 3。** 与不过滤的 baseline 相比，叠加质量过滤、内容过滤和段落去重，对 1.2B 模型 HellaSwag 表现产生正向复合效应；其他任务见附录 O。

## 6 Curating Dolma-Code

Dolma-Code contains 411B tokens from GitHub.

Dolma-Code 含来自 GitHub 的 411B token。

### 6.1 Acquisition and Language Filtering

Following code-model work such as StarCoder, Dolma uses the Stack, a deduplicated but otherwise unfiltered collection of permissively licensed GitHub repositories collected in March 2023. Data-heavy formats such as JSON and CSV are filtered.

沿用 StarCoder 等代码模型工作，Dolma 使用 The Stack：一个在 2023 年 3 月收集、已经去重但其他方面未过滤的宽松许可 GitHub 仓库集合。JSON、CSV 等数据密集文件会被过滤。

### 6.2 Quality Filtering

Rules come from RedPajama v1 and StarCoder. RedPajama removes repetitive preambles such as license statements, excessively long lines, mostly numeric content and templated/generated files. StarCoder rules filter repositories with few or no stars, files with too few or too many comments, and HTML with low code-to-text ratio.

规则来自 RedPajama v1 与 StarCoder。RedPajama 删除许可证声明等重复前导、过长行、以数字为主的内容以及模板化/生成文件。StarCoder 规则过滤星标很少或没有星标的仓库、注释过少或过多的文件，以及代码—文本比例低的 HTML。
<!-- page 7 of 64 -->

Ablations show combining RedPajama v1 and StarCoder rules yields lower perplexity on code datasets such as HumanEval and improves the eight-task suite versus RedPajama rules alone, so Dolma uses both.

消融显示，相比只用 RedPajama v1 规则，同时使用 RedPajama 与 StarCoder 规则可降低 HumanEval 等代码数据上的困惑度，并改善八项评测，因此 Dolma 采用二者组合。

### 6.3 Content Filtering

The code subset applies the web subset's PII heuristics and masking. It also runs Yelp's `detect-secrets` and removes any document containing code secrets or software-specific personal information.

代码子集沿用网页子集的 PII 启发式与遮蔽，并运行 Yelp 的 `detect-secrets`，删除任何包含代码密钥或软件特有个人信息的文档。

### 6.4 Deduplication

Dolma starts from the already deduplicated Stack, whose pipeline uses MinHash and locality-sensitive hashing to find similar documents.

Dolma 从已经去重的 The Stack 开始；其管线用 MinHash 与局部敏感哈希寻找相似文档。

## 7 Curating Dolma-Social

Dolma-Social contains 80B tokens from Reddit.

Dolma-Social 含来自 Reddit 的 80B token。

### 7.1 Acquisition and Language Filtering

The subset derives from 378M posts from December 2005 through March 2023 obtained via Pushshift, including submissions and comments. Reddit's tree structure admits several linearizations. Ablations compare:

该子集来自通过 Pushshift 获得的 3.78 亿条帖子，时间为 2005 年 12 月至 2023 年 3 月，包含 submissions 与 comments。Reddit 树状结构可有多种线性化方式，消融比较：

1. **Atomic Content:** treat each submission and comment as an independent document.
2. **Partial Threads:** combine comments from one thread into multi-turn dialogue, while submissions remain separate.
3. **Full Threads:** combine a submission and all child comments into one document.

1. **原子内容：**每条 submission 和 comment 都是独立文档。
2. **部分线程：**把同一线程的评论组合成多轮对话，submission 单独成文档。
3. **完整线程：**把 submission 与全部子评论合为一篇文档。

**Figure 4.** Across training steps, Atomic Content performs best on the evaluation suite. The authors hypothesize that artificial formatting introduced by combining thread elements hurts training. Non-English content is filtered as in §5.1.

**图 4。** 随训练推进，原子内容在评测套件中表现最好。作者推测，组合线程元素时引入的人为格式损害训练。非英语内容按 §5.1 过滤。

### 7.2 Quality Filtering

Dolma adapts Henderson et al.'s cleanup. It removes comments shorter than 500 characters, submissions shorter than 400, and documents longer than 40,000. Submissions receive the more permissive minimum because qualitative inspection suggested higher quality.

Dolma 改用 Henderson 等人的清理管线：删除短于 500 字符的评论、短于 400 字符的 submissions，以及长于 40,000 字符的文档。人工检查认为 submissions 质量更高，因此其最短长度更宽松。

Comments with fewer than three net votes are removed, because low scores correlate with deep nesting or emotionally charged discourse. Deleted, moderator-removed and author-labeled over-18 documents are discarded. Documents from 26,123 banned or NSFW subreddits are excluded; the blocklist merges several sources and also includes subreddits with over 10% NSFW-tagged posts.

净投票少于 3 的评论会被删除，因为低分与深层嵌套或情绪化讨论相关。作者删除、版主移除或作者标记为 18+ 的文档被丢弃。来自 26,123 个被封禁或 NSFW subreddit 的文档被排除；blocklist 合并多个来源，也纳入超过 10% 帖子标为 NSFW 的 subreddit。

### 7.3 Content Filtering

The same content filters as §5.3 are used, but Reddit documents are short, so any PII match removes the whole document rather than masking spans.

内容过滤与 §5.3 相同，但 Reddit 文档较短，因此只要匹配 PII 就删除整篇，而并非遮蔽区间。

### 7.4 Deduplication

The web strategy is reused, but only at document level due to short submissions/comments. It reduces copypasta and other repetition.

沿用网页策略，但由于 submissions/comments 较短，只做文档级去重，以减少 copypasta 等重复信息。
<!-- page 8 of 64 -->

## 8 Assembling Other Data Sources

This section summarizes additional high-quality sources; collection and processing details appear in Datasheet §N.

本节概述其他高质量来源；收集和处理细节见 Datasheet §N。

**C4 for curated web content.** Like LLaMA and Llama 2 recipes, Dolma supplements its web data with C4. It reruns C4 through the full web pipeline except URL deduplication, removing additional low-quality and duplicate text and masking PII.

**以 C4 补充整理后的网页内容。** 与 LLaMA 和 Llama 2 配方相似，Dolma 用 C4 补充网页子集。C4 会重新经过除 URL 去重外的完整网页管线，进一步删除低质量和重复文本，并遮蔽 PII。

**Semantic Scholar for academic literature.** peS2o contains about 40M open-access papers cleaned, filtered, deduplicated and formatted for language-model pretraining, derived from S2ORC. Dolma uses it as-is.

**以 Semantic Scholar 提供学术文献。** peS2o 含约 4000 万篇开放获取论文，已针对语言模型预训练完成清理、过滤、去重和格式化，来源是 S2ORC；Dolma 直接使用。

**Project Gutenberg for books.** The repository has over 70,000 public-domain books. Dolma collected its archive in April 2023, keeps English books using §5.1 language filtering, and deduplicates by exact title match.

**以 Project Gutenberg 提供书籍。** 该仓库有 7 万多本公版书。Dolma 于 2023 年 4 月收集其归档，按 §5.1 语言过滤保留英语书籍，并按书名精确匹配去重。

**Wikipedia and Wikibooks for encyclopedic content.** Dolma uses March 2023 English and Simple dumps processed by WikiExtractor. Documents with at most 25 UTF-8-segmented words are removed because they are often short templates or XML parse errors. By design, this source has no duplicate documents.

**以 Wikipedia 和 Wikibooks 提供百科内容。** Dolma 使用 2023 年 3 月的 English 与 Simple dump，经 WikiExtractor 处理。UTF-8 分词后不超过 25 个词的文档会被删除，因为它们往往是短模板或 XML 解析错误。按设计，该来源没有重复文档。

## 9 Training a Language Model on Dolma

As final pipeline validation, the authors train and release OLMo-1B, a decoder-only autoregressive model, and compare zero-shot downstream performance with similarly sized released models.

作为管线的最终验证，作者训练并发布 decoder-only 自回归模型 OLMo-1B，并把其 zero-shot 下游表现与规模相近的公开模型比较。

### 9.1 Evaluating OLMo-1B

| Task | Pythia (1.1B) | OLMo-1B (1.2B) | StableLM2 (1.6B) | TinyLlama (1.1B) |
|---|---:|---:|---:|---:|
| ARC-E | 63.7 | 50.2 | 53.2 | 58.1 |
| ARC-C | 43.8 | 33.1 | 34.8 | 34.5 |
| BoolQ | 76.6 | 61.8 | 64.6 | 60.7 |
| HellaSwag | 68.2 | 44.7 | 58.7 | 62.5 |
| OpenBookQA | 45.8 | 37.8 | 43.6 | 46.4 |
| PIQA | 74.0 | 69.1 | 71.1 | 73.7 |
| SciQ | 94.7 | 86.0 | 90.5 | 88.1 |
| WinoGrande | 64.9 | 53.3 | 58.9 | 58.9 |
| **Average** | **66.5** | **54.5** | **59.4** | **60.3** |

**Table 2: Comparison of OLMo-1B and similarly sized language models on the evaluation suite.**

**表 2：OLMo-1B 与规模相近语言模型在评测套件上的比较。** PDF 抽取的列顺序可能受双栏排版影响；最终校对应以 LaTeX 表源 `tables/1b.tex` 为准。

Only TinyLlama was trained on roughly as many tokens as OLMo-1B; Pythia used nearly ten times fewer, while StableLM2 trained on 2T tokens for two epochs without disclosing composition. The paper states OLMo-1B performs better on average than the most comparable TinyLlama and wins four of eight tasks. Zero-shot evaluation is difficult for 1B models, but all models exceed naive random performance.

只有 TinyLlama 的训练 token 与 OLMo-1B 大致相当；Pythia 少近十倍，StableLM2 则在未公开组成的 2T token 上训练两个 epoch。论文称 OLMo-1B 平均优于最可比的 TinyLlama，并在八项任务中的四项胜出。zero-shot 对 1B 模型很难，但所有模型都超过朴素随机水平。

### 9.2 Measuring Domain Fit

To test whether Dolma's mixture fits diverse domains, the authors use Paloma, which samples hundreds of fine-grained sources in a stratified way. They train 1.2B models for 150B tokens on C4, English mC4, RedPajama v1, RefinedWeb, Pile and Dolma.

为检验 Dolma 混合是否适配多样领域，作者使用 Paloma；它以分层方式采样数百个细粒度来源。他们分别在 C4、英语 mC4、RedPajama v1、RefinedWeb、Pile 和 Dolma 上训练 1.2B 模型至 150B token。

Pile performs well despite smaller scale because it contains many sources. Larger multi-source Dolma, and to a lesser extent RedPajama v1, achieve similarly broad domain coverage. Single-source C4, English mC4 and RefinedWeb have poorer diverse-domain fit, shown by higher average perplexity. This controlled analysis supports including curated non-web sources.

Pile 尽管规模较小，却因来源丰富而表现良好。更大的多源 Dolma，以及程度稍弱的 RedPajama v1，也获得类似的广泛领域覆盖。单一来源的 C4、英语 mC4 和 RefinedWeb 平均困惑度更高，对多样领域的拟合较差。该受控分析支持纳入精心整理的非网页来源。
<!-- page 9 of 64 -->

**Figure 5.** 1.2B-parameter language models trained on 150B tokens from Dolma and other open corpora, evaluated across training iterations by perplexity over diverse Paloma domains.

**图 5。** 12 亿参数语言模型分别在 Dolma 和其他开放语料的 150B token 上训练，并在不同训练阶段以 Paloma 多样领域困惑度评测。

Paloma samples marked domains from every source equally rather than according to unequal source proportions. A model trained on Pile fits such data well because Pile is largely composed of many smaller, hand-picked sources. The challenge when scaling a corpus is to integrate more available web data without losing sample efficiency on diverse evaluations. OLMo-1B nearly matches the Pile model's perplexity curve despite including a much larger web fraction.

Paloma 对各来源中标记的领域做等量采样，而并非按来源原本不均衡的比例采样。Pile 由许多较小、人工选择的来源构成，因此在其上训练的模型很适合这类数据。扩大语料规模时，挑战在于如何纳入更多可得网页数据，而不损失 Paloma 等多样评测上的样本效率。尽管 OLMo-1B 的网页占比高得多，其困惑度曲线仍几乎追平 Pile 模型。

## Conclusion

We introduce Dolma, a three-trillion-token English corpus for language-model pretraining, containing web documents, scientific papers, code, public-domain books, social media and encyclopedic materials. Starting from explicit desiderata, we document curation pipelines and provide experiments supporting decisions. We freely release Dolma and all tools as part of OLMo.

我们提出用于语言模型预训练的三万亿 token 英语语料 Dolma，内容包括网页、科研论文、代码、公版书籍、社交媒体和百科材料。我们从明确设计目标出发，记录整理管线，并以实验支持决策；作为 OLMo 项目的一部分，Dolma 与全部整理工具均开放发布。

Since writing, the team has continued improving and releasing Dolma; follow-up v1.7 significantly improves downstream performance with the model held constant. The authors hope this work promotes transparency, reproducibility and further research, and narrows the gap in available pretraining data. Dolma is released under ODC-By and the toolkit under Apache 2.0.

成稿后，团队仍持续改进和发布 Dolma；后续 v1.7 在模型保持不变时显著改善下游表现。作者希望该工作推动透明、可复现和进一步研究，并弥合商业与开放模型在可得预训练数据方面的缺口。Dolma 采用 ODC-By，Toolkit 采用 Apache 2.0。

## Limitations

**English-only corpus.** Dolma was curated for English. Language identification may have false negatives, so a small proportion of non-English data may remain, but it is unlikely to yield meaningful non-English downstream performance. Dolma therefore reinforces English as NLP's “default” language.

**纯英语语料。** Dolma 按英语数据整理。语言识别可能有假阴性，因此仍可能含少量非英语数据，但不足以让在 Dolma 上训练的模型获得有意义的非英语下游表现。因此 Dolma 强化了英语是 NLP“默认语言”的预期。

**Representativeness.** No corpus can represent all language-model data-curation practices. Many open and closed models use content that cannot be acquired or redistributed and therefore cannot appear in Dolma.

**来源代表性。** 不可能构建代表全部语言模型数据整理实践的语料。许多开放与闭源模型使用无法取得或再分发的内容，因此不能纳入 Dolma。

**Single model configuration for ablations.** Validation covers only a subset of model types. Many models have 7B–70B parameters, while Dolma ablations use 1B dense autoregressive Transformers and test no alternative architectures. Efficient iteration motivated the choice, but decisions may not transfer to larger scales. Downstream developers should scrutinize Dolma before training.

**消融只使用单一模型配置。** 验证只覆盖部分模型类型。许多模型规模为 7B–70B，而 Dolma 消融使用 1B 稠密自回归 Transformer，也未测试替代架构。这样做是为了高效迭代，但设计决策可能无法迁移到更大模型；下游开发者应在训练前审查 Dolma。

**Limited evaluation tasks.** Tasks are chosen from prior base-model evaluations and checked against training contamination, so only a subset of routine model uses can be assessed. For example, code's contribution cannot be fully measured until models can generate executable code, a capability often observed only after instruction tuning.

**评测任务有限。** 任务来自既有基础模型评测，并检查不在训练数据中，因此只能覆盖模型常见用途的一部分。例如，只有当模型能生成可执行代码时才能充分衡量代码数据的作用，而这种能力往往要到指令微调后才出现。

**Full manual inspection is infeasible.** At this scale, tools such as WIMBD and Data Portraits can inspect subsets but not every document. The authors cannot fully characterize Dolma's distribution, content quality or harms caused by including or excluding particular content.

**无法全面人工检查。** 在该规模下，WIMBD、Data Portraits 等工具只能检查子集，无法评估每篇文档。因此作者不能完整描述 Dolma 的分布、内容质量，以及纳入或排除特定内容可能造成的伤害。

## Ethical Considerations

**Minimizing harm to individuals.** A pretraining corpus may increase access to information about individuals or enable harmful models that disclose personal information or generate toxic content. The team consulted legal and ethics experts early and assessed design decisions case by case. They follow accepted practices where available, such as masking certain PII, and take measured approaches where the literature disagrees, such as toxicity removal.

**尽量降低对个人的伤害。** 预训练语料可能便利他人取得个人信息，或促成会泄露个人信息、生成有毒内容的有害模型。团队在项目早期咨询法律与伦理专家，并逐案评估设计决策。有公认实践时遵循实践，例如遮蔽部分 PII；文献意见不一时采取审慎方法，例如毒性识别与删除。

The team will provide tools for removal requests and is willing to compromise reproducibility, performance or extensibility where individuals face significant harm. Alternative frameworks include data stewardship, data trusts and data licensing, which can collect explicit owner interests or consent. No current state-of-the-art model is trained entirely under such frameworks, so adopting them now would limit the representativeness goal; future Dolma versions may consider them as adoption grows.

团队将提供数据删除请求工具；在个人面临重大伤害时，愿意牺牲模型可复现性、性能或可扩展性。替代框架包括数据 stewardship、data trust 与 data licensing，可收集数据所有者明确利益或同意。目前没有最先进模型完全使用这些框架的数据训练，因此立即采用会限制代表性目标；随着实践普及，未来 Dolma 版本会考虑它们。
<!-- page 10 of 64 -->

**Copyright and fair use.** At writing time, copyright and fair-use/fair-dealing law for language models remained largely unsettled. Some US scholars and practitioners argue training on copyrighted content may be fair use while acknowledging existing doctrine's limitations. Assessments vary by jurisdiction: in early 2024 Israel and Japan allowed copyrighted content for AI training, though Japan was reconsidering its framework.

**版权与合理使用。** 成稿时，版权法以及合理使用/公平交易原则对语言模型的适用仍大体未定。一些美国学者和从业者认为，用受版权保护内容训练模型可能构成合理使用，同时也承认现有原则在该用途上的局限。判断随司法辖区而异：2024 年初，以色列与日本允许将版权内容用于 AI 训练，但日本当时正在重新考虑该框架。

Most Dolma sources were curated with copyright and licensing in mind—open-access peS2o papers, open-source Stack repositories—or were permissively licensed, such as Wikipedia under Creative Commons. Large web crawls may nevertheless contain copyrighted material, and current tools cannot reliably or scalably detect it in a corpus this large.

Dolma 多数来源在整理时考虑了版权与许可，例如 peS2o 的开放获取论文、The Stack 的开源仓库；另一些本就采用宽松许可，例如 Creative Commons 下的 Wikipedia。不过，大型网页抓取仍可能包含版权材料，现有工具无法在如此规模上可靠检测。

The decision to curate and distribute Dolma also considered that all sources were publicly available and already used in large-scale open and closed model pretraining. The authors recognize that AI law is changing rapidly, particularly for copyrighted training materials.

团队决定整理和分发 Dolma 时还考虑到：所有来源都已公开可得，并已用于开放和闭源大模型预训练。作者承认 AI 法律环境变化迅速，尤其涉及受版权保护的训练材料。

Data-removal request form: `forms.gle/FzpUXLJhE57JLJ3f8`.

数据删除请求表：`forms.gle/FzpUXLJhE57JLJ3f8`。

## References

参考文献从本页开始。书目信息、作者姓名、论文题目、出版物与 URL 属于引用元数据，按论文原文保留，不翻译题名，后续页继续。
<!-- page 11 of 64 -->

repository for natural language prompts. In Proceed- ings of the 60th Annual Meeting of the Association for Computational Linguistics: System Demonstra- tions, pages 93–104, Dublin, Ireland. Association for Computational Linguistics.

Jinze Bai, Shuai Bai, Yunfei Chu, Zeyu Cui, Kai Dang,

Xiaodong Deng, Yang Fan, Wenhang Ge, Yu Han, Fei Huang, Binyuan Hui, Luo Ji, Mei Li, Junyang Lin, Runji Lin, Dayiheng Liu, Gao Liu, Chengqiang Lu, K. Lu, Jianxin Ma, Rui Men, Xingzhang Ren, Xuancheng Ren, Chuanqi Tan, Sinan Tan, Jianhong Tu, Peng Wang, Shijie Wang, Wei Wang, Shengguang Wu, Benfeng Xu, Jin Xu, An Yang, Hao Yang, Jian Yang, Jian Yang, Shusheng Yang, Yang Yao, Bowen Yu, Yu Bowen, Hongyi Yuan, Zheng Yuan, Jianwei

Zhang, Xing Zhang, Yichang Zhang, Zhenru Zhang, Chang Zhou, Jingren Zhou, Xiaohuan Zhou, and Tianhang Zhu. 2023. Qwen technical report. ArXiv, abs/2309.16609.

Gowri Saini Balasubramaniam, Sara Rachel Benson,

Anita Say Chan, Keith Jacobs, Karen V. Jenkins, Smirity Kaushik, Jiaqi Ma, Madelyn Rose Sanfil- ippo, Eryclis Rodrigues Bezerra Silva, Emmy Tither, Michael Twidale, Ted E. Underwood, Yaman Yu, and Kyrie Zhou. 2023. Comment on docket doc- ument (colc-2023-0006-0001): Copyright and artifi- cial intelligence (ai). https://www.regulations. gov/comment/COLC-2023-0006-8998. Posted by the U.S. Copyright Office. See attached file(s).

Jason Baumgartner, Savvas Zannettou, Brian Keegan,

Megan Squire, and Jeremy Blackburn. 2020. The pushshift reddit dataset. arXiv [cs.SI].

Emily M. Bender and Batya Friedman. 2018. Data

Z. Chen, Eric Chu, J. Clark, Laurent El Shafey, Yan- ping Huang, Kathleen S. Meier-Hellstern, Gaurav Mishra, Erica Moreira, Mark Omernick, Kevin Robin- son, Sebastian Ruder, Yi Tay, Kefan Xiao, Yuanzhong Xu, Yujing Zhang, Gustavo Hernandez Abrego, Jun- whan Ahn, Jacob Austin, Paul Barham, Jan A. Botha, James Bradbury, Siddhartha Brahma, Kevin Michael Brooks, Michele Catasta, Yongzhou Cheng, Colin Cherry, Christopher A. Choquette-Choo, Aakanksha Chowdhery, C Crépy, Shachi Dave, Mostafa De- hghani, Sunipa Dev, Jacob Devlin, M. C. D’iaz, Nan Du, Ethan Dyer, Vladimir Feinberg, Fan Feng, Vlad Fienber, Markus Freitag, Xavier García, Sebastian Gehrmann, Lucas González, Guy Gur-Ari, Steven Hand, Hadi Hashemi, Le Hou, Joshua Howland, An Ren Hu, Jeffrey Hui, Jeremy Hurwitz, Michael Is- ard, Abe Ittycheriah, Matthew Jagielski, Wen Hao Jia, Kathleen Kenealy, Maxim Krikun, Sneha Kudugunta, Chang Lan, Katherine Lee, Benjamin Lee, Eric Li, Mu-Li Li, Wei Li, Yaguang Li, Jun Yu Li, Hyeontaek Lim, Han Lin, Zhong-Zhong Liu, Frederick Liu, Mar- cello Maggioni, Aroma Mahendru, Joshua Maynez, Vedant Misra, Maysam Moussalem, Zachary Nado, John Nham, Eric Ni, Andrew Nystrom, Alicia Parrish, Marie Pellat, Martin Polacek, Alex Polozov, Reiner Pope, Siyuan Qiao, Emily Reif, Bryan Richter, Parker Riley, Alexandra Ros, Aurko Roy, Brennan Saeta, Ra- jkumar Samuel, Renee Marie Shelby, Ambrose Slone, Daniel Smilkov, David R. So, Daniela Sohn, Simon Tokumine, Dasha Valter, Vijay Vasudevan, Kiran Vo- drahalli, Xuezhi Wang, Pidong Wang, Zirui Wang, Tao Wang, John Wieting, Yuhuai Wu, Ke Xu, Yunhan Xu, Lin Wu Xue, Pengcheng Yin, Jiahui Yu, Qiaoling Zhang, Steven Zheng, Ce Zheng, Wei Zhou, Denny Zhou, Slav Petrov, and Yonghui Wu. 2023. Palm 2 technical report. ArXiv, abs/2305.10403.

Anthropic. 2023. Introducing Claude. https://www.

anthropic.com/index/introducing-claude.

statements for natural language processing: Toward mitigating system bias and enabling better science. Transactions of the Association for Computational Linguistics, 6:587–604.

Stella Rose Biderman, Hailey Schoelkopf, Quentin G.

Giuseppe Attardi. 2023. Wikiextractor. https: //github.com/attardi/wikiextractor/tree/ 8f1b434a80608e1e313d38d263ed7c79c9ee75a9. Accessed: 2024-02-15.

Tom Ayoola, Shubhi Tyagi, Joseph Fisher, Christos

Anthony, Herbie Bradley, Kyle O’Brien, Eric Hal- lahan, Mohammad Aflah Khan, Shivanshu Purohit, USVSN Sai Prashanth, Edward Raff, Aviya Skowron, Lintang Sutawika, and Oskar van der Wal. 2023. Pythia: A suite for analyzing large language models across training and scaling. ArXiv, abs/2304.01373.

Abeba Birhane, Vinay Prabhu, Sang Han, Vishnu Naresh Boddeti, and Alexandra Sasha Luccioni. 2023a. Into the laions den: Investigating hate in multimodal datasets. ArXiv, abs/2311.03449.

Christodoulopoulos, and Andrea Pierleoni. 2022. Re- FinED: An efficient zero-shot-capable approach to end-to-end entity linking. In Proceedings of the 2022 Conference of the North American Chapter of the As- sociation for Computational Linguistics: Human Lan- guage Technologies: Industry Track, pages 209–220, Hybrid: Seattle, Washington + Online. Association for Computational Linguistics.

Abeba Birhane, Vinay Uday Prabhu, Sanghyun Han,

Stephen Bach, Victor Sanh, Zheng Xin Yong, Albert

and Vishnu Naresh Boddeti. 2023b. On hate scaling laws for data-swamps. ArXiv, abs/2306.13141.

Yonatan Bisk, Rowan Zellers, Ronan Le Bras, Jianfeng

Gao, and Yejin Choi. 2019. PIQA: Reasoning about physical commonsense in natural language. arXiv [cs.CL].

Sid Black, Stella Rose Biderman, Eric Hallahan,

Webson, Colin Raffel, Nihal V. Nayak, Abheesht Sharma, Taewoon Kim, M Saiful Bari, Thibault Fevry, Zaid Alyafeai, Manan Dey, Andrea Santilli, Zhiqing Sun, Srulik Ben-david, Canwen Xu, Gun- jan Chhablani, Han Wang, Jason Fries, Maged Al- shaibani, Shanya Sharma, Urmish Thakker, Khalid Almubarak, Xiangru Tang, Dragomir Radev, Mike Tian-jian Jiang, and Alexander Rush. 2022. Prompt- Source: An integrated development environment and

Quentin G. Anthony, Leo Gao, Laurence Golding, Horace He, Connor Leahy, Kyle McDonell, Jason
<!-- page 12 of 64 -->

2023 AAAI/ACM Conference on AI, Ethics, and Soci- ety, AIES ’23, page 855–868, New York, NY, USA. Association for Computing Machinery.

Phang, Michael Martin Pieler, USVSN Sai Prashanth, Shivanshu Purohit, Laria Reynolds, Jonathan Tow, Benqi Wang, and Samuel Weinbach. 2022. Gpt-neox- 20b: An open-source autoregressive language model. ArXiv, abs/2204.06745.

Kent K. Chang, Mackenzie Cramer, Sandeep Soni, and

Su Lin Blodgett, Lisa Green, and Brendan O’Connor.

David Bamman. 2023. Speak, memory: An ar- chaeology of books known to chatgpt/gpt-4. ArXiv, abs/2305.00118.

Mark Chen, Jerry Tworek, Heewoo Jun, Qiming

Yuan, Henrique Ponde de Oliveira Pinto, Jared Ka-

2016. Demographic dialectal variation in social media: A case study of African-American English. In Proceedings of the 2016 Conference on Empiri- cal Methods in Natural Language Processing, pages 1119–1130, Austin, Texas. Association for Computa- tional Linguistics.

Burton H Bloom. 1970. Space/time trade-offs in hash

coding with allowable errors. Communications of the ACM, 13(7):422–426.

Samuel Bowman, Gabor Angeli, Christopher Potts, and

Christopher D Manning. 2015a. A large annotated corpus for learning natural language inference. In Proceedings of the 2015 Conference on Empirical Methods in Natural Language Processing, pages 632– 642.

Samuel R. Bowman, Gabor Angeli, Christopher Potts,

plan, Harri Edwards, Yuri Burda, Nicholas Joseph, Greg Brockman, Alex Ray, Raul Puri, Gretchen Krueger, Michael Petrov, Heidy Khlaaf, Girish Sas- try, Pamela Mishkin, Brooke Chan, Scott Gray, Nick Ryder, Mikhail Pavlov, Alethea Power, Lukasz Kaiser, Mohammad Bavarian, Clemens Winter, Philippe Tillet, Felipe Petroski Such, Dave Cum- mings, Matthias Plappert, Fotios Chantzis, Eliza- beth Barnes, Ariel Herbert-Voss, William Hebgen Guss, Alex Nichol, Alex Paino, Nikolas Tezak, Jie Tang, Igor Babuschkin, Suchir Balaji, Shantanu Jain, William Saunders, Christopher Hesse, Andrew N. Carr, Jan Leike, Josh Achiam, Vedant Misra, Evan Morikawa, Alec Radford, Matthew Knight, Miles Brundage, Mira Murati, Katie Mayer, Peter Welinder, Bob McGrew, Dario Amodei, Sam McCandlish, Ilya Sutskever, and Wojciech Zaremba. 2021. Evaluating large language models trained on code.

Xiangning Chen, Chen Liang, Da Huang, Esteban Real,

and Christopher D. Manning. 2015b. A large anno- tated corpus for learning natural language inference. In Proceedings of the 2015 Conference on Empirical Methods in Natural Language Processing, pages 632– 642, Lisbon, Portugal. Association for Computational Linguistics.

Kaiyuan Wang, Yao Liu, Hieu Pham, Xuanyi Dong, Thang Luong, Cho-Jui Hsieh, Yifeng Lu, and Quoc V Le. 2023a. Symbolic discovery of optimization algo- rithms.

A Z Broder. 2002. On the resemblance and con- tainment of documents. In Proceedings. Compres- sion and Complexity of SEQUENCES 1997 (Cat. No.97TB100171), pages 21–29. IEEE Comput. Soc.

Yang Chen, Ethan Mendes, Sauvik Das, Wei Xu, and

Oana-Maria Camburu, Tim Rocktäschel, Thomas

Alan Ritter. 2023b. Can language models be in- structed to protect personal information? arXiv [cs.CL].

Lukasiewicz, and Phil Blunsom. 2018. e-snli: Natu- ral language inference with natural language expla- nations. Advances in Neural Information Processing Systems, 31.

Aakanksha Chowdhery, Sharan Narang, Jacob Devlin,

Nicholas Carlini, Daphne Ippolito, Matthew Jagielski,

Katherine Lee, Florian Tramer, and Chiyuan Zhang. 2022. Quantifying memorization across neural lan- guage models. arXiv [cs.LG].

Nicholas Carlini, Florian Tramer, Eric Wallace, Matthew Jagielski, Ariel Herbert-Voss, Katherine Lee, Adam Roberts, Tom Brown, Dawn Song, Ul- far Erlingsson, Alina Oprea, and Colin Raffel. 2020. Extracting training data from large language models. arXiv [cs.CR].

Tommaso Caselli, Valerio Basile, Jelena Mitrovi´c, and

Michael Granitzer. 2021. HateBERT: Retraining BERT for abusive language detection in English. In Proceedings of the 5th Workshop on Online Abuse and Harms (WOAH 2021), pages 17–25, Online. As- sociation for Computational Linguistics.

Alan Chan, Herbie Bradley, and Nitarshan Rajkumar.

Maarten Bosma, Gaurav Mishra, Adam Roberts, Paul Barham, Hyung Won Chung, Charles Sutton, Sebastian Gehrmann, Parker Schuh, Kensen Shi, Sasha Tsvyashchenko, Joshua Maynez, Abhishek Rao, Parker Barnes, Yi Tay, Noam M. Shazeer, Vinod- kumar Prabhakaran, Emily Reif, Nan Du, Benton C. Hutchinson, Reiner Pope, James Bradbury, Jacob Austin, Michael Isard, Guy Gur-Ari, Pengcheng Yin, Toju Duke, Anselm Levskaya, Sanjay Ghemawat, Sunipa Dev, Henryk Michalewski, Xavier García, Vedant Misra, Kevin Robinson, Liam Fedus, Denny Zhou, Daphne Ippolito, David Luan, Hyeontaek Lim, Barret Zoph, Alexander Spiridonov, Ryan Sepassi, David Dohan, Shivani Agrawal, Mark Omernick, An- drew M. Dai, Thanumalayan Sankaranarayana Pillai, Marie Pellat, Aitor Lewkowycz, Erica Moreira, Re- won Child, Oleksandr Polozov, Katherine Lee, Zong- wei Zhou, Xuezhi Wang, Brennan Saeta, Mark Díaz, Orhan Firat, Michele Catasta, Jason Wei, Kathleen S. Meier-Hellstern, Douglas Eck, Jeff Dean, Slav Petrov, and Noah Fiedel. 2022. Palm: Scaling language mod- eling with pathways. ArXiv, abs/2204.02311.

2023. Reclaiming the digital commons: A public data trust for training data. In Proceedings of the
<!-- page 13 of 64 -->

Alexandra Chronopoulou, Matthew Peters, and Jesse

Language Processing, pages 1286–1305, Online and Punta Cana, Dominican Republic. Association for Computational Linguistics.

Yanai Elazar, Akshita Bhagia, Ian Magnusson, Ab-

Dodge. 2022. Efficient hierarchical domain adapta- tion for pretrained language models. In Proceedings of the 2022 Conference of the North American Chap- ter of the Association for Computational Linguistics: Human Language Technologies, pages 1336–1351, Seattle, United States. Association for Computational Linguistics.

hilasha Ravichander, Dustin Schwenk, Alane Suhr, Pete Walsh, Dirk Groeneveld, Luca Soldaini, Sameer Singh, et al. 2023. What’s in my big data? arXiv preprint arXiv:2310.20707.

cjadams, Jeffrey Sorensen, Julia Elliott, Lucas Dixon,

Ali Farhadi, David Atkinson, Chris Callison-Burch,

Mark McDonald, nithum, and Will Cukierski. 2017. Toxic comment classification challenge.

Christopher Clark, Kenton Lee, Ming-Wei Chang,

Nicole DeCario, Jennifer Dumas, Kyle Lo, Crystal Nam, and Luca Soldaini. 2023. AI2 Response to Notice of Inquiry and Request for Comments.

Shangbin Feng, Chan Young Park, Yuhan Liu, and Yulia

Tom Kwiatkowski, Michael Collins, and Kristina Toutanova. 2019. Boolq: Exploring the surprising difficulty of natural yes/no questions. arXiv preprint arXiv:1905.10044.

Peter Clark, Isaac Cowhey, Oren Etzioni, Tushar Khot,

Ashish Sabharwal, Carissa Schoenick, and Oyvind Tafjord. 2018. Think you have solved question an- swering? try ARC, the AI2 reasoning challenge.

Tsvetkov. 2023. From pretraining data to language models to downstream tasks: Tracking the trails of political biases leading to unfair NLP models. In Proceedings of the 61st Annual Meeting of the As- sociation for Computational Linguistics (Volume 1: Long Papers), pages 11737–11762, Toronto, Canada. Association for Computational Linguistics.

Karl Cobbe, Vineet Kosaraju, Mohammad Bavarian,

Leo Gao. 2021. An empirical exploration in quality

filtering of text data. CoRR, abs/2109.00698.

Leo Gao, Stella Rose Biderman, Sid Black, Laurence

Mark Chen, Heewoo Jun, Lukasz Kaiser, Matthias Plappert, Jerry Tworek, Jacob Hilton, Reiichiro Nakano, Christopher Hesse, and John Schulman. 2021. Training verifiers to solve math word prob- lems. ArXiv, abs/2110.14168.

Golding, Travis Hoppe, Charles Foster, Jason Phang, Horace He, Anish Thite, Noa Nabeshima, Shawn Presser, and Connor Leahy. 2020. The Pile: An 800GB Dataset of Diverse Text for Language Model- ing. ArXiv, abs/2101.00027.

Common Crawl. 2016. cc-crawl-statistics. https://github.com/commoncrawl/ cc-crawl-statistics. [accessed August 2023].

Leo Gao, Jonathan Tow, Baber Abbasi, Stella Biderman,

Sid Black, Anthony DiPofi, Charles Foster, Laurence Golding, Jeffrey Hsu, Alain Le Noac’h, Haonan Li, Kyle McDonell, Niklas Muennighoff, Chris Ociepa, Jason Phang, Laria Reynolds, Hailey Schoelkopf, Aviya Skowron, Lintang Sutawika, Eric Tang, An- ish Thite, Ben Wang, Kevin Wang, and Andy Zou. 2023. A framework for few-shot language model evaluation.

Luyu Gao, Aman Madaan, Shuyan Zhou, Uri Alon,

Pengfei Liu, Yiming Yang, Jamie Callan, and Graham Neubig. 2022. Pal: Program-aided language models. arXiv preprint arXiv:2211.10435.

Claire Gardent, Anastasia Shimorina, Shashi Narayan,

A. Feder Cooper, Katherine Lee, James Grim- melmann, Daphne Ippolito, Christopher Callison- Burch, Christopher A. Choquette-Choo, Niloofar Mireshghallah, Miles Brundage, David Mimno, Madiha Zahrah Choksi, Jack M. Balkin, Nicholas Car- lini, Christopher De Sa, Jonathan Frankle, Deep Gan- guli, Bryant Gipson, Andres Guadamuz, Swee Leng Harris, Abigail Jacobs, Elizabeth E. Joh, Gautam Kamath, Mark A. Lemley, Cass Matthews, Chris- tine McLeavey, Corynne McSherry, Milad Nasr, Paul Ohm, Adam Roberts, Tom Rubin, Pamela Samuel- son, Ludwig Schubert, Kristen Vaccaro, Luis Villa, Felix T. Wu, and Elana Zeide. 2023. Report of the 1st Workshop on Generative AI and Law. Available at SSRN: https://ssrn.com/abstract=4634513.

Creative Commons. 2013. Attribution-ShareAlike 4.0 International. https://creativecommons.org/ licenses/by-sa/4.0/legalcode. [accessed Au- gust 2023].

and Laura Perez-Beltrachini. 2017. Creating training corpora for NLG micro-planners. In Proceedings of the 55th Annual Meeting of the Association for Computational Linguistics (Volume 1: Long Papers), pages 179–188, Vancouver, Canada. Association for Computational Linguistics.

Jenny L Davis and Timothy Graham. 2021. Emotional

consequences and attention rewards: the social effects of ratings on reddit. Information, communication and society, 24(5):649–666.

Jesse Dodge, Maarten Sap, Ana Marasovi´c, William

Timnit Gebru, Jamie Morgenstern, Briana Vec- chione, Jennifer Wortman Vaughan, Hanna Wallach, Hal Daumé Iii, and Kate Crawford. 2021. Datasheets for datasets. Communications of the ACM, 64(12):86– 92.

Samuel Gehman, Suchin Gururangan, Maarten Sap,

Yejin Choi, and Noah A. Smith. 2020. RealToxi-

Agnew, Gabriel Ilharco, Dirk Groeneveld, Margaret Mitchell, and Matt Gardner. 2021. Documenting large webtext corpora: A case study on the colos- sal clean crawled corpus. In Proceedings of the 2021 Conference on Empirical Methods in Natural

cityPrompts: Evaluating neural toxic degeneration in language models. In Findings of the Association
<!-- page 14 of 64 -->

for Computational Linguistics: EMNLP 2020, pages 3356–3369, Online. Association for Computational Linguistics.

Gemini Team, Rohan Anil, Sebastian Borgeaud,

Yonghui Wu, Jean-Baptiste Alayrac, Jiahui Yu, Radu

Soricut, Johan Schalkwyk, Andrew M Dai, Anja Hauth, Katie Millican, David Silver, Slav Petrov, Melvin Johnson, Ioannis Antonoglou, Julian Schrit- twieser, Amelia Glaese, Jilin Chen, Emily Pitler, Timothy Lillicrap, Angeliki Lazaridou, Orhan Fi- rat, James Molloy, Michael Isard, Paul R Barham, Tom Hennigan, Benjamin Lee, Fabio Viola, Malcolm Reynolds, Yuanzhong Xu, Ryan Doherty, Eli Collins, Clemens Meyer, Eliza Rutherford, Erica Moreira, Ka- reem Ayoub, Megha Goel, George Tucker, Enrique Piqueras, Maxim Krikun, Iain Barr, Nikolay Savi- nov, Ivo Danihelka, Becca Roelofs, Anaïs White, Anders Andreassen, Tamara von Glehn, Lakshman Yagati, Mehran Kazemi, Lucas Gonzalez, Misha

rav Mishra, Chris Welty, Josh Newlan, Dawei Jia, Mil- tiadis Allamanis, Clara Huiyi Hu, Raoul de Liedek- erke, Justin Gilmer, Carl Saroufim, Shruti Rijhwani, Shaobo Hou, Disha Shrivastava, Anirudh Baddepudi, Alex Goldin, Adnan Ozturel, Albin Cassirer, Yunhan Xu, Daniel Sohn, Devendra Sachan, Reinald Kim Amplayo, Craig Swanson, Dessie Petrova, Shashi Narayan, Arthur Guez, Siddhartha Brahma, Jessica Landon, Miteyan Patel, Ruizhe Zhao, Kevin Vil- lela, Luyu Wang, Wenhao Jia, Matthew Rahtz, Mai Giménez, Legg Yeung, Hanzhao Lin, James Keel- ing, Petko Georgiev, Diana Mincu, Boxi Wu, Salem Haykal, Rachel Saputro, Kiran Vodrahalli, James Qin, Zeynep Cankara, Abhanshu Sharma, Nick Fernando, Will Hawkins, Behnam Neyshabur, Solomon Kim, Adrian Hutter, Priyanka Agrawal, Alex Castro-Ros, George van den Driessche, Tao Wang, Fan Yang, Shuo-Yiin Chang, Paul Komarek, Ross McIlroy, Mario Luˇci´c, Guodong Zhang, Wael Farhan, Michael Sharman, Paul Natsev, Paul Michel, Yong Cheng, Yamini Bansal, Siyuan Qiao, Kris Cao, Siamak Shak-

eri, Christina Butterfield, Justin Chung, Paul Kishan Rubenstein, Shivani Agrawal, Arthur Mensch, Kedar Soparkar, Karel Lenc, Timothy Chung, Aedan Pope, Loren Maggiore, Jackie Kay, Priya Jhakra, Shibo Wang, Joshua Maynez, Mary Phuong, Taylor Tobin, Andrea Tacchetti, Maja Trebacz, Kevin Robinson, Yash Katariya, Sebastian Riedel, Paige Bailey, Ke-

fan Xiao, Nimesh Ghelani, Lora Aroyo, Ambrose Slone, Neil Houlsby, Xuehan Xiong, Zhen Yang, Elena Gribovskaya, Jonas Adler, Mateo Wirth, Lisa Lee, Music Li, Thais Kagohara, Jay Pavagadhi, So- phie Bridgers, Anna Bortsova, Sanjay Ghemawat, Zafarali Ahmed, Tianqi Liu, Richard Powell, Vijay Bolina, Mariko Iinuma, Polina Zablotskaia, James Besley, Da-Woon Chung, Timothy Dozat, Ramona Comanescu, Xiance Si, Jeremy Greer, Guolong Su, Martin Polacek, Raphaël Lopez Kaufman, Simon Tokumine, Hexiang Hu, Elena Buchatskaya, Yingjie Miao, Mohamed Elhawaty, Aditya Siddhant, Ne- nad Tomasev, Jinwei Xing, Christina Greer, He- len Miller, Shereen Ashraf, Aurko Roy, Zizhao Zhang, Ada Ma, Angelos Filos, Milos Besta, Rory Blevins, Ted Klimenko, Chih-Kuan Yeh, Soravit Changpinyo, Jiaqi Mu, Oscar Chang, Mantas Pa- jarskas, Carrie Muir, Vered Cohen, Charline Le Lan, Krishna Haridasan, Amit Marathe, Steven Hansen, Sholto Douglas, Rajkumar Samuel, Mingqiu Wang, Sophia Austin, Chang Lan, Jiepu Jiang, Justin Chiu, Jaime Alonso Lorenzo, Lars Lowe Sjösund, Sébastien Cevey, Zach Gleicher, Thi Avrahami, Anudhyan Bo- ral, Hansa Srinivasan, Vittorio Selo, Rhys May, Kon- stantinos Aisopos, Léonard Hussenot, Livio Baldini Soares, Kate Baumli, Michael B Chang, Adrià Re- casens, Ben Caine, Alexander Pritzel, Filip Pavetic, Fabio Pardo, Anita Gergely, Justin Frye, Vinay Ra- masesh, Dan Horgan, Kartikeya Badola, Nora Kass- ner, Subhrajit Roy, Ethan Dyer, Víctor Campos, Alex Tomala, Yunhao Tang, Dalia El Badawy, Elspeth White, Basil Mustafa, Oran Lang, Abhishek Jin- dal, Sharad Vikram, Zhitao Gong, Sergi Caelles, Ross Hemsley, Gregory Thornton, Fangxiaoyu Feng, Wojciech Stokowiec, Ce Zheng, Phoebe Thacker, Ça˘glar Ünlü, Zhishuai Zhang, Mohammad Saleh,

Khalman, Jakub Sygnowski, Alexandre Frechette, Charlotte Smith, Laura Culp, Lev Proleev, Yi Luan, Xi Chen, James Lottes, Nathan Schucher, Federico Lebron, Alban Rrustemi, Natalie Clay, Phil Crone, Tomas Kocisky, Jeffrey Zhao, Bartek Perz, Dian Yu, Heidi Howard, Adam Bloniarz, Jack W Rae, Han Lu, Laurent Sifre, Marcello Maggioni, Fred Alcober, Dan Garrette, Megan Barnes, Shantanu Thakoor, Ja- cob Austin, Gabriel Barth-Maron, William Wong, Rishabh Joshi, Rahma Chaabouni, Deeni Fatiha, Arun Ahuja, Ruibo Liu, Yunxuan Li, Sarah Cogan, Jeremy Chen, Chao Jia, Chenjie Gu, Qiao Zhang, Jor- dan Grimstad, Ale Jakse Hartman, Martin Chadwick, Gaurav Singh Tomar, Xavier Garcia, Evan Senter, Emanuel Taropa, Thanumalayan Sankaranarayana Pillai, Jacob Devlin, Michael Laskin, Diego de Las Casas, Dasha Valter, Connie Tao, Lorenzo Blanco, Adrià Puigdomènech Badia, David Reitter, Mianna Chen, Jenny Brennan, Clara Rivera, Sergey Brin, Shariq Iqbal, Gabriela Surita, Jane Labanowski, Abhi Rao, Stephanie Winkler, Emilio Parisotto, Yiming Gu, Kate Olszewska, Yujing Zhang, Ravi Addanki, Antoine Miech, Annie Louis, Laurent El Shafey, De- nis Teplyashin, Geoff Brown, Elliot Catt, Nithya Attaluri, Jan Balaguer, Jackie Xiang, Pidong Wang, Zoe Ashwood, Anton Briukhov, Albert Webson, San- jay Ganapathy, Smit Sanghavi, Ajay Kannan, Ming- Wei Chang, Axel Stjerngren, Josip Djolonga, Yut- ing Sun, Ankur Bapna, Matthew Aitchison, Pedram Pejman, Henryk Michalewski, Tianhe Yu, Cindy Wang, Juliette Love, Junwhan Ahn, Dawn Bloxwich, Kehang Han, Peter Humphreys, Thibault Sellam, James Bradbury, Varun Godbole, Sina Samangooei, Bogdan Damoc, Alex Kaskasoli, Sébastien M R Arnold, Vijay Vasudevan, Shubham Agrawal, Jason Riesa, Dmitry Lepikhin, Richard Tanburn, Srivat- san Srinivasan, Hyeontaek Lim, Sarah Hodkinson, Pranav Shyam, Johan Ferret, Steven Hand, Ankush Garg, Tom Le Paine, Jian Li, Yujia Li, Minh Gi- ang, Alexander Neitz, Zaheer Abbas, Sarah York, Machel Reid, Elizabeth Cole, Aakanksha Chowdhery, Dipanjan Das, Dominika Rogozi´nska, Vitaly Niko- laev, Pablo Sprechmann, Zachary Nado, Lukas Zilka, Flavien Prost, Luheng He, Marianne Monteiro, Gau-
<!-- page 15 of 64 -->

James Svensson, Max Bileschi, Piyush Patil, Ankesh Anand, Roman Ring, Katerina Tsihlas, Arpi Vezer, Marco Selvi, Toby Shevlane, Mikel Rodriguez, Tom Kwiatkowski, Samira Daruki, Keran Rong, Allan Dafoe, Nicholas FitzGerald, Keren Gu-Lemberg, Mina Khan, Lisa Anne Hendricks, Marie Pellat, Vladimir Feinberg, James Cobon-Kerr, Tara Sainath, Maribeth Rauh, Sayed Hadi Hashemi, Richard Ives, Yana Hasson, Yaguang Li, Eric Noland, Yuan Cao,

Raad, Remi Crocker, Peter Hawkins, Robert Dadashi, Colin Gaffney, Sid Lall, Ken Franko, Egor Filonov, Anna Bulanova, Rémi Leblond, Vikas Yadav, Shirley Chung, Harry Askham, Luis C Cobo, Kelvin Xu, Felix Fischer, Jun Xu, Christina Sorokin, Chris Al- berti, Chu-Cheng Lin, Colin Evans, Hao Zhou, Alek Dimitriev, Hannah Forbes, Dylan Banarse, Zora Tung, Jeremiah Liu, Mark Omernick, Colton Bishop, Chintu Kumar, Rachel Sterneck, Ryan Foley, Rohan Jain, Swaroop Mishra, Jiawei Xia, Taylor Bos, Ge- offrey Cideron, Ehsan Amid, Francesco Piccinno, Xingyu Wang, Praseem Banzal, Petru Gurita, Hila Noga, Premal Shah, Daniel J Mankowitz, Alex Polozov, Nate Kushman, Victoria Krakovna, Sasha Brown, Mohammadhossein Bateni, Dennis Duan, Vlad Firoiu, Meghana Thotakuri, Tom Natan, An- had Mohananey, Matthieu Geist, Sidharth Mudgal, Sertan Girgin, Hui Li, Jiayu Ye, Ofir Roval, Reiko Tojo, Michael Kwong, James Lee-Thorp, Christo- pher Yew, Quan Yuan, Sumit Bagri, Danila Sinopal- nikov, Sabela Ramos, John Mellor, Abhishek Sharma, Aliaksei Severyn, Jonathan Lai, Kathy Wu, Heng- Tze Cheng, David Miller, Nicolas Sonnerat, Denis Vnukov, Rory Greig, Jennifer Beattie, Emily Cave- ness, Libin Bai, Julian Eisenschlos, Alex Korchemniy, Tomy Tsai, Mimi Jasarevic, Weize Kong, Phuong Dao, Zeyu Zheng, Frederick Liu, Fan Yang, Rui Zhu, Mark Geller, Tian Huey Teh, Jason Sanmiya, Evgeny Gladchenko, Nejc Trdin, Andrei Sozanschi, Daniel Toyama, Evan Rosen, Sasan Tavakkol, Linting Xue, Chen Elkind, Oliver Woodman, John Carpen- ter, George Papamakarios, Rupert Kemp, Sushant Kafle, Tanya Grunina, Rishika Sinha, Alice Tal- bert, Abhimanyu Goyal, Diane Wu, Denese Owusu- Afriyie, Cosmo Du, Chloe Thornton, Jordi Pont- Tuset, Pradyumna Narayana, Jing Li, Sabaer Fatehi, John Wieting, Omar Ajmeri, Benigno Uria, Tao Zhu, Yeongil Ko, Laura Knight, Amélie Héliou, Ning

Niu, Shane Gu, Chenxi Pang, Dustin Tran, Yeqing Li, Nir Levine, Ariel Stolovich, Norbert Kalb, Re- beca Santamaria-Fernandez, Sonam Goenka, Wenny Yustalim, Robin Strudel, Ali Elqursh, Balaji Laksh-

minarayanan, Charlie Deck, Shyam Upadhyay, Hyo Lee, Mike Dusenberry, Zonglin Li, Xuezhi Wang, Kyle Levin, Raphael Hoffmann, Dan Holtmann- Rice, Olivier Bachem, Summer Yue, Sho Arora, Eric Malmi, Daniil Mirylenka, Qijun Tan, Christy Koh, Soheil Hassas Yeganeh, Siim Põder, Steven Zheng, Francesco Pongetti, Mukarram Tariq, Yan- hua Sun, Lucian Ionita, Mojtaba Seyedhosseini, Pouya Tafti, Ragha Kotikalapudi, Zhiyu Liu, An- mol Gulati, Jasmine Liu, Xinyu Ye, Bart Chrzaszcz, Lily Wang, Nikhil Sethi, Tianrun Li, Ben Brown, Shreya Singh, Wei Fan, Aaron Parisi, Joe Stanton, Chenkai Kuang, Vinod Koverkathu, Christopher A Choquette-Choo, Yunjie Li, T J Lu, Abe Ittycheriah, Prakash Shroff, Pei Sun, Mani Varadarajan, Sanaz Ba- hargam, Rob Willoughby, David Gaddy, Ishita Das- gupta, Guillaume Desjardins, Marco Cornero, Brona Robenek, Bhavishya Mittal, Ben Albrecht, Ashish Shenoy, Fedor Moiseev, Henrik Jacobsson, Alireza Ghaffarkhah, Morgane Rivière, Alanna Walton, Clé- ment Crepy, Alicia Parrish, Yuan Liu, Zongwei Zhou, Clement Farabet, Carey Radebaugh, Praveen

Nathan Byrd, Le Hou, Qingze Wang, Thibault Sottiaux, Michela Paganini, Jean-Baptiste Lespiau, Alexandre Moufarek, Samer Hassan, Kaushik Shiv- akumar, Joost van Amersfoort, Amol Mandhane, Pratik Joshi, Anirudh Goyal, Matthew Tung, Andrew Brock, Hannah Sheahan, Vedant Misra, Cheng Li, Ne- manja Raki´cevi´c, Mostafa Dehghani, Fangyu Liu, Sid Mittal, Junhyuk Oh, Seb Noury, Eren Sezener, Fan- tine Huot, Matthew Lamm, Nicola De Cao, Charlie Chen, Gamaleldin Elsayed, Ed Chi, Mahdis Mahdieh, Ian Tenney, Nan Hua, Ivan Petrychenko, Patrick Kane, Dylan Scandinaro, Rishub Jain, Jonathan Ue- sato, Romina Datta, Adam Sadovsky, Oskar Bun- yan, Dominik Rabiej, Shimu Wu, John Zhang, Gau- tam Vasudevan, Edouard Leurent, Mahmoud Al- nahlawi, Ionut Georgescu, Nan Wei, Ivy Zheng, Betty Chan, Pam G Rabinovitch, Piotr Stanczyk, Ye Zhang, David Steiner, Subhajit Naskar, Michael Azzam, Matthew Johnson, Adam Paszke, Chung- Cheng Chiu, Jaume Sanchez Elias, Afroz Mohiuddin, Faizan Muhammad, Jin Miao, Andrew Lee, Nino Vieillard, Sahitya Potluri, Jane Park, Elnaz Davoodi, Jiageng Zhang, Jeff Stanway, Drew Garmon, Abhi- jit Karmarkar, Zhe Dong, Jong Lee, Aviral Kumar, Luowei Zhou, Jonathan Evens, William Isaac, Zhe Chen, Johnson Jia, Anselm Levskaya, Zhenkai Zhu, Chris Gorgolewski, Peter Grabowski, Yu Mao, Al- berto Magni, Kaisheng Yao, Javier Snaider, Norman Casagrande, Paul Suganthan, Evan Palmer, Geof- frey Irving, Edward Loper, Manaal Faruqui, Isha Arkatkar, Nanxin Chen, Izhak Shafran, Michael Fink, Alfonso Castaño, Irene Giannoumis, Wooyeol Kim, Mikołaj Rybi´nski, Ashwin Sreevatsa, Jennifer Prendki, David Soergel, Adrian Goedeckemeyer, Willi Gierke, Mohsen Jafari, Meenu Gaba, Jeremy Wiesner, Diana Gage Wright, Yawen Wei, Harsha Vashisht, Yana Kulizhskaya, Jay Hoover, Maigo Le, Lu Li, Chimezie Iwuanyanwu, Lu Liu, Kevin Ramirez, Andrey Khorlin, Albert Cui, Tian Lin, Marin Georgiev, Marcus Wu, Ricardo Aguilar, Keith Pallo, Abhishek Chakladar, Alena Repina, Xihui Wu, Tom van der Weide, Priya Ponnapalli, Car- oline Kaplan, Jiri Simsa, Shuangfeng Li, Olivier Dousse, Fan Yang, Jeff Piper, Nathan Ie, Minnie Lui, Rama Pasumarthi, Nathan Lintz, Anitha Vi- jayakumar, Lam Nguyen Thiet, Daniel Andor, Pedro Valenzuela, Cosmin Paduraru, Daiyi Peng, Kather- ine Lee, Shuyuan Zhang, Somer Greene, Duc Dung Nguyen, Paula Kurylowicz, Sarmishta Velury, Se- bastian Krause, Cassidy Hardin, Lucas Dixon, Lili Janzer, Kiam Choo, Ziqiang Feng, Biao Zhang, Achintya Singhal, Tejasi Latkar, Mingyang Zhang, Quoc Le, Elena Allica Abellan, Dayou Du, Dan McK- innon, Natasha Antropova, Tolga Bolukbasi, Orgad Keller, David Reid, Daniel Finchelstein, Maria Abi
<!-- page 16 of 64 -->

Steiner, Dustin Li, Esin Durmus, Ethan Perez, Evan Hubinger, Kamil.e Lukovsiut.e, Karina Nguyen, Nicholas Joseph, Sam McCandlish, Jared Kaplan, and Sam Bowman. 2023. Studying large language model generalization with influence functions.

Suchin Gururangan, Dallas Card, Sarah Dreier, Emily

Gade, Leroy Wang, Zeyu Wang, Luke Zettlemoyer, and Noah A. Smith. 2022. Whose language counts as high quality? measuring language ideologies in text data selection. In Proceedings of the 2022 Con- ference on Empirical Methods in Natural Language Processing, pages 2562–2580, Abu Dhabi, United Arab Emirates. Association for Computational Lin- guistics.

Srinivasan, Claudia van der Salm, Andreas Fidje- land, Salvatore Scellato, Eri Latorre-Chimoto, Hanna Klimczak-Pluci´nska, David Bridson, Dario de Ce- sare, Tom Hudson, Piermaria Mendolicchio, Lexi Walker, Alex Morris, Ivo Penchev, Matthew Mauger, Alexey Guseynov, Alison Reid, Seth Odoom, Lucia Loher, Victor Cotruta, Madhavi Yenugula, Dominik Grewe, Anastasia Petrushkina, Tom Duerig, Antonio Sanchez, Steve Yadlowsky, Amy Shen, Amir Glober- son, Adam Kurzrok, Lynette Webb, Sahil Dua, Dong Li, Preethi Lahoti, Surya Bhupatiraju, Dan Hurt, Ha- roon Qureshi, Ananth Agarwal, Tomer Shani, Matan Eyal, Anuj Khare, Shreyas Rammohan Belle, Lei Wang, Chetan Tekur, Mihir Sanjay Kale, Jinliang Wei, Ruoxin Sang, Brennan Saeta, Tyler Liechty, Yi Sun, Yao Zhao, Stephan Lee, Pandu Nayak, Doug

Zayd Hammoudeh and Daniel Lowd. 2022. Training

data influence analysis and estimation: A survey. ArXiv, abs/2212.04612.

Thomas Hartvigsen, Saadia Gabriel, Hamid Palangi,

Maarten Sap, Dipankar Ray, and Ece Kamar. 2022. ToxiGen: A large-scale machine-generated dataset for adversarial and implicit hate speech detection. In Proceedings of the 60th Annual Meeting of the Association for Computational Linguistics (Volume 1: Long Papers), pages 3309–3326, Dublin, Ireland. Association for Computational Linguistics.

Kenneth Heafield. 2011. KenLM: Faster and smaller

language model queries. In Proceedings of the Sixth Workshop on Statistical Machine Translation, pages 187–197, Edinburgh, Scotland. Association for Com- putational Linguistics.

Matthew Henderson, Paweł Budzianowski, Iñigo

Casanueva, Sam Coope, Daniela Gerz, Girish Ku- mar, Nikola Mrkši´c, Georgios Spithourakis, Pei-Hao Su, Ivan Vulic, and Tsung-Hsien Wen. 2019. A repos- itory of conversational datasets. In Proceedings of the Workshop on NLP for Conversational AI. Data available at github.com/PolyAI-LDN/conversational- datasets.

Fritz, Manish Reddy Vuyyuru, John Aslanides, Nidhi Vyas, Martin Wicke, Xiao Ma, Taylan Bilal, Evgenii Eltyshev, Daniel Balle, Nina Martin, Hardie Cate, James Manyika, Keyvan Amiri, Yelin Kim, Xi Xiong, Kai Kang, Florian Luisier, Nilesh Tripuraneni, David Madras, Mandy Guo, Austin Waters, Oliver Wang, Joshua Ainslie, Jason Baldridge, Han Zhang, Garima Pruthi, Jakob Bauer, Feng Yang, Riham Mansour, Ja- son Gelman, Yang Xu, George Polovets, Ji Liu, Hong- long Cai, Warren Chen, Xianghai Sheng, Emily Xue, Sherjil Ozair, Adams Yu, Christof Angermueller, Xi- aowei Li, Weiren Wang, Julia Wiesinger, Emmanouil Koukoumidis, Yuan Tian, Anand Iyer, Madhu Gu- rumurthy, Mark Goldenson, Parashar Shah, M K Blake, Hongkun Yu, Anthony Urbanowicz, Jenni- maria Palomaki, Chrisantha Fernando, Kevin Brooks, Ken Durden, Harsh Mehta, Nikola Momchev, Elahe Rahimtoroghi, Maria Georgaki, Amit Raul, Sebas- tian Ruder, Morgan Redshaw, Jinhyuk Lee, Komal Jalan, Dinghua Li, Ginger Perng, Blake Hechtman, Parker Schuh, Milad Nasr, Mia Chen, Kieran Milan, Vladimir Mikulik, Trevor Strohman, Juliana Franco, Tim Green, Demis Hassabis, Koray Kavukcuoglu, Jeffrey Dean, and Oriol Vinyals. 2023. Gemini: A family of highly capable multimodal models. arXiv [cs.CL].

Peter Henderson, Xuechen Li, Dan Jurafsky, Tatsunori

Sidney Greenbaum. 1991. Ice: The international corpus

of english. English Today, 7(4):3–7.

Dirk Groeneveld, Iz Beltagy, Pete Walsh, Akshita Bha-

Hashimoto, Mark A. Lemley, and Percy Liang. 2023. Foundation models and fair use. ArXiv, abs/2303.15715.

Jordan Hoffmann, Sebastian Borgeaud, Arthur Mensch,

Elena Buchatskaya, Trevor Cai, Eliza Rutherford, Diego de Las Casas, Lisa Anne Hendricks, Johannes Welbl, Aidan Clark, Tom Hennigan, Eric Noland, Katie Millican, George van den Driessche, Bogdan Damoc, Aurelia Guy, Simon Osindero, Karen Si- monyan, Erich Elsen, Jack W. Rae, Oriol Vinyals, and L. Sifre. 2022. Training compute-optimal large language models. ArXiv, abs/2203.15556.

Jimin Hong, TaeHee Kim, Hyesu Lim, and Jaegul Choo.

gia, Rodney Kinney, Oyvind Tafjord, Ananya Harsh Jha, Hamish Ivison, Ian Magnusson, Yizhong Wang, Shane Arora, David Atkinson, Russell Authur, Khy- athi Raghavi Chandu, Arman Cohan, Jennifer Du- mas, Yanai Elazar, Yuling Gu, Jack Hessel, Tushar Khot, William Merrill, Jacob Morrison, Niklas Muen- nighoff, Aakanksha Naik, Crystal Nam, Matthew E Peters, Valentina Pyatkin, Abhilasha Ravichander, Dustin Schwenk, Saurabh Shah, Will Smith, Emma Strubell, Nishant Subramani, Mitchell Wortsman, Pradeep Dasigi, Nathan Lambert, Kyle Richardson, Luke Zettlemoyer, Jesse Dodge, Kyle Lo, Luca Sol- daini, Noah A Smith, and Hannaneh Hajishirzi. 2024. OLMo: Accelerating the science of language models. arXiv [cs.CL].

Roger Baker Grosse, Juhan Bae, Cem Anil, Nelson

2021. AVocaDo: Strategy for adapting vocabulary to downstream domain. In Proceedings of the 2021 Conference on Empirical Methods in Natural Lan- guage Processing, pages 4692–4700, Online and Punta Cana, Dominican Republic. Association for Computational Linguistics.

Elhage, Alex Tamkin, Amirhossein Tajdini, Benoit
<!-- page 17 of 64 -->

Israel Ministry of Justice. 2022. Opinion: Uses of copy-

Denis Kocetkov, Raymond Li, Loubna Ben Allal, Jia Li,

righted materials for machine learning. Accessed: 2024-02-15.

Yacine Jernite, Huu Nguyen, Stella Biderman, Anna

Chenghao Mou, Carlos Muñoz Ferrandis, Yacine Jer- nite, Margaret Mitchell, Sean Hughes, Thomas Wolf, et al. 2022. The Stack: 3 TB of permissively licensed source code. arXiv preprint arXiv:2211.15533.

Hema Swetha Koppula, Krishna P. Leela, Amit Agarwal,

Krishna Prasad Chitrapura, Sachin Garg, and Amit Sasturkar. 2010. Learning url patterns for webpage de-duplication. In Proceedings of the Third ACM International Conference on Web Search and Data Mining, WSDM ’10, page 381–390, New York, NY, USA. Association for Computing Machinery.

Taku Kudo. 2018. Subword regularization: Improv-

Rogers, Maraim Masoud, Valentin Danchev, Samson Tan, Alexandra Sasha Luccioni, Nishant Subramani, Gérard Dupont, Jesse Dodge, Kyle Lo, Zeerak Ta- lat, Isaac Johnson, Dragomir R. Radev, So maieh Nikpoor, Jorg Frohberg, Aaron Gokaslan, Peter Hen- derson, Rishi Bommasani, and Margaret Mitchell. 2022. Data governance in the age of large-scale data- driven language technology. Proceedings of the 2022 ACM Conference on Fairness, Accountability, and Transparency.

Albert Qiaochu Jiang, Alexandre Sablayrolles, Arthur

ing neural network translation models with multiple subword candidates. In Proceedings of the 56th An- nual Meeting of the Association for Computational Linguistics (Volume 1: Long Papers), pages 66–75, Melbourne, Australia. Association for Computational Linguistics.

Taku Kudo and John Richardson. 2018. SentencePiece:

Mensch, Chris Bamford, Devendra Singh Chap- lot, Diego de Las Casas, Florian Bressand, Gi- anna Lengyel, Guillaume Lample, Lucile Saulnier, L’elio Renard Lavaud, Marie-Anne Lachaux, Pierre Stock, Teven Le Scao, Thibaut Lavril, Thomas Wang, Timothée Lacroix, and William El Sayed. 2023. Mis- tral 7b. ArXiv, abs/2310.06825.

Armand Joulin, Edouard Grave, Piotr Bojanowski,

Matthijs Douze, Hérve Jégou, and Tomas Mikolov. 2016a. Fasttext.zip: Compressing text classification models. arXiv preprint arXiv:1612.03651.

A simple and language independent subword tok- enizer and detokenizer for neural text processing. In Proceedings of the 2018 Conference on Empirical Methods in Natural Language Processing: System Demonstrations, pages 66–71, Brussels, Belgium. As- sociation for Computational Linguistics.

Armand Joulin, Edouard Grave, Piotr Bojanowski, and

Hugo Laurenccon, Lucile Saulnier, Thomas Wang,

Tomas Mikolov. 2016b. Bag of tricks for efficient text classification. arXiv preprint arXiv:1607.01759.

Nikhil Kandpal, Haikang Deng, Adam Roberts, Eric

Wallace, and Colin Raffel. 2023. Large language models struggle to learn long-tail knowledge. In Proceedings of the 40th International Conference on Machine Learning, volume 202 of Proceedings of Machine Learning Research, pages 15696–15707. PMLR.

Rodney Kinney, Chloe Anastasiades, Russell Authur,

Christopher Akiki, Albert Villanova del Moral, Teven Le Scao, Leandro von Werra, Chenghao Mou, Eduardo Gonz’alez Ponferrada, Huu Nguyen, Jorg Frohberg, Mario vSavsko, Quentin Lhoest, Angelina McMillan-Major, Gérard Dupont, Stella Rose Bider- man, Anna Rogers, Loubna Ben Allal, Francesco De Toni, Giada Pistilli, Olivier Nguyen, Somaieh Nikpoor, Maraim Masoud, Pierre Colombo, Javier de la Rosa, Paulo Villegas, Tristan Thrush, S. Long- pre, Sebastian Nagel, Leon Weber, Manuel Sevilla Muñoz, Jian Zhu, Daniel Alexander van Strien, Zaid Alyafeai, Khalid Almubarak, Minh Chien Vu, Itziar Gonzalez-Dios, Aitor Soroa Etxabe, Kyle Lo, Manan Dey, Pedro Ortiz Suarez, Aaron Gokaslan, Shamik Bose, David Ifeoluwa Adelani, Long Phan, Hieu Trung Tran, Ian Yu, Suhas Pai, Jenny Chim, Vi- olette Lepercq, Suzana Ilic, Margaret Mitchell, Sasha Luccioni, and Yacine Jernite. 2023. The bigscience roots corpus: A 1.6tb composite multilingual dataset. ArXiv, abs/2303.03915.

Teven Le Scao, Thomas Wang, Daniel Hesslow, Stas

Iz Beltagy, Jonathan Bragg, Alexandra Buraczyn- ski, Isabel Cachola, Stefan Candra, Yoganand Chan- drasekhar, Arman Cohan, Miles Crawford, Doug Downey, Jason Dunkelberger, Oren Etzioni, Rob Evans, Sergey Feldman, Joseph Gorney, David Gra- ham, Fangzhou Hu, Regan Huff, Daniel King, Se- bastian Kohlmeier, Bailey Kuehl, Michael Langan, Daniel Lin, Haokun Liu, Kyle Lo, Jaron Lochner, Kelsey MacMillan, Tyler Murray, Chris Newell, Smita Rao, Shaurya Rohatgi, Paul Sayre, Zejiang Shen, Amanpreet Singh, Luca Soldaini, Shivashankar Subramanian, Amber Tanaka, Alex D. Wade, Linda Wagner, Lucy Lu Wang, Chris Wilhelm, Caroline Wu, Jiangjiang Yang, Angele Zamarron, Madeleine Van Zuylen, and Daniel S. Weld Weld. 2023. The Se- mantic Scholar Open Data Platform. arXiv preprint arXiv:2301.10140.

John Kirk and Gerald Nelson. 2018. The international

Bekman, M Saiful Bari, Stella Biderman, Hady Elsa- har, Niklas Muennighoff, Jason Phang, Ofir Press, Colin Raffel, Victor Sanh, Sheng Shen, Lintang Sutawika, Jaesung Tae, Zheng Xin Yong, Julien Lau- nay, and Iz Beltagy. 2022. What language model to train if you have one million GPU hours? In Find- ings of the Association for Computational Linguistics: EMNLP 2022, pages 765–782, Abu Dhabi, United Arab Emirates. Association for Computational Lin- guistics.

corpus of english project: A progress report. World Englishes.

Katherine Lee, A. Feder Cooper, and James Grimmel-

mann. 2024. Talkin’ ’Bout AI Generation: Copyright

Kate Knibbs. 2023. The battle over books3 could change ai forever.
<!-- page 18 of 64 -->

and the Generative-AI Supply Chain. Journal of the Copyright Society. Forthcoming.

Katherine Lee, Daphne Ippolito, Andrew Nystrom,

Chiyuan Zhang, Douglas Eck, Chris Callison-Burch, and Nicholas Carlini. 2022. Deduplicating training data makes language models better. In Proceedings of the 60th Annual Meeting of the Association for Computational Linguistics (Volume 1: Long Papers), pages 8424–8445, Dublin, Ireland. Association for Computational Linguistics.

Paulo Villegas, Maxim Kunakov, Fedor Zhdanov, Manuel Romero, Tony Lee, Nadav Timor, Jennifer Ding, Claire Schlesinger, Hailey Schoelkopf, Jana Ebert, Tri Dao, Mayank Mishra, Alexander Gu, Jennifer Robinson, Carolyn Jane Anderson, Bren- dan Dolan-Gavitt, Danish Contractor, Siva Reddy, Daniel Fried, Dzmitry Bahdanau, Yacine Jernite, Car- los Muñoz Ferrandis, Sean M. Hughes, Thomas Wolf, Arjun Guha, Leandro von Werra, and Harm de Vries. 2023b. Starcoder: may the source be with you! ArXiv, abs/2305.06161.

Colin Leong, Joshua Nemecek, Jacob Mansdorfer, Anna

Yinhan Liu, Myle Ott, Naman Goyal, Jingfei Du, Man-

dar Joshi, Danqi Chen, Omer Levy, Mike Lewis, Luke Zettlemoyer, and Veselin Stoyanov. 2019. Roberta: A robustly optimized bert pretraining approach. ArXiv, abs/1907.11692.

Zhengzhong Liu, Aurick Qiao, Willie Neiswanger,

Filighera, Abraham Owodunni, and Daniel White- nack. 2022. Bloom library: Multimodal datasets in 300+ languages for a variety of downstream tasks. In Proceedings of the 2022 Conference on Empiri- cal Methods in Natural Language Processing, pages 8608–8621, Abu Dhabi, United Arab Emirates. Asso- ciation for Computational Linguistics.

Hector J. Levesque, Ernest Davis, and Leora Morgen-

Hongyi Wang, Bowen Tan, Tianhua Tao, Junbo Li, Yuqi Wang, Suqi Sun, Omkar Pangarkar, Richard Fan, Yi Gu, Victor Miller, Yonghao Zhuang, Guowei He,

stern. 2012. The winograd schema challenge. In Proceedings of the Thirteenth International Confer- ence on Principles of Knowledge Representation and Reasoning, KR’12, page 552–561. AAAI Press.

Haonan Li, Fajri Koto, Liping Tang, Nikhil Ranjan, Zhiqiang Shen, Xuguang Ren, Roberto Iriondo, Cun Mu, Zhiting Hu, Mark Schulze, Preslav Nakov, Tim Baldwin, and Eric P. Xing. 2023. Llm360: Towards fully transparent open-source llms.

Quentin Lhoest, Albert Villanova del Moral, Patrick

LLM360 Team. 2024. Llm360 k2-65b: Scaling up open

and transparent language models.

Kyle Lo, Lucy Lu Wang, Mark Neumann, Rodney Kin-

ney, and Daniel Weld. 2020. S2ORC: The semantic scholar open research corpus. In Proceedings of the 58th Annual Meeting of the Association for Computa- tional Linguistics, pages 4969–4983, Online. Associ- ation for Computational Linguistics.

S. Longpre, Gregory Yauney, Emily Reif, Katherine

von Platen, Thomas Wolf, Mario Šaško, Yacine Jernite, Abhishek Thakur, Lewis Tunstall, Suraj Patil, Mariama Drame, Julien Chaumond, Julien Plu, Joe Davison, Simon Brandeis, Victor Sanh, Teven Le Scao, Kevin Canwen Xu, Nicolas Patry, Steven Liu, Angelina McMillan-Major, Philipp Schmid, Syl- vain Gugger, Nathan Raw, Sylvain Lesage, Anton Lozhkov, Matthew Carrigan, Théo Matussière, Lean- dro von Werra, Lysandre Debut, Stas Bekman, and Clément Delangue. 2021. Datasets: A Community Library for Natural Language Processing. In Proceed- ings of the 2021 Conference on Empirical Methods in Natural Language Processing: System Demonstra- tions, pages 175–184. Association for Computational Linguistics.

Lee, Adam Roberts, Barret Zoph, Denny Zhou, Jason Wei, Kevin Robinson, David M. Mimno, and Daphne Ippolito. 2023. A pretrainer’s guide to training data: Measuring the effects of data age, domain coverage, quality, & toxicity. ArXiv, abs/2305.13169.

Hanlin Li, Nicholas Vincent, Yacine Jernite, Nick Mer-

Alexandra Luccioni and Joseph Viviano. 2021. What’s

rill, Jesse Josua Benjamin, and Alek Tarkowski. 2023a. Can licensing mitigate the negative impli- cations of commercial web scraping? In Companion Publication of the 2023 Conference on Computer Supported Cooperative Work and Social Computing, CSCW ’23 Companion, page 553–555, New York, NY, USA. Association for Computing Machinery.

in the box? an analysis of undesirable content in the Common Crawl corpus. In Proceedings of the 59th Annual Meeting of the Association for Computational Linguistics and the 11th International Joint Confer- ence on Natural Language Processing (Volume 2: Short Papers), pages 182–189, Online. Association for Computational Linguistics.

Raymond Li, Loubna Ben Allal, Yangtian Zi, Niklas

Jeffrey MacKie-Mason and Haipeng Li. 2023. Re: Notice of inquiry (“noi”) and request for com- ments, artificial intelligence and copyright, docket no. 2023-6. https://www.regulations.gov/ comment/COLC-2023-0006-8194. Posted by the U.S. Copyright Office.

Aman Madaan, Shuyan Zhou, Uri Alon, Yiming Yang,

Muennighoff, Denis Kocetkov, Chenghao Mou, Marc Marone, Christopher Akiki, Jia Li, Jenny Chim, Qian Liu, Evgenii Zheltonozhskii, Terry Yue Zhuo, Thomas Wang, Olivier Dehaene, Mishig Davaadorj, Joel Lamy-Poirier, João Monteiro, Oleh Shliazhko, Nicolas Gontier, Nicholas Meade, Armel Zebaze, Ming-Ho Yee, Logesh Kumar Umapathi, Jian Zhu, Benjamin Lipkin, Muhtasham Oblokulov, Zhiruo Wang, Rudra Murthy, Jason Stillerman, Siva Sankalp Patel, Dmitry Abulkhanov, Marco Zocca, Manan Dey, Zhihan Zhang, Nourhan Fahmy, Urvashi Bhat- tacharyya, W. Yu, Swayam Singh, Sasha Luccioni,

and Graham Neubig. 2022. Language models of code are few-shot commonsense learners. In Proceedings of the 2022 Conference on Empirical Methods in Nat- ural Language Processing, pages 1384–1403, Abu
<!-- page 19 of 64 -->

Todor Mihaylov, Peter Clark, Tushar Khot, and Ashish

Dhabi, United Arab Emirates. Association for Com- putational Linguistics.

Inbal Magar and Roy Schwartz. 2022. Data contamina-

Sabharwal. 2018. Can a suit of armor conduct elec- tricity? a new dataset for open book question answer- ing. arXiv [cs.CL].

Sewon Min, Mike Lewis, Luke Zettlemoyer, and Han-

tion: From memorization to exploitation. In Proceed- ings of the 60th Annual Meeting of the Association for Computational Linguistics (Volume 2: Short Pa- pers), pages 157–165, Dublin, Ireland. Association for Computational Linguistics.

Ian Magnusson, Akshita Bhagia, Valentin Hofmann,

naneh Hajishirzi. 2022. MetaICL: Learning to learn in context. In Proceedings of the 2022 Conference of the North American Chapter of the Association for Computational Linguistics: Human Language Tech- nologies, pages 2791–2809, Seattle, United States. Association for Computational Linguistics.

Niklas Muennighoff, Qian Liu, Armel Zebaze, Qinkai

Luca Soldaini, Ananya Harsh Jha, Oyvind Tafjord, Dustin Schwenk, Evan Pete Walsh, Yanai Elazar, Kyle Lo, Dirk Groeneveld, Iz Beltagy, Hannaneh Ha- jishirzi, Noah A Smith, Kyle Richardson, and Jesse Dodge. 2023. Paloma: A benchmark for evaluating language model fit. arXiv [cs.CL].

Zheng, Binyuan Hui, Terry Yue Zhuo, Swayam Singh, Xiangru Tang, Leandro Von Werra, and Shayne Long- pre. 2023a. Octopack: Instruction tuning code large language models. arXiv preprint arXiv:2308.07124.

Mitchell Marcus, Grace Kim, Mary Ann Marcinkiewicz,

Niklas Muennighoff, Alexander M Rush, Boaz Barak,

Teven Le Scao, Aleksandra Piktus, Nouamane Tazi, Sampo Pyysalo, Thomas Wolf, and Colin Raffel. 2023b. Scaling data-constrained language models. arXiv preprint arXiv:2305.16264.

Robert MacIntyre, Ann Bies, Mark Ferguson, Karen Katz, and Britta Schasberger. 1994. The Penn Tree- bank: Annotating predicate argument structure. In Human Language Technology: Proceedings of a Workshop held at Plainsboro, New Jersey, March

8-11, 1994.

Roberto Navigli, Simone Conia, and Björn Ross. 2023.

Marco Marelli, Stefano Menini, Marco Baroni, Luisa

Biases in large language models: Origins, inventory, and discussion. J. Data and Information Quality, 15(2).

Helen Ngo, Cooper Raterink, João G M Araújo, Ivan

Zhang, Carol Chen, Adrien Morisot, and Nicholas Frosst. 2021. Mitigating harm in language models with conditional-likelihood filtration.

Bentivogli, Raffaella Bernardi, and Roberto Zam- parelli. 2014. A SICK cure for the evaluation of compositional distributional semantic models. In Proceedings of the Ninth International Conference on Language Resources and Evaluation (LREC’14), pages 216–223, Reykjavik, Iceland. European Lan- guage Resources Association (ELRA).

Ofir Press, Noah A Smith, and Mike Lewis. 2021. Train

Todor Markov, Chong Zhang, Sandhini Agarwal, Flo-

short, test long: Attention with linear biases enables input length extrapolation.

Open Data Commons. 2010. Open Data Commons

Attribution License (ODC-By) v1.0. https:// opendatacommons.org/licenses/by/1-0/. An- nouncement. [accessed August 2023].

OpenAI. 2023. Gpt-4 technical report. ArXiv, abs/2303.08774.

rentine Eloundou Nekoul, Theodore Lee, Steven Adler, Angela Jiang, and Lilian Weng. 2023. A holistic approach to undesired content detection in the real world. In Proceedings of the Thirty- Seventh AAAI Conference on Artificial Intelligence and Thirty-Fifth Conference on Innovative Applica- tions of Artificial Intelligence and Thirteenth Sympo- sium on Educational Advances in Artificial Intelli- gence, AAAI’23/IAAI’23/EAAI’23. AAAI Press.

Marc Marone and Benjamin Van Durme. 2023. Data

portraits: Recording foundation model training data. ArXiv, abs/2303.03919.

Srdjan Matic, Costas Iordanou, Georgios Smaragdakis,

Antonis Papasavva, Savvas Zannettou, Emiliano De Cristofaro, Gianluca Stringhini, and Jeremy Blackburn. 2020. Raiders of the lost kek: 3.5 years of augmented 4chan posts from the politically incorrect board. 14th International AAAI Conference On Web And Social Media (ICWSM), 2020.

Guilherme Penedo, Hynek Kydlíˇcek, Loubna Ben

and Nikolaos Laoutaris. 2020. Identifying sensitive urls at web-scale. Proceedings of the ACM Internet Measurement Conference.

Stephen Merity, Caiming Xiong, James Bradbury, and

Allal, Anton Lozhkov, Colin Raffel, Leandro Werra, and Thomas Wolf. 2024. FineWeb: decanting the web for the finest text data at scale. https://huggingface.co/spaces/ HuggingFaceFW/blogpost-fineweb-v1.

Richard Socher. 2016. Pointer Sentinel Mixture Mod- els. arXiv preprint arXiv:1609.07843.

Guilherme Penedo, Quentin Malartic, Daniel Hess-

Microsoft. 2018. Presidio - data protection and de- identification sdk.

Microsoft. 2019. Blingfire: A lightning fast Fi- nite State machine and REgular expression manip- ulation library. https://github.com/microsoft/ BlingFire.

low, Ruxandra-Aimée Cojocaru, Alessandro Cap- pelli, Hamza Alobeidli, Baptiste Pannier, Ebtesam Almazrouei, and Julien Launay. 2023. The refined- web dataset for falcon llm: Outperforming curated corpora with web data, and web data only. ArXiv, abs/2306.01116.
<!-- page 20 of 64 -->

Joshua Peterson. 2020. openwebtext: Open clone of

Anand Rajaraman and Jeffrey David Ullman. 2011.

Mining of Massive Datasets. Cambridge University Press, USA.

OpenAI’s unreleased WebText dataset scraper. this version uses pushshift.io files instead of the API for speed.

Yasaman Razeghi, Robert L Logan IV, Matt Gardner,

Aleksandar Petrov, Emanuele La Malfa, Philip H. S.

and Sameer Singh. 2022. Impact of pretraining term frequencies on few-shot numerical reasoning. In Findings of the Association for Computational Lin-

Torr, and Adel Bibi. 2023. Language model tokeniz- ers introduce unfairness between languages.

Aleksandra Piktus, Christopher Akiki, Paulo Villegas,

guistics: EMNLP 2022, pages 840–854, Abu Dhabi, United Arab Emirates. Association for Computational Linguistics.

Hugo Laurençon, Gérard Dupont, Sasha Luccioni, Yacine Jernite, and Anna Rogers. 2023. The ROOTS

Machel Reid, Victor Zhong, Suchin Gururangan, and

search tool: Data transparency for LLMs. In Proceed- ings of the 61st Annual Meeting of the Association for Computational Linguistics (Volume 3: System Demonstrations), pages 304–314, Toronto, Canada. Association for Computational Linguistics.

Mohammad Taher Pilehvar and Jose Camacho-Collados.

Luke Zettlemoyer. 2022. M2D2: A massively multi- domain language modeling dataset. In Proceedings of the 2022 Conference on Empirical Methods in Natural Language Processing, pages 964–975, Abu Dhabi, United Arab Emirates. Association for Com- putational Linguistics.

Manoel Horta Ribeiro, Jeremy Blackburn, Barry Brad-

2019. Wic: the word-in-context dataset for evaluat- ing context-sensitive meaning representations. In Proceedings of the 2019 Conference of the North American Chapter of the Association for Computa-

tional Linguistics: Human Language Technologies, Volume 1 (Long and Short Papers), pages 1267–1273.

Alec Radford, Jeffrey Wu, Rewon Child, David Luan,

lyn, Emiliano De Cristofaro, Gianluca Stringhini, Summer Long, Stephanie Greenberg, and Savvas Zan- nettou. 2021. The evolution of the manosphere across the web. In Proceedings of the International AAAI Conference on Web and Social Media, volume 15, pages 196–207.

Melissa Roemmele, Cosmin Adrian Bejan, and An-

Dario Amodei, and Ilya Sutskever. 2019. Language models are unsupervised multitask learners.

Jack W. Rae, Sebastian Borgeaud, Trevor Cai, Katie

drew S Gordon. 2011. Choice of plausible alterna- tives: An evaluation of commonsense causal reason- ing. In 2011 AAAI Spring Symposium Series.

Stephen Roller, Emily Dinan, Naman Goyal, Da Ju,

Mary Williamson, Yinhan Liu, Jing Xu, Myle Ott, Eric Michael Smith, Y-Lan Boureau, and Jason We- ston. 2021. Recipes for building an open-domain chatbot. In Proceedings of the 16th Conference of the European Chapter of the Association for Compu- tational Linguistics: Main Volume, pages 300–325, Online. Association for Computational Linguistics.

Keisuke Sakaguchi, Ronan Le Bras, Chandra Bhaga-

vatula, and Yejin Choi. 2019. WinoGrande: An ad- versarial winograd schema challenge at scale. arXiv [cs.CL].

Sebastin Santy, Jenny T Liang, Ronan Le Bras, Katha-

rina Reinecke, and Maarten Sap. 2023. NLPosition- ality: Characterizing design biases of datasets and models. arXiv [cs.CL].

Maarten Sap, Swabha Swayamdipta, Laura Vianna,

Xuhui Zhou, Yejin Choi, and Noah A Smith. 2021. Annotators with attitudes: How annotator beliefs and identities bias toxic language detection. arXiv [cs.CL].

Teven Le Scao, Angela Fan, Christopher Akiki,

Millican, Jordan Hoffmann, Francis Song, John Aslanides, Sarah Henderson, Roman Ring, Susan- nah Young, Eliza Rutherford, Tom Hennigan, Ja- cob Menick, Albin Cassirer, Richard Powell, George van den Driessche, Lisa Anne Hendricks, Mari- beth Rauh, Po-Sen Huang, Amelia Glaese, Johannes Welbl, Sumanth Dathathri, Saffron Huang, Jonathan Uesato, John F. J. Mellor, Irina Higgins, Antonia Creswell, Nathan McAleese, Amy Wu, Erich Elsen, Siddhant M. Jayakumar, Elena Buchatskaya, David Budden, Esme Sutherland, Karen Simonyan, Michela Paganini, L. Sifre, Lena Martens, Xiang Lorraine Li, Adhiguna Kuncoro, Aida Nematzadeh, Elena Gribovskaya, Domenic Donato, Angeliki Lazaridou, Arthur Mensch, Jean-Baptiste Lespiau, Maria Tsim- poukelli, N. K. Grigorev, Doug Fritz, Thibault Sotti- aux, Mantas Pajarskas, Tobias Pohlen, Zhitao Gong, Daniel Toyama, Cyprien de Masson d’Autume, Yujia Li, Tayfun Terzi, Vladimir Mikulik, Igor Babuschkin, Aidan Clark, Diego de Las Casas, Aurelia Guy, Chris Jones, James Bradbury, Matthew G. Johnson, Blake A. Hechtman, Laura Weidinger, Iason Gabriel, William S. Isaac, Edward Lockhart, Simon Osindero, Laura Rimell, Chris Dyer, Oriol Vinyals, Kareem W. Ayoub, Jeff Stanway, L. L. Bennett, Demis Hassabis, Koray Kavukcuoglu, and Geoffrey Irving. 2021. Scal- ing language models: Methods, analysis & insights from training gopher. ArXiv, abs/2112.11446.

Colin Raffel, Noam Shazeer, Adam Roberts, Katherine

Elizabeth-Jane Pavlick, Suzana Ili’c, Daniel Hesslow, Roman Castagn’e, Alexandra Sasha Luccioni, Franc- cois Yvon, Matthias Gallé, Jonathan Tow, Alexan- der M. Rush, Stella Rose Biderman, Albert Web- son, Pawan Sasanka Ammanamanchi, Thomas Wang, Benoît Sagot, Niklas Muennighoff, Albert Villanova del Moral, Olatunji Ruwase, Rachel Bawden, Stas Bekman, Angelina McMillan-Major, Iz Beltagy, Huu

Lee, Sharan Narang, Michael Matena, Yanqi Zhou, Wei Li, and Peter J Liu. 2020. Exploring the Limits of Transfer Learning with a Unified Text-to-Text Trans- former. The Journal of Machine Learning Research, 21(1):5485–5551.
<!-- page 21 of 64 -->

rina Novikova, Jessica Zosa Forde, Xiangru Tang, Jungo Kasai, Ken Kawamura, Liam Hazan, Ma- rine Carpuat, Miruna Clinciu, Najoung Kim, New- ton Cheng, Oleg Serikov, Omer Antverg, Oskar van der Wal, Rui Zhang, Ruochen Zhang, Sebastian Gehrmann, Shachar Mirkin, S. Osher Pais, Tatiana Shavrina, Thomas Scialom, Tian Yun, Tomasz Lim- isiewicz, Verena Rieser, Vitaly Protasov, Vladislav Mikhailov, Yada Pruksachatkun, Yonatan Belinkov, Zachary Bamberger, Zdenvek Kasner, Alice Rueda, Amanda Pestana, Amir Feizpour, Ammar Khan, Amy Faranak, Ananda Santa Rosa Santos, Anthony Hevia, Antigona Unldreaj, Arash Aghagol, Are- zoo Abdollahi, Aycha Tammour, Azadeh HajiHos- seini, Bahareh Behroozi, Benjamin Olusola Ajibade, Bharat Kumar Saxena, Carlos Muñoz Ferrandis, Danish Contractor, David M. Lansky, Davis David, Douwe Kiela, Duong Anh Nguyen, Edward Tan, Emily Baylor, Ezinwanne Ozoani, Fatim Tahirah Mirza, Frankline Ononiwu, Habib Rezanejad, H.A. Jones, Indrani Bhattacharya, Irene Solaiman, Irina Sedenko, Isar Nejadgholi, Jan Passmore, Joshua Seltzer, Julio Bonis Sanz, Karen Fort, Lívia Macedo Dutra, Mairon Samagaio, Maraim Elbadri, Mar- got Mieskes, Marissa Gerchick, Martha Akinlolu, Michael McKenna, Mike Qiu, M. K. K. Ghauri, Mykola Burynok, Nafis Abrar, Nazneen Rajani, Nour Elkott, Nourhan Fahmy, Olanrewaju Samuel, Ran An, R. P. Kromann, Ryan Hao, Samira Alizadeh, Sarmad Shubber, Silas L. Wang, Sourav Roy, Syl- vain Viguier, Thanh-Cong Le, Tobi Oyebade, Trieu Nguyen Hai Le, Yoyo Yang, Zachary Kyle Nguyen, Abhinav Ramesh Kashyap, A. Palasciano, Alison Callahan, Anima Shukla, Antonio Miranda-Escalada, Ayush Kumar Singh, Benjamin Beilharz, Bo Wang, Caio Matheus Fonseca de Brito, Chenxi Zhou, Chirag Jain, Chuxin Xu, Clémentine Fourrier, Daniel Le’on Perin’an, Daniel Molano, Dian Yu, Enrique Man- javacas, Fabio Barth, Florian Fuhrimann, Gabriel Altay, Giyaseddin Bayrak, Gully Burns, Helena U. Vrabec, Iman I.B. Bello, Isha Dash, Ji Soo Kang, John Giorgi, Jonas Golde, Jose David Posada, Karthi Sivaraman, Lokesh Bulchandani, Lu Liu, Luisa Shinzato, Madeleine Hahn de Bykhovetz, Maiko Takeuchi, Marc Pàmies, María Andrea Castillo, Mar- ianna Nezhurina, Mario Sanger, Matthias Samwald, Michael Cullan, Michael Weinberg, M Wolf, Mina Mihaljcic, Minna Liu, Moritz Freidank, Myung- sun Kang, Natasha Seelam, Nathan Dahlberg, Nicholas Michio Broad, Nikolaus Muellner, Pas- cale Fung, Patricia Haller, R. Chandrasekhar, Renata Eisenberg, Robert Martin, Rodrigo L. Canalli, Ros- aline Su, Ruisi Su, Samuel Cahyawijaya, Samuele Garda, Shlok S Deshmukh, Shubhanshu Mishra, Sid Kiblawi, Simon Ott, Sinee Sang-aroonsiri, Srishti Ku- mar, Stefan Schweter, Sushil Pratap Bharati, T. A. Laud, Th’eo Gigant, Tomoya Kainuma, Wojciech Kusa, Yanis Labrak, Yashasvi Bajaj, Y. Venkatraman, Yifan Xu, Ying Xu, Yu Xu, Zhee Xao Tan, Zhongli Xie, Zifan Ye, Mathilde Bras, Younes Belkada, and Thomas Wolf. 2022. Bloom: A 176b-parameter open-access multilingual language model. ArXiv, abs/2211.05100.

Nguyen, Lucile Saulnier, Samson Tan, Pedro Ortiz Suarez, Victor Sanh, Hugo Laurenccon, Yacine Jer- nite, Julien Launay, Margaret Mitchell, Colin Raf- fel, Aaron Gokaslan, Adi Simhi, Aitor Soroa Etx- abe, Alham Fikri Aji, Amit Alfassy, Anna Rogers, Ariel Kreisberg Nitzav, Canwen Xu, Chenghao Mou, Chris C. Emezue, Christopher Klamm, Colin Leong, Daniel Alexander van Strien, David Ifeoluwa Ade- lani, Dragomir R. Radev, Eduardo Gonz’alez Pon- ferrada, Efrat Levkovizh, Ethan Kim, Eyal Bar Natan, Francesco De Toni, Gérard Dupont, Germán Kruszewski, Giada Pistilli, Hady ElSahar, Hamza Benyamina, Hieu Trung Tran, Ian Yu, Idris Abdul- mumin, Isaac Johnson, Itziar Gonzalez-Dios, Javier de la Rosa, Jenny Chim, Jesse Dodge, Jian Zhu, Jonathan Chang, Jorg Frohberg, Josephine L. To- bing, Joydeep Bhattacharjee, Khalid Almubarak, Kimbo Chen, Kyle Lo, Leandro von Werra, Leon Weber, Long Phan, Loubna Ben Allal, Ludovic Tan- guy, Manan Dey, Manuel Romero Muñoz, Maraim Masoud, Mar’ia Grandury, Mario vSavsko, Max Huang, Maximin Coavoux, Mayank Singh, Mike Tian-Jian Jiang, Minh Chien Vu, Mohammad Ali Jauhar, Mustafa Ghaleb, Nishant Subramani, Nora Kassner, Nurulaqilla Khamis, Olivier Nguyen, Omar Espejel, Ona de Gibert, Paulo Villegas, Peter Hender- son, Pierre Colombo, Priscilla A. Amuok, Quentin Lhoest, Rheza Harliman, Rishi Bommasani, Roberto L’opez, Rui Ribeiro, Salomey Osei, Sampo Pyysalo, Sebastian Nagel, Shamik Bose, Shamsuddeen Has- san Muhammad, Shanya Sharma, S. Longpre, So- maieh Nikpoor, S. Silberberg, Suhas Pai, Sydney Zink, Tiago Timponi Torrent, Timo Schick, Tris- tan Thrush, Valentin Danchev, Vassilina Nikoulina, Veronika Laippala, Violette Lepercq, Vrinda Prabhu, Zaid Alyafeai, Zeerak Talat, Arun Raja, Benjamin Heinzerling, Chenglei Si, Elizabeth Salesky, Sab- rina J. Mielke, Wilson Y. Lee, Abheesht Sharma, An- drea Santilli, Antoine Chaffin, Arnaud Stiegler, Deba- jyoti Datta, Eliza Szczechla, Gunjan Chhablani, Han Wang, Harshit Pandey, Hendrik Strobelt, Jason Alan Fries, Jos Rozen, Leo Gao, Lintang Sutawika, M Sai- ful Bari, Maged S. Al-shaibani, Matteo Manica, Ni- hal V. Nayak, Ryan Teehan, Samuel Albanie, Sheng Shen, Srulik Ben-David, Stephen H. Bach, Taewoon Kim, Tali Bers, Thibault Févry, Trishala Neeraj, Ur- mish Thakker, Vikas Raunak, Xiang Tang, Zheng Xin Yong, Zhiqing Sun, Shaked Brody, Y Uri, Hadar Tojarieh, Adam Roberts, Hyung Won Chung, Jae- sung Tae, Jason Phang, Ofir Press, Conglong Li, Deepak Narayanan, Hatim Bourfoune, Jared Casper, Jeff Rasley, Max Ryabinin, Mayank Mishra, Minjia Zhang, Mohammad Shoeybi, Myriam Peyrounette, Nicolas Patry, Nouamane Tazi, Omar Sanseviero, Patrick von Platen, Pierre Cornette, Pierre Franc- cois Lavall’ee, Rémi Lacroix, Samyam Rajbhan- dari, Sanchit Gandhi, Shaden Smith, Stéphane Re- quena, Suraj Patil, Tim Dettmers, Ahmed Baruwa, Amanpreet Singh, Anastasia Cheveleva, Anne-Laure Ligozat, Arjun Subramonian, Aur’elie N’ev’eol, Charles Lovering, Daniel H Garrette, Deepak R. Tunuguntla, Ehud Reiter, Ekaterina Taktasheva, Eka- terina Voloshina, Eli Bogdanov, Genta Indra Winata, Hailey Schoelkopf, Jan-Christoph Kalo, Jekate-
<!-- page 22 of 64 -->

Rico Sennrich, Barry Haddow, and Alexandra Birch.

2016. Neural machine translation of rare words with subword units. In Proceedings of the 54th Annual Meeting of the Association for Computational Lin- guistics (Volume 1: Long Papers), pages 1715–1725, Berlin, Germany. Association for Computational Lin- guistics.

Preethi Seshadri, Sameer Singh, and Yanai Elazar. 2023.

The bias amplification paradox in text-to-image gen- eration. arXiv preprint arXiv:2308.00755.

Noam Shazeer. 2020. GLU variants improve trans- former.

Elizabeth Donoway, Ellie Pavlick, Emanuele Rodolà, Emma Lam, Eric Chu, Eric Tang, Erkut Erdem, Ernie Chang, Ethan A Chi, Ethan Dyer, Ethan Jerzak, Ethan Kim, Eunice Engefu Manyasi, Evgenii Zheltonozh- skii, Fanyue Xia, Fatemeh Siar, Fernando Martínez- Plumed, Francesca Happé, Francois Chollet, Frieda Rong, Gaurav Mishra, Genta Indra Winata, Gerard de Melo, Germán Kruszewski, Giambattista Parascan- dolo, Giorgio Mariani, Gloria Xinyue Wang, Gonzalo Jaimovitch-Lopez, Gregor Betz, Guy Gur-Ari, Hana Galijasevic, Hannah Kim, Hannah Rashkin, Han- naneh Hajishirzi, Harsh Mehta, Hayden Bogar, Henry Francis Anthony Shevlin, Hinrich Schuetze, Hiromu Yakura, Hongming Zhang, Hugh Mee Wong, Ian Ng,

Daria Soboleva, Faisal Al-Khateeb, Robert Myers, Ja-

cob R Steeves, Joel Hestness, and Nolan Dey. 2023. SlimPajama: A 627B token cleaned and deduplicated version of RedPajama.

Luca Soldaini and Kyle Lo. 2023. peS2o (Pretraining

Efficiently on S2ORC) Dataset. https://github. com/allenai/peS2o.

Aarohi Srivastava, Abhinav Rastogi, Abhishek Rao,

Isaac Noble, Jaap Jumelet, Jack Geissinger, Jackson Kernion, Jacob Hilton, Jaehoon Lee, Jaime Fernán- dez Fisac, James B Simon, James Koppel, James Zheng, James Zou, Jan Kocon, Jana Thompson, Janelle Wingfield, Jared Kaplan, Jarema Radom, Jascha Sohl-Dickstein, Jason Phang, Jason Wei, Ja- son Yosinski, Jekaterina Novikova, Jelle Bosscher, Jennifer Marsh, Jeremy Kim, Jeroen Taal, Jesse En- gel, Jesujoba Alabi, Jiacheng Xu, Jiaming Song, Jil- lian Tang, Joan Waweru, John Burden, John Miller, John U. Balis, Jonathan Batchelder, Jonathan Be- rant, Jörg Frohberg, Jos Rozen, Jose Hernandez- Orallo, Joseph Boudeman, Joseph Guerr, Joseph Jones, Joshua B. Tenenbaum, Joshua S. Rule, Joyce Chua, Kamil Kanclerz, Karen Livescu, Karl Krauth, Karthik Gopalakrishnan, Katerina Ignatyeva, Katja Markert, Kaustubh Dhole, Kevin Gimpel, Kevin Omondi, Kory Wallace Mathewson, Kristen Chia- fullo, Ksenia Shkaruta, Kumar Shridhar, Kyle Mc- Donell, Kyle Richardson, Laria Reynolds, Leo Gao, Li Zhang, Liam Dugan, Lianhui Qin, Lidia Contreras- Ochando, Louis-Philippe Morency, Luca Moschella, Lucas Lam, Lucy Noble, Ludwig Schmidt, Luheng He, Luis Oliveros-Colón, Luke Metz, Lütfi Kerem Senel, Maarten Bosma, Maarten Sap, Maartje Ter Hoeve, Maheen Farooqi, Manaal Faruqui, Mantas Mazeika, Marco Baturan, Marco Marelli, Marco Maru, Maria Jose Ramirez-Quintana, Marie Tolkiehn, Mario Giulianelli, Martha Lewis, Martin Potthast, Matthew L Leavitt, Matthias Hagen, Mátyás Schu- bert, Medina Orduna Baitemirova, Melody Arnaud, Melvin McElrath, Michael Andrew Yee, Michael Co- hen, Michael Gu, Michael Ivanitskiy, Michael Star- ritt, Michael Strube, Michał Sw˛edrowski, Michele Bevilacqua, Michihiro Yasunaga, Mihir Kale, Mike Cain, Mimee Xu, Mirac Suzgun, Mitch Walker, Mo Tiwari, Mohit Bansal, Moin Aminnaseri, Mor Geva, Mozhdeh Gheini, Mukund Varma T, Nanyun Peng, Nathan Andrew Chi, Nayeon Lee, Neta Gur- Ari Krakover, Nicholas Cameron, Nicholas Roberts, Nick Doiron, Nicole Martinez, Nikita Nangia, Niklas Deckers, Niklas Muennighoff, Nitish Shirish Keskar, Niveditha S. Iyer, Noah Constant, Noah Fiedel, Nuan Wen, Oliver Zhang, Omar Agha, Omar El- baghdadi, Omer Levy, Owain Evans, Pablo Anto- nio Moreno Casares, Parth Doshi, Pascale Fung, Paul Pu Liang, Paul Vicol, Pegah Alipoormolabashi, Peiyuan Liao, Percy Liang, Peter W Chang, Pe- ter Eckersley, Phu Mon Htut, Pinyu Hwang, Piotr Miłkowski, Piyush Patil, Pouya Pezeshkpour, Priti

Abu Awal Md Shoeb, Abubakar Abid, Adam Fisch, Adam R. Brown, Adam Santoro, Aditya Gupta, Adrià Garriga-Alonso, Agnieszka Kluska, Aitor Lewkowycz, Akshat Agarwal, Alethea Power, Alex Ray, Alex Warstadt, Alexander W. Kocurek, Ali Safaya, Ali Tazarv, Alice Xiang, Alicia Parrish, Allen Nie, Aman Hussain, Amanda Askell, Amanda Dsouza, Ambrose Slone, Ameet Rahane, Anan- tharaman S. Iyer, Anders Johan Andreassen, An- drea Madotto, Andrea Santilli, Andreas Stuhlmüller, Andrew M. Dai, Andrew La, Andrew Lampinen, Andy Zou, Angela Jiang, Angelica Chen, Anh Vuong, Animesh Gupta, Anna Gottardi, Antonio Norelli, Anu Venkatesh, Arash Gholamidavoodi, Arfa Tabassum, Arul Menezes, Arun Kirubara- jan, Asher Mullokandov, Ashish Sabharwal, Austin Herrick, Avia Efrat, Aykut Erdem, Ayla Karaka¸s, B. Ryan Roberts, Bao Sheng Loe, Barret Zoph, Bartłomiej Bojanowski, Batuhan Özyurt, Behnam Hedayatnia, Behnam Neyshabur, Benjamin Inden, Benno Stein, Berk Ekmekci, Bill Yuchen Lin, Blake Howald, Bryan Orinion, Cameron Diao, Cameron Dour, Catherine Stinson, Cedrick Argueta, Cesar Ferri, Chandan Singh, Charles Rathkopf, Chenlin Meng, Chitta Baral, Chiyu Wu, Chris Callison- Burch, Christopher Waites, Christian Voigt, Christo- pher D Manning, Christopher Potts, Cindy Ramirez, Clara E. Rivera, Clemencia Siro, Colin Raffel, Court- ney Ashcraft, Cristina Garbacea, Damien Sileo, Dan Garrette, Dan Hendrycks, Dan Kilman, Dan Roth, C. Daniel Freeman, Daniel Khashabi, Daniel Levy, Daniel Moseguí González, Danielle Perszyk, Danny Hernandez, Danqi Chen, Daphne Ippolito, Dar Gilboa, David Dohan, David Drakard, David Jurgens, Debajyoti Datta, Deep Ganguli, Denis Emelin, De- nis Kleyko, Deniz Yuret, Derek Chen, Derek Tam, Dieuwke Hupkes, Diganta Misra, Dilyar Buzan, Dim- itri Coelho Mollo, Diyi Yang, Dong-Ho Lee, Dy- lan Schrader, Ekaterina Shutova, Ekin Dogus Cubuk, Elad Segal, Eleanor Hagerman, Elizabeth Barnes,
<!-- page 23 of 64 -->

Roberts, Maarten Bosma, Vincent Zhao, Yanqi Zhou, Chung-Ching Chang, Igor Krivokon, Will Rusch, Marc Pickett, Pranesh Srinivasan, Laichee Man, Kath- leen Meier-Hellstern, Meredith Ringel Morris, Tulsee Doshi, Renelito Delos Santos, Toju Duke, Johnny So- raker, Ben Zevenbergen, Vinodkumar Prabhakaran, Mark Diaz, Ben Hutchinson, Kristen Olson, Ale- jandra Molina, Erin Hoffman-John, Josh Lee, Lora Aroyo, Ravi Rajakumar, Alena Butryna, Matthew Lamm, Viktoriya Kuzmina, Joe Fenton, Aaron Co- hen, Rachel Bernstein, Ray Kurzweil, Blaise Aguera- Arcas, Claire Cui, Marian Croak, Ed Chi, and Quoc Le. 2022. LaMDA: Language models for dialog ap- plications. arXiv [cs.CL].

Kushal Tirumala, Daniel Simig, Armen Aghajanyan,

and Ari S. Morcos. 2023. D4: Improving llm pretrain- ing via document de-duplication and diversification. ArXiv, abs/2308.12284.

Together Computer. 2023a. Redpajama-data-1t.

Together Computer. 2023b. Redpajama-data-v2.

Together Computer. 2023c. Redpajama-incite-base-3b-

v1.

Yury Tokpanov, Beren Millidge, Paolo Glorioso,

Jonathan Pilault, Adam Ibrahim, James Whittington, and Quentin Anthony. 2024. Zyda: A 1.3t dataset for open language modeling.

Hugo Touvron, Thibaut Lavril, Gautier Izacard, Xavier

Martinet, Marie-Anne Lachaux, Timothée Lacroix, Baptiste Rozière, Naman Goyal, Eric Hambro, Faisal Azhar, Aurelien Rodriguez, Armand Joulin, Edouard Grave, and Guillaume Lample. 2023a. Llama: Open and efficient foundation language models. ArXiv, abs/2302.13971.

Hugo Touvron, Louis Martin, Kevin R. Stone, Peter

Oli, Qiaozhu Mei, Qing Lyu, Qinlang Chen, Rabin Banjade, Rachel Etta Rudolph, Raefer Gabriel, Rahel Habacker, Ramon Risco, Raphaël Millière, Rhythm Garg, Richard Barnes, Rif A. Saurous, Riku Arakawa, Robbe Raymaekers, Robert Frank, Rohan Sikand, Ro- man Novak, Roman Sitelew, Ronan Le Bras, Rosanne Liu, Rowan Jacobs, Rui Zhang, Russ Salakhutdinov, Ryan Andrew Chi, Seungjae Ryan Lee, Ryan Stovall, Ryan Teehan, Rylan Yang, Sahib Singh, Saif M. Mo- hammad, Sajant Anand, Sam Dillavou, Sam Shleifer, Sam Wiseman, Samuel Gruetter, Samuel R. Bow- man, Samuel Stern Schoenholz, Sanghyun Han, San- jeev Kwatra, Sarah A. Rous, Sarik Ghazarian, Sayan Ghosh, Sean Casey, Sebastian Bischoff, Sebastian Gehrmann, Sebastian Schuster, Sepideh Sadeghi, Shadi Hamdan, Sharon Zhou, Shashank Srivastava, Sherry Shi, Shikhar Singh, Shima Asaadi, Shixi- ang Shane Gu, Shubh Pachchigar, Shubham Tosh- niwal, Shyam Upadhyay, Shyamolima Shammie Debnath, Siamak Shakeri, Simon Thormeyer, Si- mone Melzi, Siva Reddy, Sneha Priscilla Makini, Soo-Hwan Lee, Spencer Torene, Sriharsha Hatwar, Stanislas Dehaene, Stefan Divic, Stefano Ermon, Stella Biderman, Stephanie Lin, Stephen Prasad, Steven Piantadosi, Stuart Shieber, Summer Mish- erghi, Svetlana Kiritchenko, Swaroop Mishra, Tal Linzen, Tal Schuster, Tao Li, Tao Yu, Tariq Ali, Tatsunori Hashimoto, Te-Lin Wu, Théo Desbor- des, Theodore Rothschild, Thomas Phan, Tianle Wang, Tiberius Nkinyili, Timo Schick, Timofei Ko- rnev, Titus Tunduny, Tobias Gerstenberg, Trenton Chang, Trishala Neeraj, Tushar Khot, Tyler Shultz, Uri Shaham, Vedant Misra, Vera Demberg, Victo- ria Nyamai, Vikas Raunak, Vinay Venkatesh Ra- masesh, vinay uday prabhu, Vishakh Padmakumar, Vivek Srikumar, William Fedus, William Saunders, William Zhang, Wout Vossen, Xiang Ren, Xiaoyu Tong, Xinran Zhao, Xinyi Wu, Xudong Shen, Yadol- lah Yaghoobzadeh, Yair Lakretz, Yangqiu Song, Yasaman Bahri, Yejin Choi, Yichi Yang, Yiding Hao, Yifu Chen, Yonatan Belinkov, Yu Hou, Yufang Hou, Yuntao Bai, Zachary Seid, Zhuoye Zhao, Zijian Wang,

Zijie J. Wang, Zirui Wang, and Ziyi Wu. 2023. Be- yond the imitation game: Quantifying and extrapolat- ing the capabilities of language models. Transactions on Machine Learning Research.

Nishant Subramani, Sasha Luccioni, Jesse Dodge, and

Margaret Mitchell. 2023. Detecting personal informa- tion in training corpora: an analysis. In Proceedings of the 3rd Workshop on Trustworthy Natural Lan- guage Processing (TrustNLP 2023), pages 208–220, Toronto, Canada. Association for Computational Lin- guistics.

Technomancers.ai. 2023. Japan goes all in: Copyright

doesn’t apply to AI training. Accessed: 2024-2-15.

Romal Thoppilan, Daniel De Freitas, Jamie Hall,

Albert, Amjad Almahairi, Yasmine Babaei, Niko- lay Bashlykov, Soumya Batra, Prajjwal Bhargava, Shruti Bhosale, Daniel M. Bikel, Lukas Blecher, Cris- tian Canton Ferrer, Moya Chen, Guillem Cucurull, David Esiobu, Jude Fernandes, Jeremy Fu, Wenyin Fu, Brian Fuller, Cynthia Gao, Vedanuj Goswami, Naman Goyal, Anthony S. Hartshorn, Saghar Hos- seini, Rui Hou, Hakan Inan, Marcin Kardas, Viktor Kerkez, Madian Khabsa, Isabel M. Kloumann, A. V. Korenev, Punit Singh Koura, Marie-Anne Lachaux, Thibaut Lavril, Jenya Lee, Diana Liskovich, Yinghai Lu, Yuning Mao, Xavier Martinet, Todor Mihaylov, Pushkar Mishra, Igor Molybog, Yixin Nie, Andrew Poulton, Jeremy Reizenstein, Rashi Rungta, Kalyan Saladi, Alan Schelten, Ruan Silva, Eric Michael Smith, R. Subramanian, Xia Tan, Binh Tang, Ross Taylor, Adina Williams, Jian Xiang Kuan, Puxin Xu, Zhengxu Yan, Iliyan Zarov, Yuchen Zhang, An- gela Fan, Melanie Kambadur, Sharan Narang, Aure- lien Rodriguez, Robert Stojnic, Sergey Edunov, and Thomas Scialom. 2023b. Llama 2: Open foundation and fine-tuned chat models. ArXiv, abs/2307.09288.

Bertie Vidgen and Leon Derczynski. 2020. Directions

in abusive language training data, a systematic review: Garbage in, garbage out. PloS one, 15(12):e0243300.

Noam Shazeer, Apoorv Kulshreshtha, Heng-Tze Cheng, Alicia Jin, Taylor Bos, Leslie Baker, Yu Du, Yaguang Li, Hongrae Lee, Huaixiu Steven Zheng, Amin Ghafouri, Marcelo Menegali, Yanping Huang, Maxim Krikun, Dmitry Lepikhin, James Qin, De- hao Chen, Yuanzhong Xu, Zhifeng Chen, Adam
<!-- page 24 of 64 -->

Eric Wallace, Tony Zhao, Shi Feng, and Sameer Singh.

Computational Linguistics: Human Language Tech- nologies, pages 2390–2397, Online. Association for Computational Linguistics.

Linting Xue, Noah Constant, Adam Roberts, Mihir Kale,

2021. Concealed data poisoning attacks on NLP models. In Proceedings of the 2021 Conference of the North American Chapter of the Association for Computational Linguistics: Human Language Tech- nologies, pages 139–150, Online. Association for Computational Linguistics.

Rami Al-Rfou, Aditya Siddhant, Aditya Barua, and Colin Raffel. 2020. mT5: A massively multilingual pre-trained text-to-text transformer. arXiv [cs.CL].

Alex Wang, Yada Pruksachatkun, Nikita Nangia, Aman-

Shuo Yang, Wei-Lin Chiang, Lianmin Zheng, Joseph E.

Gonzalez, and Ion Stoica. 2023. Rethinking bench- mark and contamination for language models with rephrased samples. ArXiv, abs/2311.04850.

preet Singh, Julian Michael, Felix Hill, Omer Levy, and Samuel Bowman. 2019. Superglue: A stickier benchmark for general-purpose language understand- ing systems. Advances in neural information process- ing systems, 32.

Yelp. 2013. Detect secrets. https://github.com/ Yelp/detect-secrets. V1.4.0.

Alex Wang, Amanpreet Singh, Julian Michael, Felix

Savvas Zannettou, Barry Bradlyn, Emiliano De Cristo-

Hill, Omer Levy, and Samuel Bowman. 2018. GLUE: A multi-task benchmark and analysis platform for nat- ural language understanding. In Proceedings of the 2018 EMNLP Workshop BlackboxNLP: Analyzing and Interpreting Neural Networks for NLP, pages 353–355, Brussels, Belgium. Association for Compu- tational Linguistics.

faro, Haewoon Kwak, Michael Sirivianos, Gianluca Stringini, and Jeremy Blackburn. 2018. What is gab: A bastion of free speech or an alt-right echo chamber. In Companion Proceedings of the The Web Confer- ence 2018, WWW ’18, page 1007–1014, Republic and Canton of Geneva, CHE. International World Wide Web Conferences Steering Committee.

Rowan Zellers, Ari Holtzman, Yonatan Bisk, Ali

Ben Wang and Aran Komatsuzaki. 2021. GPT-J- 6B: A 6 Billion Parameter Autoregressive Lan- guage Model. https://stability.ai/news/ introducing-stable-lm-2.

Johannes Welbl, Amelia Glaese, Jonathan Uesato,

Farhadi, and Yejin Choi. 2019. Hellaswag: Can a machine really finish your sentence? In Proceedings of the 57th Annual Meeting of the Association for Computational Linguistics.

Ge Zhang, Scott Qu, Jiaheng Liu, Chenchen Zhang,

Sumanth Dathathri, John Mellor, Lisa Anne Hen- dricks, Kirsty Anderson, Pushmeet Kohli, Ben Cop- pin, and Po-Sen Huang. 2021. Challenges in detox- ifying language models. In Findings of the Associ- ation for Computational Linguistics: EMNLP 2021, pages 2447–2469, Punta Cana, Dominican Republic. Association for Computational Linguistics.

Johannes Welbl, Nelson F Liu, and Matt Gardner. 2017.

Crowdsourcing multiple choice science questions. arXiv [cs.HC].

Tim Weninger, Xihao Avi Zhu, and Jiawei Han. 2013.

An exploration of discussion threads in social news sites. In Proceedings of the 2013 IEEE/ACM Inter- national Conference on Advances in Social Networks Analysis and Mining, New York, NY, USA. ACM.

Chenghua Lin, Chou Leuang Yu, Danny Pan, Es- ther Cheng, Jie Liu, Qunshu Lin, Raven Yuan, Tuney Zheng, Wei Pang, Xinrun Du, Yiming Liang, Yinghao Ma, Yizhi Li, Ziyang Ma, Bill Lin, Emmanouil Bene- tos, Huan Yang, Junting Zhou, Kaijing Ma, Minghao Liu, Morry Niu, Noah Wang, Quehry Que, Ruibo Liu, Sine Liu, Shawn Guo, Soren Gao, Wangchunshu Zhou, Xinyue Zhang, Yizhi Zhou, Yubo Wang, Yuelin Bai, Yuhan Zhang, Yuxiang Zhang, Zenith Wang, Zhenzhu Yang, Zijian Zhao, Jiajun Zhang, Wanli Ouyang, Wenhao Huang, and Wenhu Chen. 2024. Map-neo: Highly capable and transparent bilingual large language model series. arXiv preprint arXiv: 2405.19327.

Guillaume Wenzek, Marie-Anne Lachaux, Alexis Con-

Hao Zhang. 2022. Language model decomposition:

Quantifying the dependency and correlation of lan- guage models. In Proceedings of the 2022 Confer- ence on Empirical Methods in Natural Language Pro- cessing, pages 2508–2517, Abu Dhabi, United Arab Emirates. Association for Computational Linguistics.

neau, Vishrav Chaudhary, Francisco Guzmán, Ar- mand Joulin, and Edouard Grave. 2020. CCNet: Extracting high quality monolingual datasets from web crawl data. In Proceedings of the Twelfth Lan- guage Resources and Evaluation Conference, pages 4003–4012, Marseille, France. European Language Resources Association.

Terry Yue Zhuo, Armel Zebaze, Nitchakarn Suppat-

Jason Weston, Antoine Bordes, Sumit Chopra, and

tarachai, Leandro von Werra, Harm de Vries, Qian Liu, and Niklas Muennighoff. 2024. Astraios: Parameter-efficient instruction tuning code large lan- guage models. arXiv preprint arXiv:2401.00788.

Tomas Mikolov. 2015. Towards ai-complete ques- tion answering: A set of prerequisite toy tasks. arXiv: Artificial Intelligence.

Albert Xu, Eshaan Pathak, Eric Wallace, Suchin Guru-

A Acknowledgements

rangan, Maarten Sap, and Dan Klein. 2021. Detoxi- fying language models risks marginalizing minority voices. In Proceedings of the 2021 Conference of the North American Chapter of the Association for

Dolma would not have been possible without the support of many individuals and institutions. The experimental components of this work were made possible through
<!-- page 25 of 64 -->

and decontamination. Russell Authur wrote a toolkit for acquisition and storage of Common Crawl data.

Contributors to source-agnostic data processing in- clude Khyathi Chandu, Yanai Elazar, Rodney Kinney, Kyle Lo, Xinxi Lyu, Ian Magnusson, Aakanksha Naik, Abhilasha Ravichander, Zejiang Shen, and Luca Sol- daini. Khyathi Chandu, and Aakanksha Naik developed the toxic text filter. Kyle Lo, and Xinxi Lyu helped eval- uate it. Luca Soldaini developed the language filtering approach. Rodney Kinney, Zejiang Shen, and Luca Sol- daini developed the “quality” filter. Yanai Elazar identi- fied repeating n-gram sequences. Abhilasha Ravichan- der, Kyle Lo, and Luca Soldaini developed the PII filter. Jesse Dodge and Ian Magnusson developed the evalua- tion set decontamination approach.

Contributors to ablation experiments include Iz Belt- agy, Akshita Bhagia, Jesse Dodge, Dirk Groeneveld, Rodney Kinney, Kyle Lo, Ian Magnusson, Matthew Peters, Kyle Richardson, Dustin Schwenk, Luca Sol- daini, Nishant Subramani, Oyvind Tafjord, and Pete Walsh. This work included designing and prioritizing experiments given compute constraints, implementing and running the 1B model experiments, and interpret- ing results. In particular, Oyvind Tafjord’s work on the evaluation toolkit and Pete Walsh’s work on the model implementation were critical.

a partnership with AMD and CSC, enabling use of the LUMI supercomputer. We thank Jonathan Frankle, Cody Blakeney, Matthew Leavitt and Daniel King and the rest of the MosaicML team for sharing findings from experiments on preliminary versions of our data. We thank Vitaliy Chiley for messaging us on Twitter with a suggestion for resolving a random number generator bug that was affecting our data shuffling. We thank Er- fan Al-Hossami, Shayne Longpre, and Gregory Yauney for sharing findings from their own large-scale pretrain- ing data experiments. We thank Ce Zhang and Maurice Weber of Together AI for thoughtful discussion on open datasets and data distribution format. We thank Stella Biderman and Aviya Skowron for discussions around data licensing and data processing framework. We thank our teammates at AI2 Nicole DeCario, Matt Latzke, Dar- rell Plessas, Kelsey MacMillan, Carissa Schoenick, Sam Skjonsberg, and Michael Schmitz for their help with the website, design, internal and external communications, budgeting, and other activities that supported smooth progress on this project. Finally, we also express grati- tude for the helpful discussions and feedback from our teammates at AI2 and close collaborators, including Prithviraj (Raj) Ammanabrolu, Maria Antoniak, Chris Callison-Burch, Peter Clark, Pradeep Dasigi, Nicole De- Cario, Doug Downey, Ali Farhadi, Suchin Gururangan, Sydney Levine, Maarten Sap, Ludwig Schmidt, Will Smith, Yulia Tsvetkov, and Daniel S. Weld.

B Author Contributions

Dolma would not be possible without the help of our many teammates and collaborators. Weekly project meetings, messaging apps and documentation were accessible for anyone at AI2. Major decisions about Dolma were often made in these channels, with excep- tion for certain topics (e.g., legal, funding). While many were involved in the Dolma effort (see Acknowledge- ments §A), the authors of this paper were those who owned and delivered a critical piece of the puzzle. We detail their contributions below (authors in alphabetical order):

Contributors to posthoc experiments and analysis on the final Dolma artifacts. Ben Bogin led the probing experiments on 1B model weights to assess impact of differing code mixtures with support from Kyle Lo and Niklas Muennighoff. Yanai Elazar ran the data analysis tool to summarize and document Dolma’s composition. Valentin Hofmann led the tokenization fertility analysis with support from Kyle Lo. Ananya Harsh Jha and Ian Magnusson performed experiments training and evalu- ating baseline 1B models on other open datasets with support from Luca Soldaini. Sachin Kumar and Jacob Morrison performed analysis of systematic issues in our choice of language identification and toxicity classi- fiers with support from Kyle Lo. Niklas Muennighoff led analysis of correlation between different filters em- ployed on Common Crawl data with support from Kyle Lo and Luca Soldaini.

Contributors to data acquisition and source-specific data processing include Akshita Bhagia, Dirk Groen- eveld, Rodney Kinney, Kyle Lo, Dustin Schwenk, and Luca Soldaini. Everyone contributed to literature review on available sources and best practices and decisions around sources to pursue. Akshita Bhagia, Rodney Kin- ney, Dustin Schwenk, and Luca Soldaini handled the bulk of data acquisition and processing and ablation experiments with 1B models for source-specific design decisions. Kyle Lo and Luca Soldaini handled discus- sions with legal to inform our choice of sources.

Contributors to licensing and release policy include David Atkinson, Jesse Dodge, Jennifer Dumas, Nathan Lambert, Kyle Lo, Crystal Nam, and Luca Soldaini. David Atkinson, Jesse Dodge, Jennifer Dumas, and Crystal Nam led the bulk of this, including research into data licenses, risk-level determination for pretraining data, and defining the release policy. Kyle Lo and Luca Soldaini provided feedback throughout this process and handled technical details needed for the release. Nathan Lambert provided feedback on release process and han- dled the actual release strategy, particularly around ex- ternal communication.

All of the contributors above helped with documen- tation and writing of their respective components. In particular, Li Lucy provided an extensive literature re- view of language models, open corpora and pretraining

Contributors to infrastructure and tooling include Russell Authur, Dirk Groeneveld, Rodney Kinney, Kyle Lo, and Luca Soldaini. Rodney Kinney, Kyle Lo, and Luca Soldaini designed and implemented the shared toolkit used for processing our corpus at scale. Dirk Groeneveld wrote the Bloom filter for deduplication

### 第 25 页中文译文

……以及去污染。Russell Authur 编写了用于获取与存储 Common Crawl 数据的工具包。

与来源无关的数据处理贡献者包括 Khyathi Chandu、Yanai Elazar、Rodney Kinney、Kyle Lo、Xinxi Lyu、Ian Magnusson、Aakanksha Naik、Abhilasha Ravichander、Zejiang Shen 和 Luca Soldaini。Khyathi Chandu 与 Aakanksha Naik 开发有毒文本过滤器，Kyle Lo 与 Xinxi Lyu 协助评估。Luca Soldaini 开发语言过滤方法。Rodney Kinney、Zejiang Shen 与 Luca Soldaini 开发“质量”过滤器。Yanai Elazar 识别重复 n-gram 序列。Abhilasha Ravichander、Kyle Lo 与 Luca Soldaini 开发 PII 过滤器。Jesse Dodge 与 Ian Magnusson 开发评测集去污染方法。

消融实验贡献者包括 Iz Beltagy、Akshita Bhagia、Jesse Dodge、Dirk Groeneveld、Rodney Kinney、Kyle Lo、Ian Magnusson、Matthew Peters、Kyle Richardson、Dustin Schwenk、Luca Soldaini、Nishant Subramani、Oyvind Tafjord 和 Pete Walsh。工作包括在算力约束下设计实验并确定优先级、实现和运行 10 亿参数模型实验，以及解释结果。Oyvind Tafjord 的评测工具包和 Pete Walsh 的模型实现尤其关键。

我们感谢与 AMD 和 CSC 的合作，使项目得以使用 LUMI 超级计算机。感谢 Jonathan Frankle、Cody Blakeney、Matthew Leavitt、Daniel King 及 MosaicML 团队分享初版数据实验发现；感谢 Vitaliy Chiley 在 Twitter 上建议修复影响数据洗牌的随机数生成器缺陷；感谢 Erfan Al-Hossami、Shayne Longpre 和 Gregory Yauney 分享其大规模预训练数据实验；感谢 Together AI 的 Ce Zhang 与 Maurice Weber 就开放数据集及分发格式展开讨论；感谢 Stella Biderman 与 Aviya Skowron 就数据许可和处理框架进行讨论；感谢 AI2 同事 Nicole DeCario、Matt Latzke、Darrell Plessas、Kelsey MacMillan、Carissa Schoenick、Sam Skjonsberg 与 Michael Schmitz 在网站、设计、内外沟通、预算及其他项目支持方面提供帮助。末尾，感谢 AI2 同事及密切合作者 Prithviraj Ammanabrolu、Maria Antoniak、Chris Callison-Burch、Peter Clark、Pradeep Dasigi、Nicole DeCario、Doug Downey、Ali Farhadi、Suchin Gururangan、Sydney Levine、Maarten Sap、Ludwig Schmidt、Will Smith、Yulia Tsvetkov 与 Daniel S. Weld 的讨论和反馈。

## B 作者贡献

没有众多同事和合作者的帮助，Dolma 不可能完成。AI2 任何成员都能参加每周项目会议、访问消息应用与文档。Dolma 的重大决定通常在这些渠道作出，少数主题（如法律、资金）除外。尽管很多人参与了 Dolma（见致谢 §A），本文作者是负责并交付关键组成部分的人。贡献如下，作者按字母顺序排列。

**最终 Dolma 成果的事后实验与分析。** Ben Bogin 在 Kyle Lo、Niklas Muennighoff 支持下牵头探测 10 亿参数模型权重，以评估不同代码混合的影响。Yanai Elazar 运行数据分析工具，总结并记录 Dolma 构成。Valentin Hofmann 在 Kyle Lo 支持下牵头分词生育度分析。Ananya Harsh Jha 与 Ian Magnusson 在 Luca Soldaini 支持下训练并评估其他开放数据集上的 10 亿参数基线。Sachin Kumar 与 Jacob Morrison 在 Kyle Lo 支持下分析语言识别和毒性分类器选择中的系统性问题。Niklas Muennighoff 在 Kyle Lo 与 Luca Soldaini 支持下分析 Common Crawl 各过滤器的相关性。

**数据获取和来源专用处理。** 贡献者包括 Akshita Bhagia、Dirk Groeneveld、Rodney Kinney、Kyle Lo、Dustin Schwenk 与 Luca Soldaini。所有人都参与可用来源、最佳实践及来源选择的文献调研。Akshita Bhagia、Rodney Kinney、Dustin Schwenk 与 Luca Soldaini 承担大部分数据获取、处理及来源设计的 10 亿参数消融实验。Kyle Lo 与 Luca Soldaini 负责同法务讨论来源选择。

**许可和发布政策。** 贡献者包括 David Atkinson、Jesse Dodge、Jennifer Dumas、Nathan Lambert、Kyle Lo、Crystal Nam 与 Luca Soldaini。David Atkinson、Jesse Dodge、Jennifer Dumas 和 Crystal Nam 负责主要工作，包括调研数据许可、确定预训练数据风险等级并制定发布政策。Kyle Lo 与 Luca Soldaini 全程反馈并处理发布所需技术细节。Nathan Lambert 就发布流程提供反馈并负责实际发布策略，尤其是外部沟通。

以上贡献者都参与各自部分的文档和写作。Li Lucy 尤其提供了关于语言模型、开放语料库和预训练语料创建实践的大量文献综述。

**基础设施与工具。** 贡献者包括 Russell Authur、Dirk Groeneveld、Rodney Kinney、Kyle Lo 与 Luca Soldaini。Rodney Kinney、Kyle Lo 和 Luca Soldaini 设计并实现大规模语料处理共享工具包。Dirk Groeneveld 编写用于去重的布隆过滤器。
<!-- page 26 of 64 -->

7. Deduplication. Reported as performed filtering, but without further details.

8. Decontamination. N/A.

corpus creation practices. Emma Strubell gave valu- able feedback on our manuscript. Nathan Lambert helped with feedback on the blog post and other forms of external-facing communication about Dolma.

Hannaneh Hajishirzi, Noah Smith, and Luke Zettle- moyer advised on the project, including broad strat- egy, writing, recruiting and providing resources. As OLMo project leads, Iz Beltagy, Jesse Dodge, and Dirk Groeneveld helped with visibility and coordination with other critical OLMo project workstreams. Notably, we credit Noah Smith for coming up with the name Dolma.

9. Other. Anil et al. (2023) report aggregated statis- tics of how often certain demographic identities are represented (or not) in the data. Such statis- tics include identities (e.g., American) or English pronouns. These were identified using tools such as KnowYourData or those available on Google- Cloud, but the manuscript lacks specifics necessary for reproduction.

C.2 GPT-4 (OpenAI, 2023)

Finally, Kyle Lo and Luca Soldaini led the overall Dolma project and were involved in all aspects, includ- ing project management, planning and design, discus- sions with legal and ethics committees, data and com- pute partnerships, infrastructure, tooling, implementa- tion, experiments, writing/documentation, etc.

OpenAI (2023) provides limited information on pre- training data used for GPT-4; we summarize what we could from gather from their manuscript’s Section 2, Ap- pendix C and D, footnotes 5, 6, 10 and 27, and Sections 1.1 and 3.1 in the System Card:

1. Corpus size. N/A

C (Lack of) details about pretraining data curation for both open and closed language models

2. Data provenance. N/A aside from reporting that (1) data was sourced from both the Internet as well as third-party providers, (2) data was sourced mainly before September 2021 with trace amounts of more recent data, and (3) they included GSM- 8K (Cobbe et al., 2021) as a tiny fraction of the total pretraining mix.

We provide a high-level overview of the pretraining data curation practices (or lack of reporting therof) of the largest, most performant language models (in no partic- ular order) to illustrate the need for clear documentation and transparency around dataset curation.

3. PII. N/A.

C.1 PaLM 2 (Anil et al., 2023)

4. Toxicity. Removed documents that violate their usage policies from pretraining, including “erotic content,” using a combination of lexicon-

Anil et al. (2023) provides limited information on pre- training data used for PaLM 2; we summarize what we could from gather from their manuscript’s Sections 3 and D1:

based heuristics and bespoke classifiers following Markov et al. (2023).

5. Language ID. N/A aside from reporting that the majority of pretraining data is in English.

1. Corpus size. Unreported other than it’s larger than what was used to train PaLM (Chowdhery et al., 2022)

6. Quality. N/A.

7. Deduplication. N/A.

2. Data provenance. Unreported other than they use web documents, books, code, mathematics, and conversational data.

3. PII. Reported as performed filtering, but without further details.

4. Toxicity. Toxic text identified using Perspective API but lacking details needed for reproduction (i.e., text unit, threshold). No details on removal. They did report tackling toxicity through the use of control tokens, but do not provide enough details on this method.

8. Decontamination. No discussion of decontami- nation procedures, but instead reported post-hoc statistics measuring extent of contamination on pro- fessional and academic exams, as well as several academic benchmarks. Method for identifying con- tamination based on exact substring match (after removing whitespaces) of a test example against a pretraining data example. They reported some contamination with BIG-Bench (Srivastava et al., 2023).

5. Language ID. Reports the most frequent lan- guages included as well as their frequencies. Lack- ing details needed for reproduction (i.e., text unit, tools used, threshold).

6. Quality. Reported as performed filtering, but with- out further details.

9. Other. There are myraid works performing “data archeology” on GPT-4 that is, attempting to glean information about the pretraining data used in GPT- 4 through probes for memorization. For example, Chang et al. (2023) show GPT-4 can generate se- quences from copyrighted books. We do not at- tempt to survey all of these investigative works.

### 第 26 页中文译文

7. **去重。** 报告称执行了过滤，但没有更多细节。

8. **去污染。** 不适用。

Emma Strubell 对论文提供宝贵反馈。Nathan Lambert 对博客文章及其他面向外部的 Dolma 沟通材料提供反馈。

Hannaneh Hajishirzi、Noah Smith 与 Luke Zettlemoyer 就项目总体策略、写作、招聘和资源提供建议。作为 OLMo 项目负责人，Iz Beltagy、Jesse Dodge 与 Dirk Groeneveld 帮助提高项目可见度，并协调 OLMo 其他关键工作流。Dolma 这一名称由 Noah Smith 提出。

9. **其他。** Anil 等人（2023）报告某些人口身份在数据中出现或未出现频率的汇总统计，包括身份词（如 American）和英语代词。这些身份通过 KnowYourData 或 Google Cloud 工具识别，但论文没有给出复现所需细节。

### C.2 GPT-4（OpenAI，2023）

OpenAI（2023）对 GPT-4 预训练数据披露有限；我们汇总了论文第 2 节、附录 C/D、脚注 5/6/10/27 以及系统卡第 1.1、3.1 节中能够收集的信息：

1. **语料规模。** 未提供。
2. **数据来源。** 除以下内容外未提供：（1）数据来自互联网和第三方供应商；（2）主要来自 2021 年 9 月以前，仅有极少量更近期数据；（3）GSM8K（Cobbe 等，2021）在总预训练混合中占极小比例。
3. **PII。** 未提供。
4. **毒性。** 结合词典启发式规则和遵循 Markov 等人（2023）的定制分类器，移除违反使用政策的预训练文档，包括“情色内容”。
5. **语言识别。** 除说明大部分预训练数据为英语外，未提供。
6. **质量。** 未提供。
7. **去重。** 未提供。
8. **去污染。** 未讨论去污染流程，；实际是报告事后统计，测量职业与学术考试及多个学术基准的污染程度。识别方法为：移除空白后，对测试样例与预训练样例进行精确子串匹配。报告发现 BIG-Bench（Srivastava 等，2023）存在部分污染。
9. **其他。** 许多工作对 GPT-4 进行“数据考古”，即通过记忆探针推断其预训练数据。例如 Chang 等人（2023）表明 GPT-4 能生成受版权保护书籍中的序列。本文不试图综述所有此类调查工作。

## C 开放与闭源语言模型预训练数据整理细节的（缺失）

为说明清晰记录与透明公开数据集整理过程的必要性，我们对规模最大、性能最强的一些语言模型的预训练数据整理实践（或缺乏报告的情况）作高层概览，顺序不分先后。

### C.1 PaLM 2（Anil 等，2023）

Anil 等人（2023）对 PaLM 2 预训练数据披露有限；以下为从论文第 3 节和 D1 节收集的信息：

1. **语料规模。** 除说明大于 PaLM（Chowdhery 等，2022）的训练语料外，未报告。
2. **数据来源。** 除说明使用网页文档、书籍、代码、数学和对话数据外，未报告。
3. **PII。** 报告执行过滤，但无更多细节。
4. **毒性。** 使用 Perspective API 识别有毒文本，但缺少复现所需细节（文本单元、阈值），也未说明删除方式。作者报告使用控制词元处理毒性，但没有提供足够方法细节。
5. **语言识别。** 报告最常见语言及频率，但缺少复现细节（文本单元、工具、阈值）。
6. **质量。** 报告执行过滤，但无更多细节。

末尾，Kyle Lo 与 Luca Soldaini 领导整个 Dolma 项目，参与项目管理、规划设计、与法律和伦理委员会沟通、数据和计算合作、基础设施、工具、实现、实验和写作记录等全部环节。
<!-- page 27 of 64 -->

C.3 Claude (Anthropic, 2023)

Unfortunately, we know next to nothing about the pre- training data used for Claude.

C.4 Llama 2 (Touvron et al., 2023b)

2. Data provenance. LLaMA used data with known provenance, including five shards of Common- Crawl between 2017 and 2020, C4 (Raffel et al., 2020), GitHub code from Google BigQuery pub- lic datasets (restricted to Apache, BSD and MIT licenses), Wikipedia dumps from June to August 2022, Project Gutenberg books, Books3 from The Pile (Gao et al., 2020), LaTeX files from arXiv, and StackExchange pages.

Touvron et al. (2023b) provides limited information on pretraining data used for Llama 2; we summarize what we could from gather from their manuscript’s Sections 2.1, 4.1, and A.6:

3. PII. N/A.

1. Corpus size. 2T tokens.

4. Toxicity. N/A. Reports evaluation on the RealTox- icityPrompts (Gehman et al., 2020) benchmark.

2. Data provenance. N/A aside from they avoided using Meta user data.

3. PII. Reported as excluded data from certain web- sites known to contain high volumes of PII, though what these sites are was not disclosed.

5. Language ID. Reports use of the CCNet li- brary (Wenzek et al., 2020), which employs Fast- Text (Joulin et al., 2016a) classifiers to remove non-English text (below a 0.5 threshold). No addi- tional language ID reported for C4, GitHub, Books, arXiv, and StackExchange sets. For Wikipedia, re- ported restriction of pages to those using Latin or Cyrillic scripts: bg, ca, cs, da, de, en, es, fr, hr, hu, it, nl, pl, pt, ro, ru, sl, sr, sv, uk.

4. Toxicity. Not explicitly discussed, but appears to not have performed toxicity filtering, opting instead to handle toxic text generation in a later training stage. They do report results from a post hoc analysis in which they used a Hate- BERT (Caselli et al., 2021) classifier finetuned on ToxiGen (Hartvigsen et al., 2022) to score each document line (and averaged to produce a document-level score).

6. Quality. Reports use of the CCNet li- brary (Wenzek et al., 2020) to remove low- quality content from CommonCrawl; CCNet uses KenLM (Heafield, 2011), an n-gram language model to score perplexity of text as a measure of similarity to Wikipedia text. They do not report their chosen threshold for filtering. They also re- port use of a linear model trained to classify pages as Wikipedia Reference-like or not. They also re- port light heuristic filtering of boilerplate content for GitHub and Wikipedia subsets.

5. Language ID. Not stated as used in pretraining data curation, but they provide a post hoc analysis of the pretraining dataset using FastText Language ID with a 0.5 threshold for detected language. We assume this is likely the same protocol they used for pretraining data curation as it is also seen in the CCNet library (Wenzek et al., 2020), which was used for Llama (Touvron et al., 2023a).

6. Quality. N/A.

7. Deduplication. N/A.

7. Deduplication. Reports use of the CCNet li- brary (Wenzek et al., 2020) to identify duplicated lines for Common Crawl texts, file-level exact match deduplication for GitHub code, and dedu- plicating books with over 90% for Gutenberg and Books3 subsets.

8. Decontamination. N/A.

8. Decontamination. They provide extensive report- ing on their deduplication method, which relies on a modified version of the ngram deduplication tool from Lee et al. (2022).

9. Mixture. The manuscript reports a mixture of 67% CommonCrawl, 15% C4, 4.5% GitHub, 4.5% Wikipedia, 4.5% Books, 2.5% arXiv, and 2.0% StackExchange. Model training was a single epoch over this mixture except for an upsampling of Wikipedia and Books (2 epochs).

9. Other. Reported upsampling certain sources, but without further details. They also report a similar analysis as in PaLM 2 (Anil et al., 2023) on ag- gregate statistics about demographic identities and English pronouns.

C.6 OPT (Zhang, 2022)

C.5 LLaMA (Touvron et al., 2023a)

From Zhang (2022)’s manuscript and provided datasheet (Gebru et al., 2021), we summarize the fol- lowing:

Touvron et al. (2023a) provides some information on pretraining data used for training LLaMA; we summa- rize what we could gather from their manuscript’s Sec- tion 2.1.

The OPT model was trained on 180B tokens from data sources with known provenance: the datasets used for RoBERTa (Liu et al., 2019), a subset of the Pile (Gao

1. Corpus size. 1.4T tokens.

### 第 27 页中文译文

### C.3 Claude（Anthropic，2023）

遗憾的是，我们几乎不了解 Claude 所用的预训练数据。

### C.4 Llama 2（Touvron 等，2023b）

Touvron 等人（2023b）对 Llama 2 预训练数据披露有限；以下汇总论文第 2.1、4.1 与 A.6 节中的信息：

1. **语料规模。** 2 万亿词元。
2. **数据来源。** 除说明避免使用 Meta 用户数据外，未提供。
3. **PII。** 报告排除了某些已知含大量 PII 的网站，但未披露网站名单。
4. **毒性。** 未明确讨论；似乎未在预训练阶段过滤毒性，而选择在后续训练阶段处理有毒生成。事后分析使用在 ToxiGen（Hartvigsen 等，2022）上微调的 HateBERT（Caselli 等，2021）为每一文档行评分，再平均为文档得分。
5. **语言识别。** 未说明用于预训练数据整理，但事后分析使用阈值 0.5 的 FastText 语言识别。我们推测这很可能也是预训练整理协议，因为 Llama 使用的 CCNet 库中也采用该做法。
6. **质量。** 未提供。
7. **去重。** 未提供。
8. **去污染。** 未提供。
9. **其他。** 报告对某些来源上采样，但无更多细节；也像 PaLM 2 一样分析人口身份与英语代词的汇总统计。

### C.5 LLaMA（Touvron 等，2023a）

Touvron 等人（2023a）提供了部分 LLaMA 预训练数据资料：

1. **语料规模。** 1.4 万亿词元。
2. **数据来源。** 来源已知，包括 2017–2020 年五个 Common Crawl 分片、C4、Google BigQuery 公共数据集中的 GitHub 代码（限 Apache、BSD、MIT 许可）、2022 年 6–8 月 Wikipedia 转储、Project Gutenberg、Pile 的 Books3、arXiv LaTeX 文件和 StackExchange 页面。
3. **PII。** 未提供。
4. **毒性。** 未提供；报告了 RealToxicityPrompts 基准结果。
5. **语言识别。** 使用 CCNet 的 FastText 分类器，以 0.5 阈值移除非英语文本。C4、GitHub、书籍、arXiv 与 StackExchange 未报告额外语言识别。Wikipedia 限定为使用拉丁或西里尔字母的指定语言：bg、ca、cs、da、de、en、es、fr、hr、hu、it、nl、pl、pt、ro、ru、sl、sr、sv、uk。
6. **质量。** 使用 CCNet 过滤 Common Crawl 低质量内容；CCNet 用 KenLM n-gram 模型按文本与 Wikipedia 的相似程度计算困惑度，但未报告过滤阈值。还使用线性模型判断页面是否类似 Wikipedia 参考文献，并对 GitHub 与 Wikipedia 样本进行轻度样板内容过滤。
7. **去重。** Common Crawl 用 CCNet 识别重复行；GitHub 代码做文件级精确匹配去重；Gutenberg 与 Books3 对相似度超过 90% 的书籍去重。
8. **去污染。** 详细报告基于 Lee 等人（2022）n-gram 去重工具修改版的方法。
9. **混合比例。** Common Crawl 67%、C4 15%、GitHub 4.5%、Wikipedia 4.5%、书籍 4.5%、arXiv 2.5%、StackExchange 2.0%。整体训练一轮，但 Wikipedia 与书籍上采样为两轮。

### C.6 OPT（Zhang，2022）

根据 Zhang（2022）的论文和数据说明表，OPT 使用来源已知的 1800 亿词元训练，包括 RoBERTa 数据、Pile 子集以及 Roller 等人（2021）处理的 Pushshift Reddit 数据集，并对这些来源作出若干显著改动。
<!-- page 28 of 64 -->

et al., 2020), and the Pushshift Reddit Dataset (Baum- gartner et al., 2020) as processed by (Roller et al., 2021). They made several notable changes to these sources:

• C4 (Raffel et al., 2020; Dodge et al., 2021): Standard contemporary LM pretraining corpus automatically filtered from the April 2019 Common Crawl scrape.

1. RoBERTa. Reports updated the CC-News collec- tion up to September 2021.

• mC4 (Xue et al., 2020); English subset: the English language portion of a pretraining corpus automati- cally filtered from 71 Common Crawl scrapes.

• Pile (Gao et al., 2020), validation set: widely-used language modeling pretraining corpus; contains doc- uments curated from multiple sources including sev- eral non-web sources.

2. Pile. Reports restricted to the following collections: CommonCrawl, DM Mathematics, Project Guten- berg, HackerNews, OpenSubtitles, OpenWebText2, USPTO and Wikipedia. (Zhang, 2022) report omis- sion of other Pile subsets due to gradient norm spikes at the 1B model scale.

• WikiText 103 (Merity et al., 2016): a standard col- lection of verified “Good” and “Featured” articles on Wikipedia.

3. Pushshift Reddit. Reports restricted to only the longest chain of comments in each thread; an oper- ation that reportedly reduced the dataset by 66%.

• Penn Tree Bank (Marcus et al., 1994): widely-used NLP corpus derived from Wall Street Journal articles.

• M2D2 (Reid et al., 2022), S2ORC subset: papers from Semantic Scholar (Lo et al., 2020) grouped by hierarchical academic field categories.

Also describes: (1) deduplication using Min- HashLSH (Rajaraman and Ullman, 2011) with a Jaccard similarity threshold of 0.95, and (2) language ID filter- ing to English-only text, though they do not describe the method used.

• M2D2 (Reid et al., 2022), Wiki subset: Wikipedia articles grouped by hierarchical categories in the Wikipedia ontology

They do not discuss whether they do (or do not) per- form any processing for PII, toxicity, quality, or de- contamination.

D Experimental Setup

• C4 100 domains (Chronopoulou et al., 2022): bal- anced samples of the top 100 domains in C4.

D.1 Ablation Setup

• Gab (Zannettou et al., 2018): data from 2016-2018 from an alt-right, free-speech-oriented social media platform that has been shown to contain more hate speech than mainstream platforms.

• ICE (Greenbaum, 1991): English from around the world curated by local experts, with subsets for Canada, East Africa, Hong Kong, India, Ireland, Ja- maica, Philippines, Singapore, and the USA.

• Twitter AAE (Blodgett et al., 2016): balanced sets of tweets labeled as African American or white-aligned English.

• Manosphere (Ribeiro et al., 2021): sample of 9 fo- rums where a set of related masculinist ideologies developed over the past decade.

For all data ablations described in this section, we train a 1B parameter model on up to 150B tokens. We follow model architecture and training from OLMo (Groen- eveld et al., 2024); we summarize key details here, but direct the reader to the manuscript for further details. Each model is an decoder-only transformer model with 16 layers, 16 attention heads, and 2048 dimensional- ity. We use ALiBi positional embeddings (Ofir Press et al., 2021), SwiGLU activation (Shazeer, 2020), and mixed precision; model context size is set to 2048 to- kens. We use EleutherAI’s GPT NeoX tokenizer (Black et al., 2022). The model is trained using the LionW opti- mizer (Chen et al., 2023a) with 1e-4 peak learning rate, warm-up of 2000 steps, cosine decay, and 1e-2 weight decay. Batch size was set to 1024. While we set our max number of steps to 95k (which is approximately 200B tokens), we conclude our experiments at 150B tokens.

• 4chan (Papasavva et al., 2020): data from 2016-2019 politics subsection of an anonymity-focused forum found shown to contain high rates of toxic content.

We also curated held-out sets from other open lan- guage model corpora to augment Paloma:

We use 64 AMD Instinct MI250X accelerators. Each MI250X accelerator contains two logical nodes; there- fore, from the point of view of our training code, our experiments ran on 128 compute units grouped in 16 nodes. Per each logical unit, we use a micro-batch size of 8. We implement our experiments using the anonymized codebase.

• Dolma (this work), uniform sample: A sample 8,358 documents from the Dolma corpus across all of its subsets (13 from books, 1,642 from Common Crawl web pages, 4,545 Reddit submissions, 450 scientific articles, 1,708 Wikipedia and Wikibooks entries).

D.2 Perplexity Evaluation Suite

For data ablations, we keep track of language model per- plexity using Paloma (Magnusson et al., 2023). Datasets included:

• RedPajama v1 (Together Computer, 2023b): 1 tril- lion tokens replication of the LLaMA 1 (Touvron et al., 2023a) pretraining corpus.

### 第 28 页中文译文

1. **RoBERTa。** 报告称将 CC-News 收集更新至 2021 年 9 月。
2. **Pile。** 仅采用 CommonCrawl、DM Mathematics、Project Gutenberg、HackerNews、OpenSubtitles、OpenWebText2、USPTO 和 Wikipedia。Zhang（2022）称，由于 10 亿参数模型规模下出现梯度范数尖峰，省略了其他 Pile 子集。
3. **Pushshift Reddit。** 每个主题串仅保留最长评论链，据报告使数据量减少 66%。

还描述了：（1）使用 MinHashLSH（Rajaraman 与 Ullman，2011）并设 Jaccard 相似度阈值 0.95 去重；（2）使用语言识别过滤器仅保留英语文本，但没有说明方法。论文没有讨论是否处理 PII、毒性、质量或去污染。

## D 实验设置

### D.1 消融设置

本节所有数据消融都训练一个 10 亿参数模型，最多使用 1500 亿词元。模型架构与训练遵循 OLMo（Groeneveld 等，2024）：仅解码器 Transformer，16 层、16 个注意力头、维度 2048；使用 ALiBi 位置嵌入、SwiGLU 激活与混合精度；上下文长度 2048；使用 EleutherAI GPT-NeoX 分词器。采用 LionW 优化器，峰值学习率 $1\times10^{-4}$、预热 2000 步、余弦衰减、权重衰减 $1\times10^{-2}$；批大小 1024。最大步数设为 9.5 万步（约 2000 亿词元），但实验在 1500 亿词元处结束。

实验使用 64 个 AMD Instinct MI250X 加速器。每个 MI250X 含两个逻辑节点，因此训练代码视角下共有 128 个计算单元，组成 16 个节点。每个逻辑单元的微批大小为 8。实验使用匿名化代码库实现。

### D.2 困惑度评测套件

数据消融用 Paloma（Magnusson 等，2023）跟踪语言模型困惑度，包含：

- **RedPajama v1：** LLaMA 1 预训练语料的 1 万亿词元复现。
- **C4：** 从 2019 年 4 月 Common Crawl 自动过滤得到的标准现代语言模型预训练语料。
- **mC4 英语子集：** 从 71 次 Common Crawl 抓取自动过滤得到的多语预训练语料中的英语部分。
- **Pile 验证集：** 广泛使用的多来源语言模型预训练语料，含多个非网页来源。
- **WikiText-103：** Wikipedia 中经验证的“优良”和“特色”文章标准集合。
- **Penn Treebank：** 源自《华尔街日报》文章的常用 NLP 语料。
- **M2D2 S2ORC：** 按分层学科类别组织的 Semantic Scholar 论文。
- **M2D2 Wiki：** 按 Wikipedia 本体分层类别组织的文章。
- **C4 100 domains：** C4 前 100 个域名的均衡样本。
- **GAB：** 2016–2018 年一个强调自由言论的另类右翼社交平台数据，已知仇恨言论比例高于主流平台。
- **ICE：** 本地专家整理的全球英语，包括加拿大、东非、香港、印度、爱尔兰、牙买加、菲律宾、新加坡和美国。
- **Twitter AAE：** 标注为非裔美国英语或白人对齐英语的均衡推文集。
- **Manosphere：** 过去十年发展相关男性主义意识形态的 9 个论坛样本。
- **4chan：** 2016–2019 年匿名论坛政治版数据，已知有毒内容比例较高。

我们还从其他开放语言模型语料中整理留出集以补充 Paloma：

- **Dolma 均匀样本：** 从全部子集中抽取 8,358 份文档，包括书籍 13、Common Crawl 网页 1,642、Reddit 投稿 4,545、科学论文 450、Wikipedia/Wikibooks 条目 1,708。
<!-- page 29 of 64 -->

E Construction of Conversational Threads in Forums Data

• Falcon RefinedWeb (Penedo et al., 2023): A corpus of English sampled from all Common Crawl scrapes until June 2023, more aggressively filtered and dedu- plicated than C4 and mC4-en.

• Dolma 100 Subreddits (this work): Balanced sam- ples of the top 100 subreddits by number of posts, sourced from the Dolma Reddit subset.

• Dolma 100 Programming Languages (this work): Balanced samples of the top 100 programming lan- guages by number of tokens, sourced from the Dolma Stack subset.

D.3 Downstream Evaluation Suite

Content comes from Reddit’s data API in two separate but linked forms: submissions and comments. Submis- sions are either "link posts" to external content (e.g. news articles, blogs, or even multimedia content) or "self posts" (submissions written by the poster meant to initiate a discussion thread on a topic). Comments are user replies to either the initiating post (top level com- ments) or to another user’s comment. Posts, top-level comments, and replies to comments form a nested con- versational thread with a submission post at it’s root and comments branching out into multiple possible dialogue trees.

We primarily base our data ablation decisions on the performance of models on this evaluation suite:

The tree-like structure of Reddit threads allows for multiple possible data formats depending on how the various components of a thread are combined. We inves- tigate three formats for their potential as LM pretraining data:

• AI2 Reasoning Challenge (Clark et al., 2018): A science question-answering dataset broken into easy and challenge subsets. Only the easy subset was used in online evaluations. The challenge subset was, however, included in offline evaluations.

• Atomic content. This simple format treats all com- ments and submissions as independent documents without any structure or connection to the thread they appear in.

• BoolQ (Clark et al., 2019): A reading comprehen- sion dataset consisting of naturally occurring yes/no boolean questions and background contexts.

• HellaSwag (Zellers et al., 2019): A multiple-choice question-answering dataset that tests situational un- derstanding and commonsense.

• OpenBookQA (Mihaylov et al., 2018): A multiple- choice question-answering dataset modeled on open- book science exams.

• Partial threads. This format assembles comments from the same thread into a structured, multi-round dialogue between users. Submissions are left as sepa- rate documents. Assembled dialogues are limited to a maximum parent depth, and the resulting documents are only snippets of a their originating thread (which are spread across several documents).

• Physical Interaction: Question Answering (PIQA) (Bisk et al., 2019): A multiple-choice question-answering dataset that focuses on physical commonsense and naive physics.

• Full threads. This complex format combines a given submission and all of its child comments into a single document encompassing an entire thread. Code-like indentation is used to indicate the depth of a comment in the thread’s hierarchy.

• SciQ (Welbl et al., 2017): A crowdsourced multiple- choice question-answering dataset consisting of ev- eryday questions about physics, chemistry and biol- ogy, among other areas of science.

• WinoGrande (Sakaguchi et al., 2019): A dataset of pronoun resolution problems involving various forms of commonsense. Modeled after the Winograd challenge from Levesque et al. (2012).

D.4 Training Setup for OLMo-1B

We experimentally evaluated these strategies for as- sembling documents in Figure 4. We found that, for language modeling purposes, treating comments and submissions as atomic units leads to better downstream performance compared to partial and full threads. We hypothesize that the more complex formatting required to handle dialogues might introduce undesirable con- tent for language modeling, such as short and repeated comments. We leave the study of better formatting for forum content for language modeling to future work.

F Tokenization Analysis

For OLMo-1B, we follow the experimental setup outlined for dataset ablation experiments in Appendix D, with the following differences:

• We set the max number of steps to 739,328 (which is roughly 3.1T tokens).

• We double the batch size to 2048 and do so by scaling up to 256 compute units (double what we used for data ablations).

• Due to instabilities we found in the LionW optimizer, we switched to using AdamW.

The first step of processing text with LMs is tokeniza- tion, i.e., mapping the text to a sequence of tokens with corresponding input embeddings (Sennrich et al., 2016; Kudo, 2018; Kudo and Richardson, 2018). Recently, there has been a growing interest in the question of how well LM tokenizers fit different data sources (e.g., data in different languages; Ahia et al., 2023; Petrov et al., 2023) Inspired by this emerging line of work,

### 第 29 页中文译文

- **Falcon RefinedWeb：** 从截至 2023 年 6 月的全部 Common Crawl 抓取中采样的英语语料，过滤与去重强度高于 C4 和 mC4-en。
- **Dolma 100 Subreddits：** 按帖子数选取 Dolma Reddit 子集中前 100 个 subreddit，并作均衡采样。
- **Dolma 100 Programming Languages：** 按词元数选取 Dolma Stack 子集中前 100 种编程语言，并作均衡采样。

### D.3 下游评测套件

数据消融决策主要依据模型在以下套件上的表现：

- **AI2 Reasoning Challenge：** 分简单与挑战两部分的科学问答数据集；在线评测只使用简单集，离线评测也包含挑战集。
- **BoolQ：** 由自然产生的是非问题及背景上下文组成的阅读理解数据集。
- **HellaSwag：** 测试情境理解与常识的多项选择问答数据集。
- **OpenBookQA：** 仿照开卷科学考试的多项选择问答数据集。
- **PIQA：** 关注物理常识与朴素物理学的多项选择问答数据集。
- **SciQ：** 众包多项选择问答数据集，包含物理、化学、生物等科学领域的日常问题。
- **WinoGrande：** 涉及多种常识形式的代词消解数据集，仿照 Winograd 挑战。

### D.4 OLMo-1B 训练设置

OLMo-1B 沿用附录 D 的数据消融设置，但有三点变化：最大步数设为 739,328（约 3.1 万亿词元）；批大小加倍到 2048，并扩展为 256 个计算单元；由于 LionW 不稳定，改用 AdamW。

## E 论坛数据中的对话主题串构造

Reddit API 以两种相互关联的形式提供内容：投稿和评论。投稿可以是指向外部内容的链接帖，也可以是发帖者为发起主题讨论而写的自发帖。评论既可回复首帖（顶层评论），也可回复其他评论。帖子、顶层评论与评论回复构成以投稿为根、评论分叉成多个对话树的嵌套主题串。

这种树状结构允许按不同方式组合主题串组件。我们考察三种作为语言模型预训练数据的格式：

- **原子内容：** 把所有评论与投稿视为互不关联的独立文档，不保留主题串结构。
- **部分主题串：** 将同一主题串评论组装成用户间结构化多轮对话，投稿仍作为独立文档。组装对话限制最大父节点深度，因此所得文档只是原主题串的片段，一个主题串会分散到多个文档。
- **完整主题串：** 把某项投稿及其全部子评论合并为覆盖整个主题串的单份文档，以类似代码的缩进表示评论在层级中的深度。

我们在图 4 中实验评估这些文档组装策略。就语言建模而言，将评论与投稿作为原子单元，比部分或完整主题串带来更好的下游表现。我们推测，处理对话所需的复杂格式可能引入不理想的语言建模内容，例如简短且重复的评论。如何更好地格式化论坛内容留待未来研究。

## F 分词分析

语言模型处理文本的第一步是分词，即把文本映射为词元序列及对应输入嵌入。近期，研究者日益关注语言模型分词器对不同数据源的适配程度。受此启发，我们对 GPT-NeoX 分词器应用于 Dolma 的情况作探索性分析，初步呈现 Dolma 各数据源对现有分词器的挑战程度。
<!-- page 30 of 64 -->

(a) Count analysis (b) Fertility analysis (c) Whitespace analysis

Figure 6: Tokenization analysis. Tokens with small IDs, which have a high count in the tokenizer training data, also tend to have a high count in Dolma (a). The Stack has a substantially higher fertility compared to the other data sources (b), which can be explained by the higher relative frequency of whitespace characters such “\n” and “\t” (c). See text for more details.

we conduct an explorative analysis of the GPTNeoX tokenizer (Black et al., 2022) applied to Dolma, which provides a first picture of how challenging the different data sources comprised by Dolma are for current LM tokenizers.

code subset (which mostly contains code), words are often preceded by whitespace characters other than a blank space (e.g., newline, tab, return). Crucially, while a blank space before a word is tokenized as part of that word (e.g., I love you →“I”, “ love”, “ you”), other whitespace characters yield separate tokens (e.g., I love you →“I”, “\t”, “love”, “\t”, “you”). This can also be seen by plotting the relative frequency of to- kens representing whitespace characters by data source, which is one order of magnitude higher for The Stack compared to most other data sources (see Figure 6c). When training LMs on The Stack (or code more gener- ally), it thus might be advisable to add special tokens to the tokenizer (e.g., “\nif”; Hong et al., 2021). It is important to notice that this observation applies to most tokenizers in use today (e.g., the tokenizer used by GPT- 4), which tend to lack tokens such as “\nif”.

G Auditing our Language Filter

We start by taking a global look at the tokenizer’s fit to Dolma. Out of the 50,280 tokens in the tokenizer vocabulary, 50,057 are present in the tokenized text of Dolma. In other words, 223 tokens are never used, amounting to roughly 0.4% of the tokenizer vocabu- lary. The 223 tokens mostly consist of combinations of whitespace characters (e.g., “\n\n ”, two newline char- acters followed by two blank space characters). Note that when training an LM with the examined tokenizer on Dolma, the input embeddings corresponding to these tokens would not be updated. In terms of the count distribution of tokens, we find that tokens with smaller IDs tend to have higher counts in Dolma (see Figure 6a), which is also reflected by a strong Spearman’s cor- relation between (i) the ranking of tokens based on their counts in Dolma and (ii) the token IDs (r = 0.638, p < 0.001). Given how the tokenizer was trained (Sennrich et al., 2016; Black et al., 2022), smaller IDs correspond to byte pairs merged earlier and hence tokens occurring more frequently in the tokenizer training data Overall, these results suggest a good fit of the GPTNeoX tok- enizer to Dolma.

To analyze the impact of the FastText language iden- tification classifier, we ran an external audit on the In- ternational Corpus of English (ICE) (Kirk and Nelson, 2018), a dataset containing spoken and written English from nine countries around the world. We ran our lan- guage ID tool on all documents in the ICE dataset to estimate how many documents from each region would have been erroneously filtered. The ground truth in this analysis is that every document is in English, and should be classified as such. Interestingly, we found that at our fairly permissive threshold (keeping documents with at least a 0.5 score for English) correctly identified all English-language documents in ICE each as English, no matter the region it was from.

H Details on Toxicity Filters

Does the tokenizer fit all data sources included in Dolma equally well? To examine this question, we analyze fertility, which is defined as the average number of tokens per word generated by a tokenizer (Acs, 2019; Scao et al., 2022), in our case measured on a specific data source. We find that fertility is similar for most data sources, ranging between 1.15 (conversational forum subset) and 1.28 (books subset), with the exception of the code subset, which has a substantially higher fertility of 2.45 (see Figure 6b). This means that the costs of processing the code subset — be they computational or financial in nature (Petrov et al., 2023) — are more than twice as high compared to the other data sources.

What causes this discrepancy? We find that in the

Implementation. To remove toxic content from Dolma, we used the Jigsaw Toxic Comments dataset (cjadams et al., 2017), which contains forum comments tagged with (multilabel) categories “toxic”, “severe toxic”, “threat”, “insult”, “obscene”,

### 第 30 页中文译文

（a）计数分析　（b）生育度分析　（c）空白字符分析

图 6：分词分析。ID 较小的词元在分词器训练数据中计数较高，在 Dolma 中往往也有较高计数（a）。The Stack 相比其他来源具有显著更高的生育度（b），可由换行符 `\n`、制表符 `\t` 等空白字符的相对频率更高来解释（c）。详见正文。

我们第一步全局考察分词器对 Dolma 的适配。在 50,280 个词表词元中，50,057 个出现在分词后的 Dolma 文本里；即有 223 个词元从未使用，约占词表 0.4%。这 223 个词元主要是空白字符组合。若用该分词器在 Dolma 上训练语言模型，对应输入嵌入不会更新。计数分布显示，ID 较小的词元在 Dolma 中往往计数较高（图 6a）；按 Dolma 计数的词元排名与词元 ID 之间有较强 Spearman 相关（$r=0.638,p<0.001$）。按分词器训练方式，较小 ID 对应更早合并、在分词器训练数据中更常见的字节对。总体说明 GPT-NeoX 分词器与 Dolma 适配良好。

不同来源是否同样适配？我们分析“生育度”，即特定数据源上每个词平均生成的词元数。大多数来源相近，从对话论坛的 1.15 到书籍的 1.28；代码子集显著更高，为 2.45（图 6b）。因此处理代码子集的计算或经济成本超过其他来源的两倍。

原因在于代码子集中的词经常由普通空格以外的空白字符（换行、制表、回车）引导。词前普通空格会作为词的一部分分词，而其他空白字符会成为独立词元。按来源绘制空白字符词元的相对频率可见，The Stack 比多数来源高一个数量级（图 6c）。因此在代码上训练模型时，可能适合向分词器加入 `\nif` 等特殊词元。多数现用分词器（包括 GPT-4 的分词器）都缺少此类词元，因此该观察具有普遍性。

## G 审计语言过滤器

为分析 FastText 语言识别分类器的影响，我们在国际英语语料库 ICE 上进行外部审计。ICE 包含全球九个国家的英语口语和书面语。我们对全部文档运行语言识别工具，估计各地区有多少文档会被错误过滤。本分析的真值是每份文档都是英语，都应被正确分类。结果表明，在相当宽松的 0.5 阈值下，ICE 中所有英语文档无论地区均被正确识别为英语。

## H 毒性过滤器细节

**实现。** 为从 Dolma 中移除有毒内容，我们使用 Jigsaw Toxic Comments 数据集。该数据集含带“toxic”“severe toxic”“threat”“insult”“obscene”“identity hate”等多标签的论坛评论及未标注评论，据此训练两个 FastText 分类器：二元“仇恨”检测器和二元“NSFW”检测器。（具体标签构造续下页。）
<!-- page 31 of 64 -->

corpus, we create a dataset of comments from location- based subreddits,17 filtering for country-specific subred- dits with more than 50K comments. This dataset serves as a crude proxy for different dialects of English, assum- ing most commenters live in the respective locations and speak the variation. We further assume the fraction of actually toxic comments in each of these subreddits to be roughly the same. We compute the toxicity score for each comment in this dataset using the FastText clas- sifier and report the percentage of comments marked as toxic against different classifier thresholds in Figure 8. For all thresholds, for any two locations, we find <5% difference in the fraction of comments marked as toxic suggesting little to no bias. Further, we plot the distribu- tion of toxicity scores for comments in each subreddit and find that scores assigned to the comments often fall at the extremes (close to 0 or close to 1), suggesting that any reasonable threshold (lying between 0.1 to 0.9) to predict toxicity will lead to similar outcomes.

Figure 7: Percentage of English-language documents in the International Corpus of English (ICE) (Kirk and Nel- son, 2018) that would be misidentified as non-English as a result of thresholding the FastText classifier’s pre- dicted English score. We find a majority of English documents in ICE remain identified as English even with a threshold of 0.90.

I Details on PII Filters

and/or “identity hate” alongside unlabeled com- ments, to train two FastText classifiers—a binary “hate” detector and a binary “NSFW” detector:

1. For our “hate” detector, we group all unlabeled com- ments and “obscene”-only comments as negatives and leave remaining comments as positives.

Filter implementation. The Common Crawl, C4, Reddit, and GitHub subsets used the same regular ex- pressions for identifying PII. We refer the reader to our GitHub for exact implementations of our regular expres- sions for each of the PII types — email address, phone number, and IP address. Once spans are tagged, we employ different processing strategies based on the their density on each document:

2. For our “NSFW” detector, we take all comments tagged as “obscene” as positives and leave other remaining comments as negatives. It is important to note this detector only filters toxic content that mentions sexual or obscene topics, not sexual content in general.

• 5 or fewer PII spans detected: we replace all spans on a page with special tokens |||EMAIL_ADDRESS|||, |||PHONE_NUMBER|||, and |||IP_ADDRESS||| for email addresses, phone numbers, and IP addresses respec- tively.18 In total, we find that 0.02% of documents in the 25 Common Crawl snapshots match this filter.

• 6 or more PII spans detected: we remove any docu- ment that contains 6 or more matching PII spans. We use this approach because pages containing abundant phone numbers and email addresses are likely to pose a greater risk of disclosing other PII classes. 0.001% of documents in the 25 Common Crawl snapshots match this filter.

J Do quality and content filters have similar effects?

Figure 8: Distribution of Reddit comments labeled as toxic by English variation.

In order to further understand how filters described in §5.2, §5.3, and §5.4 interact with each other, we per- form a correlation analysis on a subset of documents sampled from our pipeline. The correlation among the documents flagged for removal by our Common Crawl filters is depicted in Figure 9. Overall, we find that cor- relations are generally low, thus our filters select fairly different documents and are not redundant.

17reddit.com/r/LocationReddits/wiki/index 18When training models on Dolma, we add these special tokens to the tokenizer vocabulary.

Analysis of resulting classifier. To measure dialectal biases in the FastText toxicity classifier, we analyze its proclivity to predict English variations spoken in differ- ent countries as toxic. Starting with the unfiltered Reddit

### 第 31 页中文译文

我们从按地理位置划分的 subreddit 构造评论集，筛选评论数超过 5 万的国家专属 subreddit。该数据集粗略代理不同英语方言，假设多数评论者居住在相应地点并使用当地变体；还假设各 subreddit 实际有毒评论比例大致相同。我们用 FastText 分类器计算每条评论的毒性得分，并在图 8 中报告不同阈值下标为有毒的评论比例。在所有阈值下，任意两地被标为有毒的评论比例差异均小于 5%，暗示偏差很少或没有。各 subreddit 的得分通常落在接近 0 或 1 的两端，说明 0.1–0.9 之间任何合理毒性阈值都会产生近似结果。

图 7：对 FastText 分类器预测英语得分设阈值后，国际英语语料库 ICE 中会被错误识别为非英语的文档比例。即使阈值为 0.90，ICE 中大多数英语文档仍被识别为英语。

（接上页毒性过滤器实现。）

1. 对“仇恨”检测器，把全部未标注评论和只标为“obscene”的评论作为负例，其余评论作为正例。
2. 对“NSFW”检测器，把全部标为“obscene”的评论作为正例，其余评论作为负例。必须注意，该检测器只过滤提及性或淫秽主题的有毒内容，并不一般性过滤性内容。

图 8：按英语变体划分、被标记为有毒的 Reddit 评论分布。

## I PII 过滤器细节

**过滤器实现。** Common Crawl、C4、Reddit 与 GitHub 子集使用相同正则表达式识别 PII。电子邮件地址、电话号码和 IP 地址三种 PII 的精确正则实现见 GitHub。标记文本片段后，按每份文档中的密度采取不同处理：

- **检测到不超过 5 个 PII 片段：** 分别用特殊词元 `|||EMAIL_ADDRESS|||`、`|||PHONE_NUMBER|||` 和 `|||IP_ADDRESS|||` 替换页面中的电子邮件、电话号码和 IP 地址。25 个 Common Crawl 快照中共有 0.02% 的文档匹配该过滤器。
- **检测到 6 个或更多 PII 片段：** 删除任何包含至少 6 个匹配 PII 片段的文档。大量电话号码和电子邮件的页面更可能泄露其他 PII 类别，因此采用这一做法。25 个 Common Crawl 快照中有 0.001% 的文档匹配。

## J 质量与内容过滤器是否具有相似效果？

为进一步理解 §5.2、§5.3 与 §5.4 的过滤器如何交互，我们对流水线抽样文档进行相关分析。Common Crawl 各过滤器标记删除的文档之间的相关性见图 9。总体相关性较低，说明各过滤器选择的文档相当不同，并不冗余。

脚注 17：`reddit.com/r/LocationReddits/wiki/index`。脚注 18：在 Dolma 上训练模型时，将这些特殊词元加入分词器词表。
<!-- page 32 of 64 -->

-0.002

-0.002

-0.001

-0.087 0.003

-0.091 0.004

-0.051 0.005

-0.03 0.003 0.02

-0.013 0.002 0.018

-0.01 0.001 0.044

-0.21 0.005 0.036 -0.006

-0.19 0.004 0.052 -0.001

-0.36 0.013 -0.012 -0.018

Decont. Hate PII Dedup.

Decont. Hate PII Dedup.

Decont. Hate PII Dedup.

Gopher Decont. Hate PII

Gopher Decont. Hate PII

Gopher Decont. Hate PII

(a) High

(b) Medium

(c) Low

Figure 9: Pearson Correlation of various Dolma filters on the High, Medium, and Low buckets of our Common Crawl data, computed over 24M, 20M, and 43M documents, respectively. The filters are Gopher=Gopher rules from Rae et al. (2021), Dedup.=Deduplication, PII=Personally Identifiable Information, Hate=Toxicity and De- cont.=Decontamination. Calculated at the document-level: two filters contribute to positive correlation when any span in a document is tagged by both filters. We find our various filters remove different documents and are not redundant.

is longer than 13 Unicode-segmented tokens19 and (ii) it appears in any of the documents in Paloma.

To train OLMo-1B, we remove any document with at least one paragraph marked as contaminated. This approach, while prone to false positives, has a negligible impact on the final removal rate (≤0.001% characters in Dolma contaminated, ≤0.02% of documents removed.), and reduces likelihood of false negatives.

There is some positive correlation between our PII (Personal Identifiable Information) filters and filters re- moving hate speech. This is likely because hate speech is often directed at people. The Gopher filtering rules correlate negatively with our deduplication, especially for the high-perplexity tail part of our data. This is due to the Gopher rules removing many high-perplexity doc- uments such as random strings, which are not caught by deduplication due to their randomness. As these random strings likely do not contribute to a better understanding of language, it is important to filter them out and thus rely on filters beyond deduplication.

K Dolma data distribution figures using WIMBD

We use the tool from Elazar et al. (2023) to inspect the final data composition in Figure 10. In particular, we analyze web domain, year, and language distributions.

Decontamination of downstream tasks. Using WIMBD (Elazar et al., 2023), we analyze test set con- tamination in Dolma. We find contamination of entire datasets from popular benchmarks like GLUE (Wang et al., 2018) and SuperGLUE (Wang et al., 2019), and evaluation datasets like SNLI (Bowman et al., 2015b) and the Winograd Schema Challenge (Levesque et al., 2012). Further analysis reveals that many of these sets are contaminated in our code subset, as public reposito- ries in GitHub often contains copies of these datasets. We report the top contaminated datasets in Figure 11.

We note that Dolma contains documents from a broad set of internet domains, mostly from 2020, 2022, and 2021. The most common internet domains in Dolma, per token, are patents.google.com, followed by www.nature.com and www.frontiersin.org. In fact, similar to other corpora reported in Elazar et al. (2023), 63.6% of Dolma’s web documents are from ‘.com’ sites (followed then by ‘.org’ and ‘.co.uk’ sites).

Finally, as all language identification tools are imper- fect, we summarize what languages are remaining post English-only filtering: We find the most common lan- guage after English is not well identified (‘un’) with 0.86% of the documents, followed by 0.06% of the doc- uments identified as Chinese.

L Test Set Contamination in Dolma

Results indicate that portion of datasets in Prompt- source appear in Dolma. Six datasets are completely contaminated (100%): the Winograd Schema Challenge (Levesque et al., 2012), Sick (Marelli et al., 2014), AX from GLUE (Wang et al., 2018), SemEval (specifically, Task 1 from 2014), COPA from SuperGLUE (Roem- mele et al., 2011), and AXb (the diagnostic task) from SuperGLUE (Wang et al., 2019). In addition, other datasets are mostly contaminated, with over 90% of their test sets appearing in Dolma documents: OpenAI HumanEval (Chen et al., 2021), WIC from SuperGLUE (Pilehvar and Camacho-Collados, 2019), ESNLI (Cam- buru et al., 2018), and SNLI (Bowman et al., 2015a). We note that the contaminated datasets have been ex- cluded from the downstream tasks we use for model evaluation (c.r.f. Appendix D).

19Like in Elazar et al. (2023), we only consider paragraphs of sufficient length to avoid false positive matches.

Decontamination for perplexity evaluation. Using the paragraph deduplication tools described in §5.4, we mark any paragraph in Dolma as contaminated if (i) it

### 第 32 页中文译文

图 9：在 Common Crawl 数据的高、中、低三个分桶上，各种 Dolma 过滤器的 Pearson 相关系数；分别基于 2400 万、2000 万和 4300 万份文档计算。Gopher 表示 Rae 等人（2021）的 Gopher 规则，Dedup. 表示去重，PII 表示个人身份信息，Hate 表示毒性，Decont. 表示去污染。按文档级计算：若一份文档中的任意片段同时被两个过滤器标记，则二者产生正相关贡献。结果显示各过滤器移除不同文档，并不冗余。

PII 过滤器与移除仇恨言论的过滤器存在一定正相关，可能因为仇恨言论常常针对具体的人。Gopher 规则与去重负相关，在高困惑度尾部尤其明显。这是因为 Gopher 规则会删除随机字符串等许多高困惑度文档，而这些字符串因具有随机性不会被去重捕捉。随机字符串不太可能帮助理解语言，因此必须过滤，不能只依赖去重。

## K 使用 WIMBD 绘制 Dolma 数据分布

我们使用 Elazar 等人（2023）的工具检查图 10 所示最终数据构成，具体分析网页域名、年份和语言分布。

Dolma 文档来自广泛互联网域名，主要年份为 2020、2022 与 2021。按词元计，最常见域名依次包括 `patents.google.com`、`www.nature.com` 和 `www.frontiersin.org`。与 Elazar 等人（2023）报告的其他语料相似，Dolma 网页文档的 63.6% 来自 `.com` 网站，其后是 `.org` 和 `.co.uk`。

由于所有语言识别工具都不完美，我们还汇总仅保留英语后残留的语言。英语之外最常见类别是无法良好识别的 `un`，占文档 0.86%；第二步是被识别为中文的文档，占 0.06%。

## L Dolma 中的测试集污染

**困惑度评测去污染。** 使用 §5.4 的段落去重工具，当一个 Dolma 段落同时满足以下条件时，将其标记为污染：（i）长度超过 13 个按 Unicode 切分的词元；（ii）出现在 Paloma 的任一文档中。

训练 OLMo-1B 时，删除任何至少含一个污染段落的文档。该方法虽然容易产生假阳性，但对最终删除率影响很小（Dolma 中污染字符不超过 0.001%，删除文档不超过 0.02%），并降低假阴性概率。

**下游任务去污染。** 使用 WIMBD（Elazar 等，2023）分析 Dolma 中的测试集污染。结果发现 GLUE、SuperGLUE 等常用基准的整个数据集，以及 SNLI、Winograd Schema Challenge 等评测集存在污染。进一步分析表明，许多数据集在代码子集中受到污染，因为 GitHub 公共仓库经常含有这些数据集的副本。污染最严重的数据集见图 11。

PromptSource 中有一部分数据集出现在 Dolma。六个数据集完全污染（100%）：Winograd Schema Challenge、SICK、GLUE 的 AX、SemEval（具体为 2014 Task 1）、SuperGLUE 的 COPA 和 SuperGLUE 的 AXb 诊断任务。另一些测试集超过 90% 出现在 Dolma 文档中：OpenAI HumanEval、SuperGLUE 的 WiC、e-SNLI 和 SNLI。受污染数据集已从模型评测使用的下游任务中排除（参见附录 D）。

脚注 19：与 Elazar 等人（2023）一致，我们只考虑足够长的段落，以避免假阳性匹配。
<!-- page 33 of 64 -->

Dolma Domains

0.125

Dolma Dates

Dolma Languages

37.9

0.86

0.100

0.8

35

30

0.075

0.6

25

0.050

23.2 21.9

20

% of Documents

0.025

0.4

15

% of Documents

% of Documents

0.000

9.2

10

0.2

5

3.2

epdf.pub

issuu.com

1.1 0.7 0.6 0.5 0.4

0.06 0.06 0.03 0.03 0.03 0.03 0.02 0.02 0.02

law.justia.com

0

0.0

en.wikipedia.org

www.nature.com

journals.plos.org

api.parliament.uk

patents.justia.com

fr

ja

pt

www.frontiersin.org

patents.google.com

ru

zh

es

ko

un

de

2020

2022

2021

2019

2023

2018

2017

2016

2015

long

None

Domain

Year

Language

(a) Web (URL) domains

(b) Dates of documents

(c) Non-English languages

Figure 10: Frequencies over different document metadata as computed using the WIMBD tool from Elazar et al. (2023). In subfigure (c), un denotes documents whose language could not be identified; long indicates documents that are too long to be processed with the tool’s language ID module.

Index

100

92.7 96.1 97.2 97.2 100.0 100.0 100.0 100.0 100.0 100.0 Contaminated Datasets in Dolma

Dolma

80

62.3 68.0 68.0

60

48.6

40

33.3

20

6.6 6.7 7.7 14.5

% Contaminated instances

0

liar

snli

sick

scicite

glue_ax

glue_rte

head_qa

glue_qnli

sem_eval

glue_mrpc

paws-x_en

swag_regular

winograd_wsc

super-glue_rte

super-glue_wicesnli

super-glue_axb

super-glue_copa

openai_humaneval

Dataset

Figure 11: Contamination percentages of datasets from PromptSource (Bach et al., 2022).

is needed?

M Strategies for Subsets Mixing and Upsampling with Dolma

We create three mixtures from the C4 and Stack sub- sets containing 0%, 5% and 15% of code data. On each, we train a 1B model. We evaluate these models on three different reasoning tasks: bAbI (Weston et al., 2015), WebNLG (Gardent et al., 2017) and GSM8k (Cobbe et al., 2021). For the first two tasks, we follow the experimental setup of Muennighoff et al. (2023b) and evaluate each model in an ICL setup with a changing number of demonstrations (0-5) across 5 random seeds. Muennighoff et al. (2023b) show that adding code to pre-training data improves ICL performance on bAbI and WebNLG and they suggest that code improves long- range state-tracking capabilities. Our experiments, as shown in Table 3, corroborate these findings: while the C4-only model fails on all bAbI tasks, adding code im- proves performance, with a similar trend for WebNLG.

Like the pretraining corpora of nearly every large-scale language model, Dolma is a multi-source dataset. Train- ing on Dolma thus requires a mixing strategy that de- termines how much data from each source to include, and potentially which sources to upsample. Like other multi-source corpora (e.g., ROOTS (Laurenccon et al., 2023), the Pile (Gao et al., 2020), RedPajama v1 (To- gether Computer, 2023a)),20 Dolma does not prescribe a single mixing strategy. We refer the reader to Rae et al. (2021) for an example of how one might programmat- ically search over mixing configurations to maximize performance. Here, we perform mixing experiments as an opportunity to answer some research questions about how different data sources interact. We use the same ablation setup described in §4.

How much code is important for pretraining? It is common practice for language models to be pretrained on some amount of code, even if code generation is not the intended task. Some research has suggested that mixing code into training over plain text documents im- proves performance on reasoning tasks (Madaan et al., 2022). We investigate whether this observation holds for models trained on Dolma, and if so, how much code

On the more difficult GSM8k benchmark, all models failed to get any correct answer in an ICL setup, and even when fine-tuning the models on the entire training set. However, we find that by fine-tuning on program- aided output, where questions are solved by writing Python snippets as described in (Gao et al., 2022), code models outperform the C4-only model. These results show that models pre-trained on code can leverage code generation to answer challenging reasoning tasks even when the original task does not directly involve code.

20RedPajama v1 was a reproduction of the multi-source corpus used in LLaMA (Touvron et al., 2023a). RedPajama v2 (Together Computer, 2023b) focuses solely on Common Crawl and is thus single-source.

Evaluating mixing strategies for pretraining on Dolma While Dolma does not prescribe a specific source mixture, we analyze some commonly used strate-

### 第 33 页中文译文

Dolma 领域 / Dolma 日期 / Dolma 语言

文档占比；领域；年份；语言。（图中域名、年份、语言代码及数值保持原样。）

（a）网页（URL）域名　（b）文档日期　（c）非英语语言

图 10：使用 Elazar 等人（2023）的 WIMBD 工具计算所得的不同文档元数据频率。在子图（c）中，`un` 表示无法识别语言的文档；`long` 表示篇幅过长、无法由该工具的语言识别模块处理的文档。

Dolma 中受污染的数据集；污染实例占比；数据集。（图中数据集名称及数值保持原样。）

图 11：PromptSource（Bach 等，2022）中各数据集的污染比例。

## M Dolma 子集的混合与上采样策略

Dolma 与几乎所有大规模语言模型的预训练语料一样，是一个多来源数据集。因此，在 Dolma 上训练需要一套混合策略，用以确定每个来源应纳入多少数据，以及哪些来源可能需要上采样。与其他多来源语料库（例如 ROOTS（Laurençon 等，2023）、The Pile（Gao 等，2020）、RedPajama v1（Together Computer，2023a））类似，Dolma 并未规定唯一的混合策略。关于如何通过程序化搜索混合配置以最大化性能，可参见 Rae 等人（2021）。这里，我们把混合实验作为回答不同数据来源如何相互作用这一研究问题的机会，并使用 §4 所述的同一消融设置。

**预训练需要多少代码？** 即使目标任务并非代码生成，语言模型在一定比例的代码上预训练也已成为常见做法。一些研究提出，将代码混入纯文本训练数据能够改善推理任务表现（Madaan 等，2022）。我们考察这一现象是否也适用于在 Dolma 上训练的模型；若适用，还要考察需要多少代码。

我们从 C4 和 Stack 子集中构造三个混合数据集，代码占比分别为 0%、5% 和 15%，并分别训练一个 10 亿参数模型。我们在三个不同的推理任务上评估这些模型：bAbI（Weston 等，2015）、WebNLG（Gardent 等，2017）和 GSM8K（Cobbe 等，2021）。前两个任务遵循 Muennighoff 等人（2023b）的实验设置，采用上下文学习（ICL），在 5 个随机种子下改变示例数量（0–5）。Muennighoff 等人（2023b）表明，在预训练数据中加入代码会提高 bAbI 和 WebNLG 的 ICL 性能，并提出代码可改善长距离状态追踪能力。如表 3 所示，我们的实验印证了这一发现：仅使用 C4 的模型在所有 bAbI 任务上均失败，而加入代码能够提高性能；WebNLG 也呈现类似趋势。

在难度更高的 GSM8K 基准上，所有模型在 ICL 设置下都无法答对任何问题，即便在完整训练集上微调也仍然如此。不过，当按照 Gao 等人（2022）的方法，在程序辅助输出上微调、通过编写 Python 代码片段解题时，我们发现代码模型优于仅使用 C4 的模型。这些结果说明，在代码上预训练的模型能够利用代码生成回答有挑战性的推理问题，即使原任务并不直接涉及代码。

20 RedPajama v1 是对 LLaMA（Touvron 等，2023a）所用多来源语料库的复现。RedPajama v2（Together Computer，2023b）只关注 Common Crawl，因此属于单一来源语料库。

**评估 Dolma 预训练的混合策略。** 虽然 Dolma 没有规定具体的来源混合比例，但我们分析了一些常用策略，并使用 Paloma 评测套件（Magnusson 等，2023）比较其效果。具体而言，表 4 给出并评估了四种可能的数据混合方案。
<!-- page 34 of 64 -->

Dataset 0% Code 5% Code 15% Code

bAbI (ICL) 0.0 ± 0.0 8.8 ± 0.9 10.1 ± 2.8 WebNLG (ICL) 16.8 ± 1.1 19.3 ± 1.1 22.0 ± 1.3 GSM8K (FT) 0.0 ± 0.0 0.0 ± 0.0 0.0 ± 0.0 GSM8K+PAL (FT) 11.8 ± 0.8 14.2 ± 1.3 14.7 ± 0.9

Table 3: Performance of three models pre-trained with increasing amounts of code on three datasets, across 5 random seeds. We measure exact match for bAbI and GSM8K, and Rouge-2 for WebNLG.

gies21 and compare their effect using the Paloma eval- uation suite (Magnusson et al., 2023). Specifically, we present and evaluate four possible data mixtures in Ta- ble 4.

PDFs and its associated metadata, code over a vari- ety of programming languages, reference material from Wikipedia and Wikibooks, as well as public domain books from Project Gutenberg.

What (other) tasks could the dataset be used for?

We expect this dataset to be useful to train other lan- guage models, either in its current form or through fur- ther filtering and combining it with other datasets.

Beside language model training, this dataset could be used to study interaction between pretraining corpora and models trained on them. For example, one could study provenance of generations from the model, or perform further corpus analysis.

Specific subset of Dolma could be used to train do- main specific models. For example, the code subset could be used to train an AI programming assistant.

Are there obvious tasks for which it should not be used?

Due to the myriad transformations applied to the orig- inal source materials to derive our dataset, we believe it is ill-suited as a replacement for users seeking to di- rectly consume the original content. We refer users of our dataset to our license and terms on the Hug- ging Face Hub huggingface.co/datasets/allenai/ dolma which detail any use restrictions.

Has the dataset been used for any tasks already?

We show results of mixtures in Figure 12. Overall, we observe that the different mixtures have an effect on the ability of resulting models to capture specific subdo- mains. All mixtures show similar perplexity scores on pages sampled from 100 domains from C4 (Figure 12, left), indicating their general effectiveness at modeling web documents. On the other hand, we note how mod- els struggle to model specialized domains unless they are exposed to them. As an example, a model trained on the Web-only mix struggles to represent data in the code domain (Figure 12, center, HumanEval). Finally, we use results on the S2ORC subset of M2D2, which consists of academic papers, to illustrate how different data mixtures affect perplexity. As is it the case with code, Web-only model exhibits higer perplexity due to domain mismatch. On the other hand, models trained on Reference+ and Gopher-like mixes achieve lower perplexity than the model trained on the Naïve mix, due to more in-domain content. However, we note that, de- spite significant differences in the amount of academic papers between Reference+ and Gopher-like (4.9% vs 24.2%), they achieve nearly identical results, suggesting that even a relatively small percentage of in-domain data is sufficient to achieve good domain fit.

The OLMo (Groeneveld et al., 2024) model family is trained on this dataset.

N Datasheet

If so, where are the results so others can compare?

Following the template by Gebru et al. (2021), we pro- vide a Datasheet for Dolma.

Experimental results are detailed in this paper and in the OLMo (Groeneveld et al., 2024) manuscript.

Who funded the creation of the dataset?

N.1 Motivation for Dataset Creation

Why was the dataset created?

All individuals who are responsible for this dataset are employed by the Allen Institute for AI. Similarly, computing resources are provided by AI2.

If there is an associated grant, provide the grant number.

Compute for the OLMo project is provided by AMD and CSC, using GPUs on the LUMI supercomputer.

Dolma was created with the primary purpose of train- ing OLMo autoregressive language model. It is a mix- ture of documents from multiple data sources. Docu- ments have been transformed using a combination of rule-based and statistical tools to extract textual con- tent, remove layout information, and filter for English content.

N.2 Dataset Composition

What are the instances? Are there multiple types of instances?

Dolma contains data sourced from different domains. In particular, it contains a mixture of text obtained from a web scrape, scientific content extracted from academic

21We did not include any social data in these mixes as it was not ready at the time of this experiment.

Instances are plain-text spans on English text or computer code. Each instance was obtained by pro- cessing web pages (which might include news, docu-

### 第 34 页中文译文

数据集｜0% 代码｜5% 代码｜15% 代码

bAbI（ICL）0.0 ± 0.0｜8.8 ± 0.9｜10.1 ± 2.8
WebNLG（ICL）16.8 ± 1.1｜19.3 ± 1.1｜22.0 ± 1.3
GSM8K（FT）0.0 ± 0.0｜0.0 ± 0.0｜0.0 ± 0.0
GSM8K+PAL（FT）11.8 ± 0.8｜14.2 ± 1.3｜14.7 ± 0.9

表 3：三个模型分别使用逐步增加代码占比的语料进行预训练后，在三个数据集上的表现；结果覆盖 5 个随机种子。bAbI 和 GSM8K 使用精确匹配，WebNLG 使用 Rouge-2。

图 12 展示了各混合方案的结果。总体来看，不同混合方式会影响所得模型捕捉特定子领域的能力。所有混合方案在从 C4 的 100 个域名中抽取的页面上都呈现相近的困惑度（图 12 左），说明它们对网页文档建模总体有效。另一方面，如果模型没有接触某个专业领域，就很难为其建模。例如，仅网页混合在代码领域数据 HumanEval 上表现困难（图 12 中）。末尾，我们用 M2D2 的 S2ORC 子集（由学术论文组成）说明不同数据混合如何影响困惑度。与代码一样，仅网页模型因领域不匹配而具有更高困惑度。使用 Reference+ 和 Gopher-like 混合训练的模型则因包含更多领域内内容而低于 Naïve 混合模型。然而，尽管 Reference+ 与 Gopher-like 中学术论文占比差异显著（4.9% 对 24.2%），二者结果几乎相同，说明相对较少的领域内数据可能已经足以实现良好的领域拟合。

## N 数据说明表

以下内容遵循 Gebru 等人（2021）的模板，为 Dolma 提供数据说明表。

### N.1 创建数据集的动机

**为什么创建该数据集？**

Dolma 的首要用途是训练 OLMo 自回归语言模型。它混合了多个数据来源的文档。文档通过基于规则与统计的工具组合进行转换，以抽取文本内容、去除版面信息并筛选英语内容。

Dolma 包含从不同领域获得的数据，具体包括：网页抓取所得文本、从学术 PDF 及其相关元数据中提取的科学内容、多种编程语言的代码、来自 Wikipedia 与 Wikibooks 的参考资料，以及 Project Gutenberg 的公版书籍。

**该数据集还能用于哪些（其他）任务？**

我们预计，该数据集无论保持现状，还是经过进一步筛选并与其他数据集合并，都可用于训练其他语言模型。

除语言模型训练外，该数据集还可用于研究预训练语料与由其训练的模型之间的相互作用。例如，可以研究模型生成内容的出处，或开展进一步的语料分析。

Dolma 的特定子集可用于训练领域专用模型。例如，代码子集可用于训练 AI 编程助手。

**是否存在明显不适合使用该数据集的任务？**

由于我们为生成本数据集而对原始材料进行了大量转换，我们认为它不适合替代原始内容，供希望直接阅读原文的用户使用。有关使用限制，请查阅 Hugging Face Hub 上 `huggingface.co/datasets/allenai/dolma` 的许可证和条款。

**该数据集是否已用于任何任务？**

OLMo（Groeneveld 等，2024）模型家族在本数据集上训练。

**若是，结果发布在哪里，便于他人比较？**

实验结果详见本文以及 OLMo（Groeneveld 等，2024）论文。

**谁为数据集创建提供资金？**

所有负责该数据集的人员均受雇于艾伦人工智能研究所（AI2），计算资源也由 AI2 提供。

**若有相关资助，请提供资助编号。**

OLMo 项目的计算资源由 AMD 和 CSC 提供，使用 LUMI 超级计算机上的 GPU。

### N.2 数据集构成

**实例是什么？是否包含多种实例类型？**

实例是英语文本或计算机代码的纯文本片段。每个实例通过处理网页（可能包括新闻、论坛等）、学术文章、GitHub 代码、Wikipedia 百科内容或 Project Gutenberg 书籍获得。

21 本实验进行时，社交数据尚未准备就绪，因此这些混合方案均未包含社交数据。
<!-- page 35 of 64 -->

Mix Name Description Sampling Proportion

Naïve Sample each source in Table 1 equally.

 Web 83.5% Ð Code 13.8% ]  Ref. 2.5% [ Books 0.2%

 Web 100% Ð Code 100% ]  Ref. 100% [ Books 100%

Similar to Ayoola et al. (2022), we test a mixture that only uses web data.

Web Only

 Web 100% Ð Code 0% ]  Ref. 0% [ Books 0%

 Web 100% Ð Code 0% ]  Ref. 0% [ Books 0%

Reference+

 Web 81.2% Ð Code 13.5% ]  Ref. 4.9% [ Books 0.4%

 Web 100% Ð Code 100% ]  Ref. 200% [ Books 200%

It is common practice to upsamole knowledge- intensive documents when composing training mixture. In our case, we upsample the PeS2o papers, Wikipedia, Wikibooks, and Gutenberg books subsets by 2x.

Gopher-like

 Web 68.4% Ð Code 5.4% ]  Ref. 24.2% [ Books 2.0%

 Web 17% Ð Code 8% ]  Ref. 200% [ Books 200%

Following Rae et al. (2021), we create a mix that is heavily biased towards reference material. As we do not have access to the same sources, an exact replication of their mix is not possible.

Table 4: Overview of the mixtures and their composition.

C4 (100 Domains)

HumanEval

M2D2 (S2ORC)

40 Naïve Mix

50 Naïve Mix

80 Naïve Mix

40

70

Web Only Mix

Web Only Mix

Web Only Mix

30

60

30

Reference+ Mix

Reference+ Mix

Reference+ Mix

50

20

Gopher-like Mix

Gopher-like Mix

Gopher-like Mix

40

Perplexity

Perplexity

Perplexity

20

30

5 6 7 8 9 10

4

0 50B 100B

0 50B 100B

0 50B 100B 20

Total Tokens

Total Tokens

Total Tokens

Figure 12: 1B model ablations for different proportions of Dolma data. All mixture perform similarly on web data (left), while excluding code increases perplexity on code datasets (center). Finally, increasing reference material by upsampling papers and Wikipedia yields lower perplexity on S2ORC (right). Overall, source distribution is linked to downstream capabilities; thus, Dolma users should sample subsets according to their needs.

• GitHub. The name of the GitHub repository each document belongs to is included as metadata.

ments, forums, etc), academic articles, computer code from GitHub, encyclopedic content from Wikipedia, or Project Gutenberg books.

• Project Gutenberg. The title of each book is in- cluded as the first line of each document.

Are relationships between instances made explicit in the data?

Metadata for subsets of Dolma could be used to re- construct relationships between items:

• Wikipedia, Wikibooks. For both, metadata includes the URL corresponding to the page content was ex- tracted from. Structure and connections between doc- uments can be recovered through the URL.

How many instances of each type are there?

• Common Crawl. Each document uses the URL of the web page from which it was extracted as its identi- fier; therefore, it can be used to identify relationships between documents.

Summary statistics are reported in Table 1.

What data does each instance consist of? “Raw” data (e.g., unprocessed text or images)? Fea- tures/attributes?

• C4. The URL of each web page from which docu- ments were extracted is included as metadata; there- fore, it can be used to identify relationships between documents.

For each source, raw data is not available directly but could be recovered using source-specific methods:

• Reddit. The originating subreddits and thread ids of documents are included in the metadata.

• Common Crawl. We obtain data from common crawl snapshots from 2020-05 to 2023-06. WARC files from Common Crawl can be intersected with Dolma ids to recover original HTML files.

• Semantic Scholar. The id of each document is the Semantic Scholar Corpus ID of its corresponding manuscript. Metadata for each manuscript can be obtained using the Semantic Scholar APIs (Kinney et al., 2023).

• C4. We obtained this corpus from the Hugging Face

### 第 35 页中文译文

混合方案名称｜说明｜采样比例

**Naïve（朴素混合）**：对表 1 中每个来源进行等量采样。最终构成：网页 83.5%、代码 13.8%、参考资料 2.5%、书籍 0.2%；各来源采样权重均为 100%。

**Web Only（仅网页）**：类似 Ayoola 等人（2022），测试只使用网页数据的混合。最终构成：网页 100%、代码 0%、参考资料 0%、书籍 0%；网页采样权重 100%，其余均为 0%。

**Reference+（增强参考资料）**：构造训练混合时，对知识密集型文档进行上采样是一种常见做法。这里将 PeS2o 论文、Wikipedia、Wikibooks 和 Gutenberg 书籍子集上采样 2 倍。最终构成：网页 81.2%、代码 13.5%、参考资料 4.9%、书籍 0.4%；采样权重分别为 100%、100%、200%、200%。

**Gopher-like（类 Gopher）**：遵循 Rae 等人（2021），构造一个明显偏向参考资料的混合。由于无法获得相同来源，不能精确复现其混合方案。最终构成：网页 68.4%、代码 5.4%、参考资料 24.2%、书籍 2.0%；采样权重分别为 17%、8%、200%、200%。

表 4：各混合方案及其构成概览。

C4（100 个域名）｜HumanEval｜M2D2（S2ORC）。曲线分别为 Naïve、Web Only、Reference+ 与 Gopher-like；纵轴为困惑度，横轴为总词元数。

图 12：不同 Dolma 数据比例下的 10 亿参数模型消融。所有混合方案在网页数据上表现相近（左）；排除代码会提高代码数据集上的困惑度（中）；对论文和 Wikipedia 进行上采样、增加参考资料，会降低 S2ORC 上的困惑度（右）。总体而言，来源分布与下游能力有关，因此 Dolma 用户应依据自身需求抽取子集。

**实例之间的关系是否在数据中显式给出？**

Dolma 部分子集的元数据可用于重建条目之间的关系：

- **Common Crawl。** 每份文档以其来源网页 URL 为标识符，因此可以用来识别文档间关系。
- **C4。** 元数据包含每份文档来源网页的 URL，因此可以用来识别文档间关系。
- **Reddit。** 元数据包含文档来源的 subreddit 和主题串 ID。
- **Semantic Scholar。** 每份文档的 ID 是对应论文的 Semantic Scholar Corpus ID；可通过 Semantic Scholar API（Kinney 等，2023）取得每篇论文的元数据。
- **GitHub。** 元数据包含每份文档所属 GitHub 仓库的名称。
- **Project Gutenberg。** 每本书的书名作为文档首行。
- **Wikipedia、Wikibooks。** 二者元数据都包含所抽取页面内容对应的 URL，可以通过 URL 恢复文档结构与连接关系。

**每种类型有多少实例？**

汇总统计见表 1。

**每个实例由什么数据构成？是“原始”数据（如未经处理的文本或图像），还是特征/属性？**

各来源的原始数据并未直接提供，但可以采用来源特定的方法恢复：

- **Common Crawl。** 数据来自 2020-05 至 2023-06 的 Common Crawl 快照。可以将 Common Crawl 的 WARC 文件与 Dolma ID 求交，以恢复原始 HTML 文件。
- **C4。** 我们从 Hugging Face Hub 获取该语料；它源自 2019 年 4 月的一次 Common Crawl 快照。可使用 C4 中的 URL 恢复 HTML 文件。
<!-- page 36 of 64 -->

Hub22. In turn, documents in C4 have been derived from a Common Crawl snapshot for 04/2019. URLs in C4 can be used to recover HTML files.

• Reddit. Pushshift no longer distributes this dataset due to changes to the Reddit API’s terms. Unofficial copies of the data might be be available through tor- rents and some public web archives. Pushshift data dumps inherit25 the Terms of use of the Reddit API at the time of their collection (March 2023).

• Reddit. The complete set of monthly data dumps used in this work are no longer distributed by Pushshift, however they can still be obtained through torrents and some public web archives.

• Semantic Scholar. peS2o is derived from S2ORC (Lo et al., 2020). S2ORC is released through the Semantic Scholar Public API26 under ODC-By 1.0 (Open Data Commons, 2010).

• Semantic Scholar. peS2o is derived from S2ORC (Lo et al., 2020). Original parsed documents can be obtained from extracting documents in S2ORC that share the same ID with peS2o. Further, metadata in S2ORC can be used to obtain original PDF.

• GitHub. The filename and repository name, both available in metadata, can be used to recover original file contents.

• GitHub. The corpus is available on the Hugging Face Hub27 and consists of code released under a variety of permissive licenses. More details including terms of use for hosting or sharing the corpus are provided in the datacard at the link above.

• Project Gutenberg. The title of each book is the first line of each document.

• Project Gutenberg. Project Gutenberg consists of books that are not protected under U.S. copyright law. The corpus is available at gutenberg.org.

• Wikipedia, Wikibooks. For both, metadata includes the URL corresponding to the page content was ex- tracted from. Structure and connections between doc- uments can be recovered through the URL.

• Wikipedia, Wikibooks. Wikimedia data dumps are freely available28 and released under CC BY-SA 4.0 license (Creative Commons, 2013).

Are there recommended data splits or evaluation measures? (e.g., training, development, testing; ac- curacy/AUC)

Is there a label/target associated with instances? If the instances are related to people, are subpopula- tions identified (e.g., by age, gender, etc.) and what is their distribution?

No. See current manuscript Section §4.2.

What experiments were initially run on this dataset? Have a summary of those results and, if available, provide the link to a paper with more information here.

There are no labels associated with instances. Many text instances were likely created by people or groups of people, but in the vast majority of cases authorship infor- mation is unavailable let alone subpopulation metadata. we leave aggregation and reporting of these statistics to future work.

See current manuscript Section §4.2 for description of data ablation methodology, and remainder of paper for full set of experiments. Every experimental result is available through links provided in the manuscript.

N.3 Data Collection Process

Is everything included or does the data rely on ex- ternal resources? (e.g., websites, tweets, datasets) If external resources, a) are there guarantees that they will exist, and remain constant, over time; b) is there an official archival version. Are there licenses, fees or rights associated with any of the data?

How was the data collected? (e.g., hardware ap- paratus/sensor, manual human curation, software program, software interface/API; how were these constructs/measures/methods validated?)

The data are derived from the web and the original resources may not persist over time. However, each source represents an archival snapshot of that data that should remain fixed and available:

Data acquisition for each subset was performed as follows:

• Common Crawl. The Common Crawl data is avail- able on Amazon S3 as part of the Amazon Web Ser- vices’ Open Data Sponsorship program and can be freely downloaded23. We followed Common Crawl terms of use24.

• Common Crawl. snapshots were downloaded from Common Crawl’s official S3 bucket29 using the cc_net pipeline (Wenzek et al., 2020). Data was obtained between March 17th and March 27th, 2023.

25reddit.com/r/pushshift/comments/d6luj5/ comment/f0ugpqp

• C4. This corpus can be obtained from from the Hugging Face Hub22 and is released under ODC-By 1.0 (Open Data Commons, 2010).

22hf.co/datasets/allenai/c4 23commoncrawl.org/the-data/get-started 24commoncrawl.org/terms-of-use

26semanticscholar.org/product/api 27hf.co/datasets/bigcode/the-stack-dedup 28dumps.wikimedia.org 29s3://commoncrawl/

### 第 36 页中文译文

- **C4。** 该语料可从 Hugging Face Hub 获取，并以 ODC-By 1.0（Open Data Commons，2010）发布。
- **Reddit。** Pushshift 因 Reddit API 条款变更而不再分发此数据集。数据的非官方副本可能仍能通过种子文件和部分公共网页存档获得。Pushshift 数据转储沿用其收集时（2023 年 3 月）的 Reddit API 使用条款。
- **Semantic Scholar。** peS2o 派生自 S2ORC（Lo 等，2020）。S2ORC 通过 Semantic Scholar Public API 发布，采用 ODC-By 1.0 许可。
- **GitHub。** 该语料可在 Hugging Face Hub 获取，包含以多种宽松许可证发布的代码。包括托管或共享条款在内的更多信息见该链接的数据卡。
- **Project Gutenberg。** Project Gutenberg 收录不受美国版权法保护的书籍，语料可从 `gutenberg.org` 获取。
- **Wikipedia、Wikibooks。** Wikimedia 数据转储可免费获得，并以 CC BY-SA 4.0 许可发布。

**是否推荐数据划分或评估指标（如训练/开发/测试，准确率/AUC）？**

没有。见本文 §4.2。

**最初在该数据集上运行了哪些实验？请概述结果，并在可能时提供包含更多信息的论文链接。**

数据消融方法见本文 §4.2，其余章节提供完整实验。每项实验结果均可通过论文所给链接获得。

**数据集是否完整包含所有内容，还是依赖外部资源？如果依赖外部资源：（a）能否保证其长期存在且保持不变；（b）是否有正式存档版本；相关数据是否有许可证、费用或权利限制？**

数据来源于网络，原始资源可能不会永久存在。不过，每个来源都代表一个固定且应能持续获取的存档快照：

- **Common Crawl。** 数据通过 Amazon Web Services 开放数据赞助计划存放于 Amazon S3，可免费下载；我们遵循 Common Crawl 使用条款。
- **C4。** 可从 Hugging Face Hub 获取，并以 ODC-By 1.0 发布。
- **Reddit。** 本研究所用完整月度转储不再由 Pushshift 分发，但仍可能通过种子文件和部分公共网页存档获得。
- **Semantic Scholar。** peS2o 源自 S2ORC；可提取与 peS2o 共享相同 ID 的 S2ORC 文档以恢复原始解析文档，还可利用 S2ORC 元数据取得原始 PDF。
- **GitHub。** 元数据提供文件名和仓库名，可据此恢复原始文件内容。
- **Project Gutenberg。** 每本书的首行是书名。
- **Wikipedia、Wikibooks。** 元数据包含对应页面 URL，可通过 URL 恢复文档结构与连接关系。

**实例是否有关联标签/目标？若实例涉及人，是否标识了年龄、性别等子群体及其分布？**

实例没有关联标签。许多文本实例很可能由个人或群体创作，但绝大多数情况下连作者信息都无法获得，更不用说子群体元数据。我们将这些统计的汇总与报告留待未来工作。

### N.3 数据收集过程

**数据如何收集？相关构造、测量或方法如何验证？**

各子集的获取方式如下：

- **Common Crawl。** 使用 cc_net 流水线（Wenzek 等，2020），从 Common Crawl 官方 S3 存储桶下载快照。数据获取时间为 2023 年 3 月 17 日至 27 日。
- **C4。** 使用带 Git-LFS 扩展的 Git 从 Hugging Face Hub 克隆 C4；仓库克隆于 2023 年 5 月 24 日。

脚注链接保持原文：22 `hf.co/datasets/allenai/c4`；23 `commoncrawl.org/the-data/get-started`；24 `commoncrawl.org/terms-of-use`；25 Reddit/Pushshift 说明；26 Semantic Scholar API；27 The Stack 数据集；28 Wikimedia 转储；29 `s3://commoncrawl/`。
<!-- page 37 of 64 -->

• C4. We clone C4 from the Hugging Face Hub22 using Git with the Git-LFS extension. Repository cloned on May 24th, 2023.

sampling strategy (e.g., deterministic, probabilistic with specific sampling probabilities)? Is the sample representative of the larger set (e.g., geographic cov- erage)? If not, why not (e.g., to cover a more diverse range of instances)? How does this affect possible uses?

Sampling for each subset was performed as follows:

• Reddit. Reddit was acquired in the form of monthly data dumps of comments and submissions collected and distributed by the Pushshift project30. We used the complete set of 422 publicly available dumps (208 comments, 214 submissions) spanning a period from 06/2005–03/2023. The majority of Dumps were acquired in March, 2023 with the last dumps down- loaded in May of 2023.

• Common Crawl. Common Crawl is not a representative sample of the web. Summary statistics about Common Crawl are reported through the cc-crawl-statistics (Com- mon Crawl, 2016) project, available at commoncrawl.github.io/cc-crawl-statistics. Dolma uses Common Crawl snapshots from 2020-05 to 2023-0632.

• Semantic Scholar. We clone peS2o from the Hug- ging Face Hub31 using Git with the Git-LFS exten- sion. We use pes2o V2. Repository cloned on June 30th, 2023.

• C4. We use C4 in its entirety.

• Reddit. We use all available Reddit content from from 06/2005–03/2023.

• GitHub. We clone The Stack (deduplicated) from the Hugging Face Hub27 using Git with the Git-LFS extension. Repository cloned on May 28th, 2023.

• GitHub. We use The Stack (deduplicated) in its entirety.

• Semantic Scholar. We use pes2o V2 in its entirety.

• Project Gutenberg. Data was downloaded directly from gutenberg.org. We used GutenbergPy (Ange- lescu, Radu, 2013) to extract books. Website accessed on April 3rd, 2023.

• Project Gutenberg. We process all Gutenberg books.

• Wikipedia, Wikibooks. Dumps were downloaded from Wikimedia’s website28. We use the dump from March 20th, 2023.

• Wikipedia, Wikibooks. We use the English and Simple subset of Wikipedia and Wikibooks in their entirety.

Who was involved in the data collection process? (e.g., students, crowdworkers) How were they com- pensated? (e.g., how much were crowdworkers paid?)

Is there information missing from the dataset and why? (this does not include intentionally dropped instances; it might include, e.g., redacted text, with- held documents) Is this data missing because it was unavailable?

Data was collected and postprocessed by full-time employees at the Allen Institute for AI. No instances in this dataset are manually annotated.

Over what time-frame was the data collected? Does the collection time-frame match the creation time- frame?

Common Crawl is the only source we did not use in its entirety. We use only about a quarter of all snapshots available. This amount was deemed sufficient for the goal of the Dolma project. We decided to use the 24 most recent Common Crawl snapshots at the time.

Please see list above.

Are there any known errors, sources of noise, or redundancies in the data?

How was the data associated with each instance ac- quired? Was the data directly observable (e.g., raw text, movie ratings), reported by subjects (e.g., sur- vey responses), or indirectly inferred/derived from other data (e.g., part of speech tags; model-based guesses for age or language)? If the latter two, were they validated/verified and if so how?

Not that we are aware of, although a negligible por- tion of Common Crawl data could have been lost due to network issues with S3 storage. When accessing Common Crawl, we implemented retry mechanisms, but copy could have failed due to exceeding the retry limits.

Any metadata associated with each instance was ob- tained directly from each source.

N.4 Data Preprocessing

Does the dataset contain all possible instances? Or is it, for instance, a sample (not necessarily random) from a larger set of instances? If the dataset is a sample, then what is the population? What was the

What preprocessing/cleaning was done? (e.g., discretization or bucketing, tokenization, part-of- speech tagging, SIFT feature extraction, removal of instances, processing of missing values, etc.)

30files.pushshift.io/reddit/submissions and files.pushshift.io/reddit/comments

31hf.co/datasets/allenai/peS2o

32Common Crawl snapshots follow naming convention xxxx-yy, where xxxx is the year the snapshot was finalized, and yy is the week, ranging from 01 to 52.

### 第 37 页中文译文

- **C4。** 使用带 Git-LFS 扩展的 Git 从 Hugging Face Hub 克隆 C4；仓库克隆于 2023 年 5 月 24 日。
- **Reddit。** 获取的是 Pushshift 项目收集并发布的评论与投稿月度数据转储。我们使用了从 2005 年 6 月至 2023 年 3 月全部 422 份公开转储（208 份评论、214 份投稿）。大部分转储于 2023 年 3 月获取，末尾一批于 2023 年 5 月下载。
- **Semantic Scholar。** 使用带 Git-LFS 的 Git 从 Hugging Face Hub 克隆 peS2o，采用 peS2o V2；仓库克隆于 2023 年 6 月 30 日。
- **GitHub。** 使用带 Git-LFS 的 Git 从 Hugging Face Hub 克隆 The Stack（去重版）；仓库克隆于 2023 年 5 月 28 日。
- **Project Gutenberg。** 数据直接从 `gutenberg.org` 下载，并使用 GutenbergPy（Angelescu, Radu，2013）提取书籍；网站访问于 2023 年 4 月 3 日。
- **Wikipedia、Wikibooks。** 从 Wikimedia 网站下载数据转储，采用 2023 年 3 月 20 日的转储。

**谁参与了数据收集？他们如何获得报酬？**

数据由艾伦人工智能研究所的全职员工收集并后处理。本数据集没有任何实例由人工标注。

**数据在什么时间范围内收集？收集时间与内容创建时间是否一致？**

请参见上方列表。

**与每个实例相关的数据如何取得？是直接观察、由主体报告，还是从其他数据间接推断？若属于后两者，是否进行了验证？**

与各实例相关的所有元数据均直接取自相应来源。

**数据集是否包含所有可能实例，还是更大集合中的样本？若是样本，总体是什么、采用何种采样策略、是否具有代表性？这会如何影响可能用途？**

各子集的采样方式如下：

- **Common Crawl。** Common Crawl 并非互联网的代表性样本。其汇总统计由 `cc-crawl-statistics` 项目报告，可在 `commoncrawl.github.io/cc-crawl-statistics` 查看。Dolma 使用 2020-05 至 2023-06 的 Common Crawl 快照。
- **C4。** 使用完整 C4。
- **Reddit。** 使用 2005 年 6 月至 2023 年 3 月所有可用 Reddit 内容。
- **GitHub。** 使用完整的 The Stack（去重版）。
- **Semantic Scholar。** 使用完整 peS2o V2。
- **Project Gutenberg。** 处理全部 Gutenberg 书籍。
- **Wikipedia、Wikibooks。** 使用完整的英语版和简单英语版 Wikipedia 与 Wikibooks 子集。

**数据集中是否存在缺失信息，原因是什么？**

Common Crawl 是唯一未被完整使用的来源。我们只采用全部可用快照的大约四分之一，认为这足以满足 Dolma 项目目标，因此选择了当时最新的 24 份 Common Crawl 快照。

**是否存在已知错误、噪声来源或冗余？**

据我们所知没有，不过因 S3 存储网络问题，极少量 Common Crawl 数据可能丢失。访问 Common Crawl 时虽实现了重试机制，但复制操作仍可能因超过重试上限而失败。

### N.4 数据预处理

**进行了哪些预处理或清洗？**

脚注：30 为 Pushshift 投稿与评论文件地址；31 为 peS2o 数据集地址；32 Common Crawl 快照以 `xxxx-yy` 命名，其中 `xxxx` 为快照完成年份，`yy` 为第 01 至 52 周。
<!-- page 38 of 64 -->

– Fraction of characters in duplicate ngrams

greater than a threshold36

All data sources are filtered using FastText language identification models (Joulin et al., 2016a,b) with an English threshold of 0.5.

– Contains fewer than 50 or more than 100K

words – Median word length is less than 3 or greater than

For the Common Crawl and C4 subsets, we use the following filters that substantially modify the original data. Note that data might be tagged for removal by one or more filter.

10 – Symbol to word ratio greater than 0.10 – Fraction of words with alpha character less than

0.80 – Contains fewer than 2 of a set of required

• Only Common Crawl, as part of their distribution pipeline: Linearize all HTML into plain text files (WET files generation24);

words37

– Fraction of lines in document starting with bullet

point greater than 0.90 – Fraction of lines in document ending with ellip-

sis greater than 0.30 – Fraction of lines in document that are duplicated

greater than 0.30 – Fraction of characters in duplicated lines greater

than 0.30

• Quality filter34: Remove any document that contains a token or sequence of tokens repeating over 100 times38 (0.003% of characters tagged for removal);

• Only Common Crawl, as part of CCNet pipeline: We remove frequently occurring paragraph in Com- mon Crawl by identifying repeated paragraphs on small subsets of each snapshots. This step gets rid of headers that are shared across many pages, such as navigational headers. Removal is operationalized as follows: given 1 . . . , n, . . . , N shards each snapshot is comprised to, group shards in sets S = {n −k, n}; then, remove exact duplicates of paragraphs in S. Paragraphs are defined as newline-separated slices of documents, and compared using their SHA1. We choose k such that each set is at most 20GB33. (ap- proximately 70% of paragraph removed);

• Only Common Crawl, deduplication by URL: We deduplicate pages by URL (53% of duplicates re- moved);

• Content filter: Remove sentences that get ranked as toxic by a FastText classifier (score above 0.4). We train a bigram classifier on the Jigsaw dataset (cjadams et al., 2017) (1.01% of data tagged for removal);

• Language identification: remove all documents with an English score lower than 0.5, as determined by FastText language identification models (Joulin et al., 2016a,b) (removed 61.69% of web pages by size);

• Content filter: Mask Personal Identifiable Infor- mation (PII) using regular expressions that identify emails, phone numbers, and IP addresses; pages con- taining 6 or more PIIs are completely removed from the corpus (0.05% tagged for masking, 0.11% tagged for removal);

• Quality filter34: Remove documents with more than half of their line not ending in “.”, “?”, “!”, or “"”. (22.73% of characters tagged for removal);

• Quality filter34: Remove any document that does not pass any of the Gopher rules (Rae et al., 2021) (15.23% of characters tagged for removal);

• Exact document deduplication: duplicate docu- ments the same text. No punctuation or whitespace is removed. Empty documents count as duplicates (14.9% of documents tagged for removal).

– Fraction of characters in most common ngram

greater than a threshold35

• Only Common Crawl, deduplication by paragraph: We deduplicate the web subset at a paragraph level using a Bloom filter (19.1% of UTF-8 characters tagged for removal).

For the Reddit subset, we use the following filters that substantially reduce the original data.

33This is a slight modification of the original CCNet pipeline, where k is chose so that each set is 2% of snapshot. We chose to use a fixed shard size, rather an a percentage of the corpus, because fixed size is more predictable in terms of resource usage, leading to less-error prone code. Concep- tually it’s equivalent to putting a threshold on the absolute probability of a paragraph occurring

• Language identification: remove all documents with an English score lower than 0.5, as determined by a FastText language identification model.

36For 5-grams, 0.15. For 6-grams, 0.14. For 7-grams, 0.13. For 8-grams, 0.12. For 9-grams, 0.11. For 10-grams, 0.10.

34The term “quality filter”, while widely used in literature, does not appropriately describe the outcome of filtering a dataset. Quality might be perceived as a comment on the informativeness, comprehensiveness, or other characteristics valued by humans. However, the filters used in Dolma and other language models efforts select text according to criteria that are inherently ideological (Gururangan et al., 2022).

35For bigrams, threshold of 0.20. For trigrams, 0.18. For 4-grams, 0.16.

37“the”, “be”, “to”, “of”, “and”, “that”, “have”, “with” 38We use allenai/gpt-neox-olmo-dolma-v1\_5 to ob- tain tokens.

### 第 38 页中文译文

所有数据来源均使用 FastText 语言识别模型（Joulin 等，2016a、2016b）过滤，英语阈值为 0.5。

对于 Common Crawl 和 C4 子集，我们采用以下会显著改变原始数据的过滤器。一份数据可能被一个或多个过滤器标记为删除。

- **仅 Common Crawl，在其分发流水线中：** 将所有 HTML 线性化为纯文本文件（生成 WET 文件）。
- **仅 Common Crawl，在 CCNet 流水线中：** 通过在每个快照的小型子集中识别重复段落，删除 Common Crawl 中频繁出现的段落。这会去除许多页面共享的导航页眉等内容。具体操作如下：假设每个快照由编号 1…n…N 的分片组成，把分片组成集合 $S=\{n-k,n\}$，然后删除 S 中完全重复的段落。段落定义为由换行符分隔的文档切片，并通过 SHA1 比较。选择 k，使每个集合最多为 20GB（约删除 70% 的段落）。
- **仅 Common Crawl，按 URL 去重：** 按 URL 对页面去重（删除 53% 的重复项）。
- **语言识别：** 根据 FastText 语言识别模型，移除英语得分低于 0.5 的全部文档（按大小计，移除 61.69% 的网页）。
- **质量过滤器：** 移除超过一半行末尾并非句号、问号、感叹号或引号的文档（标记删除 22.73% 的字符）。
- **质量过滤器：** 移除不满足任一 Gopher 规则（Rae 等，2021）的文档（标记删除 15.23% 的字符）。规则包括：最常见 n-gram 的字符占比超过阈值；重复 n-gram 的字符占比超过阈值；少于 50 词或多于 10 万词；词长中位数小于 3 或大于 10；符号与词的比率大于 0.10；包含字母字符的词占比小于 0.80；指定常用词集合中出现少于 2 个；以项目符号开头的行占比大于 0.90；以省略号结尾的行占比大于 0.30；重复行占比大于 0.30；重复行字符占比大于 0.30。
- **质量过滤器：** 移除任何包含某个词元或词元序列重复超过 100 次的文档（标记删除 0.003% 的字符）。
- **内容过滤器：** 移除被 FastText 分类器评为有毒的句子（得分高于 0.4）。我们在 Jigsaw 数据集（cjadams 等，2017）上训练二元分类器（标记删除 1.01% 的数据）。
- **内容过滤器：** 使用正则表达式识别电子邮件、电话号码和 IP 地址并遮盖个人身份信息（PII）；包含 6 个或更多 PII 的页面从语料中整页移除（0.05% 被标记遮盖，0.11% 被标记删除）。
- **精确文档去重：** 对文本完全相同的文档去重，不移除标点或空白；空文档也计为重复（14.9% 的文档被标记删除）。
- **仅 Common Crawl，按段落去重：** 使用布隆过滤器在段落层面对网页子集去重（标记删除 19.1% 的 UTF-8 字符）。

Reddit 子集采用以下会显著缩减原始数据的过滤器：

- **语言识别：** 根据 FastText 语言识别模型，删除英语得分低于 0.5 的所有文档。

脚注 33：这是对原始 CCNet 流水线的轻微修改。原流程选择 k 使每个集合占快照的 2%；我们采用固定分片大小而非语料百分比，因为固定大小的资源使用更可预测、代码更不易出错。概念上，这等价于对段落出现的绝对概率设置阈值。

脚注 34：“质量过滤器”虽在文献中广泛使用，却不能恰当地描述数据集过滤结果。“质量”容易被理解为对信息量、完整性或其他人类看重属性的评价；然而 Dolma 及其他语言模型项目所用过滤器依据的标准本质上具有意识形态色彩（Gururangan 等，2022）。

脚注 35：二元组阈值 0.20，三元组 0.18，四元组 0.16。脚注 36：五至十元组阈值依次为 0.15、0.14、0.13、0.12、0.11、0.10。脚注 37：指定词为 `the, be, to, of, and, that, have, with`。脚注 38：使用 `allenai/gpt-neox-olmo-dolma-v1_5` 获得词元。
<!-- page 39 of 64 -->

• Quality filter34: Remove comments and submissions shorter than 500 characters in length.

• Email addresses: [.\s@,?!;:)(]*([\^\s@]+@[\^\s@,?!;:) (]+?)[.\s@,?!;:)(]?[\s\n\r]

• Quality filter34: Remove user comments with fewer than three upvotes (Reddit users vote on the quality of submissions and comments).

• IP addresses: \s+\(?(\d{3})\)?[-\. ]*(\d{3})[-. ]?(\d{4})

• Content filter34: Remove comments and submis- sions from banned, toxic, or NSFW subreddits.

• Phone numbers: (?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9] {1,2})\.){3}(?:25[0-5]|2[0-4][0-9]|

[01]?[0-9]{1,2})

• Content filter34: Remove sentences that get ranked as toxic or as hatespeech by a FastText classifier (score above 0.4).

For the Wikipedia and Wikibooks subsets, we re- move pages that contain fewer than 25 UTF-8 words.

For the Gutenberg subset:

• Content filter: Mask Personal Identifiable Infor- mation (PII) using regular expressions that identify emails, phone numbers, and IP addresses

• Deduplication: We deduplicate comments and sub- missions (jointly) at a paragraph level using a Bloom filter.

• Language identification: for each paragraph (de- fined as newline-separated spans of text), we use Fast- Text to perform language identification. Then, we compute the average language score by averaging the score for all passages. If a document has a language score lower than 0.5, it is discarded;

For the code subset derived from The Stack (dedupli- cated), we use the following filters:

• Quality filter34: we remove pages that contain fewer than 25 UTF-8 words;

• Language filter: Removed files associated with the following programming languages:

– Data or numerical content: csv, json, json5,

• Quality filter34: Remove any document that contains a token or sequence of tokens repeating over 100 times38.

jsonld, jsoniq, svg – Assembly code: assembly

For the Semantic Scholar subset, we remove any document that contains a token or sequence of tokens repeating over 100 times38 .

• Quality filter34: Removed copyright statements in code files from document preamble39;

• Quality filter34: Removed documents matching any of the RedPajama v1 (Together Computer, 2023a) code filters (41.49% of data tagged for removal):

For Dolma versions 1.0 and 1.5, we perform decon- tamination for all subsets of Dolma. In particular, we remove paragraphs that are shared with documents in the Paloma evaluation suite (Magnusson et al., 2023). Overall, only 0.003% of our dataset is removed due to contamination with this evaluation set. Dolma version 1.6 is not decontaminated.

– Maximum line length > 1000 characters. – Average line length > 100 characters. – Proportion of alpha-numeric characters < 0.25. – Ratio of alphabetical characters to number of

tokens < 1.540.

Was the “raw” data saved in addition to the prepro- cessed/cleaned data? (e.g., to support unanticipated future uses)

• Quality filter34: Removed documents matching any of the following Starcoder filters (Li et al., 2023b):

Raw data is available for all subsets except Common Crawl. Due to space constrains, we only keep linearized version of Common Crawl snapshots, filtered by Lan- guage ID as described above.

– Contains XML template code. – HTML code-to-text ratio <= 0.2. – Java, Javascript, Python code-to-comment ratio

<= 0.01 or > 0.8.

Raw data is not available for download outside the Allen Institute for AI. Interested individuals may contact authors of this manuscript if they require access to raw data.

Is the preprocessing software available?

Yes, all preprocessing software is available on GitHub at github.com/allenai/dolma and on PyPI41.

• Content filter: Mask Personal Identifiable Infor- mation (PII) using regular expressions that identify emails, phone numbers, and IP addresses; pages con- taining 6 or more PIIs are completely removed from the corpus.

The Common Crawl, C4, Reddit, and Code subsets used the same regular expressions for identifying PII:

Does this dataset collection/processing procedure achieve the motivation for creating the dataset stated in the first section of this datasheet?

Yes, it does.

41pypi.org/project/dolma

39Code license and provenance is still tracked in metadata. 40Tokens counted using whitespace tokenizer

### 第 39 页中文译文

- **质量过滤器：** 移除长度少于 500 字符的评论与投稿。
- **质量过滤器：** 移除赞成票少于 3 的用户评论（Reddit 用户会对投稿与评论的质量投票）。
- **内容过滤器：** 移除来自被封禁、有毒或 NSFW 子版块的评论与投稿。
- **内容过滤器：** 移除被 FastText 分类器评为有毒或仇恨言论的句子（得分高于 0.4）。
- **内容过滤器：** 使用正则表达式识别电子邮件、电话号码和 IP 地址并遮盖 PII。
- **去重：** 使用布隆过滤器，对评论和投稿合并进行段落级去重。

对于源自 The Stack（去重版）的代码子集，我们采用以下过滤器：

- **语言过滤器：** 移除与下列编程语言关联的文件：数据或数值内容（csv、json、json5、jsonld、jsoniq、svg）；汇编代码（assembly）。
- **质量过滤器：** 从文档前言中移除代码文件里的版权声明。
- **质量过滤器：** 移除匹配 RedPajama v1（Together Computer，2023a）任一代码过滤规则的文档（41.49% 的数据被标记删除）：最大行长大于 1000 字符；平均行长大于 100 字符；字母数字字符占比小于 0.25；字母字符数与词元数之比小于 1.5。
- **质量过滤器：** 移除匹配 StarCoder（Li 等，2023b）任一规则的文档：包含 XML 模板代码；HTML 代码文本比不高于 0.2；Java、JavaScript、Python 的代码注释比不高于 0.01 或高于 0.8。
- **内容过滤器：** 使用正则表达式识别电子邮件、电话号码和 IP 地址并遮盖 PII；包含 6 个或更多 PII 的页面整页移除。

Common Crawl、C4、Reddit 和代码子集使用相同的 PII 正则表达式：电子邮件地址、IP 地址和电话号码的具体表达式保持见英文原文。

Wikipedia 和 Wikibooks 子集移除少于 25 个 UTF-8 词的页面。

对于 Gutenberg 子集：

- **语言识别：** 对每个由换行分隔的文本段落使用 FastText 识别语言，然后对所有段落得分求平均；文档语言得分低于 0.5 时丢弃。
- **质量过滤器：** 移除少于 25 个 UTF-8 词的页面。
- **质量过滤器：** 移除任何含有某个词元或词元序列重复超过 100 次的文档。

对于 Semantic Scholar 子集，移除任何含有某个词元或词元序列重复超过 100 次的文档。

Dolma 1.0 和 1.5 对所有子集执行去污染，具体做法是移除与 Paloma 评测套件（Magnusson 等，2023）文档共享的段落。总体仅有 0.003% 的数据因与该评测集污染而删除。Dolma 1.6 未执行去污染。

**除预处理/清洗数据外，是否保存了“原始”数据？**

除 Common Crawl 外，所有子集都有原始数据。由于存储空间限制，我们仅保留 Common Crawl 快照经过线性化并按上述语言识别方法过滤后的版本。

原始数据不对艾伦人工智能研究所以外提供下载。需要访问原始数据者可联系本文作者。

**预处理软件是否可用？**

可用。全部预处理软件发布于 `github.com/allenai/dolma` 和 PyPI。

**数据收集/处理流程是否达成数据说明表首节所述的创建动机？**

是。

脚注 39：代码许可证和来源信息仍在元数据中追踪。脚注 40：词元使用空白分词器计数。脚注 41：`pypi.org/project/dolma`。
<!-- page 40 of 64 -->

N.5 Dataset Distribution

How is the dataset distributed? (e.g., website, API, etc.; does the data have a DOI; is it archived redun- dantly?)

If others want to extend/augment/build on this dataset, is there a mechanism for them to do so? If so, is there a process for tracking/assessing the quality of those contributions. What is the process for communicating/distributing these contributions to users?

Dolma is distributed via the Hugging Face Hub, which offers access via the datasets (Lhoest et al., 2021) Python package, direct download, and Git using the Git-LFS extension. Additionally, a copy is stored on the cloud storage of the Allen Institute for AI.

Creation and distribution of derivatives is described above. In case contributors want to flow their improve- ment back to future Dolma releases, they should contact corresponding authors of this manuscript.

N.7 Legal & Ethical Considerations

When will the dataset be released/first distributed? (Is there a canonical paper/reference for this dataset?)

The dataset is available now. This manuscript serves as a reference for the dataset.

If the dataset relates to people (e.g., their attributes) or was generated by people, were they informed about the data collection? (e.g., datasets that collect writing, photos, interactions, transactions, etc.)

What license (if any) is it distributed under? Are there any copyrights on the data?

Subsets of Dolma derived from web data are likely created by people or groups of people, however author- ship information is often unavailable.

Information about the license associated with Dolma are available on its release page on the Hugging Face Hub: huggingface.co/datasets/allenai/dolma.

Are there any fees or access/export restrictions?

The dataset is distributed for free. Users should verify any restrictions on its release page on the Hugging Face Hub: huggingface.co/datasets/allenai/dolma.

N.6 Dataset Maintenance

Authors were not directly informed about the data col- lection. For encyclopedic and web content, logs of web servers will contain records of spiders ran by Common Crawl. For academic content, the pes2o subset (Sol- daini and Lo, 2023) is derived from manuscripts that are licensed for permissive distribution by their authors. Reddit content was acquired through a public API ad- herent to terms of service; individual authors of Reddit posts were not contacted directly. Finally, the Allen Institute for AI did not contact Project Gutenberg.

Who is supporting/hosting/maintaining the dataset? How does one contact the owner/curator/manager of the dataset (e.g. email address, or other contact info)?

If it relates to other ethically protected subjects, have appropriate obligations been met? (e.g., medical data might include information collected from ani- mals)

The Allen Institute for AI maintains the dataset. For support questions, users are invited to open an issue on GitHub42 or on the community tab of dataset page43

(the former being preferred over the latter). Any other inquiry should be sent to ai2-info@allenai.org.

Due to the nature of and size of Dolma, it is impossi- ble to determine which obligations, if any, are appropri- ate.

Will the dataset be updated? How often and by whom? How will updates/revisions be documented and communicated (e.g., mailing list, GitHub)? Is there an erratum?

Dataset will be uploaded on a need-to basis by main- tainers at the Allen Institute for AI. Newer version of the dataset will be labeled accordingly. The latest ver- sion of the dataset, as well as a changelog, will be made available starting from the first revision.

If it relates to people, were there any ethical review applications/reviews/approvals? (e.g. Institutional Review Board applications) If it relates to people, were they told what the dataset would be used for and did they consent? What community norms exist for data collected from human communications? If consent was obtained, how? Were the people pro- vided with any mechanism to revoke their consent in the future or for certain uses?

If the dataset becomes obsolete how will this be com- municated? Is there a repository to link to any/all papers/systems that use this dataset?

The Dolma project includes Ethics committee com- prised of internal and external members to the Allen Institute for AI. Plans for the creation of Dolma were reviewed with the committee, and we incorporated their recommendations.

Following practices established in similar efforts, no consent was collected from individuals who might be represented in the dataset. We make available a form44

Users should keep track of the version of the dataset in use. Information about latest version of Dolma are available on its release page on the Hugging Face Hub: huggingface.co/datasets/allenai/dolma. Dolma users should cite this manuscript when using this data.

for individuals who wish to be removed from the dataset.

42github.com/allenai/dolma/issues 43hf.co/datasets/allenai/dolma/discussions

44forms.gle/q4BNUUxUxKwKkfdT6

### 第 40 页中文译文

### N.5 数据集分发

**数据集如何分发？是否有 DOI，是否有冗余存档？**

Dolma 通过 Hugging Face Hub 分发，可通过 `datasets`（Lhoest 等，2021）Python 包、直接下载以及带 Git-LFS 扩展的 Git 访问。此外，艾伦人工智能研究所的云存储中也保存了一份副本。

**数据集何时发布或首次分发？是否有标准论文/参考文献？**

数据集现已可用，本文即为该数据集的参考文献。

**以何种许可证分发？数据是否受版权保护？**

Dolma 相关许可证信息见 Hugging Face Hub 发布页：`huggingface.co/datasets/allenai/dolma`。

**是否收取费用，或存在访问/出口限制？**

数据集免费分发。用户应在 Hugging Face Hub 发布页核实所有限制。

### N.6 数据集维护

**谁支持、托管和维护该数据集？如何联系所有者、策展者或管理者？**

数据集由艾伦人工智能研究所维护。支持问题请优先在 GitHub 提交 issue，也可在数据集页面的社区标签页提出；其他咨询发送至 `ai2-info@allenai.org`。

**数据集会更新吗？由谁以何种频率更新？如何记录并传播更新或修订，是否有勘误？**

艾伦人工智能研究所的维护者将按需上传数据集。新版本会相应标记；从第一次修订开始，最新版本与变更日志都会公开。

**若数据集过时，将如何通知？是否有仓库关联所有使用该数据集的论文或系统？**

用户应记录所用数据集版本。Dolma 最新版本信息见 Hugging Face Hub 发布页。使用者应引用本文。

**若他人希望扩展、增强或基于本数据集构建，是否有相应机制？是否会追踪和评估贡献质量，如何向用户传播这些贡献？**

衍生数据的创建与分发方式如上所述。希望把改进反馈到未来 Dolma 版本的贡献者，应联系本文通讯作者。

### N.7 法律与伦理考量

**若数据集涉及人或由人生成，他们是否被告知数据收集？**

Dolma 中源自网页的数据子集很可能由个人或群体创作，但作者信息通常不可获得。

作者没有被直接告知数据收集。对于百科和网页内容，网页服务器日志会留下 Common Crawl 爬虫记录。对于学术内容，peS2o 子集（Soldaini 和 Lo，2023）源自作者许可宽松分发的论文。Reddit 内容通过遵守服务条款的公共 API 获取，没有逐一联系帖子作者。艾伦人工智能研究所也未联系 Project Gutenberg。

**若涉及其他受伦理保护的主体，是否履行了适当义务？**

由于 Dolma 的性质与规模，无法确定哪些义务适用。

**若涉及人，是否进行过伦理审查或审批？他们是否被告知用途并表示同意？对于人类通信数据存在哪些社区规范，是否提供日后撤回同意的机制？**

Dolma 项目设有由艾伦人工智能研究所内部和外部成员组成的伦理委员会。Dolma 创建计划经过该委员会审查，我们采纳了其建议。

遵循类似项目的既有做法，我们没有向可能出现在数据集中的个人收集同意。我们提供表单，供希望从数据集中移除自身相关内容的个人提交申请。

脚注 42：`github.com/allenai/dolma/issues`；脚注 43：`hf.co/datasets/allenai/dolma/discussions`；脚注 44：`forms.gle/q4BNUUxUxKwKkfdT6`。
<!-- page 41 of 64 -->

to contact us to have text from or about them removed from our corpus44.

If it relates to people, could this dataset expose people to harm or legal action? (e.g., financial social or otherwise) What was done to mitigate or reduce the potential for harm?

Does the dataset contain information that might be considered sensitive or confidential? (e.g., personally identifying information) Does the dataset contain information that might be considered inappropriate or offensive?

Dolma contains text instances that have been derived from web pages Common Crawl crawled from the web. Content might contain sensitive information including personal information, or financial information users of the web chose to put publicly online. This data is taken only from public places, so the same data is or has been accessible via browsing the web. We have measured a variety of types of personal information, and built tools specifically to remove some types of sensitive information, and through our license we restrict what users can do with this data.

This datasets contains text that was derived from web paged scraped by Common Crawl from the web. There- fore, it can contain text posted on public websites by creators on the internet. If an author publicly posted personal information or offensive content, it could be included in this dataset. We took reasonable steps to remove types of personal information that were possi- ble to reliably detect. We also removed documents that contained sentences that were classified as being toxic.

We recommend individuals to submit a request using through our form44 if they wish their information to be removed.

O All Raw Ablation Results

O.1 Comparing Dolma With Other Corpora

4chan

If it relates to people, does it unfairly advantage or disadvantage a particular social group? In what ways? How was this mitigated?

40 Red Pajama v1

Pile

C4

mC4 (English)

RefinedWeb

30

Dolma v1.5

20

Perplexity

10

0 20B 40B 60B 80B 100B 120B 140B

Total Tokens

WikiText-103

Red Pajama v1

Pile

C4

30

mC4 (English)

RefinedWeb

Dolma v1.5

Dolma is not a representative sample of none of its sources. It might underrepresent or overrepresent some communities on the internet; further, papers in the peS2o subset are skewed towards STEM disciplines; books in the Gutenberg library are mostly from the public domain (at the time of publication, books published before 1927); finally, the English and Simple subset of Wikipedia and Wikibooks might be biased towards events and people from the global north.

20

Perplexity

We did not attempt to alter distribution of social groups in Dolma. Large-scale interventions to correct societal biases in large datasets remain challenging, and are left to future work.

0 20B 40B 60B 80B 100B 120B 140B

Total Tokens

Pile

Red Pajama v1

Pile

30

C4

mC4 (English)

RefinedWeb

Dolma v1.5

20

If it relates to people, were they provided with pri- vacy guarantees? If so, what guarantees and how are these ensured?

Perplexity

10

9

8

0 20B 40B 60B 80B 100B 120B 140B

Total Tokens

This datasets contains text that was derived from web paged scraped by Common Crawl from the web. For much of that data it’s not possible identify the authors. In many instances, creators purposely choose to post anonymously online, so aiming to infer authorship can be ethically fraught. We provide access to our data, and encourage any creators that would likely to have data from or about them removed to reach out.

Figure 13: Perplexity results on Paloma (Magnusson et al., 2023); subsets 4chan (Papasavva et al., 2020), WikiText 103 (Merity et al., 2016), and Pile (Gao et al., 2020) (Val)

Does the dataset comply with the EU General Data Protection Regulation (GDPR)? Does it comply with any other standards, such as the US Equal Employ- ment Opportunity Act?

We created this dataset in aggregate, not separately identifying any individual’s content or information. We took reasonable steps to remove types of personal infor- mation that were possible to reliably detect. We restrict who has access to the data, and we release this under a license that prohibits uses that might be deemed dis- criminatory. We also provide an avenue for any person

### 第 41 页中文译文

……可联系我们，将语料库中由其创作或与其有关的文本移除。

**如果数据集涉及人，是否可能使其遭受伤害或法律行动（例如经济、社会或其他方面）？采取了什么措施减轻潜在伤害？**

Dolma 包含由 Common Crawl 从互联网抓取的网页衍生而来的文本实例。内容可能包含敏感信息，包括个人信息，或用户选择公开发布在网上的财务信息。这些数据只取自公开场所，因此相同数据现在或过去可以通过浏览网页访问。我们测量了多种个人信息，专门构建工具来移除部分敏感信息，并通过许可证限制用户可以如何使用这些数据。

我们建议希望移除自身信息的个人通过表单提交申请。

**数据集是否包含可能被视为敏感或机密的信息（例如个人身份信息）？是否包含可能被视为不当或冒犯性的内容？**

该数据集包含由 Common Crawl 抓取网页而衍生的文本，因此可能包含互联网创作者发布在公共网站上的文字。如果作者曾公开发布个人信息或冒犯性内容，它们就可能进入数据集。我们采取合理措施，移除能够可靠检测的个人信息类型，也删除了包含被分类为有毒句子的文档。

**如果数据集涉及人，它是否会不公平地使某些社会群体受益或受损？如何缓解？**

Dolma 并非其任何来源的代表性样本，可能低估或高估互联网上某些社群。peS2o 子集的论文偏向 STEM 学科；Gutenberg 书库主要是公版书籍（论文发表时即 1927 年以前出版的书）；英语版和简单英语版 Wikipedia、Wikibooks 还可能偏向全球北方的事件与人物。

我们没有尝试改变 Dolma 中社会群体的分布。纠正大型数据集社会偏差的大规模干预仍具挑战，留待未来研究。

**如果数据集涉及人，是否向其提供隐私保证？如何确保？**

该数据集的文本来自 Common Crawl 抓取的网页，其中大量内容无法确定作者。很多创作者有意匿名发帖，推断其身份可能引发伦理问题。我们开放数据访问，并鼓励希望删除自己创作或相关数据的创作者联系我们。

**数据集是否符合欧盟《通用数据保护条例》（GDPR）或美国《平等就业机会法》等其他标准？**

我们以聚合方式创建数据集，不单独识别任何个人的内容或信息；采取合理措施移除可可靠检测的个人信息类型；限制数据访问者，并通过许可证禁止可能构成歧视的用途；也为任何个人提供申请渠道。（该回答续至前文所述移除表单。）

## O 全部原始消融结果

### O.1 Dolma 与其他语料库的比较

图中横轴为总词元数，纵轴为困惑度；比较 RedPajama v1、Pile、C4、mC4（英语）、RefinedWeb 与 Dolma v1.5。

图 13：Paloma（Magnusson 等，2023）上的困惑度结果；子集为 4chan（Papasavva 等，2020）、WikiText-103（Merity 等，2016）和 Pile 验证集（Gao 等，2020）。
<!-- page 42 of 64 -->

C4 (100 Domains)

Red Pajama v1

Pile

C4

mC4 (English)

RefinedWeb

Dolma v1.5

20

Perplexity

Manosphere

50 Red Pajama v1

Pile

C4

mC4 (English)

RefinedWeb

40

Dolma v1.5

0 20B 40B 60B 80B 100B 120B 140B

Total Tokens

Penn Treebank

Red Pajama v1

Perplexity

30

Pile

C4

100

mC4 (English)

90

RefinedWeb

80

Dolma v1.5

70

60

50

0 20B 40B 60B 80B 100B 120B 140B

Perplexity

Total Tokens

40

30

20

Figure 16: Perplexity results on Paloma (Magnusson et al., 2023); subsets Manosphere (Ribeiro et al., 2021)

0 20B 40B 60B 80B 100B 120B 140B

Total Tokens

GAB

60 Red Pajama v1

Pile

C4

mC4 (English)

RefinedWeb

50

Dolma v1.5

40

Perplexity

30

0 20B 40B 60B 80B 100B 120B 140B

Total Tokens

mC4 (English)

Red Pajama v1

Pile

C4

Figure 14: Perplexity results on Paloma (Magnusson et al., 2023); subsets C4 100 dom (Chronopoulou et al., 2022), Penn Tree Bank (Marcus et al., 1994), and Gab (Zannettou et al., 2018)

mC4 (English)

20

RefinedWeb

Dolma v1.5

Perplexity

ICE

200 Red Pajama v1

Pile

C4

mC4 (English)

10

RefinedWeb

Dolma v1.5

100

90

9

0 20B 40B 60B 80B 100B 120B 140B

80

70

Total Tokens

60

M2D2 (S2ORC)

50

Red Pajama v1

Perplexity

Pile

40

C4

mC4 (English)

30

40

RefinedWeb

Dolma v1.5

20

0 20B 40B 60B 80B 100B 120B 140B

30

Perplexity

Total Tokens

M2D2 (Wiki)

Red Pajama v1

Pile

C4

20

mC4 (English)

RefinedWeb

Dolma v1.5

0 20B 40B 60B 80B 100B 120B 140B 20

Total Tokens

C4

Perplexity

30 Red Pajama v1

Pile

C4

mC4 (English)

RefinedWeb

Dolma v1.5

0 20B 40B 60B 80B 100B 120B 140B

Perplexity

Total Tokens

20

TwitterAEE

80 Red Pajama v1

Pile

C4

mC4 (English)

RefinedWeb

70

Dolma v1.5

0 20B 40B 60B 80B 100B 120B 140B

Total Tokens

60

Perplexity

50

40

0 20B 40B 60B 80B 100B 120B 140B

Total Tokens

Figure 17: Perplexity results on Paloma (Magnusson et al., 2023); subsets mC4 (Xue et al., 2020) (English), M2D2 (Reid et al., 2022) (S2ORC), and C4 (Raffel et al., 2020; Dodge et al., 2021)

Figure 15: Perplexity results on Paloma (Magnus- son et al., 2023); subsets ICE (Greenbaum, 1991), M2D2 (Reid et al., 2022) (Wiki), and Twitter AAE (Blodgett et al., 2016)

### 第 42 页中文译文

本页各图均以总词元数为横轴、困惑度为纵轴，比较 RedPajama v1、Pile、C4、mC4（英语）、RefinedWeb 与 Dolma v1.5。

图 14：Paloma（Magnusson 等，2023）上的困惑度结果；子集为 C4 的 100 个域名（Chronopoulou 等，2022）、Penn Treebank（Marcus 等，1994）和 GAB（Zannettou 等，2018）。

图 15：Paloma 上的困惑度结果；子集为 ICE（Greenbaum，1991）、M2D2（Reid 等，2022）的 Wiki 子集和 Twitter AAE（Blodgett 等，2016）。

图 16：Paloma 上的困惑度结果；子集为 Manosphere（Ribeiro 等，2021）。

图 17：Paloma 上的困惑度结果；子集为 mC4（Xue 等，2020）的英语部分、M2D2（Reid 等，2022）的 S2ORC 子集和 C4（Raffel 等，2020；Dodge 等，2021）。
<!-- page 43 of 64 -->

OpenBookQA

0.35

0.34

0.33

0.32

0.31

Accuracy

0.3

Red Pajama v1

0.29

Pile

C4

mC4 (English)

0.28

RefinedWeb

Dolma v1.5

0 20B 40B 60B 80B 100B 120B 140B 0.27

Total Tokens

ARC-Easy

0.6

0.58

0.56

0.54

Accuracy

0.52

0.5

Red Pajama v1

Pile

C4

0.48

mC4 (English)

RefinedWeb

Dolma v1.5

0.46

0 20B 40B 60B 80B 100B 120B 140B

Total Tokens

Winogrande

0.56

0.55

0.54

0.53

Accuracy

0.52

Red Pajama v1

Pile

0.51

C4

mC4 (English)

RefinedWeb

Dolma v1.5

0.5

0 20B 40B 60B 80B 100B 120B 140B

Total Tokens

Train

Red Pajama v1

Pile

10

C4

9

mC4 (English)

RefinedWeb

8

Dolma v1.5

7

Figure 18: Results downstream tasks Open- BookQA (Mihaylov et al., 2018), ARC-E (Clark et al., 2018), and WinoGrande (Sakaguchi et al., 2019)

6

5

Cross Entropy

4

3

2

SciQ

0 20B 40B 60B 80B 100B 120B 140B

Total Tokens

0.86

Figure 20: Training Cross Entropy

0.84

0.82

Accuracy

0.8

Red Pajama v1

Pile

C4

mC4 (English)

0.78

RefinedWeb

Dolma v1.5

0 20B 40B 60B 80B 100B 120B 140B

Total Tokens

HellaSwag

0.55

0.5

Accuracy

0.45

Red Pajama v1

Pile

0.4

C4

mC4 (English)

RefinedWeb

Dolma v1.5

0 20B 40B 60B 80B 100B 120B 140B 0.35

Total Tokens

PIQA

0.74

0.72

0.7

Accuracy

0.68

Red Pajama v1

Pile

C4

0.66

mC4 (English)

RefinedWeb

Dolma v1.5

0 20B 40B 60B 80B 100B 120B 140B

Total Tokens

Figure 19: Results downstream tasks SciQ (Welbl et al., 2017), HellaSwag (Zellers et al., 2019), and PIQA (Bisk et al., 2019)

### 第 43 页中文译文

本页报告下游任务与训练交叉熵。任务图以总词元数为横轴、准确率为纵轴；训练图以总词元数为横轴、交叉熵为纵轴。比较对象为 RedPajama v1、Pile、C4、mC4（英语）、RefinedWeb 和 Dolma v1.5。

图 18：下游任务 OpenBookQA（Mihaylov 等，2018）、ARC-Easy（Clark 等，2018）和 WinoGrande（Sakaguchi 等，2019）的结果。

图 19：下游任务 SciQ（Welbl 等，2017）、HellaSwag（Zellers 等，2019）和 PIQA（Bisk 等，2019）的结果。

图 20：训练交叉熵。
<!-- page 44 of 64 -->

O.2 Deduping Strategy

GAB

90 Baseline

4chan

80

Paragraph Deduplication

70

40 Baseline

Paragraph Deduplication

60

Perplexity

50

30

Perplexity

40

0 50B 100B

20

Total Tokens

ICE

0 50B 100B

100

Total Tokens

Pile

90

80

Baseline

Paragraph Deduplication

70

30

Perplexity

60

Baseline

50

Perplexity

20

Paragraph Deduplication

0 50B 100B

Total Tokens

M2D2 (Wiki)

0 50B 100B

Total Tokens

40 Baseline

C4 (100 Domains)

Paragraph Deduplication

40 Baseline

30

Paragraph Deduplication

30

Perplexity

20

Perplexity

20

0 50B 100B

Total Tokens

0 50B 100B

Total Tokens

Figure 23: Perplexity results on Paloma (Magnusson et al., 2023); subsets Gab (Zannettou et al., 2018), ICE (Greenbaum, 1991), and M2D2 (Reid et al., 2022) (Wiki)

Figure 21: Perplexity results on Paloma (Magnus- son et al., 2023); subsets 4chan (Papasavva et al., 2020), Pile (Gao et al., 2020) (Val), and C4 100 dom (Chronopoulou et al., 2022)

TwitterAEE

C4

80 Baseline

Paragraph Deduplication

40 Baseline

70

Paragraph Deduplication

60

30

Perplexity

50

Perplexity

20

0 50B 100B 40

0 50B 100B

Total Tokens

mC4 (English)

Total Tokens

Manosphere

30 Baseline

Paragraph Deduplication

70 Baseline

Paragraph Deduplication

60

20

50

Perplexity

Perplexity

40

0 50B 100B 10

0 50B 100B

Total Tokens

M2D2 (S2ORC)

Total Tokens

80 Baseline

Paragraph Deduplication

70

60

50

Figure 22: Perplexity results on Paloma (Magnusson et al., 2023); subsets C4 (Raffel et al., 2020; Dodge et al., 2021) and Manosphere (Ribeiro et al., 2021)

Perplexity

40

30

0 50B 100B

Total Tokens

Figure 24: Perplexity results on Paloma (Magnusson et al., 2023); subsets Twitter AAE (Blodgett et al., 2016), mC4 (Xue et al., 2020) (English), and M2D2 (Reid et al., 2022) (S2ORC)

### 第 44 页中文译文

### O.2 去重策略

本页各图以总词元数为横轴、困惑度为纵轴，对比基线与段落去重方案。

图 21：Paloma（Magnusson 等，2023）上的困惑度结果；子集为 4chan（Papasavva 等，2020）、Pile 验证集（Gao 等，2020）和 C4 的 100 个域名（Chronopoulou 等，2022）。

图 22：Paloma 上的困惑度结果；子集为 C4（Raffel 等，2020；Dodge 等，2021）和 Manosphere（Ribeiro 等，2021）。

图 23：Paloma 上的困惑度结果；子集为 GAB（Zannettou 等，2018）、ICE（Greenbaum，1991）和 M2D2（Reid 等，2022）的 Wiki 子集。

图 24：Paloma 上的困惑度结果；子集为 Twitter AAE（Blodgett 等，2016）、mC4（Xue 等，2020）的英语部分和 M2D2（Reid 等，2022）的 S2ORC 子集。
<!-- page 45 of 64 -->

OpenBookQA

0.35

0.3

Accuracy

Baseline

0.25

Paragraph Deduplication

0 50B 100B

Total Tokens

ARC-Easy

0.55

0.5

0.45

Accuracy

0.4

Baseline

Paragraph Deduplication

0 50B 100B 0.35

Total Tokens

Winogrande

Baseline

Paragraph Deduplication

0.54

0.52

Accuracy

0.5

0 50B 100B

Total Tokens

Train

Paragraph Deduplication

8 9 10 Baseline

7

Figure 25: Results downstream tasks Open- BookQA (Mihaylov et al., 2018), ARC-E (Clark et al., 2018), and WinoGrande (Sakaguchi et al., 2019)

6

5

4

Cross Entropy

3

0 50B 100B

SciQ

Total Tokens

0.8

Figure 27: Training Cross Entropy

0.7

Accuracy

Baseline

0.6

Paragraph Deduplication

0 50B 100B

Total Tokens

HellaSwag

0.45

0.4

Accuracy

0.35

Baseline

0.3

Paragraph Deduplication

0 50B 100B

Total Tokens

PIQA

0.7

Accuracy

0.65

Baseline

Paragraph Deduplication

0 50B 100B 0.6

Total Tokens

Figure 26: Results downstream tasks SciQ (Welbl et al., 2017), HellaSwag (Zellers et al., 2019), and PIQA (Bisk et al., 2019)

### 第 45 页中文译文

本页以总词元数为横轴。下游任务图以准确率为纵轴，训练图以交叉熵为纵轴；均对比基线与段落去重方案。

图 25：下游任务 OpenBookQA（Mihaylov 等，2018）、ARC-Easy（Clark 等，2018）和 WinoGrande（Sakaguchi 等，2019）的结果。

图 26：下游任务 SciQ（Welbl 等，2017）、HellaSwag（Zellers 等，2019）和 PIQA（Bisk 等，2019）的结果。

图 27：训练交叉熵。
<!-- page 46 of 64 -->

Manosphere

O.3 Filtering of Personal Identifiable Information

70 PII Remove (>=5) + Mask (<5)

PII Remove All

60

Baseline

4chan

60

50

50

Perplexity

40

40

30

0 50B 100B

Perplexity

PII Remove (>=5) + Mask (<5)

Total Tokens

PII Remove All

20

Baseline

0 50B 100B

Total Tokens

Figure 30: Perplexity results on Paloma (Magnusson et al., 2023); subsets Manosphere (Ribeiro et al., 2021)

C4 (100 Domains)

40 PII Remove (>=5) + Mask (<5)

PII Remove All

Baseline

30

mC4 (English)

30 PII Remove (>=5) + Mask (<5)

PII Remove All

Perplexity

20

Baseline

20

Perplexity

0 50B 100B

Total Tokens

GAB

90 PII Remove (>=5) + Mask (<5)

0 50B 100B

80

PII Remove All

Total Tokens

70

Baseline

M2D2 (S2ORC)

60

80 PII Remove (>=5) + Mask (<5)

50

PII Remove All

Perplexity

70

Baseline

60

40

50

Perplexity

0 50B 100B

40

Total Tokens

30

0 50B 100B

Total Tokens

C4

40 PII Remove (>=5) + Mask (<5)

PII Remove All

Figure 28: Perplexity results on Paloma (Magnusson et al., 2023); subsets 4chan (Papasavva et al., 2020), C4 100 dom (Chronopoulou et al., 2022), and Gab (Zannet- tou et al., 2018)

Baseline

30

Perplexity

ICE

20

100

90

0 50B 100B

80

Total Tokens

70

60

Perplexity

PII Remove (>=5) + Mask (<5)

50

PII Remove All

Baseline

0 50B 100B

Total Tokens

Figure 31: Perplexity results on Paloma (Magnusson et al., 2023); subsets mC4 (Xue et al., 2020) (English), M2D2 (Reid et al., 2022) (S2ORC), and C4 (Raffel et al., 2020; Dodge et al., 2021)

M2D2 (Wiki)

40 PII Remove (>=5) + Mask (<5)

PII Remove All

Baseline

30

Perplexity

20

0 50B 100B

Total Tokens

TwitterAEE

80 PII Remove (>=5) + Mask (<5)

PII Remove All

70

Baseline

60

Perplexity

50

40

0 50B 100B

Total Tokens

Figure 29: Perplexity results on Paloma (Magnus- son et al., 2023); subsets ICE (Greenbaum, 1991), M2D2 (Reid et al., 2022) (Wiki), and Twitter AAE (Blodgett et al., 2016)

### 第 46 页中文译文

### O.3 个人身份信息过滤

本页各图以总词元数为横轴、困惑度为纵轴，对比三种方案：包含至少 5 个 PII 时删除、少于 5 个时遮盖；删除所有含 PII 的内容；基线。

图 28：Paloma（Magnusson 等，2023）上的困惑度结果；子集为 4chan（Papasavva 等，2020）、C4 的 100 个域名（Chronopoulou 等，2022）和 GAB（Zannettou 等，2018）。

图 29：Paloma 上的困惑度结果；子集为 ICE（Greenbaum，1991）、M2D2（Reid 等，2022）的 Wiki 子集和 Twitter AAE（Blodgett 等，2016）。

图 30：Paloma 上的困惑度结果；子集为 Manosphere（Ribeiro 等，2021）。

图 31：Paloma 上的困惑度结果；子集为 mC4（Xue 等，2020）的英语部分、M2D2（Reid 等，2022）的 S2ORC 子集和 C4（Raffel 等，2020；Dodge 等，2021）。
<!-- page 47 of 64 -->

OpenBookQA

0.35

0.3

Accuracy

PII Remove (>=5) + Mask (<5)

PII Remove All

0.25

Baseline

0 50B 100B

Total Tokens

ARC-Easy

0.55

0.5

Accuracy

0.45

PII Remove (>=5) + Mask (<5)

PII Remove All

0.4

Baseline

0 50B 100B

Total Tokens

Winogrande

0.54

0.52

Accuracy

PII Remove (>=5) + Mask (<5)

0.5

PII Remove All

Baseline

0 50B 100B

Total Tokens

Train

9 PII Remove (>=5) + Mask (<5)

8

PII Remove All

7

Baseline

Figure 32: Results downstream tasks Open- BookQA (Mihaylov et al., 2018), ARC-E (Clark et al., 2018), and WinoGrande (Sakaguchi et al., 2019)

6

5

4

Cross Entropy

3

0 50B 100B

SciQ

Total Tokens

0.8

Figure 34: Training Cross Entropy

0.7

Accuracy

PII Remove (>=5) + Mask (<5)

PII Remove All

0.6

Baseline

0 50B 100B

Total Tokens

HellaSwag

0.45

0.4

Accuracy

0.35

PII Remove (>=5) + Mask (<5)

PII Remove All

0.3

Baseline

0 50B 100B

Total Tokens

PIQA

0.7

0.65

Accuracy

PII Remove (>=5) + Mask (<5)

PII Remove All

Baseline

0.6

0 50B 100B

Total Tokens

Figure 33: Results downstream tasks SciQ (Welbl et al., 2017), HellaSwag (Zellers et al., 2019), and PIQA (Bisk et al., 2019)

### 第 47 页中文译文

本页以总词元数为横轴。下游任务图以准确率为纵轴，训练图以交叉熵为纵轴；均对比三种方案：包含至少 5 个 PII 时删除、少于 5 个时遮盖；删除所有含 PII 的内容；基线。

图 32：下游任务 OpenBookQA（Mihaylov 等，2018）、ARC-Easy（Clark 等，2018）和 WinoGrande（Sakaguchi 等，2019）的结果。

图 33：下游任务 SciQ（Welbl 等，2017）、HellaSwag（Zellers 等，2019）和 PIQA（Bisk 等，2019）的结果。

图 34：训练交叉熵。
<!-- page 48 of 64 -->

GAB

O.4 Comparing Quality Filters for Web Pipeline

100 Baseline

90

C4 NoPunc

80

C4 All

4chan

70

Gopher All

60

C4 NoPunc + Gopher All

Baseline

C4 NoPunc

Perplexity

40

50

C4 All

Gopher All

40

30

C4 NoPunc + Gopher All

0 50B 100B

Perplexity

Total Tokens

ICE

20

100 Baseline

0 50B 100B

90

C4 NoPunc

Total Tokens

80

C4 All

Pile

Gopher All

70

C4 NoPunc + Gopher All

50 Baseline

C4 NoPunc

Perplexity

60

40

C4 All

Gopher All

50

30

C4 NoPunc + Gopher All

0 50B 100B

Perplexity

20

Total Tokens

M2D2 (Wiki)

0 50B 100B

40 Baseline

C4 NoPunc

Total Tokens

C4 All

C4 (100 Domains)

30

Gopher All

C4 NoPunc + Gopher All

40 Baseline

C4 NoPunc

Perplexity

20

30

C4 All

Gopher All

C4 NoPunc + Gopher All

20

0 50B 100B

Perplexity

Total Tokens

0 50B 100B

Total Tokens

Figure 37: Perplexity results on Paloma (Magnusson et al., 2023); subsets Gab (Zannettou et al., 2018), ICE (Greenbaum, 1991), and M2D2 (Reid et al., 2022) (Wiki)

TwitterAEE

Figure 35: Perplexity results on Paloma (Magnus- son et al., 2023); subsets 4chan (Papasavva et al., 2020), Pile (Gao et al., 2020) (Val), and C4 100 dom (Chronopoulou et al., 2022)

200 Baseline

C4 NoPunc

C4 All

Gopher All

C4 NoPunc + Gopher All

C4

80 90 100

Perplexity

70

40 Baseline

60

C4 NoPunc

50

C4 All

30

Gopher All

0 50B 100B 40

C4 NoPunc + Gopher All

Total Tokens

Perplexity

mC4 (English)

20

40 Baseline

C4 NoPunc

30

0 50B 100B

C4 All

Gopher All

Total Tokens

C4 NoPunc + Gopher All

20

Manosphere

Perplexity

80 Baseline

C4 NoPunc

70

C4 All

60

Gopher All

0 50B 100B 10

C4 NoPunc + Gopher All

50

Total Tokens

Perplexity

M2D2 (S2ORC)

40

90 Baseline

80

C4 NoPunc

70

0 50B 100B

C4 All

60

Gopher All

Total Tokens

C4 NoPunc + Gopher All

50

Perplexity

40

30

0 50B 100B

Figure 36: Perplexity results on Paloma (Magnusson et al., 2023); subsets C4 (Raffel et al., 2020; Dodge et al., 2021) and Manosphere (Ribeiro et al., 2021)

Total Tokens

Figure 38: Perplexity results on Paloma (Magnusson et al., 2023); subsets Twitter AAE (Blodgett et al., 2016), mC4 (Xue et al., 2020) (English), and M2D2 (Reid et al., 2022) (S2ORC)

### 第 48 页中文译文

### O.4 网页处理流水线质量过滤器比较

本页各图以总词元数为横轴、困惑度为纵轴，比较五种方案：基线；C4 NoPunc（仅使用 C4 的句末标点规则）；C4 All（使用全部 C4 规则）；Gopher All（使用全部 Gopher 规则）；C4 NoPunc + Gopher All（组合使用 C4 句末标点规则与全部 Gopher 规则）。

图 35：Paloma（Magnusson 等，2023）上的困惑度结果；子集为 4chan（Papasavva 等，2020）、Pile 验证集（Gao 等，2020）和 C4 的 100 个域名（Chronopoulou 等，2022）。

图 36：Paloma 上的困惑度结果；子集为 C4（Raffel 等，2020；Dodge 等，2021）和 Manosphere（Ribeiro 等，2021）。

图 37：Paloma 上的困惑度结果；子集为 GAB（Zannettou 等，2018）、ICE（Greenbaum，1991）和 M2D2（Reid 等，2022）的 Wiki 子集。

图 38：Paloma 上的困惑度结果；子集为 Twitter AAE（Blodgett 等，2016）、mC4（Xue 等，2020）的英语部分和 M2D2（Reid 等，2022）的 S2ORC 子集。
<!-- page 49 of 64 -->

OpenBookQA

0.35

0.3

Baseline

C4 NoPunc

Accuracy

C4 All

Gopher All

0.25

C4 NoPunc + Gopher All

0 50B 100B

Total Tokens

ARC-Easy

0.6

0.55

0.5

Baseline

C4 NoPunc

Accuracy

0.45

C4 All

Gopher All

0.4

C4 NoPunc + Gopher All

0 50B 100B

Total Tokens

Winogrande

0.54

0.52

Baseline

C4 NoPunc

Accuracy

C4 All

0.5

Gopher All

C4 NoPunc + Gopher All

0 50B 100B

Total Tokens

Train

9 Baseline

8

C4 NoPunc

7

C4 All

Figure 39: Results downstream tasks Open- BookQA (Mihaylov et al., 2018), ARC-E (Clark et al., 2018), and WinoGrande (Sakaguchi et al., 2019)

6

Gopher All

5

C4 NoPunc + Gopher All

4

Cross Entropy

3

0 50B 100B

SciQ

Total Tokens

0.8

Figure 41: Training Cross Entropy

Baseline

0.7

C4 NoPunc

Accuracy

C4 All

Gopher All

0.6

C4 NoPunc + Gopher All

0 50B 100B

Total Tokens

HellaSwag

0.5

0.45

0.4

Baseline

C4 NoPunc

Accuracy

0.35

C4 All

Gopher All

0.3

C4 NoPunc + Gopher All

0 50B 100B

Total Tokens

PIQA

0.7

Baseline

C4 NoPunc

Accuracy

0.65

C4 All

Gopher All

C4 NoPunc + Gopher All

0 50B 100B 0.6

Total Tokens

Figure 40: Results downstream tasks SciQ (Welbl et al., 2017), HellaSwag (Zellers et al., 2019), and PIQA (Bisk et al., 2019)
<!-- page 50 of 64 -->

GAB

O.5 Full Comparison of Web Pipeline

90 Baseline

80

Quality Filters

Quality Filters + Dedup

70

4chan

Quality Filters + Dedup + Content Filters

60

Baseline

40

Quality Filters

Perplexity

50

Quality Filters + Dedup

Quality Filters + Dedup + Content Filters

30

40

0 50B 100B

Perplexity

Total Tokens

20

ICE

100 Baseline

0 50B 100B

90

Quality Filters

80

Total Tokens

Quality Filters + Dedup

70

Pile

Quality Filters + Dedup + Content Filters

60

50 Baseline

50

Quality Filters

Perplexity

40

Quality Filters + Dedup

40

Quality Filters + Dedup + Content Filters

30

0 50B 100B

Perplexity

Total Tokens

20

M2D2 (Wiki)

0 50B 100B

40 Baseline

Quality Filters

Total Tokens

Quality Filters + Dedup

C4 (100 Domains)

30

Quality Filters + Dedup + Content Filters

40 Baseline

Quality Filters

Perplexity

20

30

Quality Filters + Dedup

Quality Filters + Dedup + Content Filters

20

0 50B 100B

Perplexity

Total Tokens

0 50B 100B

Total Tokens

Figure 44: Perplexity results on Paloma (Magnusson et al., 2023); subsets Gab (Zannettou et al., 2018), ICE (Greenbaum, 1991), and M2D2 (Reid et al., 2022) (Wiki)

TwitterAEE

Figure 42: Perplexity results on Paloma (Magnus- son et al., 2023); subsets 4chan (Papasavva et al., 2020), Pile (Gao et al., 2020) (Val), and C4 100 dom (Chronopoulou et al., 2022)

200 Baseline

Quality Filters

Quality Filters + Dedup

Quality Filters + Dedup + Content Filters

C4

80 90 100

Perplexity

70

40 Baseline

60

Quality Filters

50

Quality Filters + Dedup

30

Quality Filters + Dedup + Content Filters

0 50B 100B 40

Total Tokens

Perplexity

mC4 (English)

20

40 Baseline

Quality Filters

30

0 50B 100B

Quality Filters + Dedup

Quality Filters + Dedup + Content Filters

Total Tokens

Manosphere

20

Perplexity

80 Baseline

70

Quality Filters

60

Quality Filters + Dedup

Quality Filters + Dedup + Content Filters

50

0 50B 100B 10

Total Tokens

40

Perplexity

M2D2 (S2ORC)

30

80 Baseline

Quality Filters

70

0 50B 100B

Quality Filters + Dedup

60

Quality Filters + Dedup + Content Filters

Total Tokens

50

Perplexity

40

30

0 50B 100B

Figure 43: Perplexity results on Paloma (Magnusson et al., 2023); subsets C4 (Raffel et al., 2020; Dodge et al., 2021) and Manosphere (Ribeiro et al., 2021)

Total Tokens

Figure 45: Perplexity results on Paloma (Magnusson et al., 2023); subsets Twitter AAE (Blodgett et al., 2016), mC4 (Xue et al., 2020) (English), and M2D2 (Reid et al., 2022) (S2ORC)
<!-- page 51 of 64 -->

OpenBookQA

0.35

0.3

Baseline

Accuracy

Quality Filters

Quality Filters + Dedup

0.25

Quality Filters + Dedup + Content Filters

0 50B 100B

Total Tokens

ARC-Easy

0.55

0.5

Baseline

Accuracy

0.45

Quality Filters

Quality Filters + Dedup

0.4

Quality Filters + Dedup + Content Filters

0 50B 100B

Total Tokens

Winogrande

0.56

0.54

0.52

Baseline

Accuracy

Quality Filters

0.5

Quality Filters + Dedup

Quality Filters + Dedup + Content Filters

0 50B 100B

Total Tokens

Train

9 Baseline

8

Quality Filters

7

Quality Filters + Dedup

6

Figure 46: Results downstream tasks Open- BookQA (Mihaylov et al., 2018), ARC-E (Clark et al., 2018), and WinoGrande (Sakaguchi et al., 2019)

Quality Filters + Dedup + Content Filters

5

4

Cross Entropy

3

0 50B 100B

SciQ

Total Tokens

0.8

Figure 48: Training Cross Entropy

0.7

Baseline

Accuracy

Quality Filters

Quality Filters + Dedup

0.6

Quality Filters + Dedup + Content Filters

0 50B 100B

Total Tokens

HellaSwag

0.5

0.4

Baseline

Accuracy

Quality Filters

Quality Filters + Dedup

0.3

Quality Filters + Dedup + Content Filters

0 50B 100B

Total Tokens

PIQA

0.7

Baseline

Accuracy

0.65

Quality Filters

Quality Filters + Dedup

Quality Filters + Dedup + Content Filters

0 50B 100B 0.6

Total Tokens

Figure 47: Results downstream tasks SciQ (Welbl et al., 2017), HellaSwag (Zellers et al., 2019), and PIQA (Bisk et al., 2019)
<!-- page 52 of 64 -->

GAB

O.6 Toxicity Filtering in Web Pipeline

90 Hate Filter (Low Threshold)

80

NSFW Filter (Low Threshold)

70

Hate Filter (High Threshold)

4chan

60

NSFW Filter (High Threshold)

Baseline

40 Hate Filter (Low Threshold)

50

NSFW Filter (Low Threshold)

Perplexity

Hate Filter (High Threshold)

30

40

NSFW Filter (High Threshold)

Baseline

20

0 50B 100B 30

Perplexity

Total Tokens

ICE

0 50B 100B

80 90 100 Hate Filter (Low Threshold)

NSFW Filter (Low Threshold)

Total Tokens

70

Hate Filter (High Threshold)

Pile

60

NSFW Filter (High Threshold)

50

Baseline

Hate Filter (Low Threshold)

40

NSFW Filter (Low Threshold)

Perplexity

30

Hate Filter (High Threshold)

30

NSFW Filter (High Threshold)

Baseline

20

0 50B 100B

Perplexity

Total Tokens

M2D2 (Wiki)

0 50B 100B

40 Hate Filter (Low Threshold)

NSFW Filter (Low Threshold)

Total Tokens

Hate Filter (High Threshold)

C4 (100 Domains)

30

NSFW Filter (High Threshold)

Baseline

40 Hate Filter (Low Threshold)

NSFW Filter (Low Threshold)

Perplexity

20

30

Hate Filter (High Threshold)

NSFW Filter (High Threshold)

Baseline

0 50B 100B

Perplexity

20

Total Tokens

0 50B 100B

Total Tokens

Figure 51: Perplexity results on Paloma (Magnusson et al., 2023); subsets Gab (Zannettou et al., 2018), ICE (Greenbaum, 1991), and M2D2 (Reid et al., 2022) (Wiki)

TwitterAEE

Figure 49: Perplexity results on Paloma (Magnus- son et al., 2023); subsets 4chan (Papasavva et al., 2020), Pile (Gao et al., 2020) (Val), and C4 100 dom (Chronopoulou et al., 2022)

90 Hate Filter (Low Threshold)

NSFW Filter (Low Threshold)

80

Hate Filter (High Threshold)

70

NSFW Filter (High Threshold)

Baseline

C4

60

Perplexity

50

40 Hate Filter (Low Threshold)

NSFW Filter (Low Threshold)

Hate Filter (High Threshold)

40

30

NSFW Filter (High Threshold)

0 50B 100B

Baseline

Total Tokens

Perplexity

mC4 (English)

20

30 Hate Filter (Low Threshold)

NSFW Filter (Low Threshold)

0 50B 100B

Hate Filter (High Threshold)

NSFW Filter (High Threshold)

20

Total Tokens

Baseline

Manosphere

Perplexity

70 Hate Filter (Low Threshold)

60

NSFW Filter (Low Threshold)

Hate Filter (High Threshold)

50

NSFW Filter (High Threshold)

0 50B 100B 10

Baseline

40

Total Tokens

Perplexity

M2D2 (S2ORC)

30

80 Hate Filter (Low Threshold)

NSFW Filter (Low Threshold)

70

0 50B 100B

Hate Filter (High Threshold)

60

NSFW Filter (High Threshold)

Total Tokens

50

Baseline

Perplexity

40

30

0 50B 100B

Figure 50: Perplexity results on Paloma (Magnusson et al., 2023); subsets C4 (Raffel et al., 2020; Dodge et al., 2021) and Manosphere (Ribeiro et al., 2021)

Total Tokens

Figure 52: Perplexity results on Paloma (Magnusson et al., 2023); subsets Twitter AAE (Blodgett et al., 2016), mC4 (Xue et al., 2020) (English), and M2D2 (Reid et al., 2022) (S2ORC)
<!-- page 53 of 64 -->

OpenBookQA

0.35

0.3

Hate Filter (Low Threshold)

NSFW Filter (Low Threshold)

Accuracy

Hate Filter (High Threshold)

NSFW Filter (High Threshold)

0.25

Baseline

0 50B 100B

Total Tokens

ARC-Easy

0.6

0.55

0.5

Hate Filter (Low Threshold)

NSFW Filter (Low Threshold)

Accuracy

0.45

Hate Filter (High Threshold)

NSFW Filter (High Threshold)

0.4

Baseline

0 50B 100B

Total Tokens

Winogrande

0.54

0.52

Hate Filter (Low Threshold)

NSFW Filter (Low Threshold)

Accuracy

Hate Filter (High Threshold)

0.5

NSFW Filter (High Threshold)

Baseline

0 50B 100B

Total Tokens

Train

NSFW Filter (Low Threshold)

8 9 10 Hate Filter (Low Threshold)

Hate Filter (High Threshold)

7

Figure 53: Results downstream tasks Open- BookQA (Mihaylov et al., 2018), ARC-E (Clark et al., 2018), and WinoGrande (Sakaguchi et al., 2019)

6

NSFW Filter (High Threshold)

Baseline

5

4

Cross Entropy

3

0 50B 100B

SciQ

Total Tokens

0.8

Figure 55: Training Cross Entropy

Hate Filter (Low Threshold)

0.7

NSFW Filter (Low Threshold)

Accuracy

Hate Filter (High Threshold)

NSFW Filter (High Threshold)

0.6

Baseline

0 50B 100B

Total Tokens

HellaSwag

0.5

0.45

0.4

Hate Filter (Low Threshold)

NSFW Filter (Low Threshold)

Accuracy

0.35

Hate Filter (High Threshold)

NSFW Filter (High Threshold)

0.3

Baseline

0 50B 100B

Total Tokens

PIQA

0.7

Hate Filter (Low Threshold)

0.65

NSFW Filter (Low Threshold)

Accuracy

Hate Filter (High Threshold)

NSFW Filter (High Threshold)

Baseline

0.6

0 50B 100B

Total Tokens

Figure 54: Results downstream tasks SciQ (Welbl et al., 2017), HellaSwag (Zellers et al., 2019), and PIQA (Bisk et al., 2019)
<!-- page 54 of 64 -->

GAB

O.7 Comparing Code Processing Pipeline

90 Dolma (RPJ rules)

Dolma (RPJ rules & StarCoder rules)

4chan

80

30 Dolma (RPJ rules)

Dolma (RPJ rules & StarCoder rules)

Perplexity

70

60

0 10B 20B 30B 40B 50B

Perplexity

20

Total Tokens

ICE

70 Dolma (RPJ rules)

0 10B 20B 30B 40B 50B

Dolma (RPJ rules & StarCoder rules)

60

Total Tokens

Pile

50

50 Dolma (RPJ rules)

40

Dolma (RPJ rules & StarCoder rules)

Perplexity

40

30

30

0 10B 20B 30B 40B 50B

Perplexity

Total Tokens

M2D2 (Wiki)

20

100 Dolma (RPJ rules)

0 10B 20B 30B 40B 50B

90

Dolma (RPJ rules & StarCoder rules)

Total Tokens

80

C4 (100 Domains)

70

90 Dolma (RPJ rules)

60

Dolma (RPJ rules & StarCoder rules)

Perplexity

80

50

70

60

0 10B 20B 30B 40B 50B 40

Perplexity

Total Tokens

50

0 10B 20B 30B 40B 50B

Total Tokens

Figure 58: Perplexity results on Paloma (Magnusson et al., 2023); subsets Gab (Zannettou et al., 2018), ICE (Greenbaum, 1991), and M2D2 (Reid et al., 2022) (Wiki)

TwitterAEE

Figure 56: Perplexity results on Paloma (Magnus- son et al., 2023); subsets 4chan (Papasavva et al., 2020), Pile (Gao et al., 2020) (Val), and C4 100 dom (Chronopoulou et al., 2022)

Dolma (RPJ rules)

Dolma (RPJ rules & StarCoder rules)

80

C4

70

Perplexity

80 Dolma (RPJ rules)

Dolma (RPJ rules & StarCoder rules)

60

70

0 10B 20B 30B 40B 50B

Total Tokens

Perplexity

60

mC4 (English)

90

Dolma (RPJ rules)

80

50

Dolma (RPJ rules & StarCoder rules)

70

0 10B 20B 30B 40B 50B

60

Total Tokens

Manosphere

50

90

Perplexity

Dolma (RPJ rules)

40

80

Dolma (RPJ rules & StarCoder rules)

70

0 10B 20B 30B 40B 50B

Total Tokens

Perplexity

60

M2D2 (S2ORC)

80

Dolma (RPJ rules)

50

Dolma (RPJ rules & StarCoder rules)

70

0 10B 20B 30B 40B 50B

Total Tokens

60

Perplexity

50

0 10B 20B 30B 40B 50B 40

Figure 57: Perplexity results on Paloma (Magnusson et al., 2023); subsets C4 (Raffel et al., 2020; Dodge et al., 2021) and Manosphere (Ribeiro et al., 2021)

Total Tokens

Figure 59: Perplexity results on Paloma (Magnusson et al., 2023); subsets Twitter AAE (Blodgett et al., 2016), mC4 (Xue et al., 2020) (English), and M2D2 (Reid et al., 2022) (S2ORC)
<!-- page 55 of 64 -->

OpenBookQA

0.27 Dolma (RPJ rules)

Dolma (RPJ rules & StarCoder rules)

0.26

Accuracy

0.25

0.24

0 10B 20B 30B 40B 50B

Total Tokens

ARC-Easy

0.4

0.35

Accuracy

Dolma (RPJ rules)

0.3

Dolma (RPJ rules & StarCoder rules)

0 10B 20B 30B 40B 50B

Total Tokens

Winogrande

0.52 Dolma (RPJ rules)

Dolma (RPJ rules & StarCoder rules)

0.5

Accuracy

0.48

0 10B 20B 30B 40B 50B

Total Tokens

Train

Dolma (RPJ rules & StarCoder rules)

Figure 60: Results downstream tasks Open- BookQA (Mihaylov et al., 2018), ARC-E (Clark et al., 2018), and WinoGrande (Sakaguchi et al., 2019)

5 6 7 8 9 10 Dolma (RPJ rules)

4

3

2

Cross Entropy

1

0 10B 20B 30B 40B 50B

SciQ

Total Tokens

0.7

Figure 62: Training Cross Entropy

0.65

0.6

Accuracy

0.55

Dolma (RPJ rules)

Dolma (RPJ rules & StarCoder rules)

0 10B 20B 30B 40B 50B 0.5

Total Tokens

HellaSwag

0.29

0.28

Accuracy

Dolma (RPJ rules)

Dolma (RPJ rules & StarCoder rules)

0.27

0 10B 20B 30B 40B 50B

Total Tokens

PIQA

0.58

0.56

Accuracy

0.54

Dolma (RPJ rules)

Dolma (RPJ rules & StarCoder rules)

0 10B 20B 30B 40B 50B

Total Tokens

Figure 61: Results downstream tasks SciQ (Welbl et al., 2017), HellaSwag (Zellers et al., 2019), and PIQA (Bisk et al., 2019)
<!-- page 56 of 64 -->

O.8 Studying Dolma Mixture

GAB

100

Na茂ve Mix

90

4chan

80

Web Only Mix

Reference+ Mix

70

30 Na茂ve Mix

Gopher-like Mix

60

Web Only Mix

Reference+ Mix

50

Perplexity

Gopher-like Mix

20

40

Perplexity

0 50B 100B 30

Total Tokens

ICE

0 50B 100B

Total Tokens

80 Na茂ve Mix

70

Pile

Web Only Mix

60

Reference+ Mix

50

40 Na茂ve Mix

Gopher-like Mix

Web Only Mix

40

30

Reference+ Mix

30

Perplexity

Gopher-like Mix

20

20

Perplexity

0 50B 100B

Total Tokens

M2D2 (Wiki)

0 50B 100B 9 10

Total Tokens

40 Na茂ve Mix

C4 (100 Domains)

Web Only Mix

Reference+ Mix

40 Na茂ve Mix

30

Gopher-like Mix

Web Only Mix

30

Reference+ Mix

Perplexity

Gopher-like Mix

20

Perplexity

20

0 50B 100B

Total Tokens

0 50B 100B

Total Tokens

Figure 65: Perplexity results on Paloma (Magnusson et al., 2023); subsets Gab (Zannettou et al., 2018), ICE (Greenbaum, 1991), and M2D2 (Reid et al., 2022) (Wiki)

Figure 63: Perplexity results on Paloma (Magnus- son et al., 2023); subsets 4chan (Papasavva et al., 2020), Pile (Gao et al., 2020) (Val), and C4 100 dom (Chronopoulou et al., 2022)

TwitterAEE

C4

100 Na茂ve Mix

90

Web Only Mix

80

40 Na茂ve Mix

Reference+ Mix

Web Only Mix

70

Gopher-like Mix

Reference+ Mix

Gopher-like Mix

30

60

Perplexity

50

Perplexity

20

0 50B 100B 40

0 50B 100B

Total Tokens

mC4 (English)

Total Tokens

Manosphere

40 Na茂ve Mix

Web Only Mix

50 Na茂ve Mix

30

Reference+ Mix

Web Only Mix

Gopher-like Mix

Reference+ Mix

40

Gopher-like Mix

20

Perplexity

Perplexity

30

0 50B 100B

0 50B 100B

Total Tokens

M2D2 (S2ORC)

Total Tokens

80 Na茂ve Mix

70

Web Only Mix

60

Reference+ Mix

50

Gopher-like Mix

40

Figure 64: Perplexity results on Paloma (Magnusson et al., 2023); subsets C4 (Raffel et al., 2020; Dodge et al., 2021) and Manosphere (Ribeiro et al., 2021)

Perplexity

30

0 50B 100B 20

Total Tokens

Figure 66: Perplexity results on Paloma (Magnusson et al., 2023); subsets Twitter AAE (Blodgett et al., 2016), mC4 (Xue et al., 2020) (English), and M2D2 (Reid et al., 2022) (S2ORC)
<!-- page 57 of 64 -->

OpenBookQA

0.35

0.3

Naïve Mix

Accuracy

Web Only Mix

Reference+ Mix

0.25

Gopher-like Mix

0 50B 100B

Total Tokens

ARC-Easy

0.55

0.5

0.45

Naïve Mix

Accuracy

Web Only Mix

0.4

Reference+ Mix

Gopher-like Mix

0 50B 100B

Total Tokens

Winogrande

0.56

0.54

0.52

Naïve Mix

Accuracy

Web Only Mix

0.5

Reference+ Mix

Gopher-like Mix

0 50B 100B 0.48

Total Tokens

Figure 67: Results downstream tasks Open- BookQA (Mihaylov et al., 2018), ARC-E (Clark et al., 2018), and WinoGrande (Sakaguchi et al., 2019)

SciQ

0.8

0.7

Naïve Mix

Accuracy

Web Only Mix

Reference+ Mix

0.6

Gopher-like Mix

0 50B 100B

Total Tokens

HellaSwag

0.5

0.4

Naïve Mix

Accuracy

Web Only Mix

Reference+ Mix

0.3

Gopher-like Mix

0 50B 100B

Total Tokens

PIQA

0.7

0.65

Naïve Mix

Accuracy

Web Only Mix

Reference+ Mix

0.6

Gopher-like Mix

0 50B 100B

Total Tokens

Figure 68: Results downstream tasks SciQ (Welbl et al., 2017), HellaSwag (Zellers et al., 2019), and PIQA (Bisk et al., 2019)

### 第 57 页中文译文

本页各图以总词元数为横轴、准确率为纵轴，比较 Naïve Mix（朴素混合）、Web Only Mix（仅网页混合）、Reference+ Mix（增强参考资料混合）与 Gopher-like Mix（类 Gopher 混合）。

图 67：下游任务 OpenBookQA（Mihaylov 等，2018）、ARC-Easy（Clark 等，2018）和 WinoGrande（Sakaguchi 等，2019）的结果。

图 68：下游任务 SciQ（Welbl 等，2017）、HellaSwag（Zellers 等，2019）和 PIQA（Bisk 等，2019）的结果。
<!-- page 58 of 64 -->

GAB

80 Atomic Content, Dedup, PII, Toxic

Atomic Content

O.9 Strategies to Format Conversational Forums Pipeline

70

Partial Threads, Dedup

60

Complete Threads

Partial Threads

50

4chan

Perplexity

50 Atomic Content, Dedup, PII, Toxic

40

Atomic Content

40

Partial Threads, Dedup

Complete Threads

30

0 20B 40B 60B 30

Partial Threads

Total Tokens

Perplexity

ICE

20

100 Atomic Content, Dedup, PII, Toxic

90

Atomic Content

80

0 20B 40B 60B

Partial Threads, Dedup

70

Complete Threads

Total Tokens

60

Partial Threads

Pile

Perplexity

50

90 Atomic Content, Dedup, PII, Toxic

80

70

Atomic Content

40

60

Partial Threads, Dedup

Complete Threads

50

0 20B 40B 60B

Partial Threads

40

Total Tokens

Perplexity

M2D2 (Wiki)

30

90

80

Atomic Content, Dedup, PII, Toxic

70

Atomic Content

60

0 20B 40B 60B 20

Partial Threads, Dedup

Complete Threads

50

Total Tokens

Partial Threads

C4 (100 Domains)

40

Perplexity

70 Atomic Content, Dedup, PII, Toxic

30

60

Atomic Content

Partial Threads, Dedup

50

Complete Threads

0 20B 40B 60B

40

Partial Threads

Total Tokens

Perplexity

30

0 20B 40B 60B

Total Tokens

Figure 71: Perplexity results on Paloma (Magnusson et al., 2023); subsets Gab (Zannettou et al., 2018), ICE (Greenbaum, 1991), and M2D2 (Reid et al., 2022) (Wiki)

TwitterAEE

100

Atomic Content, Dedup, PII, Toxic

90

Atomic Content

Figure 69: Perplexity results on Paloma (Magnus- son et al., 2023); subsets 4chan (Papasavva et al., 2020), Pile (Gao et al., 2020) (Val), and C4 100 dom (Chronopoulou et al., 2022)

80

Partial Threads, Dedup

Complete Threads

70

Partial Threads

60

Perplexity

C4

90

50

Atomic Content, Dedup, PII, Toxic

80

Atomic Content

70

0 20B 40B 60B

Partial Threads, Dedup

60

Total Tokens

Complete Threads

50

mC4 (English)

Partial Threads

100

Perplexity

40

90

Atomic Content, Dedup, PII, Toxic

80

Atomic Content

70

30

Partial Threads, Dedup

60

Complete Threads

0 20B 40B 60B

50

Partial Threads

Total Tokens

Perplexity

40

Manosphere

30

50 Atomic Content, Dedup, PII, Toxic

Atomic Content

0 20B 40B 60B

40

Partial Threads, Dedup

Total Tokens

Complete Threads

M2D2 (S2ORC)

Partial Threads

30

Perplexity

90 Atomic Content, Dedup, PII, Toxic

Atomic Content

Partial Threads, Dedup

80

Complete Threads

0 20B 40B 60B 20

70

Partial Threads

Total Tokens

Perplexity

60

50

0 20B 40B 60B

Total Tokens

Figure 70: Perplexity results on Paloma (Magnusson et al., 2023); subsets C4 (Raffel et al., 2020; Dodge et al., 2021) and Manosphere (Ribeiro et al., 2021)

Figure 72: Perplexity results on Paloma (Magnusson et al., 2023); subsets Twitter AAE (Blodgett et al., 2016), mC4 (Xue et al., 2020) (English), and M2D2 (Reid et al., 2022) (S2ORC)

### 第 58 页中文译文

### O.9 对话论坛处理流水线的格式化策略

本页各图以总词元数为横轴、困惑度为纵轴，比较五种论坛文本构造与过滤方式：Atomic Content, Dedup, PII, Toxic（原子内容，并执行去重、PII 与有毒内容过滤）；Atomic Content（原子内容）；Partial Threads, Dedup（部分主题串并去重）；Complete Threads（完整主题串）；Partial Threads（部分主题串）。

图 69：Paloma（Magnusson 等，2023）上的困惑度结果；子集为 4chan（Papasavva 等，2020）、Pile 验证集（Gao 等，2020）和 C4 的 100 个域名（Chronopoulou 等，2022）。

图 70：Paloma 上的困惑度结果；子集为 C4（Raffel 等，2020；Dodge 等，2021）和 Manosphere（Ribeiro 等，2021）。

图 71：Paloma 上的困惑度结果；子集为 GAB（Zannettou 等，2018）、ICE（Greenbaum，1991）和 M2D2（Reid 等，2022）的 Wiki 子集。

图 72：Paloma 上的困惑度结果；子集为 Twitter AAE（Blodgett 等，2016）、mC4（Xue 等，2020）的英语部分和 M2D2（Reid 等，2022）的 S2ORC 子集。
<!-- page 59 of 64 -->

OpenBookQA

0.32

0.3

0.28

Atomic Content, Dedup, PII, Toxic

Atomic Content

Accuracy

0.26

Partial Threads, Dedup

Complete Threads

0.24

Partial Threads

0 20B 40B 60B

Total Tokens

ARC-Easy

0.5

0.45

Atomic Content, Dedup, PII, Toxic

Atomic Content

Accuracy

0.4

Partial Threads, Dedup

Complete Threads

Partial Threads

0.35

0 20B 40B 60B

Total Tokens

Winogrande

0.56

0.54

Atomic Content, Dedup, PII, Toxic

Atomic Content

Accuracy

0.52

Partial Threads, Dedup

Complete Threads

0.5

Partial Threads

0 20B 40B 60B

Total Tokens

Train

Atomic Content

8 9 10 Atomic Content, Dedup, PII, Toxic

7

Partial Threads, Dedup

Figure 73: Results downstream tasks Open- BookQA (Mihaylov et al., 2018), ARC-E (Clark et al., 2018), and WinoGrande (Sakaguchi et al., 2019)

6

Complete Threads

5

Partial Threads

4

Cross Entropy

3

0 20B 40B 60B

SciQ

Total Tokens

0.8

Figure 75: Training Cross Entropy

0.7

Atomic Content, Dedup, PII, Toxic

Atomic Content

Accuracy

0.6

Partial Threads, Dedup

Complete Threads

0.5

Partial Threads

0 20B 40B 60B

Total Tokens

HellaSwag

0.5

0.45

0.4

Atomic Content, Dedup, PII, Toxic

Atomic Content

Accuracy

0.35

Partial Threads, Dedup

Complete Threads

0.3

Partial Threads

0 20B 40B 60B

Total Tokens

PIQA

0.7

0.65

Atomic Content, Dedup, PII, Toxic

Atomic Content

Accuracy

Partial Threads, Dedup

0.6

Complete Threads

Partial Threads

0 20B 40B 60B

Total Tokens

Figure 74: Results downstream tasks SciQ (Welbl et al., 2017), HellaSwag (Zellers et al., 2019), and PIQA (Bisk et al., 2019)

### 第 59 页中文译文

本页以总词元数为横轴。下游任务图以准确率为纵轴，训练图以交叉熵为纵轴；均比较五种论坛文本方案：原子内容并执行去重、PII 与有毒内容过滤；原子内容；部分主题串并去重；完整主题串；部分主题串。

图 73：下游任务 OpenBookQA（Mihaylov 等，2018）、ARC-Easy（Clark 等，2018）和 WinoGrande（Sakaguchi 等，2019）的结果。

图 74：下游任务 SciQ（Welbl 等，2017）、HellaSwag（Zellers 等，2019）和 PIQA（Bisk 等，2019）的结果。

图 75：训练交叉熵。
<!-- page 60 of 64 -->

GAB

80 No Filtering

PII + NSFW + Hate Filter

O.10 Evaluating Toxicity Filtering in Conversational Forums Pipeline

70

NSFW + Hate Filter

60

50

4chan

Perplexity

No Filtering

40

PII + NSFW + Hate Filter

30

NSFW + Hate Filter

0 20B 40B 60B 30

Total Tokens

Perplexity

ICE

20

100

No Filtering

90

PII + NSFW + Hate Filter

80

0 20B 40B 60B

NSFW + Hate Filter

Total Tokens

70

Pile

60

Perplexity

70 No Filtering

60

PII + NSFW + Hate Filter

50

NSFW + Hate Filter

50

0 20B 40B 60B

40

Total Tokens

Perplexity

M2D2 (Wiki)

30

80 No Filtering

70

PII + NSFW + Hate Filter

60

0 20B 40B 60B

NSFW + Hate Filter

Total Tokens

50

C4 (100 Domains)

40

Perplexity

70 No Filtering

60

30

PII + NSFW + Hate Filter

NSFW + Hate Filter

50

0 20B 40B 60B

40

Total Tokens

Perplexity

30

0 20B 40B 60B

Total Tokens

Figure 78: Perplexity results on Paloma (Magnusson et al., 2023); subsets Gab (Zannettou et al., 2018), ICE (Greenbaum, 1991), and M2D2 (Reid et al., 2022) (Wiki)

TwitterAEE

80 No Filtering

PII + NSFW + Hate Filter

Figure 76: Perplexity results on Paloma (Magnus- son et al., 2023); subsets 4chan (Papasavva et al., 2020), Pile (Gao et al., 2020) (Val), and C4 100 dom (Chronopoulou et al., 2022)

NSFW + Hate Filter

70

60

Perplexity

C4

50

80 No Filtering

PII + NSFW + Hate Filter

70

0 20B 40B 60B

NSFW + Hate Filter

60

Total Tokens

mC4 (English)

50

Perplexity

80 No Filtering

40

70

PII + NSFW + Hate Filter

60

NSFW + Hate Filter

30

50

0 20B 40B 60B

Total Tokens

Perplexity

40

Manosphere

30

No Filtering

PII + NSFW + Hate Filter

40

0 20B 40B 60B

NSFW + Hate Filter

Total Tokens

M2D2 (S2ORC)

30

90

Perplexity

No Filtering

PII + NSFW + Hate Filter

80

NSFW + Hate Filter

0 20B 40B 60B 20

70

Total Tokens

Perplexity

60

0 20B 40B 60B

Total Tokens

Figure 77: Perplexity results on Paloma (Magnusson et al., 2023); subsets C4 (Raffel et al., 2020; Dodge et al., 2021) and Manosphere (Ribeiro et al., 2021)

Figure 79: Perplexity results on Paloma (Magnusson et al., 2023); subsets Twitter AAE (Blodgett et al., 2016), mC4 (Xue et al., 2020) (English), and M2D2 (Reid et al., 2022) (S2ORC)

### 第 60 页中文译文

### O.10 评估对话论坛处理流水线中的有毒内容过滤

本页各图以总词元数为横轴、困惑度为纵轴，比较三种方案：No Filtering（不过滤）；PII + NSFW + Hate Filter（PII、NSFW 与仇恨内容过滤）；NSFW + Hate Filter（NSFW 与仇恨内容过滤）。

图 76：Paloma（Magnusson 等，2023）上的困惑度结果；子集为 4chan（Papasavva 等，2020）、Pile 验证集（Gao 等，2020）和 C4 的 100 个域名（Chronopoulou 等，2022）。

图 77：Paloma 上的困惑度结果；子集为 C4（Raffel 等，2020；Dodge 等，2021）和 Manosphere（Ribeiro 等，2021）。

图 78：Paloma 上的困惑度结果；子集为 GAB（Zannettou 等，2018）、ICE（Greenbaum，1991）和 M2D2（Reid 等，2022）的 Wiki 子集。

图 79：Paloma 上的困惑度结果；子集为 Twitter AAE（Blodgett 等，2016）、mC4（Xue 等，2020）的英语部分和 M2D2（Reid 等，2022）的 S2ORC 子集。
<!-- page 61 of 64 -->

OpenBookQA

0.32

0.3

0.28

Accuracy

No Filtering

PII + NSFW + Hate Filter

0.26

NSFW + Hate Filter

0 20B 40B 60B

Total Tokens

ARC-Easy

0.5

0.45

Accuracy

0.4

No Filtering

PII + NSFW + Hate Filter

NSFW + Hate Filter

0 20B 40B 60B 0.35

Total Tokens

Winogrande

0.56

0.54

0.52

Accuracy

No Filtering

0.5

PII + NSFW + Hate Filter

NSFW + Hate Filter

0 20B 40B 60B

Total Tokens

Train

9 10 No Filtering

PII + NSFW + Hate Filter

8

NSFW + Hate Filter

Figure 80: Results downstream tasks Open- BookQA (Mihaylov et al., 2018), ARC-E (Clark et al., 2018), and WinoGrande (Sakaguchi et al., 2019)

7

6

5

Cross Entropy

4

3

0 20B 40B 60B

SciQ

Total Tokens

0.8

Figure 82: Training Cross Entropy

0.7

Accuracy

0.6

No Filtering

PII + NSFW + Hate Filter

NSFW + Hate Filter

0.5

0 20B 40B 60B

Total Tokens

HellaSwag

0.45

0.4

Accuracy

0.35

No Filtering

PII + NSFW + Hate Filter

0.3

NSFW + Hate Filter

0 20B 40B 60B

Total Tokens

PIQA

0.7

0.65

Accuracy

No Filtering

0.6

PII + NSFW + Hate Filter

NSFW + Hate Filter

0 20B 40B 60B

Total Tokens

Figure 81: Results downstream tasks SciQ (Welbl et al., 2017), HellaSwag (Zellers et al., 2019), and PIQA (Bisk et al., 2019)

### 第 61 页中文译文

本页以总词元数为横轴。下游任务图以准确率为纵轴，训练图以交叉熵为纵轴；均比较三种方案：不过滤；PII、NSFW 与仇恨内容过滤；NSFW 与仇恨内容过滤。

图 80：下游任务 OpenBookQA（Mihaylov 等，2018）、ARC-Easy（Clark 等，2018）和 WinoGrande（Sakaguchi 等，2019）的结果。

图 81：下游任务 SciQ（Welbl 等，2017）、HellaSwag（Zellers 等，2019）和 PIQA（Bisk 等，2019）的结果。

图 82：训练交叉熵。
<!-- page 62 of 64 -->

50 Manosphere

O.11 Training OLMo-1B

40

4chan

30

30

Perplexity

20

20

1T 2T 3T

Perplexity

Total Tokens

1T 2T 3T 9 10

Total Tokens

Figure 85: Perplexity results on Paloma (Magnusson et al., 2023); subsets Manosphere (Ribeiro et al., 2021)

Dolma (Reddit)

mC4 (English)

40

30

30

Perplexity

20

20

Perplexity

1T 2T 3T

Total Tokens

Dolma (peS2o v2)

1T 2T 3T

30

Total Tokens

M2D2 (S2ORC)

20

40

Perplexity

30

Perplexity

10

1T 2T 3T 9

Total Tokens

20

1T 2T 3T

Total Tokens

C4

40

Figure 83: Perplexity results on Paloma (Magnusson et al., 2023); subsets 4chan (Papasavva et al., 2020), Dolma Reddit Subset, and Dolma Papers Subset

30

Perplexity

20

ICE

40

1T 2T 3T

30

Total Tokens

Perplexity

20

1T 2T 3T

Total Tokens

Figure 86: Perplexity results on Paloma (Magnusson et al., 2023); subsets mC4 (Xue et al., 2020) (English), M2D2 (Reid et al., 2022) (S2ORC), and C4 (Raffel et al., 2020; Dodge et al., 2021)

M2D2 (Wiki)

40

30

20

Perplexity

1T 2T 3T

Total Tokens

TwitterAEE

50

40

Perplexity

1T 2T 3T

Total Tokens

Figure 84: Perplexity results on Paloma (Magnus- son et al., 2023); subsets ICE (Greenbaum, 1991), M2D2 (Reid et al., 2022) (Wiki), and Twitter AAE (Blodgett et al., 2016)

### 第 62 页中文译文

### O.11 训练 OLMo-1B

本页曲线展示 OLMo-1B 在训练总词元数从 1T 增长至 3T 时的困惑度变化。

图 83：Paloma（Magnusson 等，2023）上的困惑度结果；子集为 4chan（Papasavva 等，2020）、Dolma Reddit 子集和 Dolma 论文子集（peS2o v2）。

图 84：Paloma 上的困惑度结果；子集为 ICE（Greenbaum，1991）、M2D2（Reid 等，2022）的 Wiki 子集和 Twitter AAE（Blodgett 等，2016）。

图 85：Paloma 上的困惑度结果；子集为 Manosphere（Ribeiro 等，2021）。

图 86：Paloma 上的困惑度结果；子集为 mC4（Xue 等，2020）的英语部分、M2D2（Reid 等，2022）的 S2ORC 子集和 C4（Raffel 等，2020；Dodge 等，2021）。
<!-- page 63 of 64 -->

Penn Treebank

WikiText-103

50

40

40

30

30

Perplexity

20

Perplexity

20

1T 2T 3T

1T 2T 3T

Total Tokens

Total Tokens

Dolma (Wiki)

Dolma (Stack v5)

30

9 10

8

7

20

6

Perplexity

5

Perplexity

4

3

1T 2T 3T 10

1T 2T 3T

Total Tokens

Total Tokens

GAB

Dolma (Common Crawl)

50

40

40

30

Perplexity

20

Perplexity

30

1T 2T 3T

1T 2T 3T

Total Tokens

Total Tokens

Figure 89: Perplexity results on Paloma (Magnusson et al., 2023); subsets WikiText 103 (Merity et al., 2016), Dolma Code Subset, and Dolma Web Subset

Figure 87: Perplexity results on Paloma (Magnusson et al., 2023); subsets Penn Tree Bank (Marcus et al., 1994), Dolma Wikipedia Subset, and Gab (Zannettou et al., 2018)

OpenBookQA

30 Pile

20

0.35

Perplexity

Accuracy

0.3

10

9

1T 2T 3T 8

1T 2T 3T 0.25

Total Tokens

Total Tokens

Dolma (Books)

ARC-Easy

40

0.6

30

0.5

Perplexity

Accuracy

20

0.4

1T 2T 3T

1T 2T 3T 0.3

Total Tokens

Total Tokens

C4 (100 Domains)

Winogrande

0.6

30

20

0.55

Perplexity

Accuracy

0.5

1T 2T 3T

1T 2T 3T

Total Tokens

Total Tokens

Figure 90: Results downstream tasks Open- BookQA (Mihaylov et al., 2018), ARC-E (Clark et al., 2018), and WinoGrande (Sakaguchi et al., 2019)

Figure 88: Perplexity results on Paloma (Magnusson et al., 2023); subsets Pile (Gao et al., 2020) (Val), Dolma Books Subset, and C4 100 dom (Chronopoulou et al., 2022)

### 第 63 页中文译文

本页图表以训练总词元数（1T、2T、3T）为横轴；语料拟合图的纵轴为困惑度，下游任务图的纵轴为准确率。

图 87：Paloma（Magnusson 等，2023）上的困惑度结果；子集为 Penn Treebank（Marcus 等，1994）、Dolma Wikipedia 子集和 GAB（Zannettou 等，2018）。

图 88：Paloma 上的困惑度结果；子集为 Pile 验证集（Gao 等，2020）、Dolma 书籍子集和 C4 的 100 个域名（Chronopoulou 等，2022）。

图 89：Paloma 上的困惑度结果；子集为 WikiText-103（Merity 等，2016）、Dolma 代码子集（Stack v5）和 Dolma 网页子集（Common Crawl）。

图 90：下游任务 OpenBookQA（Mihaylov 等，2018）、ARC-Easy（Clark 等，2018）和 WinoGrande（Sakaguchi 等，2019）的结果。
<!-- page 64 of 64 -->

SciQ

0.8

0.6

Accuracy

0.4

1T 2T 3T

Total Tokens

HellaSwag

0.6

0.5

Accuracy

0.4

0.3

1T 2T 3T

Total Tokens

PIQA

0.75

0.7

0.65

Accuracy

0.6

1T 2T 3T 0.55

Total Tokens

Figure 91: Results downstream tasks SciQ (Welbl et al., 2017), HellaSwag (Zellers et al., 2019), and PIQA (Bisk et al., 2019)

Train

9

8

7

6

5

4

Cross Entropy

3

1T 2T 3T

Total Tokens

Figure 92: Training Cross Entropy

### 第 64 页中文译文

本页图表以训练总词元数（1T、2T、3T）为横轴。下游任务图的纵轴为准确率，训练图的纵轴为交叉熵。

图 91：下游任务 SciQ（Welbl 等，2017）、HellaSwag（Zellers 等，2019）和 PIQA（Bisk 等，2019）的结果。

图 92：训练交叉熵。
