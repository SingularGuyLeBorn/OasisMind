---
title: "Gemini 2.5 Flash-Lite · 对照译稿"
category: "模型库"
tags: ["Gemini", "对照译稿"]
published: true
excerpt: "Gemini 2.5 Flash-Lite 公开材料的逐段中英对照译稿，附读报告时的疑问块。"
---
<!-- page 1 of 4 -->

![Image block](images/p01-google-for-developers.png)

图: 页面顶部截图. 上排是两位作者的署名和职务 (Logan Kilpatrick, Group Product Manager; Zach Gleicher, Product, Google DeepMind), 右侧是 Share 按钮. 下方是题图: 深色背景上一道蓝色弧线, 散落几张发光的蓝色卡片 (文档, 扫描框, 仪表盘图标), 中央是白色大字 「Gemini 2.5 Flash-Lite」. 文件名取自页面左上角的站点名.

≡ Google for Developers

≡ Google for Developers (Google 开发者)

Search all articles...

搜索全部文章...

[GEMINI](https://developers.googleblog.com/en/search/?product_categories=Gemini)

[GEMINI](https://developers.googleblog.com/en/search/?product_categories=Gemini) (分类: Gemini)

# Gemini 2.5 Flash-Lite is now stable and generally available

# Gemini 2.5 Flash-Lite 稳定版现已正式开放

**JULY 22, 2025**

**2025 年 7 月 22 日**

[**Logan Kilpatrick**](https://developers.googleblog.com/en/search/?author=Logan+Kilpatrick)

[**Logan Kilpatrick**](https://developers.googleblog.com/en/search/?author=Logan+Kilpatrick)

[**Zach Gleicher**](https://developers.googleblog.com/en/search/?author=Zach+Gleicher)

[**Zach Gleicher**](https://developers.googleblog.com/en/search/?author=Zach+Gleicher)

**Group Product Manager**

**产品经理组负责人** (Logan Kilpatrick 的职务)

**Product**

**产品** (Zach Gleicher 的职务)

**Google DeepMind**

**Google DeepMind**

Share

分享

Today, we're releasing the stable version of Gemini 2.5 Flash-Lite, our fastest and lowest cost (\$0.10 input per 1M, \$0.40 output per 1M) model in the Gemini 2.5 model family. We built 2.5 Flash-Lite to push the frontier of intelligence per dollar, with native reasoning capabilities that can be optionally toggled on for more demanding use cases. Building on the momentum of 2.5 Pro and 2.5 Flash, this model rounds out our set of 2.5 models that are ready for scaled production use.

今天, 我们发布 Gemini 2.5 Flash-Lite 的稳定版. 它是 Gemini 2.5 模型家族里速度最快, 成本最低的模型 (输入每 100 万 token \$0.10, 输出每 100 万 token \$0.40). 我们打造 2.5 Flash-Lite, 是为了把 「每一美元能买到的智能」 这条前沿再往前推. 它带有原生推理能力, 遇到要求更高的用例时可以选择打开. 继 2.5 Pro 和 2.5 Flash 之后, 这个模型补齐了我们可用于大规模生产环境的 2.5 系列模型.

> **想:** 「\$0.10 input per 1M, \$0.40 output per 1M」 是稳定版的价, 预览版当时是不是也是这个价?
> 这一段没说. 全文唯一提到预览版价格的是第 2 页 「reduced audio input pricing by 40% from the preview launch」, 只点了音频输入; 文本输入和输出价跟预览版比动没动, 页面没有一句话表态, 既没说 「不变」, 也没给预览版的数字.

Our most cost-efficient and fastest 2.5 model yet

我们迄今性价比最高, 速度最快的 2.5 模型

<!-- page 2 of 4 -->

Google for Developers

Google for Developers (Google 开发者)

![Image block](images/p02-gemini-2-5-flash-lite-strikes-a-balance-between.png)

图: 三列对比表, 黑底白字, 蓝色细框. md 里这张是页面截图, 顶部被网站导航栏盖住, 看不到表头; PDF 内嵌的 1080x1080 原图有表头: 三列依次是 「2.5 Flash-Lite / THINKING OFF」, 「2.5 Flash / THINKING」, 「2.5 Pro / THINKING」. 各行如下. Best for (适用场景): 高并发, 讲究成本的任务 / 日常任务上的快速表现 / 编程和高度复杂的任务. Thinking controls (思考控制): 三列都打勾. Speed (速度): 3 / 2 / 1 个亮起的火箭. Performance (性能): 1 / 2 / 3 颗亮起的星. Cost (费用), Input price (输入价, 单位 \$/1M tokens, 标注 no caching 即不含缓存): \$0.10, 音频输入 \$0.30 / \$0.30, 音频输入 \$1.00 / \$1.25, 超过 200k token 时 \$2.50. Output price (输出价, \$/1M tokens): \$0.40 / \$2.50 / \$10.00, 超过 200k token 时 \$15.00. Availability (开放情况): 三列都写 Generally available (正式开放), 渠道都有 Google AI Studio, Vertex AI, Gemini API, 2.5 Flash 和 2.5 Pro 两列另有 Gemini app. 文件名取自图下方第一句正文.

> **看表:** 表头里 2.5 Flash-Lite 标 THINKING OFF, 2.5 Flash 标 THINKING, Speed 和 Performance 两行比的是同一种配置吗?
> 不是. Flash-Lite 那 3 个火箭, 1 颗星是关掉思考时的档位, 2.5 Flash 那 2 个火箭, 2 颗星是开着思考的档位; 表里没有 Flash-Lite 开思考, 也没有 Flash 关思考的格子, 两列之间能直接对齐的只有 Best for, Thinking controls, Cost, Availability 这几行. md 版截图裁掉了表头, 这层信息只在 PDF 原图里.

> **核对:** Flash-Lite 的 \$0.40 输出价挂在 THINKING OFF 这一列下, 打开思考后还是 \$0.40 吗?
> 表和正文都没回答. Output price 每列只印一个数, Flash-Lite 列顶上写的是 THINKING OFF; 第 1 页只说推理能力 「can be optionally toggled on」, 第 2 页只说 「controllable thinking budgets」, 开思考就是多花 TestingTime 算力, 多写出来的思考内容按什么价计, 页面上找不到.

> **拆开:** 和 2.5 Flash 同行对比, 三个价格各差几倍?
> 输入 \$0.10 对 \$0.30, 3 倍; 音频输入 \$0.30 对 \$1.00, 约 3.3 倍; 输出 \$0.40 对 \$2.50, 6.25 倍. 输出一行差得最多. 2.5 Pro 列有 「> 200k tokens」 的第二档价, Flash-Lite 和 Flash 两列都没有分档, 所以这三组倍数不受提示长度影响.

> **停一下:** Input price 下面注着 「(no caching)」, \$0.10 对 \$0.30 的 3 倍在用了缓存之后还成立吗?
> 不知道. 这个注解写在行名下方, 管的是整行三列, 表里只有不含缓存的输入价; 缓存后的输入价三列都没印, 所以 3 倍只能说是无缓存口径下的比值.

Gemini 2.5 Flash-Lite strikes a balance between performance and cost, without compromising on quality, particularly for latency-sensitive tasks like translation and classification.

Gemini 2.5 Flash-Lite 在性能和成本之间取得了平衡, 质量上不打折扣, 尤其适合翻译, 分类这类对延迟敏感的任务.

Here's what makes it stand out:

它的突出之处在于:

**Best in-class speed:** Gemini 2.5 Flash-Lite has lower latency than both 2.0 Flash-Lite and 2.0 Flash on a broad sample of prompts.

**同级最快的速度:** 在大量样本提示上, Gemini 2.5 Flash-Lite 的延迟比 2.0 Flash-Lite 和 2.0 Flash 都低.

> **再看:** 这条速度的比较对象是 2.0 Flash-Lite 和 2.0 Flash, 那和 2.5 Flash 比能对哪一行?
> 只能对表里的 Speed 一行: Flash-Lite 3 个火箭, 2.5 Flash 2 个, 而且前者是 THINKING OFF, 后者是 THINKING. 正文这条没提 2.5 Flash, 也没给延迟的毫秒数, 「broad sample of prompts」 是哪些提示, 多少条, 同样没写.

**Cost-efficiency:** It's our lowest-cost 2.5 model yet, priced at \$0.10 / 1M input tokens and \$0.40 output tokens, allowing you to handle large volumes of requests affordably. We have also reduced audio input pricing by 40% from the preview launch.

**性价比:** 它是我们迄今成本最低的 2.5 模型, 输入每 100 万 token \$0.10, 输出 \$0.40, 让你能以可承受的成本处理大量请求. 我们还把音频输入的价格在预览版发布时的基础上下调了 40%.

> **回看:** 这里写 「\$0.40 output tokens」, 后面少了 「/ 1M」, 和第 1 页是不是两个口径?
> 是同一个价. 第 1 页写的是 「\$0.40 output per 1M」, 表里 Output price 下也注着 「\$/1M tokens」, 三处数字一致, 这一句只是把单位省了.

> **对一下:** 音频输入 「reduced ... by 40% from the preview launch」, 表里的 「Audio input: \$0.30」 是降价之后的数吗, 预览版原价是多少?
> 表是稳定版发布当天配的图, \$0.30 应是降后的价. 按 40% 倒推, 预览版是 \$0.30 ÷ (1 - 0.4) = \$0.50, 这个 \$0.50 是算出来的, 页面没印; 预览别名在 8 月 25 日下线前按哪个价收, 原文也没说.

**Smart and small:** It demonstrates all-around higher quality than 2.0 Flash-Lite across a wide range of benchmarks, including coding, math, science, reasoning, and multimodal understanding.

**聪明而小巧:** 在编程, 数学, 科学, 推理和多模态理解等一系列基准上, 它的质量全面高于 2.0 Flash-Lite.

> **问:** 「all-around higher quality」 比的是 2.0 Flash-Lite, 和 2.5 Flash 比质量能对哪一行?
> 只有表里的 Performance 一行: Flash-Lite 1 颗星, 2.5 Flash 2 颗星. 正文点了编程, 数学, 科学, 推理, 多模态五类基准, 但没有一个基准名, 没有一个分数, 也没有拿 2.5 Flash 做对照.

**Fully featured:** When you build with 2.5 Flash-Lite, you get access to a 1 million-token context window, controllable thinking budgets, and support for native tools like Grounding with Google Search, Code Execution, and URL Context.

**功能齐全:** 用 2.5 Flash-Lite 开发, 你可以用到 100 万 token 的上下文窗口, 可控的思考预算, 以及原生工具支持, 比如基于 Google 搜索的事实依据 (Grounding with Google Search), 代码执行 (Code Execution) 和 URL 上下文 (URL Context).

## Gemini 2.5 Flash-Lite in action

## Gemini 2.5 Flash-Lite 的实际应用

<!-- page 3 of 4 -->

Since the launch of 2.5 Flash-Lite, we have already seen some incredibly successful deployments, here are some of [our favorites:](https://developers.google.com/)

自 2.5 Flash-Lite 发布以来, 我们已经看到了一些非常成功的部署, 下面是我们最喜欢的几个:

注: md 的第 3 页从半句 「satellite communication parsing」 开始, 前面的引导句和 Satlyt 一段的前半句被截图时的网站导航栏盖住了, 这里按 PDF 文字层补全. 引导句里的 「our favorites:」 在 md 中是一个指向 developers.google.com 的链接, 照录.

**Satlyt** is building a decentralized space computing platform that will transform how satellite data is processed and utilized for real-time summarization of in-orbit telemetry, autonomous task management, and satellite-to-satellite communication parsing.**2.5 Flash-Lite's speed has enabled a 45% reduction in latency** for critical onboard diagnostics and a **30% decrease in power consumption** compared to their baseline models.

**Satlyt** 正在搭建一个去中心化的太空计算平台, 用来改变卫星数据的处理和使用方式, 场景包括在轨遥测数据的实时摘要, 自主任务管理, 以及卫星之间通信内容的解析.**凭借 2.5 Flash-Lite 的速度, 关键的星上诊断延迟降低了 45%**, **功耗下降了 30%**, 对比对象是他们原先的基线模型.

[**HeyGen**](https://www.heygen.com/?sid=rewardful&via=heycok&gad_source=1&gad_campaignid=22741203521&gclid=Cj0KCQjwyvfDBhDYARIsAItzbZGTS1VpQAHrPymGNk7IWHZqfL4StqUECwxsAby79OH2xuCg4D_fGuEaArY9EALw_wcB) uses AI to create avatars for video content and leverages Gemini 2.5 Flash-Lite to automate video planning, analyze and optimize content, and **translate videos into over 180 languages**. This allows them to provide global, personalized experiences for their users.

[**HeyGen**](https://www.heygen.com/?sid=rewardful&via=heycok&gad_source=1&gad_campaignid=22741203521&gclid=Cj0KCQjwyvfDBhDYARIsAItzbZGTS1VpQAHrPymGNk7IWHZqfL4StqUECwxsAby79OH2xuCg4D_fGuEaArY9EALw_wcB) 用 AI 为视频内容生成虚拟形象, 并借助 Gemini 2.5 Flash-Lite 自动做视频策划, 分析和优化内容, 以及**把视频翻译成 180 多种语言**. 这让他们能为用户提供面向全球的个性化体验.

[**DocsHound**](https://docshound.com/) turns product demos into documentation by using Gemini 2.5 Flash-Lite to **process long videos and extract thousands of screenshots** with low latency. This transforms footage into comprehensive documentation and training data for AI agents much faster than traditional methods.

[**DocsHound**](https://docshound.com/) 把产品演示变成文档: 它用 Gemini 2.5 Flash-Lite 以低延迟**处理长视频并提取数千张截图**. 这样一来, 录像素材能比传统方法快得多地转成完整的文档, 以及供 AI agent 使用的训练数据.

[**Evertune**](https://www.evertune.ai/) helps brands understand how they are represented across AI models. Gemini 2.5 Flash-Lite is a game-changer for them, dramatically speeding up analysis and report generation. Its fast performance allows them to quickly scan and synthesize large volumes of model output to provide clients with **dynamic, timely insights**.

[**Evertune**](https://www.evertune.ai/) 帮品牌了解自己在各家 AI 模型里是怎样被呈现的. 对他们来说, Gemini 2.5 Flash-Lite 改变了局面, 大幅加快了分析和报告生成. 它的速度让他们能快速扫描并综合大量模型输出, 为客户提供**动态, 及时的洞察**.

You can start using 2.5 Flash-Lite by specifying "gemini-2.5-flash-lite" in your code. If you are using the preview version, you can switch to "gemini-2.5-flash-lite" which is the same underlying model. We plan to remove the preview alias of Flash-Lite on August 25th.

在代码里指定 「gemini-2.5-flash-lite」 就能开始使用 2.5 Flash-Lite. 如果你在用预览版, 可以切换到 「gemini-2.5-flash-lite」, 两者底层是同一个模型. 我们计划在 8 月 25 日移除 Flash-Lite 的预览版别名.

> **确认:** 「the same underlying model」 说稳定版和预览版是同一个模型, 那两者的区别是不是只剩名字和价格?
> 页面能确认的差别只有两处: 模型名从预览别名换成 「gemini-2.5-flash-lite」, 以及音频输入价比预览发布时低 40%. 文本输入价和输出价是否一样, 前面已经说过页面没表态; 预览别名 8 月 25 日下线, 之后调用只剩稳定版这一个名字.

Ready to start building? Try the stable version of Gemini 2.5 Flash-Lite now in [Google AI Studio](https://aistudio.google.com/prompts/new_chat?model=gemini-2.5-flash-lite) and [Vertex AI](https://console.cloud.google.com/vertex-ai/studio/multimodal?model=gemini-2.5-flash-lite).

准备好开始开发了吗? 现在就去 [Google AI Studio](https://aistudio.google.com/prompts/new_chat?model=gemini-2.5-flash-lite) 和 [Vertex AI](https://console.cloud.google.com/vertex-ai/studio/multimodal?model=gemini-2.5-flash-lite) 试用 Gemini 2.5 Flash-Lite 稳定版.

POSTED IN:

发布于:

[Gemini](https://developers.googleblog.com/en/search/?product_categories=Gemini)

[Gemini](https://developers.googleblog.com/en/search/?product_categories=Gemini)

[AI](https://developers.googleblog.com/en/search/?technology_categories=AI)

[AI](https://developers.googleblog.com/en/search/?technology_categories=AI) (人工智能)

[Announcements](https://developers.googleblog.com/en/search/?content_type_categories=Announcements)

[Announcements](https://developers.googleblog.com/en/search/?content_type_categories=Announcements) (公告)

[Explore](https://developers.googleblog.com/en/search/?tag=Explore)

[Explore](https://developers.googleblog.com/en/search/?tag=Explore) (探索)

[Gemini 2.5 Flash-Lite](https://developers.googleblog.com/en/search/?tag=Gemini%202.5%20Flash-Lite)

[Gemini 2.5 Flash-Lite](https://developers.googleblog.com/en/search/?tag=Gemini%202.5%20Flash-Lite)

![Image block](images/p03-our-favorites-https-developers-google-com.png)

图: 白色圆形按钮, 中间一个 「<」 箭头, 即页尾 PREVIOUS (上一篇) 旁的翻页按钮. md 把它放在第 3 页开头, 文件名取自引导句里的链接文字 「our favorites:」, 和图的内容无关; 这里按 PDF 放回翻页按钮的位置.

<

<

**PREVIOUS**

**上一篇**

**NEXT**

**下一篇**

>

>

Related Posts

相关文章

![Image block](images/p03-image.png)

图: 相关文章卡片的配图. 左侧是彩色节点连成的网络, 标着 「OLMo 3 7B pre-training」, 彩色光流从网络流向右侧一块写着 「TPU v7x Ironwood」 的芯片, 右下角标签 「MaxText x TPU v7x」. 与本文的 Gemini 2.5 Flash-Lite 无关.

![Image block](images/p03-ai-cloud-case-studies-how-to-guides-https-developers.png)

图: 第二张相关文章卡片的配图, 在页面右边缘被截断. 浅色背景上有齿轮, 分叉节点, 云朵等图标, 几条蓝色管道向右汇合, 对应被截断的文章 「Turn your REST APIs into M...」. 文件名取自第一张卡片的分类标签.

[AI CLOUD CASE STUDIES HOW-TO GUIDES](https://developers.googleblog.com/en/reproducing-olmo-3-7b-pre-training-in-maxtext-case-study-of-large-scale-training-on-tpus/)

[AI 云 案例研究 操作指南](https://developers.googleblog.com/en/reproducing-olmo-3-7b-pre-training-in-maxtext-case-study-of-large-scale-training-on-tpus/)

[Reproducing OLMo 3 7B Pre-training in MaxText: case study of large scale training on TPUs](https://developers.googleblog.com/en/reproducing-olmo-3-7b-pre-training-in-maxtext-case-study-of-large-scale-training-on-tpus/)

[在 MaxText 中复现 OLMo 3 7B 预训练: TPU 上大规模训练的案例研究](https://developers.googleblog.com/en/reproducing-olmo-3-7b-pre-training-in-maxtext-case-study-of-large-scale-training-on-tpus/)

[SEPT. 24, 2026](https://developers.googleblog.com/en/turn-your-rest-apis-into-mcp-tools-with-google-cloud-api-gateway/)

[2026 年 9 月 24 日](https://developers.googleblog.com/en/turn-your-rest-apis-into-mcp-tools-with-google-cloud-api-gateway/)

注: 这个日期属于第二张卡片 (链接指向 「turn your REST APIs into MCP tools with Google Cloud API Gateway」), 是抓取页面时的站点内容, 与 2025 年 7 月 22 日的正文无关.

<!-- page 4 of 4 -->

Google for Developers

Google for Developers (Google 开发者)

| Connect | Programs | Developer consoles |
| --- | --- | --- |
| Blog | Google Developer Program | Google API Console |
| Bluesky | Google Developer Groups | Google Cloud Platform Console |
| Instagram | Google Developer Experts | Google Play Console |
| LinkedIn | Accelerators | Firebase Console |
| X (Twitter) | Women Techmakers | Actions on Google Console |
| YouTube | Google Cloud &amp; NVIDIA | Cast SDK Developer Console |
|  |  | Chrome Web Store Dashboard |
|  |  | Google Home Developer Console |

| 关注我们 | 计划 | 开发者控制台 |
| --- | --- | --- |
| 博客 | Google 开发者计划 | Google API 控制台 |
| Bluesky | Google 开发者社区 | Google Cloud Platform 控制台 |
| Instagram | Google 开发者专家 | Google Play 管理中心 |
| LinkedIn | 加速器 | Firebase 控制台 |
| X (Twitter) | Women Techmakers | Actions on Google 控制台 |
| YouTube | Google Cloud 与 NVIDIA | Cast SDK 开发者控制台 |
|  |  | Chrome 应用商店信息中心 |
|  |  | Google Home 开发者控制台 |

Google for Developers

Google for Developers (Google 开发者)

[Terms](https://developers.google.com/terms/site-terms) | [Privacy](https://policies.google.com/privacy)

[条款](https://developers.google.com/terms/site-terms) | [隐私权](https://policies.google.com/privacy)
