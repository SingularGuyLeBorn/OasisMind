---
title: "01 · Gemini 1.0：原生多模态 decoder，Ultra/Pro/Nano，32K"
date: 2026-08-30
as_of: 2026-08-30
tags: [Gemini-1.0, 公开材料精读, MQA]
---

# Gemini 1.0: 开启原生多模态时代 (Ultra/Pro/Nano) - 技术报告精译

>  **[返回 14.11-Gemini 家族总览](../../14.11-Gemini.md)** · 后继：[1.5 Pro](../02-Gemini-1.5-Pro/01-02-Gemini-1.5-Pro-技术报告精译.md) · 已有长 D5：[原生多模态与 Pathways](./05-01-Gemini-1.0-原生多模态预训练与Pathways分布式基础设施.md)

> **核心定位**：本报告深度解构了 Google DeepMind 在该阶段发布的技术细节与架构思想。作为闭源模型，其技术报告是窥探其内部机制的唯一窗口。

**报告精读**。上面「核心定位」保留。下面两段 2025 提纲把 TPU **v5/v6** 和「长程强化学习」写进 1.0——报告写的是 **TPUv5e 与 TPUv4**，后训练是常规 post-train + RLHF 变体，**不是** v6。Ultra/Pro **参数量未公布**；长 D5 里的 ~1.5T / ~180B 是猜测，本篇不采用。

事实源：Gemini Team, *Gemini: A Family of Highly Capable Multimodal Models*（[arXiv:2312.11805](https://arxiv.org/abs/2312.11805)）。

## 1. 家族与架构

Decoder-only Transformer，针对 TPU 训练/推理改过。上下文 **32,768**。注意力举例：**multi-query attention**（Shazeer 2019）。Table 1：

| 尺寸 | 报告怎么写 |
|------|------------|
| Ultra | 最强；可在 TPU 上规模化 serving |
| Pro | 成本与延迟优化，能力仍宽 |
| Nano | 端侧。**Nano-1 = 1.8B，Nano-2 = 3.25B**，从更大 Gemini 蒸馏，**4-bit** 量化部署 |

视觉编码受 Flamingo / CoCa / PaLI 启发，但 **一开始就是多模态**，可用离散 image token **输出图像**。视频 = 上下文里的帧序列。音频：16 kHz USM 特征直喂，不先转成 ASR 文本。

后训练出两支：Gemini Apps（原 Bard 对话）与 Gemini API（AI Studio / Vertex）。

## 2. Infra（§3）

按尺寸用 TPUv5e 或 TPUv4。Ultra 用跨数据中心的大批 TPUv4。SuperPod = **4096** 芯片 + 光交换，约 10 秒把 4×4×4 立方重配成 3D torus。Ultra 每个 SuperPod 留少量立方体做热备和滚动维护。Pod 内模型并行，跨 Pod 数据并行。Jax + **Pathways** 单控制器；XLA GSPMD + MegaScale。权重不只定期 checkpoint：内存里冗余副本，故障从完整 replica 恢复。最大作业 goodput **85% → 97%**（相对 PaLM / PaLM-2）。Silent Data Corruption 按「每一两周一次」量级处理，确定性 replay 定位坏硬件。

数据：网页、书、代码 + 图像、音频、视频；SentencePiece 在全语料样本上训；按 Hoffmann et al. 2022 定最大模型 token 数；小模型多训 token。配比与过滤规则没有公开整数表。

## 3. 评测（Table 2 / 多模态，设置不要混）

| | Ultra | Pro | 设置 |
|--|-------|-----|------|
| MMLU | **90.04%** / 83.7% | 79.13% / 71.8% | CoT@32 或 @8 / 5-shot |
| GSM8K | **94.4%** | 86.5% | Maj1@32 |
| MATH | **53.2%** | 32.6% | 4-shot |
| HumanEval | **74.4%** | 67.7% | 0-shot 后训练 API 模型 |
| Natural2Code | **74.9%** | 69.6% | 0-shot（防泄漏新集） |
| MMMU val | **59.4%** pass@1 / **62.4%** Maj1@32 | 47.9% | 0-shot |

人类专家 MMLU 口径 **89.8%**；Ultra 是报告里第一个超过这条线的。HellaSwag 只报去污染后的 10-shot（Ultra 87.8%），因为再微调 100 step 就能把验证集抬到 96.0%——论文用来警告污染。32K 合成检索：Ultra 全窗正确率 **98%**。AlphaCode 2 用 Gemini：Codeforces 前 **15%**（前作约前 50%）。

Nano Table 3：Nano-2 MMLU 5-shot **55.8%**，MATH 4-shot **22.8%**。

## 4. 失效条件

- 把 Ultra/Pro 写成 1.5T/180B。
- 把训练芯片写成 TPU v6。
- 把 90.04% 和 83.7% 收成同一个 MMLU。
- 把 1.5 的 MoE / 百万上下文写进 1.0。

## 参考文献

- https://arxiv.org/html/2312.11805 （摘要、§2–5.1、Table 1–3、MMMU 62.4%、goodput 97%、model card 段 MQA）
