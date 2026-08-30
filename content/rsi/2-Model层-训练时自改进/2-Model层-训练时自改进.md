---
title: 2 · Model 层 · 训练时自改进
date: 2026-08-30
as_of: 2026-08-30
tags: [RSI, 地图]
published: true
excerpt: 改权重的自改进：SPIN、Self-Rewarding、SEAL。OPD 只链 llm-guide，不在本章重推公式。
category: RSI
---

# 2 Model 层：训练时自改进

改的是 **模型权重**。单轮训练式自改进还不是 RSI；递归要看改完之后是否继续当改进器。

| 序号 | 专文 | 职责 |
|------|------|------|
| 01 | [SPIN 自对弈微调](./01-SPIN-自对弈微调/01-SPIN-自对弈微调.md) | 无外部奖励的分布匹配 |
| 02 | [Self-Rewarding 家族](./02-Self-Rewarding-家族/02-Self-Rewarding-家族.md) | Self-Instruct / STaR / Self-Rewarding LM；奖励塌缩 |
| 03 | [Tufa Labs 自奖励](./03-Tufa-Labs-自奖励/03-Tufa-Labs-自奖励.md) | 实验线；缺一手就留条 |
| 04 | [SEAL 自适配语言模型](./04-SEAL-自适配语言模型/04-SEAL-自适配语言模型.md) | 自己写 self-edit，内环 LoRA 改权重 |

**不要落在本章：** OPD / MOPD 推导 → [llm-guide 4.6](../../llm-guide/4-后训练/4.6-OPD/4.6-OPD.md)。本章最多说「OPD 也改权重，但是教师蒸馏，不是自对弈」。
