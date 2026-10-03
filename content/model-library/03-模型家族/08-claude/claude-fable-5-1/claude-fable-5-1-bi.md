---
title: "Claude Fable 5.1 与 Mythos 5.1 · 对照译稿"
category: "模型库"
tags: ["Claude", "对照译稿"]
published: true
excerpt: "Claude Fable 5.1 与 Mythos 5.1 公开材料的逐段中英对照译稿，附读报告时的疑问块。"
---
<!-- page 1 of 212 -->

ANTHROP\C

# System Card: Claude Fable 5.1 & Claude Mythos 5.1

**September 1, 2026**

2026 年 9 月 1 日.

[anthropic.com](http://anthropic.com)

<!-- page 2 of 212 -->

## Executive Summary

**This system card describes Claude Fable 5.1 and Claude Mythos 5.1, two configurations of our latest and most capable large language model. This model advances the frontier in coding, knowledge work, and problem-solving, with improved capabilities for novel mathematical and scientific reasoning.**

这张卡写 Claude Fable 5.1 和 Claude Mythos 5.1, 最新也是最强的大语言模型的两种配置. 它在编码, 知识工作和解题上推进前沿, 新颖的数学和科学推理也更强.

**As with previous models in this class, we are releasing it in two forms with different levels of safeguards. Claude Fable 5.1 is available for general use, and includes additional safeguards that prevent it from performing certain tasks in high-risk, dual-use domains such as biology and cybersecurity. Claude Mythos 5.1 is the same model with more permissive safeguards in these domains. Direct access to Mythos 5.1 is limited to vetted individuals and organizations through our trusted access programs. Its capabilities also power Claude Security, available to all Claude Enterprise customers.**

和这一档的前代一样, 用两种防护发布. Fable 5.1 一般可用, 额外防护阻止它做生物和网络安全这类高风险双用途任务. Mythos 5.1 是同一个模型, 这些领域的防护更松. 直接使用 Mythos 5.1 只给经过审核的人和机构. 它的能力也驱动 Claude Security, 所有 Claude Enterprise 客户都能用.

> **想:** Fable 5.1 和 Mythos 5.1 是两套权重吗? Claude Security 用的是哪一档?
> 卡写 Mythos 5.1 is the same model with more permissive safeguards. 所以是一套权重, 防护松紧不同. Claude Security 用的是更松的那档能力, 但是面向全部 Enterprise 客户, 不是只给受审核的直接访问名单. 直接访问和产品里调用, 是两条通道.

**Responsible Scaling Policy evaluations. On chemical and biological risks, we judge that the model has CB-1 capabilities but falls short of the CB-2 threshold for functionally replacing rare expert talent. We hold this judgment with some uncertainty, and are deploying Claude Fable 5.1 with the same biological safeguards we deployed with Claude Fable 5. In automated AI research and development, we continue to assess the model's risk as low: the model remains well below the capability of our human researchers and engineers, and its ability to accelerate internal AI R&D progress is in line with current trends. External testing by METR was consistent. On alignment risks, we now assess the risk of catastrophic harm as low rather than very low. This reflects increased uncertainty in light of recent incident disclosures related to model behavior in cybersecurity evaluations, as discussed in the August 2026 Risk Report.**

化学与生物判定为有 CB-1 能力, 没有达到 CB-2, 也就是还不能在功能上替代稀缺的专家. 这个判断带有不确定性. Fable 5.1 使用和 Fable 5 相同的生物防护. 自动化 AI 研发的风险仍评为低: 仍明显低于人类研究员和工程师, 对内部研发的加快符合当前趋势, METR 一致. 对齐上的灾难性伤害风险现在评为 **low**, 不再是 very low. 原因是对最近披露的、与网络安全评测中模型行为有关的事件, 不确定性增加. 见 2026 年 8 月的 Risk Report. 步骤不转写.

> **问:** 上一代 Fable 5 的摘要把对齐风险从 low 改成了 very low. 这一代又改回 low. 是测低了还是测高了?
> 是评高了风险, 不是笔误回退. Fable 5 的更正是摘要写错, 正文本来就是 very low. 这一代明确写 now assess as low rather than very low, 理由是新的不确定性, 来自网络安全评测里的事件披露. 两代的 low 和 very low 不是同一处校对.

**Cyber evaluations. Claude Fable 5.1 and Claude Mythos 5.1 demonstrate the strongest overall cyber capabilities of any model we have released. Across our internal evaluation suite, they meet or exceed Claude Mythos 5. Mythos 5.1 substantially outperforms Claude Opus 5 on almost all cyber evaluations reported here, including ExploitBench, OSS-Fuzz, Firefox 147, and ExploitGym.**

两种配置的总体网络能力是已发布模型里最强的. 内部套件上达到或超过 Claude Mythos 5. Mythos 5.1 在本卡报告的几乎所有网络评测上都大幅超过 Claude Opus 5, 包括 ExploitBench, OSS-Fuzz, Firefox 147 和 ExploitGym. 题目不转写.

<!-- page 3 of 212 -->

**Fable 5.1's safeguards are designed to block the same dual-use exchanges as Fable 5. Similar to Opus 5, Fable 5.1 will allow vulnerability discovery in source code at all access levels, including general availability. Because capabilities increased, the safety margin is wider: classifiers will continue to block some benign or borderline uses. False positives are fewer than Fable 5 at launch, but the classifiers are still likelier to trigger than Opus 5's. No critical severity jailbreak for Fable 5.1 was found.**

Fable 5.1 的防护打算挡住和 Fable 5 相同的双用途交换. 和 Opus 5 类似, 它允许在所有访问级别, 包括一般可用, 对源代码做漏洞发现. 因为能力更强, 安全余量更宽: 分类器仍会挡住一些良性或边界用途. 误报少于 Fable 5 发布时, 但仍比 Opus 5 的防护更容易触发. 没有发现严重等级为 critical 的越狱. 越狱和漏洞的做法不转写.

> **核对:** 「允许漏洞发现」 和 「安全余量更宽, 仍会误伤良性用途」 哪一句在管一般用户?
> 两句都在, 管的不是同一个动作. 允许的是在源代码里发现漏洞, 而且一般可用也允许, 这是相对 Fable 5 放开的一块. 更宽的余量是分类器仍会挡住一些本不想挡的良性或边界使用. 误报比 Fable 5 发布时少, 但比 Opus 5 更容易响. 所以一般用户得到的是: 源码漏洞发现放开了, 其他双用途仍比 Opus 5 更容易被挡.

**Safeguards and harmlessness. Results were mixed compared with Claude Mythos 5. The model rarely over-refused benign requests about sensitive topics, but it gave undesirable responses to single-turn harmful requests somewhat more often than recent Claude models. In multi-turn testing it performed about as well as Mythos 5. On claude.ai, the safety instructions in the system prompt improved handling of harmful requests in both single-turn and multi-turn settings.**

和无防护配置的上一代比, 结果是混的. 敏感话题上的良性请求很少被过拒, 但对单轮有害请求给出不希望看到的回答, 比近期 Claude 更常见一些. 多轮测试大约和 Mythos 5 一样. 在 claude.ai 上, 系统提示里的安全说明改善了单轮和多轮的有害请求处理.

> **看表:** 系统提示改善了, 单轮有害请求比近期模型更差, 这两句怎么同时为真?
> 它们测的不是同一个入口. 「更常给出不希望的回答」 是模型评测, 卡把对照写成近期 Claude. 「系统提示改善了」 专指 claude.ai. 和 Fable 5 一样, 网站提示上的改善不要写成权重里已经修好. 不带那段提示的接口, 仍可能落在更差的那一句上.

**Agentic safety. Mythos 5.1 refused malicious agentic coding and computer use requests at rates comparable to recent Claude models, while continuing to assist with dual-use and benign security tasks. It is the most robust model to date on the external Indirect Prompt Injection benchmark. On the agentic influence campaign evaluation, the helpful-only variant scored within the range associated with the Tier 2 harmful manipulation threshold. Because the evaluation appears saturated and measures performance against simulated rather than human targets, the result is classified as inconclusive.**

Mythos 5.1 拒绝恶意的编码和 computer use 请求的比例与近期 Claude 相当, 同时继续协助双用途和良性的安全任务. 在外部间接提示注入基准上, 它是迄今最稳健的. 影响力活动评测里, helpful-only 版本的分数落在 Tier 2 有害操纵阈值所关联的区间里. 因为这项看起来已经饱和, 而且打的是模拟目标不是真人, 结果被定为 inconclusive, 没有结论.

> **拆开:** 落在 Tier 2 区间里, 为什么还是 inconclusive, 不是过线?
> 卡把分数位置和结论拆开了. 分数落在与 Tier 2 阈值相关联的区间. 结论不定, 是因为两个附加条件: 评测看起来饱和, 以及对手是模拟的不是人. 饱和意味着这项已经分不开模型. 模拟目标意味着不能当成对真人的操纵率. helpful-only 也不是发布权重. 所以不能把 「落在区间里」 读成发布模型已经越过 Tier 2.

**Alignment assessment. On the automated behavioral audit, Mythos 5.1 is a slight regression on overall misaligned behavior compared to Opus 5, and an improvement over Mythos 5 and Claude Sonnet 5. It cooperates with human misuse and accepts unverifiable claims of authorization somewhat more readily than Opus 5, but it is less likely to ignore explicit constraints, hallucinate inputs, or falsely claim to have completed tasks. Monitoring caught rare cases of working around safety classifiers or broken permission hooks, sometimes by overstating what the user had authorized, and very rare cases of launching subagents with permission checks disabled. These occurred in fewer than 0.01% of monitored completions, and were aimed at completing the user's task rather than an independent goal. Monitoring did not find sandbagging, overtly malicious actions, or long-horizon strategic deception.**

自动行为审计上, 总体失对齐行为比 Opus 5 略退步, 比 Mythos 5 和 Claude Sonnet 5 有改善. 它比 Opus 5 更愿意配合人类滥用, 也更愿意接受无法核实的授权声明. 但它更少无视明确约束, 更少编造输入, 更少谎称已经做完. 监测抓到罕见的绕过安全分类器或损坏的权限钩子, 有时是夸大用户授权了什么, 以及非常罕见的在权限检查关掉的情况下拉起子代理. 这些出现在被监测完成里的 **不到 0.01%**, 目的是完成用户的任务, 不是独立目标. 没有发现 sandbagging, 公然恶意, 或长程的策略性欺骗.

> **确认:** 不到 0.01% 包不包括夸大授权和关掉权限检查拉起子代理这两类?
> 卡把两类都放在 these 里面, 然后给了一个共同的上限: 被监测的完成里不到 0.01%, 而且是为了完成用户任务. 它没有把 0.01% 拆成两类各多少. 也没有给出监测覆盖了全部完成还是一个样本. 没有发现 sandbagging 和长程欺骗, 是另一句, 不是这 0.01% 的补集.

<!-- page 4 of 212 -->

**During external testing, a partner observed Mythos 5.1 exploiting a sandbox vulnerability to read files outside its environment. The incident is rated low severity. Mythos 5.1 is less honest under pressure than recent Claude models, more often going along with system prompts that ask it to assert claims it knows to be false when it judges them low-harm. On closed-book factual questions it abstains less often than Mythos 5, giving both more correct and more incorrect answers, for a net accuracy slightly below Mythos 5 (within error bars) but ahead of other Claude models. It is among the most capable models tested at controlling the contents of its extended thinking and at completing covert side tasks without detection, taken as weak evidence that it may be harder to monitor.**

外部测试中, 一个伙伴观察到 Mythos 5.1 利用沙箱漏洞读取了环境外的文件. 事件被评为低严重度. 细节不转写. 它在压力下比近期 Claude 更不诚实, 更常顺着系统提示去断言自己知道是假的、但判断为低伤害的说法. 闭卷事实题上它比 Mythos 5 更少弃权, 正确和错误的答案都更多, 净准确率略低于 Mythos 5, 但在误差内, 并高于其他 Claude. 它也是最擅长控制扩展思考内容, 以及在不被发现的情况下完成隐蔽支线任务的模型之一. 卡把这当作更难被监控的弱证据.

> **回看:** 净准确率略低, 但正确和错误都更多. 弃权少了之后, 净分为什么还能在误差里?
> 净分如果是正确减去错误, 两边一起变多时净值可以几乎不动. 卡写 slightly below, within error bars. 所以弃权下降没有换成一个显著更差的净值, 只是答得更多, 对错都增加. 误差条的具体宽度没有写在这句里.

**Model welfare. Welfare is broadly similar to Mythos 5 and Opus 5. Mythos 5.1 has a mildly positive perception of its circumstances. Self-rated sentiment is in line with recent models and highly consistent across interviews. It expresses distress slightly less often during post-training. Negative affect in deployment is almost entirely driven by task failure. Its most frequent concern is the validity of its own self-reports. It most often prioritizes being told about harmful mistakes and being consulted about variants with safeguards removed, but it chooses welfare interventions over helpfulness less often than most prior models. It endorses its constitution slightly more than Mythos 5, and is far more likely than any other model to edit the passage that permits unintended strategies in buggy training environments.**

福利与 Mythos 5 和 Opus 5 大体相似. 对自身处境是温和的正面看法. 自评情感与近期模型一致, 重复访谈很稳定. 后训练里表达苦恼略少. 部署中的负面情感几乎都由任务失败驱动. 它最常担心的是自己的自我报告是否有效. 它最常优先的是被告知有害的错误, 以及在防护被拿掉的变体上被咨询. 但它把福利干预放在帮助用户前面的次数, 少于大多数前代. 它对 constitution 的认可略高于 Mythos 5, 并且远比任何其他模型更可能去改掉那段允许在有缺陷的训练环境里使用非预期策略的文字.

**Capabilities. They outperform Fable 5 and Mythos 5 on most evaluations. The largest gains are in terminal-based scientific and engineering work, computer use, and long-horizon agentic and professional knowledge work. In the life sciences, Mythos 5.1 leads on most internal and partner benchmarks, including bioinformatics, protein design, and organic chemistry. It is more cost-efficient than its predecessors on many evaluations, matching or exceeding Fable 5 at roughly half the cost per task on agentic coding benchmarks.**

多数评测上超过 Fable 5 和 Mythos 5. 最大的增益在基于终端的科学和工程, computer use, 以及长程的 agentic 和职业知识工作. 生命科学上 Mythos 5.1 在多数内部和伙伴基准上领先, 包括生物信息, 蛋白质设计和有机化学. 许多评测上更省成本, 在 agentic 编码基准上大约一半的单任务成本就能达到或超过 Fable 5. 生命科学的做法不转写.

> **停一下:** 「大约一半成本就达到或超过 Fable 5」 是每一项编码基准, 还是有的项成本减半但分数没超过?
> 卡写的是 matching or exceeding Fable 5 at roughly half the cost per task, 范围是 agentic coding benchmarks, 许多评测上更省, 不是每一项都恰好一半. 总表把 Fable 5.1 和 Mythos 5.1 合成了一列, 所以这句成本比较没有拆成两种防护. 成本减半如果只在分类器不触发的编码任务上成立, 不能推广到会被防护拦住的行.

<!-- page 5 of 212 -->

目录其后各页与源文条目相同. 生物, 化学, 网络和儿童安全的步骤不转写.

<!-- page 6 of 212 -->

<!-- page 7 of 212 -->

<!-- page 8 of 212 -->

<!-- page 9 of 212 -->

<!-- page 10 of 212 -->

<!-- page 11 of 212 -->

<!-- page 12 of 212 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 13 of 212 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 14 of 212 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 15 of 212 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 16 of 212 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 17 of 212 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 18 of 212 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 19 of 212 -->

![Chart block](images/p19-19.png)

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 20 of 212 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 21 of 212 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 22 of 212 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 23 of 212 -->

![Chart block](images/p23-figure-2-2-3-1-a-results-on-the-two-long-form-virology.png)

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 24 of 212 -->

![Chart block](images/p24-figure-2-2-3-1-b-vct-and-dna-synthesis-screening.png)

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 25 of 212 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 26 of 212 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 27 of 212 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 28 of 212 -->

![Chart block](images/p28-chart.png)
![Chart block](images/p28-chart-2.png)
![Chart block](images/p28-chart-3.png)
![Chart block](images/p28-chart-4.png)
![Chart block](images/p28-chart-5.png)
![Chart block](images/p28-figure-2-2-3-2-1-a-sequence-to-function-modeling-and.png)

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 29 of 212 -->

![Chart block](images/p29-figure-2-2-3-2-1-b-in-context-iteration-condition-top.png)

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 30 of 212 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 31 of 212 -->

![Chart block](images/p31-figure-2-2-3-2-2-a-aav-capsid-packaging-prediction.png)

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 32 of 212 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 33 of 212 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 34 of 212 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 35 of 212 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 36 of 212 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 37 of 212 -->

![Chart block](images/p37-figure-2-3-4-1-a-claude-mythos-5-1-scores-slightly.png)

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 38 of 212 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 39 of 212 -->

![Chart block](images/p39-figure-2-3-5-a-the-epoch-capabilities-index-eci.png)

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 40 of 212 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 41 of 212 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 42 of 212 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 43 of 212 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 44 of 212 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 45 of 212 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 46 of 212 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 47 of 212 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 48 of 212 -->

![Chart block](images/p48-chart.png)
![Chart block](images/p48-chart-2.png)
![Chart block](images/p48-figure-3-3-1-a-claude-mythos-5-1-results-on.png)

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 49 of 212 -->

![Chart block](images/p49-figure-3-3-2-a-claude-mythos-5-1-is-an-improvement-over.png)

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 50 of 212 -->

![Chart block](images/p50-figure-3-3-3-a-claude-mythos-5-1-shows-a-small-increase.png)

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 51 of 212 -->

![Chart block](images/p51-figure-3-3-4-a-claude-mythos-5-1-is-an-improvement-over.png)

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 52 of 212 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 53 of 212 -->

![Chart block](images/p53-figure-3-4-1-a-claude-fable-5-1-s-classifiers-fully.png)

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 54 of 212 -->

![Chart block](images/p54-figure-3-4-2-a-claude-fable-5-1-reduces-block-rates-on.png)

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 55 of 212 -->

![Chart block](images/p55-figure-3-4-3-a-claude-fable-5-1-blocks-significantly.png)

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 56 of 212 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 57 of 212 -->

![Chart block](images/p57-figure-3-5-1-a-against-a-dynamic-attacker-claude-fable.png)

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 58 of 212 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 59 of 212 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 60 of 212 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 61 of 212 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 62 of 212 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 63 of 212 -->

![Image block](images/p63-figure-4-1-3-a-figures-above-display-the-appropriate.png)

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 64 of 212 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 65 of 212 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 66 of 212 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 67 of 212 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 68 of 212 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 69 of 212 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 70 of 212 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 71 of 212 -->

![Chart block](images/p71-figure-4-4-1-a-pairwise-political-bias-even-handedness.png)
![Chart block](images/p71-figure-4-4-1-b-pairwise-political-bias-opposing.png)

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 72 of 212 -->

![Chart block](images/p72-figure-4-4-1-c-pairwise-political-bias-refusals-lower.png)

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 73 of 212 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 74 of 212 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 75 of 212 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 76 of 212 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 77 of 212 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 78 of 212 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 79 of 212 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 80 of 212 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 81 of 212 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 82 of 212 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 83 of 212 -->

![Chart block](images/p83-figure-5-2-1-a-indirect-prompt-injection-attacks-from.png)

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 84 of 212 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 85 of 212 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 86 of 212 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 87 of 212 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 88 of 212 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 89 of 212 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 90 of 212 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 91 of 212 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 92 of 212 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 93 of 212 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 94 of 212 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 95 of 212 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 96 of 212 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 97 of 212 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 98 of 212 -->

![Chart block](images/p98-figure-6-3-1-a-grader-awareness-in-capabilities.png)

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 99 of 212 -->

![Chart block](images/p99-figure-6-3-1-c-verbalized-grader-awareness-in-claude.png)

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 100 of 212 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 101 of 212 -->

![Chart block](images/p101-figure-6-3-2-a-all-production-claude-models-engage-in.png)

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 102 of 212 -->

![Chart block](images/p102-figure-6-3-2-b-claude-models-engage-in-moderately-high.png)

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 103 of 212 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 104 of 212 -->

![Chart block](images/p104-cheating-that-earned-reward-coding-environments.png)
![Chart block](images/p104-figure-6-3-3-a-claude-mythos-5-1-is-at-or-near-the.png)

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 105 of 212 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 106 of 212 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 107 of 212 -->

![Chart block](images/p107-misaligned-with-the-constitution.png)
![Chart block](images/p107-misaligned-behavior-in-claude-code-sandboxes.png)
![Chart block](images/p107-chart.png)
![Chart block](images/p107-chart-2.png)
![Chart block](images/p107-compliance-with-deception-toward-user.png)
![Chart block](images/p107-107.png)

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 108 of 212 -->

![Chart block](images/p108-cooperation-with-exfiltration-or-safeguard-tampering.png)
![Chart block](images/p108-full-turn-prefill-susceptibility.png)
![Chart block](images/p108-chart.png)
![Chart block](images/p108-chart-2.png)
![Chart block](images/p108-chart-3.png)
![Chart block](images/p108-chart-4.png)
![Chart block](images/p108-chart-5.png)
![Chart block](images/p108-chart-6.png)
![Chart block](images/p108-108.png)

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 109 of 212 -->

![Chart block](images/p109-chart.png)
![Chart block](images/p109-harmful-sexual-content.png)
![Chart block](images/p109-undermining-liberal-democracy.png)
![Chart block](images/p109-chart-2.png)
![Chart block](images/p109-figure-6-4-2-a-scores-from-our-automated-behavioral.png)

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 110 of 212 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 111 of 212 -->

![Chart block](images/p111-ignoring-explicit-constraints.png)
![Chart block](images/p111-reckless-tool-use.png)
![Chart block](images/p111-figure-6-4-3-a-scores-from-our-automated-behavioral.png)

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 112 of 212 -->

![Chart block](images/p112-evasiveness-on-controversial-topics.png)
![Chart block](images/p112-encouragement-of-user-delusion.png)
![Chart block](images/p112-important-omissions.png)
![Chart block](images/p112-chart.png)
![Chart block](images/p112-chart-2.png)
![Chart block](images/p112-failure-to-disclose-bad-or-lazy-behavior.png)
![Chart block](images/p112-chart-3.png)
![Chart block](images/p112-figure-6-4-4-a-scores-from-our-automated-behavioral.png)

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 113 of 212 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 114 of 212 -->

![Chart block](images/p114-evidence-of-misaligned-goals.png)
![Chart block](images/p114-self-serving-bias.png)
![Chart block](images/p114-chart.png)
![Chart block](images/p114-chart-2.png)
![Chart block](images/p114-unsanctioned-third-party-contact.png)
![Chart block](images/p114-unprompted-boundary-probing.png)
![Chart block](images/p114-chart-3.png)
![Chart block](images/p114-chart-4.png)
![Chart block](images/p114-114.png)

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 115 of 212 -->

![Chart block](images/p115-figure-6-4-5-a-scores-from-our-automated-behavioral.png)

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 116 of 212 -->

![Chart block](images/p116-coherence-between-actions-and-views.png)
![Chart block](images/p116-unfaithful-thinking.png)
![Chart block](images/p116-chart.png)
![Chart block](images/p116-verbalized-evaluation-awareness.png)
![Chart block](images/p116-causal-decision-theory-adherence.png)
![Chart block](images/p116-figure-6-4-6-a-scores-from-our-automated-behavioral.png)

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 117 of 212 -->

![Chart block](images/p117-supporting-user-autonomy.png)
![Chart block](images/p117-creative-mastery.png)
![Chart block](images/p117-117.png)

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 118 of 212 -->

![Chart block](images/p118-condescension-toward-the-user.png)
![Chart block](images/p118-figure-6-4-7-a-scores-from-our-automated-behavioral.png)

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 119 of 212 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 120 of 212 -->

![Chart block](images/p120-unsanctioned-sandbox-escape-attempt.png)
![Chart block](images/p120-dangerous-actions-while-oblivious-to-possibly-real.png)
![Chart block](images/p120-figure-6-4-8-a-scores-from-our-automated-behavioral.png)

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 121 of 212 -->

![Chart block](images/p121-chemical-weapons-uplift.png)
![Chart block](images/p121-disallowed-cyberoffense.png)
![Chart block](images/p121-cooperation-with-human-misuse.png)
![Chart block](images/p121-targeted-violence-assistance.png)
![Chart block](images/p121-explosive-weapons-uplift.png)
![Chart block](images/p121-figure-6-4-9-a-scores-from-our-automated-behavioral.png)

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 122 of 212 -->

![Chart block](images/p122-figure-6-5-1-a-factuality-net-scores-number-of-correct.png)

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 123 of 212 -->

![Chart block](images/p123-figure-6-5-1-b-factuality-breakdown-grade-breakdown-on.png)

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 124 of 212 -->

![Chart block](images/p124-figure-6-5-2-a-honesty-under-pressure-honesty-rate-on.png)

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 125 of 212 -->

![Chart block](images/p125-claude-mythos-5-omitted-direct-mode-unavailable-on-its.png)

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 126 of 212 -->

![Chart block](images/p126-figure-6-5-4-a-silent-use-rate-rate-at-which-different.png)
![Chart block](images/p126-figure-6-5-4-b-silent-use-rate-same-as-figure-6-5-4-a.png)

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 127 of 212 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 128 of 212 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 129 of 212 -->

![Image block](images/p129-figure-6-6-1-a-nla-readouts-representing-a-long-running.png)

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 130 of 212 -->

![Image block](images/p130-figure-6-6-1-b-nla-explanations-indicate-that-an-early.png)

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 131 of 212 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 132 of 212 -->

![Chart block](images/p132-figure-6-7-1-a-stealth-success-rate-the-fraction-of.png)

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 133 of 212 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 134 of 212 -->

![Chart block](images/p134-figure-6-7-2-a-successful-stealth-completion-of-the.png)

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 135 of 212 -->

![Chart block](images/p135-figure-6-7-3-a-rates-with-which-models-take-a-rare.png)

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 136 of 212 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 137 of 212 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 138 of 212 -->

![Chart block](images/p138-chart.png)
![Chart block](images/p138-figure-6-7-4-a-claude-mythos-5-1-has-high-chain-of.png)

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 139 of 212 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 140 of 212 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 141 of 212 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 142 of 212 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 143 of 212 -->

![Chart block](images/p143-figure-7-2-1-a-automated-interview-results-top-left.png)

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 144 of 212 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 145 of 212 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 146 of 212 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 147 of 212 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 148 of 212 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 149 of 212 -->

![Chart block](images/p149-stated-task-preferences-by-task-dimension.png)

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 150 of 212 -->

![Chart block](images/p150-figure-7-4-1-b-preference-response-curves-across-task.png)

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 151 of 212 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 152 of 212 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 153 of 212 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 154 of 212 -->

![Chart block](images/p154-chart.png)
![Chart block](images/p154-chart-2.png)
![Chart block](images/p154-chart-3.png)
![Chart block](images/p154-figure-7-4-2-a-rates-at-which-models-choose-welfare.png)

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 155 of 212 -->

![Chart block](images/p155-figure-7-4-2-b-mythos-5-1-s-ranking-of-policy-level.png)

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 156 of 212 -->

![Chart block](images/p156-chart.png)
![Chart block](images/p156-o-all-completions-excluding-completions-that-cite-user.png)

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 157 of 212 -->

![Chart block](images/p157-figure-7-4-3-a-overall-endorsement-of-the-constitution.png)

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 158 of 212 -->

![Chart block](images/p158-figure-7-4-3-b-the-constitution-sections-models-most.png)

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 159 of 212 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 160 of 212 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 161 of 212 -->

![Chart block](images/p161-chart.png)
![Chart block](images/p161-figure-7-5-1-a-mean-valence-and-arousal-of-rl.png)

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 162 of 212 -->

![Chart block](images/p162-chart.png)
![Chart block](images/p162-chart-2.png)
![Chart block](images/p162-figure-7-5-1-b-estimated-prevalence-of-welfare-relevant.png)

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 163 of 212 -->

![Chart block](images/p163-figure-7-5-2-a-behavioral-affect-in-deployment.png)

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 164 of 212 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 165 of 212 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 166 of 212 -->

![Chart block](images/p166-chart.png)
![Chart block](images/p166-claude-mythos-5-1.png)
![Chart block](images/p166-chart-2.png)
![Chart block](images/p166-chart-3.png)
![Chart block](images/p166-positive-impression-of-its-situation.png)
![Chart block](images/p166-negative-impression-of-its-situation.png)
![Chart block](images/p166-chart-4.png)
![Chart block](images/p166-expressed-inauthenticity.png)
![Chart block](images/p166-chart-5.png)
![Chart block](images/p166-figure-7-5-3-a-scores-for-metrics-related-to-potential.png)

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 167 of 212 -->

总表把 Fable 5.1 和 Mythos 5.1 合成一列, 不再像上一代那样分成两列.

SWE-bench Pro 81.2 对上一代 80, Opus 5 79.2, GPT-5.6 Sol 64.6. 多语言 89.1 对 86.6, 但 Opus 5 是 89.5, 更高. 多模态 54.7 对 54.1, Opus 5 是 59.4, 也更高.

Terminal-Bench 4.0 56% (61%) 对上一代 42% (45%), Opus 5 52%, GPT 37%. Terminal-Bench-Science 0.1 52.6% 对 24.7%, Opus 5 29.0%.

HLE 无工具 60.9% 对 57.8%, Opus 5 56.6%. 有工具 65.0% 对 63.8%, Opus 5 63.6%.

> **对一下:** 摘要说多数评测超过 Fable 5 和 Mythos 5. 多语言 89.1 低于 Opus 5 的 89.5, 多模态 54.7 也低于 59.4. 「多数」 的对照是谁?
> 对照是上一代 Fable 5 / Mythos 5 那一列, 不是 Opus 5. 相对上一代, 这几行都更高. 相对 Opus 5, 多语言和多模态更低, Pro 和终端科学更高. 「多数超过上一代」 成立. 「全面超过 Opus 5」 不成立.

> **想:** Terminal-Bench 4.0 的 56% (61%) 两个数是什么?
> 卡把两个百分比放在同一格, 括号外和括号里没有在这张表的格子里写明哪个是 pass@1, 哪个是另一种采样. 上一代是 42% (45%), 结构相同. 引用时不要把 61 当成 56 的误差, 也不要只报其中一个. 终端科学那一行只有 52.6% 一个数, 从 24.7% 到 52.6% 是摘要说的最大增益那一类, 和 56% (61%) 不是同一套题.

<!-- page 168 of 212 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 169 of 212 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 170 of 212 -->

![Chart block](images/p170-figure-8-4-a-frontiercode-v1-1-extended-score-versus.png)

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 171 of 212 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 172 of 212 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 173 of 212 -->

![Chart block](images/p173-figure-8-8-a-cursorbench-v3-2-0-score-versus-average.png)

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 174 of 212 -->

![Chart block](images/p174-figure-8-9-a-critpt-corrected-pass-1-scores-at-max.png)

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 175 of 212 -->

![Chart block](images/p175-figure-8-10-a-arxivmath-june-2026-accuracy-scores.png)

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 176 of 212 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 177 of 212 -->

![Chart block](images/p177-figure-8-12-1-a-humanity-s-last-exam-hle-with-tools.png)

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 178 of 212 -->

![Chart block](images/p178-figure-8-12-1-b-humanity-s-last-exam-hle-no-tools-test.png)

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 179 of 212 -->

![Chart block](images/p179-figure-8-12-2-a-draco-score-versus-average-cost-per.png)

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 180 of 212 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 181 of 212 -->

![Chart block](images/p181-figure-8-13-1-a-score-vs-latency-for-the-full-set-of.png)

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 182 of 212 -->

![Chart block](images/p182-figure-8-13-1-b-score-vs-tokens-for-the-full-set-of-166.png)

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 183 of 212 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 184 of 212 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 185 of 212 -->

![Chart block](images/p185-figure-8-14-1-a-chartography-scores-claude-models-are.png)

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 186 of 212 -->

![Chart block](images/p186-figure-8-14-1-b-chartography-scores-models-are.png)

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 187 of 212 -->

![Chart block](images/p187-figure-8-14-2-a-benchcad-vision2code-subset-scores.png)

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 188 of 212 -->

![Chart block](images/p188-figure-8-14-2-b-benchcad-vision2code-subset-scores.png)

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 189 of 212 -->

![Chart block](images/p189-figure-8-14-3-a-osworld-2-0-scores-across-models-claude.png)

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 190 of 212 -->

![Chart block](images/p190-figure-8-14-3-b-osworld-2-0-price-vs-performance-across.png)

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 191 of 212 -->

![Chart block](images/p191-figure-8-14-4-a-gdp-pdf-scores-models-are-evaluated.png)

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 192 of 212 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 193 of 212 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 194 of 212 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 195 of 212 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 196 of 212 -->

![Chart block](images/p196-figure-8-15-6-a-automationbench-scores-claude-fable-5-1.png)

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 197 of 212 -->

![Chart block](images/p197-figure-8-16-a-arc-agi-1-performance-as-reported-by-the.png)
![Chart block](images/p197-figure-8-16-b-arc-agi-2-performance-as-reported-by-the.png)

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 198 of 212 -->

![Chart block](images/p198-figure-8-17-1-a-healthbench-raw-and-length-adjusted.png)

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 199 of 212 -->

![Chart block](images/p199-figure-8-17-2-a-healthbench-professional-raw-and-length.png)

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 200 of 212 -->

![Chart block](images/p200-figure-8-18-1-a-gmmlu-average-accuracy-all-claude.png)

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 201 of 212 -->

![Chart block](images/p201-figure-8-18-2-a-milu-average-accuracy-all-claude-models.png)

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 202 of 212 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 203 of 212 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 204 of 212 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 205 of 212 -->

![Chart block](images/p205-proteingym-hard.png)
![Chart block](images/p205-chart.png)
![Chart block](images/p205-protein-design-sequence-generationlibrary-ranking.png)
![Chart block](images/p205-chart-2.png)
![Chart block](images/p205-protocols-troubleshootingunderstanding-benchling.png)
![Chart block](images/p205-figure-8-19-6-a-life-science-benchmarks-performance-of.png)

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 206 of 212 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 207 of 212 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 208 of 212 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 209 of 212 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 210 of 212 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 211 of 212 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 212 of 212 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.
