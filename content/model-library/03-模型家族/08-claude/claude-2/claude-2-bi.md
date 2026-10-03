---
title: "Claude 2 · 对照译稿"
category: "模型库"
tags: ["Claude", "对照译稿"]
published: true
excerpt: "Claude 2 公开材料的逐段中英对照译稿，附读报告时的疑问块。"
---
<!-- page 1 of 8 -->

AI

Announcements

AI / 公告

# Claude 2

Jul 11, 2023

2023年7月11日

[Talk to Claude](https://claude.ai/)

[和 Claude 对话](https://claude.ai/)

![Image block](images/p01-we-are-pleased-to-announce-claude-2-https-www-cdn.png)

图注: 页首装饰插画, 陶土橙底色上画着一个朝右的人头侧影, 用几道黑色弧线勾出层层轮廓; 头部中央有一个白色圆点, 向外放射出八根白色连线, 每根末端是一个小圆点. 图中没有文字和数据.

We are pleased to announce [Claude 2](https://www-cdn.anthropic.com/bd2a28d2535bfb0494cc8e2a3bf135d2e7523226/Model-Card-Claude-2.pdf), our new model. Claude 2 has improved performance, longer responses, and can be accessed via API as well as a new public facing beta website, [claude.ai](https://claude.ai/redirect/website.v1.c2fcd1ad-fbe8-4fff-9730-832bb3e310dc). We have heard from our users that Claude is easy to converse with, clearly explains its thinking, is less likely to produce harmful outputs, and has a longer memory. We have made improvements from our previous models on coding, math, and reasoning. For example, our latest model scored 76.5% on the multiple choice section of the Bar exam, up from 73.0% with Claude 1.3. When compared to college students applying to graduate school, Claude 2 scores above the

我们很高兴推出新模型 [Claude 2](https://www-cdn.anthropic.com/bd2a28d2535bfb0494cc8e2a3bf135d2e7523226/Model-Card-Claude-2.pdf). Claude 2 性能更好, 回答更长, 既可以通过 API 使用, 也可以在新上线的面向公众的 beta 网站 [claude.ai](https://claude.ai/redirect/website.v1.c2fcd1ad-fbe8-4fff-9730-832bb3e310dc) 上使用. 用户告诉我们, Claude 好聊, 能把自己的思路讲清楚, 不太会产生有害输出, 记性也更长. 与之前的模型相比, 我们在编程, 数学和推理上都有改进. 比如, 最新模型在律师资格考试 (Bar exam) 选择题部分拿到 76.5%, 而 Claude 1.3 是 73.0%. 与申请研究生院的大学生相比, Claude 2 的成绩高于

> **想:** 标题里的 「Claude 2」 挂着一个 Model-Card-Claude-2.pdf 链接, 本目录的数字是出自那份模型卡吗?
> 本目录只有这篇博客页和它的 PDF 打印件, 模型卡本身不在这里. 页面上的 76.5%, 73.0%, 71.2%, 56.0%, 88.0%, 85.2% 和 「2x」 都是博客正文直接给的, 正文没写它们在模型卡里对应哪一节, 也没写评测设置. 读这批数字只能以本页原句为准; 想查评测细节, 得另开那份模型卡, 而那已经超出本目录.

> **核对:** 「76.5% on the multiple choice section of the Bar exam」 比的是哪个旧模型, 考的是整场考试吗?
> 原句写的是 「up from 73.0% with Claude 1.3」, 对照对象是 Claude 1.3, 不是泛称的 「previous models」. 范围也限定在 「the multiple choice section」, 只是选择题部分, 不含论述题等其他部分. 所以这组数字说的是: 在同一份选择题上, Claude 2 比 Claude 1.3 高 3.5 个百分点; 能不能通过律师资格考试, 页面没说.

<!-- page 2 of 8 -->

90th percentile on the GRE reading and writing exams, and similarly to the median applicant on quantitative reasoning.

GRE 阅读和写作考试的第 90 百分位, 在定量推理上则与中位数申请者相当.

> **拆开:** GRE 这句把三门考试分成了两档, 各自的参照是什么?
> 参照人群是第1页末尾那半句定的: 「college students applying to graduate school」. 阅读和写作是 「above the 90th percentile」, 定量推理只是 「similarly to the median applicant」, 也就是大约第 50 百分位. 同一句里, 语言类考试和数学类考试差了一大截, 这和下文 GSM8k 只从 85.2% 涨到 88.0% 可以对照着读: 页面自己给出的数学进步幅度, 本来就比编程小.

Think of Claude as a friendly, enthusiastic colleague or personal assistant who can be instructed in natural language to help you with many tasks. The Claude 2 API for businesses is being offered for the same price as Claude 1.3. Additionally, anyone in the US and UK can start using our [beta chat experience](https://claude.ai/redirect/website.v1.c2fcd1ad-fbe8-4fff-9730-832bb3e310dc) today.

你可以把 Claude 想成一位友好, 热心的同事或私人助理, 用自然语言下指令, 它就能帮你做许多事. 面向企业的 Claude 2 API 与 Claude 1.3 同价. 此外, 美国和英国的任何人今天起都可以使用我们的 [beta 聊天服务](https://claude.ai/redirect/website.v1.c2fcd1ad-fbe8-4fff-9730-832bb3e310dc).

> **问:** 「the same price as Claude 1.3」 到底是多少钱? 开放范围又有多大?
> 页面没有给出任何价格数字, 只说 Claude 2 API 和 Claude 1.3 同价, 而且限定是 「for businesses」. 网页端的开放范围写得很具体: 「anyone in the US and UK」, 形式是 beta. 第3页又重复了一次 「generally available in the US and UK」, 并说 「coming months」 再扩大地区. 所以价格要去别处查; 这篇页面能确认的只有 「不涨价」 和 「只开美英两地」.

As we work to improve both the performance and safety of our models, we have increased the length of Claude’s input and output. Users can input up to [100K tokens](https://www.anthropic.com/news/100k-context-windows) in each prompt, which means that Claude can work over hundreds of pages of technical documentation or even a book. Claude can now also write longer documents - from memos to letters to stories up to a few thousand tokens - all in one go.

在同时改进模型性能和安全性的过程中, 我们加长了 Claude 的输入和输出. 用户每个 prompt 最多可以输入 [100K tokens](https://www.anthropic.com/news/100k-context-windows), 这意味着 Claude 可以处理几百页技术文档, 甚至一整本书. Claude 现在还能一口气写出更长的文档, 从备忘录, 信件到故事, 长度可达几千个 token.

> **对一下:** 输入和输出都说 「increased」, 两边的量级一样吗? 100K 是 Claude 2 才有的吗?
> 两边差得很远: 输入是 「up to 100K tokens」, 输出只是 「up to a few thousand tokens」, 差了一两个数量级. 页面对输出只给了模糊的 「a few thousand」, 没有确切上限. 至于 100K, 这个词挂的链接指向另一篇新闻 100k-context-windows, 说明 100K 上下文另有单独的发布; 本页只说 「increased the length」, 没交代 Claude 1.3 原来是多少, 也没说 100K 是不是 Claude 2 首次提供.

In addition, our latest model has greatly improved coding skills. Claude 2 scored a 71.2% up from 56.0% on the [Codex HumanEval](https://github.com/openai/human-eval), a Python coding test. On GSM8k, a large set of grade-school math problems, Claude 2 scored 88.0% up from 85.2%. We have an exciting roadmap of capability improvements planned for Claude 2 and will be slowly and iteratively deploying them in the coming months.

此外, 最新模型的编程能力大幅提升. 在 Python 编程测试 [Codex HumanEval](https://github.com/openai/human-eval) 上, Claude 2 从 56.0% 提高到 71.2%. 在大型小学数学题集 GSM8k 上, Claude 2 从 85.2% 提高到 88.0%. 我们为 Claude 2 规划了一份令人期待的能力改进路线图, 会在接下来几个月里逐步, 迭代地部署.

> **确认:** 这两组 「up from」 的旧分数是谁的? 评测是怎么跑的?
> 这一段本身没有点名旧模型, 只写 「up from 56.0%」 和 「up from 85.2%」. 能对上的只有第1页那句 「up from 73.0% with Claude 1.3」, 按行文推断这里的对照也是 Claude 1.3, 但页面没有逐句写明. 评测设置同样缺席: HumanEval 没写是 pass@1 还是别的口径, 没写几个样本; GSM8k 没写几个示例, 有没有让模型先写推理过程. 两组数字只能当 「同一口径下的前后对比」 来读, 不宜拿去和别家报告的数字直接比.

We've been iterating to improve the underlying safety of Claude 2, so that it is more harmless and harder to prompt to produce offensive or dangerous output. We have an internal red-teaming evaluation that scores our models on a large representative set of harmful prompts, using an automated test while we also regularly check the results manually. In this evaluation, Claude 2 was 2x better at giving harmless responses compared to Claude 1.3. Although no model is immune from jailbreaks, we’ve used a variety of safety techniques (which you can read about [here](https://www.anthropic.com/research/constitutional-ai-harmlessness-from-ai-feedback) and [here](https://www.anthropic.com/research/the-capacity-for-moral-self-correction-in-large-language-models)), as well as [extensive red-teaming](https://www.anthropic.com/research/red-teaming-language-models-to-reduce-harms-methods-scaling-behaviors-and-lessons-learned), to improve its outputs.

我们一直在迭代改进 Claude 2 底层的安全性, 让它更无害, 也更难被 prompt 诱导出冒犯性或危险的内容. 我们有一套内部红队评测: 用一大批有代表性的有害 prompt 给模型打分, 打分用自动化测试, 同时定期人工抽查结果. 在这项评测中, Claude 2 给出无害回答的表现比 Claude 1.3 好 2 倍. 虽然没有哪个模型能完全免疫越狱, 我们还是用了多种安全技术 (可以读[这篇](https://www.anthropic.com/research/constitutional-ai-harmlessness-from-ai-feedback)和[这篇](https://www.anthropic.com/research/the-capacity-for-moral-self-correction-in-large-language-models)), 并做了[大量红队测试](https://www.anthropic.com/research/red-teaming-language-models-to-reduce-harms-methods-scaling-behaviors-and-lessons-learned), 来改进它的输出.

> **停一下:** 「2x better at giving harmless responses」 的 2 倍是按什么量算的?
> 页面没给分子分母. 「2x better」 可以理解成无害回答比例翻倍, 也可以理解成有害回答比例减半, 两种读法数值完全不同, 原句没说是哪种. 能确认的是评测的构成: 内部红队评测, 「a large representative set of harmful prompts」, 自动化打分, 外加定期人工核查. 题目数量, 有害的判定标准, Claude 1.3 的基线分数, 页面都没写.

> **回看:** 括号里的两个 「here」 和 「extensive red-teaming」 分别指什么? 能据此说 Claude 2 用了 Constitutional AI 吗?
> 按 URL, 第一个 「here」 是 constitutional-ai-harmlessness-from-ai-feedback, 第二个是 the-capacity-for-moral-self-correction-in-large-language-models, 第三个链接是一篇关于红队测试方法, Scaling 行为和经验的研究. 原句说 「we’ve used a variety of safety techniques (which you can read about here and here)」, 所以 Constitutional AI 确实被列为用过的安全技术之一. 但页面没说它用在训练的哪一步, 和 RLHF 或 PPO 怎么配合, 占多大比重. 本页只能支撑 「用过」, 支撑不了任何具体配方.

<!-- page 3 of 8 -->

Claude 2 powers our chat experience, and is generally available in the US and UK. We are working to make Claude more globally available in the coming months. You can now [create an account](https://claude.ai/redirect/website.v1.c2fcd1ad-fbe8-4fff-9730-832bb3e310dc) and start talking to Claude in natural language, asking it for help with any tasks that you like. Talking to an AI assistant can take some trial and error, so [read up on our tips](https://console.anthropic.com/docs/prompt-design) to get the most out of Claude.

Claude 2 驱动着我们的聊天服务, 已在美国和英国全面开放. 我们正在努力, 争取在接下来几个月里让更多国家和地区用上 Claude. 你现在就可以[创建账号](https://claude.ai/redirect/website.v1.c2fcd1ad-fbe8-4fff-9730-832bb3e310dc), 用自然语言和 Claude 交谈, 让它帮你做任何想做的事. 和 AI 助手对话往往需要一些摸索, 所以不妨[读读我们的使用技巧](https://console.anthropic.com/docs/prompt-design), 充分发挥 Claude 的能力.

We are also currently working with thousands of businesses who are using the Claude API. One of our partners is Jasper, a generative AI platform that enables individuals and teams to scale their content strategies. They found that Claude 2 was able to go head to head with other state of the art models for a wide variety of use cases, but has particular strength for long form low latency uses. "We are really happy to be among the first to offer Claude 2 to our customers, bringing enhanced semantics, up-to-date knowledge training, improved reasoning for complex prompts, and the ability to effortlessly remix existing content with a 3X larger context window," said Greg Larson, VP of Engineering at Jasper. "We are proud to help our customers stay ahead of the curve through partnerships like this one with Anthropic."

我们目前还在与数千家使用 Claude API 的企业合作. 其中一家伙伴是 Jasper, 一个生成式 AI 平台, 帮助个人和团队扩大内容策略的规模. 他们发现, 在各种各样的用例上, Claude 2 都能和其他业界领先的模型正面较量, 在长文本, 低延迟的场景里尤其突出. Jasper 工程副总裁 Greg Larson 说: 「我们很高兴成为首批向客户提供 Claude 2 的公司之一. 它带来了更强的语义理解, 更新的知识训练, 对复杂 prompt 更好的推理, 还能借助大 3 倍的上下文窗口轻松改编现有内容.」 他还说: 「通过和 Anthropic 这样的合作, 帮助客户保持领先, 我们很自豪.」

> **对一下:** Jasper 说 「a 3X larger context window」, 和第2页的 100K 对得上吗?
> 对不上号, 因为页面缺一个基线. 如果按 100K 倒推, 3 倍意味着原来约 33K, 但本页从没提过 33K 这个数; Jasper 也没说 3X 是相对 Claude 1.3, 还是相对他们之前接的别家模型. 另外, 「long form low latency」 这个评价是 Anthropic 转述 Jasper 的发现, 没有延迟数字. 这句引语能读出的是合作方的体感, 不是一组可以换算的规格.

Sourcegraph is a code AI platform that helps customers write, fix, and maintain code. Their [coding assistant Cody](https://www.youtube.com/watch?v=pRTTdlgDd8g) uses Claude 2’s improved reasoning ability to give even more accurate answers to user queries while also passing along more codebase context with up to 100K context windows. In addition, Claude 2 was trained on more recent data, meaning it has knowledge of newer frameworks and libraries for Cody to pull from. “When it comes to AI coding, devs need fast and reliable access to context about their unique codebase and a powerful LLM with a large context window and strong general reasoning capabilities,” says Quinn Slack, CEO & Co-founder of Sourcegraph. “The slowest and most frustrating parts of the dev workflow are becoming faster and more enjoyable. Thanks to Claude 2, Cody’s helping more devs build more software that pushes the world forward.”

Sourcegraph 是一个代码 AI 平台, 帮客户编写, 修复和维护代码. 他们的[编程助手 Cody](https://www.youtube.com/watch?v=pRTTdlgDd8g) 借助 Claude 2 更强的推理能力, 对用户的提问给出更准确的回答, 同时借助最高 100K 的上下文窗口传入更多代码库上下文. 此外, Claude 2 用更新的数据训练, 因此了解更新的框架和库, Cody 可以直接调用这些知识. Sourcegraph CEO 兼联合创始人 Quinn Slack 说: 「做 AI 编程, 开发者需要快速, 可靠地拿到自己代码库的上下文, 还需要一个上下文窗口大, 通用推理能力强的 LLM.」 他还说: 「开发流程里最慢, 最恼人的环节正在变快, 变得更愉快. 多亏 Claude 2, Cody 正在帮助更多开发者写出更多推动世界前进的软件.」

> **再看:** Jasper 的 「up-to-date knowledge training」 和这里的 「trained on more recent data」, 页面给了训练数据的截止时间吗?
> 没有. 两处都只是比较级: 一处是 Jasper 引语里的 「up-to-date knowledge training」, 一处是 Anthropic 在 Sourcegraph 段落里的陈述 「trained on more recent data」, 后面接的好处是 「knowledge of newer frameworks and libraries」. 截止月份, 数据来源, 数据量都没写. 值得注意的是, 后一句是 Anthropic 的叙述而非客户引语, 它是全文唯一一处 Anthropic 自己谈到 Claude 2 训练数据的地方.

We welcome your feedback as we work to responsibly deploy our products more broadly. Our chat experience is an open beta launch, and users should be aware that Claude – like all current models – can generate inappropriate responses. AI assistants are most useful in everyday situations, like serving to summarize or organize information, and should not be used where physical or mental health and well-being are involved. Please let us know if you’d like to talk to Claude in a [currently](https://docs.google.com/forms/d/1DlDkGmcxHYhuJ277R7x2g-ZqCDUWeLyL88IO0culKxE/edit?usp=drive_web)

在我们负责任地把产品推向更广范围的过程中, 欢迎大家反馈. 我们的聊天服务是公开 beta 版, 用户应当知道, Claude 和目前所有模型一样, 可能生成不当回答. AI 助手在日常场景里最有用, 比如总结或整理信息; 涉及身体, 心理健康与福祉的场合不应使用. 如果你想在[目前](https://docs.google.com/forms/d/1DlDkGmcxHYhuJ277R7x2g-ZqCDUWeLyL88IO0culKxE/edit?usp=drive_web)

> **核对:** 「should not be used where physical or mental health and well-being are involved」 是一条使用限制, 还是一句客套?
> 从行文看是明确的使用边界: 前半句先给出推荐场景 「summarize or organize information」, 后半句用 「should not be used」 划出不该用的场合, 并且和 「open beta launch」, 「can generate inappropriate responses」 放在同一段. 页面没把它写成条款, 也没说违反会怎样, 但它是全文唯一一处 Anthropic 主动给 Claude 2 划出的禁用场景. 对照页脚那批 2026 年的 Healthcare, Life sciences 链接读, 更能看出这是 2023 年发布时的口径.

<!-- page 4 of 8 -->

[unsupported area](https://docs.google.com/forms/d/1DlDkGmcxHYhuJ277R7x2g-ZqCDUWeLyL88IO0culKxE/edit?usp=drive_web), or if you are a [business who would like to start working with Claude](https://anthropic.com/earlyaccess).

[尚未开放的地区](https://docs.google.com/forms/d/1DlDkGmcxHYhuJ277R7x2g-ZqCDUWeLyL88IO0culKxE/edit?usp=drive_web)和 Claude 对话, 或者你是一家[想开始与 Claude 合作的企业](https://anthropic.com/earlyaccess), 请告诉我们.

## XO

(XO: 抽取残留的两个字母, 原页没有对应的正文含义, 不译.)

## Related content | 相关内容

### Claude discovers a novel enzyme system with CRISPR-like repeats | Claude 发现一种带有类 CRISPR 重复序列的新型酶系统

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

> **停一下:** 一篇 2023年7月11日 的发布页, 为什么第4页起出现 Claude Mythos 和生命科学实验室?
> 因为 PDF 是后来抓取的网页快照. Claude 2 公告正文到第4页开头 「business who would like to start working with Claude」 为止; 之后的 「## XO」, 「Related content」 三条推荐, 以及第4页到第8页的站点导航和页脚, 都是抓取当时的页面内容, 页脚写着 「© 2026 Anthropic PBC」. 这三条推荐和 Claude 2 没有关系, 读公告时应截在 「## XO」 之前.

![Image block](images/p04-ai.png)

图注: 一个灰色的向右箭头小图标, 是 「Read more」 旁的导航箭头. 文件名里的 「ai」 取自紧随其后的 「AI」 字样, 图中没有文字和数据.

AI

Products

[Claude](https://claude.com/product/overview)

[Claude Code](https://claude.com/product/claude-code)

[Claude Code Enterprise](https://claude.com/product/claude-code/enterprise)

<!-- page 5 of 8 -->

[Claude Cowork](https://claude.com/product/cowork)

[@Claude](https://claude.com/product/tag)

[Claude Design](https://claude.com/product/design)

[Claude Science](https://claude.com/product/claude-science)

[Claude Security](https://claude.com/product/claude-security)

[Claude in Chrome](https://claude.com/claude-in-chrome)

[Claude for Microsoft 365](https://claude.com/claude-for-microsoft-365)

[Skills](https://www.claude.com/skills)

[Download app](https://claude.ai/download)

[Pricing](https://claude.com/pricing)

[Log in to Claude](https://claude.ai/)

AI / 产品: Claude, Claude Code, Claude Code Enterprise (Claude Code 企业版), Claude Cowork, @Claude, Claude Design, Claude Science, Claude Security, Claude in Chrome (Chrome 里的 Claude), Claude for Microsoft 365 (面向 Microsoft 365 的 Claude), Skills (技能), Download app (下载应用), Pricing (定价), Log in to Claude (登录 Claude).

Models

[Mythos](https://www.anthropic.com/claude/mythos)

[Fable](https://www.anthropic.com/claude/fable)

[Opus](https://www.anthropic.com/claude/opus)

[Sonnet](https://www.anthropic.com/claude/sonnet)

[Haiku](https://www.anthropic.com/claude/haiku)

模型: Mythos, Fable, Opus, Sonnet, Haiku. 这五个都是模型系列名, 保留原文.

> **回看:** 快照里的 Models 导航栏有没有 Claude 2 或 Claude 1.3?
> 没有. 这一栏只列了 Mythos, Fable, Opus, Sonnet, Haiku 五个系列名, 正文反复出现的 Claude 2 和 Claude 1.3 都不在其中. 这说明快照抓取时, 这两个版本名已经不在官网的模型导航里. 本文讨论模型时以第1页到第4页开头的正文为准, 导航栏只反映 2026 年的站点结构.

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

<!-- page 6 of 8 -->

## [K-12 teachers](https://claude.com/solutions/teachers)

[Legal](https://claude.com/solutions/legal)

[Life sciences](https://claude.com/solutions/life-sciences)

[Nonprofits](https://claude.com/solutions/nonprofits)

[Sales](https://claude.com/solutions/sales)

[Small business](https://claude.com/solutions/small-business)

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

<!-- page 7 of 8 -->

[Powered by Claude](https://claude.com/partners/powered-by-claude)

[Service partners](https://claude.com/partners/services)

[Tutorials](https://claude.com/resources/tutorials)

[Use cases](https://claude.com/resources/use-cases)

资源: Blog (博客), Claude partner network (Claude 合作伙伴网络), Community (社区), Connectors (连接器), Courses (课程), Customer stories (客户案例), Developer blog (开发者博客), Engineering at Anthropic (Anthropic 工程博客), Events (活动), Plugins (插件), Powered by Claude (由 Claude 驱动), Service partners (服务合作伙伴), Tutorials (教程), Use cases (使用案例).

Programs

[Startups](https://claude.com/programs/startups)

[Scientists](https://claude.com/programs/team-plan-for-scientists)

计划: Startups (初创公司), Scientists (科学家).

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

公司: Anthropic, Careers (招聘), Leadership (管理团队), Policy (政策), Economic Futures (经济未来), Research (研究), News (新闻), Claude’s Constitution (Claude 宪章), Claude Corps, Keep thinking (继续思考), Policy on the AI Exponential (关于 AI 指数级发展的政策), Responsible Scaling Policy (保留原名), Security and compliance (安全与合规), Transparency (透明度).

> **想:** 页脚的 「Claude’s Constitution」 和正文第2页链接的 Constitutional AI 论文, 是同一样东西吗?
> 页面没有把两者关联起来. 正文那个链接的路径是 research/constitutional-ai-harmlessness-from-ai-feedback, 是 Anthropic 的一篇研究, 被写进 「a variety of safety techniques」 的括号里, 和 Claude 2 有直接关系. 页脚的 「Claude’s Constitution」 指向 /constitution, 是 2026 年快照里的站点链接, 页面没有给正文, 也没说它和 2023 年的 Claude 2 有什么关系. 讨论 Claude 2 的安全方法, 该引的是第2页正文那句, 不是页脚.

Terms and policies

<!-- page 8 of 8 -->

## [Privacy policy](https://www.anthropic.com/legal/privacy)

[Consumer health data privacy policy](https://www.anthropic.com/legal/consumer-health-data-privacy-policy)

[Responsible disclosure policy](https://www.anthropic.com/responsible-disclosure-policy)

[Terms of service: Commercial](https://www.anthropic.com/legal/commercial-terms)

[Terms of service: Consumer](https://www.anthropic.com/legal/consumer-terms)

[Terms of Service: US K-12](https://anthropic.com/legal/k12-terms)

[Data Processing Agreement: US K-12](https://anthropic.com/legal/k12-dpa)

[Usage policy](https://www.anthropic.com/legal/aup)

条款与政策: Privacy policy (隐私政策), Consumer health data privacy policy (消费者健康数据隐私政策), Responsible disclosure policy (负责任披露政策), Terms of service: Commercial (服务条款: 商业版), Terms of service: Consumer (服务条款: 消费者版), Terms of Service: US K-12 (服务条款: 美国 K-12), Data Processing Agreement: US K-12 (数据处理协议: 美国 K-12), Usage policy (使用政策).

© 2026 Anthropic PBC

© 2026 Anthropic PBC, 版权所有.

![Image block](images/p08-image.png)

图注: 深灰底上的白色 「in」 字样小图标, 是页脚里的 LinkedIn 社交链接图标. 图中没有其他文字和数据.
