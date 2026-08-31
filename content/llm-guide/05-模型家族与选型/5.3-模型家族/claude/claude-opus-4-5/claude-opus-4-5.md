---
title: "Claude Opus 4.5"
category: "模型家族与选型"
tags: ["claude", "anthropic", "opus", "effort", "context-compaction"]
published: true
as_of: "2026-09-01"
excerpt: "Claude Opus 4.5 的降价、effort 控制、上下文压缩与高级工具能力。"
---

# Claude Opus 4.5

> 核验日期：2026-09-01。Opus 4.5 将 Opus 档输入/输出基准价降到 $5 / $25；不能继续沿用 Opus 4 的 $15 / $75。

## 结论卡

| 字段 | 结论 |
|---|---|
| 公开日期 | 2025-11-24 |
| 模型快照 | `claude-opus-4-5-20251101`（发布材料所列） |
| 定位 | 高难编码、代理、桌面操作与企业任务 |
| 价格 | $5 输入 / $25 输出，每百万 token |
| 新控制 | effort 参数、上下文压缩、高级工具使用 |
| 当前状态 | Claude API：[Active](https://platform.claude.com/docs/en/about-claude/model-deprecations)；暂定不早于 2026-11-24 退役 |

## effort 与成本

effort 允许应用在响应质量、token 使用和延迟之间调节。它不应被理解为选择不同参数规模，也不保证低 effort 对所有任务按固定比例省钱。应按任务类别测量成功率、输出 token、工具轮次和尾延迟。

## 上下文压缩

上下文压缩帮助长代理在接近窗口上限时保留重要状态。压缩是有损过程：目标、未完成事项、工具错误和关键约束可能丢失。应用应把不可丢失状态放在结构化外部存储，并对压缩前后进行一致性检查。

## 高级工具与 Computer Use

发布强调更强的工具搜索、程序化工具调用和 Computer Use。能力提升不改变安全责任：权限、执行、确认与回滚仍在应用层。模型生成的工具参数必须验证。

## 官方来源

- [Claude Opus 4.5](https://www.anthropic.com/news/claude-opus-4-5)
- [Claude API pricing](https://platform.claude.com/docs/en/about-claude/pricing)

[返回 Claude 家族](../claude.md)
