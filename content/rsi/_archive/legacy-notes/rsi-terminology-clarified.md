---
title: RSI 术语辨析：self-improving / RSI / CL / TTT 差在哪
category: 概念
published: false
excerpt: >-
  RSI 术语辨析精读：self-improving / RSI / continual learning / TTT 四词对照表（更新对象、时机、目标）+
  三要素分层 + 训练时/推理时区分 + 最易混边界（CL vs RSI、TTT vs RSI）。
tags:
  - RSI
  - 术语辨析
  - Self-improving
  - Continual Learning
  - TTT
  - 分类法
---
# RSI 术语辨析：self-improving / RSI / continual learning / TTT 到底差在哪

> RSI 专题概念精读。整理日：2026-08-12。基于 Shilong Liu 分类法（Model/Harness/Artifact）与自进化综述的术语对照。

## 一句话：别把四个词混着用

| 术语 | 更新对象 | 更新时机 | 目标 | 代表 |
|---|---|---|---|---|
| **Self-improving**（自我改进） | 泛称：模型/工具/流程 | 任何时机 | 让系统变得更好 | 泛化标签，几乎什么都算 |
| **RSI**（递归自我改进） | 深度涉及自身研发/训练/安全 | 跨代际迭代 | AI 改进 AI 自身，形成上升循环 | RSI 公司、Anthropic、SSI |
| **Continual Learning**（持续学习） | 模型权重 | 训练阶段、跨任务序列 | 不遗忘旧任务、学新任务 | EWC、Replay、GEM |
| **Test-Time Training**（TTT） | 模型权重/隐藏状态 | 推理/测试阶段 | 用当前输入自适应 | TTT-Linear、TTT-E2E |

## 关键区分点

### 1. 按"改变什么"区分（三要素框架）
- **Artifact 层**：改产出物（agent 发现的算法、写的论文）——最浅的自改进，不改变 agent 本身。
- **Harness 层**：改工具/记忆/循环设计（你的技能包、记忆库就是 harness）——改"怎么干活"。
- **Model 层**：改模型权重（SPIN、self-training、RLHF）——改"大脑本身"。
- **RSI 的激进之处**：三层全改，且改完后**用改进后的系统继续改进自己**（递归）。

### 2. 按"何时更新"区分
- **训练时**（offline）：SPIN、Self-Instruct、RLHF——模型在训练阶段自我进化。
- **推理时**（online/test-time）：TTT、Agent 在线反思——模型在干活时自我更新。
- **持续学习**：介于两者之间——按任务序列逐步更新，强调**不遗忘**。

### 3. 最容易混的边界
- **Self-improving vs RSI**：所有 RSI 都是 self-improving，但 self-improving 不一定是递归的（改一次就完了 vs 改完继续改）。
- **Continual learning vs RSI**：CL 关注"多任务记忆"，RSI 关注"改进能力的循环"；CL 是 RSI 的子组件（RSI 系统也需要持续学习不掉线）。
- **TTT vs RSI**：TTT 是"单次任务的在线自适应"，RSI 是"跨代际的能力循环"；但 Ilya 的叙事把 TTT 当作后预训练时代 RSI 的技术基础之一。

## 为什么这个辨析重要

- **避免刷屏式误用**：很多产品自称"self-improving"其实只是接了个工具（Harness 层）。
- **定位自己的实验**：你做的改进落在哪层、什么时候生效、会不会递归——决定了它离 RSI 有多远。
- **对齐视角**：递归深度越大，证据/监督必须越独立（reliability ladder），否则自改进容易自我欺骗。

## 参考

- Shilong Liu 分类法博客（lsl.zone, 2026-07）：库内 self-evolving-agents-taxonomy
- 腾讯混元 L0-L4 五级深度分类（可靠性阶梯）
- Awesome-Self-Evolving-Agents 的 Model/Experience/Co-Evolution 三分法
