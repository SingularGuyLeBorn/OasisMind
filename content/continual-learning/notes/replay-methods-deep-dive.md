---
title: 回放方法（Replay / Memory）：GEM、ER 与经验回放
category: 持续学习传统方法
published: true
excerpt: >-
  回放方法精读：ER（Rolnick NeurIPS 2019）、GEM/A-GEM 梯度投影、DER/DER++
  蒸馏回放、生成式回放；Task/Class/Domain-Incremental 三设置；Mammoth/Avalanche 开源实现。
tags:
  - 持续学习
  - Replay
  - GEM
  - ER
  - DER
  - 回放
---
# 回放方法（Replay / Memory）：GEM、ER 与经验重放

> 持续学习传统方法精读之二。核心思路：存一部分旧数据/旧表征，训练新任务时"回放"它们对抗遗忘。整理日：2026-08-12。

## 为什么回放有效

正则化方法（EWC 等）靠约束参数，但信息量有限；回放直接把旧任务数据（或近似）带回训练过程，是**当前持续学习最强的一类基线**（尤其配合蒸馏）。

## 经典方法谱系

### 1. Experience Replay（ER）朴素版
- 固定大小内存 buffer（如 500-2000 样本），新数据按 reservoir sampling 随机入队，每步从 buffer 采样与当前 batch 混合训练。
- Rolnick et al., "Experience Replay for Continual Learning", NeurIPS 2019（DeepMind）：大规模持续学习下回放简单有效，是强基线。
- 变体 **ER-Reservoir**：均匀采样保留旧分布。

### 2. GEM（Gradient Episodic Memory）
- Lopez-Paz & Ranzato 2017（DeepMind）：除存旧样本外，用**梯度投影**保证新任务更新不增加旧任务损失。
- 每次更新前检查：若新梯度与旧任务梯度方向冲突（内积为负），就把新梯度投影到与所有旧任务梯度夹角 $\le 90°$ 的子空间，再执行。
- 优点：有理论保证（旧任务损失单调不增）；缺点：求解 QP 开销大、依赖样本梯度近似。
- **A-GEM（Chaudhry et al. 2019）**：改投影为"方向修正"（只要新梯度与旧样本梯度的平均内积非负即可），开销从 $O(N^2)$ 降到 $O(N)$，效果相当。

### 3. 蒸馏类回放：LwF / DER / DER++ / BiC
- **LwF（Learning without Forgetting）**：不存数据，蒸馏旧任务输出 logits。
- **DER / DER++（Dark Experience Replay, Buzzega et al. 2020）**：把旧样本的 logits 也存进 buffer，回放时同时匹配旧 logits（蒸馏）+ 旧标签——当前 class-incremental 上的强基线。
- **BiC（Bias Correction）**：针对 class-incremental 的类别不平衡，加 bias 校正层。

### 4. 生成式回放
- 用 GAN / VAE 生成旧任务数据替代存储（如 DGR、GRaB）：不占内存但生成质量受限，已被 ER 超越。

## 评测基准与设置

- **Task-Incremental**：测试时已知任务 id（易）
- **Class-Incremental**：测试时不知任务 id，需区分所有旧类（难，ER 系基线重点）
- **Domain-Incremental**：同任务不同域
- 指标：Average Accuracy、BWT（后向迁移，负=遗忘）、FWT（前向迁移）

## 实践要点

- buffer 大小是核心杠杆：越大越接近联合训练上界
- reservoir sampling 保持旧类平衡；分类增量下按类别比例采样（class-balanced buffer）更优
- 蒸馏项权重 $\alpha$ 需调；DER++ 用 $\alpha \cdot$ 旧 logits 匹配 + $\beta \cdot$ 交叉熵

## 开源实现

- **Mammoth**（aimagelab）：ER/GEM/A-GEM/DER/DER++/BiC 等统一复现，PyTorch
- **Avalanche**（ContinualAI）：工业级框架，内置全部主流基线

## 与 TTT 的关联

TTT 推理时在线更新也怕"测试时遗忘"——回放思路（保留代表性历史表征）已被用于约束 TTT 更新步。见 [TTT 专题](ttt-index)。
