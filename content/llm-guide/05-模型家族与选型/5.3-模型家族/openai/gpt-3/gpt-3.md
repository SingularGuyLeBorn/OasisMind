---
title: "GPT-3：规模化语言模型与上下文学习"
category: "模型家族与选型"
tags: ["openai", "gpt-3", "in-context-learning", "closed-weight"]
published: true
as_of: "2026-09-01"
excerpt: "以 GPT-3 原论文梳理 175B 模型、上下文学习和闭源服务边界。"
---

# GPT-3：规模化语言模型与上下文学习

## 定位

2020 年论文 *Language Models are Few-Shot Learners* 系统评估了规模扩展后的上下文学习。这里的 GPT-3 是论文模型族；它不等于后续所有 `text-davinci-*`、GPT-3.5 或 ChatGPT 产品。

## 最大模型的论文口径

| 项目 | 披露值 |
|---|---:|
| 参数量 | 175B |
| 层数 | 96 |
| 隐藏维度 | 12,288 |
| 注意力头 | 96 |
| 上下文 | 2,048 token |

论文还训练了更小的对照模型。175B 是最大版本，不应写成每个“GPT-3”模型都具有相同规模。

## 上下文学习的准确含义

- **zero-shot**：只给任务描述；**one-shot**：再给一个示例；**few-shot**：在上下文中给多个示例。
- 这些示例不会在请求过程中更新模型权重。它是一种条件推断，不是在线微调。
- 论文报告多个任务随规模改善，也明确记录算术、常识、生成偏见和数据污染等失败与风险。

## 开放与服务边界

GPT-3 的论文披露了架构表和评测，但没有开放 175B 权重或完整训练数据。后来的 API 产品有自己的模型 ID、快照和弃用周期；不能只凭“GPT-3”名称判断仍可调用。

## 一手来源

- [原论文：Language Models are Few-Shot Learners](https://arxiv.org/abs/2005.14165)

[← 返回 OpenAI 家族](../openai.md)
