---
title: 自进化 Agent 分类法（A Taxonomy of Self-evolving Agents）
category: RSI · 综述
published: false
excerpt: >-
  Shilong Liu（2026-07）给出的自进化系统分类法：以 Model / Harness / Artifact
  三要素为坐标，把现有工作分为三层——产物（artifact）迭代优化、Harness 自改进、无黄金答案的模型学习；并辨析
  self-improving、RSI、continual learning、test-time training 等术语差异。
tags:
  - RSI
  - 自进化 Agent
  - 分类法
  - Taxonomy
  - Harness
  - Artifact
---
# 自进化 Agent 分类法（A Taxonomy of Self-evolving Agents）

> 来源：Shilong Liu 博客（2026-07-08）
> 链接：https://lsl.zone/blog/2026/a-taxonomy-of-self-evolving-agents/
> 原文另见 X：https://x.com/atasteoff/status/2074800880017342665

## 为什么要分类

Hermes Agent（自动复用技能）、RSI Lab（递归发现新算法）、NVIDIA（机器人 agentic 自进化）、Auto-research agents（科学发现）……大家都在说 self-evolving / self-improving / learning / adapting，但**说的未必是同一件事**。这篇博客给出一个坐标系把它们归位，并厘清与 continual learning、test-time training 的边界。

## 三要素框架

- **Model**：LLM 等大脑，负责响应 prompt。
- **Harness**：循环设计、记忆、工具等周边组件，把模型变成 agent。**Agent = Model + Harness**。
- **Artifact**：agent 的产出物——agent 发现的内核算法、auto-researcher 产出的论文与发现、机器人自进化系统学到的策略。

三者关系：Model + Harness → Agent → Artifact。

## 三层分类

### 1. Artifact 迭代优化（产物迭代优化）
动机最简单：用强 LLM 为复杂优化问题创造新产物。流程 = 人定目标与评估标准 → agent 反复「找改进点 → 产出新输出 → 校验是否达标」。

- **AlphaEvolve**：编码 agent 做科学与算法发现（产物=算法）。
- **Analemma AI 的 FARS**：连跑 417 小时，产出 166 篇全 AI 生成论文，成本约 18 万美元。
- **Recursive Superintelligence**：找到更优的 GPU kernel 算法。

### 2. Harness 自改进（Harness 层）
改进循环的结构、记忆、工具本身——与周星星框架的 Harness 层（近期主战场）对应，这里省略细节，见库内「周星星三层框架」笔记。

### 3. 无黄金答案的模型学习（Model 层）
模型在无参考答案下自我学习，如 self-rewarding 路线——对应 Tufa Labs《Self Rewarding Self Improving》等（见库内该论文笔记）。

## 术语辨析（原文要点）

- **self-improving agents** 通常指 Harness/Artifact 层面的迭代；
- **recursive self-improvement（RSI）** 更强调改进机制的递归性（改进自己的改进机制）；
- **continual learning / test-time training** 是在时间轴上持续适应，与「改进系统本身」有本质区别。

## 与周星星框架的对照

周星星《自进化》笔记的 **Artifacts / Harness / Model 三层** 与本文三要素高度一致，说明「Model–Harness–Artifact」已成为社区共识性的分析坐标系，可互参互补。
