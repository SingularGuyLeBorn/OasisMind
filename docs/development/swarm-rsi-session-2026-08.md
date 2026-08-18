# 见微 2026-08 会话改进说明：模块全景、Swarm 出处合同、RSI 经验门

> 日期：2026-08-18  
> 范围：本轮把 **Swarm（多智能体编排）** 和 **RSI（自我改进 / 经验蒸馏）** 从「提示词劝告」收成 **服务端不变量**；并交代同期落地的记忆分层、信息源导入、开发入口收口。  
> 配套：`AGENTS.md`（铁律）、`docs/development/v0.1.0-technical-overview.md`（更早的全景）、`docs/surveys-2026/RSI-Harness调研-对接见微-2026-08.md`（RSI 调研坐标）。

本文回答四件事：

1. 见微现在主要分哪些模块、各模块做什么。  
2. 本轮具体改进了什么、为什么这么改。  
3. 做的过程踩了哪些坑。  
4. 每个坑为什么必须从**架构层**修，而不是在编排层打补丁。

---

## 1. 项目定位（读本文前先认）

见微（OasisMind）是**单用户、本地优先**的智能知识管理与博客平台：Markdown 为原子、AI 为引擎的数字花园，并做成常驻数字主力（提醒、收集、蒸馏品味）。

三条原则：

| 原则 | 含义 |
|------|------|
| Markdown 是事实源 | `content/`、`config/` 是持久真相；SQLite 只是查询/缓存，可随时重建 |
| 权威只在服务端 | 前端零真相：只订阅、只渲染；写点后必须 **PUSH + PULL** |
| 禁止打补丁 | 不变量进 reducer / 纯函数 / 服务端合同；禁止 `setTimeout` / `await hydrate` 赌时序 |

本轮**故意不做**：嵌 QM 第二套编排、嵌腾讯 Memory sidecar、群聊式 AutoGen、服务重启自动续跑 ReAct。这些要么破坏单用户本地优先，要么违反「重启不自动续跑」铁律。

---

## 2. 目前项目主要分什么模块

### 2.1 仓库分层

```text
OasisMind/
├── apps/server/          后端：Express + tRPC + Prisma + Agent 运行时
├── apps/web/             前端：Next.js 16 App Router + Chat / 花园 / 管理页
├── apps/algo-viz/        算法可视化（Remotion / ```viz）
├── apps/mock-llm/        测试用 OpenAI 兼容 Mock LLM
├── packages/shared/      Zod schema、常量、前后端共享类型
├── packages/mock-llm-core/
├── content/              知识库事实源（花园 Markdown + about + uploads）
├── config/               Agent/Skill/Memory/MCP/信息源配置事实源
├── data/                 运行时产物（gitignore，可重建）
├── workspaces/           Agent Workspace 磁盘落点（gitignore）
├── docs/development/     架构、场景、并发、设计决策
└── scripts/              dev / remote / 清理
```

### 2.2 后端模块（`apps/server`）

| 模块 | 关键路径 | 功能 |
|------|----------|------|
| 入口与恢复 | `src/index.ts` | 起 Express、EventBus、心跳、Trigger、启动恢复（僵尸 Task 标 failed，**不自动续跑**） |
| 路由聚合 | `src/router.ts` | 只聚合域 router，禁止第二套实现 |
| 实体 CRUD | `infra/entityServices/` + `infra/trpcRouters/` | Post / Agent / Session / Memory / Skill / Task / Approval / InfoSource … |
| Markdown↔DB | `scripts/sync/` + `FileSyncService` | 文件先行、DB 投影；`content/` 与 `config/` 分桶 |
| ReAct 内核 | `infra/loop/reactLoop.ts` | 统一 sync/stream 循环；工具批次、审批挂起、反思 |
| Native 工具 | `infra/tools/native/{fs,web,shell,swarm,session,memory,integration}` | 闭工具集；无 `invoke_api` 万能后门 |
| Swarm 编排 | `swarmOrchestrator` / `swarmBus` / `swarmPermissionGuard` | 三层 Agent、depth/队列守卫、子结果唯一通道 |
| 异步任务池 | `asyncJobOrchestrator` + `asyncJobs/` | 全局槽位、投递 CLAIM、对账 reconciler |
| 流式枢纽 | `sessionStreamHub` + `uiStateNotify` | SSE 推状态；前端只订阅 |
| 记忆仓储 | `memoryRepository` + `promptBuilder` | scope 隔离、FTS/RRF、分层注入、persona |
| RSI / 实验 | `agentEvolution` / `experimentLedger` / `harness_refine` | 经验积累、失败归因、keep 必须外部门禁 |
| 信息源 | `rssFetch` / `opmlImport` / `tidingsRssImport` | RSS + OPML + Tidings 目录导入 |
| 渠道 | `channels/qqOfficialBot` 等 | QQ 官方 Bot 被动回发（seq 去重） |

### 2.3 前端模块（`apps/web`）

| 模块 | 功能 |
|------|------|
| 花园 / 博客 | `/` 首页、`/posts`、分类/标签、Milkdown 编辑器、KaTeX、文章树 |
| Chat | 三栏会话；三层 store（消息 / 流生命周期 / 输入队列）；SSE 续传 |
| 管理页 | `/agents` `/runs` `/approvals` `/cron` `/sources` `/credentials` … |
| 推拉 | 进页 PULL 水合；写点后 SSE invalidate；进行中短轮询兜底 |

### 2.4 Swarm 已有能力（本轮之前就落地，不要当没做）

- 三层：`super` / `manager` / `sub` + Workspace。  
- 子结果**唯一通道**：`agent_report_back` → Task CLAIM → 父会话异步队列。  
- `agent_inspect` **不返消息内容**；`invoke_api` 已删除。  
- spawn 同步/异步正交；忙时入队、空闲 drain；depth / 队列上限。  
- 服务重启：僵尸 running/queued **一律 failed**，paused 会话只允许人手 `resume`。

### 2.5 RSI 已有能力（本轮之前就落地）

见微坐标是改 **prompt + skill + memory（文本态）** × **LLM-guided + experience-driven**，不碰权重、不改 `apps/server` runtime。

已有：ExperimentLedger（keep 必须外部指标）、`harness_gate_run`、`harness_refine`（须证据）、IVE `attributeFailure`、persona 蒸馏、embedding+RRF、taskCanvas。  
红线：keep 禁止模型自评；自改只限 skills/memories/prompt notes；无账本不许过夜自治。

---

## 3. 本轮主要改进（按主题）

### 3.1 Swarm：`report_back` 出处合同

**改之前的缺口**

父 Agent 收到的只是一段自由文本 `content`。无法区分：

- 子 Agent 真读过文件/网页；  
- 子 Agent 编了一段「调研完成」。

提示词写「要引用出处」，LLM 经常不写。编排层无法事后补救。

**架构层做法（不靠提示词记得）**

新增叶子纯函数 `infra/swarmReportContract.ts`（**禁止 prisma**）：

| 状态 | 条件 | 父侧看见 |
|------|------|----------|
| `cited` | 有 `evidence`（path / url / memoryId / toolResult / note） | 正文 + 「出处：」指针列表 |
| `excused` | `noEvidenceReason`，或 `outcome=failed/blocked`，或 `query` | 不打未核验；失败带 `[outcome=…]` |
| `none` | 成功结案且无出处 | 前缀 `[未经出处核验]`，**仍投递**（宁漏出处也不丢结果） |

写入点：

- `agent_report_back`：规范化后再 `bus.send` / 写 `Task.output`（`asyncResult` + `evidence` + `evidenceStatus` + `outcome`）。  
- `messageType=query`：**只求援、不结案**——跟踪 Task 保持 running，避免「问一句登录墙就把子任务标 success」。  
- `waitForResult=true` 且子 Agent **没** `report_back`、只抓到末条 assistant：同样打未核验标记（两条交付路径同一合同）。

父 Agent 仍然**看不见子会话消息**，只看见合同后的结论 + 指针。这与「子 Agent 隔离铁律」一致。

### 3.2 RSI：未核验经验不准蒸馏成规则

**改之前的缺口**

`accumulateExperience` 只要 run 有工具、有正文，就当成功、强度 1.0，再被心跳蒸馏成 `procedural`。  
无出处的 `report_back` 会把幻觉写成「这类任务该怎么做」的规则——这是 RSI 最危险的正反馈。

**架构层做法**

不变量收进 `agentEvolution.ts`，不靠管理 Agent「记得审查」：

1. 从本轮工具结果抽出最近一次 `report_back` 合同（`extractReportBackContract`）。  
2. `outcome=failed/blocked` 且无工具报错 → IVE **direction**（方向/目标未达成）。  
3. `evidenceStatus=none` 的成功经验：强度 **0.7**，keywords 打 `evidence:none`。  
4. `distillExperienceToProcedural` **先过滤** `isCitedExperience`：`evidenceStatus===none` 不进蒸馏；缺字段的**历史经验仍可蒸馏**（不搞兼容分支读路径，只是缺省视为旧数据可蒸馏）。

这样 RSI 的「成功蒸馏」与 Swarm 出处合同是同一条链：没出处的回报进不了 procedural。

### 3.3 记忆：分层注入 + 本房间优先（学思想，不嵌外挂）

用户要求学腾讯分层记忆 / QM「本房间优先」的**思想**，但禁止再嵌一套 Memory OS。

已有 persona（L3）、FTS+向量 RRF、writeGate。本轮只改见微自己的读路径：

| 层 | 类型 | 注入标题 |
|----|------|----------|
| L3 | `persona` | 仍走 `buildPersonaHint`（画像块） |
| L2 | `procedural` / `note` | 「场景与流程」先注入 |
| L1 | `preference` / `semantic` / `episodic` | 「相关长期记忆」后注入 |

总预算约 1800 字，超了**先丢 L1 尾**，保住场景规则。  
排序乘 `memoryScopeProximityBoost`：`agent:` ×1.2、`workspace:` ×1.12、`global` ×1.0。  
这是检索/注入合同，不是前端猜「该显示哪条记忆」。

### 3.4 信息源：Tidings OPML 批量导入

见微已有 InfoSource + `rssFetch` + `/sources`。缺的是批量订阅公开目录。

- `opmlImport.ts`：解析 OPML、规范化 feed URL。  
- `tidingsRssImport.ts`：拉 [tidings-rss](https://github.com/fuxiaoai/tidings-rss) 的 `ai` / `top200` / `research`。  
- tRPC：`infoSource.importOpml` / `importTidings`（`aiReadable: false`，防 smoke 真打 GitHub）。  
- 默认 `enabled: false`、`fetchInterval: null`，同 URL skip，不把 99 个 json 提交进仓库。

### 3.5 开发入口收成两种

| 命令 | 含义 |
|------|------|
| `pnpm dev` | generate + 全量 sync + server + web + sync:watch |
| `pnpm dev:mini` | 跳过全量 sync 与 watch，本地已有库时快速起来 |

后端用 `dev:once`（无 tsx watch）。改 server 需重启。这是减入口，不是加第三种「稳定模式」。

### 3.6 其它同期（同工作树、非本轮 Swarm/RSI 主刀）

工作树里还有编辑器配图、QQ 官方 Bot 媒体/seq、首页拆分、E2E setup 强制本轮 server 端口等。它们与出处合同正交；提交时按主题拆开，避免一锅端。

---

## 4. 做的过程遇到什么问题，怎么从架构上解决

### 问题 A：差点嵌了第二套记忆 / 第二套 Swarm

**现象**：调研腾讯 Agent Memory、QM 后，一度想接 sidecar、把工具塞进默认清单。

**为什么是架构事故**：见微已经有 MemoryRepository + Swarm 三层。再嵌一套 = 双真相、双检索、双隔离规则。父 Agent 又能从旁路读子上下文，子 Agent 隔离铁律立刻作废。

**架构解**：只抄思想，改本仓读路径与合同。腾讯工具、`TENCENT_AGENT_MEMORY_*`、启动时给 assistant 自动补齐外挂工具——全部拆掉。判断标准：删掉外挂，见微自己的记忆/编排是否还能工作？答能 = 正确。

### 问题 B：用提示词「编排优先 / 请带出处」当修复

**现象**：`super`/`manager` 模板写「编排优先」，`report_back` 描述写「请引用材料」。模型经常空手回报。

**为什么补丁无效**：提示词是建议；工具 schema 不收 `evidence` 时，服务端无法区分 cited / none。父侧永远当成功全文吃下去。

**架构解**：合同是**纯函数**，写点强制走 `normalizeReportBack`。非法/缺出处不是「前端显示个警告」，而是 `Task.output` 与投递正文带状态。编排层漏传字段，合同仍打标。  
**自检**：删掉 prompt 里「必须带 evidence」那一行，未核验标记还会不会出现？会 → 不变量在合同，不在文案。

### 问题 C：`query` 求援被当成任务完成

**现象**：`agent_report_back` 的 `messageType` 允许 `query`，但桥接逻辑一律把跟踪 Task 标 `success`。子 Agent 说「卡在登录墙」= 任务结束。

**架构解**：合同里 `messageType=query` 与结案分流。handler 在 query 分支 **return，不写 Task 终态**。这是状态机：query ≠ terminal。测试负向断言：query 之后 `status` 仍为 `running`。

### 问题 D：两条交付路径不一致

**现象**：异步路径走 `report_back`；`waitForResult=true` 可在无 `report_back` 时抓子会话最后一条 assistant。后者没有出处字段，父 Agent 把「闲聊收尾」当正式交付。

**架构解**：同一合同函数 `markUnverifiedAssistantDump`。不允许「同步路径例外不打标」。P2-07 正式例外（同步可返摘要）保留，但摘要必须带未核验标记。

### 问题 E：RSI 把无出处成功蒸馏成 procedural

**现象**：经验 JSON 没有 `evidenceStatus`，蒸馏只看条数 ≥ `minCount`。幻觉回报满 5 条就能变成「操作规则」。

**架构解**：蒸馏入口过滤 `isCitedExperience`。不是在 LLM prompt 里写「请忽略不可靠经验」——那是补丁。过滤在写 procedural **之前**，源经验也不被误归档进规则。

### 问题 F：经验强度与「有没有正文」绑死

**现象**：`success = !!result.content.trim()`。空手 `report_back({ outcome: failed })` 只要模型还写了几句解释，会被当成成功经验。

**架构解**：`success = 有正文 && outcome 不是 failed/blocked`。失败归因在 `attributeFailure` 增加 outcome 分支（工具报错仍优先 implementation）。规则顺序写进函数，不写进注释。

### 问题 G：改身份提示词导致 contextHooks 等价性 fixture 红

**现象**：`buildTierIdentityHint` 加「出处合同」一行，`contextHooks.equivalence.json` 逐字节比对失败。

**解**：fixture 与身份段同源更新。这不是兼容层，是钩子链的冻结快照——改文案必须改快照，禁止留旧拼装。

### 问题 H：全仓 Vitest 绿、E2E 大面积超时

**现象**：`pnpm test` 全绿；`pnpm test:e2e` 约 20 例失败。日志是 Next rewrite 打 `127.0.0.1:3011`，真实 E2E server 在 **3010**。

**根因（架构）**：`next.config.ts` 的 `SERVER_INTERNAL_URL` 在 **`next build` 时烤进** `.next/routes-manifest.json`。上次 mock E2E 构建把 3011 写死；`next start` 运行时改 env **改不了** 已烤死的 rewrite。

**解**：

1. `e2e-global/setup.mjs` **强制** `SERVER_INTERNAL_URL` / `NEXT_PUBLIC_SERVER_URL` 等于本轮 `E2E_SERVER_PORT`，禁止继承壳里残留的 3011。  
2. 跑真实 E2E 前必须用 3010 重编前端（运行时 env 救不了烤死的 rewrite）。

这不是「再等两秒」的补丁。权威是构建产物里的 rewrite 表。

### 问题 I：Prisma `db push` 与 FTS、开发入口膨胀

**同期约束**（不是本轮新发明）：`pnpm dev` 不能靠 `db push` 对齐列，否则会误删 FTS 虚表。新列走 `ensureSqliteColumns`（只 ADD 不 DROP）。开发入口从一堆 `dev:qq` / `dev:quick` 收成 `dev` / `dev:mini`。

---

## 5. 不变量清单（给半年后的自己）

删掉编排层「记得调用」之后，下列是否仍成立？

- [ ] 成功 `report_back` 无出处 → 父侧正文含 `[未经出处核验]`  
- [ ] `query` → 跟踪 Task 不进终态  
- [ ] 同步抓 assistant 无 report_back → 同样未核验标记  
- [ ] `evidenceStatus=none` 的经验 → 不进 procedural 蒸馏  
- [ ] 父 Agent 仍不能经 `agent_inspect` 读子消息  
- [ ] 记忆注入：L2 场景块在 L1 原子事实之前；超预算先丢 L1  
- [ ] 检索：同关键词下 `agent:` scope 高于 `global`  
- [ ] 服务重启仍不自动续跑  

任一条靠 `setTimeout` / 提示词才能成立 → 打回。

---

## 6. 测试与验证（本轮）

| 套件 | 结果（2026-08-18） |
|------|-------------------|
| `@oasismind/server` / `shared` `tsc --noEmit` | 通过 |
| `pnpm test` 全仓 Vitest | 通过：server 1415、web 210、shared 55、mock-llm-core 13 |
| 新增/加严单测 | `swarmReportContract.test.ts`；ledger 的 query 不结案；evolution 无出处降强度；distill T5 全 none 不蒸馏 |
| web eslint | 编辑器两处旧错（`EditorAgentComplete` / `MilkdownEditor`），与出处合同无关 |
| `pnpm test:e2e` | 29 过 / 20 失败：rewrite 烤在 3011（见问题 H），**不是** Swarm/RSI 回归 |

复跑真实 E2E：

```bash
$env:SERVER_INTERNAL_URL="http://127.0.0.1:3010"
pnpm --filter @oasismind/web build
pnpm test:e2e
```

---

## 7. 模块交互（本轮相关）

```text
子 Agent ReAct
    │ agent_report_back(args)
    ▼
normalizeReportBack   ← 纯函数合同（无 DB）
    │
    ├─ query ────────────────► SwarmBus 仅留言，Task 不结案
    │
    └─ report ───────────────► SwarmBus + Task.output{asyncResult,evidence*}
                                    │
                                    ▼
                         notifyAndAutoConsume  → 父会话气泡（只见合同后文本）
                                    │
子 run 结束 accumulateExperience ←──┘ 读 toolCalls[].result.evidenceStatus
                                    │
                                    ▼
                         distillExperienceToProcedural
                         （过滤 none，才写 procedural）
                                    │
                                    ▼
                         promptBuilder L2 注入「场景与流程」
```

前端不参与判定。父 Chat 只渲染投递正文；管理页 `/runs` 仍只看 Task 状态。

---

## 8. 和调研清单的对照

| 调研项 | 本轮 |
|--------|------|
| 编排者硬拦亲自 `web_search` | **不做**。单用户下编排者必须能亲自读；提示词「编排优先」保留，工具不砍 |
| report_back 出处 | **做了**（合同 + 未核验标记） |
| 交班 handoff ≠ spawn | **仍不做**（产品选择，不是缺口） |
| QM 观众过滤 | **不做**（单用户用不上） |
| 离线搜 Skill 变体 → PR | **仍不做**（P3，范围外） |
| refine 扩到实验策略配置 | **仍不做**（P3） |
| 嵌 QM / 腾讯 Memory | **明确拒绝** |

---

## 9. 相关文件

| 文件 | 职责 |
|------|------|
| `apps/server/src/infra/swarmReportContract.ts` | 出处合同纯函数 |
| `apps/server/src/infra/tools/native/swarm/reportBack.ts` | 写点走合同；query 不结案 |
| `apps/server/src/infra/tools/native/session/spawnSubagent.ts` | 同步抓取打未核验 |
| `apps/server/src/infra/agentEvolution.ts` | 经验强度 / IVE / 蒸馏过滤 |
| `apps/server/src/infra/promptBuilder.ts` | 身份段 + 分层记忆注入 |
| `apps/server/src/infra/memoryRepository.ts` | scope 邻近加权 |
| `apps/server/src/infra/opmlImport.ts` / `tidingsRssImport.ts` | OPML / Tidings |
| `apps/web/e2e-global/setup.mjs` | E2E 禁止继承 3011 |
| `config/agents/_templates/sub.md` | 子 Agent 出处合同写进身份 |

---

> 一句话：本轮没有换一套 Swarm，也没有换一套 RSI。是把「子结果必须可核验、无核验不得进化成规则」收进服务端合同，让提示词写错也打不破。
