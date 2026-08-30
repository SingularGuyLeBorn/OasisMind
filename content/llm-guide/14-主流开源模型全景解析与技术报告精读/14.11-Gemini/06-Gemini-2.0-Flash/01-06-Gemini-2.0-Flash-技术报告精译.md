---
title: "01 · Gemini 2.0 Flash：实验档 2024-12-11，GA 2025-02-05；原生多模态输出 + 工具"
date: 2026-08-30
as_of: 2026-08-30
tags: [Gemini-2.0-Flash, 公开材料精读]
---

# Gemini 2.0 Flash: 取代 1.5 Pro 的性价比王者 - 技术报告精译

>  **[返回 14.11-Gemini 家族总览](../../14.11-Gemini.md)** · 同家族：[2.0 Pro](../05-Gemini-2.0-Pro/01-05-Gemini-2.0-Pro-技术报告精译.md) · [Thinking](../07-Gemini-2.0-Flash-Thinking/01-07-Gemini-2.0-Flash-Thinking-技术报告精译.md) · 已有长 D5：[05-06](./05-06-Gemini-2.0-Flash-核心技术专题.md)

> **核心定位**：本报告深度解构了 Google DeepMind 在该阶段发布的技术细节与架构思想。作为闭源模型，其技术报告是窥探其内部机制的唯一窗口。

**材料类型（2026-08）**：**产品博文**，没有 1.0/1.5 那种技术报告。空壳两段把 TPU v5/v6 和「长程强化学习」从 1.0 模板再贴一遍——2024-12-11 博文写的是 **Trillium（第六代 TPU）承担 2.0 训练与推理的 100%**。

## 1. 时间线（不要合成一个「正式发布日」）

| 日 | 博文 | 状态 |
|----|------|------|
| 2024-12-11 | [Introducing Gemini 2.0](https://blog.google/innovation-and-ai/models-and-research/google-deepmind/google-gemini-ai-update-december-2024/) + [开发者博文](https://developers.googleblog.com/en/the-next-chapter-of-the-gemini-era-for-developers/) | **2.0 Flash experimental**；Gemini 用户可选 chat 优化版 |
| 2025-02-05 | [2.0 is now available to everyone](https://blog.google/innovation-and-ai/models-and-research/google-deepmind/gemini-model-updates-february-2025/) | **2.0 Flash GA**（AI Studio / Vertex）；图生图与 TTS「coming soon」 |

12 月口径：相对 1.5 Flash 同级延迟；**关键基准上超过 1.5 Pro，速度约 2×**。开发者博文重复「比 1.5 Pro 更强、仍是 Flash 的速度」。**没有**贴 MMLU 表。上下文：2 月 GA 博文写 Flash 系列 **1 million tokens**（这是产品窗，不要和 1.5 的 10M 研究上限混）。

## 2. 产品能力（12 月两篇）

- 多模态 **输入**（图/视频/音频）之外，开始支持多模态 **输出**：原生图文交错、可转向的多语 TTS。12 月：图/音频输出给 early-access；全体开发者先用多模态输入+文本输出。开发者博文：图/音频输出带 **SynthID**；TTS **8** 种高质量音色。
- **原生调工具**：Google Search、code execution、第三方 function calling。Search 可并行多次。
- **Multimodal Live API**：实时音视频流；打断与 VAD；多工具一次调用。
- 空间理解：杂乱图里小物体的 bounding box 更准（开发者博文，无定量表）。
- 研究 agent：2.0 Flash + code execution，对解采样「数百」个候选，SWE-bench Verified **51.8%**——这是 **带工具的 agent 设置**，不是裸模型一道前向。

2 月同文还发了 **Flash-Lite**（相对 1.5 Flash：质量更好、速度与价格相同、1M 窗；约 4 万张图一条 caption、<1 美元）和 **2.0 Pro Experimental**。Flash-Lite = 价位 SKU，**不另建目录**。

安全：2 月博文写 2.0 线用了「Gemini 自评」的新 RL 技术 + 自动红队（含间接 prompt injection）。没有公式。

## 3. 失效条件

- 把 12 月 experimental 写成 GA。
- 把 51.8% SWE-bench 写成裸 Flash 分数。
- 把长 D5 的 MoE 稀疏化写成官方句（两篇博文都没写 MoE）。
- 为 Flash-Lite mkdir。

## 本篇来源

- https://blog.google/innovation-and-ai/models-and-research/google-deepmind/google-gemini-ai-update-december-2024/
- https://developers.googleblog.com/en/the-next-chapter-of-the-gemini-era-for-developers/
- https://blog.google/innovation-and-ai/models-and-research/google-deepmind/gemini-model-updates-february-2025/
