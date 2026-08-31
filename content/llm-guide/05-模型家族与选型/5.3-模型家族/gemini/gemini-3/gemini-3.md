---
title: "Gemini 3：当前型号、thinking level 与生命周期"
published: true
as_of: 2026-09-01
tags: [Gemini-3, Gemini-3.7-Flash, Gemini-3.1-Pro, API]
---

# Gemini 3

Gemini 3 于 2025-11-18 以 Gemini 3 Pro Preview 首发，随后形成 Pro、Flash、Flash-Lite、图像、音频与 Omni 等多条服务线。它不是单一权重，而是频繁迭代的闭源服务族。

> [返回 Gemini 家族](../gemini.md)

## 从 3 Pro 到 3.7 Flash

| 日期 | 型号 | 身份变化 |
|---:|---|---|
| 2025-11-18 | `gemini-3-pro-preview` | Gemini 3 Pro Preview；1M 输入；后于 2026-03-09 关闭 |
| 2025-12-17 | `gemini-3-flash-preview` | Gemini 3 Flash Preview；并非与 Pro 同日发布 |
| 2026-02-19 | `gemini-3.1-pro-preview` | 3.1 Pro Preview，基于 3 Pro；截至核对日未公布关闭日期 |
| 2026-05-19 | `gemini-3.5-flash` | 稳定 Flash，1M 输入、64K 输出 |
| 2026-07-21 | `gemini-3.6-flash` | 稳定 Flash |
| 2026-08 | `gemini-3.7-flash` | 稳定/GA，面向代理编码与复杂工作流 |

Google 还提供 3.1 Flash-Lite、3.5 Flash-Lite、图像、Live、TTS、转录与 Omni 等端点。它们应按各自模型卡和 API 页核对，不能从“Gemini 3”总名推断输入输出能力。

## 2026-09-01 的通用模型快照

| 模型 ID | 状态 | 生命周期表中的关停信息 | 选型提示 |
|---|---|---|---|
| `gemini-3.7-flash` | Stable / GA | 未公布 | 当前高能力 Flash；复杂编码、工具与多模态理解 |
| `gemini-3.6-flash` | Stable | 未公布 | 3.7 的前一代 Flash；迁移时做行为回归 |
| `gemini-3.5-flash` | Stable | 未公布 | 1M/64K；支持多种工具与 computer use |
| `gemini-3.5-flash-lite` | Stable | 未公布 | 高吞吐、低延迟与成本导向 |
| `gemini-3.1-flash-lite` | Stable | 2027-05-07 | 已有明确迁移窗口，替代为 3.5 Flash-Lite |
| `gemini-3.1-pro-preview` | Preview | 未公布 | 高难推理，但 preview 不能视为长期稳定承诺 |
| `gemini-3-flash-preview` | Preview | 未公布 | 生命周期表推荐迁往 3.6 Flash |

“未公布关闭日期”不等于永久支持，只表示官方表在核对日没有给出日期。

## Gemini 3.7 Flash 的精确规格

Google DeepMind 与 Gemini API 型号页给出的 3.7 Flash 口径：

| 项目 | 值 |
|---|---|
| 模型 ID | `gemini-3.7-flash` |
| 状态 | General availability |
| 输入 | 文本、图像、视频、音频、PDF |
| 输出 | 文本 |
| 输入上限 | 1,048,576 token（DeepMind 页面简写 1M） |
| 输出上限 | 65,536 token（DeepMind 页面简写 64K） |
| thinking | low / medium / high；不支持 minimal |
| 知识截止 | 主要写为 2026-03；部分领域可能仍受 2025-01 截止影响 |
| 权重 | 未开放 |

1M/64K 与 1,048,576/65,536 是二进制精确值和产品简写，不应制造成两种不同窗口。

## Thinking 参数不能跨版本套用

- 2.5 系主要暴露整数 `thinking_budget`。
- 3.x 引入 `thinking_level`，但各型号可用枚举不同。
- 3.5 Flash 为兼容旧代码仍支持 `thinking_budget`，官方建议迁往 `thinking_level`。
- 3.7 Flash 支持 low/medium/high，默认与具体平台文档相关；`minimal` 会报错。
- 同一请求不要同时传 budget 与 level。

采样参数的支持也会变化。迁移不仅是替换模型 ID，还要检查 thought signatures、对话历史、function response 配对、结构化输出和工具组合。

## 3.7 评测怎样读

模型卡的结果截止 2026-08。部分代表性结果：

| 基准 | 3.7 Flash | 口径提醒 |
|---|---:|---|
| FrontierCode 1.1 Main | 43.6% | 生产代码质量 |
| DeepSWE v1.1 | 65.3% | 3.7 为 mini SWE agent + high thinking；不要当裸模型 |
| Terminal-bench 2.1 | 85.8% | Terminus-2 harness |
| GDM-MRCR v2 8-needle | 97.0% | 128K average，不代表 1M 任意任务质量 |
| HLE-Verified | 53.6% | 使用修订后的 1,811 题集合 |

模型卡中 CharXiv 两行 3.7 略低于 3.6，说明“新版本全面领先”并不成立。跨厂商列也混合公开榜与自测，必须同时阅读评测方法页。

## 价格是动态服务事实

3.7 Flash 模型卡给出的 introductory 价格为每 1M token 输入 **$0.75**、输出 **$3.75**，有效至 2026-12-31；自 2027-01-01 起写为输入 **$1.50**、输出 **$7.50**。价格不是模型身份的一部分，使用前应重新核对。

## 公开材料没有给出的内容

- 3.x 的完整参数量、层数、专家数、训练 token 与训练数据配比。
- “3.7 一定比 3.6 更大”或“3.1 Pro 使用三级动态骨架”等结构结论。
- API 别名背后的权重是否完全相同。
- 通过价格、基准或延迟反推网络结构。

## 官方资料

- [Gemini API 模型列表](https://ai.google.dev/gemini-api/docs/models)
- [Gemini API 生命周期表](https://ai.google.dev/gemini-api/docs/deprecations)
- [Gemini 3 开发者指南](https://ai.google.dev/gemini-api/docs/gemini-3)
- [Gemini 3.7 Flash 型号页](https://ai.google.dev/gemini-api/docs/models/gemini-3.7-flash)
- [Gemini 3.7 Flash 模型卡](https://deepmind.google/models/model-cards/gemini-3-7-flash/)
- [Gemini 3.7 Flash 评测方法](https://deepmind.google/models/evals-methodology/gemini-3-7-flash)
- [Gemini 3.1 Pro 模型卡](https://deepmind.google/models/model-cards/gemini-3-1-pro)
- [Gemini 3.5 Flash 模型卡](https://deepmind.google/models/model-cards/gemini-3-5-flash/)
