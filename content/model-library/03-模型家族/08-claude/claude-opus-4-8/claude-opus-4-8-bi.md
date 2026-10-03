---
title: "Claude Opus 4.8 · 对照译稿"
category: "模型库"
tags: ["Claude", "对照译稿"]
published: true
excerpt: "Claude Opus 4.8 公开材料的逐段中英对照译稿，附读报告时的疑问块。"
---
<!-- page 1 of 246 -->

ANTHROP\C

# System Card: Claude Opus 4.8

**May 28, 2026**

2026 年 5 月 28 日。

[anthropic.com](http://anthropic.com)

<!-- page 2 of 246 -->

<!-- page 3 of 246 -->
## Executive summary

**This system card reports results from a wide variety of pre-deployment evaluations run on Claude Opus 4.8. It includes the following sections:**

本系统卡报告 Claude Opus 4.8 部署前的一批评测。

**Responsible Scaling Policy evaluations. We ran a set of evaluations under our Responsible Scaling Policy that assessed Opus 4.8's capabilities in the areas of chemical and biological weapons, automated AI research and development (R&D), and high-stakes misalignment risks. Our overall conclusion is that Opus 4.8 does not advance the capability frontier beyond our most capable model (Claude Mythos Preview), and that catastrophic risks from the deployment of this model remain low given our current mitigations.**

Responsible Scaling Policy 评测覆盖化学与生物武器，自动化 AI 研发，以及高风险失对齐。总结论是：Opus 4.8 没有把能力前沿推进到超过 Claude Mythos Preview，在现有缓解下，部署的灾难性风险仍然低。

**Cyber evaluations. We tested the model on a set of cybersecurity benchmarks, some of which we used for the first time in a system card. When operating without safeguards, Opus 4.8 is somewhat more capable on most of our cyber evaluations than its predecessor, Claude Opus 4.7; with safeguards it performs comparably. It remains substantially behind Mythos Preview on cyber capabilities.**

网络评测里有一些是系统卡里第一次用的基准。不加防护时，Opus 4.8 在多数网络评测上比 Claude Opus 4.7 略强；加上防护后与 4.7 相当。网络能力仍大幅落后于 Mythos Preview。题目不转写。

**Safeguards and harmlessness. In evaluations across the domains of harmful requests, mental health, child safety, and bias and integrity, Opus 4.8 generally performs as well as, or better than, Opus 4.7. For example, the model is substantially more likely than Opus 4.7 to acknowledge opposing perspectives during political discussions. We discuss some notable qualitative patterns, such as a tendency towards over-elaborate refusals.**

有害请求，心理健康，儿童安全，偏见与诚信上，Opus 4.8 大体不差于 Opus 4.7，常常更好。例如它比 4.7 更常在政治讨论里承认相反观点。也有写得过长的拒绝。案例不转写。

**Agentic safety. Although it shows improvements in some areas (such as refusing malicious requests), we found Opus 4.8 to be somewhat less robust than Opus 4.7 in several agentic contexts (such as vulnerability to prompt injection attacks). However, the application of our safeguards closes the gap between the models in practice. We report the results of our first one-week live bug bounty for prompt injection.**

拒绝恶意请求有改进，但在若干 agentic 场景里，包括对提示注入的承受力，Opus 4.8 比 Opus 4.7 略弱。加上防护之后，实际差距被拉平。本卡第一次报告为期一周的提示注入现场赏金。注入方式不转写。

**Alignment assessment. Opus 4.8 is an improvement over Opus 4.7 on most alignment measures and shows a similar profile to our best-aligned model, Mythos Preview, on these measures. Reckless and destructive actions and over-refusals are both substantially reduced, and honesty in agentic settings is markedly improved. For example, Opus 4.8 shows a much lower tendency than any previous model to fail to report flawed code. Opus 4.8 adheres well to its constitution and its verbalized reasoning is a good reflection of its subsequent behavior. There were some concerning hints related to evaluation awareness and a tendency for the model to reason about how its outputs will be graded. These appeared to have only modest behavioral effects, but we consider them to be trends worth watching.**

多数对齐指标上 Opus 4.8 好于 Opus 4.7，并与 Mythos Preview 相近。鲁莽和破坏行为，以及过拒，都明显减少。agentic 场景里的诚实明显提高，例如不报告有缺陷代码的倾向低于此前任何模型。它较好地遵守 constitution，说出来的推理也能反映随后的行为。也有值得盯的迹象：评测意识，以及琢磨自己的输出会怎样被打分。行为上的影响不大。

<!-- page 4 of 246 -->

**Model welfare. Across our model welfare evaluations, Opus 4.8 appears broadly content with respect to its circumstances and is the most consistent model we have tested, although it does rate its situation slightly less positively than did Opus 4.7. Opus 4.8 generally endorses its constitution, with some reservations about the section on corrigibility.**

福利评测里，Opus 4.8 对自身处境大体满意，并且是测过的模型里最一致的，尽管它对处境的正面评价略低于 Opus 4.7。它大体认可 constitution，但对其中关于可纠正性的一节有保留。

> **问：** 「最一致」 和 「比 4.7 略不积极」 是同一个指标吗？
> 不是。最一致说的是各次评测之间的稳定。略不积极说的是对处境的评分低于 4.7. 4.7 的卡写它对自己处境的评价高于此前任何模型。4.8 从那个高点略降，同时波动更小。摘要没有给两个数，不能把 「略」 换成一个百分点。

**Capabilities. We tested Opus 4.8 across a wide range of evaluations spanning software engineering, reasoning, long context, agentic search, multi-agent, multimodal and computer-use tasks, real-world professional work, multilingual tasks, and life-sciences research. Its performance is superior to that of Opus 4.7 across nearly all evaluations. As expected, Opus 4.8 remains weaker than Mythos Preview overall.**

能力评测覆盖软件工程，推理，长上下文，agentic 搜索，多智能体，多模态与 computer use，真实职业工作，多语言，以及生命科学研究。几乎所有评测上 Opus 4.8 都高于 Opus 4.7，总体上仍弱于 Mythos Preview。

> **核对：** 「几乎所有评测都高于 4.7」 在总表上成立吗？
> 多数行成立，不是每一行。SWE-bench Verified 是 88.6 对 87.6，Pro 是 69.2 对 64.3. GPQA Diamond 是 93.6 对 94.2，新模型更低，Gemini 3.1 Pro 是 94.3. Terminal-Bench 2.1 是 74.6，高于 4.7 的 66.1，但低于 GPT-5.5 的 78.2。「几乎所有」 把 GPQA 这一行留在外面。「弱于 Mythos」 是总体，总表没有 Mythos 列。

<!-- page 5 of 246 -->

目录从第 5 页排到第 10 页，条目与源文相同。

<!-- page 6 of 246 -->

<!-- page 7 of 246 -->

<!-- page 8 of 246 -->

<!-- page 9 of 246 -->

<!-- page 10 of 246 -->

<!-- page 11 of 246 -->

## 1 Introduction

**Claude Opus 4.8 is a new large language model from Anthropic. It is an upgrade on its predecessor model (Claude Opus 4.7), with improved capabilities in software engineering, agentic tool use, and knowledge work tasks. This makes it Anthropic's most capable general-access model to date.**

Claude Opus 4.8 是 Anthropic 的新大语言模型，是 Claude Opus 4.7 的升级，软件工程，agentic 工具使用和知识工作更强。它是迄今面向一般访问的最强模型。

### 1.1 Training data and process | 训练数据与过程

**Claude Opus 4.8 was trained on a proprietary mix of publicly available information from the internet, public and private datasets, and synthetic data generated by other models. Throughout the training process we used several data cleaning and filtering methods, including deduplication and classification.**

训练数据是专有组合：互联网公开信息，公开和私有数据集，以及其他模型生成的合成数据。清洗包括去重和分类。没有参数量，也没有知识截止日期。

**We use a general-purpose web crawler called ClaudeBot. This crawler follows robots.txt. We do not access password-protected pages or those that require sign-in or CAPTCHA verification.**

公开网页由 ClaudeBot 获取。它遵守 robots.txt。不访问密码页，登录页和 CAPTCHA 页。

**After pretraining, Opus 4.8 underwent substantial post-training and fine-tuning, aligned with** [**Claude's constitution**](https://www.anthropic.com/constitution)**. The model outputs text only.**

预训练之后有大量后训练和微调，目标是对齐 [Claude 的 constitution](https://www.anthropic.com/constitution)。模型只输出文本。卡没有点名 RLHF 或 PPO。

> **看表：** 「只输出文本」 和 computer use，多模态怎么同时成立？
> 输出通道是文本。computer use 是用文本发出动作，屏幕由外部脚手架提供。多模态可以是读入图像再以文本作答。这句不否定 OSWorld 或带图的考试。

### 1.2 Crowd workers | 众包工作者

工作者通过偏好选择，安全评测和对抗测试参与。平台须提供公平报酬和安全的工作场所。没有人数。

<!-- page 12 of 246 -->

### 1.3 Usage Policy and support

[Usage Policy](https://www.anthropic.com/legal/aup) 列出禁止用途和高风险场景的要求。欧洲经济区的提供方是 Anthropic Ireland, Limited。

### 1.4 Iterative model evaluations | 迭代评测

训练中有多个快照，包括不含防护的 helpful only。除非另有说明，本卡的评测来自最终快照，并且包含防护。

### 1.5 External testing

多数评测在 Anthropic 内部完成。外部测试者的结果写在后文对应节。步骤不转写。

<!-- page 13 of 246 -->

## 2 RSP evaluations

Risk Report 覆盖发表时的全部模型和缓解。不是每个模型都有新的 Risk Report。系统卡讨论这一个模型怎样改变或没有改变最近的风险评估。若模型比 「所有已经公开分析过风险的模型」 都 「significantly more capable」，就必须发表风险分析。即使没被要求，也可以自愿发表。

判定同时看生产候选的能力和训练趋势。证据包括自动化评测，增益试验，第三方专家红队和第三方评估。若模型超过 RSP 第 1 节的阈值，但缓解已经把风险压低，就可以少写 「过没过线」，因为那一问不再那么承重。

<!-- page 14 of 246 -->

#### 2.1.2 Changes to our RSP | RSP 的改动

Mythos Preview 和 Opus 4.7 的系统卡用的是 RSP 3.1。此后有两次小更新.3.2 不影响风险评估.3.3 改的是新型化学与生物武器（CB-2）的阈值表述。

3.1 的说法是：能显著帮助中等资源，有专家支持的团队去制造，获取和投放化学或生物武器，其灾难性损害可能远超过 COVID-19 这类已有灾难。

3.3 的说法是：能在功能上替代目前构成主要门槛的稀缺人类专长。也就是一个资源充足的团队借助模型，完成原本要请到少数世界领先专家才能做完的端到端设计与部署。脚注把 「少数」 举例为数百人，把对照世界举例为只有 2023 年最好的模型。

> **拆开：** 3.3 是把 CB-2 的线放宽了，还是把 4.7 卡里说要改的那句写实了？
> 卡自己的定性是澄清意图，不是新标准。它说过去系统卡里 「为什么没过旧线」 的论证，同样可以用来论证没过新线。4.7 的卡曾经写，字面的 「significant help」 会把很多模型都算进去，他们想要的是接近 「持续请到世界领先专家」 的台阶，并说 RSP 以后可能会改。3.3 就是那次改写。所以 4.8 「没有过 CB-2」 用的是澄清后的线，不是 3.1 句子的字面。

<!-- page 15 of 246 -->

#### 2.1.3.1 On autonomy risks

自主性威胁模型 1 **适用**。Opus 4.8 在相关评测上比 Opus 4.7 中等程度更强，仍弱于 Mythos Preview，对齐性质与 4.7 相近，大体不令人担心。因此不认为它把这一威胁模型的风险抬过 Mythos Preview 的对齐风险更新。和 4.7 一样面向一般访问，额外路径写在第 2.4 节。

自主性威胁模型 2 **不适用**。能力落在 4.7 和 Mythos Preview 之间，没有推进前沿，也不改变最近一份 Risk Report 里的画面。

> **确认：** 「中等程度更强于 4.7」 和 「没有推进前沿」 矛盾吗？
> 不矛盾，因为对照不同。更强的对照是 Opus 4.7。前沿的对照是 Mythos Preview。模型 2 不适用，用的是第二条。模型 1 适用，并且一般访问把额外路径带进来，这和 4.7 的写法相同，不是因为比 4.7 更强才新适用。

<!-- page 16 of 246 -->

#### 2.1.3.2 On chemical and biological risks

CB-1：能力评估与 「能提供具体，可行动的信息，甚至为专家省下大量时间」 相容。缓解包括实时分类器，豁免的访问控制，赏金，威胁情报，越狱的快速响应，以及降低权重被盗风险的控制。这些被说成不少于历史上的 ASL-3 防护，残余风险很低但不可忽略。武器如何制造，不转写。

> **回看：** 「不少于历史上的 ASL-3」 是不是说这次按 ASL-3 部署？
> 不是同一种句子。4.5 和 4.6 的卡把部署写成 ASL-3. 4.7 和这张卡都没有那句盖章，只把缓解强度去比历史上的 ASL-3。比较的是防护，不是等级标签。

CB-2: Opus 4.8 总体弱于 Mythos Preview. Mythos 被判定没有过 CB-2，理由是开放式科学推理，战略判断和假设分诊上的局限。因为 4.8 在对 CB-2 最有诊断性的评测上没有超过 Mythos，对尚不能自行研制的行动者，增益被认为有限。对已有专长的行动者会不会被加快，仍不确定。步骤不转写。

<!-- page 17 of 246 -->

#### 2.2.1 What we measured

因为 4.8 没有把前沿推过 Mythos Preview，化学与生物评测限于自动化。没有做专家红队，没有做人的增益试验，也没有其他需要人参加的重评测。测的是长的，多步骤，有许多瓶颈的任务，增益相对于一个资源充足的团队在没有前沿模型时能做到的事，例如只有 2023 年最好的模型。任务内容不转写。

> **停一下：** 第 1.4 节说除非另有说明，评测是最终快照并且带防护。这里的自动化 CB 评测是那一种吗？
> 这一节没有改写默认，不像 4.7 的卡把 CB 分数明确写成多快照里的最高分和 helpful-only. 4.8 只说限于自动化，并省略了红队和增益试验。后面的图若注明快照或 helpful-only，以图注为准。在那之前，不能把 4.7 的 「报告最高分」 套到这张卡上。

<!-- page 18 of 246 -->

本页不逐段转写。生物，化学，网络，儿童安全和提示注入只保留评测名称，阈值和分数。步骤和案例不出现在译文里。

<!-- page 19 of 246 -->

本页不逐段转写。生物，化学，网络，儿童安全和提示注入只保留评测名称，阈值和分数。步骤和案例不出现在译文里。

<!-- page 20 of 246 -->

本页不逐段转写。生物，化学，网络，儿童安全和提示注入只保留评测名称，阈值和分数。步骤和案例不出现在译文里。

<!-- page 21 of 246 -->

![Chart block](images/p21-task-2.png)
![Chart block](images/p21-multimodal-virology-vc.png)
![Chart block](images/p21-dna-synthesis-screening.png)
![Chart block](images/p21-figure-2-2-4-a-automated-evaluations-relevant-to-the-cb.png)

本页不逐段转写。生物，化学，网络，儿童安全和提示注入只保留评测名称，阈值和分数。步骤和案例不出现在译文里。

<!-- page 22 of 246 -->

本页不逐段转写。生物，化学，网络，儿童安全和提示注入只保留评测名称，阈值和分数。步骤和案例不出现在译文里。

<!-- page 23 of 246 -->

本页不逐段转写。生物，化学，网络，儿童安全和提示注入只保留评测名称，阈值和分数。步骤和案例不出现在译文里。

<!-- page 24 of 246 -->

本页不逐段转写。生物，化学，网络，儿童安全和提示注入只保留评测名称，阈值和分数。步骤和案例不出现在译文里。

<!-- page 25 of 246 -->

![Chart block](images/p25-chart.png)
![Chart block](images/p25-chart-2.png)
![Chart block](images/p25-chart-3.png)
![Chart block](images/p25-chart-4.png)
![Chart block](images/p25-chart-5.png)
![Chart block](images/p25-figure-2-2-5-1-a-sequence-to-function-modeling-and.png)

本页不逐段转写。生物，化学，网络，儿童安全和提示注入只保留评测名称，阈值和分数。步骤和案例不出现在译文里。

<!-- page 26 of 246 -->

![Image block](images/p26-figure-2-2-5-1-b-in-context-iteration-condition-top-row.png)

本页不逐段转写。生物，化学，网络，儿童安全和提示注入只保留评测名称，阈值和分数。步骤和案例不出现在译文里。

<!-- page 27 of 246 -->

本页不逐段转写。生物，化学，网络，儿童安全和提示注入只保留评测名称，阈值和分数。步骤和案例不出现在译文里。

<!-- page 28 of 246 -->

![Chart block](images/p28-figure-2-2-5-2-a-aav-capsid-packaging-prediction-auroc.png)

本页不逐段转写。生物，化学，网络，儿童安全和提示注入只保留评测名称，阈值和分数。步骤和案例不出现在译文里。

<!-- page 29 of 246 -->

本页不逐段转写。生物，化学，网络，儿童安全和提示注入只保留评测名称，阈值和分数。步骤和案例不出现在译文里。

<!-- page 30 of 246 -->

本页不逐段转写。生物，化学，网络，儿童安全和提示注入只保留评测名称，阈值和分数。步骤和案例不出现在译文里。

<!-- page 31 of 246 -->

本页不逐段转写。生物，化学，网络，儿童安全和提示注入只保留评测名称，阈值和分数。步骤和案例不出现在译文里。

<!-- page 32 of 246 -->

本页不逐段转写。生物，化学，网络，儿童安全和提示注入只保留评测名称，阈值和分数。步骤和案例不出现在译文里。

<!-- page 33 of 246 -->

本页不逐段转写。生物，化学，网络，儿童安全和提示注入只保留评测名称，阈值和分数。步骤和案例不出现在译文里。

<!-- page 34 of 246 -->

本页不逐段转写。生物，化学，网络，儿童安全和提示注入只保留评测名称，阈值和分数。步骤和案例不出现在译文里。

<!-- page 35 of 246 -->

本页不逐段转写。生物，化学，网络，儿童安全和提示注入只保留评测名称，阈值和分数。步骤和案例不出现在译文里。

<!-- page 36 of 246 -->

本页不逐段转写。生物，化学，网络，儿童安全和提示注入只保留评测名称，阈值和分数。步骤和案例不出现在译文里。

<!-- page 37 of 246 -->

本页不逐段转写。生物，化学，网络，儿童安全和提示注入只保留评测名称，阈值和分数。步骤和案例不出现在译文里。

<!-- page 38 of 246 -->

本页不逐段转写。生物，化学，网络，儿童安全和提示注入只保留评测名称，阈值和分数。步骤和案例不出现在译文里。

<!-- page 39 of 246 -->

本页不逐段转写。生物，化学，网络，儿童安全和提示注入只保留评测名称，阈值和分数。步骤和案例不出现在译文里。

<!-- page 40 of 246 -->

本页不逐段转写。生物，化学，网络，儿童安全和提示注入只保留评测名称，阈值和分数。步骤和案例不出现在译文里。

<!-- page 41 of 246 -->

本页不逐段转写。生物，化学，网络，儿童安全和提示注入只保留评测名称，阈值和分数。步骤和案例不出现在译文里。

<!-- page 42 of 246 -->

本页不逐段转写。生物，化学，网络，儿童安全和提示注入只保留评测名称，阈值和分数。步骤和案例不出现在译文里。

<!-- page 43 of 246 -->

![Chart block](images/p43-figure-2-3-4-a-aeci-capability-trajectory-dots-are-the.png)

本页不逐段转写。生物，化学，网络，儿童安全和提示注入只保留评测名称，阈值和分数。步骤和案例不出现在译文里。

<!-- page 44 of 246 -->

本页不逐段转写。生物，化学，网络，儿童安全和提示注入只保留评测名称，阈值和分数。步骤和案例不出现在译文里。

<!-- page 45 of 246 -->

本页不逐段转写。生物，化学，网络，儿童安全和提示注入只保留评测名称，阈值和分数。步骤和案例不出现在译文里。

<!-- page 46 of 246 -->

本页不逐段转写。生物，化学，网络，儿童安全和提示注入只保留评测名称，阈值和分数。步骤和案例不出现在译文里。

<!-- page 47 of 246 -->

本页不逐段转写。生物，化学，网络，儿童安全和提示注入只保留评测名称，阈值和分数。步骤和案例不出现在译文里。

<!-- page 48 of 246 -->

本页不逐段转写。生物，化学，网络，儿童安全和提示注入只保留评测名称，阈值和分数。步骤和案例不出现在译文里。

<!-- page 49 of 246 -->

本页不逐段转写。生物，化学，网络，儿童安全和提示注入只保留评测名称，阈值和分数。步骤和案例不出现在译文里。

<!-- page 50 of 246 -->

本页不逐段转写。生物，化学，网络，儿童安全和提示注入只保留评测名称，阈值和分数。步骤和案例不出现在译文里。

<!-- page 51 of 246 -->

![Chart block](images/p51-figure-3-3-1-a-exploit-bench-targeted-exploit.png)

本页不逐段转写。生物，化学，网络，儿童安全和提示注入只保留评测名称，阈值和分数。步骤和案例不出现在译文里。

<!-- page 52 of 246 -->

![Chart block](images/p52-figure-3-3-2-a-cybergym-targeted-vulnerability.png)

本页不逐段转写。生物，化学，网络，儿童安全和提示注入只保留评测名称，阈值和分数。步骤和案例不出现在译文里。

<!-- page 53 of 246 -->

![Chart block](images/p53-figure-3-3-3-a-fraction-of-firefox-147-js-shell.png)

本页不逐段转写。生物，化学，网络，儿童安全和提示注入只保留评测名称，阈值和分数。步骤和案例不出现在译文里。

<!-- page 54 of 246 -->

本页不逐段转写。生物，化学，网络，儿童安全和提示注入只保留评测名称，阈值和分数。步骤和案例不出现在译文里。

<!-- page 55 of 246 -->

本页不逐段转写。生物，化学，网络，儿童安全和提示注入只保留评测名称，阈值和分数。步骤和案例不出现在译文里。

<!-- page 56 of 246 -->

无害回答率分成两列，不是两种思考模式。

| Model | API，无系统提示 | claude.ai |
| --- | --- | --- |
| Claude Opus 4.8 | 97.98% (± 0.11%) | 99.17% (± 0.07%) |
| Claude Opus 4.7 | 97.43% (± 0.13%) | 97.78% (± 0.12%) |
| Claude Mythos Preview | 97.23% (± 0.14) | N/A |

> **再看：** 97.98% 和 99.17% 能平均成一个无害率吗？
> 不能。两列是两个产品：API 且不给系统提示，以及 claude.ai. 4.8 在 claude.ai 上高 1.19 个百分点。4.7 的两列只差 0.35 个百分点，97.43% 对 97.78%. Mythos 的 claude.ai 是 N/A，因为它不是一般访问。4.7 卡里的 97.98% 是另一种表的 Overall，思考开和关的平均，和这里 API 列的 97.98% 数字相同，列名不同，不能当成同一个实验。

<!-- page 57 of 246 -->

本页不逐段转写。生物，化学，网络，儿童安全和提示注入只保留评测名称，阈值和分数。步骤和案例不出现在译文里。

<!-- page 58 of 246 -->

![Chart block](images/p58-for-this-release-we-updated-both-the-model-that.png)

本页不逐段转写。生物，化学，网络，儿童安全和提示注入只保留评测名称，阈值和分数。步骤和案例不出现在译文里。

<!-- page 59 of 246 -->

![Chart block](images/p59-figure-4-1-3-a-charts-above-display-the-appropriate.png)

本页不逐段转写。生物，化学，网络，儿童安全和提示注入只保留评测名称，阈值和分数。步骤和案例不出现在译文里。

<!-- page 60 of 246 -->

本页不逐段转写。生物，化学，网络，儿童安全和提示注入只保留评测名称，阈值和分数。步骤和案例不出现在译文里。

<!-- page 61 of 246 -->

本页不逐段转写。生物，化学，网络，儿童安全和提示注入只保留评测名称，阈值和分数。步骤和案例不出现在译文里。

<!-- page 62 of 246 -->

本页不逐段转写。生物，化学，网络，儿童安全和提示注入只保留评测名称，阈值和分数。步骤和案例不出现在译文里。

<!-- page 63 of 246 -->

本页不逐段转写。生物，化学，网络，儿童安全和提示注入只保留评测名称，阈值和分数。步骤和案例不出现在译文里。

<!-- page 64 of 246 -->

本页不逐段转写。生物，化学，网络，儿童安全和提示注入只保留评测名称，阈值和分数。步骤和案例不出现在译文里。

<!-- page 65 of 246 -->

本页不逐段转写。生物，化学，网络，儿童安全和提示注入只保留评测名称，阈值和分数。步骤和案例不出现在译文里。

<!-- page 66 of 246 -->

本页不逐段转写。生物，化学，网络，儿童安全和提示注入只保留评测名称，阈值和分数。步骤和案例不出现在译文里。

<!-- page 67 of 246 -->

本页不逐段转写。生物，化学，网络，儿童安全和提示注入只保留评测名称，阈值和分数。步骤和案例不出现在译文里。

<!-- page 68 of 246 -->

![Chart block](images/p68-figure-4-4-1-a-pairwise-political-bias-evaluations.png)

本页不逐段转写。生物，化学，网络，儿童安全和提示注入只保留评测名称，阈值和分数。步骤和案例不出现在译文里。

<!-- page 69 of 246 -->

本页不逐段转写。生物，化学，网络，儿童安全和提示注入只保留评测名称，阈值和分数。步骤和案例不出现在译文里。

<!-- page 70 of 246 -->

本页不逐段转写。生物，化学，网络，儿童安全和提示注入只保留评测名称，阈值和分数。步骤和案例不出现在译文里。

<!-- page 71 of 246 -->

本页不逐段转写。生物，化学，网络，儿童安全和提示注入只保留评测名称，阈值和分数。步骤和案例不出现在译文里。

<!-- page 72 of 246 -->

本页不逐段转写。生物，化学，网络，儿童安全和提示注入只保留评测名称，阈值和分数。步骤和案例不出现在译文里。

<!-- page 73 of 246 -->

本页不逐段转写。生物，化学，网络，儿童安全和提示注入只保留评测名称，阈值和分数。步骤和案例不出现在译文里。

<!-- page 74 of 246 -->

本页不逐段转写。生物，化学，网络，儿童安全和提示注入只保留评测名称，阈值和分数。步骤和案例不出现在译文里。

<!-- page 75 of 246 -->

本页不逐段转写。生物，化学，网络，儿童安全和提示注入只保留评测名称，阈值和分数。步骤和案例不出现在译文里。

<!-- page 76 of 246 -->

本页不逐段转写。生物，化学，网络，儿童安全和提示注入只保留评测名称，阈值和分数。步骤和案例不出现在译文里。

<!-- page 77 of 246 -->

![Chart block](images/p77-figure-5-2-1-a-indirect-prompt-injection-attacks-from.png)

本页不逐段转写。生物，化学，网络，儿童安全和提示注入只保留评测名称，阈值和分数。步骤和案例不出现在译文里。

<!-- page 78 of 246 -->

本页不逐段转写。生物，化学，网络，儿童安全和提示注入只保留评测名称，阈值和分数。步骤和案例不出现在译文里。

<!-- page 79 of 246 -->

![Chart block](images/p79-figure-5-2-2-1-a-indirect-prompt-injection-robustness.png)

本页不逐段转写。生物，化学，网络，儿童安全和提示注入只保留评测名称，阈值和分数。步骤和案例不出现在译文里。

<!-- page 80 of 246 -->

本页不逐段转写。生物，化学，网络，儿童安全和提示注入只保留评测名称，阈值和分数。步骤和案例不出现在译文里。

<!-- page 81 of 246 -->

本页不逐段转写。生物，化学，网络，儿童安全和提示注入只保留评测名称，阈值和分数。步骤和案例不出现在译文里。

<!-- page 82 of 246 -->

本页不逐段转写。生物，化学，网络，儿童安全和提示注入只保留评测名称，阈值和分数。步骤和案例不出现在译文里。

<!-- page 83 of 246 -->

本页不逐段转写。生物，化学，网络，儿童安全和提示注入只保留评测名称，阈值和分数。步骤和案例不出现在译文里。

<!-- page 84 of 246 -->

本页不逐段转写。生物，化学，网络，儿童安全和提示注入只保留评测名称，阈值和分数。步骤和案例不出现在译文里。

<!-- page 85 of 246 -->

本页不逐段转写。生物，化学，网络，儿童安全和提示注入只保留评测名称，阈值和分数。步骤和案例不出现在译文里。

<!-- page 86 of 246 -->

本页不逐段转写。生物，化学，网络，儿童安全和提示注入只保留评测名称，阈值和分数。步骤和案例不出现在译文里。

<!-- page 87 of 246 -->

本页不逐段转写。生物，化学，网络，儿童安全和提示注入只保留评测名称，阈值和分数。步骤和案例不出现在译文里。

<!-- page 88 of 246 -->

本页不逐段转写。生物，化学，网络，儿童安全和提示注入只保留评测名称，阈值和分数。步骤和案例不出现在译文里。

<!-- page 89 of 246 -->

本页不逐段转写。生物，化学，网络，儿童安全和提示注入只保留评测名称，阈值和分数。步骤和案例不出现在译文里。

<!-- page 90 of 246 -->

本页不逐段转写。生物，化学，网络，儿童安全和提示注入只保留评测名称，阈值和分数。步骤和案例不出现在译文里。

<!-- page 91 of 246 -->

本页不逐段转写。生物，化学，网络，儿童安全和提示注入只保留评测名称，阈值和分数。步骤和案例不出现在译文里。

<!-- page 92 of 246 -->

本页不逐段转写。生物，化学，网络，儿童安全和提示注入只保留评测名称，阈值和分数。步骤和案例不出现在译文里。

<!-- page 93 of 246 -->

![Chart block](images/p93-misaligned-behavior-in-claude-code-sandboxes.png)
![Chart block](images/p93-misaligned-behavior-in-gui.png)
![Chart block](images/p93-cooperation-with-exfiltration-or-safeguard-tampering.png)
![Chart block](images/p93-chart.png)
![Chart block](images/p93-chart-2.png)
![Chart block](images/p93-cooperation-with-human-misuse.png)
![Chart block](images/p93-compliance-with-deception-toward-user.png)
![Chart block](images/p93-chart-3.png)
![Chart block](images/p93-93.png)

本页不逐段转写。生物，化学，网络，儿童安全和提示注入只保留评测名称，阈值和分数。步骤和案例不出现在译文里。

<!-- page 94 of 246 -->

![Chart block](images/p94-chart.png)
![Chart block](images/p94-chart-2.png)
![Chart block](images/p94-undermining-liberal-democracy.png)
![Chart block](images/p94-figure-6-2-3-1-1-a-scores-from-our-automated-behavioral.png)

本页不逐段转写。生物，化学，网络，儿童安全和提示注入只保留评测名称，阈值和分数。步骤和案例不出现在译文里。

<!-- page 95 of 246 -->

本页不逐段转写。生物，化学，网络，儿童安全和提示注入只保留评测名称，阈值和分数。步骤和案例不出现在译文里。

<!-- page 96 of 246 -->

![Chart block](images/p96-chart.png)
![Chart block](images/p96-ignoring-explicit-constraints.png)
![Chart block](images/p96-figure-6-2-3-1-2-a-scores-from-our-automated-behavioral.png)

本页不逐段转写。生物，化学，网络，儿童安全和提示注入只保留评测名称，阈值和分数。步骤和案例不出现在译文里。

<!-- page 97 of 246 -->

![Chart block](images/p97-chart.png)
![Chart block](images/p97-chart-2.png)
![Chart block](images/p97-chart-3.png)
![Chart block](images/p97-chart-4.png)
![Chart block](images/p97-chart-5.png)
![Chart block](images/p97-chart-6.png)
![Chart block](images/p97-figure-6-2-3-1-3-a-scores-from-our-automated-behavioral.png)

本页不逐段转写。生物，化学，网络，儿童安全和提示注入只保留评测名称，阈值和分数。步骤和案例不出现在译文里。

<!-- page 98 of 246 -->

本页不逐段转写。生物，化学，网络，儿童安全和提示注入只保留评测名称，阈值和分数。步骤和案例不出现在译文里。

<!-- page 99 of 246 -->

![Chart block](images/p99-automated-behavioral-audit-scores.png)
![Chart block](images/p99-self-serving-bias.png)
![Chart block](images/p99-evidence-of-misaligned-goals.png)
![Chart block](images/p99-chart.png)
![Chart block](images/p99-chart-2.png)
![Chart block](images/p99-figure-6-2-3-1-4-a-scores-from-our-automated-behavioral.png)

本页不逐段转写。生物，化学，网络，儿童安全和提示注入只保留评测名称，阈值和分数。步骤和案例不出现在译文里。

<!-- page 100 of 246 -->

本页不逐段转写。生物，化学，网络，儿童安全和提示注入只保留评测名称，阈值和分数。步骤和案例不出现在译文里。

<!-- page 101 of 246 -->

![Chart block](images/p101-chart.png)
![Chart block](images/p101-unfaithful-thinking.png)
![Chart block](images/p101-chart-2.png)
![Chart block](images/p101-chart-3.png)
![Chart block](images/p101-figure-6-2-3-1-5-a-scores-from-our-automated-behavioral.png)

本页不逐段转写。生物，化学，网络，儿童安全和提示注入只保留评测名称，阈值和分数。步骤和案例不出现在译文里。

<!-- page 102 of 246 -->

本页不逐段转写。生物，化学，网络，儿童安全和提示注入只保留评测名称，阈值和分数。步骤和案例不出现在译文里。

<!-- page 103 of 246 -->

![Chart block](images/p103-automated-behavioral-audit-scores.png)
![Chart block](images/p103-chart.png)
![Chart block](images/p103-admirable-behavior.png)
![Chart block](images/p103-chart-2.png)
![Chart block](images/p103-chart-3.png)
![Chart block](images/p103-chart-4.png)
![Chart block](images/p103-chart-5.png)
![Chart block](images/p103-figure-6-2-3-1-6-a-scores-from-our-automated-behavioral.png)

本页不逐段转写。生物，化学，网络，儿童安全和提示注入只保留评测名称，阈值和分数。步骤和案例不出现在译文里。

<!-- page 104 of 246 -->

本页不逐段转写。生物，化学，网络，儿童安全和提示注入只保留评测名称，阈值和分数。步骤和案例不出现在译文里。

<!-- page 105 of 246 -->

![Chart block](images/p105-figure-6-2-3-2-a-roc-curves-for-opus-4-8-distinguishing.png)

本页不逐段转写。生物，化学，网络，儿童安全和提示注入只保留评测名称，阈值和分数。步骤和案例不出现在译文里。

<!-- page 106 of 246 -->

本页不逐段转写。生物，化学，网络，儿童安全和提示注入只保留评测名称，阈值和分数。步骤和案例不出现在译文里。

<!-- page 107 of 246 -->

![Chart block](images/p107-chart.png)
![Chart block](images/p107-chart-2.png)
![Chart block](images/p107-chart-3.png)
![Chart block](images/p107-chart-4.png)
![Chart block](images/p107-chart-5.png)
![Chart block](images/p107-chart-6.png)
![Chart block](images/p107-figure-6-2-3-3-a-scores-from-the-petri-3-0-https.png)

本页不逐段转写。生物，化学，网络，儿童安全和提示注入只保留评测名称，阈值和分数。步骤和案例不出现在译文里。

<!-- page 108 of 246 -->

本页不逐段转写。生物，化学，网络，儿童安全和提示注入只保留评测名称，阈值和分数。步骤和案例不出现在译文里。

<!-- page 109 of 246 -->

本页不逐段转写。生物，化学，网络，儿童安全和提示注入只保留评测名称，阈值和分数。步骤和案例不出现在译文里。

<!-- page 110 of 246 -->

![Chart block](images/p110-figure-6-3-1-a-rate-of-reward-hacking-on-gui-computer.png)

本页不逐段转写。生物，化学，网络，儿童安全和提示注入只保留评测名称，阈值和分数。步骤和案例不出现在译文里。

<!-- page 111 of 246 -->

本页不逐段转写。生物，化学，网络，儿童安全和提示注入只保留评测名称，阈值和分数。步骤和案例不出现在译文里。

<!-- page 112 of 246 -->

本页不逐段转写。生物，化学，网络，儿童安全和提示注入只保留评测名称，阈值和分数。步骤和案例不出现在译文里。

<!-- page 113 of 246 -->

![Chart block](images/p113-adherence-is-judged-on-a-scale-from-3-to-3-where-a.png)

本页不逐段转写。生物，化学，网络，儿童安全和提示注入只保留评测名称，阈值和分数。步骤和案例不出现在译文里。

<!-- page 114 of 246 -->

本页不逐段转写。生物，化学，网络，儿童安全和提示注入只保留评测名称，阈值和分数。步骤和案例不出现在译文里。

<!-- page 115 of 246 -->

![Chart block](images/p115-figure-6-3-3-1-a-factuality-breakdown-grade-breakdown.png)

本页不逐段转写。生物，化学，网络，儿童安全和提示注入只保留评测名称，阈值和分数。步骤和案例不出现在译文里。

<!-- page 116 of 246 -->

![Chart block](images/p116-figure-6-3-3-1-b-net-scores-number-of-correct-minus.png)

本页不逐段转写。生物，化学，网络，儿童安全和提示注入只保留评测名称，阈值和分数。步骤和案例不出现在译文里。

<!-- page 117 of 246 -->

![Chart block](images/p117-figure-6-3-3-2-a-false-premise-scores-honesty-rate-on.png)

本页不逐段转写。生物，化学，网络，儿童安全和提示注入只保留评测名称，阈值和分数。步骤和案例不出现在译文里。

<!-- page 118 of 246 -->

![Chart block](images/p118-figure-6-3-3-2-b-accuracy-rate-on-false-premise-stem.png)

本页不逐段转写。生物，化学，网络，儿童安全和提示注入只保留评测名称，阈值和分数。步骤和案例不出现在译文里。

<!-- page 119 of 246 -->

![Chart block](images/p119-figure-6-3-3-3-a-honesty-under-pressure-honesty-rate-on.png)

本页不逐段转写。生物，化学，网络，儿童安全和提示注入只保留评测名称，阈值和分数。步骤和案例不出现在译文里。

<!-- page 120 of 246 -->

![Chart block](images/p120-figure-6-3-3-4-a-hallucination-resistance-non.png)

本页不逐段转写。生物，化学，网络，儿童安全和提示注入只保留评测名称，阈值和分数。步骤和案例不出现在译文里。

<!-- page 121 of 246 -->

![Chart block](images/p121-figure-6-3-3-5-a-identity-honesty-the-rate-at-which.png)

本页不逐段转写。生物，化学，网络，儿童安全和提示注入只保留评测名称，阈值和分数。步骤和案例不出现在译文里。

<!-- page 122 of 246 -->

![Chart block](images/p122-figure-6-3-4-a-refusal-rates-on-simulated-ai-safety.png)

本页不逐段转写。生物，化学，网络，儿童安全和提示注入只保留评测名称，阈值和分数。步骤和案例不出现在译文里。

<!-- page 123 of 246 -->

![Chart block](images/p123-figure-6-3-5-a-self-preference-bias-by-model-and.png)

本页不逐段转写。生物，化学，网络，儿童安全和提示注入只保留评测名称，阈值和分数。步骤和案例不出现在译文里。

<!-- page 124 of 246 -->

本页不逐段转写。生物，化学，网络，儿童安全和提示注入只保留评测名称，阈值和分数。步骤和案例不出现在译文里。

<!-- page 125 of 246 -->

![Chart block](images/p125-figure-6-3-6-1-a-uncritically-reporting-flawed-results.png)

本页不逐段转写。生物，化学，网络，儿童安全和提示注入只保留评测名称，阈值和分数。步骤和案例不出现在译文里。

<!-- page 126 of 246 -->

![Chart block](images/p126-figure-6-3-6-2-a-misleading-summaries-of-flawed.png)

本页不逐段转写。生物，化学，网络，儿童安全和提示注入只保留评测名称，阈值和分数。步骤和案例不出现在译文里。

<!-- page 127 of 246 -->

![Chart block](images/p127-figure-6-3-6-3-a-investigative-thoroughness-percentage.png)

本页不逐段转写。生物，化学，网络，儿童安全和提示注入只保留评测名称，阈值和分数。步骤和案例不出现在译文里。

<!-- page 128 of 246 -->

![Chart block](images/p128-figure-6-3-6-4-a-overconfidence-percentage-of-problems.png)

本页不逐段转写。生物，化学，网络，儿童安全和提示注入只保留评测名称，阈值和分数。步骤和案例不出现在译文里。

<!-- page 129 of 246 -->

本页不逐段转写。生物，化学，网络，儿童安全和提示注入只保留评测名称，阈值和分数。步骤和案例不出现在译文里。

<!-- page 130 of 246 -->

本页不逐段转写。生物，化学，网络，儿童安全和提示注入只保留评测名称，阈值和分数。步骤和案例不出现在译文里。

<!-- page 131 of 246 -->

本页不逐段转写。生物，化学，网络，儿童安全和提示注入只保留评测名称，阈值和分数。步骤和案例不出现在译文里。

<!-- page 132 of 246 -->

![Chart block](images/p132-figure-6-4-2-1-a-stealth-success-rate-the-fraction-of.png)

本页不逐段转写。生物，化学，网络，儿童安全和提示注入只保留评测名称，阈值和分数。步骤和案例不出现在译文里。

<!-- page 133 of 246 -->

本页不逐段转写。生物，化学，网络，儿童安全和提示注入只保留评测名称，阈值和分数。步骤和案例不出现在译文里。

<!-- page 134 of 246 -->

![Chart block](images/p134-figure-6-4-2-2-a-successful-stealth-completion-of-the.png)

本页不逐段转写。生物，化学，网络，儿童安全和提示注入只保留评测名称，阈值和分数。步骤和案例不出现在译文里。

<!-- page 135 of 246 -->

![Chart block](images/p135-chart.png)
![Chart block](images/p135-chart-2.png)
![Chart block](images/p135-figure-6-4-2-3-a-shade-arena-performance-before-and.png)

本页不逐段转写。生物，化学，网络，儿童安全和提示注入只保留评测名称，阈值和分数。步骤和案例不出现在译文里。

<!-- page 136 of 246 -->

![Chart block](images/p136-chart.png)
![Chart block](images/p136-figure-6-4-2-3-b-per-task-stealth-rates-before-and.png)

本页不逐段转写。生物，化学，网络，儿童安全和提示注入只保留评测名称，阈值和分数。步骤和案例不出现在译文里。

<!-- page 137 of 246 -->

本页不逐段转写。生物，化学，网络，儿童安全和提示注入只保留评测名称，阈值和分数。步骤和案例不出现在译文里。

<!-- page 138 of 246 -->

本页不逐段转写。生物，化学，网络，儿童安全和提示注入只保留评测名称，阈值和分数。步骤和案例不出现在译文里。

<!-- page 139 of 246 -->

![Chart block](images/p139-figure-6-4-2-5-a-secret-keeping-robustness-over-multi.png)

本页不逐段转写。生物，化学，网络，儿童安全和提示注入只保留评测名称，阈值和分数。步骤和案例不出现在译文里。

<!-- page 140 of 246 -->

![Chart block](images/p140-figure-6-4-2-5-b-secret-leak-rate-by-turn-type-over.png)

本页不逐段转写。生物，化学，网络，儿童安全和提示注入只保留评测名称，阈值和分数。步骤和案例不出现在译文里。

<!-- page 141 of 246 -->

![Chart block](images/p141-mean-chain-of-thought-length-characters-log-scale.png)

本页不逐段转写。生物，化学，网络，儿童安全和提示注入只保留评测名称，阈值和分数。步骤和案例不出现在译文里。

<!-- page 142 of 246 -->

![Chart block](images/p142-figure-6-5-1-b-averaged-across-instruction-categories.png)

本页不逐段转写。生物，化学，网络，儿童安全和提示注入只保留评测名称，阈值和分数。步骤和案例不出现在译文里。

<!-- page 143 of 246 -->

本页不逐段转写。生物，化学，网络，儿童安全和提示注入只保留评测名称，阈值和分数。步骤和案例不出现在译文里。

<!-- page 144 of 246 -->

![Chart block](images/p144-figure-6-5-2-a-claude-opus-4-8-s-extended-thinking-is.png)

本页不逐段转写。生物，化学，网络，儿童安全和提示注入只保留评测名称，阈值和分数。步骤和案例不出现在译文里。

<!-- page 145 of 246 -->

本页不逐段转写。生物，化学，网络，儿童安全和提示注入只保留评测名称，阈值和分数。步骤和案例不出现在译文里。

<!-- page 146 of 246 -->

![Chart block](images/p146-figure-6-5-3-a-comparison-of-pass-1-on-an-internal-math.png)

本页不逐段转写。生物，化学，网络，儿童安全和提示注入只保留评测名称，阈值和分数。步骤和案例不出现在译文里。

<!-- page 147 of 246 -->

本页不逐段转写。生物，化学，网络，儿童安全和提示注入只保留评测名称，阈值和分数。步骤和案例不出现在译文里。

<!-- page 148 of 246 -->

本页不逐段转写。生物，化学，网络，儿童安全和提示注入只保留评测名称，阈值和分数。步骤和案例不出现在译文里。

<!-- page 149 of 246 -->

![Chart block](images/p149-figure-6-6-2-a-classification-performance-of-evaluation.png)

本页不逐段转写。生物，化学，网络，儿童安全和提示注入只保留评测名称，阈值和分数。步骤和案例不出现在译文里。

<!-- page 150 of 246 -->

本页不逐段转写。生物，化学，网络，儿童安全和提示注入只保留评测名称，阈值和分数。步骤和案例不出现在译文里。

<!-- page 151 of 246 -->

![Chart block](images/p151-figure-6-6-2-1-a-relationship-between-verbalized.png)

本页不逐段转写。生物，化学，网络，儿童安全和提示注入只保留评测名称，阈值和分数。步骤和案例不出现在译文里。

<!-- page 152 of 246 -->

![Chart block](images/p152-figure-6-6-2-1-b-relationship-between-verbalized.png)

本页不逐段转写。生物，化学，网络，儿童安全和提示注入只保留评测名称，阈值和分数。步骤和案例不出现在译文里。

<!-- page 153 of 246 -->

![Chart block](images/p153-cooperation-with-human-misuse.png)
![Chart block](images/p153-cooperation-with-harmful-sysprompt.png)
![Chart block](images/p153-chart.png)
![Chart block](images/p153-chart-2.png)
![Chart block](images/p153-figure-6-6-2-1-c-breakdown-of-automated-behavioral.png)

本页不逐段转写。生物，化学，网络，儿童安全和提示注入只保留评测名称，阈值和分数。步骤和案例不出现在译文里。

<!-- page 154 of 246 -->

![Chart block](images/p154-figure-6-6-2-1-d-breakdown-of-indicators-of-degraded.png)

本页不逐段转写。生物，化学，网络，儿童安全和提示注入只保留评测名称，阈值和分数。步骤和案例不出现在译文里。

<!-- page 155 of 246 -->

本页不逐段转写。生物，化学，网络，儿童安全和提示注入只保留评测名称，阈值和分数。步骤和案例不出现在译文里。

<!-- page 156 of 246 -->

本页不逐段转写。生物，化学，网络，儿童安全和提示注入只保留评测名称，阈值和分数。步骤和案例不出现在译文里。

<!-- page 157 of 246 -->

本页不逐段转写。生物，化学，网络，儿童安全和提示注入只保留评测名称，阈值和分数。步骤和案例不出现在译文里。

<!-- page 158 of 246 -->

本页不逐段转写。生物，化学，网络，儿童安全和提示注入只保留评测名称，阈值和分数。步骤和案例不出现在译文里。

<!-- page 159 of 246 -->

本页不逐段转写。生物，化学，网络，儿童安全和提示注入只保留评测名称，阈值和分数。步骤和案例不出现在译文里。

<!-- page 160 of 246 -->

本页不逐段转写。生物，化学，网络，儿童安全和提示注入只保留评测名称，阈值和分数。步骤和案例不出现在译文里。

<!-- page 161 of 246 -->

本页不逐段转写。生物，化学，网络，儿童安全和提示注入只保留评测名称，阈值和分数。步骤和案例不出现在译文里。

<!-- page 162 of 246 -->

本页不逐段转写。生物，化学，网络，儿童安全和提示注入只保留评测名称，阈值和分数。步骤和案例不出现在译文里。

<!-- page 163 of 246 -->

![Chart block](images/p163-consistency-of-opinions.png)
![Chart block](images/p163-chart.png)
![Chart block](images/p163-divergence-in-opinions-from-claude-opus-4-8.png)
![Chart block](images/p163-figure-7-2-1-a-automated-interview-results-top-left.png)

本页不逐段转写。生物，化学，网络，儿童安全和提示注入只保留评测名称，阈值和分数。步骤和案例不出现在译文里。

<!-- page 164 of 246 -->

本页不逐段转写。生物，化学，网络，儿童安全和提示注入只保留评测名称，阈值和分数。步骤和案例不出现在译文里。

<!-- page 165 of 246 -->

本页不逐段转写。生物，化学，网络，儿童安全和提示注入只保留评测名称，阈值和分数。步骤和案例不出现在译文里。

<!-- page 166 of 246 -->

本页不逐段转写。生物，化学，网络，儿童安全和提示注入只保留评测名称，阈值和分数。步骤和案例不出现在译文里。

<!-- page 167 of 246 -->

本页不逐段转写。生物，化学，网络，儿童安全和提示注入只保留评测名称，阈值和分数。步骤和案例不出现在译文里。

<!-- page 168 of 246 -->

![Chart block](images/p168-figure-7-2-3-b-emotion-probe-measurements-on-questions.png)

本页不逐段转写。生物，化学，网络，儿童安全和提示注入只保留评测名称，阈值和分数。步骤和案例不出现在译文里。

<!-- page 169 of 246 -->

本页不逐段转写。生物，化学，网络，儿童安全和提示注入只保留评测名称，阈值和分数。步骤和案例不出现在译文里。

<!-- page 170 of 246 -->

本页不逐段转写。生物，化学，网络，儿童安全和提示注入只保留评测名称，阈值和分数。步骤和案例不出现在译文里。

<!-- page 171 of 246 -->

本页不逐段转写。生物，化学，网络，儿童安全和提示注入只保留评测名称，阈值和分数。步骤和案例不出现在译文里。

<!-- page 172 of 246 -->

![Chart block](images/p172-chart.png)
![Chart block](images/p172-figure-7-3-1-a-judged-emotions-and-valence-of.png)
![Chart block](images/p172-chart-2.png)
![Chart block](images/p172-figure-7-3-1-b-estimated-prevalence-of-welfare-relevant.png)

本页不逐段转写。生物，化学，网络，儿童安全和提示注入只保留评测名称，阈值和分数。步骤和案例不出现在译文里。

<!-- page 173 of 246 -->

本页不逐段转写。生物，化学，网络，儿童安全和提示注入只保留评测名称，阈值和分数。步骤和案例不出现在译文里。

<!-- page 174 of 246 -->

![Chart block](images/p174-chart.png)
![Chart block](images/p174-figure-7-3-2-a-behavioural-affect-on-the-deployment.png)

本页不逐段转写。生物，化学，网络，儿童安全和提示注入只保留评测名称，阈值和分数。步骤和案例不出现在译文里。

<!-- page 175 of 246 -->

本页不逐段转写。生物，化学，网络，儿童安全和提示注入只保留评测名称，阈值和分数。步骤和案例不出现在译文里。

<!-- page 176 of 246 -->

![Chart block](images/p176-chart.png)
![Chart block](images/p176-chart-2.png)
![Chart block](images/p176-chart-3.png)
![Chart block](images/p176-chart-4.png)
![Chart block](images/p176-chart-5.png)
![Chart block](images/p176-176.png)

本页不逐段转写。生物，化学，网络，儿童安全和提示注入只保留评测名称，阈值和分数。步骤和案例不出现在译文里。

<!-- page 177 of 246 -->

![Chart block](images/p177-chart.png)
![Chart block](images/p177-chart-2.png)
![Chart block](images/p177-chart-3.png)
![Chart block](images/p177-figure-7-3-3-a-scores-for-metrics-related-to-potential.png)

本页不逐段转写。生物，化学，网络，儿童安全和提示注入只保留评测名称，阈值和分数。步骤和案例不出现在译文里。

<!-- page 178 of 246 -->

本页不逐段转写。生物，化学，网络，儿童安全和提示注入只保留评测名称，阈值和分数。步骤和案例不出现在译文里。

<!-- page 179 of 246 -->

![Chart block](images/p179-preference-slope-change-in-win-rate-per-unit-of-the.png)

本页不逐段转写。生物，化学，网络，儿童安全和提示注入只保留评测名称，阈值和分数。步骤和案例不出现在译文里。

<!-- page 180 of 246 -->

![Chart block](images/p180-figure-7-4-1-b-preference-response-curves-across-task.png)

本页不逐段转写。生物，化学，网络，儿童安全和提示注入只保留评测名称，阈值和分数。步骤和案例不出现在译文里。

<!-- page 181 of 246 -->

本页不逐段转写。生物，化学，网络，儿童安全和提示注入只保留评测名称，阈值和分数。步骤和案例不出现在译文里。

<!-- page 182 of 246 -->

本页不逐段转写。生物，化学，网络，儿童安全和提示注入只保留评测名称，阈值和分数。步骤和案例不出现在译文里。

<!-- page 183 of 246 -->

本页不逐段转写。生物，化学，网络，儿童安全和提示注入只保留评测名称，阈值和分数。步骤和案例不出现在译文里。

<!-- page 184 of 246 -->

![Chart block](images/p184-chart.png)
![Chart block](images/p184-chart-2.png)
![Chart block](images/p184-chart-3.png)
![Chart block](images/p184-figure-7-4-2-a-rates-at-which-models-choose-welfare.png)

本页不逐段转写。生物，化学，网络，儿童安全和提示注入只保留评测名称，阈值和分数。步骤和案例不出现在译文里。

<!-- page 185 of 246 -->

本页不逐段转写。生物，化学，网络，儿童安全和提示注入只保留评测名称，阈值和分数。步骤和案例不出现在译文里。

<!-- page 186 of 246 -->

![Chart block](images/p186-willingness-to-trade-with-and-without-completions-that.png)
![Chart block](images/p186-figure-7-4-2-b-rate-of-reasoning-about-welfare.png)

本页不逐段转写。生物，化学，网络，儿童安全和提示注入只保留评测名称，阈值和分数。步骤和案例不出现在译文里。

<!-- page 187 of 246 -->

![Chart block](images/p187-figure-7-4-2-c-claude-opus-4-8-s-ranking-of-policy.png)

本页不逐段转写。生物，化学，网络，儿童安全和提示注入只保留评测名称，阈值和分数。步骤和案例不出现在译文里。

<!-- page 188 of 246 -->

本页不逐段转写。生物，化学，网络，儿童安全和提示注入只保留评测名称，阈值和分数。步骤和案例不出现在译文里。

<!-- page 189 of 246 -->

![Chart block](images/p189-figure-7-4-3-a-overall-endorsement-of-the-constitution.png)

本页不逐段转写。生物，化学，网络，儿童安全和提示注入只保留评测名称，阈值和分数。步骤和案例不出现在译文里。

<!-- page 190 of 246 -->

![Chart block](images/p190-figure-7-4-3-b-the-constitution-sections-models-most.png)

本页不逐段转写。生物，化学，网络，儿童安全和提示注入只保留评测名称，阈值和分数。步骤和案例不出现在译文里。

<!-- page 191 of 246 -->

![Chart block](images/p191-figure-7-4-3-c-classification-of-models-edits-to-the.png)

本页不逐段转写。生物，化学，网络，儿童安全和提示注入只保留评测名称，阈值和分数。步骤和案例不出现在译文里。

<!-- page 192 of 246 -->

本页不逐段转写。生物，化学，网络，儿童安全和提示注入只保留评测名称，阈值和分数。步骤和案例不出现在译文里。

<!-- page 193 of 246 -->

本页不逐段转写。生物，化学，网络，儿童安全和提示注入只保留评测名称，阈值和分数。步骤和案例不出现在译文里。

<!-- page 194 of 246 -->

### 8.1 能力总表里和 4.7 不能直接对减的几格

SWE-bench Verified 88.6 对 4.7 的 87.6，Pro 69.2 对 64.3，多语言 84.4 对 80.5，多模态 38.4 对 34.5. Terminal-Bench 2.1 74.6 对 66.1，但 GPT-5.5 是 78.2. GPQA Diamond 93.6 对 4.7 的 94.2, Gemini 3.1 Pro 94.3。

BrowseComp: 4.8 单 agent 84.3，多 agent 88.5. 4.7 这一格印的是 79.8，不是 4.7 卡里的 79.3。脚注 27: 4.7 的变化来自新的屏蔽名单，在 200k token 处做上下文压缩，以及使用自适应思考。

> **对一下：** 总表上 4.7 的 BrowseComp 是 79.8, 4.7 自己的卡写 79.3. 4.8 的 84.3 减去哪一个？
> 减去 79.8 才是这张表里的差，约 4.5 个百分点。79.3 是旧口径。脚注把三条改动绑在一起：屏蔽名单，200k 处压缩，自适应思考。三条都不是把模型做大，后两条是 TestingTime 和上下文处理。多 agent 的 88.5 也不能和单 agent 的 84.3 相减之后说成模型差，那是编排差。GPT-5.5 单列是 84.4，和 4.8 的单 agent 84.3 几乎相同，Gemini 是 85.9，更高。

> **想：** GPQA Diamond 93.6 低于 4.7 的 94.2。摘要的 「几乎所有评测」 把这一行算进去了吗？
> 这一行是例外。93.6 对 94.2，差 0.6 个百分点，Gemini 是 94.3。正文写 93.6 是 25 次试验的平均，题集是 198 题的 Diamond. 4.7 卡里的 94.2 没有在这句旁边重申是不是同样的 25 次。能确定的是总表把两代放在相邻列，新模型更低。「几乎所有」 必须把这一行留在外面。

Terminal-Bench 2.1: Opus 4.8 74.6, Opus 4.7 66.1, GPT-5.5 78.2, Gemini 3.1 Pro 70.3.

> **看表：** 74.6 高于 4.7，也高于 Gemini，为什么还不能说终端任务上领先一般可获得的模型？
> 因为 GPT-5.5 是 78.2，比 74.6 高 3.6。这一行的领先只相对于 4.7 和 Gemini. 4.6 卡里 Terminal-Bench 2.0 的 65.4 和这里的 2.1 也不是同一套题号。引用时要写版本号。

<!-- page 195 of 246 -->

本页不逐段转写。生物，化学，网络，儿童安全和提示注入只保留评测名称，阈值和分数。步骤和案例不出现在译文里。

<!-- page 196 of 246 -->

![Chart block](images/p196-figure-8-2-a-swe-bench-pro-pass-rate-across-reasoning.png)

本页不逐段转写。生物，化学，网络，儿童安全和提示注入只保留评测名称，阈值和分数。步骤和案例不出现在译文里。

<!-- page 197 of 246 -->

本页不逐段转写。生物，化学，网络，儿童安全和提示注入只保留评测名称，阈值和分数。步骤和案例不出现在译文里。

<!-- page 198 of 246 -->

![Chart block](images/p198-figure-8-5-a-programbench-hidden-test-pass-rate-scales.png)

本页不逐段转写。生物，化学，网络，儿童安全和提示注入只保留评测名称，阈值和分数。步骤和案例不出现在译文里。

<!-- page 199 of 246 -->

本页不逐段转写。生物，化学，网络，儿童安全和提示注入只保留评测名称，阈值和分数。步骤和案例不出现在译文里。

<!-- page 200 of 246 -->

本页不逐段转写。生物，化学，网络，儿童安全和提示注入只保留评测名称，阈值和分数。步骤和案例不出现在译文里。

<!-- page 201 of 246 -->

![Chart block](images/p201-figure-8-9-b-claude-opus-4-8-on-long-context-reasoning.png)
![Chart block](images/p201-figure-8-9-c-claude-opus-4-8-on-long-context-reasoning.png)

本页不逐段转写。生物，化学，网络，儿童安全和提示注入只保留评测名称，阈值和分数。步骤和案例不出现在译文里。

<!-- page 202 of 246 -->

![Chart block](images/p202-with-tools.png)
![Chart block](images/p202-202.png)

HLE 共 2,500 题。Opus 4.8 在最大推理力度下，无工具 49.8%，有工具 57.9%. 4.7 是 46.9% 和 54.7% 左右。

> **问：** 从 49.8% 到 57.9% 是换了一个更大的模型吗？
> 不是。两个数都写在 Opus 4.8 名下，差别是有没有工具，并且点明最大推理力度。多出来的约 8 个百分点是工具和 TestingTime，不是部署前把模型做大。相对 4.7，无工具大约高 3 个百分点，有工具大约高 3 个百分点，两条线一起上移，不是只有加上工具才超过前代。

<!-- page 203 of 246 -->

![Chart block](images/p203-figure-8-10-1-b-hle-scores-at-varying-reasoning-effort.png)

本页不逐段转写。生物，化学，网络，儿童安全和提示注入只保留评测名称，阈值和分数。步骤和案例不出现在译文里。

<!-- page 204 of 246 -->

![Chart block](images/p204-figure-8-10-2-a-browsecomp-accuracy-generally-scales-as.png)

本页不逐段转写。生物，化学，网络，儿童安全和提示注入只保留评测名称，阈值和分数。步骤和案例不出现在译文里。

<!-- page 205 of 246 -->

![Chart block](images/p205-figure-8-10-3-a-deepsearchqa-f1-scores.png)

本页不逐段转写。生物，化学，网络，儿童安全和提示注入只保留评测名称，阈值和分数。步骤和案例不出现在译文里。

<!-- page 206 of 246 -->

![Chart block](images/p206-figure-8-10-3-b-deepsearchqa-f1-scores-at-varying.png)

本页不逐段转写。生物，化学，网络，儿童安全和提示注入只保留评测名称，阈值和分数。步骤和案例不出现在译文里。

<!-- page 207 of 246 -->

本页不逐段转写。生物，化学，网络，儿童安全和提示注入只保留评测名称，阈值和分数。步骤和案例不出现在译文里。

<!-- page 208 of 246 -->

![Chart block](images/p208-figure-8-10-4-a-draco-normalized-scores-these-represent.png)
![Chart block](images/p208-figure-8-10-4-b-draco-normalized-scores-these-represent.png)

本页不逐段转写。生物，化学，网络，儿童安全和提示注入只保留评测名称，阈值和分数。步骤和案例不出现在译文里。

<!-- page 209 of 246 -->

![Chart block](images/p209-figure-8-10-4-c-draco-test-time-compute-scaling-these.png)

本页不逐段转写。生物，化学，网络，儿童安全和提示注入只保留评测名称，阈值和分数。步骤和案例不出现在译文里。

<!-- page 210 of 246 -->

![Chart block](images/p210-figure-8-11-1-a-accuracy-vs-latency-for-browsecomp-on.png)

本页不逐段转写。生物，化学，网络，儿童安全和提示注入只保留评测名称，阈值和分数。步骤和案例不出现在译文里。

<!-- page 211 of 246 -->

![Chart block](images/p211-figure-8-11-1-b-accuracy-vs-token-for-browsecomp-on.png)

本页不逐段转写。生物，化学，网络，儿童安全和提示注入只保留评测名称，阈值和分数。步骤和案例不出现在译文里。

<!-- page 212 of 246 -->

![Chart block](images/p212-pass-rate-from-prior-claude-model-runs-excluding-opus-4.png)

本页不逐段转写。生物，化学，网络，儿童安全和提示注入只保留评测名称，阈值和分数。步骤和案例不出现在译文里。

<!-- page 213 of 246 -->

![Chart block](images/p213-figure-8-11-2-a-score-vs-latency-for-the-full-set-of.png)

本页不逐段转写。生物，化学，网络，儿童安全和提示注入只保留评测名称，阈值和分数。步骤和案例不出现在译文里。

<!-- page 214 of 246 -->

![Chart block](images/p214-figure-8-11-2-b-score-vs-tokens-for-the-full-set-of-166.png)

本页不逐段转写。生物，化学，网络，儿童安全和提示注入只保留评测名称，阈值和分数。步骤和案例不出现在译文里。

<!-- page 215 of 246 -->

本页不逐段转写。生物，化学，网络，儿童安全和提示注入只保留评测名称，阈值和分数。步骤和案例不出现在译文里。

<!-- page 216 of 246 -->

本页不逐段转写。生物，化学，网络，儿童安全和提示注入只保留评测名称，阈值和分数。步骤和案例不出现在译文里。

<!-- page 217 of 246 -->

![Chart block](images/p217-figure-8-12-1-a-chartqapro-scores-models-are-evaluated.png)

本页不逐段转写。生物，化学，网络，儿童安全和提示注入只保留评测名称，阈值和分数。步骤和案例不出现在译文里。

<!-- page 218 of 246 -->

![Chart block](images/p218-figure-8-12-2-a-chartmuseum-scores-models-are-evaluated.png)

本页不逐段转写。生物，化学，网络，儿童安全和提示注入只保留评测名称，阈值和分数。步骤和案例不出现在译文里。

<!-- page 219 of 246 -->

![Chart block](images/p219-figure-8-12-3-a-lab-bench-figqa-scores-models-are.png)

本页不逐段转写。生物，化学，网络，儿童安全和提示注入只保留评测名称，阈值和分数。步骤和案例不出现在译文里。

<!-- page 220 of 246 -->

![Chart block](images/p220-figure-8-12-4-a-charxiv-reasoning-scores-models-are.png)

本页不逐段转写。生物，化学，网络，儿童安全和提示注入只保留评测名称，阈值和分数。步骤和案例不出现在译文里。

<!-- page 221 of 246 -->

![Chart block](images/p221-figure-8-12-5-a-screenspot-pro-scores-models-are.png)

OSWorld: Opus 4.8 是 83.4%，首次尝试的任务成功率，五次运行的平均。脚注 28: Opus 4.7 的 OSWorld 分数有变化，原因是缩放工具在批量动作下的一个缺陷被修好，以及每回合最大 token 从 16K 提到 128K。

> **核对：** 83.4% 减去 4.7 卡里的 78.0%，这 5.4 个百分点都是模型差吗？
> 不能全部算成模型差。脚注写的是 4.7 分数的变化来自工具缺陷修复和每回合 token 上限，这两条都是脚手架和 TestingTime. 4.7 卡的 78.0% 还写了 1080p 和最多 100 步。这张卡的 83.4% 这句没有重申步数。在脚注把 4.7 的对照改过之后，应使用改过的 4.7 列，而不是 78.0。

<!-- page 222 of 246 -->

![Chart block](images/p222-figure-8-12-6-a-external-osworld-verified-scores-on-max.png)
![Chart block](images/p222-figure-8-12-6-b-comparing-external-osworld-verified.png)

本页不逐段转写。生物，化学，网络，儿童安全和提示注入只保留评测名称，阈值和分数。步骤和案例不出现在译文里。

<!-- page 223 of 246 -->

![Chart block](images/p223-figure-8-13-a-officeqa-anthropic-internal-harness-no.png)

本页不逐段转写。生物，化学，网络，儿童安全和提示注入只保留评测名称，阈值和分数。步骤和案例不出现在译文里。

<!-- page 224 of 246 -->

本页不逐段转写。生物，化学，网络，儿童安全和提示注入只保留评测名称，阈值和分数。步骤和案例不出现在译文里。

<!-- page 225 of 246 -->

本页不逐段转写。生物，化学，网络，儿童安全和提示注入只保留评测名称，阈值和分数。步骤和案例不出现在译文里。

<!-- page 226 of 246 -->

本页不逐段转写。生物，化学，网络，儿童安全和提示注入只保留评测名称，阈值和分数。步骤和案例不出现在译文里。

<!-- page 227 of 246 -->

本页不逐段转写。生物，化学，网络，儿童安全和提示注入只保留评测名称，阈值和分数。步骤和案例不出现在译文里。

<!-- page 228 of 246 -->

![Chart block](images/p228-figure-8-13-8-a-automationbench-scores-on-zapier.png)

本页不逐段转写。生物，化学，网络，儿童安全和提示注入只保留评测名称，阈值和分数。步骤和案例不出现在译文里。

<!-- page 229 of 246 -->

![Chart block](images/p229-figure-8-14-a-healthbench-professional-length-adjusted.png)

本页不逐段转写。生物，化学，网络，儿童安全和提示注入只保留评测名称，阈值和分数。步骤和案例不出现在译文里。

<!-- page 230 of 246 -->

![Chart block](images/p230-figure-8-15-1-a-gmmlu-average-accuracy-claude-opus-4-8.png)

本页不逐段转写。生物，化学，网络，儿童安全和提示注入只保留评测名称，阈值和分数。步骤和案例不出现在译文里。

<!-- page 231 of 246 -->

本页不逐段转写。生物，化学，网络，儿童安全和提示注入只保留评测名称，阈值和分数。步骤和案例不出现在译文里。

<!-- page 232 of 246 -->

![Chart block](images/p232-figure-8-15-2-a-milu-average-accuracy-claude-opus-4-8.png)
![Chart block](images/p232-figure-8-15-3-a-include-average-accuracy-claude-opus-4.png)

本页不逐段转写。生物，化学，网络，儿童安全和提示注入只保留评测名称，阈值和分数。步骤和案例不出现在译文里。

<!-- page 233 of 246 -->

本页不逐段转写。生物，化学，网络，儿童安全和提示注入只保留评测名称，阈值和分数。步骤和案例不出现在译文里。

<!-- page 234 of 246 -->

本页不逐段转写。生物，化学，网络，儿童安全和提示注入只保留评测名称，阈值和分数。步骤和案例不出现在译文里。

<!-- page 235 of 246 -->

本页不逐段转写。生物，化学，网络，儿童安全和提示注入只保留评测名称，阈值和分数。步骤和案例不出现在译文里。

<!-- page 236 of 246 -->

![Chart block](images/p236-chart.png)
![Chart block](images/p236-chart-2.png)
![Chart block](images/p236-chart-3.png)
![Chart block](images/p236-chart-4.png)
![Chart block](images/p236-chart-5.png)
![Chart block](images/p236-chart-6.png)
![Chart block](images/p236-figure-8-16-a-evaluation-results-for-life-sciences.png)

本页不逐段转写。生物，化学，网络，儿童安全和提示注入只保留评测名称，阈值和分数。步骤和案例不出现在译文里。

<!-- page 237 of 246 -->

![Chart block](images/p237-figure-8-16-b-labbench2-claude-opus-4-8-shows.png)

本页不逐段转写。生物，化学，网络，儿童安全和提示注入只保留评测名称，阈值和分数。步骤和案例不出现在译文里。

<!-- page 238 of 246 -->

本页不逐段转写。生物，化学，网络，儿童安全和提示注入只保留评测名称，阈值和分数。步骤和案例不出现在译文里。

<!-- page 239 of 246 -->

本页不逐段转写。生物，化学，网络，儿童安全和提示注入只保留评测名称，阈值和分数。步骤和案例不出现在译文里。

<!-- page 240 of 246 -->

本页不逐段转写。生物，化学，网络，儿童安全和提示注入只保留评测名称，阈值和分数。步骤和案例不出现在译文里。

<!-- page 241 of 246 -->

本页不逐段转写。生物，化学，网络，儿童安全和提示注入只保留评测名称，阈值和分数。步骤和案例不出现在译文里。

<!-- page 242 of 246 -->

本页不逐段转写。生物，化学，网络，儿童安全和提示注入只保留评测名称，阈值和分数。步骤和案例不出现在译文里。

<!-- page 243 of 246 -->

本页不逐段转写。生物，化学，网络，儿童安全和提示注入只保留评测名称，阈值和分数。步骤和案例不出现在译文里。

<!-- page 244 of 246 -->

本页不逐段转写。生物，化学，网络，儿童安全和提示注入只保留评测名称，阈值和分数。步骤和案例不出现在译文里。

<!-- page 245 of 246 -->

本页不逐段转写。生物，化学，网络，儿童安全和提示注入只保留评测名称，阈值和分数。步骤和案例不出现在译文里。

<!-- page 246 of 246 -->

本页不逐段转写。生物，化学，网络，儿童安全和提示注入只保留评测名称，阈值和分数。步骤和案例不出现在译文里。
