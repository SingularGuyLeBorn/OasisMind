---
title: "Grok 4.3"
category: "模型家族与选型"
tags: ["xai", "模型版本", "证据分级"]
published: true
as_of: "2026-09-01"
excerpt: "Grok 4.3 的 1M 窗口、reasoning 档位、工具能力与未披露架构。"
---

# Grok 4.3

> 核验日期：2026-09-01。本文只写可回到一手材料的事实；服务规格、价格与可用区以使用当天的官方文档为准。

## 结论卡

| 字段 | 结论 |
|---|---|
| 官方名称 | grok-4.3 |
| 证据日期 | 2026-06-17（Amazon Bedrock GA；不是 Grok 4.3 首发日期） |
| 获取方式 | 闭源 API / 产品 |
| 证据级别 | xAI 官方公告 + 官方模型文档 |

## 发布与证据

Grok 4.3 是官方 API 型号；当前一手证据只足以确认它于 2026-06-17 在 Amazon Bedrock GA，不能把该日当作模型首发。“三重加速、MoE+MLA、实时数据融合架构”均没有官方证据。

## 相对上代变化

官方将其定位为快速、可靠、强工具调用与指令遵循的企业模型。

## 已披露的技术事实

- 官方 docs 给出 1M context，text/image 输入、text 输出。
- 支持 function calling、structured outputs 和 none/low/medium/high configurable reasoning。
- 2026-06-17 官方公告确认在 Amazon Bedrock GA。

## 未披露与不应推断

- 参数量、MoE、MLA、注意力、训练数据、加速引擎和实时数据融合内部实现未披露。
- 价格、区域与限流是易变服务信息，不写成永久知识。

## 评测协议

- 官方公告引用 Artificial Analysis、Tau2、Vals AI 等结果；必须沿原方法页核验。
- 工具调用评测记录 provider、region、reasoning effort、工具 schema 与预算。

## 适用边界

- 适合企业 agent/tool-calling API。
- 标称 1M 不等于所有任务在 1M 都稳定；需做长文档检索与成本测试。

## 证据与版本边界

本页按官方身份与一手证据维护唯一正本。产品名、API 型号、底层 checkpoint 与版本日期只有在官方明确映射时才视为同一对象；报告摘录、自动提取文本和未逐项核证的历史解读不构成独立证据。

## 一手来源

- [Grok 4.3 官方模型文档](https://docs.x.ai/developers/models/grok-4.3)
- [Grok on Amazon Bedrock 官方公告](https://x.ai/news/grok-amazon-bedrock)

[← 返回 xAI / Grok 家族](../xai.md)
