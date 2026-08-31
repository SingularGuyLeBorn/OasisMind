---
title: "Mistral Small 3.1"
category: "模型家族与选型"
tags: ["mistral", "模型版本", "证据分级"]
published: true
as_of: "2026-09-01"
excerpt: "Mistral Small 3.1 的视觉、128K、Apache 2.0 与生命周期。"
---

# Mistral Small 3.1

> 核验日期：2026-09-01。本文把发布、权重、产品入口和 API 别名分开；价格、区域、限流和别名均以调用当日文档为准。

## 结论卡

| 字段 | 结论 |
|---|---|
| 官方名称 | Mistral Small 3.1 |
| 证据日期 | 2025-03-17（官方发布） |
| 开放状态 | 开放权重，Apache 2.0；历史 API 型号 |
| 输入/输出模态 | 文本、图像输入；文本输出 |
| 上下文 | 128K tokens |
| 许可与部署边界 | Apache 2.0；当前服务生命周期应查 docs |
| 证据级别 | 官方发布页、官方模型文档、官方仓库或技术报告 |

## 发布与证据

Small 3.1 为轻量多模态 generalist，补充视觉理解与长上下文。

## 相对上代变化

相对 Small 3，加入视觉输入并扩大上下文；截至 2026-09 已被 Small 4 取代为新项目首选。

## 已披露的技术事实

- 24B 级开放模型、128K、文本/图像输入。
- 官方提供 API 与本地部署路径。

## 未披露与不应推断

- `latest` 别名与退役日期会变化；不要把历史价格固定为模型属性。

## 评测协议

固定日期 checkpoint、视觉分辨率、128K 测试方法与 API/本地差异。

## 适用边界

适合维护历史部署；新项目比较 Small 4，避免锁定退役 API。

## 迁移说明

本页是该身份在公开知识树中的唯一首页。产品名、API 型号与底层 checkpoint 只有在官方明确映射时才视为同一对象；旧第 05/14 章材料不再作为平行正文。

## 一手来源

- [Mistral Small 3.1 官方发布](https://mistral.ai/news/mistral-small-3-1/)
- [Mistral 当前模型总览](https://docs.mistral.ai/models)

[← 返回 Mistral 家族](../mistral.md)
