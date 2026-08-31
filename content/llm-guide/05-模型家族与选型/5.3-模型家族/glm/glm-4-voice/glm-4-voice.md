---
title: "GLM-4-Voice"
category: "模型家族与选型"
tags: ["glm-4-voice", "语音对话", "多模态"]
published: true
as_of: "2026-09-01"
excerpt: "GLM-4-Voice 的语音 tokenizer、9B 对话模型、流式解码器和许可边界。"
---

# GLM-4-Voice

## 身份

GLM-4-Voice 于 2024 年 10 月 25 日开源，是端到端中英语音对话系统。它能接收文本或语音，并同时生成文本与语音；“端到端”指语音 token 进入语言模型并由语音解码器还原，不代表系统只有一个权重文件。

## 三个组件

| 组件 | 作用 |
|---|---|
| GLM-4-Voice-Tokenizer | 基于 Whisper encoder 加向量量化，把连续语音压成约 12.5 token/秒的离散表示 |
| GLM-4-Voice-9B | 基于 GLM-4-9B，学习理解和生成离散语音 token |
| GLM-4-Voice-Decoder | 基于 CosyVoice 的 Flow Matching 结构，把语音 token 流式还原为波形 |

官方仓库称 9B 模型使用数百万小时音频及数千亿音频—文本交错 token 进行预训练。此处是项目方口径；没有公开可供第三方完整复现的数据清单。语音生成可控制情绪、语调、语速和部分方言，但质量、口音覆盖和延迟必须在目标设备上实测。

## 流式边界

模型交替生成文本与语音模态，语音以文本响应为内容参照。仓库说明 decoder 最少约 10 个语音 token 可开始流式解码；中文说明另写“输出 20 个 token 便可合成语音”，两句话所指阶段不同，不应合并成单一端到端延迟保证。

## 许可与部署

仓库代码为 Apache-2.0；GLM-4-Voice 权重遵循 GLM-4 模型许可。实际部署需要分别下载 tokenizer、9B 模型和 decoder，并处理子模块、音频依赖、GPU 精度与流式播放问题。

## 一手来源

- [GLM-4-Voice 官方仓库](https://github.com/zai-org/GLM-4-Voice)
- [GLM-4-Voice 技术报告](https://arxiv.org/abs/2412.02612)
- [语音—文本交错预训练论文](https://arxiv.org/abs/2411.17607)

[← 返回 GLM 模型家族](../glm.md)
