---
title: "ChatGPT 与 GPT-3.5：产品、训练说明和 API 身份"
category: "模型家族与选型"
tags: ["openai", "chatgpt", "gpt-3.5", "product", "api"]
published: true
as_of: "2026-09-01"
excerpt: "拆开 2022 年 ChatGPT 产品、GPT-3.5 家族名称和 gpt-3.5-turbo API 生命周期。"
---

# ChatGPT 与 GPT-3.5：产品、训练说明和 API 身份

## 三个容易混淆的对象

| 对象 | 可核验身份 | 边界 |
|---|---|---|
| ChatGPT | 2022-11-30 发布的对话产品 | 官方说明称其从 GPT-3.5 系列模型微调；没有公开精确参数、完整数据或 checkpoint |
| GPT-3.5 | 一组处于 GPT-3 与 GPT-4 之间的模型/服务称谓 | 不是单一论文架构，也不是永远指向同一权重 |
| `gpt-3.5-turbo` | 曾提供的 API 模型 ID/别名 | 有独立快照、上下文和弃用周期；不能用它反推初版 ChatGPT 的底层 checkpoint |

## 已披露与未知

初版 ChatGPT 官方说明给出了监督微调与基于人类反馈的强化学习的大致流程，并指出与 InstructGPT 路线相关。它没有披露可复现的训练配方，因此固定参数规模、固定层数、精确 PPO 超参数或特定内部数据配比均没有公开一手证据。

产品层还会包含系统提示、内容策略、工具、检索、路由和用户界面。产品能力变化不能全部归因于某一个基础模型版本。

## 当前使用建议

截至核验日，官方“全部模型”目录把 GPT-3.5 Turbo 放在历史/弃用模型范围。新项目应从当前模型目录选型；维护旧系统时应先确认实际调用的模型 ID、快照和迁移期限。

## 一手来源

- [ChatGPT 发布说明](https://openai.com/index/chatgpt/)
- [OpenAI API 全部模型与弃用状态](https://developers.openai.com/api/docs/models/all)
- [InstructGPT 原论文](https://arxiv.org/abs/2203.02155)

[← 返回 OpenAI 家族](../openai.md)
