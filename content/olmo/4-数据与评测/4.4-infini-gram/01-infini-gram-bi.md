---
title: "Infini-gram????? token ?????? n-gram ??"
category: "?????"
tags: ["Infini-gram", "n-gram", "????", "????", "????"]
published: true
excerpt: "Infini-gram ?????????????? token ???????????????????? n-gram ???"
---

<!-- arXiv 2401.17377; 文字由 PyMuPDF 按页抽取, 公式与表以 data/sources/infini-gram/latex/ 的 LaTeX 源码为准 -->

<!-- page 1 of 26 -->

Published as a conference paper at COLM 2024

Infini-gram: Scaling Unbounded n-gram Language Models to a Trillion Tokens

Jiacheng Liu♡ Sewon Min♡

Luke Zettlemoyer♡ Yejin Choi♡♠ Hannaneh Hajishirzi♡♠

♡Paul G. Allen School of Computer Science & Engineering, University of Washington ♠Allen Institute for Artificial Intelligence liujc@cs.washington.edu

♡Paul G. Allen 华盛顿大学计算机科学与工程学院 ♠艾伦人工智能研究所 liujc@cs.washington.edu

Abstract

Are n-gram language models still relevant in this era of neural large lan- guage models (LLMs)? Our answer is yes, and we showcase their values in both text analysis and improving neural LLMs. This was done by mod- ernizing n-gram LMs in two aspects. First, we train them at the same data scale as neural LLMs—5 trillion tokens. This is the largest n-gram LM ever built. Second, existing n-gram LMs use small n which hinders their performance; we instead allow n to be arbitrarily large, by introducing a new ∞-gram LM with backoff. Instead of pre-computing n-gram count tables (which would be very expensive), we develop an engine named infini-gram—powered by suffix arrays—that can compute ∞-gram (as well as n-gram with arbitrary n) probabilities with millisecond-level latency. The ∞-gram framework and infini-gram engine enable us to conduct many novel and interesting analyses of human-written and machine-generated text: we find that the ∞-gram LM has fairly high accuracy for next-token prediction (47%), and can complement neural LLMs to greatly reduce their perplexity. When analyzing machine-generated text, we also observe ir- regularities in the machine–∞-gram agreement level with respect to the suffix length, which indicates deficiencies in neural LLM pretraining and the positional embeddings of Transformers.

在这个神经大语言模型（LLM）时代，n-gram 语言模型仍然相关吗？我们的答案是肯定的，我们展示了它们在文本分析和改进神经法学硕士方面的价值。这是通过在两个方面对 n-gram LM 进行现代化来实现的。首先，我们以与神经 LLM 相同的数据规模（5 万亿个代币）训练它们。这是有史以来最大的 n 元语言模型。其次，现有的 n 元语言模型使用较小的 n，这会影响其性能；相反，我们通过引入带有退避功能的新 ∞-gram LM 来允许 n 任意大。我们开发了一个名为 infini-gram 的引擎（由后缀数组提供支持），而不是预先计算 n-gram 计数表（这会非常昂贵），该引擎可以以毫秒级延迟计算 Infini-gram（以及具有任意 n 的 n-gram）概率。 Infini-gram 框架和 infini-gram 引擎使我们能够对人类编写的和机器生成的文本进行许多新颖且有趣的分析：我们发现 Infini-gram LM 对于下一个标记预测具有相当高的准确度（47％），并且可以补充神经 LLM 以大大降低其困惑度。在分析机器生成的文本时，我们还观察到机器-∞-gram一致性水平在后缀长度方面的不规则性，这表明神经LLM预训练和Transformer的位置嵌入存在缺陷。

Project Homepage infini-gram.io Web Interface infini-gram.io/demo API Endpoint api.infini-gram.io Python Package pypi.org/project/infini-gram Source Code github.com/liujch1998/infini-gram

项目主页 infini-gram.io Web 界面 infini-gram.io/demo API 端点 api.infini-gram.io Python 包 pypi.org/project/infini-gram 源代码 github.com/liujch1998/infini-gram

arXiv:2401.17377v4  [cs.CL]  7 Apr 2025

Figure 1: An example where a 5-gram LM gives an incorrect prediction but the ∞-gram gives the correct prediction by using the longest suffix of the prompt that has a non-zero count in the corpus. The counting and distribution estimate in ∞-gram LM are powered by our infini-gram engine.

1

<!-- page 2 of 26 -->

Published as a conference paper at COLM 2024

1 Introduction · 引言

When pretrained on trillion-token corpora, neural large language models (LLMs) achieve groundbreaking performance (Touvron et al., 2023a; Geng & Liu, 2023; Groeneveld et al., 2024). However, we do not yet know how such data scale would benefit other language modeling approaches. In particular, how well does the classical, n-gram language model (LM) perform if estimated from such massive corpora? In other words, are n-gram LMs still relevant in this era of neural LLMs?

当在万亿代币语料库上进行预训练时，神经大型语言模型 (LLM) 实现了突破性的性能（Touvron 等人，2023a；Geng & Liu，2023；Groeneveld 等人，2024）。然而，我们还不知道这样的数据规模将如何有利于其他语言建模方法。特别是，如果根据如此庞大的语料库进行估计，经典的 n-gram 语言模型 (LM) 的表现如何？换句话说，n-gram LM 在这个神经 LLM 时代仍然有意义吗？

Our answer is yes. As we will show, n-gram LMs are useful for both text analysis and improving neural LLMs. Yet we need to first modernize the canonical n-gram LM in two aspects: the training data size, and the value of n. To achieve broader data coverage, we scale up the training data for n-gram LMs to 5 trillion tokens, by combining some of the largest open-source text corpora. This is the largest n-gram LM ever built. Historically, n-gram indexes have been built only for small n’s (e.g., n ≤5; Brants et al. (2007)), because the size of naive n-gram count table grows almost exponentially wrt n. We instead find significant value in increasing the value of n. As illustrated in Figure 1, a 5-gram LM is poorly predictive of the next token, because it discards the rich context in the prompt; meanwhile, if we can use a larger n (in this case n = 16), the prediction becomes much more accurate. As such, we develop our n-gram LM with unbounded n, or in other words, an ∞-gram LM. We use a variant of backoff (Jurafsky & Martin, 2000), where we resort to smaller n when longer n-grams have a zero count. Due to sparsity in the ∞-gram estimates, in some of the later experiments (§5), we will interpolate between the ∞-gram LM and neural LMs to yield a hybrid LM upon which perplexity can be computed.

我们的答案是肯定的。正如我们将要展示的，n-gram LM 对于文本分析和改进神经 LLM 都很有用。然而，我们首先需要在两个方面对规范的 n-gram LM 进行现代化改造：训练数据大小和 n 的值。为了实现更广泛的数据覆盖，我们通过结合一些最大的开源文本语料库，将 n-gram LM 的训练数据扩展到 5 万亿个标记。这是有史以来最大的 n 元语言模型。从历史上看，n-gram 索引仅针对较小的 n（例如，n ≤ 5；Brants 等人（2007））构建，因为朴素 n-gram 计数表的大小几乎随 n 呈指数增长。相反，我们发现增加 n 值具有重要价值。如图 1 所示，5 克 LM 很难预测下一个标记，因为它丢弃了提示中的丰富上下文；同时，如果我们可以使用更大的n（在本例中n = 16），预测就会变得更加准确。因此，我们开发了具有无界 n 的 n-gram LM，或者换句话说，一个 ∞-gram LM。我们使用退避的变体（Jurafsky & Martin，2000），当较长的 n-gram 计数为零时，我们采用较小的 n。由于 ∞-gram 估计的稀疏性，在后面的一些实验（第 5 节）中，我们将在 ∞-gram LM 和神经 LM 之间进行插值，以生成可以计算困惑度的混合 LM。

We develop a low-latency, resource-efficient engine to serve this massive ∞-gram LM. Instead of building an explicit n-gram count table, which is infeasible for arbitrarily large n and such extreme data scale, we power the ∞-gram LM with a suffix array of the dataset – a data structure that supports fast n-gram counting, and is efficient in both storage space and compute. Our index takes 7 bytes of storage per token (3.5x overhead compared to the raw dataset), and on a dataset with 1.4 trillion tokens, it can be built with a single 128-code CPU node in about 2 days, using 10 TB of disk storage. Average inference latency is less than 20 milliseconds for counting an n-gram and finding all positions of its occurrence (regardless of how large n is or how frequently the n-gram appears), and under 200 milliseconds for all other query types including ∞-gram language modeling and decoding. All indexes stay on-disk at inference time. We refer to this engine as infini-gram.

我们开发了一个低延迟、资源高效的引擎来服务这个巨大的 ∞-gram LM。我们没有构建显式的 n 元语法计数表（这对于任意大的 n 和如此极端的数据规模来说是不可行的），而是使用数据集的后缀数组为 ∞ 元语法语言模型提供动力——这是一种支持快速 n 元语法计数的数据结构，并且在存储空间和计算方面都很高效。我们的索引每个令牌占用 7 个字节的存储空间（与原始数据集相比，开销是原始数据集的 3.5 倍），并且在包含 1.4 万亿个令牌的数据集上，可以使用单个 128 代码 CPU 节点在大约 2 天内构建它，并使用 10 TB 磁盘存储。对于计算 n-gram 并查找其出现的所有位置（无论 n 有多大或 n-gram 出现的频率如何），平均推理延迟小于 20 毫秒，对于所有其他查询类型（包括 ∞-gram 语言建模和解码），平均推理延迟低于 200 毫秒。所有索引在推理时都保留在磁盘上。我们将该引擎称为 infini-gram。

Analyses with ∞-gram (§4) offers new insights into human-written and machine-generated text. We found that ∞-gram has a fairly high accuracy (47%) when predicting the next token given a prefix of a human-written document, and this accuracy is higher on tokens where the effective n is larger. In contrast, conventional n-grams (with small n) are insufficient in capturing a long enough context to predict the next token (29% accuracy). Moreover, we show that ∞-gram can complement neural LMs and reach better performance when combined: heuristically interpolating between the estimates made by ∞-gram and neural LMs can greatly reduce perplexity (by up to 73%) compared to the neural LMs alone, even when the neural LM is as large as 70B (§5). When analyzing the level of agreement with

使用 ∞-gram 进行分析 (§4)，为人类书写和机器生成的文本提供新的见解。我们发现，在给定人工编写文档的前缀的情况下预测下一个标记时，∞-gram 具有相当高的准确度 (47%)，并且在有效 n 较大的标记上，这种准确度更高。相比之下，传统的 n 元语法（n 较小）不足以捕获足够长的上下文来预测下一个标记（准确度为 29%）。此外，我们表明 ∞-gram 可以补充神经 LM，并在组合时达到更好的性能：与单独的神经 LM 相比，在 ∞-gram 和神经 LM 所做的估计之间进行启发式插值可以大大降低困惑度（高达 73%），即使神经 LM 高达 70B (§5) 时也是如此。在分析同意程度时

∞-gram, nucleus sampling (Holtzman et al., 2019) from neural LMs produces machine- generated text with an agreement plot most similar to human-written text, among other decoding methods like greedy decoding and temperature sampling; for greedy decoding, we observe significant fluctuation in the agreement level wrt the suffix length, which indicates deficiencies in neural LM pretraining and the positional embeddings of Transformers.

神经 LM 的 ∞-gram 核采样（Holtzman 等人，2019）可生成机器生成的文本，其一致性图与人类编写的文本最相似，此外还有贪婪解码和温度采样等其他解码方法；对于贪婪解码，我们观察到后缀长度的一致性水平显着波动，这表明神经 LM 预训练和 Transformer 的位置嵌入存在缺陷。

We are hosting host a public web interface and an API endpoint that serve n-gram/∞-gram queries on several popular open corpora: Dolma (Soldaini et al., 2023), RedPajama (Together, 2023), Pile (Gao et al., 2020), and C4 (Raffel et al., 2019). We also release a Python package for local serving and building new indexes, as well as our source code. We hope these tools can enable more insightful analysis and understanding of large text corpora, and open up new avenues for data-driven language modeling.

我们托管一个公共 Web 界面和一个 API 端点，为几个流行的开放语料库提供 n-gram/∞-gram 查询：Dolma (Soldaini et al., 2023)、RedPajama (Together, 2023)、Pile (Gao et al., 2020) 和 C4 (Raffel et al., 2019)。我们还发布了一个用于本地服务和构建新索引的 Python 包以及我们的源代码。我们希望这些工具能够对大型文本语料库进行更深入的分析和理解，并为数据驱动的语言建模开辟新的途径。

2

<!-- page 3 of 26 -->

Published as a conference paper at COLM 2024

2 ∞-gram LM: Extending n-gram LMs with Unbounded n · 以无界n扩展n-gram语言模型

Background: n-gram LM. The n-gram LM is a classical, statistical language model based on counting the occurrences of n-grams. In its most simple form, the probability of a token

背景：n-gram LM。 n-gram LM 是一种基于计算 n-gram 出现次数的经典统计语言模型。最简单的形式是令牌的概率

cnt(wi−(n−1):i−1wi|D)

wi given a context wi−(n−1):i−1 is estimated as Pn(wi | wi−(n−1):i−1) =

给定上下文 wi−(n−1):i−1 的 wi 估计为 Pn(wi | wi−(n−1):i−1) =

cnt(wi−(n−1):i−1|D) ,

where cnt(w | D) is the number of times the n-gram w appears in the training data D (i.e., a corpus), and n is a pre-defined hyperparameter. (When n = 1, we define wi−(n−1):i−1 as the empty string ε, whose count is equal to |D|.) However, this naive version of n-gram LM faces the sparsity issue: the numerator may be zero, resulting in an infinite perplexity. One common solution is backoff (Jurafsky & Martin, 2000): on an instance-wise basis, when the numerator is zero we decrease n by one, and do this repeatedly until the numerator becomes positive. One caveat in backoff is that it does not yield a valid distribution for Pn(∗|wi−(n−1):i−1), because the effective n is dependent on wi. Therefore, further probability discounting is required to normalize this distribution (e.g., Katz backoff (Katz, 1987)).

其中 cnt(w | D) 是 n-gram w 在训练数据 D（即语料库）中出现的次数，n 是预定义的超参数。 （当 n = 1 时，我们将 wi−(n−1):i−1 定义为空字符串 ε，其计数等于 |D|。）然而，这种简单版本的 n-gram LM 面临稀疏性问题：分子可能为零，导致无限的困惑。一种常见的解决方案是退避（Jurafsky & Martin，2000）：在实例方面，当分子为零时，我们将 n 减一，并重复执行此操作，直到分子变为正值。退避的一个警告是，它不会产生 Pn(*|wi−(n−1):i−1) 的有效分布，因为有效 n 取决于 wi。因此，需要进一步的概率折扣来标准化该分布（例如，Katz 退避（Katz，1987））。

Conventionally, n-gram LMs have been implemented by building an n-gram count table of the training data. This table stores all unique n-grams that appear in the training data, each associated with its count. Such n-gram count tables are huge and grow almost exponentially wrt n. For example, the 5-gram count table for a 1.4-trillion-token corpus would consume 28 TB of disk space. As a result, previous n-gram LMs are limited to very small n, most commonly n = 5, and to frequent n-grams only (e.g., Franz & Brants (2006)). As we illustrated in Figure 1 and will further quantify in §4, the problem with small n is that it discards richer context, making such n-gram LMs poorly predictive of future tokens.

传统上，n-gram LM 是通过构建训练数据的 n-gram 计数表来实现的。该表存储训练数据中出现的所有唯一 n 元语法，每个元语法与其计数相关联。这样的 n 元语法计数表非常庞大，并且相对于 n 几乎呈指数级增长。例如，1.4 万亿代币语料库的 5 克计数表将消耗 28 TB 的磁盘空间。因此，以前的 n-gram LM 仅限于非常小的 n，最常见的是 n = 5，并且仅限于频繁的 n-gram（例如，Franz & Brants (2006)）。正如我们在图 1 中所示并将在第 4 节中进一步量化的那样，小 n 的问题是它丢弃了更丰富的上下文，使得此类 n 元语言模型对未来标记的预测能力很差。

∞-gram LM. The ∞-gram LM is a generalization of the n-gram LM, where conceptually we start backing off from n = ∞. We use a variant of backoff: we backoff only when the denominator is zero. This means we stop backing off as soon as the denominator becomes positive, upon which the numerator might still be zero. On an instance-wise basis, the effective n is equal to one plus the length of the prompt’s longest suffix that appears in the training data.

∞-克 LM。 ∞-gram LM 是 n-gram LM 的推广，从概念上讲，我们从 n = ∞ 开始后退。我们使用退避的变体：仅当分母为零时才退避。这意味着一旦分母变为正数，我们就停止后退，分子可能仍然为零。在实例方面，有效 n 等于一加上训练数据中出现的提示最长后缀的长度。

For the rest of this paper, we will use “∞-gram” to refer to the ∞-gram LM. ∞-gram is formally defined as

在本文的其余部分，我们将使用“∞-gram”来指代 ∞-gram LM。 ∞-gram 的正式定义为

cnt(wi−(n−1):i−1wi | D)

P∞(wi | w1:i−1) =

cnt(wi−(n−1):i−1 | D)

where w1:i−1 are all tokens preceding wi in the document, and

n = max{n′ ∈[1, i] | cnt(wi−(n′−1):i−1 | D) > 0}.

Unlike Katz backoff, P∞(∗|w1:i−1) is a valid distribution by construction and does not require discounting. This is because the effective n is solely dependent on w1:i−1 and does not depend on wi, and ∑wi∈V cnt(wi−(n−1):i−1wi | D) = cnt(wi−(n−1):i−1 | D).

与 Katz 退避不同，P∞(*|w1:i−1) 是构造上的有效分布，不需要折扣。这是因为有效n仅依赖于w1:i−1而不依赖于wi，并且Σwi∈V cnt(wi−(n−1):i−1wi | D) = cnt(wi−(n−1):i−1 | D)。

Further, we define the sparsity of this ∞-gram estimate: an estimate is sparse iff P(wi|wi−(n−1):i−1) = 1 for one of the wi ∈V, and is zero for all other tokens in the vo- cabulary. Intuitively, this means there is only one possible next token given this context, according to the training data. As we will show in §4, sparse estimates are more predictive of the actual tokens than non-sparse ones.

此外，我们定义了这个 ∞-gram 估计的稀疏性：对于 wi ∈V 之一，当且仅当 P(wi|wi−(n−1):i−1) = 1 时，估计是稀疏的，并且对于词汇表中的所有其他标记为零。直观上，这意味着根据训练数据，在给定的上下文中只有一个可能的下一个标记。正如我们将在第 4 节中展示的，稀疏估计比非稀疏估计更能预测实际标记。

Interpolating with neural LMs. ∞-gram estimates contain zero probabilities, which may lead to infinite perplexity. We do not attempt to compute the perplexity of the ∞-gram itself. Instead, we interpolate it with neural LMs and show perplexity improvement over the neural LMs alone (§5). The combined model is

使用神经 LM 进行插值。 ∞-gram 估计包含零概率，这可能会导致无限的困惑。我们不尝试计算 ∞-gram 本身的复杂度。相反，我们用神经 LM 对其进行插值，并显示出相对于单独的神经 LM 的困惑度改进（第 5 节）。组合模型为

P(y | x) = λP∞(y | x) + (1 −λ)Pneural(y | x),

where λ ∈[0, 1] is a hyperparameter.

3

<!-- page 4 of 26 -->

Published as a conference paper at COLM 2024

Figure 2: Left: the suffix array for a toy string. Right: illustration of the suffix array in the infini-gram index, with N = 4 tokens in the dataset.

3 Infini-gram: A Performant Engine for n-gram/∞-gram Queries · 高性能n-gram/∞-gram查询引擎

We train ∞-gram on modern, trillion-token text corpora. However, it is practically infeasible to build n-gram count tables with unbounded n for such massive datasets. In this section, we describe our infini-gram engine that processes n-gram/∞-gram queries efficiently. Infini- gram is powered by a data structure called suffix array. We will show how to build this suffix array index and how to perform n-gram/∞-gram inferences with it.

我们在现代的万亿级文本语料库上训练 ∞-gram。然而，对于如此庞大的数据集，构建具有无限 n 的 n 元语法计数表实际上是不可行的。在本节中，我们将描述高效处理 n 元/无穷元元查询的无限元语法引擎。 Infinigram 由称为后缀数组的数据结构提供支持。我们将展示如何构建此后缀数组索引以及如何用它执行 n-gram/∞-gram 推理。

Suffix array. The essence of n-gram and ∞-gram LMs is counting a given n-gram in the training data. As such, we leverage the suffix array data structure, which is originally designed for efficiently counting the number of times a given “needle” string (length L) appears as substring of a huge “haystack” string (length N). When the suffix array is built for a haystack string, counting a given needle string has time complexity O(L + log N).

后缀数组。 n-gram 和 Infini-gram LM 的本质是对训练数据中给定的 n-gram 进行计数。因此，我们利用后缀数组数据结构，该结构最初是为了有效地计算给定“needle”字符串（长度 L）作为巨大“haystack”字符串（长度 N）的子字符串出现的次数而设计的。当为干草堆字符串构建后缀数组时，计算给定的针串的时间复杂度为 O(L + log N)。

A suffix array represents the lexicographical ordering of all suffixes of an array (or a string, which is an array of characters). For an array of length N, the suffix array contains N unique integers, where the i-th element is the starting position of the suffix ranked i-th among all suffixes. Figure 2 (left) shows the suffix array for a toy string, aabaca.

后缀数组表示数组（或字符串，即字符数组）的所有后缀的字典顺序。对于长度为 N 的数组，后缀数组包含 N 个唯一整数，其中第 i 个元素是所有后缀中排名第 i 的后缀的起始位置。图 2（左）显示了玩具字符串 aabaca 的后缀数组。

As shown in Figure 2 (right), we build the suffix array on the byte array of the tokenized dataset (i.e., token array). Documents are separated by the \xff\xff token. In the token array, each consecutive two bytes represent a token ID (assuming that |V| < 216 = 65536). Given that the dataset has N tokens, the token array has 2N bytes. The suffix array contains N elements, each pointing to a token in the token array by storing its byte offset. Every tokens in the token array appears exactly once in the suffix array. Each pointer can be stored with ⌈log2(2N)/8⌉bytes. For corpora with 2B to 500B tokens (which is the range we deal with, after sharding (§A.3)), this is 5 bytes per pointer, and thus the suffix array has 5N bytes. Therefore, the combined size of token array and suffix array (i.e., the infini-gram index) is 7N bytes.

如图 2（右）所示，我们在标记化数据集的字节数组（即标记数组）上构建后缀数组。文档由 \xff\xff 标记分隔。在令牌数组中，每连续两个字节代表一个令牌ID（假设|V| < 216 = 65536）。假设数据集有 N 个 token，则 token 数组有 2N 个字节。后缀数组包含 N 个元素，每个元素通过存储其字节偏移量来指向令牌数组中的一个令牌。令牌数组中的每个令牌在后缀数组中只出现一次。每个指针可以存储⌈log2(2N)/8⌉字节。对于具有 2B 到 500B 标记的语料库（这是我们在分片（§A.3）之后处理的范围），每个指针 5 个字节，因此后缀数组有 5N 个字节。因此，令牌数组和后缀数组（即无限元索引）的总大小为 7N 字节。

Building the suffix array. Suffix arrays can be built in linear time with respect to the size of the token array (K¨arkk¨ainen et al., 2006). We adapted from the suffix array implementation in Lee et al. (2022) and further optimized it for efficiency. It took us ∼48 hours to build the suffix array for RedPajama on a single node with 128 CPUs and 1TiB RAM. We have built the suffix arrays for Dolma (3T tokens), RedPajama (1.4T tokens), Pile (380B tokens), and C4 (200B tokens). Since infini-gram indexes are additive (§A.2), together these can be easily combined into a larger index with a total of 5 trillion tokens, and the implicit count table contains at least 2 quadrillion unique n-grams (§A.1).

构建后缀数组。后缀数组可以在相对于令牌数组大小的线性时间内构建（Kárkkěainen 等人，2006）。我们改编自 Lee 等人的后缀数组实现。 （2022）并进一步优化其效率。我们花了约 48 小时在具有 128 个 CPU 和 1TiB RAM 的单个节点上为 RedPajama 构建后缀数组。我们构建了 Dolma（3T 代币）、RedPajama（1.4T 代币）、Pile（380B 代币）和 C4（200B 代币）的后缀数组。由于无限元语法索引是可加的（§A.2），因此它们可以很容易地组合成一个更大的索引，总共包含 5 万亿个标记，并且隐式计数表包含至少 2 万亿个唯一的 n 元语法（§A.1）。

Inference with the suffix array. Computing the n-gram LM probability involves counting the number of occurrences of a token string, i.e., cnt(x1...xn). By construction, the occurrence positions of strings starting with x1...xn lies in a single, consecutive segment in the suffix array. Thus we only need to find the first and last occurrence positions, and the count would be the difference between them. Beyond counting and n-gram/∞-gram language modeling, infini-gram can also be used to retrieve documents containing an n-gram, or a CNF expression with multiple n-grams (§A.4).

使用后缀数组进行推理。计算 n-gram LM 概率涉及计算标记字符串的出现次数，即 cnt(x1...xn)。通过构造，以 x1...xn 开头的字符串的出现位置位于后缀数组中的单个连续段中。因此我们只需要找到第一个和最后一个出现的位置，计数就是它们之间的差值。除了计数和 n-gram/∞-gram 语言建模之外，infini-gram 还可以用于检索包含 n-gram 的文档，或具有多个 n-gram 的 CNF 表达式（§A.4）。

4

<!-- page 5 of 26 -->

Published as a conference paper at COLM 2024

During inference, the entire infini-gram index can stay on-disk, which minimizes the compute resources needed (no GPU, and minimal CPU / RAM). In §A.4, we discuss several optimization techniques applied to the inference engine: parallelized shard processing, hinted search, memory pre-fetching, fast effective-n lookup, and amortized query processing. On RedPajama, our most optimized infini-gram engine can count a given n-gram with an average latency of less than 20 milliseconds. It can compute the probability and next- token distribution in 40 milliseconds for n-gram LMs, and in 200 milliseconds for the ∞-gram. See §A.5 for the full list of supported query types and additional details on latency benchmarking.

在推理过程中，整个 infini-gram 索引可以保留在磁盘上，从而最大限度地减少所需的计算资源（无需 GPU，并且 CPU / RAM 最少）。在§A.4中，我们讨论了应用于推理引擎的几种优化技术：并行分片处理、提示搜索、内存预取、快速有效n查找和摊销查询处理。在 RedPajama 上，我们最优化的 infini-gram 引擎可以对给定的 n-gram 进行计数，平均延迟小于 20 毫秒。对于 n-gram LM，它可以在 40 毫秒内计算出概率和下一个标记分布；对于 Infini-gram，它可以在 200 毫秒内计算出概率和下一个标记分布。有关支持的查询类型的完整列表以及有关延迟基准测试的其他详细信息，请参阅§A.5。

4 Analyzing Human-written and Machine-generated Text using ∞-gram · 用∞-gram分析人类与机器文本

In this section, we present some analyses of human-written and machine-generated text from the perspective of ∞-gram, mostly focusing on the token-wise agreement between ∞-gram’s prediction and the actual text. In summary, we found that:

在本节中，我们从 Infinity-gram 的角度对人类编写的和机器生成的文本进行一些分析，主要关注 Infinity-gram 的预测与实际文本之间的 token-wise 一致性。综上所述，我们发现：

1. ∞-gram has a fairly high accuracy (47%) when predicting the next token given a prefix of a human-written document, and this accuracy is higher when a longer suffix of the prompt can be used (i.e., when the effective n is larger);

1. 在给定人工编写文档的前缀的情况下预测下一个标记时，∞-gram 具有相当高的准确度（47%），并且当可以使用较长的提示后缀时（即，当有效 n 较大时），该准确度更高；

2. Conventional n-gram LMs (n ≤5) are insufficient for capturing a long enough context to determine the next token, while our ∞-gram method is highly predictive of human- written and machine-generated text;

2. 传统的 n-gram LM (n ≤ 5) 不足以捕获足够长的上下文来确定下一个标记，而我们的 ∞-gram 方法可以高度预测人类编写的和机器生成的文本；

3. ∞-gram has significant potential to complement and improve neural LMs when predict- ing human-written text (which we further investigate in §5);

3. 在预测人类书写的文本时，∞-gram 具有补充和改进神经语言模型的巨大潜力（我们将在第 5 节中进一步研究）；

4. When plotting the agreement level with respect to the suffix length, text generated by neural LMs with nucleus sampling is most similar to human-written text, among other decoding methods like greedy decoding and temperature sampling. For greedy decoding, the agreement plot suffers from significant fluctuation, which may be rooted in deficiencies in neural LM pretraining and the positional embeddings of Transformers.

4. 在绘制相对于后缀长度的一致性水平时，除了贪婪解码和温度采样等其他解码方法之外，采用核采样的神经语言模型生成的文本与人类书写的文本最相似。对于贪婪解码，一致性图会出现明显的波动，这可能源于神经 LM 预训练和 Transformer 位置嵌入的缺陷。

∞-gram training data. For analyses in this section, we use a decontaminated version of Pile’s training set (“Pile-train”) (Gao et al., 2020) as training data for the ∞-gram. We built an infini-gram index on Pile-train using the Llama-2 tokenizer (Touvron et al., 2023b), and yield 360 billion tokens.

∞-gram 训练数据。对于本节的分析，我们使用 Pile 训练集的净化版本（“Pile-train”）（Gao 等人，2020）作为 ∞-gram 的训练数据。我们使用 Llama-2 分词器（Touvron 等人，2023b）在 Pile-train 上构建了无限克索引，并产生了 3600 亿个代币。

Decontamination. It is important that the training data is decontaminated against the evaluation data, because otherwise it is very easy for ∞-gram to cheat by copying from the very same document in the training data. We run decontamination of Pile-train against its validation and test sets (“Pile-val” and “Pile-test”, which we will use for evaluation below and also in §5), using the method from Groeneveld (2023) that filters out a document if it has excessive n-gram overlap with the evaluation data. See §B for more details.

去污。重要的是，训练数据要针对评估数据进行净化，否则 ∞-gram 很容易通过从训练数据中的同一文档进行复制来进行欺骗。我们根据其验证和测试集（“Pile-val”和“Pile-test”，我们将在下面和第 5 节中使用它们进行评估）对 Pile-train 进行净化，使用 Groeneveld (2023) 的方法，如果文档与评估数据有过多的 n-gram 重叠，则过滤掉该文档。有关详细信息，请参阅§B。

Decontamination is non-trivial, and its definition could vary (e.g., when there is an identical sentence, is it contamination, or is it a quote that naturally occurs in real test-time scenarios?) Thus we followed the standard best practices for decontamination.

去污并非微不足道，其定义可能会有所不同（例如，当存在相同的句子时，是污染，还是真实测试场景中自然出现的引用？）因此，我们遵循去污的标准最佳实践。

4.1 Human-written text · 人类文本

Setup. We use Pile-val set as the human-written text. For this analysis, we sampled 50 documents from each domain of Pile-val, and truncated each document to 1024 tokens (so the total number of tokens per domain is about 50k). We aggregate results from all domains.

设置。我们使用 Pile-val 集作为人类编写的文本。对于此分析，我们从 Pile-val 的每个域中采样了 50 个文档，并将每个文档截断为 1024 个标记（因此每个域的标记总数约为 50k）。我们汇总所有领域的结果。

We measure the token-wise agreement between ∞-gram’s prediction and the actual human- written text. Since computing the full next-token distribution (or the argmax of it) in ∞-gram is relatively slow, we compute the ∞-gram probability of the actual next-token, and deem it as accurate if this probability is higher than 0.5. (This is a lower-bound of argmax accuracy, though the gap is small.) We further categorize all tokens by their effective n, i.e., one plus the length of their prompt’s longest suffix that has a non-zero count in the training data.

我们测量 ∞-gram 的预测与实际的人类书写文本之间的 token-wise 一致性。由于计算 Infinity-gram 中完整的 next-token 分布（或其 argmax）相对较慢，因此我们计算实际 next-token 的 Infinity-gram 概率，并且如果该概率高于 0.5，则认为它是准确的。 （这是 argmax 准确率的下限，尽管差距很小。）我们进一步根据有效 n 对所有标记进行分类，即，一加上其提示的最长后缀的长度，该后缀在训练数据中具有非零计数。

5

<!-- page 6 of 26 -->

Published as a conference paper at COLM 2024

Figure 3: Token-wise agreement between human-written text and n-gram/∞-gram LMs.

Figure 4: Distribution of probabilities assigned by neural LMs to human-written text tokens, and ∞-gram’s agreement with these tokens. Takeaway: ∞-gram and neural LMs are predictive of actual human text on different tokens, and thus ∞-gram estimates – especially sparse ∞-gram estimates – can be used to complement neural LMs. See Figure 8 for extended results on Llama-2 13B/7B models.

For each category, we visualize the number of such tokens (in gray bars) as well as the agreement level (in green dots) in the middle plot of Figure 3.

对于每个类别，我们在图 3 的中间图中可视化了此类标记的数量（以灰色条表示）以及一致程度（以绿点表示）。

Results. Overall, ∞-gram agrees with the human-written text on 47% of the tokens. We see that ∞-gram becomes more accurate with the increase of effective n: when the effective n ≥16, agreement is higher than 75%. Further analysis (Appendix Figure 7) shows that the count of this longest suffix in the training data does not affect agreement substantially.

结果。总体而言，∞-gram 在 47% 的标记上与人类编写的文本一致。我们看到，随着有效n的增加，∞-gram变得更加准确：当有效n≥16时，一致性高于75%。进一步分析（附录图7）表明，训练数据中最长后缀的计数不会对一致性产生实质性影响。

In the left plot of Figure 3, we show the same analysis for a 5-gram LM trained on the same data, and it has much lower agreement than the ∞-gram. 5-gram LMs, which has been used extensively in previous literature (Franz & Brants, 2006; Aiden & Michel, 2011), does not capture a long enough context to correctly predict the next token: over 90% tokens in the evaluation data has an effective n of at least 5, and the ∞-gram analysis shows that the median of effective n is 7 (and mean is 9.1).

在图 3 的左图中，我们展示了对在相同数据上训练的 5-gram LM 进行的相同分析，它的一致性比 ∞-gram 低得多。 5-gram LM 在之前的文献中得到了广泛使用（Franz & Brants，2006；Aiden & Michel，2011），但它无法捕获足够长的上下文来正确预测下一个标记：评估数据中超过 90% 的标记的有效 n 至少为 5，并且 Infini-gram 分析显示有效 n 的中位数为 7（平均值为 9.1）。

In the right plot of Figure 3, we show the same analysis for only tokens with a sparse ∞-gram estimate, which covers more than 50% of all tokens. The overall agreement is even higher (75%), and when the effective n ≥14, agreement is higher than 80%. This means when the next token is unique according to the training data, that unique token is very likely to be the actual token in human-written text.

在图 3 的右图中，我们仅对具有稀疏 ∞-gram 估计的标记进行了相同的分析，该分析覆盖了所有标记的 50% 以上。整体一致性更高（75%），当有效n≥14时，一致性高于80%。这意味着当根据训练数据下一个标记是唯一的时，该唯一标记很可能是人类编写的文本中的实际标记。

Qualitatively, we found that ∞-gram is often good at completing multi-token words (e.g., hippopotamus, correctly predicted tokens are underlined), common phrases (e.g., born in), and entity names (e.g., educated at Trinity College). ∞-gram is not very good at recalling factual knowledge (e.g., predicting the first token of an entity name), likely due to insufficient contextualization.

定性地，我们发现 ∞-gram 通常擅长完成多标记词（例如，河马，正确预测的标记带有下划线）、常见短语（例如，出生于）和实体名称（例如，在三一学院接受教育）。 ∞-gram 不太擅长回忆事实知识（例如，预测实体名称的第一个标记），可能是由于上下文化不足。

∞-gram can shine where neural LMs fail. In Figure 4, we plot the distribution of probabil- ities assigned by the Llama-2 70B/13B/7B models (Touvron et al., 2023b) to the actual tokens in human-written text, and the human–∞-gram agreement for tokens in each probability bucket. (The higher the assigned probability, the higher agreement Llama-2 has with the actual tokens.) We observe a positive, yet imperfect, correlation between neural LMs and ∞-gram regarding their agreement with the actual text. In particular, when the neural LM performance is very poor (left side of the histogram), ∞-gram still gives a non-trivial agree- ment of above 20%; if only considering tokens with sparse ∞-gram estimates, the agreement is as high as 50%. This indicates a huge potential of complementing and improving the

∞-gram 可以在神经 LM 失败的地方发挥作用。在图 4 中，我们绘制了 Llama-2 70B/13B/7B 模型（Touvron 等人，2023b）分配给人类书写文本中的实际标记的概率分布，以及每个概率桶中标记的人类-∞-gram 一致性。 （分配的概率越高，Llama-2 与实际标记的一致性就越高。）我们观察到神经 LM 和 ∞-gram 与实际文本的一致性之间存在正相关但不完美的相关性。特别是，当神经 LM 性能非常差时（直方图左侧），∞-gram 仍然给出了 20% 以上的不平凡的一致性；如果仅考虑具有稀疏 ∞-gram 估计的标记，则一致性高达 50%。这表明补充和改进的巨大潜力

6

<!-- page 7 of 26 -->

Published as a conference paper at COLM 2024

Figure 5: Token-wise agreement between machine-generated text and ∞-gram. All tokens are considered. See Figure 9 for results on GPT-Neo models.

performance of neural LMs with ∞-gram for predicting human-written text, which we further investigate in §5.

具有 ∞-gram 的神经语言模型在预测人类书写文本方面的性能，我们将在第 5 节中进一步研究。

4.2 Machine-generated text · 机器生成文本

Setup. Similar to the analysis with human-written text, we sampled 50 documents from each domain of Pile-val. We use the first 50 tokens of each document to prompt neural LMs to generate a continuation. Generation continues up to the original length of the document, or when an [EOS] token is generated. We experiment with three decoding methods: greedy decoding, temperature sampling, and nucleus sampling (Holtzman et al., 2019). The neural LMs are Llama-2 70B/13B/7B, GPT-J 6B (Wang & Komatsuzaki, 2021), and GPT-Neo 2.7B/1.3B/125M (Gao et al., 2020). The tokenizer of GPT-Neo/J is different from Llama-2, so we built a separate version of infini-gram index for Pile-train based on the GPT-Neo/J tokenizer.

设置。与对人类书写文本的分析类似，我们从 Pile-val 的每个域中采样了 50 个文档。我们使用每个文档的前 50 个标记来提示神经 LM 生成延续。生成持续到文档的原始长度，或者当生成 [EOS] 令牌时。我们尝试了三种解码方法：贪婪解码、温度采样和核采样（Holtzman et al., 2019）。神经 LM 是 Llama-2 70B/13B/7B、GPT-J 6B (Wang & Komatsuzaki, 2021) 和 GPT-Neo 2.7B/1.3B/125M (Gao et al., 2020)。 GPT-Neo/J 的分词器与 Llama-2 不同，因此我们基于 GPT-Neo/J 分词器为 Pile-train 构建了单独版本的 infini-gram 索引。

Impact of decoding method. The top row of Figure 5 shows results of the three decoding method on the same neural LM – Llama-2 70B. In general, increasing stochasticity shifts the effective n to the smaller side, and also decreases the agreement level. Nucleus sampling has the most similar distribution of effective n compared to human-written text (Figure 3, middle plot), which is probably why nucleus sampling is usually preferred in text generation. Greedy decoding has even higher effective n than human-written text, which implies that greedy decoding could lead to over-memorization of training data as well as lack of diversity.

解码方法的影响。图 5 的顶行显示了同一神经 LM – Llama-2 70B 上的三种解码方法的结果。一般来说，增加随机性会使有效 n 向较小的一侧移动，并且还会降低一致性水平。与人类书写的文本相比，核采样具有最相似的有效 n 分布（图 3，中图），这可能就是为什么核采样通常在文本生成中被首选的原因。贪婪解码的有效 n 甚至比人类编写的文本还要高，这意味着贪婪解码可能会导致训练数据的过度记忆以及缺乏多样性。

Impact of model size. The bottom row of Figure 5 shows the same analysis for different sizes of neural LM under greedy decoding. In general, increasing model size slightly increases the effective n, and also increases the agreement level. This indicates that larger models memorizes more from the training data, and are also more inclined to copy verbatim. The agreement level of GPT-Neo/J models is higher than Llama-2 models, probably because GPT-Neo/J are trained on the same data as the ∞-gram (i.e., Pile-train). Overall, text generated by these neural LMs has similar agreement level with ∞-gram as human text.

模型尺寸的影响。图 5 的底行显示了贪婪解码下不同大小的神经 LM 的相同分析。一般来说，增加模型大小会稍微增加有效 n，并且也会增加一致性水平。这表明较大的模型可以记住更多的训练数据，并且也更倾向于逐字复制。 GPT-Neo/J 模型的一致性水平高于 Llama-2 模型，可能是因为 GPT-Neo/J 与 ∞-gram（即 Pile-train）使用相同的数据进行训练。总体而言，这些神经语言模型生成的文本与人类文本具有相似的 Infini-gram 一致性水平。

One very curious phenomenon is that, as effective n increases, the agreement level fluctuates greatly in greedy decoding (but not nucleus or temperature sampling, where agreement level almost increases monotonically). Such fluctuation is even more rapid for smaller models (Llama-2 13B/7B and GPT-Neo/J models), and for Llama-2 7B the fluctuation is even periodic (rapidly dropping at effective n = 20, 24, 28, 32; this is statistically significant, a two-proportion z-test gives a p-value of < 10−99). We suspect that this may be caused by the application of positional embeddings when pretraining these Transformer-based models, and we welcome further investigation from the community.

一个非常奇怪的现象是，随着有效 n 的增加，贪婪解码中的一致性水平会大幅波动（但不是核采样或温度采样，其中一致性水平几乎单调增加）。对于较小的模型（Llama-2 13B/7B 和 GPT-Neo/J 模型），这种波动甚至更快，而对于 Llama-2 7B，这种波动甚至是周期性的（在有效 n = 20、24、28、32 时快速下降；这在统计上是显着的，两比例 z 检验给出的 p 值 < 10−99）。我们怀疑这可能是由于在预训练这些基于 Transformer 的模型时应用位置嵌入造成的，我们欢迎社区进一步调查。

7

<!-- page 8 of 26 -->

Published as a conference paper at COLM 2024

Neural LM Size Reference Data Validation Test

Neural + ∞-gram Neural + ∞-gram

GPT-2 117M Pile-train 22.82 13.71 (42%) 22.86 13.58 (42%) GPT-2 345M Pile-train 16.45 11.22 (34%) 16.69 11.18 (35%) GPT-2 774M Pile-train 15.35 10.39 (35%) 15.40 10.33 (35%) GPT-2 1.6B Pile-train 14.42 9.93 (33%) 14.61 9.93 (34%)

GPT-Neo 125M Pile-train 13.50 10.76 (22%) 14.08 10.79 (25%) GPT-Neo 1.3B Pile-train 8.29 7.31 (13%) 8.61 7.36 (16%) GPT-Neo 2.7B Pile-train 7.46 6.69 (12%) 7.77 6.76 (15%) GPT-J 6.7B Pile-train 6.25 5.75 (10%) 6.51 5.85 (12%)

Llama-2 7B Pile-train 5.69 5.05 (14%) 5.83 5.06 (16%) Llama-2 13B Pile-train 5.30 4.75 (13%) 5.43 4.76 (15%) Llama-2 70B Pile-train 4.59 4.21 (11%) 4.65 4.20 (12%)

Llama-2 7B Pile-train + RedPajama 5.69 4.66 (22%) 5.83 4.66 (24%) Llama-2 13B Pile-train + RedPajama 5.30 4.41 (21%) 5.43 4.42 (23%) Llama-2 70B Pile-train + RedPajama 4.59 3.96 (18%) 4.65 3.95 (19%)

Table 1: Perplexity (lower is better) on Pile’s validation and test sets. Numbers in parentheses are the relative perplexity improvement. The first eight rows share the same tokenizer, and the last six rows share the same tokenizer.

5 Improving Neural LMs with the ∞-gram · 用∞-gram改进神经语言模型

The results in §4 motivate us to combine neural LMs and ∞-gram (§2) to yield better language models. In this section, we will show strong experimental results of the combined model. In §4 we found that the ∞-gram estimate has higher agreement with human-written text when it is sparse. Therefore, we use two separate interpolation hyperparameters: λ1 for sparse and λ2 for non-sparse ∞-gram estimates. These hyperparameters are tuned on the validation set to minimize the perplexity of the combined model.

第 4 节中的结果激励我们将神经 LM 和 ∞-gram (第 2 节) 结合起来，以产生更好的语言模型。在本节中，我们将展示组合模型的强大实验结果。在第 4 节中，我们发现当稀疏文本时，∞-gram 估计与人类编写的文本具有更高的一致性。因此，我们使用两个单独的插值超参数：用于稀疏的 λ1 和用于非稀疏 ∞-gram 估计的 λ2。这些超参数在验证集上进行调整，以最大限度地减少组合模型的复杂性。

5.1 Experimental setup · 实验设置

Evaluation and metric. We measure the perplexity of each model on Pile’s validation and test sets, as well as the relative improvement of perplexity between models. To show generalization, we also evaluate on time-shifted data (i.e., data created after the cutoff date of the ∞-gram training data). The relative improvement of model M against model Mo is defined as (1 −PPL(M)−1

评估和度量。我们在 Pile 的验证集和测试集上测量每个模型的困惑度，以及模型之间困惑度的相对改进。为了展示概括性，我们还评估时移数据（即在 ∞-gram 训练数据的截止日期之后创建的数据）。模型 M 相对于模型 Mo 的相对改进定义为 (1 −PPL(M)−1

PPL(Mo)−1) × 100%, which is the percentage of perplexity gap closed towards perfect language modeling (i.e., PPL = 1). Additional details on evaluation data processing in §D.1.

PPL(Mo)−1) × 100%，这是接近完美语言建模的困惑度差距的百分比（即 PPL = 1）。有关评估数据处理的更多详细信息，请参阅 §D.1。

Reference data. To reduce confusion, in this section we will use reference data to refer to the training data of the ∞-gram. In addition to Pile’s training set that we used in the previous analyses (§4), we also consider RedPajama (Together, 2023) as reference data. The decontaminated Pile-train and Redpajama have 360 billion and 1.4 trillion tokens, respectively, summing up to 1.8 trillion tokens (based on the Llama-2 tokenizer). We later perform ablations on varying sizes and domains of the reference data.

参考数据。为了减少混淆，在本节中我们将使用参考数据来指代 ∞-gram 的训练数据。除了我们在之前的分析（§4）中使用的 Pile 训练集之外，我们还考虑 RedPajama（Together，2023）作为参考数据。净化后的 Pile-train 和 Redpajama 分别拥有 3600 亿个和 1.4 万亿个代币，总计达 1.8 万亿个代币（基于 Llama-2 代币器）。我们稍后对不同大小和域的参考数据进行消融。

Neural LMs. We use a range of large, competitive neural LMs, both as baselines and as models to interpolate with the ∞-gram. In total, 14 models are considered: GPT-2 117M/345M/774M/1.6B (Radford et al., 2019), GPT-Neo 125M/1.3B/2.7B, GPT-J-6B, Llama- 2 7B/13B/70B, and SILO PD/PDSW/PDSWBY (Min et al., 2023a). See §D.1 for additional details about these models and their training data.

神经 LM。我们使用一系列大型的、有竞争力的神经语言模型，既作为基线，又作为模型来使用 ∞-gram 进行插值。总共考虑了 14 个模型：GPT-2 117M/345M/774M/1.6B (Radford et al., 2019)、GPT-Neo 125M/1.3B/2.7B、GPT-J-6B、Llama- 2 7B/13B/70B 和 SILO PD/PDSW/PDSWBY (Min et al., 2019) 2023a）。有关这些模型及其训练数据的更多详细信息，请参阅§D.1。

Tokenizers. Among these models, GPT-2, GPT-Neo and GPT-J share the same tokenizer, but Llama-2 and SILO use different tokenizers. We therefore built three versions of the infini-gram index on Pile-train and RedPajama, one for each tokenizer. Due to the tokenizer variation, the perplexity of GPT-2, GPT-Neo and GPT-J are comparable to each other, but perplexity of Llama-2 and SILO are not comparable to them nor to each other.

分词器。在这些模型中，GPT-2、GPT-Neo 和 GPT-J 共享相同的分词器，但 Llama-2 和 SILO 使用不同的分词器。因此，我们在 Pile-train 和 RedPajama 上构建了三个版本的 infini-gram 索引，每个分词器对应一个版本。由于分词器的变化，GPT-2、GPT-Neo 和 GPT-J 的困惑度彼此具有可比性，但 Llama-2 和 SILO 的困惑度彼此之间没有可比性。

8

<!-- page 9 of 26 -->

Published as a conference paper at COLM 2024

Neural LM Validation Test

Neural + ∞-gram + kNN-LM† + RIC-LM† Neural + ∞-gram + kNN-LM† + RIC-LM†

Eval data: Wikipedia Silo PD 26.60 15.30 (43%) 20.62 27.91 28.42 14.44 (51%) – – Silo PDSW 18.93 12.36 (36%) 14.10 18.90 20.02 11.84 (43%) 14.5 19.4 Silo PDSWBY 10.66 8.77 (19%) 10.14 10.87 10.76 8.41 (24%) – – Pythia 9.00 – 8.50 8.84 9.1 – – –

Eval data: Enron Emails Silo PD 19.56 6.31 (70%) 8.56 15.45 15.71 4.85 (73%) – – Silo PDSW 14.66 5.58 (65%) 6.70 10.80 11.23 4.35 (66%) 5.9 9.9 Silo PDSWBY 14.67 5.61 (65%) 7.24 10.91 11.52 4.44 (66%) – – Pythia 7.577 – 4.99 6.16 6.9 – – –

Eval data: NIH ExPorters Silo PD 27.46 16.26 (41%) 19.27 25.51 27.94 16.00 (44%) – – Silo PDSW 19.35 12.70 (35%) 14.95 18.35 19.12 12.39 (37%) 15.0 18.5 Silo PDSWBY 15.01 10.62 (30%) 12.33 14.29 14.81 10.33 (32%) – – Pythia 11.20 – 11.20 10.83 11.1 – – –

Table 2: Perplexity (the lower the better) on the validation and the test datasets of the Wikipedia, Enron Emails, and NIH ExPorters of the Pile. All neural models are 1.3B models, and the reference data is always the Pile. ■indicates in-domain; ■indicates out-of-domain; ■indicates out-of-domain but has relevant data in-domain, all with respect to the training data of the neural LM. †: Results retrived from Min et al. (2023a), which use much smaller reference data: 45-million to 1.2-billion tokens, compared to our 360-billion tokens.

5.2 Results · 结果

Experimental results with GPT-2, GPT-Neo/J, and Llama-2 on Pile’s evaluation sets are shown in Table 1. Results on time-shifted data can be found in §D.2, and we show the impact of the size and domain of reference data in §D.3.

GPT-2、GPT-Neo/J 和 Llama-2 在 Pile 评估集上的实验结果如表 1 所示。时移数据的结果可以在 §D.2 中找到，我们在 §D.3 中展示了参考数据的大小和域的影响。

Interpolating with ∞-gram greatly and consistently improves the perplexity of neural LMs. The magnitude of improvement trends smaller as the neural LM size grows within the same family, while the largest models can still benefit a lot from our method (e.g., Pile-train alone improves Llama-2 70B by 12%).

使用 Infinity-gram 插值可以极大地持续改善神经 LM 的复杂性。随着同一系列中神经 LM 大小的增长，改进的幅度趋于较小，而最大的模型仍然可以从我们的方法中受益匪浅（例如，仅 Pile-train 就将 Llama-2 70B 改进了 12%）。

However, this trend does not hold across different families of LMs. For example, ∞-gram can improve GPT-2 1.6B by 34%, but only improves a smaller model, GPT-Neo 1.3B, by 16%. This may be because GPT-Neo/J models are trained precisely on Pile, while GPT-2 models are not. ∞-gram works better when the reference data distribution differs from, or complements, the pretraining data distribution, which emphasizes the importance of data diversity. Meanwhile, the fact that ∞-gram also improves neural LMs already pretrained on its reference data shows that there is consistent advantage in introducing ∞-gram.

然而，这种趋势并不适用于不同的 LM 系列。例如，∞-gram 可以将 GPT-2 1.6B 提高 34%，但只能将较小的模型 GPT-Neo 1.3B 提高 16%。这可能是因为 GPT-Neo/J 模型是在 Pile 上精确训练的，而 GPT-2 模型则不然。当参考数据分布与预训练数据分布不同或互补时，∞-gram 效果更好，这强调了数据多样性的重要性。同时，事实上 Infinity-gram 还改进了已经在其参考数据上预训练的神经 LM，这表明引入 Infinity-gram 具有一致的优势。

On the choice of ∞-gram reference data, the union of Pile-train and RedPajama yields larger improvements on the Llama-2 models than Pile-train alone. The combination of Llama-2 13B and ∞-gram with Pile-train + RedPajama outperforms Llama-2 70B, and interpolating with ∞-gram pushes the perplexity of Llama-2 70B below 4.0.

在 ∞-gram 参考数据的选择上，Pile-train 和 RedPajama 的结合比单独使用 Pile-train 对 Llama-2 模型产生了更大的改进。 Llama-2 13B 和 Infini-gram 与 Pile-train + RedPajama 的组合优于 Llama-2 70B，并且使用 Infini-gram 进行插值将 Llama-2 70B 的困惑度推至 4.0 以下。

When the neural LM is SILO (which is trained on permissive-licensed data only and thus has less training data), adding the ∞-gram component is more helpful when SILO is trained on more restrictive data (i.e., PD > PDSW > PDSWBY). The usage of ∞-gram can be precisely traced back to the contributing document(s) in the reference data, which is in-line with the philosophy of SILO: to allow crediting the source data when using them for language modeling. When compared to the existing retrieval-augmentation methods used by SILO, i.e., kNN-LM and RIC-LM, ∞-gram yields better improvement in perplexity. Therefore, ∞-gram can serve as a better alternative as the retrieval-augmentation method for SILO.

当神经 LM 为 SILO（仅在许可数据上进行训练，因此训练数据较少）时，当 SILO 在更严格的数据上进行训练时（即 PD > PDSW > PDSWBY），添加 ∞-gram 组件会更有帮助。 ∞-gram 的使用可以精确地追溯到参考数据中的贡献文档，这符合 SILO 的理念：允许在使用源数据进行语言建模时归功于源数据。与 SILO 使用的现有检索增强方法（即 kNN-LM 和 RIC-LM）相比，∞-gram 在困惑度方面有更好的改善。因此，∞-gram 可以作为 SILO 的检索增强方法更好的替代方案。

A note on text generation. While ∞-gram can be interpolated with neural LMs and greatly improve their perplexity, our preliminary experiments show that such method might not be helpful, and even harmful, to open-ended text generation tasks. During generation,

关于文本生成的注释。虽然 ∞-gram 可以用神经 LM 进行插值并大大提高其复杂度，但我们的初步实验表明，这种方法对于开放式文本生成任务可能没有帮助，甚至有害。在一代人的过程中，

9

<!-- page 10 of 26 -->

Published as a conference paper at COLM 2024

∞-gram can make odd mistakes (e.g., predicting totally irrelevant tokens) which makes the model to digress. Thus this combined model is not ready to replace neural LMs. Additional investigation is required to make ∞-gram best contribute to text generation.

∞-gram 可能会犯一些奇怪的错误（例如，预测完全不相关的标记），从而使模型偏离主题。因此，这个组合模型还没有准备好取代神经语言模型。需要进行额外的研究才能使 Infini-gram 对文本生成做出最大贡献。

6 Related Work · 相关工作

We discuss closely related work here. See §E for extended discussion, and Table 6 for comparison with other n-gram models and nonparametric language models.

我们在这里讨论密切相关的工作。请参阅§E 进行扩展讨论，并参阅表 6 与其他 n 元模型和非参数语言模型进行比较。

n-gram language models. n-gram has been one of the most classical language modeling methods since the inception of natural language processing (Jurafsky & Martin, 2000). People have been pushing the limits of n-gram LMs by scaling up its training data. To date, the largest n-gram table (Brants et al., 2007) counts 5-grams in a corpus of 2 trillion tokens.

n-gram 语言模型。自自然语言处理诞生以来，n-gram 一直是最经典的语言建模方法之一（Jurafsky & Martin，2000）。人们一直在通过扩展训练数据来突破 n 元语言模型的极限。迄今为止，最大的 n-gram 表（Brants et al., 2007）统计了 2 万亿个 token 的语料库中的 5-gram。

While n-gram LMs are currently largely surpassed by neural LMs, there has been recent work that revisit n-grams and n-gram LMs. Mikolov & Zweig (2012) finds that interpolating with a 5-gram Kneser-Ney model improves the perplexity of RNN models, whereas Khandelwal et al. (2020) finds that interpolating n-gram models with Transformers does not improve perplexity substantially. Li et al. (2022) finds that the n-gram model is as competitive as a small neural LM, and training a neural model to be complementary to the n-gram model and using both at inference time outperforms the neural-only LM. However, both use limited reference data (101M tokens) and compare with small neural LMs (117–250M parameters). Some prior work has found value in scaling up the n-gram training data (Allamanis & Sutton, 2013).

虽然 n-gram LM 目前在很大程度上被神经 LM 超越，但最近有一些工作重新审视了 n-gram 和 n-gram LM。 Mikolov 和 Zweig (2012) 发现使用 5 克 Kneser-Ney 模型进行插值可以改善 RNN 模型的复杂性，而 Khandelwal 等人则发现使用 5 克 Kneser-Ney 模型进行插值可以提高 RNN 模型的复杂度。 (2020) 发现使用 Transformer 插值 n-gram 模型并不能显着改善困惑度。李等人。 (2022) 发现 n-gram 模型与小型神经 LM 一样具有竞争力，并且训练一个神经模型以与 n-gram 模型互补并在推理时使用两者，其性能优于纯神经 LM。然而，两者都使用有限的参考数据（101M 令牌）并与小型神经 LM（117-250M 参数）进行比较。之前的一些工作发现了扩大 n-gram 训练数据的价值（Allamanis & Sutton，2013）。

Our work scales up the training data of n-gram LMs to trillions of tokens. With the addition of scaling up the value of n in the n-gram, our model can significantly improve state-of-the- art neural models as large as 70B.

我们的工作将 n-gram LM 的训练数据扩展到数万亿个 token。通过增加 n 元语法中 n 的值，我们的模型可以显着改进最先进的神经模型，最大可达 70B。

Unbounded n-grams, suffix arrays, suffix trees. Previous work has explored using suffix- based data structures to enable n-gram queries with unbounded n, with limited scale of the training data. Stehouwer & van Zaanen (2010) proposes to use suffix arrays for ∞-gram, and yet their formulation does not yield proper probability distributions and, consequently, a language model. Kennington et al. (2012) proposes to use suffix trees for the same purpose, and yet the storage overhead of suffix trees is very high such that it hinders scaling, which may be mitigated with highly intricate compression techniques (Shareghi et al., 2015). Among the three aforementioned papers, only the third evaluates on the general language modeling task, and the perplexity numbers are too high to be practically useful. Our training data is 500x larger than the largest one in these previous work.

无界 n 元语法、后缀数组、后缀树。之前的工作已经探索使用基于后缀的数据结构来实现具有无限 n 的 n 元语法查询，并且训练数据的规模有限。 Stehouwer & van Zaanen (2010) 提出对 ∞-gram 使用后缀数组，但他们的公式并没有产生正确的概率分布，因此也没有产生语言模型。肯宁顿等人。 (2012) 提出使用后缀树来达到相同的目的，但后缀树的存储开销非常高，以至于阻碍了扩展，这可以通过高度复杂的压缩技术来缓解(Shareghi et al., 2015)。在上述三篇论文中，只有第三篇论文评估了通用语言建模任务，并且困惑度数字太高而无法实际使用。我们的训练数据比之前工作中最大的训练数据大 500 倍。

Nonparametric language models. Nonparametric LMs refer to LMs whose complexity is not bounded a priori, because the complexity can change according to the reference data (Khandelwal et al., 2020; Borgeaud et al., 2022; Asai et al., 2023). The ∞-gram LM is one instance of nonparametric LMs, and its simplicity makes it possible to significantly scale the reference data with modest resources (§3). To the best of our knowledge, our ∞-gram LM is the largest in both the size of the reference data (5 trillion tokens) and the size of the base neural LM (70B).

非参数语言模型。非参数 LM 是指其复杂性不受先验限制的 LM，因为复杂性可以根据参考数据而变化（Khandelwal et al., 2020; Borgeaud et al., 2022; Asai et al., 2023）。 ∞-gram LM 是非参数 LM 的一个实例，其简单性使得可以使用适度的资源显着扩展参考数据（第 3 节）。据我们所知，我们的 ∞-gram LM 在参考数据的大小（5 万亿标记）和基础神经 LM 的大小 (70B) 方面都是最大的。

7 Conclusion · 结论

In this paper, we modernized the classical n-gram language model by scaling it up to a trillion tokens and extending to unbounded n. We presented the infini-gram engine that performs efficient training and inference under this extreme setup. We also proposed the ∞-gram language model, powered by the infini-gram engine, and showed that it can offer novel insights into human-written and machine-generated text and can improve existing neural language models.

在本文中，我们通过将经典 n-gram 语言模型扩展到一万亿个标记并扩展到无界 n，对它进行了现代化改造。我们提出了无限元语法引擎，可以在这种极端设置下执行高效的训练和推理。我们还提出了由 infini-gram 引擎提供支持的 Infini-gram 语言模型，并表明它可以为人类编写和机器生成的文本提供新颖的见解，并可以改进现有的神经语言模型。

10

<!-- page 11 of 26 -->

Published as a conference paper at COLM 2024

Acknowledgments

We would like to thank Zexuan Zhong, Mike Lewis, Yanai Elazar, Will Merrill, Tim Dettmers, Ximing Lu, Alisa Liu, Weijia Shi, Xiaochuang Han, members of the H2lab, and Ziqi Ma for their invaluable feedback.

我们要感谢 Zexuan Zhu、Mike Lewis、Yanai Elazar、Will Merrill、Tim Dettmers、Ximing Lu、Alisa Liu、Weijia Shi、Xiaochuang Han、H2lab 成员和 Ziqi Ma 提供的宝贵反馈。

References

Erez Lieberman Aiden and Jean-Baptiste Michel. Quantitative analysis of culture using mil-

lions of digitized books. Science, 331:176 – 182, 2011. URL https://api.semanticscholar. org/CorpusID:40104730.

Miltiadis Allamanis and Charles Sutton. Mining source code repositories at massive scale

using language modeling. 2013 10th Working Conference on Mining Software Repositories (MSR), pp. 207–216, 2013. URL https://api.semanticscholar.org/CorpusID:1857729.

Akari Asai, Sewon Min, Zexuan Zhong, and Danqi Chen. Acl 2023 tutorial: Retrieval-based

language models and applications. ACL 2023, 2023.

Akari Asai, Zexuan Zhong, Danqi Chen, Pang Wei Koh, Luke Zettlemoyer, Hanna Hajishirzi,

and Wen tau Yih. Reliable, adaptable, and attributable language models with retrieval. 2024. URL https://api.semanticscholar.org/CorpusID:268248911.

Alexei Baevski and Michael Auli. Adaptive input representations for neural language

modeling. In Proceedings of the International Conference on Learning Representations, 2019.

Sebastian Borgeaud, Arthur Mensch, Jordan Hoffmann, Trevor Cai, Eliza Rutherford, Katie

Millican, George Bm Van Den Driessche, Jean-Baptiste Lespiau, Bogdan Damoc, Aidan Clark, et al. Improving language models by retrieving from trillions of tokens. In Proceedings of the International Conference of Machine Learning, 2022.

T. Brants, Ashok Popat, Peng Xu, Franz Josef Och, and Jeffrey Dean. Large language models

in machine translation. In Conference on Empirical Methods in Natural Language Processing, 2007. URL https://api.semanticscholar.org/CorpusID:633992.

Charlie Chen, Sebastian Borgeaud, Geoffrey Irving, Jean-Baptiste Lespiau, L. Sifre, and

John M. Jumper. Accelerating large language model decoding with speculative sam- pling. ArXiv, abs/2302.01318, 2023. URL https://api.semanticscholar.org/CorpusID: 256503945.

Jesse Dodge, Ana Marasovic, Gabriel Ilharco, Dirk Groeneveld, Margaret Mitchell, and

Matt Gardner. Documenting large webtext corpora: A case study on the colossal clean crawled corpus. In Conference on Empirical Methods in Natural Language Processing, 2021. URL https://api.semanticscholar.org/CorpusID:237568724.

Yanai Elazar, Akshita Bhagia, Ian Magnusson, Abhilasha Ravichander, Dustin Schwenk,

Alane Suhr, Pete Walsh, Dirk Groeneveld, Luca Soldaini, Sameer Singh, Hanna Hajishirzi, Noah A. Smith, and Jesse Dodge. What’s in my big data? ArXiv, abs/2310.20707, 2023. URL https://api.semanticscholar.org/CorpusID:264803575.

Alex Franz and Thorsten Brants. All our n-gram are belong to you. Google Machine Translation Team, 20, 2006. URL https://blog.research.google/2006/08/ all-our-n-gram-are-belong-to-you.html.

Leo Gao, Stella Biderman, Sid Black, Laurence Golding, Travis Hoppe, Charles Foster, Jason

Phang, Horace He, Anish Thite, Noa Nabeshima, et al. The Pile: An 800GB dataset of diverse text for language modeling. arXiv preprint arXiv:2101.00027, 2020.

Xinyang Geng and Hao Liu. Openllama: An open reproduction of llama, May 2023. URL

https://github.com/openlm-research/open llama.

Dirk Groeneveld. The big friendly filter. https://github.com/allenai/bff, 2023.

11

<!-- page 12 of 26 -->

Published as a conference paper at COLM 2024

Dirk Groeneveld, Iz Beltagy, Pete Walsh, Akshita Bhagia, Rodney Kinney, Oyvind Tafjord,

Ananya Harsh Jha, Hamish Ivison, Ian Magnusson, Yizhong Wang, Shane Arora, David Atkinson, Russell Authur, Khyathi Chandu, Arman Cohan, Jennifer Dumas, Yanai Elazar, Yuling Gu, Jack Hessel, Tushar Khot, William Merrill, Jacob Morrison, Niklas Muen- nighoff, Aakanksha Naik, Crystal Nam, Matthew E. Peters, Valentina Pyatkin, Abhilasha Ravichander, Dustin Schwenk, Saurabh Shah, Will Smith, Nishant Subramani, Mitchell Wortsman, Pradeep Dasigi, Nathan Lambert, Kyle Richardson, Jesse Dodge, Kyle Lo, Luca Soldaini, Noah A. Smith, and Hannaneh Hajishirzi. Olmo: Accelerating the science of language models. Preprint, 2024.

Kelvin Guu, Kenton Lee, Zora Tung, Panupong Pasupat, and Mingwei Chang. Retrieval

augmented language model pre-training. In Proceedings of the International Conference of Machine Learning, 2020.

Zhenyu He, Zexuan Zhong, Tianle Cai, Jason D Lee, and Di He. Rest: Retrieval-based spec-

ulative decoding. 2023. URL https://api.semanticscholar.org/CorpusID:265157884.

Ari Holtzman, Jan Buys, Li Du, Maxwell Forbes, and Yejin Choi. The curious case of neural

text degeneration. ArXiv, abs/1904.09751, 2019. URL https://api.semanticscholar. org/CorpusID:127986954.

Gautier Izacard, Patrick Lewis, Maria Lomeli, Lucas Hosseini, Fabio Petroni, Timo Schick,

Jane Dwivedi-Yu, Armand Joulin, Sebastian Riedel, and Edouard Grave. Few-shot learning with retrieval augmented language models. arXiv preprint arXiv:2208.03299, 2022.

Dan Jurafsky and James H. Martin. Speech and language processing - an introduction to

natural language processing, computational linguistics, and speech recognition. In Prentice Hall series in artificial intelligence, 2000. URL https://api.semanticscholar.org/CorpusID: 60691216.

Juha K¨arkk¨ainen, Peter Sanders, and Stefan Burkhardt. Linear work suffix array construction.

J. ACM, 53:918–936, 2006. URL https://api.semanticscholar.org/CorpusID:12825385.

Slava M. Katz. Estimation of probabilities from sparse data for the language model compo-

nent of a speech recognizer. IEEE Trans. Acoust. Speech Signal Process., 35:400–401, 1987. URL https://api.semanticscholar.org/CorpusID:6555412.

Casey Redd Kennington, Martin Kay, and Annemarie Friedrich. Suffix trees as language

models. In International Conference on Language Resources and Evaluation, 2012. URL https://api.semanticscholar.org/CorpusID:12071964.

Urvashi Khandelwal, Omer Levy, Dan Jurafsky, Luke Zettlemoyer, and Mike Lewis. Gener-

alization through memorization: Nearest neighbor language models. In Proceedings of the International Conference on Learning Representations, 2020.

Tian Lan, Deng Cai, Yan Wang, Heyan Huang, and Xian-Ling Mao. Copy is all you need. In

Proceedings of the International Conference on Learning Representations, 2023.

Katherine Lee, Daphne Ippolito, Andrew Nystrom, Chiyuan Zhang, Douglas Eck, Chris

Callison-Burch, and Nicholas Carlini. Deduplicating training data makes language models better. In Proceedings of the Association for Computational Linguistics, 2022.

Huayang Li, Deng Cai, Jin Xu, and Taro Watanabe. Residual learning of neural text genera-

tion with n-gram language model. In Findings of the Association for Computational Linguis- tics: EMNLP 2022, 2022. URL https://aclanthology.org/2022.findings-emnlp.109.

Alex Mallen, Akari Asai, Victor Zhong, Rajarshi Das, Hannaneh Hajishirzi, and Daniel

Khashabi. When not to trust language models: Investigating effectiveness of parametric and non-parametric memories. In Annual Meeting of the Association for Computational Linguistics, 2022. URL https://api.semanticscholar.org/CorpusID:254877603.

12

<!-- page 13 of 26 -->

Published as a conference paper at COLM 2024

Marc Marone and Benjamin Van Durme. Data portraits: Recording foundation model

training data. ArXiv, abs/2303.03919, 2023. URL https://api.semanticscholar.org/ CorpusID:257378087.

Tomas Mikolov and Geoffrey Zweig. Context dependent recurrent neural network language

model. 2012 IEEE Spoken Language Technology Workshop (SLT), pp. 234–239, 2012. URL https://api.semanticscholar.org/CorpusID:11383176.

Sewon Min, Suchin Gururangan, Eric Wallace, Hannaneh Hajishirzi, Noah Smith, and Luke

Zettlemoyer. SILO language models: Isolating legal risk in a nonparametric datastore. arXiv preprint arXiv:2308.04430, 2023a. URL https://arxiv.org/abs/2308.04430.

Sewon Min, Weijia Shi, Mike Lewis, Xilun Chen, Wen-tau Yih, Hannaneh Hajishirzi, and

Luke Zettlemoyer. Nonparametric masked language modeling. In Findings of ACL, 2023b.

Daichi Mochihashi and Eiichiro Sumita. The infinite markov model. In Neural Information

Processing Systems, 2007. URL https://api.semanticscholar.org/CorpusID:1279894.

Fabio Petroni, Tim Rockt¨aschel, Patrick Lewis, Anton Bakhtin, Yuxiang Wu, Alexan-

der H. Miller, and Sebastian Riedel. Language models as knowledge bases? ArXiv, abs/1909.01066, 2019. URL https://api.semanticscholar.org/CorpusID:202539551.

Aleksandra Piktus, Christopher Akiki, Paulo Villegas, Hugo Laurenccon, G´erard Dupont,

Alexandra Sasha Luccioni, Yacine Jernite, and Anna Rogers. The roots search tool: Data transparency for llms. In Annual Meeting of the Association for Computational Linguistics, 2023. URL https://api.semanticscholar.org/CorpusID:257219882.

Alec Radford, Jeffrey Wu, Rewon Child, David Luan, Dario Amodei, Ilya Sutskever, et al.

Language models are unsupervised multitask learners. OpenAI blog, 1(8):9, 2019.

Edward Raff, William Fleming, Richard Zak, H. Anderson, Bill Finlayson, Charles K.

Nicholas, and Mark McLean. Kilograms: Very large n-grams for malware classifica- tion. ArXiv, abs/1908.00200, 2019. URL https://api.semanticscholar.org/CorpusID: 199064443.

Colin Raffel, Noam M. Shazeer, Adam Roberts, Katherine Lee, Sharan Narang, Michael

Matena, Yanqi Zhou, Wei Li, and Peter J. Liu. Exploring the limits of transfer learning with a unified text-to-text transformer. J. Mach. Learn. Res., 21:140:1–140:67, 2019. URL https://api.semanticscholar.org/CorpusID:204838007.

Ehsan Shareghi, Matthias Petri, Gholamreza Haffari, and Trevor Cohn. Compact, effi-

cient and unlimited capacity: Language modeling with compressed suffix trees. In Conference on Empirical Methods in Natural Language Processing, 2015. URL https: //api.semanticscholar.org/CorpusID:225428.

Weijia Shi, Sewon Min, Michihiro Yasunaga, Minjoon Seo, Rich James, Mike Lewis, Luke

Zettlemoyer, and Wen-tau Yih. REPLUG: Retrieval-augmented black-box language mod- els. arXiv preprint arXiv:2301.12652, 2023.

Luca Soldaini, Rodney Kinney, Akshita Bhagia, Dustin Schwenk, David Atkinson, Russell

Authur, Khyathi Chandu, Jennifer Dumas, Li Lucy, Xinxi Lyu, Ian Magnusson, Aakanksha Naik, Crystal Nam, Matthew E. Peters, Abhilasha Ravichander, Zejiang Shen, Emma Strubell, Nishant Subramani, Oyvind Tafjord, Evan Pete Walsh, Hannaneh Hajishirzi, Noah A. Smith, Luke Zettlemoyer, Iz Beltagy, Dirk Groeneveld, Jesse Dodge, and Kyle Lo. Dolma: An Open Corpus of 3 Trillion Tokens for Language Model Pretraining Research. Technical report, Allen Institute for AI, 2023. Released under ImpACT License as Medium Risk artifact, https://github.com/allenai/dolma.

Herman Stehouwer and Menno van Zaanen. Using suffix arrays as language models:

Scaling the n-gram. 2010. URL https://api.semanticscholar.org/CorpusID:18379946.

Together. RedPajama: An open source recipe to reproduce LLaMA training dataset, 2023.

URL https://github.com/togethercomputer/RedPajama-Data.

13

<!-- page 14 of 26 -->

Published as a conference paper at COLM 2024

Hugo Touvron, Thibaut Lavril, Gautier Izacard, Xavier Martinet, Marie-Anne Lachaux,

Timoth´ee Lacroix, Baptiste Rozi`ere, Naman Goyal, Eric Hambro, Faisal Azhar, Aurelien Rodriguez, Armand Joulin, Edouard Grave, and Guillaume Lample. LLaMA: Open and efficient foundation language models. arXiv preprint arXiv:2302.13971, 2023a.

Hugo Touvron, Louis Martin, Kevin Stone, Peter Albert, Amjad Almahairi, Yasmine Babaei,

Nikolay Bashlykov, Soumya Batra, Prajjwal Bhargava, Shruti Bhosale, et al. Llama 2: Open foundation and fine-tuned chat models. arXiv preprint arXiv:2307.09288, 2023b.

Thuy-Trang Vu, Xuanli He, Gholamreza Haffari, and Ehsan Shareghi. Koala: An index

for quantifying overlaps with pre-training corpora. In Conference on Empirical Methods in Natural Language Processing, 2023. URL https://api.semanticscholar.org/CorpusID: 257766452.

Ben Wang and Aran Komatsuzaki. GPT-J-6B: A 6 Billion Parameter Autoregressive Lan-

guage Model. https://github.com/kingoflolz/mesh-transformer-jax, May 2021.

Frank D. Wood, C. Archambeau, Jan Gasthaus, Lancelot F. James, and Yee Whye Teh. A

stochastic memoizer for sequence data. In International Conference on Machine Learning, 2009. URL https://api.semanticscholar.org/CorpusID:11199892.

Zexuan Zhong, Tao Lei, and Danqi Chen. Training language models with memory augmen-

tation. In Proceedings of Empirical Methods in Natural Language Processing, 2022.

14

<!-- page 15 of 26 -->

Published as a conference paper at COLM 2024

A Additional Details on the Infini-gram Engine · Infini-gram引擎补充细节

A.1 What is the size of the n-gram count table implied by an infini-gram index?

A.1 无限元索引隐含的 n 元语法计数表的大小是多少？

The size of an n-gram LM is often measured by the number of unique n-grams indexed, each associated with its count in the dataset. This size is easy to obtain when indexing is done as the classical n-gram count tables, but non-trivial to compute for infini-gram.

n-gram LM 的大小通常通过索引的唯一 n-gram 数量来衡量，每个 n-gram 都与其在数据集中的计数相关联。当索引作为经典的 n 元语法计数表完成时，这个大小很容易获得，但对于无穷元语法来说计算起来却很困难。

If we consider all possible values of n in the n-gram, then a dataset with N tokens would contain about 1

如果我们考虑 n 元语法中 n 的所有可能值，则具有 N 个标记的数据集将包含大约 1

2 N2 n-grams, and since most of these n-grams are long and thus very likely to be distinct, there would be about 1

2 N2 n-gram，由于这些 n-gram 中的大多数都很长，因此很可能是不同的，因此大约有 1 个

2 N2 unique n-grams. Since we index N = 5 trillion tokens, the size of the n-gram count table implied by our infini-gram index would be approximately 1.2 × 1025, or equivalently, 20 mol (using NA = 6.02 × 1023/mol).

2 N2 个独特的 n 元语法。由于我们索引 N = 5 万亿个令牌，因此我们的无限克索引隐含的 n 克计数表的大小约为 1.2 × 1025，或等效地，20 mol（使用 NA = 6.02 × 1023/mol）。

However, the document separator is meaningless and should not be part of the n-grams, and we should probably only count n-grams within the document boundaries. There are N = 5 × 1012 tokens and D = 6 × 109 documents, and on average each documents have 857 tokens. Using the Cauchy-Schwarz inequality, we have the total number of n-grams as

然而，文档分隔符是没有意义的，不应该是 n-gram 的一部分，我们可能应该只计算文档边界内的 n-gram。有 N = 5 × 1012 个 token，D = 6 × 109 个文档，平均每个文档有 857 个 token。使用 Cauchy-Schwarz 不等式，我们得到 n 元语法的总数为

∑

1 2 N2 d ≥1

2 D · ( N D )2 = N2

2D = 2 × 1015

d

Therefore, there are at least 2 quadrillion unique n-grams in the count table implied by infini-gram.

因此，infini-gram 所隐含的计数表中至少有 2 万亿个唯一的 n-gram。

A.2 Additional details on the infini-gram index

Infini-gram indexes are additive and subtractive. If we have two or more indexes built on disjoint datasets (with the same tokenizer), we can easily combine them into a single index by adding up the n-gram counts from each index. This feature is useful in the sharding

无限克索引有加法和减法。如果我们有两个或多个索引构建在不相交的数据集上（使用相同的分词器），我们可以通过将每个索引的 n 元语法计数相加来轻松将它们组合成单个索引。这个特性在分片中很有用

Figure 6: n-gram/∞-gram queries on a training data are supported by an associated suffix array. Both the training data and the suffix array are stored on-disk as regular files. Contents on the white strips are file data, and addresses above the strips are byte offsets. Querying for a particular n-gram returns a consecutive segment of the suffix array, where each element is a pointer into the training data where the n-gram appears. E.g., in the trillion-token training data, Artificial Intelligence, A Modern appears 42 times, and in all cases the following token is Approach.

15

<!-- page 16 of 26 -->

Published as a conference paper at COLM 2024

technique that we discuss in §A.3 and §A.4. Similarly, if we have built indexes on a big dataset and a subset of it, we can easily obtain an index of their difference by taking the difference of n-gram counts. Compared to having a single index, both operations incur some additional inference operations (which can be parallelized to mitigate latency overhead), but they would spare us from re-indexing the union or difference sets from scratch.

我们在§A.3 和§A.4 中讨论的技术。类似地，如果我们在一个大数据集及其子集上建立了索引，我们可以通过 n 元语法计数的差异轻松获得它们差异的索引。与单个索引相比，这两个操作都会产生一些额外的推理操作（可以并行化以减轻延迟开销），但它们将使我们不必从头开始重新索引并集或差异集。

Document offsets and metadata. To enable efficient document retrieval, the infini-gram index stores additional data about documents. A document offset file stores the byte offset of each document in the tokenized dataset, and its format is similar to the suffix array. A document metadata file stores a comma-separated string for each document that contains its metadata (e.g., document ID, source, URL), and a document metadata offset file stores the byte offset of each document’s metadata in the document metadata file. All the above files are negligible in size compared to the suffix array, because there are far less documents than the total number of tokens.

文档偏移量和元数据。为了实现高效的文档检索，无限语法索引存储有关文档的附加数据。文档偏移文件存储标记化数据集中每个文档的字节偏移量，其格式类似于后缀数组。文档元数据文件为每个包含其元数据（例如文档 ID、源、URL）的文档存储一个以逗号分隔的字符串，文档元数据偏移文件存储每个文档元数据在文档元数据文件中的字节偏移量。与后缀数组相比，上述所有文件的大小可以忽略不计，因为文档数量远远少于令牌总数。

A.3 Additional details on building the suffix array

Sharding. Building the suffix array requires heavy random access to the byte array, and thus the entire byte array must be kept in RAM so that the building time is reasonable. However, the byte array may be too large to fit into RAM. In such cases, we shard the byte array into multiple shards, and build a suffix array for each shard. Sharding would induce additional inference latency, which we discuss and mitigate below (§A.4).

分片。构建后缀数组需要对字节数组进行大量随机访问，因此整个字节数组必须保存在 RAM 中，以便构建时间合理。然而，字节数组可能太大而无法装入 RAM。在这种情况下，我们将字节数组分片为多个分片，并为每个分片构建一个后缀数组。分片会导致额外的推理延迟，我们将在下面讨论并减轻这种延迟（§A.4）。

A.4 Additional details on inference with the infini-gram index

Both the first and last occurrence positions can be found with binary search, with time complexity O(n · log N) and O(log N) random array accesses. The two binary searches can be parallelized, reducing the latency by roughly 2x. The impact of query length n is negligible, because computers usually fetch memory in pages of 4K bytes, and string comparison is much faster than page fetching. Therefore, when we analyze time complexity below, we refer to the number of random array accesses.

第一次和最后一次出现的位置都可以通过二分查找找到，时间复杂度为 O(n·log N) 和 O(log N) 随机数组访问。两个二分搜索可以并行化，从而将延迟减少大约 2 倍。查询长度n的影响可以忽略不计，因为计算机通常以4K字节的页来获取内存，并且字符串比较比页获取快得多。因此，我们下面分析时间复杂度时，指的是随机数组访问的次数。

Finding occurrence positions and documents. n-gram counting with suffix arrays has a by-product: we also get to know all positions where the n-gram appears in the training data, for free. This position information is implicitly contained in the suffix array segment we obtained during counting, and to retrieve the original documents where the n-gram appears, all we need to do is to follow each pointer within this segment back into the tokenized dataset, and find the starting and ending position of the enclosing document by performing a binary search on the document offset index. (Note that if we don’t have the document offset index, the latency of document search cannot be bounded because we would need to expand the pointer in both directions in the tokenized dataset until hitting the document separator. In practice, we see documents as large as 20M tokens.)

查找发生位置和文档。使用后缀数组进行 n 元语法计数有一个副产品：我们还可以免费了解 n 元语法在训练数据中出现的所有位置。这个位置信息隐式地包含在我们在计数过程中获得的后缀数组段中，为了检索 n-gram 出现的原始文档，我们需要做的就是沿着该段中的每个指针回到标记化数据集中，并通过对文档偏移索引执行二分搜索来找到封闭文档的起始和结束位置。 （如果没有文档偏移索引，则文档搜索的延迟无法受到限制，因为我们需要在标记化数据集中向两个方向扩展指针，直到到达文档分隔符。实际上，我们看到的文档大小为 20M 个标记。）

Impact of sharding. When the suffix arrays are built on sharded byte arrays, we can simply perform counting on each individual shard and accumulate the counts across all shards. The latency is proportional to the number of shards: time complexity would become O(S · log N). The processing of different shards can be parallelized, reducing the time complexity back to O(log N).

分片的影响。当后缀数组构建在分片字节数组上时，我们可以简单地对每个单独的分片执行计数并累积所有分片的计数。延迟与分片数量成正比：时间复杂度将变为 O(S·log N)。不同分片的处理可以并行化，将时间复杂度降低到O(log N)。

Speeding up n-gram computation by re-using previous search results. On the suffix array, the segment for x1...xn must be a sub-segment of that for x1...xn−1. Therefore, when computing the n-gram probability Pn(xn | x1...xn−1), we can first count x1...xn−1, and then when counting x1...xn, we only need to search for the first and last occurrence positions within the segment of x1...xn, which reduces the latency by at most 2x.

通过重用以前的搜索结果来加速 n-gram 计算。在后缀数组上，x1...xn 的段必须是 x1...xn−1 的段的子段。因此，在计算n-gram概率Pn(xn | x1...xn−1)时，我们可以先统计x1...xn−1，然后在统计x1...xn时，只需要在x1...xn的段内搜索第一个和最后一个出现的位置，这样最多可以减少2倍的延迟。

On-disk search. The byte array and suffix array may be too large to fit into RAM, so in practice, we keep them on disk and read them as memory-mapped files. However, this creates a significant latency as the binary search requires random access to the byte array and suffix array. To mitigate this, we implemented a memory pre-fetching method that informs the system of the array offsets we will likely be reading in the near future. Pre-fetching reduces average latency by roughly 5x.

磁盘上搜索。字节数组和后缀数组可能太大而无法放入 RAM，因此在实践中，我们将它们保存在磁盘上并将它们作为内存映射文件读取。然而，这会产生显着的延迟，因为二分搜索需要随机访问字节数组和后缀数组。为了缓解这个问题，我们实现了一种内存预取方法，该方法通知系统我们可能在不久的将来读取的数组偏移量。预取将平均延迟减少了大约 5 倍。

16

<!-- page 17 of 26 -->

Published as a conference paper at COLM 2024

Reference Data (→) Pile-train RPJ Time Complexity N = 0.36T N = 1.4T (measured by number Query Type (↓) S = 2 S = 8 of random disk accesses)

参考数据 (→) Pile-train RPJ 时间复杂度 N = 0.36T N = 1.4T （通过查询类型 (↓) S = 2 S = 8 次随机磁盘访问来测量）

1. Counting an n-gram O(log N) ... (n = 1) 7 ms 9 ms ... (n = 2) 13 ms 20 ms ... (n = 5) 14 ms 19 ms ... (n = 10) 13 ms 18 ms ... (n = 100) 13 ms 19 ms ... (n = 1000) 14 ms 19 ms 2. Computing a token probability from n-gram LM (n = 5) 19 ms 30 ms O(log N) 3. Computing full next-token distribution from n-gram LM (n = 5) 31 ms 39 ms O(V · log N) 4. Computing a token probability from ∞-gram LM 90 ms 135 ms O(log L · log N) ... on consecutive tokens 12 ms 20 ms O(log N) 5. Computing full next-token distribution from ∞-gram LM 88 ms 180 ms O((log L + V) · log N)

1. 计算 n 元语法 O(log N) ... (n = 1) 7 ms 9 ms ... (n = 2) 13 ms 20 ms ... (n = 5) 14 ms 19 ms ... (n = 10) 13 ms 18 ms ... (n = 100) 13 ms 19 ms ... (n = 1000) 14 ms 19 ms 2. 计算令牌概率n-gram LM (n = 5) 19 ms 30 ms O(log N) 3. 从 n-gram LM 计算完整的下一个令牌分布 (n = 5) 31 ms 39 ms O(V · log N) 4. 从 Infini-gram LM 计算令牌概率 90 ms 135 ms O(log L · log N) ... 在连续令牌上 12 ms 20 ms O(log N) 5. 计算完整Infini-gram LM 的下一个标记分布 88 ms 180 ms O((log L + V) · log N)

Table 3: Inference-time latency of infini-gram on different types of queries. Average latency per query is reported. Benchmarked with inference engine written in C++ (with parallelized shard processing) and running on a single, 8-core CPU node. Notations for time complexity: N = number of tokens in the reference data; S = number of shards for the suffix array; L = number of tokens in the query document; V = vocabulary size.

Speeding up ∞-gram computation. To compute the ∞-gram probability, we need to count the occurrence of each suffix xl−n+1...xl up to the maximum n so that the suffix still meets the sufficient appearance requirement (we denote this maximum n as L). This means O(L) counting operations, and the time complexity for each ∞-gram computation is O(L · log N). However, a simple binary-lifting + binary-search algorithm for searching L can reduce the number of counting operations to O(log L), and thus the time complexity for each ∞-gram computation becomes O(log L · log N).

加速 Infini-gram 计算。为了计算 ∞-gram 概率，我们需要计算每个后缀 xl−n+1...xl 的出现次数，直到最大 n，以便后缀仍然满足足够的出现要求（我们将这个最大 n 表示为 L）。这意味着 O(L) 次计数操作，每个 ∞-gram 计算的时间复杂度为 O(L · log N)。然而，用于搜索 L 的简单二分提升 + 二分搜索算法可以将计数操作的数量减少到 O(log L)，因此每个 Infini-gram 计算的时间复杂度变为 O(log L · log N)。

Speeding up dense ∞-gram computation. During evaluation, we need to compute the ∞- gram probability of each token in the test document. We can save computation by observing that the effective n for one token is at most one token longer than that for the previous token. This brings the amortized time complexity for evaluating each token down to O(log N).

加速密集 Infini-gram 计算。在评估过程中，我们需要计算测试文档中每个标记的 Infini-gram 概率。我们可以通过观察一个令牌的有效 n 最多比前一个令牌长一个令牌来节省计算量。这使得评估每个令牌的摊余时间复杂度降至 O(log N)。

A.5 Supported query types and latency benchmarking

Infini-gram supports the following types of n-gram/∞-gram queries:

1. Counting an n-gram (COUNT); 2. Computing a token probability from n-gram LM (with given n, no backoff) (NGRAMPROB); 3. Computing the full next-token distribution from n-gram LM (NGRAMDIST); 4. Computing a token probability from ∞-gram LM (INFGRAMPROB); 5. Computing the full next-token distribution from ∞-gram LM (INFGRAMDIST); 6. Returning documents containing an n-gram, or a CNF logical expression of n-gram terms, connected with AND’s and/or OR’s (e.g., (natural language processing OR artificial intelligence) AND (deep learning OR machine learning)) (SEARCHDOC).

1. 计算 n 元语法（COUNT）； 2. 根据 n-gram LM 计算 token 概率（给定 n，无退避）(NGRAMPROB)； 3. 从 n-gram LM (NGRAMDIST) 计算完整的下一个令牌分布； 4. 从 ∞-gram LM 计算 token 概率 (INFGRAMPROB)； 5. 从 ∞-gram LM (INFGRAMDIST) 计算完整的下一个令牌分布； 6. 返回包含 n-gram 或 n-gram 术语的 CNF 逻辑表达式的文档，并与 AND 和/或 OR 连接（例如，（自然语言处理或人工智能）AND（深度学习或机器学习））（SEARCHDOC）。

We benchmark the latency of infini-gram on different types of n-gram and ∞-gram queries, and show results in Table 3. During inference, the training data and the suffix array are stored on an SSD. For each type of query, the benchmarking is conducted on 1,000 tokens randomly and independently sampled from Pile’s validation data (except for the task “computing a token probability from ∞-gram LM on consecutive tokens”, where we sampled 10 documents and processed 1000 consecutive tokens in each document).

我们在不同类型的 n-gram 和 Infini-gram 查询上对 infini-gram 的延迟进行基准测试，结果如表 3 所示。在推理过程中，训练数据和后缀数组存储在 SSD 上。对于每种类型的查询，基准测试都是从 Pile 的验证数据中随机、独立采样的 1,000 个令牌进行的（“从连续令牌上的 ∞-gram LM 计算令牌概率”任务除外，其中我们采样了 10 个文档并在每个文档中处理了 1000 个连续令牌）。

All types of queries demonstrate sub-second latency on the trillion-token training data. Computing a token probability from the ∞-gram with RedPajama takes merely 135 millisec- onds. Furthermore, our implementation supports counting the occurrence of an n-gram

所有类型的查询都在万亿代币训练数据上显示出亚秒级延迟。使用 RedPajama 从 ∞ 克计算令牌概率仅需要 135 毫秒。此外，我们的实现支持计算 n 元语法的出现次数

17

<!-- page 18 of 26 -->

Published as a conference paper at COLM 2024

with arbitrarily large n, with roughly constant latency at 20 milliseconds (we experimentally validated up to n = 1000). Decoding requires computing the full next-token distribution and is thus slightly slower: 39 milliseconds per token with n-gram LMs and 180 milliseconds per token with ∞-gram.

n 任意大，延迟大致恒定为 20 毫秒（我们通过实验验证最多 n = 1000）。解码需要计算完整的下一个令牌分布，因此速度稍慢：使用 n-gram LM 时每个令牌需要 39 毫秒，使用 ∞-gram 时每个令牌需要 180 毫秒。

B Decontamination of Reference Data · 参考数据去污染

To properly evaluate the effectiveness of ∞-gram LM on Pile’s evaluation sets, we per- formed data decontamination on the Pile’s training set and RedPajama before using them as reference data for the ∞-gram LM. We run the Big Friendly Filter (BFF)1 (Groeneveld, 2023) on Pile’s training set and RedPajama, filtering out documents with too much n-gram overlap with Pile’s evaluation sets. Table 4 reports the statistics of decontamination.

为了正确评估 Infinity-gram LM 在 Pile 评估集上的有效性，我们对 Pile 的训练集和 RedPajama 进行了数据去污，然后将它们用作 Infinity-gram LM 的参考数据。我们在 Pile 的训练集和 RedPajama 上运行 Big Friends Filter (BFF)1（Groeneveld，2023），过滤掉与 Pile 的评估集有太多 n-gram 重叠的文档。表4报告了净化统计数据。

When using BFF, we always remove whole documents, instead of by paragraphs. Following the default settings, we consider n-grams where n = 13, and discard the document if at least 80% of its n-grams are present in the evaluation set. For Pile’s training set, we lowercase all documents to capture more potential contaminations.

使用 BFF 时，我们总是删除整个文档，而不是逐段删除。按照默认设置，我们考虑 n = 13 的 n 元语法，如果评估集中至少有 80% 的 n 元语法，则丢弃该文档。对于 Pile 的训练集，我们将所有文档都小写以捕获更多潜在的污染。

PILE (TRAIN)

Subset Total docs Filtered docs Ratio filtered

REDPAJAMA

Subset Total docs Filtered docs Ratio filtered

arxiv 1558306 213 0.01% book 205744 711 0.3% c4 364868892 53195 0.01% common crawl 476276019 0 0% github 28793312 614259 2% stackexchange 29825086 40086 0.01% wikipedia 29834171 21973 0.07%

Total 931361530 730437 0.08%

Arxiv 2377741 1089 BookCorpus2 25355 6 Books3 277655 99 DM Mathematics 1918535 0 0% Enron Emails 926132 18236 2% EuroParl 131723 21 FreeLaw 5069088 11821 0.2% Github 18044218 961726 5.3% Gutenberg (PG-19) 66981 70 0.1% HackerNews 1571968 14 NIH ExPorter 1777926 3739 0.2% OpenSubtitles 632485 5754 0.9% OpenWebText2 32333654 136914 0.4% PhilPapers 63875 2324 0.4% Pile-CC 52441354 19928 PubMed Abstracts 29329202 2312 PubMed Central 5679903 4230 0.1% StackExchange 29529008 2072 USPTO Backgrounds 11123325 80088 0.7% Ubuntu IRC 20067 10 Wikipedia (en) 16939503 45052 0.3% YoutubeSubtitles 328030 871 0.3%

Total 210607728 1296376 0.6%

Table 4: Statistics of de-contamination in RedPajama (left) and Pile’s training set (right).

C Additional Analysis · 补充分析

Figure 7 is an extension to the middle plot of Figure 3, and shows a more fine-grained analysis of the token-wise agreement between human-written text and ∞-gram. Figure 8 extends Figure 4 with results on Llama-2-13b/7b. Figure 9 extends Figure 5 with results on GPT-Neo models.

D Additional Experiments on Improving Neural LMs with ∞-gram · 用∞-gram改进神经语言模型的补充实验

D.1 Additional details on experimental setup

Evaluation data processing. We split each document in the evaluation data into batches with a maximum sequence length of 1024 and a sliding window of 512, a setup that is standard in prior language modeling literature (Baevski & Auli, 2019; Khandelwal et al., 2020).

评价数据处理。我们将评估数据中的每个文档分成最大序列长度为 1024 和滑动窗口为 512 的批次，这是先前语言建模文献中的标准设置（Baevski & Auli，2019；Khandelwal 等人，2020）。

1https://github.com/allenai/bff

18

<!-- page 19 of 26 -->

Published as a conference paper at COLM 2024

Figure 7: Token-wise agreement between human-generated text and ∞-gram, broken down by “effective n” and frequency of the corresponding longest suffix in the reference data. The height of each bar represents token count, and the color represents agreement (red is 0.0, green is 1.0).

Figure 8: Continuation of Figure 4, with results on Llama-2-13b/7b.

Figure 9: Continuation of Figure 5, with results on GPT-Neo models. Token-wise agreement between machine-generated text and ∞-gram. All tokens are considered.

Neural LMs. Below are additional details about the families of neural LMs we use.

神经 LM。以下是有关我们使用的神经 LM 系列的更多详细信息。

19

<!-- page 20 of 26 -->

Published as a conference paper at COLM 2024

simple interpolation w/ Random Forest

Eval Data (Wikipedia)

Neural + ∞-gram Neural + ∞-gram

April 2023 5.64 5.48 (3%) 5.86 4.89 (20%) May 2023 5.43 5.27 (4%) 6.01 5.70 ( 6%) June 2023 5.49 5.21 (6%) 5.69 4.87 (17%) July 2023 4.93 4.93 (0%) 4.91 4.78 ( 3%) August 2023 4.64 4.46 (5%) 4.81 4.50 ( 8%)

Table 5: Evaluation on time-shifted data. The evaluation data is taken from newly-added Wikipedia articles since April 2023, which is after the creation of both the Pile and RedPajama. The neural model is Llama-2 (13B), and the ∞-gram reference data is Pile + RPJ.

• GPT-2 (Radford et al., 2019), one of the earliest autoregressive language models whose sizes range from 117M, 345M, and 774M to 1.6B. Their training data is a diverse set of web text, although is not public. • GPT-Neo (Gao et al., 2020) and GPT-J (Wang & Komatsuzaki, 2021), language models trained on the Pile whose sizes vary from 125M, 1.3B, and 2.7B to 6.7B. • Llama-2 (Touvron et al., 2023b), a subsequent version of LLaMA (Touvron et al., 2023a) trained on two trillion tokens and has sizes of 7B, 13B, and 70B. Llama-2 is one of the most competitive language models whose weights are available at the time of writing the paper. The training data of Llama-2 is unknown, although the precedent version is trained on a large corpus of Common Crawls, Wikipedia and code, which is replicated by RedPajama (Together, 2023). • SILO (Min et al., 2023a), 1.3B language models trained on permissively licensed data only. The original paper showed that training on permissively licensed data leads to the challenge of extreme domain generalization because the training data is skewed to highly specific domains like code and government text. We use three different variants, PD, PDSW and PDSWBY, which are trained on different levels of permissivity, leading to varying levels of the domain generalization challenge.

• GPT-2（Radford et al., 2019），最早的自回归语言模型之一，大小范围从 117M、345M、774M 到 1.6B。他们的训练数据是一组不同的网络文本，尽管不是公开的。 • GPT-Neo (Gao et al., 2020) 和 GPT-J (Wang & Komatsuzaki, 2021)，在大小从 125M、1.3B、2.7B 到 6.7B 不等的 Pile 上训练的语言模型。 • Llama-2（Touvron 等人，2023b），LLaMA（Touvron 等人，2023a）的后续版本，在 2 万亿个代币上进行训练，大小为 7B、13B 和 70B。 Llama-2 是最具竞争力的语言模型之一，其权重在撰写本文时可用。 Llama-2 的训练数据未知，尽管先前版本是在 Common Crawls、维基百科和代码的大型语料库上进行训练的，并由 RedPajama 复制（Together，2023）。 • SILO（Min 等人，2023a），仅在许可数据上训练的 1.3B 语言模型。原始论文表明，对许可数据的训练会导致极端领域泛化的挑战，因为训练数据偏向于代码和政府文本等高度特定的领域。我们使用三种不同的变体：PD、PDSW 和 PDSWBY，它们在不同级别的许可率上进行训练，从而导致不同级别的领域泛化挑战。

D.2 Evaluating on time-shifted data

To further show the effectiveness of ∞-gram and eliminate doubts that our performance gains might be due to insufficient decontamination, we evaluate on time-shifted data: documents that were created after the cutoff time of the ∞-gram reference data. We use new Wikipedia articles created during April and August, 2023, which is after the cutoff time of both Pile and RedPajama.

为了进一步显示 ∞-gram 的有效性并消除我们的性能提升可能是由于净化不充分造成的疑虑，我们评估了时移数据：在 ∞-gram 参考数据的截止时间之后创建的文档。我们使用 2023 年 4 月和 8 月期间创建的新维基百科文章，即 Pile 和 RedPajama 的截止时间之后。

Table 5 reports the perplexity of neural LM as well as the combined model. On documents in four out of the five months, interpolating with ∞-gram improves the perplexity of the neural LM. We find that this improvement can be further boosted by applying a Random Forest to decide an instance-wise interpolation hyperparameter, where the features of the Random Forest are the suffix lengths (1 up to the effective n) as well as the frequency of each suffix in the reference data. When Random Forest is applied, the perplexity improvement ranges from 3% – 20%.

D.3 Ablations

Effect of the size of reference data. Figure 10 reports performance of the combined model wrt the size of reference data. To create progressively smaller reference data, we repeatedly downsampled the full reference data by 2x (up to 256x, resulting in 9 sizes). We see the improvement brought by ∞-gram widens as reference data size grows, and the relationship is roughly log-linear (except for the NIH ExPorter domain, where ∞-gram doesn’t help when the reference data is too small).

参考数据大小的影响。图 10 报告了组合模型与参考数据大小的性能。为了创建逐渐变小的参考数据，我们反复将完整参考数据下采样 2 倍（最高 256 倍，产生 9 种大小）。我们看到，随着参考数据大小的增长，∞-gram 带来的改进不断扩大，并且这种关系大致呈对数线性关系（除了 NIH ExPorter 域，当参考数据太小时，∞-gram 没有帮助）。

Effect of the domain of reference data. Figure 10 also compares performance of the combined model where the ∞-gram uses either the full reference data or only the in-domain reference data. Using only the in-domain reference data is roughly as powerful as using

参考数据域的影响。图 10 还比较了组合模型的性能，其中 ∞-gram 使用完整参考数据或仅使用域内参考数据。仅使用域内参考数据大致与使用

20

<!-- page 21 of 26 -->

Published as a conference paper at COLM 2024

Figure 10: Impact of scaling the datastore of the ∞-gram, all using the Llama-2 models (7B, 13B, and 70B) as neural LMs, and the Pile as the reference data. - - -: neural LM only (baseline). •: ∞-gram uses the full Pile; ◦: ∞-gram uses only the in-domain portion of the Pile. Gains increase consistently as the datastore scales.

the full reference data, which implies that almost all improvement we have achieved is thanks to in-domain data (which has been decontaminated). This means it would not hurt to use the full reference data, especially when the test domain is unknown or an in-domain reference data is unavailable; however, having in-domain reference data is most helpful.

完整的参考数据，这意味着我们取得的几乎所有改进都归功于域内数据（已被净化）。这意味着使用完整的参考数据不会有什么坏处，特别是当测试域未知或域内参考数据不可用时；然而，拥有域内参考数据是最有帮助的。

E Extended Discussion · 扩展讨论

In §4 and §5, we showcased some very preliminary use cases of the infini-gram engine. How- ever, we believe that infini-gram can enable much broader investigations and applications, including but not limited to:

在第 4 节和第 5 节中，我们展示了 infini-gram 引擎的一些非常初步的用例。然而，我们相信无限图可以实现更广泛的研究和应用，包括但不限于：

Understanding massive text corpora. Text corpora used for pretraining language models have become prohibitively large, and we have relatively limited understanding of their contents (Elazar et al., 2023). Infini-gram can be a useful tool to quickly find out what is in the corpus and what is not, using n-gram lookup (the COUNT query).

理解海量文本语料库。用于预训练语言模型的文本语料库已经变得非常大，我们对其内容的理解相对有限（Elazar et al., 2023）。 Infini-gram 是一个有用的工具，可以使用 n-gram 查找（COUNT 查询）快速找出语料库中包含的内容和不包含的内容。

Data curation. Data engineers often want to remove problematic content in corpora scraped from the Internet, such as toxicity, hate speech, and personal identifiable information (PII). Using infini-gram’s SEARCHDOC query (which can be easily modified to return all documents), one can retrieve all documents containing an n-gram term (or a CNF expression with multiple n-gram terms) and remove them from the corpus. Removal can even be done iteratively: infini-gram indexes are additive/subtractive, so we can obtain an index of the corpus after round one removal, by indexing the removed set and take the difference of the original index and the removal index.

数据整理。数据工程师通常希望删除从互联网上抓取的语料库中的有问题的内容，例如毒性、仇恨言论和个人身份信息 (PII)。使用 infini-gram 的 SEARCHDOC 查询（可以轻松修改以返回所有文档），可以检索包含 n-gram 术语（或具有多个 n-gram 术语的 CNF 表达式）的所有文档，并将它们从语料库中删除。删除甚至可以迭代地完成：无限元索引是加法/减法的，因此我们可以通过对删除的集合进行索引并取原始索引和删除索引的差来获得第一轮删除后语料库的索引。

Document retrieval. The scale of datastore is key to the effectiveness of retrieval- augmented LMs (Asai et al., 2024). However, vector-based indexes are difficult to scale up due to compute limit, storage limit, and inference efficiency. Infini-gram’s SEARCHDOC function can retrieve documents from datastores as large as the full pretraining corpora, and can potentially boost the performance of retrieval-augmented LMs.

文档检索。数据存储的规模是检索增强型语言模型有效性的关键（Asai 等人，2024）。然而，由于计算限制、存储限制和推理效率，基于向量的索引很难扩展。 Infini-gram 的 SEARCHDOC 函数可以从与完整预训练语料库一样大的数据存储中检索文档，并且可以潜在地提高检索增强型语言模型的性能。

Reducing hallucination in factual knowledge. Parametric-only models are prone to generating non-factual statements, which is widely known as the hallucination problem. Infini-gram can potentially be used to mitigate hallucination by reading verbatim from the training data. We have found evidence that the ∞-gram can greatly outperform Llama-2-70B on factual probing benchmarks such as LAMA (Petroni et al., 2019).

减少事实知识中的幻觉。仅参数模型容易生成非事实陈述，这被广泛称为幻觉问题。 Infini-gram 可以通过逐字读取训练数据来减轻幻觉。我们发现有证据表明 ∞-gram 在 LAMA 等事实探测基准上可以大大优于 Llama-2-70B（Petroni 等人，2019）。

Detecting data contamination, memorization, and plagiarism. Test set contamination has become a major issue for language model evaluation. n-gram lookup enables us to check if evaluation queries have sneaked into the training data of neural LMs. It also opens up possibility to detect memorization in machine-generated text, or plagiarism in human-written text.

检测数据污染、记忆和剽窃。测试集污染已成为语言模型评估的一个主要问题。 n-gram 查找使我们能够检查评估查询是否已潜入神经 LM 的训练数据中。它还提供了检测机器生成文本中的记忆或人类编写文本中的抄袭的可能性。

Preventing copyright infringement. Recently, generative AIs are facing numerous law- suits for generating arguably copyrighted materials. Infini-gram may be helpful for pre-

防止侵犯版权。最近，生成式人工智能因生成有争议的受版权保护的材料而面临众多诉讼。 Infini-gram 可能有助于预

21

<!-- page 22 of 26 -->

Published as a conference paper at COLM 2024

Method # tokens (↑) # entries (↑) Storage usage (↓) max n

Vector-based index RETRO (Borgeaud et al., 2022) 1.8 T 2.8 × 1010 432 TB (16k bytes / entry) – Atlas (Izacard et al., 2022) 27 B 4 × 108 200 GB (8 bytes / entry) – kNN-LM (Khandelwal et al., 2020) 3 B 3 × 109 200 GB (64 bytes / entry) – NPM (Min et al., 2023b) 1 B 1 × 109 1.4 TB (∼2k bytes / entry) –

n-gram-based index Brants et al. (2007) 2 T 3 × 1011 unreported 5 Google’s (Franz & Brants, 2006) 1 T 3.8 × 109 24 GB 5 Google Books Ngram (Aiden & Michel, 2011) 500 B unreported unreported 5 Stehouwer & van Zaanen (2010) 90 M unreported unreported ∞ Kennington et al. (2012) 3 M 5 × 1012 330 MB (110 bytes / token) ∞ Shareghi et al. (2015) 9 B 8 × 1018 63 GB (7 bytes / token) ∞

基于 n-gram 的索引 Brants 等人。 (2007) 2 T 3 × 1011 未报告 5 Google’s (Franz & Brants, 2006) 1 T 3.8 × 109 24 GB 5 Google Books Ngram (Aiden & Michel, 2011) 500 B 未报告 未报告 5 Stehouwer & van Zaanen (2010) 90 M 未报告未报道 ∞ Kennington 等人。 (2012) 3 M 5 × 1012 330 MB（110 字节/令牌） ∞ Shareghi 等人。 (2015) 9 B 8 × 1018 63 GB（7 字节/令牌） ∞

infini-gram (ours) 5 T 1 × 1025 35 TB (7 bytes / token) ∞

Table 6: Comparison with other nonparametric language modeling methods. # tokens: number of tokens in the inference-time reference data. # entries: number of representations (counts) in the index. max n: maximum number of context tokens considered. For infini- gram, we consider the combination of Pile-train and RedPajama as reference data.

venting copyright infringement, by diverting neural LMs to alternative (yet still plausible) generation paths when they are about to generate long n-grams that appear in the training data, especially if they mostly appear in documents from copyrighted sources.

当神经 LM 即将生成训练数据中出现的长 n 元语法时，特别是当它们主要出现在受版权保护的文档中时，将神经 LM 转移到替代（但仍然合理）的生成路径，以防止侵犯版权。

Measuring popularity of entity. Mallen et al. (2022) showed that LMs have better mem- orization of facts about popular entities than less popular ones. In that paper, heuristic metrics like Wikipedia pageviews are used as proxy to popularity. A better proxy may be the number of appearances of the entity’s name in a massive text corpus, which can be easily computed by infini-gram’s COUNT query.

衡量实体的受欢迎程度。马伦等人。 （2022）表明，LM 对流行实体的事实比不太流行的实体有更好的记忆。在那篇论文中，维基百科页面浏览量等启发式指标被用作流行度的代理。更好的代理可能是实体名称在海量文本语料库中出现的次数，这可以通过 infini-gram 的 COUNT 查询轻松计算出来。

Measuring novelty and creativity of text. Are neural LMs generating genuinely novel text, or are they simply copying from its pretraining data? We need a metric for text novelty and creativity, and this metric can be potentially defined by the n-gram overlap between the generated document and the pretraining corpus.

衡量文本的新颖性和创造力。神经语言模型是否生成真正新颖的文本，或者它们只是从预训练数据中复制？我们需要一个衡量文本新颖性和创造力的指标，并且该指标可以通过生成的文档和预训练语料库之间的 n 元语法重叠来定义。

Attribution. When using neural LMs to make predictions, people might want to know which training data most influenced the model’s decision. Using n-gram lookup with key phrases, we can trace back to related documents in the training data of neural LMs.

归因。当使用神经语言模型进行预测时，人们可能想知道哪些训练数据对模型的决策影响最大。使用带有关键短语的 n 元语法查找，我们可以追溯到神经语言模型训练数据中的相关文档。

Non-parametric speculative decoding. Speculative decoding (Chen et al., 2023) speeds up text generation by employing a fast and a slow decoder, where the fast decoder is a smaller model that does the autoregressive token generation, and the slow decoder checks the fast decoder’s proposals by parallelizing the forward passes of multiple tokens. Given the low latency of infini-gram, we can potentially use ∞-gram as the fast decoder, similar to He et al. (2023).

非参数推测解码。推测性解码（Chen et al., 2023）通过采用快速和慢速解码器来加速文本生成，其中快速解码器是一个较小的模型，用于执行自回归令牌生成，而慢速解码器通过并行化多个令牌的前向传递来检查快速解码器的建议。鉴于 infini-gram 的低延迟，我们可以使用 Infini-gram 作为快速解码器，类似于 He 等人。 （2023）。

We welcome the community to collaboratively build toward the aforementioned directions, by leveraging our publicly released web interface and API endpoint.

我们欢迎社区利用我们公开发布的 Web 界面和 API 端点，朝着上述方向合作构建。

F Extended Related Work · 扩展相关工作

n-grams beyond n = 5. Mochihashi & Sumita (2007) and Wood et al. (2009) consider infinitely-ordered Markov models, to which the ∞-gram LM is a special case. Aside from the ∞-gram LM, some other work has found value in scaling the value of n in n-grams. For example, KiloGrams (Raff et al., 2019) uses 1024-grams as features for malware detection.

n 超出 n = 5 的 n 克。 Mochihashi & Sumita (2007) 和 Wood 等人。 (2009)考虑无限序马尔可夫模型，其中 ∞-gram LM 是一个特例。除了 ∞-gram LM 之外，其他一些工作也发现了在 n-gram 中缩放 n 值的价值。例如，KiloGrams（Raff 等人，2019）使用 1024 克作为恶意软件检测的特征。

Other data structures for text indexing. Beside suffix arrays and suffix trees, other data structures have been used to index text corpora to satisfy different trade-offs. Koala (Vu et al., 2023) builds a compressed suffix array to analyze overlap between text corpora. The ROOTS Search Tool (Piktus et al., 2023) builds a BM25 index on the ROOTS corpus, and

用于文本索引的其他数据结构。除了后缀数组和后缀树之外，还使用其他数据结构来索引文本语料库以满足不同的权衡。 Koala（Vu et al., 2023）构建了一个压缩后缀数组来分析文本语料库之间的重叠。 ROOTS 搜索工具（Piktus et al., 2023）在 ROOTS 语料库上构建 BM25 索引，并且

22

<!-- page 23 of 26 -->

Published as a conference paper at COLM 2024

supports document searching via both exact match and fuzzy match of n-grams. Data Portraits (Marone & Durme, 2023) proposes a lightweight index based on Bloom Filter, and is tailored for probabilistic membership inference (exact match of n-grams of 50 characters, where n ≈8) against the Pile and Stacks. ElasticSearch is a proprietary search engine based on the Lucene index, and it has been used by Dodge et al. (2021) to search documents in C4, and also by Elazar et al. (2023) to count n-grams and list most frequent n-grams in various corpora up to 480B tokens.

支持通过 n-gram 的精确匹配和模糊匹配进行文档搜索。 Data Portraits（Marone & Durme，2023）提出了一种基于 Bloom Filter 的轻量级索引，并针对 Pile 和 Stack 进行概率隶属推理（50 个字符的 n 元语法的精确匹配，其中 n ≈ 8）。 ElasticSearch 是一个基于 Lucene 索引的专有搜索引擎，Dodge 等人已使用它。 (2021) 来搜索 C4 中的文档，也由 Elazar 等人提出。 (2023) 计算 n 元语法并列出各种语料库中最常见的 n 元语法，最多 480B 个标记。

Nonparametric language models. A nonparametric LM refers to the LM whose complexity is not bounded as a priori, because the complexity can grow or update according to the data given at inference time. Prior work is broadly divided into two categories: a token retrieval approach that represents each token as one vector and uses a nonparametric prediction function (Khandelwal et al., 2020; Zhong et al., 2022; Lan et al., 2023; Min et al., 2023b;a; Shi et al., 2023), and a chunk retrieval approach that represents each chunk of text as a vector and incorporates nearest chunks to the neural language model (Guu et al., 2020; Izacard et al., 2022; Borgeaud et al., 2022). Scaling the reference data in nonparametric LMs is very expensive as it requires storing a vector for every unit (either token or chunk). To the best of our knowledge, prior work with the largest reference data is RETRO (Borgeaud et al., 2022), which uses the 7B-parameter LM and the reference data consisting of 1.8 trillion tokens. It stores and searches over 28 billion vectors, estimated to consume 432TB of disk space.2 (Detailed comparisons in Table 6.)

非参数语言模型。非参数 LM 是指复杂性不受先验限制的 LM，因为复杂性可以根据推理时给出的数据增长或更新。先前的工作大致分为两类：一种将每个标记表示为一个向量并使用非参数预测函数的标记检索方法（Khandelwal et al., 2020;zhong et al., 2022; Lan et al., 2023; Min et al., 2023b;a; Shi et al., 2023），以及一种块检索方法，该方法将每个文本块表示为向量并将最近的块合并到神经语言模型中（Guu 等人，2020 年；Izacard 等人，2022 年；Borgeaud 等人，2022 年）。在非参数 LM 中缩放参考数据非常昂贵，因为它需要为每个单元（令牌或块）存储一个向量。据我们所知，之前使用最大参考数据的工作是 RETRO (Borgeaud et al., 2022)，它使用 7B 参数 LM 和由 1.8 万亿个代币组成的参考数据。它存储和搜索超过 280 亿个向量，估计消耗 432TB 的磁盘空间。2（详细比较见表 6。）

G Example Queries and Web Interface · 查询示例与网页界面

Figures 11 to 16 show one example for each of the six query types supported by infini-gram. We query the Dolma corpus in these examples. Screenshots are taken from our web interface.

图 11 至图 16 显示了 infini-gram 支持的六种查询类型中每一种的一个示例。我们在这些例子中查询卓玛语料库。屏幕截图取自我们的网络界面。

Figure 11: Example for query type 1 (COUNT): Counting an n-gram.

2This is in part because RETRO does not use any approximation in kNN search. Even if RETRO used approximate search as Khandelwal et al. (2020) did, it would still use 10TB. Moreover, there is no open-sourced software that easily supports fast kNN search over tens of billions of vectors.

2这部分是因为 RETRO 在 kNN 搜索中不使用任何近似。即使 RETRO 像 Khandelwal 等人那样使用近似搜索。 (2020) 确实如此，它仍然会使用 10TB。此外，还没有开源软件可以轻松支持数百亿向量的快速 kNN 搜索。

23

<!-- page 24 of 26 -->

Published as a conference paper at COLM 2024

Figure 12: Example for query type 2 (NGRAMPROB): Computing a token probability from n-gram LM (with given n, no backoff).

Figure 13: Example for query type 3 (NGRAMDIST): Computing the full next-token distribu- tion from n-gram LM. Due to space limits, only top-10 tokens are shown.

24

<!-- page 25 of 26 -->

Published as a conference paper at COLM 2024

Figure 14: Example for query type 4 (INFGRAMPROB): Computing a token probability from ∞-gram LM.

Figure 15: Example for query type 5 (INFGRAMDIST): Computing the full next-token distribution from ∞-gram LM. Due to space limits, only top-10 tokens are shown.

25

<!-- page 26 of 26 -->

Published as a conference paper at COLM 2024

Figure 16: Example for query type 6 (SEARCHDOC): Returning documents containing an n-gram, or a CNF logical expression of n-gram terms, connected with AND’s and/or OR’s.

26
