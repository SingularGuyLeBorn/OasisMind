---
title: "01 · Gemini 3 Pro：2025-11-18 preview；HLE 37.5%；SWE-bench 76.2%；1M"
date: 2026-08-30
as_of: 2026-08-30
tags: [Gemini-3-Pro, 公开材料精读]
---

# Gemini 3.0 Pro: 原生多模态生成与动态推理 - 技术报告精译

>  **[返回 14.11-Gemini 家族总览](../../14.11-Gemini.md)** · 同代：[3 Flash](../12-Gemini-3.0-Flash/01-12-Gemini-3.0-Flash-技术报告精译.md) · 后继：[3.1 Pro](../13-Gemini-3.1-Pro/01-13-Gemini-3.1-Pro-技术报告精译.md) · 已有长 D5：[次世代架构](./05-11-Gemini-3.0-Pro-核心技术专题.md)

> **核心定位**：本报告深度解构了 Google DeepMind 在该阶段发布的技术细节与架构思想。作为闭源模型，其技术报告是窥探其内部机制的唯一窗口。

**产品博文**。空壳/长 D5 把发布写成「2025 年中」、上下文 **2M**、原生出图出声——[A new era of intelligence with Gemini 3](https://blog.google/products-and-platforms/products/gemini/gemini-3/)（2025-**11-18**）写的是 **Gemini 3 Pro preview**、**1 million-token** 窗。开发者价在 [Start building with Gemini 3](https://blog.google/innovation-and-ai/technology/developers-tools/gemini-3-developers/)：**$2 / $12 per million** in/out（prompt **≤200k**）。没有层数、没有 MoE 表。

## 1. 产品

自称当时最强 Gemini；多模态理解 + agentic / vibe coding。当天：Search AI Mode（首次 day-one 进 Search）、Gemini app、AI Studio、Vertex、**Google Antigravity**。另介 **Gemini 3 Deep Think**（更强推理模式）：先给安全测试，再给 Google AI Ultra「未来几周」。

Antigravity 还绑了 **Gemini 2.5 Computer Use**（浏览器）和 Nano Banana（2.5 Image）——不要写成 3 Pro 自己的计算机使用权重。

## 2. 数字（只抄正文）

| | Gemini 3 Pro | Deep Think（另模式） |
|--|--------------|----------------------|
| LMArena | **1501** Elo | — |
| HLE 无工具 | **37.5%** | **41.0%** |
| GPQA Diamond | **91.9%** | **93.8%** |
| MathArena Apex | **23.4%** | — |
| MMMU-Pro | **81%** | — |
| Video-MMMU | **87.6%** | — |
| SimpleQA Verified | **72.1%** | — |
| ARC-AGI-2 | （本篇博文没给 Pro 百分数） | **45.1%**（带 code execution，ARC Prize Verified） |
| WebDev Arena | **1487** Elo | — |
| Terminal-Bench 2.0 | **54.2%** | — |
| SWE-bench Verified | **76.2%** | — |

Vending-Bench 2：自称 topping，管模拟自动售货机「一整年」不跑偏——**没有**把图上的美元估进本篇。

API：thinking level、更细的 media resolution、多轮要传 **thought signatures**。客户端 bash tool；托管 server-side bash 当时 early access。

## 3. 失效条件

- 2M 窗（这篇是 1M）。
- 把 Deep Think 的 41.0 / 45.1 收成 Pro 主分。
- 把 3 Flash（12-17）写成与 Pro 同日。

## 参考文献

- https://blog.google/products-and-platforms/products/gemini/gemini-3/
- https://blog.google/innovation-and-ai/technology/developers-tools/gemini-3-developers/
