<!-- page 1 of 9 -->

A

Announcements

公告

# Introducing computer use, a new Claude 3.5 Sonnet, and Claude 3.5 Haiku

Oct 22, 2024

2024 年 10 月 22 日

![Image block](images/p01-update-12-03-2024-we-have-revised-the-pricing-for.png)

Update (12/03/2024): We have revised the pricing for Claude 3.5 Haiku. The model is now priced at \$0.80 MTok input / \$4 MTok output.

更新 (12/03/2024): Claude 3.5 Haiku 的定价已调整. 现价为输入每百万 token \$0.80, 输出每百万 token \$4.

> **想:** 这条更新只给了 Haiku 修订后的价格, 修订前是多少, Sonnet 又是什么价?
> 本页没有写修订前的数值, 只有 「revised」 一词和新价 \$0.80 / \$4 per MTok. Sonnet 的价格在第 3 页也只以 「same price and speed as its predecessor」 带过, 没有具体金额.

Today, we’re announcing an upgraded Claude 3.5 Sonnet, and a new model, Claude 3.5 Haiku. The upgraded Claude 3.5 Sonnet delivers across-the-board improvements over its predecessor, with particularly significant gains in coding—an area where it already led the field. Claude 3.5 Haiku matches the performance of Claude 3 Opus, our prior largest model, on many evaluations at a similar speed to the previous generation of Haiku.

今天我们发布升级版 Claude 3.5 Sonnet, 以及新模型 Claude 3.5 Haiku. 升级版 Claude 3.5 Sonnet 相比前代全面进步, 编程方面提升尤其明显, 而编程本就是它领先的领域. Claude 3.5 Haiku 在许多评测上追平了我们上一代最大的模型 Claude 3 Opus, 速度则与上一代 Haiku 相当.

> **问:** 「matches Claude 3 Opus on many evaluations」 能在本页的基准表里核对吗?
> 不能. 第 2 页那张表的 7 列里没有 Claude 3 Opus. 第 3 页 Haiku 一节又写 「surpasses even Claude 3 Opus ... on many intelligence benchmarks」, 措辞从 「matches」 变成 「surpasses」, 但同样只说 「many」, 没给 Opus 的分数. 「similar speed」 也没有配速度数字.

<!-- page 2 of 9 -->

We’re also introducing a groundbreaking new capability in public beta: computer use. Available [today on the API](https://docs.anthropic.com/en/docs/build-with-claude/computer-use), developers can direct Claude to use computers the way people do—by looking at a screen, moving a cursor, clicking buttons, and typing text. Claude 3.5 Sonnet is the first frontierAI model to offer computer use in public beta. At this stage, it is still [experimental](https://www.anthropic.com/news/developing-computer-use)—at times cumbersome and error-prone. We're releasing computer use early for feedback from developers, and expect the capability to improve rapidly over time.

我们还以公开 beta 的形式推出一项全新能力: computer use. 它[今天已在 API 上可用](https://docs.anthropic.com/en/docs/build-with-claude/computer-use), 开发者可以让 Claude 像人一样用电脑: 看屏幕, 移光标, 点按钮, 打字. Claude 3.5 Sonnet 是第一个以公开 beta 提供 computer use 的前沿 AI 模型. 眼下它仍处于[实验阶段](https://www.anthropic.com/news/developing-computer-use), 有时笨拙, 也容易出错. 我们提前放出 computer use, 是为了收集开发者反馈, 预计这项能力会很快进步.

> **核对:** 「first frontier AI model to offer computer use in public beta」 这个 「first」 到底限定在哪?
> 限定语有三层: frontier AI model, computer use, public beta. 同一段紧接着承认它 「experimental」, 「cumbersome and error-prone」, 第 4 页又说当前能力 「imperfect」. 所以这里的 「first」 说的是以公开 beta 形式开放的先后, 不是能力成熟的先后.

Asana, Canva, Cognition, DoorDash, Replit, and The Browser Company have already begun to explore these possibilities, carrying out tasks that require dozens, and sometimes even hundreds, of steps to complete. For example, Replit is using Claude 3.5 Sonnet's capabilities with computer use and UI navigation to develop a key feature that evaluates apps as they’re being built for their Replit Agent product.

Asana, Canva, Cognition, DoorDash, Replit 和 The Browser Company 已经开始探索这些可能性, 执行需要几十步, 有时甚至几百步才能完成的任务. 例如, Replit 正利用 Claude 3.5 Sonnet 的 computer use 与 UI 导航能力, 为其 Replit Agent 产品开发一项关键功能: 在应用构建过程中对应用进行评估.

> **拆开:** 「dozens, and sometimes even hundreds, of steps」 说的是任务长度, 还是完成情况?
> 只是任务长度. 这句描述早期客户尝试的任务需要多少步, 没有给出这些任务的成功率. Replit 的例子里, computer use 的角色是在 Replit Agent 构建应用时去评估应用, 也就是让模型操作界面做检查, 页面同样没给效果数字.

The upgraded Claude 3.5 Sonnet is now available for all users. Starting today, developers can build with the computer use beta on the Anthropic API, Amazon Bedrock, and Google Cloud’s Vertex AI. The new Claude 3.5 Haiku will be released later this month.

升级版 Claude 3.5 Sonnet 现已向所有用户开放. 从今天起, 开发者可以在 Anthropic API, Amazon Bedrock 和 Google Cloud 的 Vertex AI 上使用 computer use beta 进行开发. 新的 Claude 3.5 Haiku 将于本月晚些时候发布.

|  | Claude 3.5 Sonnet (new) | Claude 3.5 Haiku | Claude 3.5 Sonnet | GPT-4o* | GPT-4o mini* | Gemini 1.5 Pro | Gemini 1.5 Flash |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Graduate level reasoningGPQA (Diamond) | 65.0%0-shot CoT | 41.6%0-shot CoT | 59.4%0-shot CoT | 53.6%0-shot CoT | 40.2%0-shot CoT | 59.1%0-shot CoT | 51.0%0-shot CoT |
| Undergraduate level knowledgeMMLUPro | 78.0%0-shot CoT | 65.0%0-shot CoT | 75.1%0-shot CoT | - | - | 75.8%0-shot CoT | 67.3%0-shot CoT |
| CodeHumanEval | 93.7%0-shot | 88.1%0-shot | 92.0%0-shot | 90.2%0-shot | 87.2%0-shot | - | - |
| Math problem-solvingMATH | 78.3%0-shot CoT | 69.2%0-shot CoT | 71.1%0-shot CoT | 76.6%0-shot CoT | 70.2%0-shot CoT | 86.5%4-shot CoT | 77.9%4-shot CoT |
| High school math competitionAIME 2024 | 16.0%0-shot CoT | 5.3%0-shot CoT | 9.6%0-shot CoT | 9.3%0-shot CoT | - | - | - |
| Visual Q/AMMMU | 70.4%0-shot CoT | - | 68.3%0-shot CoT | 69.1%0-shot CoT | 59.4%0-shot CoT | 65.9%0-shot CoT | 62.3%0-shot CoT |
| Agentic codingSWE-bench Verified | 49.0% | 40.6% | 33.4% | - | - | - | - |
| Agentic tool useTAU-bench | Retail69.2%Airline46.0% | Retail51.0%Airline22.8% | Retail62.6%Airline36.0% | - | - | - | - |

|  | Claude 3.5 Sonnet (新版) | Claude 3.5 Haiku | Claude 3.5 Sonnet | GPT-4o* | GPT-4o mini* | Gemini 1.5 Pro | Gemini 1.5 Flash |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 研究生水平推理 GPQA (Diamond) | 65.0%0-shot CoT | 41.6%0-shot CoT | 59.4%0-shot CoT | 53.6%0-shot CoT | 40.2%0-shot CoT | 59.1%0-shot CoT | 51.0%0-shot CoT |
| 本科水平知识 MMLUPro | 78.0%0-shot CoT | 65.0%0-shot CoT | 75.1%0-shot CoT | - | - | 75.8%0-shot CoT | 67.3%0-shot CoT |
| 代码 HumanEval | 93.7%0-shot | 88.1%0-shot | 92.0%0-shot | 90.2%0-shot | 87.2%0-shot | - | - |
| 数学解题 MATH | 78.3%0-shot CoT | 69.2%0-shot CoT | 71.1%0-shot CoT | 76.6%0-shot CoT | 70.2%0-shot CoT | 86.5%4-shot CoT | 77.9%4-shot CoT |
| 高中数学竞赛 AIME 2024 | 16.0%0-shot CoT | 5.3%0-shot CoT | 9.6%0-shot CoT | 9.3%0-shot CoT | - | - | - |
| 视觉问答 MMMU | 70.4%0-shot CoT | - | 68.3%0-shot CoT | 69.1%0-shot CoT | 59.4%0-shot CoT | 65.9%0-shot CoT | 62.3%0-shot CoT |
| Agentic 编程 SWE-bench Verified | 49.0% | 40.6% | 33.4% | - | - | - | - |
| Agentic 工具使用 TAU-bench | Retail69.2%Airline46.0% | Retail51.0%Airline22.8% | Retail62.6%Airline36.0% | - | - | - | - |

> **看表:** 这张表各列的 prompting 设置统一吗?
> 不统一. 多数格标 0-shot CoT, HumanEval 一行只标 0-shot, 不带 CoT; MATH 一行的两列 Gemini 标 4-shot CoT, 其余列是 0-shot CoT; SWE-bench Verified 和 TAU-bench 两行没有标设置. 所以 MATH 行里 Gemini 与 Claude, GPT-4o 的比较, 条件并不相同, 表本身把差别标在格内, 正文没有另作说明.

\* Our evaluation tables exclude OpenAl's o1 model family as they depend on extensive pre-response computation time, unlike typical models. This fundamental difference makes performance comparisons difficult.

\* 我们的评测表未纳入 OpenAI 的 o1 系列模型, 因为它们与一般模型不同, 依赖回答前大量的计算时间. 这一根本差异使性能比较难以进行.

> **停一下:** 脚注说 o1 因为 TestingTime 多花算力而不进表, 第 3 页却说新 Sonnet 在 SWE-bench Verified 上高于 o1-preview, 两处怎么对上?
> 两处的处理不一致. 脚注的理由是 o1 依赖 「extensive pre-response computation time」, 即 TestingTime 阶段多花算力, 所以表里不放. 第 3 页正文仍然把 「reasoning models like OpenAI o1-preview」 拿来与 49.0% 比较, 但 o1-preview 的分数没有出现在本页任何位置, 读者在本页核对不了这句.

<!-- page 3 of 9 -->

## Claude 3.5 Sonnet: Industry-leading software engineering skills

The updated [Claude 3.5 Sonnet](https://www.anthropic.com/claude/sonnet) shows wide-ranging improvements on industry benchmarks, with particularly strong gains in agentic coding and tool use tasks. On coding, it improves performance on [SWE-bench Verified](https://www.swebench.com/) from 33.4% to 49.0%, scoring higher than all publicly available models—including reasoning models like OpenAI o1-preview and specialized systems designed for agentic coding. It also improves performance on [TAU-bench](https://github.com/sierra-research/tau-bench), an agentic tool use task, from 62.6% to 69.2% in the retail domain, and from 36.0% to 46.0% in the more challenging airline domain. The new Claude 3.5 Sonnet offers these advancements at the same price and speed as its predecessor.

升级后的 [Claude 3.5 Sonnet](https://www.anthropic.com/claude/sonnet) 在业界基准上全面进步, agentic 编程与工具使用任务的提升尤为突出. 编程方面, 它在 [SWE-bench Verified](https://www.swebench.com/) 上从 33.4% 提升到 49.0%, 高于所有公开可用的模型, 包括 OpenAI o1-preview 这类推理模型, 以及专为 agentic 编程设计的系统. 在 agentic 工具使用任务 [TAU-bench](https://github.com/sierra-research/tau-bench) 上, 零售领域从 62.6% 提升到 69.2%, 更难的航空领域从 36.0% 提升到 46.0%. 新版 Claude 3.5 Sonnet 带来这些进步, 价格和速度与前代持平.

> **对一下:** 这段正文的三组增幅和表里的数对得上吗?
> 对得上. SWE-bench Verified 33.4% → 49.0%, TAU-bench retail 62.6% → 69.2%, airline 36.0% → 46.0%, 分别对应表中 「Claude 3.5 Sonnet」 与 「Claude 3.5 Sonnet (new)」 两列. 正文称 airline 「more challenging」, 表中新旧两版的 airline 分数都低于各自的 retail 分数, 方向一致.

Early customer feedback suggests the upgraded Claude 3.5 Sonnet represents a significant leap forAI-powered coding. GitLab, which tested the model for DevSecOps tasks, found it delivered stronger reasoning (up to 10% across use cases) with no added latency, making it an ideal choice to power multi-step software development processes. Cognition uses the new Claude 3.5 Sonnet for autonomous AI evaluations, and experienced substantial improvements in coding, planning, and problem-solving compared to the previous version. The Browser Company, in using the model for automating web-based workflows, noted Claude 3.5 Sonnet outperformed every model they’ve tested before.

早期客户反馈显示, 升级版 Claude 3.5 Sonnet 是 AI 编程的一次显著跃升. GitLab 用它做 DevSecOps 任务, 发现推理更强 (各用例最高提升 10%), 且没有增加延迟, 很适合驱动多步骤的软件开发流程. Cognition 用新版 Claude 3.5 Sonnet 做自主 AI 评估, 在编程, 规划和解决问题上比上一版有大幅改善. The Browser Company 用它自动化基于网页的工作流, 认为 Claude 3.5 Sonnet 胜过他们此前测过的所有模型.

> **再看:** GitLab 的 「up to 10% across use cases」 是什么指标上的 10%?
> 页面没说. 原句只有 「stronger reasoning (up to 10% across use cases)」, 没交代是准确率, 通过率还是相对提升, 也没说用例有多少个, 「up to」 表示这是最高值而非平均值. 同句的 「no added latency」 也没有配数字.

As part of our continued effort to partner with external experts, joint pre-deployment testing of the new Claude 3.5 Sonnet model was conducted by the US AI Safety Institute (US AISI) and the UK Safety Institute (UK AISI).

作为与外部专家持续合作的一部分, 美国 AI 安全研究所 (US AISI) 与英国安全研究所 (UK AISI) 对新版 Claude 3.5 Sonnet 进行了联合部署前测试.

> **回看:** US AISI 与 UK AISI 的联合部署前测试得出了什么?
> 本页没有写结果, 只写了测试由这两家机构进行. 紧接着的 ASL-2 判断写的是 「We also evaluated」, 即 Anthropic 自己的灾难性风险评估, 页面没有说明两者之间的关系. 另外原文英国机构写作 「UK Safety Institute」, 缩写仍是 UK AISI.

We also evaluated the upgraded Claude 3.5 Sonnet for catastrophic risks and found that the ASL-2 Standard, as outlined in our [Responsible Scaling Policy](https://www.anthropic.com/news/announcing-our-updated-responsible-scaling-policy), remains appropriate for this model.

我们还对升级版 Claude 3.5 Sonnet 做了灾难性风险评估, 结论是: 按我们 [Responsible Scaling Policy](https://www.anthropic.com/news/announcing-our-updated-responsible-scaling-policy) 的规定, ASL-2 标准对该模型依然适用.

> **想:** 「remains appropriate」 意味着防护等级有没有变化?
> 意味着没有升级, 仍停在 ASL-2. ASL-2 具体包含哪些措施, 本页没有展开, 需要看链接的 Responsible Scaling Policy. 本页也没有给出这次灾难性风险评估用了哪些评测.

## Claude 3.5 Haiku: State-of-the-art meets affordability and speed

[Claude 3.5 Haiku](https://www.anthropic.com/claude/haiku) is the next generation of our fastest model. For a similar speed to Claude 3 Haiku, Claude 3.5 Haiku improves across every skill set and surpasses even Claude 3 Opus, the largest model in our previous generation, on many intelligence benchmarks. Claude 3.5 Haiku is particularly strong on coding tasks. For example, it scores 40.6% on SWE-bench Verified, outperforming many agents using publicly available state-of-the-art models—including the original Claude 3.5 Sonnet and GPT-4o.

[Claude 3.5 Haiku](https://www.anthropic.com/claude/haiku) 是我们最快模型的新一代. 在与 Claude 3 Haiku 相近的速度下, Claude 3.5 Haiku 各项能力都有提升, 在许多智能基准上甚至超过上一代最大的模型 Claude 3 Opus. Claude 3.5 Haiku 在编程任务上尤其强. 例如它在 SWE-bench Verified 上得到 40.6%, 超过了许多基于公开最先进模型搭建的 agent, 其中包括原版 Claude 3.5 Sonnet 和 GPT-4o.

> **问:** Haiku 的 40.6% 胜过原版 Sonnet 和 GPT-4o, 这句能在表里核对几成?
> 只能核对一半. 原版 Claude 3.5 Sonnet 在表中 SWE-bench Verified 为 33.4%, 确实低于 40.6%; GPT-4o 这一格是 「-」, 本页没有它的分数. 另外原句比较的对象是 「agents using publicly available state-of-the-art models」, 比的是基于这些模型搭出来的 agent, 不是模型本身在同一套脚手架下的分数.

<!-- page 4 of 9 -->

With low latency, improved instruction following, and more accurate tool use, Claude 3.5 Haiku is well suited for user-facing products, specialized sub-agent tasks, and generating personalized experiences from huge volumes of data—like purchase history, pricing, or inventory records.

凭借低延迟, 更好的指令遵循和更准确的工具使用, Claude 3.5 Haiku 适合面向用户的产品, 专门的子 agent 任务, 以及从海量数据 (如购买记录, 定价或库存记录) 中生成个性化体验.

Claude 3.5 Haiku will be made available later this month across our first-partyAPI, Amazon Bedrock, and Google Cloud’s Vertex AI—initially as a text-only model and with image input to follow.

Claude 3.5 Haiku 将于本月晚些时候在我们的自有 API, Amazon Bedrock 和 Google Cloud 的 Vertex AI 上线, 起初只支持文本, 图像输入随后推出.

> **核对:** 「initially as a text-only model」 和表里的 Haiku 列对得上吗?
> 对得上. 表中 Haiku 的 MMMU (视觉问答) 一格是 「-」, 与发布时只支持文本一致. 第 2 页说 computer use 靠 「looking at a screen」, 第 4 页 OSWorld 成绩也标明是 screenshot-only 类别; 按这两处推断, 纯文本的 Haiku 在发布时用不上 computer use, 本页也只把 computer use 挂在 Claude 3.5 Sonnet 名下.

## Teaching Claude to navigate computers, responsibly

With computer use, we're trying something fundamentally new. Instead of making specific tools to help Claude complete individual tasks, we're teaching it general computer skills—allowing it to use a wide range of standard tools and software programs designed for people. Developers can use this nascent capability to automate repetitive processes, [build and test software](https://www.youtube.com/watch?v=vH2f7cjXjKI), and [conduct open-ended tasks like research](https://youtu.be/jqx18KgIzAE).

有了 computer use, 我们在尝试一种全新的做法. 我们不再为 Claude 的某个具体任务专门造工具, 而是教它通用的电脑技能, 让它能使用大量为人设计的标准工具和软件. 开发者可以用这项刚起步的能力自动化重复流程, [构建与测试软件](https://www.youtube.com/watch?v=vH2f7cjXjKI), 以及[执行调研这类开放式任务](https://youtu.be/jqx18KgIzAE).

To make these general skills possible, we've built an API that allows Claude to perceive and interact with computer interfaces. Developers can integrate this API to enable Claude to translate instructions (e.g., “use data from my computer and online to fill out this form”) into computer commands (e.g. check a spreadsheet; move the cursor to open a web browser; navigate to the relevant web pages; fill out a form with the data from those pages; and so on). On [OSWorld](https://os-world.github.io/), which evaluates AI models' ability to use computers like people do, Claude 3.5 Sonnet scored 14.9% in the screenshotonly category—notably better than the next-best AI system's score of 7.8%. When afforded more steps to complete the task, Claude scored 22.0%.

为了让这些通用技能成为可能, 我们构建了一个 API, 让 Claude 能感知并操作电脑界面. 开发者接入这个 API 后, Claude 可以把指令 (例如 「用我电脑里和网上的数据填好这张表」) 转成电脑命令 (例如查看电子表格; 移动光标打开浏览器; 进入相关网页; 用这些网页上的数据填表; 等等). [OSWorld](https://os-world.github.io/) 评测 AI 模型像人一样用电脑的能力, Claude 3.5 Sonnet 在 screenshot-only 类别中得到 14.9%, 明显高于第二名 AI 系统的 7.8%. 在允许用更多步完成任务时, Claude 得到 22.0%.

> **确认:** 这段对 API 本身交代到什么程度?
> 只交代了用途和一个例子: 把 「填表」 这类指令拆成查表格, 移光标开浏览器, 进网页, 填表等命令. 动作集合, 截图的获取方式, 坐标格式都没有写, 这些在第 2 页链接的 API 文档和 「developing computer use」 一文里, 不在本页.

> **停一下:** 「When afforded more steps」 多给了多少步, 第二名在同样条件下是多少?
> 两者都没给. 14.9% 对 7.8% 是 screenshot-only 类别下的比较; 22.0% 对应 「more steps」, 但步数上限没写, 第二名系统在更多步条件下的分数也没写, 所以 22.0% 只能和 Claude 自己的 14.9% 比.

While we expect this capability to improve rapidly in the coming months, Claude's current ability to use computers is imperfect. Some actions that people perform effortlessly—scrolling, dragging, zooming—currently present challenges for Claude and we encourage developers to begin exploration with low-risk tasks. Because computer use may provide a new vector for more familiar threats such as spam, misinformation, or fraud, we're taking a proactive approach to promote its safe deployment. We've developed new classifiers that can identify when computer use is being used and whether harm is occurring. You can read more about the research process behind this new skill, along with further discussion of safety measures, in our post on [developing computer use](http://anthropic.com/news/developing-computer-use).

我们预计这项能力会在未来几个月快速进步, 但 Claude 目前用电脑的能力并不完善. 一些人做起来毫不费力的动作, 比如滚动, 拖拽, 放大缩小, 目前对 Claude 仍有难度, 我们建议开发者先从低风险任务开始探索. computer use 可能为垃圾信息, 虚假信息, 欺诈这类常见威胁打开新的途径, 因此我们主动采取措施推动其安全部署. 我们开发了新的分类器, 能识别 computer use 何时被使用, 以及是否正在造成伤害. 关于这项新技能背后的研究过程和安全措施的更多讨论, 见我们的文章 [developing computer use](http://anthropic.com/news/developing-computer-use).

> **对一下:** 新分类器有没有给出识别率或拦截率?
> 没有. 页面只说分类器能识别 computer use 何时被使用, 以及是否在发生伤害, 列出的威胁类别是 spam, misinformation, fraud, 没有准确率, 召回率或拦截率, 也没有说识别后采取什么动作. 细节被指向 「developing computer use」 一文.

<!-- page 5 of 9 -->

## Looking ahead

Learning from the initial deployments of this technology, which is still in its earliest stages, will help us better understand both the potential and the implications of increasingly capable AI systems.

这项技术仍处在最早期, 从初期部署中学习, 能帮我们更好地理解能力日益增强的 AI 系统有什么潜力, 又会带来什么影响.

We’re excited for you to explore [our new models](https://assets.anthropic.com/m/1cd9d098ac3e6467/original/Claude-3-Model-Card-October-Addendum.pdf) and the public beta of computer use and welcome you to [share your feedback](mailto:feedback@anthropic.com) with us. We believe these developments will open up new possibilities for how you work with Claude, and we look forward to seeing what you'll create.

期待你来探索[我们的新模型](https://assets.anthropic.com/m/1cd9d098ac3e6467/original/Claude-3-Model-Card-October-Addendum.pdf)和 computer use 公开 beta, 也欢迎[向我们反馈](mailto:feedback@anthropic.com). 我们相信这些进展会为你与 Claude 的协作打开新的可能, 也期待看到你的作品.

## X

## Related content

相关内容

Claude discovers a novel enzyme system with CRISPR-like repeats

Claude 发现一种带有类 CRISPR 重复序列的新型酶系统

We’re announcing a new life sciences research group and laboratory at Anthropic. This post introduces the team behind this work and shares early results in which Claude discovered a novel enzyme system with properties reminiscent of CRISPR, with only high-level direction from our scientists.

我们宣布在 Anthropic 成立新的生命科学研究组和实验室. 本文介绍这项工作背后的团队, 并分享早期结果: 在科学家只给出高层方向的情况下, Claude 发现了一种性质让人联想到 CRISPR 的新型酶系统.

[Read more](https://www.anthropic.com/news/claude-discovers-novel-enzyme-system)

[阅读更多](https://www.anthropic.com/news/claude-discovers-novel-enzyme-system)

Partnering with Accenture on embedded evaluation

与 Accenture 合作开展嵌入式评估

[Read more](https://www.anthropic.com/news/accenture-embedded-evaluation)

[阅读更多](https://www.anthropic.com/news/accenture-embedded-evaluation)

Introducing the Life Sciences Verification Program

推出生命科学验证计划

The Life Sciences Verification Program (LSVP) gives life science professionals access to Claude Mythos, Opus, and Sonnet models with a refined set of safeguards more permissive for biology-related work.

生命科学验证计划 (LSVP) 为生命科学从业者提供 Claude Mythos, Opus 和 Sonnet 模型的访问权限, 配套一套经过调整, 对生物学相关工作更宽松的安全措施.

> **回看:** 一篇 2024-10-22 的公告, 为什么页面里会出现 Claude Mythos 和 「© 2026」?
> 「Related content」 这一块以及第 6-9 页的导航, 是抓取时站点的当前模板, 与这篇公告的内容无关; 第 9 页的 「© 2026 Anthropic PBC」 同样属于页脚. 公告正文到 「Looking ahead」 一节就结束了.

[Read more](https://www.anthropic.com/news/life-sciences-verification-program)

[阅读更多](https://www.anthropic.com/news/life-sciences-verification-program)

AI

<!-- page 6 of 9 -->

## Products

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

产品: Claude, Claude Code, Claude Code 企业版, Claude Cowork, @Claude, Claude Design, Claude Science, Claude Security, Chrome 中的 Claude, 面向 Microsoft 365 的 Claude, Skills, 下载应用, 定价, 登录 Claude.

Models

[Mythos](https://www.anthropic.com/claude/mythos)

[Fable](https://www.anthropic.com/claude/fable)

[Opus](https://www.anthropic.com/claude/opus)

[Sonnet](https://www.anthropic.com/claude/sonnet)

[Haiku](https://www.anthropic.com/claude/haiku)

模型: Mythos, Fable, Opus, Sonnet, Haiku.

Solutions

[AI agents](https://claude.com/solutions/agents)

[Code modernization](https://claude.com/solutions/code-modernization)

[Coding](https://claude.com/solutions/coding)

[Commerce](https://claude.com/solutions/commerce)

[Customer support](https://claude.com/solutions/customer-support)

[Cybersecurity](https://claude.com/solutions/cybersecurity)

[Enterprise](https://claude.com/solutions/enterprise)

解决方案: AI agents, 代码现代化, 编程, 商业, 客户支持, 网络安全, 企业.

<!-- page 7 of 9 -->

## [Financial services](https://claude.com/solutions/financial-services)

[Government](https://claude.com/solutions/government)

[Healthcare](https://claude.com/solutions/healthcare)

[Higher education](https://claude.com/solutions/education)

[K-12 teachers](https://claude.com/solutions/teachers)

[Legal](https://claude.com/solutions/legal)

[Life sciences](https://claude.com/solutions/life-sciences)

[Nonprofits](https://claude.com/solutions/nonprofits)

[Sales](https://claude.com/solutions/sales)

[Small business](https://claude.com/solutions/small-business)

金融服务, 政府, 医疗, 高等教育, K-12 教师, 法律, 生命科学, 非营利组织, 销售, 小企业.

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

Claude 平台: 概览, 开发者文档, 定价, 生态, 市场, 区域合规, AWS 上的 Claude, Google Cloud, Microsoft Foundry, 控制台登录.

Resources

[Blog](https://claude.com/blog)

[Claude partner network](https://claude.com/partners)

[Community](https://claude.com/community)

[Connectors](https://claude.com/connectors)

[Courses](https://academy.claude.com/)

[Customer stories](https://claude.com/customers)

资源: 博客, Claude 合作伙伴网络, 社区, 连接器, 课程, 客户案例.

<!-- page 8 of 9 -->

[Developer blog](https://claude.dev/)

[Engineering at Anthropic](https://www.anthropic.com/engineering)

[Events](https://www.anthropic.com/events)

[Plugins](https://claude.com/plugins)

[Powered by Claude](https://claude.com/partners/powered-by-claude)

[Service partners](https://claude.com/partners/services)

[Tutorials](https://claude.com/resources/tutorials)

[Use cases](https://claude.com/resources/use-cases)

开发者博客, Anthropic 工程博客, 活动, 插件, Powered by Claude, 服务合作伙伴, 教程, 用例.

Programs

[Startups](https://claude.com/programs/startups)

[Scientists](https://claude.com/programs/team-plan-for-scientists)

计划: 初创公司, 科学家.

Help and security

[Availability](https://www.anthropic.com/supported-countries)

[Status](https://status.anthropic.com/)

[Support center](https://support.claude.com/en/)

帮助与安全: 可用地区, 服务状态, 支持中心.

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

公司: Anthropic, 招聘, 领导团队, 政策, Economic Futures, 研究, 新闻, Claude 宪章, Claude Corps, Keep thinking, Policy on the AI Exponential, Responsible Scaling Policy.

<!-- page 9 of 9 -->

[Security and compliance](https://trust.anthropic.com/)

[Transparency](https://www.anthropic.com/transparency)

安全与合规, 透明度.

Terms and policies

[Privacy policy](https://www.anthropic.com/legal/privacy)

[Consumer health data privacy policy](https://www.anthropic.com/legal/consumer-health-data-privacy-policy)

[Responsible disclosure policy](https://www.anthropic.com/responsible-disclosure-policy)

[Terms of service: Commercial](https://www.anthropic.com/legal/commercial-terms)

[Terms of service: Consumer](https://www.anthropic.com/legal/consumer-terms)

[Terms of Service: US K-12](https://anthropic.com/legal/k12-terms)

[Data Processing Agreement: US K-12](https://anthropic.com/legal/k12-dpa)

[Usage policy](https://www.anthropic.com/legal/aup)

条款与政策: 隐私政策, 消费者健康数据隐私政策, 负责任披露政策, 服务条款: 商业, 服务条款: 消费者, 服务条款: 美国 K-12, 数据处理协议: 美国 K-12, 使用政策.

© 2026 Anthropic PBC

版权所有 © 2026 Anthropic PBC

![Image block](images/p09-image.png)
