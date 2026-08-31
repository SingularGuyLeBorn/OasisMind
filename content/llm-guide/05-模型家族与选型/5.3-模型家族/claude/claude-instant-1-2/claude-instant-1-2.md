---
title: "Claude Instant 1.2"
category: "模型家族与选型"
tags: ["claude", "anthropic", "instant", "历史模型", "低延迟"]
published: true
as_of: "2026-09-01"
excerpt: "Claude Instant 1.2 的早期低成本支线、官方评测与历史边界。"
---

# Claude Instant 1.2

> 核验日期：2026-09-01。Claude Instant 是初代 Claude 的快速、低价支线；它不是后来 Haiku 名称的同一模型，也不应被当前 Haiku 规格回填。

## 结论卡

| 字段 | 结论 |
|---|---|
| 公开日期 | 2023-08-09 |
| 定位 | 比主力 Claude 更快、更便宜的文本模型 |
| 主要任务 | 对话、文本分析、摘要、文档理解、代码与推理 |
| 输入 / 输出 | 文本输入、文本输出 |
| 长上下文 | Claude Instant 已在 2023-05 的 100K 更新案例中出现；具体调用别名应按当时文档记录 |
| 权重 | 未公开 |
| 当前状态 | [已退役](https://platform.claude.com/docs/en/about-claude/model-deprecations)；Claude API 于 2024-11-06 停止提供 |

## 1.2 的改进

Anthropic 称 Instant 1.2 吸收 Claude 2 的部分能力，在数学、编码、推理、安全、结构化长回答、多语言和引文抽取上改进。官方报告其 Codex 评测为 58.7%，对比 Instant 1.1 的 52.8%；GSM8K 为 86.7%，对比 80.9%。这些是 2023 年官方设置中的相对变化，不适合与当前模型裸比。

## 历史意义

Instant 体现了 Claude 很早就有“能力优先 / 速度成本优先”的产品分层。后来的 Haiku、Sonnet、Opus 重新命名并扩展了这种矩阵，但不能因此宣称 Instant 与某个 Haiku 共享架构、蒸馏关系或参数规模。

## 官方来源

- [Releasing Claude Instant 1.2](https://www.anthropic.com/news/releasing-claude-instant-1-2)
- [100K context windows](https://www.anthropic.com/news/100k-context-windows)

[返回 Claude 家族](../claude.md)
