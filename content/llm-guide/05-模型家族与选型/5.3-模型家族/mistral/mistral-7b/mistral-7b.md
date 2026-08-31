---
title: "Mistral 7B"
category: "模型家族与选型"
tags: ["mistral", "模型版本", "证据分级"]
published: true
as_of: "2026-09-01"
excerpt: "Mistral 7B 的 GQA、SWA、8K 配置与部署边界。"
---

# Mistral 7B

> 核验日期：2026-09-01。本文只写可回到一手材料的事实；服务规格、价格与可用区以使用当天的官方文档为准。

## 结论卡

| 字段 | 结论 |
|---|---|
| 官方名称 | Mistral 7B v0.1 |
| 发布日期 | 2023-09-27（官方发布）；论文 2023-10-10 |
| 获取方式 | 开放权重，Apache 2.0 |
| 证据级别 | 原始论文 + 官方仓库/发布页 |

## 发布与证据

Mistral 7B 是 Mistral AI 的首个开放权重基础模型；公开版本页以论文 Table 1 与官方仓库为准。

## 相对上代变化

用 GQA 与 sliding-window attention 在 7B 规模控制 KV 缓存和注意力计算。

## 已披露的技术事实

- 论文 Table 1 给出 dim 4096、32 层、32 query heads、8 KV heads、window 4096、context 8192。
- rolling buffer 与 chunking 是实现层优化；32K 示例不能改写为原生 32K 模型窗口。
- 训练数据配方没有公开，不能用推测解释 benchmark。

## 未披露与不应推断

- 训练 token、数据混合、去重和完整训练超参未披露。
- GQA/SWA 的机制推导不在版本页重复，回第 02 章。

## 评测协议

- 优先使用论文 Table 2，并区分 commonsense、world knowledge、reading、math/code 与聚合分。
- “优于 Llama 2 13B”仅在论文指定任务与设置内成立。

## 适用边界

- 适合资源受限的开放基座研究和部署。
- 8K 配置、SWA 感受野与实际任务有效长度不是同一个概念。

## 迁移说明

本页是该身份在公开知识树中的唯一首页。旧第 05/14 章材料已按证据拆入 `_sources` 或 `_archive`；以下只记录其可核验的独有信息，不保留平行教程。
- `5-主流模型全解/5.3-国外大模型/Mistral-AI/05-Mistral-7B-GQA与SWA的效率革命.md`
- `14-主流开源模型全景解析与技术报告精读/14.14-Mistral/01-Mistral-7B/*`

## 一手来源

- [Mistral 7B 论文](https://arxiv.org/abs/2310.06825)
- [官方发布页](https://mistral.ai/news/announcing-mistral-7b/)
- [官方参考实现](https://github.com/mistralai/mistral-src)

[← 返回 Mistral 家族](../mistral.md)
