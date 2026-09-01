---
title: "Mistral Medium 3.5"
category: "模型家族与选型"
tags: ["mistral", "模型版本", "证据分级"]
published: true
as_of: "2026-09-01"
excerpt: "Mistral Medium 3.5 的 256K、多模态开放权重与 Modified MIT 边界。"
---

# Mistral Medium 3.5

> 核验日期：2026-09-01。本文把发布、权重、产品入口和 API 别名分开；价格、区域、限流和别名均以调用当日文档为准。

## 结论卡

| 字段 | 结论 |
|---|---|
| 官方名称 | Mistral Medium 3.5（v26.04） |
| 证据日期 | 2026-04-28（官方模型文档） |
| 开放状态 | 开放权重，Modified MIT；亦有 API |
| 输入/输出模态 | 文本、图像输入；文本输出 |
| 上下文 | 256K tokens |
| 许可与部署边界 | Modified MIT，不应简写成标准 MIT；部署前阅读附加条款 |
| 证据级别 | 官方发布页、官方模型文档、官方仓库或技术报告 |

## 发布与证据

Medium 3.5 是面向 agent 与编码的当前 frontier-class 多模态模型，也是官方给 Medium 3、Pixtral Large、部分 Devstral 等历史集成的替代方向。

## 相对上代变化

相对 Medium 3，上下文由 128K 到 256K，并从纯 Premier 服务转为 Modified MIT 开放权重。

## 已披露的技术事实

- 256K、多模态、结构化输出、函数调用、agents、文档问答。
- 官方 docs 同时列出权重与 API 能力。

## 未披露与不应推断

- 不能把 Modified MIT 当作无附加条件的标准 MIT；参数/架构只引用当前模型卡明确项。

## 评测协议

固定 v26.04、API/本地、reasoning/工具、视觉输入与上下文；不要用 rolling alias 做长期基准。

## 适用边界

截至 2026-09 的主要当前线之一；部署与再分发需核 Modified MIT 原文。

## 证据与版本边界

本页按官方身份与一手证据维护唯一正本。产品名、API 型号、底层 checkpoint 与版本日期只有在官方明确映射时才视为同一对象；报告摘录、自动提取文本和未逐项核证的历史解读不构成独立证据。

## 一手来源

- [Mistral Medium 3.5 官方文档](https://docs.mistral.ai/models/mistral-medium-3-5-26-04)
- [Mistral 当前模型总览](https://docs.mistral.ai/models)

[← 返回 Mistral 家族](../mistral.md)
