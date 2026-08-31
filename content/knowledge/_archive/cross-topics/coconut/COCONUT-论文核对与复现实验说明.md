---
title: "COCONUT 论文核对与复现实验说明"
category: "隐藏交叉主题"
tags: [COCONUT, latent-reasoning, cross-topic]
published: false
excerpt: "核对 COCONUT 的真实论文编号、连续思维机制与实验边界，并说明旧 GRU demo 不是论文复现。"
---
# COCONUT 论文核对与复现实验说明

COCONUT（Chain of Continuous Thought）的正确论文是 **arXiv:2412.06769**，标题为 *Training Large Language Models to Reason in a Continuous Latent Space*。它属于“潜在推理 / 模型架构与训练课程”交叉主题，不是强化学习优化器，因此不进入公开算法编号主线。

论文把 LLM 最后一个 hidden state 作为 continuous thought，跳过离散 token 解码，直接作为下一步输入 embedding；训练采用 curriculum，逐阶段把语言 CoT 替换为连续思维。作者在若干逻辑推理任务上报告优势，并分析连续状态可能编码多个候选下一步。论文没有支持旧稿中的“一个 latent step 等于 10–20 token”“推理速度提升 5 倍”或“终极推理形态”等绝对结论。

旧目录里的 GRU 循环只是概念 demo，不是 Transformer 上的 COCONUT 训练，也没有课程阶段、数据或论文评测；错误编号 `2412.19379` 的 PDF 和全部旧稿已完整保留在 `_archive/unverified/25_COCONUT-错误旧稿/`。

一手来源：

- [arXiv:2412.06769](https://arxiv.org/abs/2412.06769)
- [作者官方代码](https://github.com/facebookresearch/coconut)
