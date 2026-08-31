---
title: "01 · Claude 3 Sonnet: 企业级多模态生产力中枢 - 技术报告反向工程"
date: 2026-08-30
as_of: 2026-08-30
tags: [Claude-3-Sonnet, 公开材料精读, vision]
---

# Claude 3 Sonnet: 企业级多模态生产力中枢 - 架构还原与精译

>  **[返回 14.13-Claude 家族总览](../14.13-Claude.md)** · [Haiku D2](../04-Claude-3-Haiku/01-04-Claude-3-Haiku-架构精译.md) · [Opus D2](../06-Claude-3-Opus/01-06-Claude-3-Opus-架构精译.md) · 已有长 D5：[05-05 核心技术专题](./05-05-Claude-3-Sonnet-核心技术专题.md)

> **解析**：Anthropic 极少透露具体的模型参数量与训练架构。本章内容综合了其官方 System Card、相关安全对齐论文(如 Constitutional AI)与逆向测试数据进行深度推演。

**公开材料精读**。上面「解析」原文保留。2024-03-04 当天 **Sonnet 上线**：免费 claude.ai 用它，API GA（159 国），Bedrock 当天、Vertex 私有预览。定价 **$3 / $15** per million in/out。上下文生产 **200K**。

## 1. 速度叙事要对照 2.1，不是对照 Opus

家族博文：对绝大多数负载，Sonnet 比 Claude 2 和 2.1 **快 2 倍**，智能也更高。Opus 的速度「和 2 / 2.1 差不多」。所以「中档又快又强」是相对前代，不是相对 Haiku（Haiku 才是最快那档）。

企业用例博文点名：RAG / 检索、销售自动化、代码生成、从图里抽文本。JSON 等结构化输出全家都写了「更好」，没有单独给 Sonnet 一份 schema 论文。

## 2. 卡上 Sonnet 这一列

| | Sonnet | 设置 |
|--|--------|------|
| MMLU | 79.0% / 81.5% CoT | 5-shot |
| GSM8K | 92.3% | 0-shot CoT |
| HumanEval | 73.0% | 0-shot |
| GPQA Diamond | 40.4% / 46.3% | 0-shot / 5-shot CoT |
| MATH Maj@32 | 55.1% | |

多语言 MMLU 5-shot：**69.0%**（卡 Table 5；Opus 79.1%，相对 Claude 2.1 的 63.4% 那行是 Opus 的 +15.7 百分点故事，不要安到 Sonnet 上）。

拒答：全家相对前代更少误拒。内部事实题「正确翻倍」那句博文写的是 **Opus vs 2.1**，不是 Sonnet。

## 3. 0.4 拆面

与 Haiku/Opus 相同的空白：无层数、无优化器、无数据配比。视觉、ASL-2、知识截止 2023-08、CAI 延续，见卡。长 D5 里若把「企业 SLA」写成官方架构选择，当 2025 叙事保留，不要标成 model card 句子。

## 参考文献

- https://www.anthropic.com/news/claude-3-family
- Claude 3 Model Card PDF Table 1 / Table 5
- 同目录 `05-05-Claude-3-Sonnet-核心技术专题.md`
