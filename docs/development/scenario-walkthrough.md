# 见微场景全表（原子路径）

> 给人眼对照、排障、写测用的**目录**。画布版不要再用；以本文件为准。  
> 逐步字段 / HTTP / SSE / reducer / `data-testid` 见 [`scenario-step-by-step.md`](./scenario-step-by-step.md)。  
> 人坐在屏幕前怎么点见 [`user-interaction-playbook.md`](./user-interaction-playbook.md)。  
> Agent 该调什么工具见 [`scenarios.md`](./scenarios.md)（CI 锁的是那份 1–20 + A–E，不是本表）。

三套编号不要混：

- 剧本 S1–S35 + 旅程 A–D，共 39 行，管人眼验收。
- `scenarios.md` / `scenario-test-map.json`，共 25 条，CI 锁的是 Agent 该调什么工具。
- 本文件 52 条，把剧本里混在一条里的机器拆开（S4a/S4b、S17 三页、语音四入口、文件四管道）。

覆盖档（不是进度粉饰）：

- **严酷**：状态机 / 表测 / 磁带或真钩子钉得住主不变量。
- **有钉**：有测，不等于逐步走完、不等于开着页每条脸都锁死。
- **弱/假依赖**：冒烟、locator、真环境/密钥/浏览器权限，绿了也不能当严酷。
- **基本无测**：契约或 UI 有，自动化几乎没有。

截止 2026-08-28：52 条里约 9 严酷、18 有钉、15 弱、10 基本无测。Chat 停止 / 队列 / 提问卡的测入口已按本轮锁测更新；QQ / 语音 / 双标签仍弱。

---

## 目录

Chat 核心（严酷除非另标）：[S1 普通对话](#s1--普通对话)、[S2 同步工具](#s2--同步工具)、[S3 同步派子](#s3--同步派子-waittrue)、[S4a 异步派子](#s4a--异步派子-waitfalse)、[S4b 异步纯工具](#s4b--异步纯工具-async_task_run)、[S5 连发队列](#s5--流式中连发发送队列)、[S6 停止](#s6--停止生成)、[S7a F5 续传](#s7a--流式中-f5-续传)、[S7b 切会话](#s7b--切会话不洗后台仍-drain)。弱：[S8 双标签](#s8--双标签同一会话)、[S9a 重新生成](#s9a--重新生成)、[S9b 重试](#s9b--重试用户消息)、[S9c 编辑](#s9c--编辑消息)。有钉：[S10 提问卡](#s10--ask_user-提问卡)、[S11 工具失败](#s11--工具失败三脸)、[S12 角标](#s12--角标矩阵)、[S13 派工条](#s13--中栏派工条)、[S14 换模型](#s14--换模型)、[S15 Goal](#s15--goal-顶栏)。

审批与定时（有钉）：[S16 审批](#s16--危险操作审批)、[S17a /cron](#s17a--定时节律-cron)、[S17b Tasks](#s17b--tasks-页)、[S17c Runs](#s17c--runs-页)。

知识库（有钉）：[S18 手写文章](#s18--手写文章)、[S19 划词](#s19--划词解释)、[S20 润稿](#s20--润稿选区改写)、[S21 相关笔记](#s21--文底相关笔记)、[S22 写入知识库](#s22--对话写入知识库)、[S23 Inbox](#s23--inbox-收件箱)。

能力向（弱）：[S24 视频转笔记](#s24--视频转笔记)、[S25 登录读平台](#s25--登录后再读平台)、[S26 本地压图](#s26--本地压图)、[S27 短片](#s27--remotion-短片)。

组合旅程（弱）：[A 晨间简报](#a--旅程-a-晨间简报)、[B 专题深挖](#b--旅程-b-专题深挖)、[C 本地+云+选区](#c--旅程-c-本地云选区)、[D 过夜 Goal](#d--旅程-d-过夜-goal)。

身份通道：弱 [S28 切 Agent](#s28--切换-agent)、[S29 切 Workspace](#s29--切换-workspace)、[S33 图片](#s33--图片附件)；有钉 [S35c 写工作区](#s35c--workspace-写文件)、[S35d 花园走 post](#s35d--花园正文必须走-post)。基本无测：[S30 QQ 助手](#s30--切换-qq-助手)、[S31a 入站](#s31a--qq-入站)、[S31b 出站](#s31b--qq-出站)、[S32a 听写](#s32a--语音听写)、[S32b 语音对话](#s32b--语音对话)、[S32c 朗读](#s32c--点气泡朗读)、[S32d QQ 语音](#s32d--qq-合成语音出站)、[S34 Chat 无视频槽](#s34--视频chat-无附件槽)、[S35a 附件只收图](#s35a--chat-附件只收图)、[S35b /files](#s35b--files-资源柜)。

---

## Chat 核心

### S1 · 普通对话

**覆盖**：严酷。右问左答，无工具、无待发、无角标。

- **你点**：打开 `/chat`，输入「你好」点发送，等说完，F5，再开新对话发一条后点回原会话。
- **你看**：输入框清空，钮变停止，右侧立刻无角标用户气泡；左侧流式长字；结束后钮回发送、定格助手。待发面板不得闪。F5 原文还在。
- **变量**：`LC.phase` idle→streaming→done→idle。`occupied=phase∈{streaming,done}`。`CQ.optimistic` 先出用户气泡，对齐后清。MS 追加 user+assistant。`visibleQueueCount=0`。
- **发出**：enqueue `visibility=dispatching` → drain 认领 SessionQueueItem → EventSource 开流。不另打 tRPC 当发送。
- **回来**：写 user → SSE `message_upserted`。token 同一 EventSource。写 assistant → upsert → `tryCommitStream`。done 事件不是真相。
- **并发**：本会话一流。occupied 时 `beginStream` 被 reducer 拒绝。
- **不变量**：`done→idle` 只经 `commitStream`。禁止教刷新。手打右侧无角标。
- **测试**：`chat-mock.spec.ts`；`chatStoreInvariants` / PBT；`evals/golden` G06（工具选择，不是 UI 状态机）。

### S2 · 同步工具

**覆盖**：严酷。时间线先跑工具；成功绿、失败红；最终答在左。

- **你点**：发「搜索…并一句话介绍」。盯 running。等绿点后看左侧总结。失败路径发坏 URL。然后 F5。
- **你看**：右侧问句。左侧 `tool-pill` running 无绿点。成功绿+hint；失败红无绿。工具 JSON 不成用户气泡。F5 终态不重跑。
- **变量**：整段 ReAct 都在一次 `phase=streaming`。`liveTimeline` status running→done\|error。
- **发出**：同 S1 开流。工具由 LLM `tool_call`，服务端执行后回灌同一轮。
- **回来**：SSE `tool_start` / `tool_result`。长结果落盘 `data/tool-results`。刷新 `buildTimelineFromStored`。
- **并发**：父流不 idle。轻量工具可进 Task 池，那是池并发不是异步投递。
- **不变量**：running 禁绿。失败禁绿。F5 不重打网。无 Async 角标。
- **测试**：`chat-mock`、`chat-tool-hint`；G03。

### S3 · 同步派子 wait=true

**覆盖**：严酷。你愿意干等。父只有工具条+左侧总结，无 Async 投递。

- **你点**：发「派资料员，这次同步等它跑完」。点子 Agent 看卡片。等父总结。点进子会话对照「父 Agent」角标。回父 F5。
- **你看**：`spawn_subagent` 长时间 running。侧栏自己出子卡。父右侧无 Async。
- **变量**：`waitForResult=true`。父 LC 一直 occupied。子空闲后系统抓最后一条 assistant 作 tool return。
- **发出**：父同一条 SSE。spawn 建子会话+`triggerAgentRun`。结果走 tool return 回父 LLM。
- **回来**：`session_tree` PUSH；父 `tool_result`；父最终 upsert。禁止子全文灌进父 MS。
- **并发**：父子各一流。`agentRunLocks` 防同一 Agent 双跑。
- **不变量**：同步 ≠ 异步投递。父无右侧投递气泡。刷新不重派。
- **测试**：`chat-subagent-resume-mock`、`dsh-chat-ui-mock`。

### S4a · 异步派子 wait=false

**覆盖**：严酷。父先短答能继续打字；子 `report_back` 后右侧 Async 角标。

- **你点**：发「派子调研，跑完告诉我」。父短答后再打一句。盯右侧 Async 与第二轮左总结。
- **你看**：spawn 很快 done（派生成功≠调研结束）。发送钮恢复。稍后右侧 Async，再一条左侧总结。F5 角标还在。
- **变量**：`waitForResult=false`。父 commit 后 idle。`async-result` 不由前端 drain。`autoConsume` CLAIM 后再起父流。
- **发出**：工具立刻返回 session/job 元信息。子在池里跑。仅子调用 `agent_report_back`。
- **回来**：投递写入后 `message_upserted` `source=sub`。父再开流。前端只 ACK overlay。
- **并发**：父流与子任务正交。禁止轮询 `async_task_status`。
- **不变量**：子结果唯一通道 `report_back`。父对子只见状态不可见子消息正文。
- **测试**：`spawn-async-mock`；G05。

### S4b · 异步纯工具 async_task_run

**覆盖**：严酷。没有子 Agent。先「已入队」，完成后投递，再一句话报结果。

- **你点**：发「请启动一个后台任务总结当前项目」。看左栏运行。等第二轮助手报结果。
- **你看**：至少两条左侧助手：先已启动，后结果。角标是工具/Async，不是「子 Agent 回报 · 人名」。
- **变量**：Task queued→running→completed。`queuePosition` / `queuedReason`。结果进投递队列不是 tool return。
- **发出**：`async_task_run` 立刻返回。工作进 AsyncJobOrchestrator。
- **回来**：`task_updated`；`autoConsume` 后 upsert + 父续答。
- **并发**：`asyncJobs.maxConcurrent` 与 `maxPerSession`。`queuedReason`: global/session/workspace/gate。
- **不变量**：重启僵尸 running 标 failed，不自动续跑。父不卡到任务跑完。
- **测试**：`async-task-mock`；async-task-queue 单测。

### S5 · 流式中连发（发送队列）

**覆盖**：严酷。占用中再发进可见待发；N 问 N 答；折叠不见正文。

- **你点**：问题 A 发送后钮已是停止。再发 B。点开折叠。再发 C。什么都不点等 drain。点停后 B 仍应发出。
- **你看**：A 不停。「待发消息 N」。折叠无 B 正文、无 B 助手。A 结束后右出 B、左答 B，再 C。空闲直发不闪待发。
- **变量**：`decideEnqueueVisibility`: occupied\|\|draining\|\|len>0 → visible，否则 dispatching。`ENQUEUE_DEDUP_MS=500`。`queueDraining` 串行。abort-pending（`phase=done`）仍 occupied，不得提前 drain。
- **发出**：B/C 写 SessionQueueItem，不 begin 第二路。idle 后 drain 队首才开下一 SSE。
- **回来**：每轮独立 upsert。起流失败 unclaim 回潮，不得蒸发。
- **并发**：队首 superior 前端不准越过。`async-result` 前端不消费。`ABORT(null)` 立即 idle 后 drain；有 partialId 须 upsert 对齐后才 drain。
- **不变量**：问答应条数一致。tombstone 仅起流成功。
- **测试**：`prdChatQueueTable`；磁带 `queue-gt1` / `queue-gt3`（ABORT null）/ `queue-gt3b`（abort-pending）；PBT；`chatQueueDrainLifecycle`（含真钩子窗口）；E2E `chat-queue-mock` / `chat-queue-real`。

### S6 · 停止生成

**覆盖**：严酷。点停就停；半成品「已停止生成」；立刻能再发。

- **你点**：流式中点停止生成。无半成品时也应立刻能发。stop HTTP 非 2xx 也必须能再发。然后 F5。
- **你看**：字不再长。钮回发送。有落库半成品则琥珀色「已停止生成」。F5 不续写成完整论文。
- **变量**：POST stop → `hub.stop(reason=user)`。`finishReason=aborted` 粘性。无 AC 幽灵流立刻 idle。发送钮看 `isStreaming`（仅 `phase===streaming`），abort-pending 时钮已是发送、仍 occupied。
- **发出**：`POST /api/agent/chat/stop`。请求失败也必须 `applyUserStop` 释放占用（`partialId=null`）。
- **回来**：upsert 必须带 `finishReason`。aborted 后禁止 `persistAssistantSuccess`。
- **并发**：停释放占用后队列可 drain。不得事后假装答完。
- **不变量**：同一 id 一旦 aborted 不可被后续 upsert 改成 stop。
- **测试**：`prdChatStopTable`；磁带 `stop-gt1` / `stop-gt3`；`scenario-product-gaps-mock`（点停 + stop HTTP 503）。

### S7a · 流式中 F5 续传

**覆盖**：严酷。刷新不是空白 Thinking；最终结果还在。

- **你点**：长任务还没说完时按 F5。
- **你看**：骨架后同会话：用户气泡在，助手续上或已定格。禁止「再刷新一次」。
- **变量**：PULL `listForChat` + 队列。服务端仍 running 则 resume SSE。`beginStream(resume)` 唯一 claim。
- **发出**：进页水合。resume 不把已完成当新 user 再发一遍。
- **回来**：`message_upserted` 幂等。hub 环缓冲补洞。
- **并发**：`resumeClaimed` 防双 resume。
- **不变量**：刷新=再水合零损失。
- **测试**：`chat-resume-mock`。

### S7b · 切会话不洗、后台仍 drain

**覆盖**：严酷。A 在流，点新对话看 B，再回 A，A 还在长或已定格。

- **你点**：A 流式中点新对话看 B，再点回 A。可在 B 时让 A 队列里的下一条在后台发完。
- **你看**：B 的 begin 不把 A 洗空。回 A 读 store，不是整页闪。
- **变量**：`keepCurrentView=true`。每会话独立 LC/CQ/MS 切片。
- **发出**：后台 drain 用原 session 的 agentId，不改 URL。
- **回来**：切回直接读 MS。
- **并发**：不 abort 被切走的流。
- **不变量**：禁止用 invalidate 整页替换当切回。
- **测试**：`chat-subagent-resume-mock`；`chat-scenario-states` 场景 4 后台消费。

### S8 · 双标签同一会话

**覆盖**：弱/假依赖。标签 B 发送，标签 A 自己出气泡。

- **你点**：两标签开同一 `sessionId`。在 B 发跨标签你好。A 不刷新。
- **你看**：A 右侧同句、左侧助手。无「去刷新另一标签」。
- **变量**：两页各有 store，权威在服务端。
- **发出**：仅 B enqueue+SSE。
- **回来**：A 订同一 hub。`BroadcastChannel` 只是兜底。
- **并发**：服务端仍一流。第二页 begin 应拒。
- **不变量**：BC 不能当唯一通道。
- **测试**：契约有；跨标签 E2E 弱。

### S9a · 重新生成

**覆盖**：弱/假依赖。悬停最后助手点重新生成：旧轮消失，再长一轮新的。

- **你点**：悬停最后一条助手，点重新生成。
- **你看**：该用户问题之后的旧助手及更后轮消失。新流出现。禁止旧+新叠两条。
- **变量**：删尾后当新一轮 enqueue。
- **发出**：tRPC 删锚点之后消息 + `beginStream`。
- **回来**：`message_deleted` + 新轮 upsert。
- **并发**：须 idle 或先停。
- **不变量**：锚点后全没。
- **测试**：按钮找得到；删尾重发 E2E 弱。

### S9b · 重试用户消息

**覆盖**：弱/假依赖。从这条用户气泡重跑，后面的全没。

- **你点**：悬停某条用户气泡点重试。
- **你看**：从这条开始重跑。不会 A 消失、后面 B 却重发。
- **变量**：删该 user 之后全部。
- **发出**：同 S9a，锚点是该 user。
- **回来**：同 S9a。
- **并发**：须 idle 或先停。
- **不变量**：禁止错位重发。
- **测试**：同 S9a。

### S9c · 编辑消息

**覆盖**：弱/假依赖。保存换正文；取消不写库。编辑用户消息按删尾重发。

- **你点**：点编辑，改源码，点保存。另走一次取消。
- **你看**：保存后气泡换新正文。取消回到旧文。
- **变量**：取消零请求。保存走 update；用户消息另走删尾。
- **发出**：`message.update` 或删尾+enqueue。
- **回来**：upsert。
- **并发**：编辑中占用需先处理。
- **不变量**：取消不落库。
- **测试**：同 S9a。

### S10 · ask_user 提问卡

**覆盖**：有钉。输入区上方提问卡；点完变已提交，不能二答。点卡续跑已有 mock E2E；F5 恢复条无独立 E2E。

- **你点**：发「请用提问卡问我选 knowledge 还是 posts」。点编号或自定义提交。
- **你看**：卡：`session-ask-user-bar` / 问题+选项+提交。提交后 `ask-user-resolved`。选项消失。助手续跑。
- **变量**：先登记 waiter 再处理 abort。pending→answered。
- **发出**：工具挂起 ReAct。用户 tRPC 回答。
- **回来**：SSE/元数据出卡。回答后续跑同一轮。
- **并发**：一问一答。回答走卡不是再入队抢答。
- **不变量**：abort 必 settle，Promise 不得挂死。
- **测试**：`prdAskUserTable` / `askUserGate`；`chat-ask-user-mock`。AC-5 刷新 `listPending` 无 Playwright。

### S11 · 工具失败三脸

**覆盖**：有钉。权限红、超时红、落盘是瘦卡不是灌两万字。

- **你点**：不可见工具 / 超时 / 超长结果。然后 F5。
- **你看**：失败红点。落盘绿点=落盘成功，点开见路径，DOM 无全文。F5 不回运行中。
- **变量**：status error vs spilled。hint 不含全文。
- **发出**：工具失败或 spill 写盘。
- **回来**：timeline 终态进 ChatMessage。
- **并发**：失败结束本 step。
- **不变量**：红就是红。落盘绿≠正文进气泡。
- **测试**：`chat-tool-hint`。

### S12 · 角标矩阵

**覆盖**：有钉。谁在说话看左右+角标；刷新后还在。

- **你点**：对照手打 / 父任务 / Async / 子 notify / cron 各来一条后 F5。
- **你看**：手打右无角标；子里任务「父 Agent」；异步 Async；notify 来自子 Agent；cron 定时节律；助手左无角标。
- **变量**：`source` + `subagentResult` 推导，不是 CSS 猜。
- **发出**：各写入点带 source。
- **回来**：upsert 带 source；`listForChat` 仍带。
- **并发**：字段不是渲染时序。
- **不变量**：错位=场景坏了。
- **测试**：各测一部分脸，无总表 E2E。

### S13 · 中栏派工条

**覆盖**：有钉。无任务则无条；有则一条计数，卡只在左栏运行。

- **你点**：无后台看中栏。派两个非阻塞。点打开运行栏。任务到 0 条消失。
- **你看**：「后台任务 N」。中栏不堆第二份卡。
- **变量**：N=本会话可见非终态 Task 数。
- **发出**：任务入池写 Task。
- **回来**：`task_updated` + 短轮询兜底。
- **并发**：条只是投影，不调度。
- **不变量**：0 则整条消失。
- **测试**：`scenario-partial-chat-mock`、dsh。

### S14 · 换模型

**覆盖**：有钉。菜单点选；历史还在；本地挂了说人话。

- **你点**：点输入区模型名。选本地或云。再发一句。本机没开 Ollama 看未连接。
- **你看**：真菜单。触发器显示新模型。旧气泡还在。未连接显示地址/错误。
- **变量**：下一轮请求带新模型。
- **发出**：改配置 tRPC；下一 `beginStream` 带 model。
- **回来**：本地探测失败进面板。
- **并发**：占用中改了影响下一轮。
- **不变量**：同会话历史不丢。禁止无限 Thinking 假装在连。
- **测试**：`chat-model-menu-mock`。真 Ollama 锁定。

### S15 · Goal 顶栏

**覆盖**：有钉。有 Goal 才出栏；暂停/继续/清除立刻变；重启不偷跑。

- **你点**：设 Goal。看 2/20。展开收起。暂停。继续。清除。子会话不应有栏。
- **你看**：徽章+截断摘要。暂停→已暂停。清除整栏消失。
- **变量**：status `active\|paused\|done\|exhausted`。pause 仅 active；resume 仅 paused。
- **发出**：`goal_set` / pause / resume tRPC。
- **回来**：`notifyGoalUpdated` 到该 session。
- **并发**：暂停不自动 begin。重启不重建执行体。
- **不变量**：done/exhausted 再 resume 抛错。无 Goal 不渲染。
- **测试**：`prd-chat-goal`；`evolving-intent-mock`。

---

## 审批与定时

### S16 · 危险操作审批

**覆盖**：有钉。未批工具不能绿成功；批/拒后 Chat 自己续。

- **你点**：让 Agent git push。开着或打开 `/approvals`。点批准并执行或拒绝。看 `/runs` 等待审批。
- **你看**：Chat 工具条停住。审批页自己出 pending 卡。批准后 running→done。拒绝则副作用未发生。
- **变量**：pending→approved\|rejected\|expired。非法转移锁。
- **发出**：撞 gate 建 Approval，不执行。decide 后才跑原命令。
- **回来**：`approval_updated`；`/approvals` `subscribeUiState` + 短轮询。
- **并发**：`queuedReason=gate` 时任务条显示阻塞。
- **不变量**：未批不等于成功。开着页自己出卡。
- **测试**：`chat-approval-mock`、`admin-live-push-mock`、approval 单测。

### S17a · 定时节律 /cron

**覆盖**：有钉。开着 `/cron`，到点或手动触发，卡片自己变 lastRun。

- **你点**：打开 `/cron`。新建每天 08:00。停在这一页等到点或手动触发。
- **你看**：空则还没有定时节律。状态点自己变 running/成功/失败。不用 F5。
- **变量**：`isJobOccupied` = fire 临界区 ∪ `sessionToCron`。收到 settled 才放占用。
- **发出**：保存/触发 tRPC。到期 fire 建会话/流。
- **回来**：`notifyCronJobUpdated` 推全部主会话。
- **并发**：同一 job 禁止并行双 fire。重启遗留 running 标 failed。
- **不变量**：`prd-cron`。禁止 lastRun 假死。
- **测试**：`admin-live-push-mock`、heartbeat、`uiStateNotify`。

### S17b · Tasks 页

**覆盖**：有钉。有 running/pending/queued 时列表自己刷新。

- **你点**：打开 `/tasks`。另开 Chat 丢一个后台任务。
- **你看**：标题 Tasks 定时任务。进行中条目自己变。
- **变量**：Task 状态机 queued→running→终态。
- **发出**：任务入池。
- **回来**：`task_updated` + `refetchInterval` 兜底。
- **并发**：池上限见 S4b。
- **不变量**：开着页自己动。
- **测试**：`adminPullIntervals`；`async-task-mock`。

### S17c · Runs 页

**覆盖**：有钉。看见等待审批、已中断。中断=重启未续跑。

- **你点**：打开 `/runs`。故意重启服务后再打开。
- **你看**：等待审批。已中断。有中断时出现 resume-hint：不会假装还能接着跑。
- **变量**：终态禁回 running。`recoverStaleRuns` → interrupted。
- **发出**：Run 随 Agent 流创建。
- **回来**：`run_updated` PUSH。
- **并发**：重启不重建执行体。
- **不变量**：`prd-runs`。
- **测试**：recover 单测；`admin-live-push`。

---

## 知识库

### S18 · 手写文章

**覆盖**：有钉。编辑器创建真 md；刷新草稿还在。

- **你点**：`/editor` 填标题花园正文。创建文章。中途 F5 看本地草稿。再 `/posts` 点进去。
- **你看**：无标题钮禁用。创建中后跳转阅读页。磁盘 `content/{花园}/{slug}.md`。
- **变量**：前端草稿 local。创建 `post.create`。frontmatter 不写 garden。
- **发出**：tRPC `post.create` → FileSync 写 md。禁止 `write_file` 直写 posts。
- **回来**：返回 slug 跳转。`post_list_changed`。
- **并发**：自动保存 500ms 节流 2s 防抖。
- **不变量**：事实源是 md。
- **测试**：`blog-smoke`、`post-trash`、G02。

### S19 · 划词解释

**覆盖**：有钉。只解释不改文；F5 后浮层消失。

- **你点**：可编辑笔记划选。点解释。看原文。关再划。F5。只读页无此入口。
- **你看**：浮层划线解释 + 正在解释…。原文一字未改。
- **变量**：选区本地。解释不落库。
- **发出**：tRPC explain，只读。
- **回来**：填浮层。不 upsert 文章。
- **并发**：与自动保存正交。
- **不变量**：禁止刷新再看解释。
- **测试**：`scenario-garden-ui-mock`、`postExplain`。

### S20 · 润稿选区改写

**覆盖**：有钉。预览后拒绝还原、接受才写回。

- **你点**：顶栏润稿或划选精简。先拒绝。再跑接受。
- **你看**：预览框拒绝/接受。没接受正文不动。接受只改选区。
- **变量**：预览稿本地。接受后自动保存 `post.update`。
- **发出**：editor complete 出预览。接受才 update。
- **回来**：预览文本。保存走同步管道。
- **并发**：与划词浮层互斥。
- **不变量**：未接受=原文。
- **测试**：`editorAgentComplete*`。

### S21 · 文底相关笔记

**覆盖**：有钉。有则能点真文；孤立则整块不出现。

- **你点**：读完滑到底。点卡。孤立文确认无空卡。
- **你看**：相关笔记标题+花园。禁止未命名空卡。
- **变量**：空数组 → 不渲染块。
- **发出**：进页 PULL related。
- **回来**：列表；点进 `getById`。
- **并发**：只读。
- **不变量**：404 即坏。
- **测试**：`relatedPosts` 单测、`garden-ui-mock`。

### S22 · 对话写入知识库

**覆盖**：有钉。三模式；成功可打开真文；正文以服务端消息为准。

- **你点**：悬停左助手。写入知识库。选花园与新建/追加/覆盖。确认。打开文章。
- **你看**：写入中。成功已写入+打开。失败红字。
- **变量**：`createFromChat` 用消息 id。`published` 默认 false。
- **发出**：tRPC `createFromChat`。不是前端残稿顶替。
- **回来**：返回 postId/slug。
- **并发**：一次确认一次写。
- **不变量**：禁 `write_file` 砸 posts。
- **测试**：`scenario-partial-chat-mock`、G02。

### S23 · Inbox 收件箱

**覆盖**：有钉。中文状态；蒸馏幂等；开着页应自己变。

- **你点**：`/inbox` 看待消化 N。Chat 说把未处理写成周刊。页上也可勾选蒸馏。
- **你看**：待消化/已成文/已忽略。蒸馏完成能打开含来源 URL 的文。
- **变量**：已蒸馏且有 `distilledPostId` 幂等。`published=input.published??false`。
- **发出**：`inbox_list` / `inbox_distill`。
- **回来**：`inbox_updated` PUSH。
- **并发**：重复点蒸馏不得双文。
- **不变量**：`prd-inbox-distill`。
- **测试**：`inboxPipeline`、`scenario-product-gaps-mock`。

---

## 能力向

### S24 · 视频转笔记

**覆盖**：弱/假依赖。有字幕用字幕；没有就本地转写；不许编台词。

- **你点**：贴 B 站/YouTube 做成学习笔记。无转写环境看诚实失败。长任务走 S4b。
- **你看**：时间线 `video_transcript`。失败说明缺什么。不是绿点假台词。
- **变量**：成功才有 transcript。失败 `status=error`。
- **发出**：LLM 调转写工具。
- **回来**：瘦卡+落盘。异步则投递。
- **并发**：长视频应异步，父不卡死。
- **不变量**：无稿=失败。
- **测试**：partial-chat mock；真 STT 假依赖。

### S25 · 登录后再读平台

**覆盖**：弱/假依赖。先登录状态，弹窗你自己登；禁止截图 OCR 当读文。

- **你点**：贴需登录专栏。自己在弹出浏览器登录。看分段正文。
- **你看**：`browser_login_status` → `platform_login`。然后 `read_article`。只有截图 OCR 算失败。
- **变量**：cookie 在 data。登录成功才关窗。
- **发出**：工具链固定顺序。
- **回来**：分段正文进 tool result。
- **并发**：登录是人机，Agent 等工具返回。
- **不变量**：不许用识图代替登录。
- **测试**：partial-chat mock 链；真知乎无严酷 E2E。

### S26 · 本地压图

**覆盖**：弱/假依赖。没有压图网页；Workspace 本地命令；不上传在线压图站。

- **你点**：Chat 说原图压到约 1MB。未装 PicLite 看安装说明。
- **你看**：无独立压图页。回报原体积→新体积+相对路径。
- **变量**：路径相对当前 Workspace。
- **发出**：`list_directory` / piclite-compress。
- **回来**：体积与路径。失败红。
- **并发**：可同步或后台。
- **不变量**：禁止 TinyPNG 一类。
- **测试**：`picliteSkillContract`、G11。

### S27 · Remotion 短片

**覆盖**：弱/假依赖。Chat 里看到 pack→compose；花园能播；无声就承认无声。

- **你点**：贴微信链接做成 1 分钟讲解。看工具条与文中 viz。
- **你看**：正文 ` ```viz `。无配音凭证则无声+字幕。
- **变量**：工程不进 `apps/algo-viz`。
- **发出**：compose 工具链。
- **回来**：viz-embed 可挂载。
- **并发**：长任务应异步。
- **不变量**：禁止来路不明一键转 MD。
- **测试**：`vizEmbed`、partial-chat。真渲染重。

---

## 组合旅程

组合不发明第二套规则，只串上面的原子路径。

### A · 旅程 A 晨间简报

**覆盖**：弱/假依赖。Inbox 增量 → 5 要点等你点头 → 落库。

- **你点**：说把昨夜 Inbox 汇总成 5 条，挑 1～2 条写成 knowledge。
- **你看**：先列增量再草稿，确认后走 S22。
- **变量**：组合不发明第二套规则。
- **发出**：`inbox_list` + 读文 + `createFromChat`。
- **回来**：同 S23/S22。
- **并发**：登录墙插入 S25。昨夜异步只消费投递。
- **不变量**：等你点头再写。
- **测试**：`dailyFlow`、G12。

### B · 旅程 B 专题深挖

**覆盖**：弱/假依赖。只读旧文 → 同步资料员干等 → 成文 → 文底能点到旧文。

- **你点**：调研并对比花园已有笔记，资料员同步等结果再写成草稿。
- **你看**：父无 Async 角标。左侧增量结构。
- **变量**：`waitForResult=true`。
- **发出**：`post_list` + S3 + S22。
- **回来**：同 S3+S21。
- **并发**：父 occupied 到子完。
- **不变量**：旧文不灌成假用户气泡。
- **测试**：G05、G02。

### C · 旅程 C 本地+云+选区

**覆盖**：弱/假依赖。同会话换模型；选区拒绝再接受。

- **你点**：切本地整理私密笔记。切云只改第 2 节。编辑器划选精简。
- **你看**：历史还在。图片仍 uploads。
- **变量**：同 S14+S20。
- **发出**：两轮 Chat + editor complete。
- **回来**：同左。
- **并发**：先别上网靠提示词+工具策略。
- **不变量**：一篇文闭环。
- **测试**：partial-chat + editor complete。

### D · 旅程 D 过夜 Goal

**覆盖**：弱/假依赖。今晚跑；明早有实质；重启是中断说明不是静默重跑两遍。

- **你点**：设两天花园初版 Goal。明早打开同一会话。可故意重启服务。
- **你看**：顶栏 Goal。重启后中断说明。目录+长文不是占位灌水。
- **变量**：僵尸 Task/Run 标 failed/interrupted。
- **发出**：`goal_set` 后多轮自主。重启不 resume 执行体。
- **回来**：`goal_updated` + 消息水合。
- **并发**：重启不自动续跑铁律。
- **不变量**：有副作用工具禁止盲目重跑。
- **测试**：Goal 条有；过夜+重启偏 recover 单测。

---

## 身份 / QQ / 语音 / 多模态 / 文件

### S28 · 切换 Agent

**覆盖**：弱/假依赖。一次只跟一个人的一个会话；气泡不串台。

- **你点**：左栏点另一会话。点子 Agent 名。或 `/agents` 对话带 `agentId`。
- **你看**：中栏换成那串气泡。A 的工具条不出现在 B。无会话的子灰不可点。
- **变量**：`effectiveSessionId` + `session.agentId`。URL 为准。
- **发出**：切会话 PULL `listForChat`。不把旧消息 POST 到新人。
- **回来**：新 session 水合。旧 session 可后台仍 streaming。
- **并发**：`keepCurrentView`。
- **不变量**：两个人的气泡不得叠在同一列表。AgentTreeSelect 可能没挂上 Chat。
- **测试**：切会话隔离有；顶栏树无严酷测。

### S29 · 切换 Workspace

**覆盖**：弱/假依赖。列表换空间；人不过去则新对话，旧话不搬家。

- **你点**：左栏最上点空间名。点另一空间。`/workspaces` 新建。重置助手家。
- **你看**：触发器新名字。会话列表换成该空间。人不属于则落到该空间主 Agent。
- **变量**：`workspaceId`。`router.replace` + `resetSession`。
- **发出**：切空间改当前上下文。建空间 tRPC。
- **回来**：`agent_list` / `session_list`。新建后左栏应自己出现。
- **并发**：切走丢弃本视图乐观态。
- **不变量**：不把旧房间话搬到新空间。重置助手不清记忆。
- **测试**：下拉冒烟；串台无严酷测。

### S30 · 切换 QQ 助手

**覆盖**：基本无测。QQ 是 Agent+Workspace+通道绑定，不是设置开关。

- **你点**：`/channels` 看默认 Agent。或 Chat 切到 QQ 远程指挥空间打开其主会话。切回家里助手。
- **你看**：家里助手不会自动发 QQ。工具里才有 `send_qq_*`。
- **变量**：`qq-bot.md` 绑定 `agentId`。
- **发出**：切会话同 S28。
- **回来**：通道页 5s/10s 轮询，页内无 SSE。
- **并发**：新绑定最坏等一轮轮询。
- **不变量**：`send_qq_*` 只在 QQ 助手工具集。
- **测试**：admin 能打开标题。无绑定深链测。

### S31a · QQ 入站

**覆盖**：基本无测。开着 Chat 自己出现来文，角标「来自 QQ」，不能像手打。

- **你点**：`/channels` 注入 MessageGateway，或真机白名单私聊 / 群里 @机器人。
- **你看**：右侧来文 + 来自 QQ。助手左侧回答。手机收到回文。
- **变量**：白名单空=拒。群不 @ 不推。`rejectedUser`/`Group` 打日志。
- **发出**：Gateway 写消息+可能自动跑助手。
- **回来**：Chat SSE upsert。通道页靠轮询。
- **并发**：入站与你手打同一会话一流。
- **不变量**：开着 Chat 禁止教刷新。
- **测试**：后端 bot 单测有。无开着 Chat 入站 E2E。

### S31b · QQ 出站

**覆盖**：基本无测。回他一句走工具条；手机是纯文本。图/视频/文件/语音各工具。

- **你点**：在 QQ 助手会话说回他一句 / 发这张图 / 这段视频 / 这个文件 / 用音色说一句。
- **你看**：`send_qq_text` 绿点后手机纯文本。禁止把 Chat Markdown 原样刷到 QQ。
- **变量**：目标是官方 openid，填 QQ 号算错。出站账本防重。progress vs answer。
- **发出**：对应 `send_qq_*` 调官方 API。
- **回来**：工具条绿/红。
- **并发**：同一句不能发两次。系统终稿避免再发一遍。
- **不变量**：缺密钥必须红，不许绿点撒谎。
- **测试**：账本/peer 隔离单测。无真机 E2E。

### S32a · 语音听写

**覆盖**：基本无测。麦克风：字进输入框，不会自己发出去。

- **你点**：点输入条麦克风。说话。再点停止。自己点发送。
- **你看**：红脉冲正在听。字进框。不自动发。
- **变量**：浏览器 Web Speech。无服务端序。
- **发出**：听写本身不发。发送仍走 S1 enqueue。
- **回来**：无。
- **并发**：与语音对话互斥。
- **不变量**：不支持的浏览器不画钮。
- **测试**：locator 有；零稳定 E2E。

### S32b · 语音对话

**覆盖**：基本无测。耳机：说完停顿自动发，答完扬声器念，可打断。

- **你点**：点耳机钮。说话停顿。听它念。再开口打断。
- **你看**：语音对话开启中。麦克风钮这时不出现。右侧出现你的话。答完念。
- **变量**：停顿→enqueue。流结束→本地 TTS。
- **发出**：普通 enqueue。
- **回来**：同 S1。朗读本地。
- **并发**：可打断念。
- **不变量**：两套听写不得打架。
- **测试**：hook 有停顿自动发；打断仍无硬测。

### S32c · 点气泡朗读

**覆盖**：基本无测。悬停左侧回答点喇叭；一次只念一条。

- **你点**：悬停助手。点喇叭。再点停止。
- **你看**：在念。再点停止。
- **变量**：本地 TTS。与发送无关。
- **发出**：无。
- **回来**：无。
- **并发**：一次一条。
- **不变量**：不写库。
- **测试**：locator。

### S32d · QQ 合成语音出站

**覆盖**：基本无测。`voice_list` → 没有就 clone → `send_qq_voice`。没密钥必须红。

- **你点**：在 QQ 助手走 CosyVoice 发一句。
- **你看**：工具条。没配密钥红字说缺什么。
- **变量**：服务端密钥。
- **发出**：`voice_*` 工具。
- **回来**：工具结果。
- **并发**：同 S31b 账本。
- **不变量**：不许绿点撒谎。
- **测试**：无真密钥 E2E。

### S33 · 图片附件

**覆盖**：弱/假依赖。预览→OCR 脸→发出后 F5 图还在。Chat 只收图。

- **你点**：点图片附件或 Ctrl+V。等识别中。发送。F5。
- **你看**：缩略图。识别中蒙在这张图上不是整栏转圈。右侧气泡带图。
- **变量**：附件 id。`extractedText`。`previewUrl` 仅本地。
- **发出**：enqueue 带 attachments。
- **回来**：消息存图引用。F5 打得开。
- **并发**：连贴两张按 id 蒙版；竞态契约测缺。
- **不变量**：pdf 不走 Chat 附件。
- **测试**：`chat-ocr-real` 等到 ready。

### S34 · 视频（Chat 无附件槽）

**覆盖**：基本无测。Chat 不能把 mp4 当附件。链接走 S24。QQ 出站走 S31b。

- **你点**：试图把 mp4 当 Chat 附件（应选不了）。
- **你看**：文件框只收图片。这是产品决定不是漏按钮。
- **变量**：无 video attachment 类型。
- **发出**：无。
- **回来**：无。
- **并发**：不适用。
- **不变量**：负向：没有槽。
- **测试**：负向测试还没写。

### S35a · Chat 附件只收图

**覆盖**：基本无测。点附件只能选图，选不了 docx。

- **你点**：Chat 点附件，试图选 docx。
- **你看**：选不了。
- **变量**：`accept=image/*`。
- **发出**：无。
- **回来**：无。
- **并发**：不适用。
- **不变量**：不要合成一个按钮吃所有格式。
- **测试**：无 UI 严酷测。

### S35b · /files 资源柜

**覆盖**：基本无测。给文章备 pdf/zip/txt/图。没有 docx/xlsx。

- **你点**：打开 `/files`。上传本地资源选一个 pdf。
- **你看**：列表自己多一行。
- **变量**：accept `image/*,.pdf,.zip,.txt`。
- **发出**：上传 API。
- **回来**：列表 PULL；PUSH 弱。
- **并发**：单用户。
- **不变量**：从本页传的应自己出现。
- **测试**：无 UI 严酷测。

### S35c · Workspace 写文件

**覆盖**：有钉。Agent `write_file` 相对当前房间。右栏可抽 md。

- **你点**：对 Agent 说在工作区写 `outline.md`。
- **你看**：工具条 `write_file`。回报相对路径。F5 工具卡还在。
- **变量**：path 相对 Workspace；无则 `data/workspace`。
- **发出**：`write_file` 工具。
- **回来**：工具结果+可抽出文件条。
- **并发**：禁写穿他人空间。
- **不变量**：native 路径隔离单测有。
- **测试**：server 路径隔离。

### S35d · 花园正文必须走 post

**覆盖**：有钉。要写进花园走写入知识库或 `post_*`，不是 `write_file` 砸 `content/posts`。

- **你点**：你要它写进花园正文。
- **你看**：应走 S22 或 `post_create`。若走 `write_file` 砸 posts 即失败。
- **变量**：三桶：content 知识库 / config 配置 / data 运行时。
- **发出**：`post_create` / `post_update`。
- **回来**：文章页真 md。
- **并发**：同步管道保护。
- **不变量**：`write_file` 不直接写 `content/posts`。
- **测试**：G02；相关单测禁 `write_file`。
