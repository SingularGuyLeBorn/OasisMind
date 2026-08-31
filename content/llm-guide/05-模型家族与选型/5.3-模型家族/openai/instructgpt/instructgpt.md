---
title: "InstructGPT：监督微调、偏好建模与强化学习"
category: "模型家族与选型"
tags: ["openai", "instructgpt", "rlhf", "alignment"]
published: true
as_of: "2026-09-01"
excerpt: "严格按 InstructGPT 论文区分实验流程、模型尺寸、标注者偏好与产品身份。"
---

# InstructGPT：监督微调、偏好建模与强化学习

## 定位

2022 年 InstructGPT 论文公开了把人工示范、偏好排序和强化学习串起来的三阶段实验流程。它没有开放完整标注数据、模型权重和训练环境，因此这里讨论的是论文范式，不把它称为端到端可复现配方。它也不是一个长期稳定的 API 模型 ID，不能直接等同 ChatGPT。

## 论文中的训练流程

1. 用标注者示范对 GPT-3 做监督微调（SFT）。
2. 收集同一提示下多个候选回答的偏好排序，训练 6B 奖励模型（RM）。
3. 用 PPO 优化策略，并用与初始 SFT 策略的 KL 惩罚限制漂移；`PPO-ptx` 还混入预训练分布的梯度。

论文评估了 1.3B、6B 和 175B 策略。常被引用的“1.3B InstructGPT 胜过 175B GPT-3”只适用于论文指定的人类偏好比较，不能推广为所有能力、成本或安全维度都更强。

## 证据边界

- 标注者来自特定招募与筛选流程；其偏好不是普遍价值的无偏估计。
- PPO、奖励模型和 KL 项是该论文披露的实验做法，不应套到未公开训练配方的 GPT-4、o 系列或 GPT-5。
- 论文报告降低若干有害/失真行为，但没有证明模型“完成对齐”或消除分布外风险。

## 一手来源

- [原论文：Training language models to follow instructions with human feedback](https://arxiv.org/abs/2203.02155)

[← 返回 OpenAI 家族](../openai.md)
