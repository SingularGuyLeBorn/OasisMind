# 数字主力最后一公里 — Goal 执行报告

- 执行者：Cursor Agent（GLM 5.2）
- 开始：2026-08-29 / 结束：2026-08-30
- 见微 Goal / Cursor 台账：已 `CreateGoal`，W1–W7 全 done
- 分支：`feat/worth-doing-w1-w7`（W1–W7 按主题 commit）。施工期间外部进程在 `feat/test-suite-perfect` 并行推进测试套件并多次切换工作树，曾致 W7 与报告误落到该分支；已全部移回本分支并把 `feat/test-suite-perfect` 复位到其自身 tip，两分支互不污染。

> 范围与锁死设计以 `docs/development/prompts/worth-doing-goal-prompt.md` 为准。本文是唯一交接物，逐项填证据，不空口「已完成」。

## Goal 台账（等价 verifiedProgress）

| W | 状态 | 证据 | commit |
|---|---|---|---|
| W1 | done | web lint 退出码 0；`experiments.md:14-21`；`files/page.tsx:85,91-93,101` | 2277aab2 |
| W2 | done | server `chatTree` 17 passed；web `chatSessionTreeBar` 9 passed；lint 0；E2E 已写待跑 | af220b08 |
| W3 | done | server `chatHistory` 17 + `chatImageEnrich` 3 + `autoCompact/compactDataLeakage` 18 + `mock-llm-core` 141 passed；lint 0 | df6a0ce7 |
| W4 | done | server `inboxDistill` 11 + `mock-llm-core` 141 passed；lint 0；E2E 已写待跑 | b60fefd5 |
| W5 | done | server `morningBrief` 1 passed；lint 0 | 6339f1c4 |
| W6 | done | server `workspaceStages+swarmHarnessExtras` 3 + web `chatStagesPanel` 3 passed；lint 0 | 4f952c85 |
| W7 | done | web `chatGoalBar` 3 passed；lint 0；E2E 已写待跑 | 571a6a3e |

## 异议与偏离

无异议。所有 [OM-FREEPLAY] 已在对应 W 节列明。

## W1 实验表冻结 + 文件柜诚实

- 根因：`experiments.md` 到期日过仍 active；`/files` 文案像网盘但 accept 只收 image/pdf/zip/txt。
- 改动：`experiments.md`（Swarm/审批/ChatStore done，Ollama/Inbox freeze，加「非施工清单」注）；`files/page.tsx`（description/EmptyState 诚实化，加 `files-accept-hint`，accept 不变）。
- [OM-FREEPLAY]：无。
- 验证：web lint 退出码 0；files 无单测按 W1 不加 Playwright。
- 问题：master 上预存 1 个 web lint error（`sessionArtifactsStrip.tsx` setState-in-effect），单独 `fix` 提交修掉（b7e74ac0），未算入 W1。

## W2 Chat 书签接到气泡与树条

- 根因：`message.setLabel` 已推 `message_upserted`，`MessageActions` 有 `showBookmark` 但列表从未传 true。
- 改动：`chatTree.ts`（`setMessageLabel` 返回 previousLabel）；`messageService.ts`（`setLabel` 变更时补推 `notifySessionTreeUpdated`，幂等）；`chatMessageList.tsx`（两处 `MessageActions` 接线，`trpc.message.setLabel` mutation，禁止 `void`）；`chatSessionTreeBar.tsx`（`chat-bookmark-chip`，`subtreeTipId` 切叶，当前叶 disabled）；补测 + E2E。
- [OM-FREEPLAY]：无。
- 验证：server `chatTree` 17 + web `chatSessionTreeBar` 9 passed；lint 0。E2E 已写待跑。
- 问题：闭包内 `group.assistantMessage` TS 不窄化，捕获 `assistantLabel/assistantKind` const 解决。

## W3 贴图默认识图

- 根因：vision 模型只把 `data:` 图进 image_url，相对路径隐形；纯文本模型无 extractedText 时两眼一抹黑。
- 改动：新建 `chatImageForLlm.ts`（`resolveImageUrlForLlm`，4MiB 上限，内网拒绝）；新建 `chatImageEnrich.ts`（persist 前静默识图）；`chatHistory.ts`/`autoCompact.ts`/`agentStream/index.ts`/`persist.ts`（透传 config + 写库前 enrich）；`messageRouter.ts`（`enrichImages` mutation）；`readImage.ts`（抽出 `describeImageWithVision`）；`scenarioDefs.ts`（`vision_describe` 场景）；`chatMessageList.tsx`（红灰 + 重试按钮）；单测。
- [OM-FREEPLAY]：vision 4MiB、enrich 20s 超时（本文锁死）；strong_free 不可用 fallback lite；跳过图给文本提示。
- 验证：`chatHistory` 17 + `chatImageEnrich` 3 + `autoCompact/compactDataLeakage` 18 + `mock-llm-core` 141 + `agentRun*` 18 passed；lint 0。
- 问题：最小 config 缺 llm 致 mock 读 provider 报错，改用 `getAppConfig()` 覆盖 projectRoot；post fixture 字段名误用，改 schema 字段；联合类型取 extractedText 需守卫。

## W4 Inbox 蒸馏可选改写

- 根因：`InboxService.distill` 只 format+post_create，PRD 曾放弃 LLM 改写；本 Goal 重开但可选，默认行为不变。
- 改动：`schemas.ts`（`inboxDistillSchema` 加 `mode: raw|taste` 默认 raw）；`inboxService.ts`（`distillTasteBody`：读 USER.md + 花园摘录 + lite_free 改写，25s 超时，失败保持 fetched，丢 URL 强制追加）；`inbox.ts`（工具传 mode）；`scenarioDefs.ts`（`inbox_distill_taste` + `MOCK_TASTE_FAIL_TOKEN`）；`inboxDistill.test.ts`（默认经 parse 同旧 + taste 成文 + 抛错）；`inbox/page.tsx`（`inbox-distill-mode` segmented）；E2E。
- [OM-FREEPLAY]：taste 25s 超时（本文锁死）；失败测用 fail token（仿 branch_summary_fail）；花园摘录前 800 字。
- 验证：`inboxDistill` 11 + `mock-llm-core` 141 passed；lint 0。E2E 已写待跑。
- 问题：`mode` 在 `z.infer` 必填，改经 `inboxDistillSchema.parse` 路由（默认不传同旧）；forced 未知场景仍命中 system，改 fail token；url 末尾误用反引号致未终止字面量，已修。

## W5 晨间简报聚合卡

- 根因：Cron/心跳/`/daily` 三套并列，没「没看/没做/晾着的 Goal」一张卡。
- 改动：新建 `morningBrief.ts`（聚合 Inbox fetched+top8、当日 todo/doing、扫 session goalState active|paused top12，take 不扫全表）；新建 `briefingRouter.ts`（`briefing.morning`）；`router.ts`（聚合）；`morningBrief.test.ts`；`daily/page.tsx`（`morning-brief-card` 三块 + `morning-brief-cron-seed` 按钮 + BC 监听 4 事件）；`useChatSseSubscriptions.ts`（4 事件 invalidate briefing）。
- [OM-FREEPLAY]：cron 种子用超级 Agent；refetchInterval 60s；Goal 扫描 take 50。
- 验证：`morningBrief` 1 passed；lint 0。不测真 8:00 点火。
- 问题：无 `ChatSession.goal` 列，实为 `goalState Json?`；深链 `?sessionId=` 非 `?session=`。

## W6 阶段工件剧本 + 侧栏

- 根因：`swarm_stage_write/list/read` 已在，人不知道、Chat 看不见。
- 改动：新建 `config/skills/swarm-pipeline/SKILL.md`（两条剧本：research→draft；notes→draft→review；子只写 stage、父用 `swarm_stage_read` 禁读子正文）+ `templates/`；`swarmStages.ts`（meta 加 workspaceId）；`inspect.ts`（write 后推 `workspace_stages_updated`）；`uiStateNotify.ts`+`prepareMessage.ts`（事件类型 + notify）；`workspaceRouter.ts`（`listStages`）；`workspaceStages.test.ts`；`chatStagesPanel.tsx`（`chat-stages-panel`+空态+`chat-stage-item`）；`chat.tsx`/`chatCenterPane.tsx`/`chatSessionPane.tsx`（挂载 + 入口）；`uiStateChannel.ts`+`useChatSseSubscriptions.ts`（注册 + BC）。
- [OM-FREEPLAY]：面板宽 300px；stage 项只展示元信息不可点开。
- 验证：`workspaceStages` 1 + `swarmHarnessExtras` 2 + `chatStagesPanel` 3 passed；lint 0。skill 文件存在单测按本文免。
- 问题：meta 无 workspaceId，加到 SwarmStageMeta 并补 list/read；`notifyWorkspaceStagesUpdated` 形参 string|undefined，调用处 `?? undefined`。

## W7 过夜 Goal 人眼可核

- 根因：`verifiedProgress` + Auditor + 顶栏「已核实 N 步」已有，人看不清核实了什么。
- 改动：`chatGoalBar.tsx`（verifiedProgress 非空显示 `chat-goal-verified` 展开钮，展开列 `chat-goal-verified-item`，空数组不展开）；`sessionRouter.ts`（test-only `__setVerifiedProgressForTest`，仅 `E2E=1` 暴露，不动 Auditor）；`chatGoalBar.test.tsx`；E2E。
- [OM-FREEPLAY]：test-only 接口用 `E2E=1` 守卫；`as never` 绕开 Prisma Json 校验。
- 验证：`chatGoalBar` 3 passed；lint 0。PULL 由 getGoal + 60s refetch + goal_updated SSE/BC 保证。E2E 已写待跑。不加 envAssertions 列。
- 问题：W7 提交时工作树被外部切到 `feat/test-suite-perfect`，已移回本分支并把用户分支复位。

## 铁律冲突 / 未做

无 AGENTS.md 铁律冲突。外部进程在 `feat/test-suite-perfect` 并行推进测试套件并多次切换工作树；已把我的提交移回本分支并把用户分支复位，两分支互不污染。外部 WIP 不属本 Goal。

## 残留（范围外发现、本 Goal 故意没修）

- 全量 `pnpm --filter @oasismind/server test` 有 4 个预存失败（非本 Goal 引入，均在未改文件）：`resilientLlmClient.test.ts` 3 条 429 重试（flaky）；`trpc.test.ts` Run entity CRUD（`run.update` 返回 success:false）。已在 master 复现确认预存，本 Goal 不修。
- E2E（W2 书签 / W4 taste / W7 goal-verified）已写且 lint 通过；实跑需 `build:mock` + mock-llm/server/web 全套，放收尾门禁一次跑；本会话因环境与外部进程干扰未实跑，记「待收尾跑」。

## 门禁（lint / 点名测试 / 全量 test）

- lint：server lint 退出码 0；web lint 退出码 0（0 errors / 10 warnings，warnings 均预存）。
- 点名测试（全绿）：server `chatTree`(17)、`chatHistory`(17)、`chatImageEnrich`(3)、`autoCompact`(12)+`compactDataLeakage`(6)、`inboxDistill`(11)、`morningBrief`(1)、`workspaceStages`(1)+`swarmHarnessExtras`(2)、`agentRunPhase/agentRunLock/toolResultMetadata`(18)；web `chatSessionTreeBar`(9)、`chatStagesPanel`(3)、`chatGoalBar`(3)；`mock-llm-core`(141)。
- 全量 test：server 全量 4 个预存失败（见残留，非本 Goal）；web 全量未跑（单测已绿，E2E 待收尾）。
- git status：本分支 `feat/worth-doing-w1-w7` 工作树干净（W1–W7 + 报告全部按主题提交）。
