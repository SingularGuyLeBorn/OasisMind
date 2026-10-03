---
title: "Claude 模型概览页 · 对照译稿"
category: "模型库"
tags: ["Claude", "对照译稿"]
published: true
excerpt: "Claude 模型概览页 公开材料的逐段中英对照译稿,附读报告时的疑问块."
---
<!-- page 1 of 5 -->

[Claude Platform Docs](https://platform.claude.com/docs/en/home)

[Claude 平台文档](https://platform.claude.com/docs/en/home)

Models & pricing  Models

模型与价格  模型

# Models overview

# 模型概览

Claude is a family of state-of-the-art large language models developed byAnthropic. Compare the current lineup, find the model ID for every platform, and open each model's page for its full specs and resources.

Claude 是 Anthropic 开发的一系列前沿大语言模型. 在这里可以对比当前阵容, 查到每个平台上的模型 ID, 再打开各模型的页面查看完整规格与相关资源.

[ Choosing a model](https://platform.claude.com/docs/en/about-claude/models/choosing-a-model)

[ 选择模型](https://platform.claude.com/docs/en/about-claude/models/choosing-a-model)

 [Pricing](https://platform.claude.com/docs/en/about-claude/pricing)

 [价格](https://platform.claude.com/docs/en/about-claude/pricing)

 [Migration guide](https://platform.claude.com/docs/en/about-claude/models/migration-guide)

 [迁移指南](https://platform.claude.com/docs/en/about-claude/models/migration-guide)

 Copy page

 复制页面

## Compare models

## 对比模型

If you're unsure which model to use, start with [Claude Opus 5.5](https://platform.claude.com/docs/en/models/opus-5-5/overview) for most workloads. Use [Claude Fable 5.1](https://platform.claude.com/docs/en/models/fable-5-1/overview) for demanding reasoning and long-horizon agentic work, or when your evals on Claude Opus 5.5 at higher effort still fall short. All current models support text and image input, text output, multilingual capabilities, vision, and tool use. Each model's page lists the platforms it's available on.

拿不准用哪个模型时, 大多数工作负载先从 [Claude Opus 5.5](https://platform.claude.com/docs/en/models/opus-5-5/overview) 起步. 高难度推理和长程 agent 工作用 [Claude Fable 5.1](https://platform.claude.com/docs/en/models/fable-5-1/overview); 在 Claude Opus 5.5 上调高 effort 之后评测仍不达标, 也换用它. 当前所有模型都支持文本与图像输入, 文本输出, 多语言, 视觉和工具调用. 各模型可在哪些平台使用, 见其各自页面.

> **想:** 什么时候该从 Opus 5.5 换到 Fable 5.1, 中间有没有先后顺序?
> 本段给了两个条件: 任务本身是高难度推理或长程 agent 工作; 或者 「evals on Claude Opus 5.5 at higher effort still fall short」. 第二个条件藏着顺序: 先在 Opus 5.5 上把 effort 调高, 也就是 TestingTime 多花算力, 评测还不够再换模型. 下表的默认 effort 一行里 Opus 5.5 是 medium, 比 Fable 5.1 和 Sonnet 5 的 high 低一档, 所以 「higher effort」 对它有实际的上调空间. 换模型的代价也在表里: Fable 5.1 的输入与输出单价都是 Opus 5.5 的 2.5 倍 ($10 对 $4, $50 对 $20). 页面没列 effort 共有几档, 也没说调高一档 token 用量会涨多少.

<table><tr><td rowspan="2"></td><td></td><td></td><td></td><td></td></tr><tr><td>Claude Fable 5.1For demanding reasoning and long-horizon agentic work</td><td>Claude Opus 5.5For long-running agentic coding and knowledge work</td><td>Claude Sonnet 5The best combination of speed and intelligence</td><td>Claude Sonnet 5The fa near-1</td></tr><tr><td>Comparative latency</td><td>Slower</td><td>Moderate</td><td>Fast</td><td>Faster</td></tr><tr><td>Pricing</td><td>$10 / input MTok$50 / output MTok</td><td>$4 / input MTok$20 / output MTok</td><td>$2 / input MTok$10 / output MTok</td><td>$1 / ir$5 / c</td></tr><tr><td>Claude API ID</td><td>claude-fable-5-1</td><td>claude-opus-5-5</td><td>claude-sonnet-5</td><td>claude-sonnet-5</td></tr><tr><td colspan="5">Capabilities</td></tr><tr><td>Thinking</td><td>Adaptive (always on)</td><td>Adaptive (always on)</td><td>Adaptive</td><td>Exter</td></tr><tr><td>Default effort</td><td>high</td><td>medium</td><td>high</td><td>Not s</td></tr><tr><td>Context window</td><td>1M tokens</td><td>1M tokens</td><td>1M tokens</td><td>Ask Docs [ ]</td></tr></table>

|  | Claude Fable 5.1 用于高难度推理与长程 agent 工作 | Claude Opus 5.5 用于长时间运行的 agent 编码与知识工作 | Claude Sonnet 5 速度与智能的最佳组合 | Claude Sonnet 5 The fa near-1 (右侧截断) |
| --- | --- | --- | --- | --- |
| 相对延迟 | 较慢 | 中等 | 快 | 更快 |
| 价格 | $10 / 输入 MTok, $50 / 输出 MTok | $4 / 输入 MTok, $20 / 输出 MTok | $2 / 输入 MTok, $10 / 输出 MTok | $1 / ir, $5 / c (截断) |
| Claude API ID | claude-fable-5-1 | claude-opus-5-5 | claude-sonnet-5 | claude-sonnet-5 |
| 能力 |  |  |  |  |
| 思考 (Thinking) | 自适应 (始终开启) | 自适应 (始终开启) | 自适应 | Exter (截断) |
| 默认 effort | high | medium | high | Not s (截断) |
| 上下文窗口 | 1M tokens | 1M tokens | 1M tokens | Ask Docs [ ] (被遮挡) |

> **核对:** 第四列真是第二个 Sonnet 5 吗?
> 不是. md 里第四列的表头写 「Claude Sonnet 5The fa near-1」, API ID 写 claude-sonnet-5, 和第三列一字不差, 但同目录 PDF 第 1 页的第四列表头只剩 「Claud / The fa / near-f」, API ID 一格折成 「clau」 和 「5-20」 两行, 前三列的 ID 都是一行放得下的短名. 所以 md 的第四列名字和 ID 是转换时从第三列串过来的, 真实型号在截图右缘被裁掉了. 同一列里 md 的上下文窗口写成 「Ask Docs [ ]」, 那是页面浮层按钮盖住了单元格, PDF 这一格是 「200K」. 第四列能读到的只有这些前缀: 延迟 「Faster」, 价格 「$1 / in」 和 「$5 / o」, 思考 「Exten」, 默认 effort 「Not s」. 页面让读者去 Model IDs and versioning 了解别名与快照, 本页没有给出第四列全名.

> **看表:** 四档价格之间是什么关系?
> 每一列的输出单价都正好是输入单价的 5 倍: $10 / $50, $4 / $20, $2 / $10, $1 / $5. 相邻两列之间, Fable 5.1 是 Opus 5.5 的 2.5 倍, Opus 5.5 是 Sonnet 5 的 2 倍, Sonnet 5 又是第四列的 2 倍, 首尾差 10 倍. 单位 MTok 指每百万 token. 第 3 页的 Pricing 卡片写着 「Complete pricing, including batch discounts and prompt caching rates」, 说明表中是不含批处理折扣和缓存费率的基础价. 延迟一行同样只有 Slower / Moderate / Fast / Faster 四个相对档位, 没有毫秒数.

> **拆开:** 同样写 Adaptive, 为什么前两列多了 「(always on)」?
> Fable 5.1 和 Opus 5.5 是 「Adaptive (always on)」, Sonnet 5 只写 「Adaptive」. 按字面读, Sonnet 5 的自适应思考可以关掉, 前两款关不掉. 第四列在 PDF 里是 「Exten」, 和 Adaptive 不是同一种写法, 说明这一列的思考方式另有名称. 本页没有解释 Adaptive 具体怎么自适应, 也没说 always on 与 effort 档位如何配合, 这些要去各模型页看.

> **停一下:** Opus 5.5 默认 effort 更低, 延迟却比 Sonnet 5 慢?
> 表里 Opus 5.5 默认 effort 是 medium, 延迟标 Moderate; Sonnet 5 默认 effort 是 high, 延迟反而标 Fast. 可见延迟档位主要由模型本身决定, 默认 effort 低一档并不能让 Opus 5.5 快过 Sonnet 5. 这一行的标题是 「Comparative latency」, 页面没说它是在默认 effort 下比较, 还是在同一 effort 下比较.

00Ask Docs 

00Ask Docs (页面上的 Ask Docs 浮层按钮, 抓取残留)

<!-- page 2 of 5 -->

[Claude Platform Docs](https://platform.claude.com/docs/en/home)

[Claude 平台文档](https://platform.claude.com/docs/en/home)

|  | Claude Fable 5.1 For demanding reasoning and long-horizon agentic work | Claude Opus 5.5 For long-running agentic coding and knowledge work | Claude Sonnet 5 The best combination of speed and intelligence | Claud The fa near-f |
| --- | --- | --- | --- | --- |
| Max output | 128K tokens | 128K tokens | 128K tokens | 64K t |
| Reliable knowledge | Jun 2026 | Jun 2026 | Jan 2026 | Feb 2 |
| cutoff |  |  |  |  |
| Additional details |  |  |  |  |

|  | Claude Fable 5.1 用于高难度推理与长程 agent 工作 | Claude Opus 5.5 用于长时间运行的 agent 编码与知识工作 | Claude Sonnet 5 速度与智能的最佳组合 | Claud The fa near-f (右侧截断) |
| --- | --- | --- | --- | --- |
| 最大输出 | 128K tokens | 128K tokens | 128K tokens | 64K t (截断) |
| 可靠知识截止 | Jun 2026 | Jun 2026 | Jan 2026 | Feb 2 (截断) |
| 更多细节 |  |  |  |  |

> **确认:** 三款新模型的知识截止为什么不一样?
> 表里 Fable 5.1 和 Opus 5.5 都是 Jun 2026, Sonnet 5 早五个月, 是 Jan 2026, 第四列截断成 「Feb 2」. 表头是 「Reliable knowledge cutoff」, md 把 「cutoff」 拆到了单独一行, 那一行是转换残留. 下一段把两种截止分开说: 「reliable-knowledge and training-data cutoffs」, 训练数据截止要去 Anthropic's Transparency Hub 查, 本页只给了可靠知识截止. 最大输出一行前三列同为 128K tokens, 第四列是 「64K t」.

> **回看:** 开头说能查到 「every platform」 的模型 ID, 表里有吗?
> 没有. 第 1 页表格只有一行 「Claude API ID」, 这一页的 「Additional details」 行四格全空. 第 1 页 Compare models 一段又写 「Each model's page lists the platforms it's available on」, 第 4 页页脚也有 Claude on AWS 与 Claude on Google Cloud 两个入口. 所以其他平台上的 ID 不在本页抓到的内容里, 要到各模型页去找.

Once you've picked a model, [learn how to make your first API call](https://platform.claude.com/docs/en/get-started). To understand how model IDs, aliases, and snapshots work, see [Model IDs and versioning](https://platform.claude.com/docs/en/about-claude/models/model-ids-and-versions); for the reliable-knowledge and training-data cutoffs behind each model, see [Anthropic's Transparency Hub](https://www.anthropic.com/transparency).

选好模型后, [学习如何发出第一次 API 调用](https://platform.claude.com/docs/en/get-started). 想弄清模型 ID, 别名和快照怎么运作, 见 [模型 ID 与版本](https://platform.claude.com/docs/en/about-claude/models/model-ids-and-versions); 每个模型背后的可靠知识截止与训练数据截止, 见 [Anthropic 透明度中心](https://www.anthropic.com/transparency).

## Using the Models API

## 使用 Models API

You can query model capabilities and token limits programmatically with the [Models API](https://platform.claude.com/docs/en/api/models/list). The response includes max\_input\_tokens max\_tokens , and a capabilities object for every available model.

你可以用 [Models API](https://platform.claude.com/docs/en/api/models/list) 以编程方式查询模型能力和 token 上限. 对每个可用模型, 返回结果都包含 max\_input\_tokens, max\_tokens 和一个 capabilities 对象.

> **问:** 1M 的上下文窗口和 128K 的最大输出, 是各算各的还是共用?
> 本页没有回答. 表里的行名是 「Context window」 和 「Max output」, Models API 返回的字段名却是 max\_input\_tokens 和 max\_tokens. 字段名里的 「input」 指向输入上限, 表里却叫 「Context window」, 两个名字是否指同一个范围, 页面没给对应关系, 也没说思考过程产生的 token 算不算进 max\_tokens. 另外 md 在 max\_input\_tokens 后面丢了逗号, PDF 第 2 页是 「max_input_tokens , max_tokens ,」, 三项是并列关系.

## Prompt and output performance

## Prompt 与输出表现

Current Claude models excel in:

当前的 Claude 模型擅长:

Performance: Top-tier results in reasoning, coding, multilingual tasks, long-context handling, honesty, and image processing. See [Prompting best practices](https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/claude-prompting-best-practices) for general and model-specific prompting guidance.

性能: 在推理, 编程, 多语言任务, 长上下文处理, 诚实性和图像处理上都达到顶尖水平. 通用的以及针对具体模型的 prompt 写法, 见 [Prompting 最佳实践](https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/claude-prompting-best-practices).

Engaging responses: Claude models are ideal for applications that require rich, human-like interactions. If you prefer more concise responses, adjust your prompts to guide the model toward the desired output length. Refer to the [prompt engineering guides](https://platform.claude.com/docs/en/build-with-claude/prompt-engineering) for details.

回应有温度: Claude 模型适合需要丰富, 拟人交互的应用. 如果你想要更简洁的回答, 可以调整 prompt, 引导模型输出你想要的长度. 详见 [prompt 工程指南](https://platform.claude.com/docs/en/build-with-claude/prompt-engineering).

Output quality: When migrating from a previous model generation, you may notice larger improvements in overall performance. If you're on Claude Opus 5 or earlier, see [Migrating to Claude Opus 5.5](https://platform.claude.com/docs/en/models/opus-5-5/migration-guide).

输出质量: 从上一代模型迁移过来时, 整体表现可能会有更明显的提升. 如果你还在用 Claude Opus 5 或更早的模型, 见 [迁移到 Claude Opus 5.5](https://platform.claude.com/docs/en/models/opus-5-5/migration-guide).

> **再看:** 「Output quality」 这一条给了质量数据吗?
> 没有. 这一条讲的其实是迁移: 从上一代换过来 「may notice larger improvements」, 再把 「Claude Opus 5 or earlier」 的用户引到 Opus 5.5 的迁移指南. 由此能读出的只有一点: Opus 5.5 的前一版是 Opus 5. 上面 「Performance」 一条列的六个方向 (推理, 编程, 多语言, 长上下文, 诚实性, 图像) 同样只有 「Top-tier」 这个定性词, 全页没有一个评测分数.

## Get started with Claude

## 开始使用 Claude

If you're ready to start exploring what Claude can do for you, dive in! Whether you're a developer looking to integrate Claude into your applications or a user wanting to experienc firsthand, the following resources can help.

准备好探索 Claude 能为你做什么了, 就直接上手吧! 无论你是想把 Claude 接进自己应用的开发者, 还是想亲手体验 AI 能力的用户, 下面这些资源都用得上.

<!-- page 3 of 5 -->

[Claude Platform Docs](https://platform.claude.com/docs/en/home)

[Claude 平台文档](https://platform.claude.com/docs/en/home)

### [Intro to Claude](https://platform.claude.com/docs/en/intro)

### [Claude 入门](https://platform.claude.com/docs/en/intro)

Explore Claude's capabilities and development flow.

了解 Claude 的能力与开发流程.

![Image block](images/p03-quickstart-https-platform-claude-com-docs-en-get-started.png)

> **对一下:** 这几张图是不是配给上方卡片的?
> 本页和第 4 页的四张图都是 1 到 2 KB 的线条图标: 闪电, 指南针, 两枚硬币, 显示器, 没有一张是图表. 按文件名对照, 闪电是 quickstart, 指南针是 choosing-a-model, 硬币是 pricing, 而 md 里它们分别排在 Quickstart, Choosing a model, Pricing 三个标题的正上方. 所以每张图标属于它下面那张卡片, 闪电虽然紧跟在 Intro to Claude 的说明后面, 配的却是 Quickstart. 第 4 页的显示器图标文件名取自 「claude-platform-docs」, 后面紧跟的也正是 Claude Platform Docs 链接. Intro to Claude, Model deprecations, Claude Console 三张卡片在 md 里没有图标.

### [Quickstart](https://platform.claude.com/docs/en/get-started)

### [快速上手](https://platform.claude.com/docs/en/get-started)

Learn how to make your first API call in minutes.

几分钟内学会发出第一次 API 调用.

![Image block](images/p03-choosing-a-model-https-platform-claude-com-docs-en.png)

### [Choosing a model](https://platform.claude.com/docs/en/about-claude/models/choosing-a-model)

### [选择模型](https://platform.claude.com/docs/en/about-claude/models/choosing-a-model)

Establish criteria and pick the right model for your use case.

先定下标准, 再为你的场景挑选合适的模型.

![Image block](images/p03-pricing-https-platform-claude-com-docs-en-about-claude.png)

[Pricing](https://platform.claude.com/docs/en/about-claude/pricing)

[价格](https://platform.claude.com/docs/en/about-claude/pricing)

Complete pricing, including batch discounts and prompt caching rates.

完整价格说明, 包括批处理折扣和 prompt 缓存费率.

### [Model deprecations](https://platform.claude.com/docs/en/about-claude/model-deprecations)

### [模型弃用](https://platform.claude.com/docs/en/about-claude/model-deprecations)

Lifecycle status and retirement commitments for every model.

每个模型的生命周期状态与退役承诺.

### [Claude Console](https://platform.claude.com/)

### [Claude 控制台](https://platform.claude.com/)

Craft and test prompts directly in your browser.

直接在浏览器里编写和测试 prompt.

Looking to chat with Claude? Visit [claude.ai](https://claude.ai/). If you have questions, reach out to the [support team](https://support.claude.com/) or the [Discord community](https://www.anthropic.com/discord).

想直接和 Claude 聊天? 请访问 [claude.ai](https://claude.ai/). 有问题可以联系 [支持团队](https://support.claude.com/), 或者到 [Discord 社区](https://www.anthropic.com/discord) 提问.

Was this page helpful?

这篇页面对你有帮助吗?

<!-- page 4 of 5 -->

![Image block](images/p04-claude-platform-docs-https-platform-claude-com-docs-en.png)

[Claude Platform Docs](https://platform.claude.com/docs/en/home)

[Claude 平台文档](https://platform.claude.com/docs/en/home)

[Claude Platform Docs](https://platform.claude.com/docs/en/home)

[Claude 平台文档](https://platform.claude.com/docs/en/home)

0 回

0 回 (抓取残留, 无对应正文)

Solutions

解决方案

[Code modernization](https://claude.com/solutions/code-modernization)

[代码现代化](https://claude.com/solutions/code-modernization)

[Coding](https://claude.com/solutions/coding)

[编程](https://claude.com/solutions/coding)

[Customer support](https://claude.com/solutions/customer-support)

[客户支持](https://claude.com/solutions/customer-support)

[Financial services](https://claude.com/solutions/financial-services)

[金融服务](https://claude.com/solutions/financial-services)

[Government](https://claude.com/solutions/government)

[政府](https://claude.com/solutions/government)

[Higher education](https://claude.com/solutions/education)

[高等教育](https://claude.com/solutions/education)

[K-12 teachers](https://claude.com/solutions/teachers)

[K-12 教师](https://claude.com/solutions/teachers)

[Life sciences](https://claude.com/solutions/life-sciences)

[生命科学](https://claude.com/solutions/life-sciences)

Partners [Claude on AWS](https://claude.com/partners/amazon-bedrock) [Claude on Google Cloud](https://claude.com/partners/google-cloud-vertex-ai)

合作伙伴 [AWS 上的 Claude](https://claude.com/partners/amazon-bedrock) [Google Cloud 上的 Claude](https://claude.com/partners/google-cloud-vertex-ai)

Learn

学习

[Blog](https://claude.com/blog)

[博客](https://claude.com/blog)

Help and security

帮助与安全

Company [Anthropic](https://www.anthropic.com/company) [Careers](https://www.anthropic.com/careers) [Economic Futures](https://www.anthropic.com/economic-futures) [Research](https://www.anthropic.com/research) [News](https://www.anthropic.com/news) [Responsible Scaling Policy](https://www.anthropic.com/news/announcing-our-updated-responsible-scaling-policy) [Security and compliance](https://trust.anthropic.com/) [Transparency](https://www.anthropic.com/transparency)

公司 [Anthropic](https://www.anthropic.com/company) [招聘](https://www.anthropic.com/careers) [经济未来](https://www.anthropic.com/economic-futures) [研究](https://www.anthropic.com/research) [新闻](https://www.anthropic.com/news) [负责任 Scaling 政策](https://www.anthropic.com/news/announcing-our-updated-responsible-scaling-policy) [安全与合规](https://trust.anthropic.com/) [透明度](https://www.anthropic.com/transparency)

[Availability](https://www.anthropic.com/supported-countries)

[可用地区](https://www.anthropic.com/supported-countries)

> **核对:** md 的页脚和 PDF 对得上吗?
> 对不全. PDF 第 4 页的 Solutions 下第一项是 「AI agents」, md 没有; Learn 下 PDF 还有 Courses, Use cases, Connectors, Customer stories, Engineering at Anthropic, Events, Powered by Claude, Service partners, Startups program 九项, md 只抓到 Blog. PDF 第 5 页开头的 Status 和 Support 在 md 里也缺. 反过来, md 这一页的 「0 回」 在 PDF 里找不到对应文字. 页脚的 「Responsible Scaling Policy」 链接指向的是 Anthropic 更新后的负责任 Scaling 政策公告, 和上面的模型规格表没有直接关系.

<!-- page 5 of 5 -->

[Claude Platform Docs](https://platform.claude.com/docs/en/home)

[Claude 平台文档](https://platform.claude.com/docs/en/home)

[Discord](https://www.anthropic.com/discord)

[Discord](https://www.anthropic.com/discord)

Terms and policies

条款与政策

[Privacy policy](https://www.anthropic.com/legal/privacy)

[隐私政策](https://www.anthropic.com/legal/privacy)

[Responsible disclosure policy](https://www.anthropic.com/responsible-disclosure-policy)

[负责任披露政策](https://www.anthropic.com/responsible-disclosure-policy)

[Terms of service: Commercial](https://www.anthropic.com/legal/commercial-terms)

[服务条款: 商业版](https://www.anthropic.com/legal/commercial-terms)

[Terms of service: Consumer](https://www.anthropic.com/legal/consumer-terms)

[服务条款: 消费者版](https://www.anthropic.com/legal/consumer-terms)

[Usage policy](https://www.anthropic.com/legal/aup)

[使用政策](https://www.anthropic.com/legal/aup)
