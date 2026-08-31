---
title: "MiniCPM-Llama3-V 2.5"
category: "模型家族与选型"
tags: ["minicpm-v", "llama3", "rlaif-v", "多模态对齐"]
published: true
as_of: "2026-09-01"
excerpt: "说明 MiniCPM-Llama3-V 2.5 的 Llama 3 基座、96 个视觉查询与 RLAIF-V 对齐方法。"
---

# MiniCPM-Llama3-V 2.5

MiniCPM-Llama3-V 2.5 于 2024 年 5 月 20 日公开。官方模型集合把它列为 9B 级视觉语言模型；其语言骨干是 Llama 3 8B，视觉侧与切片式高分辨率处理沿用 MiniCPM-V 路线。

## 为什么名称保留 Llama3

`Llama3` 是精确模型身份的一部分，表明该版本的语言基座与 MiniCPM-V 2.0 不同。不能把 2.5 简写为“MiniCPM-V 2.5”后忽略 Llama 3 的模型许可、tokenizer 与部署差异，也不能把后续基于 Qwen2 的 2.6 配置继承到它。

公开配置给出 8192 最大位置、96 个重采样查询和 Llama 3 的词表/注意力结构。96 个视觉查询描述每个经处理视觉单元的压缩接口；高分辨率切片可能产生多个单元，所以不等于整张任意分辨率图片始终只有 96 个视觉 token。

## RLAIF-V

RLAIF-V 用可扩展的 AI 反馈构造多模态偏好数据，以缓解人工逐样标注的成本。方法通常包含：生成候选回答、识别响应中与图像不一致的部分、产生纠正/偏好对，再做偏好优化。

AI 反馈会继承评审模型的盲点；训练数据规模扩大不等于标签无偏。复现或评估时应报告反馈模型、提示词、过滤规则和人工抽检比例。RLAIF-V 是对齐方法，不是视觉编码器，也不等于模型能自证答案正确。

## 适用与限制

它适合研究 8B 语言能力与端侧视觉压缩的组合，也是观察 RLAIF-V 的重要版本。对于多图、长视频或语音，应优先评估 2.6/`o` 后续版本。当前模型卡的代码为 Apache-2.0，但权重要求遵守 MiniCPM Model License；同时还需核对 Llama 3 相关条款和模型仓库当期说明。

## 一手来源

- [MiniCPM-Llama3-V 2.5 模型卡](https://huggingface.co/openbmb/MiniCPM-Llama3-V-2_5)
- [MiniCPM-V 技术报告](https://arxiv.org/abs/2408.01800)
- [RLAIF-V 论文与代码](https://github.com/RLHF-V/RLAIF-V)
- [MiniCPM-V 官方仓库](https://github.com/OpenBMB/MiniCPM-V)

[← 返回 MiniCPM 家族](../minicpm.md)
