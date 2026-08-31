---
title: "Claude Opus 4"
category: "模型家族与选型"
tags: ["claude", "anthropic", "opus", "agent", "历史模型"]
published: true
as_of: "2026-09-01"
excerpt: "Claude Opus 4 的长任务、编码与工具交错思考能力。"
---

# Claude Opus 4

> 核验日期：2026-09-01。Opus 4 已被多次后续升级替代；历史评测只能用于理解代际变化。

## 结论卡

| 字段 | 结论 |
|---|---|
| 公开日期 | 2025-05-22 |
| 定位 | 第四代最高能力档，复杂编码与长代理任务 |
| 输入 / 输出 | 文本、图像输入；文本输出 |
| 推理与工具 | 标准 / extended thinking；思考期间工具调用；并行工具 |
| 首发价格 | $15 输入 / $75 输出，每百万 token |
| 当前状态 | [已退役](https://platform.claude.com/docs/en/about-claude/model-deprecations)；Claude API 于 2026-06-15 停止提供 |

## 能力与评测

Anthropic 报告 Opus 4 在 SWE-bench Verified 为 72.5%，Terminal-bench 为 43.2%，并强调长时间编码、规划和工具使用。数字依赖具体脚手架；如果生产系统的工具、重试和上下文整理不同，不能期待相同成功率。

“持续工作数小时”来自客户环境中的案例。它能说明模型可能在良好脚手架下维持长任务，却不能证明所有任务都可无人监督运行，也不应替代中断恢复、状态一致性和错误累积测试。

## 架构未知

Anthropic 未公开 Opus 4 的参数量、专家路由、注意力机制或所谓“长期记忆模块”。本地 memory files 是模型经工具写入外部文件的行为，不是已证实的内部持久记忆网络。

## 官方来源

- [Claude 4](https://www.anthropic.com/news/claude-4)

[返回 Claude 4 家族](../claude-4/claude-4.md) · [返回 Claude 家族](../claude.md)
