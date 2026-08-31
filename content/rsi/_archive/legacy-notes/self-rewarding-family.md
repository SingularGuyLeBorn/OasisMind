---
title: Self-Rewarding / Self-Training 家族精读
category: 论文精读
published: false
excerpt: >-
  Self-Rewarding/Self-Training 家族精读：Self-Rewarding
  LM、Self-Instruct、SPIN、STaR、Tufa Labs 的横向串联 + 共同风险（奖励塌缩）与缓解思路 + 与 RSI 的关系。
tags:
  - RSI
  - Self-Rewarding
  - Self-Instruct
  - STaR
  - 自监督
  - 奖励塌缩
---
# Self-Rewarding / Self-Training 家族精读：没有外部奖励的自进化

> RSI 专题精读。整理日：2026-08-12。综述一类"模型自己给自己反馈"的方法，串起库内零散条目。

## 一句话概括

**把"谁来给奖励"也自动化**：传统 RLHF 需要人类偏好，Self-Rewarding 系列让模型自己当裁判、自己生成改进信号，形成无外部标注的自进化闭环。

## 家族成员

### 1. Self-Rewarding Language Models（Meta 2024）
- 模型同时具备"指令执行"和"自我评估"两种能力：生成回答 → 自己打分 → 用分数做 DPO 训练。
- 关键：奖励模型不是外部训练好的，而是**主模型自己**在训练中被教会评估——奖励信号随迭代共同进化。

### 2. Self-Instruct（2022，早期奠基）
- 让模型自己生成指令+回答（种子集 → 采样 → 过滤），构造训练数据微调自己。
- 证明"无人类标注的自举"可行；是后面所有 self-training 的起点。

### 3. SPIN（Self-Play Fine-Tuning，UCLA 2024）
- 自对弈微调：模型与自己对抗，学会区分"自己生成"vs"真实数据"，收敛逼近真实分布。
- 详见库内 [SPIN 精读](spin-self-play.md)。

### 4. STaR（Self-Taught Reasoner，2022）
- 自举推理：模型先试解，过滤掉错的，用对的（含提示修正后的）继续训练——迭代提升推理能力。

### 5. Tufa Labs（库内已有条目）
- Self-Rewarding Self-Improving 实验线：详见库内 tufa-labs-self-rewarding-self-improving。

## 共同风险：奖励塌缩（Reward Collapse）

- 模型既当运动员又当裁判 → 裁判标准随模型一起漂移 → 分数通胀、自我满意但实际退化。
- 缓解思路：
  - **锚定真实分布**（SPIN 的对抗目标、STaR 用正确性过滤）
  - **保留外部验证点**（正确答案任务可程序化验证；开放式任务必须留人审）
  - **定期用冻结的"黄金裁判"校准**（防自评漂移）

## 与 RSI 的关系

- 这些都是 **Model 层、训练式、自监督**的自我进化——是 RSI 的最朴素形态（改权重，但改的是自己定的目标）。
- RSI 的进阶：把"设定目标/选择研究方向"（L4 Criterion 层）也交出去时，奖励塌缩风险急剧放大——必须配合独立监督（见 [RSI 安全视角](rsi-safety-reliability.md)）。

## 参考

- Self-Rewarding LM：arXiv:2401.10020
- Self-Instruct：arXiv:2212.10560
- SPIN：arXiv:2401.01335
- STaR：arXiv:2203.14465
- 库内关联：tufa-labs-self-rewarding-self-improving、spin-self-play、imitation-not-rlvr
