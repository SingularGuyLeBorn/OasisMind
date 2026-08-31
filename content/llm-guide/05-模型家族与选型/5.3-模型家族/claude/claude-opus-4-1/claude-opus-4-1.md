---
title: "Claude Opus 4.1"
category: "模型家族与选型"
tags: ["claude", "anthropic", "opus", "coding", "历史模型"]
published: true
as_of: "2026-09-01"
excerpt: "Claude Opus 4.1 的增量编码升级、价格继承与历史边界。"
---

# Claude Opus 4.1

> 核验日期：2026-09-01。Opus 4.1 是对 Opus 4 的增量升级，不是第五代，也不是开放权重模型。

## 结论卡

| 字段 | 结论 |
|---|---|
| 公开日期 | 2025-08-05 |
| 定位 | 代理任务、真实世界编码和推理升级 |
| 输入 / 输出 | 文本、图像输入；文本输出 |
| 官方评测 | SWE-bench Verified 74.5%（官方设置） |
| 价格 | 延续 Opus 4 当时价格 |
| 当前状态 | [已退役](https://platform.claude.com/docs/en/about-claude/model-deprecations)；Claude API 于 2026-08-05 停止提供 |

## 这次更新有多大

Anthropic 将 4.1 描述为对 Opus 4 的升级，重点是代码修改、代理任务和细节跟踪，而不是公布全新家族。官方还引用 GitHub、Rakuten 等客户反馈；这类反馈用于说明场景，不等于独立复现。

版本迁移不能只看 74.5%：应在自己的仓库测试代码正确率、回归测试通过率、无关改动、工具调用次数、人工 review 时间和 token 成本。

## 官方来源

- [Claude Opus 4.1](https://www.anthropic.com/news/claude-opus-4-1)

[返回 Claude 家族](../claude.md)
