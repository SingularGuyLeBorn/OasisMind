---
title: "Claude Opus 4.7"
category: "模型家族与选型"
tags: ["claude", "anthropic", "opus", "coding", "vision"]
published: true
as_of: "2026-09-01"
excerpt: "Claude Opus 4.7 的可核验产品事实与未披露架构边界。"
---

# Claude Opus 4.7

> 核验日期：2026-09-01。本页只保留 Anthropic 一手材料支持的产品与评测事实；“动态混合稀疏注意力、Meta-Memory”等说法没有官方证据。

## 结论卡

| 字段 | 结论 |
|---|---|
| 公开日期 | 2026-04-16 |
| 定位 | 编码、长时间代理、高分辨率视觉与专业任务升级 |
| 输入 / 输出 | 文本、图像输入；文本输出 |
| 上下文 / 最大输出 | 1M / 128K token |
| 价格 | $5 输入 / $25 输出，每百万 token |
| 可用性 | 发布时广泛可用；具体云平台区域以当日文档为准 |
| 当前状态 | Claude API：[Active](https://platform.claude.com/docs/en/about-claude/model-deprecations)；暂定不早于 2027-04-16 退役 |

## 可确认的变化

官方发布强调复杂编码、长时间任务、视觉精度和更稳定的专业工作表现，并给出官方 benchmark 与客户案例。引用这些数字时必须保留是否使用工具、思考配置、多次尝试、专家评分及模型快照。

## 核心纠错

Anthropic 没有公开 Opus 4.7 的参数量、专家数量、注意力拓扑、位置编码、视觉编码器或所谓 Meta-Memory。因此：

- 不能把 1M 上下文推导为某一种稀疏注意力；
- 不能把长任务稳定性推导为内部持久记忆模块；
- 不能把高分辨率视觉提升推导为特定“双通路视觉架构”；
- 不能为未披露模块编造缩写、公式和消融结果。

公开知识库应清楚承认未知，而不是用“技术报告精读”的形式包装猜测。

## 官方来源

- [Claude Opus 4.7](https://www.anthropic.com/news/claude-opus-4-7)
- [Claude API pricing](https://platform.claude.com/docs/en/about-claude/pricing)

[返回 Claude 家族](../claude.md)
