---
title: "Qwen3.8-Flash-Next"
category: "模型家族与选型"
tags: ["qwen", "模型版本", "证据分级"]
published: true
as_of: "2026-09-01"
excerpt: "Qwen3.8-Flash-Next 的 GDN/QSA、GR、N-gram 与 Qwen4 预览边界。"
---

# Qwen3.8-Flash-Next

> 核验日期：2026-09-01。本文只写可回到一手材料的事实；动态服务规格以使用当天官方文档为准。

## 结论卡

| 字段 | 结论 |
|---|---|
| 官方身份 | Qwen3.8-Flash-Next |
| 首次公开证据 | 2026-08-26 |
| 获取方式 | 开放权重；另有托管 Qwen3.8-Flash SKU |
| 参数口径 | 主模型 125B，加 51B N-gram Embedding 参数；每 token 激活 6B。三者须分口径列示，不能合并成单一“参数量” |
| 上下文 | 262,144 原生，可扩展至 1,000,000；扩展值不是无需配置的默认原生窗口 |
| 模态 | 文本、图像输入 → 文本输出 |
| 许可 | Qwen Community License 1.0，并非 Apache 2.0；商业归属与 Model-as-a-Service/AI Work Assistant 条款须直接核对官方 `LICENSE` |
| 证据级别 | 官方技术报告/仓库/模型卡/发布页 |

## 相对前序变化

在混合架构上加入 QSA、Gated Residual、N-gram Embedding 与 Muon 优化，并作为 Qwen4 架构的早期预览。

## 已披露的技术事实

- 主模型 125B 参数，另有 51B N-gram embedding，每 token 激活 6B；三种口径不能相加后简称“参数量”。
- 三层 GDN 配一层全局注意力；全局注意力使用 QSA 做微块级稀疏检索。
- 开放权重原生上下文 262,144，官方称可用 YaRN 扩到 1M；托管 1M 是独立服务配置。

## 未披露与不应推断

- 官方明确完整 Qwen4 家族仍待构建；本模型不是 Qwen4，也不能证明未来最终规格。
- 官方 benchmark 和内核加速比分母不同，不能跨训练/推理场景混写。

## 部署与选型边界

- 适合研究长上下文稀疏注意力、超稀疏 MoE 和高吞吐多模态部署。
- 部署要同时评估总权重/N-gram 存储、激活计算、host offload 和框架新架构支持。

## 证据与版本边界

本页按官方身份与一手证据维护唯一正本。产品名、API 型号、底层 checkpoint 与版本日期只有在官方明确映射时才视为同一对象；报告摘录、自动提取文本和未逐项核证的历史解读不构成独立证据。

## 一手来源

- [Qwen3.8-Flash-Next 官方仓库](https://github.com/QwenLM/Qwen3.8-Flash-Next)
- [官方技术报告 PDF](https://github.com/QwenLM/Qwen3.8-Flash-Next/blob/main/tech_report.pdf)
- [官方发布页](https://qwen.ai/blog?id=qwen3.8-flash-next)
- [官方模型卡](https://huggingface.co/Qwen/Qwen3.8-Flash-Next)

[← 返回 Qwen 家族](../qwen.md)
