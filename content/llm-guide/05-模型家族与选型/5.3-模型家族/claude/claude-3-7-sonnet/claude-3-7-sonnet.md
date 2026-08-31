---
title: "Claude 3.7 Sonnet"
category: "模型家族与选型"
tags: ["claude", "anthropic", "sonnet", "extended-thinking", "历史模型"]
published: true
as_of: "2026-09-01"
excerpt: "Claude 3.7 Sonnet 的混合推理、扩展思考预算和 Claude Code 起点。"
---

# Claude 3.7 Sonnet

> 核验日期：2026-09-01。Claude 3.7 Sonnet 是 Anthropic 首个把快速回答与扩展思考放进同一模型的“混合推理”发布。

## 结论卡

| 字段 | 结论 |
|---|---|
| 公开日期 | 2025-02-24 |
| 输入 / 输出 | 文本、图像输入；文本输出 |
| 上下文 | 200K token |
| 推理 | 标准模式或 extended thinking；API 用户可设置思考预算 |
| 价格 | $3 输入 / $15 输出，每百万 token；思考 token 计作输出 |
| 同期产品 | Claude Code 以受限研究预览形式推出 |
| 当前状态 | [已退役](https://platform.claude.com/docs/en/about-claude/model-deprecations)；Claude API 于 2026-02-19 停止提供 |

## 混合推理的意义

此前用户常在“快速模型”和“推理模型”之间切换。3.7 允许同一快照按任务分配不同思考预算：简单任务直接答，复杂数学、代码或规划使用更多 token。发布口径提到最多 128K 输出 token 的扩展思考配置；这不是说模型总能稳定利用全部预算，也不等于上下文额外增加 128K。

## 可见思考的证据边界

Anthropic 同期研究讨论了展示扩展思考的利弊。可见过程能帮助发现错误，但模型可能省略、压缩或以事后解释呈现步骤，因此不能把思考文本当成完整内部状态。审计仍应依赖可验证计算、引用、测试和工具日志。

## Claude Code

Claude Code 的研究预览把模型置于代码库与终端工具循环中。代理成绩是模型、提示、文件访问、测试、工具权限和重试策略的组合结果；不能把整个代理产品的成功率归因于裸模型架构。

## 未公开内容

“extended thinking”是产品行为和训练结果，不证明采用两个独立模型、特定 MoE 路由或公开的 test-time training。Anthropic 没有披露这些内部细节。

## 官方来源

- [Claude 3.7 Sonnet and Claude Code](https://www.anthropic.com/news/claude-3-7-sonnet)
- [Visible extended thinking](https://www.anthropic.com/news/visible-extended-thinking)

[返回 Claude 家族](../claude.md)
