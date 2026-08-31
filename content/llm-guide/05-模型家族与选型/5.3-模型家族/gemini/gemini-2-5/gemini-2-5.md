---
title: "Gemini 2.5：thinking 家族与稳定服务边界"
published: true
as_of: 2026-09-01
tags: [Gemini-2.5, Thinking, Pro, Flash]
---

# Gemini 2.5

Gemini 2.5 把 thinking 从 2.0 的实验端点提升为家族级能力。第一款 2.5 Pro experimental 于 2025-03-25 发布，2.5 Flash preview 于 2025-04-17 发布；二者不是同日首发。

> [返回 Gemini 家族](../gemini.md)

## 发布与服务时间线

| 日期 | 型号 | 说明 |
|---:|---|---|
| 2025-03-25 | 2.5 Pro Experimental | 首款 2.5 thinking 模型；当日公开 1M 窗，2M 当时仍是预告 |
| 2025-04-17 | 2.5 Flash Preview | 可配置 thinking；速度/成本导向 |
| 2025-06-17 | `gemini-2.5-pro` | 稳定版 |
| 2025-06-17 | `gemini-2.5-flash` | 稳定版 |
| 2025-07-22 | `gemini-2.5-flash-lite` | 稳定的低成本档 |
| 2025-08-01 | 2.5 Deep Think | 单独模型卡/模式，不能把其评测并入普通 Pro |

## 当前稳定 Pro 的精确口径

截至 2026-09-01，Gemini API 型号页对 `gemini-2.5-pro` 给出的信息是：

| 项目 | 值 |
|---|---|
| 输入 | 文本、图像、视频、音频、PDF |
| 输出 | 文本 |
| 输入上限 | 1,048,576 token |
| 输出上限 | 65,536 token |
| 知识截止 | 2025-01 |
| 工具 | Search grounding、code execution、function calling、Maps grounding、file search 等 |
| 权重 | 未开放 |

这组数字属于具体 API 型号，不应拿来覆盖历史 preview，也不能从中推断网络参数量。

## Pro、Flash 与 Flash-Lite

- **Pro**：复杂推理、代码、长文档与多模态分析，thinking 是核心能力。
- **Flash**：质量、吞吐与成本的折中；2025-04 preview 官方称其为 fully hybrid reasoning model，允许通过 thinking budget 调节或关闭思考。
- **Flash-Lite**：更低成本/高吞吐服务档，不表示权重可下载或可端侧部署。

preview 时的 `thinking_budget` 范围和稳定服务的实际参数支持必须按当前 SDK/型号页检查。不能把 2.5 的整数 budget 规则直接套到 3.7 的离散 thinking level。

## 生命周期

2026-09-01 的 Gemini API 生命周期表仍列出 `gemini-2.5-pro`、`gemini-2.5-flash` 和 `gemini-2.5-flash-lite`，且没有公布关闭日期。多个日期化 preview 已经关闭。生产系统应使用稳定 ID，并监控后续公告。

## 评测阅读规则

- 区分无工具、搜索、代码执行、custom agent setup。
- 区分单次回答、pass@k、多数投票和 Deep Think。
- 产品博文的排行榜快照具有日期性，不能与后续模型卡或第三方更新榜单混表。
- “thinking 摘要”是产品可见内容，不应等同于模型完整内部推理链。

## 常见错误

- 把 2.5 Pro 与 2.5 Flash 写成 2025-03-25 同发。
- 把早期“2M coming soon”改写为当前 `gemini-2.5-pro` 的输入上限。
- 把 2.5 Pro/Flash 说成开放权重或可自托管模型。
- 用价格、延迟或榜单反推 Pro/Flash 的参数量。
- 把 2.5 Flash Image、Live、TTS 等专用端点能力写成通用文本端点默认能力。

## 官方资料

- [Gemini 2.5 Pro 首发公告](https://blog.google/innovation-and-ai/models-and-research/google-deepmind/gemini-model-thinking-updates-march-2025/)
- [Gemini 2.5 Flash preview 公告](https://developers.googleblog.com/en/start-building-with-gemini-25-flash/)
- [Gemini 2.5 Pro 型号页](https://ai.google.dev/gemini-api/docs/models/gemini-2.5-pro)
- [Gemini API 生命周期表](https://ai.google.dev/gemini-api/docs/deprecations)
- [Google DeepMind 模型卡索引](https://deepmind.google/models/model-cards/)
