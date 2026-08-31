---
title: "Claude Fable 5"
category: "模型家族与选型"
tags: ["claude", "anthropic", "fable", "adaptive-thinking", "模型路由"]
published: true
as_of: "2026-09-01"
excerpt: "Claude Fable 5 的最高能力定位、分类器路由、重新部署事件与服务边界。"
---

# Claude Fable 5

> 核验日期：2026-09-01。Fable 5 是公开服务中的最高能力层，并带有可拒绝高风险请求的安全分类器；调用方必须识别拒绝并决定是否终止、转人工或使用合规后备流程。

## 结论卡

| 字段 | 结论 |
|---|---|
| 首次公开 | 2026-06-09 |
| 重新部署 | 2026-07-01；此前因政府出口管制相关事件短暂停用 |
| 定位 | 最困难研究、编码、专业工作和代理任务 |
| 输入 / 输出 | 文本、图像输入；文本输出 |
| 上下文 / 最大输出 | 1M / 128K token |
| 推理 | 自适应思考始终启用；effort 选项以当前模型页为准 |
| 价格 | $10 输入 / $50 输出，每百万 token |
| 知识时效 | 官方页列出可靠知识截止 2026-01 |
| 数据保留 | 当前属于 Covered Model：30 天保留，不支持 ZDR；合同变化需重新核对 |

## 发布时路由与当前拒绝语义

2026-06-09 的首发公告称，安全分类器触发时会改由 Opus 4.8 回答，平均影响低于 5% 的会话。当前协议会显式暴露 Fable 拒绝事件：未配置回退时，Messages API 以 HTTP 200 返回并将 `stop_reason` 设为 `refusal`。

当前平台还提供三种可配置处理方式：beta 的服务端 `fallbacks`、SDK 客户端中间件，以及应用自己实现的回退或转人工。因此正确边界不是“永远自动回退”或“现在只能拒绝”，而是拒绝事件属于协议，后续路由属于服务或应用策略，不是 Fable 权重本身的能力。

## 停用与重新部署

Fable 5 与 Mythos 5 发布后因美国政府出口管制相关变化被暂停，Anthropic 随后在 2026-07-01 宣布重新部署。知识库需要保留这段服务历史，因为“正式发布”不等于期间持续、全球一致可用；地区和平台边界仍应在采购当天核对。

## 适用与成本

Fable 适合错误成本高、任务难度高且强模型提升能抵消价格的工作。对大量简单分类、抽取或交互任务，Sonnet 5 或 Haiku 4.5 往往更经济。评估应比较一次成功率、人工返工、工具轮次和端到端费用。

企业采购还必须核对数据治理：截至核验日，Fable 5 不支持 Zero Data Retention，官方要求 30 天数据保留。敏感数据不能只依据其他 Claude 型号的保留选项类推，地区、云平台和合同条款也应在上线前重新确认。

## 未公开内容

Fable 不是开放权重模型。Anthropic 未公开其参数量、专家结构、训练语料清单和完整对齐配方。分类器存在也不证明 Fable 自身采用 MoE。

## 官方来源

- [Claude Fable 5 and Mythos 5](https://www.anthropic.com/news/claude-fable-5-mythos-5)
- [Redeploying Fable 5](https://www.anthropic.com/news/redeploying-fable-5)
- [Introducing Claude Fable 5 and Claude Mythos 5](https://platform.claude.com/docs/en/models/fable-5/introducing-claude-fable-5-and-claude-mythos-5)
- [Claude API pricing](https://platform.claude.com/docs/en/about-claude/pricing)

[返回 Claude 家族](../claude.md)
