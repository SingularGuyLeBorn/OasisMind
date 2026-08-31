---
title: "Claude Opus 5"
category: "模型家族与选型"
tags: ["claude", "anthropic", "opus", "adaptive-thinking", "agent"]
published: true
as_of: "2026-09-01"
excerpt: "Claude Opus 5 的 1M 上下文、128K 输出、自适应思考与生产选型。"
---

# Claude Opus 5

> 核验日期：2026-09-01。Opus 5 是当前高端通用模型；“最强”应理解为 Anthropic 产品线定位，不替代特定任务评测。

## 结论卡

| 字段 | 结论 |
|---|---|
| 公开日期 | 2026-07-24 |
| 定位 | 复杂编码、研究、代理与专业工作 |
| 输入 / 输出 | 文本、图像输入；文本输出 |
| 上下文 / 最大输出 | 1M / 128K token |
| 推理 | 自适应思考与 effort 控制；具体可选级别以模型页为准 |
| 价格 | $5 输入 / $25 输出，每百万 token |
| 知识时效 | 官方页列出可靠知识截止 2026-05 |

## 与 Sonnet 5、Fable 5 的选择

| 需求 | 优先候选 | 原因 |
|---|---|---|
| 大多数生产代理 | Sonnet 5 | 较低价格，能力与速度平衡 |
| 高难代码与长任务 | Opus 5 | 更高能力档，价格仍低于 Fable |
| 最高难度、失败成本极高 | Fable 5 | 最高能力服务层，但价格和路由机制更复杂 |
| 低延迟海量简单任务 | Haiku 4.5 | 低成本与快速响应 |

选择应基于任务成功率、人工返工、延迟和总费用。若 Opus 把重试次数显著降低，它可能比单价较低的模型便宜；反之，简单任务使用 Opus 会浪费预算。

## 输出与批处理边界

常规最大输出为 128K。官方模型页另列批处理中的更大输出测试能力；beta 功能的上限、计费和稳定性应按调用时文档核对，不能当作所有实时请求的默认规格。

## 自适应思考与工具

模型依据任务复杂度分配推理，并可在代理流程中使用工具。应用仍要给出明确成功条件、工具权限、错误处理和预算上限。思考摘要不是完整审计日志，工具回执与结果测试才是可验证证据。

## 未公开内容

Anthropic 没有披露 Opus 5 的参数量、MoE 专家数量、注意力机制、训练 token 或数据集清单。1M 上下文、128K 输出和 benchmark 结果都不能用来反推这些字段。

## 官方来源

- [Claude Opus 5](https://www.anthropic.com/news/claude-opus-5)
- [Claude Opus 5 model overview](https://platform.claude.com/docs/en/models/opus-5/overview)
- [Claude API pricing](https://platform.claude.com/docs/en/about-claude/pricing)

[返回 Claude 家族](../claude.md)
