---
title: "MiniCPM-V 2.0"
category: "模型家族与选型"
tags: ["minicpm-v", "多模态", "ocr", "rlhf-v"]
published: true
as_of: "2026-09-01"
excerpt: "拆解 MiniCPM-V 2.0 的 2.8B 组合架构、高分辨率切片、视觉重采样和 RLHF-V 对齐。"
---

# MiniCPM-V 2.0

MiniCPM-V 2.0 于 2024 年 4 月 12 日开源，是 2.8B 级视觉语言模型。官方说明它由 SigLIP-400M 视觉编码器、MiniCPM-2.4B 语言模型和 Perceiver Resampler 连接而成。

## 数据流

输入图像先由视觉编码器提取特征，再由重采样器压缩为较短的视觉 token 序列，与文本 token 一起送入语言模型。LLaVA-UHD 路线把高分辨率图像切成多个局部区域，并保留全局视图，使模型无需把整图强行缩到一个低分辨率方块。

这种设计有两组权衡：切片越多，细节与 OCR 更可能保留，但视觉 token、预填充时间和显存增加；重采样越激进，推理更省，但小字、密集图表和空间关系可能受损。页面或表格任务应按真实分辨率测，不应从公开榜单直接推导。

## RLHF-V 的位置

官方材料将 MiniCPM-V 2.0 描述为使用 RLHF-V 做多模态对齐，目标之一是减少与图像不一致的幻觉。对齐只能改变错误分布，不能保证图像事实正确。OCR、计数、细粒度定位和否定问句仍需单独评测，并保留原图或区域坐标用于答案追溯。

## 能力边界

该版本主要面向单图理解与端侧部署，不应把后续 2.6 的多图/视频能力或 `o` 系列语音能力回填到 2.0。模型平台上的“3B”是总参数量近似展示；论文/发布页的 2.8B 是更细口径，均不能写成精确 2.0B。

## 许可

代码使用 Apache-2.0；当前模型卡说明权重受 MiniCPM Model License 约束，学术使用免费，商业使用按当期登记说明执行。旧提交曾使用不同表述，因此合规审查要固定仓库 revision，并保存当时许可证。

## 一手来源

- [MiniCPM-V 2.0 官方文档](https://github.com/OpenBMB/MiniCPM-V/blob/main/docs/minicpm_v2.md)
- [MiniCPM-V 2.0 模型卡](https://huggingface.co/openbmb/MiniCPM-V-2)
- [MiniCPM-V 技术报告](https://arxiv.org/abs/2408.01800)
- [RLHF-V 论文](https://arxiv.org/abs/2312.00849)

[← 返回 MiniCPM 家族](../minicpm.md)
