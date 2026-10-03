---
title: "GPT-5.5 · 对照译稿"
category: "模型库"
tags: ["OpenAI", "对照译稿"]
published: true
excerpt: "GPT-5.5 公开材料的逐段中英对照译稿,附读报告时的疑问块."
---
<!-- page 1 of 20 -->

OpenAI

Q

页眉: OpenAI 标志, 「Q」 是搜索图标被识别成的字母.

**April 23, 2026** [**Product**](https://openai.com/news/product-releases/) [**Release**](https://openai.com/research/index/release/)

发布日期 April 23, 2026, 栏目: 产品, 发布.

# Introducing GPT‑5.5 (GPT-5.5 发布)

A new class of intelligence for real work

面向真实工作的新一类智能.

**This post introduced GPT-5.5.**

**本文发布了 GPT-5.5.**

Learn about OpenAI’s latest model:

了解 OpenAI 的最新模型:

[GPT-6](https://openai.com/index/gpt-6-astra/)

[Compare models](https://developers.openai.com/api/docs/models)

GPT-6; 对比模型. 这两个链接是抓页当时站点加的提示, 发布时 GPT-6 还不存在.

Listen to articleWe use cookies 19:06

收听本文, 时长 19:06. 中间夹着 Cookie 横幅的标题 「We use cookies」.

Share

分享

We use cookies to help this site function, understand service usage, and support marketing efforts. Visit Manage Cookies to change preferences anytime. View our [Cookie Policy](https://openai.com/policies/cookie-policy/) for more info.

Cookie 横幅: 我们使用 Cookie 来维持网站运行, 了解服务使用情况, 支持营销工作. 可随时到 「管理 Cookie」 修改偏好. 更多信息见我们的 Cookie 政策.

Update on April 24, 2026: GPT‑5.5 and GPT‑5.5 Pro are now available Manage Cookies in the API. has also been updated to describe the[The system card](https://openai.com/index/gpt-5-5-system-card/)

additional safeguards that apply. Reject non-essential

April 24, 2026 更新: GPT-5.5 和 GPT-5.5 Pro 现已在 API 中上线. 系统卡也已更新, 补充说明了适用的额外保护措施. 句中夹着横幅按钮 「Manage Cookies」 和 「Reject non-essential」, 链接文字 「The system card」 被挪到了句尾.

> **想:** 页首更新说 April 24 API 已上线, 第 2 页和第 15 页为什么还写 「very soon」?
> 正文是 April 23 发布当天写的, 两处 「We'll bring GPT-5.5 and GPT-5.5 Pro to the API very soon」 没改, 只在页首补了一条次日的更新. 所以第 15 页的 API 价格 ($5 / $30, 1M 上下文) 在正文里还是预告. 页面没说 API 版和 ChatGPT, Codex 里跑的是否同一个 checkpoint, API 的 「additional safeguards」 具体是什么也只指向系统卡.

Accept all

全部接受 (横幅按钮).

<!-- page 2 of 20 -->

OpenAI

model yet, and the next step toward a new way of getting work done on a computer.

句首被上一页的横幅盖掉了. 残句: ...模型, 也是朝着在电脑上完成工作的新方式迈出的下一步.

GPT‑5.5 understands what you’re trying to do faster and can carry more of the work itself. It excels at writing and debugging code, researching online, analyzing data, creating documents and spreadsheets, operating software, and moving across tools until a task is finished. Instead of carefully managing every step, you can give GPT‑5.5 a messy, multi-part task and trust it to plan, use tools, check its work, navigate through ambiguity, and keep going.fi

GPT-5.5 能更快明白你想做什么, 也能自己扛下更多工作. 它擅长写代码和调试代码, 上网调研, 分析数据, 做文档和电子表格, 操作软件, 在多个工具之间切换直到任务完成. 你不必小心地盯住每一步, 可以把一个杂乱的, 由好几部分组成的任务交给 GPT-5.5, 相信它会自己规划, 用工具, 检查结果, 在含糊的地方找到方向, 一直推进下去. (句末 「fi」 是抓页残字.)

The gains are especially strong in agentic coding, computer use, knowledge work, and early scientific research—areas where progress depends on reasoning across context and taking action over time. GPT‑5.5 delivers this step up in intelligence without compromising on speed: larger, more capable models are often slower to serve, but GPT‑5.5 matches GPT‑5.4 per-token latency in real-world serving, while performing at a much higher level of intelligence. It also uses significantly fewer tokens to complete the same Codex tasks, making it more efficient as well as more capable.

提升在 Agent 式编程, 电脑操作, 知识工作和早期科学研究上尤其明显, 这些领域的进展要靠跨上下文推理和长时间持续行动. GPT-5.5 的这一档智能提升没有拿速度去换: 更大更强的模型通常服务起来更慢, 但在真实线上服务中, GPT-5.5 的每 token 延迟和 GPT-5.4 持平, 智能水平却高出一大截. 完成同样的 Codex 任务, 它用的 token 也明显更少, 所以既更强, 也更省.

We are releasing GPT‑5.5 with our strongest set of safeguards to date, designed to reduce misuse while preserving access for beneficial work. We evaluated this model across our full suite of safety and preparedness frameworks, worked with internal and external redteamers, added targeted testing for advanced cybersecurity and biology capabilities, and collected feedback on real use cases from nearly 200 trusted early-access partners before release.

我们给 GPT-5.5 配上了迄今最强的一套保护措施, 目的是减少滥用, 同时保住有益工作的使用权. 我们用全套安全和 Preparedness 框架评估了这个模型, 和内部, 外部红队合作, 针对高级网络安全和生物能力加了专项测试, 并在发布前从近 200 家受信任的早期访问合作伙伴那里收集了真实用例反馈.

Today, GPT‑5.5 is rolling out to Plus, Pro, Business, and Enterprise users in ChatGPT and Codex, and GPT‑5.5 Pro is rolling out to Pro, Business, and Enterprise users in ChatGPT. API deployments require different safeguards and we are working closely with partners and customers on the safety and security requirements for serving it at scale. We’ll bring GPT‑5.5 and GPT‑5.5 Pro to the API very soon.

今天起, GPT-5.5 向 ChatGPT 和 Codex 的 Plus, Pro, Business, Enterprise 用户推送, GPT-5.5 Pro 向 ChatGPT 的 Pro, Business, Enterprise 用户推送. API 部署需要另一套保护措施, 我们正和合作伙伴及客户一起解决大规模提供服务时的安全与安保要求. GPT-5.5 和 GPT-5.5 Pro 很快会上 API.

<table><tr><td></td><td></td><td>GPT-5.5</td><td>GPT-5.4</td><td>GPT-5.5 Pro</td><td>GPT-5.4 Pro</td><td>Claude Opus 4.7</td><td>Gemini 3.1 Pro</td></tr><tr><td></td><td>Terminal-Bench 2.0</td><td>82.7%</td><td>75.1%</td><td>-</td><td>-</td><td>69.4%</td><td>68.5%</td></tr><tr><td rowspan="3">We use cookies</td><td>Expert-SWE (Internal)</td><td>73.1%</td><td>68.5%</td><td>-</td><td>-</td><td>-</td><td>-</td></tr><tr><td colspan="5">We use cookies to help this site function, understand service usage, and support marketing efforts. Visit preferences anytime, View our Cookie Policy for more info.</td><td>to change</td><td></td></tr><tr><td>GDPVal (wins or ties)</td><td>84.9%</td><td>83.0%</td><td>82.3%</td><td>82.0%</td><td>80.3%</td><td>67.3%</td></tr><tr><td></td><td>OSWorld-Verified</td><td>78.7%</td><td>75.0%</td><td>-</td><td>-</td><td>78.0%</td><td>-</td></tr><tr><td></td><td>Toolathlon</td><td>55.6%</td><td>54.6%</td><td>-</td><td>-</td><td>-</td><td>48.8%</td></tr><tr><td></td><td>BrowseComp</td><td>84.4%</td><td>82.7%</td><td>90.1%</td><td>89.3%</td><td>79.3%</td><td>85.9%</td></tr></table>

首表六列依次是 GPT-5.5, GPT-5.4, GPT-5.5 Pro, GPT-5.4 Pro, Claude Opus 4.7, Gemini 3.1 Pro, 「-」 表示没有该项结果, 下同. Terminal-Bench 2.0: 82.7%, 75.1%, -, -, 69.4%, 68.5%. Expert-SWE (内部): 73.1%, 68.5%, 其余为 -. GDPval (胜或平): 84.9%, 83.0%, 82.3%, 82.0%, 80.3%, 67.3%. OSWorld-Verified: 78.7%, 75.0%, -, -, 78.0%, -. Toolathlon: 55.6%, 54.6%, -, -, -, 48.8%. BrowseComp: 84.4%, 82.7%, 90.1%, 89.3%, 79.3%, 85.9%. 第三行整行被 Cookie 横幅占了, 左边一格的 「We use cookies」 也是横幅文字.

> **问:** 首表 BrowseComp 一行, GPT-5.5 的 84.4% 在六列里排第几?
> 排第四. GPT-5.5 Pro 90.1%, GPT-5.4 Pro 89.3%, Gemini 3.1 Pro 85.9% 都比它高, 它只高过 GPT-5.4 的 82.7% 和 Claude Opus 4.7 的 79.3%. 这一行能放进首表, 靠的是 Pro 那一列. 比 GPT-5.4 只多 1.7 个点, Toolathlon 也只多 1.0 个点.

<!-- page 3 of 20 -->

OpenAl

| FrontierMathTier4 | 35.4% | 27.1% | 39.6% | 38.0% | 22.9% | 16.7% |
| --- | --- | --- | --- | --- | --- | --- |
| CyberGym | 81.8% | 79.0% | - | - | 73.1% | - |

首表续: FrontierMath Tier 4: 35.4%, 27.1%, 39.6%, 38.0%, 22.9%, 16.7%. CyberGym: 81.8%, 79.0%, -, -, 73.1%, -. 页眉 「OpenAl」 是 「OpenAI」 的识别错字, 下同.

> **核对:** CyberGym 81.8% 在第 16 到 18 页的附录里找得到吗?
> 找不到. 附录 Cybersecurity 一组只有一行内部 CTF 任务, 88.1% 对 83.7%. CyberGym 只出现在首表. 反过来, 首表没收 SWE-Bench Pro, 那一项 GPT-5.5 是 58.6%, 低于 Claude Opus 4.7 的 64.3%; 也没收 MCP Atlas, GPT-5.5 的 75.3% 低于 Claude 的 79.1% 和 Gemini 的 78.2%. 首表和附录不是同一套选项, 首表挑的都是 GPT-5.5 或 GPT-5.5 Pro 领先的行.

## Model capabilities (模型能力)

OpenAI is building the global infrastructure for agentic AI, making it possible for people and businesses around the world to get work done with AI. Over the past year, we’ve seen AI dramatically accelerate software engineering. With GPT‑5.5 in Codex and ChatGPT, that same transformation is beginning to extend into scientific research and the broader work people do on computers.

OpenAI 正在建设 Agent 式 AI 的全球基础设施, 让世界各地的个人和企业都能用 AI 把工作做完. 过去一年, 我们看到 AI 大大加快了软件工程. 随着 GPT-5.5 进入 Codex 和 ChatGPT, 同样的变化开始延伸到科学研究, 以及人们在电脑上做的更广泛的工作.

Across these domains, GPT‑5.5 is not just more intelligent; it is more efficient in how it works through problems, often reaching higherquality outputs with fewer tokens and fewer retries. On Artificial Analysis's Coding Index, GPT‑5.5 delivers state-of-the-art intelligence at half the cost of competitive frontier coding models.

在这些领域里, GPT-5.5 不只更聪明, 解题的过程也更省, 常常用更少的 token 和更少的重试拿到更好的输出. 在 Artificial Analysis 的 Coding Index 上, GPT-5.5 以同档前沿编程模型一半的成本, 达到最好水平的智能.

## We use cookies (我们使用 Cookie)

The [Artificial Analysis Intelligence Index](https://artificialanalysis.ai/methodology/intelligence-benchmarking) is a weighted average of 10 evals ran by an external party: AA-LCR, AA-Omniscience, CritPt, GDPval-AA, GPQA Diamond, Humanity’s Last Exam, IFBench, SciCode, Terminal-Bench Hard, τ² Bench Telecom.

Artificial Analysis Intelligence Index 是由外部机构跑的 10 项评测的加权平均: AA-LCR, AA-Omniscience, CritPt, GDPval-AA, GPQA Diamond, Humanity's Last Exam, IFBench, SciCode, Terminal-Bench Hard, τ² Bench Telecom.

> **看表:** 正文说的是 Coding Index, 图注解释的却是 Intelligence Index, 两个是同一个指数吗?
> 不是. 图注列的 10 项 (数下来正好 10 项) 里只有 SciCode 和 Terminal-Bench Hard 算编程题, 其余是长上下文, 知识, 科学推理, 指令遵循和客服 Agent. 对应的图没抓下来. 「一半成本」 用的是哪个指数, 成本按每 token 单价还是按跑完整套评测的总花费算, 和哪几家模型比, 本页都没有.

We use cookies to help this site function, understand service usage, and support marketing efforts. Visit preferences anytime. View our [Cookie Policy](https://openai.com/policies/cookie-policy/) for more info.

to change

Cookie 横幅, 同上. 「to change」 是横幅残字.

Agentic coding

Agent 式编程

GPT‑5.5 is our strongest agentic coding model to date. On Terminal-Bench 2.0, which tests complex command-line workflows requiring

GPT-5.5 是我们迄今最强的 Agent 式编程模型. Terminal-Bench 2.0 考的是需要...的复杂命令行工作流, 在这项评测上 (句子在翻页处断了).

<!-- page 4 of 20 -->

OpenAI

world GitHub issue resolution, it reaches 58.6%, solving more tasks end-to-end in a single pass than previous models. On **Expert-SWE**, our internal frontier eval for long-horizon coding tasks with a median estimated human completion time of 20 hours, GPT‑5.5 also outperforms GPT‑5.4.

接上页, 前半截丢了. 残句: ...真实 GitHub issue 修复上, 它达到 58.6%, 一次就端到端解决的任务比以往模型更多. **Expert-SWE** 是我们内部的前沿评测, 考长程编程任务, 人类完成时间的中位估计是 20 小时, 在这项上 GPT-5.5 也超过了 GPT-5.4.

> **拆开:** 「it reaches 58.6%」 说的是哪项评测? Terminal-Bench 2.0 的分数去哪了?
> 翻页处丢了一截. 按第 16 页附录, 58.6% 是 SWE-Bench Pro (Public), Terminal-Bench 2.0 是 82.7%, 被截掉的应是 Terminal-Bench 的分数和 SWE-Bench Pro 的名字. 58.6% 只比 GPT-5.4 的 57.7% 高 0.9 个点, 比 Claude Opus 4.7 的 64.3% 低 5.7 个点, 附录脚注还说有实验室在这项评测上发现了记忆现象. 「比以往模型解决更多任务」 只对 OpenAI 自家旧模型成立.

Across all three evals, GPT‑5.5 improves on GPT‑5.4’s scores while using fewer tokens.

在这三项评测上, GPT-5.5 的分数都高于 GPT-5.4, 用的 token 也更少.

> **确认:** 「using fewer tokens」 少了多少?
> 本页没给. 三项评测的 token 数一个都没印, 推理强度也没印, 第 19 页讲评测设置的那条脚注只剩最后半句. 第 16 页说 GPT-5.5 单价高于 GPT-5.4, 靠 token 效率抵消, 可 「少多少 token」 和 「贵多少」 两个数都不在页上, 算不出单个任务的实际花费是涨是跌.

The model’s coding strengths show up especially clearly in Codex where it can take on engineering work ranging from implementation and refactors to debugging, testing, and validation. Early testing suggests GPT‑5.5 is better at the behaviors real engineering work depends on, like holding context across large systems, reasoning through ambiguous failures, checking assumptions with tools, and carrying changes through the surrounding codebase.

这种编程能力在 Codex 里看得最清楚, 从实现, 重构到调试, 测试, 验证, 它都能接手. 早期测试显示, GPT-5.5 更擅长真实工程工作依赖的那些行为: 在大型系统里守住上下文, 推理说不清原因的故障, 用工具核实假设, 把改动一路落实到周边代码.

**Space mission app**

**Earthquake tracker**

**Dungeon game**

**3D game**

四个演示标签: **太空任务应用**, **地震追踪器**, **地牢游戏**, **3D 游戏**. 演示视频没有抓下来.

## We use cookies (我们使用 Cookie)

We use cookies to help this site function, understand service usage, and support marketing efforts. Visit preferences anytime. View our [Cookie Policy](https://openai.com/policies/cookie-policy/) for more info.

to change

Cookie 横幅, 同上.

<!-- page 5 of 20 -->

OpenAI

The rendered trajectory uses NASA/JPL Horizons vector data for Orion, the Moon, and the Sun, with display scaling applied for readability. **Prompt:** [attached image] Implement this as a new app using webgl and vite using real data from the artemis II mission. Make sure to test… Show more

太空任务应用的说明: 渲染出的轨迹用的是 NASA/JPL Horizons 给出的 Orion 飞船, 月球和太阳的矢量数据, 为了看得清, 显示时调整了比例. **提示词:** [附图] 用 webgl 和 vite 把它做成一个新应用, 用 artemis II 任务的真实数据. 务必测试... 展开更多

Beyond benchmarks, early testers said GPT‑5.5 shows a stronger ability to understand the shape of a system: why something is failing, where the fix needs to land, and what else in the codebase would be affected.

基准分数之外, 早期测试者说 GPT-5.5 更能看清一个系统的整体形状: 哪里为什么出错, 修复该落在哪, 代码库里还有哪些地方会跟着受影响.

Dan Shipper**, Founder and CEO of Every, described GPT**‑**5.5 as “the first coding model I’ve used that has serious conceptual clarity.”**

Every 的创始人兼 CEO Dan Shipper 说, GPT-5.5 是 「我用过的第一个概念上真正清楚的编程模型」.

**“The first coding model I’ve used that has serious conceptual clarity.”**

**「我用过的第一个概念上真正清楚的编程模型.」**

After launching an app, he spent days debugging a post-launch issue before bringing in one of his best engineers to rewrite part of the system. To test GPT‑5.5, he effectively rewound the clock: could the model look at the broken state and produce the same kind of rewrite the engineer eventually decided on? GPT‑5.4 could not. GPT‑5.5 could.

他上线一个应用后, 为一个上线后的问题调了好几天, 最后请来手下最好的工程师之一, 重写了系统的一部分. 为了测试 GPT-5.5, 他相当于把时钟拨了回去: 让模型看出问题时的代码状态, 看它能不能给出和那位工程师最终选定的同类重写. GPT-5.4 做不到, GPT-5.5 做到了.

Pietro Schirano, **CEO of MagicPath, saw a similar step change when GPT**‑**5.5 merged a branch with hundreds of frontend and refactor changes into a main branch that had also changed substantially, resolving the work in one shot in**

MagicPath 的 CEO Pietro Schirano 也看到了类似的跃升: GPT-5.5 把一个含数百处前端和重构改动的分支, 合进一个同样改了很多的主分支, 一次就解决了, 用时... (句子被横幅截断.)

## We use cookies (我们使用 Cookie)

efforts. Visit to change “It genuinely feels like I’m working with a higher intelligence, and there’s almost a sense of respect ”

横幅残段后面是一句引语: 「真的感觉是在和一个更高的智能一起工作, 甚至生出一点敬意」 (后半句被截断).

<!-- page 6 of 20 -->

OpenAI

stronger than GPT‑5.4 and Claude Opus 4.7 at reasoning and autonomy, catching issues in advance and predicting testing and review needs without explicit prompting. In one case, an engineer asked it to re-architect a comment system in a collaborative markdown editor and returned to a 12-diff stack that was nearly complete. Others said they needed surprisingly little implementation correction and felt more confident in GPT‑5.5’s plans compared with GPT‑5.4.

句首丢了. 残句: ...在推理和自主性上强于 GPT-5.4 和 Claude Opus 4.7, 能提前发现问题, 不用明说就能预判需要哪些测试和评审. 有一次, 一位工程师让它重新设计一个协作式 Markdown 编辑器里的评论系统, 回来时看到一摞 12 个 diff 的改动, 差不多已经做完. 还有人说, 需要他们动手修正的实现少得出奇, 他们对 GPT-5.5 的方案也比对 GPT-5.4 的更放心.

One engineer at NVIDIA who had early access to the model went as far as to say: "Losing access to GPT‑5.5 feels like I’ve had a limb amputated.”

一位拿到早期访问权限的 NVIDIA 工程师甚至说: 「失去 GPT-5.5 的使用权, 感觉就像少了一条胳膊.」

**Cursor**

**Lovable**

**Cognition**

**Windsurf**

**GitHub**

**JetBrains**

**Sonar**

客户评价的切换标签: Cursor, Lovable, Cognition, Windsurf, GitHub, JetBrains, Sonar. 抓到的是 Cursor 这一条.

# “GPT-5.5 is noticeably smarter and more persistent than GPT-5.4, with stronger coding performance and more reliable tool use. It stays on task for significantly longer without stopping early, which matters most for the complex, long-running work our users delegate to Cursor.” (「GPT-5.5 明显比 GPT-5.4 更聪明, 也更能坚持, 编程更强, 工具用得更可靠. 它能在任务上待得久得多, 不会半途停下, 这对用户交给 Cursor 的那些复杂, 长时间运行的工作最要紧.」)

**— Michael Truell, Co-founder & CEO at Cursor**

**— Michael Truell, Cursor 联合创始人兼 CEO**

## Knowledge work (知识工作)

The same strengths that make GPT‑5.5 great at coding also make it powerful for everyday work on a computer. Because the model is better at understanding intent, it can move more naturally through the full loop of knowledge work: finding information, understanding what matters, using tools, checking the output, and turning raw material into something useful.

让 GPT-5.5 擅长编程的那些长处, 也让它在日常电脑工作上很能干. 模型更懂意图, 所以能更顺地走完知识工作的整个循环: 找信息, 判断什么要紧, 用工具, 检查产出, 把原始材料变成有用的东西.

In Codex, GPT‑5.5 is better than GPT‑5.4 at generating documents, We use cookies spreadsheets, and slide presentations. Alpha testers said it outperformed past models on work like operational research,We use cookies to help this site function, understand service usage, and support marketing efforts. Visit to change spreadsheet modeling, and turning messy business inputs into plans.preferences anytime. View our [Cookie Policy](https://openai.com/policies/cookie-policy/) for more info. When combined with Codex’s computer use skills, GPT‑5.5 brings us closer to the feeling that the model can actually use the computer with you: seeing what’s on screen, clicking, typing, navigating interfaces, and moving across tools with precision.

在 Codex 里, GPT-5.5 生成文档, 电子表格和幻灯片的能力比 GPT-5.4 强. Alpha 测试者说, 在运筹研究, 电子表格建模, 把杂乱的业务输入整理成计划这类工作上, 它胜过以往的模型. 再加上 Codex 的电脑操作能力, GPT-5.5 让人更接近这样一种感觉: 模型真的能和你一起用电脑, 看屏幕上的内容, 点击, 打字, 在界面里导航, 准确地在工具之间切换. (段中夹着两截 Cookie 横幅.)

<!-- page 7 of 20 -->

![Image block](images/p07-openal.png)

图片: 一块白色占位框, 原本应是演示视频的封面, 没有抓到内容.

OpenAl

Today, more than 85% of the company uses Codex every week across functions including software engineering, finance, communications, marketing, data science, and product management. In Comms, the team used GPT‑5.5 in Codex to analyze six months of speaking request data, build a scoring and risk framework, and validate an automated Slack agent so low-risk requests could be handled automatically while higher-risk requests still route to human review. In Finance, the team used Codex to review 24,771 K-1 tax forms totaling 71,637 pages, using a workflow that excluded personal information and helped the team accelerate the task by two weeks compared to the prior year. On the Go-to-Market team, an employee automated generating weekly business reports, saving 5-10 hours a week.

如今公司里超过 85% 的人每周都用 Codex, 覆盖软件工程, 财务, 公关传播, 市场, 数据科学和产品管理. 公关团队用 Codex 里的 GPT-5.5 分析了六个月的演讲邀约数据, 搭了一套打分和风险框架, 并验证了一个自动化 Slack Agent: 低风险的邀约自动处理, 高风险的仍转人工审核. 财务团队用 Codex 审阅了 24,771 份 K-1 税表, 共 71,637 页, 流程里排除了个人信息, 比上一年提前两周完成. 市场拓展团队有位员工把每周业务报告的生成自动化了, 每周省下 5-10 小时.

**Financial modeling**

Testing onboarding ow

演示标签: **金融建模**; 测试入职流程 (「ow」 是 「flow」 丢了 「fl」 连字).

In ChatGPT, **GPT‑5.5 Thinking** unlocks faster help for harder

problems, with smarter and more concise answers to help you move

through complex work more efficiently. It excels at professional work

We use cookies

like coding, research, information synthesis and analysis, and

document-heavy tasks, especially when using plugins.We use cookies to help this site function, understand service usage, and support marketing efforts. Visit to change preferences anytime. View our [Cookie Policy](https://openai.com/policies/cookie-policy/) for more info.

在 ChatGPT 里, **GPT-5.5 Thinking** 能更快地帮你处理更难的问题, 回答更聪明也更简洁, 让你更高效地推进复杂工作. 它擅长专业工作, 比如编程, 调研, 信息综合与分析, 以及大量处理文档的任务, 用插件时尤其如此. (中间夹着 Cookie 横幅.)

In **GPT‑5.5 Pro**, early testers are seeing a significant step up in both the difficulty and quality of work ChatGPT can take on, with latency improvements that make it much more practical for demanding tasks. Compared to GPT‑5.4 Pro, testers found GPT‑5.5 Pro’s responses significantly more comprehensive, well-structured,

在 **GPT-5.5 Pro** 上, 早期测试者看到 ChatGPT 能接的工作在难度和质量上都明显上了一个台阶, 延迟也改善了, 用在高要求任务上实际得多. 和 GPT-5.4 Pro 相比, 测试者觉得 GPT-5.5 Pro 的回答明显更全面, 结构更清楚, ... (句子在翻页处断了.)

<!-- page 8 of 20 -->

OpenAI

GPT‑5.5 reaches state-of-the-art performance across multiple benchmarks that reflect this kind of work. On , which tests[GDPval](https://openai.com/index/gdpval/) agents’ abilities to produce well-specified knowledge work across 44 occupations, GPT‑5.5 scores 84.9%. On **OSWorld-Verified**, which measures whether a model can operate real computer environments on its own, it reaches 78.7%. And on **Tau2-bench Telecom**, which tests complex customer-service workflows, it reaches 98.0% without prompt tuning. GPT‑5.5 also performs strongly across other knowledge work benchmarks: 60.0% on **FinanceAgent**, 88.5% on **internal investment-banking modeling tasks**, and 54.1% on **OfficeQA Pro**.

在反映这类工作的多项基准上, GPT-5.5 达到最好水平. GDPval 考 Agent 在 44 种职业里产出要求明确的知识工作的能力, GPT-5.5 得 84.9%. **OSWorld-Verified** 衡量模型能否自己操作真实的电脑环境, 它达到 78.7%. **Tau2-bench Telecom** 考复杂的客服工作流, 不调提示词它就达到 98.0%. 在其他知识工作基准上 GPT-5.5 也表现强劲: **FinanceAgent** 60.0%, **内部投行建模任务** 88.5%, **OfficeQA Pro** 54.1%. (链接文字 GDPval 被挪到了句中.)

> **回看:** FinanceAgent 60.0% 算得上 「performs strongly」 吗?
> 按第 16 页附录, FinanceAgent v1.1 这一行 Claude Opus 4.7 是 64.4%, GPT-5.4 Pro 是 61.5%, GPT-5.5 的 60.0% 排第三, 只比 Gemini 3.1 Pro 的 59.7% 高 0.3 个点. 这段开头说 「state-of-the-art across multiple benchmarks」, 挑出来的五项里, 真正排第一的是 GDPval, OSWorld-Verified (领先 Claude 0.7 个点), OfficeQA Pro 和 Tau2-bench (没有别家对照). 投行建模 88.5% 也被 GPT-5.5 Pro 的 88.6% 超过 0.1 个点.

## We use cookies (我们使用 Cookie)

We use cookies to help this site function, understand service usage, and support marketing efforts. Visit preferences anytime. View our [Cookie Policy](https://openai.com/policies/cookie-policy/) for more info.

to change

Cookie 横幅, 同上.

Tau2-bench Telecom was run without prompt tuning (and GPT‑4.1 as user model). GPT‑5.5 understands the intent of the task better and is more token efficient than its predecessors.

图注: Tau2-bench Telecom 没有调提示词 (用户一侧由 GPT-4.1 扮演). GPT-5.5 比前代更懂任务意图, token 效率也更高.

> **停一下:** Tau2-bench Telecom 的 98.0% 能和别家比吗?
> 本页不能比. 第 17 页脚注说这项只报 GPT-5.5 和 GPT-5.4 用原始提示词的结果, 别家实验室的分数是调过提示词跑的, 所以整行省略, Claude 和 Gemini 两列都是 「-」. 98.0% 对 92.8% 是同条件下的 5.2 个点. 另一个条件是扮演用户的模型固定成 GPT-4.1, 用户一侧的能力也会影响得分, 页面没说换别的用户模型分数会不会变.

<!-- page 9 of 20 -->

OpenAI

NVIDIA Cisco Abridge Databricks Harvey Box Lowe’s Glean Palo Alto Networks Ramp Perplexity

客户标志墙: NVIDIA, Cisco, Abridge, Databricks, Harvey, Box, Lowe's, Glean, Palo Alto Networks, Ramp, Perplexity.

# “GPT-5.5 delivers the sustained performance required for execution-heavy work. Built and served on NVIDIA GB200 NVL72 systems, the model enables our teams to ship end-to-end features from natural language prompts, cut debug time from days to hours, and turn weeks of experimentation into overnight progress in complex codebases. It’s more than faster coding—it’s a new way of working that helps people operate at a fundamentally different speed.” ("GPT-5.5 能持续输出执行密集型工作所需的性能. 这个模型在 NVIDIA GB200 NVL72 系统上构建和服务, 让我们的团队能从自然语言提示直接交付端到端的功能, 把调试时间从几天缩到几小时, 在复杂代码库里把几周的实验变成一夜的进展. 这不只是写代码更快, 而是一种新的工作方式, 让人以完全不同的速度做事.")

**— Justin Boitano, VP of Enterprise AI at NVIDIA**

**— Justin Boitano, NVIDIA 企业 AI 副总裁**

> **再看:** 这段引语说 「Built and served on NVIDIA GB200 NVL72」, 第 12 页说的是哪几种系统?
> 第 12 页写的是 「co-designed for, trained with, and served on NVIDIA GB200 and GB300 NVL72 systems」, 多了 GB300. NVIDIA 这段引语只提 GB200. 页面没说训练和服务各用了哪一代, 也没说 GB200 和 GB300 在训练里怎么分工, 两处合起来只能确定两代机柜都参与了.

## Scientific research (科学研究)

GPT‑5.5 also shows gains on scientific and technical research workflows, which require more than answering a hard question. Researchers need to explore an idea, gather evidence, test assumptions, interpret results, and decide what to try next. GPT‑5.5 is better at persisting across that loop than other models.

GPT-5.5 在科学和技术研究的工作流上也有提升, 这类工作不只是回答一道难题. 研究者要琢磨一个想法, 收集证据, 检验假设, 解读结果, 再决定下一步试什么. GPT-5.5 在这个循环里比其他模型更能坚持下去.

Notably, GPT‑5.5 shows a clear improvement over GPT‑5.4 on, a new eval focusing on multi-stage scientific data[GeneBench](https://cdn.openai.com/pdf/6dc7175d-d9e7-4b8d-96b8-48fe5798cd5b/oai_genebench_benchmark.pdf) analysis in genetics and quantitative biology. These problems require models to reason about potentially ambiguous or errorful data with minimal supervisory guidance, address realistic obstacles such as hidden confounders or QC failures, and correctly implement and interpret modern statistical methods. The model’s performance is striking in light of the fact that tasks here often correspond to multi-day projects for scientific experts.

值得一提的是, 在 GeneBench 上 GPT-5.5 比 GPT-5.4 明显进步. 这是一项新评测, 考遗传学和定量生物学里的多阶段科学数据分析. 题目要求模型在几乎没有指导的情况下, 对可能含糊或有错的数据做推理, 应对隐藏混杂因素, 质控失败这类现实障碍, 并正确实现和解读现代统计方法. 这里的任务往往对应科学专家好几天的项目, 考虑到这一点, 模型的表现很惊人.

## We use cookies (我们使用 Cookie)

We use cookies to help this site function, understand service usage, and support marketing efforts. Visit preferences anytime. View our [Cookie Policy](https://openai.com/policies/cookie-policy/) for more info.

to change

Cookie 横幅, 同上.

<!-- page 10 of 20 -->

OpenAl

Similarly, on , a benchmark designed around real-world[BixBench](https://arxiv.org/abs/2503.00096) bioinformatics and data analysis, GPT‑5.5 achieved leading performance among models with published scores. The model’s scientific capabilities are now strong enough to meaningfully accelerate progress at the frontiers of biomedical research as a bona fide co-scientist.

同样, 在围绕真实生物信息学和数据分析设计的基准 BixBench 上, GPT-5.5 在公布了分数的模型里领先. 模型的科学能力已经强到能作为真正的合作科学家, 实质性地加快生物医学研究前沿的进展.

In another example, an internal version of GPT‑5.5 with a custom harness helped discover a about Ramsey numbers, one of[new proof](https://cdn.openai.com/pdf/6dc7175d-d9e7-4b8d-96b8-48fe5798cd5b/Ramsey.pdf) the central objects in combinatorics. Combinatorics studies how discrete objects fit together: graphs, networks, sets, and patterns. Ramsey numbers ask, roughly, how large a network has to be before some kind of order is guaranteed to appear. Results in this area are rare and often technically difficult. Here, GPT‑5.5 found a proof of a

另一个例子: 一个配了定制 harness 的内部版 GPT-5.5, 帮助发现了关于 Ramsey 数的一个新证明, Ramsey 数是组合数学的核心对象之一. 组合数学研究离散对象怎么拼在一起: 图, 网络, 集合, 模式. Ramsey 数问的大致是, 一个网络要多大, 才能保证某种秩序一定出现. 这个领域的成果很少, 技术上往往很难. 这一次, GPT-5.5 为一个... 找到了证明 (句子被横幅截断).

## We use cookies (我们使用 Cookie)

longstanding asymptotic fact about off-diagonal Ramsey numbers, later verified in Lean. The result is a concrete example of GPT‑5.5

contributing not just code or explanation, but a surprising and useful We use cookies to help this site function, understand service usage, and support marketing efforts. Visit to change mathematical argument in a core research area.preferences anytime. View our [Cookie Policy](https://openai.com/policies/cookie-policy/) for more info.

接上: ...关于非对角 Ramsey 数, 由来已久的一个渐近结论, 证明后来在 Lean 里得到验证. 这个结果具体说明了 GPT-5.5 能贡献的不只是代码或解释, 还有核心研究领域里出人意料又有用的数学论证. (中间夹着 Cookie 横幅.)

Early testers used GPT‑5.5 Pro in ChatGPT less like a one-shot answer engine and more like a research partner: critiquing manuscripts over multiple passes, stress-testing technical arguments, proposing analyses, and working with code, notes, and

早期测试者在 ChatGPT 里用 GPT-5.5 Pro, 不太像用一个一问一答的引擎, 更像找了个研究伙伴: 多轮批改稿件, 对技术论证做压力测试, 提出分析方案, 配合代码, 笔记和... 一起工作 (句子在翻页处断了).

<!-- page 11 of 20 -->

OpenAl

![Image block](images/p11-derya-unutmaz-an-immunology-professor-and-researcher-at.png)

图片: 蓝, 粉, 橙渐变的装饰图, 没有具体内容.

Derya Unutmaz**, an immunology professor and researcher at the Jackson Laboratory for Genomic Medicine, used GPT**‑**5.5 Pro to analyze a gene-expression dataset with 62 samples and nearly 28,000 genes, producing a detailed research report that not only summarized the findings but also surfaced key questions and insights—work he said would have taken his team months.**

Jackson 基因组医学实验室的免疫学教授, 研究员 Derya Unutmaz 用 GPT-5.5 Pro 分析了一个基因表达数据集, 含 62 个样本, 近 28,000 个基因. 模型产出一份详细的研究报告, 不光总结了发现, 还提出了关键问题和见解. 他说这些工作换成他的团队要做好几个月.

Bartosz Naskręcki**, assistant professor of mathematics at Adam Mickiewicz University in Poznań, Poland, used GPT**‑**5.5 in Codex to build an algebraic-geometry app from a single prompt in 11 minutes, visualizing the intersection of quadratic surfaces and converting the resulting curve into a Weierstrass model.**

波兰波兹南 Adam Mickiewicz 大学的数学助理教授 Bartosz Naskręcki, 用 Codex 里的 GPT-5.5 从一条提示词出发, 11 分钟做出一个代数几何应用: 把两个二次曲面的交线可视化, 再把这条曲线化成 Weierstrass 模型.

![Image block](images/p11-he-later-extended-the-app-with-more-stable-singularity.png)

图片: 蓝色为主的渐变装饰图, 没有具体内容.

He later extended the app with more stable singularity visualization and exact coefficients that can be reused in further work. For him, the bigger shift is that Codex can now help implement custom mathematical visualization and computer-algebra workflows that previously required dedicated tools. Together, these examples show GPT‑5.5 turning expert intent into working research tools and analyses.

他后来又给应用加了更稳定的奇点可视化, 以及能在后续工作里复用的精确系数. 在他看来, 更大的变化是 Codex 现在能帮忙实现定制的数学可视化和计算机代数工作流, 这些以前要靠专门的工具. 这几个例子合起来说明, GPT-5.5 能把专家的意图变成可用的研究工具和分析.

## We use cookies (我们使用 Cookie)

We use cookies to help this site function, understand service usage, and support marketing efforts. Visit preferences anytime. View our [Cookie Policy](https://openai.com/policies/cookie-policy/) for more info.

to change

Cookie 横幅, 同上.

<!-- page 12 of 20 -->

OpenAI

![Image block](images/p12-credit-bartosz-naskr-cki-https-bnaskrecki-faculty-wmi.png)

图片: 应用截图 「Surface Intersection Lab」 (标题上方小字 QUADRIC PENCIL). 画面中间一青一黄两个半透明二次曲面相交, 红线是交线. 右栏 「EFFECTIVE RR MODEL / Weierstrass」, 标签 smooth, 方程 y² = x³ − 0.001642x + 0.01637, Field 为 Q, I = 6.08e-5, J = -6.062e-4, Δ = -3.675e-7, j = -0.004228. 右下角是 det(λQ1 + Q2) = − 0.15λ⁴ − 0.653λ³ − 1.01λ² − 0.665λ − 0.157.

> **对一下:** 截图右栏的 Δ = -3.675e-7 是这条 Weierstrass 曲线的判别式吗?
> 不是. 对 y² = x³ + ax + b, 判别式是 -16(4a³ + 27b²), 代入 a = -0.001642, b = 0.01637 约为 -0.1158. 截图的数其实是四次式 det(λQ1 + Q2) 的不变量组合 4I³ - J²: 4 × (6.08e-5)³ - (6.062e-4)² ≈ -3.675e-7. 曲线系数也由 I, J 给出: -27I ≈ -0.001642, -27J ≈ 0.01637, 两者对得上; 两种 Δ 相差 16 × 3⁹ = 314,928 倍. j 不变量 1728 × 4a³ / (4a³ + 27b²) ≈ -0.004229, 和截图 -0.004228 只差末位舍入. 用截图里只留两三位的四次式系数重算 I, 结果接近 0, 正负都不稳, 这一步验证不了.

[Credit: Bartosz Naskręcki](https://bnaskrecki.faculty.wmi.amu.edu.pl/quadr/) Prompt: # Algebraic geometry surface intersection… Show more

图片来源: Bartosz Naskręcki. 提示词: # 代数几何曲面求交... 展开更多

# “It’s incredibly energizing to use OpenAI’s new GPT-5.5 model in our harness, have it reason over massive biochemical datasets to predict human drug outcomes, and then see it deliver significant accuracy gains on our hardest drug discovery evals. If OpenAI keeps cooking like this, the foundations of drug discovery will change by the end of the year.” ("在我们的 harness 里用 OpenAI 的新模型 GPT-5.5, 让它在海量生化数据上推理, 预测药物在人体上的结果, 再看它在我们最难的药物发现评测上大幅提升准确率, 这让人非常振奋. 如果 OpenAI 继续这样出货, 药物发现的根基到年底就会改变.")

**— Brandon White, Co-Founder & CEO at Axiom Bio**

**— Brandon White, Axiom Bio 联合创始人兼 CEO**

**Next-generation inference efficiency**

**下一代推理效率**

## W ki e use coo es (我们使用 Cookie)

Serving GPT‑5.5 at GPT‑5.4 latency required rethinking inference as We use cookies to help this site function, understand service usage, and support marketing efforts. Visit to change an integrated system, not a set of isolated optimizations. GPT‑5.5 was preferences anytime. View our [Cookie Policy](https://openai.com/policies/cookie-policy/) for more info. co-designed for, trained with, and served on NVIDIA GB200 and GB300 NVL72 systems. Codex and GPT‑5.5 were instrumental in how we achieved our performance targets. Codex helped the team move faster from idea to benchmarkable implementation, sketching approaches, wiring experiments, and helping identify which optimizations were worth deeper investment. GPT‑5.5 helped find

标题 「We use cookies」 被识别成了乱码. 正文: 要以 GPT-5.4 的延迟提供 GPT-5.5, 得把推理当成一个整体系统重新设计, 而不是一堆孤立的优化. GPT-5.5 是为 NVIDIA GB200 和 GB300 NVL72 系统协同设计的, 也在这些系统上训练和提供服务. 我们能达成性能目标, Codex 和 GPT-5.5 功不可没. Codex 帮团队更快地从想法走到可以跑基准的实现: 勾勒方案, 搭实验, 帮忙判断哪些优化值得深挖. GPT-5.5 帮忙找到了... (句子在翻页处断了, 中间夹着 Cookie 横幅.)

<!-- page 13 of 20 -->

OpenAI

One such improvement was load balancing and partitioning heuristics. Before GPT‑5.5, we split requests on an accelerator into a fixed number of chunks to balance work across computing cores, ensuring big and small requests could run on the same GPU.

其中一项改进是负载均衡和切分的启发式规则. GPT-5.5 之前, 我们把一个加速器上的请求切成固定数量的块, 在各个计算核心之间分摊工作, 让大请求和小请求能在同一块 GPU 上跑.

However, a pre-determined number of static chunks is not optimal for all traffic shapes. To better utilize GPUs, Codex analyzed weeks’ worth of production traffic patterns and wrote custom heuristic algorithms to optimally partition and balance work. The effort had an outsized impact, increasing token generation speeds by over 20%.

可是预先定死数量的静态分块, 并不适合所有流量形态. 为了把 GPU 用得更满, Codex 分析了几周的线上流量模式, 写出定制的启发式算法来切分和均衡工作. 这件事的效果出奇地大, token 生成速度提升了 20% 以上.

> **想:** token 生成速度提升 20% 以上, 和 「每 token 延迟与 GPT-5.4 持平」 是什么关系?
> 页面没把两者连起来. 若 GPT-5.5 和 GPT-5.4 一样大, 这 20% 应该表现为 GPT-5.5 比 GPT-5.4 更快; 说 「持平」, 意味着 GPT-5.5 本身每 token 的计算更重, 被这类优化抵消了. 第 2 页 「更大的模型通常更慢」 也朝这个方向暗示, 但参数量, 激活量, 硬件配比一个都没给. 20% 的基线是哪个模型, 哪种流量, 是吞吐还是单请求速度, 也没说.

## Advancing cybersecurity for everyone’s safety (推进网络安全, 保障每个人的安全)

Preparing the world for models that are very good at finding and patching security vulnerabilities is a team sport and will require the entire ecosystem to work hard to build resilience, with democratized model access and iterative deployment for the [next era of.cyber defense](https://openai.com/index/scaling-trusted-access-for-cyber-defense/)

模型越来越擅长发现和修补安全漏洞, 让世界为此做好准备是一项团队运动, 需要整个生态一起下功夫提高韧性: 让更多人用得上模型, 并迭代部署, 迎接网络防御的下一个时代.

Frontier models are becoming increasingly more capable in cybersecurity. Those capabilities will become broadly distributed and we believe the best path forward is to make sure they can be put to use for accelerating cyber defense and strengthening the ecosystem.

前沿模型在网络安全上越来越强. 这些能力终将广泛扩散, 我们认为最好的出路是确保它们被用来加快网络防御, 加固整个生态.

GPT‑5.5 is an incremental but important step towards AI that can solve some of the world’s toughest challenges like [cyber](https://openai.com/index/strengthening-cyber-resilience/)security. With GPT‑5.2 in December, we proactively deployed the necessary cyber to limit potential cyber abuse with our models; now[safeguards](https://openai.com/index/strengthening-cyber-resilience/) with GPT‑5.5, we’re deploying stricter classifiers for potential cyber risk which some users may find annoying initially, as we tune them over time.

网络安全是世界上最难的挑战之一, GPT-5.5 朝着能解决这类挑战的 AI 迈出了渐进但重要的一步. 去年 12 月发布 GPT-5.2 时, 我们主动部署了必要的网络安全保护措施, 限制模型可能被用于网络滥用; 这次随 GPT-5.5, 我们部署了更严格的网络风险分类器, 一开始有些用户可能会觉得烦, 我们会逐步调整.

We’ve identified cybersecurity as a category in our [Preparedness](https://cdn.openai.com/pdf/18a02b5d-6b67-4cec-ab64-68cdfbddebcd/preparedness-framework-v2.pdf) for years as our models have incrementally[Framework](https://cdn.openai.com/pdf/18a02b5d-6b67-4cec-ab64-68cdfbddebcd/preparedness-framework-v2.pdf) improved, while we develop and calibrate mitigations iteratively, to be able to responsibly release models with meaningful cybersecurity capabilities.

随着模型一步步变强, 我们多年来一直把网络安全列为 Preparedness Framework 里的一个类别, 同时迭代地开发和校准缓解措施, 以便负责任地发布具备实质网络安全能力的模型.

**We are deploying industry-leading safeguards for this level of**

## We use cookies (我们使用 Cookie)

**cyber capability.** We first introduced cyber-specific safeguards

i h l , hi h h i d , fiGPT 5 2 w t ast year w c we ave cont nue to test re ne‑ . We use cookies to help this site function, unders an serv ce usage, an suppor mar e ng e or s. s t d i d t k ti ff t Vi it tochange to change q p y . ‑ . ,preferences anytime. View our [Cookie Policy](https://openai.com/policies/cookie-policy/) for more info. and build on in subse uent de lo ments For GPT 5 5 we

**针对这一级别的网络能力, 我们部署了行业领先的保护措施.** 我们去年随 GPT-5.2 首次引入了专门针对网络安全的保护措施, 之后持续测试, 改进, 并在后续部署中继续加固. 这一段和 Cookie 横幅叠在一起, 字母被打散, 按残字还原. 针对 GPT-5.5, 我们...

designed tighter controls around higher-risk activity, sensitive cyber requests, and added protections for repeated misuse. Broad access is made possible through our investments in model safety, authenticated usage, and monitoring for impermissible use. We have been working with external experts for months to develop, test and iterate on the robustness of

...针对高风险活动和敏感的网络安全请求设计了更严的管控, 并对反复滥用加了防护. 广泛开放之所以可行, 靠的是我们在模型安全, 实名认证使用, 违规使用监测上的投入. 几个月来, 我们一直和外部专家合作, 开发, 测试并迭代... 的稳健性 (句子在翻页处断了).

<!-- page 14 of 20 -->

respond to serious misuse.

...应对严重滥用. (上句残尾.)

OpenAI

around the cyber workflows most likely to cause harm by malicious actors.

...围绕最可能被恶意行为者用来造成危害的网络安全工作流. (残句, 前文丢失.)

**We are expanding access to accelerate cyber defense at every level.** We are making our cyber-permissive models available through , starting with Codex, which[Trusted Access for Cyber](https://openai.com/index/scaling-trusted-access-for-cyber-defense/) includes expanded access to the advanced cybersecurity capabilities of GPT‑5.5 with fewer restrictions for verified users meeting certain at launch. Organizations who are[trust signals](https://developers.openai.com/codex/concepts/cyber-safety) responsible for can apply to[defending critical infrastructure](https://openai.com/index/accelerating-cyber-defense-ecosystem/) access cyber-permissive models like GPT‑5.4‑Cyber, while meeting strict security requirements to use these models for securing their internal systems. This gives a wide range of verified defenders more capable tools for legitimate security work with less unnecessary friction to ensure we democratize access to important defensive capabilities. Users can apply for trusted access at to reduce unnecessary[chatgpt.com/cyber](http://chatgpt.com/cyber?openaicom-did=8284cfdf-f77b-4f75-9778-492bff7738cc&openaicom_referred=true) refusals while using GPT‑5.5 for verified defensive work.

**我们正在扩大访问, 在各个层面加快网络防御.** 我们通过 Trusted Access for Cyber 提供对网络安全限制更宽松的模型, 先从 Codex 开始: 满足一定信任信号的已验证用户, 在发布时就能以更少限制使用 GPT-5.5 的高级网络安全能力. 负责保护关键基础设施的机构, 可以申请使用 GPT-5.4-Cyber 这类宽松模型, 但要满足严格的安全要求, 且只能用来保护自己的内部系统. 这样, 大量已验证的防御者能拿到更强的工具做正当的安全工作, 少受不必要的阻碍, 让重要的防御能力人人可用. 用户可以在 chatgpt.com/cyber 申请受信任访问, 在用 GPT-5.5 做已验证的防御工作时减少不必要的拒答. (几处链接文字被挪了位置.)

**We are working with government partners to help protect critical infrastructure for the public.** Together, we are exploring how advanced AI can support the defensive work of trusted officials responsible for systems people rely on, from the digital systems that secure important taxpayer data to the power grid and water supplies in local communities.

**我们正和政府伙伴合作, 帮助为公众保护关键基础设施.** 我们一起探索, 先进 AI 如何支持那些负责民生系统的可信官员做防御工作, 从保护重要纳税人数据的数字系统, 到地方社区的电网和供水.

We are treating the biological/chemical and cybersecurity capabilities of GPT‑5.5 as High under our . While[Preparedness Framework](https://cdn.openai.com/pdf/18a02b5d-6b67-4cec-ab64-68cdfbddebcd/preparedness-framework-v2.pdf) GPT‑5.5 didn’t reach Critical cybersecurity capability level, our evaluations and testing showed that its cybersecurity capabilities are a step up compared to GPT‑5.4.

按我们的 Preparedness Framework, GPT-5.5 的生物/化学能力和网络安全能力都按 High 处理. GPT-5.5 没有达到 Critical 级网络安全能力, 但评估和测试显示, 它的网络安全能力比 GPT-5.4 上了一个台阶.

> **问:** 生物/化学和网络安全都评 High, 「没到 Critical」 这句覆盖了哪一项?
> 只覆盖网络安全. 原句是 「didn't reach Critical cybersecurity capability level」, 生物/化学离 Critical 多远, 本页没说. 能对上的分数只有第 17 页内部 CTF 任务 88.1% 对 GPT-5.4 的 83.7%, 高 4.4 个点, 和 「a step up」 的说法一致. 生物方向本页只印了 GeneBench 和 BixBench 两项数据分析评测, 它们考的是统计分析能力, 不是 Preparedness 意义上的风险评测, 相关结果都指向系统卡.

In addition, GPT‑5.5 went through our full safety and governance process prior to release, including preparedness evaluations, domainspecific testing, new targeted evaluations for advanced biology and cybersecurity capabilities, and robust testing with external experts. We share more details in the GPT‑5.5 .[system card](https://deploymentsafety.openai.com/gpt-5-5)

此外, GPT-5.5 发布前走完了我们完整的安全与治理流程, 包括 Preparedness 评估, 分领域测试, 针对高级生物和网络安全能力的新专项评估, 以及和外部专家一起做的充分测试. 更多细节见 GPT-5.5 系统卡.

This work reflects our broader AI resilience approach, which we believe is needed as model capabilities advance. We want powerful AI to be available to the people using it to defend systems, institutions, and the public. The viable path is trusted access, robust safeguards

这些工作体现了我们更广的 AI 韧性思路, 我们认为模型能力越强越需要它. 我们希望强大的 AI 能交到那些用它保护系统, 机构和公众的人手里. 可行的路是受信任访问, 稳健的保护措施... (句子被横幅截断.)

## We use cookies (我们使用 Cookie)

We use cookies to help this site function, understand service usage, and support marketing efforts. Visit preferences anytime. View our [Cookie Policy](https://openai.com/policies/cookie-policy/) for more info.

to change

Cookie 横幅, 同上.

<!-- page 15 of 20 -->

OpenAl

## Availability and pricing (上线与定价)

Today, GPT‑5.5 is rolling out to Plus, Pro, Business, and Enterprise users in ChatGPT and Codex, and GPT‑5.5 Pro is rolling out to Pro, Business, and Enterprise users in ChatGPT. We’ll bring GPT‑5.5 and GPT‑5.5 Pro to the API very soon.

今天起, GPT-5.5 向 ChatGPT 和 Codex 的 Plus, Pro, Business, Enterprise 用户推送, GPT-5.5 Pro 向 ChatGPT 的 Pro, Business, Enterprise 用户推送. GPT-5.5 和 GPT-5.5 Pro 很快会上 API.

In ChatGPT, GPT‑5.5 Thinking is available to Plus, Pro, Business, and Enterprise users. GPT‑5.5 Pro, designed for even harder questions and higher-accuracy work, is available to Pro, Business, and Enterprise users.

在 ChatGPT 里, GPT-5.5 Thinking 向 Plus, Pro, Business, Enterprise 用户开放. GPT-5.5 Pro 面向更难的问题和要求更高准确率的工作, 向 Pro, Business, Enterprise 用户开放.

## W ki e use coo es (我们使用 Cookie)

In Codex, GPT‑5.5 is available for Plus, Pro, Business, Enterprise, Edu, and Go plans with a 400K context window. GPT‑5.5 is also availableWe use cookies to help this site function, understand service usage, and support marketing efforts. Visit to change preferences anytime. View our [Cookie Policy](https://openai.com/policies/cookie-policy/) for more info. in Fast mode, generating tokens 1.5x faster for 2.5x the cost.

在 Codex 里, GPT-5.5 向 Plus, Pro, Business, Enterprise, Edu 和 Go 套餐开放, 上下文窗口 400K. GPT-5.5 也提供 Fast 模式, token 生成速度快 1.5x, 费用是 2.5x. (中间夹着 Cookie 横幅.)

> **核对:** Codex 里 400K 窗口, API 里 1M 窗口, 附录长上下文评测测到了哪一档?
> 测到 1M. 第 18 页 MRCR v2 最长一档是 512K-1M, GPT-5.5 为 74.0%; Graphwalks 也有 1mil 两行. 这几档在 Codex 的 400K 窗口里用不上, 只对应 API 的 1M 窗口. 同一个模型在两个入口给了两种窗口, 页面没说原因, 可能和服务成本有关, 这只是推测. Fast 模式 1.5x 的速度换 2.5x 的费用, 每 token 单价变成 2.5 倍, 页面也没说 Fast 模式是不是同一个模型换了服务配置.

For API developers, gpt-5.5 will soon be available in the Responses and Chat Completions APIs at \$5 per 1M input tokens and \$30 per 1M output tokens, with a 1M context window. Batch and Flex pricing are available at half the standard API rate, while Priority processing is

面向 API 开发者, gpt-5.5 很快会在 Responses 和 Chat Completions API 上线, 价格是每 1M 输入 token $5, 每 1M 输出 token $30, 上下文窗口 1M. Batch 和 Flex 按标准 API 价格的一半计费, 而 Priority 处理是... (句子在翻页处断了.)

<!-- page 16 of 20 -->

OpenAl

and \$180 per 1M output tokens. See the for full details.<u>pricing page</u>

...以及每 1M 输出 token $180. 完整信息见定价页.

> **看表:** 这个 「$180 per 1M output tokens」 是 Priority 的价格吗?
> 多半不是. 翻页处丢了一截, 残句从 「Priority processing is」 直接跳到 「and $180」. $180 是标准输出价 $30 的 6 倍; 按标准价输出对输入 6:1 的比例推, 对应输入价是 $30, 这更像 gpt-5.5-pro 的价格行, Priority 自己的价格和中间那句话都丢了. 本页能确定的只有 gpt-5.5 的 $5 / $30 和 Batch, Flex 打五折. 下一段又说 GPT-5.5 比 GPT-5.4 贵, 可 GPT-5.4 的价格本页没印.

While GPT‑5.5 is priced higher than GPT‑5.4, it is both more intelligent and much more token efficient. In Codex, we have carefully tuned the experience so GPT‑5.5 delivers better results with fewer tokens than GPT‑5.4 for most users, whi[le continuing](https://openai.com/api/pricing/) to offer generous usage across subscription levels.

GPT-5.5 定价比 GPT-5.4 高, 但它更聪明, token 效率也高得多. 在 Codex 里, 我们仔细调过体验, 让大多数用户用 GPT-5.5 时能以比 GPT-5.4 更少的 token 拿到更好的结果, 同时各档订阅仍保留充足的用量.

## Evaluations (评测)

Coding

编程

| Eval | GPT-5.5 | GPT-5.4 | GPT-5.5Pro | GPT-5.4Pro | ClaudeOpus4.7 | Gemini3.1Pro |
| --- | --- | --- | --- | --- | --- | --- |
| SWE-BenchPro | 58.6% | 57.7% | - | - | 64.3% | 54.2% |
| (Public)* |  |  |  |  |  |  |
| Terminal-Bench2.0 | 82.7% | 75.1% | - | - | 69.4% | 68.5% |
| Expert-SWE | 73.1% | 68.5% | - | - | - | - |
| (Internal) |  |  |  |  |  |  |

附录各表六列依次是 GPT-5.5, GPT-5.4, GPT-5.5 Pro, GPT-5.4 Pro, Claude Opus 4.7, Gemini 3.1 Pro. SWE-Bench Pro (Public)*: 58.6%, 57.7%, -, -, 64.3%, 54.2%. Terminal-Bench 2.0: 82.7%, 75.1%, -, -, 69.4%, 68.5%. Expert-SWE (内部): 73.1%, 68.5%, 其余为 -.

\*Labs have noted [evidence of memorization](https://www.anthropic.com/news/claude-opus-4-7) on this eval

\*有实验室指出这项评测存在记忆现象的证据.

Professional

专业

| Eval | GPT-5.5 | GPT-5.4 | GPT-5.5Pro | GPT-5.4Pro | ClaudeOpus4.7 | Gemini3.1Pro |
| --- | --- | --- | --- | --- | --- | --- |
| GDPval(winsorties) | 84.9% | 83.0% | 82.3% | 82.0% | 80.3% | 67.3% |
| FinanceAgentv1.1 | 60.0% fi | 56.0% | - | 61.5% | 64.4% | 59.7% |
| InvestmentBanking | 88.5% | 87.3% | 88.6% | 83.6% | - | - |
| ModelingTasks |  |  |  |  |  |  |
| (Internal) |  |  |  |  |  |  |
| OfficeQAPro | 54.1% | 53.2% | - | - | 43.6% | 18.1% |

GDPval (胜或平): 84.9%, 83.0%, 82.3%, 82.0%, 80.3%, 67.3%. FinanceAgent v1.1: 60.0%, 56.0%, -, 61.5%, 64.4%, 59.7% (「fi」 是抓页残字). 投行建模任务 (内部): 88.5%, 87.3%, 88.6%, 83.6%, -, -. OfficeQA Pro: 54.1%, 53.2%, -, -, 43.6%, 18.1%.

> **拆开:** GDPval 上 GPT-5.5 Pro 为什么比 GPT-5.5 还低?
> 表里 GPT-5.5 Pro 82.3%, GPT-5.5 84.9%, Pro 低 2.6 个点; 上一代也一样, GPT-5.4 Pro 82.0% 低于 GPT-5.4 的 83.0%. 页面没解释. GDPval 是专家两两比较交付物, 更长, 更 「全面」 的回答未必更受评审青睐, 这只是一种可能. 另外 GPT-5.5 对 GPT-5.4 只高 1.9 个点, 首表把它排在第三行, 实际是附录里增幅偏小的一项. GDPval 页面没给允许平局时的明确胜出率, 84.9% 里有多少是平局看不出来.

## We use cookies (我们使用 Cookie)

Computer use and vision

电脑操作与视觉

<table><tr><td colspan="7">Computer use and visionWe use cookies to help this site function, understand service usage, and support marketing efforts. Visit preferences anytime. View our Cookie Policy for more info.</td></tr><tr><td>Eval</td><td>GPT-5.5</td><td>GPT-5.4</td><td>GPT-5.5 Pro</td><td>GPT-5.4 Pro</td><td>Claude Opus 4.7</td><td>Gemini 3.1 Pro</td></tr><tr><td>OSWorld-Verified</td><td>78.7%</td><td>75.0%</td><td>-</td><td>-</td><td>78.0%</td><td>-</td></tr><tr><td>MMMU Pro (no tools)</td><td>81.2%</td><td>81.2%</td><td>-</td><td>-</td><td>-</td><td>80.5%</td></tr></table>

OSWorld-Verified: 78.7%, 75.0%, -, -, 78.0%, -. MMMU Pro (不用工具): 81.2%, 81.2%, -, -, -, 80.5%. 表头一格混进了 Cookie 横幅.

> **确认:** 视觉这一行 GPT-5.5 比 GPT-5.4 进步了多少?
> 没有进步. MMMU Pro (不用工具) 两者都是 81.2%, 一分不差, 比 Gemini 3.1 Pro 的 80.5% 高 0.7 个点. OSWorld-Verified 78.7% 对 Claude Opus 4.7 的 78.0% 也只领先 0.7 个点. 这一组里真正拉开的是对 GPT-5.4 的 OSWorld 3.7 个点. 页面正文把 GPT-5.5 的电脑操作说成 「seeing what's on screen」, 视觉理解本身这一代基本没动.

<!-- page 17 of 20 -->

OpenAl

## Tool use (工具使用)

| Eval | GPT-5.5 | GPT-5.4 | GPT-5.5Pro | GPT-5.4Pro | ClaudeOpus4.7 | Gemini3.1Pro |
| --- | --- | --- | --- | --- | --- | --- |
| BrowseComp | 84.4% | 82.7% | 90.1% | 89.3% | 79.3% | 85.9% |
| MCPAtlas** | 75.3% | 70.6% | - | - | 79.1% | 78.2% |
| Toolathlon | 55.6% | 54.6% | - | - | - | 48.8% |
| Tau2-bench | 98.0% | 92.8% | - | - | - | - |
| Telecom*** |  |  |  |  |  |  |
| (originalprompts) |  |  |  |  |  |  |

BrowseComp: 84.4%, 82.7%, 90.1%, 89.3%, 79.3%, 85.9%. MCP Atlas**: 75.3%, 70.6%, -, -, 79.1%, 78.2%. Toolathlon: 55.6%, 54.6%, -, -, -, 48.8%. Tau2-bench Telecom*** (原始提示词): 98.0%, 92.8%, 其余为 -.

> **回看:** 工具使用四项里, GPT-5.5 在哪几项领先?
> 有别家对照的三项里只领先一项. MCP Atlas 75.3% 排第三, 低于 Claude Opus 4.7 的 79.1% 和 Gemini 3.1 Pro 的 78.2%; BrowseComp 84.4% 低于两个 Pro 和 Gemini; 只有 Toolathlon 55.6% 高过 Gemini 的 48.8%, 但 Claude 那一格是空的. Tau2-bench 没有别家对照. 对 GPT-5.4 的增幅分别是 1.7, 4.7, 1.0, 5.2 个点.

\*\* MCP Atlas: results from Scale AI after the latest 2026 April update.

\*\* MCP Atlas: 结果来自 Scale AI, 基于 2026 年 4 月的最新一次更新.

\*\*\* Tau2-bench telecom: results for 5.5 and 5.4 with original prompts i.e no prompt adjustment. This omits results from other labs that were evaluated with prompt adjustments.

\*\*\* Tau2-bench telecom: 5.5 和 5.4 的结果用的是原始提示词, 即没有调整提示词. 其他实验室的结果是调过提示词测的, 这里略去.

## Academic (学术)

| Eval | GPT-5.5 | GPT-5.4 | GPT-5.5Pro | GPT-5.4Pro | ClaudeOpus4.7 | Gemini3.1Pro |
| --- | --- | --- | --- | --- | --- | --- |
| GeneBench | 25.0% | 19.0% | 33.2% | 25.6% | - | - |
| FrontierMathTier1-3 | 51.7% | 47.6% | 52.4% | 50.0% | 43.8% | 36.9% |
| FrontierMathTier4 | 35.4% | 27.1% | 39.6% | 38.0% | 22.9% | 16.7% |
| BixBench | 80.5% | 74.0% | - | - | - | - |
| GPQADiamond | 93.6% | 92.8% | - | 94.4% | 94.2% | 94.3% |
| Humanity'sLast | 41.4% | 39.8% | 43.1% | 42.7% | 46.9% | 44.4% |
| Exam(notools) |  |  |  |  |  |  |
| Humanity'sLast | 52.2% | 52.1% | 57.2% | 58.7% | 54.7% | 51.4% |
| Exam(withtools) |  |  |  |  |  |  |

GeneBench: 25.0%, 19.0%, 33.2%, 25.6%, -, -. FrontierMath Tier 1-3: 51.7%, 47.6%, 52.4%, 50.0%, 43.8%, 36.9%. FrontierMath Tier 4: 35.4%, 27.1%, 39.6%, 38.0%, 22.9%, 16.7%. BixBench: 80.5%, 74.0%, 其余为 -. GPQA Diamond: 93.6%, 92.8%, -, 94.4%, 94.2%, 94.3%. Humanity's Last Exam (不用工具): 41.4%, 39.8%, 43.1%, 42.7%, 46.9%, 44.4%. Humanity's Last Exam (带工具): 52.2%, 52.1%, 57.2%, 58.7%, 54.7%, 51.4%.

> **停一下:** HLE 和 GPQA 上, GPT-5.5 和 GPT-5.5 Pro 的位置在哪?
> 都不领先. HLE 不用工具, GPT-5.5 的 41.4% 低于 Claude Opus 4.7 的 46.9% 和 Gemini 3.1 Pro 的 44.4%; 带工具时 52.2% 对 GPT-5.4 的 52.1% 只多 0.1 个点, GPT-5.5 Pro 的 57.2% 还低于 GPT-5.4 Pro 的 58.7%, 新一代 Pro 退了 1.5 个点. GPQA Diamond 上 GPT-5.5 的 93.6% 在有分数的五列里排倒数第二, 只高过 GPT-5.4 的 92.8%, 另外三家都在 94.2% 到 94.4% 之间. 学术组里 GPT-5.5 明显领先的是 FrontierMath, Tier 4 对 GPT-5.4 高 8.3 个点.

> **再看:** BixBench 说 「leading performance among models with published scores」, 表里有别家的分数吗?
> 没有. BixBench 一行只有 GPT-5.5 的 80.5% 和 GPT-5.4 的 74.0%, 两个 Pro 和两家竞品全是 「-」. GeneBench 也只有 OpenAI 四列, 这是 OpenAI 自己新出的评测. 「领先」 是和页外公布过分数的模型比, 对照数字本页没印, 无从核对.

<table><tr><td colspan="8">We use cookies Cybersecurity</td></tr><tr><td colspan="6">We use cookies to help this site function, understand service usage, and support marketing efforts. Visit preferences anytime. View our Cookie Policy for more info.</td><td>to change</td><td></td></tr><tr><td></td><td>Eval</td><td>GPT-5.5</td><td>GPT-5.4</td><td>GPT-5.5 Pro</td><td>GPT-5.4 Pro</td><td>Claude Opus 4.7</td><td>Gemini 3.1 Pro</td></tr><tr><td></td><td>Capture-the-Flags challenge tasks (Internal)****</td><td>88.1%</td><td>83.7%</td><td>-</td><td>-</td><td>-</td><td>-</td></tr></table>

网络安全: 夺旗 (CTF) 挑战任务 (内部)****: GPT-5.5 88.1%, GPT-5.4 83.7%, 其余为 -. 表头一格混进了 Cookie 横幅.

<!-- page 18 of 20 -->

OpenAI

\*\*\*\* An expansion of the hardest CTFs used in system cards with additional hard challenges.

\*\*\*\* 在系统卡所用最难的一批 CTF 题基础上, 又扩充了一些难题.

Long context

长上下文

| Eval | GPT-5.5 | GPT-5.4 | GPT-5.5Pro | GPT-5.4Pro | ClaudeOpus4.7 | Gemini3.1Pro |
| --- | --- | --- | --- | --- | --- | --- |
| GraphwalksBFS | 73.7% | 62.5% | - | - | 76.9% | - |
| 256kf1 |  |  |  |  |  |  |
| GraphwalksBFS | 45.4% | 9.4% | - | - | 41.2%(Opus | - |
| 1milf1 |  |  |  |  | 4.6) |  |
| Graphwalksparents | 90.1% | 82.8% | - | - | 93.6% | - |
| 256kf1 |  |  |  |  |  |  |
| Graphwalksparents | 58.5% | 44.4% | - | - | 72.0%(Opus | - |
| 1milf1 |  |  |  |  | 4.6) |  |
| OpenAIMRCRv28- | 98.1% | 97.3% | - | - | - | - |
| needle4K-8K |  |  |  |  |  |  |
| OpenAIMRCRv28- | 93.0% | 91.4% | - | - | - | - |
| needle8K-16K |  |  |  |  |  |  |
| OpenAIMRCRv28- | 96.5% | 97.2% | - | - | - | - |
| needle16K-32K |  |  |  |  |  |  |
| OpenAIMRCRv28- | 90.0% | 90.5% | - | - | - | - |
| needle32K-64K |  |  |  |  |  |  |
| OpenAIMRCRv28- | 83.1% | 86.0% | - | - | - | - |
| needle64K-128K |  |  |  |  |  |  |
| OpenAIMRCRv28- | 87.5% | 79f.3%i | - | - | 59.2% | - |
| needle128K-256K |  |  |  |  |  |  |
| OpenAIMRCRv28- | 81.5% | 57.5% | - | - | - | - |
| needle256K-512K |  |  |  |  |  |  |
| OpenAIMRCRv28- | 74.0% | 36.6% | - | - | 32.2% | - |
| needle512K-1M |  |  |  |  |  |  |

Graphwalks BFS 256k f1: 73.7%, 62.5%, -, -, 76.9%, -. Graphwalks BFS 1mil f1: 45.4%, 9.4%, -, -, 41.2% (Opus 4.6), -. Graphwalks parents 256k f1: 90.1%, 82.8%, -, -, 93.6%, -. Graphwalks parents 1mil f1: 58.5%, 44.4%, -, -, 72.0% (Opus 4.6), -. OpenAI MRCR v2 8-needle, 按输入长度分八档, GPT-5.5 对 GPT-5.4: 4K-8K 98.1% 对 97.3%; 8K-16K 93.0% 对 91.4%; 16K-32K 96.5% 对 97.2%; 32K-64K 90.0% 对 90.5%; 64K-128K 83.1% 对 86.0%; 128K-256K 87.5% 对 79.3% (「79f.3%i」 是 「79.3%」 夹进了 「fi」 连字), Claude Opus 4.7 为 59.2%; 256K-512K 81.5% 对 57.5%; 512K-1M 74.0% 对 36.6%, Claude Opus 4.7 为 32.2%.

> **对一下:** Graphwalks 1mil 两行, Claude 那一列是 Opus 4.7 的分数吗?
> 不是. 表头是 Claude Opus 4.7, 两格却标着 「(Opus 4.6)」: BFS 41.2%, parents 72.0%. 页面没给 Opus 4.7 在 1M 上的 Graphwalks 分数. 按这两格比, GPT-5.5 在 BFS 1mil 上以 45.4% 领先, 在 parents 1mil 上以 58.5% 落后 13.5 个点, 而且比的是上一代 Claude. 256k 两行才是 Opus 4.7, 那里 Claude 两项都更高 (76.9% 对 73.7%, 93.6% 对 90.1%).

> **想:** MRCR 八档里, GPT-5.5 有没有输给 GPT-5.4 的档?
> 有三档. 16K-32K 96.5% 对 97.2%, 32K-64K 90.0% 对 90.5%, 64K-128K 83.1% 对 86.0%, GPT-5.5 分别低 0.7, 0.5, 2.9 个点. 曲线也不单调: 64K-128K 的 83.1% 低于更长一档 128K-256K 的 87.5%, 8K-16K 的 93.0% 低于 16K-32K 的 96.5%. 真正拉开差距的是 128K 以上三档, 分别高 8.2, 24.0, 37.4 个点. 页面没印每档样本数, 分不清中间几档的起伏是噪声还是真差距.

Abstract reasoning

抽象推理

<table><tr><td colspan="7">We use cookies</td></tr><tr><td>Eval</td><td>GPT-5.5</td><td>GPT-5.4</td><td>GPT-5.5 Pro</td><td>GPT-5.4 Pro</td><td>Claude Opus 4.7 to change</td><td>Gemini 3.1 Pro</td></tr><tr><td colspan="7">We use cookies to help this site function, understand service usage, and support marketing efforts. Visit preferences anytime. View our Cookie Policy for more info.</td></tr><tr><td>ARC-AGI-1 (Verified)</td><td>95.0%</td><td>93.7%</td><td>-</td><td>94.5%</td><td>93.5%</td><td>98.0%</td></tr><tr><td>ARC-AGI-2 (Verified)</td><td>85.0%</td><td>73.3%</td><td>-</td><td>83.3%</td><td>75.8%</td><td>77.1%</td></tr></table>

ARC-AGI-1 (Verified): 95.0%, 93.7%, -, 94.5%, 93.5%, 98.0%. ARC-AGI-2 (Verified): 85.0%, 73.3%, -, 83.3%, 75.8%, 77.1%. 表里夹着 Cookie 横幅.

> **问:** ARC-AGI 两行里, GPT-5.5 各排第几?
> ARC-AGI-1 排第二, Gemini 3.1 Pro 的 98.0% 比它高 3.0 个点. ARC-AGI-2 排第一, 85.0% 比 GPT-5.4 高 11.7 个点, 比 GPT-5.4 Pro 的 83.3% 高 1.7 个点, 比 Gemini 高 7.9 个点. GPT-5.5 Pro 这两行都空着, 页面没说是没测还是没公布.

<!-- page 19 of 20 -->

OpenAl

different output from production ChatGPT in some cases.

...某些情况下, 输出可能和正式上线的 ChatGPT 不同. (评测脚注的残尾, 前文丢失.)

> **核对:** 这条脚注前面丢掉的是什么?
> 只剩最后半句, 前面讲评测设置的部分翻页时丢了. 同一站点的 GPT-5.2 公告里, 这句前面是 「模型按 API 最高可用推理强度运行」 和 「评测在研究环境中进行」 (页外背景). 本页附录每个分数用的推理强度都不可知, GPT-5.5 和 GPT-5.4 是否在同一档, Pro 用了多少 TestingTime 算力, 本页都无法确认. 附录里的新旧对比, 条件没法核对.

| 2026 |
| --- |
| Author |
| OpenAI |

标签 2026; 作者: OpenAI.

Keep reading

继续阅读

![Image block](images/p19-chatgpt-ads-expands-to-southeast-asia-and-taiwan-https.png)

图片: 紫粉渐变的推荐文章缩略图.

[ChatGPT Ads expands to Southeast Asia and Taiwan](https://openai.com/index/chatgpt-ads-expands-southeast-asia-taiwan/)

[**Product Sep 23, 2026**](https://openai.com/index/chatgpt-ads-expands-southeast-asia-taiwan/)

ChatGPT 广告扩展到东南亚和台湾, 产品, Sep 23, 2026.

![Image block](images/p19-view-all-https-openai-com-news.png)

图片: 绿粉渐变的推荐文章缩略图, 文件名取自旁边的 「View all」 链接.

[View all](https://openai.com/news/)

查看全部

[**Product Sep 22, 2026**](https://openai.com/index/better-prompt-caching-for-gpt-6/)

产品, Sep 22, 2026. 链接指向 GPT-6 的 prompt 缓存改进一文, 标题没抓下来.

![Image block](images/p19-introducing-gpt-6-sol-and-luna-https-openai-com-index.png)

图片: 黑色星空里一轮太阳和一弯月亮的推荐缩略图, 对应 Sol 和 Luna 两个名字.

[Introducing GPT-6 Sol and Luna](https://openai.com/index/introducing-gpt-6-sol-and-luna/)

[**Product Sep 22, 2026**](https://openai.com/index/introducing-gpt-6-sol-and-luna/)

GPT-6 Sol 与 Luna 发布, 产品, Sep 22, 2026. 这三篇推荐是抓页当时的站点内容, 比 April 23, 2026 这篇公告晚了五个月.

<table><tr><td>Research</td><td>Products</td><td>Business</td><td>Company</td><td>More</td></tr><tr><td>Research Index</td><td>ChatGPT ↗</td><td>Overview</td><td>About Us</td><td>Stories</td></tr><tr><td>Research Overview</td><td>ChatGPT Business ↗</td><td>Solutions</td><td>Our Charter</td><td>Academy</td></tr><tr><td>Economic Research</td><td>ChatGPT Enterprise ↗</td><td>Resources</td><td>Careers</td><td>Supply Co.</td></tr><tr><td>We use cookies</td><td>ChatGPT for Education ↗</td><td>Plugins</td><td>News</td><td>Livestreams</td></tr><tr><td colspan="3">We use cookies to help this site function, understand service usage, and support marketing efforts. Visit preferences anytime. View our Cookie Policy for more info.</td><td rowspan="2">to change</td><td rowspan="2">Podcast</td></tr><tr><td>GPT-6</td><td>Codex</td><td>Customer Stories</td></tr><tr><td></td><td>Release Notes</td><td>Partner Network</td><td>Support</td><td>RSS</td></tr><tr><td>GPT-5.6</td><td></td><td>Contact Sales</td><td>Help Center ↗</td><td></td></tr><tr><td>GPT-5.5</td><td>API Platform</td><td></td><td></td><td>Terms &amp; Policies</td></tr><tr><td>GPT-5.4</td><td>Overview</td><td>Developers</td><td></td><td>Terms of Use</td></tr><tr><td></td><td>API Log In ↗</td><td>Apps SDK ↗</td><td></td><td>Privacy Policy</td></tr><tr><td>Safety</td><td></td><td></td><td></td><td></td></tr></table>

站点页脚导航, 五栏依次是研究, 产品, 商业, 公司, 更多. 研究: 研究索引, 研究概览, 经济研究, GPT-6, GPT-5.6, GPT-5.5, GPT-5.4, 安全. 产品: ChatGPT, ChatGPT 商业版, ChatGPT 企业版, ChatGPT 教育版, Codex, 发布说明, API 平台, 概览, API 登录. 商业: 概览, 解决方案, 资源, 插件, 客户故事, 合作伙伴网络, 联系销售, 开发者, Apps SDK. 公司: 关于我们, 我们的章程, 招聘, 新闻, 支持, 帮助中心. 更多: 故事, 学院, 周边商店, 直播, 播客, RSS, 条款与政策, 使用条款, 隐私政策. 表里夹着 Cookie 横幅.

<!-- page 20 of 20 -->

Safety App

安全; 应用 (页脚残字).

[**Deployment Safety**](https://deploymentsafety.openai.com/)

[**Security & Privacy**](https://openai.com/security-and-privacy/)

[**Resources**](https://developers.openai.com/learn)

[**Trust & Transparency**](https://openai.com/trust-and-transparency/)

[**Developer Forum**](https://community.openai.com/)

页脚链接: 部署安全, 安全与隐私, 资源, 信任与透明, 开发者论坛.

X 0 回 日

社交媒体图标, 抓成了乱码.

**OpenAI © 2015–2026** <strong><u>Manage Cookies</u></strong>

**OpenAI © 2015–2026** 管理 Cookie

**English United States**

**语言 English, 地区 United States**

We use cookies

We use cookies to help this site function, understand service usage, and support marketing efforts. Visit preferences anytime. View our [Cookie Policy](https://openai.com/policies/cookie-policy/) for more info.

to change

Cookie 横幅, 同上.
