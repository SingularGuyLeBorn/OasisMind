---
title: "StepFun 开放平台文档中心 · 对照译稿"
category: "模型库"
tags: ["StepFun", "对照译稿"]
published: true
excerpt: "StepFun 开放平台文档中心 公开材料的逐段中英对照译稿,附读报告时的疑问块."
---
<!-- page 1 of 7 -->

StepFun

StepFun

Getting started with the StepFun Open Platform Docs Center

开始使用 StepFun 开放平台文档中心

Getting started

开始使用

# StepFun Open Platform Docs Center

# StepFun 开放平台文档中心

Copy page

复制页面

## Quick links

## 快捷入口

[01 ↗](https://platform.stepfun.com/docs/zh/quickstart/overview)

[01 ↗](https://platform.stepfun.com/docs/zh/quickstart/overview)

[**Quickstart** Complete your first API call in 5 minutes](https://platform.stepfun.com/docs/zh/quickstart/overview)

[**快速开始** 5 分钟完成首次 API 调用](https://platform.stepfun.com/docs/zh/quickstart/overview)

品

品

[**Console** Manage API Keys and view usage](https://platform.stepfun.com/account-overview)

[**控制台** 管理 API Key, 查看用量](https://platform.stepfun.com/account-overview)

[02 ↗](https://platform.stepfun.com/account-overview)

[02 ↗](https://platform.stepfun.com/account-overview)

![Image block](images/p01-03-https-platform-stepfun-com-docs-zh-api-reference.png)

[03 ↗](https://platform.stepfun.com/docs/zh/api-reference)

[03 ↗](https://platform.stepfun.com/docs/zh/api-reference)

[**API docs** Interface specs and parameter notes](https://platform.stepfun.com/docs/zh/api-reference)

[**API 文档** 查看接口规范与参数说明](https://platform.stepfun.com/docs/zh/api-reference)

<>

<>

[**AI Coding tool setup** Wire Step-series models into AI coding tools](https://platform.stepfun.com/docs/zh/step-plan/quick-start)

[**AI Coding 工具配置** 在 AI 编程工具中接入 Step 系列模型](https://platform.stepfun.com/docs/zh/step-plan/quick-start)

[04 ↗](https://platform.stepfun.com/docs/zh/step-plan/quick-start)

[04 ↗](https://platform.stepfun.com/docs/zh/step-plan/quick-start)

[05 ↗](https://platform.stepfun.com/docs/zh/guides/pricing)

[05 ↗](https://platform.stepfun.com/docs/zh/guides/pricing)

[06 ↗](https://platform.stepfun.com/docs/zh/faq/common-questions)

[06 ↗](https://platform.stepfun.com/docs/zh/faq/common-questions)

[**Pricing & billing** Model prices and rate-limit quotas](https://platform.stepfun.com/docs/zh/guides/pricing)

[**定价与计费** 查看模型价格与流控配额](https://platform.stepfun.com/docs/zh/guides/pricing)

[**FAQ** Common questions and answers](https://platform.stepfun.com/docs/zh/faq/common-questions)

[**常见问题** 查询常见疑问与答疑](https://platform.stepfun.com/docs/zh/faq/common-questions)

## Model capability overview

## 模型能力总览

Five category entries in total, for browsing public models by capability

共 5 个分类入口, 便于按能力快速浏览公开模型

Official recommended models · All models · Reasoning · Vision · Speech

官方推荐模型 全部模型 推理 视觉 语音

> **想:** 「共 5 个分类入口」 与同页列出的 「官方推荐模型 / 全部模型 / 推理 / 视觉 / 语音」 是否一一对应?
> 源文先写 「共 5 个分类入口」, 再并列这五个中文标签. 材料没有给第六个入口, 也没有解释 「官方推荐」 与 「全部模型」 是否互斥. 能核对的只有: 入口数写成 5, 标签也正好是这五项.

<!-- page 2 of 7 -->

StepFun

StepFun

### Step 5 Preview

### Step 5 Preview

Next-generation flagship base model

新一代旗舰基模

**Max context** 1M

**最大上下文** 1M

A next-generation flagship base model aimed at real tasks, focused on coding and professional knowledge work; natively supports text, image, and video inputs; can keep multi-step tasks moving with tools and documents. API model ID: `step-5-preview`.

面向真实任务的新一代旗舰基模, 重点覆盖编程与专业知识工作, 原生支持文本, 图片与视频输入, 可结合工具与文档持续推进多步骤任务. API 模型 ID: step-5-preview.

**Knowledge work**

**知识工作**

**Coding**

**编程**

**Agent**

**Agent**

**Image & video understanding**

**图片与视频理解**

**Get started**

**开始使用**

Quick start · Send your first request

快速上手 发送第一次请求

[**Model overview** Capabilities, specs, and config](https://platform.stepfun.com/docs/docs/zh/guides/models/step-5-preview)

[**模型总览** 能力, 规格与配置](https://platform.stepfun.com/docs/docs/zh/guides/models/step-5-preview)

**Reasoning / multimodal · Recommended**

**推理 / 多模态 推荐**

### Step 3.7 Flash

### Step 3.7 Flash

Multimodal reasoning flagship

多模态推理旗舰

**Max context** 256K

**最大上下文** 256K

StepFun's flagship multimodal reasoning model. On top of step-3.5-flash's high-speed reasoning and tool-calling, it adds **native multimodal input**, so it can understand image and video content directly without a vision MCP or an extra model. Supports

阶跃星辰旗舰多模态推理模型. 在 step-3.5-flash 的高速推理与工具调用能力基础上, 新增**原生多模态输入能力**, 可直接理解图片和视频内容, 无需借助视觉 MCP 或额外模型. 支持

> **问:** Step 5 Preview 的 「最大上下文 1M」 与同页 Step 3.7 Flash 的 「256K」 差在哪一层, 源文有没有给机制解释?
> 没有. 两处都只给产品规格口号与能力标签. 源文没有层宽, 注意力变体, 训练配方或上下文外推算法. 能抄的只有: Step 5 Preview 写 1M, Step 3.7 Flash 写 256K.

> **核对:** Step 3.7 Flash 段末 「支持」 之后原文是否完整?
> 源文在 「支持」 处断页, 下一页直接是模型页 / 快速上手 / 开发指南链接, 没有补全 「支持」 的宾语. bi 与精读都不能臆补未出现的功能列表.

<!-- page 3 of 7 -->

StepFun

StepFun

[Model page Step 3.7 Flash](https://platform.stepfun.com/docs/docs/zh/guides/models/step-3.7-flash) [Quickstart Multimodal quickstart](https://platform.stepfun.com/docs/docs/zh/quickstart/overview) [Dev guide Reasoning-model guide](https://platform.stepfun.com/docs/docs/zh/guides/developer/reasoning)

[模型页 Step 3.7 Flash](https://platform.stepfun.com/docs/docs/zh/guides/models/step-3.7-flash) [快速上手 多模态快速上手](https://platform.stepfun.com/docs/docs/zh/quickstart/overview) [开发指南 推理模型开发指南](https://platform.stepfun.com/docs/docs/zh/guides/developer/reasoning)

**Reasoning / text · Recommended**

**推理 / 文本 推荐**

### Step 3.5 Flash 2603

### Step 3.5 Flash 2603

Agent-optimized

Agent 优化

**Max context** 256K

**最大上下文** 256K

Optimized from step-3.5-flash for high-frequency Agent scenes: keeps flagship reasoning and tool calling, further raises Token efficiency and reasoning speed, and supports switching to a low-reasoning mode to cut cost. Coding and Agent-framework compatibility also received targeted work.

基于 step-3.5-flash 针对高频 Agent 场景优化, 在保留旗舰推理与工具调用能力的同时, 进一步提升 Token 效率与推理速度, 并支持切换低推理模式以降低消耗. 对 Coding 与 Agent 框架兼容性也做了专项优化.

**Reasoning**

**推理**

**Agent**

**Agent**

**Low-reasoning mode**

**低推理模式**

**Related links**

**相关入口**

Model page Step 3.5 Flash

模型页 Step 3.5 Flash

[Dev guide Reasoning-model guide](https://platform.stepfun.com/docs/docs/zh/guides/developer/reasoning)

[开发指南 推理模型开发指南](https://platform.stepfun.com/docs/docs/zh/guides/developer/reasoning)

API docs Chat Completion API

API 文档 Chat Completion API

> **拆开:** 「低推理模式以降低消耗」 是部署前训练档, 还是调用时可切换的推理深度?
> 原文写 「支持切换低推理模式以降低消耗」, 落点是可切换与降消耗, 没有写训练课表, 也没有写 TestingTime 预算或采样次数. 能核对的只有产品开关语义; 不要把它读成部署前 scaling, 也不要擅自写成 TestingTime 加算力.

**Realtime speech**

**实时语音**

**Recommended**

**推荐**

### StepAudio 3 Realtime

### StepAudio 3 Realtime

Talk like a person, and think while doing

像真人一样聊, 也能边想边做

<!-- page 4 of 7 -->

StepFun

StepFun

A full-duplex speech flagship for realtime interaction. It combines realtime audio understanding, natural barge-in, floor coordination, adaptive reasoning, speak-while-thinking, and Voice Agent tool calling: simple questions get quick replies; complex tasks are expressed while thinking. Aimed at smart cockpit, smart terminals, customer service, and emotional companionship.

面向实时互动的全双工语音旗舰. 融合实时音频理解, 自然打断, 话权协调, 自适应推理, 边想边说与 Voice Agent 工具调用, 简单问题快速回应, 复杂任务边思考边表达, 适合智能座舱, 智能终端, 客服和情感陪伴等场景.

**Full duplex**

**全双工**

**Adaptive reasoning**

**自适应推理**

**Voice Agent**

**Voice Agent**

**Related links**

**相关入口**

[**Model page** **StepAudio 3 Realtime**](https://platform.stepfun.com/docs/docs/zh/guides/models/stepaudio-3-realtime)

[**模型页** **StepAudio 3 Realtime**](https://platform.stepfun.com/docs/docs/zh/guides/models/stepaudio-3-realtime)

[**Dev guide** **Realtime bidirectional speech**](https://platform.stepfun.com/docs/docs/zh/guides/developer/realtime)

[**开发指南** **实时双向语音开发**](https://platform.stepfun.com/docs/docs/zh/guides/developer/realtime)

[**API docs** **Realtime Chat API**](https://platform.stepfun.com/docs/docs/zh/api-reference/realtime/chat)

[**API 文档** **Realtime Chat API**](https://platform.stepfun.com/docs/docs/zh/api-reference/realtime/chat)

> **确认:** 「自适应推理」 / 「边想边说」 是否等于 TestingTime (推理时算力) 的量化披露?
> 原文只把自适应推理, 边想边说与全双工, Voice Agent 工具调用并列成产品能力, 并区分 「简单问题快速回应」 与 「复杂任务边思考边表达」. 没有给出额外采样次数, 搜索宽度或算力预算. 不能把这两句标语读成已公开的 TestingTime 协议.

**Speech dialogue · Recommended**

**语音对话 推荐**

### StepAudio 2.5 Chat

### StepAudio 2.5 Chat

A dialogue model with a "live-person" feel

活人感对话大模型

**Output modality**

**输出模态**

Text only

仅文本

A dialogue model that truly has a "live-person" feel, returning text only. It can deeply parse complex meaning, make witty asides, and claims top-tier paralinguistic sensing — reading hesitation and light laughter in tone, then giving high-EQ feedback. Supports fully custom personas at large scale, with fine-grained personality traits, signature verbal tics, and emotion boundaries.

真正具备「活人感」的对话大模型, 仅文本返回. 能深度理解复杂语意, 机智抛梗, 具备行业顶级副语言感知力 — 读懂语气中的迟疑与轻笑, 输出高情商反馈. 支持千万人设完全自定义, 细颗粒度定义性格特征, 专属口癖与情绪边界.

**Dialogue**

**对话**

**Paralinguistic sensing**

**副语言感知**

**Persona customization**

**人设自定义**

**Related links**

**相关入口**

[**Model page** **StepAudio 2.5 Chat**](https://platform.stepfun.com/docs/docs/zh/guides/models/stepaudio-2.5-chat) [**API docs** **Chat Completion API**](https://platform.stepfun.com/docs/docs/zh/api-reference/chat/chat-completion-create)

[**模型页** **StepAudio 2.5 Chat**](https://platform.stepfun.com/docs/docs/zh/guides/models/stepaudio-2.5-chat) [**API 文档** **Chat Completion API**](https://platform.stepfun.com/docs/docs/zh/api-reference/chat/chat-completion-create)

> **停一下:** 分组标签是 「语音对话」, 规格却写 「输出模态 仅文本」, 源文怎么自洽?
> 源文同卡并列这两句, 没有另写音频输出. 读法应落在: 产品放在语音对话推荐位, 但明确声明返回文本. 不要自行补成语音合成输出.

<!-- page 5 of 7 -->

StepFun

StepFun

In timbre base, intonation layers, rhythmic pulse, and breath pauses, the model closely follows native human spoken norms; it can present laughter, tongue clicks, hesitation, stuttering, repetition, and self-correction at a human-like level, and naturally express emotion and tone shifts along the semantic thread.

模型在音色基底, 语调层次, 节奏律动与气口停顿上高度贴合人类原生口语范式, 能够呈现笑声, 咂嘴, 迟疑, 结巴, 重复和改口等真人级口语表现, 并根据语义脉络自然表达情绪与语气变化.

**Human-like delivery**

**真人级表现**

**Low-latency streaming**

**低时延流式**

**Comprehensive audio generation**

**综合音频生成**

**Related links**

**相关入口**

Model page StepAudio 3 TTS

模型页 StepAudio 3 TTS

[Dev guide **Speech synthesis guide**](https://platform.stepfun.com/docs/docs/zh/guides/developer/tts)

[开发指南 **语音合成开发指南**](https://platform.stepfun.com/docs/docs/zh/guides/developer/tts)

API docs Audio synthesis API

API 文档 音频合成 API

> **回看:** p5 开篇口语表现段紧接 p4 的 StepAudio 2.5 Chat, 但 「相关入口」 指向 StepAudio 3 TTS, 这段属于哪张卡?
> 抓取源文在 Chat 卡结束后没有另起 `##` 标题, 却直接写音色 / 气口, 随后相关入口是 StepAudio 3 TTS. 材料没有把段落标题写成 StepAudio 3 TTS. 精读时应把口语表现句与 TTS 入口绑在一起引用, 不要把它们算进 「仅文本」 的 Chat 卡能力.

**Speech recognition · Recommended**

**语音识别 推荐**

### StepAudio 2.5 ASR

### StepAudio 2.5 ASR

Next-generation streaming ASR flagship

新一代流式 ASR 旗舰

**Model scale** 4B MTP

**模型规模** 4B MTP

StepFun's next-generation speech recognition model: 4B parameters + Multi-Token Prediction (MTP) architecture; predicts multiple Tokens in parallel in one step; transcribes 5 minutes of audio within 1 second. Keeps SOTA transcription accuracy while cutting latency a lot; aimed at Voice Agent, large-batch transcription, realtime captions / livestream, and similar scenes.

阶跃新一代语音识别模型, 4B 参数 + Multi-Token Prediction (MTP) 架构, 单步并行预测多个 Token, 5 分钟音频 1 秒内完成转写. 在保持 SOTA 转写精度的同时大幅降低时延, 适合 Voice Agent, 大规模批量转写, 实时字幕 / 直播等场景.

**Ultra-fast inference**

**极速推理**

**SOTA accuracy**

**SOTA 精度**

**Chinese–English bilingual**

**中英双语**

**Related links**

**相关入口**

[**Model page** **StepAudio 2.5 ASR**](https://platform.stepfun.com/docs/docs/zh/guides/models/stepaudio-2.5-asr) [**API docs** **Speech recognition (streaming text)**](https://platform.stepfun.com/docs/docs/zh/api-reference/audio/asr-sse)

[**模型页** **StepAudio 2.5 ASR**](https://platform.stepfun.com/docs/docs/zh/guides/models/stepaudio-2.5-asr) [**API 文档** **语音识别 (流式返回文本)**](https://platform.stepfun.com/docs/docs/zh/api-reference/audio/asr-sse)

> **再看:** 「4B MTP」 与 「单步并行预测多个 Token」 之外, 源文还给出哪些架构细节?
> 没有. 这是全文几乎唯一带参数量与架构专名的句子. 没有层数, 专家拓扑, 训练数据量或对照消融. 「SOTA 精度」 也没有附榜名单分. 只能按原句抄 4B, MTP, 5 分钟 / 1 秒.

<!-- page 6 of 7 -->

[Reasoning / text](https://platform.stepfun.com/docs/zh/welcome)

[推理 / 文本](https://platform.stepfun.com/docs/zh/welcome)

### Flagship reasoning

### 旗舰推理

**Max context** 256K

**最大上下文** 256K

A flagship reasoning model built for agent construction. Reasoning depth is said to match top closed-source models, with very fast response and stable, reliable tool calling. On top of general reasoning, it is stronger at complex project planning and long-horizon task execution.

旗舰级推理模型, 专为智能体构建而生. 推理深度比肩顶尖闭源模型, 同时具备极速响应与稳定可靠的工具调用能力. 在通用推理能力基础之上, 更擅长复杂项目规划与长程任务执行.

**Reasoning**

**推理**

**Tool calling**

**工具调用**

**Related links**

**相关入口**

[**Model page** **Step 3.5 Flash**](https://platform.stepfun.com/docs/docs/zh/guides/models/step-3.5-flash)

[**模型页** **Step 3.5 Flash**](https://platform.stepfun.com/docs/docs/zh/guides/models/step-3.5-flash)

[**Dev guide** **Reasoning-model guide**](https://platform.stepfun.com/docs/docs/zh/guides/developer/reasoning)

[**开发指南** **推理模型开发指南**](https://platform.stepfun.com/docs/docs/zh/guides/developer/reasoning)

[**API docs** **Chat Completion API**](https://platform.stepfun.com/docs/docs/zh/api-reference/chat/chat-completion-create)

[**API 文档** **Chat Completion API**](https://platform.stepfun.com/docs/docs/zh/api-reference/chat/chat-completion-create)

> **对一下:** 这张无型号副标题的 「旗舰推理」 卡, 与前面的 Step 3.5 Flash 2603 是不是同一产品句?
> 相关入口明确指向模型页 Step 3.5 Flash; 2603 卡写的是 「基于 step-3.5-flash ... Agent 优化」, 相关入口也写 Step 3.5 Flash. 源文没有声明 2603 与本卡是否同一 API ID, 也没有对照表. 引用时应分开抄两段产品文案, 用入口名 Step 3.5 Flash 串起来, 不要自行合并成一个规格表.

**Speech synthesis · Recommended**

**语音合成 推荐**

### Step TTS Mini

### Step TTS Mini

High-expressiveness TTS

高表现力 TTS

**Single-input cap** 1000 characters

**单次输入上限** 1000 字符

Supports Chinese, English, Japanese, Cantonese, and Sichuanese; offers 19 official voices; also has strong voice-clone ability for Chinese, English, and Japanese. Aimed at outbound customer service, emotional companionship, and smart-assistant voice interaction where human-like pronunciation matters.

支持中, 英, 日语, 粤语, 四川话, 提供 19 种官方音色, 兼具出色的音色复刻能力, 支持中, 英, 日语复刻. 适合客服外呼, 情感陪伴, 智能助手语音交互等对发音真人感要求高的场景.

**Speech generation**

**语音生成**

**Voice clone**

**音色复刻**

**Emotion / style**

**情绪风格**

<!-- page 7 of 7 -->

StepFun

StepFun

**Image generation / edit**

**图像生成 / 编辑**

**Soon to be retired**

**即将下线**

### Step Image Edit 2

### Step Image Edit 2

Text-to-image + image edit in one

文生图 + 图像编辑一体化

**Per-response** 1-2 seconds

**单次响应** 1-2 秒

StepFun's latest lightweight edit model: one model supports both text-to-image and image edit. Within the sub-6B parameter scale it claims same-scale performance leadership, and can cross-scale match 12B-20B open models, reshaping realtime interactive retouching.

阶跃星辰最新迭代的轻量级编辑模型, 单模型同时支持文生图与图像编辑. 在 6B 以下参数规模内实现同量级性能标杆, 可跨量级对标 12B-20B 级开源大模型, 重塑实时交互修图体验.

**Text-to-image**

**文生图**

**Image edit**

**图像编辑**

**Ultra-fast response**

**极速响应**

**Related links**

**相关入口**

Model page Step Image Edit 2

模型页 Step Image Edit 2

[Dev guide **Image-edit guide**](https://platform.stepfun.com/docs/zh/guides/developer/image-edit)

[开发指南 **图像编辑开发指南**](https://platform.stepfun.com/docs/zh/guides/developer/image-edit)

API docs Image-edit API

API 文档 图像编辑 API

> **看表:** 卡上同时出现 「即将下线」 与完整能力 / 入口, 源文有没有给下线日期或替代型号?
> 没有. 只在分组旁标 「即将下线」, 正文仍写最新迭代, 1-2 秒, 6B 以下与 12B-20B 对标. 精读应同时保留 「仍列出」 与 「即将下线」 两句, 不要写成已经下架, 也不要臆造替代模型名.

Was this page helpful?

此页面对您有帮助吗?

Yes

凸是

No

否
[Quickstart](https://platform.stepfun.com/docs/zh/quickstart/overview)

[快速开始](https://platform.stepfun.com/docs/zh/quickstart/overview)

[Technical support](https://www.mintlify.com/?utm_campaign=poweredBy&utm_medium=referral&utm_source=stepfun)

[技术支持](https://www.mintlify.com/?utm_campaign=poweredBy&utm_medium=referral&utm_source=stepfun)
