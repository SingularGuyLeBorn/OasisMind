---
title: "代表性扩散语言模型一览"
category: null
tags:
  - "models"
  - "D3PM"
  - "Diffusion-LM"
  - "MDLM"
  - "SEDD"
  - "LLaDA"
  - "survey"
published: true
excerpt: "本文按时间线梳理扩散语言模型的关键工作，从 D3PM 的离散扩散奠基到 LLaDA 2.0 的 100B 规模验证，帮助读者建立领域全景图并理解每条技术路线。"
---
# 代表性扩散语言模型一览

## 概述

扩散语言模型从 2021 年的 D3PM 到 2025 年的 LLaDA 2.0，四年间跨越了从"学术好奇"到"100B 级验证"的巨大鸿沟。本文按时间线梳理每个关键工作的核心创新与历史定位，帮助读者在读完前两篇的"为什么"和"怎么做"之后，建立完整的领域全景图。

## 时间线总览

| 时间 | 工作 | 路线 | 关键贡献 |
|---|---|---|---|
| 2021 | D3PM | 离散 | 转移矩阵 $Q_t$：均匀 / 吸收 / 近邻 |
| 2022 | Diffusion-LM | 连续 | 嵌入空间高斯 + 可控生成 |
| 2024 | SEDD | 离散 | score entropy（ICML 2024） |
| 2024 | MDLM | 离散 | 吸收态 SUBS，加权 MLM，NeurIPS 2024，arXiv:2406.07524 |
| 2025.02 | LLaDA | 离散 | 8B 从头训，Table 1 对 LLaMA3 |
| 2025.03 | BD3-LM | 块 | 块间 AR、块内扩散，ICLR 2025 Oral |
| 2025.06 | Mercury | 离散 | 商业代码模型，Mini 1109 tok/s @ H100 |
| 2025.08 | Dream 7B | 离散 | AR 初始化的开源 7B |
| 2025.12 | LLaDA 2.0 | 块 / 离散 | 16B / 100B MoE，AR→扩散 WSD |

## D3PM（NeurIPS 2021）：离散扩散的数学奠基

**作者**：Jacob Austin, Daniel D. Johnson, Jonathan Ho, Daniel Tarlow, Rianne van den Berg（Google Brain / DeepMind）

D3PM（Structured Denoising Diffusion Models in Discrete State-Spaces）是第一个系统地将 DDPM 推广到离散空间的框架。核心创新是用马尔可夫转移矩阵 Q_t 替代高斯噪声，在离散状态空间上定义了完整的前向/反向过程。作者探索了均匀转移、吸收态（即掩码）、离散化高斯等多种 Q_t 设计。D3PM 在当时生成质量远不如自回归模型，但它建立了离散扩散的数学语言——后续 MDLM、SEDD、LLaDA 都站在它的框架之上。

## Diffusion-LM（NeurIPS 2022）：连续路线的代表作

**作者**：Xiang Lisa Li, John Thickstun, Ishaan Gulrajani, Percy Liang, Tatsunori B. Hashimoto（Stanford）

Diffusion-LM 走了一条不同路线：先把离散 token 映射到连续嵌入向量，在嵌入空间做标准高斯扩散，去噪后再通过一个 learned rounding 步骤映射回离散 token。虽然在生成质量上不如同期 AR 模型，但它在**可控生成**上展示了扩散模型的独特优势——通过 classifier guidance 可以精确控制文本的情感、主题等属性。这种"推理时注入约束"的能力是 AR 模型难以做到的。

## MDLM（NeurIPS 2024）：掩码扩散的极简胜利

**作者**：Subham Sekhar Sahoo, Marianne Arriola, Yair Schiff 等。arXiv:2406.07524。旧稿写成 ICML 2023 / arXiv:2306.08162，编号是错的。

MDLM 把前向收成只进 `[MASK]`，SUBS 参数化让连续时间 ELBO 变成加权 MLM。工程配方（优化器、混合精度、实现细节）对困惑度的贡献，作者认为比理论简化还大：重实现的 D3PM 掩码也没有早期文献说的那么差。top-p 揭开、半自回归采样是推理侧。公式见掩码扩散篇。

## SEDD（ICML 2024）：Score Entropy 的理论突破

**作者**：Aaron Lou, Chenlin Meng, Stefano Ermon（Stanford）

SEDD（Score Entropy Discrete Diffusion）从连续扩散的 score matching 理论中获得灵感，为离散扩散提出了一个新的训练目标——score entropy。相比传统的 ELBO，score entropy 直接对离散概率分布建模，避免了繁琐的 KL 散度计算。实验上 SEDD 将扩散语言模型的困惑度降低了 25-75%，生成质量显著提升，在相近参数规模下能与自回归模型正面竞争。

## LLaDA（2025）：8B 规模验证的里程碑

**作者**：Shen Nie 等（中国人民大学 GSAI 实验室）

LLaDA 8B 在同一评测协议下 Base MMLU 65.9 对 LLaMA3 的 65.4，GSM8K 70.3 对 48.7。Instruct 只做 SFT。双向诗歌补全超过 GPT-4o 是结构实验。数字与采样器见 [LLaDA 专文](./llada-frontier.md)。

## LLaDA 2.0（2025）：100B 扩展

LLaDA 2.0 解决从头训 100B 太贵：从 Ling AR MoE 转换，三阶段块级 WSD。发布 mini（16B）与 flash（100B）。flash 平均分 73.18，与 Qwen3-30B-A3B-Instruct-2507 的 73.60 同档；flash-CAP 535 TPS，文内对照 AR 约 2.1 倍。旧稿「~4B/~20B 激活」和「3–8 倍吞吐」在 2.0 正文没有可引用的并列规格，已删。细节见 [LLaDA 专文](./llada-frontier.md)。

Dream 7B（港大 NLP + 华为诺亚，2025）从 AR 初始化，保持移位预测，开源 Base 与 Instruct。Mercury Coder（Inception Labs）走产品吞吐：Mini 1109、Small 737 tokens/s（H100，Artificial Analysis）。BD3-LM 把块大小变成 AR↔扩散的旋钮，见 [块扩散](../03-points/block-diffusion.md)。

## 路线选择指南

| 场景 | 推荐路线 |
|---|---|
| 文本生成，想与现有 LLM 生态接轨 | 离散扩散（MDLM / LLaDA 路线） |
| 可控生成，需注入可微约束 | 连续扩散（Diffusion-LM 路线） |
| 刚入门，想快速跑通实验 | 掩码扩散（代码 ≈ BERT + timestep） |

## 来源

- [D3PM (NeurIPS 2021)](https://proceedings.neurips.cc/paper/2021/file/958c530554f78bcd8e97125b70e6973d-Paper.pdf) — 离散扩散数学奠基，转移矩阵框架来源
- [Diffusion-LM (NeurIPS 2022)](https://arxiv.org/abs/2205.14217) — 连续路线可控文本生成，classifier guidance 来源
- [MDLM (NeurIPS 2024)](https://arxiv.org/abs/2406.07524) — 掩码扩散 SUBS 与加权 MLM
- [SEDD (ICML 2024)](https://arxiv.org/abs/2310.16834) — score entropy；摘要中的 25%–75% 困惑度
- [LLaDA (2025)](https://arxiv.org/abs/2502.09992) — 8B Table 1–2
- [LLaDA 2.0 (2025)](https://arxiv.org/abs/2512.15745) — AR→扩散 WSD
- [Dream 7B (2025)](https://arxiv.org/abs/2508.15487)
- [Mercury (2025)](https://arxiv.org/abs/2506.17298)
- [Block Diffusion (2025)](https://arxiv.org/abs/2503.09573)

## 相关

- [为什么要用扩散做语言生成](../01-overview/why-diffusion.md)
- [离散扩散模型：从马尔可夫链到掩码预测](../02-mechanism/masked-diffusion.md)
- [扩散 vs 自回归：全面对比](../04-comparison/diffusion-vs-autoregressive.md)
- [LLaDA 与最新进展](./llada-frontier.md)
