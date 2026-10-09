---
title: "01 · Fluid Language Model Benchmarking · 对照译稿"
category: "数据与评测"
tags: ["Fluid Benchmarking", "IRT", "自适应评测", "语言模型评测", "测量理论"]
published: true
excerpt: "Fluid Benchmarking 用项目反应理论估计题目属性，并根据被测模型的能力动态选题，以更少样本改善评测效率、效度与方差。"
---

<!-- arXiv 2509.11106; 文字由 PyMuPDF 按页抽取, 公式与表以 data/sources/fluid-benchmarking/latex/ 的 LaTeX 源码为准 -->

<!-- page 1 of 18 -->

Published as a conference paper at COLM 2025

Fluid Language Model Benchmarking

Valentin Hofmann♢♡ David Heineman♢ Ian Magnusson♢♡ Kyle Lo♢

Jesse Dodge♢ Maarten Sap♢♠ Pang Wei Koh♢♡ Chun Wang♡

Hannaneh Hajishirzi♢♡ Noah A. Smith♢♡

♢Allen Institute for AI ♡University of Washington ♠Carnegie Mellon University

Abstract

Language model (LM) benchmarking faces several challenges: comprehen- sive evaluations are costly, benchmarks often fail to measure the intended capabilities, and evaluation quality can degrade due to labeling errors and benchmark saturation. Although various strategies have been proposed to mitigate these issues, they tend to address individual aspects in isolation, neglecting broader questions about overall evaluation quality. Here, we in- troduce FLUID BENCHMARKING, a new evaluation approach that advances LM benchmarking across multiple dimensions. Inspired by psychometrics, FLUID BENCHMARKING is based on the insight that the relative value of benchmark items depends on an LM’s capability level, suggesting that evaluation should adapt to each LM. Methodologically, FLUID BENCH- MARKING estimates an item response model based on existing LM evaluation results and uses the inferred quantities to select evaluation items dynamically, similar to computerized adaptive testing in education. In our experiments, we compare FLUID BENCHMARKING against the common practice of ran- dom item sampling as well as more sophisticated baselines, including alternative methods grounded in item response theory. We examine four dimensions—efficiency, validity, variance, and saturation—and find that FLUID BENCHMARKING achieves superior performance in all of them (e.g., higher validity and less variance on MMLU with fifty times fewer items). Our analysis shows that the two components of FLUID BENCHMARKING have distinct effects: item response theory, used to map performance into a latent ability space, increases validity, while dynamic item selection re- duces variance. Overall, our results suggest that LM benchmarking can be substantially improved by moving beyond static evaluation.

语言模型（LM）基准测试面临着几个挑战：全面的评估成本高昂，基准测试通常无法衡量预期的功能，并且评估质量可能由于标签错误和基准饱和而下降。尽管已经提出了各种策略来缓解这些问题，但它们往往孤立地解决各个方面，而忽略了有关整体评估质量的更广泛的问题。在这里，我们介绍 FLUID BENCHMARKING，这是一种新的评估方法，可在多个维度上推进 LM 基准测试。受心理测量学的启发，FLUID BENCHMARKING 的基础是基准项目的相对价值取决于 LM 的能力水平，这表明评估应该适应每个 LM。在方法上，FLUID BENCHMARKING 基于现有的 LM 评估结果估计项目响应模型，并使用推断的数量动态选择评估项目，类似于教育中的计算机自适应测试。在我们的实验中，我们将流体基准与随机项目抽样的常见做法以及更复杂的基线进行比较，包括基于项目响应理论的替代方法。我们检查了四个维度——效率、有效性、方差和饱和度——并发现 FLUID BENCHMARKING 在所有这些维度上都实现了卓越的性能（例如，在 MMLU 上，项目数减少了 50 倍，有效性更高，方差更小）。我们的分析表明，流体基准测试的两个组成部分具有不同的效果：项目响应理论，用于将绩效映射到潜在能力空间，提高了有效性，而动态项目选择则减少了方差。总体而言，我们的结果表明，通过超越静态评估，可以大大改进 LM 基准测试。

Code and Data github.com/allenai/fluid-benchmarking

1 Introduction · 引言

arXiv:2509.11106v1  [cs.CL]  14 Sep 2025

The field of language model (LM) evaluation is experiencing a moment of crisis. With new benchmarks being released by the day, it becomes increasingly difficult to decide which benchmark(s) to pick for a certain evaluation goal (Ni et al., 2024; Perlitz et al., 2024b). At the same time, evaluating LMs on ever-growing sets of benchmarks leads to substantial computational—and, consequently, financial and environmental—costs (Liang et al., 2023), all while producing brittle results that fluctuate due to evaluation noise (Madaan et al., 2024; Mizrahi et al., 2024). More alarmingly, it is often unclear whether a specific benchmark in fact measures the capability that it purports to evaluate (Liao et al., 2021; Saxon et al., 2024), a problem exacerbated by labeling errors (Northcutt et al., 2021; Gema et al., 2024; Vendrow et al., 2025) and benchmark saturation, when many LMs are scoring near the maximum on a benchmark (Vania et al., 2021; Xia et al., 2024).

语言模型（LM）评估领域正在经历危机时刻。随着新基准的不断发布，决定为某个评估目标选择哪个基准变得越来越困难（Ni 等人，2024 年；Perlitz 等人，2024b）。与此同时，在不断增长的基准集上评估语言模型会导致大量的计算成本，从而导致财务和环境成本（Liang 等人，2023），同时产生因评估噪声而波动的脆弱结果（Madaan 等人，2024；Mizrahi 等人，2024）。更令人担忧的是，通常不清楚特定基准是否实际上衡量了它声称要评估的能力（Liao 等人，2021；Saxon 等人，2024），当许多 LM 的得分接近最大值时，标签错误（Northcutt 等人，2021；Gema 等人，2024；Vendrow 等人，2025）和基准饱和度加剧了这个问题。基准（Vania 等人，2021；Xia 等人，2024）。

These challenges have spurred various efforts to improve benchmarking, by increasing efficiency (Perlitz et al., 2024a; Polo et al., 2024; Vivek et al., 2024; Kipnis et al., 2025), detecting and correcting mislabeled items (Gema et al., 2024; Vendrow et al., 2025), reducing evaluation variance (Madaan et al., 2024), and enhancing benchmark difficulty (Suzgun

这些挑战促使人们做出各种努力来改进基准测试，包括提高效率（Perlitz 等人，2024a；Polo 等人，2024；Vivek 等人，2024；Kipnis 等人，2025）、检测和纠正错误标记的项目（Gema 等人，2024；Vendrow 等人，2025）、减少评估方差（Madaan 等人，2025）。 2024），并提高基准难度（Suzgun

1

<!-- page 2 of 18 -->

Published as a conference paper at COLM 2025

0.40

m3

m1

−1.0

0.35

m2

m4

ma mb

−1.5

0.30

−2.0

0.25

Accuracy

0.20

−2.5

Estimated LM ability ˆθi

0% 20% 40% 60% 80% 100% Training progress

ABILITY(ma, Q∗

a) ABILITY(mb, Q∗

b)

(c) Variance

Q

Q∗

a Q∗

b

50

FLUID BENCHMARKING RANDOM

40

30

20

Rank distance

10

Q

✓ ✓ ✓ ✓ ✓ ✓ ✓ ✓ ✓ ✗ ✗ ✗ ✓ ✓ ✓ ✓ ✓ ✗ ✓ ✗ ✗ ✗ ✗ ✗ ✓ ✗ ✓ ✗ ✗ ✗ ✓ ✗ ✓ ✓ ✓ ✗ ✓ ✗ ✓ ✓ ✓ ✗ ✓ ✗ ✓ ✗ ✓ ✓ ✗ ✗ ✗ ✗ ✗ ✗ ✗ ✗ ✓ ✓ ✓ ✗ ✗ ✗ ✗ ✗ ✓ ✗ ✓ ✗

0 100 200 300 400 500 Number of items per task

(a) Item response theory

(b) FLUID BENCHMARKING

(d) Validity

Figure 1: (a) Given a benchmark Q, we train an IRT model on publicly available LM evaluation results, providing useful information about individual items (specifically, about difficulty and discrimination). The figure illustrates this with results for four LMs and difficulty, symbolized by item darkness. In practice, we use more than a hundred LMs. (b) FLUID BENCHMARKING leverages the IRT-enriched benchmark in two ways: it uses item difficulty and discrimination to (i) dynamically select an item subset Q∗that matches a given LM’s capability profile—easier items are routed to the weaker LM ma, more difficult items to the stronger LM mb—and (ii) represent a given LM’s performance in a latent ability space rather than standard accuracy space. (c, d) Compared to baselines such as evaluating on a random subset of items (RANDOM), FLUID BENCHMARKING improves benchmarking in various ways: it substantially decreases step-to-step evaluation variance, exemplified by training curves of Pythia-2.8B evaluated on ARC Challenge with 30 items (c), while at the same time increasing the external validity of evaluation, shown as the mean rank distance between an LM’s predicted and true rank (d). See text for more details.

et al., 2023; Gupta et al., 2024; Paech, 2024). However, most of these studies have addressed individual aspects of evaluation quality in isolation, sometimes with unintended negative consequences—for example, Madaan et al. (2024) showed that efficient benchmarking methods can increase evaluation variance between training runs with different random seeds, thus reducing benchmarks’ practical utility.

等，2023；古普塔等人，2024；佩奇，2024）。然而，大多数这些研究都孤立地解决了评估质量的各个方面，有时会带来意想不到的负面后果——例如，Madaan 等人。 （2024）表明，有效的基准测试方法可以增加使用不同随机种子的训练运行之间的评估方差，从而降低基准测试的实际效用。

In this paper, we propose FLUID BENCHMARKING, a new benchmarking method that improves evaluation across multiple relevant dimensions. FLUID BENCHMARKING is based on the insight that the relative value of benchmark items depends on an LM’s capability level; for example, a hard question might be too difficult for a weak LM, but informative for a strong LM. FLUID BENCHMARKING integrates item response theory (IRT; Lord, 1980; van der Linden & Hambleton, 1997; DeMars, 2010), which represents performance in a latent ability space, with methods from computerized adaptive testing used in education (Meijer & Nering, 1999; Chang, 2015; Magis et al., 2017): IRT draws upon existing LM evaluation results to enrich benchmarks with information about item difficulty and discrimination, which is leveraged to dynamically select items that match an LM’s capability level (Figure 1). This contrasts with the until now universal practice of what we call static benchmarking, which assumes a globally optimal set of evaluation items for all LMs.

在本文中，我们提出了流体基准测试（FLUID BENCHMARKING），这是一种新的基准测试方法，可以改进跨多个相关维度的评估。流动基准测试基于这样的见解：基准项目的相对价值取决于 LM 的能力水平；例如，一个难题对于弱 LM 来说可能太难，但对于强 LM 来说却提供了丰富的信息。流体基准测试将项目反应理论（IRT；Lord，1980；van der Linden & Hambleton，1997；DeMars，2010）（代表潜在能力空间中的表现）与教育中使用的计算机自适应测试方法相结合（Meijer & Nering，1999；Chang，2015；Magis 等人，2017）：IRT 利用了现有的 LM 评估结果通过有关项目难度和歧视的信息来丰富基准，从而动态选择与 LM 能力水平相匹配的项目（图 1）。这与迄今为止我们所称的静态基准测试的普遍做法形成鲜明对比，静态基准测试假设所有语言模型都有一组全局最优的评估项目。

In our experiments, we investigate how different methods for improving evaluation affect the efficiency, validity, variance, and saturation of benchmarks. We specifically focus on LM evaluation during pretraining, a key application of benchmarking. We evaluate six LMs on six benchmarks, comparing FLUID BENCHMARKING against a broad set of methods proposed in prior work. We find that FLUID BENCHMARKING consistently outperforms all baselines across all dimensions of evaluation quality. For example, compared to the common practice of random item sampling, FLUID BENCHMARKING improves validity and lowers step-to- step variance on MMLU using fifty times fewer items. Our analysis attributes these gains to the complementary effects of the two key components of FLUID BENCHMARKING: IRT enhances validity, while dynamic item selection reduces variance.

在我们的实验中，我们研究了改进评估的不同方法如何影响基准的效率、有效性、方差和饱和度。我们特别关注预训练期间的 LM 评估，这是基准测试的一个关键应用。我们在六个基准上评估了六个 LM，将流体基准与之前工作中提出的广泛方法进行比较。我们发现，FLUID BENCHMARKING 在评估质量的所有维度上始终优于所有基线。例如，与随机项目抽样的常见做法相比，FLUID BENCHMARKING 提高了有效性并降低了 MMLU 上的逐步方差，使用的项目数量减少了 50 倍。我们的分析将这些收益归因于流体基准测试两个关键组成部分的互补效应：IRT 增强有效性，而动态项目选择减少方差。

2

<!-- page 3 of 18 -->

Published as a conference paper at COLM 2025

2 Preliminaries: Benchmark Refinement · 预备知识：基准改进

In this paper, we introduce benchmark refinement as the problem of improving benchmark- ing by optimizing (i) the selection of evaluation items as well as (ii) the aggregation of their results into benchmark-level scores. We argue that many existing efforts in LM evaluation, previously considered in isolation, can be productively unified under this umbrella.

在本文中，我们将基准细化引入为通过优化（i）评估项目的选择以及（ii）将其结果汇总为基准水平分数来改进基准的问题。我们认为，以前孤立地考虑的许多现有的LM评估工作可以在这个框架下有效地统一。

2.1 Evaluation is Selection, Scoring, and Aggregation · 评测由选择、评分与聚合构成

Let mi be an LM that is to be evaluated on a benchmark Q. We refer to the elements qj ∈Q as items. In a general form, evaluating mi on Q can be expressed as

令 $m_i$ 为将在基准 $Q$ 上评估的 LM。我们将元素 $q_j\in Q$ 称为项目。在一般形式中, 对 $Q$ 评估 $m_i$ 可以表示为

$$
\operatorname{eval}(m_i,Q)=\underbrace{\operatorname{aggregate}_{q_j\in\operatorname{select}(Q)}}_{\text{benchmark-level aggregation}}\!\left(\underbrace{\operatorname{score}(m_i,q_j)}_{\text{item-level scoring}}\right). \tag{1}
$$

EVALUATE(mi, Q) = AGGREGATE

SCORE(mi, qj)

qj∈SELECT(Q) | {z } benchmark-level

| {z } item-level

aggregation

scoring

where SELECT is a selection function that determines the set of evaluation items, SCORE is a scoring function that quantifies LM performance on each item in the evaluation set, and AGGREGATE is an aggregation function applied over the item-level scores. For notational convenience, we denote the evaluation set as Q∗, which may be a subset, superset, or identical to Q. If SCORE ∈{0, 1} is a binary function, AGGREGATE returns the mean of the item-level scores, and SELECT(Q) = Q, we recover the standard accuracy metric commonly used in LM benchmarking, which we denote as ACCURACY(mi, Q).

其中 SELECT 是确定评估项目集的选择函数，SCORE 是量化评估集中每个项目的 LM 性能的评分函数，AGGREGATE 是应用于项目级分数的聚合函数。为了符号方便，我们将评估集表示为 Q*，它可以是子集、超集或与 Q 相同。如果 SCORE ∈{0, 1} 是二元函数，AGGREGATE 返回项目级分数的平均值，并且 SELECT(Q) = Q，我们恢复 LM 基准测试中常用的标准准确度度量，我们将其表示为 ACCURACY(mi, Q)。

With Equation 1, we can break down LM evaluation into two components: item-level scoring and benchmark-level aggregation. While evaluation quality can be improved at both levels, many studies take item-level scores as given and focus on improving benchmark-level aggregation. The present line of work asks: how can we improve LM evaluation through the choice of both (i) the selection function SELECT and/or (ii) the aggregation function AGGREGATE? We refer to this problem as benchmark refinement.

通过公式 1，我们可以将 LM 评估分解为两个部分：项目级评分和基准级聚合。虽然评估质量可以在两个级别上提高，但许多研究将项目级别的分数作为给定的，并侧重于改进基准级别的聚合。目前的工作要求：我们如何通过选择（i）选择函数 SELECT 和/或（ii）聚合函数 AGGREGATE 来改进 LM 评估？我们将此问题称为基准细化。

2.2 Dimensions of Evaluation Quality · 评测质量维度

What aspects of evaluation can be improved through benchmark refinement? In this paper, we focus on four dimensions, each motivated by prior work:

通过基准细化可以改进哪些方面的评价？在本文中，我们关注四个维度，每个维度都受到先前工作的推动：

– Efficiency. Evaluation can be made more efficient by selecting a small evaluation set Q∗,

- 效率。通过选择小的评估集 Q* 可以使评估更加有效，

with |Q∗| ≪|Q|. Prior work has explored random sampling (Perlitz et al., 2024a), item clustering (Polo et al., 2024; Vivek et al., 2024), heuristic filtering (Gupta et al., 2024), and information filtering (Kipnis et al., 2025). Several studies have paired this with modifying AGGREGATE (Polo et al., 2024; Kipnis et al., 2025). – Validity. As a means of measuring an underlying capability in LMs, a benchmark should

与|Q*| ≪|问|。先前的工作探索了随机抽样（Perlitz 等人，2024a）、项目聚类（Polo 等人，2024；Vivek 等人，2024）、启发式过滤（Gupta 等人，2024）和信息过滤（Kipnis 等人，2025）。多项研究将此与修改 AGGREGATE 结合起来（Polo 等人，2024 年；Kipnis 等人，2025 年）。 - 有效性。作为衡量 LM 基础能力的一种手段，基准应该

be predictive of LM behavior beyond the benchmark itself. Prior work has explored different ways to increase benchmark validity via SELECT—for example, by removing and replacing items in Q that trivially fail to measure the intended capability, such as mislabeled items (Northcutt et al., 2021; Gema et al., 2024; Vendrow et al., 2025). – Variance. If evaluation results on a benchmark fluctuate significantly due to evaluation

预测基准本身之外的 LM 行为。之前的工作已经探索了通过 SELECT 提高基准有效性的不同方法，例如，通过删除和替换 Q 中那些根本无法衡量预期功能的项目，例如标签错误的项目（Northcutt 等人，2021 年；Gema 等人，2024 年；Vendrow 等人，2025 年）。 – 方差。如果基准的评估结果因评估而大幅波动

noise (e.g., metric instability), the benchmark becomes less useful in many practical settings, such as tracking progress during training. While it has been shown that removing items with low discriminative power from Q can reduce variance, attempts to modify AGGREGATE have so far proven less effective (Madaan et al., 2024). – Saturation. Given the rapid improvement in LM capabilities, frontier models often

由于噪声（例如，度量不稳定），基准在许多实际设置中变得不太有用，例如在训练期间跟踪进度。虽然已经证明从 Q 中删除区分能力较低的项目可以减少方差，但迄今为止修改 AGGREGATE 的尝试已被证明效果较差（Madaan 等人，2024）。 – 饱和度。鉴于 LM 能力的快速提高，前沿模型经常

solve most items in benchmarks within a short time, limiting their practical value (Vania et al., 2021; Liang et al., 2023). This saturation has motivated the development of more challenging benchmark variants by choosing SELECT such that it focuses on more difficult items (Suzgun et al., 2023; Gupta et al., 2024; Paech, 2024).

在短时间内解决基准中的大多数项目，限制了它们的实用价值（Vania 等，2021；Liang 等，2023）。这种饱和促使通过选择 SELECT 来开发更具挑战性的基准变体，使其专注于更困难的项目（Suzgun 等人，2023 年；Gupta 等人，2024 年；Paech，2024 年）。

In §4.2, we operationalize each of these dimensions into metrics.

3

<!-- page 4 of 18 -->

Published as a conference paper at COLM 2025

3 Methodology: FLUID BENCHMARKING · Fluid Benchmarking 方法

We introduce FLUID BENCHMARKING, a new method for benchmark refinement that departs from prior work (i) by changing AGGREGATE such that LM performance is represented in a latent ability space rather than the standard accuracy space (§3.1), and (ii) by choosing SELECT to dynamically adjust the subset of evaluation items to an LM (§3.2).

我们引入了 FLUID BENCHMARKING，这是一种基准细化的新方法，它与之前的工作不同：(i) 通过更改 AGGREGATE，使 LM 性能在潜在能力空间而并非标准精度空间中表示（第 3.1 节），以及 (ii) 通过选择 SELECT 来动态调整 LM 的评估项目子集（第 3.2 节）。

3.1 Measuring Language Model Performance in Latent Ability Space · 在潜在能力空间中衡量语言模型表现

Over the past several decades, research in psychometrics has developed a suite of methods to address the challenges discussed in the previous section, which arise in a similar form in human testing. We argue that psychometric methods can be fruitfully applied to the evaluation of LMs. In particular, we draw upon item response theory (IRT; Lord, 1980; van der Linden & Hambleton, 1997; DeMars, 2010), which represents test takers in a latent ability space. The specific IRT model we use is a two-parameter logistic (2PL) model (Lord, 1952; Birnbaum, 1968). Before providing a formal definition, we begin with a quick overview of the advantages of IRT-based ability estimates over accuracy.

在过去的几十年里，心理测量学研究开发了一套方法来解决上一节中讨论的挑战，这些挑战在人体测试中以类似的形式出现。我们认为心理测量方法可以有效地应用于 LM 的评估。特别是，我们利用项目反应理论（IRT；Lord，1980；van der Linden & Hambleton，1997；DeMars，2010），该理论代表了潜在能力空间中的考生。我们使用的具体 IRT 模型是二参数逻辑 (2PL) 模型（Lord，1952；Birnbaum，1968）。在提供正式定义之前，我们第一步快速概述基于 IRT 的能力评估相对于准确性的优势。

The key property that distinguishes IRT-based ability estimates from accuracy is that IRT takes item characteristics into account, whereas accuracy treats all items equally. In the 2PL model that we consider here, the two item characteristics are:

区分基于 IRT 的能力估计和准确性的关键属性是 IRT 考虑项目特征，而准确性平等对待所有项目。在我们这里考虑的 2PL 模型中，两个项目特征是：

– Item difficulty. Correctly answering an easy item has a different impact on ability esti-

– 项目难度。正确回答简单的问题对能力评估有不同的影响

mates than correctly answering a difficult item. – Item discrimination. Items exhibit varying rates at which the likelihood of a correct

比正确回答困难的问题更重要的是。 – 项目歧视。项目表现出不同的比率，正确的可能性

response increases with ability. Low-discrimination items are often problematic—for example, we find empirically that many of them are mislabeled (see §6).

反应随着能力的增加而增加。低歧视性项目通常存在问题，例如，我们根据经验发现其中许多项目被贴错标签（参见第 6 节）。

These features might be beneficial for benchmark refinement. In terms of efficiency, item parameters provide a principled basis for selecting Q∗. Item discrimination potentially offers dual benefits: it could enhance validity by reducing the impact of mislabeled items, while simultaneously decreasing variance by placing less weight on items that inconsistently differentiate between similar LMs. Finally, the fact that difficult items affect ability estimates differently than easy items could delay saturation effects, as differences in performance among strong LMs on difficult items are better captured than by accuracy.

这些功能可能有利于基准细化。在效率方面，项目参数为选择Q*提供了原则依据。项目歧视可能会带来双重好处：它可以通过减少错误标记项目的影响来提高有效性，同时通过减少对相似 LM 之间不一致区分的项目的权重来减少方差。末尾，困难项目对能力估计的影响与简单项目不同，这一事实可能会延迟饱和效应，因为强语言模型在困难项目上的性能差异比准确度更好地被捕获。

Formulation. Let M = {m1, . . . , mk} be a set of LMs that have been evaluated on a benchmark Q. Assuming items with two outcomes, the probability that an LM mi answers item qj correctly can be modeled as a Bernoulli random variable uij, where uij = 1 (success) iff the LM’s answer is correct. The probability that uij = 1 is modeled as

配方。令 $M=\{m_1,\ldots,m_k\}$ 是一组在基准 $Q$ 上评估的 LM。假设项目只有两个结果, LM $m_i$ 正确回答项目 $q_j$ 的结果可建模为 Bernoulli 随机变量 $u_{ij}$, 当且仅当答案正确时 $u_{ij}=1$。$u_{ij}=1$ 的概率建模为

$$
P(u_{ij}=1\mid\theta_i,a_j,b_j)=\operatorname{logistic}\!\left(a_j(\theta_i-b_j)\right). \tag{2}
$$

p(uij = 1) = logistic

aj(θi −bj)

where the parameter θi corresponds to the ability of LM mi, and the item qj is characterized by parameters aj > 0 (discrimination) and bj (difficulty). Equation 2 is commonly visualized using so-called item characteristic curves (see Appendix A for examples). For model esti- mation, we assume local independence and maximize the probability of the full response matrix U ∈{0, 1}k×l using Markov chain Monte Carlo (Junker et al., 2016), with hierarchical priors on all parameters as suggested by Natesan et al. (2016).

其中参数 θi 对应于 LM mi 的能力，项目 qj 的特征是参数 aj > 0（辨别力）和 bj（难度）。等式 2 通常使用所谓的项目特征曲线进行可视化（示例请参见附录 A）。对于模型估计，我们假设局部独立性，并使用马尔可夫链蒙特卡罗（Junker et al., 2016）最大化完整响应矩阵 U ∈{0, 1}k×l 的概率，并按照 Natesan 等人的建议对所有参数进行分层先验。 （2016）。

Given a fitted 2PL model, the item parameters aj and bj can be used to estimate the ability

给定一个拟合的 2PL 模型，项目参数 aj 和 bj 可用于估计能力

ˆθi of a previously unevaluated LM mi by maximizing

$$
\hat\theta_i=\max_\theta\prod_{j=1}^{l}\left[\operatorname{logistic}\!\left(a_j(\theta-b_j)\right)\right]^{u_{ij}}\left[1-\operatorname{logistic}\!\left(a_j(\theta-b_j)\right)\right]^{1-u_{ij}}. \tag{3}
$$

aj(θ −bj)

1 −logistic

aj(θ −bj)

l ∏ j=1

Here, the item parameters aj and bj are treated as fixed. We use maximum a posteriori estimation (Birnbaum, 1969) to determine ˆθi. Equation 3 defines a benchmark-level ag- gregation as in Equation 1, with SCORE(mi, qj) = uij and AGGREGATE(mi, Q) = ˆθi. We

这里，项目参数aj和bj被视为固定的。我们使用最大后验估计（Birnbaum，1969）来确定 ^θi。公式 3 定义了基准级聚合，如公式 1 所示，其中 SCORE(mi, qj) = uij 且 AGGREGATE(mi, Q) = ˆθi。我们

4

<!-- page 5 of 18 -->

Published as a conference paper at COLM 2025

denote this form of model evaluation as ABILITY(mi, Q), which constitutes one of the two methodological pillars of FLUID BENCHMARKING.

将这种形式的模型评估表示为 ABILITY(mi, Q)，它构成了 FLUID BENCHMARKING 的两个方法论支柱之一。

So far we have only modified AGGREGATE, not SELECT, but IRT allows for a principled way to dynamically adapt Q∗to an LM. Next, we present a method how to do so.

到目前为止，我们只修改了 AGGREGATE，没有修改 SELECT，但 IRT 允许一种原则性的方法来动态地将 Q* 适应 LM。接下来，我们介绍一种方法。

3.2 Dynamic Selection of Evaluation Items · 动态选择评测题目

Benchmarks are used to monitor performance during pretraining, when LMs are undergoing rapid development. Can the same Q∗be optimal for both a near-random word predictor (early in training) and a highly capable model?

当语言模型正在快速开发时，基准用于监控预训练期间的性能。相同的 Q* 对于近随机词预测器（训练早期）和高性能模型是否都是最佳的？

One way to approach this question is by examining the informativeness of items with respect to the ability estimate for a given LM, which can be formalized using Fisher information (Reckase, 2009). In the case of the 2PL model, this is given by

解决这个问题的一种方法是检查项目相对于给定 LM 的能力估计的信息量, 这可以使用 Fisher 信息进行形式化 (Reckase, 2009)。在 2PL 模型下:

$$
I(\theta_i,a_j,b_j)=a_j^2\operatorname{logistic}\!\left(a_j(\theta_i-b_j)\right)\left[1-\operatorname{logistic}\!\left(a_j(\theta_i-b_j)\right)\right]. \tag{4}
$$

I(θi, aj, bj) = a2

j logistic

1 −logistic

aj(θi −bj)

aj(θi −bj)

Fisher information I(θt

i, aj, bj)

0.5

5

It can be shown that items with higher Fisher infor- mation yield more precise ability estimates (Reckase, 2009), and they should be prioritized in Q∗.

可以证明，具有较高 Fisher 信息的项目会产生更精确的能力估计（Reckase，2009），并且应在 Q* 中优先考虑它们。

0.4

0

0.3

0.2

Item difﬁculty bj

0.1

0.0

−5

5

i

0

LM ability θt

−5

0% 20% 40% 60% 80% 100% Training progress

To analyze how the informativeness of items change as a function of LM ability, we examine HellaSwag (Zellers et al., 2019). We consider the scenario of pre- training mentioned above and simulate a training run with 50 checkpoints. In Figure 2, we show how the Fisher information distributes over HellaSwag items as a function of training progress. The subset of items with the highest Fisher information substan- tially changes over the course of the training run, from very easy items at the beginning of training, to very difficult items at the end of training. These findings suggest that adapting Q∗to the capability level of an LM could result in more precise ability estimates compared to using a static set of items.

为了分析项目的信息量如何随着 LM 能力的变化而变化，我们研究了 HellaSwag (Zellers et al., 2019)。我们考虑上面提到的预训练场景，并模拟具有 50 个检查点的训练运行。在图 2 中，我们展示了 Fisher 信息如何根据训练进度分布在 HellaSwag 项目上。具有最高 Fisher 信息的项目子集在训练过程中发生了很大的变化，从训练开始时非常简单的项目到训练结束时非常困难的项目。这些发现表明，与使用静态项目集相比，使 Q* 适应 LM 的能力水平可能会导致更精确的能力估计。

Figure 2: Fisher information (Equa- tion 4) of HellaSwag items as a func- tion of training progress. Lower panel: simulated trajectory of LM ability, which evolves linearly from θ1

i = −7 to θ50

i = +7; upper panel: Fisher information of HellaSwag items. The HellaSwag items with highest Fisher information change drastically during training (see Ap- pendix B for more details).

我=+7；上图：HellaSwag 物品的 Fisher 信息。具有最高 Fisher 信息的 HellaSwag 项目在训练期间发生巨大变化（更多详细信息，请参阅附录 B）。

Formulation. Inspired by these observations, we draw upon methods developed in the education- research context of computerized adaptive testing (Meijer & Nering, 1999; Chang, 2015; Magis et al., 2017) to adapt Q∗to the capability level of an LM mi. Specifically, we evaluate the LM by iteratively selecting the item from Q with the highest Fisher information given the current ability estimate,

配方。受这些观察的启发，我们利用在计算机自​​适应测试的教育研究背景下开发的方法（Meijer & Nering，1999；Chang，2015；Magis 等人，2017）来使 Q* 适应 LM mi 的能力水平。具体来说，我们通过在给定当前能力估计的情况下迭代地从 Q 中选择具有最高 Fisher 信息的项目来评估 LM，

$$
Q_i^*(0)=\emptyset;\qquad Q_i^*(t)=Q_i^*(t-1)\cup\left\{\arg\max_{q_j\in Q\setminus Q_i^*(t-1)}I\!\left(\operatorname{ability}(m_i,Q_i^*(t-1)),a_j,b_j\right)\right\}. \tag{5}
$$

We repeat this procedure until the total number of administered items has reached the budgeted size for Q∗, at which point we let Q∗

我们重复这个过程，直到管理项目的总数达到 Q* 的预算大小，此时我们让 Q*

i = Q∗

i (t). Using Equation 5 for SELECT, we compute EVALUATE(mi, Q) = ABILITY(mi, Q∗

它）。使用公式 5 进行 SELECT，我们计算 EVALUATE(mi, Q) = ABILITY(mi, Q*

i ) as the final evaluation score.

Dynamically selecting items based on Fisher information is expected to reinforce the very properties that make IRT-based methods promising for LM evaluation to begin with. For example, given that I ∝a2

基于 Fisher 信息动态选择项目有望强化基于 IRT 的方法在 LM 评估中的应用前景。例如，假设我 ∝a2

j (Equation 4), low-discrimination items are unlikely to be included

in Q∗. Similarly, because I is maximized when θi = bj (where I = a2

j /4), dynamic selection naturally adapts to the capability level of an LM, evaluating weaker LMs on easier items and stronger LMs on more difficult ones.

j/4)，动态选择自然地适应 LM 的能力水平，在较容易的项目上评估较弱的 LM，在较困难的项目上评估较强的 LM。

5

<!-- page 6 of 18 -->

Published as a conference paper at COLM 2025

4 Experiments · 实验

4.1 Experimental Setup · 实验设置

In this paper, we focus on LM evaluation during pretraining. While the four dimensions of benchmark refinement, introduced in §2, are relevant across evaluative settings, pretraining provides a particularly suitable testbed, as it allows for straightforward quantification and measurement of each dimension (see §4.2).

在本文中，我们重点关注预训练期间的 LM 评估。虽然第 2 节中介绍的基准细化的四个维度与评估设置相关，但预训练提供了一个特别合适的测试平台，因为它允许对每个维度进行直接量化和测量（参见第 4.2 节）。

More specifically, we examine the pretraining runs of six LMs with publicly available checkpoints. Our main focus lies on 7B LMs, for which we pick Amber-6.7B (Liu et al., 2023), OLMo1-7B (Groeneveld et al., 2024), OLMo2-7B (OLMo et al., 2025), and Pythia-6.9B (Biderman et al., 2023). We also examine a smaller LM, specifically Pythia-2.8B (Biderman et al., 2023), as well as a larger LM, specifically K2-65B (Liu et al., 2025). For each LM, we evenly select between 61 and 94 checkpoints (see Appendix C for more details).

更具体地说，我们使用公开可用的检查点检查了六个 LM 的预训练运行。我们的主要关注点在于 7B LM，为此我们选择 Amber-6.7B (Liu et al., 2023)、OLMo1-7B (Groeneveld et al., 2024)、OLMo2-7B (OLMo et al., 2025) 和 Pythia-6.9B (Biderman et al., 2023)。我们还研究了较小的 LM，特别是 Pythia-2.8B（Biderman 等人，2023），以及较大的 LM，特别是 K2-65B（Liu 等人，2025）。对于每个 LM，我们均匀地选择 61 到 94 个检查点（更多详细信息请参阅附录 C）。

In terms of benchmarks, we focus on the Open LLM Leaderboard (Beeching et al., 2023), which comprises ARC Challenge (Clark et al., 2018), GSM8K (Cobbe et al., 2021), HellaSwag (Zellers et al., 2019), MMLU (Hendrycks et al., 2021), TruthfulQA (Lin et al., 2022), and Wino- Grande (Sakaguchi et al., 2020). For the IRT models underlying FLUID BENCHMARKING, we fit 2PL models to the evaluation results of LMs contained in the Open LLM Leaderboard. We exclude the six test LMs and related models (e.g., OLMo1-1B), as well as posttrained models, since our experiments focus on evaluation during LM pretraining. This results in a final set of 102 LMs used for IRT model training (see Appendix D for the full inclusion criteria). We fit separate unidimensional IRT models for each benchmark; we initially experimented with multidimensional models as well as a single unidimensional model across all benchmarks, but these approaches yielded worse results (see Appendix E for details).

在基准方面，我们重点关注 Open LLM Leaderboard (Beeching et al., 2023)，其中包括 ARC Challenge (Clark et al., 2018)、GSM8K (Cobbe et al., 2021)、HellaSwag (Zellers et al., 2019)、MMLU (Hendrycks et al., 2021)、TruthfulQA (Lin et al., 2021)等人，2022）和 Wino-Grande（Sakaguchi 等人，2020）。对于 FLUID BENCHMARKING 基础的 IRT 模型，我们将 2PL 模型与 Open LLM Leaderboard 中包含的 LM 的评估结果进行拟合。我们排除了六个测试 LM 和相关模型（例如 OLMo1-1B）以及训练后模型，因为我们的实验重点是 LM 预训练期间的评估。这将产生用于 IRT 模型训练的最终 102 个 LM 集合（有关完整的纳入标准，请参阅附录 D）。我们为每个基准拟合单独的一维 IRT 模型；我们最初在所有基准测试中尝试使用多维模型以及单个一维模型，但这些方法产生了更糟糕的结果（详细信息请参阅附录 E）。

We then evaluate all checkpoints of the six selected LMs on the six benchmarks and vary the evaluation strategy (see §4.3). In total, we examine 2,802 checkpoint-benchmark combi- nations, resulting in over 13 million item-level evaluations.

然后，我们在六个基准上评估六个选定 LM 的所有检查点，并改变评估策略（参见§4.3）。我们总共检查了 2,802 个检查点基准组合，产生了超过 1300 万个项目级评估。

4.2 Evaluation Measures · 评测指标

We operationalize the four dimensions of evaluation quality introduced in §2 as follows:

– Efficiency. We measure efficiency by systematically varying the number of items used

for evaluating on a benchmark (i.e., the size of Q∗). We explore a range of subset sizes, varying from 10 to 500 items per benchmark. – Validity. We evaluate validity by testing how well estimated performance on one bench-

用于评估基准（即 Q* 的大小）。我们探索一系列子集大小，每个基准包含 10 到 500 个项目。 - 有效性。我们通过测试在一个工​​作台上评估性能的好坏来评估有效性 -

mark predicts performance on a different benchmark that targets the same capability. Specifically, we compute the distance between an LMs’ predicted ranks on the two benchmarks. We always calculate the rank for the second benchmark based on accuracy. We examine ARC Challenge and MMLU, which assess knowledge and reasoning, and HellaSwag and WinoGrande, which assess commonsense reasoning. – Variance. We measure the step-to-step variance of the training curve for a combination of

mark 预测针对相同功能的不同基准的性能。具体来说，我们计算 LM 在两个基准上的预测排名之间的距离。我们总是根据准确性计算第二个基准的排名。我们研究了评估知识和推理的 ARC Challenge 和 MMLU，以及评估常识推理的 HellaSwag 和 WinoGrande。 – 方差。我们测量训练曲线的逐步方差

LM and benchmark. Specifically, let xt

i(Q) = EVALUATE(mt

i, Q) represent the measured performance (e.g., accuracy) on benchmark Q for model mi at a certain checkpoint t. We measure the normalized total variation,

i, Q) 表示模型 mi 在某个检查点 t 的基准 Q 上测得的性能（例如，准确性）。我们测量归一化总变异，

$$
\operatorname{TV}(m_i,Q)=\frac{n}{n-1}\times\frac{\sum_{t=1}^{n-1}|x_i^{t+1}(Q)-x_i^t(Q)|}{|x_i^n(Q)-x_i^1(Q)|}. \tag{6}
$$

where a lower value means lower variance and hence better evaluation quality. – Saturation. To measure the saturation of a benchmark under a given evaluation strategy,

其中较低的值意味着较低的方差，因此意味着更好的评估质量。 – 饱和度。为了衡量给定评估策略下基准的饱和度，

we compute the monotonicity of the training curve, defined as the absolute Spearman rank correlation between the sequence of checkpoints and the predicted performance values (e.g., accuracies). More monotonic training curves indicate that increased pretrain- ing consistently yields better performance, suggesting that the benchmark has not yet saturated (at least for LMs within the considered capability range).

我们计算训练曲线的单调性，定义为检查点序列与预测性能值（例如准确性）之间的绝对斯皮尔曼等级相关性。更单调的训练曲线表明，增加预训练始终会产生更好的性能，这表明基准尚未饱和（至少对于所考虑的能力范围内的 LM 而言）。

6

<!-- page 7 of 18 -->

Published as a conference paper at COLM 2025

BaselineItems per benchmark

Measure Method AP10 AP50 TB100 MB143 SM460 MA1,848 Validity BASELINE 20.0 15.2 9.8 8.7 15.9 14.5 Rank distance ↓ FLUID BENCHMARKING 10.1 8.8 8.7 8.6 14.0 8.3

Variance BASELINE 28.3 19.1 30.5 17.9 10.0 20.4 Total variation ↓ FLUID BENCHMARKING 10.7 6.5 6.1 5.5 2.8 4.8

Saturation BASELINE 0.48 0.62 0.69 0.79 0.88 0.64 Rank correlation ↑ FLUID BENCHMARKING 0.76 0.86 0.85 0.85 0.97 0.77

Table 1: Comparison against baseline methods. AP: ANCHOR POINTS (Vivek et al., 2024); TB: TINYBENCHMARKS (Polo et al., 2024); MB: METABENCH (Kipnis et al., 2025); SM: SMART (Gupta et al., 2024); MA: MAGI (Paech, 2024). The table shows the results averaged across six benchmarks, six LMs, and between 61 and 94 checkpoints per LM, totaling 2,802 values contributing to each mean. For METABENCH, the number of items is an average across benchmarks, and we exactly match the benchmark-level numbers for the comparison.

4.3 Baselines · 基线

We compare against several previous benchmark refinement methods. First, we examine ANCHOR POINTS (Vivek et al., 2024), a method for efficient evaluation based on item clustering. We use the Open LLM Leaderboard to cluster the benchmarks and consider two subset sizes in the range examined by the authors (10 and 50). We also examine two IRT-based methods, TINYBENCHMARKS (Polo et al., 2024) and METABENCH (Kipnis et al., 2025), and compare directly against their subsets and evaluation tools. In terms of methods for increasing difficulty, we include the hard versions of ARC Challenge and MMLU from SMART (Gupta et al., 2024) and MAGI (Paech, 2024), respectively.

我们与之前的几种基准细化方法进行了比较。第一步，我们研究了锚点（Vivek et al., 2024），这是一种基于项目聚类的高效评估方法。我们使用 Open LLM Leaderboard 对基准进行聚类，并考虑作者检查范围内的两个子集大小（10 和 50）。我们还研究了两种基于 IRT 的方法，TINYBENCHMARKS（Polo 等人，2024 年）和 METABENCH（Kipnis 等人，2025 年），并直接与它们的子集和评估工具进行比较。在增加难度的方法方面，我们分别包括来自 SMART (Gupta et al., 2024) 和 MAGI (Paech, 2024) 的 ARC Challenge 和 MMLU 的硬版本。

FLUID BENCHMARKING differs from prior methods through its AGGREGATE (§3.1) and its SELECT (§3.2). To disentangle these factors, we consider a baseline in which we ablate SELECT and compute an ability estimate based on a random subset of items (RANDOM IRT). In addition, we consider a baseline in which we ablate both SELECT and AGGREGATE, using a random subset of items to compute accuracy (RANDOM), a popular approach for efficient evaluation (Liang et al., 2023; Gu et al., 2024; Perlitz et al., 2024a).

流体基准测试与以前的方法的不同之处在于其聚合（§3.1）和选择（§3.2）。为了理清这些因素，我们考虑一个基线，在该基线中我们消除 SELECT 并根据项目的随机子集 (RANDOM IRT) 计算能力估计。此外，我们考虑了一个基线，其中我们消除了 SELECT 和 AGGREGATE，使用项目的随机子集来计算准确性（RANDOM），这是一种有效评估的流行方法（Liang et al., 2023; Gu et al., 2024; Perlitz et al., 2024a）。

5 Results · 结果

FLUID BENCHMARKING outperforms all baselines across all dimensions and sample sizes, often by a wide margin (see Appendix F for breakdowns by benchmark and LM).

流体基准测试在所有维度和样本量上都优于所有基线，通常差距很大（请参阅附录 F 了解基准测试和 LM 的细分）。

Validity. Table 1 (top panel) shows that FLUID BENCHMARKING leads to smaller rank distances than all baselines. It outperforms ANCHOR POINTS, SMART, and MAGI by wide margins, almost halving the mean rank distance of ANCHOR POINTS. The IRT-based methods are better, but FLUID BENCHMARKING still outperforms them.

有效性。表 1（上图）显示，FLUID BENCHMARKING 导致的排名距离比所有基线更小。它的表现远远优于 ANCHOR POINTS、SMART 和 MAGI，几乎将 ANCHOR POINTS 的平均排名距离减半。基于 IRT 的方法更好，但 FLUID BENCHMARKING 仍然优于它们。

Table 2 (top panel) shows that ablating the dynamic selection of items (FLUID BENCH-

MARKING vs. RANDOM IRT) results in lowered validity, but the gap diminishes with more items. This is expected since (dynamic) Q∗

标记与随机 IRT）会导致有效性降低，但随着项目的增加，差距会缩小。这是预期的，因为（动态）Q*

i approximates (static) Q∗as the number of items increases, resulting in converging ability estimates. Ablating the IRT-based ability estima- tion (RANDOM vs. RANDOM IRT) leads to a much bigger drop in validity (see Figure 1d), suggesting that the information provided by IRT is particularly beneficial for improving the predictiveness of performance estimates. This is also supported by the high validity of the two IRT-based baselines TINYBENCHMARKS and METABENCH.

随着项目数量的增加，i 近似（静态）Q*，从而产生收敛能力估计。消除基于 IRT 的能力估计（随机与随机 IRT）会导致有效性大幅下降（见图 1d），这表明 IRT 提供的信息对于提高性能估计的预测性特别有益。两个基于 IRT 的基线 TINYBENCHMARKS 和 METABENCH 的高有效性也支持了这一点。

Variance. Table 1 (mid panel) shows that FLUID BENCHMARKING outperforms all base- lines in terms of step-to-step variance. This trend holds consistently across LMs, benchmarks, and subset sizes (see Appendix G for details). Figure 1c illustrates this with the evaluation of Pythia-2.8B on ARC Challenge, using 30 items. Interestingly, the gap between TINY-

方差。表 1（中图）显示，FLUID BENCHMARKING 在逐步方差方面优于所有基线。这种趋势在语言模型、基准测试和子集大小中始终保持不变（详细信息请参阅附录 G）。图 1c 通过使用 30 个项目在 ARC Challenge 上对 Pythia-2.8B 的评估说明了这一点。有趣的是，TINY-之间的差距

7

<!-- page 8 of 18 -->

Published as a conference paper at COLM 2025

Items per benchmark

Measure Method 10 50 100 500

Validity RANDOM 20.0 15.2 16.9 9.1 Rank distance ↓ RANDOM IRT 14.1 11.1 10.6 8.4 FLUID BENCHMARKING 10.1 8.8 8.7 8.3

Variance RANDOM 29.0 19.1 19.8 10.2 Total variation ↓ RANDOM IRT 18.2 15.7 17.8 10.9 FLUID BENCHMARKING 10.7 6.5 6.1 4.9

Saturation RANDOM 0.47 0.62 0.64 0.79 Rank correlation ↑ RANDOM IRT 0.48 0.69 0.71 0.85 FLUID BENCHMARKING 0.76 0.86 0.85 0.88

Table 2: Comparison against ablated methods. See caption of Table 1 for more details.

BENCHMARKS and METABENCH on the one hand, and the remaining baselines on the other, is much less pronounced than for validity—the two methods even lead to worse results for variance (e.g., TINYBENCHMARKS/100 items: 30.5 vs. RANDOM/100 items: 19.8).

一方面，BENCHMARKS 和 METABENCH 以及另一方面剩余的基线，远不如有效性明显 — 这两种方法甚至会导致更差的方差结果（例如，TINYBENCHMARKS/100 个项目：30.5 与 RANDOM/100 个项目：19.8）。

Table 2 (mid panel) reflects this trend: the gap is smaller between RANDOM and RANDOM

IRT than between RANDOM IRT and FLUID BENCHMARKING—on 500 items, RANDOM IRT even leads to a higher variance than RANDOM. This suggests that the key to FLUID BENCHMARKING’s low variance lies in its dynamic item selection, which is consistent with psychometric theory: since the variance of ability estimates is inversely proportional to test information (Lord, 1983), and since FLUID BENCHMARKING selects highly informative items, the resulting measurement error is substantially reduced.

IRT 与随机 IRT 和流体基准之间的比较 — 在 500 个项目上，随机 IRT 甚至会导致比随机 IRT 更高的方差。这表明FLUID BENCHMARKING低方差的关键在于其动态的项目选择，这与心理测量理论是一致的：由于能力估计的方差与测试信息成反比（Lord，1983），并且由于FLUID BENCHMARKING选择信息量高的项目，因此所产生的测量误差大大减少。

Saturation. Tables 1 and 2 show that FLUID BENCHMARKING consistently outperforms all baselines in terms of saturation as well (see Appendix G for details). SMART and MAGI perform better than some of the other baselines, suggesting that these methods partially mitigate the saturation problem, yet FLUID BENCHMARKING addresses it more effectively.

饱和。表 1 和表 2 显示，FLUID BENCHMARKING 在饱和度方面也始终优于所有基线（详情请参阅附录 G）。 SMART 和 MAGI 比其他一些基线表现更好，这表明这些方法部分缓解了饱和问题，但 FLUID BENCHMARKING 更有效地解决了这个问题。

Efficiency. Taking a global look at the results, we observe that FLUID BENCHMARKING leads to improvements across all subset sizes, but is especially effective for small sample sizes. For example, with 500 items FLUID BENCHMARKING improves the mean rank distance (validity) of RANDOM by 0.8, but with 10 items by 9.9.

效率。从全局角度来看结果，我们发现流体基准测试可以在所有子集大小上带来改进，但对于小样本量尤其有效。例如，对于 500 个项目，FLUID BENCHMARKING 将 RANDOM 的平均排名距离（有效性）提高了 0.8，但对于 10 个项目则提高了 9.9。

In Appendix H, we show that FLUID BENCHMARKING can improve evaluation quality even when efficiency is not a concern, outperforming full-benchmark accuracy.

在附录 H 中，我们表明，即使效率并非问题，流体基准测试也可以提高评估质量，优于全基准测试精度。

6 Analysis and Discussion · 分析与讨论

FLUID BENCHMARKING Avoids Mislabeled Items. To test whether FLUID BENCHMARK- ING indeed avoids problematic instances such as mislabeled questions, we leverage MMLU- Redux (Gema et al., 2024), a recent effort that annotated MMLU questions for label errors. We compute the average number of mislabeled items in FLUID BENCHMARKING and RAN-

流体基准测试避免贴错标签的物品。为了测试 FLUID BENCHMARKING 是否确实避免了问题实例，例如错误标记的问题，我们利用 MMLU-Redux（Gema 等人，2024），这是最近的一项工作，注释了 MMLU 问题的标签错误。我们计算 FLUID BENCHMARKING 和 RAN 中错误标记项目的平均数量

DOM (|Q∗| = 100) across all LMs and checkpoints, finding that it is nearly two orders of magnitude smaller in the former (0.01) than in the latter (0.75)—in other words, while it takes roughly 100 benchmarking sessions for a mislabeled item to appear with FLUID BENCH- MARKING, one occurs in nearly every session with RANDOM. This suggests that FLUID BENCHMARKING is highly effective at avoiding mislabeled items.

对所有 LM 和检查点进行 DOM (|Q*| = 100) 测试，发现前者 (0.01) 比后者 (0.75) 小了近两个数量级，也就是说，虽然使用 FLUID BENCHMARKING 时大约需要 100 个基准测试会话才会出现错误标记的项目，但使用 RANDOM 时几乎每个会话都会出现一个。这表明流体基准在避免贴错标签方面非常有效。

FLUID BENCHMARKING Adapts Items to Language Model Capability. To test whether item selection indeed dynamically adapts to the capability level of a given LM, we analyze how item selection changes as an LM gets better over the course of pretraining. Figure 3 visualizes the items selected for FLUID BENCHMARKING (|Q∗| = 50) with OLMo1-7B evaluated on HellaSwag. We observe a substantial shift in the selected items: initially, items are very easy, but they get gradually more difficult as the LM improves.

流畅的基准测试使项目适应语言模型功能。为了测试项目选择是否确实动态地适应给定 LM 的能力水平，我们分析了随着 LM 在预训练过程中变得更好，项目选择如何变化。图 3 显示了在 HellaSwag 上评估的 OLMo1-7B 为流体基准测试 (|Q*| = 50) 选择的项目。我们观察到所选项目的重大变化：最初，项目非常简单，但随着 LM 的改进，它们逐渐变得更加困难。

8

<!-- page 9 of 18 -->

Published as a conference paper at COLM 2025

50

2

40

30

0

20

Item difﬁculty bj

10

−2

0

0 10 20 30 40 50 60 70 80 Checkpoint

Figure 3: FLUID BENCHMARKING of OLMo1-7B (HellaSwag/50 items). The figure shows items (stacked along y-axis) selected for FLUID BENCHMARKING as a function of different checkpoints. Items are ordered by difficulty bj. Items selected for FLUID BENCHMARKING are colored by time of selection; brighter colors reflect earlier appearance during evaluation. The bright line close to y = 0 represents the first item, which is always the same. Depending on how the LM responds, the next item is either easier (incorrect response, see first few checkpoints) or more difficult (correct response, see checkpoints after 11).

2.7

0.82

2.6

Accuracy

0.81

2.5

Estimated LM ability ˆθi

70.0% 75.0% 80.0% 85.0% 90.0% 95.0% 100.0% Training progress

70.0% 75.0% 80.0% 85.0% 90.0% 95.0% 100.0% Training progress

(a) RANDOM

(b) FLUID BENCHMARKING

Figure 4: Training curves of OLMo2-7B (HellaSwag/500 items) with RANDOM (a) and FLUID BENCHMARKING (b). The figures plot the final 30% of training. While performance in accuracy space shows no meaningful improvement (a), performance in ability space continues to provide a clear learning signal through the end of training (b).

FLUID BENCHMARKING Delays Onset of Benchmark Saturation. To test whether FLUID BENCHMARKING indeed delays the onset of benchmark saturation, we focus on HellaSwag (|Q∗| = 500). Figure 4a shows OLMo2-7B’s performance during the final 30% of the training run, measured with RANDOM. Performance is already high by the 70% mark and does not show a consistent upward trend thereafter, instead fluctuating around the same level. By contrast, with FLUID BENCHMARKING (see Figure 4b), performance continues to improve steadily through the end of training, suggesting that FLUID BENCHMARKING effectively mitigates early benchmark saturation. This difference is captured by our measure of saturation: for the entire training run, the monotonicity of the HellaSwag curve is 0.91 for RANDOM, compared to 0.99 for FLUID BENCHMARKING.

流体基准测试延迟基准饱和的开始。为了测试 FLUID BENCHMARKING 是否确实延迟了基准饱和的开始，我们重点关注 HellaSwag (|Q*| = 500)。图 4a 显示了使用 RANDOM 测量的 OLMo2-7B 在训练运行的末尾 30% 期间的性能。性能已经达到了 70% 的高位，此后并没有表现出持续的上升趋势，；实际是在同一水平附近波动。相比之下，使用 FLUID BENCHMARKING（见图 4b），性能在训练结束时继续稳步提高，这表明 FLUID BENCHMARKING 有效地缓解了早期基准饱和。我们的饱和度测量捕获了这种差异：对于整个训练运行，随机性的 HellaSwag 曲线的单调性为 0.91，而流体基准测试的单调性为 0.99。

80

60

40

Number of items |Q∗|

20

0 20 40 60 80 Checkpoint

Figure 5: FLUID BENCHMARKING with dynamic stopping on OLMo1- 7B/HellaSwag (see text for details).

Dynamic Stopping. A further advantage of FLUID BENCHMARKING is its support for dynamic stopping. In Figure 5, we demonstrate this with OLMo1-7B and HellaSwag, where we use the standard error of the ability estimate as the stopping criterion (Magis et al., 2017). Specifically, we terminate the evaluation once the standard error falls below the average ability gap between two rank-adjacent LMs on the Open LLM Leaderboard. The number of items required to reach this precision varies substantially over training, from around 20 at the beginning to over 80 midway, indicating that the common practice of using a fixed number of evaluation items is suboptimal.

动态停止。 FLUID BENCHMARKING 的另一个优点是它支持动态停止。在图 5 中，我们使用 OLMo1-7B 和 HellaSwag 演示了这一点，其中我们使用能力估计的标准误差作为停止标准（Magis 等人，2017）。具体来说，一旦标准误差低于开放 LLM 排行榜上两个排名相邻的 LM 之间的平均能力差距，我们就会终止评估。达到这种精度所需的项目数量在训练过程中变化很大，从开始时的 20 左右到中期的 80 多个，这表明使用固定数量的评估项目的常见做法并非最理想的。

9

<!-- page 10 of 18 -->

Published as a conference paper at COLM 2025

The False False Promise of Item Response Theory. Madaan et al. (2024) criticized IRT- based benchmark refinement methods for increasing variance, speaking of a “false promise of item response theory” for LMs. Our findings contextualize this in crucial ways. On the one hand, we confirm Madaan et al. (2024)’s observation that IRT-based methods (Polo et al., 2024; Kipnis et al., 2025) increase step-to-step variance. On the other hand, our results demonstrate that the issue is not intrinsic to IRT itself, but rather arises from the fact that prior IRT-based methods have not fully leveraged a central strength of IRT: dynamically adapting items to the LM’s capability. We find that exploiting this potential substantially reduces variance compared to accuracy-based evaluations.

项目反应理论的错误承诺。马达安等人。 (2024) 批评基于 IRT 的基准细化方法增加了方差，并谈到了 LM 的“项目响应理论的错误承诺”。我们的研究结果以关键方式将这一点置于背景之中。一方面，我们确认 Madaan 等人。 (2024) 观察到基于 IRT 的方法 (Polo et al., 2024; Kipnis et al., 2025) 增加了逐步方差。另一方面，我们的结果表明，这个问题并非 IRT 本身固有的，；实际是源于以下事实：之前基于 IRT 的方法没有充分利用 IRT 的核心优势：根据 LM 的能力动态调整项目。我们发现，与基于准确性的评估相比，利用这种潜力可以大大减少方差。

Extension to Other Settings. While we focus on LM evaluation during pretraining in this paper, where efficiency is especially critical due to high computational costs and the need for frequent in-loop evaluations, FLUID BENCHMARKING is not inherently limited to this phase and holds potential value for posttraining as well. Furthermore, FLUID BENCHMARKING is readily extendable to other languages and modalities, provided that evaluation results are available to fit an IRT model. For example, applying FLUID BENCHMARKING to vision- language models could leverage leaderboards such as VHELM (Lee et al., 2024).

扩展到其他设置。虽然我们在本文中重点关注预训练期间的 LM 评估，由于高计算成本和需要频繁的循环内评估，效率尤其重要，但 FLUID BENCHMARKING 本质上并不局限于此阶段，并且对于后训练也具有潜在价值。此外，只要评估结果适合 IRT 模型，FLUID BENCHMARKING 就可以轻松扩展到其他语言和模式。例如，将 FLUID BENCHMARKING 应用于视觉语言模型可以利用 VHELM 等排行榜（Lee et al., 2024）。

Generalization Beyond Train Language Models. While IRT ability estimates are not inherently upper bounded by the abilities of the train LMs (i.e., the LMs used to estimate item parameters), the utility of FLUID BENCHMARKING still depends on having stable and up-to-date IRT models, especially given the rapid pace of LM development. Consider the subset of benchmark items that were not answered correctly by any train LM. These items are effectively assigned the same maximum difficulty. If we conduct FLUID BENCHMARKING with a new LM that is better than any train LM, evaluation will quickly move to those most difficult items. However, a fixed IRT model cannot distinguish finer levels of difficulty among them. Therefore, IRT models used for FLUID BENCHMARKING should be regularly updated with fresh evidence. We hope that the IRT models released as part of this paper can serve as a starting point for such an extensible reference standard.

超越训练语言模型的泛化。虽然 IRT 能力估计本质上不受训练 LM（即用于估计项目参数的 LM）能力的上限，但 FLUID BENCHMARKING 的实用性仍然取决于稳定且最新的 IRT 模型，特别是考虑到 LM 开发的快速步伐。考虑任何训练 LM 都未正确回答的基准项目子集。这些项目实际上被分配了相同的最大难度。如果我们使用比任何训练 LM 更好的新 LM 进行流体基准测试，评估将很快转向那些最困难的项目。然而，固定的 IRT 模型无法区分它们之间更精细的难度级别。因此，用于流体基准测试的 IRT 模型应定期更新新证据。我们希望作为本文一部分发布的 IRT 模型可以作为这种可扩展参考标准的起点。

7 Related Work · 相关工作

Our study adds to the growing body of work on benchmark refinement (see §2 for details). Besides providing a formal definition of this emerging field, we introduce a method that improves benchmarking across multiple dimensions.

我们的研究补充了基准细化方面不断增长的工作（详细信息请参见§2）。除了提供这个新兴领域的正式定义之外，我们还引入了一种改进多个维度基准测试的方法。

Prior work has used IRT models in natural language processing (Lalor et al., 2016; 2018; 2019; Lalor & Yu, 2020; Rodriguez et al., 2021; Vania et al., 2021; Rodriguez et al., 2022; Lalor et al., 2024). Recently, there have been several attempt to use IRT in the context of benchmark refinement, to improve efficiency (Polo et al., 2024; Kipnis et al., 2025) and mitigate benchmark saturation (Paech, 2024). Our work differs by considering a wider set of criteria and focusing on evaluation during pretraining; we also show that static benchmarks forego the full potential of IRT, which lies in the possibility of adaptive testing.

先前的工作已在自然语言处理中使用 IRT 模型（Lalor et al., 2016; 2018; 2019; Lalor & Yu, 2020; Rodriguez et al., 2021; Vania et al., 2021; Rodriguez et al., 2022; Lalor et al., 2024）。最近，人们尝试在基准细化的背景下使用 IRT，以提高效率（Polo 等人，2024 年；Kipnis 等人，2025 年）并减轻基准饱和度（Paech，2024 年）。我们的工作有所不同，因为考虑了更广泛的标准并侧重于预训练期间的评估；我们还表明，静态基准测试放弃了 IRT 的全部潜力，而 IRT 的潜力在于自适应测试的可能性。

So far, uses of adaptive testing in natural language processing have been confined to improving the cold start problem (Rodriguez et al., 2021).

到目前为止，自适应测试在自然语言处理中的使用仅限于改善冷启动问题（Rodriguez 等人，2021）。

8 Conclusion · 结论

In this work, we unify disparate lines of research to introduce the general problem of benchmark refinement. We define four key dimensions along which benchmark refinement methods should be evaluated: efficiency, validity, variance, and saturation. We introduce FLUID BENCHMARKING, a new benchmarking method that combines item response theory with adaptive testing, improving over prior approaches along all dimensions. In a recent perspective, Zhuang et al. (2024) argued that adaptive testing “will become the new norm in AI model evaluation,” but so far a large-scale analysis of its potential as a general evaluation method has been missing. Our study is the first to provide this analysis and establishes a foundation for new, exciting research in AI evaluation methodology.

在这项工作中，我们统一了不同的研究方向来介绍基准细化的一般问题。我们定义了评估基准细化方法的四个关键维度：效率、有效性、方差和饱和度。我们引入了流体基准测试，这是一种新的基准测试方法，它将项目响应理论与自适应测试相结合，在所有维度上改进了先前的方法。从最近的角度来看，庄等人。 (2024) 认为自适应测试“将成为人工智能模型评估的新规范”，但到目前为止，还没有对其作为通用评估方法的潜力进行大规模分析。我们的研究首次提供了这种分析，并为人工智能评估方法的新的、令人兴奋的研究奠定了基础。

10

<!-- page 11 of 18 -->

Published as a conference paper at COLM 2025

Acknowledgments

This material is based upon work supported by the U.S. National Science Foundation (#2113530, #2313998). Any expressed opinions, findings, and conclusions or recommenda- tions are those of the author(s) and do not necessarily reflect the views of the U.S. National Science Foundation. IM was supported by the NSF CSGrad4US Fellowship. PWK was supported by the Singapore National Research Foundation and the National AI Group in the Singapore Ministry of Digital Development and Information under the AI Visiting Professorship Programme (#AIVP-2024-001) and the AI2050 program at Schmidt Sciences. Our special thanks go to the members of AllenNLP, Oyvind Tafjord, and Sarah Wiegreffe for insightful discussions, as well as to the reviewers for their valuable feedback.

本材料基于美国国家科学基金会 (#2113530、#2313998) 支持的工作。任何表达的观点、发现、结论或建议均为作者的观点，并不一定反映美国国家科学基金会的观点。 IM 得到了 NSF CSGrad4US 奖学金的支持。 PWK 得到了新加坡国家研究基金会和新加坡数字发展和信息部国家人工智能小组的人工智能客座教授计划 (#AIVP-2024-001) 和施密特科学公司的 AI2050 计划的支持。我们特别感谢 AllenNLP、Oyvind Tafjord 和 Sarah Wiegreffe 的成员富有洞察力的讨论，以及审稿人的宝贵反馈。

References

Edward Beeching, Cl´ementine Fourrier, Nathan Habib, Sheon Han, Nathan Lambert,

Nazneen Rajani, Omar Sanseviero, Lewis Tunstall, and Thomas Wolf. Open LLM leader- board. https://huggingface.co/spaces/open-llm-leaderboard-old/open llm leaderboard, 2023.

Stella Biderman, Hailey Schoelkopf, Quentin Gregory Anthony, Herbie Bradley, Kyle

O’Brien, Eric Hallahan, Mohammad Aflah Khan, Shivanshu Purohit, Usvsn Sai Prashanth, Edward Raff, Aviya Skowron, Lintang Sutawika, and Oskar van der Wal. Pythia: A suite for analyzing large language models across training and scaling. In Proceedings of the 40th International Conference on Machine Learning, 2023.

Allan Birnbaum. Some latent trait models and their use in inferring an examinee’s ability.

In Frederic M. Lord and Melvin Novick (eds.), Statistical Theories of Mental Test Scores, pp. 392–479. Addison-Wesley, Reading, MA, 1968.

Allan Birnbaum. Statistical theory for logistic mental test models with a prior distribution

of ability. Journal of Mathematical Psychology, 6(2):258–276, 1969.

Hua-Hua Chang. Psychometrics behind computerized adaptive testing. Psychometrika, 80

(1):1–20, 2015.

Peter Clark, Isaac Cowhey, Oren Etzioni, Tushar Khot, Ashish Sabharwal, Carissa Schoenick,

and Oyvind Tafjord. Think you have solved question answering? Try ARC, the AI2 reasoning challenge. arXiv:1803.05457, 2018.

Karl Cobbe, Vineet Kosaraju, Mohammad Bavarian, Mark Chen, Heewoo Jun, Lukasz Kaiser,

Matthias Plappert, Jerry Tworek, Jacob Hilton, Reiichiro Nakano, Christopher Hesse, and John Schulman. Training verifiers to solve math word problems. arXiv:2110.14168, 2021.

Christine DeMars. Item Response Theory. Oxford University Press, Oxford, UK, 2010.

Aryo Pradipta Gema, Joshua Ong Jun Leang, Giwon Hong, Alessio Devoto, Alberto

Carlo Maria Mancino, Rohit Saxena, Xuanli He, Yu Zhao, Xiaotang Du, Mohammad Reza Ghasemi Madani, Claire Barale, Robert McHardy, Joshua Harris, Jean Kaddour, Emile van Krieken, and Pasquale Minervini. Are we done with MMLU? arXiv:2406.04127, 2024.

Dirk Groeneveld, Iz Beltagy, Evan Walsh, Akshita Bhagia, Rodney Kinney, Oyvind Tafjord,

Ananya Jha, Hamish Ivison, Ian Magnusson, Yizhong Wang, Shane Arora, David Atkin- son, Russell Authur, Khyathi Chandu, Arman Cohan, Jennifer Dumas, Yanai Elazar, Yuling Gu, Jack Hessel, Tushar Khot, William Merrill, Jacob Morrison, Niklas Muen- nighoff, Aakanksha Naik, Crystal Nam, Matthew Peters, Valentina Pyatkin, Abhilasha Ravichander, Dustin Schwenk, Saurabh Shah, William Smith, Emma Strubell, Nishant Subramani, Mitchell Wortsman, Pradeep Dasigi, Nathan Lambert, Kyle Richardson, Luke Zettlemoyer, Jesse Dodge, Kyle Lo, Luca Soldaini, Noah Smith, and Hannaneh Hajishirzi. OLMo: Accelerating the science of language models. In Proceedings of the 62nd Annual Meeting of the Association for Computational Linguistics, 2024.

11

<!-- page 12 of 18 -->

Published as a conference paper at COLM 2025

Yuling Gu, Oyvind Tafjord, Bailey Kuehl, Dany Haddad, Jesse Dodge, and Hannaneh

Hajishirzi. OLMES: A standard for language model evaluations. arXiv:2406.08446, 2024.

Vipul Gupta, Candace Ross, David Pantoja, Rebecca J. Passonneau, Megan Ung, and Adina

Williams. Improving model evaluation using SMART filtering of benchmark datasets. arXiv:2410.20245, 2024.

Dan Hendrycks, Collin Burns, Steven Basart, Andy Zou, Mantas Mazeika, Dawn Song, and

Jacob Steinhardt. Measuring massive multitask language understanding. In Proceedings of the Ninth International Conference on Learning Representations, 2021.

Brian W. Junker, Richard J. Patz, and Nathan M. VanHoudnos. Markov chain Monte Carlo

for item response models. In Wim J. van der Linden (ed.), Handbook of Item Response Theory, volume 2, pp. 271–312. CRC Press, Boca Raton, FL, 2016.

Alex Kipnis, Konstantinos Voudouris, Luca M. Schulze Buschoff, and Eric Schulz.

metabench: A sparse benchmark of reasoning and knowledge in large language models. In Proceedings of the Thirteenth International Conference on Learning Representations, 2025.

John P. Lalor and Hong Yu. Dynamic data selection for curriculum learning via ability

estimation. In Findings of the Association for Computational Linguistics: EMNLP 2020, 2020.

John P. Lalor, Hao Wu, and Hong Yu. Building an evaluation scale using item response

theory. In Proceedings of the 2016 Conference on Empirical Methods in Natural Language Processing, 2016.

John P. Lalor, Hao Wu, Tsendsuren Munkhdalai, and Hong Yu. Understanding deep learning

performance through an examination of test set difficulty: A psychometric case study. In Proceedings of the 2018 Conference on Empirical Methods in Natural Language Processing, 2018.

John P. Lalor, Hao Wu, and Hong Yu. Learning latent parameters without human response

patterns: Item response theory with artificial crowds. In Proceedings of the 2019 Conference on Empirical Methods in Natural Language Processing and the 9th International Joint Conference on Natural Language Processing, 2019.

John P. Lalor, Pedro Rodriguez, Jo˜ao Sedoc, and Jose Hernandez-Orallo. Item response

theory for natural language processing. In Proceedings of the 18th Conference of the European Chapter of the Association for Computational Linguistics, 2024.

Tony Lee, Haoqin Tu, Chi H. Wong, Wenhao Zheng, Yiyang Zhou, Yifan Mai, Josselin S.

Roberts, Michihiro Yasunaga, Huaxiu Yao, Cihang Xie, and Percy Liang. VHELM: A holistic evaluation of vision language models. In Proceedings of the 38th Conference on Neural Information Processing Systems, 2024.

Percy Liang, Rishi Bommasani, Tony Lee, Dimitris Tsipras, Dilara Soylu, Michihiro Ya-

sunaga, Yian Zhang, Deepak Narayanan, Yuhuai Wu, Ananya Kumar, Benjamin Newman, Binhang Yuan, Bobby Yan, Ce Zhang, Christian Alexander Cosgrove, Christopher D. Manning, Christopher Re, Diana Acosta-Navas, Drew Arad Hudson, Eric Zelikman, Esin Durmus, Faisal Ladhak, Frieda Rong, Hongyu Ren, Huaxiu Yao, Jue Wang, Keshav San- thanam, Laurel Orr, Lucia Zheng, Mert Yuksekgonul, Mirac Suzgun, Nathan Kim, Neel Guha, Niladri S. Chatterji, Omar Khattab, Peter Henderson, Qian Huang, Ryan Andrew Chi, Sang Michael Xie, Shibani Santurkar, Surya Ganguli, Tatsunori Hashimoto, Thomas Icard, Tianyi Zhang, Vishrav Chaudhary, William Wang, Xuechen Li, Yifan Mai, Yuhui Zhang, and Yuta Koreeda. Holistic evaluation of language models. Transactions on Machine Learning Research, 2023.

Thomas I. Liao, Rohan Taori, Inioluwa Deborah Raji, and Ludwig Schmidt. Are we learning

yet? A meta-review of evaluation failures across machine learning. In Proceedings of the 35th Conference on Neural Information Processing Systems, 2021.

Stephanie Lin, Jacob Hilton, and Owain Evans. TruthfulQA: Measuring how models mimic human falsehoods. In Proceedings of the 60th Annual Meeting of the Association for Computational Linguistics, 2022.

12

<!-- page 13 of 18 -->

Published as a conference paper at COLM 2025

Zhengzhong Liu, Aurick Qiao, Willie Neiswanger, Hongyi Wang, Bowen Tan, Tianhua

Tao, Junbo Li, Yuqi Wang, Suqi Sun, Omkar Pangarkar, Richard Fan, Yi Gu, Victor Miller, Yonghao Zhuang, Guowei He, Haonan Li, Fajri Koto, Liping Tang, Nikhil Ranjan, Zhiqiang Shen, Xuguang Ren, Roberto Iriondo, Cun Mu, Zhiting Hu, Mark Schulze, Preslav Nakov, Tim Baldwin, and Eric P. Xing. LLM360: Towards fully transparent open-source LLMs. arXiv:2312.06550, 2023.

Zhengzhong Liu, Bowen Tan, Hongyi Wang, Willie Neiswanger, Tianhua Tao, Haonan Li,

Fajri Koto, Yuqi Wang, Suqi Sun, Omkar Pangarkar, Richard Fan, Yi Gu, Victor Miller, Liqun Ma, Liping Tang, Nikhil Ranjan, Yonghao Zhuang, Guowei He, Renxi Wang, Mingkai Deng, Robin Algayres, Yuanzhi Li, Zhiqiang Shen, Preslav Nakov, and Eric Xing. LLM360 K2: Building a 65B 360-open-source large language model from scratch. arXiv:2501.07124, 2025.

Frederic M. Lord. A Theory of Test Scores. Psychometric Corporation, Richmond, VA, 1952.

Frederic M. Lord. Applications of Item Response Theory to Practical Testing Problems. Lawrence

Erlbaum Associates, Hillsdale, NJ, 1980.

Frederic M. Lord. Unbiased estimators of ability parameters, of their variance, and of their

parallel-forms reliability. Psychometrika, 48(2):233–245, 1983.

Lovish Madaan, Aaditya K. Singh, Rylan Schaeffer, Andrew Poulton, Sanmi Koyejo, Pontus

Stenetorp, Sharan Narang, and Dieuwke Hupkes. Quantifying variance in evaluation benchmarks. arXiv:2406.10229, 2024.

David Magis, Duanli Yan, and Alina A. von Davier. Computerized Adaptive and Multistage

Testing with R. Springer, Cham, 2017.

Rob R. Meijer and Michael L. Nering. Computerized adaptive testing: Overview and

introduction. Applied Psychological Measurement, 23(3):187–194, 1999.

Moran Mizrahi, Guy Kaplan, Dan Malkin, Rotem Dror, Dafna Shahaf, and Gabriel Stanovsky.

State of what art? A call for multi-prompt LLM evaluation. Transactions of the Association for Computational Linguistics, 12:933–949, 2024.

Prathiba Natesan, Ratna Nandakumar, Tom Minka, and Jonathan D. Rubright. Bayesian

prior choice in IRT estimation using MCMC and variational bayes. Frontiers in Psychology, 7, 2016.

Jinjie Ni, Fuzhao Xue, Xiang Yue, Yuntian Deng, Mahir Shah, Kabir Jain, Graham Neubig,

and Yang You. MixEval: Deriving wisdom of the crowd from LLM benchmark mixtures. In Proceedings of the 38th Annual Conference on Neural Information Processing Systems, 2024.

Curtis G. Northcutt, Anish Athalye, and Jonas Mueller. Pervasive label errors in test sets

destabilize machine learning benchmarks. In Proceedings of the 35th Conference on Neural Information Processing Systems, 2021.

Team OLMo, Pete Walsh, Luca Soldaini, Dirk Groeneveld, Kyle Lo, Shane Arora, Akshita

Bhagia, Yuling Gu, Shengyi Huang, Matt Jordan, Nathan Lambert, Dustin Schwenk, Oyvind Tafjord, Taira Anderson, David Atkinson, Faeze Brahman, Christopher Clark, Pradeep Dasigi, Nouha Dziri, Michal Guerquin, Hamish Ivison, Pang Wei Koh, Jiacheng Liu, Saumya Malik, William Merrill, Lester James V. Miranda, Jacob Morrison, Tyler Mur- ray, Crystal Nam, Valentina Pyatkin, Aman Rangapur, Michael Schmitz, Sam Skjonsberg, David Wadden, Christopher Wilhelm, Michael Wilson, Luke Zettlemoyer, Ali Farhadi, Noah A. Smith, and Hannaneh Hajishirzi. 2 OLMo 2 Furious. arXiv:2501.00656, 2025.

Sam Paech. Creating MAGI: A hard subset of MMLU and AGIEval. https://sampaech.substack.com/p/creating-magi-a-hard-subset-of-mmlu, 2024.

Yotam Perlitz, Elron Bandel, Ariel Gera, Ofir Arviv, Liat Ein-Dor, Eyal Shnarch, Noam

Slonim, Michal Shmueli-Scheuer, and Leshem Choshen. Efficient benchmarking (of language models). In Proceedings of the 2024 Conference of the North American Chapter of the Association for Computational Linguistics: Human Language Technologies, 2024a.

13

<!-- page 14 of 18 -->

Published as a conference paper at COLM 2025

Yotam Perlitz, Ariel Gera, Ofir Arviv, Asaf Yehudai, Elron Bandel, Eyal Shnarch, Michal

Shmueli-Scheuer, and Leshem Choshen. Do these LLM benchmarks agree? Fixing benchmark evaluation with BenchBench. arXiv:2407.13696, 2024b.

Felipe M. Polo, Lucas Weber, Leshem Choshen, Yuekai Sun, Gongjun Xu, and Mikhail

Yurochkin. tinyBenchmarks: Evaluating LLMs with fewer examples. In Proceedings of the 41st International Conference on Machine Learning, 2024.

Mark D. Reckase. Multidimensional Item Response Theory. Springer, New York City, NY, 2009.

Pedro Rodriguez, Joe Barrow, Alexander Miserlis Hoyle, John P. Lalor, Robin Jia, and

Jordan Boyd-Graber. Evaluation examples are not equally informative: How should that change NLP leaderboards? In Proceedings of the 59th Annual Meeting of the Association for Computational Linguistics and the 11th International Joint Conference on Natural Language Processing, 2021.

Pedro Rodriguez, Phu Mon Htut, John Lalor, and Jo˜ao Sedoc. Clustering examples in

multi-dataset benchmarks with item response theory. In Proceedings of the Third Workshop on Insights from Negative Results in NLP, 2022.

Keisuke Sakaguchi, Ronan Le Bras, Chandra Bhagavatula, and Yejin Choi. WinoGrande:

An Adversarial Winograd Schema Challenge at Scale. In Proceedings of the Thirty-Fourth AAAI Conference on Artificial Intelligence, 2020.

Michael Saxon, Ari Holtzman, Peter West, William Yang Wang, and Naomi Saphra. Bench-

marks as microscopes: A call for model metrology. In Proceedings of the First Conference on Language Modeling, 2024.

Mirac Suzgun, Nathan Scales, Nathanael Sch¨arli, Sebastian Gehrmann, Yi Tay, Hyung Won

Chung, Aakanksha Chowdhery, Quoc Le, Ed Chi, Denny Zhou, and Jason Wei. Chal- lenging BIG-Bench tasks and whether chain-of-thought can solve them. In Findings of the Association for Computational Linguistics: ACL 2023, 2023.

Wim J. van der Linden and Ronald K. Hambleton (eds.). Handbook of Modern Item Response

Theory. Springer, New York City, NY, 1997.

Clara Vania, Phu Mon Htut, William Huang, Dhara Mungra, Richard Yuanzhe Pang, Jason

Phang, Haokun Liu, Kyunghyun Cho, and Samuel R. Bowman. Comparing test sets with item response theory. In Proceedings of the 59th Annual Meeting of the Association for Computational Linguistics and the 11th International Joint Conference on Natural Language Processing, 2021.

Joshua Vendrow, Edward Vendrow, Sara Beery, and Aleksander Madry. Do large language

model benchmarks test reliability? arXiv:2502.03461, 2025.

Rajan Vivek, Kawin Ethayarajh, Diyi Yang, and Douwe Kiela. Anchor points: Benchmarking

models with much fewer examples. In Proceedings of the 18th Conference of the European Chapter of the Association for Computational Linguistics, 2024.

Chunqiu Steven Xia, Yinlin Deng, and Lingming Zhang. Top leaderboard ranking = top cod-

ing proficiency, always? EvoEval: Evolving coding benchmarks via LLM. In Proceedings of the First Conference on Language Modeling, 2024.

Rowan Zellers, Ari Holtzman, Yonatan Bisk, Ali Farhadi, and Yejin Choi. HellaSwag: Can

a machine really finish your sentence? In Proceedings of the 57th Annual Meeting of the Association for Computational Linguistics, 2019.

Yan Zhuang, Qi Liu, Yuting Ning, Weizhe Huang, Zachary A. Pardos, Patrick C. Kyllonen,

Jiyun Zu, Qingyang Mao, Rui Lv, Zhenya Huang, Guanhao Zhao, Zheng Zhang, Shijin Wang, and Enhong Chen. From static benchmarks to adaptive testing: Psychometrics in AI evaluation. arXiv:2306.10512, 2024.

14

<!-- page 15 of 18 -->

Published as a conference paper at COLM 2025

1.0

Item q1 (aj = 10, bj = 0)

Item q2 (aj = 0.1, bj = 0)

0.8

Item q3 (aj = 10, bj = 1)

0.6

0.4

0.2

Success probability p(uij = 1)

0.0

−3 −2 −1 0 1 2 3 LM ability θi

Figure 6: Example item characteristic curves. The x-axis shows the ability parameter θi; the greater θi, the higher the success probability p(uij = 1). The difficulty parameter bj indicates the value of θi at which p(uij = 1) = 0.5, reflected by the location of the curve (compare q1 vs. q3). The discrimination parameters indicates how sharply p(uij = 1) changes when θi is close to bj. aj is proportional to the slope of the curve (compare q1 vs. q2). When the curve is flat (i.e., low aj), this implies that even some high-ability LMs failed on this item.

5

8

θt

i = 0

4

6

i, aj, bj)

3

4

2

2

Item discrimination aj

1

Fisher information I(θt

0

0

−5.0 −2.5 0.0 2.5 5.0 7.5 Item difﬁculty bj

Figure 7: Fisher information of HellaSwag items halfway through the simulated training run, when θt

i = 0. The figure corresponds to the distribution obtained by taking a vertical slice through Figure 2 at θt

i = 0. In line with Equation 4, Fisher information is highest for items whose difficulty bj is close to θt

i. By contrast, when bj is far from θt

i. It also increases with item discrimination aj, an effect that is particularly pronounced when bj ≈θt

i, higher discrimination has an only modest effect on Fisher information.

A Item Characteristic Curves · 项目特征曲线

We provide example item characteristic curves in Figure 6.

B Fisher Information of HellaSwag Items · HellaSwag题目的Fisher信息

For illustrative purposes, Figure 7 shows the Fisher information of HellaSwag items halfway through the simulated training run, when θt

出于说明目的，图 7 显示了模拟训练运行中途 HellaSwag 项目的 Fisher 信息，当 θt

i = 0.

C Checkpoint Details · 检查点细节

We provide details about the selected LM checkpoints. For Amber-6.7B, we select 73 check- points. For OLMo1-7B, we select 83 checkpoints. For OLMo2-7B, we select 94 checkpoints. For Pythia-6.9B, we select 78 checkpoints. For Pythia-2.8B, we select 78 checkpoints. For K2-65B, we select 61 checkpoints. For all LMs, checkpoints are selected to ensure even coverage throughout the entire training run.

我们提供有关所选LM检查点的详细信息。对于 Amber-6.7B，我们选择 73 个检查点。对于 OLMo1-7B，我们选择 83 个检查点。对于 OLMo2-7B，我们选择 94 个检查点。对于 Pythia-6.9B，我们选择 78 个检查点。对于 Pythia-2.8B，我们选择 78 个检查点。对于 K2-65B，我们选择 61 个检查点。对于所有 LM，都会选择检查点以确保均匀覆盖整个训练运行。

15

<!-- page 16 of 18 -->

Published as a conference paper at COLM 2025

Benchmark

Measure Method ARC GSM HS MMLU TQA WG

Validity RANDOM 21.9 — 12.9 20.5 — 12.4 Rank distance ↓ RANDOM IRT 15.9 — 5.0 13.4 — 8.2 FLUID BENCHMARKING 14.5 — 4.5 10.7 — 4.9

Variance RANDOM 10.2 22.2 3.8 49.7 18.1 14.6 Total variation ↓ RANDOM IRT 7.9 28.9 12.0 20.8 15.1 22.1 FLUID BENCHMARKING 3.3 9.1 2.0 6.3 9.8 5.8

Saturation RANDOM 0.75 0.66 0.88 0.51 0.43 0.61 Rank correlation ↑ RANDOM IRT 0.82 0.60 0.88 0.56 0.63 0.76 FLUID BENCHMARKING 0.95 0.86 0.98 0.67 0.71 0.93

Table 3: Comparison against baselines, split by benchmark. ARC: ARC Challenge; GSM: GSM8K; HS: HellaSwag; TQA: TruthfulQA; WG: WinoGrande.

D Language Model Inclusion Criteria · 语言模型纳入标准

We used the following criteria when selecting LMs for IRT model training:

– We only included pretrained LMs. Finetuned, merged, fused, distilled, or continually

pretrained LMs were excluded, as they can lead to clusters of highly similar models, potentially skewing the IRT model.

预训练的 LM 被排除在外，因为它们可能导致高度相似的模型集群，可能会扭曲 IRT 模型。

– In the rare cases where an LM appears on the Open LLM Leaderboard with multiple

– 在极少数情况下，LM 会出现在 Open LLM 排行榜上并有多个

checkpoints, we used only the final checkpoint listed.

– We excluded LMs trained solely on non-English data, but multilingual LMs were included

– 我们排除了仅接受非英语数据训练的 LM，但包括了多语言 LM

as long as English data were part of their training corpus.

– We removed any LMs from the same model family as the test LMs (e.g., OLMo1-1B).

– 我们从与测试 LM 相同的模型系列中删除了所有 LM（例如 OLMo1-1B）。

E Item Response Model Details · 项目反应模型细节

In the main experiments, we fit separate unidimensional IRT models to each benchmark. Initially, we also experimented with two alternative setups:

在主要实验中，我们将单独的一维 IRT 模型拟合到每个基准。最初，我们还尝试了两种替代设置：

– We experimented with fitting a single unidimensional IRT model across all benchmarks,

following prior work suggesting that one latent trait can capture overall model behavior (Kipnis et al., 2025). However, we found that this substantially reduced construct validity. For example, the performance of Amber-6.7B on TruthfulQA decreases during pretraining (Liu et al., 2023); by contrast, when we evaluated Amber-6.7B using a unidimensional IRT model trained across all benchmarks, the estimated ability increased—the IRT model effectively emphasized TruthfulQA items aligned with general trends, obscuring the fact that Amber-6.7B actually becomes less truthful during pretraining.

先前的研究表明，一种潜在特征可以捕获整体模型行为（Kipnis 等人，2025）。然而，我们发现这大大降低了结构有效性。例如，预训练期间 Amber-6.7B 在 TruthfulQA 上的性能下降（Liu et al., 2023）；相比之下，当我们使用跨所有基准训练的一维 IRT 模型评估 Amber-6.7B 时，估计能力有所提高 - IRT 模型有效地强调了与总体趋势一致的 TruthfulQA 项目，掩盖了 Amber-6.7B 在预训练期间实际上变得不那么真实的事实。

– We experimented with fitting separate multidimensional IRT models (with two to five latent

traits) to each benchmark. These models, however, did not yield consistent improvements in model fit compared to the unidimensional IRT models.

特征）到每个基准。然而，与一维 IRT 模型相比，这些模型并没有在模型拟合方面产生一致的改进。

Ultimately, fitting separate unidimensional IRT models to each benchmark offered the best trade-off in our experiments. That said, multidimensional IRT models may offer greater advantages in other settings (e.g., when evaluating multimodal models).

最终，为每个基准拟合单独的一维 IRT 模型在我们的实验中提供了最佳权衡。也就是说，多维 IRT 模型可能在其他设置中提供更大的优势（例如，在评估多模态模型时）。

F Breakdown of Results by Benchmark and Language Model · 按基准和模型拆分结果

Table 3 breaks the comparison against baselines down by benchmark. Table 4 breaks the comparison against baselines down by LM. We examine the ablated baselines here, fixing the number of items per benchmark to 100.

16

<!-- page 17 of 18 -->

Published as a conference paper at COLM 2025

Language model

Measure Method A-7B K-65B O1-7B O2-7B P-3B P-7B

Validity RANDOM 25.5 5.1 10.7 7.1 23.1 28.1 Rank distance ↓ RANDOM IRT 20.2 5.2 8.0 6.1 8.3 15.3 FLUID BENCHMARKING 19.3 2.1 6.7 3.4 8.1 11.6

Variance RANDOM 21.8 14.7 10.2 15.4 35.7 20.9 Total variation ↓ RANDOM IRT 16.2 27.0 11.4 12.4 26.1 13.7 FLUID BENCHMARKING 5.5 7.1 5.8 6.8 6.5 4.5

Saturation RANDOM 0.47 0.65 0.77 0.63 0.62 0.71 Rank correlation ↑ RANDOM IRT 0.66 0.73 0.83 0.63 0.67 0.73 FLUID BENCHMARKING 0.82 0.89 0.91 0.80 0.81 0.87

Table 4: Comparison against baselines, split by LM. A-7B: Amber-7B; K-65B: K2-65B; O1-7B: OLMo1-7B; O2-7B: OLMo2-7B; P-3B: Pythia-2.8B; P-7B: Pythia-6.9B.

G Variance and Saturation Plots · 方差与饱和曲线

Figure 8 provides a more detailed comparison of FLUID BENCHMARKING and RANDOM in terms of variance (Figure 8a) and saturation (Figure 8b). FLUID BENCHMARKING improves on RANDOM for almost all combinations of benchmark, subset size, and LM.

H Comparison Against Full-Benchmark Accuracy · 与完整基准正确率比较

We have shown that FLUID BENCHMARKING improves evaluation quality in terms of validity, variance, and saturation, compared against alternative evaluation methods using the same number of items. Do these advantages persist when evaluation cost is not a concern (i.e., when it is feasible to evaluate on the full set of benchmark items)? To test this, we compare FLUID BENCHMARKING (|Q∗| = 500) with full-benchmark accuracy, using the same LMs and benchmarks as in our main experiments (see §4).

我们已经证明，与使用相同数量项目的其他评估方法相比，流动基准在有效性、方差和饱和度方面提高了评估质量。当不考虑评估成本时（即，当可以对全套基准项目进行评估时），这些优势是否仍然存在？为了测试这一点，我们使用与我们的主要实验相同的 LM 和基准，将 FLUID BENCHMARKING (|Q*| = 500) 与全基准精度进行比较（参见§4）。

We find that full-benchmark accuracy performs worse than FLUID BENCHMARKING across all three evaluation dimensions, despite using substantially more items. This holds for validity (9.1 vs. 8.3 for FLUID BENCHMARKING), variance (23.8 vs. 4.9 for FLUID BENCH-

我们发现，尽管使用了更多的项目，但在所有三个评估维度上，全基准测试的准确性都比流体基准测试的性能要差。这适用于有效性（FLUID BENCHMARKING 为 9.1 与 8.3）、方差（FLUID BENCHMARKING 为 23.8 与 4.9）

MARKING), and saturation (0.85 vs. 0.88 for FLUID BENCHMARKING). Notably, even FLUID BENCHMARKING with only 50 items outperforms full-benchmark accuracy on all three dimensions (cf. Table 2). These results suggest that FLUID BENCHMARKING can improve evaluation quality even in settings where efficiency is not a limiting factor.

标记）和饱和度（流体基准标记为 0.85 与 0.88）。其中，即使只有 50 个项目的流体基准测试在所有三个维度上的表现也优于全基准测试精度（参见表 2）。这些结果表明，即使在效率并非限制因素的情况下，流体基准测试也可以提高评估质量。

17

<!-- page 18 of 18 -->

Published as a conference paper at COLM 2025

1.0

100

0.8

80

ARC Challenge GSM8K HellaSwag MMLU TruthfulQA WinoGrande

ARC Challenge GSM8K HellaSwag MMLU TruthfulQA WinoGrande

0.6

60

0.4

40

100 200 300 400 500

100 200 300 400 500

FLUID BENCHMARKING

FLUID BENCHMARKING

0.2

20

0.0

0

Amber-6.7B K2-65B OLMo1-7B OLMo2-7B Pythia-2.8B Pythia-6.9B

Amber-6.7B K2-65B OLMo1-7B OLMo2-7B Pythia-2.8B Pythia-6.9B

0.0 0.2 0.4 0.6 0.8 1.0 RANDOM

0 20 40 60 80 100 RANDOM

(a) Variance (lower is better)

(b) Saturation (higher is better)

Figure 8: Variance and saturation results. The figure shows pairwise comparisons measuring the total variation (a) and monotonicity (b) of training curves based on RANDOM and FLUID BENCHMARKING. For variance, lower total variation is better. For saturation, high monotonicity is better, as it indicates that increased pretraining consistently yields better performance, suggesting that the benchmark has not yet saturated. Thus, for variance, points in the lower right triangle indicate that FLUID BENCHMARKING is better than RANDOM, and for saturation, points in the upper left triangle indicate that FLUID BENCHMARKING is better than RANDOM. FLUID BENCHMARKING improves on RANDOM for almost all combinations of benchmark, subset size, and LM.

18
