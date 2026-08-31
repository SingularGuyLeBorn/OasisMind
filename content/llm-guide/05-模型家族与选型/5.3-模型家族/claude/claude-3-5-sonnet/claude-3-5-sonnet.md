---
title: "Claude 3.5 Sonnet"
category: "模型家族与选型"
tags: ["claude", "anthropic", "sonnet", "computer-use", "历史模型"]
published: true
as_of: "2026-09-01"
excerpt: "Claude 3.5 Sonnet 的六月首发、十月升级、Artifacts 与 Computer Use 关系。"
---

# Claude 3.5 Sonnet

> 核验日期：2026-09-01。同名模型在 2024-06 与 2024-10 有两个重要产品节点；复现实验必须记录日期或具体模型快照。

本库按发布时 API 身份，将 2024-10 快照记为 Claude 3.5 Sonnet（`claude-3-5-sonnet-20241022`）。Anthropic 后来的研究材料与 Sonnet 5 公告也把同一代称作“Sonnet 3.6”；它不是另一个独立公开 API 型号。

## 结论卡

| 字段 | 结论 |
|---|---|
| 首发 | 2024-06-20 |
| 重要更新 | 2024-10-22；编码与工具代理升级，并作为 Computer Use 首批载体 |
| 输入 / 输出 | 文本、图像输入；文本输出 |
| 上下文 | 200K token |
| 价格 | $3 输入 / $15 输出，每百万 token |
| 当前状态 | [已退役](https://platform.claude.com/docs/en/about-claude/model-deprecations)；Claude API 于 2025-10-28 停止提供 |

## 六月首发：能力与产品形态

Anthropic 将 3.5 Sonnet 定位为以 Claude 3 Sonnet 的价格提供超过 Claude 3 Opus 的多项能力，并称其速度约为 Opus 的两倍。官方内部代理式编码评测报告 64% 的问题解决率，对比 Claude 3 Opus 的 38%；这不是后来标准化的 SWE-bench Verified，不能把数字直接混排。

Claude.ai 同期推出 Artifacts：模型生成的代码、文档或设计在独立工作区显示并可迭代。Artifacts 是产品交互层，不是基础模型新增模态。

## 十月更新：编码与 Computer Use

十月快照提升编码和工具任务，并成为首批公开测试 Computer Use 的模型。公告报告 SWE-bench Verified 为 49.0%；引用时仍须保留提示、工具、采样和执行脚手架条件，不能把代理系统结果当成裸模型的无条件成功率。

## 适用边界

3.5 Sonnet 适合当时的编码、视觉文档、写作和工具任务，但现在已被多代模型替代。存量系统迁移时要重新测试提示依赖、工具 schema、拒答、安全过滤、图像 token 与延迟，而不是只替换模型名。

## 未公开内容

没有可靠一手证据支持旧稿中的精确参数量、MoE/Dense 判断、GQA、RoPE 变体或训练数据比例。两次同名更新也不能推导为只更换后训练、不更换基础权重。

## 官方来源

- [Claude 3.5 Sonnet](https://www.anthropic.com/news/claude-3-5-sonnet)
- [Introducing computer use, a new Claude 3.5 Sonnet, and Claude 3.5 Haiku](https://www.anthropic.com/news/3-5-models-and-computer-use)

[返回 Claude 家族](../claude.md)
