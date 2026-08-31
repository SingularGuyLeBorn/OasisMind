---
title: "Devstral 产品线"
category: "模型家族与选型"
tags: ["mistral", "模型版本", "证据分级"]
published: true
as_of: "2026-09-01"
excerpt: "Devstral agentic coding 线的 Small/Medium 许可差异与生命周期。"
---

# Devstral 产品线

> 核验日期：2026-09-01。本文把发布、权重、产品入口和 API 别名分开；价格、区域、限流和别名均以调用当日文档为准。

## 结论卡

| 字段 | 结论 |
|---|---|
| 官方名称 | Devstral Small / Devstral Medium（含 2507 快照） |
| 证据日期 | 2025-05-21 首发；2025-07-10 官方更新 |
| 开放状态 | Small 1.1 24B 开放权重 Apache 2.0；Medium 为 API/企业部署 |
| 输入/输出模态 | 文本/代码输入与输出，面向代码 agent |
| 上下文 | 逐 snapshot 查官方模型卡；本页不跨版本固化 |
| 许可与部署边界 | Small 与 Medium 不同；Small 1.1 Apache 2.0，Medium 按服务/企业条款 |
| 证据级别 | 官方发布页、官方模型文档、官方仓库或技术报告 |

## 发布与证据

Devstral 是与 All Hands AI 合作的 agentic coding 线，包含开放 Small 与闭源/企业 Medium，不应合成一个许可状态。

## 相对上代变化

2507 更新把 Small 升至 1.1 并新增 Medium；后续能力逐步并入 Small 4/Medium 3.5。

## 已披露的技术事实

- Small 1.1：24B、Apache 2.0；官方 SWE-Bench Verified 报告使用特定 agent scaffold。
- Medium 通过 API/私有部署服务提供。

## 未披露与不应推断

- benchmark 高度依赖 OpenHands/工具环境，不能当裸模型代码能力。
- 当前替代/退役状态随 docs 更新。

## 评测协议

固定 Devstral 版本、agent scaffold、容器、工具、最大步数、测试补丁判据和 token 预算。

## 适用边界

适合 agentic software engineering；开放 Small 与企业 Medium 的成本/合规路径分开评估。

## 迁移说明

本页是该身份在公开知识树中的唯一首页。产品名、API 型号与底层 checkpoint 只有在官方明确映射时才视为同一对象；旧第 05/14 章材料不再作为平行正文。

## 一手来源

- [Devstral 2507 官方发布](https://mistral.ai/news/devstral-2507/)
- [Mistral 当前模型总览](https://docs.mistral.ai/models)

[← 返回 Mistral 家族](../mistral.md)
