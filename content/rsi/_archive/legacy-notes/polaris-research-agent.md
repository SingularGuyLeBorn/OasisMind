---
title: Polaris：ZJU-REAL 端到端 AI 科研 Agent 平台
category: RSI · 科研自动化
published: false
excerpt: >-
  浙江大学 REAL 实验室开源 Polaris：文献 Wiki → Idea Forge → Elo 评审 → GPU/SSH 实验 → LaTeX 写作
  → 引文核验审稿的六阶段流水线；Voyage 核心（Navigator/Helm/Sextant）持久化
  plan-execute-verify，human-gated 可恢复长跑。
tags:
  - Polaris
  - 科研 Agent
  - ZJU-REAL
  - Voyage
  - RSI
  - 多用户
---
# Polaris：ZJU-REAL 端到端自主科研 Agent 平台

> **项目**：[ZJU-REAL/Polaris](https://github.com/ZJU-REAL/Polaris)（Apache 2.0）
> **README**：[Polaris.md](../../uploads/github-readme/Polaris.md)
> **定位**：面向研究实验室的多用户 Web 平台——不是 Chatbot wrapper，而是**确定性流水线 + LLM 判断调用**的分层系统。

## 原文精读

### 产品承诺

Polaris 把完整科研生命周期收进单一 Web 应用：

**Literature → Idea → Idea Review → Experiment → Paper Writing → Paper Review → Submission**

每一阶段产出** durable artifacts** 供下一阶段消费；每个 hand-off 可停在 **human approval gate**。长跑任务抽象为 **Voyage**：持久化、可恢复、可审计、可预算的 agent run（小时至天数）。

官方强调：**重活（爬取、解析、去重、指标解析、引文匹配）是确定性代码**；LLM 只用于 scoring、synthesis、drafting、review 等**判断调用**——换算是 cheap、reproducible、auditable。

### 六阶段流水线（README 级细节）

| 阶段 | 模块 | 做什么 |
|---|---|---|
| **Literature** | Research Wiki | OpenAlex / Semantic Scholar / arXiv  ingest；anchor 论文 snowball 引文；rubric 相关性打分；PyMuPDF 全文；编译 cross-linked wiki（TL;DR、method、可复用 idea、concept backlinks）；pgvector 语义检索；Obsidian vault 导出 |
| **Idea** | Idea Forge | 多信号 gap 分析（概念共现洞、论文 limitation、趋势速度、survey 空白）→ 检索规划式 idea 生成；四轴评分（novelty/feasibility/operability/impact）；语义去重；Research Proposal builder（plan-execute-verify） |
| **Idea Review** | Elo 辩论 | 可配置 persona reviewer 两两辩论；judge 产出 Elo 排名；人类 WebSocket 实时加入，评论**一等同注入 agent context** |
| **Experiment** | Experiment Lab | 用户 Fernet 加密 SSH 凭据连 GPU；Voyage 规划 → 算力预算门 → 写代码 → smoke test → 流式日志+ live metric → auto-iterate（parse/reflect/improve/debug/stop）；VLM 检查 figure |
| **Paper Writing** | Paper Writer | 多文件 LaTeX（NeurIPS/ICLR/ACL 模板）；CodeMirror 6 + Yjs CRDT 协作；服务端 tectonic 编译 live PDF；agent 逐节起草但**数字必须来自 ExperimentRun**、引文必须映射知识库条目 |
| **Paper Review** | 引文+事实核验 | 逐条 citation existence/support；实验数字对账 ExperimentRun；多视角顶会 reviewer + meta-review；** fabricated citation → 强制 non-pass** |

### Voyage Agent Core

复杂任务的统一运行时 = **Runtime shell** + 可选 **Brain**：

| 组件 | 职责 |
|---|---|
| **Navigator** | 规划：目标 → 带依赖/预算的子目标计划；loop 模式下增量改 plan 而非全盘 replan |
| **Helm** | 执行：单步 LLM/工具/SSH/文献 API，返回 observation |
| **Sextant** | 自验证：结构化 acceptance criteria（exit code、artifact 存在、schema、metric 阈值、LLM rubric）；确定性检查优先；失败反馈 Navigator，重复失败 escalate 到人 |

**状态机**：`planning → executing → verifying → …`，worker crash 后 checkpoint 恢复；预算耗尽 auto-pause；全 plan/action/verdict UI 可 replay。

**Brain 分级**：开放-ended（实验）走完整 cognitive loop；wiki compile、idea review、paper drafting 等**可预测流水线**用固定模板，避免 over-orchestrate。

### 其它系统能力（README 摘要）

- **Skill system**：guidance/rubric/persona/workflow 数据包，版本化 marketplace；每个 Voyage snapshot 所用 skills。
- **MCP tool layer**：只读工具注册表，对内 agent + 对外 MCP（Streamable HTTP / stdio），项目隔离。
- **Multi-user RBAC**：JWT、invite code、per-call token/cost 归因到 user/project/voyage。
- **LLM routing table**：DB 配置各阶段 model/provider（便宜模型打分、强模型 debate/draft）。

Tech stack：React 18 + Vite 5 前端；FastAPI + SQLAlchemy 2 + ARQ worker；PostgreSQL 16 pgvector + Redis 7；Docker Compose 一键部署。

## 方法/架构解析

### 架构原则（design principles）

1. **Strict layering**：router 薄 → service 持业务逻辑（不 import web framework）→ model 在下。
2. **Deterministic vs judgemental split**：与 Polaris README NOTE 块一致——这是与「纯 LLM 科研助手」的本质差异。
3. **One LLM boundary**：所有模型调用过统一抽象 + DB routing，禁止 hard-code model。

### Voyage 与 RSI 文献的对位

Polaris 接近 RSI 光谱中 **「AI 做 AI 研究」的产品化实例**，但边界清晰：

- **人仍在**：approval gate、方向设定、算力预算、最终 submission。
- **机器擅长**：文献编译、实验迭代、LaTeX 工具链、引文/数字 deterministic check。
- **可恢复长跑**：Voyage checkpoint 对标 RSIBench / AAR 里的「research session 不能因 crash 丢状态」需求。

相对 RSIBench-Data（只测 data-centric loop），Polaris 是**全栈科研 OS**；相对 Anthropic AAR（对齐研究 sandbox），Polaris 域是**一般 ML/NLP 实验室工作流**。

### 工程借鉴点（抽象层）

| 模式 | Polaris 做法 | 可迁移思想 |
|---|---|---|
| 阶段 artifact | 每阶段 DB + 文件持久产物 | Agent 流水线忌「只在 context 里思考」 |
| Human gate | promotion / submission 显式暂停 | 高风险转移点必须可观测、可审批 |
| Sextant | 确定性检查先于 LLM rubric | verify 层分级，防 self-confirming loop |
| Skill snapshot | Voyage 记录所用 skill 版本 | 复现性：行为由数据包定义而非 prompt 漂移 |
| SSH 实验 | 加密凭据 + command allow/deny + 三重 budget | 远程执行 agent 的安全模板 |

### 部署与运维

推荐 Docker Compose（postgres/redis/api/worker/frontend）；生产可用 Docker Hub 预构建镜像 `tricktreat/polaris-*`；首次必须 `alembic upgrade head`。本地可无 Docker 回退 SQLite（`make backend-dev` / `make frontend-dev`）。

### Literature 阶段的「compile, don't retrieve」

Research Wiki 拒绝「问一句 RAG 一段」的 lazy 模式：论文 ingest 后** upfront 编译**成持久 wiki 页（概念 backlink、可复用 idea 块），增量 sync 带 watermark resume。导出 Obsidian vault 时使用 `[[wikilinks]]` + frontmatter——知识库成为**版本化资产**，而非 ephemeral context。这与 Code as Agent Harness 综述里「state 在 artifact 外显式存在」一脉相承。

### Paper Review 的 deterministic 闸门

Review 阶段对每条 citation 做 existence（exact/minor/fabricated）与 support（supported/partial/unsupported）分级；实验段落数字必须对账 `ExperimentRun` 表。**伪造引文 → 强制 non-pass**——这是把 LLM reviewer 关在 deterministic 传感器之后，避免纯 self-grade 过稿。对应 CS329A Skill Mod 3「Judge 审计」的生产级实例。

### 与 RSIBench / AAR 的边界

| 系统 | 测什么 | 人扮演什么 |
|---|---|---|
| RSIBench-Data | 固定栈下的数据合成 research | 仅启动 run |
| Anthropic AAR | 对齐研究 idea+实验 | 定题与 eval |
| Polaris | 全链路科研 OS | gate、预算、方向、投稿 |

Polaris 不是 benchmark，而是**可部署 research lab 软件**；其 Voyage 抽象可被借鉴来包装见微内长任务（如 multi-day 文献+写作项目），但不应与 RSIBench 分数直接比较。

对国内实验室而言，Polaris 的差异化在于：**多用户 RBAC + invite 注册 + 实验 SSH 加密凭据 + 引文/fabrication 硬闸** 一套齐，而非单用户 CLI agent。若只做「读 paper 写 summary」，用 Research Wiki 即可；若要走 idea→GPU 实验→LaTeX→review 全链，Voyage 的 checkpoint/budget/gate 是刚需。Skill marketplace 则把「Reviewer persona / Proposal rubric」从代码里抽成数据，利于复现实验时 frozen behavior pack。

---

> 见微改进对照见 [OasisMind 2026-08 Harness 波改进清单](../../essays/oasis-improvements-2026-08-harness-wave.md)。
