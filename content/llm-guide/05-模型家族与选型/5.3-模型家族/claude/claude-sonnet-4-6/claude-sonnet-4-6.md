---
title: "Claude Sonnet 4.6"
category: "模型家族与选型"
tags: ["claude", "anthropic", "sonnet", "computer-use", "长上下文"]
published: true
as_of: "2026-09-01"
excerpt: "Claude Sonnet 4.6 的 1M 上下文、编码、Computer Use 和长任务升级。"
---

# Claude Sonnet 4.6

> 核验日期：2026-09-01。Sonnet 4.6 是 4.5 的平衡档升级；它没有把未披露的内部架构变成公开事实。

## 结论卡

| 字段 | 结论 |
|---|---|
| 公开日期 | 2026-02-17 |
| 定位 | 编码、Computer Use、企业任务与长上下文 |
| 输入 / 输出 | 文本、图像输入；文本输出 |
| 上下文 / 最大输出 | 1M / 128K token；发布初期为 beta，当前正式 |
| 价格 | $3 输入 / $15 输出，每百万 token |
| 当前状态 | Claude API：[Active（legacy）](https://platform.claude.com/docs/en/about-claude/model-deprecations)；暂定不早于 2027-02-17 退役 |

## 关键提升

Anthropic 强调代码修改、工具代理、长上下文推理和屏幕操作的提升，并保持 Sonnet 价格档。官方 benchmark 用于显示相对改进；采购仍应使用自己的代码库、桌面环境和工具策略做端到端测试。

## 长上下文与代理

1M 让模型能一次看到更多代码与记录，也增加提示注入面和错误信息占用。应用应做来源标记、权限隔离、可信/不可信上下文分区、外部任务状态和超时恢复。

## 官方来源

- [Claude Sonnet 4.6](https://www.anthropic.com/news/claude-sonnet-4-6)
- [Claude API pricing](https://platform.claude.com/docs/en/about-claude/pricing)

[返回 Claude 家族](../claude.md)
