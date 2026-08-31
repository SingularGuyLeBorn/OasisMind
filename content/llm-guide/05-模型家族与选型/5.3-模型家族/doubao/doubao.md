---
title: "Doubao / Seed 模型家族"
category: "模型家族与选型"
tags: ["doubao", "seed", "模型家族"]
published: true
as_of: "2026-09-01"
excerpt: "Seed 技术家族、豆包产品与火山 API 型号的三层映射。"
---

# Doubao / Seed 模型家族

> 核验日期：2026-09-01。价格、区域、上下文和 API 别名属于易变服务信息，必须标注日期。

## 三层身份

| 层次 | 含义 | 不应混同 |
|---|---|---|
| ByteDance Seed | 研发团队与技术模型家族，如 Seed 2.0/2.1 | 不等于一个固定 API checkpoint |
| 豆包 Doubao | 面向用户的产品/品牌，也会展示 `Doubao Seed` 名称 | 产品体验不等于所有 API endpoint |
| 火山引擎 / 火山方舟 | API、控制台、模型 ID 与滚动别名渠道 | ID/别名可能更新，需固定 as_of |

## 版本入口

| 身份 | 证据日期 | 获取方式 | 页面 |
|---|---|---|---|
| Doubao Lite 产品线 / 1.5-lite 快照 | 2024-05-15；1.5 于 2025-01 | 闭源 API | [Doubao Lite](./lite/lite.md) |
| Doubao Pro 产品线 / 1.5-pro 快照 | 2024-05-15；1.5 于 2025-01 | 闭源 API | [Doubao Pro](./pro/pro.md) |
| Seed 2.0 family（Pro/Lite/Mini/Code） | 2026-02-14 | 豆包、TRAE、火山引擎 | [Seed 2.0](./seed-2-0/seed-2-0.md) |
| Seed 2.1 family | 2026-06-23 | 豆包与火山引擎渐进开放 | [Seed 2.1](./seed-2-1/seed-2-1.md) |

## 选型提示

- 只有官方映射表存在时，才把技术家族、产品展示名和 API 型号视为同一 checkpoint。
- Lite 是服务/尺寸档位，不自动代表端侧；参数、MoE、训练数据没有证据就写未知。

[← 返回模型家族索引](../5.3-模型家族.md)
