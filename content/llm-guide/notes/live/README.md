---
title: LIVE · 怎么用这三份活文档
date: 2026-08-30
tags: [ops, live, llm-guide]
published: false
excerpt: 用户会重复投喂同一份 Goal prompt。上下文会被压缩。记忆以这三份文件为准。
category: LLM 指南
---

# 活文档：目标 / 计划 / 过程

用户会把 `../CURSOR-GOAL-续写提示词.md` 的 **Goal 正文**（短段）直接写进 Cursor Goal 的 objective。不要把本目录活文档或聊天总结粘进去。长规则在 `.cursor/skills/llm-guide-notes/`。聊天记录不可靠。以本目录三份文件为准。

| 文件 | 职责 | 谁改 |
|------|------|------|
| [GOAL.md](./GOAL.md) | 现在要达成什么、本轮焦点 | 波次切换时改「本轮焦点」 |
| [PLAN.md](./PLAN.md) | 下一步 3 件事 + 队列 | 每做完一件就改 |
| [PROCESS.md](./PROCESS.md) | 正在读/写/卡点 + 来源台账 | 每读一篇源、每写完一节就追加 |

**每轮对话第一条动作（在写任何笔记之前）：**

1. Read `GOAL.md`
2. Read `PLAN.md`
3. Read `PROCESS.md`（至少「此刻」和来源台账）
4. 覆盖面/讲法：Read `../trusted-sources.md`（禁止抄袭；课程不当最新）
5. 若你是 Goal 父代理：Read `../supervisor.md`，当监工派子代理
6. 需要细则时再读 `../goal-maximize-value-extreme.md`
7. 从 `PLAN.md` 的「下一步 3 件」继续，禁止从 P0 重新开始（除非 PLAN 写着还没盘点）

历史流水可追加到 `../2026-08-enrichment-log.md`。活文档保持短，才能每次都读完。
