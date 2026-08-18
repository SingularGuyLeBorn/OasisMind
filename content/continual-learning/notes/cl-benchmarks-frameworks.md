---
title: 持续学习：基准与开源框架（Avalanche / Mammoth / 指标）
category: 持续学习传统方法
published: true
excerpt: >-
  持续学习评测与框架精读：Task/Class/Domain-IL
  三场景、常用数据集（Split-CIFAR/CORe50/WILDS）、指标（ACC/BWT/FWT）、Avalanche 与 Mammoth
  开源框架、实验注意事项。
tags:
  - 持续学习
  - 评测
  - Avalanche
  - Mammoth
  - 基准
---
# 持续学习评测基准与开源框架：Avalanche / Mammoth / 指标

> 持续学习传统方法精读之四。整理日：2026-08-12。

## 三场景分类（van de Ven & Tolias 2019）

| 场景 | 测试时是否知道任务 id | 典型评测 |
|---|---|---|
| Task-Incremental（Task-IL） | 知道 | Split-MNIST 5 任务、Split-CIFAR-100 |
| Class-Incremental（Class-IL） | 不知道，需区分所有旧类 | CIFAR-100-Superclass、ImageNet-1k 子集 |
| Domain-Incremental（Domain-IL） | 不区分任务，同标签集换域 | Permuted-MNIST、Rotated-MNIST、CORe50 |

Class-IL 最贴近真实（模型要认识所有见过的类），也最难——是 2020s 评测主流。

## 常用数据集

- **Permuted-MNIST**：像素重排，20 任务，测 Domain-IL
- **Split-MNIST / Split-CIFAR-10/100**：按类切片，测 Task/Class-IL
- **CIFAR-100 Superclass / Mini-ImageNet**：更大的 Class-IL
- **CORe50**：真实物体识别，8 个会话（benchmark 50 类 + 增量）
- **ImageNet-1k 子集 / DomainNet**：大规模/多域
- **WILDS**：真实分布偏移（医疗、卫星图、野生生物）

## 核心指标

- **Average Accuracy（ACC）**：所有任务平均测试准确率——最常用
- **Backward Transfer（BWT）**：学新任务后，旧任务准确率的变化（负=遗忘）
- **Forward Transfer（FWT）**：新任务被旧知识帮助的程度
- **Average Forgetting（AF）**：每个任务最大准确率与当前准确率之差的平均
- 联合训练上界（joint upper bound）：所有任务数据一起训练的上限，作参照

## 开源框架

### Avalanche（ContinualAI，推荐）
- 地址：github.com/ContinualAI/avalanche
- 特性：统一场景 API（scenario → strategy → benchmark）、内置 EWC/SI/LwF/replay/GEM/A-GEM/DER/PackNet/HAT 等 20+ 基线、CL 插件体系、与 PyTorch Lightning 兼容
- 教程完备，社区活跃——**入门持续学习实验首选**

### Mammoth
- 地址：github.com/aimagelab/mammoth
- 特性：聚焦 Class-IL，统一复现 ER/GEM/A-GEM/DER/DER++/BiC/GDumb 等，配置简洁、论文级基线
- 适合复现论文结果与快速对比

### 其它
- Continuum（轻量数据流库）、SEEM（在线 CL）、OpenLifelongLearning（分类+目标检测持续学习工具箱）

## 实验注意事项

- **同 seed 多跑取均值**：CL 方差大（回放采样随机性）
- **固定超参不要逐任务调**：task-aware 调参会虚高
- 报告 Class-IL 时要声明 buffer 大小与是否用了任务边界
- 关注"遗忘曲线"而不只终态 ACC

## 与 TTT 的关联

TTT 评测同样关注"分布漂移下的稳定性"；持续学习的遗忘指标（BWT/AF）可迁移到 TTT 的在线更新稳定性评测。见 [TTT 专题](ttt-index)。
