---
title: 每日碎片：The Topological Trouble With Transformers 论文速读
category: 每日碎片
published: true
excerpt: >-
  Mozer 等（Google DeepMind，arXiv:2604.17121）：Transformer
  纯前馈架构无法真正迭代维护动态状态，状态表示越推越深最终耗尽深度；提出循环/连续思维架构分类学与 SSM、粗粒度循环方向，并给出 bank
  多义词、猜数游戏等失败案例。
tags:
  - 每日碎片
  - LLM
  - Transformer
  - 状态追踪
  - 论文
---
# 每日碎片：The Topological Trouble With Transformers 论文速读笔记

> 论文：arXiv:2604.17121（v1 2026-04-18，v4 2026-07-30）
> 作者：Michael C. Mozer（Google DeepMind）、Shoaib Ahmed Siddiqui、Rosanne Liu
> 类型：观点/综述性论文，讨论 Transformer 架构在状态追踪（state tracking）上的根本缺陷

## 一句话核心论点
Transformer 是纯前馈架构，它把所有历史信息保存在不断扩张的上下文里，但**无法真正迭代式地维护动态状态**。状态追踪（state tracking）——对反映环境演化的潜在变量做顺序更新——本质上要求循环依赖，前馈网络做不到，于是把演化中的状态表示一层层往深层堆，最终耗尽模型深度。

## 关键机制（为什么会有拓扑麻烦）
- 因果 Transformer 中，状态 s_t = f(s_{t-1}, x_t) 的整合结果必须落在比 s_{t-1} 更深的位置，因为激活只能自下而上传播。
- 每读一个新 token，状态就被"推"向更深层；序列一长，浅层拿不到当前状态，模型深度被耗尽 → 信息在浅层不可用。
- 用 Patchscopes 实验佐证：多义词 'bank' 的消歧要到第 6 层才完成，但后续 token 在第 1-5 层处理时还拿不到这个已消歧表示，于是"river bank"被误判成"money bank → ATM"。

## 经典失败案例（论文引用的真实模型输出）
1. 猜数游戏（二十问）：Gemini 3 Fast 无法维护合法区间，前后矛盾（60 lower、50 lower、51 higher）。
2. Gemini 3 Thinking 生成了显式目标数 42，却没用上它，用户猜 42 时还回 lower。
3. bank 多义词：Fred 拿钓鱼竿去 bank，模型先答"river bank 该穿靴子"，随后又说"银行有 ATM"——在多义词之间翻烧饼，且不承认理解反转。

## 对策与分类学
作者认为时间延展认知需要从"显式思维痕迹"（explicit thought traces / 外部化状态）转向"隐式激活动力学"（implicit activation dynamics），即循环架构。
他们提出一个递归/连续思维 Transformer 架构分类学，按两个轴分类：
1. 循环轴（recurrence axis）：在 depth（层间循环）还是在 step（时间步间循环）上做递归；
2. 输入 token 数与循环步数之比（粗粒度 vs 细粒度循环）。

## 未来方向（作者建议）
- 增强状态空间模型（SSM，如 Mamba 类）——把状态压缩进隐状态，天然适合顺序更新；
- 粗粒度循环（coarse-grained recurrence）——不要每个 token 都循环，在语义块/段落层面做状态更新，兼顾效率与追踪能力；
- 目标是让状态追踪更好融入现代基础模型。

## 要点速记
- Merrill & Sabharwal (2025) 证明 log n 层足以识别长度 n 的正则语言，但那是"可构造性"不是"可学习性"；实践中深度受限模型靠把状态更新合成单步函数（s_t = g(s_0, x_1..x_t)）来绕。
- 动态深度模型、显式/潜在思考能绕开深度限制，但计算和内存效率低。
- 与 LLM Memory 综述（2607.25380）呼应：都指向"显式记忆/状态 vs 前馈计算"这一核心矛盾，只是这篇聚焦架构层面。

## 对我们的意义
- 多轮对话一致性（记忆/状态维护）不是单纯 prompt 问题，是架构层面的固有短板——这解释了为何 Agent 需要外部记忆系统（memory_*）补状态。
- 未来混合架构（attention + SSM 层）+ 粗粒度循环是趋势，Agent 框架应做好"外部状态持久化"与"长上下文"的配合，而不是只堆上下文窗口。
