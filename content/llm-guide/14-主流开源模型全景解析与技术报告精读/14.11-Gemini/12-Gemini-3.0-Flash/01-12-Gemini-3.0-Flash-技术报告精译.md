---
title: "01 · Gemini 3 Flash：2025-12-17；SWE-bench 78%；$0.50/$3；不是 3.0 同日"
date: 2026-08-30
as_of: 2026-08-30
tags: [Gemini-3-Flash, 公开材料精读]
---

# Gemini 3.0 Flash: 端到端低延迟工作模型 - 技术报告精译

>  **[返回 14.11-Gemini 家族总览](../../14.11-Gemini.md)** · 同代旗舰：[3 Pro](../11-Gemini-3.0-Pro/01-11-Gemini-3.0-Pro-技术报告精译.md)

> **核心定位**：本报告深度解构了 Google DeepMind 在该阶段发布的技术细节与架构思想。作为闭源模型，其技术报告是窥探其内部机制的唯一窗口。

**材料类型（2026-08）**：**产品 + 开发者博文**。文件夹名沿用空壳「3.0 Flash」；官方产品名是 **Gemini 3 Flash**（2025-**12-17**），比 3 Pro 晚约一个月。不要为 3.5/3.6/3.7 Flash mkdir。

事实源：

- [Gemini 3 Flash: frontier intelligence built for speed](https://blog.google/products-and-platforms/products/gemini/gemini-3-flash/)
- [Build with Gemini 3 Flash](https://blog.google/innovation-and-ai/technology/developers-tools/build-with-gemini-3-flash/)

## 1. 产品

3 Pro 级推理 + Flash 延迟/成本。Gemini app **默认模型**（替 2.5 Flash）；AI Mode in Search 全球默认。开发者：API / AI Studio / CLI / Antigravity / Vertex preview。自称 API 上 3 系列上线后处理 **超过 1T tokens/天**（是 3 全家流量叙事，不是 Flash 单卡规格）。

价：**$0.50 / $3 per 1M** in/out；音频输入仍 **$1/1M**。开发者博文：不到 3 Pro 的 **1/4** 价、更高 rate limit；context caching 达阈值可 **90%** 降本；Batch **50%**。最高 thinking level 仍可调节想多久；日常流量平均比 2.5 Pro **少 30% token**。相对 2.5 Pro：**3× 更快**（Artificial Analysis）。最低 thinking 也常好过旧版 high thinking。

## 2. 数字

| | Gemini 3 Flash |
|--|----------------|
| GPQA Diamond | **90.4%** |
| HLE 无工具 | **33.7%** |
| MMMU Pro | **81.2%**（称与 3 Pro 可比） |
| SWE-bench Verified | **78%**（**超过** 2.5 系 **和 3 Pro**） |

LMArena Elo 只在 Pareto 图里，**正文没写整数**，不估。没有层数。

视觉：开发者博文写可用 code execution 对视觉输入 zoom / count / edit。多轮推理要在 API 里循环 thoughts 或用 Interactions API。

## 3. 失效条件

- 与 3 Pro 写成 11-18 同发。
- 把 3.7 Flash（2026-08）的 DeepSWE 倒灌进本目录。
- 空壳「端到端语音」——12-17 博文没有 Live API 专章。

## 本篇来源

- https://blog.google/products-and-platforms/products/gemini/gemini-3-flash/
- https://blog.google/innovation-and-ai/technology/developers-tools/build-with-gemini-3-flash/
