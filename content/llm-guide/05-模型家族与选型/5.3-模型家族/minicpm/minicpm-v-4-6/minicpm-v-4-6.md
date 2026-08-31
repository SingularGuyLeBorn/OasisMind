---
title: "MiniCPM-V 4.6"
category: "模型家族与选型"
tags: ["minicpm-v", "视觉token压缩", "llava-uhd-v4", "端侧多模态"]
published: true
as_of: "2026-09-01"
excerpt: "记录 MiniCPM-V 4.6 的 1.3B 架构、ViT 内提前压缩、4×/16× 混合视觉压缩和独立 Thinking 检查点。"
---

# MiniCPM-V 4.6

MiniCPM-V 4.6 于 2026 年 5 月 11 日开源，是截至核验日最小的 MiniCPM-V 版本之一。官方给出 **SigLIP2-400M + Qwen3.5-0.8B，总计约 1.3B 参数**，并提供 Instruct 与独立 Thinking 检查点。

## 在 ViT 内提前压缩

很多视觉语言模型在视觉编码器完成高分辨率计算后才压缩 token，前段 ViT 已经付出较高成本。4.6 采用 LLaVA-UHD v4 路线，在视觉编码过程中更早压缩特征；官方称视觉编码 FLOPs 降低超过 50%。该数字描述官方实现与对照，端到端收益还受图片切片、CPU 预处理、语言解码和后端影响。

## 4×/16× 混合视觉 token 压缩

模型可以在较保真的 4× 与更激进的 16× 压缩之间取舍。高压缩适合大图概览或吞吐敏感场景，低压缩更适合小字、图表、定位等细节任务。实际路由不应只按文件大小决定，而应根据任务、区域密度和失败成本评测。

## Instruct 与 Thinking

4.6 把 `openbmb/MiniCPM-V-4.6` 与 `openbmb/MiniCPM-V-4.6-Thinking` 发布为独立检查点；这与部分版本在同一权重上用开关切换不同。部署清单必须记录完整模型 ID，不能只记“4.6”。Thinking 会增加输出预算与延迟，且不保证视觉事实更准确。

## 端侧与框架

官方展示 iOS、Android、HarmonyOS 适配，并提供 GGUF、BNB、AWQ、GPTQ 等变体。模型仓库给出的 4GB GPU/2GB GGUF 指引属于特定格式和基本运行场景；视频帧数、上下文、并发和 runtime 缓冲区会改变峰值。

官方仓库标示 Apache-2.0。推理依赖较新 Transformers/视频解码组件，生产环境应固定版本，并对图片、视频和 Thinking 两条路径分别做回归。

## 一手来源

- [MiniCPM-V/o 官方仓库与 4.6 说明](https://github.com/OpenBMB/MiniCPM-V)
- [MiniCPM-V 4.6 模型卡](https://huggingface.co/openbmb/MiniCPM-V-4.6)
- [MiniCPM-V 4.6 Thinking 模型卡](https://huggingface.co/openbmb/MiniCPM-V-4.6-Thinking)
- [LLaVA-UHD v4 论文](https://arxiv.org/abs/2605.08985)

[← 返回 MiniCPM 家族](../minicpm.md)
