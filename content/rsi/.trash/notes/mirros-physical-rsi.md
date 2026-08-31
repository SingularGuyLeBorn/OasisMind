---
title: MirroS · Physical RSI
category: RSI · 概念
published: true
excerpt: >-
  MirroS（社区/小红书传播）提出的 Physical RSI 概念：AI
  改进循环不止于软件训练数据，还涉及机器人/传感器/物理交互层的自我升级——本文档为概念笔记，**待核实**官方论文与项目主页。
tags:
  - RSI
  - Physical RSI
  - MirroS
  - 概念
  - 待核实
---
# MirroS Physical RSI：物理世界递归自我改进概念

> **来源**：小红书等社区讨论（MirroS 相关帖）｜ **状态**：**待核实**——未发现对齐的 arXiv/官方 GitHub 一手材料
> **勿与**：金融指标 RSI（Relative Strength Index）混淆

## 原文精读

社区语境下的 **MirroS / Physical RSI** 试图把 RSI 从「纯数字/软件自训练」扩展到 **物理世界闭环**：

- Agent 不仅合成 `train_messages.jsonl` 或改代码，还涉及 ** embodiment**：传感器标定、动作策略、硬件在环实验。
- 「Mirror」隐喻：系统在物理交互中的行为镜像为可测量信号，再反馈进下一代策略/硬件配置。
- 与 RSIBench-Data（固定 Tinker+Harbor **纯软件** post-training）形成对比轴——Physical RSI 强调 **sim2real、安全、可重复实验** 约束。

因缺少一手论文，此处**不断言**具体架构或实验数字；仅记录概念在中文社区的出现，供后续挂接官方来源。

## 方法/架构解析

若 Physical RSI 成立，.harness 必须多一层 **deterministic physics verifier**（力矩限位、碰撞、计量溯源），否则 self-improvement loop 在物理侧不可审计。可参考：

- Polaris Experiment Lab 的 SSH+metric gate（软件域）
- Code as Agent Harness 综述中的 embodied / scientific discovery 章节

**待核实清单**：官方 repo、作者机构、与 standard RSI 定义（Burns/AIDE²/Anthropic RSI 文）的关系。

### 与软件 RSI 的分界

| 维度 | Software RSI（RSIBench 等） | Physical RSI（概念） |
|---|---|---|
| 状态 | loss curve、checkpoint | 传感器、执行器、环境 |
| 风险 | 数据污染、reward hack | 人身/设备安全 |
| Verifier | Harbor、单元测试 | 物理限位、标定溯源 |

在未见一手论文前，应把 MirroS 当作**研究议程**而非已验证系统：提醒 harness 设计者「RSI 若落地到机器人，verification 层不能照搬纯软件 benchmark」。

本条目刻意保留「待核实」：避免小红书二手解读被写进知识库当作论文结论。后续若出现正式 preprint，应替换来源块并补充实验设定；若仅为营销概念，则降级为 essays 随笔而非 rsi/notes 正文。

## 补充

Physical RSI 在中文社交语境常与「具身智能自我进化」混谈，但软件 RSI 文献（RSIBench、AAR、autoresearch）几乎都不含力/扭矩/安全联锁。本笔记刻意与金融 RSI 指标区分，也区别于已发表的 software-only benchmark 结论；读者应默认**无实验证据**，直至一手论文出现。若后续核实为营销概念，应迁移至 essays 随笔并在此文 frontmatter 标记 deprecated。与软件 RSI 对照阅读时，请优先 RSIBench-Data、Polaris、AAR 等有 repo 或论文的一手来源。本概念笔记仅防止把社交媒体二手解读误写入知识库正文；待 MirroS 发布预印本或开源仓库后，应重写「原文精读」并移除待核实标记。

---

> 见微改进对照见 [OasisMind 2026-08 Harness 波改进清单](../../essays/oasis-improvements-2026-08-harness-wave.md)。
