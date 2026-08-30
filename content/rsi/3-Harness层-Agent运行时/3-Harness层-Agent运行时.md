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
| 02 | [Karpathy Auto-Research](./02-Karpathy-Auto-Research/02-Karpathy-Auto-Research.md) | 只改 train.py；5 分钟 val_bpb；不是 RSI |
| 03 | [CS329A Skill 入口](./03-CS329A-Skill入口/03-CS329A-Skill入口.md) | 课程 skill 指针；不搬讲义 |
| 04 | [DGM 达尔文哥德尔机](./04-DGM-达尔文哥德尔机/04-DGM-达尔文哥德尔机.md) | 改自己的 Python；SWE-bench 20%→50%；弱 RSI 候选 |
| 05 | [STOP 自教优化器](./05-STOP-自教优化器/05-STOP-自教优化器.md) | 改进器对自己递归；基座冻结；弱模型上会掉分 |
| 06 | [Gödel Agent 自指运行时](./06-Godel-Agent-自指运行时/06-Godel-Agent-自指运行时.md) | monkey patch；公平对照只认相对 ADAS |
| 07 | [ADAS Meta Agent Search](./07-ADAS-Meta-Agent-Search/07-ADAS-Meta-Agent-Search.md) | 冻元搜下游；MGSM 53.4%；Gödel 公平对照锚点 |
| 08 | [SkillEvolver 元技能](./08-SkillEvolver-元技能/08-SkillEvolver-元技能.md) | 冻 CLI，写领域 SKILL.md；83 题 56.8%；元技能不自改 |
| 09 | [ACE Agentic Context Engineering](./09-ACE-Agentic-Context-Engineering/09-ACE-Agentic-Context-Engineering.md) | 冻 θ 写 playbook；AppWorld 42.4→59.4；合并非 LLM；不是 RSI |
| 10 | [Voyager Minecraft 技能库](./10-Voyager-Minecraft技能库/10-Voyager-Minecraft技能库.md) | 冻 GPT-4 写 JS 技能；63 种物品 / 钻石 1/3；不是式 (2) |
| 11 | [Reflexion 言语反思记忆](./11-Reflexion-言语反思记忆/11-Reflexion-言语反思记忆.md) | 冻 Actor 写句子进窗口；AlfWorld 130/134；HumanEval 91.0 / MBPP 77.1 |
| 12 | [Self-Refine 任务内迭代](./12-Self-Refine-任务内迭代/12-Self-Refine-任务内迭代.md) | 同一只 M 自评自改；均分约 +20%，数学 GPT-4 92.9→93.1；L0，不是式 (2) |

产品 harness（Claude Code / Codex / 沙箱 / MCP）→ [llm-guide 13.5.1](../../llm-guide/13-Agent/13.5-Agent应用与治理/13.5.1-IDE与Coding-Agent.md)、[13.3.4](../../llm-guide/13-Agent/13.3-Agent系统工程/13.3.4-运行时环境与沙箱.md)。
