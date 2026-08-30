---
title: "05 · MiniMax-M2：不是 Lightning Attention"
date: 2026-08-30
as_of: 2026-08-30
tags: [MiniMax-M2, Lightning Attention, 勘误]
---

# MiniMax-M2 核心技术专题：不是 Lightning Attention

>  **[返回 14.8-MiniMax 家族总览](../../14.8-MiniMax.md)** · 正本：[01 技术报告精译](./01-MiniMax-M2-技术报告精译.md)

## 1. 线性注意力的复兴（2025 空壳原文，保留）

传统的 Transformer 饱受 KV Cache 显存墙的困扰。M2 摒弃了标准的 Softmax 归一化，通过核技巧 (Kernel Trick) 和右乘关联机制，在训练和推理时将复杂度极限压缩。这意味着无论上下文多长，理论上的推理状态大小都是固定的 (O(1) 的显存增长)。

## 2. 2026-08 修订：这段是 Text-01 误贴

上面一节是目录承诺的专文空壳，**写错了模型**。Lightning Attention / 4M 窗口属于 **MiniMax-Text-01**（[arXiv:2501.08381](https://arxiv.org/abs/2501.08381)），线性注意力课在 [2.3.3](../../../2-核心原理与架构/2.3-高效与稀疏注意力/2.3.3-线性注意力机制/2.3.3-线性注意力机制.md)。

M2 系列论文（[arXiv:2605.26494](https://arxiv.org/abs/2605.26494) §2.2.2）写明：注意力在所有层用 **full softmax + GQA**（48/8），**离开** Text-01 的 Lightning 混合。规格 **229.9B / 9.8B**、sigmoid 门 8/256、原生 192K，写在 [01](./01-MiniMax-M2-技术报告精译.md)。不要在本目录继续展开 Lightning 公式。

产品名里的「M2.5-Lightning」是吞吐档，不是注意力架构。

本文件不再写成第二份 Lightning 教材。要读线性注意力，去 2.3.3 和 Text-01 目录。
