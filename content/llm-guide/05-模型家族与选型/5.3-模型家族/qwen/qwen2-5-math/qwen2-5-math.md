---
title: "Qwen2.5-Math"
category: "模型家族与选型"
tags: ["qwen", "模型版本", "证据分级"]
published: true
as_of: "2026-09-01"
excerpt: "Qwen2.5-Math 的自我改进训练、CoT/TIR 与使用边界。"
---

# Qwen2.5-Math

> 核验日期：2026-09-01。本文只写可回到一手材料的事实；动态服务规格以使用当天官方文档为准。

## 结论卡

| 字段 | 结论 |
|---|---|
| 官方身份 | Qwen2.5-Math / Qwen2.5-Math-Instruct |
| 首次公开证据 | 2024-09-18（论文首版） |
| 获取方式 | 开放权重，1.5B/7B/72B |
| 参数口径 | 1.5B、7B、72B；Base 与 Instruct 分开计为检查点类型，不当作新增参数档 |
| 上下文 | 技术报告和家族卡未为全系列复表一个统一值；须逐检查点核对模型卡与 `config.json` |
| 模态 | 数学文本/代码提示输入 → 文本输出；TIR 的代码执行发生在外部工具环境 |
| 许可 | 官方开放权重检查点采用 Apache 2.0 |
| 证据级别 | 技术报告 + 官方仓库 |

## 相对前序变化

把自我改进贯穿预训练、SFT/RM 迭代、强化学习与推理采样。

## 已披露的技术事实

- 报告发布 1.5B、7B、72B 的 Math 与 Math-Instruct 线。
- 支持中英文数学推理，并评测 Chain-of-Thought 与 Tool-Integrated Reasoning。
- 训练中使用 Qwen2-Math-Instruct 生成数据，并用奖励模型迭代 SFT/RL。

## 未披露与不应推断

- 竞赛题得分不等于形式证明正确性，也不保证过程无隐性错误。
- 旧目录曾误链 Qwen2-Math 论文 2407.04078；本页以 Qwen2.5-Math 报告 2409.12122 为准。

## 部署与选型边界

- 适合数学推理研究和工具辅助解题；高风险计算应外接可验证计算器或证明器。
- 按 CoT 与 TIR 协议分别评测，不能混用分数。

## 迁移说明

本页是该身份在公开知识树中的唯一首页。旧第 14 章路径 07-Qwen2.5-Math/* 已按证据拆入 _sources/model-reports/qwen/ 或 _archive/model-knowledge/qwen/；报告快照和历史解读不再作为平行公开教程。

## 一手来源

- [Qwen2.5-Math 技术报告](https://arxiv.org/abs/2409.12122)
- [Qwen2.5-Math 官方仓库](https://github.com/QwenLM/Qwen2.5-Math)
- [Qwen2.5-Math 官方发布页](https://qwenlm.github.io/blog/qwen2.5-math/)

[← 返回 Qwen 家族](../qwen.md)
