---
title: "05 · Kimi-K3 Index"
date: 2026-08-30
as_of: 2026-08-30
status: completed
tags:
  - Kimi
  - Moonshot
  - KDA
  - LatentMoE
---

# Kimi-K3 技术入口

> 返回上级：[14.5-Kimi](../../14.5-Kimi.md)

Kimi K3（[arXiv:2607.24653](https://arxiv.org/abs/2607.24653)）是 Moonshot 的 2.8T / 104B 激活开源旗舰：混合 KDA–MLA、Block AttnRes、Stable LatentMoE、原生视觉、1M 上下文。和 K2.6「同骨架换后训练」不是一类发布。

## 文档导航

| 文件 | 说明 |
| --- | --- |
| [01-Kimi-K3 架构精译](./01-Kimi-K3-架构精译.md) | 报告精读：三条轴 + §3 数据/缩放 + §4 QAT/MOPD/MTP→EAGLE-3 + Table 2/5 评测；积木公式链回体系章 |

本轮 **不做** mineru OCR、不平行第三份 D5 把 KDA 公式再抄一遍。完整 D5 若以后要加厚，只写「相对 K2 / Kimi Linear 改了什么」。

## 技术问题定义

开源侧在 1T 档附近把后训练和测试时计算推得很远，预训练底座却几乎停步。K3 同时走两条轴：预训练拉到 3T 档，后训练拉到 1M agentic 轨迹。

## 方法拆解（只点名，公式在体系章）

- **序列**：3 KDA : 1 Gated MLA；K3 给 KDA 加上有下界的 decay 和满秩输出门；MLA 全 NoPE。
- **深度**：Block AttnRes，约 12 层一块，8 块 + embedding。
- **宽度**：LatentMoE $\ell=d/2$，896 / Top-16 / 2 共享；SiTU-GLU + Quantile Balancing。
- **优化 / 量化**：Per-Head Muon；后训练 QAT（路由专家 MXFP4 权重 / MXFP8 激活，rollout 与训练同方案）。
- **投机**：预训练 MTP 微调成 EAGLE-3 draft，损失是 LK 接受率不是 KL。
- **系统**：FlashKDA、KCP、MoonEP（每 rank $S\times K$，冗余 $\le E/R$）。

## 结论与适用边界

**适用**：要读 2026 开源旗舰如何把线性注意力、深度维注意力和超稀疏 MoE 捆在一起；要对照 K2 的 MLA-only 骨架换了什么。

**不适用/谨慎**：内部基准不要直接当公开榜；预训练总 token 报告未给。闭源对照见 [Fable 5](../../14.13-Claude/19-Claude-Fable-5/01-Claude-Fable-5-公开材料精读.md) / [GPT-5.6 Sol](../../14.12-OpenAI/26-GPT-5.6-Sol/01-GPT-5.6-Sol-公开材料精读.md)。

**谱系**：K2（MLA + MuonClip）→ K2.5/K2.6（同骨架、后训练/Swarm）→ **K2.7 Code（仍同骨架，编码 SKU）** → **K3（换注意力与 MoE，预训练再放大）**。Fable 5 / GPT-5.6 Sol 已有第 14 章公开材料精读，不要再用本 Index 的「未打开官方页」句。
