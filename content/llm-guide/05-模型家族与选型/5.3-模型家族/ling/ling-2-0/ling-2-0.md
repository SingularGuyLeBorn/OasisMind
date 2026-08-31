---
title: "Ling 2.0"
category: "模型家族与选型"
tags: ["ling", "模型版本", "证据"]
published: true
as_of: "2026-09-01"
excerpt: "Ling 2.0 从 mini 到 1T 的高稀疏 MoE 推理家族。"
---

# Ling 2.0

> 核验日期：2026-09-01。参数、上下文和许可只对应下列官方身份；不同尺寸、Base/Instruct 或滚动服务别名不得自动互换。

## 结论卡

| 字段 | 结论 |
|---|---|
| 官方身份 | Ling-mini-2.0 / Ling-flash-2.0 / Ling-1T 等 |
| 证据日期 | 2025-10-25 论文 v1；2025-11-07 v2 |
| 规模 | 16B 到 1T 总参数 |
| 架构定位 | 高稀疏 MoE、MTP、推理导向训练 |
| 许可 | Ling-V2 代码仓库 MIT |

## 定位与相对变化

Ling 2.0 统一 mini、flash 和 1T 的高稀疏 MoE 路线，并披露 mid-training、Evo-CoT/DFT 与 FP8/异构流水线；旧章节将日期写成 2024-10，已纠正。

## 已披露事实

- 官方仓库首发 Ling-mini-2.0 为 16B 总参数、1.4B 激活，训练超过 20T tokens。
- 技术报告还覆盖 flash/1T，具体参数与训练量不可自动复制到 mini。

## 未披露与证据边界

- “7× equivalent dense”是官方定义和对比口径，不是通用换算公式。
- Evo-CoT/LPO 等旧专题未逐条核证部分留在归档。

## 部署与选型

按 mini/flash/1T 的真实权重规模与目标分别选；`trust_remote_code`、FP8 内核、MTP 和 MoE 并行都需固定版本验证。

评测数字只有在模型快照、提示模板、采样、工具链、数据版本和计分器一致时才可横向比较；本页不转抄厂商榜单制造永久排名。

## 迁移说明

本页是该身份在公开知识树中的唯一首页。旧第 14 章报告翻译、MinerU 提取物和原图进入 _sources/model-reports/ling/；未逐项核证的架构解读与重复索引进入 _archive/model-knowledge/ling/。

## 一手来源

- [Ling 2.0 技术报告](https://arxiv.org/abs/2510.22115)
- [Ling-V2 官方仓库](https://github.com/inclusionAI/Ling-V2)

[← 返回 Ling 家族](../ling.md)
