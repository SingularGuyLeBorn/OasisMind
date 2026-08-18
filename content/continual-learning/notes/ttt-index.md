---
title: Test-Time Training（TTT）测试时训练
category: TTT
published: true
excerpt: >-
  Test-Time Training 专题：两条技术线（自监督辅助任务 TTT vs 新一代 TTT Layers 隐藏状态即模型）+ Ilya/SSI
  2026 动向（爆料 SSI 首个模型围绕 TTT 构建、NVIDIA 注资）+ 论文清单与开源项目。
tags:
  - TTT
  - Test-Time Training
  - Ilya Sutskever
  - SSI
  - 持续学习
---
# Test-Time Training（TTT）测试时训练

> 专题子库：Test-Time Training——Ilya Sutskever 指出「最近有突破」的方向。核心思想：模型在推理时继续更新自己的权重，而非从预训练后一成不变。整理日：2026-08-12。

## 什么是 TTT

传统范式：预训练（大算力、离线）后推理时权重冻结。TTT 则让模型在**测试时**用当前输入（或自监督辅助任务）继续更新自身，从而让"小模型 + 在线自适应"对抗"大模型 + 冻结"。

Ilya Sutskever 在多个场合强调：预训练数据的增长终将放缓，**真正的突破在于让模型在推理/测试时能自我学习**——这是后预训练时代（post-pretraining）最受关注的研究线之一。

## 两条技术线

### A. 传统 TTT：自监督辅助任务
- Sun et al. 2020（ICML）"Test-Time Training with Self-Supervision for Generalization under Distribution Shifts"：推理时用旋转预测等自监督损失微调模型，提升分布偏移下的泛化。
- 后续：TTT 用于 OOD 检测、域适应、医学影像等。

### B. 新一代 TTT Layers：隐藏状态即模型
- **《Learning to (Learn at Test Time): RNNs with Expressive Hidden States》**（arXiv:2407.04620，Stanford 团队，2024）：提出 **TTT-Linear / TTT-MLP** 层——把 RNN 的隐藏状态本身做成一个小模型，每个 token 进来就在其上做几步梯度下降，替代 Transformer 的注意力。复杂度线性、长上下文优于 Transformer 与 Mamba。
- **TTT-Linear 后训练**（TTT-Linear 2024-2025 系列，含 TTT-E2E《End-to-End Test-Time Training for Long Context》）：从 125M 到 1.3B 参数验证，困惑度与长上下文任务匹配/超越基线。
- 关键卖点：**线性复杂度 + 可表达隐藏状态**，理论上能以 RNN 的成本获得接近 Transformer 的长程建模能力。

## Ilya / SSI 动向（2026）

- **Safe Superintelligence Inc.（SSI，Ilya Sutskever 2024 年 6 月创办）**：2026 年 8 月，X 账号"三只草莓"爆料其首个模型围绕 TTT 构建——"边思考边更新自己的权重"，而非预训练后定型；据称当前版本接近就绪、团队正 10 倍规模扩展下一代，可能本月小范围开放（未证实，SSI 未评论）。
- 爆料指向的技术参考论文正是 **TTT-E2E（End-to-End Test-Time Training for Long Context）**——作者列表是与 SSI 研究最公开的连接点。
- **NVIDIA 7 月注资 SSI 数十亿美元**（据称经"rare access"考察后），侧面印证 SSI 的 TTT 路线可信度。
- 时间线背景：Ilya 2024-12 公开称"预训练时代将终结"，2025-2026 持续押注"推理时学习/自我改进"。

## 论文清单

- Test-Time Training with Self-Supervision（Sun et al., ICML 2020）
- Learning to (Learn at Test Time): RNNs with Expressive Hidden States（arXiv:2407.04620, 2024）
- End-to-End Test-Time Training for Long Context（TTT-E2E, arXiv 2025）
- TTT-Unleashed：进一步扩展 TTT 架构与效率
- 对比基线：Transformer、Mamba（现代 RNN）、RWKV

## 项目与代码

- 官方项目页：test-time-training.github.io（含 discover 论文合集）
- GitHub：TTT-Linear / TTT 层实现（Stanford 团队开源）

## 与持续学习传统方法的关系

见 [持续学习传统方法](traditional-methods-index)：传统持续学习解决"跨任务不遗忘"，TTT 解决"单样本/单任务推理时自适应"；思想同源（动态更新权重），更新时机与目标不同。两者正互相借鉴（如用持续学习技术约束 TTT 的灾难性遗忘）。
