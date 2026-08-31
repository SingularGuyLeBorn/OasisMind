---
title: "01 · Operator：2025-01-23 研究预览；CUA；OSWorld 38.1% / WebArena 58.1%"
date: 2026-08-30
as_of: 2026-08-30
tags: [Operator, CUA, 公开材料精读]
---

# Operator: 接管浏览器的自动化自主 Agent - 技术探测与反向工程

>  **[返回 14.12-OpenAI 家族总览](../../14.12-OpenAI.md)** · 计算机使用对照：[Claude Computer Use](../../14.13-Claude/09-Claude-Computer-Use/01-09-Claude-Computer-Use-架构精译.md) · 已有长 D5：[CUA 工程](./05-15-Operator-Agent-CUA视觉推理与浏览器自动化的工程实现.md)

> **背景**：该模型并未完全开源其底层代码与权重, 本精译基于其官方发布的技术报告(Technical Report)、系统卡片(System Card)以及顶级研究团队的逆向探测论文重构。

**产品博文 + 研究博文**。占位段不是这两篇。openai.com/index/introducing-operator 现页本轮超时；产品句用 Wayback [Introducing Operator](https://web.archive.org/web/20250123210058/https://openai.com/index/introducing-operator/)（2025-01-23）。评测表用 [Computer-Using Agent](https://openai.com/index/computer-using-agent/)（同日）。系统卡 **未打开**。

## 1. 产品（1-23 预览）

研究预览：有自己的浏览器，看网页、打字、点、滚。给任务就执行。当时 **美国 Pro**，`operator.chatgpt.com`。计划扩到 Plus / Team / Enterprise，并 **以后** 嵌进 ChatGPT。点名用例：填表、订菜、做 meme。合作方举例：DoorDash、Instacart、OpenTable、Priceline、StubHub、Thumbtack、Uber；市政 Stockton。

引擎叫 **Computer-Using Agent (CUA)**：GPT-4o 的视觉 + RL 做推理，训的是 GUI（按钮/菜单/文本框），**不依赖** OS/网页专用 API。看见 = 截图；交互 = 虚拟键鼠。卡住会把控制权交回用户。登录、支付、CAPTCHA 会主动让用户 takeover。Takeover 时 **不**收集/截用户输入。可多会话并行。自定义指令可按全站或单站。

限制（原文）：复杂界面如做幻灯片、管日历会吃力。

## 2. CUA 循环与数字

循环：Perception（截图进上下文）→ Reasoning（CoT，看当前/历史截图与动作）→ Action（点/滚/打字），直到完成或要用户。敏感动作（登录、CAPTCHA）要确认。

| 基准 | CUA | 当时 Previous SOTA（通用界面列） | 人 |
|------|-----|----------------------------------|----|
| OSWorld | **38.1%** | 22.0% | 72.4% |
| WebArena | **58.1%** | 36.2%（通用）/ 57.1%（浏览 agent） | 78.2% |
| WebVoyager | **87.0%** | 56.0% / 87.0% | — |

WebVoyager 任务相对简单；WebArena 离人还远。OSWorld：步数上限增加会变好（test-time scaling）。Operator 里少量 prompt 的 10 次试：简单重复 UI 可 10/10；含糊 prompt vs 带 filter 提示可从 3/10 到 8/10；不熟 UI / 精细改字 4/10。

安全分层：拒答、站点黑名单、实时 moderation、离线检测；用户确认、拒绝高风险（银行、高利害决策）；敏感站 Watch mode。对抗：谨慎导航、monitor model 可暂停、检测管线。Preparedness：相对 GPT-4o **没有增量前沿风险**。计划把 CUA 放进 API。

## 3. 失效条件

- 空壳「隐式注意力 / 3D 并行」。
- 把 OSWorld 38.1% 写成接近人类 72.4%。
- 把后来 ChatGPT agent mode / 下线独立 Operator 的产品史 **倒灌进 1-23 预览**（本轮未读成 2025-07 更新页）。

## 参考文献

- https://web.archive.org/web/20250123210058/https://openai.com/index/introducing-operator/
- https://openai.com/index/computer-using-agent/ （评测表、循环、安全；未读系统卡）
