# PRD:Chat Goal 顶栏 v1.0

> 读者:实现 agent、测试机器、评审人。
> 范围:standing goal 的暂停/继续/清除与顶栏展示。不含裁判 LLM 质量、不含 autonomous 质量门细节。

## 1. 背景与目标

- 问题:用户要能暂停自动续跑、再继续；done/exhausted 不得再被暂停成「假进行中」。
- 目标:active 可暂停；paused 可继续（重置 turnsUsed）；写点推 `goal_updated`；刷新后顶栏仍在。
- 已放弃:编排层定时器续跑；done 上再 pause；active 时再点继续重置回合。

## 2. 术语与实体定义

### 2.1 术语表

| 术语 | 定义 | 禁用同义词 |
|---|---|---|
| standing goal | ChatSession.goalState | Task、Run |
| 进行中 | status=active | 运行中（那是 Run） |
| 已暂停 | status=paused，evaluate 跳过续跑 | 已中断（Run） |

### 2.2 核心实体概念卡

**SessionGoalState**
- 构成:`mode`、`text`、`status` ∈ {active,paused,done,exhausted}、`turnsUsed`/`maxTurns`
- 产生者:setSessionGoal / 工具；消费者:ChatGoalBar、evaluateGoalAfterTurn
- 生命周期:active ⇄ paused；active → done/exhausted；clear → null
- 展示规则:仅 active/paused 显示 `chat-goal-bar`；active「进行中」+暂停钮；paused「已暂停」+继续钮

### 2.3 事件协议

| 事件 | 含义 | 关键字段 | 产生条件 |
|---|---|---|---|
| `session.pauseGoal` | 暂停 | sessionId | chat-goal-pause |
| `session.resumeGoal` | 恢复并重置 turnsUsed | sessionId | chat-goal-resume |
| `session.clearGoal` | 清除 | sessionId | chat-goal-clear |
| `goal_updated` | PUSH | sessionId, status | persistGoalPrisma |

### 2.4 错误原因枚举

| reason | 含义 | 用户可见文案 |
|---|---|---|
| 无 goal | 未设置 | pause/resume 返回 null；顶栏不渲染 |
| 终态控 | done/exhausted 上 pause/resume | goal 状态为 X，无法暂停/恢复 |
| 会话不存在 | set | 会话不存在 |

## 3. 完成判据

- AC-1:active 暂停 → paused，顶栏「已暂停」+继续钮
- AC-2:paused 继续 → active，turnsUsed=0
- AC-3:done 上 pause 抛错，状态仍 done
- AC-4:active 再 resume 幂等，不把 turnsUsed 清零
- AC-5:写点 `goal_updated`；刷新后 getGoal 仍在

## 4. 可观测状态清单

| 变量 | 权属 | 来源 | 展示 |
|---|---|---|---|
| status | 后端 | goalState | chat-goal-status data-status |
| turnsUsed/maxTurns | 后端 | DB | 「3/20」 |
| 顶栏可见 | 前端 | status∈{active,paused} | chat-goal-bar |
| refetchInterval | 前端 | 60s 兜底 | PULL |

## 5. 状态机 + 状态×事件表

**状态维度**:goal.status × 顶栏是否挂载

| # | 状态 | 事件 | 迁移 + 副作用 |
|---|---|---|---|
| R1 | 无 goal | pause/resume | null；无写 |
| R2 | active | pause | paused；清 pendingContinue；PUSH |
| R3 | paused | pause | 仍 paused（幂等） |
| R4 | paused | resume | active；turnsUsed=0；PUSH |
| R5 | active | resume | 仍 active；turnsUsed 不变 |
| R6 | done 或 exhausted | pause 或 resume | 抛错；状态不变 |
| R7 | active 或 paused | clear | null；顶栏消失；PUSH status null |
| R8 | paused | evaluateGoalAfterTurn | skip，不续跑 |
| R9 | 开着 Chat | 他处 pause | PUSH 顶栏变已暂停 |

必须覆盖的通用行:
- [x] 幽灵:R1
- [x] 乱序:R5/R6
- [x] 刷新:getGoal
- [x] 暂停不续跑:R8

## 6. 不变量

- INV-G1:paused 时 evaluate 不得 CONTINUE。机制:status!==active 则 skip
- INV-G2:done/exhausted 不可暂停或恢复。机制:pause/resume 抛错
- INV-G3:写点推 goal_updated。机制:persistGoalPrisma
- INV-G4:active 上 resume 不得清回合。机制:status===active 直接返回

## 7. 非功能规则

- 顶栏 refetchInterval 60s；订阅 subscribeUiState
- 无性能 P95

## 8. 黄金轨迹

- **GT-1 设 Goal**:`/goal …` 后顶栏出现（既有 evolving-intent-mock）
- **GT-2 暂停/继续**:表测 R2/R4

## 9. 边界

- 不做:autonomous 质量门 E2E；裁判模型正确率
- 不许碰:CONTINUE 只经 onHubRunSettled
- 隐含假设:单用户；子会话不挂本顶栏

## 10. 冲突取舍

暂停停续跑 > 误点继续清进度（仅 paused→active 清 turnsUsed）

## 11. 验收方式

| 章节 | 测试 |
|---|---|
| 第 5 节 | `prdChatGoalTable.test.ts` |
| R8 | 既有 `goalLoop.test.ts` |
| GT-1 | `evolving-intent-mock.spec.ts` |

---

## 变更记录

| 版本 | 日期 | 变更 |
|---|---|---|
| v1.0 | 2026-08-28 | 编译实现；锁终态 pause/resume；active resume 幂等 |
