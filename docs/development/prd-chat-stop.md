# PRD:流式停止 v1.0

> 读者:实现 agent、测试机器、评审人。
> 本文件是可执行规格：无 TBD 行即可按第 5 节逐行写测。对应实现以仓库现状为准，不发明第二套状态机。

## 1. 背景与目标

- 问题:用户在 Chat 流式中要点停；停完必须能立刻再发；半成品必须标明不是完整答复。曾出现「库已是 aborted、SSE 漏 finishReason → 徽章永不出现」和「循环读完仍 success 落库」。
- 目标:点停后占用释放、半成品 `finishReason=aborted`、文案「已停止生成」、禁止事后假装答完。
- 已放弃:编排层 `setTimeout`/`await hydrate` 赌落库；无 AC 时只 `?.abort()` 放任幽灵 streaming。

## 2. 术语与实体定义

### 2.1 术语表

| 术语 | 定义 | 禁用同义词 |
|---|---|---|
| 占用 | Lifecycle `phase ∈ {streaming, done}`，发送钮为停止 | 忙碌、loading |
| 幽灵 streaming | `phase=streaming` 且无未 abort 的 AbortController | 假 live、卡住的 Thinking |
| abort-pending | `ABORT_STREAM` 带 partialId 后的 `phase=done`，等 MessageStore 对齐 | 半提交、待 commit |
| 用户停止 | Hub `stop(sessionId, "user")` 触发的 abort | 取消任务、kill |

### 2.2 核心实体概念卡

**本轮流（StreamLifecycle）**
- 构成:`phase` ∈ {idle, streaming, done, error}；`streamingContent`；`pendingAssistantMessageId`；`connected`；`resumeClaimed`
- 产生者:beginStream / SSE；消费者:Chat 输入钮、队列 drain、渲染层
- 生命周期:idle → streaming → done\|error → idle（INV-1：done→idle 只经 commitStream）
- 展示规则:streaming 时输入钮 `data-testid=chat-stop`；idle 时 `chat-send`

**半成品助手消息**
- 构成:`id`（stop 契约 `partialAssistantMessageId` 或落库 id）、`content`、`finishReason`
- `finishReason` 取值:`aborted`（用户停）\| `stop`（正常结束）\| `length` 等；`aborted` 对同一 `id` 终态不可被 `stop` 覆盖
- 展示规则:`finishReason === "aborted"` 时助手气泡琥珀色文案 **「已停止生成」**（禁止「已取消」「中断」等其它四字）

### 2.3 事件/消息协议(全量枚举)

| 事件 | 含义 | 关键字段 | 产生条件 |
|---|---|---|---|
| `POST /api/agent/chat/stop` | 用户点停 | sessionId → `{ stopped, partialAssistantMessageId }` | 输入钮 chat-stop |
| Hub `stop` | abort 本轮 run | reason=`user`；无 run 或已 completed → false | stop handler |
| `ABORT_STREAM` | Lifecycle 释放/等对齐 | partialAssistantMessageId, leftoverContent | applyUserStop 无活 AC，或 AbortError 路径 |
| `message_upserted` | 半成品/成功落库推前端 | **必须含 finishReason** | MessageService 写点 |
| SSE `error`（软停） | 流结束提示 | message 含停止；retryable | persistAborted 之后 |
| `session_list_changed` | 会话标回 active | sessionId | 用户停后写库 |

### 2.4 错误原因枚举

| reason | 含义 | 用户可见文案 |
|---|---|---|
| `user` / `cancel` / `session_stop` | 用户软停 | 「已停止生成」（气泡）；SSE 提示可直接发下一条 |
| stop 请求失败 | HTTP/网络失败 | 仍走 applyUserStop(partialId=null)，立即释放占用 |
| 无匹配 run | hub.stop=false | UI 仍 applyUserStop；不得假死 |

## 3. 完成判据

- AC-1:占用中点停止后，发送钮必须回到 `chat-send`，且 `chat-stop` 个数为 0
- AC-2:已落库半成品必须 `finishReason=aborted`，气泡必须出现「已停止生成」
- AC-3:`signal.aborted` 之后禁止 `persistAssistantSuccess`（不得把 aborted 写成 stop）
- AC-4:无 AC 的幽灵 streaming 点停必须立即 idle（Stop 不得空操作）
- AC-5:同一 assistant `id` 一旦 `aborted`，后续 upsert 不得改成 `stop`/`length`

## 4. 可观测状态清单

| 变量 | 权属 | 来源/公式 | 展示规则 | 生命周期 |
|---|---|---|---|---|
| `phase` | 前端 store | reducer | 决定 chat-stop / 占用 | 进 idle 清场 |
| `finishReason` | 后端返回 | DB + message_upserted | aborted → 「已停止生成」 | 消息存活期；aborted 粘性 |
| `stopped` | 后端返回 | hub.stop | 不单独展示 | 单次 stop 响应 |
| `partialAssistantMessageId` | 后端返回 | hub 预生成 id 或 null | 不展示 | 一次 stop |
| 输入钮 testid | 前端推导 | isStreaming ? chat-stop : chat-send | 见左 | 随 phase |

## 5. 状态机 + 状态×事件表

**状态维度**:Lifecycle phase × 是否有活 AC × 半成品 id（无 / pending / 已在 MessageStore）

| # | 状态 | 事件 | 状态迁移 + 可见值变化 + 副作用 |
|---|---|---|---|
| R1 | idle，无占用 | 点停止 / applyUserStop | no-op；仍 idle；发送钮不变 |
| R2 | streaming，有活 AC | applyUserStop | AC.abort()；phase 仍 streaming，留给 AbortError 路径 abortStream |
| R3 | streaming，无活 AC（含已 aborted 的 AC） | applyUserStop(partialId=null) | 立即 idle；清空 liveTimeline/streamingContent |
| R4 | streaming | ABORT_STREAM(partialId) | phase=done（abort-pending）；仍占用；武装 DONE_COMMIT_TIMEOUT_MS |
| R5 | streaming | ABORT_STREAM(null) 或 stop 请求失败当 null | 立即 idle；释放占用 |
| R6 | abort-pending | 同 id 的 assistant upsert | tryCommitStream → idle；气泡保留正文 + aborted |
| R7 | abort-pending | HYDRATE_DONE | 不得 idle；pendingId 不变 |
| R8 | abort-pending | 第二次停止且仍带同一 partialId | 仍 done；不得变 success |
| R9 | idle | 迟到 COMPLETE_STREAM / FAIL_STREAM / ABORT_STREAM | no-op |
| R10 | 任意 | 幽灵 sessionId（无 run）hub.stop | `{ stopped:false, partialAssistantMessageId:null\|残留 }`；不得抛错 |
| R11 | MessageStore 已 aborted | 迟到 upsert finishReason=stop 或省略 finishReason | 仍 aborted（粘性）；文案不变 |
| R12 | 循环已 aborted | 循环仍返回 result | persistAbortedAssistant；禁止 persistAssistantSuccess |
| R13 | 任意 | 刷新 / 再进页 | PULL listForChat；已落库半成品仍在且 aborted；不自动续写 |
| R14 | 用户停 vs 自然结束竞态 | 以 aborted 为准 | 见 R11/R12 |
| R15 | streaming | COMMIT_STREAM | 拒绝；dev console.error |
| R16 | 已 stop | 再点停止 | run 未 completed 时 hub.stop 仍可能 true（AC 再 abort 无害）；completed 后 false。applyUserStop 不得重新占用 |

必须覆盖的通用行:
- [x] 请求本身失败:悲观；stop HTTP 失败仍 abort，partialId=null
- [x] 乱序/过期事件:R9、R11
- [x] 幽灵事件:R10、R3
- [x] 取消竞态:R14，以 aborted 为准
- [x] 断连与重连:无 AC 按 R3 释放；续传见 INV-5，本期停止不自动 resume
- [x] 刷新:R13

## 6. 不变量

- INV-S1:点停后不得再把该 assistant 标成成功结束；机制:R12 服务端拒绝 success 落库 + R11 reducer 粘性 aborted
- INV-S2:无活 AC 不得保持 streaming；机制:applyUserStop 走 lifecycle ABORT
- INV-S3:COMMIT_STREAM 禁止从 streaming 直跳 idle；机制:reducer 拒绝
- INV-S4:有 partialId 时禁止用 hydrate/短定时器进 idle；机制:HYDRATE_DONE 不改 done；对齐或 DONE_COMMIT_TIMEOUT_MS 才 commit
- INV-S5:展示「已停止生成」⇔ `finishReason==="aborted"`；机制:messageUpsertPayload 带字段 + 气泡只读该字段

## 7. 非功能规则

- 无提交节流（停止必须可连点，第二次幂等）
- toast:软停不依赖 toast；徽章文案固定
- DONE_COMMIT_TIMEOUT_MS=1500：abort-pending 超时强制 commit，防队列永久占用（store 内 watchdog，不是编排层赌时序）

## 8. 黄金轨迹(≤5 条)

- **GT-1 点停主路径**:慢流「请慢慢说」→ chat-stop 可见 → 点击 → 「已停止生成」+ chat-send（E2E `scenario-product-gaps-mock`）
- **GT-2 幽灵 streaming**:restore 无 AC → applyUserStop(null) → idle
- **GT-3 对抗时序**:先 aborted upsert，再 stop upsert → 仍 aborted
- **GT-4 stop HTTP 失败**:partialId=null → 立即释放占用

## 9. 边界

- 不做:停止后自动续写同一气泡；把用户停标成 paused 可恢复
- 不许碰:三层 store 拆分；INV-1/4/8
- 隐含假设:单用户；权威在服务端 DB；前端只订 PUSH + PULL

## 10. 冲突取舍

占用释放 > 等齐半成品 id；徽章正确性 > 多显示几个 token。aborted > 迟到的 stop。

## 11. 验收方式

| 章节 | 测试手段 |
|---|---|
| 第 5 节 | `prdChatStopTable.test.ts` + `prdChatStopHub.test.ts` + `messageUpsertPayload.test.ts` |
| 第 6 节 | `chatStorePbtInvariants`（含 abort_then_drain）+ 本表粘性断言 |
| GT-1 | 磁带 `golden-traces/stop-gt1-user-abort.json` + Playwright mock：`scenario-product-gaps-mock` |
| GT-3 | 磁带 `golden-traces/stop-gt3-aborted-sticky.json` |
| GT-4 | Playwright mock：`scenario-product-gaps-mock`「stop HTTP 非 2xx」；store 表测 R5 |
| 性能 AC | 本期不做（不写假 P95） |

---

## 变更记录

| 版本 | 日期 | 变更 |
|---|---|---|
| v1.0 | 2026-08-28 | 按 agent-prd 模板从实现编译；锁 finishReason 粘性 |
