# 见微「数字主力最后一公里」— Goal 模式执行目标

> **粘贴者**：把本文件从下一行「# 目标」起到文末，整段贴进见微 Chat 的 **Goal**（`/goal` 或 `session_goal_set`）。  
> 执行者是另一个 AI（Cursor / 见微 Agent 均可）。**禁止提问等你选方案**。设计已全部锁死；只准无脑按条施工。  
> 对照清单：[`../worth-doing.md`](../worth-doing.md)。本 prompt 的范围比那篇**更窄**：只做下面 W1–W7，其余明确禁止。

---

# 目标

按本文件把见微「已经有管子、人摸不到」的 7 个切片做完：书签、贴图识图、Inbox 品味蒸馏、晨间简报、阶段工件剧本、过夜 Goal 脸、以及文档诚实。全部完成、相关测试绿、反馈报告写完，Goal 才算完成。

**你是施工员，不是产品经理。** 遇到本文件没写清、或代码和本文冲突：不要停下来问人。按第 0 节「疑惑规则」处理，然后继续下一项。

## 0. Goal 模式怎么用（强制）

1. **立刻**把本目标设为当前会话 standing goal（见微：`session_goal_set` / `/goal`，status=active）。Cursor 里没有该工具时：在反馈报告「Goal 台账」逐条打勾，等价于 verifiedProgress。
2. **禁止自评 done。** 每做完一个 W*，必须留下可核证据（测试命令退出码、截图路径、或文件+行号）。见微 Goal 的 `verifiedProgress` 只能由审计/证据写入；你这边把证据写进报告「证据」列，不要空口「已完成」。
3. 自评「做完了」但本轮报告证据行没有增加 → **不准**把 Goal 标 done，继续修。
4. 一次只做一个 W*。做完：相关 test 绿 → 按主题 commit → 报告该节填完 → 下一项。
5. 用户改口（修订/切换目标）走见微 IntentContract；**本文锁死的设计不准你自己改口。** 你觉得设计不合理：注释 `[OM-FREEPLAY]` + 报告「异议」节，**仍按本文落地**，除非不落地会违反 `AGENTS.md` 铁律（那种情况停该项、标 blocked、写清撞了哪条铁律）。

## 完成判定（逐条可验证）

1. W1–W7 在报告里均为 `done` 或明确 `blocked`（blocked 必须有现象 + 已试方案 + 卡在哪）。
2. `pnpm --filter @oasismind/server lint` 与 `pnpm --filter @oasismind/web lint` 退出码 0。
3. 相关包测试绿：至少跑本文每项列出的测试文件；最后再跑  
   `pnpm --filter @oasismind/server test` 与 `pnpm --filter @oasismind/web test`（若全量过慢，至少保证你改过的测试文件全绿，并在报告写清跑了哪些）。
4. 改了 Chat 生产代码：按仓库惯例，需要时跑 `build:mock`（PowerShell：`$env:NODE_OPTIONS='--max-old-space-size=8192'; pnpm --filter @oasismind/web run build:mock`）。只改 spec 不必。
5. `docs/development/worth-doing-goal-report.md` 按第 8 节模板填完。
6. `git status` 无本次遗留已跟踪未提交文件（忽略项除外）。每个 W* 独立 commit。禁止 `git add -A`。禁止 push。
7. 开着的 Inbox / `/daily` / Chat 顶栏：**写点有 PUSH，刷新能 PULL**。交付文案禁止出现「刷新一下」。

## 环境与开局

- 仓库根：`D:/ALL IN AI/OasisMind`。Windows **PowerShell**：用 `;` 连接命令，不要用 bash `&&`。
- 第一件事：通读根目录 `AGENTS.md`。铁律全部适用（禁止打补丁、禁止向后兼容、禁止 `void promise`、推拉结合、服务重启不自动续跑、子 Agent 隔离、写入三桶）。与本文冲突时以 **AGENTS.md** 为准，冲突写入报告「铁律冲突」。
- 第二件事：读 `docs/development/worth-doing.md` 第 3 节「别再当没做」——不准重做已有底座。
- 不要为了自测去改 `.env`。不要提交 `.env` / `*.db` / 密钥。
- MockLLM 测 LLM 路径：禁止 `vi.spyOn(llmClient)` / spy `resilientChatCompletion`。内核用 `enterInProcessMockLlm()`；E2E 走 `MOCK_LLM_URL`。
- 对话分支：`session.switchBranch` ≠ `session.fork`。不要把两套语义搅在一起。

## 铁律（违反 = 返工）

1. **禁止打补丁**：不变量进 reducer / Service 条件写。禁止 `setTimeout` / `queueMicrotask` / `await hydrate` / `phase ===` 赌时序。
2. **禁止把测红装绿**：不准删断言、`it.skip`、放宽既有断言。
3. **禁止 `void <promise>`**。改前端连带清同文件残留。
4. **最小 diff**。不引入新架构、新状态机、新 npm 依赖。新文件只允许本文点名的叶子模块。
5. 注释 / commit / 文档：**中文**；标识符英文。commit：`<type>(<scope>): <中文摘要>`，正文写 why。
6. 用户没点名、本文也没锁死的超时/文案/阈值：必须 `// [OM-FREEPLAY] …`，并抄进报告。
7. **疑惑 / 不合理**：不准改设计默默落地。必须同时：  
   - 代码旁注释 `// [OM-FREEPLAY] 疑惑：…；本文要求：…；我实际：…`  
   - 报告「异议与偏离」表加一行  
   然后**仍执行本文**（除非撞 AGENTS.md 铁律 → blocked）。

## 工作流（每个 W* 都走完）

1. 用自己的话在报告写下：根因、成功长什么样、改哪些文件、不改哪些面。写不出先读代码，不准开写。
2. 按本文该节「锁死设计」改代码 + 测试。
3. 跑该节测试 → 绿。
4. 相关 lint 绿。
5. 按路径 `git add` → commit。
6. 填报告该节（证据、OM-FREEPLAY、异议）。再开下一项。

## 明确禁止（抽查到即返工）

- QQ / 微信 / Telegram / 语音四入口 / Ollama / DSPy / 流式 reflection / 配置热更新 / 多实例 / 向量库 / 插件市场 / Chat 附件收 mp4 / 新抓取平台。
- `envAssertions` 字段、Dreaming 静默改 USER.md、Mem0。
- 重写 Chat 三层 store；重写 Inbox 同步爬虫。
- 教用户刷新；只写库不推 SSE。
- `git add -A` / `--no-verify` / push / 改 git config。

范围外发现的 bug：写进报告「残留」，**本 Goal 不要修**（除非让 W* 无法验收）。

---

## W1（先做，文档与诚实，约 30 分钟）

**根因**：`experiments.md` 到期日已过仍标 active，会骗下一个 Agent 去「续实验」。`/files` 文案像网盘，`accept` 其实只有图/pdf/zip/txt。

**锁死设计**：

1. `docs/development/experiments.md`：  
   - Swarm 三层 + 心跳 → `done`（主线已有）。  
   - 审批邮件 → `done`。  
   - Chat Store 不变量 → `done`。  
   - 本地推理 Ollama → `freeze`（验收未在真机收口）。  
   - Inbox 平台抓取 → `freeze`（管道有，真机习惯未收口）。  
   - UI 花活保持 `freeze`。  
   表下加一行：路线图以 `worth-doing.md` 为准，本表不是施工清单。
2. `apps/web/app/files/page.tsx`：  
   - `PageHeader` description 改为明确只收 **图片、PDF、zip、txt**；docx/xlsx 请走编辑器导入或 `document_to_markdown`。  
   - EmptyState 同步。  
   - `accept` 保持 `image/*,.pdf,.zip,.txt`。不要扩大 accept。  
   - 上传区附近加一行 `data-testid="files-accept-hint"`，文案含 `pdf` 与 `docx`（说明不收 docx）。
3. `docs/development/worth-doing.md` 文首加链接：施工用 `prompts/worth-doing-goal-prompt.md`。

**测试**：不必新 E2E。若 files 页有单测则改断言；没有则不加 Playwright。

**Commit**：`docs(dev): 冻结过期实验表并诚实文件柜收件类型`

---

## W2 Chat 书签接到脸

**根因**：`message.setLabel` + `MessageService.afterUpdate` 已推 `message_upserted`；`MessageActions` 已有 `showBookmark`，**列表从未传入 true**。树条不展示已钉消息。

**锁死设计**：

### 语义

- 书签 = `ChatMessage.label` 非空。开关钉定时写入固定字符串 **`书签`**（不要弹窗起名）。再点清除 `label: null`。
- 禁止做浏览器书签同步、禁止多标签分类。
- 钉在**当前路径上的用户气泡和助手气泡**都可以（两边 MessageActions 都开）。`kind=branch_summary` 的卡片**不开**书签。
- 跳转：点书签芯片 → `session.switchBranch({ sessionId, messageId })`。若该节点有后代，先用已有 `subtreeTipId` 算子树叶再 switch（与树条分叉按钮同一套，见 `chatSessionTreeBar.tsx`）。这样不会停在半截路径上看不见回复。
- 占用中（hub occupied / streaming）换叶：与树条相同，按钮 disabled。不要发明软切。

### 后端

- `setMessageLabel` 成功后：除现有 `message_upserted` 外，再 `notifySessionTreeUpdated(sessionId, 当前 activeLeafId)`，让树条书签芯片 PULL 以外还能 PUSH。幂等：label 没变不要推树（读旧行比较）。
- `session.tree` 节点已有或没有 `label`：没有就补上（`chatTree.ts` 组 tree 的 select 已有 `label: true`，确认 router 输出带到前端）。缺了就补，不要新表。
- 不要新 tRPC。复用 `message.setLabel`。

### 前端

- `chatMessageList.tsx` 两处 `MessageActions`：`showBookmark={!isEditing}`，`bookmarked={!!message.label}`，`onToggleBookmark` 调 `trpc.message.setLabel.useMutation`。Promise `.catch(catchUnlessCancelled(...))`，禁止 `void`。
- 乐观：可以本地先改 MS 里该消息 `label`，以服务端 upsert 为准。
- `chatSessionTreeBar.tsx`：在分叉按钮旁渲染 `label` 非空的节点芯片，`data-testid="chat-bookmark-chip"`，`data-message-id={id}`，文案 `书签` 或 `label.slice(0, 12)`。点击逻辑同上 switchBranch。
- 换叶后书签仍在（label 在消息行上，不在 leaf 上）。测：钉助手 → switch 到另一枝 → 再 switch 回来 → 按钮仍是实心书签。

### 推拉

- PUSH：`message_upserted` + `session_tree_updated`。  
- PULL：`listForChat` / `session.tree` 必须带 `label`（刷新不丢实心星）。

### 测试

- 单测：`apps/server/src/__tests__/chatTree.test.ts` 已有 setLabel CRUD，补一条「setLabel 会触发树通知」——若 notify 难 mock，至少测 label 读写。前端：`chatSessionTreeBar.test.tsx` 或新测：有 label 的 node 渲染 chip。
- E2E：在 `apps/web/e2e/chat-session-branch-mock.spec.ts` 加一条（或短文件 `chat-bookmark-mock.spec.ts`）：问候会话 → 钉助手 → 看见 chip → 点 chip（若已在该叶则 disabled）→ F5 → `message-bookmark-btn` 仍 `aria-label=去书签`。禁止 spy LLM。用已有 greeting mock。

**Commit**：`feat(chat): 书签接到气泡与树条，换叶推拉不丢`

---

## W3 贴图默认识图

**根因**：`buildUserMessageContentForLlm` 在 `supportsVision===true` 时**只把 `previewUrl.startsWith("data:")` 的图做成 `image_url`**。相对路径 / `/uploads/` / `content/uploads/...` 的图，多模态模型等于没看见。纯文本模型只在已有 `extractedText` 时才拼进 prompt；Chat 本地上传若没跑 OCR，模型两眼一抹黑，还要自己想起来调 `vision_describe`。

**锁死设计**：

### 多模态模型（`resolveModelSupportsVision(modelId)===true`）

1. 新建叶子 `apps/server/src/infra/chatImageForLlm.ts`（不要把逻辑堆进 `chatHistory.ts` 超过必要）。导出 `resolveImageUrlForLlm(att, config): string | null`：  
   - 已是 `data:` → 原样；  
   - `http(s):` 且非内网 → 原样（走现有 `assertPublicHttpUrl` 思路，内网拒绝）；  
   - `/uploads/` 或 `content/uploads/...` 或 Workspace 相对路径 → 读文件转 data URL。单张上限 **4MiB** 原始字节，超过则跳过该张并记 `extractedText` 提示「图片过大未送入模型」。  
2. `buildUserMessageContentForLlm` 改为可传入已解析 URL 列表，或同步接受 `config` 在 history 重建时解析。历史重建在 `buildLlmMessagesFromHistory` 里做。  
3. 不要默认把图 OCR 进知识库。

### 纯文本模型

1. 新建 `apps/server/src/infra/chatImageEnrich.ts`：`enrichImageAttachmentsForPersist(atts, ctx)`。对每张缺 `extractedText` 的图：调用 **抽出** 后的 `vision_describe` 核心（从 `readImage.ts` 抽出纯函数，工具 handler 变薄包装）。模型用 `resolveAuxiliaryModel(config, { preference: "strong_free" })`（识图要能看图；若 strong_free 不可用则 fallback lite 再失败）。  
2. 接入点：`persistUserMessage` **写库之前**（`apps/server/src/infra/agentStream/persist.ts` / `prepareMessage.ts` 里 attachments 定稿处）。失败不阻断发送：该张 `source` 保持，设 `extractedText` 为「识图失败：…」，前端预览红字。  
3. 成功：`extractedText` 写入附件 JSON，`source: "vision"`。随后 `buildUserMessageContentForLlm(..., supportsVision=false)` 走现有 OCR 拼接分支。  
4. 不要自动再调一轮 chat 工具 pill（那是给模型看的）；这是 persist 侧静默 enrich。用户可见：附件芯片红/灰 + 可点「重试识图」。  
5. 重试：`message.enrichImages` tRPC，入参 `{ messageId }`，仅该消息作者会话、仅图片附件。成功后 `message_upserted`。

### 超时与失败

- 单张识图超时 **20s**。注释 `[OM-FREEPLAY]`。  
- MockLLM：禁止 spy。给 `packages/mock-llm-core` 加场景：用户/系统含「【Mock 识图】」或 persist 侧探测 `MOCK_LLM` 时直接返回固定句 `【Mock 识图】图中是测试图案。` 不要走真 HTTP vision。

### 测试

- `chatHistory.test.ts`：相对路径 / data: / 超大图。  
- `chatImageEnrich` 单测：MOCK_LLM 下无 extractedText 的附件 enrich 后带【Mock 识图】。  
- 不要无头浏览器真传图除非已有 fixture。

**Commit**：`feat(chat): 附件图默认进 vision 或静默识图，失败可见可重试`

---

## W4 Inbox 蒸馏可选改写（品味）

**根因**：`InboxService.distill` 只 `formatInboxItemBody` + `post_create`。PRD 曾放弃 LLM 改写——本 Goal **重新打开，但是可选**，默认行为必须与现在完全一致。

**锁死设计**：

### Schema

`packages/shared/src/schemas.ts` `inboxDistillSchema` 增加：

```ts
mode: z.enum(["raw", "taste"]).default("raw"),
```

全仓调用方改完。禁止兼容重载。默认 `raw` = 今天的 format 直写。

### raw

现有循环一行不改语义。已 distilled 仍幂等。失败不标 distilled。写后 `notifyInboxUpdated(..., "distilled")` 保持。

### taste

对每条 **fetched**（或未 distilled）项：

1. `bodyRaw = formatInboxItemBody(...)`（必须仍含来源 URL，格式不变）。  
2. 读 `readPinned("user")` 截断后文本（空则只用下面 system）。花园 `content/{garden}/_garden.md` 存在则取前 800 字。  
3. 调 `resilientChatCompletion` + `resolveAuxiliaryModel(..., preference: "lite_free")`。  
   - system：你是见微知识园丁。按用户品味改写收藏为可发布草稿。保留事实与来源 URL。不要编造。中文。  
   - user：USER.md + 花园摘录 + `bodyRaw`。  
4. 超时 **25s**/条。`[OM-FREEPLAY]`。失败：该 id 进 `errors`，**保持 fetched**，不 create post。  
5. 成功：`post_create` 用模型正文；若模型丢掉 URL，在文末强制追加 `\n\n来源：{url}`。  
6. MockLLM：用户内容含 inbox 原文或 mode=taste 时，返回 `【Mock 品味蒸馏】\n` + 原文前 200 字 + 来源 URL。禁止 spy。

### 前端

- Inbox 蒸馏钮旁 segmented：`原文落入` / `按品味改写`，`data-testid="inbox-distill-mode"`，选项 `data-mode="raw"|"taste"`。  
- 勾选后点蒸馏：mutation 带 `mode`。成功 toast 仍走现有「蒸馏完成」。  
- 推拉：已有 `inbox_updated`；开着的 Inbox 页必须自己变（已有 invalidate）。刷新后 distilled 状态在。

### 测试

- `inboxDistill.test.ts`：默认不传 mode 行为与旧测完全相同。新增 taste：MOCK_LLM 成文标题可同，正文含 `【Mock 品味蒸馏】` 与来源 URL；模型抛错时 status 仍 fetched。  
- E2E：`scenario-product-gaps-mock.spec.ts` 保持 raw 路径绿；加一条 taste（mock-llm 必须开）。

**Commit**：`feat(inbox): 蒸馏可选按 USER.md 改写，默认仍原文落入`

---

## W5 晨间简报（聚合脸，不新造第三套调度器）

**根因**：Cron、心跳、`/daily` 三套并列。没有「没看 / 没做 / 晾着的 Goal」一张卡。

**锁死设计**：

### 不要

- 不要新的进程内 cron 引擎。  
- 不要启动时自动 `agent_cron_set`（重启不偷跑、也不偷建）。  
- 不要每天自动往主会话灌一条气泡（除非用户在 `/daily` 点了「创建 8:00 cron」，见下）。

### 聚合权威

新建叶子 `apps/server/src/infra/morningBrief.ts`：

```ts
export async function buildMorningBrief(prisma, dayKey: string): Promise<MorningBrief>
```

`MorningBrief`：

- `dayKey`  
- `inbox: { fetched: number; items: { id, title, source, url }[] }` — status=fetched，最多 8 条，按 createdAt desc  
- `daily: { todo: number; doing: number; titles: string[] }` — 当天看板未 done 的 title  
- `goals: { sessionId, sessionTitle, status, text, verifiedCount }[]` — `goal` JSON 可解析且 status ∈ {active,paused}，最多 12 条  

不要扫全表无上限。SQLite 用 `take`。

tRPC：`infra/trpcRouters/briefingRouter.ts`，`briefing.morning` query，input `{ dayKey }`。`router.ts` 只聚合。

### PUSH / PULL

- 不新发明 SSE 类型。`useChatSseSubscriptions`（以及 `/daily` 自己的 BC）已订 `inbox_updated` / `daily_flow_updated` / `goal_updated` / `session_list_changed`：这些发生时 **invalidate `briefing.morning`**。  
- `/daily` 进页 `useQuery` + `refetchInterval: 60_000`（进行中 Goal 时可以 15s，与 adminPullIntervals 同一风格）。

### UI

- `/daily` 页顶加 `data-testid="morning-brief-card"`：三块（Inbox 未消化 / 今日未完成 / 进行中 Goal），数字可点：Inbox → `/inbox`；Daily 滚动到列；Goal → `/chat?session=id`（若现有 chat 深链不是这样，用仓库已有 session 打开方式，不要新路由）。  
- 次要：Dashboard 若有空位可放同一组件，**不是必须**。W5 验收以 `/daily` 为准。

### 可选 cron 按钮

- 卡上按钮 `data-testid="morning-brief-cron-seed"`：「每天 8:00 用超级 Agent 读简报」。调用已有 `agent_cron_set`（若前端无 tRPC，加 thin mutation 包装 store，或走已有 cron 管理页 API）。  
- prompt **锁死文案**：  
  `用工具读今日晨间简报（或打开 /daily 同类数据），用中文不超过 12 行列出：未消化 Inbox、今日未完成、进行中 Goal。不要发明没有的条目。`  
- cron：`0 8 * * *`，name=`morning-brief`。已存在则幂等更新 prompt。  
- 不点按钮 = 没有这条 cron。

### 测试

- `morningBrief.test.ts`：插入 fetched inbox + daily todo + 带 goal 的 session，断言计数。  
- 不测真 8:00 点火。

**Commit**：`feat(briefing): /daily 今早卡聚合 Inbox、看板与 Goal`

---

## W6 阶段工件：一个你会用的剧本 + 看得见

**根因**：`swarm_stage_write/list/read` 已在，人不知道、Chat 也看不见。

**锁死设计**：

1. 新建 `config/skills/swarm-pipeline/SKILL.md`（frontmatter 与现有 skill 一致，`pnpm db:sync` 能扫到）。正文规定两条剧本，**只这两条**：  
   - **专题深挖**：`research` → `draft`。子 Agent 只写 stage 文件；父用 `swarm_stage_read`，禁止读子会话正文。  
   - **Inbox 成稿**：`notes` → `draft` → `review`。  
2. `config/skills/swarm-pipeline/templates/` 下放两个 md 模板（空壳 + 标题/验收栏）。  
3. 前端：Chat 右侧（文件面板附近）`data-testid="chat-stages-panel"`。数据：tRPC `workspace.listStages`（包装 `swarmStages` list，当前 Agent 的 workspaceId，无则系统 root）。空态：「尚无阶段工件。派子深挖时写 research.md」。  
4. PUSH：`swarm_stage_write` 成功后 `pushExternalEvent` 类型 `workspace_stages_updated`（或复用已有 agent UI notify）。前端 invalidate listStages。刷新 list 能回来（PULL）。  
5. 不要做 SOP 编译器、不要 DAG。

**测试**：skill 文件存在的单测可免；`swarmStages` 已有测则补 list 经 tRPC。前端组件浅测空态 + 一项。

**Commit**：`feat(swarm): 阶段工件剧本 Skill 与 Chat 侧栏可见`

---

## W7 过夜 Goal 人眼可核

**根因**：`verifiedProgress` + Auditor + 顶栏「已核实 N 步」已有；人看不清核实了什么；场景 D 无 mock 脸。

**锁死设计**：

1. `chatGoalBar.tsx`：`data-testid="chat-goal-verified"` 展示 `verifiedProgress.length`；展开列表每条 `claim` 一行，`data-testid="chat-goal-verified-item"`。空数组不展开。  
2. F5 后仍在（getGoal PULL）。`goal_updated` 已有则订阅后刷新栏。  
3. **不要**加 `envAssertions` 列（worth-doing 说没断言就别空转）。  
4. E2E mock：能设 Goal、暂停、F5 顶栏还在（多数已有）。补：若 mock 可写入 verifiedProgress fixture（tRPC 或直接 DB helper 仅测试），刷新后列表有 1 条 claim。不要为了 E2E 把 Auditor 打成永远通过。  
5. `/runs` 不在本项改交互；确认 Goal 会话中断仍「重启不续跑」。

**Commit**：`feat(goal): 顶栏列出已核实步骤，刷新不丢`

---

## 第 8 节 反馈报告（贯穿全程，不是最后补）

创建并持续更新 **`docs/development/worth-doing-goal-report.md`**。开工第一件事先建空壳再改代码。

模板：

```markdown
# 数字主力最后一公里 — Goal 执行报告

- 执行者：
- 开始 / 结束：
- 见微 Goal / Cursor 台账：是否 setGoal、最终 status

## Goal 台账（等价 verifiedProgress）
| W | 状态 done/blocked | 证据（命令退出码或文件:行） | commit |

## 异议与偏离
| 位置 | 本文要求 | 我觉得不合理的点 | 实际落地 | 是否 [OM-FREEPLAY] |

## W1 …
- 根因复述：
- 改动文件：
- [OM-FREEPLAY]：
- 验证：
- 遇到的问题：

（W2–W7 同构）

## 铁律冲突 / 未做
## 残留（范围外发现、本 Goal 故意没修）
## 门禁（lint / 点名测试 / 全量 test 若跑了）
```

**出问题先写报告再继续。** 这份文档是唯一交接物。

## 停止规则

- 同一 W* 测试修 3 轮仍红：标 blocked，写现象，跳下一项。  
- 不准为了绿而删测试。  
- W1–W7 都 done 或 blocked、报告填完、commits 按主题，Goal 才能结束。  
- 不要把 worth-doing.md 里的 QQ/Ollama/Dreaming 自行加进范围。

## 建议见微 Goal 文案（短）

若 UI 限制 Goal 字数，用这段，细节仍以本文件为准：

```
按 docs/development/prompts/worth-doing-goal-prompt.md 施工 W1–W7：实验表冻结、文件柜诚实、Chat 书签、附件默认识图、Inbox 可选品味蒸馏、/daily 晨间卡、阶段工件剧本+侧栏、Goal 核实列表。禁止提问改设计；疑惑写 [OM-FREEPLAY] 和 worth-doing-goal-report.md。推拉结合，禁止教刷新。测绿按主题 commit，禁止 git add -A 与 push。
```
