---
title: "Claude Haiku 4.5"
category: "模型家族与选型"
tags: ["claude", "anthropic", "haiku", "低延迟", "extended-thinking"]
published: true
as_of: "2026-09-01"
excerpt: "Claude Haiku 4.5 的低延迟定位、200K 上下文和手动扩展思考。"
---

# Claude Haiku 4.5

> 核验日期：2026-09-01。Haiku 4.5 是当前 Claude 小型主力之一；服务规格和别名仍需在调用当日核对。

## 结论卡

| 字段 | 结论 |
|---|---|
| 公开日期 | 2025-10-15 |
| 定位 | 低延迟、高吞吐、成本敏感任务 |
| 输入 / 输出 | 文本、图像输入；文本输出 |
| 上下文 / 最大输出 | 200K / 64K token |
| 推理 | 支持手动 extended thinking；不支持第五代同类 effort 控制 |
| 价格 | $1 输入 / $5 输出，每百万 token |
| 安全部署 | ASL-2 |

## 为什么仍然重要

在 Fable、Opus、Sonnet 已进入第五代时，Haiku 4.5 仍承担快速档位：分类、信息抽取、实时助手、搜索重排、代码子任务和多代理中的轻量 worker。它不等于“只会简单任务”；应通过准确率—延迟—成本曲线决定是否升级到 Sonnet。

## 扩展思考配置

Haiku 4.5 使用手动 thinking 预算，不能照搬 Sonnet 5 的自适应思考参数。迁移代码时应针对具体模型验证 API schema；不兼容参数可能导致 4xx，而非自动降级。

## 数据与架构边界

官方模型页给出可靠知识截止时间 2025-02、训练数据截止时间 2025-07。它们是知识时效信息，不透露训练数据集清单。参数量、蒸馏方式和注意力结构仍未公开。

## 官方来源

- [Claude Haiku 4.5](https://www.anthropic.com/news/claude-haiku-4-5)
- [Claude Haiku 4.5 model overview](https://platform.claude.com/docs/en/models/haiku-4-5/overview)

[返回 Claude 家族](../claude.md)
