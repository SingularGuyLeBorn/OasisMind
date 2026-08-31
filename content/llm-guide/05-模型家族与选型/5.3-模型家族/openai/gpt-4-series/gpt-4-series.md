---
title: "GPT-4 系列：从技术报告到 4.1 API"
category: "模型家族与选型"
tags: ["openai", "gpt-4", "gpt-4o", "gpt-4.1", "api"]
published: true
as_of: "2026-09-01"
excerpt: "区分 GPT-4 论文模型、Vision/Turbo 产品更新、GPT-4o 多模态服务和 GPT-4.1 API。"
---

# GPT-4 系列：从技术报告到 4.1 API

> “GPT-4 系列”是版本阅读分组，不代表这些服务共享一套已公开的网络结构。OpenAI 没有公开 GPT-4、GPT-4o 或 GPT-4.1 的精确参数量、MoE 路由和完整训练数据。

## 身份与生命周期

| 身份 | 首次公开定位 | 核验日边界 |
|---|---|---|
| GPT-4 | 2023 技术报告中的多模态模型；报告主体强调文本输出 | 旧 API 型号已进入历史目录；报告没有披露模型规模或硬件配方 |
| GPT-4 with Vision | GPT-4 的图像输入能力/产品与 API 阶段 | 不能从产品名推定独立 checkpoint 或视觉编码器结构 |
| GPT-4 Turbo | 2023 年开发者产品更新，强调更长上下文与较低服务成本 | 官方目录标为弃用；旧本地“GPT-4-Turbo.pdf”实际是 GPT-4 技术报告副本，不是 Turbo 架构论文 |
| GPT-4o | 2024 年“omni”多模态服务 | 官方目录仍列模型页；具体快照、模态端点和限制以模型页为准 |
| GPT-4o mini | 小型、低成本的 4o 家族服务 | 官方目录仍列模型页；不要把营销基准换算成参数规模 |
| GPT-4.1 | 2025 年面向长上下文、代码和指令遵循的非推理 API 模型 | 官方模型页列 1,047,576 context、32,768 最大输出；不是 ChatGPT 产品名 |
| GPT-4.1 mini / nano | GPT-4.1 的较小服务档 | 是独立模型 ID，不是客户端量化选项；规格、价格和生命周期分别核验 |
| GPT-4.5 Preview | 研究预览 API 模型 | 官方目录标为弃用；“扩大无监督学习”不等于公开了参数或训练架构 |

## 证据边界

- GPT-4 技术报告明确说明出于竞争与安全考量，不披露架构（包括模型大小）、硬件、训练算力、数据构建和训练方法细节。因此“8×220B MoE”“约 1.8T 参数”等旧稿数字只能作为未证实传闻归档。
- GPT-4o 系统卡讨论端到端多模态能力与安全评估，但不提供可复现网络层表。不要凭“omni”补写统一 token 空间、具体编码器或训练混合比例。
- 上下文窗口、最大输出、工具支持与弃用状态是服务规格，不是模型能力的充分比较。生产选型还需要用自己的任务、延迟和安全回归验证。

## 一手来源

- [GPT-4 技术报告](https://arxiv.org/abs/2303.08774)
- [GPT-4o 系统卡](https://arxiv.org/abs/2410.21276)
- [GPT-4.1 API 模型页](https://developers.openai.com/api/docs/models/gpt-4.1)
- [GPT-4o API 模型页](https://developers.openai.com/api/docs/models/gpt-4o)
- [GPT-4o mini API 模型页](https://developers.openai.com/api/docs/models/gpt-4o-mini)
- [全部模型与弃用状态](https://developers.openai.com/api/docs/models/all)

[← 返回 OpenAI 家族](../openai.md)
