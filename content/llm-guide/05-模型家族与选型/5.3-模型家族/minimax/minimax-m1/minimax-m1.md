---
title: "MiniMax-M1"
category: "模型家族与选型"
tags: ["minimax-m1", "推理模型", "lightning-attention", "cispo"]
published: true
as_of: "2026-09-01"
excerpt: "MiniMax-M1 的混合注意力骨干、长推理、CISPO、权重和部署边界。"
---

# MiniMax-M1

## 定位

MiniMax-M1 于 2025-06-16 发布，是基于 MiniMax-Text-01 骨干继续训练的开放权重推理模型。官方仓库称其为 456B 总参数、45.9B 每 token 激活的混合注意力 MoE，原生支持 1M 上下文；公开 **M1-40k** 与 **M1-80k** 两个推理输出长度变体。

M1 的关键变化在后训练：技术报告提出 **CISPO（Clipped Importance Sampling Policy Optimization）**，通过裁剪重要性采样权重而不是直接裁剪 token 级策略更新来稳定大规模强化学习。它不是 M2 系列的 230B/10B 骨干。

## 能力与边界

- 1M 输入与 40K/80K 推理输出是不同维度；长输出会显著增加时延、成本和错误累积。
- 官方关于 FLOPs、训练成本和 benchmark 的数字来自厂商披露的模型、硬件与评估协议，不能无条件外推到第三方量化或不同推理框架。
- M1 保留 Lightning Attention/Softmax 混合路线；M2 才改为全层 full attention。两代之间不能沿名称推断兼容缓存或权重结构。
- 完整模型很大。官方推荐多卡部署；量化能降低权重存储，但不把 456B 模型变成 45.9B 模型。

## 获取与许可

- 权重：官方 GitHub 与 Hugging Face 提供 M1-40k、M1-80k。
- 许可：官方仓库为 Apache License 2.0；仍需核对所用推理框架、量化产物和第三方组件许可。

## 一手来源

- [MiniMax-M1 官方发布](https://www.minimax.io/news/minimaxm1)
- [MiniMax-M1 官方仓库](https://github.com/MiniMax-AI/MiniMax-M1)
- [MiniMax-M1 技术报告](https://arxiv.org/abs/2506.13585)
- [MiniMax-M1 官方技术研讨会摘要](https://www.minimax.io/news/minimax-m1-technical-seminar-2)

[← 返回 MiniMax 家族](../minimax.md)
