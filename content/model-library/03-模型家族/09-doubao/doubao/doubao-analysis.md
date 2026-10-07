---
title: "ByteDance Seed 英文门户: 从一张首页看家族到了哪一代"
category: "模型库"
tags: ["Doubao", "技术解析"]
published: true
excerpt: "目录名叫 doubao, 但整页没有出现 「Doubao」 或 「豆包」."
---
# ByteDance Seed 英文门户: 从一张首页看家族到了哪一代

> 源文 `doubao.md` 是 ByteDance Seed 英文门户首页的 MinerU 抓取 (4 页, 13 张图), 标题位是 Seed2.1, 后面是六条近期博客, 一组产品入口和页脚. 它不是论文.

来源: 同目录 `doubao.md` (页标记 `page 1 of 4` 到 `page 4 of 4`). 对照译稿见 `doubao-bi.md`. 13 张图里 11 张是小图标或卡片缩略图, 1 张 (`p01-seed2-1.png`) 抓成了纯黑块, 1 张 (`p03-image.png`) 是 Dreamina 的轮播截图.

## 1. 这页在谱系里的作用

目录名叫 doubao, 但整页没有出现 「Doubao」 或 「豆包」. 这本身就是一条谱系信息: 2025 年初的旗舰还叫 Doubao-1.5-pro, 到 Seed1.5-Thinking, Seed1.5-VL 开始以 Seed 命名技术报告, 再到 Seed2.0, Seed2.1 的模型卡, **对外的技术品牌已经换成 Seed, 豆包留在产品侧.** 门户首页只挂 Seed 的名字, 能和对话产品挂上钩的只有第 3 页的 Dola 入口 (`dola.com/chat`), 以及第 1 页试用链接里以 `dola-` 开头的模型 ID. Dola 与豆包的关系页面没写, 所以这里不把两者画等号.

页面从上到下是: 团队名 ByteDance Seed, 语言切换, 口号 「Advancing the frontier of intelligence, in service of humanity」, 头条 Seed2.1, 最新动态六条, 「Explore AI products and services」 一节, 产品链接, 页脚. 这是典型的机构首页, 功能是把读者送到博客, 产品页和试用入口. 数据, 架构, 训练, 评测这些面, 这页一概没有, 要回到同家族目录下 seed-2-1, seed-2-0 等条目的源文去读.

## 2. 头条: Seed2.1 的一句话和三个去向

Seed2.1 只配了一句话: 「A next-generation agent for real-world productivity」, 即面向真实世界生产力的新一代智能体. **把模型直接称作 agent, 而不是 language model**, 和 Seed2.1 模型卡的主线一致: 那份卡以通用 Agent, 生产级编程, 前沿研究和 Seed for Seed 四章组织, 评测也大量绑定 harness 和产品环境. Agent 训练与评测的一般讨论见 [Agentic RL 训练](../../../../LargeLanguageModelGuide/13-Agent/13.4-Agent训练与进化/13.4.1-AgenticRL训练/13.4.1-AgenticRL训练.md) 和 [Benchmark 与 Eval](../../../../LargeLanguageModelGuide/13-Agent/13.5-Agent应用与治理/13.5.2-Benchmark与Eval/13.5.2-Benchmark与Eval.md).

三个链接分工清楚. Learn more 进站内产品页 `/en/seed2_1`; Tech blog 进一篇 slug 为 `seed2-1-officially-released-advancing-ai-productivity` 的博客; Try now 跳到 BytePlus 的 playground, 参数是 `model=dola-seed-2-1-turbo-260628`. 这个 ID 带了标题没有的 `turbo` 后缀, 对应模型卡里的 Seed2.1 Turbo 一档; `260628` 形如 2026-06-28 的日期版本号, 这是按格式推断, 页面没有解释. 头条配图抓成一块纯黑矩形, 没有补充信息.

## 3. 最新动态: 家族的横向铺开

六条按日期倒序: 8 月 5 日音视频全双工大模型 (Audio), 7 月 31 日 Seedance 2.5 (Visual), 7 月 23 日 Seed STEM Fellows 项目开放 (Research programs), 7 月 20 日 Seed Audio 1.0 音频创作模型 (Audio), 7 月 8 日 Seedream 5.0 Pro (Visual), 7 月 7 日 EdgeBench (Frontier research). 按类别看是四条模型发布, 一条研究项目, 一条研究博客. 放在谱系里读, 这说明 2026 年的 Seed 已经不是 「一个旗舰语言模型加若干变体」, 而是**语言, 图像, 视频, 音频, 全双工语音各有独立产品线, 共用一个团队品牌**.

几条标题各有可记的点. 第一条写 「Fully Multimodal」, URL 却写 「omni-modal」 并带 `seedrealtime` 前缀, 与第 3 页的 SeedRealtime 站内链接对得上名字; 1.5 代 pro 产品页已经把语音和文本 token 放进同一序列训练, 这条全双工模型是否由那条线演化而来, 页面没说. 全双工的一般讨论见 [Omni 与全双工](../../../../LargeLanguageModelGuide/8-多模态/8.7-Omni与全双工/8.7-Omni与全双工.md). EdgeBench 标题说测量真实世界的环境学习并发现新的 Scaling Law, 但页面没有曲线和变量, 看不出这条规律描述的是部署前的规模投入还是部署后的环境交互量.

## 4. 产品墙与这页的边界

「Explore AI products and services」 下先是一段 Dreamina 的宣传图文, 接着是五个站外产品: Dola, BytePlus, Lark, Dreamina, CapCut; 然后是四个站内页: Seedream 5.0 Pro, SeedRealtime, Seed Audio 1.0, Seed GR-RL. 前三个在最新动态里都有对应博客, GR-RL 没有, 页面只给了名字和路径 `/en/gr_rl`, 名字里的 RL 是否指强化学习, 页面没解释. Seedance 2.5 有博客, 却不在站内链接里, 只在 Dreamina 导航条里露面.

**这页能稳定回答的是链接和标题层面的事实**: Seed2.1 是当前头条, 定位是面向生产力的智能体, 试用入口指向 Turbo 版; 2026 年 7 月 7 日到 8 月 5 日之间 Seed 发了哪六条动态; Seed 模型对外关联了哪些产品. 不能回答的有: Seed2.1 的结构, 规模, 训练数据和评测成绩; Turbo 与 Pro 的差别; EdgeBench 那条规律的形式; GR-RL 是什么; Dola 与豆包的关系. 需要技术细节时, 应顺着 Tech blog 链接或同家族的 seed-2-1 条目去读原文.
