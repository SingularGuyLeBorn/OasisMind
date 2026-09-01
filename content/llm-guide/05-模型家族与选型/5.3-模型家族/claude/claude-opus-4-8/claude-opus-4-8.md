---
title: "Claude Opus 4.8"
category: "模型家族与选型"
tags: ["claude", "anthropic", "opus", "fast-mode", "honesty"]
published: true
as_of: "2026-09-01"
excerpt: "Claude Opus 4.8 的 fast mode、真实性改进与产品边界。"
---

# Claude Opus 4.8

> 核验日期：2026-09-01。Opus 4.8 是 Claude 谱系中的正式版本，版本序列不能从 4.7 直接跳到第五代。

## 结论卡

| 字段 | 结论 |
|---|---|
| 公开日期 | 2026-05-28 |
| 定位 | Opus 4.7 的综合升级，强调速度、长任务和诚实性 |
| 输入 / 输出 | 文本、图像输入；文本输出 |
| 上下文 / 最大输出 | 1M / 128K token |
| 价格 | $5 输入 / $25 输出，每百万 token |
| 新选项 | fast mode；官方称最高约 2.5 倍速度，具体收益随负载变化 |
| 当前状态 | Claude API：[Active](https://platform.claude.com/docs/en/about-claude/model-deprecations)；暂定不早于 2027-05-28 退役 |

## fast mode 怎么理解

fast mode 是服务执行选项，不代表另一个开放模型或固定的 2.5 倍端到端加速。网络、排队、工具执行、输出长度和地区都会影响用户感知延迟；还应核对该模式的价格和平台可用性。

## 诚实性改进

Anthropic 报告模型更愿意承认不确定、限制和任务失败。诚实性属于行为评测，不是“不会幻觉”的保证。真实系统仍需来源引用、工具校验、事实检查和拒绝未知的业务策略。

## 与 Fable 5 的关系

Fable 5 首发公告明确称，分类器触发时会由 Opus 4.8 回答。当前平台把 Fable 的 `refusal` 作为显式协议事件；调用方可选择 beta 服务端 `fallbacks`、SDK 中间件或应用层回退。因而“自动回退到 Opus 4.8”只能作为首发默认历史描述，当前是否回退以及回退到哪个模型取决于配置。

## 官方来源

- [Claude Opus 4.8](https://www.anthropic.com/news/claude-opus-4-8)
- [Claude Fable 5 and Mythos 5](https://www.anthropic.com/news/claude-fable-5-mythos-5)

[返回 Claude 家族](../claude.md)
