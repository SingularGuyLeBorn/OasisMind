---
title: "Long-Horizon 上下文管理论文合集（2026 年中 7 篇）"
category: "长任务智能体"
published: true
excerpt: "2026 年 5-7 月 Long-Horizon Agent 上下文压缩/管理方向的 7 篇论文合集：CompactionRL、Parallel Context Compaction、AdaCoM、Less Context Better Agents、Plans Don't Persist、Self-Compacting Agents、PRO-LONG，逐篇拆解动机与方法。"
tags: ["long-horizon", "上下文压缩", "上下文管理", "RL", "程序化记忆", "论文合集"]
---
# Long-Horizon 上下文管理论文合集（2026 年中 7 篇）

> 来源：用户收藏的合集帖（小红书/微博截图，作者 Eugene）。收录 2026 年 5-7 月 Long-Horizon Agent 上下文压缩/管理方向的 7 篇论文。按「动机 → 方法」两栏整理。

## 1. CompactionRL: Reinforcement Learning with Context Compaction for Long-Horizon Agents

- 机构：清华大学（Yujiang Li、Zhenyu Hou、Yi Jing、Jie Tang、Yuxiao Dong），2026.07
- **动机**：长程轨迹容易超出上下文窗口，而传统压缩通常独立于 Agent 训练，摘要质量与任务目标并不一致。
- **方法**：将任务执行与上下文摘要纳入同一 RL 轨迹，通过 token-level loss normalization 和跨轨迹 GAE 联合学习行动、压缩及压缩后的继续推理。

## 2. Parallel Context Compaction for Long-Horizon LLM Agent Serving

- 时间：2026.05
- **动机**：单次全局摘要会阻塞 Agent 推理，延迟高且摘要长度难以控制。
- **方法**：将历史划分为多个区块并行摘要，使系统能够控制各区块的压缩量，在保持信息的同时降低端到端延迟。

## 3. AdaCoM: Learning Agent-Compatible Context Management

- 时间：2026.05
- **动机**：固定压缩策略难以适配不同能力的 Agent，且无法训练闭源模型。
- **方法**：训练外部 Context Manager，在冻结 Agent 的情况下通过 RL 学习保留、删除和改写历史，并根据 Agent 能力调整压缩强度。

## 4. Less Context, Better Agents

- 时间：2026.06
- **动机**：企业工具返回内容冗长，全量保留会造成上下文溢出、状态过期和高推理成本。
- **方法**：仅保留最近若干轮高价值工具交互，并对更早历史进行摘要，以同时提升任务成功率和 token 效率。

## 5. Plans Don't Persist

- 时间：2026.06
- **动机**：压缩方法通常假设模型已将早期计划内化，但该假设缺少验证。
- **方法**：通过 replay pairing、隐藏状态距离和 probe，对比保留与删除计划的轨迹，发现计划主要依赖显式上下文，直接删除会明显损害任务表现。

## 6. Self-Compacting Language Model Agents

- 时间：2026.06
- **动机**：固定 token 预算下，外部压缩容易误触上下文摘要。
- **方法**：提供 compaction tool 和轻量 rubric，让 Agent 在子任务完成或搜索收敛时自主压缩，无需微调或额外监督。

## 7. PRO-LONG: Programmatic Memory Enables Long-Horizon Reasoning

- 时间：2026.07
- **动机**：自然语言摘要存在不可逆的信息损失，而完整历史又难以直接检索。
- **方法**：保存完整、结构化的交互日志，让 Coding Agent 编写程序搜索和读取历史，实现低成本、按需访问的程序化记忆。

## 横向观察

- **压缩时机的两条路线**：外部统一压缩（1/2/3/4）vs Agent 自主压缩（6/7）。
- **与训练耦合的探索**：CompactionRL 把压缩学进 RL 轨迹，AdaCoM 用外部 RL 训练 Context Manager，都是「摘要质量对齐任务目标」的尝试。
- **记忆形式之争**：自然语言摘要（1/2/3/4/6）vs 完整结构化日志 + 程序化检索（PRO-LONG）——信息损失与检索成本的权衡。
- **实证提醒**：Plans Don't Persist 表明「压缩会损害计划保持」并非杞人忧天，压缩策略需要显式保留计划类信息。

## 关联阅读

- 本库《LongHorizon-Harness》——任务状态外置 + 审计报告作为跨轮唯一记忆，属于同一问题的另一种解法（状态管理而非上下文压缩）。
