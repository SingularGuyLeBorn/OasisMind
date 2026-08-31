---
title: "Claude 3.5 Haiku"
category: "模型家族与选型"
tags: ["claude", "anthropic", "haiku", "历史模型"]
published: true
as_of: "2026-09-01"
excerpt: "Claude 3.5 Haiku 的低延迟定位、发布评测和服务边界。"
---

# Claude 3.5 Haiku

> 核验日期：2026-09-01。该模型在 2024-10-22 公布，随后开放；不要把同日发布的 Computer Use 自动归到 Haiku。

## 结论卡

| 字段 | 结论 |
|---|---|
| 公布日期 | 2024-10-22 |
| 定位 | 新一代快速、低延迟模型 |
| 输入 / 输出 | 发布初期以文本能力为主；具体快照能力应查当时 API 文档 |
| 上下文 | 200K token |
| 价格 | 2024-12-03 修订为 $0.80 输入 / $4 输出，每百万 token |
| 当前状态 | [已退役](https://platform.claude.com/docs/en/about-claude/model-deprecations)；Claude API 于 2026-02-19 停止提供 |

## 发布主张

Anthropic 报告 3.5 Haiku 在多项评测上达到或超过较早的 Claude 3 Opus，并给出 SWE-bench Verified 40.6% 的官方结果。这说明小档位的代际进步，不等于对所有任务全面超过 Opus；尤其是长难推理、视觉输入和工具协议必须按具体快照核对。

公告后来追加了价格修订：$0.80 / $4，而不是 $1 / $5。历史价格也必须按最后官方更新记录，不能用 Haiku 4.5 的价格回填。

## 与 Computer Use 的关系

同一公告同时介绍了升级版 3.5 Sonnet、3.5 Haiku 和 Computer Use。公开测试的屏幕控制能力首先绑定升级版 3.5 Sonnet，不能因为同页出现就宣称 3.5 Haiku 首发支持 Computer Use。

## 选型方法

低延迟模型适合分类、路由、结构化抽取和高并发子任务。评估应测 P50/P95 延迟、一次成功率、升级强模型比例和总 token，而不是只看单价。Anthropic 未披露它是否由大模型蒸馏或采用何种网络结构。

## 官方来源

- [Claude 3.5 models and computer use](https://www.anthropic.com/news/3-5-models-and-computer-use)

[返回 Claude 家族](../claude.md)
