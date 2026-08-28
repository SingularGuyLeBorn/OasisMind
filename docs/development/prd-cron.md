# PRD:定时节律 v1.0

> 读者:实现 agent、测试机器、评审人。
> 范围:`/cron` 管理页 + AgentCronEngine 点火 + lastRunStatus 推拉。不含心跳 heartbeat、不含 briefing 会话里 LLM 是否写出合格 spawn prompt。

## 1. 背景与目标

- 问题:节律到点或人手「立刻跑一次」必须新建 briefing 会话；开着的 `/cron` 必须自己改状态点；重启不得把上次 running 接着跑。
- 目标:启用的 job 可被点火；占用中禁止叠跑；写点推 `cron_job_updated`；刷新后 lastRun* 仍在。
- 已放弃:重启自动续跑 briefing；`fire()` 返回后立刻放重叠锁导致第二会话；直写 Prisma 不推 UI。

## 2. 术语与实体定义

### 2.1 术语表

| 术语 | 定义 | 禁用同义词 |
|---|---|---|
| 节律 | 一条 AgentCronJob | 定时任务（Tasks 页）、心跳 |
| 启用 | `enabled=true`，node-cron 已注册 | 打开、激活 |
| 暂停 | `enabled=false`，不注册、禁止 fire | 删除、取消 |
| 占用 | 本进程 `isJobOccupied`：fire 临界区或 `sessionToCron` 仍有该 job | 忙碌、loading |
| briefing 会话 | `kind=cron` 的 ChatSession，每次点火新建 | 主会话、心跳会话 |

### 2.2 核心实体概念卡

**AgentCronJob**
- 构成:`id`、`agentId`、`name`（同 agent 唯一）、`cron`（5 段）、`prompt`、`enabled`、`lastRunAt`、`lastRunStatus`、`lastSessionId`
- `lastRunStatus` 取值:`null`（从未）\| `running` \| `success` \| `failed` \| `cancelled`（删除通知用；会话 archived 回写）
- 产生者:upsert / Agent 工具 `agent_cron_set`；消费者:`/cron`、Engine.fire、list
- 生命周期:upsert 创建或按 agentId+name 覆盖；clear 删除行；重启时 running → failed
- 展示规则:卡片 `cron-job-card`；启用/暂停徽章 `cron-job-enabled`；状态点 `cron-job-run-status`

### 2.3 事件/消息协议(全量枚举)

| 事件 | 含义 | 关键字段 | 产生条件 |
|---|---|---|---|
| `agentCron.upsert` | 创建或覆盖 | agentId,name,cron,prompt,enabled | 保存节律 |
| `agentCron.setEnabled` | 启停 | id, enabled | 暂停/启用钮 |
| `agentCron.fire` | 立刻跑一次 | id | 启用态点「立刻跑一次」 |
| `agentCron.clear` | 删除 | id 或 agentId+name | 删除确认 |
| `cron_job_updated` | UI PUSH | cronJobId, lastRunStatus? | upsert/启停/删除/markCronJobRun/恢复 |
| `cron_session_started` | 侧栏/Chat | sessionId, cronJobId | fire 起流成功后推该 Agent 主会话 |
| hub `onHubRunSettled` | 回写 lastRun | sessionId | briefing 流结束 |

### 2.4 错误原因枚举

| reason | 含义 | 用户可见文案 |
|---|---|---|
| 非法 cron | 5 段过 schema 但 node-cron 拒绝 | 非法 cron 表达式：… |
| 子 Agent | 给 sub 设或 sub 执行 | 不能给子 Agent 设置 cron / 子 Agent 不允许执行 |
| 幽灵 id | 无此行 | cron 任务不存在 |
| 已暂停 | enabled=false 时 fire | 任务已暂停，请先启用再触发 |
| 重叠 | isJobOccupied | 同任务仍在执行，跳过重叠触发 |
| Hub 未就绪 | getStreamHub() 空 | StreamHub 未就绪…；lastRunStatus=failed |
| 起流 busy/duplicate | startIfNotRunning 非 started | 会话占线 / 重复起流被拒绝；lastRunStatus=failed |
| Agent 不可用 | deleted/dormant | 目标 Agent 不可用 |

## 3. 完成判据

- AC-1:启用 job fire 成功 → 新建 `kind=cron` 会话，`lastRunStatus=running`，有 `cron_job_updated`
- AC-2:占用中再次 fire → 错误「同任务仍在执行」，不建第二会话
- AC-3:暂停后「立刻跑一次」按钮 disabled；tRPC fire 抛「已暂停」
- AC-4:进程启动 `lastRunStatus=running` → failed，不自动 fire
- AC-5:开着 `/cron` 他处 upsert 后卡片出现，禁止教刷新

## 4. 可观测状态清单

| 变量 | 权属 | 来源 | 展示 |
|---|---|---|---|
| enabled | 后端 | DB | 启用/暂停徽章 |
| lastRunStatus | 后端 | DB + PUSH | 状态点 data-status |
| lastSessionId | 后端 | DB | 「打开会话」链接 |
| 立刻跑一次 disabled | 前端 | `!enabled \|\| pending` | cron-job-fire |
| refetchInterval | 前端 | running → 2s 否则 12s | 无 Chat 时 PULL |

## 5. 状态机 + 状态×事件表

**状态维度**:enabled × lastRunStatus × 本进程占用 × 页是否打开

| # | 状态 | 事件 | 迁移 + 副作用 |
|---|---|---|---|
| R1 | 无此 name | upsert 合法 cron | 建行；refresh 注册（若 enabled）；PUSH |
| R2 | 启用，未占用 | setEnabled false | enabled=false；卸注册；lastRun 不变；PUSH |
| R3 | 暂停 | setEnabled true | enabled=true；注册；PUSH |
| R4 | 启用，未占用 | fire | 新建 kind=cron；lastRun=running；起流；PUSH；主会话 cron_session_started |
| R5 | 占用（sessionToCron 仍有该 job） | fire | 错误重叠；不建第二会话；lastRun 仍 running |
| R6 | 暂停 | fire（tRPC） | 抛「已暂停」；不建会话 |
| R7 | 任意 | 幽灵 id fire | 抛「不存在」；不写库 |
| R8 | 启用，Hub 空 | fire | 已建会话；lastRun=failed；返回错误 |
| R9 | running + 占用 | hub settled 且 session 非 failed/paused/archived | lastRun=success；释放占用；PUSH |
| R10 | running + 占用 | settled 且 session=failed 或 paused | lastRun=failed；释放占用；PUSH |
| R11 | running + 占用 | settled 且 session=archived | lastRun=cancelled；释放占用；PUSH |
| R12 | 启用 | startIfNotRunning=busy 或 duplicate | lastRun=failed；释放占用；错误文案 |
| R13 | lastRun=running 且进程刚起（无占用） | recoverStaleCronJobRuns / engine.start | lastRun=failed；PUSH；**不** fire |
| R14 | 无此 name | upsert 5 段但 node-cron 拒绝 | 抛非法表达式；不建行 |
| R15 | 有行 | clear | 删除行；PUSH lastRunStatus=cancelled（通知字段）；refresh |
| R16 | 启用未占用 已 success | fire | 与 R4 同：再新建会话（上次已 settled） |
| R17 | 开着 /cron | 他处 upsert | PUSH 或 ≤12s PULL 出现 cron-job-card |

必须覆盖的通用行:
- [x] 请求失败:R7/R8/R12
- [x] 乱序:R5 后 R9 再 R16 允许第二次
- [x] 幽灵:R7
- [x] 取消竞态:R5 vs settled — 占用以 sessionToCron 为准，不是 fire() finally
- [x] 断连:无 Chat 时 PULL 2s/12s
- [x] 刷新:list 带回 lastRunStatus/lastSessionId

## 6. 不变量

- INV-C1:同 job 占用时不得第二 briefing。机制:`isJobOccupied` = `running` 集合 ∪ `sessionToCron` 值
- INV-C2:重启不自动续跑。机制:start 前 `recoverStaleCronJobRuns`，只标 failed
- INV-C3:lastRun 写点必 `cron_job_updated`。机制:`markCronJobRun` / upsert / setEnabled / clear
- INV-C4:失败不得标 success。机制:Hub 空 / start 非 started → failed；session failed/paused → failed
- INV-C5:暂停不得点火。机制:路由先拒；钮 disabled；engine 亦拒

## 7. 非功能规则

- `/cron`：`cronListRefetchMs` running 时 2000ms，否则 12000ms
- 订阅 `subscribeUiState` + `isCronAdminPushEvent`
- 无性能 P95

## 8. 黄金轨迹

- **GT-1 开着节律页**:他处 upsert → 卡片出现（`admin-live-push-mock`）
- **GT-2 暂停不可跑**:暂停后 `cron-job-fire` disabled；tRPC fire 失败
- **GT-3 收尾后再跑**:settled 后第二次 fire 得到不同 sessionId（单测）

## 9. 边界

- 不做:真到点等 24h；briefing 内 LLM 质量；给 sub 设 cron（既有权限测）
- 不许碰:kind=cron 新建会话；refresh 代际令牌
- 隐含假设:单用户；无 Chat 时 /cron 以 PULL 兜底

## 10. 冲突取舍

不叠跑 > 多次手动点「立刻跑一次」在占用期被拒；PUSH 失败不回滚已写库。

## 11. 验收方式

| 章节 | 测试 |
|---|---|
| 第 5 节 | `prdCronTable.test.ts` |
| R4/R16 点火 | `agentCron.test.ts`（含 settled 后再 fire） |
| GT-1/GT-2 | `admin-live-push-mock.spec.ts` |
| 性能 | 本期不做 |

---

## 变更记录

| 版本 | 日期 | 变更 |
|---|---|---|
| v1.0 | 2026-08-28 | 编译实现；占用锁收到 settled；重启 running→failed |
