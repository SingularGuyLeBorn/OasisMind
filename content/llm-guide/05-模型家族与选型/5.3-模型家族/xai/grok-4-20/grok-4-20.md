---
title: "Grok 4.20"
category: "模型家族与选型"
tags: ["xai", "模型版本", "证据分级"]
published: true
as_of: "2026-09-01"
excerpt: "Grok 4.20 的模式、1M 窗口与系统卡证据边界。"
---

# Grok 4.20

> 核验日期：2026-09-01。本文只写可回到一手材料的事实；服务规格、价格与可用区以使用当天的官方文档为准。

## 结论卡

| 字段 | 结论 |
|---|---|
| 官方名称 | Grok 4.20（single-agent / multi-agent modes） |
| 发布日期 | 2026-04-07（system card；API 型号含 0309 快照） |
| 获取方式 | 闭源产品/API |
| 证据级别 | xAI System Card + 官方模型文档 |

## 发布与证据

Grok 4.20 是官方存在的产品/API 系列；旧稿的多智能体描述只能保留与官方 docs/system card 一致的部分。

## 相对上代变化

相对 4.1 加入官方评估的 advanced reasoning 和 multi-agent 能力，并形成 reasoning、non-reasoning、multi-agent API 型号。

## 已披露的技术事实

- system card 说明 single-agent 与 multi-agent 模式，并评估恶意使用、失控、CBRN、网络安全和操纵风险。
- 官方 docs 给出 1M context、reasoning/non-reasoning 与 multi-agent 型号。
- multi-agent docs 的可证事实是多个 agents 并行协作完成 deep research；未披露辩论拓扑。

## 未披露与不应推断

- 精确 agent 协议、数量、仲裁、训练机制、参数和 MoE/MLA 均未披露。
- 旧稿引用外部多智能体论文推导“四代理辩论”和低幻觉内部实现的段落不保留。

## 评测协议

- 系统卡安全评测与 API 能力 benchmark 分开。
- 比较单/多 agent 时控制工具、token、调用成本与并行预算。

## 适用边界

- 适合 deep research/agent API；多 agent 会改变延迟和成本。
- 价格和可用区以当前 docs 为准。

## 迁移说明

本页是该身份在公开知识树中的唯一首页。旧第 05/14 章材料已按证据拆入 `_sources` 或 `_archive`；以下只记录其可核验的独有信息，不保留平行教程。
- `5-主流模型全解/5.3-国外大模型/xAI-Grok/03-Grok-4.20-多智能体辩论架构与低幻觉系统设计.md`
- `14-主流开源模型全景解析与技术报告精读/14.15-xAI/09-Grok-4.20/*`

## 一手来源

- [Grok 4.20 System Card](https://data.x.ai/2026-04-07-grok-4-20-model-card.pdf)
- [Grok 4.20 Reasoning 文档](https://docs.x.ai/developers/models/grok-4.20-reasoning)
- [Grok 4.20 Multi-Agent 文档](https://docs.x.ai/developers/models/grok-4.20-multi-agent-0309)

[← 返回 xAI / Grok 家族](../xai.md)
