---
title: "02 · Step-3 核心架构剖析"
date: 2026-08-30
status: completed
tags: [Step-3, MFA, AFD, MoE, 解码成本]
---

# Step-3 核心架构剖析

>  **[返回 14.7-StepFun 家族总览](../../14.7-StepFun.md)**

> 本文档基于 D2 精译和 D4 逐段精译整理, 聚焦核心技术点的深度剖析.
> 状态: completed.
> as_of: 2026-08-30
> 一手来源: [arXiv:2507.19427](https://arxiv.org/abs/2507.19427)

---

## 1 设计动机与核心洞察

测试时扩展把能力变成「更长的解码」。解码 MFU 低、每 token 最贵。Step-3 的 insight 不是「把模型做小」，而是：**总参数和激活参数都不是解码成本的好指标**；成本由注意力算术强度、MoE 稀疏度是否贴合硬件、以及 Attention 与 FFN 能否分开部署决定。

同目录 D2 对照（8K / 32K，$/1M tokens）：Step-3 激活 38B，高于 DeepSeek-V3 的 37B 与 Qwen3-MoE 的 22B，解码成本反而更低。两种常见次优：MLA 把 KV 压到算术强度 ~512，H20/A800 上算力受限；过稀 MoE 在网上「激活小」，在 H800 上却撞网络带宽。

机制级展开见 [05-Step-3-Architecture-Overview](./05-Step-3-Architecture-Overview.md)。对照本库 [2.3.5 MLA](../../../2-核心原理与架构/2.3-高效与稀疏注意力/2.3.5-多头潜在注意力MLA/2.3.5-多头潜在注意力MLA.md)。

---

## 2 原理推导

### 2.1 MFA

MFA：64 个 Query 头共享 1 个 KV 头；Query $7168 \to 2048 \to 64\times256$。QK 在低秩空间算，KV 头数接近 MLA 压缩，FLOPs 约为 MLA 的 $1/4.5$，有效秩仍是 16384。

| 设计 | 算术强度（量级） | 在 H800 / H20 上 |
|------|------------------|------------------|
| GQA | ~32 | 各卡内存墙 |
| MFA | ~128 | H20/A800/910B 接近平衡；H800 仍偏内存但留量化/MTP 余量 |
| MLA | ~512 | H800 贴合；H20 严重计算受限 |

KV 4-bit 或 MTP 大约把强度再翻倍。MLA 再翻就越过 H800 roofline；MFA 的 128 是故意留的甜点。

### 2.2 稀疏度下界

$$
S \geq \frac{H \times \mathrm{FLOPs} \times L}{\mathrm{Net} \times \mathrm{Bandwidth} \times 11.1\,\mathrm{ms}}
$$

H800 下界约 0.058；DeepSeek-V3 实际 $8/256 \approx 0.031$。Step-3 取约 0.083（3 路由 + 1 共享 / 48 专家），不必靠超大 EP + 邻域路由限制硬扛。

### 2.3 AFD

解码时 Attention 吃带宽（随上下文线性），FFN 吃算力。AFD 拆成实例，目标 50ms TPOT，A / F / 通信各约 16.6ms。通信走 StepMesh（CPU 侧 RDMA、零 SM）。

---

## 3 工程实现细节

- 异构：注意力偏 H20，FFN 偏 H800。
- 规模：AFD 约 32 GPU/实例（2A2F FP8），对比大 EP 数百卡。
- 原文 50ms TPOT、4K、无 MTP：Step-3 FP8 注意力 32 GPU 上 4039 TGS，高于其对 DSv3 在 128 GPU 上分析的 2324 TGS。
- StepMesh：https://github.com/stepfun-ai/StepMesh ；仅 PFC，不适合多租户。
- 最大上下文 64K。理论表按 100% MFU；作者写明给对手优惠。

---

## 4 与同类技术对比

| 维度 | DeepSeek-V3 MLA + 大 EP | Qwen3 GQA | Step-3 MFA+AFD |
|------|-------------------------|-----------|----------------|
| KV | 低秩压缩，算力偏高 | 分组共享，KV 偏大 | 低秩 QK + 单 KV 头 |
| 算术强度 | ~512 | ~32 | ~128 |
| 稀疏度 | ~0.031 | 中等 | ~0.083 |
| 部署 | 同质大 EP | 常规 TP/EP | A/F 解耦，可异构 |

AFD 不是 EP 的替代：FFN 侧仍可用 TP+EP。PD 分离是前置假设。

---

## 5 局限性与风险

1. 假设 Attention 与 FFN 分层清晰；融合块会拆不动。
2. 64K 窗口对整库上下文不够。
3. StepMesh 仅 PFC 不适合多租户。
4. 实际 MFU 30–60% 时价差收窄。
5. 视觉 5B 只在预填充，本篇不覆盖 VLM 精度。

---

## 6 知识库同步

- 同目录：[05-Step-3-Architecture-Overview](./05-Step-3-Architecture-Overview.md)、[01-Step-3技术报告精译](./01-Step-3技术报告精译.md)
- 第 5 章：[05-Step-2-万亿MoE从头训练与系统协同优化](../../../../5-主流模型全解/5.2-国内大模型/阶跃星辰-StepFun/05-Step-2-万亿MoE从头训练与系统协同优化.md)（Step-2；Step-3 以第 14 章为准）
- 本库仅此一份六段提纲版。
