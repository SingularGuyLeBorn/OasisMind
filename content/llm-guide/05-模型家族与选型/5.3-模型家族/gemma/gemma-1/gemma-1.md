---
title: "Gemma"
category: "模型家族与选型"
tags: ["gemma", "模型版本", "证据"]
published: true
as_of: "2026-09-01"
excerpt: "初代 Gemma 文本模型的开放权重、模态和许可边界。"
---

# Gemma

> 核验日期：2026-09-01。参数、上下文和许可只对应下列官方身份；不同尺寸、Base/Instruct 或滚动服务别名不得自动互换。

## 结论卡

| 字段 | 结论 |
|---|---|
| 官方身份 | Gemma 2B/7B，Pretrained 与 Instruction-tuned |
| 证据日期 | 2024 年模型卡/报告 |
| 模态 | 英语文本输入与文本输出 |
| 训练数据口径 | 模型卡称 6T tokens |
| 许可 | Gemma Terms；不是 Apache 2.0 |

## 定位与相对变化

初代 Gemma 是轻量 decoder-only 文本线，提供开放权重和预训练/指令版本，为后续 Gemma 2–4 奠定产品与工具链基础。

## 已披露事实

- 官方模型卡明确 text-to-text、英语和本地/云端部署场景。
- 训练硬件披露 TPUv5e；该事实不等于社区推理必须用 TPU。

## 未披露与证据边界

- MQA 属于通用注意力机制知识，不能作为 Gemma 1 身份的独立证据。
- 模型卡的公开网页许可与模型权重条款不是同一件事。

## 部署与选型

适合小尺寸文本生成和既有 Gemma 工具链；上线前接受并复核对应 Gemma Terms、量化格式与安全策略。

评测数字只有在模型快照、提示模板、采样、工具链、数据版本和计分器一致时才可横向比较；本页不转抄厂商榜单制造永久排名。

## 证据与版本边界

本页按官方身份与一手证据维护唯一正本。产品名、API 型号、底层 checkpoint 与版本日期只有在官方明确映射时才视为同一对象；报告摘录、自动提取文本和未逐项核证的历史解读不构成独立证据。

## 一手来源

- [Gemma 模型卡](https://ai.google.dev/gemma/docs/core/model_card)
- [Gemma 技术报告](https://arxiv.org/abs/2403.08295)

[← 返回 Gemma 家族](../gemma.md)
