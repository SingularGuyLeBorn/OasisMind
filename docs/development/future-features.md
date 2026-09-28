# OasisMind 未来功能规划

> 详细对照（还缺什么、值得做什么、明确不做、过期文档）见 **[`worth-doing.md`](./worth-doing.md)**（2026-08-29）。  
> 施工 Goal Prompt：[`prompts/worth-doing-goal-prompt.md`](./prompts/worth-doing-goal-prompt.md)。  
> 已落地能力见 `CHANGELOG.md` 与 `design-decisions.md`。本文件只保留短索引，避免和仓库现状再漂。

---

## 已落地（勿再当未来项）

| 项 | 落点 |
|---|---|
| `session_rotate` + 双向血缘 + `/session-lineage` | `session.ts` / `sessionRotateLineage.ts` |
| Auto-Compact（micro → flush → macro） | `autoCompact` / ChatSession |
| 推拉结合（SSE + `uiStateNotify` + 短轮询 + BC） | `uiStateNotify.ts` / `uiStateChannel.ts` |
| 队列持久化与拖拽排序 | Prisma + Chat 队列 UI |
| 移动端适配 | 底栏 / Chat 叠层 / `pnpm remote` |
| 同会话对话分支 | `parentId` + `activeLeafId` + `switchBranch` |
| L1 常驻层 USER.md / AGENT.md | `pinnedMemory.ts` |
| 阶段工件工具（Markdown 接力） | `swarmStages.ts`（缺的是模板习惯，不是工具） |
| `memory_update` / 写入门 / retrieve-or-not | `memory.ts` / `memoryWriteGate` / `memoryRetrieveGate` |
| Goal `verifiedProgress` + IntentContract | `goalAudit.ts` / `intentContract.ts` |
| MCP 远程 Streamable HTTP | 已接 |

---

## 明确缓做 / 不做

| 项 | 状态 |
|---|---|
| 完整多实例（全局池 Redis、BullMQ、PG、SSE 亲和） | 缓做；`SWARM_MODE=local` 为默认 |
| DSPy/GEPA `evolve_skill` | 未做，另立；产品优先级低 |
| 多用户协作 / 插件市场 / A2A | 与单用户定位冲突 |
| 配置热更新 | 明确不做 |
| 对等群聊 Swarm、参数化记忆、容器级沙箱、会话向量库 | 理念不做 |

---

## 还值得做（摘要）

完整表与开工顺序见 [`worth-doing.md`](./worth-doing.md)。最高杠杆仍是：

1. Inbox 真同步 + 蒸馏按品味改写 + 晨间提醒  
2. 贴图默认识图、Chat 书签接到脸  
3. 过夜 Goal 人眼可核；一个阶段工件剧本  
4. 记忆精选 / Dreaming 需确认（库已经够厚）
