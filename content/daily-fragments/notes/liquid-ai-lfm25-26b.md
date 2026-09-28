---
title: "Liquid AI LFM2.5-2.6B：完全端侧运行的 Agentic 模型"
category: "模型发布"
published: true
excerpt: "Liquid AI 发布 LFM2.5-2.6B：完全端侧运行的 agentic 模型，128K 上下文，34T tokens 预训练，四阶段后训练含 agentic RL（GRPO + LLM-as-judge），开源权重，llama.cpp/MLX/vLLM 等全生态支持。"
tags: ["Liquid AI", "LFM2.5", "端侧模型", "agentic", "GRPO", "开源模型"]
---
# Liquid AI LFM2.5-2.6B：完全端侧运行的 Agentic 模型

> 来源：Liquid AI 发布推文（2026-08-05 转发）
> 模型：LFM2.5-2.6B / LFM2.5-2.6B-Base（Hugging Face 已开源）

## 一句话

LFM2.5-2.6B 是一个**完全运行在设备端**的 agentic 模型：会规划、会调用工具、能在手机/笔记本/PC/机器人上连续完成多步骤任务。数据不出设备，单次运行的边际成本几乎为 0。

## 关键规格

- 预训练约 34T tokens
- LFM2.5 旗舰混合架构（hybrid）
- 上下文长度 128K
- 词表大小 128K
- 单 GPU 即可针对任意专门任务定制
- LFM2 开放权重许可
- 主打「每瓦特均衡智能」（balanced intelligence per watt）

## 部署与生态

为端侧与超快服务端部署设计，解码速度、prefill 延迟、内存占用都经过优化，发布即支持：

- 推理框架：llama.cpp、MLX、vLLM、SGLang、ONNX
- 硬件：AMD、Qualcomm、Apple、NVIDIA、Intel

两步搭起本地 agent：
1) 把 LFM2.5-2.6B 跑在 OpenAI 兼容端点后面
2) 把 agent harness 指向它

## 训练方式（关键亮点）

在**真实的 agent harness 里训练**，四阶段后训练：

1. SFT（监督微调）
2. 专家专业化（expert specialization）
3. 多域 on-policy 蒸馏
4. **Agentic RL**（最后一阶段）

最后阶段是多轮 agentic RL，跑在 Pi、Hermes Agent、OpenClaw 等 harness 上：

- 每个 rollout 在独立沙箱中运行
- 用 GRPO 优化
- 奖励来自 outcome reward：LLM-as-a-judge 评分标准 + 程序化检查 + 硬安全门
- 模型在发布前就已经见过这些工具、system prompt 和交互模式

## 适合场景

高频 agentic 工作负载的边缘设备：速度、隐私、本地部署优先。
（编码重负载或更复杂的 agentic 任务，更大的模型可能仍是更好的选择。）

## 链接

- Blog：https://lnkd.in/gEuFvtm9
- LFM2.5-2.6B：https://lnkd.in/gs9MYzXp
- LFM2.5-2.6B-Base：https://lnkd.in/gcjEYAUr
- Docs：docs.liquid.ai

---

*落库：2026-08-05 ｜ 每日碎片 ｜ 来源：QQ 图片*
