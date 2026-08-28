# PRD:ask_user 提问闸 v1.0

> 读者:实现 agent、测试机器、评审人。
> 范围:Chat 内 `ask_user` 挂起/作答/超时/中止。不含真 SMTP 投递成功。

## 1. 背景与目标

- 问题:Agent 必须等人答完才能继续；刷新后提问条不能丢；超时/中止不得把迟到答案当成功。
- 目标:pending 直到 answered/expired/aborted；二次作答拒绝；开着的 Chat 自己弹出提问。
- 已放弃:人不在场自动编造答案；超时当 answered。

## 2. 术语与实体

| 术语 | 定义 | 禁用同义词 |
|---|---|---|
| 提问 | 一条 AskUserPending | 审批、工单 |
| 待答 | status=pending | 挂起成功 |

**AskUserPending**: askId、sessionId、question、options?、channel ui\|email、status pending\|resolved

事件:`ask_user_pending` PUSH；`resolveAskUser`；TTL expired；signal abort → aborted

错误:幽灵 askId；已结束；空答复；邮件未匹配

## 3. 完成判据

- AC-1:UI 作答唤醒 waiter，pending 列表空
- AC-2:已结束再答 → ok=false「该提问已结束」
- AC-3:TTL → expired，再答拒绝
- AC-4:abort → aborted，注入中止续轮（非 approval 的 failed）
- AC-5:刷新后 listPending 仍能恢复条（SessionAskUserBar）

## 4. 可观测

Chat 弹框；`session-ask-user-bar`；SSE `ask_user_pending`

## 5. 状态×事件表

| # | 状态 | 事件 | 迁移 |
|---|---|---|---|
| R1 | 无 | 工具 ask_user | 建 pending；PUSH ask_user_pending；工具返回 waiting_for_user |
| R2 | pending | UI 作答非空 | answered；唤醒；列表空 |
| R3 | pending | 空答复 | 拒绝；仍 pending |
| R4 | resolved | 再 resolve | 该提问已结束 |
| R5 | 任意 | 幽灵 askId | askId 不存在或已失效 |
| R6 | pending | TTL | expired |
| R7 | pending | abort signal | aborted |
| R7b | pending | wait 时 signal 已 aborted | 立刻 aborted，Promise 必须 settle |
| R8 | pending | 邮件命中 | answered source=email |
| R9 | 已答 | 同 webhook event | 拒绝（入口幂等） |
| R10 | pending 无 waiter | 作答 | 孤儿入发送队列 |
| R11 | 刷新 | listPending | 条仍在（PULL） |

既有测覆盖:R2/R6/R8/R9（event）/resolve 先于 wait。本文件补 R3/R4/R5/R7。

## 6. 不变量

- INV-U1:pending 检查与 waiter 注册之间无 await
- INV-U2:终态不可再答
- INV-U3:abort ≠ approval 的 run failed
- INV-U4:提醒在答复后停止

## 7–10

无 P95。不做真邮箱 E2E。冲突：不编答案 > 少等一会。

## 11. 验收

| 章节 | 测试 |
|---|---|
| R2/R6/R8 | `askUserGate.test.ts` |
| R3/R4/R5/R7 | `prdAskUserTable.test.ts` |
| GT 点卡续跑 | Playwright mock：`apps/web/e2e/chat-ask-user-mock.spec.ts` |

---

## 变更记录

| 版本 | 日期 | 变更 |
|---|---|---|
| v1.0 | 2026-08-28 | 编译既有闸；补终态/幽灵/中止表行 |
