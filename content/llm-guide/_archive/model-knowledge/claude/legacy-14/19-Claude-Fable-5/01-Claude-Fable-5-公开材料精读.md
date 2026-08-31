---
title: "01 · Claude Fable 5：第五代公开旗舰"
date: 2026-08-30
as_of: 2026-08-30
tags: [Claude-Fable-5, Mythos-5, 公开材料精读]
---

# Claude Fable 5：公开材料精读

>  **[返回 14.13-Claude 家族总览](../../14.13-Claude.md)** · 日常档：[Opus 5](../20-Claude-Opus-5/01-Claude-Opus-5-公开材料精读.md) · 限量无分类器：[Mythos 枢纽](../18-Claude-Mythos/01-Claude-Mythos-公开材料精读.md)

第五代公开最强档。**没有**层配置。Mythos 5 / Sonnet 5 是同代矩阵，本篇只记一行。Haiku 4.5 已有旧目录，不另开一节。

产品页 https://www.anthropic.com/claude/fable ；模型总览 https://platform.claude.com/docs/en/about-claude/models/overview 。System card 本轮**未打开 PDF**。

![第五代：Fable / Mythos / Opus](./images/fig-claude-gen5-fable-opus-mythos.png)

## 1. 产品日历

| 日 | 官方页写了什么 |
|----|----------------|
| **2026-06-09** | Fable 5 引入第五代；「可做前代撑不住的数日级异步任务」 |
| 2026-06-12 | 访问不可用致歉 |
| 2026-07-01 | 访问恢复 |
| 2026-08-06 | 生物学护栏更新，降低误伤 |

API：`claude-fable-5`。价 **$10 / $50** per MTok in/out；prompt cache 读 90% 折扣。仅美国推理 **1.1×**。Pro / Max / Team / Enterprise。使用 Fable **要求 30 天数据保留**做安全监控。

总览表：上下文 **1M**，最大输出 **128K**；Thinking = **Adaptive（always on）**；默认 effort **`high`**。知识较可靠截止 **2026-01**；训练数据截止同月。退役承诺不早于 **2027-06-09**（Anthropic 自营平台）。

## 2. 与 Mythos 5

官方 FAQ / 开发者文：Mythos 5 **能力同 Fable 5**，**没有**这套安全分类器；只经 **Project Glasswing** 有限放出。Fable 是「可公开卖的 Mythos 级」。不要把 2026-05 占位 HTML「Mythos 尚未发布」当成 2026-08 事实。

被分类器拦住的请求：多数产品面，**网络**落到 Opus **4.8**，**生物学**落到 Opus **5**（Fable 页 FAQ）。用户不按 Fable 价为回退请求付费。API 须自己配 Fallback。

## 3. 能力主张（无架构）

产品页：数日级 agent（规划、委派子代理、自检）；大迁移/多日编码；用视觉核对代码产出。客户引言（CursorBench、FrontierBench、AutomationBench 等）**不是**可抄的百分表——Anthropic 本页没给 SWE 主分数。OpenAI GPT-5.6 GA 对照表里的 Fable 5 数字（如 SWE-Bench Pro **80%**）是 **OpenAI 的表**，链过去，不要写成 Anthropic 官方主表。

## 4. 失效条件

- 为 Mythos 5 / Sonnet 5 建空目录。
- 发明层数或「全局树状状态机」。
- 把 6 月中断写成模型撤回。
- 把 OpenAI 对照列收成 Anthropic 自评。

## 参考文献

- https://www.anthropic.com/claude/fable （公告时间线、定价、FAQ、护栏）
- https://platform.claude.com/docs/en/about-claude/models/overview （对照表）
- Opus 5 博文里对 Fable 的相对句，见兄弟篇
