---
title: "01 · MiniMax-M2 技术报告精译"
date: 2026-08-30
as_of: 2026-08-30
tags: [MiniMax-M2, MoE, Forge, GQA]
---

# MiniMax-M2 技术报告精译

>  **[返回 14.8-MiniMax 家族总览](../../14.8-MiniMax.md)** · 系列报告：[arXiv:2605.26494](https://arxiv.org/abs/2605.26494) · 产品：[2025-10-27 开源博文](https://www.minimax.io/news/minimax-m2)

> **模型定位**：全球首批将 Transformer 与 Linear Attention(闪电注意力 Lightning Attention)深度融合的开源旗舰。

上面定位句是 2025 占位，**全错**。Lightning Attention / 4M 上下文是 **MiniMax-Text-01**（2025-01），同目录长 D5 把 Text-01 误贴成 M2。M2 系列论文原文：注意力在所有层用 **full MHA + GQA**，**明确离开** Text-01 的 Lightning 混合。

## 1. 旗舰规格（系列论文 §2）

| 项 | 值 |
|----|-----|
| 总 / 激活 | **229.9B / 9.8B** |
| 层 / hidden / 词表 | 62 / 3072 / 200,064 |
| 注意力 | 48 Q heads / 8 KV（GQA）；RoPE |
| MoE | **256** 细粒度专家，每 token **8** 个；**sigmoid** 门 + 可学 bias（减 aux-loss） |
| 上下文 | 原生 **192K**（预训练 8K→32K→192K；decay 另 **9.3T**） |
| 预训练 | **29.2T** tokens |
| MTP | 多 token 预测，推理时可当投机解码草稿 |

产品博文（2025-10-27）：为 Agent 与代码开源；API 当时标 $0.30 / $1.20 per MTok。温度建议 1.0 / top_p 0.95 / top_k 20。

## 2. 后训练轴（点名，不把 M2.7 数字写成 M2）

三条一起从 M2 长到 M2.7：可执行工作区里的 agent 轨迹 + 制品对齐奖励；**Forge**（agent-native RL，windowed-FIFO、前缀树合并、训推 Agent 解耦）；M2.7 才写「改自己的 scaffold」。M2 本体不要抄 Table 4 的 M2.7 SWE-Pro **56.2**。

体系：sigmoid 门补一句在 [2.4.1 MoE](../../../2-核心原理与架构/2.4-前沿架构与变体/2.4.1-混合专家模型MoE/2.4.1-混合专家模型MoE.md)；线性注意力反例见 [2.3.3](../../../2-核心原理与架构/2.3-高效与稀疏注意力/2.3.3-线性注意力机制/2.3.3-线性注意力机制.md)。

## 3. 失效条件

- 写 456B / 4M / Lightning。
- 把 M2.5-Lightning（产品吞吐档）当成注意力架构。

## 参考文献

- https://arxiv.org/html/2605.26494v2 （摘要、§1–2、明确 vs Text-01）
- https://www.minimax.io/news/minimax-m2
