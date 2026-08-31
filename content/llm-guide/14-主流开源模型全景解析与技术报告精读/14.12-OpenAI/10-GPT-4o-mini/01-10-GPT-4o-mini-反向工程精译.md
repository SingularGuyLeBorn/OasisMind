---
title: "01 · GPT-4o mini：2024-07-18 小模型；$0.15/$0.60；不是端侧"
date: 2026-08-30
as_of: 2026-08-30
tags: [GPT-4o-mini, 公开材料精读]
---

# GPT-4o mini：API 上的小模型

>  **[返回 14.12-OpenAI 家族总览](../../14.12-OpenAI.md)** · 同族旗舰：[GPT-4o](../09-GPT-4o/01-09-GPT-4o-反向工程精译.md) · 已有长 D5：[成本极限](./05-10-GPT-4o-mini-核心技术专题.md)

> **背景**：该模型并未完全开源其底层代码与权重，本精译基于其官方发布的技术报告(Technical Report)、系统卡片(System Card)以及顶级研究团队的逆向探测论文重构。

[GPT-4o mini: advancing cost-efficient intelligence](https://web.archive.org/web/20240719000627/https://openai.com/index/gpt-4o-mini-advancing-cost-efficient-intelligence/)（2024-07-18）**没有**写端侧部署、没有层数。当天是 **API 文本+视觉**。

## 1. 产品

自称最省成本的小模型。MMLU **82%**（后文表 **82.0%**）。当时 LMSYS 上聊天偏好好过 GPT-4；脚注 1：截至 2024-07-18，**更早一版** mini 好过 **GPT-4T 01-25**——不要写成永久压过所有 GPT-4。价：**$0.15 / $0.60 per million** in/out；比此前 frontier **一个数量级**便宜，比 GPT-3.5 Turbo **超过 60%** 便宜。相对 2022 的 text-davinci-003，每 token 成本自称掉了 **99%**。

128K 上下文；每请求最多 **16K** 输出；知识到 **October 2023**。与 GPT-4o **同一套改进 tokenizer**。当天 API：text + vision；text/image/video/audio 输入输出「未来」。语言覆盖声称与 GPT-4o 相同。ChatGPT：Free / Plus / Team **当天**用 mini 替换 3.5；Enterprise **下周**。Fine-tune「未来几天」。

## 2. 评测（simple-evals + assistant system message；对手取官方/HELM/自复现的最大值）

| | GPT-4o mini | Gemini Flash | Claude Haiku |
|--|-------------|--------------|--------------|
| MMLU | **82.0%** | 77.9% | 73.8% |
| MGSM | **87.0%** | 75.5% | 71.7% |
| HumanEval | **87.2%** | 71.5% | 75.9% |
| MMMU | **59.4%** | 56.1% | 50.2% |

没有架构表。安全：与 4o 同一套 mitigations；Preparedness / 70+ 专家那段是在讲 **测过 GPT-4o** 再惠及 mini。API 上 mini 是 **第一个**上 **instruction hierarchy**（抗越狱 / 注入 / 抽系统提示）的模型。

## 3. 失效条件

- 空壳「端侧」。
- 把 LMSYS「好过 GPT-4」写成无日期、无 4T-0125 脚注。
- 把 4o 的 88.7% MMLU 安到 mini 头上。

## 参考文献

- https://web.archive.org/web/20240719000627/https://openai.com/index/gpt-4o-mini-advancing-cost-efficient-intelligence/
