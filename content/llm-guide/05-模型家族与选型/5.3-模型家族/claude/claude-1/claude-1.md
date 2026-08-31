---
title: "Claude 1"
category: "模型家族与选型"
tags: ["claude", "anthropic", "历史模型", "constitutional-ai"]
published: true
as_of: "2026-09-01"
excerpt: "Claude 初代的发布身份、能力边界与 Constitutional AI 背景。"
---

# Claude 1

> 核验日期：2026-09-01。Claude 1 是历史服务，不应以当前 Claude 的视觉、工具或推理参数反推初代能力。

## 结论卡

| 字段 | 结论 |
|---|---|
| 公开日期 | 2023-03-14 |
| 产品身份 | Claude 与低成本 Claude Instant，经 API 和合作伙伴产品提供 |
| 输入 / 输出 | 以文本交互为主；首发公告没有把图像输入列为产品能力 |
| 长上下文 | 首发公告未给出精确上限；Anthropic 于 2023-05 宣布 Claude 可处理 100K token 上下文 |
| 权重与许可 | 权重未公开；服务访问，不是开放权重发布 |
| 当前状态 | [已退役](https://platform.claude.com/docs/en/about-claude/model-deprecations)；Claude API 于 2024-11-06 停止提供 |

## 它建立了什么

初代 Claude 把 Anthropic 的研究路线变成可调用产品：对话、摘要、搜索辅助、创作与编码，并以较少拒答、较可控的语气作为产品卖点。首发合作伙伴包括 Notion、Quora、DuckDuckGo 等；这些是采用案例，不是统一的第三方能力评测。

Claude 的训练叙事与 Constitutional AI 相关。Anthropic 的公开论文描述了两阶段思路：模型先依据原则进行自我批评与修订，再使用 AI 反馈训练偏好模型。这说明一种对齐方法，不等于公开初代 Claude 的参数量、层数、注意力结构或训练数据清单。

## 100K 上下文应如何表述

100K 是 2023-05 的后续产品更新，不是 3 月首发公告中明确给出的固定规格。它让几十页到数百页材料可在一次请求中处理，但协议容量不等于跨全文稳定检索。长文档任务仍需验证：关键事实召回、引用位置、跨章节一致性和输出遗漏。

## 不应沿用的旧说法

- “Claude 1 是 52B 参数”不能作为产品事实。52B 出现在 Anthropic 研究实验的语境中，不能自动映射到商业 Claude 1。
- GQA、RoPE、SwiGLU、具体层数和训练 token 数均没有初代产品一手披露。
- “宪法原则公开”不等于模型权重、数据或训练流水线开放。

## 官方来源

- [Introducing Claude](https://www.anthropic.com/news/introducing-claude)
- [100K context windows](https://www.anthropic.com/news/100k-context-windows)
- [Constitutional AI: Harmlessness from AI Feedback](https://www.anthropic.com/news/constitutional-ai-harmlessness-from-ai-feedback)

[返回 Claude 家族](../claude.md)
