# 见微场景逐步对照（实现级）

> 给人眼验收、排障、写测用。每一微步写：你点什么 → DOM/`data-testid` → LC/CQ/MS 字段 → HTTP/tRPC → SSE 事件 → reducer action。  
> 不是 `scenarios.md`（Agent 该调什么工具），也不是剧本那一页「你应看到」。  
> 编号：剧本 S1–S35 + 旅程 A–D；混在一条里的机器拆成 S4a/S4b、S17a–c、S32a–d、S35a–d。

---

## 0. 进 `/chat` 时已经发生了什么（所有 Chat 场景的第 0 步）

打开 `http://localhost:3000/chat` 或 `/chat?sessionId=S1`。

**PULL（tRPC，经 `/api/trpc` rewrite 到 3010）**

| 调用 | 用途 |
|---|---|
| `session.list` | 左栏对话历史 |
| `session.getById` | 当前会话元信息、归档态、绑定 agentId |
| `message.listForChat` | MessageStore hydrate：`MS.messages` |
| `agent.listSessionQueueItems` | 待发队列 merge 进 `CQ.userQueue` |
| `session.getGoal` | 顶栏 Goal，无则不渲染 |
| 异步任务 list（运行栏） | 中栏派工条计数 |

**PUSH 连接（与 stream POST 不是同一条）**

- `MessageStore.watchSession(sessionId)` → `EventSource GET /api/agent/async-stream?sessionId=`
- 这条管道收：`message_upserted` / `message_deleted` / `session_run_started` / `async_delivery` / `approval_updated` / `cron_job_updated` / `goal_updated` / `session_queue_update` …
- Agent token 走另一条：`POST /api/agent/chat/stream`（`streamAgentChat`）

**第 0 步结束态（空闲已有会话）**

```
LC.phase=idle
LC.streamingContent=""
LC.liveTimeline=[]
LC.pendingAssistantMessageId=null
LC.inFlightAssistantId=null
LC.resumeClaimed=false
CQ.userQueue=[]
CQ.optimistic=[]
CQ.queueDraining=false
CQ.activeAbort=null
MS.messages = listForChat 水合结果
输入钮 data-testid=chat-send
chat-stop 个数=0
chat-queue-panel 不渲染（items.length===0）
```

INV-8 ④：hydrate 完成在 reducer 置 `drainRequested`（仅 idle），`onStreamCommitted` 同款钩子消费 → `drainAllPendingQueues`。队空则空转。

---

## S1 · 普通对话：从点发送到 F5 的每一微步

前置：第 0 步完成。输入框打「你好」。

### 微步 1 · 输入框按 Enter 或点发送

**组件**：`apps/web/components/chatInput.tsx` `handleSend`

守卫（任一成立则 return，UI 不变）：

- `text` trim 空 **且** 无图 **且** 无文章附件
- `disabled`（后端挂、归档等）
- `ocrLoading`
- `sendLockRef.current === true`（防连点）

通过后：

1. `sendLockRef=true`，`isSending=true`（钮暂时 disabled）
2. 若正在编队列项：`onCommitQueueEdit`，**不**走发送；300ms 后放锁
3. 深度研究 chip 开着且可启动：正文改写成 `/research ${text}`（本场景不走）
4. `prepareImagesForSend()`（本场景无图）
5. `onSend(text, skill, attachments)` → `chatSessionPane` → `enqueueMessage`
6. **立刻** `setInput("")` — 你看见输入框空了
7. 上键历史 `pushHistory("你好")`
8. 300ms 后 `releaseSendLock`

DOM：输入框空。此时发送钮还可能是 send（流还没 begin）。`isStreaming` 来自 LC.phase，下一微步才会变 stop。

### 微步 2 · enqueue 斜杠 / 归档 / 防重

`useChatEnqueue.enqueueMessage("你好")`

| 条件 | 动作 | UI |
|---|---|---|
| `backendDown` | return | 无 |
| `/goal` `/research` … | tRPC Goal，**不入发送队列** | toast |
| `/compact` | 改写成「请压缩当前会话上下文」再继续 | — |
| `sessionStatus==="archived"` | return | toast「此会话已归档…」 |
| `isDuplicateEnqueue`：500ms 内同一 `text+"\n"+attachmentsKey` | return | 无（第二次点击像没点） |

`ENQUEUE_DEDUP_MS=500`。`lastEnqueueRef` 记下 `{ text, at }`。

本场景：通过。

### 微步 3 · 算 visibility（INV-Send 单点）

```
occupied = isSessionRunOccupied(effectiveSessionId)
         = LC.phase ∈ {streaming, done}
draining = CQ.queueDraining
queueLength = CQ.userQueue.length
visibility = occupied || draining || queueLength>0 ? "visible" : "dispatching"
```

空闲空队：`visibility="dispatching"`。

`createUserQueueItem`：

```
{
  id: "q-{Date.now()}-{rand5}",   // 例 q-1710000000000-a1b2c
  kind: "user",
  text: "你好",
  status: "pending",
  visibility: "dispatching",
  source: "user",
  createdAt: Date.now(),
  dbId: undefined
}
```

`sessionComposeActions.enqueueUserQueueItem(sid, localItem)`

**可见待发计数**：`countVisibleQueueItems` = 只数 `visibility !== "dispatching"`。dispatching 不计。

**UI**：`chat-queue-panel` 的 `items` 是 filter 后的可见项。本步 N=0，**面板不出现**。禁止闪「待发消息 1」。

toast：仅 `showInQueue`（visible）才 toast。本步不 toast。

### 微步 4 · 写 DB 队列 + 显式 drain（INV-8 ①）

有 `effectiveSessionId` 时异步：

```
tRPC agent.createSessionQueueItem.mutate({
  sessionId, kind:"user", content:"你好", source:"user",
  attachments, skillId, skillPrompt
})
```

成功拿到 `res.data.id` → `dbId`：

- 若本地项已被 drain 走了：`deleteSessionQueueItem({ id: dbId })` 删孤儿行
- 否则 `patchUserQueue` 把该项补上 `dbId`
- `consumeRef.current(sessionId)` → `drainAllPendingQueues`

失败：仍 `consumeRef`（仅本地队）。

无 sessionId（新对话）：`sid=NEW_STREAM_KEY`，立刻 `consumeRef`，DB 等 `onSessionStart` 再补写。

### 微步 5 · drain 门卫

`drainAllPendingQueues(preferred=S1)` → `consumeQueue(S1)`

立即 return（不开流）若：

- `isSessionRunOccupied(sid)` （INV-2）
- 或 `CQ.queueDraining===true`

`pickFrontendDrainHead(userQueue)`：

- 队首 `kind==="superior"` → **返回 null**（前端不准越过）
- 否则找第一条 `user|child_notify` 且 `isFrontendDrainReady`（有 trim 正文或附件或 asyncResult，且不是 async-running）

本场景：队首就是那条 user「你好」。

然后：`setQueueDraining(sid, true)`。

### 微步 6 · 软认领 DB 行（禁止先 tombstone）

有 `task.dbId`：

```
claim = await agent.consumeSessionQueueItem({ id: dbId })
```

| claim.claimed | 动作 |
|---|---|
| false | 本地 detach + markQueueDbIdConsumed；`queueDraining=false`；return（防死循环重发） |
| true | `softClaimedDbId=dbId`；React Query `listSessionQueueItems` 从缓存抽掉该行 |

然后 `detachUserQueueItemLocal`：本地 `userQueue` 去掉该项（**尚未** `markQueueDbIdConsumed` / finalize）。

空正文无附件：tombstone+finalize 丢弃，不开流。

### 微步 7 · 乐观气泡 + beginStream

```
optimisticId = "opt-" + task.id
CQ.optimistic += { id, content:"你好", createdAt }
```

**UI**：右侧立刻出现 `user-message-bubble`（乐观）。尚无 DB id。无角标（`source=user`）。

```
runStream({
  message: formatQueueItemForLlm(task),  // 「你好」
  source: "user",
  optimisticUser: { id: optimisticId, text:"你好" },
  queueItemId: dbId,
  targetSessionId: S1,
  keepCurrentView: false,  // 当前就是 S1
  agentId: 该 session 的 agentId
})
```

`runStream` 内部：

1. 新 `AbortController`；非 resume：abort 旧 AC，`setActiveAbortController`
2. `beginStream(sid, { streamTargetUserId: optimisticId, resume:false })`

reducer `BEGIN_STREAM`：

- 源相位必须 idle；否则 return false → `begin_rejected` → drain **unclaim + restore 队列项 + 去掉乐观气泡**
- 成功：

```
LC.phase = streaming
LC.error = null
LC.connected = true
LC.liveTimeline = []
LC.lastEventId = 0
LC.streamingContent = ""
LC.streamTargetUserId = optimisticId
```

**UI**：`isStreaming=true` → 钮 `data-testid=chat-stop`，文案「停止生成」。左侧可出现流式区（尚无 token 时可能只有空 timeline）。

`sessionStorage` 立即序列化 lifecycle/compose（崩溃恢复）。

### 微步 8 · POST 开 Agent SSE

`streamAgentChat`：

```
POST {NEXT_PUBLIC_SERVER_URL}/api/agent/chat/stream
  或空基址走 Next rewrite → localhost:3010
Content-Type: application/json
body = {
  sessionId, agentId, message:"你好",
  clientMessageId: optimisticId,
  queueItemId, source:"user",
  model, config, ...buildStreamConfig
}
signal = AbortController.signal
```

**409 `SESSION_BUSY`**：抛 `SessionBusyQueuedError` → outcome `busy_queued` → drain unclaim + restore 待发。禁止当成功 tombstone。

可重试 HTTP（408/429/5xx）：最多 12 次指数退避；耗尽 `onError("连接已断开…")`。

### 微步 9 · 服务端写 user 消息

Hub `startIfNotRunning` 占会话锁（每会话一流）。已有 run → 409。

`prepareMessage` / persist 写：

```
ChatMessage {
  role:"user", content:"你好", source:"user",
  id: 可能沿用 clientMessageId 或新 cuid
}
```

`MessageService.afterCreate` **同栈**：

```
hub.pushExternalEvent(sessionId, {
  type: "message_upserted",
  sessionId,
  message: messageUpsertPayload(entity)  // 含 finishReason, source, attachments…
})
```

**注意**：这条走 **async-stream EventSource**，不是 chat/stream 的 token 管道。

### 微步 10 · 前端收到 user upsert

`sessionMessagesStore` `dispatch({ type:"upsert" })`：

- 同 id：field-level merge；`undefined` 字段保留旧值
- 新 id：追加并按 `createdAt` 排序
- `finishReason==="aborted"` 粘性（本场景没有）

Compose 用 `clientMessageId` / 内容对齐去掉对应 `optimistic`。

**UI**：右侧仍是同一句「你好」，从乐观换成正式气泡（INV-4：不要闪空）。testid 仍 `user-message-bubble`。

### 微步 11 · SSE `session_start`

chat/stream 事件 `session_start` `{ sessionId }`。

新对话（originSid=`NEW_STREAM_KEY`）：

- `migrateStreamSession` / `migrateComposeSession` / `migrateSessionConfig`
- 补写还没有 dbId 的队列项
- 若用户仍在新对话页：`setSessionId` + `router.replace(?sessionId=)`
- 已切走：**不抢视图**
- `session.list.invalidate`（左栏立刻出现新会话，不等回复结束）

已有会话：本事件可用来对齐 id。

### 微步 12 · `round_start` / thinking / token

| SSE event | 回调 | store |
|---|---|---|
| `round_start` | `onRoundStart(round)` | `streamRound=round`；不预插空 Thinking |
| `thinking` `{delta}` | 合入 `pendingThinkingDelta`，rAF `appendThinkingDelta(sid, delta, round)` | `liveTimeline` 同 round 的 thinking 步追加字 |
| `token` `{delta}` | rAF `appendTokenDelta` | `LC.streamingContent += delta` |

**UI**：

- thinking：时间线 Thinking 步（不是聊天气泡）
- token：左侧 `streaming-assistant-bubble` 逐字长
- **禁止**出现 `tool-pill`

rAF 合帧：每帧最多一次 `appendTokenDelta`，避免每 token 一次 React render。

流式期 sessionStorage 1.5s 节流，不是每 token stringify。

### 微步 13 · 服务端写 assistant + 推 upsert（可早于 done）

ReAct 结束 `persist` 写 assistant。`messageUpsertPayload` **必须带** `finishReason`（正常结束多为 `stop`）。

再次 `pushExternalEvent(message_upserted)`。

前端 upsert 进 MS。若 LC 仍 streaming：记 `inFlightAssistantId`（INV-4）。渲染层 **屏蔽** MessageStore 里这条，继续只画 `liveTimeline`/`streamingContent`。否则会「正式回复先出现 → done 后闪烁重建」。

### 微步 14 · SSE `done`

payload：`sessionId, content, assistantMessageId, toolCalls, tokenUsage, roundsUsed, …`

`onDone`：

1. `flushStreamNow`（未合帧的 delta 立刻写入）
2. `completeStream(content, { assistantMessageId })` → **phase=done**，`pendingAssistantMessageId=id`，`pendingAssistantContent=content`
3. 此时 **仍 occupied**（INV-2：done 也占用）。发送钮仍应是 stop，直到 commit
4. `upsertAssistantFromDone` + `tryCommitStream({ messageId, content })`
5. 匹配成功 → `COMMIT_STREAM` → **phase=idle**，清 `streamingContent`/`liveTimeline`/`pending*`/`inFlightAssistantId`
6. 无 `assistantMessageId`（空回复）：直接 `commitStream`，避免队列永久卡住
7. 去掉 optimistic（若还在）
8. `session.list.invalidate`

`matchesPending`：id 相等或（无 id 时）content 匹配。

### 微步 15 · onStreamCommitted → drain（INV-8 ②）

Lifecycle 进入 idle 通知监听者。`chat.tsx` 用 **唯一** `queueMicrotask` 调 `drainAllPendingQueues(committedSid)`（store dispatch 栈内再入队不安全）。

本场景队空：consumeQueue 立刻 return。

`queueDraining` 在 runStream 的 finally 已设 false。INV-8 竞态兜底：若 commit 发生在 promise resolve 前、当时 draining 仍 true，finally 后再扫一次队。

**UI**：

- `streaming-assistant-bubble` 个数 → 0
- `assistant-message-bubble` 1 条，正文「你好」的回复
- `chat-send` 可见，`chat-stop` 个数 0
- 无 `chat-queue-panel`
- 无 `tool-pill`

### 微步 16 · F5

浏览器卸载：AC abort。服务端 run 若已 completed，stop 无意义。

再进页 = 第 0 步 PULL。`MS` 里 user+assistant 还在。`finishReason` 不是 aborted。不重跑 LLM。不冒工具条。

`message_upserted` **不进** hub 重放（避免刷新刷出旧 upsert）；`session_queue_update` 等会重放。

### 微步 17 · 新对话再回来

点左栏新对话：`effectiveSessionId` 变。A 的 LC/CQ/MS 切片保留。B 的 begin **不** `BEGIN_STREAM(A)`。回 A：读 store，禁止 `listForChat.invalidate` 整页替换当切回。

### S1 不变量清单

- INV-1 done→idle 只经 commitStream；COMMIT 从 streaming 直跳 → reducer 拒绝 + dev console.error
- INV-2 occupied 拒二次 beginStream
- INV-3 occupied 时 BEGIN 不得清过渡 UI
- INV-4 一条 assistant 同一时刻一个渲染源
- INV-8 drain 只许四个显式事件，禁止 effect 盯 queue.length
- 手打右侧无角标
- 空闲直发不闪待发

### S1 怎么测

| 层 | 文件 | 钉什么 |
|---|---|---|
| reducer | `chatStoreInvariants.test.ts` | INV-2 二次 begin false；多会话隔离 |
| PBT | `chatStorePbtInvariants.test.ts` | 随机命令仍保持 occupied/idle 规则 |
| E2E | `chat-mock.spec.ts`「普通问候不触发工具」 | 发「你好」→ 1 条 assistant，`tool-pill` count 0，正文含 Mock LLM |
| eval | `evals/golden/G06-idle-chat.json` | Agent 不调工具 |

断言示例（E2E）：

```
sendChatMessage(page, "你好")
waitForStreamingComplete(page)
countAssistantMessages === 1
getByTestId("tool-pill").count() === 0
getByTestId("chat-send") visible
getByTestId("chat-queue-panel") 不存在或待发 N 不出现
```

测入口：事件磁带 `apps/web/lib/__tests__/golden-traces/`（回放 `chatStoreGoldenTraces.test.ts`）；PBT `chatStorePbtInvariants.test.ts`；点停 E2E `e2e/scenario-product-gaps-mock.spec.ts`（含 stop HTTP 非 2xx）；队列 E2E `e2e/chat-queue-mock.spec.ts`。

---

## S2 · 同步工具：在 S1 的 streaming 里多出来的微步

微步 1–11 同 S1。差别从 LLM 决定 tool_call 开始。**整段仍在一次 `phase=streaming`。**

### 微步 T1 · `tool_preparing`

SSE `tool_preparing` `{ round, tools:[{ toolCallId, name, argsChars }] }`

前端：`flushStreamNow`；`moveStreamingContentToTimeline(round)`（已流出的草稿进时间线 content 步）；为每个 toolCallId 插或补 `status:"preparing"` 的 tool 步。已 running/done 的不要打回 preparing。

**UI**：可出现工具条雏形。无绿点。

### 微步 T2 · `tool_start`

SSE `tool_start` `{ toolCallId, name, args, round }`

`onToolStart`：再 `moveStreamingContentToTimeline`；`__reflection__` 还要 `discardStreamFlush` + `clearStreamingContent`（反思拒稿不得像终稿）。

update 该 tool 步：`status:"running"`，`startedAt`，真实 args。

**UI**：`data-testid=tool-pill` `data-tool=web_search`（界面可显示 WebSearch）。脉冲、「运行中」。**禁止绿点、禁止红「失败」、禁止耗时 hint**（hint 只在 end）。

### 微步 T3 · 服务端执行工具

native/MCP。结果回灌同一轮 messages。可进 Task 池排队（`queued`→`running`）——那是 `asyncJobs.maxConcurrent`，**仍是同步语义**：父流不 idle，结果走 tool return，不进投递队列。

长结果 spill 到 `data/tool-results/…`，SSE `result` 是截断/瘦卡。

### 微步 T4 · `tool_end`

SSE `tool_end` `{ toolCallId, name, result, round, hint }`

`hint = formatToolResultHint(result)`。落盘时 hint 类似「已落盘 · N 字」。失败：红 + 失败文案。

**UI 成功**：绿点 + hint，**不含**「失败」。  
**UI 失败**：红点 + 红「失败」，无绿。

工具 JSON **不成** `user-message-bubble`。

### 微步 T5 · 下一 round

`round_start` round=2。可能再 thinking + token 写最终左气泡。然后同 S1 微步 13–15。

### 微步 T6 · F5

`buildTimelineFromStored` 从 assistant 的 `toolCalls`/`toolResults` 重建时间线。status 已是 done/error。**不会**再 POST 搜索。

### 测

`chat-mock.spec.ts`「触发 web_search」：发「搜索 OasisMind 并一句话介绍」→ `tool-pill[data-tool=web_search]` → hint「已落盘」→ assistant 含「OasisMind 是一个本地优先」。  
`chat-tool-hint.spec.ts` 钉 hint 脸。

---

## S3 · 同步 spawn（waitForResult=true）

在 S2 的工具链上，工具名是 `spawn_subagent`，args 含 `waitForResult:true`（或产品话术「这次同步等它跑完」）。

| 微步 | 父 LC | 子 | UI | 通道 |
|---|---|---|---|---|
| spawn tool_start | 父仍 streaming | 建子 Agent、`S_sub.parentSessionId=S_parent` | 父 pill running 很久 | 父同一条 chat/stream |
| autoRun | 挂起 | `triggerAgentRun` 写子 user 消息 source=super/manager | 子右侧「父 Agent」角标 | 子 `message_upserted`；父还没有 Async |
| 子自己 streaming | 父 occupied | 子独立 beginStream | 切到子能看到子在长字 | 子独立 POST stream |
| 完成 | 子空闲（无流 + 无子内 running/queued Task）或子提前 report_back | 系统抓最后一条 assistant 作 **tool return** | 父 pill done；**无**右侧 Async | **不**进异步投递队列 |
| 父再生成 | 同 S1 token→done→commit | — | 左侧父总结 | 父 assistant upsert |

侧栏子卡：`session_tree_updated` / `session.list` 推拉。禁止 F5 才出卡。

测：`chat-subagent-resume-mock`、`dsh-chat-ui-mock`。断言父 `Async` 角标 count 0。

---

## S4a · 异步 spawn（waitForResult=false）

| 微步 | 父 | 子 | 队列 |
|---|---|---|---|
| spawn tool_end 很快 | 工具返回派生成功 | autoRun 已开子流 | 父可 completeStream→idle |
| 用户再打字 | 走 S1/S5 | 子继续 | 父不卡 |
| 子 `agent_report_back` | — | 写投递台账 | `deliverToQueue=true` |
| `autoConsumeAsyncDelivery` CLAIM | 父若 idle：服务端起父新流 `session_run_started` | — | 前端 **不 drain** async-result |
| 前端 `handleSessionRunStarted` | `runStream({ isResume:true, streamTargetUserId })` | — | 右侧 `source=sub` + Async 角标 |
| 父再总结 | 又一轮 streaming→commit | — | 左侧新 assistant |

`agent_inspect` 不返子消息正文。`async_task_status` 完成只回元信息。

测：`spawn-async-mock`：spawn pill 出现；`async_task_status` pill count 0；父 `chat-stop` 先归零；无需 F5。

---

## S4b · async_task_run 异步投递

与 S4a 相同投递机器，没有子 Agent。

`deliverToQueue = !waitForResult`。默认 false 才叫异步。

`waitForResult=true`：同 S2 同步工具 + 池排队，**无**右侧投递。

任务状态：`queued`(queuePosition, queuedReason∈global|session|workspace|gate|lightweight) → `running` → completed/failed。

UI 左栏运行卡；中栏「后台任务 N」。`formatQueuedHint`：「第 N 位 · 因并发限制排队」。

重启：`recoverStaleAsyncJobs` 标 failed「服务重启，任务中断」，**禁止**按 retry 复活。

测：`async-task-mock`、`async-task-queue.test.ts`。

---

## S5 · 发送队列（连发）逐步

前置：S1 已 begin，A 的 `phase=streaming`，钮是 `chat-stop`。

### 点发送 B

微步 2–3：`occupied=true` → `visibility="visible"`。

toast：「已加入发送队列，当前回复结束后发送」。

`CQ.userQueue` 至少 1 条 visible。

**UI**：

- A 的流**不停**（不得第二 beginStream）
- `data-testid=chat-queue-panel` 出现
- 折叠：`chat-queue-expand` 文案「待发消息 1」「点击展开」
- DOM **没有** `chat-queue-item-*`（折叠不见正文）
- **没有** B 的 `assistant-message-bubble`

点展开 `setUserExpanded(true)`：才出现 `chat-queue-item-user`，可改/删/排序。预览 `previewText` 截断 120 字。

再发 C：`queueLength>0` 即使 A 已结束 draining 中也是 visible（R5）。待发 2。

### A commit 之后

INV-8 ② → drain 队首 B：

同 S1 微步 5–15，但 `keepCurrentView` 若你已切到别的会话则为 true。

B 结束后再 drain C。最终 user 气泡数=3，assistant=3，`chat-queue-item-user` count=0，`streaming-assistant-bubble` 0。

### 状态×事件（必须能对上测试）

见 `prd-chat-queue.md` R1–R14。单测 `prdChatQueueTable.test.ts` 逐行。E2E GT-1：`chat-queue-mock.spec.ts` 发「队列测试第一条」再 `enqueueDuringStream`「队列测试第二条」→ 两问两答。GT-3：点停后仍 drain 第二条。

superior 队首：展开文案「等待上级消息送达」。前端 `pickFrontendDrainHead=null`。

---

## S6 · 停止：每一微步

占用中点 `chat-stop` → `onStop` → `stopAgentChat(sessionId)` + `applyUserStop`。

```
POST /api/agent/chat/stop
body: { sessionId }
→ { stopped: boolean, partialAssistantMessageId: string|null }
```

服务端：`hub.getPartialAssistantMessageId` 然后 `hub.stop(sessionId)`（reason=user）。无 run 或已 completed → `stopped=false`，**前端仍必须释放占用**。

HTTP 失败：当 `partialId=null` 立刻 idle。

`applyUserStop` 路径：

| 条件 | path | LC | UI |
|---|---|---|---|
| idle | no-op | 仍 idle | 钮仍 send |
| streaming + 活 AC | `AC.abort()` | 仍 streaming，等 AbortError | 字将停 |
| streaming + 无活 AC | `ABORT_STREAM(null)` | 立刻 idle | 立刻 send |
| abort() 后 AbortError + 有 partialId | `ABORT_STREAM(id)` | phase=done abort-pending，武装 1500ms watchdog | 仍 occupied 直到 upsert |
| abort-pending + 同 id upsert aborted | tryCommit | idle | 气泡正文 + 琥珀色「已停止生成」 |

服务端：`signal.aborted` 后禁止 `persistAssistantSuccess`。upsert `finishReason=aborted`。MS 粘性：已 aborted 的 id，迟到 `stop` 或省略 finishReason 仍 aborted。

WATCHDOG `DONE_COMMIT_TIMEOUT_MS=1500`：abort-pending 超时强制 commit，防队列永久占用（store 内，不是编排层 setTimeout 赌落库）。

点停后 INV-8 ② 仍 drain（R13）：队里的 B 必须自动发。

测：`prdChatStopTable.test.ts` R1–R16；`scenario-product-gaps-mock` GT-1：慢流「请慢慢说」→ chat-stop → 「已停止生成」+ chat-send；`chat-queue-mock` 第二条点停后仍两问两答。

---

## S7a · F5 续传

流式中 F5：POST 连接断。Hub 环缓冲仍可能 running。

再进页：PULL listForChat（已落库的 user/半成品 assistant 在）。若 hub 仍有 run：`runStream({ isResume:true, resumeAfter: lastEventId })`。

`BEGIN_STREAM resume`：允许源相位 idle|streaming；done/error 拒绝。`resumeClaimed && connected` 时二次 resume 拒。

GET `/api/agent/chat/stream?sessionId=&resumeAfter=` 从 lastEventId 之后重放 token。

唯一 claim 点：`runStream` 内 `beginStream(resume)`。外层预 claim 会造成幽灵 streaming（Stop 空操作）。

测：`chat-resume-mock.spec.ts`。

## S7b · 切会话

A streaming 时切 B：不 abort A。B idle。`keepCurrentView=true` 的 drain 用 A 的 agentId，不 `setSessionId(A)`。

回 A：读 LC/MS。A 的队列在后台已 drain 则气泡已齐。

---

## S8 · 双标签

两页各 `watchSession` 同一 EventSource 参数。B 的 POST stream 只在 B 的 fetch。A 靠 **async-stream** 收 `message_upserted` + 可选 token（A 没有那条 POST，token 不一定在 A 的 chat/stream；定格靠 upsert）。

BroadcastChannel `oasismind-ui-state` 兜底 invalidate，不能替代 hub。

第二页 begin → 服务端 409 或前端 occupied 拒。

---

## S9a/b/c · 重试 / 重新生成 / 编辑

重新生成：`runStream({ regenerate:true, regenerateUserMessageId })`。先删锚点之后消息（tRPC delete 多条）→ MS `message_deleted` → 新流。UI：旧助手消失，禁止叠两条。

重试用户：`retryFromMessageId` 为该 user。删该 user **之后**全部。

编辑：取消零请求。保存助手：`message.update`。编辑用户：删尾 + enqueue 新正文。

`streamTargetUserId` 钉在真实 user id，避免 inject 的 system 气泡把 live 拽走。

测：按钮 locator 有；删尾 E2E 弱。

---

## S10 · ask_user

工具挂起 ReAct（父仍 streaming）。前端输入区上方提问卡（不是 assistant 气泡）。

提交：tRPC 回答 → waiter resolve → 同轮继续 token。卡变「已提交答复，Agent 继续中…」，选项卸载。

实现：先登记 waiter 再处理 abort，避免 abort 时 Promise 挂死。

邮件入站：同一 waiter 填入，卡上提示已收到邮件。

prd-ask-user 表测。测入口：E2E `apps/web/e2e/chat-ask-user-mock.spec.ts`。

---

## S11–S15（脸 / 角标 / 派工条 / 模型 / Goal）

**S11**：tool_end status error → 红。spill 成功 → 绿「落盘」+ 路径，DOM 无 20k。F5 `buildTimelineFromStored` 不回 running。

**S12**：`MessageSourceLabel` 读 `source` + `toolResults.subagentResult`。刷新 listForChat 仍带字段。

**S13**：`chat-dispatch-strip`。N=非终态 Task。0 则组件 return null。点开左栏运行。`task_updated`。

**S14**：`chat-model-menu-trigger` → `chat-model-menu` → `chat-model-option-{id}`。下一轮 `buildStreamConfig` 带新 model。历史气泡不迁 session。本地空：未连接文案，不是无限 Thinking。测 `chat-model-menu-mock`。

**S15**：`session.setGoal` `{ text, mode, startNow }`。`notifyGoalUpdated`。pause 仅 active；resume 仅 paused；active 再 resume 不清 turnsUsed；done/exhausted 抛错。子会话不挂栏。prd-chat-goal。

斜杠 `/goal pause|resume|clear|status` 在 enqueue **提前 return**，不入发送队列。

---

## S16 · 审批逐步

1. 工具执行前 `approvalGate`：建 Approval pending，**不**执行 git/删。
2. Chat pill 停在 awaiting，不得绿。助手文案去 `/approvals`。队列 `queuedReason=gate`。
3. `approval_updated` → 开着的 `/approvals` `subscribeUiState` 出卡。短轮询兜底。
4. 「批准并执行」tRPC → 非法转移锁 → 执行原命令 → Chat 同轮 tool_end done。
5. 「拒绝」→ 无副作用；助手收尾。
6. `/runs` 可见等待审批。

TTL 过期：`expired` + 同一 PUSH。prd-approval。测 `chat-approval-mock`、`admin-live-push-mock`。

---

## S17a/b/c · Cron / Tasks / Runs

**fire**：占用锁 `isJobOccupied = 临界区 ∪ sessionToCron`。双 fire 拒。写 cron 会话消息 `source` 节律 → Chat 右侧角标。`notifyCronJobUpdated` 推**全部主会话**。

开着 `/cron`：卡片 lastRun 自己变。不用 F5。

重启：cron running → failed；Run → interrupted + hint「未续跑」。终态禁回 running。

测：`admin-live-push-mock`、`chat-heartbeat-mock`、prd-cron/runs。

---

## S18–S23 知识库（写点与 Chat 不同，推拉相同）

**S18**：`post.create` → FileSync 写 `content/{garden}/{slug}.md` + Prisma。按钮创建中。草稿 localStorage。自动保存 500ms 节流 2s 防抖 update。禁 write_file 写 posts。测 blog-smoke、G02。

**S19**：`selection-explain-btn` → panel。tRPC explain。不 update post。F5 面板没了。只读页无按钮。

**S20**：`editor-polish-open` / 划选。complete 出预览。拒绝：缓冲丢弃。接受：只写选区 → 自动保存。测 editorAgentComplete。

**S21**：`related-posts`。空则不渲染（不是 empty 一排未命名）。`related-post-link` 真 slug。

**S22**：`createFromChat` 用消息 id。三模式。`published ?? false`。成功打开真文。

**S23**：`inbox_list` / `inbox_distill`。已蒸馏+`distilledPostId` 幂等。`inbox_updated`。prd-inbox-distill。

---

## S24–S27 / A–D

能力向 = S2/S4 工具链 + 产品禁令：

- S24：必须有 `video_transcript`；禁止 screenshot 编台词；长任务 S4b
- S25：`browser_login_status` → `platform_login` → `read_article`；禁止 screenshot+vision 当读文
- S26：无压图页；`piclite-compress`；禁 TinyPNG
- S27：`article_material_pack` → `article_video_compose`；禁 write_file 进 algo-viz

旅程 A–D 只规定顺序，规则仍是上面的机器。重启不续跑是 D 的硬验收。

---

## S28–S35 身份与多模态

**S28**：切会话 = 换 `effectiveSessionId` + PULL。不把 A 的 MS 画进 B。AgentTreeSelect 未挂 Chat。无会话子灰。

**S29**：换 `workspaceId` + `resetSession`。人不在新空间 → 该空间主 Agent 新会话，旧气泡不搬家。新建空间应 PUSH 进下拉。

**S30**：QQ = 绑定 agent+workspace。`send_qq_*` 只在该工具集。通道页无 SSE，5s/10s 轮询。

**S31a**：Gateway 写消息 + 可能自动跑助手（与手打争同一会话锁）。开着 Chat 靠 upsert。角标「来自 QQ」。白名单空=拒。

**S31b**：`send_qq_text` 等。openid。账本防重。progress vs answer。Markdown 不得原样出站。

**S32a**：麦克风 → 本地 Web Speech → `setInput`，不 `onSend`。

**S32b**：耳机停顿 → `voiceSendRef` → `onSend`（无 OCR）。答完本地 TTS。隐藏麦克风。

**S32c**：喇叭本地 TTS，不写库。一次一条。

**S32d**：服务端 CosyVoice 工具。没密钥必须红。

**S33**：`pendingImages` → OCR 蒙在缩略图 → enqueue attachments。Chat `accept=image/*`。F5 图走消息 attachments。

**S34**：无 video 附件类型。负向。

**S35a**：附件框选不了 docx。

**S35b**：`/files` accept pdf/zip/txt/图。

**S35c**：`write_file` 相对 Workspace。

**S35d**：花园必须 `post_*`。

---

## 两条 SSE 不要混

| 管道 | 方法 | 事件 | 谁用 |
|---|---|---|---|
| `/api/agent/chat/stream` | POST 开跑 / GET 续传 | session_start, round_start, thinking, token, tool_*, done, error | 本轮 token 与工具过程 |
| `/api/agent/async-stream` | GET EventSource | message_upserted, message_deleted, session_run_started, 管理页 PUSH… | MessageStore 真相、跨标签、autoConsume 起流 |

写库必须推 upsert。done 只给正在消费 agent 流的订阅者。刷新后真相以 listForChat + upsert 为准。

---

## drain 四触发点（INV-8）——再发现第五个 effect 就是补丁

1. 用户入队（enqueue 末尾 consumeRef）
2. onStreamCommitted（idle）
3. 切会话完成（同一事件处理内同步 drain）
4. HYDRATE_DONE（消息/队列/sessionStorage）

禁止：`useEffect(() => drain(queue.length))`。
)
