# RSI / Autoresearch / Harness 调研（对接见微）

> 日期：2026-08-12  
> 配套看板（可并排打开）：Cursor canvas `rsi-harness-survey-2026-08.canvas.tsx`  
> 仓库已有：`对比分析-记忆-Harness-Agent.md` + `harness-survey-2026-meng-et-al.pdf`

## 0. 结论（先看这个）

近期「PrimeAgent / autoresearch / DGM」热潮的共同点不是科幻式自我意识，而是把**优化压力收进 harness**：

| 模式 | 代表 | 一句话 |
|------|------|--------|
| 固定指标实验环 | karpathy/autoresearch | 改提示/配置 → 固定预算跑 → keep/discard |
| 轨迹驱动 harness CRUD | Prime Agent `/refine` | 从轨迹提出最小编辑 prompt/skill/memory/subagent |
| 归档式自改代码 | DGM / ADAS | 改 Agent 自身代码或工作流，用基准筛选，保留谱系 |

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

### 1.7 OpenHands / Aider / 工业栈

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
| **P1** | refine-lite：仅 Skill/Memory/prompt note；需证据；可 rollback | Prime `/refine` | **已有** `harness_refine` + 强制 ExperimentLedger |
| **P1** | autonomous 预算 + 用户 gate（如 `pnpm test`）；触顶≠成功 | Prime `/autonomous` | **已有** `mode=autonomous` + `autonomous_gate` + 墙钟/轮次预算 |
| **P2** | 内部 mini Harness-Bench（20–50 题）+ 成本报表 | Harness-Bench / HAL | 未做 |
| **P2** | 超长材料强制 path+offset（RLM 思想） | RLM | 部分（read_file/tool-results offset）；未强制 |
| **P3** | 离线搜 Skill/工作流变体 → 候选 PR | ADAS / DGM | 未做 |
| **不做** | REPL 唯一工具、SEAL 权重自改、无沙箱改 server | — | 维持不做 |

### 三条红线

1. keep 判定必须来自**外部可判定**指标（测试/校验器），禁止模型自评。  
2. 自改默认只限 `config/skills`、memories、prompt notes。  
3. 每次 refine/实验必须**落账本且可回滚**；无账本不许过夜自治。

---

## 4. 出处速链

- Prime：https://www.primeintellect.ai/blog/prime-agent  
- Autoresearch：https://github.com/karpathy/autoresearch  
- DGM：https://arxiv.org/abs/2505.22954  
- ADAS：https://arxiv.org/abs/2408.08435  
- RLM：https://arxiv.org/abs/2512.24601  
- SEAL：https://arxiv.org/abs/2506.10943  
- Harness Survey：https://doi.org/10.20944/preprints202604.0428.v3  
- Harness-Bench：https://arxiv.org/abs/2605.27922  
- Harness Effect：https://arxiv.org/abs/2607.06906  
- HAL：https://hal.cs.princeton.edu/ · https://arxiv.org/abs/2510.11977  
- Agent Eval Survey：https://arxiv.org/abs/2507.21504  
