---
title: "01 · Gemini 2.0 Pro Experimental：2025-02-05，2M 上下文，偏代码与复杂 prompt"
date: 2026-08-30
as_of: 2026-08-30
tags: [Gemini-2.0-Pro, 公开材料精读]
---

# Gemini 2.0 Pro：2M 上下文，偏代码

>  **[返回 14.11-Gemini 家族总览](../../14.11-Gemini.md)** · 同日家族：[2.0 Flash GA](../06-Gemini-2.0-Flash/01-06-Gemini-2.0-Flash-技术报告精译.md) · 空壳 05：[枢纽](./05-05-Gemini-2.0-Pro-核心技术专题.md)

> **核心定位**：本报告深度解构了 Google DeepMind 在该阶段发布的技术细节与架构思想。作为闭源模型，其技术报告是窥探其内部机制的唯一窗口。

2 月 5 日博文 **没有**写空间智能公式。12 月博文的空间理解段属于 **2.0 Flash** 开发者页，不要倒灌成 Pro 专有架构。

事实源：[Gemini 2.0 model updates](https://blog.google/innovation-and-ai/models-and-research/google-deepmind/gemini-model-updates-february-2025/)（2025-02-05）。

## 1. 博文实际给了什么

相对当时已放出的 experimental 档（点名 **Gemini-Exp-1206**）的开发者反馈，发 **Gemini 2.0 Pro experimental**：

- 自称当时 Google 放出的模型里，**代码**和**复杂 prompt** 最强，世界知识理解/推理也更好
- 上下文 **2 million tokens**（文中：家族里最大窗）
- 可调 **Google Search** 与 **code execution**
- 渠道：AI Studio、Vertex；Gemini Advanced 用户在桌面/移动下拉框

发布日口径：**多模态输入 + 文本输出**；更多模态「未来几个月」才 GA。定价指向 Developers 博文，本篇未打开那张价目表，不填美元。

12 月 11 日家族首发的是 **Flash experimental**，不是 Pro。不要把 Pro 写成 2024-12-11 首发旗舰。

## 2. 0.4 拆面

| 面 | 给了 | 没给 |
|----|------|------|
| 积木 / 架构 | — | 层数、是否 MoE、是否与 Flash 同骨架 |
| 数据 / 优化器 | — | 全部 |
| Infra | 同家族：12 月文写 Trillium 训推 100% | 卡数 |
| 训推 | 2M 窗、Search/code 工具 | 量化 |

空壳 05 的 Ring Attention **不是**本博文。

## 3. 失效条件

- 把 Flash 的 1M 和 Pro 的 2M 收成同一个官方窗口。
- 把 12 月 Flash 的原生出图/TTS 写成 2 月 Pro 已 GA（2 月文对全家默认仍是「输入多模态、输出文本」）。

## 参考文献

- https://blog.google/innovation-and-ai/models-and-research/google-deepmind/gemini-model-updates-february-2025/
