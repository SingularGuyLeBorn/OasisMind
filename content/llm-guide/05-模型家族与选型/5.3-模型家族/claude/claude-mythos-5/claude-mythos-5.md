---
title: "Claude Mythos 5"
category: "模型家族与选型"
tags: ["claude", "anthropic", "mythos", "project-glasswing", "限量模型"]
published: true
as_of: "2026-09-01"
excerpt: "Claude Mythos 5 的 Project Glasswing 限量身份、规格与不可普遍采购边界。"
---

# Claude Mythos 5

> 核验日期：2026-09-01。Mythos 5 不是传闻或占位名，但它是 Project Glasswing 下的邀请制限量模型，不能列为普通 API 用户都可选择的通用档位。

## 结论卡

| 字段 | 结论 |
|---|---|
| 公开日期 | 2026-06-09 |
| 可用性 | Project Glasswing 邀请制 / 限量访问 |
| 定位 | 为高级安全与能力研究提供更直接的高能力模型访问 |
| 输入 / 输出 | 文本、图像输入；文本输出 |
| 上下文 / 最大输出 | 1M / 128K token |
| 推理 | 自适应思考始终启用；effort 选项以当前模型页为准 |
| 价格 | 官方定价页列为 $10 输入 / $50 输出，每百万 token |
| 数据保留 | 当前属于 Covered Model：30 天保留，不支持 ZDR；项目协议另行约束 |

## 与 Fable 5 的关系

两者同日公布并共享对外规格。Anthropic 首发公告明确称它们是同一底层模型，差异在于 Fable 的安全保障与 Mythos 的受控访问；当前平台文档说明 Mythos 不带 Fable 的这些分类器，只向获得批准的 Glasswing 客户提供。这个“同一底层模型”是官方产品表述，仍没有公开其参数量和网络架构。

## 为什么需要单独一页

Mythos 已有明确的官方身份，但“存在”与“普遍可用”是两件事。本页将可用性放在核心字段，避免读者误以为只需一个普通 API key 即可调用。

## 使用治理

限量高能力研究访问应有明确研究目的、审批、数据分级、网络隔离、工具白名单、停止条件和安全事件报告。截至核验日，Mythos 5 不支持 Zero Data Retention，官方要求 30 天保留；Project Glasswing 规则还可能比普通商业 API 更严格，应以邀请协议和当期条款为准。

## 官方来源

- [Claude Fable 5 and Mythos 5](https://www.anthropic.com/news/claude-fable-5-mythos-5)
- [Introducing Claude Fable 5 and Claude Mythos 5](https://platform.claude.com/docs/en/models/fable-5/introducing-claude-fable-5-and-claude-mythos-5)
- [Claude API pricing](https://platform.claude.com/docs/en/about-claude/pricing)

[返回 Claude 家族](../claude.md)
