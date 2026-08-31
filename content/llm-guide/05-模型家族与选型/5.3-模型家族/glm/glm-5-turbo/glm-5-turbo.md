---
title: "GLM-5-Turbo"
category: "模型家族与选型"
tags: ["glm-5-turbo", "api model", "openclaw", "agent"]
published: true
as_of: "2026-09-01"
excerpt: "GLM-5-Turbo 的 API 产品身份、OpenClaw 优化、200K 上下文及未公开边界。"
---

# GLM-5-Turbo

## 身份

GLM-5-Turbo 于 2026 年 3 月 15 日发布，是针对 OpenClaw/长链智能体工作流优化的托管文本模型。截止核验日，官方提供 API 文档，但没有对应的公开权重仓库、参数量或独立技术报告。因此不能把 `Turbo` 解释为小参数、量化、端侧模型，也不能从 GLM-5 反推它一定沿用 744B/A40B 或 DSA。

| 字段 | 官方服务文档 |
|---|---|
| 模型代码 | `glm-5-turbo` |
| 输入/输出 | 文本 → 文本 |
| 上下文 | 200K |
| 最大输出 | 128K |
| 公开形态 | Z.ai API / Coding Plan 等托管服务 |
| 参数、权重许可 | 未公开；服务受平台条款约束 |

## 官方定位

官方称训练数据和优化目标覆盖工具调用、复杂指令分解、定时/持续任务和高吞吐长链执行，并用 ZClawBench 展示 OpenClaw 场景结果。这里的“持续任务”是模型和系统的设计/评测口径，不意味着 API 调用能自行保持进程、定时触发或故障恢复；这些仍是 Agent 运行时职责。

服务文档列出的函数调用、MCP、上下文缓存、结构化输出和流式响应属于平台接口能力。接入前应验证工具 schema 遵循、重试幂等、超时、费用、数据保留和服务地区。

## 旧稿事实修正

- 无一手依据支持“端侧轻量 GLM-5-Turbo”或手机本地部署。
- 官方窗口是 200K，不是 1M。
- 官方未披露参数量，不能写“几十 B”或从名称推断激活参数。
- 没有公开权重时，不应写开放权重许可或本地部署教程。

## 一手来源

- [GLM-5-Turbo 官方服务文档](https://docs.z.ai/guides/llm/glm-5-turbo)
- [Z.ai 模型发布记录](https://docs.z.ai/release-notes/new-released)
- [Z.ai Chat Completion API](https://docs.z.ai/api-reference/llm/chat-completion)

[← 返回 GLM 模型家族](../glm.md)
