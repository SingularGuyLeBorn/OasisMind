---
title: "01 · Claude 3.5 Sonnet：中档价、旗舰分，再加 Artifacts 与 Computer Use"
date: 2026-08-30
as_of: 2026-08-30
tags: [Claude-3.5-Sonnet, 公开材料精读, Artifacts, Computer-Use]
---

# Claude 3.5 Sonnet：编码之神与交互式工件 (Artifacts) - 架构还原与精译

>  **[返回 14.13-Claude 家族总览](../14.13-Claude.md)** · 前代：[Claude 3 Opus](../06-Claude-3-Opus/01-06-Claude-3-Opus-架构精译.md) · 同代：[3.5 Haiku](../08-Claude-3.5-Haiku/01-08-Claude-3.5-Haiku-架构精译.md) · Computer Use：[09](../09-Claude-Computer-Use/01-09-Claude-Computer-Use-架构精译.md) · 已有长 D5：[编码与 Agent 交互](./05-07-Claude-3.5-Sonnet-编码能力突破与Agent化交互设计.md)

> **解析**：Anthropic 极少透露具体的模型参数量与训练架构。本章内容综合了其官方 System Card、相关安全对齐论文(如 Constitutional AI)与逆向测试数据进行深度推演。

**公开材料精读**。上面「解析」原文保留。没有层数、没有优化器、没有数据配比。两份 addendum 是评测与安全附录，不是架构论文。博文图柱高不估像素。

| 源 | 日期 | 钉死什么 |
|----|------|----------|
| [Claude 3.5 Sonnet](https://www.anthropic.com/news/claude-3-5-sonnet) | **2024-06-21** | 3.5 家族第一发；**2×** Claude 3 Opus 速度；**$3 / $15**；200K；Artifacts；ASL-2 |
| [Model Card Addendum（June）](https://www-cdn.anthropic.com/fed9cc193a14b84131812372d8d5857f8f304c52/Model_Card_Claude_3_Addendum.pdf) | 2024-06 | Table 1–5；内部 agentic coding **64% vs Opus 38%** |
| [3.5 models and computer use](https://www.anthropic.com/news/3-5-models-and-computer-use) | **2024-10-22** | 升级版 Sonnet；SWE-bench Verified **33.4% → 49.0%**；Computer Use 公测 |
| [October Addendum](https://www-cdn.anthropic.com/c7822cdc35ad788ec87e14b3a9d45010f1f86c38.pdf) | 2024-10 | 新 Sonnet / 3.5 Haiku 对照表；知识截止 **2024-04**（两版 Sonnet 相同） |

六月博文写「今年稍后发 3.5 Haiku 和 3.5 Opus」。Haiku 在十月同场宣布。**3.5 Opus 没有作为产品发出**——不要在本目录再开空文件夹等它。

## 1. 产品位：中档价吃掉上一代旗舰

2024-06-21：免费 claude.ai / iOS 可用；Pro / Team 更高速率；API、Bedrock、Vertex。上下文 **200K**。速度是 Claude 3 Opus 的两倍，价仍是 3 Sonnet 那档。

Artifacts（claude.ai 预览）：代码、文档、网页设计出现在对话旁的独立窗，可当场改。博文把它写成「从聊天机器人变成协作工作区」的第一步，并预告团队共享空间和 Memory。Memory 当时是「正在探索」，不要写成已随 6 月模型一起 GA。

内部 agentic coding（June Table 3）：给自然语言描述，在沙箱里改开源仓库、跑测试（测试对模型不可见）。3.5 Sonnet **64%**，3 Opus **38%**，3 Sonnet **21%**，3 Haiku **17%**。这不是 SWE-bench。

## 2. June 卡上的格子（不要和十月升级版混表）

Table 1（抽几格；3.5 Sonnet vs 3 Opus vs 3 Sonnet）：

| | 3.5 Sonnet | 3 Opus | 3 Sonnet | 设置 |
|--|------------|--------|----------|------|
| GPQA Diamond | **59.4%** / **67.2%** | 50.4% / 59.5% | 40.4% / 46.3% | 0-shot CoT / Maj@32 5-shot CoT |
| MMLU | **90.4%** / 88.7% / 88.3% | 88.2% / 86.8% / 85.7% | 81.5% / 78.3% / 77.1% | 5-shot CoT / 5-shot / 0-shot CoT |
| MATH | **71.1%** | 60.1% | 43.1% | 0-shot CoT |
| HumanEval | **92.0%** | 84.9% | 73.0% | 0-shot |
| GSM8K | **96.4%** | 95.0% | 92.3% | 0-shot CoT |

视觉 Table 2（0-shot）：MathVista **67.7%**、ChartQA **90.8%**、DocVQA **95.2%**、AI2D **94.7%**、MMMU val **68.3%**。NIAH 平均召回 Table 5：全长度与 200K 都是 **99.7%**。

拒答 Table 4：相对 Opus，有害请求正确拒更多、无害请求误拒更少（XSTest 误拒 1.7% vs Opus 8.3%）。

安全：仍 **ASL-2**。未跨过 RSP 里「相对前代 4× 有效算力」才跑全套协议的那条线；仍做了 CBRN / cyber / 自主能力测试，并给 UK AISI 做部署前评估。

## 3. 十月升级版：同一价位，换 agentic 数字

2024-10-22：升级版对所有用户可用，价和速度不变。Computer Use 公测走 API / Bedrock / Vertex。US AISI 与 UK AISI 联合做部署前测试。仍 **ASL-2**。

博文 + October Table 2：

| | 新 3.5 Sonnet | 原 3.5 Sonnet |
|--|----------------|----------------|
| SWE-bench Verified pass@1 | **49.0%** | **33.4%** |
| TAU-bench retail | **69.2%** | 62.6% |
| TAU-bench airline | **46.0%** | 36.0% |

脚注：对比的是 2024-10-22 当天 SWE-bench 榜上公开 SOTA **45.2%**。内部 agentic coding：新版 **78%**，原版 64%（October Table 4）。

October Table 7（新 Sonnet vs 原 3.5 Sonnet vs 3 Opus，抽几格）：

| | 新 3.5 Sonnet | 原 3.5 Sonnet | 3 Opus |
|--|----------------|---------------|--------|
| GPQA Diamond 0-shot CoT | **65.0%** | 59.4% | 50.4% |
| MMLU 5-shot CoT | **90.5%** | 90.4% | 88.2% |
| HumanEval 0-shot | **93.7%** | 92.0% | 84.9% |

知识截止两版都是 **2024-04**。不要把 Haiku 的 2024-07 抄到 Sonnet 上。

人评（相对原 3.5 Sonnet 的 win rate，addendum 正文）：文档 61%、视觉 57%、创意写作 58%、编码 52%、精确指令 51%。不要从图里再估一个第三个数。

## 4. 0.4 拆面

| 面 | 公开材料给了什么 | 没给什么 |
|----|------------------|----------|
| 积木 | 无。Computer Use 是截图 → GUI 动作的 API，不是新注意力 | 层类型、稀疏/线性 |
| 架构 | 闭源 Transformer 家族续作 | 参数量、层数、MoE |
| 数据 | 不训练用户数据，除非用户明确同意（六月博文） | 配比、token 数 |
| 优化器 / 稳定性 | 无 | 不要猜 Muon |
| Infra | API + Bedrock + Vertex；Computer Use 公测 | 集群拓扑 |
| 训推 | 200K；Artifacts 是产品面不是权重面 | 投机解码、量化配方 |

长 D5 里的「中杯超越大杯」叙事可以当 2025 产品解读保留；D2 只钉官方表。Computer Use 的 OSWorld **14.9% / 22.0%** 写在 [09 D2](../09-Claude-Computer-Use/01-09-Claude-Computer-Use-架构精译.md)，本篇不抄第二遍。

## 5. 失效条件

- 把 6 月 21 日写成 6 月 20 日（以官方博文日期为准）。
- 把内部 64% agentic 和 SWE-bench 33.4%/49.0% 收成同一个编码分。
- 为从未发布的 Claude 3.5 Opus mkdir。
- 假装有架构精译。
- 把 October 的 65.0% GPQA 写回六月模型。

## 参考文献

- https://www.anthropic.com/news/claude-3-5-sonnet
- https://www-cdn.anthropic.com/fed9cc193a14b84131812372d8d5857f8f304c52/Model_Card_Claude_3_Addendum.pdf
- https://www.anthropic.com/news/3-5-models-and-computer-use
- https://www-cdn.anthropic.com/c7822cdc35ad788ec87e14b3a9d45010f1f86c38.pdf
- 同目录长 D5（产品叙事，不当事第一手表）
