---
title: EWC（Elastic Weight Consolidation）详解
category: 持续学习传统方法
published: true
excerpt: >-
  EWC 精读：PNAS 2017 DeepMind 经典——Fisher 信息加权的弹性权重巩固；公式、优缺点、变体（Online
  EWC/SI/RWalk/MAS）、实践要点与 TTT 的关联。
tags:
  - 持续学习
  - EWC
  - 正则化
  - 灾难性遗忘
  - Fisher
---
# EWC（Elastic Weight Consolidation）精读

> 持续学习传统方法精读之一。论文：Kirkpatrick et al., "Overcoming catastrophic forgetting in neural networks", PNAS 2017（DeepMind）。整理日：2026-08-12。

## 动机

神经网络训练新任务时，更新权重会破坏旧任务知识——灾难性遗忘（catastrophic forgetting）。EWC 的洞察：**并非所有权重对旧任务同等重要**。只保护那些对旧任务关键的权重，允许其余权重自由适应新任务。

## 核心思想

对旧任务，用参数后验的 Laplace 近似：

- 训练完任务 A 后，用 **Fisher 信息矩阵** $F$ 近似参数对旧任务的重要性（对角近似）：$F_i \approx \mathbb{E}[(\frac{\partial \log p(y|x)}{\partial \theta_i})^2]$。
- 训练任务 B 时，在损失上加入正则项：$\mathcal{L}_B(\theta) + \frac{\lambda}{2} \sum_i F_i (\theta_i - \theta^*_A,i)^2$。
- 效果：重要参数被"锚定"在旧值附近（弹性），次要参数自由移动（可塑性）——类似突触巩固（synaptic consolidation）的生物机制。

## 关键公式

$$L(\theta) = L_B(\theta) + \sum_i \frac{\lambda}{2} F_i (\theta_i - \theta^*_{A,i})^2$$

其中 $\theta^*_A$ 是任务 A 后的最优参数，$\lambda$ 控制正则强度，$F_i$ 是 Fisher 对角。

## 优点与局限

**优点**
- 无需存储旧数据（内存友好）
- 理论干净：贝叶斯视角（参数后验近似）
- 开创了"重要性加权正则化"整个流派

**局限**
- Fisher 对角近似可能不准确（忽略参数间相关性）
- 多任务链式累积误差：$\theta^*$ 固定会导致漂移
- 任务边界需要明确（task-aware）；无任务边界场景（task-free）效果下降
- 当新旧任务需要相同参数冲突严重时（如 Permuted-MNIST 后期），性能受限

## 变体与后续

- **Online EWC**：用滚动估计替代固定 Fisher，支持长序列任务
- **SI（Synaptic Intelligence）**：Zenke et al. 2017，用路径积分在线估计重要性，无需任务边界
- **RWalk**：结合 SI 的路径积分与 EWC 的 Fisher
- **MAS（Memory Aware Synapses）**：用输出梯度估计重要性
- **K-FAC EWC**：用块对角 Fisher 更精确建模参数相关性

## 实践要点

- $\lambda$ 是关键超参：太大→学不动新任务（可塑性丧失），太小→旧任务遗忘（巩固失效），常需网格搜索
- Fisher 需在任务 A 训练结束后从数据采样估计，计算量可控（一次前向后向）
- 在 Split-MNIST / Split-CIFAR 上 EWC 显著优于朴素微调，但在强回放基线面前常被超越——现代持续学习 SOTA 更多依赖回放+蒸馏

## 与 TTT 的关联

TTT 在推理时更新权重也面临"更新哪些权重、会不会破坏已学知识"的问题——EWC 式的 Fisher 重要性加权正则已被用于约束 TTT 的更新步，防止在测试时灾难性遗忘。见 [TTT 专题](ttt-index)。
