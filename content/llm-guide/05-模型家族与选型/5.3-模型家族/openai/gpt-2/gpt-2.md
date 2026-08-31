---
title: "GPT-2：规模扩展与零样本任务迁移"
category: "模型家族与选型"
tags: ["openai", "gpt-2", "zero-shot", "open-weight"]
published: true
as_of: "2026-09-01"
excerpt: "以 GPT-2 原论文和官方发布仓库区分研究结论、模型尺寸与开放权重。"
---

# GPT-2：规模扩展与零样本任务迁移

## 定位

2019 年 GPT-2 论文研究：仅扩大自回归语言模型并使用更广的数据，能否在没有任务专用微调的情况下完成若干任务。它是历史研究与开放权重系列，不是当前 API 家族。

## 论文披露

| 版本 | 参数量 | 层数 | 隐藏维度 |
|---|---:|---:|---:|
| small | 117M | 12 | 768 |
| medium | 345M | 24 | 1024 |
| large | 762M | 36 | 1280 |
| XL | 1,542M | 48 | 1600 |

共同边界包括 1,024 token 上下文、50,257 词表和 WebText 训练集。WebText 来自 Reddit 外链页面的筛选抓取，不是 Reddit 评论本身；论文也没有公开可完整复现的训练语料快照。

## 发布与风险边界

OpenAI 当时分阶段发布模型，随后开放完整 1.5B checkpoint。今天可以下载权重，不代表沿用当年的安全判断，也不代表 GPT-2 的许可证、数据来源和现代 `gpt-oss` 相同。

论文中的“zero-shot”是用自然语言格式诱导模型完成评测任务；不能等同现代指令跟随、RLHF 或工具调用。

## 一手来源

- [原论文：Language Models are Unsupervised Multitask Learners](https://cdn.openai.com/better-language-models/language_models_are_unsupervised_multitask_learners.pdf)
- [OpenAI GPT-2 权重仓库](https://github.com/openai/gpt-2)

[← 返回 OpenAI 家族](../openai.md)
