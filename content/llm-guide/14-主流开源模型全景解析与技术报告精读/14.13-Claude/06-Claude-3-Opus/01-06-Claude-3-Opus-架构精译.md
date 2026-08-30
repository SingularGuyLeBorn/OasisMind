---
title: "01 · Claude 3 Opus: 全面反超 GPT-4 的巅峰之作 - 技术报告反向工程"
date: 2026-08-30
as_of: 2026-08-30
tags: [Claude-3-Opus, 公开材料精读, vision, NIAH]
---

# Claude 3 Opus: 全面反超 GPT-4 的巅峰之作 - 架构还原与精译

>  **[返回 14.13-Claude 家族总览](../../14.13-Claude.md)** · [Haiku](../04-Claude-3-Haiku/01-04-Claude-3-Haiku-架构精译.md) · [Sonnet](../05-Claude-3-Sonnet/01-05-Claude-3-Sonnet-架构精译.md) · 已有长 D5：[长上下文与多模态](./05-06-Claude-3-Opus-长上下文推理与多模态理解的双重突破.md)（勿平行第三份）· 针测体系：[2.5](../../../2-核心原理与架构/2.5-长上下文处理/2.5-长上下文处理.md)

> **解析**：Anthropic 极少透露具体的模型参数量与训练架构。本章内容综合了其官方 System Card、相关安全对齐论文(如 Constitutional AI)与逆向测试数据进行深度推演。

**材料类型（2026-08）**：**公开材料精读**。上面「解析」原文保留。2024-03-04：**Opus 当天可调**，claude.ai 上给 Claude Pro。定价 **$15 / $75**。速度「与 Claude 2 / 2.1 相近、智能高很多」。

## 1. Table 1：全家数字写在这一篇

来源：Claude 3 Model Card Table 1。GPT/Gemini 列是卡从对方报告转录的，对照时以卡的脚注为准（GPT-4T 后来有人报过更高分）。

| 基准 | 设置 | Opus | Sonnet | Haiku |
|------|------|------|--------|-------|
| MMLU | 5-shot / 5-shot CoT | 86.8% / 88.2% | 79.0% / 81.5% | 75.2% / 76.7% |
| MATH | 4-shot / 0-shot / Maj@32 | 61% / 60.1% / **73.7%** | 40.5% / 43.1% / 55.1% | 40.9% / 38.9% / 50.3% |
| GSM8K | 0-shot CoT | 95.0% | 92.3% | 88.9% |
| HumanEval | 0-shot | 84.9% | 73.0% | 75.9% |
| GPQA Diamond | 0-shot CoT / Maj@32 | **50.4%** / **59.5%** | 40.4% / 46.3% | 33.3% / 40.1% |
| MGSM | 0-shot | 90.7% | 83.5% | 75.1% |
| DROP | 3-shot F1 | 83.1 | 78.9 | 78.4 |
| BBH | 3-shot CoT | 86.8% | 82.9% | 73.7% |
| ARC-C | 25-shot | 96.4% | 93.2% | 89.2% |
| HellaSwag | 10-shot | 95.4% | 89.0% | 85.9% |

GPQA Diamond 0-shot CoT：卡写 $T=1$ 方差很大，**10 次打乱选项取平均**才报 50.4%；5-shot CoT 正文另报过 53.3% 的 10 次均值。Maj@32 的 59.5% 同样对 10 次 Maj@32 再平均。不要把单次采样当成稳定分。领域专家在该集上大约 60–80%（卡引 GPQA 论文）。

多语言 MMLU 5-shot：Opus **79.1%**，相对 Claude 2.1 **63.4%** 高 15.7 百分点（Table 5）。

内部「100Q Hard」类事实题：博文写相对 2.1，Opus 正确率大约 **2×**，错误更少；细则在卡 §5.7 图里，本篇不从图估柱高。即将上线 **citations**（指回参考材料原句）——3 月公告时是「soon」，不是当天 API 字段。

## 2. 长上下文：200K 生产，1M 能力

全家发布时窗口 **200K**；卡写模型 **能接受超过 1M**，当时生产只给 200K，大客户可询。NIAH：他们用 30 组随机针/问、众包文档增强稳健性。**Opus 在最多 200K 的文档上召回超过 99%**，有时还会指出针是后插进原文的。QuALITY：Opus 1-shot **90.5%**、0-shot **89.2%**（卡 §5.8.1 正文）。

## 3. 视觉、安全、空白

视觉：图像与 video-frame；MMMU 等图在卡里，OCR 图不入库。安全：RSP 下 **ASL-2**；红队结论当时「灾难风险可忽略」。BBQ 偏差相对前代更低（卡，不抄图）。知识截止 **2023-08**。

**没有**参数量、层数、是否 GQA、优化器、预训练 token。标题「反超 GPT-4」是 2025 目录口吻；卡上 MMLU 5-shot Opus 86.8 vs 表内 GPT-4 86.4，CoT 后 88.2——这是这一张表，不是所有任务全面超过。HumanEval 84.9 vs 表内 GPT-4 67.0 的脚注提醒：后来的 GPT-4T 有更高公开分。

空壳 `05-06-核心技术专题` 改枢纽，CAI 公式链 Claude 1 / 4.4.3。

## 本篇来源

- https://www.anthropic.com/news/claude-3-family
- https://www-cdn.anthropic.com/de8ba9b01c9ab7cbabf5c33b80b7bbc618857627/Model_Card_Claude_3.pdf（Table 1、§5.1 GPQA 方差说明、§5.8）
- 同目录长 D5：`05-06-Claude-3-Opus-长上下文推理与多模态理解的双重突破.md`
