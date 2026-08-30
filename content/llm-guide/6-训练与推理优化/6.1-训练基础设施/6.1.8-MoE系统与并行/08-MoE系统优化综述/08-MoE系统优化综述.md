---
title: "08 · MoE 系统优化综述"
date: 2026-08-30
as_of: 2026-08-30
tags: [MoE, 专家并行, All-to-All, SonicMoE, Grouped-GEMM]
---

# MoE 系统优化：稀疏激活碰到硬件的并行胃口

> 邻居：[2.4.1 总览](../../../../2-核心原理与架构/2.4-前沿架构与变体/2.4.1-混合专家模型MoE/2.4.1-混合专家模型MoE.md)（路由公式在那边）· [01 DeepSeek-MoE](../../../../2-核心原理与架构/2.4-前沿架构与变体/2.4.1-混合专家模型MoE/01-DeepSeek-MoE/01-DeepSeek-MoE.md)（细粒度 + 共享专家）· [07 混合并行图解](../07-MoE混合并行部署与通信优化图解/07-MoE混合并行部署与通信优化图解.md) · 卡间账：[6.1.1 EP](../../6.1.1-分布式训练/6.1.1-分布式训练.md)

MoE 把 FLOPs 做成稀疏，参数却仍要驻留。系统层卡住的不是「再写一遍 Top-$k$」，而是 **token 怎么送到拥有专家的那张卡、激活怎么不随粒度线性涨、Grouped GEMM 的 Tile 怎么不被填充吃掉**。本篇不重推 DeepSeek-MoE 的门控；路由与负载公式见总览和 01。

## 1. 两套场景：显存够 vs 显存不够

显存够、卡多：走 **专家并行（EP）**。每个 rank 只持有一部分专家，路由之后用 All-to-All 把 token **dispatch** 到目标卡，算完再 All-to-All **combine** 回来。单卡参数降了，通信和负载不均变成主矛盾。

显存不够、卡少：走 **卸载**。不活跃专家放到 CPU / 盘，用到再搬回 GPU。能跑超大池，但 PCIe 延迟比 NVLink All-to-All 更刺；没有预取就会空转。这不是另一种路由公式。

![EP：token 经 All-to-All 去专家所在 GPU，结果再 Combine 回来](./images/fig-moe-ep-alltoall.png)

> 图 1：EP 的通信骨架。左是各卡上的 token，右是切分后的专家；实线 Dispatch、虚线 Combine。路由本身仍在本卡算。

**图 1 解析**

- 路由器先选出 Top-$k$ 专家下标；通信只搬运激活，不搬运整份专家权重。
- 负载不均时，持有热门专家的 GPU 算得久，别的卡在等 All-to-All——这是 EP 的典型空转，不是「再加大容量因子」能单独修掉的。
- 节点内 TP 处理 Attention / 共享参数、跨节点 EP 切专家，是工业默认拼法；DeepEP、Wave 重叠写在 [6.1.1](../../6.1.1-分布式训练/6.1.1-分布式训练.md)，本篇不重画。

## 2. 并行怎么切：DP / TP / EP 各管一块

| 维度 | 切什么 | MoE 层在干什么 |
|------|--------|----------------|
| DP / ZeRO | 数据；参数可分片 | 专家权重若再复制一份，显存又回去了 |
| TP | Attention、共享 FFN 的矩阵 | 高带宽域里 All-Reduce |
| EP | 专家参数 | 两次 All-to-All（dispatch + combine） |

「ZeRO-EP」只是把 ZeRO 的分片和 EP 的专家切分叠在同一作业里：EP 组内先对专家梯度做完，再在 DP 组间聚合。不要把它读成第三套门控。

## 3. 计算侧：Grouped GEMM 和 Tile 浪费

专家算的是一堆形状不同的 GEMM。工业核把同一专家的 token 拼成一块做 **Grouped GEMM**，少一次 kernel launch。稀疏度升高以后，每个专家分到的 token 数经常 **整除不了 Tile**（如 128），尾部填充变成纯浪费。

**SonicMoE**（[arXiv:2512.14080](https://arxiv.org/abs/2512.14080)）对着这条线改了三件事，不是新的 $p_i$：

1. **少缓存激活。** 细粒度 MoE 的反向若按 $O(TKd)$ 把中间激活堆在 HBM，粒度越细越吃内存。SonicMoE 改反向图，避免缓存那块巨型张量，激活内存不再跟粒度一起涨。
2. **Gather / Epilogue 和 IO 重叠。** Hopper 上 ping-pong warpgroup：一波在做 MMA，另一波在搬下一 tile。
3. **Token rounding。** 把每专家 token 数就近圆到 Tile 倍数，从源头减少 Grouped GEMM 填充。高稀疏时相对 vanilla Top-$k$ 大约 **1.16×** kernel（论文摘要：高稀疏再给 1.16×；相对 ScatterMoE 的 BF16 核，细粒度 7B 上吞吐 **1.86×**、激活内存 **-45%**）。

摘要里的端到端数字（同 lm-engine、FSDP-2、7B）：SonicMoE **64×H100** 约 **213B token/天**，ScatterMoE **96×H100** 约 **225B token/天**。卡数不同，不要读成「同一 64 卡快 1.86×」。Blackwell 上相对 DeepGEMM 基线，OLMoE 体量 7B 的前向 / 反向加速以论文摘要为准（约 25% / 15%），本篇不另估 TFLOPs。

旧文里「+40% TFLOPs、正向 >500 TFLOPs」来自二手专栏，**不以它为准**。

## 4. 和 01 / 07 / 6.1.1 的分工

| 问题 | 去哪 | 本篇不写 |
|------|------|----------|
| 先 Top-$k$ 再 Softmax、共享专家 | [2.4.1](../../../../2-核心原理与架构/2.4-前沿架构与变体/2.4.1-混合专家模型MoE/2.4.1-混合专家模型MoE.md) / [01](../../../../2-核心原理与架构/2.4-前沿架构与变体/2.4.1-混合专家模型MoE/01-DeepSeek-MoE/01-DeepSeek-MoE.md) | 第二份 DeepSeek-MoE 公式 |
| Contiguous vs Masked layout、DeepGEMM | [07](../07-MoE混合并行部署与通信优化图解/07-MoE混合并行部署与通信优化图解.md) | 再抄一遍 layout |
| Wave 藏 All-to-All、MoonEP 卡间等 token | [6.1.1](../../6.1.1-分布式训练/6.1.1-分布式训练.md) | 把 MoonEP 说成新的 $p_i$ |
| 瘦专家 $\ell$、分位数 bias | [10 LatentMoE / QB](../../../../2-核心原理与架构/2.4-前沿架构与变体/2.4.1-混合专家模型MoE/10-Stable-LatentMoE与Quantile-Balancing/10-Stable-LatentMoE与Quantile-Balancing.md) | |

## 5. 失效

- 只开 EP、不处理热专家：All-to-All 等最慢的 rank。
- 细粒度 + 高 $K$ 仍按稠密 FFN 的激活检查点：HBM 先爆。
- 把 token rounding 当成负载均衡损失：它圆的是 Tile，不是 $q=mk/n$。
- 单卡卸载却按多卡 EP 的 overlap 来估延迟：PCIe 不是 NVLink。

下一篇：[09 量化](../../../6.3-模型压缩/6.3.1-量化/09-MoE模型量化技术综述/09-MoE模型量化技术综述.md)（参数体积）；路由公式不要到量化文里再推一遍。

## 本篇来源

1. Liu et al. (2025/26). *SonicMoE: Accelerating MoE with IO and Tile-aware Optimizations*. https://arxiv.org/abs/2512.14080 （摘要：-45% 激活、Hopper 1.86× vs ScatterMoE BF16、64×H100 213B tok/天、token rounding 1.16×）
2. 本库：[07](../07-MoE混合并行部署与通信优化图解/07-MoE混合并行部署与通信优化图解.md)；[6.1.1 EP Wave](../../6.1.1-分布式训练/6.1.1-分布式训练.md)
3. 门控与 DeepSeek-MoE：总览 / 01，本篇不重推
