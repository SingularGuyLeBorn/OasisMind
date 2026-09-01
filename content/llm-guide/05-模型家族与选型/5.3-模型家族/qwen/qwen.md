---
title: "Qwen 模型家族"
category: "模型家族与选型"
tags: ["qwen", "模型家族", "选型"]
published: true
as_of: "2026-09-01"
excerpt: "Qwen 通用、代码、数学、视觉、音频与智能体模型线的身份、证据和部署边界。"
---

# Qwen 模型家族

> 核验日期：2026-09-01。这里按官方发布身份组织；云端 SKU、上下文、价格和可用区以使用当天官方文档为准。

## 定位

Qwen 是阿里巴巴 Qwen 团队的基础模型家族。它从纯文本基座扩展到视觉、音频、代码、数学和智能体工作流；“同属 Qwen”不意味着同一输入模态、许可、上下文或部署方式。
本页只作身份导航。参数必须区分总参数、激活参数与额外嵌入参数；上下文必须区分原生窗口、扩展窗口与托管 SKU；模态按输入/输出方向写；许可则分别核对权重 `LICENSE`、仓库代码许可与服务条款。各字段的官方口径见对应版本页，官方没有披露时保留 unknown，不作反推。

## 谱系

| 身份 | 首次公开证据 | 公开形态 | 页面 |
|---|---|---|---|
| Qwen | 2023 | 开放权重；早期许可须逐模型核对 | [Qwen](./qwen/qwen.md) |
| Qwen2 | 2024 | 通用文本，稠密与 MoE | [Qwen2](./qwen2/qwen2.md) |
| Qwen2-VL | 2024 | 图像/视频理解 | [Qwen2-VL](./qwen2-vl/qwen2-vl.md) |
| Qwen2-Audio | 2024 | 音频/文本输入，文本输出 | [Qwen2-Audio](./qwen2-audio/qwen2-audio.md) |
| Qwen2.5 | 2024 | 通用文本主线 | [Qwen2.5](./qwen2-5/qwen2-5.md) |
| Qwen2.5-Coder | 2024 | 代码专用线 | [Qwen2.5-Coder](./qwen2-5-coder/qwen2-5-coder.md) |
| Qwen2.5-Math | 2024 | 数学专用线 | [Qwen2.5-Math](./qwen2-5-math/qwen2-5-math.md) |
| Qwen2.5-VL | 2025 | 视觉语言与视觉智能体 | [Qwen2.5-VL](./qwen2-5-vl/qwen2-5-vl.md) |
| Qwen3 | 2025 | 统一思考/非思考，稠密与 MoE | [Qwen3](./qwen3/qwen3.md) |
| Qwen3.5 | 2026 | 原生多模态智能体，开放权重与托管服务 | [Qwen3.5](./qwen3-5/qwen3-5.md) |
| Qwen3.6 | 2026 | 开放权重与托管智能体/代码线 | [Qwen3.6](./qwen3-6/qwen3-6.md) |
| Qwen3.7 | 2026 | 托管服务线；不能当作开放检查点 | [Qwen3.7](./qwen3-7/qwen3-7.md) |
| Qwen3.8-Flash-Next | 2026-08-26 | Qwen Community License 1.0 开放权重架构预览；同时存在托管 Flash SKU | [Qwen3.8-Flash-Next](./qwen3-8-flash-next/qwen3-8-flash-next.md) |

## 能力边界

- 文本、视觉、音频不是一个可互换接口；先按输入与输出模态筛选。
- 论文 benchmark 是指定协议下的结果，不等于业务可靠性、端到端智能体成功率或安全保证。
- “开放权重”不自动等于所有版本采用相同许可；早期 Qwen、API 专有型号和后续 Apache 2.0 检查点必须分别核对。
- 长上下文配置上限不等于有效检索长度；视觉 token、音频长度、工具轨迹还会改变实际预算。
- Qwen3.8-Flash-Next 官方称其为 Qwen4 架构的早期预览，同时明确完整 Qwen4 家族仍待构建。它不是 Qwen4 发布，也不能据此预测完整 Qwen4 的未披露结构。

## 部署与选型

1. 本地或私有部署先筛开放权重、许可、显存与推理框架支持；不要从云端 SKU 反推可下载权重规格。
2. 文档/OCR/视频选 VL 线，语音与环境音理解选 Audio/Omni 线，代码仓库任务比较 Coder/agent 线，数学研究再看 Math 线。
3. Qwen2.x 适合兼容性和资源可控的成熟部署；Qwen3 以后再按思考控制、工具调用、原生多模态与吞吐成本取舍。
4. 版本名相近时以官方模型卡中的精确 ID、输入模态、上下文和 license 字段为准。

## 一手来源

- [Qwen 官方站与发布页](https://qwen.ai/)
- [Qwen 官方 GitHub 组织](https://github.com/QwenLM)
- [Qwen 官方 Hugging Face 组织](https://huggingface.co/Qwen)
- [Qwen 技术报告](https://arxiv.org/abs/2309.16609)
- [Qwen3 技术报告](https://arxiv.org/abs/2505.09388)
- [Qwen3.8-Flash-Next 官方仓库](https://github.com/QwenLM/Qwen3.8-Flash-Next)

[← 返回模型家族索引](../5.3-模型家族.md)
