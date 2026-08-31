---
title: "STEP3-VL-10B"
category: "模型家族与选型"
tags: ["STEP3-VL-10B", "StepFun", "视觉语言模型", "PaCoRe", "开放权重"]
published: true
as_of: "2026-09-01"
excerpt: "1.8B 感知编码器加 Qwen3-8B decoder 的 10B 级视觉语言模型，含 Base/Chat 权重与 64K 配置。"
---

# STEP3-VL-10B

> 核验日期：2026-09-01。该模型是独立的 10B 级多模态检查点，不是 321B Step-3 的蒸馏版或量化版；官方没有给出这种继承关系。

## 结论卡

| 字段 | 已核实信息 |
|---|---|
| 报告 | `arXiv:2601.09668`，2026-01-14 提交 |
| 检查点 | `Step3-VL-10B-Base` 与后训练 `Step3-VL-10B`（Chat） |
| 结构 | 1.8B PE-lang 视觉编码器 + Qwen3-8B decoder + 两级 stride-2 projector |
| 模态 | 文本+图像 → 文本 |
| 上下文 | 官方配置 `max_position_embeddings=65536`；PaCoRe 后训练最大序列同为 64K |
| 训练 | 1.2T 多模态预训练 token；两阶段 SFT 约 226B token；RL 合计 1,400+ iterations |
| 权重资源 | BF16 权重约 20GB；官方写最低显存约 24GB、运行额外开销约 4GB |
| 许可 | Apache-2.0 |

## 架构与训练

PE-lang 是为语言对齐优化的感知编码器。模型使用一个 728×728 全局视图和多个 504×504 局部 crop；projector 经过两次 stride-2 降采样。文本侧直接采用 Qwen3-8B decoder，因此“Step3”命名不表示复用了 321B Step-3 的 MFA、48 专家或 AFD。

预训练采用视觉编码器与语言模型全参数共同更新，而不是先冻结视觉塔再接投影器。后训练包括：

- 两阶段 SFT，先以文本为主维持语言能力，再提高多模态占比；
- RLVR 用可验证奖励覆盖数学、几何、物理、感知和 grounding；
- RLHF 处理开放式生成；
- PaCoRe（Parallel Coordinated Reasoning）让多个并行视觉推理分支探索并聚合证据。

PaCoRe 是测试时计算与后训练方法，不是每次普通单轨生成都自动获得的固定增益。官方 benchmark 也多含特定推理策略，应按“模型+scaffold+采样预算”复现。

## Base 与 Chat 不可混用

Base 检查点用于继续训练或研究，不具备 Chat 检查点相同的对话对齐和模板行为。部署时必须同时固定：

1. 精确仓库 ID 与 revision；
2. `processor`、chat template 与图像切片策略；
3. `trust_remote_code` 对应源码审计结果；
4. 输入图数、分辨率、上下文和最大输出；
5. BF16/FP8 等权重格式与框架版本。

## 适用与局限

该模型适合单机/单卡级视觉问答、OCR、GUI 理解与多模态推理研究。它的 10B 量级显著降低权重门槛，但多 crop 会使图像 token 与显存随输入变化；24GB 是官方最低部署口径，不是所有 64K、多图和长输出组合的保证。

官方结果不能证明在任意业务图像、语言或工具环境中胜过 10–20 倍规模模型。对 OCR、图表、UI、空间关系和幻觉分别评测，并同时记录是否启用 PaCoRe、工具和多次采样。

## 一手来源

- [STEP3-VL-10B 官方仓库](https://github.com/stepfun-ai/Step3-VL-10B)
- [STEP3-VL-10B 技术报告](https://arxiv.org/abs/2601.09668)
- [Chat 权重与模型卡](https://huggingface.co/stepfun-ai/Step3-VL-10B)
- [Base 权重与模型卡](https://huggingface.co/stepfun-ai/Step3-VL-10B-Base)

[← 返回 StepFun 家族](../stepfun.md)
