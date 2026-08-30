---
title: "02 · MoE 工程实践（容量与负载在 2.4.1）"
date: 2026-08-30
as_of: 2026-08-31
tags: [MoE, 负载均衡, 专家容量]
---

# 02 MoE 工程实践

容量 $C$、容量因子 $\gamma$、token drop / dropless、aux-loss $f_i P_i$、router z-loss，已经写进 [2.4.1](../2.4.1-混合专家模型MoE.md) 第 4–5 节。这里不再另写一份。

| 问题 | 去哪 |
|------|------|
| 槽数、溢出、Switch Table 1、drop / dropless | [2.4.1 第 5 节](../2.4.1-混合专家模型MoE.md) |
| $f_i P_i$、z-loss、路由器 FP32、ST-MoE Table 4 | [2.4.1 第 4 节](../2.4.1-混合专家模型MoE.md) |
| Expert-Choice 的 $c$ 不是 Switch 的 $\gamma$ | [2.4.1 第 3.2 节](../2.4.1-混合专家模型MoE.md) |
| DeepSeek 门控、共享专家 | [01](../01-DeepSeek-MoE/01-DeepSeek-MoE.md) |
| Top-K 怎么反传 | [03](../03-MoE-Top-K运算可导性分析/03-MoE-Top-K运算可导性分析.md) |
| 路由专家宽度 $\ell$、分位数 bias | [10](../10-Stable-LatentMoE与Quantile-Balancing/10-Stable-LatentMoE与Quantile-Balancing.md) |
| EP、All-to-All、Grouped GEMM | [6.1.8 / 08](../../../../6-训练与推理优化/6.1-训练基础设施/6.1.8-MoE系统与并行/08-MoE系统优化综述/08-MoE系统优化综述.md) |

机制主线是 [01](../01-DeepSeek-MoE/01-DeepSeek-MoE.md) → [03](../03-MoE-Top-K运算可导性分析/03-MoE-Top-K运算可导性分析.md) → [10](../10-Stable-LatentMoE与Quantile-Balancing/10-Stable-LatentMoE与Quantile-Balancing.md)。
