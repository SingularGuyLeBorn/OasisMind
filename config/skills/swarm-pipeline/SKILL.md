---
name: "swarm-pipeline"
description: "阶段工件剧本：专题深挖与 Inbox 成稿两条接力，子 Agent 写 stage 文件、父读工件不读子正文"
icon: "GitFork"
trigger: "/swarm-pipeline"
enabled: true
kind: procedural
tags: ["swarm", "stages"]
version: "0.1.0"
---
# swarm-pipeline

把一个目标拆成可接力的阶段工件（`.oasismind/stages/{stage}.md`），父 Agent 用 `swarm_stage_read` 读工件，**禁止读子会话正文**（守子 Agent 隔离铁律）。

## 只有这两条剧本

### 1. 专题深挖（research → draft）

派子 Agent 做调研，子 Agent 只写 `research.md` 阶段工件；父 Agent 用 `swarm_stage_read` 读 `research.md`，再派子 Agent（或自己）写 `draft.md`。

- `research`：子 Agent 调研，把发现/出处/未决问题写进 `stages/research.md`（用 `swarm_stage_write`）。
- `draft`：父 Agent 读 `research.md` 后，派子 Agent 起草 `stages/draft.md`，标注验收栏。

### 2. Inbox 成稿（notes → draft → review）

把一条 Inbox 收藏做成可发布草稿，三段接力。

- `notes`：子 Agent 读 Inbox 原文，提炼要点写 `stages/notes.md`（保留来源 URL）。
- `draft`：父 Agent 读 `notes.md` 后，派子 Agent 写 `stages/draft.md`（按 USER.md 文风，保留来源 URL）。
- `review`：父 Agent 读 `draft.md`，核对事实与来源，写 `stages/review.md` 验收栏（通过/打回 + 理由）。

## 规则

- 子 Agent 只写自己负责的 stage 文件，不读其它 stage 之外的子会话内容。
- 父 Agent 只用 `swarm_stage_read` / `swarm_stage_list` 读工件，**不要**读子会话消息正文。
- 每个 stage 文件用对应模板（`templates/`）起头，填验收栏再交下一棒。
- 不要做 SOP 编译器、不要 DAG；这两条剧本够用。
