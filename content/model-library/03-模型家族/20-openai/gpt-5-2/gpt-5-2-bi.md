---
title: "GPT-5.2 · 对照译稿"
category: "模型库"
tags: ["OpenAI", "对照译稿"]
published: true
excerpt: "GPT-5.2 公开材料的逐段中英对照译稿，附读报告时的疑问块。"
---
<!-- page 1 of 19 -->

OpenAI

**December 11, 2025** [**Product**](https://openai.com/news/product-releases/) [**Release**](https://openai.com/research/index/release/)

发布日期 December 11, 2025，栏目：产品，发布。

# Introducing GPT‑5.2（GPT-5.2 发布）

The most advanced frontier model for professional work and long-running agents.

面向专业工作和长时间运行 Agent 的最先进前沿模型。

**Listen to article 17:20**

收听本文 17:20

**Share**

分享

We are introducing GPT‑5.2, the most capable model series yet for professional knowledge work.fi

我们发布 GPT-5.2，这是迄今为止在专业知识工作上能力最强的模型系列。（句末的 「fi」 是抓页残字。）

Already, the average ChatGPT Enterprise user AI saves them[says](https://openai.com/index/the-state-of-enterprise-ai-2025-report/) 40–60 minutes a day, and heavy users say it saves them more than 10 hours a week. We designed GPT‑5.2 to unlock even more economic value for people; it’s better at creating spreadsheets, building presentations, writing code, perceiving images, understanding long contexts, using tools, and handling complex, multi-step projects.

ChatGPT Enterprise 的普通用户说 AI 每天帮他们省下 40–60 分钟，重度用户说每周能省下 10 小时以上。我们设计 GPT-5.2 是为了给人们释放更多经济价值：它更擅长做电子表格，做演示文稿，写代码，看图，理解长上下文，使用工具，以及处理复杂的多步骤项目。

GPT‑5.2 sets a new state of the art across many benchmarks, including GDPval, where it outperforms industry professionals at wellspecified knowledge work tasks spanning 44 occupations.

GPT-5.2 在许多基准上刷新了最好成绩，其中包括 GDPval。在这个覆盖 44 种职业，任务要求清楚的知识工作评测上，它的表现超过了行业专业人士。

|  | GPT 5.2Thinking | GPT 5.1Thinking |
| --- | --- | --- |
| GDPval(winsorties) | 70.9% | 38.8%(GPT 5) |
| Knowledgeworktasks |  |  |
| SWE-BenchPro(public) | 55.6% | 50.8% |
| Softwareengineering |  |  |
| SWE-benchVeri ed | 80.0% | 76.3% |
| Softwareengineering |  |  |
| GPQADiamond(notools) | 92.4% | 88.1% |

首表两列依次是 GPT-5.2 Thinking 和 GPT-5.1 Thinking. GDPval（胜或平）属知识工作任务，70.9% 对 38.8% (GPT-5); SWE-Bench Pro (public) 属软件工程，55.6% 对 50.8%；SWE-bench Verified 属软件工程，80.0% 对 76.3%; GPQA Diamond（不用工具）92.4% 对 88.1%。「Veri ed」 是 「Verified」 抓页时丢了 「fi」 连字。

> **想：** GDPval 这一行的表头是 GPT 5.1 Thinking，为什么格子里写的是 38.8%(GPT 5)?
> 这一格换了对照对象。表头是 GPT-5.1 Thinking，数字却是 GPT-5 Thinking 的，第 3 页柱状图的第三根柱子也标着 GPT-5 Thinking 38.8%。第 16 页附录 GDPval 三行里 GPT-5.1 Thinking 一列全空。页面没给 GPT-5.1 的 GDPval 分数，70.9% 对 38.8% 跨了 GPT-5 到 GPT-5.2 两代，不能读成 5.1 到 5.2 的提升。

## We use cookies（我们使用 Cookie）

**CharXiv Reasoning (w/ Python)** 88.7% 80.3% We use cookies to help this site function, understand service usage, and support marketing efforts. Visit <u>Manage Cookies</u> to change preferences anytime. View our [Cookie Policy](https://openai.com/policies/cookie-policy/) for more info.

CharXiv Reasoning（带 Python）88.7% 对 80.3%。后半句是 Cookie 横幅：我们使用 Cookie 来维持网站运行，了解服务使用情况，支持营销工作。可随时到 「管理 Cookie」 修改偏好。更多信息见我们的 Cookie 政策。

<table><tr><td>AIME 2025 (no tools)Competition math</td><td>100.0%Manage Cookies</td><td>94.0%</td></tr><tr><td>FrontierMath (Tier 1-3)</td><td>Reject non-essential40.3%</td><td>31.0%</td></tr><tr><td>Advanced mathematics</td><td colspan="2">Accept all</td></tr></table>

AIME 2025（不用工具），竞赛数学：100.0% 对 94.0%. FrontierMath (Tier 1-3)，高等数学：40.3% 对 31.0%。表格里夹着 Cookie 横幅的三个按钮：管理 Cookie，拒绝非必要 Cookie，全部接受。

> **问：** 这张被 Cookie 横幅压住的表，哪些数字属于哪一列？
> 按列拆开：AIME 2025 是 100.0% 对 94.0%, FrontierMath (Tier 1-3) 是 40.3% 对 31.0%, CharXiv Reasoning (w/ Python) 是 88.7% 对 80.3%。「Manage Cookies」，「Reject non-essential」，「Accept all」 是横幅按钮，被转换器塞进了单元格，「Advanced mathematics」 是 FrontierMath 的副标题，不是单独一行。拆开后三组数和第 17, 18 页附录一致。

<!-- page 2 of 19 -->

OpenAI

| ARC-AGI-1(Veri ed) Abstractreasoning | 86.2% | 72.8% |
| --- | --- | --- |
| ARC-AGI-2(Veri ed) | 52.9% | 17.6% |
| Abstractreasoning |  |  |

首表续：ARC-AGI-1 (Verified)，抽象推理，86.2% 对 72.8%; ARC-AGI-2 (Verified)，抽象推理，52.9% 对 17.6%。

, , , and observed GPT‑5.2[Notion](https://www.notion.com/) [Box](https://www.box.com/home) [Shopify](https://www.shopify.com/) [Harvey](https://www.harvey.ai/) [Zoom](https://www.zoom.com/) demonstrates state-of-the-art long-horizon reasoning and tool-calling performance. , and found GPT‑5.2 to be[Databricks](https://www.databricks.com/) [Hex](https://hex.tech/) [Triple Whale](https://www.triplewhale.com/) exceptional at agentic data science and document analysis tasks., , , and say[Cognition](https://cognition.ai/) [Warp](https://www.warp.dev/) [Charlie Labs](https://www.charlielabs.ai/) [JetBrains](https://www.jetbrains.com/) [Augment Code](https://www.augmentcode.com/) GPT‑5.2 delivers state-of-the-art agentic coding performance, with measurable improvements in areas such as interactive coding, code reviews and bug finding.

Notion，Box，Shopify，Harvey 和 Zoom 观察到，GPT-5.2 在长程推理和工具调用上达到最好水平。Databricks，Hex 和 Triple Whale 发现 GPT-5.2 在 Agent 式数据科学和文档分析任务上格外出色。Cognition，Warp，Charlie Labs，JetBrains 和 Augment Code 表示，GPT-5.2 的 Agent 编程表现达到最好水平，在交互式编程，代码审查和找 bug 等方面有可测量的改进。（原文的公司名被抓成链接挪到了句中。）

In ChatGPT, GPT‑5.2 Instant, Thinking, and Pro will begin rolling out today, starting with paid plans. In the API, they are available now to all developers.

在 ChatGPT 里，GPT-5.2 Instant，Thinking 和 Pro 今天开始推送，先从付费套餐开始。在 API 里，它们现在已向所有开发者开放。

Overall, GPT‑5.2 brings significant improvements in general intelligence, long-context understanding, agentic tool-calling, and vision—making it better at executing complex, real-world tasks endto-end than any previous model.

总体来说，GPT-5.2 在通用智能，长上下文理解，Agent 工具调用和视觉上都有明显提升，端到端执行复杂真实任务的能力超过以往任何模型。

## Model performance（模型表现）

## Economically valuable tasks（有经济价值的任务）

GPT‑5.2 Thinking is the best model yet for real-world, professional use. On , an eval measuring well-specified knowledge work[GDPval](https://openai.com/index/gdpval/) tasks across 44 occupations, GPT‑5.2 Thinking sets a new state-of-the-art score, and is our first model that performs at or above a human expert level. Specifically, GPT‑5.2 Thinking beats or ties top industry professionals on 70.9% of comparisons on GDPval knowledge work tasks, according to expert human judges. These tasks include making presentations, spreadsheets, and other

GPT-5.2 Thinking 是目前最适合真实专业用途的模型。GDPval 衡量 44 种职业中要求清楚的知识工作任务，GPT-5.2 Thinking 在上面刷新了最好成绩，也是我们第一个达到或超过人类专家水平的模型。具体来说，按人类专家评委的判断，在 GDPval 知识工作任务的 70.9% 次比较中，GPT-5.2 Thinking 胜过或打平顶尖行业专业人士。这些任务包括做演示文稿，电子表格和其他

> **核对：** 「at or above a human expert level」 靠的是哪一个口径？
> 靠 「胜或平」。第 3 页柱状图把 Expert-level 虚线画在 50%，第 16 页附录里 GPT-5.2 Thinking 的 clear wins 是 49.8%，只算明确胜出还差 0.2 个点没过线；不允许平局的 no ties 口径是 61.0%。把平局算进来才是 70.9%. GPT-5.2 Pro 的 clear wins 是 60.0%，不靠平局也过线。

## We use cookies（我们使用 Cookie）

artifacts. GPT‑5.2 Thinking produced outputs for GDPval tasks at >11x the speed and <1% the cost of expert professionals, suggesting that

工作成果。GPT-5.2 Thinking 完成 GDPval 任务的速度是专家的 >11x，成本 <1%，这说明

when paired with human oversight, GPT‑5.2 can help withWe use cookies to help this site function, understand service usage, and support marketing efforts. Visit to change professional work. Speed and cost estimates are based on historicalpreferences anytime. View our [Cookie Policy](https://openai.com/policies/cookie-policy/) for more info. metrics; speed in ChatGPT may vary.

在有人监督的前提下，GPT-5.2 能帮忙完成专业工作。速度和成本按历史指标估算，ChatGPT 里的实际速度可能不同。（句中夹着 Cookie 横幅，内容同上。）

> **看表：** >11x 的速度和 <1% 的成本，本页有能验算的底数吗？
> 没有。页面只说按 「historical metrics」 估算，既没给专家完成一项任务的平均耗时和时薪，也没给模型每个任务的 token 数和运行时间。这句话比的是速度和成本，不是质量：70.9% 的胜平率反过来说，还有 29.1% 的比较里专家更好，所以页面紧接着加了 「when paired with human oversight」。

Knowledge work tasks

知识工作任务（图表标题）

<!-- page 3 of 19 -->

OpenAl

![Chart block](images/p03-in-gdpval-models-attempt-well-specified-knowledge-work.png)

柱状图：纵轴是对行业专业人士的胜率，三根柱子依次为 GPT-5.2 Pro，GPT-5.2 Thinking 70.9%，GPT-5 Thinking 38.8%，50% 处有一条标 Expert-level 的虚线。

> **拆开：** 柱子分深浅两段，浅色那段是什么？
> 用附录能对出来：GPT-5.2 Thinking 70.9% 减 clear wins 49.8% 是 21.1%，GPT-5.2 Pro 74.1% 减 60.0% 是 14.1%，和图上浅色段的高度（约 21% 和约 14%，读图）一致，所以浅色是平局，深色是明确胜出。GPT-5 Thinking 的浅色段只有约 3%（读图），它的 38.8% 几乎全是明确胜出。Pro 柱顶的 74.1% 在抓图时被裁掉一半，纵轴标题也被截成 「Win rate vs industry profe」。

In GDPval, models attempt well-specified knowledge work spanning 44 occupations from the top 9 industries contributing to US GDP. Tasks request real work products, such as sales presentations, accounting spreadsheets, urgent care schedules, manufacturing diagrams, or short videos. In ChatGPT, GPT‑5.2 Thinking has new tools that GPT‑5 Thinking does not.

在 GDPval 里，模型要完成要求清楚的知识工作，覆盖美国 GDP 贡献最大的 9 个行业中的 44 种职业。任务要求交付真实的工作成果，比如销售演示文稿，会计电子表格，急诊排班表，制造图纸或短视频。在 ChatGPT 里，GPT-5.2 Thinking 有 GPT-5 Thinking 没有的新工具。

> **确认：** 柱状图里 GPT-5.2 Thinking 和 GPT-5 Thinking 是同一套条件吗？
> 不是。图说自己承认 GPT-5.2 Thinking 在 ChatGPT 里多了新工具。第 18 页附录脚注又说，专业类评测里 GPT-5.2 Thinking 用的是 ChatGPT Pro 的 heavy 推理强度。70.9% 对 38.8% 的差距里，模型，工具，推理强度三样一起变了，本页拆不出各自的贡献。

When reviewing one especially good output, one GDPval judge commented, "It is an exciting and noticeable leap in output quality... [it] appears to have been done by a professional company with staff, and has a surprisingly well designed layout and advice for both deliverables, though with one we still have some minor errors to correct."

一位 GDPval 评委在审阅一份特别好的产出时评论：「输出质量有了令人振奋，显而易见的飞跃...看起来像是一家有员工的专业公司做的，两份交付物的版式和建议都设计得出奇地好，不过其中一份还有些小错误要改。」

Additionally, on our internal benchmark of junior investment banking analyst spreadsheet modeling tasks—such as putting together a three-statement model for a Fortune 500 company with proper formatting and citations, or building a leveraged buyout model for a take-private—GPT 5.2 Thinking's average score per task is 9.3% higher than GPT‑5.1’s, rising from 59.1% to 68.4%.

另外，在我们内部的初级投行分析师电子表格建模基准上（比如给一家 Fortune 500 公司做格式规范，带引用的三表模型，或为一次私有化交易搭杠杆收购模型），GPT-5.2 Thinking 每个任务的平均得分比 GPT-5.1 高 9.3%，从 59.1% 升到 68.4%。

> **回看：** 「9.3% higher」 和 「from 59.1% to 68.4%」 是同一种百分比吗？
> 不是。68.4 - 59.1 = 9.3，这是百分点。按相对幅度算是 9.3 / 59.1 ≈ 15.7%。原文写成 「9.3% higher」，读者容易当成相对提升。第 16 页附录里 GPT-5.2 Pro 是 71.7%，比 GPT-5.1 Thinking 高 12.6 个点。

Side-by-side comparisons show improved sophistication and formatting in spreadsheets and slides generated by GPT‑5.2 Thinking:

并排对比显示，GPT-5.2 Thinking 生成的电子表格和幻灯片更精细，格式更好：

**Workforce planner**

**Cap table**

**Project management**

示例标签：人力规划，股权结构表，项目管理。

## We use cookies（我们使用 Cookie）

We use cookies to help this site function, understand service usage, and support marketing efforts. Visit preferences anytime. View our [Cookie Policy](https://openai.com/policies/cookie-policy/) for more info.

to change

（Cookie 横幅，同上。）

<!-- page 4 of 19 -->

OpenAl

**Prompt:** Create a workforce planning model: headcount, hiring plan, attrition, and budget impact. Include engineering, marketing, legal, and sales departments.

**提示词：** 做一个人力规划模型：人数，招聘计划，流失率和预算影响。包括工程，市场，法务和销售部门。

To use the new spreadsheet and presentation capabilities in ChatGPT, you must be on a Plus, Pro, Business, or Enterprise plan and select either **GPT**‑**5.2 Thinking** or **Pro**. Complex generations can take many minutes to produce.

要在 ChatGPT 里使用新的电子表格和演示文稿能力，需要 Plus，Pro，Business 或 Enterprise 套餐，并选择 **GPT-5.2 Thinking** 或 **Pro**。复杂的生成可能要花好几分钟。

## Coding（编程）

GPT‑5.2 Thinking sets a new state of the art of 55.6% on SWE-Bench Pro, a rigorous evaluation of real-world software engineering. Unlike SWE-bench Verified, which only tests Python, SWE-Bench Pro tests four languages and aims to be more contamination-resistant, challenging, diverse, and industrially relevant.

SWE-Bench Pro 是一项严格的真实软件工程评测，GPT-5.2 Thinking 在上面以 55.6% 刷新最好成绩。SWE-bench Verified 只考 Python，SWE-Bench Pro 考四种语言，目标是更抗数据污染，更难，更多样，也更贴近工业实际。

## We use cookies（我们使用 Cookie）

We use cookies to help this site function, understand service usage, and support marketing efforts. Visit to change preferences anytime. View our [Cookie Policy](https://openai.com/policies/cookie-policy/) for more info. -Bench Pro, a model is given a code repository and must generate a patch to solve a realistic software engineering task.

（Cookie 横幅，同上。）横幅后是图注残段：...在 SWE-Bench Pro 里，模型拿到一个代码仓库，必须生成补丁来解决一个真实的软件工程任务。

On SWE-bench Verified (not plotted), GPT‑5.2 Thinking scores our new high of 80%.

在 SWE-bench Verified 上（图中未画出），GPT-5.2 Thinking 得 80%，是我们的新高。

<!-- page 5 of 19 -->

OpenAI

more reliably debug production code, implement feature requests, refactor large codebases, and ship fixes end-to-end with less manual intervention.

...更可靠地调试生产代码，实现功能需求，重构大型代码库，并以更少的人工干预端到端地交付修复。（这句的开头在翻页处丢了。）

GPT‑5.2 Thinking is also better at front-end software engineering than GPT‑5.1 Thinking. Early testers found it significantly stronger at front-end development and complex or unconventional UI work— especially involving 3D elements—making it a powerful daily partner for engineers across the stack. See a few examples of what it can produce from a single prompt:

GPT-5.2 Thinking 在前端软件工程上也比 GPT-5.1 Thinking 强。早期测试者发现，它在前端开发和复杂或非常规的 UI 工作上明显更强，尤其是涉及 3D 元素的时候，这让它成为全栈工程师日常得力的搭档。下面是它只用一条提示词就能做出来的几个例子：

![Image block](images/p05-prompt-create-a-single-page-app-in-a-single-html-file.png)

截图：一个名为 Ocean Wave Simulation 的面板，有风速（1.20×），浪高（1.00×），光照（62%）三个滑块和重置，暂停，全屏三个按钮，背景的海面区域抓成了全黑。

**Prompt:** Create a single-page app in a single HTML file with the following requirements:

**提示词：** 在单个 HTML 文件里做一个单页应用，要求如下：

\- Name: Ocean Wave Simulation

\- 名称：Ocean Wave Simulation

\- Goal: Display realistic animated waves.

\- 目标：显示逼真的动态海浪。

\- Features: Change wind speed, wave height, lighting.

\- 功能：可调风速，浪高，光照。

\- The UI should be calming and realistic.

\- UI 要让人平静，且要逼真。

| Windsurf | Warp | JetBrains | Augment Code | Cline | Charlie Labs | Kilo | Azad |
| --- | --- | --- | --- | --- | --- | --- | --- |

客户评价标签页：Windsurf, Warp, JetBrains, Augment Code, Cline, Charlie Labs, Kilo, Azad。

**"GPT-5.2 represents the biggest leap for GPT models in agentic coding since GPT-5 and is a SOTA coding**

**"GPT-5.2 是 GPT 系列自 GPT-5 以来在 Agent 编程上最大的一次跃升，是一个 SOTA 编程**

<!-- page 6 of 19 -->

OpenAI

# the jump in intelligence. We’re excited to make it the default across Windsurf and several core Devin workloads.「（...智能上的跃升。我们很高兴把它设为 Windsurf 和若干核心 Devin 工作负载的默认模型。」）

这段引语跨了页，中间有一截没抓到，转换器把后半句误识别成了一级标题。

**Jeff Wang, CEO, Windsurf**

**Jeff Wang, Windsurf CEO**

## Factuality（事实性）

GPT‑5.2 Thinking hallucinates less than GPT‑5.1 Thinking. On a set of de-identified queries from ChatGPT, responses with errors were $3 0 \% _ { \mathrm { r e l } }$ less common. For professionals, this means fewer mistakes when using the model for research, writing, analysis, and decision support—making the model more dependable for everyday knowledge work.

GPT-5.2 Thinking 的幻觉比 GPT-5.1 Thinking 少。在一组去标识化的 ChatGPT 查询上，含错误的回答相对少了 30%。对专业人士来说，这意味着用模型做研究，写作，分析和决策支持时出错更少，日常知识工作里更靠得住。

**Reasoning effort was set to the maximum available and a search tool was enabled. Errors were detected by other models, which may make errors themselves. Claimlevel error rates are far lower than response-level error rates, as most responses contain many claims.**

**推理强度设为最高可用档，并开启了搜索工具。错误由其他模型检出，这些模型自己也可能出错。论断级错误率远低于回答级错误率，因为多数回答包含许多条论断。**

> **停一下：** 30%rel 在第 17 页附录里能复算吗？
> 能，但只在开搜索的那一行成立。w/search：错误率从 100 - 91.2 = 8.8% 降到 100 - 93.9 = 6.1%, (8.8 - 6.1) / 8.8 ≈ 30.7%，对得上。no search：从 12.7% 降到 12.0%，相对只降约 5.5%。图注写了 「a search tool was enabled」，正文 「hallucinates less」 却没带这个条件；不开搜索时两代的错误率几乎一样。

We use cookies Like all models, GPT‑5.2 Thinking is imperfect. For anything critical, double check its answers. We use cookies to help this site function, understand service usage, and support marketing efforts. Visit to change preferences anytime. View our [Cookie Policy](https://openai.com/policies/cookie-policy/) for more info.

和所有模型一样，GPT-5.2 Thinking 并不完美。凡是要紧的事，请再核对它的答案。（前后夹着 Cookie 横幅，同上。）

Long context

长上下文（小节标题）

GPT‑5.2 Thinking sets a new state of the art in long-context reasoning, achieving leading performance on OpenAI MRCRv2—an evaluation that tests a model’s ability to integrate information spread

GPT-5.2 Thinking 在长上下文推理上刷新了最好成绩，在 OpenAI MRCRv2 上领先。这项评测考的是模型整合分散在

<!-- page 7 of 19 -->

OpenAI

thousands of tokens, GPT‑5.2 Thinking is substantially more accurate than GPT‑5.1 Thinking. In particular, it’s the first model we’ve seen that achieves near 100% accuracy on the 4-needle MRCR variant (out to 256k tokens).

...数千 token，GPT-5.2 Thinking 比 GPT-5.1 Thinking 准确得多。尤其是，它是我们见过的第一个在 4-needle MRCR 变体上（一直到 256k token）达到近 100% 准确率的模型。（翻页处丢了半句。）

> **再看：** 「near 100% accuracy on the 4-needle MRCR variant (out to 256k tokens)」 在附录哪一行？
> 附录没有。第 17 页长上下文表只印了 8 needles 的六个区间，4-needle 的曲线图也没抓下来。8 needles 在 128k-256k 是 77.0%，离 100% 差得远。「近 100%」 只能信页面的话，本页没有可核对的数。

In practical terms, this enables professionals to use GPT‑5.2 to work with long documents—such as reports, contracts, research papers, transcripts, and multi-file projects—while maintaining coherence and accuracy across hundreds of thousands of tokens. This makes GPT‑5.2 especially well suited for deep analysis, synthesis, and complex multi-source workflows.

落到实际，专业人士可以用 GPT-5.2 处理长文档，比如报告，合同，论文，会议记录和多文件项目，在几十万 token 的范围内保持连贯和准确。这让 GPT-5.2 特别适合深度分析，综合归纳和复杂的多来源工作流。

We use cookies

We use cookies to help this site function, understand service usage, and support marketing efforts. Visit preferences anytime. View our [Cookie Policy](https://openai.com/policies/cookie-policy/) for more info.

to change

（Cookie 横幅，同上。）

In [OpenAI-MRCR](https://huggingface.co/datasets/openai/mrcr) v2 (multi-round co-reference resolution), multiple identical “needle” user requests are inserted into long “haystacks” of similar requests and responses, and the model is asked to reproduce the response to nth needle.

在 OpenAI-MRCR v2（多轮共指消解）里，多个一模一样的 「针」 式用户请求被插进由相似请求和回复组成的长 「草堆」，模型要复现第 n 根针对应的回复。

<!-- page 8 of 19 -->

OpenAI

**response and the correct answer. The points at 256k max input tokens represent averages over 128k–256k input tokens, and so forth. Here, 256k represents 256 \* 1,024 = 262,144 tokens. Reasoning effort was set to the maximum available.**

**...回复与正确答案。最大输入 256k 处的点表示 128k–256k 输入 token 的平均值，其余依此类推。这里 256k 指 256 \* 1,024 = 262,144 token。推理强度设为最高可用档。**（图注开头在翻页处丢了。）

For tasks that benefit from thinking beyond the maximum context window, GPT‑5.2 Thinking is compatible with our new Responses /compact endpoint, which extends the model’s effective context window. This lets GPT‑5.2 Thinking tackle more tool-heavy, longrunning workflows that would otherwise be limited by context length. Read more in our .[API documentation](https://platform.openai.com/docs/api-reference/responses/compact)

对需要超出最大上下文窗口去思考的任务，GPT-5.2 Thinking 支持我们新的 Responses /compact 端点，它能扩展模型的有效上下文窗口。这样 GPT-5.2 Thinking 就能处理工具调用更密集，运行更久，否则会被上下文长度卡住的工作流。详见 API 文档。

## Vision（视觉）

GPT‑5.2 Thinking is our strongest vision model yet, cutting error rates roughly in half on chart reasoning and software interface understanding.

GPT-5.2 Thinking 是我们迄今最强的视觉模型，在图表推理和软件界面理解上把错误率大致砍掉一半。

> **对一下：** 「cutting error rates roughly in half」 按附录算是多少？
> 图表推理 CharXiv (w/ Python)：错误率从 19.7% 到 11.3%，降约 43%；不带工具从 33.0% 到 17.9%，降约 46%。界面理解 ScreenSpot-Pro (w/ Python)：从 35.8% 到 13.7%，降约 62%。一个不到一半，一个超过一半，「roughly in half」 是两者的笼统说法。第 9 页图注说 ScreenSpot-Pro 不开 Python 工具 「scores are much lower」，但没给不开工具的分数。

For everyday professional use, this means the model can more accurately interpret dashboards, product screenshots, technical diagrams, and visual reports—supporting workflows in finance, operations, engineering, design, and customer support where visual information is central.

在日常专业使用中，这意味着模型能更准确地读懂仪表盘，产品截图，技术图和可视化报告，支撑金融，运营，工程，设计和客服这些以视觉信息为核心的工作流。

We use cookies

In [CharXiv Reasoning](https://arxiv.org/abs/2406.18521), models answer questions about visual charts from scientific

papers. A Python tool was ena e and reasoning effort was set to maximum. We use cookies to help this site function, understand service usage, and support marketing efforts. Visit to change bl d preferences anytime. View our [Cookie Policy](https://openai.com/policies/cookie-policy/) for more info.

在 CharXiv Reasoning 里，模型回答关于科学论文中图表的问题。开启了 Python 工具，推理强度设为最高。（「ena e」 和 「bl d」 是 「enabled」 被横幅拆开后的残字；其余是 Cookie 横幅，同上。）

<!-- page 9 of 19 -->

OpenAl

**In** [**ScreenSpot-Pro**](https://arxiv.org/abs/2504.07981)**, models must reason about high-resolution screenshots of graphical user interfaces from a variety of professional settings. A Python tool was enabled and reasoning effort was set to maximum. Without the Python tool, scores are much lower. We recommend enabling the Python tool on vision tasks like these.**

**在 ScreenSpot-Pro 里，模型要对各种专业场景下图形界面的高分辨率截图做推理。开启了 Python 工具，推理强度设为最高。不开 Python 工具时分数低得多。做这类视觉任务，我们建议开启 Python 工具。**

Compared to previous models, GPT‑5.2 Thinking has a stronger grasp of how elements are positioned within an image, which helps on tasks where relative layout plays a key role in solving the problem. In the example below, we ask the model to identify the components in an image input (in this case, a motherboard) and return labels with approximate bounding boxes. Even on a low-quality image, GPT‑5.2 identifies the main regions and places boxes that sometimes match the true locations of each component, while GPT‑5.1 only labels a few parts and shows a much weaker understanding of their spatial arrangement. Both models make clear mistakes, but GPT‑5.2 shows better comprehension of the image.

和以前的模型相比，GPT-5.2 Thinking 更清楚图中各元素的位置，这对相对布局是解题关键的任务有帮助。在下面的例子里，我们让模型识别输入图片（这里是一块主板）里的部件，返回标签和大致的边界框。即使图片质量很差，GPT-5.2 也能认出主要区域，画出的框有时和各部件的真实位置吻合；GPT-5.1 只标出了几个部件，对它们空间排布的理解弱得多。两个模型都有明显错误，但 GPT-5.2 对图的理解更好。

GPT‑5.1

GPT‑5.2

示例图标签：GPT-5.1, GPT-5.2。两张主板标注图没有抓下来。

## We use cookies（我们使用 Cookie）

We use cookies to help this site function, understand service usage, and support marketing efforts. Visit preferences anytime. View our [Cookie Policy](https://openai.com/policies/cookie-policy/) for more info.

to change

（Cookie 横幅，同上。）

<!-- page 10 of 19 -->

OpenAl

## Tool calling（工具调用）

GPT‑5.2 Thinking achieves a new state of the art of 98.7% on Tau2- bench Telecom, demonstrating its ability to reliably use tools across long, multi-turn tasks.

GPT-5.2 Thinking 在 Tau2-bench Telecom 上以 98.7% 刷新最好成绩，说明它能在长的多轮任务里可靠地使用工具。

For latency-sensitive use cases, GPT‑5.2 Thinking also performs much better at reasoning.effort='none', substantially outperforming GPT‑5.1 and GPT‑4.1.

对延迟敏感的场景，GPT-5.2 Thinking 在 reasoning.effort='none' 下也好得多，明显超过 GPT-5.1 和 GPT-4.1。

**In** [**τ2-bench**](https://arxiv.org/pdf/2506.07982)**, models use tools to complete customer support tasks in a multi-turn interaction with a simulated user. For the Telecom domain, we included a brief, generally helpful instruction in the system prompt to boost performance. We exclude the Airline subset because of lower-quality ground truth grading.**

**在 τ2-bench 里，模型要在和模拟用户的多轮交互中用工具完成客服任务。Telecom 领域我们在系统提示里加了一段简短，通用的帮助性指令来提升表现。Airline 子集因参考答案的评分质量较低而被排除。**

> **想：** Telecom 的 98.7% 是在什么条件下拿到的？
> 图注说 Telecom 在系统提示里加了一段提分用的指令，还排除了 Airline 子集。页面没说 GPT-5.1 Thinking 的 95.6% 是否用了同一段提示。按错误率看是从 4.4% 降到 1.3%；同表 Retail 没提加提示，是 82.0% 对 77.9%，只高 4.1 个点。

For professionals, this translates into stronger end-to-end workflows —such as resolving customer support cases, pulling data from multiple systems, running analyses, and generating final outputs with fewer breakdowns between steps.

对专业人士来说，这意味着端到端工作流更稳，比如处理客服工单，从多个系统拉数据，跑分析，生成最终产出，步骤之间更少断掉。

> **问：** reasoning.effort='none' 下 「substantially outperforming GPT-5.1 and GPT-4.1」，数字在哪？
> 本页没有。对应的图没抓到，附录也没有 none 档的分数，附录里的分数全是 xhigh 或 heavy 档。低延迟档到底比 GPT-4.1 好多少，本页核对不了。

For example, when asking a complex customer service question that requires multi-step resolution, the model can more effectively coordinate a full workflow across multiple agents. In the case below, a

例如，提出一个需要多步解决的复杂客服问题时，模型能更有效地在多个 Agent 之间协调完整的工作流。在下面的案例里，一位

traveler reports a delayed flight, a missed connection, an overnight stay in New York, and a medical seating requirement. GPT‑5.2

旅客报告航班延误，错过转机，要在 New York 过夜，还有医疗座位需求。GPT-5.2

## We use cookies（我们使用 Cookie）

manages the entire chain of tasks—rebooking, special-assistance We use cookies to help this site function, understand service usage, and support marketing efforts. Visit to change seating, and compensation—delivering a more complete outcomepreferences anytime. View our [Cookie Policy](https://openai.com/policies/cookie-policy/) for more info. than GPT‑5.1.

处理了整条任务链：改签，特殊协助座位和赔偿，结果比 GPT-5.1 更完整。（句中夹着 Cookie 横幅，同上。）

My flight from Paris to New York was delayed, and I missed my connection to Austin. My checked bag is also missing, and I need to

我从 Paris 飞 New York 的航班延误了，错过了去 Austin 的转机。我的托运行李也不见了，我还需要（示例用户消息，后半句没抓到）

<!-- page 11 of 19 -->

OpenAl

GPT‑5.1

GPT‑5.2

示例对比标签：GPT-5.1, GPT-5.2。两个模型的回复内容没有抓下来。

## Science & math（科学与数学）

One of our hopes for AI is that it will accelerate scientific research for the benefit of everyone. Toward this, we’ve been working with and listening to scientists to see how AI can speed up their work, and last month we shared some early collaborative experiments .[here](https://openai.com/index/accelerating-science-gpt-5/)

我们对 AI 的期望之一，是让它加速科学研究，造福所有人。为此我们一直在和科学家合作，听取他们的意见，看 AI 能怎样加快他们的工作。上个月我们在这里分享了一些早期合作实验。

We believe GPT‑5.2 Pro and GPT‑5.2 Thinking are the world’s best models for assisting and accelerating scientists. On GPQA Diamond, a graduate-level Google-proof Q&A benchmark, GPT‑5.2 Pro achieves 93.2%, followed closely by GPT‑5.2 Thinking at 92.4%.

我们认为 GPT-5.2 Pro 和 GPT-5.2 Thinking 是世界上辅助和加速科学家最好的模型。GPQA Diamond 是研究生水平，用 Google 也搜不到答案的问答基准，GPT-5.2 Pro 得 93.2%，GPT-5.2 Thinking 以 92.4% 紧随其后。

> **核对：** Pro 93.2% 和 Thinking 92.4% 差几道题？
> GPQA Diamond 通常是 198 道题（页外背景，本页没写题数）。0.8 个点约合 1.6 道题，在单次评测的波动范围内。「world's best」 这句在 GPQA 上主要靠对 GPT-5.1 Thinking 88.1% 的 4.3 个点，Pro 和 Thinking 之间可以当作持平。

## We use cookies（我们使用 Cookie）

We use cookies to help this site function, understand service usage, and support marketing efforts. Visit preferences anytime. View our [Cookie Policy](https://openai.com/policies/cookie-policy/) for more info.

to change

（Cookie 横幅，同上。）

<!-- page 12 of 19 -->

OpenAl

**In** [**GPQA Diamond**](https://arxiv.org/abs/2311.12022)**, models answer multiple choice questions about physics, chemistry, and biology. No tools were enabled and reasoning effort was set to maximum.**

**在 GPQA Diamond 里，模型回答物理，化学和生物的选择题。不开任何工具，推理强度设为最高。**

On FrontierMath (Tier 1–3), an evaluation of expert-level mathematics, GPT‑5.2 Thinking set a new state of the art, solving 40.3% of problems.

FrontierMath (Tier 1–3) 是专家级数学评测，GPT-5.2 Thinking 解出 40.3% 的题，刷新最好成绩。

**In** [**FrontierMath**](https://epoch.ai/frontiermath)**, models solve expert-level mathematics problems. A Python tool was enabled and reasoning effort was set to maximum.**

**在 FrontierMath 里，模型解专家级数学题。开启了 Python 工具，推理强度设为最高。**

We're beginning to see AI models meaningfully accelerate progress in math and science in tangible ways. For example, in with[recent work](https://openai.com/index/gpt-5-2-for-science-and-math/) GPT‑5.2 Pro, researchers explored an open question in statistical learning theory. In a narrow, well-specified setting, the model

我们开始看到 AI 模型以看得见的方式实质性地加速数学和科学进展。例如，在最近一项用 GPT-5.2 Pro 的工作里，研究者探讨了统计学习理论中的一个开放问题。在一个范围很窄，定义清楚的设定下，模型

## We use cookies（我们使用 Cookie）

reviewed with external experts, illustrating how frontier models can We use cookies to help this site function, understand service usage, and support marketing efforts. Visit to change assist mathematical research under close human oversight. preferences anytime. View our [Cookie Policy](https://openai.com/policies/cookie-policy/) for more info.

...并与外部专家一起审阅，说明前沿模型可以在人类密切监督下辅助数学研究。（中间半句被横幅盖住，模型具体做了什么没抓到；其余是 Cookie 横幅，同上。）

## ARC-AGI 2（ARC-AGI 2 评测）

On ARC-AGI-1 (Verified), a benchmark designed to measure general reasoning ability, GPT‑5.2 Pro is the first model to cross the 90%

ARC-AGI-1 (Verified) 是衡量通用推理能力的基准，GPT-5.2 Pro 是第一个越过 90%

<!-- page 13 of 19 -->

OpenAI

On ARC-AGI-2 (Verified), w[hich](https://arcprize.org/blog/oai-o3-pub-breakthrough) raises the difficulty and better isolates fluid reasoning, GPT‑5.2 Thinking achieves a new state of the art for chain-of-thought models, scoring 52.9%. GPT‑5.2 Pro performs even higher, reaching 54.2%, further extending the model’s ability to reason through novel, abstract problems.

...的模型。ARC-AGI-2 (Verified) 提高了难度，更能单独测出流体推理能力，GPT-5.2 Thinking 在上面得 52.9%，刷新 CoT 模型的最好成绩。GPT-5.2 Pro 更高，达到 54.2%，进一步拓展了模型推理新颖抽象问题的能力。

> **看表：** Pro 的 54.2% 是在最高推理强度下跑的吗？
> 不是。第 18 页附录这一格写的是 「54.2% (high)」，同表脚注却说模型都按 API 最高可用强度跑，GPT-5.2 Thinking 和 Pro 是 xhigh。所以 54.2% 是 Pro 在 high 档的分数，和 Thinking 在 xhigh 档的 52.9% 不在同一档。页面没解释 Pro 这一项为什么没跑 xhigh。

Improvements across these evaluations reflect GPT‑5.2’s stronger multi-step reasoning, greater quantitative accuracy, and more reliable problem solving on complex technical tasks.

这些评测上的进步，反映出 GPT-5.2 多步推理更强，定量计算更准，在复杂技术任务上解题更可靠。

Here’s what our early testers say about GPT‑5.2:

下面是早期测试者对 GPT-5.2 的评价：

**Notion**

**Zoom**

**Databricks**

**Harvey**

评价标签页：Notion, Zoom, Databricks, Harvey。

**"GPT-5.2 unlocked a complete architecture shift for us. We collapsed a fragile, multi-agent system into a single mega-agent with 20+ tools. The best part is, itjust works. The mega-agent is faster, smarter, and 100x easier to maintain. We’re seeing dramatically lower latency, much stronger tool calling, and we no longer need sprawling system prompts because 5.2 will execute cleanly off a simple, one-line prompt. It feels like pure magic."**

**「GPT-5.2 让我们的架构彻底换了一个样。我们把一个脆弱的多 Agent 系统收成了一个带 20+ 个工具的单一巨型 Agent。最棒的是，它直接就能用。这个巨型 Agent 更快，更聪明，维护起来容易 100x. 我们看到延迟大幅下降，工具调用强得多，也不再需要冗长的系统提示，因为 5.2 靠一句简单的提示就能干净利落地执行。感觉就像魔法。」**

**AJ Orbach, CEO, Triple Whale**

**AJ Orbach, Triple Whale CEO**

## GPT‑5.2 in ChatGPT（ChatGPT 里的 GPT-5.2）

In ChatGPT, users should notice GPT‑5.2 feels better to use day to day—more structured, more reliable, and still enjoyable to talk to.

在 ChatGPT 里，用户应该会觉得 GPT-5.2 日常用起来更顺手：更有条理，更可靠，聊起来也依然愉快。

We use cookies

（Cookie 横幅标题。）

and walk-throughs, technical writing, and translation, building on the We use cookies to help this site function, understand service usage, and support marketing efforts. Visit to change warmer conversational tone introduced in GPT‑5.1 Instant. Earlypreferences anytime. View our [Cookie Policy](https://openai.com/policies/cookie-policy/) for more info.

...和分步讲解，技术写作和翻译，延续了 GPT-5.1 Instant 引入的更温暖的对话语气。（GPT-5.2 Instant 这一段的开头被横幅盖住了；其余是 Cookie 横幅，同上。）

testers particularly noted clearer explanations that surface key information upfront.

早期测试者特别提到，它的解释更清楚，会把关键信息放在前面。

**GPT**‑**5.2 Thinking** is designed for deeper work, helping users tackle more complex tasks with greater polish—especially for coding, summarizing long documents, answering questions about uploaded

**GPT-5.2 Thinking** 面向更深入的工作，帮用户把更复杂的任务做得更精细，尤其是编程，总结长文档，回答关于上传

<!-- page 14 of 19 -->

OpenAl

**GPT**‑**5.2 Pro** is our smartest and most trustworthy option for difficult questions where a higher-quality answer is worth the wait, with early testing showing fewer major errors and stronger performance in complex domains like programming.

**GPT-5.2 Pro** 是我们最聪明，最值得信赖的选项，适合那些值得多等一会儿换更高质量答案的难题。早期测试显示它的重大错误更少，在编程等复杂领域表现更强。（上一段 Thinking 的后半句在翻页处丢了。）

## Safety（安全）

GPT‑5.2 builds on the research we introduced with[safe completion](https://openai.com/index/gpt-5-safe-completions/) GPT‑5, which teaches the model to give the most helpful answer while still staying within safety boundaries.

GPT-5.2 延续了我们随 GPT-5 推出的 safe completion 研究，这项研究教模型在守住安全边界的同时给出最有帮助的回答。

With this release, we continued our work to [strengthen our models’](https://openai.com/index/strengthening-chatgpt-responses-in-sensitive-conversations/)，with meaningful improvements[responses in sensitive conversations](https://openai.com/index/strengthening-chatgpt-responses-in-sensitive-conversations/) in how they respond to prompts indicating signs of suicide or self harm, mental health distress, or emotional reliance on the model. These targeted interventions have resulted in fewer undesirable responses in both GPT‑5.2 Instant and GPT‑5.2 Thinking as compared to GPT‑5.1 and GPT‑5 Instant and Thinking models. Further details can be found in the .[system card](https://openai.com/index/gpt-5-system-card-update-gpt-5-2/)

这次发布我们继续加强模型在敏感对话中的回应。面对显示自杀或自伤迹象，心理困扰，或对模型产生情感依赖的提示，模型的回应方式有了实质改进。和 GPT-5.1 以及 GPT-5 的 Instant 与 Thinking 模型相比，这些有针对性的干预让 GPT-5.2 Instant 和 GPT-5.2 Thinking 的不良回应都更少。详情见系统卡。

We’re in the early stages of rolling out our so[age prediction model](https://openai.com/index/building-towards-age-prediction/) that we can automatically apply content protections for users who are under 18, in order to limit access to sensitive content. This builds on our existing approach to users we know are under 18 and our parental controls.

我们正处在推出年龄预估模型的早期阶段，以便自动为 18 岁以下用户启用内容保护，限制他们接触敏感内容。这建立在我们对已知未满 18 岁用户的现有做法和家长控制功能之上。

GPT‑5.2 is one step in an ongoing series of improvements, and we’re far from done. While this release delivers meaningful gains in intelligence and productivity, we know there are areas where people want more. In ChatGPT, we’re working on known issues like overrefusals, while continuing to raise the bar on safety and reliability overall. These changes are complex, and we’re focused on getting them right.

GPT-5.2 是一连串持续改进中的一步，我们远没有做完。这次发布在智能和生产力上带来了实在的提升，但我们知道还有一些地方大家希望更好。在 ChatGPT 里，我们正在处理过度拒答这类已知问题，同时继续整体提高安全性和可靠性的标准。这些改动很复杂，我们专注于把它们做对。

## Mental health evaluations（心理健康评测）

| We use cookies |  | GPT-5.2Instant | GPT-5.1Instant | GPT-5.2Thinking | GPT-!Think |
| --- | --- | --- | --- | --- | --- |
| We use cookies to help this site function, understand service usage, and support marketing efforts. Visit preferences anytime. View our Cookie Policy for more info. |  | 0.995 | 0.883 | 0.915 | 0.684 |
|  | Emotional reliance | 0.938 | 0.945 | 0.955 | 0.785 |
|  | Self-harm | 0.938 | 0.925 | 0.963 | 0.937 |

列依次是 GPT-5.2 Instant，GPT-5.1 Instant，GPT-5.2 Thinking，第四列表头残成 「GPT-!Think」。第一行名称被 Cookie 横幅盖住，数值 0.995, 0.883, 0.915, 0.684；情感依赖 0.938, 0.945, 0.955, 0.785；自伤 0.938, 0.925, 0.963, 0.937。

> **拆开：** 表里的数都支持 「fewer undesirable responses in both GPT-5.2 Instant and GPT-5.2 Thinking」 吗？
> 有一格不支持。Emotional reliance 一行，GPT-5.2 Instant 是 0.938，GPT-5.1 Instant 是 0.945，新版低了 0.007。其余五组对比都是新版更高：第一行 0.995 对 0.883, 0.915 对 0.684；Self-harm 0.938 对 0.925, 0.963 对 0.937。第四列按正文应是 GPT-5.1 Thinking。正文还拿 GPT-5 Instant 和 Thinking 作比较，表里没有这两列。

<!-- page 15 of 19 -->

OpenAI

## Availability & pricing（上线与定价）

In ChatGPT, we’ll begin rolling out GPT‑5.2 (Instant, Thinking, and Pro) today, starting with paid plans (Plus, Pro, Go, Business, Enterprise). We deploy GPT‑5.2 gradually to keep ChatGPT as smooth and reliable as we can; if you don’t see it at first, please try again later. In ChatGPT, GPT‑5.1 will still be available to paid users for three months under legacy models, after which we will sunset GPT‑5.1.

在 ChatGPT 里，我们今天开始推送 GPT-5.2（Instant，Thinking 和 Pro），先从付费套餐开始（Plus, Pro, Go, Business, Enterprise）。我们分批部署 GPT-5.2，尽量让 ChatGPT 保持流畅可靠；如果一开始没看到，请稍后再试。在 ChatGPT 里，付费用户还能在旧版模型下继续使用 GPT-5.1 三个月，之后 GPT-5.1 下线。

## Model naming across ChatGPT & API（ChatGPT 与 API 的型号命名）

| ChatGPT | API |
| --- | --- |
| ChatGPT 5.2Instant | GPT 5.2 chat latest |
| ChatGPT 5.2Thinking | GPT 5.2 |
| ChatGPT 5.2Pro | GPT 5.2Pro |

对照表：ChatGPT 5.2 Instant 对应 API 的 gpt-5.2-chat-latest，ChatGPT 5.2 Thinking 对应 gpt-5.2，ChatGPT 5.2 Pro 对应 gpt-5.2-pro。

In our API Platform, GPT‑5.2 Thinking is available today in the Responses API and Chat Completions API as gpt-5.2 , and GPT‑5.2 Instant as gpt-5.2-chat-latest . GPT‑5.2 Pro is available in the Responses API as gpt-5.2-pro . Developers can now set the reasoning parameter in GPT‑5.2 Pro, and both GPT‑5.2 Pro and GPT‑5.2 Thinking now support the new fifth reasoning effort of xhigh, for tasks where quality is most important.

在我们的 API 平台上，GPT-5.2 Thinking 今天起可在 Responses API 和 Chat Completions API 中以 gpt-5.2 调用，GPT-5.2 Instant 以 gpt-5.2-chat-latest 调用。GPT-5.2 Pro 可在 Responses API 中以 gpt-5.2-pro 调用。开发者现在可以在 GPT-5.2 Pro 里设置 reasoning 参数，GPT-5.2 Pro 和 GPT-5.2 Thinking 都支持新增的第五档推理强度 xhigh，用于质量最要紧的任务。

GPT‑5.2 is priced at \$1.75/1M input tokens and \$14/1M output tokens, with a 90% discount on cached inputs. On multiple agentic evals, we found that despite GPT‑5.2’s greater cost per token, the cost of attaining a given level of quality ended up less expensive due to GPT‑5.2’s greater token efficiency.

GPT-5.2 定价为输入 \$1.75/1M token，输出 \$14/1M token，缓存输入打 90% 折扣。在多项 Agent 评测中我们发现，尽管 GPT-5.2 每 token 更贵，但它的 token 效率更高，达到同等质量的总成本反而更低。

> **确认：** 涨价幅度是多少，token 效率要高多少才能抵消？
> 输入 1.75 / 1.25 = 1.4，输出 14 / 10 = 1.4，都是涨 40%。第 16 页 Pro 也一样：21 / 15 = 1.4, 168 / 120 = 1.4。要在同等质量下总花费不增加，GPT-5.2 用的 token 至少要少 1 - 1/1.4 ≈ 28.6%。正文说 「on multiple agentic evals」 做到了，但没说是哪几个评测，也没给 token 数。

While ChatGPT subscription pricing remains the same, in the API GPT‑5.2 is priced higher per token than GPT‑5.1 because it is a more capable model. It’s still priced below other frontier models, so people can continue to use it deeply in their daily work and core applications.

ChatGPT 订阅价格不变；在 API 里，GPT-5.2 能力更强，所以每 token 定价高于 GPT-5.1。它的价格仍低于其他前沿模型，大家可以继续在日常工作和核心应用里深度使用。

## We use cookies（我们使用 Cookie）

We use cookies to help this site function, understand service usage, and support marketing efforts. Visit **Price per million tokens**preferences anytime. View our [Cookie Policy](https://openai.com/policies/cookie-policy/) for more info.

to change

（Cookie 横幅，同上。）横幅中夹着价格表标题：每百万 token 价格。

Model

Input

Cached input

Output

价格表表头：型号，输入，缓存输入，输出。

<!-- page 16 of 19 -->

OpenAl

| gpt-5.2-pro | $21 | - | $168 |
| --- | --- | --- | --- |
| gpt-5.1/ | $1.25 | $0.125 | $10 |
| gpt-5.1-chat-latest |  |  |  |
| gpt-5-pro | $15 | - | $120 |

gpt-5.2-pro：输入 $21，无缓存价，输出 $168. gpt-5.1 / gpt-5.1-chat-latest：输入 $1.25，缓存输入 $0.125，输出 $10. gpt-5-pro：输入 $15，无缓存价，输出 $120。

> **回看：** 「90% discount on cached inputs」 是新政策吗？
> 不是。gpt-5.1 那一行输入 $1.25，缓存输入 $0.125，也是 1 折，90% 折扣是沿用。表里偏偏缺了 gpt-5.2 / gpt-5.2-chat-latest 那一行，在翻页处丢了；按正文推，它的缓存输入应为 $0.175. Pro 两行的缓存输入都是 「-」。另外 gpt-5.2-pro 的输入价是 gpt-5.2 的 12 倍（21 / 1.75）。

We have no current plans to deprecate GPT‑5.1, GPT‑5, or GPT‑4.1 in the API and will communicate any deprecation plans with ample advance notice for developers. While GPT‑5.2 will work well out of the box in Codex, we expect to release a version of GPT‑5.2 optimized for Codex in the coming weeks.

我们目前没有在 API 里弃用 GPT-5.1，GPT-5 或 GPT-4.1 的计划，任何弃用计划都会提前充分通知开发者。GPT-5.2 在 Codex 里开箱即可用得很好，我们预计未来几周会发布一个专为 Codex 优化的 GPT-5.2 版本。

## Our partners（我们的合作伙伴）

GPT‑5.2 was built in collaboration with our long-standing partners NVIDIA and Microsoft. Azure data centers and NVIDIA GPUs, including H100, H200, and GB200-NVL72, underpin OpenAI’s atscale training infrastructure, driving significant gains in model intelligence. Together, this collaboration allows us to scale compute with confidence and bring new models to market more quickly.

GPT-5.2 是和我们的长期合作伙伴 NVIDIA 与 Microsoft 共同打造的。Azure 数据中心和 NVIDIA GPU（包括 H100，H200 和 GB200-NVL72）支撑着 OpenAI 的大规模训练基础设施，带来了模型智能的明显提升。这一合作让我们能放心地扩大算力，更快地把新模型推向市场。

## Appendix

## Detailed benchmarks（详细评测）

Below, we report comprehensive benchmark scores for GPT‑5.2 Thinking, along with a subset for GPT‑5.2 Pro.

下面列出 GPT-5.2 Thinking 的完整评测分数，以及 GPT-5.2 Pro 的部分分数。

Professional

专业

<table><tr><td rowspan="4" colspan="2"></td><td>GPT-5.2 Thinking</td><td>GPT-5.2 Pro</td><td>GPT-5.1 Thinking</td></tr><tr><td>GDPval (ties allowed, wins or ties)</td><td>70.9%</td><td>74.1%</td></tr><tr><td>GDPval (ties allowed, clear wins)</td><td>49.8%</td><td>60.0%</td></tr><tr><td>GDPval (no ties)</td><td>61.0%</td><td>67.6%</td></tr><tr><td>We use cookies</td><td>Investment banking spreadsheet tasks (internal)</td><td>68.4%</td><td>71.7%</td><td>59.1%</td></tr><tr><td colspan="4">We use cookies to help this site function, understand service usage, and support marketing efforts. Visit</td><td>to change</td></tr></table>

列依次是 GPT-5.2 Thinking, GPT-5.2 Pro, GPT-5.1 Thinking. GDPval（允许平局，胜或平）70.9%, 74.1%; GDPval（允许平局，明确胜出）49.8%, 60.0%; GDPval（不允许平局）61.0%，67.6%；投行电子表格任务（内部）68.4%, 71.7%, 59.1%。表里混进了 Cookie 横幅文字。

> **停一下：** 三种 GDPval 口径之间能互相推出来吗？
> 推不出来。如果 no ties 只是把平局对半分，Thinking 应为 49.8 + 21.1 / 2 ≈ 60.4%，表里是 61.0%；Pro 应为 60.0 + 14.1 / 2 ≈ 67.1%，表里是 67.6%。两者都差 0.5 到 0.6 个点，所以 no ties 应是另一轮强制二选一的评判，不能由前两行换算。GPT-5.1 Thinking 这一列在 GDPval 三行全空。

**Coding**

**编程**

|  | GPT-5.2 Thinking | GPT-5.2 Pro | GPT-5.1 Thinking |
| --- | --- | --- | --- |
| SWE-Bench Pro, Public | 55.6% | - | 50.8% |

SWE-Bench Pro (Public): 55.6%, -, 50.8%。「-」 表示没有该项结果，下同。

<!-- page 17 of 19 -->

We use cookies to help this site function, understand service usage, and support marketing efforts. Visit to change preferences anytime. View our [Cookie Policy](https://openai.com/policies/cookie-policy/) for more info.

（Cookie 横幅，同上。）

OpenAI

| SWE-benchVeri ed | 80.0% | - | 76.3% |
| --- | --- | --- | --- |
| SWE-Lancer,ICDiamond* | 74.6% | - | 69.7% |

SWE-bench Verified: 80.0%, -, 76.3%. SWE-Lancer, IC Diamond*: 74.6%, -, 69.7%.

> **再看：** SWE-Lancer 的 74.6% 分母是多少？
> 第 18 页脚注说 237 题里有 40 题在 OpenAI 的基础设施上跑不起来，被略去，实际分母是 197 题，约占全集的 83%. 74.6% 约合 147 道题（197 × 0.746 ≈ 147）。如果把 40 题记 0 分，分数会降到约 62%。页面没说 GPT-5.1 Thinking 的 69.7% 是否用的是同样 197 题。

Factuality

事实性

|  | GPT-5.2Thinking | GPT-5.2Pro | GPT-5.1Thinking |
| --- | --- | --- | --- |
| ChatGPTanswerswithouterrors | 93.9% | - | 91.2% |
| (w/search) |  |  |  |
| ChatGPTanswerswithouterrors | 88.0% | - | 87.3% |
| (nosearch) |  |  |  |

ChatGPT 无错误回答（开搜索）：93.9%, -, 91.2%. ChatGPT 无错误回答（不开搜索）：88.0%, -, 87.3%.

Long context

长上下文

|  | GPT-5.2Thinking | GPT-5.2Pro | GPT-5.1Thinking |
| --- | --- | --- | --- |
| OpenAIMRCRv2,8needles,4k-8k | 98.2% | - | 65.3% |
| OpenAIMRCRv2,8needles,8k-16k | 89.3% | - | 47.8% |
| OpenAIMRCRv2,8needles,16k-32k | 95.3% | - | 44.0% |
| OpenAIMRCRv2,8needles,32k-64k | 92.0% | - | 37.8% |
| OpenAIMRCRv2,8needles,64k-128k | 85.6% | - | 36.0% |
| OpenAIMRCRv2,8needles,128k-256k | 77.0% | - | 29.6% |
| BrowseCompLongContext128k | 92.0% | - | 90.0% |
| BrowseCompLongContext256k | 89.8% | - | 89.5% |
| GraphWalksbfs&lt;128k | 94.0% | - | 76.8% |
| Graphwalksparents&lt;128k | 89.0% | - | 71.5% |

OpenAI MRCR v2, 8 needles，按输入长度分六档：4k-8k 98.2% 对 65.3%，8k-16k 89.3% 对 47.8%，16k-32k 95.3% 对 44.0%，32k-64k 92.0% 对 37.8%，64k-128k 85.6% 对 36.0%，128k-256k 77.0% 对 29.6%. BrowseComp Long Context 128k 92.0% 对 90.0%，256k 89.8% 对 89.5%. GraphWalks bfs <128k 94.0% 对 76.8%，parents <128k 89.0% 对 71.5%。

> **对一下：** 8 needles 的准确率为什么 16k-32k 比 8k-16k 还高？
> GPT-5.2 Thinking 这一列是 98.2%，89.3%，95.3%，92.0%，85.6%，77.0%，第二档掉下去又升回来 6 个点；GPT-5.1 Thinking 则从 65.3% 到 29.6% 单调下降。页面没解释这个凹口，也没印每档的样本数，分不清是样本少带来的波动，还是这一档的题本身更难。

> **想：** MRCR 上提升 32.9 到 54.2 个点，BrowseComp Long Context 为什么只提升零点几到 2 个点？
> BrowseComp Long Context 128k 是 92.0% 对 90.0%，256k 是 89.8% 对 89.5%，GPT-5.1 本来就接近上限。MRCR 8 needles 要在一堆几乎相同的请求里对准第 n 个，正是 GPT-5.1 最弱的地方（128k-256k 只有 29.6%），提升空间大。正文 「state of the art in long-context reasoning」 主要落在 MRCR 上。

Vision

视觉

|  | GPT-5.2Thinking | GPT-5.2Pro | GPT-5.1Thinking |
| --- | --- | --- | --- |
| CharXivreasoning(notools) | 82.1% | - | 67.0% |
| CharXivreasoning(w/Python) | 88.7% | - | 80.3% |
| MMMUPro(notools) | 79.5% | - | - |
| MMMUPro(w/Python) | 80.4% | - | 79.0% |
| VideoMMMU(notools) | 85.9% | - | 82.9% |
| ScreenspotPro(w/Python) | 86.3% | - | 64.2% |

CharXiv reasoning（不用工具）82.1% 对 67.0%; CharXiv reasoning（带 Python）88.7% 对 80.3%; MMMU Pro（不用工具）79.5%，GPT-5.1 无数据；MMMU Pro（带 Python）80.4% 对 79.0%; Video MMMU（不用工具）85.9% 对 82.9%; ScreenSpot Pro（带 Python）86.3% 对 64.2%。

**Tool usage**

**工具使用**

|  | GPT-5.2Thinking | GPT-5.2Pro | GPT-5.1Thinking |
| --- | --- | --- | --- |
| Tau2-benchTelecom | 98.7% | - | 95.6% |
| Tau2-benchRetail | 82.0% | - | 77.9% |

Tau2-bench Telecom 98.7% 对 95.6%；Tau2-bench Retail 82.0% 对 77.9%。

<!-- page 18 of 19 -->

OpenAI

| BrowseComp | 65.8% | 77.9% | 50.8% |
| --- | --- | --- | --- |
| ScaleMCP-Atlas | 60.6% | - | 44.5% |
| Toolathlon | 46.3% | - | 36.1% |

工具使用表续：BrowseComp 65.8%, 77.9%, 50.8%; Scale MCP-Atlas 60.6%, -, 44.5%; Toolathlon 46.3%, -, 36.1%.

Academic

学术

|  | GPT-5.2Thinking | GPT-5.2Pro | GPT-5.1Thinking |
| --- | --- | --- | --- |
| GPQADiamond(notools) | 92.4% | 93.2% | 88.1% |
| HLE(notools) | 34.5% | 36.6% | 25.7% |
| HLE(w/search,Python) | 45.5% | 50.0% | 42.7% |
| MMMLU | 89.6% | - | 89.5% |
| HMMT,Feb2025(notools) | 99.4% | 100.0% | 96.3% |
| AIME2025(notools) | 100.0% | 100.0% | 94.0% |
| FrontierMathTier1-3(w/Python) | 40.3% | - | 31.0% |
| FrontierMathTier4(w/Python) | 14.6% | - | 12.5% |

GPQA Diamond（不用工具）92.4%, 93.2%, 88.1%; HLE（不用工具）34.5%, 36.6%, 25.7%; HLE（带搜索和 Python）45.5%, 50.0%, 42.7%; MMMLU 89.6%, -, 89.5%; HMMT Feb 2025（不用工具）99.4%, 100.0%, 96.3%; AIME 2025（不用工具）100.0%, 100.0%, 94.0%; FrontierMath Tier 1-3（带 Python）40.3%, -, 31.0%; FrontierMath Tier 4（带 Python）14.6%, -, 12.5%.

> **问：** AIME 2025 上 GPT-5.1 Thinking 的 94.0% 能换算成整数道题吗？
> 换算不成。AIME 2025 两场共 30 题（页外背景），30 × 0.940 = 28.2，不是整数，所以这个分数是多次采样的平均，不是单次作答。HMMT 的 99.4% 同理。页面没写采样次数。100.0% 则表示每次采样都全对，这两项对 GPT-5.2 已经饱和，拉不开差距。

Abstract reasoning

抽象推理

<table><tr><td></td><td>GPT-5.2 Thinking</td><td>GPT-5.2 Pro</td><td>GPT-5.1 Thinking</td></tr><tr><td>ARC-AGI-1 (Verified)</td><td>86.2%</td><td>90.5%</td><td>72.8%</td></tr><tr><td colspan="4">Models were run with maximum available reasoning effort in our API (xhigh for GPT-5.2 Thinking &amp; Pro, and high for GPT-5.1 Thinking), except for the professional evals, where GPT-5.2 Thinking was run with reasoning effort heavy, the maximum available in ChatGPT Pro. Benchmarks were conducted in a research environment, which may provide slightly different output from production ChatGPT in some cases.</td></tr><tr><td>ARC-AGI-2 (Verified)</td><td>52.9%</td><td>54.2% (high)</td><td>17.6%</td></tr></table>

ARC-AGI-1 (Verified) 86.2%, 90.5%, 72.8%; ARC-AGI-2 (Verified) 52.9%, 54.2% (high), 17.6%。表中夹着的脚注：模型都按我们 API 里最高可用的推理强度运行（GPT-5.2 Thinking 和 Pro 用 xhigh，GPT-5.1 Thinking 用 high）；专业类评测例外，GPT-5.2 Thinking 用的是 heavy，即 ChatGPT Pro 里最高可用的推理强度。评测在研究环境中进行，某些情况下输出可能和正式上线的 ChatGPT 略有不同。

> **核对：** 脚注里的 xhigh，high，heavy 是同一套档位吗？
> 不是。API 这边，本页提到 none 和新增的第五档 xhigh，GPT-5.1 Thinking 最高是 high；专业类评测（GDPval，投行表格）用的却是 ChatGPT Pro 的 heavy。附录 Professional 一组和其余各组不是同一种推理强度，第 1 页首表把 GDPval 70.9% 和 SWE-Bench Pro 55.6% 并排放，条件并不一致。

\* For SWE-Lancer, we omit 40/237 problems that did not run on our infrastructure.

\* SWE-Lancer 中有 40/237 道题无法在我们的基础设施上运行，已略去。

[2025](https://openai.com/news/?tags=2025)

标签：2025。

## We use cookies（我们使用 Cookie）

We use cookies to help this site function, understand service usage, and support marketing efforts. Visit preferences anytime. View our [Cookie Policy](https://openai.com/policies/cookie-policy/) for more info.

（Cookie 横幅，同上。）

Author

OpenAI

作者：OpenAI

to change

Keep reading

[View all](https://openai.com/news/)

（Cookie 横幅残段。）继续阅读，查看全部。

<!-- page 19 of 19 -->

OpenAl

![Image block](images/p19-image.png)

![Image block](images/p19-image-2.png)

![Image block](images/p19-chatgpt-ads-expands-to-southeast-asia-and-taiwan-https.png)

三张推荐文章缩略图，抓下来都是灰色占位块。

[**ChatGPT Ads expands to Southeast Asia and Taiwan**](https://openai.com/index/chatgpt-ads-expands-southeast-asia-taiwan/)

[**Product Sep 23, 2026**](https://openai.com/index/chatgpt-ads-expands-southeast-asia-taiwan/)

ChatGPT 广告扩展到东南亚和台湾，产品，Sep 23, 2026。

[**Better prompt caching for GPT-6**](https://openai.com/index/better-prompt-caching-for-gpt-6/)

[**Product Sep 22, 2026**](https://openai.com/index/better-prompt-caching-for-gpt-6/)

GPT-6 的 prompt 缓存改进，产品，Sep 22, 2026。

[**Introducing GPT-6 Sol and Luna**](https://openai.com/index/introducing-gpt-6-sol-and-luna/)

[**Product Sep 22, 2026**](https://openai.com/index/introducing-gpt-6-sol-and-luna/)

GPT-6 Sol 与 Luna 发布，产品，Sep 22, 2026。这三篇推荐是抓页当时的站点内容，和 December 11, 2025 这篇公告不是同一时间。

| Research | Products | Business | Company | More |
| --- | --- | --- | --- | --- |
| Research Index | ChatGPT ↗ | Overview | About Us | Stories |
| Research Overview | ChatGPT Business ↗ | Solutions | Our Charter | Academy |
| Economic Research | ChatGPT Enterprise ↗ | Resources | Careers | Supply Co. |
|  | ChatGPT for Education ↗ | Plugins | News | Livestreams |
| Latest Advancements | Codex | Customer Stories |  | Podcast |
| GPT-6 | Release Notes | Partner Network | Support | RSS |
| GPT-5.6 |  | Contact Sales | Help Center ↗ |  |
| GPT-5.5 | API Platform |  |  | Terms &amp; Policies |
| GPT-5.4 | Overview | Developers |  | Terms of Use |
|  | API Log In ↗ | Apps SDK ↗ |  | Privacy Policy |
| Safety | Docs ↗ | Open Models |  | Other Policies |
| Safety Approach |  | Docs ↗ |  |  |
| Deployment Safety ↗ |  | Resources ↗ |  |  |
| Security &amp; Privacy |  | Developer Forum ↗ |  |  |
| Trust &amp; Transparency |  |  |  |  |

站点页脚导航，五栏依次是研究，产品，商业，公司，更多。研究：研究索引，研究概览，经济研究，最新进展（GPT-6, GPT-5.6, GPT-5.5, GPT-5.4），安全（安全方针，部署安全，安全与隐私，信任与透明）。产品：ChatGPT，ChatGPT 商业版，ChatGPT 企业版，ChatGPT 教育版，Codex，发布说明，API 平台（概览，API 登录，文档）。商业：概览，解决方案，资源，插件，客户故事，合作伙伴网络，联系销售，开发者（Apps SDK，开放模型，文档，资源，开发者论坛）。公司：关于我们，我们的章程，招聘，新闻，支持（帮助中心）。更多：故事，学院，周边商店，直播，播客，RSS，条款与政策（使用条款，隐私政策，其他政策）。

X 0 0 日

（社交媒体图标，抓成了乱码。）

**OpenAI © 2015–2026** <strong><u>Manage Cookies</u></strong>

**OpenAI © 2015–2026** 管理 Cookie

**English United States**

**语言 English，地区 United States**

We use cookies

We use cookies to help this site function, understand service usage, and support marketing efforts. Visit preferences anytime. View our [Cookie Policy](https://openai.com/policies/cookie-policy/) for more info.

to change

（Cookie 横幅，同上。）
