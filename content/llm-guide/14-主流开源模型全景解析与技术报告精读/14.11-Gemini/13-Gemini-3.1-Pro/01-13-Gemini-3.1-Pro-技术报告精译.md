---
title: "01 · Gemini 3.1 Pro：2026-02-19 preview；ARC-AGI-2 77.1%"
date: 2026-08-30
as_of: 2026-08-30
tags: [Gemini-3.1-Pro, 公开材料精读]
---

# Gemini 3.1 Pro: 动态测试时计算 - 技术报告精译

>  **[返回 14.11-Gemini 家族总览](../../14.11-Gemini.md)** · 前代：[3 Pro](../11-Gemini-3.0-Pro/01-11-Gemini-3.0-Pro-技术报告精译.md) · 已有长 D5：[动态测试时计算](./05-Gemini-3.1-Pro-动态测试时计算与原生多模态生成引擎.md)

> **核心定位**：本报告深度解构了 Google DeepMind 在该阶段发布的技术细节与架构思想。作为闭源模型，其技术报告是窥探其内部机制的唯一窗口。

**材料类型（2026-08）**：**产品博文**。[Gemini 3.1 Pro: A smarter model for your most complex tasks](https://blog.google/innovation-and-ai/models-and-research/gemini-models/gemini-3-1-pro/)（2026-**02-19**）。上一周刚更过 3 Deep Think。3.1 Pro = 升级后的 **core intelligence**，preview。渠道：Gemini API / AI Studio / CLI / Antigravity / Android Studio；Vertex / Gemini Enterprise；Gemini app 与 NotebookLM（Pro/Ultra 更高限额；NotebookLM 仅 Pro/Ultra）。

## 1. 唯一写进正文的基准

**ARC-AGI-2** 验证分 **77.1%**。博文：这是 3 Pro 推理表现的 **两倍以上**。**没有**在这篇里重报 HLE / GPQA / SWE。长 D5 表里的 1M/64K、稀疏 MoE、Deep Think Mini、Veo 视频生成 **不是**这篇。3 Pro 开发者价 $2/$12 **不要**未经本页确认就抄成 3.1 官价。

## 2. 产品例子（不是评测）

从文本 prompt 生成可上线的动画 SVG；接公开遥测做 ISS 轨道仪表盘；3D 椋鸟群 + 手势 + 生成配乐；把《呼啸山庄》做成作品集站。这些是演示，**没有**成功率表。

计划：preview 验证后再 GA；继续做 agentic workflows。

## 3. 失效条件

- 把 77.1% 和 3 Deep Think 的 ARC 45.1% 收成同一个设置（一个是 3.1 Pro，一个是 3 Deep Think + code execution）。
- 为 3.1 再编 MoE 层表。

## 本篇来源

- https://blog.google/innovation-and-ai/models-and-research/gemini-models/gemini-3-1-pro/
