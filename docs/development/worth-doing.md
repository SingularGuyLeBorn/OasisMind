# 见微还缺什么、值得做什么

> 写于 **2026-08-29**。对照仓库现状（代码 + 场景表 + 规划文），不是再抄一份过期综述。  
> 已落地能力见 `CHANGELOG.md`、`design-decisions.md`。本文件只谈**还没成为你会每天用的东西**，以及明确不做的。  
> 薄索引仍在 [`future-features.md`](./future-features.md)。  
> **交给别人施工**：把 [`prompts/worth-doing-goal-prompt.md`](./prompts/worth-doing-goal-prompt.md) 从「# 目标」贴进见微 Goal；设计已锁死，执行者只准按条做，疑惑写 `[OM-FREEPLAY]` 和 `worth-doing-goal-report.md`。

---

## 0. 怎么读

**引擎已经偏厚。** Chat 状态机、同会话分叉、Swarm 层级、审批、Cron、Goal 审计、记忆常驻层、Inbox 管道、MockLLM E2E——这些大多已经能跑。再叠一层 Agent 框架，性价比很低。

**产品承诺还薄。** README 开篇是：收藏散落各处 → Agent 替你收 → 提醒昨晚没看 → 蒸馏成自己的品味。这一圈里，「收」有管道、「蒸馏」还是粘贴成文、「提醒」没有和 Inbox/`/daily` 焊死。

扫描过的材料（多轮，不是只看 `future-features.md`）：

| 轮 | 看了什么 | 主要发现 |
|---|---|---|
| 1 | `future-features.md`、场景全表 52 条 | 正式「未做」列表很短；QQ/语音/`/files` 是**无测**不是无功能 |
| 2 | `design-decisions.md` 不做/另立、`experiments.md` | 多实例/热更新/向量库已否；实验表到期日全过仍标 active |
| 3 | `memory-research-plan.md`、2026 综述对比 | 综述 **2026-07-12 已过时**：`memory_update`、工具上限、USER.md、retrieve-or-not、`todo_write` 后来都做了 |
| 4 | `oasis-improvements-2026-08-harness-wave.md` | IntentContract / `verifiedProgress` **已落地**；缺的是过夜 Goal 你真用、`envAssertions`、经验 admit 门 |
| 5 | Inbox PRD、`inboxService.distill`、`/platform-sync`、`/daily` | 同步页有；蒸馏**不改写**；每日看板是手写 Kanban，不是「昨晚没看」 |
| 6 | 通道、语音、文件、Chat 脸 | Telegram 桩；书签按钮未接线；贴图不默认识图；Chat 不收 mp4（有意） |
| 7 | 长任务 / RSI / 压缩笔记 | 阶段工件工具在，无模板习惯；Dreaming 未做；压缩六小节 checkpoint 未做 |
| 8 | 页面清单、v0.1 后续方向 | `/office` 展示向；PWA/移动端已有底座；多用户/PG 仍是理念不做 |

**读规划时先假设它过时，再 grep 代码。** 最常骗人的三份：`docs/surveys-2026/对比分析-*.md`（7 月）、`session-tree-study-2026-07.md`（当时还没 `parentId` 树）、`future-features.md` 里「SOP 待做」（工具已在 `swarmStages.ts`）。

---

## 1. 一句话

缺的不是「再做一个 Agent 运行时」，而是把已经存在的管子接到**人每天会打开的脸上**：Inbox 真进来、蒸馏像你写的、早上有一条提醒、贴图能看、过夜 Goal 进度可核。

---

## 2. 建议优先做（按对「数字主力」的 ROI）

### A. 本周就能摸到的完整度（小、闭口）

这些不是新能力，是**已经写了一半、人摸不到或摸了会错觉没做**。

| 项 | 现状 | 做成什么样算完 | 不做什么 |
|---|---|---|---|
| Chat 书签接到 UI | `message.setLabel` 与树测都有；`chatMessageBits` 的 `showBookmark` **默认 false，列表从未传入** | 气泡能钉/取消；树条或侧栏能跳到锚点；换叶不丢；PUSH `message_upserted` | 不要做成浏览器书签同步 |
| 贴图默认识图 | `vision_describe` / `read_image` 在；Chat 附件只收图；模型要自己想起来调工具 | 有图的用户消息：多模态模型直走 vision；纯文本模型自动外挂 `vision_describe`，失败红且可重试 | 不要默认把每张图 OCR 进知识库 |
| `/files` 诚实 | 只收 `image/*,.pdf,.zip,.txt`；场景表写明无 docx/xlsx | 文案与 `accept` 一致；文章里的 docx 走已有 `document_to_markdown` / 编辑器导入，不要假装资源柜是网盘 | 不要在 Chat 附件槽放开任意二进制 |
| 实验表收尸 | `experiments.md` 到期日 8 月初–中，状态仍 active | 已验收标 done，到期未绿标 freeze | 不要靠这张表当路线图 |

### B. 产品闭环：收集 → 提醒 → 蒸馏（最高杠杆）

这是 README 存在的理由，也是现在最空的一圈。

| 项 | 现状 | 做成什么样算完 |
|---|---|---|
| **Inbox 真同步进队** | `/platform-sync`、知乎/小红书/B 站/微信/截图管道、cookie/`platform_login` 都有。实验验收「收藏 ≥1 条可蒸馏」未收口。真机依赖登录态，场景 A/S23/S25 仍弱 | 你常用的 **1～2 个平台** 能稳定增量进 Inbox；失败说人话（未登录 / 风控 / 空列表）；开着 Inbox 页自己变（已有 `inbox_updated`） |
| **蒸馏有品味** | `inbox.distill` = `formatInboxItemBody` + `post_create`，**PRD 写明已放弃 LLM 改写** | 勾选蒸馏可选用「按 USER.md / 花园文风改写再落草稿」；保留原文链接；失败不标 distilled；幂等仍在 |
| **早上那一条** | Cron、心跳、`/daily` Kanban **三套并列**。没有「把 Inbox 未消化 + 未完成 Daily + 晾着的 Goal」合成一条晨间简报 | 一条 cron 或心跳：列出没看/没做；点开能跳 Inbox 或会话；重启不偷跑两遍（已有铁律） |
| **过夜 Goal 你敢开** | `verifiedProgress` + Auditor + 自评不准 done **已有**；场景 D 仍弱；无 `envAssertions` | 今晚设 Goal，明早栏上有已核实步数；审计失败状态不前进；管理页 `/runs` 自己动 |

不要优先：再接一个抓取平台（抖音/微博）——现有平台都没养成习惯时，平台数量是负债。

### C. 长任务可信（有底座，缺习惯与门）

| 项 | 现状 | 值得做的最小切口 |
|---|---|---|
| 阶段工件变成剧本 | `swarmStages` 写 `.oasismind/stages/{stage}.md`；父读工件不读子正文 | **1～2 个模板**（专题深挖：research→draft；Inbox 成稿：notes→draft→review）。管理页或 Chat 能看见当前 stage 文件，不是只靠工具名 |
| Goal `envAssertions` | 精读文写了，代码里 **没有** 这个字段 | 可选：文件存在 / `post` 已发布 / 测试 exit 0。没有断言就维持现状，不要为了论文字段空转 |
| 经验 / Skill 晋升要证据 | curator、heartbeat、`accumulateExperience` 有；Argus 式「无证据不入 global」未硬拦 | 升 workspace/global 记忆、晋升 Skill 必须带 evidenceRefs 或用户点头 |
| 自动改 prompt/Skill 的回退 | RSIBench：有反馈就改，78% 最终更差 | 改 `config/agents` 或 Skill 前快照；连续失败禁止加大变更幅度 |

**不必做：** ToT/搜索式规划、LangGraph 条件边、交班 handoff≠spawn（已否）、DSPy/GEPA `evolve_skill`。

### D. 记忆：读得更准，而不是再加一层库

常驻层、日记、flush、micro-compact、`memory_update`、写入侧 ADD/UPDATE/NOOP、retrieve-or-not、query rewrite、衰减——**大都已有**。还缺的是「像人一样少而准」。

| 项 | 现状 | 值得做 |
|---|---|---|
| Side LLM 选 ≤5 | S6 自评：去重 + 过时提示有；**选择器未做** | compact/注入前用便宜模型从候选里挑，而不是固定 5×300 字 |
| Dreaming 晋升 | 日记层只 search 不注入；无后台把日记炼进 USER.md | 心跳任务：审日记 → 提议晋升 → 你点头再写 L1。禁止静默改 USER.md |
| 记忆效用基准 | 轨迹 JSONL / harness-bench 有底座；「开/关记忆 A/B」未做成平台任务 | MockLLM 下 3～5 个「必须用到昨天记过的偏好」的金任务 |

**明确不做：** 会话向量库、Mem0/Honcho 外挂、参数化记忆（已否）。

### E. 通道与语音（按你是否真用手机）

功能大多在，**场景表标「基本无测」**。没在用就不要当主线施工。

| 项 | 现状 | 若你在用，最小值得做 |
|---|---|---|
| QQ 入站/出站 | 官方 Bot + webhook；图/文件/语音工具有 | 真机一条：开着 Chat 来文有角标、回复纯文本到手机、失败红 |
| 微信 | `weixinIlink` / Claw 通道在；企微智能机器人已删 | 只打你实际用的那条（iLink 或 Claw），不要两条平行「都半残」 |
| 听写 / 语音对话 / 朗读 | 浏览器 SpeechRecognition + speechSynthesis；QQ 出站 CosyVoice | 听写不自动发送（S32a）；对话可打断朗读。无头 CI 锁不住，用真机清单 |
| Telegram | `messageGateway` **明确尚未实现** | 需要再用；不需要就保持桩 |
| 视频笔记 | `video_transcript`（有字幕）+ `media_download` + 本地 Whisper | 依赖 yt-dlp/ffmpeg/faster-whisper；本机装齐再当主路径，不要在无依赖机器上装绿 |

Chat **不收 mp4** 是产品选择（S34），链接走视频工具。不要为「附件槽也能丢视频」拆状态机。

### F. 本地模型与成本（按需）

| 项 | 现状 | 何时值得做 |
|---|---|---|
| Ollama / llama.cpp | README 写了；实验到期未收；真机场景弱 | 你要断网或 side 任务（flush/压缩/审计）走本地时再锁「选 ollama/x 能一轮、连不上说人话」 |
| `llm.roleSplit` | 规划轮贵、执行轮便宜，**默认关** | 账单疼再开；不要默认改所有 Agent |
| 流式路上 reflection | sync 链路可开，`agentStream` **未接**；`reflection.enabled` 默认 false | 保持关。接上要单独评估 critic 插在 done 前的 token 与时序，不是补丁 |

### G. 测试与可发现性（不是新功能，但是债）

场景全表（2026-08-28 口径）大约：9 严酷 / 18 有钉 / 15 弱 / 10 基本无测。Chat 停止、队列、提问卡、对话分支 MockLLM 已经偏严。剩下的弱项按「你会不会用」排：

- 仍弱、但和主线相关：双标签同一会话、重新生成/编辑删尾、图片附件 OCR 脸、切 Agent/Workspace、过夜 Goal、Inbox 晨间旅程。
- 基本无测、可继续拖：QQ 全家桶、语音四入口、`/files`、Chat 无视频槽（有意）。

Mock 平台记忆基准、协作任务「Swarm 是否更值」——有评测基建（`test:bench` 已进 CI），缺的是**任务本身**，不是再写一个 runner。

### H. 工程卫生（触到再顺手，不要单独立项）

| 项 | 说明 |
|---|---|
| fs/web/shell 工具参数仍手写 JSON schema | 其它域已 Zod；下次改这三域时统一 |
| Redis `startWorker` 未挂启动序列 | 注释写明会吞消息；单用户 local 够用 |
| 工具 rollback 大量「未实现自动回滚」 | 诚实即可，不要假装能撤销 `run_shell` |
| `config.yaml` 热更新 | **明确不做**（飞行中 run + 心跳语义） |
| 超级 Agent 移交 | 禁止自降 tier；显式移交流程本期可不做 |
| algo-viz 终渲自动 commit 回仓 | Actions Artifact 已有；自动入库是锦上添花 |

---

## 3. 已有底座、差最后一公里（别再当「没做」)

核对代码后再写规划，避免重复开工：

| 看起来像缺口 | 实际 |
|---|---|
| 会话分支 / time-travel | 同会话 `parentId` + `activeLeafId` + `switchBranch` **已有**；不是 `session.fork`。重生成仍是删尾重跑，不是叠版本条 |
| USER.md / AGENT.md | `pinnedMemory.ts` + 硬预算 + 会话冻结 |
| retrieve-or-not | `memoryRetrieveGate.ts` |
| `memory_update` / 矛盾链 | `memoryRepository` 软版本 + 写入门 ADD/UPDATE/NOOP |
| `todo_write` | 会话工具，时间线可展示 |
| `AGENT_MAX_TOOL_CALLS_PER_RUN` | `reactLoop` 强制；默认 60 |
| 阶段工件 SOP | 工具在；缺模板与 UI |
| Intent 修订/切换 | `intentContract` + Goal 分支；evolving-intent mock 有测 |
| Goal 不准自评完成 | `goalAudit` + `verifiedProgress` |
| MCP Streamable HTTP | 已落地（`future-features` 表） |
| 推拉结合 / 队列持久化 / 移动端底栏 | 已落地 |
| 审批邮件回复 | AgentMail webhook APPROVE/REJECT |
| Responses API | openai/deepseek `httpProtocol=auto` 已走 |

---

## 4. 明确不做 / 缓做

与单用户、本地优先、未发布 1.0 一致。再讨论这些就是换产品。

- 完整多实例：全局池 Redis 化、BullMQ、PostgreSQL、SSE 跨实例亲和  
- 多用户 RBAC、协作共享 Workspace、插件市场、A2A / Agent Card  
- 对等群聊 Swarm、容器级沙箱、参数化记忆、每会话向量 RAG  
- 把 OasisMind 改成「纯控制平面、外包 Codex CLI」  
- `session.spawn` 与 `spawn_subagent` 再统一一层语义  
- 配置热更新、流式 reflection（默认关着就别接）  
- Remotion 短片、Three.js Hero：实验冻结，不挡主线  
- Telegram：保持「尚未实现」直到真有账号需求  

v0.1 文档里的「后续方向」里，**移动端/PWA 已部分过时**（有底栏、Chat 叠层、`pnpm remote`）；多用户/PG/Milvus 仍不当做。

---

## 5. 建议开工顺序（同一主题内）

只排**产品会变好**的，不排「论文对齐」。

1. **贴图识图 + Chat 书签**（闭环小、立刻可感）  
2. **Inbox：你常用平台稳定进队 + 蒸馏可选改写**（数字主力主路径）  
3. **晨间一条：未消化 Inbox + Daily 未完成 + 晾着的 Goal**  
4. **过夜 Goal 人眼走通**（审计步数可见；缺 assertions 再补）  
5. **一个阶段工件剧本**（深挖或 Inbox 成稿）  
6. 若记忆开始吵：side LLM 精选 + Dreaming 需确认  
7. 若你用 QQ/微信：真机一条入站出站，不要先写一堆无头 E2E  

并行可以做、但不要插队：过期实验表、`future-features` 与综述的过时句（本文件已替代）。

---

## 6. 场景覆盖（提醒：无测 ≠ 没做）

摘自 [`scenario-walkthrough.md`](./scenario-walkthrough.md)（2026-08-28）。施工前先看「覆盖档」。

**严酷（别再当缺口）：** 普通对话、同步工具、同步/异步派子、异步纯工具、队列、停止、F5 续传、切会话不洗后台。

**有钉、脸可能还嫩：** 提问卡 F5 条、工具失败三脸、角标、派工条、换模型、Goal 顶栏、审批、cron/tasks/runs、编辑器与划词润稿、相关笔记、写入知识库、Inbox 列表蒸馏、Workspace 写文件。

**弱/假依赖（真环境）：** 双标签、重生成/重试/编辑、视频转笔记、登录读平台、本地压图、短片、晨间/深挖/选区/过夜旅程、切 Agent/空间、图片 OCR。

**基本无测：** QQ 切换与入出站、听写/语音对话/朗读/QQ 语音、Chat 无视频槽、附件只收图、`/files`。

---

## 7. 附录：文档债（改规划时先改这些）

| 文件 | 问题 |
|---|---|
| `future-features.md` | 「SOP 待做」过时；条目过少。以本文件为准 |
| `docs/surveys-2026/对比分析-记忆-Harness-Agent.md` | 仍写 memory_update 缺失、无 USER.md、无 todo；**不要当施工清单** |
| `session-tree-study-2026-07.md` | 对照表还是扁平消息；分支已落地 |
| `experiments.md` | 到期日过了仍 active |
| `memory-research-plan.md` §0 缺口表 | 文首基线过时；§7 进度表较准（S6/S7/S8） |

---

最后更新：2026-08-29。以后只改本文件的表，不要在精读文末再散落「见微该怎么改」。
