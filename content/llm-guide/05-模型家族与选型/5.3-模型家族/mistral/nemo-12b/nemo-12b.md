---
title: "Mistral NeMo 12B"
category: "模型家族与选型"
tags: ["mistral", "模型版本", "证据分级"]
published: true
as_of: "2026-09-01"
excerpt: "Mistral NeMo 12B 的 128K、Tekken tokenizer 与 Apache 2.0。"
---

# Mistral NeMo 12B

> 核验日期：2026-09-01。本文把发布、权重、产品入口和 API 别名分开；价格、区域、限流和别名均以调用当日文档为准。

## 结论卡

| 字段 | 结论 |
|---|---|
| 官方名称 | Mistral NeMo 12B；API 快照 `open-mistral-nemo-2407` |
| 证据日期 | 2024-07-18（官方发布） |
| 开放状态 | Base/Instruct 开放权重，Apache 2.0 |
| 输入/输出模态 | 文本输入、文本输出 |
| 上下文 | 128K tokens |
| 许可与部署边界 | Apache 2.0，可自部署 |
| 证据级别 | 官方发布页、官方模型文档、官方仓库或技术报告 |

## 发布与证据

Mistral NeMo 是 Mistral 与 NVIDIA 合作发布的 12B 多语文本模型。NeMo 是该 checkpoint 身份，不要与后来的 Ministral 3 系列混写。

## 相对上代变化

相对 Mistral 7B，规模、上下文、多语、函数调用与 tokenizer 均升级；官方称可作为标准架构的替代。

## 已披露的技术事实

- 12B、128K、Tekken tokenizer、量化感知训练与 FP8 推理说明。
- Base/Instruct 权重均发布。

## 未披露与不应推断

- 训练数据全量和不同 serving 栈的 128K 质量曲线未公开。

## 评测协议

保留 Base/Instruct、语言、上下文位置、FP8/BF16 与 judge；tokenizer 压缩率不要直接当任务准确率。

## 适用边界

适合中等规模多语自部署；128K 的延迟和内存需实测。

## 迁移说明

本页是该身份在公开知识树中的唯一首页。产品名、API 型号与底层 checkpoint 只有在官方明确映射时才视为同一对象；旧第 05/14 章材料不再作为平行正文。

## 一手来源

- [Mistral NeMo 官方发布](https://mistral.ai/news/mistral-nemo/)

[← 返回 Mistral 家族](../mistral.md)
