---
title: "Mistral Small 4"
category: "模型家族与选型"
tags: ["mistral", "模型版本", "证据分级"]
published: true
as_of: "2026-09-01"
excerpt: "Mistral Small 4 的 119B/6.5B、256K 与统一 reasoning/coding/multimodal。"
---

# Mistral Small 4

> 核验日期：2026-09-01。本文把发布、权重、产品入口和 API 别名分开；价格、区域、限流和别名均以调用当日文档为准。

## 结论卡

| 字段 | 结论 |
|---|---|
| 官方名称 | Mistral Small 4；API `mistral-small-2603` / rolling alias |
| 证据日期 | 2026-03-16（官方发布） |
| 开放状态 | 开放权重，Apache 2.0；亦有 API |
| 输入/输出模态 | 文本、图像输入；文本输出 |
| 上下文 | 256K tokens |
| 许可与部署边界 | Apache 2.0；官方建议硬件显示自部署仍需多卡高端 GPU |
| 证据级别 | 官方发布页、官方模型文档、官方仓库或技术报告 |

## 发布与证据

Small 4 将 instruct、reasoning、agentic coding 与多模态能力合并为一个可配置 reasoning 模型。

## 相对上代变化

官方明确吸收 Magistral、Pixtral 与 Devstral 的能力，成为这些专用历史线的主要通用替代。

## 已披露的技术事实

- 119B 总参数、6.5B active（官方 docs 口径），128 experts、每 token 4 active。
- 256K、可配置 reasoning、文本/图像输入；Apache 2.0。

## 未披露与不应推断

- 训练数据全量、所有量化档质量和不同推理后端的等价性未公开。

## 评测协议

固定 `reasoning_effort`、后端、量化、上下文与工具；与旧专用模型比较时使用同一 harness。

## 适用边界

当前开放 generalist 主线；权重虽开放，但官方最小/推荐硬件显示它并非普通消费卡模型。

## 迁移说明

本页是该身份在公开知识树中的唯一首页。产品名、API 型号与底层 checkpoint 只有在官方明确映射时才视为同一对象；旧第 05/14 章材料不再作为平行正文。

## 一手来源

- [Mistral Small 4 官方发布](https://mistral.ai/news/mistral-small-4/)
- [Mistral Small 4 官方文档](https://docs.mistral.ai/models/mistral-small-4-0-26-03)

[← 返回 Mistral 家族](../mistral.md)
