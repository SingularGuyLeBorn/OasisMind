---
title: "Dream、Mercury、Gemini Diffusion、Seed"
category: null
tags:
  - Dream
  - Mercury
  - Gemini-Diffusion
  - Seed-Diffusion
published: true
as_of: 2026-08-31
excerpt: "开源 7B 的 Dream、商业吞吐的 Mercury、DeepMind 实验模型 Gemini Diffusion、字节的 Seed Diffusion Preview。速度数字的硬件和评测集不同，不能横着减。官方页和论文各自钉住什么，写在下面。"
---
# Dream、Mercury、Gemini Diffusion、Seed

LLaDA 把「8B 能不能打」钉在学术表上。产品与实验室另外几条线要回答的是：开源 7B 怎么从 AR 初始化；代码补全能不能到四位数 tokens/s；前沿实验室愿不愿意公开一张扩散对照表。四条工作不要合成「2025 年扩散已经全面超过 AR」。

## 1. Dream 7B：开源权重里的改编样板

港大 NLP 与华为诺亚。离散吸收态，AR 初始化加移位，按上下文重标定每个掩码位的噪声。发布 Base 与 Instruct，推理接口是 `diffusion_generate()`。作者宣称在通用、数学、代码上对得过同代 Qwen2.5 量级，并强调规划类任务和任意顺序 infill。改编细节见 [从自回归改编](../03-points/ar-to-diffusion.md)。

Dream 仍是全双向掩码扩散这一支，不是 Mercury 那种系统级吞吐怪兽。评它用质量表，不要用 H100 tokens/s 去羞辱它。

## 2. Mercury Coder：把并行写进产品

Inception Labs，技术报告 arXiv:2506.17298。Transformer 骨干，扩散训练与生成，代码向。Mini 与 Small 两档。Artificial Analysis 在 NVIDIA H100 上测到 Mini 1109 tokens/s、Small 737 tokens/s，相对当时速度优化的前沿 AR 最高约 10 倍吞吐，质量落在同类快速代码模型区间。Copilot Arena 上作者称质量第二、速度第一。上下文官方写 32k，可扩到 128k。

报告几乎不公开参数量、训练 token、是否块扩散。能引用的是第三方吞吐和「粗到细并行改多 token」。不要把 10× 抄到 LLaDA 8B 头上。

## 3. Gemini Diffusion：实验室演示，有一张官方表

Google DeepMind 实验模型，页面写明是 demo，用来摸未来模型。机制一句话：不是逐 token 写，而是从噪声迭代改，生成中途能纠错，擅长编辑、数学和代码类改写。

官方对照 Gemini 2.0 Flash-Lite（AI Studio 默认采样，pass@1）：

| 基准 | Gemini Diffusion | Flash-Lite |
|---|---|---|
| LiveCodeBench v6 | 30.9% | 28.5% |
| BigCodeBench | 45.4% | 45.8% |
| HumanEval | 89.6% | 90.2% |
| MBPP | 76.0% | 75.8% |
| GPQA Diamond | 40.4% | 56.5% |
| AIME 2025 | 23.3% | 20.0% |
| Global MMLU Lite | 69.1% | 79.0% |

代码接近，知识与科学落后。速度：评测平均采样 1479 tokens/s（不含 overhead），overhead 0.84s。硬件未写。SWE-Bench Verified 是非 agent、单轮编辑、最长 32k。这些限定要跟着数字走。

## 4. Seed Diffusion Preview：H20 上的 2146 token/s

ByteDance Seed，arXiv:2508.02193，代码模型。作者报 H20 上 2146 token/s，并**自己写了不能和 Mercury / Gemini 横比**：Mercury 用 H100 和私有集，Gemini 速度是混合任务平均、硬件未公布，系统提示约束格式也会抬速度。LiveCodeBench 用 v1–v6 共 1055 题以迁就未知基线协议。

训练上前 80% 步标准掩码腐蚀，后 20% 加基于 Levenshtein 距离的编辑腐蚀（插删改），逼模型不要迷信「未掩的字一定对」，从而能在采样里改已经写出的 token。他们故意不用 MDLM 那种 carry-over 抄输入。推理用块间因果、块内扩散，KV 缓存前缀块，块划分在推理时再定，不单独训死块长。系统栈是内部框架。

这是「掩码 + 允许改已写字 + 块解码 + 自研 runtime」的组合，不是新的 $Q_t$ 家族。

## 5. 速度表怎么读

| 名称 | 数字 | 硬件 | 作者提醒 |
|---|---|---|---|
| Mercury Mini | 1109 tok/s | H100 | Artificial Analysis |
| Mercury Small | 737 tok/s | H100 | 同上 |
| Gemini Diffusion | 1479 tok/s | 未公布 | 不含 0.84s overhead |
| Seed Preview | 2146 token/s | H20 | 与上两行条件不同 |
| LLaDA 2.0-flash-CAP | 535 TPS | 文内设定 | dInfer vs SGLang AR |

分母、是否含 prefill、batch、是否约束输出格式，全部可能差一倍。本花园只并列，不排名。

## 6. 失效

把 Gemini 的 HumanEval 89.6 和 LLaDA 8B Instruct 的 49.4 放在同一句「扩散代码」里：规模、数据、是否闭源、评测库都不同。

把 Seed 的编辑腐蚀理解成「回到均匀 $Q_t$」：编辑是后 20% 的增强，主过程仍是掩码。

把四条都当成可以自托管的开源 7B：Dream 是；Mercury / Gemini / Seed Preview 不是同一类交付物。

## 参考文献

- [Ye et al., Dream 7B, 2025](https://arxiv.org/abs/2508.15487)
- [Khanna et al., Mercury, 2025](https://arxiv.org/abs/2506.17298)
- [Gemini Diffusion 官方页](https://deepmind.google/models/gemini-diffusion/) — 表与 1479 tokens/s。
- [Song et al., Seed Diffusion, 2025](https://arxiv.org/abs/2508.02193) — 2146 token/s @ H20；不可比声明。

## 相关

- [从自回归改编](../03-points/ar-to-diffusion.md)
- [代表性年表](../03-models/representative-models.md)
- [采样与调度](../02-mechanism/sampling.md)
