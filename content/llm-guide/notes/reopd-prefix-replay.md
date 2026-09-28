---
title: "ReOPD：多轮 On-Policy 蒸馏与 Prefix Replay"
category: "蒸馏与 Agent 训练"
published: true
excerpt: "ReOPD（arXiv:2607.04763）用教师轨迹前缀回放替代学生训练时的环境交互：逐步衰减采样 κ=0.6 缓解 prefix trap 的双侧分布偏移，在数学与搜索 Agent 上匹配或超越在线 OPD，且学生训练零 tool call、rollout 快 4–9×。"
tags: ["OPD", "蒸馏", "ReOPD", "prefix replay", "多轮 Agent", "Qwen3"]
---
# ReOPD：多轮 On-Policy 蒸馏与 Prefix Replay

> **论文**：*Multi-Turn On-Policy Distillation with Prefix Replay*（Baohao Liao 等，Microsoft Research + University of Amsterdam，arXiv:2607.04763，2026-07）
> **PDF**：[reopd-prefix-replay.pdf](../../uploads/papers/reopd-prefix-replay.pdf)
> **代码**：[BaohaoLiao/ReOPD](https://github.com/BaohaoLiao/ReOPD) ｜ README：[ReOPD.md](../../uploads/github-readme/ReOPD.md)
> **数据/模型**：[Hugging Face Collection baohao/reopd](https://huggingface.co/collections/baohao/reopd)

## 原文精读

### 问题背景

强化学习（GRPO/PPO + 可验证奖励）是当前 LLM 推理与工具 Agent 的主路径，但 RL 监督稀疏——整段 episode 往往只有一个标量奖励，对小模型尤其样本低效。知识蒸馏提供更稠密的 per-token 监督，但传统 off-policy 蒸馏让学生模仿**教师走过的前缀**；推理时学生一旦早期犯错，会进入训练未见过的历史，错误逐步复合（covariate shift / exposure bias）。

On-Policy Distillation（OPD）在**学生自己采样的前缀**上查询教师条件分布，兼顾 on-policy 相关性与教师监督密度。该思路在单轮生成已较成熟，但 Agent 任务是多轮交互：每步历史 \(H_t = (O_1,A_1,\ldots,A_{t-1},O_t)\) 由策略与环境共同诱导 occupancy \(d_{\pi,\mathcal{E}}^t\)。完全在线的多轮 OPD 代价极高——每次更新都要让学生重新 rollout 环境，并在每个访问历史上查询教师。

### ReOPD 核心做法

**Replayed-Prefix On-Policy Distillation（ReOPD）** 把环境交互「离线化」：

1. **前缀池**：教师 Agent 经 RL（如 GRPO）训练时，rollout 轨迹天然落盘（`rollout_debug/`），无需额外环境成本。
2. **回放训练**：学生不再连环境；从池中取教师强制前缀 \(H_t\)，学生在**被监督步**自己生成动作，教师仍提供该步 dense 目标。
3. **逐步衰减采样**：数据处理时用 \(p_t \propto \kappa^t\)（默认 \(\kappa=0.6\)）偏向早期、低偏移前缀；**损失形式不变**，只改采样分布。

相对在线 OPD baseline（ReTool 数学 / Search-R1 搜索），ReOPD 每样本 **1 轮学生生成、0 次 tool call**（OPD 最多 16 轮/16 次工具调用），rollout 时间约 **4–9×** 更快，准确率匹配或更好。

### Prefix Trap（前缀陷阱）

论文把多轮 OPD 的难点形式化为**双侧分布偏移**：

| 偏移方向 | 含义 | 后果 |
|---|---|---|
| **Student occupancy shift** | 前缀越「学生 on-policy」，越贴近学生真实会遇到的历史 | 相关性强 |
| **Teacher reliability shift** | 前缀越偏离教师可靠支持域，教师条件 \(\pi_T(\cdot\mid x,h_t)\) 越不可信 | 监督噪声大 |

理想目标 \(\mathcal{R}^\star\) 应在学生 occupancy \(d_{\theta_{\text{old}}}^t\) 上评估，但离线池来自教师 occupancy \(d_T^t\)。完全 student-on-policy 提高相关性，却可能把教师问到「它自己也撑不住」的历史上——这就是 **prefix trap**：时序上错误复合 + 分布上 relevance vs reliability 拉扯。

理论分解把与理想目标的 gap 拆成 occupancy mismatch 与 teacher reliability 两项，说明「越 on-policy 越好」在多轮设置下**不自动成立**。

### 实验结论（论文 + 开源 README）

- **环境**：ReTool 数学（Python sandbox）、Search-R1 检索 QA；教师/学生覆盖 Qwen3-4B / 8B / 30B-A3B 多组配对。
- **流程四阶段**：Cold Start SFT → Teacher GRPO（产出前缀池）→ ReOPD / OPD 蒸馏 → 评测（AIME、MATH500、7 套 QA 等）。
- **多环境合并**：各域教师轨迹分别采集后 merge 为一个 pool，学生联合蒸馏，**无需同时在线部署全部环境**——运维复杂度显著低于在线 OPD（Figure 3）。
- **Regime 分析**：教师–学生 gap 大时（数学），ReOPD 常优于 OPD；教师在学生历史上已可靠时（搜索 QA），ReOPD 与 OPD 基本持平。

## 方法/架构解析

### 训练管线（工程视角）

ReOPD 开源实现基于 [slime](https://github.com/THUDM/slime) + SGLang + Megatron，仓库按 **data / train / eval / scripts** 分层：

```text
Teacher GRPO  →  rollout_debug/（前缀池原料）
      ↓
build_prefix_pool_math.py  →  math_prefix_pool.jsonl（ω(t;κ)=κ^t 采样）
      ↓
reopd_math.sh  →  学生 1 turn / 0 tool call 蒸馏
      ↓
scripts/eval/math.sh  →  Harbor 式批量评测
```

与 OPD 脚本的关键 hyper 差异（README 明示）：

| 维度 | ReOPD | 在线 OPD |
|---|---|---|
| 学生 turns/sample | 1 | 最多 16 |
| Tool calls | **0** | 最多 16 |
| Prompt 数据 | 前缀池 JSONL | RL 原始 prompts |
| 教师 serving | mem 0.8, 256 in-flight | mem 0.85, 128 in-flight |

**前缀池可下载**：如 `Math_Qwen3-8B_SFT-RL_Prefix`（53,762 行），跳过 Stage 2 采集直接 Stage 3 蒸馏。

### κ=0.6 的设计含义

Step-decay 是 **reliability-aware prefix distribution** 的极简实现：早期步历史更接近教师可靠区、student shift 较小，赋予更高采样权重；后期步 compound error 与 teacher mismatch 更大，降权但不从损失中删除——等价于在教师池 occupancy 与理想 student occupancy 之间做**几何桥接**。

实现上在 `data/build_prefix_pool_*.py` 完成，过滤规则见 `data/README.md`；**不改 distillation loss**，只改「哪些 \((x,h_t)\) 更常出现在 batch 里」。

### 与 RL / off-policy SFT 的定位

- **相对 RL**：保留 dense teacher conditional，避开 sparse reward 样本效率问题；与 GRPO 正交——ReOPD 甚至**复用 GRPO 教师 rollout** 当前缀池。
- **相对 SFT on teacher trace**：学生在监督步仍 on-policy 生成动作，而非整段模仿教师；缓解 off-policy exposure bias。
- **相对在线 OPD**：用 prefix replay 换 environment + multi-turn rollout 成本；适合工具重、环境异构、算力紧的 Agent 蒸馏场景。

### 对 Agent 训练系统的启示

1. **轨迹是资产**：教师 RL 的 rollout 不应只服务 RL loss，应结构化入库为可复用 prefix pool（含 observation/action 全链路）。
2. **多轮蒸馏的首类设计变量是 prefix 分布**，不是单纯换 divergence 或 loss。
3. **Zero tool call 训练**意味着学生阶段可在纯 GPU 集群完成，环境/API 只在教师阶段或评测阶段出现——利于规模化与成本核算。

---

> 见微改进对照见 [OasisMind 2026-08 Harness 波改进清单](../../essays/oasis-improvements-2026-08-harness-wave.md)。
