---
title: "DataDecide 对照译稿"
category: "数据与评测"
tags: ["DataDecide", "预训练数据", "Scaling Laws", "数据选择"]
published: true
excerpt: "DataDecide 通过 25 种数据配方、14 个模型规模和多个随机种子，研究小规模实验能否可靠预测大规模预训练数据选择。"
---

# DataDecide: How to Predict Best Pretraining Data with Small Experiments · 如何用小实验预测最佳预训练数据

<!-- arXiv 2504.11393; 文字由 PyMuPDF 按页抽取, 公式与表以 data/sources/datadecide/latex/ 的 LaTeX 源码为准 -->

<!-- page 1 of 16 -->

DataDecide How to Predict Best Pretraining Data with Small Experiments

Ian Magnusson * 1 2 Nguyen Tai * 3 Ben Bogin * 1 David Heineman 1 Jena Hwang 1 Luca Soldaini 1 Akshita Bhagia 1

Jiacheng Liu 1 2 Dirk Groeneveld 1 Oyvind Tafjord 1 Noah A. Smith 1 2 Pang Wei Koh 1 2 Jesse Dodge 1

Abstract

摘要

1. Introduction

The cost of training large language models (LMs) necessi- tates methods of trying out options at small scale, but it also makes it expensive to validate the accuracy of development decisions made with such methods. We focus on the ques- tion of choosing between pretraining datasets to use—one of the most impactful development decisions. Common practice (e.g., Li et al., 2024) uses a single, small scale of experiments to cheaply test pretraining data intended for larger-scale models, where scale is determined by number of model parameters and training tokens. The other predom- inant approach is to fit scaling laws (Kaplan et al., 2020; Hoffmann et al., 2022; Choshen et al., 2024) to the trend in performance observed over multiple small scales, with recent work extending this to the prediction of downstream performance instead of language modeling loss (Gadre et al., 2024; Dubey et al., 2024; Bhagia et al., 2024).

大语言模型训练成本高昂, 因而需要先在小规模上试验选项; 但高成本也使这些小规模方法所支持的开发决策难以验证. 本文聚焦最具影响力的开发决策之一: 在多个预训练数据集之间作选择. 常见做法是在单一小规模上低成本测试准备供大模型使用的预训练数据, 其中规模由模型参数量与训练 token 数共同决定. 另一种主流做法是在多个小规模观测到的性能趋势上拟合 Scaling Laws; 近期工作又把预测目标从语言建模损失扩展到下游表现.

arXiv:2504.11393v2  [cs.LG]  13 Jul 2025

Because large language models are expensive to pretrain on different datasets, using smaller-scale experiments to decide on data is crucial for re- ducing costs. Which benchmarks and methods of making decisions from observed performance at small scale most accurately predict the datasets that yield the best large models? To empower open exploration of this question, we release mod- els, data, and evaluations in DATADECIDE—the most extensive open suite of models over differ- ences in data and scale. We conduct controlled pretraining experiments across 25 corpora with differing sources, deduplication, and filtering up to 100B tokens, model sizes up to 1B parameters, and 3 random seeds. We find that the ranking of models at a single, small size (e.g., 150M param- eters) is a strong baseline for predicting best mod- els at our larger target scale (1B) (∼80% of com- parisons correct). No scaling law methods among 8 baselines exceed the compute-decision fron- tier of single-scale predictions, but DATADECIDE can measure improvement in future scaling laws. We also identify that using continuous likelihood metrics as proxies in small experiments makes benchmarks including MMLU, ARC, HellaSwag, MBPP, and HumanEval > 80% predictable at the target 1B scale with just 0.01% of the compute.

在不同数据集上预训练大语言模型成本很高, 所以用较小规模实验决定数据选择对降低成本十分关键. 哪些基准和决策方法能够根据小规模观测结果, 最准确地预测出可训练最佳大模型的数据集? 为便于公开研究这个问题, 作者发布 DATADECIDE 的模型、数据与评测. 这是覆盖数据差异与规模差异最广的开放模型套件. 受控预训练实验覆盖 25 个语料库, 它们在来源、去重和过滤上各不相同; 训练 token 最多 100B, 模型最大 1B 参数, 并使用 3 个随机种子. 结果显示, 单一小规模模型 (如 150M 参数) 的排名是预测较大目标规模 (1B) 最佳模型的强基线, 约 80% 的成对比较正确. 8 种 Scaling Laws 基线都没有超过单规模预测的算力—决策前沿, 但 DATADECIDE 可以衡量未来 Scaling Laws 方法的改进. 作者还发现, 在小实验中用连续似然指标做代理, 只花目标训练 0.01% 的算力, 就能让目标 1B 规模上的 MMLU、ARC、HellaSwag、MBPP 与 HumanEval 等基准达到超过 80% 的可预测性.

So far decision-making approaches have only been validated without observing the counterfactual outcome, either by pro- ducing a single large model on the chosen decision with impressive performance or by low error in predicting the magnitude of observed performance of a small number of large models. Knowing what amount of error in predicting performance over scale is a low enough to actually make a correct decision among datasets, requires a suite of com- parable models trained on many datasets. Although a wide variety of open-source pretraining corpora are available, the scaling behavior of data is difficult to assess from off-the- shelf models that vary simultaneously in data, optimizer, and modeling decisions.

此前的决策方法没有在观察反事实结果的条件下得到验证: 一类工作只按选定决策训练一个表现亮眼的大模型; 另一类只要求对少量大模型的实际性能数值预测误差较低. 要判断跨规模性能预测误差低到什么程度才能在数据集之间作出正确选择, 需要一套在多种数据上训练且可相互比较的模型. 开源预训练语料虽然很多, 但现成模型会同时改变数据、优化器与模型设计, 因而难以用它们评估数据的 Scaling 行为.

*Equal contribution 1Allen Institute for AI 2Paul G. Allen School of Computer Science & Engineering, University of Wash- ington 3University of Pennsylvania. Correspondence to: Ian Mag- nusson <ianmag@cs.washington.edu>.

To make it possible to empirically study what methods make the best decisions over data, we build DATADECIDE1—a suite of models we pretrain on 25 corpora up to 100B tokens, over 14 different model sizes ranging from 4M parameters up to 1B parameters (more than 30K model checkpoints in total). We evaluate all models across a suite of 10 down- stream tasks and calculate how accurately small models pre- dict which pretraining corpora lead to better performance

为了实证研究哪些方法能够作出最佳数据决策, 作者构建 DATADECIDE¹: 在 25 个语料库上预训练模型, 每个语料最多使用 100B token, 覆盖从 4M 到 1B 参数的 14 个规模, 总计超过 3 万个模型检查点. 所有模型都在 10 个下游任务上评测, 再计算小模型预测哪种预训练语料会带来更好表现的准确率.

1DataDecide collection on HuggingFace

Proceedings of the 42 nd International Conference on Machine Learning, Vancouver, Canada. PMLR 267, 2025. Copyright 2025 by the author(s).

1

<!-- page 2 of 16 -->

DataDecide: How to Predict Best Pretraining Data with Small Experiments

Predictions

Targets Pretrain 25 datasets

@ 150M to predict pairs of 25 datasets @ 1B ~80% correct

Best Data: 1. DCLM 2. Dolma 3. …

Best Data: 1. Dolma 2. DCLM 3. …

Evaluation

(Proxy) Evaluation

Seeds

Smaller Scale(s)

Large Scale

Figure 1. Which pretraining data to use? Ideally, compare performance of large models with fixed configurations averaged over random

seeds (left). In practice, cheaper, smaller-scale experiments are used (center). Here DATADECIDE measures accuracy of pairwise decisions between 25 pretraining corpora to find efficient prediction methods (right).

deviation.

at our largest scale. Our conclusions provide practical rec- ommendations for the best benchmarks, prediction methods, and metrics to use to make decisions.

在最大规模上, 作者据此检验小模型能多准确地预测哪种预训练语料带来更好表现. 研究结论为数据决策应采用哪些基准、预测方法和指标给出实际建议.

Measuring the tradeoff of compute cost to better decisions lets us make the following recommendations about small experiments for making data decisions:

通过衡量算力成本与决策质量之间的取舍, 作者对用于数据决策的小实验提出以下建议:

• §3.1 – The amount of compute you need to allocate for a given decision accuracy depends heavily on task. MMLU and ARC are much cheaper to predict than Hel- laSwag and some tasks such as SocialIQA are difficult to predict at all scales.

• §3.1: 达到给定决策准确率所需的算力高度依赖任务. MMLU 与 ARC 的预测成本远低于 HellaSwag, SocialIQA 等任务在所有考察规模上都难以预测.

• §3.2 – 8 baseline scaling law methods do not exceed the compute to decision accuracy frontier set by ranking single scale experiments.

• §3.2: 8 种 Scaling Laws 基线方法都没有超过单规模实验排名所建立的算力—决策准确率前沿.

We call the 25 corpora we train on data recipes as they range across popular corpora including Dolma (Soldaini et al., 2024), DCLM (Li et al., 2024), RefinedWeb (Penedo et al., 2023), C4 (Raffel et al., 2019), and FineWeb (Penedo et al., 2024) as well as combinations of interventions on these datasets such as source mixing, deduplication, and filtering. Previous work has considered only 2 (Biderman et al., 2023) or 6 recipes (Magnusson et al., 2024; Brand- fonbrener et al., 2024). We also offer a novel affordance by including 3 random seed reruns for even our largest runs, to help quantify whether variation occurs due to random initialization and data order or differences in the distribution of data.

作者把训练所用的 25 个语料称为「数据配方」. 它们既包括 Dolma、DCLM、RefinedWeb、C4 与 FineWeb 等常用语料, 也包括对这些数据作来源混合、去重与过滤干预后的组合. 以往工作只比较 2 种或 6 种配方. DATADECIDE 即使对最大训练也提供 3 个随机种子复跑, 从而量化性能变化究竟来自随机初始化与数据顺序, 还是来自数据分布差异.

• §3.3 – At small scales, continuous metrics using an- swer likelihood are better or equivalent predictors of decisions than using the same discrete accuracy target metric.

• §3.3: 在小规模上, 使用答案似然的连续指标比相同的离散准确率目标更好, 或至少同样适合预测决策.

• §3.4 – Better decisions can be explained in part by low run-to-run variance and a wide spread of benchmark performance values for different data, traits which can be improved by proxy metrics.

• §3.4: 更好的决策部分来自较低的运行间方差, 以及不同数据在基准表现上较宽的分布; 代理指标可以改善这两项性质.

Concretely, DATADECIDE allows analyses such as Figure 1 (right), which shows the relationship between compute used to predict a ranking of datasets and how accurately that rank- ing reflects mean performance over 3 seed runs (quantified here by OLMES; Gu et al., 2024) for models fully trained on those datasets at the target (1B) scale. We measure the accuracy of decisions as the percent of compared pairs of datasets where the prediction identifies the correct winner. Each point represents the average decision accuracy of a given method over 3 prediction attempts using small models with different random seeds, and shading shows standard

具体而言, DATADECIDE 支持图 1 右侧这类分析: 横向比较预测数据集排名所用算力, 纵向衡量该排名对目标 1B 规模模型在 3 个种子上平均表现的反映程度, 此处表现由 OLMES 量化. 决策准确率定义为所有数据集成对比较中, 预测正确找出胜者的比例. 每个点表示一种方法用不同随机种子小模型作 3 次预测的平均决策准确率, 阴影表示标准差.

Future research can extend DATADECIDE with little extra compute by running new evaluations on our checkpoints, pretraining additional small models to compare against the large target models we provide, or trying new prediction

后续研究可以用很少的额外算力扩展 DATADECIDE: 在已发布检查点上运行新评测, 预训练更多小模型并与作者提供的大目标模型比较, 或在已发布评测结果上尝试平滑、曲线拟合等轻量处理的新预测方法.

2

<!-- page 3 of 16 -->

DataDecide: How to Predict Best Pretraining Data with Small Experiments

Source / Recipe Description

Dolma1.7 Original, No code, No math/code, No Reddit, No Flan

A 2.3T-token corpus (Dolma 1.7 Soldaini et al., 2024) sampling common LM sources for open research. We ablate code, math/code, Reddit, or Flan subsets.

Dolma1.6++ Original Dolma 1.6 plus additional sources from Dolma 1.7: RedPajama’s arxiv subset, openwebmath, algebraic stack, flan, starcoder, falcon.

C4 Original The C4 dataset (Raffel et al., 2019) as prepared in Dolma 1.7, heuristically filtered from the April 2019 Common Crawl.

FineWeb-Pro Original The FineWeb Pro corpus (Zhou et al., 2024), featuring model-driven data cleaning on FineWeb.

FineWeb-Edu Original The deduplicated FineWeb-Edu subset of SmolLM-Corpus (Ben Allal et al., 2024), focused on educational web pages.

Falcon Original The Falcon RefinedWeb corpus (Penedo et al., 2023) in Dolma 1.7, derived from Common Crawl through June 2023 and more aggressively filtered/deduplicated than C4.

Falcon+CC Original, QC 10%, QC 20%, QC Orig 10%, QC Tulu 10%

Falcon and Dolma 1.7’s Common Crawl. We quality filter to top 10% or 20% documents with reproduced or original (Li et al., 2024) filter or retrain filter on pre-release version of Tulu-v3 (Lambert et al., 2024).

DCLM-Baseline Original, QC 7% FW2, QC 7% FW3, QC FW 3%, QC FW 10%, QC 10%, QC 20%

A SOTA Common Crawl corpus using best ablated deduplication, cleaning heuristics, and quality filter. We quality filter to top 7% of DCLM classified documents and further take 2+ or 3+ scores with FineWeb-edu classifier; or filter to top 3% or 10% with FineWeb-edu classifier; or take top 10% or 20% with reproduced DCLM classifier.

λ% DCLM-Baseline + 1 −λ% Dolma1.7

Fractional combinations of Dolma1.7 and DCLM-Baseline mixing different proportions of the two datasets for λ ∈{25%, 50%, 75%}.

Table 1. DATADECIDE enables the study of data differences over scales through controlled pretraining experiments on 25 data recipes. These take different source datasets and apply interventions from ablating domains, deduplication, mixing, to quality filtering with different classifiers and thresholds. We release all pretraining corpora, as well as models trained on each recipe and each of the 14 model configurations in Table 2 with 3 random seeds.

“Chinchilla” (5 × C) optimal ratio (Hoffmann et al., 2022)

methods with lightweight manipulations such as smoothing and curve fitting on top of our released evaluation results.

这些方法可直接建立在已发布评测结果之上, 只需进行平滑与曲线拟合等轻量操作.

captures the typical overtraining favored for inference sav- ings.

该设置也覆盖了为节省推理成本而常用的过训练范围.

2. Methods

## 2. Methods · 方法

Our aim is to empirically test the predictability of down- stream performance at a larger, target scale using small experiments. We describe DATADECIDE §2.1, the predic- tion methods we examine §2.2, the metrics we use to assess predictions §2.3, how we measure downstream performance §2.4, and proxy metrics for our performance evaluations §2.5. We will release all models, checkpoints, pretraining corpora, and evaluations.

研究目标是实证检验: 能否用小实验预测较大目标规模的下游表现. 第 2.1 节介绍 DATADECIDE, 第 2.2 节介绍所考察的预测方法, 第 2.3 节给出预测评估指标, 第 2.4 节说明如何测量下游表现, 第 2.5 节介绍性能评测的代理指标. 作者将发布全部模型、检查点、预训练语料与评测结果.

2.1. The DATADECIDE Suite

### 2.1. The DATADECIDE Suite · DATADECIDE 套件

All 1B (target size) models have 3 full reruns with differ- ent seeds, while other model sizes have second and third seed runs that are terminated early after 25% of the target compute budget. We train the 1B reruns all the way to com- pletion to allow our target “gold” predictions to account for run-to-run variance in evaluations due to weight initializa- tion and data order. For instance, we find that the standard deviation between runs at the 1B 5×C scale can be as high as 2% points of accuracy for some recipes on most tasks. Meanwhile, at the non-target scales we wish to make pre- dictions with a small fraction of the target compute, so we avoid reruns that would use an impractically large prediction budget.

所有 1B 目标规模模型都用不同种子完整复跑 3 次; 其他规模的第二和第三个种子则在达到目标算力预算 25% 后提前停止. 1B 复跑全部训练完成, 使目标「金标准」能够计入权重初始化与数据顺序导致的运行间评测方差. 例如, 在 1B、$5\times C$ 规模上, 某些配方在多数任务的运行间标准差可高达 2 个准确率百分点. 非目标规模旨在用目标算力的一小部分进行预测, 因而不进行会耗费过高预测预算的完整复跑.

We pretrain a suite of 1,050 models using 25 data recipes × 14 model scales × 3 random seeds for initialization and data order. Table 1 describes the 25 data recipes included in DATADECIDE that aim to provide coverage of common data preparation choices such as deduplication, ablating domains, mixes of existing datasets, as well as quality filters with different implementations, training data, and thresholds for quality classifiers.

作者按 25 种数据配方、14 个模型规模与 3 个初始化和数据顺序随机种子的组合, 预训练 1,050 个模型. 表 1 描述 DATADECIDE 的 25 种配方, 覆盖去重、移除领域、混合现有数据集等常见数据准备选择, 以及采用不同实现、训练数据和分类阈值的质量过滤器.

Whether for extrapolating scaling laws or ranking single scale experiments, it is important to select reasonable hy- perparameters for each scale to avoid confounding in per- formance differences that are simply due to suboptimal hy- perparameters. We use OLMo’s model ladder (Groeneveld et al., 2024; OLMo et al., 2025; Bhagia et al., 2024) to pro- grammatically create LM pretraining configurations for a specified parameter size and token-parameter ratio to enable

无论外推 Scaling Laws 还是对单规模实验排序, 都必须为每个规模选择合理超参, 避免把次优超参造成的性能差异误认为数据差异. 作者使用 OLMo 的 model ladder, 按指定参数规模与 token—参数比自动创建语言模型预训练配置, 从而运行模型 Scaling 实验网格.

We select a token to parameter ratio of 100, which at 5×

作者选择 100 的 token—参数比; 在 $5\times C$ 的「Chinchilla」最优比率口径下, 这相当于典型的过训练设置.

3

<!-- page 4 of 16 -->

DataDecide: How to Predict Best Pretraining Data with Small Experiments

cost. To account for step-to-step noise in evaluation we average the last 10% of checkpoints as the final observed loss. Equation 2, however, is fit on all observations includ- ing intermediate checkpoints. We explore variations for a total of 8 multi scale approaches defined in Appendix C; none of these make for substantially better decisions than the method defined in this section.

为处理评测的逐步噪声, 最终观测损失取最后 10% 检查点的平均值. 不过式 (2) 会在包含中间检查点在内的全部观测上拟合. 附录 C 共定义 8 种多规模方法变体, 没有一种能比本节方法作出明显更好的决策.

running a grid of model scaling experiments. The model lad- der uses heuristics from the literature (Porian et al., 2024) to set global batch size and learning rate based on scaling fac- tors. The hyperparameters that determine parameter count (layers, hidden dimension, number of heads, MLP dimen- sion) were handpicked by OLMo developers for each scale to achieve the desired number of parameters. Appendix Table 2 details the configurations of all our models.

model ladder 根据文献中的启发式规则, 按 Scaling 因子设置全局 batch size 与学习率. 决定参数量的超参, 包括层数、隐藏维度、头数和 MLP 维度, 由 OLMo 开发者为每个规模人工选择, 以达到目标参数量. 附录表 2 给出全部模型配置.

2.3. Prediction Metrics

### 2.3. Prediction Metrics · 预测指标

2.2. Prediction Methods

### 2.2. Prediction Methods · 预测方法

Our predictive task is to forecast which of a pair of data recipes will perform better at some target scale based on small-scale experiments. We use the following metrics to measure the quality of these predictions.

预测任务是根据小规模实验, 判断一对数据配方中哪一个会在目标规模上表现更好. 作者用以下指标衡量预测质量.

Broadly, there are two approaches in the literature to pre- dicting large-scale performance based on small-scale exper- iments. We use straightforward implementations of each to assess where they succeed and fail at making decisions about which data recipes to use.

现有文献用小规模实验预测大规模表现时大体有两条路线. 作者分别采用直接实现, 评估它们在数据配方决策中的成功与失效情形.

Prediction Error Scaling laws literature (Bhagia et al., 2024; Gadre et al., 2024) typically evaluates success from predicted and actual downstream performance, us- ing relative error ( |predicted−actual|

预测误差 Scaling Laws 文献通常根据下游表现预测值与实际值评估成功程度, 使用相对误差 $|predicted-actual|/actual\times100\%$ 或绝对误差 $|predicted-actual|\times100\%$. 本文称其为绝对或相对「预测误差」, 以区别于后面的指标.

actual × 100%) or absolute error (|predicted −actual| × 100%). We call these absolute or relative “prediction error” to distinguish from the following metric.

Ranking Single Scale Experiments (Single Scale) This simple approach is employed by work such as Li et al. (2024) and consists of running a set of ablations or experiments over data recipe options while holding constant all other model- ing variables including scale. The winning data recipe by downstream accuracy (or proxies) at the small experimental scale is assumed to extrapolate to the target scale.

单规模实验排名 (Single Scale) 这种简单方法在固定包括规模在内的全部其他建模变量后, 对不同数据配方运行一组消融或实验. 小实验规模上按下游准确率或代理指标胜出的数据配方, 被假定在目标规模上也会胜出.

Decision Accuracy Unlike previous work, we also mea- sure the impact of predictions on decisions about which data recipe is better than another. The metric we use to capture this is decision accuracy, an accuracy over all pairs of data recipes A and B where either A or B is defined as the cor- rect winner based on which achieves higher performance at the target scale. This is nearly equivalent to Kendall’s τ, but ranges from 0 to 1. We define the target-scale winner based on mean downstream performance over 3 random seeds. Thus decision accuracy can be formalized as follows. Let P be the set of all data recipe pairs (A, B) with observed mean performance yA, yB and predicted performance ˆyA, ˆyB, re- spectively, then decision accuracy is:

决策准确率 与以往工作不同, 本文还衡量预测对「哪种数据配方更好」这一决策的影响. 对任意数据配方对 $A,B$, 目标规模表现更高的一方定义为正确胜者, 决策准确率就是全部配方对上的判断准确率. 它近似 Kendall 的 $\tau$, 但取值范围为 0 到 1. 目标规模胜者按 3 个随机种子的平均下游表现定义. 令 $P$ 为全部数据配方对 $(A,B)$ 的集合, $y_A,y_B$ 是观测平均表现, $\hat y_A,\hat y_B$ 是预测表现, 则决策准确率为:

$$
\frac{1}{|\mathcal{P}|}\sum_{(A,B)\in\mathcal{P}}\mathbb{I}\!\left(\operatorname{sign}(\hat y_A-\hat y_B)=\operatorname{sign}(y_A-y_B)\right). \tag{3}
$$

Extrapolating Scaling Laws (Multi Scale) Another ap- proach to making decisions with predictions across scales used in works such as Dubey et al. (2024) is to fit scaling laws to multiple small experiments across a range of scales for each of the data recipes. The winning recipe is decided as the one whose scaling law shows the highest extrapolated performance at the target scale. Although scaling laws were first observed for language modeling loss (Kaplan et al., 2020; Hoffmann et al., 2022), they have been extended to predict downstream performance through a two-step ap- proach that also fits a function from loss to downstream performance (Gadre et al., 2024; Bhagia et al., 2024). We follow a method from Bhagia et al. (2024). Their proposed approach incorporates separate parameters for number of model parameters and number of tokens trained to account for over or undertrained models. But as our suite only in- cludes one token-parameter ratio, we use the simplified 3 parameter baseline, L(C), as a first step which we chain with second step, Acc(L), defined as follows where A, α, E, a, b, k, L0 are optimized parameters:

外推 Scaling Laws (Multi Scale) 另一条路线为每种数据配方在多个小规模实验上拟合 Scaling Laws, 再按目标规模外推表现最高的配方决定胜者. Scaling Laws 最初针对语言建模损失, 后续工作用两步法扩展到下游表现预测: 先拟合损失随规模的变化, 再拟合损失到下游表现的函数. 本文沿用 Bhagia et al. (2024) 的方法. 原方法为参数量和训练 token 数分别设参, 以处理过训练或欠训练模型. DATADECIDE 只有一种 token—参数比, 所以第一步采用简化的三参数基线 $L(C)$, 第二步串联 $Acc(L)$; $A,\alpha,E,a,b,k,L_0$ 均为优化参数:

L(C) = A

Cα + E (1)

Percent of Target Compute Budget (%C) We measure compute in terms of theoretical FLOPs following the sim- plifying assumption made in most scaling literature that the costs associated with training a model are captured well enough by FLOPs = 6ND, based solely on the number of parameters (N) and tokens trained (D) (Kaplan et al., 2020). We consider the efficiency of a prediction based on the ratio of the experimental budget and the target budget in FLOPs, %C = c

目标算力预算百分比 (%C) 作者用理论 FLOPs 衡量算力, 沿用多数 Scaling 文献的简化假设: 模型训练成本可由参数量 $N$ 与训练 token 数 $D$ 近似为 $FLOPs=6ND$. 预测效率按实验预算 $c$ 与目标预算 $C$ 的 FLOPs 比率计算, 即 $\%C=c/C\times100\%$.

C × 100%.

Acc(L) = a 1 + e−k(L−L0) + b (2)

2.4. Performance Evaluation with OLMES

### 2.4. Performance Evaluation with OLMES · 用 OLMES 评估表现

Following Bhagia et al. (2024) we fit Equation 1 only on observations of final, fully trained checkpoints as account- ing for the learning rate schedule’s impact on intermediate checkpoints would require further parameters in the equa- tion increasing the required number of observations and

沿用 Bhagia et al. (2024), 式 (1) 只在最终完整训练检查点的观测上拟合. 若要建模学习率日程对中间检查点的影响, 需要在式中加入更多参数, 增加所需观测数量与成本.

We use the OLMES suite of 10 multiple choice question an- swering benchmarks (Gu et al., 2024): MMLU (Hendrycks et al., 2021), HellaSwag (Zellers et al., 2019), ARC Chal- lenge (Clark et al., 2018), ARC Easy (Clark et al., 2018),

4

<!-- page 5 of 16 -->

DataDecide: How to Predict Best Pretraining Data with Small Experiments

3. Results

## 3. Results · 结果

3.1. What is the best way to spend compute for data decisions?

### 3.1. What is the best way to spend compute for data decisions? · 数据决策应如何分配算力

More compute makes better decisions. Decisions from intermediate checkpoints are as good as com- pute equivalent final checkpoints. The amount of compute needed to make good predictions varies between tasks. ARC and MMLU are predictable with much less compute than HellaSwag. The rest of OLMES tasks give markedly less reliable predictions across the scales we examine.

更多算力会带来更好的决策. 中间检查点所作决策与算力相当的最终检查点一样好. 作出良好预测所需算力因任务而异: ARC 与 MMLU 所需算力远少于 HellaSwag, 其余 OLMES 任务在所考察规模上的预测可靠性明显较低.

PIQA (Bisk et al., 2020), CommonsenseQA (Talmor et al., 2019),SocialIQA (Sap et al., 2019), OpenBookQA (Mi- haylov et al., 2018), BoolQ (Clark et al., 2019), and Wino- Grande (Sakaguchi et al., 2020). These tasks are well suited for the model scales we examine with all but BoolQ receiv- ing non-trivial performance. Unless otherwise noted, we consider the macro average of these ten tasks. The under- lying metric for each task is accuracy, for which OLMES specifies a different length normalization scheme per task. Our target “gold” rankings which we aim to predict are al- ways based on the “cloze” formulation (CF) accuracy with curated normalization per task, which we refer to as ACCU- RACY. We diverge from OLMES only in that we make use of all available items in the specified split of each bench- mark rather than subsampling them, to reduce variance over the task distribution.

OLMES 的 10 个多项选择问答基准还包括 PIQA、CommonsenseQA、SocialIQA、OpenBookQA、BoolQ 与 WinoGrande. 除 BoolQ 外, 这些任务在所考察模型规模上都有非平凡表现. 如无特别说明, 本文采用十项任务的宏平均. 每项任务底层指标都是准确率, OLMES 为不同任务规定不同的长度归一化方案. 待预测的目标「金标准」排名始终基于 cloze formulation (CF) 准确率, 并按任务采用人工设定的归一化, 文中称为 ACCURACY. 与 OLMES 唯一不同的是, 作者使用每个基准指定划分的全部样本而不作子采样, 以降低任务分布方差.

Note that while we focus just on OLMES multiple choice evaluations in this work, our method of validating decisions made through predictions can be applied to other bench- marks. We chose these tasks based on their appropriateness to our range of model scales, and one would have to se- lect different tasks when targeting a larger scale. Moreover, DATADECIDE could be used to identify new evaluations that are sensitive within our range of scales.

本文虽只研究 OLMES 多项选择评测, 但验证预测决策的方法可用于其他基准. 这些任务是按当前模型规模范围选择的; 若目标规模更大, 就需选择不同任务. DATADECIDE 也可用于识别在当前规模范围内足够敏感的新评测.

2.5. Proxy Metrics for Performance Evaluation

### 2.5. Proxy Metrics for Performance Evaluation · 性能评测的代理指标

First looking at the aggregation of all 10 OLMES tasks (Figure 1 right), we see that there is a positive and roughly log-linear relationship between experimental compute and decision accuracy. Specifically, this figure illustrates the relationship between the compute used for predicting best data recipes and the decision accuracy those predictions achieve against targets ranked by OLMES performance at the 1B scale. Each point represents the average decision accuracy over three runs with different random seeds, with shading indicating standard deviation. Points with the same color show all intermediate checkpoints from a given param- eter size. The color shows each model size for predicting using ranking single scale experiments. The stars show pre- dictions from extrapolating scaling laws using our default 3-parameter approach, the details of which are discussed further in §3.2.

先看 10 个 OLMES 任务的聚合结果 (图 1 右侧), 实验算力与决策准确率呈正向、近似对数线性的关系. 图中比较预测最佳数据配方所用算力, 以及该预测相对于 1B 规模 OLMES 排名目标所达到的决策准确率. 每个点是三个不同随机种子运行的平均决策准确率, 阴影表示标准差. 同色点表示某一参数规模的全部中间检查点; 颜色区分单规模排名预测所用模型规模. 星号表示默认三参数 Scaling Laws 外推的预测, 细节见第 3.2 节.

The ease of prediction is greatly influenced by which evalu- ation benchmark we use. In Figure 2, we show the relation- ship of compute and decision accuracy for each of the tasks in OLMES individually. The predictive sensitivity of tasks at a given compute varies significantly, with ARC Easy be- ing consistently predictable with 5 orders of magnitude less compute and BoolQ only reaching beyond trivial decision accuracy for intermediate checkpoints of the target runs. HellaSwag, SocialIQA, WinoGrande show distinct periods of insensitivity followed by roughly log-linear increase after hitting some compute threshold.

预测难度很大程度取决于评测基准. 图 2 分别展示 OLMES 各任务的算力—决策准确率关系. 在相同算力下, 任务的预测敏感度差异显著: ARC Easy 用少 5 个数量级的算力仍能稳定预测; BoolQ 只有目标运行的中间检查点才能超过平凡决策准确率. HellaSwag、SocialIQA 与 WinoGrande 都先经历明显的不敏感区间, 达到某个算力阈值后才近似对数线性提高.

3.2. How does extrapolating scaling laws compare to ranking single scale experiments?

### 3.2. How does extrapolating scaling laws compare to ranking single scale experiments? · Scaling Laws 外推与单规模排名如何比较

A selection of 8 baseline scaling law methods are

Previous work has noted how discrete metrics such as ac- curacy can cause jumps in performance across scale that otherwise see more predictable improvements with scale for continuous metrics (Schaeffer et al., 2023). We experiment with using continuous metrics at small scale as proxies of the accuracies selected by OLMES for each task (ACCURACY) at the target scale to improve decision accuracy. We use the following metrics: CORRECT PROB is the average probabil- ities of the correct continuations. MARGIN is the average difference between the probability of the correct continu- ation and the most likely incorrect continuation. NORM CORRECT PROB is the average probability of the correct continuation conditioned on the response being in the set of correct or incorrect continuations. TOTAL PROB is the average of the sum of probabilities of all correct and incor- rect continuations. ACCURACY is the fraction of instances where the correct continuation has the highest probability. Each of these can be computed with likelihoods normal- ized by number of tokens or characters; unless otherwise specified we use character length normalization. Appendix Table 3 shows formal definitions.

已有研究指出, 准确率等离散指标会在跨规模时出现跳变, 而连续指标随规模的改善更可预测. 本文在小规模上使用连续指标, 代理目标规模上 OLMES 为各任务选定的 ACCURACY, 以提高决策准确率. CORRECT PROB 是正确续写概率的平均值; MARGIN 是正确续写概率与最高错误续写概率之差的平均值; NORM CORRECT PROB 是在回答属于正确或错误续写集合的条件下, 正确续写概率的平均值; TOTAL PROB 是全部正确与错误续写概率之和的平均值; ACCURACY 是正确续写概率最高的实例比例. 这些指标均可按 token 数或字符数归一化似然; 如无特别说明, 使用字符长度归一化. 正式定义见附录表 3.

no more efficient than ranking single scale experi- ments. Future scaling law methods can be assessed on DATADECIDE.

所选 8 种 Scaling Laws 基线都不比单规模实验排名更高效. 未来 Scaling Laws 方法可以在 DATADECIDE 上接受检验.

Figure 3 contrasts different approaches to fitting scaling laws over multiple scales of small experiments. Each of the 8 approaches is shown in a different color. Multi-scale predictions have a compute budget equal to the training

5

<!-- page 6 of 16 -->

DataDecide: How to Predict Best Pretraining Data with Small Experiments

10M 14M 150M 1B 20M 300M 4M 530M 60M 6M 750M 8M 90M 16M Multi-Scale Fit

ARC Challenge ARC Easy BoolQ CommonsenseQA HellaSwag

1.0

0.8

0.6

Decision Accuracy

0.4

OpenBookQA

PIQA

SocialIQA

WinoGrande

MMLU

1.0

0.8

0.6

Decision Accuracy

0.4

10 5 10 4 10 3 10 2 10 1 100

10 5 10 4 10 3 10 2 10 1 100

10 5 10 4 10 3 10 2 10 1 100

10 5 10 4 10 3 10 2 10 1 100

10 5 10 4 10 3 10 2 10 1 100

Proportion of Target Compute (%C)

Proportion of Target Compute (%C)

Proportion of Target Compute (%C)

Proportion of Target Compute (%C)

Proportion of Target Compute (%C)

Figure 2. Accuracy in pairwise decisions on best data when evaluating on the 10 OLMES tasks with ACCURACY (shown aggregated in

Figure 1). Specific tasks have very distinct ranges of sensitivity, with some like ARC Easy being predictable at small scales and others like HellaSwag requiring substantially more compute to predict.

0.9

0.8

0.7

0.6

Decision Accuracy

0.5

Prediction Method Single scale 3-parameter 3-parameter with helper points 3-parameter step 2 fit with >50 % checkpoints 3-parameter with helpers and >50 % checkpoints 5-parameter 5-parameter, single step 3-parameter, single step 2-parameter

0.4

0.3

10 5 10 4 10 3 10 2 10 1 100

Proportion of Target Compute (%C)

Figure 3. Decision accuracy over 8 baseline scaling law variants. At best, these approaches reach only the same compute to decision

accuracy frontier as ranking single scale experiments. DATADECIDE can be used to iterate on future scaling law prediction methods.

6

<!-- page 7 of 16 -->

DataDecide: How to Predict Best Pretraining Data with Small Experiments

incorrect but presumably relevant additional answers.

也就是说, 这些指标会给看似相关但实际错误的其他答案分配概率.

cost of the model sizes used to make the prediction. We try the following combinations of models sizes: We use {{s1, . . . , sk} | 3 ≤k ≤14}, where s is the ordered set of sizes, to explore the improvements of progressively adding larger model sizes beyond the minimum 3 required for fit- ting. We also use {{sk, . . . , s14} | 2 ≤k ≤11} to try re- moving potentially noisy information from small models. Unlike single scale results, we make only one prediction attempt with the default fully trained random seed, as final checkpoints are required for fitting the first step of these scaling law variants but are not available for all seeds.

多规模预算按用于预测的各模型规模训练成本求和. 作者使用 $\{\{s_1,\ldots,s_k\}\mid3\le k\le14\}$, 其中 $s$ 是有序规模集合, 检验在拟合所需最少 3 个规模之上逐渐加入更大模型的收益; 还使用 $\{\{s_k,\ldots,s_{14}\}\mid2\le k\le11\}$, 尝试去除小模型可能带来的噪声信息. 与单规模结果不同, 多规模方法只用默认完整训练种子预测一次, 因为 Scaling Laws 第一步需要最终检查点, 而其他种子并非都有最终检查点.

We notice two very distinct types of trends over the different tasks. Either the different proxy metrics are nearly indistin- guishable and increase in decision accuracy with compute or CORRECT PROB and TOTAL PROB are flat with respect to scale and the other metrics only rise up to that level of decision accuracy towards the full target compute budget. In the last order of magnitude below the target compute AC- CURACY and the other metrics tend to overtake CORRECT PROB and TOTAL PROB, while these two metrics some- times even decrease in decision accuracy. Notably these other metrics that trend with ACCURACY include continu- ous metrics that penalize probability assigned to incorrect answers, NORM CORRECT PROB and MARGIN.

不同任务呈现两类明显趋势. 第一类中, 各代理指标几乎无法区分, 决策准确率都随算力增加. 第二类中, CORRECT PROB 与 TOTAL PROB 基本不随规模变化, 其他指标要接近完整目标算力预算时才上升到相同决策准确率. 在低于目标算力的最后一个数量级里, ACCURACY 与其他指标往往超过 CORRECT PROB 和 TOTAL PROB, 后两者的决策准确率有时还会下降. 与 ACCURACY 同趋势的其他指标包括 NORM CORRECT PROB 与 MARGIN, 它们都是会惩罚分配给错误答案概率的连续指标.

3.4. How can we make evaluation benchmarks more predictable?

### 3.4. How can we make evaluation benchmarks more predictable? · 如何提高评测基准的可预测性

Our scaling law approaches vary in the number of parame- ters fit, using hard coded points to define the minimum and maximum performance, using only the second half of in- termediate checkpoints for fitting the second step, or fitting a function directly from compute to accuracy in a single step. Each of the scaling law variants are defined formally in Appendix C. The 2 and 3 parameter variants all achieve among the top decision accuracy.

各 Scaling Laws 方法改变拟合参数数量、是否用硬编码点定义最低与最高表现、是否只用后半段中间检查点拟合第二步, 或是否直接单步拟合算力到准确率的函数. 每种变体的正式定义见附录 C. 两参数与三参数变体都达到最高一档的决策准确率.

The decision accuracy on a task is driven in part

by low run-to-run variance and a wide spread of performance values for different data recipes. Us- ing CORRECT PROB sees wider spreads or reduced noise for many tasks. Using this metric enables pre- dicting rankings for code tasks that are too hard for accuracy metrics at small scales.

一个任务的决策准确率部分取决于较低的运行间方差, 以及不同数据配方表现值之间较宽的分布. 对许多任务, CORRECT PROB 会扩大这种分布或降低噪声. 使用该指标后, 可以预测那些在小规模上对准确率指标过难的代码任务排名.

A priori we know that ranking single scale experiments cannot correctly predict when the scaling trend of one data recipe overtakes another at scales between our small ex- periments and target scale. Such crossovers bound the decision accuracy of this constant approximation of per- formance. Nevertheless ranking single scale experiments sets a high baseline decision accuracy, implying relatively little crossover occurs. It is difficult to distinguish evalua- tion variance from true crossovers, but the scaling trends we empirically observe cross over frequently. Improved future scaling laws may be able to advance the Pareto frontier on DATADECIDE as they are not bound by crossovers.

单规模实验排名无法预知一种数据配方的 Scaling 趋势何时会在小实验与目标规模之间反超另一种配方. 这种交叉为把表现视为常数的近似设置了决策准确率上限. 尽管如此, 单规模排名仍给出很高的基线, 暗示真实反超相对较少. 评测方差与真实交叉难以区分, 而实证观测到的 Scaling 曲线确实频繁交叉. 未来更好的 Scaling Laws 不受单规模交叉上限约束, 可能推进 DATADECIDE 的 Pareto 前沿.

3.3. What proxy metrics give better signal for predictions at small scale?

### 3.3. What proxy metrics give better signal for predictions at small scale? · 哪些代理指标在小规模上提供更好信号

At small scales, continuous metrics using the char-

acter normalized likelihood of correct or all answer options serve as better or equivalent predictors of decisions than using the same ACCURACY as used at the target scale.

在小规模上, 使用正确答案或全部答案选项的字符归一化似然这一连续指标, 比直接使用目标规模同款 ACCURACY 更好, 或至少预测能力相当.

What underlies differences in decision accuracy when bench- marks and metrics change? The evaluation must separate pairs of data recipes by an amount greater than combined noise from run-to-run variance of each of the pair’s runs. In Figure 5, we plot tasks with a given metric using fully trained 150M models over these two characteristics: 1) noise—the standard deviation over 3 random seed runs aver- aged over all recipes, and 2) spread—the standard deviation among the mean performance of the different data recipes. Each point also shows the decision accuracy. We see that some highly predictable tasks (e.g., MMLU) are character- ized by having low run-to-run noise, while others (e.g., ARC Easy) widely spread the different data recipes. We also see that improvements from using CORRECT PROB often align with improvements in one of these two characteristics.

当基准与指标变化时, 决策准确率差异来自哪里? 评测必须把一对数据配方拉开的幅度, 超过两者运行间方差形成的合并噪声. 图 5 用完整训练的 150M 模型, 按两项性质绘制任务与指标: 噪声是 3 个随机种子运行的标准差在全部配方上的平均值; 分布宽度是不同数据配方平均表现的标准差. 每个点还显示决策准确率. MMLU 等高度可预测任务具有较低运行间噪声, ARC Easy 等任务则能把不同数据配方的表现拉得很开. CORRECT PROB 带来的提升也经常对应这两项性质之一的改善.

Figure 4 shows the decision accuracy over different proxy metrics. Here we chose a single length normalization, * PER CHAR. Metrics follow similar trends regardless of length normalization and this one is empirically optimal for most of the tasks that we observe.

图 4 展示不同代理指标的决策准确率. 此处统一选用 PER CHAR 长度归一化. 不同长度归一化下指标趋势相似, 而字符归一化在多数观测任务上实证最优.

Using CORRECT PROB or TOTAL PROB leads to decision accuracy at least as good as any other metric for most small scales. These continuous metrics are simple likelihoods over answer strings. In particular, TOTAL PROB may be interpretable as signal of a model having exposure to the domain of a given task in the form of higher likelihoods on

在多数小规模上, CORRECT PROB 或 TOTAL PROB 的决策准确率至少不差于其他指标. 这些连续指标只是答案字符串的似然. TOTAL PROB 尤其可以解释为模型是否接触过某任务领域的信号: 若接触较多, 模型会给看似相关的附加答案更高似然, 即便那些答案并不正确.

As a practical application of these insights, we demonstrate that a change of proxy metric makes predictable two code tasks (Austin et al., 2021; Chen et al., 2021) that are other- wise too challenging for our small models. Figure 6 shows how decision accuracy goes from trivial to 80% when us- ing CORRECT PROB. The switch of metric allows small models to get above the noise floor for these tasks, while still predicting large-scale accuracy metrics. Notably, two math benchmarks (Lewkowycz et al., 2022; Cobbe et al., 2021) do not see such a benefit. They do however give decision accuracy above 80% if we switch the target metric to CORRECT PROB, raising a question for future work to

作为实际应用, 作者展示更换代理指标如何让两个原本对小模型过难的代码任务变得可预测. 图 6 中, 改用 CORRECT PROB 后决策准确率从平凡水平升至 80%. 指标切换让小模型在这些任务上超过噪声底, 同时仍预测大规模准确率指标. 两个数学基准没有同样收益; 但若连目标指标也改成 CORRECT PROB, 它们的决策准确率会超过 80%, 这留下一个后续问题: 改变目标指标是否合理.

7

<!-- page 8 of 16 -->

DataDecide: How to Predict Best Pretraining Data with Small Experiments

Accuracy Correct Prob Margin Total Prob Norm Correct Prob

ARC Challenge ARC Easy BoolQ CommonsenseQA HellaSwag

1.0

0.8

0.6

0.4

Decision Accuracy

0.2

OpenBookQA

PIQA

SocialIQA

WinoGrande

MMLU

1.0

0.8

0.6

0.4

Decision Accuracy

0.2

10 5 10 4 10 3 10 2 10 1 100

10 5 10 4 10 3 10 2 10 1 100

10 5 10 4 10 3 10 2 10 1 100

10 5 10 4 10 3 10 2 10 1 100

10 5 10 4 10 3 10 2 10 1 100

Proportion of Target Compute (%C)

Proportion of Target Compute (%C)

Proportion of Target Compute (%C)

Proportion of Target Compute (%C)

Proportion of Target Compute (%C)

Figure 4. Per-task decision accuracy using character normalized proxy metrics for ACCURACY targets. 5 tasks benefit at smaller scales

from using raw likelihood of answers (CORRECT PROB and TOTAL PROB), as opposed to discrete ACCURACY or continuous metrics that penalize probability on incorrect answers (NORM CORRECT PROB, MARGIN).

1.0

10 1

BoolQ

Accuracy Correct Prob

ARC Easy

0.8

ARC Challenge

OpenBookQA

0.6

CommonsenseQA

MMLU

0.4

Decision Accuracy

SocialIQA

10 2

0.2

HellaSwag

PIQA

Spread (Performance STD over Data Recipes)

WinoGrande

0.0

10 3 10 2 10 1

Noise (Performance STD over Random Seed Runs)

Figure 5. Why do some tasks or metrics get better or worse decision accuracy? At 150M with CORRECT PROB tasks like HellaSwag

succeed with low run-to-run variance and tasks like SocialIQA widely spread the performance assigned to different pretraining data.

8

<!-- page 9 of 16 -->

DataDecide: How to Predict Best Pretraining Data with Small Experiments

80%

4M - Correct Prob 60M - Correct Prob

random 4M - Accuracy 60M - Accuracy

60%

40%

20%

Decision Accuracy

Minerva GSM8K MBPP HumanEval 0%

Figure 6. Code tasks such as humaneval and MBPP go from trivial decision accuracy to largely predictable when using using continuous

CORRECT PROB instead of discrete ACCURACY. Meanwhile common math tasks remain near trivial decision accuracy regardless of metric.

explore whether changing the target metric can be justified.

后续需要研究改变目标指标能否得到充分理由.

range of scales up to 1021 (Brandfonbrener et al., 2024). Our DATADECIDE offers a range of 14 scales up to 7×1020

4. Related Work

## 4. Related Work · 相关工作

FLOPs, while including an order of magnitude more fine- grained data differences. Meanwhile, DCLM also makes extensive use of ranking single scale experiments to drive improvement in data recipes (Li et al., 2024). They release their best data and a model trained on it, but do not release models from their decision making experiments and do not search over multiple recipes at their largest scale. Where their goal is creating a proposed best recipe, our DATADE- CIDE enables the assessment of whether a method for de- cision making really does find the best among proposed recipes.

后续套件覆盖 6 种数据配方与最高约 $10^{21}$ FLOPs. DATADECIDE 覆盖 14 个规模, 最高 $7\times10^{20}$ FLOPs, 同时包含多一个数量级的细粒度数据差异. DCLM 也大量使用单规模实验排名来推动数据配方改进. 它发布最佳数据及其训练模型, 但没有发布决策实验中的模型, 也没有在最大规模上搜索多种配方. DCLM 的目标是提出一种最佳配方; DATADECIDE 则用于评估决策方法能否在候选配方中真正找到最佳项.

5. Limitations

## 5. Limitations · 局限

Prediction Much work studies scaling behavior in lan- guage models. Initially this focused on predicting LM loss from scale as determined by parameter count and tokens trained (Kaplan et al., 2020; Hoffmann et al., 2022). Special consideration is also given to the case of data constrained scaling (Muennighoff et al., 2023; Goyal et al., 2024). Un- like predicting loss, predicting downstream performance from scale is generally harder (Schaeffer et al., 2024). How- ever, recent work has demonstrated it can be done based on a two step prediction that chains together predictions from scale to loss and loss to downstream performance (Gadre et al., 2024; Bhagia et al., 2024; Dubey et al., 2024), some- times using training loss (Du et al., 2024) or transferring losses from different data recipes (Brandfonbrener et al., 2024; Ruan et al., 2024). The one line of work targeting pretraining data considers the special case of deciding mix- ing proportions of several data sources optimized through scaling laws (Kang et al., 2024; Ye et al., 2024). Most relevant to our work, Choshen et al. (2024) consider practi- cal methods for better scaling prediction error such as how much compute to use or whether to include intermediate checkpoints. Orthogonally to these findings, we propose a way to assess the accuracy of decisions made with such predictions.

预测 大量工作研究语言模型的 Scaling 行为. 早期研究按参数量与训练 token 数决定的规模预测语言模型损失, 也单独考察数据受限 Scaling. 从规模预测下游表现通常比预测损失更难, 但近期工作证明两步预测可以做到: 先从规模预测损失, 再从损失预测下游表现; 有些方法使用训练损失, 或迁移不同数据配方的损失. 针对预训练数据的一条路线研究特殊问题: 用 Scaling Laws 优化多个数据源的混合比例. 与本文最相关的工作还研究改善 Scaling 预测误差的实际方法, 如应使用多少算力、是否纳入中间检查点. DATADECIDE 提出与这些方法互补的评价方式, 衡量由预测作出的决策是否准确.

Suites over Data Differences DATADECIDE follows in the footsteps of the Pythia Suite (Biderman et al., 2023) which was the first to offer a controlled comparison of 2 data recipes, using compute scales up to 2 × 1022 FLOPs. Subsequent suites have offered 6 data recipes at 9 × 1020

The scope of our work is limited to just one ratio of tokens to parameters, 100 or 5× “Chinchilla” optimal ratio (Hoff- mann et al., 2022). We believe this captures the typical case, as most models now favor overtraining for inference savings. Due to compute limitations and the need for a stan- dardized set of model configurations over a long period of time in which compute became available for pretraining, we opt for 14 specific configurations from 4M–1B parameter scale. While observations across more configurations would always be better, this must be traded off with exploring the other dimensions of data recipes and random seed reruns. Likewise, while our 25 data recipes is an order of magnitude more than previous suites, there is always the possibility that findings across these will not be representative of future data recipes. In our evaluations we focus on multiple choice tasks with a “cloze” formulation as we find these to be a good fit for our range of scales. Using DATADECIDE, new evaluations can be assessed easily by others without any additional pretraining.

本文范围只覆盖一种 token—参数比: 100, 即「Chinchilla」最优比率的 5 倍. 作者认为这能代表多数模型为节省推理成本而采用过训练的常见情形. 受算力限制, 同时为了在较长预训练周期内保持标准化模型配置, 研究只选择从 4M 到 1B 参数的 14 个具体配置. 更多配置会带来更充分观测, 但必须与数据配方维度和随机种子复跑作取舍. 25 种数据配方虽比以往套件多一个数量级, 结论仍可能无法代表未来配方. 评测聚焦 cloze 形式的多项选择任务, 因为它们适合当前规模范围. 其他研究者可以直接在 DATADECIDE 检查点上评估新任务, 无需额外预训练.

scale (Magnusson et al., 2024) and 6 data recipes over a

数据差异套件方面, DATADECIDE 延续 Pythia Suite 的路线. Pythia 首次对 2 种数据配方进行受控比较, 算力最高 $2\times10^{22}$ FLOPs; 后续套件在 $9\times10^{20}$ FLOPs 规模上提供 6 种配方, 并在另一项工作中继续覆盖 6 种配方与更宽规模范围.

9

<!-- page 10 of 16 -->

DataDecide: How to Predict Best Pretraining Data with Small Experiments

Acknowledgments

Prashanth, U. S., Raff, E., Skowron, A., Sutawika, L., and van der Wal, O. Pythia: A suite for analyzing large language models across training and scaling, 2023. URL https://arxiv.org/abs/2304.01373.

Bisk, Y., Zellers, R., Le bras, R., Gao, J., and Choi, Y. PIQA:

Reasoning about physical commonsense in natural lan- guage. Proceedings of the AAAI Conference on Artificial Intelligence, 34(05):7432–7439, Apr. 2020. doi: 10.1609/ aaai.v34i05.6239. URL https://ojs.aaai.org/ index.php/AAAI/article/view/6239.

Brandfonbrener, D., Anand, N., Vyas, N., Malach, E., and

Kakade, S. Loss-to-loss prediction: Scaling laws for all datasets, 2024. URL https://arxiv.org/abs/ 2411.12925.

We would like to thank Dave Wadden, Kyle Lo, Valentin Hofmann, and Hannaneh Hajishirzi for fruitful conversa- tions. This material is based upon work supported by the U.S. National Science Foundation under Grant No. 2313998. Any opinions, findings, and conclusions or recommenda- tions expressed in this material are those of the author(s) and do not necessarily reflect the views of the U.S. National Sci- ence Foundation. IM is supported by the NSF CSGrad4US Fellowship. PWK is supported by the Singapore National Research Foundation and the National AI Group in the Sin- gapore Ministry of Digital Development and Information under the AI Visiting Professorship Programme (award num- ber AIVP-2024-001) and by the AI2050 program at Schmidt Sciences.

Chen, M., Tworek, J., Jun, H., Yuan, Q., de Oliveira Pinto,

Impact Statement

## Impact Statement · 影响声明

H. P., Kaplan, J., Edwards, H., Burda, Y., Joseph, N., Brockman, G., Ray, A., Puri, R., Krueger, G., Petrov, M., Khlaaf, H., Sastry, G., Mishkin, P., Chan, B., Gray, S., Ryder, N., Pavlov, M., Power, A., Kaiser, L., Bavar- ian, M., Winter, C., Tillet, P., Such, F. P., Cummings, D., Plappert, M., Chantzis, F., Barnes, E., Herbert- Voss, A., Guss, W. H., Nichol, A., Paino, A., Tezak, N., Tang, J., Babuschkin, I., Balaji, S., Jain, S., Saun- ders, W., Hesse, C., Carr, A. N., Leike, J., Achiam, J., Misra, V., Morikawa, E., Radford, A., Knight, M., Brundage, M., Murati, M., Mayer, K., Welinder, P., Mc- Grew, B., Amodei, D., McCandlish, S., Sutskever, I., and Zaremba, W. Evaluating large language models trained on code, 2021. URL https://arxiv.org/abs/ 2107.03374.

Choshen, L., Zhang, Y., and Andreas, J. A hitchhiker’s

Training large language models is computationally expen- sive, especially when investigating thoroughly over dimen- sions of pretraining data composition, model scale, random initialization, and data order. The pretraining experiments in our DATADECIDE required approximately 820K H100 GPU hours. We share the benefit of this cost through releasing all of our models, data, and evaluations so that others will not have to repeat this expenditure. Moreover, our findings can guide efficient and cost-effective model development through the application of decision making with small-scale experiments. While DATADECIDE does not present direct ethical concerns beyond opportunity cost, we acknowledge that decisions about pretraining data heavily impact down- stream model behavior. We encourage future research to explore potential biases in data selection methods and their implications for models deployed in the real world.

训练大语言模型需要大量算力, 尤其是同时系统研究预训练数据组成、模型规模、随机初始化和数据顺序时. DATADECIDE 的预训练实验约使用 82 万 H100 GPU 小时. 作者发布全部模型、数据与评测, 使其他研究者无需重复这笔开销, 从而共享算力投入的收益. 研究结论还可以用小规模实验支持决策, 引导更高效、更节约成本的模型开发. DATADECIDE 除机会成本外没有直接伦理问题, 但预训练数据决策会显著影响下游模型行为. 作者鼓励后续工作研究数据选择方法的潜在偏差, 以及这些偏差对现实部署模型的影响.

guide to scaling law estimation, 2024. URL https: //arxiv.org/abs/2410.11840.

References

Clark, C., Lee, K., Chang, M.-W., Kwiatkowski, T., Collins,

Austin, J., Odena, A., Nye, M., Bosma, M., Michalewski,

H., Dohan, D., Jiang, E., Cai, C., Terry, M., Le, Q., et al. Program synthesis with large language models. arXiv preprint arXiv:2108.07732, 2021.

M., and Toutanova, K. BoolQ: Exploring the surprising difficulty of natural yes/no questions. In Burstein, J., Doran, C., and Solorio, T. (eds.), NAACL, pp. 2924–2936, Minneapolis, Minnesota, June 2019. doi: 10.18653/v1/ N19-1300.

Ben Allal, L., Lozhkov, A., Penedo, G., Wolf, T.,

Clark, P., Cowhey, I., Etzioni, O., Khot, T., Sabharwal, A.,

and von Werra, L. Smollm-corpus, July 2024. URL https://huggingface.co/datasets/ HuggingFaceTB/smollm-corpus.

Schoenick, C., and Tafjord, O. Think you have solved question answering? try arc, the ai2 reasoning challenge. ArXiv, 2018. URL http://arxiv.org/abs/1803.

Bhagia, A., Liu, J., Wettig, A., Heineman, D., Tafjord, O.,

05457.

Cobbe, K., Kosaraju, V., Bavarian, M., Chen, M., Jun, H.,

Jha, A. H., Soldaini, L., Smith, N. A., Groeneveld, D., Koh, P. W., Dodge, J., and Hajishirzi, H. Establishing task scaling laws via compute-efficient model ladders, 2024. URL https://arxiv.org/abs/2412.04403.

Biderman, S., Schoelkopf, H., Anthony, Q., Bradley, H.,

Kaiser, L., Plappert, M., Tworek, J., Hilton, J., Nakano, R., Hesse, C., and Schulman, J. Training verifiers to solve math word problems. arXiv preprint arXiv:2110.14168, 2021.

O’Brien, K., Hallahan, E., Khan, M. A., Purohit, S.,

10

<!-- page 11 of 16 -->

DataDecide: How to Predict Best Pretraining Data with Small Experiments

Common Crawl. Common crawl. URL https:// commoncrawl.org. Accessed: 2025-05-21.

Du, Z., Zeng, A., Dong, Y., and Tang, J. Understanding

emergent abilities of language models from the loss per- spective. In The Thirty-eighth Annual Conference on Neu- ral Information Processing Systems, 2024. URL https: //openreview.net/forum?id=35DAviqMFo.

Dubey, A., Jauhri, A., Pandey, A., Kadian, A., Al-Dahle,

Babaei, Y., Wen, Y., Song, Y., Zhang, Y., Li, Y., Mao, Y., Coudert, Z. D., Yan, Z., Chen, Z., Papakipos, Z., Singh, A. K., Grattafiori, A., Jain, A., Kelsey, A., Shajnfeld, A., Gangidi, A., Victoria, A., Goldstand, A., Menon, A., Sharma, A., Boesenberg, A., Vaughan, A., Baevski, A., Feinstein, A., Kallet, A., Sangani, A., Yunus, A., Lupu, A., Alvarado, A., Caples, A., Gu, A., Ho, A., Poulton, A., Ryan, A., Ramchandani, A., Franco, A., Saraf, A., Chowdhury, A., Gabriel, A., Bharambe, A., Eisenman, A., Yazdan, A., James, B., Maurer, B., Leonhardi, B., Huang, P.-Y. B., Loyd, B., Paola, B. D., Paranjape, B., Liu, B., Wu, B., Ni, B., Hancock, B., Wasti, B., Spence, B., Stojkovic, B., Gamido, B., Montalvo, B., Parker, C., Burton, C., Mejia, C., Wang, C., Kim, C., Zhou, C., Hu, C., Chu, C.-H., Cai, C., Tindal, C., Feichtenhofer, C., Civin, D., Beaty, D., Kreymer, D., Li, S.-W., Wyatt, D., Adkins, D., Xu, D., Testuggine, D., David, D., Parikh, D., Liskovich, D., Foss, D., Wang, D., Le, D., Holland, D., Dowling, E., Jamil, E., Montgomery, E., Presani, E., Hahn, E., Wood, E., Brinkman, E., Arcaute, E., Dunbar, E., Smothers, E., Sun, F., Kreuk, F., Tian, F., Ozgenel, F., Caggioni, F., Guzm’an, F., Kanayet, F. J., Seide, F., Flo- rez, G. M., Schwarz, G., Badeer, G., Swee, G., Halpern, G., Thattai, G., Herman, G., Sizov, G. G., Zhang, G., Lak- shminarayanan, G., Shojanazeri, H., Zou, H., Wang, H., Zha, H., Habeeb, H., Rudolph, H., Suk, H., Aspegren, H., Goldman, H., Molybog, I., Tufanov, I., Veliche, I.-E., Gat, I., Weissman, J., Geboski, J., Kohli, J., Asher, J., Gaya, J.-B., Marcus, J., Tang, J., Chan, J., Zhen, J., Reizenstein, J., Teboul, J., Zhong, J., Jin, J., Yang, J., Cummings, J., Carvill, J., Shepard, J., McPhie, J., Torres, J., Ginsburg, J., Wang, J., Wu, K., KamHou, U., Saxena, K., Prasad, K., Khandelwal, K., Zand, K., Matosich, K., Veeraraghavan, K., Michelena, K., Li, K., Huang, K., Chawla, K., Lakho- tia, K., Huang, K., Chen, L., Garg, L., Lavender, A., Silva, L., Bell, L., Zhang, L., Guo, L., Yu, L., Moshkovich, L., Wehrstedt, L., Khabsa, M., Avalani, M., Bhatt, M., Tsim- poukelli, M., Mankus, M., Hasson, M., Lennie, M., Reso, M., Groshev, M., Naumov, M., Lathi, M., Keneally, M., Seltzer, M. L., Valko, M., Restrepo, M., Patel, M., Vy- atskov, M., Samvelyan, M., Clark, M., Macey, M., Wang, M., Hermoso, M. J., Metanat, M., Rastegari, M., Bansal, M., Santhanam, N., Parks, N., White, N., Bawa, N., Sing- hal, N., Egebo, N., Usunier, N., Laptev, N. P., Dong, N., Zhang, N., Cheng, N., Chernoguz, O., Hart, O., Salpekar, O., Kalinli, O., Kent, P., Parekh, P., Saab, P., Balaji, P., Rittner, P., Bontrager, P., Roux, P., Doll´ar, P., Zvyagina, P., Ratanchandani, P., Yuvraj, P., Liang, Q., Alao, R., Ro- driguez, R., Ayub, R., Murthy, R., Nayani, R., Mitra, R., Li, R., Hogan, R., Battey, R., Wang, R., Maheswari, R., Howes, R., Rinott, R., Bondu, S. J., Datta, S., Chugh, S., Hunt, S., Dhillon, S., Sidorov, S., Pan, S., Verma, S., Ya- mamoto, S., Ramaswamy, S., Lindsay, S., Feng, S., Lin, S., Zha, S. C., Shankar, S., Zhang, S., Wang, S., Agarwal,

A., Letman, A., Mathur, A., Schelten, A., Yang, A., Fan, A., Goyal, A., Hartshorn, A. S., Yang, A., Mitra, A., Sravankumar, A., Korenev, A., Hinsvark, A., Rao, A., Zhang, A., Rodriguez, A., Gregerson, A., Spataru, A., Rozi`ere, B., Biron, B., Tang, B., Chern, B., Caucheteux, C., Nayak, C., Bi, C., Marra, C., McConnell, C., Keller, C., Touret, C., Wu, C., Wong, C., Ferrer, C. C., Niko- laidis, C., Allonsius, D., Song, D., Pintz, D., Livshits, D., Esiobu, D., Choudhary, D., Mahajan, D., Garcia-Olano, D., Perino, D., Hupkes, D., Lakomkin, E., AlBadawy, E. A., Lobanova, E., Dinan, E., Smith, E. M., Radenovic, F., Zhang, F., Synnaeve, G., Lee, G., Anderson, G. L., Nail, G., Mialon, G., Pang, G., Cucurell, G., Nguyen, H., Korevaar, H., Xu, H., Touvron, H., Zarov, I., Ibarra, I. A., Kloumann, I. M., Misra, I., Evtimov, I., Copet, J., Lee, J., Geffert, J. L., Vranes, J., Park, J., Mahadeokar, J., Shah, J., van der Linde, J., Billock, J., Hong, J., Lee, J., Fu, J., Chi, J., Huang, J., Liu, J., Wang, J., Yu, J., Bitton, J., Spisak, J., Park, J., Rocca, J., Johnstun, J., Saxe, J., Jia, J.- Q., Alwala, K. V., Upasani, K., Plawiak, K., Li, K., neth Heafield, K.-., Stone, K., El-Arini, K., Iyer, K., Malik, K., Chiu, K., Bhalla, K., Rantala-Yeary, L., van der Maaten, L., Chen, L., Tan, L., Jenkins, L., Martin, L., Madaan, L., Malo, L., Blecher, L., Landzaat, L., de Oliveira, L., Muzzi, M., Pasupuleti, M. B., Singh, M., Paluri, M., Kar- das, M., Oldham, M., Rita, M., Pavlova, M., Kambadur, M. H. M., Lewis, M., Si, M., Singh, M. K., Hassan, M., Goyal, N., Torabi, N., Bashlykov, N., Bogoychev, N., Chatterji, N. S., Duchenne, O., cCelebi, O., Alrassy, P., Zhang, P., Li, P., Vasi´c, P., Weng, P., Bhargava, P., Dubal, P., Krishnan, P., Koura, P. S., Xu, P., He, Q., Dong, Q., Srinivasan, R., Ganapathy, R., Calderer, R., Cabral, R. S., Stojnic, R., Raileanu, R., Girdhar, R., Patel, R., Sauvestre, R., Polidoro, R., Sumbaly, R., Taylor, R., Silva, R., Hou, R., Wang, R., Hosseini, S., Chennabasappa, S., Singh, S., Bell, S., Kim, S. S., Edunov, S., Nie, S., Narang, S., Raparthy, S. C., Shen, S., Wan, S., Bhosale, S., Zhang, S., Vandenhende, S., Batra, S., Whitman, S., Sootla, S., Collot, S., Gururangan, S., Borodinsky, S., Herman, T., Fowler, T., Sheasha, T., Georgiou, T., Scialom, T., Speck- bacher, T., Mihaylov, T., Xiao, T., Karn, U., Goswami, V., Gupta, V., Ramanathan, V., Kerkez, V., Gonguet, V., Do, V., Vogeti, V., Petrovic, V., Chu, W., Xiong, W., Fu, W., ney Meers, W., Martinet, X., Wang, X., Tan, X. E., Xie, X., Jia, X., Wang, X., Goldschlag, Y., Gaur, Y.,

11

<!-- page 12 of 16 -->

DataDecide: How to Predict Best Pretraining Data with Small Experiments

L. A., Welbl, J., Clark, A., Hennigan, T., Noland, E., Millican, K., van den Driessche, G., Damoc, B., Guy, A., Osindero, S., Simonyan, K., Elsen, E., Rae, J. W., Vinyals, O., and Sifre, L. Training compute-optimal large language models, 2022. URL https://arxiv.org/ abs/2203.15556.

Kang, F., Sun, Y., Wen, B., Chen, S., Song, D.,

S., Sajuyigbe, S., Chintala, S., Max, S., Chen, S., Kehoe, S., Satterfield, S., Govindaprasad, S., Gupta, S., Cho, S.- B., Virk, S., Subramanian, S., Choudhury, S., Goldman, S., Remez, T., Glaser, T., Best, T., Kohler, T., Robinson, T., Li, T., Zhang, T., Matthews, T., Chou, T., Shaked, T., Vontimitta, V., Ajayi, V., Montanez, V., Mohan, V., Kumar, V. S., Mangla, V., Ionescu, V., Poenaru, V. A., Mihailescu, V. T., Ivanov, V., Li, W., Wang, W., Jiang, W., Bouaziz, W., Constable, W., Tang, X., Wang, X., Wu, X., Wang, X., Xia, X., Wu, X., Gao, X., Chen, Y., Hu, Y., Jia, Y., Qi, Y., Li, Y., Zhang, Y., Zhang, Y., Adi, Y.,

Mahmood, R., and Jia, R. Autoscale: Auto- matic prediction of compute-optimal data compo- sition for training llms. ArXiv, abs/2407.20177, 2024. URL https://api.semanticscholar. org/CorpusID:271533897.

Kaplan, J., McCandlish, S., Henighan, T., Brown, T. B.,

Nam, Y., Wang, Y., Hao, Y., Qian, Y., He, Y., Rait, Z., De- Vito, Z., Rosnbrick, Z., Wen, Z., Yang, Z., and Zhao, Z. The llama 3 herd of models. ArXiv, abs/2407.21783, 2024. URL https://api.semanticscholar. org/CorpusID:271571434.

Gadre, S. Y., Smyrnis, G., Shankar, V., Gururangan, S.,

Chess, B., Child, R., Gray, S., Radford, A., Wu, J., and Amodei, D. Scaling laws for neural language mod- els, 2020. URL https://arxiv.org/abs/2001. 08361.

Lambert, N., Morrison, J., Pyatkin, V., Huang, S., Ivison,

Wortsman, M., Shao, R., Mercat, J., Fang, A., Li, J., Keh, S., Xin, R., Nezhurina, M., Vasiljevic, I., Jitsev, J., Sol- daini, L., Dimakis, A. G., Ilharco, G., Koh, P. W., Song, S., Kollar, T., Carmon, Y., Dave, A., Heckel, R., Muen- nighoff, N., and Schmidt, L. Language models scale reli- ably with over-training and on downstream tasks, 2024. URL https://arxiv.org/abs/2403.08540.

Goyal, S., Maini, P., Lipton, Z. C., Raghunathan, A., and

H., Brahman, F., Miranda, L. J. V., Liu, A., Dziri, N., Lyu, S., Gu, Y., Malik, S., Graf, V., Hwang, J. D., Yang, J., Bras, R. L., Tafjord, O., Wilhelm, C., Soldaini, L., Smith, N. A., Wang, Y., Dasigi, P., and Hajishirzi, H. T¨ulu 3: Pushing frontiers in open language model post-training. 2024.

Lewkowycz, A., Andreassen, A., Dohan, D., Dyer, E.,

Kolter, J. Z. Scaling laws for data filtering - data curation cannot be compute agnostic. CoRR, abs/2404.07177, 2024. doi: 10.48550/ARXIV.2404.07177. URL https: //doi.org/10.48550/arXiv.2404.07177.

Groeneveld, D., Beltagy, I., Walsh, P., Bhagia, A., Kinney,

Michalewski, H., Ramasesh, V., Slone, A., Anil, C., Schlag, I., Gutman-Solo, T., Wu, Y., Neyshabur, B., Gur-Ari, G., and Misra, V. Solving quantitative rea- soning problems with language models, 2022. URL https://arxiv.org/abs/2206.14858.

Li, J., Fang, A., Smyrnis, G., Ivgi, M., Jordan, M., Gadre,

S., Bansal, H., Guha, E., Keh, S., Arora, K., Garg, S., Xin, R., Muennighoff, N., Heckel, R., Mercat, J., Chen, M., Gururangan, S., Wortsman, M., Albalak, A., Bitton, Y., Nezhurina, M., Abbas, A., Hsieh, C.-Y., Ghosh, D.,

R., Tafjord, O., Jha, A. H., Ivison, H., Magnusson, I., Wang, Y., Arora, S., Atkinson, D., Authur, R., Chandu, K. R., Cohan, A., Dumas, J., Elazar, Y., Gu, Y., Hessel, J., Khot, T., Merrill, W., Morrison, J., Muennighoff, N., Naik, A., Nam, C., Peters, M. E., Pyatkin, V., Ravichan- der, A., Schwenk, D., Shah, S., Smith, W., Strubell, E., Subramani, N., Wortsman, M., Dasigi, P., Lambert, N., Richardson, K., Zettlemoyer, L., Dodge, J., Lo, K., Sol- daini, L., Smith, N. A., and Hajishirzi, H. Olmo: Ac- celerating the science of language models, 2024. URL https://arxiv.org/abs/2402.00838.

Gu, Y., Tafjord, O., Kuehl, B., Haddad, D., Dodge, J., and

Gardner, J., Kilian, M., Zhang, H., Shao, R., Pratt, S., Sanyal, S., Ilharco, G., Daras, G., Marathe, K., Gokaslan, A., Zhang, J., Chandu, K., Nguyen, T., Vasiljevic, I., Kakade, S., Song, S., Sanghavi, S., Faghri, F., Oh, S., Zettlemoyer, L., Lo, K., El-Nouby, A., Pouransari, H., Toshev, A., Wang, S., Groeneveld, D., Soldaini, L., Koh, P. W., Jitsev, J., Kollar, T., Dimakis, A. G., Carmon, Y., Dave, A., Schmidt, L., and Shankar, V. Datacomp-

Hajishirzi, H. Olmes: A standard for language model eval- uations, 2024. URL https://arxiv.org/abs/ 2406.08446.

Hendrycks, D., Burns, C., Basart, S., Zou, A., Mazeika, M.,

lm: In search of the next generation of training sets for language models, 2024. URL https://arxiv.org/ abs/2406.11794.

Magnusson, I., Bhagia, A., Hofmann, V., Soldaini, L., Jha,

Song, D., and Steinhardt, J. Measuring massive multitask language understanding. Proceedings of the International Conference on Learning Representations (ICLR), 2021.

Hoffmann, J., Borgeaud, S., Mensch, A., Buchatskaya, E.,

A. H., Tafjord, O., Schwenk, D., Walsh, E. P., Elazar, Y., Lo, K., Groeneveld, D., Beltagy, I., Hajishirzi, H.,

Smith, N. A., Richardson, K., and Dodge, J. Paloma: A

Cai, T., Rutherford, E., de Las Casas, D., Hendricks,

12

<!-- page 13 of 16 -->

DataDecide: How to Predict Best Pretraining Data with Small Experiments

benchmark for evaluating language model fit, 2024. URL https://arxiv.org/abs/2312.10523.

the limits of transfer learning with a unified text-to-text transformer. arXiv e-prints, 2019.

Mihaylov, T., Clark, P., Khot, T., and Sabharwal, A. Can

Ruan, Y., Maddison, C. J., and Hashimoto, T. Ob- servational scaling laws and the predictability of lan- gauge model performance. In The Thirty-eighth Annual Conference on Neural Information Processing Systems, 2024. URL https://openreview.net/forum? id=On5WIN7xyD.

a suit of armor conduct electricity? a new dataset for open book question answering. In Riloff, E., Chiang, D., Hockenmaier, J., and Tsujii, J. (eds.), EMNLP, pp. 2381–2391, Brussels, Belgium, October-November 2018. doi: 10.18653/v1/D18-1260.

Sakaguchi, K., Le Bras, R., Bhagavatula, C., and Choi, Y.

Muennighoff, N., Rush, A., Barak, B., Le Scao, T.,

WinoGrande: An adversarial winograd schema challenge at scale. Proceedings of the AAAI Conference on Artificial Intelligence, 34(05):8732–8740, Apr. 2020. doi: 10.1609/ aaai.v34i05.6399. URL https://ojs.aaai.org/ index.php/AAAI/article/view/6399.

Sap, M., Rashkin, H., Chen, D., Le Bras, R., and Choi,

Y. Social IQa: Commonsense reasoning about social

Tazi, N., Piktus, A., Pyysalo, S., Wolf, T., and Raffel, C. A. Scaling data-constrained language models. In Oh, A., Naumann, T., Globerson, A., Saenko, K., Hardt, M., and Levine, S. (eds.), Ad- vances in Neural Information Processing Systems, volume 36, pp. 50358–50376. Curran Associates, Inc., 2023. URL https://proceedings.neurips. cc/paper_files/paper/2023/file/ 9d89448b63ce1e2e8dc7af72c984c196-Paper-Conference. pdf.

interactions. In Inui, K., Jiang, J., Ng, V., and Wan, X. (eds.), EMNLP, pp. 4463–4473, Hong Kong, China, November 2019. doi: 10.18653/v1/D19-1454.

Schaeffer, R., Miranda, B., and Koyejo, S. Are emergent

OLMo, T., Walsh, P., Soldaini, L., Groeneveld, D., Lo, K.,

abilities of large language models a mirage?, 2023. URL https://arxiv.org/abs/2304.15004.

Schaeffer, R., Schoelkopf, H., Miranda, B., Mukobi, G.,

Madan, V., Ibrahim, A., Bradley, H., Biderman, S., and Koyejo, S. Why has predicting downstream capabili- ties of frontier AI models with scale remained elusive? In Trustworthy Multi-modal Foundation Models and AI Agents (TiFA), 2024. URL https://openreview.

net/forum?id=AbHHrj9afB.

Arora, S., Bhagia, A., Gu, Y., Huang, S., Jordan, M., Lambert, N., Schwenk, D., Tafjord, O., Anderson, T., Atkinson, D., Brahman, F., Clark, C., Dasigi, P., Dziri, N., Guerquin, M., Ivison, H., Koh, P. W., Liu, J., Malik, S., Merrill, W., Miranda, L. J. V., Morrison, J., Murray, T., Nam, C., Pyatkin, V., Rangapur, A., Schmitz, M., Skjonsberg, S., Wadden, D., Wilhelm, C., Wilson, M., Zettlemoyer, L., Farhadi, A., Smith, N. A., and Hajishirzi, H. 2 olmo 2 furious, 2025. URL https://arxiv. org/abs/2501.00656.

Soldaini, L., Kinney, R., Bhagia, A., Schwenk, D., Atkinson,

Penedo, G., Malartic, Q., Hesslow, D., Cojocaru, R.-A.,

D., Authur, R., Bogin, B., Chandu, K., Dumas, J., Elazar, Y., Hofmann, V., Jha, A. H., Kumar, S., Lucy, L., Lyu, X.,

Cappelli, A., Alobeidli, H., Pannier, B., Almazrouei, E., and Launay, J. The refinedweb dataset for fal- con llm: Outperforming curated corpora with web data, and web data only. ArXiv, abs/2306.01116, 2023. URL https://api.semanticscholar. org/CorpusID:259063761.

Penedo, G., Kydl´ıˇcek, H., allal, L. B., Lozhkov, A., Mitchell,

Lambert, N., Magnusson, I., Morrison, J., Muennighoff, N., Naik, A., Nam, C., Peters, M. E., Ravichander, A., Richardson, K., Shen, Z., Strubell, E., Subramani, N., Tafjord, O., Walsh, P., Zettlemoyer, L., Smith, N. A., Hajishirzi, H., Beltagy, I., Groeneveld, D., Dodge, J., and Lo, K. Dolma: an Open Corpus of Three Trillion Tokens for Language Model Pretraining Research. arXiv preprint, 2024.

Talmor, A., Herzig, J., Lourie, N., and Berant, J. Com-

M., Raffel, C., Werra, L. V., and Wolf, T. The fineweb datasets: Decanting the web for the finest text data at scale, 2024. URL https://arxiv.org/abs/ 2406.17557.

Porian, T., Wortsman, M., Jitsev, J., Schmidt, L., and Car-

monsenseQA: A question answering challenge targeting commonsense knowledge. In Burstein, J., Doran, C., and Solorio, T. (eds.), NAACL, pp. 4149–4158, Minneapolis, Minnesota, June 2019. doi: 10.18653/v1/N19-1421.

Ye, J., Liu, P., Sun, T., Zhou, Y., Zhan, J., and Qiu, X. Data

mon, Y. Resolving discrepancies in compute-optimal scaling of language models. ArXiv, abs/2406.19146, 2024. URL https://api.semanticscholar. org/CorpusID:270764838.

Raffel, C., Shazeer, N., Roberts, A., Lee, K., Narang, S.,

mixing laws: Optimizing data mixtures by predicting lan- guage modeling performance. ArXiv, abs/2403.16952, 2024. URL https://api.semanticscholar. org/CorpusID:268681464.

Matena, M., Zhou, Y., Li, W., and Liu, P. J. Exploring

13

<!-- page 14 of 16 -->

DataDecide: How to Predict Best Pretraining Data with Small Experiments

Zellers, R., Holtzman, A., Bisk, Y., Farhadi, A., and Choi, Y.

A. Hyperparameters

## A. Hyperparameters · 超参数

Table 2 provides OLMo model ladder configurations for all models in DATADECIDE.

表 2 给出 DATADECIDE 全部模型的 OLMo model ladder 配置.

HellaSwag: Can a machine really finish your sentence? In Korhonen, A., Traum, D., and M`arquez, L. (eds.), ACL, pp. 4791–4800, Florence, Italy, July 2019. doi: 10.18653/v1/P19-1472.

B. Proxy Metric Definitions

## B. Proxy Metric Definitions · 代理指标定义

Zhou, F., Wang, Z., Liu, Q., Li, J., and Liu, P. Program-

Table 3 provides formal definitions for our proxy metrics (§2.5).

表 3 给出第 2.5 节代理指标的正式定义.

ming every example: Lifting pre-training data quality like experts at scale. arXiv preprint arXiv:2409.17115, 2024.

C. Scaling Law Variants

## C. Scaling Law Variants · Scaling Laws 变体

Baseline 3-parameter fit. Our default setup (described in §2.2) follows the two-step fit from (Bhagia et al., 2024) and uses Equation 1 to map compute C to task loss L, and Equation 2 to map task loss to metric score. This variant fits three parameters (A, α, E) in the first step.

三参数拟合基线 默认设置沿用 Bhagia et al. (2024) 的两步拟合: 式 (1) 把算力 $C$ 映射为任务损失 $L$, 式 (2) 再把任务损失映射为指标分数. 第一阶段拟合 $A,\alpha,E$ 三个参数.

2-parameter fit. This is a restricted version of the base- line where the irreducible loss term E is removed from Equation 1, leaving only two parameters:

两参数拟合 这是受限的基线变体, 从式 (1) 删除不可约损失项 $E$, 只保留两个参数:

L(C) = A

Cα (4)

5-parameter (N, D) fit. Instead of modeling loss as a function of compute C, this variant uses both number of tokens N and number of parameters D directly in the loss function:

五参数 $(N,D)$ 拟合 该变体不把损失建模为算力 $C$ 的函数, 而在损失函数中直接使用 token 数 $N$ 与参数量 $D$:

L(N, D) = A

N α + B

Dβ + E (5)

This introduces five parameters: A, α, B, β, and E.

由此引入 $A,\alpha,B,\beta,E$ 五个参数.

Single-step prediction. In this variant, the two-stage fitting procedure is replaced with a single step that directly maps compute C to accuracy:

单步预测 该变体用单一步骤替换两阶段拟合, 直接把算力 $C$ 映射为准确率:

$$
\operatorname{Acc}(C)=\frac{a}{1+\exp\!\left[-k\left(\frac{A}{C^\alpha}+E-L_0\right)\right]}+b. \tag{6}
$$

This combines the loss and accuracy mapping into one func- tion.

它把损失映射与准确率映射合并为一个函数.

5-parameter, single step. We also test a single-step variant that directly maps from (N, D) to accuracy using a logistic function over the predicted loss. This merges Equations 5 and 2 into:

五参数单步预测 作者还测试直接从 $(N,D)$ 映射到准确率的单步变体, 在预测损失上使用 logistic 函数, 把式 (5) 与式 (2) 合并为:

$$
\operatorname{Acc}(N,D)=\frac{a}{1+\exp\!\left[-\left(\frac{A}{N^\alpha}+\frac{B}{D^\beta}+E\right)\right]}+b. \tag{7}
$$

This formulation retains the same five parameters from the two-step (N, D) loss function. Following Bhagia et al. (2024), we merge the parameters k and L0 from the second- stage sigmoid into the loss-side parameters (A, B, E), yield- ing a simplified single-stage fit with 7 total free parameters: {A, α, B, β, E, a, b}.

该形式保留两步 $(N,D)$ 损失函数中的五个参数. 沿用 Bhagia et al. (2024), 第二阶段 sigmoid 的 $k,L_0$ 被合并进损失侧参数 $A,B,E$, 得到简化的单阶段拟合, 共 7 个自由参数: $\{A,\alpha,B,\beta,E,a,b\}$.

14

<!-- page 15 of 16 -->

DataDecide: How to Predict Best Pretraining Data with Small Experiments

Model name

Batch size

Hidden dim.

LR Model size

Heads Layers Training steps

Tokens trained

4M 32 64 1.4e-02 3.7M 8 8 5,725 0.4B 6M 32 96 1.2e-02 6.0M 8 8 9,182 0.6B 8M 32 128 1.1e-02 8.5M 8 8 13,039 0.9B 10M 32 144 1.0e-02 9.9M 8 8 15,117 1.0B 14M 32 192 9.2e-03 14.4M 8 8 21,953 1.4B 16M 32 208 8.9e-03 16.0M 8 8 24,432 1.6B 20M 64 192 8.4e-03 19.1M 8 16 14,584 1.9B 60M 96 384 5.8e-03 57.1M 12 16 29,042 5.7B 90M 160 528 4.9e-03 97.9M 12 16 29,901 9.8B 150M 192 768 4.2e-03 151.9M 12 12 38,157 15.0B 300M 320 1,024 3.3e-03 320.0M 16 16 45,787 30.0B 530M 448 1,344 2.8e-03 530.1M 16 16 57,786 53.0B 750M 576 1,536 2.5e-03 681.3M 16 16 63,589 75.0B 1B 704 2,048 2.1e-03 1176.8M 16 16 69,369 100.0B

Table 2. DATADECIDE uses OLMo’s model ladder (Groeneveld et al., 2024; OLMo et al., 2025; Bhagia et al., 2024) to programmatically

create configurations for 14 model sizes with hyperparameters determined by heuristics in Porian et al. (2024). All models have sequence length of 2024 and MLP ratio of 8. Each configuration is pretrained over 25 data recipes (Table 1). Each recipe and configuration is also trained for 3 random seeds where model sizes < 1B are stopped early at 25% of the compute used to train the 1B model for all but the default seed. Model size is number of non-embedding parameters. Batch size is the number of sequences per batch.

| Metric Name | Equation |
|---|---|
| Correct Prob | $\frac{1}{N}\sum_{i=1}^{N}P(c_{\mathrm{correct}}^{(i)}\mid\mathrm{context}_i)$ |
| Margin | $\frac{1}{N}\sum_{i=1}^{N}\left(P(c_{\mathrm{correct}}^{(i)}\mid\mathrm{context}_i)-\max_{c'\ne c_{\mathrm{correct}}^{(i)},\,c'\in C^{(i)}}P(c'\mid\mathrm{context}_i)\right)$ |
| Norm Correct Prob | $\frac{1}{N}\sum_{i=1}^{N}\frac{P(c_{\mathrm{correct}}^{(i)}\mid\mathrm{context}_i)}{\sum_{c\in C^{(i)}}P(c\mid\mathrm{context}_i)}$ |
| Total Prob | $\frac{1}{N}\sum_{i=1}^{N}\sum_{c\in C^{(i)}}P(c\mid\mathrm{context}_i)$ |
| Accuracy | $\frac{1}{N}\sum_{i=1}^{N}\mathbb{I}\!\left[\arg\max_{c\in C^{(i)}}P(c\mid\mathrm{context}_i)=c_{\mathrm{correct}}^{(i)}\right]$ |

* per token log(P (c|context))/tokens(c)

* per char log(P (c|context))/chars(c)

Table 3. Proxy metrics used as alternative inputs to our prediction methods, C(i) is the set of possible continuations for item i and N is

the number of items in a benchmark. Each each of the first 5 metrics have * per token and * per char variants in which likelihoods are normalized as defined in the bottom two rows.

Relative Error Absolute Error Scaling Law Variant

3-parameter with helpers and >50% checkpoints 5.6 2.6 3-parameter with helper points 6.0 2.8 3-parameter step 2 fit with >50% checkpoints 5.9 2.9 3-parameter 6.5 3.1 2-parameter 6.5 3.2 5-parameter, single step 42.8 17.4 3-parameter, single step 42.9 42.3 5-parameter 230.8 65.4

Table 4. Average prediction error for 1B targets for the different scaling law setups across tasks and recipes on ACCURACY fit to all

models but 1B. We see that other than the single step and 5-parameter variants errors are comparable, and these variants also roughly follow the compute-decision frontier in Figure 3.

15

<!-- page 16 of 16 -->

DataDecide: How to Predict Best Pretraining Data with Small Experiments

Use of helper points. Following Bhagia et al. (2024), we optionally include an extra point (L = 0.0, Acc = 1.0) in the second-stage fit. This “helper” point anchors the upper asymptote of the accuracy prediction.

使用辅助点 沿用 Bhagia et al. (2024), 第二阶段拟合可选加入额外点 $(L=0.0,Acc=1.0)$. 这个「辅助」点固定准确率预测的上渐近线.

Filtering early checkpoints. We experiment with exclud- ing the first 50% of intermediate checkpoints when fitting the second-stage sigmoid. This reduces noise from high-loss early training points and often improves the fit for extrapo- lation.

过滤早期检查点 拟合第二阶段 sigmoid 时, 作者尝试排除前 50% 的中间检查点. 这样可减少训练早期高损失点的噪声, 并经常改善外推拟合.

Helpers and > 50% checkpoints. Lastly we experiment with combining the previous two techniques on the baseline 3-parameter fit.

辅助点与后 50% 检查点 最后, 作者在三参数拟合基线上组合前述两种技术.

Prediction Error. We report prediction errors in Table 4 for each setup. As the best scaling laws variants are all roughly comparable to the simple 3-parameter set up, we use this one as our baseline.

预测误差 表 4 报告各设置的预测误差. 最佳 Scaling Laws 变体都与简单三参数设置大体相当, 因而正文以三参数设置为基线.

16
