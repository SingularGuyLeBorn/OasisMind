---
title: "Code as Agent Harness：代码作为 Agent 基础设施的三层综述"
category: "Agent Harness"
published: true
excerpt: "arXiv:2605.18747 综述约 197 篇工作，提出 code as agent harness：代码不再只是输出，而是推理、行动、环境建模与可执行验证的操作基底；三层为 interface / mechanisms / scaling。"
tags: ["Agent Harness", "代码 Agent", "综述", "多 Agent", "可验证执行"]
---
# Code as Agent Harness：代码作为 Agent 基础设施的三层综述

> **论文**：*Code as Agent Harness: Toward Executable, Verifiable, and Stateful Agent Systems*（arXiv:2605.18747，2026-05）
> **PDF**：[arXiv:2605.18747](https://arxiv.org/pdf/2605.18747)

## 原文精读

### 核心论断

LLM 已强到能写竞赛级程序与仓库级补丁，但在 **agentic 系统**里，代码的角色正在变：它不只是**生成目标（target output）**， increasingly 充当**操作基底（operational substrate）**——承载推理、行动、环境建模与 execution-based verification。

作者用 **agent harness** 镜头统一这一趋势，提出 **code as agent harness**：以代码为中心构建可执行、可验证、有状态的 Agent 系统，并据此综述约 **197** 篇代表性工作。

### 三层 taxonomy（全文组织轴）

#### Layer 1 — Harness Interface（接口层）

回答：代码如何把 Agent 接到三大基本功能？

| 接口 | 代码的角色 | 典型机制 |
|---|---|---|
| **Reasoning** | 思维链/程序即推理 | CoT-as-code、过程奖励、中间结果可检查 |
| **Acting** | 生成程序即策略 | Code-as-action、API 调用脚本、可复用 skill |
| **Environment Modeling** | 状态/动力学/反馈的形式化 | 模拟器、单元测试套件、GUI/OS 状态机 |

接口层的共同点是：把「模型想说的话」变成**可运行、可 diff、可回归**的对象，而不是纯自然语言承诺。

#### Layer 2 — Harness Mechanisms（机制层）

在 long-horizon 执行中，harness 需要 sustained 能力。综述归纳为：

- **Planning**：意图分解为结构化计划；「plan as program / contract」——计划本身可解析、可验证。
- **Memory**：跨轮状态保留、多 Agent 共享记忆、**context compaction & state offloading**（与 long-horizon 压缩论文线直接对话）。
- **Tool Use**：函数式工具、环境交互工具、**verification-driven** 工具（测试/ linter / sandbox 回传）、工作流编排工具。
- **Plan–Execute–Verify 控制环**：从「调试代码 bug」推广到 **harness-level control**——沙箱执行、权限化状态转移、确定性 sensor 验证。
- **Adaptive Harness Optimization**：深度 telemetry 作优化底稿；**Evolution Agent** 在治理约束下 mutate harness（prompt/tool/workflow），使系统自我改进但可审计。

机制层强调：可靠 long-horizon 不靠「更长 context」，而靠**显式状态 + 可重复验证闭环**。

#### Layer 3 — Scaling the Harness（扩展层）

从单 Agent 到协作生态：共享 **code artifacts**（repo、测试、trace、结构化中间件）成为多 Agent 的**公共工作区**。

- **角色分化**：manager / planner / coder / reviewer / tester
- **交互模式**：pair programming、repair、debate、red-teaming、adversarial
- **拓扑**：中心化编排 vs 分布式/流式协作（AutoGen、MetaGPT、Self-Collaboration 等）
- **状态收敛**：test-gated merge、consensus on correctness

代码在这里是**协调与验真的 lingua franca**——比自然语言更利于 diff、CI 与权限边界。

### 应用域与开放挑战（原文 outline）

横跨 coding assistant、GUI/OS automation、embodied agent、科学发现、个性化推荐、DevOps、企业工作流。

开放问题包括：超越终局任务成功的 harness 评测、不完整反馈下的 verification、**回归-free 的 harness 改进**、多 Agent 一致共享状态、安全关键动作的人类监督、多模态环境扩展。

## 方法/架构解析

### 与「Chat Agent」范式的差异

传统 Chat = 单会话文本状态机；**code harness** = 外部可观测状态（文件、测试、进程、repo）+ LLM 提议转移 + 确定性验证器裁决。综述实质是在说：**Agent 可靠性边界由 harness 工程决定，不由单次 sampling 决定**。

这与 LongHorizon-Harness（MEA 循环）、Polaris（deterministic crawl + LLM judgement 分流）等同属 2026 年长任务/agent 系统文献簇，但 **2605.18747** 更偏**概念收拢与家谱**，给出跨域 vocabulary。

### 三层之间的依赖关系

```text
Interface（代码接 reasoning/action/env）
    ↓ 需要
Mechanisms（plan/memory/tool/verify 维持长程）
    ↓ 扩展到
Scaling（repo 级共享工件 + 多角色编排）
```

读综述时可按「你的系统缺哪层」定位文献：只做 tool call API 属于 interface 子集；没有 verify loop 则 mechanisms 不完整；多 Agent 无共享 test/state 则 scaling 层悬空。

### 对 Harness 工程 checklist 的提炼

1. **Executable**：关键决策是否落到可运行 artifact？（脚本、测试、配置）
2. **Verifiable**：是否有 deterministic sensor 独立于 LLM 自评？（测试、类型检查、环境 diff）
3. **Stateful**：状态是否在 context 外显式持久？（DB、文件、task state store）
4. **Regression-safe**：harness 自我修改是否 gated？（telemetry + governed mutation）
5. **Multi-agent ready**：共享工件是否 versioned、可 review？

### 与 KnowPilot / OasisMind 语境的轻量对照

见微/OasisMind 的 Chat store 不变量、审批 scope、SessionStreamHub——本质是在 web product 里实现 mechanisms 层的 **plan–execute–verify + 推送式状态**；本综述提供的是跨论文的**命名与分层坐标系**，便于把 longhorizon、RSI、coding agent 文献挂到同一棵树上。

### Mechanisms 层子题（便于按图索骥）

综述在 mechanisms 层进一步细分子题，读原文时可按需求跳转：

- **Memory**：单 Agent 工作记忆、多 Agent 共享记忆、**context compaction & state offloading**（与 CompactionRL、LongHorizon-Harness 等 2026 文献直接对话）。
- **Tool Use 四分**：function-oriented（API）、environment-interaction（shell/GUI）、verification-driven（测试/linter）、workflow-orchestration（DAG/CI）。
- **Plan–Execute–Verify**：planning as contract formation；sandboxed execution + permissioned state transition；verification through deterministic sensors。
- **Adaptive Harness Optimization**：deep telemetry → evolution agent → **governed mutation**（防 harness 自我修改引入 silent regression）。

### Scaling 层的协作拓扑

多 Agent 并非「更多 chat 窗口」，而是共享 **repo / test suite / trace** 作为 ground truth。综述列举的 workflow topology 包括：中心化 coordinator、分布式 peer、streaming 协作；状态收敛机制包括 test-gated merge 与 consensus。MetaGPT、AutoGen、Self-Collaboration 等被归入「code 作共享 harness」案例——值得与 Polaris 六阶段流水线、Stanford CS329A Mod 4「可逆性」对照阅读。

从工程落地角度，**code harness** 回答的是：当 Agent 声称「我已经改好了」时，系统能否用 git diff、CI 红灯、property test 独立反驳？综述把这一需求从 coding agent 推广到 GUI/OS/embodied/scientific 全谱，强调 **harness 是可版本化的软件制品**，而非 prompt 里的软约束。开放挑战里的「regression-free harness improvement」尤其值得 RSI 读者关注：自动化改 prompt/tool 若无 golden trace 回归，等价于在未验证状态下 mutate 生产配置。

---

> 见微改进对照见 [OasisMind 2026-08 Harness 波改进清单](../../essays/oasis-improvements-2026-08-harness-wave.md)。
