---
title: "Claude 2"
category: "模型家族与选型"
tags: ["claude", "anthropic", "历史模型", "长上下文"]
published: true
as_of: "2026-09-01"
excerpt: "Claude 2 的 100K 上下文、官方评测与服务边界。"
---

# Claude 2

> 核验日期：2026-09-01。Claude 2 已是历史版本；下列数字是 2023 年发布口径，不代表当前模型排名。

## 结论卡

| 字段 | 结论 |
|---|---|
| 公开日期 | 2023-07-11 |
| 输入 / 输出 | 文本输入、文本输出 |
| 上下文 | 100K token |
| 主要变化 | 编码、数学推理、长文档处理与安全性改进；Claude.ai 测试版扩大可用性 |
| 权重 | 未公开，仅通过产品与 API 使用 |
| 当前状态 | [已退役](https://platform.claude.com/docs/en/about-claude/model-deprecations)；Claude API 于 2025-07-21 停止提供 |

## 发布时的可核验改进

Anthropic 报告 Claude 2 在其测试设置下取得：Bar Exam 多项选择部分 76.5%，GSM8K 88.0%，HumanEval 71.2%；并将这些数字与 Claude 1.3 的 73.0%、85.2% 和 56.0% 对比。它们是官方发布自测，受提示、采样、评测版本与执行器影响，不能直接与几年后的排行榜横向比较。

100K 上下文支持长文档摘要、问答和写作，但模型依然可能漏读中部信息、把相邻段落错误拼接或生成没有原文支持的引用。生产系统应保存来源片段，要求页码或段落定位，并对重要结论做独立核对。

## 与 Claude 2.1 的边界

Claude 2 本身不应被写成 200K；200K 是后续 [Claude 2.1](../claude-2-1/claude-2-1.md) 的关键升级。工具使用的公开测试能力也主要出现在 2.1 的发布口径中。版本分析要保留这一时间顺序。

## 未公开内容

Anthropic 没有在 Claude 2 产品公告中公开参数量、层数、注意力机制、位置编码、训练 token 总量和数据集明细。旧稿中对这些字段的具体填写属于推断，不能进入事实表。

## 官方来源

- [Claude 2](https://www.anthropic.com/news/claude-2)
- [100K context windows](https://www.anthropic.com/news/100k-context-windows)

[返回 Claude 家族](../claude.md)
