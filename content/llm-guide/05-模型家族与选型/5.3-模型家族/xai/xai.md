---
title: "xAI / Grok 模型家族"
category: "模型家族与选型"
tags: ["xai", "模型家族", "选型"]
published: true
as_of: "2026-09-01"
excerpt: "Grok 官方版本、开放边界、API 身份与证据日期。"
---

# xAI / Grok 模型家族

> 核验日期：2026-09-01。仅收录能回到 xAI 官方发布、模型/系统卡或官方文档的身份；API `latest` 不是稳定 checkpoint。

## 家族边界

Grok-1 的开放对象是预训练基座；后续 Grok 产品均为闭源服务。产品模式、reasoning 档位、partner endpoint 和底层 checkpoint 分层记录，不从 Grok-1 反推后代架构。Grok 2.5/3.5 没有可靠的一手发布证据，因此不列为可验证的公开版本。

## 版本入口

| 身份 | 证据日期 | 开放状态 | 页面 |
|---|---|---|---|
| Grok-1 | 2023-11-03 产品；2024-03-17 基座权重 | 基座 Apache 2.0 | [Grok-1](./grok-1/grok-1.md) |
| Grok-1.5 Vision Preview | 2024-04-12 | 闭源预览 | [Grok-1.5V](./grok-1-5v/grok-1-5v.md) |
| Grok-2 / mini | 2024-08-13 | 闭源 | [Grok-2](./grok-2/grok-2.md) |
| Grok 3 / mini | 2025-02-19 | 闭源 | [Grok 3](./grok-3/grok-3.md) |
| Grok 4 / Heavy | 2025-07-09 | 闭源 | [Grok 4](./grok-4/grok-4.md) |
| Grok 4.1 | 2025-11-17 | 闭源 | [Grok 4.1](./grok-4-1/grok-4-1.md) |
| Grok 4.20 | 2026-04-07 system card | 闭源 | [Grok 4.20](./grok-4-20/grok-4-20.md) |
| Grok 4.3 | 2026-06-17 Bedrock GA（不是首发证据） | 闭源 | [Grok 4.3](./grok-4-3/grok-4-3.md) |
| Grok 4.5 | 2026-07-16 | 闭源，500K | [Grok 4.5](./grok-4-5/grok-4-5.md) |
| Grok 4.6 | 2026-08-12 | 闭源，500K | [Grok 4.6](./grok-4-6/grok-4-6.md) |

## 选型提示

- 固定模型 ID、reasoning effort、工具与日期；不要用滚动别名做长期基准。
- 500K 是服务规格，不是任意长文任务的可靠性保证。

[← 返回模型家族索引](../5.3-模型家族.md)
