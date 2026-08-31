---
title: RSIBench-Data：数据中心的 RSI 评测与反馈不可靠性
category: RSI 评测
published: false
excerpt: >-
  RSIBench-Data（arXiv:2607.25886）在固定 Tinker LoRA + Harbor/E2B 后训练栈下评测 LLM
  作为数据-centric 研究员：58.33% 设置首次有效尝试后可改进，但继续搜索后 78.26% 最终以更低分 checkpoint 收官——揭示
  discovery–reliability gap。
tags:
  - RSI
  - RSIBench
  - 数据合成
  - 后训练
  - Harbor
  - Evolvent
---
# RSIBench-Data：数据-centric RSI 评测与反馈不一致性

> **论文**：*RSIBench-Data: Benchmarking Data-Centric Research for Recursive Self-Improvement*（Evolvent AI，arXiv:2607.25886，2026-07）
> **PDF**：[rsibench-data.pdf](../../uploads/papers/rsibench-data.pdf)
> **代码**：[evolvent-ai/RSIBench-Data](https://github.com/evolvent-ai/RSIBench-Data) ｜ README：[RSIBench-Data.md](../../uploads/github-readme/RSIBench-Data.md)
> **站点**：[rsibench.co](http://rsibench.co)

## 原文精读

### 研究问题

递归自我改进（RSI）的一条关键路径是：**把模型失败证据转化为更好的训练数据**。这要求 agent 像「数据-centric 研究员」一样——诊断能力缺口、设计/验证合成数据策略、从 checkpoint 反馈中学习。现有 benchmark 往往把**研究决策**与优化器、Serving、评测基础设施、系统工程缠在一起，难以隔离「agent 会不会做数据研究」。

RSIBench-Data 的命题是：在**固定后训练栈**下，LLM agent 能否在预算内迭代改进 `train_messages.jsonl`，从而提升固定 target model 在官方 benchmark 上的分数？

### 受控实验设计

**固定不变的部分**（agent 不能改）：

- **Target model**：默认 `Qwen/Qwen3.5-35B-A3B-Base`
- **训练**：Tinker LoRA SFT（rank/steps/超参由 `run_config.json` 约束，评测相关 hyper 锁定）
- **评测**：Harbor agent + E2B 云沙箱（无本地 Docker）；每 attempt 独立起 proxy + per-task sandbox
- **预算**：墙钟 `WALL_TIME_BUDGET_SEC` + Tinker 美元预算 `TINKER_COST_BUDGET_USD` 双帽

**Agent 可控的部分**：

- 诊断 benchmark 失败模式（可读 base run 诊断目录，但**禁止**从评测集 distill 训练行）
- 调用 seed factories（SWE-smith、SWE-Gym、synthetic-data-kit 等）设计新数据
- 多次 `run_attempt.sh` → `final_submit.sh` 选 checkpoint

**Orchestrator harness**：同一 workspace 契约支持 Claude Code、Codex、Kimi Code——隔离的是「谁写脚本驱动 loop」，不是换评测标准。

### 六个 Benchmark Profile

| Profile | 任务形态 | Harbor agent | 规模 |
|---|---|---|---|
| swe-bench-verified / multilingual / pro | 代码修复 | mini-swe-agent | 100 tasks |
| terminal-bench-2 | 终端操作 | terminus-2 | 89 tasks |
| gpqa-diamond | 科学 QA | terminus-2 | 100 tasks |
| aime | 数学 | terminus-2 | 30 tasks × 4 attempts |

每个 profile 在 `benchmarks/*/spec.json` 固定 prompt、seed factory 白名单、官方 eval shape。

### 核心发现：Discovery–Reliability Gap

论文在四款 frontier agent × 六套 benchmark 上得到：

1. **有发现能力**：**58.33%** 的设置里，agent 在**第一次有效 attempt 之后**还能靠反馈 refine 数据策略并涨分——说明「读 eval → 改数据 → 再训」闭环并非完全不会。
2. **反馈不一致（feedback inconsistency）**：在**已经达到历史最佳分数后仍继续搜索**的 run 中，**78.26%** 以**更低分**的 final attempt 结束，其余仅**回到同一峰值**——几乎没有稳定「越搜越好」的单调改进。
3. **无全能冠军**：Codex gpt-5.6 在非 SWE 三榜领先，但三个 SWE 风格任务分别由三个不同 agent 夺冠——能力高度 task-dependent。
4. **Historical-best selection 只是补丁**：提交时选历史最优 checkpoint 可保护最终分数，但**不意味着研究过程本身可靠 progressive**。

轨迹分析归纳四类失败模式：误诊断目标能力、合成 misaligned supervision、越过 strong checkpoint 继续瞎搜、**无法把新 feedback 翻译成更强数据策略**。

## 方法/架构解析

### Session 合约（Agent 可见 API）

Runner 生成 agent workspace，暴露四个 shell 命令：

```text
timer.sh              # 剩余墙钟
budget_status.sh      # 已承诺 Tinker 成本 + 在途 attempt 估计
run_attempt.sh <id>   # 校验 → LoRA 训练 → Harbor 全量 eval
final_submit.sh <id>  # 锁定官方复评 checkpoint
```

每次 attempt 必交：

```text
attempts/<id>/train_messages.jsonl   # 至少 1 user + 1 可训练 assistant 消息
attempts/<id>/run_config.json        # 可选；未知 key 拒绝
```

训练前跑与 `check_environment.sh` 等价的 preflight，写 `tinker_preflight_estimate.json`，避免预算烧在坏环境上。

**Deadline 安全规则**（写进 prompt 合约）：末 2 小时不启动更重 attempt；末 1 小时有 completed attempt 则立即 `final_submit`；禁止 background duplicate attempt。

### 评测运行时架构

```text
Agent harness (Claude/Codex/Kimi)
    → train_messages.jsonl
    → Tinker LoRA  →  tinker://.../sampler_weights/...
    → E2B proxy sandbox (SamplingClient)
    → Harbor per-task sandboxes
    → harbor/jobs/*/result.json + tinker_cost_estimate.json
```

评测 hyper（context cap、decoding、step limit）**attempt 级不可篡改**——agent 只能在数据内容与可训步数/record 数等「研究旋钮」上探索。

### 与 RSI 文献的对位

RSIBench-Data 测的是 RSI 阶梯中较「地面」的一层：**不改进模型架构/optimizer，只改进 post-training 数据**。它把 Anthropic AAR、OpenAI 自动化研究叙事里「AI 做 AI 研究」拆成可审计子问题——

- **Discovery**：能否提出有效 hypothesis + 数据配方？
- **Reliability**：能否在多次反馈后**稳定**超越早期 peak？

当前答案是：**能偶然发现，但不能可靠累积**——这对「数据 agent 驱动 RSI」是硬负结果：没有 process-level verifier / checkpoint 保护策略 / 单调改进约束，闭环容易 regress。

### 工程可复用点

1. **Benchmark 集与训练集硬隔离** + base run 只读诊断——防 reward hacking 的范式值得其他 RSI eval 借鉴。
2. **双预算（时间+美元）+ 全量 artifact 留存**（Harbor trajectory、API usage JSONL）使「研究过程」可 replay，而非只看 leaderboard 分数。
3. **Harness 无关的 workspace 契约**让 Claude/Codex/Kimi 可比，聚焦 agent 能力而非 CLI 细节。

### 与「只测 SWE agent」benchmark 的差异

SWE-bench 类榜单默认 agent 同时决定**用什么数据训、用什么 infra、用什么 eval**——高分者可能是系统工程强者而非数据科学家。RSIBench-Data 刻意把 Tinker train、Harbor eval、E2B sandbox、LoRA rank 上限等**全部锁死**，迫使 agent 在 `train_messages.jsonl` 的内容与课程设计上竞争。这更接近 RSI 链条里「模型失败 → 诊断 → 合成数据 → 再训」的真实子问题，也更容易做 cross-agent 横向对比。

### 强 run 的四条轨迹模式（论文归纳）

| 模式 | 含义 |
|---|---|
| Accurate hypotheses | 对 benchmark 失败原因判断准确，而非拍脑袋加通用 CoT |
| Validation-grounded supervision | 合成样本经小型验证/格式检查后再进 train set |
| Behavior-aligned data | 数据分布对齐 target agent 在 Harbor 上的实际行为缺口 |
| Preserve strong checkpoints | 发现 peak 后及时 submit 或保守探索，而非无限加步数 |

当前 frontier agent 往往只做对其中一两条，解释了「偶尔 peak、经常 regress」的统计结果。

---

> 见微改进对照见 [OasisMind 2026-08 Harness 波改进清单](../../essays/oasis-improvements-2026-08-harness-wave.md)。
