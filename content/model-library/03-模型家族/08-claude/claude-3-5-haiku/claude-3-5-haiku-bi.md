---
title: "Claude 3.5 Haiku · 对照译稿"
category: "模型库"
tags: ["Claude", "对照译稿"]
published: true
excerpt: "Claude 3.5 Haiku 公开材料的逐段中英对照译稿，附读报告时的疑问块。"
---
<!-- page 1 of 9 -->

A

A (页面左上角标志的抓取残留, PDF 正文里没有这个字母)

Announcements

公告

# Introducing computer use, a new Claude 3.5 Sonnet, and Claude 3.5 Haiku

# 推出 computer use, 新版 Claude 3.5 Sonnet 与 Claude 3.5 Haiku

Oct 22, 2024

2024 年 10 月 22 日

![Image block](images/p01-update-12-03-2024-we-have-revised-the-pricing-for.png)

> **对一下:** 这张题图的文件名取自价格更新那句话, 它画的是价格吗?
> 不是. 图里是橙底上的白色鼠标指针, 一只手的轮廓和一张人脸侧影, 指针旁还有三道表示点击的短线, 对应的是本页主推的 computer use: 「looking at a screen, moving a cursor, clicking buttons」. 文件名 「update-12-03-2024-we-have-revised-the-pricing-for」 只是转换工具拿图下方第一行文字命名的结果. PDF 第 1 页也只有这一张位图. 全文 9 页里, md 只落了两张图: 这张题图和第 9 页的 LinkedIn 小图标, 第 2 页的评测表在 PDF 里是一张图, md 把它转成了文字表格.

Update (12/03/2024): We have revised the pricing for Claude 3.5 Haiku. The model is now priced at \$0.80 MTok input / \$4 MTok output.

更新 (12/03/2024): 我们调整了 Claude 3.5 Haiku 的价格. 现价为每 MTok 输入 \$0.80, 每 MTok 输出 \$4.

> **想:** 这条更新说 「revised」, 原价是多少, 降了还是涨了?
> 本页没给原价, 只给了调整后的数: 输入 \$0.80 / MTok, 输出 \$4 / MTok, 输出正好是输入的 5 倍. MTok 指每百万 token. 更新日期 12/03/2024 比正文发布日 Oct 22, 2024 晚了六周, 而正文写的是 Haiku 「will be released later this month」, 所以这条更新是在模型上线之后补到页首的. 调价方向和幅度都要去定价页查, 从这页读不出来. 正文里唯一的另一处价格描述是给新 Sonnet 的 「at the same price and speed as its predecessor」, 同样没有数字.

Today, we’re announcing an upgraded Claude 3.5 Sonnet, and a new model, Claude 3.5 Haiku. The upgraded Claude 3.5 Sonnet delivers across-the-board improvements over its predecessor, with particularly significant gains in coding—an area where it already led the field. Claude 3.5 Haiku matches the performance of Claude 3 Opus, our prior largest model, on many evaluations at a similar speed to the previous generation of Haiku.

今天我们发布升级版 Claude 3.5 Sonnet, 以及一款新模型 Claude 3.5 Haiku. 升级版 Claude 3.5 Sonnet 相比前代全面进步, 编码方面提升尤其明显, 而编码本来就是它领先业界的领域. Claude 3.5 Haiku 的速度与上一代 Haiku 相近, 在许多评测上的表现追平了我们上一代最大的模型 Claude 3 Opus.

> **问:** 「matches the performance of Claude 3 Opus」 在下面的表里能核对吗?
> 核对不了. 第 2 页的评测表有七列: Claude 3.5 Sonnet (new), Claude 3.5 Haiku, Claude 3.5 Sonnet, GPT-4o, GPT-4o mini, Gemini 1.5 Pro, Gemini 1.5 Flash, 没有 Claude 3 Opus, 也没有 Claude 3 Haiku. 所以 「on many evaluations」 到底是哪些评测, 追平的幅度多大, 本页都没给. 第 3 页 Haiku 小节把说法升级成 「surpasses even Claude 3 Opus ... on many intelligence benchmarks」, 仍然没有数字. 速度这一半也一样, 「a similar speed to the previous generation of Haiku」 是相对描述, 全页没有 token/s 或延迟毫秒数. 第 5 页 「our new models」 链接指向 Claude 3 Model Card October Addendum, 与 Opus 的逐项对比只能去那份文档里找.

<!-- page 2 of 9 -->

We’re also introducing a groundbreaking new capability in public beta: computer use. Available [today on the API](https://docs.anthropic.com/en/docs/build-with-claude/computer-use), developers can direct Claude to use computers the way people do—by looking at a screen, moving a cursor, clicking buttons, and typing text. Claude 3.5 Sonnet is the first frontierAI model to offer computer use in public beta. At this stage, it is still [experimental](https://www.anthropic.com/news/developing-computer-use)—at times cumbersome and error-prone. We're releasing computer use early for feedback from developers, and expect the capability to improve rapidly over time.

我们还以公开 beta 的形式推出一项开创性的新能力: computer use. 它 [今天已在 API 上提供](https://docs.anthropic.com/en/docs/build-with-claude/computer-use), 开发者可以让 Claude 像人一样使用电脑: 看屏幕, 移动光标, 点击按钮, 输入文字. Claude 3.5 Sonnet 是第一个以公开 beta 形式提供 computer use 的前沿 AI 模型. 现阶段它仍是 [实验性的](https://www.anthropic.com/news/developing-computer-use), 有时笨拙, 也容易出错. 我们提前放出 computer use, 是为了收集开发者反馈, 并预计这项能力会随时间快速改进.

> **拆开:** 「looking at a screen, moving a cursor, clicking buttons, and typing text」 落到接口上, 模型收的是什么, 吐的是什么?
> 本页给了两处线索. 第 4 页说 「we've built an API that allows Claude to perceive and interact with computer interfaces」, 并举例把一句自然语言指令翻译成 「check a spreadsheet; move the cursor to open a web browser; ... fill out a form」 这样一串电脑命令, 这是输出端: 光标移动, 点击, 键入这类动作. 输入端的线索在 OSWorld 那句: Claude 3.5 Sonnet 的 14.9% 是 「in the screenshotonly category」 拿到的, 说明模型看屏幕靠的是截图. 截图格式, 动作指令的具体 schema, 每步回传什么, 本页都没写, 第 2 页的 「today on the API」 链接指向的文档才有. md 里 「frontierAI」 与 「screenshotonly」 是转换丢了空格和连字符, PDF 原文是 「frontier AI」 和 「screenshot-only」.

Asana, Canva, Cognition, DoorDash, Replit, and The Browser Company have already begun to explore these possibilities, carrying out tasks that require dozens, and sometimes even hundreds, of steps to complete. For example, Replit is using Claude 3.5 Sonnet's capabilities with computer use and UI navigation to develop a key feature that evaluates apps as they’re being built for their Replit Agent product.

Asana, Canva, Cognition, DoorDash, Replit 和 The Browser Company 已经开始探索这些可能, 执行需要几十步, 有时甚至上百步才能完成的任务. 例如, Replit 正在用 Claude 3.5 Sonnet 的 computer use 与 UI 导航能力, 为其 Replit Agent 产品开发一项关键功能: 在应用构建过程中对其进行评估.

The upgraded Claude 3.5 Sonnet is now available for all users. Starting today, developers can build with the computer use beta on the Anthropic API, Amazon Bedrock, and Google Cloud’s Vertex AI. The new Claude 3.5 Haiku will be released later this month.

升级版 Claude 3.5 Sonnet 现已向所有用户开放. 从今天起, 开发者可以在 Anthropic API, Amazon Bedrock 和 Google Cloud 的 Vertex AI 上基于 computer use beta 进行开发. 新的 Claude 3.5 Haiku 将在本月晚些时候发布.

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
| 研究生水平推理 GPQA (Diamond) | 65.0% (0-shot CoT) | 41.6% (0-shot CoT) | 59.4% (0-shot CoT) | 53.6% (0-shot CoT) | 40.2% (0-shot CoT) | 59.1% (0-shot CoT) | 51.0% (0-shot CoT) |
| 本科水平知识 MMLU Pro | 78.0% (0-shot CoT) | 65.0% (0-shot CoT) | 75.1% (0-shot CoT) | - | - | 75.8% (0-shot CoT) | 67.3% (0-shot CoT) |
| 代码 HumanEval | 93.7% (0-shot) | 88.1% (0-shot) | 92.0% (0-shot) | 90.2% (0-shot) | 87.2% (0-shot) | - | - |
| 数学解题 MATH | 78.3% (0-shot CoT) | 69.2% (0-shot CoT) | 71.1% (0-shot CoT) | 76.6% (0-shot CoT) | 70.2% (0-shot CoT) | 86.5% (4-shot CoT) | 77.9% (4-shot CoT) |
| 高中数学竞赛 AIME 2024 | 16.0% (0-shot CoT) | 5.3% (0-shot CoT) | 9.6% (0-shot CoT) | 9.3% (0-shot CoT) | - | - | - |
| 视觉问答 MMMU | 70.4% (0-shot CoT) | - | 68.3% (0-shot CoT) | 69.1% (0-shot CoT) | 59.4% (0-shot CoT) | 65.9% (0-shot CoT) | 62.3% (0-shot CoT) |
| Agent 编码 SWE-bench Verified | 49.0% | 40.6% | 33.4% | - | - | - | - |
| Agent 工具调用 TAU-bench | 零售 69.2%, 航空 46.0% | 零售 51.0%, 航空 22.8% | 零售 62.6%, 航空 36.0% | - | - | - | - |

> **看表:** 同是小档模型, Claude 3.5 Haiku 对 GPT-4o mini 是全面占优吗?
> 不是. 两列都有分数的只有三行: GPQA (Diamond) 41.6% 对 40.2%, HumanEval 88.1% 对 87.2%, MATH 69.2% 对 70.2%. Haiku 赢两行, 差距分别是 1.4 和 0.9 个百分点, 输一行, 差 1.0 个百分点. MMLU Pro 和 AIME 2024 上 GPT-4o mini 是 「-」, MMMU 上 Haiku 是 「-」, SWE-bench Verified 与 TAU-bench 只有三列 Claude 有数. 也就是说, 表里 Haiku 拉开差距的两项 agent 评测恰好没有 GPT-4o mini 的对照, 能对上的三项基本持平. 正文把 Haiku 的卖点放在 「particularly strong on coding tasks」 和 SWE-bench 上, 和表里这种分布是一致的.

> **核对:** md 表里看不出哪格最好, PDF 原图有标记吗?
> 有. PDF 第 2 页的表是一张图: 前两列 (两款新模型) 被一个橙色框圈在一起, 每行最高分用绿字标出. 绿字几乎都落在 Claude 3.5 Sonnet (new) 一列, 唯一例外是 MATH 行的 Gemini 1.5 Pro 86.5%. 而这一格的设置是 「4-shot CoT」, Gemini 两列 MATH 都是 4-shot, 其余五列都是 0-shot CoT. 所以 MATH 这一行的最高分和别的分数不在同一种提示设置下测得, 页面只标了设置, 没有解释为何 Gemini 用 4-shot. md 转换把颜色和框都丢了, 只剩数字.

> **确认:** Haiku 在 MMMU 上是 「-」, 是没测还是没这项能力?
> 按本页的话, 是发布时没有图像输入. 第 4 页写 Claude 3.5 Haiku 「initially as a text-only model and with image input to follow」. MMMU 这一行标题是 「Visual Q/A」, 需要看图作答, 纯文本模型没法参加, 所以这一格空着. 同一行里其余六列都有分数, 包括 GPT-4o mini 的 59.4%. 这也意味着表里 Haiku 的全部分数都是纯文本评测, 看不出它将来加上图像输入后的视觉水平.

\* Our evaluation tables exclude OpenAl's o1 model family as they depend on extensive pre-response computation time, unlike typical models. This fundamental difference makes performance comparisons difficult.

\* 我们的评测表没有收录 OpenAI 的 o1 系列模型, 因为它们与常规模型不同, 依赖回答前大量的计算时间 (TestingTime). 这一根本差异让性能比较变得困难.

> **停一下:** 表里因为 TestingTime 把 o1 排除在外, 第 3 页正文却拿 o1-preview 来比?
> 两处确实用了不同口径. 脚注说 o1 系列 「depend on extensive pre-response computation time」, 所以评测表不收. 但第 3 页讲新 Sonnet 的 SWE-bench Verified 49.0% 时写的是 "scoring higher than all publicly available models—including reasoning models like OpenAI o1-preview and specialized systems designed for agentic coding". 也就是说, 在 SWE-bench 这一项上, 页面在正文里和 o1-preview 做了比较, 只是没把 o1-preview 的分数放进表. o1-preview 的具体分数, 测试条件, 花了多少 TestingTime, 本页都没给. 另外 md 里 「OpenAl's」 的 「l」 是 OCR 把大写 I 认错了, 原图是 OpenAI.

<!-- page 3 of 9 -->

## Claude 3.5 Sonnet: Industry-leading software engineering skills

## Claude 3.5 Sonnet: 业界领先的软件工程能力

The updated [Claude 3.5 Sonnet](https://www.anthropic.com/claude/sonnet) shows wide-ranging improvements on industry benchmarks, with particularly strong gains in agentic coding and tool use tasks. On coding, it improves performance on [SWE-bench Verified](https://www.swebench.com/) from 33.4% to 49.0%, scoring higher than all publicly available models—including reasoning models like OpenAI o1-preview and specialized systems designed for agentic coding. It also improves performance on [TAU-bench](https://github.com/sierra-research/tau-bench), an agentic tool use task, from 62.6% to 69.2% in the retail domain, and from 36.0% to 46.0% in the more challenging airline domain. The new Claude 3.5 Sonnet offers these advancements at the same price and speed as its predecessor.

升级版 [Claude 3.5 Sonnet](https://www.anthropic.com/claude/sonnet) 在业界基准上全面提升, agent 编码与工具调用任务进步尤其大. 编码方面, 它在 [SWE-bench Verified](https://www.swebench.com/) 上的成绩从 33.4% 提高到 49.0%, 高于所有公开可用的模型, 包括 OpenAI o1-preview 这类推理模型, 以及专为 agent 编码设计的系统. 它在 agent 工具调用任务 [TAU-bench](https://github.com/sierra-research/tau-bench) 上也有提升: 零售领域从 62.6% 升到 69.2%, 难度更高的航空领域从 36.0% 升到 46.0%. 新版 Claude 3.5 Sonnet 带来这些进步, 价格和速度与前代相同.

> **再看:** TAU-bench 说航空领域 「more challenging」, 三款 Claude 在两个领域之间掉得一样多吗?
> 掉得不一样. 用航空分数除以零售分数: 新 Sonnet 是 46.0 / 69.2, 约 66.5%; 旧 Sonnet 是 36.0 / 62.6, 约 57.5%; Haiku 是 22.8 / 51.0, 约 44.7%. 模型越弱, 从零售换到航空时保留下来的比例越低, Haiku 的航空分数不到零售的一半. 新 Sonnet 的两项提升也不对称: 零售加 6.6 个百分点, 航空加 10.0 个百分点, 难的一侧涨得更多. 页面没解释航空领域难在哪里, 也没给两个领域各有多少任务, 这些要看 TAU-bench 的链接.

Early customer feedback suggests the upgraded Claude 3.5 Sonnet represents a significant leap forAI-powered coding. GitLab, which tested the model for DevSecOps tasks, found it delivered stronger reasoning (up to 10% across use cases) with no added latency, making it an ideal choice to power multi-step software development processes. Cognition uses the new Claude 3.5 Sonnet for autonomous AI evaluations, and experienced substantial improvements in coding, planning, and problem-solving compared to the previous version. The Browser Company, in using the model for automating web-based workflows, noted Claude 3.5 Sonnet outperformed every model they’ve tested before.

早期客户反馈表明, 升级版 Claude 3.5 Sonnet 是 AI 辅助编码的一次重大飞跃. GitLab 用它测试 DevSecOps 任务, 发现它推理更强 (各类用例中最高提升 10%), 而且没有增加延迟, 很适合驱动多步骤的软件开发流程. Cognition 把新版 Claude 3.5 Sonnet 用于自主 AI 评估, 在编码, 规划和问题求解上都比上一版有明显改进. The Browser Company 在用它自动化网页工作流时指出, Claude 3.5 Sonnet 胜过他们此前测过的所有模型.

> **问:** GitLab 那句 「up to 10% across use cases」 能当成平均提升 10% 来读吗?
> 不能. 「up to」 是上限, 说的是在他们测过的各个用例里提升最多的那个到了 10%, 其余用例可能更少. 提升的是什么指标, 相对值还是绝对百分点, 用例有几个, 本页都没写. 同一句里的 「no added latency」 和段首 「the same price and speed as its predecessor」 口径一致, 讲的都是新 Sonnet 相对旧 Sonnet 不变慢. 这一段三家客户的反馈都是定性描述, 真正能拿来算的只有 GitLab 这一个 「up to 10%」.

As part of our continued effort to partner with external experts, joint pre-deployment testing of the new Claude 3.5 Sonnet model was conducted by the US AI Safety Institute (US AISI) and the UK Safety Institute (UK AISI).

作为我们持续与外部专家合作的一部分, 美国 AI 安全研究所 (US AISI) 与英国安全研究所 (UK AISI) 对新版 Claude 3.5 Sonnet 联合开展了部署前测试.

We also evaluated the upgraded Claude 3.5 Sonnet for catastrophic risks and found that the ASL-2 Standard, as outlined in our [Responsible Scaling Policy](https://www.anthropic.com/news/announcing-our-updated-responsible-scaling-policy), remains appropriate for this model.

我们还评估了升级版 Claude 3.5 Sonnet 的灾难性风险, 结论是我们 [负责任 Scaling 政策](https://www.anthropic.com/news/announcing-our-updated-responsible-scaling-policy) 中规定的 ASL-2 标准对这款模型仍然适用.

> **回看:** 部署前测试和 ASL-2 结论, 本页有没有说到 Haiku?
> 没有. 这两段的主语都是 「the new Claude 3.5 Sonnet model」 和 「the upgraded Claude 3.5 Sonnet」: US AISI 与 UK AISI 的联合部署前测试, 灾难性风险评估, 「ASL-2 Standard ... remains appropriate」, 都只针对新 Sonnet. 紧接着的 Haiku 小节只讲能力, 用途和上线渠道, 没有一句安全评估. 第 4 页的安全内容 (新分类器识别 computer use 是否被用于造成危害) 针对的也是 computer use 这项能力, 不是某个模型的风险等级. Haiku 的安全信息如果有, 要去第 5 页链接的 Model Card October Addendum 里找. ASL-2 的具体要求本页也没展开, 只给了 Responsible Scaling Policy 的链接.

## Claude 3.5 Haiku: State-of-the-art meets affordability and speed

## Claude 3.5 Haiku: 前沿水平兼顾实惠与速度

[Claude 3.5 Haiku](https://www.anthropic.com/claude/haiku) is the next generation of our fastest model. For a similar speed to Claude 3 Haiku, Claude 3.5 Haiku improves across every skill set and surpasses even Claude 3 Opus, the largest model in our previous generation, on many intelligence benchmarks. Claude 3.5 Haiku is particularly strong on coding tasks. For example, it scores 40.6% on SWE-bench Verified, outperforming many agents using publicly available state-of-the-art models—including the original Claude 3.5 Sonnet and GPT-4o.

[Claude 3.5 Haiku](https://www.anthropic.com/claude/haiku) 是我们最快模型的新一代. 在与 Claude 3 Haiku 速度相近的前提下, Claude 3.5 Haiku 各项能力全面提升, 在许多智能基准上甚至超过了上一代最大的模型 Claude 3 Opus. Claude 3.5 Haiku 在编码任务上尤其强. 例如, 它在 SWE-bench Verified 上得到 40.6%, 超过了许多基于公开可用前沿模型搭建的 agent, 其中包括原版 Claude 3.5 Sonnet 和 GPT-4o.

> **确认:** Haiku 以 40.6% 胜过原版 Claude 3.5 Sonnet, 能说明它整体追上了原版 Sonnet 吗?
> 不能. 把表里 Haiku 与原版 Claude 3.5 Sonnet 两列逐行对照, Haiku 只在 SWE-bench Verified 一行领先 (40.6% 对 33.4%, 高 7.2 个百分点). 其余可比的各行它都落后: GPQA 低 17.8, MMLU Pro 低 10.1, HumanEval 低 3.9, MATH 低 1.9, AIME 2024 低 4.3, TAU-bench 零售低 11.6, 航空低 13.2 个百分点. 另外句中比较对象是 「many agents using publicly available state-of-the-art models」, 比的是基于这些模型搭的 agent 系统, 而表里 GPT-4o 的 SWE-bench 一格是 「-」, 所以 「outperforming ... GPT-4o」 这半句在表里找不到对应分数. Haiku 的 40.6% 用的是什么 agent 框架, 允许多少步, 本页也没说.

<!-- page 4 of 9 -->

With low latency, improved instruction following, and more accurate tool use, Claude 3.5 Haiku is well suited for user-facing products, specialized sub-agent tasks, and generating personalized experiences from huge volumes of data—like purchase history, pricing, or inventory records.

凭借低延迟, 更好的指令遵循和更准确的工具调用, Claude 3.5 Haiku 很适合面向用户的产品, 专门化的子 agent 任务, 以及从海量数据 (如购买记录, 价格或库存记录) 中生成个性化体验.

> **想:** 「low latency」 和 「sub-agent tasks」 放在一起, 本页给了多快的数吗?
> 没给. 全页关于 Haiku 速度的说法只有三处, 都是相对的: 「at a similar speed to the previous generation of Haiku」, 「For a similar speed to Claude 3 Haiku」, 以及这里的 「low latency」. 没有 token/s, 没有首 token 延迟, 也没有与 Sonnet 的速度比. 能落到数字上的只有页首更新后的价格, \$0.80 / \$4 每 MTok. 三类用途里, 子 agent 任务与 「more accurate tool use」 呼应, 表里对应的是 TAU-bench, 而 Haiku 在那里是零售 51.0%, 航空 22.8%, 都低于两版 Sonnet. 页面推荐它做子 agent, 理由只有延迟, 指令遵循和工具调用三条定性描述, 没说明在 agent 系统里它和更大的模型怎么分工.

Claude 3.5 Haiku will be made available later this month across our first-partyAPI, Amazon Bedrock, and Google Cloud’s Vertex AI—initially as a text-only model and with image input to follow.

Claude 3.5 Haiku 将在本月晚些时候通过我们的第一方 API, Amazon Bedrock 和 Google Cloud 的 Vertex AI 上线, 最初是纯文本模型, 之后再加入图像输入.

> **拆开:** 本页的 computer use 能配 Haiku 用吗?
> 按本页的描述, 上线时不能. computer use 的工作方式是 「looking at a screen」, OSWorld 成绩也注明是 「screenshot-only」 类别, 必须读截图; 而 Haiku 「initially as a text-only model」. 全页提到 computer use 时主语都是 Claude 3.5 Sonnet: 「Claude 3.5 Sonnet is the first frontier AI model to offer computer use in public beta」, OSWorld 的 14.9% 和 22.0% 也是 Sonnet 的. 所以 Haiku 表里那两项 agent 分数, SWE-bench Verified 和 TAU-bench, 都是纯文本工具调用环境下的成绩, 和 computer use 是两回事. 图像输入什么时候加上, 加上后是否支持 computer use, 本页没说. 另外 md 的 「first-partyAPI」 在 PDF 里是 「first-party API」.

## Teaching Claude to navigate computers, responsibly

## 负责任地教 Claude 操作电脑

With computer use, we're trying something fundamentally new. Instead of making specific tools to help Claude complete individual tasks, we're teaching it general computer skills—allowing it to use a wide range of standard tools and software programs designed for people. Developers can use this nascent capability to automate repetitive processes, [build and test software](https://www.youtube.com/watch?v=vH2f7cjXjKI), and [conduct open-ended tasks like research](https://youtu.be/jqx18KgIzAE).

通过 computer use, 我们在尝试一种全新的做法. 我们不再为帮 Claude 完成某项具体任务而专门造工具, 而是教它通用的电脑技能, 让它能使用为人设计的各种标准工具和软件. 开发者可以用这项初生的能力来自动化重复流程, [构建和测试软件](https://www.youtube.com/watch?v=vH2f7cjXjKI), 以及 [开展研究这类开放式任务](https://youtu.be/jqx18KgIzAE).

To make these general skills possible, we've built an API that allows Claude to perceive and interact with computer interfaces. Developers can integrate this API to enable Claude to translate instructions (e.g., “use data from my computer and online to fill out this form”) into computer commands (e.g. check a spreadsheet; move the cursor to open a web browser; navigate to the relevant web pages; fill out a form with the data from those pages; and so on). On [OSWorld](https://os-world.github.io/), which evaluates AI models' ability to use computers like people do, Claude 3.5 Sonnet scored 14.9% in the screenshotonly category—notably better than the next-best AI system's score of 7.8%. When afforded more steps to complete the task, Claude scored 22.0%.

为了让这些通用技能成为可能, 我们构建了一个 API, 让 Claude 能够感知并操作电脑界面. 开发者接入这个 API 后, Claude 就能把指令 (例如 「用我电脑里和网上的数据填好这张表」) 翻译成电脑命令 (例如查看电子表格; 移动光标打开浏览器; 进入相关网页; 用这些网页上的数据填表; 等等). [OSWorld](https://os-world.github.io/) 评估 AI 模型像人一样使用电脑的能力. 在其中仅截图 (screenshot-only) 类别里, Claude 3.5 Sonnet 得到 14.9%, 明显高于排名第二的 AI 系统的 7.8%. 允许用更多步骤完成任务时, Claude 得到 22.0%.

> **停一下:** 14.9% 和 22.0% 差在 「more steps」, 步数上限各是多少?
> 本页没给. 只说 「When afforded more steps to complete the task, Claude scored 22.0%」, 没写基准设置允许多少步, 放宽到多少步. 允许更多步骤, 本质上是在推理阶段给同一个模型更多动作和观察的机会, 属于 TestingTime 的投入, 与脚注里排除 o1 时说的 「pre-response computation time」 是同一类思路, 只是这里花在多轮交互上. 从数字看, 同一模型多给步数就从 14.9% 涨到 22.0%, 加了 7.1 个百分点, 比它领先第二名 (7.8%) 的幅度还大. 第二名是哪个系统, 是否也在同样的步数下测得, 页面同样没说.

While we expect this capability to improve rapidly in the coming months, Claude's current ability to use computers is imperfect. Some actions that people perform effortlessly—scrolling, dragging, zooming—currently present challenges for Claude and we encourage developers to begin exploration with low-risk tasks. Because computer use may provide a new vector for more familiar threats such as spam, misinformation, or fraud, we're taking a proactive approach to promote its safe deployment. We've developed new classifiers that can identify when computer use is being used and whether harm is occurring. You can read more about the research process behind this new skill, along with further discussion of safety measures, in our post on [developing computer use](http://anthropic.com/news/developing-computer-use).

我们预计这项能力会在未来几个月快速进步, 但 Claude 目前使用电脑的能力并不完善. 一些人做起来毫不费力的动作, 比如滚动, 拖拽, 放大缩小, 目前对 Claude 仍有难度, 我们建议开发者先从低风险任务开始探索. 由于 computer use 可能为垃圾信息, 虚假信息或欺诈这类常见威胁提供新的途径, 我们正在主动推动它的安全部署. 我们开发了新的分类器, 能识别何时在使用 computer use, 以及是否正在造成危害. 关于这项新技能背后的研究过程和更多安全措施, 可以阅读我们的 [开发 computer use](http://anthropic.com/news/developing-computer-use) 一文.

<!-- page 5 of 9 -->

## Looking ahead

## 展望

Learning from the initial deployments of this technology, which is still in its earliest stages, will help us better understand both the potential and the implications of increasingly capable AI systems.

这项技术仍处在最早期阶段. 从它的首批部署中学习, 会帮助我们更好地理解能力日益增强的 AI 系统有哪些潜力, 又会带来哪些影响.

We’re excited for you to explore [our new models](https://assets.anthropic.com/m/1cd9d098ac3e6467/original/Claude-3-Model-Card-October-Addendum.pdf) and the public beta of computer use and welcome you to [share your feedback](mailto:feedback@anthropic.com) with us. We believe these developments will open up new possibilities for how you work with Claude, and we look forward to seeing what you'll create.

欢迎你来探索 [我们的新模型](https://assets.anthropic.com/m/1cd9d098ac3e6467/original/Claude-3-Model-Card-October-Addendum.pdf) 和 computer use 公开 beta, 也欢迎 [向我们反馈](mailto:feedback@anthropic.com). 我们相信这些进展会为你与 Claude 的协作打开新的可能, 期待看到你的作品.

> **对一下:** 「our new models」 这个链接指向哪里, 和本页是什么关系?
> 它指向的不是模型介绍页, 而是一份 PDF: 「Claude-3-Model-Card-October-Addendum.pdf」, 即 Claude 3 模型卡的十月增补. 本页是发布公告, 只给了一张八行评测表和若干定性描述; 表里缺的 Claude 3 Opus 对照, Haiku 的安全评估, 各项评测的具体设置, 按这个链接的名字看应当放在那份增补里. 本目录只有公告页本身, 没有那份模型卡, 所以这里读不到它的内容. 顺带一提, 这是全页唯一指向技术文档的链接, 其余链接是产品页, 基准官网, 视频和两篇博客.

## X

## X (分享按钮的抓取残留, 无对应正文)

## Related content

## 相关内容

Claude discovers a novel enzyme system with CRISPR-like repeats

Claude 发现一种带有类 CRISPR 重复序列的新型酶系统

We’re announcing a new life sciences research group and laboratory at Anthropic. This post introduces the team behind this work and shares early results in which Claude discovered a novel enzyme system with properties reminiscent of CRISPR, with only high-level direction from our scientists.

我们宣布在 Anthropic 成立新的生命科学研究组和实验室. 本文介绍这项工作背后的团队, 并分享早期成果: 在科学家只给出高层方向的情况下, Claude 发现了一种特性让人联想到 CRISPR 的新型酶系统.

[Read more](https://www.anthropic.com/news/claude-discovers-novel-enzyme-system)

[阅读全文](https://www.anthropic.com/news/claude-discovers-novel-enzyme-system)

Partnering with Accenture on embedded evaluation

与 Accenture 合作开展嵌入式评估

[Read more](https://www.anthropic.com/news/accenture-embedded-evaluation)

[阅读全文](https://www.anthropic.com/news/accenture-embedded-evaluation)

Introducing the Life Sciences Verification Program

推出生命科学验证计划

The Life Sciences Verification Program (LSVP) gives life science professionals access to Claude Mythos, Opus, and Sonnet models with a refined set of safeguards more permissive for biology-related work.

生命科学验证计划 (LSVP) 让生命科学从业者可以使用 Claude Mythos, Opus 和 Sonnet 模型, 并配以一套经过细化, 对生物相关工作更宽松的安全防护.

[Read more](https://www.anthropic.com/news/life-sciences-verification-program)

[阅读全文](https://www.anthropic.com/news/life-sciences-verification-program)

AI

AI (页面标志的抓取残留)

<!-- page 6 of 9 -->

## Products

## 产品

[Claude](https://claude.com/product/overview)

[Claude](https://claude.com/product/overview)

[Claude Code](https://claude.com/product/claude-code)

[Claude Code](https://claude.com/product/claude-code)

[Claude Code Enterprise](https://claude.com/product/claude-code/enterprise)

[Claude Code 企业版](https://claude.com/product/claude-code/enterprise)

[Claude Cowork](https://claude.com/product/cowork)

[Claude Cowork](https://claude.com/product/cowork)

[@Claude](https://claude.com/product/tag)

[@Claude](https://claude.com/product/tag)

[Claude Design](https://claude.com/product/design)

[Claude Design](https://claude.com/product/design)

[Claude Science](https://claude.com/product/claude-science)

[Claude Science](https://claude.com/product/claude-science)

[Claude Security](https://claude.com/product/claude-security)

[Claude Security](https://claude.com/product/claude-security)

[Claude in Chrome](https://claude.com/claude-in-chrome)

[Chrome 中的 Claude](https://claude.com/claude-in-chrome)

[Claude for Microsoft 365](https://claude.com/claude-for-microsoft-365)

[面向 Microsoft 365 的 Claude](https://claude.com/claude-for-microsoft-365)

[Skills](https://www.claude.com/skills)

[Skills (技能)](https://www.claude.com/skills)

[Download app](https://claude.ai/download)

[下载应用](https://claude.ai/download)

[Pricing](https://claude.com/pricing)

[价格](https://claude.com/pricing)

[Log in to Claude](https://claude.ai/)

[登录 Claude](https://claude.ai/)

Models

模型

[Mythos](https://www.anthropic.com/claude/mythos)

[Mythos](https://www.anthropic.com/claude/mythos)

[Fable](https://www.anthropic.com/claude/fable)

[Fable](https://www.anthropic.com/claude/fable)

[Opus](https://www.anthropic.com/claude/opus)

[Opus](https://www.anthropic.com/claude/opus)

[Sonnet](https://www.anthropic.com/claude/sonnet)

[Sonnet](https://www.anthropic.com/claude/sonnet)

[Haiku](https://www.anthropic.com/claude/haiku)

[Haiku](https://www.anthropic.com/claude/haiku)

Solutions

解决方案

[AI agents](https://claude.com/solutions/agents)

[AI agent](https://claude.com/solutions/agents)

[Code modernization](https://claude.com/solutions/code-modernization)

[代码现代化](https://claude.com/solutions/code-modernization)

[Coding](https://claude.com/solutions/coding)

[编程](https://claude.com/solutions/coding)

[Commerce](https://claude.com/solutions/commerce)

[商业](https://claude.com/solutions/commerce)

[Customer support](https://claude.com/solutions/customer-support)

[客户支持](https://claude.com/solutions/customer-support)

[Cybersecurity](https://claude.com/solutions/cybersecurity)

[网络安全](https://claude.com/solutions/cybersecurity)

[Enterprise](https://claude.com/solutions/enterprise)

[企业](https://claude.com/solutions/enterprise)

<!-- page 7 of 9 -->

## [Financial services](https://claude.com/solutions/financial-services)

## [金融服务](https://claude.com/solutions/financial-services)

[Government](https://claude.com/solutions/government)

[政府](https://claude.com/solutions/government)

[Healthcare](https://claude.com/solutions/healthcare)

[医疗健康](https://claude.com/solutions/healthcare)

[Higher education](https://claude.com/solutions/education)

[高等教育](https://claude.com/solutions/education)

[K-12 teachers](https://claude.com/solutions/teachers)

[K-12 教师](https://claude.com/solutions/teachers)

[Legal](https://claude.com/solutions/legal)

[法律](https://claude.com/solutions/legal)

[Life sciences](https://claude.com/solutions/life-sciences)

[生命科学](https://claude.com/solutions/life-sciences)

[Nonprofits](https://claude.com/solutions/nonprofits)

[非营利组织](https://claude.com/solutions/nonprofits)

[Sales](https://claude.com/solutions/sales)

[销售](https://claude.com/solutions/sales)

[Small business](https://claude.com/solutions/small-business)

[小型企业](https://claude.com/solutions/small-business)

Claude Platform

Claude 平台

[Overview](https://claude.com/platform/api)

[概览](https://claude.com/platform/api)

[Developer docs](https://platform.claude.com/docs)

[开发者文档](https://platform.claude.com/docs)

[Pricing](https://claude.com/pricing#api)

[价格](https://claude.com/pricing#api)

[Ecosystem](https://claude.com/ecosystem)

[生态](https://claude.com/ecosystem)

[Marketplace](https://claude.com/platform/marketplace)

[市场](https://claude.com/platform/marketplace)

[Regional compliance](https://claude.com/regional-compliance)

[区域合规](https://claude.com/regional-compliance)

[Claude on AWS](https://claude.com/partners/claude-on-aws)

[AWS 上的 Claude](https://claude.com/partners/claude-on-aws)

[Google Cloud](https://claude.com/partners/google-cloud-vertex-ai)

[Google Cloud](https://claude.com/partners/google-cloud-vertex-ai)

[Microsoft Foundry](https://claude.com/partners/microsoft-foundry)

[Microsoft Foundry](https://claude.com/partners/microsoft-foundry)

[Console login](https://platform.claude.com/)

[控制台登录](https://platform.claude.com/)

Resources

资源

[Blog](https://claude.com/blog)

[博客](https://claude.com/blog)

[Claude partner network](https://claude.com/partners)

[Claude 合作伙伴网络](https://claude.com/partners)

[Community](https://claude.com/community)

[社区](https://claude.com/community)

[Connectors](https://claude.com/connectors)

[连接器](https://claude.com/connectors)

[Courses](https://academy.claude.com/)

[课程](https://academy.claude.com/)

[Customer stories](https://claude.com/customers)

[客户案例](https://claude.com/customers)

<!-- page 8 of 9 -->

[Developer blog](https://claude.dev/)

[开发者博客](https://claude.dev/)

[Engineering at Anthropic](https://www.anthropic.com/engineering)

[Anthropic 工程博客](https://www.anthropic.com/engineering)

[Events](https://www.anthropic.com/events)

[活动](https://www.anthropic.com/events)

[Plugins](https://claude.com/plugins)

[插件](https://claude.com/plugins)

[Powered by Claude](https://claude.com/partners/powered-by-claude)

[Powered by Claude](https://claude.com/partners/powered-by-claude)

[Service partners](https://claude.com/partners/services)

[服务合作伙伴](https://claude.com/partners/services)

[Tutorials](https://claude.com/resources/tutorials)

[教程](https://claude.com/resources/tutorials)

[Use cases](https://claude.com/resources/use-cases)

[用例](https://claude.com/resources/use-cases)

Programs

计划

[Startups](https://claude.com/programs/startups)

[初创企业](https://claude.com/programs/startups)

[Scientists](https://claude.com/programs/team-plan-for-scientists)

[科学家](https://claude.com/programs/team-plan-for-scientists)

Help and security

帮助与安全

[Availability](https://www.anthropic.com/supported-countries)

[可用地区](https://www.anthropic.com/supported-countries)

[Status](https://status.anthropic.com/)

[服务状态](https://status.anthropic.com/)

[Support center](https://support.claude.com/en/)

[支持中心](https://support.claude.com/en/)

Company

公司

[Anthropic](https://www.anthropic.com/company)

[Anthropic](https://www.anthropic.com/company)

[Careers](https://www.anthropic.com/careers)

[招聘](https://www.anthropic.com/careers)

[Leadership](https://www.anthropic.com/company/leadership)

[领导团队](https://www.anthropic.com/company/leadership)

[Policy](https://www.anthropic.com/policy)

[政策](https://www.anthropic.com/policy)

[Economic Futures](https://www.anthropic.com/economic-futures)

[经济未来](https://www.anthropic.com/economic-futures)

[Research](https://www.anthropic.com/research)

[研究](https://www.anthropic.com/research)

[News](https://www.anthropic.com/news)

[新闻](https://www.anthropic.com/news)

[Claude’s Constitution](https://www.anthropic.com/constitution)

[Claude 宪章](https://www.anthropic.com/constitution)

[Claude Corps](https://www.anthropic.com/claude-corps)

[Claude Corps](https://www.anthropic.com/claude-corps)

[Keep thinking](https://www.anthropic.com/path-to-hope)

[持续思考](https://www.anthropic.com/path-to-hope)

[Policy on the AI Exponential](https://www.anthropic.com/policy-on-the-ai-exponential)

[关于 AI 指数式发展的政策](https://www.anthropic.com/policy-on-the-ai-exponential)

[Responsible Scaling Policy](https://www.anthropic.com/news/announcing-our-updated-responsible-scaling-policy)

[负责任 Scaling 政策](https://www.anthropic.com/news/announcing-our-updated-responsible-scaling-policy)

<!-- page 9 of 9 -->

[Security and compliance](https://trust.anthropic.com/)

[安全与合规](https://trust.anthropic.com/)

[Transparency](https://www.anthropic.com/transparency)

[透明度](https://www.anthropic.com/transparency)

Terms and policies

条款与政策

[Privacy policy](https://www.anthropic.com/legal/privacy)

[隐私政策](https://www.anthropic.com/legal/privacy)

[Consumer health data privacy policy](https://www.anthropic.com/legal/consumer-health-data-privacy-policy)

[消费者健康数据隐私政策](https://www.anthropic.com/legal/consumer-health-data-privacy-policy)

[Responsible disclosure policy](https://www.anthropic.com/responsible-disclosure-policy)

[负责任披露政策](https://www.anthropic.com/responsible-disclosure-policy)

[Terms of service: Commercial](https://www.anthropic.com/legal/commercial-terms)

[服务条款: 商业版](https://www.anthropic.com/legal/commercial-terms)

[Terms of service: Consumer](https://www.anthropic.com/legal/consumer-terms)

[服务条款: 消费者版](https://www.anthropic.com/legal/consumer-terms)

[Terms of Service: US K-12](https://anthropic.com/legal/k12-terms)

[服务条款: 美国 K-12](https://anthropic.com/legal/k12-terms)

[Data Processing Agreement: US K-12](https://anthropic.com/legal/k12-dpa)

[数据处理协议: 美国 K-12](https://anthropic.com/legal/k12-dpa)

[Usage policy](https://www.anthropic.com/legal/aup)

[使用政策](https://www.anthropic.com/legal/aup)

© 2026 Anthropic PBC

© 2026 Anthropic PBC

![Image block](images/p09-image.png)

> **核对:** 一篇 2024 年 10 月的公告, 页脚为什么是 © 2026, 还列着 Mythos 和 Fable?
> 因为这份 PDF 是 2026 年抓取的, 站点页脚和 「Related content」 都是抓取当时的版本, 不是 2024 年发布时的样子. 页脚 Models 一栏列了 Mythos, Fable, Opus, Sonnet, Haiku 五个系列, 相关内容里的生命科学验证计划也提到 Claude Mythos, 这些都与正文无关. 对照 PDF, md 的页脚文字逐项对得上, 只有两处格式问题: 第 7 页开头的 「Financial services」 被转成了二级标题, 第 5 页的 「## X」 是分享按钮残留. 末尾这张 722 字节的图是 LinkedIn 小图标, 同样属于页脚. 正文里还有几处转换丢空格: 「forAI-powered」 原为 「for AI-powered」.
