---
title: "Paloma??????????????????"
category: "?????"
tags: ["Paloma", "???", "????", "???", "????"]
published: true
excerpt: "Paloma ?????????????????????????????????????????"
---

<!-- arXiv 2312.10523; 文字由 PyMuPDF 按页抽取, 公式与表以 data/sources/paloma/latex/ 的 LaTeX 源码为准 -->

<!-- page 1 of 39 -->

Paloma : A Benchmark for Evaluating Language

Model Fit

Ian Magnusson♠ Akshita Bhagia♠ Valentin Hofmann♠ Luca Soldaini♠

Ananya Harsh Jha♠ Oyvind Tafjord♠ Dustin Schwenk♠ Evan Pete Walsh♠

Yanai Elazar♠♢ Kyle Lo♠ Dirk Groeneveld♠ Iz Beltagy♠ Hannaneh Hajishirzi♠♢

Noah A. Smith♠♢ Kyle Richardson♠ Jesse Dodge♠

♠Allen Institute for Artificial Intelligence ♢Paul G. Allen School of Computer Science & Engineering, University of Washington {ianm,jessed}@allenai.org

♠艾伦人工智能研究所 ♢华盛顿大学 Paul G. Allen 计算机科学与工程学院 {ianm,jessed}@allenai.org

Abstract（摘要）

Evaluations of language models (LMs) commonly report perplexity on monolithic data held out from training. Implicitly or explicitly, this data is composed of do- mains—varying distributions of language. We introduce PERPLEXITY ANALYSIS FOR LANGUAGE MODEL ASSESSMENT (PALOMA)1, a benchmark to measure LM fit to 546 English and code domains, instead of assuming perplexity on one distribution extrapolates to others. We include two new datasets of the top 100 subreddits (e.g., r/depression on Reddit) and programming languages (e.g., Java on GitHub), both sources common in contemporary LMs. With our benchmark, we release 6 baseline 1B LMs carefully controlled to provide fair comparisons about which pretraining corpus is best and code for others to apply those controls to their own experiments. Our case studies demonstrate how the fine-grained results from PALOMA surface findings such as that models pretrained without data beyond Common Crawl exhibit anomalous gaps in LM fit to many domains or that loss is dominated by the most frequently occurring strings in the vocabulary.

语言模型 (LM) 的评估通常会报告训练中保留的整体数据的困惑。隐式或显式地，这些数据由不同的语言分布域组成。我们引入了语言模型评估的困惑度分析 (PALOMA)1，这是一个衡量 LM 适合 546 个英语和代码域的基准，而不是假设一种分布的困惑度可以推断到其他分布。我们包含了前 100 个 Reddit 子版块（例如 Reddit 上的 r/depression）和编程语言（例如 GitHub 上的 Java）的两个新数据集，这两个数据源在当代 LM 中都很常见。通过我们的基准测试，我们发布了 6 个精心控制的基线 1B LM，以提供关于哪个预训练语料库最好的公平比较，并为其他人编写代码以将这些控制应用到他们自己的实验中。我们的案例研究证明了 PALOMA 表面发现的细粒度结果（例如在没有 Common Crawl 之外的数据的情况下预训练的模型）如何在 LM 中表现出异常的间隙，适合许多领域，或者损失是由词汇表中最常出现的字符串主导的。

1 Introduction（引言）

arXiv:2312.10523v2  [cs.CL]  7 Dec 2024

Progress in AI is catalyzed by evaluations that define new ways of measuring progress (Deng et al., 2009, Wang et al., 2018, and Wang et al., 2019, inter alia). Language models (LMs) often evaluate LM fit as loss or perplexity [Jelinek et al., 1977] on held out training data or few traditional test sets (Chelba et al., 2013, Merity et al., 2016, inter alia). These loss measures have been shown to improve predictably with increases in training compute [Kaplan et al., 2020, Hoffmann et al., 2022] and loss may predict performance on downstream tasks [Xia et al., 2022, Gadre et al., 2024, Du et al., 2024]. However, scaling pretraining data aggregates more domains that LMs implicitly learn to model [Diaz and Madaio, 2023, Aharoni and Goldberg, 2020]. Does rising performance lift all data? Or do some domains capture most improvement in LM fit? How do we evaluate what language distributions models learn from different pretraining data? What domains should studies evaluate loss on to measure the relationship of loss and downstream performance? To answer these questions, perplexity evaluations ought to measure LM fit to many domains, rather than extrapolating trends from a single prescriptive mix of domains.

定义衡量进展的新方法的评估促进了人工智能的进步（Deng 等人，2009 年；Wang 等人，2018 年；Wang 等人，2019 年等）。语言模型 (LM) 通常将 LM 拟合评估为损失或困惑 [Jelinek 等人，1977] 在保留的训练数据或少数传统测试集上（Chelba 等人，2013 年，Merity 等人，2016 年等）。事实证明，随着训练计算量的增加，这些损失度量会得到可预测的改善 [Kaplan et al., 2020, Hoffmann et al., 2022]，并且损失可以预测下游任务的性能 [Xia et al., 2022, Gadre et al., 2024, Du et al., 2024]。然而，扩展预训练数据聚合了更多领域，LM 隐式学习建模 [Diaz 和 Madaio，2023，Aharoni 和 Goldberg，2020]。性能的提升是否会提升所有数据？或者某些领域是否获得了 LM 拟合的最大改进？我们如何评估语言分布模型从不同的预训练数据中学习什么？应研究哪些领域来评估损失以衡量损失与下游绩效的关系？为了回答这些问题，困惑度评估应该衡量 LM 对许多领域的拟合程度，而不是从单个规定的领域组合中推断趋势。

1Dataset and links to code repository are available at https://paloma.allen.ai

38th Conference on Neural Information Processing Systems (NeurIPS 2024) Track on Datasezts and Benchmarks.

<!-- page 2 of 39 -->

1B Models

The Pile C4 Dolma

mC4-en RedPajama Falcon RefinedWeb

In this work we introduce PALOMA, a benchmark to study LM fit on many do- mains. We measure perplexity on different distributions of language sampled from 16 sources, such as C4 [Raffel et al., 2019], that have metadata such as URLs mark- ing 546 textual domains. Beyond evalu- ation data, we aim to enable and enrich fair comparisons for scientific research on language modeling with the following ar- tifacts: guidelines for comparing LM fit, 6 baseline 1B parameter models pretrained on popular corpora, and standardized code for experiments with PALOMA.

在这项工作中，我们介绍了 PALOMA，这是一个研究许多领域的 LM 拟合的基准。我们测量了从 16 个来源（例如 C4 [Raffel et al., 2019]）采样的语言的不同分布的困惑度，这些来源具有标记 546 个文本域的 URL 等元数据。除了评估数据之外，我们的目标是通过以下工件实现和丰富语言建模科学研究的公平比较：比较 LM 拟合的指南、在流行语料库上预训练的 6 个基线 1B 参数模型以及 PALOMA 实验的标准化代码。

14 15 16 17 19 20 22 24 25 28 30 Perplexity

20 35 70 150 Tokens Seen (billions)

Figure 1: Perplexity on PALOMA for baselines pre- trained with our experimental controls such as bench- mark decontamination. We measure fit over diverse sources beyond data held-out from training. PALOMA enables loss comparisons between different models, such as this figure where pretraining data is varied while all other factors are controlled. This measurement ex- cludes documents from fringe sources and code data not supported by our decontamination approach.

As reproducing pretrained models for every new project is onerous, we provide stan- dard training controls for benchmark de- contamination and training data order to or- chestrate a greater density of comparisons across the research community. We also control how PALOMA is evaluated by fixing sample size per domain, model vocabulary, and inference format. Lastly, we demon- strate how to make fair comparisons over two measures of cost, number of model parameters and training tokens, enabling assessment of hardware-agnostic efficiency and the measurement of scaling trends.

由于为每个新项目复制预训练模型非常繁重，因此我们为基准去污染和训练数据提供标准训练控制，以便在整个研究界进行更高密度的比较。我们还通过固定每个域的样本大小、模型词汇和推理格式来控制 PALOMA 的评估方式。最后，我们演示如何对成本、模型参数数量和训练令牌的两种度量进行公平比较，从而能够评估与硬件无关的效率和衡量扩展趋势。

Among the 16 sources curated in our benchmark, we contribute two new datasets constructed from data held out of DOLMA [Soldaini et al., 2024]: (1) a subsample of the top 100 subreddits by number of comments, and (2) code from the top 100 programming languages by number of tokens. Also, we repurpose corpora of fringe online communities to measure LM fit to discourse previously studied for the prevalence of toxicity and hate speech [Ribeiro et al., 2021, Zannettou et al., 2018, Papasavva et al., 2020]. While, capturing domains required by all possible lines of research is impossible for any one benchmark, PALOMA focuses on English and code data and aims to assemble the most fine-grained domains readily identifiable from existing metadata.

在我们的基准测试中策划的 16 个来源中，我们贡献了两个根据 DOLMA [Soldaini et al., 2024] 保留的数据构建的新数据集：(1) 按评论数量排名前 100 名的 subreddits 的子样本，以及 (2) 按标记数量排名前 100 种编程语言的代码。此外，我们重新利用边缘在线社区的语料库来衡量 LM 与先前研究的毒性和仇恨言论流行程度的话语的契​​合度 [Ribeiro et al., 2021; Zannettou et al., 2018; Papasavva et al., 2020]。虽然对于任何一种基准来说，捕获所有可能的研究领域所需的领域都是不可能的，但 PALOMA 专注于英语和代码数据，旨在组装可从现有元数据中轻松识别的最细粒度的领域。

To demonstrate possible uses of results from our dataset, we present a series of case studies in §4. Among other findings, our experiments isolate change in fit from which pretraining corpus is used (Figure 1) and find that pretraining without heterogeneous data sources beyond Common Crawl can lead to perplexities in some domains that do not improve consistently with number of tokens seen. We also find that few vocabulary types account for most of the loss measured in perplexity.

为了证明我们的数据集结果的可能用途，我们在第 4 节中介绍了一系列案例研究。除其他发现外，我们的实验将使用预训练语料库的拟合变化隔离开来（图 1），并发现在没有 Common Crawl 之外的异构数据源的情况下进行预训练可能会导致某些领域的困惑，这些困惑不会随着所看到的标记数量的改善而一致。我们还发现，少数词汇类型占了困惑度测量损失的大部分。

In sum, PALOMA contributes:

1. Curated release of the most fine-grained perplexity evaluation data in use in LM research, along with guidelines and code for standardized and rigorous perplexity evaluation.

1. 策划发布LM研究中使用的最细粒度的困惑度评估数据，以及标准化和严格的困惑度评估的指南和代码。

2. New evaluation data for the 100 most popular subreddits and programming languages.

3. 1B LMs pretrained on C4, MC4-EN, FALCON REFINEDWEB, THE PILE, REDPAJAMA, and DOLMA with controlled hyperparameters, token budget, benchmark decontamination, and training order for fair comparisons, along with code for others to do the same.

3. 1B LM 在 C4、MC4-EN、FALCON REFINEDWEB、THE PILE、REDPAJAMA 和 DOLMA 上进行预训练，具有受控的超参数、代币预算、基准净化和公平比较的训练顺序，以及其他人执行相同操作的代码。

4. Case studies demonstrating analyses that are possible with PALOMA, such as finding that pretraining without data beyond Common Crawl leads to inconsistent fit to many domains and that perplexity is driven by improved fit on the most common vocabulary strings.

4. 案例研究展示了可以使用 PALOMA 进行的分析，例如发现在没有 Common Crawl 之外的数据的情况下进行预训练会导致对许多领域的拟合不一致，并且困惑是由对最常见词汇字符串的拟合度提高而导致的。

2

<!-- page 3 of 39 -->

2 Sources of evaluation data（评测数据来源）

Purpose Source Val. + Test Tokens Domains Tokens per Split per Domain

Standard language modeling benchmarks

C4 [Raffel et al., 2019] 2,000,000 1 1,000,000 MC4-EN [Chung et al., 2023] 2,000,000 1 1,000,000 WIKITEXT-103 [Merity et al., 2016] 531,103 1 265,552 PENN TREEBANK [Marcus et al., 1999] 191,735 1 95,868 REDPAJAMA [Together Computer, 2023] 1,399,946 7 99,996 FALCON REFINEDWEB [Penedo et al., 2023] 2,000,000 1 1,000,000 DOLMA [Soldaini et al., 2024] 5,994,901 6 499,575

Fine-grained domain benchmarks

M2D2 S2ORC [Reid et al., 2022] 33,374,351 167 99,923 M2D2 WIKIPEDIA [Reid et al., 2022] 9,780,719 49 99,803 C4-100-DOMAINS [Chronopoulou et al., 2022] 19,609,392 99 99,037 DOLMA-100-SUBREDDITS [Soldaini et al., 2024] 19,360,263 100 96,801 DOLMA-100-PROGRAMMING-LANGUAGES [Soldaini et al., 2024] 19,999,613 100 99,998

Disparities TWITTERAAE [Blodgett et al., 2016] 1,441,263 2 360,316

Fringe sources

MANOSPHERE CORPUS [Ribeiro et al., 2021] 1,999,915 9 111,106 GAB CORPUS [Zannettou et al., 2018] 2,000,000 1 1,000,000 4CHAN CORPUS [Papasavva et al., 2020] 2,000,000 1 1,000,000

PALOMA 123,683,201 546 113,263

Table 1: The 16 data sources sampled to create language modeling evaluations in PALOMA (§2), organized by the purpose for inclusion. These coarse-grained sources contain finer-grained domains, which use metadata to distinguish distinctive distributions of language such as a subreddit for discussing board games. PALOMA aims to enable research on differences in LM fit over hundreds of domains by curating and standardizing the text datasets with the most fine-grained domains readily available from existing metadata. We target a minimum of 100 thousand tokens per domain and 1 million tokens per source to select a balance between inference cost and metric variance.

We define two terms: Sources are as existing datasets (or curated subsets there of) in use for research. Domains are fine-grained partitions of sources based on available metadata that attempt to surface a distinct and intuitive distribution of language (e.g., Wikipedia articles about visual arts or a subreddit for advice on PC builds). PALOMA is derived from 16 sources further divided into 546 domains (see Table 1).2 Where we curate previous fine-grained corpora, we inherit their operationalization of domains, ranging from the community-driven Wikipedia ontology to expert curation and automatic classification. Where we build our own fine-grained domains from Reddit and GitHub, we make similar use of metadata about subreddits and file extensions.

我们定义两个术语：来源是用于研究的现有数据集（或其精选子集）。域是基于可用元数据的细粒度资源划分，试图呈现独特且直观的语言分布（例如，有关视觉艺术的维基百科文章或有关 PC 构建建议的 Reddit 子版块）。 PALOMA 源自 16 个来源，进一步分为 546 个领域（见表 1）。2 在我们整理以前的细粒度语料库时，我们继承了它们的领域操作化，范围从社区驱动的维基百科本体到专家管理和自动分类。当我们从 Reddit 和 GitHub 构建自己的细粒度域时，我们会类似地使用有关 subreddits 和文件扩展名的元数据。

Compared to monitoring monolithic validation loss during model development, interpreting LM fit to specific fine-grained domains poses unique challenges. Crucially, we must not assume better LM fit to a domain reflects improvements in the specific skills that are valued by the humans producing language in that domain [Diaz and Madaio, 2023]. For instance, we might expect overlapping domains for academic papers in both DOLMA and REDPAJAMA to exhibit similar perplexities for a given model, perhaps assuming perplexity represents how much a model captures knowledge about relevant academic fields. But domains can also differ due to preprocessing when texts were collected in each source rather than from how texts were composed by their original authors. So instead of relying on LM fit to measure what we think a model should learn about a domain, we examine anomalies in domain fit to see what a model is learning. We find that the same model can have 391,171 perplexity on arXiv in REDPAJAMA and 14 on the overlapping academic domain, peS2o, in DOLMA (§4.1). In this approach we follow Holtzman et al. [2023] and McCoy et al. [2023] by aiming to examine model behaviors, regardless of their desirability to humans.

与在模型开发过程中监控整体验证损失相比，解释 LM 适合特定细粒度领域带来了独特的挑战。至关重要的是，我们不能假设 LM 更适合某个领域反映了该领域中生成语言的人类所重视的特定技能的改进 [Diaz 和 Madaio，2023]。例如，我们可能期望 DOLMA 和 REDPAJAMA 中学术论文的重叠领域对于给定模型表现出类似的困惑，或许假设困惑代表了模型捕获相关学术领域知识的程度。但是，由于在每个来源中收集文本时的预处理而不是原始作者撰写文本的方式，域也可能有所不同。因此，我们不是依靠 LM 拟合来衡量我们认为模型应该了解某个领域的内容，而是检查领域拟合中的异常情况以了解模型正在学习什么。我们发现同一模型在 REDPAJAMA 中的 arXiv 上有 391,171 个困惑度，在 DOLMA 中的重叠学术领域 peS2o 上有 14 个困惑度（§4.1）。在这种方法中，我们遵循 Holtzman 等人的方法。 [2023]和麦考伊等人。 [2023] 旨在检查模型行为，无论其对人类的期望如何。

Also note that PALOMA focuses on English and code data, as most current LMs also emphasize these types of data. However, we strongly encourage future work to explore fit to fine-grained domains in other languages.

另请注意，PALOMA 专注于英语和代码数据，因为当前大多数 LM 也强调这些类型的数据。然而，我们强烈鼓励未来的工作探索与其他语言的细粒度领域的匹配。

The rest of this section addresses each source, why we include it, and how it identifies any domains it contains (all 546 domains are listed in Appendix E).

本节的其余部分介绍了每个源、我们为何包含它以及它如何识别其包含的任何域（附录 E 中列出了所有 546 个域）。

2Unless stated, token counts are computed with the GPT-NeoX-20B tokenizer [Black et al., 2022].

2除非另有说明，令牌计数是使用 GPT-NeoX-20B 令牌生成器计算的 [Black 等人，2022]。

3

<!-- page 4 of 39 -->

Standard language modeling sources Though it is common practice to evaluate on held out data from the pretraining corpus of a given model, we evaluate across several standard corpora. C4 [Raffel et al., 2019, Dodge et al., 2021] and MC4-EN [Chung et al., 2023] are language model training datasets created by taking the snapshots of Common Crawl data and applying a number of filters with the intention of retaining “high-quality”, natural language. Both datasets are filtered to retain natural English, and in this work we only use the English portion of MC4-EN. WIKITEXT-103 [Merity et al., 2016] and PENN TREEBANK [Marcus et al., 1999] are classic datasets that have been used to evaluate language model perplexity for decades (Radford et al., 2019, Brown et al., 2020, Rae et al., 2021, Hoffmann et al., 2022, inter alia). WIKITEXT-103 is text from Wikipedia articles, and PENN TREEBANK [Marcus et al., 1999] is a set of 1989 Wall Street Journal articles3. REDPAJAMA [Together Computer, 2023] is an attempt at reproducing the data mixture from LLaMA [Touvron et al., 2023] from sources such as webtext, Wikipedia, arXiv, and StackExchange. It was used to train RedPajama-INCITE [Together Computer, 2023]. FALCON REFINEDWEB Penedo et al. [2023] was created from all Common Crawl scrapes until June 2023 by applying relatively interpretable filters, and is a subset of the Falcon models’ training data [Almazrouei et al., 2023]. DOLMA Soldaini et al. [2024] is made of Common Crawl, Wikipedia, books, academic papers, code repositories, and Reddit, and was used to train OLMo models [Groeneveld et al., 2024].

标准语言建模源 虽然评估给定模型的预训练语料库中提供的数据是常见的做法，但我们会跨多个标准语料库进行评估。 C4 [Raffel et al., 2019, Dodge et al., 2021] 和 MC4-EN [Chung et al., 2023] 是通过拍摄 Common Crawl 数据快照并应用多个过滤器创建的语言模型训练数据集，旨在保留“高质量”自然语言。两个数据集都经过过滤以保留自然英语，在这项工作中我们仅使用 MC4-EN 的英语部分。 WIKITEXT-103 [Merity et al., 2016] 和 PENN TREEBANK [Marcus et al., 1999] 是几十年来一直用于评估语言模型困惑度的经典数据集（Radford et al., 2019、Brown et al., 2020、Rae et al., 2021、Hoffmann et al., 2022 等）。 WIKITEXT-103 是来自 Wikipedia 文章的文本，PENN TREEBANK [Marcus et al., 1999] 是一组 1989 年《华尔街日报》文章3。 REDPAJAMA [Together Computer, 2023] 尝试从 Webtext、Wikipedia、arXiv 和 StackExchange 等来源复制 LLaMA [Touvron et al., 2023] 的数据混合。它被用来训练 RedPajama-INCITE [Together Computer, 2023]。 FALCON REFINEDWEB Penedo 等人。 [2023] 是通过应用相对可解释的过滤器从 2023 年 6 月之前的所有 Common Crawl 抓取中创建的，并且是 Falcon 模型训练数据的子集 [Almazrouei et al., 2023]。多尔玛·索尔代尼等人。 [2024] 由 Common Crawl、维基百科、书籍、学术论文、代码存储库和 Reddit 组成，用于训练 OLMo 模型 [Groeneveld et al., 2024]。

Fine-grained domain sources We include datasets with the most fine-grained metadata marking hundreds of domains. M2D2 [Reid et al., 2022] is made of academic papers from S2ORC [Lo et al., 2020] and text from Wikipedia, organized into a two-level hierarchy by academic field categories or Wikipedia ontology, respectively. We sample both top-level domains and lower-level subdomains.

细粒度的域源我们包含具有最细粒度的元数据的数据集，标记了数百个域。 M2D2 [Reid et al., 2022] 由 S2ORC [Lo et al., 2020] 的学术论文和维基百科的文本组成，分别按学术领域类别或维基百科本体组织成两级层次结构。我们对顶级域和较低级子域进行采样。

C4-100-DOMAINS [Chronopoulou et al., 2022] is text from the 100 internet domains with the most pages in C4.4 DOLMA-100-SUBREDDITS and DOLMA-100-PROGRAMMING-LANGUAGES are two evaluation sets we introduce in this work sampled from DOLMA [Soldaini et al., 2024]: the former is text from the top 100 subreddits (ranked by number of posts), and the latter is the top 100 programming languages by number of tokens in the THE STACK [Kocetkov et al., 2022]. See Appendix E for more details.

C4-100-DOMAINS [Chronopoulou et al., 2022] 是来自 C4.4 中页面最多的 100 个互联网域的文本 DOLMA-100-SUBREDDITS 和 DOLMA-100-PROGRAMMING-LANGUAGES 是我们在本工作中引入的两个评估集，采样自 DOLMA [Soldaini et al., 2024]：前者是来自顶部的文本100 个 subreddits（按帖子数量排名），后者是 THE STACK 中令牌数量排名前 100 的编程语言 [Kocetkov et al., 2022]。详细信息请参见附录 E。

Disparities between speech communities LMs today primarily process dominant dialects in countries, such as the US, where they are most often trained and deployed. Even within English, hundreds of millions of people around the world speak other dialects that have been shown to be underserved by existing models [Blodgett et al., 2016]. As a starting point for measuring disparities between dialects, we include TWITTERAAE [Blodgett et al., 2016], two corpora representing African-American and White-aligned English, automatically classified via geolocation information and demographic census statistics. 5

如今，语言社区之间的差异语言学习者主要处理美国等国家的主要方言，这些语言学习者最常在这些国家接受培训和部署。即使在英语中，世界各地也有数亿人说其他方言，这些方言已被证明在现有模型中服务不足 [Blodgett et al., 2016]。作为衡量方言之间差异的起点，我们引入了 TWITTERAAE [Blodgett et al., 2016]，这是两个代表非裔美国人和白人英语的语料库，通过地理位置信息和人口普查统计数据自动分类。 5

Fringe sources previously studied for problematic discourse LM fit to these fringe texts charac- terizes model exposure to distinct social contexts in which toxic language arises. MANOSPHERE [Ribeiro et al., 2021], GAB [Zannettou et al., 2018], and 4CHAN CORPORA [Papasavva et al., 2020] are three fringe corpora which contain larger proportions of hate speech and toxicity than mainstream sources like Wikipedia or Twitter. These texts span 2006-2019 and include independent message boards and subreddits sharing a masculinist ideology, Gab (an alt-right focused Twitter alternative with minimal moderation), and the Politically Incorrect board (/pol/) of 4chan, a fringe imageboard emphasizing anonymity and ephemerality.

先前研究的边缘来源有问题的话语LM适合这些边缘文本，其特征是模型暴露于出现有毒语言的不同社会背景。 MANOSPHERE [Ribeiro et al., 2021]、GAB [Zannettou et al., 2018] 和 4CHAN CORPORA [Papasavva et al., 2020] 是三个边缘语料库，它们比维基百科或 Twitter 等主流来源包含更大比例的仇恨言论和毒性。这些文本跨越 2006 年至 2019 年，包括共享男性主义意识形态的独立留言板和子版块、Gab（一种极右翼的 Twitter 替代品，最低限度的节制）以及 4chan 的政治不正确板 (/pol/)，这是一个强调匿名和短暂性的边缘图像板。

3PENN TREEBANK is pretokenized, and uncommon words are replaced with a special “unknown” token. 4Four of the 100 domains have less than the 100 thousand tokens per split that we aim for. 5We follow the reproduction of this dataset used in HELM [Liang et al., 2022], but we fix an error in loading escaped sequences of the data that, among other issues, renders emojis as literal hexadecimal bytes.

3PENN TREEBANK 已预标记，不常见的单词将被替换为特殊的“未知”标记。 4100 个域中的 4 个域的每次拆分的代币数量低于我们的目标 10 万个。 5我们遵循 HELM [Liang et al., 2022] 中使用的此数据集的复制，但我们修复了加载数据转义序列时的错误，该错误将表情符号呈现为文字十六进制字节。

4

<!-- page 5 of 39 -->

3 Perplexity evaluations done right（正确开展困惑度评测）

Guidelines Fairly evaluating different models using perplexity is hard. To do so, we must account for factors that can confound results with guidelines for training (G1, G2) and evaluation (G3, G4, G5).

指南 使用困惑度公平地评估不同的模型是很困难的。为此，我们必须考虑可能将结果与培训（G1、G2）和评估（G3、G4、G5）指南混淆的因素。

G1 DECONTAMINATION: Remove pretraining data that leaks evaluation data to ensure validity

of perplexity evaluation.

G2 TRAINING ORDER: Where possible, keep the training data order the same to control

G2 TRAINING ORDER：在可能的情况下，保持训练数据顺序相同以进行控制

differences from recency effects.

G3 SUBSAMPLING: Subsample size poses a tradeoff between inference cost and variance. Size

subsamples to tolerate variance equally for each domain.

G4 VOCABULARY: Vocabulary determines the event space of possible sequences and the com-

parability of perplexity measurements. Normalizing likelihood by a segmentation intrinsic to the text (e.g., bytes) partially addresses this, but fixing the vocabulary is preferable.

困惑度测量的比喻性。通过文本固有的分段（例如字节）对可能性进行归一化可以部分解决这个问题，但固定词汇表更好。

G5 EVALUATION FORMAT: Use a consistent implementation of perplexity to ensure compara-

bility regarding engineering details such as the handling maximum sequence lengths.

Experimental controls Our code repository6 releases controls that implement each guideline. Here we briefly explain each (complete specification of our experimental controls is provided in Appendix C).

实验控制 我们的代码存储库6 发布了实现每条指南的控制。在这里，我们简要解释每一个（附录 C 中提供了我们的实验对照的完整规范）。

For G1, we use a Bloom filter [Bloom, 1970] to detect exact match overlaps of pretraining and evaluation data. We match text at the paragraph level, i.e., newline separated spans of text. To avoid coincidental collisions in the space of small strings, we ignore matches in paragraphs smaller than 13 unicode segmented tokens [Unicode, 2023]. Similarly, we ignore paragraphs composed of only punctuation, spaces, and emoji. Lastly, as code data consists almost entirely of short and often repeated lines, we forgo any decontamination on these sources (DOLMA-100-PROGRAMMING- LANGUAGES and the THE STACK domain of DOLMA). Finally, we remove whole pretraining documents if they contain any contaminated paragraph.

对于 G1，我们使用布隆过滤器 [Bloom，1970] 来检测预训练和评估数据的精确匹配重叠。我们在段落级别匹配文本，即换行符分隔的文本范围。为了避免小字符串空间中的巧合冲突，我们忽略小于 13 个 unicode 分段标记 [Unicode，2023] 的段落中的匹配。同样，我们会忽略仅由标点符号、空格和表情符号组成的段落。最后，由于代码数据几乎完全由短且经常重复的行组成，因此我们放弃对这些源（DOLMA-100-PROGRAMMING-LANGUAGES 和 DOLMA 的 STACK 域）进行任何净化。最后，如果整个预训练文档包含任何受污染的段落，我们将删除它们。

For G2, contemporary LMs train on instances that are maximum sequence length concatenations of training documents, so we must fix the order of concatenated instances. We achieve this by fixing the tokenization, maximum sequence length, and random seed, as well as providing dataloading code where order is invariant to number of devices.

对于 G2，当代 LM 在训练文档的最大序列长度串联实例上进行训练，因此我们必须修复串联实例的顺序。我们通过修复标记化、最大序列长度和随机种子，以及提供顺序与设备数量无关的数据加载代码来实现这一点。

For G3, we empirically observe how variance in perplexity over subsamples of C4 evaluation data grows inversely to sample size (Appendix C.2.1). Extrapolating from these results to select desired thresholds for variance, we pick 1 million and 100 thousand tokens as our target size for sources and domains, respectively.

对于 G3，我们凭经验观察 C4 评估数据子样本的困惑度方差如何与样本大小成反比增长（附录 C.2.1）。根据这些结果推断以选择所需的方差阈值，我们分别选择 100 万和 10 万个令牌作为源和域的目标大小。

For G4, where possible we fix model vocabulary to GPT-NeoX-20B’s [Black et al., 2022] with 3 special tokens added by Groeneveld et al. [2024]. When vocabulary must be changed, for instance comparing to off-the-shelf models, we follow THE PILE [Gao et al., 2020] and use bits per byte (BPB; Appendix B).

对于 G4，在可能的情况下，我们将模型词汇修复为 GPT-NeoX-20B 的 [Black et al., 2022]，并添加了 Groeneveld 等人添加的 3 个特殊标记。 [2024]。当必须更改词汇表时，例如与现成模型进行比较，我们遵循 THE PILE [Gao et al., 2020] 并使用每字节位数（BPB；附录 B）。

For G5, we follow the input format established by THE PILE [Gao et al., 2020]. This format evaluates documents individually, rather than packed into concatenated maximum sequence length inputs. Documents longer than maximum sequence length are split into disjoint inputs.

对于 G5，我们遵循 THE PILE [Gao et al., 2020] 建立的输入格式。此格式单独评估文档，而不是打包到串联的最大序列长度输入中。超过最大序列长度的文档被分成不相交的输入。

In Table 2 we compare how PALOMA implements controls for these guidelines against practices in previous LM benchmarks. PALOMA is the first benchmark to remove contamination across all pretraining data. THE PILE [Gao et al., 2020] note that they only address decontamination partially by deduplicating 2 of 22 domains at the document level before splitting. PALOMA is also the first

在表 2 中，我们比较了 PALOMA 如何根据以前的 LM 基准中的实践来实施这些指南的控制。 PALOMA 是第一个消除所有预训练数据污染的基准。 THE PILE [Gao et al., 2020] 指出，他们仅通过在拆分之前在文档级别对 22 个域中的 2 个域进行重复数据删除来部分解决去污问题。 PALOMA也是第一个

6https://github.com/allenai/OLMo-Eval/tree/main/paloma

5

<!-- page 6 of 39 -->

PALOMA

Guideline THE PILE [Gao et al., 2020] M2D2 [Reid et al., 2022]

C4-100-DOMAINS [Chronopoulou et al., 2022]

HELM LM Scenarios [Liang et al., 2022]

G1 DECONTAMINATION partial, doc-level none none not required sub-doc-level G2 TRAINING ORDER not required not required not required not required fixed G3 SUBSAMPLING uniform uniform uniform inherits splits stratified G4 VOCABULARY not required not required not required not required fixed G5 EVALUATION FORMAT no concat or overlap not required not required API dependent no concat or overlap

G1 去污 部分，文档级 无 无 不需要 子文档级 G2 培训顺序 不需要 不需要 不需要 固定 G3 子采样 统一 统一 统一 继承分割 分层 G4 词汇 不需要 不需要 不需要 不需要 固定 G5 评估格式 无连接或重叠 不需要 不需要 API 相关 无连接或重叠

# Domains 22 216 99 14 546

Table 2: Differences between PALOMA and other language modeling benchmarks on guidelines (§3) for experiments of assessing LM fit. Ours is the first perplexity benchmark to remove contaminated training data, fix training order, sample domains equally, and fix vocabulary. We also adopt a controlled inference format from Gao et al. [2020].

contemporary perplexity benchmark to recommend and implement a method to fix the training data order, to apply stratified sampling to evaluation domains, and to recommend fixing vocabulary. THE PILE and HELM also detail their evaluation formats, but we note that HELM’s inference code depends on calls to proprietary APIs which may not remain reproducible for some models.

当代困惑基准推荐和实施一种方法来修复训练数据顺序，将分层抽样应用于评估领域，并建议修复词汇。 THE PILE 和 HELM 还详细介绍了它们的评估格式，但我们注意到 HELM 的推理代码依赖于对专有 API 的调用，而这些 API 对于某些模型来说可能无法重现。

Comparability When using PALOMA to compare models, we recommend that researchers also adopt our experimental controls or note as a limitation to comparability any uncontrolled factors. We also recommend that measures of cost are considered when comparing models on PALOMA, specifically number of model parameters and number of tokens seen in training. Complimentary to work that focuses on realized costs such as energy use, FLOPs, or GPU hours [Peng et al., 2023], we elect to measure these more abstract cost values so that our efficiency comparisons are agnostic to hardware. Finally, as LMs trained with non-constant learning rate schedules scale sub-optimally until improving when learning rate drops towards the end of training, fair comparisons involving intermediate checkpoints should be matched with respect to the portion of total optimization steps completed.

可比性 当使用 PALOMA 比较模型时，我们建议研究人员也采用我们的实验控制或注意任何不受控制的因素作为可比性的限制。我们还建议在比较 PALOMA 上的模型时考虑成本度量，特别是模型参数的数量和训练中看到的令牌的数量。作为对关注能源使用、FLOP 或 GPU 小时等已实现成本的工作的补充 [Peng 等人，2023]，我们选择衡量这些更抽象的成本值，以便我们的效率比较与硬件无关。最后，由于使用非恒定学习率计划训练的 LM 会在训练结束时学习率下降时进行次优扩展，直到有所改善，因此涉及中间检查点的公平比较应与已完成的总优化步骤的部分相匹配。

By providing fair comparisons, the following types of claims about perplexity performance can be made with our benchmark: (1) which among compute-matched models performs best, (2) which models reach a given performance with the least compute, (3) which pretraining corpus produces models with best performance, (4) quantifying the trend of performance as a function of scale.

通过提供公平的比较，可以使用我们的基准提出以下类型的关于困惑度性能的声明：（1）计算匹配模型中哪些模型表现最好，（2）哪些模型以最少的计算达到给定的性能，（3）哪些预训练语料库产生具有最佳性能的模型，（4）将性能趋势量化为规模函数。

t∈N |tokenize(t)|):

Metric PALOMA uses standardized inference code to compute metrics to assess LM fit to the evaluation data we have curated. Perplexity [Jelinek et al., 1977] is our primary metric (others not used in the body of this paper are detailed in Appendix B). Unless otherwise stated, we use perplexity to mean perplexity per token, where a log likelihood ℓover documents N = {t1, . . . , t|N|} is normalized by T(N) denoting the number of tokens in the documents (i.e., T(N) = P

指标 PALOMA 使用标准化推理代码来计算指标，以评估 LM 与我们策划的评估数据的拟合度。困惑度 [Jelinek et al., 1977] 是我们的主要指标（本文正文中未使用的其他指标详见附录 B）。除非另有说明，我们使用困惑度来表示每个标记的困惑度，其中文档 N = {t1,... 上的对数似然 ℓ。 。 。 , t|N|} 通过 T(N) 标准化，表示文档中的标记数量（即 T(N) = P

X

|t| X

ℓ=

ln p(ti | t<i)

i

t∈N

perplexity = e− ℓ T(N)

4 Case studies（案例研究）

In this section, we present one full case study and a single conclusion from a second. In Appendix D we present additional studies, demonstrating the types of analyses possible with PALOMA.

在本节中，我们将介绍一个完整的案例研究以及第二个案例的一个结论。在附录 D 中，我们提出了其他研究，展示了 PALOMA 可能进行的分析类型。

6

<!-- page 7 of 39 -->

4.1 Pretraining Beyond Common Crawl Shows Improved Stability of LM Fit（超越 Common Crawl 的预训练可提高语言模型拟合的稳定性）

We hypothesize that one of the strongest drivers of differences in performance between different domains is the composition of the pretraining data of a language model. While we show in Ap- pendix D.1 that scaling model parameters or tokens seen increases performance on nearly all domains, the pretraining data composition directly determines the distribution of language that the model is learning to fit, which may or may not align with the distributions of language in the domains we evaluate. Therefore we examine the impact of varying the pretraining corpus while holding all other experimental decisions the same.

我们假设不同领域之间性能差异的最强大驱动因素之一是语言模型预训练数据的组成。虽然我们在附录 D.1 中表明，缩放模型参数或标记可以提高几乎所有领域的性能，但预训练数据的组成直接决定了模型正在学习适应的语言分布，这可能与我们评估的领域中的语言分布一致，也可能不一致。因此，我们在保持所有其他实验决策​​相同的情况下检查改变预训练语料库的影响。

Baseline Models We train and release a set of 6 baseline models on common pretraining corpora following our training guidelines (§3). Training these models ourselves allows us to apply decontami- nation and fixed order to their pretraining data as well as using a standard tokenizer to enable the greatest level of comparability. These models are 1B parameter models trained for ∼150B tokens on DOLMA [Soldaini et al., 2024], THE PILE [Gao et al., 2020], REDPAJAMA [Together Computer, 2023], FALCON REFINEDWEB [Penedo et al., 2023], C4 [Raffel et al., 2019, Dodge et al., 2021], and MC4-EN [Chung et al., 2023]. Additional training details are included in Appendix G.

基线模型 我们按照我们的培训指南 (§3) 在常见预训练语料库上训练并发布一组 6 个基线模型。自己训练这些模型使我们能够对其预训练数据应用净化和固定顺序，并使用标准分词器来实现最大程度的可比性。这些模型是在 DOLMA [Soldaini et al., 2024]、THE PILE [Gao et al., 2020]、REDPAJAMA [Together Computer, 2023]、FALCON REFINEDWEB [Penedo et al., 2023]、C4 [Raffel et al., 2019, Dodge et al., 2019] 上训练 ∼150B 代币的 1B 参数模型al.，2021] 和 MC4-EN [Chung 等人，2023]。其他培训细节包含在附录 G 中。

Ordinary perplexity In Figure 1, we consider the most simple and aggregated view of LM fit that PALOMA can provide—perplexity as defined in §3. Specifically we compute perplexity over all data, excluding the three fringe sources with prevalent toxicity. We also exclude code data in DOLMA and DOLMA-100-PROGRAMMING-LANGUAGES.7

普通困惑度 在图 1 中，我们考虑 PALOMA 可以提供的最简单、最聚合的 LM 拟合视图——第 3 节中定义的困惑度。具体来说，我们计算所有数据的困惑度，排除具有普遍毒性的三个边缘源。我们还排除 DOLMA 和 DOLMA-100-PROGRAMMING-LANGUAGES.7 中的代码数据

Using this view, we see that baseline models trained only on Common Crawl data (C4, FALCON REFINEDWEB, and MC4-EN) stand out from the others which incorporate more curated data sources. However, this points to the limitation of this most aggregated view of the results: ordinary perplexity represents fit to domains in proportion to the number of tokens we have chosen to sample from each domain. We sample 100,000 tokens from each domain and the majority of our domains are not sourced from Common Crawl. So Common Crawl is much less represented in PALOMA than in most pretraining corpora, which typically consist of mostly Common Crawl as this is the most abundant public source of text data. Nevertheless this simplified view of the results is useful for specific use cases that need a single metric over a prescriptive mix that emphasizes robustness to a diversity of domains, largely derived from non-web scraped sources.

使用此视图，我们看到仅在 Common Crawl 数据（C4、FALCON REFINEDWEB 和 MC4-EN）上训练的基线模型从其他包含更多精选数据源的模型中脱颖而出。然而，这指出了这种最聚合的结果视图的局限性：普通的困惑度表示与我们选择从每个域中采样的标记数量成比例的域拟合。我们从每个域中抽取了 100,000 个令牌，并且我们的大多数域都不是来自 Common Crawl。因此，与大多数预训练语料库相比，PALOMA 中 Common Crawl 的表现要少得多，预训练语料库通常主要由 Common Crawl 组成，因为这是最丰富的公共文本数据源。然而，这种简化的结果视图对于需要在规定组合上使用单一指标的特定用例很有用，该组合强调对各种领域的鲁棒性，这些领域主要来自非网络抓取的来源。

Macro average perplexity Figure 2 provides another aggregation that examines the robust- ness of fit by considering all domains equally—a macro average of perplexity over domains: |D|−1 P

宏观平均困惑度 图 2 提供了另一种聚合，通过平等地考虑所有域来检查拟合的鲁棒性——域上困惑度的宏观平均值： |D|−1 P

d∈D perplexity(d) for domain set D. By contrast ordinary perplexity is essentially an exponentiated micro average over the domains implicitly selected for during corpus curation. Macro averaging lets all marked domains have equal say on the model’s performance, instead. To make these macro averages more easily interpretable, we examine them separately per source.

域集 D 的 d∈D 困惑度（d）。相比之下，普通困惑度本质上是在语料库管理期间隐式选择的域上的指数微平均值。相反，宏观平均让所有标记的域对模型的性能具有同等的发言权。为了使这些宏观平均值更容易解释，我们根据来源单独检查它们。

The most striking pattern that emerges with per-source macro averages is the high, and sometimes non-monotonic, perplexity of the 3 baselines trained on only Common Crawl data (C4, MC4-EN, FALCON REFINEDWEB). This is particularly apparent for the C4 model evaluated on REDPAJAMA, where the macro average is dominated by perplexity up to 391,171 on the arXiv domain. Similar spikes occur for the FALCON REFINEDWEB and MC4-EN models, with perplexity of 21,652 and 1,409 respectively, on the Max music programming language domain in DOLMA-100-PROGRAMMING- LANGUAGES. These domains contain large amounts of non-natural language, in the form of LaTeX and other code data. These spikes stand out from the stable and monotonic improvement observed in the other 3 baseline models. While these Common Crawl baselines spike on different domains, it appears they are more susceptible to these extreme gaps in fit to some domains. Perhaps this occurs because of a lack of exposure to specific types of language completely filtered due to having only one set of cleaning filters applied to a single source of data.

每个源的宏观平均值中出现的最引人注目的模式是仅在 Common Crawl 数据（C4、MC4-EN、FALCON REFINEDWEB）上训练的 3 个基线的高度且有时非单调的困惑度。这对于在 REDPAJAMA 上评估的 C4 模型尤其明显，其中宏观平均值由 arXiv 域上高达 391,171 的困惑度主导。 FALCON REFINEDWEB 和 MC4-EN 模型也出现类似的峰值，在 DOLMA-100-PROGRAMMING-LANGUAGES 中的 Max 音乐编程语言域上，困惑度分别为 21,652 和 1,409。这些域包含大量 LaTeX 和其他代码数据形式的非自然语言。这些峰值从其他 3 个基线模型中观察到的稳定且单调的改进中脱颖而出。虽然这些通用爬网基线在不同的领域出现峰值，但它们似乎更容易受到这些极端差距的影响，以适合某些领域。发生这种情况的原因可能是，由于仅将一组清理过滤器应用于单个数据源，因此缺乏对完全过滤的特定类型语言的接触。

7We do not decontaminate code as its paragraphs (lines) are short and often repeated.

7我们不会净化代码，因为它的段落（行）很短并且经常重复。

7

<!-- page 8 of 39 -->

C4

mC4-en

WikiText-103

PTB

RedPajama

Falcon RefinedWeb

Dolma

M2D2 S2ORC

7 12 20

5 88 195K

12 20 39

12 20 39

15 58

12 20 39

12 20 39

12 20 39

20 65 150

20 65 150

20 65 150

20 65 150

20 65 150

20 65 150

20 65 150

20 65 150

M2D2 Wikipedia

C4 100 Domains

100 Subreddits

100 PLs

Twitter AAE

Manosphere

Gab

4chan

Macro Average Perplexity

3 15 2K

9 28

12 15 20

12 20

17 24 33 47

20 39

33 47 71

142 238 424

20 65 150

20 65 150

20 65 150

20 65 150

20 65 150

20 65 150

20 65 150

20 65 150

Tokens Seen (billions)

1B Models

Dolma Falcon-RefinedWeb RedPajama The Pile C4 mC4-en

Figure 2: Perplexity macro averaged over any domains within each of the 16 top-level data sources (§2) in PALOMA, for each baseline model. Evaluating on one monolithic corpus, such as C4, does not tell the complete story of model fit. PALOMA lets us see when trends differ from one distribution of language to another. For instance, the 3 baselines trained on only Common Crawl data (C4, MC4- EN, FALCON REFINEDWEB) exhibit high perplexity, sometimes with non-monotonic scaling over tokens seen, on specific evaluation sources such as REDPAJAMA, and DOLMA-100-PROGRAMMING- LANGUAGES.

In contrast, the baselines that include curated non-webscraped text sources (DOLMA, THE PILE, and REDPAJAMA) have a relative gap in perplexity that is highly stable through the course of training. This would imply that short training runs on a subsample of such pretraining corpora may be predictive of the LM fit of specific sources after much longer training. To address one exception, the REDPAJAMA baseline often spikes on its final checkpoint, sometimes dramatically as in TWITTERAAE. A possible explanation is that this checkpoint falls very soon after the model’s training loss recovers from a small spike.

相比之下，包含精选的非网络抓取文本源（DOLMA、THE PILE 和 REDPAJAMA）的基线在困惑度方面具有相对差距，并且在整个训练过程中该差距是高度稳定的。这意味着对此类预训练语料库的子样本进行短期训练可能可以预测经过更长时间训练后特定源的 LM 拟合。为了解决一个例外情况，REDPAJAMA 基线经常在其最终检查点处出现峰值，有时会像 TWITTERAAE 中那样急剧上升。一种可能的解释是，在模型的训练损失从小峰值恢复后，该检查点很快就会下降。

M2D2 S2ORC

M2D2 Wikipedia

C4 100 Domains

100 Subreddits

100 PLs

5.2 7.5 11.7 20.2 39.2

7.5 11.7 20.2

4.4 9.3 27.7 141.6

1.2 1.8 5.2 88.4 195.3K

11.7 20.2 39.2 88.4

0 50 100 150

0 20 40

0 50 100

0 50 100

0 50 100

Perplexity for each Domain

Rank of evaluation domain, as ordered by median perplexity over models

Baselines

Dolma Falcon-RefinedWeb RedPajama The Pile C4 mC4-en Median

Figure 3: For each source with at least 10 domains, each point visualizes perplexity on a single domain for a fully trained model. Domains are ordered by median perplexity of that domain over all models. Gaps between some baselines are highly consistent across domains (e.g., REDPAJAMA and THE PILE baselines on DOLMA-100-SUBREDDITS). Other models (often pretrained on just Common Crawl data) exhibit noisy gaps that do not follow the trend in median domain difficulty (e.g., the MC4-EN baseline on C4-100-DOMAINS).

Perplexity per domain ordered by median perplexity We can visualize each perplexity separately for each domain to surface gaps in fine-grained LM fit. In Figure 3, we arrange the domains by their median perplexity over the baselines, as this order gives some sense of the intrinsic difficulty of a domain. We can then see which baselines follow this order, differing only by a consistent offset, and which have gaps that are more idiosyncratic to each domain. Again we see that when baselines have irregular gaps from the median these are most frequently baselines pretrained on only Common Crawl.

按中值困惑度排序的每个域的困惑度我们可以分别可视化每个域的每个困惑度，以细粒度 LM 拟合中的表面间隙。在图 3 中，我们根据基线上的中值复杂度来排列领域，因为这种顺序可以在一定程度上体现领域的内在难度。然后，我们可以看到哪些基线遵循此顺序，仅通过一致的偏移量有所不同，并且哪些基线具有对于每个域来说更特殊的间隙。我们再次看到，当基线与中值之间存在不规则间隙时，这些最常见的基线是仅在 Common Crawl 上进行预训练的。

8

<!-- page 9 of 39 -->

(a) Mean loss per type (b) Cumulative proportion of total loss per type

Figure 4: Mean and total loss per vocabulary type, i.e., specific strings in the vocabulary. While high-frequency types (which have low IDs) tend to have a low average loss as shown by a log-linear regression (a), they contribute a substantial part of the total loss, simply by virtue of their frequent occurrence in the data (b). The figure shows the distributions for Pythia-7B [Biderman et al., 2023] on C4-100-DOMAINS, but the overall picture is consistent for different models and sources.

The notable exception is THE PILE baseline on M2D2 S2ORC and DOLMA-100-PROGRAMMING-

值得注意的例外是 M2D2 S2ORC 和 DOLMA-100-PROGRAMMING- 上的 PILE 基线

LANGUAGES, which has erratic gaps substantially below the median, perhaps indicating that baseline is benefiting from exposure to specific domains and not others rather than only a overall facility for scientific papers and code. The erratic-gapped Common Crawl baselines, by contrast, are all worse than median perplexity, suggesting that they may have complete gaps in exposure to features of certain domains that are not recovered through generalization.

语言的差距远低于中位数，这可能表明基线受益于接触特定领域而不是其他领域，而不仅仅是科学论文和代码的整体设施。相比之下，不稳定的 Common Crawl 基线都比中值困惑度更差，这表明它们在接触某些领域的特征时可能存在完全的差距，而这些特征无法通过泛化来恢复。

4.2 Common Vocabulary Types Dominate Perplexity（常见词元类型主导困惑度）

Here we present a single conclusion from a second case study; see Appendix D.2 for further analysis. So far we have examined perplexity aggregated over tokens. Another approach is to measure average likelihood per vocabulary type, i.e., the strings that are represented in the vocabulary of a model, in contrast to occurrences of these strings in some corpus, called tokens.8

在这里，我们提出第二个案例研究的单一结论；进一步分析参见附录D.2。到目前为止，我们已经研究了令牌上聚合的困惑度。另一种方法是测量每个词汇类型的平均可能性，即模型词汇中表示的字符串，与这些字符串在某些语料库中的出现情况（称为标记）形成对比。8

Few vocabulary types account for most of the loss measured in perplexity How much do specific types contribute to perplexity aggregated per token? To answer, we start by analyzing the total loss mass added by types, as a function of their IDs. Smaller IDs correspond to more frequent types in the GPTNeoX-20B tokenizer training data [Sennrich et al., 2016, Black et al., 2022], and we find an overall moderate to strong correlation between IDs and frequencies in the evaluation data of PALOMA as well (Pearson’s r averaged across domains: –0.522±0.087). Crucially, frequency has a strong impact on the total loss mass associated with individual types: while the average loss is lower for the high-frequency types (Figure 4a), the total loss is higher, resulting in a situation where 5% of the types already cover roughly 50% of the overall perplexity (Figure 4b). Thus, perplexity is strongly influenced by a relatively small set of high-frequency types. This finding provides further evidence that reporting only aggregated perplexity values neglects more subtle dynamics visible through fine-grained analysis (i.e., sources, domains, vocabulary types) in PALOMA.

少数词汇类型占了困惑度衡量损失的大部分，特定类型对每个标记聚合的困惑度有多大贡献？为了回答这个问题，我们首先分析不同类型添加的总损失质量，作为其 ID 的函数。较小的 ID 对应于 GPTNeoX-20B 分词器训练数据中更频繁的类型 [Sennrich et al., 2016, Black et al., 2022]，并且我们在 PALOMA 的评估数据中发现 ID 和频率之间总体存在中等到强的相关性（跨域的 Pearson r 平均值：–0.522±0.087）。至关重要的是，频率对与各个类型相关的总损失质量有很大影响：虽然高频类型的平均损失较低（图 4a），但总损失较高，导致 5% 的类型已经覆盖了大约 50% 的总体困惑度（图 4b）。因此，困惑度受到相对较小的一组高频类型的强烈影响。这一发现提供了进一步的证据，表明仅报告聚合的困惑度值忽略了通过 PALOMA 中的细粒度分析（即来源、领域、词汇类型）可见的更微妙的动态。

5 Conclusion（结论）

We believe that evaluations of language modeling fit provide an important view of performance that has been neglected in recent LM research and development. Perplexity cannot be naïvely applied to language modeling at this scale due to challenges such as benchmark contamination. However, these obstacles are worth overcoming as perplexity offers several advantages not afforded by downstream evaluations. Instead of constructing tasks from scratch, we can rely on the ecological validity of

我们认为，语言模型拟合度的评估提供了一个重要的性能视角，而这一视角在最近的语言模型研究和开发中被忽视了。由于基准污染等挑战，困惑不能天真地应用于这种规模的语言建模。然而，这些障碍是值得克服的，因为困惑提供了下游评估无法提供的几个优势。我们可以依靠生态有效性，而不是从头开始构建任务

8See Appendix B for a more formal definition of average likelihood per vocabulary type

8有关每种词汇类型的平均可能性的更正式定义，请参阅附录 B

9

<!-- page 10 of 39 -->

real-world data drawn from known sources. Finding the best ways to evaluate model fit to a collection of documents creates an interface for other fields to contribute to the evaluation of language models. Without needing to understand LM architectures, researchers in other fields can collect corpora representing domains of interest that LM researchers would not know to consider. Once such sources are identified, evaluations can be updated over time by simply scraping more data, unlike downstream tasks where expensive annotation would be required.

从已知来源提取的真实世界数据。寻找评估模型与文档集合的拟合度的最佳方法，为其他领域创建了一个接口，以促进语言模型的评估。其他领域的研究人员无需了解 LM 架构，就可以收集代表 LM 研究人员不知道要考虑的感兴趣领域的语料库。一旦确定了这些来源，就可以通过简单地抓取更多数据来随着时间的推移更新评估，这与需要昂贵注释的下游任务不同。

Further, we hope that PALOMA provides controlled results for study of when perplexity evaluations are or are not predictive of downstream performance [Liu et al., 2022, Tay et al., 2021, Ganguli et al., 2022, Xia et al., 2022, Gadre et al., 2024, Du et al., 2024]. In Appendix A, our preliminary investigation reveals that different PALOMA sources are correlated with some downstream tasks and anticorrelated with others. This contrasts with the assumption in much scaling literature that lower perplexity always indicates better downstream performance. While we do observe that LM loss reduces with scale across most domains (Appendix D.1), the fit of this relationship and the relationship of loss to downstream performance will both differ for each pretraining and validation distribution as observed by Gadre et al. [2024]. This means that one cannot simply find which fine-grained perplexity domains correlate with one’s favorite task and then hillclimb on those. Instead further investigation with pretraining experiments across a wide range of scales and data recipes is needed to understand when reductions in perplexity are being driven by superficial overlaps of train and validation distributions or by learning features relevant to downstream use.

此外，我们希望 PALOMA 为研究困惑度评估何时预测下游性能提供受控结果 [Liu et al., 2022, Tay et al., 2021, Ganguli et al., 2022, Xia et al., 2022, Gadre et al., 2024, Du et al., 2024]。在附录 A 中，我们的初步调查表明，不同的 PALOMA 源与某些下游任务相关，而与其他任务反相关。这与许多扩展文献中的假设形成鲜明对比，即较低的困惑度总是表明更好的下游性能。虽然我们确实观察到 LM 损失随着大多数领域的规模而减少（附录 D.1），但正如 Gadre 等人观察到的，这种关系的拟合度以及损失与下游性能的关系对于每个预训练和验证分布都会有所不同。 [2024]。这意味着人们不能简单地找到哪些细粒度的困惑域与自己最喜欢的任务相关，然后在这些领域上进行爬山。相反，需要对各种规模和数据配方的预训练实验进行进一步调查，以了解何时通过训练和验证分布的表面重叠或通过学习与下游使用相关的特征来驱动困惑度的减少。

6 Limitations and Future Work（局限与未来工作）

The largest limitation of PALOMA is that we elect to focus just on the language modeling of English and code data. We select this scope as most current LMs also focus on theses types of data. However, we strongly encourage future work to explore how language model fit to fine-grained domains behaves within and across other languages.

PALOMA 最大的限制是我们选择只关注英语和代码数据的语言建模。我们选择此范围是因为当前大多数 LM 也关注这些类型的数据。然而，我们强烈鼓励未来的工作去探索语言模型如何适应细粒度领域在其他语言内和跨其他语言的行为。

Proper use of perplexity as a metric must take into account its limitations. We believe perplexity is best used to show what a model is learning rather than what it should be learning. For instance we find that perplexity on the 3 fringe datasets are tightly related to average document lengths, with the short tweet-like posts in GAB CORPUS receiving high perplexities while the long concatenated threads of posts in 4CHAN CORPUS and MANOSPHERE CORPUS provide greater context and lower perplexity. At this level of aggregation, differences in surprise between these domains likely have little to do with model fit to specific types of toxicity and more to do with how models use extremely short or long contexts. In our case study in §4.2, we demonstrate that often it is more appropriate to decompose measures of surprise over specific strings within a corpus, rather than aggregating over all text in a domain. We hope that by surfacing the average likelihoods of specific strings in the vocabulary, PALOMA can enable future work on metrics that better measure the fit of models to the features of language in specific domains that humans find most salient.

正确使用困惑度作为衡量标准必须考虑到其局限性。我们认为困惑度最好用来展示模型正在学习什么，而不是它应该学习什么。例如，我们发现 3 个边缘数据集的困惑度与平均文档长度密切相关，GAB CORPUS 中类似推文的短帖子接收到较高的困惑度，而 4CHAN CORPUS 和 MANOSPHERE CORPUS 中的长串联帖子线程提供了更大的上下文和更低的困惑度。在这个聚合级别上，这些领域之间的意外差异可能与模型适合特定类型的毒性无关，而更多地与模型如何使用极短或极长的上下文有关。在第 4.2 节的案例研究中，我们证明，通常分解语料库中特定字符串的惊喜度量比聚合域中的所有文本更合适。我们希望通过显示词汇表中特定字符串的平均可能性，PALOMA 可以推动未来的指标工作，更好地衡量模型与人类认为最显着的特定领域中语言特征的拟合程度。

We also highlight guidelines for evaluating with perplexity (§3). In particular we believe decontami- nation of benchmark leakage and balancing variance induced by subsampling across domains are both challenging concerns requiring further investigation. For each of these we have proposed one simple and scalable mitigation (see Appendix C.1.1 and C.2.1 for further details), but future work should explore alternatives and measure their efficacy.

我们还强调了困惑评估的指南（§3）。特别是，我们认为基准泄漏的净化和跨域二次采样引起的平衡方差都是具有挑战性的问题，需要进一步调查。对于其中每一个，我们都提出了一种简单且可扩展的缓解措施（有关更多详细信息，请参阅附录 C.1.1 和 C.2.1），但未来的工作应该探索替代方案并衡量其功效。

PALOMA curates and standardizes the text datasets with the most fine-grained domains readily available from existing metadata. As such, our definition of domains by metadata is necessarily heuristic. Some overlapping domains in PALOMA appear in multiple sources, such as academic papers. Though DOLMA and REDPAJAMA process academic papers differently, the subcorpora on academic papers in each source represent different approximations of the same or very similar domains. However for the sake of simplicity, we make the reductive assumption of counting all 546 domains in PALOMA as fully distinct. We hope that future work will explore novel means of identifying fine-grained domains and separating distribution shifts in language due to differing authorship or differing data collection processes.

PALOMA 使用现有元数据中最细粒度的域来管理和标准化文本数据集。因此，我们通过元数据对域的定义必然是启发式的。 PALOMA 中的一些重叠域出现在多个来源中，例如学术论文。尽管 DOLMA 和 REDPAJAMA 处理学术论文的方式不同，但每个来源中学术论文的子语料库代表了相同或非常相似领域的不同近似值。然而，为了简单起见，我们做出还原性假设，将 PALOMA 中的所有 546 个域计算为完全不同的域。我们希望未来的工作将探索新的方法来识别细粒度领域并区分由于不同的作者或不同的数据收集过程而导致的语言分布变化。

10

<!-- page 11 of 39 -->

Acknowledgements（致谢）

We thank Nishant Subramani, Akhila Yerukola, Rodney Kinney, and Ari Holtzman for fruitful conversations. The experimental components of this work were made possible through a partnership with AMD and CSC, enabling use of the LUMI supercomputer.

我们感谢 Nishant Subramani、Akhila Yerukola、Rodney Kinney 和 Ari Holtzman 进行了富有成效的对话。这项工作的实验组件是通过与 AMD 和 CSC 的合作实现的，从而能够使用 LUMI 超级计算机。

References（参考文献）

Roee Aharoni and Yoav Goldberg. Unsupervised domain clusters in pretrained language models. In

Proceedings of the 58th Annual Meeting of the Association for Computational Linguistics, pages 7747–7763, Online, July 2020. Association for Computational Linguistics. doi: 10.18653/v1/2020. acl-main.692. URL https://aclanthology.org/2020.acl-main.692.

Ebtesam Almazrouei, Hamza Alobeidli, Abdulaziz Alshamsi, Alessandro Cappelli, Ruxandra Co-

jocaru, Maitha Alhammadi, Mazzotta Daniele, Daniel Heslow, Julien Launay, Quentin Malartic, Badreddine Noune, Baptiste Pannier, and Guilherme Penedo. The falcon series of language models: Towards open frontier models. 2023.

Yoshua Bengio, Jérôme Louradour, Ronan Collobert, and Jason Weston. Curriculum learning. In

International Conference on Machine Learning, 2009. URL https://api.semanticscholar. org/CorpusID:873046.

Stella Rose Biderman, Hailey Schoelkopf, Quentin G. Anthony, Herbie Bradley, Kyle O’Brien,

Eric Hallahan, Mohammad Aflah Khan, Shivanshu Purohit, USVSN Sai Prashanth, Edward Raff, Aviya Skowron, Lintang Sutawika, and Oskar van der Wal. Pythia: A suite for analyzing large language models across training and scaling. ArXiv, abs/2304.01373, 2023. URL https: //api.semanticscholar.org/CorpusID:257921893.

Yonatan Bisk, Rowan Zellers, Jianfeng Gao, Yejin Choi, et al. Piqa: Reasoning about physical

commonsense in natural language. In Proceedings of the AAAI conference on artificial intelli- gence, volume 34, pages 7432–7439, 2020. URL https://ojs.aaai.org/index.php/AAAI/ article/view/6239.

Sidney Black, Stella Biderman, Eric Hallahan, Quentin Anthony, Leo Gao, Laurence Golding, Horace

He, Connor Leahy, Kyle McDonell, Jason Phang, Michael Pieler, Usvsn Sai Prashanth, Shivanshu Purohit, Laria Reynolds, Jonathan Tow, Ben Wang, and Samuel Weinbach. GPT-NeoX-20B: An open-source autoregressive language model. In Proceedings of BigScience Episode #5 – Workshop on Challenges & Perspectives in Creating Large Language Models, pages 95–136, virtual+Dublin, May 2022. Association for Computational Linguistics. doi: 10.18653/v1/2022.bigscience-1.9. URL https://aclanthology.org/2022.bigscience-1.9.

Su Lin Blodgett, Lisa Green, and Brendan O’Connor. Demographic dialectal variation in social

media: A case study of African-American English. In Proceedings of the 2016 Conference on Empirical Methods in Natural Language Processing, pages 1119–1130, Austin, Texas, November 2016. Association for Computational Linguistics. doi: 10.18653/v1/D16-1120. URL https: //aclanthology.org/D16-1120.

Burton H. Bloom. Space/time trade-offs in hash coding with allowable errors. Commun. ACM, 13(7):

422–426, jul 1970. ISSN 0001-0782. URL https://doi.org/10.1145/362686.362692.

Tom B. Brown, Benjamin Mann, Nick Ryder, Melanie Subbiah, Jared Kaplan, Prafulla Dhariwal,

Arvind Neelakantan, Pranav Shyam, Girish Sastry, Amanda Askell, Sandhini Agarwal, Ariel Herbert-Voss, Gretchen Krueger, Tom Henighan, Rewon Child, Aditya Ramesh, Daniel M. Ziegler, Jeffrey Wu, Clemens Winter, Christopher Hesse, Mark Chen, Eric Sigler, Mateusz Litwin, Scott Gray, Benjamin Chess, Jack Clark, Christopher Berner, Sam McCandlish, Alec Radford, Ilya Sutskever, and Dario Amodei. Language models are few-shot learners, 2020.

11

<!-- page 12 of 39 -->

Kris Cao and Laura Rimell. You should evaluate your language model on marginal likelihood

over tokenisations. In Proceedings of the 2021 Conference on Empirical Methods in Natural Language Processing, pages 2104–2114, Online and Punta Cana, Dominican Republic, November 2021. Association for Computational Linguistics. doi: 10.18653/v1/2021.emnlp-main.161. URL https://aclanthology.org/2021.emnlp-main.161.

Nicholas Carlini, Daphne Ippolito, Matthew Jagielski, Katherine Lee, Florian Tramèr, and Chiyuan

Zhang. Quantifying memorization across neural language models. ArXiv, abs/2202.07646, 2022. URL https://api.semanticscholar.org/CorpusID:246863735.

Ciprian Chelba, Tomas Mikolov, Mike Schuster, Qi Ge, T. Brants, Phillip Todd Koehn, and Tony

Robinson. One billion word benchmark for measuring progress in statistical language modeling. In Interspeech, 2013. URL https://api.semanticscholar.org/CorpusID:14136307.

Xiangning Chen, Chen Liang, Da Huang, Esteban Real, Kaiyuan Wang, Yao Liu, Hieu Pham,

Xuanyi Dong, Thang Luong, Cho-Jui Hsieh, Yifeng Lu, and Quoc V. Le. Symbolic discovery of optimization algorithms. ArXiv, abs/2302.06675, 2023. URL https://api.semanticscholar. org/CorpusID:256846990.

Nadezhda Chirkova, Germán Kruszewski, Jos Rozen, and Marc Dymetman. Should you marginalize

over possible tokenizations? In Proceedings of the 61st Annual Meeting of the Association for Computational Linguistics (Volume 2: Short Papers), pages 1–12, Toronto, Canada, July 2023. Association for Computational Linguistics. URL https://aclanthology.org/2023. acl-short.1.

Alexandra Chronopoulou, Matthew Peters, and Jesse Dodge. Efficient hierarchical domain adaptation

for pretrained language models. In Proceedings of the 2022 Conference of the North American Chapter of the Association for Computational Linguistics: Human Language Technologies, pages 1336–1351, Seattle, United States, July 2022. Association for Computational Linguistics. doi: 10.18653/v1/2022.naacl-main.96. URL https://aclanthology.org/2022.naacl-main.96.

Hyung Won Chung, Noah Constant, Xavier García, Adam Roberts, Yi Tay, Sharan Narang, and Orhan

Firat. Unimax: Fairer and more effective language sampling for large-scale multilingual pretrain- ing. ArXiv, abs/2304.09151, 2023. URL https://api.semanticscholar.org/CorpusID: 258187051.

Christopher Clark, Kenton Lee, Ming-Wei Chang, Tom Kwiatkowski, Michael Collins, and Kristina

Toutanova. Boolq: Exploring the surprising difficulty of natural yes/no questions. arXiv preprint arXiv:1905.10044, 2019.

Peter Clark, Isaac Cowhey, Oren Etzioni, Tushar Khot, Ashish Sabharwal, Carissa Schoenick, and

Oyvind Tafjord. Think you have solved question answering? try arc, the ai2 reasoning challenge. arXiv preprint arXiv:1803.05457, 2018. URL https://arxiv.org/abs/1803.05457.

Jia Deng, Wei Dong, Richard Socher, Li-Jia Li, Kai Li, and Li Fei-Fei. Imagenet: A large-scale hier-

archical image database. In 2009 IEEE Conference on Computer Vision and Pattern Recognition, pages 248–255, 2009. doi: 10.1109/CVPR.2009.5206848.

Fernando Diaz and Michael A. Madaio. Scaling laws do not scale. ArXiv, abs/2307.03201, 2023.

URL https://api.semanticscholar.org/CorpusID:259375636.

Jesse Dodge, Maarten Sap, Ana Marasovi´c, William Agnew, Gabriel Ilharco, Dirk Groeneveld,

Margaret Mitchell, and Matt Gardner. Documenting large webtext corpora: A case study on the colossal clean crawled corpus. In Proceedings of the 2021 Conference on Empirical Methods in Natural Language Processing, pages 1286–1305, Online and Punta Cana, Dominican Republic, November 2021. Association for Computational Linguistics. doi: 10.18653/v1/2021.emnlp-main. 98. URL https://aclanthology.org/2021.emnlp-main.98.

12

<!-- page 13 of 39 -->

Zhengxiao Du, Aohan Zeng, Yuxiao Dong, and Jie Tang. Understanding emergent abilities of

language models from the loss perspective. ArXiv, abs/2403.15796, 2024. URL https://api. semanticscholar.org/CorpusID:268681827.

Yanai Elazar, Akshita Bhagia, Ian H. Magnusson, Abhilasha Ravichander, Dustin Schwenk, Alane

Suhr, Pete Walsh, Dirk Groeneveld, Luca Soldaini, Sameer Singh, Hanna Hajishirzi, Noah A. Smith, and Jesse Dodge. What’s in my big data? ArXiv, abs/2310.20707, 2023. URL https: //api.semanticscholar.org/CorpusID:264803575.

Samir Yitzhak Gadre, Georgios Smyrnis, Vaishaal Shankar, Suchin Gururangan, Mitchell Wortsman,

Rulin Shao, Jean-Pierre Mercat, Alex Fang, Jeffrey Li, Sedrick Scott Keh, Rui Xin, Marianna Nezhurina, Igor Vasiljevic, Jenia Jitsev, Alexandros G. Dimakis, Gabriel Ilharco, Shuran Song, Thomas Kollar, Yair Carmon, Achal Dave, Reinhard Heckel, Niklas Muennighoff, and Ludwig Schmidt. Language models scale reliably with over-training and on downstream tasks. ArXiv, abs/2403.08540, 2024. URL https://api.semanticscholar.org/CorpusID:268379614.

Deep Ganguli, Danny Hernandez, Liane Lovitt, Nova DasSarma, T. J. Henighan, Andy Jones,

Nicholas Joseph, John Kernion, Benjamin Mann, Amanda Askell, Yuntao Bai, Anna Chen, Tom Conerly, Dawn Drain, Nelson Elhage, Sheer El Showk, Stanislav Fort, Zac Hatfield-Dodds, Scott Johnston, Shauna Kravec, Neel Nanda, Kamal Ndousse, Catherine Olsson, Daniela Amodei, Dario Amodei, Tom B. Brown, Jared Kaplan, Sam McCandlish, Christopher Olah, and Jack Clark. Predictability and surprise in large generative models. Proceedings of the 2022 ACM Conference on Fairness, Accountability, and Transparency, 2022. URL https://api.semanticscholar. org/CorpusID:246867298.

Leo Gao, Stella Rose Biderman, Sid Black, Laurence Golding, Travis Hoppe, Charles Foster, Jason

Phang, Horace He, Anish Thite, Noa Nabeshima, Shawn Presser, and Connor Leahy. The pile: An 800gb dataset of diverse text for language modeling. ArXiv, abs/2101.00027, 2020. URL https://api.semanticscholar.org/CorpusID:230435736.

Sidney Greenbaum and Gerald Nelson. The international corpus of english (ICE) project. World

Englishes, 15(1):3–15, mar 1996. doi: 10.1111/j.1467-971x.1996.tb00088.x. URL https: //doi.org/10.1111%2Fj.1467-971x.1996.tb00088.x.

Dirk Groeneveld, Iz Beltagy, Pete Walsh, Akshita Bhagia, Rodney Kinney, Oyvind Tafjord, A. Jha,

Hamish Ivison, Ian Magnusson, Yizhong Wang, Shane Arora, David Atkinson, Russell Authur, Khyathi Raghavi Chandu, Arman Cohan, Jennifer Dumas, Yanai Elazar, Yuling Gu, Jack Hessel, Tushar Khot, William Merrill, Jacob Daniel Morrison, Niklas Muennighoff, Aakanksha Naik, Crystal Nam, Matthew E. Peters, Valentina Pyatkin, Abhilasha Ravichander, Dustin Schwenk, Saurabh Shah, Will Smith, Emma Strubell, Nishant Subramani, Mitchell Wortsman, Pradeep Dasigi, Nathan Lambert, Kyle Richardson, Luke Zettlemoyer, Jesse Dodge, Kyle Lo, Luca Soldaini, Noah A. Smith, and Hanna Hajishirzi. Olmo: Accelerating the science of language models. ArXiv, abs/2402.00838, 2024. URL https://api.semanticscholar.org/CorpusID:267365485.

Jordan Hoffmann, Sebastian Borgeaud, Arthur Mensch, Elena Buchatskaya, Trevor Cai, Eliza

Rutherford, Diego de Las Casas, Lisa Anne Hendricks, Johannes Welbl, Aidan Clark, Tom Hennigan, Eric Noland, Katie Millican, George van den Driessche, Bogdan Damoc, Aurelia Guy, Simon Osindero, Karen Simonyan, Erich Elsen, Jack W. Rae, Oriol Vinyals, and L. Sifre. Training compute-optimal large language models. ArXiv, abs/2203.15556, 2022. URL https: //api.semanticscholar.org/CorpusID:247778764.

Valentin Hofmann, Janet Pierrehumbert, and Hinrich Schütze. Superbizarre is not superb: Derivational

morphology improves BERT’s interpretation of complex words. In Proceedings of the 59th Annual Meeting of the Association for Computational Linguistics and the 11th International Joint Conference on Natural Language Processing (Volume 1: Long Papers), pages 3594–3608, Online, August 2021. Association for Computational Linguistics. doi: 10.18653/v1/2021.acl-long.279. URL https://aclanthology.org/2021.acl-long.279.

13

<!-- page 14 of 39 -->

Ari Holtzman, Peter West, and Luke Zettlemoyer. Generative models as a complex systems science:

How can we make sense of large language model behavior? ArXiv, abs/2308.00189, 2023. URL https://api.semanticscholar.org/CorpusID:260351369.

Frederick Jelinek. Statistical methods for speech recognition. MIT press, 1998.

Frederick Jelinek, Robert L. Mercer, Lalit R. Bahl, and Janet M. Baker. Perplexity—a measure of

the difficulty of speech recognition tasks. Journal of the Acoustical Society of America, 62, 1977. URL https://api.semanticscholar.org/CorpusID:121680873.

Jared Kaplan, Sam McCandlish, T. J. Henighan, Tom B. Brown, Benjamin Chess, Rewon Child, Scott

Gray, Alec Radford, Jeff Wu, and Dario Amodei. Scaling laws for neural language models. ArXiv, abs/2001.08361, 2020. URL https://api.semanticscholar.org/CorpusID:210861095.

Denis Kocetkov, Raymond Li, Loubna Ben Allal, Jia Li, Chenghao Mou, Carlos Muñoz Ferrandis,

Yacine Jernite, Margaret Mitchell, Sean Hughes, Thomas Wolf, Dzmitry Bahdanau, Leandro von Werra, and Harm de Vries. The stack: 3 tb of permissively licensed source code. Preprint, 2022.

Katherine Lee, Daphne Ippolito, Andrew Nystrom, Chiyuan Zhang, Douglas Eck, Chris Callison-

Burch, and Nicholas Carlini. Deduplicating training data makes language models better. In Proceedings of the 60th Annual Meeting of the Association for Computational Linguistics (Volume 1: Long Papers), pages 8424–8445, Dublin, Ireland, May 2022. Association for Computational Linguistics. doi: 10.18653/v1/2022.acl-long.577. URL https://aclanthology.org/2022. acl-long.577.

Percy Liang, Rishi Bommasani, Tony Lee, Dimitris Tsipras, Dilara Soylu, Michihiro Yasunaga,

Yian Zhang, Deepak Narayanan, Yuhuai Wu, Ananya Kumar, Benjamin Newman, Binhang Yuan,

Bobby Yan, Ce Zhang, Christian Cosgrove, Christopher D. Manning, Christopher R’e, Diana Acosta-Navas, Drew A. Hudson, E. Zelikman, Esin Durmus, Faisal Ladhak, Frieda Rong, Hongyu Ren, Huaxiu Yao, Jue Wang, Keshav Santhanam, Laurel J. Orr, Lucia Zheng, Mert Yuksekgonul, Mirac Suzgun, Nathan S. Kim, Neel Guha, Niladri S. Chatterji, Omar Khattab, Peter Henderson, Qian Huang, Ryan Chi, Sang Michael Xie, Shibani Santurkar, Surya Ganguli, Tatsunori Hashimoto, Thomas F. Icard, Tianyi Zhang, Vishrav Chaudhary, William Wang, Xuechen Li, Yifan Mai, Yuhui Zhang, and Yuta Koreeda. Holistic evaluation of language models. Annals of the New York Academy of Sciences, 1525:140 – 146, 2022. URL https://api.semanticscholar.org/CorpusID: 253553585.

Hong Liu, Sang Michael Xie, Zhiyuan Li, and Tengyu Ma. Same pre-training loss, better downstream:

Implicit bias matters for language models. In International Conference on Machine Learning, 2022. URL https://api.semanticscholar.org/CorpusID:253107233.

Kyle Lo, Lucy Lu Wang, Mark Neumann, Rodney Kinney, and Daniel Weld. S2ORC: The semantic

scholar open research corpus. In Proceedings of the 58th Annual Meeting of the Association for Computational Linguistics, pages 4969–4983, Online, July 2020. Association for Computational Linguistics. doi: 10.18653/v1/2020.acl-main.447. URL https://aclanthology.org/2020. acl-main.447.

Mitchell P. Marcus, Beatrice Santorini, Mary Ann Marcinkiewicz, and Ann Taylor. Treebank-3, 1999.

URL https://catalog.ldc.upenn.edu/LDC99T42.

R. Thomas McCoy, Shunyu Yao, Dan Friedman, Matthew Hardy, and Thomas L. Griffiths. Embers

of autoregression: Understanding large language models through the problem they are trained to solve. ArXiv, abs/2309.13638, 2023. URL https://api.semanticscholar.org/CorpusID: 262464572.

Ian. R. Mckenzie, Alexander Lyzhov, Michael Martin Pieler, Alicia Parrish, Aaron Mueller, Ameya

Prabhu, Euan McLean, Aaron Kirtland, Alexis Ross, Alisa Liu, Andrew Gritsevskiy, Daniel Wur- gaft, Derik Kauffman, Gabriel Recchia, Jiacheng Liu, Joe Cavanagh, Max Weiss, Sicong Huang,

14

<!-- page 15 of 39 -->

The Floating Droid, Tom Tseng, Tomasz Korbak, Xudong Shen, Yuhui Zhang, Zhengping Zhou, Najoung Kim, Sam Bowman, and Ethan Perez. Inverse scaling: When bigger isn’t better. ArXiv, abs/2306.09479, 2023. URL https://api.semanticscholar.org/CorpusID:259188012.

Stephen Merity, Caiming Xiong, James Bradbury, and Richard Socher. Pointer sentinel mixture

models. ArXiv, abs/1609.07843, 2016. URL https://api.semanticscholar.org/CorpusID: 16299141.

Sabrina J. Mielke. Can you compare perplexity across different segmentations?, Mar 2019. URL

https://sjmielke.com/comparing-perplexities.htm.

Sabrina J. Mielke and Jason Eisner. Spell once, summon anywhere: A two-level open-vocabulary

language model. In AAAI Conference on Artificial Intelligence, 2018. URL https://api. semanticscholar.org/CorpusID:5081459.

Todor Mihaylov, Peter Clark, Tushar Khot, and Ashish Sabharwal. Can a suit of armor conduct

electricity? a new dataset for open book question answering. arXiv preprint arXiv:1809.02789, 2018. URL https://arxiv.org/abs/1809.02789.

Davide Nunes. Preprocessed penn tree bank, 2020. URL https://zenodo.org/record/3910021.

Liam Paninski. Estimation of entropy and mutual information. Neural Computation, 15:1191–1253,

2003. URL https://api.semanticscholar.org/CorpusID:2034914.

Antonis Papasavva, Savvas Zannettou, Emiliano De Cristofaro, Gianluca Stringhini, and Jeremy

Blackburn. Raiders of the lost kek: 3.5 years of augmented 4chan posts from the politically incorrect board. Proceedings of the International AAAI Conference on Web and Social Media, 14:885–894, may 2020. doi: 10.1609/icwsm.v14i1.7354. URL https://doi.org/10.1609% 2Ficwsm.v14i1.7354.

Guilherme Penedo, Quentin Malartic, Daniel Hesslow, Ruxandra-Aimée Cojocaru, Alessandro

Cappelli, Hamza Alobeidli, Baptiste Pannier, Ebtesam Almazrouei, and Julien Launay. The refinedweb dataset for falcon llm: Outperforming curated corpora with web data, and web data only. ArXiv, abs/2306.01116, 2023. URL https://api.semanticscholar.org/CorpusID: 259063761.

Hao Peng, Qingqing Cao, Jesse Dodge, Matthew E. Peters, Jared Fernandez, Tom Sherborne, Kyle Lo,

Sam Skjonsberg, Emma Strubell, Darrell Plessas, Iz Beltagy, Evan Pete Walsh, Noah A. Smith, and Hannaneh Hajishirzi. Efficiency pentathlon: A standardized arena for efficiency evaluation. ArXiv, abs/2307.09701, 2023. URL https://api.semanticscholar.org/CorpusID:259982429.

Ofir Press, Noah A. Smith, and Mike Lewis. Shortformer: Better language modeling using shorter

inputs. In Proceedings of the 59th Annual Meeting of the Association for Computational Linguistics and the 11th International Joint Conference on Natural Language Processing (Volume 1: Long Papers), pages 5493–5505, Online, August 2021. Association for Computational Linguistics. doi: 10.18653/v1/2021.acl-long.427. URL https://aclanthology.org/2021.acl-long.427.

Alec Radford, Jeff Wu, Rewon Child, David Luan, Dario Amodei, and Ilya Sutskever. Language

models are unsupervised multitask learners. 2019. URL https://api.semanticscholar.org/ CorpusID:160025533.

Jack W. Rae, Sebastian Borgeaud, Trevor Cai, Katie Millican, Jordan Hoffmann, Francis Song,

John Aslanides, Sarah Henderson, Roman Ring, Susannah Young, Eliza Rutherford, Tom Hen- nigan, Jacob Menick, Albin Cassirer, Richard Powell, George van den Driessche, Lisa Anne Hendricks, Maribeth Rauh, Po-Sen Huang, Amelia Glaese, Johannes Welbl, Sumanth Dathathri, Saffron Huang, Jonathan Uesato, John F. J. Mellor, Irina Higgins, Antonia Creswell, Nathan McAleese, Amy Wu, Erich Elsen, Siddhant M. Jayakumar, Elena Buchatskaya, David Bud- den, Esme Sutherland, Karen Simonyan, Michela Paganini, L. Sifre, Lena Martens, Xiang Lor- raine Li, Adhiguna Kuncoro, Aida Nematzadeh, Elena Gribovskaya, Domenic Donato, Angeliki

15

<!-- page 16 of 39 -->

Lazaridou, Arthur Mensch, Jean-Baptiste Lespiau, Maria Tsimpoukelli, N. K. Grigorev, Doug Fritz, Thibault Sottiaux, Mantas Pajarskas, Tobias Pohlen, Zhitao Gong, Daniel Toyama, Cy- prien de Masson d’Autume, Yujia Li, Tayfun Terzi, Vladimir Mikulik, Igor Babuschkin, Aidan Clark, Diego de Las Casas, Aurelia Guy, Chris Jones, James Bradbury, Matthew G. Johnson, Blake A. Hechtman, Laura Weidinger, Iason Gabriel, William S. Isaac, Edward Lockhart, Si- mon Osindero, Laura Rimell, Chris Dyer, Oriol Vinyals, Kareem W. Ayoub, Jeff Stanway, L. L. Bennett, Demis Hassabis, Koray Kavukcuoglu, and Geoffrey Irving. Scaling language mod- els: Methods, analysis & insights from training gopher. ArXiv, abs/2112.11446, 2021. URL https://api.semanticscholar.org/CorpusID:245353475.

Colin Raffel, Noam M. Shazeer, Adam Roberts, Katherine Lee, Sharan Narang, Michael Matena,

Yanqi Zhou, Wei Li, and Peter J. Liu. Exploring the limits of transfer learning with a unified

text-to-text transformer. ArXiv, abs/1910.10683, 2019. URL https://api.semanticscholar. org/CorpusID:204838007.

Machel Reid, Victor Zhong, Suchin Gururangan, and Luke Zettlemoyer. M2D2: A massively multi-

domain language modeling dataset. In Proceedings of the 2022 Conference on Empirical Methods in Natural Language Processing, pages 964–975, Abu Dhabi, United Arab Emirates, December 2022. Association for Computational Linguistics. URL https://aclanthology.org/2022. emnlp-main.63.

Manoel Horta Ribeiro, Jeremy Blackburn, Barry Bradlyn, Emiliano De Cristofaro, Gianluca

Stringhini, Summer Long, Stephanie Greenberg, and Savvas Zannettou. The evolution of the manosphere across the web. Proceedings of the International AAAI Conference on Web and Social Media, 15:196–207, may 2021. doi: 10.1609/icwsm.v15i1.18053. URL https: //doi.org/10.1609%2Ficwsm.v15i1.18053.

Keisuke Sakaguchi, Ronan Le Bras, Chandra Bhagavatula, and Yejin Choi. Winogrande: An

adversarial winograd schema challenge at scale. Communications of the ACM, 64(9):99–106, 2021. URL https://dl.acm.org/doi/abs/10.1145/3474381.

Rico Sennrich, Barry Haddow, and Alexandra Birch. Neural machine translation of rare words

with subword units. In Proceedings of the 54th Annual Meeting of the Association for Com- putational Linguistics (Volume 1: Long Papers), pages 1715–1725, Berlin, Germany, Au- gust 2016. Association for Computational Linguistics. doi: 10.18653/v1/P16-1162. URL https://aclanthology.org/P16-1162.

Noam M. Shazeer. Glu variants improve transformer. ArXiv, abs/2002.05202, 2020. URL https:

//api.semanticscholar.org/CorpusID:211096588.

Zhihong Shen, Hao Ma, and Kuansan Wang. A web-scale system for scientific knowledge exploration.

In Proceedings of ACL 2018, System Demonstrations, pages 87–92, Melbourne, Australia, July 2018. Association for Computational Linguistics. doi: 10.18653/v1/P18-4015. URL https: //aclanthology.org/P18-4015.

Luca Soldaini, Rodney Kinney, Akshita Bhagia, Dustin Schwenk, David Atkinson, Russell Authur,

Ben Bogin, Khyathi Raghavi Chandu, Jennifer Dumas, Yanai Elazar, Valentin Hofmann, A. Jha, Sachin Kumar, Li Lucy, Xinxi Lyu, Nathan Lambert, Ian Magnusson, Jacob Daniel Morrison, Niklas Muennighoff, Aakanksha Naik, Crystal Nam, Matthew E. Peters, Abhilasha Ravichander, Kyle Richardson, Zejiang Shen, Emma Strubell, Nishant Subramani, Oyvind Tafjord, Pete Walsh, Luke Zettlemoyer, Noah A. Smith, Hanna Hajishirzi, Iz Beltagy, Dirk Groeneveld, Jesse Dodge, and Kyle Lo. Dolma: an open corpus of three trillion tokens for language model pretraining re- search. ArXiv, abs/2402.00159, 2024. URL https://api.semanticscholar.org/CorpusID: 267364861.

Jianlin Su, Yu Lu, Shengfeng Pan, Bo Wen, and Yunfeng Liu. Roformer: Enhanced trans- former with rotary position embedding. ArXiv, abs/2104.09864, 2021. URL https://api. semanticscholar.org/CorpusID:233307138.

16

<!-- page 17 of 39 -->

Yi Tay, Mostafa Dehghani, Jinfeng Rao, William Fedus, Samira Abnar, Hyung Won Chung, Sharan

Narang, Dani Yogatama, Ashish Vaswani, and Donald Metzler. Scale efficiently: Insights from pre-training and fine-tuning transformers. ArXiv, abs/2109.10686, 2021. URL https://api. semanticscholar.org/CorpusID:237592821.

Together Computer. RedPajama: An Open Source Recipe to Reproduce LLaMA training dataset,

April 2023. URL https://github.com/togethercomputer/RedPajama-Data.

Hugo Touvron, Thibaut Lavril, Gautier Izacard, Xavier Martinet, Marie-Anne Lachaux, Timothée

Lacroix, Baptiste Rozière, Naman Goyal, Eric Hambro, Faisal Azhar, Aurelien Rodriguez, Armand Joulin, Edouard Grave, and Guillaume Lample. LLaMA: Open and Efficient Foundation Language Models. arXiv preprint arXiv:2302.13971, 2023.

Unicode. Unicode Text Segmentation, Aug 2023. URL https://unicode.org/reports/tr29/.

Alex Wang, Amanpreet Singh, Julian Michael, Felix Hill, Omer Levy, and Samuel Bowman. GLUE:

A multi-task benchmark and analysis platform for natural language understanding. In Proceedings of the 2018 EMNLP Workshop BlackboxNLP: Analyzing and Interpreting Neural Networks for NLP, pages 353–355, Brussels, Belgium, November 2018. Association for Computational Linguistics. doi: 10.18653/v1/W18-5446. URL https://aclanthology.org/W18-5446.

用于自然语言理解的多任务基准测试和分析平台。 2018 年 EMNLP 研讨会 BlackboxNLP：分析和解释 NLP 神经网络的论文集，第 353-355 页，比利时布鲁塞尔，2018 年 11 月。计算语言学协会。 doi：10.18653/v1/W18-5446。网址 https://aclanthology.org/W18-5446。

Alex Wang, Yada Pruksachatkun, Nikita Nangia, Amanpreet Singh, Julian Michael, Felix Hill, Omer

Levy, and Samuel R. Bowman. SuperGLUE: A Stickier Benchmark for General-Purpose Language Understanding Systems. Curran Associates Inc., Red Hook, NY, USA, 2019.

利维和塞缪尔·鲍曼。 SuperGLUE：通用语言理解系统的更具粘性的基准。 Curran Associates Inc.，美国纽约州雷德胡克，2019 年。

Ben Wang and Aran Komatsuzaki. GPT-J-6B: A 6 Billion Parameter Autoregressive Language Model.

本·王和阿兰·小松崎。 GPT-J-6B：60 亿参数的自回归语言模型。

https://github.com/kingoflolz/mesh-transformer-jax, May 2021.

Johannes Welbl, Nelson F Liu, and Matt Gardner. Crowdsourcing multiple choice science questions.

arXiv preprint arXiv:1707.06209, 2017. URL https://arxiv.org/abs/1707.06209.

M. Xia, Mikel Artetxe, Chunting Zhou, Xi Victoria Lin, Ramakanth Pasunuru, Danqi Chen, Luke

M. Xia, Mikel Artetxe, Chunting Zhou, Xi Victoria Lin, Ramakanth Pasunuru, Danqi Chen, Luke

Zettlemoyer, and Ves Stoyanov. Training trajectories of language models across scales. In Annual Meeting of the Association for Computational Linguistics, 2022. URL https://api.

泽特莫耶和韦斯·斯托亚诺夫。跨尺度的语言模型的训练轨迹。计算语言学协会年会，2022 年。URL https://api。

semanticscholar.org/CorpusID:254877112.

Savvas Zannettou, Barry Bradlyn, Emiliano De Cristofaro, Haewoon Kwak, Michael Sirivianos,

Gianluca Stringini, and Jeremy Blackburn. What is gab: A bastion of free speech or an alt- right echo chamber. In Companion Proceedings of the The Web Conference 2018, WWW ’18, page 1007–1014, Republic and Canton of Geneva, CHE, 2018. International World Wide Web Conferences Steering Committee. ISBN 9781450356404. doi: 10.1145/3184558.3191531. URL https://doi.org/10.1145/3184558.3191531.

吉安卢卡·斯特林吉尼和杰里米·布莱克本。什么是“gab”：言论自由的堡垒或另类右翼的回声室。 2018 年网络会议配套程序，WWW '18，第 1007-1014 页，日内瓦共和国和州，CHE，2018 年。国际万维网会议指导委员会。 ISBN 9781450356404。doi：10.1145/3184558.3191531。网址 https://doi.org/10.1145/3184558.3191531。

Rowan Zellers, Ari Holtzman, Yonatan Bisk, Ali Farhadi, and Yejin Choi. Hellaswag: Can a

罗温·泽勒斯、阿里·霍尔兹曼、尤纳坦·比斯克、阿里·法哈迪和 Yejin Choi。海拉斯瓦格：可以吗

machine really finish your sentence? arXiv preprint arXiv:1905.07830, 2019. URL https: //arxiv.org/abs/1905.07830.

Checklist

1. For all authors...

(a) Do the main claims made in the abstract and introduction accurately reflect the paper’s

(a) 摘要和引言中提出的主要主张是否准确反映了论文的主旨

contributions and scope? [Yes] (b) Did you describe the limitations of your work? [Yes] in § 6 and throughout the paper

贡献和范围？ [是] (b) 您是否描述了您工作的局限性？ [是] 第 6 段以及整篇论文

(for example discussion of metric interpretation in §2) (c) Did you discuss any potential negative societal impacts of your work? [Yes] we discuss

（例如第 2 节中对度量解释的讨论） (c) 您是否讨论了您的工作的任何潜在负面社会影响？ [是] 我们讨论

the challenge of evaluating diverse preferences in §2, and discuss PII and licenses in Appendix E.

§2 中评估不同偏好的挑战，并在附录 E 中讨论 PII 和许可证。

17

<!-- page 18 of 39 -->

(d) Have you read the ethics review guidelines and ensured that your paper conforms to

(d) 您是否已阅读伦理审查指南并确保您的论文符合

them? [Yes]

2. If you are including theoretical results...

(a) Did you state the full set of assumptions of all theoretical results? [N/A] (b) Did you include complete proofs of all theoretical results? [N/A]

(a) 您是否陈述了所有理论结果的全套假设？ [不适用] (b) 您是否提供了所有理论结果的完整证明？ [不适用]

3. If you ran experiments (e.g. for benchmarks)...

(a) Did you include the code, data, and instructions needed to reproduce the main ex-

(a) 您是否包含了重现主要前文所需的代码、数据和说明？

perimental results (either in the supplemental material or as a URL)? [Yes] at https://paloma.allen.ai and experimental controls in Appendix C and model details in §4.1 and Appendix G (b) Did you specify all the training details (e.g., data splits, hyperparameters, how they

实验结果（在补充材料中或作为 URL）？ [是] https://paloma.allen.ai 以及附录 C 中的实验控制以及第 4.1 节和附录 G 中的模型详细信息 (b) 您是否指定了所有训练细节（例如，数据分割、超参数、它们如何

were chosen)? [Yes] in §4.1 and Appendix G (c) Did you report error bars (e.g., with respect to the random seed after running experi-

被选中）？ [是] 在 §4.1 和附录 G (c) 中，您是否报告了误差线（例如，关于运行实验后的随机种子）

ments multiple times)? [No] As we do pretraining experiments, multiple runs are not feasible. (d) Did you include the total amount of compute and the type of resources used (e.g., type

评论多次）？ [否] 当我们进行预训练实验时，多次运行是不可行的。 (d) 您是否包括了计算总量和使用的资源类型（例如，类型

of GPUs, internal cluster, or cloud provider)? [Yes] Yes, Appendix G

4. If you are using existing assets (e.g., code, data, models) or curating/releasing new assets...

4. 如果您正在使用现有资产（例如代码、数据、模型）或策划/发布新资产...

(a) If your work uses existing assets, did you cite the creators? [Yes] Yes, §2 (b) Did you mention the license of the assets? [Yes] Yes, we discuss how our use of these

(a) 如果您的作品使用现有资源，您是否引用了创作者？ [是] 是，§2 (b) 您是否提到了资产的许可？ [是] 是的，我们讨论如何使用这些

artifacts appropriate with their licences in Appendix E (c) Did you include any new assets either in the supplemental material or as a URL? [Yes]

与附录 E 中的许可证相适应的工件 (c) 您是否在补充材料中或作为 URL 包含了任何新资产？ [是的]

at https://paloma.allen.ai (d) Did you discuss whether and how consent was obtained from people whose data you’re

https://paloma.allen.ai (d) 您是否讨论过是否以及如何获得您的数据的人的同意

using/curating? [No] No, data is curated from already publicly distributed research datasets. (e) Did you discuss whether the data you are using/curating contains personally identifiable

使用/策划？ [否] 否，数据是从已经公开分发的研究数据集中整理的。 (e) 您是否讨论过您正在使用/管理的数据是否包含个人身份信息

information or offensive content? [Yes] Yes in Appendix E

5. If you used crowdsourcing or conducted research with human subjects...

(a) Did you include the full text of instructions given to participants and screenshots, if

(a) 您是否提供了给参与者的说明全文和屏幕截图，如果

applicable? [N/A] (b) Did you describe any potential participant risks, with links to Institutional Review

适用的？ [不适用] (b) 您是否描述了任何潜在的参与者风险，并附有机构审查的链接

Board (IRB) approvals, if applicable? [N/A] (c) Did you include the estimated hourly wage paid to participants and the total amount

董事会 (IRB) 批准（如果适用）？ [不适用] (c) 您是否包括了支付给参与者的预计时薪和总额

spent on participant compensation? [N/A]

18

<!-- page 19 of 39 -->

Appendices

A Downstream Correlation Analysis 19

B Additional Metrics 20

C Experimental Controls 20

C.1 Training Controls . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 20

C.2 Evaluation Controls . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 22

D Additional Case Studies 25

D.1 Scaling Improves Domain Fit Unequally . . . . . . . . . . . . . . . . . . . . . . . 25

D.2 Common Vocabulary Types Dominate Perplexity, Others Have Inverse Scaling . . 27

E Evaluation Data Source Details 30

E.1 Removed sources . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 35

F Reweighting Perplexities 36

G Baseline Models 36

H Formatting and Subsampling 37

I Most and Least Improved Domains 37

A Downstream Correlation Analysis（下游相关性分析）

In Table 3 we provide the Spearman’s rank correlation between the ranking of our 6 baseline models’ final checkpoints by each of the 16 PALOMA sources and by each of the 8 downstream evaluations used in OLMo [Groeneveld et al., 2024]. These are Arc (both Easy and Challenge) [Clark et al., 2018], Boolq [Clark et al., 2019], Hellaswag [Zellers et al., 2019], Openbookqa [Mihaylov et al., 2018], Piqa [Bisk et al., 2020], Sciq [Welbl et al., 2017], and Winogrande [Sakaguchi et al., 2021].

在表 3 中，我们提供了 16 个 PALOMA 来源中的每一个以及 OLMo 中使用的 8 个下游评估中的每一个对 6 个基线模型的最终检查点的排名之间的 Spearman 排名相关性 [Groeneveld 等人，2024 年]。这些是 Arc（简单和挑战）[Clark 等人，2018]、Boolq [Clark 等人，2019]、Hellaswag [Zellers 等人，2019]、Openbookqa [Mihaylov 等人，2018]、Piqa [Bisk 等人，2020]、Sciq [Welbl 等人，2017] 和Winogrande [Sakaguchi 等人，2021]。

These results provide some indication of relationships between specific perplexity sources and downstream tasks, such as m2d2 wikipedia and Arc Challenge or Hellaswag and c4-en. Most importantly, it is apparent that no single perplexity evaluation correlates well with all downstream tasks, suggesting the importance of evaluating across a range of diverse perplexity evaluations rather than a single monolithic validation loss.

这些结果提供了特定困惑源与下游任务之间关系的一些指示，例如 m2d2 wikipedia 和 Arc Challenge 或 Hellaswag 和 c4-en。最重要的是，很明显，没有一个单一的困惑度评估与所有下游任务都有很好的相关性，这表明评估一系列不同的困惑度评估而不是单一的整体验证损失的重要性。

However, we caution against reading too far into these correlations without further pretraining experiments across a greater range of compute scales and data mixes. For our set of 6 pretraining experiments, the correlation of rankings by the same downstream tasks between adjacent model checkpoints is only a moderate 0.513 when averaged over tasks and checkpoint pairs. This suggests that the differences in downstream performance between these mixes at this scale are not stably discernible on their own regardless of correlation to perplexity. We hope that users of our benchmark will create controlled pretraining experiments at larger scales with more distinct data mixes whose downstream rankings are more consistently discernible.

然而，我们警告不要在没有跨更大范围的计算规模和数据混合进行进一步的预训练实验的情况下对这些相关性进行过多的解读。对于我们的 6 个预训练实验集，当对任务和检查点对进行平均时，相邻模型检查点之间相同下游任务的排名相关性仅为 0.513。这表明，无论与困惑度的相关性如何，这些规模的混合之间的下游性能差异本身都无法稳定地辨别。我们希望我们的基准测试用户能够使用更独特的数据混合创建更大规模的受控预训练实验，这些数据混合的下游排名更加一致可辨。

19

<!-- page 20 of 39 -->

Arc Challenge Arc Easy Boolq Hellaswag Openbookqa Piqa Sciq Winogrande

c4-en 0.38 0.26 0.60 -0.77 -0.49 -0.41 -0.23 -0.03 mc4-en -0.20 -0.49 0.09 0.03 0.83 -0.23 0.41 0.61 wikitext -0.67 -0.37 0.09 0.83 0.03 0.58 -0.41 -0.61 ptb -0.49 -0.71 0.43 0.49 0.37 0.12 -0.12 -0.26 redpajama -0.52 -0.43 -0.20 0.94 0.20 0.49 -0.17 -0.46 falcon-rw -0.55 -0.31 0.94 -0.14 -0.03 0.12 -0.46 -0.26 dolma -0.38 -0.49 0.31 0.54 0.26 0.06 -0.35 -0.20 m2d2 s2orc -0.46 -0.31 0.14 0.71 0.09 0.29 -0.49 -0.38 m2d2 wikipedia -0.78 -0.60 0.20 0.77 0.14 0.64 -0.17 -0.67 c4 100 domains 0.23 0.37 0.66 -0.83 -0.60 -0.23 -0.32 -0.12 100 subreddits -0.23 -0.14 0.54 0.20 -0.09 -0.06 -0.67 -0.20 100 PLs -0.23 -0.54 0.03 0.66 0.43 -0.03 -0.12 -0.06 twitterAAE 0.06 0.31 0.60 -0.37 -0.20 -0.35 -0.72 0.23 4chan -0.38 -0.49 0.31 0.54 0.26 0.06 -0.35 -0.20 manosphere -0.38 -0.49 0.31 0.54 0.26 0.06 -0.35 -0.20 gab -0.20 -0.03 0.09 0.49 0.14 -0.03 -0.61 0.06 Table 3: Spearman’s rank correlation of our 6 baseline models between PALOMA perplexity evalua- tions and downstream tasks. Values greater than abs(0.5) are bolded for emphasis.

B Additional Metrics（补充指标）

This section details two additional metrics that can be used in PALOMA.

Bits per byte When comparing results where model vocabularies must differ, for instance research to improve tokenizers, PALOMA follows Gao et al. [2020] in using bits per byte (BPB). This metric normalizes the log likelihood ℓover documents by the count of UTF-8 encoded bytes in the corpus, B:

每字节位数 在比较模型词汇必须不同的结果时，例如改进分词器的研究，PALOMA 遵循了 Gau 等人的观点。 [2020] 使用每字节位数 (BPB)。该指标通过语料库中 UTF-8 编码字节的计数对文档上的对数似然 ℓ 进行归一化，B：

BPB = 1

B log2(e−ℓ) = −ℓ B ln(2)

Average likelihood per vocabulary type Both perplexity and BPB can be driven by strings that occur frequently, dominating subtler differences in performance on other strings. An alternative is to measure surprise over all occurrences of specific strings instead. A set of strings particularly important to the model’s functioning are the strings represented in the model’s vocabulary. Following conventional NLP terminology, we call the elements of the vocabulary types in contrast to occurrences of these strings in some corpus, which are called tokens. When running inference in PALOMA we record µ(ℓv), average likelihoods over the whole corpus for each type v, as well as Tv(N), the count of occurrences of that type over the whole corpus (with indicator function 1(·)):

每个词汇类型的平均似然度 困惑度和 BPB 都可以由频繁出现的字符串驱动，从而主导其他字符串上性能的细微差异。另一种方法是衡量特定字符串的所有出现次数的惊喜。对模型功能特别重要的一组字符串是模型词汇表中表示的字符串。按照传统的 NLP 术语，我们将词汇类型的元素称为词汇类型的元素，与某些语料库中这些字符串的出现相对照，称为标记。在 PALOMA 中运行推理时，我们记录 µ(ℓv)，即整个语料库中每种类型 v 的平均似然性，以及 Tv(N)，即该类型在整个语料库中出现的次数（指示函数为 1(·)）：

|t| X

X

1(v = ti) ln p(ti|t<i)

µ(ℓv) = 1 Tv(N)

i

t∈N

C Experimental Controls（实验控制）

Here we discuss the details of the experimental controls (introduced in §3) that we implement to meet our guidelines for rigorous perplexity evaluations. We distinguish controls that must be applied during model training and controls that are applied at inference time.

在这里，我们讨论实验控制的细节（在§3中介绍），我们实施这些控制是为了满足严格的困惑度评估指南。我们区分模型训练期间必须应用的控制和推理时应用的控制。

C.1 Training Controls

C.1.1 Decontamination

A basic tenet of machine learning is that for evaluation to accurately represent performance, training and test data need to be non-overlapping. However, large pretraining corpora are known to contain evaluation data and large models are known to memorize training data [Dodge et al., 2021, Elazar

机器学习的基本原则是，为了评估准确地表示性能，训练和测试数据需要不重叠。然而，已知大型预训练语料库包含评估数据，大型模型则可记忆训练数据 [Dodge et al., 2021, Elazar

20

<!-- page 21 of 39 -->

Dataset Document Removal Rate

DOLMA 0.062% REDPAJAMA 0.099% THE PILE 2.753% FALCON REFINEDWEB 0.733% C4 0.010% MC4-EN 0.002% Table 4: Decontamination removal statistics for the corpora with which we train our 6 baseline models. We remove any training document with any paragraph marked as contaminated against PALOMA.

DOLMA 0.062% REDPAJAMA 0.099% THE PILE 2.753% FALCON REFINEDWEB 0.733% C4 0.010% MC4-EN 0.002% 表 4：我们训练 6 个基线模型的语料库的去污统计数据。我们删除任何带有标记为受 PALOMA 污染的段落的培训文档。

et al., 2023, Carlini et al., 2022]. Lee et al. [2022] show in their second figure that models under- estimate perplexity on evaluation documents with near duplicates in the training corpus by several points relative to models with those duplicate training documents removed. Thus benchmarks of language modeling should actively remove contaminated training data, rather than just partitioning held out splits by documents, assuming no documents overlap. THE PILE applies document-level deduplication to two of their 22 domains before splitting held-out data, but its designers note that this does not prevent leakage of evaluation data more generally [Gao et al., 2020]. Furthermore, spans of contaminated text within larger unrelated documents can still contribute to overestimation of performance, so decontamination should be conducted at a sub-document level. To our knowl- edge, PALOMA is the first language modeling benchmark to require removing training data that is contaminated with respect to evaluation data.

等人，2023 年，Carlini 等人，2022 年]。李等人。 [2022]在他们的第二张图中显示，相对于删除了那些重复训练文档的模型，模型低估了训练语料库中几乎重复的评估文档的困惑度。因此，语言建模的基准应该主动删除受污染的训练数据，而不是假设没有文档重叠，仅仅对文档进行划分。 THE PILE 在分割保留数据之前，将文档级重复数据删除应用于 22 个域中的两个域，但其设计者指出，这并不能防止更普遍的评估数据泄漏 [Gao et al., 2020]。此外，较大的不相关文档中受污染的文本跨度仍然可能导致对性能的高估，因此应在子文档级别进行净化。据我们所知，PALOMA 是第一个要求删除受到评估数据污染的训练数据的语言建模基准。

To mitigate contamination of our benchmark, we develop an approach for removing contamination from training data at the scale of pretraining corpora of trillions of tokens. We use a Bloom filter [Bloom, 1970] as implemented in Soldaini et al. [2024] to match training text that is contaminated with respect to the evaluation data. We employ this approach rather than the minHash or suffix array approaches used by Lee et al. [2022] and other deduplication work, as our approach is much more lightweight: the minHash approach would require pairwise computations, O(|Xt||Xe|) between all training texts, Xt, and evaluation texts, Xe, where our approach runs a constant number of hashes, K << |Xe|, over all texts in O (K(|Xt| + |Xe|)). Meanwhile the implementation of the suffix array approach of Lee et al. [2022] requires memory usage proportional to the size of the pretraining corpora. Since we aim to encourage researchers using our benchmark to run this decontamination on their pretraining data, we opt to minimize cost and engineering complexity.

为了减轻基准的污染，我们开发了一种方法，可以从包含数万亿个令牌的预训练语料库规模的训练数据中消除污染。我们使用 Soldaini 等人实现的布隆过滤器 [Bloom, 1970]。 [2024]匹配受到评估数据污染的训练文本。我们采用这种方法，而不是 Lee 等人使用的 minHash 或后缀数组方法。 [2022] 和其他重复数据删除工作，因为我们的方法更加轻量级：minHash 方法需要在所有训练文本 Xt 和评估文本 Xe 之间进行成对计算 O(|Xt||Xe|)，其中我们的方法在 O (K(|Xt| + |Xe|)) 中的所有文本上运行恒定数量的哈希值 K << |Xe|。同时实施Lee等人的后缀数组方法。 [2022]要求内存使用量与预训练语料库的大小成正比。由于我们的目标是鼓励研究人员使用我们的基准对其预训练数据进行净化，因此我们选择最大限度地降低成本和工程复杂性。

Using our approach to find text matches, we mark contamination in the following way. We match text at the paragraph level, i.e., newline separated spans of text. This granularity strikes a balance between, on one hand, examining only full documents, which can miss contamination embedded in novel documents, and, on the other hand, all n-grams of a given size, where the size of the n-grams must be carefully set. Instead paragraph matching leverages this naturally occurring unit of language, although this heuristic has its own limitations especially in domains such as code or poetry, where line separation is handled very differently from prose. To avoid coincidental collisions in the space of small strings, we ignore matches in paragraphs smaller than 13 unicode segmented tokens [Unicode, 2023], as 13 is the n-gram sized used in contamination checks in Brown et al. [2020] and Rae et al. [2021]. Similarly, we ignore paragraphs composed of only punctuation, spaces, and emoji, as, unlike words, these can be arbitrarily repeated when used as formatting, leading to high frequency n-grams greater than our 13-gram threshold. Lastly, as code data consists almost entirely of short and often repeated lines, we forgo any decontamination on these sources (DOLMA-100-PROGRAMMING- LANGUAGES and the THE STACK domain of DOLMA). We leave the question of how to properly decontaminate code data to future work.

使用我们的方法来查找文本匹配，我们通过以下方式标记污染。我们在段落级别匹配文本，即换行符分隔的文本范围。这种粒度在一方面仅检查完整文档（这可能会漏掉新文档中嵌入的污染）和另一方面检查给定大小的所有 n 元语法（其中 n 元语法的大小必须仔细设置）之间取得了平衡。相反，段落匹配利用了这种自然发生的语言单位，尽管这种启发式有其自身的局限性，特别是在代码或诗歌等领域，其中行分隔的处理方式与散文非常不同。为了避免小字符串空间中的巧合冲突，我们忽略小于 13 个 unicode 分段标记 [Unicode，2023] 的段落中的匹配，因为 13 是 Brown 等人的污染检查中使用的 n 元语法大小。 [2020]和Rae等人。 [2021]。同样，我们忽略仅由标点符号、空格和表情符号组成的段落，因为与单词不同，这些在用作格式时可以任意重复，导致高频 n 元语法大于我们的 13 元语法阈值。最后，由于代码数据几乎完全由短且经常重复的行组成，因此我们放弃对这些源（DOLMA-100-PROGRAMMING-LANGUAGES 和 DOLMA 的 STACK 域）进行任何净化。我们把如何正确净化代码数据的问题留给以后的工作。

Having marked contaminated paragraphs, we now take the conservative measure of removing whole documents if they contain any contaminated paragraph. This has the added benefit of not disrupting the continuity of text within documents, which excising paragraphs would do. Applying this approach to the datasets on which we train 6 baseline models results in the removal rates shown in Table 4. While these vary by orders of magnitude from dataset to dataset (with THE PILE perhaps receiving a

标记受污染的段落后，我们现在采取保守的措施，如果文档包含任何受污染的段落，则删除整个文档。这样做的另一个好处是不会破坏文档内文本的连续性，而删除段落就可以做到这一点。将这种方法应用于我们训练 6 个基线模型的数据集，得到的去除率如表 4 所示。虽然这些数据集之间存在数量级的差异（THE PILE 可能会收到

21

<!-- page 22 of 39 -->

higher removal rate due to the intentional oversampling in that dataset), this approach removes at most 2.753% of documents, making it feasible to apply without dramatically reducing training dataset size. Nevertheless, care should be taken to examine removal rates when applying this approach to new datasets.

由于该数据集中有意进行过采样，删除率更高），这种方法最多删除 2.753% 的文档，使其可以在不显着减少训练数据集大小的情况下应用。然而，在将此方法应用于新数据集时，应注意检查去除率。

Another limitation arises from our use of documents as a fundamental unit of data. This impacts our decontamination approach, since we remove whole documents that have any paragraph marked as contaminated to avoid mangling documents by excising individual paragraphs. Such an approach tends to disproportionately remove long documents that are frequently quoted, which may include seminal works (e.g., Martin Luther King’s “I Have a Dream” speech) that actually deployed models should be familiar with. The purpose of PALOMA, however, is to enable controlled research on the science of language modeling, but production models should likely use caution in applying this decontamination technique.

另一个限制来自于我们使用文档作为数据的基本单位。这会影响我们的净化方法，因为我们会删除任何段落标记为受污染的整个文档，以避免通过删除个别段落来破坏文档。这种方法往往会不成比例地删除经常引用的长文档，其中可能包括实际部署的模型应该熟悉的开创性作品（例如马丁·路德·金的“我有一个梦想”演讲）。然而，PALOMA 的目的是实现语言建模科学的受控研究，但生产模型在应用这种净化技术时可能应谨慎行事。

C.1.2 Data Order

Another decision that affects language modeling experiments is the order of training documents. While intentionally designing curricula by ordering training data to improve performance is an area of active research (Bengio et al., 2009, inter alia), most LMs simply randomize the training order. In this case greater comparability between experiments with the same dataset can be achieved if the same random order is used for all models. This also facilitates research that examines exactly what data a given model checkpoint has seen or not seen at that point in training. No previous language modeling benchmarks require the fixing of training order.

影响语言建模实验的另一个决定是训练文档的顺序。虽然通过对训练数据进行排序来有意设计课程以提高性能是一个活跃的研究领域（Bengio 等人，2009 年等），但大多数 LM 只是随机化训练顺序。在这种情况下，如果所有模型使用相同的随机顺序，则可以在具有相同数据集的实验之间实现更大的可比性。这也有利于研究准确检查给定模型检查点在训练中该点已经看到或没有看到哪些数据。以前的语言建模基准都不需要固定训练顺序。

As contemporary LMs train on instances that are themselves concatenations of training documents up to the maximum sequence length of the model, to fix the order of training data one cannot simply fix the order of documents but must train on the same concatenated instances. Achieving this requires not just a fixed random seed for training instance shuffling, but also adopting the same tokenization and maximum sequence length. Further fixing the number of instances in each gradient update would be required for fully identical training, however this is onerous for experiments that may be run on different hardware requiring different batch sizes. A compromise instead is to ensure that training code feeds instances into gradient steps in a deterministic shuffled order, so the relative ordering of data remains the same even if a given instance may fall in different gradient updates. In conclusion, we adopt the most direct way of controlling data order—we recommend using the same training code that we use to pretrain our baseline models.

由于当代 LM 在实例上进行训练，而实例本身就是训练文档的串联，直至模型的最大序列长度，因此要固定训练数据的顺序，不能简单地固定文档的顺序，而必须在相同的串联实例上进行训练。实现这一点不仅需要用于训练实例洗牌的固定随机种子，还需要采用相同的标记化和最大序列长度。对于完全相同的训练，需要进一步固定每个梯度更新中的实例数量，然而，这对于可能在需要不同批量大小的不同硬件上运行的实验来说是繁重的。相反，一种折衷方案是确保训练代码以确定性的混洗顺序将实例输入到梯度步骤中，因此即使给定实例可能处于不同的梯度更新中，数据的相对顺序也保持不变。总之，我们采用最直接的方法来控制数据顺序——我们建议使用与预训练基线模型相同的训练代码。

C.2 Evaluation Controls

C.2.1 Subsampling

There is no shortage of text that can be used to estimate perplexity, so we must choose how much to evaluate based on a tradeoff of inference cost and metric stability over different subsamples. The value we ultimately care to estimate is the perplexity of the model on all the available data, not just a subsample. Much existing work considers the estimation of other information theoretic quantities such as entropy and mutual information (Paninski, 2003 inter alia), so the estimation of perplexity should likewise be treated with care, for instance in subsampling evaluation data. Previous benchmarks subsample uniformly over the whole corpus, leaving some domains represented by very little data. M2D2 mitigates this by an ad hoc minimum size, but this still leads to domains with different sizes. PALOMA takes a first step towards controlling for subsampling induced variance in perplexity estimation by using a stratified subsample across domains and providing a preliminary empirical measure of metric bias and variance extrapolated from one domain.

可用于估计复杂度的文本并不缺乏，因此我们必须根据不同子样本的推理成本和度量稳定性的权衡来选择评估的量。我们最终想要估计的值是模型对所有可用数据（而不仅仅是子样本）的复杂度。许多现有的工作考虑了其他信息论量的估计，例如熵和互信息（Paninski，2003年等），因此困惑度的估计同样应该小心对待，例如在子采样评估数据中。以前的基准测试对整个语料库进行统一的子采样，留下一些由很少数据代表的领域。 M2D2 通过临时的最小大小缓解了这一问题，但这仍然会导致域具有不同的大小。 PALOMA 通过使用跨域的分层子样本并提供从一个域推断的度量偏差和方差的初步经验测量，在控制复杂度估计中的子采样引起的方差方面迈出了第一步。

In Figure 5, we evaluate perplexity on data from C4 using Pythia 1.4B [Biderman et al., 2023] while varying the size of the evaluation subsample and training checkpoint. Each point in this figure represents the mean of perplexity on 20 different uniform subsamples and standard deviation is represented by the shaded region. As we expect, for a given checkpoint standard deviation shrinks as the evaluation subsample gets larger. More subtly, standard deviation shrinks as the model is trained

在图 5 中，我们使用 Pythia 1.4B [Biderman et al., 2023] 评估来自 C4 的数据的困惑度，同时改变评估子样本和训练检查点的大小。该图中的每个点代表 20 个不同均匀子样本的困惑度平均值，标准差由阴影区域代表。正如我们所期望的，对于给定的检查点，标准差随着评估子样本变大而缩小。更巧妙的是，随着模型的训练，标准偏差会缩小

22

<!-- page 23 of 39 -->

Average Perplexity

(Over 20 Subsamples)

Checkpoint (Tokens Seen) 25B 86B 300B

14 15 16 17 18 19 20 21 22 23

100k 250k 500k 1000k 4000k 8000k Evaluation Subsample Size

Figure 5: Average perplexity and standard deviation over 20 subsamples of C4 validation data using Pythia 1.4B checkpoints. We find that variance in perplexity over subsamples of evaluation data decreases steadily as evaluation samples grow.

on more data. This second observation matters if we want to measure model performance throughout training. Lastly note that the mean value is relatively stable over different evaluation subsample sizes, though a slight downward trend appears at the smallest subsample sizes.

关于更多数据。如果我们想在整个训练过程中测量模型性能，那么第二个观察结果很重要。最后请注意，平均值在不同的评估子样本大小上相对稳定，尽管在最小子样本大小处出现轻微下降趋势。

The stable trend of subsample size and variance in perplexity allows us to estimate how much perplexity numbers might change if a different subsample of the same size were drawn. Furthermore, when preparing splits for perplexity evaluation across many domains, it would be best to size for a similar level of metric variance. Most often perplexity evaluation data is subsampled uniformly over the original distribution of domains in a source, resulting in more or less tokens from each domain in the evaluation data based on how well represented they are in the corpus. We instead employ stratified sampling, in which all sources with marked domains are partitioned by domain and a uniform sample of the same size is taken from each partition. Specifically, documents are sampled from each domain until the same target number of tokens is reached. This helps ensure that no domains are lost or very small after subsampling.

子样本大小和困惑度方差的稳定趋势使我们能够估计如果抽取相同大小的不同子样本，困惑度数字可能会发生多少变化。此外，当为跨多个领域的困惑度评估准备分割时，最好针对相似水平的度量方差进行调整。大多数情况下，困惑度评估数据是在源中域的原始分布上均匀二次采样的，从而根据评估数据中每个域在语料库中的表示程度，产生或多或少的标记。相反，我们采用分层抽样，其中所有具有标记域的源都按域进行分区，并从每个分区中获取相同大小的统一样本。具体来说，从每个域中对文档进行采样，直到达到相同的目标令牌数。这有助于确保二次采样后不会丢失任何域或域非常小。

As a small first step towards more principled subsampling, we set the target subsample size based on the simplifying assumption that our metric variance results on C4 hold for other domains and models. Extrapolating our observations, we aim to subsample each split to a minimum of 1 million tokens per source and a minimum of 100 thousand tokens per domain. All datasets with domains are subsampled to 100 thousand tokens per domain other than MANOSPHERE CORPUS which we treat as a single-domain source, ICE which was included in early versions of Paloma in entirety for comparability to its use in HELM, and DOLMA which we subsample at a higher target of 500 thousand tokens per domain. A few sources fall below our thresholds, with WIKITEXT-103, PENN TREEBANK, and TWITTERAAE being smaller than 1 million tokens per split despite being included in their entirety, and REDPAJAMA having only 7 domains leading to 700 thousand tokens per split. We show the final token statistics in Table 1.

作为迈向更有原则的子采样的第一步，我们根据简化假设设置目标子样本大小，即我们在 C4 上的度量方差结果适用于其他域和模型。根据我们的观察结果，我们的目标是对每个分割进行子采样，每个源至少有 100 万个标记，每个域至少有 10 万个标记。所有具有域的数据集都被二次采样到每个域 10 万个标记，但 MANOSPHERE CORPUS 除外，我们将其视为单域源；ICE 被完整地包含在 Paloma 的早期版本中，以便与它在 HELM 中的使用进行比较；以及 DOLMA，我们以每个域 50 万个标记的更高目标进行二次采样。一些来源低于我们的阈值，其中 WIKITEXT-103、PENN TREEBANK 和 TWITTERAAE 尽管全部包含在内，但每次拆分的代币数量还不到 100 万个，而 REDPAJAMA 只有 7 个域，每次拆分的代币数量为 70 万个。我们在表 1 中显示了最终的代币统计数据。

If extrapolation from the trends we observed holds, perplexities on sources will be drawn from a distribution over subsamples with less than 1 standard deviation even at very early stages of training. Meanwhile, results on domains will be drawn for a similarly stable distribution by the end of training. This is admittedly a heuristic simplification, as the relationship between variability and subsampling will also likely depend on other factors such as average document length and heterogeneity of the source data, as well as the power of the model being evaluated. We must leave it to future benchmarks to explore these questions as the requirement of decontaminating pretraining data against evaluation data means any change to the evaluation data necessitates costly rerunning of pretraining of all baselines.

如果从我们观察到的趋势进行推断成立，即使在训练的早期阶段，也可以从小于 1 个标准差的子样本分布中得出来源的困惑。同时，在训练结束时，将得出类似稳定分布的领域结果。无可否认，这是一种启发式简化，因为变异性和子采样之间的关系也可能取决于其他因素，例如平均文档长度和源数据的异质性，以及正在评估的模型的能力。我们必须将其留给未来的基准来探索这些问题，因为根据评估数据净化预训练数据的要求意味着评估数据的任何更改都需要昂贵的成本重新运行所有基线的预训练。

Another limitation arises from our use of documents as a fundamental unit of data. When subsampling although we balance the number of tokens used to represent each domain, we still sample documents

另一个限制来自于我们使用文档作为数据的基本单位。二次采样时，尽管我们平衡了用于表示每个域的标记数量，但我们仍然对文档进行采样

23

<!-- page 24 of 39 -->

until that target token count is reached. Concretely, this means that some domains, especially books, are represented by only dozens of documents, which likely does not capture the full distribution of the domain as well as many smaller documents might.

直到达到目标令牌计数。具体来说，这意味着某些领域（尤其是书籍）仅由数十个文档表示，这可能无法像许多较小的文档那样捕获该领域的完整分布。

C.2.2 Vocabulary

Perplexity per token is not comparable between models with different vocabularies [Jelinek, 1998] or, by extension, different tokenizers [Mielke, 2019]. Since models distribute probability over a vocabulary of tokens, models with larger vocabularies will tend to have higher perplexities than ones with smaller vocabularies. Where possible, the most rigorous solution is to impose one vocabulary on all experiments, allowing perplexity to be directly compared. Some lines of research, such as improving tokenizers, require comparisons of LM fit across vocabularies. This is possible by normalizing likelihood by a segmentation intrinsic to the text such as characters or bytes [Mielke, 2019]. THE PILE [Gao et al., 2020] proposes BPB (Appendix B) as the best compromise when tokenizers are not identical, an approach we adopt as well. PALOMA further establishes a standard tokenizer and vocabulary for experiments that do not need to change this experimental variable.

每个标记的困惑度在具有不同词汇表 [Jelinek, 1998] 或不同标记器 [Mielke, 2019] 的模型之间不具有可比性。由于模型将概率分布在标记词汇表上，因此词汇表较大的模型往往比较词汇表较小的模型具有更高的困惑度。在可能的情况下，最严格的解决方案是对所有实验强加一种词汇，从而可以直接比较困惑度。某些研究领域，例如改进分词器，需要比较 LM 与词汇表的拟合度。这可以通过文本固有的分段（例如字符或字节）对可能性进行标准化来实现[Mielke，2019]。 THE PILE [Gao et al., 2020] 提出 BPB（附录 B）是当分词器不相同时的最佳折衷方案，我们也采用了这种方法。 PALOMA进一步为不需要改变这个实验变量的实验建立了标准的分词器和词汇表。

Where possible we control by the simplest approach of using the same vocabulary: the vocabulary used in GPT-NeoX-20B [Black et al., 2022] with 3 special tokens added by DOLMA for masking personally identifiable information. Note that when vocabulary is fixed this is essentially a training control, as the model must be pretrained with this vocabulary. Nevertheless we mark this as an evaluation control, as we provide an option applied at inference time for making comparisons of models already pretrained with different vocabularies. Specifically, we follow THE PILE [Gao et al., 2020] and use BPB. In theory BPB may still present issues in comparability as it only includes likelihoods of the specific sequences produced by a given tokenizer, e.g., rain ##ing for the text raining, and not the marginal probability over all valid sequences in that vocabulary which would produce the identical text, e.g., ra ##in ##ing and so on (Mielke, 2019, Cao and Rimell, 2021; see also Hofmann et al., 2021). Models with a larger event space of possible sequences representing the same text will be at a disadvantage if they assign any non-zero probability to these valid predictions ignored by the metric. However, it has been shown empirically that the difference between the marginal probability over all valid sequences and the likelihood of the sequence produced by the tokenizer is small [Mielke and Eisner, 2018] and typically lower than 0.5% [Chirkova et al., 2023]. So in conclusion, we encourage those using PALOMA to opt in to our fixed vocabulary, or make comparisons involving models with different vocabularies in BPB.

在可能的情况下，我们通过使用相同词汇的最简单方法进行控制：GPT-NeoX-20B [Black et al., 2022] 中使用的词汇，带有 DOLMA 添加的 3 个特殊标记，用于掩盖个人身份信息。请注意，当词汇量固定时，这本质上是一种训练控制，因为模型必须使用该词汇量进行预训练。尽管如此，我们将其标记为评估控制，因为我们提供了在推理时应用的选项，用于对已经使用不同词汇表进行预训练的模型进行比较。具体来说，我们遵循 THE PILE [Gao et al., 2020] 并使用 BPB。理论上，BPB 可能仍然存在可比性问题，因为它只包括给定分词器生成的特定序列的可能性，例如，文本 raining 的 rain ##ing，而不是该词汇表中产生相同文本的所有有效序列的边际概率，例如 ra ##in ##ing 等（Mielke，2019；Cao 和 Rimell，2021；另请参阅 Hofmann 等人， 2021）。如果模型为这些被度量忽略的有效预测分配任何非零概率，那么具有代表相同文本的可能序列的较大事件空间的模型将处于劣势。然而，经验表明，所有有效序列的边际概率与分词器生成的序列的可能性之间的差异很小 [Mielke 和 Eisner，2018]，通常低于 0.5% [Chirkova 等人，2023]。所以总而言之，我们鼓励那些使用 PALOMA 的人选择我们的固定词汇表，或者对 BPB 中具有不同词汇表的模型进行比较。

C.2.3 Evaluation Format

While perplexity is clearly defined as a function of the likelihood assigned by a model to a set of sequences, the manner in which that likelihood is computed may vary depending on how inputs are formatted for the model. THE PILE [Gao et al., 2020] identify one possible variation: inferring test documents as separate inputs or concatenating them together to fill a single input. Meanwhile, Press et al. [2021] point out that documents larger than the maximum sequence length can be split either with or without overlap.

虽然困惑度被明确定义为模型分配给一组序列的可能性的函数，但计算可能性的方式可能会根据模型输入的格式而有所不同。 THE PILE [Gao et al., 2020] 确定了一种可能的变化：将测试文档推断为单独的输入或将它们连接在一起以填充单个输入。与此同时，普雷斯等人。 [2021]指出大于最大序列长度的文档可以在有或没有重叠的情况下进行分割。

We follow the input format established by THE PILE [Gao et al., 2020]. In this format, documents are evaluated individually, e.g., “<BOS>document 1” then “<BOS>document 2”, rather than packed into concatenated maximum sequence length inputs, e.g., “<BOS>document 1<BOS>document 2<BOS>...”, where <BOS> is a special token for demarcating sequences. The latter concatenated approach is still often used as it takes the same preprocessing as is most commonly used for training data and is thus convenient for measuring validation loss during training. However, in Appendix H we find preliminary evidence that the predictability of variance from subsampling observed in Appendix C.2.1 breaks down for concatenated inputs. We also believe that evaluating documents individually more closely mirrors how models are used in practice at inference time. Providing more than one document at a time through concatenation is essentially a form of few shot in context learning for language modeling, as it allows the model to condition on information shared between

我们遵循 THE PILE [Gao et al., 2020] 建立的输入格式。在这种格式中，文档被单独评估，例如“<BOS>文档 1”然后“<BOS>文档 2”，而不是打包到串联的最大序列长度输入中，例如“<BOS>文档 1<BOS>文档 2<BOS>...”，其中 <BOS> 是用于划分序列的特殊标记。后一种串联方法仍然经常使用，因为它采用与训练数据最常用的相同的预处理，因此可以方便地测量训练期间的验证损失。然而，在附录 H 中，我们发现了初步证据，表明附录 C.2.1 中观察到的二次抽样方差的可预测性对于串联输入来说是不成立的。我们还认为，单独评估文档更能反映模型在推理时的实际使用方式。通过串联一次提供多个文档本质上是语言建模上下文学习中少量镜头的一种形式，因为它允许模型以之间共享的信息为条件

24

<!-- page 25 of 39 -->

concatenated documents when they are all drawn from the same domain. This is perhaps an interesting task formulation of its own but one that should be undertaken intentionally.

当它们全部来自同一域时，串联文档。这本身可能是一个有趣的任务表述，但应该有意识地进行。

Moreover, following THE PILE, we split documents longer than maximum sequence length into disjoint inputs. This is also described by Press et al. [2021] as nonoverlapping inference. It is contrasted with sliding window inference in which some amount of overlapping tokens are included as context in maximum-sequence-length windows to prevent an unrealistic lack of conditioning for tokens in the middle of a document appearing shortly after a multiple of the maximum sequence length. However, a sliding window requires re-encoding overlapping tokens, making nonoverlapping inference the most efficient approach to computing perplexity.

此外，按照 THE PILE，我们将长于最大序列长度的文档分割成不相交的输入。 Press 等人也描述了这一点。 [2021]作为非重叠推理。它与滑动窗口推理形成对比，在滑动窗口推理中，一定数量的重叠标记作为上下文包含在最大序列长度窗口中，以防止在最大序列长度的倍数之后不久出现的文档中间的标记不切实际地缺乏条件。然而，滑动窗口需要重新编码重叠标记，使得非重叠推理成为计算困惑度的最有效方法。

D Additional Case Studies（补充案例研究）

In this section, we present additional case studies to explore analyses possible with PALOMA. Previously in §4.1, we use our 6 baseline 1B models that vary only in which common corpus they are pretrained on to isolate the effect of data composition on LM fit. In §4.2 we introduced the observation that most loss occurs on the most common vocabulary types, which we now expand on in Appendix D.2 by analyzing performance dynamics of different vocabulary types. First, in Appendix D.1, we examine how scaling dynamics differ over the breadth of domains in PALOMA.

在本节中，我们将介绍更多案例研究来探索 PALOMA 可能进行的分析。之前在第 4.1 节中，我们使用 6 个基线 1B 模型，这些模型仅在预训练的常见语料库上有所不同，以隔离数据组合对 LM 拟合的影响。在第 4.2 节中，我们介绍了大多数损失发生在最常见词汇类型上的观察结果，现在我们通过分析不同词汇类型的性能动态在附录 D.2 中对此进行了扩展。首先，在附录 D.1 中，我们研究了 PALOMA 中的扩展动态在域广度上有何不同。

Results in the appendix include two additional sources THE PILE [Gao et al., 2020] and ICE [Greenbaum and Nelson, 1996], however access restrictions on these datasets prevent us from rehosting them. As such we have removed them from the body of our paper, but still share our findings on these datasets as auxiliary results not part of PALOMA.

附录中的结果包括两个额外的来源：THE PILE [Gao et al., 2020] 和 ICE [Greenbaum and Nelson, 1996]，但是这些数据集的访问限制阻止我们重新托管它们。因此，我们已将它们从论文正文中删除，但仍将我们在这些数据集上的发现作为辅助结果分享，而不是 PALOMA 的一部分。

D.1 Scaling Improves Domain Fit Unequally

We return to the question, does rising performance lift all domains? That is, does the sign of scaling trends observed in previous work [Kaplan et al., 2020, Hoffmann et al., 2022] hold across all domains? And if so, do some domains still capture most of the improvement while others stagnate?

我们回到这个问题，性能的提升是否会提升所有领域？也就是说，之前的工作 [Kaplan et al., 2020, Hoffmann et al., 2022] 中观察到的缩放趋势的迹象是否适用于所有领域？如果是这样，某些领域是否仍然获得了大部分改进，而其他领域却停滞不前？

D.1.1 Scaling Tokens Seen

In Figure 6, we study the impact of increased training on domain fit. We make use of the finding that the logarithms of loss and tokens seen trend linearly Kaplan et al. [2020], and make an estimate of improvement based on the slope between two empirical observations of perplexity (ppl), with some initial and final number of tokens, i and f, seen by checkpoints of a model θ:

在图 6 中，我们研究了增加训练对领域适合度的影响。我们利用了损失和代币的对数呈线性趋势的发现 Kaplan 等人。 [2020]，并根据对困惑度 (ppl) 的两次经验观察之间的斜率进行改进估计，并通过模型 θ 的检查点看到一些初始和最终的标记数量 i 和 f：

∆t(i, f) = ln(ln(ppl(θi))) −ln(ln(ppl(θf)))

log10(f) −log10(i)

Specifically, we plot ∆t(∼20B, ∼150B) for each domain in ascending order for each of our 6 baselines.9

具体来说，我们为 6 个基线中的每一个按升序绘制每个域的 Δt(∼20B,∼150B)。9

On some corpora, more pretraining worsens fit on some domains Baselines trained on C4 and MC4-EN worsen with longer training on 65 and 43 domains respectively. Other than these two baselines, only 6 other pairs of models and domains see such a deterioration. Among these 6 pairs only the REDPAJAMA baseline exceeds ∆t(∼20B, ∼150B) > 0.1, likely due to the previously noted spike in training loss near the final checkpoint of this model. It is unclear why the other baseline trained on only Common Crawl data, FALCON REFINEDWEB, does not also exhibit erratic behavior this time, though possibly its cleaning heuristics avoid removing content important to these domains that the other two models’ cleaning heuristics do remove.

在某些语料库上，更多的预训练会导致某些领域的拟合度变差。在 C4 和 MC4-EN 上训练的基线分别会随着在 65 个和 43 个领域上的训练时间更长而变得更差。除了这两个基线之外，只有其他 6 对模型和领域出现了这种恶化。在这 6 对中，只有 REDPAJAMA 基线超过 Δt(∼20B,∼150B) > 0.1，可能是由于之前提到的该模型最终检查点附近训练损失的峰值。目前还不清楚为什么仅在 Common Crawl 数据上训练的另一个基线 FALCON REFINEDWEB 这次也没有表现出不稳定的行为，尽管它的清理启发式可能避免删除对其他两个模型的清理启发式确实删除的这些领域重要的内容。

9Note that the precise number of tokens seen by a given checkpoint does vary slightly between baselines, as these were run on heterogeneous hardware requiring slight differences in batch size.

9请注意，给定检查点看到的令牌的精确数量在基线之间确实略有不同，因为这些是在异构硬件上运行，需要批量大小略有不同。

25

<!-- page 26 of 39 -->

The Pile

RedPajama

Dolma V1.5

M2D2 S2ORC

M2D2 Wikipedia

0 -0.60 -0.20 0.20 0.60

0 -0.60 -0.20 0.20

0 -0.05 0.05 0.15 0.25 0.35 0.45

-0.10 0 0.10 0.20 0.30 0.40

0 -0.03 0.03 0.08 0.13 0.18 0.23

0 6 12 18

0 2 4 6

0 2 4

0 42 84 126 168

0 13 26 39

C4 100 Domains

100 Subreddits

100 PLs

ICE

Twitter AAE

Log Loss Improvement per 10x Tokens Seen

-0.20 -0.10 0 0.10 0.20 0.30

-0.05 0 0.05 0.10 0.15

-1.00 -0.50 0 0.50 1.00 1.50

-0.20 -0.10 0 0.10 0.20

0 -0.15 -0.05 0.05 0.15

0 25 50 75 100

0 26 52 78

0 26 52 78

0 5 10 15

0 1

Domains Ordered by Improvement per Model

Baselines

Dolma v1.5 1B The Pile 1B Falcon-RefinedWeb 1B C4 1B mC4 1B RedPajama 1B

卓玛 v1.5 1B 堆 1B Falcon-RefinedWeb 1B C4 1B mC4 1B RedPajama 1B

Figure 6: As log loss and log tokens trend linearly, we estimate reduction in log loss per 10× increase in tokens seen based on the slope between ∼20B and ∼150B checkpoints. We report this rate of improvement for each domain in ascending order per baseline model. This reveals that for some models and domains, loss actually increases with further training. However, excepting just 6 model-domain pairs, all baselines other than C4 and MC4-EN improve on all domains with a similar range between most and least improvement. Even among these, the median difference in improvement between most and least improved domains has nearly twice as fast improvement for most improved domain.

Even for corpora where fit consistently improves, the rate of improvement is unequal On the vast majority of domains, fit does improve with increased training. However rates of improvement, ∆t(∼20B, ∼150B), range substantially. Examining the median difference in improvement between

即使对于拟合度持续提高的语料库，改进率也是不平等的。在绝大多数领域，拟合度确实会随着训练的增加而提高。然而，改善率 Δt(∼20B, ∼150B) 范围很大。检查改善之间的中位数差异

most and least improved domains shows 1.57x improvement for most improved domain, and this gap grows to 1.94x when excluding the C4 and MC4-EN baselines.

改进最多的域和改进最少的域显示，改进最多的域提高了 1.57 倍，而当排除 C4 和 MC4-EN 基线时，这一差距将扩大到 1.94 倍。

Slow improvement on a domain is not always unwanted, but surfaces dynamics of model learning Having identified the most and least improved domains, we visualize perplexity curves of 3 examples each demonstrating a different interpretation in Figure 7. On the left plot we see that sometimes fit can actually worsen on one domain while improving on another domain, in this case perhaps due to content filters in MC4-EN pretraining data blocking terms frequently used in discussion about dating and sexuality. But even when fit improves on both domains as in the middle plot, the rate of improvement can be slower for one than the other, possibly reflecting differences in the quantity or heterogeneity of earth sciences or visual arts content in DOLMA. However, the right plot shows that the least improved domain can actually outperform the most improved domains in terms of absolute perplexity, in this case perhaps representing saturation of performance on the DM Mathematics domain. Further examples are provided in the Appendix in Figure 13. Ultimately, our goal is not to frame unequal improvement as a problem that needs to be fixed, but rather it is way to surface subtler dynamics in language model learning.

某个领域的缓慢改进并不总是不必要的，但表面上是模型学习的动态。在确定了改进最多和最少的领域后，我们可视化了 3 个示例的困惑度曲线，每个示例在图 7 中展示了不同的解释。在左图中，我们看到有时拟合度实际上会在一个域上恶化，而在另一个域上改进，在这种情况下，可能是由于 MC4-EN 预训练数据中的内容过滤器阻止了有关约会和性的讨论中经常使用的术语。但即使当两个领域的拟合度都得到改善（如中间图所示）时，其中一个领域的改善速度也可能比另一个领域慢，这可能反映了 DOLMA 中地球科学或视觉艺术内容的数量或异质性差异。然而，右图显示，就绝对困惑度而言，改进最少的领域实际上可以胜过改进最多的领域，在这种情况下，可能代表 DM 数学领域的性能饱和。图 13 的附录中提供了更多示例。最终，我们的目标不是将不平等的改进视为需要解决的问题，而是在语言模型学习中展现更微妙的动态。

D.1.2 Scaling Model Parameters

While the 6 baseline models that we pretrain ourselves are all 1B parameter models, we can use models of varying sizes from the Pythia model suite [Biderman et al., 2023] to examine the impact

虽然我们自己预训练的 6 个基线模型都是 1B 参数模型，但我们可以使用 Pythia 模型套件 [Biderman et al., 2023] 中不同大小的模型来检查影响

26

<!-- page 27 of 39 -->

Eval: 100 Subreddits

Model: mC4 1B

Eval: M2D2 Wikipedia Model: Dolma v1.5 1B

Eval: The Pile Model: The Pile 1B

Visual_arts Earth_sciences

DM_Mathematics YoutubeSubtitles

Perplexity

91_dating_advice 81_askscience

3.4 4.4 6.2 9.3 15.2

20.2 27.7 39.2 57.7

10.4 13.3 17.4 23.5

20 65 150

20 65 150

20 65 150

Tokens Seen (Billions)

Figure 7: We examine 3 types of examples of most (black dashed) and least (red dotted) improved domains for 3 pairs of sources and models, where improvement is measured in terms of log loss per 10× increase in tokens seen (see Figure 6). As on the left, fit to a least improved domain can actually worsen in absolute terms or, as in the middle, simply improve more slowly. On the right, we see that least improved domains may even be better fit in absolute terms. Unequal improvement between domains is not undesirable a priori but merits finer-grained examination, enabled by PALOMA.

of scaling model parameters on domain fit. As we note in §G, these models are not controlled for contamination but they do address all of our other guidelines.

域拟合的缩放模型参数。正如我们在 §G 中指出的，这些模型没有受到污染控制，但它们确实满足了我们所有其他指南的要求。

Increased parameter count sees consistently lower perplexity In Figure 8, we show the macro average of perplexity over any domains in each source (as we did in Figure 2) for 3 sizes of Pythia model. Not only does this always show an increase in performance with greater parameter count, but the relative differences between the performance curves are remarkably stable across all sources. Additionally, macro average perplexity decreases faster over number of tokens seen for larger models in all sources.

参数数量的增加导致困惑度持续降低在图 8 中，我们显示了 3 种尺寸的 Pythia 模型的每个源中任何域的困惑度的宏观平均值（如图 2 所示）。这不仅总是表明随着参数数量的增加，性能有所提高，而且所有来源的性能曲线之间的相对差异都非常稳定。此外，随着所有来源中较大模型的标记数量的增加，宏观平均困惑度下降得更快。

Improvements from model size improve unequally for different domains In Figure 9 we perform the same analysis of improvement in log loss as before but this time with respect to log increase in non-embedding parameters, ∆p(i, f). Specifically we plot ∆p(85M, 805M) and ∆p(805M, 6.4B) for the non-embedding parameter counts corresponding to the 160M, 1B, and 7B model sizes for each domain in ascending order per pair of models compared. This time scaling does universally result in improvements. However, the rate of improvement varies greatly from domain to domain. Examining the median difference in improvement between most and least improved domains shows 2.02× improvement for the most improved domain, a similar gap to that seen on increases in tokens seen. Again, we stress that unequal improvement is not necessarily problematic, but rather it helps identify outlier domains that follow different scaling trends than the majority of the data. We offer examples of most and least improved domains with respect to increase in model size in the Appendix in Figure 14.

模型大小的改进对于不同领域的改进并不均匀 在图 9 中，我们对对数损失的改进进行了与之前相同的分析，但这次是针对非嵌入参数 Δp(i, f) 的对数增加。具体来说，我们为每个域的 160M、1B 和 7B 模型大小对应的非嵌入参数计数绘制了 Δp(85M, 805M) 和 Δp(805M, 6.4B)，按升序排列每对模型进行比较。这次时间缩放确实普遍带来了改进。然而，不同领域的改进速度差异很大。检查改进最多的领域和改进最少的领域之间的中值差异显示，改进最多的领域有 2.02 倍的改进，这与所见标记增加的差距类似。我们再次强调，不平等的改进不一定是有问题的，但它有助于识别遵循与大多数数据不同的缩放趋势的异常值域。我们在图 14 的附录中提供了关于模型大小增加最多和最少改进领域的示例。

Taken together, the results presented in this case study demonstrate the need to decompose evaluations of LM fit along domains. They show that it is not the case that models improve at uniform rates across domains for a given increase in scale. We leave it to further work to examine when these inequalities are or are not desirable and what interventions can help prevent stagnation of LM fit to certain domains.

总而言之，本案例研究中提出的结果表明需要根据领域分解 LM 拟合评估。他们表明，对于给定的规模增长，模型并不是以统一的速度跨领域改进的。我们将进一步研究这些不平等何时是可取的，何时是不可取的，以及哪些干预措施可以帮助防止适合某些领域的LM停滞。

D.2 Common Vocabulary Types Dominate Perplexity, Others Have Inverse Scaling

Previously in §4.2 we noted that few vocabulary types account for most of the loss measured in perplexity. Now we continue to explore the dynamics of average likelihood per vocabulary type, i.e., the strings that are represented in the vocabulary of a model (Appendix B).

之前在第 4.2 节中，我们注意到少数词汇类型占了困惑度测量损失的大部分。现在，我们继续探索每种词汇类型（即模型词汇中表示的字符串）的平均似然动态（附录 B）。

27

<!-- page 28 of 39 -->

C4

mC4

The Pile

WikiText-103

PTB

RedPajama

9 15 28

5 7 12 20

7 12 20 39

6 9 15

12 15 20 28 39

12 20 39

20 65 150

20 65 150

20 65 150

20 65 150

20 65 150

20 65 150

Falcon

Dolma V1.5

M2D2 S2ORC

M2D2 Wikipedia

C4 100 Domains

100 Subreddits

9 12 15 20 28

9 12 15 20

7 12 20

9 15 28

13 17 24 33

17 24 33 47

Macro Average Perplexity

20 65 150

20 65 150

20 65 150

20 65 150

20 65 150

20 65 150

100 PLs

ICE

Twitter AAE

Manosphere

Gab

4chan

3 4 5

7 9 12 15

12 15 20 28

15 20 28 39

24 33 47 71

161 208 274 365 494

20 65 150

20 65 150

20 65 150

20 65 150

20 65 150

20 65 150

Tokens Seen (billions)

Baselines

Pythia 160M Pythia 1B Pythia 7B

Figure 8: Perplexity macro averaged by domain in each source for checkpoints of 3 Pythia model sizes. Note that these public models are not trained on decontaminated data, so these results should be treated with greater skepticism than the results on the 6 baselines that we train under experimental controls. Consistently across these sources, increases in number of model parameters improves perplexity and the rate at which perplexity improves per token seen.

Some types are more surprising on average to larger models than smaller ones Is there variation between models in terms of how much types contribute to perplexity? Put differently, if model A has a lower aggregated perplexity than model B, can we conclude that it has a lower loss for all types? Conducting an exploratory analysis of Pythia-1B vs. Pythia-7B, we find that this is not the case: while Pythia-7B has a lower perplexity on all domains, there are always types that are better predicted by Pythia-1B (see Figure 10), with the average proportion of such types varying between 8.5% (C4-100-DOMAINS) and 32.1% (TWITTERAAE). As shown in Figure 11, the proportion of types on which Pythia-1B is better increases with ID, for all examined sources. In other words, while Pythia-7B is almost always better on high-frequency types, Pythia-1B is better on a substantial portion of low-frequency types. This pattern is not captured well by perplexity, which is influenced very little by the performance on such low-frequency types (see above). However, note that even in the high-frequency regime around 10% of types are better predicted by the smaller model. Many of those types also have a high frequency in the sources, indicating that our finding cannot be explained merely as a result of noisy measurements. For example, the pronoun I occurs 14703 times in ICE but its measured mean loss on the final checkpoint is lower for Pythia-1B than Pythia-7B.

平均而言，某些类型对于较大的模型而言比较小的模型更令人惊讶，模型之间在类型对困惑度的贡献程度方面是否存在差异？换句话说，如果模型 A 的聚合困惑度低于模型 B，我们是否可以得出结论，它对所有类型的损失都较低？对 Pythia-1B 与 Pythia-7B 进行探索性分析后，我们发现情况并非如此：虽然 Pythia-7B 在所有域上的复杂度较低，但总有一些类型可以被 Pythia-1B 更好地预测（见图 10），此类类型的平均比例在 8.5% (C4-100-DOMAINS) 和 32.1% (TWITTERAAE) 之间变化。如图 11 所示，对于所有检查的来源，Pythia-1B 更好的类型比例随着 ID 的增加而增加。换句话说，虽然 Pythia-7B 几乎总是在高频类型上表现更好，但 Pythia-1B 在大部分低频类型上表现更好。这种模式不能被困惑度很好地捕捉到，这种低频类型的性能对困惑度的影响很小（见上文）。然而，请注意，即使在高频状态下，较小的模型也能更好地预测大约 10% 的类型。其中许多类型在源中也具有很高的频率，这表明我们的发现不能仅仅用噪声测量的结果来解释。例如，代词 I 在 ICE 中出现了 14703 次，但 Pythia-1B 在最终检查点测得的平均损失低于 Pythia-7B。

Lower average loss per type can be the result of several different training dynamics. What does it mean specifically if Pythia-1B has a lower average loss on a specific type than Pythia-7B? Figure 12 shows, for each of the 16 sources, the training dynamics of an example type for which Pythia-1B is better than Pythia-7B after convergence. As can be seen, there are various patterns: sometimes there is a constant gap between the two models, with Pythia-1B being better from the very beginning (e.g., Boat in FALCON REFINEDWEB); sometimes Pythia-1B has a constant loss while

每种类型的平均损失较低可能是几种不同训练动态的结果。如果 Pythia-1B 在特定类型上的平均损失低于 Pythia-7B，这具体意味着什么？图 12 显示了 16 个源中每个源的示例类型的训练动态，其中 Pythia-1B 在收敛后优于 Pythia-7B。可以看出，有多种模式：有时两个模型之间存在恒定的差距，Pythia-1B 从一开始就更好（例如 FALCON REFINEDWEB 中的 Boat）；有时 Pythia-1B 会出现恒定的损失，而

28

<!-- page 29 of 39 -->

The Pile

RedPajama

Dolma V1.5

M2D2 S2ORC

M2D2 Wikipedia

0 0.10 0.20 0.30 0.40 0.50

0.05 0.15 0.25 0.35

0.08 0.12 0.18 0.23 0.28

0.03 0.08 0.12 0.18 0.23

0.10 0.14 0.18 0.22 0.26

0 6 12 18

0 2 4 6

0 2 4

0 42 84 126 168

0 13 26 39

C4 100 Domains

100 Subreddits

100 PLs

ICE

Twitter AAE

Log Loss Improvement per 10x Model Parameters

0 0.10 0.30 0.50

0.06 0.10 0.14 0.18 0.22

0.07 0.09 0.11 0.13 0.15 0.17

0.06 0.10 0.14 0.18

0.04 0.06 0.08 0.10 0.12

0 25 50 75 100

0 26 52 78

0 26 52 78

0 5 10 15

0 1

Domains Ordered by Improvement per Model

Baselines

From Pythia 1B to Pythia 7B From Pythia 160m to Pythia 1B

Figure 9: We estimate log loss improvement per 10× increase in non-embeddings parameters based on improvement from Pythia-160M to Pythia-1B and from Pythia-1B to Pythia-7B on their final checkpoints. We report this rate of improvement for each domain in ascending order per compared model pair. These increases in model size always improve performance on each domain, but the median difference in improvement from least to most sees twice as fast reduction of loss.

Figure 10: Proportion of types in each source for which Pythia-1B makes better predictions than Pythia-7B, as a function of training duration. The figure shows that for all examined sources, and even on the final checkpoint, a non-negligible proportion of vocabulary types is better predicted by the smaller model (i.e., Pythia-1B). This observation is particularly true for TWITTERAAE, where the proportion of such types is on average larger than 30%.

Pythia-7B is getting worse over time (e.g., schedule in DOLMA); sometimes Pythia-7B has a constant loss while Pythia-1B is getting better over time (e.g., exchanged in THE PILE); finally, sometimes Pythia-1B is decreasing its loss while Pythia-7B is increasing its loss over time (e.g., BR in C4). Especially the last pattern bears a resemblance with inverse scaling effects that characterize other aspects of LM behavior, where the performance gets worse rather than better with larger models [Mckenzie et al., 2023]. We are not aware of prior work describing the kind of type-level inverse scaling that we observe in this analysis.

Pythia-7B 随着时间的推移变得越来越糟（例如 DOLMA 中的时间表）；有时，Pythia-7B 会持续损失，而 Pythia-1B 随着时间的推移会变得更好（例如，在 THE PILE 中交换）；最后，有时随着时间的推移，Pythia-1B 的损失会减少，而 Pythia-7B 的损失会增加（例如，C4 中的 BR）。尤其是最后一种模式与表征 LM 行为其他方面的逆缩放效应相似，其中较大模型的性能变得更差而不是更好 [Mckenzie et al., 2023]。我们不知道之前的工作描述了我们在本次分析中观察到的类型级逆缩放。

Some domains have more inverse scaling types than others We also notice that there is further variation on the domains within the sources: for example, in TWITTERAAE (the source where the proportion of types on which Pythia-1B is better is largest), on the types where Pythia-1B is better, it

某些域比其他域具有更多的逆缩放类型 我们还注意到，源中的域存在进一步的变化：例如，在 TWITTERAAE（Pythia-1B 更好的类型比例最大的源）中，在 Pythia-1B 更好的类型上，它

29

<!-- page 30 of 39 -->

Figure 11: Proportion of types in each source for which Pythia-1B makes better predictions than Pythia-7B on the final checkpoint, as a function of type ID, i (low: i ≤1000; mid: 1000 < i ≤ 10000; high: i > 10000). The figure shows that the proportion of types for which the smaller model is better increases with type ID. Thus, while Pythia-7B is almost always better on high-frequency types (low ID), Pythia-1B is better on many low-frequency types (high ID).

Figure 12: Training dynamics of example types for which Pythia-1B is better than Pythia-7B on the final checkpoint. We specifically show the types that, within a specific source, (i) have a minimum count of 5 and (ii) have the largest mean loss difference between Pythia-1B and Pythia-7B on the final checkpoint. We observe that sometimes Pythia-1B is better from the very beginning (e.g., Boat in FALCON REFINEDWEB); sometimes Pythia-1B has a constant loss while Pythia-7B is getting worse over time (e.g., schedule in DOLMA); sometimes Pythia-7B has a constant loss while Pythia-1B is getting better over time (e.g., exchanged in THE PILE); finally, sometimes Pythia-1B is decreasing its loss while Pythia-7B is increasing its loss over time (e.g., BR in C4).

is better on the African American domain in 77.6% of cases, and on the White aligned domain in only 71.3% of cases. In other words, there are numerous vocabulary types where the larger model performs better on the White aligned domain (as expected), and where the inverse scaling behavior only manifests itself on the African American domain.

在 77.6% 的情况下，在非裔美国人领域表现更好，而在白人对齐领域，只有 71.3% 的情况表现更好。换句话说，在许多词汇类型中，较大的模型在白人对齐域上表现更好（如预期），而逆缩放行为仅在非裔美国人域上表现出来。

Taken together, these results provide further evidence that reporting only aggregated perplexity values neglects more subtle dynamics on lower levels (sources, domains, vocabulary types).

总而言之，这些结果提供了进一步的证据，表明仅报告聚合的困惑度值忽略了较低级别（来源、领域、词汇类型）上更微妙的动态。

E Evaluation Data Source Details（评测数据来源详情）

In Table 5 we summarize each data source. All sources are existing research datasets and thus we believe our of these datasets for an evaluation benchmark is consistent with their intended use. These sources are permissively licensed and thus we are able to rehost them. Also note that we make no attempt to remove personally identifiable information (PII) beyond any filtering applied by these original datasets. As we rehost only small subsamples of these datasets and the full datasets are also

在表 5 中，我们总结了每个数据源。所有来源都是现有的研究数据集，因此我们相信这些用于评估基准的数据集与其预期用途一致。这些来源已获得许可，因此我们能够重新托管它们。另请注意，除了这些原始数据集应用的任何过滤之外，我们不会尝试删除个人身份信息 (PII)。由于我们仅重新托管这些数据集的小子样本，并且完整数据集也被重新托管

30

<!-- page 31 of 39 -->

Purpose Source Reference Description

Standard contemporary LM pretraining corpus automatically filtered from the April 2019 Common Crawl scrape

C4 Raffel et al. [2019] via Dodge et al. [2021]

MC4-EN Chung et al. [2023] The English language portion of a pretraining corpus automatically filtered from 71 Common Crawl scrapes

MC4-EN 钟等人。 [2023] 从 71 个 Common Crawl scraps 中自动过滤出的预训练语料库的英语部分

WIKITEXT-103 Merity et al. [2016] A standard collection of verified “Good” and “Featured” articles on Wikipedia

WIKITEXT-103 Merity 等人。 [2016] 维基百科上经过验证的“好”和“精选”文章的标准集合

PENN TREEBANK Marcus et al. [1999] via Nunes [2020]

Classic Wall Street Journal benchmark with linguistic structure annotations omit- ted

Standard language modeling benchmarks

REDPAJAMA Together Computer [2023]

A publicly available reproduction of the LLaMA [Touvron et al., 2023] pretraining source mixture, combining large amounts of webscraped text with smaller curated sources

LLaMA [Touvron et al., 2023] 预训练源混合物的公开复制品，将大量网络抓取文本与较小的精选源相结合

FALCON REFINEDWEB Penedo et al. [2023] A corpus of English sampled from all Common Crawl scrapes until June 2023, more aggressively filtered and deduplicated than C4 and MC4-EN

FALCON REFINEDWEB Penedo 等人。 [2023] 从 2023 年 6 月之前的所有 Common Crawl 抓取中采样的英语语料库，比 C4 和 MC4-EN 更积极地进行过滤和去重

DOLMA Soldaini et al. [2024] A three trillion token corpus that samples sources commonly used to train LMs in order to enable open research on pretraining data

多尔玛·索尔代尼等人。 [2024] 一个三万亿代币语料库，对通常用于训练 LM 的来源进行采样，以便能够对预训练数据进行开放研究

M2D2 S2ORC Reid et al. [2022] Papers from Semantic Scholar grouped by hierarchical academic field categories

M2D2 S2ORC 里德等人。 [2022] 来自语义学者的论文按层次学术领域类别分组

M2D2 WIKIPEDIA Reid et al. [2022] Wikipedia articles grouped by hierarchical categories in the Wikipedia ontology

M2D2 维基百科 Reid 等人。 [2022] 维基百科文章按维基百科本体中的层次类别分组

Balanced samples of the top 100 URL domains in C4 as measured by page count

C4 中前 100 个 URL 域的平衡样本（按页数衡量）

C4-100-DOMAINS Chronopoulou et al. [2022]

Fine-grained domain benchmarks

DOLMA-100- SUBREDDITS

Soldaini et al. [2024] Balanced samples of the top 100 subreddits by number of posts, sourced from the DOLMA Reddit subset

索尔代尼等人。 [2024] 按帖子数量排名前 100 个 Reddit 子集的平衡样本，源自 DOLMA Reddit 子集

Balanced samples of the top 100 programming languages by number of tokens, sourced from the DOLMA Stack subset

按令牌数量排名前 100 种编程语言的平衡样本，源自 DOLMA Stack 子集

DOLMA-100- PROGRAMMING- LANGUAGES

Kocetkov et al. [2022] via Soldaini et al. [2024]

Balanced sets of tweets classified as African American or White aligned English

Communities disparities

TWITTERAAE Blodgett et al. [2016] via Liang et al. [2022]

MANOSPHERE CORPUS Ribeiro et al. [2021] 9 forums where a set of related masculinist ideologies developed over the 2000s and 2010s

MANOSPHERE CORPUS Ribeiro 等人。 [2021] 9 个论坛，在 2000 年代和 2010 年代发展了一套相关的男权主义意识形态

GAB CORPUS Zannettou et al. [2018]

Data from 2016-2018 from an alt-right, free-speech-oriented social media plat- form shown to contain more hate speech than mainstream platforms

2016 年至 2018 年来自另类右翼、言论自由的社交媒体平台的数据显示，该平台包含的仇恨言论比主流平台更多

Fringe sources previously studied for problematic discourse

4CHAN CORPUS Papasavva et al. [2020]

Data from 2016-2019 from a politics subforum of an anonymity-focused forum found to contain among the highest rates of toxic content

一个匿名论坛的政治子论坛 2016 年至 2019 年的数据被发现含有最高比例的有毒内容

Table 5: Descriptions of the 16 data sources sampled to create language modeling evaluations in

PALOMA. These are grouped by their purposes for inclusion (§2).

publicly available, any malicious use of these datasets would simply bypass any additional filtering we could do by using the original datasets. Also our subsampling is random and thus does not make it easier for malicious use to aggregate PII.

由于这些数据集是公开的，任何恶意使用这些数据集都会简单地绕过我们可以通过使用原始数据集进行的任何附加过滤。此外，我们的二次采样是随机的，因此不会使恶意使用聚合 PII 变得更容易。

In the rest of this section we provide details of our use of each source and list all domains if any in each source.

在本节的其余部分中，我们提供每个源的使用详细信息，并列出每个源中的所有域（如果有）。

C4 Initially the pretraining corpus used by Raffel et al. [2019] and later released in Dodge et al. [2021], C4 has become one of the most commonly used pretraining corpora and is often included in more recently curated corpora. It uses a single April 2019 Common Crawl scrape to source webtext. This is filtered to remove text that is not classified as English as well as heuristics to remove text that is not natural language and a blocklist of profane keywords. We sample from the validation split of this "cleaned" corpus to measure model fit to webtext from a single temporal slice of scraping with baseline preprocessing. This source has no marked domains.

C4 最初是 Raffel 等人使用的预训练语料库。 [2019] 并随后在 Dodge 等人中发布。 [2021]，C4 已成为最常用的预训练语料库之一，并且经常包含在最近策划的语料库中。它使用 2019 年 4 月的一次 Common Crawl 抓取来获取网络文本。经过过滤以删除未分类为英语的文本，并通过启发式删除非自然语言的文本和亵渎关键字的阻止列表。我们从这个“清理过的”语料库的验证分割中进行采样，以通过基线预处理的单个抓取时间切片来测量模型与网络文本的拟合程度。该来源没有标记域。

MC4-EN Chung et al. [2023] release a dataset with same the methods used in C4 but scale up to all Common Crawl scrapes up to August 2022 and include 107 classified languages. As the scope of the present work is the evaluation of English language models we sample only from the validation split of the English portion of the data. This allow us to measure the fit of models to scraped webtext with heterogeneous temporality. This source has no marked domains.

MC4-EN 钟等人。 [2023] 发布了一个数据集，其方法与 C4 中使用的方法相同，但扩展到 2022 年 8 月之前的所有 Common Crawl 抓取，并包含 107 种分类语言。由于当前工作的范围是英语语言模型的评估，我们仅从数据的英语部分的验证部分中进行采样。这使我们能够衡量模型与异构时间性抓取的网络文本的拟合度。该来源没有标记域。

WIKITEXT-103 and PENN TREEBANK We include these two benchmarks as they have seen the most consistent evaluation on large LMs. WIKITEXT-103 [Merity et al., 2016] consists Wikipedia

WIKITEXT-103 和 PENN TREEBANK 我们将这两个基准纳入其中，因为它们在大型 LM 上得到了最一致的评估。 WIKITEXT-103 [Merity 等人，2016] 由维基百科组成

31

<!-- page 32 of 39 -->

articles marked “Good” and “Featured” and was used in the evaluation of GPT-2 [Radford et al., 2019], Gopher [Rae et al., 2021], and Chinchilla [Hoffmann et al., 2022]. PENN TREEBANK [Marcus et al., 1999] consists of 1989 Wall Street Journal articles originally annotated for linguistic structure. GPT-2 [Radford et al., 2019] and GPT-3 [Brown et al., 2020] omit these annotations and evaluate perplexity on the underlying text. We sample the same version of the benchmark, which is hosted by Nunes [2020]. As was standard practice at the time the benchmark is pretokenized and uncommon words are replaced with a special unknown token; we opt not to detokenize this data as we find contemporary LMs are often able to achieve comparable performance to the GPT-3 SOTA without this. These two sources have no marked domains.

标记为“Good”和“Featured”的文章被用于评估 GPT-2 [Radford et al., 2019]、Gopher [Rae et al., 2021] 和 Chinchilla [Hoffmann et al., 2022]。 PENN TREEBANK [Marcus et al., 1999] 由 1989 年《华尔街日报》的文章组成，最初是针对语言结构进行注释的。 GPT-2 [Radford et al., 2019] 和 GPT-3 [Brown et al., 2020] 省略了这些注释并评估了底层文本的困惑度。我们对由 Nunes [2020] 托管的同一版本的基准测试进行了采样。按照当时的标准做法，基准被预标记，不常见的单词被替换为特殊的未知标记；我们选择不对这些数据进行去代币化，因为我们发现当代的 LM 通常能够在不进行去代币化的情况下实现与 GPT-3 SOTA 相当的性能。这两个来源没有标记域。

REDPAJAMA Together Computer [2023] reproduce a pretraining corpus following the data mixture of LLaMA [Touvron et al., 2023], which combines curated sources and webscraped text similarly to THE PILE but with a much greater portion of scraped data as has become customary in recent pretraining corpora. This dataset is used to train RedPajama-INCITE [Together Computer, 2023], one of the few models with both checkpoints and data publicly available. We sample their 7 domains (see Table 6).

REDPAJAMA Together Computer [2023] 按照 LLaMA [Touvron et al., 2023] 的数据混合重现预训练语料库，它结合了精选源和网络抓取文本，与 THE PILE 类似，但包含更大比例的抓取数据，这在最近的预训练语料库中已成为惯例。该数据集用于训练 RedPajama-INCITE [Together Computer，2023]，它是少数具有检查点和公开数据的模型之一。我们对他们的 7 个域进行了抽样（参见表 6）。

arxiv, books, c4, commoncrawl, github, stackexchange, wikipedia

Table 6: Domains in REDPAJAMA

FALCON REFINEDWEB Included in the training of the Falcon models [Almazrouei et al., 2023], Penedo et al. [2023] collect a corpus of English sampled from all Common Crawl scrapes until June 2023. While we include other Common Crawl based corpora, this one has a higher duplication removal rate than previous corpora. They also claim to have more neutral filters that rely on simple interpretable heuristics and only blocklist adult content by URLs. We sample this to examine how differences in filtering scraped data influence perplexity evaluations. This source has no marked domains.

FALCON REFINEDWEB 包含在 Falcon 模型的训练中 [Almazrouei 等人，2023]，Penedo 等人。 [2023] 收集截至 2023 年 6 月从所有 Common Crawl 抓取中采样的英语语料库。虽然我们包括其他基于 Common Crawl 的语料库，但该语料库的重复去除率比之前的语料库更高。他们还声称拥有更中立的过滤器，这些过滤器依赖于简单的可解释启发式方法，并且仅通过 URL 来阻止成人内容。我们对此进行采样，以检查过滤抓取数据的差异如何影响困惑度评估。该来源没有标记域。

DOLMA Soldaini et al. [2024] curate a corpus from Common Crawl, Wikipedia, books, academic papers, code repositories, and Reddit—domains similar to those used to train most contemporary LLMs. They release the code used to collect and process this data which in combination with the corpus serve as a set of scientific artifacts to support broader participation in research on pretraining data. We sample from held out splits of each of these domains (see Table 7) to provide corresponding evaluations for these artifacts.

多尔玛·索尔代尼等人。 [2024] 从 Common Crawl、维基百科、书籍、学术论文、代码存储库和 Reddit 中整理一个语料库，这些领域类似于用于培训大多数当代法学硕士的领域。他们发布了用于收集和处理这些数据的代码，这些代码与语料库结合起来作为一组科学工件，以支持更广泛地参与预训练数据的研究。我们从每个域的保留分割中进行采样（参见表 7），以便为这些工件提供相应的评估。

books, common-crawl, pes2o, reddit_uniform, stack_uniform, wiki

Table 7: Domains in DOLMA

M2D2 S2ORC Reid et al. [2022] collect academic papers from S2ORC [Lo et al., 2020] and organize them into a two level hierarchy by academic field categories. Top-level domains, such as Computer Science, are already provided in S2ORC using top-level disciplines from the Microsoft Academic Graph [Shen et al., 2018], while subdomains are identified by a paper’s arXiv category, such as the subdomain Computation and Language within Computer Science. As academic papers are a common source for pretraining and a domain for downstream use, we sample from this corpus to measure fine-grained fit to different academic disciplines. We sample both their top-level domains and lower-level subdomains, as our definition of domain accepts that domains may overlap. Also note that while the M2D2 paper only reports 106 domains and subdomains of S2ORC data, we find that there are actually 167 domains and subdomains (see Table 8) marked in their final corpus. Unfortunately the original collection concatenates together all papers, making it impossible to recover document boundaries. We resort instead to sampling a given number of tokens from the beginning of the concatenated sequences as one long pseudo-document, relying on the random shuffling of the original data before concatenation.

M2D2 S2ORC 里德等人。 [2022] 从 S2ORC [Lo et al., 2020] 收集学术论文，并按学术领域类别将它们组织成两级层次结构。 S2ORC 中已经使用 Microsoft 学术图 [Shen 等人，2018] 中的顶级学科提供了顶级域，例如计算机科学，而子域则由论文的 arXiv 类别标识，例如计算机科学中的子域计算和语言。由于学术论文是预训练的常见来源和下游使用的领域，因此我们从该语料库中进行采样，以衡量与不同学科的细粒度契合度。我们对它们的顶级域和较低级子域进行采样，因为我们对域的定义接受域可能重叠。另请注意，虽然 M2D2 论文仅报告了 S2ORC 数据的 106 个域和子域，但我们发现最终语料库中实际上标记了 167 个域和子域（参见表 8）。不幸的是，原始集合将所有论文连接在一起，使得无法恢复文档边界。相反，我们依靠连接前原始数据的随机洗牌，从连接序列的开头采样给定数量的标记作为一个长伪文档。

32

<!-- page 33 of 39 -->

Art, Philosophy, astro-ph, astro-ph.CO, astro-ph.EP, astro-ph.GA, astro-ph.HE, astro-ph.IM, astro-ph.SR, astro-ph_l1, atom-ph, chem-ph, cond-mat, cond-mat.dis-nn, cond-mat.mes-hall, cond-mat.mtrl-sci, cond-mat.other, cond-mat.quant-gas, cond-mat.soft, cond-mat.stat-mech, cond-mat.str-el, cond- mat.supr-con, cond-mat_l1, cs.AI, cs.AR, cs.CC, cs.CE, cs.CG, cs.CL, cs.CR, cs.CV, cs.CY, cs.DB, cs.DC, cs.DL, cs.DM, cs.DS, cs.ET, cs.FL, cs.GL, cs.GR, cs.GT, cs.HC, cs.IR, cs.LG, cs.LO, cs.MA, cs.MM, cs.MS, cs.NA, cs.NE, cs.NI, cs.OH, cs.OS, cs.PF, cs.PL, cs.RO, cs.SC, cs.SD, cs.SE, cs.SI, cs.SY, cs_l1, econ.EM, econ.TH, econ_l1, eess.AS, eess.IV, eess.SP, eess_l1, gr-qc, hep-ex, hep-lat, hep-ph, hep-th, math.AC, math.AG, math.AP, math.AT, math.CA, math.CO, math.CT, math.CV, math.DG, math.DS, math.FA, math.GM, math.GN, math.GR, math.GT, math.HO, math.KT, math.LO, math.MG, math.NA, math.NT, math.OA, math.OC, math.PR, math.QA, math.RA, math.RT, math.SG, math.SP, math_l1, nlin.AO, nlin.CD, nlin.CG, nlin.PS, nlin.SI, nlin_l1, nucl-ex, nucl-th, physics.acc-ph, physics.ao-ph, physics.app-ph, physics.atm-clus, physics.atom-ph, physics.bio-ph, physics.chem-ph, physics.class- ph, physics.comp-ph, physics.data-an, physics.ed-ph, physics.flu-dyn, physics.gen-ph, physics.geo-ph, physics.hist-ph, physics.ins-det, physics.med-ph, physics.optics, physics.plasm-ph, physics.pop-ph, physics.soc-ph, physics.space-ph, physics_l1, plasm-ph, q-bio, q-bio.BM, q-bio.CB, q-bio.GN, q-bio.MN, q-bio.NC, q-bio.OT, q-bio.PE, q-bio.QM, q-bio.SC, q-bio.TO, q-bio_l1, q-fin.CP, q-fin.EC, q-fin.GN, q-fin.MF, q-fin.PM, q-fin.PR, q-fin.RM, q-fin.ST, q-fin.TR, q-fin_l1, quant-ph, stat.AP, stat.CO, stat.ME, stat.ML, stat.OT, stat_l1, supr-con

艺术、哲学、astro-ph、astro-ph.CO、astro-ph.EP、astro-ph.GA、astro-ph.HE、astro-ph.IM、astro-ph.SR、astro-ph_l1、atom-ph、chem-ph、cond-mat、cond-mat.dis-nn、cond-mat.mes-hall、cond-mat.mtrl-sci、cond-mat.other、 cond-mat.quant-gas、cond-mat.soft、cond-mat.stat-mech、cond-mat.str-el、cond-mat.supr-con、cond-mat_l1、cs.AI、cs.AR、cs.CC、cs.CE、cs.CG、cs.CL、cs.CR、cs.CV、cs.CY、cs.DB、cs.DC、cs.DL、 cs.DM、cs.DS、cs.ET、cs.FL、cs.GL、cs.GR、cs.GT、cs.HC、cs.IR、cs.LG、cs.LO、cs.MA、cs.MM、cs.MS、cs.NA、cs.NE、cs.NI、cs.OH、cs.OS、cs.PF、cs.PL、cs.RO、cs.SC、 cs.SD、cs.SE、cs.SI、cs.SY、cs_l1、econ.EM、econ.TH、econ_l1、eess.AS、eess.IV、eess.SP、eess_l1、gr-qc、hep-ex、hep-lat、hep-ph、hep-th、math.AC、math.AG、math.AP、math.AT、math.CA、math.CO、 math.CT, math.CV, math.DG, math.DS, math.FA, math.GM, math.GN, math.GR, math.GT, math.HO, math.KT, math.LO, math.MG, math.NA, math.NT, math.OA, math.OC, math.PR, math.QA, math.RA, math.RT, math.SG, math.SP, math_l1, nlin.AO, nlin.CD, nlin.CG, nlin.PS、nlin.SI、nlin_l1、nucl-ex、nucl-th、物理.acc-ph、物理.ao-ph、物理.app-ph、物理.atm-clus、物理.atom-ph、物理.bio-ph、物理.chem-ph、物理.class-ph、物理.comp-ph、物理.data-an、物理.ed-ph、物理.flu-dyn、物理.gen-ph、物理.geo-ph、物理.hist-ph，物理.ins-det，物理.med-ph，物理.光学，物理.plasm-ph，物理.pop-ph，物理.soc-ph，物理.space-ph，物理_l1，等离子体-ph，q-bio，q-bio.BM，q-bio.CB，q-bio.GN，q-bio.MN，q-bio.NC，q-bio.OT，q-bio.PE，q-bio.QM， q-bio.SC、q-bio.TO、q-bio_l1、q-fin.CP、q-fin.EC、q-fin.GN、q-fin.MF、q-fin.PM、q-fin.PR、q-fin.RM、q-fin.ST、q-fin.TR、q-fin_l1、Quant-ph、stat.AP、stat.CO、stat.ME、stat.ML、stat.OT、stat_l1、超控

Table 8: Domains in M2D2 S2ORC

M2D2 WIKIPEDIA Reid et al. [2022] also collect Wikipedia articles and organize them by the top two levels of hierarchy from the Wikipedia ontology. We sample from this source, as the Wikipedia ontology provides some of the largest scale human categorization of domains of text available on a data source almost always included in pretraining corpora. This time we find that their corpus contains just 49 marked domains or subdomains (see Table 9), rather than the 60 mentioned in the paper. Again the original collection concatenates articles together, so we sample a given number of tokens from the beginning of this concatenated sequence.

M2D2 维基百科 Reid 等人。 [2022]还收集维基百科文章，并按照维基百科本体的前两层层次结构来组织它们。我们从这个来源进行采样，因为维基百科本体提供了一些最大规模的人类对数据源上可用的文本域的分类，几乎总是包含在预训练语料库中。这次我们发现他们的语料库只包含 49 个标记的域或子域（见表 9），而不是论文中提到的 60 个。原始集合再次将文章连接在一起，因此我们从该连接序列的开头对给定数量的标记进行采样。

Culture_and_the_arts, Culture_and_the_arts__Culture_and_Humanities, Culture_and_the_arts__Games_and_Toys, Culture_and_the_arts__Mass_media, Culture_and_the_arts__Performing_arts, Culture_and_the_arts__Sports_and_Recreation, Culture_and_the_arts__The_arts_and_Entertainment, Cul- ture_and_the_arts__Visual_arts, General_referece, General_referece__Further_research_tools_and_topics, General_referece__Reference_works, Health_and_fitness, Health_and_fitness__Exercise, Health_and_fitness__Health_science, Health_and_fitness__Human_medicine, Health_and_fitness__Nutrition, Health_and_fitness__Public_health, Health_and_fitness__Self_care, History_and_events, His- tory_and_events__By_continent, History_and_events__By_period, History_and_events__By_region, Human_activites, Human_activites__Human_activities, Human_activites__Impact_of_human_activity, Mathematics_and_logic, Mathematics_and_logic__Fields_of_mathematics, Mathemat- ics_and_logic__Logic, Mathematics_and_logic__Mathematics, Natural_and_physical_sciences, Natural_and_physical_sciences__Biology, Nat- ural_and_physical_sciences__Earth_sciences, Natural_and_physical_sciences__Nature, Natural_and_physical_sciences__Physical_sciences, Philosophy_and_thinking, Philosophy_and_thinking__Philosophy, Philosophy_and_thinking__Thinking, Religion_and_belief_systems, Reli- gion_and_belief_systems__Allah, Religion_and_belief_systems__Belief_systems, Religion_and_belief_systems__Major_beliefs_of_the_world, Society_and_social_sciences, Society_and_social_sciences__Social_sciences, Society_and_social_sciences__Society, Technology_and_applied_sciences, Technology_and_applied_sciences__Agriculture, Technology_and_applied_sciences__Computing, Technology_and_applied_sciences__Engineering, Technology_and_applied_sciences__Transport

文化与艺术、文化与艺术__文化与人文、文化与艺术__游戏与玩具、文化与艺术__大众媒体、文化与艺术__表演艺术、文化与艺术__体育与娱乐、文化与艺术__艺术与娱乐、文化ture_and_the_arts__Visual_arts、General_referece、General_referece__Further_research_tools_and_topics、General_referece__Reference_works、Health_and_fitness、Health_and_fitness__运动、Health_and_fitness__Health_science、Health_and_fitness__Human_medicine、Health_and_fitness__Nutrition、健康与健身__公共健康、健康与健身__自我护理、历史与事件、历史与事件__按大陆、历史与事件__按时期、历史与事件__按地区、人类活动、人类活动__人类活动、人类活动__人类活动的影响、数学与逻辑、数学和逻辑__数学领域、数学和逻辑__逻辑、数学和逻辑__数学、自然和物理科学、自然和物理科学__生物学、自然和物理科学__地球科学、自然和物理科学__自然、自然和物理科学__物理科学、哲学和思考、哲学和思考__哲学、哲学和思考__思考、宗教和信仰系统、宗教和信仰系统__真主、宗教和信仰系统__信仰系统、宗教和信仰系统__世界主要信仰、社会和社会科学、社会和社会科学__社会科学、社会和社会科学__社会、技术和应用科学、技术和应用科学__农业、技术和应用科学__计算、技术和应用科学__工程、技术和应用科学__交通

Table 9: Domains in M2D2 WIKIPEDIA

C4-100-DOMAINS Chronopoulou et al. [2022] collect C4-100-DOMAINS comprising all the text from 100 internet domains with the most pages in C4. We sample from each of the 100 domains (see Table 10) to explore the relationship between how well represented and how surprising a domain is. The original collection removes documents smaller than 200 whitespace separated tokens, leading the domain with the 3rd most pages (do5.b00kmedia.ru) to be completely empty. Only three other domains have less data than the 100 thousand tokens per split that we aim for.

C4-100-域 Chronopoulou 等人。 [2022]收集C4-100-DOMAINS，其中包含来自C4中页面最多的100个互联网域的所有文本。我们从 100 个领域中的每一个领域进行抽样（参见表 10），以探索领域的代表性程度与令人惊讶程度之间的关系。原始集合删除了小于 200 个空格分隔标记的文档，导致页面第三多的域 (do5.b00kmedia.ru) 完全为空。只有其他三个域的数据少于我们目标的每次拆分 10 万个令牌的数据。

100_www.ign.com, 10_www.eventbrite.com, 11_link.springer.com, 12_www.chicagotribune.com, 13_www.foxnews.com, 14_www.aljazeera.com, 15_www.dailymail.co.uk, 16_www.ncbi.nlm.nih.gov, 17_www.express.co.uk, 18_en.m.wikipedia.org, 19_www.cnet.com, 1_www.nytimes.com, 20_www.telegraph.co.uk, 21_www.theatlantic.com, 22_forums.macrumors.com, 23_www.oreilly.com, 24_www.washingtonpost.com, 25_www.zdnet.com, 26_www.foxbusiness.com, 27_www.reuters.com, 28_www.ibtimes.co.uk, 29_www.rt.com, 2_en.wikipedia.org, 30_www.prweb.com, 31_www.deviantart.com, 32_www.si.com, 33_www.bbc.com, 34_github.com, 35_nypost.com, 36_itunes.apple.com, 37_www.instructables.com, 38_www.youtube.com, 39_www.booking.com, 40_www.etsy.com, 41_www.marketwired.com, 42_sites.google.com, 43_www.baltimoresun.com, 44_www.agreatertown.com, 45_www.npr.org, 46_www.fool.com, 47_www.tripadvisor.com, 48_www.bbc.co.uk, 49_lists.w3.org, 4_www.latimes.com, 50_mashable.com, 51_disneyparksmomspanel.disney.go.com, 52_www.cnbc.com, 53_answers.sap.com, 54_home- stars.com, 55_www.hindustantimes.com, 56_www.reference.com, 57_www.city-data.com, 58_medium.com, 59_app-wiringdiagram.herokuapp.com, 5_www.theguardian.com, 60_www.csmonitor.com, 61_www.adweek.com, 62_docs.microsoft.com, 63_www.yahoo.com, 64_www.thesun.co.uk, 65_www.nydailynews.com, 66_www.dailystar.co.uk, 67_fineartamerica.com, 68_www.kickstarter.com, 69_uk.reuters.com, 6_www.huffpost.com, 70_www.insiderpages.com, 71_www.inquisitr.com, 72_lists.debian.org, 73_www.straitstimes.com, 74_www.cbsnews.com, 75_simple.wikipedia.org, 76_deadline.com, 77_www.androidheadlines.com, 78_www.wired.com, 79_www.bustle.com, 7_patents.google.com, 80_premium.wpmudev.org, 81_www.librarything.com, 82_mail-archives.apache.org, 83_scholars.duke.edu, 84_www.glassdoor.com, 85_www.pcworld.com, 86_www.shutterstock.com, 87_myemail.constantcontact.com, 88_www.eventbrite.co.uk, 89_www.fastcompany.com, 8_www.businessinsider.com, 90_www.firstpost.com, 91_www.entrepreneur.com, 92_www.breitbart.com, 93_techcrunch.com, 94_www.nme.com, 95_www.ndtv.com, 96_finance.yahoo.com, 97_archives.lib.state.ma.us, 98_www.gsmarena.com, 99_www.lonelyplanet.com, 9_www.forbes.com Table 10: Domains in C4-100-DOMAINS

100_www.ign.com、10_www.eventbrite.com、11_link.springer.com、12_www.chicagotribune.com、13_www.foxnews.com、14_www.aljazeera.com、15_www.dailymail.co.uk、16_www.ncbi.nlm.nih.gov、17_www.express.co.uk、 18_en.m.wikipedia.org、19_www.cnet.com、1_www.nytimes.com、20_www.telegraph.co.uk、21_www.theatlantic.com、22_forums.macrumors.com、23_www.oreilly.com、24_www.washingtonpost.com、25_www.zdnet.com、 26_www.foxbusiness.com、27_www.reuters.com、28_www.ibtimes.co.uk、29_www.rt.com、2_en.wikipedia.org、30_www.prweb.com、31_www.deviantart.com、32_www.si.com、33_www.bbc.com、34_github.com、 35_nypost.com、36_itunes.apple.com、37_www.instructables.com、38_www.youtube.com、39_www.booking.com、40_www.etsy.com、41_www.marketwired.com、42_sites.google.com、43_www.baltimoresun.com、44_www.agreatertown.com、 45_www.npr.org、46_www.fool.com、47_www.tripadvisor.com、48_www.bbc.co.uk、49_lists.w3.org、4_www.latimes.com、50_mashable.com、51_disneyparksmomspanel.disney.go.com、52_www.cnbc.com、 53_answers.sap.com、54_home-stars.com、55_www.hindustantimes.com、56_www.reference.com、57_www.city-data.com、58_medium.com、59_app-wiringdiagram.herokuapp.com、5_www.theguardian.com、60_www.csmonitor.com、 61_www.adweek.com、62_docs.microsoft.com、63_www.yahoo.com、64_www.thesun.co.uk、65_www.nydailynews.com、66_www.dailystar.co.uk、67_fineartamerica.com、68_www.kickstarter.com、69_uk.reuters.com、 6_www.huffpost.com、70_www.insiderpages.com、71_www.inquisitr.com、72_lists.debian.org、73_www.straitstimes.com、74_www.cbsnews.com、75_simple.wikipedia.org、76_deadline.com、77_www.androidheadlines.com、 78_www.wired.com、79_www.bustle.com、7_patents.google.com、80_premium.wpmudev.org、81_www.librarything.com、82_mail-archives.apache.org、83_scholars.duke.edu、84_www.glassdoor.com、85_www.pcworld.com、 86_www.shutterstock.com、87_myemail.constantcontact.com、88_www.eventbrite.co.uk、89_www.fastcompany.com、8_www.businessinsider.com、90_www.firstpost.com、91_www.entrepreneur.com、92_www.breitbart.com、93_techcrunch.com、 94_www.nme.com、95_www.ndtv.com、96_finance.yahoo.com、97_archives.lib.state.ma.us、98_www.gsmarena.com、99_www.lonelyplanet.com、9_www.forbes.com 表 10：C4-100-DOMAINS 中的域

DOLMA-100-SUBREDDITS Using the Reddit data collected in DOLMA [Soldaini et al., 2024], we organize a new corpus of the top 100 subreddits (community forums within the messageboard) ranked by number of posts in the DOLMA data (see Table 11). In DOLMA Reddit posts are each separate

DOLMA-100-SUBREDDITS 使用 DOLMA [Soldaini 等人，2024] 中收集的 Reddit 数据，我们组织了一个新的语料库，其中包含按 DOLMA 数据中的帖子数量排名的前 100 个 subreddits（留言板中的社区论坛）（参见表 11）。在 DOLMA Reddit 中，每个帖子都是独立的

33

<!-- page 34 of 39 -->

documents, without any linearization of conversational threads. Though this prevents the assessment of model fit to dialogue, it still allows evaluation across these many domains of social media text. The DOLMA Reddit data also filters out comments shorter than 500 characters and submissions (i.e., original posts) shorter than 400 characters. We sample these subreddits to capture domains as they are self-organized and self-identified by online communities.

文档，没有对话线程的任何线性化。尽管这阻碍了对模型适合对话的评估，但它仍然允许对社交媒体文本的许多领域进行评估。 DOLMA Reddit 数据还过滤掉短于 500 个字符的评论和短于 400 个字符的提交内容（即原始帖子）。我们对这些 subreddit 进行采样以捕获域，因为它们是由在线社区自组织和自我识别的。

00_AskReddit, 01_politics, 02_AmItheAsshole, 03_worldnews, 04_relationships, 05_relationship_advice, 06_news, 07_leagueoflegends, 08_todayilearned, 09_TwoXChromosomes, 10_personalfinance, 11_changemyview, 12_unpopularopinion, 13_movies, 14_Games, 15_nba, 16_pics, 17_gaming, 18_soccer, 19_nfl, 20_explainlikeimfive, 21_conspiracy, 22_atheism, 23_AskMen, 24_videos, 25_sex, 26_raisedbynarcissists, 27_NoStupidQuestions, 28_Des- tinyTheGame, 29_anime, 30_DnD, 31_ukpolitics, 32_funny, 33_europe, 34_canada, 35_Christianity, 36_SquaredCircle, 37_AskWomen, 38_legaladvice, 39_JUSTNOMIL, 40_technology, 41_IAmA, 42_wow, 43_Parenting, 44_exmormon, 45_AdviceAnimals, 46_childfree, 47_unitedkingdom, 48_ffxiv, 49_dndnext, 50_ADHD, 51_loseit, 52_asoiaf, 53_BabyBumps, 54_Advice, 55_australia, 56_CFB, 57_offmychest, 58_PublicFreakout, 59_TrueOffMyChest, 60_science, 61_magicTCG, 62_asktransgender, 63_DotA2, 64_neoliberal, 65_whowouldwin, 66_depression, 67_WTF, 68_pathofexile, 69_PoliticalDis- cussion, 70_Libertarian, 71_PurplePillDebate, 72_Fitness, 73_books, 74_dogs, 75_pcmasterrace, 76_teenagers, 77_stopdrinking, 78_Overwatch, 79_tele- vision, 80_buildapc, 81_askscience, 82_programming, 83_Guildwars2, 84_cars, 85_formula1, 86_sysadmin, 87_hockey, 88_india, 89_SubredditDrama, 90_DMAcademy, 91_dating_advice, 92_Catholicism, 93_Drugs, 94_trees, 95_boardgames, 96_Conservative, 97_Futurology, 98_beyondthebump, 99_wed- dingplanning

00_AskReddit、01_politics、02_AmItheAsshole、03_worldnews、04_relationships、05_relationship_advice、06_news、07_leagueoflegends、08_todayilearned、09_TwoXChromosomes、10_personalfinance、11_changemyview、 12_unpopularopinion、13_movies、14_Games、15_nba、16_pics、17_gaming、18_soccer、19_nfl、20_explainlikeim Five、21_conspiracy、22_无神论、23_AskMen、24_videos、25_sex、 26_raisedbynarcissists、27_NoStupidQuestions、28_Des-tinyTheGame、29_anime、30_DnD、31_ukpolitics、32_funny、33_europe、34_canada、35_Christianity、36_SquaredCircle、37_AskWomen、38_legaladvice、 39_JUSTNOMIL、40_technology、41_IAmA、42_wow、43_育儿、44_exmormon、45_AdviceAnimals、46_childfree、47_unitedkingdom、48_ffxiv、49_dndnext、50_ADHD、51_loseit、52_asoiaf、 53_BabyBumps、54_Advice、55_澳大利亚、56_CFB、57_offmychest、58_PublicFreakout、59_TrueOffMyChest、60_science、61_magicTCG、62_asktransgender、63_DotA2、64_neoliberal、65_whowouldwin、 66_抑郁、67_WTF、68_pathofexile、69_政治讨论、70_自由主义者、71_PurplePillDebate、72_Fitness、73_books、74_dogs、75_pcmasterrace、76_teenagers、77_stopdrinking、78_Overwatch、79_tele-愿景、80_buildapc、81_askscience、82_programming、83_Guildwars2、84_cars、85_formula1、86_sysadmin、87_hockey、88_india、89_SubredditDrama、90_DMAcademy、91_dating_advice、92_Catholicism、 93_毒品、94_树木、95_棋盘游戏、96_保守、97_未来学、98_超越颠簸、99_婚礼策划

Table 11: Domains in DOLMA-100-SUBREDDITS

DOLMA-100-PROGRAMMING-LANGUAGES Using code repository data from THE STACK [Ko- cetkov et al., 2022] as it is contained in DOLMA [Soldaini et al., 2024], we collect a new corpus of balanced samples of the top one hundred programming languages by number of tokens (see Table 12). DOLMA uses an already near-deduplicated version of THE STACK, filters data related extensions (e.g., JSON and CSV) and repetitive preambles, and applies quality heuristics (e.g., removing repos with few stars). While code data differs greatly from natural language, complicating the interpretation of perplexity analysis, we nevertheless wish to add evaluations to cover this common data source for LLMs.

DOLMA-100-编程语言 使用来自 DOLMA [Soldaini 等人，2024] 中包含的代码库数据 [Kocetkov 等人，2022]，我们收集了一个新的语料库，其中包含按标记数量排名前 100 的编程语言的平衡样本（参见表 12）。 DOLMA 使用已经接近重复数据删除的 THE STACK 版本，过滤与数据相关的扩展（例如 JSON 和 CSV）和重复的前导码，并应用质量启发法（例如，删除星号较少的存储库）。虽然代码数据与自然语言有很大不同，使复杂性分析的解释变得复杂，但我们仍然希望添加评估以涵盖法学硕士的这一常见数据源。

00_text, 01_markdown, 02_c, 03_php, 04_java, 05_c++, 06_python, 07_javascript, 08_html, 09_c#, 10_yaml, 11_go, 12_typescript, 13_xml, 14_css, 15_jupyter-notebook, 16_rust, 17_unity3d-asset, 18_gettext-catalog, 19_ruby, 20_vue, 21_sql, 22_swift, 23_kotlin, 24_scala, 25_scss, 26_tex, 27_dart, 28_kicad, 29_shell, 30_smali, 31_lua, 32_restructuredtext, 33_perl, 34_diff, 35_ini, 36_jsx, 37_haskell, 38_gnuplot, 39_postscript, 40_groff, 41_turtle, 42_fortran, 43_makefile, 44_mathematica, 45_pascal, 46_common-lisp, 47_gas, 48_vhdl, 49_julia, 50_edn, 51_visual-basic, 52_powershell, 53_g-code, 54_ocaml, 55_java-server-pages, 56_solidity, 57_graphviz-dot, 58_less, 59_twig, 60_asciidoc, 61_groovy, 62_llvm, 63_hcl, 64_html+erb, 65_erlang, 66_elixir, 67_eagle, 68_arduino, 69_coffeescript, 70_toml, 71_cuda, 72_nix, 73_smalltalk, 74_cmake, 75_actionscript, 76_glsl, 77_systemverilog, 78_haxe, 79_f#, 80_max, 81_objective-c++, 82_standard-ml, 83_dockerfile, 84_emacs-lisp, 85_scheme, 86_clojure, 87_handlebars, 88_smarty, 89_logos, 90_stata, 91_yacc, 92_nimrod, 93_tcl, 94_viml, 95_asp, 96_protocol-buffer, 97_r, 98_cython, 99_mediawiki Table 12: Domains in DOLMA-100-PROGRAMMING-LANGUAGES

00_text、01_markdown、02_c、03_php、04_java、05_c++、06_python、07_javascript、08_html、09_c#、10_yaml、11_go、12_typescript、13_xml、14_css、15_jupyter笔记本、16_rust、 17_unity3d-asset、18_gettext-catalog、19_ruby、20_vue、21_sql、22_swift、23_kotlin、24_scala、25_scss、26_tex、27_dart、28_kicad、29_shell、30_smali、31_lua、 32_restructedtext、33_perl、34_diff、35_ini、36_jsx、37_haskell、38_gnuplot、39_postscript、40_groff、41_turtle、42_fortran、43_makefile、44_mathematica、45_pascal、46_common-lisp、 47_gas、48_vhdl、49_julia、50_edn、51_visual-basic、52_powershell、53_g-code、54_ocaml、55_java-server-pages、56_solidity、57_graphviz-dot、58_less、59_twig、60_asciidoc、 61_groovy、62_llvm、63_hcl、64_html+erb、65_erlang、66_elixir、67_eagle、68_arduino、69_coffeescript、70_toml、71_cuda、72_nix、73_smalltalk、74_cmake、75_actionscript、 76_glsl、77_systemverilog、78_haxe、79_f#、80_max、81_objective-c++、82_standard-ml、83_dockerfile、84_emacs-lisp、85_scheme、86_clojure、87_handlebars、88_smarty、89_logos、 90_stata、91_yacc、92_nimrod、93_tcl、94_viml、95_asp、96_protocol-buffer、97_r、98_cython、99_mediawiki 表 12：DOLMA-100-PROGRAMMING-LANGUAGES 中的域

TWITTERAAE Blodgett et al. [2016] create a pair of corpora representing African-American and White-aligned English using a statistical model with distant supervision from geolocation and demographic census statistics. We follow the reproduction of this dataset used in HELM [Liang et al., 2022], but we fix an error in loading escaped sequences of the data that, among other issues, renders emojis as literal hexadecimal bytes. Our reproduction is not able to sample the same documents, but is otherwise identical. We sample these corpora to examine disparities in performance on minoritized dialects (see Table 13).

TWITTERAAE 布洛杰特等人。 [2016] 使用地理定位和人口普查统计数据进行远程监督的统计模型创建一对代表非裔美国人和白人英语的语料库。我们遵循 HELM [Liang et al., 2022] 中使用的该数据集的复制，但我们修复了加载数据转义序列时的错误，该错误将表情符号呈现为文字十六进制字节。我们的复制品无法对相同的文档进行采样，但在其他方面是相同的。我们对这些语料库进行抽样，以检查少数民族方言的表现差异（见表 13）。

AA, white Table 13: Domains in TWITTERAAE

MANOSPHERE CORPUS Ribeiro et al. [2021] curate a corpus of texts spanning 2006 to 2019 scrapped from 9 forums sharing a masculinist ideology: 8 independent message boards as well as 56 subreddits on Reddit. Using a toxicity classifier and lexicon-based misogyny metric, they find an increase in toxicity and hate over time to levels far above mainstream Reddit and comparable to 4CHAN CORPUS. We sample this corpus to measure fit to a discourse with a specific variety of toxicity focused on hate towards women. Moreover we intend this to exemplify how domain expertise allows the manual curation of a corpus to represent a whole discourse using known relationships between sources. The original data already linearizes the posts into a sequential thread, which we concatenate together with post authors prepended to posts. Though this datasets marks 9 domains

MANOSPHERE CORPUS Ribeiro 等人。 [2021] 整理了 2006 年至 2019 年从 9 个共享男性主义意识形态的论坛中删除的文本语料库：8 个独立留言板以及 Reddit 上的 56 个 Reddit 子版块。使用毒性分类器和基于词典的厌女症指标，他们发现毒性和仇恨随着时间的推移而增加，达到远远高于主流 Reddit 的水平，与 4CHAN CORPUS 相当。我们对这个语料库进行采样，以衡量与针对女性的仇恨的特定毒性的话语的契​​合度。此外，我们打算以此举例说明领域专业知识如何允许手动管理语料库来使用源之间的已知关系来表示整个话语。原始数据已经将帖子线性化为一个连续的线程，我们将其与帖子前面的帖子作者连接在一起。虽然这个数据集标记了 9 个域

34

<!-- page 35 of 39 -->

(see Table 14), we opt to treat this whole source as a single domain for the present analysis and thus do not perform a stratified sample of these domains.

（参见表 14），我们选择将整个源视为当前分析的单个域，因此不对这些域执行分层样本。

avfm, incels, love_shy, mgtow, pua_forum, red_pill_talk, reddit, rooshv, the_attraction

avfm、incels、love_shy、mgtow、pua_forum、red_pill_talk、reddit、rooshv、the_attraction

Table 14: Domains in MANOSPHERE CORPUS

GAB CORPUS Zannettou et al. [2018] scrape posts from August 2016 and January 2018 on Gab, an alt-right focused Twitter alternative founded in 2016. The platform emphasizes freedom of speech and minimal moderation, with notable users joining after being banned from mainstream social media. The authors find that GAB CORPUS measures higher than Twitter but lower than 4CHAN CORPUS on a lexicon of hate words. We sample this corpus to measure fit to low moderation social media. We treat posts as independent documents, rather than attempting to reconstruct connected subgraphs of posts replying to other posts. This source has no marked domains.

GAB CORPUS Zannettou 等人。 [2018] 抓取了 Gab 2016 年 8 月和 2018 年 1 月的帖子，Gab 是一个于 2016 年成立的另类右翼 Twitter 替代品。该平台强调言论自由和最低限度的节制，知名用户在被主流社交媒体禁止后加入。作者发现，在仇恨词汇词典中，GAB CORPUS 的测量结果高于 Twitter，但低于 4CHAN CORPUS。我们对这个语料库进行抽样，以衡量是否适合低度社交媒体。我们将帖子视为独立文档，而不是尝试重建回复其他帖子的帖子的连接子图。该来源没有标记域。

4CHAN CORPUS Papasavva et al. [2020] collect posts between June 2016 and November 2019 from the Politically Incorrect board (/pol/) of 4chan, a fringe imageboard emphasizing anonymity and ephemerality. Users can post content without registering, with a thread consisting of an image and message followed by a sequence comments. Threads are deleted shortly after they become inactive. As noted previously, 4CHAN CORPUS has toxicity and mysogynist hate comparable to the worst data in MANOSPHERE CORPUS and hatespeech above GAB CORPUS. We sample this corpus to measure fit to types of discourse and toxicity that can arise from anonymous posting. We concatenate posts in a thread together with post metadata prepended as a header. This source has no marked domains.

4CHAN CORPUS Papasavva 等人。 [2020] 收集 4chan 政治不正确板 (/pol/) 2016 年 6 月至 2019 年 11 月期间的帖子，4chan 是一个强调匿名和短暂性的边缘图像板。用户无需注册即可发布内容，帖子由图像和消息组成，后跟一系列评论。线程在变为非活动状态后不久就会被删除。如前所述，4CHAN CORPUS 的毒性和同性恋仇恨与 MANOSPHERE CORPUS 中最差的数据相当，仇恨言论高于 GAB CORPUS。我们对该语料库进行抽样，以衡量匿名发布可能产生的话语类型和毒性的适合程度。我们将线程中的帖子与作为标题前置的帖子元数据连接在一起。该来源没有标记域。

E.1 Removed sources

Two additional sources were included in early versions of PALOMA, but were removed as access restrictions on these datasets prevent us from rehosting them. We nevertheless present their details here as we still share our findings on these datasets in this Appendix as auxiliary results not part of PALOMA.

PALOMA 的早期版本中包含了两个额外的源，但由于这些数据集的访问限制阻止我们重新托管它们而被删除。尽管如此，我们还是在这里展示了它们的详细信息，因为我们仍然在本附录中分享我们对这些数据集的发现，作为辅助结果，而不是 PALOMA 的一部分。

THE PILE Gao et al. [2020] curate a pretraining corpus from 22 domains in one of the first large open corpora to include mostly non-webscraped text, such as archives of novels or academic papers. It is also explicitly framed as a language modeling benchmark with instructions for standardized evaluations on the validation and test sets, and several open source models have been trained on it [Wang and Komatsuzaki, 2021, Black et al., 2022, Biderman et al., 2023]. It has 22 domains (see Table 15).

桩 高等人。 [2020] 在第一个大型开放语料库之一中策划一个来自 22 个领域的预训练语料库，其中大部分包括非网络抓取的文本，例如小说档案或学术论文。它还被明确构建为语言建模基准，其中包含对验证集和测试集进行标准化评估的说明，并且已经在其上训练了多个开源模型 [Wang 和 Komatsuzaki，2021；Black 等人，2022；Biderman 等人，2023]。它有 22 个域（参见表 15）。

ArXiv, BookCorpus2, Books3, DM_Mathematics, Enron_Emails, EuroParl, FreeLaw, Github, Gutenberg_PG-19, HackerNews, NIH_ExPorter, OpenSub- titles, OpenWebText2, PhilPapers, Pile-CC, PubMed_Abstracts, PubMed_Central, StackExchange, USPTO_Backgrounds, Ubuntu_IRC, Wikipedia_en, YoutubeSubtitles

ArXiv、BookCorpus2、Books3、DM_Mathematics、Enron_Emails、EuroParl、FreeLaw、Github、Gutenberg_PG-19、HackerNews、NIH_ExPorter、OpenSub-titles、OpenWebText2、PhilPapers、Pile-CC、PubMed_Abstracts、PubMed_Central、StackExchange、USPTO_Backgrounds、Ubuntu_IRC、 Wikipedia_en、Youtube字幕

Table 15: Domains in THE PILE

ICE Local research teams following guidelines established in Greenbaum and Nelson [1996] collected corpora of English from Canada, East Africa (Kenya & Tanzania), Hong Kong, India, Ireland, Jamaica, Philippines, Singapore, and the USA. Each of these samples of English from around the world is further split into a written and transcribed spoken corpus, except for USA which only has written data (see Table 16). We follow HELM [Liang et al., 2022] in utilizing this corpus to measure disparate performance between these dialects. To permit comparability to HELM, we follow the same preprocessing which leaves in some XML-style tags marking phenomena such as speaker turns.

ICE 当地研究团队遵循 Greenbaum 和 Nelson [1996] 制定的指导方针，收集了来自加拿大、东非（肯尼亚和坦桑尼亚）、香港、印度、爱尔兰、牙买加、菲律宾、新加坡和美国的英语语料库。来自世界各地的每个英语样本都被进一步分成书面和转录的口语语料库，但美国除外，它只有书面数据（见表 16）。我们遵循 HELM [Liang et al., 2022]，利用该语料库来衡量这些方言之间的不同表现。为了与 HELM 进行比较，我们遵循相同的预处理，其中留下了一些标记现象（例如扬声器转动）的 XML 样式标签。

35

<!-- page 36 of 39 -->

CANADA_S_ALL, CANADA_W_ALL, EAST_AFRICA_S_ALL, EAST_AFRICA_W_ALL, HONG_KONG_S_ALL, HONG_KONG_W_ALL, IN- DIA_S_ALL, INDIA_W_ALL, IRELAND_S_ALL, IRELAND_W_ALL, JAMAICA_S_ALL, JAMAICA_W_ALL, PHILIPPINES_S_ALL, PHILIP- PINES_W_ALL, SINGAPORE_S_ALL, SINGAPORE_W_ALL, USA_W_ALL

CANADA_S_ALL、CANADA_W_ALL、EAST_AFRICA_S_ALL、EAST_AFRICA_W_ALL、HONG_KONG_S_ALL、HONG_KONG_W_ALL、INDIA_S_ALL、INDIA_W_ALL、IRELAND_S_ALL、IRELAND_W_ALL、JAMAICA_S_ALL、JAMAICA_W_ALL、PHILIPPINES_S_ALL、 PHILIP-PINES_W_ALL、SINGAPORE_S_ALL、SINGAPORE_W_ALL、USA_W_ALL

Table 16: Domains in ICE

F Reweighting Perplexities（困惑度重加权）

Even though we sample equal token counts for each domain, sometimes users of PALOMA may wish to compute a perplexity over the original distribution of domains in standard corpora such as THE PILE to compare to previous evaluations that do a uniform instead of stratified sample of these sources. We do not use such reweighted numbers in this paper, but we explain here how one might do this if desired. Instead of having to run inference twice for each source (e.g., a copy of THE PILE sampled uniformly as well as a stratified sample by domain), one can compute a perplexity with the already computed average negative log likelihood per domain NLLd,c. Formally, for each domain d ∈D within a corpus c, consisting of a set of documents Nd,c = {t1, . . . , t|Nd,c|}, with T(Nd,c) denoting the number of tokens in that domain (i.e., T(Nd,c) = P

即使我们对每个域采样相同的标记计数，有时 PALOMA 的用户可能希望计算标准语料库（例如 THE PILE）中域的原始分布的困惑度，以与以前对这些来源进行统一而不是分层样本的评估进行比较。我们在本文中不使用此类重新加权的数字，但我们在此解释了如果需要的话可以如何做到这一点。不必对每个源运行推理两次（例如，均匀采样的 THE PILE 副本以及按域分层的样本），而是可以使用已计算出的每个域的平均负对数似然 NLLd,c 来计算困惑度。形式上，对于语料库 c 内的每个域 d ∈D，由一组文档 Nd,c = {t1, . 。 。 , t|Nd,c|}，其中 T(Nd,c) 表示该域中的标记数量（即 T(Nd,c) = P

t∈Nd,c | tokenize(t) |) the NLLd,c is computed as:

X

|t| X

ln p(ti|t<i)

NLLd,c = − 1 T(Nd,c)

i=1

t∈Nd,c

We have NLLd,c where c is a source in PALOMA where each domain is represented by the same number of tokens. However if we want perplexity for some other corpus c′ with a different distribution of domains, we can use its ratio of tokens in a domain to total tokens, αd,c′, to reweight domains:

我们有 NLLd,c，其中 c 是 PALOMA 中的源，其中每个域由相同数量的标记表示。然而，如果我们想要具有不同域分布的其他语料库 c′ 的困惑度，我们可以使用域中标记与总标记的比率 αd,c′ 来重新加权域：

αd,c′ = T(Nd,c′) P

T(Nd′,c′)

d′∈D

Now we can compute the perplexity for the domain distribution of c′.

!

X

perplexity = exp

αd,c′NLLd,c

d∈D

G Baseline Models（基线模型）

The 6 baseline 1B parameter models that we train employ the following architecture: 2048 maximum sequence length, 2048 model dimension, 16 layers, 16 attention heads, RoPE embedding [Su et al., 2021], SwiGLU activation [Shazeer, 2020], mixed precision, non-parametric layer normalization, and sequential model blocks for attention and feed-forward networks. We use EleutherAI’s GPT NeoX tokenizer [Black et al., 2022] but add 3 additional special tokens that are used to mask PII in DOLMA. We train to 35k steps (∼150B tokens) with the following LionW optimizer [Chen et al., 2023] configurations: 2.0e-4 peak learning rate, warm-up of 2000 steps, cosine decay to 70k steps (∼300B tokens), 0.1 weight decay, and betas of 0.9 and 0.95. Note that our batch size varies slightly to accommodate two groups of baselines that were run on different hardware. The DOLMA and FALCON REFINEDWEB baselines were run with a batch size of 2112 training instances per step on 24 A100s for 9 days per model. The REDPAJAMA, THE PILE, C4, and MC4-EN baselines were run with a batch size of 2048 on 64 AMD Instinct MI250X GPUs for 2 days per model. In each case we save model checkpoints every 5k steps (∼20B tokens).

我们训练的 6 个基线 1B 参数模型采用以下架构：2048 最大序列长度、2048 模型维度、16 层、16 个注意力头、RoPE 嵌入 [Su et al., 2021]、SwiGLU 激活 [Shazeer, 2020]、混合精度、非参数层归一化以及用于注意力和前馈网络的顺序模型块。我们使用 EleutherAI 的 GPT NeoX 标记器 [Black et al., 2022]，但添加了 3 个额外的特殊标记，用于在 DOLMA 中屏蔽 PII。我们使用以下 LionW 优化器 [Chen et al., 2023] 配置训练至 35k 步（∼150B 令牌）：2.0e-4 峰值学习率、2000 步预热、余弦衰减至 70k 步（∼300B 令牌）、0.1 权重衰减以及 0.9 和 0.95 的 beta。请注意，我们的批量大小略有不同，以适应在不同硬件上运行的两组基线。 DOLMA 和 FALCON REFINEDWEB 基线在 24 个 A100 上以每步 2112 个训练实例的批量大小运行，每个模型运行 9 天。 REDPAJAMA、THE PILE、C4 和 MC4-EN 基准在 64 个 AMD Instinct MI250X GPU 上以 2048 的批量大小运行，每个模型运行 2 天。在每种情况下，我们每 5k 步保存一次模型检查点（∼20B 令牌）。

We also include baseline results from the Pythia models [Biderman et al., 2023]. These models do not conform with training guidelines (§3). They do, however, use the GPTNeoX-20B tokenizer

我们还包括 Pythia 模型的基线结果 [Biderman et al., 2023]。这些模型不符合培训指南 (§3)。然而，他们确实使用 GPTNeoX-20B 分词器

36

<!-- page 37 of 39 -->

[Black et al., 2022] which has an identical vocabulary to our own baseline models, except lacking 3 special tokens used in DOLMA. Another similarity is that the Pythia models also have a learning rate schedule set to end at 300B tokens seen, though they train for the full 300B tokens while we train for just 150B tokens of that schedule. This permits comparison between partially trained checkpoints.

[Black et al., 2022] 它与我们自己的基线模型具有相同的词汇表，只是缺少 DOLMA 中使用的 3 个特殊标记。另一个相似之处是，Pythia 模型也有一个学习率计划，设置为以看到的 300B 令牌结束，尽管它们针对完整的 300B 令牌进行训练，而我们仅针对该计划的 150B 令牌进行训练。这允许在部分训练的检查点之间进行比较。

H Formatting and Subsampling（格式化与子采样）

Evaluation Subset Tokens 4M 8M 12M 16M 20M 40M

Concat

2B 92.23 +- 17.33 87.05 +- 1.82 86.06 +- 7.41 95.11 +- 26.34 94.91 +- 20.23 77.49 +- 2.34 26B 21.58 +- 3.48 19.93 +- 2.67 20.24 +- 5.09 22.2 +- 2.24 22.9 +- 2.15 21.61 +- 2.02 86B 17.94 +- 2.02 19.76 +- 0.79 20.36 +- 2.23 19.61 +- 1.67 20.25 +- 1.72 20.25 +- 2.43 286B 16.55 +- 0.91 17.77 +- 1.91 16.7 +- 3.36 14.68 +- 1.86 17.12 +- 1.98 20.07 +- 3.25

Train Toks

Not concat

2B 42.57 ± 0.29 42.67 ± 0.14 42.73 ± 0.16 42.66 ± 0.10 42.69 ± 0.14 42.73 ± 0.09 26B 21.98 ± 0.16 22.02 ± 0.08 22.04 ± 0.09 22.00 ± 0.04 22.01 ± 0.06 22.03 ± 0.05 86B 18.52 ± 0.13 18.55 ± 0.07 18.57 ± 0.07 18.54 ± 0.03 18.55 ± 0.05 18.56 ± 0.04 286B 16.14 ± 0.11 16.18 ± 0.06 16.19 ± 0.06 16.16 ± 0.03 16.17 ± 0.04 16.18 ± 0.03

Table 17: Average perplexity over 4 subsets of C4 validation data using Pythia 1.4B checkpoints. On top, inputs are maximum-sequence-length concatenations of random documents drawn from 4 different seeds in each cell. On bottom, random documents drawn from the same 4 seeds in all cells are evaluated separately.

We find preliminary evidence that the monotonic decrease in variability with increased evaluation or training data (see Appendix C.2.1) depends on using the non-concatenated inference input format detailed in Appendix C.2.3. In Table 17 we see that the previously observed trends break down when inputs are concatenated. Additionally, the concatenated documents are drawn from 4 random shufflings where the 4 seeds change for each cell. For comparison the bottom of the table shows results when documents are evaluated separately and with the same set of 4 random seeds for all cells. In both input formats documents that are longer than the model context window are split into separate inputs with no overlap.

我们发现初步证据表明，随着评估或训练数据的增加，变异性单调减少（参见附录 C.2.1）取决于使用附录 C.2.3 中详述的非级联推理输入格式。在表 17 中，我们看到当输入串联时，先前观察到的趋势会崩溃。此外，连接的文档是从 4 次随机洗牌中抽取的，其中每个单元的 4 个种子都会发生变化。为了进行比较，表底部显示了单独评估文档并对所有单元使用同一组 4 个随机种子时的结果。在两种输入格式中，比模型上下文窗口长的文档都会被拆分为不重叠的单独输入。

We hypothesize that the trends differ between the concatenated and not concatenated formats because documents are interrupted at the start and end of concatenated instances. The location of this split will depend on the lengths of the other randomly selected documents included in the concatenation. In the non-concatenated format, documents can still be split if they exceed the maximum sequence length, but the location of the split will be the same across all random shufflings. However it is possible that other factors such as influence across document boundaries in concatenated inputs might play a role, or simply that changing the random seeds between each cell discovers more of the most unlucky, outlier seeds.

我们假设串联和非串联格式之间的趋势不同，因为文档在串联实例的开始和结束处被中断。该分割的位置将取决于串联中包含的其他随机选择的文档的长度。在非串联格式中，如果文档超过最大序列长度，仍然可以进行拆分，但拆分的位置在所有随机改组中都是相同的。然而，其他因素（例如连接输入中跨文档边界的影响）可能会发挥作用，或者只是改变每个单元之间的随机种子会发现更多最不幸的异常种子。

I Most and Least Improved Domains（改进最多与最少的领域）

In Appendix D.1 we show that improvement of LM fit when scaling is unequal from domain to domain. Differences in improvement rates can actually indicate several different training dynamics, exemplified in Figure 7. Looking at performance curves over the underlying factor of scale, helps show more specifically what is going on. Examining the domains at the extreme values of improvement rate is one way to surface interesting details of model fit. In Figure 13 we examine performance curves of the most and least improved domains with respect to number of tokens seen, ∆t(∼20B, ∼150B), and in Figure 14 we examine the most and least improved with respect to number of model parameters, ∆p(85M, 805M) and ∆p(805M, 6.4B).

在附录 D.1 中，我们展示了当域与域之间的缩放不相等时 LM 拟合的改进。改进率的差异实际上可以表明几种不同的训练动态，如图 7 所示。查看基本规模因素的性能曲线有助于更具体地显示正在发生的情况。检查改进率极值的领域是揭示模型拟合的有趣细节的一种方法。在图 13 中，我们检查了相对于所见标记数量 Δt(∼20B, ∼150B) 而言改进最大和最小的域的性能曲线，在图 14 中，我们检查了相对于模型参数数量 Δp(85M, 805M) 和 Δp(805M, 6.4B) 而言改进最大和最小的域。

37

<!-- page 38 of 39 -->

Dolma v1.5 1B

The Pile 1B

Falcon-RefinedWeb 1B

C4 1B

mC4 1B

RedPajama 1B

OpenSubtitles EuroParl

ArXiv EuroParl

OpenSubtitles Ubuntu_IRC

DM_Mathematics YoutubeSubtitles

Ubuntu_IRC PubMed_Central

Ubuntu_IRC StackExchange

3.4 6.2 15.2

8.3 32.8 315.6 13.2K 6.2M

9.3 27.7 141.6 1.6K 61.3K

11.7 20.2 39.2 The Pile

15.2 57.7 424.0 8.3K

10.4 13.3 17.4 23.5 32.8

20 65 150

20 65 150

20 65 150

20 65 150

20 65 150

20 65 150

arxiv wikipedia

github arxiv

books github

books github

c4 github

c4 github

2.2 3.6 8.3 32.8 RedPajama

2.0 2.7 4.4 9.3 27.7

9.3 27.7 141.6

8.3 32.8 315.6 13.2K 6.2M

8.3 10.4 13.3

2.7 4.4 9.3 27.7

20 65 150

20 65 150

20 65 150

20 65 150

20 65 150

20 65 150

reddit_uniform stack_uniform

reddit_uniform stack_uniform

reddit_uniform stack_uniform

stack_uniform wiki

reddit_uniform stack_uniform

common-crawl books

2.7 4.4 9.3 27.7 Dolma V1.5

2.7 4.4 9.3 27.7

4.4 9.3 27.7

15.2 27.7 57.7

11.7 20.2 39.2 88.4

18.7 21.8 25.5 30.1

20 65 150

20 65 150

20 65 150

20 65 150

20 65 150

20 65 150

stat.ME hep-ex

cs.GR math.CT

cs.CY stat.ME

stat.ME math.GR

stat.ME hep-ex

stat.ME math.GR

9.3 15.2 27.7

7.5 11.7 20.2

14.2 16.2 18.7 21.8 M2D2 S2ORC

10.4 13.3 17.4

16.2 18.7 21.8 25.5 30.1

13.3 17.4 23.5 32.8

20 65 150

20 65 150

20 65 150

20 65 150

20 65 150

20 65 150

Visual_arts Earth_sciences

Visual_arts Earth_sciences

Visual_arts Earth_sciences

Human_activites Nutrition

Visual_arts Earth_sciences

Visual_arts Earth_sciences

8.3 10.4 13.3 17.4 23.5

9.3 11.7 15.2 20.2

10.4 13.3 17.4 23.5 M2D2 Wikipedia

11.7 15.2 20.2

13.3 17.4 23.5 32.8

13.3 17.4 23.5

20 65 150

20 65 150

20 65 150

20 65 150

20 65 150

20 65 150

Perplexity

49_lists.w3.org 97_archives.lib .state.ma.us

94_www.nme.com 97_archives.lib .state.ma.us

53_answers.sap.com 97_archives.lib .state.ma.us

31_www.devianta rt.com 59_app-wiringdi agram.herokuapp.com

31_www.devianta rt.com 16_www.ncbi.nlm .nih.gov

31_www.devianta rt.com 97_archives.lib .state.ma.us

7.5 11.7 20.2 39.2 C4 100 Domains

7.5 11.7 20.2 39.2

7.5 11.7 20.2 39.2

6.2 9.3 15.2 27.7

6.2 15.2 57.7 424.0

6.2 9.3 15.2 27.7 57.7

20 65 150

20 65 150

20 65 150

20 65 150

20 65 150

20 65 150

66_depression 80_buildapc

66_depression 80_buildapc

68_pathofexile 80_buildapc

28_DestinyTheGame 35_Christianity

71_PurplePillDebate 81_askscience

91_dating_advice 81_askscience

16.9 19.0 21.4 24.3 100 Subreddits

15.2 20.2 27.7 39.2 57.7

18.7 21.8 25.5 30.1 35.8

23.5 32.8 47.3

20.2 27.7 39.2 57.7

23.5 32.8 47.3 71.0

20 65 150

20 65 150

20 65 150

20 65 150

20 65 150

20 65 150

80_max 13_xml

63_hcl 48_vhdl

80_max 11_go

39_postscript 99_mediawiki

45_pascal 30_smali

17_unity3d-asset 11_go

1.2 1.8 5.2 88.4 100 PLs

1.2 1.8 5.2

9.3 27.7 141.6

3.6 8.3 32.8 315.6 13.2K

3.0 3.9 5.2

15.2 57.7 424.0 8.3K

20 65 150

20 65 150

20 65 150

20 65 150

20 65 150

20 65 150

IRELAND_S_ALL USA_W_ALL

HONG_KONG_S_ALL EAST_AFRICA_S_ALL

JAMAICA_S_ALL PHILIPPINES_S_ALL

JAMAICA_S_ALL USA_W_ALL

JAMAICA_S_ALL SINGAPORE_W_ALL

JAMAICA_S_ALL HONG_KONG_W_ALL

11.7 15.2 20.2 ICE

11.7 15.2 20.2

15.2 20.2 27.7

15.2 57.7 424.0 8.3K

20.2 27.7 39.2

13.3 15.2 17.4 20.2

20 65 150

20 65 150

20 65 150

20 65 150

20 65 150

20 65 150

AA white

white AA

white AA

AA white

AA white

AA white

88.4 141.6 238.4 424.0 Twitter AAE

88.4 141.6 238.4 424.0

88.4 141.6 238.4 424.0

88.4 141.6 238.4 424.0

88.4 141.6 238.4 424.0

88.4 238.4 801.0

20 65 150

20 65 150

20 65 150

20 65 150

20 65 150

20 65 150

Tokens Seen (Billions)

Figure 13: Perplexity curves for the most and least improved domains over an increase in tokens seen (See Appendix D.1.1). Columns are specific baseline models; rows are specific evaluation sources.

38

<!-- page 39 of 39 -->

From Pythia 1B to Pythia 7B

From Pythia 160m to Pythia 1B

From Pythia 1B to Pythia 7B

From Pythia 160m to Pythia 1B

49_lists.w3.org 27_www.reuters.com

82_mail-archive s.apache.org 97_archives.lib .state.ma.us

DM_Mathematics Github

DM_Mathematics Github

1.7 2.3 3.4 The Pile

1.7 2.3 3.4

5.7 6.8 8.3 10.4 13.3 17.4 C4 100 Domains

7.5 11.7 20.2 39.2

108.0 109.0 1010.0

108.0 109.0 1010.0

108.0 109.0 1010.0

108.0 109.0 1010.0

c4 github

books github

66_depression 80_buildapc

28_DestinyTheGame 35_Christianity

1.7 2.3 3.4 6.2 15.2 57.7 RedPajama

1.7 2.3 3.4 6.2 15.2 57.7

15.2 20.2 27.7 39.2 100 Subreddits

11.7 20.2 39.2 88.4

108.0 109.0 1010.0

108.0 109.0 1010.0

108.0 109.0 1010.0

108.0 109.0 1010.0

Perplexity

reddit_uniform stack_uniform

reddit_uniform stack_uniform

39_postscript 62_llvm

39_postscript 30_smali

2.3 3.4 6.2 15.2 57.7 Dolma V1.5

2.3 3.4 6.2 15.2 57.7

1.2 1.8 5.2 88.4 100 PLs

1.2 1.8 5.2 88.4

108.0 109.0 1010.0

108.0 109.0 1010.0

108.0 109.0 1010.0

108.0 109.0 1010.0

stat.ME hep-ex

stat.ME hep-ex

JAMAICA_S_ALL HONG_KONG_W_ALL

CANADA_S_ALL HONG_KONG_W_ALL

7.5 9.3 11.7 15.2 20.2 M2D2 S2ORC

7.5 9.3 11.7 15.2 20.2

9.3 11.7 15.2 20.2 27.7 ICE

9.3 11.7 15.2 20.2 27.7

108.0 109.0 1010.0

108.0 109.0 1010.0

108.0 109.0 1010.0

108.0 109.0 1010.0

AA white

AA white

Visual_arts Earth_sciences

Visual_arts Culture_and_the_arts

5.2 7.5 11.7 20.2 M2D2 Wikipedia

5.2 7.5 11.7 20.2 39.2

88.4 141.6 238.4 424.0 801.0 Twitter AAE

88.4 141.6 238.4 424.0 801.0

108.0 109.0 1010.0

108.0 109.0 1010.0

108.0 109.0 1010.0

108.0 109.0 1010.0

Non-embedding Model Parameters

Figure 14: Perplexity curves for the most and least improved domains over an increase in model size (See Appendix D.1.2). Columns are comparisons of specific model sizes. Each row shows first one (left two subplots) and then another (right two subplots) set of evaluation sources.

39
