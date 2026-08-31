---
title: "MiniCPM-V 2.6"
category: "模型家族与选型"
tags: ["minicpm-v", "视频理解", "多图理解", "qwen2"]
published: true
as_of: "2026-09-01"
excerpt: "梳理 MiniCPM-V 2.6 的 8B 架构、多图/视频能力及端侧实时演示与可复现性能的区别。"
---

# MiniCPM-V 2.6

MiniCPM-V 2.6 于 2024 年 8 月 6 日开源。官方文档给出的组合是 **SigLIP-400M + Qwen2-7B，总计约 8B 参数**。它在 2.5 的单图能力上加入多图、视频理解和多图上下文学习。

## 从图像到视频

视频输入通常不是连续处理全部帧，而是采样若干帧，把每帧变为视觉 token 后交给语言模型。可处理“视频”不代表逐帧无损：采样间隔可能漏掉瞬时事件，帧数增加会挤占文本和输出预算，重复画面也会浪费上下文。

端侧“实时视频理解”演示还包含摄像头采样、预处理、视觉编码、预填充和文本生成。演示流畅度不是一个单独模型指标；复现时需要记录设备、量化、帧率、采样帧数、分辨率和回答长度。

## 多图与上下文学习

多图问答要显式维护图像顺序和文本指代。模型能接收多图，不保证对数十张图的绑定关系稳定。评测应覆盖：跨图比较、同类细节区分、图文顺序扰动和无关图像干扰。

官方模型卡展示多种部署路径，包括 Transformers、llama.cpp/GGUF、vLLM 与微调工具。各路径支持的模态、最大帧数和量化精度可能不同，应以当期后端文档为准。

## 评测口径

官方 OpenCompass、OCRBench、Video-MME 等成绩是指定提示词和采样配置下的自报结果。对闭源模型的横向比较还可能使用不同 API 日期；应保留“官方报告结果”属性，不写成不带条件的普遍超越。

## 许可

代码为 Apache-2.0；模型卡要求 2.6 权重遵守 MiniCPM Model License，并说明商业使用登记规则。不要把后来的 `o 2.6` Apache-2.0 权重条款自动回填到 `V 2.6`。

## 一手来源

- [MiniCPM-V 2.6 官方文档](https://github.com/OpenBMB/MiniCPM-V/blob/main/docs/minicpm_v2dot6_en.md)
- [MiniCPM-V 2.6 模型卡](https://huggingface.co/openbmb/MiniCPM-V-2_6)
- [MiniCPM-V 官方仓库](https://github.com/OpenBMB/MiniCPM-V)

[← 返回 MiniCPM 家族](../minicpm.md)
