---
title: "01 · Project Astra：I/O 原型；2024-12 用 Gemini 2.0 更新的研究助手"
date: 2026-08-30
as_of: 2026-08-30
tags: [Project-Astra, 公开材料精读]
---

# Project Astra: 实时视觉与语音多模态全双工 Agent - 技术报告精译

>  **[返回 14.11-Gemini 家族总览](../../14.11-Gemini.md)** · 底座：[Gemini 2.0 Flash](../06-Gemini-2.0-Flash/01-06-Gemini-2.0-Flash-技术报告精译.md) · 体系章：[8.7 Omni](../../../8-多模态/8.7-Omni与全双工/8.7-Omni与全双工.md)

> **核心定位**：本报告深度解构了 Google DeepMind 在该阶段发布的技术细节与架构思想。作为闭源模型，其技术报告是窥探其内部机制的唯一窗口。

**研究原型博文**，不是模型权重报告。空壳两段与 1.0 模板相同，作废。

长 D5 把 I/O 2024（5 月）首秀写成「基于 Gemini 2.0」——**2.0 是 12 月才宣布的**。12 月 11 日博文原句是：Astra **在 I/O 介绍过**；此后 Android 可信测试；**latest version built with Gemini 2.0**。

事实源：[Introducing Gemini 2.0](https://blog.google/innovation-and-ai/models-and-research/google-deepmind/google-gemini-ai-update-december-2024/) 的 Astra / Mariner / Jules 节。

## 1. Astra（2.0 更新点）

- 多语及混语对话，口音与生僻词更好
- 可调 Search、Lens、Maps
- 记忆：会话内最多 **10 minutes**；也能记住更多过去对话（用户可控删除）
- 延迟：流式 + 原生音频理解，接近人类对话延迟（**没有**写 232 ms 那种毫秒表）
- 形态：Gemini App、眼镜；扩大可信测试，含一小群原型眼镜

这是 **research prototype**，不是 API 模型卡。

## 2. 同文其它原型（不要建成新空目录）

- **Project Mariner**：浏览器里的 agent；WebVoyager **83.5%**（single agent）；只能在当前活动标签键入/滚动/点击；敏感动作要用户确认。
- **Jules**：GitHub 工作流里的代码 agent（开发者博文另有细节）。
- 游戏/机器人：仅演示定位。

## 3. 失效条件

- 把 5 月 I/O 首秀写成 2.0。
- 把 Mariner 83.5% 写成 Astra 的分数。
- 把 8.7 章 GPT-4o 的 232/320 ms 写进 Astra。

## 参考文献

- https://blog.google/innovation-and-ai/models-and-research/google-deepmind/google-gemini-ai-update-december-2024/ （Astra/Mariner 段）
