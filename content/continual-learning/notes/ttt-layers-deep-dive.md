---
title: TTT-Linear / TTT Layers：隐藏状态即模型
category: TTT
published: true
excerpt: >-
  TTT-Linear/TTT Layers 精读：隐藏状态即模型（每 token 在小型线性/MLP 模型上梯度下降）替代注意力；线性复杂度 +
  可表达长程记忆；125M-1.3B 匹配/超越 Transformer 与 Mamba；TTT-E2E 与 SSI 动向。
tags:
  - TTT
  - TTT-Linear
  - RNN
  - Transformer
  - 线性复杂度
  - 长上下文
---
# TTT-Linear / TTT Layers：隐藏状态即模型

> TTT 专题精读之一。论文：Sun et al., "Learning to (Learn at Test Time): RNNs with Expressive Hidden States", arXiv:2407.04620（Stanford，2024）。整理日：2026-08-12。

## 一句话概括

把 RNN 的隐藏状态从"一个向量"升级为"一个小模型"（如线性模型或两层 MLP），序列中的每个 token 到达时，就在这个小模型上做几步梯度下降——这就是 **Test-Time Training（TTT）层**。它替代了 Transformer 的注意力机制，同时获得**线性复杂度**与**可表达的长程记忆**。

## 为什么需要它

- **Transformer**：注意力是 $O(n^2)$ 的，长上下文成本高；但表达能力最强。
- **Mamba / 现代 RNN**：线性复杂度，但隐藏状态是固定维度向量，记忆容量有限（"状态压缩瓶颈"）。
- **TTT 的折中**：隐藏状态本身是模型（参数无限表达空间），以线性复杂度获得接近 Transformer 的能力。推理时对每个 token 微调这个小模型 = "在测试时训练"。

## 工作机制

1. **隐藏状态 = 模型**：$h_t$ 不再是向量，而是一个小模型的权重 $W_t$（TTT-Linear：线性层；TTT-MLP：两层 MLP）。
2. **更新规则**：每个新 token $x_t$ 到来，对 $W_{t-1}$ 做 $k$ 步梯度下降，最小化自监督损失（如重构/预测任务），得 $W_t$。
3. **读出**：从 $W_t$ 计算输出 token 预测。
4. **mini-batch 梯度下降（并行化关键）**：把序列分成 mini-batch，batch 内 token 共享 $W$，batch 间用前一个 batch 的最终 $W$ 初始化——把"串行递归"变成可并行的矩阵运算。

## 实验结果（论文核心）

- 规模：125M 到 1.3B 参数，与强 Transformer、Mamba 对比。
- **困惑度**：TTT-Linear / TTT-MLP 匹配或超越 Transformer 与 Mamba。
- **长上下文**：context 越长，TTT 相对优势越明显（可继续降低困惑度）。
- 复杂度：序列长度方向线性。

## 后续发展（TTT 家族）

- **TTT-Linear 后训练 / TTT-E2E（End-to-End Test-Time Training for Long Context）**：把 TTT 层从"预训练+推理时更新"推进到端到端训练，长上下文任务（如 LRA、长文档）表现更稳。
- **TTT-Unleashed**：进一步优化并行化与效率，向更大规模扩展。
- 业界关注：2026-08 爆料 SSI（Ilya Sutskever 的公司）首个模型围绕 TTT 构建，技术参考正是 TTT-E2E——详见 [SSI 与 TTT 路线](ssi-ttt-ilya-bet)。

## 开放问题

- TTT 层的推理开销（每 token 梯度下降）如何与注意力常数优化竞争
- 测试时更新的稳定性、灾难性遗忘（可用持续学习技术约束，见 [传统方法](traditional-methods-index)）
- 能否扩展到前沿模型规模（当前最强结果在 1-3B 级别）

## 代码与资源

- 官方项目页：test-time-training.github.io
- arXiv：2407.04620；TTT-E2E 论文见项目页 discover 合集
