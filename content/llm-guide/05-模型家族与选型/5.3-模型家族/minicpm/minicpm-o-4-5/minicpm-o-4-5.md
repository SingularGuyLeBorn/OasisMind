---
title: "MiniCPM-o 4.5"
category: "模型家族与选型"
tags: ["minicpm-o", "全双工", "omni-flow", "实时多模态"]
published: true
as_of: "2026-09-01"
excerpt: "解释 MiniCPM-o 4.5 的 9B 端到端组件、Omni-Flow 全双工机制、主动交互与生产边界。"
---

# MiniCPM-o 4.5

MiniCPM-o 4.5 于 2026 年 2 月 3 日开源，技术报告于 5 月 7 日公开。官方给出的组件是 **SigLIP2、Whisper-medium、CosyVoice2 与 Qwen3-8B，总计约 9B 参数**，许可证为 Apache-2.0。

## 全双工不是“响应更快”的同义词

传统级联语音助手常按“听完 → 识别 → 思考 → 说完”串行执行。4.5 的全双工流式能力允许实时视频/音频输入流与文本/语音输出流并发、不互相阻塞，使系统可以边看、边听、边说，并在新证据到来时继续处理。

Omni-Flow 是支撑这种交互的流式框架。真正的全双工产品还需要打断检测、回声消除、说话人区分、输出取消、状态一致性和重复动作抑制；模型展示不能替代这些系统工程。

## 主动交互的风险边界

主动提醒意味着系统在没有显式新问题时，根据持续输入决定是否发声。它会引入误触发、隐私和安全风险。生产设计至少应包括：明确的传感器状态提示、可关闭的主动模式、事件置信阈值、冷却时间、敏感场景禁用与本地数据保留策略。

## 模态与组件

视觉与视频由 SigLIP2 路线编码，语音理解使用 Whisper-medium，语音生成使用 CosyVoice2，Qwen3-8B 负责核心语言/推理。组件名称有助于理解能力来源，也说明模型错误可能来自 ASR、视觉压缩、语言推理或语音合成的任一环节。

官方模型卡列出的约 19GB GPU 内存是特定发布格式的指引，不是所有输入下的峰值。长视频、多路音频、KV cache 与并发会增加占用；GGUF/AWQ 也有独立限制。

## 一手来源

- [MiniCPM-o 4.5 模型卡](https://huggingface.co/openbmb/MiniCPM-o-4_5)
- [MiniCPM-o 4.5 技术报告](https://arxiv.org/abs/2604.27393)
- [MiniCPM-V/o 官方仓库](https://github.com/OpenBMB/MiniCPM-V)
- [官方 API 说明](https://github.com/OpenBMB/MiniCPM-V/blob/main/docs/api.md)

[← 返回 MiniCPM 家族](../minicpm.md)
