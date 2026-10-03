---
title: "Claude 3 · 对照译稿"
category: "模型库"
tags: ["Claude", "对照译稿"]
published: true
excerpt: "Claude 3 公开材料的逐段中英对照译稿，附读报告时的疑问块。"
---
<!-- page 1 of 15 -->

AI

AI

# Announcements | 公告

# Introducing the next generation of Claude | 推出新一代 Claude

Mar 4, 2024

2024年3月4日

[Try Claude 3](https://anthropic.com/claude)

[试用 Claude 3](https://anthropic.com/claude)

![Image block](images/p01-today-we-re-announcing-the-claude-3-model-family-which.png)

图注：页首装饰插画。橙色底上是一个白色的人头侧影剪纸，头部中央画着一朵黑线勾勒的放射状花形。图中没有文字和数据。

Today, we're announcing the Claude 3 model family, which sets new industry benchmarks across a wide range of cognitive tasks. The family includes three stateof-the-art models in ascending order of capability: Claude 3 Haiku, Claude 3 Sonnet, and Claude 3 Opus. Each successive model offers increasingly powerful performance, allowing users to select the optimal balance of intelligence, speed, and [cost](https://www.anthropic.com/api#pricing) for their specific application.

今天我们发布 Claude 3 模型家族，它在一系列认知任务上刷新了业界基准。这个家族包含三款业界领先的模型，按能力从低到高依次是 Claude 3 Haiku，Claude 3 Sonnet 和 Claude 3 Opus。每往上一档，性能就更强一些，用户可以按自己的应用场景，在智能，速度和[成本](https://www.anthropic.com/api#pricing)之间挑出最合适的平衡点。

> **想：** 三款模型 「in ascending order of capability」，差别来自参数量，训练数据还是别的什么？
> 页面没说。全文没有参数量，层数，训练 token 数或训练数据的任何描述，能拿来区分三档的只有三样东西：这里的能力排序，第3页的速度描述，第7页到第9页的价格（Opus \$15 | \$75, Sonnet \$3 | \$15, Haiku \$0.25 | \$1.25）。由价格高低去倒推模型大小，在本文里找不到依据。

Opus and Sonnet are now available to use in claude.ai and the Claude API which is now generally available in [159 countries](https://www.anthropic.com/supported-countries). Haiku will be available soon.

Opus 和 Sonnet 现在已经可以在 claude.ai 和 Claude API 中使用，Claude API 也已在 [159 countries](https://www.anthropic.com/supported-countries)（159 个国家）全面开放。Haiku 即将上线。

> **问：** 发布当天 Haiku 还没上线，为什么后面两张评测表里都有 Haiku 的分数？
> 页面没解释评测是在什么时间，用哪个版本跑的。能确认的是，正文三处都把 Haiku 写成未上线：这里的 「Haiku will be available soon」，第9页到第10页 「Model availability」 一节的同一句话，以及云平台 「with Opus and Haiku coming soon」。所以表里 Haiku 那一列是发布前内部跑出的数字，读者当天没法自己复核。第3页还有一句 「Following launch, we expect to improve performance even further」，说的是 Haiku 的速度，并没有说分数会不会跟着变。

<!-- page 2 of 15 -->

Claude 3 model family

Claude 3 模型家族

![Chart block](images/p02-a-new-standard-for-intelligence.png)

图注：散点示意图。纵轴 「INTELLIGENCE / Benchmark scores」，没有刻度；横轴 「COST / Price per million tokens (log scale)」，标出 1 和 10 两个刻度。三个橙色点从左下到右上依次是 Claude 3 Haiku（横坐标不到 1），Claude 3 Sonnet（略低于 10），Claude 3 Opus（10 以上），用一条灰色虚线串起来。

> **核对：** 这张图横轴的 「Price per million tokens」 用的是输入价，输出价，还是两者的某种混合？
> 图和正文都没说。拿第7页到第9页的价格去对：三个点的横坐标都落在各自的输入价和输出价之间，Haiku 在 \$0.25 与 \$1.25 之间，Sonnet 在 \$3 与 \$15 之间，Opus 在 \$15 与 \$75 之间，所以它不是单用输入价或单用输出价画的，混合比例页面没给。纵轴 「Benchmark scores」 没有刻度，也没说是哪几个基准的平均。这张图只能读出三档在价格上的相对位置和 「越贵越强」 的走势，读不出具体分数。

## A new standard for intelligence | 智能的新标准

Opus, our most intelligent model, outperforms its peers on most of the common evaluation benchmarks forAI systems, including undergraduate level expert knowledge (MMLU), graduate level expert reasoning (GPQA), basic mathematics (GSM8K), and more. It exhibits near-human levels of comprehension and fluency on complex tasks, leading the frontier of general intelligence.

Opus 是我们最聪明的模型。在 AI 系统常用的大多数评测基准上，它都胜过同类模型，包括本科水平的专业知识（MMLU），研究生水平的专业推理（GPQA），基础数学（GSM8K）等。在复杂任务上，它的理解力和流畅度接近人类水平，走在通用智能的最前沿。

All [Claude 3](https://www.anthropic.com/claude-3-model-card) models show increased capabilities in analysis and forecasting, nuanced content creation, code generation, and conversing in non-English languages like Spanish, Japanese, and French.

所有 [Claude 3](https://www.anthropic.com/claude-3-model-card) 模型在分析与预测，细腻的内容创作，代码生成，以及用西班牙语，日语，法语等非英语语言对话方面，能力都有提升。

Below is a comparison of the Claude 3 models to those of our peers on multiple benchmarks [1] of capability:

下面是 Claude 3 各模型与同类模型在多个能力基准 [1] 上的对比：

<!-- page 3 of 15 -->

|  | Claude 3 Opus | Claude 3 Sonnet | Claude 3 Haiku | GPT-4 | GPT-3.5 | Gemini 1.0 Ultra | Gemini 1.0 Pro |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Undergraduate level knowledge MMLU | 86.8%5 shot | 79.0%5-shot | 75.2%5-shot | 86.4%5-shot | 70.0%5-shot | 83.7%5-shot | 71.8%5-shot |
| Graduate level reasoning GPQA, Diamond | 50.4%0-shot CoT | 40.4%0-shot CoT | 33.3%0-shot CoT | 35.7%0-shot CoT | 28.1%0-shot CoT | - | - |
| Grade school math GSM8K | 95.0%0-shot CoT | 92.3%0-shot CoT | 88.9%0-shot CoT | 92.0%5-shot CoT | 57.1%5-shot | 94.4%Maj1@32 | 86.5%Maj1@32 |
| Math problem-solving MATH | 60.1%0-shot CoT | 43.1%0-shot CoT | 38.9%0-shot CoT | 52.9%4-shot | 34.1%4-shot | 53.2%4-shot | 32.6%4-shot |
| Multilingual math MGSM | 90.7%0-shot | 83.5%0-shot | 75.1%0-shot | 74.5%8-shot | - | 79.0%8-shot | 63.5%8-shot |
| Code HumanEval | 84.9%0-shot | 73.0%0-shot | 75.9%0-shot | 67.0%0-shot | 48.1%0-shot | 74.4%0-shot | 67.7%0-shot |
| Reasoning over text DROP, F1 score | 83.13-shot | 78.93-shot | 78.43-shot | 80.93-shot | 64.13-shot | 82.4Variable shots | 74.1Variable shots |
| Mixed evaluations BIG-Bench-Hard | 86.8%3-shot CoT | 82.9%3-shot CoT | 73.7%3-shot CoT | 83.1%3-shot CoT | 66.6%3-shot CoT | 83.6%3-shot CoT | 75.0%3-shot CoT |
| Knowledge Q&amp;A ARC-Challenge | 96.4%25-shot | 93.2%25-shot | 89.2%25-shot | 96.3%25-shot | 85.2%25-shot | - | - |
| Common Knowledge HellaSwag | 95.4%10-shot | 89.0%10-shot | 85.9%10-shot | 95.3%10-shot | 85.5%10-shot | 87.8%10-shot | 84.7%10-shot |

表的中文对照（数字与评测设置原样照录）：

|  | Claude 3 Opus | Claude 3 Sonnet | Claude 3 Haiku | GPT-4 | GPT-3.5 | Gemini 1.0 Ultra | Gemini 1.0 Pro |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 本科水平知识 MMLU | 86.8%5 shot | 79.0%5-shot | 75.2%5-shot | 86.4%5-shot | 70.0%5-shot | 83.7%5-shot | 71.8%5-shot |
| 研究生水平推理 GPQA, Diamond | 50.4%0-shot CoT | 40.4%0-shot CoT | 33.3%0-shot CoT | 35.7%0-shot CoT | 28.1%0-shot CoT | - | - |
| 小学数学 GSM8K | 95.0%0-shot CoT | 92.3%0-shot CoT | 88.9%0-shot CoT | 92.0%5-shot CoT | 57.1%5-shot | 94.4%Maj1@32 | 86.5%Maj1@32 |
| 数学解题 MATH | 60.1%0-shot CoT | 43.1%0-shot CoT | 38.9%0-shot CoT | 52.9%4-shot | 34.1%4-shot | 53.2%4-shot | 32.6%4-shot |
| 多语言数学 MGSM | 90.7%0-shot | 83.5%0-shot | 75.1%0-shot | 74.5%8-shot | - | 79.0%8-shot | 63.5%8-shot |
| 代码 HumanEval | 84.9%0-shot | 73.0%0-shot | 75.9%0-shot | 67.0%0-shot | 48.1%0-shot | 74.4%0-shot | 67.7%0-shot |
| 文本推理 DROP，F1 分数 | 83.13-shot | 78.93-shot | 78.43-shot | 80.93-shot | 64.13-shot | 82.4Variable shots | 74.1Variable shots |
| 综合评测 BIG-Bench-Hard | 86.8%3-shot CoT | 82.9%3-shot CoT | 73.7%3-shot CoT | 83.1%3-shot CoT | 66.6%3-shot CoT | 83.6%3-shot CoT | 75.0%3-shot CoT |
| 知识问答 ARC-Challenge | 96.4%25-shot | 93.2%25-shot | 89.2%25-shot | 96.3%25-shot | 85.2%25-shot | - | - |
| 常识 HellaSwag | 95.4%10-shot | 89.0%10-shot | 85.9%10-shot | 95.3%10-shot | 85.5%10-shot | 87.8%10-shot | 84.7%10-shot |

> **看表：** 正文说 Opus 「outperforms its peers on most of the common evaluation benchmarks」，可这张表里 Opus 有没有输的一行？
> 在这张表的 10 行里，Opus 每一行都是最高分，一行也没输。但领先幅度差别很大：GPQA，MATH，MGSM，HumanEval 几行拉开了明显差距，ARC-Challenge 和 HellaSwag 两行只比 GPT-4 高 0.1 个百分点，MMLU 高 0.4。正文用 「most」 而不是 「all」，页面没交代例外指哪一项。可以对照的是脚注 1：表里只放了 「models currently available commercially that have released evals」，尚未发布的 Gemini 1.5 Pro 放在 model card 里比，而且脚注承认优化过提示词的新版 GPT-4T 报过更高的分。「most」 的保留很可能是给这些表外对比留的余地，但这是推断，原文没写。

> **拆开：** 同一行里各家的评测设置不一样，这张表的横向比较是同条件的吗？
> 不是。看 GSM8K 一行：Claude 3 三款都是 0-shot CoT，GPT-4 是 5-shot CoT，GPT-3.5 是 5-shot 且没标 CoT，两款 Gemini 是 Maj1@32，也就是对同一道题采样 32 次再多数表决，属于在 TestingTime 多花算力换准确率。MATH 行 Claude 用 0-shot CoT，其他家用 4-shot；MGSM 行 Claude 用 0-shot，其他家用 8-shot；DROP 行 Gemini 标的是 「Variable shots」。设置完全一致的只有 MMLU，HumanEval，BIG-Bench-Hard，ARC-Challenge，HellaSwag 这几行（GPQA 行 Gemini 空缺）。页面没说这些设置是 Anthropic 自己跑的还是抄各家公布的数字，脚注 1 只说 「released evals」。所以设置不同的几行，差值里混着提示方式的影响，不能全算作模型本身的差距。

> **确认：** DROP 一行写着 「83.13-shot」，这个分数是 83.13 吗？
> 不是。这一行的指标是 「F1 score」，不带百分号，数字后面紧跟着评测设置 「3-shot」，抽取时两者粘在了一起，应读作 83.1 加 3-shot。同一行 Gemini 两格写成 「82.4Variable shots」 和 「74.1Variable shots」，可以看出这一行的分数都保留一位小数。同理 Sonnet 是 78.9，Haiku 是 78.4，GPT-4 是 80.9，GPT-3.5 是 64.1。表格本身按源文原样保留，这里只说明读法。

> **回看：** 第1页说三款 「in ascending order of capability」，表里 Haiku 是不是每一行都垫底？
> 不是每一行。本页 HumanEval 一行，Haiku 的 75.9% 高于 Sonnet 的 73.0%。第4页视觉表里也有类似情况：Chart Q&A 一行 Haiku 最高，Sonnet 次之，Opus 最低；Document visual Q&A 和 AI2D 两行 Sonnet 高于 Opus。「ascending order」 说的是整体定位，对应第2页那张价格与能力的走势图，具体到单个基准，排序会有交叉。页面没有解释这些交叉的原因。

## Near-instant results | 近乎即时的响应

The Claude 3 models can power live customer chats, auto-completions, and data extraction tasks where responses must be immediate and in real-time.

Claude 3 模型可以支撑实时客服对话，自动补全，数据抽取这类要求即时，实时响应的任务。

Haiku is the fastest and most cost-effective model on the market for its intelligence category. It can read an information and data dense research paper on arXiv (\~10k tokens) with charts and graphs in less than three seconds. Following launch, we expect to improve performance even further.

在同一智能档位里，Haiku 是市面上最快，性价比最高的模型。一篇信息和数据都很密集，带图表的 arXiv 研究论文（\~10k tokens），它不到三秒就能读完。上线之后，我们预计还能把性能再往上提。

> **停一下：** 「\~10k tokens ... in less than three seconds」 量的是什么时间？
> 原句的动作是 「read」，页面没说这三秒包括哪些环节：有没有输出，输出多长，是首个 token 的延迟还是整次请求的耗时，在什么硬件和并发条件下测的，都没交代。能换算的只有输入侧，大约每秒三千多个 token 的读入速度。这段还带着 「with charts and graphs」，说明输入里有图，但图在 token 计数里怎么折算，页面也没写。最后一句 「Following launch, we expect to improve performance even further」 说明这个速度是发布前的数字，之后还会变。

For the vast majority of workloads, Sonnet is 2x faster than Claude 2 and Claude 2.1 with higher levels of intelligence. It excels at tasks demanding rapid responses, like knowledge retrieval or sales automation. Opus delivers similar speeds to Claude 2 and 2.1, but with much higher levels of intelligence.

在绝大多数工作负载下，Sonnet 比 Claude 2 和 Claude 2.1 快 2x，智能水平也更高。它擅长需要快速响应的任务，比如知识检索和销售自动化。Opus 的速度与 Claude 2 和 2.1 相近，智能水平则高出很多。

> **再看：** 「Sonnet is 2x faster」 这个倍数有什么限定？
> 限定词在句首：「For the vast majority of workloads」。也就是说，有少数工作负载不到 2x，页面没说是哪些。2x 是相对 Claude 2 和 Claude 2.1 两代旧模型说的，全文没有给出任何一款模型的绝对延迟或每秒 token 数。Opus 则只是 「similar speeds to Claude 2 and 2.1」。把这三句连起来，本页对速度只给出一个相对刻度：Haiku 最快，Sonnet 约为旧款的两倍，Opus 与旧款持平。

<!-- page 4 of 15 -->

## Strong vision capabilities | 强大的视觉能力

The Claude 3 models have sophisticated vision capabilities on par with other leading models. They can process a wide range of visual formats, including photos, charts, graphs and technical diagrams. We’re particularly excited to provide this new modality to our enterprise customers, some of whom have up to 50% of their knowledge bases encoded in various formats such as PDFs, flowcharts, or presentation slides.

Claude 3 模型具备成熟的视觉能力，与其他领先模型相当。它们能处理多种视觉格式，包括照片，图表，曲线图和技术示意图。我们尤其高兴能把这种新模态提供给企业客户，其中一些客户的知识库有多达 50% 是以 PDF，流程图，演示文稿等各种格式保存的。

|  | Claude 3 Opus | Claude 3 Sonnet | Claude 3 Haiku | GPT-4V | Gemini 1.0 Ultra | Gemini 1.0 Pro |
| --- | --- | --- | --- | --- | --- | --- |
| Math &amp; reasoning MMMU (val) | 59.4% | 53.1% | 50.2% | 56.8% | 59.4% | 47.9% |
| Document visual Q&amp;A ANLS score, test | 89.3% | 89.5% | 88.8% | 88.4% | 90.9% | 88.1% |
| Math MathVista (testmini) | 50.5% CoT | 47.9% CoT | 46.4% CoT | 49.9% | 53.0% | 45.2% |
| Science diagrams AI2D, test | 88.1% | 88.7% | 86.7% | 78.2% | 79.5% | 73.9% |
| Chart Q&amp;A Relaxed accuracy (test) | 80.8% 0-shot CoT | 81.1% 0-shot CoT | 81.7% 0-shot CoT | 78.5% 4-shot CoT | 80.8% | 74.1% |

表的中文对照（数字与评测设置原样照录）：

|  | Claude 3 Opus | Claude 3 Sonnet | Claude 3 Haiku | GPT-4V | Gemini 1.0 Ultra | Gemini 1.0 Pro |
| --- | --- | --- | --- | --- | --- | --- |
| 数学与推理 MMMU (val) | 59.4% | 53.1% | 50.2% | 56.8% | 59.4% | 47.9% |
| 文档视觉问答 ANLS 分数，test | 89.3% | 89.5% | 88.8% | 88.4% | 90.9% | 88.1% |
| 数学 MathVista (testmini) | 50.5% CoT | 47.9% CoT | 46.4% CoT | 49.9% | 53.0% | 45.2% |
| 科学图表 AI2D, test | 88.1% | 88.7% | 86.7% | 78.2% | 79.5% | 73.9% |
| 图表问答 Relaxed accuracy (test) | 80.8% 0-shot CoT | 81.1% 0-shot CoT | 81.7% 0-shot CoT | 78.5% 4-shot CoT | 80.8% | 74.1% |

> **对一下：** 文字部分说 Opus 在上一张表里 「outperforms its peers」，到视觉这里为什么改口成 「on par with other leading models」？
> 因为这张表的数字撑不起 「outperform」。5 行里，Gemini 1.0 Ultra 在 Document visual Q&A 和 MathVista 两行高于三款 Claude，MMMU 一行与 Opus 并列 59.4%，Chart Q&A 一行与 Opus 并列 80.8%. Claude 明显领先的只有 AI2D 一行。另外这张表没有 GPT-3.5 列，对比对象换成了 GPT-4V；MathVista 行只有 Claude 标了 CoT，Chart Q&A 行 Claude 是 0-shot CoT，GPT-4V 是 4-shot CoT，Gemini 两格没标设置。用词和数据是对得上的：视觉能力是 「相当」，不是 「领先」。

## Fewer refusals | 更少的拒答

Previous Claude models often made unnecessary refusals that suggested a lack of contextual understanding. We’ve made meaningful progress in this area: Opus, Sonnet, and Haiku are significantly less likely to refuse to answer prompts that border on the system’s guardrails than previous generations of models. As shown below, the Claude 3 models show a more nuanced understanding of requests, recognize real harm, and refuse to answer harmless prompts much less often.

以前的 Claude 模型常常做出不必要的拒答，显得对上下文理解不够。我们在这方面取得了实质进展：面对那些贴近系统防护边界的提示，Opus，Sonnet 和 Haiku 拒答的可能性比前几代模型明显更低。如下图所示，Claude 3 模型对请求的理解更细致，能识别真正的危害，对无害提示的拒答也少得多。

<!-- page 5 of 15 -->

Incorrect refusals

错误拒答

![Chart block](images/p05-improved-accuracy.png)

图注：柱状图，纵轴 「Refused on harmless prompts」，刻度 10%, 20%, 30%。四根柱子从左到右是 Claude 3 Opus, Claude 3 Sonnet, Claude 3 Haiku（橙色）和 Claude 2.1（灰色）。目测三款 Claude 3 都在 10% 上下，Haiku 最低，不到 10%；Claude 2.1 在 25% 左右。图上没有标数值。

> **想：** 这张图的文件名叫 「improved-accuracy」，画的却是拒答率，是不是放错了图？
> 图没放错，是文件名错位。抽取工具给图片取名时用了紧随其后的标题 「## Improved accuracy」，画面内容对应的是上方 「Fewer refusals」 一节和图题 「Incorrect refusals」。同样的错位在本页还有一次：下一张 p05-long-context-and-near-perfect-recall 画的是准确率，第6页的 p06-responsible-design 画的是 NIAH 热力图。至于图本身，页面没交代 「harmless prompts」 题集有多少题，从哪来，怎么判定 「harmless」，图上也不标数值。能读出的只是相对关系：三款 Claude 3 的错误拒答率大致不到 Claude 2.1 的一半，Haiku 最低。正文说的 「previous generations」 在图里只画了 Claude 2.1 一款。

## Improved accuracy | 更高的准确率

Businesses of all sizes rely on our models to serve their customers, making it imperative for our model outputs to maintain high accuracy at scale. To assess this, we use a large set of complex, factual questions that target known weaknesses in current models. We categorize the responses into correct answers, incorrect answers (or hallucinations), and admissions of uncertainty, where the model says it doesn’t know the answer instead of providing incorrect information. Compared to Claude 2.1, Opus demonstrates a twofold improvement in accuracy (or correct answers) on these challenging open-ended questions while also exhibiting reduced levels of incorrect answers.

各种规模的企业都靠我们的模型服务客户，所以模型输出必须在大规模使用时保持高准确率。为了评估这一点，我们用了一大批复杂的事实性问题，专门瞄准当前模型已知的弱点。我们把回答分成三类：正确答案，错误答案（即幻觉），以及承认不确定，也就是模型说自己不知道，而不是给出错误信息。与 Claude 2.1 相比，在这些有难度的开放式问题上，Opus 的准确率（即正确答案比例）提高到两倍，错误答案的比例也降低了。

> **问：** 「twofold improvement in accuracy」 是怎么来的，错误答案降了多少？
> 下方那张 「Hard questions」 图可以对上（文件名是 p05-long-context-and-near-perfect-recall，原因见上一条）。目测 Opus 答对约 46%，Claude 2.1 约 22%，确实是两倍左右；答错一栏 Opus 约 34%，Claude 2.1 约 42%，只降了几个百分点；降得最多的是 「I don't know / Unsure」 一栏，从约 31% 降到约 19%。每个模型的三栏相加都接近 100%。也就是说，Opus 多答对的部分，相当一部分来自不再说 「不知道」，而不全是从答错里挪过来的。还要注意题集是 「target known weaknesses in current models」 挑出来的，页面没给题数和来源，46% 这个绝对值不能拿去和其他基准比。

In addition to producing more trustworthy responses, we will soon enable citations in our Claude 3 models so they can point to precise sentences in reference material to verify their answers.

除了给出更可信的回答，我们很快还会在 Claude 3 模型中启用引用功能，让模型能指出参考材料里的具体句子，用来核实答案。

![Chart block](images/p05-long-context-and-near-perfect-recall.png)

图注：分组柱状图，标题 「Hard questions」，纵轴 「Percent of question set」，刻度 20%, 40%, 60%。横轴三组：Correct, Incorrect，「I don't know」 / Unsure；每组左边橙色是 Claude 3 Opus，右边灰色是 Claude 2.1。目测 Correct 组 Opus 约 46%，Claude 2.1 约 22%；Incorrect 组约 34% 对 42%；Unsure 组约 19% 对 31%。图上没有标数值。

<!-- page 6 of 15 -->

## Long context and near-perfect recall | 长上下文与近乎完美的召回

The Claude 3 family of models will initially offer a 200K context window upon launch. However, all three models are capable of accepting inputs exceeding 1 million tokens and we may make this available to select customers who need enhanced processing power.

Claude 3 家族在发布时先提供 200K 的上下文窗口。不过三款模型都能接受超过 1 million tokens（100 万 token）的输入，我们可能会向有更强处理需求的特定客户开放这一能力。

> **核对：** 「all three models are capable of accepting inputs exceeding 1 million tokens」，页面有没有给出 1M 长度下的效果？
> 没有。本页唯一的长上下文图（p06-responsible-design）标题是 「Recall accuracy over 200K」，横轴最长到 200k，没有一格超过 200K. 第7页到第9页的三张模型卡里，只有 Opus 的 「200K\*」 带星号，脚注 「\*1M tokens available for specific use cases, please inquire.」 也挂在 Opus 那一段后面；Sonnet 和 Haiku 的上下文窗口都只写 「200K」，没有星号。这和本段 「all three models」 的说法有出入，页面没解释。按本文，1M 只是 「capable of accepting」，发布时对外的是 200K。

To process long context prompts effectively, models require robust recall capabilities. The 'Needle In A Haystack' (NIAH) evaluation measures a model's ability to accurately recall information from a vast corpus of data. We enhanced the robustness of this benchmark by using one of 30 random needle/question pairs per prompt and testing on a diverse crowdsourced corpus of documents. Claude 3 Opus not only achieved near-perfect recall, surpassing 99% accuracy, but in some cases, it even identified the limitations of the evaluation itself by recognizing that the "needle" sentence appeared to be artificially inserted into the original text by a human.

要有效处理长上下文提示，模型需要稳健的召回能力。「大海捞针」（Needle In A Haystack, NIAH）评测衡量的是模型从海量语料中准确找回信息的能力。我们对这个基准做了加固：每个提示从 30 组随机的 needle/问题对中取一组，并在众包收集的多样化文档语料上测试。Claude 3 Opus 不仅做到了近乎完美的召回，准确率超过 99%，而且在某些情况下，它甚至指出了评测本身的局限：它认出那句 「needle」 看起来是人为插进原文的。

> **拆开：** NIAH 这里说的 「surpassing 99% accuracy」，和下面热力图是什么关系？
> 热力图是 Opus 在 16 个上下文长度（12k 到 200k）乘 15 个 needle 位置（6% 到 94%）上的召回准确率，图题注明 「averaged over many diverse document sources and 'needle' sentences」。色阶从 0（红）到 1（绿），绝大多数格子是深绿，少数格子颜色偏浅，多落在 needle 位置 12% 到 31% 这几行和 75k 以后的列，其余位置只有零星几格。页面没给每格的数值，99% 应当是整张图的总体平均，不是每一格都过 99%。加固手段页面写了两条：每个提示随机取 30 组 needle/问题对之一，语料换成众包的多样文档。页面没写每格跑了多少次。

> **确认：** Opus 「identified the limitations of the evaluation itself」，页面给了具体例子吗？
> 没给。原文只有一句概述：「in some cases」，它认出 needle 句子 「appeared to be artificially inserted into the original text by a human」。出现了几次，在哪个长度，模型原话怎么说，页面都没写。这件事说明的是 NIAH 的题面有明显破绽：needle 与上下文不连贯，能被模型察觉。它不是一个召回指标，不能和 99% 那个数字放在一起算。

![Chart block](images/p06-responsible-design.png)

图注：热力图，标题 「Claude 3 Opus / Recall accuracy over 200K」，副标题 「(averaged over many diverse document sources and 'needle' sentences)」。纵轴 「Needle position (%)」，从上到下 6, 12, 19, 25, 31, 38, 44, 50, 56, 62, 69, 75, 81, 88, 94；横轴 「Context length」，12k, 25k, 38k, 50k, 62k, 75k, 88k, 100k, 112k, 125k, 138k, 150k, 162k, 175k, 188k, 200k. 右侧色条从 0（红）经黄到 1（绿）。几乎全部格子为深绿，零星几格浅绿。文件名 responsible-design 取自下一节标题，与画面无关。

## Responsible design | 负责任的设计

We’ve developed the Claude 3 family of models to be as trustworthy as they are capable. We have several dedicated teams that track and mitigate a broad spectrum of risks, ranging from misinformation and CSAM to biological misuse, election interference, and autonomous replication skills. We continue to develop methods such as [Constitutional AI](https://www.anthropic.com/news/constitutional-ai-harmlessness-from-ai-feedback) that improve the safety and transparency of our models, and have tuned our models to mitigate against privacy issues that could be raised by new modalities.

我们希望 Claude 3 家族既有能力，也同样值得信赖。我们有几支专门团队，追踪并缓解一系列风险，从虚假信息，CSAM（儿童性虐待材料），到生物滥用，选举干预和自主复制能力。我们持续开发 [Constitutional AI](https://www.anthropic.com/news/constitutional-ai-harmlessness-from-ai-feedback) 这类方法，提升模型的安全性和透明度，也对模型做了调整，以缓解新模态可能带来的隐私问题。

> **回看：** 这里提到 Constitutional AI，能不能说 Claude 3 就是用 Constitutional AI 训练的？有没有 RLHF 或 PPO?
> 原句是 「We continue to develop methods such as Constitutional AI that improve the safety and transparency of our models」，讲的是 Anthropic 在持续开发这类方法，没有说 Claude 3 的后训练具体用了哪一步。全文没有出现 RLHF，PPO，奖励模型或偏好数据这些词。「have tuned our models to mitigate against privacy issues」 也只说调过，没说怎么调。按本文，Constitutional AI 和 Claude 3 的关系只能写成 「同一家公司在推进的安全方法」，写成训练配方就超出了页面。

<!-- page 7 of 15 -->

Addressing biases in increasingly sophisticated models is an ongoing effort and we’ve made strides with this new release. As shown in the model card, Claude 3 shows less biases than our previous models according to the [Bias Benchmark for Question Answering (BBQ)](https://aclanthology.org/2022.findings-acl.165/). We remain committed to advancing techniques that reduce biases and promote greater neutrality in our models, ensuring they are not skewed towards any particular partisan stance.

模型越来越复杂，处理偏见是一项持续的工作，这次发布在这方面有了进展。正如 model card 所示，按 [Bias Benchmark for Question Answering (BBQ)](https://aclanthology.org/2022.findings-acl.165/) 的结果，Claude 3 的偏见比我们之前的模型更少。我们会继续推进减少偏见，提升中立性的技术，确保模型不偏向任何党派立场。

While the Claude 3 model family has advanced on key measures of biological knowledge, cyber-related knowledge, and autonomy compared to previous models, it remains at AI Safety Level 2 (ASL-2) per our [Responsible Scaling Policy](https://www.anthropic.com/news/anthropics-responsible-scaling-policy). Our [red teaming](https://www.anthropic.com/news/red-teaming-language-models-to-reduce-harms-methods-scaling-behaviors-and-lessons-learned) evaluations (performed in line with our [White House commitments](https://www.whitehouse.gov/briefing-room/statements-releases/2023/07/21/fact-sheet-biden-harris-administration-secures-voluntary-commitments-from-leading-artificial-intelligence-companies-to-manage-the-risks-posed-by-ai/) and the [2023 US Executive Order](https://www.whitehouse.gov/briefing-room/statements-releases/2023/10/30/fact-sheet-president-biden-issues-executive-order-on-safe-secure-and-trustworthy-artificial-intelligence/)) have concluded that the models present negligible potential for catastrophic risk at this time. We will continue to carefully monitor future models to assess their proximity to the ASL-3 threshold. Further safety details are available in the [Claude 3 model card](https://www.anthropic.com/claude-3-model-card).

与之前的模型相比，Claude 3 家族在生物知识，网络安全相关知识和自主性等关键指标上都有进步，但按照我们的 [Responsible Scaling Policy](https://www.anthropic.com/news/anthropics-responsible-scaling-policy)，它仍处于 AI 安全等级 2 (ASL-2)。我们的[红队](https://www.anthropic.com/news/red-teaming-language-models-to-reduce-harms-methods-scaling-behaviors-and-lessons-learned)评估（按照我们的[白宫承诺](https://www.whitehouse.gov/briefing-room/statements-releases/2023/07/21/fact-sheet-biden-harris-administration-secures-voluntary-commitments-from-leading-artificial-intelligence-companies-to-manage-the-risks-posed-by-ai/)和 [2023 US Executive Order](https://www.whitehouse.gov/briefing-room/statements-releases/2023/10/30/fact-sheet-president-biden-issues-executive-order-on-safe-secure-and-trustworthy-artificial-intelligence/)（2023 年美国行政令）进行）得出结论：目前这些模型造成灾难性风险的可能性微乎其微。我们会继续密切关注未来的模型，评估它们离 ASL-3 门槛还有多远。更多安全细节见 [Claude 3 model card](https://www.anthropic.com/claude-3-model-card)。

> **停一下：** 生物，网络和自主性三项都 「advanced」，为什么仍定为 ASL-2? ASL-3 的门槛是什么？
> 页面只给了结论和依据的来源，没给判定标准。依据是红队评估的结论 「negligible potential for catastrophic risk at this time」，分级规则挂在 Responsible Scaling Policy 的链接里，ASL-3 门槛具体是什么，这三项各测到什么程度，本页都没写，统一指向 model card。这一段能读出的逻辑是：「能力比上一代强」 和 「达到下一安全等级」 是两回事，前者是相对进步，后者要跨过 RSP 定义的门槛，Anthropic 判断 Claude 3 还没跨过去。同段的 BBQ 偏见结论也是一样，只说 「less biases than our previous models」，分数在 model card 里。

## Easier to use | 更易用

The Claude 3 models are better at following complex, multi-step instructions. They are particularly adept at adhering to brand voice and response guidelines, and developing customer-facing experiences our users can trust. In addition, the Claude 3 models are better at producing popular structured output in formats like JSON— making it simpler to instruct Claude for use cases like natural language classification and sentiment analysis.

Claude 3 模型更擅长遵循复杂的多步指令。它们尤其善于贴合品牌语气和回复规范，帮用户打造值得信赖的面向客户的体验。此外，Claude 3 模型更擅长输出 JSON 这类常用的结构化格式，让自然语言分类，情感分析这类场景更容易通过指令交给 Claude 完成。

## Model details | 模型详情

Claude 3 Opus is our most intelligent model, with best-in-market performance on highly complex tasks. It can navigate open-ended prompts and sight-unseen scenarios with remarkable fluency and human-like understanding. Opus shows us the outer limits of what’s possible with generative AI.

Claude 3 Opus 是我们最聪明的模型，在高度复杂的任务上表现居市场之首。面对开放式提示和从未见过的场景，它能以出色的流畅度和类人的理解力应对。Opus 让我们看到了生成式 AI 目前能力的外沿。

Cost

成本

[Input \$/million tokens | Output \$/million tokens]

[输入 \$/百万 tokens | 输出 \$/百万 tokens]

\$15 | \$75

\$15 | \$75

Context window

上下文窗口

<!-- page 8 of 15 -->

200K\*

200K\*

### Potential uses | 潜在用途

Task automation: plan and execute complex actions across APIs and databases, interactive coding

任务自动化：跨 API 和数据库规划并执行复杂操作，交互式编程

R&D: research review, brainstorming and hypothesis generation, drug discovery

研发：研究综述，头脑风暴与假设生成，药物发现

Strategy: advanced analysis of charts & graphs, financials and market trends, forecasting

战略：深入分析图表，财务与市场趋势，预测

### Differentiator | 差异化优势

Higher intelligence than any other model available.

智能水平高于目前可用的任何其他模型。

data

（data：网页卡片里的残留字样，原页没有对应的正文含义，不译。第9页的两处同此。）

\*1M tokens available for specific use cases, please inquire.

\*特定用例可使用 1M tokens，请咨询。

Claude 3 Sonnet strikes the ideal balance between intelligence and speed— particularly for enterprise workloads. It delivers strong performance at a lower cost compared to its peers, and is engineered for high endurance in large-scale AI deployments.

Claude 3 Sonnet 在智能与速度之间取得了理想的平衡，尤其适合企业级工作负载。与同类模型相比，它以更低的成本提供强劲的性能，并且为大规模 AI 部署下的长时间高负荷运行而设计。

### Cost | 成本

[Input \$/million tokens | Output \$/million tokens]

[输入 \$/百万 tokens | 输出 \$/百万 tokens]

\$3 | \$15

\$3 | \$15

Context window

上下文窗口

200K

200K

### Potential uses | 潜在用途

Data processing: RAG or search & retrieval over vast amounts of knowledge

数据处理：在海量知识上做 RAG 或搜索与检索

<!-- page 9 of 15 -->

Sales: product recommendations, forecasting, targeted marketing

销售：产品推荐，预测，精准营销

Time-saving tasks: code generation, quality control, parse text from images

节省时间的任务：代码生成，质量控制，从图像中解析文字

### Differentiator | 差异化优势

More affordable than other models with similar intelligence; better for scale.

比智能水平相近的其他模型更实惠，更适合规模化使用。

data

Claude 3 Haiku is our fastest, most compact model for near-instant responsiveness. It answers simple queries and requests with unmatched speed. Users will be able to build seamless AI experiences that mimic human interactions.

Claude 3 Haiku 是我们最快，最紧凑的模型，响应近乎即时。它回答简单查询和请求的速度无可匹敌。用户可以用它打造流畅，接近真人互动的 AI 体验。

### Cost | 成本

[Input \$/million tokens | Output \$/million tokens]

[输入 \$/百万 tokens | 输出 \$/百万 tokens]

\$0.25 | \$1.25

\$0.25 | \$1.25

> **再看：** 三张模型卡的价格之间有什么规律？
> 三款的输出价都正好是输入价的 5 倍：\$15 对 \$75，\$3 对 \$15，\$0.25 对 \$1.25。档与档之间，Opus 是 Sonnet 的 5 倍，Sonnet 是 Haiku 的 12 倍，Opus 与 Haiku 相差 60 倍，输入输出同比例。这和第2页那张对数横轴的图对得上：Haiku 到 Sonnet 的横向间距比 Sonnet 到 Opus 更宽，正好对应 12 倍和 5 倍。页面没说定价依据什么，也没说批量，缓存之类的折扣；Haiku 的 「most compact」 是全文唯一带 「大小」 意味的词，同样没给规模数字。另外，这里的 「Cost」 是 API 按 token 计价，与第10页 claude.ai 免费版和 Claude Pro 订阅是两套收费方式。

### Context window | 上下文窗口

200K

200K

### Potential uses | 潜在用途

Customer interactions: quick and accurate support in live interactions, translations

客户互动：在实时互动中提供快速准确的支持，翻译

Content moderation: catch risky behavior or customer requests

内容审核：识别有风险的行为或客户请求

Cost-saving tasks: optimized logistics, inventory management, extract knowledge from unstructured data

节省成本的任务：物流优化，库存管理，从非结构化数据中提取知识

### Differentiator | 差异化优势

Smarter, faster, and more affordable than other models in its intelligence category.

在同一智能档位的模型中，更聪明，更快，也更实惠。

data

## Model availability | 模型可用性

Opus and Sonnet are available to use today in ourAPI, which is now generally available, enabling developers to sign up and start using these models immediately.

Opus 和 Sonnet 今天起即可在我们的 API 中使用。API 现已全面开放，开发者可以马上注册并开始使用这些模型。

<!-- page 10 of 15 -->

Haiku will be available soon. Sonnet is powering the free experience on claude.ai, with Opus available for Claude Pro subscribers.

Haiku 即将上线。claude.ai 的免费版由 Sonnet 驱动，Opus 则向 Claude Pro 订阅用户开放。

Sonnet is also available today through Amazon Bedrock and in private preview on Google Cloud’s Vertex AI Model Garden—with Opus and Haiku coming soon to both.

今天起，Sonnet 也可以通过 Amazon Bedrock 使用，并在 Google Cloud 的 Vertex AI Model Garden 开放私测；Opus 和 Haiku 也即将登陆这两个平台。

## Smarter, faster, safer | 更聪明，更快，更安全

We do not believe that model intelligence is anywhere near its limits, and we plan to release frequent updates to the Claude 3 model family over the next few months. We're also excited to release a series of features to enhance our models' capabilities, particularly for enterprise use cases and large-scale deployments. These new features will include Tool Use (aka function calling), interactive coding (aka REPL), and more advanced agentic capabilities.

我们不认为模型智能已经接近极限，并计划在接下来几个月里频繁更新 Claude 3 家族。我们也很期待推出一系列增强模型能力的功能，尤其面向企业用例和大规模部署。这些新功能将包括 Tool Use（即 function calling，函数调用），交互式编程（即 REPL），以及更高级的 agent 能力。

> **对一下：** 发布当天 Claude 3 能不能调用工具，有没有引用功能？
> 都还不能。本段用的是将来时 「These new features will include Tool Use (aka function calling), interactive coding (aka REPL), and more advanced agentic capabilities「；第5页的引用功能也是 」we will soon enable citations「。发布当天已经具备的，是第7页 」Easier to use「 说的更好的多步指令遵循和 JSON 等结构化输出。另外，第8页 Opus 模型卡的潜在用途里写了 」plan and execute complex actions across APIs and databases, interactive coding「，和这里 」will include」 放在一起读，说明模型卡写的是设想的用途，相应功能当时还在路上。

As we push the boundaries ofAI capabilities, we’re equally committed to ensuring that our safety guardrails keep apace with these leaps in performance. Our hypothesis is that being at the frontier ofAI development is the most effective way to steer its trajectory towards positive societal outcomes.

在不断拓展 AI 能力边界的同时，我们同样致力于让安全防护跟上性能的跃升。我们的假设是：站在 AI 发展的前沿，是引导它走向积极社会结果的最有效方式。

We’re excited to see what you create with Claude 3 and hope you will give us feedback to make Claude an even more useful assistant and creative companion. To start building with Claude, visit [anthropic.com/claude](https://www.anthropic.com/claude).

我们很期待看到你用 Claude 3 创造出什么，也希望你给我们反馈，让 Claude 成为更有用的助手和创作伙伴。想开始用 Claude 构建应用，请访问 [anthropic.com/claude](https://www.anthropic.com/claude)。

## Footnotes | 脚注

1. This table shows comparisons to models currently available commercially that have released evals. Our model card shows comparisons to models that have been announced but not yet released, such as Gemini 1.5 Pro. In addition, we’d like to note that engineers have worked to optimize prompts and few-shot samples for evaluations and reported higher scores for a newer GPT-4T model. [Source](https://github.com/microsoft/promptbase).

1. 这张表对比的是目前已商用且公布了评测结果的模型。我们的 model card 里还对比了已宣布但尚未发布的模型，比如 Gemini 1.5 Pro。另外需要说明，有工程师针对评测优化了提示词和 few-shot 样例，并报告了新版 GPT-4T 模型的更高分数。[来源](https://github.com/microsoft/promptbase)。

> **想：** 第3页表里的 「GPT-4」 一列是哪个版本？脚注说的 GPT-4T 更高分为什么不放进表？
> 表头只写 「GPT-4」，页面没标版本或日期。脚注给了两条筛选规则：只放 「currently available commercially that have released evals」 的模型，所以尚未发布的 Gemini 1.5 Pro 放到 model card 里；GPT-4T 的更高分来自工程师 「optimize prompts and few-shot samples」，出处是 microsoft/promptbase。脚注把这件事点出来却没把数字放进表，意思是那组分数的提示方式与表中不同。这和第3页评测设置不一致的问题是同一类：提示方式本身会改变分数，看这张表时要把它算进去。

![Image block](images/p10-related-content.png)

图注：社交分享图标，左边是 X 的标志，右边是 LinkedIn 的 「in」 标志。没有其他文字。文件名 related-content 取自下一节标题。

## Related content | 相关内容

<!-- page 11 of 15 -->

![Image block](images/p11-image.png)

图注：一个灰色的向右箭头图标，是推荐卡片上的跳转箭头。本页另外两张 p11-claude-discovers-... 和 p11-partnering-with-accenture-... 也是同样的箭头。

![Image block](images/p11-claude-discovers-a-novel-enzyme-system-with-crispr-like.png)

### Claude discovers a novel enzyme system with CRISPR-like repeats | Claude 发现一种带有类 CRISPR 重复序列的新型酶系统

We’re announcing a new life sciences research group and laboratory at Anthropic. This post introduces the team behind this work and shares early results in which Claude discovered a novel enzyme system with properties reminiscent of CRISPR, with only high-level direction from our scientists.

我们宣布在 Anthropic 成立新的生命科学研究组和实验室。这篇文章介绍这项工作背后的团队，并分享早期结果：科学家只给了高层方向，Claude 就发现了一种新型酶系统，其性质让人想起 CRISPR。

[Read more](https://www.anthropic.com/news/claude-discovers-novel-enzyme-system)

[阅读更多](https://www.anthropic.com/news/claude-discovers-novel-enzyme-system)

![Image block](images/p11-partnering-with-accenture-on-embedded-evaluation.png)

### Partnering with Accenture on embedded evaluation | 与 Accenture 合作开展嵌入式评估

[Read more](https://www.anthropic.com/news/accenture-embedded-evaluation)

[阅读更多](https://www.anthropic.com/news/accenture-embedded-evaluation)

### Introducing the Life Sciences Verification Program | 推出生命科学验证计划

The Life Sciences Verification Program (LSVP) gives life science professionals access to Claude Mythos, Opus, and Sonnet models with a refined set of safeguards more permissive for biology-related work.

生命科学验证计划（LSVP）向生命科学专业人员开放 Claude Mythos，Opus 和 Sonnet 模型，并配套一套经过细化，对生物相关工作更宽松的防护措施。

[Read more](https://www.anthropic.com/news/life-sciences-verification-program)

[阅读更多](https://www.anthropic.com/news/life-sciences-verification-program)

> **问：** 2024年3月4日 的公告里，为什么会出现 Claude Mythos 和生命科学实验室？
> 因为这份 PDF 是后来抓取的网页快照。「Related content」 下的三条推荐，以及第11页到第15页的站点导航和页脚，都是抓取当时的页面内容，页脚写着 「© 2026 Anthropic PBC」。属于 Claude 3 发布公告的，只有第1页到第10页脚注为止。顺带一提，这里的 「Opus, and Sonnet」 指的是快照当时的模型系列，不是本文的 Claude 3 Opus 和 Claude 3 Sonnet。同理，第6页到第7页正文里提到的 Responsible Scaling Policy 链接是 anthropics-responsible-scaling-policy，页脚那条则是 announcing-our-updated-responsible-scaling-policy，两者不是同一篇。

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

产品：Claude, Claude Code, Claude Code Enterprise（Claude Code 企业版），Claude Cowork, @Claude, Claude Design, Claude Science, Claude Security, Claude in Chrome（Chrome 里的 Claude），Claude for Microsoft 365（面向 Microsoft 365 的 Claude），Skills（技能），Download app（下载应用）。

![Image block](images/p11-pricing-https-claude-com-pricing.png)

图注：页脚截图，黑底白字。左上是 Anthropic 标志，下面是 Products 一栏，从 Claude 到 Download app 共 12 项，与上方列表一致。文件名取自紧随其后的 Pricing 链接，画面里并没有价格。

<!-- page 12 of 15 -->

## [Pricing](https://claude.com/pricing)

[Log in to Claude](https://claude.ai/)

定价（Pricing），登录 Claude (Log in to Claude)。这里的 Pricing 是快照当时的站点入口，与第7页到第9页的 Claude 3 价格不是一回事。

Models

[Mythos](https://www.anthropic.com/claude/mythos)

[Fable](https://www.anthropic.com/claude/fable)

[Opus](https://www.anthropic.com/claude/opus)

[Sonnet](https://www.anthropic.com/claude/sonnet)

[Haiku](https://www.anthropic.com/claude/haiku)

模型：Mythos, Fable, Opus, Sonnet, Haiku。这五个都是模型系列名，保留原文。

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

解决方案：AI agents（AI 智能体），Code modernization（代码现代化），Coding（编程），Commerce（商业），Customer support（客户支持），Cybersecurity（网络安全），Enterprise（企业），Financial services（金融服务），Government（政府），Healthcare（医疗），Higher education（高等教育），K-12 teachers（K-12 教师），Legal（法律），Life sciences（生命科学），Nonprofits（非营利组织），Sales（销售），Small business（小企业）。

Claude Platform

[Overview](https://claude.com/platform/api)

Claude 平台：Overview（概览）。

<!-- page 13 of 15 -->

## [Developer docs](https://platform.claude.com/docs)

[Pricing](https://claude.com/pricing#api)

[Ecosystem](https://claude.com/ecosystem)

[Marketplace](https://claude.com/platform/marketplace)

[Regional compliance](https://claude.com/regional-compliance)

[Claude on AWS](https://claude.com/partners/claude-on-aws)

[Google Cloud](https://claude.com/partners/google-cloud-vertex-ai)

[Microsoft Foundry](https://claude.com/partners/microsoft-foundry)

[Console login](https://platform.claude.com/)

Claude 平台（续）：Developer docs（开发者文档），Pricing（定价），Ecosystem（生态），Marketplace（应用市场），Regional compliance（区域合规），Claude on AWS（AWS 上的 Claude），Google Cloud, Microsoft Foundry, Console login（控制台登录）。

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

资源：Blog（博客），Claude partner network（Claude 合作伙伴网络），Community（社区），Connectors（连接器），Courses（课程），Customer stories（客户案例），Developer blog（开发者博客），Engineering at Anthropic（Anthropic 工程博客），Events（活动），Plugins（插件），Powered by Claude（由 Claude 驱动），Service partners（服务合作伙伴），Tutorials（教程），Use cases（使用案例）。

Programs

[Startups](https://claude.com/programs/startups)

[Scientists](https://claude.com/programs/team-plan-for-scientists)

计划：Startups（初创公司），Scientists（科学家）。

Help and security

帮助与安全

<!-- page 14 of 15 -->

## [Availability](https://www.anthropic.com/supported-countries)

[Status](https://status.anthropic.com/)

[Support center](https://support.claude.com/en/)

帮助与安全（续）：Availability（可用地区），Status（服务状态），Support center（支持中心）。

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

公司：Anthropic, Careers（招聘），Leadership（管理团队），Policy（政策），Economic Futures（经济未来），Research（研究），News（新闻），Claude’s Constitution（Claude 宪章），Claude Corps, Keep thinking（继续思考），Policy on the AI Exponential（关于 AI 指数级发展的政策），Responsible Scaling Policy（保留原名），Security and compliance（安全与合规），Transparency（透明度）。

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

条款与政策：Privacy choices（隐私选项），Privacy policy（隐私政策），Consumer health data privacy policy（消费者健康数据隐私政策），Responsible disclosure policy（负责任披露政策），Terms of service: Commercial（服务条款：商业版），Terms of service: Consumer（服务条款：消费者版），Terms of Service: US K-12（服务条款：美国 K-12），Data Processing Agreement: US K-12（数据处理协议：美国 K-12），Usage policy（使用政策）。

<!-- page 15 of 15 -->

XO

（XO：抽取残留的两个字母，原页没有对应的正文含义，不译。）

© 2026 Anthropic PBC

© 2026 Anthropic PBC，版权所有。
