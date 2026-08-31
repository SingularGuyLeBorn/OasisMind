---
title: "Mistral 模型家族"
category: "模型家族与选型"
tags: ["mistral", "模型家族", "选型"]
published: true
as_of: "2026-09-01"
excerpt: "Mistral generalist、MoE、edge、vision、code 与 reasoning 线的身份和生命周期。"
---

# Mistral 模型家族

> 核验日期：2026-09-01。产品身份目录不伪编号；`latest`、价格与生命周期查使用当日官方 docs。

## 基础与 MoE

| 身份 | 日期 | 开放/上下文 | 页面 |
|---|---|---|---|
| Mistral 7B | 2023-09-27 | Apache 2.0，8K | [7B](./mistral-7b/mistral-7b.md) |
| Mixtral 8x7B | 2023-12-11 | Apache 2.0，32K | [8x7B](./mixtral-8x7b/mixtral-8x7b.md) |
| Mixtral 8x22B | 2024-04-17 | Apache 2.0，64K | [8x22B](./mixtral-8x22b/mixtral-8x22b.md) |
| Mistral NeMo 12B | 2024-07-18 | Apache 2.0，128K | [NeMo](./nemo-12b/nemo-12b.md) |

## Generalist 与轻量线

| 身份 | 生命周期/许可 | 页面 |
|---|---|---|
| Large 24.02 / Large 2 / Large 3 | 闭源 → 研究许可 → Apache 2.0 | [24.02](./large-2402/large-2402.md) · [Large 2](./large-2407/large-2407.md) · [Large 3](./large-3/large-3.md) |
| Ministral 3B/8B（2024） | 商业/研究许可，纯文本历史线 | [2024 Ministral](./ministral-2024/ministral-2024.md) |
| Ministral 3（3B/8B/14B） | 当前 Apache 2.0，多模态，256K | [Ministral 3](./ministral-3/ministral-3.md) |
| Small 3.1 | Apache 2.0，历史 | [Small 3.1](./small-3-1/small-3-1.md) |
| Small 4 | 当前 Apache 2.0，119B/6.5B，256K | [Small 4](./small-4/small-4.md) |
| Medium 3 | Premier/闭源，已退役 | [Medium 3](./medium-3/medium-3.md) |
| Medium 3.5 | 当前 Modified MIT，256K | [Medium 3.5](./medium-3-5/medium-3-5.md) |

## 专用历史线

| 线 | 许可/生命周期要点 | 页面 |
|---|---|---|
| Pixtral | 12B Apache 2.0；Large Research License；均为历史型号 | [12B](./pixtral-12b/pixtral-12b.md) · [Large](./pixtral-large/pixtral-large.md) |
| Codestral | 2405 非生产许可；后续快照/API 另核 | [Codestral](./codestral/codestral.md) |
| Devstral | Small Apache 2.0、Medium 企业/API | [Devstral](./devstral/devstral.md) |
| Magistral | Small 开放、Medium 企业；reasoning 后并入通用线 | [Magistral](./magistral/magistral.md) |

截至核验日，新项目优先比较 Small 4、Medium 3.5、Ministral 3 与 Large 3；保留专用历史线是为解释迁移和许可，不表示仍是当前 API 首选。

[← 返回模型家族索引](../5.3-模型家族.md)
