---
title: "Codestral 产品线"
category: "模型家族与选型"
tags: ["mistral", "模型版本", "证据分级"]
published: true
as_of: "2026-09-01"
excerpt: "Codestral 代码/FIM 产品线的 2024 权重许可与后续 API 快照边界。"
---

# Codestral 产品线

> 核验日期：2026-09-01。本文把发布、权重、产品入口和 API 别名分开；价格、区域、限流和别名均以调用当日文档为准。

## 结论卡

| 字段 | 结论 |
|---|---|
| 官方名称 | Codestral（2405、2501、2508 等日期快照） |
| 证据日期 | 2024-05-29 首发；2025-08 有官方更新 |
| 开放状态 | 2405 开放权重但仅 Mistral AI Non-Production License；后续版本/API 另核 |
| 输入/输出模态 | 代码/文本输入与输出，支持 FIM |
| 上下文 | 2405 为 32K；后续快照不得沿用，逐型号查 docs |
| 许可与部署边界 | 2405 非生产许可；商业/后续版本按具体模型卡或服务条款 |
| 证据级别 | 官方发布页、官方模型文档、官方仓库或技术报告 |

## 发布与证据

Codestral 是代码与 fill-in-the-middle 产品线，不是一份永久不变的 checkpoint。身份页保留关键日期快照，API 别名不伪装成新家族编号。

## 相对上代变化

2501/2508 是后续代码模型服务更新；不能把 2405 的 22B、32K 和非生产许可自动复制过去。

## 已披露的技术事实

- 2405：22B、80+ 编程语言、32K、FIM、Non-Production License。
- 后续官方更新将其放入企业编码栈。

## 未披露与不应推断

- rolling alias 当前指向、后续参数与许可须实时查模型文档。

## 评测协议

固定完整 snapshot ID、FIM/chat 路由、repo 上下文、工具/IDE harness 与 pass@k。

## 适用边界

适合代码补全/生成研究和企业 API；2405 权重不能按 Apache 2.0 做生产商用。

## 证据与版本边界

本页按官方身份与一手证据维护唯一正本。产品名、API 型号、底层 checkpoint 与版本日期只有在官方明确映射时才视为同一对象；报告摘录、自动提取文本和未逐项核证的历史解读不构成独立证据。

## 一手来源

- [Codestral 2405 官方发布](https://mistral.ai/news/codestral/)
- [Codestral 25.08 官方发布](https://mistral.ai/news/codestral-25-08/)
- [Mistral 当前模型总览](https://docs.mistral.ai/models)

[← 返回 Mistral 家族](../mistral.md)
