# 见微 ← DeepSeek Harness：完整落地计划（已裁决）

> 日期：2026-08-14  
> 对照源码：本地 `D:/ALL IN AI/deepseek-harness`（zip 解压）+ 本仓库 `apps/server/src/infra/**`  
> 本文只做计划，**不改业务代码**。按 `AGENTS.md` 设计决策流程。  
> 2026-08-14 用户授权：**不逐题手填则按推荐落地**。第 5 节已全部写入推荐案，作为施工规格。

---

## 0. 一句话目标

把 DSH 三句不变量写进见微的 **registry / loop / prompt**，做成**真能跑、真改行为**的能力，而不是再加一层「可选 hook」空壳。

三句不变量：

1. **可见 / 可执行 / 可展示 = 同一个 VisibleSet**；子 Agent 自己的回传通道父滤不掉。
2. **给模型看的、程序用的、磁盘存的，可以不是同一份字节**；截断只砍「给模型看的」。
3. **策略看到冻结入参；已启动的工具 body 必须等到停，禁止 `Promise.race` 丢弃。**

见微已有、**禁止用 DSH 覆盖**的三句：

1. 权威在服务端（DB + hub），前端只订（推拉结合）。
2. 子结果唯一投递通道 = `agent_report_back` → Task 原子认领 + 对账。
3. 服务重启不自动续跑。

---

## 1. 明确不做（施工红线）

落地时若出现下列任何一项，按失职打回：

| 禁止 | 原因 |
|------|------|
| 引入 Cordis / Fiber / `ctx.effect` / vendored `vendor/cordis` | 见微副作用在文件+SQLite+SSE，卸载不可逆 |
| 插件 HMR / 热卸载工具域 | 与 Chat 状态机「禁止打补丁」冲突 |
| Code Mode（`run_code` 唯一入口） | 与闭工具集、砍 `invoke_api` 冲突 |
| 用 SessionEvent 日志替换 ChatMessage | 会重写 PR-5/PR-6 stream commit |
| 把 `reactLoop` 做成可插拔 driver | 相位机/审批挂起/rollback/budget 绑死 |
| 把审批 `ask` 并进工具 pipeline 当同步门 | 会拆掉 W11 `awaiting_human` |
| 审批缺失时「降级 deny」（DSH 默认） | 见微默认本地花园直接执行 |
| `$DSH_HOME` / profile / pnpm 插件生态 / 226 包化 | 配置权威在 repo 的 yaml + Markdown |
| 默认 OTLP 遥测 | 本地单用户无产品需求 |
| 用 sandbox 三档 mode **替换** W6 rollback | 预防 ≠ 补偿，两套都留 |
| 交付文案写「刷新一下」 | UI 铁律 |

---

## 2. 现状调用链（施工必须认的地图）

一次 native 工具从模型发到 LLM 再看见结果，今天经过：

```
LLM tool_calls
  → reactLoop tool_batch
      → partitionToolCallsByBudget
      → executeToolCallsBatch          # agentTools.ts
          → isToolAuthorized           # registry 有无 / parsed.native
          → A/B/C/D 分桶并发
          → withToolTimeout = Promise.race(body, timeout, abort)   # 丢弃 body
          → executeAgentTool
              → peelExpectControls
              → allowedNative 再拦一层
              → readonlyOnly / SAFE_BYPASS
              → assertApprovalOrProceed          # 审批：抛 pending → loop 挂起
              → executeNativeTool                # nativeTools.ts
                  → peelExpectControls 再剥一次
                  → checkToolPermission          # swarmPermissionGuard（tier 表）
                  → MOCK_NATIVE_TOOLS
                  → checkRequiredParams
                  → rollbackStack.capture
                  → cmd.execute
                  → rollbackStack.commit
      → 审批 pending → awaiting_human（不进 pipeline）
      → appendToolResultMessages
          → offloadToolResultIfNeeded   # 超阈值：磁盘全文 + LLM 瘦卡；ChatMessage 存瘦卡
          → truncateToolResultContent   # 再砍同一份 JSON 到 16k
          → markToolResultUntrusted
          → llmMessages.push(role:tool)
```

给模型看的 schema 另算：

```
parseAgentTools(Agent.tools)
  → resolveToolsForAgentTier（空清单走模板 + getAllowedToolsForTier）
  → buildAgentToolSchemas
      → buildNativeToolSchemas(allowed)   # defaultHidden 在 native:"all" 时跳过
      → skill / mcp 拼进去
      → 体积硬顶再剥 integration/skill/mcp
```

子 Agent 工具清单今天是：

- `DEFAULT_SUBAGENT_TOOLS` = `config/agents/_templates/sub.md` 加载时快照
- `spawn_subagent` 物化子 Agent 时写入 `tools: [...DEFAULT_SUBAGENT_TOOLS]`
- `reactLoop` 对子任务血统会再覆写 `parsed.native = DEFAULT_SUBAGENT_TOOLS`（裸名）
- **没有**「父 restrict 继承面 / 孩子 own 层豁免」这个结构

Prompt 今天是：

- Agent 文件固化的 `systemPrompt`（模板创建时写死）
- 每 run `round===1` 跑 `contextHooks`：memory / tier-identity / tool-guide / agent-extras
- 动态状态（登录态、workspace、沙箱）没有「快照覆盖上一条快照」通道 → 才需要一次性 `fix-super-agent-prompt.ts`

已有、本计划必须复用而不是重造：

| 已有 | 路径 | 本计划怎么用 |
|------|------|----------------|
| 工具注册表 | `infra/tools/registry.ts` | VisibleSet 的全集来源 |
| 域注册 | `registerNativeDomain` + `registerNativeDomains(packs)` | 加 `promptSection` / `ownLayer` / `render` 字段 |
| 结果落盘 | `toolResultOffload.ts` + `config.compact.toolResultOffload` | 升级为「value 通道」的磁盘权威 |
| 路径策略 | `resolveAgentFsPath`（`fs.ts`） | 抽成写策略单一 resolve，工具继续调它 |
| 审批相位 | `approvalGate` + `reactLoop` awaiting_human | **不进** pipeline |
| 投递对账 | `agentMessageLedger` / `autoConsume` | 不改语义 |
| 回滚栈 | `tools/rollback.ts` | 仍由 pipeline 在 execute 前后调用，不改补偿语义 |

---

## 3. 目标架构（落地后长什么样）

### 3.1 新叶子（只加这些文件，禁止平行第二套）

| 新文件 | 职责 |
|--------|------|
| `apps/server/src/infra/tools/visibleSet.ts` | **唯一**派生「这个 Agent 此刻能看见/能调哪些工具」 |
| `apps/server/src/infra/tools/toolEnvelope.ts` | `{ value, content, persist }` 类型 + 默认投影 + 冻结入参 |
| `apps/server/src/infra/tools/toolPipeline.ts` | native 执行的固定 stage 链（函数，不是事件总线） |
| `apps/server/src/infra/tools/cooperativeAbort.ts` | fuse signal + 等 body 停；替换 `withToolTimeout` 的 race |
| `apps/server/src/infra/promptRuntimeContext.ts` | 运行时快照块（覆盖语义），与 `contextHooks` 的稳定 section 分开 |
| `apps/server/src/infra/writePolicy.ts` | 从 `resolveAgentFsPath` 抽出的读/写策略（工具只调，不各自 if） |

`nativeTools.executeNativeTool` 变成 **pipeline 的入口薄壳**（权限/mock/required/rollback 都迁进 stage）。`agentTools.withToolTimeout` 删除，改调 `cooperativeAbort`。

### 3.2 工具结果信封（真改行为的核心）

```ts
/** 一次工具执行的三通道。value 必须 JSON 可序列化（与 DSH snapshotJsonValue 同口径）。 */
export type ToolEnvelope = {
  value: unknown;
  /** 喂 LLM 的视图；缺省 = 对 value 做默认投影（可截断/可 offload 卡） */
  content: unknown;
  persist?: {
    path: string;
    metaPath?: string;
    originalChars: number;
  };
};

export type ToolExecResult =
  | { ok: true; envelope: ToolEnvelope; elapsedMs: number }
  | { ok: false; error: ToolExecError; envelope: ToolEnvelope; elapsedMs: number };

export type ToolExecError = {
  code:
    | "NOT_VISIBLE"
    | "VALIDATION"
    | "PERMISSION"
    | "MOCK"
    | "ABORTED_BEFORE_DISPATCH"
    | "ABORTED"
    | "TIMEOUT"
    | "HANDLER"
    | "SAFE_BYPASS_READONLY";
  message: string;
  details?: Record<string, unknown>;
};
```

**handler 仍可返回普通 object**（50+ 工具不逐个改签名）。`registerNativeDomain` 的 `execute` 包装：

- 返回值若已是 `ToolEnvelope`（带品牌字段 `ok`/`value`/`content` 且通过 `isToolEnvelope`）→ 原样；
- 否则 `value = raw`，`content` 由 pipeline 后段投影。

禁止长期保留「旧签名兼容重载」。包装是 **唯一** 入口，不是 deprecated 双轨。

### 3.3 VisibleSet（真改行为的第二核）

```ts
export type VisibleSetInput = {
  agentId: string;
  tier: string;
  /** Agent.tools 原始字段（含 native:/skill:/mcp:） */
  agentTools: string[];
  packs: PackFlags;
  /**
   * 父在 spawn 时写下的继承面滤镜。只滤「全局+祖先」能力。
   * 缺省 = 不过滤继承面（现状）。
   */
  inheritMask?: { allow?: string[]; deny?: string[] };
  /**
   * 本 Agent 自己的层：父 mask 剥不掉。
   * 默认见 Q5。
   */
  childOwn?: string[];
};

export type VisibleSet = {
  native: string[];          // 裸名，已是最终可见集
  skills: string[];
  mcpServers: string[];
  nativeAll: boolean;        // 仅当 Agent 显式 native:all 且未被 mask 收成列举
  /** schema 用：与 native 相同；执行用同一数组 */
  reasonByName?: Record<string, "hidden" | "tier" | "mask" | "pack" | "own">;
};
```

派生顺序（写进函数注释，测试按此顺序做负向断言）：

1. 全集 = `listTools("native")` 且 `domainAllowed(domain, packs)`。
2. `defaultHidden`：不在 `agentTools` 显式名单里的隐藏工具剔除。`native:all` 仍跳过 hidden（现状 P1-03）。
3. tier：`getAllowedToolsForTier`（复用现表，不新造平行表）。
4. 把结果分成 **inherited** vs **own**（own = `childOwn` ∩ 全集）。
5. `inheritMask.allow/deny` **只打 inherited**。
6. `visible = maskedInherited ∪ own`。
7. skill/mcp 仍按 `parseAgentTools`，但 **schema 构建与 execute 授权都读 VisibleSet**，禁止第三处再算。

`buildNativeToolSchemas` / `isToolAuthorized` / `executeNativeTool` 开头的权限 → 全部改成「问 VisibleSet」。`swarmPermissionGuard.checkToolPermission` **保留**（跨 workspace、自删、向上时机），因为它校验的是 **args 级**，不是「在不在清单里」。清单问题不再由它兼职。

### 3.4 Pipeline stage（固定顺序，可注册观测，不可改序）

```
0  freezeArgs          剥 expect_* → JSON snapshot → Object.freeze（浅冻 + 递归冻纯 JSON）
1  resolveVisible      不在 VisibleSet → NOT_VISIBLE 结构化结果，不进 handler
2  validateRequired    现 checkRequiredParams
3  permissionArgs      checkToolPermission + readonlyOnly（args 级）
4  mock                MOCK_NATIVE_TOOLS
5  captureRollback     destructive 且有 stack
6  dispatch            cooperativeAbort(handler)
7  commitRollback      成功才入栈
8  projectContent      默认投影 / 工具自带 render
9  persistValue        复用 toolResultOffload：value 落盘；content 按阈值变瘦卡
10 observe             只读：elapsedMs、tools/result 等价回调（测试/指标）
```

**刻意不在这里的：**

- 审批 `assertApprovalOrProceed` —— 留在 `executeAgentTool`，pending 仍抛给 loop。
- `toolLoopGuard` —— 留在 `reactLoop`（软警告，不硬拦）。
- budget skip —— 留在 loop（必须回写 tool 消息）。

观测回调用 `registerToolObserver(fn)` 数组，失败 `console.warn` 不进结果。**不是** Cordis waterfall。后注册的 observer 不能把 deny 翻成 allow（没有 allow 通道）。

### 3.5 Prompt 三分

| 通道 | 谁写 | 何时变 | 落点 |
|------|------|--------|------|
| **section（稳定）** | 工具注册时的 `promptSection` + 现有 identity/tool-guide 中的铁律 | Agent 配置变 / 进程启动 | system prompt |
| **runtime snapshot** | `promptRuntimeContext` 提供者（沙箱/登录/workspace/预算） | **每轮 LLM 前** | 独立 user 块，文案声明覆盖上一条 |
| **schemas** | VisibleSet → `buildNativeToolSchemas` | 可见集变 | tool schema 数组 |

`contextHooks` 不删。改职责：

- memory / extras 继续 hook（fail-soft）。
- `tool-guide` 不再是 `promptBuilder` 里一大段 `WEB_TOOL_GUIDE` 字符串，改为 **聚合各工具 `promptSection`**（order 100–199）。
- 新增 hook `runtime-snapshot`（order 900，**每轮都跑**）：插入/替换标记为 `<!-- kp-runtime-context -->` 的 user 块。

---

## 4. 工作包（按依赖，做完一个就能验收）

每个 WP 结束必须：相关测试绿 + 该 WP 的负向断言先红后绿 + `git commit` 按主题（你点头后再提交）。

---

### WP0 — 契约与测试夹具（不改行为，先把类型和负向测试立住）

**改：**

- `packages/shared`：如需跨端类型，只加 `ToolEnvelope` 的 **只读投影**（web 若要展示 persist.path）。能不放 shared 就不放——信封是 server 执行契约。
- `infra/tools/toolEnvelope.ts`：类型 + `isToolEnvelope` + `freezeJson` + `defaultProjectContent(value)`。
- `__tests__/toolEnvelope.test.ts`：不可序列化（bigint/function）→ 抛；循环引用 → 抛；freeze 后改属性 throw（strict）。

**验收：** 现网行为零变化（此 WP 无调用方）。

---

### WP1 — VisibleSet 单一派生（用户可感知：schema 与执行对齐）

**改：**

- 新 `visibleSet.ts`。
- `loop/setup.ts` `resolveToolsForAgentTier` **改为调用 VisibleSet**（或变成薄委托）。禁止再手写一遍 tier 裁剪。
- `agentTools.buildAgentToolSchemas`：native 部分只吃 `visible.native`。
- `agentTools.isToolAuthorized`：native 名 ∈ `visible.native`（或 own）。
- `nativeTools.executeNativeTool`：第一道改为 VisibleSet；`checkToolPermission` 只做 args 级。
- `reactLoop` 里子任务覆写 `parsed.native = DEFAULT_SUBAGENT_TOOLS` **删除**，改为「子 Agent 物化时写入的 tools + childOwn」经 VisibleSet 计算。这是行为变化：以前 loop 硬覆写，以后以物化清单+own 为准。

**必须先写的负向测试（旧实现红）：**

1. Agent.tools 不含 `run_shell`，`defaultHidden=true` → schema 无、execute 返回 `NOT_VISIBLE`（不是 handler 里的「未知工具」）。
2. `native:all` + hidden 危险工具 → schema 仍无 `run_shell`（P1-03 保持）。
3. sub tier 的 Agent.tools 里写了 `spawn_subagent` → VisibleSet 不含（tier 裁），execute `NOT_VISIBLE`。
4. **own 豁免：** inheritMask.deny 含 `agent_report_back`，但 childOwn 含它 → schema 有、execute 通。
5. inheritMask.allow 只有 `read_file` → 继承面只剩 read_file，own 仍在。
6. pack 关掉 `qq` → VisibleSet 无 qq 工具，即使 Agent.tools 写了。

**调用方要改的文件（一次改完，禁止兼容旧函数）：**

- `agentTools.ts`（build schemas / authorize / createAgentToolContext 携带 VisibleSet）
- `nativeTools.ts`
- `loop/setup.ts` / `loop/reactLoop.ts`（删硬覆写）
- `tools/native/session.ts` spawn 物化
- `swarmPermissionGuard.ts`：`getAllowedToolsForTier` 保留给 VisibleSet 内部用；对外文档写明「清单不在这里算」

**产品可见变化：** 模型不再看到「调用会被 tier 拦」的工具。这是功能，不是重构。

---

### WP2 — 三通道结果 + 截断只砍 content（用户可感知：长文不再从 JSON 中间断）

**改：**

- `appendToolResultMessages`（`reactLoop.ts`）：
  - 入参从 `result: unknown` 改为 `ToolExecResult`。
  - **落盘 / ChatMessage.toolResults / executedTools**：按 Q1。
  - **喂 LLM 的 `role:tool` content**：只用 `envelope.content`，再 `markToolResultUntrusted`。
  - **删除**对同一对象再 `JSON.stringify` + `truncateToolResultContent` 的双砍。`AGENT_TOOL_RESULT_MAX_CHARS` 变成 **content 投影的硬顶**，在 `projectContent` 里执行，不再在 loop 里二次 slice。
- `toolResultOffload.ts`：
  - 输入改为 `value`（全文权威）。
  - 输出：`persist` + `content`（瘦卡，含 `_kp_result_path`，与现字段兼容——这是磁盘格式，不是 API 兼容层）。
  - 阈值仍用 `config.compact.toolResultOffload.thresholdChars`（现 4000）。
- `microCompact.toolResultMaxChars`（4000）：只作用于 **content**，禁止再碰 value。
- `asyncToolDeliveryFormat.ts`：父会话气泡若展示工具结果，用 content；需要全文走 path。**禁止**再把 value 全文塞进投递气泡（与 v7「status 去全文」同向）。

**默认投影算法（写死，测它）：**

1. `value` 不是 object → `content = value`，超硬顶则变 `{ truncated: true, preview, persist? }`。
2. object：找最长文本字段（现列表 `content/text/transcript/excerpt/html/markdown`），只截该字段，其余字段完整；加 `TRUNCATED` 标记 + `nextOffset` 提示（若工具声明了分页）。
3. 无长文本字段且 JSON 超硬顶 → 不 slice 中间，改为 `{ truncated: true, keys, persist, hint }`。
4. 超 `thresholdChars` → offload，content 换成现有瘦卡形状（keywords + path + hint）。

**工具可选 `render(value, args) => content`：** 第一波只给 `read_article` / `read_file` / `video_transcript` / `save_webpage` 四个长文工具写 render（分页元数据保留）。其余走默认投影。这是真功能：这四个工具的 LLM 视图稳定、可翻页。

**必须先写的负向测试：**

1. `read_article` 返回 20k content + 大 metadata → LLM 消息 ≤ 硬顶，且 `title/url/nextOffset` 完整；磁盘 value 含全文。
2. 无长文本字段的大 JSON → LLM 看到 keys+path，**不会**出现半截 key。
3. offload 后 `executedTools` 按 Q1 存；F5 水合后气泡仍能显示瘦卡 + 读 path。
4. `waitForResult=true` 的 spawn 同步返回：父拿到的 tool return 是 content（或声明的同步摘要），不是 16k 砍断的残 JSON。
5. 回归：`toolResultOffload.test.ts` 全绿；字段名 `_kp_result_path` 不变。

---

### WP3 — 冻结入参 + 合作式取消（用户可感知：超时不再幽灵写入）

**改：**

- `NativeToolContext` 增加 **必填** `signal: AbortSignal`（测试用 `new AbortController().signal`）。禁止 optional「有就听、没有就挂」——那是双轨。
- `cooperativeAbort.ts`：
  - `fuseSignals(...signals): { signal, dispose }`
  - `runCooperative(body, { timeoutMs, signal })`：
    1. 建 timeout abort；
    2. `bodyInvoked = true` 之后 **await body**（finally 里 dispose timer）；
    3. body settle 后：若 caller abort 且未开始 → `ABORTED_BEFORE_DISPATCH`；若已开始 → `ABORTED`（可附 `partial: envelope.value`）；若 timeout → `TIMEOUT`（同样等停）；
    4. **禁止** `Promise.race` 让函数返回而 body 仍在跑。
- `agentTools.withToolTimeout` **删除**，`executeToolCallsBatch` 改调 `runCooperative`。
- `LONG_WAIT_TIMEOUT_MS`（spawn/sleep/wait）保留：仍是 timeoutMs 数值，语义改为「到点 abort signal，仍等停」。
- rollback：`TIMEOUT`/`ABORTED` 且 `bodyInvoked` → **不**把该工具当「未执行」；若 handler 已成功返回则 commit；若 handler 抛/未完成则 **不 commit**，并打 warn「可能有进行中副作用」。这是诚实，不是假装能杀进程。

**第一波必须把 `signal` 传到真正会挂起的 handler（否则等停无意义）：**

- `web.ts`：Playwright fetch / screenshot / scroll（`browser.close` 在 abort 时）
- `shell.ts`：child process `kill` on abort
- `session.ts`：`spawn_subagent` 等待环听 signal
- `swarm.ts`：`agent_send_message` waitForRun
- 其余工具：ctx.signal 在，handler 暂不读——合法；WP3b 再扫 C 类。

**必须先写的负向测试：**

1. 一个 mock handler `await sleep(5000)` + 写 flag；timeout 50ms → 调用方在 ~50ms+settle 后得到 `TIMEOUT`，且 flag 在 settle 后才被断言（证明等停）。
2. abort 在 dispatch 前 → `ABORTED_BEFORE_DISPATCH`，handler 零调用。
3. abort 在 handler 已调用后 → `ABORTED`，handler 被 await 完。
4. 冻结：pipeline 里改 `args.foo` throw；handler 看到的 args 与 permission 看到的 `===` 同一冻结对象。
5. 回归：`nativeTools` / `agentTools` 现有超时文案仍含「建议 async_task_run」（TIMEOUT 的 message 保留 hint）。

---

### WP4 — 子 Agent own 层 + spawn mask（用户可感知：父收窄孩子能力，回传不断）

**改：**

- Prisma / Agent 配置：在子 Agent frontmatter 增加可选：

  ```yaml
  toolInheritMask:
    allow: [read_file, read_article, web_search]
    # deny: [...]   # 与 allow 互斥，见 Q6
  ```

  DB：不新表。写入 `Agent.tools` 旁的 JSON 字段 **或** 只放 Markdown frontmatter 由 sync 投影。见 Q7。

- `spawn_subagent` schema 增加可选 `inheritMask`（LLM 可传）。服务端与模板 `childOwn` 合并。
- 物化子 Agent 时：`tools` = VisibleSet 算完的列举（**不要再写 `native:all`**），并持久化 mask + own，刷新后 PULL 回来同一 VisibleSet。
- `agent_inspect` 增加 `visibleToolCount` / `visibleToolsPreview`（只名不内容），方便父看「孩子被收成了什么」。**仍然不返消息。**

**默认 childOwn（Q5 拍板）：** 建议固定集合，代码里 `CHILD_OWN_TOOLS` 常量，禁止 LLM 从 own 里删 `agent_report_back`。

**必须先写的负向测试：**

1. 父 spawn `inheritMask.allow=["read_file"]` → 子 schema 无 `web_search`，有 `agent_report_back`。
2. 父 deny 里写 `agent_report_back` → **服务端忽略该 deny**（或 fail-loud，见 Q5），子仍能 report_back。
3. 子 `agent_inspect` 看不到父会话消息（现有铁律回归）。
4. 刷新后子 VisibleSet 与 spawn 时一致（PULL）。

**产品可见：** 父可以真的限制子能力；限制错了回传通道不会哑火。

---

### WP5 — Prompt 三分 + 工具自带 section（用户可感知：少写一次性修 prompt 脚本）

**改：**

- `ToolCommand` / `NativeToolDefinition` 增加可选：

  ```ts
  promptSection?: { order: number; text: string | ((ctx: { tier?: string }) => string) };
  ```

- `registerNativeDomain` 写入旁路表 `toolPromptSections: Map<name, section>`（与 registry 同生命周期；测试 reset 一起清）。
- `contextHooks` 的 `tool-guide`：拼 `VisibleSet` 内工具的 section，按 order。**不再**从 `promptBuilder.WEB_TOOL_GUIDE` 灌一整段。`WEB_TOOL_GUIDE` 删除；平台登录铁律迁到 `platform_login` / `browser_login_status` / `read_article` 各自的 section（避免「改工具忘改 guide」）。
- `promptRuntimeContext.ts` 内建提供者：
  - `workspace`：当前 Workspace.path / id
  - `fs-policy`：一句话（uploads 可写、content/posts 走 post_*、data 只读）——从 `writePolicy` 读，不手写第二份
  - `login`：`listPlatformLoginStatus()` 的短摘要（已登录平台名，不含 cookie）
  - `budget`：日预算剩余（已有 `llmBudget`）
- 快照块格式（固定，测它）：

  ```
  <!-- kp-runtime-context -->
  Current runtime context. This snapshot supersedes earlier runtime-context snapshots.

  workspace: ...
  fs-policy: ...
  login: zhihu, bilibili
  budget: ...
  <!-- /kp-runtime-context -->
  ```

  每轮：若 messages 里已有该标记块，**替换**；没有则 prepend 到最后一条 user 之前（复用 `applyPrependUserContext`）。

- `round===1` 限制：**只**留给 memory / identity。runtime-snapshot **每轮**。

**必须先写的负向测试：**

1. 同名 section 覆盖 warn（与 hook 一致）。
2. 第二轮 LLM 前 login 状态变了 → messages 里只有 **一块** runtime-context，内容是新的。
3. 工具未在 VisibleSet → 其 promptSection 不出现。
4. `contextHooks.equivalence` fixture 更新（允许变，但要重新生成并审 diff）。
5. 不再存在 `WEB_TOOL_GUIDE` 字符串常量（grep 零命中）。

**产品可见：** 登录/workspace 变化下一轮就进上下文，不用改 Agent.md、不用跑一次性脚本。

---

### WP6 — 写策略单一 resolve（用户可感知：少，但是行为更一致）

**改：**

- 把 `resolveAgentFsPath` 从 `fs.ts` 挪到 `writePolicy.ts`（`fs.ts` 再 import，禁止复制一份）。
- `shell.ts` / `web.ts` 下载落盘 / `save_webpage` 若有自己的路径 if，改为调 `resolveAgentFsPath` 或 `assertWriteAllowed`。
- runtime-context 的 `fs-policy` 文案从同一函数的 `describePolicy()` 生成。

**不做：** DSH 三档 session mode（read-only / workspace-write / danger）。见 Q8。若你选「要三档」，本 WP 扩 `SandboxMode` + session 级覆盖 + 审批旋钮；默认推荐不做。

**测试：** `nativeTools` / `toolRollback` 路径用例仍走 Workspace；新增「shell 不能写 content/posts」若今天能绕则本 WP 必须红后绿。

---

### WP7 — 模型可见契约 fail-loud（配置配错立刻炸）

**改：**

- VisibleSet 输入里出现 **未注册** 的 `native:foo`：
  - 按 Q9：启动 sync / `resolveAgent` 时收集 `drift`；组装 schema 时 **throw** 或 **dev throw / prod warn**。
- `inheritMask` 点名未知工具：spawn 返回结构化错误给 LLM，不静默忽略。
- `promptSection` 的 `{{var}}`：**不做** DSH 那种全 prompt 插值引擎。见微不用 `{{variable}}` 拼 system（Agent 正文是 Markdown）。只在 runtime-context 用函数返回字符串。
- hook 检索失败继续 fail-soft。

**测试：** 配一个不存在的工具名 → 按 Q9 断言。

---

## 5. 必须你拍板的问题

纯基建（空回答 = 同意推荐）：Q2、Q4、Q10、Q11。  
产品/默认行为：Q1、Q3、Q5、Q6、Q7、Q8、Q9。  
**本轮全部按推荐写入，见各题「回答：」。**

---

### Q1. ChatMessage / 时间线里存哪一通道？（产品 · 刷新能看见什么）

**背景：** 今天 `appendToolResultMessages` 在 offload 后把 **瘦卡** 写入 `executedTools`（即落库 toolResults）。F5 后用户看到的是瘦卡，不是 20k 原文（原文在 `data/tool-results`）。WP2 必须定「权威展示」。

| 方案 | 存什么 | 优点 | 缺点 |
|------|--------|------|------|
| **A. 只存 content（推荐）** | 与现在 offload 后一致：气泡/时间线 = LLM 同款瘦卡或截断视图；全文只在磁盘 | 刷新不爆库；和现 offload/TTL 一致；实现量最小 | 管理页/调试要读磁盘才能看全文 |
| B. ChatMessage 存 value 全文 | 库里永远有全文 | 调试爽 | 大文章炸 SQLite；和 offload 设计打架；F5 变慢 |
| C. 双写：content + value 都进 DB | 都有 | 看起来全 | 双倍膨胀；两份会漂，禁止 |

**推荐 A。** 磁盘已经是 value 权威（`toolResultOffload`）。本计划把「没 offload 的小结果」的 value 与 content 相同，存在同一字段即可。

**回答：** A（用户授权：不填按推荐）

---

### Q3. 超时之后还等多久？（产品 · 卡住的体感）

DSH 是「永不抛弃 body」。Playwright 可能再挂 30s。见微今天 race，界面马上报超时，后台可能还在开浏览器。

| 方案 | 行为 | 优点 | 缺点 |
|------|------|------|------|
| **A. 等到 body 自然停（推荐）** | timeout 只 abort signal；pipeline 等 handler finally | 无幽灵写入；rollback 诚实 | 最坏等待 = 工具自己的硬超时（Playwright 默认可能很长） |
| B. abort 后再等 `graceMs`（如 10s），然后返回 TIMEOUT，body 标 orphan 继续跑 | 界面有上限 | 体感可控 | orphan 仍可能写文件；要记 warn + 不 rollback 进行中项 |
| C. 保持 Promise.race | 现状 | 零改动 | **本计划的 P0 反面，不推荐** |

**推荐 A**，并给 Playwright/shell **必须**在 signal 上关浏览器/杀进程，这样 A 的等待通常 < 2s。若某工具不听 signal，WP3 验收失败，修工具，不改回 race。

**回答：** A（用户授权：不填按推荐）

---

### Q5. `CHILD_OWN_TOOLS` 默认集合？（产品 · 子 Agent 永远拿得到什么）

**推荐集合（写进 `packages/shared/src/constants.ts`）：**

```
agent_report_back
agent_notify_parent
todo_write
todo_read
ask_user          # 子被问住要能问人；若你认为子不该问人，从集合去掉
```

不要放：`spawn_subagent`、`agent_create*`、`memory_create`（子默认本就不该有）。

| 方案 | 说明 |
|------|------|
| **A. 上表（推荐）** | 回传+过程通知+todo；隔离铁律机械成立 |
| B. 只有 `agent_report_back` | 最硬；子不能 notify、不能 todo |
| C. 上表 + `ask_user` 拿掉 | 子卡住只能干等或乱猜 |

父在 mask.deny 里写 own 工具时：

| 子选项 | 说明 |
|--------|------|
| **A1. 忽略 deny 并 warn（推荐）** | 回传不断；LLM 乱写 mask 不致命 |
| A2. spawn 直接失败 | 配错立刻发现；父体验硬 |

**推荐 A + A1。**

**回答：** A + A1（用户授权：不填按推荐）

---

### Q6. `inheritMask` 的 allow / deny 能否同时传？

| 方案 | 说明 |
|------|------|
| **A. 互斥，同时传则 spawn 结构化错误（推荐）** | 不会出现「allow∩¬deny」心智负担 |
| B. 先 allow 再 deny（交集） | 灵活；LLM 容易配出空集把孩子废了（own 仍在） |

**推荐 A。**

**回答：** A（用户授权：不填按推荐）

---

### Q7. mask / own 存在哪？（产品+同步）

| 方案 | 落点 | 优点 | 缺点 |
|------|------|------|------|
| **A. Agent Markdown frontmatter（推荐）** | `toolInheritMask` / `toolOwn` YAML，sync 进 DB（Agent 表加 JSON 列或塞进现有 heartbeat/json 旁路——**不要**塞进 tools 字符串） | 与「Markdown 是事实源」一致；可 Git 看 diff | 要 `db:push` + syncer |
| B. 只放 DB，不写文件 | 实现快 | 刷新丢？不，DB 在；但和 Agent 文件双轨，违反事实源 |
| C. 编码进 `tools` 数组伪语法（`mask:allow:read_file`） | 零 schema | 恶心；解析必出兼容债 |

**推荐 A。** schema：`Agent.toolInheritMask Json?` + `Agent.toolOwn Json?`（或一个 `Agent.toolPolicy Json`）。sync-agents 读写 frontmatter。一次性：旧行 null = 无 mask、own=默认 CHILD_OWN。

**回答：** A（用户授权：不填按推荐）

---

### Q8. 要不要 DSH 式会话权限三档？（产品）

`read-only` / `workspace-write` / `danger-full-access` + `/permission`。

| 方案 | 说明 |
|------|------|
| **A. 不要（推荐）** | 见微是知识花园不是编码 IDE；已有 Workspace 隔离 + 破坏性审批。WP6 只做单一 resolve |
| B. 要，session 级覆盖，写 ChatSession 字段 + 推 `session_list_changed` | 能做「这轮只读」；要 UI、要审批旋钮、要 runtime-context 叙述 |
| C. 只要只读会话，不要 danger | 折中；仍要 UI |

**推荐 A。** 若选 B/C，WP6 扩大，且必须推拉结合，禁止「改了库刷新才看到」。

**回答：** A（用户授权：不填按推荐）

---

### Q9. Agent.tools 写了不存在的 `native:foo` 时？（产品 · 配错怎么暴露）

| 方案 | 何时炸 | 优点 | 缺点 |
|------|--------|------|------|
| **A. resolveAgent / 起流时 throw，该 Agent 不能跑（推荐偏严）** | 第一次要跑就失败 | 配错不假跑 | 老 Agent 文件有垃圾名会突然不能聊 |
| B. schema 组装 warn，忽略未知名 | 现状偏这个 | 老数据不炸 | 假绿 |
| C. `/agents` drift 横幅 + 仍可跑（忽略未知） | 已有 drift 通道 | 和 assistant drift 一致 | 用户可能不看横幅 |

**推荐 C 对存量、A 对 WP4 新写的 mask 未知名。** 即：`Agent.tools` 未知名 → drift（不拦跑）；`inheritMask` 未知名 → spawn 失败。两条都要测。

**回答：** C（存量 `Agent.tools` 未知名 → drift 不拦跑）+ A（WP4 新写的 `inheritMask` 未知名 → spawn 失败）。用户授权：不填按推荐。

---

### Q2. Pipeline 用函数链还是自研事件总线？（基建 · 空=同意）

| 方案 | 说明 |
|------|------|
| **A. 固定 stage 函数 + observer 数组（推荐）** | 顺序写死在代码；observer 只读；可测 |
| B. 自研 waterfall（next()） | 更像 DSH；审批/策略可插；**容易被用来把审批塞回 pipeline** |
| C. 真 Cordis | 红线 |

**推荐 A。**

**回答：** A（用户授权：不填按推荐）

---

### Q4. handler 返回值迁移策略？（基建 · 空=同意）

| 方案 | 说明 |
|------|------|
| **A. 包装识别信封，否则 raw→value（推荐）** | 一 PR 改完调用方类型；50 个 handler 不用一天改完返回值 |
| B. 所有 handler 签名改成 `Promise<ToolEnvelope>` | 纯净；diff 巨大、易漏 |

**推荐 A。** 四个长文工具在 WP2 改成显式信封+render。其余维持 raw。

**回答：** A（用户授权：不填按推荐）

---

### Q10. `signal` 何时变成 NativeToolContext 必填？（基建 · 空=同意）

| 方案 | 说明 |
|------|------|
| **A. WP3 一次必填，测试全改（推荐）** | 禁止 optional 双轨 |
| B. 先 optional 两周 | 违反「禁止向后兼容」 |

**推荐 A。**

**回答：** A（用户授权：不填按推荐）

---

### Q11. schema 硬顶剥离 vs VisibleSet 的次序？（基建 · 空=同意）

今天 `buildAgentToolSchemas` 超 硬顶会剥 integration/skill/mcp。

| 方案 | 说明 |
|------|------|
| **A. 先 VisibleSet，再硬顶剥离（推荐）** | 剥离的是「已经可见的」；execute 必须用 **剥离后的同一 registry**（现状已 `registry.delete`） |
| B. 硬顶失败改 throw，不再静默剥 | 更 fail-loud；大 Agent 可能突然不能跑 |

**推荐 A**，保持现硬顶行为，但加测试：被剥掉的工具 execute 必须 `NOT_VISIBLE`，不能出现「schema 无、execute 通」。

**回答：** A（用户授权：不填按推荐）

---

### Q12. 施工顺序与是否一次做完？（产品节奏）

| 方案 | 说明 |
|------|------|
| **A. WP0→WP3 一批（核心三不变量），WP4–7 第二批（推荐）** | 第一批就能感觉到：对齐、长文、超时不再鬼写。第二批是 Swarm/prompt 产品能力 |
| B. 七个 WP 一个 PR | 不可审 |
| C. 只做 WP1+WP2，WP3 延后 | 超时幽灵写入继续存在 |

**推荐 A。** 你若要「一次上齐真功能」，选 A 但两批都做完再宣布完成；不要停在「只加了类型」。

**回答：** A（用户授权：不填按推荐）。两批都做完再宣布完成；本文件仍只是规格，未点头前不改业务代码。

---

## 5.1 已确认裁决总表

| 题 | 裁决 | 含义（施工按此，禁止再问） |
|----|------|---------------------------|
| Q1 | **A** | ChatMessage / 时间线只存 content；value 全文只在磁盘（`toolResultOffload`） |
| Q2 | **A** | 固定 stage 函数 + 只读 observer；禁止 waterfall / Cordis |
| Q3 | **A** | timeout 只 abort signal，pipeline 等 body 停；不听 signal 的工具修工具，不改回 race |
| Q4 | **A** | handler 可返回 raw，包装识别信封；四长文工具 WP2 显式信封+render |
| Q5 | **A + A1** | `CHILD_OWN_TOOLS` = report_back / notify_parent / todo_write / todo_read / ask_user；父 deny own 工具则忽略并 warn |
| Q6 | **A** | allow / deny 互斥，同时传则 spawn 结构化错误 |
| Q7 | **A** | mask / own 写 Agent Markdown frontmatter，sync 进 `Agent.toolInheritMask` / `Agent.toolOwn`（或一列 `toolPolicy`） |
| Q8 | **A** | 不要 DSH 三档会话权限；WP6 只做单一 resolve |
| Q9 | **C + A** | 存量 `Agent.tools` 未知名 → drift 横幅、仍可跑；WP4 `inheritMask` 未知名 → spawn 失败 |
| Q10 | **A** | WP3 一次把 `signal` 做成 `NativeToolContext` 必填 |
| Q11 | **A** | 先 VisibleSet，再 schema 硬顶剥离；被剥工具 execute 必须 `NOT_VISIBLE` |
| Q12 | **A** | 先 WP0–3，再 WP4–7；两批都做完才算完成 |

---

## 6. 文件级改动清单（按 WP）

### WP0–1

- 新：`infra/tools/visibleSet.ts`、`visibleSet.test.ts`、`toolEnvelope.ts`、`toolEnvelope.test.ts`
- 改：`agentTools.ts`、`nativeTools.ts`、`loop/setup.ts`、`loop/reactLoop.ts`、`swarmPermissionGuard.ts`（注释+导出关系）、`tools/native/session.ts`
- 测：`agentTools.test.ts`、`nativeTools.test.ts`、`superiorQueueDrain.test.ts`（子工具清单回归）

### WP2

- 改：`loop/reactLoop.ts`（`appendToolResultMessages`、删除 loop 内 truncate 或降为只测 content 长度）、`toolResultOffload.ts`、`asyncToolDeliveryFormat.ts`
- 改：`web.ts` / `fs.ts` 四个长文工具的 render
- 测：新 `toolEnvelopeLoop.test.ts`；`toolResultOffload.test.ts`；`compactDataLeakage.test.ts`

### WP3

- 新：`cooperativeAbort.ts` + test
- 改：`agentTools.ts`（删 withToolTimeout）、`native/types.ts`（signal 必填）、`createAgentToolContext`、所有 `createAgentToolContext` 测试夹具、`web.ts`/`shell.ts`/`session.ts`/`swarm.ts` 听 signal
- 测：新 cooperative 单测；`nativeTools` 超时文案

### WP4

- schema：`packages/shared/src/schemas.ts` Agent + spawn
- prisma：`Agent` 两 JSON 列（或一列 `toolPolicy`）
- sync：`scripts/sync/sync-agents.ts`
- 改：`session.ts` spawn、`swarm.ts` inspect、`constants.ts` `CHILD_OWN_TOOLS`
- 测：`nativeTools` spawn 用例；新 `visibleSet.childOwn.test.ts`

### WP5

- 新：`promptRuntimeContext.ts` + test
- 改：`contextHooks.ts`、`promptBuilder.ts`（删 WEB_TOOL_GUIDE）、各工具 def 加 `promptSection`（至少：platform_login、browser_login_status、read_article、write_file、agent_report_back）
- 测：`contextHooks.test.ts` + 更新 `contextHooks.equivalence.json`

### WP6–7

- 新：`writePolicy.ts`（从 fs.ts 搬）
- 改：fs/shell/web 落盘点、`resolveAgent` drift、spawn 未知 mask
- 测：路径穿越、未知工具名

**文档（同批）：** `design-decisions.md` 文末加「DSH 三不变量」已确认表；`concurrency.md` 补「工具取消等停」；`AGENTS.md` 给助手导航加一行指向本文。

---

## 7. 验收标准（没有「感觉模块化了」这种项）

### 功能（人手或 E2E）

1. 开一个 **sub** Agent，tools 里误写 `spawn_subagent` → 模型 schema **没有**该工具；若模型硬调，返回 `NOT_VISIBLE` 结构化 JSON，不是 tier 中文长句撞车。
2. 父 spawn 子，`inheritMask.allow=["read_file"]` → 子只能读文件 + own 回传；子 `report_back` 父气泡照出（推拉、F5 都在）。
3. `read_article` 长文：第一轮 LLM 看到完整元信息 + 截断正文 + nextOffset；`data/tool-results/...json` 有全文；`read_file` 该 path 能读全文。
4. 故意让 `browser_screenshot` 超时：界面 TIMEOUT；进程侧浏览器被关（无残留 playwright）；rollback 不把进行中项当「没发生」。
5. 登录态变化后 **同一 session 第二轮** 无需改 Agent.md，runtime-context 块已换成新登录列表。
6. 开着 `/chat` 另一标签：spawn 子、report_back，侧栏数量与气泡自己动（现有 invalidate + SSE，WP4 不得拆掉）。

### 工程

- `pnpm --filter @knowpilot/server lint` + `test` 全绿
- 每个 WP 至少 1 个「旧实现必红」的负向测试
- grep：`Promise.race` 不再用于工具 body；`WEB_TOOL_GUIDE` 零命中；`parsed.native = DEFAULT_SUBAGENT_TOOLS` 零命中
- 无 `void promise`；无「刷新一下」文案

---

## 8. 风险与回滚

| 风险 | 缓解 |
|------|------|
| 老 Agent.tools 含垃圾名，Q9 选 A 会不能聊 | 推荐 C；或开工前扫 DB/文件列未知名 |
| Playwright 不听 abort，A 等待变长 | WP3 验收绑 close；不听就不合 |
| VisibleSet 把子工具收太死，子不会干活 | own 集合 + 模板 DEFAULT_SUBAGENT_TOOLS 仍是 inherited 默认；mask 是 opt-in |
| equivalence fixture 大 diff | WP5 单独 commit，人工看 section 文案 |
| ChatMessage 形状变导致前端时间线挂 | Q1 选 A 则形状与现 offload 瘦卡兼容；前端不改也能显示 |
| 审批被误迁进 pipeline | code review 死命令：`assertApprovalOrProceed` 只许出现在 `executeAgentTool` |

回滚：按 WP commit。WP1 回滚 = VisibleSet 委托回旧函数。WP3 回滚最痛（signal 必填），所以 Q10 选 A 就要一次测全。

---

## 9. 和「最小落地」的差别（避免再做成空壳）

本计划每条都有 **用户或模型能察觉的行为**：

- 看不见不该看见的工具  
- 长文不再残 JSON  
- 超时不再后台继续写  
- 父能收窄子、子仍能回报  
- 登录/workspace 下轮自动进上下文  

没有「先加 pipeline 空 stage 以后再挂」这种票。Observer 在 WP1 可以是空数组，但 VisibleSet/信封/等停必须接到现网上。

---

## 10. 下一步

第 5 节已按推荐全部裁决（见 §5.1 总表）。**本文件仍是规格，未再点头前不改 `apps/` / `packages/` 业务代码。**

你说「开工」之后：按 Q12 先 WP0–3，验收绿再 WP4–7。每 WP 负向测试先红后绿；commit 等你点头。
