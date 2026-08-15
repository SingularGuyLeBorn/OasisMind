# DSH 三不变量落地报告

> 日期：2026-08-14
> 执行方：Cursor Grok 4.6 / 本会话
> 规格：docs/development/dsh-learn-implementation-plan.md
> Prompt：docs/development/prompts/dsh-three-invariants-goal-prompt.md

## 1. 结论

WP0–WP7 已按锁死裁决落地并分主题提交。用户可察觉的变化：子 Agent 有 own 层与 inheritMask、长文只砍 content、工具超时等停、prompt 登录铁律按 VisibleSet 出现、未注册工具进 drift 但不拦跑。无红线违规（无 Cordis / Fiber / Code Mode / SessionEvent / 审批进 pipeline / 三档 sandbox / 「刷新一下」/ `void promise`）。

## 2. 裁决执行核对

| 题 | 锁死 | 代码落点（文件:符号） | 有无偏离 |
|----|------|----------------------|----------|
| Q1 | A | `toolPipeline.ts:persistValue` / `reactLoop.appendToolResultMessages`；ChatMessage/`executedTools` 只存 content | 无 |
| Q2 | A | `toolPipeline.ts:runNativePipeline` 固定 stage + `registerToolObserver` | 无 |
| Q3 | A | `cooperativeAbort.ts:runCooperative` await body；timeout 只 abort | 无 |
| Q4 | A | `registerDomain.ts` execute：`isToolEnvelope` 原样，否则 `wrapRawAsEnvelope` | 无 |
| Q5 | A+A1 | CHILD_OWN_TOOLS=`agent_report_back` `agent_notify_parent` `todo_write` `todo_read` `ask_user` | 无 |
| Q6 | A | `session.ts:validateSpawnInheritMask` → `INHERIT_MASK_CONFLICT` | 无 |
| Q7 | A | 列名=`toolInheritMask` + `toolOwn` | 无 |
| Q8 | A | 未做三档：是 | 无 |
| Q9 | C+A | `agentResolver.ts:detectAgentToolDrift`；spawn `INHERIT_MASK_UNKNOWN_TOOL` | 无 |
| Q10 | A | signal 必填：是 | 无 |
| Q11 | A | `agentTools.ts:buildAgentToolSchemas` 先 VisibleSet 再硬顶剥离 | 无 |
| Q12 | A | commit 列表：`06929a11` `658857d1` `2e09d768` `27a52773` `53230a76` `7bd35bc1` `5836c6fb` + 本 WP7 | 无 |

## 3. 各 WP

### WP0
- 负向测试：先红后绿？ 同提交内先测后实现。文件：`apps/server/src/__tests__/toolEnvelope.test.ts`
- commit：`06929a11 feat(dsh): WP0 工具结果信封契约`
- 偏差：`snapshotJsonValue` 跳过对象内 `undefined` key（JSON 语义），根值 `undefined` 仍 throw。

### WP1
- 负向测试 6 条：`visibleSet.test.ts` 全绿
- grep `parsed.native = DEFAULT_SUBAGENT_TOOLS`：零
- commit：`658857d1 feat(dsh): WP1 VisibleSet 单一派生`
- 偏差：`visibleSetToParsed` 放 `agentTools.ts`；空 `agentSnapshot.tools` 不现场 derive（单测直调按 registry 放行）

### WP2
- `_kp_result_path` 仍在？ 是
- 删除 `truncateToolResultContent`？ 是
- commit：`2e09d768 feat(dsh): WP2 工具结果三通道只砍 content`
- 偏差：execute 仍返 raw，包装在 materialize/append

### WP3
- `withToolTimeout` 已删？ 是（生产代码零命中；metablog 注释已改掉该词）
- 工具 body 路径无 Promise.race？ 是（`agentTools.ts` / `cooperativeAbort.ts` / `toolPipeline.ts` 零命中）
- 第一波听 signal：web=`browser.close`+fetch abort；shell=`execFile`/`waitMs` 接 signal；session=spawn 等待环 fuse `ctx.signal`；swarm=`agent_send_message` waitForRun 听 `ctx.signal`
- commit：`27a52773 feat(dsh): WP3 冻结入参与合作式取消`
- 偏差：timeout 测试用 200ms 不是 5s；pipeline 内层 timeout=10min，权威在 batch

### WP4
- prisma 列：`Agent.toolInheritMask` `Agent.toolOwn`
- spawn 互斥 / 未知 mask / deny own：`INHERIT_MASK_CONFLICT` / `INHERIT_MASK_UNKNOWN_TOOL` / deny own 忽略+warn
- inspect 仍无消息？ 是（加 `visibleToolCount`/`visibleToolsPreview`）
- commit：`53230a76 feat(dsh): WP4 子 Agent own 层与 inheritMask`
- 偏差：dev.db 用 `ALTER TABLE` 加列（`db push` 会误删 FTS）

### WP5
- WEB_TOOL_GUIDE 零命中？ 是（`promptBuilder.ts` 源码）
- equivalence fixture diff 摘要：删了整段「网络工具用法」；math / 落盘铁律 / 范文仍在。登录墙改由三工具 `promptSection` 在 VisibleSet 内注入（regen 时 registry 未灌，fixture 的 toolGuide 不含登录墙正文，运行时有 VisibleSet 才出现）。
- runtime-context 每轮替换？ 是（`runtime-snapshot` order 900，`upsertRuntimeContextBlock`）
- commit：`7bd35bc1 feat(dsh): WP5 prompt 三分与 runtime-context`
- 偏差：无

### WP6
- resolveAgentFsPath 唯一落点：`infra/writePolicy.ts`（`fs.ts` 只 import，不 re-export）
- 未做三档？ 是
- commit：`5836c6fb feat(dsh): WP6 写策略单一 resolve`
- 偏差：无

### WP7
- 存量 drift 不拦跑：`detectAgentToolDrift` 只填数组；`deriveVisibleSet` 忽略未知名
- mask 未知 spawn 失败：`INHERIT_MASK_UNKNOWN_TOOL`（WP4 已有 + 本 WP 复测）
- 文档：concurrency.md §4.3 / AGENTS.md 导航 / design-decisions.md 已补落地句
- commit：本提交
- 偏差：registry 空时 `detectAgentToolDrift` 跳过（避免未灌表误报）

## 4. 验证命令与结果

```
pnpm --filter @knowpilot/server lint   → tsc --noEmit 0 error
pnpm --filter @knowpilot/shared lint   → tsc --noEmit 0 error
pnpm --filter @knowpilot/web lint      → eslint 0 error（1 条预存 RoughAnnotation warning）
pnpm --filter @knowpilot/server test -- --run
  Test Files  203 passed (203)
  Tests  1337 passed | 3 skipped (1340)
  Duration  128.75s
```

终验 grep（生产代码）：

- `withToolTimeout`：零（仅测试注释提及）
- `WEB_TOOL_GUIDE`：零（仅测试断言「零命中」）
- `parsed.native = DEFAULT_SUBAGENT_TOOLS`：零
- `assertApprovalOrProceed` 在 `infra/tools`：零
- `Promise.race` 在 agentTools / cooperativeAbort / toolPipeline：零

功能自检（单测代替人手）：

1. sub 误写 spawn_subagent → VisibleSet 不含 + execute `NOT_VISIBLE`（WP1）
2. 父 mask allow=`read_file` → 子无 web_search、有 agent_report_back（WP4）
3. 长文 content 截断、磁盘全文、`_kp_result_path`（WP2）
4. cooperative timeout 等停（WP3）
5. 两轮 runtime-context 只有一块（WP5）
6. spawn invalidate / report_back 投递未拆（`useChatRunStream` 仍 invalidate）

## 5. 自主落点（规格没写、按 §13 选的）

| 点 | 选了什么 | 为什么是更小 diff |
|----|----------|-------------------|
| `visibleSetToParsed` | 放 `agentTools.ts` | 规格锁死更小 diff，破环 |
| 空 `agentSnapshot.tools` | 不现场 derive，registry 放行 | 否则几十个直调单测全红 |
| `snapshotJsonValue` 跳过 undefined key | JSON 语义，不 throw | `read_file` 的 `nextOffset: undefined` |
| timeout 测试 200ms | 等停不变量不变 | 避免拖慢全量 |
| pipeline 内层 timeout 10min | 不 import `resolveToolCallTimeoutMs` | 避免环；权威在 batch |
| `readonlyOnly` 留在 `executeAgentTool` | skill/mcp 也要拦 | 避免只拦 native |
| WP4 加列 | `ALTER TABLE` 不用 `db push --accept-data-loss` | 不误删 FTS |
| `detectAgentToolDrift` registry 空则跳过 | 不误报 | 部分单测未灌 native 表 |
| 终验注释改词 | 去掉 grep 会误伤的标识符 | 注释不是实现 |

## 6. 未做 / 风险

- 人手 E2E 没跑（Chat 真流 / Playwright）；对应条用单测代替
- 预存 flaky：未在本批次复现；web eslint 1 条 `RoughAnnotation` warning 预存
- Cursor 侧无 `session_goal_clear`，本报告代替清 goal
- 回滚方式：按 WP commit revert（`06929a11`…本 WP7）

## 7. 推拉自检

- [x] spawn / report_back 仍有 PUSH（`useChatRunStream` invalidate + 既有 `uiStateNotify`）
- [x] F5 后瘦卡 + path 还在（Q1，未改 `_kp_result_path`）
- [x] 交付无「刷新一下」

§7 真 E2E（Chat 脸 E2E-1～6）见 `rsi-dsh-modularize-finish-report.md`。不要改写上方 WP 历史。
