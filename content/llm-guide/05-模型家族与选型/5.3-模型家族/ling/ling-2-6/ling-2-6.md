---
title: "Ling 2.6"
category: "模型家族与选型"
tags: ["ling", "模型版本", "证据"]
published: true
as_of: "2026-09-01"
excerpt: "Ling/Ring 2.6 正式报告、1T/flash 身份与 Agent 边界。"
---

# Ling 2.6

> 核验日期：2026-09-01。参数、上下文和许可只对应下列官方身份；不同尺寸、Base/Instruct 或滚动服务别名不得自动互换。

## 结论卡

| 字段 | 结论 |
|---|---|
| 官方身份 | Ling-2.6-1T / Ling-2.6-flash 等 |
| 证据日期 | 2026-06-13 技术报告 |
| 参数示例 | 1T SKU；flash=104B 总参数/7.4B 激活 |
| 定位 | 高效率 Agent 与推理多 SKU |
| 许可 | 官方模型卡 MIT |

## 定位与相对变化

Ling 2.6 已有正式技术报告；旧第 14 章“无公开报告”是过时判断。1T 与 flash 是不同成本/能力档，不应合并为一个参数表。

## 已披露事实

- Ling-2.6-flash 模型卡明确 104B/7.4B。
- Ling-2.6-1T 模型卡列出局限：长程一致性、跨语种偏移和效率平衡仍需改进。

## 未披露与证据边界

- Agent 评测依赖执行环境、工具权限、失败重试和 token 预算。
- 模型卡的公开服务/部署说明会变化，必须以使用日 revision 为准。

## 部署与选型

复杂多步 Agent 任务评估 1T；低延迟/较小激活量候选看 flash。两者都要固定工具 harness 并做失败率和成本回归。

评测数字只有在模型快照、提示模板、采样、工具链、数据版本和计分器一致时才可横向比较；本页不转抄厂商榜单制造永久排名。

## 迁移说明

本页是该身份在公开知识树中的唯一首页。旧第 14 章报告翻译、MinerU 提取物和原图进入 _sources/model-reports/ling/；未逐项核证的架构解读与重复索引进入 _archive/model-knowledge/ling/。

## 一手来源

- [Ling/Ring 2.6 技术报告](https://arxiv.org/abs/2606.15079)
- [Ling-2.6-1T 模型卡](https://huggingface.co/inclusionAI/Ling-2.6-1T)
- [Ling-2.6-flash 模型卡](https://huggingface.co/inclusionAI/Ling-2.6-flash)

[← 返回 Ling 家族](../ling.md)
