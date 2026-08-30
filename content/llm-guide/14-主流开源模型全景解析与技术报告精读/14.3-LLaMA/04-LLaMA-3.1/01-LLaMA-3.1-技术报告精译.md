---
title: "01 · LLaMA-3.1 技术报告精译"
date: 2026-08-30
as_of: 2026-08-30
tags: [Llama-3.1, 405B, 128K, GQA, 公开材料精读]
---

# LLaMA-3.1 技术报告精译

>  **[返回 14.3-LLaMA 家族总览](../../14.3-LLaMA.md)** · 同日 herd 论文精译：[Llama 3](../03-Llama-3/01-Llama-3技术报告精译.md) · 长 D5：[核心技术专题](./05-04-LLaMA-3.1-核心技术专题.md)

> **核心定位**：Meta 开源帝国的巅峰之作，高达 405B 的密集参数模型首次在多项基准上逼平甚至超越闭源王者 GPT-4o 与 Claude 3.5 Sonnet。

**材料类型（2026-08）**：2024-07-23 的 Llama 3.1 **就是** herd 论文 [arXiv:2407.21783](https://arxiv.org/abs/2407.21783) 里的 8B/70B/405B + 128K 那一档。本文件夹的 01 原先只有两段猜测；架构本体不要再抄一遍 03 目录。数字以 Hugging Face **Llama-3.1-405B** 模型卡为准（与论文同日）。上面「逼平 GPT-4o」是 2025 口号，**模型卡没有这句对照表**，本篇不写进评测。

## 1. 相对 Llama 3（2024-04）多了什么

| 项 | 模型卡 |
|----|--------|
| 尺寸 | 8B / 70B / **405B** 预训练 + Instruct |
| 上下文 | **128k**；GQA |
| 数据 | 预训练 **~15T** tokens；截止 **2023-12** |
| 语言 | 英语、德、法、意、葡、印地、西、泰 |
| 后训练 | SFT + RLHF；微调数据含公开指令集 + **>25M** 合成例 |
| 算力 | 合计 **39.3M** H100-80GB GPU-hours；其中 405B **30.84M**；区位温室气体 11,390 tCO2eq，市场口径 0 |
| 许可 | Llama 3.1 Community License；允许用输出改进其他模型；发布日 MAU > **7 亿**须另申请 |

Herd 论文 Table 1：3.1 Instruct 才标多语言 / 长上下文 / 工具使用；3 的 8B/70B Instruct 这三项为否或部分。

## 2. 405B 模型卡数字（不要用长 D5 里未标注来源的表）

**Base**（macro_avg/acc_char 等，卡上原表）：MMLU 5-shot **85.2**；MMLU-Pro CoT **61.6**；BBH CoT **85.9**；ARC-C 25-shot **96.1**。

**Instruct**（卡上原表）：

| 基准 | Llama 3.1 405B Instruct |
|------|-------------------------|
| MMLU 5-shot | **87.3** |
| MMLU 0-shot CoT | **88.6** |
| HumanEval pass@1 | **89.0** |
| MATH CoT | **73.8** |
| GSM-8K CoT maj1@1 | **96.8** |
| IFEval | **88.6** |
| GPQA | **50.7** |

8B/70B 对照见模型卡，此处不重抄全表。长 D5 写 HumanEval 85.7%、MMLU 85.9%——那是另一套表，以本卡 **89.0 / 87.3** 为准。

## 3. 失效条件

- 编 15.6T 网页 50% 那种配比（卡上只有 ~15T）。
- 把 16,000 H100、54 天写成官方（卡上只有 GPU-hours）。
- 把 405B 写成 MoE。
- 给 Muse Spark 另开架构论文——那是 2026 安全报告，见 [05-Muse-Spark](../05-Muse-Spark/01-Muse-Spark-公开材料精读.md)。

## 本篇来源

- https://huggingface.co/meta-llama/Llama-3.1-405B （模型卡：尺寸、15T+、128k、8 语言、39.3M GPU-hours、Instruct 表）
- https://arxiv.org/abs/2407.21783 （herd；本仓库已有 03 精译）
- Meta 博文 https://ai.meta.com/blog/meta-llama-3-1/ （本轮 fetch 400，未当数字源）
