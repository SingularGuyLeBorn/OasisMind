---
title: "LLaDA：8B 从头训到 100B 改编"
category: null
tags:
  - LLaDA
  - LLaDA2.0
  - MoE
  - frontier
published: true
as_of: 2026-08-31
excerpt: "LLaDA 8B 用 2.3T token 从头做掩码扩散，Base 的 MMLU 5-shot 65.9 对 LLaMA3 8B 的 65.4。2.0 不再从头训 100B，而是把 AR MoE 经三阶段块级 WSD 转成扩散。数字全部来自论文表，旧稿那组 62.3 / 54.8 已作废。"
---
# LLaDA：8B 从头训到 100B 改编

LLaDA 要回答的问题很硬：LLM 的规模化、上下文学习、指令跟随，是不是必须绑在自回归连乘上。作者的答案是：这些能力来自「用似然（或其下界）拟合语言分布」，不来自「必须从左到右」。8B 从头训是把这句话做到和 LLaMA3 8B 同一张表上；2.0 是承认从头训 100B 太贵，改成继承 AR 权重。

机制公式见掩码扩散篇。本篇只钉架构选择、表上的数字、采样器对分数的影响、以及 2.0 的转换课程。

## 1. 8B 骨架：去掉因果掩码的 decoder-only

预训练 2.3T token，0.13 百万 H800 GPU 小时，序列长 4096。损失即掩码扩散篇式 (1)。SFT 450 万对，只掩回答。没有 RL。

和 LLaMA3 8B 的对照写在附录 Table 5：都是 32 层、隐维 4096、32 个注意力头。LLaDA 用 32 个 KV 头（vanilla MHA），LLaMA3 用 8 个（GQA）。作者写明原因：当时这套全双向公式和 KV Cache 不兼容，GQA 省 KV 的前提不成立。多出来的注意力参数靠减小 FFN（12288 对 14336）对齐到 8.02B / 8.03B。词表 126464 对 128000，分词器按他们的数据改编。

不要把「BERT + timestep」理解成换了一套完全不同的层。换掉的是 mask 和训练目标。RoPE、SwiGLU、RMSNorm 仍在。

## 2. Base 表：同一评测协议下的 LLaMA3

Table 1 是预训练模型。带 $*$ 的 LLaDA 8B 与 LLaMA3 8B、LLaMA2 7B 是作者同一套协议重测的。摘几列（括号内为 shot）：

| 任务 | LLaDA 8B Base | LLaMA3 8B Base | LLaMA2 7B Base |
|---|---|---|---|
| 训练 token | 2.3T | 15T | 2T |
| MMLU (5) | 65.9 | 65.4 | 45.9 |
| BBH (3) | 49.7 | 62.1 | 39.4 |
| GSM8K (4) | 70.3 | 48.7 | 13.1 |
| MATH (4) | 31.4 | 16.0 | 4.3 |
| HumanEval (0) | 35.4 | 34.8 | 12.8 |
| MBPP (4) | 40.0 | 48.6 | — |
| Hellaswag (0) | 70.5 | 79.1 | 76.0 |

MMLU 与 HumanEval 和 LLaMA3 持平量级；GSM8K / MATH 高出一截；BBH、Hellaswag 落后。作者把优劣同时归因于闭源数据不可比，并另外训了同数据的 ARM baseline，在 $10^{20}$–$10^{23}$ FLOPs 上显示下游曲线可以跟上，MMLU 与 GSM8K 甚至更陡。讨论「扩散样例效率」用那条同数据曲线，不要用 2.3T 除以 15T。

旧稿写 MMLU 62.3 / GSM8K 54.8 / HumanEval 38.4，对不上 Table 1–2，以本表为准。

Base 的 MMLU 类任务走条件似然蒙特卡洛，HumanEval 走生成。两列不是同一种解码。

## 3. Instruct 表：只做了 SFT

Table 2 的对照对象大多有 SFT+RL，LLaDA 只有 SFT。

| 任务 | LLaDA 8B Instruct | LLaMA3 8B Instruct |
|---|---|---|
| 后训练 | SFT | SFT+RL |
| MMLU (5) | 65.5 | 68.4 |
| GSM8K (4) | 69.4 | 78.3 |
| MATH (0) | 31.9 | 29.6 |
| HumanEval (0) | 49.4 | 59.8 |
| MBPP (4) | 41.0 | 57.6 |
| ARC-C (0) | 88.5 | 82.4 |

整体略落后有 RL 的 LLaMA3 Instruct，缺口在代码和 GSM8K 更明显。ARC-C 反而更高。作者把若干指标相对 Base 下降（如 MMLU）归因于 SFT 数据质量，并明确把 RL 对齐留到后续。后续工作里 LLaDA 1.5 用 VRPO 做偏好优化，d1 用 diffu-GRPO 做推理 RL，不在 8B 原论文的表里。

## 4. 采样器能改分数

附录 Table 8，Instruct，块长 32：

| 采样 | GSM8K | MATH | HumanEval |
|---|---|---|---|
| 自回归 | 0 | 9.5 | 0 |
| 块扩散 | 24.6 | 23.5 | 17.1 |
| 块扩散 LLaDA（半自回归 remask） | 77.5 | 42.2 | 46.3 |
| 纯扩散 | 69.4 | 31.9 | 49.4 |

Table 2 的 69.4 / 31.9 / 49.4 是纯扩散。GSM8K 若改用块长 8 的块扩散 LLaDA，可到 78.6。报「LLaDA Instruct 的 GSM8K」而不写采样器，数字没有意义。自回归采样在 Instruct 上崩掉，和 `[EOS]` padding 有关，见采样篇。

反转诗歌补全（Table 4）是结构实验：全双向让模型从后面往前补，GPT-4o 几乎只能续写。这是机制优势，不是通用榜单优势。不要推成「扩散全面强于 GPT-4o」。

## 5. 2.0：转换，不从头堆 100B

LLaDA 2.0 从 Ling-mini-2.0 / Ling-flash-2.0 出发，把 AR 看成块大小为 1 的块扩散，再用 Warmup–Stable–Decay 改块大小：warmup 增大块，stable 全序列扩散，decay 收回适合部署的块。发布的是指令微调后的 MoE：mini 16B、flash 100B。旧稿写的「~4B / ~20B 激活」在 2.0 HTML 正文里没有并列成规格表，本篇不引用。

Table 1–2 的平均分：mini 64.34，对照 Ling-mini-2.0 的 65.77、Qwen3-8B (no_think) 的 63.42。flash 73.18，对照 Qwen3-30B-A3B-Instruct-2507 的 73.60、Ling-flash-2.0 的 72.15。flash 的 HumanEval 94.51、MBPP 88.29、AIME 2025 60.00、BFCL v3 75.43，作者强调编码与 agent 相对 AR 同级模型开始占优。

吞吐：作者用 dInfer，阈值 0.95。flash-CAP 535 TPS，普通 flash 383 TPS，SGLang 上的 AR 基线 256 与 237 TPS，最高约 2.1 倍。不要把这段写成「3–8 倍」；那是旧稿无来源的数字。

上下文：文内称 32k 内 flash 稳定。训练用 Megatron 的 DP/PP/TP/CP/EP，掩码在模型并行组内广播以保持一致。

## 6. 失效与不该推出的结论

8B Base 的 GSM8K 高于 LLaMA3 Base，推不出「扩散更会数学」。同数据 ARM baseline 才是公平对照；跨公司数据配比是混杂因素。作者自己写了这句。

没有 RL 的 Instruct 落后有 RL 的 LLaMA3 Instruct，推不出「扩散对齐不了」。只能推出：这篇论文没有做 RL。

全双向 8B 推不出「扩散不能 KV Cache」。2.0 和 Fast-dLLM 已经走块扩散与近似缓存。8B 论文的架构选择是当时公式下的简化。

100B 是改编不是从噪声训出来的扩散。知识来自 AR 阶段，扩散阶段负责改生成过程。讨论「扩散能否 scale」时要把「从头训的 8B」和「转换的 100B」分开。

## 7. 规模曲线和 CFG

原文 Fig. 3 用预训练 FLOPs 当横轴，六个下游任务上 LLaDA 与同数据 ARM 的曲线总体可并排。作者拒绝拟合定量幂律，理由是离群点会误导。能说的只有：在他们走到的 $10^{23}$ FLOPs 量级，扩散没有在下游上突然塌掉。早期「似然要 16 倍算力才追上 AR」的观察，被他们用「似然是间接指标、优化的是界、FLOPs 区间更宽」三句话挡回。本花园不把 16 倍写成 2025 年的换算表。

CFG 在附录 Table 6：有条件与无条件 logits 外推，多个任务稳定加分。这是推理技巧。8B Instruct 的主表没有把 CFG 当成默认必开项来报，读具体数字时看附录有没有开。

生成长度消融 Table 10：256 / 512 / 1024 对 Base 的 Humaneval 等变化不大。定长超参不是分数的主因；采样器类别才是。

## 8. 诗歌反向：机制实验，不是全能声明

给定后半句补前半句。因果模型必须把「后面」改写成提示里的条件，且生成方向仍朝结束符走。掩码扩散把要补的字留成 `[MASK]`，已给的字当干净上下文，方向不存在。Table 4 上 LLaDA 超过 GPT-4o。这只证明双向结构能做这道题，不证明聊天、代码、代理全面超过 GPT-4o。把这个实验当卖点可以，当总榜不行。

## 9. 读完应留下的规格卡

- 8B Base：2.3T，MMLU 65.9，GSM8K 70.3，HumanEval 35.4（Table 1，$*$ 协议）。
- 8B Instruct：仅 SFT，Table 2 纯扩散 GSM8K 69.4；块采样可到 78.6。
- 不兼容当时的 KV Cache，故用 MHA 不是 GQA。
- 2.0-mini 16B / flash 100B MoE，平均分 64.34 / 73.18；flash-CAP 535 TPS，约 2.1× 于文内 AR 基线。
- 激活参数、旧稿 3–8× 吞吐：2.0 正文未给出可引用的并列规格，不写。

## 参考文献

- [Nie et al., LLaDA, 2025](https://arxiv.org/abs/2502.09992) — Table 1–2、5、7–9；2.3T；反转诗歌。
- [Bie et al., LLaDA 2.0, 2025](https://arxiv.org/abs/2512.15745) — WSD；mini/flash 表；535 TPS。
- [Zhu et al., LLaDA 1.5, 2025](https://arxiv.org/abs/2505.19223) — VRPO 偏好优化，不在 8B 原表。
- [Zhao et al., d1, 2025](https://arxiv.org/abs/2504.12216) — diffu-GRPO。

## 相关

- [掩码扩散](../02-mechanism/masked-diffusion.md)
- [采样与调度](../02-mechanism/sampling.md)
- [块扩散](../03-points/block-diffusion.md)
- [代表性工作](./representative-models.md)
