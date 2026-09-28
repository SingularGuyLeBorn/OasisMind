---
title: "Liquid AI LFM2.5-2.6B：端侧 Agentic 模型"
published: true
excerpt: "Liquid AI LFM2.5-2.6B：2.6B 参数的端侧 agentic 模型，34T tokens 预训练、128K 上下文，llama.cpp/MLX/VLLM 全生态支持；在真实 agent harness（Pi/Hermes/OpenClaw）里做 agentic RL 训练，适合边缘高吞吐 agentic 工作。"
tags: ["Liquid AI", "端侧模型", "agentic", "LFM2.5", "2.6B"]
---
# Liquid AI LFM2.5-2.6B：端侧 Agentic 模型

> 整理自用户收藏的 Liquid AI 官方发布截图（LinkedIn 帖，2026 年中）。

## 核心信息

Liquid AI 发布 **LFM2.5-2.6B**——一个 2.6B 参数的 agentic 模型，完全端侧运行（手机、笔记本、PC、机器人）。会规划、会调用工具、能连续完成多步骤任务。**数据不出设备，单次运行边际成本几乎为零。**

## 规格

- 预训练约 **34T tokens**
- LFM2.5 旗舰混合架构
- 上下文长度：**128K**
- 词表大小：128K
- 单 GPU 可微调定制（面向任意专门任务）
- 授权：LFM2 open-weight license

## 部署生态（Day-one 支持）

- 推理后端：llama.cpp、MLX、VLLM、SGLang、ONNX
- 硬件：AMD、Qualcomm、Apple、NVIDIA、Intel

两步搭建本地 agent：
1. 在 OpenAl-compatible 端点后 serve LFM2.5-2.6B
2. 把 agent harness 指向它

## 训练：在真实 agent harness 里训练

四阶段后训练：
1. SFT
2. 专家特化（expert specialization）
3. 多域 on-policy 蒸馏
4. **agentic RL**（多轮）

agentic RL 阶段走 Pi、Hermes Agent、OpenClaw；每次 rollout 在独立沙箱中运行，用 **GRPO** 对 outcome reward 优化——reward 由 LLM-as-a-judge rubric、程序化检查与硬安全门组成。模型「一出生」就见过这些工具、system prompt 和交互模式。

## 定位与边界

- 适合：边缘设备上的**高吞吐 agentic 工作**——速度、隐私、本地部署优先的场景
- 边界：coding-heavy 或更复杂的 agentic 任务，更大模型可能仍更合适

## 链接

- Blog: https://lnkd.in/gEuFvtm9
- LFM2.5-2.6B (HF): https://lnkd.in/gs9MYzXp
- LFM2.5-2.6B-Base (HF): https://lnkd.in/gcjEYAUr
- Docs: docs.liquid.ai
