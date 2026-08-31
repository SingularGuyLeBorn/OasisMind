---
title: Argus：Verification-Gated 的 Agentic Runtime 与固定模型自进化
category: RSI
published: false
excerpt: >-
  Argus（arXiv 2608.05144）提出四角色（Manager/Planner/Engineer/Reviewer）持久 runtime，
  工作合约 K_t=(ι,o_t,c_t,v_t) 分离 standing intent 与 operational objective；
  verification-gated admission 使 memory/skill/routing 等状态在固定模型权重下跨 mission 累积；
  SWE-Bench Pro ~78% vs Direct Copilot ~59%（1.41× Token）。
tags:
  - RSI
  - argus
  - verification-gated
  - runtime-self-evolution
  - long-horizon
  - harness
---
# Argus：Verification-Gated 的 Agentic Runtime 与固定模型自进化

> 论文：Argus: A General-Purpose Agentic Runtime（Autonomous Research Generation and Understanding System）
> arXiv：[2608.05144](https://arxiv.org/abs/2608.05144)（2026-08）
> PDF：`content/uploads/papers/argus-verification-guided.pdf`

## 一、原文精读

### 问题动机

Long-horizon 研究不是「沿固定路线尽量跑远」。真实场景中：**standing intent（用户立场）可以稳定，但 operational objective（操作目标）、constraints（约束）、verification criteria（验收标准）会随证据逐步精化**——数学 campaign 可能产出中间界、反例与重 formulation；软件需求常到实现阶段才暴露遗漏；形式验证里 spec 与 implementation 可能都错。

若 runtime 只允许「继续」或「放弃」， unrestricted pivot 又与 rationalized failure 不可区分。Argus 的核心问题是：**如何在固定模型权重下，让 Agent 系统跨 bounded mission 持久运行、证据驱动地 pivot，并把可复用经验累积进状态而非仅堆 transcript？**

### 方法贡献

**四角色 + 三平面**：

| 角色 | 职责 | 权威输出 |
|---|---|---|
| **Manager** | 锚定 campaign 目标、生命周期、路由、Stage 转移 | Campaign division & stage transition |
| **Planner** | 分解 research state 为有界任务与依赖 | Task specs、plan status、stage checklist |
| **Engineer** | 单轮内改 artifact、调工具、跑实验 | Artifacts、measurements、handoff |
| **Reviewer** | 独立审查（mandatory / requested / 低-risk 可 Engineer self-review） | done / continue / blocked + grounded next action |

三平面：**control**（调度）、**execution**（单 mission 工作）、**records**（不可变 event log，不做 completion 判决）。

**工作合约模型**：

$$K_t = (\iota, o_t, c_t, v_t)$$

- $\iota$：**standing user intent**——campaign 必须 preserve 的用户立场
- $o_t$：当前 **operational objective**
- $c_t$：已知 **constraints**
- $v_t$：**verification criteria**
- $X_t$：用户侧 clarifications / priorities / open questions（与 $K_t$ 分离）

材料性 refine 须经 **ManagerAdmit**：

$$(X_{t+1}, K_{t+1}) = \operatorname{ManagerAdmit}(X_t, K_t, K'_t, e_t, r_t, u_t)$$

其中 $K'_t$ 为提议合约、$e_t$ 为证据、$r_t$ 为 admission 记录、$u_t$ 为授权操作者——**把「证据支持的合约修订」与「silent intent drift」分开**。

**Verification-gated fixed-model runtime self-evolution**：

- 模型参数**不变**；进化的是 persistent state $H_t$（memory $M$、skills $S$、tools $A$、verifiers $V$、routing $R$、tasks $Q$）。
- Candidate update（memory / skill / procedure / verifier / routing / rejected route）**不能因某角色生成即入库**；须 task-native evidence + **authorized owner commit**（Table 2 定义每类状态的 commit owner）。
- 完整 event tape $D_{\mathrm{process}}$ 严格超集于最终 artifact $D_{\mathrm{final}}=\{y^\star\}$——失败分支、测量、review verdict 均保留（Proposition 1: process-data dominance）。

**跨 session 连续性**：Engineer / Reviewer 每轮 fresh provider session；跨 session 靠共享 **CHECKPOINT.md**（durable state、evidence refs、open questions、next step）。Reviewer 为 independent review 路径上的 final editor。

**Reuse value 形式化**：

$$G_L(\Delta H_t) = \sum_{j=1}^{L} \gamma^{j-1} \left[ \mathcal{R}_{q_{t+j}}(H_t) - \mathcal{R}_{q_{t+j}}(H_t \oplus \Delta H_t) \right]$$

$G_L > 0$ 表示 admitted state 在后续任务分布上降低 risk——「compounding intelligence」从 rhetoric 变为可 counterfactual 检验的 claim。

### 实验数字

**七 benchmark arenas（native metric，不 cross-normalize）**：

| Benchmark | Argus | 对照 |
|---|---|---|
| SWE-Bench Pro（731 tasks, GPT-5.5/xhigh + Copilot） | **~78%** accuracy | Direct Copilot **~59%**；$R_{\mathrm{tok}} \approx 1.41$ |
| SOL-ExecBench（B200 kernel opt） | Global **#6**；2× #1；7 top-3 | — |
| nanochat B200（5 min） | **0.9636 BPB** | Human best 0.9646 |
| nanochat H100 | **0.9855 BPB** | Human best 0.9879 |
| nanoGPT speedrun（8×H100） | **79.77 s** to val loss 3.28 | Human 80.18 s |
| AARRI-Bench（82 tasks） | **63/82 (76.8%)** | Paper best 68.3% |
| Math-Reasoning Data Synthesis | pass@4 − pass@1 gap | Arbor suite metric |

**SWE-Bench Pro 纵向 self-evolution（RQ2，observational）**：

- 按 sequential Wave 分组：W1–6 startup → W7–12 early reuse → W13–18 composition shift → W19–22 mature → W23–24 late difficult。
- 随 reviewed Skill / Wiki / verification / routing state 累积，**solve-time token / active workflow time 在 mature window 下降**——与 frozen-state replay 未做因果对照，论文如实标注为 observational。

**Reviewer 分析（RQ3）**：adaptive routing——高风险任务 invoke independent Reviewer；continue verdict 后 subsequence official verifier success 与 strict Reviewer rescue 分别统计。

**External adoption**：Argus 产出的 TileLang RWKV6 kernel 经外部 maintainer review 合入 fla-org:main（PR #1045）。

**Representative vertical trace**：Erdős–Gyárfás 数学 campaign——1 条 accepted route falsification + 6 个 proof-backed research deltas；展示 falsified branch 跨 mission 保留。

**Dense-intelligence 任务定义（Argus Team, 2026）**：一类任务在连续时间窗口内维持高频推理、工具、验证与迭代，直至产出可测量结果——需同时满足：(1) 存在可重复执行的 task-native verifier；(2) 解空间足够大， brute-force 不可行；(3) 中间 artifact（界、反例、partial implementation）本身有价值。SWE-Bench Pro、SOL-ExecBench、nanochat BPB 等均符合；纯 chat 问答不符合。

**Review 作为 selective error correction（Eq. 15）**：设 proposal 正确率 $p$、Reviewer sensitivity $\alpha$、false-accept $\beta$，则 $\Pr(C{=}1 \mid A{=}1) = \alpha p / (\alpha p + \beta(1-p))$。当 $\alpha > \beta$ 时，accepted state 精度高于 raw proposal stream——Argus 把 Reviewer 建模为 **error-correction channel**，而非 cosmetic lint。

**SWE Wave 窗口（RQ2 观测摘要）**：startup（W1–6）→ early reuse（W7–12）→ composition shift（W13–18）→ mature（W19–22）→ late difficult（W23–24）。论文强调：later window 的 token/time 下降 **consistent with** runtime self-evolution，但 task mix 与难度也在变——读者不应将其误读为严格 causal ablation。

**Qualitative deployment note**：专家用户反馈 Argus 的部分价值在于 **会停**——对 underspecified objective 拒绝盲跑，迫使显式约束浮现。作者声明这并非公开 prospective user study，而是 internal verification 的动机记录。

### 局限

- **Token 溢价**：SWE-Bench Pro 上 1.41× aggregate Tokens——verification + 多角色 not free。
- **Self-evolution 无 matched ablation**： longitudinal 分析缺 frozen-state 对照，$G_L$ 仅为 observational proxy。
- **Goal drift 未消除**：Manager / operator 仍可 approve  poor tradeoff；$K_t/X_t$ 投影跨多个 runtime surface，非单 atomic transaction。
- **部署复杂度**：campaign / mission / Stage / 四角色 / budget governance——远高于 MEA 三角色 harness。
- **Benchmark 不可比**：七域 native metric 故意不 normalize——「breadth evidence」非单一 leaderboard。
- **闭源 runtime**：论文描述系统级 claim，公开可复现 codebase 与 supplement 需单独跟踪。

## 二、方法架构解析

### 系统拆解

**Reviewed mission loop（Algorithm 1 抽象）**：

```
Input: ι, K_t, X_t, H_t, backlog B, budget b
ManagerCommit → campaign identity
while budget & not complete:
    Planner → claim bounded task q
    repeat:
        Engineer(q) → (y, evidence, review_mode)
        Reviewer or EngineerSelfReview → verdict r
        if r = continue: q ← r.next_action
    until r ∈ {done, blocked, paused}
    AdmissionEvidence + AdmitResult
    if material K'_t: ManagerAdmit (needs user authority u_t)
    H_{t+1} ← Update(H_t, trace, admitted state)
```

**Verification 术语分层**：

| 术语 | 含义 |
|---|---|
| **verification-guided** | 总控策略：persist / stop / pivot 需证据 |
| **verification-gated** | 窄义：reusable update 的 admission 条件 |
| **Reviewer-gated** | 独立 Reviewer 路径 |
| **external grader** | 任务原生 evaluator（SWE test、BPB、SOL score 等） |

**State ownership（Table 2 摘要）**：

- Memory / Skills：Engineer 产 candidate → **Reviewer commit**
- Verifiers / Stage checklist：**Planner** own（Reviewer 给 feedback）
- Routing：**Manager commit**
- Tasks：**Planner author + Scheduler commit**

**CHECKPOINT.md vs Event tape**：

- CHECKPOINT = 有限 context budget 下的 decision-useful compression（Eq. 12）
- Event tape = 更 informative 的完整实验记录
- 失败分支进入 compression 当且仅当其改变 next optimal action

### 关键不变量

1. **Intent vs contract 分离**：$\iota$ stable；$o_t, c_t, v_t$ 可 evidence-backed refine，须 ManagerAdmit。
2. **No commit without gate**：生成 ≠ 入库；每条 reusable state 有明确 commit owner。
3. **Mission boundary atomicity**：调度一次 claim 一个 bounded task；mission 级 completion 有 explicit source（self-review vs Reviewer）。
4. **Fresh session, durable checkpoint**：模型 context 不承载长期状态；CHECKPOINT + $H_t$ 承载。
5. **Fixed-model evolution only**：权重不变；变的是检索/路由/技能库——与 RSI Model 层明确分界。

### 相邻对照

| 系统 | 角色模型 | 状态进化 | 验证 |
|---|---|---|---|
| LongHorizon-Harness MEA | Manager/Executor/Auditor | Task state + audit reports | 环境 read-only audit |
| Reflexion / Voyager | 单 agent + memory | 自然语言 reflection / skill lib | 弱 / 任务 reward |
| MemGPT / A-MEM | 分层 memory | 自动 memory tier | 无 role gate |
| Orchard / OpenForge | 训练期 trajectory | 权重更新 | Task-native reward |
| **Argus** | 四角色 + Stage | Verification-gated $H_t$ | Reviewer + external grader |

Argus 与 LH-Harness **同族**：都拒绝「单 growing context 自评进度」；Argus 进一步把 **research campaign** 级 contract、skill library、routing policy 纳入 gated evolution，面向 RSI/Harness 层而非纯部署 harness。

### 可迁移抽象

1. **$K_t=(\iota,o_t,c_t,v_t)$ 合约面板**：任何 long-horizon agent UI/backend 应用显式字段分离 intent 与 operational contract——避免把用户一句 prompt 混为不可分的 goal blob。
2. **Verification-gated admission**：memory/skill/procedure 写入路径 = candidate → evidence check → owner commit；禁止「模型说记住就记住」。
3. **Process ⊃ Final artifact**：日志与 checkpoint 分工：tape 保全真，checkpoint 保决策可用——对应 event store +  curated working memory。
4. **Role-resolved trace $\phi(\tau_t)=(m_t,p_t,x_t,r_t,\Delta H_t)$**：Debug  long-horizon 失败时，先查哪个 role 越权或未 commit，而非只看末条 assistant 消息。
5. **$G_L$ 作为 harness KPI**：评估 runtime 是否在固定模型下「越用越省 token / 越少重复失败」——比单次 benchmark 分更贴近 RSI Harness 层目标。

Argus 代表 **「固定模型 + 进化状态 + 验证门控」** 路线：与训练期 RSI（改权重）正交，可与 LongHorizon-Harness 式 audit loop 在部署栈不同层 coexist。

**RSI 三层框架定位（对照周星星笔记）**：

| RSI 层 | Argus 落点 |
|---|---|
| Artifacts | 单 mission 产出（patch、kernel、BPB） |
| **Harness** | **主战场**：$H_t$ 进化、四角色、verification-gated admission |
| Model | 刻意不改权重；模型升级 = 换 backbone，非 runtime self-evolution |

**与 OpenForge / Orchard 的分工**：Orchard/OpenForge 在 **训练期** 让 policy 适应 harness；Argus 在 **部署期** 让 **runtime state** 在固定 policy 下累积。完整 RSI 闭环可以是：OpenForge 训出更强 Engineer → Argus runtime _gate 其产出为 Skill → 下一 campaign 检索 Skill 降 token。

**Implementer 自检（verification-gated 最小集）**：

- [ ] 是否有显式 $K_t$ 结构（或等价字段）区分 intent 与 operational contract？
- [ ] Memory/skill 写入是否经过「candidate → evidence → owner commit」三步，而非 tool 直写？
- [ ] Event log 是否 append-only 且 strict superset of shipped artifacts？
- [ ] 高风险 mission 是否强制 independent Reviewer，而非默认 self-review？
- [ ] 是否度量 fixed-model 下 later-task token/time（$G_L$ proxy），而非只看单次 benchmark？

**MLE-Bench Lite 补充**：Table 5 报告 Argus 在 9 项 Kaggle 竞赛中获 medal 的子集（AUC↑ / LogLoss↓ 等 native metric），证明 verification-gated runtime 不限于 code repair——research intern 类 judgment 任务同样受益。

---

> 产品落地对照见 [`../../essays/oasis-improvements-2026-08-harness-wave.md`](../../essays/oasis-improvements-2026-08-harness-wave.md)。
