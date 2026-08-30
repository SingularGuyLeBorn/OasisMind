---
title: "08 · MoE 系统优化（入口在 6.1.8）"
date: 2026-08-30
as_of: 2026-08-31
tags: [MoE, 专家并行, All-to-All, Grouped-GEMM]
---

# 08 MoE 系统优化

EP、All-to-All、Grouped GEMM 的正本在 [6.1.8 / 08](../../../../6-训练与推理优化/6.1-训练基础设施/6.1.8-MoE系统与并行/08-MoE系统优化综述/08-MoE系统优化综述.md)。本页只指路。机制主线仍是同夹 [01](../01-DeepSeek-MoE/01-DeepSeek-MoE.md) → [02](../02-MoE的工程实践/02-MoE的工程实践.md) → [03](../03-MoE-Top-K运算可导性分析/03-MoE-Top-K运算可导性分析.md) → [10 LatentMoE / QB](../10-Stable-LatentMoE与Quantile-Balancing/10-Stable-LatentMoE与Quantile-Balancing.md)。

| 问题 | 去哪 |
|------|------|
| token 送到哪张卡、两次 All-to-All、Tile 填充 | [6.1.8 / 08](../../../../6-训练与推理优化/6.1-训练基础设施/6.1.8-MoE系统与并行/08-MoE系统优化综述/08-MoE系统优化综述.md) |
| DeepEP / MoonEP / Wave 通算重叠 | [6.1.1](../../../../6-训练与推理优化/6.1-训练基础设施/6.1.1-分布式训练/6.1.1-分布式训练.md) |
| 路由专家宽度 $\ell$、分位数 bias | [10](../10-Stable-LatentMoE与Quantile-Balancing/10-Stable-LatentMoE与Quantile-Balancing.md) |
| 容量、drop、aux-loss、z-loss | [02](../02-MoE的工程实践/02-MoE的工程实践.md) |

MoonEP 管的是每张卡收到多少 token；Quantile Balancing 管的是每个专家被选多少次。不要把 [10](../10-Stable-LatentMoE与Quantile-Balancing/10-Stable-LatentMoE与Quantile-Balancing.md) 并进系统综述。
