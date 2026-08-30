---
title: 3 · Harness 层 · Agent 运行时
date: 2026-08-30
as_of: 2026-08-30
tags: [RSI, harness, 地图]
published: true
excerpt: 改循环、工具、记忆、验证门控。产品级 coding agent 细节在 llm-guide 第 13 章。
category: RSI
---

# 3 Harness 层：Agent 运行时

改的是 **模型外面那圈**。基座可以冻结。把「会写 skill」说成 RSI，先过第 1 章术语。

| 序号 | 专文 | 职责 |
|------|------|------|
| 01 | [Argus Verification-Gated](./01-Argus-Verification-Gated/01-Argus-Verification-Gated.md) | 生成 ≠ 入库；SWE-Bench Pro 约 78% 对 59%；成熟窗口 −21% token（观测） |
| 02 | [Karpathy Auto-Research](./02-Karpathy-Auto-Research/02-Karpathy-Auto-Research.md) | 单卡科研闭环 |
| 03 | [CS329A Skill 入口](./03-CS329A-Skill入口/03-CS329A-Skill入口.md) | 课程 skill 指针；不搬讲义 |
| 04 | [DGM 达尔文哥德尔机](./04-DGM-达尔文哥德尔机/04-DGM-达尔文哥德尔机.md) | 改自己的 Python；SWE-bench 20%→50%；弱 RSI 候选 |
| 05 | [STOP 自教优化器](./05-STOP-自教优化器/05-STOP-自教优化器.md) | 改进器对自己递归；基座冻结；弱模型上会掉分 |
| 07 | [ADAS Meta Agent Search](./07-ADAS-Meta-Agent-Search/07-ADAS-Meta-Agent-Search.md) | 冻元搜下游；MGSM 53.4%；Gödel 公平对照锚点 |

产品 harness（Claude Code / Codex / 沙箱 / MCP）→ [llm-guide 13.5.1](../../llm-guide/13-Agent/13.5-Agent应用与治理/13.5.1-IDE与Coding-Agent.md)、[13.3.4](../../llm-guide/13-Agent/13.3-Agent系统工程/13.3.4-运行时环境与沙箱.md)。
