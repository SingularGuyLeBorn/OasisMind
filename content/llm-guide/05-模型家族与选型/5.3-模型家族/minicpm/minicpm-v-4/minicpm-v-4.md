---
title: "MiniCPM-V 4.0"
category: "模型家族与选型"
tags: ["minicpm-v", "siglip2", "minicpm4", "端侧多模态"]
published: true
as_of: "2026-09-01"
excerpt: "记录 MiniCPM-V 4.0 的 4.1B 精确组合、端侧效率主张和多图/视频能力边界。"
---

# MiniCPM-V 4.0

MiniCPM-V 4.0 于 2025 年 8 月 2 日开源。官方文档给出的精确组合是 **SigLIP2-400M + MiniCPM4-3B，总计 4.1B 参数**。它保留单图、多图和视频理解，同时把效率作为主要目标。

## 为什么它不是“MiniCPM4-8B 加视觉”

语言骨干明确写为 MiniCPM4-3B，不是公开文本主型号 MiniCPM4-8B，也不能从名称推断为 MiniCPM4.0 的所有文本训练配置。模型身份应以 `openbmb/MiniCPM-V-4` 的配置和模型卡为准。

官方报告在 iPhone 16 Pro Max 给出低于 2 秒首 token、超过 17 token/s 等演示指标。这是指定设备、应用、量化和输入下的结果。图片分辨率、切片数、视频帧数和输出长度都会显著改变延迟；选型时需重建完整端到端测量。

## 能力定位

4.0 的主要价值是把 2.6 的多图/视频能力下沉到更小总参数规模。它没有 `o` 系列的语音输入输出，也没有 4.5 的 3D-Resampler 技术报告或 4.6 的混合 4×/16× 视觉压缩。版本号相邻不意味着这些机制存在。

官方 OpenCompass/OCR 等横向成绩应标注为官方评测。对于文档/OCR实际使用，建议额外测旋转、模糊、小字号、多栏、跨页表格和结构化输出合法率。

## 许可与部署

官方模型卡标示 Apache-2.0，并提供 Transformers、llama.cpp、Ollama、vLLM、SGLang 与微调生态入口。框架支持是随版本变化的外部状态；固定运行时版本并验证图像与视频路径，而不仅是文本 smoke test。

## 一手来源

- [MiniCPM-V 4.0 官方文档](https://github.com/OpenBMB/MiniCPM-V/blob/main/docs/minicpm_v4_en.md)
- [MiniCPM-V 4.0 模型卡](https://huggingface.co/openbmb/MiniCPM-V-4)
- [MiniCPM-V/o 官方仓库](https://github.com/OpenBMB/MiniCPM-V)

[← 返回 MiniCPM 家族](../minicpm.md)
