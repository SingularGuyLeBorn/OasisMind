---
title: "Claude · 对照译稿"
category: "模型库"
tags: ["Claude", "对照译稿"]
published: true
excerpt: "Claude 公开材料的逐段中英对照译稿，附读报告时的疑问块。"
---
<!-- page 1 of 10 -->

AI

Announcements

AI / 公告

# Introducing Claude | 推出 Claude

Mar 14, 2023

2023年3月14日

![Image block](images/p01-after-working-for-the-past-few-months-with-key-partners.png)

图注: 页首装饰插画, 橙色圆点连成的网络, 旁边是手绘的人脸侧影和一只手. 图中没有文字和数据.

After working for the past few months with key partners like Notion, Quora, and DuckDuckGo in a closed alpha, we’ve been able to carefully test out our systems in the wild, and are [ready to offer Claude more broadly](https://www.anthropic.com/earlyaccess/) so it can power crucial, cuttingedge use cases at scale.

过去几个月, 我们以封闭 alpha 的形式与 Notion, Quora, DuckDuckGo 等重点伙伴合作, 得以在真实环境中审慎地检验我们的系统. 现在我们[准备更广泛地开放 Claude](https://www.anthropic.com/earlyaccess/), 让它在规模化场景里支撑关键而前沿的应用.

> **想:** 所谓 「carefully test out our systems in the wild」, 页面给了什么可核对的东西?
> 只给了三家伙伴名 (Notion, Quora, DuckDuckGo) 和 「past few months」 这个时长. 测试规模, 用户量, 出错率, 评测指标一概没写. 后文的伙伴引言是唯一的佐证, 都是定性反馈. 这一段能确认的只有两件事: 公告之前 Claude 只以封闭 alpha 对少数伙伴开放; 公告当天的动作是把入口换成 early access 申请链接.

[Claude](https://www.anthropic.com/product) is a next-generation AI assistant based on Anthropic’s research into training helpful, honest, and harmless AI systems. Accessible through chat interface and API in our developer console, Claude is capable of a wide variety of conversational and text processing tasks while maintaining a high degree of reliability and predictability.

[Claude](https://www.anthropic.com/product) 是新一代 AI 助手, 源自 Anthropic 关于如何训练有益, 诚实, 无害 (helpful, honest, and harmless) 的 AI 系统的研究. 用户可以通过聊天界面, 以及开发者控制台里的 API 使用 Claude. 它能完成各种对话和文本处理任务, 同时保持高度的可靠性和可预测性.

> **问:** 「helpful, honest, and harmless」 这三个目标是用什么训练方法做到的? 是 RLHF, PPO 还是 Constitutional AI?
> 本页没有说. 原句只是 「based on Anthropic’s research into training helpful, honest, and harmless AI systems」, 没有点名任何算法, 数据或奖励设计. 这篇公告也答不了三者怎么取舍: 它只把三个词当目标写出来, 第2页又以 「more helpful, honest, and harmless」 重复一次. 把某种方法当成 Claude 1 的训练配方, 在本文里找不到依据.

<!-- page 2 of 10 -->

Claude can help with use cases including summarization, search, creative and collaborative writing, Q&A, coding, and more. Early customers report that Claude is much less likely to produce harmful outputs, easier to converse with, and more steerable - so you can get your desired output with less effort. Claude can also take direction on personality, tone, and behavior.

Claude 可用于摘要, 搜索, 创意写作与协作写作, 问答, 编程等场景. 早期客户反馈, Claude 产生有害输出的可能性小得多, 更容易交谈, 也更可控 (steerable), 用更少的力气就能拿到想要的结果. Claude 还能按指示调整个性, 语气和行为.

> **核对:** 「much less likely to produce harmful outputs」 是跟谁比, 低多少?
> 这句的主语是 「Early customers report」, 是转述客户的说法. 页面没写对比对象, 没有有害输出比例, 也没有评测集名称. 同一句里的 「easier to converse with」 和 「more steerable」 也是同样的来源. 按本文, 这三点只能当作客户的定性评价读, 不能当作评测结果引用.

> **拆开:** 「take direction on personality, tone, and behavior」 靠什么接口下指令?
> 页面没写 system prompt, 参数开关或微调接口, 只说 Claude 能 「take direction」. 回到第1页, 能用的入口只有 「chat interface and API in our developer console」. 所以本文能确认的是: 用户在对话或 API 调用里给出要求, Claude 会照着调整个性, 语气和行为; 具体怎么实现, 页面没交代.

We’re offering [two versions of Claude](https://www-cdn.anthropic.com/b0d46f8c8e2f4cca2833c17cb68435035c0bb5a9/apr-pricing-tokens_2023-05-10-213025_tnty.pdf) today: Claude and Claude Instant. Claude is a state-of-the-art high-performance model, while Claude Instant is a lighter, less expensive, and much faster option. We plan to introduce even more updates in the coming weeks. As we develop these systems, we'll continually work to make them more helpful, honest, and harmless as we learn more from our [safety research](https://www.anthropic.com/news/an-ai-policy-tool-for-today-ambitiously-invest-in-nist) and our deployments.

今天我们提供[两个版本的 Claude](https://www-cdn.anthropic.com/b0d46f8c8e2f4cca2833c17cb68435035c0bb5a9/apr-pricing-tokens_2023-05-10-213025_tnty.pdf): Claude 和 Claude Instant. Claude 是业界领先的高性能模型; Claude Instant 更轻, 更便宜, 速度也快得多. 未来几周我们还会推出更多更新. 在开发这些系统的过程中, 我们会从[安全研究](https://www.anthropic.com/news/an-ai-policy-tool-for-today-ambitiously-invest-in-nist)和实际部署里不断学习, 持续让它们更有益, 更诚实, 更无害.

> **确认:** 两个版本的价格和速度到底差多少?
> 正文没有任何价格, 延迟或上下文长度数字, 只有 「lighter, less expensive, and much faster」 三个比较级. 「two versions of Claude」 挂的是一个 PDF, 文件名里写着 apr-pricing-tokens_2023-05-10, 这个日期比发文日 Mar 14, 2023 晚将近两个月, 说明链接目标后来换成了新的价目表. 那份 PDF 不在本目录, 本文不替它报数.

> **回看:** 「safety research」 这个链接指向的是安全研究论文吗?
> 从 URL 看不是. 路径是 an-ai-policy-tool-for-today-ambitiously-invest-in-nist, 按标题是一篇谈 NIST 投入的政策文章. 页面没解释为什么把它挂在 「safety research」 上. 想顺着这个链接去找 Claude 的训练方法, 会扑空; 本页所有关于安全的表述, 都停留在 「helpful, honest, and harmless」 这一层.

## Partner Testimonials | 合作伙伴评价

We are excited to showcase how our partners are using Claude today. We chose these companies and products with care. We’re excited to support businesses and

我们很高兴展示伙伴们现在如何使用 Claude. 这些公司和产品是我们仔细挑选的. 我们乐于支持这样的企业和

<!-- page 3 of 10 -->

nonprofits that are empowering people with information and making them more productive in their professional and personal lives.

非营利组织: 它们用信息为人赋能, 让人在工作和个人生活中都更有效率.

One of our key partners, [Quora](https://www.quora.com/), has offered Claude to users through [Poe](http://www.poe.com/), theirAI Chat app. “Users describe Claude’s answers as detailed and easily understood, and they like that exchanges feel like natural conversation,” says Autumn Besselman, Head of People and Comms from Quora.

我们的重要伙伴之一 [Quora](https://www.quora.com/), 已经通过旗下的 AI 聊天应用 [Poe](http://www.poe.com/) 向用户提供 Claude. Quora 人事与传播负责人 Autumn Besselman 说: 「用户说 Claude 的回答详细又好懂, 也喜欢那种像自然聊天一样的交流感.」

“Claude feels more conversational than ChatGPT,” says a happy Poe user, while another says, “I find Claude to be more interactive and creative in its storytelling.”

一位满意的 Poe 用户说: 「Claude 比 ChatGPT 更像在聊天.」 另一位说: 「我觉得 Claude 讲故事时更有互动感, 也更有创意.」

> **停一下:** 「more conversational than ChatGPT」 算不算一次对比评测?
> 不算. 这是一位 Poe 用户的单句引语, 页面没给样本量, 题目, 打分方式, 也没说对比的是哪个 ChatGPT 版本. 它说明 Anthropic 愿意在发布公告里引用与 ChatGPT 的比较, 仅此而已. 本文全篇没有一张评测表.

“I personally love the way the answers are presented and how in-depth, yet simply presented they are,” says one user who was impressed by Claude’s combination of language skills and expertise.

一位对 Claude 兼具语言能力和专业知识印象深刻的用户说: 「我个人很喜欢它呈现答案的方式, 讲得深入, 表达却很简单.」

![Image block](images/p03-we-are-especially-interested-in-positive-applications.png)

图注: Poe 应用截图. 左侧是 Poe 标志和标语 「Fast, helpful AI chat.」; 中间手机顶部标着 Claude, 用户问 「Where's the best place to see cherry blossoms in Tokyo?」, 回答依次列出 Ueno Park, Chidorigafuchi, Sumida Park; 右侧手机接着显示 Inokashira Park, 下方有 Like, Dislike, Share 按钮和几条追问建议.

> **再看:** 这张 Poe 截图能证明什么?
> 能证明的是产品形态: Claude 在 Poe 里以具名对话对象出现, 回答里有蓝色高亮的词条链接, 回答下面有 「Tell me more.」 之类的追问建议. 截图里的地点介绍, 比如 Sumida Park 「around 1,000 cherry blossom trees」, 属于模型的回答内容, 页面没有核实它的准确性. 所以这张图是界面展示, 不能当作质量评测样例.

We are especially interested in positive applications ofAI that can help people achieve their goals. [Juni Learning](https://junilearning.com/), a leading provider of online education solutions, uses Anthropic to power their Discord Juni Tutor Bot, an online tutoring solution to help students achieve academic success. Vivian Shen, CEO of Juni Learning, says, “We evaluated Anthropic against competitors, and for our use case and implementation we chose to incorporate Claude based on its helpful, high-quality responses. It was important for us to deliver a conversational experience at the level of a true tutor or teacher, as opposed to the surface-level answers we saw from the current state of other models. Across subjects, including math problems or understanding symbolism

我们特别看重能帮人实现目标的正面 AI 应用. 领先的在线教育解决方案提供商 [Juni Learning](https://junilearning.com/), 用 Anthropic 驱动它在 Discord 上的 Juni Tutor Bot, 这是一款帮助学生取得学业成绩的在线辅导工具. Juni Learning 的 CEO Vivian Shen 说: "我们把 Anthropic 和竞争对手放在一起评估过. 针对我们的场景和实现方式, 我们因为 Claude 的回答有用, 质量高而选择接入它. 对我们来说, 关键是要提供真正达到导师或老师水准的对话体验, 而不是我们在其他模型现阶段看到的那种浮于表面的回答. 在各个学科上, 无论是数学题, 还是理解

<!-- page 4 of 10 -->

in critical reading, incorporating Claude provided better, richer answers for our students’ learning.”

批判性阅读中的象征手法, 接入 Claude 都给学生的学习带来了更好, 更丰富的回答."

> **对一下:** 「We evaluated Anthropic against competitors」 评估了什么, 结果如何?
> 引语里没有竞品名称, 评估题目或指标. 给出的选择理由只有两条: 「helpful, high-quality responses」, 以及能达到 「a true tutor or teacher」 水准的对话. 跨学科的例子也只点了两个: 数学题, 批判性阅读里的象征手法. 这段引语横跨第3页和第4页, 是一句话被分页切开, 意思前后连贯.

Claude is also boosting the productivity of people at work and school via its integration with [Notion](http://www.notion.com/); Akshay Kothari, Co-Founder & COO of Notion, says, “Anthropic and Notion share a common goal of helping individuals and enterprises leverage AI to increase productivity. Claude's uniquely creative writing and summarization abilities contribute to the development of our connected AI assistant, Notion AI. Notion users can now work more efficiently and improve their writing skills, all within the Notion workspace.”

Claude 还通过与 [Notion](http://www.notion.com/) 的集成, 提升人们在工作和学习中的效率. Notion 联合创始人兼 COO Akshay Kothari 说: "Anthropic 和 Notion 有一个共同目标: 帮助个人和企业借助 AI 提升生产力. Claude 独到的创意写作和摘要能力, 为我们打造互联的 AI 助手 Notion AI 出了力. Notion 用户现在不用离开 Notion 工作区, 就能更高效地工作, 并提升写作水平."

We’re working with partners to integrate Claude with sources of solid, real-time information, like those found in search engines such as [DuckDuckGo](http://www.duckduckgo.com/). “We're thrilled to be working with Anthropic on DuckAssist, the first Instant Answer in our search results to use natural language technology to generate answers to search queries using Wikipedia and other related sources,” says Steve Fischer, Chief Business Officer at DuckDuckGo. “Anthropic has already been a great partner, working closely with us to improve the quality of DuckAssist answers while also meeting our strict privacy requirements. We're looking forward to continuing this partnership.”

我们正与伙伴合作, 把 Claude 接入可靠, 实时的信息源, 比如 [DuckDuckGo](http://www.duckduckgo.com/) 这类搜索引擎里的信息. DuckDuckGo 首席商务官 Steve Fischer 说: "很高兴与 Anthropic 一起做 DuckAssist. 它是我们搜索结果里第一个用自然语言技术的 Instant Answer, 会依据 Wikipedia 和其他相关来源, 为搜索查询生成答案. Anthropic 一直是很好的伙伴, 和我们紧密合作提升 DuckAssist 的答案质量, 同时满足我们严格的隐私要求. 我们期待继续这段合作."

> **想:** 这里的 「real-time information」 是 Claude 自己具备的, 还是外部接进来的?
> 按原句是外部接进来的: 「integrate Claude with sources of solid, real-time information」. 实时性来自接入的信息源, DuckAssist 的引语也说答案依据 「Wikipedia and other related sources」. 这篇公告只交代了接法的方向, 没写检索怎么做, 引用怎么标, 隐私要求具体是哪些条款.

Information-finding can be even harder in a document-heavy space like the legal industry. One of the hardest problems in the legal domain is reading and understanding complex legal text. [Robin AI](https://www.robinai.co.uk/), a legal infrastructure business, is using Claude to re-think the future of contracts.

在法律这种文档密集的行业, 找信息更难. 法律领域最难的问题之一, 就是读懂复杂的法律文本. 法律基础设施公司 [Robin AI](https://www.robinai.co.uk/) 正在用 Claude 重新思考合同的未来.

“We use Claude to evaluate particular parts of a contract, and to suggest new, alternative language that's more friendly to our customers. We've been working with these types of technologies since 2019, and nothing has matched Claude's capabilities,” says Richard Robinson, CEO of Robin AI. “We've found Claude is really good at understanding language - including in technical domains like legal language. It's also very confident at drafting, summarising, translations, and explaining complex concepts in simple terms. Since deploying Claude in our product, we're seeing higher user engagement, stronger user feedback and we're closing more deals.”

Robin AI 的 CEO Richard Robinson 说: 「我们用 Claude 评估合同里的特定条款, 并给出对客户更友好的替代措辞. 我们从 2019 年起就在用这类技术, 还没有哪个能比得上 Claude.」 他还说: 「我们发现 Claude 很会理解语言, 包括法律语言这样的专业领域. 它起草, 摘要, 翻译, 以及用简单的话解释复杂概念, 都很有把握. 自从在产品里部署了 Claude, 我们看到用户参与度更高, 用户反馈更好, 签下的单子也更多.」

<!-- page 5 of 10 -->

![Image block](images/p05-in-addition-to-improving-existing-products-we-are.png)

图注: 合同审阅界面截图. 左侧第 8 条原文 「This Agreement shall terminate and be of no further force or effect on the second anniversary of the date hereof.」 被高亮, 上方浮着 Term 和 View Playbook Suggestion 两个按钮; 右侧 Term 卡片的 Recommendation 把 second 删改为 first, 并补上 「or, if earlier, the date of execution of definitive documentation in connection with the Transaction」; Issue 一栏写 「Ensure that the term of the agreement expires after 1 year.」; 底部还有折叠的 Equitable damages 一项.

> **拆开:** 这张合同截图和 Robin AI 那段引语是什么关系? 右侧建议是谁给的?
> 位置上, 图紧跟在 Robin AI 引语之后, 内容也对得上 「evaluate particular parts of a contract, and to suggest new, alternative language」: 第 8 条的终止日从两周年改成一周年, 或者更早的最终文件签署日, 正好满足 Issue 栏 「expires after 1 year」. 但页面没有标注截图出自 Robin AI 的产品, 也没说右侧建议是 Claude 生成的, 还是按 playbook 规则给出的; 按钮上写的是 「View Playbook Suggestion」. 归属只能按版面位置推断, 页面本身没写明.

In addition to improving existing products, we are excited about the potential ofAI to transform digital media. We are proud to partner with [AssemblyAI](https://www.assemblyai.com/), an innovative AI company that is partnering with Anthropic to help power its platform ofAPIs that transcribe and understand audio data at scale. Dylan Fox, Founder & CEO of AssemblyAI, says, “We're thrilled to partner with a pioneering company like Anthropic whose commitment to AI integrity and research directly helps us ship more robust, LLM-backed Generative AI and Conversation Intelligence capabilities to our customers faster. We look forward to seeing this partnership propel ourAI initiatives forward.”

除了改进现有产品, 我们也看好 AI 改变数字媒体的潜力. 我们很自豪能与创新 AI 公司 [AssemblyAI](https://www.assemblyai.com/) 合作. 它借助 Anthropic 来驱动自己的 API 平台, 这些 API 能大规模地转写和理解音频数据. AssemblyAI 创始人兼 CEO Dylan Fox 说: "很高兴能与 Anthropic 这样的先锋公司合作. 它对 AI 可靠性和研究的投入, 直接帮我们更快地把更稳健的, 基于 LLM 的生成式 AI 和对话智能 (Conversation Intelligence) 能力交到客户手里. 我们期待这段合作推动我们的 AI 计划向前."

> **回看:** Claude 在 AssemblyAI 那里是直接处理音频吗?
> 页面没这么说. 原句是 AssemblyAI 的 API 「transcribe and understand audio data at scale」, Claude 参与的是 「LLM-backed Generative AI and Conversation Intelligence」 这部分. 回到第1页, Claude 的能力被写成 「conversational and text processing tasks」. 按本文, Claude 处理的是文本; 音频到文本这一步, 页面没有归到 Claude 名下.

We’re excited about the potential applications Claude can power across industries. If you think you could use the power ofAI to innovate, improve your offerings and better serve your customers, please request access to Claude and we’ll be in touch!

我们期待 Claude 能在各个行业里支撑起更多应用. 如果你觉得可以借助 AI 去创新, 改进产品, 更好地服务客户, 欢迎申请使用 Claude, 我们会与你联系!

## XE

(XE: 抽取残留的两个字母, 原页没有对应的正文含义, 不译.)

## Related content | 相关内容

Claude discovers a novel enzyme system with CRISPR-like repeats

Claude 发现一种带有类 CRISPR 重复序列的新型酶系统

<!-- page 6 of 10 -->

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

> **停一下:** 一篇 2023年3月14日 的公告, 为什么会出现 Claude Mythos 和生命科学实验室?
> 因为这份 PDF 是后来抓取的网页快照. 「Related content」 下的三条推荐, 以及第6页到第10页的站点导航和页脚, 都是抓取当时的页面内容; 页脚写着 「© 2026 Anthropic PBC」. 真正属于 Claude 发布公告的, 只有第1页到第5页 「request access to Claude and we’ll be in touch!」 为止. 上面那行 「## XE」 夹在正文和推荐区之间, 也不属于公告正文.

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

产品: Claude, Claude Code, Claude Code Enterprise (Claude Code 企业版), Claude Cowork, @Claude, Claude Design, Claude Science, Claude Security, Claude in Chrome (Chrome 里的 Claude), Claude for Microsoft 365 (面向 Microsoft 365 的 Claude), Skills (技能), Download app (下载应用), Pricing (定价), Log in to Claude (登录 Claude).

![Image block](images/p06-models.png)

图注: 页脚截图, 黑底白字. 最上方露出半行 「Read more」, 左上是 Anthropic 标志, 下面是 Products 一栏, 从 Claude 到 Log in to Claude 共 14 项, 与上方列表一致.

<!-- page 7 of 10 -->

## Models | 模型

[Mythos](https://www.anthropic.com/claude/mythos)

[Fable](https://www.anthropic.com/claude/fable)

[Opus](https://www.anthropic.com/claude/opus)

[Sonnet](https://www.anthropic.com/claude/sonnet)

[Haiku](https://www.anthropic.com/claude/haiku)

模型: Mythos, Fable, Opus, Sonnet, Haiku. 这五个都是模型系列名, 保留原文.

> **对一下:** 图片文件名写 p06-models, 画面里却是 Products 一栏, 那 Models 栏里有没有本文的 Claude 和 Claude Instant?
> 文件名是抽取时取了紧随其后的 「## Models」 标题, 画面实际是 Products 栏的 14 项. 第7页的 Models 栏列的是 Mythos, Fable, Opus, Sonnet, Haiku, 其中没有 Claude 或 Claude Instant. 第2页介绍的这两个版本名, 在快照当时的导航里已经找不到了; 读这篇公告时, 模型名以第2页正文为准.

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

[Small business](https://claude.com/solutions/small-business)

解决方案: AI agents (AI 智能体), Code modernization (代码现代化), Coding (编程), Commerce (商业), Customer support (客户支持), Cybersecurity (网络安全), Enterprise (企业), Financial services (金融服务), Government (政府), Healthcare (医疗), Higher education (高等教育), K-12 teachers (K-12 教师), Legal (法律), Life sciences (生命科学), Nonprofits (非营利组织), Sales (销售), Small business (小企业).

Claude Platform

[Overview](https://claude.com/platform/api)

[Developer docs](https://platform.claude.com/docs)

[Pricing](https://claude.com/pricing#api)

[Ecosystem](https://claude.com/ecosystem)

Claude 平台: Overview (概览), Developer docs (开发者文档), Pricing (定价), Ecosystem (生态).

<!-- page 8 of 10 -->

[Marketplace](https://claude.com/platform/marketplace)

[Regional compliance](https://claude.com/regional-compliance)

[Claude on AWS](https://claude.com/partners/claude-on-aws)

[Google Cloud](https://claude.com/partners/google-cloud-vertex-ai)

[Microsoft Foundry](https://claude.com/partners/microsoft-foundry)

[Console login](https://platform.claude.com/)

Claude 平台 (续): Marketplace (应用市场), Regional compliance (区域合规), Claude on AWS (AWS 上的 Claude), Google Cloud, Microsoft Foundry, Console login (控制台登录).

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

<!-- page 9 of 10 -->

## Company | 公司

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

> **核对:** 页脚里的 「Claude’s Constitution」 和 「Responsible Scaling Policy」, 能不能拿来说明 Claude 1 的训练方式?
> 不能. 它们只是快照当时页脚里的两个链接标题, 页面没有给正文, 也没有把它们和 2023 年的 Claude 或 Claude Instant 联系起来. 「Constitution」 这个词容易让人联想到 Constitutional AI, 但公告正文从头到尾没出现这个词. 关于 Claude 1 的训练, 本文能引用的只有第1页那句 「research into training helpful, honest, and harmless AI systems」.

Terms and policies

Privacy choices

[Privacy policy](https://www.anthropic.com/legal/privacy)

[Consumer health data privacy policy](https://www.anthropic.com/legal/consumer-health-data-privacy-policy)

[Responsible disclosure policy](https://www.anthropic.com/responsible-disclosure-policy)

[Terms of service: Commercial](https://www.anthropic.com/legal/commercial-terms)

[Terms of service: Consumer](https://www.anthropic.com/legal/consumer-terms)

[Terms of Service: US K-12](https://anthropic.com/legal/k12-terms)

[Data Processing Agreement: US K-12](https://anthropic.com/legal/k12-dpa)

[Usage policy](https://www.anthropic.com/legal/aup)

条款与政策: Privacy choices (隐私选项), Privacy policy (隐私政策), Consumer health data privacy policy (消费者健康数据隐私政策), Responsible disclosure policy (负责任披露政策), Terms of service: Commercial (服务条款: 商业版), Terms of service: Consumer (服务条款: 消费者版), Terms of Service: US K-12 (服务条款: 美国 K-12), Data Processing Agreement: US K-12 (数据处理协议: 美国 K-12), Usage policy (使用政策).

© 2026 Anthropic PBC

© 2026 Anthropic PBC, 版权所有.

<!-- page 10 of 10 -->
