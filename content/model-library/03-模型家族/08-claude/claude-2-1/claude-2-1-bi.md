---
title: "Claude 2.1 · 对照译稿"
category: "模型库"
tags: ["Claude", "对照译稿"]
published: true
excerpt: "Claude 2.1 公开材料的逐段中英对照译稿，附读报告时的疑问块。"
---
<!-- page 1 of 10 -->

三

AI

Product

AI / 产品

# Introducing Claude 2.1 | 推出 Claude 2.1

Nov 21, 2023

2023年11月21日

![Image block](images/p01-our-latest-model-claude-2-1-is-now-available-overapi-in.png)

图注：页首装饰插画，橙色底上画着几道黑色曲线勾出的人头侧影，中心一点向外放射出八根白色连线，每根末端一个圆点。图中没有文字和数据。

Our latest model, Claude 2.1, is now available overAPI in our Console and is powering our [claude.ai](https://claude.ai/redirect/website.v1.edfd1e6d-f867-4260-82e2-0b2a6c73a7e9) chat experience. Claude 2.1 delivers advancements in key capabilities for enterprises—including an industry-leading 200K token context window, significant reductions in rates of model hallucination, system prompts and our new beta feature: tool use. We are also updating our [pricing](https://www-cdn.anthropic.com/1b1ea2c43d8dd058f6a331a8097e05ea40d626c6/model_pricing_nov2023.pdf) to improve cost efficiency for our customers across models.

我们的最新模型 Claude 2.1 现已通过 Console 里的 API 开放，同时也在驱动 [claude.ai](https://claude.ai/redirect/website.v1.edfd1e6d-f867-4260-82e2-0b2a6c73a7e9) 的聊天体验。Claude 2.1 在企业最看重的几项能力上都有进展：业界领先的 200K token 上下文窗口，模型幻觉率显著下降，system prompt，以及新的 beta 功能：工具使用（tool use）。我们还调整了[定价](https://www-cdn.anthropic.com/1b1ea2c43d8dd058f6a331a8097e05ea40d626c6/model_pricing_nov2023.pdf)，让各个模型的客户都能用得更划算。

> **想：** 「updating our pricing to improve cost efficiency」，新价格到底是多少，降了几成？
> 正文一个价格数字都没有，只挂了一个 model_pricing_nov2023.pdf 链接，这份 PDF 不在本目录。「across models」 说明调价不只针对 Claude 2.1，但涉及哪些模型，按输入还是输出 token 计价，页面都没说。按本文能确认的只有 「价格表在发布当天一并更新」 这一件事，具体数字要去读那份 PDF，本文不替它报数。

## 200K Context Window | 200K 上下文窗口

Since our launch earlier this year, Claude has been used by millions of people for a

自今年早些时候发布以来，Claude 已被数百万人用于

<!-- page 2 of 10 -->

wide range of applications—from translating academic papers to drafting business plans and analyzing complex contracts. In discussions with our users, they’ve asked for larger context windows and more accurate outputs when working with long documents.

各种各样的场景：从翻译学术论文，到起草商业计划，再到分析复杂合同。在和用户交流时，他们希望处理长文档时有更大的上下文窗口，输出也更准确。

In response, we’re doubling the amount of information you can relay to Claude with a limit of 200,000 tokens, translating to roughly 150,000 words, or over 500 pages of material. Our users can now upload technical documentation like entire codebases, financial statements like S-1s, or even long literary works like The Iliad or The Odyssey. By being able to talk to large bodies of content or data, Claude can summarize, perform Q&A, forecast trends, compare and contrast multiple documents, and much more.

为此，我们把一次能交给 Claude 的信息量翻了一倍，上限为 200,000 个 token，约合 150,000 个英文单词，或 500 多页材料。用户现在可以上传整个代码库这样的技术文档，S-1 这样的财务报表，甚至《伊利亚特》《奥德赛》这样的长篇文学作品。面对大量内容或数据，Claude 能做摘要，问答，预测趋势，对比多份文档的异同，还能做更多事。

> **核对：** 200,000 tokens，150,000 words，500 pages 这三个数之间是什么换算关系？「doubling」 又是从多少翻倍？
> 按原文数字自己算：150,000 / 200,000 = 0.75，即每个 token 约 0.75 个英文单词；150,000 / 500 = 300，即每页约 300 词。原文用的是 「roughly」 和 「over」，所以这只是量级换算，不是 tokenizer 的精确比例，换成中文或代码，比例会不同，页面没给。「doubling」 反推上一代的上限约为 100,000 token，但本页没有直接写出 Claude 2.0 的窗口数字，引用时应注明是由 「doubling」 推出来的。

Processing a 200K length message is a complex feat and an industry first. While we’re excited to get this powerful new capability into the hands of our users, tasks that would typically require hours of human effort to complete may take Claude a few minutes. We expect the latency to decrease substantially as the technology progresses.

处理 200K 长度的消息是一项复杂的工作，也是业界首次。我们很高兴把这项强大的新能力交到用户手里，不过要提醒一句：人类通常要花几个小时才能完成的任务，Claude 也可能需要几分钟。我们预计随着技术进步，延迟会大幅下降。

> **问：** 塞满 200K 时，一次请求到底要等多久？
> 页面只给了 「a few minutes」 这个定性说法，参照物是 「hours of human effort」，没有首 token 延迟，吞吐或不同长度下的耗时曲线。这句话的作用是给用户打预防针：窗口变大了，但满窗口的请求会慢。「We expect the latency to decrease substantially」 是对未来的预期，没有时间表。本文也没说延迟来自哪一段计算，所以不能从这里推出 Claude 2.1 用了什么注意力结构或长上下文技术。

## 2x Decrease in Hallucination Rates | 幻觉率降低一半

<!-- page 3 of 10 -->

Claude 2.1 has also made significant gains in honesty, with a 2x decrease in false statements compared to our previous Claude 2.0 model. This enables enterprises to build high-performing AI applications that solve concrete business problems and deployAI across their operations with greater trust and reliability.

Claude 2.1 在诚实性上也有明显进步：与上一代 Claude 2.0 相比，错误陈述减少为原来的一半。企业因此能搭建高性能的 AI 应用来解决具体业务问题，并以更高的信任度和可靠性在整个业务中部署 AI。

We tested Claude 2.1’s honesty by curating a large set of complex, factual questions that probe known weaknesses in current models. Using a rubric that distinguishes incorrect claims (“The fifth most populous city in Bolivia is Montero”) from admissions of uncertainty (“I’m not sure what the fifth most populous city in Bolivia is”), Claude 2.1 was significantly more likely to demur rather than provide incorrect information.

为了测试 Claude 2.1 的诚实性，我们整理了一大批复杂的事实性问题，专门针对当前模型已知的薄弱点。评分规则把错误断言（「玻利维亚人口第五多的城市是 Montero」）和承认不确定（「我不确定玻利维亚人口第五多的城市是哪一个」）区分开。结果显示，Claude 2.1 明显更倾向于表示不确定，而不是给出错误信息。

> **拆开：** 「2x decrease in false statements」 里的 「false statements」 按什么口径算？分母是全部回答，还是只算作答的那部分？
> 页面给出的口径是一套 rubric，至少区分两类输出：错误断言（incorrect claims）和承认不确定（admissions of uncertainty），并各举了一个玻利维亚城市的例子。题目来源是 「curating a large set of complex, factual questions that probe known weaknesses」，即专挑模型弱点的难题，题量，领域和判分人（人工还是模型）都没写。下方图表的纵轴是 「Fraction of answers」，说明比例的分母是全部回答。这一点很关键：把错误回答改成拒答，就能在分母不变的情况下让 「Incorrect」 的比例下降。

Al Claude 2.1 Open-ended Conversation Accuracy

（图题）Claude 2.1 开放式对话准确性

![Chart block](images/p03-claude-2-1-has-also-made-meaningful-improvements-in.png)

图注：柱状图，标题 「Hard Questions」，纵轴 「Fraction of answers」（0 到 50%），横轴两组：「Incorrect」 与 「Declined to answer」。浅紫为 2.0，深紫为 2.1，每根柱上叠一条玫红色 「error margin」 竖线。目测 Incorrect 组 2.0 约 47%，2.1 约 25%；Declined to answer 组 2.0 约 24%，2.1 约 45%。

> **看表：** 图题叫 「Accuracy」，图里却只有 「Incorrect」 和 「Declined to answer」 两组，答对的比例去哪了？2x 是怎么读出来的？
> 目测 Incorrect 从约 47% 降到约 25%，比值接近 2，对应正文的 「2x decrease」。但把两组加起来：2.0 约 47% + 24% ≈ 71%，2.1 约 25% + 45% ≈ 70%。如果剩下的部分就是答对（图里没画，页面也没说还有没有第三类），那么两代答对的比例都在 30% 上下，几乎没变。也就是说，这张图展示的进步是 「从答错转成拒答」，而不是 「答对的更多」。正文那句 「significantly more likely to demur rather than provide incorrect information」 说的正是这件事。误差线长约 ±4 个百分点，两组的 2.0 与 2.1 误差线都不重叠，差异不是误差范围内的抖动；不过误差线按什么方法算，页面没交代。

Claude 2.1 has also made meaningful improvements in comprehension and summarization, particularly for long, complex documents that demand a high degree

Claude 2.1 在理解和摘要能力上也有实质提升，尤其是那些篇幅长，结构复杂，要求高度

<!-- page 4 of 10 -->

A\ Long context question answering—errors

（图题）长上下文问答：错误率

of accuracy, such as legal documents, financial reports and technical specifications. In our evaluations, Claude 2.1 demonstrated a 30% reduction in incorrect answers and a 3-4x lower rate of mistakenly concluding a document supports a particular claim.

准确的文档，比如法律文件，财务报告和技术规范。在我们的评测中，Claude 2.1 的错误回答减少了 30%，错误地认定 「文档支持某个论断」 的比例低了 3-4 倍。

> **确认：** 「30% reduction in incorrect answers」 和 「3-4x lower rate」，是不是就从下面两张图读出来的？
> 页面没有把数字和图对应起来。目测两张图的 Average 柱：70K 下 2.0 约 5.3%，2.1 约 3.2%；195K 下 2.0 约 6.1%，2.1 约 3.6%。相对降幅都在 40% 左右，和正文的 30% 对不上。所以 30% 可能来自另一组评测，也可能是更保守的取整，本文给不出答案。「3-4x lower rate of mistakenly concluding a document supports a particular claim」 是另一种错误类型（把文档没说的论断当成文档支持的），两张图里都没有对应的柱。引用时，这两个数字应注明 「正文陈述，未附图」。

![Chart block](images/p04-chart.png)

图注：标题 「Long context question answering—errors」，副标题 「70K Context Length」。纵轴 0 到 10%，横轴四组：Beginning，Middle，End，Average；浅紫为 2.0，深紫为 2.1。目测 2.0 依次约为 7%，8%，3%，5.3%；2.1 依次约为 2%, 5%, 2%, 3.2%。

> **再看：** 这里的 Beginning，Middle，End 指什么？两代模型的错误分布像不像 「lost in the middle」 那种 U 形？
> 页面没解释这三个标签。从标题 「Long context question answering」 看，应当是答案所在信息放在上下文的开头，中间，结尾，但这是按标签推断，原文没写。在 70K 下，2.1 的错误集中在 Middle（约 5%），开头和结尾都约 2%，形状接近 「中间最差」。2.0 则是 Middle 约 8%，Beginning 约 7%，End 只有约 3%，开头几乎和中间一样差，只有结尾明显好。所以两代的改进主要落在 Beginning（约 7% 降到约 2%），Middle 降幅小一些。至于为什么，页面没有给任何训练或结构上的说明。

![Chart block](images/p04-while-we-are-encouraged-by-these-accuracy-improvements.png)

图注：同一组图的下半部分，副标题 「195K Context Length」，坐标和配色同上。目测 2.0 依次约为 8%，7%，2%，6.1%；2.1 依次约为 4%, 3%, 2%, 3.6%。

> **对一下：** Average 柱是不是 Beginning，Middle，End 三根柱的算术平均？为什么测的是 195K 而不是 200K?
> 目测对不上。70K 下 2.0 三根柱的平均是（7 + 8 + 3）/ 3 = 6%，Average 柱却在 6% 格线以下；195K 下 2.1 三根柱平均（4 + 3 + 2）/ 3 = 3%，Average 柱却接近 3.6%。比较合理的读法是：Average 是对全部测试位置求平均，图上只挑了三个代表位置展示。这一点页面没说，读图时不要用三根柱反推 Average。至于 195K，页面同样没解释；能确认的只是它低于 200K 上限，而问题本身和模型回答也要占 token。另外，在 195K 下 End 两代都是约 2%，没有变化，改进全部来自 Beginning 和 Middle。

While we are encouraged by these accuracy improvements, enhancing the precision and dependability of outputs for our users remains a top priority for our product and research teams.

这些准确性上的提升让我们备受鼓舞，但对产品和研究团队来说，让输出更精确，更可靠，仍然是第一要务。

## API Tool Use | API 工具使用

By popular demand, we’ve also added tool use, a new beta feature that allows Claude to integrate with users' existing processes, products, and APIs. This expanded interoperability aims to make Claude more useful across our users’ day-to-day operations.

应广大用户要求，我们还加入了工具使用（tool use）这一 beta 功能，让 Claude 能接入用户现有的流程，产品和 API。互通范围扩大后，Claude 在用户日常业务中能派上更多用场。

<!-- page 5 of 10 -->

Claude can now orchestrate across developer-defined functions orAPIs, search over web sources, and retrieve information from private knowledge bases. Users can define a set of tools for Claude to use and specify a request. The model will then decide which tool is required to achieve the task and execute an action on their behalf, such as:

Claude 现在可以在开发者定义的函数或 API 之间协调调用，搜索网络来源，并从私有知识库检索信息。用户可以定义一组供 Claude 使用的工具，再提出请求。模型会判断完成任务需要哪个工具，并代表用户执行操作，例如：

> **想：** 「execute an action on their behalf」，是模型自己去调 API，还是把调用意图交回给开发者执行？
> 页面没有交代执行环节。能确认的分工是：工具由 「developer-defined」 或 「Users can define a set of tools」，选哪个工具由 「The model will then decide」。至于调用格式，参数 schema，结果怎么回传，一次请求能不能连调多个工具，本页都没写。下一段又说 「Tool use is currently in early development」，开发者功能和 prompt 指南还在建设中。所以按本文，只能把它读成 「模型负责选工具并发起动作」 的 beta 能力，不能据此描述具体协议。

Using a calculator for complex numerical reasoning

用计算器处理复杂的数值推理

Translating natural language requests into structured API calls

把自然语言请求翻译成结构化的 API 调用

Answering questions by searching databases or using a web search API

通过查数据库或调用网络搜索 API 来回答问题

Taking simple actions in software via private APIs

通过私有 API 在软件里执行简单操作

Connecting to product datasets to make recommendations and help users complete purchases

连接产品数据集，给出推荐并帮用户完成购买

Tool use is currently in early development—we are building developer features and prompting guidelines for easier integration into your applications. We encourage users to share feedback on tool use to help shape and improve the product.

工具使用目前还处在早期开发阶段，我们正在打造开发者功能和 prompt 编写指南，方便你把它集成进自己的应用。欢迎用户分享使用反馈，帮我们塑造和改进这个产品。

## Developer Experience | 开发者体验

We’ve been working to simplify our developer Console experience for Claude API users while making it easier to test new prompts for faster learning. Our new Workbench product enables developers to iterate on prompts in a playground-style experience and access new model settings to optimize Claude’s behavior. They can create multiple prompts and navigate between them for different projects, and revisions are saved as they go to retain historical context. Developers can also generate code snippets to use their prompts directly in one of our SDKs.

我们一直在简化 Claude API 用户的开发者 Console 体验，同时让测试新 prompt 更方便，好让大家更快摸索出门道。新产品 Workbench 让开发者能在 playground 式的界面里反复迭代 prompt，并使用新的模型设置来调优 Claude 的行为。开发者可以为不同项目创建多个 prompt 并在它们之间切换，修改会随时保存，历史脉络不会丢。开发者还能生成代码片段，直接在我们的某个 SDK 里使用这些 prompt。

<!-- page 6 of 10 -->

We’re also introducing [system prompts](https://docs.anthropic.com/claude/docs/how-to-use-system-prompts), which allow users to provide custom instructions to Claude in order to improve performance. System prompts set helpful context that enhances Claude’s ability to take on specified personalities and roles or structure responses in a more customizable, consistent way aligned with user needs.

我们还推出了 [system prompt](https://docs.anthropic.com/claude/docs/how-to-use-system-prompts)，用户可以借此给 Claude 提供自定义指令，以提升表现。system prompt 设定有用的上下文，让 Claude 更好地扮演指定的个性和角色，或以更可定制，更一致，更贴合用户需求的方式组织回答。

> **停一下：** 第1页把 system prompts 列为 「advancements in key capabilities」，这里又把它放进开发者体验一节。它是模型能力的提升，还是 API 新增的一个输入位置？「improve performance」 有数据吗？
> 本页的描述是 「allow users to provide custom instructions」，作用是 「set helpful context」，落点在角色扮演和回答结构的一致性上。从这两句看，它首先是一个给用户写自定义指令的入口；模型在训练上有没有专门配合它，页面没写。「improve performance」 没有附任何评测数字或对比图，细节只挂了 how-to-use-system-prompts 文档链接。所以本文只能确认 「Claude 2.1 发布时开始提供 system prompt」，它带来多少提升，页面没说。

[Claude 2.1](https://www-cdn.anthropic.com/5c49cc247484cecf107c699baf29250302e5da70/ModelCardClaudev2_with_appendix_v1.pdf) is available now in ourAPI, and is also powering our chat interface at [claude.ai](https://claude.ai/redirect/website.v1.edfd1e6d-f867-4260-82e2-0b2a6c73a7e9) for both the free and Pro tiers. Usage of the 200K token context window is reserved for Claude Pro users, who can now upload larger files than ever before. We can't wait to see the use cases these new features inspire as we work to build the safest and most technically sophisticated AI systems in the industry.

[Claude 2.1](https://www-cdn.anthropic.com/5c49cc247484cecf107c699baf29250302e5da70/ModelCardClaudev2_with_appendix_v1.pdf) 现已在我们的 API 中上线，并为 [claude.ai](https://claude.ai/redirect/website.v1.edfd1e6d-f867-4260-82e2-0b2a6c73a7e9) 的免费版和 Pro 版聊天界面提供支持。200K token 上下文窗口仅向 Claude Pro 用户开放，他们现在能上传比以往更大的文件。在我们努力打造业界最安全，技术最先进的 AI 系统的同时，我们迫不及待想看到这些新功能会激发出哪些用法。

> **回看：** 「Usage of the 200K token context window is reserved for Claude Pro users」，这条限制对 API 也适用吗？
> 从上下文看，这句紧跟在 claude.ai 「free and Pro tiers」 之后，后半句说的是 「upload larger files」，讲的是聊天界面里的上传。所以最自然的读法是：在 claude.ai 上，免费版能用 Claude 2.1，但 200K 窗口只给 Pro. API 那边，页面只说 「available now in ourAPI」，没说 API 调用的窗口上限是否也分档。第2页介绍 200K 时也没有提任何档位限制。两处合起来，本文不能断言 API 一律可用 200K，也不能断言 API 受限。

> **问：** 标题链接 「Claude 2.1」 指向的文件名是 ModelCardClaudev2_with_appendix_v1.pdf，训练数据，参数量，对齐方法是不是在那里？
> 本页只能告诉你链接指向一份 「Claude 2 模型卡 + 附录」 的 PDF，这份文件不在本目录，本文没有读到其中内容。公告正文从头到尾没有提参数量，训练数据，训练 token 数，是否用了 RLHF 或 PPO，也没有任何公式或表格。想了解 Claude 2.1 怎么训练，需要去读那份模型卡；在本库里，不能从这篇公告推出训练配方。

## X

## Related content | 相关内容

Claude discovers a novel enzyme system with CRISPR-like repeats

Claude 发现一种带有类 CRISPR 重复序列的新型酶系统

We’re announcing a new life sciences research group and laboratory at Anthropic. This post introduces the team behind this work and shares early results in which Claude discovered a novel enzyme system with properties reminiscent of CRISPR, with only high-level direction from our scientists.

我们宣布在 Anthropic 成立新的生命科学研究组和实验室。这篇文章介绍这项工作背后的团队，并分享早期结果：科学家只给了高层方向，Claude 就发现了一种新型酶系统，其性质让人想起 CRISPR。

[Read more](https://www.anthropic.com/news/claude-discovers-novel-enzyme-system)

[阅读更多](https://www.anthropic.com/news/claude-discovers-novel-enzyme-system)

Partnering with Accenture on embedded evaluation

与 Accenture 合作开展嵌入式评估

[Read more](https://www.anthropic.com/news/accenture-embedded-evaluation)

[阅读更多](https://www.anthropic.com/news/accenture-embedded-evaluation)

Introducing the Life Sciences Verification Program

推出生命科学验证计划

<!-- page 7 of 10 -->

![Image block](images/p07-the-life-sciences-verification-program-lsvp-gives-life.png)

图注：一个灰色右箭头小图标，是推荐卡片上的 「前往」 按钮。文件名取自紧随其后的 LSVP 那段文字，图中没有内容信息。

The Life Sciences Verification Program (LSVP) gives life science professionals access to Claude Mythos, Opus, and Sonnet models with a refined set of safeguards more permissive for biology-related work.

生命科学验证计划（LSVP）向生命科学专业人员开放 Claude Mythos，Opus 和 Sonnet 模型，并配套一套经过细化，对生物相关工作更宽松的防护措施。

[Read more](https://www.anthropic.com/news/life-sciences-verification-program)

[阅读更多](https://www.anthropic.com/news/life-sciences-verification-program)

> **核对：** 一篇 2023年11月21日 的公告，为什么会出现 Claude Mythos，生命科学实验室和 Claude Code?
> 因为这份 PDF 是后来抓取的网页快照。「Related content」 下的三条推荐，以及第7页到第10页的站点导航和页脚，都是抓取当时的页面内容，页脚写着 「© 2026 Anthropic PBC」。真正属于 Claude 2.1 公告的，是第1页到第6页 「the safest and most technically sophisticated AI systems in the industry」 为止。后面 Models 栏里的 Mythos，Fable，Opus，Sonnet，Haiku 都不是本次发布的内容，本文提到的模型只有 Claude 2.1 和 Claude 2.0。

## AI

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

[Claude for Microsoft 365](https://claude.com/claude-for-microsoft-365)

[Skills](https://www.claude.com/skills)

[Download app](https://claude.ai/download)

[Pricing](https://claude.com/pricing)

[Log in to Claude](https://claude.ai/)

产品：Claude, Claude Code, Claude Code Enterprise（Claude Code 企业版），Claude Cowork, @Claude, Claude Design, Claude Science, Claude Security, Claude in Chrome（Chrome 里的 Claude），Claude for Microsoft 365（面向 Microsoft 365 的 Claude），Skills（技能），Download app（下载应用），Pricing（定价），Log in to Claude（登录 Claude）。

Models

[Mythos](https://www.anthropic.com/claude/mythos)

[Fable](https://www.anthropic.com/claude/fable)

[Opus](https://www.anthropic.com/claude/opus)

[Sonnet](https://www.anthropic.com/claude/sonnet)

[Haiku](https://www.anthropic.com/claude/haiku)

模型：Mythos, Fable, Opus, Sonnet, Haiku。这五个都是模型系列名，保留原文。

<!-- page 8 of 10 -->

## Solutions | 解决方案

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

[Small business](https://claude.com/solutions/small-business)

解决方案：AI agents（AI 智能体），Code modernization（代码现代化），Coding（编程），Commerce（商业），Customer support（客户支持），Cybersecurity（网络安全），Enterprise（企业），Financial services（金融服务），Government（政府），Healthcare（医疗），Higher education（高等教育），K-12 teachers（K-12 教师），Legal（法律），Life sciences（生命科学），Nonprofits（非营利组织），Sales（销售），Small business（小企业）。

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

Claude 平台：Overview（概览），Developer docs（开发者文档），Pricing（定价），Ecosystem（生态），Marketplace（市场），Regional compliance（区域合规），Claude on AWS（AWS 上的 Claude），Google Cloud, Microsoft Foundry, Console login（登录 Console）。

<!-- page 9 of 10 -->

## Resources | 资源

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

资源：Blog（博客），Claude partner network（Claude 合作伙伴网络），Community（社区），Connectors（连接器），Courses（课程），Customer stories（客户案例），Developer blog（开发者博客），Engineering at Anthropic（Anthropic 工程博客），Events（活动），Plugins（插件），Powered by Claude（由 Claude 驱动），Service partners（服务伙伴），Tutorials（教程），Use cases（用例）。

Programs

[Startups](https://claude.com/programs/startups)

[Scientists](https://claude.com/programs/team-plan-for-scientists)

计划：Startups（初创公司），Scientists（科学家）。

Help and security

[Availability](https://www.anthropic.com/supported-countries)

[Status](https://status.anthropic.com/)

[Support center](https://support.claude.com/en/)

帮助与安全：Availability（可用地区），Status（服务状态），Support center（支持中心）。

Company

[Anthropic](https://www.anthropic.com/company)

[Careers](https://www.anthropic.com/careers)

[Leadership](https://www.anthropic.com/company/leadership)

[Policy](https://www.anthropic.com/policy)

[Economic Futures](https://www.anthropic.com/economic-futures)

公司：Anthropic, Careers（招聘），Leadership（领导团队），Policy（政策），Economic Futures（经济未来）。

<!-- page 10 of 10 -->

## [Research](https://www.anthropic.com/research)

## [News](https://www.anthropic.com/news)

研究，新闻。

[Claude’s Constitution](https://www.anthropic.com/constitution)

[Claude Corps](https://www.anthropic.com/claude-corps)

[Keep thinking](https://www.anthropic.com/path-to-hope)

[Policy on the AI Exponential](https://www.anthropic.com/policy-on-the-ai-exponential)

[Responsible Scaling Policy](https://www.anthropic.com/news/announcing-our-updated-responsible-scaling-policy)

[Security and compliance](https://trust.anthropic.com/)

[Transparency](https://www.anthropic.com/transparency)

Claude’s Constitution（Claude 的宪法），Claude Corps, Keep thinking（继续思考），Policy on the AI Exponential（关于 AI 指数式发展的政策），Responsible Scaling Policy（负责任 Scaling 政策），Security and compliance（安全与合规），Transparency（透明度）。

## Terms and policies | 条款与政策

Privacy choices

隐私选项

[Privacy policy](https://www.anthropic.com/legal/privacy)

[Consumer health data privacy policy](https://www.anthropic.com/legal/consumer-health-data-privacy-policy)

[Responsible disclosure policy](https://www.anthropic.com/responsible-disclosure-policy)

[Terms of service: Commercial](https://www.anthropic.com/legal/commercial-terms)

[Terms of service: Consumer](https://www.anthropic.com/legal/consumer-terms)

[Terms of Service: US K-12](https://anthropic.com/legal/k12-terms)

[Data Processing Agreement: US K-12](https://anthropic.com/legal/k12-dpa)

[Usage policy](https://www.anthropic.com/legal/aup)

Privacy policy（隐私政策），Consumer health data privacy policy（消费者健康数据隐私政策），Responsible disclosure policy（负责任披露政策），Terms of service: Commercial（服务条款：商业版），Terms of service: Consumer（服务条款：消费者版），Terms of Service: US K-12（服务条款：美国 K-12），Data Processing Agreement: US K-12（数据处理协议：美国 K-12），Usage policy（使用政策）。

in X O

© 2026 Anthropic PBC

© 2026 Anthropic PBC
