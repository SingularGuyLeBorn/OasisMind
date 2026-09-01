---
title: "Magistral 产品线"
category: "模型家族与选型"
tags: ["mistral", "模型版本", "证据分级"]
published: true
as_of: "2026-09-01"
excerpt: "Magistral reasoning 线的 Small/Medium 双版本与后续替代边界。"
---

# Magistral 产品线

> 核验日期：2026-09-01。本文把发布、权重、产品入口和 API 别名分开；价格、区域、限流和别名均以调用当日文档为准。

## 结论卡

| 字段 | 结论 |
|---|---|
| 官方名称 | Magistral Small / Magistral Medium |
| 证据日期 | 2025-06-10（官方发布） |
| 开放状态 | Small 24B 开放权重；Medium 企业/API |
| 输入/输出模态 | 文本输入、文本输出，面向多步推理 |
| 上下文 | 逐版本查官方模型卡；不跨 Small/Medium 固化 |
| 许可与部署边界 | Small 按官方开放许可（发布资料/模型卡）；Medium 按服务条款；不能合并 |
| 证据级别 | 官方发布页、官方模型文档、官方仓库或技术报告 |

## 发布与证据

Magistral 是 Mistral 首个专用 reasoning 双版本产品线。后续 Mistral 把原生 reasoning 合并到 Small 4 等通用模型。

## 相对上代变化

相对通用 Small/Medium，Magistral 专注多步、多语 reasoning；它不是所有后继 Mistral 模型的基础 checkpoint 证明。

## 已披露的技术事实

- Small 24B 开放版本与更强的 Medium 企业版本。
- 官方论文/发布描述强化学习、可读 reasoning 与多语任务。

## 未披露与不应推断

- chain-of-thought 展示不等于可验证因果解释；Medium 参数与内部结构不公开。

## 评测协议

固定 Small/Medium、是否 majority voting、采样次数、语言、token 预算；pass@1 与 vote@64 不可并列误导。

## 适用边界

历史专用 reasoning 线；当前通用部署比较 Small 4/Medium 3.5，受监管任务不可把推理文本当审计证据。

## 证据与版本边界

本页按官方身份与一手证据维护唯一正本。产品名、API 型号、底层 checkpoint 与版本日期只有在官方明确映射时才视为同一对象；报告摘录、自动提取文本和未逐项核证的历史解读不构成独立证据。

## 一手来源

- [Magistral 官方发布](https://mistral.ai/news/magistral/)
- [Mistral 原生 reasoning 生命周期说明](https://docs.mistral.ai/resources/deprecated/native-reasoning)

[← 返回 Mistral 家族](../mistral.md)
