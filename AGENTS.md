# 见微 · OasisMind — AI 开发指南

> 面向 AI 编码助手。默认你对本项目一无所知。阅读顺序：本文件 → `README.md` → `MIGRATION_PLAN.md` → `docs/development/`。
>
> **品牌**：中文名 **见微**（见微知著），英文名 **OasisMind**。npm 包名 `@oasismind/*`。
>
> 变更史不要堆在本文件。已落地决策见 `docs/development/design-decisions.md`，版本记录见 `CHANGELOG.md` 与 git log。

---

## 铁律：先理解需求再动手

> 与「禁止打补丁」同级。违反 = 失职。

**改代码之前必须能用自己的话复述：用户要什么、成功长什么样、改哪些面、不改哪些面。** 复述不出 = 还没理解，不准开写。

### 提问 vs 动手

| 情况 | 怎么做 |
|---|---|
| 用户需求本身不清楚（目标、范围、成功标准、改 Chat 还是改审批页） | **先问清再动手**。问需求，不要问「Redis 还是内存」这类技术选择题。 |
| 用户**明确禁止提问**（「不要问」「开始吧」「你理解一下直接做」） | **立刻按最不可能出错的方式写**。禁止停下来列选项。 |
| 用户明确要求另一种开工方式（先设计、先实验、先出两种方案） | 听用户的。 |
| 需求已清楚，只剩实现细节 | 技术决策自己拍板（见「自主执行」）。不要把架构选型抛回用户。 |

### 「最不可能出错」= 默认开工方式（用户禁止提问，或未指定别的方式时）

1. **复用仓库已有模式**，最小 diff，不引入新架构 / 新依赖 / 新状态机（除非没有旧路可走）。
2. **改完必须能运行**：相关 lint + test 绿；server/web 能起；被改的主路径能走通。这是基本要求，不是加分项。
3. 默认值偏保守：超时有上限、失败可见、危险操作不默许、不删无关代码。
4. 禁止用「先写一版碰碰看」当开工策略，除非用户明确要求实验。

### 非用户明示的代码必须打标

用户没点名要的实现（猜的默认值、顺手加的分支、自行发明的辅助函数/字段/交互）**必须**在该段注释写明「这是自由发挥 / 猜测」，并带固定检索串：

**`[OM-FREEPLAY]`**（全仓搜索：`rg "OM-FREEPLAY"`）

```ts
// [OM-FREEPLAY] 用户只要求保存失败要提示；8s 超时是保守猜测，避免无限等。
const SAVE_TIMEOUT_MS = 8_000;
```

- **必须打标**：用户没说的超时/重试/默认值、额外功能、「顺便重构」、猜的产品行为。
- **不必打标**：为让用户点名的改动能编译/运行而写的样板；对齐本仓库既有模式的必要改动；锁定用户点名行为的测试。
- 禁止把猜测写成「用户要求」或藏进无标记的大段新逻辑。

---

## 项目概述

见微是**单用户、本地优先**的智能知识管理与博客平台：「以 Markdown 为原子、AI 为引擎的数字花园」，并做成常驻数字主力（提醒、收集、蒸馏品味）。

- **事实源**：本地 Markdown / YAML；SQLite（Prisma）只做查询与缓存，可随时重建。
- **阶段**：L1–L5 已落地（博客、实体 CRUD、Agent SSE Chat、自动化/审批、FTS、可选鉴权、Docker/CI）。
- **三桶**：`content/` 知识库（Git）· `config/` Agent 配置（Git）· `data/` 运行时产物（gitignore）。

---

## 技术栈

| 层级 | 技术 |
|---|---|
| 语言 | TypeScript 5.8、Node（server 用 `tsx`） |
| 包管理 | pnpm monorepo（`workspace:*`） |
| 前端 | Next.js 16 + React 19 App Router、Tailwind 4、shadcn、Framer Motion、Three.js |
| 编辑/渲染 | Milkdown 7；`react-markdown` + remark/rehype |
| 通信 | tRPC 11 + TanStack Query 5 + superjson |
| 状态 | 无全局 zustand；Chat 用三层 store hooks |
| 后端 | Express 5、Prisma 6 + SQLite、Zod（`packages/shared`） |
| 测试 | Vitest 3；Playwright（本机 Chrome） |

`docker-compose.yml` 里的 PostgreSQL 仅作未来扩展；日常用 SQLite（`DATABASE_URL="file:./dev.db"`）。

---

## 目录与模块

```text
apps/server/     Express + tRPC + Prisma
  prisma/        schema ~30 model；dev.db 不入库
  src/index.ts   入口（EventBus + TriggerEngine）
  src/router.ts  AppRouter 纯聚合；域路由在 infra/trpcRouters/
  src/services.ts  BaseService / FileSyncService；实体在 infra/entityServices/
  src/infra/     工具、loop、mcp、agentStream、swarm、heartbeat、uiStateNotify…
apps/web/        Next.js：app/ 页面；components/shared.tsx 通用 UI；lib/hooks.ts 数据集
packages/shared/ Zod schema / types / constants
content/         知识库：{gardenId}/_garden.md + {slug}.md；about/；uploads/
config/          agents / skills / memories / prompts / tasks / mcp / sources
data/            运行时（approvals、cookies、workspace 回退区等，可重建）
workspaces/      Workspace.path 落点（gitignore）
docs/development/ 场景、并发、Chat 状态机、设计决策
```

实体与 CRUD 现状见 `docs/development/README.md`。禁止 `write_file` 直写 `content/`（除 `uploads/`）；文章走 `post_create` / `post_update`。

---

## 构建与运行

根目录执行。

```bash
pnpm install
pnpm dev          # sync 后并行 server + web
pnpm dev:mini     # 跳过阻塞全量 sync
pnpm dev:web / pnpm dev:server
pnpm db:sync      # content/config → SQLite（支持 --watch）
pnpm db:push      # Prisma 推 schema（SQLite 单轨，不要 migrate）
pnpm db:generate / pnpm db:seed / pnpm db:backup / pnpm db:studio
pnpm lint / pnpm test / pnpm build
pnpm validate     # lint → test → build → e2e
```

- Web `http://localhost:3000`；Server `http://localhost:3010`；tRPC `/api/trpc`
- Next 开发期 rewrite `/api/trpc`、`/api/posts/assets` 到 3010
- SSR 用 `NEXT_PUBLIC_SERVER_URL` 或默认 `http://localhost:3010`

---

## 开发约定

- 注释、UI、commit、文档：**中文**；代码标识符：**英文**。
- 图标用 Lucide 或 `apps/web/lib/icons.tsx`；禁止 emoji 当 UI 图标。
- 前端 class 合并用 `cn()`（`apps/web/lib/utils.ts`）。Chat 动画：`spring 260/26`。
- 共享 Zod 放 `packages/shared/src/schemas.ts`。web `import type { AppRouter } from "@oasismind/server/router"`。

### Git（工程纪律）

工作树脏乱 = 失职。一个可验收切片做完 → 按主题 commit，禁止几十个文件堆到最后。用户说「先别提交」才暂停。

- 格式：`<type>(<scope>): <中文摘要>`，正文写 **why**。
- 提交前：相关包 `lint` + `test` 绿。单测绿 ≠ 运行时无错。
- 禁止：`git add -A`、`--no-verify`、改 `git config`、force-push master、amend 已推送提交。
- 按路径 `git add`；误创建的 agent/测试垃圾发现即删；不提交 `.env` / `*.db` / 密钥。
- PowerShell 无 `&&` / `printf`：用 `;` 与 `` `n `` / 多个 `-m`。

### tRPC

每个实体 router：`create` / `getById` / `list` / `update` / `delete`。列表 `{ items, total, page, pageSize, totalPages }`。错误用 `TRPCError`，message 写清发生了什么、在哪、怎么修。

### Markdown ↔ SQLite

- 花园：`content/{gardenId}/_garden.md`；文章：`content/{gardenId}/{slug}.md`；`(garden, slug)` 唯一；frontmatter **不写** garden。
- frontmatter：`title` / `category` / `tags` / `published` / `excerpt`。
- `db:sync` 先 Garden 再动态挂 Post syncer。自动保存：`useAutoSave.ts` 500ms 本地节流、2s 防抖 `post.update`。

### 单文件收拢（禁止平行第二套）

| 层 | 收拢点 | 禁止 |
|---|---|---|
| 实体 Service | `infra/entityServices/<entity>Service.ts` | `services/` 子树、兼容 re-export |
| 域路由 | `infra/trpcRouters/<domain>Router.ts`；`router.ts` 只聚合 | `trpc/routers/` |
| 数据 hooks | `apps/web/lib/hooks.ts` | `hooks/` 目录 |
| 通用 UI | `apps/web/components/shared.tsx` | `components/shared/` |

工具域按 `infra/tools/native/{fs,web,shell,…}` 叶子拆分，这不是「平行 Service」。

---

## 架构铁律

> 以下五条与文首「先理解需求再动手」同级，**不精简**。违反 = 失职。

### 架构纪律：禁止打补丁，必须从架构层面根治

> 这一条是**铁律**，不是建议。违反就是失职。看不懂这条的人没资格改本项目的状态机 / 编排层。

#### 反模式：补丁栈

什么叫打补丁？就是**在编排层（callbacks、useEffect、try/finally）用时序猜测去弥补 store 没强制的不变量**。典型症状：

- 「`onDone` 里 `await hydrate` 一下，赌消息已经落库」
- 「清 UI 前先 `queueMicrotask` 看一眼 phase，是 streaming 就跳过」
- 「`finally` 里再 hydrate 一次保险，然后再 consume 一次」
- 「`useEffect` 监听 `!isSessionStreaming` 就 `consumeRef()`」
- 「加个 `setTimeout` / debounce 缓一缓，让两路 SSE 谁先谁后不重要」

**这不是修复，这是把一个 bug 拆成五个时序依赖的 bug。**回调顺序变一次、SSE 抖一下、用户切个 session、刷新一下——补丁立刻破。然后你再加一个补丁压住它。然后第三个补丁压第二个的边界 case。**几十个场景就几十个补丁，最后谁都不敢动，重构白做。**

#### 正模式：架构层根治

架构层根治 = **把不变量收进 store 的 reducer / action，编排层写错也打不破**。判断标准只有一条：

> **删掉你这段编排层补丁，bug 还会不会复现？**
> - 会复现 → 你的不变量没收进 store，你打的还是补丁，只是包装得更精致。
> - 不会复现 → 编排层再怎么写错时序，reducer 都会拒绝非法转移，这才是架构落地。

具体怎么做：

1. **先画状态机**：哪些 phase、哪些转移合法、哪些非法。画不出来就别写代码。
2. **不变量写进 reducer，不是写进注释**：
   - 非法转移直接 no-op 或断言（开发期 `console.error`，生产期静默）。
   - 「done→idle 必须经 commitStream 且 MS 已对齐」这种规则，**必须由 reducer 强制**，不能靠编排层「记得」调用顺序。
3. **副作用集中到转移点**：进入/离开某个 phase 的清理只在 reducer 或 transition 函数里写一遍，**禁止** 4 个回调各清一遍然后互相救火。
4. **跨层通信走显式事件**：Layer A 进入某状态后要通知 Layer B？走 `onStreamCommitted(cb)` 这种显式钩子，**不要**让 B 用 `useEffect` 猜 A 的状态变化。
5. **双通道竞态用幂等消除，不要用时序赌**：两路 SSE 无 happens-before？让后到达的一路做幂等 upsert / 幂等 commit，**不要**用 `await hydrate` refetch 赌谁先到。

#### 自检清单（提交前必过）

改任何状态机 / 编排层 / 多层 store 协作之前，先回答：

- [ ] 这次 bug 的**根因**属于哪一层职责越界 / 不变量缺失？说不清楚就别动手。
- [ ] 我的修复是改 store 的 reducer / action，还是又加了一段编排层时序猜测？后者一律打回。
- [ ] 删掉我新加的编排层代码，reducer 还能不能保证正确？不能就是补丁。
- [ ] 我有没有新增 `await hydrate` / `setTimeout` / `queueMicrotask` / `phase === "xxx"` 守卫？有就是**正在打补丁的信号**，停下来重新设计。
- [ ] 这个不变量能不能写成一句中文，让半年后的自己 / 别的 AI 看懂？写不出就是没想清楚。

#### 本项目已落地的范例（参照执行）

- **Stream Commit 不变量**（Chat 三层 store）：`done → idle` 只经 `commitStream`，`BEGIN_STREAM` 在 occupied 时 reducer 拒绝，`onStreamCommitted` 是 Compose drain 的唯一钩子。详见 `docs/development/chat-state-architecture.md` §4.2 与 `docs/development/chat-scenario-states.md`。**这就是「删掉编排层补丁，bug 不复现」的样板。**

#### 给 AI 助手的死命令

**如果你（AI）在改 Chat / Swarm / 任何状态机时，第一反应是「加个 await」「加个 setTimeout」「加个 phase 守卫」——立刻停手，你在打补丁。**回去先想：这个 bug 的根因是哪个不变量没被强制？把它收进 reducer。如果做不到，说明你对这个模块的理解还不够，**继续读代码，别动手写补丁**。

几十个场景靠几十个补丁维护的项目，不是工程，是债务堆。本项目不接受这种债务。

### 架构纪律：状态在内存 · 推拉结合 · 刷新不丢（前端只忠实显示）

> **铁律，不是建议。** 与「禁止打补丁」同级。违反 = 失职。
> 凡用户可见状态：**开着页必须自己动；刷新不得变干净；禁止用 F5 当修复。**

#### 一句话（死命令）

**权威只在服务端（DB + hub/store 内存）。前端零真相、只订阅、只渲染。**
**核心状态变化必须「推拉结合」——缺任一半 = 不合格交付。**

#### 推拉结合（强制双通道，不是二选一）

| 通道 | 职责 | 不做的后果 |
|---|---|---|
| **PUSH（推）** | 权威写点**同事务/同调用栈内**推 SSE / hub 内存 /（跨标签）BroadcastChannel；Chat 或管理页订阅后 `invalidate`/`setData`/`reducer patch` | 用户盯着开着的页，库已变、界面假死，只能 F5 → **P0 事故** |
| **PULL（拉）** | 进页 / 刷新 / 管理页挂载时从权威源再水合；开着的管理页对「进行中」态保留短 `refetchInterval` 作兜底（推是主路径，拉是保险） | F5 丢气泡 / 丢任务 / 丢 cron 状态 → **P0 事故** |

**禁止**：
- 只写 `prisma.*.create/update`，不推事件，交付文案写「刷新一下就好」
- 只靠内存乐观 UI，不落库，刷新变空白
- 只用 mount 一次 `useQuery`、无 SSE、无 interval，后台改了列表永陈旧
- 用 `setTimeout` / `useEffect` 猜时序代替推送（那是补丁，打回）

**合法 PUSH 通道（优先从上到下）**：
1. `SessionStreamHub.pushExternalEvent`（`message_upserted` / `cron_job_updated` / `session_list_changed` / `approval_updated` / …）
2. hub 内存态（`listRunning`、环形缓冲）
3. 事件驱动的 React Query `invalidate` / `setData`（必须由 1/2 触发，不是用户手刷）
4. 同浏览器 `BroadcastChannel("oasismind-ui-state")`（跨标签兜底；**不能替代**服务端推）

收拢入口：`apps/server/src/infra/uiStateNotify.ts`（`notifyAgentUi` / `notifyAllMainSessionsUi` / `notifyCronJobUpdated`）。新写点优先走这里，禁止再散落裸 `prisma` + 沉默。

#### 三条硬约束

1. **状态先进内存可观测面，再谈 UI** — 写库瞬间用户侧必须有可订阅读点。
2. **打开中的一切表面实时更新** — 含其它标签页、侧栏、`/cron` `/approvals` `/runs`；秒级，不靠 F5。
3. **刷新 = 再水合，信息零损失** — 流式中靠续传 + 落库消息；冲突以服务端为准。

#### 前端职责边界（死命令）

| 前端必须 | 前端严禁 |
|---|---|
| 订 PUSH + 做 PULL 水合 | 把业务真相 invent 在本地又不同步 |
| reducer / `setData` 幂等 patch | `useEffect` / `setTimeout` 赌「何时出现」 |
| 管理页：有 running/pending 就短轮询兜底 | 「刷新当修复」、交付说明教用户按 F5 |
| 跨标签仍一致 | 只伺候当前焦点页 |

#### 自检清单（改状态机 / SSE / 管理页 / Chat 前必过，打勾才能交）

- [ ] **PUSH**：权威写点之后调了 `uiStateNotify` 或等价 `pushExternalEvent`？
- [ ] **PULL**：刷新 / 进页能从 DB·list·getById 完整回来？
- [ ] 用户开着 A 页、在 B 触发变化，A 会不会自己动？不会 → **缺 PUSH**，不准合。
- [ ] 立刻 F5，信息还在吗？不在 → **缺 PULL/落库**，不准合。
- [ ] 交付里有没有「刷新一下」？有 → **打回重做**。

#### 反例（已踩过，再犯按失职论）

- Cron 只写库入池，管理页 `lastRunStatus` 假死、侧栏不出现
- 会话列表只 mount fetch，新 session / spawn_goal 要手动刷新
- 消息靠盲 `invalidate` 赌落库，SSE 晚到空白
- `/approvals` `/runs` 无推无拉，Agent 已挂起人还不知道

#### 正例（参照执行）

- Chat：`MessageService` → `message_upserted` → reducer（推）+ `listForChat` 水合（拉）
- Cron：`fire` → hub 起流 + `cron_session_started` / `cron_job_updated`（推）+ `/cron` 短轮询与进页 list（拉）
- 样板文档：`docs/development/chat-state-architecture.md`

细则与 `.cursor/rules/ui-state-realtime.mdc` 同级。

### 架构纪律：自主执行铁律（禁止停下等用户选择）

> 与「禁止打补丁」「禁止向后兼容」同级的铁律。本项目是单人项目，用户的时间比 AI 的时间贵，**AI 不得把决策成本转嫁给用户**。
>
> 与文首「先理解需求再动手」分工：不清楚「用户要什么」时先问需求；本节禁止的是把「怎么实现」抛回用户。用户明确禁止提问时，按文首「最不可能出错」开工。

具体执行：

1. **禁止用 AskQuestion / 提问等方式把技术决策抛给用户**：架构选型、拆分边界、修复方案、重构顺序、命名、是否放宽某条纪律——AI 自己拍板，按最推荐方案直接做。只有涉及**不可逆的外部副作用**（删线上数据、push 远程、花钱调真实付费 API、改 git config）才允许停下来确认。
2. **每次运行必须把发现的问题修掉，禁止「列清单等用户挑」**：审计 / 重构 / 修 bug 时扫到的所有问题（含低频、含边界、含「概率低」），一律当场修完。不得输出「以下是选项，请你选择」「这几个有什么选项推荐哪个」然后停下。**最推荐方案 = 默认执行方案**，修完再汇报。
3. **禁止「打票不施工」**：不得只写 TODO / 报告 / 工单而不动手。发现即修，修完即验证（lint + test），验证完再写进度。报告是施工的副产物，不是施工的替代品。
4. **禁止「半成品交付」**：不得修一半留一半等用户催。一个改动要么修完跑绿，要么不动；跨文件的连带改动必须在同一次改动里改完，禁止「先改 A，B 留到下次」。
5. **判断标准**：删掉你这段「询问用户」的话，任务还能不能往下推进？能推进就该直接做，问都不要问。不能推进（缺外部信息 / 缺权限 / 缺不可逆确认）才允许问，且问完必须立刻继续，不得等用户回。

#### 今天踩过的坑（2026-07-25，必须内化为规范）

- **`void promise` 是 unhandled rejection 的温床**：TanStack Query 取消进行中的 `fetch`/`refetch` 时以 `CancelledError` reject；前端大量 `void utils.*.refetch()` / `void utils.*.invalidate()` / `void query.refetch()` 丢弃返回值，rejection 被 Next.js dev overlay 捕获上报。**单测（jsdom + createRoot + act）覆盖不到浏览器运行时 unhandled rejection 路径**——单测全绿 ≠ 运行时无错。
  - **铁规**：今后全仓**禁止** `void <promise>` 写法。所有 `refetch` / `fetch` / `invalidate` / `prefetch` / `mutateAsync` / `clipboard.writeText` 等 Promise 调用，要么 `await`（在 try/catch 内），要么 `.catch(() => {})` 静默兜底。`void` 只用于「明确不返回 Promise 的语句表达式」场景。
  - **审查义务**：改前端任何涉及 promise 的代码，必须连带审查同文件 / 同 hook 链路的 `void promise` 残留；发现即改，不得留。
- **单测绿不能给运行时打包票**：给用户说「没问题」前，必须明确区分「单测覆盖路径绿」与「浏览器运行时路径未验证」。后者要靠静态审查 + 实际跑 dev server 复现，不得用单测绿代替。此前对父子 Agent 通信路径打包票后被用户实测打脸，教训记下。
- **低频不是不修的理由**：用户手动触发的低频路径（手动刷新按钮、创建对话框、git 页刷新）并发概率低，但 `CancelledError` 隐患与高频路径同源。审计扫到的所有 `void promise` 一律修，不得按「频率」分级取舍。

### 架构纪律：禁止向后兼容包袱

> 与「禁止打补丁」同级的铁律。本项目是**单用户、本地优先、未发布 1.0** 的项目——没有外部消费者，没有线上多版本共存，**没有任何理由保留向后兼容层**。

具体执行：

1. **改接口就改所有调用方**：函数签名、tRPC procedure、表结构、frontmatter 字段变了，就在同一次改动里把全仓调用方改完，**禁止**保留旧签名做「兼容重载」、禁止 `// 兼容旧调用方` 分支、禁止 deprecated 参数「先留着」。
2. **禁止兼容 re-export**：模块拆分后（如 W4 的 `promptBuilder.ts`/`agentResolver.ts`），老文件不得 re-export 新模块「方便旧引用」。所有 import 必须直连新叶子模块，拆完即删旧出口。
3. **禁止兼容注册/适配层**：工具注册、schema 转换等只有一条路径。过渡期的兼容层（如 `ensureNativeToolsRegistered` 的双轨注册）必须在对应拆分工单结束时一并删除，不得「留着以防万一」。
4. **数据迁移走一次性脚本，不走代码分支**：老库数据形态变化（如字段新增、枚举扩展）写 `apps/server/src/scripts/` 下的一次性迁移脚本，执行完即删；**禁止**在读路径写 `if (老格式) ... else ...` 永久分支。
5. **SQLite 是缓存层，随时可重建**：`dev.db` 不是事实源（Markdown 才是）。表结构变更优先 `db:push` + 迁移脚本，不考虑「线上旧版本客户端连新库」这种不存在的场景。

判断标准只有一条：**这个兼容层服务的「旧版本」在哪台机器上运行？** 答不出来，就没有旧版本，删。

### 架构纪律：服务重启不自动续跑

> 与「禁止打补丁」同级的铁律。**服务重启后，任何僵尸 running/queued Task 一律标 failed，绝不自动重建执行体续跑。** 理由：tool 任务有副作用、进度未知，盲目重跑可能重复执行（写两份文件、发两封邮件、扣两次额度）；本地单用户场景下，用户在场可手动 `retryAsyncJob`，不在场时自动续跑只会制造不可控副作用。

具体执行：

1. **`recoverStaleAsyncJobs` 单一收拢点**：启动恢复只标 failed（文案「服务重启，任务中断」），**禁止**按 `reentrant`/`maxRetries`/`retryCount` 分叉重建执行体入池。
2. **`reentrant`/`maxRetries`/`retryCount` 三列已从 schema 删除**：整个 reentrancy 基座（`inferTaskReentrant`、`NativeToolDefinition.reentrant`、`ToolCommand.reentrant`、`registerDomain` 透传、34 工具 `reentrant: true` 声明、入队物化、`retryAsyncJob` 物化）已全部删除。手动 `retryAsyncJob` 不再物化这三列，直接重建执行体入池。
3. **`paused` 会话走手动恢复**：`chatSession.resume` 由用户点按钮触发，**禁止**启动时自动 resume。
4. **`recoverStaleRuns` 如实标 interrupted**：遗留 running Run 标 interrupted，不假装能续跑；ReAct 状态随进程丢失，checkpoint 重建另立设计。
5. **判断标准**：删掉自动续跑分支，僵尸任务是否还能"复活"？答不能 = 正确。能复活 = 违反铁律，删掉续跑代码。

### 架构纪律：子 Agent 隔离

子 Agent 的结果**唯一交付通道** = `agent_report_back` → `autoConsume` 注入父会话异步结果队列（带 jobId 台账）。父 Agent 对子 Agent 只可见状态，不可见消息内容。否则子 Agent 完整上下文污染父 Agent，子 Agent 的存在失去意义。

1. **`invoke_api` 已彻底下线**：禁止再引入万能 API 后门或「打地鼠黑名单」。
2. **`agent_inspect` 不返回任何会话消息内容**：只返 id/title/status/messageCount 等元信息；子 Agent 结果只能经 `agent_report_back`。
3. **`async_task_status` 不返结果全文**：completed/failed 只回状态元信息 + hint「结果已自动投递，无需主动拉取」。

### 架构纪律：写入落点（Workspace + 三桶）

每个 Agent 有独立 Workspace，工作产物隔离——assistant 写 `workspaces/__assistant__/`、super 写 `workspaces/__system__`、业务 Agent 写自己的 `Workspace.path`。

1. **`write_file` / `append_to_file`**：path 相对当前 Agent 的 Workspace 目录；无 Workspace 时回退 `data/workspace/`。以 `content/` 开头才走知识库（如 `content/uploads/` 放图片）。
2. **核心知识库** `content/posts/`、`content/about/` 由 `post_create` / `post_update` 走 Service 同步管道保护，`write_file` 不直接写 `content/posts/`（会脱同步）。禁止 `write_file` 直写 `content/`（除 `uploads/`）。
3. **三桶**：`content/` = 纯知识库事实源（Git 跟踪）；`config/` = Agent 配置事实源（Git 跟踪，daily / curator 等运行时沉淀忽略）；`data/` = 运行时产物（整体 gitignore，可随时重建）。三桶由 `config.ts` 单点配置，sync / Service / 工具全走 config，禁止再硬编码双轨路径。

---

## 测试与 Lint

```bash
pnpm test
pnpm test:e2e          # Playwright，本机 Chrome
pnpm --filter @oasismind/server test
pnpm lint              # server/shared: tsc --noEmit；web: eslint
```

E2E 进程由 `apps/web/e2e-global/setup.mjs` 启动（不要再用 Playwright `webServer` 并行抢端口）。场景：`docs/development/scenarios.md`；并发：`docs/development/concurrency.md`。测例清单以各包 `__tests__/` 与 `apps/web/e2e/` 为准，不在本文件维护目录。

---

## Swarm 要点

| tier | 权限 |
|---|---|
| `super` | 近全能；禁删自己 / 自降 tier；属系统 Root Workspace |
| `manager` | 本 Workspace CRUD；除向超级报告外不出域 |
| `sub` | 执行 + `report_back` / `notify_parent` |

关键模块：`swarmPermissionGuard`、`swarmBus`、`heartbeatEngine`、`swarmOrchestrator`、`swarmInitializer`。决策见 `docs/development/design-decisions.md`。

常用 env：`SWARM_MODE=local`；`AGENT_DESTRUCTIVE_APPROVAL`；`APPROVAL_PENDING_TTL_MS`。免费 key：`pnpm --filter @oasismind/server run sync-free-keys`。

---

## 安全 · 配置 · 部署

- 不提交 `.env` / `dev.db`。`.env.example` 只放占位。默认 `AUTH_MODE=none`；公网必须开鉴权。
- 业务参数在根目录 `config.yaml`（与 `.env` 的密钥/部署分离）。LLM 默认模型：`DEFAULT_LLM_MODEL` env > `config.yaml` `llm.defaultModel` > shared 常量。
- 重启后任务执行体丢失且**不自动续跑**（见「服务重启不自动续跑」）。流式事件：内存环 + 可选 SQLite 日志。
- Docker：根 `Dockerfile` + `docker-compose.yml`。CI：`.github/workflows/ci.yml`。备份：`pnpm db:backup`。

---

## 快速导航

| 想做的事 | 先看 |
|---|---|
| 产品背景 / 快速开始 | `README.md` |
| 迁移与同步 | `MIGRATION_PLAN.md` |
| 模块 / 实体 / CRUD | `docs/development/README.md` |
| 设计决策（已确认） | `docs/development/design-decisions.md` |
| Chat 状态机样板 | `docs/development/chat-state-architecture.md` |
| 场景 / 并发 | `scenarios.md` / `concurrency.md` |
| UI 推拉 | 本文件「推拉结合」；`infra/uiStateNotify.ts`；`.cursor/rules/ui-state-realtime.mdc` |
| 战地笔记 | `docs/development/开发心路历程.md` |
| 未做完的功能 | `docs/development/future-features.md` |
| Agent 工具 / MCP / Skill | `infra/agentTools.ts`、`infra/tools/`、`infra/loop/` |
| 改 tRPC | `apps/server/src/router.ts`、`packages/shared/src/schemas.ts` |
| 改 sync | `apps/server/src/scripts/sync.ts` |
| 测试圣经 / 满分标准 | `docs/development/testing.md` |

---

## 设计决策 Q&A

需要用户拍板的**产品/UI 默认**（发送路径、队列语义、快捷键、可见文案、与场景文档冲突的项）：写入 `docs/development/design-decisions.md`（问题 + 推荐方案 + `回答：`），等用户写回答后再落地。纯基础设施、无用户可感知默认变化：不写回答 = 同意推荐方案。

用户已禁止提问时：不要停在 Q&A 空回答上；按本文件「最不可能出错」落地，非明示部分标 `[OM-FREEPLAY]`。

---

最后更新：2026-08-25。本文件只保留助手日常纪律与导航；变更史见 `CHANGELOG.md` / git / `design-decisions.md`。
