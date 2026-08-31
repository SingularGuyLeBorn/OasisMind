---
title: "DeepSeek-V4"
category: "模型家族与选型"
tags: ["deepseek", "模型家族", "开放权重"]
published: true
as_of: "2026-09-01"
excerpt: "百万 token 上下文的 MoE 系列，分 Pro 与 Flash，并在 2026 年中继续滚动更新 API/权重。"
---

# DeepSeek-V4

> 核验日期：2026-09-01。这里区分模型身份、检查点、API 路由和厂商评测，不把未披露实现或当前 API 别名写成架构事实。

## 结论卡

| 字段 | 已核实信息 |
|---|---|
| 发布/论文日期 | 2026-04-24（Preview）；Flash 2026-07-31 更新，Pro 2026-08-13 GA |
| 定位 | 百万 token 上下文的 MoE 系列，分 Pro 与 Flash，并在 2026 年中继续滚动更新 API/权重。 |
| 参数 | Pro 1.6T/49B 激活；Flash 284B/13B 激活（技术报告） |
| 上下文 | 1M |
| 模态 | Pro/Flash 为文本；Flash-Vision-Exp 是 2026-08-21 单独实验多模态 API |
| 许可 | 官方 Pro/Flash 仓库与权重 MIT |

## 已披露事实

- 技术报告同时覆盖 Pro 与 Flash：混合 CSA/HCA、mHC、Muon，以及超过 32T token 预训练。
- 官方报告的 284B/13B 是 Flash 架构参数口径；托管页面的文件统计不应覆盖报告表。
- 截至 2026-09-01，Flash 与 Pro 已在 7 月/8 月更新；旧 Preview 基准不能冒充当前 GA 表现。

## 证据边界

- V4 报告是 Preview 系列报告；后续 0731/0813 更新主要披露后训练与产品能力，未重新公开完整训练配方。
- Flash-Vision-Exp 是实验性 API 身份，不得把视觉能力写到所有 V4 文本权重上。

## 部署与选型

- Pro 和 Flash 的规模、吞吐、知识能力与价格定位不同，应分别压测。
- 官方 checkpoint 使用混合精度和专用编码脚本；1M 标称窗口仍需按硬件、KV 与延迟预算验收。

## 一手来源

- [技术报告/官方模型卡](https://huggingface.co/deepseek-ai/DeepSeek-V4-Pro)
- [官方 Preview 发布说明](https://api-docs.deepseek.com/news/news260424/)
- [官方 V4-Pro GA 发布说明](https://api-docs.deepseek.com/news/news260813/)
- [官方更新日志（含 Flash/Vision）](https://api-docs.deepseek.com/updates/)
- [官方 V4 集合](https://huggingface.co/collections/deepseek-ai/deepseek-v4)

[← 返回 DeepSeek 家族](../deepseek.md) · [模型家族索引](../../5.3-模型家族.md)
