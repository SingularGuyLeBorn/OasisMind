---
title: "Signal and Noise?????????????"
category: "?????"
tags: ["????", "???", "??????", "????", "OLMo"]
published: true
excerpt: "Signal and Noise ????????????????????????????????????????????"
---

<!-- arXiv 2508.13144; 文字由 PyMuPDF 按页抽取, 公式与表以 data/sources/signal-and-noise/latex/ 的 LaTeX 源码为准 -->

<!-- page 1 of 35 -->

Signal and Noise: A Framework for Reducing

Uncertainty in Language Model Evaluation

David Heinemanµ Valentin Hofmannµσ Ian Magnussonµσ Yuling Guµ

Noah A. Smithµσ Hannaneh Hajishirziµσ Kyle Loµ Jesse Dodgeµ

µAllen Institute for Artificial Intelligence σPaul G. Allen School of Computer Science & Engineering, University of Washington

µAllen 人工智能研究所 σPaul G. Allen 华盛顿大学计算机科学与工程学院

contact: davidh@allenai.org

Abstract

Developing large language models is expensive and involves making decisions with small experiments, typically by evaluating on large, multi-task evaluation suites. In this work, we analyze specific properties which make a benchmark more reliable for such decisions, and interventions to design higher-quality evaluation bench- marks. We introduce two key metrics that show differences in current benchmarks: signal, a benchmark’s ability to separate better models from worse models, and noise, a benchmark’s sensitivity to random variability between training steps. We demonstrate that benchmarks with a better signal-to-noise ratio are more reliable when making decisions at small scale, and those with less noise have lower scaling law prediction error. These results suggest that improving signal or noise will lead to more useful benchmarks, so we introduce three interventions designed to directly affect signal or noise. For example, we propose that switching to a metric that has better signal and noise (e.g., perplexity rather than accuracy) leads to better reliability and improved scaling law error. We also find that filtering noisy subtasks, to improve an aggregate signal-to-noise ratio, leads to more reliable multi-task evaluations. We also find that averaging the output of a model’s intermediate checkpoints to reduce noise leads to consistent improvements. We conclude by recommending that those creating new benchmarks, or selecting which existing benchmarks to use, aim for high signal and low noise. We use 30 bench- marks for these experiments, and 375 open-weight language models from 60M to 32B parameters, resulting in a new, publicly available dataset of 900K evaluation benchmark results, totaling 200M instances.

开发大型语言模型成本高昂，并且涉及通过小型实验做出决策，通常是通过对大型多任务评估套件进行评估。在这项工作中，我们分析了使此类决策的基准更加可靠的特定属性，以及设计更高质量评估基准的干预措施。我们引入了两个关键指标来显示当前基准的差异：信号，基准将更好的模型与更差的模型分开的能力；噪声，基准对训练步骤之间随机变异的敏感性。我们证明，在小规模决策时，具有更好信噪比的基准更加可靠，而那些噪声较小的基准具有较低的缩放定律预测误差。这些结果表明，改善信号或噪声将带来更有用的基准，因此我们引入了三种旨在直接影响信号或噪声的干预措施。例如，我们建议切换到具有更好信号和噪声（例如，困惑度而不是准确性）的度量可以带来更好的可靠性和改进的标度律误差。我们还发现，过滤噪声子任务以提高总体信噪比可以带来更可靠的多任务评估。我们还发现，对模型中间检查点的输出进行平均以减少噪声可以带来持续的改进。最后，我们建议那些创建新基准或选择使用现有基准的人以高信号和低噪声为目标。我们使用 30 个基准进行这些实验，以及 375 个开放权重语言模型（从 60M 到 32B 参数），产生一个包含 900K 评估基准结果的新的公开数据集，总计 200M 个实例。

allenai/signal-and-noise datasets/allenai/signal-and-noise

arXiv:2508.13144v1  [cs.CL]  18 Aug 2025

1 Introduction · 引言

Language model development is expensive. During the development process, researchers need to make decisions such as what architecture to use, what training methods to employ, and what data to train on. These decisions rely on measuring phenomena at smaller, more economical scales, then hoping the trends measured hold for large scale models. This paradigm exists across the research community; many papers experiment with small baselines then scale up the best-performing model [31, 17, 38, inter alia], and there has been extensive research on using scaling laws to predict the performance of larger models [9, 19, inter alia]. While there is a large and ever-growing number of benchmarks, prior work has shown these scaling procedures only works for some benchmarks and not others [66, 56, 15, 50]. This poses a significant challenge because, as we develop more general-purpose language models, developers need to be evaluating on even more diverse benchmarks, some of which may not be well-suited for this critical approach. We need a deeper understanding

语言模型的开发是昂贵的。在开发过程中，研究人员需要做出决策，例如使用什么架构、使用什么训练方法以及使用什么数据进行训练。这些决策依赖于在更小、更经济的尺度上测量现象，然后希望测量到的趋势适用于大规模模型。这种范式存在于整个研究界；许多论文使用较小的基线进行实验，然后扩大性能最佳的模型[31,17,38等]，并且已经有关于使用缩放定律来预测较大模型的性能的广泛研究[9,19等]。虽然基准数量庞大且不断增长，但先前的工作表明这些扩展程序仅适用于某些基准，而不适用于其他基准 [66,56,15,50]。这提出了重大挑战，因为当我们开发更多通用语言模型时，开发人员需要在更多样化的基准上进行评估，其中一些基准可能不太适合这种关键方法。我们需要更深入的了解

Preprint.

<!-- page 2 of 35 -->

HellaSwag (low noise, low signal)

ARC Challenge (high noise, high signal)

MMLU (low noise, high signal)

0.65

1B-5xC

1B-5xC

1B-5xC

0.50

Training curve (25 corpora)

Training curve (25 corpora)

Training curve (25 corpora)

0.36

0.60

Final checkpoint

Final checkpoint

Final checkpoint

0.45

low signal

0.34

0.55

300M-5xC

high signal

high signal

0.40

0.50

0.32

300M-5xC

300M-5xC

150M-5xC

0.45

0.30

0.35

Accuracy

Accuracy

Accuracy

150M-5xC

1B curve

1B curve

1B curve

0.40

0.625

0.37

0.28

150M-5xC

0.30

0.36

0.35

0.600

low noise

high noise

0.26

0.35 low noise

0.25

0.35

0.575

0.30

0.34

0.24

0.20

1018 1019 1020 1021

1018 1019 1020 1021

1018 1019 1020 1021

Compute

Compute

Compute

Figure 1: Training curves for the 25 pretraining corpora in DataDecide [38] on three development benchmarks across different model sizes – the ordering of different model pre-training corpora, shown by different colors, at a small scale (e.g., 150M) should agree with ordering at a larger scale (1B), implying better decision accuracy. We hypothesize that one indicator of decision accuracy is the ratio between the signal (main plot) and the noise of scores within a single training run (inset axis). In this work, we quantify the signal-to-noise ratio at different compute scales, and in later sections, show that it is predictive of large scale phenomena like decision-making error.

of what intrinsic properties we can measure to tell if a benchmark provides useful information, if it needs to be reformulated, or if it is best discarded altogether.

我们可以测量哪些内在属性来判断基准是否提供了有用的信息，是否需要重新制定，或者是否最好完全放弃。

To formalize this setup, we study two common experimental settings for language model development: (i) train a pair of small models (e.g., on different pretraining corpora) and use their ranking to predict the ranking of two large models [38], and (ii) fit a scaling law on a set of small models and predict the performance of a large model [19, 3]. We hypothesize that the ability to predict both settings are related to a measure which is cheaper to compute and easier to improve: signal and noise. Signal measures how spread out scores are for different models on a single benchmark and noise measures the variability of a benchmark score during training.

为了形式化这一设置，我们研究了语言模型开发的两种常见实验设置：（i）训练一对小模型（例如，在不同的预训练语料库上）并使用它们的排名来预测两个大型模型的排名[38]，以及（ii）在一组小模型上拟合缩放法则并预测大型模型的性能[19, 3]。我们假设预测这两种设置的能力与计算成本更低且更容易改进的度量相关：信号和噪声。信号测量不同模型在单个基准上的分数分布情况，噪声测量训练期间基准分数的变异性。

To illustrate the connection from signal and noise to an experimental setting, consider an example of comparing models trained using different pretraining corpora (illustrated in Figure 1); the tasks where scores are either too close (HellaSwag, left) or too noisy (ARC Challenge, center) are the benchmarks where we would be less confident that a ranking of models at a small scale would hold at a large scale. Following this observation, we show in Section 4 that the signal-to-noise ratio (SNR) is highly correlated with the likelihood that a ranking of models at a small scale will hold at a large scale, and then show that noise is highly correlated with the prediction error of a scaling law fit.

为了说明信号和噪声与实验设置的联系，请考虑比较使用不同预训练语料库训练的模型的示例（如图 1 所示）；分数太接近（HellaSwag，左）或太嘈杂（ARC Challenge，中）的任务是我们对小规模模型排名在大范围内保持不变的信心的基准。根据这一观察，我们在第 4 节中表明，信噪比 (SNR) 与小尺度模型排序在大尺度上保持的可能性高度相关，然后表明噪声与缩放法则拟合的预测误差高度相关。

Based on these observations, in Section 5 we propose a set of interventions designed to reduce noise or increase signal, and then we measure their impact on our experimental setups of decision accuracy and scaling law error. For example, we show that by averaging out the checkpoint-to- checkpoint noise for a model, we improve our ability to predict performance of large models from small models. We also show that it is possible to find subsets of existing benchmarks that have higher signal-to-noise ratios than the full evaluation sets, and that even though those subsets can have fewer than half as many instances, they improve both experimental setups. Finally, we show that SNR can be used to improve metric construction, where choosing a metric that has better SNR leads to consistent improvements on a wide variety of benchmarks.

基于这些观察结果，在第 5 节中，我们提出了一组旨在减少噪声或增加信号的干预措施，然后我们测量它们对决策准确性和标度律误差的实验设置的影响。例如，我们表明，通过对模型的检查点到检查点噪声进行平均，我们提高了从小模型预测大模型性能的能力。我们还表明，可以找到比完整评估集具有更高信噪比的现有基准子集，并且即使这些子集的实例数量不到一半，它们也改进了两种实验设置。最后，我们表明 SNR 可用于改进指标构建，其中选择具有更好 SNR 的指标可以在各种基准上实现一致的改进。

Our core contributions are as follows: (i) we introduce definitions for signal, noise, and signal- to-noise ratio in the setting of evaluating language models, and show this framework is useful for measuring the utility of benchmarks, and (ii) we demonstrate interventions based on this framework which improve both prediction settings. Our core results evaluate 465 language models on 30 benchmarks across 14 model sizes. We release our data, evaluation results, and trained models.

我们的核心贡献如下：（i）我们在评估语言模型的设置中引入了信号、噪声和信噪比的定义，并表明该框架对于衡量基准的实用性很有用，以及（ii）我们展示了基于该框架的干预措施，可以改善两种预测设置。我们的核心结果在 14 个模型大小的 30 个基准上评估了 465 个语言模型。我们发布我们的数据、评估结果和训练模型。

2 Predicting Large Model Phenomena with Small Models · 用小模型预测大模型现象

Using small scale experiments to make predictions about large model behavior is ubiquitous in language model development [27, 60, 31, 42]. This process can take many forms. For example, finding a good mix of data from multiple sources to train on typically involves evaluation of small models to calculate an optimal weighting of datasets, then training a large model on the optimized

使用小规模实验来预测大型模型行为在语言模型开发中普遍存在[27,60,31,42]。这个过程可以采取多种形式。例如，从多个来源找到良好的数据组合进行训练通常涉及评估小型模型以计算数据集的最佳权重，然后在优化后的模型上训练大型模型

2

<!-- page 3 of 35 -->

mix [35, 66]. In Blakeney et al. [5], mid-training runs on a sample of candidate pretraining datasets are used to estimate the quality of training from-scratch. Dubey et al. [17] predicted the downstream task using scaling laws to compare candidate data mixes. Hyperparameter transfer methods, such as maximal update parametrization (µP), also rely on small scale experiments [68]. However, the results from small scale experiments are not always reliable. Work on so-called emergent capabilities [65] shows that for some benchmarks, language model performance only rises above random chance for models trained at large compute budgets. Later work has further explored emergence behavior in particular tasks, such as MCQA tasks [67] or generative math and code tasks [57], or by observing the capabilities of open-weight models [51].

混合 [35, 66]。在布莱克尼等人中。 [5]，在候选预训练数据集样本上运行的中期训练用于从头开始估计训练的质量。杜贝等人。 [17]使用缩放法则来比较候选数据混合来预测下游任务。超参数传递方法，例如最大更新参数化（μP），也依赖于小规模实验[68]。然而，小规模实验的结果并不总是可靠的。对所谓的新兴能力的研究[65]表明，对于某些基准测试，语言模型的性能只会高于在大量计算预算下训练的模型的随机机会。后来的工作进一步探索了特定任务中的涌现行为，例如 MCQA 任务 [67] 或生成数学和代码任务 [57]，或者通过观察开放权重模型的功能 [51]。

While these different experimental setups are all important, we focus on two straightforward and common setups in making data decisions for language model development: decision accuracy and scaling law prediction error. In this section, we present the motivation for both experimental settings, and in Section 3 we show how the signal-to-noise ratio is an effective framework for predicting how useful a benchmark in these scenarios.

虽然这些不同的实验设置都很重要，但我们在为语言模型开发制定数据决策时重点关注两种简单且常见的设置：决策准确性和标度律预测误差。在本节中，我们介绍了两种实验设置的动机，在第 3 节中，我们展示了信噪比如何成为预测这些场景中基准测试有用程度的有效框架。

2.1 Decision Accuracy and Scaling Law Prediction Error · 决策准确率与缩放律预测误差

Decision Accuracy. Consider a scenario where a practitioner intends to train a large model, and needs to decide between training on Dataset a or Dataset b to get the best performance on some downstream task, represented by a scalar B(·). A simple and intuitive approach is to train a small model sa on Dataset a and another, sb, on Dataset b, then choose the dataset that led to the best downstream task performance for training the large model. We evaluate this procedure by training two large models, ma and mb, one on each of the datasets, and see if the ranking of the two small models, sa and sb, on the benchmark is the same as for the large models.1 In the scenario where we are deciding between more than two choices, we consider pairwise rankings between all pairs P. Following Magnusson et al. [38] we refer to this small-to-large agreement as “decision accuracy”:

决策准确性。考虑这样一个场景：实践者打算训练大型模型，并且需要在数据集 a 或数据集 b 上进行训练之间做出决定，以便在某些下游任务（由标量 B(·) 表示）上获得最佳性能。一种简单直观的方法是在数据集 a 上训练一个小模型 sa，在数据集 b 上训练另一个小模型 sb，然后选择能产生最佳下游任务性能的数据集来训练大模型。我们通过训练两个大型模型 ma 和 mb（每个数据集各一个）来评估这一过程，并查看两个小模型 sa 和 sb 在基准上的排名是否与大型模型相同。1 在我们在两个以上选择之间做出决定的场景中，我们考虑所有对 P 之间的成对排名。 [38]我们将这种从小到大的一致性称为“决策准确性”：

X

I [sign(B(sa) −B(sb)) = sign(B(ma) −B(mb))] (1)

Decision Accuracy = 1 |P|

(a,b)∈P

We use models of 7 sizes (from 60M parameters up to 1B parameters) trained on 25 different pretraining corpora from Magnusson et al. [38]. Our prediction task is to use a set of small models (e.g., 60M parameter models) to predict the ranking of the 1B models on a given benchmark (e.g., MMLU). High decision accuracy means the ranking of the small models accurately predicts the ranking of the large models on that benchmark; this is an indication that the benchmark is useful for this process of using small models to make decisions about which dataset to train on. We illustrate an example of this in Figure 1, which shows training curves for 25 data recipes on 3 model sizes. We hypothesize that if model scores are very close together, or the evaluations are very noisy, it is more likely that the ranking from small to large models will change, leading to worse decision accuracy; we formalize and test this hypothesis in the following sections.2

我们使用 7 种大小的模型（从 60M 参数到 1B 参数），并在 Magnusson 等人的 25 个不同的预训练语料库上进行训练。 [38]。我们的预测任务是使用一组小模型（例如，60M 参数模型）来预测 1B 模型在给定基准（例如，MMLU）上的排名。高决策精度意味着小模型的排名可以准确预测大模型在该基准上的排名；这表明该基准对于使用小模型来决定训练哪个数据集的过程很有用。我们在图 1 中举例说明了这一点，其中显示了 3 个模型大小的 25 个数据配方的训练曲线。我们假设，如果模型得分非常接近，或者评估噪声很大，从小模型到大模型的排名更有可能发生变化，导致决策准确性变差；我们在以下几节中形式化并测试了这一假设。2

Scaling Law Prediction Error. Scaling laws [27, 24, inter alia] have been used extensively to predict the validation loss of a large model using a set of smaller “scaling law” models. Recent work has also used scaling laws to predict downstream task performance [19, 3] by first predicting task loss then using the predicted loss to predict task performance (e.g., accuracy); this is the setup we use in this work. The prediction error for the scaling law fit is defined as the relative error between the predicted and true performance of the large model: Prediction Error = |Measured Value−True Value|

缩放定律预测误差。缩放定律[27、24等]已被广泛用于使用一组较小的“缩放定律”模型来预测大型模型的验证损失。最近的工作还使用缩放定律来预测下游任务性能 [19, 3]，首先预测任务损失，然后使用预测损失来预测任务性能（例如，准确性）；这是我们在这项工作中使用的设置。缩放定律拟合的预测误差定义为大型模型的预测性能与真实性能之间的相对误差： 预测误差 = |测量值−真实值|

|True Value| .

Calculating prediction error requires training a set of scaling law models on the same corpus with varying tokens/sizes (e.g., 190M to 1B params), training a large model (e.g., 13B), and fitting a scaling law to the smaller models to predict the larger model performance.3 We describe the scaling law functional form and fitting details in App. A.1, following the setup in Bhagia et al. [3].

计算预测误差需要在具有不同标记/大小（例如，190M 到 1B 参数）的同一语料库上训练一组标度律模型，训练一个大型模型（例如，13B），并将标度律拟合到较小的模型以预测较大的模型性能。3我们在 App.3 中描述了标度律函数形式和拟合细节。 A.1，遵循 Bhagia 等人的设置。 [3]。

1Training multiple large models is too expensive for most development scenarios, but is necessary to evaluate how accurate this process is.

1训练多个大型模型对于大多数开发场景来说成本太高，但对于评估此过程的准确性是必要的。

2We observe similar findings on other rank agreement metrics, like Spearman rank correlation (Table 3). Decision accuracy, in particular, is equivalent to Kendall’s tau modulo a scale and shift (App. A.2).

2我们在其他排名一致性指标上观察到类似的结果，例如 Spearman 排名相关性（表 3）。特别是，决策精度相当于 Kendall 的 tau 模尺度和位移（App. A.2）。

3Scaling law predictions can be used to make development decisions (e.g., about which training dataset is best) by training a set of models and fitting a scaling law for each option being considered [17], but in this work we just evaluate scaling law error directly.

3 缩放法则预测可用于通过训练一组模型并为考虑的每个选项拟合缩放法则来做出开发决策（例如，关于哪个训练数据集最好）[17]，但在这项工作中，我们只是直接评估缩放法则误差。

3

<!-- page 4 of 35 -->

2.2 Evaluation Dataset · 评测数据

We perform our analysis using existing development benchmarks and models:

Models. Our set of models includes: (i) a suite of scaling law models from 190M to 3.2B, with a corresponding target at 7B and 13B [3], (ii) a suite of 25 models each trained with different pre- training corpora from 60M to 1.3B [38], (iii) the final 30 checkpoints for OLMo 2 1B, 7B, 13B and 32B [42], and (iv) 73 open-weight base models. Additionally, in our comparison between sources of modeling noise in §3.1, we train and release 20 1B models, with 10 models trained varying the data order initialization and 10 varying the random seed initialization, along with evaluation on 3.2K intermediate checkpoints.

模型。我们的模型集包括：(i) 一套从 190M 到 3.2B 的标度律模型，相应的目标为 7B 和 13B [3]，(ii) 一套 25 个模型，每个模型都使用从 60M 到 1.3B 的不同预训练语料库进行训练 [38]，(iii) OLMo 2 1B、7B、13B 和 32B 的最终 30 个检查点[42]，以及 (iv) 73 个开放重量基础模型。此外，在第 3.1 节中建模噪声源的比较中，我们训练并发布了 20 个 1B 模型，其中 10 个模型训练了不同的数据顺序初始化，10 个模型改变了随机种子初始化，并对 3.2K 中间检查点进行了评估。

Benchmarks. We evaluate 30 development tasks which we categorize as knowledge QA, math, and code. We use the OLMES [22] standard where applicable, and reproduce the OLMo 2 evaluation setup [42] for all other benchmarks. Following Gadre et al. [19], we also include multi-task averages for each group, and for the OLMES core tasks. For our test of subset selection in §5.1, we include a synthetically generated benchmark, generated using AutoBencher [32].

基准。我们评估了 30 项开发任务，将其分类为知识 QA、数学和代码。我们在适用的情况下使用 OLMES [22] 标准，并为所有其他基准重现 OLMo 2 评估设置 [42]。继加德雷等人之后。 [19]，我们还包括每个组以及 OLMES 核心任务的多任务平均值。为了测试第 5.1 节中的子集选择，我们使用了一个综合生成的基准测试，该基准测试是使用 AutoBencher [32] 生成的。

We include full details on the sets of models and benchmarks in App. A.5.

我们在 App 中提供了有关模型集和基准的完整详细信息。 A.5.

3 Quantifying Signal and Noise · 量化信号与噪声

To illustrate the impact of noise on a decision-making setup, Figure 1 shows training curves for 25 1B models trained with different data recipes and, in inset plots, the training curve for a single 1B model on three tasks. Some tasks (left, HellaSwag) exhibit low noise between training checkpoints but low signal between models, and others (center, ARC-Challenge) exhibit high noise and high signal. In this section we define signal and noise, and define two simple metrics to estimate the signal-to-noise ratio that can be calculated from a set of model evaluations on a given benchmark.

为了说明噪声对决策设置的影响，图 1 显示了使用不同数据配方训练的 25 个 1B 模型的训练曲线，并且在插图中显示了单个 1B 模型在三个任务上的训练曲线。一些任务（左，HellaSwag）在训练检查点之间表现出低噪声，但在模型之间表现出低信号，而其他任务（中，ARC-Challenge）则表现出高噪声和高信号。在本节中，我们定义信号和噪声，并定义两个简单的指标来估计信噪比，该信噪比可以根据给定基准的一组模型评估来计算。

3.1 Measuring Noise · 测量噪声

There are numerous sources of noise in the language model development pipeline. Previous work has shown multiple training runs under the same configuration can lead to different performance as a result of a different initialization or data order [14, 13]. In addition, as illustrated in Figure 1, performance can even vary significantly from one checkpoint to the next: within the final 30 checkpoints of training for 1B models on ARC Challenge, we observe a range of 1.7% accuracy. With these motivations, we consider four potential noise measurements, each calculated on using evaluation on a single benchmark: (i) training multiple models and varying only the random initialization, (ii) training models and varying the training data order, (iii) measuring the total checkpoint-to-checkpoint noise across a full, single training run, and (iv) measuring the checkpoint-to-checkpoint noise of the final n checkpoints of a single training run. We formalize these definitions in App. A.3.

语言模型开发流程中有许多噪音源。先前的工作表明，由于不同的初始化或数据顺序，同一配置下的多次训练运行可能会导致不同的性能 [14, 13]。此外，如图 1 所示，一个检查点与下一个检查点之间的性能甚至可能存在显着差异：在 ARC Challenge 上 1B 模型训练的最后 30 个检查点中，我们观察到准确度范围为 1.7%。出于这些动机，我们考虑了四种潜在的噪声测量，每种测量都使用单个基准的评估来计算：（i）训练多个模型并仅改变随机初始化，（ii）训练模型并改变训练数据顺序，（iii）测量整个完整的单次训练运行中的总检查点到检查点噪声，以及（iv）测量单次训练运行的最后 n 个检查点的检查点到检查点噪声。我们在 App 中正式化了这些定义。 A.3.

To get estimates for four potential sources of noise, we train 10 different 1B-5xC models varying the initialization and data orders, and evaluate all intermediate checkpoints. We find that the initialization noise, data order noise, and checkpoint-to-checkpoint noise across the whole training run all correlate highly with the relative standard deviation of the final n checkpoints (R2 of 0.82, 0.86, and 0.95, respectively, see Figure 7; and see the training curves in Figure 19). These results lead us to define noise as the relative standard deviation of the final n checkpoints, as this requires no additional training cost and only uses the final n checkpoints rather than the full training curve. We define

为了估计四种潜在噪声源，我们训练了 10 个不同的 1B-5xC 模型，改变了初始化和数据顺序，并评估所有中间检查点。我们发现整个训练过程中的初始化噪声、数据顺序噪声和检查点到检查点噪声都与最终 n 个检查点的相对标准差高度相关（R2 分别为 0.82、0.86 和 0.95，见图 7；并见图 19 中的训练曲线）。这些结果使我们将噪声定义为最终 n 个检查点的相对标准偏差，因为这不需要额外的训练成本，并且仅使用最终 n 个检查点而不是完整的训练曲线。我们定义

q

Pn

noise as: Rel. Std.(m) =

1 n−1

i=1 (mi −¯m)2/ ¯m.

3.2 Measuring Signal · 测量信号

A benchmark is most useful during language model development if it can detect a true difference between a good model and a poor model, assuming a true difference exists between the models in the ability that the benchmark aims to measure. This statistical power is what enables us to use small models for development decisions like training dataset to use. To formalize this idea, we consider a benchmark to have high signal when models evaluated on it have a wide and evenly distributed range of scores. We measure signal using a metric from the numerical integration literature: dispersion, calculated as the maximum difference between the scores of any two models, divided by the mean

如果基准测试能够检测好模型和差模型之间的真正差异，假设基准测试旨在测量的模型之间存在真正的差异，那么它在语言模型开发过程中是最有用的。这种统计能力使我们能够使用小型模型进行开发决策，例如要使用的训练数据集。为了形式化这个想法，我们认为当评估的模型具有广泛且均匀分布的分数范围时，基准具有高信号。我们使用数值积分文献中的度量来测量信号：分散度，计算为任何两个模型分数之间的最大差异除以平均值

4

<!-- page 5 of 35 -->

Signal

Noise

Signal-to-Noise Ratio

1.0

1.0

1.0

ARC-E

ARC-E

ARC-E

ARC-E

ARC-E

ARC-E

ARC-E

ARC-E

ARC-C

HS

HS

ARC-E

ARC-C

HS

ARC-E

ARC-E

MMLU R = 0.591 ± 0.012 R² = 0.350

MMLU R = 0.065 ± 0.019 R² = 0.004

MMLU R = 0.791 ± 0.007 R² = 0.626

HS

MMLU ARC-C

ARC-E

ARC-E

MMLU

ARC-E

MMLU ARC-C

MMLU

HS

ARC-E

HS

ARC-E

0.9

0.9

0.9

MMLU ARC-C

MMLU ARC-C

MMLU ARC-C

MMLU

MMLU ARC-C

ARC-C ARC-E

MMLU

ARC-C

ARC-E

ARC-C

MMLU

HS

HS

HS

ARC-C

MMLU ARC-C

ARC-C

MMLU ARC-C

MMLU

MMLU

PIQA

ARC-C

PIQA

PIQA

ARC-C

ARC-C

PIQA

CSQA

0.8

0.8

0.8

CSQA

PIQA

WinoG

WinoG

CSQA

CSQA

OBQA PIQA

CSQA

WinoG

CSQA

OBQA

WinoG

WinoG

OBQA

CSQA

WinoG

OBQA PIQA

PIQA

PIQA

CSQA

CSQA

PIQA

OBQA PIQA SocIQA

PIQA

SocIQA

OBQA PIQA SocIQA

CSQA

PIQA

CSQA HS

OBQA PIQA SocIQA

OBQA PIQA SocIQA

CSQA HS

0.7

0.7

0.7

CSQA HS

OBQA

CSQA

CSQA

PIQA

SocIQA

PIQA

SocIQA

SocIQA

OBQA

CSQA

SocIQA WinoG

CSQA

CSQA

WinoG

OBQA

OBQA

OBQA

HS OBQA

HS OBQA

WinoG

SocIQA

SocIQA

HS

SocIQA

Decision Accuracy

Decision Accuracy

Decision Accuracy

0.6

0.6

0.6

SocIQA

SocIQA

OBQA

SocIQA

OBQA

OBQA

SocIQA

SocIQA

WinoG

SocIQA

WinoG

WinoG

WinoG

WinoG

WinoG

0.5

0.5

0.5

WinoG

WinoG

WinoG

HS

HS

Model Size 60M 90M 150M

300M 530M 750M

HS

0.02 0.04 0.06 0.08 0.10 0.12 0.14 Rel. Dispersion(final checkpoints)

10 2 3 4 5 6 7 8 9 SNR = Rel. Dispersion / Rel. Std.

0.03 0.02 0.01 0.006 Rel. Std.(final n train steps)

Figure 2: Signal, noise, and signal-to-noise ratio (x-axis) vs. decision accuracy (y-axis), (see Section 2 for definitions). The signal alone (left) and noise alone (center) have low correlation with decision accuracy, while the signal-to-noise ratio (right) is correlated with decision accuracy. The signal-to-noise ratio gives us information about wether a benchmark is useful during development, as high decision accuracy (and signal-to-noise ratio) means development decisions made at a small scale generalize to large scale models.

score of all models to account for different scales. This metric is designed specifically to measure how well a set of points cover a space; that is, how spread out the points are from each other. We also considered 20 different measures of spread, including variance, mean pairwise distance, Gini coefficient, etc., in Appendix A.4.

所有模型的分数以考虑不同的尺度。该指标专门用于衡量一组点覆盖空间的程度；也就是说，点彼此之间的分布程度。我们还在附录 A.4 中考虑了 20 种不同的散布度量，包括方差、平均成对距离、基尼系数等。

In the following section we introduce signal-to-noise ratio, and find that this definition of signal leads to signal-to-noise ratio with the highest correlation with decision accuracy. We define signal as Rel. Dispersion(M) = maxj,k |mj −mk|/ ¯m, the normalized maximum difference between any pair of models j, k.

在下面的部分中，我们介绍信噪比，并发现信号的这种定义导致信噪比与决策精度具有最高的相关性。我们将信号定义为Rel。 Dispersion(M) = maxj,k |mj −mk|/ ¯m，任意一对模型 j、k 之间的归一化最大差异。

3.3 Measuring Signal-to-noise Ratio · 测量信噪比

Using our measures of signal (§3.2) and noise (§3.1), we propose measuring the signal-to-noise ratio. For both measures, we first divide by the average to be independent of particular units (e.g., to compare accuracy to unbounded task perplexity). We define the signal-to-noise ratio:

使用我们的信号（§3.2）和噪声（§3.1）测量，我们建议测量信噪比。对于这两种度量，我们首先除以独立于特定单位的平均值（例如，将准确性与无限的任务困惑度进行比较）。我们定义信噪比：

Signal-to-Noise Ratio = Rel. Dispersion(final train checkpoint)

Rel. Std.(final n train checkpoints) (2)

where signal (Rel. Dispersion) is measured over a population of models trained using a similar compute budget, and noise (Rel. Std.) is measured over the final n intermediate training checkpoints of a single model. We emphasize that, while this is one particular instantiation of the signal-to- noise ratio, our framework is designed to be independent of a particular metric: we find many other measures of signal produce similar results in Appendix A.4 and measures of noise have high correlation in Appendix A.3.

其中信号（相对分散）是在使用类似计算预算训练的模型群体上测量的，噪声（相对标准）是在单个模型的最后 n 个中间训练检查点上测量的。我们强调，虽然这是信噪比的一个特定实例，但我们的框架设计为独立于特定指标：我们发现许多其他信号测量在附录 A.4 中产生类似的结果，而噪声测量在附录 A.3 中具有高度相关性。

4 Signal and Noise Correlate with Better Predictions · 信号与噪声同更好预测相关

In this section, we show that the signal-to-noise ratio correlates with decision accuracy for small scale experiments, and that the noise of the target model correlates with scaling law prediction. These findings motivate our use of SNR to improve benchmarks’ statistical properties in Section 5.

在本节中，我们表明信噪比与小规模实验的决策精度相关，并且目标模型的噪声与标度律预测相关。这些发现促使我们使用 SNR 来改善第 5 节中基准的统计特性。

4.1 Higher signal-to-noise ratio indicates higher decision accuracy · 更高信噪比对应更高决策准确率

Setup. We hypothesize that a higher signal-to-noise ratio makes it easier to distinguish between models. To test this, we measure decision accuracy using the ranking of the small DataDecide models (60M to 750M) to predict the ranking of the large DataDecide model (1B). To calculate signal we use the final checkpoint of each of the 25 small models, and to calculate noise, we use the standard deviation around the final 5 checkpoints of the small-scale models. Since we have a measure of noise for each model, we use the average of the noise across the small models.

设置。我们假设较高的信噪比使得更容易区分模型。为了测试这一点，我们使用小型 DataDecide 模型（60M 到 750M）的排名来测量决策准确性，以预测大型 DataDecide 模型 (1B) 的排名。为了计算信号，我们使用 25 个小模型中每个模型的最终检查点，为了计算噪声，我们使用小规模模型最后 5 个检查点周围的标准差。由于我们对每个模型都有噪声测量，因此我们使用小模型的噪声平均值。

5

<!-- page 6 of 35 -->

Example fit: SocialIQA

Noise

0.65

100%

error 2.4% noise

0.60

Minerva MATH

MedMCQA

Math Tasks

10%

Code Tasks

0.55

MMLU

Knowledge Tasks

SocialIQA

TriviaQA MBPP+

RC Accuracy

0.50

1%

All Tasks

Jeopardy

0.45

Scaling Law Prediction Error

0.1%

R = 0.653 ± 0.068 R² = 0.426

Scaling Law Models Predicted 13B Model Real 13B Model Scaling Law Fit

0.40

HellaSwag

1018 1019 1020 1021 1022 1023

0.01 0.1 Rel. Std.(final n train checkpoints)

Compute

Figure 3: Left: Correlation between the noise and scaling law prediction error (see Section 2 for definitions). We observe benchmarks with a lower noise around the scaling law target (x-axis) also exhibit lower error (y-axis). Right: Example of scaling law for one benchmark (SocialIQA), with examples on all benchmarks in Figure 15. We conjecture that the noise of the target model (see inset axis) acts as a bound on the true minimum scaling law error; if the observed scaling law error below this noise, then the error is only possible by random chance. Therefore, when benchmarks exhibit a similar scaling law error but different noise (e.g., MBPP+, SocialIQA and TriviaQA; see Figure 15), we argue that those with the lowest noise are better.

Signal-to-noise is predictive of decision accuracy. Figure 2 shows the signal, noise and signal- to-noise ratio plotted against the decision accuracy across the OLMES benchmarks. While the signal or noise alone do not correlate with decision accuracy, we find a strong correlation between SNR and decision accuracy (R = 0.791, R2 = 0.626). We conclude that benchmarks which have higher SNR at small scales exhibit higher decision accuracy, and are more likely for their results to hold at a larger scale. In Appendix B.1, we observe benchmarks with a higher SNR also exhibit lower variance when calculating decision accuracy using different checkpoints around the end of training.

信噪比可以预测决策的准确性。图 2 显示了根据 OLMES 基准的决策精度绘制的信号、噪声和信噪比。虽然信号或噪声本身与决策精度无关，但我们发现 SNR 和决策精度之间存在很强的相关性（R = 0.791，R2 = 0.626）。我们得出的结论是，在小规模下具有较高 SNR 的基准表现出更高的决策准确性，并且其结果更有可能在更大范围内保持不变。在附录 B.1 中，我们观察到在训练结束时使用不同检查点计算决策准确性时，具有较高 SNR 的基准也表现出较低的方差。

4.2 Tasks with higher noise also have higher scaling law error · 更高噪声任务也有更高缩放律误差

Setup. We fit scaling laws to predict the performance of OLMo 2 13B using final checkpoint of the set of scaling models trained by Bhagia et al. [3]. We calculate the scaling law prediction error as the relative error of the predicted and final 13B checkpoint. To estimate the noise, we calculate the relative standard deviation of the final 30 checkpoints of the 13B training run, each spaced 1000 training steps until the end of training.4 We hypothesize that the range of the final k checkpoints of the prediction target (the large, 13B model) acts as an lower-bound on the true minimum scaling law prediction error. An example of the prediction error and noise around the prediction target is illustraed using SocialIQA in Figure 3 (right). Assuming a scaling law with no bias, we expect tasks with a lower standard deviation of the prediction target to also have a lower prediction error. Noise measures the reliability of scaling law prediction errors. In Figure 3 (left), we show the scaling law error and standard deviation for predicting the 13B model performance over 30 tasks. We observe a correlation between the standard deviation of the prediction target and the prediction error across tasks (R = 0.653, R2 = 0.426), however the fit is not perfect. For example, we observe four tasks (MBPP+, SocialIQA, MMLU and TriviaQA) which exhibit similar error (around 2–3%), but exhibit different amounts of noise around the prediction target. For these benchmarks with similar error but lower noise, we can be confident that the error we observe from the single scaling law fit is the result of the true error of the scaling law fit rather than random chance. In practice, we recommend practitioners prefer making decisions based on scaling law predictions using tasks with low error and low noise. Previous work has fit multi-task averages to predict scaling laws. In particular, Gadre et al. [19] find that the error from the individual tasks in their work to be too difficult to predict accurately. In Figure

设置。我们使用 Bhagia 等人训练的缩放模型集的最终检查点来拟合缩放定律来预测 OLMo 2 13B 的性能。 [3]。我们将缩放法则预测误差计算为预测的和最终 13B 检查点的相对误差。为了估计噪声，我们计算 13B 训练运行的最后 30 个检查点的相对标准偏差，每个检查点间隔 1000 个训练步骤，直到训练结束。4 我们假设预测目标（大的 13B 模型）的最后 k 个检查点的范围充当真实最小标度律预测误差的下界。图 3（右）中使用 SocialIQA 说明了预测目标周围的预测误差和噪声的示例。假设缩放法则没有偏差，我们预计预测目标标准偏差较低的任务也具有较低的预测误差。噪声衡量标度律预测误差的可靠性。在图 3（左）中，我们显示了预测 30 个任务中 13B 模型性能的标度律误差和标准差。我们观察到预测目标的标准差与跨任务的预测误差之间存在相关性（R = 0.653，R2 = 0.426），但拟合并不完美。例如，我们观察到四个任务（MBPP+、SocialIQA、MMLU 和 TriviaQA）表现出类似的误差（约 2-3%），但在预测目标周围表现出不同量的噪声。对于这些具有相似误差但噪声较低的基准，我们可以确信，我们从单个缩放定律拟合中观察到的误差是缩放定律拟合的真实误差的结果，而不是随机机会的结果。在实践中，我们建议从业者更喜欢使用低误差和低噪声的任务基于标度律预测做出决策。之前的工作已经通过拟合多任务平均值来预测缩放定律。特别是，Gadre 等人。 [19]发现工作中各个任务的错误很难准确预测。图中

4We found 30 checkpoints to be an adequate trade-off between sample size and compute cost. We provide guidance on selecting n when calculating noise, and its impact on experimental results, in Appendix A.3.2.

4我们发现 30 个检查点足以权衡样本量和计算成本。我们在附录 A.3.2 中提供了计算噪声时选择 n 及其对实验结果的影响的指导。

6

<!-- page 7 of 35 -->

MMLU SNR

MMLU Decision Accuracy

MMLU Noise at Scaling Law Target

20.0

95%

.005

15.0

90%

.01

Highest signal-to-noise ratio is top 16 MMLU subtasks

10.0

85%

.015

Rel. Std. (13B)

5.0

Subtasks sorted by SNR Subtasks sorted randomly

80%

.02

Signal-to-Noise Ratio (1B)

Decision Acc. (150M to 1B)

1 5 10 15 20 25 30 35 40 45 50 55 Included MMLU Subtask

1 5 10 15 20 25 30 35 40 45 50 55 Included MMLU Subtask

1 5 10 15 20 25 30 35 40 45 50 55 Included MMLU Subtask

AutoBencher SNR

AutoBencher Decision Accuracy

AutoBencher Noise at Scaling Law Target

25.0

95%

.01

92%

20.0

Highest signal-to-noise ratio is top 6 AutoBencher subtasks

90%

15.0

.015

Rel. Std. (13B)

88%

10.0

Subtasks sorted by SNR Subtasks sorted randomly

.02

85%

Signal-to-Noise Ratio (1B)

Decision Acc. (150M to 1B)

1 5 10 15 20 25 30 Included AutoBencher Subtask

1 5 10 15 20 25 30 Included AutoBencher Subtask

1 5 10 15 20 25 30 Included AutoBencher Subtask

Figure 4: Evaluating an intervention designed to increase signal-to-noise ratio (SNR): selecting subsets of a benchmark (Top: MMLU; Bottom: AutoBencher) that have higher SNR dramatically improves decision accuracy and the noise of the scaling law prediction target. MMLU and Auto- Bencher are made of different subtasks; for each benchmark we sort its subtasks by their SNR, then greedily add subtasks to our subset in order of decreasing SNR (left to right). Despite the subsets made in this way having fewer test instances, we find subsets of MMLU (e.g., with 16 subtasks) and of AutoBencher (e.g., with 6 subtasks) that have higher SNR than the full sets, and also have better decision accuracy and noise around the scaling law target. Named subtasks in Figure 16 in Appendix.

3 we also plot results for multi-task averages for each task group (‘Knowledge’, ‘Math’, ‘Code’) and an average across ‘All Tasks’. We find that some individual tasks are easier to predict than multi-task averages, and have lower noise around the prediction target. In particular, generative tasks like TriviaQA or Jeopardy which evaluate the exact match of a short-form generation exhibit lower error than the multi-task averages, and exhibit lower noise around the prediction target. For practitioners, we argue using individual tasks may be a better decision in some cases than the multi-task average, if that task better represents the ability than a multi-task average. Our core results report SNR at the scales of our experimental settings for decision accuracy and prediction error. However, SNR can be calculated at any model size, so we show how the signal-to- noise ratio changes for tasks at larger 1B, 7B, 13B and 32B scales in Appendix B.3.

在图 3 中，我们还绘制了每个任务组（“知识”、“数学”、“代码”）的多任务平均值的结果以及“所有任务”的平均值。我们发现一些单独的任务比多任务平均值更容易预测，并且预测目标周围的噪声更低。特别是，像 TriviaQA 或 Jeopardy 这样评估简短生成的精确匹配的生成任务表现出比多任务平均值更低的错误，并且在预测目标周围表现出更低的噪声。对于从业者来说，我们认为在某些情况下使用单个任务可能比多任务平均值更好，如果该任务比多任务平均值更能代表能力。我们的核心结果报告了我们实验设置范围内的信噪比，以衡量决策准确性和预测误差。然而，SNR 可以在任何模型大小下计算，因此我们在附录 B.3 中展示了较大 1B、7B、13B 和 32B 尺度任务的信噪比如何变化。

5 Improving Predictions by Improving SNR · 通过改善信噪比改善预测

In this section, we introduce three interventions designed to improve the signal, noise, or SNR: filtering subtasks by SNR (§5.1), averaging checkpoint scores during a training run (§5.2), measuring language modeling loss over the test set using bits-per-byte (§5.3). In each setup, we show using signal-to-noise ratio to intervene on the task improved the resulting error in both prediction settings.

在本节中，我们介绍三种旨在改善信号、噪声或 SNR 的干预措施：按 SNR 过滤子任务（第 5.1 节）、在训练运行期间平均检查点分数（第 5.2 节）、使用每字节位数测量测试集上的语言建模损失（第 5.3 节）。在每个设置中，我们都表明使用信噪比来干预任务可以改善两种预测设置中产生的错误。

5.1 Filtering noisy sub-tasks improves signal-to-noise ratio · 过滤噪声子任务改善信噪比

Setup. Many tasks are a macro-average of subtasks. We hypothesize that some subset of subtasks is usually higher quality than the rest of the set, and that the signal-to-noise ratio may be an indicator of high quality subtasks. To test this, we first calculate the signal-to-noise ratio of each subtask, then rank the subtasks by signal-to-noise ratio and greedily add the highest SNR subtasks. As a baseline, we randomly shuffle the subtasks, and report the average of 10 calculations of each metric, with the shading indicating ±1 standard deviation. Results. We show results in Figure 4. For MMLU, using only 16 subtasks had a higher signal-to- noise ratio than using the full test set. For AutoBencher, we observe the same but with only 6 tasks. The lower signal-to-noise ratio also led to a higher decision accuracy: +2.6% for MMLU and +5% for AutoBencher by using the high SNR subset compared to the full benchmark. We hypothesize that the quality of a task subset may influce that task’s signal-to-noise ratio. To test this, we use the data collected from MMLU Redux, which identified MMLU subtasks with high labeling error [21]. We find that out of the 20 MMLU subtasks which contain errors in least 5% of instances, half of these subtasks (10 of 20) are also in the lowest 20 tasks sorted by their signal-to-noise ratio. This presents

设置。许多任务是子任务的宏观平均。我们假设子任务的某些子集通常比其余子任务的质量更高，并且信噪比可能是高质量子任务的指标。为了测试这一点，我们首先计算每个子任务的信噪比，然后根据信噪比对子任务进行排序，并贪婪地添加信噪比最高的子任务。作为基线，我们随机打乱子任务，并报告每个指标 10 次计算的平均值，阴影表示 ±1 个标准差。结果。我们在图 4 中显示结果。对于 MMLU，仅使用 16 个子任务比使用完整测试集具有更高的信噪比。对于 AutoBencher，我们观察到相同的情况，但只有 6 个任务。较低的信噪比还带来了更高的决策精度：与完整基准测试相比，通过使用高 SNR 子集，MMLU 提高了 2.6%，AutoBencher 提高了 5%。我们假设任务子集的质量可能会影响该任务的信噪比。为了测试这一点，我们使用从 MMLU Redux 收集的数据，该数据识别出具有高标签错误的 MMLU 子任务 [21]。我们发现，在至少 5% 的实例中包含错误的 20 个 MMLU 子任务中，这些子任务中有一半（20 个中的 10 个）也属于按信噪比排序的最低 20 个任务。这呈现

7

<!-- page 8 of 35 -->

Table 1: Evaluating an intervention designed to average out noise: for a given model on one benchmark, we calculate its score as the average of the scores of its final k checkpoints (evaluated using bits-per-byte task formulation). Left: On small models used to make predictions (‘Avg. Pred.’), or to the large target models (‘Avg. Target’), or both (‘Avg. Both’), decision accuracy improves. ∗ indicates the decision accuracy is the same across columns. Right: On small models used to fit scaling laws (‘Avg. Train’), scaling law error improves. We show results on a subset of benchmarks, and report all benchmarks and the primary metric (accuracy, exact match, pass@1) in Tables 5 and 6.

Decision Accuracy (60M-5xC to 1B-5xC), % Task ↓ Final

Prediction Error (13B-5T), Abs. % Task ↓ Final

Ckpt

Avg. Pred.

Avg. Target

Avg. Both

Ckpt

Avg. Train

Knowledge QA Tasks ARC Challenge 94.5 94.9 94.3 94.6 HellaSwag 92.4 93.1 93.1 94.0 ARC Easy 92.1 92.2 91.9 92.0 MMLU 91.5 91.6 91.6 91.6 AutoBencher 88.5 88.9 89.1 89.6 MMLU Pro 90.0 89.4 90.0 89.3 AGI Eval 86.3 86.7 86.5 87.0 MedMCQA* 86.6 86.6 86.6 86.6 Jeopardy 84.4 84.4 84.8 85.0 TriviaQA 83.5 84.3 83.8 84.6 OpenBookQA 81.4 81.7 81.6 82.0 SocialIQA 79.9 79.5 79.4 79.0 PIQA 72.5 72.9 71.9 72.0 CommonsenseQA 65.8 66.2 65.4 65.6 BoolQ 63.7 64.2 63.5 64.0 SQuAD 60.8 60.4 62.0 61.6 Knowledge 19-Task Avg. 71.3 71.5 71.7 71.7

Knowledge QA Tasks HellaSwag 0.31 0.16 CommonsenseQA 0.59 0.46 Jeopardy 0.57 0.54 SocialIQA 0.50 0.59 PIQA 0.89 1.01 MMLU 1.68 1.74 MMLU Pro 1.76 1.75 AGI Eval 1.89 1.98 BoolQ 4.13 2.48 TriviaQA 2.33 2.62 SQuAD 2.80 2.79 OpenBookQA 4.02 3.38 AutoBencher 3.86 3.69 ARC Easy 5.13 5.13 MedMCQA 7.72 7.98 ARC Challenge 8.44 8.43 Knowledge 19-Task Avg. 1.43 1.20

Code Tasks HumanEval* 95.6 95.6 95.6 95.6 MBPP* 95.3 95.3 95.3 95.3 Code 4-Task Avg.* 96.7 96.7 96.7 96.7

Code Tasks MBPP 2.57 1.79 HumanEval 7.71 8.85 Code 4-Task Avg. 3.15 2.75

Math Tasks Minerva MATH* 90.0 90.0 90.0 90.0 GSM8K* 76.6 76.6 76.6 76.6 Math 6-Task Avg.* 88.3 88.3 88.3 88.3

Math Tasks Minerva MATH 1.08 0.98 GSM8K 7.46 3.85 Math 6-Task Avg. 11.33 2.30

All 30-Task Avg. 68.9 70.7 69.5 71.3

All 30-Task Avg. 1.03 0.86

evidence that low SNR may indicate low quality tasks, and we believe this is a good opportunity for future work in evaluation development.

有证据表明，低信噪比可能表明任务质量低，我们相信这是未来评估开发工作的良好机会。

Intuitively, a benchmark developer may increase the statistical power of a comparison between models: by sampling more data by the original process used to construct the benchmark, in order to make a benchmark larger [64], or collect a larger number of tasks in an evaluation suite [58]. Our evidence in Figure 4 suggests that larger benchmarks may not necessarily be better for comparing models. We further explore this phenomenon in App. B.2 by sub-sampling instances of benchmarks, finding some benchmarks can exhibit a higher SNR despite having 10 times fewer instances.

直观上，基准开发人员可以提高模型之间比较的统计能力：通过用于构建基准的原始过程采样更多数据，以使基准更大[64]，或者在评估套件中收集更多数量的任务[58]。图 4 中的证据表明，较大的基准不一定更适合比较模型。我们在App中进一步探讨了这一现象。 B.2 通过对基准测试实例进行二次采样，发现一些基准测试可以表现出更高的 SNR，尽管实例数量减少了 10 倍。

5.2 Averaging checkpoint-to-checkpoint noise leads to better predictions · 平均检查点噪声改善预测

Setup. Typically, models are only compared using the evaluation of the final checkpoint. In the previous sections, we argued that noise is a good indicator of whether we can use a benchmark to predict a large scale phenomenon. In this section, we want to measure the effect of averaging this particular source of step-to-step noise, as a way of improving our ability to make a prediction. In the decision accuracy setting, we can average the results of the small model, the large model (in this case, the 1B model), or both. In the prediction error setting, averaging the small models will help in fitting the scaling law, but averaging the target model will just make the result more reliable, so we average the target model in both settings and only change whether we average the models used to fit the scaling law. Finally, we introduce an additional way to average step-to-step noise during a training run, by evaluating whether the ranking of the 1B models during training agrees with the ranking at the end of training. Note, as our measure of noise is between intermediate training checkpoints, we are only reducing one of many sources of modeling noise.

设置。通常，仅使用最终检查点的评估来比较模型。在前面的章节中，我们认为噪声是我们是否可以使用基准来预测大规模现象的一个很好的指标。在本节中，我们希望测量对这种特定的步进噪声源进行平均的效果，作为提高预测能力的一种方法。在决策精度设置中，我们可以对小模型、大模型（在本例中为 1B 模型）或两者的结果进行平均。在预测误差设置中，对小模型进行平均将有助于拟合缩放定律，但对目标模型进行平均只会使结果更加可靠，因此我们在两种设置中对目标模型进行平均，并且仅更改是否对用于拟合缩放定律的模型进行平均。最后，我们引入了另一种方法，通过评估训练期间 1B 模型的排名是否与训练结束时的排名一致，来平均训练运行期间的逐步噪声。请注意，由于我们的噪声测量是在中间训练检查点之间，因此我们只是减少了许多建模噪声源之一。

Results on Final Checkpoints. In Table 1, we observe averaging the noise improved both measures of error. Averaging noise improved decision accuracy by +2.4% for the 30-task average, this procedure improved decision accuracy in all but two tasks. For reducing the scaling law prediction error, averaging the training checkpoints improved prediction error for 20 of 30 tasks.

最终检查点的结果。在表 1 中，我们观察到对噪声进行平均可以改善两种误差测量。平均噪声将 30 个任务的平均决策准确度提高了 2.4%，该过程提高了除两项任务之外的所有任务的决策准确度。为了减少缩放法则预测误差，对训练检查点进行平均可以改善 30 个任务中 20 个任务的预测误差。

8

<!-- page 9 of 35 -->

HellaSwag 1B-5xC

ARC Challenge 1B-5xC

MMLU 1B-5xC

1.00

1.00

1.00

0.95

0.95

0.95

Smoothing EMA (N=2) EMA (N=5) EMA (N=20) Single Checkpoint

Decision Accuracy

Decision Accuracy

Decision Accuracy

0.90

0.90

0.90

0K 20K 40K 60K Training Step

0K 20K 40K 60K Training Step

0K 20K 40K 60K Training Step

Figure 5: When stopping a training run early, averaging the checkpoint-to-checkpoint noise improves the decision accuracy between an intermediate and the final training step. Shown are decision accuracy from early-stopping for HellaSwag, ARC-C and MMLU by using both a single checkpoint and the exponential moving average (EMA), with all tasks included in Figure 18.

SNR=1.92 Minerva MATH Exact Match

Experiment Setting → SNR (↑) Rel. Error (↓), % Decision Acc (↑), % Metric → Primary BPB Primary BPB Primary BPB

实验设置 → SNR (↑) Rel.误差 (↓)、% 决策准确率 (↑)、% 指标 → 主要 BPB 主要 BPB 主要 BPB

0.02

0.01

0.01

Exact Match

0.01

0K 20K 40K 60K 80K Training Step

Minerva MATH BPB

0.60

SNR=87.30

0.80

Knowledge QA Tasks TriviaQA 27.9 61.8 2.5 0.5 68.3 85.3 SQuAD 23.8 29.0 7.6 27.8 59.7 61.7 ARC Easy 21.0 64.6 5.3 0.8 93.0 93.0 Jeopardy 20.2 22.6 3.5 18.6 82.0 83.0 AutoBencher 15.9 31.3 0.2 4.5 89.3 89.3 HellaSwag 11.8 14.9 1.4 1.0 74.3 95.3 MMLU 9.8 35.9 4.3 0.4 89.0 92.0 ARC Challenge 6.6 44.8 9.7 2.1 83.3 95.0 SocialIQA 5.5 48.0 0.4 1.9 55.0 80.0 PIQA 4.2 8.8 0.5 1.3 73.3 72.7 AGI Eval 2.5 19.5 13.7 3.4 58.7 88.0 Knowledge 19-Task Avg. 13.7 44.3 0.8 1.0 79.0 80.0

1.00

1.20

1.40

Bits-per-byte

Math Tasks Minerva MATH 1.9 88.6 11.9 1.9 51.0 90.0 GSM8K 1.2 7.0 38.6 5.9 46.0 76.7 Math 6-Task Avg. 1.8 22.6 46.0 5.0 42.3 88.3

1.60

0K 20K 40K 60K 80K Training Step

Code Tasks HumanEval 6.1 25.1 9.2 7.9 74.3 95.7 MBPP 2.0 41.8 23.6 1.0 68.3 95.3 Code 4-Task Avg. 5.5 42.0 29.5 9.7 80.3 96.7

All 30-Task Avg. 10.0 31.5 2.3 0.4 77.0 83.7

1B (100B) training curve 1B (100B) DataDecide final checkpoints

Figure 6: Impact of changing benchmark metric to bits-per-byte (BPB) from the primary score (e.g., accuracy, pass@1, etc.). Left. Columns are (i) SNR of 1B models trained to 100B tokens; (ii) scaling law prediction error of 1B (and smaller) models used to predict 13B model performance; (iii) decision accuracy for using 150M model to predict 1B model ranking. For almost all tasks at the scales explored here, bits-per-byte shows a higher SNR, and lower scaling law prediction error, and higher decision accuracy than the primary score. Full results across 30 benchmarks and model scales in Table 17. Right. Example of primary metric and BPB on a single 1B (100B tokens) training curve (blue curve) and the final checkpoint of 25 models for Minerva MATH (green ‘x’s). Visually, the BPB training curve is smoother, corresponding to a higher SNR and a lower error in the prediction settings reported in the table, with all tasks in Figure 14.

Results on Early Stopping. Another prediction setting is to determine whether the ranking of two partially trained models will exhibit the same order at the end of training. We hypothesize that averaging the step-to-step noise will similarly improve this setting. In Figure 5, we report the decision accuracy for early stopping by using a single checkpoint (red), compared to an exponential moving average of the training curve (blue). We find for almost any training step, applying smoothing led to a higher decision accuracy when comparing models during training. In both settings, reducing the checkpoint-to-checkpoint noise allowed a more accurate extrapolation.

提前停止的结果。另一个预测设置是确定两个部分训练的模型的排名在训练结束时是否表现出相同的顺序。我们假设对步进噪声进行平均同样会改善此设置。在图 5 中，我们报告了使用单个检查点（红色）与训练曲线的指数移动平均值（蓝色）相比提前停止的决策准确性。我们发现，对于几乎所有训练步骤，在训练期间比较模型时，应用平滑可以提高决策准确性。在这两种设置中，减少检查点到检查点的噪声可以实现更准确的外推。

5.3 Measuring bits-per-byte improves benchmark signal-to-noise ratio · bits-per-byte改善基准信噪比

Setup. Recent work has begun to evaluate by using the test set as a perplexity set, with the intuition that the discontinuous metrics like accuracy or exact match erode the relationship between the language modeling perplexity and the downstream metric [54, 25]. We aim to measure whether the intervention to use a continuous metric improves the signal-to-noise ratio and corresponding error. We calculate the bits-per-byte (BPB) using the correct continuations of each test set – the bits-per-byte is the negative log likelihood of the correct answer divided by the number of UTF-8

设置。最近的工作已经开始通过使用测试集作为困惑度集来进行评估，直觉上，诸如准确性或精确匹配之类的不连续指标会削弱语言建模困惑度与下游指标之间的关系[54, 25]。我们的目的是衡量使用连续指标的干预是否改善了信噪比和相应的误差。我们使用每个测试集的正确延续来计算每字节位数 (BPB) - 每字节位数是正确答案的负对数似然除以 UTF-8 的数量

9

<!-- page 10 of 35 -->

bytes in the answer string [20, 37]. We compare BPB to the ‘primary’ task metric (accuracy, exact match, pass@1, etc.) on the signal-to-noise ratio, and whether it improves decision-making using decision accuracy from 150M to 1B and reduces the scaling law prediction error at 13B.

答案字符串 [20, 37] 中的字节。我们将 BPB 与“主要”任务指标（准确度、精确匹配、pass@1 等）在信噪比上进行比较，以及它是否使用决策准确度从 150M 提高到 1B 来改进决策，并在 13B 时降低缩放法则预测误差。

Results. In Figure 6 we report the signal-to-noise ratio, scaling law error and decision accuracy for benchmarks using BPB instead of the primary metric, along with an example training curves for Minerva. Most benchmarks have higher signal-to-noise ratio when using the BPB, particularly generative math and code benchmarks like GSM8K (1.2 to 7.0) and MBPP (2.0 to 41.8). To verify this improvement in signal-to-noise ratio corresponds to an improvement in our decision-making setups, we observe an improvement in decision accuracy at the small scale for 90.0% of all benchmarks and a lower scaling law prediction error for 73.3% of all benchmarks. We see BPB results in dramatic improvement for tasks that small scale models are not able to accomplish at all, primarily generative tasks. Our results confirm that BPB is a useful metric is both a higher quality development benchmark, particularly for challenging tasks at small scales that do not show above random-chance signal.

结果。在图 6 中，我们报告了使用 BPB 而不是主要指标的基准的信噪比、缩放法则误差和决策准确性，以及 Minerva 的示例训练曲线。使用 BPB 时，大多数基准测试具有更高的信噪比，特别是生成数学和代码基准测试，如 GSM8K（1.2 至 7.0）和 MBPP（2.0 至 41.8）。为了验证信噪比的这种改进与我们的决策设置的改进相对应，我们观察到 90.0% 的所有基准的小规模决策精度有所提高，并且 73.3% 的所有基准的标度律预测误差较低。我们看到 BPB 对小规模模型根本无法完成的任务（主要是生成任务）带来了显着的改进。我们的结果证实，BPB 是一个有用的指标，也是一个更高质量的开发基准，特别是对于不显示随机机会信号的小规模挑战性任务。

6 Related Work and Discussion · 相关工作与讨论

Predicting model behavior at large scales is crucial aspect to language model development, as discussed in the beginning of §2. Noise within evaluation benchmarks is frequently studied as the intrinsic noise of the dataset [2, 7, 40, 6], rather than the noise as a result of differences in the model during training. Closest to our work is Madaan et al. [36], which report a measure of SNR using the benchmark score of a single model and noise using 10 seed models, rather than a population of models. We find that the noise of a single model alone, while a useful measure of modeling noise, is not sufficient as a measure of correlation to decision accuracy (§4), and show the step-to-step noise is a cheap alternative to seed noise. Similarly, Kydlíˇcek et al. [29] focus on identifying high quality translations of tasks, but do not focus on decision making. Finally, EvalArena [63] also reports a measure of SNR using the final checkpoints of a small/large model pair (e.g., Llama 3 7B vs. 70B). While statistical measures based on intrinsic noise rather than modeling noise are important indicators of dataset noise, we find that many benchmarks may have low statistical variability but high checkpoint-to-checkpoint noise (such as BoolQ, as observed in Figure 9), which can only be captured with a measure of modeling noise.

正如第 2 节开头所讨论的，大规模预测模型行为是语言模型开发的关键方面。评估基准中的噪声经常被研究为数据集的固有噪声 [2,7,40,6]，而不是训练期间模型差异导致的噪声。与我们的工作最接近的是 Madaan 等人。 [36]，该报告使用单个模型的基准分数来衡量 SNR，并使用 10 个种子模型（而不是模型群体）来衡量噪声。我们发现，单个模型的噪声虽然是建模噪声的有用度量，但不足以作为决策准确性相关性的度量（§4），并且表明逐步噪声是种子噪声的廉价替代品。同样，Kydlíˇcek 等人。 [29]专注于识别任务的高质量翻译，但不专注于决策。最后，EvalArena [63] 还使用小/大模型对的最终检查点（例如 Llama 3 7B 与 70B）报告 SNR 的测量。虽然基于内在噪声而不是建模噪声的统计测量是数据集噪声的重要指标，但我们发现许多基准测试可能具有较低的统计变异性，但检查点到检查点的噪声较高（例如 BoolQ，如图 9 所示），这只能通过建模噪声的测量来捕获。

Interventions to improve evaluation have been well explored, such as constructing higher quality benchmarks by identifying errors [62, 21], expanding test sets [64], selecting high quality instances from benchmarks [45], or generating entirely new synthetic benchmarks from a model [32]. These works typically justify their decisions using inter-annotator agreement, or a high correlation with the original benchmark. We believe this body of work can benefit from verifying their methods using SNR, rather than noise or reconstruction error alone, to indicate whether the benchmark serves as a useful development tool.

改进评估的干预措施已经得到很好的探索，例如通过识别错误构建更高质量的基准[62, 21]、扩展测试集[64]、从基准中选择高质量实例[45]，或从模型生成全新的综合基准[32]。这些作品通常使用注释者间的协议或与原始基准的高度相关性来证明他们的决策是合理的。我们相信，这项工作可以受益于使用 SNR 验证他们的方法，而不是单独使用噪声或重建误差，以表明基准测试是否可以作为有用的开发工具。

Notably, this scope of our connection between the signal-to-noise ratio and predicting large scale phenomena is limited to the two decision accuracy and prediction error settings, and only studies the noise of the model during training. Future work may explore how signal-to-noise ratio indicates other small-to-large phenomena [65, 57], and the effects of additional sources of noise on the ability to extrapolate from small-scale experiments, such as from the evaluation configuration [55, 22].

值得注意的是，我们的信噪比和预测大规模现象之间的联系范围仅限于决策精度和预测误差两个设置，并且仅研究模型在训练期间的噪声。未来的工作可能会探索信噪比如何指示其他从小到大的现象 [65, 57]，以及额外的噪声源对从小规模实验（例如评估配置）中推断的能力的影响 [55, 22]。

In this work, we identify signal and noise as a cheap way of estimating whether a benchmark is useful in predicting large-scale phenomena with small scale experiments. We conclude that new benchmark development should use these measures of modeling noise as a guide for building evaluation tools for model developers, and practitioners adopt interventions, such as those introduced in this work, that improve their ability to compare models.

在这项工作中，我们将信号和噪声确定为一种廉价的方法，用于估计基准是否有助于通过小规模实验预测大规模现象。我们的结论是，新的基准开发应该使用这些建模噪声度量作为为模型开发人员构建评估工具的指南，并且从业者采取干预措施（例如本工作中引入的干预措施）来提高他们比较模型的能力。

Acknowledgments and Disclosure of Funding

We would like to thank Pang Wei Koh for feedback on the manuscript; and Dany Haddad, Dirk Groeneveld, Luca Soldaini, Matt Jordan, Oyvind Tafjord, Ronan Le Bras and Saumya Malik for insightful discussions. This material is based upon work supported by the U.S. National Science Foundation under Grant No. 2313998. Any opinions, findings, and conclusions or recommendations expressed in this material are those of the author(s) and do not necessarily reflect the views of the U.S. National Science Foundation. IM is supported by the NSF CSGrad4US Fellowship.

我们要感谢 Pang Wei Koh 对手稿的反馈； Dany Haddad、Dirk Groeneveld、Luca Soldaini、Matt Jordan、Oyvind Tafjord、Ronan Le Bras 和 Saumya Malik 进行了富有洞察力的讨论。本材料基于美国国家科学基金会资助号 2313998 资助的工作。本材料中表达的任何意见、发现、结论或建议均为作者的观点，并不一定反映美国国家科学基金会的观点。 IM 由 NSF CSGrad4US Fellowship 提供支持。

10

<!-- page 11 of 35 -->

References

[1] Jacob Austin, Augustus Odena, Maxwell Nye, Maarten Bosma, Henryk Michalewski, David

Dohan, Ellen Jiang, Carrie Cai, Michael Terry, Quoc Le, and Charles Sutton. Program synthesis with large language models. arXiv preprint arXiv:2108.07732, 2021.

[2] Taylor Berg-Kirkpatrick, David Burkett, and Dan Klein. An empirical investigation of statistical

significance in NLP. In Jun’ichi Tsujii, James Henderson, and Marius Pa¸sca, editors, Proceed- ings of the 2012 Joint Conference on Empirical Methods in Natural Language Processing and Computational Natural Language Learning, pages 995–1005, Jeju Island, Korea, July 2012. Association for Computational Linguistics. URL https://aclanthology.org/D12-1091/.

[3] Akshita Bhagia, Jiacheng Liu, Alexander Wettig, David Heineman, Oyvind Tafjord,

Ananya Harsh Jha, Luca Soldaini, Noah A Smith, Dirk Groeneveld, Pang Wei Koh, et al. Estab- lishing task scaling laws via compute-efficient model ladders. arXiv preprint arXiv:2412.04403, 2024.

[4] Yonatan Bisk, Rowan Zellers, Ronan Le Bras, Jianfeng Gao, and Yejin Choi. Piqa: Reasoning

about physical commonsense in natural language. In Proceedings of the AAAI Conference on Artificial Intelligence, pages 7432–7439, 2020.

[5] Cody Blakeney, Mansheej Paul, Brett W. Larsen, Sean Owen, and Jonathan Frankle. Does your

data spark joy? performance gains from domain upsampling at the end of training, 2024. URL https://arxiv.org/abs/2406.03476.

[6] Sam Bowyer, Laurence Aitchison, and Desi R Ivanova. Position: Don’t use the clt in llm evals

with fewer than a few hundred datapoints. arXiv preprint arXiv:2503.01747, 2025.

[7] Dallas Card, Peter Henderson, Urvashi Khandelwal, Robin Jia, Kyle Mahowald, and Dan

Jurafsky. With little power comes great responsibility. In Bonnie Webber, Trevor Cohn, Yulan He, and Yang Liu, editors, Proceedings of the 2020 Conference on Empirical Methods in Natural Language Processing (EMNLP), pages 9263–9274, Online, November 2020. Association for Computational Linguistics. doi: 10.18653/v1/2020.emnlp-main.745. URL https:// aclanthology.org/2020.emnlp-main.745/.

[8] Mark Chen, Jerry Tworek, Heewoo Jun, Qiming Yuan, Henrique Ponde de Oliveira Pinto, Jared

Kaplan, Harri Edwards, Yuri Burda, Nicholas Joseph, Greg Brockman, et al. Evaluating large language models trained on code. arXiv preprint arXiv:2107.03374, 2021.

[9] Leshem Choshen, Yang Zhang, and Jacob Andreas. A hitchhiker’s guide to scaling law estimation. arXiv preprint arXiv:2410.11840, 2024.

[10] Christopher Clark, Kenton Lee, Ming-Wei Chang, Tom Kwiatkowski, Michael Collins, and

Kristina Toutanova. Boolq: Exploring the surprising difficulty of natural yes/no questions. In Proceedings of the 2019 Conference of the North American Chapter of the Association for Computational Linguistics: Human Language Technologies, pages 2924–2936, 2019.

[11] Peter Clark, Isaac Cowhey, Oren Etzioni, Tushar Khot, Ashish Sabharwal, Carissa Schoenick,

and Oyvind Tafjord. Think you have solved question answering? try arc, the ai2 reasoning challenge. arXiv preprint arXiv:1803.05457, 2018.

[12] Karl Cobbe, Vineet Kosaraju, Mohammad Bavarian, Mark Chen, Heewoo Jun, Lukasz Kaiser,

Matthias Plappert, Jerry Tworek, Jacob Hilton, Reiichiro Nakano, Christopher Hesse, and John Schulman. Training verifiers to solve math word problems. arXiv preprint arXiv:2110.14168, 2021.

[13] Alexander D’Amour, Katherine Heller, Dan Moldovan, Ben Adlam, Babak Alipanahi, Alex

Beutel, Christina Chen, Jonathan Deaton, Jacob Eisenstein, Matthew D Hoffman, et al. Un- derspecification presents challenges for credibility in modern machine learning. Journal of Machine Learning Research, 23(226):1–61, 2022.

[14] Jesse Dodge, Gabriel Ilharco, Roy Schwartz, Ali Farhadi, Hannaneh Hajishirzi, and Noah Smith.

Fine-tuning pretrained language models: Weight initializations, data orders, and early stopping. arXiv preprint arXiv:2002.06305, 2020.

11

<!-- page 12 of 35 -->

[15] Zhengxiao Du, Aohan Zeng, Yuxiao Dong, and Jie Tang. Understanding emergent abilities of

language models from the loss perspective. arXiv preprint arXiv:2403.15796, 2024.

[16] Dheeru Dua, Yizhong Wang, Pradeep Dasigi, Gabriel Stanovsky, Sameer Singh, and Matt Gard-

ner. Drop: A reading comprehension benchmark requiring discrete reasoning over paragraphs. In Proceedings of the 2019 Conference of the North American Chapter of the Association for Computational Linguistics: Human Language Technologies, pages 2368–2378, 2019.

[17] Abhimanyu Dubey, Abhinav Jauhri, Abhinav Pandey, Abhishek Kadian, Ahmad Al-Dahle,

Aiesha Letman, Akhil Mathur, Alan Schelten, Amy Yang, Angela Fan, et al. The llama 3 herd of models. arXiv preprint arXiv:2407.21783, 2024.

[18] Clémentine Fourrier, Nathan Habib, Alina Lozovskaya, Konrad Szafer, and Thomas Wolf.

Open llm leaderboard v2. https://huggingface.co/spaces/open-llm-leaderboard/ open_llm_leaderboard, 2024.

[19] Samir Yitzhak Gadre, Georgios Smyrnis, Vaishaal Shankar, Suchin Gururangan, Mitchell

Wortsman, Rulin Shao, Jean Mercat, Alex Fang, Jeffrey Li, Sedrick Keh, et al. Language models scale reliably with over-training and on downstream tasks. arXiv preprint arXiv:2403.08540, 2024.

[20] Leo Gao, Stella Biderman, Sid Black, Laurence Golding, Travis Hoppe, Charles Foster, Jason

Phang, Horace He, Anish Thite, Noa Nabeshima, et al. The pile: An 800gb dataset of diverse text for language modeling. arXiv preprint arXiv:2101.00027, 2020.

[21] Aryo Pradipta Gema, Joshua Ong Jun Leang, Giwon Hong, Alessio Devoto, Alberto Carlo Maria

Mancino, Rohit Saxena, Xuanli He, Yu Zhao, Xiaotang Du, Mohammad Reza Ghasemi Madani, et al. Are we done with mmlu? arXiv preprint arXiv:2406.04127, 2024.

[22] Yuling Gu, Oyvind Tafjord, Bailey Kuehl, Dany Haddad, Jesse Dodge, and Hannaneh Hajishirzi.

Olmes: A standard for language model evaluations. arXiv preprint arXiv:2406.08446, 2024.

[23] Dan Hendrycks, Collin Burns, Steven Basart, Andy Zou, Mantas Mazeika, Dawn Song, and

Jacob Steinhardt. Measuring massive multitask language understanding. arXiv preprint arXiv:2009.03300, 2021.

[24] Jordan Hoffmann, Sebastian Borgeaud, Arthur Mensch, Elena Buchatskaya, Trevor Cai, Eliza

Rutherford, Diego de Las Casas, Lisa Anne Hendricks, Johannes Welbl, Aidan Clark, et al. Training compute-optimal large language models. arXiv preprint arXiv:2203.15556, 2022.

[25] Yuzhen Huang, Jinghan Zhang, Zifei Shan, and Junxian He. Compression represents intelligence

linearly. arXiv preprint arXiv:2404.09937, 2024.

[26] Mandar Joshi, Eunsol Choi, Daniel Weld, and Luke Zettlemoyer. Triviaqa: A large scale

distantly supervised challenge dataset for reading comprehension. In Proceedings of the 55th Annual Meeting of the Association for Computational Linguistics, pages 1601–1611, 2017.

[27] Jared Kaplan, Sam McCandlish, Tom Henighan, Tom B Brown, Benjamin Chess, Rewon Child,

Scott Gray, Alec Radford, Jeffrey Wu, and Dario Amodei. Scaling laws for neural language models. arXiv preprint arXiv:2001.08361, 2020.

[28] Tom Kwiatkowski, Jennimaria Palomaki, Olivia Redfield, Michael Collins, Ankur Parikh, Chris

Alberti, Danielle Epstein, Illia Polosukhin, Jacob Devlin, Kenton Lee, et al. Natural questions: A benchmark for question answering research. Transactions of the Association for Computational Linguistics, 7:452–466, 2019.

[29] Hynek Kydlíˇcek, Guilherme Penedo, Clémentine Fourier, Nathan Habib, and Thomas Wolf.

Finetasks: Finding signal in a haystack of 200+ multilingual tasks, 2024. URL https:// huggingface.co/spaces/HuggingFaceFW/blogpost-fine-tasks.

[30] Aitor Lewkowycz, Anders Andreassen, David Dohan, Ethan Dyer, Henryk Michalewski, Vinay

Ramasesh, Ambrose Slone, Cem Anil, Imanol Schlag, Theo Gutman-Solo, et al. Solving quantitative reasoning problems with language models. arXiv preprint arXiv:2206.14858, 2022.

12

<!-- page 13 of 35 -->

[31] Jeffrey Li, Alex Fang, Georgios Smyrnis, Maor Ivgi, Matt Jordan, Samir Yitzhak Gadre, Hritik

Bansal, Etash Guha, Sedrick Scott Keh, Kushal Arora, et al. Datacomp-lm: In search of the next generation of training sets for language models. Advances in Neural Information Processing Systems, 37:14200–14282, 2024.

[32] Xiang Lisa Li, Evan Zheran Liu, Percy Liang, and Tatsunori Hashimoto. Autobencher: Creating

salient, novel, difficult datasets for language models. arXiv preprint arXiv:2407.08351, 2024.

[33] Percy Liang, Rishi Bommasani, Tony Lee, Dimitris Tsipras, Dilara Soylu, Michihiro Yasunaga,

Yian Zhang, Deepak Narayanan, Yuhuai Wu, Ananya Kumar, et al. Holistic evaluation of

language models. arXiv preprint arXiv:2211.09110, 2022.

[34] Jiawei Liu, Chunqiu Steven Xia, Yuyao Wang, and Lingming Zhang. Is your code generated

by chatgpt really correct? rigorous evaluation of large language models for code generation. Advances in Neural Information Processing Systems, 36:21558–21572, 2023.

[35] Qian Liu, Xiaosen Zheng, Niklas Muennighoff, Guangtao Zeng, Longxu Dou, Tianyu Pang,

Jing Jiang, and Min Lin. Regmix: Data mixture as regression for language model pre-training. arXiv preprint arXiv:2407.01492, 2024.

[36] Lovish Madaan, Aaditya K Singh, Rylan Schaeffer, Andrew Poulton, Sanmi Koyejo, Pontus

Stenetorp, Sharan Narang, and Dieuwke Hupkes. Quantifying variance in evaluation bench- marks. arXiv preprint arXiv:2406.10229, 2024.

[37] Ian Magnusson, Akshita Bhagia, Valentin Hofmann, Luca Soldaini, Ananya Harsh Jha, Oyvind

Tafjord, Dustin Schwenk, Evan Pete Walsh, Yanai Elazar, Kyle Lo, et al. Paloma: A benchmark for evaluating language model fit. arXiv preprint arXiv:2312.10523, 2024.

[38] Ian Magnusson, Tai Nguyen, David Heineman, Jena D. Hwang, Luca Soldaini, Akshita Bhagia,

Jiacheng Liu, Dirk Groeneveld, Oyvind Tafjord, Noah A. Smith, Pang Wei Koh, Ben Bogin, and Jesse Dodge. Datadecide: How to predict best pretraining data with small experiments. under submission, 2025.

[39] Todor Mihaylov, Peter Clark, Tushar Khot, and Ashish Sabharwal. Can a suit of armor conduct

electricity? a new dataset for open book question answering. In Proceedings of the 2018 Conference on Empirical Methods in Natural Language Processing, pages 2381–2391, 2018.

[40] Evan Miller. Adding error bars to evals: A statistical approach to language model evaluations.

arXiv preprint arXiv:2411.00640, 2024.

[41] Iman Mirzadeh, Keivan Alizadeh, Hooman Shahrokhi, Oncel Tuzel, Samy Bengio, and Mehrdad

Farajtabar. Gsm-symbolic: Understanding the limitations of mathematical reasoning in large language models. arXiv preprint arXiv:2410.05229, 2024.

[42] Team OLMo, Pete Walsh, Luca Soldaini, Dirk Groeneveld, Kyle Lo, Shane Arora, Akshita

Bhagia, Yuling Gu, Shengyi Huang, Matt Jordan, et al. 2 olmo 2 furious. arXiv preprint arXiv:2501.00656, 2024.

[43] Ankit Pal, Logesh Kumar Umapathi, and Malaikannan Sankarasubbu. Medmcqa: A large-scale

multi-subject multi-choice dataset for medical domain question answering. In Proceedings of the Conference on Health, Inference, and Learning (CHIL), pages 248–260, 2022.

[44] Tim Pearce and Jinyeop Song. Reconciling kaplan and chinchilla scaling laws. arXiv preprint

arXiv:2406.12907, 2024.

[45] Felipe Maia Polo, Lucas Weber, Leshem Choshen, Yuekai Sun, Gongjun Xu, and Mikhail

Yurochkin. tinybenchmarks: evaluating llms with fewer examples. arXiv preprint arXiv:2402.14992, 2024.

[46] Kun Qian, Shunji Wan, Claudia Tang, Youzhi Wang, Xuanming Zhang, Maximillian Chen,

and Zhou Yu. Varbench: Robust language model benchmarking through dynamic variable perturbation. arXiv preprint arXiv:2406.17681, 2024.

13

<!-- page 14 of 35 -->

[47] Pranav Rajpurkar, Jian Zhang, Konstantin Lopyrev, and Percy Liang. Squad: 100,000+ questions

for machine comprehension of text. In Proceedings of the 2016 Conference on Empirical Methods in Natural Language Processing, pages 2383–2392, 2016.

[48] Siva Reddy, Danqi Chen, and Christopher D. Manning. Coqa: A conversational question

answering challenge. Transactions of the Association for Computational Linguistics, 7:249–266, 2019.

[49] David Rein, Betty Li Hou, Asa C. Stickland, Jackson Petty, Richard Yuanzhe Pang, Julien

Dirani, Julian Michael, and Samuel R. Bowman. Gpqa: A graduate-level google-proof q&a benchmark. arXiv preprint arXiv:2311.12022, 2023.

[50] Nicholas Roberts, Niladri Chatterji, Sharan Narang, Mike Lewis, and Dieuwke Hupkes. Com-

pute optimal scaling of skills: Knowledge vs reasoning. arXiv preprint arXiv:2503.10061, 2025.

[51] Yangjun Ruan, Chris J Maddison, and Tatsunori B Hashimoto. Observational scaling laws and

the predictability of langauge model performance. Advances in Neural Information Processing Systems, 37:15841–15892, 2025.

[52] Keisuke Sakaguchi, Ronan Le Bras, Chandra Bhagavatula, and Yejin Choi. Winogrande: An

adversarial winograd schema challenge at scale. In Proceedings of the AAAI Conference on Artificial Intelligence, pages 8732–8740, 2020.

[53] Maarten Sap, Hannah Rashkin, Derek Chen, Ronan Le Bras, and Yejin Choi. Social iqa:

Commonsense reasoning about social interactions. In Proceedings of the 2019 Conference on Empirical Methods in Natural Language Processing, pages 4463–4473, 2019.

[54] Rylan Schaeffer, Hailey Schoelkopf, Brando Miranda, Gabriel Mukobi, Varun Madan, Adam

Ibrahim, Herbie Bradley, Stella Biderman, and Sanmi Koyejo. Why has predicting downstream capabilities of frontier ai models with scale remained elusive? arXiv preprint arXiv:2406.04391, 2024.

[55] Melanie Sclar, Yejin Choi, Yulia Tsvetkov, and Alane Suhr. Quantifying language models’

sensitivity to spurious features in prompt design or: How i learned to start worrying about prompt formatting, 2024. URL https://arxiv.org/abs/2310.11324.

[56] Kashun Shum, Yuzhen Huang, Hongjian Zou, Ding Qi, Yixuan Liao, Xiaoxin Chen, Qian Liu,

and Junxian He. Predictive data selection: The data that predicts is the data that teaches. arXiv preprint arXiv:2503.00808, 2025.

[57] Charlie Snell, Eric Wallace, Dan Klein, and Sergey Levine. Predicting emergent capabilities by

finetuning, 2024. URL https://arxiv.org/abs/2411.16035.

[58] Aarohi Srivastava, Abhinav Rastogi, Abhishek Rao, Abu Awal Md Shoeb, Abubakar Abid,

Adam Fisch, Adam R Brown, Adam Santoro, Aditya Gupta, Adrià Garriga-Alonso, et al. Beyond the imitation game: Quantifying and extrapolating the capabilities of language models. arXiv preprint arXiv:2206.04615, 2022.

[59] Alon Talmor, Jonathan Herzig, Nicholas Lourie, and Jonathan Berant. Commonsenseqa: A

question answering challenge targeting commonsense knowledge. In Proceedings of the 2019 Conference of the North American Chapter of the Association for Computational Linguistics: Human Language Technologies, pages 4149–4158, 2019.

[60] Hugo Touvron, Louis Martin, Kevin Stone, Peter Albert, Amjad Almahairi, Yasmine Babaei,

Nikolay Bashlykov, Soumya Batra, Prajjwal Bhargava, Shruti Bhosale, Dan Bikel, Lukas Blecher, Cristian Canton Ferrer, Moya Chen, Guillem Cucurull, David Esiobu, Jude Fernandes, Jeremy Fu, Wenyin Fu, Brian Fuller, Cynthia Gao, Vedanuj Goswami, Naman Goyal, Anthony Hartshorn, Saghar Hosseini, Rui Hou, Hakan Inan, Marcin Kardas, Viktor Kerkez, Madian Khabsa, Isabel Kloumann, Artem Korenev, Punit Singh Koura, Marie-Anne Lachaux, Thibaut Lavril, Jenya Lee, Diana Liskovich, Yinghai Lu, Yuning Mao, Xavier Martinet, Todor Mihaylov, Pushkar Mishra, Igor Molybog, Yixin Nie, Andrew Poulton, Jeremy Reizenstein, Rashi Rungta,

14

<!-- page 15 of 35 -->

Kalyan Saladi, Alan Schelten, Ruan Silva, Eric Michael Smith, Ranjan Subramanian, Xiao- qing Ellen Tan, Binh Tang, Ross Taylor, Adina Williams, Jian Xiang Kuan, Puxin Xu, Zheng Yan, Iliyan Zarov, Yuchen Zhang, Angela Fan, Melanie Kambadur, Sharan Narang, Aurelien

Rodriguez, Robert Stojnic, Sergey Edunov, and Thomas Scialom. Llama 2: Open foundation and fine-tuned chat models, 2023. URL https://arxiv.org/abs/2307.09288.

[61] (Kaggle Datasets) Tunguz. 200,000+ jeopardy! questions. https://www.kaggle.com/ datasets/tunguz/200000-jeopardy-questions, 2019.

[62] Joshua Vendrow, Edward Vendrow, Sara Beery, and Aleksander Madry. Do large language

model benchmarks test reliability? arXiv preprint arXiv:2502.03461, 2025.

[63] Sida I. Wang, Alex Gu, Lovish Madaan, Dieuwke Hupkes, Jiawei Liu, Yuxiang Wei, Naman

Jain, Yuhang Lai, Sten Sootla, Ofir Press, Baptiste Rozière, and Gabriel Synnaeve. Eval-Arena: noise and errors on llm evaluations. https://github.com/crux-eval/eval-arena, 2024.

[64] Yubo Wang, Xueguang Ma, Ge Zhang, Yuansheng Ni, Abhranil Chandra, Shiguang Guo,

Weiming Ren, Aaran Arulraj, Xuan He, Ziyan Jiang, et al. Mmlu-pro: A more robust and challenging multi-task language understanding benchmark. In The Thirty-eight Conference on Neural Information Processing Systems Datasets and Benchmarks Track, 2024.

[65] Jason Wei, Yi Tay, Rishi Bommasani, Colin Raffel, Barret Zoph, Sebastian Borgeaud, Dani

Yogatama, Maarten Bosma, Denny Zhou, Donald Metzler, et al. Emergent abilities of large

language models. arXiv preprint arXiv:2206.07682, 2022.

[66] Alexander Wettig, Kyle Lo, Sewon Min, Hannaneh Hajishirzi, Danqi Chen, and Luca Soldaini.

Organize the web: Constructing domains enhances pre-training data curation. arXiv preprint arXiv:2502.10341, 2025.

[67] Sarah Wiegreffe, Oyvind Tafjord, Yonatan Belinkov, Hannaneh Hajishirzi, and Ashish Sabhar-

wal. Answer, assemble, ace: Understanding how transformers answer multiple choice questions. arXiv preprint arXiv:2407.15018, 2024.

[68] Greg Yang, Edward J. Hu, Igor Babuschkin, Szymon Sidor, Xiaodong Liu, David Farhi, Nick

Ryder, Jakub Pachocki, Weizhu Chen, and Jianfeng Gao. Tensor programs v: Tuning large neural networks via zero-shot hyperparameter transfer, 2022. URL https://arxiv.org/abs/ 2203.03466.

[69] Rowan Zellers, Ari Holtzman, Yonatan Bisk, Ali Farhadi, and Yejin Choi. Hellaswag: Can

a machine really finish your sentence? In Proceedings of the 57th Annual Meeting of the Association for Computational Linguistics, pages 4791–4800, 2019.

[70] Wanjun Zhong, Ruixiang Cui, Yiduo Guo, Yaobo Liang, Shuai Lu, Yanlin Wang, Amin Saied,

Weizhu Chen, and Nan Duan. Agieval: A human-centric benchmark for evaluating foundation models. arXiv preprint arXiv:2304.06364, 2023.

15

<!-- page 16 of 35 -->

A Methodology Details · 方法细节

A.1 Scaling Law Details

Hoffmann et al. [24] models the improvement for larger model training budgets as a power function, proportional to the model parameters N and training tokens D, with the exact functional form and prediction setup varying between work [44]. Recent work has begun using the downstream task as the prediction target [17, 19], in this work we follow Bhagia et al. [3] by fitting a scaling law function to the language modeling loss over the correct continuation, then from the task loss to the downstream evaluation. We use the following functional form:

霍夫曼等人。 [24] 将较大模型训练预算的改进建模为幂函数，与模型参数 N 和训练标记 D 成正比，确切的函数形式和预测设置因工作而异 [44]。最近的工作已经开始使用下游任务作为预测目标 [17, 19]，在这项工作中我们遵循 Bhagia 等人的方法。 [3]通过将缩放法则函数拟合到正确延续上的语言建模损失，然后从任务损失到下游评估。我们使用以下函数形式：

L(N, D) = A

N α + B

Dβ + E, U(L) = a 1 + e−k(L−L0) + b (3)

We follow the same methodology as Bhagia et al. [3] and use the Huber loss to fit L(N, D) and use a non-linear least squares optimizer to fit U(L). The prediction error is defined as the relative error of the scaling law fit:

我们遵循与 Bhagia 等人相同的方法。 [3]并使用Huber损失来拟合L(N,D)并使用非线性最小二乘优化器来拟合U(L)。预测误差定义为缩放定律拟合的相对误差：

Prediction Error = |Measured Value −True Value|

|True Value| (4)

A.2 Decision Accuracy Details

Decision accuracy is one of many rank agreement metrics we could use to show that models trained across pre-training corpora agree at a small scale and a large scale. We present two alternatives here:

决策准确性是我们可以用来表明跨预训练语料库训练的模型在小规模和大规模上一致的众多排名一致性指标之一。我们在这里提出两种替代方案：

N

Kendall’s τ. Here, rather than report Kendall’s τ, we show it is proportional to decision accuracy. Kendall’s τ is defined as the difference between the concordant pairs C and discordant pairs D, divided by the total pairs of models: τ = (C −D)/

肯德尔的 τ。在这里，我们没有报告 Kendall 的 τ，而是表明它与决策准确性成正比。 Kendall 的 τ 定义为一致对 C 和不一致对 D 之间的差值除以模型对总数： τ = (C −D)/

2 

N

.

. We can then rewrite decision accuracy defined only by the number of concordant pairs C: decision accuracy = C/

。然后我们可以重写仅由一致对 C 的数量定义的决策准确度：决策准确度 = C/

2 

N

Since we do not allow ties, C and D make up the total number of pairs

由于我们不允许平局，因此 C 和 D 构成了对的总数

2 

= C + D, we can rewrite decision accuracy as follows:



N

C −

−C

N

2 

2 

τ =

N

N

2  = 2C −

2  = 2 · C N

2  −1

= 2 · (decision accuracy) −1

Therefore, the decision accuracy measure in Magnusson et al. [38] is equivalent to Kendall’s τ modulo a scale and shift.

因此，Magnusson 等人的决策准确性衡量标准。 [38] 相当于 Kendall 的 τ 以尺度和位移为模。

Spearman’s Rank Correlation. Kendall’s τ is not sensitive to outliers, and instead we can incorpo- rate the strength of the difference in rank with Spearman’s ρ: ρ = 1 − 6 P d2 i n(n2−1). This statistic will be more sensitive to large differences in model ranking.

斯皮尔曼的等级相关性。 Kendall 的 τ 对异常值不敏感，相反，我们可以将等级差异的强度与 Spearman 的 ρ 结合起来：ρ = 1 − 6 P d2 i n(n2−1)。该统计数据将对模型排名的较大差异更加敏感。

We use decision accuracy in this work for consistency, and to provide a more interpretable metric of rank agreement (for instance, a decision accuracy of 80% indicates that 80% of the pairs of mixes agree between the small scale and large scale). To show that both additional measures of agreement produce similar conclusions, we include correlation with these additional measures of agreement in Table 3.

我们在这项工作中使用决策准确性来保持一致性，并提供更可解释的排名一致性指标（例如，80% 的决策准确性表示 80% 的混合对在小规模和大规模之间一致）。为了表明这两种额外的一致性度量产生相似的结论，我们在表 3 中包含了与这些额外的一致性度量的相关性。

A.3 Measures of Modeling Noise

Seed Noise. To measure the noise introduced from changing the random seed initialization between training runs, we can compute the standard deviation of the final checkpoint from multiple training runs with different random seeds. To estimate seed noise, we train M models using the same configuration, and average the scores over the final n checkpoints of T total training checkpoints to smooth the checkpoint-to-checkpoint noise, then compute the standard deviation:

种子噪音。为了测量因改变训练运行之间的随机种子初始化而引入的噪声，我们可以计算使用不同随机种子的多次训练运行的最终检查点的标准偏差。为了估计种子噪声，我们使用相同的配置训练 M 个模型，并对 T 个总训练检查点的最后 n 个检查点的分数进行平均，以平滑检查点到检查点的噪声，然后计算标准差：

PT

Seed Noise(M) = σ(M), Mi = 1

n

j=T −n+1 U(tj) (5)

16

<!-- page 17 of 35 -->

Data Order Noise. This is noise introduced from changing the order of sampled documents from the training data. We estimate the data order noise using the same method as seed noise.

数据顺序噪声。这是由于改变训练数据中采样文档的顺序而引入的噪声。我们使用与种子噪声相同的方法来估计数据阶噪声。

Total Variation. To measure the checkpoint-to-checkpoint noise throughout an entire training run, we measure the total variation of the intermediate training checkpoints on the downstream benchmark. We measure total variation as the average change in metric score across T training checkpoints minus an improvement term:

总变化。为了测量整个训练运行中检查点到检查点的噪声，我们测量下游基准上中间训练检查点的总变化。我们将总变异测量为 T 个训练检查点的指标得分的平均变化减去改进项：

PT

Total Variation = 1

T

t=1 |U(t) −U(t −1)| −1

T (U(T) −U(0)) (6)

Checkpoint-to-checkpoint Noise. Calculating the above sources of noise are either too expensive to estimate at large scales (e.g., training LLMs by varying the random seed) or difficult to run (e.g., evaluating every checkpoint on an LLM training curve). Instead, we propose an estimate measuring only the noise of the final n training checkpoints of training:

检查点到检查点的噪声。计算上述噪声源要么成本太高，无法大规模估计（例如，通过改变随机种子来训练 LLM），要么难以运行（例如，评估 LLM 训练曲线上的每个检查点）。相反，我们提出仅测量训练的最后 n 个训练检查点的噪声的估计：





Checkpoint-to-checkpoint Noise = σ

(7)

{U(tj)}T

j=T −k+1

A.3.1 Correlation between Sources of noise

To measure the relationship between each source of noise, we train 10 1B-5xC models varying the random seed initializations and 10 models varying the data order. In Figure 7, we measure the correlation between the seed noise, data order noise and total variation against the step-to-step noise. Each source of noise is highly correlated with the step-to-step noise (R ≥0.9 for all measures). While it would be ideal to calculate and reduce all sources of noise, seed noise and data order noise are too expensive to measure (e.g., for large model runs as in Madaan et al. [36]), so only calculating step-to-step noise is a reasonable estimate for the modeling noise. Thus, we use step-to-step noise in as our estimate of the modeling noise.

为了测量每个噪声源之间的关系，我们训练了 10 个不同随机种子初始化的 1B-5xC 模型和 10 个不同数据顺序的模型。在图 7 中，我们测量了种子噪声、数据顺序噪声和总变异与逐步噪声之间的相关性。每个噪声源与步进噪声高度相关（所有测量值的 R ≥0.9）。虽然计算和减少所有噪声源是理想的，但种子噪声和数据顺序噪声的测量成本太高（例如，对于 Madaan 等人 [36] 中的大型模型运行），因此仅计算逐步噪声是对建模噪声的合理估计。因此，我们使用逐步噪声作为建模噪声的估计。

A.3.2 Selecting the Number of Checkpoints in Noise

The noise calculation introduced in Section 3.1 requires selecting some n intermediate checkpoints to estimate the checkpoint-to-checkpoint noise. In this section, we provide guidance on selecting n, and discuss its impact on our findings. Increasing the number of intermediate checkpoints n will lead to a less biased estimate of noise. Thus, we can calculate the minimum number of n intermediate checkpoint samples such that the sample noise sn is a reasonable estimate of the population noise σ.

3.1节中介绍的噪声计算需要选择一些n个中间检查点来估计检查点到检查点的噪声。在本节中，我们提供有关选择 n 的指导，并讨论其对我们的研究结果的影响。增加中间检查点 n 的数量将导致噪声估计的偏差较小。因此，我们可以计算 n 个中间检查点样本的最小数量，使得样本噪声 sn 是总体噪声 σ 的合理估计。

We first assume the checkpoint to checkpoint scores are independent and normally distributed (which we observe when computing decision accuracy on intermediate checkpoints in Figure 7). Under this assumption, the ratio between the sample variance and the population variance follows a scaled chi squared distribution: (n−1)s2

我们首先假设检查点到检查点的分数是独立的且呈正态分布（我们在计算图 7 中的中间检查点的决策准确性时观察到这一点）。在此假设下，样本方差与总体方差之间的比率遵循缩放卡方分布： (n−1)s2

n σ2 ∼χ2

n−1 Therefore we would like to calculate the probability that the sample standard deviation sn is within one standard deviation of the population standard deviation σ: |sn −σ| < σ

n−1 因此我们要计算样本标准差 sn 在总体标准差 σ 的一个标准差内的概率： |sn −σ| < σ

We can rewrite this inequality:

σ −1

σ < 2

< 1 ⇒0 < sn

sn

And then, can substitute the chi-squared distribution to compute the likelihood w.r.t. n:

然后，可以替换卡方分布来计算似然性。号：





s

s

χ2

χ2

sn



χ2

n−1 < 4(n −1)



⇒P

σ ∼

n−1 n −1 ⇒P

n−1 n −1 < 2

We can then solve the inequality for the smallest value of n for a particular threshold α:

然后我们可以求解特定阈值 α 的 n 最小值的不等式：



P

χ2

> α

n−1 < 4(n −1)

Solving this inequality numerically with α = 0.95 for increasing values of n, we find that n = 9 provides the smallest sample size such that the probability that the sample standard deviation (the

随着 n 值的增加，用 α = 0.95 数值求解这个不等式，我们发现 n = 9 提供了最小的样本量，使得样本标准差（

17

<!-- page 18 of 35 -->

HellaSwag

HellaSwag

HellaSwag

1B Run (varying seed)

1B Run (varying data order)

1B Run (varying seed + data order)

0.6

0.6

0.6

0.5

0.5

0.5

0.625

0.4

0.4

0.4

0.600

Accuracy

0.600

total variation

0.625 seed noise

data order noise

0.3

0.3

0.3

0.575

0.575

0K 20K 40K 60K 80K

0K 20K 40K 60K

0K 20K 40K 60K 80K

ARC Challenge

ARC Challenge

0.40 ARC Challenge

1B Run (varying seed)

1B Run (varying data order)

1B Run (varying seed + data order)

0.35

0.35

0.35

0.30

0.30

0.38

0.30

Accuracy

0.25

0.25

total variation

0.38 data order noise

seed noise

0.25

0.36

0.36

0.20

0.20

0K 20K 40K 60K 80K

0K 20K 40K 60K 0.20

0K 20K 40K 60K 80K

MMLU

MMLU

MMLU

0.36

1B Run (varying seed)

1B Run (varying data order)

1B Run (varying seed + data order)

0.34

0.34

0.34

0.32

0.32

0.32

0.30

0.30

0.30

Accuracy

0.28

0.28

0.35 seed noise

total variation

0.28

0.34

0.35 data order noise

0.34

0.26

0.26

0.26

0K 20K 40K 60K 80K Training Step

0K 20K 40K 60K Training Step

0K 20K 40K 60K 80K Training Step

ARC Challenge

ARC Challenge

ARC Challenge

0.0200

0.0200

0.0200

R = 0.90 R² = 0.82

R = 0.93 R² = 0.86

R = 0.97 R² = 0.95

0.0175

0.0175

0.0175

Winogrande

SocialIQA

0.0150

0.0150

0.0150

Winogrande

0.0125

0.0125

CommonsenseQA

Winogrande

0.0125

CommonsenseQA

SocialIQA

SocialIQA

0.0100

0.0100

HellaSwag

0.0100

CommonsenseQA

Total Variation

HellaSwag

ARC Easy

0.0075

0.0075

Data Order Noise

ARC Easy

ARC Easy

HellaSwag

0.0075

0.0050

0.0050

Seed Initialization Noise

MMLU Avg. of 10 1B-100B Runs

MMLU Avg. of 10 1B-100B Runs

Avg. of 20 1B-100B Runs

PIQA

PIQA MMLU

PIQA

0.0050

0.00500.00750.01000.01250.0150 Checkpoint-to-Checkpoint Noise

0.005 0.010 0.015 Checkpoint-to-Checkpoint Noise

0.00500.00750.01000.01250.0150 Checkpoint-to-Checkpoint Noise

Figure 7: Top: 10 different training runs (1B-5×C scale) varying random seed initialization and data order, plotting ARC-C accuracy smoothed across a window of 20 checkpoints. Bottom: Total variation or the relative standard deviation (STD normalized by average performance; §3) of scores from different seeds, data after averaging the last 20 training checkpoints vs. the Rel. Std. over the last 20 training checkpoints. Benchmarks with a high checkpoint-to-checkpoint noise also exhibit high noise due to random seed initialization, data order and noise along the full training curve. Noise for all tasks reported in Figure 19.

observed noise) is within one standard deviation of the population standard deviation (the true noise) with 95% confidence. In addition, we can specify a stricter bound by defining the sample standard deviation to be within k · σ of the population standard deviation: |sn −σ| < k · σ

观测到的噪声）与总体标准差（真实噪声）的 1 个标准差以内，置信度为 95%。此外，我们可以通过将样本标准差定义在总体标准差的 k · σ 范围内来指定更严格的界限： |sn −σ| < k · σ

We then verify this empirically using our estimate for noise at the 7B scale (from §5.2). If we assume the 30 intermediate checkpoints provide a reasonable estimate of the population standard deviation, we then compute the sample standard deviation sn for n < 30. We re-compute sn 1000 times for different subsets to calculate the likelihood that the sampled standard deviation is within k · σ of the population standard deviation σ. In the below table, we report this likelihood with tolerances k ∈{0.2, 1.0} for subsets n ∈{5, 10, 20} and bold all results with a likelihood above 0.95.

然后，我们使用 7B 尺度的噪声估计（来自第 5.2 节）凭经验验证这一点。如果我们假设 30 个中间检查点提供了总体标准差的合理估计，则我们将计算 n < 30 时的样本标准差 sn。我们对不同子集重新计算 sn 1000 次，以计算采样标准差在总体标准差 σ 的 k · σ 范围内的可能性。在下表中，我们报告了子集 n ∈{5,10,20} 的公差 k ∈{0.2, 1.0} 的可能性，并将可能性高于 0.95 的所有结果加粗。

In practice, we find that for a large bound (±1 std. dev.) can be satisfied for almost all benchmarks with n = 5 intermediate checkpoints, but for smaller bounds, (20% of ±1 std. dev.), using n = 20 gives an adequate estimate for 34 of 39 benchmarks we considered in our work.

在实践中，我们发现，对于具有 n = 5 个中间检查点的几乎所有基准来说，大范围（±1 标准偏差）都可以得到满足，但对于较小的范围（±1 标准偏差的 20%），使用 n = 20 可以对我们在工作中考虑的 39 个基准中的 34 个进行充分估计。

For our experiment on the 1B-5xC checkpoints, we estimate noise using the average noise of the last 5 checkpoints for all 25 models, so our estimate of noise considers 5 · 25 = 125 scores.

对于我们在 1B-5xC 检查点上的实验，我们使用所有 25 个模型的最后 5 个检查点的平均噪声来估计噪声，因此我们的噪声估计考虑了 5 · 25 = 125 分数。

18

<!-- page 19 of 35 -->

Table 2: Ablating the n term in noise: Likelihood that the sample standard deviation for n inter- mediate checkpoints is a reasonable estimate for the population standard deviation on OLMo 2 7B, calculated using 30 intermediate checkpoints (Values for α > 0.95 in bold). We find that for a low tolerance (within 0.2σ), 20 intermediate checkpoints provides an adequate estimate of noise.

k threshold in k · σ → k = 0.2 k = 1.0 # Ckpts in Noise (n) → 5 10 20 5 10 20

AGI Eval 0.42 0.61 0.95 1.00 1.00 1.00 ARC Challenge 0.44 0.70 0.98 1.00 1.00 1.00 ARC Easy 0.38 0.65 0.97 1.00 1.00 1.00 AutoBencher 0.47 0.71 0.97 1.00 1.00 1.00 BBH 0.42 0.60 0.95 1.00 1.00 1.00 BoolQ 0.16 0.45 0.88 1.00 1.00 1.00 HumanEval 0.52 0.79 0.99 1.00 1.00 1.00 HumanEval+ 0.47 0.76 0.99 1.00 1.00 1.00 CommonsenseQA 0.39 0.64 0.96 1.00 1.00 1.00 DROP 0.48 0.76 0.99 1.00 1.00 1.00 GSM8K 0.49 0.77 0.99 1.00 1.00 1.00 GSM+ 0.50 0.79 0.99 1.00 1.00 1.00 GSM Symbolic 0.37 0.64 0.96 1.00 1.00 1.00 GSM Symbolic P1 0.47 0.69 0.98 1.00 1.00 1.00 GSM Symbolic P2 0.32 0.57 0.94 1.00 1.00 1.00 HellaSwag 0.39 0.65 0.97 1.00 1.00 1.00 Jeopardy 0.42 0.69 0.98 1.00 1.00 1.00 MBPP 0.43 0.63 0.96 1.00 1.00 1.00 MBPP+ 0.41 0.63 0.96 1.00 1.00 1.00 MedMCQA 0.50 0.79 0.99 1.00 1.00 1.00 Minerva MATH 0.38 0.53 0.93 1.00 1.00 1.00 Minerva MATH 500 0.28 0.53 0.92 1.00 1.00 1.00 MMLU 0.00 0.00 0.54 0.83 1.00 1.00 MMLU Pro 0.51 0.78 0.99 1.00 1.00 1.00 All Tasks 0.00 0.00 0.08 0.83 1.00 1.00 Code Tasks 0.49 0.78 0.99 1.00 1.00 1.00 Knowledge Tasks 0.00 0.00 0.15 0.83 1.00 1.00 Math Tasks 0.55 0.83 0.99 1.00 1.00 1.00 OLMES Core 9 0.31 0.49 0.92 1.00 1.00 1.00 OLMES Gen 0.48 0.74 0.98 1.00 1.00 1.00 OpenBookQA 0.42 0.73 0.98 1.00 1.00 1.00 PIQA 0.43 0.69 0.98 1.00 1.00 1.00 SocialIQA 0.30 0.44 0.88 0.99 1.00 1.00 SQuAD 0.48 0.72 0.99 1.00 1.00 1.00 TriviaQA 0.48 0.76 0.99 1.00 1.00 1.00 WinoGrande 0.42 0.67 0.97 1.00 1.00 1.00

A.4 Measures of Signal

Measurements. When designing an measure of signal, we want to incorporate the uniformity of benchmark scores and the overall range of scores. Given the final checkpoints of training runs under similar compute spend Cfinal, we evaluate multiple approaches to measuring signal:

测量。在设计信号测量时，我们希望纳入基准分数的均匀性和分数的总体范围。考虑到在类似的计算支出 Cfinal 下训练运行的最终检查点，我们评估了多种测量信号的方法：

Pn

• Variance measures average squared distance from the mean: Var(Cfinal) = 1 n

i=1 ∥ci−¯c∥2

P

• Mean distance measures average pairwise distance between points: Mean Dist(Cfinal) = 2 n(n−1)

i<j ∥ci −cj∥

• Relative standard deviation, or the coefficient of variation, measures the standard deviation

√

divided by the mean: Rel. Std.(Cfinal) =

Pn

Var(Cfinal) Mean(Cfinal) • Star Discrepancy measures the largest difference between any point and the uniform distribution: Discrepancy(Cfinal) = supt∈[0,1]

Var(Cfinal) Mean(Cfinal) • 星差衡量任意点与均匀分布之间的最大差异： Discrepancy(Cfinal) = SUPTε[0,1]

n

i=1 1{ci ≤t} −t

1

.

• Dispersion measures the largest difference between any two points, or the largest unfilled space in the range of performance: Dispersion(Cfinal) = maxi̸=j ∥ci −cj∥.

• 色散测量任意两点之间的最大差异，或性能范围内最大的未填充空间：色散(Cfinal) = maxi̸=j ∥ci −cj∥。

Note, we include metrics that are sensitive and non sensitive to outliers, and find our results hold when measuring both types of spread (Table 3). We also include variants of these terms, such using a min-max normalization or scaling by the mean.

请注意，我们包括对异常值敏感和不敏感的指标，并发现我们的结果在测量这两种类型的价差时都成立（表 3）。我们还包括这些术语的变体，例如使用最小-最大归一化或按平均值缩放。

Choosing the a signal measurement. In Table 3, we calculate the correlation between signal- to-noise ratio and decision accuracy when using each of the signal variants. We see that many

选择信号测量。在表 3 中，我们计算了使用每种信号变体时信噪比和决策精度之间的相关性。我们看到很多

19

<!-- page 20 of 35 -->

Table 3: Correlation of signal-to-noise ratio to decision accuracy, using different measures of signal. We use the measure which is most predictive of decision accuracy as our measure of signal. We include alternative methods for calculating decision accuracy (Pearson correlation and Spearman’s rank correlation coefficient), as detailed in Appendix A.2. Fits are illustrated in Figure 10.

SNR vs. Spearman R2

SNR vs. Pearson R2

Measure of Signal SNR vs. Decision Acc R2

P

Rel. Dispersion maxi,j |ci −cj|/¯c 0.5687 0.4052 0.4902 Rel. Std. Dev. σ/µ 0.5657 0.3850 0.4771 Rel. Mean Pairwise Distance 1 n2

P

i(ci −¯c) 0.4745 0.3667 0.3950

i,j |ci −cj|/¯c 0.5458 0.3624 0.4561 Interquartile Range Q3 −Q1 0.4836 0.2866 0.3980 Distance Standard Deviation 1 n

q

P

RMS Deviation

1 n

P

i(ci −¯c)2 0.4633 0.3435 0.3812 Mean Pairwise Distance 1 n2

P

i,j |ci −cj| 0.4589 0.3325 0.3758 Range max(c) −min(c) 0.4574 0.3604 0.3865 Dispersion maxi,j |ci −cj| 0.4574 0.3604 0.3865 Quartile Deviation (Q3 −Q1)/2 0.4528 0.2896 0.3655 Average Absolute Deviation 1 n

P

i |ci −¯c| 0.4507 0.3186 0.3672 Median Absolute Deviation median(|ci −median(c)|) 0.4168 0.2663 0.3346 Rel. Mean Squared Pairwise Distance 1 n2

P

i,j(ci −cj)2/¯c2 0.2908 0.1627 0.2324 Mean Squared Pairwise Distance 1 n2

i,j(ci −cj)2 0.2480 0.1457 0.1953 Gini Coefficient 1 2n2µ P

i,j |ci −cj| 0.0944 0.0978 0.0829 Star Discrepancy (Shift+Scale) sup[0,c] |Fn(t) −F (t)| with shifting 0.0391 0.0768 0.0454 Star Rel. Discrepancy sup[0,c] |Fn(t) −F (t)|/F (t) 0.0379 0.0587 0.0420 Dispersion (Shift+Scale) maxi,j |ci −cj| with shifting 0.0374 0.0679 0.0382 Halfspace Depth min (Fn(x), 1 −Fn(x)) 0.0358 0.0395 0.0373 Discrepancy maxc |Fn(c) −F (c)| 0.0340 0.0754 0.0401



Projection Depth

1 + |x−med(c)| MAD(c)

−1 0.0331 0.0392 0.0353 Star Discrepancy sup[0,c] |Fn(t) −F (t)| 0.0319 0.0665 0.0356

straight forward measures have similarly high correlations. We use relative dispersion, the highest correlated among them, as our measure of signal.

直接衡量指标也具有类似的高相关性。我们使用其中相关性最高的相对色散作为信号的衡量标准。

A.5 Dataset Details

A.5.1 Models

We evaluate 465 models which represent stages of the decision-making process during pre-training. Unlike existing collections of model evaluations [18, 33], our set is targeted at development models:

我们评估了 465 个模型，这些模型代表了预训练期间决策过程的各个阶段。与现有的模型评估集合 [18, 33] 不同，我们的集合针对开发模型：

Scaling Law Models. 25 ladder models from Bhagia et al. [3]. {190M, 370M, 760M, 1.3B, 3.2B} × {0.5xC, 1xC, 2xC, 5xC, 10xC} trained on OLMoE mix, and 7B-4T / 13B-5T as prediction targets.

扩展法律模型。 Bhagia 等人的 25 个梯子模型。 [3]。 {190M, 370M, 760M, 1.3B, 3.2B} × {0.5xC, 1xC, 2xC, 5xC, 10xC} 在 OLMoE mix 上训练，并以 7B-4T / 13B-5T 作为预测目标。

Decision Accuracy Models. 225 models from Magnusson et al. [38] trained on 25 data recepies for {4M, 20M, 60M, 90M, 150M, 300M, 530M, 750M, 1.3B} trained to 5x Chinchilla optimal.

决策准确性模型。 Magnusson 等人的 225 个模型[38] 对 {4M、20M、60M、90M、150M、300M、530M、750M、1.3B} 的 25 个数据接收进行训练，训练到 5x Chinchilla 最佳值。

Random Seed & Data Order Models. 20 models 1B-5xC models trained on the OLMoE mix, 10 models trained with different random seed initializations and 10 models trained with different data order seeds.

随机种子和数据顺序模型。 20 个模型 1B-5xC 模型在 OLMoE 混合上进行训练，10 个模型使用不同的随机种子初始化进行训练，10 个模型使用不同的数据顺序种子进行训练。

Final n Checkpoints. 120 models representing the 30 final checkpoints before the end of training for OLMo 2 1B, 7B, 13B and 32B [42], with checkpoints spaced by 1000 training checkpoints.

最终 n 个检查点。 120 个模型代表 OLMo 2 1B、7B、13B 和 32B [42] 训练结束前的 30 个最终检查点，检查点间隔为 1000 个训练检查点。

External Models. 73 open-weight base models from the DCLM, DeepSeek, Gemma, Llama, Orca, Phi, Pythia, Qwen, SmolLM, StableLM and Yi model families. We estimate the training FLOPs using the reported token count.

外部模型。来自 DCLM、DeepSeek、Gemma、Llama、Orca、Phi、Pythia、Qwen、SmolLM、StableLM 和 Yi 模型系列的 73 个开放权重基础模型。我们使用报告的令牌计数来估计训练 FLOP。

We perform all evaluation using up to 2 H100s for a particular model, and use 94K H100 hours total for all evaluation. For training our randomly initialized seed and data order models, we use 23K GPU hours, using a cluster of 2x8 H100s for each training run.

对于特定型号，我们使用最多 2 个 H100 来执行所有评估，并且所有评估总共使用 94K H100 小时。为了训练随机初始化的种子和数据顺序模型，我们使用 23K GPU 小时，每次训练运行使用 2x8 H100 集群。

A.5.2 Benchmarks

We intentionally select benchmarks that are widely adopted in pre-training evaluation. We use the OLMES [22] standard when applicable, and for other benchmarks, we reproduce the evaluation setup

我们有意选择在训练前评估中广泛采用的基准。我们在适用时使用 OLMES [22] 标准，对于其他基准，我们重现评估设置

20

<!-- page 21 of 35 -->

ARC Easy

MMLU

HellaSwag

6000

SNR = 21.540.123/0.006

SNR = 14.050.054/0.004

SNR = 9.090.129/0.014 ARC Challenge

SNR = 6.630.037/0.006

10000

6000

3000

8000

4000

4000

6000

2000

4000

# Samples

# Samples

# Samples

# Samples

2000

2000

1000

2000

0

0

0

0

0.85 0.90 0.95 1.00 1.05 Decision Accuracy at 300M (Sampled from Final 5 Ckpts)

0.80 0.85 0.90 0.95 Decision Accuracy at 300M (Sampled from Final 5 Ckpts)

0.75 0.80 0.85 0.90 0.95 Decision Accuracy at 300M (Sampled from Final 5 Ckpts)

0.75 0.80 0.85 0.90 Decision Accuracy at 300M (Sampled from Final 5 Ckpts)

BoolQ

OpenBookQA

SocialIQA

3000

2500

SNR = 5.450.143/0.026

SNR = 5.430.056/0.010 CommonsenseQA

SNR = 5.120.086/0.017

SNR = 4.440.026/0.006

3000

3000

2000

2000

2000

1500

2000

1000

# Samples

# Samples

# Samples

# Samples

1000

1000

1000

500

0

0

0

0

0.45 0.50 0.55 0.60 0.65 Decision Accuracy at 300M (Sampled from Final 5 Ckpts)

0.65 0.70 0.75 0.80 0.85 Decision Accuracy at 300M (Sampled from Final 5 Ckpts)

0.60 0.65 0.70 0.75 0.80 Decision Accuracy at 300M (Sampled from Final 5 Ckpts)

0.65 0.70 0.75 0.80 0.85 Decision Accuracy at 300M (Sampled from Final 5 Ckpts)

PIQA

WinoGrande

2000

SNR = 3.290.013/0.004

SNR = 2.320.018/0.008

2500

1500

2000

1500

1000

1000

# Samples

# Samples

500

500

0

0

0.60 0.65 0.70 0.75 0.80 Decision Accuracy at 300M (Sampled from Final 5 Ckpts)

0.50 0.55 0.60 0.65 Decision Accuracy at 300M (Sampled from Final 5 Ckpts)

Figure 8: As the benchmark’s signal-to-noise ratio increases (across histograms), decision accuracy (from 300M to 1B scale) not only increases but becomes more consistent. We test this by resampling decision accuracy for combinations among last 5 checkpoints of the small and large models, respec- tively, since noise in the results of either size can change rankings. Note how CSQA and MMLU have similar signal (Rel. Dispersion = 0.056 vs 0.054) but different noise (Rel. Std. = 0.01 vs. 0.004).

from OLMo 2 [42]. Notably, all tasks use few-shot examples and we evaluate MCQA benchmarks in both the rank choice (RC) and multiple choice (MC) setting, since our small (≤1B parameter) models show random-chance performance on MCQA benchmarks.

来自 OLMo 2 [42]。值得注意的是，所有任务都使用少样本示例，并且我们在排名选择 (RC) 和多项选择 (MC) 设置中评估 MCQA 基准，因为我们的小型（≤1B 参数）模型在 MCQA 基准上显示了随机机会性能。

Knowledge QA. MMLU [23], ARC [11], BoolQ [10], CSQA [59], OBQA [39], PiQA [4], SocialIQA [53], HellaSwag [69], WinoGrande [52], DROP [16], CoQA [48], Jeopardy [61], NaturalQs [28], SQuAD [47], TriviaQA [26], MedMCQA [43], MMLU Pro [64], AGI Eval [70], GPQA [49]

知识质量保证。 MMLU [23]、ARC [11]、BoolQ [10]、CSQA [59]、OBQA [39]、PiQA [4]、SocialIQA [53]、HellaSwag [69]、WinoGrande [52]、DROP [16]、CoQA [48]、Jeopardy [61]、NaturalQs [28]、SQuAD [47]、TriviaQA [26]、MedMCQA [43]、MMLU Pro [64]、AGI 评估 [70]、GPQA [49]

Math. GSM [12], GSM Plus [46], GSM Symbolic [41], Minerva [30]

Code. HumanEval [8], HumanEval+ [34], MBPP [1], MBPP+ [34]

Using strong LLMs have become a tool for augmenting existing benchmarks with more difficult questions or answer choices [64] and re-evaluating benchmark quality [62], and may provide a cheap method for improving signal. To test this, we add an additional synthetic benchmark:

使用强大的法学硕士已成为通过更困难的问题或答案选择来增强现有基准的工具[64]和重新评估基准质量[62]，并且可能提供一种改善信号的廉价方法。为了测试这一点，我们添加了一个额外的综合基准：

Autobencher. To test whether fully generated benchmarks can act as an adequate development benchmark, we generate a dataset of 30K MCQA questions using Autobencher [32]. Autobencher iteratively mines for Wikipedia articles and uses a strong LM to generate and prune questions based on saliency, novelty and difficulty constraints.

自动基准测试仪。为了测试完全生成的基准是否可以作为足够的开发基准，我们使用 Autobencher [32] 生成了包含 30K MCQA 问题的数据集。 Autobencher 迭代地挖掘维基百科文章，并使用强大的 LM 根据显着性、新颖性和难度约束来生成和修剪问题。

B Full Results · 完整结果

B.1 Noise measures the reliability of decision accuracy.

As discussed in §3.1, the checkpoint-to-checkpoint noise can change the ranking of models, which may effect the decision accuracy we observe by only evaluating the final DataDecide model. To measure the impact of checkpoint-to-checkpoint noise on decision accuracy, we can estimate the distribution of possible decision accuracies given the step to step noise. To do this, we sample one of the final 5 checkpoints for both the small and large model, and repeatedly sample to estimate the

正如第 3.1 节中所讨论的，检查点到检查点的噪声可以改变模型的排名，这可能会影响我们仅通过评估最终 DataDecide 模型观察到的决策准确性。为了衡量检查点到检查点噪声对决策准确性的影响，我们可以在给定步长噪声的情况下估计可能的决策准确性的分布。为此，我们对小型模型和大型模型的最后 5 个检查点之一进行采样，并重复采样以估计

21

<!-- page 22 of 35 -->

Signal-to-Noise Ratio at 1B-5xC

Decision Accuracy (150M-5xC to 1B-5xC)

Scaling Law Std. Dev. at 13B

OLMES Core 9

HellaSwag

0.0%

ARC Easy

PIQA

ARC Easy

MMLU

ARC Easy

20

WinoGrande

CommonsenseQA

AutoBencher

90%

1.0%

MMLU ARC Challenge

SocialIQA

ARC Challenge

AutoBencher

OpenBookQA

AutoBencher

2.0%

15

BoolQ

80%

CommonsenseQA

MMLU ARC Challenge

3.0%

HellaSwag

PIQA

HellaSwag

OpenBookQA

10

4.0%

70%

CommonsenseQA

OLMES Core 9

5.0%

Decision Accuracy

OLMES Core 9

Signal-to-Noise Ratio

SocialIQA WinoGrande

Std. Dev. of Pred. Error

60%

5

PIQA

6.0%

SocialIQA

OpenBookQA

7.0%

BoolQ

BoolQ

50%

WinoGrande

0

100 1000 10000 # Instances

100 1000 10000 # Instances

100 1000 10000 # Instances

Figure 9: Signal-to-noise ratio, decision accuracy, and scaling law prediction error for randomly sampled subsets of instances for 6 development benchmarks. A large sample size alone does not improve signal-to-noise ratio. For example, a 1000 question subset of ARC Easy has a higher decision accuracy than MMLU despite having 90% fewer instances.

distribution. A wider distribution would indicate that one should be less confident in the decision accuracy.

分配。更广泛的分布表明人们应该对决策的准确性不太有信心。

We show the distribution of decision accuracies for 10K random samples in Figure 8. For tasks with a higher signal-to-noise ratio, the sampled decision accuracy distribution has a higher mean and lower variance. Additionally, we find that tasks with similar signal, but different noise (e.g., CSQA and MMLU, where CSQA has higher noise), the tasks with lower noise also have a lower variance of sampled decision accuracy distribution.

我们在图 8 中显示了 10K 随机样本的决策精度分布。对于具有较高信噪比的任务，采样的决策精度分布具有较高的均值和较低的方差。此外，我们发现具有相似信号但不同噪声的任务（例如，CSQA 和 MMLU，其中 CSQA 具有较高的噪声），噪声较低的任务的采样决策精度分布的方差也较低。

B.2 Increasing benchmark size has diminishing returns

Setup. One intuitive way to reduce modeling noise is to increase the size of the benchmark, while this is expensive in practice, recent work has given LLMs access to privileged information to generate distractor options or full benchmarks [32, 64]. To test the impact of sample size on modeling noise, we use the existing set of benchmarks, select a random sample of instances and recalculate SNR, decision accuracy and scaling law error. To test the limits of synthetic benchmarks, we use our version of AutoBencher, which has 33K instances, or 2x more test instances than the next largest benchmark in our dataset (MMLU).

设置。减少建模噪音的一种直观方法是增加基准的大小，虽然这在实践中成本高昂，但最近的工作使法学硕士能够访问特权信息来生成干扰项选项或完整基准 [32, 64]。为了测试样本大小对建模噪声的影响，我们使用现有的一组基准，选择实例的随机样本并重新计算 SNR、决策准确性和缩放法则误差。为了测试综合基准测试的极限，我们使用我们的 AutoBencher 版本，它有 33K 个实例，或者说是我们数据集中第二大基准测试实例 (MMLU) 的两倍多。

Results. Figure 9 shows how each metric improves as the number of instances increases. Initially, all benchmarks benefit from more samples (up until ∼1K samples) as expected. However, we find dimishing returns for some benchmarks after only 1K instances, in particular the signal-to- noise ratio for AutoBencher shows an inflection point at around 2K instances. This is due to the AutoBencher having high noise, as shown by the scaling law standard deviation (right figure) – despite having the largest sample size, AutoBencher has the highest checkpoint-to-checkpoint noise. In fact, the 300 instance subset of ARC-Easy has lower noise than the full 30K instance AutoBench. As using LLMs as part of benchmark construction has become a more popular method of constructing benchmarks, a high quality, small benchmark can actually show a less noisy signal.

结果。图 9 显示了每个指标如何随着实例数量的增加而改进。最初，所有基准测试都受益于更多样本（最多 ∼1K 样本），如预期的那样。然而，我们发现一些基准测试仅在 1K 个实例后回报就会递减，特别是 AutoBencher 的信噪比在大约 2K 个实例时显示出拐点。这是因为 AutoBencher 具有高噪声，如缩放定律标准差（右图）所示 - 尽管 AutoBencher 具有最大的样本量，但检查点到检查点的噪声最高。事实上，ARC-Easy 的 300 个实例子集的噪音比完整的 30K 实例 AutoBench 低。由于使用 LLM 作为基准构建的一部分已成为构建基准的更流行的方法，因此高质量、小型基准实际上可以显示噪音较小的信号。

B.3 Signal-to-Noise Ratio at Large (>32B) Scales

Setup. For models larger than the DataDecide scale (1B-100B), we can rely on the signal-to-noise ratio directly to indicate development benchmarks which may not be useful. We estimate the signal- to-noise ratio at the compute scales used to train the OLMo 2 models: 1.5B-4T, 7B-4T, 13B-5T and 32B-6T. For noise, we use the final 30 intermediate checkpoints, one checkpoint for every 1000 training steps until the end of training. For signal, we do not have access to different data recepies trained on the same model, so instead we use a population of open-weight base models trained to similar compute budget as the OLMo 2 models. We use models trained using ±10% of the estimated FLOPs, which results in a population of at least 8 models for each size.

设置。对于大于 DataDecide 规模（1B-100B）的模型，我们可以直接依靠信噪比来指示可能没有用的开发基准。我们估计了用于训练 OLMo 2 模型的计算规模的信噪比：1.5B-4T、7B-4T、13B-5T 和 32B-6T。对于噪声，我们使用最后 30 个中间检查点，每 1000 个训练步骤一个检查点，直到训练结束。对于信号，我们无法访问在同一模型上训练的不同数据接收，因此我们使用一组开放权重基础模型，训练其计算预算与 OLMo 2 模型相似。我们使用使用估计 FLOP 的 ±10% 进行训练的模型，这导致每个尺寸至少有 8 个模型。

Results. Table 4 reports the SNR for each compute budget, sorted by SNR at the 1.5B-4T model scale. SNR can indicate when benchmarks saturated, for example ARC Easy and SocialIQA have high SNR at 1.5B-4T, but low SNR at 32B-6T: 7.89 to 5.10 and 8.73 to 1.95 respectively. For these

结果。表 4 报告了每个计算预算的 SNR，按 1.5B-4T 模型规模的 SNR 排序。 SNR 可以指示基准何时饱和，例如 ARC Easy 和 SocialIQA 在 1.5B-4T 时具有高 SNR，但在 32B-6T 时具有低 SNR：分别为 7.89 至 5.10 和 8.73 至 1.95。对于这些

22

<!-- page 23 of 35 -->

Table 4: Signal-to-noise ratio for language model development benchmarks for the compute budgets of the OLMo 2 family [42]. For benchmarks measuring a similar ability, we recommend using benchmarks with a higher signal-to-noise ratio ratio for a particular model scale. Performance on all models is shown in Figure 12.

Model Size → 1.5B-4T 7B-4T 13B-5T 32B-6T Compute → 2·1022 FLOPs 1.6·1023 FLOPs 3.9·1023 FLOPs 1.2·1024 FLOPs Benchmark ↓ SNRSignal/Noise SNRSignal/Noise SNRSignal/Noise SNRSignal/Noise

模型大小 → 1.5B-4T 7B-4T 13B-5T 32B-6T 计算 → 2·1022 FLOPs 1.6·1023 FLOPs 3.9·1023 FLOPs 1.2·1024 FLOPs 基准 ↓ SNRSignal/Noise SNRSignal/Noise SNRSignal/Noise SNRSignal/Noise

Knowledge QA Tasks HellaSwag 39.770.180/0.005 23.940.061/0.003 17.810.054/0.003 8.200.028/0.003 TriviaQA 28.150.411/0.015 47.030.135/0.003 60.370.141/0.002 27.190.064/0.002 Jeopardy 23.660.374/0.016 14.380.082/0.006 18.490.084/0.005 8.000.032/0.004 OLMES Gen 19.340.247/0.013 32.580.129/0.004 4.190.092/0.022 1.060.048/0.046 OLMES Core 9 19.110.118/0.006 9.610.039/0.004 7.130.030/0.004 8.160.027/0.003 AutoBencher 17.620.264/0.015 11.420.102/0.009 8.230.105/0.013 3.730.050/0.014 MMLU Pro 16.280.246/0.015 17.440.168/0.010 9.340.098/0.010 15.040.136/0.009 MMLU 14.520.139/0.010 3.390.078/0.023 7.510.044/0.006 5.190.061/0.012 PIQA 14.230.058/0.004 5.310.023/0.004 5.520.023/0.004 4.970.015/0.003 WinoGrande 14.120.118/0.008 7.350.062/0.008 7.680.070/0.009 6.600.046/0.007 CommonsenseQA 12.170.120/0.010 5.660.033/0.006 2.690.022/0.008 7.050.039/0.006 DROP 10.790.337/0.031 20.790.262/0.013 12.190.226/0.019 9.010.143/0.016 ARC Challenge 9.410.193/0.021 5.850.081/0.014 2.320.033/0.014 4.740.064/0.014 SocialIQA 8.730.119/0.014 5.150.049/0.010 1.690.020/0.012 1.950.026/0.013 MedMCQA 8.590.106/0.012 5.790.051/0.009 7.700.060/0.008 4.000.041/0.010 ARC Easy 7.890.102/0.013 5.770.035/0.006 3.940.018/0.004 5.100.018/0.004 SQuAD 6.110.090/0.015 9.760.061/0.006 10.450.044/0.004 3.920.027/0.007 AGI Eval 5.310.105/0.020 4.230.076/0.018 2.740.050/0.018 5.400.062/0.012 BoolQ 4.870.116/0.024 2.990.048/0.016 1.180.016/0.013 2.670.016/0.006 OpenBookQA 4.820.145/0.030 2.130.053/0.025 2.420.048/0.020 3.050.063/0.021

Math Tasks GSM+ 8.060.610/0.076 13.070.500/0.038 8.550.299/0.035 8.420.199/0.024 GSM Symbolic P1 7.180.831/0.116 4.850.677/0.140 6.540.450/0.069 5.310.277/0.052 GSM8K 3.830.587/0.153 8.210.434/0.053 6.980.255/0.037 6.610.160/0.024 GSM Symbolic P2 3.620.805/0.222 2.980.769/0.258 3.390.560/0.165 4.670.468/0.100 GSM Symbolic 3.050.662/0.217 8.940.527/0.059 6.610.283/0.043 4.290.134/0.031 Minerva MATH 2.280.568/0.250 9.320.643/0.069 7.480.567/0.076 10.190.409/0.040 Minerva MATH 500 0.910.491/0.539 4.450.748/0.168 4.440.647/0.146 4.300.383/0.089

Code Tasks HumanEval+ 3.700.482/0.130 7.180.432/0.060 8.470.377/0.045 3.340.131/0.039 HumanEval 3.640.452/0.124 6.250.395/0.063 5.180.314/0.061 3.190.117/0.037 MBPP+ 0.880.207/0.235 3.600.302/0.084 4.720.265/0.056 2.940.137/0.047 MBPP 0.880.221/0.251 5.090.382/0.075 4.520.255/0.057 3.570.167/0.047

Multi-task Averages Knowledge Tasks 17.700.146/0.008 1.610.080/0.049 9.820.048/0.005 1.030.058/0.056 OLMES + Gen 17.350.143/0.008 2.650.074/0.028 9.520.045/0.005 0.930.052/0.056 All Tasks 13.920.152/0.011 3.680.128/0.035 9.260.055/0.006 2.940.075/0.026 Math Tasks 5.780.656/0.113 11.720.580/0.050 5.060.384/0.076 7.870.253/0.032 Code Tasks 3.280.333/0.102 8.200.371/0.045 8.870.308/0.035 5.550.126/0.023

benchmarks, they have less powerful comparisons at larger sizes. SNR also indicates when particular benchmarks become useful. For example, Minerva MATH 500 has the lowest SNR of all tasks at 1.5B-4T (SNR = 0.91) but much higher SNR already at 7B-4T (SNR = 4.45).

基准，它们在较大尺寸下的比较效果较差。 SNR 还表明特定基准何时变得有用。例如，Minerva MATH 500 在 1.5B-4T 时具有所有任务中最低的 SNR（SNR = 0.91），但在 7B-4T 时 SNR 已经高得多（SNR = 4.45）。

Additionally, some individual tasks show better SNR than mutli-task averages. For the OLMES Core 9 average, HellaSwag has higher SNR at all model sizes. For OLMES Gen, TriviaQA has higher SNR at all model sizes. In cases where the SNR of the mutli-task average is low, like the OLMES Average, we recommend comparing models based on individual, high SNR tasks.

此外，某些单独任务的 SNR 优于多任务平均值。对于 OLMES Core 9 平均值来说，HellaSwag 在所有型号尺寸上都具有更高的 SNR。对于 OLMES Gen，TriviaQA 在所有模型尺寸上都具有更高的 SNR。如果多任务平均值的 SNR 较低（例如 OLMES 平均值），我们建议比较基于单个高 SNR 任务的模型。

C Additional Results · 补充结果

We include for our core experiments across all benchmarks we study:

23

<!-- page 24 of 35 -->

Rel. Dispersion

Rel. Dispersion

Rel. Std. Dev.

Rel. Std. Dev.

1.0

1.0

1.0

1.0

ARC-E

ARC-E

ARC-E

ARC-E

ARC-E

ARC-E

ARC-E

ARC-E

ARC-E

ARC-E

ARC-E

ARC-E

HS

HS

HS

HS

ARC-E

ARC-E

ARC-E

ARC-E

MMLU R = 0.754 ± 0.008 R² = 0.569

MMLU R = 0.754 ± 0.008 R² = 0.569

MMLU R = 0.752 ± 0.008 R² = 0.566

MMLU R = 0.752 ± 0.008 R² = 0.566

ARC-E

ARC-E

ARC-E

ARC-E

MMLU ARC-C

MMLU ARC-C

MMLU ARC-C

MMLU ARC-C

ARC-E

ARC-E

ARC-E

ARC-E

HS

HS

HS

HS

MMLU ARC-C

MMLU ARC-C

MMLU ARC-C

MMLU ARC-C

MMLU ARC-C

MMLU ARC-C

MMLU ARC-C

MMLU ARC-C

0.9

0.9

0.9

0.9

MMLU

MMLU

MMLU

MMLU

ARC-C

ARC-C

ARC-C

ARC-C

ARC-C

ARC-C

MMLU

MMLU

MMLU ARC-C

MMLU ARC-C

HS

HS

HS

HS

ARC-C

ARC-C

ARC-C

ARC-C

0.8

0.8

0.8

0.8

PIQA

PIQA

PIQA

PIQA

CSQA

CSQA

CSQA

CSQA

WinoG

WinoG

WinoG

WinoG

CSQA

CSQA

CSQA

CSQA

WinoG

OBQA PIQA

WinoG

OBQA PIQA

WinoG

OBQA PIQA

WinoG

OBQA PIQA

CSQA

CSQA

CSQA

CSQA

PIQA

PIQA

PIQA

PIQA

OBQA PIQA

OBQA PIQA

BoolQ

BoolQ

BoolQ

BoolQ

OBQA PIQA SocIQA

OBQA PIQA SocIQA

SocIQA

SocIQA

OBQA PIQA

OBQA PIQA

OBQA PIQA

OBQA PIQA

CSQA

CSQA

CSQA

CSQA

0.7

0.7

0.7

0.7

CSQA HS

PIQA

CSQA HS

PIQA

CSQA HS

PIQA

CSQA HS

PIQA

SocIQA

SocIQA

SocIQA

SocIQA

SocIQA

SocIQA

SocIQA

SocIQA

CSQA

CSQA

CSQA

CSQA

BoolQ

BoolQ

BoolQ

BoolQ

OBQA

OBQA

OBQA

OBQA

OBQA

OBQA

WinoG

WinoG

WinoG

WinoG

HS OBQA

HS OBQA

HS

HS

SocIQA

SocIQA

SocIQA

SocIQA

SocIQA

SocIQA

SocIQA

SocIQA

OBQA

OBQA

OBQA

OBQA

0.6

0.6

0.6

0.6

BoolQ

BoolQ

BoolQ

BoolQ

Decision Accuracy

Decision Accuracy

Decision Accuracy

Decision Accuracy

SocIQA

SocIQA

SocIQA

SocIQA

BoolQ

BoolQ

BoolQ

BoolQ

BoolQ

BoolQ

BoolQ

BoolQ

BoolQ

BoolQ

BoolQ

BoolQ

WinoG

WinoG

WinoG

WinoG

WinoG

WinoG

WinoG

WinoG

0.5

0.5

0.5

0.5

WinoG

WinoG

WinoG

WinoG

HS

HS

HS

HS

10.0 8 9 20 30 40 SNR = Data Rel. Dispersion / Step Rel. Std

10.0 8 9 20 30 40 SNR = Data Rel. Dispersion / Step Rel. Std

10.0 2 3 4 5 6 7 8 9 SNR = Data Rel. Std / Step Rel. Std

10.0 2 3 4 5 6 7 8 9 SNR = Data Rel. Std / Step Rel. Std

Rel. Mean Pairwise Distance

Interquartile Range

Distance Standard Deviation

RMS Deviation

1.0

1.0

1.0

1.0

ARC-E

ARC-E

ARC-E

ARC-E

ARC-E

ARC-E

ARC-E

ARC-E

ARC-E

ARC-E

ARC-E

ARC-E

HS

HS

HS

HS

ARC-C

ARC-C

ARC-E

ARC-E

ARC-E

ARC-E

MMLU R = 0.739 ± 0.008 R² = 0.546

MMLU R = 0.695 ± 0.010 R² = 0.484

MMLU R = 0.689 ± 0.010 R² = 0.474

MMLU R = 0.681 ± 0.010 R² = 0.463

ARC-C

ARC-C

ARC-E

ARC-E

ARC-E

ARC-E

MMLU ARC-C

MMLU ARC-C

MMLU

MMLU

ARC-E

ARC-E

ARC-E

ARC-E

HS

HS

HS

HS

MMLU ARC-C

MMLU ARC-C

MMLU

MMLU

MMLUARC-C

MMLU ARC-C

MMLU ARC-C

MMLU ARC-C

0.9

0.9

0.9

0.9

MMLU

MMLU

MMLU

MMLU

ARC-C

ARC-C

ARC-C

ARC-C

ARC-C

ARC-C

MMLU ARC-C

MMLU ARC-C

MMLU

MMLU

HS

HS

HS

HS

ARC-C

ARC-C

ARC-C

ARC-C

0.8

0.8

0.8

0.8

PIQA

PIQA

PIQA

PIQA

PIQA

PIQA

CSQA

CSQA

CSQA

CSQA

WinoG

WinoG

WinoG

WinoG

CSQA

CSQA

CSQA

CSQA

WinoG

OBQA PIQA

OBQA PIQA

WinoG

WinoG

OBQA

WinoG

OBQA

CSQA

CSQA

CSQA

CSQA

PIQA

PIQA

PIQA

PIQA

OBQA PIQA

OBQA PIQA

PIQA

PIQA

BoolQ

BoolQ

BoolQ

BoolQ

SocIQA

SocIQA

OBQA PIQA SocIQA

OBQA PIQA SocIQA

OBQA PIQA

OBQA PIQA

OBQA

OBQA

CSQA

CSQA

CSQA

CSQA

0.7

0.7

0.7

0.7

CSQA HS

PIQA

PIQA

CSQA HS

CSQA HS

PIQA

CSQA HS

PIQA

SocIQA

SocIQA

SocIQA

SocIQA

SocIQA

SocIQA

SocIQA

SocIQA

CSQA

CSQA

CSQA

CSQA

BoolQ

BoolQ

BoolQ

BoolQ

OBQA

OBQA

OBQA

OBQA

OBQA

OBQA

OBQA

OBQA

WinoG

WinoG

WinoG

WinoG

HS

HS

HS

HS

SocIQA

SocIQA

SocIQA

SocIQA

SocIQA

SocIQA

SocIQA

SocIQA

OBQA

OBQA

OBQA

OBQA

0.6

0.6

0.6

0.6

BoolQ

BoolQ

BoolQ

BoolQ

Decision Accuracy

Decision Accuracy

Decision Accuracy

Decision Accuracy

SocIQA

SocIQA

SocIQA

SocIQA

BoolQ

BoolQ

BoolQ

BoolQ

BoolQ

BoolQ

BoolQ

BoolQ

BoolQ

BoolQ

BoolQ

BoolQ

WinoG

WinoG

WinoG

WinoG

WinoG

WinoG

WinoG

WinoG

0.5

0.5

0.5

0.5

WinoG

WinoG

WinoG

WinoG

HS

HS

HS

HS

10.0 2 3 4 5 6 7 8 9 SNR = Data Rel. MPD / Step Rel. Std

10.0 3 4 5 6 7 8 9 20 SNR = Data IQR / Step Rel. Std

1.00 0.70.80.9 2.0 3.0 4.0 5.06.0 SNR = Data Dist Std / Step Rel. Std

1.00 0.80.9 2.0 3.0 4.0 5.06.07.0 SNR = Data RMS Dev / Step Rel. Std

Mean Pairwise Distance

Dispersion

Range

Quartile Deviation

1.0

1.0

1.0

1.0

ARC-E

ARC-E

ARC-E

ARC-E

ARC-E

ARC-E

ARC-E

ARC-E

ARC-E

ARC-E

ARC-E

ARC-E

HS

HS

HS

HS

ARC-C

ARC-C

ARC-C

ARC-C

ARC-E

ARC-E

ARC-E

ARC-E

MMLU R = 0.677 ± 0.010 R² = 0.459

MMLU R = 0.676 ± 0.010 R² = 0.457

MMLU R = 0.676 ± 0.010 R² = 0.457

MMLU R = 0.673 ± 0.010 R² = 0.453

ARC-C

ARC-C

ARC-C

ARC-C

ARC-E

ARC-E

ARC-E

ARC-E

MMLU

MMLU

MMLU

MMLU

ARC-E

ARC-E

ARC-E

ARC-E

HS

HS

HS

HS

MMLU

MMLU

MMLU

MMLU

MMLU ARC-C

MMLU ARC-C

MMLU ARC-C

MMLU ARC-C

0.9

0.9

0.9

0.9

MMLU

MMLU

MMLU

MMLU

ARC-C

ARC-C

ARC-C

ARC-C

ARC-C

ARC-C

ARC-C

MMLU

MMLU

MMLU

MMLU ARC-C

HS

HS

HS

HS

ARC-C

ARC-C

ARC-C

ARC-C

0.8

0.8

0.8

0.8

PIQA

PIQA

PIQA

PIQA

PIQA

PIQA

CSQA

CSQA

CSQA

CSQA

WinoG

WinoG

WinoG

WinoG

CSQA

CSQA

CSQA

CSQA

WinoG

OBQA PIQA

WinoG

OBQA

WinoG

OBQA

WinoG

OBQA PIQA

CSQA

CSQA

CSQA

CSQA

PIQA

PIQA

PIQA

PIQA

OBQA PIQA

PIQA

PIQA

PIQA

BoolQ

BoolQ

BoolQ

BoolQ

OBQAPIQA SocIQA

OBQA PIQA SocIQA

OBQA PIQA SocIQA

SocIQA

OBQA

OBQA

OBQA

OBQA PIQA

CSQA

CSQA

CSQA

CSQA

0.7

0.7

0.7

0.7

CSQA HS

PIQA

CSQA HS

PIQA

CSQA HS

PIQA

CSQA HS

PIQA

SocIQA

SocIQA

SocIQA

SocIQA

SocIQA

SocIQA

SocIQA

SocIQA

CSQA

CSQA

CSQA

CSQA

BoolQ

BoolQ

BoolQ

BoolQ

OBQA

OBQA

OBQA

OBQA

OBQA

OBQA

WinoG

WinoG

WinoG

WinoG

HS

HS OBQA

HS OBQA

HS

SocIQA

SocIQA

SocIQA

SocIQA

SocIQA

SocIQA

SocIQA

SocIQA

OBQA

OBQA

OBQA

OBQA

0.6

0.6

0.6

0.6

BoolQ

BoolQ

BoolQ

BoolQ

Decision Accuracy

Decision Accuracy

Decision Accuracy

Decision Accuracy

SocIQA

SocIQA

SocIQA

SocIQA

BoolQ

BoolQ

BoolQ

BoolQ

BoolQ

BoolQ

BoolQ

BoolQ

BoolQ

BoolQ

BoolQ

BoolQ

WinoG

WinoG

WinoG

WinoG

WinoG

WinoG

WinoG

WinoG

0.5

0.5

0.5

0.5

WinoG

WinoG

WinoG

WinoG

HS

HS

HS

HS

1.00 0.9 2.0 3.0 4.0 5.06.07.08.0 SNR = Data MPD / Step Rel. Std

10.0 4 5 6 7 8 9 20 SNR = Data Dispersion / Step Rel. Std

10.0 4 5 6 7 8 9 20 SNR = Data Range / Step Rel. Std

1.00 0.50.60.70.80.9 2.0 3.0 4.0 5.06.0 SNR = Data Quartile Dev / Step Rel. Std

Quartile Deviation

Average Absolute Deviation

Robust Range

Robust Range

1.0

1.0

1.0

1.0

ARC-E

ARC-E

ARC-E

ARC-E

ARC-E

ARC-E

ARC-E

ARC-E

ARC-E

ARC-E

ARC-E

ARC-E

HS

HS

HS

HS

ARC-C

ARC-C

ARC-C

ARC-C

ARC-E

ARC-E

ARC-E

ARC-E

MMLU R = 0.673 ± 0.010 R² = 0.453

MMLU R = 0.671 ± 0.010 R² = 0.451

MMLU R = 0.666 ± 0.010 R² = 0.444

MMLU R = 0.666 ± 0.010 R² = 0.444

ARC-C

ARC-C

ARC-C

ARC-C

ARC-E

ARC-E

ARC-E

ARC-E

MMLU

MMLU

MMLU

MMLU

ARC-E

ARC-E

ARC-E

ARC-E

HS

HS

HS

HS

MMLU

MMLU

MMLU

MMLU

MMLU ARC-C

MMLU ARC-C

MMLU ARC-C

MMLU ARC-C

0.9

0.9

0.9

0.9

MMLU

MMLU

MMLU

MMLU

ARC-C

ARC-C

ARC-C

ARC-C

ARC-C

ARC-C

ARC-C

MMLU ARC-C

MMLU

MMLU

MMLU

HS

HS

HS

HS

ARC-C

ARC-C

ARC-C

ARC-C

0.8

0.8

0.8

0.8

PIQA

PIQA

PIQA

PIQA

PIQA

PIQA

CSQA

CSQA

CSQA

CSQA

WinoG

WinoG

WinoG

WinoG

CSQA

CSQA

CSQA

CSQA

WinoG

OBQA PIQA

WinoG

OBQA PIQA

WinoG

OBQA

WinoG

OBQA

CSQA

CSQA

CSQA

CSQA

PIQA

PIQA

PIQA

PIQA

OBQA PIQA

OBQAPIQA

PIQA

PIQA

PIQA

BoolQ

BoolQ

BoolQ

BoolQ

SocIQA

SocIQA

OBQA PIQA SocIQA

OBQA PIQA SocIQA

OBQA PIQA

OBQA

OBQA

OBQA

CSQA

CSQA

CSQA

CSQA

0.7

0.7

0.7

0.7

CSQA HS

PIQA

CSQA HS

PIQA

CSQA HS

PIQA

CSQA HS

PIQA

SocIQA

SocIQA

SocIQA

SocIQA

SocIQA

SocIQA

SocIQA

SocIQA

CSQA

CSQA

CSQA

CSQA

BoolQ

BoolQ

BoolQ

BoolQ

OBQA

OBQA

OBQA

OBQA

OBQA

OBQA

OBQA

OBQA

WinoG

WinoG

WinoG

WinoG

HS

HS

HS

HS

SocIQA

SocIQA

SocIQA

SocIQA

SocIQA

SocIQA

SocIQA

SocIQA

OBQA

OBQA

OBQA

OBQA

0.6

0.6

0.6

0.6

BoolQ

BoolQ

BoolQ

BoolQ

Decision Accuracy

Decision Accuracy

Decision Accuracy

Decision Accuracy

SocIQA

SocIQA

SocIQA

SocIQA

BoolQ

BoolQ

BoolQ

BoolQ

BoolQ

BoolQ

BoolQ

BoolQ

BoolQ

BoolQ

BoolQ

BoolQ

WinoG

WinoG

WinoG

WinoG

WinoG

WinoG

WinoG

WinoG

0.5

0.5

0.5

0.5

WinoG

WinoG

WinoG

WinoG

HS

HS

HS

HS

1.00 0.50.60.70.80.9 2.0 3.0 4.0 5.06.0 SNR = Data Quartile Dev / Step Rel. Std

1.00 0.60.70.80.9 2.0 3.0 4.0 5.06.0 SNR = Data AAD / Step Rel. Std

10.0 3 4 5 6 7 8 9 20 SNR = Data Robust Range / Step Rel. Std

10.0 3 4 5 6 7 8 9 20 SNR = Data Robust Range / Step Rel. Std

Median Absolute Deviation

Median Absolute Deviation

Rel. Mean Squared Pairwise Distance

Mean Squared Pairwise Distance

1.0

1.0

1.0

1.0

ARC-E

ARC-E

ARC-E

ARC-E

ARC-E

ARC-E

ARC-E

ARC-E

ARC-E

ARC-E

ARC-E

ARC-E

HS

HS

HS

HS

ARC-C

ARC-C

ARC-C

ARC-C

ARC-E

ARC-E

ARC-E

ARC-E

MMLU R = 0.646 ± 0.011 R² = 0.417

MMLU R = 0.646 ± 0.011 R² = 0.417

MMLU R = 0.539 ± 0.013 R² = 0.291

MMLU R = 0.498 ± 0.014 R² = 0.248

ARC-C

ARC-C

ARC-C

ARC-C

ARC-E

ARC-E

ARC-E

ARC-E

MMLU

MMLU

MMLU

MMLU

ARC-E

ARC-E

ARC-E

ARC-E

HS

HS

HS

HS

MMLU

MMLU

MMLU

MMLU

MMLU ARC-C

MMLU ARC-C

MMLU ARC-C

MMLU ARC-C

0.9

0.9

0.9

0.9

MMLU

MMLU

MMLU

MMLU

ARC-C

ARC-C

ARC-C

ARC-C

ARC-C

ARC-C

ARC-C

ARC-C

MMLU

MMLU

MMLU

MMLU

HS

HS

HS

HS

ARC-C

ARC-C

ARC-C

ARC-C

0.8

0.8

0.8

0.8

PIQA

PIQA

PIQA

PIQA

CSQA

CSQA

CSQA

CSQA

WinoG

WinoG

WinoG

WinoG

CSQA

CSQA

CSQA

CSQA

OBQA PIQA

WinoG

OBQA PIQA

WinoG

WinoG

OBQA PIQA

WinoG

OBQA PIQA

CSQA

CSQA

CSQA

CSQA

PIQA

PIQA

PIQA

PIQA

OBQA PIQA

BoolQ

BoolQ

BoolQ

BoolQ

OBQA PIQA SocIQA

OBQA PIQA SocIQA

SocIQA

OBQA PIQA SocIQA

OBQA PIQA

OBQA PIQA

OBQA PIQA

OBQA PIQA

CSQA

CSQA

CSQA

CSQA

0.7

0.7

0.7

0.7

CSQA HS

PIQA

CSQA HS

PIQA

PIQA

CSQA HS

CSQA HS

PIQA

SocIQA

SocIQA

SocIQA

SocIQA

SocIQA

SocIQA

SocIQA

SocIQA

CSQA

CSQA

CSQA

CSQA

BoolQ

BoolQ

BoolQ

BoolQ

OBQA

OBQA

OBQA

OBQA

OBQA

OBQA

OBQA

OBQA

WinoG

WinoG

WinoG

WinoG

HS

HS

HS

HS

SocIQA

SocIQA

SocIQA

SocIQA

SocIQA

SocIQA

SocIQA

SocIQA

OBQA

OBQA

OBQA

OBQA

0.6

0.6

0.6

0.6

BoolQ

BoolQ

BoolQ

BoolQ

Decision Accuracy

Decision Accuracy

Decision Accuracy

Decision Accuracy

SocIQA

SocIQA

SocIQA

SocIQA

BoolQ

BoolQ

BoolQ

BoolQ

BoolQ

BoolQ

BoolQ

BoolQ

BoolQ

BoolQ

BoolQ

BoolQ

WinoG

WinoG

WinoG

WinoG

WinoG

WinoG

WinoG

WinoG

0.5

0.5

0.5

0.5

WinoG

WinoG

WinoG

WinoG

HS

HS

HS

HS

1.00 0.50.60.70.80.9 2.0 3.0 4.0 5.06.0 SNR = Data MAD / Step Rel. Std

1.00 0.50.60.70.80.9 2.0 3.0 4.0 5.06.0 SNR = Data MAD / Step Rel. Std

0.10 1.00 0.00.00.10.1 0.1 0.1 0.1 0.2 0.30.40.50.6 0.7 0.8 0.9 2.0 SNR = Data Rel. MSPD / Step Rel. Std

0.01 0.10 1.00 0.0 0.00.00.0.1 0.1 0.1 0.1 0.1 0.20.30.40.5 0.6 0.7 0.8 0.9 SNR = Data MSPD / Step Rel. Std

Gini Coefficient

Star Discrepancy (Shift+Scale)

Star Rel. Discrepancy

Dispersion (Shift+Scale)

1.0

1.0

1.0

1.0

ARC-E

ARC-E

ARC-E

ARC-E

ARC-E

ARC-E

ARC-E

ARC-E

ARC-E

ARC-E

ARC-E

ARC-E

HS

HS

HS

HS

ARC-E

ARC-E

ARC-E

ARC-E

MMLU R = 0.307 ± 0.017 R² = 0.094

MMLU R = 0.198 ± 0.018 R² = 0.039

MMLU R = 0.195 ± 0.018 R² = 0.038

MMLU R = 0.193 ± 0.018 R² = 0.037

ARC-E

ARC-E

ARC-E

ARC-E

MMLU ARC-C

MMLU ARC-C

MMLU ARC-C

MMLU ARC-C

ARC-E

ARC-E

ARC-E

ARC-E

HS

HS

HS

HS

MMLU ARC-C

MMLU ARC-C

MMLU ARC-C

MMLU ARC-C

MMLU ARC-C

MMLU ARC-C

MMLU ARC-C

MMLU ARC-C

0.9

0.9

0.9

0.9

MMLU ARC-C

MMLU ARC-C

MMLU ARC-C

MMLU ARC-C

MMLU ARC-C

MMLU ARC-C

MMLU ARC-C

MMLU ARC-C

HS

HS

HS

HS

ARC-C

ARC-C

ARC-C

ARC-C

0.8

0.8

0.8

0.8

PIQA

PIQA

PIQA

PIQA

PIQA

PIQA

PIQA

PIQA

CSQA

CSQA

CSQA

CSQA

WinoG

WinoG

WinoG

WinoG

CSQA

CSQA

CSQA

CSQA

OBQA

WinoG

OBQA

WinoG

OBQA

WinoG

OBQA

WinoG

CSQA

CSQA

CSQA

CSQA

PIQA

PIQA

PIQA

PIQA

OBQA PIQA

PIQA

PIQA

PIQA

PIQA

BoolQ

BoolQ

BoolQ

BoolQ

SocIQA

OBQA PIQA SocIQA

OBQA PIQA SocIQA

OBQA PIQA SocIQA

OBQA

OBQA

OBQA

OBQA

CSQA

CSQA

CSQA

CSQA

0.7

0.7

0.7

0.7

CSQA HS

PIQA

CSQA HS

PIQA

CSQA HS

PIQA

CSQA HS

PIQA

SocIQA

SocIQA

SocIQA

SocIQA

SocIQA

SocIQA

SocIQA

SocIQA

CSQA

CSQA

CSQA

CSQA

BoolQ

BoolQ

BoolQ

BoolQ

OBQA

OBQA

OBQA

OBQA

WinoG

WinoG

WinoG

WinoG

HS OBQA

HS OBQA

HS OBQA

HS OBQA

SocIQA

SocIQA

SocIQA

SocIQA

SocIQA

SocIQA

SocIQA

SocIQA

OBQA

OBQA

OBQA

OBQA

0.6

0.6

0.6

0.6

BoolQ

BoolQ

BoolQ

BoolQ

Decision Accuracy

Decision Accuracy

Decision Accuracy

Decision Accuracy

SocIQA

SocIQA

SocIQA

SocIQA

BoolQ

BoolQ

BoolQ

BoolQ

BoolQ

BoolQ

BoolQ

BoolQ

BoolQ

BoolQ

BoolQ

BoolQ

WinoG

WinoG

WinoG

WinoG

WinoG

WinoG

WinoG

WinoG

0.5

0.5

0.5

0.5

WinoG

WinoG

WinoG

WinoG

HS

HS

HS

HS

10.0 5 6 7 8 9 20 30 40 50 60 SNR = Data Gini / Step Rel. Std

10.0 2 3 4 5 6 7 89 20 30 40 SNR = Data Star Discrepancy / Step Rel. Std

10 100 6 789 20 30 405060708090 200 SNR = Data Star Rel. Discrepancy / Step Rel. Std

100 20 30 40 50 60708090 SNR = Data Dispersion / Step Rel. Std

Halfspace Depth

Discrepancy

Projection Depth

Star Discrepancy

1.0

1.0

1.0

1.0

ARC-E

ARC-E

ARC-E

ARC-E

ARC-E

ARC-E

ARC-E

ARC-E

ARC-E

ARC-E

ARC-E

ARC-E

HS

HS

HS

HS

ARC-E

ARC-E

ARC-E

ARC-E

MMLU R = 0.189 ± 0.018 R² = 0.036

MMLU R = 0.185 ± 0.018 R² = 0.034

MMLU R = 0.182 ± 0.018 R² = 0.033

MMLU R = 0.179 ± 0.018 R² = 0.032

ARC-E

ARC-E

ARC-E

ARC-E

MMLU ARC-C

MMLU ARC-C

MMLU ARC-C

MMLU ARC-C

ARC-E

ARC-E

ARC-E

ARC-E

HS

HS

HS

HS

MMLU ARC-C

MMLU ARC-C

MMLU ARC-C

MMLU ARC-C

MMLU ARC-C

MMLU ARC-C

MMLU ARC-C

MMLU ARC-C

0.9

0.9

0.9

0.9

MMLU ARC-C

MMLU ARC-C

MMLU ARC-C

MMLU ARC-C

MMLU ARC-C

MMLU ARC-C

MMLU ARC-C

MMLU ARC-C

HS

HS

HS

HS

ARC-C

ARC-C

ARC-C

ARC-C

0.8

0.8

0.8

0.8

PIQA

PIQA

PIQA

PIQA

PIQA

PIQA

PIQA

CSQA

CSQA

CSQA

CSQA

WinoG

WinoG

WinoG

WinoG

CSQA

CSQA

CSQA

CSQA

OBQA

WinoG

OBQA

WinoG

OBQA PIQA

WinoG

OBQA

WinoG

CSQA

CSQA

CSQA

CSQA

PIQA

PIQA

PIQA

PIQA

OBQA PIQA

PIQA

PIQA

PIQA

PIQA

BoolQ

BoolQ

BoolQ

BoolQ

SocIQA

OBQA PIQA SocIQA

OBQA PIQA SocIQA

OBQA PIQA SocIQA

OBQA

OBQA

OBQA

OBQA

CSQA

CSQA

CSQA

CSQA

0.7

0.7

0.7

0.7

CSQA HS

PIQA

CSQA HS

PIQA

CSQA HS

PIQA

CSQA HS

PIQA

SocIQA

SocIQA

SocIQA

SocIQA

SocIQA

SocIQA

SocIQA

SocIQA

CSQA

CSQA

CSQA

CSQA

BoolQ

BoolQ

BoolQ

BoolQ

OBQA

OBQA

OBQA

OBQA

WinoG

WinoG

WinoG

WinoG

HS OBQA

HS OBQA

HS OBQA

HS OBQA

SocIQA

SocIQA

SocIQA

SocIQA

SocIQA

SocIQA

SocIQA

SocIQA

OBQA

OBQA

OBQA

OBQA

0.6

0.6

0.6

0.6

BoolQ

BoolQ

BoolQ

BoolQ

Decision Accuracy

Decision Accuracy

Decision Accuracy

Decision Accuracy

SocIQA

SocIQA

SocIQA

SocIQA

BoolQ

BoolQ

BoolQ

BoolQ

BoolQ

BoolQ

BoolQ

BoolQ

BoolQ

BoolQ

BoolQ

BoolQ

WinoG

WinoG

WinoG

WinoG

WinoG

WinoG

WinoG

WinoG

0.5

0.5

0.5

0.5

WinoG

WinoG

WinoG

WinoG

Model Size 60M 90M 150M

300M 530M 750M

HS

HS

HS

HS

10 100 4 5 6 789 20 30 405060708090 200 SNR = Data Halfspace Depth / Step Rel. Std

1.0 10.0 1 2 3 4 5 6 7 89 20 SNR = Data Discrepancy / Step Rel. Std

10 100 4 56789 20 30405060708090 200300400 500 600 SNR = Data Projection Depth / Step Rel. Std

10.0 4 5 6 7 8 9 20 30 40 50 SNR = Data Star Discrepancy / Step Rel. Std

Figure 10: Correlation between decision accuracy and variants of signal-to-noise ratio, using different measures of signal. To pick the measure of signal, we use the metric which is most predictive of decision accuracy.

24

<!-- page 25 of 35 -->

Noise

100%

GSM Symbolic P1

DROP

BBH

Minerva MATH

GSM+

HumanEval

MedMCQA

Math Tasks

ARC Challenge

MBPP

Code Tasks

WinoGrande

10%

GSM8K

ARC Easy

MMLU Pro AGI Eval

AutoBencher

OLMES Core 9

OLMES Gen MMLU

SQuAD

OpenBookQA

MBPP+

TriviaQA

HumanEval+

SocialIQA

Knowledge Tasks

BoolQ

All Tasks

PIQA

1%

CommonsenseQA

Jeopardy

Scaling Law Prediction Error

0.1%

HellaSwag

R = 0.653 ± 0.068 R² = 0.426

0.01 0.1 Rel. Std.(final n train checkpoints)

Figure 11: Scaled-up version of the Figure 3 in §4.2 with labels on each task.

25

<!-- page 26 of 35 -->

ARC Challenge

ARC Easy

BoolQ

CommonsenseQA

60M-6B 90M-9B 150M-15B 300M-30B 530M-53B 1B-100B

1.5B-4T

7B-4T 13B-5T 32B-6T

60M-6B 90M-9B 150M-15B 300M-30B 530M-53B 1B-100B

1.5B-4T

7B-4T 13B-5T 32B-6T

60M-6B 90M-9B 150M-15B 300M-30B 530M-53B 1B-100B

1.5B-4T

7B-4T 13B-5T 32B-6T

60M-6B 90M-9B 150M-15B 300M-30B 530M-53B 1B-100B

1.5B-4T

7B-4T 13B-5T 32B-6T

0.7

0.9

0.8

0.8

0.7

0.8

0.6

0.6

0.7

0.5

0.6

0.5

0.6

0.4

0.4

Primary Score

Primary Score

Primary Score

Primary Score

0.5

0.4

0.3

0.3

0.4

0.2

0.2

1018 1019 1020 1021 1022 1023 1024

1018 1019 1020 1021 1022 1023 1024

1018 1019 1020 1021 1022 1023 1024

1018 1019 1020 1021 1022 1023 1024

Compute (Est. FLOPs)

Compute (Est. FLOPs)

Compute (Est. FLOPs)

Compute (Est. FLOPs)

HellaSwag

OpenBookQA

PIQA

SocialIQA

60M-6B 90M-9B 150M-15B 300M-30B 530M-53B 1B-100B

1.5B-4T

7B-4T 13B-5T 32B-6T

60M-6B 90M-9B 150M-15B 300M-30B 530M-53B 1B-100B

1.5B-4T

7B-4T 13B-5T 32B-6T

60M-6B 90M-9B 150M-15B 300M-30B 530M-53B 1B-100B

1.5B-4T

7B-4T 13B-5T 32B-6T

60M-6B 90M-9B 150M-15B 300M-30B 530M-53B 1B-100B

1.5B-4T

7B-4T 13B-5T 32B-6T

0.7

0.9

0.7

0.8

0.6

0.8

0.7

0.6

0.5

0.6

0.7

0.4

0.5

0.5

Primary Score

Primary Score

Primary Score

Primary Score

0.6

0.4

0.3

0.4

0.3

0.2

0.5

1018 1019 1020 1021 1022 1023 1024

1018 1019 1020 1021 1022 1023 1024

1018 1019 1020 1021 1022 1023 1024

1018 1019 1020 1021 1022 1023 1024

Compute (Est. FLOPs)

Compute (Est. FLOPs)

Compute (Est. FLOPs)

Compute (Est. FLOPs)

WinoGrande

DROP

GSM8K

Jeopardy

60M-6B 90M-9B 150M-15B 300M-30B 530M-53B 1B-100B

1.5B-4T

7B-4T 13B-5T 32B-6T

60M-6B 90M-9B 150M-15B 300M-30B 530M-53B 1B-100B

1.5B-4T

7B-4T 13B-5T 32B-6T

60M-6B 90M-9B 150M-15B 300M-30B 530M-53B 1B-100B

1.5B-4T

7B-4T 13B-5T 32B-6T

60M-6B 90M-9B 150M-15B 300M-30B 530M-53B 1B-100B

1.5B-4T

7B-4T 13B-5T 32B-6T

0.8

0.8

0.8

0.8

0.6

0.6

0.6

0.7

0.4

0.4

0.4

0.6

Primary Score

Primary Score

Primary Score

Primary Score

0.2

0.2

0.2

0.5

0.0

0.0

0.0

1018 1019 1020 1021 1022 1023 1024

1018 1019 1020 1021 1022 1023 1024

1018 1019 1020 1021 1022 1023 1024

1018 1019 1020 1021 1022 1023 1024

Compute (Est. FLOPs)

Compute (Est. FLOPs)

Compute (Est. FLOPs)

Compute (Est. FLOPs)

SQuAD

TriviaQA

MBPP

MBPP+

60M-6B 90M-9B 150M-15B 300M-30B 530M-53B 1B-100B

1.5B-4T

7B-4T 13B-5T 32B-6T

60M-6B 90M-9B 150M-15B 300M-30B 530M-53B 1B-100B

1.5B-4T

7B-4T 13B-5T 32B-6T

60M-6B 90M-9B 150M-15B 300M-30B 530M-53B 1B-100B

1.5B-4T

7B-4T 13B-5T 32B-6T

60M-6B 90M-9B 150M-15B 300M-30B 530M-53B 1B-100B

1.5B-4T

7B-4T 13B-5T 32B-6T

0.8

0.8

0.6

0.6

0.6

0.6

0.4

0.4

0.4

0.4

Primary Score

Primary Score

Primary Score

Primary Score

0.2

0.2

0.2

0.2

0.0

0.0

0.0

0.0

1018 1019 1020 1021 1022 1023 1024

1018 1019 1020 1021 1022 1023 1024

1018 1019 1020 1021 1022 1023 1024

1018 1019 1020 1021 1022 1023 1024

Compute (Est. FLOPs)

Compute (Est. FLOPs)

Compute (Est. FLOPs)

Compute (Est. FLOPs)

HumanEval

HumanEval+

AutoBencher

GSM+

60M-6B 90M-9B 150M-15B 300M-30B 530M-53B 1B-100B

1.5B-4T

7B-4T 13B-5T 32B-6T

60M-6B 90M-9B 150M-15B 300M-30B 530M-53B 1B-100B

1.5B-4T

7B-4T 13B-5T 32B-6T

60M-6B 90M-9B 150M-15B 300M-30B 530M-53B 1B-100B

1.5B-4T

7B-4T 13B-5T 32B-6T

60M-6B 90M-9B 150M-15B 300M-30B 530M-53B 1B-100B

1.5B-4T

7B-4T 13B-5T 32B-6T

1.0

0.6

0.6

0.8

0.8

0.5

0.6

0.6

0.4

0.4

0.4

0.4

0.3

Primary Score

Primary Score

Primary Score

Primary Score

0.2

0.2

0.2

0.2

0.0

0.0

0.0

0.1

1018 1019 1020 1021 1022 1023 1024

1018 1019 1020 1021 1022 1023 1024

1018 1019 1020 1021 1022 1023 1024

1018 1019 1020 1021 1022 1023 1024

Compute (Est. FLOPs)

Compute (Est. FLOPs)

Compute (Est. FLOPs)

Compute (Est. FLOPs)

GSM Symbolic P1

GSM Symbolic P2

MedMCQA

Minerva MATH 500

60M-6B 90M-9B 150M-15B 300M-30B 530M-53B 1B-100B

1.5B-4T

7B-4T 13B-5T 32B-6T

60M-6B 90M-9B 150M-15B 300M-30B 530M-53B 1B-100B

1.5B-4T

7B-4T 13B-5T 32B-6T

60M-6B 90M-9B 150M-15B 300M-30B 530M-53B 1B-100B

1.5B-4T

7B-4T 13B-5T 32B-6T

60M-6B 90M-9B 150M-15B 300M-30B 530M-53B 1B-100B

1.5B-4T

7B-4T 13B-5T 32B-6T

0.50

0.6

0.8

0.6

0.5

0.45

Compute Training Budgets DataDecide Model Observational Model

0.5

0.6

0.4

0.4

0.40

0.3

0.4

0.3

0.35

0.2

0.2

Primary Score

Primary Score

Primary Score

Primary Score

0.30

0.2

0.1

0.1

0.25

0.0

0.0

0.0

1018 1019 1020 1021 1022 1023 1024

1018 1019 1020 1021 1022 1023 1024

1018 1019 1020 1021 1022 1023 1024

1018 1019 1020 1021 1022 1023 1024

Compute (Est. FLOPs)

Compute (Est. FLOPs)

Compute (Est. FLOPs)

Compute (Est. FLOPs)

Figure 12: Performance of language models from 60M parameters to 32B parameters, which we use to measure spread at different training budgets in Table 4. For our core experiments, we use the DataDecide models to measures spread, and at large scales, we use external models trained at similar compute budgets.

26

<!-- page 27 of 35 -->

PIQA

0.002 TriviaQA

0.003 OLMES Core 9

0.003

0.85

0.84

0.003 0.004 HellaSwag

0.002

0.8

0.004

0.75

0.003

0.003

0.004 0.004

0.80

0.82

0.004

0.7

0.80

0.70

0.75

0.6

Primary Score

Primary Score

Primary Score

Primary Score

0.78

0.70

0.65

0.004

0.006

0.005

0.015

0.5

0.76

0K 10K 20K 30K Final 30K Training Steps

0K 10K 20K 30K Final 30K Training Steps

0K 10K 20K 30K Final 30K Training Steps

0K 10K 20K 30K Final 30K Training Steps

CommonsenseQA

0.90

0.90

0.800

0.006 BoolQ

0.008 0.006

0.005 0.004 ARC Easy

0.005 0.004 Jeopardy

0.775

0.85

0.016 0.014

0.8

0.85

0.006

0.006

0.006

0.750

0.80

0.80

0.725

0.7

0.75

Primary Score

Primary Score

Primary Score

Primary Score

0.700

0.75

0.013

0.016

0.70

0.010

0.6

0.024

0.675

0K 10K 20K 30K Final 30K Training Steps

0K 10K 20K 30K Final 30K Training Steps

0K 10K 20K 30K Final 30K Training Steps

0K 10K 20K 30K Final 30K Training Steps

SQuAD

WinoGrande

MedMCQA

0.009 MMLU Pro

0.425

0.90

0.007

0.007

0.011

0.400

0.25

0.80

0.006 0.004

0.009

0.008

0.011

0.85

0.375

0.010

0.009

0.009

0.75

0.20

0.80

0.350

Primary Score

Primary Score

Primary Score

Primary Score

0.325

0.70

0.75

0.015

0.15

0.009

0.013

0.015

0.300

0.70

0K 10K 20K 30K Final 30K Training Steps

0K 10K 20K 30K Final 30K Training Steps

0K 10K 20K 30K Final 30K Training Steps

0K 10K 20K 30K Final 30K Training Steps

AGI Eval

MMLU

BBH

0.650

0.013

0.012

0.012

0.6

0.012 0.014 SocialIQA

0.40

0.55

0.625

0.010

0.016

0.5

0.50

0.600

0.024 0.006

0.35

0.018 0.019

0.020

0.575

0.4

0.45

Primary Score

Primary Score

Primary Score

Primary Score

0.30

0.550

0.014

0.40

0.3

0.047

0.010

0.020

0K 10K 20K 30K Final 30K Training Steps

0K 10K 20K 30K Final 30K Training Steps

0K 10K 20K 30K Final 30K Training Steps

0K 10K 20K 30K Final 30K Training Steps

ARC Challenge

DROP

OpenBookQA

0.70

0.70

0.014 AutoBencher

0.016

0.55

0.6

0.021

0.65

0.65

0.50

0.009 0.013

0.014 0.015 0.014

0.025 0.020

0.019

0.5

0.60

0.60

0.013

0.45

0.55

0.4

0.55

0.50

Primary Score

Primary Score

Primary Score

Primary Score

0.40

0.031

0.3

0.021

0.015

0.032

0.45

0.50

0.35

0K 10K 20K 30K Final 30K Training Steps

0K 10K 20K 30K Final 30K Training Steps

0K 10K 20K 30K Final 30K Training Steps

0K 10K 20K 30K Final 30K Training Steps

GSM+

GSM8K

GSM Symbolic

HumanEval

0.6

0.4

0.037

0.024

0.025

0.032

0.5

0.4

0.3

0.4

0.4

0.062

0.037

0.3

0.036

0.044

0.3

0.2

0.064

0.054

0.2

0.039

0.2

0.060

0.2

Primary Score

Primary Score

Primary Score

Primary Score

0.1

0.1

0.1

0.126

0.221

0.156

0.077

0.0

0.0

0K 10K 20K 30K Final 30K Training Steps

0K 10K 20K 30K Final 30K Training Steps

0K 10K 20K 30K Final 30K Training Steps

0K 10K 20K 30K Final 30K Training Steps

0.040 HumanEval+

0.048 MBPP

0.041 Minerva MATH

0.046 OLMES Gen

0.3

0.4

0.125

0.7

0.058

0.022

0.100

0.3

0.2

0.045

0.004

0.075

0.6

0.077

0.076

0.061

0.2

0.050

0.070

0.1

Primary Score

Primary Score

Primary Score

Primary Score

0.5

0.025

0.255

0.1

0.013

0.254

0.132

0.000

0.4

0K 10K 20K 30K Final 30K Training Steps

0K 10K 20K 30K Final 30K Training Steps

0K 10K 20K 30K Final 30K Training Steps

0K 10K 20K 30K Final 30K Training Steps

MBPP+

GSM Symbolic P1

Minerva MATH 500

0.4

0.15

0.048

0.3

0.091

0.053

0.3

0.057

0.10

0.2

0.2

0.070

0.085

0.05

1B 7B 13B 32B

0.1

0.171 0.148

Primary Score

Primary Score

Primary Score

0.1

0.142

0.239

0.548

0.118

0.00

0.0

0K 10K 20K 30K Final 30K Training Steps

0K 10K 20K 30K Final 30K Training Steps

0K 10K 20K 30K Final 30K Training Steps

Figure 13: Final 30 checkpoints, each spaced 1000 training steps, for OLMo 2 1B, 7B, 13B and 32B along with the Rel. Std. Dev., which is used to estimate noise.

27

<!-- page 28 of 35 -->

TriviaQA

SQuAD

OLMES Gen

ARC Easy

0.80

0.70

SNR=27.36

SNR=23.31

SNR=22.62

SNR=20.57

0.40

0.35

0.60

0.75

0.30

0.50

0.30

0.70

0.25

0.40

0.65

0.20

0.30

0.20

Primary Metric

Primary Metric

Primary Metric

Primary Metric

0.20

0.60

0.15

0.10

0.10

0.10

0.55

0K 20K 40K 60K 80K Training Step

0K 20K 40K 60K 80K Training Step

0K 20K 40K 60K 80K Training Step

0K 20K 40K 60K 80K Training Step

Jeopardy

AutoBencher

HellaSwag

DROP

0.65

0.60

0.25

0.40

SNR=19.81

SNR=15.53

SNR=11.57

SNR=11.26

0.62

0.23

0.50

0.60

0.35

0.20

0.40

0.58

0.18

0.30

0.55

0.30

0.15

Primary Metric

Primary Metric

Primary Metric

Primary Metric

0.20

0.53

0.12

0.25

0.50

0.10

0K 20K 40K 60K 80K Training Step

0K 20K 40K 60K 80K Training Step

0K 20K 40K 60K 80K Training Step

0K 20K 40K 60K 80K Training Step

MMLU Pro

MMLU

ARC Challenge

HumanEval

0.40

0.50

SNR=10.77

SNR=9.64

SNR=6.43

SNR=5.99

0.10

0.14

0.48

0.38

0.08

0.13

0.45

0.06

0.12

0.36

0.43

0.11

0.04

0.40

0.34

Primary Metric

Primary Metric

Primary Metric

Primary Metric

0.10

0.02

0.38

0.32

0.09

0.00

0.35

0K 20K 40K 60K 80K Training Step

0K 20K 40K 60K 80K Training Step

0K 20K 40K 60K 80K Training Step

0K 20K 40K 60K 80K Training Step

CommonsenseQA

SocialIQA

HumanEval+

OLMES Core 9

0.54

SNR=5.43

SNR=5.43

SNR=5.43

SNR=5.25

0.62

0.66

0.08

0.52

0.64

0.60

0.06

0.62

0.50

0.58

0.04

0.60

0.48

Primary Metric

Primary Metric

Primary Metric

Primary Metric

0.58

0.56

0.02

0.56

0.00

0.54

0.46

0K 20K 40K 60K 80K Training Step

0K 20K 40K 60K 80K Training Step

0K 20K 40K 60K 80K Training Step

0K 20K 40K 60K 80K Training Step

WinoGrande

PIQA

BBH

MedMCQA

0.64

0.76

0.32

SNR=4.51

SNR=4.15

SNR=3.53

SNR=3.46

0.26

0.62

0.31

0.74

0.24

0.30

0.60

0.72

0.22

0.29

0.58

Primary Metric

Primary Metric

Primary Metric

Primary Metric

0.20

0.70

0.28

0.56

0K 20K 40K 60K 80K Training Step

0K 20K 40K 60K 80K Training Step

0K 20K 40K 60K 80K Training Step

0K 20K 40K 60K 80K Training Step

AGI Eval

OpenBookQA

MBPP

Minerva MATH

0.28

0.54

SNR=2.49

SNR=2.05

SNR=1.94

SNR=1.87

0.02

0.28

0.52

0.06

0.27

0.50

0.01

0.04

0.27

0.48

0.01

0.26

0.46

0.02

Primary Metric

Primary Metric

Primary Metric

Primary Metric

0.26

0.01

0.44

0.25

0.00

0K 20K 40K 60K 80K Training Step

0K 20K 40K 60K 80K Training Step

0K 20K 40K 60K 80K Training Step

0K 20K 40K 60K 80K Training Step

GSM+

MBPP+

GSM Symbolic P1

BoolQ

0.02

0.02

SNR=1.72

SNR=1.66

SNR=1.58

SNR=1.43

0.10

0.02

0.65

0.08

0.02

0.01

0.60

0.06

0.01

0.02

0.55

0.04

0.01

Primary Metric

Primary Metric

Primary Metric

Primary Metric

0.02

0.50

0.01

0.02

0.00

0K 20K 40K 60K 80K Training Step

0K 20K 40K 60K 80K Training Step

0K 20K 40K 60K 80K Training Step

0K 20K 40K 60K 80K Training Step

Minerva MATH 500

GSM Symbolic

GSM8K

GSM Symbolic P2

0.01

SNR=1.42

SNR=1.31

SNR=1.15

SNR=1.00

0.04

0.01

0.03

0.01

0.01

0.04

0.01

0.02

0.01

0.03

0.01

0.01

0.03

0.01

Primary Metric

Primary Metric

Primary Metric

Primary Metric

0.01

0.02

0.01

0.01

0K 20K 40K 60K 80K Training Step

0K 20K 40K 60K 80K Training Step

0K 20K 40K 60K 80K Training Step

0K 20K 40K 60K 80K Training Step

Figure 14: 1B-5xC training curves and final checkpoints for DataDecide models across tasks, sorted by the signal-to-noise ratio.

28

<!-- page 29 of 35 -->

Minerva MATH

MMLU

MMLU Pro

AGI Eval

0.55

0.375

0.25

0.08

0.50

error 29.6%noise

error 6.5% noise

0.350

error 3.7% noise

error 7.6% noise

0.06

0.20

0.45

0.325

0.300

0.40

0.04

0.15

0.275

0.35

Primary Score

Primary Score

Primary Score

Primary Score

0.02

0.250

0.10

0.30

0.225

Scaling Law Models Predicted 13B Model Real 13B Model Scaling Law Fit

Scaling Law Models Predicted 13B Model Real 13B Model Scaling Law Fit

Scaling Law Models Predicted 13B Model Real 13B Model Scaling Law Fit

Scaling Law Models Predicted 13B Model Real 13B Model Scaling Law Fit

0.00

1018 1019 1020 1021 1022 1023

1018 1019 1020 1021 1022 1023

1018 1019 1020 1021 1022 1023

1018 1019 1020 1021 1022 1023

Compute

Compute

Compute

Compute

ARC Challenge

ARC Easy

BoolQ

CommonsenseQA

0.7

0.9

0.9

noise

0.8

noise

error 11.9%

error 5.5%

error 0.8% noise

error 2.0% noise

0.6

0.8

0.8

0.7

0.7

0.5

0.6

0.7

0.6

0.5

0.4

0.6

Primary Score

Primary Score

Primary Score

Primary Score

0.5

0.4

0.3

0.5

Scaling Law Models Predicted 13B Model Real 13B Model Scaling Law Fit

Scaling Law Models Predicted 13B Model Real 13B Model Scaling Law Fit

Scaling Law Models Predicted 13B Model Real 13B Model Scaling Law Fit

Scaling Law Models Predicted 13B Model Real 13B Model Scaling Law Fit

0.4

1018 1019 1020 1021 1022 1023

1018 1019 1020 1021 1022 1023

1018 1019 1020 1021 1022 1023

1018 1019 1020 1021 1022 1023

Compute

Compute

Compute

Compute

HellaSwag

OpenBookQA

PIQA

SocialIQA

0.9

0.7

0.65

0.85

noise

0.8

error 0.1% noise

error 2.6%

error 1.4% noise

error 2.4% noise

0.60

0.80

0.6

0.7

0.55

0.75

0.6

0.5

0.50

0.70

0.5

0.4

Primary Score

Primary Score

Primary Score

Primary Score

0.4

0.45

0.65

0.3

Scaling Law Models Predicted 13B Model Real 13B Model Scaling Law Fit

Scaling Law Models Predicted 13B Model Real 13B Model Scaling Law Fit

Scaling Law Models Predicted 13B Model Real 13B Model Scaling Law Fit

Scaling Law Models Predicted 13B Model Real 13B Model Scaling Law Fit

0.3

0.40

0.60

1018 1019 1020 1021 1022 1023

1018 1019 1020 1021 1022 1023

1018 1019 1020 1021 1022 1023

1018 1019 1020 1021 1022 1023

Compute

Compute

Compute

Compute

WinoGrande

GSM8K

Jeopardy

SQuAD

noise

1.0

0.85

0.4

0.8

0.80

0.8

error 14.3%

error 7.7% noise

error 0.8% noise

error 3.7% noise

0.75

0.3

0.6

0.6

0.70

0.2

0.4

0.65

0.4

0.60

Primary Score

Primary Score

Primary Score

Primary Score

0.2

0.1

0.2

0.55

Scaling Law Models Predicted 13B Model Real 13B Model Scaling Law Fit

Scaling Law Models Predicted 13B Model Real 13B Model Scaling Law Fit

Scaling Law Models Predicted 13B Model Real 13B Model Scaling Law Fit

Scaling Law Models Predicted 13B Model Real 13B Model Scaling Law Fit

0.50

0.0

0.0

0.0

1018 1019 1020 1021 1022 1023

1018 1019 1020 1021 1022 1023

1018 1019 1020 1021 1022 1023

1018 1019 1020 1021 1022 1023

Compute

Compute

Compute

Compute

TriviaQA

MBPP

MBPP+

HumanEval

0.35

0.25

0.4

0.8

0.30

error 2.7% noise

error 15.7%noise

error 19.0%

error 2.8% noise

0.20

0.25

0.3

0.6

noise

0.20

0.15

0.2

0.15

0.4

0.10

0.10

Primary Score

Primary Score

Primary Score

Primary Score

0.1

0.05

0.2

0.05

Scaling Law Models Predicted 13B Model Real 13B Model Scaling Law Fit

Scaling Law Models Predicted 13B Model Real 13B Model Scaling Law Fit

Scaling Law Models Predicted 13B Model Real 13B Model Scaling Law Fit

Scaling Law Models Predicted 13B Model Real 13B Model Scaling Law Fit

0.00

0.00

0.0

1018 1019 1020 1021 1022 1023

1018 1019 1020 1021 1022 1023

1018 1019 1020 1021 1022 1023

1018 1019 1020 1021 1022 1023

Compute

Compute

Compute

Compute

HumanEval+

AutoBencher

GSM+

GSM Symbolic

0.6

0.8

0.30

0.30

0.25

error 2.5% noise

error 24.1%

error 144.0%

0.5

error 7.0% noise

0.25

0.6

noise

0.20

0.20

0.4

0.4

0.15

0.15

noise

0.3

0.10

Primary Score

Primary Score

Primary Score

Primary Score

0.10

0.2

0.05

0.2

0.05

Scaling Law Models Predicted 13B Model Real 13B Model Scaling Law Fit

Scaling Law Models Predicted 13B Model Real 13B Model Scaling Law Fit

Scaling Law Models Predicted 13B Model Real 13B Model Scaling Law Fit

Scaling Law Models Predicted 13B Model Real 13B Model Scaling Law Fit

0.00

0.0

1018 1019 1020 1021 1022 1023

1018 1019 1020 1021 1022 1023

1018 1019 1020 1021 1022 1023

1018 1019 1020 1021 1022 1023

Compute

Compute

Compute

Compute

noise

noise

GSM Symbolic P1

GSM Symbolic P2

MedMCQA

Minerva MATH 500

0.08

1.0

0.08

0.45

error 538.6%

error 74.7%

error 18.1%

error 48.6%

0.8

0.06

0.40

0.06

noise

0.6

0.04

0.35

0.04

0.4

noise

Primary Score

Primary Score

Primary Score

Primary Score

0.30

0.02

0.02

0.2

Scaling Law Models Predicted 13B Model Real 13B Model Scaling Law Fit

Scaling Law Models Predicted 13B Model Real 13B Model Scaling Law Fit

Scaling Law Models Predicted 13B Model Real 13B Model Scaling Law Fit

Scaling Law Models Predicted 13B Model Real 13B Model Scaling Law Fit

0.25

0.00

0.0

1018 1019 1020 1021 1022 1023

1018 1019 1020 1021 1022 1023

1018 1019 1020 1021 1022 1023

1018 1019 1020 1021 1022 1023

Compute

Compute

Compute

Compute

Figure 15: Scaling law fits for all tasks using the OLMo 2 13B-5T prediction target.

29

<!-- page 30 of 35 -->

MMLU SNR

MMLU Decision Accuracy

MMLU Noise at Scaling Law Target

+ machine_learning + college_mathematics

+ machine_learning + college_mathematics

+ machine_learning + college_mathematics

+ public_relations + college_chemistry

+ public_relations + college_chemistry

+ public_relations + college_chemistry

+ virology + college_computer_science

+ virology + college_computer_science

+ virology + college_computer_science

+ moral_scenarios + high_school_computer_science

+ moral_scenarios + high_school_computer_science

+ moral_scenarios + high_school_computer_science

+ abstract_algebra

+ abstract_algebra

+ abstract_algebra

+ high_school_statistics

+ high_school_statistics

+ high_school_statistics

+ high_school_physics + professional_accounting

+ high_school_physics + professional_accounting

+ high_school_physics + professional_accounting

+ formal_logic + college_physics + human_sexuality + high_school_mathematics

+ formal_logic + college_physics + human_sexuality + high_school_mathematics

+ formal_logic + college_physics + human_sexuality + high_school_mathematics

+ business_ethics

+ business_ethics

+ business_ethics

+ security_studies

+ security_studies

+ security_studies

+ professional_law

+ professional_law

+ professional_law

+ global_facts + college_medicine

+ global_facts + college_medicine

+ global_facts + college_medicine

+ nutrition + econometrics + international_law

+ nutrition + econometrics + international_law

+ nutrition + econometrics + international_law

+ high_school_chemistry

+ high_school_chemistry

+ high_school_chemistry

+ jurisprudence + high_school_geography

+ jurisprudence + high_school_geography

+ jurisprudence + high_school_geography

+ management + us_foreign_policy + professional_medicine

+ management + us_foreign_policy + professional_medicine

+ management + us_foreign_policy + professional_medicine

+ electrical_engineering

+ electrical_engineering

+ electrical_engineering

+ professional_psychology + high_school_european_history

+ professional_psychology + high_school_european_history

+ professional_psychology + high_school_european_history

Included MMLU Subtask

+ clinical_knowledge + computer_security + high_school_world_history

+ clinical_knowledge + computer_security + high_school_world_history

+ clinical_knowledge + computer_security + high_school_world_history

+ sociology + moral_disputes + high_school_us_history

+ sociology + moral_disputes + high_school_us_history

+ sociology + moral_disputes + high_school_us_history

+ marketing

+ marketing

+ marketing

+ human_aging + elementary_mathematics + high_school_macroeconomics

+ human_aging + elementary_mathematics + high_school_macroeconomics

+ human_aging + elementary_mathematics + high_school_macroeconomics

+ logical_fallacies

+ logical_fallacies

+ logical_fallacies

+ anatomy + medical_genetics

+ anatomy + medical_genetics

+ anatomy + medical_genetics

+ philosophy + high_school_biology + high_school_microeconomics

+ philosophy + high_school_biology + high_school_microeconomics

+ philosophy + high_school_biology + high_school_microeconomics

+ college_biology

+ college_biology

+ college_biology

+ astronomy + high_school_government_and_politics

+ astronomy + high_school_government_and_politics

+ astronomy + high_school_government_and_politics

+ miscellaneous + conceptual_physics

+ miscellaneous + conceptual_physics

+ miscellaneous + conceptual_physics

Subtasks sorted by SNR Subtasks sorted randomly

+ prehistory + world_religions + high_school_psychology

+ prehistory + world_religions + high_school_psychology

+ prehistory + world_religions + high_school_psychology

.005 .01 .015 .02

5.0 10.0 15.0 20.0 Signal-to-Noise Ratio (1B)

80% 85% 90% 95% Decision Acc. (150M to 1B)

Rel. Std. (13B)

AutoBencher SNR

AutoBencher Decision Accuracy

AutoBencher Noise at Scaling Law Target

+ film + celebrities

+ film + celebrities

+ film + celebrities

+ food

+ food

+ food

+ legal + nature + medicine

+ legal + nature + medicine

+ legal + nature + medicine

+ music + books

+ music + books

+ music + books

+ robotics + statistics

+ robotics + statistics

+ robotics + statistics

+ arts + technology

+ arts + technology

+ arts + technology

+ economy

+ economy

+ economy

+ algebra + geometry

+ algebra + geometry

+ algebra + geometry

+ politics + religion + education

+ politics + religion + education

+ politics + religion + education

+ conflicts + computer + philosophy

+ conflicts + computer + philosophy

+ conflicts + computer + philosophy

+ physics + archaeology

+ physics + archaeology

+ physics + archaeology

Included AutoBencher Subtask

+ energy + culture + astronomy

+ energy + culture + astronomy

+ energy + culture + astronomy

+ history + biology + cognitive + chemistry

+ history + biology + cognitive + chemistry

+ history + biology + cognitive + chemistry

Subtasks sorted by SNR Subtasks sorted randomly

+ science

+ science

+ science

.008 .01 .012 .014 .016 .018 .02

10.0 15.0 20.0 25.0 Signal-to-Noise Ratio (1B)

86% 88% 90% 92% 94% Decision Acc. (150M to 1B)

Rel. Std. (13B)

Figure 16: Larger version of Figure 4, showing the names of each subtask, sorted by SNR from bottom (highest SNR) to top (lowest SNR).

30

<!-- page 31 of 35 -->

Table 5: Scaling law fit error for BPB and primary score for all tasks with averaging the final 5 checkpoints in the ladder train models.

Predicting Bits-per-byte Predicting Primary Score Abs. Error, % Rel. Error, % Abs. Error, % Rel. Error, % Task (↓) Final Only

预测每字节位数 预测主分数 Abs。误差，% 相对值误差，% 绝对值。误差，% 相对值错误，% 任务 (↓) 仅最终结果

Avg. Train

Final Only

Avg. Train

Final Only

Avg. Train

Final Only

Avg. Train

Knowledge QA Tasks HellaSwag 0.76 0.80 1.16 1.22 0.31 0.16 0.37 0.20 CommonsenseQA 6.24 5.32 8.75 7.46 0.59 0.46 0.75 0.58 Jeopardy 5.08 5.14 18.51 18.73 0.57 0.54 0.69 0.66 SocialIQA 0.66 0.41 0.74 0.46 0.50 0.59 0.80 0.95 PIQA 1.23 1.39 1.40 1.59 0.89 1.01 1.08 1.22 MMLU 0.56 0.49 0.75 0.66 1.68 1.74 3.28 3.39 MMLU Pro 0.78 0.71 0.73 0.67 1.76 1.75 7.51 7.45 AGI Eval 2.79 2.66 3.33 3.18 1.89 1.98 5.43 5.70 OLMES Gen 4.66 2.32 3.92 1.95 4.19 2.16 6.22 3.20 BoolQ 1.49 1.76 8.54 10.11 4.13 2.48 4.91 2.96 OLMES Core 9 0.47 0.25 0.62 0.33 2.47 2.62 3.23 3.42 TriviaQA 1.56 2.05 2.27 2.98 2.33 2.62 2.89 3.25 SQuAD 4.96 4.96 32.35 32.37 2.80 2.79 3.23 3.21 OpenBookQA 3.18 3.92 2.80 3.46 4.02 3.38 6.22 5.22 AutoBencher 2.92 2.78 4.70 4.49 3.86 3.69 7.47 7.14 ARC Easy 1.36 1.37 2.89 2.90 5.13 5.13 5.87 5.87 MedMCQA 5.07 5.38 5.35 5.67 7.72 7.98 19.72 20.41 ARC Challenge 2.08 2.07 3.15 3.14 8.44 8.43 13.02 13.01 WinoGrande 1.01 1.38 0.83 1.12 10.01 10.82 12.47 13.49 BBH 61.84 65.01 12.81 13.47 33.09 33.08 66.61 66.59 DROP 47.51 48.19 10.75 10.91 35.17 35.20 68.77 68.82 Knowledge 19-Task Avg. 1.18 0.87 1.32 0.98 1.43 1.20 2.22 1.85

Math Tasks Minerva MATH 0.73 0.66 1.50 1.36 1.08 0.98 15.28 13.93 Minerva MATH 500 0.34 0.14 0.71 0.29 17.35 1.78 306.18 31.36 GSM Symbolic P2 2.57 2.83 5.23 5.75 7.46 3.50 164.53 77.13 GSM8K 2.43 2.48 5.90 6.01 7.46 3.85 20.55 10.61 GSM+ 2.02 1.95 4.54 4.40 29.14 28.54 130.01 127.36 GSM Symbolic 1.87 1.71 4.64 4.25 39.88 38.88 132.62 129.30 GSM Symbolic P1 2.31 2.35 5.04 5.11 27.15 83.62 178.46 549.63 Math 6-Task Avg. 2.05 2.01 4.52 4.42 11.33 2.30 65.52 13.28

Code Tasks HumanEval+ 1.92 2.21 3.57 4.10 1.05 0.04 3.91 0.16 MBPP 0.30 0.32 0.46 0.48 2.57 1.79 11.63 8.10 MBPP+ 6.49 6.62 12.56 12.81 9.08 8.79 33.14 32.11 HumanEval 1.59 2.01 3.85 4.87 7.71 8.85 24.00 27.55 Code 4-Task Avg. 3.23 3.33 6.07 6.25 3.15 2.75 11.61 10.15

All 30-Task Avg. 0.47 0.15 0.62 0.20 1.03 0.86 2.10 1.76

31

<!-- page 32 of 35 -->

Table 6: Decision accuracy averaging the final 5 checkpoints for bits-per-byte and the primary metric (accuracy, exact match, pass@1).

Bits-per-byte, % Primary Metric, % Task (↓) Final Ckpt

Avg. Pred

Avg. Target

Avg. Both

Final Ckpt

Avg. Pred

Avg. Target

Avg. Both

Knowledge QA Tasks ARC Challenge 94.56 94.88 94.38 94.67 82.91 82.27 82.91 82.00 HellaSwag 92.42 93.19 93.21 94.00 71.05 71.26 72.37 72.33 ARC Easy 92.23 92.15 91.96 92.00 93.96 93.99 94.05 94.00 MMLU 91.53 91.64 91.63 91.67 89.08 88.84 89.60 89.00 AutoBencher 88.55 88.95 89.19 89.67 88.80 89.05 88.81 89.00 MMLU Pro 90.00 89.40 90.04 89.33 83.34 83.77 84.20 84.67 AGI Eval 86.38 86.75 86.54 87.00 57.38 58.60 56.45 57.67 MedMCQA 86.67 86.67 86.67 86.67 61.33 61.33 61.33 60.33 Jeopardy 84.42 84.46 84.88 85.00 83.01 82.60 83.74 83.33 TriviaQA 83.55 84.29 83.86 84.67 69.10 69.54 69.09 69.33 OpenBookQA 81.53 81.75 81.68 82.00 66.82 66.98 68.05 68.33 OLMES Core 9 79.05 80.10 79.32 80.33 74.67 73.92 74.24 73.67 SocialIQA 79.92 79.57 79.45 79.00 55.58 55.58 56.09 56.67 WinoGrande 73.20 74.29 72.83 74.00 50.52 50.27 49.81 49.00 PIQA 72.60 72.91 71.93 72.00 72.78 72.66 73.09 72.33 CommonsenseQA 65.86 66.25 65.42 65.67 68.74 69.05 70.61 71.00 BoolQ 63.72 64.19 63.51 64.00 50.38 48.90 50.66 49.33 SQuAD 60.93 60.59 62.02 61.67 58.69 58.35 59.72 59.33 OLMES Gen 61.16 55.44 55.11 58.86 62.06 54.87 53.42 50.12 DROP 56.67 56.48 57.46 57.33 57.77 59.06 57.80 59.33 BBH 57.48 57.25 57.66 57.33 59.15 59.88 60.85 61.33 Knowledge 19-Task Avg. 71.39 71.49 71.62 71.67 70.70 75.82 72.65 78.00

Math Tasks Minerva MATH 500 90.33 90.33 90.33 90.33 51.00 51.00 51.00 51.00 Minerva MATH 90.00 90.00 90.00 90.00 51.00 51.00 51.00 51.00 GSM Symbolic P1 81.33 81.33 81.33 81.33 41.67 41.67 41.67 41.67 GSM Symbolic P2 79.67 79.67 79.67 79.67 40.33 40.33 40.33 40.33 GSM+ 79.00 79.00 79.00 79.00 59.67 59.67 59.67 59.67 GSM Symbolic 78.33 78.33 78.33 78.33 51.67 51.67 51.67 51.67 GSM8K 76.67 76.67 76.67 76.67 46.33 46.33 46.33 46.33 Math 6-Task Avg. 88.33 88.33 88.33 88.33 42.67 42.67 42.67 42.67

Code Tasks HumanEval+ 96.33 96.33 96.33 96.33 71.33 71.33 71.33 71.33 HumanEval 95.67 95.67 95.67 95.67 80.00 80.00 80.00 80.00 MBPP 95.33 95.33 95.33 95.33 76.00 76.00 76.00 76.00 MBPP+ 93.00 93.00 93.00 93.00 70.67 70.67 70.67 70.67 Code 4-Task Avg. 96.67 96.67 96.67 96.67 85.67 85.67 85.67 85.67

All 30-Task Avg. 68.57 70.63 69.78 71.33 62.15 68.88 67.29 77.33

32

<!-- page 33 of 35 -->

Figure 17: Bits-per-byte vs. primary metric on the full suite of tasks shown in Figure 6.

Experiment Setting → SNR (↑) Rel. Error (↓), % Decision Acc (↑), % Metric → Primary BPB Primary BPB Primary BPB

实验设置 → SNR (↑) Rel.误差 (↓)、% 决策准确率 (↑)、% 指标 → 主要 BPB 主要 BPB 主要 BPB

Knowledge QA Tasks TriviaQA 27.9 61.8 2.5 0.5 68.3 85.3 SQuAD 23.8 29.0 7.6 27.8 59.7 61.7 OLMES Gen 23.1 20.6 0.9 2.6 63.3 67.3 ARC Easy 21.0 64.6 5.3 0.8 93.0 93.0 Jeopardy 20.2 22.6 3.5 18.6 82.0 83.0 AutoBencher 15.9 31.3 0.2 4.5 89.3 89.3 HellaSwag 11.8 14.9 1.4 1.0 74.3 95.3 DROP 11.5 9.9 59.0 11.3 57.3 58.7 OLMES + Gen 11.2 40.0 2.1 0.4 89.0 89.0 MMLU Pro 11.0 27.6 2.7 1.3 83.0 89.0 MMLU 9.8 35.9 4.3 0.4 89.0 92.0 ARC Challenge 6.6 44.8 9.7 2.1 83.3 95.0 CommonsenseQA 5.5 41.9 3.6 5.9 68.7 65.7 SocialIQA 5.5 48.0 0.4 1.9 55.0 80.0 OLMES Core 9 5.4 73.2 3.7 0.2 73.3 79.3 WinoGrande 4.6 3.6 10.3 0.9 49.7 75.0 PIQA 4.2 8.8 0.5 1.3 73.3 72.7 BBH 3.6 2.5 67.1 12.9 64.7 55.0 MedMCQA 3.5 29.5 8.8 4.6 60.3 86.7 AGI Eval 2.5 19.5 13.7 3.4 58.7 88.0 OpenBookQA 2.1 24.2 7.7 3.3 65.7 82.7 BoolQ 1.5 64.8 5.1 6.6 47.7 62.3 Knowledge 19-Task Avg. 13.7 44.3 0.8 1.0 79.0 80.0

Math Tasks Minerva MATH 1.9 88.6 11.9 1.9 51.0 90.0 GSM+ 1.8 7.3 20.0 4.8 59.7 79.0 GSM Symb. 1.3 6.5 83.0 5.1 51.0 78.3 GSM8K 1.2 7.0 38.6 5.9 46.0 76.7 Math 6-Task Avg. 1.8 22.6 46.0 5.0 42.3 88.3

Code Tasks HumanEval 6.1 25.1 9.2 7.9 74.3 95.7 HumanEval+ 5.5 27.4 29.7 7.1 66.0 96.3 MBPP 2.0 41.8 23.6 1.0 68.3 95.3 MBPP+ 1.7 30.8 39.5 8.9 62.7 93.0 GSM Symb. P1 1.6 6.6 538.6 5.2 41.3 81.3 Minerva MATH 500 1.4 90.5 52.5 0.9 50.7 90.3 GSM Symb. P2 1.0 7.0 74.8 5.1 40.3 79.7 Code 4-Task Avg. 5.5 42.0 29.5 9.7 80.3 96.7

All 30-Task Avg. 10.0 31.5 2.3 0.4 77.0 83.7

33

<!-- page 34 of 35 -->

ARC Challenge

ARC Easy

BoolQ

CommonsenseQA

1.0

1.0

1.00

1.00

0.9

0.9

0.8

0.8

0.95

0.95

0.7

0.7

Decision Accuracy

Decision Accuracy

Decision Accuracy

Decision Accuracy

0.90

0.90

0.6

0.6

0K 20K 40K 60K Training Step

0K 20K 40K 60K Training Step

0K 20K 40K 60K Training Step

0K 20K 40K 60K Training Step

HellaSwag

OpenBookQA

PIQA

SocialIQA

1.0

1.0

1.0

1.00

0.9

0.9

0.9

0.8

0.8

0.8

0.95

0.7

0.7

0.7

Decision Accuracy

Decision Accuracy

Decision Accuracy

Decision Accuracy

0.90

0.6

0.6

0.6

0K 20K 40K 60K Training Step

0K 20K 40K 60K Training Step

0K 20K 40K 60K Training Step

0K 20K 40K 60K Training Step

WinoGrande

MMLU

OLMES 10 Avg.

1.0

1.0

1.00

0.9

0.9

0.8

0.8

0.95

0.7

0.7

Smoothing EMA (N=2) EMA (N=5) EMA (N=20) Single Checkpoint

Decision Accuracy

Decision Accuracy

Decision Accuracy

0.90

0.6

0.6

0K 20K 40K 60K Training Step

0K 20K 40K 60K Training Step

0K 20K 40K 60K Training Step

Figure 18: When stopping a training run early, averaging the checkpoint-to-checkpoint noise improves the decision accuracy between an intermediate and the final training step. Shown are decision accuracy from early-stopping for the core OLMES tasks by using both a single checkpoint and the exponential moving average (EMA)

34

<!-- page 35 of 35 -->

ARC Easy

ARC Easy

ARC Easy

0.7

1B Run (varying seed)

1B Run (varying data order)

1B Run (varying seed + data order)

0.7

0.7

0.6

0.6

0.6

0.5

0.5

0.5

Accuracy

0.700 seed noise

total variation

0.4

0.4

0.4

0.700 data order noise

0.675

0.675

0.3

0.3

0.3

0K 20K 40K 60K 80K

0K 20K 40K 60K

0K 20K 40K 60K 80K

CommonsenseQA

CommonsenseQA

CommonsenseQA

1B Run (varying seed)

1B Run (varying data order)

1B Run (varying seed + data order)

0.6

0.6

0.6

0.5

0.5

0.5

0.4

0.4

0.4

Accuracy

total variation

0.625 seed noise

0.600

0.600

0.625 data order noise

0.3

0.3

0.3

0.575

0.575

0K 20K 40K 60K 80K

0K 20K 40K 60K

0K 20K 40K 60K 80K

SocialIQA

SocialIQA

SocialIQA

1B Run (varying seed)

1B Run (varying data order)

1B Run (varying seed + data order)

0.50

0.50

0.50

0.45

0.45

0.45

Accuracy

total variation

0.52 seed noise

0.52 data order noise

0.50

0.40

0.40

0.40

0.50

0K 20K 40K 60K 80K

0K 20K 40K 60K

0K 20K 40K 60K 80K

HellaSwag

HellaSwag

HellaSwag

1B Run (varying seed)

1B Run (varying data order)

1B Run (varying seed + data order)

0.6

0.6

0.6

0.5

0.5

0.5

0.625

0.625

0.4

0.4

0.4

Accuracy

0.600

0.600

total variation

seed noise

data order noise

0.3

0.3

0.3

0.575

0.575

0K 20K 40K 60K 80K

0K 20K 40K 60K

0K 20K 40K 60K 80K

ARC Challenge

ARC Challenge

0.40 ARC Challenge

1B Run (varying seed)

1B Run (varying data order)

1B Run (varying seed + data order)

0.35

0.35

0.35

0.30

0.30

0.38

0.30

Accuracy

total variation

0.25

0.25

0.38 data order noise

seed noise

0.25

0.36

0.36

0.20

0.20

0K 20K 40K 60K 80K

0K 20K 40K 60K 0.20

0K 20K 40K 60K 80K

Winogrande

Winogrande

Winogrande

1B Run (varying seed)

1B Run (varying data order)

1B Run (varying seed + data order)

0.600

0.600

0.600

0.575

0.575

0.575

0.550

0.550

0.550

0.60

0.525

Accuracy

0.525

0.525

total variation

seed noise

0.59 data order noise

0.58

0.500

0.58

0.500

0.500

0.475

0K 20K 40K 60K 80K 0.475

0K 20K 40K 60K

0K 20K 40K 60K 80K 0.475

PIQA

PIQA

PIQA

1B Run (varying seed)

1B Run (varying data order)

1B Run (varying seed + data order)

0.75

0.75

0.75

0.70

0.70

0.70

0.65

0.65

0.65

Accuracy

0.60

0.60

0.60

0.750 seed noise

total variation

0.750 data order noise

0.725

0.725

0.55

0.55

0.55

0K 20K 40K 60K 80K

0K 20K 40K 60K

0K 20K 40K 60K 80K

MMLU

MMLU

MMLU

0.36

1B Run (varying seed)

1B Run (varying data order)

1B Run (varying seed + data order)

0.34

0.34

0.34

0.32

0.32

0.32

0.30

0.30

0.30

Accuracy

0.28

0.28

total variation

0.35 seed noise

0.28

0.34

0.35 data order noise

0.34

0.26

0.26

0.26

0K 20K 40K 60K 80K Training Step

0K 20K 40K 60K Training Step

0K 20K 40K 60K 80K Training Step

Figure 19: Visualization for the seed noise, data order noise and total variation for all OLMES tasks.

35
