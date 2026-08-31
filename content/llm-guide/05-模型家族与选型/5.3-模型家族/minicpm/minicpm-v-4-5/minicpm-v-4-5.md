---
title: "MiniCPM-V 4.5"
category: "模型家族与选型"
tags: ["minicpm-v", "3d-resampler", "视频理解", "多模态"]
published: true
as_of: "2026-09-01"
excerpt: "从 9B 模型、3D-Resampler、时空 token 压缩与训练配方理解 MiniCPM-V 4.5。"
---

# MiniCPM-V 4.5

MiniCPM-V 4.5 于 2025 年 8 月 26 日开源，技术报告于 9 月发布。官方模型卡把它列为约 9B 参数视觉语言模型，许可证为 Apache-2.0。

## 3D-Resampler

早期重采样主要在单帧空间维压缩视觉特征。4.5 技术报告提出 3D-Resampler，把视频的空间与时间维一起考虑：在控制视觉 token 预算时，避免逐帧独立压缩后简单拼接造成的冗余，并尝试保留跨帧运动与事件信息。

“3D”描述特征处理的时空维度，不意味着模型原生重建 3D 几何，也不保证细粒度动作不会因采样或压缩丢失。视频评测应同时改变帧数、片段长度、事件持续时间和视觉压缩预算。

## 训练配方比单一模块更重要

报告把提升归因于架构、数据和训练流程的组合，包括视觉表征、重采样、预训练/指令数据与多模态对齐。不能把全部榜单提升都归因于 3D-Resampler，也不能从一个模块名反推出未公开的数据比例。

模型支持单图、多图、视频和 OCR 等任务。官方声称的闭源模型对比来自指定版本和评测协议；知识库只把它们作为官方自报基线，不写成跨时间、跨 API 设置的绝对排名。

## 推理模式与资源

9B BF16 权重、视觉编码和 KV cache 对端侧内存构成共同压力，量化可降低权重占用但可能影响 OCR、细粒度视觉和长输出。应分别验收 Instruct/Thinking 配置、图像与视频任务；不要用纯文本速度代表多模态吞吐。

## 一手来源

- [MiniCPM-V 4.5 模型卡](https://huggingface.co/openbmb/MiniCPM-V-4_5)
- [MiniCPM-V 4.5 技术报告](https://arxiv.org/abs/2509.18154)
- [MiniCPM-V/o 官方仓库](https://github.com/OpenBMB/MiniCPM-V)

[← 返回 MiniCPM 家族](../minicpm.md)
