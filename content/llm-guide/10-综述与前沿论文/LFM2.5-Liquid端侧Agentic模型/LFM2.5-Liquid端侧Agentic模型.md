---
title: "LFM2.5-2.6B：Liquid AI 端侧 Agentic 模型"
category: "小模型 · Agentic"
published: true
excerpt: "Liquid AI LFM2.5-2.6B：2.6B 参数端侧 agentic 模型，128K 上下文、34T tokens 预训练；四阶段后训练含 Pi/Hermes/OpenClaw harness 上 GRPO+LLM-judge；llama.cpp/MLX/vLLM/SGLang 生态即装。"
tags: ["Liquid AI", "LFM2.5", "端侧模型", "agentic", "GRPO"]
---
# LFM2.5-2.6B：Liquid AI 端侧 Agentic 模型

> **模型**：[LFM2.5-2.6B](https://huggingface.co/LiquidAI/LFM2.5-2.6B) / Base 变体（Hugging Face）
> **许可**：LFM2 open-weight license
> **文档**：docs.liquid.ai

## 原文精读

LFM2.5-2.6B 定位 **完全设备端** agentic：规划、工具调用、多步任务可在手机/笔记本/PC/机器人本地完成——**数据不出设备、边际成本≈0**。

关键规格：

- 预训练 ~**34T tokens**；LFM2.5 hybrid 架构
- **128K** 上下文；128K 词表
- 优化 decode/prefill/内存，主打 **balanced intelligence per watt**
- 推理栈：llama.cpp、MLX、vLLM、SGLang、ONNX；AMD/Qualcomm/Apple/NVIDIA/Intel

**四阶段后训练**：

1. SFT
2. Expert specialization
3. 多域 on-policy 蒸馏
4. **Agentic RL**（Pi、Hermes Agent、OpenClaw 等 **真实 harness** 上 rollout；独立沙箱；**GRPO**；奖励 = outcome LLM-judge + 程序化检查 + 硬安全门）

发布前模型已见过目标 harness 的工具、system prompt 与交互模式——非「裸权重 + 通用 chat」。

## 方法/架构解析

与 ReOPD 对照：Liquid 在 **小模型+端侧** 用 harness 内 RL 补能力；ReOPD 用 **teacher dense 蒸馏** 避免环境 rollout。二者共享 premise：**Agent 能力 = 权重 × harness 分布**。

本地部署路径：OpenAI-compatible endpoint serve LFM2.5 → agent harness 指向 localhost。适合高频、隐私敏感、可接受 2.6B 能力上限的 agentic 负载；复杂 coding/SWE 仍可能需要更大模型或云端。

### 与 ReOPD / 云端 Agent 的分工

| 场景 | 更优选择 |
|---|---|
| 离线提醒、本地 RAG、轻量 tool loop | LFM2.5 端侧 |
| 多轮 SWE、大 context 研究 | 云端 30B+ |
| 蒸馏小模型 tool agent | ReOPD 类 offline prefix |

LFM2.5 的价值在 **harness-aligned 小模型**——权重已见过 Pi/OpenClaw 分布，而非裸 Instruct 权重硬接 tools。

端侧 agent 的瓶颈常在 **工具沙箱与权限** 而非算力：LFM2.5 适合配合本地 sqlite、文件读写、日历等低副作用工具；涉及删库/发信/SSH 仍应走审批或云端大模型。见微若实验「离线 assistant」，可把 LFM2.5 作 OpenAI-compatible 后端，harness 仍用现有 Chat store 不变量。

## 补充

Liquid 把「agentic」定义为在真实 harness 里做过 GRPO，而非贴标签。2.6B 规模意味着 tool 链深度、SWE 长度、多模态理解都有天花板；优势在隐私、延迟与每瓦特智能。与见微默认云端 deepseek 路线互补：可设想「敏感会话走 LFM2.5，复杂任务路由云端」的双端模型策略。端侧部署时仍需 harness 侧工具权限与沙箱，小模型不能替代安全架构。硬件覆盖列表（Apple/Qualcomm/NVIDIA 等）意味着移动端与边缘盒均可尝试；见微可做 PoC：本地 OpenAI-compatible 端口 + 现有 Chat UI 指向 LFM2.5。四阶段后训练说明「agentic」来自 harness 分布对齐而非纯 chat SFT；若本地 tool 集与训练 harness 不一致，仍会出现工具幻觉与 stop 失控，需同步收窄工具清单与 verifier。128K 上下文适合长文档本地 RAG，但 2.6B 推理深度有限，复杂 multi-hop 仍建议路由云端模型。预训练 34T tokens 与 hybrid 架构支撑端侧性价比；与 ReOPD 蒸馏路线相比，LFM2.5 走「小模型 + harness RL」而非 teacher 蒸馏，二者可并存于不同部署档位。

---

> 见微改进对照见 [OasisMind 2026-08 Harness 波改进清单](../../../essays/oasis-improvements-2026-08-harness-wave.md)。
