---
title: "Ring-1T · 对照译稿"
category: "模型库"
tags: ["Ling", "对照译稿"]
published: true
excerpt: "Ring-1T 公开材料的逐段中英对照译稿，附读报告时的疑问块。"
---
<!-- page 1 of 31 -->

**Date:** Oct 22, 2025.**Code:** [https://github.com/inclusionAI/Ring-V2](https://github.com/inclusionAI/Ring-V2).**Model:** [https://huggingface.co/inclusionAI/Ring-1T](https://huggingface.co/inclusionAI/Ring-1T).

日期是 **Oct 22, 2025**。代码指向 Ring-V2，模型页是 Ring-1T。

We present Ring-1T, described as an open-source thinking model with **1 trillion** total parameters and about **50 billion** activated per token. The abstract names three pieces of work, IcePop, C3PO++, and ASystem, and prints 93.4 on AIME-2025 and 86.72 on HMMT-2025. The rest of that sentence continues into other benchmarks. Training procedures are not transcribed.

Ring-1T 被写成开源的思考模型，总参数 **1 trillion**，每个 token 激活约 **50 billion**。摘要点了 IcePop，C3PO++，ASystem 三个名字，并印了 AIME-2025 93.4, HMMT-2025 86.72。训练步骤不转写。

> **看表：** 1 trillion 和 50 billion 是同一个规模吗？
> 不是。总参数和每个 token 的激活参数是两句。后文又写 「one trillion total parameters」 和 「approximately 50 billion activated parameters per token」。这页没有把 50B 写成 1T 的一个百分比。

![Image block](images/p01-image.png)

![Chart block](images/p01-chart.png)

![Chart block](images/p01-chart-2.png)

![Chart block](images/p01-chart-3.png)

![Chart block](images/p01-chart-4.png)

![Chart block](images/p01-figure-1-performance-comparison-of-ring-1t-and-existing.png)

![Chart block](images/p01-chart-5.png)

![Chart block](images/p01-deepseek-v3-1-terminus-thinking-open-weights.png)

![Chart block](images/p01-qwen3-235b-a22b-thinking-2507-open-weights.png)

（图：第 1 页的图 1 被拆成多张切片。图注是 Ring-1T 与已有模型的对比。切片文件名里能看到 DeepSeek-V3.1-Terminus-Thinking 和 Qwen3-235B-A22B-Thinking-2507。柱上的细读以正文印出的分数为准，不把切片上的刻度当成另一套表。）

<!-- page 2 of 31 -->

The introduction says Ring-1T is built on Ling 2.0 and trained from Ling-1T-base. Printed scores here: AIME-2025 93.4, HMMT-2025 86.72, CodeForces 2088, ARC-AGI-v1 55.94. In the IMO-2025 setting inside AWorld, the text says four problems were solved and Problem 2 was partially proved, in one submission, without code generation or an external symbolic solver. It calls that a silver-medal level. The solution writeup is not transcribed.

引言写 Ring-1T 建在 Ling 2.0 上，从 Ling-1T-base 接着训练。这里印的分数是 AIME-2025 93.4, HMMT-2025 86.72, CodeForces 2088, ARC-AGI-v1 55.94. IMO-2025 在 AWorld 里的结果写成：一次提交做对四题，Problem 2 部分证明，没有用代码生成或外部符号求解器，并称为银牌水平。解题过程不转写。

> **问：** CodeForces 的 2088 和 AIME 的 93.4 能放在同一根轴上比吗？
> 不能。93.4 和 86.72, 55.94 是百分数或该基准自己的分数。2088 是 CodeForces 的评分，数量级不同。引言把它们写在同一句里，没有换成同一个单位。

> **对一下：** 「银牌」 在这页是一个表上的格子吗？
> 不是。句子写做对四题，Problem 2 部分证明，一次提交，并称为银牌水平。没有印出银牌的分数线，也没有和其他模型并排的奖牌表。

> **核对：** 摘要的 93.4 和这一页的 93.4 是同一格吗？
> 是。两处都写 AIME-2025 93.4. HMMT-2025 两处都是 86.72. CodeForces 2088 和 ARC-AGI-v1 55.94 只在这一页的这一段出现，摘要的截断句没有把它们再印一遍。

<!-- page 3 of 31 -->

![Image block](images/p03-figure-2-the-training-pipeline-of-ring-1t.png)

（图：图 2，训练流程示意图。流程步骤不转写。）

<!-- page 4 of 31 -->

This page continues the training description. The steps are not transcribed.

这一页继续写训练过程。步骤不转写。

<!-- page 5 of 31 -->

This page continues the same description. The steps are not transcribed.

这一页仍是训练过程。步骤不转写。

<!-- page 6 of 31 -->

![Image block](images/p06-figure-3-we-integrate-c3po-and-icepop-into-ring-1t.png)

（图：图 3，图注写把 C3PO 和 IcePop 放进 Ring-1T. 做法不转写。）

<!-- page 7 of 31 -->

![Image block](images/p07-figure-4-c3po-improves-reinforcement-learning.png)

（图：图 4，图注写 C3PO 改善强化学习的资源利用。划分步骤不转写。）

<!-- page 8 of 31 -->

This page continues the method text. The update rules are not transcribed.

这一页继续写方法。更新规则不转写。

<!-- page 9 of 31 -->

On Ring-mini-2.0, Figure 5 compares IcePop with TIS on AIME25 (Avg@64). The text says the base score is 63%, IcePop improves it by over 14 points, and the gap versus TIS is a relative 6%.

在 Ring-mini-2.0 上，图 5 用 AIME25 (Avg@64) 比较 IcePop 和 TIS。正文写基线 63%，IcePop 提高 14 分以上，相对 TIS 的差距是 6%。这是 Ring-mini-2.0 的曲线，不是 Ring-1T 摘要里的 93.4。

![Chart block](images/p09-figure-5-the-performance-comparison-on-aime25-avg-64-we.png)

（图：图 5, AIME25 Avg@64。图注写所有模型用同一设定。）

> **拆开：** 图 5 的 63% 加 14 分，能加到摘要的 93.4 吗？
> 不能。63 加 14 等于 77，对象是 Ring-mini-2.0。摘要的 93.4 写在 Ring-1T 的 AIME-2025 上。两个模型，两个分数。

<!-- page 10 of 31 -->

![Chart block](images/p10-chart.png)

![Chart block](images/p10-chart-2.png)

![Chart block](images/p10-chart-3.png)

![Chart block](images/p10-figure-6-the-training-dynamics-before-and-after.png)

![Chart block](images/p10-chart-4.png)

![Chart block](images/p10-figure-7-comparison-of-time-cost-between-c3po-and-the.png)

（图：图 6 是训练动态，图 7 是 C3PO 与对照的时间成本。切片没有单独的表。时间步骤不转写。）

<!-- page 11 of 31 -->

![Chart block](images/p11-chart.png)

![Chart block](images/p11-figure-8-comparison-of-reward-and-benchmark-performance.png)

![Image block](images/p11-figure-9-an-overview-of-asystem-rl-training-framework.png)

（图：图 8 比较奖励和基准，图 9 是 ASystem 的框架概览。框架内部的调用步骤不转写。）

<!-- page 12 of 31 -->

This page continues the framework description. The steps are not transcribed.

这一页继续写框架。步骤不转写。

<!-- page 13 of 31 -->

This page continues. The steps are not transcribed.

这一页继续。步骤不转写。

<!-- page 14 of 31 -->

This page continues. The steps are not transcribed.

这一页继续。步骤不转写。

<!-- page 15 of 31 -->

This page continues. The steps are not transcribed.

这一页继续。步骤不转写。

<!-- page 16 of 31 -->

This page continues. The steps are not transcribed.

这一页继续。步骤不转写。

<!-- page 17 of 31 -->

This page continues. The steps are not transcribed.

这一页继续。步骤不转写。

<!-- page 18 of 31 -->

This page continues. The steps are not transcribed.

这一页继续。步骤不转写。

<!-- page 19 of 31 -->

This page continues. The steps are not transcribed.

这一页继续。步骤不转写。

<!-- page 20 of 31 -->

This page continues. The steps are not transcribed.

这一页继续。步骤不转写。

<!-- page 21 of 31 -->

This page continues. The steps are not transcribed.

这一页继续。步骤不转写。

<!-- page 22 of 31 -->

This page continues. The steps are not transcribed.

这一页继续。步骤不转写。

<!-- page 23 of 31 -->

This page continues. The steps are not transcribed.

这一页继续。步骤不转写。

<!-- page 24 of 31 -->

This page continues. The steps are not transcribed.

这一页继续。步骤不转写。

<!-- page 25 of 31 -->

This page continues. The steps are not transcribed.

这一页继续。步骤不转写。

<!-- page 26 of 31 -->

![Chart block](images/p26-chart.png)

![Chart block](images/p26-figure-10-left-training-reward-the-reward-of-baseline.png)

（图：图 10，左图是训练奖励。曲线读数不转写成另一套公式。）

<!-- page 27 of 31 -->

![Chart block](images/p27-chart.png)

![Chart block](images/p27-figure-11-left-the-maximum-of-probability-discrepancy.png)

![Chart block](images/p27-chart-2.png)

![Chart block](images/p27-figure-12-left-clipping-ratio-icepop-maintains-1-2-of.png)

（图：图 11 左图是概率差的最大值。图 12 文件名写 IcePop 的 clipping ratio 维持在 1 到 2。裁剪规则不转写。）

> **停一下：** 图 12 文件名里的 1 到 2，是 AIME 分数吗？
> 不是。文件名说的是 clipping ratio。摘要的 93.4 和这张图不在同一页，也不是同一种数。

<!-- page 28 of 31 -->

![Chart block](images/p28-chart.png)

![Chart block](images/p28-chart-2.png)

![Chart block](images/p28-chart-3.png)

![Chart block](images/p28-figure-13-the-training-dynamics-under-different-masking.png)

![Chart block](images/p28-figure-14-the-domain-distribution-of-sft-data.png)

（图：图 13 是不同 masking 下的训练动态。图 14 是 SFT 数据的领域分布。masking 的规则不转写。）

<!-- page 29 of 31 -->

![Chart block](images/p29-figure-15-the-difficulty-distribution-of-rl-data.png)

（图：图 15，RL 数据的难度分布。）

<!-- page 30 of 31 -->

This page continues the appendix or the closing discussion. New benchmark cells are not added beyond the scores already printed in the abstract and the introduction.

这一页是后部讨论。新的基准格子没有超出摘要和引言里已经印出的那些分数。

<!-- page 31 of 31 -->

The last page closes the report. The date on page 1 remains Oct 22, 2025.

最后一页收束报告。日期仍是第 1 页的 Oct 22, 2025。

> **再看：** 思考模型和标题里的 Scaling 是同一根轴吗？
> 不是。标题 Scaling Reinforcement Learning 是把强化学习的训练规模做大，这是部署前的缩放。thinking 是推理时多写步骤，写成 TestingTime. 1T 和约 50B 仍是总参数和激活参数两行，不由思考档决定。
