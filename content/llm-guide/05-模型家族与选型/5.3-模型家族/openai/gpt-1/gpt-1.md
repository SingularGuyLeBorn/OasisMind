---
title: "GPT-1：生成式预训练与判别式微调"
category: "模型家族与选型"
tags: ["openai", "gpt-1", "预训练", "历史模型"]
published: true
as_of: "2026-09-01"
excerpt: "以原论文为准梳理 GPT-1 的模型规模、训练范式和开放边界。"
---

# GPT-1：生成式预训练与判别式微调

## 定位

2018 年论文 *Improving Language Understanding by Generative Pre-Training* 展示了“在未标注文本上做自回归语言建模，再对监督任务微调”的统一路线。它是论文中的研究模型，不是今天的 API 型号。

## 论文披露

| 项目 | 论文口径 |
|---|---|
| 骨干 | 12 层 decoder-only Transformer |
| 隐藏维度 / 注意力头 | 768 / 12 |
| 上下文 | 512 token |
| 预训练数据 | BooksCorpus；论文写约 7,000 本未出版书籍 |
| 分词 | byte-pair encoding，40,000 merges |
| 下游适配 | 在任务输入前后加少量起止/分隔 token，再做有监督微调 |

论文没有在主表中给出可直接核验的精确总参数量。因此本页不把常见的“117M”当成论文原始表格事实。后续发布的 `openai-gpt` checkpoint 可以单独核对权重配置，但不能倒推论文没有披露的训练细节。

## 能力与边界

- 论文报告的是一组自然语言理解基准，不是聊天、工具调用或现代长上下文能力。
- “GPT-1”是后来的通俗称呼；论文标题和模型发布页应作为身份依据。
- 历史 checkpoint 的可下载性不意味着今天仍有同名托管 API。

## 一手来源

- [原论文：Improving Language Understanding by Generative Pre-Training](https://cdn.openai.com/research-covers/language-unsupervised/language_understanding_paper.pdf)
- [OpenAI GPT 权重仓库](https://github.com/openai/finetune-transformer-lm)

[← 返回 OpenAI 家族](../openai.md)
