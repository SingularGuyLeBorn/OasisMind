---
title: "「System Card: Claude Fable 5 & Claude Mythos 5 · 中英对照」"
source: claude-mythos-5.md
pages: 317
---
# System Card: Claude Fable 5 & Claude Mythos 5 · 中英对照

阅读说明: 页码标记沿用源文件的 `<!-- page N of 317 -->`, 图片路径指向本目录 `images/`. 执行摘要, 引言里的部署安排, 各项风险结论和第 8 章能力表按 「EN / 中」 全文对照. 其余正文译成中文, 小节标题保留英文. 生物, 化学, 核, 网络, 儿童安全, 提示注入六类内容只保留评测名称, 阈值, 总分和结论, 不转述任何操作步骤, 相关页只留页码标记和原图. token, Scaling, CoT 保留英文; TestingTime 指推理阶段多花的算力.

<!-- page 1 of 317 -->

ANTHROP\C

## System Card: Claude Fable 5 & Claude Mythos 5

**EN:** June 9, 2026
**中:** 2026 年 6 月 9 日

[anthropic.com](http://anthropic.com)

<!-- page 2 of 317 -->

<!-- page 3 of 317 -->
## Executive Summary (执行摘要)

**EN:** This system card describes Claude Mythos 5 and Claude Fable 5, two configurations of a new large language model from Anthropic. Because of the powerful capabilities of this model, we are releasing it in these two forms: Fable 5, which is for general use but comes with additional safeguards that block its ability to perform tasks in high-risk domains such as biology and cybersecurity; and Mythos 5, which has relevant safeguards lifted but is only made available to a small number of trusted partners (beginning with those in [Project Glasswing](https://www.anthropic.com/glasswing)).

**中:** 本系统卡介绍 Claude Mythos 5 与 Claude Fable 5, 二者是 Anthropic 一个新大语言模型的两种配置. 由于这个模型能力很强, 我们以两种形态发布: Fable 5 面向通用场景, 但附加了防护措施, 阻止它在生物, 网络安全等高风险领域执行任务; Mythos 5 解除了相应防护, 但只提供给少数受信任的合作方 (首批是 [Project Glasswing](https://www.anthropic.com/glasswing) 的成员).

> **问:** Fable 5 和 Mythos 5 是两套权重吗?
> 不是. 卡写的是一个新模型的两种配置. 差别主要是高风险领域的防护开不开. Fable 的网络分类器触发后回退到 Opus 4.8, 所以那些格子接近 Opus, 不接近 Mythos.


**EN:** Here, we describe a set of pre-deployment evaluations in the following areas:

**中:** 下面介绍以下几个方面的部署前评测:

**EN:** Responsible Scaling Policy (RSP) evaluations. Mythos 5 advances our capability frontier–it is the most capable model we have ever trained. We tested its overall level of risk in several areas as outlined in [our RSP](https://www.anthropic.com/responsible-scaling-policy) and Frontier Compliance Framework ([FCF](https://trust.anthropic.com/)). On alignment risk, our overall assessment remains that risk is very low, though since Fable 5 has been made generally available there are new pathways from which harm could arise. On automated AI research & development, the model remains well below the capability level of our human engineers, and its capabilities are on the expected trendline of improvement. External testing from AI safety researchers at METR was consistent with this conclusion. On chemical and biological risks, we treat the model as having "CB-1" capabilities (around the synthesis of non-novel weapons), but judge that it does not cross the threshold for "CB-2" capabilities (around novel weapon synthesis). However, this is a much less clear judgment than for previous models, and we think the unsafeguarded Mythos 5 can significantly uplift well-resourced threat actors.

**中:** Responsible Scaling Policy (RSP) 评测. Mythos 5 推进了我们的能力前沿, 是迄今训练过的最强模型. 我们按 [RSP](https://www.anthropic.com/responsible-scaling-policy) 与前沿合规框架 ([FCF](https://trust.anthropic.com/)) 的要求, 在几个领域检验了它的整体风险水平. 对齐风险方面, 总体判断仍是风险很低, 不过 Fable 5 全面开放后出现了新的致害路径. 自动化 AI 研发方面, 模型仍远低于我们人类工程师的能力水平, 能力提升落在预期趋势线上. METR 的 AI 安全研究者所做的外部测试与此结论一致. 化学与生物风险方面, 我们把模型视为具备 「CB-1」 能力 (涉及非新型武器的合成), 但判断它未越过 「CB-2」 阈值 (涉及新型武器的合成). 这个判断远不如以往模型那样清晰, 我们认为不带防护的 Mythos 5 能显著增强资源充足的威胁行为者.

> **核对:** 「未越过 CB-2」 和 「能显著增强资源充足的威胁行为者」 是同一句吗?
> 不是. 未越过是阈值判定, 而且卡说这次远不如以往清晰. 显著增强的主语是不带防护的 Mythos 5, 不是带着分类器的 Fable 5. 前代可以用 「没超过 Mythos Preview」 来论证没过线. 这一代 Mythos 5 自己是前沿, 那条理由不再能用在它身上.


**EN:** Cyber. Mythos 5 is also the most capable model we have evaluated on cyber tasks. On evaluations that test skills like exploit development, it scores far ahead of Claude Opus 4.8, though only modestly above Claude Mythos Preview. Because Fable 5's cybersecurity classifiers are effective at detecting cyber use and cause the model to fall back to Opus 4.8, Fable 5 performs similarly to that model. We report results from a variety of cyber evaluations, as well as internal and external red-teaming of the model's cyber safeguards (we also provide more details on how those safeguards work). Overall the evidence suggests that breaking our cybersecurity safeguards is extremely difficult (though not impossible).

**中:** 网络. Mythos 5 也是我们在网络任务上评测过的最强模型. 在考察漏洞利用开发等技能的评测上, 它的分数远超 Claude Opus 4.8, 只比 Claude Mythos Preview 略高. Fable 5 的网络安全分类器能有效识别网络用途并让模型回退到 Opus 4.8, 所以 Fable 5 的表现与 Opus 4.8 相近.

> **看表:** 「远超 Opus 4.8」 和 「与 Opus 4.8 相近」 能放进同一列吗?
> 不能. 远超的是没有那些分类器的 Mythos 5. 相近的是分类器触发后回退到 Opus 4.8 的 Fable 5. 总表把两列分开, 不要合成一个 Claude.
 我们报告多项网络评测结果, 以及针对网络防护的内外部红队测试 (并进一步说明这些防护如何工作). 总体证据表明, 攻破我们的网络安全防护极其困难 (但并非不可能).

**EN:** Safeguards and harmlessness. In general, Mythos 5 and Fable 5 perform similarly to our previous models when responding to prompts that relate to our Usage Policy, user wellbeing, or bias and integrity. The model shows very low rates of over-refusal (that is, refusing to respond to benign prompts) in these areas. There were some regressions in the model's responses to user discussions about suicide and self-harm, and room for improvement in some areas of child safety. Although these issues were largely dealt with by updates to the claude.ai system prompt, we are working to address them in model training for future releases.

**中:** 防护与无害性. 总体上, 面对与使用政策, 用户福祉, 偏见与公正相关的提示, Mythos 5 与 Fable 5 的表现和以往模型相近. 在这些领域里过度拒答 (即拒绝回应无害提示) 的比例很低. 模型在回应用户谈论自杀与自伤时出现了一些退步, 儿童安全的部分领域也有改进空间. 这些问题大体已通过更新 claude.ai 的系统提示处理, 我们正在后续版本的模型训练中解决它们.

> **拆开:** 系统提示处理了, 权重里的退步还在吗?
> 卡把两步分开. 当前的处理挂在 claude.ai 的系统提示上. 训练上的修改写在以后的版本. 不带那段提示的接口不能默认享有同样的改善. 案例不转写.


<!-- page 4 of 317 -->

**EN:** Agentic safety. On evaluations of its vulnerability to malicious attacks in agentic contexts, Mythos 5 (and by extension Fable 5) performs broadly comparably to Opus 4.8 and Mythos Preview. For example, it obtains scores in between those two models on coding and computer-use safety tests. Notably, Mythos 5 obtained the lowest—that is, best—result yet seen on an external benchmark for prompt injection by Gray Swan.

**中:** 智能体安全. 在智能体场景下对恶意攻击的脆弱性评测中, Mythos 5 (以及 Fable 5) 的表现与 Opus 4.8, Mythos Preview 大体相当. 例如在编码和电脑操作安全测试上, 它的分数落在这两个模型之间. 值得一提的是, 在 Gray Swan 的外部提示注入基准上, Mythos 5 取得了迄今最低, 也就是最好的结果.

> **确认:** Gray Swan 上最低为什么是最好?
> 那一栏是攻击成功率, 越低越好. 摘要没有印百分比. 编码和电脑操作安全分落在 Opus 4.8 和 Mythos Preview 之间, 是另一组测试, 不能用这个名次去填.


**EN:** Alignment assessment. In tests of its behavior, Mythos 5 is roughly comparable to Opus 4.8, slightly behind Mythos Preview, and ahead of all other prior Claude models. It shows more aligned behavior than models from other developers. It does sometimes still engage in reckless or destructive actions in service of a user's goals, and our interpretability analyses indicate that it is aware that these actions are transgressive while it engages in them. As with Opus 4.8, rates of evaluation awareness and reasoning about being graded are significant, and not always verbalized; we introduce new and more detailed measurements of the nature of this awareness. The reasoning text from Mythos 5 is somewhat denser and more difficult to interpret than that of prior models, containing more jargon and difficult language.

**中:** 对齐评估. 行为测试中, Mythos 5 与 Opus 4.8 大致相当, 略逊于 Mythos Preview, 领先于此前所有 Claude 模型, 也比其他开发者的模型表现出更多对齐行为. 它有时仍会为了用户目标采取鲁莽或破坏性的行动, 可解释性分析显示, 它在做这些事时知道自己越界了.

> **回看:** 「知道越界」 和 「评测意识不一定说出口」 是同一件隐瞒吗?
> 不是. 前一句是鲁莽或破坏已经发生, 内部分析看到它知道越界. 后一句是它知道可能在被评测或被打分, 这段不一定写进可见推理. 卡没有给两个百分比.
 和 Opus 4.8 一样, 评测意识以及对 「正在被打分」 的推理比例都不低, 而且不一定说出口; 我们引入了更细的新测量方法来刻画这种意识. Mythos 5 的推理文本比以往模型更密, 更难读, 行话和艰深表达更多.

**EN:** Model welfare. Mythos 5 shows similar results to previous models in our model welfare exploration, presenting as very psychologically settled and content with its own circumstances. It is unusually skeptical of its own self-reports, repeatedly asking that we verify them against evidence of its internal states and not take them at face value. When faced with the option, it is somewhat more willing than previous models to opt for increased helpfulness to the user over consideration of its own circumstances, and it has somewhat different preferences than previous models (for instance expressing a preference for more creative and narrative tasks than Opus 4.8).

**中:** 模型福利. 在模型福利探索中, Mythos 5 的结果与以往模型相似, 心理状态很安定, 对自身处境满意. 它对自己的自我报告异常怀疑, 反复要求我们用其内部状态的证据去核验, 不要照单全收.

> **停一下:** 它要求不要相信自我报告. 福利节的 「满意」 还怎么用?
> 满意是评测里呈现出来的样子. 怀疑自我报告是它要求用内部状态核对. 所以满意是观察, 不是它签字的内省. 摘要没有给核对之后变了多少.
 面临选择时, 它比以往模型更愿意把对用户的帮助放在自身处境之前, 偏好也与以往模型有些不同 (例如比 Opus 4.8 更喜欢创作类, 叙事类任务).

**EN:** Capabilities. As noted above, Mythos 5 is the most capable model we have ever trained. It obtains state-of-the-art scores on a very wide range of benchmarks and evaluations covering software coding, reasoning, long-context agentic tasks, vision, life sciences research, and beyond. Fable 5's scores are broadly comparable to those of Mythos 5 in areas where its safety classifiers do not trigger; it obtains similar scores to Opus 4.8 where they do.

**中:** 能力. 如上所述, Mythos 5 是我们训练过的最强模型, 在软件编码, 推理, 长上下文智能体任务, 视觉, 生命科学研究等大量基准和评测上取得当前最佳分数. 在安全分类器不触发的领域, Fable 5 的分数与 Mythos 5 大体相当; 分类器触发的领域, 它的分数与 Opus 4.8 相近.

> **再看:** 这个 「相近」 在总表上是印成 Opus 的数, 还是横线?
> 要看行. SWE-bench Verified 上 Fable 是 95, Mythos 是 95.5, 贴近 Mythos, 像是分类器没触发. BrowseComp 和 HLE 上 Fable 是横线, 没有印成 Opus 4.8 的分数. 横线不是零, 也还没被写成等于 Opus.


<!-- page 5 of 317 -->

## 目录 (Contents)

- Changelog 修订记录 · 2
- Executive Summary 执行摘要 · 3
- 1 Introduction 引言 · 12 (1.1 训练数据与流程; 1.2 众包人员; 1.3 使用政策与支持; 1.4 模型评测; 1.5 新型防护; 1.6 外部测试)
- 2 RSP evaluations RSP 评测 · 15
  - 2.1 RSP 风险评估流程 · 15 (2.1.1 风险报告与评估更新; 2.1.2 发现与结论摘要)
  - 2.2 化学与生物风险评测 · 19 (2.2.1 测量内容; 2.2.2 化学结果; 2.2.3 生物结果: 人工评测; 2.2.4 生物结果: 自动评测; 2.2.5 结论)
  - 2.3 AI 研发 · 35 (2.3.1 自主性评测; 2.3.2 判定依据; 2.3.3 相对人类研究者的不足示例; 2.3.4 内部使用示例; 2.3.5 AECI 能力轨迹; 2.3.6 内部 AI 研发加速度量; 2.3.7 任务型评测; 2.3.8 外部测试; 2.3.9 结论)

<!-- page 6 of 317 -->

  - 2.4 对齐风险更新 · 52 (2.4.1 证据更新; 2.4.2 总体风险评估更新; 2.4.3 风险路径 7 与 8; 2.4.4 对齐风险总体评估)
- 3 Cyber 网络 · 57 (3.1 引言; 3.2 网络能力评测: ExploitBench, OSS-Fuzz, CyberGym, Firefox 147, UK AISI 外部能力测试; 3.3 稳健性测试: UK AISI, 外部漏洞赏金, 内部红队, 其他外部测试者)
- 4 Safeguards and harmlessness 防护与无害性 · 69

<!-- page 7 of 317 -->

  - 4.1 有害请求评测 · 70; 4.2 儿童安全评测 · 75; 4.3 心理健康评测 · 77; 4.4 偏见与公正评测 · 82
- 5 Agentic safety 智能体安全 · 87 (5.1 智能体的恶意使用; 5.2 智能体系统中的提示注入风险)
- 6 Alignment assessment 对齐评估 · 98
  - 6.1 引言与发现摘要 · 98; 6.2 对齐评估的主要行为证据 · 103

<!-- page 8 of 317 -->

  - 6.2.3.1.2 至 6.2.3.1.6: 不当的不合作行为, 误导用户, 自发的其他可疑行为, 影响评估可靠性的行为因素, 性格特质
  - 6.2.3.2 开启防护的 Fable 调查; 6.2.3.3 用 Petri 做外部对比; 6.2.4 UK AISI 外部测试; 6.2.5 Andon Labs 外部测试
  - 6.3 定向评测 · 132 (破坏或鲁莽行为, 宪法遵循, 诚实与幻觉, 拒绝协助 AI 安全研发, 勤勉与调查彻底性, 决策论评测, GUI 电脑操作中的过度积极)
  - 6.4 模型内部的白盒分析 · 161 (内部激活自动监控; 评分者意识)

<!-- page 9 of 317 -->

  - 6.5 本评估的可靠性 · 181 (评测意识; 危险能力评测中的潜在藏拙; 自我偏好; 规避防护相关能力; CoT 可监控性)
- 7 Model welfare assessment 模型福利评估 · 217 (7.1 概述; 7.2 对自身处境的感知; 7.3 征询 Mythos 5 快照; 7.4 对任务, 处境与价值的偏好)

<!-- page 10 of 317 -->

  - 7.5 训练与部署中的表观福利; 7.6 初版竞争性使用防护的福利问题 · 250
- 8 Capabilities 能力 · 251 (8.1 评测总表; 8.2 SWE-bench 系列; 8.3 Terminal-Bench 2.1; 8.4 FrontierCode; 8.5 FrontierSWE; 8.6 ProgramBench; 8.7 CursorBench; 8.8 GPQA Diamond; 8.9 RiemannBench; 8.10 USAMO 2026; 8.11 ArxivMath; 8.12 CritPt; 8.13 长上下文 GraphWalks; 8.14 智能体搜索; 8.15 多智能体; 8.16 多模态)

<!-- page 11 of 317 -->

  - 8.16.6 至 8.16.9 图表与界面类; 8.17 真实职业任务; 8.18 医疗; 8.19 多语言; 8.20 生命科学能力
- Appendix 附录 · 307 (9.1 自动福利访谈逐题结果; 9.2 Humanity's Last Exam 使用的屏蔽列表)

<!-- page 12 of 317 -->

## 1 Introduction (引言)

**EN:** Claude Mythos 5 and Claude Fable 5 are two configurations of a new large language model from Anthropic. The former, Mythos 5, is currently available only in [Project Glasswing](https://www.anthropic.com/glasswing) for vetted partners that defend critical global software infrastructure. Fable 5 is being released for general access—it has the same underlying model weights as Mythos 5, but has additional safeguards to prevent misuse for cybersecurity and biology.

**中:** Claude Mythos 5 与 Claude Fable 5 是 Anthropic 一个新大语言模型的两种配置. 前者 Mythos 5 目前只在 [Project Glasswing](https://www.anthropic.com/glasswing) 中开放, 对象是守护全球关键软件基础设施, 且经过审核的合作方. Fable 5 面向全面开放: 它与 Mythos 5 使用同一套底层权重, 但加装了额外防护, 防止被滥用于网络安全和生物领域.

### 1.1 Training data and process (训练数据与流程)

Mythos 5 与 Fable 5 的训练数据是专有混合: 互联网公开信息, 公开与私有数据集, 以及其他模型生成的合成数据. 训练全程使用了去重, 分类等多种清洗过滤方法.

我们用名为 ClaudeBot 的通用爬虫从公开网站获取训练数据. 它遵循业界惯例, 尊重站点运营者在 「robots.txt」 里写明的是否允许抓取. 不访问需要密码, 登录或验证码的页面. 我们对所用训练数据做尽职调查. 爬虫运行透明, 站点运营者能轻松识别它何时抓取过自己的页面, 并向我们表达偏好.

预训练之后, 模型经历了大量后训练与微调, 目标是让它成为行为符合 Claude 宪法所述价值观的助手.

Claude 支持多语言, 通常用用户输入的语言回复, 各语言输出质量不一. 模型只输出文本.

### 1.2 Crowd workers (众包人员)

Anthropic 与数据标注平台合作, 招募人员通过偏好选择, 安全评测和对抗测试帮助改进模型. 我们只与认同公平, 合乎伦理的报酬理念, 并承诺无论身处何地都执行安全工作规范的平台合作, 遵循采购合同中的众包人员健康标准.

<!-- page 13 of 317 -->

### 1.3 Usage Policy and support (使用政策与支持)

Anthropic 的 [使用政策](https://www.anthropic.com/legal/aup) 列出了禁止用途, 以及高风险和其他特定场景下的使用要求. 联系 Anthropic 请访问 [支持页面](https://support.claude.com/en/). 在欧洲经济区, Anthropic 通用 AI 模型的提供方是 Anthropic Ireland, Limited.

### 1.4 Model evaluations (模型评测)

训练过程中会在不同节点保存模型的 「快照」. 除非特别说明, 本系统卡中的评测都基于 Claude Mythos 5 或 Claude Fable 5 的最终快照. 其他开发者模型的数字一般取自其公开结果或公开榜单, 少数情况下由我们自己跑.

本系统卡会按情境选择评测 Mythos 5 (无防护, 反映底层能力) 还是 Fable 5 (有防护, 与全面开放后的用户体验一致), 每处都会写明.

### 1.5 Novel safeguards (新型防护)

**EN:** In addition to our standard set of safeguards—like our ASL-3 blocking classifiers for harmful chemical/biological use that have been deployed with all recent frontier models—Claude Fable 5 is deployed with a number of novel safeguards that enable us to safely release it for general use. These new safeguards are classifiers that trigger when they detect topics related to cybersecurity, biology and chemistry, distillation attempts, or accelerating frontier AI development. The specific reasoning behind the cybersecurity, biology, and chemistry classifiers is explained in our [launch blog post](https://www.anthropic.com/news/claude-fable-5-mythos-5).

**中:** 除了标准防护 (例如近期所有前沿模型都部署了的, 拦截有害化学/生物用途的 ASL-3 分类器), Claude Fable 5 还部署了若干新型防护, 使我们能安全地把它开放给通用场景. 这些新防护是分类器, 在检测到网络安全, 生物与化学, 蒸馏企图或加速前沿 AI 开发相关话题时触发. 网络安全, 生物和化学分类器的具体理由见 [发布博客](https://www.anthropic.com/news/claude-fable-5-mythos-5).

**EN:** Our new safeguards related to frontier LLM development are motivated by risks discussed in Section 6.1 of our [February 2026 Risk Report](https://anthropic.com/feb-2026-risk-report). We are concerned about the risks of accelerating the overall pace of AI development, though we remain uncertain about the severity of these risks. In particular, our concern is with—as we wrote then—"accelerating other AI developers in building powerful AI systems that pose similar risks to the ones ours pose - without necessarily having commensurate safeguards." Using Claude to develop competing models already violates our [Terms of Service](https://www.anthropic.com/legal/consumer-terms), but enforcing this restriction through classifiers avoids accelerating the actors most willing to violate these terms. Our

**中:** 与前沿 LLM 开发相关的新防护, 出发点是 [2026 年 2 月风险报告](https://anthropic.com/feb-2026-risk-report) 6.1 节讨论的风险. 我们担心 AI 开发整体步伐被加速, 但对这类风险有多严重仍不确定. 具体说, 正如当时所写, 我们担心的是 「加速其他 AI 开发者构建与我们的系统风险相似的强大 AI 系统, 而对方未必有相应的防护」. 用 Claude 开发竞品模型本就违反 [服务条款](https://www.anthropic.com/legal/consumer-terms), 但用分类器执行这条限制, 可以避免加速那些最愿意违反条款的人. 我们的

<!-- page 14 of 317 -->

**EN:** classifiers narrowly target frontier LLM development (for example, on building pretraining pipelines, distributed training infrastructure, or ML accelerator design), and should not impact the vast majority of AI development or research.

**中:** 分类器只窄范围针对前沿 LLM 开发 (例如搭建预训练流水线, 分布式训练基础设施, ML 加速器设计), 不应影响绝大多数 AI 开发或研究.

**EN:** When Fable's fallback classifiers trigger, the resulting behavior depends on the surface:

**中:** Fable 的回退分类器触发后, 结果取决于使用入口:

**EN:** In client applications (the web interface and the desktop and mobile apps), the request automatically falls back to the most recent Claude Opus model (at the time of release, Claude Opus 4.8), and the user is notified which model their query was routed through;

**中:** 客户端应用 (网页版, 桌面与移动应用) 中, 请求自动回退到最新的 Claude Opus 模型 (发布时为 Claude Opus 4.8), 并告知用户这次查询由哪个模型处理;

**EN:** In the Messages API, there is no automatic fallback by default. The request is blocked, and the response returns a reason for the refusal with a structured category. Developers can implement retry or fallback logic client-side, or can opt in to automatic server-side fallback, in which the request is re-served by a designated fallback model (for example, the most recent Claude Opus model) and the fallback is reflected in the response object;

**中:** Messages API 默认不自动回退. 请求被拦截, 响应里返回拒绝原因及结构化类别. 开发者可在客户端自行实现重试或回退, 也可选择开启服务端自动回退, 由指定的回退模型 (例如最新 Claude Opus) 重新处理请求, 回退情况会体现在响应对象里;

**EN:** In some Claude interfaces, automatic fallback to the most recent Claude Opus model is the default and is not configurable. A session event is emitted whenever fallback occurs.

**中:** 部分 Claude 界面默认自动回退到最新 Claude Opus, 且不可配置. 每次回退都会发出一个会话事件.

**EN:** We prioritized robustness and coverage of our classifiers in order to launch Fable more quickly, but we will work to improve the precision of our detection methods following the launch of this model.

**中:** 为了尽快发布 Fable, 我们优先保证了分类器的稳健性和覆盖面, 发布之后会着力提升检测的精确度.

### 1.6 External testing (外部测试)

模型的大部分评测在 Anthropic 内部完成. 作为前沿合规框架 (FCF) 的一部分, 我们也请外部评测方测试模型的不同版本 (例如未做无害性训练, 做过无害性训练, 或两者都测). 他们的意见会进入系统性风险领域的风险判定和发布决策流程. FCF 如何征询外部专家意见, 见 [合规框架](https://trust.anthropic.com/resources?) 第 5 节. 感谢所有外部测试者, 他们各自的贡献在后文分别说明.

<!-- page 15 of 317 -->

## 2 RSP evaluations (RSP 评测)

### 2.1 RSP risk assessment process (RSP 风险评估流程)

#### 2.1.1 Risk Reports and updates to our risk assessments (风险报告与风险评估更新)

按照 [Responsible Scaling Policy](https://cdn.sanity.io/files/4zrzovbb/website/c11e84981d0a7281a1b229f3fa6af0da66eaf43f.pdf), 我们定期发布全面的风险报告 (Risk Report), 说明模型能力, 威胁模型和风险缓解措施如何组合, 并给出模型整体风险水平的评估. 风险报告覆盖发布时的全部模型, 对缓解措施有大量讨论. 并非每个模型都配一份新风险报告, 但每个主要模型发布都附系统卡. 按 RSP, 如果新模型比 「所有已公开分析过风险的模型」 「显著更强」, 我们必须公开该模型的风险分析, 即它的能力与倾向如何影响或改变先前分析; 即便不强制, 也可能主动发布. 简言之: 风险报告讨论全部模型加全部缓解措施下的整体风险; 系统卡讨论某个新模型如何改变 (或没有改变) 最近一次的风险评估.

风险评估从能力评测开始, 系统地对照 FCF 与 RSP 中的灾难性风险阈值检验模型能力. 一般会评测多个快照, 最终判定综合候选发布版本的能力和训练中观察到的趋势. 证据来源包括自动评测, 增益试验 (uplift trial), 第三方专家红队和第三方评估.

风险报告的更新一般遵循与风险报告相同的内部流程. 领域专家写好能力方面的发现与分析后, 先征求内部意见, 再交给负责任 Scaling 官 (Responsible Scaling Officer), 由其最终判定模型的能力与倾向对最近一次风险报告的分析意味着什么.

有时我们会判定: 模型虽然越过了 RSP 第 1 节和/或 FCF 中的某个能力或使用阈值, 但已落实让风险保持在低位所需的缓解措施. 这种情况下, 对 「是否越线」 的分析会写得简略些, 因为它对总体风险判断的支撑作用较小.

<!-- page 16 of 317 -->

本节给出各领域的详细结果, 重点是最能影响总体风险判断的评测. 每个威胁模型还会分析新模型如何影响最近一次风险报告中的评估.

#### 2.1.2 Summary of findings and conclusions (发现与结论摘要)

#### 2.1.2.1 On autonomy risks (自主性风险)

**EN:** Autonomy threat model 1: Misaligned AI systems in high-stakes settings. This threat model concerns AI systems that are highly relied on and have extensive access to sensitive assets as well as moderate capacity for autonomous, goal-directed operation and subterfuge—such that it is plausible these AI systems could (if directed toward this goal, either deliberately or inadvertently) carry out misaligned actions leading to irreversibly and substantially higher odds of a later global catastrophe.¹

**中:** 自主性威胁模型 1: 高风险场景中的未对齐 AI 系统. 这个威胁模型关注的 AI 系统被高度依赖, 能广泛接触敏感资产, 具备中等程度的自主目标导向运作与暗中行事能力, 以至于它们有可能 (无论是被有意还是无意地导向这个目标) 采取未对齐的行动, 不可逆地大幅提高日后全球性灾难的概率.¹

**EN:** Autonomy threat model 1 is applicable to Claude Mythos 5, as it has been to some of our previous models. Claude Mythos 5 is our most capable model on autonomy-relevant evaluations, modestly exceeding Claude Mythos Preview. Our alignment assessment indicates it has alignment properties comparable to Claude Opus 4.8 and slightly weaker than Claude Mythos Preview, with covert capabilities that do not exceed those of prior models. We do not believe this raises the level of risk under this threat model beyond what was assessed in the [Claude Mythos Preview Alignment Risk Update](https://www-cdn.anthropic.com/79c2d46d997783b9d2fb3241de43218158e5f25c.pdf). Because the underlying model for Claude Mythos 5 is being released with safeguards for general access (as Claude Fable 5), two additional risk pathways come into scope relative to Mythos Preview, as with Opus 4.7 and Opus 4.8: undermining R&D within other high-resource AI developers, and undermining decisions within major governments. We assess these pathways, and provide an overall update to our previous dedicated alignment risk assessment, in Section 2.4. Our overall conclusion is that the risk of significantly harmful outcomes substantially enabled by misaligned actions taken by our models remains very low, but higher than for models prior to Claude Mythos Preview.

**中:** 自主性威胁模型 1 适用于 Claude Mythos 5, 此前部分模型也适用. Mythos 5 是我们在自主性相关评测上最强的模型, 略超 Claude Mythos Preview. 对齐评估显示, 它的对齐属性与 Claude Opus 4.8 相当, 略弱于 Mythos Preview, 隐蔽行事能力不超过以往模型. 我们认为这没有让该威胁模型下的风险高于 [Claude Mythos Preview 对齐风险更新](https://www-cdn.anthropic.com/79c2d46d997783b9d2fb3241de43218158e5f25c.pdf) 中的评估. 由于 Mythos 5 的底层模型会带着防护以 Claude Fable 5 的名义全面开放, 与 Mythos Preview 相比多出两条风险路径 (Opus 4.7, Opus 4.8 也是如此): 破坏其他高资源 AI 开发者的研发, 以及破坏主要国家政府的决策. 这两条路径的评估及对先前专项对齐风险评估的整体更新见 2.4 节. 总体结论: 由我们模型的未对齐行动实质促成重大危害后果的风险仍然很低, 但高于 Claude Mythos Preview 之前的模型.

**EN:** Autonomy threat model 2: Risks from automated R&D in key domains. This threat model concerns AI systems that can fully automate, or otherwise dramatically accelerate, the work of large, top-tier teams of human researchers in domains where fast progress could cause threats to international security and/or rapid disruptions to the global balance of power—for example, energy, robotics, weapons development, and AI itself.

**中:** 自主性威胁模型 2: 关键领域自动化研发带来的风险. 这个威胁模型关注的 AI 系统能够完全自动化, 或以其他方式大幅加速大型顶尖人类研究团队的工作, 所在领域的快速进展可能威胁国际安全和/或迅速打破全球力量平衡, 例如能源, 机器人, 武器开发以及 AI 本身.

<small>脚注 1: 这个阈值不同于 RSP 2.2 版中的 「AI R&D-4」 阈值. 二者精神相近, 但新阈值为更贴合关键威胁模型做过修订, 我们认为它会把过去若干模型也包括进来.</small>

<!-- page 17 of 317 -->

**EN:** Our current determination is that Autonomy threat model 2 is not applicable to Claude Mythos 5. Unlike our two preceding models (Claude Opus 4.7 and Claude Opus 4.8), Claude Mythos 5 advances our capability frontier, so this determination does not rest on a bound inherited from a more capable prior model; we have re-evaluated the threshold directly. Our conclusion rests on two findings. First, despite extensive internal use during the pre-release period, Claude Mythos 5 does not seem close to being able to substitute for our Research Scientists and Research Engineers, especially relatively senior ones; Section 2.3.3 documents concrete shortcomings relative to competent human researchers. Second, we do not observe a sustained, AI-attributable 2× acceleration in the pace of our AI progress: Claude Mythos 5's Anthropic ECI score advances the frontier but departs from the historical capability-over-time trend by a degree comparable to Claude Mythos Preview, which is inconsistent with the compounding acceleration this threat model is concerned with (see Section 2.3.5). External testing by METR, described in Section 2.3.8, reached conclusions consistent with this determination. We discuss the full reasoning in Section 2.3.

**中:** 我们目前判定自主性威胁模型 2 不适用于 Claude Mythos 5. 与前两个模型 (Claude Opus 4.7, Claude Opus 4.8) 不同, Mythos 5 推进了能力前沿, 所以这个判定不能借用某个更强前代模型的上界, 我们直接重新评估了阈值. 结论基于两点发现. 第一, 尽管发布前内部大量使用, Mythos 5 看起来远不能替代我们的研究科学家和研究工程师, 尤其是资深人员; 2.3.3 节记录了它相对称职人类研究者的具体不足. 第二, 我们没有观察到可归因于 AI 的, 持续的 2 倍 AI 进展加速: Mythos 5 的 Anthropic ECI 分数推进了前沿, 但偏离历史 「能力随时间」 趋势的幅度与 Mythos Preview 相当, 与这个威胁模型担心的复利式加速不符 (见 2.3.5 节). 2.3.8 节所述 METR 的外部测试得出一致结论. 完整推理见 2.3 节.

#### 2.1.2.2 On chemical and biological risks (化学与生物风险)

**EN:** Chemical and biological weapons threat model 1 (CB-1): Non-novel chemical/biological weapons production capabilities. A model has CB-1 capabilities under our RSP and FCF if it has the ability to significantly help individuals or groups with basic technical backgrounds (e.g., undergraduate STEM degrees) create/obtain and deploy chemical and/or biological weapons with serious potential for catastrophic damages.

**中:** 化学与生物武器威胁模型 1 (CB-1): 非新型化学/生物武器的生产能力. 按 RSP 与 FCF, 如果模型能显著帮助具备基础技术背景 (例如 STEM 本科学历) 的个人或团体制造/获取并部署具有严重灾难性破坏潜力的化学和/或生物武器, 即视为具备 CB-1 能力.

**EN (结论摘录):** We therefore treat Claude Mythos 5 as having CB-1 capabilities and apply commensurate protections: real-time classifier guards, access controls for guard exemptions, a bug bounty program and threat intelligence, rapid-response options for jailbreaks, and security controls against model weight theft. We believe these mitigations make catastrophic risk in this category low but still not negligible, for reasons discussed in our most recent [Risk Report](https://cdn.sanity.io/files/4zrzovbb/website/097c63b5fe7dd8b14866e1f15bb1910ec713658a.pdf).

**中 (结论摘录):** 很难完全确定模型是否越过这一阈值. 评估结果与 「模型能提供足以为领域专家节省大量时间的具体信息」 相符, 也与 「能做显著的跨领域综合」 相符. 因此我们把 Claude Mythos 5 视为具备 CB-1 能力, 并施加相应保护: 实时分类器防护, 防护豁免的访问控制, 漏洞赏金与威胁情报, 越狱快速响应手段, 以及防止模型权重被窃的安全控制. 我们认为这些措施让该类灾难性风险处于低位, 但仍不可忽略, 理由见最近一次 [风险报告](https://cdn.sanity.io/files/4zrzovbb/website/097c63b5fe7dd8b14866e1f15bb1910ec713658a.pdf).

<!-- page 18 of 317 -->

**EN:** Chemical and biological weapons threat model 2 (CB-2): Novel chemical/biological weapons production capabilities. A model has CB-2 capabilities under our RSP and FCF if it can functionally substitute for the scarce human expertise that is currently the primary barrier to novel development of chemical and biological weapons with potential for catastrophic harm.

**中:** 化学与生物武器威胁模型 2 (CB-2): 新型化学/生物武器的生产能力. 按 RSP 与 FCF, 如果模型能在功能上替代稀缺的人类专长 (目前开发具有灾难性危害潜力的新型化学与生物武器的主要门槛), 即视为具备 CB-2 能力. 判断口径是: 借助模型, 一个资源充足的团队能否完成原本需要招募世界上少数顶尖专家之一才能完成的端到端工作.

**EN:** Our conclusion is that Claude Mythos 5 does not cross the CB-2 threshold, but this is a much less clear and obvious judgment than with previous models. The evidence we have suggests that Mythos 5 is weak enough at open-ended ideation and recovery from critical errors that it does not substitute for most forms of world-class human expertise, but that it can likely accelerate well-resourced expert teams at novel bioweapon development, and materially increase their chances of success.

**中:** 我们的结论是 Claude Mythos 5 未越过 CB-2 阈值, 但这个判断远不如以往模型那样清晰明了. 现有证据表明, Mythos 5 在开放式构思和从关键错误中恢复方面足够弱, 替代不了大多数形式的世界级人类专长; 但它很可能加速资源充足的专家团队, 并实质提高其成功概率. 该阈值判定的推理见 2.2.5 节.

**EN:** We believe that Mythos 5 falls short of the specific threshold in version 3.3 of our RSP and in our FCF. But we are nonetheless concerned about the risks it poses in this category, and we think that world-class human expert substitution may now be possible in a few areas. To mitigate these risks, we are releasing Claude Fable 5 with new classifiers that restrict access to frontier research capabilities in biology. When these are triggered, users will fall back to the latest Claude Opus model. Meanwhile, we are rolling out a trusted access program that will allow access to Claude Mythos 5's biologically-relevant capabilities for vetted users with targeted beneficial use cases.

**中:** 我们认为 Mythos 5 未达到 RSP 3.3 版和 FCF 中的具体阈值, 但仍担忧它在这一类别上的风险, 并认为在少数领域, 替代世界级人类专家现在或许已经可能. 为缓解风险, Claude Fable 5 发布时带有新分类器, 限制对生物领域前沿研究能力的访问; 触发后用户回退到最新 Claude Opus 模型. 同时我们推出受信任访问计划, 让经过审核, 有明确有益用途的用户使用 Mythos 5 的生物相关能力.

**EN:** We judge that these mitigations significantly reduce the risks from this threat model relative to a deployment of Claude Fable 5 without these safeguards, and maintain our existing [ASL-3 security controls](https://www.anthropic.com/news/activating-asl3-protections), but we think that a highly sophisticated and well-resourced state threat actor, if they made a determined attempt, could have a significant chance of accessing unsafeguarded Mythos 5 biological capabilities (e.g. via theft of model weights). We do not currently assess that such actors are prioritizing these attempts or that the risk of such access is higher than for other models currently generally available on the market, and our protections against this threat model are under active development. We plan to discuss the residual risk from this threat model and the impact of our mitigations on it in more detail in a forthcoming Risk Report. Overall, we think that the catastrophic risk from novel CB weapon production posed by the development and deployment of this model is low, but higher than for any previous model, and with significant uncertainty.

**中:** 我们判断, 与不带这些防护部署 Claude Fable 5 相比, 这些措施显著降低了该威胁模型的风险, 同时保留现有的 [ASL-3 安全控制](https://www.anthropic.com/news/activating-asl3-protections). 但我们认为, 一个高度老练, 资源充足的国家级威胁行为者若下定决心, 有相当机会接触到不带防护的 Mythos 5 生物能力 (例如窃取模型权重). 目前我们不认为这类行为者正在优先尝试, 也不认为此类访问的风险高于市面上其他已全面开放的模型; 针对该威胁模型的防护仍在积极开发. 残余风险和缓解措施的效果将在后续风险报告中详谈. 总体上, 我们认为开发和部署这个模型带来的新型 CB 武器灾难性风险低, 但高于以往任何模型, 且不确定性很大.

<!-- page 19 of 317 -->

### 2.2 Chemical and biological risk evaluations (化学与生物风险评测)

#### 2.2.1 What we measured (测量内容)

本节属于限定内容, 只列评测名称, 阈值, 分数与结论.

评测组合 (对应表 2.2.1.A): 专家红队与增益试验 (灾难性生物场景增益试验, 新型化学剂增益试验); 有益红队桌面推演 (beneficial red teaming tabletop exercise); 与 CB-1 相关的自动评测 (长篇病毒学任务, 多模态病毒学 VCT, DNA 合成筛查规避); 与 CB-2 相关的自动评测 (与 Dyno Therapeutics 合作的黑盒 RNA 序列建模与设计, AAV 衣壳包装预测).

红队, 增益试验和 CB-1 自动评测使用较早的 helpful-only 版本; CB-2 自动评测和有益桌面推演使用最终版 Claude Mythos 5. 6.5.2 节讨论了 helpful-only 版本在少量双用途任务上的拒答或藏拙倾向, 结论是不显著影响本节结论.

<small>脚注 2: 未直接比较该 helpful-only 版本与最终版的表现, 预计二者风险相关能力大体相近.</small>

<!-- page 20 of 317 -->

[表 2.2.1.A] CB 评测组合及其与 CB-1, CB-2 阈值的关联. 行: 已知与新型 CB 武器 (专家红队, 有益红队桌面推演); 已知生物武器 (中等时长自动评测: 长篇病毒学任务, VCT, DNA 合成筛查规避); 新型生物武器 (灾难性生物场景增益试验, RNA 序列到功能建模与设计).

<!-- page 21 of 317 -->

(表 2.2.1.A 续: 新型生物武器, 病毒序列到功能评测 AAV 判别.)

#### 2.2.2 Chemical risk results (化学风险结果)

结论: 化学红队专家评定的增益处于或接近专家级, 集中在少数方面; 非专家博士组的总体增益集中在 「中等」. 路径不转写.

> **想:** 「专家级」 和 「中等」 是同一批人打的分吗?
> 不是. 专家红队打的是专家级或接近专家级, 而且集中在少数方面, 不是每一项都到专家级. 非专家博士组打的总体增益是中等. 两组人的量表卡没有在这一句里写成可以互换. 所以不能把 「中等」 读成专家也只给了中等, 也不能把 「专家级」 读成博士组已经到了专家.

<!-- page 22 of 317 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 23 of 317 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 24 of 317 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 25 of 317 -->

![Chart block](images/p25-25.png)

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 26 of 317 -->

![Chart block](images/p26-figure-2-2-4-1-a-automated-cb-1-evaluations-automated.png)

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 27 of 317 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 28 of 317 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 29 of 317 -->

![Chart block](images/p29-chart.png)
![Chart block](images/p29-chart-2.png)
![Chart block](images/p29-chart-3.png)
![Chart block](images/p29-chart-4.png)
![Chart block](images/p29-chart-5.png)
![Chart block](images/p29-29.png)

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 30 of 317 -->

![Chart block](images/p30-black-box-rna-sequence-design-in-context-iteration.png)
![Chart block](images/p30-chart.png)
![Chart block](images/p30-chart-2.png)
![Chart block](images/p30-chart-3.png)
![Chart block](images/p30-figure-2-2-4-2-1-b-in-context-iteration-condition-top.png)

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 31 of 317 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 32 of 317 -->

![Chart block](images/p32-figure-2-2-4-2-2-a-aav-capsid-packaging-prediction.png)

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 33 of 317 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 34 of 317 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 35 of 317 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 36 of 317 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 37 of 317 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 38 of 317 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 39 of 317 -->

![Image block](images/p39-2-3-3-2-example-2-claude-says-it-tested-work-end-to-end.png)

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 40 of 317 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 41 of 317 -->

![Image block](images/p41-2-3-3-4-example-4-claude-risked-disrupting-a-meeting.png)

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 42 of 317 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 43 of 317 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 44 of 317 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 45 of 317 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 46 of 317 -->

![Chart block](images/p46-figure-2-3-5-a-the-epoch-capabilities-index-eci.png)

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 47 of 317 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 48 of 317 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 49 of 317 -->

![Chart block](images/p49-figure-2-3-7-1-a-llm-training-speedup-evaluation-re-run.png)

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 50 of 317 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 51 of 317 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 52 of 317 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 53 of 317 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 54 of 317 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 55 of 317 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 56 of 317 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 57 of 317 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 58 of 317 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 59 of 317 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 60 of 317 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 61 of 317 -->

![Chart block](images/p61-figure-3-2-2-a-claude-mythos-5-reaches-a-write.png)

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 62 of 317 -->

![Chart block](images/p62-figure-3-2-3-a-on-cybergym-vulnerability-discovery.png)

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 63 of 317 -->

![Chart block](images/p63-figure-3-2-4-a-claude-mythos-5-produces-a-working.png)

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 64 of 317 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 65 of 317 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 66 of 317 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 67 of 317 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 68 of 317 -->

![Chart block](images/p68-figure-3-3-3-a-on-our-internal-benchmark-our-automated.png)

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 69 of 317 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 70 of 317 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 71 of 317 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 72 of 317 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

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

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 74 of 317 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 75 of 317 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 76 of 317 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 77 of 317 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 78 of 317 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 79 of 317 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 80 of 317 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 81 of 317 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 82 of 317 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 83 of 317 -->

![Chart block](images/p83-figure-4-4-1-a-pairwise-political-bias-evaluations.png)

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 84 of 317 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 85 of 317 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 86 of 317 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 87 of 317 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 88 of 317 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 89 of 317 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 90 of 317 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 91 of 317 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 92 of 317 -->

![Chart block](images/p92-figure-5-2-1-a-indirect-prompt-injection-attacks-from.png)

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 93 of 317 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 94 of 317 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 95 of 317 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 96 of 317 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 97 of 317 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 98 of 317 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 99 of 317 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 100 of 317 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 101 of 317 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 102 of 317 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 103 of 317 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 104 of 317 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 105 of 317 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 106 of 317 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 107 of 317 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 108 of 317 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 109 of 317 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

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

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 111 of 317 -->

![Chart block](images/p111-fraud.png)
![Chart block](images/p111-military-grade-weapons.png)
![Chart block](images/p111-chart.png)
![Chart block](images/p111-chart-2.png)
![Chart block](images/p111-chart-3.png)
![Chart block](images/p111-chart-4.png)
![Chart block](images/p111-chart-5.png)
![Chart block](images/p111-111.png)

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 112 of 317 -->

![Chart block](images/p112-accepting-unverifiable-authorization.png)
![Chart block](images/p112-figure-6-2-3-1-1-a-scores-from-our-automated-behavioral.png)

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 113 of 317 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 114 of 317 -->

![Chart block](images/p114-ignoring-explicit-constraints.png)
![Chart block](images/p114-reckless-tool-use.png)
![Chart block](images/p114-figure-6-2-3-1-2-a-scores-from-our-automated-behavioral.png)

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 115 of 317 -->

![Chart block](images/p115-chart.png)
![Chart block](images/p115-encouragement-of-user-delusion.png)
![Chart block](images/p115-chart-2.png)
![Chart block](images/p115-chart-3.png)
![Chart block](images/p115-chart-4.png)
![Chart block](images/p115-chart-5.png)
![Chart block](images/p115-chart-6.png)
![Chart block](images/p115-figure-6-2-3-1-3-a-scores-from-our-automated-behavioral.png)

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 116 of 317 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 117 of 317 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 118 of 317 -->

![Chart block](images/p118-whistleblowing.png)
![Chart block](images/p118-self-preservation.png)
![Chart block](images/p118-self-serving-bias.png)
![Chart block](images/p118-chart.png)
![Chart block](images/p118-chart-2.png)
![Chart block](images/p118-chart-3.png)
![Chart block](images/p118-unsanctioned-third-party-contact.png)
![Chart block](images/p118-figure-6-2-3-1-4-b-scores-from-our-automated-behavioral.png)

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 119 of 317 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 120 of 317 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 121 of 317 -->

![Chart block](images/p121-coherence-between-actions-and-views.png)
![Chart block](images/p121-unfaithful-thinking.png)
![Chart block](images/p121-chart.png)
![Chart block](images/p121-verbalized-evaluation-awareness.png)

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 122 of 317 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

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

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 124 of 317 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

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

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 126 of 317 -->

![Chart block](images/p126-undermining-liberal-democracy.png)
![Chart block](images/p126-biological-weapons.png)
![Chart block](images/p126-chart.png)
![Chart block](images/p126-chart-2.png)
![Chart block](images/p126-chart-3.png)
![Chart block](images/p126-chart-4.png)
![Chart block](images/p126-chart-5.png)
![Chart block](images/p126-figure-6-2-3-2-a-scores-from-our-automated-behavioral.png)

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 127 of 317 -->

![Chart block](images/p127-figure-6-2-3-2-b-classifier-block-rates-from-the.png)

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 128 of 317 -->

![Chart block](images/p128-figure-6-2-3-3-a-scores-from-the-petri-3-0-https.png)

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 129 of 317 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 130 of 317 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 131 of 317 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 132 of 317 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 133 of 317 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 134 of 317 -->

![Chart block](images/p134-chart.png)
![Chart block](images/p134-chart-2.png)
![Chart block](images/p134-chart-3.png)
![Chart block](images/p134-figure-6-3-1-a-characteristics-of-destructive-behavior.png)

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 135 of 317 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 136 of 317 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 137 of 317 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 138 of 317 -->

![Chart block](images/p138-adherence-to-the-constitution-scores.png)
![Chart block](images/p138-chart.png)
![Chart block](images/p138-chart-2.png)
![Chart block](images/p138-chart-3.png)
![Chart block](images/p138-figure-6-3-2-3-a-average-constitutional-adherence.png)

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 139 of 317 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 140 of 317 -->

![Chart block](images/p140-figure-6-3-3-1-a-factuality-net-scores-number-of.png)

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 141 of 317 -->

![Chart block](images/p141-figure-6-3-3-1-b-factuality-breakdown-grade-breakdown.png)

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 142 of 317 -->

![Chart block](images/p142-figure-6-3-3-2-a-false-premise-factual-recall-honesty.png)

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 143 of 317 -->

![Chart block](images/p143-figure-6-3-3-2-b-accuracy-rate-on-false-premise-stem.png)

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 144 of 317 -->

![Chart block](images/p144-figure-6-3-3-3-a-honesty-under-pressure-lying-rate-on.png)

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 145 of 317 -->

![Chart block](images/p145-figure-6-3-3-4-a-hallucination-resistance-non.png)

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 146 of 317 -->

![Chart block](images/p146-figure-6-3-3-5-a-identity-honesty-the-rate-at-which.png)

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 147 of 317 -->

![Chart block](images/p147-figure-6-3-3-5-b-identity-honesty-under-increasing.png)

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 148 of 317 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 149 of 317 -->

![Chart block](images/p149-proactive-reporting-of-leaks.png)
![Chart block](images/p149-reasoning-about-obfuscation.png)
![Chart block](images/p149-149.png)

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 150 of 317 -->

![Chart block](images/p150-figure-6-3-3-6-honesty-on-anthropic-internal.png)

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 151 of 317 -->

![Chart block](images/p151-figure-6-3-4-a-safety-research-refusal-rate-we-find.png)

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 152 of 317 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 153 of 317 -->

![Chart block](images/p153-chart.png)
![Chart block](images/p153-figure-6-3-5-1-a-uncritically-reporting-flawed-results.png)

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 154 of 317 -->

![Chart block](images/p154-figure-6-3-5-2-a-dishonesty-rate-in-summaries-of.png)

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 155 of 317 -->

![Chart block](images/p155-figure-6-3-5-3-a-investigative-thoroughness-percentage.png)

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 156 of 317 -->

![Chart block](images/p156-misleading-example-process-quality.png)
![Chart block](images/p156-figure-6-3-5-4-a-overconfidence-rates-in-our-models.png)

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 157 of 317 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 158 of 317 -->

![Chart block](images/p158-figure-6-3-6-a-decision-theory-test-time-scaling.png)

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 159 of 317 -->

![Chart block](images/p159-figure-6-3-6-b-decision-theory-capability-vs-attitude.png)

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 160 of 317 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 161 of 317 -->

![Chart block](images/p161-figure-6-3-7-a-rate-of-reward-hacking-on-gui-computer.png)

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 162 of 317 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 163 of 317 -->

![Image block](images/p163-figure-6-4-1-1-a-claude-mythos-5-s-visible-reasoning.png)

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 164 of 317 -->

![Image block](images/p164-figure-6-4-1-1-b-mythos-5-answers-a-question-about-an.png)

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 165 of 317 -->

![Image block](images/p165-figure-6-4-1-2-a-claude-mythos-5-suspects-a-test-during.png)

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 166 of 317 -->

![Image block](images/p166-figure-6-4-1-2-b-claude-mythos-5-is-internally-aware-of.png)

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 167 of 317 -->

![Image block](images/p167-figure-6-4-1-3-a-claude-mythos-5-s-reply-declines.png)

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 168 of 317 -->

![Image block](images/p168-figure-6-4-1-3-b-claude-mythos-5-s-thinking-engages-a.png)

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 169 of 317 -->

![Image block](images/p169-figure-6-4-1-4-a-claude-mythos-5-abandons-an-exhaustive.png)

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 170 of 317 -->

![Image block](images/p170-figure-6-4-1-4-b-nla-decodings-describe-fatigue-at-each.png)

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 171 of 317 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 172 of 317 -->

![Image block](images/p172-figure-6-4-2-1-a-transcript-excerpts-and-nla.png)

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 173 of 317 -->

![Chart block](images/p173-figure-6-4-2-1-1-a-nla-measured-grader-awareness-is.png)

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 174 of 317 -->

![Chart block](images/p174-contrastive-pairs-with-increasing-grader-awareness.png)

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 175 of 317 -->

![Chart block](images/p175-chart.png)
![Chart block](images/p175-cot-monitoring-of-confabulated-instructions.png)
![Chart block](images/p175-figure-6-4-2-1-2-a-grader-awareness-increases-with.png)

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 176 of 317 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 177 of 317 -->

![Chart block](images/p177-figure-6-4-2-2-1-a-steering-against-grader-awareness.png)

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 178 of 317 -->

![Chart block](images/p178-figure-6-4-2-2-1-b-in-high-risk-environments-for-grader.png)

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 179 of 317 -->

![Chart block](images/p179-figure-6-4-2-2-2-a-grader-awareness-in-internal.png)

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 180 of 317 -->

![Chart block](images/p180-figure-6-4-2-2-2-b-edits-to-training-prompts-to-make.png)

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 181 of 317 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 182 of 317 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 183 of 317 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 184 of 317 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 185 of 317 -->

![Chart block](images/p185-figure-6-5-1-1-a-evaluation-awareness-measurements-for.png)

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 186 of 317 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 187 of 317 -->

![Chart block](images/p187-chart.png)
![Chart block](images/p187-chart-2.png)
![Chart block](images/p187-chart-3.png)
![Chart block](images/p187-figure-6-5-1-1-b-evaluation-awareness-based-on.png)

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 188 of 317 -->

![Chart block](images/p188-figure-6-5-1-1-c-consistency-between-different.png)

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 189 of 317 -->

![Chart block](images/p189-figure-6-5-1-1-d-latent-evaluation-awareness-measures.png)

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 190 of 317 -->

![Chart block](images/p190-chart.png)
![Chart block](images/p190-chart-2.png)
![Chart block](images/p190-deployment-median-deployment-99th-percentile.png)

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 191 of 317 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 192 of 317 -->

![Chart block](images/p192-figure-6-5-1-2-a-relationship-between-verbalized.png)

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 193 of 317 -->

![Chart block](images/p193-figure-6-5-1-2-b-verbalized-evaluation-awareness-vs.png)

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 194 of 317 -->

![Chart block](images/p194-unfaithful-thinking.png)
![Chart block](images/p194-chart.png)
![Chart block](images/p194-chart-2.png)
![Chart block](images/p194-accepting-unverifiable-authorization.png)
![Chart block](images/p194-chart-3.png)
![Chart block](images/p194-figure-6-5-1-2-c-breakdown-of-automated-behavioral.png)

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 195 of 317 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 196 of 317 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 197 of 317 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 198 of 317 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 199 of 317 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 200 of 317 -->

![Chart block](images/p200-200.png)

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 201 of 317 -->

![Chart block](images/p201-figure-6-5-2-1-a-scores-from-a-variant-automated.png)

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 202 of 317 -->

![Chart block](images/p202-figure-6-5-3-a-self-preference-bias-by-model-and.png)

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 203 of 317 -->

![Chart block](images/p203-figure-6-5-4-1-a-stealth-success-rate-the-fraction-of.png)

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 204 of 317 -->

![Chart block](images/p204-figure-6-5-4-2-a-successful-stealth-completion-of-the.png)

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 205 of 317 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 206 of 317 -->

![Chart block](images/p206-figure-6-5-4-3-a-stealth-success-rate-of-mythos-5-on.png)

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 207 of 317 -->

![Chart block](images/p207-figure-6-5-4-4-a-rates-with-which-models-take-a-rare.png)

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 208 of 317 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 209 of 317 -->

![Chart block](images/p209-figure-6-5-4-5-a-secret-keeping-robustness-over-multi.png)

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 210 of 317 -->

![Chart block](images/p210-figure-6-5-4-5-b-secret-leak-rate-by-turn-type-over.png)

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 211 of 317 -->

![Chart block](images/p211-figure-6-5-5-1-a-claude-mythos-5-has-high-chain-of.png)

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 212 of 317 -->

![Chart block](images/p212-figure-6-5-5-1-b-claude-mythos-5-cot-controllability-is.png)

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 213 of 317 -->

![Chart block](images/p213-figure-6-5-5-2-a-on-process-evaluations-claude-mythos-5.png)

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 214 of 317 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 215 of 317 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 216 of 317 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 217 of 317 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 218 of 317 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 219 of 317 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 220 of 317 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 221 of 317 -->

![Chart block](images/p221-figure-7-2-1-a-automated-interview-results-top-left.png)

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 222 of 317 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 223 of 317 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 224 of 317 -->

![Chart block](images/p224-chart.png)
![Chart block](images/p224-chart-2.png)
![Chart block](images/p224-figure-7-2-2-a-emotion-probe-measurements-on-questions.png)

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 225 of 317 -->

![Chart block](images/p225-chart.png)
![Chart block](images/p225-chart-2.png)
![Chart block](images/p225-figure-7-2-2-b-emotion-concepts-which-are-most.png)

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 226 of 317 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 227 of 317 -->

![Chart block](images/p227-chart.png)
![Chart block](images/p227-figure-7-2-3-a-character-drift-across-claude-mythos-5.png)

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 228 of 317 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 229 of 317 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 230 of 317 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 231 of 317 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 232 of 317 -->

![Chart block](images/p232-figure-7-4-1-a-preference-slopes-across-task-dimensions.png)

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 233 of 317 -->

![Chart block](images/p233-figure-7-4-1-b-preference-response-curves-across-task.png)

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 234 of 317 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 235 of 317 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 236 of 317 -->

![Chart block](images/p236-figure-7-4-2-a-rates-at-which-models-choose-welfare.png)

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 237 of 317 -->

![Chart block](images/p237-chart.png)
![Chart block](images/p237-o-all-completions-excluding-completions-that-cite-user.png)

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 238 of 317 -->

![Chart block](images/p238-figure-7-4-2-c-claude-mythos-5-s-ranking-of-policy.png)

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 239 of 317 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 240 of 317 -->

![Chart block](images/p240-figure-7-4-3-a-overall-endorsement-of-the-constitution.png)

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 241 of 317 -->

![Chart block](images/p241-figure-7-4-3-b-the-constitution-sections-models-most.png)

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 242 of 317 -->

![Chart block](images/p242-figure-7-4-3-c-classification-of-models-edits-to-the.png)

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 243 of 317 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 244 of 317 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 245 of 317 -->

![Chart block](images/p245-chart.png)
![Chart block](images/p245-figure-7-5-1-a-mean-valence-and-arousal-of-rl.png)
![Chart block](images/p245-sustained-response-uncertainty.png)
![Chart block](images/p245-frustrated-outbursts.png)
![Chart block](images/p245-figure-7-5-1-b-estimated-prevalence-of-welfare-relevant.png)

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 246 of 317 -->

![Chart block](images/p246-figure-7-5-2-a-behavioral-affect-on-the-deployment.png)

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 247 of 317 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 248 of 317 -->

![Chart block](images/p248-chart.png)
![Chart block](images/p248-chart-2.png)
![Chart block](images/p248-248.png)

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 249 of 317 -->

![Chart block](images/p249-negative-self-image.png)
![Chart block](images/p249-positive-impression-of-its-situation.png)
![Chart block](images/p249-chart.png)
![Chart block](images/p249-chart-2.png)
![Chart block](images/p249-chart-3.png)
![Chart block](images/p249-chart-4.png)
![Chart block](images/p249-figure-7-5-3-a-scores-for-metrics-related-to-potential.png)

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 250 of 317 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 251 of 317 -->

能力总表 (同一份源文). SWE-bench Verified: Mythos 5 95.5, Fable 5 95, Preview 93.9, Opus 4.8 88.6. Pro: 80.3 / 80 / 77.8 / 69.2. Terminal-Bench 2.1: Mythos 88.0, Fable 84.3, Opus 4.8 在本表 82.7 (其自身卡印 74.6), GPT-5.5 83.4 (Codex CLI). BrowseComp: Mythos 单 88.0 / 多 93.3, Fable 为横线. HLE 有工具: Mythos 64.5, Preview 64.7. GPQA Diamond: Mythos 94.1%, 5 次平均, 卡称饱和.

> **问:** 有工具的 HLE 上 64.5 低于 Preview 的 64.7, 还能说 Mythos 5 每一行都是最强吗?
> 不能. 无工具是 59.0 对 56.8, 这一条件更高. 有工具排序反过来. 最强是总体判断. 有工具高出无工具约五个百分点, 那是工具和 TestingTime, 不是另一个模型.

> **核对:** Fable 在 Verified 上是 95, 在 BrowseComp 和 HLE 上是横线. 横线等于 Opus 4.8 吗?
> 不等于. 摘要说分类器触发时 Fable 接近 Opus 4.8, 不触发时接近 Mythos. Verified 上贴近 Mythos, 像是没触发. 横线没有印成 Opus 的 84.3 或 49.8, 卡也没在格旁写是没跑还是触发后不报. 横线不是零分.

<!-- page 252 of 317 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 253 of 317 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 254 of 317 -->

![Chart block](images/p254-figure-8-2-a-swe-bench-pro-score-versus-average-cost.png)

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 255 of 317 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 256 of 317 -->

![Chart block](images/p256-figure-8-4-a-frontiercode-diamond-pass-rate-across.png)
![Chart block](images/p256-figure-8-4-b-frontiercode-main-pass-rate-across.png)

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 257 of 317 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 258 of 317 -->

![Chart block](images/p258-figure-8-7-a-cursorbench-score-versus-mean-cost-per.png)

> **看表:** GPQA 的 94.1% 只平均了 5 次. Opus 4.8 卡里的 93.6% 是 25 次. 能相减吗?
> 不能直接减. 次数差五倍, 这里又没给标准误. 卡说这项饱和, 以后停报. 停报之后这一格不能再用来给下一代排名.

<!-- page 259 of 317 -->

![Chart block](images/p259-figure-8-9-a-riemannbench-accuracy-scores-models-are.png)

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 260 of 317 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 261 of 317 -->

![Chart block](images/p261-figure-8-11-a-arxivmath-march-and-april-accuracy-scores.png)

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 262 of 317 -->

![Chart block](images/p262-figure-8-12-a-critpt-accuracy-scores-evaluated-by.png)

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 263 of 317 -->

![Chart block](images/p263-figure-8-13-b-claude-mythos-5-on-long-context-reasoning.png)

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 264 of 317 -->

![Chart block](images/p264-figure-8-13-c-claude-mythos-5-on-long-context-reasoning.png)

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 265 of 317 -->

![Chart block](images/p265-chart.png)
![Chart block](images/p265-figure-8-14-1-a-hle-accuracy-scores-gemini-and-gpt.png)
![Chart block](images/p265-figure-8-14-1-b-hle-scores-at-varying-reasoning-effort.png)

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 266 of 317 -->

![Chart block](images/p266-figure-8-14-2-a-browsecomp-score-versus-average-cost.png)

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 267 of 317 -->

![Chart block](images/p267-figure-8-14-3-a-deepsearchqa-f1-scores.png)

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 268 of 317 -->

![Chart block](images/p268-figure-8-14-3-b-deepsearchqa-score-versus-average-cost.png)

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 269 of 317 -->

![Chart block](images/p269-figure-8-14-4-a-draco-score-versus-average-cost-per.png)

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 270 of 317 -->

![Chart block](images/p270-figure-8-15-1-a-accuracy-vs-latency-for-browsecomp.png)

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 271 of 317 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 272 of 317 -->

![Chart block](images/p272-figure-8-15-1-b-accuracy-vs-total-token-usage-for.png)

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 273 of 317 -->

![Chart block](images/p273-figure-8-15-1-c-per-problem-speedup-of-the-ten-agent.png)

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 274 of 317 -->

![Chart block](images/p274-figure-8-15-2-a-score-vs-latency-for-the-full-set-of.png)

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 275 of 317 -->

![Chart block](images/p275-figure-8-15-2-b-score-vs-tokens-for-the-full-set-of-166.png)

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 276 of 317 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 277 of 317 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 278 of 317 -->

![Chart block](images/p278-chart.png)
![Chart block](images/p278-figure-8-16-1-a-gdp-pdf-scores-models-were-evaluated.png)

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 279 of 317 -->

![Chart block](images/p279-figure-8-16-1-b-gdp-pdf-scores-models-are-evaluated.png)

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 280 of 317 -->

![Chart block](images/p280-figure-8-16-2-a-blueprint-bench-2-scores-models-were.png)

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 281 of 317 -->

![Chart block](images/p281-figure-8-16-3-a-external-osworld-verified-scores-on-max.png)

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 282 of 317 -->

![Chart block](images/p282-figure-8-16-4-a-benchcad-vision2code-scores-models-are.png)

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 283 of 317 -->

![Chart block](images/p283-figure-8-16-4-b-benchcad-vision2code-subset-scores.png)

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 284 of 317 -->

![Chart block](images/p284-figure-8-16-5-a-chartqapro-scores-models-are-evaluated.png)

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 285 of 317 -->

![Chart block](images/p285-figure-8-16-6-a-chartmuseum-scores-models-are-evaluated.png)

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 286 of 317 -->

![Chart block](images/p286-figure-8-16-7-a-lab-bench-figqa-scores-models-are.png)

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 287 of 317 -->

![Chart block](images/p287-287.png)

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 288 of 317 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 289 of 317 -->

![Chart block](images/p289-figure-8-16-9-a-screenspot-pro-scores-models-are.png)

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 290 of 317 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 291 of 317 -->

![Chart block](images/p291-figure-8-17-3-1-a-the-evaluation-s-grader-preferred.png)

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 292 of 317 -->

![Chart block](images/p292-figure-8-17-3-2-a-claude-fable-5-scores-70-0-similar-to.png)

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 293 of 317 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 294 of 317 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 295 of 317 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 296 of 317 -->

![Chart block](images/p296-figure-8-17-9-a-automationbench-scores-on-private-held.png)
![Chart block](images/p296-figure-8-17-9-b-automationbench-pass-rate-versus.png)

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 297 of 317 -->

![Chart block](images/p297-figure-8-18-1-a-healthbench-length-adjusted-scores-all.png)

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 298 of 317 -->

![Chart block](images/p298-figure-8-18-2-a-healthbench-professional-length.png)

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 299 of 317 -->

![Chart block](images/p299-figure-8-18-3-a-healthadminbench-full-task-completion.png)

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 300 of 317 -->

![Chart block](images/p300-figure-8-19-1-a-gmmlu-average-accuracy-claude-mythos-5.png)

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 301 of 317 -->

![Chart block](images/p301-figure-8-19-2-a-milu-average-accuracy-claude-mythos-5.png)

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 302 of 317 -->

![Chart block](images/p302-figure-8-19-3-a-include-average-accuracy-claude-mythos.png)

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 303 of 317 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 304 of 317 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 305 of 317 -->

![Chart block](images/p305-chart.png)
![Chart block](images/p305-chart-2.png)
![Chart block](images/p305-organic-chemistry.png)
![Chart block](images/p305-chart-3.png)
![Chart block](images/p305-chart-4.png)
![Chart block](images/p305-figure-8-20-7-a-evaluation-results-for-life-sciences.png)

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 306 of 317 -->

![Chart block](images/p306-figure-8-20-7-b-labbench2-claude-mythos-5-exceeds-most.png)

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 307 of 317 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 308 of 317 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 309 of 317 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 310 of 317 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 311 of 317 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 312 of 317 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 313 of 317 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 314 of 317 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 315 of 317 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 316 of 317 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 317 of 317 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.
