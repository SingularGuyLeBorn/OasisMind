---
title: "Gemini 1.5：稀疏 MoE、长上下文与 Flash 路线"
published: true
as_of: 2026-09-01
tags: [Gemini-1.5, MoE, 长上下文, Flash]
---

# Gemini 1.5

Gemini 1.5 于 2024-02 首次公开。它把长上下文从产品附加项提升为研究主线，并在同一份技术报告中形成 Pro 与 Flash 两条路线。

> [返回 Gemini 家族](../gemini.md)

## Pro：稀疏 MoE 与千万级研究实验

官方报告明确把 Gemini 1.5 Pro 描述为 **稀疏 mixture-of-experts Transformer**。每个 token 只激活总参数中的一部分，但报告没有公开专家数、Top-k、总参数量或激活参数量。

报告展示了多模态长上下文实验：

- 文本检索在约 10M token 规模继续测试；
- 音频实验达到约 9.7M token、107 小时；
- 视频实验达到约 9.9M token、10.5 小时；
- 1M 级 needle-in-a-haystack 结果在多种模态上接近满召回。

这些是研究评测上限。公开服务曾提供 1M/2M 等产品档位，不能把 10M 研究实验写成所有 API 的标准窗口。

## Flash：不是“Pro 少开几个专家”

Gemini 1.5 报告对 Flash 给出的信息包括：

- Transformer decoder；
- attention 与 feed-forward block 并行；
- 从 1.5 Pro 在线蒸馏；
- 使用高阶预条件优化器。

报告没有把 Flash 描述为“与 Pro 同一 MoE、只减少激活专家数”，也没有公开 INT4 KV cache、线性注意力或专家路由表；这些推测不能视为模型事实。

## Flash-8B 的正确边界

Google 在 2024-10 宣布 Gemini 1.5 Flash-8B GA，官方博文称其为 1.5 Flash 的更小、更快变体，并给出更低价格、更高 RPM 和短提示更低延迟。`8B` 是官方产品名的一部分，但该服务没有开放权重，也不能据此编造层数、头数、量化格式或端侧部署教程。

## 生命周期

Gemini API 发布记录显示，`gemini-1.5-pro`、`gemini-1.5-flash` 和 `gemini-1.5-flash-8b` 已于 **2025-09-29** 关闭。历史文档适合研究，不适合作为新系统的可用性证明。

## 常见错误

- 把研究 10M、产品 2M 和当前端点上限合成一个数字。
- 为 MoE 填入官方没有发布的专家数量和参数量。
- 把 Flash 当作 Pro 的“低激活专家 SKU”。
- 把 Flash-8B 当作可下载、可量化、可在 llama.cpp 运行的开放权重模型。
- 只用 needle 测试证明任意 1M 任务都可靠；检索、推理、视频和代码任务的有效长度不同。

## 官方资料

- [Gemini 1.5 技术报告](https://arxiv.org/abs/2403.05530)
- [Gemini 1.5 与 Project Astra 的 I/O 2024 更新](https://blog.google/innovation-and-ai/products/google-gemini-update-flash-ai-assistant-io-2024/)
- [Gemini 1.5 Flash-8B GA 公告](https://developers.googleblog.com/en/gemini-15-flash-8b-is-now-generally-available-for-use/)
- [Gemini API 生命周期表](https://ai.google.dev/gemini-api/docs/deprecations)
