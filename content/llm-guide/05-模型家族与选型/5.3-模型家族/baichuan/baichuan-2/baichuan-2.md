---
title: "Baichuan 2"
category: "模型家族与选型"
tags: ["baichuan", "模型版本", "证据分级"]
published: true
as_of: "2026-09-01"
excerpt: "Baichuan 2 的模型矩阵、训练披露、许可与评测边界。"
---

# Baichuan 2

> 核验日期：2026-09-01。本文只写可回到一手材料的事实；服务规格、价格与可用区以使用当天的官方文档为准。

## 结论卡

| 字段 | 结论 |
|---|---|
| 官方名称 | Baichuan2-7B / Baichuan2-13B（Base、Chat 与 Chat-4bit） |
| 发布日期 | 2023-09-06（官方仓库发布）；技术报告 2023-09-19 |
| 获取方式 | 开放权重；Apache 2.0 与 Baichuan 2 社区许可共同约束 |
| 证据级别 | 官方仓库 + 技术报告 |

## 发布与证据

Baichuan 2 是 7B/13B 的新一代多语言模型系列，不是 Baichuan-13B 的补丁版本。

## 相对上代变化

相对第一代扩大公开训练到 2.6T tokens，并发布 7B/13B 的 Base、Chat 与 Chat 4-bit 变体及中间 checkpoints。

## 已披露的技术事实

- 技术报告披露 7B 与 13B 从头训练、2.6T tokens。
- 官方仓库提供 Base、Chat、Chat-4bit，以及用于研究训练动态的中间 checkpoints。
- Baichuan2-192K 是长上下文变体，不能把 192K 回写为全部 Baichuan 2 checkpoint 的窗口。

## 未披露与不应推断

- 语料的完整明细、权重比例与所有过滤规则未公开。
- 商用并非只看 Apache 2.0；社区许可含主体与使用条件。

## 评测协议

- 论文报告 MMLU、CMMLU、GSM8K、HumanEval 等；引用时必须保留模型尺寸与 Base/Chat 身份。
- 论文表格是发布方结果；需要独立复现时固定 tokenizer、prompt、shot 和 generation。

## 适用边界

- 研究使用可利用中间 checkpoints；商用前逐条检查社区许可。
- 4-bit Chat 是量化变体，不能与 FP 权重在未说明设置时横向比较。

## 证据与版本边界

本页按官方身份与一手证据维护唯一正本。产品名、API 型号、底层 checkpoint 与版本日期只有在官方明确映射时才视为同一对象；报告摘录、自动提取文本和未逐项核证的历史解读不构成独立证据。

## 一手来源

- [Baichuan 2 官方仓库](https://github.com/baichuan-inc/Baichuan2)
- [Baichuan 2 技术报告](https://arxiv.org/abs/2309.10305)

[← 返回 Baichuan 家族](../baichuan.md)
