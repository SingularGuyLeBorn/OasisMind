---
title: "01 · Gemini 2.5 Flash：2025-04-17 preview，可开关 thinking，预算 0–24576"
date: 2026-08-30
as_of: 2026-08-30
tags: [Gemini-2.5-Flash, hybrid-reasoning, 公开材料精读]
---

# Gemini 2.5 Flash：可开关 thinking

>  **[返回 14.11-Gemini 家族总览](../../14.11-Gemini.md)** · 同代旗舰：[2.5 Pro](../08-Gemini-2.5-Pro/01-08-Gemini-2.5-Pro-技术报告精译.md)

> **核心定位**：本报告深度解构了 Google DeepMind 在该阶段发布的技术细节与架构思想。作为闭源模型，其技术报告是窥探其内部机制的唯一窗口。

[Start building with Gemini 2.5 Flash](https://developers.googleblog.com/en/start-building-with-gemini-25-flash/)（Tulsee Doshi，**2025-04-17**）**没有**写语音端到端。那是 Live API / 别的产品线。

## 1. 产品

在 2.0 Flash 上加推理，仍偏速度与成本。自称 **first fully hybrid reasoning model**：thinking **可开可关**。关 thinking 时仍保持 2.0 Flash 的速度，且性能更好。Preview：Gemini API / AI Studio / Vertex；Gemini App 有独立下拉。模型 id 示例：`gemini-2.5-flash-preview-04-17`。文末：继续改进后再 **GA**。

LMArena **Hard Prompts**：强，仅次于 2.5 Pro。价质比自称 Pareto 前沿；图注价来自 Artificial Analysis & 公司文档——**本篇不把图上的 $/M 估成第三个数**。

## 2. thinking_budget

API / Studio / Vertex 滑条。范围 **0 到 24576** token。预算是 **上限**；prompt 不需要时模型 **不会用满**。设 **0** = 最低成本与延迟，仍声称好过 2.0 Flash。模型会按任务复杂度自动决定想多久。示例：1024 budget 的 Python `ThinkingConfig`。

博文按「默认模式可能用多少推理」举例：低（西班牙语谢谢 / 加拿大多少省）、中（两骰子和为 7 / 健身房日程）、高（悬臂梁应力 / 无 eval 的表格公式求值）。**不是**评测表。

## 3. 失效条件

- 与 2.5 Pro 写成 3 月 25 日同发（Flash 是 4 月 17 日 preview）。
- 把 Firebase 文档里的 −1 dynamic / Pro 不能关 thinking 写进 **本篇**（对照页看过，**博文正文没写 −1**；Pro 不能关是文档句，留在 2.5 Pro）。
- 把端到端语音写进这篇。

## 参考文献

- https://developers.googleblog.com/en/start-building-with-gemini-25-flash/
