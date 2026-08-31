---
title: "GLM-5"
category: "模型家族与选型"
tags: ["glm-5", "moe", "dsa", "agentic engineering"]
published: true
as_of: "2026-09-01"
excerpt: "GLM-5 的 744B/A40B MoE、28.5T 预训练、DSA、200K 上下文与 MIT 权重。"
---

# GLM-5

## 身份

GLM-5 于 2026 年 2 月 12 日发布，定位从单次代码生成转向复杂系统工程和长时智能体任务。模型权重公开，同时提供托管 API；二者的硬件、上下文和接口能力要分别核对。

| 字段 | 技术报告/官方模型卡口径 |
|---|---|
| 架构规模 | 744B 总参数，40B 每 token 激活参数 |
| 预训练数据 | 28.5T token |
| 上下文 | 200K |
| 输入/输出 | 文本 → 文本 |
| 公开形态 | BF16/FP8 开放权重与 API |
| 权重许可 | MIT |

Hugging Face 仓库可能显示约 754B 的序列化参数计数，技术报告则用 744B 架构口径。应在资料中注明口径，而不是把差异误写为两个模型。

## 架构与训练

相较 GLM-4.5，GLM-5 扩大总参数、激活参数和训练数据，并采用 DeepSeek Sparse Attention（DSA）降低长上下文注意力成本。稀疏注意力不是“1M 上下文”的同义词：这一代官方窗口为 200K，1M 是后续 GLM-5.2 的明确升级。

技术报告还讨论多阶段强化学习、代码环境、工具轨迹和 Agent 工程评测。官方 benchmark 依赖 Claude Code 等框架、采样参数、工具权限和执行预算；裸模型输出不能等同端到端工程成功率。

## 部署边界

40B 激活参数不代表只需存储 40B。私有部署仍要承担完整 744B 级权重的存储/分片、专家并行、KV cache 和长上下文预填充。FP8 可降低权重带宽和显存，但需硬件与内核支持。代码仓库的 Apache-2.0 与权重的 MIT 是两个许可层。

## 一手来源

- [GLM-5 技术报告](https://arxiv.org/abs/2602.15763)
- [GLM-5 官方模型卡](https://huggingface.co/zai-org/GLM-5)
- [GLM-5 官方仓库](https://github.com/zai-org/GLM-5)
- [GLM-5 官方发布页](https://z.ai/blog/glm-5)

[← 返回 GLM 模型家族](../glm.md)
