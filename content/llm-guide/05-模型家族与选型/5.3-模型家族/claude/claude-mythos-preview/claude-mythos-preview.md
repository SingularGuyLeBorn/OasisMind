---
title: "Claude Mythos Preview"
category: "模型家族与选型"
tags: ["claude", "anthropic", "mythos", "project-glasswing", "网络安全"]
published: true
as_of: "2026-09-01"
excerpt: "Claude Mythos Preview 的 Project Glasswing 受控发布、网络安全能力与退役迁移。"
---

# Claude Mythos Preview

> 核验日期：2026-09-01。Mythos Preview 是真实的通用前沿模型，但因网络安全双重用途能力未做普遍发布，只在 Project Glasswing 中受控提供。

## 结论卡

| 字段 | 结论 |
|---|---|
| 公布日期 | 2026-04-07 |
| 产品身份 | 通用高能力研究预览；Project Glasswing 的首个模型 |
| 可用性 | 面向通过安全要求的关键基础设施、软件与安全合作伙伴；不是普通 GA |
| 公开价格 | $25 输入 / $125 输出，每百万 token；Anthropic 同时承诺项目使用额度 |
| 主要风险 | 漏洞发现、利用开发等强网络安全能力具有明显双重用途 |
| 生命周期 | 当前已弃用；迁移目标为 Claude Mythos 5 |

## 为什么没有普遍发布

Anthropic 的系统卡和红队研究称，Mythos Preview 在软件工程、推理、Computer Use、知识工作和研究辅助上有广泛提升，尤其在漏洞发现与利用开发上出现阶跃式能力。公司因此选择与约 50 个初始合作伙伴开展 Project Glasswing，把使用限制在防御性安全工作，并逐步扩展经过审核的参与者。

“未普遍发布”不等于“模型不存在”；“合作伙伴可调用”也不等于开放 API。知识库必须同时记录真实身份、受控访问和风险原因。

## 评测与成果如何读

官方材料报告模型在安全基准和真实漏洞扫描中取得突出结果，并称合作项目发现大量高危或严重漏洞。这些结果需要结合去重、人工验证、披露与修复流程理解；发现候选不能直接等同于确认的独立漏洞。

## 与 Mythos 5 的关系

[Claude Mythos 5](../claude-mythos-5/claude-mythos-5.md) 是其后继，价格降至 $10 / $50，并继续通过 Glasswing 受控提供。版本迁移需重新核对模型 ID、分类器差异、数据保留与项目条款。

## 官方来源

- [Project Glasswing](https://www.anthropic.com/glasswing)
- [Assessing Claude Mythos Preview's cybersecurity capabilities](https://www.anthropic.com/research/mythos-preview)
- [Claude Mythos Preview system card](https://www-cdn.anthropic.com/8b8380204f74670be75e81c820ca8dda846ab289.pdf)
- [Model deprecations](https://platform.claude.com/docs/en/about-claude/model-deprecations)

[返回 Claude 家族](../claude.md)
