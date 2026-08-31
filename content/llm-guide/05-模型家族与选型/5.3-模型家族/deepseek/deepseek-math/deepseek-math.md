---
title: "DeepSeekMath"
category: "模型家族与选型"
tags: ["deepseek", "模型家族", "开放权重"]
published: true
as_of: "2026-09-01"
excerpt: "从 DeepSeek-Coder-Base-v1.5 7B 继续预训练得到的数学推理系列，也是 GRPO 的早期公开来源。"
---

# DeepSeekMath

> 核验日期：2026-09-01。这里区分模型身份、检查点、API 路由和厂商评测，不把未披露实现或当前 API 别名写成架构事实。

## 结论卡

| 字段 | 已核实信息 |
|---|---|
| 发布/论文日期 | 2024-02-05（论文 v1） |
| 定位 | 从 DeepSeek-Coder-Base-v1.5 7B 继续预训练得到的数学推理系列，也是 GRPO 的早期公开来源。 |
| 参数 | 7B |
| 上下文 | 模型卡未在摘要区统一复表；部署以具体 checkpoint config 为准 |
| 模态 | 文本/数学表达 |
| 许可 | 代码仓库 MIT；权重受 DeepSeek Model License 约束，模型卡声明支持商用 |

## 已披露事实

- 论文披露在 7B Coder 基座上继续训练 120B 数学相关 token，并混合自然语言与代码数据。
- 论文把 GRPO 描述为 PPO 的变体，用组内相对奖励降低价值模型带来的内存开销。
- 公开线包含 Base、Instruct 与 RL 等不同检查点，不能混写为一个“7B 数学模型”。

## 证据边界

- 论文中的 MATH/self-consistency 结果依赖提示、采样与投票设置。
- “GRPO 起源”应理解为该报告的公开提出与实验，不代表后续实现都与此版相同。

## 部署与选型

- 复现实验必须使用模型卡给出的对话模板；该代模型卡不建议 system prompt。
- 生产数学系统仍需外部验证器、单位检查和拒答策略。

## 一手来源

- [论文（arXiv:2402.03300）](https://arxiv.org/abs/2402.03300)
- [官方模型卡（7B Instruct）](https://huggingface.co/deepseek-ai/deepseek-math-7b-instruct)
- [官方仓库](https://github.com/deepseek-ai/DeepSeek-Math)

[← 返回 DeepSeek 家族](../deepseek.md) · [模型家族索引](../../5.3-模型家族.md)
