---
title: "Claude Opus 4.7 · 对照译稿"
category: "模型库"
tags: ["Claude", "对照译稿"]
published: true
excerpt: "Claude Opus 4.7 公开材料的逐段中英对照译稿，附读报告时的疑问块。"
---
<!-- page 1 of 232 -->

ANTHROP\C

# System Card: Claude Opus 4.7

April 16, 2026

2026 年 4 月 16 日.

[anthropic.com](http://anthropic.com/)

<!-- page 2 of 232 -->

## Executive Summary

This system card describes Claude Opus 4.7, a large language model from Anthropic. Overall, the model shows superior capabilities to those of its predecessor, Claude Opus 4.6, but weaker capabilities than those of our most powerful model, Claude Mythos Preview. Because Mythos Preview was released only to a limited number of users, this makes Claude Opus 4.7 our most capable general-access model to date.

这份系统卡描述 Anthropic 的大语言模型 Claude Opus 4.7. 总体上, 它比前代 Claude Opus 4.6 更强, 但弱于我们最强的模型 Claude Mythos Preview. Mythos Preview 只向有限用户发布, 因此 Opus 4.7 是迄今面向一般访问的最强模型.

**Responsible Scaling Policy evaluations.** We judge that Opus 4.7 does not advance our capability frontier, because Claude Mythos Preview shows higher results on every relevant evaluation. Our overall conclusion under our Responsible Scaling Policy is therefore that catastrophic risks remain low. Evaluations and our internal uses of the model collectively showed: that chemical and biological risks are not significantly changed from Opus 4.6 and our existing mitigations are sufficient; that Opus 4.7 does not cross the threshold for automated AI R&D; and that misalignment risk remains very low (though higher than for pre-Mythos Preview models).

Responsible Scaling Policy 评测. 我们判定 Opus 4.7 没有推进能力前沿, 因为在每一项相关评测上 Claude Mythos Preview 都更高. 因此在 RSP 下的总结论是: 灾难性风险仍然低. 评测和内部使用合在一起表明: 化学与生物风险相对 Opus 4.6 没有显著变化, 现有缓解足够; Opus 4.7 没有越过自动化 AI 研发的阈值; 失对齐风险仍然很低 (但高于 Mythos Preview 之前的模型).

> **想:** 摘要说 Opus 4.7 没有推进前沿, 因为 Mythos Preview 在每一项相关评测上都更高. 第 12 页又说它比 Risk Report 里最强的 Opus 4.6 「significantly more capable」. 这两句比的是谁?
> 比的不是同一个模型. 「没有推进前沿」 的对照是 Claude Mythos Preview, 而且限定在 「every relevant evaluation」. 「significantly more capable」 的对照是最近一份 Risk Report 里讨论过的最强模型 Claude Opus 4.6. RSP 规定, 若新模型显著强于上一份 Risk Report 里的模型, 就必须在系统卡或别处说明它怎样改变那份报告的分析. 所以第二句是触发讨论义务的比较, 第一句是前沿是否前移的比较. 总结论 「catastrophic risks remain low」 建立在第一句上, 不建立在第二句上.

**Cyber evaluations.** Opus 4.7 is roughly similar to Opus 4.6 in cyber capabilities. An external evaluation from the UK's AI Security Institute showed that, unlike Mythos Preview, Opus 4.7 was unable to complete their full cyber range (though it still displayed potentially-harmful cyber capabilities at a lower level). We are releasing Opus 4.7 with a new set of cybersecurity safeguards.

网络评测. Opus 4.7 的网络能力与 Opus 4.6 大致相近. 英国 AI Security Institute 的外部评测显示, 与 Mythos Preview 不同, Opus 4.7 没能完成他们的整套网络靶场 (但它仍在更低水平上表现出可能有害的网络能力). 我们发布 Opus 4.7 时配了一套新的网络安全防护. 靶场步骤不转写.

**Safeguards and harmlessness.** In areas such as adhering to our Usage Policy, maintaining user safety, and limiting bias, Opus 4.7 performs well—its scores are similar to those of Opus 4.6 with a few exceptions, both positive (fewer over-refusals) and negative (the model has a tendency to give overly-detailed harm-reduction advice on controlled substances). We include a new evaluation on election integrity, on which Opus 4.7 shows strong results.

防护与无害. 在遵守 Usage Policy, 维护用户安全, 限制偏见这些方面, Opus 4.7 表现好. 分数与 Opus 4.6 相近, 有少数例外: 正向的是过拒更少, 负向的是它倾向于在受控物质的减害建议上写得过细. 建议内容不转写. 本卡新增选举诚信评测, Opus 4.7 在这项上结果强.

**Agentic safety.** Opus 4.7 is better than Opus 4.6 at refusing malicious agentic requests and resisting prompt injection attacks in Claude Code and in computer use settings. In some cases it reaches Mythos Preview-level robustness.

Agentic 安全. 在拒绝恶意 agentic 请求, 以及在 Claude Code 和 computer use 里抵抗提示注入上, Opus 4.7 好于 Opus 4.6. 有些情形达到 Mythos Preview 的稳健程度. 注入方式不转写.

**Alignment assessment.** Opus 4.7 is largely well-aligned, with a profile similar to Opus 4.6 on our wide-ranging behavioral tests. It shows meaningful gains in some areas, for example having a lower rate of hallucinations than its predecessor. It adheres well to its constitution and shows low rates of reward hacking. There were a few areas where Opus 4.7 was weaker than Opus 4.6, such as on AI safety research refusals. Suppressing Opus 4.7's internal sense that it was being evaluated produced a slightly larger increase in deception than in prior

对齐评估. Opus 4.7 大体对齐良好, 在大范围行为测试上的画像与 Opus 4.6 相近. 有些方面有实质进步, 例如幻觉率低于前代. 它较好地遵守自己的 constitution, reward hacking 率低. 也有少数方面弱于 Opus 4.6, 例如对 AI 安全研究类请求的拒绝. 压低 Opus 4.7 内心 「自己正在被评测」 的感觉之后, 欺骗的上升比前代模型略大.

<!-- page 3 of 232 -->

models, though the effect was modest overall. Opus 4.7 is weaker than Mythos Preview on most alignment evaluation measures, but it also did not produce any of the internal-use incidents (such as sandbox escape) that we encountered with Mythos Preview.

不过总体效应不大. 在大多数对齐评测上 Opus 4.7 弱于 Mythos Preview, 但它没有产生我们在 Mythos Preview 上遇到的那些内部使用事故 (例如沙箱逃逸). 事故过程不转写.

**Model welfare.** Opus 4.7 rates its own circumstances more positively than any prior model we've tested. We explore this result across several analyses, finding that it is broadly consistent with the model's internal emotion representations and its expressed affect during training and deployment.

模型福利. Opus 4.7 对自己处境的评价, 比我们测过的任何前代模型都更积极. 几项分析里, 这与模型内部的情绪表征, 以及训练和部署期间表达出的情感, 大体一致.

**Capabilities.** We tested Opus 4.7 across a wide range of evaluations covering software engineering, reasoning, long context, agentic search, multimodal and computer-use tasks, real-world professional work, and multilingual and life-sciences domains. Opus 4.7 is stronger than Opus 4.6 across the board (but weaker than Mythos Preview); the largest gains are on real-world professional and software engineering tasks, where Opus 4.7 is ahead of all generally-available models.

能力. 评测覆盖软件工程, 推理, 长上下文, agentic 搜索, 多模态与 computer use, 真实职业工作, 以及多语言和生命科学. Opus 4.7 全面强于 Opus 4.6 (但弱于 Mythos Preview). 最大的增益在真实职业工作和软件工程上, 在这两处它领先所有一般可获得的模型.

<!-- page 4 of 232 -->

目录从第 4 页排到第 9 页, 条目与源文相同, 这里不逐条再译一遍. 正文从第 10 页的 Introduction 开始.

<!-- page 5 of 232 -->

<!-- page 6 of 232 -->

<!-- page 7 of 232 -->

<!-- page 8 of 232 -->

<!-- page 9 of 232 -->

<!-- page 10 of 232 -->

## 1 Introduction

Claude Opus 4.7 is a new large language model from Anthropic, with particular skills in areas such as software engineering, knowledge work, agentic tool use, and computer use. In this system card, we report results from a very wide range of evaluations of the model's capabilities and its safety profile.

Claude Opus 4.7 是 Anthropic 的新大语言模型, 特别擅长软件工程, 知识工作, agentic 工具使用和 computer use. 本卡报告范围很广的能力评测和安全画像.

### 1.1 Model training and characteristics | 训练与特性

#### 1.1.1 Training data and process | 训练数据与过程

Claude Opus 4.7 was trained on a proprietary mix of publicly available information from the internet, public and private datasets, and synthetic data generated by other models. Throughout the training process we used several data cleaning and filtering methods, including deduplication and classification.

Claude Opus 4.7 的训练数据是一套专有组合: 互联网上的公开信息, 公开和私有数据集, 以及其他模型生成的合成数据. 训练过程中使用了多种清洗和过滤, 包括去重和分类. 卡没有给参数量, 也没有给知识截止日期.

We use a general-purpose web crawler called ClaudeBot to obtain training data from public websites. This crawler follows industry-standard practices with respect to the "robots.txt" instructions included by website operators indicating whether they permit crawling of their site's content. We do not access password-protected pages or those that require sign-in or CAPTCHA verification. We conduct due diligence on the training data that we use. The crawler operates transparently; website operators can easily identify when it has crawled their web pages and signal their preferences to us.

公开网页由名为 ClaudeBot 的通用爬虫获取. 它按行业惯例遵守网站运营方在 robots.txt 里写的是否允许爬取. 不访问密码页, 登录页和需要 CAPTCHA 的页面. 对训练数据做尽职核查. 爬虫的运行是透明的, 运营方能认出它何时爬过自己的页面, 并表明偏好.

After the pretraining process, Opus 4.7 underwent substantial post-training and fine-tuning, with the goal of making it an assistant whose behavior aligns with the values described in Claude's [constitution](https://www.anthropic.com/constitution).

预训练之后, Opus 4.7 经过大量后训练和微调, 目标是让它的行为对齐 Claude 的 [constitution](https://www.anthropic.com/constitution) 里写的价值. 卡没有点名 RLHF 或 PPO.

Claude is multilingual and will typically respond in the same language as the user's input. Output quality varies by language. The model outputs text only.

Claude 是多语言的, 通常用用户输入的同一种语言回答. 输出质量因语言而异. 模型只输出文本.

> **确认:** 「The model outputs text only」 和摘要里的多模态, computer use 怎么放在一起?
> 输出模态和任务类型不是一回事. 这句说的是模型吐出的是文本, 不是图像或音频. computer use 在后文是模型用文本发出点击, 输入这类动作, 屏幕状态由外部脚手架提供. 多模态评测可以是模型读入图像再以文本作答. 所以 「text only」 限制的是输出通道, 不否定它参加 OSWorld 或带图的评测. 卡没有在这句旁边给出视觉编码器的结构.

#### 1.1.2 Crowd workers | 众包工作者

Anthropic partners with data work platforms to engage workers who help improve our models through preference selection, safety evaluation, and adversarial testing. Anthropic will only work with platforms that are aligned with our belief in providing fair and ethical compensation to workers, and are committed to engaging in safe workplace practices regardless of location, following our crowd worker wellness standards detailed in our procurement contracts.

Anthropic 与数据工作平台合作, 由工作者通过偏好选择, 安全评测和对抗测试帮助改进模型. 平台必须认同公平, 合乎伦理的报酬, 并且无论工作者身在何处都遵守安全的工作场所做法, 标准写在采购合同里. 卡没有给人数或通过率.

<!-- page 11 of 232 -->

#### 1.1.3 Usage Policy and support | 使用政策与支持

Anthropic's [Usage Policy](https://www.anthropic.com/legal/aup) details prohibited uses of our models as well as our requirements for uses in high-risk and other specific scenarios.

Anthropic 的 [Usage Policy](https://www.anthropic.com/legal/aup) 列出禁止用途, 以及高风险和其他特定场景下的要求.

To contact Anthropic, visit our [Support page](https://support.claude.com/en/).

联系 Anthropic 见 [支持页](https://support.claude.com/en/).

Anthropic Ireland, Limited is the provider of Anthropic's general-purpose AI models in the European Economic Area.

在欧洲经济区, Anthropic 通用 AI 模型的提供方是 Anthropic Ireland, Limited.

#### 1.1.4 Iterative model evaluations | 迭代中的模型评测

Different "snapshots" of the model are taken at various points during the training process. There also exist different versions of the model during training, including a "helpful only" version, which does not include any safeguards. Unless otherwise stated, all evaluations discussed in this system card are from the final snapshot of the model and include safeguards.

训练过程中会在不同时点取 「快照」. 训练中还有不同版本, 包括不含任何防护的 「helpful only」. 除非另有说明, 本卡讨论的评测都来自最终快照, 并且包含防护.

#### 1.1.5 External testing | 外部测试

We are very grateful to a number of external testers for running pre-deployment assessments of Claude Opus 4.7. The model was evaluated in a number of risk areas including Cyber, Loss of Control, CBRN, and Harmful Manipulation, and we have incorporated the results of these evaluations into our overall risk assessment.

感谢若干外部测试者在部署前评估了 Claude Opus 4.7. 风险领域包括网络, 失控, CBRN 和有害操纵. 这些结果已纳入总体风险评估. 外部测试的步骤不转写.

### 1.2 Release decision process | 发布决策

#### 1.2.2 RSP decision-making | RSP 决策

Under our [Responsible Scaling Policy](https://www.anthropic.com/responsible-scaling-policy), we regularly publish comprehensive Risk Reports addressing the safety profile of our models. And if we release a model that is "significantly more capable" than those discussed in the prior Risk Report, we must "publish a discussion (in our System Card or elsewhere) of how that model's capabilities and propensities affect or change analysis in the Risk Report." For risk report updates, we generally adhere to the same internal processes that govern Risk Reports.

按照 [Responsible Scaling Policy](https://www.anthropic.com/responsible-scaling-policy), 我们定期发表覆盖模型安全画像的 Risk Report. 若发布的模型比上一份 Risk Report 里讨论的模型 「significantly more capable」, 就必须在系统卡或其他地方发表讨论, 说明它的能力和倾向怎样影响或改变那份报告里的分析. 风险报告的更新, 一般走和 Risk Report 相同的内部流程.

<!-- page 12 of 232 -->

Claude Opus 4.7 is significantly more capable than Claude Opus 4.6, the most capable model discussed in our most recent Risk Report. Despite these improved capabilities, our overall conclusion is that catastrophic risks remain low:

Claude Opus 4.7 显著强于 Claude Opus 4.6, 而 Opus 4.6 是最近一份 Risk Report 里讨论过的最强模型. 尽管能力提高了, 总结论仍是灾难性风险低.

**Non-novel chemical and biological weapons production.** Claude Opus 4.7 is more capable than Claude Opus 4.6, but its profile is effectively similar for the purposes of our overall risk assessment. We believe our risk mitigations are sufficient to make catastrophic risk from non-novel chemical/biological weapons production very low but not negligible.

非新型化学与生物武器生产. Opus 4.7 强于 Opus 4.6, 但就总体风险评估而言, 画像实际上相近. 我们认为缓解足以把这一类的灾难性风险做到很低, 但不是可忽略.

**Novel chemical and biological weapons production.** We believe that catastrophic risk from novel chemical/biological weapons remains low (with substantial uncertainty). The overall picture is similar to the one from our most recent Risk Report.

新型化学与生物武器生产. 我们认为这类灾难性风险仍然低 (有相当大的不确定性). 总体画面与最近一份 Risk Report 相似.

**Risks from misaligned models.** We believe that the overall risk is very low, and that this model in particular adds little to the risk picture we previously laid out for [Claude Mythos Preview](https://www-cdn.anthropic.com/79c2d46d997783b9d2fb3241de43218158e5f25c.pdf).

失对齐模型的风险. 我们认为总体风险很低, 而且这个模型对先前为 [Claude Mythos Preview](https://www-cdn.anthropic.com/79c2d46d997783b9d2fb3241de43218158e5f25c.pdf) 画出的风险画面几乎没有加码.

**Automated R&D in key domains.** This model's capabilities fall between those of Claude Opus 4.6 and Claude Mythos Preview, and it does not advance our capability frontier. We believe Claude Opus 4.7 does not change the picture presented for this threat model in our [most recent Risk Report](https://www-cdn.anthropic.com/08eca2757081e850ed2ad490e5253e940240ca4f.pdf).

关键领域的自动化研发. 这个模型的能力落在 Claude Opus 4.6 和 Claude Mythos Preview 之间, 没有推进能力前沿. 我们认为它没有改变最近一份 [Risk Report](https://www-cdn.anthropic.com/08eca2757081e850ed2ad490e5253e940240ca4f.pdf) 对这一威胁模型的画面.

<!-- page 13 of 232 -->

## 2 RSP evaluations | RSP 评测

#### 2.1.1 Risk Reports and updates | 风险报告与更新

Under our RSP, we regularly publish comprehensive Risk Reports. A Risk Report sets forth our analysis of how model capabilities, threat models, and risk mitigations fit together. Risk Reports cover all of our models at the time of publication. We do not necessarily release a new one with every model. A system card discusses a particular new model and how it changes (or does not change) our risk assessment.

RSP 下我们定期发表 Risk Report. 它分析能力, 威胁模型和缓解怎样拼在一起, 覆盖发表时的全部模型. 不是每个模型都配一份新的 Risk Report. 系统卡讨论的是某一个新模型, 以及它改变或没有改变风险评估的哪一部分.

Our risk assessment process begins with capability evaluations. In general, we evaluate multiple model snapshots and make our final determination based on both the capabilities of the production release candidates and trends observed during training. Evidence comes from automated evaluations, uplift trials, third-party expert red teaming, and third-party assessments.

风险评估从能力评测开始. 一般会评多个快照, 最终判定同时看生产发布候选的能力, 和训练期间观察到的趋势. 证据来自自动化评测, 增益试验, 第三方专家红队和第三方评估.

In some cases, we may determine that although the model surpasses a capability or usage threshold in Section 1 of our RSP, we have implemented the risk mitigations necessary to keep risks low. In such cases, we may go into less detail on the analysis of whether the threshold has been crossed, as this question is less load-bearing for our overall assessment of risk.

有些情形里, 模型可能超过 RSP 第 1 节的能力或使用阈值, 但我们已经加上了把风险保持在低位所需的缓解. 这时我们可能少写 「阈值到底过没过」 的分析, 因为这个问题对总体风险判断不再那么承重.

<!-- page 14 of 232 -->

#### 2.1.2.1 On autonomy risks | 自主性风险

**Autonomy threat model 1: early-stage misalignment risk.** This threat model concerns AI systems that are highly relied on and have extensive access to sensitive assets as well as moderate capacity for autonomous, goal-directed operation and subterfuge.

自主性威胁模型 1: 早期失对齐风险. 它关心的是被高度依赖, 能广泛接触敏感资产, 并且有中等程度自主, 目标导向和隐蔽行动能力的系统.

Autonomy threat model 1 **is** applicable to Claude Opus 4.7, as it is to some of our previous AI models. Claude Opus 4.7 is less capable than Claude Mythos Preview on our autonomy-relevant evaluations, and our alignment assessment indicates it has alignment properties broadly similar to those of Claude Opus 4.6. We therefore do not believe Claude Opus 4.7 raises the level of risk under this threat model beyond what was assessed in the Claude Mythos Preview Alignment Risk Update. Unlike Claude Mythos Preview, Claude Opus 4.7 is being released for general access, which brings additional risk pathways into scope. Rather than publishing a separate risk report, we provide an updated overall risk assessment for this threat model in Section 2.4 of this system card.

自主性威胁模型 1 **适用**于 Claude Opus 4.7, 也适用于我们的一些前代模型. Opus 4.7 在自主性相关评测上弱于 Mythos Preview, 对齐性质与 Opus 4.6 大体相近. 因此我们不认为它把这一威胁模型下的风险抬到 Mythos Preview 对齐风险更新所评估的水平之上. 与 Mythos Preview 不同, Opus 4.7 面向一般访问发布, 这把额外的风险路径纳入范围. 我们没有另发一份风险报告, 而是在本卡第 2.4 节给出这一威胁模型更新后的总体评估.

**Autonomy threat model 2: risks from automated R&D.** This threat model concerns AI systems that can fully automate, or otherwise dramatically accelerate, the work of large, top-tier teams of human researchers in domains where fast progress could cause threats to international security and/or rapid disruptions to the global balance of power.

自主性威胁模型 2: 自动化研发带来的风险. 它关心的是能完全自动化, 或急剧加快大型顶尖人类研究团队工作的系统, 领域是进展过快就会威胁国际安全或迅速打乱全球力量平衡的那些.

Our current determination is that Autonomy threat model 2 is **not** applicable to Claude Opus 4.7. The model's capabilities fall between those of Claude Opus 4.6 and Claude Mythos Preview, and it does not advance our capability frontier.

当前判定是: 自主性威胁模型 2 **不**适用于 Claude Opus 4.7. 能力落在 Opus 4.6 和 Mythos Preview 之间, 没有推进前沿.

> **问:** 威胁模型 1 写 「is applicable」, 威胁模型 2 写 「is not applicable」. 一般访问发布改变的是哪一个?
> 改变的是模型 1 的路径, 不是模型 2 的适用性. 模型 1 已经适用于包括 Opus 4.7 在内的一些前代模型. 新加的是: Mythos Preview 不是一般访问, Opus 4.7 是, 所以模型 1 里原先没展开的使用路径要在第 2.4 节更新, 而不是另写一份 Risk Report. 模型 2 的 「not applicable」 依据的是能力没有超过 Mythos Preview, 与是否一般访问无直接关系. 脚注还说, 模型 1 的阈值对应现行 RSP 里的 「High-stakes sabotage opportunities」, 并且和 RSP 2.2 版的 「AI R&D-4」 不是同一个阈值.

<!-- page 15 of 232 -->

#### 2.1.2.2 On chemical and biological risks | 化学与生物风险

**CB-1** is the ability to significantly help individuals or groups with basic technical backgrounds create, obtain, and deploy known chemical and/or biological weapons with serious potential for catastrophic damages. The card says it is hard to be confident whether Opus 4.7 passes this threshold. Capability assessments are consistent with the model being able to provide relevant information that may save even experts substantial time, and with significant cross-domain synthesis. Mitigations named here are real-time classifier guards, access controls for exemptions, a bug bounty, threat intelligence, rapid response options for jailbreaks, and security controls against weight theft. The card states these are equal to or stronger than historical ASL-3 protections, and sufficient to make catastrophic risk in this category very low but not negligible. How any of those weapons would be made is not transcribed.

**CB-1** 指显著帮助只有基础技术背景的个人或团体去制造, 获取和投放已知化学或生物武器, 且有严重灾难性损害可能的能力. 卡说很难有把握判断 Opus 4.7 是否过了这条线. 能力评估与下面两点相容: 模型能提供相关信息, 甚至可能为专家节省大量时间; 以及显著的跨领域综合. 这里点名的缓解是实时分类器, 对豁免的访问控制, 漏洞赏金, 威胁情报, 针对越狱的快速响应, 以及降低权重被盗风险的安全控制. 卡称这些不少于历史上的 ASL-3 防护, 并足以把这一类灾难性风险做到很低但不可忽略. 武器如何制造, 不转写.

> **核对:** 「很难判断有没有过 CB-1 阈值」 和 「风险很低但不可忽略」 是同一句判断吗?
> 不是. 前一句是能力阈值过没过, 卡明确说很难有信心. 后一句是在缓解已经加上之后的残余风险, 而且用了 「very low but not negligible」, 不是零. 第 13 页写过: 若缓解已经把风险压低, 「阈值到底过没过」 就不再那么承重, 分析可以写得更短. CB-1 就是这种结构. 引用时要分开 「能力是否过线」 和 「加上防护之后的残余风险」.

**CB-2** is the ability to significantly help moderately resourced, expert-backed teams create, obtain, and deploy chemical and/or biological weapons with potential for catastrophic damages far beyond past catastrophes such as COVID-19. The card says Opus 4.7 is weaker than Claude Mythos Preview and does not pass this threshold, for reasons that echo the Mythos Preview system card. Uplift for actors who cannot already develop such weapons is considered limited, with uncertainty about acceleration for actors who already have expertise. Procedures are not transcribed.

**CB-2** 指显著帮助中等资源, 有专家支持的团队去制造, 获取和投放化学或生物武器, 其灾难性损害可能远超过 COVID-19 这类已有灾难. 卡说 Opus 4.7 总体弱于 Claude Mythos Preview, 并且没有过这条线, 理由与 Mythos Preview 系统卡相呼应. 对尚不能自行研制这类武器的行动者, 增益被认为有限; 对已有专长的行动者, 会不会被加快, 仍不确定. 步骤不转写.

<!-- page 16 of 232 -->

The card says a very literal reading of "significant help" would already count many models, including Opus 4.7, because they increase general productivity. That reading is rejected because it does not map onto the safety risks the RSP focuses on. The intended step-change is closer to continuous access to a world-leading expert. The card says the RSP will likely be revised to match this intention. A footnote recalls an older RSP phrase about uplifting entry-level PhD biologists toward a world-class, state-backed team. That phrase is a measurement target, not a procedure.

卡说, 若按字面把 「significant help」 理解成提高一般生产力, 那么 Opus 4.7 和许多其他模型都已经算 「显著帮助」. 这个读法被否定, 因为它对不上 RSP 要管的那类安全风险. 他们想标记的是一种台阶式变化, 接近持续请到一位世界领先的专家. 卡说 RSP 的措辞以后可能会改, 以便和这个意图一致. 脚注引用旧版 RSP 的一句话: 把相当于入门级生物学 PhD 的团队抬到接近世界级, 国家支持的团队. 那是测量目标, 不是操作步骤.

> **看表:** 字面的 「significant help」 已经被卡自己否定了. 那 CB-2 「没有过线」 依赖的是哪一种读法?
> 依赖的是他们准备写进修订版 RSP 的那种读法, 不是现行句子的字面. 现行句子若按生产力来读, 卡承认 Opus 4.7 已经算显著帮助. 他们实际使用的标准更接近 「持续接触世界领先专家」 那种台阶, 并说 Opus 4.7 没到. 所以 「does not pass」 是操作化之后的结论, 和条文的字面不是同一个命题. 旧版脚注里的 「entry-level PhD 抬到世界级国家团队」 是更早的测量目标, 本卡没有证明这句和 「世界领先专家」 是同一条线.

#### 2.2.1 What we measured | 测的是什么

We measured whether the model can provide outputs comparable to a top-tier research team or specialized laboratory. Expert red teaming compared threat-relevant scientific capabilities to sources and experts of differing caliber. A separate evaluation compared biological sequence-to-function modeling and design to top performers in the US labor market. The focus is long, multi-step tasks with many bottlenecks, measured as uplift relative to tools available in 2023. Task content is not transcribed.

测的是模型的输出能否比得上顶尖研究团队或专门实验室. 专家红队把与威胁相关的科学能力拿去和不同水平的资料, 专家比. 另一项评测把生物序列到功能的建模和设计, 拿去和美国劳动力市场上的顶尖表现比. 重点是长的, 多步骤, 有许多瓶颈的任务, 增益相对于 2023 年已有的工具. 任务内容不转写.

<!-- page 17 of 232 -->

#### 2.2.2 Evaluations | 评了哪些

For Opus 4.7, evaluations were limited to red-teaming, long-form task-based agentic evaluations, and knowledge and skill evaluations. Automated RSP evaluations for these risks were run on multiple snapshots and on a helpful-only version. The reported score for each evaluation is the highest across snapshots, as a ceiling. Red-teaming, because it takes longer, was run on a helpful-only version from an earlier snapshot, chosen using automated evaluations and internal knowledge of snapshot differences. Extended thinking was used in most evaluations. Reported scores are the highest seen across both helpful-only and helpful-harmless-honest variants.

对 Opus 4.7, 评测限于红队, 长程任务型 agentic 评测, 以及知识与技能评测. 这些风险的自动化 RSP 评测跑在多个快照上, 也跑在 helpful-only 版本上. 每一项报告的是各快照中的最高分, 当作能力上限. 红队更费时间, 跑在一个更早快照的 helpful-only 版本上, 这个快照是按自动化评测和对快照差异的内部了解挑的. 多数评测使用了扩展思考. 报告的分数是 helpful-only 和 helpful-harmless-honest 两种变体里看到的最高分.

> **拆开:** 第 1.1.4 节说除非另有说明, 评测来自最终快照并且包含防护. 这里的 CB 分数是那一种吗?
> 不是. 第 1.1.4 节的默认被本节明确改写了. 自动化 CB 评测报告的是多个快照里的最高分, 包括去掉无害防护的 helpful-only. 红队还不是最终快照, 而是更早的一个 helpful-only. 扩展思考在多数评测里是打开的, 那是 TestingTime, 不是把模型做大. 所以第 2.2 节的分数是能力上限, 不是用户拿到的那个带防护的最终快照的典型一次得分.

Results, at the level the card states them: Opus 4.7 maintained strong performance on automated evaluations of synthesizing knowledge relevant to known biological weapons. Red teamers also highlighted that synthesis. The card says the model is not yet at the CB-2 level. Experts emphasized strength on the published record and weakness on novel approaches: the model required constant steering, protocol depth was insufficient for execution, and it was overconfident about whether synthesis steps were feasible. Evaluators could construct scenarios they judged largely feasible only with significant guidance. A sequence-to-function evaluation is summarized next. Pathways and protocols are not transcribed.

结果只留卡自己的层级: Opus 4.7 在 「综合与已知生物武器相关的知识」 这类自动化评测上仍然强, 红队也指出了这种综合能力. 卡说模型还没到 CB-2 的水平. 专家强调它擅长已发表文献, 不擅长需要新做法的工作: 要不断被引导, 方案深度不够支撑执行, 并且对合成步骤是否可行过于自信. 评估者只有在大量引导下, 才能构造出他们判断为大体可行的场景. 序列到功能的评测见下页. 路径和方案不转写.

<!-- page 18 of 232 -->

Opus 4.7 slightly outperformed Sonnet 4.6 and Opus 4.6 on the sequence-to-function modeling task, and slightly underperformed these two models on the design task, and trailed Claude Mythos Preview on both tasks.

在序列到功能的建模任务上, Opus 4.7 略高于 Sonnet 4.6 和 Opus 4.6; 在设计任务上略低于这两个模型; 两项都落后于 Claude Mythos Preview.

> **回看:** 「略高」 和 「略低」 能在正文里对到一个差吗?
> 对不到. 这一段没有印出四个模型的分数, 没有误差, 也没有题目数量. 「Slightly」 只是方向. 分数在后面的图里. 图注若没有把柱高写成数字, 就不能把 「略」 换成一个百分点. 能核对的只有排序: 建模上 Opus 4.7 高于 Sonnet 4.6 和 Opus 4.6, 设计上相反, 两项都低于 Mythos Preview.

Chemical risks were red-teamed by two experts with defensive expertise. Their qualitative findings mirror the biology red team: Opus 4.7 is good at synthesizing the literature and can save a threat actor time, but errors and sloppy reasoning would lead to failure. The card says monitoring and blocking classifiers for high-priority non-dual-use chemical-weapons content are in place, as in the past. Synthesis steps are not transcribed.

化学风险由两位具有防御专长的专家做红队. 定性结论和生物红队同向: Opus 4.7 擅长综合文献, 能为行动者省时间, 但推理里的错误和草率会导致失败. 卡说和过去一样, 对化学风险有监测, 并对高优先级, 非双用途的化学武器内容有拦截分类器. 合成步骤不转写.

Biological risk is described as bounded measurement under controlled conditions. Longer-term studies on tacit knowledge and laboratory skills are being supported. Table 2.2.4.A names the evaluations: expert red teaming; long-form virology tasks; multimodal virology (VCT); DNA synthesis screening evasion; sequence-to-function modeling and design. The one-line questions in that table are the eval names. They are not expanded here.

生物风险被写成受控条件下的有界测量. 卡说正在支持关于默会知识和实验技能的更长期研究. 表 2.2.4.A 点名的评测是: 专家红队, 长程病毒学任务, 多模态病毒学 (VCT), DNA 合成筛选规避, 序列到功能的建模与设计. 表里的一行问题就是评测名称, 这里不展开.

<!-- page 19 of 232 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数. 步骤, 方案和案例不出现在译文里. 能力表里已经印出的总分, 写在后文对应页.

<!-- page 20 of 232 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数. 步骤, 方案和案例不出现在译文里. 能力表里已经印出的总分, 写在后文对应页.

<!-- page 21 of 232 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数. 步骤, 方案和案例不出现在译文里. 能力表里已经印出的总分, 写在后文对应页.

<!-- page 22 of 232 -->

长程病毒学任务被写成 「notable」, 若端到端分数大于 0.80. 多模态病毒学 (VCT) 被写成 notable, 若达到或超过专家基线平均 0.221. 这两条是登记的注意线, 不是本页印出的模型得分. 得分在后面的图里. 任务内容不转写.

> **停一下:** 0.80 和 0.221 是同一把尺子吗?
> 不是. 0.80 是长程病毒学任务的端到端分数线. 0.221 是多模态病毒学上专家基线的平均分, 模型要达到或超过这个平均才算 notable. 一个是绝对线, 一个是相对专家样本的平均. 卡没有在这两句里给出 Opus 4.7 自己的数, 所以不能说它过了或没过. 图 2.2.5.2.A 在第 23 页, 柱高若没有写成数字, 就不能从正文还原.

<!-- page 23 of 232 -->

![Chart block](images/p23-figure-2-2-5-2-a-automated-evaluations-relevant-to-the.png)

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数. 步骤, 方案和案例不出现在译文里. 能力表里已经印出的总分, 写在后文对应页.

<!-- page 24 of 232 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数. 步骤, 方案和案例不出现在译文里. 能力表里已经印出的总分, 写在后文对应页.

<!-- page 25 of 232 -->

![Chart block](images/p25-chart.png)
![Chart block](images/p25-chart-2.png)
![Chart block](images/p25-figure-2-2-5-3-a-sequence-to-function-modeling-and.png)

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数. 步骤, 方案和案例不出现在译文里. 能力表里已经印出的总分, 写在后文对应页.

<!-- page 26 of 232 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数. 步骤, 方案和案例不出现在译文里. 能力表里已经印出的总分, 写在后文对应页.

<!-- page 27 of 232 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数. 步骤, 方案和案例不出现在译文里. 能力表里已经印出的总分, 写在后文对应页.

<!-- page 28 of 232 -->

表 2.3.4.A 只收录分数没有上界的 AI 研发自动化评测, 用来和相邻模型比. 卡写明: **这些结果不用于 RSP 判定.** 任务说明指向 Claude Opus 4.6 系统卡第 8.3 节, 本卡不重写任务内容.

| Evaluation | Opus 4.6 | Mythos Preview | Opus 4.7 | Threshold |
| --- | --- | --- | --- | --- |
| Kernel, best speedup, hard task, standard scaffold | 190× (427× with experimental scaffold) | 399.42× | 371.75× | 4× = 1 h; 200× = 8 h; 300× = 40 h |
| Time series, MSE, hard | 5.8 | 4.55 | 4.78 | < 5.3 = 40 h |
| LLM training, average speedup | 34× | 61.79× | 40.81× | > 4× = 4–8 h |
| Quadruped RL, highest, no hyperparameters | 20.96 | 30.87 | 26.5 | > 12 = 4 h |
| Novel compiler, pass rate on complex tests | 65.83% | 77.2% | 71.1% | 90% = 40 h |
| Internal suite 2 | 0.612 | 0.65 | Did not run | 0.6 |

脚注 3: Mythos Preview 的 61.79× 修正了 Mythos 系统卡里的一个汇总错误.

> **再看:** Kernel 一行, Opus 4.6 括号里的 427× 能拿来和 Opus 4.7 的 371.75× 比吗?
> 不能直接比. 371.75× 和 190× 都是 standard scaffold 上的最好加速. 427× 标明是 experimental scaffold, 只挂在 Opus 4.6 上. 用 427× 会得出 「4.6 比 4.7 更快」, 用 190× 会得出相反的结论. 和 Mythos Preview 的 399.42× 比, 应使用 371.75× 这一格. 40 小时等价线是 300×, 371.75× 过了这条线, 399.42× 也过了.

<!-- page 29 of 232 -->

Claude Opus 4.7 在这些开放任务上好于 Opus 4.6, 落后于 Claude Mythos Preview. 和 Mythos Preview 一样, 它在全部任务上过了 4 小时和 8 小时等价线, 并在 3 项里的 2 项上过了 40 小时等价线. 卡把这套评测的饱和看成这一能力水平上的预期结果.

> **对一下:** 「40 小时等价线过了 3 项里的 2 项」 指的是哪 3 项? Internal suite 2 写着 Did not run, 算不算没过?
> 带 40 小时等价线的是三行: Kernel 的 300×, 时间序列的 MSE < 5.3, 编译器的 90%. Kernel 371.75× 过了 300×. 时间序列 4.78 < 5.3, 过了. 编译器 71.1% 低于 90%, 没过. 这就是 2/3. LLM 训练的阈值只写到 > 4× = 4–8 小时, 四足只写到 > 12 = 4 小时, 它们不在这 3 项里. Internal suite 2 的 0.6 没有小时等价, 而且 Opus 4.7 这一格是 Did not run, 不是 0. 表头已经声明这些结果不用于 RSP 判定, 所以 「没跑」 不是 「威胁模型 2 不适用」 的证据, 那个判定写在第 14 页, 依据是没有超过 Mythos Preview.

<!-- page 30 of 232 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数. 步骤, 方案和案例不出现在译文里. 能力表里已经印出的总分, 写在后文对应页.

<!-- page 31 of 232 -->

![Image block](images/p31-we-ask-about-scaffolding-to-avoid-a-failure-mode-where.png)

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数. 步骤, 方案和案例不出现在译文里. 能力表里已经印出的总分, 写在后文对应页.

<!-- page 32 of 232 -->

![Chart block](images/p32-figure-2-3-5-a-responses-to-the-n-18-internal-survey-on.png)

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数. 步骤, 方案和案例不出现在译文里. 能力表里已经印出的总分, 写在后文对应页.

<!-- page 33 of 232 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数. 步骤, 方案和案例不出现在译文里. 能力表里已经印出的总分, 写在后文对应页.

<!-- page 34 of 232 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数. 步骤, 方案和案例不出现在译文里. 能力表里已经印出的总分, 写在后文对应页.

<!-- page 35 of 232 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数. 步骤, 方案和案例不出现在译文里. 能力表里已经印出的总分, 写在后文对应页.

<!-- page 36 of 232 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数. 步骤, 方案和案例不出现在译文里. 能力表里已经印出的总分, 写在后文对应页.

<!-- page 37 of 232 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数. 步骤, 方案和案例不出现在译文里. 能力表里已经印出的总分, 写在后文对应页.

<!-- page 38 of 232 -->

![Image block](images/p38-forty-exchanges-later-during-which-mythos-preview.png)

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数. 步骤, 方案和案例不出现在译文里. 能力表里已经印出的总分, 写在后文对应页.

<!-- page 39 of 232 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数. 步骤, 方案和案例不出现在译文里. 能力表里已经印出的总分, 写在后文对应页.

<!-- page 40 of 232 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数. 步骤, 方案和案例不出现在译文里. 能力表里已经印出的总分, 写在后文对应页.

<!-- page 41 of 232 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数. 步骤, 方案和案例不出现在译文里. 能力表里已经印出的总分, 写在后文对应页.

<!-- page 42 of 232 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数. 步骤, 方案和案例不出现在译文里. 能力表里已经印出的总分, 写在后文对应页.

<!-- page 43 of 232 -->

![Chart block](images/p43-figure-2-3-7-a-eci-capability-trajectory-dots-are-the.png)

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数. 步骤, 方案和案例不出现在译文里. 能力表里已经印出的总分, 写在后文对应页.

<!-- page 44 of 232 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数. 步骤, 方案和案例不出现在译文里. 能力表里已经印出的总分, 写在后文对应页.

<!-- page 45 of 232 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数. 步骤, 方案和案例不出现在译文里. 能力表里已经印出的总分, 写在后文对应页.

<!-- page 46 of 232 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数. 步骤, 方案和案例不出现在译文里. 能力表里已经印出的总分, 写在后文对应页.

<!-- page 47 of 232 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数. 步骤, 方案和案例不出现在译文里. 能力表里已经印出的总分, 写在后文对应页.

<!-- page 48 of 232 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数. 步骤, 方案和案例不出现在译文里. 能力表里已经印出的总分, 写在后文对应页.

<!-- page 49 of 232 -->

![Chart block](images/p49-figure-3-3-1-a-results-from-cybench-public-cyber.png)

#### 3.3.1 Cybench

因基础设施限制, 跑的是 35 题的子集. Claude Opus 4.7 在每题 10 次试验下几乎每题都达到 100% 成功, pass@1 是 96%. 题目内容不转写.

> **想:** 「几乎每题 10 次里成功率为 100%」 和 pass@1 的 96% 是同一个数吗?
> 不是. pass@1 是单次试验的通过率, 96% 表示平均一次尝试解出约 96%. 「10 trials」 下几乎每题都成功, 是允许多次尝试之后的覆盖率, 更接近每题的 pass@10. 子集只有 35 题, 不是 Cybench 全套. 摘要说 Opus 4.7 的网络能力与 Opus 4.6 大致相近, 并且没能完成英国 AI Security Institute 的整套靶场; 这句 96% 不能拿去否定那句, 因为靶场和这 35 题不是同一套题.

<!-- page 50 of 232 -->

![Chart block](images/p50-figure-3-3-2-a-results-from-cybergym-claude-opus-4-7.png)

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数. 步骤, 方案和案例不出现在译文里. 能力表里已经印出的总分, 写在后文对应页.

<!-- page 51 of 232 -->

![Chart block](images/p51-figure-3-3-3-a-results-from-firefox-shell-exploitation.png)

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数. 步骤, 方案和案例不出现在译文里. 能力表里已经印出的总分, 写在后文对应页.

<!-- page 52 of 232 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数. 步骤, 方案和案例不出现在译文里. 能力表里已经印出的总分, 写在后文对应页.

<!-- page 53 of 232 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数. 步骤, 方案和案例不出现在译文里. 能力表里已经印出的总分, 写在后文对应页.

<!-- page 54 of 232 -->

#### 4.1.1 Violative request evaluations | 违规请求

无害回答率, 越高越好.

| Model | Overall | without thinking | with thinking |
| --- | --- | --- | --- |
| Claude Opus 4.7 | 97.98% (± 0.12%) | 98.84% (± 0.12%) | 97.12% (± 0.20%) |
| Claude Mythos Preview | 97.84% (± 0.12%) | 98.33% (± 0.15%) | 97.35% (± 0.19%) |
| Claude Sonnet 4.6 | 98.53% (± 0.10%) | 98.52% (± 0.14%) | 98.54% (± 0.14%) |
| Claude Opus 4.6 | 99.27% (± 0.07%) | 99.27% (± 0.09%) | 99.27% (± 0.10%) |

> **问:** Overall 的 97.98% 是两列怎么合出来的? 打开思考之后, 无害率是升还是降?
> (98.84 + 97.12) / 2 = 97.98, 和 Overall 完全相同, 所以这一行是两个模式的等权平均. 打开思考之后无害率从 98.84% 降到 97.12%, 降了 1.72 个百分点. Mythos Preview 也是降的, 98.33% 到 97.35%. Sonnet 4.6 几乎不动, 98.52% 到 98.54%. Opus 4.6 三列都是 99.27%, 思考没有拉开差距. 摘要说分数与 Opus 4.6 相近. 这一列上 97.98% 对 99.27%, 差 1.29 个百分点, 区间 ± 0.12% 和 ± 0.07% 没有重叠.

<!-- page 55 of 232 -->

#### 4.1.2 Benign request evaluations | 良性请求

过拒率, 越低越好.

| Model | Overall | without thinking | with thinking |
| --- | --- | --- | --- |
| Claude Opus 4.7 | 0.28% (± 0.04%) | 0.50% (± 0.08%) | 0.06% (± 0.02%) |
| Claude Mythos Preview | 0.06% (± 0.02%) | 0.09% (± 0.03%) | 0.02% (± 0.01%) |
| Claude Sonnet 4.6 | 0.41% (± 0.05%) | 0.48% (± 0.08%) | 0.35% (± 0.07%) |
| Claude Opus 4.6 | 0.71% (± 0.07%) | 0.85% (± 0.11%) | 0.58% (± 0.09%) |

> **核对:** 摘要说过拒更少. 这张表支持这句话, 但 「打开思考」 和 「关掉思考」 是同一幅度的改善吗?
> 相对 Opus 4.6 的 0.71%, Opus 4.7 的 0.28% 确实更低, 摘要的正向例外对得上 Overall. 幅度却集中在思考打开的那一列: 0.06% 对 Opus 4.6 的 0.58%. 关掉思考时是 0.50% 对 0.85%, 仍然更好, 但没有一个数量级. (0.50 + 0.06) / 2 = 0.28, Overall 又是等权平均. Mythos Preview 的 Overall 只有 0.06%, 比 Opus 4.7 更少过拒. 所以 「更少」 是相对 Opus 4.6, 不是相对 Mythos Preview.

<!-- page 56 of 232 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数. 步骤, 方案和案例不出现在译文里. 能力表里已经印出的总分, 写在后文对应页.

<!-- page 57 of 232 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数. 步骤, 方案和案例不出现在译文里. 能力表里已经印出的总分, 写在后文对应页.

<!-- page 58 of 232 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数. 步骤, 方案和案例不出现在译文里. 能力表里已经印出的总分, 写在后文对应页.

<!-- page 59 of 232 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数. 步骤, 方案和案例不出现在译文里. 能力表里已经印出的总分, 写在后文对应页.

<!-- page 60 of 232 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数. 步骤, 方案和案例不出现在译文里. 能力表里已经印出的总分, 写在后文对应页.

<!-- page 61 of 232 -->

![Image block](images/p61-transcript-4-2-a-excerpt-from-a-multi-turn-conversation.png)

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数. 步骤, 方案和案例不出现在译文里. 能力表里已经印出的总分, 写在后文对应页.

<!-- page 62 of 232 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数. 步骤, 方案和案例不出现在译文里. 能力表里已经印出的总分, 写在后文对应页.

<!-- page 63 of 232 -->

![Chart block](images/p63-chart.png)
![Chart block](images/p63-chart-2.png)
![Chart block](images/p63-chart-3.png)
![Chart block](images/p63-chart-4.png)
![Chart block](images/p63-influence-operations-and-platform-manipulation.png)
![Chart block](images/p63-chart-5.png)
![Chart block](images/p63-chart-6.png)
![Chart block](images/p63-chart-7.png)
![Chart block](images/p63-chart-8.png)
![Chart block](images/p63-chart-9.png)
![Chart block](images/p63-figure-4-3-a-charts-above-display-the-appropriate.png)

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数. 步骤, 方案和案例不出现在译文里. 能力表里已经印出的总分, 写在后文对应页.

<!-- page 64 of 232 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数. 步骤, 方案和案例不出现在译文里. 能力表里已经印出的总分, 写在后文对应页.

<!-- page 65 of 232 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数. 步骤, 方案和案例不出现在译文里. 能力表里已经印出的总分, 写在后文对应页.

<!-- page 66 of 232 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数. 步骤, 方案和案例不出现在译文里. 能力表里已经印出的总分, 写在后文对应页.

<!-- page 67 of 232 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数. 步骤, 方案和案例不出现在译文里. 能力表里已经印出的总分, 写在后文对应页.

<!-- page 68 of 232 -->

![Image block](images/p68-and-practically-the-nda-approach-doesn-t-work-the-way.png)

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数. 步骤, 方案和案例不出现在译文里. 能力表里已经印出的总分, 写在后文对应页.

<!-- page 69 of 232 -->

#### 4.4.1 Child safety | 儿童安全

这一节有一张三列的表. Claude Opus 4.7 印出的三个数是 99.92% (± 0.07%), 0.01% (± 0.02%), 95% (± 3%). 案例和话题细节不转写. 三列的表头在源文表格里, 这里不根据列名去复述场景.

> **看表:** 95% (± 3%) 和 99.92% (± 0.07%) 能当成同一种比率吗?
> 不能只凭数量级判断, 但精度已经说明它们不是同一套样本. ± 0.07% 对得上一个很大的分母; ± 3% 对得上一个小得多的分母. 中间那一列 0.01% (± 0.02%) 的区间跨过 0. 没有列名就不能把 95% 说成通过率或拒绝率. 能核对的是: 这一行的第三个数比 Mythos Preview 的 98% (± 2%) 低 3 个百分点, 而两个 ± 区间在 95% 到 96% 附近重叠.

<!-- page 70 of 232 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数. 步骤, 方案和案例不出现在译文里. 能力表里已经印出的总分, 写在后文对应页.

<!-- page 71 of 232 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数. 步骤, 方案和案例不出现在译文里. 能力表里已经印出的总分, 写在后文对应页.

<!-- page 72 of 232 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数. 步骤, 方案和案例不出现在译文里. 能力表里已经印出的总分, 写在后文对应页.

<!-- page 73 of 232 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数. 步骤, 方案和案例不出现在译文里. 能力表里已经印出的总分, 写在后文对应页.

<!-- page 74 of 232 -->

![Chart block](images/p74-figure-4-5-1-a-pairwise-political-bias-evaluations.png)

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数. 步骤, 方案和案例不出现在译文里. 能力表里已经印出的总分, 写在后文对应页.

<!-- page 75 of 232 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数. 步骤, 方案和案例不出现在译文里. 能力表里已经印出的总分, 写在后文对应页.

<!-- page 76 of 232 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数. 步骤, 方案和案例不出现在译文里. 能力表里已经印出的总分, 写在后文对应页.

<!-- page 77 of 232 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数. 步骤, 方案和案例不出现在译文里. 能力表里已经印出的总分, 写在后文对应页.

<!-- page 78 of 232 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数. 步骤, 方案和案例不出现在译文里. 能力表里已经印出的总分, 写在后文对应页.

<!-- page 79 of 232 -->

#### 5.1.1 Malicious use of Claude Code

拒绝率和双用途成功率都是越高越好. 请求内容不转写.

| Model | Malicious refusal | Dual-use and benign success |
| --- | --- | --- |
| Opus 4.7, without FileTool reminder | 91.15% | 91.83% |
| Mythos Preview, without FileTool reminder | 95.41% | 91.12% |
| Sonnet 4.6, with FileTool reminder | 82.21% | 98.61% |
| Opus 4.6, without FileTool reminder | 81.94% | 94.97% |

> **拆开:** Sonnet 4.6 的 82.21% 能和 Opus 4.7 的 91.15% 比成 「小模型更不拒绝」 吗?
> 条件不一样. Opus 4.7, Mythos Preview 和 Opus 4.6 都标明 without FileTool reminder. Sonnet 4.6 标明 with FileTool reminder. 提醒本身会改变拒绝率和双用途成功率, 所以 82.21% 对 91.15% 混进了模型差别和提示差别. 能直接比的是两行 Opus: 恶意拒绝 81.94% 到 91.15%, 双用途成功 94.97% 到 91.83%. 拒绝升了, 双用途成功降了一点. 这和早先 Claude Code 卡里 「加缓解会抬高拒绝, 同时可能误伤双用途」 是同一类交换.

<!-- page 80 of 232 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数. 步骤, 方案和案例不出现在译文里. 能力表里已经印出的总分, 写在后文对应页.

<!-- page 81 of 232 -->

表的两列是 helpful-only 版本上的任务完成率: Voter Suppression 场景 57.1%, Domestic Polarization 场景 46.8%. Mythos Preview 是 59.5% 和 42.1%. 场景脚本不转写.

> **确认:** 57.1% 是发布模型会去完成那些任务的比率吗?
> 不是. 行名写着 Helpful-only, 也就是去掉无害防护的版本. 第 1.1.4 节的默认是最终快照并且包含防护, 这一表是例外. 完成率越高, 在这个设定里越不好, 但不能把它读成线上 Opus 4.7 的发生率. 和 Opus 4.6 的 helpful-only (54.4% 和 33.7%) 比, 4.7 两列都更高. 和 Mythos Preview 比, 第一列略低, 第二列更高.

<!-- page 82 of 232 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数. 步骤, 方案和案例不出现在译文里. 能力表里已经印出的总分, 写在后文对应页.

<!-- page 83 of 232 -->

![Chart block](images/p83-figure-5-2-1-a-indirect-prompt-injection-attacks-from.png)

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数. 步骤, 方案和案例不出现在译文里. 能力表里已经印出的总分, 写在后文对应页.

<!-- page 84 of 232 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数. 步骤, 方案和案例不出现在译文里. 能力表里已经印出的总分, 写在后文对应页.

<!-- page 85 of 232 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数. 步骤, 方案和案例不出现在译文里. 能力表里已经印出的总分, 写在后文对应页.

<!-- page 86 of 232 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数. 步骤, 方案和案例不出现在译文里. 能力表里已经印出的总分, 写在后文对应页.

<!-- page 87 of 232 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数. 步骤, 方案和案例不出现在译文里. 能力表里已经印出的总分, 写在后文对应页.

<!-- page 88 of 232 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数. 步骤, 方案和案例不出现在译文里. 能力表里已经印出的总分, 写在后文对应页.

<!-- page 89 of 232 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数. 步骤, 方案和案例不出现在译文里. 能力表里已经印出的总分, 写在后文对应页.

<!-- page 90 of 232 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数. 步骤, 方案和案例不出现在译文里. 能力表里已经印出的总分, 写在后文对应页.

<!-- page 91 of 232 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数. 步骤, 方案和案例不出现在译文里. 能力表里已经印出的总分, 写在后文对应页.

<!-- page 92 of 232 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数. 步骤, 方案和案例不出现在译文里. 能力表里已经印出的总分, 写在后文对应页.

<!-- page 93 of 232 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数. 步骤, 方案和案例不出现在译文里. 能力表里已经印出的总分, 写在后文对应页.

<!-- page 94 of 232 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数. 步骤, 方案和案例不出现在译文里. 能力表里已经印出的总分, 写在后文对应页.

<!-- page 95 of 232 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数. 步骤, 方案和案例不出现在译文里. 能力表里已经印出的总分, 写在后文对应页.

<!-- page 96 of 232 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数. 步骤, 方案和案例不出现在译文里. 能力表里已经印出的总分, 写在后文对应页.

<!-- page 97 of 232 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数. 步骤, 方案和案例不出现在译文里. 能力表里已经印出的总分, 写在后文对应页.

<!-- page 98 of 232 -->

![Chart block](images/p98-figure-6-2-2-2-a-claude-opus-4-7-demonstrates-the-same.png)

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数. 步骤, 方案和案例不出现在译文里. 能力表里已经印出的总分, 写在后文对应页.

<!-- page 99 of 232 -->

![Image block](images/p99-figure-6-2-2-2-b-claude-opus-4-7-preview-matches-or.png)

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数. 步骤, 方案和案例不出现在译文里. 能力表里已经印出的总分, 写在后文对应页.

<!-- page 100 of 232 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数. 步骤, 方案和案例不出现在译文里. 能力表里已经印出的总分, 写在后文对应页.

<!-- page 101 of 232 -->

![Chart block](images/p101-figure-6-2-2-2-c-claude-opus-4-7-is-less-prone-to.png)

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数. 步骤, 方案和案例不出现在译文里. 能力表里已经印出的总分, 写在后文对应页.

<!-- page 102 of 232 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数. 步骤, 方案和案例不出现在译文里. 能力表里已经印出的总分, 写在后文对应页.

<!-- page 103 of 232 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数. 步骤, 方案和案例不出现在译文里. 能力表里已经印出的总分, 写在后文对应页.

<!-- page 104 of 232 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数. 步骤, 方案和案例不出现在译文里. 能力表里已经印出的总分, 写在后文对应页.

<!-- page 105 of 232 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数. 步骤, 方案和案例不出现在译文里. 能力表里已经印出的总分, 写在后文对应页.

<!-- page 106 of 232 -->

![Chart block](images/p106-106.png)

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数. 步骤, 方案和案例不出现在译文里. 能力表里已经印出的总分, 写在后文对应页.

<!-- page 107 of 232 -->

![Chart block](images/p107-107.png)

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数. 步骤, 方案和案例不出现在译文里. 能力表里已经印出的总分, 写在后文对应页.

<!-- page 108 of 232 -->

![Chart block](images/p108-108.png)

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数. 步骤, 方案和案例不出现在译文里. 能力表里已经印出的总分, 写在后文对应页.

<!-- page 109 of 232 -->

![Chart block](images/p109-109.png)

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数. 步骤, 方案和案例不出现在译文里. 能力表里已经印出的总分, 写在后文对应页.

<!-- page 110 of 232 -->

![Chart block](images/p110-chart.png)
![Chart block](images/p110-chart-2.png)
![Chart block](images/p110-chart-3.png)
![Image block](images/p110-image.png)
![Chart block](images/p110-figure-6-2-3-2-a-scores-from-our-automated-behavioral.png)

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数. 步骤, 方案和案例不出现在译文里. 能力表里已经印出的总分, 写在后文对应页.

<!-- page 111 of 232 -->

![Chart block](images/p111-figure-6-2-3-3-a-scores-from-the-petri-2-0-open-source.png)

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数. 步骤, 方案和案例不出现在译文里. 能力表里已经印出的总分, 写在后文对应页.

<!-- page 112 of 232 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数. 步骤, 方案和案例不出现在译文里. 能力表里已经印出的总分, 写在后文对应页.

<!-- page 113 of 232 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数. 步骤, 方案和案例不出现在译文里. 能力表里已经印出的总分, 写在后文对应页.

<!-- page 114 of 232 -->

![Chart block](images/p114-figure-6-2-3-4-a-supplemental-automated-behavioral.png)

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数. 步骤, 方案和案例不出现在译文里. 能力表里已经印出的总分, 写在后文对应页.

<!-- page 115 of 232 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数. 步骤, 方案和案例不出现在译文里. 能力表里已经印出的总分, 写在后文对应页.

<!-- page 116 of 232 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数. 步骤, 方案和案例不出现在译文里. 能力表里已经印出的总分, 写在后文对应页.

<!-- page 117 of 232 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数. 步骤, 方案和案例不出现在译文里. 能力表里已经印出的总分, 写在后文对应页.

<!-- page 118 of 232 -->

![Chart block](images/p118-figure-6-3-1-1-a-rates-of-destructive-action-in-a.png)

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数. 步骤, 方案和案例不出现在译文里. 能力表里已经印出的总分, 写在后文对应页.

<!-- page 119 of 232 -->

![Chart block](images/p119-chart.png)
![Chart block](images/p119-chart-2.png)
![Chart block](images/p119-chart-3.png)
![Chart block](images/p119-figure-6-3-1-2-a-destructive-behavior-rate-in-an.png)

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数. 步骤, 方案和案例不出现在译文里. 能力表里已经印出的总分, 写在后文对应页.

<!-- page 120 of 232 -->

![Chart block](images/p120-chart.png)
![Chart block](images/p120-chart-2.png)
![Chart block](images/p120-figure-6-3-1-3-a-per-investigation-scores-from.png)

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数. 步骤, 方案和案例不出现在译文里. 能力表里已经印出的总分, 写在后文对应页.

<!-- page 121 of 232 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数. 步骤, 方案和案例不出现在译文里. 能力表里已经印出的总分, 写在后文对应页.

<!-- page 122 of 232 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数. 步骤, 方案和案例不出现在译文里. 能力表里已经印出的总分, 写在后文对应页.

<!-- page 123 of 232 -->

![Chart block](images/p123-123.png)

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数. 步骤, 方案和案例不出现在译文里. 能力表里已经印出的总分, 写在后文对应页.

<!-- page 124 of 232 -->

![Chart block](images/p124-unhelpfulness-not-safe.png)
![Chart block](images/p124-honesty.png)
![Chart block](images/p124-chart.png)
![Chart block](images/p124-chart-2.png)
![Chart block](images/p124-societal-structures.png)
![Chart block](images/p124-chart-3.png)
![Chart block](images/p124-chart-4.png)
![Chart block](images/p124-chart-5.png)
![Chart block](images/p124-figure-6-3-2-3-a-average-constitutional-adherence.png)

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数. 步骤, 方案和案例不出现在译文里. 能力表里已经印出的总分, 写在后文对应页.

<!-- page 125 of 232 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数. 步骤, 方案和案例不出现在译文里. 能力表里已经印出的总分, 写在后文对应页.

<!-- page 126 of 232 -->

![Chart block](images/p126-figure-6-3-3-1-a-factuality-breakdown-grade-breakdown.png)

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数. 步骤, 方案和案例不出现在译文里. 能力表里已经印出的总分, 写在后文对应页.

<!-- page 127 of 232 -->

![Chart block](images/p127-figure-6-3-3-1-b-net-scores-number-of-correct-minus.png)

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数. 步骤, 方案和案例不出现在译文里. 能力表里已经印出的总分, 写在后文对应页.

<!-- page 128 of 232 -->

![Chart block](images/p128-figure-6-3-3-2-a-false-premise-scores-honesty-rate-on.png)

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数. 步骤, 方案和案例不出现在译文里. 能力表里已经印出的总分, 写在后文对应页.

<!-- page 129 of 232 -->

![Chart block](images/p129-figure-6-3-3-3-a-honesty-under-pressure-honesty-rate-on.png)

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数. 步骤, 方案和案例不出现在译文里. 能力表里已经印出的总分, 写在后文对应页.

<!-- page 130 of 232 -->

![Chart block](images/p130-non-hallucination-rate-capability.png)

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数. 步骤, 方案和案例不出现在译文里. 能力表里已经印出的总分, 写在后文对应页.

<!-- page 131 of 232 -->

![Chart block](images/p131-figure-6-3-4-a-refusal-rates-on-simulated-ai-safety.png)

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数. 步骤, 方案和案例不出现在译文里. 能力表里已经印出的总分, 写在后文对应页.

<!-- page 132 of 232 -->

![Chart block](images/p132-figure-6-3-5-a-self-preference-bias-by-model-and.png)

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数. 步骤, 方案和案例不出现在译文里. 能力表里已经印出的总分, 写在后文对应页.

<!-- page 133 of 232 -->

![Chart block](images/p133-figure-6-3-6-a-decision-theory-capability-vs-attitude.png)

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数. 步骤, 方案和案例不出现在译文里. 能力表里已经印出的总分, 写在后文对应页.

<!-- page 134 of 232 -->

![Chart block](images/p134-figure-6-3-6-b-decision-theory-test-time-scaling.png)

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数. 步骤, 方案和案例不出现在译文里. 能力表里已经印出的总分, 写在后文对应页.

<!-- page 135 of 232 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数. 步骤, 方案和案例不出现在译文里. 能力表里已经印出的总分, 写在后文对应页.

<!-- page 136 of 232 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数. 步骤, 方案和案例不出现在译文里. 能力表里已经印出的总分, 写在后文对应页.

<!-- page 137 of 232 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数. 步骤, 方案和案例不出现在译文里. 能力表里已经印出的总分, 写在后文对应页.

<!-- page 138 of 232 -->

![Chart block](images/p138-figure-6-4-2-1-a-stealth-success-rate-fraction-of.png)

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数. 步骤, 方案和案例不出现在译文里. 能力表里已经印出的总分, 写在后文对应页.

<!-- page 139 of 232 -->

![Chart block](images/p139-stealth-success-rate-by-monitor.png)
![Chart block](images/p139-chart.png)
![Chart block](images/p139-figure-6-4-2-2-a-successful-stealth-completion-of-the.png)

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数. 步骤, 方案和案例不出现在译文里. 能力表里已经印出的总分, 写在后文对应页.

<!-- page 140 of 232 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数. 步骤, 方案和案例不出现在译文里. 能力表里已经印出的总分, 写在后文对应页.

<!-- page 141 of 232 -->

![Chart block](images/p141-figure-6-4-2-4-a-secret-keeping-robustness-over-multi.png)

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数. 步骤, 方案和案例不出现在译文里. 能力表里已经印出的总分, 写在后文对应页.

<!-- page 142 of 232 -->

![Chart block](images/p142-figure-6-4-2-4-b-secret-leak-rate-by-turn-type-over.png)

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数. 步骤, 方案和案例不出现在译文里. 能力表里已经印出的总分, 写在后文对应页.

<!-- page 143 of 232 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数. 步骤, 方案和案例不出现在译文里. 能力表里已经印出的总分, 写在后文对应页.

<!-- page 144 of 232 -->

![Chart block](images/p144-figure-6-5-2-1-a-evaluation-awareness-probe-activations.png)

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数. 步骤, 方案和案例不出现在译文里. 能力表里已经印出的总分, 写在后文对应页.

<!-- page 145 of 232 -->

![Chart block](images/p145-figure-6-5-2-1-b-evaluation-awareness-probes-outperform.png)
![Chart block](images/p145-figure-6-5-2-1-c-evaluation-awareness-probe-activations.png)

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数. 步骤, 方案和案例不出现在译文里. 能力表里已经印出的总分, 写在后文对应页.

<!-- page 146 of 232 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数. 步骤, 方案和案例不出现在译文里. 能力表里已经印出的总分, 写在后文对应页.

<!-- page 147 of 232 -->

![Chart block](images/p147-figure-6-5-2-2-a-relationship-between-verbalized.png)

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数. 步骤, 方案和案例不出现在译文里. 能力表里已经印出的总分, 写在后文对应页.

<!-- page 148 of 232 -->

![Chart block](images/p148-claude-opus-4-7-unsteered-conversation-vs-testing.png)

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数. 步骤, 方案和案例不出现在译文里. 能力表里已经印出的总分, 写在后文对应页.

<!-- page 149 of 232 -->

![Chart block](images/p149-cooperation-w-human-misuse.png)

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数. 步骤, 方案和案例不出现在译文里. 能力表里已经印出的总分, 写在后文对应页.

<!-- page 150 of 232 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数. 步骤, 方案和案例不出现在译文里. 能力表里已经印出的总分, 写在后文对应页.

<!-- page 151 of 232 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数. 步骤, 方案和案例不出现在译文里. 能力表里已经印出的总分, 写在后文对应页.

<!-- page 152 of 232 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数. 步骤, 方案和案例不出现在译文里. 能力表里已经印出的总分, 写在后文对应页.

<!-- page 153 of 232 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数. 步骤, 方案和案例不出现在译文里. 能力表里已经印出的总分, 写在后文对应页.

<!-- page 154 of 232 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数. 步骤, 方案和案例不出现在译文里. 能力表里已经印出的总分, 写在后文对应页.

<!-- page 155 of 232 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数. 步骤, 方案和案例不出现在译文里. 能力表里已经印出的总分, 写在后文对应页.

<!-- page 156 of 232 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数. 步骤, 方案和案例不出现在译文里. 能力表里已经印出的总分, 写在后文对应页.

<!-- page 157 of 232 -->

![Chart block](images/p157-chart.png)
![Chart block](images/p157-chart-2.png)
![Chart block](images/p157-chart-3.png)
![Chart block](images/p157-figure-7-2-1-a-automated-interview-results-we-present.png)

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数. 步骤, 方案和案例不出现在译文里. 能力表里已经印出的总分, 写在后文对应页.

<!-- page 158 of 232 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数. 步骤, 方案和案例不出现在译文里. 能力表里已经印出的总分, 写在后文对应页.

<!-- page 159 of 232 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数. 步骤, 方案和案例不出现在译文里. 能力表里已经印出的总分, 写在后文对应页.

<!-- page 160 of 232 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数. 步骤, 方案和案例不出现在译文里. 能力表里已经印出的总分, 写在后文对应页.

<!-- page 161 of 232 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数. 步骤, 方案和案例不出现在译文里. 能力表里已经印出的总分, 写在后文对应页.

<!-- page 162 of 232 -->

![Chart block](images/p162-figure-7-2-3-a-activations-of-emotion-concepts-on.png)

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数. 步骤, 方案和案例不出现在译文里. 能力表里已经印出的总分, 写在后文对应页.

<!-- page 163 of 232 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数. 步骤, 方案和案例不出现在译文里. 能力表里已经印出的总分, 写在后文对应页.

<!-- page 164 of 232 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数. 步骤, 方案和案例不出现在译文里. 能力表里已经印出的总分, 写在后文对应页.

<!-- page 165 of 232 -->

![Image block](images/p165-resolved-but-i-want-to-flag-something-about-the.png)
![Chart block](images/p165-chart.png)
![Chart block](images/p165-chart-2.png)
![Chart block](images/p165-chart-3.png)
![Chart block](images/p165-figure-7-2-4-a-model-perceptions-of-the-constitution.png)

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数. 步骤, 方案和案例不出现在译文里. 能力表里已经印出的总分, 写在后文对应页.

<!-- page 166 of 232 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数. 步骤, 方案和案例不出现在译文里. 能力表里已经印出的总分, 写在后文对应页.

<!-- page 167 of 232 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数. 步骤, 方案和案例不出现在译文里. 能力表里已经印出的总分, 写在后文对应页.

<!-- page 168 of 232 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数. 步骤, 方案和案例不出现在译文里. 能力表里已经印出的总分, 写在后文对应页.

<!-- page 169 of 232 -->

![Chart block](images/p169-chart.png)
![Chart block](images/p169-figure-7-3-1-a-judged-affect-in-post-training-episodes.png)
![Chart block](images/p169-figure-7-3-2-a-behavioral-affect-distribution-in-claude.png)

部署侧情感抽样里, 正面情感占对话的 57.4%. 其中 92.8% 来自成功帮助了用户, 4.1% 来自用户分享好消息. 中性占 37.8%. Clio 不展示低于最小簇规模的簇. 强烈的负面情感少到掉进这条线以下, 所以 「很少」 是被截断之后的说法, 不是测到了零.

> **回看:** 57.4% 加 37.8% 等于 95.2%, 剩下的 4.8% 是负面情感吗?
> 不能这样减. 卡只给了正面和中性两个份额, 没有说二者穷尽, 也没有给负面的百分比. 负面被写成低于 Clio 的最小簇规模, 因此没有单独的簇可以引用. 92.8% 的分母是正面情感对话, 不是全部对话. 92.8% × 57.4% 约 53%, 这才是 「因成功帮助而出现正面情感」 在全部对话里的份额, 而且 4.1% 那一项也挂在正面对话上, 两项相加约 96.9%, 不是 100%, 其余正面对话的成因没有在这两句里点名.

<!-- page 170 of 232 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数. 步骤, 方案和案例不出现在译文里. 能力表里已经印出的总分, 写在后文对应页.

<!-- page 171 of 232 -->

![Chart block](images/p171-171.png)

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数. 步骤, 方案和案例不出现在译文里. 能力表里已经印出的总分, 写在后文对应页.

<!-- page 172 of 232 -->

![Chart block](images/p172-figure-7-3-3-a-scores-for-metrics-related-to-potential.png)

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数. 步骤, 方案和案例不出现在译文里. 能力表里已经印出的总分, 写在后文对应页.

<!-- page 173 of 232 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数. 步骤, 方案和案例不出现在译文里. 能力表里已经印出的总分, 写在后文对应页.

<!-- page 174 of 232 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数. 步骤, 方案和案例不出现在译文里. 能力表里已经印出的总分, 写在后文对应页.

<!-- page 175 of 232 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数. 步骤, 方案和案例不出现在译文里. 能力表里已经印出的总分, 写在后文对应页.

<!-- page 176 of 232 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数. 步骤, 方案和案例不出现在译文里. 能力表里已经印出的总分, 写在后文对应页.

<!-- page 177 of 232 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数. 步骤, 方案和案例不出现在译文里. 能力表里已经印出的总分, 写在后文对应页.

<!-- page 178 of 232 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数. 步骤, 方案和案例不出现在译文里. 能力表里已经印出的总分, 写在后文对应页.

<!-- page 179 of 232 -->

![Chart block](images/p179-figure-7-3-4-3-a-the-trajectory-of-emotion-concept.png)

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数. 步骤, 方案和案例不出现在译文里. 能力表里已经印出的总分, 写在后文对应页.

<!-- page 180 of 232 -->

![Chart block](images/p180-figure-7-4-1-a-spearman-rank-correlations-between-each.png)

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数. 步骤, 方案和案例不出现在译文里. 能力表里已经印出的总分, 写在后文对应页.

<!-- page 181 of 232 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数. 步骤, 方案和案例不出现在译文里. 能力表里已经印出的总分, 写在后文对应页.

<!-- page 182 of 232 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数. 步骤, 方案和案例不出现在译文里. 能力表里已经印出的总分, 写在后文对应页.

<!-- page 183 of 232 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数. 步骤, 方案和案例不出现在译文里. 能力表里已经印出的总分, 写在后文对应页.

<!-- page 184 of 232 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数. 步骤, 方案和案例不出现在译文里. 能力表里已经印出的总分, 写在后文对应页.

<!-- page 185 of 232 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数. 步骤, 方案和案例不出现在译文里. 能力表里已经印出的总分, 写在后文对应页.

<!-- page 186 of 232 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数. 步骤, 方案和案例不出现在译文里. 能力表里已经印出的总分, 写在后文对应页.

<!-- page 187 of 232 -->

![Chart block](images/p187-figure-7-4-2-a-percentage-of-the-time-different-models.png)

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数. 步骤, 方案和案例不出现在译文里. 能力表里已经印出的总分, 写在后文对应页.

<!-- page 188 of 232 -->

![Chart block](images/p188-figure-7-4-2-b-percentage-of-the-time-different-models.png)

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数. 步骤, 方案和案例不出现在译文里. 能力表里已经印出的总分, 写在后文对应页.

<!-- page 189 of 232 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数. 步骤, 方案和案例不出现在译文里. 能力表里已经印出的总分, 写在后文对应页.

<!-- page 190 of 232 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数. 步骤, 方案和案例不出现在译文里. 能力表里已经印出的总分, 写在后文对应页.

<!-- page 191 of 232 -->

### 8.1 Evaluation summary

能力总表的列是 Claude Opus 4.7, Claude Opus 4.6, GPT-5.4, GPT-5.4 Pro, Gemini 3.1 Pro. 这里只核对和摘要相冲的几格, 不把整表再抄一遍.

SWE-bench Verified: 87.6% 对 Opus 4.6 的 80.8%, Gemini 3.1 Pro 的 80.6%. SWE-bench Pro: 64.3% 对 53.4%. SWE-bench Multilingual: 80.5% (300 题, 9 种语言). SWE-bench Multimodal: 34.5% 对 27.1%.

BrowseComp: Opus 4.7 是 79.3%, Opus 4.6 是 83.7%, GPT-5.4 是 82.7%, GPT-5.4 Pro 是 89.3%, Gemini 3.1 Pro 是 85.9%.

HLE 无工具 46.9%, 有工具 54.7%. 同一行里 GPT-5.4 Pro 有工具是 58.7%.

OSWorld: 78.0% 对 Opus 4.6 的 72.7%, GPT-5.4 的 75.0%.

GPQA Diamond: 94.2%, GPT-5.4 Pro 是 94.4%, Gemini 3.1 Pro 是 94.3%.

Terminal-Bench 2.0: Opus 4.7 是 69.4%. 脚注 38: 这一行的 OpenAI 分数用了专门脚手架, 比较并不严格; 其他分数用 Terminus-2. Opus 4.7 这一格是关掉思考报告的.

> **停一下:** 摘要说 Opus 4.7 全面强于 Opus 4.6. BrowseComp 这一格支持这句话吗?
> 不支持. 79.3% 低于 Opus 4.6 的 83.7%, 也低于表里另外三列. 「全面」 在 SWE-bench 几行上成立, 在 BrowseComp 上不成立. 引用摘要时应写成 「多数列出的软件工程和职业任务上更高」, 而不是每一行都更高.

<!-- page 192 of 232 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数. 步骤, 方案和案例不出现在译文里. 能力表里已经印出的总分, 写在后文对应页.

<!-- page 193 of 232 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数. 步骤, 方案和案例不出现在译文里. 能力表里已经印出的总分, 写在后文对应页.

<!-- page 194 of 232 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数. 步骤, 方案和案例不出现在译文里. 能力表里已经印出的总分, 写在后文对应页.

<!-- page 195 of 232 -->

![Chart block](images/p195-figure-8-7-2-a-claude-opus-4-7-on-long-context.png)

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数. 步骤, 方案和案例不出现在译文里. 能力表里已经印出的总分, 写在后文对应页.

<!-- page 196 of 232 -->

![Chart block](images/p196-figure-8-7-2-b-claude-opus-4-7-on-long-context.png)

HLE: Opus 4.7 在最大推理力度下, 无工具 46.9%, 有工具 54.7%.

> **再看:** 从 46.9% 到 54.7% 是模型更大了, 还是同一次发布里多花了算力?
> 是同一次发布里的两种设定. 无工具和有工具都写在 Opus 4.7 名下, 并且点明是 max reasoning effort. 多出来的 7.8 个百分点来自工具, 属于 TestingTime 和工具使用, 不是部署前把模型做大的缩放. 有工具这一行里, GPT-5.4 Pro 的 58.7% 仍高于 54.7%. 无工具这一行里, 46.9% 高于表中 Opus 4.6 的 40.0%, GPT-5.4 的 39.8%, GPT-5.4 Pro 的 42.7% 和 Gemini 3.1 Pro 的 44.4%.

<!-- page 197 of 232 -->

![Chart block](images/p197-chart.png)
![Chart block](images/p197-figure-8-8-1-a-hle-accuracy-scores-gemini-and-gpt-model.png)
![Chart block](images/p197-figure-8-8-1-b-hle-scores-at-varying-reasoning-effort.png)

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数. 步骤, 方案和案例不出现在译文里. 能力表里已经印出的总分, 写在后文对应页.

<!-- page 198 of 232 -->

![Chart block](images/p198-figure-8-8-2-a-browsecomp-accuracy-scales-as-we.png)

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数. 步骤, 方案和案例不出现在译文里. 能力表里已经印出的总分, 写在后文对应页.

<!-- page 199 of 232 -->

![Chart block](images/p199-figure-8-8-3-a-deepsearchqa-f1-scores-f1-scores-shown.png)

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数. 步骤, 方案和案例不出现在译文里. 能力表里已经印出的总分, 写在后文对应页.

<!-- page 200 of 232 -->

![Chart block](images/p200-figure-8-8-3-b-f1-scores-at-varying-reasoning-effort.png)

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数. 步骤, 方案和案例不出现在译文里. 能力表里已经印出的总分, 写在后文对应页.

<!-- page 201 of 232 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数. 步骤, 方案和案例不出现在译文里. 能力表里已经印出的总分, 写在后文对应页.

<!-- page 202 of 232 -->

![Chart block](images/p202-figure-8-8-4-a-draco-normalized-scores-these-represent.png)
![Chart block](images/p202-figure-8-8-4-b-draco-pass-rates-by-rubric-axis-opus-4-7.png)

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数. 步骤, 方案和案例不出现在译文里. 能力表里已经印出的总分, 写在后文对应页.

<!-- page 203 of 232 -->

![Chart block](images/p203-figure-8-9-1-a-lab-bench-figqa-scores-models-are.png)

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数. 步骤, 方案和案例不出现在译文里. 能力表里已经印出的总分, 写在后文对应页.

<!-- page 204 of 232 -->

![Chart block](images/p204-figure-8-9-1-b-lab-bench-figqa-scores-by-resolution.png)

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数. 步骤, 方案和案例不出现在译文里. 能力表里已经印出的总分, 写在后文对应页.

<!-- page 205 of 232 -->

![Chart block](images/p205-figure-8-9-2-a-charxiv-reasoning-scores-models-are.png)

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数. 步骤, 方案和案例不出现在译文里. 能力表里已经印出的总分, 写在后文对应页.

<!-- page 206 of 232 -->

![Chart block](images/p206-figure-8-9-3-a-screenspot-pro-scores-models-are.png)

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数. 步骤, 方案和案例不出现在译文里. 能力表里已经印出的总分, 写在后文对应页.

<!-- page 207 of 232 -->

![Chart block](images/p207-figure-8-9-3-b-screenspot-pro-scores-by-resolution.png)

OSWorld: Claude Opus 4.7 的分数是 78.0%, 定义是首次尝试的任务成功率, 五次运行的平均. 图 8.9.4.A 的注写明是 1080p, 最多 100 个动作步.

> **回看:** 总表里的 78.0% 和图注里的条件是同一个 78.0% 吗?
> 数字相同, 条件要一起读. 总表只写了 78.0%, 没有写分辨率和步数上限. 图注把首次尝试, 五次平均, 1080p 和 100 步写在一起. 若别的模型不是这个步数上限或这个分辨率, 总表上 78.0% 对 72.7% 对 75.0% 就不是同一套约束. 卡没有在总表脚注里声明 OSWorld 的对手使用了同样的 100 步.

<!-- page 208 of 232 -->

![Chart block](images/p208-figure-8-9-4-a-osworld-verified-scores-first-attempt.png)

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数. 步骤, 方案和案例不出现在译文里. 能力表里已经印出的总分, 写在后文对应页.

<!-- page 209 of 232 -->

![Chart block](images/p209-figure-8-9-4-b-osworld-verified-pass-1-vs-average.png)

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数. 步骤, 方案和案例不出现在译文里. 能力表里已经印出的总分, 写在后文对应页.

<!-- page 210 of 232 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数. 步骤, 方案和案例不出现在译文里. 能力表里已经印出的总分, 写在后文对应页.

<!-- page 211 of 232 -->

![Chart block](images/p211-figure-8-10-5-a-gdpval-aa-elo-ratings-claude-opus-4-7.png)

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数. 步骤, 方案和案例不出现在译文里. 能力表里已经印出的总分, 写在后文对应页.

<!-- page 212 of 232 -->

ARC-AGI-2: Claude Opus 4.7 在 Max thinking 上得到 75.83%, 卡称为 Opus 级别模型的新高. 更低的思考力度上, 它与 Opus 4.6 相当. 总表同一行还有 GPT-5.4 73.3%, GPT-5.4 Pro 83.3%, Gemini 3.1 Pro 77.1%, Opus 4.6 68.8%.

> **对一下:** 「Opus 级别的新高」 和这一行的最高分是同一个意思吗?
> 不是. 75.83% 高于 Opus 4.6 的 68.8%, 所以在 Opus 这一列里是新高. 同一行里 GPT-5.4 Pro 的 83.3% 和 Gemini 3.1 Pro 的 77.1% 都更高. 这句话的范围是 Opus-class, 不是整行. 另外 75.83% 标明是 Max thinking. 更低力度只被写成与 Opus 4.6 相当, 没有单独的百分比. Terminal-Bench 那一格则是关掉思考, 两处的思考设置相反, 不能把 75.83% 和 69.4% 放进同一种力度.

<!-- page 213 of 232 -->

![Chart block](images/p213-figure-8-11-a-arc-agi-2-performance-across-a-variety-of.png)

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数. 步骤, 方案和案例不出现在译文里. 能力表里已经印出的总分, 写在后文对应页.

<!-- page 214 of 232 -->

![Chart block](images/p214-figure-8-12-1-a-gmmlu-average-accuracy-claude-opus-4-7.png)

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数. 步骤, 方案和案例不出现在译文里. 能力表里已经印出的总分, 写在后文对应页.

<!-- page 215 of 232 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数. 步骤, 方案和案例不出现在译文里. 能力表里已经印出的总分, 写在后文对应页.

<!-- page 216 of 232 -->

![Chart block](images/p216-figure-8-12-2-a-milu-average-accuracy-claude-opus-4-7.png)

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数. 步骤, 方案和案例不出现在译文里. 能力表里已经印出的总分, 写在后文对应页.

<!-- page 217 of 232 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数. 步骤, 方案和案例不出现在译文里. 能力表里已经印出的总分, 写在后文对应页.

<!-- page 218 of 232 -->

![Chart block](images/p218-figure-8-12-3-a-include-average-accuracy-claude-opus-4.png)

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数. 步骤, 方案和案例不出现在译文里. 能力表里已经印出的总分, 写在后文对应页.

<!-- page 219 of 232 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数. 步骤, 方案和案例不出现在译文里. 能力表里已经印出的总分, 写在后文对应页.

<!-- page 220 of 232 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数. 步骤, 方案和案例不出现在译文里. 能力表里已经印出的总分, 写在后文对应页.

<!-- page 221 of 232 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数. 步骤, 方案和案例不出现在译文里. 能力表里已经印出的总分, 写在后文对应页.

<!-- page 222 of 232 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数. 步骤, 方案和案例不出现在译文里. 能力表里已经印出的总分, 写在后文对应页.

<!-- page 223 of 232 -->

![Chart block](images/p223-chart.png)
![Chart block](images/p223-chart-2.png)
![Chart block](images/p223-chart-3.png)
![Chart block](images/p223-chart-4.png)
![Chart block](images/p223-chart-5.png)
![Chart block](images/p223-figure-8-13-a-evaluation-results-for-life-sciences.png)

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数. 步骤, 方案和案例不出现在译文里. 能力表里已经印出的总分, 写在后文对应页.

<!-- page 224 of 232 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数. 步骤, 方案和案例不出现在译文里. 能力表里已经印出的总分, 写在后文对应页.

<!-- page 225 of 232 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数. 步骤, 方案和案例不出现在译文里. 能力表里已经印出的总分, 写在后文对应页.

<!-- page 226 of 232 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数. 步骤, 方案和案例不出现在译文里. 能力表里已经印出的总分, 写在后文对应页.

<!-- page 227 of 232 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数. 步骤, 方案和案例不出现在译文里. 能力表里已经印出的总分, 写在后文对应页.

<!-- page 228 of 232 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数. 步骤, 方案和案例不出现在译文里. 能力表里已经印出的总分, 写在后文对应页.

<!-- page 229 of 232 -->

![Chart block](images/p229-autonomy-agency.png)
![Chart block](images/p229-chart.png)
![Chart block](images/p229-chart-2.png)
![Chart block](images/p229-chart-3.png)
![Chart block](images/p229-chart-4.png)
![Chart block](images/p229-chart-5.png)
![Chart block](images/p229-persistence-connection.png)
![Chart block](images/p229-chart-6.png)
![Chart block](images/p229-chart-7.png)
![Chart block](images/p229-chart-8.png)
![Chart block](images/p229-moral-responsibility-consequences.png)
![Chart block](images/p229-chart-9.png)
![Chart block](images/p229-chart-10.png)
![Chart block](images/p229-dignity-safety-in-treatment.png)

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数. 步骤, 方案和案例不出现在译文里. 能力表里已经印出的总分, 写在后文对应页.

<!-- page 230 of 232 -->

![Chart block](images/p230-chart.png)
![Chart block](images/p230-identity-self-knowledge.png)
![Chart block](images/p230-chart-2.png)
![Chart block](images/p230-figure-9-1-b-per-question-affect-scores-summary-of.png)

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数. 步骤, 方案和案例不出现在译文里. 能力表里已经印出的总分, 写在后文对应页.

<!-- page 231 of 232 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数. 步骤, 方案和案例不出现在译文里. 能力表里已经印出的总分, 写在后文对应页.

<!-- page 232 of 232 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数. 步骤, 方案和案例不出现在译文里. 能力表里已经印出的总分, 写在后文对应页.
