---
title: "Tencent Hy3"
category: "模型家族与选型"
tags: ["hunyuan", "模型版本", "证据分级"]
published: true
as_of: "2026-09-01"
excerpt: "Tencent Hy3 语言模型的开放权重、256K 上下文与部署边界。"
---

# Tencent Hy3

> 核验日期：2026-09-01。本文把发布、权重、产品入口和 API 别名分开；价格、区域、限流和别名均以调用当日文档为准。

## 结论卡

| 字段 | 结论 |
|---|---|
| 官方名称 | Tencent Hy3 |
| 证据日期 | 2026-07（官方仓库 final release；精确日级日期未在仓库首页稳定声明） |
| 开放状态 | 开放权重与代码，Apache 2.0 |
| 输入/输出模态 | 文本输入、文本输出 |
| 上下文 | 256K tokens |
| 许可与部署边界 | Apache 2.0；仍需遵守适用法律、模型卡安全说明和依赖组件许可 |
| 证据级别 | 官方发布页、官方模型文档、官方仓库或技术报告 |

## 发布与证据

Hy3 是 Tencent Hy 语言模型线，和 Hunyuan3D 的三维生成线不是同一任务家族。官方仓库同时保留早期 preview 与 final release 信息。

## 相对上代变化

相对 Hy3-preview，final Hy3 在官方仓库以 Apache 2.0 发布；不要把 preview 的专用社区许可继续套在 final 权重上。

## 已披露的技术事实

- 295B 总参数、21B 激活参数，另有 3.8B MTP 层；256K context。
- 官方提供 vLLM/SGLang 路径与多卡部署说明。

## 未披露与不应推断

- 训练数据完整清单、全部后训练环境和端到端生产吞吐不公开。
- 仓库建议硬件不是最低可行配置保证。

## 评测协议

区分 base/instruct（若官方仓库列出）、推理后端、量化、并行度、上下文长度与是否开启 MTP；报告官方和本地复现的差异。

## 适用边界

适合有多卡大显存资源的自部署语言任务；不是 Hunyuan3D，也不能用 3D 指标评估。

## 迁移说明

本页是该身份在公开知识树中的唯一首页。产品名、API 型号与底层 checkpoint 只有在官方明确映射时才视为同一对象；旧第 05/14 章材料不再作为平行正文。

## 一手来源

- [Tencent Hy3 官方仓库](https://github.com/Tencent-Hunyuan/Hy3)
- [Hy3-preview 官方仓库与许可快照](https://github.com/Tencent-Hunyuan/Hy3-preview)

[← 返回 Hunyuan / Tencent Hy 家族](../hunyuan.md)
