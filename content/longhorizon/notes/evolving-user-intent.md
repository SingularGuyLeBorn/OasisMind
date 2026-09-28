---
title: "LLMs Get Lost in Evolving User Intent：演化意图下的 Agent 评测框架"
category: "长任务智能体"
published: true
excerpt: "微软 AIIL 提出 evolving-intent 框架：把静态单轮 benchmark 升维为多轮对话，覆盖 argument reveal、 argument revision、function switch 三种意图动态；GPT-5.1 在 SWE-Bench Verified 上 Evolve 准确率从 72% 跌至 0%， function switch 是主要瓶颈；开源 GitHub 含完整数据构造与 situated simulation 流水线。"
tags: ["long-horizon", "user-intent", "multi-turn", "benchmark", "agent", "microsoft"]
---
# LLMs Get Lost in Evolving User Intent：演化意图下的 Agent 评测框架

> 论文：LLMs Get Lost in Evolving User Intent
> 作者：Jihoon Tack, Philippe Laban, Jennifer Neville（Microsoft Research, AI Interaction and Learning）
> arXiv：[2607.20734](https://arxiv.org/abs/2607.20734)（2026-07-22）
> GitHub：[microsoft/evolving-intent](https://github.com/microsoft/evolving-intent)

## 一、原文精读

### 问题动机

真实人机协作里，用户**很少在第一轮就把意图说全**。意图会随对话展开而：逐步披露（under-specification）、中途修正（revision）、甚至转向相关但不同的子任务（function switch / task switching）。然而主流 LLM 评测与训练仍集中在**单轮、fully-specified** 设定——模型在静态任务上接近天花板，却未回答一个更根本的问题：**当用户意图在多轮中演化时，Agent 能否持续跟踪并据此行动？**

现有不少 multi-turn benchmark 也有缺口：(i) 奖励常依赖 LLM-as-judge 而非可验证答案；(ii) 用户轮次偏短；(iii) 用户侧可控性有限，多停留在「增量披露信息」，缺少 revision 与 task switch 等真实动态。论文因此问：能否在**保留原始 benchmark 自动可验证性**的前提下，把静态单轮任务「升维」为演化意图的多轮环境？

### 方法贡献

核心思路：**不从头手写 multi-turn 数据**，而是从已有 verifiable single-turn benchmark 出发，做结构化意图分解与扰动，再经 turn scheduler 组装多轮对话。

**意图结构（terminology）**：

| 概念 | 含义 |
|---|---|
| `function` | 要回答/完成的主问题（如 SQL 的输出形状、SWE issue 的高层变更） |
| `argument` | 求解所需的约束/条件（WHERE 谓词、issue 中的症状与范围等） |
| `answer` | 与原 benchmark 对齐的可验证终态 |

**三阶段数据构造（intent_construction）**：

1. **Intent Extraction**：LLM 将单轮样本分解为 function + arguments + answer，并经 coverage / solvability 验证。
2. **Retrospective Expansion — Counterfactual**：为每个 argument 生成局部值替换的「错误版本」，供 revision turn 使用。
3. **Retrospective Expansion — Predecessor**：生成相关但不同的 predecessor function，供 function-switch turn 使用；须满足 answer preservation（前置任务的新 argument 不改变终态答案）。

**Situated Simulation（Stage 4–5）**：`EvolvingIntent` DataLoader 按 `num_turns`、`num_revisions`、`num_switches` 自动推断场景：

| 场景 | 描述 |
|---|---|
| `fully-specified` | 单轮全信息（基线） |
| `argument-reveal` | 参数逐轮披露，无变更 |
| `argument-revision` | 中途修正先前给出的错误参数 |
| `function-switch` | 中途切换到相关但不同的 function |
| `combined` | 上述动态可在同一会话中组合 |

**Turn Scheduling（Algorithm 1）** 先排 function-switch 与 revision 事件，再填 reveal slot，保证「先披露错误值、后 correction」的因果顺序；每轮内事件顺序为 function event ≻ revision ≻ argument reveal。

**Text Rendering** 支持 rule-based（默认、确定性）与 LLM naturalization（BrowseComp+ 实验用，带 token 校验与 fallback）。

**评测协议**：Evolve 设定对 reveal / revise / switch **各应用两次**，共 **6 次 intent transition、7 轮用户 turn**（含初始轮）；最终 turn anchor 回原始任务，用原 benchmark 协议打分（SQL execution、SWE test、数学题 exact match 等）。

覆盖四个域：GSM8K、BIRD-SQL、BrowseComp+、SWE-Bench Verified（经 pipeline 过滤与抽样：200 / 100 / 100 / 50 条）。

### 实验数字

Table 1 主结果（Accuracy %，Single → Evolve）：

| 模型 | GSM8K | BIRD-SQL | BrowseComp+ | SWE-Bench Verif. |
|---|---:|---:|---:|---:|
| GPT-5.1 | 98.0 → 82.0 (−16.3%) | 72.0 → 66.0 (−8.3%) | 49.0 → 34.0 (−30.6%) | **72.0 → 0.0 (−100%)** |
| GPT-5.2 | 99.0 → 83.0 | 77.0 → 61.0 (−20.8%) | 53.0 → 50.0 | 80.0 → 62.0 (−22.5%) |
| GPT-5.5 | 99.0 → 80.5 | 80.0 → 71.0 | 65.0 → 57.0 | 86.0 → 80.0 (−7.0%) |
| Gemini 3.1 Pro | 98.0 → 82.0 | 75.0 → 72.0 | 51.0 → 40.0 | 86.0 → 84.0 |

**关键发现**：

- 即使 frontier 模型，**仅几次 intent transition 就显著退化**；SWE 域对 GPT-5.1 是灾难性失败（0%）。
- **Turn-wise intent tracking**（GPT-5.1 on GSM8K）：argument reveal 99%、argument change 98%，**function switch 89% → 82%（两次 switch）**——switch 是 tracking 主瓶颈。
- **Prompt recap vs Oracle recap**：前者让模型自己从历史重推意图，后者直接给 ground-truth intent——后者显著更好，说明失败不全是「推理能力不足」，更是**无法从冲突上下文中维护最新意图信念**。
- **Turn 数 vs transition 数**（GSM8K）：7 轮但无 intent 变化（重复 turn）准确率 87.5%，与 4 轮相当；7 轮但 **6 次 transition** 降至 82.0%——退化由 intent 变化驱动，非单纯 context 变长。
- **Reasoning mode 无救**：GPT-5.1 instant vs reasoning 在 Evolve 上几乎无差异；瓶颈是 belief update，不是单步推理。
- **小模型更脆**：GPT-5.4 nano 在 Evolve 上退化远大于 GPT-5.4 / mini。
- **RL 初步验证**：Qwen3-4B 在 GSM8K Evolve 上 GRPO 训练 <50 step：64.0% → **76.0%**，Single-Turn 94.0% → 95.0%（几乎无损）。

### 局限

- **合成用户**：rule-based / LLM naturalizer 仍非真人；自然度与真实 IM 场景的 gap 未完全闭合。
- **LLM 流水线依赖**：Extract / Counterfact / Predecessor 均用 GPT-5.1 验证，pipeline 错误会系统性污染数据（虽有 rejection sampling）。
- **成本**：7-turn 交互 = 最多 7 次顺序 agent call + 渐长上下文，评测贵于 single-turn。
- **域覆盖有限**：四域虽跨 math / SQL / search / SWE，但未覆盖 GUI、长工具链、审批等人机协作形态。
- **训练演示规模小**：RL 实验仅 GSM8K + 小模型，未证明大规模 SFT/RL 可完全补齐 intent-tracking 能力。

## 二、方法架构解析

### 系统拆解

```
单轮 benchmark 样本 (q, y*)
        │
        ▼
┌───────────────────┐
│ Stage 1: Extract  │ → function f*, arguments C*, answer y*
└─────────┬─────────┘
          ▼
┌───────────────────┐
│ Stage 2: Counter- │ → 每个 argument 的局部错误值 c_cf
│ factual args      │
└─────────┬─────────┘
          ▼
┌───────────────────┐
│ Stage 3: Prede- │ → 相关 predecessor functions f_pre
│ cessor functions  │
└─────────┬─────────┘
          ▼
┌───────────────────┐
│ Stage 4: Turn     │ → TurnSlots S_1..S_T（intent 轨迹）
│ Scheduler         │
└─────────┬─────────┘
          ▼
┌───────────────────┐
│ Stage 5: Text     │ → 自然语言 user turns
│ Renderer          │
└─────────┬─────────┘
          ▼
   Agent 多轮交互 → 末轮 verifiable 评分
```

Repo 目录：`intent_construction/`（Stages 1–3 + per-dataset scripts）、`situated_simulation/`（`EvolvingIntent` + `turn_scheduler.py`）、`evaluation/`（runners + `run_{gsm8k,bird,browsecomp,swe}.sh`）。

安装：`conda create -n evolvingintent python=3.10` → `pip install -e .`；API 走 OpenAI / Azure OpenAI（`LLM_BACKEND` 切换）。

### 关键不变量

1. **Final-turn anchor**：无论中间如何 reveal / revise / switch，**最后一轮必须 recover 原始 anchored task**，保证与原 benchmark 答案可比。
2. **Schedule-before-render**：先排 intent 状态机，再生成 surface text——防止「先 correction 后 disclosure」等无效轨迹。
3. **Minimal counterfactual edit**：revision 必须是单点值替换，不是改写整个 argument——否则 correction 语义不成立。
4. **Predecessor answer preservation**：switch 引入的新 argument 不得改变终态 gold answer。
5. **Verifiable end-to-end**：评分仍走 execution-based / test-based 原协议，不用 judge 打分主路径。

### 相邻对照

| 工作 | 用户动态 | 可验证性 | 与本文关系 |
|---|---|---|---|
| 传统 single-turn bench | 无 | 强 | 本文的上游原料 |
| τ-bench / 部分 multi-turn bench | 多为增量披露 | 混合 | 本文显式建模 revise + switch |
| LongHorizon-Harness | 不建模用户意图变化 | 环境 audit | 正交：LH 管执行状态，本文管意图信念 |
| Chat 产品「当前任务」面板 | 工程 workaround | 无统一 benchmark | 本文提供可复现评测协议 |
| Argus \(K_t=(\iota,o_t,c_t,v_t)\) | 区分 standing intent vs operational contract | 任务原生 verifier | 理论层面对齐「intent 可变但需显式 admit」 |

### 可迁移抽象

1. **Intent Ledger**：会话级结构化记录 `{function, revealed_args, revisions[], switches[]}`——比纯 chat log 更适合做 belief state。
2. **三态转移类型**：reveal / revision / switch 是覆盖真实用户行为的最小生成基；任何「动态意图」评测应至少分解到这三类。
3. **Oracle vs Prompt Recap 诊断**：分离「跟踪意图」与「在正确意图下行动」两个 failure mode——工程上可对应「显式 intent 面板 + 计划重置」。
4. **Transition-count 控制变量**：评测时必须区分「轮次变长」与「意图变次」——否则会把 context length 效应误归因于 intent tracking。
5. **Benchmark lifting 范式**：从 verifiable static task 合成 dynamic dialogue，比手写 multi-turn 便宜且可扩展——可复用到更多域（GUI agent、审批流等）。

Quick test：`intent_construction/intent_extraction/generate.py --dataset gsm8k --num_samples 3`。

---

> 产品落地对照见 [`../../essays/oasis-improvements-2026-08-harness-wave.md`](../../essays/oasis-improvements-2026-08-harness-wave.md)。
