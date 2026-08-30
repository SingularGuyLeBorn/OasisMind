---
title: "01 · Gemini 2.5 Pro Experimental：2025-03-25 内置 thinking，1M 窗"
date: 2026-08-30
as_of: 2026-08-30
tags: [Gemini-2.5-Pro, thinking, 公开材料精读]
---

# Gemini 2.5 Pro: 超大规模强化学习与物理世界模拟 - 技术报告精译

>  **[返回 14.11-Gemini 家族总览](../../14.11-Gemini.md)** · 同代：[2.5 Flash](../09-Gemini-2.5-Flash/01-09-Gemini-2.5-Flash-技术报告精译.md) · 已有长 D5：[思考模式](./05-08-Gemini-2.5-Pro-思考模式与多模态推理的工程化实现.md)

> **核心定位**：本报告深度解构了 Google DeepMind 在该阶段发布的技术细节与架构思想。作为闭源模型，其技术报告是窥探其内部机制的唯一窗口。

**材料类型（2026-08）**：**产品博文**。空壳标题「物理世界模拟 / 超大规模强化学习」**不是** 3 月 25 日这篇。空壳两段 TPU v5/v6 从 1.0 模板复制，作废。

事实源：[Gemini 2.5: Our most intelligent AI model](https://blog.google/innovation-and-ai/models-and-research/google-deepmind/gemini-model-thinking-updates-march-2025/)（Koray Kavukcuoglu，2025-03-25，页上 Last updated March 26）。

## 1. 主张

2.5 全家是 **thinking model**：先想再答。第一个放出的是 **2.5 Pro Experimental**。自称当时最强 Gemini；LMArena **#1**（人偏好，margin 显著）。路线：更好的基座 + 更好的后训练；thinking 将内建到后续所有模型。前作点名 **2.0 Flash Thinking**。

渠道：当天 AI Studio + Gemini Advanced 下拉框；Vertex「coming soon」。定价「未来几周」。

## 2. 数字（只抄正文，不估图柱）

- 数学/科学：GPQA、AIME 2025 **领先**，且 **不用** majority voting 这类加钱的 test-time 技巧。**正文没有写出 GPQA/AIME 百分数**。
- **Humanity’s Last Exam**：**18.8%**，无工具，跨模型 SOTA（当时口径）。
- **SWE-Bench Verified**：**63.8%**，**custom agent setup**——不要写成裸模型一道前向。
- 上下文：**1 million** token 当天；**2 million coming soon**。原生多模态（文/音/图/视频/整仓代码）。

没有层数、没有 MoE、没有优化器名。

## 3. 失效条件

- 把 2.5 Flash（4 月 17 日）写成与 Pro **同日**首发。
- 把空壳「物理模拟」写成官方能力。
- 把长 D5 猜的 GPQA 柱高写进本篇。

## 本篇来源

- https://blog.google/innovation-and-ai/models-and-research/google-deepmind/gemini-model-thinking-updates-march-2025/
