---
title: "01 · Polaris：交卷是论文，不是自己"
date: 2026-08-31
as_of: 2026-08-31
category: 论文精读
published: true
excerpt: >-
  ZJU-REAL/Polaris（Apache 2.0）：文献 Wiki → Idea → Elo 评审 → GPU/SSH 实验 → LaTeX → 引文核验。
  Voyage = Navigator / Helm / Sextant。重活是确定性代码，LLM 只做判断。
  人闸、预算、伪造引文强制 non-pass。Artifact 层科研 OS，不是 RSI。
tags:
  - RSI
  - Polaris
  - 科研 Agent
  - Artifact
  - Voyage
  - ZJU-REAL
---

# 01 Polaris：交卷是论文不是自己

实验室想把「读文献、出想法、跑实验、写 LaTeX、审稿」收进同一个 Web 应用，而不想把整条链交给一次超长聊天。浙江大学 REAL 实验室的 [ZJU-REAL/Polaris](https://github.com/ZJU-REAL/Polaris)（Apache 2.0）按这个缺口来：六阶段流水线，每阶段留下可核产物；长任务叫 **Voyage**，状态机能从 checkpoint 恢复。官方 NOTE 写死分工：**爬取、解析、去重、指标解析、引文匹配是确定性代码**；LLM 只做打分、综合、起草、评审这类判断。

本篇是 Artifact 层的科研 OS 样板，位置见 [02 三层](../../1-坐标系与术语/02-Model-Harness-Artifact/02-Model-Harness-Artifact.md)。**不是** RSI：改进器是人写的流水线 + Voyage 模板，下一轮仍用同一套手续去改**另一份** wiki / 想法 / 实验 / 论文。**不是** FunSearch / AlphaEvolve（那些用冻结模型在可打分空间里搜函数或 kernel）。**不是** STOP / DGM / Gödel Agent（那些改 Agent 自己的脚手架）。**不是** Radiant Labs 那只同名 Rust harness——本篇只认 ZJU-REAL 这个仓库。一手是仓库 README 与 `docs/` 目录；本篇写机制时**没有**一篇配套 arXiv 可对表，实验室跑通了多少篇顶会，README 也没给数字，不要编。

## 1. 问题：科研链太长，聊天窗口存不住

文献冷启动要爬几个小时；一次 GPU 实验可以跑几天；投稿前还要把数字对回实验记录、把每条引用查到库里。这些活若只活在模型上下文里，worker 一崩、标签一关，状态就没了。Polaris 的设定是研究实验室，不是单用户 CLI：多用户、RBAC、邀请码注册，每个长任务都当成一次可恢复、可审计、**可停在人闸**的 run。token / 费用按 user / project / voyage 记账。库和论文的浏览会计入 7 天热度，让实验室看见大家实际在读什么——这是产品可观测性，不是评测分数。

它明确拒绝「Chatbot wrapper」。若爬 arXiv、解析 PDF、去重、把指标从日志里抠出来、把引文对上 OpenAlex，每次都去问 LLM，又贵又不可复现。反过来，若想法好不好、段落怎么写、审稿意见怎么综合，全部写成死规则，实验室也不会用。分界就在这里：能写成程序的不要交给采样；必须判断的才调用模型，而且所有调用走同一层抽象 + 数据库路由表，禁止在业务代码里写死模型名。

和花园已有专文的差，先用一层坐标挡住。FunSearch 的交卷物是 `priority` 函数，评估器在墙外，Agent 可以整段不动。[AlphaEvolve](../03-AlphaEvolve-进化编码智能体/03-AlphaEvolve-进化编码智能体.md) 把交卷物升级成整文件，发现者仍可不改。Polaris 的交卷物是 wiki 页、研究提案、实验记录、LaTeX 工程、审稿报告——仍然是产物。Voyage 看起来像 Harness，因为实验室软件本来就要有循环；循环的规格是人写的，Voyage **并不**把 Navigator 的源码当成下一轮要进化的个体。[Karpathy Auto-Research](../../3-Harness层-Agent运行时/02-Karpathy-Auto-Research/02-Karpathy-Auto-Research.md) 是单循环实验脚手架的另一条细线，本篇不把它的 README 数字搬过来对打。

## 2. 六阶段：每步留下下一阶段能消费的东西

README 把研究收成六段，外加投稿。每段之间可以停在 human approval gate。晋升实验之前有 promotion gate；真去投稿之前有 submission gate。

![文献 Wiki 到审稿，投稿虚线停在人闸](./images/fig-polaris-six-stages.png)

> 图 1：产物从左到右换手。菱形是人闸，不是模型自己改考纲。

**图 1 解析**

- **Literature**：Research Wiki。OpenAlex / Semantic Scholar / arXiv 摄入；锚点论文 snowball 引文；按方向库的 inclusion 配置打相关性；PyMuPDF 抽全文；编译成带 TL;DR、方法、可复用 idea、概念反链的 wiki 页。
- **Idea**：Idea Forge。概念共现洞、论文 limitation、趋势速度、综述空白，多信号找缺口，再检索规划式生成想法；四轴 novelty / feasibility / operability / impact；语义去重；Research Proposal 用 plan-execute-verify 加固。
- **Idea Review**：可配置 persona 两两辩论，judge 出 Elo 排名。实验室成员经 WebSocket 实时加入，评论**一等同**进 agent 上下文，不是事后贴一条备注。
- **Experiment**：Fernet 加密的 SSH 凭据上实验室 GPU。先问 intake，再规划、过算力预算、写代码、smoke test、流式日志和 live 指标，然后在**时间预算**里 parse / reflect / improve / debug / stop，不是死磕固定重试次数。卡住了问人，而不是假装成功。图用 VLM 检查。
- **Paper Writing**：多文件 LaTeX（NeurIPS / ICLR / ACL 模板），CodeMirror 6 + Yjs CRDT，服务端 tectonic 出 live PDF。Agent 按节起草，但**数字必须来自 `ExperimentRun`**，引文必须能映射到知识库条目。
- **Paper Review**：每条 citation 做存在性（exact / minor / fabricated）和支持度（supported / partial / unsupported）；实验数字对账实验记录；多视角顶会 reviewer + meta-review。**伪造引文 → 强制 non-pass**。
- **Submission**：虚线边框。软件可以准备好稿，决定投不投的是人。

Literature 阶段有一句口号：**compile, don't retrieve**。不是用户问一句再 RAG 一段，而是论文进来就编译成持久 wiki。平台级约束：一篇论文只有一份 wiki，编译 prompt **不携带**某个方向库的 statement 或 rubric，所以同一篇论文不会因为你从哪个书架打开而读成两副面孔；一个概念要两篇论文都引用才晋升。内容只存一份，方向库、主题书架、个人库、每日 feed 都是其上的成员关系层。库和主题解耦（多对多），各有 inclusion 配置（statement、目标、范围、排除项，经结构化 AI 访谈写出），带策展人、月度预算、重复合并、用户建库要管理员批、回收站不进检索。每日 arXiv feed 是库同步的唯一入口：库从池子里同步，自己不去打 arXiv；管理员可配日程。增量 sync 带 watermark resume，pgvector 按模型隔离 embedding 空间，避免向量混用。导出可以进 Obsidian（`[[wikilinks]]` + frontmatter）。知识库是版本化资产，不是一次聊天的副作用。

Idea Forge 在库内做缺口分析之后，还会对赢家提案做 novelty 双检：对方向库，也对外源。这仍是判断调用，不是可验证奖励——没有程序能对「新不新」给 0/1。四轴分数因此不能写成 Tufa 那种冻结裁判 GRPO；它更像带 rubric 的编辑部流程。Elo 辩论把 persona 评审收成可配置数据包，人的现场评论进上下文，是为了不让多 agent 评审在人缺席时自我加冕。

实验 Voyage 跨步保留一份基于文件的记忆，读和写都在步骤之间进行；控制台给 task map，以及一条可以在跑的中途对话的终端。修复失败看的是**时间预算**而不是固定 retry 次数：死磕次数会在瞬态错误上浪费机器，也会在真 bug 上无限转。VLM 查图，是因为曲线截图比日志更常被拿去写论文——查的是图是否存在、是否像声称的指标，不是让 VLM 当独立科学发现者。

Paper Review 的硬闸和 FunSearch 的 `evaluate` 同构，对象不同。FunSearch 跑不通的函数不进岛；Polaris 造出来的引用不能过审。存在性对库、Semantic Scholar、OpenAlex；支持度是另一轴，exact 存在但仍可能 unsupported。两者都把「模型爱编」关在确定性传感器后面。差别是：FunSearch 的评估器定义了发现本身；Polaris 的核验定义的是**交卷格式**，发现仍要人认。一键刷新参考文献并写进主 TeX，也是确定性修补，避免模型手写 `\cite` 键名漂掉。

实验阶段的安全模板值得单独钉：远程写有门、命令 allow/deny、全量审计，预算是三重帽（总额、单次、并发）。凭据静态加密。这不是对齐证明，是把 GPU 机器从「Agent 可随便 ssh」收成「可审计的工具」。SWE-bench 类编码 Agent 把执行关进沙箱；Polaris 把执行关进实验室已有的 SSH 机，权限模型更像运维，不像评测沙箱。

## 3. Voyage：规划、走一步、先做确定性检查

文献冷启动和实验都太长，不能绑在 HTTP 请求线程上。Polaris 的中心抽象：每个复杂任务是一次 Voyage——可恢复、可审计，背后是持久化的三件套。

| 组件 | 职责 |
|------|------|
| **Navigator** | 规划。目标拆成带依赖和预算的子目标。loop 模式里增量改 plan，不从头重写。 |
| **Helm** | 执行。单步：LLM、工具、SSH、文献 API，返回 observation。 |
| **Sextant** | 自验证。结构化 acceptance：exit code、产物是否存在、schema、指标阈值、计数、LLM rubric。**确定性检查优先**；失败把诊断送回 Navigator；反复失败升到人闸。 |

状态机是 `planning → executing → verifying → …`。worker 中途崩溃，健康检查之后从最近 checkpoint 续。预算超了自动暂停。plan / action / verdict 全部留着，UI 可 replay。任务队列走 ARQ（Redis），长任务离开请求线程。

不是每种任务都配满认知环。共享的是 **Runtime** 壳：状态机、checkpoint、闸、预算、取消、事件流。**Brain**（完整 plan-execute-verify）只给开放式任务开，例如实验。wiki 编译、idea review、按节起草，走固定模板，避免为可预测流水线再套一层编排。

![Runtime 壳里 Navigator → Helm → Sextant；失败虚线回规划，反复失败出人闸](./images/fig-polaris-voyage.png)

> 图 2：Sextant 验的是这一步接不接受，不是改进器有没有进 $S'$。

**图 2 解析**

- **Runtime shell**：checkpoint、预算、闸。Brain 关掉时，壳还在。
- **Navigator / Helm / Sextant**：航海隐喻三件套。Helm 只走一步，避免「一次生成整份实验脚本然后无法核对」。
- **虚线 diagnostics**：失败不是改 Sextant 的标准，是把诊断交给 Navigator 改 plan。
- **Human gate**：反复失败的出口。人在环里是产品约束，不是 L4 把考纲交给循环。
- **Brain / skip on templates**：可预测阶段不走满环。

应用内还有 PolarisBuddy：同一套只读工具层上的多轮工具循环（SSE、工具卡片），模式分 `chat` / `plan` / `goal`，内部仍是 Navigator / Helm / Sextant，也可以把活交给 subagent。问候语用 SQL 计数拼，不让模型瞎编实验室有多少篇论文。账号若不允许调模型，Buddy 保持关闭。这是产品助手，不是第二条自我改进环。

Skills 分两层，都是**数据不是代码**。Voyage skills：`guidance` / `rubric` / `persona` / `workflow` 包，可版本、可组合，注入到 prompt 的具名位置；有发布-审批-安装-评分的 marketplace；每次 Voyage **快照**所用 skill，为的是复现。Agent skills：`SKILL.md` 形状，三级渐进披露（目录一行描述，`skill_load` 取正文，附件按需读），好让前缀可缓存。MCP 工具层把文献、知识、项目状态、稿件、外部搜索做成只读注册表，对内给 agent，对外当 MCP server（Streamable HTTP / stdio）。项目隔离、只读。打包行为不等于改改进器：快照是为了下次还能用同一包，不是让 Voyage 去进化 skill 仓库。

## 4. 确定性工作与判断调用

三条设计原则（README Design principles）：

1. **分层**：router 薄，service 持业务逻辑且不 import Web 框架，model 在下。
2. **确定性 vs 判断**：爬、解析、去重是普通代码或 worker；只有判断才到 LLM。
3. **单一 LLM 边界**：调用走一层抽象，模型选择来自数据库路由表。

路由表按研究阶段映射 provider、模型、reasoning-effort：便宜模型打分，强模型辩论和起草。管理员设全局，用户可覆盖自己的。内置 fake provider 在生产结构上禁用，误开 flag 也不能用——这是防「演示造数」漏进真库，不是评测协议。

技术栈只作核对，不当教程：React 18 + Vite 5 前端；FastAPI + SQLAlchemy 2 + Alembic；PostgreSQL 16 + pgvector + Redis 7；远程 asyncssh；LaTeX 用 tectonic。另有 Electron 壳（macOS / Windows / Linux），重状态仍在远端服务器，不是离线可训模型的客户端。Docker Compose 是推荐部署；`worker` 容器必开，首次必须 `alembic upgrade head`。镜像前缀默认 `tricktreat/polaris-*`，以仓库当时 README 为准。

这些工程选择和 RSI 判断的关系只有一句：可部署、可多用户、可审计，说明它是实验室软件。软件越完整，越容易在通稿里写成「自主科研」。自主的是流水线调度，不是改进器递归。桌面端是 Electron 壳，Postgres / Redis / worker / LLM 调用仍在远端；第一次运行要填实验室服务器地址并对 `/api/health`。壳不是「把模型带回家离线自我改进」的载体，只是把 Web 包用 `app://` 协议包起来。安装包未签名，README 写了各系统如何放行——这是分发工程，与式 (2) 无关。

## 5. 对上花园：产物、脚手架、权重各冻在哪

| | 改什么 | $\theta$ | 改进器 $I$ | 人闸 |
|--|--------|----------|------------|------|
| FunSearch | `priority` / `heuristic` | 冻 | 岛模型在墙外 | 人改题再搜 |
| AlphaEvolve | 交卷程序 / kernel | 冻 | MAP-Elites 在墙外 | 人定目标与评估 |
| Polaris | wiki / 提案 / 实验 / 论文 | 冻 | Voyage 模板在墙外 | promotion / submission / 卡住就问 |
| STOP / DGM | Agent 自己的 Python | 冻 | $I$ 还在 $S$ 里（Harness） | DGM 主实验无人逐步点头 |
| Tufa / R1 | 解题器权重 | 动 | 验证器在墙外 | 停训由人 |

Polaris 和 FunSearch 都把「模型爱编」关在门后，门的对象不同。FunSearch 的门是科学发现的定义（跑分）；Polaris 的门是实验室纪律（引文存在、数字对得上账）。发现一篇更好的 cap set，可以在没有人点头的情况下进岛；Polaris 默认不让流水线自己点「投稿」。

和 [DGM](../../3-Harness层-Agent运行时/04-DGM-达尔文哥德尔机/04-DGM-达尔文哥德尔机.md) 的差更关键。DGM 的交卷是 GitHub issue 补丁，被改的是 Agent 自己的工具代码，档案里的子代下一轮还当改进器。Polaris 的 Voyage 失败时改的是**这一次 run 的 plan**，不是 Polaris 仓库里的 Navigator 实现。Sextant 的 acceptance 也是人写的标准。不要因为有「self-verify」三个词，就把 Sextant 听成术语式 (2) 的 $I'$。STOP 把改进器程序对自己递归，弱模型会掉分；Polaris 没有把「改 Voyage 引擎」设成六阶段里的某一段。若有人把 DGM 的开放档案接到 `agents/voyage/` 上，那是把本篇的 Harness 切片单独抽出去做实验，默认配置并不包含这一步。

和 [RSIBench-Data](../../6-评测与安全/01-RSIBench-Data/01-RSIBench-Data.md) 也不比分数。RSIBench 冻后训练栈，只让 Agent 改数据，测的是发现-可靠性缺口；Polaris 不是 benchmark，是可部署的科研 OS。没有公开的「用 Polaris 跑 RSIBench 得了多少」。Anthropic 的对齐研究 sandbox（AAR）域更窄，人对题和 eval；Polaris 域是一般 ML/NLP 实验室工作流。三套东西叠在「AI 做科研」标题下，坐标不是同一把尺。

同名干扰：检索 Polaris 会撞到别的项目（包括 Rust 写的 Agent harness）。本篇机制、Apache 2.0、六阶段、Voyage 三件套，只对 [ZJU-REAL/Polaris](https://github.com/ZJU-REAL/Polaris)。不要把另一份 README 的数字填进来。仓库布局上 Voyage 引擎在 `src/backend/app/agents/voyage/`，业务在 `services/`，router 保持薄——这和「Agent 改自己的工具文件」那种 Harness 自指不是同一条目录语义：这里的目录是给人维护的，不是给下一轮子代去变异的。

## 6. 何时失效，以及为什么仍不是 RSI

没有可部署的 GPU 机器和文献 API key，实验阶段就是空壳；README 写明有只读演示账号，用来看 UI 不是用来发论文，本篇不转写口令。方向库的 inclusion 写得空，Literature 的相关性打分没有锚。人闸若形同虚设，伪造引文硬闸仍然在，但 promotion 可以把差想法放进贵实验。Sextant 若把 LLM rubric 放到确定性检查前面，自验证会退化成自夸。Skill marketplace 若允许未审批包直接进生产 Voyage，快照反而记下一套不稳的行为。embedding 若没按模型分空间，换路由表会把旧向量和新向量混检索——这是工程失效，会被误读成「模型突然变蠢」。

RSI 清单。单轮 $S'=I(S)$：一次 Voyage 确实把「还没 wiki」变成「有 wiki」，把「还没实验」变成「有 `ExperimentRun`」。式 (2) 还要 $I'\subseteq S'$。下一轮的 Navigator / 六阶段 / 人闸 / 路由表，默认仍是同一份人写软件。$\theta$ 不动。考纲（方向库、审稿标准、预算）在人手里。混元阶梯上这是产物发现，不爬 L3。L2 最多能蹭到「生成物要过验证门」——那扇门验的是论文和实验记录，不是改进器升级。和第 6 章可靠性专文的接头：证据（引文存在、数字对账）放在更新边界之外，这点和 DGM 删检测标记相反；但边界之外的证据验的是**稿件**，不是「流水线变强了」。

官方 README 没有报告「系统改了自己的流水线源码并因此更快发现好论文」。若以后有人用 DGM 那套去改 Polaris 的 `src/backend/app/agents/voyage/`，那是另一篇 Harness 专文，不是本仓库今天这份软件已经在做的事。材料不够到「实验室用它发了哪几篇」这一层——公开材料是 README，不是实验报告。[OM-FREEPLAY] 因此本篇不编录用数字、不编和 RSIBench 的对照分。

**读**：六阶段产物；Voyage 三件套；确定性代码 vs 判断；伪造引文 non-pass；人闸；和 FunSearch / DGM 的层差；不是 RSI。  
**不读**：把科研 OS 听成智能爆炸、把 Sextant 听成 $I'$、把 guest 演示听成已发论文、把另一只同名 Polaris 的数字填进来、把产品改进清单外链当机制。

同层：[03 AlphaEvolve](../03-AlphaEvolve-进化编码智能体/03-AlphaEvolve-进化编码智能体.md)；[04 FunSearch](../04-FunSearch-函数空间搜索/04-FunSearch-函数空间搜索.md)。Harness：[04 DGM](../../3-Harness层-Agent运行时/04-DGM-达尔文哥德尔机/04-DGM-达尔文哥德尔机.md)。评测：[01 RSIBench](../../6-评测与安全/01-RSIBench-Data/01-RSIBench-Data.md)。信号：[04 RLVR](../../1-坐标系与术语/04-模仿学习与RLVR/04-模仿学习与RLVR.md)——本篇连 $\theta$ 都不改。

## 参考文献

1. ZJU-REAL. [Polaris](https://github.com/ZJU-REAL/Polaris). Apache License 2.0. 六阶段、Voyage、NOTE 分工、伪造引文强制 non-pass 以该仓库 README 为准。配套说明在仓库 `docs/`（architecture / concepts / deployment）。
2. 本花园：[02 三层](../../1-坐标系与术语/02-Model-Harness-Artifact/02-Model-Harness-Artifact.md)；[03 AlphaEvolve](../03-AlphaEvolve-进化编码智能体/03-AlphaEvolve-进化编码智能体.md)；[04 FunSearch](../04-FunSearch-函数空间搜索/04-FunSearch-函数空间搜索.md)。
