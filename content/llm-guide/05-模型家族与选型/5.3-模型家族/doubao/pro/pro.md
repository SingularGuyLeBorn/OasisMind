---
title: "Doubao Pro"
category: "模型家族与选型"
tags: ["doubao", "模型版本", "证据分级"]
published: true
as_of: "2026-09-01"
excerpt: "Doubao Pro 的产品演进、稀疏 MoE 官方披露与评测限制。"
---

# Doubao Pro

> 核验日期：2026-09-01。本文只写可回到一手材料的事实；服务规格、价格与可用区以使用当天的官方文档为准。

## 结论卡

| 字段 | 结论 |
|---|---|
| 官方名称 | 豆包通用模型 pro / Doubao-1.5-pro |
| 发布日期 | 2024-05-15（产品线）；Doubao 1.5 于 2025-01 发布 |
| 获取方式 | 火山方舟 API，闭源服务 |
| 证据级别 | 火山引擎官方发布页 + 官方技术专题 |

## 发布与证据

Pro 是豆包通用模型的专业档位；本页按日期区分 2024 产品线与 Doubao-1.5-pro，不把连续服务名误当固定权重。

## 相对上代变化

1.5 官方材料披露大规模稀疏 MoE、训练—推理一体设计，以及相对上一快照的能力更新。

## 已披露的技术事实

- 官方将“7 倍”表述为较小激活参数达到等效 7 倍激活参数 Dense 模型的性能，是对照关系，不是总参数/激活参数账本。
- 官方提到量化、prefill/decode 分离与通信计算重叠用于服务效率；没有公开完整实现配置。
- 1.5 产品矩阵还包括 vision、realtime voice 等独立服务，不能全部归为同一 Pro 权重。

## 未披露与不应推断

- 总参数、专家数、Top-k、每层结构、训练 token 与数据配比未披露。
- 旧稿中的“字节生态私有数据比例”“原生统一所有模态”等扩展论断没有一手依据。

## 评测协议

- 官方公开 MMLU-Pro、GPQA、McEval、FullStackBench、DROP、CMMLU、C-Eval 等结果；必须标注是厂商评测。
- 跨 API 比较需固定版本 ID、日期、prompt、reasoning 设置和采样参数。

## 适用边界

- 适合复杂通用 API 任务；不能由 MoE 宣传语推导内部参数表。
- 价格、窗口和模型 ID 会更新，本页仅记录发布事实。

## 迁移说明

本页是该身份在公开知识树中的唯一首页。旧第 05/14 章材料已按证据拆入 `_sources` 或 `_archive`；以下只记录其可核验的独有信息，不保留平行教程。
- `5-主流模型全解/5.2-国内大模型/Doubao-豆包/05-Doubao-Pro-7倍杠杆MoE与多模态原生统一.md`
- `14-主流开源模型全景解析与技术报告精读/14.17-Doubao/02-Doubao-Pro/*`

## 一手来源

- [2024 豆包大模型家族正式发布](https://developer.volcengine.com/articles/7369628105754804261)
- [豆包大模型 1.5 官方发布](https://developer.volcengine.com/articles/7462939272262189083)
- [Doubao 1.5 Pro 官方技术专题](https://team.doubao.com/zh/special/doubao_1_5_pro)

[← 返回 Doubao 家族](../doubao.md)
