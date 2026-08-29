# 测试做成满分 — Goal 执行报告

> 范围与锁死设计以 [`prompts/test-suite-perfect-goal-prompt.md`](./prompts/test-suite-perfect-goal-prompt.md) 为准。  
> **Goal 是否完成 = 提出本 Goal 的人按 S1–S10 打出 10/10。** 施工员只填证据，不准自评十分。施工结束后把本文发回验收者。

- 执行者：Cursor Grok 4.6（施工员）
- 开始：2026-08-30
- 结束（施工交卷，不是验收完成）：2026-08-30
- 见微 Goal / Cursor 台账：已 CreateGoal `测试十分（待原评审 10/10）`；**必须仍为 active**，直到验收者 10/10。施工员不得标 completed。

## Goal 台账（等价 verifiedProgress）

| W | 状态 done/blocked | 证据（命令退出码或文件:行） | commit |
|---|---|---|---|
| W0 | done | `docs/development/testing.md` 含满分定义/四层/内环/禁止/设计错误/map 字段；`AGENTS.md` 快速导航加「测试圣经」；`docs/development/README.md` §8 加 testing.md 条目 | `6e02f755` |
| W1 | done | `pnpm --filter @oasismind/web test -- scenarioTestMap` 退出码 0（3 tests）；map 每条有 asserts[]；covered 无仅 heading/`*-real`/单独 cases.json | `d91d1fd7` |
| W2 | done | chatStoreInvariants 27 passed；prdChatStopTable 23；prdChatQueueTable 15；scenarioTestMap 3；invariants 503 行未拆 | `1e41ed13` |
| W3 | done | reconciler.table 14 passed；heartbeatEngine.table 8；startupRecovery 6；nativeToolAbortSignal 3；safePathWrite 6；processSafety 2 | `1cd5d32e` |
| W4 | done | `it(` 111→111；`nativeTools.fs` 45 passed；`nativeTools` 匹配域文件全绿（另含 qqNative/mockNative 合计 124） | `bff90682` |
| W5 | done | 4 个 `*-real.spec.ts` 文件头含降权声明；OCR `test.skip` 保留；scenarioTestMap 绿 | `abb55b31` |
| W6 | done | `pnpm --filter @oasismind/web test:e2e:mock -- files-accept-hint-mock gardens-list` 退出码 0（2 passed）；scenarioTestMap 绿 | `3c55deb4` |
| W7 | done | `pnpm test:evals` 12/12；`pnpm --filter @oasismind/mock-llm-core test` 141 passed；`pnpm --filter @oasismind/server test -- evalGoldenSync` 3 passed；`pnpm test:bench` 24/24 退出码 0 | `193a6350` |
| W8 | done | `pnpm --filter @oasismind/web test -- noVoidPromise` 退出码 0；web lint 退出码 0；扫描 0 条生产违规 | `24ddc990` |
| W9 | done | server/web lint 0；scenarioTestMap/noVoidPromise 绿；W3/W4 点名 7 files 84 tests；旧测试路径 git ls-files 空。S7–S10 尚未 W10–W12，不能交十分卷 | `e9d42654` |
| W10 | done | mock e2e admin-live-push + daily-board + files/gardens 9 passed；scenarioTestMap 绿 | `80b8e14b` |
| W11 | done | catchUnlessCancelled 2 passed；uiStateNotify.hub 1 passed；`pnpm --filter @oasismind/web test:e2e:mock -- e2e/chat-mock.spec.ts` 2 passed | `e62598dd` |
| W12 | done | `--project pure` 10 files/65；`--project db -- chatTree` 17；全量 server 247/1668 | `6c2b4376` |
| W13 | done | 见「门禁」表；theme-toggle 挂场景 1 map；master fast-forward 到 `408210cc` 后复跑与施工期同数字。Goal 保持 active | `408210cc` |
| W13′ | done | `/runs` 独立 F5 it + map claim；`admin-live-push-mock` 7 passed。Goal 仍 active | `627535e2` |
| W13″ | done | evals 文首不再写成证明没变傻；盘点「留」改 done | `14a8223c` |

## 十分打分表（施工员填证据；分列保持待验收）

| S | 分 | 证据 | 为何验收者应打 1 |
|---|---|---|---|
| S1 Chat 不变量 | 待验收 | `chatStoreInvariants.test.ts` / `chatStoreGoldenTraces.test.ts` / `chatStorePbtInvariants.test.ts` 仍在；W13 `pnpm --filter @oasismind/web test` 72 files/374 含 INV 27 + golden 6 + PBT 7。本 Goal 新测（catchUnlessCancelled / noVoidPromise / pageErrorGuard / hub / pure 闸）无 `setTimeout`/`queueMicrotask`/`await hydrate` | INV 三件套仍在且绿；新测不赌时序 |
| S2 场景不虚标 | 待验收 | `scenario-test-map.json` 每条 `asserts[]`；`scenarioTestMap.test.ts` 3 passed；covered 计分层排除 e2e-real 与 heading claim | 过程闸在 CI 路径，不是文件存在 |
| S3 纪念碑变契约 | 待验收 | `git ls-files` 对 B1/C1/reentrantResume/nativeTools.test.ts 为空；`asyncDeliveryReconciler.table.test.ts` 14 it；`heartbeatEngine.table.test.ts` 8 it | 旧事故文件名已从工作树消失，契约表 it 不减 |
| S4 nativeTools 按域 | 待验收 | `nativeTools.test.ts` 已删；W4 `nativeTools.fs` 45 passed；`it(` 111→111 | 可按域跑，断言没丢 |
| S5 evals 诚实 | 待验收 | `evals/README.md` L5–10 诚实声明（锁死原文）；文首 P1-03 导语已改为「锁 mock 场景命中与工具名」，不再写成证明没变傻；`evalGoldenSync.test.ts`；W13 `pnpm test:evals` 12/12、`pnpm test:bench` 24/24 退出码 0 | mock 绿不再能冒充「没变傻」 |
| S6 CI 闸诚实 | 待验收 | 4 个 `*-real.spec.ts` 文件头降权；OCR `test.skip`；map 里 e2e-real 不计 covered | skip 的 real 不能撑 covered |
| S7 产品面过程 | 待验收 | `files-accept-hint-mock` / `gardens-list-mock` / `daily-board-mock` e2e 绿；`theme-toggle-mock` 挂场景 1 asserts（Navbar 切 light/dark） | 花园/文件柜/每日/主题都有过程 claim |
| S8 推拉 PUSH+PULL | 待验收 | `admin-live-push-mock`：`/cron` `/approvals` `/runs` 各有 PUSH it + 独立「刷新页面…仍在」F5 it（`/runs 创建 interrupted 后刷新页面 hint 仍在`）；场景 17 Inbox 蒸馏钮 | 三页双通道都有独立 it，禁止只 spy notify、禁止 F5 只叠在 PUSH 里 |
| S9 运行时路径 | 待验收 | `noVoidPromise` 1 passed；`catchUnlessCancelled` 2；`pageErrorGuard` 挂于 `chat-mock.spec.ts`；`uiStateNotify.hub.test.ts` 真 hub 先推再订 | 写法闸 + 浏览器守卫 + hub 可观测 |
| S10 内环 pure 项目 | 待验收 | `apps/server/vitest.config.ts` projects `db`+`pure`；`src/__tests__/pure/` 9 测 + `pureNoPrisma.test.ts`；`testing.md` 内环有 `--project pure`；`--project pure` 65 passed。db 仍 `singleFork` | 零 DB 测可并行，文件锁项目没拆掉 |

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
| W1 eval-mock `it` | it 必须是 it(/test( 标题子串 | golden JSON 没有 it() | 用 JSON 字段子串过 includes 闸 | 是 |
| W3 B4 | 合并保留 resume 再入池断言 | 与重启不续跑铁律冲突 | 保留已改好的 failed 断言，记 testing.md | 是 |
| W7 测路径 | 优先 mock-llm-core | shared 默认清单无 run_shell | server + listNativeTools | 是 |
| W11 pageErrorGuard | 同步 `() => void` | Playwright `addInitScript` 必须 await | `installPageErrorGuard` 为 async，返回 `() => Promise<void>` | 是 |
| W11 mock web_search | 不准放宽 chat-mock「全文已存」 | mock 叶子 JSON 仅 3945 字，低于 4000 阈值 | 对含 OasisMind 的查询垫长 snippet（repeat 500），不改断言 | 是 |
| W13 theme-toggle map | S7 要求 map 挂过程 claim；W10 禁止硬塞无关 scenario | 无「主题」场景标题 | 挂到场景 1（spec 本身 goto /chat Navbar） | 是 |
| W7 evals 文首 | 诚实声明锁死原文；未规定改 P1-03 导语 | 文首仍写「证明没变傻」，验收者可按完成判定第 10 条打 S5=0 | 导语改为「锁 mock 场景命中与工具名」，诚实声明原文不动 | 是 |

## 盘点表（prompt 第 3 节）

### 3.1 Chat 前端 store（`apps/web/lib/__tests__`）

| 动作 | 文件 | 状态 | 最终路径 |
|---|---|---|---|
| 留 | chatStoreInvariants.test.ts | done | 未拆（503 行） |
| 留 | chatStoreGoldenTraces.test.ts + golden-traces/*.json | done | 未改磁带 |
| 留 | chatStorePbtInvariants.test.ts | done | 未缩 command 空间 |
| 留 | prdChatStopTable.test.ts / prdChatQueueTable.test.ts | done | 收了卫星 |
| 留 | chatQueueDrainLifecycle.test.tsx | done | 未并进 invariants |
| 留 | helpers/chatStoreDrainModel.ts / chatStoreInvariantAsserts.ts | done | |
| 合 | abortPartialAssistantId.test.ts | done | prdChatStopTable.test.ts describe abortPartialAssistantId |
| 合 | streamOnErrorIdle.test.ts | done | chatStoreInvariants.test.ts describe streamOnErrorIdle |
| 合 | streamLifecycleGhostStop.test.ts | done | prdChatStopTable.test.ts describe streamLifecycleGhostStop |
| 合 | streamLifecycleAbort.test.ts | done | chatStoreInvariants.test.ts describe streamLifecycleAbort |
| 合 | upsertNoopNoInFlight.test.ts | done | chatStoreInvariants.test.ts describe upsertNoopNoInFlight |
| 合 | prefetchHydrateNoDrain.test.ts | done | chatStoreInvariants.test.ts describe prefetchHydrateNoDrain |
| 合 | enqueueIdleDispatch.test.ts | done | prdChatQueueTable.test.ts describe enqueueIdleDispatch |
| 合 | claimActiveAbortController.test.ts | done | prdChatStopTable.test.ts describe claimActiveAbortController |
| 合 | liveStreamOwnership.test.ts | done | chatStoreInvariants.test.ts describe liveStreamOwnership |
| 留 | useSessionMessages / messageUpsertMerge / hydrateFreshnessMerge / chatQueueMerge / chatQueueDrainHead / queueDrainClaimRollback / queueEditDraft / sessionTreeHydrate / chatTreeUi / chatTimelineCompact / adminPullIntervals / uiStateChannel / ackThenMarkDelivery | done | 保持原路径，未硬并 |
| 留 | scenarioTestMap.test.ts | done | 仍此文件；W1 改校验逻辑 |

### 3.2 Chat 后端 / 工具管道（`apps/server/src/__tests__`）

| 动作 | 文件 | 状态 | 最终路径 |
|---|---|---|---|
| 留 | sessionBranch.brutal / toolPipelineOffload.brutal / toolResultConclusion.brutal | done | 未改名、未删 |
| 留 | chatHistory / chatImageEnrich / compactCutPoints / chatTree / prd* / uiStateNotify / importOrder | done | chatHistory → `pure/chatHistory.test.ts`；其余仍 db；importOrder 不准进 pure |
| 合 | asyncDeliveryQueueB1–B5、B7 | done | asyncDeliveryReconciler.table.test.ts（14 it） |
| 留空 | B6 | done | 不补造 |
| 合 | heartbeatSchedulerC1 / heartbeatRefreshC2 / heartbeatCounterC4 | done | heartbeatEngine.table.test.ts（8 it；未并入 decisionEngine，并完会 >500） |
| 留 | heartbeatDecision.test.ts | done | apps/server/src/__tests__/pure/heartbeatDecision.test.ts（W12 剪切，内容未与引擎混文件） |
| 合或删 | reentrantResume.test.ts | done | T3/T4 → startupRecovery.test.ts 后删源 |
| 改名 | cClassRemainingAbort.test.ts | done | nativeToolAbortSignal.test.ts |
| 改名 | safePathWriteD7.test.ts | done | safePathWrite.test.ts |
| 改名 it | processSafety.test.ts 的 M-21 it | done | 去工单号 |

### 3.3 Native 工具单测

| 动作 | 文件 | 状态 | 最终路径 |
|---|---|---|---|
| 合（拆文件） | nativeTools.test.ts | done | nativeTools.{registry,fs,knowledge,git,memory,web,integration,async,swarm,shell}.test.ts |

### 3.4 E2E / evals / 产品面

| 动作 | 文件 | 状态 | 最终路径 |
|---|---|---|---|
| 留 | admin-pages.spec.ts / blog-smoke.spec.ts | done | heading 冒烟保留；不能当唯一 covered |
| 留 | 全部 e2e/*-mock.spec.ts、fixture | done | 过程覆盖主路径，未删 |
| 留但降权 | e2e/*-real.spec.ts / chat-ocr-real.spec.ts | done | W5 文件头声明；OCR 保持 skip |
| 补 | files-accept-hint-mock.spec.ts | done | apps/web/e2e/files-accept-hint-mock.spec.ts |
| 补 | gardens-list-mock.spec.ts | done | apps/web/e2e/gardens-list-mock.spec.ts；空态加 gardens-empty |
| 改 | evals/README.md | done | 文首诚实声明 + mini Harness 非模型质量一句 |
| 补 | evalGoldenSync.test.ts | done | apps/server/src/__tests__/evalGoldenSync.test.ts（listNativeTools） |
| 补 | noVoidPromise.test.ts | done | apps/web/lib/__tests__/noVoidPromise.test.ts |
| 补 | catchUnlessCancelled.test.ts | done | apps/web/lib/__tests__/catchUnlessCancelled.test.ts |
| 补 | uiStateNotify.hub.test.ts | done | apps/server/src/__tests__/uiStateNotify.hub.test.ts |
| 补 | admin-live-push-mock F5 it | done | cron/approvals/runs 各一条独立 reload it |
| 补 | daily-board-mock.spec.ts | done | apps/web/e2e/daily-board-mock.spec.ts |
| 补 | e2e/helpers/pageErrorGuard.ts | done | apps/web/e2e/helpers/pageErrorGuard.ts；仅挂 chat-mock.spec.ts |
| 补 | src/__tests__/pure/ + vitest projects | done | vitest projects db+pure；9 个测剪切进 pure/ + pureNoPrisma 闸 |
| 补 | docs/development/testing.md | done | W0 |
| 改 | scenario-test-map.json + scenarioTestMap.test.ts | done | W1：每条 asserts[]；校验 it 子串 |
| 改 | AGENTS.md 快速导航 | done | 只加一行 |

### 3.5 明确不要删

| 动作 | 文件 | 状态 | 最终路径 |
|---|---|---|---|
| 留 | 任何 *.brutal.test.ts | done | 未删 |
| 留 | importOrder.test.ts | done | 仍在 db 项目，未进 pure |
| 留 | chatStorePbtInvariants / golden-traces | done | 未缩 command 空间、未改磁带 |
| 留 | mock-llm-core 现有 *.test.ts | done | 未删；G01–G05 只补关键词 |
| 留 | evals/golden/*.json G01–G12 | done | 未删 |

## W0 测试圣经 + 盘点

- 根因复述：测试约定散落在 AGENTS.md、各 PRD、scenario-test-map 注释里。下一个 AI 只会加文件，不会按分层。成功 = 有唯一圣经 `testing.md`（满分定义抄 S1–S10、四层一字不改、内环含待 W12 的 `--project pure`、禁止清单、空的设计错误表、map JSON 形状），且 README / AGENTS 各加一条导航；盘点表已粘贴第 3 节。
- 改动文件：`docs/development/testing.md`（新）；`docs/development/README.md` §8；`AGENTS.md` 快速导航；本报告盘点表。
- 不改哪些面：不改任何测试代码、不改 vitest 配置、不加覆盖率门禁。
- [OM-FREEPLAY]：内环命令在锁死四条之外多写了 `scenarioTestMap` 与 `test:e2e:mock` 滤文件名，方便后续 W 对照；产品面补测表预建空行（W6 填），避免 W6 再发明 scenarios.md 标题。
- 验证：无新测。md / AGENTS 改动不跑 tsc。文件存在：`docs/development/testing.md` 标题顺序 `# 见微测试圣经` → `## 满分定义` → `## 四层` → `## 内环命令` → `## 禁止` → `## 施工期发现的设计错误` → `## 场景 map 字段`。
- 遇到的问题：无。

## W1 场景 map 过程断言

- 根因复述：`scenarioTestMap.test.ts` 只检查标题对齐且 `tests[]` 文件存在，于是 blog-smoke heading 就能让「写文章」标 covered。成功 = 每条有 `asserts[]`，`it` 子串落在文件内，covered 必须有非 e2e-real 过程 claim。
- 改动文件：`docs/development/scenario-test-map.json`；`apps/web/lib/__tests__/scenarioTestMap.test.ts`。
- 不改哪些面：不改 E2E 生产代码；不把 heading 改写成过程 claim；不删 real spec。
- [OM-FREEPLAY]：eval-mock 指向 golden JSON 时文件无 `it(`/`test(`，用 JSON 内 `"id": "G0x"` 等子串满足 includes 闸（规则第 5 条只要求文件文本 includes）。场景 18 现有 `scenario-partial-chat-mock` 已有 video_transcript 过程，故保持 covered（prompt 写「仅 cases.json 则 partial」；实际已有 mock 过程）。场景 A 的晨间简报 unit assert 指向 `relatedPosts.test.ts`（不在该场景 tests[]，prompt 允许）。
- 验证：`pnpm --filter @oasismind/web test -- scenarioTestMap` 退出码 0。
- 遇到的问题：无。

## W2 Chat 卫星合并

- 根因复述：INV 碎片散落 9 个文件，改一条停止契约要翻 10 处。成功 = it 剪切进 invariants / stop 表 / queue 表，源文件删除，断言不丢，零生产 store 重构。
- 改动文件：`chatStoreInvariants.test.ts`（503 行，未拆）；`prdChatStopTable.test.ts`；`prdChatQueueTable.test.ts`；删除 9 个卫星；文档路径 `prd-chat-queue.md` / `design-decisions.md` 指向新家。map 未引用卫星故未改。
- 不改哪些面：生产 store；`chatQueueDrainLifecycle.test.tsx`；PBT / golden-traces。
- [OM-FREEPLAY]：abortPartial / ghostStop / claimAC 归停止表（停止契约）；其余 INV 归 invariants。enqueueIdleDispatch 归 queue 表。
- 验证：点名四条命令退出码 0。invariants 27 / stop 23 / queue 15。
- 遇到的问题：无。

## W3 纪念碑收成契约表

- 根因复述：B1–B7、C1/C2/C4、reentrantResume 是事故编号，半年后无法当规格读。成功 = 契约表文件 + 旧路径从工作树消失 + it 数不减（表内）+ B4 与铁律对齐。
- 改动文件：新建 `asyncDeliveryReconciler.table.test.ts`、`heartbeatEngine.table.test.ts`；删 B*/C*/reentrantResume；改名 abort/safePath；processSafety it 去工单号；startupRecovery 迁入 T3/T4；docs/testing 旧称对照与设计错误。
- 不改哪些面：生产 recoverStaleAsyncJobs（已是一律 failed）；heartbeatDecision.test.ts 纯决策文件不混。
- [OM-FREEPLAY]：心跳未并入 heartbeatDecisionEngine（C*+引擎会超 500 行），按 prompt 允许新建 table 文件。B3 保留原 `setTimeout(80)` 采样（剪切不改断言）。
- 验证：点名 6 条 server test 退出码 0。it：reconciler 14 = 旧 B 合计；heartbeat table 8 = 旧 C 合计。
- 遇到的问题：B4 原文件已按铁律改成 failed 断言，无需再改断言体。

## W4 拆 nativeTools.test.ts

- 根因复述：单文件约 2100 行，内环无法按域跑。成功 = 原文件已删、10 个域文件各含原 describe、断言不改、`it(` 数不减、`nativeTools.fs` 可单独绿。
- 改动文件：删 `nativeTools.test.ts`；新建 10 个 `nativeTools.<域>.test.ts`；`docs/development/README.md` §6；`rsi-dsh-modularize-finish-report.md`、`dsh-learn-implementation-plan.md` 旧路径。
- 不改哪些面：工具生产代码；`hasGitBinary` skip 条件；`helpers/toolTestFixtures.ts`。
- `it(` 搬家前数量 / 搬家后数量：111 / 111（含 `it.skipIf`）。
- [OM-FREEPLAY]：`hasGitBinary`/`initTempGitRepo` 原夹在 post_create 与 git_branch 之间；剪切后从 knowledge 文件去掉、只留 git 文件，否则 git 测 ReferenceError。各域文件保留了原文件头 import（含未用项）；tsconfig 无 noUnusedLocals，未改断言。
- 验证：`pnpm --filter @oasismind/server test -- nativeTools.fs` 退出码 0（45）；`... test -- nativeTools` 退出码 0。
- 遇到的问题：无。

## W5 E2E skip 诚实

- 根因复述：无 key 的 `*-real.spec.ts` 若当 covered 依据则虚。成功 = 4 个 real 文件头有锁死降权声明；OCR 保持 skip；map 里 e2e-real 不是唯一计分断言。
- 改动文件：`chat-queue-real.spec.ts` `chat-tool-hint-real.spec.ts` `chat-thinking-real.spec.ts` `chat-ocr-real.spec.ts`；`testing.md` 禁止节 OCR 人工一行。
- 不改哪些面：playwright ignore、不删 real 套件、OCR `test.skip` 不改成真跑。
- [OM-FREEPLAY]：无。map 里仅场景 9 有一条 e2e-real，同场景已有 e2e-mock+unit。
- 验证：`pnpm --filter @oasismind/web test -- scenarioTestMap` 退出码 0（3 tests）。
- 遇到的问题：无。

## W6 产品面补测

- 根因复述：Chat 测到停止表，花园/文件柜几乎只有 heading。成功 = `/files` 收件提示可见且文案含 pdf/docx（不上传 docx）；`/gardens` 至少一张可点花园链接或空态 `gardens-empty`；不强行塞进无关 scenario id，只登记 testing.md 产品面表。
- 改动文件：新建 `apps/web/e2e/files-accept-hint-mock.spec.ts`、`apps/web/e2e/gardens-list-mock.spec.ts`；`apps/web/app/gardens/page.tsx` 空态外包 `data-testid="gardens-empty"`（文案不改）。
- 不改哪些面：不改 scenarios.md；不把 files/gardens 升格为场景 8/11 covered 依据（场景 8 note 与场景 11 note 已在 W1 写好）；files 页 testid 已存在，不改文案。
- [OM-FREEPLAY]：空态与列表用 `expect.poll` 二选一，避免 e2e 空库 wipe 后只断言链接变红。未给 EmptyState 组件加通用 testid，只包花园页空态根节点。
- 验证：`pnpm --filter @oasismind/web test:e2e:mock -- files-accept-hint-mock gardens-list` 退出码 0（2 passed）；`pnpm --filter @oasismind/web test -- scenarioTestMap` 退出码 0。
- 遇到的问题：无。

## W7 evals 诚实与金表防漂

- 根因复述：`pnpm test:evals` 绿只说明 mock-llm 关键词命中了 expectToolsAnyOf，文档却容易让人以为「Agent 没变傻」。成功 = README 诚实声明；金表工具名 ⊆ 已注册 native/agent；未强制场景时 resolve 不抛；有 expectToolsAnyOf 的不得只靠 catchAll。
- 改动文件：`evals/README.md`；`apps/server/src/__tests__/evalGoldenSync.test.ts`；`packages/mock-llm-core/src/scenarioDefs.ts`（G01–G05 补关键词、去掉 G01/G02 的 hasTool 门槛）；`chatCoverage.ts` 加未强制赢家行。
- catchAll 的 golden id：G06、G08、G09、G10（expectToolsAnyOf 均为空，闲聊/停止/列工具/HTML 落到 greeting 仍是零工具，mock 运行时约束可满足）。
- 不改哪些面：不清空 expectToolsAnyOf；不 spy LLM；不删 G01–G12；不把 live 塞进 CI。
- [OM-FREEPLAY]：prompt 优先 mock-llm-core，但 shared 默认清单不含 `run_shell`（金表 forbidTools 大量使用）。完整源是 `listNativeTools()`，故测放 server。G03 关键词写成金表原句 `读一下这个知乎专栏文章` / `p/12345678`，避免抢走 `zhihu_login_status`（`zhuanlan.zhihu.com/p/1`）。
- 验证：`pnpm test:evals` 退出码 0（12/12）；`pnpm --filter @oasismind/mock-llm-core test` 退出码 0；`pnpm --filter @oasismind/server test -- evalGoldenSync` 退出码 0；`pnpm test:bench` 退出码 0（24/24）。bench 结束后 stderr 有 DATABASE_URL prisma 拆卸噪声，不改生产。
- 遇到的问题：G03 过宽关键词曾让 partial E2E 的知乎 login 测红，已收紧。

## W8 void promise 源码闸

- 根因复述：AGENTS.md 已禁 void refetch/invalidate，jsdom 单测绿抓不到浏览器 unhandled rejection。成功 = 机器闸扫 apps/web 生产源码，命中正则即红；现存违规改成 .catch 或 await。
- 改动文件：新建 `apps/web/lib/__tests__/noVoidPromise.test.ts`。
- 扫到并修好的违规：无。现网生产路径已是 `.catch(catchUnlessCancelled(...))`，闸 0 hit。
- 不改哪些面：不扫 server React（无）；不扫 markdown / e2e / 测试文件。
- [OM-FREEPLAY]：行内 `//` 注释在匹配前剥掉，避免注释里的 `void utils.` 假阳性。不引入 TS parser。
- 验证：`pnpm --filter @oasismind/web test -- noVoidPromise` 退出码 0；`pnpm --filter @oasismind/web lint` 退出码 0（10 条既有 warning，0 error）。
- 遇到的问题：无。

## W9 中段门禁

- 根因复述：后面 W10–W13 还要改 e2e / vitest 配置；这里先锁结构改造没把已有测弄红。成功 = 旧路径不是测试文件、点名测绿、S1–S6 证据齐、S7–S10 仍为 0。
- 改动文件：仅本报告。
- 不改哪些面：不跑 server 全量（留给 W13）；不把 Goal 标完成。
- [OM-FREEPLAY]：`pnpm test:evals` / `test:bench` / mock-llm-core 在 W7 同会话已退出码 0，本 W 未再全量重跑以省时间；W13 会再跑。
- 验证：`git ls-files` 对 `asyncDeliveryQueueB1.test.ts` / `reentrantResume.test.ts` / `nativeTools.test.ts` 为空。`pnpm --filter @oasismind/server lint` 0；web lint 0（W8）。scenarioTestMap 3 passed；noVoidPromise 1；server 点名 7 files 84 passed。
- S1–S6 证据能否暂打 1：能（INV/map/契约表/nativeTools 拆分/evals 诚实/real 降权）。S7–S10 必须仍为 0（W10–W12 未做）。分列保持待验收。
- 遇到的问题：无。

## W10 推拉 PULL + 每日看板

- 根因复述：spy 了 notify ≠ 开着页会动；cron/approvals 缺 F5 水合；`/daily` 没有非 heading 过程 E2E。成功 = PUSH it 保留 + reload 后卡片仍在 + daily 看板/空态。
- 改动文件：`admin-live-push-mock.spec.ts` 追加两条 F5 it；`daily-board-mock.spec.ts`；`daily/page.tsx` 加 `daily-flow-board` / `daily-empty` testid（文案不改）；scenario 6/7 加 PULL asserts；testing.md 产品面表登记每日看板。
- 不改哪些面：不改 PUSH 既有 it；不 pushAdminUiState；不写库造今日任务；不硬塞 theme 进无关 scenario（Inbox 蒸馏已在场景 17）。
- [OM-FREEPLAY]：空列「暂无条目」加 `daily-empty`（三列都会有，空库也可见）；看板根加 `daily-flow-board` 对齐已有 id。
- 验证：`pnpm --filter @oasismind/web test:e2e:mock -- admin-live-push-mock daily-board-mock files-accept-hint gardens-list` 退出码 0（9 passed）；scenarioTestMap 绿。
- 遇到的问题：无。

## W11 运行时路径

- 根因复述：jsdom 抓不到 Next overlay；W8 源码闸只防写法。当初打脸的是 CancelledError unhandled rejection。notify 单测只 spy `pushExternalEvent`，不证明 hub 里真有事件。成功 = catchUnlessCancelled 锁静默、chat-mock 装 pageerror+unhandledrejection 守卫、notify 写入真 hub 且先推再订能重放。
- 改动文件：`apps/web/lib/__tests__/catchUnlessCancelled.test.ts`；`apps/web/e2e/helpers/pageErrorGuard.ts`；`apps/web/e2e/chat-mock.spec.ts`；`apps/server/src/__tests__/uiStateNotify.hub.test.ts`；`apps/server/src/infra/mockNativeTools.ts`（垫长，见下）。
- 不改哪些面：不改 `catchUnlessCancelled` 生产语义；不给全部 mock spec 挂守卫；不 `vi.mock(sessionStreamHub)`；不加 `__peekForTests`。
- [OM-FREEPLAY]：`installPageErrorGuard` 因必须 `await page.addInitScript` 改为 async，返回 `() => Promise<void>`。默认过滤列表为空。chat-mock 既有「全文已存」断言要求 compacted；实测垫 400 次仅 3945 字（阈值 4000），改 pad 为 500 次，不放宽断言。afterEach 在 page 已关闭时跳过 evaluate，避免失败测拖垮下一条。
- 验证：`pnpm --filter @oasismind/web test -- catchUnlessCancelled` 退出码 0（2 tests）；`pnpm --filter @oasismind/server test -- uiStateNotify.hub` 退出码 0（1 test）；`pnpm --filter @oasismind/web test:e2e:mock -- e2e/chat-mock.spec.ts` 退出码 0（2 passed）。滤名必须用 `e2e/chat-mock.spec.ts`，裸 `chat-mock.spec` 会误匹配 `scenario-partial-chat-mock.spec.ts`。
- 遇到的问题：chat-mock「全文已存」在垫长前红；属 W11 无法验收的预存断言/叶子尺寸错位，按范围外 bug 例外修了 mock 叶子。

## W12 server 纯测并行

- 根因复述：全量 singleFork 正确，但 chatHistory 这类零 DB 测也排队，内环痛。成功 = Vitest projects：`db` 保持 forks+singleFork+prisma setup；`pure` threads、无 prisma setup；至少 8 个测剪切进 `src/__tests__/pure/`；闸禁止相对 db import。
- 改动文件：`apps/server/vitest.config.ts`；`apps/server/src/__tests__/pure/*`（剪切 9 个 + `pureNoPrisma.test.ts`）；`docs/development/testing.md` 内环去掉「待 W12」；`scenario-test-map.json` heartbeatDecision 路径。
- 不改哪些面：不取消 db 的 singleFork；`importOrder.test.ts` 留在 db；`cooperativeAbort` / `credentialVaultEncrypt` / `compactCutPoints` / `writePolicy` / `stripFrontmatter` 不进 pure。
- pure 文件清单（≥8）：`abortReason` `chatHistory` `deepseekDsmlFilter` `heartbeatDecision` `processSafety` `safeHttpUrl` `searchRelevance` `toolEnvelope` `visibleSet`（另加闸 `pureNoPrisma`）。
- [OM-FREEPLAY]：闸正则由片段拼出，避免闸文件自己的源码被 `../db` 字面量误伤。候选里 `stripFrontmatter` 经 `scripts/sync/utils.js` 拉 `getAppConfig`（非 prisma，但偏重）未搬；`compactCutPoints`/`writePolicy` 测试文件已 `from "../db.js"`。
- 验证：`pnpm --filter @oasismind/server exec vitest run --project pure` 退出码 0（10 files / 65 tests）；`... exec vitest run --project db -- chatTree` 退出码 0（17）；scenarioTestMap 绿；`pnpm --filter @oasismind/server test` 退出码 0（247 files / 1668 tests）。
- 遇到的问题：闸第一版正则写在源码里，本文件被自己打红；已改拼正则。全量 `pnpm --filter @oasismind/server test` 另有两处预存红（与搬家无关）：`resilientLlmClient` 的 fetch mock 仍是 chat.completions 体，DeepSeek 已走 Responses API；`trpc` Run CRUD `pending→success` 违反 `isAllowedRunStatusTransition`。本 Goal 不改生产；测夹具对齐当前契约（jsonBody/sseBody 双写；Run 经 running）。

## W13 十分收尾

- 根因复述：S7–S10 落地后必须重新跑全量并填报告。没有十分表证据 = 没做完。施工员交卷等验收者打分，Goal 保持 active。
- 改动文件：本报告；`scenario-test-map.json` / `testing.md` 把 theme-toggle 挂到场景 1。
- 不改哪些面：不把 Goal 标 completed；不写 10/10；不 push；不取消 db singleFork；不加覆盖率门禁。
- [OM-FREEPLAY]：S7 要 map 挂主题过程 claim，W10 又禁止硬塞无关 scenario。挂场景 1，因为 `theme-toggle-mock.spec.ts` 本身 `goto("/chat")`。
- 验证：见「门禁」表。`408210cc` 已 fast-forward 进 master；merge 后在施工 worktree（当时与 master 同 SHA）复跑：server/web lint 0；`--project pure` 10/65；db `chatTree` 17；server 247/1668；web 72/374；mock-llm-core 141；evals 12/12；bench 24/24；本 Goal mock e2e 11 passed。
- 遇到的问题：无。施工员不准自评十分。

## W13′ S8 补 `/runs` 独立 F5

- 根因复述：S8 锁 `/cron` `/approvals` `/runs` 的 PUSH + F5。W10 只强制 cron/approvals 各一条独立 reload it；`/runs` 的 reload 叠在 PUSH 那条 it 里，验收者按标题检索会找不到「刷新页面…仍在」。
- 改动文件：`admin-live-push-mock.spec.ts` 追加 `/runs 创建 interrupted 后刷新页面 hint 仍在`；场景 7 map 把 PUSH claim 与 F5 claim 拆开。
- 不改哪些面：不 `pushAdminUiState`；不改生产 `/runs` 页。
- 验证：`pnpm --filter @oasismind/web test:e2e:mock -- admin-live-push-mock` 退出码 0（7 passed，含新 it）；`scenarioTestMap` 3 passed。首次跑因 `waitForUrl(http://127.0.0.1:3003/)` fetch failed 超时（Next 已印 Ready）；重跑即绿，属环境残留，未改 setup。master 已 ff 到 `627535e2`，同 SHA 再跑仍 7 passed。

## W13″ evals 文首与盘点勾完

- 根因复述：完成判定第 10 条禁止把 mock evals 写成「模型没变傻」。诚实声明是否定句，但 README 第 3 行导语仍是肯定「证明没变傻」。盘点表「留」行还标 pending，验收者会以为第 3 节没做完。
- 改动文件：`evals/README.md` 导语；本报告盘点「留」改 done、W13′ hash、S5 证据。
- 不改哪些面：诚实声明四条原文一字不改。
- 验证：本提交之后在 `14a8223c`（与当时 master 同 SHA）复跑 W13 全套门禁，见下表末行。
- [OM-FREEPLAY]：导语改写是为堵住 S5=0，不是改 W7 锁死的诚实声明块。

## 施工期发现的设计错误（与 testing.md 同步）

| 发现于 | 本文原句 | 错误原因 | 正确契约 |
|---|---|---|---|
| W3 | 「合并保留断言」针对 B4 resume 再入池 | 与重启不续跑铁律冲突 | 断言标 failed、零入池 | 是 |
| W7 | 优先 mock-llm-core 读 shared 常量当工具名 | shared 默认清单不含已注册 native `run_shell` | 金表 forbidTools 合法使用 `run_shell`；防漂源用 `listNativeTools()`，测放 server | 是 |

## 铁律冲突 / 未做

- B4：prompt 曾写「合并保留断言」，与 `AGENTS.md` 重启不续跑冲突 → 以铁律为准，testing.md 已记。
- 未做（禁止项）：覆盖率门禁、live LLM 进 CI、取消 db `singleFork`、`git add -A`、push、标 Goal completed。

## 残留（范围外发现、本 Goal 故意没修）

- 其它 mock spec 未挂 pageErrorGuard（prompt 只强制 chat-mock）。
- `pnpm --filter @oasismind/web test:e2e:mock -- chat-mock.spec` 会误匹配 `scenario-partial-chat-mock.spec.ts`；验收请用 `e2e/chat-mock.spec.ts`。
- `pnpm test:bench` 结束后 prisma teardown 可能打 `DATABASE_URL` stderr，退出码仍 0。
- 未跑全部 40+ mock spec（W13 只跑本 Goal 新/改过的 mock spec）。

## 门禁

| 命令 | 退出码 | 备注 |
|---|---|---|
| `pnpm --filter @oasismind/server lint` | 0 | tsc --noEmit |
| `pnpm --filter @oasismind/web lint` | 0 | 10 warning / 0 error（既有） |
| `pnpm --filter @oasismind/server test` | 0 | W12：247 files / 1668 tests（含 db+pure） |
| `pnpm --filter @oasismind/web test` | 0 | 72 files / 374 tests |
| `pnpm --filter @oasismind/mock-llm-core test` | 0 | 19 files / 141 tests |
| `pnpm test:evals` | 0 | 12/12 |
| `pnpm test:bench` | 0 | 24/24；拆卸期 prisma DATABASE_URL stderr |
| mock e2e（本 Goal 新/改 spec） | 0 | W13：当时 11 passed（尚无 `/runs` 独立 F5 it） |
| merge 后复跑（master=`408210cc`） | 0 | 与 W13 全量同数字 |
| mock e2e W13′ `/runs` F5 | 0 | `admin-live-push-mock` 7 passed；master=`627535e2` 后再跑仍 7 |
| **当前 HEAD 复跑（`14a8223c` 施工树）** | **0** | server/web lint 0；`--project pure` 10/65；server 247/1668；web 72/374；mock-llm-core 141；evals 12/12；bench 24/24；Goal mock e2e **12 passed** |
| **并入原仓 master 后再跑（`b51cffd1`）** | **0** | 原仓 `D:\ALL IN AI\OasisMind` master。server/web lint 0（web 10 warning）；`--project pure` 17 files / 103 tests（主干另有预算/校验纯测，闸仍绿）；server 247/1668；web 72/374；mock-llm-core 20/144；evals 12/12；bench 24/24；Goal mock e2e **12 passed** |
