---
name: "agent-orchestration"
description: "子 Agent 编排与异步任务"
icon: "Sparkles"
trigger: "/agent-orchestration"
enabled: true
kind: procedural
---

# agent-orchestration

## 何时用

复杂任务拆并行/串行；后台长跑不堵主会话。

## 原则

1. 能派子就派，自己别硬扛
2. 只看子状态（`agent_inspect`），不见消息；结果唯一通道 `agent_report_back`
3. `spawn_subagent`（跑 LLM）vs `async_task_run`（纯工具后台）
4. 过程通知用 `agent_notify_parent`

## 模式

- **并行**：N 次 `spawn_subagent({ waitForResult:false })` → 立刻 return → 等 report_back 气泡
- **串行**：阶段 1 结果到了再派阶段 2
- **纯工具**：`async_task_run` + `async_task_status`（勿用 status 窥子 Agent 全文）

## 坑

| 坑 | 对策 |
|----|------|
| 派完还轮询子进度 | 结束本轮，等异步气泡 |
| `agent_inspect` 读内容 | 只能看状态 |
| 同步死等 | 默认 `waitForResult:false` |
