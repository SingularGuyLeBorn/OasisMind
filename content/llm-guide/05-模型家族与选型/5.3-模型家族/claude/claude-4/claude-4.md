---
title: "Claude 4 家族"
category: "模型家族与选型"
tags: ["claude", "anthropic", "claude-4", "agent", "tool-use"]
published: true
as_of: "2026-09-01"
excerpt: "Claude Opus 4 与 Sonnet 4 的混合推理、工具能力和评测口径。"
---

# Claude 4 家族

> 核验日期：2026-09-01。Claude 4 于 2025-05-22 同时发布 Opus 4 与 Sonnet 4，延续混合推理并加强长时间编码和工具代理。

## 家族矩阵

| 型号 | 发布定位 | 首发价格（输入 / 输出，每百万 token） | 页面 |
|---|---|---:|---|
| Claude Opus 4 | 复杂编码与长代理任务的高端档 | $15 / $75 | [详解](../claude-opus-4/claude-opus-4.md) |
| Claude Sonnet 4 | 能力、速度与成本平衡 | $3 / $15 | [详解](../claude-sonnet-4/claude-sonnet-4.md) |

## 关键变化

- 标准回答与扩展思考继续共存。
- extended thinking 期间可使用工具，让模型在推理、调用工具、读取结果之间交错。
- 支持并行工具调用和更精确的指令遵循。
- Anthropic 描述模型在被允许访问本地文件时可通过写入“memory files”维持长期任务状态；这是代理行为与脚手架能力，不是永久跨会话记忆保证。

## 发布评测

官方报告 Sonnet 4 在 SWE-bench Verified 为 72.7%，Opus 4 为 72.5%；这些数字带有代理脚手架、尝试次数与并行计算等条件。Terminal-bench、TAU-bench 和长任务案例同样需要阅读脚注。客户称 Opus 4 可连续工作数小时，是案例证言，不应改写成统一的“7 小时自治 benchmark”。

## 安全边界

Anthropic 对 Opus 4 和 Sonnet 4 采用更高等级的部署保障，并发布系统卡。工具交错思考提高了代理能力，也扩大了提示注入、凭据访问和不可逆动作风险。应用仍需在模型外实施权限、确认、审计和终止策略。

## 官方来源

- [Claude 4](https://www.anthropic.com/news/claude-4)

[返回 Claude 家族](../claude.md)
