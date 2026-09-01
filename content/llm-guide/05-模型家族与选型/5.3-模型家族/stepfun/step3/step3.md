---
title: "Step-3"
category: "模型家族与选型"
tags: ["Step-3", "StepFun", "多模态", "MoE", "MFA", "AFD"]
published: true
as_of: "2026-09-01"
excerpt: "321B/38B 激活的多模态 MoE：MFA 注意力、AFD 解耦推理、64K 上下文与 Apache-2.0 权重。"
---

# Step-3

> 核验日期：2026-09-01。参数来自官方模型卡；成本与吞吐数字只按技术报告的硬件、精度、上下文和 SLA 条件理解。

## 结论卡

| 字段 | 已核实信息 |
|---|---|
| 发布材料 | 2025-07-25 的系统报告 `arXiv:2507.19427`；随后公开模型卡和权重 |
| 模型身份 | 多模态视觉语言 MoE，不是纯文本模型 |
| 参数 | 316B LLM + 5B 视觉编码器 = 321B；文本 token 激活 38B |
| 上下文 | 65,536 tokens |
| 骨干 | 61 层、隐藏维 7,168；前 4 层和最后 1 层为 Dense，共 5 个 Dense 层 |
| MoE | 48 个路由专家、Top-3，另有 1 个共享专家 |
| 注意力 | MFA；64 个 Query 头共享 1 个 Key 头与 1 个 Value 头，头维 256，Query 低秩维 2,048 |
| 权重 | 官方 BF16 与 block-FP8 交付 |
| 许可 | 代码与模型权重 Apache-2.0 |

## MFA：不是只追求更小 KV

Multi-Matrix Factorization Attention 在 QK 电路中使用低秩分解，同时保留较多 Query 头。报告的设计目标不是把 KV Cache 压到最小，而是在 KV 访问和注意力计算强度间找到适配多类硬件的平衡。MFA 不能简写成 GQA 或“动态 KV 换入换出”：前者是模型架构，缓存调度是系统实现，两者不能互换。

## AFD：部署架构而非模型层

Attention-FFN Disaggregation 把注意力实例与 FFN 实例分开：前者围绕 KV 与内存带宽扩展，后者用更大的批量提高矩阵计算利用率。它还允许两侧选择不同硬件。AFD 不会改变每个检查点的权重身份，也不是“感知—推理解耦”。

报告在 Hopper、FP8、4K 平均上下文、50ms TPOT SLA 且不使用 MTP 的特定设置下，给出最高每 GPU 4,039 tokens/s，并与其复现/建模的 DeepSeek-V3 条件比较。这个数字不能转写成“任意部署 4,039 tok/s”，也不适用于单请求生成速度。

## MoE 与系统协同

Step-3 每 token 激活 38B，纸面激活量高于一些更稀疏模型。报告的论点是：参数量和激活量并不能单独决定成本，MoE 稀疏度还受计算、显存带宽和网络带宽约束。StepMesh 是为 AFD 流水线开发的通信组件；它的网络假设和 PFC 配置需要专门集群，不能视作普通本地推理的默认路径。

## 模态与部署边界

官方模型卡把 Step-3 定义为视觉语言模型，输入可含文本和图像，输出为文本。5B 视觉编码器主要参与预填充，系统报告重点分析的是 LLM 解码，因此报告没有覆盖完整视觉训练方法。若任务只需文本 Agent，196B/11B 激活的 Step 3.5 Flash 通常更容易部署；若需要单卡视觉模型，应另看 STEP3-VL-10B。

运行官方权重需要审计模型仓库的自定义代码并固定推理框架版本。64K 是最大上下文口径，实际多图输入会占用视觉 token 与显存，必须以目标分辨率、图数和输出长度压测。

## 一手来源

- [Step-3 官方模型卡与权重](https://huggingface.co/stepfun-ai/step3)
- [Step-3 系统报告](https://arxiv.org/abs/2507.19427)
- [Step-3 官方研究页](https://stepfun.ai/research/step3)
- [StepMesh 官方仓库](https://github.com/stepfun-ai/StepMesh)
- [Apache License 2.0（随 Step-3 权重）](https://huggingface.co/stepfun-ai/step3/blob/main/LICENSE)

[← 返回 StepFun 家族](../stepfun.md)
