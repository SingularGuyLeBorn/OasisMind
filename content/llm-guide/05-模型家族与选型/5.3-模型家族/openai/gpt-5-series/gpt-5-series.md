---
title: "GPT-5 系列：API 版本、专用分支与未知架构"
category: "模型家族与选型"
tags: ["openai", "gpt-5", "gpt-5.5", "codex", "api"]
published: true
as_of: "2026-09-01"
excerpt: "用官方模型目录重建 GPT-5、5.1、5.2、5.3-Codex、5.4、5.5 的服务身份与证据边界。"
---

# GPT-5 系列：API 版本、专用分支与未知架构

> 本页按 API 身份组织，不把连续版本号解释为公开的层数、参数或训练配方变化。

## 主干与专用模型规格

| 模型 ID | 上下文 / 最大输出 | 知识截止 | `reasoning.effort` | 日期化快照（核验日） |
|---|---:|---|---|---|
| `gpt-5` | 400,000 / 128,000 | 2024-09-30 | minimal、low、medium、high | `gpt-5-2025-08-07` |
| `gpt-5.1` | 400,000 / 128,000 | 2024-09-30 | none、low、medium、high | `gpt-5.1-2025-11-13` |
| `gpt-5.2` | 400,000 / 128,000 | 2025-08-31 | none、low、medium、high、xhigh | `gpt-5.2-2025-12-11` |
| `gpt-5.3-codex` | 400,000 / 128,000 | 2025-08-31 | low、medium、high、xhigh | 未列日期化快照 |
| `gpt-5.4` | 1,050,000 / 128,000 | 2025-08-31 | none、low、medium、high、xhigh | `gpt-5.4-2026-03-05` |
| `gpt-5.5` | 1,050,000 / 128,000 | 2025-12-01 | none、low、medium、high、xhigh | `gpt-5.5-2026-04-23` |

这些是 2026-09-01 的服务规格，不是训练窗口、参数规模或记忆容量的证明。六个名称也不是一条完全同构的“基础模型代际”：`gpt-5.3-codex` 明确是 agentic coding 专用模型，不能当作未公布的通用 `gpt-5.3`。

## 版本树不要压扁

| 分支 | 代表 ID | 身份差异 |
|---|---|---|
| 通用主干 | `gpt-5`、`gpt-5.1`、`gpt-5.2`、`gpt-5.4`、`gpt-5.5` | 通用 API 模型；各代推理档位、上下文和工具支持并不相同 |
| Pro | `gpt-5-pro`、`gpt-5.2-pro`、`gpt-5.4-pro`、`gpt-5.5-pro` | 使用更多推理计算的独立服务身份，端点和结构化输出支持可能不同 |
| 低成本档 | `gpt-5-mini`、`gpt-5-nano`、`gpt-5.4-mini`、`gpt-5.4-nano` | 不是简单量化版；知识截止和服务规格需逐页核验 |
| Codex | `gpt-5-codex`、`gpt-5.1-codex*`、`gpt-5.2-codex`、`gpt-5.3-codex` | 面向长程 agentic coding；部分仅支持 Responses API，部分身份已弃用 |
| Chat 路由 | `gpt-5-chat-latest`、`gpt-5.1-chat-latest`、`gpt-5.2-chat-latest`、`gpt-5.3-chat-latest` | 指向 ChatGPT 使用过的快照/路由；上下文和最大输出可与同代通用 API 不同 |

是否弃用、账号可用性和端点支持会变化；版本树负责说明“它们不是同一个对象”，当前部署状态仍须以官方全部模型目录和实际 API 响应为准。

## 重要纠错

- 旧 GPT-5 文稿把“统一实时路由”“内部 fast/deep 模型”“确切训练架构”写成既定事实；公开模型页没有披露这些实现。
- 旧 GPT-5.5 文稿出现 Spud、AOMTO、特定稀疏注意力、10M 计划数据、50 倍能耗改善等叙述；没有一手材料支持，全部只保留在历史归档。
- GPT-5.3-Codex 是明确的专用 API 身份。不能凭名称补出 GPT-5.3 通用基础模型的架构，也不能把 ChatGPT 的 `*-chat-*` 路由当作同一模型。
- “Codex”可能指产品、编码代理、模型专用分支或历史代码模型；引用时必须写完整 ID。

## 选型建议

新部署应先看当前 GPT-5.6 家族；保留 5.4/5.5 或 5.3-Codex 时，以自有回归、工具兼容、具体模型 ID 和核验日期为准；官方提供日期化快照时再固定快照。不要把当前价格写进长期技术结论，因为价格和服务层会独立变化。

## 一手来源

- [全部 API 模型](https://developers.openai.com/api/docs/models/all)
- [GPT-5](https://developers.openai.com/api/docs/models/gpt-5)
- [GPT-5.1](https://developers.openai.com/api/docs/models/gpt-5.1)
- [GPT-5.2](https://developers.openai.com/api/docs/models/gpt-5.2)
- [GPT-5.3-Codex](https://developers.openai.com/api/docs/models/gpt-5.3-codex)
- [GPT-5.4](https://developers.openai.com/api/docs/models/gpt-5.4)
- [GPT-5.5](https://developers.openai.com/api/docs/models/gpt-5.5)
- [模型迁移与提示指南](https://developers.openai.com/api/docs/guides/latest-model)

[← 返回 OpenAI 家族](../openai.md)
