---
title: 持续学习传统方法 Continual Learning (Traditional)
category: 持续学习传统方法
published: true
excerpt: >-
  持续学习传统方法专题：三大范式（正则化 EWC/SI/LwF、回放 GEM/ER、参数隔离 PackNet/HAT）+ 基准评测 +
  综述与开源库（Avalanche/Mammoth）+ 工业界实践 + 与 TTT 的关系。
tags:
  - 持续学习
  - Continual Learning
  - EWC
  - Replay
  - 灾难性遗忘
  - 终身学习
---
# 持续学习传统方法 Continual Learning (Traditional)

> 专题子库：持续学习 / 终身学习 / 增量学习的传统方法。核心问题：灾难性遗忘（catastrophic forgetting）。整理日：2026-08-12。

## 三大范式

### 1. 正则化方法（Regularization）
- **EWC (Elastic Weight Consolidation)**：对旧任务重要参数加二次惩罚（Fisher 信息加权），抑制漂移。Kirkpatrick et al. 2017，PNAS。
- **SI (Synaptic Intelligence)**：在线估计参数重要性，逐参数累积路径积分惩罚。Zenke et al. 2017。
- **LwF (Learning without Forgetting)**：蒸馏旧任务输出分布，无需旧数据。Li & Hoiem 2017。
- **RWalk / MAS**：结合路径积分与 Fisher 信息的改进。

### 2. 回放方法（Replay / Memory）
- **Experience Replay**：存旧样本混合训练。Rolnick et al. 2019（DeepMind）。
- **GEM / A-GEM**：梯度投影保证旧任务损失不增。Lopez-Paz & Ranzato 2017 / Chaudhry et al. 2019。
- **ER-Reservoir / DER++**：经验回放 + 蒸馏正则（2020s 强基线）。
- **GDumb / 缓冲池**：小缓存 + 全量重训的朴素强基线。

### 3. 参数隔离 / 动态架构（Architecture）
- **Progressive Neural Networks**：每任务新列，横向连接冻结旧列。Rusu et al. 2016。
- **PackNet**：剪枝后每任务打包新子网络。Mallya & Lazebnik 2018。
- **HAT (Hard Attention to the Task)**：任务掩码隔离参数。Serra et al. 2018。
- **Mixture of Experts / 子网路由**。

## 基准与评测

- **Split-MNIST / Split-CIFAR / Permuted-MNIST**：经典分割任务序列。
- **CIFAR-100 Superclass / Mini-ImageNet**：跨域增量。
- **指标**：Average Accuracy（平均准确率）、Backward Transfer（BWT）、Forward Transfer（FWT）。
- **设置**：Task-Incremental / Class-Incremental / Domain-Incremental（van de Ven et al. 2019 分类）。

## 综述与资源

- Parisi et al. 2019, "Continual Lifelong Learning with Neural Networks: A Review"（NN 期刊综述）。
- De Lange et al. 2021, "A Continual Learning Survey: Defying Forgetting in Classification Tasks"（TPAMI）。
- Wang et al. 2024, "A Comprehensive Survey of Continual Learning: Theory, Method and Application"。
- **Avalanche**（ContinualAI 官方库）：PyTorch 持续学习框架，内置 EWC/LwF/replay/GEM 等基线：github.com/ContinualAI/avalanche。
- **Mammoth**：PyTorch 回放方法复现库（Caccia et al.）：github.com/aimagelab/mammoth。
- 相关课程：Stanford CS330（终身学习）、DAAD 等。

## 公司与工业界

- **Hugging Face**：continual learning 生态与 benchmark 讨论。
- **Google Research / DeepMind**：EWC（DeepMind 出品）、Learning to Learn、Robot continual learning。
- **NVIDIA**：Jetson 边缘设备上的 replay 可行性研究（2025 MDPI 论文）。
- **工业场景**：推荐系统增量更新、自动驾驶在线适应、隐私受限的联邦持续学习（FedCL）。

## 与 TTT 的关系

传统持续学习关注「跨任务不遗忘」；Test-Time Training（TTT）则是「推理时用当前输入自适应更新模型」——二者共享"动态更新模型"的思想，但目标（跨任务记忆 vs 单样本自适应）与更新时机（训练阶段 vs 测试阶段）不同。见子库 [Test-Time Training（TTT）](ttt-index)。
