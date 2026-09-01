---
title: "Pixtral Large"
category: "模型家族与选型"
tags: ["mistral", "模型版本", "证据分级"]
published: true
as_of: "2026-09-01"
excerpt: "Pixtral Large 的 128K、多模态研究权重与退役边界。"
---

# Pixtral Large

> 核验日期：2026-09-01。本文把发布、权重、产品入口和 API 别名分开；价格、区域、限流和别名均以调用当日文档为准。

## 结论卡

| 字段 | 结论 |
|---|---|
| 官方名称 | Pixtral Large 24.11 |
| 证据日期 | 2024-11-18（官方模型文档） |
| 开放状态 | 研究权重/Mistral Research License；历史 API，已由后代替代 |
| 输入/输出模态 | 文本、图像输入；文本输出 |
| 上下文 | 128K tokens |
| 许可与部署边界 | Mistral Research License；商用/生产部署不可按 Apache 2.0 处理 |
| 证据级别 | 官方发布页、官方模型文档、官方仓库或技术报告 |

## 发布与证据

Pixtral Large 是 Large 级多模态历史型号；它与 Apache 2.0 的 Pixtral 12B 许可不同。

## 相对上代变化

相对 Pixtral 12B，扩大模型档位与能力；后续通用多模态能力合并到 Medium 3.5/Small 4。

## 已披露的技术事实

- 128K、多图/文档理解；官方 docs 标注研究许可与生命周期。

## 未披露与不应推断

- 参数/内部训练细节不从 Large 2 或后继模型倒推。

## 评测协议

固定 24.11 checkpoint、许可、视觉输入与服务日期；退役 alias 不用于新基准。

## 适用边界

历史研究/企业集成；新项目优先官方当前替代型号。

## 证据与版本边界

本页按官方身份与一手证据维护唯一正本。产品名、API 型号、底层 checkpoint 与版本日期只有在官方明确映射时才视为同一对象；报告摘录、自动提取文本和未逐项核证的历史解读不构成独立证据。

## 一手来源

- [Pixtral Large 官方文档](https://docs.mistral.ai/models/pixtral-large-24-11)
- [Mistral 当前模型总览](https://docs.mistral.ai/models)

[← 返回 Mistral 家族](../mistral.md)
