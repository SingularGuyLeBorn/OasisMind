---
title: "01 · Gemini 1.5 Flash-8B：1.5 Flash 的更小更快变体，2024-10-03 GA"
date: 2026-08-30
as_of: 2026-08-30
tags: [Gemini-1.5-Flash-8B, 公开材料精读]
---

# Gemini 1.5 Flash-8B: 端侧与边缘计算的微型巨头 - 技术报告精译

>  **[返回 14.11-Gemini 家族总览](../../14.11-Gemini.md)** · 同系列：[1.5 Flash](../03-Gemini-1.5-Flash/01-03-Gemini-1.5-Flash-技术报告精译.md) · [1.5 Pro](../02-Gemini-1.5-Pro/01-02-Gemini-1.5-Pro-技术报告精译.md)

> **核心定位**：本报告深度解构了 Google DeepMind 在该阶段发布的技术细节与架构思想。作为闭源模型，其技术报告是窥探其内部机制的唯一窗口。

**材料类型（2026-08）**：**产品博文**，不是架构论文。空壳标题把「端侧 / 边缘」写进名字——**2024-10-03 Google Developers 博文没有写端侧部署、没有写层数/头数、没有写蒸馏公式**。产品名带 `8B`，博文正文把它叫「smaller and faster variant of 1.5 Flash」，**没有**另给一张参数表。第三方聚合站的 8.000 亿整数和评测柱 **不要**倒灌。

事实源：[Gemini 1.5 Flash-8B is now production ready](https://developers.googleblog.com/en/gemini-15-flash-8b-is-now-generally-available-for-use/)（Logan Kilpatrick / Shrestha Basu Mallick，2024-10-03）。

## 1. 博文实际给了什么

相对当时的 1.5 Flash：

- 价格 **低 50%**
- 速率限制 **2×**（文中：可到 **4,000 RPM**）
- 短 prompt **更低延迟**

API id：`gemini-1.5-flash-8b`。Google AI Studio 与 Gemini API 可免费用。付费档计费从 **10 月 14 日**（周一）起。

定价（prompt **<128K**）：

| | 每 1M token |
|--|-------------|
| 输入 | **$0.0375** |
| 输出 | **$0.15** |
| 缓存 prompt | **$0.01** |

自称当时 Gemini 里 **lowest cost per intelligence**。前一个月放过 experimental；本篇是 production / GA。

能力口径：在许多 benchmark 上 **nearly matches** 五月发布的 1.5 Flash；特别适合 chat、transcription、long context language translation。场景举例：高并发多模态、长上下文摘要。没有贴 MMLU / HumanEval 表。

## 2. 0.4 拆面

| 面 | 给了 | 没给 |
|----|------|------|
| 积木 | 继承 1.5 Flash 的「小而快」产品线 | 是否 MoE、是否并行 attn+FFN |
| 架构 | 名称含 8B；「smaller variant」 | 层数、头数、精确参数 |
| 数据 / 优化器 / Infra | — | 全部 |
| 训推 | 短 prompt 延迟、4000 RPM | 量化、端侧 runtime |

1.5 技术报告（2403.05530）写的是 **Flash = decoder，从 Pro 在线蒸馏**。Flash-8B 博文 **没有**再写一遍蒸馏；不要把 8B 写成「Pro 的 8B 量化」或「端侧 Nano」。1.0 Nano 才是报告里写明的 1.8B / 3.25B 端侧蒸馏。

## 3. 失效条件

- 把长 D5 里的「端侧部署理想选择」写成官方句。
- 用 Model Beats / 第三方站的 BBH 69.5% 等填本篇。
- 把 2025-09 下线写进 2024-10 博文（那是后话，本篇不写）。

## 本篇来源

- https://developers.googleblog.com/en/gemini-15-flash-8b-is-now-generally-available-for-use/ （本会话读完全文；无评测表）
