---
title: "OpenForge RL：在真实部署 Harness 里端到端训练 Agent"
category: "长任务智能体"
published: true
excerpt: "微软 OpenForge RL（arXiv 2607.21557）用轻量 Proxy 拦截 harness 的 LLM 调用并重建为 RL 样本， 配合 K8s Orchestrator 在远程容器里跑 ZeroClaw/OpenClaw/Codex 等真实 harness，消除 train-deploy mismatch； OpenForge-GUI 8B 在 OSWorld-Verified 达 37.7，OpenForge-Claw 30B 在 QwenClawBench 达 33.7。 截至 2026-08 官方 GitHub 尚未发布。"
tags: ["long-horizon", "RL", "harness", "orchard", "train-deploy", "microsoft"]
---
# OpenForge RL：在真实部署 Harness 里端到端训练 Agent

> 论文：OpenForge RL: Train Harness-native Agents in Any Environment
> 作者：Xiao Yu, Baolin Peng, Ruize Xu, Hao Zou, Qianhui Wu, Hao Cheng, Wenlin Yao, Nikhil Singh, Zhou Yu, Jianfeng Gao（Columbia / Dartmouth / Microsoft Research）
> arXiv：[2607.21557](https://arxiv.org/abs/2607.21557)（2026-07，ICLR 2027 under review）
> PDF：`content/uploads/papers/openforge-rl.pdf`
> **代码状态**：论文与 [Orchard](https://github.com/microsoft/Orchard) README 已引用 OpenForge RL，但**独立 OpenForge RL 仓库截至 2026-08 尚未公开发布**；训练细节部分依托 Orchard 生态（Orchard Env + veRL）。

## 一、原文精读

### 问题动机

当代 SOTA Agent 的能力越来越来自 **inference harness**——Claude Code、Codex、OpenClaw、ZeroClaw 等 orchestration 层管理多轮交互、工具调用、上下文与 MCP 接入。然而开源 SFT/RL 栈通常假设**简化的单进程 rollout**：固定 chat template、无子 agent、无 harness 特有控制流。

这造成 **train–deploy mismatch（训练–部署失配）**：在简化环境里训出的 policy，部署到真实 harness 时，工具 schema、上下文管理、子 agent 路由、错误恢复语义都可能不同——Orchard 论文已展示：OpenSWE-32B 换到从未见过的 Kimi-CLI harness 时 SWE-bench Verified 从 45.0 崩到 3.6。OpenForge RL 的核心问题是：**能否在 Agent 实际部署的 harness 里做端到端 RL，且与任意 RL 训练后端（如 veRL）解耦？**

### 方法贡献

OpenForge RL 由两个正交组件构成：

**1. Lightweight Proxy（轻量代理）**

- 插入 harness 与推理服务之间，**Serving harness 发起的全部 LLM/VLM 调用**。
- 将请求路由到 RL 框架的 inference engine（训练中的 policy）。
- **记录 io-pair**，在 rollout 结束后重建为 `(s₀,a₀,r₀, …, s_T,a_T,r_T)` 轨迹，供 veRL / slime 等标准 RL codebase 消费。
- 关键性质：**不修改 harness 内部逻辑**——换 harness 只改 sandbox 镜像/启动命令，不改 trainer。

**2. K8s Rollout Orchestrator（编排器）**

- 每个 rollout 在**独立远程容器**中运行（与 Orchard Env 集成）。
- 容器预装目标 harness（OpenClaw、ZeroClaw、Codex、Claude、Pi、OpenCode、Hermes 等）及任务环境（Terminal、Web、Computer Use）。
- 训练与 rollout **物理解耦**：rollout 占 CPU 容器，policy 更新占 GPU 节点——可 scale 0 → 数千并行 sandbox。

整体数据流：

```
Trainer (veRL, GPU)  ←── trajectories ──  Proxy (intercept & collect)
       │                                      ↑
       └── generation requests ──────────────┘
                                              │
                         Orchestrator → Sandbox Pod × N
                                      (真实 Harness + Environment)
```

**数据合成（Claude Agent SDK + Opus 4.6）** 五阶段 pipeline：Propose → Refine → Implement → Verify → Package，并行生成 Claw / GUI 域任务；SFT pool 经 benchmark 去重与流行网站过滤。

**两条 Recipe**：

| Recipe | Backbone | 训练数据 | 评测 harness |
|---|---|---|---|
| **OpenForge-Claw** | Qwen3-30B-A3B-Thinking | ~0.2K–2.6K 合成 Claw 任务 | ZeroClaw / OpenClaw / Codex / ReACT |
| **OpenForge-GUI** | Qwen3-VL-8B | SFT + RL（~2.5K 任务） | 纯 screenshot 输入的 computer-use |

### 实验数字

**OpenForge-Claw（30B-A3B）** — ClawEval / QwenClawBench / MCPAtlas：

| 阶段 | ClawEval pass@3 | QwenClawBench | MCPAtlas |
|---|---:|---:|---:|
| Qwen3-30B-A3B-Thinking 基线 | 39.8 | 21.8 | 12.4 |
| OpenForge-Claw (SFT) | 52.1 | 32.1 | 23.6 |
| **OpenForge-Claw (SFT+RL)** | **55.9** | **33.7** | **28.1** |

对比同量级开源：Qwen3-32B pass@3 31.7 / MCPAtlas 22.5；LLaMA-4-Scout pass@3 16.8。距 Claude Opus 4.6（ClawEval pass@3 80.8）仍有巨大 gap，但 SFT+RL 一致提升。

**Harness 迁移（ClawEval pass@1）** — 训练多 harness vs 单 harness：

| 模型 | ReACT* | ZeroClaw | OpenClaw | Codex |
|---|---:|---:|---:|---:|
| Qwen3-30B-A3B 基线 | 26.1 | 32.5 | 11.4 | 12.2 |
| OpenForge-Claw (SFT+RL, 三 harness 训练) | 45.1 | 48.5 | 20.9 | **32.5** |

单 harness 训练已泛化到未见 harness（ZeroClaw-only → OpenClaw +3.3、Codex +4.6）；**三 harness 联合训练全面最优**，复杂 harness（OpenClaw、Codex）增益最大。

**OpenForge-GUI（8B）** — pass@1：

| 阶段 | OSWorld-Verified | Online-Mind2Web | WebVoyager |
|---|---:|---:|---:|
| Qwen3-VL-8B | 29.4 | 38.7 | 49.2 |
| OpenForge-GUI (SFT) | 34.4 | 57.4 | 61.5 |
| **OpenForge-GUI (SFT+RL)** | **37.7** | **63.0** | **72.3** |

亮点：仅 **2.5K 任务**训练，Online-Mind2Web **63.0** 超过 MolmoWeb-8B（35.3，200K+ 任务）；WebVoyager **72.3** 接近 UI-TARS-1.5-7B（66.4）。论文强调：**在真实 deployment harness 里训练，样本效率显著高于简化栈上的大规模 SFT**。

**RL 行为分析（ClawEval）**：SFT→RL 后，generic shell 工具调用占比下降（22.6% → 13.9%），转向专用 service tools；**self-verification、format robustness、tool coverage、step efficiency** 等行为维度 SFT+RL 全面高于 SFT；**error recovery 仍弱**——RL 主要提升 reliability，非全能。

训练资源：Claw RL ~48H（8×B200 policy + Azure rollout VM）；GUI browser-use ~32–36H。

**Discussion 三章结论（Section 5）** 对 harness 研究有直接指导意义：

- **Q1：哪个 harness 更难学？** Codex / OpenClaw 等多进程、强工具编排的 harness 显著难于 ReACT* 简化栈——同样的 SFT+RL 预算下，复杂 harness 上的绝对分更低，但 RL 相对增益更大。
- **Q2：跨 harness 迁移？** 在 ZeroClaw 上训练已能提升未见 OpenClaw / Codex 表现；三 harness 联合训练是 Pareto 最优——说明 policy 学到的是 partially harness-agnostic 的 agentic skill，而非 memorizing 单一 CLI 语法。
- **Q3：RL 加了什么？** 主要是 **reliability**（self-verification、专用工具覆盖、步数效率），而非 **error recovery**——后者在 SFT+RL 后仍接近随机，暗示需要 failure-centric curriculum 或显式 recovery reward。

Claw 域 RL 超参（Table A1 摘要）：lr 1e-6、batch 8、group 8、KL 0.001、max rollout 900s/step、100 training steps；GUI browser-use lr 1e-6、group 5、KL 0、entropy 0.001。Rollout pod 2–4 CPU / 2–6 GiB RAM——刻意 Small footprint 以提高并发。

### 局限

- **代码未开源**：复现依赖 Orchard Env 自建 K8s 集群与 veRL 集成，门槛高。
- **任务规模小**：Claw ~2.6K、GUI ~2.5K，泛化边界未充分探索。
- **Proxy 假设**：要求 harness 所有 LLM 调用走可拦截 API；本地嵌入式模型或硬编码路径可能漏采。
- **Error recovery 瓶颈**：RL 后仍弱，可能需要 dedicated failure-centric 数据。
- **闭源 SOTA gap**：距 GPT-5.4 / Claude Opus 4.6 在 OSWorld（75.0 / 72.7）仍差一个数量级。
- **成本结构**：每 rollout 一容器，虽比 managed sandbox 便宜（Orchard Env spot 约 0.10×），但 RL 需要海量 rollout，总成本仍可观。

## 二、方法架构解析

### 系统拆解

OpenForge RL 在 Orchard 三层栈中位于 **Recipe 层**，依赖 **Orchard Env** .foundation：

| 层 | 组件 | 职责 |
|---|---|---|
| Recipe | OpenForge RL | Proxy + 数据合成 + veRL 训练循环 |
| Foundation | Orchard Env | K8s sandbox REST API、in-pod agent、网络隔离 |
| Trainer | veRL / slime | Pol