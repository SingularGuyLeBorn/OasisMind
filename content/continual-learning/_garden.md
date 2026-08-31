---
title: 持续学习知识库
category: 机器学习
tags: [continual-learning, test-time-adaptation, test-time-training]
published: true
excerpt: 从问题定义、方法、评测到测试时适应与长上下文测试时训练的分层知识库。
---

# 持续学习知识库

本知识库讨论模型如何在数据分布、任务或类别持续变化时吸收新信息，同时控制对旧知识的破坏。为了避免同名术语造成误读，内容分成三条相互关联但不等价的技术线：

1. **持续学习（Continual Learning, CL）**：模型按任务或数据流持续训练，核心问题是稳定性—可塑性、遗忘、资源预算与评测协议。
2. **测试时适应（Test-Time Adaptation, TTA）**：部署阶段只看到无标签目标数据，模型在线调整部分状态或参数以应对分布偏移；经典 Test-Time Training（TTT）属于这条线。
3. **长上下文测试时训练（TTT Layers / TTT-E2E）**：把模型或参数更新用作序列状态与上下文压缩机制。它借用了“测试时学习”的思想，但不是经典持续学习基准的直接替代品。

## 学习路径

- [01 基础与问题定义](./01-基础与问题定义/01-基础与问题定义.md)：先确定任务流、可用监督、任务标识、资源预算和评价目标。
- [02 方法体系](./02-方法体系/02-方法体系.md)：正则化、回放、参数隔离，以及面向基础模型的持续预训练与参数高效适配。
- [03 评测与实践](./03-评测与实践/03-评测与实践.md)：协议、指标、基准、框架和可复现实验报告。
- [04 测试时适应](./04-测试时适应/04-测试时适应.md)：经典 TTT、TENT、持续测试时适应及其安全边界。
- [05 测试时训练与长上下文](./05-测试时训练与长上下文/05-测试时训练与长上下文.md)：TTT Layers、LaCT、TTT-E2E 及与 Attention、SSM、RWKV 的边界。

## 阅读原则

- 比较方法前先核对**场景、任务标识和内存预算**；不同协议下的数字不能直接排名。
- 把论文结果写成“在某数据集、某协议和某预算下”的结论，不写成无条件定律。
- 把公司传闻、访谈推断与可复现技术事实分开。与 SSI 或 Ilya Sutskever 路线相关但无法由一手材料证实的旧稿已移入 `_archive`，不作为公共技术树证据。
- 涉及新论文时优先链接论文、项目页、官方代码和官方数据集页面。

## 知识边界

本库不把一次普通微调自动称为持续学习，也不把所有推理时计算自动称为 TTT。判断归属时至少回答：更新发生在何时、更新什么状态、使用什么监督信号、跨样本状态是否保留、如何重置、主要优化目标是什么。

## 核心入口

- [持续学习的场景与术语](./01-基础与问题定义/1.1-持续学习的场景与术语.md)
- [评测协议、指标与任务顺序](./03-评测与实践/3.1-评测协议指标与任务顺序.md)
- [经典 TTT 与自监督适应](./04-测试时适应/4.1-经典ttt与自监督适应.md)
- [TTT Layers 与 Fast Weights](./05-测试时训练与长上下文/5.1-ttt-layers与fast-weights.md)
- [TTT-E2E 与上下文压缩](./05-测试时训练与长上下文/5.3-ttt-e2e与上下文压缩.md)

## 一手综述与入口

- [Three scenarios for continual learning](https://arxiv.org/abs/1904.07734)
- [Avalanche：持续学习开源库](https://avalanche.continualai.org/)
- [Test-Time Training with Self-Supervision for Generalization under Distribution Shifts](https://proceedings.mlr.press/v119/sun20b.html)
- [Learning to (Learn at Test Time): RNNs with Expressive Hidden States](https://arxiv.org/abs/2407.04620)
