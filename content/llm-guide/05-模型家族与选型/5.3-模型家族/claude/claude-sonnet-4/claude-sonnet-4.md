---
title: "Claude Sonnet 4"
category: "模型家族与选型"
tags: ["claude", "anthropic", "sonnet", "agent", "历史模型"]
published: true
as_of: "2026-09-01"
excerpt: "Claude Sonnet 4 的平衡档定位、混合推理和编码评测。"
---

# Claude Sonnet 4

> 核验日期：2026-09-01。Sonnet 4 是第四代平衡档，不应与 Sonnet 4.5、4.6 或 5 混写。

## 结论卡

| 字段 | 结论 |
|---|---|
| 公开日期 | 2025-05-22 |
| 定位 | 高性能平衡档；编码、推理与代理任务 |
| 输入 / 输出 | 文本、图像输入；文本输出 |
| 推理与工具 | 标准 / extended thinking；工具交错思考；并行工具 |
| 首发价格 | $3 输入 / $15 输出，每百万 token |
| 当前状态 | [已退役](https://platform.claude.com/docs/en/about-claude/model-deprecations)；Claude API 于 2026-06-15 停止提供 |

## 发布评测怎么读

Anthropic 报告 Sonnet 4 在 SWE-bench Verified 为 72.7%，略高于同次发布的 Opus 4 公开数字。它不意味着 Sonnet 在所有任务上优于 Opus；不同 benchmark、思考预算、并行尝试与脚手架会改变排序。

Sonnet 4 的产品意义在于把 Claude 4 的混合推理和代理工具能力放到较低价格档。迁移旧应用时仍要测试工具 JSON、系统提示、停止条件、输出长度与安全拒答的差异。

## 官方来源

- [Claude 4](https://www.anthropic.com/news/claude-4)

[返回 Claude 4 家族](../claude-4/claude-4.md) · [返回 Claude 家族](../claude.md)
