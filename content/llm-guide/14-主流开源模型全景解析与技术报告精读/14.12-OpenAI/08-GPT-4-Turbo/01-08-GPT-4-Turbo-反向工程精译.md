---
title: "01 · GPT-4 Turbo：2023-11-06 DevDay，128K 与降价；没有架构表"
date: 2026-08-30
as_of: 2026-08-30
tags: [GPT-4-Turbo, DevDay, 公开材料精读]
---

# GPT-4 Turbo: 128K上下文与极致性能优化 - 技术探测与反向工程

>  **[返回 14.12-OpenAI 家族总览](../../14.12-OpenAI.md)** · 前代：[GPT-4](../06-GPT-4/01-06-GPT-4-反向工程精译.md) · 视觉系统卡：[GPT-4V](../07-GPT-4-Vision/01-07-GPT-4-Vision-反向工程精译.md) · 已有长 D5：[128K 工程](./05-08-GPT-4-Turbo-核心技术专题.md)

> **背景**：该模型并未完全开源其底层代码与权重，本精译基于其官方发布的技术报告(Technical Report)、系统卡片(System Card)以及顶级研究团队的逆向探测论文重构。

**材料类型（2026-08）**：**产品博文**。占位段不是这篇。事实源：Wayback 捕获的 [New models and developer products announced at DevDay](https://web.archive.org/web/20231106235404/https://openai.com/blog/new-models-and-developer-products-announced-at-devday)（2023-11-06）。openai.com 现页本轮超时。库内 `pdfs/GPT-4-Turbo.html` 是 Cloudflare 挑战页，**不能当正文**。

## 1. 产品主张（只抄博文）

GPT-4 2023-03 首发、7 月对开发者 GA。当天 preview **下一代**：GPT-4 Turbo。更强；世界知识到 **April 2023**；**128k** 上下文（博文：约合 **300 页以上** 文本进一条 prompt）。相对 GPT-4：输入 token **3× 更便宜**、输出 **2× 更便宜**。API id：`gpt-4-1106-preview`；稳定生产档「未来几周」。

价格表（博文原文 **每 1,000 tokens**，不是每百万）：

| | 旧 GPT-4 8K | **GPT-4 Turbo 128K** |
|--|-------------|----------------------|
| Input | $0.03 | **$0.01** |
| Output | $0.06 | **$0.03** |

换算成每百万就是长 D5 表里的 $10/$30；不要再发明第三套价。32K 旧档输入 $0.06、输出博文写 **$0.012**（可能是 $0.12 的排版，**本篇照抄、不改正**）。

没有：层数、MoE、8×220B、注意力公式、MMLU 新表。

## 2. API 面（同日、但不是「Turbo 骨架」）

- **并行 function calling**（一条消息多个动作）；声称参数更准。
- **JSON mode**：`response_format` 约束句法正确的 JSON。
- **`seed`**：多数时候可复现（beta）。logprobs「未来几周」给 Turbo 和 3.5 Turbo。
- **GPT-4 Turbo with vision**：Chat Completions 收图；id **`gpt-4-vision-preview`**；计划并进主 Turbo 稳定版。定价按图尺寸，例：**1080×1080 = $0.00765**。Be My Eyes 点名为用例。这与 9 月 GPT-4V 系统卡是同一能力的 API 面，不要写成第二套视觉权重论文。
- 同日还有：Assistants API、DALL·E 3 API、TTS（`tts-1` / `tts-1-hd`，$0.015 / 1,000 字符起）、3.5 Turbo `gpt-3.5-turbo-1106`（默认 16K；内部 format following **38%** 提升）、Whisper large-v3、Consistency Decoder。**不要**把 Assistants / DALL·E / TTS 写进 Turbo 的 Transformer 表。

GPT-4 fine-tune 只开 experimental access；Custom Models 是另一档昂贵项目。

## 3. 失效条件

- 把长 D5 的「8×220B MoE」「RoPE 外推实现 128K」写成 DevDay 原文。
- 把 $0.01 当成每百万（那是每千 token）。
- 把 3.5 的 38% format following 安到 GPT-4 Turbo 头上。

## 本篇来源

- https://web.archive.org/web/20231106235404/https://openai.com/blog/new-models-and-developer-products-announced-at-devday
