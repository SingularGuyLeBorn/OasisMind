---
title: Karpathy Auto-Research 精读：单 GPU 上的自我改进研究
category: 项目
published: false
excerpt: >-
  Karpathy Auto-Research 精读：GPT-2 级单 GPU 上的 agent 科研闭环（写任务→训练→评估→迭代）；2026-08
  Karpathy 加入 Anthropic 预训练团队，Claude+auto-research 或成自训练循环实战化。
tags:
  - RSI
  - Karpathy
  - Auto-Research
  - 自我改进
  - 开源项目
  - Anthropic
---
# Karpathy Auto-Research 精读：单 GPU 上的自我改进研究

> RSI 专题精读。项目：github.com/karpathy/autoresearch（2026-03 起开源）。整理日：2026-08-12。

## 一句话概括

Andrej Karpathy 用 **AI agent 集群自动跑研究**：让模型自己提出研究任务、训练 nanochat（单 GPU 小模型）、分析结果并迭代——目标是训练出能"做研究"的模型，让模型学会自我改进。

## 项目定位与规模

- **训练对象**：GPT-2 级小模型（nanochat 级别，单 GPU 可训），不是前沿大模型。
- **工作方式**：agents 自动运行完整研究闭环——写任务、训练、评估、记录，全程无需人工干预。
- **Karpathy 自评**：「当前还不是突破性研究」——本质是在小规模验证"模型能否自动化科研流程"的可行性。
- **开源策略**：代码公开（GitHub karpathy/autoresearch），靠社区势能攒迭代。

## 关键动向：Karpathy 加入 Anthropic 预训练团队

- 2026-08 消息：Karpathy 加入 **Anthropic 预训练团队**。
- 意义：Claude + Auto-Research 方法论一旦跑通，就是**大模型自训练循环的实战化**——把"agent 做研究"从个人实验升级到前沿实验室量产。
- 与库内《When AI Builds Itself》呼应：Anthropic 内部已有 80% 代码由 Claude 写、Mythos 52x 加速，Karpathy 的加入等于补上"AI 自主科研"这一环。

## 与同类项目的路线对比

| 项目 | 规模 | 目标 | 哲学 |
|---|---|---|---|
| Karpathy Auto-Research | GPT-2 级（单 GPU） | 验证 agent 科研闭环 | 底层逐块验证、开源攒势能 |
| Adaption AutoScientist | 全尺寸前沿模型 | 自动化完整训练闭环 | 直接冲全尺寸、更激进 |
| Recursive Superintelligence | 前沿模型 | 构思/实现/验证全自动 | latent space 自我改进路线 |
| 各科研 Agent（Polaris 等） | 科研工作流 | 文献→实验→写作 | 端到端科研平台 |

## 对 RSI 的意义

Auto-Research 是 RSI 叙事里"最接近手把手示范"的开源项目：**模型自己当研究员、自己训练自己**。虽然当前只是小模型玩具规模，但它把"递归自我改进"从口号变成了可复现的代码——是理解 RSI 工程落地的绝佳起点。

## 资源

- 仓库：github.com/karpathy/autoresearch（含 discussions 中的实验进展记录）
- 讨论区：github.com/karpathy/autoresearch/discussions
- 关联：库内《RSI 行业动态速览（2026-08）》有 Karpathy 入局的行业视角
