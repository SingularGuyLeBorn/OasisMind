---
title: "Mistral Small 3.1 · 对照译稿"
category: "模型库"
tags: ["Mistral", "对照译稿"]
published: true
excerpt: "Mistral Small 3.1 公开材料的逐段中英对照译稿,附读报告时的疑问块."
---
源文是 Mistral 官网发布页的 7 页打印稿, 英文正文约 500 词. 性能部分只有 GPQA-Diamond 一张散点图印出了数据, 其余基准小节在打印稿里是空白. 每页左下都压着同一个 cookie 弹窗. 文字以 PDF 文本层为准, 被弹窗盖住但文本层里还在的句子照录.

# Mistral Small 3.1 对照稿

<!-- page 1 of 7 -->

![cookie 弹窗里 "Toggle all" 的开关图标, 灰色, 处于关闭状态](images/p01-hl.png)

**RESEARCH.**

**研究.**

# Mistral Small 3.1

March 17, 2025. By Mistral AI.

2025 年 3 月 17 日, 作者 Mistral AI.

![发布页头图的一角: 粉色, 深绿, 浅蓝像素块拼成的 Mistral 风格图案, 左边被 cookie 弹窗挡住](images/p01-odel-in-its-weight-class.png)

Today we announce Mistral Small 3.1: the best model in its weight class. Building on Mistral Small 3, this new model comes with improved text performance, multimodal understanding, and an expanded context window of up to 128k tokens. The model outperforms comparable models like Gemma 3 and GPT-4o Mini, while delivering inference speeds of 150 tokens per second.

今天发布 Mistral Small 3.1, Mistral 称它是同量级里最好的模型. 它在 Mistral Small 3 的基础上做了三处升级: 文本能力更强, 加入多模态理解, 上下文窗口扩到最多 128k token. 官方说它胜过 Gemma 3 和 GPT-4o Mini 这类同级模型, 推理速度达到每秒 150 个 token.

> **想:** 「best model in its weight class」 里的 weight class 按什么划?
> 正文没写参数量, 只有第 2 页图里的标签 「(24B)」 和第 5 页 Hugging Face 链接名里的 24B, 量级边界得自己推.

> **问:** 每秒 150 个 token 是在什么硬件, 什么 batch 下跑出来的?
> 这页没交代. 第 2 页散点图的横轴是每个 token 的毫秒数, 两个数能不能互换, 要看测量条件是否相同.

Cookie banner. "Here are our cookies! Light and completely harmless. On this website, we use cookies to measure our audience, nurture our relationship with you and, from time to time send you some quality content and some advertisement. You can select here those you allow to stay." Toggle all. Google Analytics 4: Helps us measure our audience. Hubspot: Tool for customer relationship management. Close. Accept all. Next.

网站 cookie 弹窗. 「这是我们的 cookie, 轻量, 完全无害. 本站用 cookie 统计访问量, 维护和你的关系, 偶尔给你推送优质内容和一些广告. 你可以在这里选择保留哪些.」 下面是 「全部开关」, Google Analytics 4 (统计访问量), Hubspot (客户关系管理工具), 以及关闭, 全部接受, 下一步三个按钮. 这个弹窗 7 页每页都有, 后文不再重复.

<!-- page 2 of 7 -->

![散点图 "Performance / GPQA-Diamond". 纵轴是 GPQA-Diamond 分数, 刻度 35, 40, 45; 横轴是每个 token 的延迟毫秒数, 刻度 10 到 16. 读图估算: Mistral Small 3.1 (24B) 约 10.9 毫秒, 46 分, 位于左上角浅红色三角区内; GPT-4o Mini 约 11.9 毫秒, 39.4 分; Gemma 3-it (27B) 约 13.3 毫秒, 42.4 分; Claude-3.5 Haiku 约 15.1 毫秒, 41.6 分](images/p02-chart-2.png)

![第 2 页被 cookie 弹窗挡住的截图. 右上角露出图注的后半句 "4xH100, proprietary models measured through API", 弹窗右侧露出下方正文的句尾](images/p02-chart.png)

(Caption, first half covered by the banner) ... 4xH100, proprietary models measured through API.

(图注, 前半句被弹窗盖住) ...在 4xH100 上测得, 闭源模型通过 API 测得.

> **核对:** 图注开头被盖住, 只剩 「4xH100」.
> 按字面看, 开源模型在 4 张 H100 上跑, 闭源模型走 API. 真是这样的话, 横轴把本地推理和带网络往返的 API 调用放在一起比, 延迟口径并不统一.

Mistral Small 3.1 is released under an Apache 2.0 license.

Mistral Small 3.1 以 Apache 2.0 许可证发布.

Modern AI applications demand a blend of capabilities—handling text, understanding multimodal inputs, supporting multiple languages, and managing long contexts—with low latency and cost efficiency. As shown below, Mistral Small 3.1 is the first open source model that not only meets, but in fact surpasses, the performance of leading small proprietary models across all these dimensions.

现在的 AI 应用要同时具备好几种能力: 处理文本, 理解多模态输入, 支持多种语言, 管理长上下文, 还要延迟低, 成本省. Mistral 说, 下文会展示 Mistral Small 3.1 是第一个在这些维度上全面追平, 并且实际超过头部小型闭源模型的开源模型.

> **看表:** 「across all these dimensions」 点了文本, 多模态, 多语言, 长上下文四项.
> 打印稿里只有 GPQA-Diamond 一张图有数, 后面四个小节标题下都是空白, 这句话在本页没法逐项核对.

Below you will find more details on model performance. Whenever possible, we show numbers reported previously by other providers, otherwise we evaluate models through our common evaluation harness.

下面是更细的性能数据. 能用其他厂商已公布数字的地方就直接引用, 没有的再用我们统一的评测框架自己跑.

> **拆开:** 同一张图里混着两种来源, 一种是厂商自报, 一种是 Mistral 自己跑的.
> 两边的 prompt 格式, 采样参数未必一致, 读图时一两分的差距不宜当成定论.

## Instruct Performance

## 指令模型性能

### Text instruct benchmarks

### 文本指令基准

(打印稿中此处图表为空白, 没有可读数据.)

<!-- page 3 of 7 -->

![cookie 弹窗里 "Toggle all" 的开关图标, 和第 1 页同一个](images/p03-hl.png)

## Multimodal Instruct Benchmarks

## 多模态指令基准

MM-MT-Bench scaled to between 0 and 100.

MM-MT-Bench 的分数换算到 0 到 100 区间.

> **确认:** 特意注明换算, 说明 MM-MT-Bench 原本不是百分制.
> 换算方法没写, 打印稿也没印出分数, 这一节无从复算.

## Multilingual

## 多语言

(打印稿中此处图表为空白.)

## Long Context

## 长上下文

(打印稿中此处图表为空白.)

## Pretrained Performance

## 预训练模型性能

We also release the pretrained base model for Mistral Small 3.1.

我们同时放出 Mistral Small 3.1 的预训练基座模型.

All pretrain...

「All pretrain」 之后的文字在打印稿中被截断.

> **回看:** 第 3 页最后只剩 「All pretrain」 几个字母.
> 从上下文看, 这里本该交代基座模型评测的统一口径, 但后文和图表都缺, 本页一个基座模型分数都没有.

<!-- page 4 of 7 -->

## Use cases

## 使用场景

Mistral Small 3.1 is a versatile model designed to handle a wide range of generative AI tasks, including instruction following, conversational assistance, image understanding, and function calling. It provides a solid foundation for both enterprise and consumer-grade AI applications.

Mistral Small 3.1 是一个多面手, 面向各类生成式 AI 任务, 包括指令遵循, 对话助手, 图像理解和函数调用. 企业级应用和消费级应用都可以拿它打底.

## Key Features and Capabilities

## 主要特性与能力

- **Lightweight.** Mistral Small 3.1 can run on a single RTX 4090 or a Mac with 32GB RAM. This makes it a great fit for on-device use cases.
- **轻量.** Mistral Small 3.1 能在单张 RTX 4090 上运行, 也能在 32GB 内存的 Mac 上运行, 很适合端侧场景.

> **停一下:** 24B 参数按 bf16 存, 权重约 48GB (24 x 2 字节).
> 32GB 的 Mac 放不下未量化权重, 这句话默认了量化部署, 但页面没说用几 bit.

- **Fast-response conversational assistance.** Ideal for virtual assistants and other applications where quick, accurate responses are essential.
- **快速响应的对话助手.** 适合虚拟助手这类要求回答又快又准的应用.

- **Low-latency function calling.** Capable of rapid function execution within automated or agentic workflows.
- **低延迟函数调用.** 能在自动化流程或 agent 工作流里快速完成函数调用.

- **Fine-tuning for specialized domains.** Mistral Small 3.1 can be fine-tuned to specialize in specific domains, creating accurate subject matter experts. This is particularly useful in fields like legal advice, medical diagnostics, and technical support.
- **面向专业领域微调.** Mistral Small 3.1 可以针对特定领域微调, 做成准确的领域专家模型. 法律咨询, 医疗诊断, 技术支持这类领域尤其用得上.

- **Foundation for advanced reasoning.** We continue to be impressed by how the community builds on top of open Mistral models. Just in the last few weeks, we have seen several excellent reasoning models built on Mistral Small 3, such as the DeepHermes 24B by Nous Research. To that end, we are releasing both base and instruct checkpoints for Mistral Small 3.1 to enable further downstream customization of the model.
- **高级推理的底座.** 社区基于 Mistral 开放模型做出来的东西一直让我们印象深刻. 就在过去几周, 已经出现了好几个基于 Mistral Small 3 的优秀推理模型, 比如 Nous Research 的 DeepHermes 24B. 因此这次 Mistral Small 3.1 的 base 和 instruct 两个 checkpoint 都放出来, 方便下游继续定制.

> **再看:** DeepHermes 24B 建在 Mistral Small 3 上, 不是 3.1.
> 这里是拿上一代的社区衍生模型, 来解释这一代为什么 base 和 instruct 一起放.

Mistral Small 3.1 can be used across various enterprise and consumer applications that require multimodal understanding, such as document verification, diagnostics, on-device image processing, visual inspection for quality checks, object detection in security systems, image-based customer support, and general purpose assistance.

需要多模态理解的企业和消费级应用都能用上 Mistral Small 3.1, 比如文档核验, 诊断, 端侧图像处理, 质检中的视觉检查, 安防系统里的目标检测, 基于图片的客服, 以及通用助手. (这句从第 4 页末尾跨到第 5 页开头, 此处合并.)

<!-- page 5 of 7 -->

## Availability

## 获取方式

Mistral Small 3.1 is available to download on the huggingface website Mistral Small 3.1 Base and Mistral Small 3.1 Instruct. For enterprise deployments with private and optimized inference infrastructure, please contact us.

Mistral Small 3.1 可以在 Hugging Face 下载, 分 [Mistral Small 3.1 Base](https://huggingface.co/mistralai/Mistral-Small-3.1-24B-Base-2503) 和 [Mistral Small 3.1 Instruct](https://huggingface.co/mistralai/Mistral-Small-3.1-24B-Instruct-2503) 两个版本. 需要私有化, 优化过的推理设施做企业部署, 请[联系我们](https://mistral.ai/contact).

You can also try the model via API on Mistral AI's developer playground La Plateforme starting today. The model is also available on Google Cloud Vertex AI. Mistral Small 3.1 will be available on NVIDIA NIM and Microsoft Azure AI Foundry in the coming weeks.

从今天起, 也可以在 Mistral AI 的开发者平台 [La Plateforme](https://mistral.ai/news/la-plateforme) 通过 API 试用. 模型同时上线 [Google Cloud Vertex AI](https://cloud.google.com/vertex-ai/generative-ai/docs/partner-models/mistral). 接下来几周还会上 [NVIDIA NIM](https://developer.nvidia.com/nim) 和 [Microsoft Azure AI Foundry](https://ai.azure.com/explore/models?&selectedCollection=mistral).

> **对一下:** 仓库名 Mistral-Small-3.1-24B-Base-2503 里的 2503 对应 2025 年 3 月.
> 和页首日期 March 17, 2025 一致; 24B 这个数在正文里没出现, 只在仓库名和第 2 页图的标签里.

Happy building!

祝开发顺利!

Products: Vibe, Vibe Code, Studio, Forge, Compute, Pricing. Solutions: Delivery methodology.

产品: Vibe, Vibe Code, Studio, Forge, Compute, 定价. 解决方案: 交付方法.

<!-- page 6 of 7 -->

Model customization, Coding, Document intelligence, Speech, Mistral for finance, Mistral for public institutions, Mistral for manufacturing, Mistral for energy & utilities. Why Mistral: About us, Careers, Partners, Our customers, Our models, Brand. Company: Terms of Service, Privacy Policy, Privacy choices, Data processing agreement, Trust Center, Legal notice. Get Mistral Vibe.

模型定制, 编程, 文档智能, 语音, 金融, 公共机构, 制造业, 能源与公用事业方案. 为什么选 Mistral: 关于我们, 招聘, 合作伙伴, 客户, 我们的模型, 品牌. 公司: 服务条款, 隐私政策, 隐私选项, 数据处理协议, 信任中心, 法律声明. 获取 Mistral Vibe. (这一页是网站页脚导航, 右下角露出 Google Play 下载按钮.)

<!-- page 7 of 7 -->

![网站页脚截图: 顶部 "Get in touch" 导航条, 黑色像素 Logo 下半部, "Mistral AI © 2026" 和语言切换 "English", 下方橙红渐变色带上压着 cookie 弹窗](images/p07-get-in-touch-https-mistral-ai-contact.png)

Mistral AI © 2026. English.

Mistral AI 版权所有 2026. 语言: English.

> **想:** 页脚写 © 2026, 发布日期是 2025 年 3 月 17 日.
> 版权年份来自打印时的网站页脚, 不代表发布时间, 本页时间以正文日期为准.
