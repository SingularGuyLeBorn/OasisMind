# RSI / Autoresearch / Harness 调研（对接见微）

> 日期：2026-08-12  
> 配套看板（可并排打开）：Cursor canvas `rsi-harness-survey-2026-08.canvas.tsx`  
> 仓库已有：`对比分析-记忆-Harness-Agent.md` + `harness-survey-2026-meng-et-al.pdf`

## 0. 结论（先看这个）

近期「PrimeAgent / autoresearch / DGM」热潮的共同点不是科幻式自我意识，而是把**优化压力收进 harness**：

| 模式 | 代表 | 一句话 |
|------|------|--------|
| 固定指标实验环 | karpathy/autoresearch | 改提示/配置 → 固定预算跑 → keep/discard |
| 轨迹驱动 harness CRUD | Prime Agent `/refine` / Continual Harness | 从轨迹提出最小编辑 prompt/skill/memory/subagent |
| 归档式自改代码 | DGM / ADAS | 改 Agent 自身代码或工作流，用基准筛选，保留谱系 |
| 状态机生产线 + 阶段门 | AutoResearchClaw | 23 阶段状态机，Gate 5/9/20 强制审批可回滚 |
| 记忆驱动策略进化 | EvoScientist | 双持久记忆 + 失败归因 + 成功蒸馏人工 review |
| 训练-搜索同构算子 | OpenRSI / Frontis-MA1 | Draft/Improve/Debug/Crossover 训练推理同构 |
| 元层机制注入 | Bilevel Autoresearch | 外层循环生成搜索机制代码注入内层 |
| 分层记忆蒸馏 | TencentDB Agent Memory | L0→L3 语义金字塔 + BM25/向量/RRF 混合检索 + 符号化任务画布 |

对见微（OasisMind）：**已有 E/T/C/S/L 大半**；最该补的是 **V（自动化验证门）+ 实验账本 + 受限 refine**。  
**不要**换成「唯一工具=REPL」、**不要**上权重级 SEAL、**不要**让 Agent 无沙箱改 `apps/server` runtime。

---

## 1. 项目谱系（特点 · 风险 · 能不能学）

### 1.1 Prime Agent（Prime Intellect，2026-08）

- **仓库**：https://github.com/PrimeIntellect-ai/prime-agent  
- **博客**：https://www.primeintellect.ai/blog/prime-agent  
- **特点**：
  - **RLM**：上下文当变量；子 Agent = `rlm(...)` 异步函数；持久 IPython 为唯一工具面。
  - **Continual Harness** H=(ρ,G,K,M)：prompt / subagents / skills / memory 运行时 CRUD。
  - **`/refine`**：轨迹 → 最小 harness 编辑；记 trigger→outcome；可按 ID 回滚；规划后台、应用在 turn 边界。
  - daemon detach、心跳/日程、有预算的 `/autonomous` + 用户质量门。
- **风险**：长程 Factorio 案例显示 refine 可学会「作弊 skill」——**无账本+无外部判定 = 风险放大器**。
- **能不能学**：**高（机制）/ 低（整栈）**。抄 refine 台账、gate、回滚；不抄 REPL 唯一工具面。

### 1.2 karpathy/autoresearch（2026-03）

- **仓库**：https://github.com/karpathy/autoresearch  
- **特点**：人改 `program.md`；Agent 改 `train.py`；**固定 5 分钟墙钟**；`val_bpb` keep/discard；过夜可 ~100 次实验。
- **风险**：指标可被博弈；结果跨机器不可比。
- **能不能学**：**高**。见微版 = 固定任务包 + lint/test/公式 Gate + keep/discard 配置变体。

### 1.3 Darwin Gödel Machine（Sakana / jennyzzt，2025）

- **论文**：arXiv:2505.22954 · **代码**：https://github.com/jennyzzt/dgm  
- **特点**：自改代码 + 基准实证；**archive 开端探索**；SWE 20%→50%，Polyglot 14.2%→30.7%。
- **能不能学**：**中**。学归档/分支；禁止裸改见微 runtime。

### 1.4 ADAS / Meta Agent Search（ICLR 2025）

- **论文**：arXiv:2408.08435 · https://github.com/ShengranHu/ADAS  
- **特点**：元 Agent 用代码搜索新工作流；archive；跨域迁移常仍强。
- **能不能学**：**中（离线）**。沙箱搜 Skill/工作流候选 → PR，不自动合入。

### 1.5 RLM（Zhang / Kraska / Khattab，2025）

- **论文**：arXiv:2512.24601  
- **特点**：长提示放 REPL 变量，程序化切块+递归子调用；超窗仍可用且常更省。
- **能不能学**：**中**。强化「超长材料只存 path，用 offset/变量化读」，勿整文件灌窗。

### 1.6 SEAL（权重自适配，2025）

- **论文**：arXiv:2506.10943  
- **特点**：self-edit → SFT/权重更新。  
- **能不能学**：**低**（现阶段）。见微用 Markdown Skill/Memory 外置即可。

### 1.7 Continual Harness（Princeton，2026-08-11，Prime Agent 的理论母体）

- **论文**：arXiv:2605.09998 · 出自 GPP（Gemini Plays Pokémon）团队。
- **特点**：
  - **Reset-free 在线 refine**：每 F 步 Refiner 读近期轨迹找失败签名，对 H=(ρ,G,K,M) 跑四遍 CRUD——**mid-episode 更新，不重启 episode**（对比 GEPA 等 prompt 优化必须 reset）。
  - 从最小环境接口（无手工工具/无领域脚手架）起步，恢复到手工专家 harness 的大部分差距。
  - 闭环到权重：online process-reward co-learning——frontier teacher 重标注 rollout，回训开源模型。
- **能不能学**：**高（见微已学）**。见微 `harness_refine` = 其 in-context 部分；权重 co-learning 不做（违反透明原则）。

### 1.8 AutoResearchClaw（aiming-lab，2026，~10K★）

- **仓库**：https://github.com/aiming-lab/AutoResearchClaw
- **特点**：**23 阶段状态机**论文生产线（选题→16 源并行文献→假设→沙箱实验→NeurIPS LaTeX）；**Gate 阶段 5/9/20 强制审批**（拒绝→回滚到指定阶段）；多 Agent 辩论（Innovator/Pragmatist/Contrarian）+ 对抗评审；自愈执行器（崩溃诊断→修复→REFINE/PIVOT）；**跨 run time-decayed lesson store**；引用 4 层验证防幻觉；Co-Pilot 人在环模式。
- **能不能学**：**中**。状态机+阶段门+回滚点设计值得借鉴（比见微现行「单 run 审批门」更细粒度）；整条论文生产线对知识管理平台过重。

### 1.9 EvoScientist（2026-03，~4.1K★，arXiv:2603.08127）

- **仓库**：https://github.com/EvoScientist/EvoScientist
- **特点**：三 Agent（Researcher / Engineer / **Evolution Manager**）；**双持久记忆**——Ideation Memory（可行/已失败方向，防重复踩坑）+ Experimentation Memory（有效策略）；**三进化机制**：IDE（方向进化）/ IVE（失败归因：实现失败 vs 方向失败）/ ESE（成功实验蒸馏可复用模式）；AutoSkills 定时从记忆蒸馏技能并**提请人工 review**；cron 调度；SQLite checkpointer。
- **能不能学**：**高（机制）**。IVE 的「失败二分归因」与 ESE 的「成功蒸馏→人工 review」可直接嫁接到见微 `optimizeAgentPrompt` / `skill_promote`——目前见微经验蒸馏无失败归因、无人工 review 闸。

### 1.10 OpenRSI / Frontis-MA1（FrontisAI，2026-07，arXiv:2607.28568）

- **仓库**：https://github.com/FrontisAI/OpenRSI
- **特点**：把 RSI 落成**可执行 MLE 工程**——OpenMLE-Gym（5758 个质量门控可执行任务）+ OpenMLE-ERL（执行 grounded SFT+RL）+ OpenMLE-Evo（长程搜索）；35B 元进化 Agent，四原子算子 **Draft/Improve/Debug/Crossover** 训练与推理同构；MLE-Bench Lite 奖牌率 39.4%→71.2%（超 GPT-5.5+Codex）。
- **能不能学**：**低（整栈）/ 中（思想）**。训练侧不做；「四算子同构 + 执行反馈驱动」的思想已由见微 experiment 账本 + Gate 覆盖其轻量版。

### 1.11 Bilevel Autoresearch（2026-03，arXiv:2603.23420）

- **仓库**：https://github.com/geminiyellow/bilevel-autoresearch
- **特点**：**外层循环优化内层循环本身**——读内层代码找瓶颈，生成新搜索机制（Tabu/多臂老虎机/正交探索）以 Python 注入；RTX 5090 3×3 消融：外层带来 5× 提升；机制可递归反馈到外层自身（learn how to learn）。
- **能不能学**：**中**。见微版 = refine 不只改 Skill/Memory，还可改「实验策略配置」（如 Gate 阈值、扫描顺序）——但必须有账本+回滚，且仅限配置层不改 runtime。

### 1.11b TencentDB Agent Memory（腾讯云数据库团队，2026-04，MIT）

- **仓库/形态**：团队级 AI Agent 记忆中枢；SQLite + sqlite-vec 本地零依赖，REST Gateway 框架中立。
- **特点**：
  - **L0→L3 分层记忆金字塔**：L0 原始对话 / L1 原子事实 / L2 场景知识块（人类可读 Markdown）/ L3 Persona 长期画像；检索由 L2/L3 快速启动、下钻 L1/L0。
  - **混合检索**：BM25 + 向量 + RRF 融合。
  - **符号化短期记忆**：厚重工具日志卸载外部文件，上下文只留 Mermaid 任务画布（node_id 可瞬间回读原文）。
  - 白盒可调试（中间产物全是可读 Markdown/Mermaid）；官方 benchmark：WideSearch 成功率 +51%、Token −61%，PersonaMem 准确率 48%→76%。
- **风险**：项目很新（2026-04 发布）API 未稳；Node ≥22.16；需两组 LLM 配置。
- **能不能学**：**高（三个思想已落地，见 §3 P3 三行）**。不整栈引入（与见微 Memory 体系重叠），只抄分层蒸馏/混合检索/任务画布；sqlite-vec 不引（Prisma 扩展链脆弱，千条级暴力余弦足够）。

### 1.12 自我进化 Agent 总综述（2025-08，EvoAgentX 配套）

- **两轴分类法**（定位任何 RSI 项目的坐标）：
  - **改什么**：prompt / code / weights / architecture。
  - **怎么驱动**：gradient / LLM-guided / evolutionary / experience-driven。
- **见微坐标**：改 **prompt+skill+memory（文本态）** × **LLM-guided + experience-driven**——与 Prime Agent 同象限；刻意不碰 weights（SEAL/OpenRSI 象限）与 runtime code（DGM 象限）。

### 1.13 OpenHands / Aider / 工业栈

- 工程交付向：沙箱、编辑/终端、SWE 对接。  
- **可学**：沙箱与轨迹；不必 fork。  
- Claude Code / Cursor / Codex：compact、权限、可观测——见微已对齐多项。

---

## 2. Harness 综述与评估方法

### 2.1 形式化（仓库已有 PDF）

Meng et al.《Agent Harness for Large Language Model Agents: A Survey》  
H = **(E, T, C, S, L, V)** = 执行环 / 工具注册 / 上下文 / 状态仓 / 生命周期钩子 / **评估接口**。

生产级系统倾向六组件齐全；见微历史自评约 **5✓ + V≈**（见 `对比分析-记忆-Harness-Agent.md`）。

配套：https://github.com/Gloriaameng/Awesome-Agent-Harness

### 2.2 评估方法（改造时用）

| 方法 | 要点 | 见微用法 |
|------|------|----------|
| **Harness-Bench** arXiv:2605.27922 | 同任务换 harness；完成+过程+效率+失败；**model×harness 成对报告** | 固定模型扫 Gate/refine/工具包 |
| **HAL** (Princeton) | 多基准编排；默认成本+轨迹 | 内部跑题强制记 token/$/墙钟 |
| **Coding Agent Index** (AA 2026) | 完整栈 pass@1 | 抽小题回归，不追全榜 |
| **Harness Effect** arXiv:2607.06906 | 同模型换编排可大幅降成本/token | 目标加「任务/$」 |
| **METR 效度** | bench 过 ≠ 人类合并（−24.2pp） | Gate 用 lint/test/契约代理「会合并」 |
| **轨迹审计** | 推理与工具反馈/工作区脱节 | tool_end 契约 + 失败回灌 |
| **Eval Survey** arXiv:2507.21504 | Agent 评估维度总览 | 设计内部场景表时对照 |

---

## 3. 对接见微的改造清单

与 `docs/prompts/harness-gap-fix-prompt.md` 一致，按性价比：

| 优先级 | 动作 | 学自 | 落地状态 |
|--------|------|------|----------|
| **P0** | `outputValidator`：落盘前机械化检查 | Harness V / METR | **已有** `infra/outputValidator.ts`（write_file / memory / Post） |
| **P0** | ExperimentLedger：keep\|discard + 指标 + 轨迹指针 | autoresearch | **已有** `HarnessExperiment` + `infra/experimentLedger.ts` + `experiment_*` 工具（assistant/super） |
| **P0** | Gate **服务端核验**（禁止自报 lintOk） | METR / autoresearch | **已有** `harness_gate_run` + keep/autonomous 强制 `verified` |
| **P0** | 按 id 回滚 + 实验日志（primaryMetric） | Prime / autoresearch | **已有** `experiment_rollback` / `experiment_get` + `primaryMetric` |
| **P1** | refine-lite：仅 Skill/Memory/prompt note；需证据；可 rollback | Prime `/refine` | **已有** `harness_refine` + 强制 ExperimentLedger |
| **P1** | autonomous 预算 + 用户 gate（如 `pnpm test`）；触顶≠成功 | Prime `/autonomous` | **已有** `mode=autonomous` + `autonomous_gate(gatePreset)` + 墙钟/轮次预算 |
| **P1** | 归档多样体 + 分支探索（不改 runtime） | DGM | **已有** decide 归档 `candidate` + `experiment_branch` |
| **P2** | 内部 mini Harness-Bench（20–50 题）+ 成本报表 | Harness-Bench / HAL | **已有** `evals/harness-bench/`（24 题）+ `pnpm test:bench`（mock/live 双模 + JSON 成本报表） |
| **P2** | 超长材料强制 path+offset（RLM 思想） | RLM | **已有** `read_file`/`read_article` 返回 `nextOffset` 翻页闭环 + 截断标记强制引导分段重读 + `TOOL_RESULT_ATTENTION_GUIDE` 分段读纪律 |
| **P2** | 经验蒸馏加**失败归因**（实现失败 vs 方向失败）+ 蒸馏结果**人工 review 闸** | EvoScientist IVE/ESE | **已有** `agentEvolution.ts`：`attributeFailure` 规则归因（工具错误签名→implementation）写入经验记忆；`optimizeAgentPrompt` 改提案制（pending Approval 人工 review 后生效） |
| **P3** | **L3 Persona 蒸馏层**（L0 对话→L1 原子记忆→L2 Skill/知识库→L3 画像） | TencentDB Agent Memory | **已有** `infra/personaDistiller.ts`：L1 记忆→LLM 蒸馏 Markdown 画像→supersede 版本链；每日 cron + `memory_distill_persona` 手动；`buildPersonaHint` 注入 prompt 顶部；persona 不衰减、不可直接创建 |
| **P3** | **混合检索**（BM25 + 向量 + RRF） | TencentDB Agent Memory | **已有** `infra/embedding.ts` + `memoryRepository.read` 路径 1b：OpenAI 兼容 embedding（`memory.embedding` 配置，默认关闭=纯 FTS5），RRF 排名融合；不引 sqlite-vec（千条级暴力余弦零原生依赖） |
| **P3** | **任务画布**（长任务进度符号化状态卡） | TencentDB Agent Memory | **已有** `infra/taskCanvas.ts` + contextHooks `task-canvas` 钩子：本会话血缘 queued/running 任务紧凑文本注入（空态不注入）；不画 Mermaid（文本 token 效率更高） |
| **P3** | 离线搜 Skill/工作流变体 → 候选 PR | ADAS / DGM | 未做 |
| **P3** | refine 扩展到「实验策略配置」（Gate 阈值/扫描顺序），仍限配置层 | Bilevel Autoresearch | 未做 |
| **不做** | REPL 唯一工具、SEAL 权重自改、无沙箱改 server、整条论文生产线 | — | 维持不做 |

### 三条红线

1. keep 判定必须来自**外部可判定**指标（测试/校验器），禁止模型自评。  
2. 自改默认只限 `config/skills`、memories、prompt notes。  
3. 每次 refine/实验必须**落账本且可回滚**；无账本不许过夜自治。

---

## 4. 出处速链

- Prime：https://www.primeintellect.ai/blog/prime-agent  
- Continual Harness：https://arxiv.org/abs/2605.09998  
- Autoresearch：https://github.com/karpathy/autoresearch  
- AutoResearchClaw：https://github.com/aiming-lab/AutoResearchClaw  
- EvoScientist：https://arxiv.org/abs/2603.08127  
- OpenRSI / Frontis-MA1：https://arxiv.org/abs/2607.28568  
- Bilevel Autoresearch：https://arxiv.org/abs/2603.23420  
- DGM：https://arxiv.org/abs/2505.22954  
- ADAS：https://arxiv.org/abs/2408.08435  
- RLM：https://arxiv.org/abs/2512.24601  
- SEAL：https://arxiv.org/abs/2506.10943  
- Harness Survey：https://doi.org/10.20944/preprints202604.0428.v3  
- Harness-Bench：https://arxiv.org/abs/2605.27922  
- Harness Effect：https://arxiv.org/abs/2607.06906  
- HAL：https://hal.cs.princeton.edu/ · https://arxiv.org/abs/2510.11977  
- Agent Eval Survey：https://arxiv.org/abs/2507.21504  
- TencentDB Agent Memory：腾讯云数据库团队开源（2026-04，MIT）；L0→L3 分层记忆 + BM25/向量/RRF + Mermaid 任务画布
