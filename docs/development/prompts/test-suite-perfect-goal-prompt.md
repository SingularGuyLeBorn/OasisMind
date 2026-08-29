# 见微「测试做成满分」— Goal 模式执行目标

> **粘贴者**：把本文件从下一行「# 目标」起到文末，整段贴进见微 Chat 的 **Goal**（`/goal` 或 `session_goal_set`）。  
> 执行者是另一个 AI（Cursor / 见微 Agent 均可）。**禁止提问等你选方案**。设计已全部锁死；只准无脑按条施工。  
> **Goal 完成 = 提出本文件的人（当初评审测试的验收者）按 S1–S10 打出 10/10。** 施工员不准自评十分、不准把 Goal 标 completed。  
> 唯一交接物：[`../test-suite-perfect-goal-report.md`](../test-suite-perfect-goal-report.md)。施工完把该报告发回验收者。

---

# 目标

**本 Goal 完成的唯一标准：提出本文件、当初给测试打分的那个人（验收者），按第 1 节 S1–S10 能打出 10 分。**

不是「W 全打勾」、不是你自评十分、不是行覆盖 100%。你交回 [`../test-suite-perfect-goal-report.md`](../test-suite-perfect-goal-report.md) 之后，验收者按表打分；**合计 10/10 才算 Goal 达成。** 任何一条 S 被打 0，Goal 未完成，回来补那一条，再交。

W0–W13 是为了凑齐验收者会打 1 的证据。**W0–W9 单独大约 8 分**，验收者不会给 10；S7–S10 必须靠 W10–W13。

**你是施工员，不是打分人。** 报告里「分」列留空，写「待验收」。你只填证据，以及「为何验收者应打 1」。禁止在报告标题或合计栏写「10/10」或「已满分」。

遇到本文件没写清、或代码和本文冲突：不要停下来问人。按第 0 节「疑惑规则」处理，然后继续下一项。

---

## 0. Goal 模式怎么用（强制）

1. **立刻**把本目标设为当前会话 standing goal（见微：`session_goal_set` / `/goal`，status=active）。Cursor 里没有该工具时：在反馈报告「Goal 台账」逐条打勾，等价于 verifiedProgress。可用 `CreateGoal` 建一条 Cursor 台账，name=`测试十分（待原评审 10/10）`。
2. **禁止自评十分、禁止把「施工做完」当成 Goal 达成。** 每做完一个 W*，必须留下可核证据（测试命令退出码、文件:行）。报告「证据」列不准空口「已完成」。十分只由验收者在「验收者打分」节填写。
3. 你觉得「做完了」但某条 S 的证据还不能让验收者无争议打 1 → **不准**交卷。证据齐了：把报告交回验收者，等 10/10。见微 Goal 在验收者打出 10 之前保持 active / 不得标 completed。
4. 一次只做一个 W*。做完：该节点名测试绿 → 按主题 commit → 报告该节填完 → 下一项。
5. 用户改口走 IntentContract；**本文锁死的设计不准你自己改口。** 你觉得设计不合理：必须**同时**做到下面两件事，然后**仍按本文落地**（除非撞 `AGENTS.md` 铁律 → 该项标 `blocked`，写清撞了哪条）：
   - 代码或测试旁注释：`// [OM-FREEPLAY] 疑惑：…；本文要求：…；我实际：…；为何没改口：…`
   - 报告「异议与偏离」表加一行（位置 / 本文要求 / 我觉得不合理 / 实际落地 / 是否 OM-FREEPLAY）
6. **发现本文设计错误**（例如：本文要求合并保留的断言，与 `AGENTS.md`「服务重启不自动续跑」冲突；或要求 covered 的场景其实只有 heading 冒烟）：同样走第 5 条，**并且**把「本文错在哪、正确契约是什么」写进 `docs/development/testing.md` 的「施工期发现的设计错误」节。不要默默改设计，也不要假装没看见。

## 完成判定（逐条可验证）

**Goal 达成 = 验收者 S1–S10 全 1（10/10）。** 下面 1–10 是你交报告前必须备齐的证据；缺任何一项，验收者对应 S 会打 0。

1. W0–W13 在报告里均为 `done` 或明确 `blocked`（blocked 必须有现象 + 已试方案 + 卡在哪）。支撑某条 S 的 W 若 blocked → 该 S 验收者打 0 → **Goal 未达成**，补完再交，不准假装满分交卷。
2. `docs/development/testing.md` 已存在且含：分层、满分定义、十分打分表、内环命令（含 `--project pure`）、CI 诚实、施工期设计错误。
3. `scenario-test-map.json` 每条场景有 `asserts[]`；`scenarioTestMap.test.ts` 校验 `it` 子串落在对应文件内；**没有任何**仅靠 `*-real.spec.ts` 或「heading 可见」撑起来的 `covered`。
4. 第 3 节「该删」文件在工作树中不存在；「该合」源文件已删、断言迁到目标文件；「该补」测例已落且绿。
5. `pnpm --filter @oasismind/server lint` 与 `pnpm --filter @oasismind/web lint` 退出码 0。
6. 点名测试绿（每节列出）。收尾再跑：  
   `pnpm --filter @oasismind/server test`  
   `pnpm --filter @oasismind/web test`  
   `pnpm --filter @oasismind/mock-llm-core test`  
   若全量过慢：至少保证你改过的测试文件全绿，并在报告「门禁」写清跑了哪些、跳过全量的原因。**不得**用「太慢」跳过你改动直接相关的文件。
7. 本 Goal 新增或改过的 Playwright mock spec：`pnpm --filter @oasismind/web test:e2e:mock` 至少跑这些文件（可用 `--` 滤文件名）。未改 E2E 生产代码则不必 `build:mock`。
8. `docs/development/test-suite-perfect-goal-report.md` 按第 11 节模板填完（不是只改台账）。
9. `git status` 无本次遗留已跟踪未提交文件（忽略项除外）。每个 W* 独立 commit。禁止 `git add -A`。禁止 push。
10. 交付文案 / 测试名 / 文档 **禁止**出现「刷新一下就好」；禁止把 mock evals 写成「模型没变傻」。

## 环境与开局

- 仓库根：当前工作区根目录（Windows **PowerShell**：用 `;` 连接命令，不要用 bash `&&`）。
- 第一件事：通读根目录 `AGENTS.md`。铁律全部适用。与本文冲突时以 **AGENTS.md** 为准，冲突写入报告「铁律冲突」**和** `testing.md`「施工期发现的设计错误」。
- 第二件事：读本文第 1–3 节，把第 3 节总表抄进报告「盘点表」（状态先标 pending）。
- 不要为了自测去改 `.env`。不要提交 `.env` / `*.db` / 密钥 / `evals/reports/`。
- MockLLM：禁止 `vi.spyOn(llmClient)` / spy `resilientChatCompletion`。内核用 `enterInProcessMockLlm()`；E2E 走 `MOCK_LLM_URL`。
- 对话分支：`session.switchBranch` ≠ `session.fork`。
- 不要把 `apps/web/node_modules/@oasismind/server/**` 当源码改或当测试清单。那是 workspace 链接/拷贝，不在本 Goal 范围。

---

## 1. 「十分」锁死定义（不是覆盖率）

**打分人只有验收者**（提出本 Goal、当初写「测试写得咋样」的那个人）。施工员不准给自己打分。每项 0 或 1，不准 0.5。证据必须是文件:行或命令退出码。

当初批评的缺口与本表一一对应。W0–W9 只覆盖 S1–S6；**S7–S10 必须做 W10–W13**。验收者按「可验证标准」列打分：标准句在仓库里查得到 → 1；查不到或只有口头 → 0。

| 分 | 名称 | 当初哪条批评 | 可验证标准（1 分） | 主要 W |
|---|---|---|---|---|
| S1 | Chat 不变量层完整 | 「写得好的要保住」 | INV 手写 + `golden-traces` + PBT 三文件仍在；本 Goal **零**条新测用 `setTimeout`/`queueMicrotask`/`await hydrate` 赌时序。 | W2 留 |
| S2 | 场景不虚标 | covered 靠文件存在 | map 每条有 `asserts[]`；`scenarioTestMap.test.ts` 校验 `it` 子串；没有任何仅靠 heading / `*-real` / `cases.json` 撑起的 `covered`。 | W1 |
| S3 | 纪念碑变契约 | B1/C4/reentrant 文件名 | `asyncDeliveryQueueB*.test.ts`、`heartbeat*C*.test.ts`、`reentrantResume.test.ts` 不在工作树；契约表文件存在且 it 数 ≥ 旧文件合计。 | W3 |
| S4 | 工具测可按域跑 | nativeTools 2100 行 | `nativeTools.test.ts` 已删；`pnpm --filter @oasismind/server test -- nativeTools.fs` 能单独绿；搬家 `it(` 数不减。 | W4 |
| S5 | evals 诚实 | mock 绿冒充没变傻 | `evals/README.md` 有诚实声明；金表工具名防漂测绿；`pnpm test:evals` 与 `pnpm test:bench` 退出码 0。 | W7 |
| S6 | CI 闸诚实 | skip 的 real 算覆盖 | `*-real.spec.ts` 文件头有降权声明；map 里 `e2e-real` 不计 covered。 | W5 |
| S7 | 每天摸的产品面 | 花园/文件柜/每日偏瘦 | files 收件提示 E2E；gardens 列表或空态 E2E；`/daily` 非 heading 过程断言（W10）。主题切换已有 `theme-toggle-mock.spec.ts`，map 必须挂上过程 claim。 | W6+W10 |
| S8 | 推拉双通道都锁 | spy 通知 ≠ 开着页会动；缺 F5 水合 | `/cron` `/approvals` `/runs`：**PUSH**（已有 `admin-live-push-mock`，必须进 map asserts）+ **F5 后数据仍在**（W10 新 it）。Inbox 蒸馏过程已有则挂 map，没有则 W10 补一条只读/蒸馏钮态，禁止教刷新。 | W10 |
| S9 | 运行时路径可证 | 单测绿 ≠ 浏览器 unhandled rejection | W8 `noVoidPromise` 绿；`catchUnlessCancelled` 有单测锁 CancelledError 静默、其它 warn；至少 `chat-mock.spec.ts` 安装 `pageerror`+`unhandledrejection` 守卫，触发则该测红；`uiStateNotify` 有一条**不 mock hub**、从真实 `SessionStreamHub` 读出事件的测。 | W8+W11 |
| S10 | 内环可跑 | 全量 singleFork 太慢 | server Vitest **projects**：`db`（现况 singleFork）+ `pure`（不 import prisma，threads 可并行）。至少 8 个纯测文件进 `src/__tests__/pure/`；`pure` 目录有闸：源码不得出现 `from "../db`。`testing.md` 写清 `vitest --project pure`。不准把需要 prisma 的测塞进 pure 装快。 | W12 |

**验收者 S1–S10 全为 1 才是十分，才是本 Goal 完成。** 报告施工栏只填证据与「为何应打 1」；「分」列写待验收。缺一格能打 1 的证据 = 不要交卷。

### 十分不包括（做了也不加分，本 Goal 禁止做）

- 行覆盖率门禁、istanbul/c8 数字、为涨百分比加的无断言测试。
- 把真实 LLM / 真实 OCR 塞进 CI 必跑（S5/S6 的十分来自**诚实**，不是来自 live 绿）。
- 取消 db 项目的 `singleFork`（文件锁是正确性约束）。S10 只许给 **不碰 prisma** 的 pure 项目开 threads。
- 重写 Chat 三层 store、重写 mock-llm、新 npm 依赖、新状态机。
- QQ / 微信 / Telegram / 语音四入口 / Ollama 真连 / 多实例 的新测。
- 把所有 `admin-pages.spec.ts` heading 冒烟升级成交互。heading 冒烟**保留**，它测的是路由没 500，不是过程覆盖。
- 为「看起来对称」发明不存在的产品行为再写测。

---

## 2. 铁律（违反 = 返工）

1. **禁止打补丁**：不变量进 reducer / Service。测试里同样禁止 `setTimeout` 赌时序（PBT 里的 fake timer 除外，且必须 `vi.useFakeTimers` + 显式推进，禁止真等）。
2. **禁止把测红装绿**：不准删断言、`it.skip` 藏红、放宽既有断言。合并时断言必须搬家，条数只许持平或增加。
3. **禁止 `void <promise>`**。W8 会加源码闸。改前端连带清同文件残留。
4. **最小 diff**。不引入新架构、新依赖。新文件只允许本文点名的路径。
5. 注释 / commit / 文档：**中文**；标识符英文。commit：`<type>(<scope>): <中文摘要>`，正文写 why。
6. 用户没点名、本文也没锁死的超时/文案/阈值：必须 `[OM-FREEPLAY]`，并抄进报告。
7. 合并 ≠ 重写：先剪切 `it(...)` 块到目标文件，跑绿，再删源文件。禁止「我重新理解了一遍契约然后另写一套」。
8. 范围外 bug：写进报告「残留」，**本 Goal 不要修**（除非让 W* 无法验收）。

---

## 3. 按模块：该删 / 该合 / 该补（总表）

施工前把本表抄进报告。每做完一行把状态改成 `done`，并填目标路径。

图例： **删** = 文件从仓库消失（断言已迁走或确认与现存测完全重复）。**合** = 断言迁入目标后删源。**留** = 不准动文件归属（允许改断言以配合 map）。**补** = 新测或新字段。**改名** = 内容几乎不动，文件名改成契约名。

### 3.1 Chat 前端 store（`apps/web/lib/__tests__`）

| 动作 | 文件 | 目标 / 说明 |
|---|---|---|
| **留** | `chatStoreInvariants.test.ts` | INV 手写锁。合并卫星时把 `it` 收进对应 `describe("INV-x")`。 |
| **留** | `chatStoreGoldenTraces.test.ts` + `golden-traces/*.json` | 磁带。禁止改成 evals/golden。W1 后 asserts 必须引用具体 trace id。 |
| **留** | `chatStorePbtInvariants.test.ts` | PBT。禁止缩小 command 空间来让它变快（可保持现有 numRuns）。 |
| **留** | `prdChatStopTable.test.ts` `prdChatQueueTable.test.ts` | PRD 表。 |
| **留** | `chatQueueDrainLifecycle.test.tsx` | 真 hook 窗口，不是纯 reducer。不要并进 invariants。 |
| **留** | `helpers/chatStoreDrainModel.ts` `helpers/chatStoreInvariantAsserts.ts` | |
| **合** | `abortPartialAssistantId.test.ts` | → `chatStoreInvariants.test.ts` 或 `prdChatStopTable.test.ts`（看断言锁的是 INV 还是停止表）。 |
| **合** | `streamOnErrorIdle.test.ts` | → invariants。 |
| **合** | `streamLifecycleGhostStop.test.ts` | → invariants 或 stop 表（幽灵 Stop 是停止契约）。 |
| **合** | `streamLifecycleAbort.test.ts` | → invariants 或 stop 表。 |
| **合** | `upsertNoopNoInFlight.test.ts` | → invariants。 |
| **合** | `prefetchHydrateNoDrain.test.ts` | → invariants。 |
| **合** | `enqueueIdleDispatch.test.ts` | → `prdChatQueueTable.test.ts` 或 invariants（队列 drain 相关进 queue 表）。 |
| **合** | `claimActiveAbortController.test.ts` | → stop 表或 invariants。 |
| **合** | `liveStreamOwnership.test.ts` | → invariants。 |
| **留** | `useSessionMessages.test.ts` `messageUpsertMerge.test.ts` `hydrateFreshnessMerge.test.ts` `chatQueueMerge.test.ts` `chatQueueDrainHead.test.ts` `queueDrainClaimRollback.test.ts` `queueEditDraft.test.ts` `sessionTreeHydrate.test.ts` `chatTreeUi.test.ts` `chatTimelineCompact.test.ts` `adminPullIntervals.test.ts` `uiStateChannel.test.ts` `ackThenMarkDelivery.test.ts` | 数据合并 / 树 / 管理页拉间隔，不是 INV 碎片。不要为了「文件变少」硬并。 |
| **留** | `scenarioTestMap.test.ts` | W1 会改校验逻辑，不换文件。 |

合并后若 `chatStoreInvariants.test.ts` **超过 800 行**：按 INV 号拆成 `chatStoreInvariants.inv2.test.ts` 等，每个文件顶部用 5 行中文写清锁哪条 INV。不要拆成 20 个单 it 文件。

### 3.2 Chat 后端 / 工具管道（`apps/server/src/__tests__`）

| 动作 | 文件 | 目标 / 说明 |
|---|---|---|
| **留** | `sessionBranch.brutal.test.ts` `toolPipelineOffload.brutal.test.ts` `toolResultConclusion.brutal.test.ts` | 产品闭环。禁止改名丢掉 brutal（brutal = 负向旧实现必红）。 |
| **留** | `chatHistory.test.ts` `chatImageEnrich.test.ts` `compactCutPoints.test.ts` `chatTree.test.ts` `prdChatGoalTable.test.ts` `prdChatStopHub.test.ts` `prdApprovalTable.test.ts` `prdCronTable.test.ts` `prdAskUserTable.test.ts` `prdRunsTable.test.ts` `uiStateNotify.test.ts` `importOrder.test.ts` | |
| **合** | `asyncDeliveryQueueB1.test.ts` | → 新建 `asyncDeliveryReconciler.table.test.ts`。规则名 **R-exempt**：失败轻量任务 `deliveryExempt` 对账不循环。注释保留「旧称 B1」。 |
| **合** | `asyncDeliveryQueueB2.test.ts` | → 同上。**R-soft-claim**：superior drain 软认领 claimedAt，崩溃不丢。 |
| **合** | `asyncDeliveryQueueB3.test.ts` | → 同上。**R-wait-outside-pool**：autoConsume 不得在池槽内等 hub。 |
| **合** | `asyncDeliveryQueueB4.test.ts` | → 同上。**先读生产代码** `recoverStaleAsyncJobs`。若生产已「一律 failed、不入池」，B4 里任何「resume 再入池 / retryCount+1」断言与 `AGENTS.md` 铁律冲突：**改断言为「标 failed、零 runAgentLoop」**，并写入 testing.md 设计错误（本文曾写「合并保留断言」，铁律优先）。若 B4 只锁「二次 recover 不双入池」，保留该负向断言。 |
| **合** | `asyncDeliveryQueueB5.test.ts` | → 同上。**R-depth-server**：depth 服务端物化，LLM 传 depth 无效。 |
| **合** | `asyncDeliveryQueueB7.test.ts` | → 同上。**R-queue-unique**：`(sessionId, agentMessageId)` 唯一 + P2002 幂等。 |
| **留空** | 不存在的 B6 | 不要补造 B6。 |
| **合** | `heartbeatSchedulerC1.test.ts` `heartbeatRefreshC2.test.ts` `heartbeatCounterC4.test.ts` | → 新建 `heartbeatEngine.table.test.ts`（或并入已有 `heartbeatDecisionEngine.test.ts` 若并完仍 < 500 行）。规则名用中文句子，注释「旧称 C1/C2/C4」。 |
| **留** | `heartbeatDecision.test.ts` | 纯决策函数。不要和引擎集成测混文件。 |
| **合或删** | `reentrantResume.test.ts` | 文件名撒谎（reentrancy 已删）。把**不与** `startupRecovery.test.ts` 重复的 `it` 迁入 `startupRecovery.test.ts`，然后 **删** 本文件。禁止只改名留着 reentrant 字样。 |
| **改名** | `cClassRemainingAbort.test.ts` | → `nativeToolAbortSignal.test.ts`。describe 标题改成中文契约，注释可留「旧称 WP3b C 类」。 |
| **改名** | `safePathWriteD7.test.ts` | → `safePathWrite.test.ts`。 |
| **改名 it** | `processSafety.test.ts` 里 `M-21：...` | it 标题改成完整中文契约，去掉工单号；文件名可留。 |

### 3.3 Native 工具单测

| 动作 | 文件 | 目标 / 说明 |
|---|---|---|
| **合（拆文件）** | `nativeTools.test.ts`（约 2100 行） | 按下面锁死切分，**断言一行不丢**，然后删原文件。更新 `docs/development/README.md` §6「测试：nativeTools.test.ts 加用例」为「加到对应 `nativeTools.<域>.test.ts`，注册表测仍走 registry」。 |

锁死切分（describe 原样搬家）：

| 新文件 | 迁入的 `describe` |
|---|---|
| `nativeTools.registry.test.ts` | `Native 工具注册表` |
| `nativeTools.fs.test.ts` | `read_file` `write_file` `list_directory` `append_to_file` `file_delete` `file_rename` `file_move` `file_copy` `search_files` `directory_create` `file_stat` `directory_delete` |
| `nativeTools.knowledge.test.ts` | `post_create / post_update` `article_import` |
| `nativeTools.git.test.ts` | 所有 `git_*` |
| `nativeTools.memory.test.ts` | `memory_create / memory_search` |
| `nativeTools.web.test.ts` | `web_search` |
| `nativeTools.integration.test.ts` | `yuque_get_doc` `github_search_repos` `feishu_send_text` |
| `nativeTools.async.test.ts` | `task_run` `wait` `sleep` |
| `nativeTools.swarm.test.ts` | `spawn_subagent` `agent_send_message` `session_clear` |
| `nativeTools.shell.test.ts` | `run_shell` |

共享 fixture 继续用 `helpers/toolTestFixtures.ts`，不要复制一套。

### 3.4 E2E / evals / 产品面

| 动作 | 文件 | 目标 / 说明 |
|---|---|---|
| **留** | `admin-pages.spec.ts` `blog-smoke.spec.ts` | heading 冒烟。W1 后它们**不能**当某场景唯一 covered 依据。 |
| **留** | 全部 `e2e/*-mock.spec.ts`、fixture | 过程覆盖主路径。 |
| **留但降权** | `e2e/*-real.spec.ts` `chat-ocr-real.spec.ts` | 无 key skip 可以。W1：`layer: e2e-real` 不计 covered。不要删。不要把 skip 改成假绿断言。 |
| **补** | `e2e/files-accept-hint-mock.spec.ts`（新） | `/files`：`data-testid=files-accept-hint` 可见，文案含 `pdf` 与 `docx`。不要上传真 docx 撞浏览器。 |
| **补** | `e2e/gardens-list-mock.spec.ts`（新） | `/gardens`：至少一张花园卡片可点，或明确空态 `data-testid=gardens-empty`。若页面没有空态 testid 且列表恒有内容：只断言至少 1 个花园链接进 `/gardens/`。禁止只断言 h1。 |
| **改** | `evals/README.md` | 文首加 10 行「诚实声明」（W7 锁死原文）。 |
| **补** | `evals` 防漂单测（W7 点名路径） | golden JSON 的工具名 ⊆ 已注册 native/agent 工具名；每条 golden 能被 mock-llm 场景解析。 |
| **补** | `apps/web/lib/__tests__/noVoidPromise.test.ts` | W8。 |
| **补** | `apps/web/lib/__tests__/catchUnlessCancelled.test.ts` | W11。CancelledError/AbortError 静默；其它 `console.warn`。 |
| **补** | `apps/server/src/__tests__/uiStateNotify.hub.test.ts` | W11。真 hub，禁止 `vi.mock(sessionStreamHub)`。 |
| **补** | `admin-live-push-mock.spec.ts` 的 F5 it | W10。cron/approvals 各一条 reload 后卡片仍在。 |
| **补** | `e2e/daily-board-mock.spec.ts`（新）或扩现有 daily e2e | W10。`/daily` 非 heading。 |
| **补** | `apps/web/e2e/helpers/pageErrorGuard.ts` | W11。给 `chat-mock.spec.ts` 用。 |
| **补** | `apps/server/src/__tests__/pure/` + vitest projects | W12。至少 8 个文件。 |
| **补** | `docs/development/testing.md` | W0，W12 补内环命令。 |
| **改** | `docs/development/scenario-test-map.json` + `scenarioTestMap.test.ts` | W1。 |
| **改** | `AGENTS.md` 快速导航 | 加一行测试圣经指向 `testing.md`。只加一行，不准重写 AGENTS。 |

### 3.5 明确不要删

- 任何 `*.brutal.test.ts`
- `importOrder.test.ts`（循环依赖防线）
- `chatStorePbtInvariants.test.ts` / golden-traces
- mock-llm-core 下现有 `*.test.ts`
- `evals/golden/*.json`（可改 notes 加诚实声明，不准删 G01–G12）

---

## 工作流（每个 W* 都走完）

1. 用自己的话在报告该节写下：根因、成功长什么样、改哪些文件、不改哪些面。写不出先读代码，不准开写。
2. 按该节锁死设计改。
3. 跑该节测试 → 绿。
4. 相关 lint 绿。
5. 按路径 `git add` → commit（信息锁死在每节末尾，可微调动词，不准改主题）。
6. 填报告该节（证据、OM-FREEPLAY、异议）。再开下一项。

---

## W0 测试圣经 + 盘点（先做）

**根因**：测试约定散落在 AGENTS.md、各 PRD、scenario-test-map 注释里。下一个 AI 只会加文件，不会按分层。

**锁死设计**：

新建 `docs/development/testing.md`，必须含以下标题（顺序固定）：

1. `# 见微测试圣经`
2. `## 满分定义` — 抄本文第 1 节 **十分打分表 S1–S10**，不要发挥。写明：W0–W9 不够十分。
3. `## 四层` — 用这四行，一字不改：
   - 契约单测：reducer / Service / 纯函数 / PRD 状态表。CI 必跑。
   - mock E2E：Playwright + MOCK_LLM，断言过程（气泡、队列、审批续跑、禁止 F5）。CI `test:e2e:mock`。
   - mock evals：`pnpm test:evals` 只验证 mock-llm **场景命中与工具名约束**，不是模型质量。
   - 真 LLM：`*-real.spec.ts` 与 `pnpm test:bench -- --live` 为人工/有 key 周跑，**默认 CI 不计 covered**。
4. `## 内环命令` — 至少列出：
   - `pnpm --filter @oasismind/web test -- chatStore`
   - `pnpm --filter @oasismind/server test -- <文件名>`
   - `pnpm --filter @oasismind/server exec vitest run --project pure`（W12 落地后；W0 可先写「待 W12」）
   - 全量 server 的 **db 项目**是 `singleFork` 故慢，这是正确性不是缺陷。
5. `## 禁止` — spy LLM 管道；用文件存在冒充 covered；工单号当文件名（新文件）；`void promise`；教用户刷新。
6. `## 施工期发现的设计错误` — 表头：`发现于 W* | 本文原句 | 错误原因 | 正确契约 | 报告是否已记`。W0 时空表即可。
7. `## 场景 map 字段` — 抄 W1 的 JSON 形状。

改 `docs/development/README.md`「接下来读什么」加一条：

`- 测试分层与满分标准：\`testing.md\`。施工 Goal：\`prompts/test-suite-perfect-goal-prompt.md\`。`

`AGENTS.md` 快速导航表加一行：`测试圣经 / 满分标准` → `docs/development/testing.md`。

报告「盘点表」必须已粘贴本文第 3 节（可缩写成文件名列表 + 动作）。

**测试**：无新测。`pnpm --filter @oasismind/web lint` 不必为 md 跑；改了 AGENTS.md 不跑 tsc 也行。

**Commit**：`docs(test): 测试圣经与满分定义，禁止用覆盖率冒充质量`

---

## W1 场景 map：从「文件存在」升级到「过程断言」

**根因**：`scenarioTestMap.test.ts` 只检查 scenarios.md 标题对齐、且 `tests[]` 文件存在。于是 `blog-smoke` 一个 heading 就能让「写文章」标 covered。

**锁死设计**：

### JSON 形状

`docs/development/scenario-test-map.json` 每条 scenario **必须**变成：

```json
{
  "id": "1",
  "title": "…与 scenarios.md 完全一致…",
  "coverage": "covered",
  "note": "可选",
  "tests": ["apps/web/e2e/chat-mock.spec.ts"],
  "asserts": [
    {
      "file": "apps/web/e2e/chat-mock.spec.ts",
      "it": "必须是该文件里 it( 或 test( 标题的子串",
      "claim": "问候后出现助手气泡，过程中无需 F5",
      "layer": "e2e-mock"
    }
  ]
}
```

`layer` 枚举只许：`unit` | `e2e-mock` | `e2e-real` | `eval-mock`。

`tests[]` 继续保留（给人看），且每个路径文件必须存在。`asserts[].file` 必须存在。允许 `asserts[].file` 不在 `tests[]` 里，但必须存在；反之 `tests[]` 里的文件若完全不贡献 asserts，只当索引，**不能**靠它升级 coverage。

### 评级规则（代码里用测试锁死，不要靠自觉）

在 `scenarioTestMap.test.ts` **追加**（保留原有标题对齐）：

1. 每条 scenario 的 `coverage` ∈ `covered|partial|gap`。
2. `gap`：允许 `asserts` 为空；`note` 必须非空且说明为什么没测。
3. `partial`：`asserts.length >= 1`；允许过程覆盖不完整。
4. `covered` 必须同时：
   - `asserts.filter(a => a.layer !== "e2e-real").length >= 1`
   - 至少一条「计分断言」的 `claim` **不匹配** `/^(页面|heading|应正常渲染|正常渲染)/`
   - 该条 `claim` 长度 ≥ 8 个汉字或含「无需 F5」/「气泡」/「队列」/「落库」/「禁止」/「幂等」/「续跑」/「空态」/「芯片」之一（不够就写清楚过程，不要堆关键词凑）。若你发现这条关键词表会误伤诚实 claim：在 testing.md 设计错误里写，**仍执行本文**，可把正则扩成更严（只许更严不许更松到 heading 也能过）。
5. 每个 `asserts[].it`：`readFileSync(assert.file)` 的文本必须 `includes(assert.it)`，否则红。这是防漂：改了测试标题必须改 map。
6. `layer: eval-mock` 的 file 必须在 `evals/golden/` 或 `evals/harness-bench/cases.json` 或 `packages/mock-llm-core/**`。**单独一条 eval-mock 不足以 covered**，除非同场景还有 `unit` 或 `e2e-mock` 计分断言。例外：场景标题明确是「工具选择 / 禁止 write_file」且 claim 写的是 forbidTools——仍至少再要一条 unit 或 e2e-mock；没有就 `partial`。
7. `layer: e2e-real` 完全不计入 covered/partial 的条数门槛（可以出现在 asserts 里当文档）。

### 诚实改 coverage（锁死下限，只许更诚实）

逐条填 asserts。填完用规则打分。下列场景若你找不到过程断言，**必须**降为 `partial` 或 `gap`，不准硬留 covered：

- 场景 8「写文章」：仅 `blog-smoke` heading → 不够。`post-trash.spec.ts` 若有软删/恢复过程，可靠它 covered。
- 场景 18「视频转文字」：仅 `evals/harness-bench/cases.json` → 最多 `partial`（W6 **不准**为此新写不稳定视频 E2E；有现成 mock spec 过程再升级）。
- 任何只引用 `admin-pages.spec.ts` / `blog-smoke.spec.ts` 且没有其它过程 assert 的场景。

**禁止**为了保持 covered 去加「页面应正常渲染」冒充过程。

**测试**：`pnpm --filter @oasismind/web test -- scenarioTestMap`

**Commit**：`test(web): 场景 map 改为过程断言，禁止文件存在冒充 covered`

---

## W2 Chat 卫星测例合并

**根因**：INV 碎片散落 9 个文件，改一条停止契约要翻 10 处。

**锁死设计**：

按第 3.1 节「合」列剪切 `it` 块。目标文件用 `describe("原文件名不含.test")` 包一层，方便 git blame。源文件删除。更新 `scenario-test-map.json` 里 `tests[]` / `asserts[].file` 指向新家（W1 已跑过的会红，本 W 必须改到绿）。

`chatQueueDrainLifecycle.test.tsx` 不动。

禁止在合并时「顺手重构」store 生产代码。

**测试**：

```
pnpm --filter @oasismind/web test -- chatStoreInvariants
pnpm --filter @oasismind/web test -- prdChatStopTable
pnpm --filter @oasismind/web test -- prdChatQueueTable
pnpm --filter @oasismind/web test -- scenarioTestMap
```

以及所有你改过的目标文件。被删源文件不得再被 map 引用。

**Commit**：`test(web): 合并 Chat store 卫星测例到 INV 与停止表`

---

## W3 服务端纪念碑收成契约表

**根因**：`B1`–`B7`、`C1`/`C2`/`C4`、文件名 `reentrantResume` 是事故编号，半年后无法当规格读。

**锁死设计**：

1. 按 3.2 建 `asyncDeliveryReconciler.table.test.ts`：文件头用 Markdown 风格注释列出 R-* 表（规则名 / 旧称 / 一句话契约 / 负向：旧实现会怎样）。下面按 R 分组 `describe`。it 体从旧文件剪切。
2. 心跳 C* 同样收表。
3. `reentrantResume` → 并入 `startupRecovery.test.ts` 后删除。
4. 改名 `cClassRemainingAbort`、`safePathWriteD7`；改 `processSafety` 的 it 标题。
5. 全仓 grep `asyncDeliveryQueueB1` `reentrantResume` `safePathWriteD7` `cClassRemainingAbort` `heartbeatSchedulerC1`：文档若引用旧文件名，改为新名。`scenario-test-map` 一并改。
6. B4 与铁律冲突时：按第 3.2 行处理，写入 testing.md 设计错误。

**测试**：

```
pnpm --filter @oasismind/server test -- asyncDeliveryReconciler.table
pnpm --filter @oasismind/server test -- heartbeatEngine.table
pnpm --filter @oasismind/server test -- startupRecovery
pnpm --filter @oasismind/server test -- nativeToolAbortSignal
pnpm --filter @oasismind/server test -- safePathWrite
pnpm --filter @oasismind/server test -- processSafety
```

若心跳并入 `heartbeatDecisionEngine.test.ts` 而没有新文件：跑该文件，报告写清路径。

**Commit**：`test(server): 异步投递与心跳纪念碑测例收成契约表`

---

## W4 拆 `nativeTools.test.ts`

**根因**：单文件 2100 行，内环无法按域跑，评审无法看 diff。

**锁死设计**：按 3.3 切分。每个新文件第一行注释：`从 nativeTools.test.ts 剪切，断言不改`。禁止修工具生产代码。禁止「顺便让 skipIf(!hasGit) 永远 skip」。

`helpers/toolTestFixtures.ts` 的 `ALL_NATIVE_TOOL_NAMES` 仍由 `nativeTools.registry.test.ts` 使用。

更新 README §6 测试指引。

**测试**：

```
pnpm --filter @oasismind/server test -- nativeTools
```

（应跑到所有 `nativeTools.*.test.ts`。）统计：搬家前后 `it(` 数量必须 ≥ 原文件。在报告写两个数字。

**Commit**：`test(server): 按域拆分 nativeTools 单测，断言不丢`

---

## W5 E2E / skip 诚实（不删 real 套件）

**根因**：无 key 的 `*-real.spec.ts` 在 CI 里 skip 仍算「有测试文件」；map 一旦引用它们当 covered 就虚。

**锁死设计**：

1. 每个 `*-real.spec.ts` 文件头（已有则改）必须有这段中文（可换行）：  
   `本文件不计 scenario-test-map 的 covered。无 DEEPSEEK_API_KEY（或文件内写明的其它条件）时 skip。不要把 skip 当回归。`
2. `chat-ocr-real.spec.ts` 里「时长不稳定暂不纳入 CI」的 `test.skip`：**保持 skip**，不要改成会在 CI 红的真跑。在 testing.md 记一行「OCR real 人工」。
3. `playwright.config.ts` 不必改 ignore。不要把 real 套件从目录删走。
4. 扫 `scenario-test-map.json`：任何 `asserts.layer === e2e-real` 不得是该场景唯一计分断言（W1 测试应已锁；本 W 修数据直到绿）。

**测试**：`pnpm --filter @oasismind/web test -- scenarioTestMap`

**Commit**：`test(e2e): 真实 LLM 套件降权，skip 不得冒充 covered`

---

## W6 产品面补两条真路径

**根因**：Chat 测到停止表，花园/文件柜几乎只有 heading。满分 M6。

**锁死设计**：

### files

新文件 `apps/web/e2e/files-accept-hint-mock.spec.ts`：

- `testMatch` 已含 `*mock.spec.ts`，会进 mock 套件。
- `goto /files`，`getByTestId("files-accept-hint")` visible，`toContainText(/pdf/i)` 且 `toContainText(/docx/i)`。
- 不要 `setInputFiles` 传 docx。
- 若 testid 不存在：先按已落地的 files 页补 testid（文案已有则只加 testid），这是为了让测能钉住，不算新功能。

### gardens

新文件 `apps/web/e2e/gardens-list-mock.spec.ts`：

- `goto /gardens`。
- 优先：至少 1 个指向 `/gardens/` 的链接可见。
- 若环境可能空列表：允许空态 testid；空态与列表 **二选一可见**（`expect.poll` 其中之一）。不要只查 h1。
- 禁止新建花园（会写 content/）。只读页面。

把这两条加进 scenario-test-map：**不要新造 scenarios.md 标题**。挂到最接近的现有场景：

- files → 若没有专属场景：加到场景 8 的 asserts **不够**（场景 8 是写文章）。锁死：在 map 的场景 8 `note` 里写「文件柜收件提示见 files-accept-hint-mock，不升格为写文章 covered 依据」。另：若 scenarios.md **没有**文件柜场景，不要改 scenarios.md（那是产品场景文档，本 Goal 不准扩场景清单）。files 测仍要存在，在 `testing.md`「产品面补测」列出来。gardens 挂场景 11 或 13 仅当 claim 真的是花园阅读；若只是列表页，同样只写进 testing.md 产品面表，**不要**为了挂 map 而污染「划词解释」场景。

**本 W 的 map 规则**：新 E2E 以产品面清单为准，不强行塞进不相关 scenario id。

**测试**：mock e2e 滤文件名 `files-accept-hint` 与 `gardens-list`。web 单测 map 仍绿。

若 mock e2e 需要 `build:mock`：PowerShell：

`$env:NODE_OPTIONS='--max-old-space-size=8192'; pnpm --filter @oasismind/web run build:mock`

然后 `pnpm --filter @oasismind/web test:e2e:mock -- files-accept-hint-mock` 等。

**Commit**：`test(e2e): 文件柜收件提示与花园列表过程断言`

---

## W7 evals 诚实与金表防漂

**根因**：`pnpm test:evals` 绿只说明 mock-llm 关键词命中了 `expectToolsAnyOf`。文档却容易让人以为「Agent 没变傻」。

**锁死设计**：

1. `evals/README.md` 在现有「目标」小节**之前**插入（原文锁死）：

```markdown
## 诚实声明（必读）

- `pnpm test:evals`（mock）**不是**模型质量测试，也**不能**证明换模型/改 prompt 之后「没变傻」。
- 它只证明：给定用户句 → mock-llm 场景解析到的名字/关键词 → 命中 JSON 里的 `expectToolsAnyOf` / `forbidTools`。
- 真模型效果：`pnpm test:bench -- --live ...`，报告在 `evals/reports/`（gitignore），人工看。默认 CI 不跑 live。
- 禁止在 PR 描述或测试注释里写「evals 绿 = 智能回归通过」。
```

2. 新建 `packages/mock-llm-core/src/evalGoldenSync.test.ts`（或 `apps/server/src/__tests__/evalGoldenSync.test.ts`，二选一，优先 mock-llm-core，因为场景解析在那边）：

   - 读 `evals/golden/*.json`（G01–G12 现有的全部）。
   - 每个 `expectToolsAnyOf` / `forbidTools` 的字符串，必须是当前 native 工具名或明确的 agent 工具名。工具名列表：从 `@oasismind/shared` 已有常量，或 `listNativeTools()`（若在 server 测）。不要手抄一份会漂的数组。
   - 每个 golden 的 `userMessage` 在 **不** 强制 `MOCK_LLM_SCENARIO` 时，`resolveScenario({ userMessage })` 不得抛；允许落到 catchAll，但报告里列出 catchAll 的 id。若 catchAll 导致 `expectToolsAnyOf` 在 mock 运行时不可能命中：该用例标 `partial` 说明，或给 mock-llm 补 **只加关键词** 的场景（禁止 spy）。补场景必须在 `scenarioDefs.ts` 用现有风格，并在 `chatCoverage.ts` 加一行赢家（若该表仍是强制金表）。
   - 本 Goal **不准**为了绿而清空 `expectToolsAnyOf`。

3. `evals/harness-bench/cases.json` 不删。在 README mini Harness 节加一句：mock bench 同样不是模型质量。

**测试**：`pnpm test:evals`；`pnpm --filter @oasismind/mock-llm-core test`（或 server 的 evalGoldenSync）；`pnpm test:bench`（mock，零成本）。

**Commit**：`test(evals): 声明 mock evals 非模型质量，并锁金表工具名防漂`

---

## W8 禁止 `void promise` 源码闸

**根因**：AGENTS.md 已禁 `void refetch/invalidate`，jsdom 单测绿抓不到浏览器 unhandled rejection。没有机器闸就会再犯。

**锁死设计**：

新建 `apps/web/lib/__tests__/noVoidPromise.test.ts`：

- 递归扫描 `apps/web` 下 `.ts` `.tsx`，排除：`node_modules`、`.next`、`e2e`、`**/*.test.ts`、`**/*.test.tsx`、`**/*.spec.ts`。
- 失败条件：源码出现匹配  
  `void\s+[^;\n]*(refetch|invalidate|mutateAsync|prefetch|writeText)\s*\(`  
  或 `void\s+utils\.` 或 `void\s+query\.`
- 允许：`void 0`；注释里的 `void`；类型位置。不要用完整 TS parser（禁止新依赖）。假阳性时：把该行改成 `.catch(() => {})` 而不是给测试开白名单文件。若某行是真正的非 Promise void（几乎不应匹配上面正则），在报告异议记一行，**收紧正则**而不是 `it.skip`。
- 本 W **必须**把扫描到的生产代码违规改掉（`.catch(() => {})` 或 await+try），这是铁律欠债，不算范围外。

server 前端没有同等问题则不必扫 `apps/server` 的 React（无）。不要扫 markdown。

**测试**：`pnpm --filter @oasismind/web test -- noVoidPromise`；web lint。

**Commit**：`test(web): 源码闸禁止 void refetch/invalidate，并清现存违规`

---

## W9 中段门禁（只验收 W0–W8，不是十分）

**根因**：后面 W10–W13 还要改 e2e / vitest 配置；这里先锁结构改造没把已有测弄红。

**锁死设计**：

1. grep 旧路径：`asyncDeliveryQueueB1` `reentrantResume.test.ts` 作为测试文件路径、卫星旧文件名。`testing.md` 可在「旧称对照」列一行。
2. 跑：

```
pnpm --filter @oasismind/server lint
pnpm --filter @oasismind/web lint
pnpm --filter @oasismind/web test -- scenarioTestMap
pnpm --filter @oasismind/web test -- noVoidPromise
pnpm --filter @oasismind/mock-llm-core test
pnpm test:evals
pnpm test:bench
```

server 全量可放到 W13。本 W 至少跑 W3/W4 点名文件。

3. 报告写清：S1–S6 能否暂打 1；S7–S10 必须仍为 0（尚未 W10–W12）。

**Commit**：仅当有文档/测补丁：`docs(test): 测试结构改造中段门禁`  
无 diff 允许不 commit。

---

## W10 推拉 PULL + 每日看板（S7、S8）

**根因**：当初批评「spy 了 notify ≠ 开着的页会动；F5 水合靠信念」。`admin-live-push-mock.spec.ts` 已锁 **PUSH、无需刷新**，但 cron/approvals **没有**「reload 后卡片仍在」。`/daily` 没有非 heading 过程 E2E。files/gardens 在 W6。

**锁死设计**：

### A. F5 = PULL

在 `apps/web/e2e/admin-live-push-mock.spec.ts` **追加**两条（不要改坏现有 PUSH it）：

1. `/cron`：tRPC `agentCron.upsert` 成功后 `page.reload()`，以 job `name` 为 heading 的卡片 **仍可见**。finally 里 `agentCron.clear`。不要 `pushAdminUiState`（测的是水合不是 BC）。
2. `/approvals`：tRPC `approval.create` pending 后 `page.reload()`，`approval-card` filter marker **仍可见**。finally delete。

`/runs` 已有 `page.reload()` + interrupted hint：在 map 里用这条当 runs 的 PULL assert，不必再写一条除非它其实没断言水合。

### B. `/daily`

新文件 `apps/web/e2e/daily-board-mock.spec.ts`：

- `goto /daily`，h1「每日看板」可见（冒烟不够）。
- **再**断言下列之一（按页面现有 DOM 选，不准发明产品）：
  - `data-testid` 含 `daily` 的卡片/列表至少 1 个；或
  - 明确空态文案（页面上已有的中文，抄进 expect）+ testid（没有 testid 就给空态根节点加 `data-testid="daily-empty"`，文案不改）。
- 禁止写库创建今日任务来「制造数据」，除非不写就无法区分空态与挂掉（若必须写：用 tRPC 且 finally 删掉，并 `[OM-FREEPLAY]` 记报告）。

### C. map

场景 6/7 的 asserts 必须同时有：

- PUSH：`无需刷新` + `admin-live-push-mock` 里现有 it 标题子串
- PULL：本 W 新 it 标题子串 + claim 含「刷新后仍」

Inbox：`scenario-product-gaps-mock` 里蒸馏钮过程挂到场景 17。主题：`theme-toggle-mock` 挂到 testing.md 产品面表；不要硬塞进无关 scenario id。

**测试**：mock e2e 滤 `admin-live-push-mock` `daily-board-mock` `files-accept-hint` `gardens-list`；`scenarioTestMap` 绿。

**Commit**：`test(e2e): cron/审批 F5 水合与每日看板过程断言`

---

## W11 运行时路径（S9）

**根因**：jsdom 抓不到 Next overlay；`void promise` 源码闸（W8）只防写法。当初打脸的是 **CancelledError unhandled rejection**。notify 单测只 spy `pushExternalEvent`，不证明 hub 里真有事件。

**锁死设计**：

### 1. `catchUnlessCancelled` 单测

新建 `apps/web/lib/__tests__/catchUnlessCancelled.test.ts`：

- `isCancelledOrAbortError`：`name=CancelledError`、`name=AbortError`、`message=CancelledError` 为 true；普通 Error 为 false。
- `catchUnlessCancelled("t")`：对 CancelledError **不** `console.warn`；对其它 Error 调用 `console.warn`（`vi.spyOn(console, "warn")`）。这是锁铁规，不是 spy 管道。

读 `apps/web/lib/trpc.tsx` 现有实现，禁止改生产语义。

### 2. E2E 页错误守卫

新建 `apps/web/e2e/helpers/pageErrorGuard.ts`：

```ts
export function installPageErrorGuard(page: import("@playwright/test").Page): () => void
```

监听 `pageerror` 与 Playwright 的 `page.on("console")` 里 type=error **不够**。必须：

```ts
await page.addInitScript(() => {
  window.addEventListener("unhandledrejection", (e) => {
    (window as unknown as { __omUnhandled?: string[] }).__omUnhandled ??= [];
    (window as unknown as { __omUnhandled?: string[] }).__omUnhandled!.push(String(e.reason));
  });
});
```

在 `chat-mock.spec.ts` 的 `beforeEach` 安装；每个 test 结束前 `evaluate` 读 `__omUnhandled`，**非空则 fail**（允许过滤 `favicon` 之类？**不允许**开白名单文件。若环境必有一条已知噪声：在 helper 里写死过滤子串，注释 `[OM-FREEPLAY]` 并报告。默认过滤列表为空）。

同时 `page.on("pageerror", err => { throw err })` 或收集后 expect 空。

不要给全部 40 个 mock spec 立刻挂上（易把本 Goal 变成修预存 pageerror）。**只强制 chat-mock.spec.ts**。其它 spec 预存 pageerror 写报告「残留」，S9 仍可 1。

### 3. notify → 真 hub

新建 `apps/server/src/__tests__/uiStateNotify.hub.test.ts`：

- **禁止** `vi.mock("../infra/sessionStreamHub.js")`。
- `setStreamHub(new SessionStreamHub({ ringSize: 50, persist: false, eventTtlMs: 5000, cleanupIntervalMs: 0 }))`。
- prisma 可用现有 fake `findMany` 返回 `[{ id: "sess-1" }]`（notify 的 prisma 依赖可以是浅 fake，hub 必须是真的）。
- **读口锁死**：用生产方法 `hub.subscribeExternal("sess-1", cb)`。顺序必须是 **先 `notifyCronJobUpdated`，再 subscribe**（证明 externalRing 重放，不是只测同步 callback）。收到的事件里至少一条 `type === "cron_job_updated"`。
- **禁止** 为测试给 Hub 加 `__peekForTests` / `__readExternalEventsForTests`。
- afterEach 退订 + `setStreamHub(null)`。

保留原 `uiStateNotify.test.ts` spy 测（函数参数契约）。S9 要的是**新增**这条可观测测。

**测试**：

```
pnpm --filter @oasismind/web test -- catchUnlessCancelled
pnpm --filter @oasismind/server test -- uiStateNotify.hub
```

chat-mock e2e：`pnpm --filter @oasismind/web test:e2e:mock -- chat-mock.spec`

**Commit**：`test: 锁 CancelledError 静默、Chat E2E 拒 unhandledrejection、notify 写入真 hub`

---

## W12 server 纯测并行（S10）

**根因**：全量 `singleFork` 正确，但 `chatHistory` 这种零 DB 测也排队，内环痛。当初批评「工程代价」。

**锁死设计**：

改 `apps/server/vitest.config.ts` 为 Vitest **projects**（v3 已支持，不要新依赖）：

1. 项目名 `db`：
   - `include`: `src/__tests__/**/*.test.ts`
   - `exclude`: `src/__tests__/pure/**`
   - 保持现有 `globalSetup` `setupPrismaIsolation` `pool: forks` `singleFork: true` `testTimeout: 30000`
2. 项目名 `pure`：
   - `include`: `src/__tests__/pure/**/*.test.ts`
   - **不要** prisma setup / globalSetup
   - `pool: threads`（不要 forks）
   - `testTimeout: 15000`

新建 `src/__tests__/pure/pureNoPrisma.test.ts`：扫描同目录 `*.test.ts`，文件文本不得匹配 `from ["']\\.\\./db` 或 `from ["']\\.\\./db\\.js` 或 `from ["']\\.\\./\\.\\./db`。命中则红。

**搬家**：从 `__tests__/` 根把**当前不 import prisma/db** 的测例 **剪切**进 `pure/`（至少 8 个文件）。候选（搬家前打开文件确认；import 了 prisma 的留下）：例如 `chatHistory.test.ts` `compactCutPoints.test.ts` `safeHttpUrl.test.ts` `stripFrontmatter.test.ts` `toolEnvelope.test.ts`（若无 db）`writePolicy.test.ts` 若有 prisma 则不要。以 grep `from "../db` 为准，不要猜。

不准把 `importOrder.test.ts` 放进 pure（动态 import 会拉起半个应用）。

`pnpm --filter @oasismind/server test` 必须两个 project 都跑（vitest 默认跑 config 内全部 projects）。`testing.md` 内环写：

`pnpm --filter @oasismind/server exec vitest run --project pure`

更新 scenario-test-map 里若引用了被搬家文件的路径。

**测试**：`--project pure` 绿；`--project db -- chatTree` 仍绿；全量 server test 绿。报告写 pure 文件清单（≥8）。

**Commit**：`test(server): 纯测拆 Vitest pure 项目，内环可并行`

---

## W13 十分收尾

**根因**：S7–S10 落地后必须重新跑全量，并在报告打分。没有十分表 = 没做完。

**锁死设计**：

1. grep 确认 W3/W4 旧文件不在；pure 闸绿；map 绿。
2. 门禁：

```
pnpm --filter @oasismind/server lint
pnpm --filter @oasismind/web lint
pnpm --filter @oasismind/server test
pnpm --filter @oasismind/web test
pnpm --filter @oasismind/mock-llm-core test
pnpm test:evals
pnpm test:bench
```

3. 本 Goal 新/改 mock spec 跑 e2e mock。
4. 填完整报告：台账 W0–W13、异议、盘点、设计错误、门禁退出码、commit hash。十分打分表只填「证据」和「为何验收者应打 1」，「分」列全部写 `待验收`。
5. 把报告交回验收者。见微 Goal **保持 active**，直到验收者在「验收者打分」节填出 10/10。你不得把 Goal 标 completed。

**Commit**：仅当有补丁：`docs(test): 测试十分 Goal 收尾对照`；无代码 diff 可不 commit。

---

## 明确禁止（抽查到即返工）

- 新 npm 依赖；覆盖率门禁；live LLM 进 CI。
- `git add -A` / `--no-verify` / push / 改 git config。
- 重写 Chat 三层 store / mock-llm 协议。
- 为涨 covered 把 heading 冒烟写成过程 claim。
- 删 brutal / 删 golden JSON / 把 real spec 改成假断言。
- 教用户刷新；spy `llmClient`。
- 改 `apps/web/node_modules/@oasismind/server`。
- 施工员在报告里给自己打 10 分、写「已满分」、把见微 Goal 标 completed。

---

## 11. 报告模板（唯一交接物）

路径：`docs/development/test-suite-perfect-goal-report.md`。按下面填，不要删节。

```markdown
# 测试做成满分 — Goal 执行报告

- 执行者：
- 开始 / 结束：
- 见微 Goal / Cursor 台账：是否 setGoal、最终 status

## Goal 台账（等价 verifiedProgress）
| W | 状态 done/blocked | 证据（命令退出码或文件:行） | commit |

## 十分打分表（施工员填证据；分列写待验收）
| S | 分（待验收） | 证据 | 为何验收者应打 1 |
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
| S1–S10 | | |
| **合计** | /10 | 10/10 才算 Goal 达成 |

## 异议与偏离
| 位置 | 本文要求 | 我觉得不合理的点 | 实际落地 | 是否 [OM-FREEPLAY] |

## 盘点表（本文第 3 节）
| 动作 | 文件 | 状态 | 最终路径 |

## W0 …
- 根因复述：
- 改动文件：
- [OM-FREEPLAY]：
- 验证：
- 遇到的问题：
（W1–W13 同构）

## 施工期发现的设计错误（与 testing.md 同步）
| 发现于 | 本文原句 | 错误原因 | 正确契约 |

## 铁律冲突 / 未做
## 残留（范围外发现、本 Goal 故意没修）
## 门禁（lint / 点名测试 / 全量 / evals / bench / e2e mock）
```

**出问题先写报告再继续。** 施工员把报告发回提出 Goal 的人。Goal 是否完成以验收者 10/10 为准。

---

## 停止规则

- 同一 W* 测试修 3 轮仍红：标 blocked，写现象。支撑 S 的 W blocked → 不准交「请打 10 分」的卷，先补或换路径直到该 S 有证据。
- 证据齐、commits 按主题：交报告，见微 Goal **仍 active**，等验收者打分。
- 验收者打出非 10：Goal 未完成，按扣分原因补对应 W/S，再交。
- 不要把 worth-doing.md / QQ / Ollama 自行加进范围。

---

## 建议见微 Goal 文案（短）

若 UI 限制 Goal 字数，用这段，细节仍以本文件为准：

```
按 docs/development/prompts/test-suite-perfect-goal-prompt.md 施工 W0–W13。Goal 完成的唯一标准：交回 test-suite-perfect-goal-report.md 后，提出本 Goal 的人按第 1 节 S1–S10 能打 10 分。施工员不准自评十分、不准把 Goal 标 completed。W0–W9 单独约 8 分不够。禁止提问改设计；疑惑写 [OM-FREEPLAY] 与报告。禁止覆盖率门禁、live LLM 进 CI、取消 db 的 singleFork、git add -A 与 push。
```
