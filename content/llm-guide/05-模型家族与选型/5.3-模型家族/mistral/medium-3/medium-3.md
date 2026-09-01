---
title: "Mistral Medium 3"
category: "模型家族与选型"
tags: ["mistral", "模型版本", "证据分级"]
published: true
as_of: "2026-09-01"
excerpt: "Mistral Medium 3 的闭源多模态 API、128K 与退役状态。"
---

# Mistral Medium 3

> 核验日期：2026-09-01。本文把发布、权重、产品入口和 API 别名分开；价格、区域、限流和别名均以调用当日文档为准。

## 结论卡

| 字段 | 结论 |
|---|---|
| 官方名称 | Mistral Medium 3；`mistral-medium-2505` |
| 证据日期 | 2025-05-07（官方发布/模型文档） |
| 开放状态 | Premier 闭源服务；已退役并由 Medium 3.5 替代 |
| 输入/输出模态 | 文本、图像输入；文本输出 |
| 上下文 | 128K tokens |
| 许可与部署边界 | API/企业部署条款；无通用开放权重许可 |
| 证据级别 | 官方发布页、官方模型文档、官方仓库或技术报告 |

## 发布与证据

Medium 3 是 2025 年的企业多模态 generalist 服务。当前官方文档将其标记 deprecated。

## 相对上代变化

相对早期 Medium，强调多模态、工具与企业部署；后继 Medium 3.5 改为开放权重。

## 已披露的技术事实

- 128K、结构化输出、函数调用、文档问答、agents 等服务能力。
- 官方文档给出退役与替代关系。

## 未披露与不应推断

- 参数、内部架构和训练数据未公开，不能从 3.5 倒推。

## 评测协议

历史复现固定 2505 ID、日期与 API 行为；当前新项目不使用退役 alias。

## 适用边界

只适合维护历史集成；新项目迁移 Medium 3.5。

## 证据与版本边界

本页按官方身份与一手证据维护唯一正本。产品名、API 型号、底层 checkpoint 与版本日期只有在官方明确映射时才视为同一对象；报告摘录、自动提取文本和未逐项核证的历史解读不构成独立证据。

## 一手来源

- [Mistral Medium 3 官方文档](https://docs.mistral.ai/models/mistral-medium-3-25-05)
- [官方发布](https://mistral.ai/news/mistral-medium-3/)

[← 返回 Mistral 家族](../mistral.md)
