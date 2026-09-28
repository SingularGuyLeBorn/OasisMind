---
title: "记忆系统调研：LiveMem 内生记忆与记忆格局"
published: true
excerpt: "NatureSelect「Team Echo」的 LiveMem 论文拆解：Qwen3-4B 注意力层并联 Gated DeltaNet-2 循环记忆支路的内生记忆路线，LongMemEval 上证据逐出上下文仍高 10+ 点；并对比 Mem0/Zep/Letta/Anthropic/OpenAI 记忆格局。"
tags: ["记忆", "LiveMem", "内生记忆", "DeltaNet", "长期记忆", "Agent"]
---
# 记忆系统调研：LiveMem 内生记忆与记忆格局

> 整理自用户调研笔记（2026-08-04）。聚焦 NatureSelect「Team Echo」的 LiveMem 论文，以及当前记忆系统的整体格局。

## 一、LiveMem（Team Echo）

**"Team Echo" = NatureSelect.AI（自然选择）的研究团队**——做 AI 伴侣《EVE》的那家公司（阿里/蚂蚁投资，2026-01 融资 3000 万~4200 万美元；2025-12 发布过情感大模型 Echo-N1）。做陪伴产品需要终身记忆，这是他们投入记忆研究的直接动机。

- 论文：[LiveMem: Maintaining Memory State Continuity in Long-Running LLM Inference](https://arxiv.org/abs/2608.02515)（2026-08-03 挂出，NatureSelect + 南科大 + 西电）
- **路线：内生记忆**，和 Mem0/Zep/Letta 的外挂检索式不在同一层。在 Qwen3-4B 每个注意力层并联一条 Gated DeltaNet-2 循环记忆支路（固定容量矩阵状态，逐 token 在线「衰减→擦除→写入→读取」），主干冻结只训支路；上下文 FIFO 轮转时被逐出的内容已沉淀在记忆矩阵里，无需额外写操作
- **关键证据**：LongMemEval 上支撑证据被完全逐出上下文后，仍比无历史基线高 10+ 个百分点且只缓降不崩塌；Wiki QA / 长文 QA 两组 SOTA；论文坦承对话类不如 RAG、TTL 类不如 Context2LoRA
- **现状**：未开源（GitHub 无官方 repo），论文自述与检索式记忆互补。对工程系统是「模型侧信号」，值得跟踪开源动态

## 二、记忆系统格局一句话对比

| 系统 | 形态 | 一句话定位 |
|---|---|---|
| Mem0 | 检索式 | 生态最大，通用记忆层 |
| Zep / Graphiti | 时序知识图谱 | 时间感知的实体关系记忆 |
| Letta | OS 式分层 | 记忆即操作系统，分层管理 |
| Anthropic memory tool | 模型自管理文件式 | 让模型自己读写文件记忆 |
| OpenAI ChatGPT memory | C 端产品 | 面向用户的产品化记忆 |
| LiveMem | 内生（循环支路） | 注意力层内并联记忆矩阵，与 Titans / MemOS 同线的最新工作 |

**一句话**：LiveMem 属内生研究线（Titans/MemOS 同线）的最新工作，与检索式记忆互补，尚未开源。

## 三、对工程系统的启示

1. 内生记忆是「模型侧信号」——决定记忆能力的下限，但工程上仍要配合外挂记忆做确定性存储与检索。
2. 值得跟踪开源动态：一旦 LiveMem 类方案开源，端侧/单机长上下文 Agent 的成本结构可能变化。
3. 对话类任务 RAG 仍占优，说明「需要精确召回」的场景外挂检索式更稳；内生记忆的优势在于「不需要精确召回、只要大致记得」的场景。

## 关联阅读

- 本库《Long-Horizon 上下文管理论文合集》——上下文压缩/管理的另一条路线。
