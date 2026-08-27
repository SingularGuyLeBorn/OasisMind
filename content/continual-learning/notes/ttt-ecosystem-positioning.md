---
title: TTT 生态定位：与线性注意力 / Mamba / RWKV 的对比
category: TTT
published: true
excerpt: >-
  TTT 生态定位精读：与全注意力/Mamba/RWKV/线性注意力的对比表（训练复杂度、推理延迟、状态表达、长上下文准确率）；TTT-E2E
  把长上下文重定义为持续学习；CL 三范式在 TTT 中的影子与双向借鉴。
tags:
  - TTT
  - Mamba
  - RWKV
  - 线性注意力
  - 长上下文
  - 生态对比
---
# TTT 生态定位：与线性注意力 / Mamba / RWKV 的对比

> TTT 专题精读之六。整理日：2026-08-12。本文把 TTT 放回"次二次复杂度序列模型"的坐标系里，讲清它和主流替代路线的异同。

## 背景：长上下文三阵营

长上下文语言建模的算力瓶颈催生了三类替代注意力的路线：

1. **稀疏/滑动注意力**：FlashAttention、sliding-window（长窗口截断）——仍是二次复杂度，但常数小。
2. **固定状态 RNN / 线性注意力**：Mamba（SSM）、RWKV、Gated DeltaNet、Linear Attention（如 Based）——状态是固定维度向量，推理 O(1)/token，但**记忆容量受限**（状态压缩瓶颈）。
3. **TTT 家族（可学习状态）**：隐藏状态/权重在推理时持续更新——状态容量可扩展（非线性状态最多达 40% 参数），推理恒定延迟但**测试时要做梯度更新**（每 token 或每 chunk）。

## 关键对比表

| 维度 | Transformer（全注意力） | Mamba/RWKV/线性注意力 | TTT-Linear/Layers | TTT-E2E | LaCT（大块 TTT） |
|---|---|---|---|---|---|
| 训练复杂度 | O(n^2) | O(n) | O(n) | O(n)（sliding window） | O(n) |
| 推理延迟 | 随 context 增长 | 恒定 | 恒定 | 恒定（128K 快 2.7x） | 恒定 |
| 状态表达 | 无状态（重算所有历史） | 固定向量（容量受限） | 小模型权重（可扩展） | 主模型权重（最强） | 大 chunk 更新（40% 参数） |
| 长上下文准确率 | 最强（lossless） | 次之（易遗忘） | 匹配/超越 Transformer 基线 | 与全注意力同 scaling | 1M context 验证 |
| 主要短板 | 算力/成本 | 记忆容量 | 小 minibatch GPU 利用率低 | meta-learning 训练复杂 | 大 chunk 的实时性 |

## 与持续学习的关系

- TTT-E2E 明确把长上下文建模**重新定义为持续学习问题**：用 next-token prediction 在测试时把 context 压进权重——"记忆 = 权重更新"。
- 传统持续学习的三大范式（正则化/回放/参数隔离）在 TTT 里都有影子：
  - 正则化：控制测试时更新的稳定性（防灾难性遗忘当前知识）
  - 回放：mini-batch/大 chunk 可视为对近期 token 的"回放"
  - 参数隔离：fast weights（隐藏状态小模型）与主权重分离
- 双向借鉴正在发生：CL 方法约束 TTT 的遗忘；TTT 给 CL 提供"在线自适应"的新视角。

## 实用选型建议（据现状）

- 需要**无损长程召回**且预算充足：全注意力。
- 需要**恒定延迟 + 成本敏感**且能接受记忆损失：Mamba/线性注意力。
- 想要**长上下文准确率 + 恒定延迟**（且能承担测试时计算）：TTT 家族。
- 工业 Agent 消化长文档/ticket/log：TTT-E2E 是最直接的候选（VentureBeat 视角）。

## 参考

- arXiv:2407.04620（TTT-Linear）、arXiv:2505.23884（LaCT）、arXiv:2512.23675（TTT-E2E）
- NVIDIA SIL 项目页：research.nvidia.com/labs/sil/projects/tttla（TTT 线性注意力融合方向）
- Medium 对比文：Transformers vs Mamba vs Linear Attention（long context 视角）
