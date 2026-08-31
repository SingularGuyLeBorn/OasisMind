---
title: "Gemini 2.0：工具、实时交互与多模态输出的产品化"
published: true
as_of: 2026-09-01
tags: [Gemini-2.0, Agent, Live-API, 工具调用]
---

# Gemini 2.0

Gemini 2.0 的首发节点是 2024-12-11 的 **Gemini 2.0 Flash experimental**。它把“理解多模态”扩展到工具调用、实时音视频和多模态输出，并成为 Google 所称 agentic era 的产品基础。

> [返回 Gemini 家族](../gemini.md)

## 时间线与身份

| 日期 | 身份 | 状态与边界 |
|---:|---|---|
| 2024-12-11 | Gemini 2.0 Flash experimental | 多模态输入；文本输出普遍可用；原生图像/音频输出处于 early access |
| 2024-12 | Flash Thinking experimental | 2.0 Flash 上的思考实验端点，不是新的开放权重架构 |
| 2025-02-05 | Gemini 2.0 Flash | GA，1M 产品上下文 |
| 2025-02-05 | Gemini 2.0 Pro experimental | 2M 上下文，定位代码与复杂提示；仅实验发布 |
| 2025-02 | Gemini 2.0 Flash-Lite | 成本与延迟优化的服务档位 |

Google DeepMind 的模型卡索引特别注明：Gemini 2.0 Pro **只以 experimental 形式发布**。旧稿把它写成 2024-12 已 GA 的旗舰，会混淆 Flash 首发和 Pro 实验档。

## 官方确认的能力

- 原生调用 Google Search、code execution 与开发者函数。
- Multimodal Live API 支持流式音视频、语音活动检测和中途打断。
- 2.0 Flash 的实验能力包含图文交错生成与可控多语 TTS；早期并非所有开发者端点都开放这些输出。
- 研究代理可结合代码执行与多候选采样完成软件任务；代理成绩不等于裸模型一次前向的成绩。
- 2.0 家族使用 Trillium（第六代 TPU）进行训练与推理；官方没有据此公开层数、MoE 配置或参数量。

## Thinking 实验的历史定位

`gemini-2.0-flash-thinking-exp` 是后续 2.5 thinking 路线的产品先驱。它曾有多个日期化实验 ID，均应视为短生命周期服务，而不是可长期固定的研究模型名称。

## 2026 年状态

- 2.0 Flash 与 Flash-Lite 的 GA 端点在 Gemini API 生命周期表中标为 **2026-06-01 关闭**。
- 2.0 Pro experimental、Flash Thinking 等预览/实验 ID 更早已关闭。
- 维护旧系统时应迁往官方生命周期表给出的 3.x 替代型号，并重新验证工具参数、输出模态与安全设置。

## 不可推断项

- 2.0 Pro/Flash 的参数量、专家数、层数和精确训练数据。
- 原生图像生成是否使用某种特定 VQ-VAE、扩散模型或统一词表；官方产品材料没有给出足以确认的结构。
- 某个 2.0 端点支持工具，不代表所有 2.0 产品、区域和日期都支持相同工具组合。

## 官方资料

- [Gemini 2.0 首发公告](https://blog.google/innovation-and-ai/models-and-research/google-deepmind/google-gemini-ai-update-december-2024/)
- [Gemini 2.0 面向开发者的首发说明](https://developers.googleblog.com/en/the-next-chapter-of-the-gemini-era-for-developers/)
- [Gemini 2.0 2025-02 更新](https://blog.google/innovation-and-ai/models-and-research/google-deepmind/gemini-model-updates-february-2025/)
- [Gemini API 生命周期表](https://ai.google.dev/gemini-api/docs/deprecations)
