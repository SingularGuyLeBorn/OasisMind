---
title: "Mistral Large 2"
category: "模型家族与选型"
tags: ["mistral", "模型版本", "证据分级"]
published: true
as_of: "2026-09-01"
excerpt: "Mistral Large 2 的 123B dense、128K 与许可边界。"
---

# Mistral Large 2

> 核验日期：2026-09-01。本文只写可回到一手材料的事实；服务规格、价格与可用区以使用当天的官方文档为准。

## 结论卡

| 字段 | 结论 |
|---|---|
| 官方名称 | Mistral Large 2 / mistral-large-2407 |
| 发布日期 | 2024-07-24 |
| 获取方式 | 开放权重（Mistral Research License）；商用另行许可 |
| 证据级别 | 官方发布页 |

## 发布与证据

Mistral Large 2 是 123B 参数的开放权重旗舰快照，不能与初代 Large 或 Large 3 共用参数表。

## 相对上代变化

相对初代首次公开 123B 参数规模与 128K 上下文，并提供研究许可下的权重。

## 已披露的技术事实

- 官方发布页明确 123B 参数、128K context。
- 该版本是 dense 模型；Large 3 的 MoE 结构不能回写。

## 未披露与不应推断

- 完整训练数据与训练基础设施未披露。
- 商用许可不能由“开放权重”自动推出。

## 评测协议

- 官方页面列出的 MMLU、代码、数学结果需保留任务/设置。
- 部署复现记录精度、张量并行、上下文和 prompt。

## 适用边界

- 适合大型开放权重研究；资源需求很高。
- 先确认 Mistral Research License 和商用许可。

## 证据与版本边界

本页按官方身份与一手证据维护唯一正本。产品名、API 型号、底层 checkpoint 与版本日期只有在官方明确映射时才视为同一对象；报告摘录、自动提取文本和未逐项核证的历史解读不构成独立证据。

## 一手来源

- [Mistral Large 2 官方发布](https://mistral.ai/news/mistral-large-2407/)

[← 返回 Mistral 家族](../mistral.md)
