---
title: "01 · Doubao Lite: 字节端侧极致压缩 架构精译"
date: 2026-08-30
as_of: 2026-08-30
tags: [Doubao-1.5-lite, 公开材料精读]
---

> 来源快照：保留旧稿供事实追溯；公开、已校勘版本见 [公开校勘页](../../../../05-模型家族与选型/5.3-模型家族/doubao/lite/lite.md)。




# Doubao Lite: 字节端侧极致压缩

>  **[返回 14.17-Doubao 家族总览](../../../../05-模型家族与选型/5.3-模型家族/doubao/doubao.md)**

> 该家族依靠其独特的算力优势与数据护城河，在 LLM 红海中占据了核心生态位。

标题「端侧极致压缩」是 2025 占位。**官方 1.5-lite 是云上轻量语言模型**，火山方舟 API，不是端侧小模型。轴心：[豆包 1.5 发布](https://developer.volcengine.com/articles/7462939272262189083)（2025-01-22）+ 技术页 [Doubao-1.5-pro](https://team.doubao.com/zh/special/doubao_1_5_pro)（lite 与 pro 同一套 1.5 结构叙事）。基准图在技术页里，**正文没有把 lite 的 MMLU 写成百分数**，本篇不估柱。

## 1. 产品

Doubao-1.5-lite：轻量档。官方：在 MMLU_pro / BBH / MATH / GPQA 上持平或超越 GPT-4o mini、Claude 3.5 Haiku；效果可对比 2024-09 的 Doubao-pro-32k-0828——用 lite 价拿旧 pro 效果。价格「加量不加价」。vision-pro / realtime-voice 是并列 SKU，**不 mkdir**。

结构：1.5 系列 **大规模稀疏 MoE**，较小激活参数预训练，官方等效 **7 倍**激活参数的 Dense（对比业内 MoE「约 3 倍杠杆」）。这是 **pro/lite 共用的结构叙事**，不是 lite 独有端侧量化表。

## 2. 不要写成端侧

没有公布 lite 的总参/激活参、没有 on-device / NPU 句。W4A8、PD 分离、Prefill Tensor Core ~60% 写在 **1.5-pro 推理系统**段，见 [Pro D2](../../../../05-模型家族与选型/5.3-模型家族/doubao/pro/pro.md)，不要假装 lite 有单独 serving 论文。

## 参考文献

- https://developer.volcengine.com/articles/7462939272262189083
- https://team.doubao.com/zh/special/doubao_1_5_pro
