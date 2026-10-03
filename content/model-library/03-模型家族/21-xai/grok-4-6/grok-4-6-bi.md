---
title: "Grok 4.6 · 对照译稿"
category: "模型库"
tags: ["xAI", "对照译稿"]
published: true
excerpt: "Grok 4.6 公开材料的逐段中英对照译稿，附读报告时的疑问块。"
---
<!-- page 1 of 7 -->

A

A

[Back to news](https://x.ai/news)

[返回新闻](https://x.ai/news)

Aug 12, 2026

2026 年 8 月 12 日

# Introducing Grok 4.6

# 推出 Grok 4.6

Grok 4.6 builds on Grok 4.5 with a particular focus on long-running agents and more ambitious interactive and visual work.

Grok 4.6 在 Grok 4.5 的基础上更进一步，重点放在能长时间运行的 agent，以及更有野心的交互式和视觉类工作上。

[Try for free](https://x.ai/build)

[免费试用](https://x.ai/build)

[Start building](https://console.x.ai/?utm_source=website&utm_medium=referral&utm_campaign=news-intro&utm_content=build-cta)

[开始构建](https://console.x.ai/?utm_source=website&utm_medium=referral&utm_campaign=news-intro&utm_content=build-cta)

Today we are releasing Grok 4.6. Grok 4.6 builds on [Grok 4.5](https://x.ai/news/grok-4-5) with a particular focus on longrunning agents and more ambitious interactive and visual work. It stays with complex tasks across many steps, whether researching a topic, analyzing information, working across a codebase, or turning an idea into a polished application or work artifact.

今天我们发布 Grok 4.6。它在 [Grok 4.5](https://x.ai/news/grok-4-5) 的基础上更进一步，重点放在能长时间运行的 agent 和更有野心的交互式，视觉类工作上。它能陪着复杂任务走很多步，不管是调研一个主题，分析信息，跨代码库工作，还是把一个想法打磨成精致的应用或工作成果。

> **想：** 全文主打 long-running agents，可一个量化的续航指标都没给，这主张靠什么撑？
> 第 1 页说「stays with complex tasks across many steps」，第 3 页说 long-running agents 和 longer trajectories，但轨迹多长，多少步，上下文窗口多大，比 Grok 4.5 强多少，一个数都没有。推断：上下文窗口若有扩展，公告级材料几乎一定会写出来当卖点，没写说明重点不在扩窗，而在训练侧——更大范围的 agentic RL 加上更长的补充训练，换的是多步执行里的行为稳定性。验证路径：拿 Grok 4.5 公告和 API 文档的 context length 字段对比，看 4.6 有没有实际扩窗。

<!-- page 2 of 7 -->

## Grok4.6l

## Grok 4.6（本节标题）

Grok 4.6 achieves frontier intelligence across several agentic coding and knowledge work benchmarks. It matches GPT-5.6 Sol on the Artificial Analysis Intelligence Index, which is a composite score of nine benchmarks.

Grok 4.6 在若干 agentic 编程和知识工作基准上达到了前沿水平。它在 Artificial Analysis Intelligence Index 上与 GPT-5.6 Sol 打平，这个指数是九个基准的复合分数。

![Chart block](images/p02-com-p-https-x-ai-etitor-fi-g-https-x-ai-ures-are-drawn.png)

> **想：** 正文说「matches GPT-5.6 Sol」，可图上 Fable 5 (Max) 的 62 明明比两个 61 都高，这句话算准确吗？
> 字面准确，但范围要读全。原文只说「matches GPT-5.6 Sol」，没说领先谁；图上真实排序是 Fable 5 (Max) 62 居首，Grok 4.6 和 GPT-5.6 Sol (Max) 并列 61, Grok 4.5 (High) 56.「frontier intelligence」是「处于前沿水平」的意思，不承诺第一。还要注意这是复合指数的并列：九个基准怎么加权，本页没说，并列 61 不代表逐项都平，第 4 页那张表恰好给出逐项，后面拆开看。

<!-- page 3 of 7 -->

Com[p](https://x.ai/)etitor fi[g](https://x.ai/)ures are drawn from the respective developers’ published system cards or benchmark leaderboards

竞[p](https://x.ai/)品数[g](https://x.ai/)据取自各家开发者发布的 system card 或基准排行榜

Grok 4.6 is available today in [Cursor](https://cursor.com/?mpdid=09a0c2c6-3d21-48fb-9efd-9910c9767a0f) and [Grok Build](https://x.ai/build). We’re offering 2x included usage inside [Grok Build](https://x.ai/build) and [Cursor](https://cursor.com/?mpdid=09a0c2c6-3d21-48fb-9efd-9910c9767a0f) for the first week so you can start trying 4.6 immediately.

Grok 4.6 今天在 [Cursor](https://cursor.com/?mpdid=09a0c2c6-3d21-48fb-9efd-9910c9767a0f) 和 [Grok Build](https://x.ai/build) 上线。第一周之内，这两个产品里随附的用量翻倍，可以立刻开始试 4.6。

## Training Grok 4.6（训练 Grok 4.6）

Grok 4.6 underwent a longer supplemental training run than Grok 4.5, with curated modelgenerated data for reasoning and advanced technical concepts, high-quality engineering data, and an improved optimizer and training recipe. This produced a stronger foundation for the SFT and RL stages that followed.

Grok 4.6 经历了一轮比 Grok 4.5 更长的补充训练（supplemental training run），数据包括为推理和高级技术概念精选的模型生成数据，高质量工程数据，以及改进过的优化器和训练配方。这给后面的 SFT 和 RL 阶段打下了更强的底座。

> **拆开：**「supplemental training run」补的是预训练吗，Grok 4.6 是拿 Grok 4.5 的权重接着训的？
> 最自然的读法是「在 4.5 的基础上做追加训练」，但页面没把话说死。三个证据都指向增量：首段说 builds on Grok 4.5；这里说 supplemental（补充性）且和 4.5 比「更长」，暗示 4.5 也有一段同类的 run；后面说「produced a stronger foundation for the SFT and RL stages」，把这段定位成后训练的前置。但追加训的是什么目标（续训 next-token prediction 还是别的），数据量级，用的什么卡，一句没写。「modelgenerated」也是换行丢了连字符，原文是 model-generated，即用模型自己造的数据。

> **想：**「an improved optimizer and training recipe」到底改了什么，页面没说。
> 第 3 页训练一节只给出「改进过」这个结论，没说改的是哪个分量：是学习率 schedule 和权重平均这类优化器状态，还是数据混合比例这类配方，还是 loss 稳定性修复，无从分辨。能确定的只有结果性描述：更长的 supplemental run 产出了更强的 SFT/RL 底座。公告不给细节是常态，这处只能标注为未披露，别拿社区近期的优化器动向（Muon 一类）直接往里套。验证路径：等技术报告或第三方复现。

We then used Grok 4.5 to regenerate the SFT trajectories across reasoning efforts, agent harnesses, and domains such as STEM, software engineering, and knowledge work, and filtered out problematic traces with model-based checks. The resulting SFT checkpoint shows strong performance and improved behavior.

随后我们用 Grok 4.5 重新生成了 SFT 轨迹，覆盖不同的推理强度（reasoning efforts），不同的 agent 框架（agent harnesses），以及 STEM，软件工程，知识工作等领域，并用模型自动检查过滤掉有问题的轨迹。这样得到的 SFT checkpoint 表现出很强的性能和更好的行为。

> **确认：** 为什么用 Grok 4.5 重生成轨迹，而不用更强的模型，或者直接复用 4.5 当年训时的旧轨迹？
> 页面只交代了做法，没交代动机，可以按常识补两层。一是时间线：生成 SFT 数据时 Grok 4.6 还不存在，上一代的 Grok 4.5 就是手上最强的教师，用它重生成比复用旧轨迹能得到质量更高，风格更一致的数据。二是「regenerate」这个词说明 4.5 自己当年训 SFT 时也有过一版轨迹，现在是按新需求（覆盖更多推理强度和 agent 框架）重做一遍。代价是学生的上限被教师压住，教师的坏习惯也会一起蒸馏过去，所以后一句紧跟了「filtered out problematic traces with model-based checks」——但检查器本身也是模型，谁检查检查器，页面没答。用上一代模型给下一代造 SFT 数据的做法，一般机制见 [OPD 与自蒸馏](../../../../llm-guide/4-后训练/4.6-OPD/4.6-OPD.md)。

Grok 4.6 is trained on a wide range of agentic RL tasks, including knowledge work, general coding, and domain-specific environments for kernel optimization, web development, computer-aided design, and more.

Grok 4.6 在很大范围的 agentic RL 任务上训练，包括知识工作，通用编程，以及面向内核优化，网页开发，计算机辅助设计等领域的专门环境，等等。

> **问：** kernel optimization 和 CAD 这类环境的奖励从哪来，也是自动核对的吗？
> 页面没说奖励设计，只列了任务面。这几类环境的好处恰恰是奖励好定：内核优化可以测运行速度，网页开发可以跑测试，都是有客观判据的任务，和数学代码一样属于答案能自动验证的一类。这也和 [Grok 4.5 公告](../grok-4-5/grok-4-5-bi.md) 一脉相承——那边写的是 RL 覆盖几十万任务，用自动和模型混合打分。但每个环境奖励的具体定义，有没有模型当评委的部分，占比多少，本页没有。

## Turning ambitious ideas into working projects（把大胆的想法变成可运行的项目）

We tested Grok 4.6 on projects designed to stretch its range and ability to sustain work over many steps. We found the model is especially strong at turning a broad product idea into a working first version. It can research unfamiliar domains, structure the application, implement the core interactions, and continue refining the result through several rounds of feedback.

我们在专门设计来拉伸模型能力范围，考验它多步续航的项目上测试了 Grok 4.6。我们发现模型特别擅长把一个宽泛的产品想法变成能跑的第一版。它能调研不熟悉的领域，搭起应用结构，实现核心交互，并在多轮反馈里持续打磨结果。

On longer trajectories, we also started to see more self-testing and verification, with the model checking its own work before moving on.

在更长的轨迹上，我们还开始看到更多的自我测试和自我验证——模型在往下走之前会先检查自己的成果。

> **停一下：**「自己检查自己的活」，凭什么信它检对了？
> 本页没给机制，这个词值得按两类情形分开读。一类是外部可判定的检查：跑测试，编译，在环境里试，这类验证的判据不依赖模型自觉，可信度取决于环境给不给得出信号。另一类是纯自省：让模型重读自己的输出找错，检查者和被检查者是同一个模型，容易共享同一个盲区，这类验证在长轨迹上的作用更像「看起来在检查」。页面把两类混在一起说，也没给任何数字，这一段整体是定性描述。

Grok 4.6 produces stronger first passes on visual and interactive projects than we typically saw with Grok 4.5. Given a concrete product idea, it is able to establish structure and visual language

Grok 4.6 在视觉和交互类项目上的首版产出，比我们通常在 Grok 4.5 上看到的更强。给一个具体的产品想法，它能一次性确立应用的结构和视觉语言

<!-- page 4 of 7 -->

for an application in one pass. This has made it especially useful for projects where the fastest [route to a good result w](https://x.ai/)as to begin with something substantial and then iterate in the loop.

——一次性搞定。这让它特别适合一类项目：最快的路径是先拿出一个相当成形的初版，再在循环里迭代出好结果。

## Safety and capabilities（安全与能力）

Grok 4.6’s safeguards have been improved and calibrated in line with the model’s capabilities.

Grok 4.6 的防护措施已随模型能力同步改进和校准。

Our safety stack is designed to maximize utility and security across legitimate use cases, allowing Grok 4.6 to be helpful and safe in domains such as vulnerability patching, accelerating the engineering design cycle, and augmenting AI research.

我们的安全栈旨在合法使用场景里同时最大化效用和安全性，让 Grok 4.6 在漏洞修补，加速工程设计循环，辅助 AI 研究这类领域既帮得上忙又安全可靠。

Our safeguard evaluation work reflects Grok 4.6’s expanded capabilities, with our widest-ever suite of pre-deployment testing for capabilities and safeguard calibration, as well as extensive post-deployment and third-party testing.

我们的防护评估工作反映了 Grok 4.6 扩展后的能力：部署前测试的套件是历来最宽的，覆盖能力评测和防护校准，此外还有大量的部署后测试和第三方测试。

> **问：** 安全一节一个数字不给，第 4-5 页表里 Harvey LAB (Vals) 的 15.8% 对 2.5% 能算防护校准评估的外显吗？
> 算一半。这一行是全表最极端的单项差距，差 13.3 个点，6 倍多，又落在法律这种高风险领域，和安全一节「防护随能力同步校准」正好同域。但两种读法在页面层面分不开：一是能力差距，法律领域任务真的做得好 6 倍；二是行为差距，GPT-5.6 Sol Max 的 2.5% 可能是拒答过多，收敛过严压出来的。校准类评测的分数混合了「做得出」和「愿意做」，页面既没解释（Vals）的口径，安全一节自己也没给任何能和这一行对齐的数字。验证路径：查 Harvey 这项评测的公开定义，分清它测的是产出质量还是行为合规。

## Evals（评测）

|  | Grok 4.6 High | Grok 4.5 High | GPT-5.6 Sol Max | Fable 5 Max |
| --- | --- | --- | --- | --- |
| AA Intelligence Index | 61 | 56 | 61 | 62 |
| GDPVal-AA v2 | 1753 | 1526 | 1728 | 1741 |
| CursorBench v3.2 | 69.9% | 66.7% | 67.2% | 70.5% |
| DeepSWE v1.1 | 65.9% | 54% | 73% | 70% |
| FrontierCode v1.1 (Extended) | 61.3% | 56.6% | 60.6% | 63.6% |
| APEX-Agents | 57.5% | 47.1% | 56.7% | 59.2% |
| Terminal-Bench v3.0 | 26% | 15.7% | 34.6% | 34.1% |
| APEX-SWE | 56.4% | 53.6% | - | 58.8% |

> **核对：** 第 2 页说指数是「a composite score of nine benchmarks」，第 4-5 页这张表去掉指数本身正好九行，成分是对上了吗？
> 对上了：九行成分依次是 GDPVal-AA v2, CursorBench v3.2, DeepSWE v1.1, FrontierCode v1.1 (Extended), APEX-Agents, Terminal-Bench v3.0, APEX-SWE, AA-Briefcase, Harvey LAB (Vals)，前七行在第 4 页，后两行跨到第 5 页，加上 AA Intelligence Index 本身共十行。推断这九行就是指数的九个成分，行数和措辞都吻合，但页内没有明说对应关系，九个成分怎么加权成一个数也完全没有给——这正是后面「复合指数打平怎么打出来的」那条要拆开的问题。验证路径：Artificial Analysis 官网公开指数的构成与权重定义。

> **看表：** 表注「Third-party model scores are the best of self-reported or publicly available results」对这张表的可比性意味着什么？
> 意味着四列不是同一口径。Grok 4.6 和 Grok 4.5 两列是自家统一条件跑出来的；GPT-5.6 Sol Max 和 Fable 5 Max 两列取的是各家自报或公开结果里的最好值，而最好值可能来自不同时间，不同推理强度档，不同 prompt 配置，甚至不同基准版本。两张口径拼进一张表，每个逐项差距都可能被 best-of 放大或缩小，读到的领先/落后不是严格对照实验。第 2 页图下脚注同样写明竞品数字取自各家 system card 或排行榜，口径由对方定。验证路径：去各家 system card 查对应分数的推理档与版本设置，和「Grok 4.6 High」对齐了再比。

<!-- page 5 of 7 -->

| AA-Briefcase | 1577 | 1313 | 1502 | 1574 |
| --- | --- | --- | --- | --- |
| Harvey LAB (Vals) | 15.8% | 12.9% | 2.5% | 11.3% |

Best score per evaluation in bold. Third-party model scores are the best of self-reported or publicly available results.

每行最高分加粗。第三方模型的分数取自自报或公开结果中的最好值。

> **看表：** AA Intelligence Index 的 61 对 62，GDPVal-AA 的 1753 对 1741，这两组差值能放在一起比吗？
> 不能。61 和 62 是百分制下的 1 个点，1753 和 1741 是另一个量尺上的 12 分，两个基准的分数定义不同，差值的「含金量」不能跨行换算。能跨行做的只有「谁高谁低」：十行里 Fable 5 Max 赢五行，Grok 4.6 赢三行，GPT-5.6 Sol Max 赢两行。行名里还挂着版本号（v2, v3.2, v1.1, v3.0），说明这些基准各自换过版；同基准换版前后的分数不能直接比，这张表内每行只用了一个版本，这点倒是干净的。

> **看表：** 复合指数明明打平，Terminal-Bench 却 26% 对 34.6% 差 8.6 个点，Harvey LAB 又反过来 15.8% 对 2.5%，打平是怎么打出来的？
> 靠加权互相抵消。九个基准的权重本页没给，能看到的只是逐项差的方向：Grok 4.6 对 GPT-5.6 Sol Max，Terminal-Bench 落后 8.6 个点，DeepSWE 落后 7.1 个点，FrontierCode 落后 0.7，APEX-Agents 落后 0.8，APEX-SWE 落后 2.4，AA Intelligence 持平；同时 GDPVal-AA 领先 25 分，AA-Briefcase 领先 75 分，Harvey LAB 领先 13.3 个点。这些领先和落后在不同的量尺上，怎么折算成一个数完全取决于指数定义，而指数定义在第三方手里。所以「打平」只在这一个复合口径上成立，换一套权重结论就可能变。复合指数的权重永远是编辑选择，这不是本文的问题，是这类指数的通病。

## Get started with Grok 4.6（开始使用 Grok 4.6）

Grok 4.6 is available today in [Cursor](https://cursor.com/?mpdid=09a0c2c6-3d21-48fb-9efd-9910c9767a0f) and [Grok Build](https://x.ai/build). It’s also available in the [API](https://console.x.ai/?campaign=grok-4-6-blog&utm_source=website&utm_medium=referral&utm_campaign=grok-4-6-blog) and other partners like OpenRouter, Vercel, and Cloudflare.

Grok 4.6 今天在 [Cursor](https://cursor.com/?mpdid=09a0c2c6-3d21-48fb-9efd-9910c9767a0f) 和 [Grok Build](https://x.ai/build) 上线，也可以在 [API](https://console.x.ai/?campaign=grok-4-6-blog&utm_source=website&utm_medium=referral&utm_campaign=grok-4-6-blog) 以及 OpenRouter，Vercel，Cloudflare 等合作伙伴处使用。

Pricing starts at \$2 per million input tokens and \$6 per million output tokens. Additionally, there is a fast variant which is twice the price.

定价是每百万输入 token 2 美元起，每百万输出 token 6 美元起。另外还有一个 fast 变体，价格是它的两倍。

> **对一下：** 表头四列里 Grok 这边是 High 档，两个竞品都是 Max 档，推理强度不在同一档上，这表还能直接比吗？
> 能读，但留了问号。两种读法：一是 High 就是 Grok 4.6 的最高档，那是同档对比，没毛病；二是 4.6 还有更高的档没拿出来跑，那表中 Grok 的成绩就不是最强形态。旁证是第 5 页另有一个 fast 低延迟变体，说明 4.6 至少分快/高两类档；但页面没说 High 之上有没有档，也没给任何一档的 token 吞吐数字——和 [Grok 4.5 公告](../grok-4-5/grok-4-5-bi.md) 里写明 80 TPS 的披露相比，这页对速度只字未提。验证路径：查 API 文档的 reasoning effort 档位枚举，确认 High 是不是顶，以及各档对应的速度。

We’re offering 2x included usage inside [Grok Build](https://x.ai/build) and [Cursor](https://cursor.com/?mpdid=09a0c2c6-3d21-48fb-9efd-9910c9767a0f) for the first week so you can start trying 4.6 immediately.

第一周之内，[Grok Build](https://x.ai/build) 和 [Cursor](https://cursor.com/?mpdid=09a0c2c6-3d21-48fb-9efd-9910c9767a0f) 里随附的用量翻倍，可以立刻开始试 4.6。

![Image block](images/p05-console-create-an-api-key-https-console-x-ai-team.png)

[Console Create an API key](https://console.x.ai/team/default/api-keys?campaign=grok-4-6-blog&utm_source=website&utm_medium=referral&utm_campaign=grok-4-6-blog)

[控制台 创建 API key](https://console.x.ai/team/default/api-keys?campaign=grok-4-6-blog&utm_source=website&utm_medium=referral&utm_campaign=grok-4-6-blog)

B [docs.x.aiRead the docs](https://docs.x.ai/)

B [docs.x.ai 阅读文档](https://docs.x.ai/)

## Try it in Grok Build for free（在 Grok Build 里免费试用）

Get started today at [x.ai/build](https://x.ai/build).

今天在 [x.ai/build](https://x.ai/build) 开始用。

PowerShell WSL

PowerShell WSL

> irm https://x.ai/cli/install.ps1 | iex

> irm https://x.ai/cli/install.ps1 | iex

![Image block](images/p05-spacex.png)

<!-- page 6 of 7 -->

## SPACEX

## SPACEX（页脚字标）

© 2026 SpaceXAI LLC

© 2026 SpaceXAI LLC

| Products | Solutions |
| --- | --- |
| Chat | Business |
| Build | Government |
| Imagine | Customer Support |
| Voice | Legal |
| Bot | Security |
| Grokipedia | Use Cases |
| Download | Grok Bot |
| grok.com | Overview |
| iOS | Marketplace |
| Android | Guides |
| Grok on X | Use Cases |
| Developers | Company |
| API Overview | About |
| Pricing | Colossus |
| Models | Careers |
| Console | News |
| Changelog | Contact |
| Docs |  |
| Status | Trust |
|  | Safety |
|  | Security |
| Enterprise | Privacy Portal |
| Contact Sales | Subprocessors |
| FAQs | Help Center |
| BAA |  |
| DPA |  |

<!-- page 7 of 7 -->

![Image block](images/p07-built-with-grok-https-grok-com-referrer-website.png)

[Built with Grok](https://grok.com/?referrer=website)

[用 Grok 构建](https://grok.com/?referrer=website)
