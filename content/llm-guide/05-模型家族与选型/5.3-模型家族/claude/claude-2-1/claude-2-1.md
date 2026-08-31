---
title: "Claude 2.1"
category: "模型家族与选型"
tags: ["claude", "anthropic", "历史模型", "工具调用", "长上下文"]
published: true
as_of: "2026-09-01"
excerpt: "Claude 2.1 的 200K 上下文、诚实性改进与工具使用测试能力。"
---

# Claude 2.1

> 核验日期：2026-09-01。200K 是协议容量；“更少幻觉”是 Anthropic 当时内部测试结论，不是所有任务上的绝对保证。

## 结论卡

| 字段 | 结论 |
|---|---|
| 公开日期 | 2023-11-21 |
| 输入 / 输出 | 文本输入、文本输出 |
| 上下文 | 200K token，约 150,000 英文单词的发布口径 |
| 新能力 | 更强系统提示遵循；工具使用 beta；长文档与错误陈述改进 |
| 权重 | 未公开 |
| 当前状态 | [已退役](https://platform.claude.com/docs/en/about-claude/model-deprecations)；Claude API 于 2025-07-21 停止提供 |

## 200K 与长文档

Claude 2.1 把上限从 100K 提高到 200K。Anthropic 同时提醒超长请求需要更多时间；在实际系统中，成本、首 token 延迟、信息定位和输出预算都会先于“能否提交请求”成为瓶颈。

## 事实性改进的证据边界

发布公告称，在一组复杂事实问题上，Claude 2.1 的错误陈述率相对 Claude 2.0 约减半；长文档问答中，错误回答减少约 30%，错误引用或声称文档支持的情况减少约 3—4 倍。这些是内部评测的相对变化，不能改写为“幻觉率只有原来一半”或对任意领域的保证。

## 工具使用 beta

2.1 可以依据工具定义选择函数并生成参数，这为计算器、搜索、数据库和私有 API 接入奠定了产品接口。模型不直接执行工具；调用方必须验证参数、限制权限、处理失败和记录工具结果。把它与 2024 年的屏幕级 Computer Use 混为一谈，会丢失能力层级差异。

## 不应保留的架构猜测

旧稿把 200K 归因为“NTK-aware RoPE、FlashAttention、Ring Attention、PagedAttention”等具体组合。公告没有披露这些实现，不能写成 Claude 2.1 架构事实。可以确定的是对用户可见的上下文、工具和质量变化，而不是内部如何实现。

## 官方来源

- [Introducing Claude 2.1](https://www.anthropic.com/news/claude-2-1)

[返回 Claude 家族](../claude.md)
