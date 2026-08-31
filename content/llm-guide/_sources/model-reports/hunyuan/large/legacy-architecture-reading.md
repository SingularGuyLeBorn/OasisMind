---
title: "01 · 混元 Pro: 腾讯 MoE 与长文本解析 架构精译"
date: 2026-08-30
as_of: 2026-08-30
tags: [Hunyuan-Pro, Hunyuan-Large, recycle-routing, 公开材料精读]
---

> 来源快照：保留旧稿供事实追溯；公开、已校勘版本见 [公开校勘页](../../../../05-模型家族与选型/5.3-模型家族/hunyuan/large/large.md)。




# 混元 Pro: 腾讯 MoE 与长文本解析

>  **[返回 14.20-Hunyuan 家族总览](../../../../05-模型家族与选型/5.3-模型家族/hunyuan/hunyuan.md)** · 长 D5：[细粒度 MoE](../../../../05-模型家族与选型/5.3-模型家族/hunyuan/large/large.md) · 体系：[2.4.1 MoE](../../../../2-核心原理与架构/2.4-前沿架构与变体/2.4.1-混合专家模型MoE/2.4.1-混合专家模型MoE.md)

> 该家族依靠其独特的算力优势与数据护城河，在 LLM 红海中占据了核心生态位。

本文件夹名叫 **Hunyuan-Pro**（云上 SKU / 元宝旗舰叙事），**开源论文是 Hunyuan-Large** [arXiv:2411.02265](https://arxiv.org/abs/2411.02265)（2024-11-05 v2）。**禁止**把 389B/52B 写成 hunyuan-pro API 的官方规格。长 D5 把 TurboS Mamba、A13B 1+64 写进「Pro」——那些是后出 SKU，修订节处理，本 D2 不跟写。

## 1. 两条线必须分开

| 线 | 官方能核对的 |
|----|----------------|
| 元宝 / 混元旗舰（闭源） | 论文引言：自 **2024-02** 元宝用 **万亿 MoE** 旗舰。没有公开专家表。 |
| **Hunyuan-Large**（开源） | **389B 总 / 52B 激活**；预训练 **256K**；Instruct **128K**；**7T** tokens，其中近 **1.5T** 合成；词表 **128K**（tiktoken 100K + 中文 28K） |

云上「hunyuan-pro」名称和 Large 权重不是同一张规格卡。本 D2 的架构数字全部标 **Large 论文**。

## 2. Hunyuan-Large Table 1（论文原表）

| 配置 | 值 |
|------|-----|
| 层 | 64 |
| Attn heads | 80 |
| KV heads | 8（GQA） |
| 共享专家 | 1（每 token 常开） |
| 路由专家 | 16 |
| 每 token 激活路由专家 | **1** |
| Hidden | 6,400 |
| 激活 | SwiGLU |
| RoPE | 有 |

HTML 里出现过「top-$11$」——那是 top-1 的公式残片。Table 1 与学习率段写明 **1-in-16**。

## 3. 四个命名机制（本体在论文，不在云文档）

**混合路由。** 1 共享 + Top-k 路由。脚注：同一套混合路由先用在闭源万亿模型（训练自 2023-11），与 DeepSeek-V2 同期。

**Recycle routing。** 容量因子下被丢掉的 token **随机再分配**到尚未满容的专家，而不是 drop。目的：少丢信息、训练更稳。

**KV 压缩。** GQA + Cross-Layer Attention。Table 2 题注：CLA **每 2 层**共享 KV。相对 MHA，GQA+CLA 号称 KV 约 **95%**↓。不要抄 HTML 解析出来的「88 groups / 每 22 层」。

**专家分学习率。** 共享专家与路由专家有效 batch 不同；路由侧按 \(n=16\) 缩学习率。

合成数据四步：指令生成 → 进化 → 回答 → 过滤。Scaling：拟合后 \(D_{\mathrm{opt}}\approx 5.6\mathrm{T}\)，实际训 **7T**。

评测：论文称 Large 超 Llama-3.1-70B、与 405B 可比；Instruct 在 MMLU / MATH 上相对 405B 的百分点以论文 Table 4 为准，本篇不二次换算。

## 4. 失效条件

- 把 389/52 印到 hunyuan-pro 价目表。
- 把 TurboS 的 AMF/Mamba 写成 Pro/Large 骨干。
- 把 A13B「1+64 / 800B」写进本 D2。

## 参考文献

- https://arxiv.org/html/2411.02265v2 （摘要、§1–2.2、Table 1–2、7T/1.5T、recycle、专家学习率）
- https://github.com/Tencent/Tencent-Hunyuan-Large
