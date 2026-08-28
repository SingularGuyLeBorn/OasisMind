# PRD:人工审批 v1.0

> 读者:实现 agent、测试机器、评审人。
> 范围:危险工具闸门 + `/approvals` 待你点头 + Chat HITL。邮件回复 `user_replied` 只锁写点 PUSH 与转移，不测真 SMTP。

## 1. 背景与目标

- 问题:危险操作未批不能装成功；开着的 `/approvals` 与 Chat 必须自己出现新卡/状态，禁止教用户刷新。
- 目标:pending 挂着直到人批/拒/超时拒绝（超时不执行）；批后才执行；写点推 `approval_updated`。
- 已放弃:人不在场自动执行；TTL 到期当成功；execute 直写 Prisma 不推 UI。

## 2. 术语与实体定义

### 2.1 术语表

| 术语 | 定义 | 禁用同义词 |
|---|---|---|
| 审批 | 一条 Approval 记录 | 工单、ticket |
| 待你点头 | status=pending | 等待中、待办 |
| HITL | Chat 内批/拒，run 挂 awaiting_human | 弹窗确认 |

### 2.2 核心实体概念卡

**Approval**
- 构成:`id`(cuid)、`toolName`、`args`、`status`、`decidedBy`、`decidedAt`、`executedAt`、`decisionScope`
- status 取值:`pending` \| `approved` \| `rejected` \| `executed` \| `user_replied`（邮件路径）
- 产生者:approvalGate / approval.create；消费者:Chat pill、`/approvals`、execute
- 生命周期:见第 5 节转移；记录软删（executed 保留）
- 展示规则:pending「待你点头」；Chat 工具条 `data-status=awaiting_human` 未批不得绿成功

### 2.3 事件协议

| 事件 | 含义 | 关键字段 | 产生条件 |
|---|---|---|---|
| `approval_updated` | UI PUSH | approvalId, status | 创建/决策/执行/TTL/邮件 |
| `approval_resolved` | 唤醒 waiters | outcome, execResult? | 拒/过期/执行完/邮件 |
| `approval.approveAndExecute` | 批+立刻执行 | id | 页/ Chat 批准钮 |

### 2.4 错误原因枚举

| reason | 含义 | 用户可见文案 |
|---|---|---|
| PENDING_APPROVAL | 无 approvalId 建 pending | 已加入审批队列…去 /approvals |
| 仅可执行已通过 | execute 时非 approved | FORBIDDEN |
| 幽灵 id | 不存在 | 审批记录不存在 |
| 非法转移 | 如 pending→executed、rejected→approved | 审批状态不能从 X 改为 Y |
| 参数不一致 | argsMatch 失败 | 请重新发起审批 |
| TTL | 超时 | 自动拒绝，不执行；decidedBy=system-ttl |

## 3. 完成判据

- AC-1:未批准工具不得当成功（Chat 不得出现成功写入文案）
- AC-2:批准并执行后才有副作用；Chat 开着自己续，无需刷新
- AC-3:创建/批/拒/执行/TTL/邮件写点必须 `approval_updated`
- AC-4:超时只拒绝不执行
- AC-5:终态不可回退；二次 execute 拒绝

## 4. 可观测状态清单

| 变量 | 权属 | 来源 | 展示 |
|---|---|---|---|
| status | 后端 | DB | 徽章文案 |
| pendingCount | 后端 | humanTodoSummary | 页顶摘要 |
| tool pill data-status | 前端 | 时间线 | awaiting_human 非绿 |
| `/approvals` 卡片 | 后端 list | PUSH+3s/15s PULL | approval-card |

## 5. 状态机 + 状态×事件表

**状态维度**:status × 是否有 waiter × 页是否打开

| # | 状态 | 事件 | 迁移 + 副作用 |
|---|---|---|---|
| R1 | 无记录 | 危险工具无 approvalId | 建 pending；FORBIDDEN；PUSH pending |
| R2 | pending | 批准（update approved） | approved；PUSH；不执行 |
| R3 | approved | execute / approveAndExecute 后半 | 跑工具；executed+executedAt；PUSH executed；唤醒 waiter approved |
| R4 | pending | 拒绝 | rejected；PUSH；唤醒 rejected；不执行 |
| R5 | pending | TTL 到期 expire | rejected、decidedBy=system-ttl；PUSH rejected；不执行 |
| R6 | pending | 邮件原文匹配 | user_replied；PUSH；唤醒 user_replied |
| R7 | executed 或 rejected | 再 execute / 改回 pending | 拒绝；状态不变 |
| R8 | 任意 | 幽灵 id execute | NOT_FOUND；无写库 |
| R9 | pending | 直接 update executed | 非法转移，失败 |
| R10 | 已决 | 迟到 approval_resolved | waiter 已 settle 则忽略 |
| R11 | 开着 /approvals | 他处 create pending | PUSH 或 PULL 出现卡片，禁止教刷新 |
| R12 | Chat awaiting_human | 批准并执行 | 成功文案出现；pill 离开 awaiting_human |
| R13 | Chat awaiting_human | 拒绝 | 失败/拒绝文案；不得出现成功写入 |
| R14 | user_replied | 带同一 args+approvalId 再调 | 条件翻转 executed；第二路拒绝 |

必须覆盖的通用行:
- [x] 请求失败:R8；工具执行失败不标 executed（仍 approved，waiter 带 error 收尾）
- [x] 乱序:R10
- [x] 幽灵:R8
- [x] 取消竞态:TTL vs 人工批 — expire 条件写 count=0 不误报 expired（既有 wait race）
- [x] 断连:waiter 注册先行；页靠 PULL 兜底
- [x] 刷新:list/getById 仍是 DB 终态

## 6. 不变量

- INV-A1:人不在场绝不自动执行。机制:TTL 只 rejected
- INV-A2:executed/rejected 不可回退。机制:isAllowedApprovalStatusTransition
- INV-A3:所有 status 写点推 approval_updated。机制:Service after* + 条件写后 pushApprovalUpdatedUi
- INV-A4:同 args pending 去重。机制:findPendingApproval
- INV-A5:Chat 未批不得绿成功。机制:awaiting_human 至决议

## 7. 非功能规则

- `/approvals` pending 过滤时 refetchInterval 3s，否则 15s
- 订阅 `subscribeUiState`（与 Inbox 同通道）
- 无性能 P95

## 8. 黄金轨迹

- **GT-1 Chat 批准**:「审批测试写全局记忆」→ awaiting_human → 批准 → 「已按审批结果写入全局记忆」（`chat-approval-mock`）
- **GT-2 Chat 拒绝**:拒绝 → 「审批被拒绝…未写入」
- **GT-3 开着审批页**:他处 create → 卡片出现（`admin-live-push-mock`）
- **GT-4 执行后 executed**:approveAndExecute 后 getById 为 executed 且 PUSH

## 9. 边界

- 不做:真邮件投递 E2E；多用户 decidedBy
- 不许碰:waitApprovalResolution 注册先行；expire 条件写
- 隐含假设:单用户；无 Chat 标签时管理页以 PULL 兜底

## 10. 冲突取舍

不执行 > 少等一会；PUSH 失败不回滚已写库。

## 11. 验收方式

| 章节 | 测试 |
|---|---|
| 第 5 节 | `prdApprovalTable.test.ts` + 既有 wait/dedup/audit |
| GT-1/2 | `chat-approval-mock.spec.ts` |
| GT-3 | `admin-live-push-mock.spec.ts` |
| 性能 | 本期不做 |

---

## 变更记录

| 版本 | 日期 | 变更 |
|---|---|---|
| v1.0 | 2026-08-28 | 编译实现；execute/TTL/邮件补 PUSH；锁非法转移 |
