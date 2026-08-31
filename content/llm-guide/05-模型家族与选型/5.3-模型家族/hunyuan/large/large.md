---
title: "Hunyuan-Large"
category: "模型家族与选型"
tags: ["hunyuan", "模型版本", "证据分级"]
published: true
as_of: "2026-09-01"
excerpt: "Hunyuan-Large 的 389B/52B MoE 账本、公开机制与复现边界。"
---

# Hunyuan-Large

> 核验日期：2026-09-01。本文只写可回到一手材料的事实；服务规格、价格与可用区以使用当天的官方文档为准。

## 结论卡

| 字段 | 结论 |
|---|---|
| 官方名称 | Hunyuan-Large |
| 发布日期 | 2024-11-04（技术报告） |
| 获取方式 | 开放权重、代码与报告 |
| 证据级别 | 原始论文 + 官方仓库 |

## 发布与证据

Hunyuan-Large 是腾讯公开的 MoE 研究模型，不是“腾讯混元 Pro”服务的同义词。

## 相对上代变化

公开了超大规模 MoE 基座及配套权重/代码，使架构和配置可以落到原表与 config。

## 已披露的技术事实

- 论文报告 389B 总参数、52B 激活参数；数字只适用于 Hunyuan-Large。
- 论文披露 1 shared + 64 routed experts、每 token 激活 1 shared + 8 routed experts，并描述专家特定学习率缩放等机制。
- CLA 等注意力/缓存设计按论文 Table 与 config 引用；机制推导回第 02 章。

## 未披露与不应推断

- 不能把 TurboS 的混合 Mamba 结构或云端 Pro 的 SLA 合并进本模型。
- 部署吞吐依赖框架、硬件、量化与批处理，不是权重固有常数。

## 评测协议

- 采用论文表格时注明 Base/Chat、任务、shot 和 comparator 版本。
- 独立复现使用官方 checkpoint/config，并记录推理引擎与精度。

## 适用边界

- 适合研究大规模细粒度 MoE 与跨层 KV 复用。
- 资源需求高；部署前做显存、通信和专家并行测量。

## 迁移说明

本页是该身份在公开知识树中的唯一首页。旧第 05/14 章材料已按证据拆入 `_sources` 或 `_archive`；以下只记录其可核验的独有信息，不保留平行教程。
- `14-主流开源模型全景解析与技术报告精读/14.20-Hunyuan/01-Hunyuan-Pro/01-01-Hunyuan-Pro-架构精译.md`

## 一手来源

- [Hunyuan-Large 技术报告](https://arxiv.org/abs/2411.02265)
- [Hunyuan-Large 官方仓库](https://github.com/Tencent/Tencent-Hunyuan-Large)

[← 返回 Hunyuan 家族](../hunyuan.md)
