---
title: 2 · Model 层 · 训练时自改进
date: 2026-08-30
as_of: 2026-08-30
tags: [RSI, 地图]
published: true
excerpt: 改权重的自改进：SPIN、Self-Rewarding、Tufa、SEAL、LADDER、Absolute Zero、R-Zero、ReTool、ToolRL、ToRL。OPD 只链 llm-guide，不在本章重推公式。
category: RSI
---

# 2 Model 层：训练时自改进

改的是 **模型权重**。单轮训练式自改进还不是 RSI；递归要看改完之后是否继续当改进器。

| 序号 | 专文 | 职责 |
|------|------|------|
| 01 | [SPIN 自对弈微调](./01-SPIN-自对弈微调/01-SPIN-自对弈微调.md) | 无外部奖励的分布匹配 |
| 02 | [Self-Rewarding 家族](./02-Self-Rewarding-家族/02-Self-Rewarding-家族.md) | Self-Instruct / STaR / Self-Rewarding LM；奖励塌缩 |
| 03 | [Tufa Labs 自奖励](./03-Tufa-Labs-自奖励/03-Tufa-Labs-自奖励.md) | 冻结 LLM 裁判 + GRPO；不是 RSI |
| 04 | [SEAL 自适配语言模型](./04-SEAL-自适配语言模型/04-SEAL-自适配语言模型.md) | 自己写 self-edit，内环 LoRA 改权重 |
| 05 | [LADDER 递归拆题](./05-LADDER-递归拆题/05-LADDER-递归拆题.md) | 积分变体树 + GRPO；TTRL 答完回滚；不是 RSI |
| 06 | [Absolute Zero](./06-Absolute-Zero-Reasoner/06-Absolute-Zero-Reasoner.md) | 自造 $(p,i,o)$；Coder-7B 总均 50.4；解释器在墙外 |
| 07 | [R-Zero 挑战者解题器](./07-R-Zero-挑战者解题器/07-R-Zero-挑战者解题器.md) | 两只克隆 co-evolve；4B 数学 +6.49；多数票会脏；Iter 4 塌 |
| 08 | [ReTool 代码解释器 RL](./08-ReTool-代码解释器RL/08-ReTool-代码解释器RL.md) | PPO 交错 CI；32B AIME2024 67.0 / 400 步；解释器在墙外 |
| 09 | [ToolRL 多工具奖励](./09-ToolRL-多工具奖励设计/09-ToolRL-多工具奖励设计.md) | GRPO 拆格式与槽位；3B BFCL 52.98；摘要 17% 不是某一格 |
| 10 | [ToRL 从基座做工具 RL](./10-ToRL-从基座做工具RL/10-ToRL-从基座做工具RL.md) | GRPO 从 Math Base；7B AIME24 greedy 43.3；不是 ReTool 67.0 |

**不要落在本章：** OPD / MOPD 推导 → [llm-guide 4.6](../../llm-guide/4-后训练/4.6-OPD/4.6-OPD.md)。本章最多说「OPD 也改权重，但是教师蒸馏，不是自对弈」。
