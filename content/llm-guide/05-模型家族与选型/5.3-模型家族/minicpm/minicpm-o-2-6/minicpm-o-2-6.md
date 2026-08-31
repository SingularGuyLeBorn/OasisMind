---
title: "MiniCPM-o 2.6"
category: "模型家族与选型"
tags: ["minicpm-o", "全模态", "语音交互", "流式多模态"]
published: true
as_of: "2026-09-01"
excerpt: "解释 MiniCPM-o 2.6 的 8B 端到端组件、语音/视觉流式交互，以及它与真正全双工 4.5 的差异。"
---

# MiniCPM-o 2.6

MiniCPM-o 2.6 于 2025 年 1 月 13 日开源。官方模型卡给出：SigLIP-400M、Whisper-medium-300M、ChatTTS-200M 与 Qwen2.5-7B 组成端到端约 8B 参数模型，支持图像、视频、文本、音频输入以及文本、语音输出。

## “端到端”意味着什么

各模态编码器和语言模型在一个模型接口中协同，语音输出也由模型组件生成。这比“先 ASR、再调用文本 LLM、最后独立 TTS”的松散流水线具有更紧的训练与交互接口，但内部仍然存在明确的视觉、语音识别、语言和语音合成组件。端到端不等于单一同构网络，也不等于误差不会跨组件传播。

## 实时流式交互

2.6 支持实时语音对话和多模态直播场景。流式系统的体验取决于音频分块、端点检测、视觉采样、首 token/首音频延迟和打断策略。报告中的能力展示不能代替噪声、口音、回声、多人说话和网络抖动测试。

需要特别区分：MiniCPM-o 4.5 明确引入输入流与输出流互不阻塞的全双工框架；不能把 4.5 的 Omni-Flow、主动提醒或并发“边听边说”机制回填到 2.6。

## 部署边界

官方说明 llama.cpp 的支持曾仅覆盖 vision-only 模式；不同后端未必同时实现音频输入、语音输出和实时模式。使用量化检查点时还要分别测视觉、语音和文本质量，不能仅用文本困惑度判断。

## 许可

官方 2.6 模型卡明确将 MiniCPM-o/V 的该模型权重与代码按 Apache-2.0 开放，并把登记问卷写为可选。许可表述与部分早期 `V` 模型不同，应保留精确仓库和日期。

## 一手来源

- [MiniCPM-o 2.6 模型卡](https://huggingface.co/openbmb/MiniCPM-o-2_6)
- [MiniCPM-o 2.6 官方文档](https://github.com/OpenBMB/MiniCPM-V/blob/main/docs/minicpm_o2dot6_en.md)
- [MiniCPM-V/o 官方仓库](https://github.com/OpenBMB/MiniCPM-V)

[← 返回 MiniCPM 家族](../minicpm.md)
