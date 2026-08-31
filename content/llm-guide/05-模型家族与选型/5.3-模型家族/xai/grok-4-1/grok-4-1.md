---
title: "Grok 4.1"
category: "模型家族与选型"
tags: ["xai", "模型版本", "证据分级"]
published: true
as_of: "2026-09-01"
excerpt: "Grok 4.1 的产品模式、后训练披露与幻觉评测方法。"
---

# Grok 4.1

> 核验日期：2026-09-01。本文只写可回到一手材料的事实；服务规格、价格与可用区以使用当天的官方文档为准。

## 结论卡

| 字段 | 结论 |
|---|---|
| 官方名称 | Grok 4.1（reasoning / non-reasoning product modes） |
| 发布日期 | 2025-11-17 |
| 获取方式 | 闭源产品；API 另有 Grok 4.1 Fast |
| 证据级别 | xAI 官方发布页 + model card |

## 发布与证据

Grok 4.1 官方发布区分 thinking 与 non-thinking 产品模式；它们不等于“同一权重已被官方确认”。

## 相对上代变化

相对 4 重点优化创作、情绪/协作交互、意图理解和事实性。

## 已披露的技术事实

- 官方称沿用 Grok 4 的大规模 RL 基础设施，并用 frontier agentic reasoning models 作为 reward models 优化不可验证偏好。
- 发布页给出 2025-11-01 至 11-14 的 silent rollout 与在线盲测。
- 官方定义 hallucination rate 与 FActScore 的评测方法。

## 未披露与不应推断

- 是否统一权重、内部模式切换、参数、MoE、2M 窗口实现未在 4.1 主发布页披露。
- 旧稿的“长时界 RL”与精确架构若只有第三方论文类比，不能保留。

## 评测协议

- 在线偏好 64.78% 只针对发布页描述的流量样本与对照。
- LMArena、内部 hallucination sample 与 FActScore 三类证据分开。

## 适用边界

- 适合对话产品与事实性研究；API 的 4.1 Fast 是另一型号。
- 价格和窗口仅在调用当天 docs 中核验。

## 迁移说明

本页是该身份在公开知识树中的唯一首页。旧第 05/14 章材料已按证据拆入 `_sources` 或 `_archive`；以下只记录其可核验的独有信息，不保留平行教程。
- `5-主流模型全解/5.3-国外大模型/xAI-Grok/04-Grok-4.1-统一权重双模式与长时界强化学习训练.md`
- `14-主流开源模型全景解析与技术报告精读/14.15-xAI/08-Grok-4.1/*`

## 一手来源

- [Grok 4.1 官方发布](https://x.ai/news/grok-4-1)
- [Grok 4.1 Model Card](https://data.x.ai/2025-11-17-grok-4-1-model-card.pdf)

[← 返回 xAI / Grok 家族](../xai.md)
