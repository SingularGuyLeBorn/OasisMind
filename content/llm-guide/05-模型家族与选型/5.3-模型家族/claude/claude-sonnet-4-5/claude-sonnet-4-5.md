---
title: "Claude Sonnet 4.5"
category: "模型家族与选型"
tags: ["claude", "anthropic", "sonnet", "coding", "agent"]
published: true
as_of: "2026-09-01"
excerpt: "Claude Sonnet 4.5 的编码代理、Computer Use、Agent SDK 与安全边界。"
---

# Claude Sonnet 4.5

> 核验日期：2026-09-01。Sonnet 4.5 的官方宣传重点是编码与代理；“最佳编码模型”是发布时点、指定评测和官方口径，不是永久排名。

## 结论卡

| 字段 | 结论 |
|---|---|
| 公开日期 | 2025-09-29 |
| 定位 | 编码、复杂代理、Computer Use 与企业知识工作 |
| 输入 / 输出 | 文本、图像输入；文本输出 |
| 价格 | $3 输入 / $15 输出，每百万 token |
| 安全部署 | Anthropic 按 AI Safety Level 3 防护部署 |
| 当前状态 | Claude API：[Active](https://platform.claude.com/docs/en/about-claude/model-deprecations)；暂定不早于 2026-09-29 退役 |

## 能力节点

Anthropic 报告 Sonnet 4.5 在 OSWorld Computer Use 为 61.4%，并展示其在 SWE-bench Verified、终端和长时代理任务上的提升。数字必须与具体脚手架、思考配置、采样次数和日期绑定。

同日发布的 Claude Agent SDK 把 Claude Code 的代理基础设施开放给开发者。SDK 提供上下文管理、工具、权限和执行循环；它属于产品栈，不应被写成基础模型内部组件。

## 工程使用

Sonnet 4.5 适合代码库修改、浏览器/桌面代理、文档分析和多工具流程。对 Computer Use 应采用隔离环境、动作确认、注入防护和审计；对代码代理应检查测试覆盖、无关改动和供应链风险。

## 官方来源

- [Claude Sonnet 4.5](https://www.anthropic.com/news/claude-sonnet-4-5)

[返回 Claude 家族](../claude.md)
