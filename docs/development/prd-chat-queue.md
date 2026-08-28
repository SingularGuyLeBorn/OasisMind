# PRD:Chat 发送队列 v1.0

> 读者:实现 agent、测试机器、评审人。
> 范围:用户在**同一会话**流式未结束时继续提交的待发队列（Compose `userQueue` + DB `SessionQueueItem`）。不是子 Agent 异步任务池（那是另一张表）。

## 1. 背景与目标

- 问题:占用中再发送若直接撞车会丢字或并发双流；空闲直发若先闪「待发」会抖。
- 目标:占用中 FIFO 可见排队；空闲直发不闪待发；commit/停止进入 idle 后自动 drain 下一条。
- 已放弃:占用中默认 steer；`useEffect` 监听 queue.length 隐式 drain；先 tombstone 再起流（失败后待发蒸发）。

## 2. 术语与实体定义

### 2.1 术语表

| 术语 | 定义 | 禁用同义词 |
|---|---|---|
| 发送队列 | 本会话待发给模型的用户条目有序表 | 任务队列、async job 队列 |
| dispatching | 空闲直发：已入队但 UI 不计「待发」 | 隐身、内部队列 |
| visible | 占用/已有队/drain 中：面板可见待发 | 排队中 |
| drain | 在 idle 且未 draining 时取队首起流 | 消费、自动发送 |

### 2.2 核心实体概念卡

**ChatQueueItem（用户待发）**
- 构成:`{id, kind, text, visibility, dbId?, createdAt}`；kind ∈ {user, async-running, async-result, superior, child_notify}
- text:trim 后可空仅当有附件/asyncResult
- 产生者:enqueueMessage / DB hydrate；消费者:useChatQueueDrain
- 生命周期:入队 →（可见或 dispatching）→ drain 起流后离开本地队；失败可 merge 回潮
- 展示规则:仅 `visibility=visible` 的 user 等计入「待发 N」；折叠默认不见正文

### 2.3 事件/消息协议(全量枚举)

| 事件 | 含义 | 关键字段 | 产生条件 |
|---|---|---|---|
| 用户入队 | enqueueUserQueueItem | visibility, text | 点发送 |
| HYDRATE_DONE | 数据齐请求 drain | sessionId | 消息/队列 hydrate |
| onStreamCommitted | 进入 idle | sessionId | commit/abort-null/error-clear |
| consume/finalize/unclaim SessionQueueItem | DB 队列认领 | claimed / success | drain 路径 |
| listSessionQueueItems / SSE 合并 | PULL/PUSH 队列 | rows | 刷新、他处改队列 |

### 2.4 错误原因枚举

| reason | 含义 | 用户可见文案 |
|---|---|---|
| 空输入 | trim 空且无附件 | 不入队、无 toast |
| 500ms 同文 | 防重 | 忽略第二次 |
| 归档会话 | 禁止发送 | 「此会话已归档…」 |
| 起流失败 | begin 拒 / 409 | unclaim 后 merge 回潮，不得蒸发 |

## 3. 完成判据

- AC-1:空闲且队空且未 draining：入队 visibility=dispatching，可见待发计数=0，并立刻 drain
- AC-2:占用中入队 visibility=visible，可见计数 ≥1，不得第二路 beginStream
- AC-3:本轮进入 idle 后，队首可发条目必须自动 drain，无需再点发送
- AC-4:superior 在队首时前端不得越过
- AC-5:起流成功才 tombstone；失败必须能被 DB merge 回潮

## 4. 可观测状态清单

| 变量 | 权属 | 来源/公式 | 展示规则 | 生命周期 |
|---|---|---|---|---|
| `userQueue` | 前端 store + DB | compose | 可见子集进面板 | 会话内 |
| `visibility` | 前端推导 | decideEnqueueVisibility | dispatching 不计 N | 入队时钉死 |
| `queueDraining` | 前端 | drain 锁 | 不展示 | drain 期间 |
| `phase` | Lifecycle | 占用公式 | 决定能否 begin | 见停止 PRD |
| DB SessionQueueItem | 后端 | Prisma | 刷新水合 | 认领/删除为止 |

## 5. 状态机 + 状态×事件表

**状态维度**:占用(idle/occupied) × 队列(空/有可见/仅 dispatching) × draining × 队首 kind

| # | 状态 | 事件 | 状态迁移 + 可见值变化 + 副作用 |
|---|---|---|---|
| R1 | 任意 | 发送空文本且无附件 | 不入队 |
| R2 | 任意 | 500ms 内同一文本+附件键再发 | 忽略 |
| R3 | idle、队空、未 draining | 合法发送 | dispatching + 立刻 drain；UI 不闪待发 |
| R4 | occupied | 合法发送 | visible 入队尾；toast 可提示排队；当前流字段不变 |
| R5 | draining 或队长度>0 | 再发 | visibility=visible |
| R6 | 队首 superior | drain | pickFrontendDrainHead=null；不越过 |
| R7 | 队首 user 空正文、其后 child_notify 有正文 | drain | 跳过空 user，取 child_notify |
| R8 | occupied、队有 M2 | 本轮 commit 或 ABORT(null) 进 idle | onStreamCommitted → drain M2 |
| R9 | 已 detach 未 tombstone | 起流失败 + unclaim | mergeUserQueueFromDb 回潮 |
| R10 | 已 tombstone 的 dbId | 迟到 list 含该行 | merge 不得回潮 |
| R11 | 任意 | 刷新 | mergeUserQueueFromDb 重建待发；dispatching 项不制造假可见 |
| R12 | 任意 | 无匹配 dbId 的幽灵行删除 | 本地对应项消失；其它项不变 |
| R13 | occupied 队>0 | 点停止进 idle | 与 R8 相同：必须 drain，禁止因停止把待发蒸发 |
| R14 | 后端拒绝认领 | claimed=false | 锁释放；条目仍在；可再 drain |

必须覆盖的通用行:
- [x] 请求失败:R9/R14 回潮，不乐观删尽
- [x] 乱序:R10 迟到 list
- [x] 幽灵:R12
- [x] 取消竞态:停止 vs drain — 先释放占用再 drain（INV-8）
- [x] 断连:本地队保留，以 DB merge 为准
- [x] 刷新:R11

## 6. 不变量

- INV-Q1:INV-Send：空闲队空未 draining → dispatching；否则 visible。机制:decideEnqueueVisibility 单点
- INV-Q2:同一 session 占用中 beginStream 非 resume 拒绝。机制:Lifecycle reducer
- INV-Q3:drain 只由 INV-8 四类显式事件触发，禁止 effect 盯 queue.length
- INV-Q4:tombstone 仅 streamed 之后；机制:claim 契约测试
- INV-Q5:前端不越过 superior。机制:pickFrontendDrainHead

## 7. 非功能规则

- 入队防重 500ms（同文）
- 队列面板折叠时不见正文
- 无性能 P95（本期不做）

## 8. 黄金轨迹(≤5 条)

- **GT-1 连发**:「队列测试第一条」流式中入队第二条 → 两问两答、可见待发清零（E2E `chat-queue-mock`）
- **GT-2 空闲直发**:不闪待发 N（enqueueIdleDispatch 单测）
- **GT-3 停止后 drain**（两条磁带，禁止混称）：
  - R8 `ABORT(null)`：立即 idle 后 drain — 磁带 `golden-traces/queue-gt3-abort-then-drain.json`（不是 abort-pending）
  - 点停 abort-pending：`APPLY_USER_STOP(partialId 有值)` 期间仍 occupied、M2 不得蒸发；`UPSERT` aborted 对齐后才 drain — 磁带 `golden-traces/queue-gt3b-abort-pending-then-drain.json`
- **GT-4 起流失败回潮**:detach 无 tombstone 时 merge 恢复（queueDrainClaimRollback）

## 9. 边界

- 不做:跨会话一条全局发送队列；队列内任意重排的完整产品 PRD（已有 reorder mutation，不在本表展开）
- 不许碰:INV-8 四触发点
- 隐含假设:单用户；DB 队列为跨刷新权威

## 10. 冲突取舍

待发不丢失 > 少一次闪烁；不越过 superior > 用户后发先走。

## 11. 验收方式

| 章节 | 测试手段 |
|---|---|
| 第 5 节 | `prdChatQueueTable.test.ts` + 既有 drain/merge/rollback |
| 第 6 节 | `chatStorePbtInvariants`（numRuns≥400；命令 busy_409 / begin_rejected / abort_then_drain / abort_pending_then_drain） |
| GT-1 | 磁带 `golden-traces/queue-gt1-two-turns.json` + Playwright `chat-queue-mock.spec.ts` |
| GT-3 R8 | 磁带 `golden-traces/queue-gt3-abort-then-drain.json`：锁 `ABORT(null)` 立即 idle 后 drain；E2E `chat-queue-mock`；单测 R13。**不是** abort-pending |
| GT-3 abort-pending | 磁带 `golden-traces/queue-gt3b-abort-pending-then-drain.json`：锁点停窗口 occupied + 队未蒸发；PBT `abort_pending_then_drain` |
| GT-4 | `queueDrainClaimRollback` + PBT `busy_409` |
| 性能 AC | 本期不做 |

---

## 变更记录

| 版本 | 日期 | 变更 |
|---|---|---|
| v1.0 | 2026-08-28 | 从 Compose/drain 实现编译 |
