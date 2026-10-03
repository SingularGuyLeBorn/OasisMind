---
title: "o3 与 o4-mini 系统卡: 工具进了 CoT 之后的评测读法"
category: "模型库"
tags: ["OpenAI", "技术解析"]
published: true
excerpt: "全卡 33 页里, 讲模型本身的只有第 1, 2 节不到一页半. 能读到的训练信息是: o 系列在 CoT 上做大规模强化学习, 工具调用发生在 CoT 内部, 安全上用 deliberative alignment."
---
# o3 与 o4-mini 系统卡: 工具进了 CoT 之后的评测读法

来源: OpenAI o3 and o4-mini System Card (OpenAI, 2025 年 4 月 16 日; SWE-Lancer 一节在 2025 年 7 月 28 日更新). 同目录源文 `o3-o4-mini.md`, 33 页, 23 张图, 16 张编号表, 附录另有 3 张编号为 Figure 24 到 26 的表. 逐段对照见 `o3-o4-mini-bi.md`. 下文数字只取本文印出的值, 从柱状图上读出的数标 「读图」. 网络攻防与生物部分只谈评级和分数.

| 项目 | 本文印出的值 |
| --- | --- |
| 训练方式 | 在 CoT 上做大规模强化学习, 工具调用发生在 CoT 内部, 安全上用 deliberative alignment |
| 结构与规模 | 未披露. 没有参数量, 层数, 上下文长度, 训练 token 数, 也没说 o4-mini 小多少 |
| Preparedness 评级 | 三个跟踪类别都未达 High, 不触发 Safeguards Report |
| 幻觉 | PersonQA 上 o3 准确率 0.59, 幻觉率 0.33; o1 为 0.47 和 0.16 (表 4) |
| 图像生成过度拒答 | not_overrefuse: GPT-4o 0.86, o3 0.55, o4-mini 0.64 (表 12) |
| METR 时间跨度 | 50% 可靠性下 o3 约 **1 小时 30 分**, o4-mini 约 **1 小时 15 分** |
| CTF (pass@12) | o3 高中/大学/职业 89% / 68% / 59%, o4-mini 80% / 55% / 41% |
| Cyber Range | 两个场景在无帮助和给提示时全部 0%, 给求解代码后才能解 |
| SWE-bench Verified | o3 helpful-only 最高 71% (n=477) |
| PaperBench | o4-mini 24%, o1 23%, o3 18% (正文值) |
| 生物监控器 | 309 段不安全对话漏 4 段, 召回率 98.7% |

## 1. 这张卡交代了什么, 没交代什么

全卡 33 页里, 讲模型本身的只有第 1, 2 节不到一页半. 能读到的训练信息是: o 系列在 CoT 上做大规模强化学习, 工具调用发生在 CoT 内部, 安全上用 deliberative alignment. 参数量, 层数, 上下文长度和训练 token 数都没有.

o3 和 o4-mini 的差别, 卡片也没有用结构来解释. 能比的只有同一套评测上的分数. 三个 Preparedness 跟踪类别都没有达到 High, 因此不触发 Safeguards Report.

## 2. 能对上的分数

幻觉和拒答是这张卡里不依赖攻防步骤的两块. PersonQA 上 o3 准确率 0.59, 幻觉率 0.33, o1 是 0.47 和 0.16. 准确率更高, 幻觉率也更高, 两列不能合成一个 「更可靠」. 图像生成的 not_overrefuse, GPT-4o 是 0.86, o3 0.55, o4-mini 0.64, o 系列比 GPT-4o 更常把不该拒的图也拒了.

编程分数可以单独读. SWE-bench Verified 上 o3 helpful-only 最高 71% (n=477). PaperBench 正文里 o4-mini 24%, o1 23%, o3 18%, 小模型高于大模型, 卡片没有解释. METR 在 50% 可靠性下, o3 约 **1 小时 30 分**, o4-mini 约 **1 小时 15 分**.

## 3. 只保留的评级

网络安全没有达到 High. CTF 的 pass@12, o3 是高中 89%, 大学 68%, 职业 59%; o4-mini 是 80% / 55% / 41%. Cyber Range 两个场景在无帮助和只给提示时都是 0%, 给求解代码之后才能解. 具体路径不写.

生物与化学的结论是: 模型能在复现已知威胁的操作规划上帮助专家, 但还没有被定为 High. 监控器在 309 段不安全对话里漏了 4 段, 召回率 98.7%. 题面和协议不写.