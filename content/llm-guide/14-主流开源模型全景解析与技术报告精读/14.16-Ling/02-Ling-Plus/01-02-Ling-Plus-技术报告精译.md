---
title: "01 · 02-Ling-Plus 技术精译"
date: 2026-08-30
as_of: 2026-08-30
tags: [Ling-Plus, inclusionAI, MoE]
---

# 02-Ling-Plus 技术报告纯中文精译

>  **[返回 14.16-Ling 家族总览](../../14.16-Ling.md)** · Lite 对照：[01-01](../01-Ling-Lite/01-01-Ling-Lite-技术报告精译.md) · 已有摘要：[01-Ling-Plus技术报告精译](./01-Ling-Plus技术报告精译.md)

> 零一万物 Yi 家族的延续。在极高的 INF (推理吞吐率) 要求下，该版本模型对显存碎片化与 PagedAttention 进行了深度调优。

**材料类型（2026-08）**：占位同样把 Plus 写成 Yi + PagedAttention，**错**。Plus 与 Lite **同一篇** [arXiv:2503.05139](https://arxiv.org/abs/2503.05139)。本 01-02 只锁 Plus 增量，机制不重写。

## Plus 相对 Lite

| | Plus |
|--|------|
| 总 / 激活 | **290B / 28.8B** |
| 专家 | **256 路由 + 1 共享** |
| 数据 | **9T** 预训练；长上下文阶段 **150B**，web 比例下调、加长文 |
| 异构 | 五档加速器上完成预训练；成本叙事与 Lite 共用 ~**20%** |
| 推理 | Flood：相对 vLLM **2.08×–2.40×**（论文） |
| 长文 | NIAH 接近满分（论文 Figure 14 叙述；本篇不估柱） |

Scaling law 实验把小 MoE 对齐 Plus 结构，算力 \(1\times10^{18}\)–\(6\times10^{20}\)。稀疏度扫过 **4.6%–12.1%**。

失效条件：把 01-02 写成第二份全书；把 Ling-2.5 混合线性注意力倒灌。

## 本篇来源

- 同 Lite：arXiv:2503.05139
