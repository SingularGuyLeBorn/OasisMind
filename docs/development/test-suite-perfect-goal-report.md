# 测试做成满分 — Goal 执行报告

> 范围与锁死设计以 [`prompts/test-suite-perfect-goal-prompt.md`](./prompts/test-suite-perfect-goal-prompt.md) 为准。  
> **Goal 是否完成 = 提出本 Goal 的人按 S1–S10 打出 10/10。** 施工员只填证据，不准自评十分。施工结束后把本文发回验收者。

- 执行者：Cursor Grok 4.6（施工员）
- 开始：2026-08-30
- 结束（施工交卷，不是验收完成）：
- 见微 Goal / Cursor 台账：已 CreateGoal `测试十分（待原评审 10/10）`；**必须仍为 active**，直到验收者 10/10。施工员不得标 completed。

## Goal 台账（等价 verifiedProgress）

| W | 状态 done/blocked | 证据（命令退出码或文件:行） | commit |
|---|---|---|---|
| W0 | done | `docs/development/testing.md` 含满分定义/四层/内环/禁止/设计错误/map 字段；`AGENTS.md` 快速导航加「测试圣经」；`docs/development/README.md` §8 加 testing.md 条目 | （本 commit） |
| W1 | | | |
| W2 | | | |
| W3 | | | |
| W4 | | | |
| W5 | | | |
| W6 | | | |
| W7 | | | |
| W8 | | | |
| W9 | | | |
| W10 | | | |
| W11 | | | |
| W12 | | | |
| W13 | | | |

## 十分打分表（施工员填证据；分列保持待验收）

| S | 分 | 证据 | 为何验收者应打 1 |
|---|---|---|---|
| S1 Chat 不变量 | 待验收 | | |
| S2 场景不虚标 | 待验收 | | |
| S3 纪念碑变契约 | 待验收 | | |
| S4 nativeTools 按域 | 待验收 | | |
| S5 evals 诚实 | 待验收 | | |
| S6 CI 闸诚实 | 待验收 | | |
| S7 产品面过程 | 待验收 | | |
| S8 推拉 PUSH+PULL | 待验收 | | |
| S9 运行时路径 | 待验收 | | |
| S10 内环 pure 项目 | 待验收 | | |

## 验收者打分（提出 Goal 的人填，施工员整节留空）

| S | 分 0/1 | 扣分原因（打 0 必填） |
|---|---|---|
| S1 | | |
| S2 | | |
| S3 | | |
| S4 | | |
| S5 | | |
| S6 | | |
| S7 | | |
| S8 | | |
| S9 | | |
| S10 | | |
| **合计** | /10 | 10/10 才算 Goal 达成 |

## 异议与偏离

| 位置 | 本文要求 | 我觉得不合理的点 | 实际落地 | 是否 [OM-FREEPLAY] |
|---|---|---|---|---|
| | | | | |

## 盘点表（prompt 第 3 节）

### 3.1 Chat 前端 store（`apps/web/lib/__tests__`）

| 动作 | 文件 | 状态 | 最终路径 |
|---|---|---|---|
| 留 | chatStoreInvariants.test.ts | pending | |
| 留 | chatStoreGoldenTraces.test.ts + golden-traces/*.json | pending | |
| 留 | chatStorePbtInvariants.test.ts | pending | |
| 留 | prdChatStopTable.test.ts / prdChatQueueTable.test.ts | pending | |
| 留 | chatQueueDrainLifecycle.test.tsx | pending | |
| 留 | helpers/chatStoreDrainModel.ts / chatStoreInvariantAsserts.ts | pending | |
| 合 | abortPartialAssistantId.test.ts | pending | → invariants 或 stop 表 |
| 合 | streamOnErrorIdle.test.ts | pending | → invariants |
| 合 | streamLifecycleGhostStop.test.ts | pending | → invariants 或 stop 表 |
| 合 | streamLifecycleAbort.test.ts | pending | → invariants 或 stop 表 |
| 合 | upsertNoopNoInFlight.test.ts | pending | → invariants |
| 合 | prefetchHydrateNoDrain.test.ts | pending | → invariants |
| 合 | enqueueIdleDispatch.test.ts | pending | → queue 表或 invariants |
| 合 | claimActiveAbortController.test.ts | pending | → stop 表或 invariants |
| 合 | liveStreamOwnership.test.ts | pending | → invariants |
| 留 | useSessionMessages / messageUpsertMerge / hydrateFreshnessMerge / chatQueueMerge / chatQueueDrainHead / queueDrainClaimRollback / queueEditDraft / sessionTreeHydrate / chatTreeUi / chatTimelineCompact / adminPullIntervals / uiStateChannel / ackThenMarkDelivery | pending | 不硬并 |
| 留 | scenarioTestMap.test.ts | pending | W1 改校验 |

### 3.2 Chat 后端 / 工具管道（`apps/server/src/__tests__`）

| 动作 | 文件 | 状态 | 最终路径 |
|---|---|---|---|
| 留 | sessionBranch.brutal / toolPipelineOffload.brutal / toolResultConclusion.brutal | pending | |
| 留 | chatHistory / chatImageEnrich / compactCutPoints / chatTree / prd* / uiStateNotify / importOrder | pending | |
| 合 | asyncDeliveryQueueB1–B5、B7 | pending | → asyncDeliveryReconciler.table.test.ts |
| 留空 | B6 | pending | 不补造 |
| 合 | heartbeatSchedulerC1 / heartbeatRefreshC2 / heartbeatCounterC4 | pending | → heartbeatEngine.table.test.ts 或 heartbeatDecisionEngine |
| 留 | heartbeatDecision.test.ts | pending | |
| 合或删 | reentrantResume.test.ts | pending | → startupRecovery.test.ts 后删 |
| 改名 | cClassRemainingAbort.test.ts | pending | → nativeToolAbortSignal.test.ts |
| 改名 | safePathWriteD7.test.ts | pending | → safePathWrite.test.ts |
| 改名 it | processSafety.test.ts 的 M-21 it | pending | 去工单号 |

### 3.3 Native 工具单测

| 动作 | 文件 | 状态 | 最终路径 |
|---|---|---|---|
| 合（拆文件） | nativeTools.test.ts | pending | nativeTools.{registry,fs,knowledge,git,memory,web,integration,async,swarm,shell}.test.ts |

### 3.4 E2E / evals / 产品面

| 动作 | 文件 | 状态 | 最终路径 |
|---|---|---|---|
| 留 | admin-pages.spec.ts / blog-smoke.spec.ts | pending | heading 冒烟，不能当唯一 covered |
| 留 | 全部 e2e/*-mock.spec.ts、fixture | pending | |
| 留但降权 | e2e/*-real.spec.ts / chat-ocr-real.spec.ts | pending | W5 文件头声明 |
| 补 | files-accept-hint-mock.spec.ts | pending | |
| 补 | gardens-list-mock.spec.ts | pending | |
| 改 | evals/README.md | pending | 诚实声明 |
| 补 | evalGoldenSync.test.ts | pending | mock-llm-core 优先 |
| 补 | noVoidPromise.test.ts | pending | |
| 补 | catchUnlessCancelled.test.ts | pending | |
| 补 | uiStateNotify.hub.test.ts | pending | |
| 补 | admin-live-push-mock F5 it | pending | |
| 补 | daily-board-mock.spec.ts | pending | |
| 补 | e2e/helpers/pageErrorGuard.ts | pending | |
| 补 | src/__tests__/pure/ + vitest projects | pending | |
| 补 | docs/development/testing.md | done | W0 |
| 改 | scenario-test-map.json + scenarioTestMap.test.ts | pending | W1 |
| 改 | AGENTS.md 快速导航 | done | 只加一行 |

### 3.5 明确不要删

| 动作 | 文件 | 状态 | 最终路径 |
|---|---|---|---|
| 留 | 任何 *.brutal.test.ts | pending | 不准删 |
| 留 | importOrder.test.ts | pending | 不准进 pure |
| 留 | chatStorePbtInvariants / golden-traces | pending | |
| 留 | mock-llm-core 现有 *.test.ts | pending | |
| 留 | evals/golden/*.json G01–G12 | pending | 不准删 |

## W0 测试圣经 + 盘点

- 根因复述：测试约定散落在 AGENTS.md、各 PRD、scenario-test-map 注释里。下一个 AI 只会加文件，不会按分层。成功 = 有唯一圣经 `testing.md`（满分定义抄 S1–S10、四层一字不改、内环含待 W12 的 `--project pure`、禁止清单、空的设计错误表、map JSON 形状），且 README / AGENTS 各加一条导航；盘点表已粘贴第 3 节。
- 改动文件：`docs/development/testing.md`（新）；`docs/development/README.md` §8；`AGENTS.md` 快速导航；本报告盘点表。
- 不改哪些面：不改任何测试代码、不改 vitest 配置、不加覆盖率门禁。
- [OM-FREEPLAY]：内环命令在锁死四条之外多写了 `scenarioTestMap` 与 `test:e2e:mock` 滤文件名，方便后续 W 对照；产品面补测表预建空行（W6 填），避免 W6 再发明 scenarios.md 标题。
- 验证：无新测。md / AGENTS 改动不跑 tsc。文件存在：`docs/development/testing.md` 标题顺序 `# 见微测试圣经` → `## 满分定义` → `## 四层` → `## 内环命令` → `## 禁止` → `## 施工期发现的设计错误` → `## 场景 map 字段`。
- 遇到的问题：无。

## W1 场景 map 过程断言

- 根因复述：
- 改动文件：
- [OM-FREEPLAY]：
- 验证：
- 遇到的问题：

## W2 Chat 卫星合并

- 根因复述：
- 改动文件：
- [OM-FREEPLAY]：
- 验证：
- 遇到的问题：

## W3 纪念碑收成契约表

- 根因复述：
- 改动文件：
- [OM-FREEPLAY]：
- 验证：
- 遇到的问题：

## W4 拆 nativeTools.test.ts

- 根因复述：
- 改动文件：
- `it(` 搬家前数量 / 搬家后数量：
- [OM-FREEPLAY]：
- 验证：
- 遇到的问题：

## W5 E2E skip 诚实

- 根因复述：
- 改动文件：
- [OM-FREEPLAY]：
- 验证：
- 遇到的问题：

## W6 产品面补测

- 根因复述：
- 改动文件：
- [OM-FREEPLAY]：
- 验证：
- 遇到的问题：

## W7 evals 诚实与金表防漂

- 根因复述：
- 改动文件：
- catchAll 的 golden id：
- [OM-FREEPLAY]：
- 验证：
- 遇到的问题：

## W8 void promise 源码闸

- 根因复述：
- 改动文件：
- 扫到并修好的违规：
- [OM-FREEPLAY]：
- 验证：
- 遇到的问题：

## W9 中段门禁

- 根因复述：
- 改动文件：
- [OM-FREEPLAY]：
- 验证：
- 遇到的问题：

## W10 推拉 PULL + 每日看板

- 根因复述：
- 改动文件：
- [OM-FREEPLAY]：
- 验证：
- 遇到的问题：

## W11 运行时路径

- 根因复述：
- 改动文件：
- [OM-FREEPLAY]：
- 验证：
- 遇到的问题：

## W12 server 纯测并行

- 根因复述：
- 改动文件：
- pure 文件清单（≥8）：
- [OM-FREEPLAY]：
- 验证：
- 遇到的问题：

## W13 十分收尾

- 根因复述：
- 改动文件：
- [OM-FREEPLAY]：
- 验证：
- 遇到的问题：

## 施工期发现的设计错误（与 testing.md 同步）

| 发现于 | 本文原句 | 错误原因 | 正确契约 |
|---|---|---|---|
| | | | |

## 铁律冲突 / 未做

## 残留（范围外发现、本 Goal 故意没修）

## 门禁

| 命令 | 退出码 | 备注 |
|---|---|---|
| `pnpm --filter @oasismind/server lint` | | |
| `pnpm --filter @oasismind/web lint` | | |
| `pnpm --filter @oasismind/server test` | | |
| `pnpm --filter @oasismind/web test` | | |
| `pnpm --filter @oasismind/mock-llm-core test` | | |
| `pnpm test:evals` | | |
| `pnpm test:bench` | | |
| mock e2e（W6 文件） | | |
