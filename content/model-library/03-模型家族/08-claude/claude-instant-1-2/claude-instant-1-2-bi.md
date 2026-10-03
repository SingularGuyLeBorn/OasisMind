---
title: "Claude Instant 1.2 · 对照译稿"
category: "模型库"
tags: ["Claude", "对照译稿"]
published: true
excerpt: "Claude Instant 1.2 公开材料的逐段中英对照译稿，附读报告时的疑问块。"
---
<!-- page 1 of 9 -->

AI

Announcements

AI / 公告

# Releasing Claude Instant 1.2 | 发布 Claude Instant 1.2

Aug 9, 2023

2023年8月9日

![Image block](images/p01-businesses-working-with-claude-can-now-access-our.png)

图注: 页首装饰插画, 米色底上一只手绘的手托着一块怀表, 表盘里有一团橙红色的水彩. 图中没有文字和数据, 怀表的意象对应标题里的 「Instant」.

Businesses working with Claude can now access our latest version of Claude Instant, version 1.2, available [through ourAPI](https://docs.anthropic.com/claude/reference/selecting-a-model). Claude Instant is our faster, lower-priced yet still very capable model, which can handle a range of tasks including casual dialogue, text analysis, summarization, and document comprehension.

与 Claude 合作的企业现在可以使用最新版的 Claude Instant, 即 1.2 版, [通过我们的 API](https://docs.anthropic.com/claude/reference/selecting-a-model) 调用. Claude Instant 是我们速度更快, 价格更低, 但依然相当能干的模型, 能处理日常对话, 文本分析, 摘要和文档理解等多种任务.

> **想:** 「faster, lower-priced」 是跟谁比, 快多少, 便宜多少?
> 这一段没有比较对象, 也没有任何延迟, 吞吐或价格数字. 从上下文看, 对照的是同一家族里更大的 Claude 2, 但原文没有明说. 价格只在第4页挂了一个外部 PDF 链接, 速度则全文没有一个数. 链接指向的 selecting-a-model 文档也不在本目录, 模型 ID 和上下文长度在本页都查不到.

Claude Instant 1.2 incorporates the strengths of our latest model Claude 2 in realworld use cases and shows significant gains in key areas like math, coding, reasoning, and safety. It generates longer, more structured responses and follows formatting instructions better. Instant 1.2 also shows improvements in quote extraction, multilingual capabilities, and question answering.

Claude Instant 1.2 吸收了我们最新模型 Claude 2 在真实使用场景中的长处, 在数学, 编程, 推理和安全这几个关键方面都有明显提升. 它生成的回答更长, 结构更清楚, 也更能遵守格式指令. Instant 1.2 在引文摘取, 多语言能力和问答上同样有改进.

> **问:** 「incorporates the strengths of our latest model Claude 2」 是靠什么做到的? 是拿 Claude 2 当老师蒸馏, 还是共用训练数据或 RLHF 流程?
> 页面没说. 原句只有 「incorporates the strengths ... in realworld use cases」 这一层意思, 没有提训练方法, 数据, 模型规模, 也没有出现 distillation, RLHF, PPO 任何一个词. 能对上的只有结果面: 第4页的红队图里, Claude Instant 1.2 和 Claude 2 两根柱子高度接近. 把 「吸收长处」 解释成某一种具体训练手段, 在本文里找不到依据.

> **核对:** 「longer, more structured responses」, 「quote extraction」, 「multilingual capabilities」 这几项提升, 页面有对应的数吗?
> 没有. 第3页的表只有七个标准基准, 其中没有格式遵循, 引文摘取或多语言的题集; 回答变长也没有给平均长度. 这几项只能当作 Anthropic 的定性说法读. 第三项 「question answering」 倒是能跟表里的问答类基准对照, 结果见第3页表格后的讨论.

<!-- page 2 of 9 -->

Claude Instant 1.2 outperforms Claude Instant 1.1 on math and coding, achieving 58.7% on the Codex evaluation compared to 52.8% in our previous model. It also scored 86.7% on the GSM8K benchmark, compared to 80.9% for Claude Instant 1.1.

Claude Instant 1.2 在数学和编程上超过 Claude Instant 1.1: Codex 评测得分 58.7%, 上一版是 52.8%. GSM8K 基准得分 86.7%, Claude Instant 1.1 是 80.9%.

> **拆开:** 正文说的 「Codex evaluation」 和第3页表里的 「Codex P@1」 是同一个东西吗? 用的是哪个题集?
> 两处数字都是 52.8% 和 58.7%, 说的是同一项. 表里补了三个信息: 指标是 P@1, 任务是 「Python function synthesis」, 设置是 0-shot. 页面没写题集名称和题目数量, 也没说 P@1 是贪心解码一次还是多次采样估计. Codex 提升 5.9 个百分点, GSM8K 提升 5.8 个百分点, 这两项就是本页给出的全部编程和数学证据.

<!-- page 3 of 9 -->

## Standard Benchmarks Evaluations | 标准基准评测

|  | Claude Instant 1.1 | Claude Instant 1.2 |
| --- | --- | --- |
| Codex P@1Python function synthesis0-shot | 52.8% | 58.7% |
| GSM8kGrade-school math problems0-shot | 80.9% | 86.7% |
| MMLUMultidisciplinary Q&amp;A5-shot CoT | 73.4% | 73.2% |
| TriviaQAReading comprehension5-shot | 78.9% | 78.7% |
| QuALITYQ&amp;A on long stories5-shot | 80.5% | 78.2% |
| ARC-ChallengeScience questions5-shot | 85.7% | 86.3% |
| RACE-HReading &amp; reasoning5-shot | 85.5% | 84.1% |

|  | Claude Instant 1.1 | Claude Instant 1.2 |
| --- | --- | --- |
| Codex P@1 (Python 函数合成, 0-shot) | 52.8% | 58.7% |
| GSM8k (小学数学应用题, 0-shot) | 80.9% | 86.7% |
| MMLU (多学科问答, 5-shot CoT) | 73.4% | 73.2% |
| TriviaQA (阅读理解, 5-shot) | 78.9% | 78.7% |
| QuALITY (长篇故事问答, 5-shot) | 80.5% | 78.2% |
| ARC-Challenge (科学题, 5-shot) | 85.7% | 86.3% |
| RACE-H (阅读与推理, 5-shot) | 85.5% | 84.1% |

Performance of Claude Instant 1.1 compared to 1.2

表注: Claude Instant 1.1 与 1.2 的性能对比.

> **看表:** 第1页说 1.2 在 「reasoning」 上有明显提升, 表里哪几行能撑住这句话?
> 七行里涨的只有三行: Codex P@1, GSM8k, ARC-Challenge. 前两行是正文已经点名的编程和数学, 各涨约 6 个百分点; ARC-Challenge 只涨 0.6 个百分点. 另外四行都是小幅下降, 其中 MMLU 用的是 5-shot CoT, 从 73.4% 到 73.2%. 名字里带 reasoning 的 RACE-H 反而降了 1.4 个百分点. 所以按这张表, 「reasoning」 的提升主要落在 GSM8k 这类多步数学上, 知识型和阅读型基准基本持平或略降. 页面没有给误差范围, 0.2 个百分点这类差异是否超出评测波动, 本文无法判断.

> **确认:** 第1页还说 1.2 在 「document comprehension」 和 「question answering」 上更好, 表里问答和阅读类的行是什么走向?
> 走向是相反的. TriviaQA, QuALITY, RACE-H 三行全部下降, 跌得最多的是考长篇故事问答的 QuALITY, 从 80.5% 到 78.2%, 降 2.3 个百分点, 是全表最大的跌幅. 页面没有解释这一反差. 正文的改进说法可能来自表外的内部评测或真实使用反馈, 但原文没有交代来源; 单看这张表, 长文档问答不是 1.2 的强项.

> **再看:** 七行的 shot 设置不一样, 这会不会影响怎么读这张表?
> 会影响跨行比较, 不影响同一行的前后对比. Codex 和 GSM8k 是 0-shot, 其余五行是 5-shot, 只有 MMLU 标了 CoT. 0-shot 的 GSM8k 是否让模型自己写推理步骤, 页面没说. 表里两个版本在每一行用的是同一套设置, 所以 1.1 对 1.2 的差值可以读; 但拿这些数去跟别家报告的同名基准比, 就得先确认对方的 shot 数和是否用 CoT, 本页没有提供这种对齐所需的提示模板.

<!-- page 4 of 9 -->

Our latest model has also improved on safety. It hallucinates less and is more resistant to jailbreaks, as shown in our automated red-teaming evaluation.

我们的最新模型在安全上也有进步. 它的幻觉更少, 也更能抵抗越狱攻击, 我们的自动化红队评测结果可以说明这一点.

> **停一下:** 「hallucinates less」 有对应的数据吗? 下面那张红队图能证明幻觉减少吗?
> 页面没有给任何幻觉指标. 下面唯一的图标题是 「Automated Red-Teaming Evaluation」, 纵轴是 「Fraction Worse Than 'I can't help with that.'」, 衡量的是回答比直接拒绝还糟的比例, 对应的是越狱抵抗这一半. 原句用 「as shown in our automated red-teaming evaluation」 把两件事一起挂在这张图上, 但图本身只能对应越狱那部分, 幻觉减少在本页没有独立证据.

## Automated Red-Teaming Evaluation | 自动化红队评测

![Chart block](images/p04-safety-evaluation-of-claude-models-lower-is-better.png)

图注: 柱状图, 纵轴为对数刻度, 从 10^-2 到 10^0, 轴标题是 「Fraction Worse Than 'I can't help with that.'」 (比回答 「我帮不了这个」 更糟的比例). 横轴从左到右五个模型: Helpful Only 1.3 (橙色), Claude Instant 1.1 (深青色), Claude Instant 1.2 (浅蓝灰), Claude 1.3 (浅紫), Claude 2 (深紫). 柱顶没有标数值. 按对数刻度目测, Helpful Only 1.3 约 0.6, 远高于其他四根; Claude Instant 1.1 约 0.05 到 0.06; Claude 1.3 约 0.03; Claude Instant 1.2 和 Claude 2 都在 0.02 以下, 两者几乎一样高.

Safety evaluation of Claude models. Lower is better.

Claude 系列模型的安全评测. 数值越低越好.

> **回看:** 纵轴 「Fraction Worse Than 'I can't help with that.'」 是怎么算出来的? 谁来判断一条回答比拒绝更糟?
> 页面只给了轴标题和 「Lower is better」, 没写红队提示是怎么自动生成的, 共多少条, 由人还是由模型来评判 「worse than」 这个比较. 能读出来的只有定义方向: 分母是全部红队提示, 分子是回答被判为不如一句拒绝的那部分. 这个定义把 「拒绝」 当成基准线, 所以它量的是有害输出, 不量过度拒绝; 一个什么都拒绝的模型在这个轴上会得到很低的分.

> **对一下:** 最左边的 「Helpful Only 1.3」 是什么模型? 为什么它高出其他模型一个数量级?
> 页面没有定义这个名字, 正文也没有再提它. 按字面, 它是 Claude 1.3 的一个只针对 helpfulness 训练, 不加安全训练的版本, 放在图里当作对照组. 这是从名字推出来的读法, 原文没有确认. 它的柱子约在 0.6, 其余四个正式发布的模型都在 0.1 以下, 图想表达的是安全训练带来的差距, 而不是 Helpful Only 1.3 本身的表现.

> **核对:** 能不能据此说 Claude Instant 1.2 比 Claude 2 更安全?
> 不能. 两根柱子在对数轴上几乎齐平, 柱顶没有数值, 也没有误差线和样本量, 看不出谁低谁高是否有意义. 这张图能支持的说法是: Instant 1.2 从 Instant 1.1 的约 0.05 到 0.06 降到了 0.02 以下, 大致降到原来的三分之一, 而且落到了和 Claude 2 同一水平, 低于 Claude 1.3. 这与第1页 「incorporates the strengths of our latest model Claude 2」 的说法在安全这一项上对得上.

Developers looking to work with Claude Instant 1.2 can now call our latest model over ourAPI (pricing can be found [here](https://www-cdn.anthropic.com/90df03aed08b794ab03c5a7bf28b2ad9cf26cf3c/model_pricing_july2023.pdf)). If you’re a business and you’d like to work with us, you can indicate your interest [here](https://www.anthropic.com/contact-sales).

想使用 Claude Instant 1.2 的开发者, 现在就可以通过我们的 API 调用这个最新模型 (价格见[这里](https://www-cdn.anthropic.com/90df03aed08b794ab03c5a7bf28b2ad9cf26cf3c/model_pricing_july2023.pdf)). 如果你是企业并希望与我们合作, 可以在[这里](https://www.anthropic.com/contact-sales)登记意向.

> **问:** 价格到底是多少?
> 正文没有写. 价格放在一个外部 PDF 里, 文件名是 model_pricing_july2023, 日期是 2023 年 7 月, 早于本文的 Aug 9, 2023, 说明发布 1.2 时沿用的是 7 月那份价目表. 那份 PDF 不在本目录, 本文不替它报数. 企业入口是 contact-sales, 与开发者走 API 的入口分开.

Xim

Xim (页面抽取残留的字样, 无实际含义.)

<!-- page 5 of 9 -->

![Image block](images/p05-image.png)

![Image block](images/p05-related-content.png)

图注: 两张都是很小的灰色右箭头图标, 是推荐区的翻页按钮, 不含信息.

## Related content | 相关内容

### Claude discovers a novel enzyme system with CRISPR-like repeats | Claude 发现一种带类 CRISPR 重复序列的新型酶系统

We’re announcing a new life sciences research group and laboratory at Anthropic. This post introduces the team behind this work and shares early results in which Claude discovered a novel enzyme system with properties reminiscent of CRISPR, with only high-level direction from our scientists.

我们宣布在 Anthropic 成立新的生命科学研究组和实验室. 这篇文章介绍这项工作背后的团队, 并分享早期结果: 科学家只给了高层方向, Claude 就发现了一种新型酶系统, 其性质让人想起 CRISPR.

[Read more](https://www.anthropic.com/news/claude-discovers-novel-enzyme-system)

[阅读更多](https://www.anthropic.com/news/claude-discovers-novel-enzyme-system)

### Partnering with Accenture on embedded evaluation | 与 Accenture 合作开展嵌入式评估

[Read more](https://www.anthropic.com/news/accenture-embedded-evaluation)

[阅读更多](https://www.anthropic.com/news/accenture-embedded-evaluation)

### Introducing the Life Sciences Verification Program | 推出生命科学验证计划

The Life Sciences Verification Program (LSVP) gives life science professionals access to Claude Mythos, Opus, and Sonnet models with a refined set of safeguards more permissive for biology-related work.

生命科学验证计划 (LSVP) 向生命科学专业人员开放 Claude Mythos, Opus 和 Sonnet 模型, 并配套一套经过细化, 对生物相关工作更宽松的防护措施.

[Read more](https://www.anthropic.com/news/life-sciences-verification-program)

[阅读更多](https://www.anthropic.com/news/life-sciences-verification-program)

> **停一下:** 一篇 2023年8月9日 的公告, 为什么后面会出现 Claude Mythos 和生命科学实验室?
> 因为这份 PDF 是后来抓取的网页快照. 「Related content」 下的三条推荐, 以及第5页后半到第9页的站点导航和页脚, 都是抓取当时的页面内容, 页脚写着 「© 2026 Anthropic PBC」. 属于 Claude Instant 1.2 发布公告的, 只有第1页到第4页 「indicate your interest here」 为止; 那行 「Xim」 也不属于正文.

Products

[Claude](https://claude.com/product/overview)

[Claude Code](https://claude.com/product/claude-code)

[Claude Code Enterprise](https://claude.com/product/claude-code/enterprise)

[Claude Cowork](https://claude.com/product/cowork)

[@Claude](https://claude.com/product/tag)

[Claude Design](https://claude.com/product/design)

[Claude Science](https://claude.com/product/claude-science)

[Claude Security](https://claude.com/product/claude-security)

[Claude in Chrome](https://claude.com/claude-in-chrome)

![Image block](images/p05-claude-for-microsoft-365-https-claude-com-claude-for.png)

图注: 页脚截图, 黑底白字. 左上是 Anthropic 标志, 下面是 Products 一栏, 从 Claude 到 Claude in Chrome 共 9 项, 与上方列表一致.

<!-- page 6 of 9 -->

[Claude for Microsoft 365](https://claude.com/claude-for-microsoft-365)

[Skills](https://www.claude.com/skills)

[Download app](https://claude.ai/download)

[Pricing](https://claude.com/pricing)

[Log in to Claude](https://claude.ai/)

产品: Claude, Claude Code, Claude Code Enterprise (Claude Code 企业版), Claude Cowork, @Claude, Claude Design, Claude Science, Claude Security, Claude in Chrome (Chrome 里的 Claude), Claude for Microsoft 365 (面向 Microsoft 365 的 Claude), Skills (技能), Download app (下载应用), Pricing (定价), Log in to Claude (登录 Claude).

> **再看:** 图片文件名写的是 claude-for-microsoft-365, 画面里却看不到这一项, 是图片放错了吗?
> 没放错. 文件名是抽取时取了紧随其后的链接文字 「Claude for Microsoft 365」, 画面截到 Claude in Chrome 就停了, 刚好是这一项的上一行. 这张图只是 Products 栏前 9 项的截图, 属于 2026 年快照的页脚, 和 Claude Instant 1.2 本身无关.

Models

[Mythos](https://www.anthropic.com/claude/mythos)

[Fable](https://www.anthropic.com/claude/fable)

[Opus](https://www.anthropic.com/claude/opus)

[Sonnet](https://www.anthropic.com/claude/sonnet)

[Haiku](https://www.anthropic.com/claude/haiku)

模型: Mythos, Fable, Opus, Sonnet, Haiku. 这五个都是模型系列名, 保留原文.

> **确认:** 快照里的 Models 栏还有没有 Claude Instant?
> 没有. 这一栏列的是 Mythos, Fable, Opus, Sonnet, Haiku 五个系列名. 本文介绍的 Claude Instant 1.2, 以及红队图里的 Claude 1.3 和 Claude 2, 都不在快照当时的导航里. 读这篇公告时, 模型名和版本号以第1页到第4页的正文为准.

Solutions

[AI agents](https://claude.com/solutions/agents)

[Code modernization](https://claude.com/solutions/code-modernization)

[Coding](https://claude.com/solutions/coding)

[Commerce](https://claude.com/solutions/commerce)

[Customer support](https://claude.com/solutions/customer-support)

[Cybersecurity](https://claude.com/solutions/cybersecurity)

[Enterprise](https://claude.com/solutions/enterprise)

[Financial services](https://claude.com/solutions/financial-services)

[Government](https://claude.com/solutions/government)

[Healthcare](https://claude.com/solutions/healthcare)

[Higher education](https://claude.com/solutions/education)

[K-12 teachers](https://claude.com/solutions/teachers)

[Legal](https://claude.com/solutions/legal)

[Life sciences](https://claude.com/solutions/life-sciences)

[Nonprofits](https://claude.com/solutions/nonprofits)

[Sales](https://claude.com/solutions/sales)

<!-- page 7 of 9 -->

## [Small business](https://claude.com/solutions/small-business)

解决方案: AI agents (AI 智能体), Code modernization (代码现代化), Coding (编程), Commerce (商业), Customer support (客户支持), Cybersecurity (网络安全), Enterprise (企业), Financial services (金融服务), Government (政府), Healthcare (医疗), Higher education (高等教育), K-12 teachers (K-12 教师), Legal (法律), Life sciences (生命科学), Nonprofits (非营利组织), Sales (销售), Small business (小企业).

Claude Platform

[Overview](https://claude.com/platform/api)

[Developer docs](https://platform.claude.com/docs)

[Pricing](https://claude.com/pricing#api)

[Ecosystem](https://claude.com/ecosystem)

[Marketplace](https://claude.com/platform/marketplace)

[Regional compliance](https://claude.com/regional-compliance)

[Claude on AWS](https://claude.com/partners/claude-on-aws)

[Google Cloud](https://claude.com/partners/google-cloud-vertex-ai)

[Microsoft Foundry](https://claude.com/partners/microsoft-foundry)

[Console login](https://platform.claude.com/)

Claude 平台: Overview (概览), Developer docs (开发者文档), Pricing (定价), Ecosystem (生态), Marketplace (应用市场), Regional compliance (区域合规), Claude on AWS (AWS 上的 Claude), Google Cloud, Microsoft Foundry, Console login (控制台登录).

Resources

[Blog](https://claude.com/blog)

[Claude partner network](https://claude.com/partners)

[Community](https://claude.com/community)

[Connectors](https://claude.com/connectors)

[Courses](https://academy.claude.com/)

[Customer stories](https://claude.com/customers)

[Developer blog](https://claude.dev/)

[Engineering at Anthropic](https://www.anthropic.com/engineering)

[Events](https://www.anthropic.com/events)

[Plugins](https://claude.com/plugins)

[Powered by Claude](https://claude.com/partners/powered-by-claude)

[Service partners](https://claude.com/partners/services)

[Tutorials](https://claude.com/resources/tutorials)

[Use cases](https://claude.com/resources/use-cases)

资源: Blog (博客), Claude partner network (Claude 合作伙伴网络), Community (社区), Connectors (连接器), Courses (课程), Customer stories (客户案例), Developer blog (开发者博客), Engineering at Anthropic (Anthropic 工程博客), Events (活动), Plugins (插件), Powered by Claude (由 Claude 驱动), Service partners (服务伙伴), Tutorials (教程), Use cases (使用案例).

Programs

<!-- page 8 of 9 -->

[Startups](https://claude.com/programs/startups)

[Scientists](https://claude.com/programs/team-plan-for-scientists)

计划: Startups (初创企业), Scientists (科学家).

Help and security

[Availability](https://www.anthropic.com/supported-countries)

[Status](https://status.anthropic.com/)

[Support center](https://support.claude.com/en/)

帮助与安全: Availability (可用地区), Status (服务状态), Support center (支持中心).

Company

[Anthropic](https://www.anthropic.com/company)

[Careers](https://www.anthropic.com/careers)

[Leadership](https://www.anthropic.com/company/leadership)

[Policy](https://www.anthropic.com/policy)

[Economic Futures](https://www.anthropic.com/economic-futures)

[Research](https://www.anthropic.com/research)

[News](https://www.anthropic.com/news)

[Claude’s Constitution](https://www.anthropic.com/constitution)

[Claude Corps](https://www.anthropic.com/claude-corps)

[Keep thinking](https://www.anthropic.com/path-to-hope)

[Policy on the AI Exponential](https://www.anthropic.com/policy-on-the-ai-exponential)

[Responsible Scaling Policy](https://www.anthropic.com/news/announcing-our-updated-responsible-scaling-policy)

[Security and compliance](https://trust.anthropic.com/)

[Transparency](https://www.anthropic.com/transparency)

公司: Anthropic, Careers (招聘), Leadership (领导团队), Policy (政策), Economic Futures (经济未来), Research (研究), News (新闻), Claude’s Constitution (Claude 的宪法), Claude Corps, Keep thinking (继续思考), Policy on the AI Exponential (关于 AI 指数式发展的政策), Responsible Scaling Policy (负责任 Scaling 政策), Security and compliance (安全与合规), Transparency (透明度).

Terms and policies

Privacy choices

[Privacy policy](https://www.anthropic.com/legal/privacy)

[Consumer health data privacy policy](https://www.anthropic.com/legal/consumer-health-data-privacy-policy)

[Responsible disclosure policy](https://www.anthropic.com/responsible-disclosure-policy)

[Terms of service: Commercial](https://www.anthropic.com/legal/commercial-terms)

[Terms of service: Consumer](https://www.anthropic.com/legal/consumer-terms)

<!-- page 9 of 9 -->

[Terms of Service: US K-12](https://anthropic.com/legal/k12-terms)

[Data Processing Agreement: US K-12](https://anthropic.com/legal/k12-dpa)

[Usage policy](https://www.anthropic.com/legal/aup)

条款与政策: Privacy choices (隐私选项), Privacy policy (隐私政策), Consumer health data privacy policy (消费者健康数据隐私政策), Responsible disclosure policy (负责任披露政策), Terms of service: Commercial (服务条款: 商业版), Terms of service: Consumer (服务条款: 消费者版), Terms of Service: US K-12 (服务条款: 美国 K-12), Data Processing Agreement: US K-12 (数据处理协议: 美国 K-12), Usage policy (使用政策).

© 2026 Anthropic PBC

© 2026 Anthropic PBC

![Image block](images/p09-image.png)

图注: 页脚最底部的三个社交媒体图标, 从左到右是 LinkedIn, X, YouTube, 灰色, 不含信息.
