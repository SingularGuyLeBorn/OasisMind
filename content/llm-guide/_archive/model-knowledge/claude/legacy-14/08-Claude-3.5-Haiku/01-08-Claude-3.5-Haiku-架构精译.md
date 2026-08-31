---
title: "01 · Claude 3.5 Haiku：上一代旗舰的分数，这一代 Haiku 的速度"
date: 2026-08-30
as_of: 2026-08-30
tags: [Claude-3.5-Haiku, 公开材料精读]
---

# Claude 3.5 Haiku: 算力成本的最优解 - 架构还原与精译

>  **[返回 14.13-Claude 家族总览](../../14.13-Claude.md)** · 同场：[3.5 Sonnet 升级版](../07-Claude-3.5-Sonnet/01-07-Claude-3.5-Sonnet-架构精译.md) · 前代：[Claude 3 Haiku](../04-Claude-3-Haiku/01-04-Claude-3-Haiku-架构精译.md) · [Claude 3 Opus](../06-Claude-3-Opus/01-06-Claude-3-Opus-架构精译.md)

> **解析**：Anthropic 极少透露具体的模型参数量与训练架构。本章内容综合了其官方 System Card、相关安全对齐论文(如 Constitutional AI)与逆向测试数据进行深度推演。

**公开材料精读**。上面「解析」原文保留。没有独立「Haiku 发布页」——[claude-3-5-haiku](https://www.anthropic.com/news/claude-3-5-haiku) 已 404。事实源是 2024-10-22 全家博文 + October Model Card Addendum。

| 源 | 日期 | 钉死什么 |
|----|------|----------|
| [3.5 models and computer use](https://www.anthropic.com/news/3-5-models-and-computer-use) | 2024-10-22 | 宣布 3.5 Haiku；SWE-bench Verified **40.6%**；**当月稍后**上线；先文本、图像随后 |
| 同页 Update | **2024-12-03** | 定价改为 **$0.80 / $4** per MTok in/out |
| [October Addendum](https://www-cdn.anthropic.com/c7822cdc35ad788ec87e14b3a9d45010f1f86c38.pdf) | 2024-10 | Table 8；知识截止 **2024-07**；内部 agentic **74%** |
| [AWS Bedrock 卡](https://docs.aws.amazon.com/bedrock/latest/userguide/model-card-anthropic-claude-3-5-haiku.html) | 平台页 | Bedrock launch **2024-11-04**；200K；最大输出 8K；ID `claude-3-5-haiku-20241022` |

10-22 博文**没有**写出首发美元价，只在 12-03 修订了 $0.80/$4。禁止用第三方站点的 $1/$5 填进六月到十月之间。

## 1. 产品位：Haiku 速度，许多格上过 3 Opus

博文：速度与 Claude 3 Haiku 同档，能力在多项智能基准上超过上一代最大的 **Claude 3 Opus**。适合面向用户的产品、子 Agent、从海量记录里做个性化（购买史、定价、库存）。

上线节奏：10-22 宣布「later this month」；Bedrock 卡写 **11-04** GA。先 **text-only**，图像随后。October addendum 因此**不报** Haiku 的多模态表。

Computer Use 公测挂在升级版 **3.5 Sonnet** 上，不要写成 Haiku 的功能。

## 2. 卡上 Haiku 这一列

October Table 2 SWE-bench Verified（pass@1，全部测试通过的题目比例）：

| 新 3.5 Sonnet | **3.5 Haiku** | 原 3.5 Sonnet | 3 Opus | 3 Haiku |
|---------------|----------------|---------------|--------|---------|
| 49.0% | **40.6%** | 33.4% | 22.2% | 7.2% |

博文原句：40.6% 超过「许多用公开 SOTA 模型的 agent」——点名包括**原版** 3.5 Sonnet 和 GPT-4o。不要说成超过十月升级版 49.0%。

内部 agentic coding（October Table 4）：3.5 Haiku **74%**，新 3.5 Sonnet 78%，原 3.5 Sonnet 64%，3 Opus 38%。

TAU-bench：retail **51.0%**（超过 3 Opus）；airline **22.8%**（超过 3 Haiku）。

Table 8（3.5 Haiku vs 3 Haiku 等，抽几格）：

| | 3.5 Haiku | 3 Haiku | 设置 |
|--|-----------|---------|------|
| GPQA Diamond | **41.6%** | 33.3% | 0-shot CoT |
| MMLU | **80.9%** / 77.6% / 80.3% | 76.7% / 75.2% / 74.0% | 5-shot CoT / 5-shot / 0-shot CoT |
| MMLU Pro | **65.0%** | 49.0% | 0-shot CoT |
| MATH | **69.2%** | 38.9% | 0-shot CoT |
| HumanEval | **88.1%** | 75.9% | 0-shot |

人评：相对 3 Haiku 多数任务大涨；编码上以明显优势胜过 3 Opus（addendum 正文，无第三张柱高）。

## 3. 0.4 拆面

和 3.5 Sonnet 一样：无架构。知识截止 **2024-07**（比两版 Sonnet 的 2024-04 新三个月）。安全测试写在同一份 October addendum 里，与升级版 Sonnet 一起做；Computer Use 的 ASL-2 分类针对的是 **Sonnet 的新能力**，不要把 OSWorld 14.9% 抄到 Haiku。

## 4. 失效条件

- 把 10-22 写成 Haiku API GA。
- 用已 404 的 `/news/claude-3-5-haiku` 当读过的正文。
- 把 $0.80/$4 写成 10-22 当天价。
- 说 Haiku 带 Computer Use。
- 为 3.5 Opus mkdir。

## 参考文献

- https://www.anthropic.com/news/3-5-models-and-computer-use
- https://www-cdn.anthropic.com/c7822cdc35ad788ec87e14b3a9d45010f1f86c38.pdf
- https://docs.aws.amazon.com/bedrock/latest/userguide/model-card-anthropic-claude-3-5-haiku.html（平台 launch 日，不是 Anthropic 架构页）
