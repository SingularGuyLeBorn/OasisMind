# 见微测试圣经

> 测试分层、满分定义、内环命令的唯一入口。施工 Goal：`prompts/test-suite-perfect-goal-prompt.md`。  
> **满分不是覆盖率。** Goal 完成 = 提出该 Goal 的验收者按 S1–S10 打出 10/10。施工员不准自评十分。

---

## 满分定义

**打分人只有验收者**（提出本 Goal、当初写「测试写得咋样」的那个人）。施工员不准给自己打分。每项 0 或 1，不准 0.5。证据必须是文件:行或命令退出码。

当初批评的缺口与本表一一对应。W0–W9 只覆盖 S1–S6；**S7–S10 必须做 W10–W13**。W0–W9 单独大约 8 分，不够十分。验收者按「可验证标准」列打分：标准句在仓库里查得到 → 1；查不到或只有口头 → 0。

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

**验收者 S1–S10 全为 1 才是十分，才是本 Goal 完成。** 施工员只填证据与「为何验收者应打 1」；「分」列写待验收。

### 十分不包括（做了也不加分，本 Goal 禁止做）

- 行覆盖率门禁、istanbul/c8 数字、为涨百分比加的无断言测试。
- 把真实 LLM / 真实 OCR 塞进 CI 必跑（S5/S6 的十分来自**诚实**，不是来自 live 绿）。
- 取消 db 项目的 `singleFork`（文件锁是正确性约束）。S10 只许给 **不碰 prisma** 的 pure 项目开 threads。
- 重写 Chat 三层 store、重写 mock-llm、新 npm 依赖、新状态机。
- QQ / 微信 / Telegram / 语音四入口 / Ollama 真连 / 多实例 的新测。
- 把所有 `admin-pages.spec.ts` heading 冒烟升级成交互。heading 冒烟**保留**，它测的是路由没 500，不是过程覆盖。
- 为「看起来对称」发明不存在的产品行为再写测。

---

## 四层

- 契约单测：reducer / Service / 纯函数 / PRD 状态表。CI 必跑。
- mock E2E：Playwright + MOCK_LLM，断言过程（气泡、队列、审批续跑、禁止 F5）。CI `test:e2e:mock`。
- mock evals：`pnpm test:evals` 只验证 mock-llm **场景命中与工具名约束**，不是模型质量。
- 真 LLM：`*-real.spec.ts` 与 `pnpm test:bench -- --live` 为人工/有 key 周跑，**默认 CI 不计 covered**。

---

## 内环命令

- `pnpm --filter @oasismind/web test -- chatStore`
- `pnpm --filter @oasismind/server test -- <文件名>`
- `pnpm --filter @oasismind/server exec vitest run --project pure`（待 W12 落地；落地前此命令尚不存在）
- 全量 server 的 **db 项目**是 `singleFork` 故慢，这是正确性不是缺陷。
- `pnpm --filter @oasismind/web test -- scenarioTestMap`
- `pnpm --filter @oasismind/web test:e2e:mock -- <spec 文件名>`（mock Playwright；未改 E2E 生产代码不必 `build:mock`）

---

## 禁止

- spy LLM 管道（`vi.spyOn(llmClient)` / spy `resilientChatCompletion`）。内核用 `enterInProcessMockLlm()`；E2E 走 `MOCK_LLM_URL`。
- 用文件存在冒充 covered（必须有过程 `asserts[]`，heading / `*-real` / 单独 `cases.json` 不够）。
- 工单号当文件名（新文件）。旧纪念碑测例应收成契约表后删除源文件。
- `void promise`（`void refetch` / `void invalidate` / `void mutateAsync` 等）。
- 教用户刷新（交付文案 / 测试名 / 文档禁止「刷新一下就好」）。

---

## 施工期发现的设计错误

| 发现于 W* | 本文原句 | 错误原因 | 正确契约 | 报告是否已记 |
|---|---|---|---|---|
| W3 | 「合并保留断言」针对 B4 resume 再入池 | 与 AGENTS.md「服务重启不自动续跑」冲突；生产 `recoverStaleAsyncJobs` 已一律标 failed、不入池 | 断言「标 failed、零 runAgentLoop / 零入池」；二次 recover 幂等。B4 第二 it 锁的是僵尸会话 interrupted 顺序，保留 | 是 |

---

## 场景 map 字段

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

评级规则（由 `scenarioTestMap.test.ts` 锁死）：

1. 每条 scenario 的 `coverage` ∈ `covered|partial|gap`。
2. `gap`：允许 `asserts` 为空；`note` 必须非空且说明为什么没测。
3. `partial`：`asserts.length >= 1`；允许过程覆盖不完整。
4. `covered` 必须同时：
   - `asserts.filter(a => a.layer !== "e2e-real").length >= 1`
   - 至少一条「计分断言」的 `claim` **不匹配** `/^(页面|heading|应正常渲染|正常渲染)/`
   - 该条 `claim` 长度 ≥ 8 个汉字或含「无需 F5」/「气泡」/「队列」/「落库」/「禁止」/「幂等」/「续跑」/「空态」/「芯片」之一
5. 每个 `asserts[].it`：对应文件文本必须 `includes(assert.it)`。
6. `layer: eval-mock` 的 file 必须在 `evals/golden/` 或 `evals/harness-bench/cases.json` 或 `packages/mock-llm-core/**`。单独一条 eval-mock 不足以 covered。
7. `layer: e2e-real` 完全不计入 covered/partial 的条数门槛。

---

## 产品面补测（不强制塞进无关 scenario id）

W6/W10 新增的过程 E2E，若 `scenarios.md` 没有对应标题，**不准改 scenarios.md**，只在本表登记：

| 产品面 | 测例 | 过程 claim | 是否进 map |
|---|---|---|---|
| 文件柜收件提示 | `apps/web/e2e/files-accept-hint-mock.spec.ts` | 可见 `files-accept-hint`，文案含 pdf 与 docx | 否（场景 8 是写文章；见场景 8 note） |
| 花园列表/空态 | `apps/web/e2e/gardens-list-mock.spec.ts` | 至少一张花园卡片可点，或空态 `gardens-empty` | 仅当 claim 真是花园阅读时挂场景 11/13；列表页只登记本表 |
| 主题切换 | `apps/web/e2e/theme-toggle-mock.spec.ts` | 已有过程；挂本表，不强塞无关 scenario | 本表 |

---

## 旧称对照

| 旧测试路径 | 现契约表 / 文件 |
|---|---|
| `asyncDeliveryQueueB1.test.ts` … `B7`（无 B6） | `asyncDeliveryReconciler.table.test.ts`（R-exempt / R-soft-claim / R-wait-outside-pool / R-restart-failed / R-depth-server / R-queue-unique） |
| `heartbeatSchedulerC1.test.ts` `heartbeatRefreshC2.test.ts` `heartbeatCounterC4.test.ts` | `heartbeatEngine.table.test.ts` |
| `reentrantResume.test.ts` | 不重复的 it 在 `startupRecovery.test.ts`；文件已删 |
| `cClassRemainingAbort.test.ts` | `nativeToolAbortSignal.test.ts` |
| `safePathWriteD7.test.ts` | `safePathWrite.test.ts` |

---
