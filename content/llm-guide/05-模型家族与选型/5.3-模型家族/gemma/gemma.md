---
title: "Gemma 模型家族"
category: "模型家族与选型"
tags: ["gemma", "模型家族", "开放权重", "端侧"]
published: true
as_of: "2026-09-01"
excerpt: "Gemma 1–4 的模态、规模、上下文、许可与部署边界。"
---

# Gemma 模型家族

> 核验日期：2026-09-01。“开放权重”与 Apache 2.0 不应混写：Gemma 1–3 需接受对应 Gemma Terms，Gemma 4 模型卡标为 Apache 2.0。

## 定位与谱系

| 身份 | 官方定位 | 关键边界 | 页面 |
|---|---|---|---|
| Gemma | 轻量 text-to-text decoder | 英语文本；2B/7B 初代线 | [Gemma](./gemma-1/gemma-1.md) |
| Gemma 2 | 2B/9B/27B 文本模型 | 不要把 27B 配方复制到 2B/9B | [Gemma 2](./gemma-2/gemma-2.md) |
| Gemma 3 | 270M/1B/4B/12B/27B 多尺寸线 | 图像输入只适用于部分尺寸；窗口随尺寸变 | [Gemma 3](./gemma-3/gemma-3.md) |
| Gemma 4 | Dense + MoE，多模态与可配置 thinking | E2B/E4B/12B/26B-A4B/31B；Apache 2.0 | [Gemma 4](./gemma-4/gemma-4.md) |

## 能力边界

- Gemma 3 的 1B/270M 与 4B/12B/27B 在模态和上下文上不同，不能只写一个“Gemma 3=128K 多模态”。
- Gemma 4 的音频能力只覆盖官方列出的 E2B、E4B 和 12B；31B/26B-A4B 不应自动继承。
- 官方 benchmark 是厂商评测；生产选型需要自己的提示模板、量化、吞吐和安全回归。

## 部署与选型

- 纯文本、既有工具链复现：按 Gemma/Gemma 2 具体尺寸评估。
- 图像输入和 128K 级上下文：Gemma 3 的 4B/12B/27B。
- 音频、thinking、system role 或 Dense/MoE 多档选择：核对 Gemma 4 具体 SKU。
- 端侧选择要用真实量化格式和峰值内存验证，参数量不是设备可运行性的充分条件。

## 一手来源

- [Gemma 模型卡](https://ai.google.dev/gemma/docs/core/model_card)
- [Gemma 2 模型卡](https://ai.google.dev/gemma/docs/core/model_card_2)
- [Gemma 3 模型卡](https://ai.google.dev/gemma/docs/core/model_card_3)
- [Gemma 4 模型卡](https://ai.google.dev/gemma/docs/core/model_card_4)
- [Gemma 4 技术报告](https://arxiv.org/abs/2607.02770)

[← 返回模型家族索引](../5.3-模型家族.md)
