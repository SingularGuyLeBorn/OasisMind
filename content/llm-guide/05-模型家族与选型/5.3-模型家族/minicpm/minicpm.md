---
title: "MiniCPM 模型家族"
category: "模型家族与选型"
tags: ["minicpm", "openbmb", "端侧模型", "多模态", "模型家族"]
published: true
as_of: "2026-09-01"
excerpt: "按文本、视觉语言与全模态三条谱系梳理 MiniCPM，区分模型身份、上下文口径、开放权重状态与许可。"
---

# MiniCPM 模型家族

> 核验日期：2026-09-01。MiniCPM 不是单一模型：文本模型使用 `MiniCPM`，视觉语言分支使用 `MiniCPM-V`，可处理语音并输出语音的全模态分支使用 `MiniCPM-o`。型号中的数字、仓库显示的参数量和论文的“非嵌入参数量”可能采用不同口径，不能互换。

## 三条主线

| 主线 | 代表身份 | 主要输入/输出 | 核心问题 |
|---|---|---|---|
| 文本与端侧语言模型 | MiniCPM、MiniCPM3、MiniCPM4、MiniCPM5 | 文本 → 文本 | 如何用较小模型获得可用能力、长上下文和端侧吞吐 |
| 视觉语言 | MiniCPM-V | 图像/多图/视频/文本 → 文本 | 如何压缩视觉 token，同时保留 OCR、细粒度理解与视频能力 |
| 全模态实时交互 | MiniCPM-o | 图像/视频/音频/文本 → 文本/语音 | 如何让听、看、说以流式方式协同，并逐步走向全双工 |

`OpenBMB` 是主要代码与模型发布组织；Hugging Face 的精确模型仓库、仓库内许可证和对应技术报告才是判断“可下载什么、能否商用、支持多长上下文”的证据。网页演示、API 产品名或聚合平台标签不能替代模型卡。

## 版本地图

| 身份 | 首次公开时间 | 已核验定位 | 页面 |
|---|---:|---|---|
| MiniCPM-2B | 2024-02-01 | 2.4B 非嵌入参数口径的早期主模型，含 base/SFT/DPO 身份 | [MiniCPM 初代](./minicpm/minicpm.md) |
| MiniCPM-1B / 2B-128K / MoE-8x2B | 2024-04-11 | 1.2B 级小模型、长上下文检查点与稀疏专家变体 | [MiniCPM 初代](./minicpm/minicpm.md) |
| MiniCPM-S-1B | 2024 | ProSparse 激活稀疏实验检查点 | [MiniCPM-S](./minicpm-s/minicpm-s.md) |
| MiniCPM3-4B | 2024-09 | 4B 文本模型，32K 模型窗口，支持函数调用 | [MiniCPM3](./minicpm3/minicpm3.md) |
| MiniCPM4 | 2025-06-06 | 0.5B/8B 端侧文本模型，InfLLM-V2 稀疏注意力 | [MiniCPM4](./minicpm4/minicpm4.md) |
| MiniCPM4.1-8B | 2025-09-05 | 8B、稀疏/稠密可切换、思考/非思考可切换 | [MiniCPM4.1](./minicpm4-1/minicpm4-1.md) |
| MiniCPM-SALA | 2026-02-11 | 9B 稀疏+线性混合注意力、百万 token 实验定位 | [MiniCPM-SALA](./minicpm-sala/minicpm-sala.md) |
| MiniCPM5-1B | 2026-05-19 | 1.08B 总参数、原生 128K、标准 Llama 架构 | [MiniCPM5](./minicpm5/minicpm5.md) |
| MiniCPM-V 2.0 | 2024-04-12 | 2.8B 视觉语言模型，SigLIP-400M + MiniCPM-2.4B | [MiniCPM-V 2.0](./minicpm-v-2/minicpm-v-2.md) |
| MiniCPM-Llama3-V 2.5 | 2024-05-20 | 8B 级 Llama 3 视觉语言模型，96 个视觉查询 | [MiniCPM-Llama3-V 2.5](./minicpm-v-2-5/minicpm-v-2-5.md) |
| MiniCPM-V 2.6 | 2024-08-06 | 8B，增加多图与视频理解 | [MiniCPM-V 2.6](./minicpm-v-2-6/minicpm-v-2-6.md) |
| MiniCPM-o 2.6 | 2025-01-13 | 8B 端到端视觉、语音与实时流式交互 | [MiniCPM-o 2.6](./minicpm-o-2-6/minicpm-o-2-6.md) |
| MiniCPM-V 4.0 | 2025-08-02 | 4.1B，SigLIP2-400M + MiniCPM4-3B | [MiniCPM-V 4.0](./minicpm-v-4/minicpm-v-4.md) |
| MiniCPM-V 4.5 | 2025-08-26 | 9B 视觉语言模型，3D-Resampler 与视频效率优化 | [MiniCPM-V 4.5](./minicpm-v-4-5/minicpm-v-4-5.md) |
| MiniCPM-o 4.5 | 2026-02-03 | 9B，全双工视频/音频输入与文本/语音输出 | [MiniCPM-o 4.5](./minicpm-o-4-5/minicpm-o-4-5.md) |
| MiniCPM-V 4.6 | 2026-05-11 | 1.3B，混合 4×/16× 视觉 token 压缩 | [MiniCPM-V 4.6](./minicpm-v-4-6/minicpm-v-4-6.md) |

## 选型先问四个问题

1. **是否需要语音输出？** 只做图片、视频到文本，优先比较 `V`；需要听、说和实时交互才进入 `o`。
2. **端侧约束是什么？** 参数量不等于运行内存；权重精度、KV cache、视觉编码器、输入帧数和运行时都会改变占用。
3. **长上下文是哪种口径？** 区分训练长度、模型配置、YaRN 扩展、稀疏注意力可处理长度和应用层 MapReduce。“理论无限”不是模型原生无限窗口。
4. **许可属于哪个检查点？** 早期模型常要求遵守 MiniCPM Model License 并登记商用；部分新模型为 Apache-2.0。必须以下载时的精确仓库为准。

## 评测与部署边界

官方表格适合判断研发方向，不足以替代选型测试。视觉分辨率、视频采样、是否启用思考、系统提示词、量化方式和推理后端都会改变准确率、延迟与内存。生产验收至少记录：精确模型提交、输入预算、输出预算、精度/量化、后端版本、首 token 延迟、生成吞吐、峰值内存和任务失败率。

## 一手入口

- [OpenBMB MiniCPM 仓库](https://github.com/OpenBMB/MiniCPM)
- [OpenBMB MiniCPM-V 仓库](https://github.com/OpenBMB/MiniCPM-V)
- [OpenBMB Hugging Face 模型集合](https://huggingface.co/openbmb)
- [MiniCPM 初代论文](https://arxiv.org/abs/2404.06395)
- [MiniCPM-V 技术报告](https://arxiv.org/abs/2408.01800)
- [MiniCPM4 技术报告](https://arxiv.org/abs/2506.07900)

[← 返回模型家族索引](../5.3-模型家族.md)
