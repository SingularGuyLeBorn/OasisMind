---
title: "Mistral Large 3"
category: "模型家族与选型"
tags: ["mistral", "模型版本", "证据分级"]
published: true
as_of: "2026-09-01"
excerpt: "Mistral Large 3 的 675B/41B MoE 账本、256K 与开放许可。"
---

# Mistral Large 3

> 核验日期：2026-09-01。本文只写可回到一手材料的事实；服务规格、价格与可用区以使用当天的官方文档为准。

## 结论卡

| 字段 | 结论 |
|---|---|
| 官方名称 | Mistral Large 3 |
| 发布日期 | 2025-12-02 |
| 获取方式 | 开放权重，Apache 2.0 |
| 证据级别 | 官方发布页 + 官方模型文档 |

## 发布与证据

Large 3 是新的 sparse MoE 开放权重模型，不是 Large 2 的服务别名。

## 相对上代变化

从 Large 2 的 123B dense 转向 675B 总参数、41B 激活的 sparse MoE，并扩大上下文到 256K。

## 已披露的技术事实

- 官方发布页给出 675B 总参数、41B 激活参数。
- 官方称使用 3000 张 H200 训练并以 Apache 2.0 发布。
- 模型文档给出 256K context；服务规格以 as_of 日期核验。

## 未披露与不应推断

- 专家数、Top-k、训练数据明细和所有训练超参未在摘要页完整披露。
- 不能将营销比较当独立复现。

## 评测协议

- 使用官方表时保留具体 checkpoint 和 benchmark 方法。
- 长上下文另测检索、位置鲁棒性与成本，不用标称窗口代替。

## 适用边界

- 适合研究超大开放 MoE；部署需要高容量权重存储与专家并行。
- 41B 激活不等于只需加载 41B 权重。

## 迁移说明

本页是该身份在公开知识树中的唯一首页。旧第 05/14 章材料已按证据拆入 `_sources` 或 `_archive`；以下只记录其可核验的独有信息，不保留平行教程。
- `5-主流模型全解/5.3-国外大模型/Mistral-AI/05-Mistral-Large-企业级MoE架构与多语言长上下文优化.md`
- `14-主流开源模型全景解析与技术报告精读/14.14-Mistral/03-Mistral-Large/*`

## 一手来源

- [Mistral 3 官方发布](https://mistral.ai/news/mistral-3/)
- [Mistral Large 3 模型文档](https://docs.mistral.ai/models/mistral-large-3-25-12)

[← 返回 Mistral 家族](../mistral.md)
