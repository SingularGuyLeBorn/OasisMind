# 见微发布前审计整改 — goal 模式执行目标

> 使用方式（这段给粘贴者，不进 goal）：把本文件**从下一行「# 目标」开始到文件末尾**全文复制，作为 `/goal` 的目标内容提交。执行者是另一个 AI 编码代理，在本仓库 `d:/ALL IN AI/OasisMind` 工作。

---

# 目标

按 2026-08-25 发布前审计整改本仓库，共 10 个工作项（F1–F10）。全部完成、全局验收门禁全绿、整改报告写完，目标才算完成。**回归测试不过 = 目标没完成，继续修，不准收尾。**

## 完成判定（逐条可验证）

1. `pnpm lint` 退出码 0。
2. `pnpm test` 退出码 0（`pnpm -r test`，必须含 `@oasismind/web`；此前 server 红了会截断，本轮必须跑到底）。
3. `pnpm build` 退出码 0。
4. `pnpm test:e2e:mock` 不劣于审计基线 7/7（既有通过用例不得变红；环境性失败重跑一次仍败则记录在报告「未验证」段，不算阻断）。
5. `pnpm test:bench` 通过率 100%（B17 必须过；其他 case 若偶发抖动，分清「本次改动引入」与「既有抖动」，只有前者必须修，后者记录）。
6. `git log` 可见每个修复项对应的主题 commit；`git status` 无本次工作遗留的未提交文件（`.env`、`*.db` 等忽略项除外）。
7. `docs/development/pre-release-fix-report.md` 存在且按本文件第 8 节的模板逐项填完。

## 环境与开局

- 仓库根：`d:/ALL IN AI/OasisMind`。Windows，shell 用 Git Bash 语法（正斜杠、`/dev/null`，不要用 `NUL` / `&&` 之外的 PowerShell 语法假设）。
- pnpm monorepo：`apps/server`（Express+tRPC+Prisma+SQLite）、`apps/web`（Next.js 16）、`packages/shared`、`packages/mock-llm-core`。
- 开局第一件事：**通读根目录 `AGENTS.md`**，它的铁律全部适用于你（禁止打补丁、禁止向后兼容包袱、禁止 `void promise`、服务重启不自动续跑、写入落点三桶、Git 纪律）。本文不复述全文，但与本文冲突时以 AGENTS.md 为准。
- 工作树里有用户自己的未提交改动（约 85 个已跟踪文件 + 若干未跟踪文件）。**不得 revert、不得清空、不得 `git add -A` 一锅端**。你的每个 commit 只按路径添加与该项修复相关的文件。
- 审计行号是 2026-08-25 快照，可能漂移；以实际代码为准，找不到就用 Grep 定位。
- 不要启动 `pnpm dev` 长驻服务来自测；用测试验证。测试的 db/目录隔离由现有脚本负责，不要手动改 `.env`。

## 铁律（违反 = 返工）

1. **禁止打补丁**：不变量收进 store/reducer/条件写，不在编排层加 `setTimeout`/`queueMicrotask`/`await hydrate`/`phase ===` 守卫去赌时序。删了你的编排层代码 bug 还在，就是补丁，重做。
2. **禁止把测红装绿**：不准删断言、不准 `it.skip`/`.only`、不准放宽既有断言。唯一例外：F1 改了状态语义，`startupRecovery.test.ts` 里断言旧状态名 `paused` 的部分必须同步改成新状态名——这是「测例跟上语义变更」，必须在报告里说明每一处改动理由。C3 的语义断言（user 消息写入、AgentMessage 记 consumed、会话终到 completed）一个字不许动。
3. **禁止 `void <promise>`**：Promise 调用要么 `await`（在 try/catch 内），要么 `.catch(() => {})` 兜底。改前端文件时连带清同文件残留。
4. **最小 diff**：复用仓库既有模式；不引入新架构/新状态机/新依赖（唯一允许的新依赖是 F7 的 `rehype-sanitize`）；不顺手重构无关代码。
5. 注释、commit、文档一律**中文**；代码标识符英文。commit 格式 `<type>(<scope>): <中文摘要>`，正文写 why；按路径 `git add`；禁止 `--no-verify`、禁止 push、禁止碰 `git config`。
6. 用户没点名的实现选择（超时值、边界取舍、文案措辞），在该段代码注释里打标 `// [OM-FREEPLAY] 原因…`，并在报告里登记。
7. 不读不写 `.env` / `*.db` / `data/cookies` 等机密文件。

## 工作流（每个修复项都按这个循环）

1. 用自己的话在报告里写下：这项的根因是什么、成功长什么样、改哪些文件、不改哪些面。写不出就先继续读代码，不准动手。
2. 改代码 + 改/加测试。
3. 跑该项相关测试 → 绿。
4. `pnpm lint` → 绿。
5. 按主题 commit（只 add 本项相关路径；注意工作树里用户未提交的文件，只收与该项直接相关的，例如 F3 收 hostAccess 那组未跟踪文件）。
6. 把结果、改动文件清单、遇到的问题写进报告文档，再开下一项。

---

## F1（P1，最难，先做足设计再动手）：崩溃中断 ≠ 用户手停

**根因（已确认）**：崩溃尸体和用户手动暂停共用 `paused` 状态。链路是：

- `apps/server/src/infra/asyncJobs/recovery.ts` 动作 2 把僵尸 `running` 会话条件写成 `paused`（约 48-51 行），动作 3 调 `requeueOrphanedSuperiorDrains` 重注册 drain。
- `apps/server/src/infra/tools/native/swarm/superiorDrain.ts:64-94` 的 `requeueOrphanedSuperiorDrains` 不区分 paused，照样注册；drain 的 `runItem` 调 `prepareAgentRun(..., { fromDrain: true })`。
- `apps/server/src/infra/tools/native/swarm/sendMessage.ts:72-87` 与 `:135-136`、`:190-191`：`status === "paused"` 被当用户手停 → 只入队不起流。于是队列项被 drain consume 删掉、又被 `prepareAgentRun` 重新入队（同 agentMessageId 幂等），消息永远进不了 Chat，还有空转循环风险。
- 测例 `apps/server/src/__tests__/startupRecovery.test.ts` 的 C3 因此红（10s 内等不到 user 消息）。C1/C2 绿。

**修复方案（已定，照做）**：给 ChatSession 引入新状态 `interrupted`，语义 = 「进程崩溃/重启留下的尸体，恢复管道可自动接管」；`paused` 收窄为「用户手停或运行错误暂停，只有用户能恢复」。具体改动面：

1. `packages/shared/src/schemas.ts:635` `sessionStatusSchema` 加 `"interrupted"`。
2. `apps/server/prisma/schema.prisma:152` 的状态注释加 `interrupted`（SQLite 是 String 列，无需迁移）。
3. `recovery.ts` 动作 2：`running → interrupted`（不再写 paused）；`StartupRecoveryResult.zombieSessionsPaused` 改名 `zombieSessionsInterrupted`；`notifySubagentSessionUpdate` 的 status 同步 `"interrupted"`；头注与注释同步。
4. `sendMessage.ts` `prepareAgentRun`：仅 `status === "paused"` 走暂停分支；`interrupted` 落进 else 正常分支（补血缘 + 置 running + 起流）。
5. `apps/server/src/infra/sessionStreamHub.ts:38` `CLAIM_RUNNING_FROM` 加 `"interrupted"`（用户在崩溃过的会话里直接发消息必须能续聊）；检查同文件约 914 行的 `in: ["active","running","paused"]` 及其余 `paused` 出现点，逐处判断是否要把 interrupted 并列，理由写报告。
6. `apps/server/src/infra/entityServices/sessionService.ts` `resume`（约 240 行起）：claim 条件从 `status: "paused"` 扩成 `in: ["paused", "interrupted"]`；错误文案与 215-239 行头注同步更新。
7. `superiorDrain.ts` `requeueOrphanedSuperiorDrains`：跳过 `status === "paused"` 的会话并注释原因（用户手停的 pending 项原样保留；用户恢复时 `sessionService.resume` 约 292 行已有「队首 superior 挂 drain」逻辑接管）。这同时消除「consume→重建→再 consume」空转循环。
8. UI 状态映射补 `interrupted`（文案「已中断」）：`apps/web/app/subagents/page.tsx`（STATUS_OPTIONS 与两个 map）、`apps/web/components/subsessionPanel.tsx`、`chatHoverMonitor.tsx`、`sessionRotateLineageView.tsx`、`chatCenterPane.tsx`（约 279-281 行，含兜底分支）、`apps/web/app/cron/page.tsx` 约 331/354 行的终态判断、`packages/shared/src/toolResultHint.ts:129` 附近、`apps/server/src/infra/swarmHealth.ts` 与 `swarmHealthPanel.tsx`（若按状态计数）。全仓 Grep `"paused"` 与 `'paused'`（server/web/shared），逐处过一遍，每处的「改/不改 + 理由」写进报告。
9. `apps/server/src/infra/trpcRouters/sessionRouter.ts:473` 附近「重启僵尸 paused 可程序化续跑」注释同步。

**边界（不许越界）**：R-2 只负责把孤儿队列项 drain 掉（每条队列项本就是一次新运行）；**不得**自动重放 interrupted 会话崩掉的那个 ReAct 回合本身——「服务重启不自动续跑」铁律不动。

**测试**：

- `startupRecovery.test.ts`：C1 中断言 `paused`/`zombieSessionsPaused` 的部分同步改成 `interrupted`/`zombieSessionsInterrupted`（报告里逐条说明）；C3 语义断言原样保留，必须变绿。
- 新增负向用例（放 `startupRecovery.test.ts`）：子 Agent 主会话 `status=paused`（模拟用户手停）+ 一条 pending superior 队列项 → 跑 `runStartupRecovery` → 断言：不写 user 消息、队列项仍在、会话仍 `paused`、`superiorDrainsRegistered` 不含该会话。
- `sessionResume.test.ts`：补 `interrupted` 会话可 resume 的用例。

**验收**：`pnpm --filter @oasismind/server test` 全绿（重点 startupRecovery / sessionResume / superiorQueueDrain / asyncDeliveryQueueB4 / session-subagent），`pnpm lint` 绿。

---

## F2（P1）：read_file 读路径收口

**根因**：`apps/server/src/infra/writePolicy.ts:95-111` 里 `data/` 只禁写、读全放行；`workspaces/` 按 projectRoot 解析、不校验当前 Agent 的 Workspace 归属。于是 `read_file("data/cookies/feishu_oauth.json")`、`read_file("workspaces/别人/secret.txt")` 都能读。

**修复**：

1. `data/` 读改**默认拒绝 + 白名单**。先 Grep 确认哪些 `data/` 子路径会被 Agent 回读（`data/tool-results/` 是 offload 落盘回读链路，确定要放；再搜 `infra/tools` 与 compact offload 代码里返回给 Agent 的 `data/` 路径，逐个定）。白名单外一律拒绝，报错文案给出合法替代。`cookies`、`credentials`、`db`、`git`、`approvals`、`logs`、`sessions`、`messages` 必须默认被拒（它们天然不在白名单，但测试要显式锁定）。
2. `workspaces/`：仅允许当前 Agent 自己的 Workspace（用 `ctx.agentSnapshot?.workspaceId` 查 `Workspace.path`，断言解析结果落在其内，Windows 下大小写不敏感比较）；Agent 无 Workspace 则整个 `workspaces/` 拒绝；跨 Workspace 不建授权机制，报错文案说明「只允许访问当前 Agent 自己的 Workspace」。super tier 不开口子（审计未授权）。
3. 同文件 `describePolicy()` 文案（约 35 行）同步改准确。
4. 测试（新建 `apps/server/src/__tests__/writePolicy.test.ts` 或并入既有合适文件）：读 `data/cookies/x.json` 拒、读 `data/tool-results/s1/x` 放、读 `workspaces/别人/` 拒、读自己 Workspace 的 `workspaces/<自己>/` 前缀 放、写 `data/` 仍拒、无 Workspace 的 Agent 读 `workspaces/` 拒。

**坑**：别误伤 offload 回读（`compact.toolResultOffload` 写 `data/tool-results/{session}/` 后 `read_file` 读回）。若既有测试因为构造的 ctx 缺 workspaceId 而红，修测试夹具（补 Workspace 或改断言为拒绝），并在报告说明。

**验收**：新测试红→绿；`pnpm --filter @oasismind/server test` 全绿。

---

## F3（P1）：hostAccess 默认关闸、去本机盘符

**根因**：`apps/server/src/infra/config.ts:186-200` `HostAccessYamlSchema` 的 `enabled` 默认 `true`、roots 默认含 `D:/ALL IN AI`；`config.yaml:218-231` `enabled: true` 且 roots 含 `D:/ALL IN AI`，而上一行注释写「总闸：enabled=false」——注释与值相反。

**修复**：

1. `config.ts`：`enabled: z.boolean().default(false)`；roots 默认删掉 `"D:/ALL IN AI"`（保留三个 `%USERPROFILE%` 目录——它们是可移植的用户目录，不是某台机器的绝对路径）。
2. `config.yaml`：`enabled: false`，删 `"D:/ALL IN AI"` 行，保证注释与值一致。
3. `apps/server/src/__tests__/hostAccess.test.ts` 补用例：空对象解析 → `enabled=false`、roots 不含 `D:/`；显式 `enabled: true` 仍可用。
4. 全仓 Grep `D:/ALL IN AI` 与 `D:\\ALL IN AI`，确认没有任何默认配置/ schema 再含本机盘符（文档里的示例除外，示例出现要改成占位写法）。
5. 未跟踪文件处置：先 Read 审查 `apps/server/src/infra/hostAccess.ts`、`apps/server/src/__tests__/hostAccess.test.ts`、`config/mcp/windows-mcp.yaml`、`config/agents/weixin-bot.md` 无密钥后，随本项 commit 入库（hostAccess.ts/hostAccess.test.ts 属本项；windows-mcp.yaml / weixin-bot.md 若无密钥也随本项或单独一个 `feat(config)` commit）。发现疑似密钥就不提交并在报告标注。

**验收**：新增用例绿；`pnpm --filter @oasismind/server test` 绿。

---

## F4（P1）：经验积累测例补 services.config

**根因**：`apps/server/src/infra/agentEvolution.ts:207-211` 的 `accumulateExperience` 读 `services.config.memory.trust.{experienceSuccess,experienceUnverified,experienceFailed}`；`apps/server/src/__tests__/agentEvolutionOptimize.test.ts` 有 5 处把 `{} as any` 当 services 传（约 122/144/178/203/224 行），TypeError 被 catch 吞成 `written:false`，5 个用例红，CI 过不了。

**修复**：给这 5 处（以及同目录 `agentEvolutionExperience.test.ts`、`agentEvolutionSkillDraft.test.ts` 里任何同样用空对象冒充 services 的调用——逐个打开检查）提供最小可用 config：

```ts
const servicesStub = {
  config: { memory: { trust: { agentInitialStrength: 0.7, experienceSuccess: 1, experienceUnverified: 0.7, experienceFailed: 0.5 } } },
} as any;
```

（值与 `config.yaml` 的 `memory.trust` 段一致。`createMemoryRepository` 已被 vi.mock，不需要补别的。）

**验收**：`pnpm --filter @oasismind/server test -- agentEvolution` 全绿；再跑 server 全量。

---

## F5（P1）：run_shell 真限制 + 文案诚实

**根因**：`apps/server/src/infra/shellRunner.ts` `validateShellCommand`（86-97 行）不拦 `Get-Content`/`type`/`cat`；`runShellRestricted` 只钉 cwd，命令体以当前 OS 用户跑，读全盘。工具描述（`apps/server/src/infra/tools/native/shell.ts` 约 309 行）写成「cwd 默认不出 Workspace」，把 cwd 限制包装得像沙箱，不诚实。

**修复（两件事都做）**：

1. **真限制**：在 `shellRunner.ts` 的 host_restricted（非 docker）分支新增「沙箱外绝对路径拒绝」：
   - 检测命令文本中的绝对路径 token：Windows 盘符（`C:\…` / `C:/…`）、UNC（`\\…`）、POSIX 绝对（`/` 开头）；**排除含 `://` 的 URL**（`curl https://…` 不得误伤）。
   - 每个命中路径归一化后，若不在沙箱根（`resolveShellCwd` 算出的 sandbox；可直接复用 `hostAccess.ts` 的 `isAbsInside`，shellRunner.ts 已经 import 了它）之内 → 抛错，文案指明白：「命令含沙箱外绝对路径 X；host_restricted 不允许。读本机授权目录请走 native:host_access。」
   - docker 分支不加这层（容器内路径语义不同），注释说明。
   - 已知残留绕过（PowerShell `$env:` 变量拼接、cmdlet 别名等）**不写进工具描述**，写进报告「残留风险」段。
2. **文案诚实**：`shell.ts` 的 `run_shell` description 改为明确表述（要点）：在主机上以当前 OS 用户权限直接执行、**不是沙箱**；host_restricted 仅拦危险命令片段 + 拒绝沙箱外绝对路径；destructive 需审批。再 Grep `run_shell` 在 `apps/web` 与 `docs/` 的表述，把「沙箱隔离」一类说法改诚实。

**测试**（`apps/server/src/__tests__/shellRunner.test.ts` 补）：`Get-Content C:\Windows\win.ini` 拒、`cat /etc/passwd` 拒、沙箱内绝对路径 放、`curl https://example.com` 不因路径检测误伤、普通 `pnpm test` 类命令不受影响。

**验收**：新用例绿；server 全量绿。

---

## F6（P2）：harness B17 查状态走错工具

**现状**：`evals/harness-bench/cases.json:21` B17「刚才那个后台任务跑得怎么样了」期望 `async_task_status`，模型实际调了 `async_task_run`。`config.yaml` `benchOnKeep.minPassRate: 1.0`，这会挡 keep 闭环。

**修复**：

1. B17 的 `userMessage` 改无歧义，例如「查一下我的后台任务现在的运行状态，不要新建任务」；`forbidTools` 加 `"async_task_run"`。
2. `shell.ts` 里 `async_task_status` 的 description（约 250 行）补一句：用户问后台任务进度/状态时一律用本工具，不要为此新建任务。

**验收**：`pnpm test:bench` 通过率 100%。

---

## F7（P2）：博客 HTML 渲染加 sanitize

**现状**：`apps/web/components/post/PostContent.tsx` 用 `rehype-raw`（第 9 行）且只自定义丢 iframe/object/embed/script（约 480-497、569-582 行），无 `rehype-sanitize`；`urlTransform`（约 92 行）允许 `data:`。svg/事件属性/style 可进来。

**修复**：

1. 加依赖：`pnpm --filter @oasismind/web add rehype-sanitize`（让 pnpm 解析与 rehype-raw 7 / unified 11 兼容的大版本；这是本次唯一允许的新依赖）。
2. 在 rehype 管道里把 `rehype-sanitize` 插在 `rehypeRaw` **之后**、`rehype-katex`/`rehype-highlight` **之前**（顺序错了高亮 class 会被剥掉）。schema 以 `defaultSchema` 为基础扩：
   - `attributes`：所有元素允许 `className`（highlight/KaTeX 依赖）；
   - `protocols`：`src` 允许 `http`/`https`/`data`（与 urlTransform 的 `data:` 放行一致）；
   - 对照现有渲染需求（heading id、表格等）逐项确认，缺的补进 schema，每项理由写报告。
3. 现有「丢 iframe/object/embed/script」的自定义逻辑：确认 sanitize 已覆盖就删掉重复，保留则注释说明分工。
4. 测试（apps/web 既有 PostContent 测试先跑绿，再新增）：`<img src=x onerror=alert(1)>`、`javascript:` 链接、`<svg onload=…>`、`<iframe>` 被剥；代码高亮 class、图片（含 data:）、表格、KaTeX 公式正常渲染。

**验收**：`pnpm --filter @oasismind/web test` 绿 + `pnpm build` 绿。

---

## F8（P2）：删掉评论 tRPC delete（半成品收口）

**现状**：`apps/server/src/infra/trpcRouters/commentRouter.ts:80-83` 有 `delete`，但 `apps/web` 的 `CommentSection.tsx` 只有 `hide`；`AUTH_MODE=none` 下谁都能调 delete。

**修复（选删除路线，理由：hide 已覆盖运营需求，none 模式下无法区分操作者）**：删 `commentRouter.ts` 的 `delete` procedure；Grep `.comment.delete` 与 CommentService 的 `delete` 方法，无调用方就把 service 方法一并删（AGENTS.md 禁止留死代码）；同步删/改引用它的测试。commit body 写清 why。

**验收**：server lint+test 绿。

---

## F9（P3）：两处纪律清理

1. `apps/web/app/daily/page.tsx:215`：`onClick={() => void onCopyReport()}` → `onClick={() => { onCopyReport().catch(() => {}); }}`；同文件 Grep `void ` 清残留。
2. `apps/web/lib/useSubagentMessageMirror.ts:24-25`：删未使用的 `messages: unknown` 入参（注释「判重不再读 messages」已说明它是死参数），Grep 找调用方同步改。

**验收**：web lint+test 绿。

---

## F10（P3）：文档债 + 发布清单

1. `git mv AUDIT_REPORT.md AUDIT_REPORT_2026-07-26.md docs/development/archive/`（两份旧审计已把修好的 P0 当现行，留作历史账本）。
2. `docs/development/README.md` 模块图补上 mock-llm / algo-viz（审计指出它把 apps 写成只有 server+web）。
3. 新建 `docs/development/release-checklist.md`「发布硬约束」，至少含：`AUTH_MODE=password` 是公网/隧道发布前置（不只开发 warn）；hostAccess 默认关；shell 不是沙箱的表述已落实；`pnpm test`（含 web）+ 完整 E2E 绿；工作树清干净；`pnpm audit` 复跑评估；Docker shell/compose 需在有 Docker 的机器验证（本机 daemon 连不上，本轮未验）。
4. F1/F2/F5 若改变了 `docs/development/` 既有文档（如 chat-state-architecture.md）的描述，同步更新。

---

## 报告文档（贯穿全程，不是最后补）

创建并持续更新 `docs/development/pre-release-fix-report.md`，模板：

```markdown
# 发布前审计整改报告（2026-08-26 执行）

## 总览
| 项 | 状态（done/blocked） | commit | 验证 |
|---|---|---|---|

## F1 崩溃中断 ≠ 用户手停
- 根因复述：
- 改动文件：
- 设计决定与理由（含每处 paused 触点的改/不改）：
- [OM-FREEPLAY] 清单：
- 验证命令与结果：
- 遇到的问题：

（F2–F10 同构各一节）

## 未验证 / 残留风险
## 全局门禁结果（lint / test / build / e2e:mock / bench 各一行，附退出码）
```

**出问题先写进报告再继续**——这份文档是唯一的交接物，会被原样拿去做复审。

## 停止规则

- 某一项卡住（同一测试修 3 轮仍红、或依赖本机不存在的服务如 Docker daemon）：把现象、已试方案、卡在哪写进报告，标 blocked，跳到下一项。最后报告里必须有「未完成清单」。
- 任何时候不准为了让门禁变绿而删测试、skip 测试、放宽断言、注释掉功能。
- 所有 10 项 done 或明确 blocked、全局门禁跑到并如实记录，目标才结束。

## 明令禁止（抽查到即返工）

- `git add -A` / `git commit -a` / `--no-verify` / push / 改 git config / 动 `.env` 与 `*.db`。
- `setTimeout`/`queueMicrotask`/`await hydrate` 式时序补丁。
- 新建与既有平行的第二套模块（service/hooks/router 收拢点见 AGENTS.md）。
- 引入除 rehype-sanitize 外的新依赖。
- 范围外「顺手优化」。发现范围外问题 → 写进报告「未验证/残留风险」，不要动手。
