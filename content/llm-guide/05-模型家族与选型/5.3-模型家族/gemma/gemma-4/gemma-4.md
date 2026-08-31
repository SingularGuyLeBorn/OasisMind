---
title: "Gemma 4"
category: "模型家族与选型"
tags: ["gemma", "模型版本", "证据"]
published: true
as_of: "2026-09-01"
excerpt: "Gemma 4 Dense/MoE、多模态、thinking 与 Apache 2.0 边界。"
---

# Gemma 4

> 核验日期：2026-09-01。参数、上下文和许可只对应下列官方身份；不同尺寸、Base/Instruct 或滚动服务别名不得自动互换。

## 结论卡

| 字段 | 结论 |
|---|---|
| 官方身份 | E2B、E4B、12B、26B A4B、31B |
| 证据日期 | 2026-07 技术报告与模型卡 |
| 架构 | Dense 与 MoE；局部/全局混合注意力 |
| 上下文 | 小型 128K、中型 256K（按具体 SKU） |
| 许可 | 官方模型卡标 Apache 2.0 |

## 定位与相对变化

Gemma 4 引入 Dense/MoE 多档、可配置 thinking、system role 与更广模态；旧稿把它写成 2025 年且只有“端侧迭代”，已由正式报告纠正。

## 已披露事实

- 所有列出 SKU 支持文本与图像；E2B/E4B/12B 另支持音频。
- 官方模型卡列出 E2B/E4B/12B/26B-A4B/31B，并区分有效参数口径。

## 未披露与证据边界

- 模型卡同时说 video/audio 能力，但各 SKU 支持表不同，部署按表而非宣传总括。
- 厂商 agent/coding 结论仍需固定工具 harness 复测。

## 部署与选型

端侧优先 E2B/E4B，工作站/服务器再看 12B/26B-A4B/31B；MoE 总参数、激活参数和权重内存分别估算。

评测数字只有在模型快照、提示模板、采样、工具链、数据版本和计分器一致时才可横向比较；本页不转抄厂商榜单制造永久排名。

## 迁移说明

本页是该身份在公开知识树中的唯一首页。旧第 14 章报告翻译、MinerU 提取物和原图进入 _sources/model-reports/gemma/；未逐项核证的架构解读与重复索引进入 _archive/model-knowledge/gemma/。

## 一手来源

- [Gemma 4 模型卡](https://ai.google.dev/gemma/docs/core/model_card_4)
- [Gemma 4 技术报告](https://arxiv.org/abs/2607.02770)

[← 返回 Gemma 家族](../gemma.md)
