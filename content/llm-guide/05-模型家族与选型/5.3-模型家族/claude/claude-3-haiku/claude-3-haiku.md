---
title: "Claude 3 Haiku"
category: "模型家族与选型"
tags: ["claude", "anthropic", "haiku", "历史模型"]
published: true
as_of: "2026-09-01"
excerpt: "Claude 3 Haiku 的速度优先定位、200K 上下文和多模态边界。"
---

# Claude 3 Haiku

> 核验日期：2026-09-01。Haiku 是产品性能档位，不是公开参数规模标签。

## 结论卡

| 字段 | 结论 |
|---|---|
| 发布 | 家族于 2024-03-04 公布；Haiku 于 2024-03-13 正式提供 |
| 定位 | 当时 Claude 家族中最快、最便宜的档位 |
| 输入 / 输出 | 文本、图像输入；文本输出 |
| 上下文 | 200K token |
| 首发价格 | $0.25 输入 / $1.25 输出，每百万 token |
| 当前状态 | [已退役](https://platform.claude.com/docs/en/about-claude/model-deprecations)；Claude API 于 2026-04-20 停止提供 |

## 适用与局限

Haiku 面向内容分类、信息抽取、轻量问答、快速客服和高并发任务。低单价不能单独决定成本：如果较弱模型导致更长提示、更多重试或频繁升级到强模型，总成本可能上升。视觉任务还应按图片计费规则、OCR 质量和错误容忍度评测。

发布材料给出速度与安全评测，但没有披露参数量、层数、量化方式或蒸馏关系。不能把“快”解释成某一种已证实的内部网络设计。

## 官方来源

- [Claude 3 family](https://www.anthropic.com/news/claude-3-family)
- [Claude 3 Haiku](https://www.anthropic.com/news/claude-3-haiku)

[返回 Claude 3 家族](../claude-3/claude-3.md) · [返回 Claude 家族](../claude.md)
