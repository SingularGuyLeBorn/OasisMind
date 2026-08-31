---
title: "02 · GLM-4-Voice 核心架构剖析"
date: 2026-08-30
status: completed
tags: [GLM-4-Voice, SpeechLM, 流式思考, 语音分词]
---

# GLM-4-Voice 核心架构剖析

>  **[返回 14.6-GLM 家族总览](../../14.6-GLM.md)**

> 本文档基于 D2 精译和 D4 逐段精读整理, 聚焦核心技术点的深度剖析.
> 状态: completed.
> as_of: 2026-08-30
> 一手来源: [arXiv:2412.02612](https://arxiv.org/abs/2412.02612)

---

## 1 设计动机与核心洞察

级联 ASR→LLM→TTS：串行延迟、错误放大、语气丢失。端到端 SpeechLM 直接语音对语音，但公开语音比文本少几个数量级。

insight：**用 text-to-token 把文本预训练朗读成交错数据，在 ~1T token 上做知识迁移**，而不是 Moshi 式堆千万小时真语音。9B 从 GLM-4-9B-Base 续训。展开见 [05-GLM-4-Voice-Architecture-Overview](./05-GLM-4-Voice-Architecture-Overview.md)。链 [8.3](../../../8-多模态/8.3-音频与语音模型/8.3-音频与语音模型.md)。

---

## 2 原理推导

### 2.1 监督语义 token

Whisper-large-v3 Encoder 中段插 VQ，50Hz 池化到 12.5Hz，单码本约 175 bps。12.5Hz 相对 50Hz：LS-clean WER 2.10 vs 1.85；6.25Hz 则 WER 14.41。

### 2.2 Decoder 与流式思考

token → 流匹配 → HiFi-GAN。块 0.8s；约 10 个语音 token 出第一块。流式思考按 **13 文本 : 26 语音** 交错。S→S Llama Questions 50.7% vs Moshi 21.0%；S→T 仍高于 S→S。

---

## 3 工程实现细节

- 交错 455B speech + 279B text；文本占比锁 30%；lr $6\times10^{-5}\to6\times10^{-6}$。
- SFT 损失掩码：语音 20 epoch、文本 4 epoch；dropout 0.5。
- 论文：General QA 5.40 vs Moshi 2.42；UTMOS 4.45。

---

## 4 与同类技术对比

| 路线 | 数据哲学 | 代表 | 倾向 |
|------|----------|------|------|
| 真语音 scaling | 百万小时录音 | Moshi | 自然度、全双工 |
| 知识迁移 + 合成交错 | 1T 合成 token | GLM-4-Voice | 问答/知识 |
| LLM 后接 TTS | 无语音预训练 | Llama-Omni | 实现快、语音薄 |

---

## 5 局限性与风险

1. 合成音色天花板 = text-to-token 质量。
2. S→S 仍低于 S→T。
3. 0.8s 块对抢话全双工不够。
4. 2024-12 论文；2026 omni 模型要另文比。

---

## 6 知识库同步

- [01-GLM-4-Voice技术报告精译](./01-GLM-4-Voice技术报告精译.md)、[05-GLM-4-Voice-Architecture-Overview](./05-GLM-4-Voice-Architecture-Overview.md)
- [8.3-音频与语音模型](../../../8-多模态/8.3-音频与语音模型/8.3-音频与语音模型.md)
