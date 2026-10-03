---
title: "Gemini 2.0 · 对照译稿"
category: "模型库"
tags: ["Gemini", "对照译稿"]
published: true
excerpt: "Gemini 2.0 公开材料的逐段中英对照译稿，附读报告时的疑问块。"
---
<!-- page 1 of 9 -->

![Image block](images/p01-home-https-blog-google-innovation-ai-https-blog-google.png)

图: 页面顶部工具栏里的分享图标, 三个圆点用两条线连起来. 文件名取自它下方的面包屑导航, 和图的内容无关.

[Home](https://blog.google/) [Innovation & AI](https://blog.google/innovation-and-ai/) [Models & research](https://blog.google/innovation-and-ai/models-and-research/) [Google DeepMind](https://blog.google/innovation-and-ai/models-and-research/google-deepmind/)

[首页](https://blog.google/) [创新与 AI](https://blog.google/innovation-and-ai/) [模型与研究](https://blog.google/innovation-and-ai/models-and-research/) [Google DeepMind](https://blog.google/innovation-and-ai/models-and-research/google-deepmind/)

# Introducing Gemini 2.0: our new AI model for the agentic era

# 发布 Gemini 2.0: 面向 agent 时代的新 AI 模型

Dec 11, 2024 | 12 min read

2024 年 12 月 11 日 | 阅读约 12 分钟

[Sundar Pichai](https://blog.google/authors/sundar-pichai/)

[Sundar Pichai](https://blog.google/authors/sundar-pichai/)

[CEO of Google and Alphabet](https://blog.google/authors/sundar-pichai/)

[Google 与 Alphabet 首席执行官](https://blog.google/authors/sundar-pichai/)

[Demis Hassabis CEO of Google DeepMind](https://blog.google/authors/demis-hassabis/)

[Demis Hassabis, Google DeepMind 首席执行官](https://blog.google/authors/demis-hassabis/)

[Koray Kavukcuoglu CTO of Google DeepMind](https://blog.google/authors/koray-kavukcuoglu/)

[Koray Kavukcuoglu, Google DeepMind 首席技术官](https://blog.google/authors/koray-kavukcuoglu/)

![Image block](images/p01-read-ai-generated-summary.png)

图: 文章题图. 深蓝背景上, 两侧是由方格, 圆圈和发光方块组成的走廊, 一条亮蓝色的光线从右下角弯进画面中央, 中央是白色大字 「Gemini 2.0」. 文件名取自图下方的 「Read AI-generated summary」 按钮文字.

Read AI-generated summary

阅读 AI 生成的摘要

In this article

本文目录

## A note from Google and Alphabet CEO Sundar Pichai:

## Google 与 Alphabet 首席执行官 Sundar Pichai 的话:

Information is at the core of human progress. It’s why we’ve focused for more than 26 years on our mission to organize the world’s information and make it accessible and useful. And it’s why we continue to push the frontiers of AI to organize that information across every input and make it accessible via any output, so that it can be truly useful for you.

信息是人类进步的核心. 正因如此, 26 年多来我们一直专注于一个使命: 整合全球信息, 让人人都能获取并从中受益. 也正因如此, 我们持续推进 AI 的前沿, 让它能整合来自各种输入的信息, 并通过任意形式的输出交给你, 使这些信息真正对你有用.

<!-- page 2 of 9 -->

That was our vision when [we introduced Gemini 1.0 last December](https://blog.google/innovation-and-ai/technology/ai/google-gemini-ai/). The first model built to be natively multimodal, Gemini 1.0 and 1.5 drove big advances with multimodality and long context to understand information across text, video, images, audio and code, and process a lot more of it.

这就是[我们去年 12 月推出 Gemini 1.0](https://blog.google/innovation-and-ai/technology/ai/google-gemini-ai/) 时的愿景. Gemini 1.0 是第一个从设计之初就原生多模态的模型. Gemini 1.0 和 1.5 在多模态与长上下文上取得了很大进展, 能理解文本, 视频, 图像, 音频和代码中的信息, 而且能处理的量大得多.

Now millions of developers are building with Gemini. And it’s helping us reimagine all of our products — including all 7 of them with 2 billion users — and to create new ones. [NotebookLM](https://notebooklm.google/) is a great example of what multimodality and long context can enable for people, and why it’s loved by so many.

如今有数百万开发者在用 Gemini 做开发. 它也在帮我们重新构想自家所有产品, 其中包括用户数达 20 亿的全部 7 款产品, 并帮助我们打造新产品. [NotebookLM](https://notebooklm.google/) 就是一个很好的例子, 说明多模态和长上下文能为人们带来什么, 也说明它为什么这么受欢迎.

Over the last year, we have been investing in developing more agentic models, meaning they can understand more about the world around you, think multiple steps ahead, and take action on your behalf, with your supervision.

过去一年, 我们一直投入研发更具 agent 能力的模型. 所谓 agent 能力, 是指模型能更多地理解你身边的世界, 提前想好多个步骤, 并在你的监督下替你采取行动.

Today we’re excited to launch our next era of models built for this new agentic era: introducing Gemini 2.0, our most capable model yet. With new advances in multimodality — like native image and audio output — and native tool use, it will enable us to build new AI agents that bring us closer to our vision of a universal assistant.

今天, 我们很高兴推出为这个 agent 新时代打造的下一代模型: Gemini 2.0, 这是我们迄今能力最强的模型. 它在多模态上有新进展, 比如原生的图像和音频输出, 还支持原生工具调用. 借助这些能力, 我们能构建新的 AI agent, 离 「通用助手」 的愿景更近一步.

We’re getting 2.0 into the hands of developers and trusted testers today. And we’re working quickly to get it into our products, leading with Gemini and Search. Starting today our Gemini 2.0 Flash experimental model will be available to all Gemini users. We're also launching a new feature called [Deep Research](https://blog.google/products/gemini/google-gemini-deep-research/), which uses advanced reasoning and long context capabilities to act as a research assistant, exploring complex topics and compiling reports on your behalf. It's available in Gemini Advanced today, and you can [learn more on our website](https://gemini.google/overview/deep-research?utm_source=keywordblog&utm_medium=referral).

从今天起, 开发者和受信任的测试者可以用上 2.0. 我们也在加紧把它接入自家产品, 先从 Gemini 和搜索开始. 从今天起, Gemini 2.0 Flash 实验版模型向所有 Gemini 用户开放. 我们还推出一项名为 [Deep Research](https://blog.google/products/gemini/google-gemini-deep-research/) 的新功能, 它利用高级推理和长上下文能力充当研究助理, 替你探索复杂主题并整理成报告. 该功能今天起在 Gemini Advanced 中提供, 你可以[在我们的网站上了解更多](https://gemini.google/overview/deep-research?utm_source=keywordblog&utm_medium=referral).

> **想:** Deep Research 写在 2.0 的发布段落里, 它是跑在 Gemini 2.0 上的吗?
> 原文没这么说. 同一段里 「Gemini 2.0 Flash experimental model will be available to all Gemini users」 讲的是模型, 紧接着 「We're also launching a new feature」 讲的是功能, 用 「also」 并列, 对 Deep Research 只说它用了 「advanced reasoning and long context capabilities」, 没有点名底层模型. 它的开放范围也和 2.0 Flash 不同: 2.0 Flash 对所有 Gemini 用户开放, Deep Research 只在付费的 Gemini Advanced 里. 全文唯一明说要把 2.0 的推理能力接进去的产品是下一段的 AI Overviews, 而且只是 「limited testing」.

No product has been transformed more by AI than Search. Our AI Overviews now reach 1 billion people, enabling them to ask entirely new types of questions — quickly becoming one of our most popular Search features ever. As a next step, we’re bringing the advanced reasoning capabilities of Gemini 2.0 to AI Overviews to tackle more complex topics and multi-step questions, including advanced math equations, multimodal queries and coding. We started limited testing this week and will be rolling it out more broadly early next year. And we’ll continue to bring AI Overviews to more countries and languages over the next year.

没有哪款产品比搜索被 AI 改变得更多. 我们的 AI 概览 (AI Overviews) 如今覆盖 10 亿人, 让他们能提出全新类型的问题, 它很快成了搜索有史以来最受欢迎的功能之一. 下一步, 我们会把 Gemini 2.0 的高级推理能力带进 AI 概览, 用来处理更复杂的主题和多步问题, 包括高等数学方程, 多模态查询和编程. 我们本周已开始小范围测试, 明年初会更大范围推开. 明年我们还会继续把 AI 概览带到更多国家, 支持更多语言.

2.0’s advances are underpinned by decade-long investments in our differentiated full-stack approach to AI innovation. It’s built on custom hardware like Trillium, our sixth-generation TPUs. TPUs powered 100% of Gemini 2.0 training and inference, and today Trillium is [generally available](https://cloud.google.com/blog/products/compute/trillium-tpu-is-ga) to customers so they can build with it too.

2.0 的进展建立在我们十年来对差异化全栈 AI 创新路线的投入之上. 它构建在 Trillium 这类定制硬件上, Trillium 是我们的第六代 TPU. Gemini 2.0 的训练和推理 100% 由 TPU 支撑. 今天 Trillium 也已向客户[全面开放](https://cloud.google.com/blog/products/compute/trillium-tpu-is-ga), 客户同样可以用它来开发.

> **确认:** 「100% of Gemini 2.0 training and inference」 能不能读成 2.0 全部在 Trillium 上训练?
> 不能. 原话分两层: 「built on custom hardware like Trillium」 用的是 「like」, 只把 Trillium 当举例; 「TPUs powered 100%」 说的是 TPU 这个大类, 没限定第几代. 所以能确认的是 「训练和推理都没用 TPU 以外的芯片」, 至于各代 TPU 各占多少, 集群多大, 训练用了多久, 这里都没有写. 这句还紧跟着 Trillium 对云客户 「generally available」 的消息, 更像一条硬件业务的宣传, 不是训练配置说明.

If Gemini 1.0 was about organizing and understanding information, Gemini 2.0 is about making it much more useful. I can’t wait to see what this next era brings.

如果说 Gemini 1.0 的重点是整理和理解信息, 那么 Gemini 2.0 的重点就是让信息变得有用得多. 我迫不及待想看到这个新时代会带来什么.

-Sundar

-Sundar

## Introducing Gemini 2.0: our new AI model for the agentic era

## 发布 Gemini 2.0: 面向 agent 时代的新 AI 模型

By Demis Hassabis, CEO of Google DeepMind and Koray Kavukcuoglu, CTO of Google DeepMind on behalf of the Gemini team

作者: Google DeepMind 首席执行官 Demis Hassabis 与首席技术官 Koray Kavukcuoglu, 代表 Gemini 团队

Over the past year, we have continued to make incredible progress in artificial intelligence. Today, we are releasing the first model in the Gemini 2.0 family of models: an experimental version of Gemini 2.0 Flash. It’s our workhorse model with low latency and enhanced performance at the cutting edge of our technology, at scale.

过去一年, 我们在人工智能上持续取得了惊人的进展. 今天, 我们发布 Gemini 2.0 模型家族的第一个模型: Gemini 2.0 Flash 的实验版. 它是我们的主力模型, 延迟低, 性能更强, 代表了我们技术的前沿水平, 并且能大规模提供服务.

> **问:** 2.0 家族里 Flash 和 Pro 哪个先发?
> Flash 先发, 而且全文只有 Flash. 这句明说 「the first model in the Gemini 2.0 family of models」 是 「an experimental version of Gemini 2.0 Flash」. 通篇没有出现 「2.0 Pro」 这个名字, 第 3 页表格里的两个 Pro 都是上一代的 「Gemini 1.5 Pro 002」. 关于后续型号, 第 4 页只有一句 「General availability will follow in January, along with more model sizes」, 没说是哪些尺寸, 叫什么名字. 所以这次发布的比较对象只能是上一代: 第 3 页那句 「2.0 Flash even outperforms 1.5 Pro」 拿新一代的 Flash 去比旧一代的 Pro, 同代 Pro 缺席, 读表时不能把 2.0 Flash 当成 2.0 家族的上限.

We are also sharing the frontiers of our agentic research by showcasing prototypes enabled by Gemini 2.0’s native multimodal capabilities.

我们还会展示几个由 Gemini 2.0 原生多模态能力支撑的原型, 以此分享我们在 agent 研究上的前沿进展.

<!-- page 3 of 9 -->

## Gemini 2.0 Flash

## Gemini 2.0 Flash

Gemini 2.0 Flash builds on the success of 1.5 Flash, our most popular model yet for developers, with enhanced performance at similarly fast response times. Notably, 2.0 Flash even outperforms 1.5 Pro on key benchmarks, at twice the speed. 2.0 Flash also comes with new capabilities. In addition to supporting multimodal inputs like images, video and audio, 2.0 Flash now supports multimodal output like natively generated images mixed with text and steerable text-to-speech (TTS) multilingual audio. It can also natively call tools like Google Search, code execution as well as third-party user-defined functions.

Gemini 2.0 Flash 延续了 1.5 Flash 的成功. 1.5 Flash 是迄今最受开发者欢迎的模型, 2.0 Flash 在响应速度相近的情况下性能更强. 值得一提的是, 2.0 Flash 在关键基准上甚至超过了 1.5 Pro, 速度还是它的两倍. 2.0 Flash 也带来了新能力. 除了支持图像, 视频, 音频等多模态输入, 它现在还支持多模态输出, 例如与文本混排的原生生成图像, 以及可控的多语言文本转语音 (TTS) 音频. 它还能原生调用 Google 搜索, 代码执行等工具, 以及第三方用户自定义的函数.

> **核对:** 「2.0 Flash even outperforms 1.5 Pro on key benchmarks」 和下面这张表是同一口径吗?
> 表里 13 行, 2.0 Flash 对 1.5 Pro 赢 11 行, 输 2 行: MRCR (1M) 是 69.2% 对 82.6%, 低 13.4 个百分点; CoVoST2 是 39.2 对 40.1, 低 0.9 个 BLEU. 所以原文用 「on key benchmarks」 而不是 「on all benchmarks」, 措辞和表是对得上的, 只是哪些算 「key」 没有定义. 赢的 11 行里, 幅度差别也大: HiddenMath 高 11.0, Natural2Code 高 7.5, 而 MMLU-Pro 只高 0.6, LiveCodeBench 高 0.8, EgoSchema 高 0.3. 后半句 「at twice the speed」 在表里没有任何对应的列, 全文也没给延迟或吞吐的数字.

<table><tr><td>CAPABILITY</td><td>BENCHMARK</td><td>DESCRIPTION</td><td>Gemini 1.5 Flash 002</td><td>Gemini 1.5 Pro 002</td><td>Gemini 2.0 Flash Experimental</td></tr><tr><td>General</td><td>MMLU-Pro</td><td>Enhanced version of popular MMLU dataset with questions across multiple subjects with higher difficulty tasks</td><td>67.3%</td><td>75.8%</td><td>76.4%</td></tr><tr><td rowspan="3">Code</td><td>Natural2Code</td><td>Code generation across Python, Java, C++, JS, Go . Held out dataset HumanEval-like, not leaked on the web</td><td>79.8%</td><td>85.4%</td><td>92.9%</td></tr><tr><td>Bird-SQL (Dev)</td><td>Benchmark evaluating converting natural language questions into executable SQL</td><td>45.6%</td><td>54.4%</td><td>56.9%</td></tr><tr><td>LiveCodeBench (Code Generation)</td><td>Code generation in Python. Code Generation subset covering more recent examples: 06/01/2024 - 10/05/2024</td><td>30.0%</td><td>34.3%</td><td>35.1%</td></tr><tr><td>Factuality</td><td>FACTS Grounding</td><td>Ability to provide factuality correct responses given documents and diverse user requests. Held out internal dataset</td><td>82.9%</td><td>80.0%</td><td>83.6%</td></tr><tr><td rowspan="2">Math</td><td>MATH</td><td>Challenging math problems (incl. algebra, geometry, pre-calculus, and others)</td><td>77.9%</td><td>86.5%</td><td>89.7%</td></tr><tr><td>HiddenMath</td><td>Competition-level math problems, Held out dataset AIME/AMC-like, crafted by experts and not leaked on the web</td><td>47.2%</td><td>52.0%</td><td>63.0%</td></tr><tr><td>Reasoning</td><td>GPQA (diamond)</td><td>Challenging dataset of questions written by domain experts in biology, physics, and chemistry</td><td>51.0%</td><td>59.1%</td><td>62.1%</td></tr><tr><td>Long context</td><td>MRCR (1M)</td><td>Novel, diagnostic long-context understanding evaluation</td><td>71.9%</td><td>82.6%</td><td>69.2%</td></tr><tr><td rowspan="2">Image</td><td>MMMU</td><td>Multi-discipline college-level multimodal understanding and reasoning problems</td><td>62.3%</td><td>65.9%</td><td>70.7%</td></tr><tr><td>Vibe-Eval (Reka)</td><td>Visual understanding in chat models with challenging everyday examples. Evaluated with a Gemini Flash model as a rater</td><td>48.9%</td><td>53.9%</td><td>56.3%</td></tr><tr><td>Audio</td><td>CoVoST2 (21 lang)</td><td>Automatic speech translation (BLEU score)</td><td>37.4</td><td>40.1</td><td>39.2</td></tr><tr><td>Video</td><td>EgoSchema (test)</td><td>Video analysis across multiple domains</td><td>66.8%</td><td>71.2%</td><td>71.5%</td></tr></table>

| 能力 | 基准 | 说明 | Gemini 1.5 Flash 002 | Gemini 1.5 Pro 002 | Gemini 2.0 Flash 实验版 |
|---|---|---|---|---|---|
| 通用 | MMLU-Pro | 热门 MMLU 数据集的增强版, 题目覆盖多个学科, 难度更高 | 67.3% | 75.8% | 76.4% |
| 代码 | Natural2Code | 覆盖 Python, Java, C++, JS, Go 的代码生成. 类 HumanEval 的留出数据集, 未在网上泄露 | 79.8% | 85.4% | 92.9% |
| 代码 | Bird-SQL (Dev) | 评估把自然语言问题转成可执行 SQL 的能力 | 45.6% | 54.4% | 56.9% |
| 代码 | LiveCodeBench (代码生成) | Python 代码生成. 代码生成子集, 覆盖较新的题目: 2024/06/01 - 2024/10/05 | 30.0% | 34.3% | 35.1% |
| 事实性 | FACTS Grounding | 给定文档和各类用户请求时给出事实正确回答的能力. 内部留出数据集 | 82.9% | 80.0% | 83.6% |
| 数学 | MATH | 高难度数学题 (含代数, 几何, 微积分预备等) | 77.9% | 86.5% | 89.7% |
| 数学 | HiddenMath | 竞赛级数学题. 类 AIME/AMC 的留出数据集, 由专家编写, 未在网上泄露 | 47.2% | 52.0% | 63.0% |
| 推理 | GPQA (diamond) | 由生物, 物理, 化学领域专家编写的高难度问题集 | 51.0% | 59.1% | 62.1% |
| 长上下文 | MRCR (1M) | 新型的诊断式长上下文理解评测 | 71.9% | 82.6% | 69.2% |
| 图像 | MMMU | 多学科, 大学水平的多模态理解与推理题 | 62.3% | 65.9% | 70.7% |
| 图像 | Vibe-Eval (Reka) | 用有挑战性的日常样例考察聊天模型的视觉理解. 以一个 Gemini Flash 模型作为评分者 | 48.9% | 53.9% | 56.3% |
| 音频 | CoVoST2 (21 种语言) | 自动语音翻译 (BLEU 分数) | 37.4 | 40.1 | 39.2 |
| 视频 | EgoSchema (test) | 跨多个领域的视频分析 | 66.8% | 71.2% | 71.5% |

表注: 加粗按 PDF 原图, 表示该行最高分. md 转换丢了加粗; 原图还用浅蓝底框出 2.0 Flash 一列.

> **看表:** MRCR (1M) 这一行, 2.0 Flash 不只输给 1.5 Pro, 还输给了谁?
> 也输给了上一代的 1.5 Flash: 69.2% 对 71.9%, 低 2.7 个百分点. 这是全表唯一一行 2.0 Flash 在三列里垫底的项目. 对照第 2 页开头那句 「Gemini 1.0 and 1.5 drove big advances with multimodality and long context」, 长上下文正是 1.5 代主打的能力, 到了 2.0 Flash 这里反而退了一步. 正文讲 2.0 Flash 的新能力时只列了多模态输出和原生工具调用, 没有提长上下文, 也没解释这一行为什么掉分. 表里对 MRCR 的说明只有 「Novel, diagnostic long-context understanding evaluation」, 1M 指多长, 怎么判分, 都没写.

> **再看:** 表里哪些分数是 Google 自己出题, 自己判分的?
> 按说明列逐行看, 至少有四行带内部色彩. Natural2Code, HiddenMath 标了 「Held out dataset ... not leaked on the web」, FACTS Grounding 标了 「Held out internal dataset」, 这三项的题目外界拿不到, 分数无法复现. Vibe-Eval 的题目来自 Reka, 但说明写着 「Evaluated with a Gemini Flash model as a rater」, 即由 Gemini 自家的 Flash 模型打分, 而被评的三列里就有两个 Flash; 用的是哪一版 Flash 当评分者, 没写. 2.0 Flash 对 1.5 Pro 领先最多的两行 (HiddenMath 高 11.0, Natural2Code 高 7.5) 恰好都是留出集. 另外 FACTS Grounding 是全表唯一一行 1.5 Flash (82.9%) 高于 1.5 Pro (80.0%) 的项目.

Our goal is to get our models into people’s hands safely and quickly. Over the past month, we’ve been sharing early, experimental versions of Gemini 2.0, getting great feedback from developers.

我们的目标是安全而快速地把模型交到人们手中. 过去一个月, 我们一直在分享 Gemini 2.0 的早期实验版本, 从开发者那里得到了很好的反馈.

Gemini 2.0 Flash is available now as an experimental model to developers via the Gemini API in [Google AI Studio](https://aistudio.google.com/prompts/new_chat?model=gemini-2.0-flash-exp) and [Vertex AI](https://console.cloud.google.com/vertex-ai/studio/freeform?model=gemini-2.0-flash-exp) with multimodal input and text output available to all developers,

Gemini 2.0 Flash 现已作为实验模型, 通过 [Google AI Studio](https://aistudio.google.com/prompts/new_chat?model=gemini-2.0-flash-exp) 和 [Vertex AI](https://console.cloud.google.com/vertex-ai/studio/freeform?model=gemini-2.0-flash-exp) 中的 Gemini API 向开发者开放. 多模态输入和文本输出对所有开发者开放,

<!-- page 4 of 9 -->

and text-to-speech and native image generation available to early-access partners. General availability will follow in January, along with more model sizes.

文本转语音和原生图像生成则只对早期体验合作伙伴开放. 正式版 (GA) 将在 1 月推出, 届时还会有更多尺寸的模型.

> **拆开:** 第 3 页列的新能力, 发布当天谁能用到哪一项?
> 要把能力和开放对象分开看. 所有开发者: 多模态输入, 文本输出. 仅早期体验合作伙伴: 文本转语音, 原生图像生成. 也就是说, 第 3 页重点介绍的 「multimodal output like natively generated images mixed with text and steerable text-to-speech」, 当天普通开发者都拿不到. 原生工具调用的开放范围这两句没提, 只在下一段的 Multimodal Live API 里出现了 「the ability to use multiple, combined tools」. 正式版定在 1 月, 年份原文没写, 按发布日 2024 年 12 月 11 日推算应是 2025 年 1 月.

To help developers build dynamic and interactive applications, we’re also releasing a new Multimodal Live API that has real-time audio, video-streaming input and the ability to use multiple, combined tools. More information about 2.0 Flash and the Multimodal Live API can be found in our [developer blog](https://developers.googleblog.com/en/the-next-chapter-of-the-gemini-era-for-developers/).

为了帮助开发者构建动态, 可交互的应用, 我们还发布了新的 Multimodal Live API. 它支持实时音频和视频流输入, 并能组合使用多个工具. 关于 2.0 Flash 和 Multimodal Live API 的更多信息, 请看我们的[开发者博客](https://developers.googleblog.com/en/the-next-chapter-of-the-gemini-era-for-developers/).

## Gemini 2.0 available in Gemini app, our AI assistant

## Gemini 2.0 登陆我们的 AI 助手 Gemini 应用

Also starting today, [Gemini](https://gemini.google.com/) users globally can access a chat optimized version of 2.0 Flash experimental by selecting it in the model drop-down on desktop and mobile web and it will be available in the Gemini mobile app soon. With this new model, users can experience an even more helpful Gemini assistant.

同样从今天起, 全球的 [Gemini](https://gemini.google.com/) 用户在桌面端和移动网页端的模型下拉菜单里选中它, 就能用上针对聊天优化过的 2.0 Flash 实验版, Gemini 手机应用也将很快支持. 有了这个新模型, 用户会感到 Gemini 助手更好用了.

> **回看:** 应用里的 2.0 Flash 和表格里的 2.0 Flash 是同一个模型吗?
> 原文给了两个名字. 表头是 「Gemini 2.0 Flash Experimental」, 对应开发者通过 API 拿到的实验模型; 这里给 Gemini 应用用户的是 「a chat optimized version of 2.0 Flash experimental」, 多了 「chat optimized」 这层处理. 怎么针对聊天优化, 优化后分数变没变, 全文都没说, 所以表里的 13 行分数严格说只描述 API 版本. 第 2 页那句 「our Gemini 2.0 Flash experimental model will be available to all Gemini users」 没提这层区别, 读到这里才知道两者不完全一样.

Early next year, we’ll expand Gemini 2.0 to more Google products.

明年初, 我们会把 Gemini 2.0 扩展到更多 Google 产品中.

## Unlocking agentic experiences with Gemini 2.0

## 用 Gemini 2.0 解锁 agent 体验

Gemini 2.0 Flash’s native user interface action-capabilities, along with other improvements like multimodal reasoning, long context understanding, complex instruction following and planning, compositional function-calling, native tool use and improved latency, all work in concert to enable a new class of agentic experiences.

Gemini 2.0 Flash 原生具备在用户界面上执行操作的能力, 再加上其他方面的改进, 包括多模态推理, 长上下文理解, 复杂指令遵循与规划, 组合式函数调用, 原生工具调用以及更低的延迟, 这些能力协同作用, 带来一类新的 agent 体验.

The practical application of AI agents is a research area full of exciting possibilities. We’re exploring this new frontier with a series of prototypes that can help people accomplish tasks and get things done. These include an update to Project Astra, our research prototype exploring future capabilities of a universal AI assistant; the new Project Mariner, which explores the future of human-agent interaction, starting with your browser; and Jules, an AI-powered code agent that can help developers.

AI agent 的实际应用是一个充满可能性的研究领域. 我们正通过一系列原型探索这片新前沿, 这些原型能帮人们完成任务, 把事情办成. 其中包括: Project Astra 的更新版, 这是我们探索通用 AI 助手未来能力的研究原型; 全新的 Project Mariner, 它从浏览器入手, 探索人与 agent 交互的未来; 以及 Jules, 一个能帮助开发者的 AI 代码 agent.

We’re still in the early stages of development, but we’re excited to see how trusted testers use these new capabilities and what lessons we can learn, so we can make them more widely available in products in the future.

这些还处在早期开发阶段, 但我们很期待看到受信任的测试者如何使用这些新能力, 以及我们能从中学到什么, 以便将来在产品里更广泛地提供它们.

![Image block](images/p04-since-we-introduced-project-astra-https-deepmind-google.png)

图: 一段视频的封面, 画面被模糊处理. 深蓝底色, 左侧是大字 「Enabling the agentic era」, 上方一行小字依稀是 「Gemini 2.0」, 中央是播放按钮. 它在 PDF 里位于本节末尾, Project Astra 小标题之前; 文件名取自下一页开头的正文.

## Project Astra: agents using multimodal understanding in the real world

## Project Astra: 在真实世界里运用多模态理解的 agent

<!-- page 5 of 9 -->

Since we introduced [Project Astra](https://deepmind.google/technologies/gemini/project-astra/) at I/O, we’ve been learning from trusted testers using it on Android phones. Their valuable feedback has helped us better understand how a universal AI assistant could work in practice, including implications for safety and ethics. Improvements in the latest version built with Gemini 2.0 include:

自从我们在 I/O 大会上推出 [Project Astra](https://deepmind.google/technologies/gemini/project-astra/) 以来, 一直在向在 Android 手机上使用它的受信任测试者学习. 他们宝贵的反馈帮我们更好地理解通用 AI 助手在实际中怎样运作, 包括它对安全和伦理的影响. 基于 Gemini 2.0 构建的最新版本有以下改进:

Better dialogue: Project Astra now has the ability to converse in multiple languages and in mixed languages, with a better understanding of accents and uncommon words.

更好的对话: Project Astra 现在能用多种语言交谈, 也能处理多种语言混说, 对口音和生僻词的理解也更好了.

New tool use: With Gemini 2.0, Project Astra can use Google Search, Lens and Maps, making it more useful as an assistant in your everyday life.

新的工具调用: 借助 Gemini 2.0, Project Astra 可以使用 Google 搜索, Lens 和地图, 在日常生活中当助手更有用.

Better memory: We’ve improved Project Astra’s ability to remember things while keeping you in control. It now has up to 10 minutes of in-session memory and can remember more conversations you had with it in the past, so it is better personalized to you.

更好的记忆: 我们提升了 Project Astra 记住事情的能力, 同时让你保有控制权. 它现在拥有最长 10 分钟的会话内记忆, 还能记住你过去和它进行过的更多对话, 因而更贴合你个人.

> **停一下:** 「up to 10 minutes of in-session memory」 这个 10 分钟是什么量?
> 是时长, 不是上下文长度. 原文没把它换算成多少内容, 也没说这 10 分钟是视频流, 音频还是对话文字. 它和表里 MRCR (1M) 的 「1M」 不是同一种单位, 两者不能直接对照. 后半句 「can remember more conversations you had with it in the past」 讲的是跨会话记忆, 只用了 「more」, 没有数字, 也没说靠什么机制记住. 下文安全部分提到 Astra 有 「privacy controls that make it easy for users to delete sessions」, 说明这些会话是被保存下来的, 这是 「keeping you in control」 在全文里唯一具体的落点.

Improved latency: With new streaming capabilities and native audio understanding, the agent can understand language at about the latency of human conversation.

更低的延迟: 借助新的流式处理能力和原生音频理解, 这个 agent 理解语言的延迟大约和人与人交谈相当.

We’re working to bring these types of capabilities to Google products like [Gemini](http://gemini.google.com/) app, our AI assistant, and to other form factors like glasses. And we’re starting to expand our trusted tester program to more people, including a small group that will soon begin testing Project Astra on prototype glasses.

我们正在把这类能力带到 Google 产品中, 比如我们的 AI 助手 [Gemini](http://gemini.google.com/) 应用, 以及眼镜等其他设备形态. 我们也开始把受信任测试者计划扩大到更多人, 其中有一小组人很快会在原型眼镜上试用 Project Astra.

![Image block](images/p05-project-mariner-agents-that-can-help-you-accomplish.png)

图: 一段视频的封面, 画面被模糊处理. 一个人站在摆满书的店里, 低头看着手里的东西, 中央是播放按钮. 按 PDF 里的位置, 它排在 Project Astra 一节末尾; 文件名取自下方的 Project Mariner 小标题, 和画面内容不对应.

## Project Mariner: agents that can help you accomplish complex tasks

## Project Mariner: 帮你完成复杂任务的 agent

Project Mariner is an early research prototype built with Gemini 2.0 that explores the future of human-agent interaction, starting with your browser. As a research prototype, it’s able to understand and reason across information in your browser screen, including pixels and web elements like text, code, images and forms, and then uses that information via an experimental Chrome extension to complete tasks for you.

Project Mariner 是基于 Gemini 2.0 构建的早期研究原型, 从浏览器入手探索人与 agent 交互的未来. 作为研究原型, 它能理解并推理浏览器屏幕上的信息, 包括像素和网页元素, 比如文本, 代码, 图像和表单, 然后通过一个实验性的 Chrome 扩展利用这些信息替你完成任务.

When evaluated against the [WebVoyager benchmark](https://arxiv.org/abs/2401.13919), which tests agent performance on end-to-end real world web tasks, Project Mariner [achieved a state-of-the-art result of 83.5%](http://deepmind.google/technologies/project-mariner) working as a single agent setup.

在 [WebVoyager 基准](https://arxiv.org/abs/2401.13919)上 (它测试 agent 在端到端真实网页任务上的表现), Project Mariner 以单 agent 配置[取得了 83.5% 的当前最佳成绩](http://deepmind.google/technologies/project-mariner).

> **对一下:** 83.5% 是 Gemini 2.0 Flash 的分数, 还是 Mariner 的分数? 它和第 3 页表格是一套口径吗?
> 原文的主语是 「Project Mariner」, 是一个原型系统的成绩, 附带条件 「working as a single agent setup」. Mariner 只说 「built with Gemini 2.0」, 没说用的是 2.0 Flash 还是别的内部版本, 也没交代浏览器扩展这层框架怎么搭. 这个数字不在第 3 页的表里, 表里没有任何 agent 或网页任务类的行, 也没有对照的其他系统分数, 「state-of-the-art」 比的是谁, 页面上看不到. 紧接着的一段还承认它 「not always accurate and slow to complete tasks today」, 83.5% 与 「慢」 同时成立, 分数本身不含耗时.

It’s still early, but Project Mariner shows that it’s becoming technically possible to navigate within a browser, even though it’s not always accurate and slow to complete tasks today, which will improve rapidly over time.

现在还早, 但 Project Mariner 表明, 在浏览器里自主导航在技术上正变得可行. 虽然它目前并不总是准确, 完成任务也比较慢, 但这些会随着时间迅速改善.

To build this safely and responsibly, we’re conducting active research on new types of risks and mitigations, while keeping humans in the loop. For example, Project Mariner can only type, scroll or click in the active tab on your browser and it asks users for final confirmation before taking certain sensitive actions, like purchasing something.

为了安全, 负责任地构建它, 我们在让人始终参与其中的前提下, 积极研究新型风险及其缓解办法. 例如, Project Mariner 只能在浏览器当前激活的标签页里输入, 滚动或点击; 在执行某些敏感操作 (比如购物) 之前, 它会请用户做最终确认.

<!-- page 6 of 9 -->

Trusted testers are starting to test Project Mariner using an experimental Chrome extension now, and we’re beginning conversations with the web ecosystem in parallel.

受信任的测试者现在开始通过一个实验性 Chrome 扩展试用 Project Mariner, 我们也在同步和网络生态各方展开沟通.

![Image block](images/p06-jules-agents-for-developers.png)

图: 一段视频的封面, 画面被模糊处理. 左侧是大字 「Project Mariner」, 右上方是一位坐在笔记本电脑前的女士, 右下方是一张网页截图, 中央是播放按钮. 它属于 Project Mariner 一节; 文件名取自下方的 Jules 小标题.

## Jules: agents for developers

## Jules: 面向开发者的 agent

Next, we’re exploring how AI agents can assist developers with Jules — an experimental AI-powered code agent that integrates directly into a GitHub workflow. It can tackle an issue, develop a plan and execute it, all under a developer’s direction and supervision. This effort is part of our long-term goal of building AI agents that are helpful in all domains, including coding.

接下来, 我们借助 Jules 探索 AI agent 如何协助开发者. Jules 是一个实验性的 AI 代码 agent, 直接集成进 GitHub 工作流. 它能处理一个 issue, 制定计划并执行, 全程都在开发者的指导和监督之下. 这项工作是我们长期目标的一部分: 构建在包括编程在内的所有领域都有用的 AI agent.

More information about this ongoing experiment can be found in our [developer blog post](https://developers.googleblog.com/en/the-next-chapter-of-the-gemini-era-for-developers/).

关于这项进行中的实验, 更多信息请看我们的[开发者博客文章](https://developers.googleblog.com/en/the-next-chapter-of-the-gemini-era-for-developers/).

![Image block](images/p06-agents-in-games-and-other-domains.png)

图: 一张调暗了的深色界面截图. 左栏是 「Notifications」 和 「Recent tasks」, 顶栏左上角写着 「Jules」, 中间是一个仓库名和一个任务输入框, 下方是紫色的 「Begin Task」 按钮, 右栏标着 「Updated code」. 它属于 Jules 一节; 文件名取自下方的游戏小标题.

## Agents in games and other domains

## 游戏及其他领域里的 agent

Google DeepMind has a [long](https://deepmind.google/discover/blog/agent57-outperforming-the-human-atari-benchmark/) [history](https://deepmind.google/research/breakthroughs/alphago/) of using games to help AI models become better at following rules, planning and logic. Just last week, for example, we introduced [Genie 2](https://deepmind.google/discover/blog/genie-2-a-large-scale-foundation-world-model/), our AI model that can create an endless variety of playable 3D worlds — all from a single image. Building on this tradition, we’ve built agents using Gemini 2.0 that can help you navigate the virtual world of video games. It can reason about the game based solely on the action on the screen, and offer up suggestions for what to do next in real time conversation.

Google DeepMind 有[很长的](https://deepmind.google/discover/blog/agent57-outperforming-the-human-atari-benchmark/)[历史](https://deepmind.google/research/breakthroughs/alphago/), 一直用游戏帮助 AI 模型更好地遵循规则, 规划和进行逻辑推理. 比如就在上周, 我们推出了 [Genie 2](https://deepmind.google/discover/blog/genie-2-a-large-scale-foundation-world-model/), 这个 AI 模型只凭一张图片就能生成花样无穷, 可以游玩的 3D 世界. 延续这一传统, 我们用 Gemini 2.0 构建了能帮你在电子游戏的虚拟世界里摸索前进的 agent. 它只根据屏幕上的画面就能对游戏进行推理, 并在实时对话中建议你下一步该做什么.

<!-- page 7 of 9 -->

We're collaborating with leading game developers like Supercell to explore how these agents work, testing their ability to interpret rules and challenges across a diverse range of games, from strategy titles like “Clash of Clans” to farming simulators like “Hay Day.”

我们正在和 Supercell 等头部游戏开发商合作, 探索这些 agent 的工作方式, 考察它们在各类游戏中理解规则和挑战的能力, 从 「部落冲突」 (Clash of Clans) 这样的策略游戏, 到 「卡通农场」 (Hay Day) 这样的农场模拟游戏.

Beyond acting as virtual gaming companions, these agents can even tap into Google Search to connect you with the wealth of gaming knowledge on the web.

除了充当虚拟游戏伙伴, 这些 agent 还能调用 Google 搜索, 把你和网上丰富的游戏知识连接起来.

![Image block](images/p07-in-addition-to-exploring-agentic-capabilities-in-the.png)

图: 一段视频的封面, 画面被模糊处理. 左侧是大字 「Gemini 2.0 for games」, 右上方是三位戴耳机的人, 右下方是一幅俯视角的农场类游戏画面, 中央是播放按钮. 它属于游戏一节; 文件名取自下方讲机器人的那段正文.

In addition to exploring agentic capabilities in the virtual world, we’re experimenting with agents that can help in the physical world by applying Gemini 2.0's spatial reasoning capabilities to robotics. While it’s still early, we’re excited about the potential of agents that can assist in the physical environment.

除了在虚拟世界里探索 agent 能力, 我们也在把 Gemini 2.0 的空间推理能力用到机器人上, 实验能在物理世界中提供帮助的 agent. 虽然还很早期, 但我们对能在物理环境中提供协助的 agent 的潜力感到兴奋.

You can learn more about these research prototypes and experiments at [labs.google](http://labs.google/).

你可以在 [labs.google](http://labs.google/) 了解这些研究原型和实验的更多信息.

## Building responsibly in the agentic era

## 在 agent 时代负责任地构建

Gemini 2.0 Flash and our research prototypes allow us to test and iterate on new capabilities at the forefront of AI research that will eventually make Google products more helpful.

借助 Gemini 2.0 Flash 和这些研究原型, 我们可以在 AI 研究的最前沿测试并迭代新能力, 这些能力最终会让 Google 产品更有用.

As we develop these new technologies, we recognize the responsibility it entails, and the many questions AI agents open up for safety and security. That is why we are taking an exploratory and gradual approach to development, conducting research on multiple prototypes, iteratively implementing safety training, working with trusted testers and external experts and performing extensive risk assessments and safety and assurance evaluations.

在开发这些新技术的同时, 我们清楚其中的责任, 也清楚 AI agent 在安全与防护上带来的诸多问题. 因此我们采取探索式, 渐进式的开发方式: 在多个原型上开展研究, 迭代地实施安全训练, 与受信任的测试者和外部专家合作, 并开展大量风险评估以及安全与保障评估.

## For example:

## 例如:

As part of our safety process, we’ve worked with our Responsibility and Safety Committee (RSC), our longstanding internal review group, to identify and understand potential risks.

作为安全流程的一部分, 我们与长期存在的内部审查小组 「责任与安全委员会」 (RSC) 合作, 识别并理解潜在风险.

Gemini 2.0's reasoning capabilities have enabled major advancements in our AI-assisted red teaming approach, including the ability to go beyond simply detecting risks to now automatically generating evaluations and training data to mitigate them. This means we can more efficiently optimize the model for safety at scale.

Gemini 2.0 的推理能力让我们的 AI 辅助红队方法有了重大进展: 不再只是发现风险, 还能自动生成评估和训练数据来缓解风险. 这意味着我们能更高效地, 大规模地针对安全性优化模型.

As Gemini 2.0’s multimodality increases the complexity of potential outputs, we’ll continue to evaluate and train the model across image and audio input and output to help improve safety.

Gemini 2.0 的多模态能力让潜在输出更加复杂, 因此我们会继续在图像和音频的输入与输出上评估和训练模型, 以帮助提升安全性.

With Project Astra, we’re exploring potential mitigations against users unintentionally sharing sensitive information with the agent, and we’ve already built in privacy controls that make it easy for users to delete sessions. We’re also continuing to research ways to ensure AI agents act as reliable sources of information and don’t take unintended actions on your behalf.

在 Project Astra 上, 我们在探索如何防止用户无意中把敏感信息分享给 agent, 并且已经内置了隐私控制, 让用户能方便地删除会话. 我们也在继续研究如何确保 AI agent 成为可靠的信息来源, 不会替你做出你没打算做的操作.

<!-- page 8 of 9 -->

With Project Mariner, we’re working to ensure the model learns to prioritize user instructions over 3rd party attempts at prompt injection, so it can identify potentially malicious instructions from external sources and prevent misuse. This prevents users from being exposed to fraud and phishing attempts through things like malicious instructions hidden in emails, documents or websites.

在 Project Mariner 上, 我们在努力让模型学会把用户指令置于第三方的提示注入之上, 从而识别来自外部的潜在恶意指令, 防止滥用. 这样可以避免用户因为藏在邮件, 文档或网站里的恶意指令而遭遇欺诈和钓鱼.

We firmly believe that the only way to build AI is to be responsible from the start and we'll continue to prioritize making safety and responsibility a key element of our model development process as we advance our models and agents.

我们坚信, 构建 AI 的唯一方式是从一开始就负责任. 在推进模型和 agent 的过程中, 我们会继续把安全与责任作为模型开发流程的关键要素优先对待.

## Gemini 2.0, AI agents and beyond

## Gemini 2.0, AI agent 及更远的未来

Today’s releases mark a new chapter for our Gemini model. With the release of Gemini 2.0 Flash, and the series of research prototypes exploring agentic possibilities, we have reached an exciting milestone in the Gemini era. And we’re looking forward to continuing to safely explore all the new possibilities within reach as we build towards AGI.

今天的发布标志着 Gemini 模型翻开新的一章. 随着 Gemini 2.0 Flash 以及一系列探索 agent 可能性的研究原型发布, 我们在 Gemini 时代迎来了一个令人振奋的里程碑. 在迈向 AGI 的路上, 我们期待继续安全地探索触手可及的各种新可能.

Collection

合集

## Gemini 2.0: Our latest, most capable AI model yet

## Gemini 2.0: 我们最新, 能力最强的 AI 模型

See how Gemini 2.0 and our research prototypes work — and how they’ll help make our Google products more helpful.

看看 Gemini 2.0 和我们的研究原型如何运作, 以及它们会怎样让 Google 产品更有用.

[See more](https://blog.google/products-and-platforms/products/gemini/google-gemini-ai-collection-2024/)

[查看更多](https://blog.google/products-and-platforms/products/gemini/google-gemini-ai-collection-2024/)

![Image block](images/p08-posted-in.png)

图: 「Collection」 合集卡片的配图, 和第 1 页题图是同一个画面: 深蓝走廊, 两侧方格与圆圈, 一条亮蓝光线, 只是中间没有 「Gemini 2.0」 字样. 文件名取自图下方的 「Posted in:」.

Posted in:

发布于:

[Google DeepMind](https://blog.google/innovation-and-ai/models-and-research/google-deepmind/)

[Google DeepMind](https://blog.google/innovation-and-ai/models-and-research/google-deepmind/)

[Gemini models](https://blog.google/products-and-platforms/products/gemini/)

[Gemini 模型](https://blog.google/products-and-platforms/products/gemini/)

[Gemini Features](https://blog.google/products-and-platforms/products/gemini/)

[Gemini 功能](https://blog.google/products-and-platforms/products/gemini/)

## Related stories

## 相关文章

<!-- page 9 of 9 -->

## Gemini 3.8 Live with Live Avatar

## Gemini 3.8 Live 与 Live Avatar

Introducing Gemini 3.8 Flash TTS and 3.8 Flash-Lite Ti

发布 Gemini 3.8 Flash TTS 与 3.8 Flash-Lite Ti (原文在此截断)

![Image block](images/p09-introducing-gemini-3-8-live-and-3-8-live-extended.png)

图: 相关文章卡片的配图. 浅蓝渐变底上是两块圆角色块, 中间文字为 「Introducing Gemini 3.8 Flash TTS and 3.8 Flash-Lite TTS」, 右侧被裁掉一截, 下方是四色的星形标志. 这是抓取网页时站点推荐的内容, 和 2024 年 12 月的正文无关; 文件名取自图下方另一篇文章的标题, 和图上的文字不是同一篇.

Introducing Gemini 3.8 Live and 3.8 Live Extended Thinking

发布 Gemini 3.8 Live 与 3.8 Live Extended Thinking

## [Gemini models](https://blog.google/innovation-and-ai/models-and-research/gemini-models/gemini-3-8-live-with-live-avatar/)

## [Gemini 模型](https://blog.google/innovation-and-ai/models-and-research/gemini-models/gemini-3-8-live-with-live-avatar/)

[Introducing Gemini 3.8 Live with Live Avatar](https://blog.google/innovation-and-ai/models-and-research/gemini-models/gemini-3-8-live-with-live-avatar/)

[发布 Gemini 3.8 Live 与 Live Avatar](https://blog.google/innovation-and-ai/models-and-research/gemini-models/gemini-3-8-live-with-live-avatar/)

## [Gemini models](https://blog.google/innovation-and-ai/models-and-research/gemini-models/gemini-3-8-text-to-speech/)

## [Gemini 模型](https://blog.google/innovation-and-ai/models-and-research/gemini-models/gemini-3-8-text-to-speech/)

[Gemini 3.8 text-to-speech says hello](https://blog.google/innovation-and-ai/models-and-research/gemini-models/gemini-3-8-text-to-speech/)

[Gemini 3.8 文本转语音向你问好](https://blog.google/innovation-and-ai/models-and-research/gemini-models/gemini-3-8-text-to-speech/)

[By Shuo-yiin Chang & CJ Zheng](https://blog.google/innovation-and-ai/models-and-research/gemini-models/gemini-3-8-live-with-live-avatar/)

[作者: Shuo-yiin Chang 与 CJ Zheng](https://blog.google/innovation-and-ai/models-and-research/gemini-models/gemini-3-8-live-with-live-avatar/)

[By Leland Rechis & Alan Cowen](https://blog.google/innovation-and-ai/models-and-research/gemini-models/gemini-3-8-text-to-speech/)

[作者: Leland Rechis 与 Alan Cowen](https://blog.google/innovation-and-ai/models-and-research/gemini-models/gemini-3-8-text-to-speech/)

## [Gemini models](https://blog.google/innovation-and-ai/models-and-research/gemini-models/gemini-3-8-live-gemini-3-8-live-extended-thinking/)

## [Gemini 模型](https://blog.google/innovation-and-ai/models-and-research/gemini-models/gemini-3-8-live-gemini-3-8-live-extended-thinking/)

[Introducing Gemini 3.8 Live and 3.8 Live Extended Thinking](https://blog.google/innovation-and-ai/models-and-research/gemini-models/gemini-3-8-live-gemini-3-8-live-extended-thinking/)

[发布 Gemini 3.8 Live 与 3.8 Live Extended Thinking](https://blog.google/innovation-and-ai/models-and-research/gemini-models/gemini-3-8-live-gemini-3-8-live-extended-thinking/)

[By Tom Ouyang & Malini Jaganathan](https://blog.google/innovation-and-ai/models-and-research/gemini-models/gemini-3-8-live-gemini-3-8-live-extended-thinking/)

[作者: Tom Ouyang 与 Malini Jaganathan](https://blog.google/innovation-and-ai/models-and-research/gemini-models/gemini-3-8-live-gemini-3-8-live-extended-thinking/)

>

\>

## Get the latest news from Google in your inbox

## 在收件箱里获取 Google 最新动态

Sign up for our newsletters with product updates, event information, special offers, and more.

订阅我们的新闻邮件, 获取产品更新, 活动信息, 特别优惠等内容.

Email address

电子邮件地址

Your information will be used in accordance with [Google's privacy policy.](https://policies.google.com/privacy) You may opt out at any time.

你的信息将按照 [Google 隐私政策](https://policies.google.com/privacy)使用. 你可以随时退订.
