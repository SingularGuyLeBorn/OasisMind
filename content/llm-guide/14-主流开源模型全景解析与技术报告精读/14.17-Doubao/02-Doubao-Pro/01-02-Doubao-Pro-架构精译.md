---
title: "01 · Doubao Pro: 字节全家桶中枢 架构精译"
date: 2026-08-30
as_of: 2026-08-30
tags: [Doubao-1.5-pro, MoE, PD分离, 公开材料精读]
---

# Doubao Pro: 字节全家桶中枢

>  **[返回 14.17-Doubao 家族总览](../../14.17-Doubao.md)** · lite：[Doubao Lite](../01-Doubao-Lite/01-01-Doubao-Lite-架构精译.md) · 体系：[2.4.1 MoE](../../../2-核心原理与架构/2.4-前沿架构与变体/2.4.1-混合专家模型MoE/2.4.1-混合专家模型MoE.md) · [9.4 PD](../../../9-AI工程化与基础设施/9.4-推理服务框架/9.4-推理服务框架.md)

> 该家族依靠其独特的算力优势与数据护城河，在 LLM 红海中占据了核心生态位。

**材料类型（2026-08）**：Seed 技术博客，不是 MLA 级论文。日期 **2025-01-22**。基准图未在 HTML 里给出百分数，本篇只收**文字里的机制**。数据：**不使用任何其他模型的数据**。

## 1. 7 倍杠杆（对照实验，不是总参表）

稀疏 MoE。预训练较小激活即可超过 Llama 3.1-405B 等大 Dense（官方同时声明：数据分布不同、Doubao Dense 参数也远小于 405B，用来说明数据/超参，不是 1.5-pro = 405B）。

杠杆定义：表现相当的 Dense **总参** / MoE **激活参**。Granite 例：800M 激活 ≈ 2B Dense → ~2.5×；业内常 <3×。豆包：**同一份 9T tokens**、数据分布相同，激活仅为 Dense 总参 **1/7** 的 MoE **超过** 该 Dense → **7 倍**。图注：这是 9T 阶段性结果；完整训完还会再涨。

后训练可按深度 / 宽度 / 专家数 / 激活专家数 / hidden token 推理做动态缩放。没有公布生产模型的专家数。

## 2. 推理：四个象限 + PD

高度稀疏 MoE。Prefill/Decode × Attention/FFN 四个象限，异构硬件 + 不同低精度。

| 阶段 | 官方句 |
|------|--------|
| Prefill | 易打满算力；Chunk-PP Prefill Serving；Tensor Core 利用率接近 **60%** |
| Prefill Attn | 扩开源 FlashAttention 8-bit；Per N tokens Per Sequence 量化 |
| Prefill FFN | **W4A8**；跨 Query Batching；FFN MFU 到 **0.8** |
| Decode | 偏通信/访存；低成本 Sampling + Speculative Decoding |
| Decode Attn | TP；启发式拆长句 |
| Decode FFN | 仍 W4A8；**EP** |

PD 分离：定制 RPC、零拷贝、多流；Prefill/Decode 独立 HPA；GPU 计算与 CPU 前后处理异步。自研集群/网卡/小包协议。这些是 serving，不是第三份 MoE 公式。

## 3. 后训练与多模态（点名，不抄全）

SFT：多样性 + 人题匹配 + Self-evolve。RM：25% 数据近似全量；生成式 RM。RL：veRL；价值函数 token-wise，收敛快 **4 倍**，高难任务 **>10** 个绝对点。用户反馈闭环。

视觉：原生动态分辨率；自研 Doubao ViT **2.4B**，分类综合分自称超过 7 倍规模模型。动态分辨率训练吞吐 **+60%**。语音：Speech2Speech 端到端，非 ASR+LLM+TTS 级联。深度思考预览 **Doubao-1.5-pro-AS1-Preview**，AIME 超过 o1-preview / o1（图，无百分数）。

## 本篇来源

- https://team.doubao.com/zh/special/doubao_1_5_pro （读完 MoE 杠杆、四象限 serving、数据、视觉/语音、AS1）
- https://developer.volcengine.com/articles/7462939272262189083
