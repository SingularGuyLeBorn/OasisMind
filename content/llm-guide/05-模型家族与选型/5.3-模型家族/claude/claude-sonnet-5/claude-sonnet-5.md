---
title: "Claude Sonnet 5"
category: "模型家族与选型"
tags: ["claude", "anthropic", "sonnet", "adaptive-thinking", "agent"]
published: true
as_of: "2026-09-01"
excerpt: "Claude Sonnet 5 的 1M 上下文、自适应思考、永久 $2/$10 价格与迁移注意事项。"
---

# Claude Sonnet 5

> 核验日期：2026-09-01。官方原计划在 2026-09-01 调整的价格已经取消；$2 / $10 被宣布为永久基准价，旧的“限时价”描述不应继续传播。

## 结论卡

| 字段 | 结论 |
|---|---|
| 公开日期 | 2026-06-30 |
| 定位 | 当前平衡主力；编码、代理、知识工作与高吞吐生产任务 |
| 输入 / 输出 | 文本、图像输入；文本输出 |
| 上下文 / 最大输出 | 1M / 128K token |
| 推理 | 自适应思考与 effort 控制；具体可选级别以模型页为准 |
| 价格 | $2 输入 / $10 输出，每百万 token，官方已确认为永久价 |
| 知识时效 | 官方页列出可靠知识截止 2026-01 |

## 产品位置

Sonnet 5 在能力、速度与成本之间取得平衡，并成为 Claude.ai Free 与 Pro 的重要默认选择。它适合大多数代码代理、文档处理、研究和工具流程；最高难度任务再与 Opus 5 或 Fable 5 做路由比较。

## API 迁移重点

Sonnet 5 使用新的自适应思考行为。官方模型页提示，手动 extended thinking 配置和某些非默认采样参数会返回 400 错误，而不是静默兼容。升级前应对请求 schema、tool choice、temperature/top-p、思考配置和流式事件做契约测试。

新一代 tokenizer 可能让同一文本的 token 计数与旧模型不同。官方定价文档称 Claude 4.7+ 与 Mythos Preview 的新 tokenizer 在一般工作负载中会产生约 30% 更多 token，但实际取决于语言和内容；预算必须用真实提示重新测量。

## 长上下文工程

1M 适合代码库和多文档代理，但不要把全部历史原样堆入。应使用检索、内容去重、可信来源标记、结构化任务状态、上下文缓存与压缩后校验，以控制成本和提示注入面。

## 官方来源

- [Claude Sonnet 5](https://www.anthropic.com/news/claude-sonnet-5)
- [Claude Sonnet 5 model overview](https://platform.claude.com/docs/en/models/sonnet-5/overview)
- [Claude API pricing](https://platform.claude.com/docs/en/about-claude/pricing)

[返回 Claude 家族](../claude.md)
