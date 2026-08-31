---
title: "Qwen3.6"
category: "模型家族与选型"
tags: ["qwen", "模型版本", "证据分级"]
published: true
as_of: "2026-09-01"
excerpt: "Qwen3.6 开放权重代码智能体线与服务型号边界。"
---

# Qwen3.6

> 核验日期：2026-09-01。本文只写可回到一手材料的事实；动态服务规格以使用当天官方文档为准。

## 结论卡

| 字段 | 结论 |
|---|---|
| 官方身份 | Qwen3.6 开放模型与托管服务线 |
| 首次公开证据 | 2026-04（官方发布页） |
| 获取方式 | 35B-A3B、27B 开放权重；Plus/Max-Preview 为托管服务 |
| 参数口径 | 开放权重包括 35B-A3B（35B 总参数/3B 激活）与 27B 稠密；Plus/Max-Preview 未公开可据以反推的权重参数 |
| 上下文 | 开放 27B/35B-A3B 卡为 262,144 原生、可扩展至 1,010,000；Plus 为 1M、Max-Preview 为 262,144，均按当前官方 SKU 文档核对 |
| 模态 | 开放 27B/35B-A3B 与 Plus：文本、图像、视频输入 → 文本输出；Max-Preview：文本输入 → 文本输出 |
| 许可 | 开放权重检查点采用 Apache 2.0；Plus/Max-Preview 受托管服务条款约束 |
| 证据级别 | 官方发布页 + 官方仓库 |

## 相对前序变化

在 Qwen3.5 架构基础上强化跨尺寸 agentic coding，并公开稀疏 35B-A3B 与稠密 27B。

## 已披露的技术事实

- 35B-A3B 是 MoE 型号，3B 是激活参数；27B 是稠密型号。
- 官方用法提供 preserve_thinking 等会话控制；这属于模板/服务接口的一部分。
- Qwen3.6-Max-Preview 官方明确为仍在迭代的专有预览，不是开放权重检查点。

## 未披露与不应推断

- 旧“架构剖析”包含未由完整技术报告逐项支持的推断，已归档。
- 跨 benchmark 的营销比较不能脱离代理框架、工具、预算和日期。

## 部署与选型边界

- 35B-A3B 适合有总权重内存但追求较低激活计算的部署；27B 便于稠密推理栈。
- 代码智能体必须在目标仓库、终端和测试环境内做端到端验收。

## 迁移说明

本页是该身份在公开知识树中的唯一首页。旧第 14 章路径 11-Qwen3.6/* 已按证据拆入 _sources/model-reports/qwen/ 或 _archive/model-knowledge/qwen/；报告快照和历史解读不再作为平行公开教程。

## 一手来源

- [Qwen3.6-35B-A3B 官方发布页](https://qwen.ai/blog?id=qwen3.6-35b-a3b)
- [Qwen3.6-27B 官方发布页](https://qwen.ai/blog?id=qwen3.6-27b)
- [Qwen3.6 官方仓库](https://github.com/QwenLM/Qwen3.6)

[← 返回 Qwen 家族](../qwen.md)
