---
title: "Tencent Hy4 Preview"
category: "模型家族与选型"
tags: ["hunyuan", "模型版本", "证据分级"]
published: true
as_of: "2026-09-01"
excerpt: "Tencent Hy4 Preview 的 770B/49B、1M 上下文与 Apache 2.0 边界。"
---

# Tencent Hy4 Preview

> 核验日期：2026-09-01。本文把发布、权重、产品入口和 API 别名分开；价格、区域、限流和别名均以调用当日文档为准。

## 结论卡

| 字段 | 结论 |
|---|---|
| 官方名称 | Tencent Hy4 preview |
| 证据日期 | 2026-08-28（腾讯官方发布） |
| 开放状态 | 开放权重与代码，Apache 2.0；同时有产品/API 入口 |
| 输入/输出模态 | 文本输入、文本输出 |
| 上下文 | 超过 1M tokens（官方发布）；仓库配置以实际 checkpoint 为准 |
| 许可与部署边界 | Apache 2.0；770B 规模意味着实际部署仍有显著基础设施门槛 |
| 证据级别 | 官方发布页、官方模型文档、官方仓库或技术报告 |

## 发布与证据

腾讯于 2026-08-28 发布并开源 Hy4 preview，定位编码、办公和科学研究等生产力任务。它属于 Hy 语言模型线，独立于 Hunyuan3D。

## 相对上代变化

相对 Hy3，官方披露规模增至 770B 总/49B 激活并把上下文推进到 1M+；Preview 标签意味着未来配置和服务行为可能变更。

## 已披露的技术事实

- 770B 总参数、49B 激活参数、78 层。
- 官方仓库披露 Gated DSA、IndexCache、iHC、256 routed + 1 shared experts（top-8）与原生 MTP 层。
- 产品入口包含腾讯产品与 API 渠道。

## 未披露与不应推断

- Preview 后续正式版身份、训练数据全量清单、所有服务别名与价格不是稳定模型事实。
- 不将产品免费期写进永久规格。

## 评测协议

长上下文评测需记录有效输入长度、检索位置、KV/IndexCache 配置、并行与量化；生产力 benchmark 要保留工具和 agent harness。

## 适用边界

适合具备超大规模集群资源的开放权重研究/部署或经 API 使用；1M+ 窗口不等于单机可经济运行。

## 证据与版本边界

本页按官方身份与一手证据维护唯一正本。产品名、API 型号、底层 checkpoint 与版本日期只有在官方明确映射时才视为同一对象；报告摘录、自动提取文本和未逐项核证的历史解读不构成独立证据。

## 一手来源

- [腾讯官方发布](https://www.tencent.com/tencent-releases-and-open-sources-tencent-hy4-preview/)
- [Tencent Hy4 Preview 官方仓库](https://github.com/Tencent-Hunyuan/Hy4-preview)

[← 返回 Hunyuan / Tencent Hy 家族](../hunyuan.md)
