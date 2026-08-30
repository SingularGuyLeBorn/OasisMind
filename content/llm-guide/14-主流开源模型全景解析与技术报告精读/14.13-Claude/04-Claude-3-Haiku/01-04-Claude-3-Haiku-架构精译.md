---
title: "01 · Claude 3 Haiku: 极致响应速度的端侧小钢炮 - 技术报告反向工程"
date: 2026-08-30
as_of: 2026-08-30
tags: [Claude-3-Haiku, 公开材料精读, vision]
---

# Claude 3 Haiku: 极致响应速度的端侧小钢炮 - 架构还原与精译

>  **[返回 14.13-Claude 家族总览](../../14.13-Claude.md)** · 同日家族：[Sonnet D2](../05-Claude-3-Sonnet/01-05-Claude-3-Sonnet-架构精译.md) · [Opus D2](../06-Claude-3-Opus/01-06-Claude-3-Opus-架构精译.md) · 前代：[Claude 2.1](../03-Claude-2.1/01-03-Claude-2.1-架构精译.md) · CAI：[Claude 1 D2](../01-Claude-1/01-01-Claude-1-架构精译.md)

> **解析**：Anthropic 极少透露具体的模型参数量与训练架构。本章内容综合了其官方 System Card、相关安全对齐论文(如 Constitutional AI)与逆向测试数据进行深度推演。

**材料类型（2026-08）**：**公开材料精读**（家族公告 + model card）。没有层配置。上面「解析」原文保留。三档共用同一份卡，本篇只写 **Haiku 这一格**；MMLU 全家表在 Opus D2 复一份完整 Table 1，避免三篇各抄一遍评测墙。

| 源 | 日期 | 钉死什么 |
|----|------|----------|
| [Claude 3 family](https://www.anthropic.com/news/claude-3-family) | 2024-03-04 | 三档命名；Haiku **即将**上线；200K；视觉；定价 $0.25 / $1.25 |
| [Model card PDF](https://www-cdn.anthropic.com/de8ba9b01c9ab7cbabf5c33b80b7bbc618857627/Model_Card_Claude_3.pdf) | 2024-03 | 知识截止 **2023-08**；Table 1 基准；ASL-2；能吃到 1M 但生产 200K |
| [Claude 3 Haiku](https://www.anthropic.com/news/claude-3-haiku) | 2024-03-13 | API + Claude Pro 可用；&lt;32K prompt 约 **21K token/s** |

## 1. 产品位：最快、最便宜、带视觉

2024-03-04 全家宣布时 Opus/Sonnet 当天可调用，Haiku 写「soon」。3 月 13 日博文才说 API 与 claude.ai Pro 上线，Bedrock 同步，Vertex「即将」。不要把 3 月 4 日写成 Haiku GA。

家族博文：Haiku 能在 **不到 3 秒**读完一篇带图的 arXiv（约 10k token）。3 月 13 日补了吞吐：多数负载上号称比同档竞品快 3 倍；prompt **低于 32K** 时摄入约 21K token/s（约 30 页/秒）。脚注：超过 32K 可能慢 30–60%；图会再加延迟。定价按 1:5 输入:输出，例：1 美元处理约 400 份最高法院意见（按每份 10K token 估）或约 2500 张图（每张 1.6K token）。这些是官方脚注估算，不是独立基准。

## 2. 卡上 Haiku 这一列（Table 1，抽几格）

| | Haiku | 设置 |
|--|-------|------|
| MMLU | 75.2% / 76.7% CoT | 5-shot |
| GSM8K | 88.9% | 0-shot CoT |
| HumanEval | **75.9%** | 0-shot |
| GPQA Diamond | 33.3% / 40.1% | 0-shot CoT / 5-shot CoT |
| MATH Maj@32 | 50.3% | 4-shot 列里的 Maj@32 |

HumanEval 上 Haiku **高于**同卡 Sonnet 的 73.0%。这是卡上的数，不是「Haiku 比 Sonnet 更会写代码」的产品叙事。完整对照见 Opus D2。卡明文：Haiku 在多数纯文本任务上 **不低于 Claude 2**。

视觉：全家多模态（图像 + video-frame）。NIAH：卡写参数量从 Haiku 到 Opus，中部召回变好；**近乎完美的 >99% 是 Opus**，不要把这句话抄到 Haiku 头上。

## 3. 0.4 拆面

积木/层数/优化器：**未公开**。后训练仍是 CAI 产品线（卡：继续用 Constitutional AI）。安全：**ASL-2**。1M 窗口：Haiku 的长上下文 loss 曲线画到 1M（Fig. 14），生产仍 200K。Tool use 在 3 月 4 日博文里是「接下来要发」，不是 Haiku GA 日的功能清单。

## 本篇来源

- https://www.anthropic.com/news/claude-3-family
- https://www.anthropic.com/news/claude-3-haiku
- Claude 3 Model Card PDF（本会话读了开篇、§5.1 Table 1、§5.8 长上下文）
