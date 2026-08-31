---
title: "Claude 3 Sonnet"
category: "模型家族与选型"
tags: ["claude", "anthropic", "sonnet", "历史模型"]
published: true
as_of: "2026-09-01"
excerpt: "Claude 3 Sonnet 的平衡档定位、视觉输入和 200K 上下文。"
---

# Claude 3 Sonnet

> 核验日期：2026-09-01。Claude 3 Sonnet 是 2024 年 3 月的平衡档，与 6 月发布的 Claude 3.5 Sonnet 不是同一快照。

## 结论卡

| 字段 | 结论 |
|---|---|
| 公开日期 | 2024-03-04 |
| 定位 | 能力、速度与价格平衡 |
| 输入 / 输出 | 文本、图像输入；文本输出 |
| 上下文 | 200K token |
| 首发价格 | $3 输入 / $15 输出，每百万 token |
| 当前状态 | [已退役](https://platform.claude.com/docs/en/about-claude/model-deprecations)；Claude API 于 2025-07-21 停止提供 |

## 能力位置

Sonnet 位于 Haiku 与 Opus 之间，适合知识工作、数据处理、代码和视觉文档任务。它的价值是组合约束下的平衡，而不是在每个 benchmark 都领先。2024-06 的 [Claude 3.5 Sonnet](../claude-3-5-sonnet/claude-3-5-sonnet.md) 在同一价格带显著更新能力，因此任何实验记录都应写清“3”还是“3.5”。

## 证据边界

Claude 3 模型卡提供了统一的安全与能力评测框架。它没有给出 Sonnet 的参数规模或底层注意力配置；旧稿把产品档位映射为具体 Dense/MoE 结构没有依据。

## 官方来源

- [Claude 3 family](https://www.anthropic.com/news/claude-3-family)
- [Claude 3 model card](https://www-cdn.anthropic.com/de8ba9b01c9ab7cbabf5c33b80b7bbc618857627/Model_Card_Claude_3.pdf)

[返回 Claude 3 家族](../claude-3/claude-3.md) · [返回 Claude 家族](../claude.md)
