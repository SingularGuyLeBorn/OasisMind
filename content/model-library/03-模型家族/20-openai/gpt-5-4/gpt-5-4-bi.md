---
title: "GPT-5.4 · 对照译稿"
category: "模型库"
tags: ["OpenAI", "对照译稿"]
published: true
excerpt: "GPT-5.4 公开材料的逐段中英对照译稿，附读报告时的疑问块。"
---
<!-- page 1 of 19 -->

OpenAI

页眉: OpenAI.

0

(单独的 「0」 是页面分享图标被识别成的字符, 没有含义.)

**March 5, 2026** [**Product**](https://openai.com/news/product-releases/) [**Release**](https://openai.com/research/index/release/)

**2026 年 3 月 5 日** 产品 发布

# Introducing GPT‑5.4 (推出 GPT-5.4)

Designed for professional work

为专业工作而设计

**Listen to article 16:51 Share**

**收听本文 16:51 分享**

Today, we’re releasing **GPT**‑5.4 in ChatGPT (as GPT‑5.4 Thinking), the API, and Codex. It’s our most capable and efficient frontier model for professional work. We’re also releasing **GPT**‑**5.4 Pro** in ChatGPT and the API, for people who want maximum performance on complex tasks.

今天, 我们在 ChatGPT (以 GPT-5.4 Thinking 的名义), API 和 Codex 中发布 **GPT-5.4**. 这是我们面向专业工作能力最强, 效率最高的前沿模型. 我们同时在 ChatGPT 和 API 中发布 **GPT-5.4 Pro**, 给想在复杂任务上拿到最高性能的人.

GPT‑5.4 brings together the best of our recent advances in reasoning, coding, and agentic workflows into a single frontier model. It incorporates the industry-leading coding capabilities of while improving how the model works across[GPT‑5.3‑Codex](https://openai.com/index/introducing-gpt-5-3-codex/) tools, software environments, and professional tasks involving spreadsheets, presentations, and documents. The result is a model that gets complex real work done accurately, effectively, and efficiently—delivering what you asked for with less back and forth.

GPT-5.4 把我们近期在推理, 编程和 Agent 工作流上最好的进展合进同一个前沿模型. 它吸收了 GPT-5.3-Codex 业界领先的编程能力, 同时改进了模型在工具, 软件环境, 以及涉及电子表格, 演示文稿和文档的专业任务中的表现. 结果是一个能把复杂的真实工作做得准确, 有效, 高效的模型: 交付你要的东西, 来回沟通更少. (MinerU 把 GPT-5.3-Codex 的链接挪到了 「across」 之后, 句子读起来缺了宾语; PDF 里 「capabilities of」 后面接的就是 GPT-5.3-Codex.)

In ChatGPT, GPT‑5.4 Thinking can now provide an upfront plan of its thinking, so you can **adjust course mid-response** while it’s working, and arrive at a final output that’s more closely aligned with what you need without additional turns. GPT‑5.4 Thinking also improves **deep web research,** particularly for highly specific queries, while **better maintaining context** for questions that require longer thinking. Together, these improvements mean higher-quality answers that arrive faster and stay relevant to the task at hand.

在 ChatGPT 里, GPT-5.4 Thinking 现在可以先给出一份思考计划, 你可以在它工作时**中途调整方向**, 最终得到更贴近需求的结果, 不必再追加几轮对话. GPT-5.4 Thinking 也改进了**深度网页调研**, 对很具体的查询尤其明显, 同时在需要长时间思考的问题上**更好地保持上下文**. 这些改进合起来, 意味着答案质量更高, 来得更快, 也更贴合手头的任务.

In Codex and the API, GPT‑5.4 is the first general-purpose model we’ve released with native, state-of-the-art **computer-use capabilities**, enabling agents to operate computers and carry out complex workflows across applications. It supports up to 1M

在 Codex 和 API 里, GPT-5.4 是我们发布的第一个具备原生, 业界最佳**计算机使用能力**的通用模型, 让 Agent 能操作计算机, 跨应用执行复杂工作流. 它支持最多 1M

> **想:** 「It supports up to 1M」 停在这里, 1M 指什么, 后面还说了什么?
> Markdown 在 「1M」 之后直接进了 Cookie 横幅, 只剩 「search, helping agents find and use the right tools more」 和 「fewer tokens to solve problems when compared to GPT‑5.2」 两段残片. 对照 PDF 第 1 页, 原文是 1M tokens 的上下文, 让 Agent 能在长周期里规划, 执行和验证任务; 接着介绍 tool search; 最后说 GPT-5.4 是 OpenAI 迄今 token 效率最高的推理模型, 与 GPT-5.2 相比解题所用 token 显著更少. 「显著更少」 没有给数字, 全页也没有再量化. 另外, 1M 在第 14 页被限定为 Codex 里的 「experimental support」, 标准窗口是 272K.

## We use cookies (我们使用 Cookie)

across s tems of on th too preferences anytime. View our [Cookie Policy](https://openai.com/policies/cookie-policy/) for more info. search, helping agents find and use the right <s><strong>tool</strong></s>s more

(这一段是 Cookie 横幅和正文残片搅在一起. 正文按 PDF 补全: ...tokens 的上下文, 让 Agent 能在长周期里规划, 执行并验证任务. GPT-5.4 还借助 tool search 改进了模型在大型工具与连接器生态中的工作方式, 帮 Agent 更高效地找到并使用合适的工具, 同时不牺牲智能. 横幅部分: 可随时修改偏好, 更多信息见我们的 Cookie 政策. 「tool」 上的删除线是抽取残留.)

fewer tokens to solve problems when compared to GPT‑5.2—**Reject non-essential**

最后, GPT-5.4 是我们 token 效率最高的推理模型, 与 GPT-5.2 相比, 解决问题所用的 token 显著更少, 带来更低的 token 用量和更快的速度. (前半句按 PDF 补全; 「Reject non-essential」 是 Cookie 横幅按钮: 拒绝非必要 Cookie.)

Accept all

全部接受 (Cookie 横幅按钮).

<!-- page 2 of 19 -->

Knowledge work tasks

知识工作任务 (这是本页 GDPval 图的标题, 被抽到了页首.)

OpenAI

页眉: OpenAI.

professional knowledge work, GPT‑5.4 enables more reliable agents, faster developer workflows, and higher-quality outputs across ChatGPT, the API, and Codex.

加上通用推理, 编程和专业知识工作上的进步, GPT-5.4 让 ChatGPT, API 和 Codex 里的 Agent 更可靠, 开发者工作流更快, 产出质量更高. (句首 「Together with advances in general reasoning, coding, and」 在 Markdown 里丢了, 按 PDF 补回.)

|  | GPT 5.4 | GPT 5.3 Codex | GPT 5.2 |
| --- | --- | --- | --- |
| GDPval(wins | 83.0% | 70.9% | 70.9% |
| orties) |  |  |  |
| SWE-BenchPro | 57.7% | 56.8% | 55.6% |
| (Public) |  |  |  |
| OSWorld-Veri ed | 75.0% | 74.0%* | 47.3% |
| Toolathlon | 54.6% | 51.9% | 46.3% |
| BrowseComp | 82.7% | 77.3% | 65.8% |

表: 五项评测, 三列依次是 GPT-5.4, GPT-5.3-Codex, GPT-5.2. GDPval (胜或平): 83.0%, 70.9%, 70.9%. SWE-Bench Pro (Public): 57.7%, 56.8%, 55.6%. OSWorld-Verified: 75.0%, 74.0%*, 47.3%. Toolathlon: 54.6%, 51.9%, 46.3%. BrowseComp: 82.7%, 77.3%, 65.8%. (「orties」 是 「or ties」 被拆行后的残字, 「Veri ed」 缺了 fi 连字.)

> **看表:** GDPval 一行, GPT-5.3-Codex 和 GPT-5.2 都是 70.9%, 是不是抄重了?
> 第 15 页评测总表里 GPT-5.3-Codex 的 GDPval 同样是 70.9%, 被截断的 GPT-5.2 列显示 「70」, 与本页正文 「70.9% for GPT‑5.2」 对得上. 两张表互相一致, 不是 MinerU 抄错, 页面确实给两个模型印了同一个数. 是巧合还是原表填错, 本页没有依据判断. 第 5 页 ChatGPT Atlas Agent Mode 在 Online-Mind2Web 上也是 70.9%, 三处同数, 读的时候容易串.

\*Previously reported as 64.7%. GPT‑5.3‑Codex achieves 74.0% with a newly introduced API parameter that preserves the original image resolution.fi

\*此前报告为 64.7%. GPT-5.3-Codex 借助一个新推出的, 保留原始图像分辨率的 API 参数, 达到 74.0%. (句末 「fi」 是 「Verified」 的连字残片.)

> **核对:** OSWorld-Verified 上 GPT-5.4 对 GPT-5.3-Codex 是 75.0% 对 74.0%, 可 GPT-5.3-Codex 原来报的是 64.7%?
> 差出来的 9.3 个百分点来自测法: 74.0% 是打开 「保留原始图像分辨率」 参数后重测的结果. 表里只差 1.0 个点的这组比较, 前提是 GPT-5.3-Codex 用上了这个参数; 若按 GPT-5.3-Codex 原先公布的口径, 差距是 10.3 个点. GPT-5.4 自己的 75.0% 是否也开了原始分辨率, 本页没写.

## Knowledge work (知识工作)

Building on GPT‑5.2’s general reasoning capabilities, GPT‑5.4 delivers even more consistent and polished results on real-world tasks that matter to professionals.

在 GPT-5.2 通用推理能力的基础上, GPT-5.4 在对专业人士要紧的真实任务上, 给出更稳定, 更完善的结果.

On , which tests agents’ abilities to produce well-specified[GDPval](https://openai.com/index/gdpval/) knowledge work across 44 occupations, GPT‑5.4 achieves a new state of the art, matching or exceeding industry professionals in 83.0% of comparisons, compared to 70.9% for GPT‑5.2.

在 GDPval 上 (它测试 Agent 在 44 种职业中产出明确规定的知识工作的能力), GPT-5.4 创下新的最高水平, 在 83.0% 的比较中达到或超过行业专业人士, GPT-5.2 是 70.9%. (GDPval 的链接被 MinerU 挪到了句中.)

GDPval

GDPval (图题).

![Chart block](images/p02-we-use-cookies.png)

图: GDPval 知识工作任务, 纵轴是对行业专业人士的胜率, 深色为胜, 浅色为平, 虚线是行业专家基线. 四根柱依次为 GPT-5.4 Pro, GPT-5.4, GPT-5.2 Pro, GPT-5.2, 胜加平分别为 82.0%, 83.0%, 74.1%, 70.9%, 其中胜分别为 69.2%, 70.8%, 60.0%, 49.8%. 文件名里的 「we-use-cookies」 是抽取时撞上横幅起的名, 图里没有 Cookie 内容.

> **拆开:** 图里 GPT-5.4 Pro 是 82.0%, 比 GPT-5.4 的 83.0% 还低, Pro 不是更强吗?
> 按胜和平拆开: GPT-5.4 Pro 胜 69.2%, 平 12.8%; GPT-5.4 胜 70.8%, 平 12.2%; GPT-5.2 Pro 胜 60.0%, 平 14.1%; GPT-5.2 胜 49.8%, 平 21.1%. Pro 在胜和总数上都略低于 GPT-5.4, 差 1.0 到 1.6 个点, 页面没解释. GPT-5.2 那根柱也值得看: 单看 「胜」 只有 49.8%, 在基线之下, 70.9% 里有 21.1 个点是平局. 从 GPT-5.2 到 GPT-5.4, 总分涨 12.1 个点, 胜率涨了 21.0 个点, 平局少了 8.9 个点.

## We use cookies (我们使用 Cookie)

We use cookies to help this site function, understand service usage, and support marketing efforts. Visit preferences anytime. View our [Cookie Policy](https://openai.com/policies/cookie-policy/) for more info.

(Cookie 横幅: 我们使用 Cookie 来维持网站运行, 了解服务使用情况, 支持营销工作. 可随时修改偏好. 更多信息见我们的 Cookie 政策.)

In GDPval, models attempt well-specified knowledge work spanning 44 occupations from the top 9 industries contributing to U.S. GDP. Tasks request real work products, such as sales presentations, accounting spreadsheets, urgent care schedules, manufacturing diagrams, or short videos. Reasoning

在 GDPval 中, 模型要完成明确规定的知识工作, 覆盖对美国 GDP 贡献最大的 9 个行业中的 44 种职业. 任务要求交付真实的工作成果, 比如销售演示文稿, 会计电子表格, 紧急护理排班表, 制造流程图或短视频. 推理 (句子在 「Reasoning」 处断开.)

<!-- page 3 of 19 -->

OpenAI

页眉: OpenAI.

> **确认:** 上一页末尾的 「Reasoning」 后面接的是什么?
> Markdown 这一页没有接上. PDF 第 3 页左上是这句图注的后半: 「effort was set to xhigh for GPT‑5.4 and heavy for GPT‑5.2 (a slightly lower level in ChatGPT)」. GDPval 的 83.0% 对 70.9%, 两边推理强度不同: GPT-5.4 用 xhigh, GPT-5.2 用 heavy, 页面自己说 heavy 在 ChatGPT 里是 「稍低一档」. 第 18 页的总说明 「Evals were run with reasoning effort set to xhigh, except where specified otherwise」 在这里正好是 「另有说明」 的例外.

Mercor Walleye Capital Fundamental Research Labs Rogo Balyasny Asset Management

客户标签: Mercor, Walleye Capital, Fundamental Research Labs, Rogo, Balyasny Asset Management (页面上可切换的客户引言).

# “GPT-5.4 is the best model we’ve ever tried. It’s now top of the leaderboard on our APEX-Agents benchmark, which measures model performance for professional services work. It excels at creating longhorizon deliverables such as slide decks, financial models, and legal analysis, delivering top performance while running faster and at a lower cost than competitive frontier models.” ("GPT-5.4 是我们试过的最好的模型. 它现在在我们的 APEX-Agents 基准排行榜上居首, 这个基准衡量模型做专业服务工作的表现. 它擅长做长周期交付物, 比如幻灯片, 财务模型和法律分析, 表现顶尖, 同时比其他有竞争力的前沿模型跑得更快, 成本更低.")

**— Brendan Foody, CEO at Mercor**

**— Brendan Foody, Mercor CEO**

We put a particular focus on improving GPT‑5.4’s ability to create and edit spreadsheets, presentations, and documents. On an internal benchmark of spreadsheet modeling tasks that a junior investment banking analyst might do, GPT‑5.4 achieves a mean score of 87.3%, compared to 68.4% for GPT‑5.2. On a set of presentation evaluation prompts, human raters preferred presentations from GPT‑5.4 68.0% of the time over those from GPT‑5.2 due to stronger aesthetics, greater visual variety, and more effective use of image generation.

我们特别着力提升 GPT-5.4 创建和编辑电子表格, 演示文稿和文档的能力. 在一个内部基准上 (内容是初级投行分析师可能要做的电子表格建模任务), GPT-5.4 平均得分 87.3%, GPT-5.2 是 68.4%. 在一组演示文稿评测提示上, 人类评审有 68.0% 的时候更喜欢 GPT-5.4 做的演示文稿, 而不是 GPT-5.2 的, 理由是审美更好, 视觉变化更丰富, 图像生成用得更有效.

> **回看:** 87.3% 对 68.4% 是正文的说法, 第 15 页总表里同一项还有别的列吗?
> 第 15 页 「Investment Banking Modeling Tasks (Internal)」 一行: GPT-5.4 87.3%, GPT-5.4 Pro 83.6%, GPT-5.3-Codex 79.3%, GPT-5.2 列被截成 「6」, 与 68.4% 对得上. 和 GDPval 一样, Pro 又比 GPT-5.4 低, 这回低 3.7 个点. 页面把 GPT-5.4 叫作 「most capable」, 把 Pro 定位为 「maximum performance on complex tasks」, 可在这两项专业工作评测上 Pro 都没占先.

![Image block](images/p03-we-use-cookies.png)

图: 电子表格, 文档, 演示文稿三个标签, 当前选中电子表格. 左边标 GPT-5.4, 右边标 GPT-5.2, 两张都是美国西南部国家公园自驾行程的 Excel 截图, 字很小, 只能大致辨认标题; 下半部分被 Cookie 横幅挡住. 文件名里的 「we-use-cookies」 同样来自横幅.

## We use cookies (我们使用 Cookie)

Documents were generated with reasoning effort set to xhigh

文档是在推理强度设为 xhigh 时生成的. (这是上图的图注, 被抽到了横幅标题下面.)

<!-- page 4 of 19 -->

OpenAI

页眉: OpenAI.

or Pro. If you’re an Enterprise customer, we recommend using our newly released , which was also[ChatGPT for Excel add-in](https://chatgpt.com/apps/spreadsheets/?openaicom-did=2d05d6e2-4ca1-49b5-9363-44653b44abe7&openaicom_referred=true) launched today. We've also updated our and[spreadsheet](https://github.com/openai/skills/tree/main/skills/.curated/spreadsheet) available in Codex and the API.[presentation skills](https://github.com/openai/skills/tree/main/skills/.curated/slides)

...或 Pro 里试用这些能力. 如果你是 Enterprise 客户, 我们推荐使用今天同时推出的 ChatGPT for Excel 插件. 我们还更新了 Codex 和 API 中可用的电子表格技能和演示文稿技能. (句首 「You can try these capabilities in ChatGPT using GPT‑5.4 Thinking」 在 Markdown 里丢了; 三个链接也都被挪了位置.)

To make GPT‑5.4 better at real-world work, we continued our progress at driving down hallucinations and errors. GPT‑5.4 is our most factual model yet: on a set of de-identified prompts where users flagged factual errors, GPT‑5.4’s individual claims are 33% less likely to be false and its full responses are 18% less likely to contain any errors, relative to GPT‑5.2.

为了让 GPT-5.4 在真实工作中更好用, 我们继续压低幻觉和错误. GPT-5.4 是我们迄今最符合事实的模型: 在一组去标识化的, 用户标记过事实错误的提示上, 与 GPT-5.2 相比, GPT-5.4 单条陈述为假的可能性低 33%, 整条回答含有任何错误的可能性低 18%.

> **停一下:** 单条陈述出错少了 33%, 整条回答出错却只少了 18%, 两个数对得上吗?
> 不矛盾, 但页面没给能换算的底数. 一条回答里有很多条陈述, 只要其中一条错, 整条就算 「含错」. 单条错误率降三分之一时, 如果每条回答平均的陈述条数多, 或者 GPT-5.4 的回答更长, 含错回答的比例就降得少. 两个数都是相对 GPT-5.2 的降幅, 页面没给 GPT-5.2 的绝对错误率, 也没说提示集有多少条, 「most factual」 的幅度折算不成绝对值.

**Harvey**

**Thomson Reuters**

**Notion**

**HockeyStack**

**Legora**

**Clio**

客户标签: Harvey, Thomson Reuters, Notion, HockeyStack, Legora, Clio.

# “GPT-5.4 sets a new bar for document-heavy legal work. On our BigLaw Bench eval, it scored 91%. Compared to other models, GPT-5.4 is currently better at structuring complex transactional analysis, maintaining accuracy across lengthy contracts, and delivering the high level of detail legal practitioners require.” (「GPT-5.4 为重文档的法律工作立了新标杆. 在我们的 BigLaw Bench 评测上它得了 91%. 和其他模型相比, GPT-5.4 目前更擅长组织复杂的交易分析, 在冗长合同中保持准确, 并给出法律从业者要求的高度细节.」)

**— Niko Grupen, Head of Applied Research at Harvey**

**— Niko Grupen, Harvey 应用研究负责人**

## Computer use and vision (计算机使用与视觉)

GPT‑5.4 is our first general-purpose model with native **computeruse capabilities** and marks a major step forward for developers and agents alike. It’s the best model currently available for developers building agents that complete real tasks across websites and software systems.

GPT-5.4 是我们第一个具备原生**计算机使用能力**的通用模型, 对开发者和 Agent 都是一大步. 对要构建能在网站和软件系统里完成真实任务的 Agent 的开发者来说, 它是目前能用到的最好模型.

We’ve designed GPT‑5.4 to be performant across a wide range of computer-use workloads. It is excellent at writing code to operate computers via libraries like Playwright, as well as issuing mouse and keyboard commands in response to screenshots. Its behavior

我们让 GPT-5.4 在各类计算机使用负载下都有良好表现. 它很擅长写代码, 通过 Playwright 这类库操作计算机, 也擅长根据截图发出鼠标和键盘指令. 它的行为 (句子在此被横幅打断.)

## We use cookies (我们使用 Cookie)

adjust behavior to suit particular use cases. Developers can even We use cookies to help this site function, understand service usage, and support marketing efforts. Visit to change [co](https://openai.com/policies/cookie-policy/)nfigure the model’s safety behavior to suit different levels ofpreferences anytime. View our [Cookie Policy](https://openai.com/policies/cookie-policy/) for more info. risk tolerance by specifying custom confirmation policies.

...可以通过开发者消息 (developer messages) 引导, 也就是说开发者可以按具体用途调整行为. 开发者甚至可以通过指定自定义确认策略, 让模型的安全行为适配不同的风险承受水平. (「is steerable via developer messages, meaning that developers can」 这半句 Markdown 丢了, 按 PDF 补; 中间夹着 Cookie 横幅, 同上.)

The model’s performance and flexibility are reflected across benchmarks that test computer use across different settings. On **OSWorld-Verified**, which measures a model’s ability to navigate a desktop environment through screenshots and keyboard/mouse

模型的性能和灵活性体现在多个测试不同场景下计算机使用的基准上. **OSWorld-Verified** 衡量模型通过截图和键盘/鼠标 (句子跨到下一页.)

<!-- page 5 of 19 -->

OpenAI

页眉: OpenAI.

performance at 72.4%.<strong><sup>1</sup></strong>

...表现 72.4%.¹ (按 PDF 补全整句: ...操作在桌面环境中导航的能力, GPT-5.4 在上面拿到业界最佳的 75.0% 成功率, 远超 GPT-5.2 的 47.3%, 也超过了 72.4% 的人类表现.¹)

> **再看:** 72.4% 是 GPT-5.4 在 OSWorld-Verified 上的成绩吗?
> 不是. 这一行只剩句尾. PDF 第 5 页开头是 "actions, GPT‑5.4 achieves a state-of-the-art 75.0% success rate, far exceeding GPT‑5.2's 47.3%, and surpassing human performance at 72.4%". 72.4% 是人类表现, 脚注 1 指向 OSWorld 原论文 (第 18 页). GPT-5.4 是 75.0%, 比人类高 2.6 个点, 比 GPT-5.2 高 27.7 个点, 与第 2 页表格一致.

On **WebArena-Verified**, which tests browser use, GPT‑5.4

在测试浏览器使用的 **WebArena-Verified** 上, GPT-5.4

achieves a leading 67.3% success rate when using both DOM-

拿到领先的 67.3% 成功率, 条件是同时使用 DOM

and screenshot-driven interaction, compared to GPT‑5.2’s 65.4%.

和截图驱动的交互, GPT-5.2 是 65.4%.

On **Online-Mind2Web**, which also tests browser use, GPT‑5.4

在同样测试浏览器使用的 **Online-Mind2Web** 上, GPT-5.4

achieves a 92.8% success rate using screenshot-based

拿到 92.8% 的成功率, 用的是基于截图的

observations alone, improving over ChatGPT Atlas’s Agent Mode,

观察, 没有别的输入, 超过了 ChatGPT Atlas 的 Agent 模式,

which achieves a success rate of 70.9%.

后者成功率为 70.9%.

> **对一下:** Online-Mind2Web 的对照组怎么换成了 ChatGPT Atlas 的 Agent Mode?
> 这一段三组数的对照对象不一样: OSWorld-Verified 和 WebArena-Verified 都拿 GPT-5.2 比, Online-Mind2Web 拿的是 ChatGPT Atlas 的 Agent 模式, 一个产品. GPT-5.4 在这里 「只用截图」, Atlas Agent 模式用什么观察方式, 背后是哪个模型, 本页没写. 92.8% 对 70.9% 的 21.9 个点里, 混着模型差异和产品配置差异, 不能当作 GPT-5.4 对 GPT-5.2 的提升来读. 同一段里 WebArena-Verified 对 GPT-5.2 只高 1.9 个点, 两处幅度差很多.

**A tool yield is when an assistant yields to await tool responses. If 3 tools are called in parallel, followed by 3 more tools called in parallel, the number of yields would be 2. Tool yields are a better proxy of latency than tool calls because they reflect the benefits of parallelization.**

**一次工具让出 (tool yield) 指助手暂停下来, 等待工具返回. 如果先并行调用 3 个工具, 再并行调用 3 个, 让出次数就是 2. 工具让出比工具调用次数更能代表延迟, 因为它体现了并行化的好处.** (这条注释在第 11 页原样再出现一次; 放在这一页时, 它对应的图没有被抽出来.)

**Email & calendar**

**邮件与日历** (演示标签)

**Bulk data entry**

**批量数据录入** (演示标签)

## We use cookies (我们使用 Cookie)

We use cookies to help this site function, understand service usage, and support marketing efforts. Visit preferences anytime. View our [Cookie Policy](https://openai.com/policies/cookie-policy/) for more info.

(Cookie 横幅, 同上.)

to change

(横幅残字, 原句是 「Visit Manage Cookies to change preferences anytime」 的一部分.)

<!-- page 6 of 19 -->

OpenAI

页眉: OpenAI.

GPT‑5.4’s improved computer use is built on the model’s improved general visual perception capabilities. On **MMMU-Pro**, a test of a model’s visual understanding and reasoning, GPT‑5.4 achieves an 81.2% success rate without tool use, an improvement over GPT‑5.2’s 79.5%. Improved visual perception also translates into better document parsing capabilities. On **OmniDocBench**, GPT‑5.4 without reasoning effort achieves an average error (measured by normalized edit distance between model prediction and ground truth) of 0.109, improved from GPT‑5.2’s 0.140.

GPT-5.4 计算机使用能力的提升, 建立在模型整体视觉感知能力提升的基础上. 在测试视觉理解与推理的 **MMMU-Pro** 上, GPT-5.4 不用工具时成功率 81.2%, 高于 GPT-5.2 的 79.5%. 视觉感知的提升也带来更好的文档解析能力. 在 **OmniDocBench** 上, 不开推理的 GPT-5.4 平均误差 (用模型预测与真值之间的归一化编辑距离衡量) 为 0.109, GPT-5.2 是 0.140.

**MMMUPro was run with reasoning effort set to xhigh. OmniDocBench was run with reasoning effort set to none, to reflect low-cost, low-latency performance.**

**MMMU-Pro 以 xhigh 推理强度运行. OmniDocBench 以推理强度 none 运行, 用来反映低成本, 低延迟下的表现.**

We’re also improving visual understanding for dense, highresolution images where full fidelity matters. Starting with GPT‑5.4, we’re introducing an original image level[input detail](https://developers.openai.com/api/docs/guides/images-vision/#specify-image-input-detail-level) which supports full-fidelity perception up to 10.24M total pixels or 6000-pixel maximum dimension, whichever is lower; the high image input detail level now supports up to 2.56M total pixels or a 2048-pixel maximum dimension. In early testing with API users, we observed strong gains in localization ability, image understanding, and click accuracy when using original or high detail.

我们也在改进对密集的高分辨率图像的视觉理解, 这类图像要求完整保真. 从 GPT-5.4 开始, 我们引入 original 图像输入细节级别, 支持最多 10.24M 总像素或最长边 6000 像素的完整保真感知, 以两者中更低的为准; high 图像输入细节级别现在支持最多 2.56M 总像素或最长边 2048 像素. 在 API 用户的早期试用中, 我们观察到使用 original 或 high 细节时, 定位能力, 图像理解和点击准确率都有明显提升. (「input detail」 的链接被挪到了 「level」 之后.)

> **拆开:** 「10.24M 总像素或最长边 6000 像素, 取更低者」, 两个上限哪个先起作用?
> 6000×6000 是 36M 像素, 远超 10.24M, 所以方图总是总像素先封顶, 10.24M 相当于 3200×3200. 最长边 6000 要先起作用, 短边须不超过 10.24M/6000 ≈ 1707 像素, 也就是长宽比约 3.5:1 以上的长条图. high 级别同理: 2.56M 相当于 1600×1600, 2048 的边长上限只在长宽比超过约 1.64:1 时先生效. 页面说 original 级别 「从 GPT-5.4 开始」 引入, 可第 2 页脚注里 GPT-5.3-Codex 的 74.0% 就是用 「新推出的保留原始图像分辨率的 API 参数」 测的, 两处怎么衔接, 本页没交代.

## We use cookies (我们使用 Cookie)

We use cookies to help this site function, understand service usage, and support marketing efforts. Visit **Mainstay**preferences anytime. View our [Cookie Policy](https://openai.com/policies/cookie-policy/) for more info. **Momentic Pace**

(Cookie 横幅, 同上. 夹在里面的 Mainstay, Momentic, Pace 是客户引言标签. PDF 本页还有一段视频说明, Markdown 没抓到: GPT-5.4 读取浏览器界面的截图, 通过基于坐标的点击与 UI 元素交互, 发送邮件并安排日历事件, 视频没有加速.)

to change

(横幅残字.)

**“In our evals measuring computer use performance across \~30K HOA and property tax portals, GPT-5.4 achieved a 95% success rate on the first attempt**

**"在我们衡量约 30K 个 HOA (业主协会) 和物业税门户网站上计算机使用表现的评测中, GPT-5.4 首次尝试成功率达到 95%**

<!-- page 7 of 19 -->

OpenAI

页眉: OpenAI.

# 79% with prior CUA models. It also completed sessions \~3x faster while using \~70% fewer tokens, materially improving reliability and cost efficiency at scale.「 (...此前的 CUA 模型为 79%. 它完成会话的速度还快了约 3 倍, 同时少用约 70% 的 token, 在规模化场景下切实提升了可靠性和成本效率.」)

> **问:** 上一页说首次尝试 95%, 这里接着就是 「79% with prior CUA models」, 79% 对应的是什么?
> 中间丢了半句. PDF 第 7 页是 「and 100% within three attempts, compared to ~73–79% with prior CUA models」. 完整意思是: 首次尝试 95%, 三次以内 100%, 此前的 CUA 模型约为 73% 到 79%. 只读 Markdown, 会把 79% 当成旧模型的单一成绩, 也看不到 「三次以内 100%」. 这组数来自客户 Mainstay 自己的评测, 旧模型具体是哪几个, 是否跑的同一批门户, 页面没说.

**— Dod Fraser, CEO at Mainstay**

**— Dod Fraser, Mainstay CEO**

In the API, developers can access these capabilities using the updated computer tool. Please see our for[updated documentation](https://developers.openai.com/api/docs/guides/latest-model) recommended best practices.

在 API 中, 开发者可以通过更新后的 computer 工具使用这些能力. 推荐的最佳实践请见我们更新后的文档. (「updated documentation」 的链接被挪到了 「for」 之后.)

## Coding (编程)

GPT‑5.4 combines the coding strengths of GPT‑5.3‑Codex with leading knowledge work and computer-use capabilities, which matter most on longer-running tasks where the model can use tools, iterate, and push work further with less manual intervention. It matches or outperforms GPT‑5.3‑Codex on SWE-Bench Pro while being lower latency across reasoning efforts.

GPT-5.4 把 GPT-5.3-Codex 的编程长处, 与领先的知识工作和计算机使用能力结合在一起. 这些能力在较长的任务上最要紧: 模型可以使用工具, 反复迭代, 在更少人工干预下把工作往前推. 它在 SWE-Bench Pro 上与 GPT-5.3-Codex 持平或更好, 同时在各档推理强度下延迟都更低.

We estimate latency by looking at the production behavior of our models, and simulating this offline. The latency estimate accounts for tool call duration (code execution time), sampled tokens, and input tokens. Real-world latency may vary substantially, and depends on many factors not captured in our simulation. Reasoning efforts were swept from none to xhigh.

我们通过观察模型在生产环境中的行为并离线模拟来估算延迟. 延迟估算考虑了工具调用时长 (代码执行时间), 采样 token 和输入 token. 真实延迟可能差异很大, 取决于很多模拟没有覆盖的因素. 推理强度从 none 扫到 xhigh. (这是一张延迟与 SWE-Bench Pro 关系图的图注, 图本身没有抽出来.)

We use cookies

我们使用 Cookie (横幅标题, 这里没被识别成标题.)

We use cookies to help this site function, understand service usage, and support marketing efforts. Visit preferences anytime. View our [Cookie Policy](https://openai.com/policies/cookie-policy/) for more info.

(Cookie 横幅, 同上.)

to change

(横幅残字.)

When toggled on, /fast mode in Codex delivers up to 1.5x faster token velocity with GPT‑5.4. It’s the same model and the same intelligence, just faster. That means users can move through coding tasks, iteration, and debugging while staying in flow.

打开后, Codex 的 /fast 模式能让 GPT-5.4 的 token 生成速度最多快 1.5 倍. 还是同一个模型, 同样的智能, 只是更快. 用户在编程, 迭代和调试时可以一直保持状态.

<!-- page 8 of 19 -->

RPG game

RPG 游戏 (演示标签)

OpenAI

页眉: OpenAI.

Theme park simulation game

主题公园模拟游戏 (演示标签)

In evaluation and internal testing we found that GPT‑5.4 excels at complex frontend tasks, with noticeably more aesthetic and more functional results than any models we’ve launched previously.

在评测和内部测试中我们发现, GPT-5.4 擅长复杂的前端任务, 做出的结果比我们以往发布的任何模型都明显更美观, 功能更完整.

Golden Gate Bridge yover

金门大桥飞越 (演示标签; 「yover」 是 「flyover」 丢了 fl 连字.)

As a demons[tration of the mod](https://developers.openai.com/api/docs/guides/priority-processing)el’s improved computer-use and coding capabilities working in tandem, we’re also releasing an experimental Codex skill called “ ”. This[Playwright (Interactive)](https://github.com/openai/skills/tree/main/skills/.curated/playwright-interactive) allows Codex to visually debug web and Electron apps; it can even be used to test an app it’s building, as it’s building it.

为了演示模型改进后的计算机使用能力和编程能力如何配合, 我们还发布了一个实验性 Codex 技能, 叫 「Playwright (Interactive)」. 它让 Codex 能可视化调试网页应用和 Electron 应用, 甚至可以边构建应用边测试它. (Markdown 把 priority processing 的链接插进了 「demonstration of the model」 中间, 把 Playwright (Interactive) 的链接挪到了引号之后.)

> **确认:** 这段里嵌着一个 priority-processing 的链接, 它原本属于哪句话?
> 属于本页开头 Markdown 丢掉的一句. PDF 第 8 页顶部是 「Developers can access GPT‑5.4 at the same fast speeds via the API by using priority processing」. 接上第 7 页, 意思是: Codex 里的 /fast 模式最多快 1.5 倍, API 里要拿到同样的速度, 得用 priority processing. 第 14 页写明 Priority processing 按标准 API 价格的 2 倍收费. 「same model, same intelligence, just faster」 在 API 侧对应的是翻倍的单价, 两页连起来读才看得出.

Theme park simulation game made with GPT‑5.4 from a single lightly specified prompt, using Playwright Interactive for browser playtesting and image generation for the isometric asset set. The simulation includes tile-based path placement, ride and scenery… Show more

用 GPT-5.4 从一条只做了简单说明的提示做出的主题公园模拟游戏, 用 Playwright Interactive 在浏览器里试玩, 用图像生成做等距视角素材. 模拟包含基于网格的道路铺设, 游乐设施与景观... 展开更多

## We use cookies (我们使用 Cookie)

We use cookies to help this site function, understand service usage, and support marketing efforts. Visit preferences anytime. View our [Cookie Policy](https://openai.com/policies/cookie-policy/) for more info.

(Cookie 横幅, 同上.)

to change

(横幅残字.)

<!-- page 9 of 19 -->

GitHub

Cursor

OpenAI

JetBrains

Augment Code

Windsurf

客户标签: GitHub, Cursor, JetBrains, Augment Code, Windsurf; 夹在中间的 OpenAI 是页眉.

# “GPT-5.4 is currently the leader on our internal benchmarks. Our engineers find it to be more natural and assertive than previous models. It works through ambiguous problems without second-guessing itself, and it’s proactive about parallelizing work to keep things moving.” (「GPT-5.4 目前在我们的内部基准上领先. 我们的工程师觉得它比以前的模型更自然, 更果断. 它处理模糊问题时不会反复自我怀疑, 还会主动把工作并行化, 让事情一直往前走.」)

**— Lee Robinson, VP of Developer Education at Cursor**

**— Lee Robinson, Cursor 开发者教育副总裁**

## Tool use (工具使用)

With GPT‑5.4, we’ve significantly improved how models work with external tools. Agents can now operate across larger tool ecosystems, choose the right tools more reliably, and complete multi-step workflows with lower cost and latency.

在 GPT-5.4 上, 我们大幅改进了模型使用外部工具的方式. Agent 现在能在更大的工具生态中工作, 更可靠地选对工具, 以更低的成本和延迟完成多步工作流.

## Tool search (工具搜索)

In the API, GPT‑5.4 introduces , which allows models[tool search](https://developers.openai.com/api/docs/guides/tools-tool-search) to work efficiently when given many tools.

在 API 中, GPT-5.4 引入了 tool search (工具搜索), 让模型在拿到大量工具时也能高效工作.

Previously, when a model was given tools, all tool definitions were included in the prompt upfront. For systems with many tools, this could add thousands—or even tens of thousands—of tokens to every request, increasing cost, slowing responses, and crowding the context with information the model might never use.

以前, 给模型提供工具时, 所有工具定义都会预先放进提示. 对工具很多的系统, 这可能让每个请求多出几千甚至几万个 token, 增加成本, 拖慢响应, 还让模型可能根本用不到的信息挤占上下文.

With tool search, GPT‑5.4 instead receives a lightweight list of

有了工具搜索, GPT-5.4 拿到的是一份轻量的

## We use cookies (我们使用 Cookie)

available tools along with a tool search capability. When the model needs to use a tool, it can look up that tool’s definition and

可用工具列表, 外加一个工具搜索能力. 模型需要用某个工具时, 可以查出该工具的定义, 并

append it to the conversation at that moment. We use cookies to help this site function, understand service usage, and support marketing efforts. Visit preferences anytime. View our [Cookie Policy](https://openai.com/policies/cookie-policy/) for more info.

在那一刻把它追加到对话里. (后面是 Cookie 横幅. PDF 在这句之后还有一整段, Markdown 没抓到: 这种做法大幅减少了重度用工具的工作流所需的 token, 并能保住缓存, 让请求更快, 更便宜; 它也让 Agent 能可靠地使用大得多的工具生态; 对工具定义可能多达数万 token 的 MCP 服务器, 效率收益可能很可观.)

<!-- page 10 of 19 -->

OpenAI

页眉: OpenAI.

Scale’s benchmark with all 36 MCP servers enabled in[MCP Atlas](https://scale.com/leaderboard/mcp_atlas) two modes: (1) exposing every MCP function directly in the model context, and (2) placing all MCP servers behind tool search. The tool-search configuration reduced total token usage by 47% while achieving the same accuracy.

...Scale 的 MCP Atlas 基准中的 250 个任务, 在开启全部 36 个 MCP 服务器的情况下用两种模式评估: (1) 把每个 MCP 函数直接暴露在模型上下文里; (2) 把所有 MCP 服务器放在工具搜索后面. 工具搜索配置在准确率相同的情况下, 把总 token 用量减少了 47%. (句首 「To demonstrate the efficiency gains, we evaluated 250 tasks from」 在 Markdown 里丢了, 意思是 「为了展示效率收益, 我们评估了...」.)

**Example token counts come from averaging 250 tasks in the MCP-Atlas public dataset.**

**示例 token 数来自对 MCP-Atlas 公开数据集中 250 个任务取平均.**

> **停一下:** 47% 这个降幅, 本页有能验算的 token 绝对数吗?
> 没有. 图注说 「Example token counts」 来自 250 个任务的平均, 对应的图没有抽出来, PDF 文字层里也没有具体 token 数. 能确认的只有条件: 250 个任务, 36 个 MCP 服务器全开, 两种模式, 「same accuracy」. 准确率本身是多少也没写; 第 16 页总表里 GPT-5.4 的 MCP Atlas 是 67.2%, 但没说这个分数用的是哪种模式. 上一页讲工具搜索能 「preserve the cache」 的那段整段被 Markdown 丢了, 47% 说的是总 token, 缓存命中带来的价格收益不在这个数里.

## Agentic tool calling (Agent 式工具调用)

GPT‑5.4 also improves **tool calling**, making it more accurate and efficient when deciding when and how to use tools during reasoning, particularly in the API. Compared to GPT‑5.2, it achieves higher accuracy in fewer turns on Toolathlon, a benchmark that tests how well AI agents can use real-world tools and APIs to complete multi-step tasks. For example, an agent needs to read emails, extract assignment attachments, upload them, grade them and record results in a spreadsheet.

GPT-5.4 也改进了**工具调用**, 在推理过程中决定何时, 如何用工具时更准确, 更高效, 在 API 中尤其明显. 与 GPT-5.2 相比, 它在 Toolathlon 上用更少的轮次拿到更高的准确率. Toolathlon 测试 AI Agent 使用真实世界的工具和 API 完成多步任务的能力. 例如, Agent 要读邮件, 取出作业附件, 上传, 打分, 再把结果记进电子表格.

## We use cookies (我们使用 Cookie)

We use cookies to help this site function, understand service usage, and support marketing efforts. Visit preferences anytime. View our [Cookie Policy](https://openai.com/policies/cookie-policy/) for more info.

(Cookie 横幅, 同上.)

to change

(横幅残字.)

<!-- page 11 of 19 -->

OpenAl

页眉: OpenAI (MinerU 把末尾的 I 识别成了 l).

**A tool yield is when an assistant yields to await tool responses. If 3 tools are called in parallel, followed by 3 more tools called in parallel, the number of yields would be 2. Tool yields are a better proxy of latency than tool calls because they reflect the benefits of parallelization.**

**一次工具让出指助手暂停下来, 等待工具返回. 如果先并行调用 3 个工具, 再并行调用 3 个, 让出次数就是 2. 工具让出比工具调用次数更能代表延迟, 因为它体现了并行化的好处.** (第二次出现, 这次是 Toolathlon 那张图的注释.)

> **看表:** 「higher accuracy in fewer turns」, 轮次到底少了多少?
> 本页没有数字. 这条工具让出的定义是一张图的注释, 图没抽出来, PDF 文字层里也只有注释本身. 能对上的只有准确率: 第 2 页和第 16 页都写 Toolathlon GPT-5.4 54.6%, GPT-5.3-Codex 51.9%, GPT-5.2 46.3% (第 16 页 GPT-5.2 列截成 「4」). 轮次, 让出次数的具体值, 以及对应的推理强度, 页面都没给.

For latency-sensitive use cases where reasoning effort None is preferred, GPT‑5.4 further improves upon its predecessors.

对于延迟敏感, 更愿意把推理强度设为 None 的场景, GPT-5.4 也比前代有进一步提升.

**In** [**τ2-bench**](https://arxiv.org/pdf/2506.07982)**, a model must use tools to accomplish a customer service task, where there may be a simulated user who can communicate and take action**… Show more

**在 τ2-bench 里, 模型要用工具完成一项客服任务, 其中可能有一个能交流, 也能采取行动的模拟用户...** 展开更多

## Improved web search (更强的网页搜索)

GPT‑5.4 is better at agentic web search. On BrowseComp, a measurement of how well AI agents can persistently browse the web to find hard-to-locate information, GPT‑5.4 leaps $1 7 \% _ { a b s }$ over GPT‑5.2, and GPT‑5.4 Pro sets a new state of the art of 89.3%.

GPT-5.4 更擅长 Agent 式网页搜索. BrowseComp 衡量 AI Agent 能否锲而不舍地浏览网页, 找到难找的信息. 在这上面, GPT-5.4 比 GPT-5.2 高出 17% (绝对值), GPT-5.4 Pro 以 89.3% 创下新的最高水平. (「$1 7 \% _ { a b s }$」 是 「17%」 加下标 「abs」 被识别成了公式.)

> **再看:** 「leaps 17%abs」 和表里的数对得上吗?
> 第 2 页表格: GPT-5.4 82.7%, GPT-5.2 65.8%, 相差 16.9 个百分点, 四舍五入为 17; 下标 abs 表示绝对百分点, 按相对涨幅算约为 25.7%. Pro 的 89.3% 比 GPT-5.4 高 6.6 个点, BrowseComp 是 Pro 在专业工作类之外少数明显领先的项目. 这 16.9 个点也不全是模型的功劳, 见下一页关于屏蔽名单和测量日期的说明.

In practice, this means GPT‑5.4 Thinking is stronger at answering questions that require pulling together information from many

实际上, 这意味着 GPT-5.4 Thinking 更擅长回答需要从网上许多

## We use cookies (我们使用 Cookie)

sources on the web. It can more persistently search across multiple rounds to identify the most relevant sources, particularly

来源汇总信息的问题. 它能更锲而不舍地多轮搜索, 找出最相关的来源, 尤其是

for “needle-in-a-haystack” questions, and synthesize them into a We use cookies to help this site function, understand service usage, and support marketing efforts. Visit to change [cl](https://openai.com/policies/cookie-policy/)ear, well-reasoned answer.preferences anytime. View our [Cookie Policy](https://openai.com/policies/cookie-policy/) for more info.

针对 「大海捞针」 式的问题, 再把这些来源综合成清楚, 有条理的回答. (句中夹着 Cookie 横幅, 同上.)

<!-- page 12 of 19 -->

OpenAI

页眉: OpenAI.

**In BrowseComp, we used a search blocklist excluding websites containing benchmark answers from evaluation to prevent contamination and ensure a fair measure of performance. GPT**‑**5.4 was measured on a later date than GPT**‑**5.2, so scores reflect changes in the model, our search system, and state of the internet. GPT**‑**5.4 was tested with a longer, updated blocklist. Models use the ChatGPT search tool, which can have small differences from API search.**

**在 BrowseComp 中, 我们用了一份搜索屏蔽名单, 把含有基准答案的网站排除在评测之外, 防止污染, 保证衡量公平. GPT-5.4 的测量日期晚于 GPT-5.2, 所以分数反映的是模型, 我们的搜索系统和互联网状态三方面的变化. GPT-5.4 用的是更长的, 更新过的屏蔽名单. 模型使用 ChatGPT 搜索工具, 它和 API 搜索可能有细微差别.**

> **对一下:** BrowseComp 上 GPT-5.4 比 GPT-5.2 高 16.9 个点, 这个差距能全算在模型头上吗?
> 页面自己说不能. 两个模型测于不同日期, 分数混着三样变化: 模型, OpenAI 的搜索系统, 互联网本身. 屏蔽名单也不一样, GPT-5.4 用的更长. 更长的屏蔽名单按理会让题更难, 对 GPT-5.4 偏保守; 搜索系统升级和网上新增的内容, 又可能让题更容易. 两个方向各占多少, 本页没有拆分. 两者都用 ChatGPT 搜索工具, API 用户拿到的搜索结果可能略有不同.

**Zapier**

**Glean**

**Clay**

**Basis**

**Hex**

**Databricks**

**Whoop**

客户标签: Zapier, Glean, Clay, Basis, Hex, Databricks, Whoop.

# “GPT-5.4 xhigh is the new state of the art for multi-step tool use. Zapier runs some of the most rigorous tool use benchmarks in the industry, testing models across hundreds of advanced real-world workflows. GPT-5.4 finished the job where previous models gave up - the most persistent model to date.” (「GPT-5.4 xhigh 是多步工具使用的新最高水平. Zapier 跑的是业内最严格的一批工具使用基准, 在数百个高级真实工作流上测试模型. 以前的模型半途放弃的地方, GPT-5.4 把活干完了, 是迄今最能坚持的模型.」)

**— Wade, CEO at Zapier**

**— Wade, Zapier CEO**

## Steerability (可引导性)

Similarly to how Codex outlines its approach when it starts working, GPT‑5.4 Thinking in ChatGPT will now outline its work with a preamble for longer, more complex queries. You can also add instructions or adjust its direction mid-response. This makes

就像 Codex 开始工作时会先列出思路那样, ChatGPT 里的 GPT-5.4 Thinking 遇到较长, 较复杂的问题时, 现在会先用一段开场说明 (preamble) 列出它要做的工作. 你也可以在它回答中途追加指令或调整方向. 这让 (句子被横幅打断.)

## We use cookies (我们使用 Cookie)

without starting over or requiring multiple additional turns. This We use cookies to help this site function, understand service usage, and support marketing efforts. Visit feature is available now on and the Android app,[chatgpt.com](http://chatgpt.com/?openaicom-did=2d05d6e2-4ca1-49b5-9363-44653b44abe7&openaicom_referred=true) preferences anytime. View our [Cookie Policy](https://openai.com/policies/cookie-policy/) for more info. coming soon to the iOS app.

...不必从头再来, 也不必多轮追加对话. 这个功能现在已在 chatgpt.com 和 Android 应用上线, iOS 应用即将推出. (「it easier to guide the model toward the exact outcome you want」 这半句 Markdown 丢了, 意思是 「更容易把模型引向你想要的确切结果」; 句中夹着 Cookie 横幅.)

to change

(横幅残字.)

The model can also think longer on difficult tasks while maintaining stronger awareness of earlier steps in the conversation. This allows it to handle longer workflows and

模型还能在难题上思考得更久, 同时对对话中较早的步骤保持更强的把握. 这让它能处理更长的工作流和

<!-- page 13 of 19 -->

OpenAl

页眉: OpenAI. (PDF 本页开头有上一句的后半, Markdown 没抓到: 更复杂的提示, 同时让回答自始至终连贯, 切题.)

![Image block](images/p13-this-video-was-sped-up-for-illustrative-purposes.png)

图: 一个空白的视频占位框, 抓页时视频没有加载, 没有可读内容. 文件名取自下面那行视频说明.

This video was sped up for illustrative purposes.

本视频为演示目的做了加速.

## Safety (安全)

Over recent months, we’ve continued improving the safeguards we introduced with GPT‑5.3‑Codex while preparing GPT‑5.4 for deployment. Similar to GPT‑5.3‑Codex, we are treating GPT‑5.4 as High cyber capability under our Preparedness Framework, and we are deploying it with the corresponding protections as documented in the . These include an expanded[system card](https://deploymentsafety.openai.com/gpt-5-4-thinking) cyber safety stack, including monitoring systems, trusted access controls, and asynchronous blocking for higher-risk requests for customers on Zero Data Retention (ZDR) surfaces, alongside ongoing investment in the broader security ecosystem.

过去几个月, 我们在准备部署 GPT-5.4 的同时, 继续改进随 GPT-5.3-Codex 引入的防护措施. 与 GPT-5.3-Codex 一样, 我们在 Preparedness Framework 下把 GPT-5.4 按网络安全能力 High 级对待, 并按系统卡 (system card) 中记录的相应防护来部署它. 这些防护包括扩展后的网络安全防护栈: 监控系统, 可信访问控制, 以及对 Zero Data Retention (ZDR) 界面上的客户, 对较高风险请求做异步拦截; 同时持续投入更广泛的安全生态. (「system card」 的链接被挪到了 「expanded」 之后.)

Because cybersecurity capabilities are inherently dual-use, we maintain a precautionary approach to deployment while continuing to calibrate our policies and classifiers. For certain customers on ZDR surfaces, request-level blocking remains part of our cyber risk mitigation stack; because classifiers are still improving, some false positives may occur as we continue refining

由于网络安全能力天然是双用途的, 我们在部署上保持预防性做法, 同时继续校准策略和分类器. 对 ZDR 界面上的部分客户, 请求级拦截仍是网络风险缓解手段的一部分; 因为分类器还在改进, 在我们继续打磨的过程中可能出现一些误报.

## We use cookies (我们使用 Cookie)

[ov](https://openai.com/policies/cookie-policy/)erly caveated responses, while preserving strong protectionspreferences anytime. View our [Cookie Policy](https://openai.com/policies/cookie-policy/) for more info. against misuse.

...以及过度附加免责说明的回答, 同时保持对滥用的有力防护. ("these safeguards. These updates aim to improve how safeguards operate in practice, including reducing unnecessary refusals and" 在 Markdown 里丢了, 意思是: 这些防护措施. 这些更新旨在改善防护在实际中的运作, 包括减少不必要的拒绝和...)

We’ve continued our safety research on Chain-of-Thought (CoT) monitorability to better understand how models reason and help detect potential misbehavior. As part of this work, we introduce a new open-source evaluation, , measuring[CoT controllability](https://openai.com/index/reasoning-models-chain-of-thought-controllability/)

我们继续做 CoT 可监控性 (monitorability) 方面的安全研究, 以更好地理解模型如何推理, 帮助发现潜在的不当行为. 作为这项工作的一部分, 我们推出一个新的开源评测 CoT controllability (CoT 可控性), 用来衡量 (链接被挪到了 「measuring」 之后.)

to change

(横幅残字.)

<!-- page 14 of 19 -->

OpenAI

页眉: OpenAI.

control its CoT is low, which is a positive property for safety, suggesting that the model lacks the ability to hide its reasoning and that CoT monitoring remains an effective safety tool.

...控制自身 CoT 的能力很低. 这对安全是一个正面属性, 说明模型缺乏隐藏推理过程的能力, CoT 监控仍是有效的安全工具.

> **想:** 「control its CoT is low」 前面缺了什么, 低到多少?
> 缺了半句. PDF 第 14 页开头是 "whether models can deliberately obfuscate their reasoning to evade monitoring. We find that GPT‑5.4 Thinking's ability to「, 连起来是: 这个评测衡量模型能否故意混淆推理来躲避监控, 结论是 GPT-5.4 Thinking 控制自身 CoT 的能力低. 」低「 是多少, 用什么指标, 和哪些模型比, 本页一个数也没给. 安全部分能拿到的只有 」High cyber capability" 这一个评级.

## Availability and pricing (上线与定价)

GPT‑5.4 is rolling out gradually today across ChatGPT and Codex. In the API, GPT‑5.4 is available now as gpt-5.4 . GPT‑5.4 Pro is also available in the API as gpt-5.4-pro for developers who need maximum performance on the most complex tasks.

GPT-5.4 今天开始在 ChatGPT 和 Codex 中逐步推出. 在 API 中, GPT-5.4 现已以 gpt-5.4 提供. GPT-5.4 Pro 也以 gpt-5.4-pro 在 API 中提供, 给在最复杂任务上需要最高性能的开发者.

In ChatGPT, GPT‑5.4 Thinking is available starting today to ChatGPT Plus, Team, and Pro users, replacing GPT‑5.2 Thinking. GPT‑5.2 Thinking will remain available for three months for paid users in the model picker under the Legacy Models section, after which it will be retired on June 5, 2026. Those on Enterprise and Edu plans can enable early access via admin settings. GPT‑5.4 Pro is available to Pro and Enterprise plans. [Context windows](https://help.openai.com/en/articles/11909943-gpt-53-and-54-in-chatgpt) in ChatGPT for GPT‑5.4 Thinking remain unchanged from GPT‑5.2 Thinking.

在 ChatGPT 中, GPT-5.4 Thinking 从今天起向 ChatGPT Plus, Team 和 Pro 用户开放, 替换 GPT-5.2 Thinking. GPT-5.2 Thinking 会在模型选择器的旧版模型 (Legacy Models) 区域为付费用户保留三个月, 之后于 2026 年 6 月 5 日下线. Enterprise 和 Edu 方案可通过管理员设置开启提前体验. GPT-5.4 Pro 向 Pro 和 Enterprise 方案开放. ChatGPT 里 GPT-5.4 Thinking 的上下文窗口与 GPT-5.2 Thinking 相同.

GPT‑5.4 is our first mainline reasoning model that incorporates the frontier coding capabilities of GPT‑5.3‑codex and that is rolling out across ChatGPT, the API and Codex. We're calling it GPT‑5.4 to reflect that jump, and to simplify the choice between models when using Codex. Over time, you can expect our Instant models and Thinking models to evolve at different speeds.

GPT-5.4 是我们第一个吸收了 GPT-5.3-Codex 前沿编程能力, 并在 ChatGPT, API 和 Codex 全面推出的主线推理模型. 我们叫它 GPT-5.4, 是为了体现这次跨越, 也为了简化在 Codex 里选模型. 今后, 我们的 Instant 模型和 Thinking 模型会以不同的速度演进.

GPT‑5.4 in Codex includes experimental support for the 1M context window. Developers can try this by configuring model\_context\_window and model\_auto\_compact\_token\_limit . Requests that exceed the standard 272K context window count against usage limits at 2x the normal rate.

Codex 中的 GPT-5.4 实验性支持 1M 上下文窗口. 开发者可以通过配置 `model_context_window` 和 `model_auto_compact_token_limit` 来试用. 超过标准 272K 上下文窗口的请求, 按正常速率的 2 倍计入用量限制.

> **核对:** 第 1 页说 「supports up to 1M tokens of context」, 这里又是 「experimental」 和 「standard 272K」, GPT-5.4 的上下文到底多大?
> 两处说的是不同层面. 1M 是模型能接受的上限, 在 Codex 里目前属于实验性支持, 要手动配两个参数; 272K 是标准窗口, 超出部分按 2 倍计用量. ChatGPT 里的 GPT-5.4 Thinking 则 「unchanged from GPT‑5.2 Thinking」, 具体多少本页没写, 只给了帮助中心链接; API 侧的窗口大小也没单列. 再对照第 17 页的长上下文结果: MRCR v2 8-needle 在 512K 到 1M 区间只有 36.6%, Graphwalks BFS 在 256K 到 1M 区间是 21.4%. 1M 放得进去, 不等于在那个长度上还能准确检索.

In the API, GPT‑5.4 is priced higher per token than GPT‑5.2 to reflect its improved capabilities, while its greater token efficiency helps reduce the total number of tokens required for many tasks. Batch and Flex pricing are available at half the standard API rate, while Priority processing is available at twice the standard API rate.

在 API 中, GPT-5.4 每 token 的价格高于 GPT-5.2, 以体现能力提升; 同时更高的 token 效率有助于减少很多任务所需的 token 总数. Batch 和 Flex 价格是标准 API 价格的一半, Priority processing 是标准价格的两倍.

<table><tr><td>We use cookies</td><td>API model</td><td>Input price</td><td>Cached input price</td><td>Output price</td><td></td></tr><tr><td colspan="2">We use cookies to help this site function, understand service usage, and support marketing efforts. Visit preferences anytime. View our Cookie Policy for more info.</td><td>$1.75 / M tokens</td><td>$0.175 / M tokens</td><td>$14 / M tokens</td><td>to change</td></tr><tr><td></td><td>gpt-5.4</td><td>$2.50 / M tokens</td><td>$0.25 / M tokens</td><td>$15 / M tokens</td><td></td></tr></table>

价格表 (每百万 token), 列为 API 模型, 输入价格, 缓存输入价格, 输出价格. 第一行的模型名被 Cookie 横幅盖掉了, PDF 里是 gpt-5.2: 输入 $1.75, 缓存输入 $0.175, 输出 $14. gpt-5.4: 输入 $2.50, 缓存输入 $0.25, 输出 $15. (表里的 「We use cookies」 和 「to change」 是横幅残字.)

> **拆开:** 「priced higher per token」, 贵了多少?
> 按表拆开算: 输入 $2.50 对 $1.75, 贵约 43%; 缓存输入 $0.25 对 $0.175, 同样约 43%; 输出 $15 对 $14, 只贵约 7%. 涨价主要落在输入端. 工具多, 上下文长的 Agent 任务, 输入 token 往往远多于输出, 实际账单的涨幅会更接近 43%. 页面说 token 效率更高能抵消一部分, 可 「significantly fewer tokens」 从头到尾没给比例, 能否抵消本页算不出来. 只看 Markdown 还会不知道 $1.75 那一行是 gpt-5.2.

<!-- page 15 of 19 -->

OpenAl

页眉: OpenAI.

| gpt-5.4-pro | $30 / M tokens | - | $180 / M tokens |
| --- | --- | --- | --- |

gpt-5.4-pro: 输入 $30, 缓存输入 「-」 (不提供), 输出 $180 (每百万 token).

> **回看:** Pro 的价格该和谁比? 这一行上面还有别的吗?
> PDF 第 15 页在 gpt-5.4-pro 上面还有一行 gpt-5.2-pro: 输入 $21, 缓存输入 「-」, 输出 $168, Markdown 整行丢了. 补上后, Pro 的涨幅和标准版完全一样: 输入 30/21 ≈ 1.43 倍, 输出 180/168 ≈ 1.07 倍. Pro 对 GPT-5.4 标准版的比值也整齐: 输入 30/2.50 = 12 倍, 输出 180/15 = 12 倍. 可在 GDPval 和投行建模两项上, 单价高 12 倍的 Pro 分数反而略低.

## Evaluations (评测)

## Professional (专业工作)

| Eval | GPT 5.4 | GPT 5.4 Pro | GPT 5.3- Codex | G |
| --- | --- | --- | --- | --- |
| GDPval | 83.0% | 82.0% | 70.9% | 70 |
| FinanceAgent | 56.0% | 61.5% | 54.0% | 5 |
| v1.1 |  |  |  |  |
| Investment | 87.3% | 83.6% | 79.3% | 6 |
| Banking |  |  |  |  |
| Modeling |  |  |  |  |
| Tasks(Internal) |  |  |  |  |
| OfficeQA | 68.1% | - | 65.1% | 6 |

专业工作评测. 列为 GPT-5.4, GPT-5.4 Pro, GPT-5.3-Codex, 最后一列表头只剩 「G」, 按第 2, 3, 5, 6 页正文的数推断是 GPT-5.2, 数值只剩前一两位. GDPval: 83.0%, 82.0%, 70.9%, 「70」. FinanceAgent v1.1: 56.0%, 61.5%, 54.0%, 「5」. Investment Banking Modeling Tasks (Internal): 87.3%, 83.6%, 79.3%, 「6」. OfficeQA: 68.1%, -, 65.1%, 「6」.

Coding

编程

| Eval | GPT 5.4 | GPT 5.4 Pro | GPT 5.3- Codex | G |
| --- | --- | --- | --- | --- |
| SWE-Bench Pro(Public) | 57.7% | - | 56.8% | 5 |
| Terminal-Bench2.0 | 75.1% | - | 77.3% | 6 |

编程评测. SWE-Bench Pro (Public): 57.7%, -, 56.8%, 「5」. Terminal-Bench 2.0: 75.1%, -, 77.3%, 「6」.

> **问:** 正文说 GPT-5.4 在编程上 「matches or outperforms GPT‑5.3‑Codex」, Terminal-Bench 2.0 这一行对得上吗?
> 对不上. SWE-Bench Pro 上 GPT-5.4 57.7% 对 GPT-5.3-Codex 56.8%, 高 0.9 个点, 符合 「持平或更好」; Terminal-Bench 2.0 上是 75.1% 对 77.3%, GPT-5.4 低 2.2 个点. 第 7 页只挑了 SWE-Bench Pro 来讲, Terminal-Bench 2.0 只出现在总表里. 按这张表, 终端类任务上 GPT-5.3-Codex 仍然领先.

## Computer use and vision (计算机使用与视觉)

|  | Eval | GPT-5.4 | GPT-5.4 Pro | GPT-5.3-Codex | G |
| --- | --- | --- | --- | --- | --- |
| We use cookies | OSWorld-Verified | 75.0% | — | 74.0% | 4 |
| We use cookies to help this site function, understand service usage, and support marketing efforts. Visit preferences anytime. View our Cookie Policy for more info. | MMMU Pro (no tools) | 81.2% | — | — | 7 |
|  | MMMU Pro (with tools) | 82.1% | — | — | 8 |

计算机使用与视觉评测 (第一列是 Cookie 横幅残字). OSWorld-Verified: 75.0%, —, 74.0%, 「4」. MMMU Pro (不用工具): 81.2%, —, —, 「7」. MMMU Pro (用工具): 82.1%, —, —, 「8」.

> **核对:** MMMU Pro 不用工具那一格, GPT-5.2 是 「7」, 正文说 79.5%, 哪个对?
> 都出自同一个被截断的列. PDF 文字层这一格是 「79」, Markdown 又少了一位, 只剩 「7」; 第 6 页正文给的完整值是 79.5%. 这一列在整个总表里都只剩前一两位: GDPval 「70」, OSWorld 「4」 (47.3%), FrontierMath Tier 4 「18」, MRCR 128K–256K 「77」. 能用正文补全的只有 GDPval, 投行建模, SWE-Bench Pro, OSWorld-Verified, Toolathlon, BrowseComp, MMMU Pro (不用工具) 这几项, 其余格子本页没有完整值.

<!-- page 16 of 19 -->

OpenAI

页眉: OpenAI.

| Eval | GPT 5.4 | GPT 5.4 Pro | GPT 5.3- Codex | G |
| --- | --- | --- | --- | --- |
| BrowseComp | 82.7% | 89.3% | 77.3% | 6 |
| MCPAtlas | 67.2% | - | - | 6 |
| Toolathlon | 54.6% | - | 51.9% | 4 |
| Tau2-benchTelecom | 98.9% | - | - | 9 |

工具使用评测 (Markdown 丢了 「Tool use」 这个小标题). BrowseComp: 82.7%, 89.3%, 77.3%, 「6」. MCP Atlas: 67.2%, -, -, 「6」. Toolathlon: 54.6%, -, 51.9%, 「4」. Tau2-bench Telecom: 98.9%, -, -, 「9」.

## Academic (学术)

| Eval | GPT 5.4 | GPT 5.4 Pro | GPT 5.3- Codex | G |
| --- | --- | --- | --- | --- |
| Frontier | 33.0% | 36.7% | - | 2 |
| Science |  |  |  |  |
| Research |  |  |  |  |
| FrontierMath | 47.6% | 50.0% | - | 4 |
| Tier1-3 |  |  |  |  |
| FrontierMath | 27.1% | 38.0% | - | 18 |
| Tier4 |  |  |  |  |
| GPQA | 92.8% | 94.4% | 92.6% | 9 |
| Diamond |  |  |  |  |
| Humanity's | 39.8% | 42.7% | - | 3 |
| LastExam(no |  |  |  |  |
| tools) |  |  |  |  |
| Humanity's | 52.1% | 58.7% | - | 4 |
| LastExam |  |  |  |  |
| (withtools) |  |  |  |  |

学术评测. Frontier Science Research: 33.0%, 36.7%, -, 「2」. FrontierMath Tier 1-3: 47.6%, 50.0%, -, 「4」. FrontierMath Tier 4: 27.1%, 38.0%, -, 「18」. GPQA Diamond: 92.8%, 94.4%, 92.6%, 「9」. Humanity's Last Exam (不用工具): 39.8%, 42.7%, -, 「3」. Humanity's Last Exam (用工具): 52.1%, 58.7%, -, 「4」.

## Long context (长上下文)

<table><tr><td></td><td>Eval</td><td>GPT-5.4</td><td>GPT-5.4Pro</td><td>GPT-5.3-Codex</td><td>G</td></tr><tr><td rowspan="2">We use cookies</td><td rowspan="2">GraphwalksBFS 0K-128K</td><td rowspan="2">93.0%</td><td rowspan="2">—</td><td rowspan="2">—</td><td rowspan="2">9</td></tr><tr></tr><tr><td colspan="2">We use cookies to help this site function, understand service usage, and support marketing efforts. Visit preferences anytime. View our Cookie Policy for more info. GraphwalksBFS 256K-1M</td><td>21.4%</td><td>—</td><td>—</td><td>—</td></tr><tr><td></td><td>Graphwalksparents 0-128K(accuracy)</td><td>89.8%</td><td>—</td><td>—</td><td>8</td></tr></table>

长上下文评测 (第一列是横幅残字). Graphwalks BFS 0K-128K: 93.0%, —, —, 「9」. Graphwalks BFS 256K-1M: 21.4%, —, —, —. Graphwalks parents 0-128K (准确率): 89.8%, —, —, 「8」.

> **看表:** Graphwalks 有 BFS 两档, parents 却只有 0-128K 一档, 长的那档去哪了?
> Markdown 丢了一行. PDF 第 17 页开头是 「Graphwalks parents 256K–1M (accuracy)」: GPT-5.4 32.4%, 其余三列都是 「—」. 补上后, 两个子任务走势一致: BFS 从 0-128K 的 93.0% 掉到 256K-1M 的 21.4%, parents 从 89.8% 掉到 32.4%. 256K 以上两项 GPT-5.2 列都是 「—」, 是没测还是不支持这么长的输入, 页面没说.

<!-- page 17 of 19 -->

OpenAl

页眉: OpenAI.

| OpenAIMRCRv28-needle4K-8K | 97.3% | - | - | 9 |
| --- | --- | --- | --- | --- |
| OpenAIMRCR | 91.4% | - | - | 8 |
| v28-needle |  |  |  |  |
| 8K-16K |  |  |  |  |
| OpenAIMRCR | 97.2% | - | - | 9 |
| v28-needle |  |  |  |  |
| 16K-32K |  |  |  |  |
| OpenAIMRCR | 90.5% | - | - | 9 |
| v28-needle |  |  |  |  |
| 32K-64K |  |  |  |  |
| OpenAIMRCR | 86.0% | - | - | 8 |
| v28-needle |  |  |  |  |
| 64K-128K |  |  |  |  |
| OpenAIMRCR | 79.3% | - | - | 77 |
| v28-needle |  |  |  |  |
| 128K-256K |  |  |  |  |
| OpenAIMRCR | 57.5% | - | - | - |
| v28-needle |  |  |  |  |
| 256K-512K |  |  |  |  |
| OpenAIMRCR | 36.6% | - | - | - |
| v28-needle |  |  |  |  |
| 512K-1M |  |  |  |  |

OpenAI MRCR v2 8-needle, GPT-5.4 各长度区间: 4K-8K 97.3%, 8K-16K 91.4%, 16K-32K 97.2%, 32K-64K 90.5%, 64K-128K 86.0%, 128K-256K 79.3%, 256K-512K 57.5%, 512K-1M 36.6%. 截断的 GPT-5.2 列依次为 「9」, 「8」, 「9」, 「9」, 「8」, 「77」, 「-」, 「-」. GPT-5.4 Pro 和 GPT-5.3-Codex 列全为 「-」.

> **停一下:** MRCR 在 8K-16K 掉到 91.4%, 到 16K-32K 又回到 97.2%, 是抽错了吗?
> PDF 文字层和 Markdown 一致, 不是抽取问题. 32K-64K 的 90.5% 同样比相邻的 16K-32K 低, 前五档在 86% 到 97% 之间上下起伏, 不是单调下降; 从 128K 往后才明显下滑: 79.3%, 57.5%, 36.6%. 每一档有多少题, 置信区间多宽, 本页没给, 前几档的起伏可能只是样本噪声. GPT-5.2 在 128K-256K 截成 「77」, 如果是 77.x%, GPT-5.4 只高 2 个点左右; 256K 以上 GPT-5.2 没有数.

## Abstract reasoning (抽象推理)

| Eval | GPT 5.4 | GPT 5.4 Pro | GPT 5.3- Codex | G |
| --- | --- | --- | --- | --- |
| ARC-AGI-1 (Veri ed) | 93.7% | 94.5% | - | 8 |
| ARC-AGI-2 (Veri ed) | 73.3% | 83.3% | - | 5 |

抽象推理评测. ARC-AGI-1 (Verified): 93.7%, 94.5%, -, 「8」. ARC-AGI-2 (Verified): 73.3%, 83.3%, -, 「5」. (「Veri ed」 同样缺 fi 连字.)

## Evals without reasoning (不开推理的评测)

## We use cookies (我们使用 Cookie)

(推理强度 none 的评测表, Markdown 在这个标题下什么都没有, 紧接着就是横幅标题.)

> **再看:** 「Evals without reasoning」 下面是空的, 这张表原本有什么?
> PDF 第 17 页这张表的列是 GPT-5.4 (none), GPT-5.2 (none), GPT-4.1, 能读到两行: OmniDocBench (归一化编辑距离, 越低越好) 0.109, 0.140, —; 第 18 页还漏出一行 Tau2-bench Telecom: 64.3%, 57.2%, 43.6%. 这就是第 11 页 「For latency-sensitive use cases where reasoning effort None is preferred」 那句话的数据. 同一个 Tau2-bench Telecom, 总表里 GPT-5.4 默认 xhigh 是 98.9%, 推理强度 none 时是 64.3%, 相差 34.6 个点. 推理时多花算力 (TestingTime) 在这个客服任务上起多大作用, 这两个数直接摆着.

<!-- page 18 of 19 -->

[Better prompt caching for GPT-6](https://openai.com/index/better-prompt-caching-for-gpt-6/)

推荐阅读: 「Better prompt caching for GPT-6」 (为 GPT-6 改进的提示缓存), 被抽到了页首.

OpenAI

页眉: OpenAI.

Evals were run with reasoning effort set to xhigh, except where specified otherwise. Benchmarks were conducted in a research environment, which may provide slightly different output from production ChatGPT in some cases.

除非另有说明, 评测均以 xhigh 推理强度运行. 基准在研究环境中进行, 某些情况下输出可能与生产环境的 ChatGPT 略有不同.

[2026](https://openai.com/news/?tags=2026)

2026 (标签)

Author

作者

OpenAI

OpenAI

Footnotes

脚注

Human performance reported in 1 [OSWorld: Benchmarking Multimodal Agents.for Open-Ended Tasks in Real Computer Environments](https://arxiv.org/abs/2404.07972)

1 人类表现数据出自 OSWorld: Benchmarking Multimodal Agents for Open-Ended Tasks in Real Computer Environments. (脚注编号 1 被挪到了句中, 标题里多了一个句点.)

## Keep reading (继续阅读)

![Image block](images/p18-chatgpt-ads-expands-to-southeast-asia-and-taiwan-https.png)

图: 推荐阅读卡片封面, 紫粉色渐变, 没有文字.

[**ChatGPT Ads expands to Southeast Asia and Taiwan**](https://openai.com/index/chatgpt-ads-expands-southeast-asia-taiwan/)

**ChatGPT 广告扩展到东南亚和台湾**

![Image block](images/p18-view-all-https-openai-com-news.png)

图: 推荐阅读卡片封面, 绿粉色渐变, 没有文字. 文件名取自旁边的 「View all」 链接.

[View all](https://openai.com/news/)

查看全部

[**Product Sep 23, 2026**](https://openai.com/index/chatgpt-ads-expands-southeast-asia-taiwan/)

**产品 2026 年 9 月 23 日**

[**Product Sep 22, 2026**](https://openai.com/index/better-prompt-caching-for-gpt-6/)

**产品 2026 年 9 月 22 日**

![Image block](images/p18-introducing-gpt-6-sol-and-luna-https-openai-com-index.png)

图: 推荐阅读卡片封面, 深色星空里一个太阳和一弯月亮, 对应 GPT-6 Sol 和 Luna 两个名字.

[Introducing GPT-6 Sol and Luna](https://openai.com/index/introducing-gpt-6-sol-and-luna/)

推出 GPT-6 Sol 和 Luna

[**Product Sep 22, 2026**](https://openai.com/index/introducing-gpt-6-sol-and-luna/)

**产品 2026 年 9 月 22 日**

<table><tr><td colspan="5">We use cookies</td></tr><tr><td colspan="4">We use cookies to help this site function, understand service usage, and support marketing efforts. Visit preferences anytime. View our Cookie Policy for more info.</td><td>to change</td></tr><tr><td>Research</td><td>Products</td><td>Business</td><td>Company</td><td>More</td></tr><tr><td>Research Index</td><td>ChatGPT ↗</td><td>Overview</td><td>About Us</td><td>Stories</td></tr><tr><td>Research Overview</td><td>ChatGPT Business ↗</td><td>Solutions</td><td>Our Charter</td><td>Academy</td></tr><tr><td>Economic Research</td><td>ChatGPT Enterprise ↗</td><td>Resources</td><td>Careers</td><td>Supply Co.</td></tr><tr><td></td><td>ChatGPT for Education ↗</td><td>Plugins</td><td>News</td><td>Livestreams</td></tr></table>

站点页脚导航 (前两行是 Cookie 横幅): 研究 (研究索引, 研究概览, 经济研究); 产品 (ChatGPT, ChatGPT Business, ChatGPT Enterprise, ChatGPT for Education); 商业 (概览, 解决方案, 资源, 插件); 公司 (关于我们, 我们的章程, 招聘, 新闻); 更多 (故事, 学院, Supply Co., 直播).

<!-- page 19 of 19 -->

## OpenAI (OpenAI 站点页脚)

<table><tr><td>GPT-5.6</td><td></td><td>Contact Sales</td><td></td></tr><tr><td>GPT-5.5</td><td>API Platform</td><td></td><td>Terms &amp; Policies</td></tr><tr><td rowspan="2">GPT-5.4</td><td>Overview</td><td>Developers</td><td>Terms of Use</td></tr><tr><td>API Log In ↗</td><td>Apps SDK ↗</td><td>Privacy Policy</td></tr><tr><td>Safety</td><td>Docs ↗</td><td>Open Models</td><td>Other Policies</td></tr><tr><td>Safety Approach</td><td></td><td>Docs ↗</td><td></td></tr><tr><td>Deployment Safety ↗</td><td></td><td>Resources ↗</td><td></td></tr><tr><td>Security &amp; Privacy</td><td></td><td>Developer Forum ↗</td><td></td></tr><tr><td>Trust &amp; Transparency</td><td></td><td></td><td></td></tr></table>

站点页脚导航, 各栏被打散: 模型 (GPT-5.6, GPT-5.5, GPT-5.4); 安全 (安全方法, 部署安全, 安全与隐私, 信任与透明); API 平台 (概览, API 登录, 文档); 开发者 (Apps SDK, 开放模型, 文档, 资源, 开发者论坛); 条款与政策 (使用条款, 隐私政策, 其他政策); 联系销售.

X 0 in 0 回 日

(社交媒体图标被识别成的字符.)

**OpenAI © 2015–2026** <strong><u>Manage Cookies</u></strong>

**OpenAI © 2015–2026** 管理 Cookie

**English United States**

**英语 美国**

We use cookies We use cookies to help this site function, understand service usage, and support marketing efforts. Visit preferences anytime. View our [Cookie Policy](https://openai.com/policies/cookie-policy/) for more info.

(Cookie 横幅, 同上.)

to change

(横幅残字.)
