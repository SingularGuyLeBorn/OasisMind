---
title: "01 · Gemini 1.5 Flash：从 1.5 Pro 在线蒸馏的低延迟 decoder"
date: 2026-08-30
as_of: 2026-08-30
tags: [Gemini-1.5-Flash, distillation]
---

# Gemini 1.5 Flash: 高频API调用的极致速度优化 - 技术报告精译

>  **[返回 14.11-Gemini 家族总览](../../14.11-Gemini.md)** · 同报告旗舰：[1.5 Pro](../02-Gemini-1.5-Pro/01-02-Gemini-1.5-Pro-技术报告精译.md) · 前代：[Gemini 1.0](../01-Gemini-1.0/01-01-Gemini-1.0-技术报告精译.md)

> **核心定位**：本报告深度解构了 Google DeepMind 在该阶段发布的技术细节与架构思想。作为闭源模型，其技术报告是窥探其内部机制的唯一窗口。

与 1.5 Pro **同一份** arXiv:2403.05530，不是独立架构论文。空壳两段从 1.0 模板复制，连 TPU 代数都错了。Flash **不是** MoE 旗舰的量化 SKU，报告把它写成另一套 decoder。

## 1. 报告 §3.2 实际写了什么

Transformer **decoder**，上下文与多模态能力对齐 1.5 Pro 的 **2M+**。为 TPU serving 做低延迟：注意力与 FFN **并行算**（引 PaLM 的 Chowdhery et al. 2023）。从大得多的 1.5 Pro **在线蒸馏**。训练用 **高阶预条件**方法（Becker & LeCun 1989 一路，报告点了 Duchi et al. 2011 等）。

相对 1.0 Pro：核心能力 41/50 项更好。相对 1.0 Ultra：视觉 13/21 更好，文本约 8/18。音频五项相对 1.0 **0 胜**（Table 2）。不要把「全面超过 Ultra」写进 Flash。

NIAH：与 Pro 一样，各模态到数百万 token 近乎完美召回（>99%）。Kalamang 语法手册实验 Flash 也做了。

延迟 Table 3：英文 / 日 / 中 / 法，输入约 1 万字符时，Flash 的每输出字符时间在所测 API 里最快。具体毫秒以表为准，本篇不把图估成第三个数——**若 HTML 表在抽取里错位，以 PDF Table 3 为准，不要用记忆填 ms**。

## 2. 失效条件

- 把 Flash 写成 1.5 Pro 的 4-bit 版（那是 1.0 Nano）。
- 把 Flash 写成稀疏 MoE。
- 空壳里的 v5/v6 训练芯片。

## 参考文献

- https://arxiv.org/html/2403.05530 §3.2–3.3、Table 2、摘要 Flash 句
