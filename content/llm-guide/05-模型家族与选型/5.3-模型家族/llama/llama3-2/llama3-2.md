---
title: "Llama 3.2"
category: "模型家族与选型"
tags: ["llama3.2", "端侧模型", "视觉语言模型", "开放权重"]
published: true
as_of: "2026-09-01"
excerpt: "1B/3B 端侧文本模型与 11B/90B Vision：128K 上下文、跨注意力视觉适配器和许可地域边界。"
---

# Llama 3.2

> 核验日期：2026-09-01。Llama 3.2 同时包含文本小模型和 Vision 模型，两组不能用一行规格混写。

## 结论卡

| 系列 | 参数口径 | 输入 → 输出 | 上下文 | 架构要点 |
|---|---:|---|---:|---|
| Text | 1B（1.23B）、3B（3.21B） | 多语言文本 → 文本/代码 | 128K | 稠密自回归 Transformer、GQA、共享输入/输出嵌入 |
| Text Quantized | 1B、3B | 多语言文本 → 文本/代码 | 8K | Meta 官方 QAT+LoRA 或 SpinQuant 量化版本；不能标成 128K |
| Vision | 11B（10.6B）、90B（88.8B） | 文本+图像 → 文本 | 128K | 基于 Llama 3.1 文本模型，外接视觉编码器与跨注意力适配器 |

首次发布为 2024-09-25。文本和 Vision 均有自定义 Llama 3.2 Community License；具体可用形态还要区分 Pretrained、Instruct 与官方量化检查点。

## 两条产品线

### 文本 1B/3B

- 面向端侧/边缘场景，如摘要、改写、检索辅助和工具调用。
- 模型卡给出的非量化上下文是 128K，但 Meta 后续发布的官方量化版本为适配移动资源，把目标场景限制到 8K。
- 官方支持八种语言；“训练过更多语言”不等于那些语言都有同等质量保证。

### Vision 11B/90B

- 图像和文本输入、文本输出，面向视觉问答、图表/文档理解、图像描述和视觉定位。
- 视觉编码器经单独训练，跨注意力层把图像表征送入 Llama 3.1 语言模型；语言模型参数在适配器训练阶段有意保持冻结。它不是 Llama 4 的 early-fusion 原生多模态结构。
- 文本任务官方支持八种语言；图文联合使用的模型卡官方支持语言是英语。不能把文本多语言口径扩成多语言视觉保证。

## 训练与评测边界

- Vision 模型卡披露约 6B 图文对和 300 万以上合成后训练样本，但未发布可完整复现的全量数据。
- benchmark 分数依赖单图、提示模板、图像分辨率和评测代码；模型卡规格不是 OCR、医疗影像或视频理解的生产保证。
- 11B/90B 的参数数字包含语言模型、视觉编码器和适配器，不能与纯文本 8B/70B 直接按名称比较。

## 许可与地域边界

Llama 3.2 是开放权重、自定义商业社区许可，而非 OSI 开源。许可证主文 §1.b.iv 把 Acceptable Use Policy 纳入协议；截至本页 `as_of: 2026-09-01`，该官方政策对多模态模型还有欧盟主体限制：欧盟居民或主要营业地在欧盟的公司不获授对应多模态模型权利；集成产品的终端用户例外需按原文理解。此限制来自 Llama 3.2 自己的当版政策，不应错误套到 1B/3B 纯文本权重，也不能忽略于 11B/90B Vision。

## 一手来源

- [Meta Llama 3.2 官方公告](https://ai.meta.com/blog/llama-3-2-connect-2024-vision-edge-mobile-devices/)
- [Llama 3.2 文本模型卡](https://github.com/meta-llama/llama-models/blob/main/models/llama3_2/MODEL_CARD.md)
- [Llama 3.2 Vision 模型卡](https://github.com/meta-llama/llama-models/blob/main/models/llama3_2/MODEL_CARD_VISION.md)
- [Llama 3.2 Community License](https://github.com/meta-llama/llama-models/blob/main/models/llama3_2/LICENSE)
- [Llama 3.2 Acceptable Use Policy](https://github.com/meta-llama/llama-models/blob/main/models/llama3_2/USE_POLICY.md)
- [Meta 官方量化 Llama 3.2 公告](https://ai.meta.com/blog/meta-llama-quantized-lightweight-models/)

[← 返回 Llama 家族](../llama.md) · [模型家族索引](../../5.3-模型家族.md)
