---
title: "xAI 新闻页: Grok 家族从 2023 到 2026 的发布时间线"
category: "模型库"
tags: ["xAI", "技术解析"]
published: true
excerpt: "这张页面能回答的问题很具体: xAI (后来的 SpaceXAI) 按什么顺序发过哪些模型和产品, 每条新闻给自己贴了什么标签, 哪些渠道在什么时候接入."
---
公开材料是 x.ai 新闻列表页, 不是技术报告. 全页唯一的架构数字是 Grok-1 的 314 billion 参数 MoE, 唯一的上下文数字是 Grok-1.5 的 128,000 token. 层宽, 专家拓扑, 训练配方和榜单分数页面都没有.

# xAI 新闻页: Grok 家族从 2023 到 2026 的发布时间线

来源: 同目录 `xai.md` (页标记 `page 1 of 9` 到 `page 9 of 9`), 对照译稿 `xai-bi.md`. 配图两张: `images/p02-product-sep-22-2026.png` 是 2 x 2 的近期卡片网格, `images/p09-company-legal.png` 只是页脚的月亮图标. 数字与型号名一律回源 md, 摘要在省略号处断开的地方不补宾语.

这张页面能回答的问题很具体: xAI (后来的 SpaceXAI) 按什么顺序发过哪些模型和产品, 每条新闻给自己贴了什么标签, 哪些渠道在什么时候接入. 它回答不了任何一个模型内部怎么搭, 也回答不了哪个模型在哪张榜上多少分.

## 1. 页面性质: 新闻索引, 每条只有标题和一句话

第 1 页是头条卡 Grok 4.7 (Sep 21, 2026), 口号是 「SpaceXAI's most powerful model for coding and knowledge work」, 再加一句 「Twice as fast, at half the price of comparable models」. 后面紧跟一个孤立的 「## 10」 和两张卡片名. 第 2 页的图显示近期区是四张卡按 2 x 2 排列, MinerU 按列交错读取, 所以 md 里的日期顺序变成 22, 16, 18, 4, 按行读其实是 22, 18, 16, 4. 头条 Sep 21 反而比第一张卡 Sep 22 早一天, 说明头条位是编辑挑的, 不按时间.

从第 2 页 「All posts」 开始是完整列表, 前几条是 `##` 标题加摘要, 第 3 页以后变成两列表格: 左列是标题和摘要粘在一起的一段字, 右列是日期. 很多摘要在约 100 字符处被截断, 比如 Grok 4.6 的 「more ambitious...」, Workflows 的 「across hundred...」, 图像生成的 「code-named...」. 所以这张页面适合当目录用: 先定位到某次发布, 再去同级目录的专页读正文. 同家族的 [Grok-1](../grok-1/grok-1-bi.md), [Grok 4](../grok-4/grok-4-bi.md), [Grok 4.5](../grok-4-5/grok-4-5-bi.md), [Grok 4.6](../grok-4-6/grok-4-6-bi.md), [Grok 4.7](../grok-4-7/grok-4-7.md) 都有单独材料.

## 2. 模型主线: 314B MoE 之后只剩形容词

按日期倒过来读, 模型线是这样: 2023-11-03 发布 Grok, 摘要说它以 Hitchhiker's Guide to the Galaxy 为原型; 2024-03-17 开放 Grok-1 权重与架构, 314 billion 参数 MoE; 2024-03-28 Grok-1.5, 推理提升, 上下文 128,000 token; 2024-04-12 Grok-1.5 Vision Preview, 自称 「our first multimodal model」; 2024-08-13 Grok-2 与 Grok-2 mini; 2025-02-19 Grok 3 Beta, 标题是 「The Age of Reasoning Agents」; 2025-07-09 Grok 4, 带原生工具使用与实时搜索; 2025-08-28 grok-code-fast-1; 2025-09-19 Grok 4 Fast; 2025-11-17 Grok 4.1, 两天后 Grok 4.1 Fast 与 Agent Tools API; 2026-07-16 Grok 4.5; 2026-08-12 Grok 4.6; 2026-09-21 Grok 4.7.

Grok-1 那条是全页唯一给出架构信息的. 它只说了总参数和 MoE 两件事, 机制见 [MoE](../../../../LargeLanguageModelGuide/2-核心原理与架构/2.6-MoE/2.6-MoE.md). 激活比例在同级 Grok-1 专页里 (「25% of the weights active on a given token」), 本页没有. 专家数, 每个 token 选几个专家, 路由和负载均衡怎么做, 本页一个细节都没给. 从 Grok-2 起, 每条摘要就只剩定位词: Grok 4 是 「the most intelligent model in the world」, Grok 4.5 在一周内依次被叫作 「smartest model」, 「most intelligent model yet」, 「smartest coding model」, Grok 4.6 是 「latest coding model」, Grok 4.7 是 「most powerful model for coding」. 这些最高级词本页没有任何分数支撑, 也不能拿来互相比较.

还有两处空白. 一是 Grok 3 只有 Beta 预览条目, 没有正式版新闻. 二是 2026-02-02 到 2026-04-17 之间一条新闻也没有, 而同家族目录里有 [Grok 4.20](../grok-4-20/grok-4-20-bi.md) 和 [Grok 4.3](../grok-4-3/grok-4-3-bi.md) 两个型号, 这张列表里都找不到. 4.1 之后直接跳到 4.5, 中间的版本要去专页里找发布信息.

## 3. Agent 产品线: Grok Build 与 Grok Bot

2026 年的新闻有一半在讲两个 Agent 产品. Grok Build 是编程 Agent 加 TUI: 5 月 25 日早期 Beta, 6 月加了插件市场 (6 月 11 日), 多会话的 Agent Dashboard (6 月 15 日), 长时间自主执行的 /goal (6 月 22 日); 7 月 15 日开源 harness, 7 月 23 日加 Workflows, 摘要说是把一个任务 「fan out across hundred...」 的编排脚本, 截断处丢了名词; 8 月 19 日所有套餐都能在网页和移动端用; 9 月 16 日加记忆. 容易混的地方是 5 月 29 日的 「Grok Build 0.1, our fastest coding model」, 这里 Grok Build 又是 API 里的模型名. 6 月 1 日 「Composer 2.5 is now available in Grok Build」 则说明这个 harness 能从 /models 菜单挂其它模型. 编程 Agent 的一般结构可以对照 [IDE 与 Coding Agent](../../../../LargeLanguageModelGuide/13-Agent/13.5-Agent应用与治理/13.5.1-IDE与Coding-Agent/13.5.1-IDE与Coding-Agent.md), 页面本身没讲 Grok Build 的调度或上下文管理.

Grok Bot 出现得晚一些: 8 月 11 日首发, 摘要说它是 「your team of always-on agents」, 有自己的电脑, 在工具和应用内部工作. 之后 8 月 26 日进 SuperGrok, Cursor Pro 和所有 Cursor Teams 套餐, 8 月 29 日与 X 集成, 9 月 3 日面向企业并写 「Grok and Cursor Enterprise customers have free usage for…」, 同日还有一篇设计文章讲 「agents that persist beyond a single session」, 9 月 4 日与 22 日分别是采购和客服两个用例. 跨会话持续存在的 Agent 涉及记忆和多 Agent 协作, 通用做法见 [多 Agent 系统](../../../../LargeLanguageModelGuide/13-Agent/13.3-Agent系统工程/13.3.3-多Agent系统/13.3.3-多Agent系统.md) 与 [上下文管理策略](../../../../LargeLanguageModelGuide/13-Agent/13.3-Agent系统工程/13.3.2-上下文管理策略/13.3.2-上下文管理策略.md). Grok Bot 用什么模型, 怎么存状态, 免费额度多少, 本页都没有.

## 4. 语音, 图像, 视频与检索

语音线的时间点比较密. 2025-12-17 Grok Voice Agent API; 2026-04-17 Speech to Text 与 Text to Speech API; 4 月 23 日 Grok Voice Think Fast 1.0, 「most capable voice agent」; 4 月 30 日 Custom Voices, 用短录音克隆音色; 7 月 1 日 Voice Agent Builder, 「under 2 minutes」 不写代码; 7 月 6 日新增 21 个旗舰音色, 原有 5 个提升自然度; 7 月 29 日 Grok Voice Think Fast 2.0, 「most capable speech-to-speech voice model」; 9 月 18 日 Grok Voice Transcribe 2.0. 页面没给任何延迟, 词错率或语种数. 「21」 和 「5」 不能相加成官方总数. 语音模型的一般结构见 [音频与语音模型](../../../../LargeLanguageModelGuide/8-多模态/8.3-音频与语音模型/8.3-音频与语音模型.md).

图像和视频的命名比较乱. 2024-12-09 图像生成用 「a new autoregressive image generation model, code-named...」, 代号被截掉. 2026-01-28 Grok Imagine API, 6 月 3 日 grok-imagine-video-1.5-preview (图生视频), 6 月 16 日 Grok Imagine Video 1.5, 7 月 31 日 「Imagine Video 1.5 with References」, 支持文本, 图像和语音参考, 最高 1080p; 8 月 7 日 Imagine Image 2.0. 1080p 是这条线唯一的规格数字. 检索方面只有 2025-12-22 的 Grok Collections API, 自称 「State-of-the-art RAG system built directly into our API」, 没有召回率或对照系统. RAG 的通用环节见 [RAG](../../../../LargeLanguageModelGuide/7-LLM应用开发/7.2-RAG/7.2-RAG.md).

## 5. 渠道, 订阅, 融资与公司归属

分发渠道可以按日期排出一条线. 2024-11-04 API 公测; 2026-06-17 Grok 模型进 Amazon Bedrock, 6 月 18 日进 Databricks Agent Bricks; Grok 4.5 在 7 月 28 日进 GitHub Copilot; Grok 4.6 依次是 8 月 14 日 GitHub Copilot, 8 月 19 日 Amazon Bedrock, 8 月 21 日 Gemini Enterprise Agent Platform (链接 slug 仍是 vertex-ai), 8 月 26 日 Microsoft Foundry. 办公套件方面有 Word (6 月 18 日), PowerPoint (6 月 16 日), Excel (7 月 20 日), Outlook (7 月 21 日) 和 Google Workspace (7 月 24 日). 第三方编程工具有 OpenClaw, OpenCode, Kilo Code, Warp 和 Nous Research 的 Hermes Agent, 订阅名分别写作 X Premium, X Premium+ 和 X Premium Plus, 本页没说它们是不是同一档.

公司层面的数字只有融资额: B 轮 $6 billion (2024-05-26), C 轮 $6B (2024-12-23), E 轮 $20B (2026-01-06), D 轮不在列表里. 2026-02-02 「SpaceX announced today that it has acquired xAI」, 此后条目自称 SpaceXAI, 页脚 「© 2026 SpaceXAI LLC」, 但 6 月 3 日仍写 「xAI API」. 5 月 6 日 SpaceXAI 与 Anthropic 签约, 提供 Colossus 1 的算力, 页脚 Company 栏也列了 Colossus. 政府与国家合作有四条: 2025-07-14 xAI for Government, 9 月 25 日 GSA OneGov, 11 月 19 日沙特与 HUMAIN, 12 月 11 日萨尔瓦多全国 AI 教育项目, 12 月 22 日美国战争部. 这些条目都没有合同金额或部署规模.

## 6. 安全条目与本页对不上的数字

安全相关只有 2026-09-01 一条: LatchBio 评测了 Grok 在生物安全监测和对抗性生物任务上的表现. 标题写 Biosecurity, slug 写 biosafety. 本页没有评级, 没有分数, 也没有任务说明, 所以这里只记下 「做过第三方评测」 这一事实. Agent 的安全与对齐问题见 [Agent 安全与对齐](../../../../LargeLanguageModelGuide/13-Agent/13.5-Agent应用与治理/13.5.3-Agent安全与对齐/13.5.3-Agent安全与对齐.md).

本页对不上或缺失的数字集中在几处: Grok 4.7 的 「两倍速度, 一半价格」 没有对照模型和绝对值; 「## 10」 找不到对应物; 近期卡片的日期顺序是列读造成的错位, 头条日期早于第一张卡; D 轮缺失; 21 个新音色加原有 5 个不能当总数; Grok 4.20 与 Grok 4.3 在列表里缺席, 2 月 2 日到 4 月 17 日整段空白; Grok-1 只有总参数没有激活参数. 除此之外, 页面上的日期和金额彼此之间没有矛盾.

读这张页面, 比较实用的做法是把它当作发布日历: 想知道某个功能或型号是哪天出现的, 从这里查日期和链接, 再到同级专页读正文. 想知道某个模型为什么快, 为什么便宜, 用了什么注意力或路由结构, 本页没有, 得去专页或技术报告找.
