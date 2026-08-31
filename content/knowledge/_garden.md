---
title: 强化学习与大模型工程课程知识库
description: 以算法推导、可验证实现和 CS336 课程为两条主线，学习大模型训练、系统、评测与强化学习后训练。
---
# 强化学习与大模型工程课程知识库

本库负责“课程式推导与实验”：`algorithms` 从经典策略梯度走到大模型偏好优化和 RLVR，`cs336` 围绕语言模型训练与系统课程组织笔记。稳定概念的完整百科由 `llm-guide` 承担，论文历史由 `classic-papers` 承担；本库不复制平行版本。

> 内容治理状态：正在按统一继承式编号重构。已确认的错误论文、模拟论文和概念代码已从公开树隔离；未标明验证状态的旧 Python/Notebook 只能视为教学线索，不能默认等同官方实现。

## 两条学习路线

| 路线 | 当前入口 | 学习目标 |
|---|---|---|
| 强化学习与对齐算法 | `algorithms/` | 从 Bellman、Policy Gradient、REINFORCE、PPO 到 DPO、GRPO、RLVR 与 scaling |
| CS336 课程笔记 | `cs336/` | 从 tokenizer、架构、GPU kernel、分布式训练到数据、评测和后训练 |

建议先掌握概率、MDP、策略梯度和 Transformer 基础，再进入 2025–2026 的推理强化学习方法。新算法必须先核对论文身份、版本和官方代码，再进入公开主线。

## 已完成的高风险纠错

- [DAPO](./algorithms/09_DAPO/01_Theory_Derivation.md)：正确论文为 arXiv `2503.14476`；
- [GDPO](./algorithms/17_GDPO/01_Theory_Derivation.md)：多奖励解耦归一化，不是 SteerLM；
- [GHPO](./algorithms/18_GHPO/01_Theory_Derivation.md)：难度检测与自适应真值提示，不是固定的 SFT/PPO loss 拼接；
- [RL scaling 与 ScaleRL](./algorithms/21_RL_Scaling/01_Theory_Derivation.md)：使用有界 S 形曲线，不存在旧稿虚构的“五大定律”；
- [Tricks or Traps 与 Lite PPO](./algorithms/22_Tricks_or_Traps/01_Theory_Derivation.md)：Lite PPO 是论文中的两技巧组合，不是另一篇论文；
- [张量并行](./cs336/Lecture7/Lecture7-Tensor-Parallelism.md)：已替换错误重复的零气泡流水线内容；
- [Lecture 17 GRPO](./cs336/Lecture17/Lecture17-Main.md)：PPO 概率比已改为 `exp(logπ−logπ_old)`。

## 代码资产状态

后续所有实现和 Notebook 应使用以下状态之一：

| 状态 | 含义 |
|---|---|
| `verified-reference` | 已与官方实现逐项对照，并有最小正确性测试 |
| `minimal-runnable` | 可运行，只覆盖核心公式，明确省略内容 |
| `illustrative-pseudocode` | 用于解释数据流，不承诺可训练或可复现论文 |
| `quarantined` | 论文身份或实现错误，已移出公开树 |

判断实现是否可信，至少检查概率比、停止梯度、mask、loss 聚合、奖励归一化、随机种子、训练/评测隔离和与官方版本的差异。

## 来源规则

算法名称、作者、会议、公式和实验数字以原始论文、正式会议版本、作者代码和课程官方材料为第一来源。二手教程只能帮助发现线索。对 2025–2026 预印本必须记录版本；摘要中的最高结果不能替代逐表核对。
