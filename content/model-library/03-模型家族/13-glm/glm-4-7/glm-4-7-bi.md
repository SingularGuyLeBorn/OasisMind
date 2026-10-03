---
title: "GLM-4.7 · 对照译稿"
category: "模型库"
tags: ["GLM", "对照译稿"]
published: true
excerpt: "GLM-4.7 公开材料的逐段中英对照译稿，附读报告时的疑问块。"
---
<!-- page 1 of 10 -->

2025-12-22 · Research

2025 年 12 月 22 日，栏目：Research（研究）。

# GLM-4.7: Advancing the Coding Capability

GLM-4.7：推进编程能力（正标题）。

![Image block](images/p01-image.png)

（图：黑色圆角方块里一个白色 「Z」 字标，是 Z.ai 的小图标。PDF 第 1 页链接行里 「Try it at Z.ai」，「Call it at Z.ai」，「Z.ai Coding Plan」 三个链接前各有一个，样子相同。没有文字，没有数据。）

![Image block](images/p01-7-try-it-at-z-ai-https-z-ai-z-call-it-at-z-ai-https.png)

（图：一个黄色笑脸，两只手张开，是 HuggingFace 的图标。PDF 里它在链接第二行 「HuggingFace」 前面。没有文字。）

7 [Try it at Z.ai](https://z.ai/) Z [Call it at Z.ai](https://docs.z.ai/guides/llm/glm-4.7) Z [Z.ai Coding Plan](https://z.ai/subscribe?utm_source=blog&utm_medium=content&utm_campaign=glm5_launch) [GitHub](https://github.com/zai-org/GLM-4.5) S [HuggingFace](https://huggingface.co/zai-org/GLM-4.7) [📄 Tech Report](https://arxiv.org/abs/2508.06471)

六个链接：[在 Z.ai 上试用](https://z.ai/)，[在 Z.ai 上调用](https://docs.z.ai/guides/llm/glm-4.7)（指向 API 文档），[Z.ai 编程套餐](https://z.ai/subscribe?utm_source=blog&utm_medium=content&utm_campaign=glm5_launch)（订阅页），[GitHub](https://github.com/zai-org/GLM-4.5)（代码仓库），[HuggingFace](https://huggingface.co/zai-org/GLM-4.7)（模型页），[技术报告](https://arxiv.org/abs/2508.06471)。

> **问：** 「Tech Report」 链到 arXiv:2508.06471，这是 GLM-4.7 的报告吗？
> 不是。同家族目录 `glm-4-5/glm-4-5.md` 开头印着 「arXiv:2508.06471v1 [cs.CL] 8 Aug 2025」，标题是 「GLM-4.5: Agentic, Reasoning, and Coding (ARC) Foundation Models」，比本篇的 2025-12-22 早 136 天。同家族 GLM-4.6 的博客（`glm-4-6/glm-4-6.md`）用的也是这个链接，两代博客的 「Tech Report」 按钮指向同一篇 GLM-4.5 论文，按钮上都只写 「Tech Report」，没说明是上一代的。本目录只有这篇博客，没有 GLM-4.7 自己的技术报告。论文摘要里的总参数，激活参数，训练 token 数和评测分数都属于 GLM-4.5，不能写成 GLM-4.7 的数；这篇博客对 GLM-4.7 的结构和规模一个数字都没给。

> **停一下：** 另外几个链接也有对不上的地方吗？
> 有两处。「GitHub」 链到 `github.com/zai-org/GLM-4.5`，仓库名是 GLM-4.5，和 GLM-4.5 论文摘要末尾给的代码地址完全相同；HuggingFace 链到 `huggingface.co/zai-org/GLM-4.7`，这里才是 4.7 的名字。博客没说 GLM-4.7 的代码放在 GLM-4.5 的仓库里，这里只记下链接本身。「Z.ai Coding Plan」 的链接带着 `utm_campaign=glm5_launch`，是 GLM-5 发布活动的追踪参数，出现在一篇 2025-12-22 的 GLM-4.7 博客里，看起来是后来替换过的，博客没有说明。第 10 页页脚 © 2026 和 PDF 元数据里的生成时间 2026-09-25 指向同一件事：这份 PDF 抓的是网页后来的样子，不一定是发布当天的原样。

![Image block](images/p01-glm-4-7-your-new-coding-partner-is-coming-with-the.png)

（图：一个淡紫色的文档图标，上面几道横线。PDF 里它在 「Tech Report」 前面。没有文字。）

> **核对：** 第 1 页三张图的文件名，对得上画面吗？
> 只有第一张不算错。`p01-image.png` 是 Z 字标，名字泛，但不算错。`p01-7-try-it-at-z-ai-https-z-ai-z-call-it-at-z-ai-https.png` 的名字取自链接行的文字，画面却是 HuggingFace 的笑脸图标，和 Z.ai 没有关系。`p01-glm-4-7-your-new-coding-partner-is-coming-with-the.png` 的名字取自下面那句正文，画面是 「Tech Report」 前的文档图标。链接行开头的 「7」，中间两个 「Z」 和 HuggingFace 前的 「S」 是图标被识别成的字符，PDF 文字层里没有它们；「📄」 倒是文字层里真有的字符，所以同一个文档图标在 md 里既是一张图，又是一个字。PDF 上 GitHub 前还有一个猫头图标，md 既没收图，也没留字符。

**GLM-4.7**, your new coding partner, is coming with the following features:

**GLM-4.7** 是你新的编程搭档，带来以下特性：

**Core Coding:** GLM-4.7 brings clear gains, compared to its predecessor GLM-4.6, in multilingual agentic coding and terminal-based tasks, including (73.8%, +5.8%) on SWE-bench, (66.7%, +12.9%) on SWE-bench Multilingual, and (41%, +16.5%) on Terminal Bench 2.0. GLM-4.7 also supports thinking before acting, with significant improvements on complex tasks in mainstream agent frameworks such as Claude Code, Kilo Code, Cline, and Roo Code.

**核心编程：** 和上一代 GLM-4.6 相比，GLM-4.7 在多语言智能体编程和终端类任务上有明显提升：SWE-bench 73.8% (+5.8%), SWE-bench Multilingual 66.7% (+12.9%), Terminal Bench 2.0 41% (+16.5%). GLM-4.7 还支持 thinking before acting（先思考再行动），在 Claude Code，Kilo Code，Cline，Roo Code 等主流智能体框架里，复杂任务上的表现明显提升。

> **对一下：** 「(73.8%, +5.8%)」 的基线，是不是博客自己印的 GLM-4.6?
> 是。73.8 减 5.8 等于 68.0。第 3 页大表 GLM-4.6 那一列的 SWE-bench Verified 是 68.0，第 2 页 SWE-bench Verified 柱状图的绿柱也是 68.0；同家族 GLM-4.6 博客里 SWE-bench Verified 的柱子同样印 68.0。三处一致。有两点要记。正文写的是 「SWE-bench」，表和图写的是 「SWE-bench Verified」，按数字对上的是后者。「+5.8%」 是百分点，按比例算 73.8/68.0 约等于 1.085，只高了 8.5%。表里 HMMT Nov. 2025 的差值碰巧也是 5.8（93.5 对 87.7），和这里无关，别混在一起。

> **看表：** +12.9 和 +16.5 的基线又印在哪里？
> 也在本篇大表里。66.7 减 53.8 等于 12.9, 41.0 减 24.5 等于 16.5，分别对上 GLM-4.6 列的 SWE-bench Multilingual 和 Terminal Bench 2.0；第 2 页 Terminal Bench 2.0 柱状图的绿柱也是 24.5。可这两个基线只在 GLM-4.7 的博客里出现。GLM-4.6 自己的博客没有 SWE-bench Multilingual；它的 Terminal-Bench 印的是 40.5，名字和数都对不上这里的 Terminal Bench 2.0 24.5，看样子是不同版本的基准，两篇博客都没交代。按比例算，66.7/53.8 约为 1.240, 41.0/24.5 约为 1.673，也就是高了 24.0% 和 67.3%；正文写的 「+12.9%」 「+16.5%」 都是百分点。

> **拆开：** 「supports thinking before acting」 给了数字吗？它属于哪一类改动？
> 没给数字。这半句只说在 Claude Code，Kilo Code，Cline，Roo Code 里 「complex tasks」 明显提升，没有基准名，没有分数，也没有框架内的对比图。按字面，它是在动手（调用工具，改代码）之前先输出一段思考，属于 TestingTime 一类：推理时多花算力换质量。第 7 至 8 页的 Interleaved Thinking (「thinks before every response and tool calling」) 说的是同一件事。第 9 页脚注 1 说 τ²-Bench 和 Terminal Bench 2 开了 Preserved Thinking，所以 41.0 这个 Terminal Bench 2.0 分数是在开着思考保留的设置下得出的。模型怎么学会先想再动，训练上做了什么，全篇没说。

**Vibe Coding:** GLM-4.7 takes a major step forward in UI quality. It produces cleaner, more modern webpages and generates better-looking slides with more accurate layout and sizing.

**Vibe Coding（氛围编程）：** GLM-4.7 在 UI 质量上前进了一大步。生成的网页更干净，更现代；生成的幻灯片更好看，版式和尺寸更准确。

**Tool Using:** GLM-4.7 achieves significantly improvements in Tool using. Significant better performances can be seen on benchmarks such as τ²-Bench and on web browsing via BrowseComp.

**工具调用：** GLM-4.7 在工具调用上显著提升。在 τ²-Bench 等基准上，以及用 BrowseComp 衡量的网页浏览上，都能看到明显更好的表现。（原句 「achieves significantly improvements」 和 「Significant better performances」 有语法错误，照录。）

**Complex Reasoning:** GLM-4.7 delivers a substantial boost in mathematical and reasoning capabilities, achieving (42.8%, +12.4%) on the HLE (Humanity’s Last Exam) benchmark compared to GLM-4.6.

**复杂推理：** GLM-4.7 的数学和推理能力大幅提升，在 HLE（Humanity's Last Exam，人类最后的考试）基准上达到 42.8%，比 GLM-4.6 高 12.4%。

> **再看：** HLE 的 42.8% 是表里哪一行？
> 是带工具那一行。正文只写 「on the HLE (Humanity's Last Exam) benchmark」，大表里 HLE 却有两行：不带工具的 GLM-4.7 24.8, GLM-4.6 17.2；「HLE w/ Tools」 的 GLM-4.7 42.8, GLM-4.6 30.4. 42.8 减 30.4 等于 12.4，对上的是带工具那一行；不带工具只高 7.6。第 2 页 HLE 小图也画成两段，24.8 上面叠 42.8 w/ Tools. 30.4 和 GLM-4.6 博客里 HLE 带工具的数相同。正文省掉了 「w/ Tools」，又把它放在 「Complex Reasoning」 标题下，读者容易当成纯推理的分数。

You can also see significant improvements in many other scenarios such as chat, creative writing, and role-play scenario.

在对话，创意写作和角色扮演等许多其他场景里，也能看到明显提升。（这一句没有配任何评测。）

<!-- page 2 of 10 -->

LLM Performance Evaluation: Agentic, Reasoning and Coding

大模型性能评测：智能体，推理与编程（评测图的大标题。源文 md 把它标成一级标题；PDF 里它是图片里的字，文字层没有这一行，这里按图内文字处理，不作标题。）

Z

Z（评测图右上角的 Z 字标，被识别成了字母。）

8 benchmarks: AIME 25, LiveCodeBench v6, GPQA, HLE, SWE-bench Verified, Terminal-Bench, τ²-Bench, BrowseComp (Evaluation results under 128K context length)

8 个基准：AIME 25, LiveCodeBench v6, GPQA, HLE, SWE-bench Verified, Terminal-Bench, τ²-Bench, BrowseComp（评测结果均在 128K 上下文长度下得出）。

GLM-4.7GLM-4.6DeepSeek-V3.2Claude Sonnet 4.5GPT-5.1(High)

图例，五个模型依次是：GLM-4.7（蓝），GLM-4.6（绿），DeepSeek-V3.2, Claude Sonnet 4.5, GPT-5.1(High) （后三个是深浅不同的灰）。md 把五个名字粘成了一串。

> **确认：** 副标题和八张小图的标题一致吗？「under 128K context length」 说明了什么？
> 顺序一致，名字有两处不同。副标题写 「GPQA」 和 「Terminal-Bench」，小图标题写 「GPQA-Diamond」 和 「Terminal Bench 2.0」，大表里也是后一种写法，应以小图为准。「AIME 25」 在大表里写 「AIME 2025」，「LiveCodeBench v6」 在大表里写 「LiveCodeBench-v6」，只是写法不同。128K 是这八项跑分时的上下文长度。第 9 页脚注 1 的 「max new tokens 131072」 正好是 128 × 1024，但那是生成上限，不是上下文长度，博客没把两者放在一起说。GLM-4.7 的最大上下文窗口是多少，全篇没写。

![Chart block](images/p02-chart.png)

(图：AIME 25。五根柱按图例顺序：GLM-4.7 95.7; GLM-4.6 93.9; DeepSeek-V3.2 93.1; Claude Sonnet 4.5 87.0; GPT-5.1(High) 94.0.)

![Chart block](images/p02-chart-2.png)

(图：LiveCodeBench v6. GLM-4.7 84.9; GLM-4.6 82.8; DeepSeek-V3.2 83.3; Claude Sonnet 4.5 64.0; GPT-5.1(High) 87.0.)

![Chart block](images/p02-chart-3.png)

(图：GPQA-Diamond. GLM-4.7 85.7; GLM-4.6 81.0; DeepSeek-V3.2 82.4; Claude Sonnet 4.5 83.4; GPT-5.1(High) 88.1.)

![Image block](images/p02-image.png)

(图：HLE。每根柱分两段，下段是不带工具的分，上段标 「w/ Tools」。GLM-4.7 24.8，带工具 42.8；GLM-4.6 17.2，带工具 30.4；DeepSeek-V3.2 25.1，带工具 40.8；Claude Sonnet 4.5 13.7，带工具 32; GPT-5.1(High) 25.7，带工具 42.7.)

![Chart block](images/p02-chart-4.png)

(图：SWE-bench Verified. GLM-4.7 73.8; GLM-4.6 68.0; DeepSeek-V3.2 73.1; Claude Sonnet 4.5 77.2; GPT-5.1(High) 76.3.)

![Chart block](images/p02-chart-5.png)

(图：Terminal Bench 2.0. GLM-4.7 41.0; GLM-4.6 24.5; DeepSeek-V3.2 46.4; Claude Sonnet 4.5 42.8; GPT-5.1(High) 47.6.)

![Chart block](images/p02-chart-6.png)

(图：τ²-Bench. GLM-4.7 87.4; GLM-4.6 75.2; DeepSeek-V3.2 85.3; Claude Sonnet 4.5 87.2; GPT-5.1(High) 82.7.)

![Chart block](images/p02-benchmark-performance-more-detailed-comparisons-of-glm.png)

(图：BrowseComp。前三根柱分两段，上段标 「w/ Context Manage」。GLM-4.7 52，带上下文管理 67.5；GLM-4.6 45.1，带上下文管理 57.5；DeepSeek-V3.2 51.4，带上下文管理 67.6; Claude Sonnet 4.5 24.1; GPT-5.1(High) 50.8。后两根只有一段。)

> **回看：** 八张小图的文件名对得上画面吗？
> 六张名字泛但不算错，两张对不上。依次是：`p02-chart.png` AIME 25, `p02-chart-2.png` LiveCodeBench v6, `p02-chart-3.png` GPQA-Diamond, `p02-image.png` HLE, `p02-chart-4.png` SWE-bench Verified, `p02-chart-5.png` Terminal Bench 2.0, `p02-chart-6.png` τ²-Bench, `p02-benchmark-performance-more-detailed-comparisons-of-glm.png` BrowseComp. HLE 那张叫 `p02-image.png`，打断了 chart 的编号，所以 chart-4 画的是第五项。BrowseComp 那张的名字取自图下面 「Benchmark Performance. More detailed comparisons of GLM...」 那段正文，画面里没有这句话。PDF 里整块评测图是一张 4426x3128 的位图，标题，副标题，图例和右上角的 Z 都画在图里；md 的标题行，副标题行和图例行都是从图里识别出来的字。

> **看表：** 柱状图里的 Claude Sonnet 4.5，和 GLM-4.6 博客里的 Claude Sonnet 4.5 是同一组数吗？
> 只有一半相同。两篇博客都画了 Claude Sonnet 4.5. AIME 25 都是 87.0，GPQA 都是 83.4，SWE-bench Verified 都是 77.2。其余对不上：LiveCodeBench v6 这里 64.0，GLM-4.6 博客 57.7；HLE 这里 13.7，那边 17.3；BrowseComp 这里 24.1，那边 19.6；τ²-Bench 这里 87.2，那边 88.1（那边标了 Weighted）。两篇都没说对手的分数是自己跑的还是引用的，所以两篇的 Claude 列不能拼在一起。只看本页：GLM-4.7 对 Claude Sonnet 4.5 八项赢六项，输 SWE-bench Verified（73.8 对 77.2）和 Terminal Bench 2.0（41.0 对 42.8）。对 GPT-5.1(High)，赢 AIME 25，HLE 带工具（42.8 对 42.7），τ²-Bench，BrowseComp 四项，输 LiveCodeBench v6，GPQA-Diamond，SWE-bench Verified，Terminal Bench 2.0 四项；HLE 不带工具也输（24.8 对 25.7）。BrowseComp 上 GPT-5.1(High) 只有一段 50.8，没有带上下文管理的数，同口径比应该用 GLM-4.7 的 52，不是 67.5。

**Benchmark Performance.** More detailed comparisons of GLM-4.7 with other models GPT-5, GPT-5.1-High, Claude Sonnet 4.5, Gemini 3.0 Pro, DeepSeek-V3.2, Kimi K2 Thinking, on 17 benchmarks (including 8 reasoning, 5 coding, and 3 agents benchmarks) can be seen in the below table.

**基准表现。** GLM-4.7 与 GPT-5，GPT-5.1-High，Claude Sonnet 4.5，Gemini 3.0 Pro，DeepSeek-V3.2，Kimi K2 Thinking 等模型在 17 个基准（包括 8 个推理，5 个编程，3 个智能体基准）上更详细的对比，见下表。

> **问：** 「17 benchmarks (including 8 reasoning, 5 coding, and 3 agents)」，8 加 5 加 3 是 17 吗？
> 是 16。表里正好 17 行，分组却是 REASONING 9 行（MMLU-Pro, GPQA-Diamond, HLE, HLE w/ Tools, AIME 2025, HMMT Feb. 2025, HMMT Nov. 2025, IMOAnswerBench, LiveCodeBench-v6），CODE AGENT 4 行，GENERAL AGENT 4 行，9, 4, 4 和 8, 5, 3 也对不上。能凑出 8, 5, 3 的一种读法是：HLE 两行各算一个，LiveCodeBench-v6 挪进编程，BrowseComp 和它带上下文管理的那一行合成一个；这样是 16 个基准，17 行。这是按数字拼出来的，博客没有解释。句中列的 GPT-5 和 GPT-5.1-High，表里看不到，见下一条。

<table><tr><td>Benchmark</td><td>GLM-4.7</td><td>GLM-4.6</td><td>Kimi K2 Thinking</td><td>DeepSeek-V3.2</td><td>Gemini 3.0 Pro</td><td>Claude</td></tr><tr><td colspan="7">REASONING</td></tr><tr><td>MMLU-Pro</td><td>84.3</td><td>83.2</td><td>84.6</td><td>85.0</td><td>90.1</td><td></td></tr><tr><td>GPQA-Diamond</td><td>85.7</td><td>81.0</td><td>84.5</td><td>82.4</td><td>91.9</td><td></td></tr><tr><td>HLE</td><td>24.8</td><td>17.2</td><td>23.9</td><td>25.1</td><td>37.5</td><td></td></tr><tr><td>HLEw/ Tools</td><td>42.8</td><td>30.4</td><td>44.9</td><td>40.8</td><td>45.8</td><td></td></tr><tr><td>AIME 2025</td><td>95.7</td><td>93.9</td><td>94.5</td><td>93.1</td><td>95.0</td><td></td></tr><tr><td>HMMT Feb. 2025</td><td>97.1</td><td>89.2</td><td>89.4</td><td>92.5</td><td>97.5</td><td></td></tr></table>

表的第一段，中文表头：

| 基准 | GLM-4.7 | GLM-4.6 | Kimi K2 Thinking | DeepSeek-V3.2 | Gemini 3.0 Pro | Claude（被截断） |
| --- | --- | --- | --- | --- | --- | --- |
| 推理（REASONING） | | | | | | |
| MMLU-Pro | 84.3 | 83.2 | 84.6 | 85.0 | 90.1 | |
| GPQA-Diamond | 85.7 | 81.0 | 84.5 | 82.4 | 91.9 | |
| HLE | 24.8 | 17.2 | 23.9 | 25.1 | 37.5 | |
| HLE 带工具 | 42.8 | 30.4 | 44.9 | 40.8 | 45.8 | |
| AIME 2025 | 95.7 | 93.9 | 94.5 | 93.1 | 95.0 | |
| HMMT Feb. 2025 | 97.1 | 89.2 | 89.4 | 92.5 | 97.5 | |

> **停一下：** 正文说要和 GPT-5，GPT-5.1-High 比，表里怎么只有六列，最后一列还是空的？
> 表被网页的横向滚动截断了。PDF 第 2, 3 页表格的右边缘只露出 「Claud」 几个字母，整列数字都在可视区外；正文点名的 GPT-5 和 GPT-5.1-High 更靠右，PDF 里一个字都没有。md 把表头补成了 「Claude」，数据格留空。所以大表里能读的对手只有 Kimi K2 Thinking，DeepSeek-V3.2，Gemini 3.0 Pro 三家。Claude Sonnet 4.5 和 GPT-5.1(High) 的数只能看第 2 页柱状图，只有八项；GPT-5（不带 .1）的分数全篇看不到。表头那一列具体是哪个 Claude 型号，可见部分也没写全。

<!-- page 3 of 10 -->

| Benchmark | GLM-4.7 | GLM-4.6 K | imi K2 Thinking | DeepSeek-V3.2 | Gemini 3.0 Pro Claud |
| --- | --- | --- | --- | --- | --- |
| HMMT Nov. 2025 | 93.5 | 87.7 | 89.2 | 90.2 | 93.3 |
| IMOAnswerBench | 82.0 | 73.5 | 78.6 | 78.3 | 83.3 |
| LiveCodeBench-v6 | 84.9 | 82.8 | 83.1 | 83.3 | 90.7 |
| CODE AGENT |  |  |  |  |  |
| SWE-bench Verified | 73.8 | 68.0 | 71.3 | 73.1 | 76.2 |
| SWE-bench | 66.7 | 53.8 | 61.1 | 70.2 | - |
| Multilingual |  |  |  |  |  |
| Terminal Bench Hard | 33.3 | 23.6 | 30.6 | 35.4 | 39.0 |
| Terminal Bench 2.0 | 41.0 | 24.5 | 35.7 | 46.4 | 54.2 |
| GENERAL AGENT |  |  |  |  |  |
| BrowseComp | 52.0 | 45.1 | - | 51.4 | - |
| BrowseComp | 67.5 | 57.5 | 60.2 | 67.6 | 59.2 |
| w/ Context Manage |  |  |  |  |  |
| BrowseComp-ZH | 66.6 | 49.5 | 62.3 | 65.0 | - |
| τ²-Bench | 87.4 | 75.2 | 74.3 | 85.3 | 90.7 |

表的第二段，中文表头。源文 md 把表头 「GLM-4.6」 和 「Kimi K2 Thinking」 切错成 「GLM-4.6 K」 和 「imi K2 Thinking」，又把两行长名字拆成两行，这里按 PDF 合回去。「-」 表示没有数。

| 基准 | GLM-4.7 | GLM-4.6 | Kimi K2 Thinking | DeepSeek-V3.2 | Gemini 3.0 Pro |
| --- | --- | --- | --- | --- | --- |
| HMMT Nov. 2025 | 93.5 | 87.7 | 89.2 | 90.2 | 93.3 |
| IMOAnswerBench | 82.0 | 73.5 | 78.6 | 78.3 | 83.3 |
| LiveCodeBench-v6 | 84.9 | 82.8 | 83.1 | 83.3 | 90.7 |
| 编程智能体（CODE AGENT） | | | | | |
| SWE-bench Verified | 73.8 | 68.0 | 71.3 | 73.1 | 76.2 |
| SWE-bench Multilingual | 66.7 | 53.8 | 61.1 | 70.2 | - |
| Terminal Bench Hard | 33.3 | 23.6 | 30.6 | 35.4 | 39.0 |
| Terminal Bench 2.0 | 41.0 | 24.5 | 35.7 | 46.4 | 54.2 |
| 通用智能体（GENERAL AGENT） | | | | | |
| BrowseComp | 52.0 | 45.1 | - | 51.4 | - |
| BrowseComp 带上下文管理 | 67.5 | 57.5 | 60.2 | 67.6 | 59.2 |
| BrowseComp-ZH | 66.6 | 49.5 | 62.3 | 65.0 | - |
| τ²-Bench | 87.4 | 75.2 | 74.3 | 85.3 | 90.7 |

> **对一下：** GLM-4.6 这一列，和 GLM-4.6 自己的博客印的数一致吗？
> 大多一致，有一处不同。GLM-4.6 博客的八项里，AIME 25 93.9, GPQA 81.0, LiveCodeBench v6 82.8, HLE 17.2（带工具 30.4），BrowseComp 45.1，SWE-bench Verified 68.0，都和本表 GLM-4.6 列相同。τ²-Bench 不同：GLM-4.6 博客是 75.9（标 Weighted），本表和本篇柱状图都是 75.2，差 0.7，博客没解释。第 9 页脚注 3 说这次 τ²-Bench 在 Retail 和 Telecom 里加了额外提示，Airline 用了 Claude Opus 4.5 发布报告里的修正；设置一变，分数可能跟着变，但博客没说 GLM-4.6 这一列是不是按新设置重跑的。GLM-4.6 博客的 Terminal-Bench 40.5 在本表里找不到对应行，本表只有 Terminal Bench Hard 23.6 和 Terminal Bench 2.0 24.5. GLM-4.6 博客里 AIME 25 带工具 98.6，GPQA 带工具 82.9，LiveCodeBench v6 带工具 84.5 这三个数，本表没有收。

> **核对：** 除了对 GLM-4.6 的 「clear gains」，GLM-4.7 在这张表里是不是处处领先？
> 对 GLM-4.6 是处处领先，17 行全部更高。差值最小的是 MMLU-Pro 1.1，AIME 2025 1.8，LiveCodeBench-v6 2.1；最大的是 BrowseComp-ZH 17.1 和 Terminal Bench 2.0 16.5。对其他模型就不是了。DeepSeek-V3.2 有六行高于 GLM-4.7: MMLU-Pro 85.0, HLE 25.1, SWE-bench Multilingual 70.2，Terminal Bench Hard 35.4，Terminal Bench 2.0 46.4，BrowseComp 带上下文管理 67.6（只高 0.1）。Kimi K2 Thinking 有两行更高：MMLU-Pro 84.6，HLE 带工具 44.9. Gemini 3.0 Pro 有数的 14 行里，GLM-4.7 只在 AIME 2025（95.7 对 95.0），HMMT Nov. 2025（93.5 对 93.3），BrowseComp 带上下文管理（67.5 对 59.2）三行更高。正文开头的三个 「clear gains」 都是对 GLM-4.6 说的；其中 SWE-bench Multilingual 和 Terminal Bench 2.0 两项，DeepSeek-V3.2 都比 GLM-4.7 高。

> **拆开：** BrowseComp 两行，52.0 和 67.5 差在哪里？
> 差在 「w/ Context Manage」（带上下文管理）。这个设置是什么，上下文怎么管理，全篇没有解释。GLM-4.7 从 52.0 升到 67.5，GLM-4.6 从 45.1 升到 57.5，DeepSeek-V3.2 从 51.4 升到 67.6；Kimi K2 Thinking 和 Gemini 3.0 Pro 只有带管理的数，分别是 60.2 和 59.2。第 1 页 「Tool Using」 那条说 BrowseComp 上 「Significant better performances」，没说指哪一行。第 2 页 BrowseComp 小图里，GLM-4.7 的数印成 「52」，不是 「52.0」。

**Coding:** AGI is a long journey, and benchmarks are only one way to evaluate performance. While the metrics provide necessary checkpoints, the most important thing is still how it \*feels\*. True intelligence isn't just about acing a test or processing data faster; ultimately, the success of AGI will be measured by how seamlessly it integrates into our lives-"**coding**" this time.

**编程：** 通用人工智能（AGI）是一段漫长的旅程，基准只是评估表现的一种方式。这些指标提供了必要的检查点，但最重要的仍然是它用起来 *感觉* 如何。真正的智能不只是考试拿高分，或者处理数据更快；归根结底，AGI 成不成功，要看它多顺畅地融入我们的生活，这一次是融入 「**编程**」。

**Case**

案例（小节标题。源文 md 标成二级标题，这里改成加粗行，文字不变。）

<table><tr><td colspan="3">Frontend Development Showcases</td></tr><tr><td>Live Style</td><td>Cyber Domain</td><td>Artistic Portfolio</td></tr></table>

前端开发展示，三个标签页：Live Style（生活方式），Cyber Domain（赛博领域），Artistic Portfolio（艺术作品集）。PDF 里选中的是第一个 Live Style。

<!-- page 4 of 10 -->

PROMPT build a html website, High-contrast dark mode + bold condensed headings + animated ticker + c…

提示词：做一个 html 网站，高对比度暗色模式 + 粗体窄字标题 + 动画滚动字幕 + c（提示词在网页上被截断，原文停在字母 c 和省略号处）。

GLM-4.7

GLM-4.6

两个切换标签：GLM-4.7 和 GLM-4.6。

Scroll down to see more

向下滚动查看更多。

BOLD.

BOLD.（生成网页左上角的字。）

VISUAL IIMMPPAACCTT 1

VISUAL IMPACT，视觉冲击（生成网页中间的大标题。源文 md 把这一行标成一级标题，这里去掉井号，它是生成网页里的字，不是博客的标题。）

START PROJECT

开始项目（荧光黄按钮上的字。）

Artifacts Showcases

Artifacts 展示（下一个展示区的标题）。

> **想：** 这些前端展示，能看出 GLM-4.7 比 GLM-4.6 好在哪吗？
> 从这份 PDF 看不出。每个展示区都有 「GLM-4.7」 和 「GLM-4.6」 两个切换标签，PDF 里选中的都是 GLM-4.7，GLM-4.6 生成的那一版一次都没截到；三个标签页也只截到第一个 Live Style。页面上是一个黑底网页：左上 「BOLD.」，中间白字 「VISUAL」 叠空心字 「IMPACT」，下面一个荧光黄的 「START PROJECT」 按钮。md 写成 「VISUAL IIMMPPAACCTT 1」，是因为 PDF 文字层里 「IMPACT」 有两份（实心一层，描边一层），md 把两份逐个字母交错拼在了一起；末尾的 「1」 在 PDF 文字层里没有。第 3 到 5 页没有一张图进 md，第 1 页 「Vibe Coding」 说的网页更干净，更现代，在这里只有 GLM-4.7 单方面的一张截图可看。

<!-- page 5 of 10 -->

Voxel Pagoda

Particle Galaxy

Rubik's Cube

Artifacts 展示的三个标签页：Voxel Pagoda（体素宝塔），Particle Galaxy（粒子星系），Rubik's Cube（魔方）。PDF 里选中的是 Voxel Pagoda。

PROMPT Design a richly crafted voxel-art environment featuring an ornate pagoda set within a vibrant gar…

提示词：设计一个精心制作的体素艺术场景，一座华丽的宝塔坐落在一个色彩鲜艳的 gar（提示词被截断，原文停在 「gar」 和省略号处）。

GLM-4.7

GLM-4.6

两个切换标签：GLM-4.7 和 GLM-4.6。

**Kyoto Voxel Garden**

京都体素花园（生成页面的标题。源文 md 标成二级标题，这里改成加粗行，文字不变。）

An ornate pagoda amidst vibrant cherry blossoms. Drag to rotate, scroll to zoom.

樱花丛中的一座华丽宝塔。拖动可旋转，滚动可缩放。

NEW GARDEN LAYOUT

新花园布局（按钮）。

TOGGLE ROTATION

切换旋转（按钮）。

> **问：** 体素宝塔画出来了吗？
> 没有。PDF 第 5 页的标题和说明文字是半透明的灰色，中间一大块是空的，两个按钮也是淡灰色，像是 3D 场景还没加载完就截了图。PDF 里这块区域是一张 646x736 的位图，看上去一片空白，md 没有收它，所以本页 md 没有图。PDF 文字层里标题和说明各出现两次，md 只留了一次。这一页能读到的只有提示词开头，标题，一句说明和两个按钮；宝塔长什么样，GLM-4.6 那一版怎样，都看不到。

<!-- page 6 of 10 -->

**Poster Showcases**

海报展示（小节标题。源文 md 标成二级标题，这里改成加粗行，文字不变。）

PROMPT Design a poster introducing Paris, with a romantic and fashionable aesthetic. The overall style sh…

提示词：设计一张介绍巴黎的海报，浪漫而时尚。整体风格应（提示词被截断，原文停在 「sh」 和省略号处）。

GLM-4.7

GLM-4.6

两个切换标签：GLM-4.7 和 GLM-4.6。

![Image block](images/p06-slides-creation-showcases.png)

（图：一片粉紫和橙色调的云天，右侧一条灰色滚动条，上下两个三角箭头，中间一个滑块。画面里没有文字。PDF 里它在 「Poster Showcases」 的 GLM-4.7 标签下面。）

**Slides Creation Showcases**

幻灯片生成展示（小节标题，源文 md 本来就是加粗行）。

PROMPT introduce Zootopia, using bright color, 6 pages [View full trajectory at Z.ai](https://chat.z.ai/s/00f6153c-d5ae-4ee6-a26a-897505377e02)

提示词：介绍 Zootopia（疯狂动物城），用明亮的配色，做 6 页。[在 Z.ai 查看完整轨迹](https://chat.z.ai/s/00f6153c-d5ae-4ee6-a26a-897505377e02)

> **回看：** `p06-slides-creation-showcases.png` 画的是幻灯片吗？
> 不是。名字取自图下面的 「Slides Creation Showcases」，画面却是上面海报展示里巴黎海报的最上面一截：一片云天加一条滚动条，没有标题，没有字。海报往下还有多长，写了什么，截图里看不到，所以这张图也看不出 「romantic and fashionable」 做到了没有。PDF 里这张图是 1816x2003 的位图。真正的幻灯片展示在第 7 页，是 Zootopia 那几张。

<!-- page 7 of 10 -->

GLM-4.7

GLM-4.6

两个切换标签：GLM-4.7 和 GLM-4.6。

D I S N E Y 2 0 1 6

DISNEY 2016（幻灯片第 1 页左上的小字，字母之间加了空格。）

**ZOOTOPIA**

疯狂动物城（幻灯片的大标题。源文 md 标成二级标题，这里改成加粗行，文字不变。）

**A World Where Anyone Can Be Anything**

一个人人都能成为任何样子的世界（副标题，同样由二级标题改成加粗行。）

In a city of anthropomorphic animals, a rookie rabbit police officer and a cynical con artist fox must work together to uncover a conspiracy that threatens their world.

在一座拟人化动物的城市里，一只新手兔子警官和一只愤世嫉俗的狐狸骗子必须联手，揭开一个威胁他们世界的阴谋。

![Image block](images/p07-academy-award.png)

（图：浅黄底上一个橙色圆圈，圈里一颗星，下面紫色小字 「ACADEMY AWARD」。是幻灯片第 1 页左下三个图标里的第一个。）

ACADEMY AWARD

学院奖（图标下的文字。）

![Image block](images/p07-worldwide-hit.png)

（图：橙色圆圈里一个地球图标，没有文字。第二个图标。）

WORLDWIDE HIT

全球热映（图标下的文字。）

![Image block](images/p07-beloved-story.png)

（图：橙色圆圈里一颗心，没有文字。第三个图标。）

BELOVED STORY

备受喜爱的故事（图标下的文字。）

![Image block](images/p07-explore-zootopia.png)

（图：动物城的城市全景插画：高低错落的楼，一道彩虹，一条拱桥，水边一列粉色列车，车身写 「Rabbit Transit」。左上角露出橙色大字 「PIA」 和斜体 「Be」。这是幻灯片第 1 页右侧的主图。）

EXPLORE ZOOTOPIA

探索动物城（幻灯片第 2 页左侧的大标题。）

![Image block](images/p07-the-city-a-vibrant-metropolis.png)

（图：圆角卡片里的城市远景插画，和上一张是同一座城。）

The City A Vibrant Metropolis

城市：一座充满活力的大都会（卡片的标题和副标题。）

01

01（卡片右下角的编号。）

![Image block](images/p07-characters-judy-nick.png)

（图：圆角卡片里，左边是穿花衬衫，打领带的狐狸，胸牌写 「Nick」；右边是一只灰色的兔子。）

Characters Judy & Nick

角色：朱迪和尼克（第二张卡片的标题和副标题。）

> **核对：** 第 7 页六张图的文件名对得上画面吗？要求 6 页的幻灯片截到了几页？
> 五张对得上，一张对不上。`p07-worldwide-hit.png`（地球），`p07-beloved-story.png`（心），`p07-the-city-a-vibrant-metropolis.png`（城市卡片），`p07-characters-judy-nick.png`（狐狸和兔子）都和画面相符；`p07-academy-award.png` 也对得上，只是画面里带着 「ACADEMY AWARD」 几个字，这几个字在 md 里既在图里又在正文里。`p07-explore-zootopia.png` 的名字取自下一行 「EXPLORE ZOOTOPIA」，画面其实是第 1 页幻灯片右边的城市主图，角上还能看到大标题 「ZOOTOPIA」 的末尾 「PIA」。提示词要 6 页，PDF 的预览窗口只露出第 1 页和第 2 页的上半截，第 2 页的卡片还被右边缘切掉一块。这里选中的仍然是 GLM-4.7 标签，GLM-4.6 那一版没截到。

## Getting started with GLM-4.7

GLM-4.7 上手指南

**Interleaved Thinking & Preserved Thinking**

交错思考与保留思考（小节标题。源文 md 是二级标题，这里改成加粗行，文字不变。）

GLM-4.7 enhances **Interleaved Thinking**, a feature introduced since GLM-4.5, and further introduces **Preserved Thinking** and **Turn-level Thinking**. By thinking between actions and staying consistent across turns, it makes complex tasks more stable and more controllable:

GLM-4.7 增强了 **Interleaved Thinking（交错思考）**，这是从 GLM-4.5 起就有的功能；并新引入了 **Preserved Thinking（保留思考）** 和 **Turn-level Thinking（轮级思考）**。通过在动作之间思考，并在多轮之间保持一致，它让复杂任务更稳定，更可控：

> **确认：** 「a feature introduced since GLM-4.5」，在 GLM-4.5 论文里找得到吗？
> 找不到这个词。同家族 `glm-4-5/glm-4-5.md` 里没有 「Interleaved」 一词；论文讲的是 「hybrid reasoning modes」，复杂推理和智能体任务用 thinking mode，即时回答用 non-thinking mode。在工具调用之间穿插思考，论文是否用别的说法讲过，这里不替它对上。所以 「since GLM-4.5」 只能当作这篇博客自己的说法，Tech Report 链接指向的那篇论文不能替它作证。Preserved Thinking 和 Turn-level Thinking 是本篇说新引入的，全篇没有给它们各自开和关的对比分数。

<!-- page 8 of 10 -->

**Interleaved Thinking:** GLM-4.7 thinks before every response and tool calling, improving instruction following and the quality of generation.

**交错思考：** GLM-4.7 在每一次回复和每一次工具调用之前都先思考，以此提升指令遵循和生成质量。

**Preserved Thinking:** In coding agent scenarios, GLM-4.7 automatically retains all thinking blocks across multi-turn conversations, reusing the existing reasoning instead of re-deriving from scratch. This reduces information loss and inconsistencies, and is well-suited for longhorizon, complex tasks.

**保留思考：** 在编程智能体场景里，GLM-4.7 会在多轮对话中自动保留全部思考块，复用已有的推理，不再从头推导。这减少了信息丢失和前后不一致，适合长程的复杂任务。（源文 md 的 「longhorizon」 在 PDF 里是跨行断开的 「long-horizon」。）

**Turn-level Thinking:** GLM-4.7 supports per-turn control over reasoning within a session— disable thinking for lightweight requests to reduce latency/cost, enable it for complex tasks to improve accuracy and stability.

**轮级思考：** GLM-4.7 支持在一个会话里逐轮控制推理：轻量请求关掉思考，降低延迟和成本；复杂任务打开思考，提升准确性和稳定性。

More details: [https://docs.z.ai/guides/capabilities/thinking-mode](https://docs.z.ai/guides/capabilities/thinking-mode)

更多细节：[https://docs.z.ai/guides/capabilities/thinking-mode](https://docs.z.ai/guides/capabilities/thinking-mode)

![Image block](images/p08-call-glm-4-7-api-via-z-ai-api-platform.png)

（图：多步多轮的输入输出示意图，分 Turn 1 和 Turn 2 两块。Turn 1 有 Step 1 到 Step 3. Step 1 的输入是 System 和 User message 1，输出 Reasoning 1 和 Tool call 1. Step 2 的输入在此基础上加上 Reasoning 1，Tool call 1，Tool result 1，输出 Reasoning 2 和 Tool call 2. Step 3 的输入再加上 Reasoning 2，Tool call 2，Tool result 2，输出 Reasoning 3 和 Answer 1. Turn 2 的 Step 1 把 Turn 1 的全部内容带进输入，包括 Reasoning 1 到 3 和 Answer 1，再加 User message 2，输出 Reasoning 4 和一个省略号。Reasoning 块是蓝色，User message 深灰，System 浅灰，Answer 米色。）

> **再看：** `p08-call-glm-4-7-api-via-z-ai-api-platform.png` 对得上画面吗？图里画的是哪种思考？
> 文件名对不上。它取自图下面的小节标题 「Call GLM-4.7 API via Z.ai API platform」，画面里没有 API 或 Z.ai 字样，画的是多步多轮时哪些内容进入下一步的输入。从图看，Turn 1 里每一步都带着前面的 Reasoning，对应 Interleaved Thinking；Turn 2 开头仍然带着 Turn 1 的 Reasoning 1 到 3，对应 Preserved Thinking。图里没有 Turn-level Thinking 关掉思考的情形，也没有画 「不保留思考块」 时的对照。这张图在 PDF 里是 2288x1726 的位图。

> **想：** 每一步都先想，还把思考块全部留着，代价写了吗？
> 只写了方向，没写多少。Interleaved Thinking 和 Preserved Thinking 都是推理时多花算力，属于 TestingTime 一类；思考块全部保留，意味着后面每一步的输入都更长。博客提到代价只有一处，在 Turn-level Thinking 那句：轻量请求关掉思考可以降低 「latency/cost」。延迟多多少，token 多多少，关掉思考后分数掉多少，全篇没有数字。第 9 页脚注 1 把默认 max new tokens 设成 131072，给了很大的生成空间，但实际用了多少没有报告。

**Call GLM-4.7 API via Z.ai API platform**

通过 Z.ai API 平台调用 GLM-4.7 API（小节标题。源文 md 是二级标题，这里改成加粗行，文字不变。）

The [Z.ai](https://z.ai/) API platform offers the GLM-4.7 model. For comprehensive API documentation and integration guidelines, please refer to [https://docs.z.ai/guides/llm/glm-4.7](https://docs.z.ai/guides/llm/glm-4.7). At the same time, the model is also available worldwide through OpenRouter ([https://openrouter.ai/](https://openrouter.ai/)).

[Z.ai](https://z.ai/) API 平台提供 GLM-4.7 模型。完整的 API 文档和接入指南见 [https://docs.z.ai/guides/llm/glm-4.7](https://docs.z.ai/guides/llm/glm-4.7). 同时，全球用户也可以通过 OpenRouter ([https://openrouter.ai/](https://openrouter.ai/)) 使用这个模型。

<!-- page 9 of 10 -->

**Use GLM-4.7 with Coding Agents**

在编程智能体里使用 GLM-4.7（小节标题。源文 md 是二级标题，这里改成加粗行，文字不变。）

GLM-4.7 is now available to use within coding agents (Claude Code, Kilo Code, Roo Code, Cline and more).

GLM-4.7 现在可以在编程智能体里使用（Claude Code，Kilo Code，Roo Code，Cline 等）。

For **GLM Coding Plan subscribers**: You'll be automatically upgraded to GLM-4.7. If you've previously customized the app configs (like \~/.claude/settings.json in Claude Code), simply update the model name to "glm-4.7" to complete the upgrade.

对 **GLM Coding Plan 订阅用户**：你会被自动升级到 GLM-4.7。如果之前改过应用配置（比如 Claude Code 里的 `~/.claude/settings.json`），只要把模型名改成 「glm-4.7」 就完成了升级。

For **New users**: Subscribing GLM Coding Plan means having access to a Claude-level coding model at a fraction of the cost — just 1/7th the price with 3x the usage quota. Start building today: [https://z.ai/subscribe](https://z.ai/subscribe).

对 **新用户**：订阅 GLM Coding Plan，就能用一小部分成本用上 Claude 级别的编程模型，价格只有 1/7，用量额度是 3 倍。现在就开始：[https://z.ai/subscribe](https://z.ai/subscribe).

> **停一下：** 「1/7th the price with 3x the usage quota」 是和谁比？
> 原句没写。前半句说 「a Claude-level coding model」，按上下文像是和 Claude 的订阅比，但没点名哪一档套餐，也没给价格。这句话和 GLM-4.6 博客几乎一样，1/7 和 3 倍两个数都没变，只把 「Claude-level performance」 换成了 「a Claude-level coding model」。它是订阅推广，没有图表或评测支撑。另外，第 1 页列框架的顺序是 Claude Code，Kilo Code，Cline，Roo Code，这里是 Claude Code，Kilo Code，Roo Code，Cline，名字相同，顺序不同。

**Chat with GLM-4.7 on Z.ai**

在 Z.ai 上和 GLM-4.7 对话（小节标题。源文 md 是二级标题，这里改成加粗行，文字不变。）

GLM-4.7 is accessible through [Z.ai](https://z.ai/). Try to change the model option to **GLM-4.7**, if the system does not automatically do that (not like an AGI in that case :))

GLM-4.7 可以在 [Z.ai](https://z.ai/) 上使用。如果系统没有自动切过去，请手动把模型选项改成 **GLM-4.7**（真到那一步，它就不太像 AGI 了：）)

**Serve GLM-4.7 Locally**

本地部署 GLM-4.7（小节标题。源文 md 是二级标题，这里改成加粗行，文字不变。）

Model weights for GLM-4.7 are publicly available on [HuggingFace](https://huggingface.co/zai-org/GLM-4.7) and [ModelScope](https://modelscope.cn/models/ZhipuAI/GLM-4.7). For local deployment, GLM-4.7 supports inference frameworks including vLLM and SGLang. Comprehensive deployment instructions are available in the official GitHub repository.

GLM-4.7 的模型权重已在 [HuggingFace](https://huggingface.co/zai-org/GLM-4.7) 和 [ModelScope](https://modelscope.cn/models/ZhipuAI/GLM-4.7) 公开。本地部署方面，GLM-4.7 支持 vLLM 和 SGLang 等推理框架。完整的部署说明见官方 GitHub 仓库。

> **问：** 本地部署这段给了模型规模吗？「official GitHub repository」 是哪个仓库？
> 没给规模。这段只说权重在 HuggingFace 和 ModelScope 公开，支持 vLLM 和 SGLang，没有参数量，层数，精度格式，也没说要多少显存。「official GitHub repository」 这句没有链接。第 1 页的 GitHub 按钮链到 `github.com/zai-org/GLM-4.5`，第 10 页页脚的 GitHub 图标链到 `github.com/THUDM` 组织主页，两处都不是名为 GLM-4.7 的仓库。HuggingFace 链接两处都是 `huggingface.co/zai-org/GLM-4.7`；ModelScope 链接是 `modelscope.cn/models/ZhipuAI/GLM-4.7`，组织名写的是 ZhipuAI，不是 zai-org。

**Footnotes**

脚注（源文 md 是二级标题，这里改成加粗行，文字不变。）

1: Default settings (most tasks): temperature 1.0, top-p 0.95, max new tokens 131072. For multi-turn agentic tasks (τ²-Bench and Terminal Bench 2), enable Preserved Thinking mode.

1：默认设置（多数任务）：temperature 1.0, top-p 0.95, max new tokens 131072。多轮智能体任务（τ²-Bench 和 Terminal Bench 2）开启 Preserved Thinking 模式。

2: Terminal Bench and SWE-bench Verified settings: temperature 0.7, top-p 1.0, max new tokens 16384.

2: Terminal Bench 和 SWE-bench Verified 的设置：temperature 0.7, top-p 1.0, max new tokens 16384。

3: τ²-Bench settings: temperature 0, max new tokens 16384. For τ²-Bench, we added an extra prompt in the Retail and Telecom interactions to avoid failures caused by users ending the interaction incorrectly; for the Airline domain, we applied the domain fixes proposed in the Claude Opus 4.5 release report.

3: τ²-Bench 的设置：temperature 0, max new tokens 16384。在 τ²-Bench 的 Retail 和 Telecom 交互里，我们额外加了一段提示，避免用户错误地结束交互而导致失败；Airline 领域用了 Claude Opus 4.5 发布报告里提出的领域修正。

> **看表：** 三条脚注对到表里哪几行？有没有说不清的地方？
> 能对上的：脚注 2 管 Terminal Bench 和 SWE-bench Verified，脚注 3 管 τ²-Bench，其余行按脚注 1。说不清的有三处。一是 Terminal Bench 2 同时出现在脚注 1（开 Preserved Thinking）和脚注 2 (temperature 0.7, 16384) 里，应该是两条叠加，原文没写明；脚注 2 的 「Terminal Bench」 包不包括 Terminal Bench Hard，也没写。二是 SWE-bench Multilingual 没被点名，按字面走脚注 1 的默认设置，和 SWE-bench Verified 的设置不同。三是 τ²-Bench 加了额外提示和领域修正，表里 GLM-4.6，Kimi K2 Thinking，DeepSeek-V3.2，Gemini 3.0 Pro 的 τ²-Bench 分数是不是同样设置下得出的，脚注没说。默认 max new tokens 131072 等于 128 × 1024，是生成上限，不是上下文窗口。

<!-- page 10 of 10 -->

Z

Z（页脚左上的大号 Z 字标，被识别成了字母。PDF 里它是图形，md 没有把它收成图片。）

Legal

法律信息

[Privacy Policy](https://chat.z.ai/legal-agreement/privacy-policy)

[隐私政策](https://chat.z.ai/legal-agreement/privacy-policy)

[Terms of Service](https://chat.z.ai/legal-agreement/terms-of-service)

[服务条款](https://chat.z.ai/legal-agreement/terms-of-service)

© 2026 [Z.ai](https://chat.z.ai/) Inc.

© 2026 [Z.ai](https://chat.z.ai/) Inc.（版权行。）

X0

X0（页脚右下角 X 和 GitHub 两个图标被识别成的字符。PDF 里 X 图标链到 `x.com/zai_org`，GitHub 图标链到 `github.com/THUDM`，md 把链接丢了。）

> **对一下：** 19 张图按页数一遍，文件名对得上几张？页脚的 © 2026 和页首的 2025-12-22 矛盾吗？
> 按页是：第 1 页 3 张，第 2 页 8 张，第 6 页 1 张，第 7 页 6 张，第 8 页 1 张，合计 19 张；第 3, 4, 5, 9, 10 页没有图进 md。文件名和画面相符，或者名字泛但不算错的有 13 张：`p01-image.png`，`p02-chart.png` 到 `p02-chart-6.png` 六张，`p02-image.png`，以及第 7 页的 academy-award，worldwide-hit，beloved-story，the-city，characters 五张。另外 6 张是拿相邻文字命名的，和画面对不上：`p01-7-try-...` 是 HuggingFace 图标，`p01-glm-4-7-your-...` 是文档图标，`p02-benchmark-performance-...` 是 BrowseComp 小图，`p06-slides-creation-showcases.png` 是巴黎海报顶部，`p07-explore-zootopia.png` 是幻灯片第 1 页的主图，`p08-call-glm-4-7-api-...` 是思考示意图。年份不矛盾：2025-12-22 是发布日，© 2026 是网页被抓取时的版权行，PDF 生成时间是 2026-09-25；加上第 1 页的 `utm_campaign=glm5_launch`，这份 PDF 是 GLM-5 发布之后抓的网页。
