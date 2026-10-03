<!-- page 1 of 9 -->

三 Google DeepMind

≡ Google DeepMind (页首的 「三」 是菜单图标 ≡ 被识别成了汉字, PDF 截图里是一个三道横线的按钮)

# Our state-of-the-art, experimental text diffusion model

# 我们最先进的实验性文本扩散模型

Gemini Diffusion

Gemini Diffusion (产品名, 在页面上是大标题上方的一行小字)

> **想:** 标题里 「state-of-the-art」 和 「experimental」 挨着写, 一个说最先进, 一个说还在实验, 这是同一句话里的两个判断, 还是一回事?
> 页面没有解释 「state-of-the-art」 比的是谁. 全文唯一的对照对象是第 5, 6 页表里的 Gemini 2.0 Flash-Lite, 而且十行里有六行 Gemini Diffusion 分数更低. 所以 「最先进」 只能读成 「在 Google 自家的文本扩散模型里最先进」, 这层范围标题没写出来; 「experimental」 则在第 7 页有明确落点: 当前以实验性演示开放.

Large-language models are the foundation of generative AI today. We’re using a technique called diffusion to explore a new kind of language model that gives users greater control, creativity, and speed in text generation.

大语言模型是当今生成式 AI 的基础. 我们正在用一种叫作扩散 (diffusion) 的技术, 探索一种新型语言模型, 让用户在文本生成中获得更强的控制力, 更多的创造力和更快的速度.

> **问:** 这一段许诺了三样东西: control, creativity, speed. 后面几页各自对上了哪一样?
> 只有 speed 有下文: 第 3 页 「Rapid response」 一张卡片, 第 6 页一张速度表. control 和 creativity 在后文再没出现过, 没有一张卡片, 一个例子或一个数字对应它们. 第 2 页说扩散模型擅长 「editing」, 算是离 「control」 最近的一句, 但页面没有把两者连起来.

<!-- page 2 of 9 -->

Google DeepMind

Google DeepMind

Overview

概览

Capabilities

能力

Performance

性能

注: 这三项是页面顶部的导航标签, 对应页面的三段: 开头介绍, 能力卡片, 性能表.

## What is a diffusion model?

## 什么是扩散模型?

Traditional autoregressive language models generate text one word – or token – at a time. This sequential process can be slow, and limit the quality and coherence of the output.

传统的自回归语言模型一次生成一个词, 或者说一个 token. 这种按顺序逐个生成的过程可能很慢, 还会限制输出的质量和连贯性.

Diffusion models work differently. Instead of predicting text directly, they learn to generate outputs by refining noise, step-by-step. This means they can iterate on a solution very quickly and error correct during the generation process. This helps them excel at tasks like editing, including in the context of math and code.

扩散模型的工作方式不同. 它们不直接预测文本, 而是学会通过一步一步修正噪声来生成输出. 这意味着它们能非常快地对一个解反复迭代, 并在生成过程中纠正错误. 这让它们在编辑类任务上表现突出, 包括数学和代码场景下的编辑.

> **拆开:** 自回归 「one word – or token – at a time」 的一步, 和扩散 「refining noise, step-by-step」 的一步, 是同一种 「步」 吗?
> 不是. 按页面的说法, 自回归每一步产出一个新 token, 步数就等于输出长度; 扩散每一步是对整段输出做一次修正, 第 4 页又说它 「Generates entire blocks of tokens at once」, 所以一步管的是一整块. 两种 「步」 数不能直接比. 页面没有给扩散走多少步, 一块多长, 噪声加在什么表示上, 所以 「扩散比自回归少走多少步」 这个问题, 从这一页算不出来.

> **停一下:** 「iterate on a solution very quickly」 说迭代很快, 那多迭代几轮是不是要多花算力?
> 页面没说. 这一段只讲了迭代快, 能在生成过程中纠错, 没有一句把 「多走几步去噪」 和 「多花推理算力」 挂钩, 也没有给出步数和质量之间的关系. 所以这里只能照原话读: 纠错发生在生成过程中, 是推理阶段的事; 迭代的轮数, 每轮的开销, 页面都没给.

![Image block](images/p02-capabilities.png)

图: 一块圆角深色面板, 通体近黑, 没有任何文字或图形. 它位于 「What is a diffusion model?」 两段正文之下, 「Capabilities」 小标题之上; 原网页这里应是一段演示动画或视频, 抓成 PDF 后只剩底色. 文件名取自下方的小标题 「Capabilities」, 与面板内容无关.

Capabilities

能力

<!-- page 3 of 9 -->

Google DeepMind

Google DeepMind

![Image block](images/p03-rapid-response-generates-content-significantly-faster.png)

图: 浅灰卡片中央一个蓝色仪表盘图标, 半圆表盘, 指针指向右上方, 左右各有一条淡蓝竖线. PDF 文字层里这个图标的名字是 「speed」. 文件名取自卡片下方的说明文字.

Rapid response Generates content significantly faster than even our fastest model so far.

快速响应 生成内容的速度明显快于我们迄今最快的模型.

注: md 把卡片标题 「Rapid response」 和说明句并成了一行; PDF 里标题单独一行, 加粗.

> **核对:** 「even our fastest model so far」 指的是哪个模型? 快多少?
> 这张卡片没点名, 也没给倍数. 全文唯一的速度数字在第 6 页: 采样速度 1479 tokens / sec, 另有 0.84 秒开销, 而那张表只有 Gemini Diffusion 一列, 没有任何对照模型的速度. 第 5, 6 页基准表的对照是 Gemini 2.0 Flash-Lite, 但它是不是 「our fastest model so far」, 页面没有说.

<!-- page 4 of 9 -->

Google DeepMind

Google DeepMind

## More coherent text

## 更连贯的文本

Generates entire blocks of tokens at once, meaning it responds more coherently to a user’s prompt than autoregressive models.

一次生成整块 token, 这意味着它对用户提示的回应比自回归模型更连贯.

注: PDF 这一页卡片中央有一个蓝色图标 (几行长短不一的横线夹着圆点), 文字层里的图标名是 「stream_control」; md 没有把它抽成图片, 所以报告该页没有图片块.

> **对一下:** 这里说 「entire blocks of tokens at once」, 第 2 页说 「step-by-step」, 一次成块和一步一步是不是矛盾?
> 两句说的是两个层面. 「at once」 指的是一块里的 token 同时出现, 不像自回归那样从左到右一个一个排; 「step-by-step」 指的是这一整块要经过多轮去噪才定下来. 合起来的读法是: 整块一起生成, 整块一起逐轮修正. 至于 「more coherently than autoregressive models」, 这一页没有给任何连贯性指标或对照实验, 是一句定性的说法.

<!-- page 5 of 9 -->

Google DeepMind

Google DeepMind

autorenew

autorenew (图标名, PDF 里是两个首尾相接的循环箭头)

Corrects errors during generation for more consistent outputs.

在生成过程中纠正错误, 让输出更一致.

Iterative refinement

迭代修正

注: md 把卡片标题 「Iterative refinement」 放在了说明句之后; PDF 里标题在上, 说明句在下.

## Performance

## 性能

# Gemini Diffusion’s external benchmark performance is comparable to much larger models, whilst also being faster.

# Gemini Diffusion 在外部基准上的表现与大得多的模型相当, 同时速度更快.

| Benchmark | Gemini Diffusion | Gemini 2.0 Flash-Lite |
| --- | --- | --- |
| CodeLiveCodeBench (v6) | 30.9% | 28.5% |
| CodeBigCodeBench | 45.4% | 45.8% |

| 基准 | Gemini Diffusion | Gemini 2.0 Flash-Lite |
| --- | --- | --- |
| 代码 / LiveCodeBench (v6) | 30.9% | 28.5% |
| 代码 / BigCodeBench | 45.4% | 45.8% |

注: md 里的 「CodeLiveCodeBench」 和 「CodeBigCodeBench」 是把每行上方的类别小字 「Code」 和基准名粘在了一起; PDF 里 「Code」 是一行小号灰字, 基准名在它下面. 这张表跨页, 第 6 页接着往下排.

> **看表:** 标题说 「comparable to much larger models」, 表里的对照只有 Gemini 2.0 Flash-Lite 一列. Flash-Lite 就是那个 「much larger」 的模型吗?
> 页面没有给两边任何一方的参数量, 也没有说 Flash-Lite 比 Gemini Diffusion 大多少. 「much larger models」 用的是复数, 表里却只有一个对照模型. 所以这句标题里的 「大得多」 在页面上找不到数字支撑; 能从表里读到的只是 Gemini Diffusion 和 Flash-Lite 这两列分数.

<!-- page 6 of 9 -->

| Benchmark Gemini Diffusion | Gemini 2.0 Flash-Lite |
| --- | --- |
| Code |  |
| 56.8% | 56.0% |
| LBPP (v2) |  |
| Code |  |
| 22.9% | 28.5% |
| SWE-Bench Verified* |  |
| Code |  |
| 89.6% | 90.2% |
| HumanEval |  |
| Code |  |
| 76.0% | 75.8% |
| MBPP |  |
| Science |  |
| 40.4% | 56.5% |
| GPQA Diamond |  |
| Mathematics |  |
| 23.3% | 20.0% |
| AIME 2025 |  |
| Reasoning |  |
| 15.0% | 21.0% |
| BIG-Bench Extra Hard |  |
| Multilingual |  |
| 69.1% | 79.0% |
| Global MMLU (Lite) |  |

| 类别 / 基准 | Gemini Diffusion | Gemini 2.0 Flash-Lite |
| --- | --- | --- |
| 代码 / LBPP (v2) | 56.8% | 56.0% |
| 代码 / SWE-Bench Verified* | 22.9% | 28.5% |
| 代码 / HumanEval | 89.6% | 90.2% |
| 代码 / MBPP | 76.0% | 75.8% |
| 科学 / GPQA Diamond | 40.4% | 56.5% |
| 数学 / AIME 2025 | 23.3% | 20.0% |
| 推理 / BIG-Bench Extra Hard | 15.0% | 21.0% |
| 多语言 / Global MMLU (Lite) | 69.1% | 79.0% |

注: 中文表按 PDF 重排成三列. md 把每行拆成了 「类别 / 分数 / 基准名」 三行, 表头也把 「Benchmark」 和 「Gemini Diffusion」 并进了同一格.

> **回看:** md 里分数行夹在类别和基准名之间, 56.8% 到底属于上面的 「Code」 那一组, 还是属于下面的 「LBPP (v2)」?
> 属于 LBPP (v2). PDF 截图里每一行是类别小字在上, 基准名在下, 分数和基准名同一行靠右; md 的顺序是 「类别, 分数, 基准名」, 所以每个分数都该挂到紧跟其后的那个基准名上. PDF 文字层把八个基准名和十六个分数按同样顺序各列了一遍, 配对结果和上面的中文表一致. 另外 SWE-Bench Verified 的 Flash-Lite 分数 28.5% 和第 5 页 LiveCodeBench 的 Flash-Lite 分数 28.5% 恰好相同, PDF 两处都印着 28.5%, 不是 md 抄串了行.

> **再看:** 两页表合起来一共十行, Gemini Diffusion 赢几行, 输几行?
> 赢四行: LiveCodeBench (v6) +2.4, LBPP (v2) +0.8, MBPP +0.2, AIME 2025 +3.3. 输六行: BigCodeBench -0.4, SWE-Bench Verified -5.6, HumanEval -0.6, GPQA Diamond -16.1, BIG-Bench Extra Hard -6.0, Global MMLU (Lite) -9.9 (单位都是百分点, 由表中数字相减得出). 六行代码基准三赢三输, 差距都在 6 个百分点以内; 代码以外的四行只有 AIME 2025 领先, 科学, 推理, 多语言三行都落后, GPQA Diamond 差了 16.1 个百分点.

Methodology

方法说明

All scores are pass @1 (no majority voting). The Gemini 2.0 Flash-Lite experiments are run with the AI Studio API for the model-id gemini-2.0-flash-lite with the default sampling settings.

所有分数都是 pass@1 (不做多数投票). Gemini 2.0 Flash-Lite 的实验通过 AI Studio API 运行, 模型 ID 为 gemini-2.0-flash-lite, 采用默认采样设置.

> **确认:** 两列分数是不是同一个口径跑出来的?
> 只有一半能确认. 「All scores are pass @1 (no majority voting)」 管的是全部分数, 两列都是单次作答, 不投票. 但采样设置只交代了 Flash-Lite 一边: 走 AI Studio API, 默认采样. Gemini Diffusion 一边用什么接口, 什么采样设置, 走多少步去噪, 页面都没写. 所以两列在 「pass@1, 不投票」 这一点上同口径, 在采样设置上是否对齐, 页面没有给出能核对的信息.

\* Non-agentic evaluation (single turn edit only), max prompt length of 32K.

\* 非 agent 式评测 (只做单轮编辑), 最大提示长度 32K.

> **问:** 这个星号挂在 「SWE-Bench Verified」 的名字上, 它管 Gemini Diffusion 一列, 还是两列都管?
> 星号标在基准名上, 而不是标在某一个分数上, 按表格习惯应是整行两列都按 「单轮编辑, 最大提示 32K」 来跑. 页面没有单独说明 Flash-Lite 这一行是否也关掉了 agent 流程, 只能从星号的位置推断. 另外 32K 的单位没写, 结合上下文应是 token 数.

## Gemini Diffusion speed

## Gemini Diffusion 的速度

| Sampling speed excluding overhead | 1479 tokens / sec |
| --- | --- |
| Overhead | 0.84 sec |

| 不含开销的采样速度 | 1479 tokens / 秒 |
| --- | --- |
| 开销 | 0.84 秒 |

Average sampling speed across reported evals.

上述为各项已报告评测上的平均采样速度.

> **拆开:** 1479 tokens / sec 和 0.84 秒开销放在一起, 一次生成大概要多久? 「faster」 又是比谁快?
> 按表里两个数自己算: 生成 1000 个 token 约 1000 ÷ 1479 ≈ 0.68 秒, 加上 0.84 秒开销约 1.52 秒; 开销和采样时间相等的长度是 0.84 × 1479 ≈ 1242 个 token, 短于这个长度时开销占大头. 这些是推算, 页面只给了两个平均值. 比较对象方面, 这张表只有 Gemini Diffusion 一列, 没有 Flash-Lite 或其他模型的速度; 表下只说是 「reported evals」 上的平均, 输出长度, 硬件, 「overhead」 具体包含什么, 都没交代.

<!-- page 7 of 9 -->

![Image block](images/p07-google-deepmind.png)

图: 一个黑色的 GitHub 猫形图标, 是页面底部 「Follow us」 一行社交图标里的最后一个. 文件名取自它在 md 里后面紧跟的 「Google DeepMind」, 与图的内容无关.

Google DeepMind

Google DeepMind

Try Gemini Diffusion

试用 Gemini Diffusion

# Gemini Diffusion is currently available as an experimental demo to help develop and refine future models.

# Gemini Diffusion 目前以实验性演示的形式开放, 用于帮助开发和完善未来的模型.

> **想:** 标题叫 「experimental」, 这里说 「experimental demo」, 那它算不算发布了?
> 这是两句话, 说的是两件事. 第 1 页的 「experimental」 是给模型本身定性, 第 7 页说的是开放方式: 一个演示, 目的写得很明白, 「to help develop and refine future models」. 全文没有 Gemini Diffusion 自己的模型 ID, 价格, API 开放状态, 也没有 「generally available」 或 「stable」 一类字样; 第 6 页出现的模型 ID 只有对照组的 gemini-2.0-flash-lite. 页面也没说怎么申请试用, 「Try Gemini Diffusion」 在 PDF 里只是一行标签, 没有可点的链接.

![Image block](images/p07-image.png)

图: 黑色的 X (原 Twitter) 标志, 是 「Follow us」 一行社交图标里的第一个. 文件名是抽图工具的默认名.

![Image block](images/p07-follow-us.png)

图: 黑色圆角方框里一个圆圈加右上角小点的 Instagram 图标, 是 「Follow us」 一行里的第二个. 那一行在 PDF 里依次是 X, Instagram, YouTube, LinkedIn, GitHub 五个图标, md 只抽出了其中三个. 文件名取自后面的 「Follow us」.

Follow us

关注我们

Sign up for updates on our latest innovations I accept Google's Terms and Conditions and acknowledge that my information will be used in accordance with [Google's Privacy Policy](https://policies.google.com/privacy).

订阅我们最新创新的动态 我接受 Google 的条款及条件, 并知悉我的信息将按照 [Google 隐私权政策](https://policies.google.com/privacy) 使用.

注: md 把订阅标题和勾选框说明并成了一行; PDF 里 「Sign up for updates on our latest innovations」 是一行, 下面一行小字是同意条款的说明.

<!-- page 8 of 9 -->

[the latest update](https://deepmind.google/)s

[最新动态](https://deepmind.google/) (PDF 文字层是 「Get the latest updates」, md 只识别出后半截, 末尾的 s 落在了链接外面)

Sign up

订阅

## Build AI responsibly to benefit humanity

## 负责任地构建 AI, 造福人类

## Models

## 模型

spar [Gemini](https://deepmind.google/models/gemini/)

spar [Gemini](https://deepmind.google/models/gemini/) (前面的 「spar」 是图标名 spark 被截短)

[movie\_filter\_auto](https://deepmind.google/models/gemini-omni/) [Gemini Omni](https://deepmind.google/models/gemini-omni/)

[movie\_filter\_auto](https://deepmind.google/models/gemini-omni/) [Gemini Omni](https://deepmind.google/models/gemini-omni/) (前一个链接文字是图标名, 下同)

[photo\_spark](https://deepmind.google/models/gemini-image/) [Nano Banana](https://deepmind.google/models/gemini-image/)

[photo\_spark](https://deepmind.google/models/gemini-image/) [Nano Banana](https://deepmind.google/models/gemini-image/) (图像模型)

[mic\_detect\_auto](https://deepmind.google/models/gemini-audio/) [Gemini Audio](https://deepmind.google/models/gemini-audio/)

[mic\_detect\_auto](https://deepmind.google/models/gemini-audio/) [Gemini Audio](https://deepmind.google/models/gemini-audio/) (音频模型)

[Gemma](https://deepmind.google/models/gemma/)

[Gemma](https://deepmind.google/models/gemma/) (开放权重模型)

[language](https://deepmind.google/models/genie/) [Genie](https://deepmind.google/models/genie/)

[language](https://deepmind.google/models/genie/) [Genie](https://deepmind.google/models/genie/) (世界模型)

$1 1 ^ { \spadesuit }$ [Lyria](https://deepmind.google/models/lyria/)

$1 1 ^ { \spadesuit }$ [Lyria](https://deepmind.google/models/lyria/) (音乐模型; 前面的公式是图标 audio_spark 被误识别, PDF 文字层写的是 「audio_spark」)

[video\_spark](https://deepmind.google/models/veo/) [Veo](https://deepmind.google/models/veo/)

[video\_spark](https://deepmind.google/models/veo/) [Veo](https://deepmind.google/models/veo/) (视频模型)

## Science

## 科学

[genetics](https://deepmind.google/science/alphafold/) [AlphaFold](https://deepmind.google/science/alphafold/)

[genetics](https://deepmind.google/science/alphafold/) [AlphaFold](https://deepmind.google/science/alphafold/) (蛋白质结构预测)

[immunology](https://deepmind.google/science/alphagenome/) [AlphaGenome](https://deepmind.google/science/alphagenome/)

[immunology](https://deepmind.google/science/alphagenome/) [AlphaGenome](https://deepmind.google/science/alphagenome/) (基因组)

[cyclone](https://deepmind.google/science/weathernext/) [WeatherNext](https://deepmind.google/science/weathernext/)

[cyclone](https://deepmind.google/science/weathernext/) [WeatherNext](https://deepmind.google/science/weathernext/) (天气预报)

[photosphere](https://deepmind.google/blog/alphaearth-foundations-helps-map-our-planet-in-unprecedented-detail/) [AlphaEarth](https://deepmind.google/blog/alphaearth-foundations-helps-map-our-planet-in-unprecedented-detail/)

[photosphere](https://deepmind.google/blog/alphaearth-foundations-helps-map-our-planet-in-unprecedented-detail/) [AlphaEarth](https://deepmind.google/blog/alphaearth-foundations-helps-map-our-planet-in-unprecedented-detail/) (地球观测)

[code\_xml](https://deepmind.google/blog/alphaevolve-a-gemini-powered-coding-agent-for-designing-advanced-algorithms/) [AlphaEvolve](https://deepmind.google/blog/alphaevolve-a-gemini-powered-coding-agent-for-designing-advanced-algorithms/)

[code\_xml](https://deepmind.google/blog/alphaevolve-a-gemini-powered-coding-agent-for-designing-advanced-algorithms/) [AlphaEvolve](https://deepmind.google/blog/alphaevolve-a-gemini-powered-coding-agent-for-designing-advanced-algorithms/) (算法设计 agent)

## Learn more

## 了解更多

[About](https://deepmind.google/about/)

[关于我们](https://deepmind.google/about/)

[Careers](https://deepmind.google/careers/)

[招聘](https://deepmind.google/careers/)

[News](https://deepmind.google/blog/)

[新闻](https://deepmind.google/blog/)

[National Partnerships for AI](https://deepmind.google/national-partnerships-for-ai/)

[AI 国家合作伙伴计划](https://deepmind.google/national-partnerships-for-ai/)

[Accelerator programs](https://deepmind.google/accelerators/)

[加速器计划](https://deepmind.google/accelerators/)

[The Podcast](https://deepmind.google/the-podcast/)

[播客](https://deepmind.google/the-podcast/)

[DeepMind Institute](https://institute.deepmind.com/)

[DeepMind 学院](https://institute.deepmind.com/)

## Research

## 研究

[robot\_2](https://deepmind.google/models/gemini-robotics/) [Gemini Robotics](https://deepmind.google/models/gemini-robotics/)

[robot\_2](https://deepmind.google/models/gemini-robotics/) [Gemini Robotics](https://deepmind.google/models/gemini-robotics/) (机器人模型)

[Breakthroughs](https://deepmind.google/research/projects/)

[突破性成果](https://deepmind.google/research/projects/)

[Evals](https://deepmind.google/research/evals/)

[评测](https://deepmind.google/research/evals/)

[Publications](https://deepmind.google/research/publications/)

[论文发表](https://deepmind.google/research/publications/)

[Frontier safety](https://deepmind.google/frontier-safety/)

[前沿安全](https://deepmind.google/frontier-safety/)

[Responsibility](https://deepmind.google/responsibility-and-safety/)

[责任](https://deepmind.google/responsibility-and-safety/)

Products

产品

[antigravity](https://antigravity.google/?utm_source=deepmind.google&utm_medium=referral&utm_campaign=gdm&utm_content=) [Google Antigravity](https://antigravity.google/?utm_source=deepmind.google&utm_medium=referral&utm_campaign=gdm&utm_content=)

[antigravity](https://antigravity.google/?utm_source=deepmind.google&utm_medium=referral&utm_campaign=gdm&utm_content=) [Google Antigravity](https://antigravity.google/?utm_source=deepmind.google&utm_medium=referral&utm_campaign=gdm&utm_content=) (开发工具)

[spark](https://gemini.google.com/?utm_source=deepmind.google&utm_medium=referral&utm_campaign=gdm&utm_content=) [Gemini app](https://gemini.google.com/?utm_source=deepmind.google&utm_medium=referral&utm_campaign=gdm&utm_content=)

[spark](https://gemini.google.com/?utm_source=deepmind.google&utm_medium=referral&utm_campaign=gdm&utm_content=) [Gemini 应用](https://gemini.google.com/?utm_source=deepmind.google&utm_medium=referral&utm_campaign=gdm&utm_content=)

[ai\_studio](https://aistudio.google.com/?utm_source=deepmind.google&utm_medium=referral&utm_campaign=gdm&utm_content=) [Google AI Studio](https://aistudio.google.com/?utm_source=deepmind.google&utm_medium=referral&utm_campaign=gdm&utm_content=)

[ai\_studio](https://aistudio.google.com/?utm_source=deepmind.google&utm_medium=referral&utm_campaign=gdm&utm_content=) [Google AI Studio](https://aistudio.google.com/?utm_source=deepmind.google&utm_medium=referral&utm_campaign=gdm&utm_content=)

<!-- page 9 of 9 -->

Google DeepMind

Google DeepMind

[About Google](https://about.google/)

[关于 Google](https://about.google/)

[Google products](https://about.google/products/)

[Google 产品](https://about.google/products/)

[Privacy](https://policies.google.com/privacy)

[隐私权](https://policies.google.com/privacy)

[Terms](https://policies.google.com/terms)

[条款](https://policies.google.com/terms)
