---
title: "01 · o1-preview：2024-09-12 推理预览；附录 AIME cons@64=56.7，不是 83"
date: 2026-08-30
as_of: 2026-08-30
tags: [o1-preview, 公开材料精读]
---

# o1-preview: 纯强化学习驱动的 System-2 思考引擎 - 技术探测与反向工程

>  **[返回 14.12-OpenAI 家族总览](../../14.12-OpenAI.md)** · 完全体数字：[o1](../13-o1/01-13-o1-反向工程精译.md) · 同日小档：[o1-mini](../12-o1-mini/01-12-o1-mini-反向工程精译.md)

> **背景**：该模型并未完全开源其底层代码与权重，本精译基于其官方发布的技术报告(Technical Report)、系统卡片(System Card)以及顶级研究团队的逆向探测论文重构。

**产品博文 + 技术博文附录**。占位段不是这两篇。

- 产品：[Introducing OpenAI o1-preview](https://web.archive.org/web/20240913000000/https://openai.com/index/introducing-openai-o1-preview/)（2024-09-12）
- 评测表：[Learning to Reason with LLMs](https://web.archive.org/web/20240912185410/https://openai.com/index/learning-to-reason-with-llms/) Appendix A

产品博文里 IMO **83%** / Codeforces **89th** 写的是「**next model update**」（附录里的 **o1** 列），**不是** o1-preview。Preview 用附录中间列。

## 1. 产品

新系列：先想再答。当天 ChatGPT + API 放出 **preview**，预期会常改。系列从 1 重新计数，叫 **OpenAI o1**。早期：没有浏览、没有传文件/图。多数日常任务短期内仍可能 GPT-4o 更强。

Plus/Team 当天可选 o1-preview / o1-mini；周限额 **30** / **50** 条。Enterprise/Edu 下周。API：**usage tier 5**，20 RPM；当时没有 function calling、streaming、system messages。计划给 Free 用户 o1-mini。o1-mini 比 preview **便宜 80%**，偏代码、不强调广世界知识。

安全：新训法让模型在上下文里推理安全规则。最难越狱测试：GPT-4o **22**、o1-preview **84**（0–100；与技术博文 StrongREJECT goodness@0.1 的 0.220 / 0.840 同口径）。US/UK AISI 拿到研究版 early access。

## 2. 附录 A（o1-preview 列）

| | gpt-4o | **o1-preview** | o1（对照，见 01-13） |
|--|--------|----------------|---------------------|
| AIME 2024 cons@64 | 13.4 | **56.7** | 83.3 |
| AIME 2024 pass@1 | 9.3 | **44.6** | 74.4 |
| Codeforces Elo | 808 | **1,258** | 1,673 |
| Codeforces percentile | 11.0 | **62.0** | 89.0 |
| GPQA Diamond cons@64 | 56.1 | **78.3** | 78.0 |
| GPQA Diamond pass@1 | 50.6 | **73.3** | 77.3 |
| MATH pass@1 | 60.3 | **85.5** | 94.8 |
| MMLU pass@1 | 88.0 | **90.8** | 92.3 |
| MMMU / MathVista | 69.1 / 63.8 | **n/a** | 78.1 / 73.2 |

人偏好：推理重的数据分析/代码/数学大幅偏好 preview；部分自然语言任务 **不**偏好。CoT 对用户只给 **模型生成的摘要**，原文隐藏。

安全表（技术博文）：有害 prompt 标准 0.990→**0.995**；挑战性越狱 0.714→**0.934**；StrongREJECT 0.220→**0.840**；人工越狱 0.770→**0.960**；XSTest 不拒过头 0.924→**0.976**。

没有层数、没有「纯 RL 无预训练」这种句——博文写的是 **大规模 RL 教它用 CoT 想**，并随 train-time / test-time compute 变好（那条 scaling 曲线是 **o1** 的图，不要安成 preview 独有公式）。

## 3. 失效条件

- 把 o1 的 83% AIME / 89th Codeforces 写成 preview。
- 把 IOI 金牌 / Elo 1807 写成 preview（那是从 o1 再训的编程特化模型）。
- 空壳「隐式注意力维度跃迁」。

## 参考文献

- Introducing o1-preview Wayback（产品限额与 83%/89th 归属）
- Learning to Reason Wayback（Appendix A + 安全表 + 隐藏 CoT 段）
