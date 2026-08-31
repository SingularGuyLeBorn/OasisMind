---
title: "Pixtral 12B"
category: "模型家族与选型"
tags: ["mistral", "模型版本", "证据分级"]
published: true
as_of: "2026-09-01"
excerpt: "Pixtral 12B 的 12B+视觉编码器、128K 与 Apache 2.0。"
---

# Pixtral 12B

> 核验日期：2026-09-01。本文把发布、权重、产品入口和 API 别名分开；价格、区域、限流和别名均以调用当日文档为准。

## 结论卡

| 字段 | 结论 |
|---|---|
| 官方名称 | Pixtral 12B |
| 证据日期 | 2024-09-17（官方发布） |
| 开放状态 | 开放权重，Apache 2.0；历史型号 |
| 输入/输出模态 | 文本、单/多图像输入；文本输出 |
| 上下文 | 128K tokens |
| 许可与部署边界 | Apache 2.0；当前 API 生命周期查 docs |
| 证据级别 | 官方发布页、官方模型文档、官方仓库或技术报告 |

## 发布与证据

Pixtral 12B 是 Mistral 首个开放多模态模型，12B 文本 decoder 配 400M 视觉 encoder。

## 相对上代变化

相对纯文本 NeMo/Ministral，加入可变分辨率、多图理解与文档任务。

## 已披露的技术事实

- 12B decoder + 400M visual encoder、128K、Apache 2.0。

## 未披露与不应推断

- 图像 token 成本和不同分辨率吞吐需实测；历史 API 可能退役。

## 评测协议

记录图像数量、分辨率、128K 文本/视觉预算、后端与 prompt。

## 适用边界

适合复现早期开放视觉模型；新项目比较 Small 4/Medium 3.5。

## 迁移说明

本页是该身份在公开知识树中的唯一首页。产品名、API 型号与底层 checkpoint 只有在官方明确映射时才视为同一对象；旧第 05/14 章材料不再作为平行正文。

## 一手来源

- [Pixtral 12B 官方发布](https://mistral.ai/news/pixtral-12b/)

[← 返回 Mistral 家族](../mistral.md)
