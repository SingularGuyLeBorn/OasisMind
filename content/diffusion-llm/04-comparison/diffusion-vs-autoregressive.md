---
title: "扩散 vs 自回归：全面对比"
category: null
tags:
  - "comparison"
  - "diffusion"
  - "autoregressive"
  - "inference"
  - "reversal-curse"
published: true
excerpt: "本文从数学定义、推理效率、生成质量、可控性、反转诅咒、长文本处理等十个维度系统对比扩散与自回归两种生成范式，并给出选型决策框架。"
---
# 扩散 vs 自回归：全面对比

## 概述

"扩散语言模型能不能替代自回归？"——这是该领域被问最多的问题。本文从数学根基到工程实践，系统比较两种范式的十个关键维度。读者会看到：扩散和自回归并非替代关系，而是两套不同 trade-off 的生成哲学，在不同场景下各有擅长，未来更可能是融合而非二选一。

> 右侧动画直观展示了两种范式的生成过程差异，建议先观看再继续阅读。

```viz
composition: ArVsDiffusion
title: AR vs 扩散生成对比
prompt: "床前明月"
genTokens: ["光","，","疑","是","地","上","霜"]
```

## 1. 数学定义

自回归将联合分布分解为条件概率的链式乘积：

$$P_{\text{AR}}(x) = \prod_{i=1}^{n} P_\theta(x_i \mid x_{<i})$$

扩散通过隐变量模型从噪声逐步生成：

$$P_{\text{Diff}}(x) = \int p(x_T) \prod_{t=1}^{T} p_\theta(x_{t-1} \mid x_t) \, dx_{1:T}$$

| 方面 | 自回归 | 扩散 |
|---|---|---|
| 联合概率建模 | 精确分解，无近似 | 变分下界（ELBO），有近似 |
| 条件依赖方向 | 单向（左→右） | 全局双向 |
| 数学完整性 | 理论上更"干净" | 依赖步数 T 的近似精度 |

## 2. 推理效率

这是扩散模型最受关注的卖点——并行生成。上方动画中可以看到：左侧 AR 每 12 帧才出现一个 token（串行），右侧扩散则在每步去噪中并行揭示一批 token。

| 场景 | 自回归 | 扩散 |
|---|---|---|
| 生成 n 个 token | n 次串行前向 | T 次（可并行改多位置）前向 |
| 吞吐实例 | 基线 | Mercury Mini 1109 tok/s @ H100；LLaDA 2.0-flash-CAP 535 TPS，文内 AR 对照约 2.1×。LLaDA 8B 原论文没有速度表 |
| KV Cache | 必须，且严格成立 | 全双向默认不成立；块间可以真缓存，跨步缓存是近似 |

扩散的延迟跟步数 $T$ 走，AR 跟新 token 数走。短样本、$T\ll n$ 时扩散可以少跑前向；极长续写、AR 已有 KV 时，全双向每步重算整段反而更贵。开源全双向模型和商业 Mercury 不在同一条速度曲线上。

## 3. 生成质量

| 指标 | 自回归（LLaMA3 8B Base，LLaDA 同协议 $*$） | 扩散（LLaDA 8B Base $*$） |
|---|---|---|
| MMLU (5-shot) | 65.4 | 65.9 |
| GSM8K (4-shot) | 48.7 | 70.3 |
| HumanEval (0-shot) | 34.8 | 35.4 |
| BBH (3-shot) | 62.1 | 49.7 |

Instruct 对比见 LLaDA Table 2：LLaDA 只有 SFT，LLaMA3 有 SFT+RL，GSM8K 69.4 对 78.3，HumanEval 49.4 对 59.8。Base 的 GSM8K 优势不能直接抄到 Instruct 上。论文主表没有给出可引用的精确 perplexity 对照。

## 4. 训练效率

| 维度 | 自回归 | 扩散 |
|---|---|---|
| 单步目标 | Next-token prediction（O(1) 采样） | 多步去噪（需采样 t 和 mask） |
| 训练并行度 | 高（causal mask 内并行） | 高（bidirectional + 随机 mask） |
| 预训练数据量 | LLaMA3 8B: 15T tokens | LLaDA 8B: 2.3T tokens |

2.3T 对 15T 不能直接解读成「扩散更省数据」：语料配比不同。LLaDA 用同数据 ARM baseline 才比较样例效率。

## 5. 可控生成

这是扩散模型的**核心优势领域**。图像扩散的 guided generation 可以自然地迁移到文本：每一步去噪时注入约束，无需额外训练。AR 模型需要 RLHF、DPO 等额外训练阶段。Diffusion-LM 在情感控制、主题引导等任务上远超同期 AR 模型。

## 6. 反转诅咒

**反转诅咒**是 AR 模型的结构性缺陷："A 是 B"学不到"B 是 A"。扩散模型天然免疫——每步去噪时所有位置互相可见。LLaDA 的诗歌补全实验证明扩散可以同时从前后两个方向补全文本，而 GPT-4o 几乎只能单向续写。

## 7. 长文本处理

| 方面 | 自回归 | 扩散 |
|---|---|---|
| 生成长文本 | 天然适配（逐 token 续写） | 挑战（T × n² 注意力成本） |
| 理解长文本 | causal attention 限制 | 双向注意力，理论上更高效 |

长文本是扩散模型目前最明显的短板。

## 8. 幻觉与事实性

初步观察：扩散模型并行生成可能对全局一致性有优势（不太会出现"前后矛盾"），但 AR 有 RLHF 大量对齐经验；扩散的对齐研究刚刚起步。

## 9. 基础设施

| 维度 | 自回归 | 扩散 |
|---|---|---|
| 推理框架 | vLLM, TGI, Ollama | 几乎没有专用框架 |
| 预训练模型 | 数十个（LLaMA, Qwen, Mistral） | LLaDA 系列等少量开源 |
| 社区规模 | 极大 | 较小但快速增长 |

## 10. 选型决策

| 需求 | 推荐 |
|---|---|
| 通用对话，对延迟不敏感 | 自回归 |
| 低延迟批量生成（客服、翻译） | 扩散 |
| 精细可控生成 | 扩散 |
| 双向理解（填空、纠错、改写） | 扩散 |
| 极长文本（>4K token） | 自回归 |
| 研究与探索 | 扩散（大量 open problems） |

## 来源

- [LLaDA (2025)](https://arxiv.org/abs/2502.09992) — 8B 规模的扩散-AR 对比数据（MMLU/GSM8K/HumanEval 加速比）来源
- [A Survey on Diffusion Language Models (2025)](https://arxiv.org/abs/2508.10875) — 综合对比框架与效率分析来源
- [Diffusion-LM (NeurIPS 2022)](https://arxiv.org/abs/2205.14217) — 可控生成与 classifier guidance 来源

## 相关

- [为什么要用扩散做语言生成](../01-overview/why-diffusion.md)
- [离散扩散模型：从马尔可夫链到掩码预测](../02-mechanism/masked-diffusion.md)
- [代表性扩散语言模型一览](../03-models/representative-models.md)
- [LLaDA 与最新进展](../03-models/llada-frontier.md)
