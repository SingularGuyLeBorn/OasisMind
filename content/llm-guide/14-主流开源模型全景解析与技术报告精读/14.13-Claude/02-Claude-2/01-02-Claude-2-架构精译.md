---
title: "01 · Claude 2: 超长上下文 (100K) 的领跑者 - 技术报告反向工程"
date: 2026-08-30
as_of: 2026-08-30
tags: [Claude-2, 长上下文, 公开材料精读]
---

# Claude 2: 超长上下文 (100K) 的领跑者 - 架构还原与精译

>  **[返回 14.13-Claude 家族总览](../../14.13-Claude.md)** · 前代：[Claude 1 D2](../01-Claude-1/01-01-Claude-1-架构精译.md) · 已有长 D5：[超长上下文与 CAI](./05-02-Claude-2-超长上下文与Constitutional AI的工程实践.md)（勿平行第三份）· 扩窗前作：[100K 公告](https://www.anthropic.com/news/100k-context-windows)

> **解析**：Anthropic 极少透露具体的模型参数量与训练架构。本章内容综合了其官方 System Card、相关安全对齐论文(如 Constitutional AI)与逆向测试数据进行深度推演。

**材料类型（2026-08）**：**公开材料精读**。没有 Table 1，没有 System Card。CAI 公式已在 [Claude 1 D2](../01-Claude-1/01-01-Claude-1-架构精译.md) 和 [4.4.3](../../../4-后训练/4.4-对齐技术/4.4.3-RLAIF/4.4.3-RLAIF.md)，本篇不重推。上面「解析」原文保留。

轴心：[Claude 2](https://www.anthropic.com/news/claude-2)（2023-07-11）。

## 1. 产品面：API + claude.ai，价格对齐 1.3

相对 Claude 1.3，这篇博文钉死的产品变化是：

- 新公开 beta 网站 **claude.ai**（当时 US / UK）。
- 企业 API **与 Claude 1.3 同价**。
- 输入最多 **100K tokens**（「hundreds of pages」的技术文档或一本书）。这不是 7 月才发明的窗口：两个月前已经发过 [from 9K to 100K](https://www.anthropic.com/news/100k-context-windows)；7 月是把 100K 做成 Claude 2 的默认产品形态，并强调 **输出也可以一次写几千 token**（备忘录、信、故事）。
- 没有参数量、层配置、优化器、数据配比。

## 2. 博文明文写出的基准（只抄句子，不从图里估）

对照基线都是 **Claude 1.3**，不是 GPT-4：

| 项 | Claude 2 | Claude 1.3 |
|----|----------|------------|
| 律师资格考试选择题 | **76.5%** | 73.0% |
| Codex HumanEval（他们称为 Python coding test） | **71.2%** | 56.0% |
| GSM8k | **88.0%** | 85.2% |

GRE：阅读和写作成绩「高于申请研究生的大学生的 90th percentile」，定量推理「接近 median applicant」。这是常模对照，不是 0–100 的绝对分，不要改写成「GRE 90 分」。

内部红队：用自动化测试打一批有害 prompt，再人工抽查。博文写 Claude 2 给出无害回答的表现是 Claude 1.3 的 **2 倍**（2x better at giving harmless responses）。没有公开这套内部评测的题目或原始计数。越狱「没有模型免疫」。

## 3. 0.4 拆面

| 面 | 能写到哪 | 空白 |
|----|----------|------|
| 积木 | 无新注意力变体 | — |
| 架构 | 无 | 参数量 |
| 数据 | 「更新的知识」只在合作方引言里出现（Sourcegraph） | 截止日、配比 |
| 优化器 | 未写 | — |
| Infra | 未写 | 100K 怎么训、怎么 serve |
| 稳定性 | 内部红队 + 链到先前安全技术博文 | 训练事故 |
| 训推 | 未写 | — |
| 后训练 | 仍是 CAI 产品线；本篇没有新公式 | 是否改了宪法 |

长上下文的体系位置：窗口数字在本篇；KV 压力、RoPE 外推、针测在 [2.5](../../../2-核心原理与架构/2.5-长上下文处理/2.5-长上下文处理.md) 和 [6.4 KV](../../../6-训练与推理优化/6.4-KV-Cache与推理优化/6.4-KV-Cache与推理优化.md)。Anthropic **没有**在这篇博文里解释他们用了 YaRN 还是 NTK。

## 4. 失效条件

- 把 100K 写成 Claude 2「业界首次发明」而抹掉 2023-05-11 的 9K→100K 公告。
- 把 GRE 百分位写成绝对分。
- 把 CAI 论文 52B 贴到 Claude 2。
- 再写一份与 `05-02-Claude-2-超长上下文…` 平行的 D5。

## 本篇来源

- https://www.anthropic.com/news/claude-2（2023-07-11，本会话读完正文）
- https://www.anthropic.com/news/100k-context-windows（9K→100K，前作）
- 同目录长 D5：`05-02-Claude-2-超长上下文与Constitutional AI的工程实践.md`
- CAI 链：`../01-Claude-1/01-01-Claude-1-架构精译.md`、`4.4.3-RLAIF.md`
