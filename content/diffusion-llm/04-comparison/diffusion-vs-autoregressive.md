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
as_of: 2026-08-31
excerpt: "从因式分解、吞吐、质量、可控、反转、长文本等维度对照扩散与自回归。哪些是机制必然，哪些只是 2026 年的工程现状。数字以论文表为准。"
---
# 扩散 vs 自回归

自回归把 $P(x)$ 写成从左到右的乘积，扩散写成一条去噪轨迹的积分。不是谁替代谁，是两套账单。机制层的差别（有没有因果掩码、KV Cache 是否严格成立、PPL 能不能横比）不会因为 Mercury 跑到四位数 tok/s 就消失。工程层的差别（吞吐、对齐、系统栈）2026 年仍在快速动。

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

这是扩散模型的核心优势领域之一，不是「不用训练就能任意控制」。图像里的 classifier guidance 依赖连续轨迹上的梯度。Diffusion-LM 把 token 映到嵌入，才能原样搬梯度；80M 规模上句法树成功率远高于 PPLM / FUDGE。离散 8B 模型更常用掩码、定长和 CFG 的对数概率加权。细节和 Table 2 数字见[可控生成](../03-points/controllable-generation.md)。AR 侧的 RLHF / DPO 改权重；扩散侧对应 VRPO 与 diffu-GRPO，见[对齐](../03-points/alignment-rl.md)。

## 6. 反转诅咒

**反转诅咒**是 AR 的结构性问题：「A is B」学不到「B is A」。Berglund 微调实验里反向 exact-match 接近 0%。LLaDA 诗句表反向 42.4，GPT-4o 34.3，正向则是 48.8 对 82.7。机制与注意力耦合见[双向注意力](../03-points/bidirectional-attention.md)。不要写成「扩散已经全面免疫」。

## 7. 长文本处理

| 方面 | 自回归 | 扩散 |
|---|---|---|
| 生成长文本 | 天然适配（逐 token 续写） | 挑战（T × n² 注意力成本） |
| 理解长文本 | causal attention 限制 | 双向注意力，理论上更高效 |

长文本是扩散模型目前最明显的短板。

## 8. 幻觉与事实性

并行并不自动带来前后一致：一步之内各位置仍按边际乘积提交。LLaDA Base 同协议 BBH 49.8，低于 LLaMA3 的 57.6；TruthfulQA 46.4 对 44.0。对齐侧 AR 有多年 RLHF，扩散刚有 VRPO 与 d1。细节见[失效模式](../03-points/failure-modes.md)。

## 9. 基础设施

| 维度 | 自回归 | 扩散 |
|---|---|---|
| 推理框架 | vLLM、SGLang、Ollama | 论文仓库 + dInfer 等；专用栈仍薄 |
| 预训练模型 | LLaMA / Qwen / 等 | LLaDA、Dream、商业 Mercury / Gemini Diffusion / Seed |
| KV Cache | 严格成立 | 全双向默认不成立；块间真缓存，跨步是近似 |

## 10. 选型

填空、反向查询、定长表格：扩散或至少要双向。可变长闲聊、超长续写、要接现有 vLLM：AR 或块扩散。要吞吐：先看绝对 tok/s 和硬件，不要看相对原版 Python 循环的倍数。要可控：能写成掩码就不要上分类器。要对齐：有对错标签走 d1 一类，风格偏好走 VRPO。机制必然与工程现状不要焊在同一格。

## 来源

- [LLaDA](https://arxiv.org/abs/2502.09992) Table 1–3。文中没有 8B 速度表。
- [Fast-dLLM](https://arxiv.org/abs/2505.22618)、[dKV-Cache](https://arxiv.org/abs/2505.15781)、[LLaDA 1.5](https://arxiv.org/abs/2505.19223)、[d1](https://arxiv.org/abs/2504.12216)
- [Diffusion-LM](https://arxiv.org/abs/2205.14217) Table 2
- [A Survey on Diffusion Language Models](https://arxiv.org/abs/2508.10875)

## 相关

- [为什么用扩散做语言生成](../01-overview/why-diffusion.md)
- [双向注意力与反转诅咒](../03-points/bidirectional-attention.md)
- [推理加速](../03-points/inference-acceleration.md)
- [可控生成](../03-points/controllable-generation.md)
- [对齐与 RL](../03-points/alignment-rl.md)
- [失效模式](../03-points/failure-modes.md)
- [LLaDA 专文](../03-models/llada-frontier.md)
