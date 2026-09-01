---
title: "Claude 3 Opus"
category: "模型家族与选型"
tags: ["claude", "anthropic", "opus", "历史模型"]
published: true
as_of: "2026-09-01"
excerpt: "Claude 3 Opus 的能力优先定位、评测口径和未披露架构边界。"
---

# Claude 3 Opus

> 核验日期：2026-09-01。Opus 表示当时的高能力产品档位，不代表公开的参数量或网络结构。

## 结论卡

| 字段 | 结论 |
|---|---|
| 公开日期 | 2024-03-04 |
| 定位 | Claude 3 家族最高能力档 |
| 输入 / 输出 | 文本、图像输入；文本输出 |
| 上下文 | 200K token |
| 首发价格 | $15 输入 / $75 输出，每百万 token |
| 当前状态 | [已退役](https://platform.claude.com/docs/en/about-claude/model-deprecations)；Claude API 于 2026-01-05 停止提供 |

## 发布证据

Anthropic 的发布表显示 Opus 在当时多项知识、推理、数学和编码评测上领先本家较小档位，并报告了较强的长上下文定位与视觉能力。这些结果来自官方评测；模型卡脚注中的提示、CoT、采样和评分设置决定数字含义。

## 适用与取舍

在 2024 年的产品矩阵中，Opus 适合高难分析、复杂代码和低错误容忍任务，但单价显著高于 Sonnet 和 Haiku。正确选型是测量“成功完成一次任务的总成本”，而非只比较单次调用价格或单个榜单分数。

## 架构与服务边界

Anthropic 没有披露 Claude 3 Opus 的参数量、专家数量、注意力结构和训练数据清单，因此精确结构表均属于无来源推断。模型权重也未开放，不能本地部署或自行微调。

## 官方来源

- [Claude 3 family](https://www.anthropic.com/news/claude-3-family)
- [Claude 3 model card](https://www-cdn.anthropic.com/de8ba9b01c9ab7cbabf5c33b80b7bbc618857627/Model_Card_Claude_3.pdf)

[返回 Claude 3 家族](../claude-3/claude-3.md) · [返回 Claude 家族](../claude.md)
