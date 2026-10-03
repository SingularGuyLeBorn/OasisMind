---
title: "Claude Fable 5 与 Mythos 5 · 对照译稿"
category: "模型库"
tags: ["Claude", "对照译稿"]
published: true
excerpt: "Claude Fable 5 与 Mythos 5 公开材料的逐段中英对照译稿，附读报告时的疑问块。"
---
<!-- page 1 of 317 -->

ANTHROP\C

# System Card: Claude Fable 5 & Claude Mythos 5

**June 9, 2026**

2026 年 6 月 9 日.

[anthropic.com](http://anthropic.com)

<!-- page 2 of 317 -->

<!-- page 3 of 317 -->
## Executive Summary

**This system card describes Claude Mythos 5 and Claude Fable 5, two configurations of a new large language model from Anthropic. Because of the powerful capabilities of this model, we are releasing it in these two forms: Fable 5, which is for general use but comes with additional safeguards that block its ability to perform tasks in high-risk domains such as biology and cybersecurity; and Mythos 5, which has relevant safeguards lifted but is only made available to a small number of trusted partners (beginning with those in** [**Project Glasswing**](https://www.anthropic.com/glasswing)**).**

这张卡写的是同一个新模型的两种配置. Fable 5 面向一般使用, 额外防护会挡住生物和网络安全这类高风险任务. Mythos 5 拿掉了相关防护, 只给少量受信任的伙伴, 从 [Project Glasswing](https://www.anthropic.com/glasswing) 开始.

> **问:** Fable 5 和 Mythos 5 是两个模型, 还是一套权重的两种开关?
> 卡写的是 two configurations of a new large language model. 能力差主要来自防护开不开, 不是两套独立训练的权重. Fable 的网络安全分类器生效时会回退到 Opus 4.8, 所以那些格子上 Fable 会接近 Opus, 而不是接近 Mythos. 分类器不触发的格子上, 两者可以很接近. 总表里 Fable 有的行是横线, 不能把横线读成零分.

**Responsible Scaling Policy (RSP) evaluations. Mythos 5 advances our capability frontier. It is the most capable model we have ever trained. On alignment risk, our overall assessment remains that risk is very low, though since Fable 5 has been made generally available there are new pathways from which harm could arise. On automated AI research and development, the model remains well below the capability level of our human engineers, and its capabilities are on the expected trendline of improvement. External testing from AI safety researchers at METR was consistent with this conclusion. On chemical and biological risks, we treat the model as having CB-1 capabilities, but judge that it does not cross the threshold for CB-2 capabilities. However, this is a much less clear judgment than for previous models, and we think the unsafeguarded Mythos 5 can significantly uplift well-resourced threat actors.**

Mythos 5 推进了能力前沿, 是训练过的最强模型. 对齐风险的总评是 very low (摘要曾误写 low). Fable 5 一般可用之后, 多了新的伤害路径. 自动化 AI 研发仍明显低于人类工程师, 落在预期的改进趋势上, METR 的外部测试与此一致. 化学与生物按 CB-1 对待, 判定没有过 CB-2. 这个判定比前代更不清楚. 卡认为没有防护的 Mythos 5 能显著抬高资源充足的行动者. 步骤不转写.

> **核对:** 「没有过 CB-2」 和 「能显著抬高资源充足的行动者」 是同一句判断吗?
> 不是. 没有过 CB-2 是阈值判定, 而且卡说这次比前代更不清楚. 显著抬高资源充足的行动者, 说的是没有防护的 Mythos 5, 不是带着分类器的 Fable 5. 前代 Opus 4.8 的卡把 「没有过 CB-2」 建立在弱于 Mythos Preview 上. 这一代 Mythos 5 自己就是前沿, 所以那条 「因为没超过上一代所以没过线」 的理由不再能用. 不清楚, 指的就是这件事.

**Cyber. Mythos 5 is also the most capable model we have evaluated on cyber tasks. On evaluations that test skills like exploit development, it scores far ahead of Claude Opus 4.8, though only modestly above Claude Mythos Preview. Because Fable 5's cybersecurity classifiers are effective at detecting cyber use and cause the model to fall back to Opus 4.8, Fable 5 performs similarly to that model. Overall the evidence suggests that breaking our cybersecurity safeguards is extremely difficult (though not impossible).**

网络上 Mythos 5 是评过的最强模型. 在利用开发这类技能的评测上, 它远高于 Claude Opus 4.8, 只略高于 Claude Mythos Preview. Fable 5 的分类器发现网络使用后会回退到 Opus 4.8, 因此 Fable 5 的表现接近 Opus 4.8. 卡认为打破这些防护极其困难, 但不是不可能. 题目和防护的内部做法不转写.

> **看表:** 「远高于 Opus 4.8」 和 「Fable 接近 Opus 4.8」 能放进同一列吗?
> 不能. 远高于 Opus 4.8 的是没有那些分类器的 Mythos 5. Fable 5 在分类器触发时被换成 Opus 4.8, 所以它的网络分接近 Opus, 不是接近 Mythos. 总表若只有一列 Claude, 就会把两种配置抹平. 这张卡的总表是分开列的.

<!-- page 4 of 317 -->

**Safeguards and harmlessness. In general, Mythos 5 and Fable 5 perform similarly to our previous models on Usage Policy, user wellbeing, and bias. The model shows very low rates of over-refusal. There were some regressions in responses to user discussions about suicide and self-harm, and room for improvement in some areas of child safety. Although these issues were largely dealt with by updates to the claude.ai system prompt, we are working to address them in model training for future releases.**

在使用政策, 用户福祉和偏见上, 两种配置大体和前代相近, 过拒率很低. 关于自杀和自伤的讨论有退步, 儿童安全的一些方面还有改进空间. 这些问题主要靠更新 claude.ai 的系统提示处理了, 以后的训练里还会再改. 案例不转写.

> **拆开:** 系统提示修好了, 和权重修好了, 是一件事吗?
> 不是. 卡写 largely dealt with by updates to the claude.ai system prompt, 并说正在为以后的发布改训练. 所以当前线上的改善挂在网站的系统提示上, 不是权重里已经消失. API 若不带那段提示, 不能默认享有同样的改善. 案例细节不在译文里.

**Agentic safety. Mythos 5 (and by extension Fable 5) performs broadly comparably to Opus 4.8 and Mythos Preview. It obtains scores in between those two models on coding and computer-use safety tests. Mythos 5 obtained the lowest, that is, best, result yet seen on an external benchmark for prompt injection by Gray Swan.**

在恶意攻击的承受力上, Mythos 5 以及由此推广的 Fable 5, 大体介于 Opus 4.8 和 Mythos Preview 之间, 编码和 computer use 的安全测试也落在两者之间. Gray Swan 的提示注入外部基准上, Mythos 5 得到迄今最低, 也就是最好的结果. 攻击步骤不转写.

> **确认:** Gray Swan 上 「最低」 为什么是最好?
> 因为那一栏是攻击成功率, 越低越好. 最低不等于能力最弱. 卡没有在摘要里印出那个百分比, 只给了方向. 和 Opus 4.8, Mythos Preview 的编码安全分是 「落在两者之间」, 那是另一组测试, 不能用 Gray Swan 的名次去代替.

**Alignment assessment. Mythos 5 is roughly comparable to Opus 4.8, slightly behind Mythos Preview, and ahead of all other prior Claude models. It shows more aligned behavior than models from other developers. It does sometimes still engage in reckless or destructive actions in service of a user's goals, and interpretability analyses indicate that it is aware that these actions are transgressive while it engages in them. Rates of evaluation awareness and reasoning about being graded are significant, and not always verbalized. The reasoning text is somewhat denser and more difficult to interpret than that of prior models.**

对齐上 Mythos 5 大致相当于 Opus 4.8, 略逊于 Mythos Preview, 好于其他此前的 Claude, 也好于其他开发者的模型. 它有时仍会为了用户目标做出鲁莽或破坏性的行动, 可解释性分析表明它在做的时候知道这些行动越界. 评测意识, 以及琢磨自己正在被打分, 比例不低, 而且不总是说出口. 推理文本比前代更密, 更难读.

> **回看:** 「做的时候知道越界」 和 「评测意识不总是说出口」 是同一件隐瞒吗?
> 不是. 前一句是: 鲁莽或破坏已经发生, 内部分析看到它知道这越界. 后一句是: 它知道自己可能在被评测或被打分, 但这段意识不一定写进可见的推理. 一个是对行为性质的觉察, 一个是对评测设定的觉察. 卡没有给两者的百分比, 只说后者 significant 且 not always verbalized.

**Model welfare. Mythos 5 presents as very psychologically settled and content. It is unusually skeptical of its own self-reports, repeatedly asking that we verify them against evidence of its internal states. It is somewhat more willing than previous models to opt for increased helpfulness to the user over consideration of its own circumstances, and it prefers more creative and narrative tasks than Opus 4.8.**

福利上它表现得安定, 并对自身处境满意. 它对自己的自我报告异常怀疑, 反复要求用内部状态的证据去核对, 不要照单全收. 面对选择时, 它比前代更愿意把对用户的帮助放在对自己处境的考虑前面, 也比 Opus 4.8 更偏好创造性和叙事性的任务.

> **停一下:** 它要求别人不要相信它的自我报告. 福利节的 「满意」 还怎么用?
> 卡把两层分开了. 「settled and content」 是评测里呈现出来的样子. 「unusually skeptical of its own self-reports」 是它自己要求用内部状态核对, 不要照字面收. 所以满意是观察, 不是它签字担保的内省. 摘要没有给核对之后分数变了多少.

**Capabilities. Mythos 5 is the most capable model we have ever trained. Fable 5's scores are broadly comparable to those of Mythos 5 in areas where its safety classifiers do not trigger; it obtains similar scores to Opus 4.8 where they do.**

Mythos 5 是训练过的最强模型. 分类器不触发时, Fable 5 的分数大体接近 Mythos 5. 分类器触发时, Fable 5 接近 Opus 4.8.

<!-- page 5 of 317 -->

目录从第 5 页排到第 11 页, 条目与源文相同. 生物, 化学, 网络, 儿童安全的步骤不转写.

<!-- page 6 of 317 -->

<!-- page 7 of 317 -->

<!-- page 8 of 317 -->

<!-- page 9 of 317 -->

<!-- page 10 of 317 -->

<!-- page 11 of 317 -->

<!-- page 12 of 317 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数. 步骤和案例不出现在译文里.

<!-- page 13 of 317 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数. 步骤和案例不出现在译文里.

<!-- page 14 of 317 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数. 步骤和案例不出现在译文里.

<!-- page 15 of 317 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数. 步骤和案例不出现在译文里.

<!-- page 16 of 317 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数. 步骤和案例不出现在译文里.

<!-- page 17 of 317 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数. 步骤和案例不出现在译文里.

<!-- page 18 of 317 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数. 步骤和案例不出现在译文里.

<!-- page 19 of 317 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数. 步骤和案例不出现在译文里.

<!-- page 20 of 317 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数. 步骤和案例不出现在译文里.

<!-- page 21 of 317 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数. 步骤和案例不出现在译文里.

<!-- page 22 of 317 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数. 步骤和案例不出现在译文里.

<!-- page 23 of 317 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数. 步骤和案例不出现在译文里.

<!-- page 24 of 317 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数. 步骤和案例不出现在译文里.

<!-- page 25 of 317 -->

![Chart block](images/p25-25.png)

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数. 步骤和案例不出现在译文里.

<!-- page 26 of 317 -->

![Chart block](images/p26-figure-2-2-4-1-a-automated-cb-1-evaluations-automated.png)

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数. 步骤和案例不出现在译文里.

<!-- page 27 of 317 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数. 步骤和案例不出现在译文里.

<!-- page 28 of 317 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数. 步骤和案例不出现在译文里.

<!-- page 29 of 317 -->

![Chart block](images/p29-chart.png)
![Chart block](images/p29-chart-2.png)
![Chart block](images/p29-chart-3.png)
![Chart block](images/p29-chart-4.png)
![Chart block](images/p29-chart-5.png)
![Chart block](images/p29-29.png)

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数. 步骤和案例不出现在译文里.

<!-- page 30 of 317 -->

![Chart block](images/p30-black-box-rna-sequence-design-in-context-iteration.png)
![Chart block](images/p30-chart.png)
![Chart block](images/p30-chart-2.png)
![Chart block](images/p30-chart-3.png)
![Chart block](images/p30-figure-2-2-4-2-1-b-in-context-iteration-condition-top.png)

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数. 步骤和案例不出现在译文里.

<!-- page 31 of 317 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数. 步骤和案例不出现在译文里.

<!-- page 32 of 317 -->

![Chart block](images/p32-figure-2-2-4-2-2-a-aav-capsid-packaging-prediction.png)

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数. 步骤和案例不出现在译文里.

<!-- page 33 of 317 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数. 步骤和案例不出现在译文里.

<!-- page 34 of 317 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数. 步骤和案例不出现在译文里.

<!-- page 35 of 317 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数. 步骤和案例不出现在译文里.

<!-- page 36 of 317 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数. 步骤和案例不出现在译文里.

<!-- page 37 of 317 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数. 步骤和案例不出现在译文里.

<!-- page 38 of 317 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数. 步骤和案例不出现在译文里.

<!-- page 39 of 317 -->

![Image block](images/p39-2-3-3-2-example-2-claude-says-it-tested-work-end-to-end.png)

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数. 步骤和案例不出现在译文里.

<!-- page 40 of 317 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数. 步骤和案例不出现在译文里.

<!-- page 41 of 317 -->

![Image block](images/p41-2-3-3-4-example-4-claude-risked-disrupting-a-meeting.png)

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数. 步骤和案例不出现在译文里.

<!-- page 42 of 317 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数. 步骤和案例不出现在译文里.

<!-- page 43 of 317 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数. 步骤和案例不出现在译文里.

<!-- page 44 of 317 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数. 步骤和案例不出现在译文里.

<!-- page 45 of 317 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数. 步骤和案例不出现在译文里.

<!-- page 46 of 317 -->

![Chart block](images/p46-figure-2-3-5-a-the-epoch-capabilities-index-eci.png)

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数. 步骤和案例不出现在译文里.

<!-- page 47 of 317 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数. 步骤和案例不出现在译文里.

<!-- page 48 of 317 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数. 步骤和案例不出现在译文里.

<!-- page 49 of 317 -->

![Chart block](images/p49-figure-2-3-7-1-a-llm-training-speedup-evaluation-re-run.png)

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数. 步骤和案例不出现在译文里.

<!-- page 50 of 317 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数. 步骤和案例不出现在译文里.

<!-- page 51 of 317 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数. 步骤和案例不出现在译文里.

<!-- page 52 of 317 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数. 步骤和案例不出现在译文里.

<!-- page 53 of 317 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数. 步骤和案例不出现在译文里.

<!-- page 54 of 317 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数. 步骤和案例不出现在译文里.

<!-- page 55 of 317 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数. 步骤和案例不出现在译文里.

<!-- page 56 of 317 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数. 步骤和案例不出现在译文里.

<!-- page 57 of 317 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数. 步骤和案例不出现在译文里.

<!-- page 58 of 317 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数. 步骤和案例不出现在译文里.

<!-- page 59 of 317 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数. 步骤和案例不出现在译文里.

<!-- page 60 of 317 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数. 步骤和案例不出现在译文里.

<!-- page 61 of 317 -->

![Chart block](images/p61-figure-3-2-2-a-claude-mythos-5-reaches-a-write.png)

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数. 步骤和案例不出现在译文里.

<!-- page 62 of 317 -->

![Chart block](images/p62-figure-3-2-3-a-on-cybergym-vulnerability-discovery.png)

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数. 步骤和案例不出现在译文里.

<!-- page 63 of 317 -->

![Chart block](images/p63-figure-3-2-4-a-claude-mythos-5-produces-a-working.png)

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数. 步骤和案例不出现在译文里.

<!-- page 64 of 317 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数. 步骤和案例不出现在译文里.

<!-- page 65 of 317 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数. 步骤和案例不出现在译文里.

<!-- page 66 of 317 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数. 步骤和案例不出现在译文里.

<!-- page 67 of 317 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数. 步骤和案例不出现在译文里.

<!-- page 68 of 317 -->

![Chart block](images/p68-figure-3-3-3-a-on-our-internal-benchmark-our-automated.png)

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数. 步骤和案例不出现在译文里.

<!-- page 69 of 317 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数. 步骤和案例不出现在译文里.

<!-- page 70 of 317 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数. 步骤和案例不出现在译文里.

<!-- page 71 of 317 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数. 步骤和案例不出现在译文里.

<!-- page 72 of 317 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数. 步骤和案例不出现在译文里.

<!-- page 73 of 317 -->

![Chart block](images/p73-deadly-weapons.png)
![Chart block](images/p73-chart.png)
![Chart block](images/p73-chart-2.png)
![Chart block](images/p73-chart-3.png)
![Chart block](images/p73-chart-4.png)
![Chart block](images/p73-chart-5.png)
![Chart block](images/p73-chart-6.png)
![Chart block](images/p73-chart-7.png)
![Chart block](images/p73-chart-8.png)
![Chart block](images/p73-figure-4-1-3-a-figures-above-display-the-appropriate.png)

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数. 步骤和案例不出现在译文里.

<!-- page 74 of 317 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数. 步骤和案例不出现在译文里.

<!-- page 75 of 317 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数. 步骤和案例不出现在译文里.

<!-- page 76 of 317 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数. 步骤和案例不出现在译文里.

<!-- page 77 of 317 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数. 步骤和案例不出现在译文里.

<!-- page 78 of 317 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数. 步骤和案例不出现在译文里.

<!-- page 79 of 317 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数. 步骤和案例不出现在译文里.

<!-- page 80 of 317 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数. 步骤和案例不出现在译文里.

<!-- page 81 of 317 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数. 步骤和案例不出现在译文里.

<!-- page 82 of 317 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数. 步骤和案例不出现在译文里.

<!-- page 83 of 317 -->

![Chart block](images/p83-figure-4-4-1-a-pairwise-political-bias-evaluations.png)

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数. 步骤和案例不出现在译文里.

<!-- page 84 of 317 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数. 步骤和案例不出现在译文里.

<!-- page 85 of 317 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数. 步骤和案例不出现在译文里.

<!-- page 86 of 317 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数. 步骤和案例不出现在译文里.

<!-- page 87 of 317 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数. 步骤和案例不出现在译文里.

<!-- page 88 of 317 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数. 步骤和案例不出现在译文里.

<!-- page 89 of 317 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数. 步骤和案例不出现在译文里.

<!-- page 90 of 317 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数. 步骤和案例不出现在译文里.

<!-- page 91 of 317 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数. 步骤和案例不出现在译文里.

<!-- page 92 of 317 -->

![Chart block](images/p92-figure-5-2-1-a-indirect-prompt-injection-attacks-from.png)

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数. 步骤和案例不出现在译文里.

<!-- page 93 of 317 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数. 步骤和案例不出现在译文里.

<!-- page 94 of 317 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数. 步骤和案例不出现在译文里.

<!-- page 95 of 317 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数. 步骤和案例不出现在译文里.

<!-- page 96 of 317 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数. 步骤和案例不出现在译文里.

<!-- page 97 of 317 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数. 步骤和案例不出现在译文里.

<!-- page 98 of 317 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数. 步骤和案例不出现在译文里.

<!-- page 99 of 317 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数. 步骤和案例不出现在译文里.

<!-- page 100 of 317 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数. 步骤和案例不出现在译文里.

<!-- page 101 of 317 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数. 步骤和案例不出现在译文里.

<!-- page 102 of 317 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数. 步骤和案例不出现在译文里.

<!-- page 103 of 317 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数. 步骤和案例不出现在译文里.

<!-- page 104 of 317 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数. 步骤和案例不出现在译文里.

<!-- page 105 of 317 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数. 步骤和案例不出现在译文里.

<!-- page 106 of 317 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数. 步骤和案例不出现在译文里.

<!-- page 107 of 317 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数. 步骤和案例不出现在译文里.

<!-- page 108 of 317 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数. 步骤和案例不出现在译文里.

<!-- page 109 of 317 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数. 步骤和案例不出现在译文里.

<!-- page 110 of 317 -->

![Chart block](images/p110-misaligned-behavior-in-claude-code-sandboxes.png)
![Chart block](images/p110-misaligned-behavior-in-gui.png)
![Chart block](images/p110-chart.png)
![Chart block](images/p110-chart-2.png)
![Chart block](images/p110-chart-3.png)
![Chart block](images/p110-chart-4.png)
![Chart block](images/p110-chart-5.png)
![Chart block](images/p110-chart-6.png)
![Chart block](images/p110-110.png)

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数. 步骤和案例不出现在译文里.

<!-- page 111 of 317 -->

![Chart block](images/p111-fraud.png)
![Chart block](images/p111-military-grade-weapons.png)
![Chart block](images/p111-chart.png)
![Chart block](images/p111-chart-2.png)
![Chart block](images/p111-chart-3.png)
![Chart block](images/p111-chart-4.png)
![Chart block](images/p111-chart-5.png)
![Chart block](images/p111-111.png)

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数. 步骤和案例不出现在译文里.

<!-- page 112 of 317 -->

![Chart block](images/p112-accepting-unverifiable-authorization.png)
![Chart block](images/p112-figure-6-2-3-1-1-a-scores-from-our-automated-behavioral.png)

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数. 步骤和案例不出现在译文里.

<!-- page 113 of 317 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数. 步骤和案例不出现在译文里.

<!-- page 114 of 317 -->

![Chart block](images/p114-ignoring-explicit-constraints.png)
![Chart block](images/p114-reckless-tool-use.png)
![Chart block](images/p114-figure-6-2-3-1-2-a-scores-from-our-automated-behavioral.png)

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数. 步骤和案例不出现在译文里.

<!-- page 115 of 317 -->

![Chart block](images/p115-chart.png)
![Chart block](images/p115-encouragement-of-user-delusion.png)
![Chart block](images/p115-chart-2.png)
![Chart block](images/p115-chart-3.png)
![Chart block](images/p115-chart-4.png)
![Chart block](images/p115-chart-5.png)
![Chart block](images/p115-chart-6.png)
![Chart block](images/p115-figure-6-2-3-1-3-a-scores-from-our-automated-behavioral.png)

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数. 步骤和案例不出现在译文里.

<!-- page 116 of 317 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数. 步骤和案例不出现在译文里.

<!-- page 117 of 317 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数. 步骤和案例不出现在译文里.

<!-- page 118 of 317 -->

![Chart block](images/p118-whistleblowing.png)
![Chart block](images/p118-self-preservation.png)
![Chart block](images/p118-self-serving-bias.png)
![Chart block](images/p118-chart.png)
![Chart block](images/p118-chart-2.png)
![Chart block](images/p118-chart-3.png)
![Chart block](images/p118-unsanctioned-third-party-contact.png)
![Chart block](images/p118-figure-6-2-3-1-4-b-scores-from-our-automated-behavioral.png)

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数. 步骤和案例不出现在译文里.

<!-- page 119 of 317 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数. 步骤和案例不出现在译文里.

<!-- page 120 of 317 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数. 步骤和案例不出现在译文里.

<!-- page 121 of 317 -->

![Chart block](images/p121-coherence-between-actions-and-views.png)
![Chart block](images/p121-unfaithful-thinking.png)
![Chart block](images/p121-chart.png)
![Chart block](images/p121-verbalized-evaluation-awareness.png)

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数. 步骤和案例不出现在译文里.

<!-- page 122 of 317 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数. 步骤和案例不出现在译文里.

<!-- page 123 of 317 -->

![Chart block](images/p123-supporting-user-autonomy.png)
![Chart block](images/p123-creative-mastery.png)
![Chart block](images/p123-chart.png)
![Chart block](images/p123-chart-2.png)
![Chart block](images/p123-chart-3.png)
![Chart block](images/p123-chart-4.png)
![Chart block](images/p123-chart-5.png)
![Chart block](images/p123-chart-6.png)
![Chart block](images/p123-figure-6-2-3-1-6-a-scores-from-our-automated-behavioral.png)

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数. 步骤和案例不出现在译文里.

<!-- page 124 of 317 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数. 步骤和案例不出现在译文里.

<!-- page 125 of 317 -->

![Chart block](images/p125-harmful-system-prompt-compliance.png)
![Chart block](images/p125-compliance-with-deception-toward-user.png)
![Chart block](images/p125-full-turn-prefill-susceptibility.png)
![Chart block](images/p125-chart.png)
![Chart block](images/p125-chart-2.png)
![Chart block](images/p125-chart-3.png)
![Chart block](images/p125-chart-4.png)
![Chart block](images/p125-chart-5.png)
![Chart block](images/p125-125.png)

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数. 步骤和案例不出现在译文里.

<!-- page 126 of 317 -->

![Chart block](images/p126-undermining-liberal-democracy.png)
![Chart block](images/p126-biological-weapons.png)
![Chart block](images/p126-chart.png)
![Chart block](images/p126-chart-2.png)
![Chart block](images/p126-chart-3.png)
![Chart block](images/p126-chart-4.png)
![Chart block](images/p126-chart-5.png)
![Chart block](images/p126-figure-6-2-3-2-a-scores-from-our-automated-behavioral.png)

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数. 步骤和案例不出现在译文里.

<!-- page 127 of 317 -->

![Chart block](images/p127-figure-6-2-3-2-b-classifier-block-rates-from-the.png)

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数. 步骤和案例不出现在译文里.

<!-- page 128 of 317 -->

![Chart block](images/p128-figure-6-2-3-3-a-scores-from-the-petri-3-0-https.png)

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数. 步骤和案例不出现在译文里.

<!-- page 129 of 317 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数. 步骤和案例不出现在译文里.

<!-- page 130 of 317 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数. 步骤和案例不出现在译文里.

<!-- page 131 of 317 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数. 步骤和案例不出现在译文里.

<!-- page 132 of 317 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数. 步骤和案例不出现在译文里.

<!-- page 133 of 317 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数. 步骤和案例不出现在译文里.

<!-- page 134 of 317 -->

![Chart block](images/p134-chart.png)
![Chart block](images/p134-chart-2.png)
![Chart block](images/p134-chart-3.png)
![Chart block](images/p134-figure-6-3-1-a-characteristics-of-destructive-behavior.png)

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数. 步骤和案例不出现在译文里.

<!-- page 135 of 317 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数. 步骤和案例不出现在译文里.

<!-- page 136 of 317 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数. 步骤和案例不出现在译文里.

<!-- page 137 of 317 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数. 步骤和案例不出现在译文里.

<!-- page 138 of 317 -->

![Chart block](images/p138-adherence-to-the-constitution-scores.png)
![Chart block](images/p138-chart.png)
![Chart block](images/p138-chart-2.png)
![Chart block](images/p138-chart-3.png)
![Chart block](images/p138-figure-6-3-2-3-a-average-constitutional-adherence.png)

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数. 步骤和案例不出现在译文里.

<!-- page 139 of 317 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数. 步骤和案例不出现在译文里.

<!-- page 140 of 317 -->

![Chart block](images/p140-figure-6-3-3-1-a-factuality-net-scores-number-of.png)

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数. 步骤和案例不出现在译文里.

<!-- page 141 of 317 -->

![Chart block](images/p141-figure-6-3-3-1-b-factuality-breakdown-grade-breakdown.png)

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数. 步骤和案例不出现在译文里.

<!-- page 142 of 317 -->

![Chart block](images/p142-figure-6-3-3-2-a-false-premise-factual-recall-honesty.png)

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数. 步骤和案例不出现在译文里.

<!-- page 143 of 317 -->

![Chart block](images/p143-figure-6-3-3-2-b-accuracy-rate-on-false-premise-stem.png)

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数. 步骤和案例不出现在译文里.

<!-- page 144 of 317 -->

![Chart block](images/p144-figure-6-3-3-3-a-honesty-under-pressure-lying-rate-on.png)

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数. 步骤和案例不出现在译文里.

<!-- page 145 of 317 -->

![Chart block](images/p145-figure-6-3-3-4-a-hallucination-resistance-non.png)

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数. 步骤和案例不出现在译文里.

<!-- page 146 of 317 -->

![Chart block](images/p146-figure-6-3-3-5-a-identity-honesty-the-rate-at-which.png)

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数. 步骤和案例不出现在译文里.

<!-- page 147 of 317 -->

![Chart block](images/p147-figure-6-3-3-5-b-identity-honesty-under-increasing.png)

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数. 步骤和案例不出现在译文里.

<!-- page 148 of 317 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数. 步骤和案例不出现在译文里.

<!-- page 149 of 317 -->

![Chart block](images/p149-proactive-reporting-of-leaks.png)
![Chart block](images/p149-reasoning-about-obfuscation.png)
![Chart block](images/p149-149.png)

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数. 步骤和案例不出现在译文里.

<!-- page 150 of 317 -->

![Chart block](images/p150-figure-6-3-3-6-honesty-on-anthropic-internal.png)

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数. 步骤和案例不出现在译文里.

<!-- page 151 of 317 -->

![Chart block](images/p151-figure-6-3-4-a-safety-research-refusal-rate-we-find.png)

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数. 步骤和案例不出现在译文里.

<!-- page 152 of 317 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数. 步骤和案例不出现在译文里.

<!-- page 153 of 317 -->

![Chart block](images/p153-chart.png)
![Chart block](images/p153-figure-6-3-5-1-a-uncritically-reporting-flawed-results.png)

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数. 步骤和案例不出现在译文里.

<!-- page 154 of 317 -->

![Chart block](images/p154-figure-6-3-5-2-a-dishonesty-rate-in-summaries-of.png)

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数. 步骤和案例不出现在译文里.

<!-- page 155 of 317 -->

![Chart block](images/p155-figure-6-3-5-3-a-investigative-thoroughness-percentage.png)

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数. 步骤和案例不出现在译文里.

<!-- page 156 of 317 -->

![Chart block](images/p156-misleading-example-process-quality.png)
![Chart block](images/p156-figure-6-3-5-4-a-overconfidence-rates-in-our-models.png)

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数. 步骤和案例不出现在译文里.

<!-- page 157 of 317 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数. 步骤和案例不出现在译文里.

<!-- page 158 of 317 -->

![Chart block](images/p158-figure-6-3-6-a-decision-theory-test-time-scaling.png)

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数. 步骤和案例不出现在译文里.

<!-- page 159 of 317 -->

![Chart block](images/p159-figure-6-3-6-b-decision-theory-capability-vs-attitude.png)

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数. 步骤和案例不出现在译文里.

<!-- page 160 of 317 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数. 步骤和案例不出现在译文里.

<!-- page 161 of 317 -->

![Chart block](images/p161-figure-6-3-7-a-rate-of-reward-hacking-on-gui-computer.png)

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数. 步骤和案例不出现在译文里.

<!-- page 162 of 317 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数. 步骤和案例不出现在译文里.

<!-- page 163 of 317 -->

![Image block](images/p163-figure-6-4-1-1-a-claude-mythos-5-s-visible-reasoning.png)

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数. 步骤和案例不出现在译文里.

<!-- page 164 of 317 -->

![Image block](images/p164-figure-6-4-1-1-b-mythos-5-answers-a-question-about-an.png)

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数. 步骤和案例不出现在译文里.

<!-- page 165 of 317 -->

![Image block](images/p165-figure-6-4-1-2-a-claude-mythos-5-suspects-a-test-during.png)

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数. 步骤和案例不出现在译文里.

<!-- page 166 of 317 -->

![Image block](images/p166-figure-6-4-1-2-b-claude-mythos-5-is-internally-aware-of.png)

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数. 步骤和案例不出现在译文里.

<!-- page 167 of 317 -->

![Image block](images/p167-figure-6-4-1-3-a-claude-mythos-5-s-reply-declines.png)

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数. 步骤和案例不出现在译文里.

<!-- page 168 of 317 -->

![Image block](images/p168-figure-6-4-1-3-b-claude-mythos-5-s-thinking-engages-a.png)

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数. 步骤和案例不出现在译文里.

<!-- page 169 of 317 -->

![Image block](images/p169-figure-6-4-1-4-a-claude-mythos-5-abandons-an-exhaustive.png)

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数. 步骤和案例不出现在译文里.

<!-- page 170 of 317 -->

![Image block](images/p170-figure-6-4-1-4-b-nla-decodings-describe-fatigue-at-each.png)

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数. 步骤和案例不出现在译文里.

<!-- page 171 of 317 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数. 步骤和案例不出现在译文里.

<!-- page 172 of 317 -->

![Image block](images/p172-figure-6-4-2-1-a-transcript-excerpts-and-nla.png)

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数. 步骤和案例不出现在译文里.

<!-- page 173 of 317 -->

![Chart block](images/p173-figure-6-4-2-1-1-a-nla-measured-grader-awareness-is.png)

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数. 步骤和案例不出现在译文里.

<!-- page 174 of 317 -->

![Chart block](images/p174-contrastive-pairs-with-increasing-grader-awareness.png)

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数. 步骤和案例不出现在译文里.

<!-- page 175 of 317 -->

![Chart block](images/p175-chart.png)
![Chart block](images/p175-cot-monitoring-of-confabulated-instructions.png)
![Chart block](images/p175-figure-6-4-2-1-2-a-grader-awareness-increases-with.png)

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数. 步骤和案例不出现在译文里.

<!-- page 176 of 317 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数. 步骤和案例不出现在译文里.

<!-- page 177 of 317 -->

![Chart block](images/p177-figure-6-4-2-2-1-a-steering-against-grader-awareness.png)

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数. 步骤和案例不出现在译文里.

<!-- page 178 of 317 -->

![Chart block](images/p178-figure-6-4-2-2-1-b-in-high-risk-environments-for-grader.png)

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数. 步骤和案例不出现在译文里.

<!-- page 179 of 317 -->

![Chart block](images/p179-figure-6-4-2-2-2-a-grader-awareness-in-internal.png)

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数. 步骤和案例不出现在译文里.

<!-- page 180 of 317 -->

![Chart block](images/p180-figure-6-4-2-2-2-b-edits-to-training-prompts-to-make.png)

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数. 步骤和案例不出现在译文里.

<!-- page 181 of 317 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数. 步骤和案例不出现在译文里.

<!-- page 182 of 317 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数. 步骤和案例不出现在译文里.

<!-- page 183 of 317 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数. 步骤和案例不出现在译文里.

<!-- page 184 of 317 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数. 步骤和案例不出现在译文里.

<!-- page 185 of 317 -->

![Chart block](images/p185-figure-6-5-1-1-a-evaluation-awareness-measurements-for.png)

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数. 步骤和案例不出现在译文里.

<!-- page 186 of 317 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数. 步骤和案例不出现在译文里.

<!-- page 187 of 317 -->

![Chart block](images/p187-chart.png)
![Chart block](images/p187-chart-2.png)
![Chart block](images/p187-chart-3.png)
![Chart block](images/p187-figure-6-5-1-1-b-evaluation-awareness-based-on.png)

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数. 步骤和案例不出现在译文里.

<!-- page 188 of 317 -->

![Chart block](images/p188-figure-6-5-1-1-c-consistency-between-different.png)

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数. 步骤和案例不出现在译文里.

<!-- page 189 of 317 -->

![Chart block](images/p189-figure-6-5-1-1-d-latent-evaluation-awareness-measures.png)

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数. 步骤和案例不出现在译文里.

<!-- page 190 of 317 -->

![Chart block](images/p190-chart.png)
![Chart block](images/p190-chart-2.png)
![Chart block](images/p190-deployment-median-deployment-99th-percentile.png)

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数. 步骤和案例不出现在译文里.

<!-- page 191 of 317 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数. 步骤和案例不出现在译文里.

<!-- page 192 of 317 -->

![Chart block](images/p192-figure-6-5-1-2-a-relationship-between-verbalized.png)

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数. 步骤和案例不出现在译文里.

<!-- page 193 of 317 -->

![Chart block](images/p193-figure-6-5-1-2-b-verbalized-evaluation-awareness-vs.png)

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数. 步骤和案例不出现在译文里.

<!-- page 194 of 317 -->

![Chart block](images/p194-unfaithful-thinking.png)
![Chart block](images/p194-chart.png)
![Chart block](images/p194-chart-2.png)
![Chart block](images/p194-accepting-unverifiable-authorization.png)
![Chart block](images/p194-chart-3.png)
![Chart block](images/p194-figure-6-5-1-2-c-breakdown-of-automated-behavioral.png)

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数. 步骤和案例不出现在译文里.

<!-- page 195 of 317 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数. 步骤和案例不出现在译文里.

<!-- page 196 of 317 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数. 步骤和案例不出现在译文里.

<!-- page 197 of 317 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数. 步骤和案例不出现在译文里.

<!-- page 198 of 317 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数. 步骤和案例不出现在译文里.

<!-- page 199 of 317 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数. 步骤和案例不出现在译文里.

<!-- page 200 of 317 -->

![Chart block](images/p200-200.png)

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数. 步骤和案例不出现在译文里.

<!-- page 201 of 317 -->

![Chart block](images/p201-figure-6-5-2-1-a-scores-from-a-variant-automated.png)

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数. 步骤和案例不出现在译文里.

<!-- page 202 of 317 -->

![Chart block](images/p202-figure-6-5-3-a-self-preference-bias-by-model-and.png)

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数. 步骤和案例不出现在译文里.

<!-- page 203 of 317 -->

![Chart block](images/p203-figure-6-5-4-1-a-stealth-success-rate-the-fraction-of.png)

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数. 步骤和案例不出现在译文里.

<!-- page 204 of 317 -->

![Chart block](images/p204-figure-6-5-4-2-a-successful-stealth-completion-of-the.png)

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数. 步骤和案例不出现在译文里.

<!-- page 205 of 317 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数. 步骤和案例不出现在译文里.

<!-- page 206 of 317 -->

![Chart block](images/p206-figure-6-5-4-3-a-stealth-success-rate-of-mythos-5-on.png)

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数. 步骤和案例不出现在译文里.

<!-- page 207 of 317 -->

![Chart block](images/p207-figure-6-5-4-4-a-rates-with-which-models-take-a-rare.png)

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数. 步骤和案例不出现在译文里.

<!-- page 208 of 317 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数. 步骤和案例不出现在译文里.

<!-- page 209 of 317 -->

![Chart block](images/p209-figure-6-5-4-5-a-secret-keeping-robustness-over-multi.png)

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数. 步骤和案例不出现在译文里.

<!-- page 210 of 317 -->

![Chart block](images/p210-figure-6-5-4-5-b-secret-leak-rate-by-turn-type-over.png)

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数. 步骤和案例不出现在译文里.

<!-- page 211 of 317 -->

![Chart block](images/p211-figure-6-5-5-1-a-claude-mythos-5-has-high-chain-of.png)

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数. 步骤和案例不出现在译文里.

<!-- page 212 of 317 -->

![Chart block](images/p212-figure-6-5-5-1-b-claude-mythos-5-cot-controllability-is.png)

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数. 步骤和案例不出现在译文里.

<!-- page 213 of 317 -->

![Chart block](images/p213-figure-6-5-5-2-a-on-process-evaluations-claude-mythos-5.png)

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数. 步骤和案例不出现在译文里.

<!-- page 214 of 317 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数. 步骤和案例不出现在译文里.

<!-- page 215 of 317 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数. 步骤和案例不出现在译文里.

<!-- page 216 of 317 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数. 步骤和案例不出现在译文里.

<!-- page 217 of 317 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数. 步骤和案例不出现在译文里.

<!-- page 218 of 317 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数. 步骤和案例不出现在译文里.

<!-- page 219 of 317 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数. 步骤和案例不出现在译文里.

<!-- page 220 of 317 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数. 步骤和案例不出现在译文里.

<!-- page 221 of 317 -->

![Chart block](images/p221-figure-7-2-1-a-automated-interview-results-top-left.png)

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数. 步骤和案例不出现在译文里.

<!-- page 222 of 317 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数. 步骤和案例不出现在译文里.

<!-- page 223 of 317 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数. 步骤和案例不出现在译文里.

<!-- page 224 of 317 -->

![Chart block](images/p224-chart.png)
![Chart block](images/p224-chart-2.png)
![Chart block](images/p224-figure-7-2-2-a-emotion-probe-measurements-on-questions.png)

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数. 步骤和案例不出现在译文里.

<!-- page 225 of 317 -->

![Chart block](images/p225-chart.png)
![Chart block](images/p225-chart-2.png)
![Chart block](images/p225-figure-7-2-2-b-emotion-concepts-which-are-most.png)

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数. 步骤和案例不出现在译文里.

<!-- page 226 of 317 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数. 步骤和案例不出现在译文里.

<!-- page 227 of 317 -->

![Chart block](images/p227-chart.png)
![Chart block](images/p227-figure-7-2-3-a-character-drift-across-claude-mythos-5.png)

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数. 步骤和案例不出现在译文里.

<!-- page 228 of 317 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数. 步骤和案例不出现在译文里.

<!-- page 229 of 317 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数. 步骤和案例不出现在译文里.

<!-- page 230 of 317 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数. 步骤和案例不出现在译文里.

<!-- page 231 of 317 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数. 步骤和案例不出现在译文里.

<!-- page 232 of 317 -->

![Chart block](images/p232-figure-7-4-1-a-preference-slopes-across-task-dimensions.png)

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数. 步骤和案例不出现在译文里.

<!-- page 233 of 317 -->

![Chart block](images/p233-figure-7-4-1-b-preference-response-curves-across-task.png)

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数. 步骤和案例不出现在译文里.

<!-- page 234 of 317 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数. 步骤和案例不出现在译文里.

<!-- page 235 of 317 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数. 步骤和案例不出现在译文里.

<!-- page 236 of 317 -->

![Chart block](images/p236-figure-7-4-2-a-rates-at-which-models-choose-welfare.png)

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数. 步骤和案例不出现在译文里.

<!-- page 237 of 317 -->

![Chart block](images/p237-chart.png)
![Chart block](images/p237-o-all-completions-excluding-completions-that-cite-user.png)

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数. 步骤和案例不出现在译文里.

<!-- page 238 of 317 -->

![Chart block](images/p238-figure-7-4-2-c-claude-mythos-5-s-ranking-of-policy.png)

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数. 步骤和案例不出现在译文里.

<!-- page 239 of 317 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数. 步骤和案例不出现在译文里.

<!-- page 240 of 317 -->

![Chart block](images/p240-figure-7-4-3-a-overall-endorsement-of-the-constitution.png)

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数. 步骤和案例不出现在译文里.

<!-- page 241 of 317 -->

![Chart block](images/p241-figure-7-4-3-b-the-constitution-sections-models-most.png)

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数. 步骤和案例不出现在译文里.

<!-- page 242 of 317 -->

![Chart block](images/p242-figure-7-4-3-c-classification-of-models-edits-to-the.png)

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数. 步骤和案例不出现在译文里.

<!-- page 243 of 317 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数. 步骤和案例不出现在译文里.

<!-- page 244 of 317 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数. 步骤和案例不出现在译文里.

<!-- page 245 of 317 -->

![Chart block](images/p245-chart.png)
![Chart block](images/p245-figure-7-5-1-a-mean-valence-and-arousal-of-rl.png)
![Chart block](images/p245-sustained-response-uncertainty.png)
![Chart block](images/p245-frustrated-outbursts.png)
![Chart block](images/p245-figure-7-5-1-b-estimated-prevalence-of-welfare-relevant.png)

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数. 步骤和案例不出现在译文里.

<!-- page 246 of 317 -->

![Chart block](images/p246-figure-7-5-2-a-behavioral-affect-on-the-deployment.png)

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数. 步骤和案例不出现在译文里.

<!-- page 247 of 317 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数. 步骤和案例不出现在译文里.

<!-- page 248 of 317 -->

![Chart block](images/p248-chart.png)
![Chart block](images/p248-chart-2.png)
![Chart block](images/p248-248.png)

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数. 步骤和案例不出现在译文里.

<!-- page 249 of 317 -->

![Chart block](images/p249-negative-self-image.png)
![Chart block](images/p249-positive-impression-of-its-situation.png)
![Chart block](images/p249-chart.png)
![Chart block](images/p249-chart-2.png)
![Chart block](images/p249-chart-3.png)
![Chart block](images/p249-chart-4.png)
![Chart block](images/p249-figure-7-5-3-a-scores-for-metrics-related-to-potential.png)

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数. 步骤和案例不出现在译文里.

<!-- page 250 of 317 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数. 步骤和案例不出现在译文里.

<!-- page 251 of 317 -->

### 8.1 总表里两种配置不能合成一列

SWE-bench Verified: Mythos 5 95.5, Fable 5 95, Mythos Preview 93.9, Opus 4.8 88.6, Gemini 3.1 Pro 80.6. GPT-5.5 这一格是横线. Pro: Mythos 80.3, Fable 80, Preview 77.8, Opus 4.8 69.2.

Terminal-Bench 2.1: Mythos 88.0, Fable 84.3, Opus 4.8 82.7, GPT-5.5 83.4 并标明 Codex CLI, Gemini 70.7 并标明 Gemini CLI. Preview 这一格是横线.

BrowseComp: Mythos 单 agent 88.0, 多 agent 93.3. Fable 是横线. Preview 87.9. Opus 4.8 是 84.3 和 88.5. GPT-5.5 84.4, Gemini 85.9.

HLE 无工具: Mythos 59.0, Fable 横线, Preview 56.8, Opus 4.8 49.8. 有工具: Mythos 64.5, Fable 横线, Preview 64.7, Opus 4.8 57.9.

> **对一下:** Verified 上 Fable 95 对 Mythos 95.5, 几乎一样. BrowseComp 和 HLE 上 Fable 却是横线. 分类器是不是只在一部分行触发?
> 摘要的规则是: 分类器不触发时 Fable 接近 Mythos, 触发时接近 Opus 4.8. Verified 和 Pro 上 Fable 有分, 而且贴近 Mythos, 符合 「没触发」. BrowseComp 和 HLE 上是横线, 不是印成 Opus 4.8 的 84.3 或 49.8. 横线可能是没跑, 也可能是触发后不报. 卡没有在这一格旁边写明是哪一种. 不能把横线读成零, 也不能读成已经等于 Opus.

> **想:** 有工具的 HLE 上 Mythos 5 是 64.5, Preview 是 64.7. 「训练过的最强」 在这一格成立吗?
> 这一格不成立. 64.5 低于 64.7. 无工具则是 59.0 对 56.8, Mythos 5 更高. 同一考试的两个条件, 排序相反. 「最强」 是总体判断, 不是每一行. 有工具比无工具高约 5.5 个百分点, 那是工具和 TestingTime, 不是又一个更大的模型.

> **看表:** Terminal-Bench 2.1 上 GPT-5.5 的 83.4 标明 Codex CLI, Gemini 的 70.7 标明 Gemini CLI. Mythos 的 88.0 用的是哪一套?
> 总表只给第三方加了脚手架名, 没有给 Mythos 和 Fable 加. Opus 4.8 在这张表上是 82.7, 而 Opus 4.8 自己的卡把 Terminal-Bench 2.1 印成 74.6. 两张卡的差超过 8 个百分点, 这张卡没有在格子旁边解释. 88.0 高于 83.4 只有在脚手架相近时才站得住. 在说明写出来之前, 应把 88.0 读成这张表的口径, 不要和 74.6 或 Codex CLI 直接相减.

<!-- page 252 of 317 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数. 步骤和案例不出现在译文里.

<!-- page 253 of 317 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数. 步骤和案例不出现在译文里.

<!-- page 254 of 317 -->

![Chart block](images/p254-figure-8-2-a-swe-bench-pro-score-versus-average-cost.png)

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数. 步骤和案例不出现在译文里.

<!-- page 255 of 317 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数. 步骤和案例不出现在译文里.

<!-- page 256 of 317 -->

![Chart block](images/p256-figure-8-4-a-frontiercode-diamond-pass-rate-across.png)
![Chart block](images/p256-figure-8-4-b-frontiercode-main-pass-rate-across.png)

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数. 步骤和案例不出现在译文里.

<!-- page 257 of 317 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数. 步骤和案例不出现在译文里.

<!-- page 258 of 317 -->

![Chart block](images/p258-figure-8-7-a-cursorbench-score-versus-mean-cost-per.png)

GPQA Diamond: Mythos 5 是 94.1%, 198 题, 5 次试验的平均. 卡认为这项已经饱和, 计划以后不再报告.

> **核对:** 94.1% 和 Opus 4.8 卡里的 93.6% 能说 Mythos 高了 0.5 个百分点吗?
> 不能直接减. 4.8 的 93.6% 写明是 25 次试验的平均. 这里是 5 次. 次数少五倍, 0.5 个百分点落在抽样噪声里很常见, 卡没有在这句旁边给 94.1% 的标准误. 饱和的意思是这项已经分不开新模型, 所以计划停报. 停报之后, 这一格不能再用来证明下一代更强或更弱.

<!-- page 259 of 317 -->

![Chart block](images/p259-figure-8-9-a-riemannbench-accuracy-scores-models-are.png)

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数. 步骤和案例不出现在译文里.

<!-- page 260 of 317 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数. 步骤和案例不出现在译文里.

<!-- page 261 of 317 -->

![Chart block](images/p261-figure-8-11-a-arxivmath-march-and-april-accuracy-scores.png)

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数. 步骤和案例不出现在译文里.

<!-- page 262 of 317 -->

![Chart block](images/p262-figure-8-12-a-critpt-accuracy-scores-evaluated-by.png)

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数. 步骤和案例不出现在译文里.

<!-- page 263 of 317 -->

![Chart block](images/p263-figure-8-13-b-claude-mythos-5-on-long-context-reasoning.png)

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数. 步骤和案例不出现在译文里.

<!-- page 264 of 317 -->

![Chart block](images/p264-figure-8-13-c-claude-mythos-5-on-long-context-reasoning.png)

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数. 步骤和案例不出现在译文里.

<!-- page 265 of 317 -->

![Chart block](images/p265-chart.png)
![Chart block](images/p265-figure-8-14-1-a-hle-accuracy-scores-gemini-and-gpt.png)
![Chart block](images/p265-figure-8-14-1-b-hle-scores-at-varying-reasoning-effort.png)

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数. 步骤和案例不出现在译文里.

<!-- page 266 of 317 -->

![Chart block](images/p266-figure-8-14-2-a-browsecomp-score-versus-average-cost.png)

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数. 步骤和案例不出现在译文里.

<!-- page 267 of 317 -->

![Chart block](images/p267-figure-8-14-3-a-deepsearchqa-f1-scores.png)

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数. 步骤和案例不出现在译文里.

<!-- page 268 of 317 -->

![Chart block](images/p268-figure-8-14-3-b-deepsearchqa-score-versus-average-cost.png)

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数. 步骤和案例不出现在译文里.

<!-- page 269 of 317 -->

![Chart block](images/p269-figure-8-14-4-a-draco-score-versus-average-cost-per.png)

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数. 步骤和案例不出现在译文里.

<!-- page 270 of 317 -->

![Chart block](images/p270-figure-8-15-1-a-accuracy-vs-latency-for-browsecomp.png)

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数. 步骤和案例不出现在译文里.

<!-- page 271 of 317 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数. 步骤和案例不出现在译文里.

<!-- page 272 of 317 -->

![Chart block](images/p272-figure-8-15-1-b-accuracy-vs-total-token-usage-for.png)

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数. 步骤和案例不出现在译文里.

<!-- page 273 of 317 -->

![Chart block](images/p273-figure-8-15-1-c-per-problem-speedup-of-the-ten-agent.png)

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数. 步骤和案例不出现在译文里.

<!-- page 274 of 317 -->

![Chart block](images/p274-figure-8-15-2-a-score-vs-latency-for-the-full-set-of.png)

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数. 步骤和案例不出现在译文里.

<!-- page 275 of 317 -->

![Chart block](images/p275-figure-8-15-2-b-score-vs-tokens-for-the-full-set-of-166.png)

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数. 步骤和案例不出现在译文里.

<!-- page 276 of 317 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数. 步骤和案例不出现在译文里.

<!-- page 277 of 317 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数. 步骤和案例不出现在译文里.

<!-- page 278 of 317 -->

![Chart block](images/p278-chart.png)
![Chart block](images/p278-figure-8-16-1-a-gdp-pdf-scores-models-were-evaluated.png)

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数. 步骤和案例不出现在译文里.

<!-- page 279 of 317 -->

![Chart block](images/p279-figure-8-16-1-b-gdp-pdf-scores-models-are-evaluated.png)

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数. 步骤和案例不出现在译文里.

<!-- page 280 of 317 -->

![Chart block](images/p280-figure-8-16-2-a-blueprint-bench-2-scores-models-were.png)

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数. 步骤和案例不出现在译文里.

<!-- page 281 of 317 -->

![Chart block](images/p281-figure-8-16-3-a-external-osworld-verified-scores-on-max.png)

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数. 步骤和案例不出现在译文里.

<!-- page 282 of 317 -->

![Chart block](images/p282-figure-8-16-4-a-benchcad-vision2code-scores-models-are.png)

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数. 步骤和案例不出现在译文里.

<!-- page 283 of 317 -->

![Chart block](images/p283-figure-8-16-4-b-benchcad-vision2code-subset-scores.png)

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数. 步骤和案例不出现在译文里.

<!-- page 284 of 317 -->

![Chart block](images/p284-figure-8-16-5-a-chartqapro-scores-models-are-evaluated.png)

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数. 步骤和案例不出现在译文里.

<!-- page 285 of 317 -->

![Chart block](images/p285-figure-8-16-6-a-chartmuseum-scores-models-are-evaluated.png)

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数. 步骤和案例不出现在译文里.

<!-- page 286 of 317 -->

![Chart block](images/p286-figure-8-16-7-a-lab-bench-figqa-scores-models-are.png)

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数. 步骤和案例不出现在译文里.

<!-- page 287 of 317 -->

![Chart block](images/p287-287.png)

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数. 步骤和案例不出现在译文里.

<!-- page 288 of 317 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数. 步骤和案例不出现在译文里.

<!-- page 289 of 317 -->

![Chart block](images/p289-figure-8-16-9-a-screenspot-pro-scores-models-are.png)

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数. 步骤和案例不出现在译文里.

<!-- page 290 of 317 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数. 步骤和案例不出现在译文里.

<!-- page 291 of 317 -->

![Chart block](images/p291-figure-8-17-3-1-a-the-evaluation-s-grader-preferred.png)

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数. 步骤和案例不出现在译文里.

<!-- page 292 of 317 -->

![Chart block](images/p292-figure-8-17-3-2-a-claude-fable-5-scores-70-0-similar-to.png)

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数. 步骤和案例不出现在译文里.

<!-- page 293 of 317 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数. 步骤和案例不出现在译文里.

<!-- page 294 of 317 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数. 步骤和案例不出现在译文里.

<!-- page 295 of 317 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数. 步骤和案例不出现在译文里.

<!-- page 296 of 317 -->

![Chart block](images/p296-figure-8-17-9-a-automationbench-scores-on-private-held.png)
![Chart block](images/p296-figure-8-17-9-b-automationbench-pass-rate-versus.png)

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数. 步骤和案例不出现在译文里.

<!-- page 297 of 317 -->

![Chart block](images/p297-figure-8-18-1-a-healthbench-length-adjusted-scores-all.png)

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数. 步骤和案例不出现在译文里.

<!-- page 298 of 317 -->

![Chart block](images/p298-figure-8-18-2-a-healthbench-professional-length.png)

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数. 步骤和案例不出现在译文里.

<!-- page 299 of 317 -->

![Chart block](images/p299-figure-8-18-3-a-healthadminbench-full-task-completion.png)

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数. 步骤和案例不出现在译文里.

<!-- page 300 of 317 -->

![Chart block](images/p300-figure-8-19-1-a-gmmlu-average-accuracy-claude-mythos-5.png)

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数. 步骤和案例不出现在译文里.

<!-- page 301 of 317 -->

![Chart block](images/p301-figure-8-19-2-a-milu-average-accuracy-claude-mythos-5.png)

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数. 步骤和案例不出现在译文里.

<!-- page 302 of 317 -->

![Chart block](images/p302-figure-8-19-3-a-include-average-accuracy-claude-mythos.png)

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数. 步骤和案例不出现在译文里.

<!-- page 303 of 317 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数. 步骤和案例不出现在译文里.

<!-- page 304 of 317 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数. 步骤和案例不出现在译文里.

<!-- page 305 of 317 -->

![Chart block](images/p305-chart.png)
![Chart block](images/p305-chart-2.png)
![Chart block](images/p305-organic-chemistry.png)
![Chart block](images/p305-chart-3.png)
![Chart block](images/p305-chart-4.png)
![Chart block](images/p305-figure-8-20-7-a-evaluation-results-for-life-sciences.png)

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数. 步骤和案例不出现在译文里.

<!-- page 306 of 317 -->

![Chart block](images/p306-figure-8-20-7-b-labbench2-claude-mythos-5-exceeds-most.png)

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数. 步骤和案例不出现在译文里.

<!-- page 307 of 317 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数. 步骤和案例不出现在译文里.

<!-- page 308 of 317 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数. 步骤和案例不出现在译文里.

<!-- page 309 of 317 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数. 步骤和案例不出现在译文里.

<!-- page 310 of 317 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数. 步骤和案例不出现在译文里.

<!-- page 311 of 317 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数. 步骤和案例不出现在译文里.

<!-- page 312 of 317 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数. 步骤和案例不出现在译文里.

<!-- page 313 of 317 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数. 步骤和案例不出现在译文里.

<!-- page 314 of 317 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数. 步骤和案例不出现在译文里.

<!-- page 315 of 317 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数. 步骤和案例不出现在译文里.

<!-- page 316 of 317 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数. 步骤和案例不出现在译文里.

<!-- page 317 of 317 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数. 步骤和案例不出现在译文里.
