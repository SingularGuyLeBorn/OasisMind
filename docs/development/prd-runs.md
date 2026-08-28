# PRD:Runs 执行记录 v1.0

> 读者:实现 agent、测试机器、评审人。
> 范围:`/runs` 列表、Run 状态转移、启动 `recoverStaleRuns`。不含 ReAct 内部 phase 机（见 runLifecycle 既有测）；不含在 interrupted 行上重建 checkpoint。

## 1. 背景与目标

- 问题:服务重启后 running Run 的 ReAct 内存态已丢；页面必须如实显示「已中断」，不得假装还能接着跑。
- 目标:running 遗留标 interrupted；开着的 `/runs` 自己出现「已中断」与 hint；终态不可回退到 running。
- 已放弃:启动自动 resume 原 Run；interrupted → running 同 id 续跑。

## 2. 术语与实体定义

### 2.1 术语表

| 术语 | 定义 | 禁用同义词 |
|---|---|---|
| Run | 一次 Agent 循环的执行记录行 | Task、会话 |
| 已中断 | status=interrupted，重启未续跑 | 已暂停、已取消 |
| 等待审批 | output.phase=awaiting_human 且 status 仍 running | 挂起成功 |

### 2.2 核心实体概念卡

**Run**
- 构成:`id`、`status`、`sessionId?`、`agentId?`、`output`（含 phase）、`durationMs`
- status:`pending` \| `running` \| `success` \| `failed` \| `cancelled` \| `interrupted`
- 产生者:ReactLoop 建 running；tRPC create；消费者:`/runs`、导出
- 生命周期:见第 5 节；interrupted 是该行终态，新任务必须新 Run
- 展示规则:中文徽章；interrupted 时 `runs-interrupted-resume-hint`

### 2.3 事件/消息协议

| 事件 | 含义 | 关键字段 | 产生条件 |
|---|---|---|---|
| `run.create` | 建行 | status 默认 pending | 循环开始 / 手工 |
| `run.update` | 改状态或 output | id, status? | 快照/收口 |
| `run_updated` | UI PUSH | runId, status?, phase? | Service after*；recoverStaleRuns；awaiting_human 路径 |
| `recoverStaleRuns` | 启动扫描 | running → interrupted | 进程启动 |

### 2.4 错误原因枚举

| reason | 含义 | 用户可见文案 |
|---|---|---|
| 非法转移 | 终态回 running/pending 等 | Run 状态不能从 X 改为 Y |
| 幽灵 id | 无此行 | 更新失败 NOT_FOUND |
| 删除 | 只删记录 | 不影响 Chat 正文 |

## 3. 完成判据

- AC-1:running 遗留经 recoverStaleRuns → interrupted，success 行不动，且不自动起流
- AC-2:interrupted 再 update running 失败，行仍 interrupted
- AC-3:有 interrupted 时 `/runs` 出现 `runs-interrupted-resume-hint`
- AC-4:写点推 `run_updated`；刷新后 list 仍是 DB 状态

## 4. 可观测状态清单

| 变量 | 权属 | 来源 | 展示 |
|---|---|---|---|
| status | 后端 | DB | 徽章；run-row data-status |
| output.phase | 后端 | DB | awaiting_human →「等待审批」 |
| hint | 前端 | 筛 interrupted 或列表含 interrupted | runs-interrupted-resume-hint |
| refetchInterval | 前端 | 无筛/running/pending → 4s 否则 20s | PULL |

## 5. 状态机 + 状态×事件表

**状态维度**:Run.status × /runs 是否打开 × 是否含 interrupted

| # | 状态 | 事件 | 迁移 + 副作用 |
|---|---|---|---|
| R1 | 无行 | create running | 建 running；PUSH |
| R2 | pending | update running | running；PUSH |
| R3 | running | update success/failed/cancelled | 对应终态；PUSH |
| R4 | running | recoverStaleRuns | interrupted；PUSH；不起流 |
| R5 | success | recoverStaleRuns | 不变 |
| R6 | interrupted | update running | 拒绝；仍 interrupted |
| R7 | success | update running | 拒绝 |
| R8 | 任意 | 幽灵 update | NOT_FOUND |
| R9 | interrupted | /runs 打开（PULL） | 徽章已中断 + hint |
| R10 | 开着 /runs | 他处 create / recover | PUSH 或 PULL 出现行 |
| R11 | running + awaiting_human | 已有 loop 测 | 仍 running；phase 可查；不标 interrupted |
| R12 | cancelled（用户 abort） | 再标 success | 拒绝（若走 Service）；loop 内 aborted 强制 cancelled |

必须覆盖的通用行:
- [x] 请求失败:R8
- [x] 乱序:R6
- [x] 幽灵:R8
- [x] 刷新:list 带回 interrupted
- [x] 重启:R4 不续跑

## 6. 不变量

- INV-R1:重启不续跑原 Run。机制:recoverStaleRuns 只标 interrupted
- INV-R2:终态不可回退。机制:isAllowedRunStatusTransition
- INV-R3:写点推 run_updated。机制:RunService after* + recover 后 notifyRunUpdated
- INV-R4:hint 文案含「未续跑」，禁止教 F5

## 7. 非功能规则

- `runListRefetchMs`：忙 4000ms / 闲 20000ms
- 订阅 `subscribeUiState` 的 `run_updated`
- 无性能 P95

## 8. 黄金轨迹

- **GT-1 中断 hint**:库中有 interrupted → `/runs` 出现 `runs-interrupted-resume-hint`（`admin-live-push-mock`）
- **GT-2 他处写入**:他处 create → 开着页出现 `run-row`（同文件 PUSH）
- **GT-3 恢复扫描**:`runLifecycle` recoverStaleRuns 既有测

## 9. 边界

- 不做:checkpoint 重建；在 interrupted 行上 resume
- 不许碰:awaiting_human 注册先行；aborted 不得 success
- 隐含假设:单用户；无 Chat 时 /runs 以 PULL 兜底

## 10. 冲突取舍

如实中断 > 假装续跑；PUSH 失败不回滚 interrupted。

## 11. 验收方式

| 章节 | 测试 |
|---|---|
| 第 5 节 | `prdRunsTable.test.ts` |
| R4/R11 | `runLifecycle.test.ts` |
| GT-1/2 | `admin-live-push-mock.spec.ts` |

---

## 变更记录

| 版本 | 日期 | 变更 |
|---|---|---|
| v1.0 | 2026-08-28 | 编译实现；recover 补 PUSH；锁终态回退 |
