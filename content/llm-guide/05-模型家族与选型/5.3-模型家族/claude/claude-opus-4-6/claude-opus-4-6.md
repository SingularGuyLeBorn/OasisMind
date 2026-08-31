---
title: "Claude Opus 4.6"
category: "模型家族与选型"
tags: ["claude", "anthropic", "opus", "adaptive-thinking", "长上下文"]
published: true
as_of: "2026-09-01"
excerpt: "Claude Opus 4.6 的 1M 上下文测试、自适应思考与代理改进。"
---

# Claude Opus 4.6

> 核验日期：2026-09-01。1M 上下文在发布时带 beta 条件；截至核验日已成为完整 1M 默认窗口，不再需要 beta header。

## 结论卡

| 字段 | 结论 |
|---|---|
| 公开日期 | 2026-02-05 |
| 定位 | 编码、专业工作、长代理与复杂工具任务 |
| 输入 / 输出 | 文本、图像输入；文本输出 |
| 上下文 / 最大输出 | 1M / 128K token；发布初期为 beta，当前正式 |
| 推理 | adaptive thinking 与 effort 控制 |
| 价格 | $5 输入 / $25 输出，每百万 token |
| 当前状态 | Claude API：[Active](https://platform.claude.com/docs/en/about-claude/model-deprecations)；暂定不早于 2027-02-05 退役 |

## 自适应思考

模型可依据任务复杂度决定是否以及使用多少额外推理。应用通过 effort 提供倾向，而不是精确的内部思考 token 指令。对实时任务应同时限制总 token、工具轮次和超时；对高难任务则要测量额外思考是否真正提高一次成功率。

## 1M 上下文的使用方式

长窗口适合大型代码库、审计材料和多文档代理，但不应取代检索、分层摘要和外部状态。超过特定阈值的请求可能有不同费率或速率限制；输入图像、工具结果和模型输出都消耗窗口。

## 不存在公开“架构解密”

发布材料没有证实稀疏注意力、MoE、记忆网络或特定位置编码。能处理 1M token 是产品能力，不足以反推实现方案。

## 官方来源

- [Claude Opus 4.6](https://www.anthropic.com/news/claude-opus-4-6)
- [Claude API pricing](https://platform.claude.com/docs/en/about-claude/pricing)

[返回 Claude 家族](../claude.md)
