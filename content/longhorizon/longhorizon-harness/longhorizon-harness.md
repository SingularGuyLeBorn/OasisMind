---
title: "LongHorizon-Harness：把长任务执行重构成任务状态管理"
category: "长任务智能体"
published: true
excerpt: "阿里 DreamX 团队提出 LongHorizon-Harness：任务状态显式放在执行之外，只允许用环境独立验证过的事实更新； MEA（Manage-Execute-Audit）循环让 manager 维护状态、fresh-context executor 执行、read-only auditor 验证，审计报告是跨轮唯一记忆。WeaveBench 51.8%→80.7%，OSWorld 2.0 提升 3 倍，跨模型跨 harness 均有效。"
tags: ["long-horizon", "agent", "task-state", "MEA", "审计", "harness"]
---
# LongHorizon-Harness：把长任务执行重构成任务状态管理

> 论文：LongHorizon-Harness: Advancing Long-Horizon Agents for Real-World Tasks
> 作者：Ziyu Ma, Hailang Huang, Shun Zou, Yong Wang, Shidong Yang, Yiming Hu, Fei Wei, XiangXiang Chu（DreamX Team, Alibaba Group）
> arXiv：[2608.01964](https://arxiv.org/abs/2608.01964)（2026-08-03）
> GitHub：[AMAP-ML/LongHorizon-Harness](https://github.com/AMAP-ML/LongHorizon-Harness)
> Website：[lh-harness.pages.dev](https://lh-harness.pages.dev)

## 一、原文精读

### 问题动机

LLM Agent 越来越多地承担 long-horizon 任务：需要持续推理、反复调用工具、在多步相互依赖的步骤中不断修正。但现有 agent harness 存在一个结构性缺陷——**任务执行、任务状态、完成度评估全部堆在一个不断增长的上下文里**。

后果是双重的。其一，状态难以追踪：上下文越长，模型越难区分「已验证事实」与「自我猜测」。其二，错误的自我评估会传播：Agent 自己判断「做完了」，若该判断错了，会污染后续决策，形成典型的 state drift。论文用一句话概括 harness 与模型的分工：**模型决定单轮能做什么，harness 决定工作能否被验证、被保留、并持续推进直到任务真正完成**。

### 方法贡献

论文把 long-horizon 执行重新定义为一个**任务状态管理问题（task-state management problem）**：

- 任务状态**显式地放在执行之外**维护；
- 状态**只允许用从环境独立验证过的事实**来更新；
- Agent 不再「边执行边自我评估」，而是由外部机制客观判定环境里发生了什么。

核心机制是 **Manage-Execute-Audit（MEA）** 三角色循环：

| 角色 | 职责 | 关键点 |
|---|---|---|
| **Manager** | 维护原始目标、已验证进度、下一子任务 | 基于审计事实重新规划，而非凭上下文里的自我感觉 |
| **Executor** | 执行当前子任务 | **全新（fresh）上下文**执行，避免被长历史污染 |
| **Auditor** | 只读验证环境结果 | 检查文件、界面、日志、测试，产出 audit report |

**审计报告（audit report）是跨轮的唯一记忆**。Manager 只依据审计过的事实做下一轮规划——这就切断了「错误自我评估」的传播链。Executor 的原始交互轨迹在每轮结束后丢弃；跨轮持久化的只有 task state 与 audit reports。

论文还提出轻量 **AgentAdapter**：在不修改原生 agent loop 的前提下，可插拔互换模型与 harness 后端（Claude Code、Codex 等），且 Manager / Executor / Auditor 可分别配置不同模型或后端，以平衡质量、速度与成本。GUI 交互通过外部 computer-use MCP 提供，harness 本身不捆绑特定实现。

### 实验数字

同一 backbone（Qwen 3.7-Plus）+ 同一执行后端（Claude Code）对比：

| 基准 | 指标 | 基线 | LongHorizon-Harness | 提升 |
|---|---|---:|---:|---|
| WeaveBench（114 任务） | PassRate | 51.8% | **80.7%** | +28.9 pt |
| WeaveBench | Overall | 0.702 | **0.835** | +0.133 |
| OSWorld 2.0（108 任务） | Binary | 2.8% | **8.3%** | **3.0×** |
| OSWorld 2.0 | Partial | 21.5% | **35.2%** | +13.7 pt |
| Terminal-Bench 2.1 | Success rate | 69.7% | **77.2%** | +7.5 pt |

跨模型迁移：Claude Opus 4.7 在 OSWorld 2.0 34 任务子集上，binary 从 20.0% → **34.3%**，partial 从 55.8% → **66.9%**。Codex + GPT-5.6 Luna 在 Terminal-Bench 2.1 上达 **83.1%**。

Token 分解显示 Manager 仅占 WeaveBench / OSWorld / Terminal-Bench 总 token 的 2.8% / 8.1% / 2.0%，Auditor 占 19.4% / 24.8% / 38.1%——**独立验证是主要额外成本**，但 Terminal-Bench 上总 token 反而减少 24% 且成功率更高，说明框架不施加固定 token 倍数，而取决于底层模型需要多少执行与恢复轮次。

WeaveBench 覆盖 14 类真实任务域（Web 前端、数据分析、运维调试、设计、游戏、文档、空间推理、桌面设置、科研教育、创意生产、工程计算、个人服务、行政合规、商业金融、医疗等），八个子域 PassRate 全面提升，增益不集中在单一类别。

### 局限

- **绝对成功率仍低**：OSWorld 2.0 binary 8.3% 说明全桌面长任务远未解决；harness 是倍增器而非银弹。
- **审计开销**：每轮一次环境验证，Auditor token 可达总量近四成；复杂 GUI 任务成本显著上升（Qwen 3.7-Plus 在 OSWorld 上 output token 从 28.9K → 104K）。
- **跨轮记忆压缩**：只留 audit report 可能丢失 Executor 轨迹中的细微上下文；Manager 规划能力本身仍有上限。
- **工程依赖**：需要可用的 computer-use MCP、CLI agent 运行时（claude / codex）、以及 per-run 隔离目录与 Dashboard 等人机协同设施。
- **训练无关**：纯推理期 harness 改造，不改模型权重；与 RL 训练 agent 的上限仍由 backbone 决定。

## 二、方法架构解析

### 系统拆解

LongHorizon-Harness 的单轮数据流可形式化为：

1. Manager 读取 task state \(S_i\) 与累积 audit reports \(V_{i-1}\)，构造**有界子任务合约** \(c_i\)（目标、验收标准、边界约束、相关先验证据）；也可走 ask 路由请求用户信息或授权。
2. Fresh-context Executor 在预算内（默认 1800s/轮）执行 \(c_i\)，将环境从 \(e_{i-1}\) 变为 \(e_i\)，返回 execution report \(o_i\)；原始轨迹随后丢弃。
3. Read-only Auditor（默认 300s/轮）通过只读工具检查 \(e_i\)，产出 audit report \(v_i\)。
4. Manager 将 \(v_i\) 并入 \(S_{i+1}\)，判定是否满足原任务、是否还有可推进子任务、是否需要用户输入，或是否耗尽 round budget（默认 \(N_{\max}=25\)）。

每轮 run 落盘于 `runs/<run-id>/`：task state、event stream、audit reports、三角色 trajectories、workspace 产物、final report——使进度可检查、可恢复、可复现。

```
用户任务 T
    │
    ▼
┌──────────────────────────────────────┐
│  Manager：S_i + V_{i-1} → 子任务 c_i │
└──────────────┬───────────────────────┘
               ▼
┌──────────────────────────────────────┐
│  Executor（fresh context）：e_{i-1}→e_i │
└──────────────┬───────────────────────┘
               ▼
┌──────────────────────────────────────┐
│  Auditor（read-only）：环境 → v_i     │
└──────────────┬───────────────────────┘
               ▼
        Manager 更新 S_{i+1}
               │
               └── 循环直至完成 / 阻塞 / 预算耗尽
```

### 关键不变量

1. **状态外置**：task state 不在 Executor 上下文里「顺便维护」，而是 harness 层的显式记录。
2. **验证先于提交**：只有经 Auditor 独立确认的事实才能进入持久 task state；LLM 自评不算数。
3. **跨轮记忆单调**：跨轮唯一合法记忆通道是 audit report 链；Executor 历史不跨轮泄漏。
4. **子任务有界**：每轮只执行一个明确定义的 subtask contract，避免「一个会话干到底」。
5. **后端可替换**：AgentAdapter 保证换模型/换 harness 不改 MEA 语义。

### 相邻对照

| 路线 | 核心手段 | 与 LongHorizon-Harness 的关系 |
|---|---|---|
| 上下文压缩（CompactionRL、Self-Compacting 等） | 在单会话内摘要/删历史 | 仍假设「一个 growing context」；LH-Harness 直接拆会话 |
| Reflexion / 反思循环 | 模型读自己的失败反思 | 反思仍可能自洽地错；LH-Harness 要求环境客观证据 |
| Verifier / RLVR | 训练期学验证 | LH-Harness 是推理期 harness，可与 verifier 训练互补 |
| Orchard / OpenForge | 训练期在真实 harness 里 rollout | 解决 train-deploy mismatch；LH-Harness 专注部署期状态管理 |
| Argus | 四角色 + verification-gated 状态进化 | 更重的 campaign 级 runtime；MEA 是 lighter 的三角色审计环 |

### 可迁移抽象

无论是否采用 LH-Harness 代码，以下抽象可直接迁移到任意 long-horizon agent 系统：

1. **Audited State Transition**：每一轮推进 = 「规划 → 执行 → 审计 → 状态提交」，而非「执行 → 自我感觉完成」。
2. **Fresh Context Executor**：执行层每轮 blank slate，规划层靠结构化 state 而非 raw chat log。
3. **Subtask Contract**：子任务必须带 acceptance criteria，Auditor 可机械对照。
4. **Single Source of Cross-Round Memory**：明确指定「什么可以跨轮」——通常是 verified facts，不是 model narrative。
5. **Role Budget Split**：Manager 便宜、Auditor 中等、Executor 昂贵——架构上允许按角色分配模型档位。

CLI 入口：`uv tool install lh-harness` → `lh-harness init` → `lh-harness run --task @task.md --dashboard`。评测复现见 repo 内 `eval/WeaveBench-harness/` 与 `eval/OSWorldv2-harness/`。

---

> 产品落地对照见 [`../../essays/oasis-improvements-2026-08-harness-wave.md`](../../essays/oasis-improvements-2026-08-harness-wave.md)。
