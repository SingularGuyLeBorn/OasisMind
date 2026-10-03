<!-- page 1 of 31 -->

arXiv:2601.02780v2 [cs.CL] 8 Jan 2026

Xiaomi MIMO

MI

# MiMo-V2-Flash Technical Report

LLM-Core Xiaomi

## Abstract

We present MiMo-V2-Flash, a Mixture-of-Experts (MoE) model with 309B total parameters and 15B active parameters, designed for fast, strong reasoning and agentic capabilities. MiMo-V2- Flash adopts a hybrid attention architecture that interleaves **Sliding Window Attention (SWA)** with global attention, with a 128-token sliding window under a 5:1 hybrid ratio. The model is pre-trained on 27 trillion tokens with **Multi-Token Prediction (MTP)**, employing a native 32k context length and subsequently extended to 256k. To efficiently scale post-training compute, MiMo-V2-Flash introduces a novel **Multi-Teacher On-Policy Distillation (MOPD)** paradigm. In this framework, domain-specialized teachers (e.g., trained via large-scale reinforcement learning) provide dense and token-level reward, enabling the student model to perfectly master teacher expertise. MiMo-V2-Flash rivals top-tier open-weight models such as DeepSeek-V3.2 and Kimi-K2, despite using only 1/2 and 1/3 of their total parameters, respectively. During inference, by repurposing MTP as a draft model for speculative decoding, MiMo-V2-Flash achieves up to 3.6 acceptance length and 2.6× decoding speedup with three MTP layers. We open-source both the model weights and the three-layer MTP weights to foster open research and community collaboration.

本文提出 MiMo-V2-Flash, 一个 309B 总参, 15B 激活的 MoE 模型, 目标是又快又强的推理与 Agent 能力. 混合注意力架构把 **Sliding Window Attention (SWA)** 与全局注意力交错排布, 滑窗 128 token, 混合比 5:1. 预训练 27T token, 用 **Multi-Token Prediction (MTP)**, 原生 32k 上下文, 后续扩到 256k. 为高效放大后训练算力, 提出 **Multi-Teacher On-Policy Distillation (MOPD)**: 各领域专门教师 (例如经大规模 RL 训练) 给出稠密的 token 级奖励, 让学生完整吸收教师专长. 总参只有 DeepSeek-V3.2 的 1/2, Kimi-K2 的 1/3, 却能与这两家顶尖开放模型对打. 推理时把 MTP 复用为投机解码的草稿模型, 三层 MTP 带来最高 3.6 的接受长度与 2.6 倍解码加速. 模型权重与三层 MTP 权重均已开源.

> **核对:** 摘要写 hybrid ratio 5:1 与 nearly 6× KV/attention 节省. 5:1 局部:全局怎么对应 「约 6 倍」?
> 局部:全局=5:1 意味着 6 层里 1 层全全局. 摘要把该密度直接写成 nearly 6× 的 KV-cache 与 attention 计算削减; 数字来自摘要句, 不是另表测得的墙钟倍数.

![Chart block](images/p01-figure-1-benchmark-performance-of-mimo-v2-flash.png)

Figure 1 Benchmark performance of MiMo-V2-Flash.

图 1 MiMo-V2-Flash 的基准表现.

<!-- page 2 of 31 -->

## Contents

- 1 Introduction 4
- 2 MiMo-V2-Flash Model Architecture 5 ## 2 MiMo-V2-Flash 模型架构 5
  - 2.1 Overall Architecture 5 ## 2.1 总体架构 5
  - 2.2 Hybrid Sliding Window Attention Architecture 6 ## 2.2 混合滑动窗口注意力架构 6
    - 2.2.1 Model Architecture Experiments 7 ## 2.2.1 模型架构实验 7
    - 2.2.2 Summary and Discussion 8 ## 2.2.2 小结与讨论 8
  - 2.3 Lightweight Multi-Token Prediction (MTP) 9 ## 2.3 轻量 MTP 9
    - 2.3.1 Motivation of using MTP 9 ## 2.3.1 使用 MTP 的动机 9
    - 2.3.2 Lightweight MTP Design in MiMo-V2-Flash 9 ## 2.3.2 MiMo-V2-Flash 中的轻量 MTP 设计 9
- 3 Pre-Training 9 ## 3 预训练 9
  - 3.1 Data Scheduler 10 ## 3.1 数据调度 10
  - 3.2 Hyper-Parameters 10 ## 3.2 超参数 10
  - 3.3 Evaluations 11 ## 3.3 评测 11
    - 3.3.1 Evaluation Setup 11 ## 3.3.1 评测设置 11
    - 3.3.2 Evaluation Results 11 ## 3.3.2 评测结果 11
- 4 Post-Training 11 ## 4 后训练 11
  - 4.1 Multi-Teacher On-Policy Distillation (MOPD): A New Post-Training Paradigm 11 ## 4.1 MOPD: 新的后训练范式 11
  - 4.2 Supervised Fine-Tuning (SFT) 14 ## 4.2 SFT 14
  - 4.3 Scaling Reinforcement Learning (RL) 15 ## 4.3 Scaling 强化学习 (RL) 15
    - 4.3.1 Non-Agentic RL Training 15 ## 4.3.1 非智能体 RL 训练 15
    - 4.3.2 Agentic RL Training 15 ## 4.3.2 智能体 RL 训练 15
  - 4.4 Technical Formulation of MOPD 18 ## 4.4 MOPD 的技术形式化 18
  - 4.5 Evaluations 18 ## 4.5 评测 18
    - 4.5.1 Evaluation Setup 18 ## 4.5.1 评测设置 18
    - 4.5.2 Evaluation Results 19 ## 4.5.2 评测结果 19
  - 4.6 RL Infrastructures 19 ## 4.6 RL 基础设施 19
    - 4.6.1 Stabilized Training via Rollout Routing Replay (R3) 19 ## 4.6.1 用 R3 稳定训练 19
    - 4.6.2 Data Scheduler 20 ## 4.6.2 数据调度 20
    - 4.6.3 Toolbox and Tool Manager 21 ## 4.6.3 Toolbox 与 Tool Manager 21
- 5 MTP Speedup 21 ## 5 MTP 加速 21
  - 5.1 MTP Acceptance Length 21 ## 5.1 MTP 接受长度 21

<!-- page 3 of 31 -->

  - 5.2 MTP Inference Speedup 21 ## 5.2 MTP 推理加速 21
- 6 Conclusion, Limitation, and Future Work 22
- A Contributions and Acknowledgments 29
- B Reward Hacking of SWE-Bench 31
- C Context Management 31

<!-- page 4 of 31 -->

## 1 Introduction

Recent progress towards Artificial General Intelligence (AGI) is increasingly propelled by two frontiers: advanced reasoning chains and autonomous agentic workflows (Google DeepMind, 2025; Kimi Team, 2025b; Liu et al., 2025), grounded in large-scale Reinforcement Learning (RL). Yet building scalable reasoners and agents hits a common critical bottleneck, where long-context modeling must be simultaneously fast and strong.

In this work, we introduce MiMo-V2-Flash, an efficient and cost-effective Large Language Model (LLM) that delivers strong reasoning and agentic performance. MiMo-V2-Flash is a 309B-parameter MoE with 15B activated per token. To alleviate the quadratic complexity of full attention, MiMo-V2-Flash adopts a hybrid attention mechanism that interleaves local sliding window and global attention. The sliding window size is 128-token and the hybrid local:global ratio is 5:1, yielding nearly a 6× reduction in KV-cache storage and attention computation for long contexts. With the help of learnable attention sink bias (Agarwal et al., 2025), the hybrid architecture maintains strong modeling capability even in long-context scenarios, despite the aggressive sliding window size and hybrid ratio. MiMo-V2-Flash also incorporates Multi-Token Prediction (MTP) to enhance training performance and accelerate inference decoding. In particular, MTP has strong potential to boost RL rollout speed, which helps to scale LLMs towards greater intelligence. With a lightweight dense Feed-Forward Network (FFN) and sliding window attention, our MTP block delivers substantial decoding speedups in practice at high acceptance rates.

The pre-training recipe of MiMo-V2-Flash largely follows that of MiMo-7B (Xia et al., 2025), with several enhancements. Training is conducted using FP8 mixed-precision, enabling efficient largescale training over 27T tokens. The model is initially pre-trained with a native 32K context and later extended to 256K. The resulting pretrained model, MiMo-V2-Flash-Base, has been evaluated against leading open-source base models such as Kimi-K2-Base (Kimi Team, 2025c) and DeepSeek-V3.2-Exp-Base (Liu et al., 2025). MiMo-V2-Flash-Base achieves competitive performance across general benchmarks and surpasses peer models on reasoning-focused tasks. For long-context retrieval, our hybrid attention architecture achieves nearly 100% success rates across context lengths from 32K to 256K. On the extreme long-context reasoning benchmark GSM-Infinite (Zhou et al., 2025), MiMo-V2-Flash demonstrates robust performance with minimal degradation when scaling from 16K to 128K.

In post-training, we focus on efficiently scaling RL compute to improve reasoning and agentic capabilities. To this end, MiMo-V2-Flash introduces a novel post-training paradigm termed Multi-Teacher On-Policy Distillation (MOPD). This framework addresses both learning inefficiency and capability imbalance through a three-stage process: (1) general Supervised Fine-Tuning (SFT); (2) specialized RL/SFT to train domain-specific teacher models; (3) MOPD, wherein the student model learns from two complementary signals: dense, token-level rewards from specialized teachers trained across diverse domains, and a verifiable, outcome-based reward. By integrating diverse expert knowledge in this manner, MiMo-V2-Flash simultaneously masters the peak capabilities of domain teachers while benefiting from stable and efficient learning dynamics.

MiMo-V2-Flash achieves performance comparable to that of Kimi-K2-Thinking and DeepSeek-V3.2-Thinking on most reasoning benchmarks. In long-context evaluations such as LongBench V2 and MRCR, MiMo-V2-Flash consistently surpasses larger full-attention models, confirming the robustness of its hybrid SWA architecture. Notably, the model attains 73.4% on SWE-Bench Verified and 71.7% on SWE-Bench Multilingual, establishing it as the leading open-source model for software engineering tasks. The model weights (with 3-layer MTP weights) are available at [https://github.com/XiaomiMiMo/MiMo-V2-Flash](https://github.com/XiaomiMiMo/MiMo-V2-Flash).

<!-- page 5 of 31 -->

![Image block](images/p05-figure-2-an-illustration-of-mimo-v2-flash-model.png)

Figure 2 An illustration of MiMo-V2-Flash model architecture. The model comprises 𝑀 = 8 Hybrid Blocks, where each Hybrid Block interleaves 𝑁 = 5 Sliding Window Attention (SWA) blocks with one Global Attention (GA) block. Both are equipped with a sparse MoE FFN. The only exception is the first block, which uses GA with a dense FFN. The MTP blocks employ SWA and a dense FFN.

图 2 MiMo-V2-Flash 模型架构示意. 模型含 𝑀 = 8 个 Hybrid Block, 每个 Hybrid Block 交错 𝑁 = 5 个 Sliding Window Attention (SWA) 块与 1 个 Global Attention (GA) 块. 二者均配备稀疏 MoE FFN. 唯一例外是第一块: 使用 GA 与稠密 FFN. MTP 块采用 SWA 与稠密 FFN.

## 2 MiMo-V2-Flash Model Architecture ## 2 MiMo-V2-Flash 模型架构

### 2.1 Overall Architecture ### 2.1 总体架构

As illustrated in Figure 2, MiMo-V2-Flash follows a standard Transformer (Vaswani et al., 2017) backbone augmented with MoE (Shazeer et al., 2017) and hybrid attention (Brown et al., 2020; Gemma Team, 2024, 2025; Kimi Team, 2025a; Li et al., 2025; Qwen Team, 2025). MiMo-V2-Flash is mainly composed of repeated hybrid blocks that interleave Local Sliding Window Attention (SWA) and Global Attention (GA). It stacks 𝑀 = 8 hybrid blocks, each structured with 𝑁 = 5 consecutive SWA blocks followed by an GA block. The only exception is the very first Transformer block, which uses global attention with a dense Feed-Forward Network (FFN) to stabilize early representation learning. The sliding window size 𝑊 used in MiMo-V2-Flash is 128. Both the SWA block and the GA block utilize the sparse MoE FFN. Each MoE layer comprises 256 experts in total, with 8 activated per token, and contains no shared experts.

如图 2 所示, MiMo-V2-Flash 以标准 Transformer (Vaswani et al., 2017) 为骨干, 并叠加 MoE (Shazeer et al., 2017) 与 hybrid attention (Brown et al., 2020; Gemma Team, 2024, 2025; Kimi Team, 2025a; Li et al., 2025; Qwen Team, 2025). 主体由交错 Local Sliding Window Attention (SWA) 与 Global Attention (GA) 的 hybrid block 重复构成. 共堆叠 𝑀 = 8 个 hybrid block, 每个为 𝑁 = 5 个连续 SWA 块后接 1 个 GA 块. 唯一例外是最前一层 Transformer 块: 使用全局注意力与稠密 Feed-Forward Network (FFN), 以稳定早期表示学习. MiMo-V2-Flash 的滑动窗口大小 𝑊 为 128. SWA 块与 GA 块均使用稀疏 MoE FFN. 每个 MoE 层共 256 个专家, 每 token 激活 8 个, 且不含共享专家.

> **想:** Table 1 主块 Experts 写 256/8, §2.1 又写 contains no shared experts. 共享专家列是否存在, 激活 8 是否已含共享?
> 不存在共享专家列. §2.1 明文 「contains no shared experts」; Table 1 的 256/8 是路由池总数与每 token 激活数, 激活 8 全部来自 256 路由专家.

MiMo-V2-Flash also integrates MTP (Gloeckle et al., 2024; Liu et al., 2024; Xia et al., 2025) to improve model performance (both quality and efficiency). Worth noting, the MTP block uses dense FFN instead of MoE and applies SWA rather than GA, making it lightweight for speculative decoding. The number of parameters for each MTP block is only 0.33B.

MiMo-V2-Flash 还集成 MTP (Gloeckle et al., 2024; Liu et al., 2024; Xia et al., 2025), 以同时提升质量与效率. 值得注意的是, MTP 块使用稠密 FFN 而非 MoE, 并采用 SWA 而非 GA, 从而对投机解码保持轻量. 每个 MTP 块参数量仅为 0.33B.

Table 1 summarizes detailed configurations of MiMo-V2-Flash. The model consists of 39 SWA layers and 9 GA layers. Both SWA and GA utilize Grouped-Query Attention (GQA) (Ainslie et al.,

Table 1 汇总 MiMo-V2-Flash 的详细配置. 模型含 39 个 SWA 层与 9 个 GA 层. SWA 与 GA 均使用 Grouped-Query Attention (GQA) (Ainslie et al.,

<!-- page 6 of 31 -->

<table><tr><td>Block</td><td>Configuration</td><td>Value</td></tr><tr><td rowspan="6">Main Block</td><td>Layers (Total/SWA/GA)</td><td>48/39/9</td></tr><tr><td>SWA Heads (Q/KV)</td><td>64/8</td></tr><tr><td>Sliding Window Size</td><td>128</td></tr><tr><td>GA Heads (Q/KV)</td><td>64/4</td></tr><tr><td>Head Dimensions (QK/V)</td><td>192/128</td></tr><tr><td>Experts (Total/Activated)</td><td>256/8</td></tr><tr><td rowspan="4">MTP Block</td><td>SWA Heads (Q/KV)</td><td>64/8</td></tr><tr><td>Sliding Window Size</td><td>128</td></tr><tr><td>Head Dimensions (QK/V)</td><td>192/128</td></tr><tr><td># Parameters</td><td>0.33B</td></tr></table>

Table 1 Detailed model configuration of MiMo-V2-Flash.

表 1 MiMo-V2-Flash 的详细模型配置.

> **问:** Figure 2 写 𝑀=8 Hybrid Blocks 且每块 𝑁=5 SWA+1 GA, 但 Table 1 Layers 是 48/39/9. 8×(5+1)=48 如何与 「首层例外」 对齐?
> 层计数上仍是 48. 结构例外是第一块用 GA+dense FFN, 不是少算一层; 39 SWA + 9 GA = 48, 与 8 个 hybrid 槽位及首层 GA 替换叙述一致, 见 Figure 2 注与 Table 1.

2023). Specifically, SWA has 64 query heads and 8 key-value heads, while GA has 64 query heads and 4 key-value heads. The per-head dimensions are the same for SWA and GA (192 for queries and keys, and 128 for values). Rotary Positional Embedding (RoPE, Su et al. (2024)) is partially applied to the first 64 dimensions query and key. Following recent best practices, we adopt an FP8 mixed-precision framework similar to DeepSeek-V3 (Liu et al., 2024). Specifically, we retain BF16 precision for the attention output projections, as well as for the embedding and output head parameters, while maintaining FP32 precision for the MoE router parameters. This mixed-precision configuration improves numerical stability without materially impacting training efficiency or memory footprint.

2023). 具体而言, SWA 有 64 个 query 头与 8 个 key-value 头, GA 有 64 个 query 头与 4 个 key-value 头. 每头维度对 SWA 与 GA 相同 (query 与 key 为 192, value 为 128). Rotary Positional Embedding (RoPE, Su et al. (2024)) 部分作用于 query 与 key 的前 64 维. 遵循近期实践, 我们采用与 DeepSeek-V3 (Liu et al., 2024) 类似的 FP8 混合精度框架. 具体地, 注意力输出投影以及 embedding 与输出头参数保留 BF16, MoE router 参数保持 FP32. 该混精配置提升数值稳定性, 且不明显影响训练效率或显存占用.

### 2.2 Hybrid Sliding Window Attention Architecture ### 2.2 混合滑动窗口注意力架构

Sliding window attention (Beltagy et al., 2020) restricts each token’s attention scope to a local window rather than the entire sequence, thereby reducing both computational and memory complexity dramatically. This naturally motivates hybrid attention architectures that interleave sliding window attention with global attention. However, prior work has shown that overly aggressive use of SWA, such as very small sliding window sizes or high SWA:GA ratios, can lead to substantial degradation in model performance (Gemma Team, 2025), especially in long-context tasks. Recently, the introduction of learnable attention sink bias, which allows the model to assign little or no attention to tokens when needed, has substantially enhanced the modeling capacity of SWA-based architectures (Agarwal et al., 2025). While the precise theoretical underpinnings of the attention sink mechanism remain an active research area (Gu et al., 2024b; Qiu et al., 2025; Sun et al., 2024; Xiao et al., 2023), we empirically observed that learnable attention sinks bias dramatically enhance the performance of hybrid SWA models, matching or even surpassing baselines with fully GA layers.

滑动窗口注意力 (Beltagy et al., 2020) 把每个 token 的注意力范围限制在局部窗口而非整段序列, 从而大幅降低计算与显存复杂度. 这自然催生了交错滑动窗口注意力与全局注意力的 hybrid attention 架构. 不过, 先前工作表明, 过度激进地使用 SWA (例如极小窗长或很高的 SWA:GA 比) 会显著损害模型表现 (Gemma Team, 2025), 在长上下文任务上尤为明显. 近期引入的 learnable attention sink bias 允许模型在需要时对 token 分配很少甚至为零的注意力, 大幅增强了基于 SWA 的架构的建模能力 (Agarwal et al., 2025). 尽管 attention sink 机制的精确理论仍是活跃研究方向 (Gu et al., 2024b; Qiu et al., 2025; Sun et al., 2024; Xiao et al., 2023), 我们经验上观察到: learnable attention sink bias 显著提升 hybrid SWA 模型表现, 可匹配甚至超过全 GA 层基线.

In MiMo-V2-Flash, our implementation follows the design used in gpt-oss (Agarwal et al., 2025), where a learnable attention sink bias $sink \in \mathbb{R}$ is applied to the denominator of softmax for each attention head. Specifically, let the attention logits between token 𝑖 and 𝑗 of one single head be:

在 MiMo-V2-Flash 中, 实现遵循 gpt-oss (Agarwal et al., 2025) 的设计: 对每个注意力头, 将可学习的 attention sink bias $sink \in \mathbb{R}$ 作用于 softmax 分母. 具体地, 单一头上 token 𝑖 与 𝑗 之间的注意力 logits 为:

$$
a _ {i j} = \frac {q _ {i} k _ {j} ^ {\top}}{\sqrt {d}},\tag{1}
$$

<!-- page 7 of 31 -->

where $q _ { i }$ and $k _ { j }$ denote the query of token 𝑖 and key of token 𝑗, respectively, and 𝑑 is the head dimension. The attention weights are then given by:

其中 $q _ { i }$ 与 $k _ { j }$ 分别表示 token 𝑖 的 query 与 token 𝑗 的 key, 𝑑 为头维度. 注意力权重随后由下式给出:

$$
s _ {i j} = \frac {\exp \left(a _ {i j} - m _ {i}\right)}{\exp \left(\text {sink} - m _ {i}\right) + \sum_ {j ^ {\prime}} \exp \left(a _ {i j ^ {\prime}} - m _ {i}\right)},\tag{2}
$$

$$
m _ {i} = \max \left(\max _ {j} a _ {i j}, \text {sink}\right).\tag{3}
$$

Finally, the attention output for query 𝑖 is obtained as a weighted sum over the values:

最终, query 𝑖 的注意力输出由对 values 的加权和得到:

$$
o _ {i} = \sum_ {j = 1} ^ {n} s _ {i j} v _ {j}.\tag{4}
$$

#### 2.2.1 Model Architecture Experiments #### 2.2.1 模型架构实验

To validate the effectiveness of our design choice, we conduct exploratory and empirical studies on a 32B dense model, maintaining the query–key dimensions and rotary embedding configurations consistent with those described above.

为验证设计选择的有效性, 我们在 32B 稠密模型上做探索性与经验研究, 并保持 query–key 维度与旋转位置嵌入配置与上文一致.

| Model | MMLU | BBH | TriviaQA | GSM8K | MATH | CMMLU | MBPP |
| --- | --- | --- | --- | --- | --- | --- | --- |
| All GA | 57.3 | 54.7 | 53.2 | 34.2 | 9.5 | 50.3 | 54.7 |
| Hybrid SWA(𝑊 = 128, w/o sink) | 54.9 | 52.4 | 52.8 | 36.9 | 8.9 | - | - |
| Hybrid SWA(𝑊 = 128, w/ sink) | 58.3 | 56.1 | 53.7 | 36.9 | 10.3 | 53.3 | 56.3 |
| Hybrid SWA(𝑊 = 512, w/ sink) | 58.3 | 54.9 | 54.9 | 37.9 | 10.0 | 52.3 | 53.2 |

Table 2 General benchmark results for different attention configurations.

表 2 不同注意力配置的通用基准结果.

> **看表:** Table 2 中 Hybrid SWA(𝑊=128, w/o sink) 的 CMMLU/MBPP 是 「-」, w/ sink 才有 53.3/56.3. 能否用 w/o sink 行证明 sink 在中文与代码上也恢复分数?
> 不能. 该行 CMMLU/MBPP 未报告. sink 恢复的可引用格是同表已填的 MMLU/BBH/TriviaQA/GSM8K/MATH; 中文与 MBPP 只能比较 All GA 与 w/ sink 两行.

| Model | GSM-Infinite | NoLiMa | RULER-32k | MRCR |
| --- | --- | --- | --- | --- |
| All GA | 12.3 | 49.7 | 89.4 | 32.5 |
| Hybrid SWA(𝑊 = 128, w/ sink) | 17.3 | 51.2 | 89.4 | 34.4 |
| Hybrid SWA(𝑊 = 512, w/ sink) | 17.2 | 38.5 | 84.7 | 19.6 |

Table 3 Long-context benchmark results for different attention configurations.

表 3 不同注意力配置的长上下文基准结果.

| Model | AIME24/25 | LiveCodebench | GPQA-Diamond | Average |
| --- | --- | --- | --- | --- |
| All GA | 45.5 | 40.0 | 41.7 | 42.4 |
| Hybrid SWA(W = 128, w/ sink) | 47.1 | 43.9 | 48.1 | 46.3 |

Table 4 Complex reasoning benchmark results for different attention configurations.

表 4 不同注意力配置的复杂推理基准结果.

**Baselines and Benchmarks** We evaluate four model architecture variants in a comparative setting. These include an all global attention (All GA) baseline, a hybrid SWA model with a 128-token window without attention sinks bias, and two hybrid SWA models augmented with attention sinks bias using window sizes of 128 and 512, respectively. All variants share the same training pipeline: pre-training on 250B tokens with an 8,192 sequence length, long context extension to 32,768 over an additional 40B tokens, followed by long-context SFT and reasoning SFT with chain-of-thought

**基线与基准** 我们在对比设定下评测四种模型架构变体. 包括全全局注意力 (All GA) 基线, 窗长 128, 无 attention sink bias 的 hybrid SWA, 以及分别使用窗长 128 与 512 并加 attention sink bias 的两种 hybrid SWA. 所有变体共享同一训练管线: 在 250B tokens, 序列长度 8,192 上预训练; 再以额外 40B tokens 将长上下文扩展到 32,768; 随后做 long-context SFT 与带 chain-of-thought

<!-- page 8 of 31 -->

supervision. We evaluate model variants across benchmarks covering general capability, longcontext understanding, and complex reasoning. General-domain results (Table 2) are obtained from pre-trained base models without long-context extension, evaluating general knowledge and reasoning on MMLU Hendrycks et al. (2021a), BBH (Suzgun et al., 2023), TriviaQA (Joshi et al., 2017), GSM8K (Cobbe et al., 2021), MATH (Hendrycks et al., 2021b), CMMLU (Li et al., 2023), and MBPP (Austin et al., 2021). Long-context results (Table 3) evaluate long-context–extended base models on GSM-Infinite (Zhou et al., 2025), NoLiMa (Modarressi et al., 2025), and RULER-32k (Hsieh et al., 2024), and long-context SFT models on MRCR (Vodrahalli et al., 2024). For GSM-Infinite and Nolima, we construct internal few-shot benchmarks to assess base models under controlled long-context settings. Complex reasoning results (Table 4) evaluate the reasoning SFT models on AIME24&25 (MAA, 2024), LiveCodeBench (Jain et al., 2024), and GPQA-Diamond (Rein et al., 2024).

监督的 reasoning SFT. 我们在覆盖通用能力, 长上下文理解与复杂推理的基准上评测各变体. 通域结果 (表 2) 来自未做长上下文扩展的预训练 base 模型, 在 MMLU (Hendrycks et al., 2021a), BBH (Suzgun et al., 2023), TriviaQA (Joshi et al., 2017), GSM8K (Cobbe et al., 2021), MATH (Hendrycks et al., 2021b), CMMLU (Li et al., 2023) 与 MBPP (Austin et al., 2021) 上评通用知识与推理. 长上下文结果 (表 3) 在扩展后的 base 上评 GSM-Infinite (Zhou et al., 2025), NoLiMa (Modarressi et al., 2025) 与 RULER-32k (Hsieh et al., 2024), 并在 long-context SFT 模型上评 MRCR (Vodrahalli et al., 2024). 对 GSM-Infinite 与 NoLiMa, 我们构建内部 few-shot 基准, 以在可控长上下文设定下评估 base. 复杂推理结果 (表 4) 在 reasoning SFT 模型上评 AIME24&25 (MAA, 2024), LiveCodeBench (Jain et al., 2024) 与 GPQA-Diamond (Rein et al., 2024).

We highlight our key empirical findings below:

我们强调如下关键经验发现:

**Ablation on Attention Sink Bias** As shown in Table 2, hybrid SWA (𝑊 = 128, w/o sink) suffers noticeable performance degradation across general benchmarks, whereas introducing attention sink bias consistently recovers or improves performance relative to the all-GA baseline. Thus, in our further experiments, we assume that the attention sink bias is applied by default.

**Attention Sink Bias 消融** 如表 2 所示, hybrid SWA (𝑊 = 128, w/o sink) 在通用基准上出现明显掉分, 而引入 attention sink bias 相对全 GA 基线 consistently 恢复或提升表现. 因此后续实验默认施加 attention sink bias.

**Sliding Window Attention Size** Hybrid SWA (𝑊 = 128) and Hybrid SWA (𝑊 = 512) appear to perform similarly on general benchmarks (Table 2). However, after long-context extension and long-context SFT, hybrid SWA (𝑊 = 128) surpasses the all-GA baseline, whereas SWA (𝑊 = 512) experiences significant degradation (Table 3).

**滑动窗口大小** Hybrid SWA (𝑊 = 128) 与 Hybrid SWA (𝑊 = 512) 在通用基准上表现相近 (表 2). 但经长上下文扩展与 long-context SFT 后, hybrid SWA (𝑊 = 128) 超过全 GA 基线, 而 SWA (𝑊 = 512) 出现显著退化 (表 3).

**Reasoning Ability** As shown in Table 4, hybrid SWA (𝑊 = 128) surpasses the all-GA baseline across different challenging reasoning benchmarks, showing clear improvements on complex reasoning abilities.

**推理能力** 如表 4 所示, hybrid SWA (𝑊 = 128) 在多项高难度推理基准上超过全 GA 基线, 复杂推理能力提升明确.

#### 2.2.2 Summary and Discussion #### 2.2.2 小结与讨论

Our experiments show that hybrid SWA (𝑊 = 128) not only outperforms hybrid SWA (𝑊 = 512) but can also surpass the all-GA baseline, which may seem counterintuitive. We hypothesize that this arises from a combination of better regularization and effective sparsity. Smaller windows force the model to focus on local context, serving as an inductive bias that mitigates overfitting on spurious patterns. Moreover, a tighter window (𝑊 = 128) compels SWA to model local information while delegating long-range dependencies to the global attention layers, resulting in a clearer division of labor with more accurate and efficient learning. In contrast, a larger window (𝑊 = 512) can blur this distinction, causing SWA to partially handle long-range dependencies itself, which dilutes the separation between local and global information and leads to suboptimal performance.

实验表明, hybrid SWA (𝑊 = 128) 不仅优于 hybrid SWA (𝑊 = 512), 还可超过全 GA 基线, 这看似反直觉. 我们假设这来自更好的正则与有效稀疏性的组合. 更小的窗口迫使模型聚焦局部上下文, 作为一种归纳偏置, 减轻对虚假模式的过拟合. 此外, 更紧的窗口 (𝑊 = 128) 迫使 SWA 建模局部信息, 而把长程依赖交给全局注意力层, 从而形成更清晰的分工, 学习更准也更高效. 相比之下, 更大窗口 (𝑊 = 512) 会模糊这一界限, 使 SWA 自身也部分处理长程依赖, 稀释局部与全局信息的分离, 导致次优表现.

> **拆开:** Table 3 里 𝑊=512+sink 的 RULER-32k 是 84.7, 低于 𝑊=128 的 89.4. §2.2.2 说更大窗模糊局部分工 — 这与 RULER 掉分如何指回?
> §2.2.2 用 「larger window blur local/global separation」 解释 𝑊=512 在长上下文扩展后全面弱于 𝑊=128. Table 3 的 RULER-32k 84.7 与 MRCR 19.6 是该经验结论的表内证据, 不是另一套机制.

We emphasize that these observations and findings are empirical and derived from our specific experimental settings, including model scale, datasets, and training procedures. Nonetheless, we hope these observations contribute an additional perspective to the ongoing discussion of efficient attention architectures in the era of reasoning and agentic AI models, and motivate further community-wide investigation into efficient architecture.

我们强调: 这些观察与发现是经验性的, 来自特定实验设定 (含模型规模, 数据集与训练流程). 尽管如此, 我们希望这些观察能为推理与智能体 AI 时代的高效注意力架构讨论提供另一视角, 并推动社区对高效架构的进一步研究.

<!-- page 9 of 31 -->

### 2.3 Lightweight Multi-Token Prediction (MTP) ### 2.3 轻量 MTP

#### 2.3.1 Motivation of using MTP #### 2.3.1 使用 MTP 的动机

Prior work demonstrates that MTP is a powerful training objective that enhances training efficiency and model quality (Gloeckle et al., 2024; Liu et al., 2024; Xia et al., 2025). Beyond these training benefits, we place stronger emphasis on exploiting MTP as a native draft model for self-speculative decoding to deliver real-deployment speedup. In the following, we elaborate on how MTP accelerates inference from two perspectives: general LLM decoding speedup and RL training acceleration.

先前工作表明, MTP 是强大的训练目标, 可提升训练效率与模型质量 (Gloeckle et al., 2024; Liu et al., 2024; Xia et al., 2025). 在这些训练收益之外, 我们更强调把 MTP 用作原生草稿模型做 self-speculative decoding, 以交付真实部署加速. 下文从两方面阐述 MTP 如何加速推理: 通用 LLM 解码加速, 以及 RL 训练加速.

**Accelerating LLM Decoding** LLM decoding is inherently memory-bound due to low arithmetic intensity. Batch-level parallelism is commonly used to increase FFN arithmetic intensity but does not benefit attention computation, as each request maintains its own KV cache. In contrast, MTP lifts the arithmetic intensity of both FFN and attention by generating multiple draft tokens, which the main model then verifies in parallel. This approach enables token-level parallelism without increasing KV cache I/O.

**加速 LLM 解码** LLM 解码因算术强度低而本质受内存带宽约束. 常用 batch 级并行提高 FFN 算术强度, 但无益于注意力计算, 因为每个请求各自维护 KV cache. 相比之下, MTP 通过生成多个草稿 token, 再由主模型并行校验, 同时抬高 FFN 与注意力的算术强度. 该方法实现 token 级并行, 且不增加 KV cache I/O.

**Accelerating RL Training** MTP acceleration is particularly well-suited for RL training (RadixArk Team, 2025), where the rollout phase consistently emerges as the dominant bottleneck due to the inference and decoding costs. MTP addresses two key challenges in RL training:

**加速 RL 训练** MTP 加速尤其适合 RL 训练 (RadixArk Team, 2025): rollout 阶段因推理与解码成本而 consistently 成为主瓶颈. MTP 应对 RL 训练中的两个关键挑战:

• It enables efficient and effective RL with small batches. Current RL training relies on largebatch, off-policy algorithms to maximize throughput (Liu et al., 2025; Schulman et al., 2017; Zheng et al., 2025). However, on-policy training is generally more stable and effective, yet its small batches underutilize GPU resources. MTP mitigates this limitation by scaling token-level parallelism instead of batch size, making small-batch, on-policy RL training more practical.

• 它使小 batch 的高效且有效 RL 成为可能. 当前 RL 训练依赖大 batch, off-policy 算法以最大化吞吐 (Liu et al., 2025; Schulman et al., 2017; Zheng et al., 2025). 然而 on-policy 训练通常更稳也更有效, 但其小 batch 无法吃满 GPU. MTP 通过 Scaling token 级并行而非 batch 大小来缓解该限制, 使小 batch, on-policy RL 训练更可行.

• It mitigates GPU idleness from long-tail stragglers. As the rollout phase progresses, long-tail stragglers that process long sequences with small batch sizes (often approaching 1) can cause significant GPU idleness (Gao et al., 2025; Zhong et al., 2025). In such scenarios, MTP enhances the computational efficiency of both attention and FFN, substantially reducing overall latency.

• 它缓解长尾 straggler 造成的 GPU 空转. 随着 rollout 推进, 以小 batch (常接近 1) 处理长序列的长尾 straggler 会造成显著 GPU 空闲 (Gao et al., 2025; Zhong et al., 2025). 在此类场景中, MTP 提升注意力与 FFN 的计算效率, 显著降低整体延迟.

#### 2.3.2 Lightweight MTP Design in MiMo-V2-Flash #### 2.3.2 MiMo-V2-Flash 中的轻量 MTP 设计

In MiMo-V2-Flash, the MTP block is deliberately kept lightweight to prevent it from becoming a new inference bottleneck. We use a small dense FFN rather than MoE to limit parameter count, and employ SWA instead of Global Attention (GA) to reduce KV cache and attention computation costs. During pre-training, only a single MTP head is attached to the model to avoid extra training overhead. In post-training, this head is replicated 𝐾 times to form a 𝐾-step MTP module, and all heads are jointly trained for multi-step prediction. Each head receives the main-model hidden state and token embedding as input, providing richer predictive information. Despite its lightweight design, the MTP module remains highly effective and achieves a high acceptance rate. Detailed results are presented in Section 5.

在 MiMo-V2-Flash 中, MTP 块被刻意保持轻量, 以免成为新的推理瓶颈. 我们用小型稠密 FFN 而非 MoE 以限制参数量, 并用 SWA 而非 Global Attention (GA) 以降低 KV cache 与注意力计算成本. 预训练期仅挂接单个 MTP head, 避免额外训练开销. 后训练将该 head 复制 𝐾 次, 形成 𝐾-step MTP 模块, 并联合训练所有 head 做多步预测. 每个 head 接收主模型 hidden state 与 token embedding 作为输入, 提供更丰富的预测信息. 尽管设计轻量, MTP 模块仍高度有效并达到高接受率. 详细结果见第 5 节.

> **确认:** §2.3.2 写预训练 only a single MTP head, 后训练 replicated 𝐾 times; §5 与摘要又写 three MTP layers. 𝐾 是否就是 3?
> 是. 正文用 𝐾 描述复制次数, 摘要与 §5 / Table 10 的实测固定为 3-layer MTP; 开源也提供 three-layer MTP weights.

## 3 Pre-Training ## 3 预训练

The MiMo-V2-Flash pre-training corpus consists of 27 trillion tokens drawn from a diverse collection of high-quality sources, including public web content, books, academic papers, code, mathematics,

MiMo-V2-Flash 预训练语料含 27 万亿 tokens, 来自多样高质量来源, 包括公开网页, 书籍, 学术论文, 代码, 数学,

<!-- page 10 of 31 -->

and broader STEM materials. Our data processing pipeline largely follows that of MiMo-7B (Xia et al., 2025), with a deliberate shift toward data exhibiting long-range dependencies. In particular, we emphasize long-form web documents and carefully curated code corpora such as repositorylevel code, pull requests, issues, and commit histories to strengthen the model’s ability to capture extended contextual relationships and perform complex, multi-step reasoning.

以及更广的 STEM 材料. 数据处理流水大体遵循 MiMo-7B (Xia et al., 2025), 并有意转向具有长程依赖的数据. 尤其强调长文网页, 以及精心整理的代码语料 (如仓库级代码, pull request, issue 与 commit 历史), 以加强模型捕捉扩展上下文关系并执行复杂多步推理的能力.

### 3.1 Data Scheduler ### 3.1 数据调度

The pre-training of MiMo-V2-Flash is organized into three sequential stages:

MiMo-V2-Flash 的预训练组织为三个顺序阶段:

• Stage 1 (Pre-training, 0 – 22T). The model is trained on a diverse, high-quality generalpurpose corpus using a context length of 32K tokens to establish strong foundational language capabilities.

• Stage 1 (预训练, 0 – 22T). 在多样高质量通用语料上, 以 32K tokens 上下文长度训练, 建立坚实的基础语言能力.

• Stage 2 (Mid-training, 22 – 26T). We modify the data mixture by upsampling code-centric data and incorporating approximately 5% synthetic reasoning data to further enhance logical reasoning and program synthesis abilities.

• Stage 2 (中训, 22 – 26T). 调整数据配比: 上采样代码中心数据, 并加入约 5% 合成推理数据, 以进一步增强逻辑推理与程序综合能力.

• Stage 3 (Context Extension, 26 – 27T). Following the Stage 2 data distribution, we extend the model’s context window to 256K tokens and upsample data with long-range dependencies, enabling more effective modeling of extended contexts and long-horizon reasoning.

• Stage 3 (上下文扩展, 26 – 27T). 沿用 Stage 2 数据分布, 将上下文窗口扩展到 256K tokens, 并上采样具有长程依赖的数据, 以更有效地建模扩展上下文与长程推理.

### 3.2 Hyper-Parameters ### 3.2 超参数

**Model Hyper-Parameters** We configure MiMo-V2-Flash with 48 Transformer layers, comprising 39 sliding window attention layers and 9 global attention layers. The hidden dimension is set to 4096. All layers except the first are equipped with sparse MoE. Each MoE layer contains 256 routed experts, with 8 experts activated per token, and an intermediate hidden dimension of 2048 for each expert. The intermediate hidden dimension of the FFN of dense layers is set to 16384. All learnable parameters are randomly initialized with a standard deviation of 0.006. The model uses a single MTP layer during pre-training. Overall, MiMo-V2-Flash has 309B total parameters, of which 15B are active.

**模型超参数** 我们将 MiMo-V2-Flash 配置为 48 层 Transformer, 其中 39 层滑动窗口注意力, 9 层全局注意力. 隐层维度为 4096. 除第一层外均配备稀疏 MoE. 每个 MoE 层含 256 个路由专家, 每 token 激活 8 个专家, 每个专家中间隐维为 2048. 稠密层 FFN 的中间隐维设为 16384. 全部可学习参数以标准差 0.006 随机初始化. 预训练期使用单个 MTP 层. 总体而言, MiMo-V2-Flash 总参 309B, 其中 15B 为激活参数.

> **回看:** 每个 MTP block 0.33B, 若推理挂 3 层, 草稿侧参数大约多少? 主模型 309B 是否包含这 3×0.33B?
> 3×0.33B=0.99B 量级来自 Table 1 单块 0.33B 与 3-layer 设定的乘积. §3.2 写 Overall 309B total / 15B active 时, 语境是主模型配置; 摘要把 model weights 与 three-layer MTP weights 分开开源, 表明 MTP 权重按附加模块交付.

> **对一下:** §3.2 专家中间维 2048, dense FFN 中间维 16384. 首层 dense 与 MTP dense 是否共用 16384 这一档?
> §3.2 写 「The intermediate hidden dimension of the FFN of dense layers is set to 16384」, 同时 「All layers except the first are equipped with sparse MoE」. 首层是文中的 dense layer, 应落在 16384. MTP 只给了总参 0.33B 与 SWA 头配置, 未单独写 MTP FFN 中间维; 不能把 16384 自动写成 MTP 已披露值.

**Training Hyper-Parameters** We employ the AdamW optimizer with $\beta _ { 1 } = 0 . 9 ,   \beta _ { 2 } = 0 . 9 5$, and a weight decay of 0.1. Gradient clipping is applied with a maximum norm of 1.0. The learning rate schedule operates in two stages. In Stage 1, the learning rate starts with a linear warm-up from 0 to $3 . 2 \times 1 0 ^ { - 4 }$ over the first 50B tokens, followed by a constant phase at $3 . 2 \times 1 0 ^ { - 4 }$ for 12T tokens, and concludes with a cosine decay to $1 . 0 \times 1 0 ^ { - 4 }$ over 10T tokens. Stage 2 begins at $1 . 0 \times 1 0 ^ { - 4 }$ and follows a cosine decay down to $3 . 0 \times 1 0 ^ { - 5 }$ over 4T tokens. The batch size warms up linearly to 2,048 over the initial 500B tokens and remains constant for the remainder of both stages. Regarding auxiliary losses, the MoE sequence auxiliary loss coefficient is set to $1 . 0 \times 1 0 ^ { - 5 }$ for all stages. The expert bias update factor is set to 0.001 during Stage 1 and Stage 2. The MTP loss weight is set to 0.3 for Stage 1 and 0.1 for Stage 2 and 3.

**训练超参数** 我们使用 AdamW 优化器, $\beta _ { 1 } = 0 . 9 ,   \beta _ { 2 } = 0 . 9 5$, weight decay 为 0.1. 梯度裁剪最大范数为 1.0. 学习率日程分两段. Stage 1: 前 50B tokens 从 0 线性暖启动到 $3 . 2 \times 1 0 ^ { - 4 }$, 随后以 $3 . 2 \times 1 0 ^ { - 4 }$ 常数训练 12T tokens, 再在 10T tokens 上余弦衰减到 $1 . 0 \times 1 0 ^ { - 4 }$. Stage 2 从 $1 . 0 \times 1 0 ^ { - 4 }$ 起, 在 4T tokens 上余弦衰减到 $3 . 0 \times 1 0 ^ { - 5 }$. Batch size 在最初 500B tokens 线性暖到 2,048, 并在两阶段余下部分保持恒定. 辅助损失方面, MoE sequence auxiliary loss 系数在各阶段均为 $1 . 0 \times 1 0 ^ { - 5 }$. Expert bias update factor 在 Stage 1 与 Stage 2 设为 0.001. MTP 损失权重 Stage 1 为 0.3, Stage 2 与 3 为 0.1.

**Long Context Extension** In Stage 1, we set the pre-training sequence length to 32,768 with a RoPE base frequency of 640,000 for GA and 10,000 for SWA. In Stage 3, the sequence length is extended to 262,144, and the RoPE base frequency of GA is adjusted to 5,000,000. The learning rate in Stage 3 decays from $3 . 0 \times 1 0 ^ { - 5 }$ to $1 . 0 \times 1 0 ^ { - 5 }$ following a cosine schedule, with a fixed batch size of 256. The expert bias update factor is reduced to $1 . 0 \times 1 0 ^ { - 5 }$ in Stage 3.

**长上下文扩展** Stage 1 中, 预训练序列长度设为 32,768, GA 的 RoPE base frequency 为 640,000, SWA 为 10,000. Stage 3 将序列长度扩展到 262,144, 并将 GA 的 RoPE base frequency 调整为 5,000,000. Stage 3 学习率按余弦从 $3 . 0 \times 1 0 ^ { - 5 }$ 衰减到 $1 . 0 \times 1 0 ^ { - 5 }$, batch size 固定为 256. Expert bias update factor 在 Stage 3 降为 $1 . 0 \times 1 0 ^ { - 5 }$.

> **停一下:** Stage 1 RoPE base GA=640,000, SWA=10,000; Stage 3 只写 GA 调到 5,000,000. SWA 的 base 在扩展阶段有没有改?
> 正文只写 Stage 3 调整 GA 的 RoPE base 到 5,000,000, 未写 SWA base 变更. 能确认的是 GA 基频与序列长度 262,144; SWA 仍以 Stage 1 的 10,000 为文中最后显式值.

<!-- page 11 of 31 -->

### 3.3 Evaluations ### 3.3 评测

#### 3.3.1 Evaluation Setup #### 3.3.1 评测设置

We evaluate MiMo-V2-Flash-Base on a series of benchmarks, encompassing various capabilities: (1) General language understanding and reasoning, including BBH (Suzgun et al., 2023), MMLU (Hendrycks et al., 2021a), MMLU-Redux (Gema et al., 2024), MMLU-Pro (Wang et al., 2024), DROP (Dua et al., 2019), ARC (Clark et al., 2018), HellaSwag (Zellers et al., 2019), WinoGrande (Sakaguchi et al., 2020), TriviaQA (Joshi et al., 2017), GPQA-Diamond (Rein et al., 2024), SuperGPQA (Du et al., 2025), and SimpleQA (OpenAI, 2024). (2) Mathematics reasoning. GSM8K (Cobbe et al., 2021), MATH (Hendrycks et al., 2021b), and AIME (MAA, 2024) (2024 & 2025). (3) Coding. HumanEval+ (Liu et al., 2023), MBPP+ (Liu et al., 2023), CRUXEval (Gu et al., 2024a), MultiPL-E (Cassano et al., 2022), BigCodeBench (Zhuo et al., 2024), LiveCodeBenchv6 (Jain et al., 2024), and SWE-Bench (Jimenez et al., 2024a) (few-shot Agentless Repair (Xia et al., 2024)). (4) Chinese understanding. C-Eval (Huang et al., 2023), CMMLU (Li et al., 2023), and C-SimpleQA (He et al., 2025). (5) Multilingual understanding. GlobalMMLU (Singh et al., 2025), and INCLUDE (Romanou et al., 2024). (6) Long context. NIAH-Multi (Hsieh et al., 2024), GSM-Infinite (Zhou et al., 2025) (5-shot, Hard Ops-{2,4,6,8,10}).

我们在一系列基准上评测 MiMo-V2-Flash-Base, 覆盖多种能力: (1) 通用语言理解与推理, 含 BBH (Suzgun et al., 2023), MMLU (Hendrycks et al., 2021a), MMLU-Redux (Gema et al., 2024), MMLU-Pro (Wang et al., 2024), DROP (Dua et al., 2019), ARC (Clark et al., 2018), HellaSwag (Zellers et al., 2019), WinoGrande (Sakaguchi et al., 2020), TriviaQA (Joshi et al., 2017), GPQA-Diamond (Rein et al., 2024), SuperGPQA (Du et al., 2025), SimpleQA (OpenAI, 2024). (2) 数学推理: GSM8K (Cobbe et al., 2021), MATH (Hendrycks et al., 2021b), AIME (MAA, 2024) (2024 & 2025). (3) 代码: HumanEval+ (Liu et al., 2023), MBPP+ (Liu et al., 2023), CRUXEval (Gu et al., 2024a), MultiPL-E (Cassano et al., 2022), BigCodeBench (Zhuo et al., 2024), LiveCodeBenchv6 (Jain et al., 2024), SWE-Bench (Jimenez et al., 2024a) (few-shot Agentless Repair (Xia et al., 2024)). (4) 中文理解: C-Eval (Huang et al., 2023), CMMLU (Li et al., 2023), C-SimpleQA (He et al., 2025). (5) 多语理解: GlobalMMLU (Singh et al., 2025), INCLUDE (Romanou et al., 2024). (6) 长上下文: NIAH-Multi (Hsieh et al., 2024), GSM-Infinite (Zhou et al., 2025) (5-shot, Hard Ops-{2,4,6,8,10}).

#### 3.3.2 Evaluation Results #### 3.3.2 评测结果

Table 5 presents a comprehensive comparison of MiMo-V2-Flash-Base against leading open-source base models (Kimi Team, 2025c; Liu et al., 2024). MiMo-V2-Flash-Base delivers competitive performance across most benchmarks and consistently outperforms peers on reasoning tasks (MMLU-Pro, GPQA-Diamond, AIME). On SWE-Bench, it even surpasses the substantially larger Kimi-K2-Base while using less than one-third the parameters, underscoring the strength of our approach for realistic code-agent tasks. However, constrained by its limited parameter count, we observe MiMo-V2-Flash exhibits lower knowledge capacity compared to larger models, as reflected in SimpleQA.

表 5 给出 MiMo-V2-Flash-Base 与领先开源 base 模型的综合对比 (Kimi Team, 2025c; Liu et al., 2024). MiMo-V2-Flash-Base 在多数基准上表现有竞争力, 并在推理任务 (MMLU-Pro, GPQA-Diamond, AIME) 上 consistently 超过同侪. 在 SWE-Bench 上甚至超过总参显著更大的 Kimi-K2-Base, 而所用参数不到其三分之一, 凸显本方法在真实代码智能体任务上的实力. 不过, 受限于参数量, 我们观察到 MiMo-V2-Flash 的知识容量低于更大模型, 这反映在 SimpleQA 上.

We illustrate the long context capabilities of each model in Table 6. For long-context retrieval, our model architecture achieves a near 100% success rate from 32K to 256K. On the extreme stress long context reasoning benchmark GSM-Infinite, MiMo-V2-Flash also shows strong performance, with minimal performance degradation from 16K to 128K. In contrast, DeepSeek-V3.2-Exp, a sparse attention LLM, attains the highest score under 32K but degrades substantially at 64K and 128K, suggesting an intrinsic disadvantage in long-context reasoning with noisy inputs. These results strongly demonstrate the effectiveness and scalability of our hybrid SWA architecture, vanilla 32K pretraining, and context extension training.

表 6 展示各模型的长上下文能力. 对长上下文检索, 本模型架构在 32K 到 256K 上接近 100% 成功率. 在极端压力长上下文推理基准 GSM-Infinite 上, MiMo-V2-Flash 同样表现强劲, 从 16K 到 128K 退化很小. 相比之下, 稀疏注意力 LLM DeepSeek-V3.2-Exp 在 32K 下得分最高, 但在 64K 与 128K 显著退化, 提示其在噪声输入的长上下文推理上存在内在劣势. 这些结果有力证明了 hybrid SWA 架构, 原生 32K 预训练与上下文扩展训练的有效性与可扩展性.

## 4 Post-Training ## 4 后训练

### 4.1 Multi-Teacher On-Policy Distillation (MOPD): A New Post-Training Paradigm ### 4.1 MOPD: 新的后训练范式

Modern language models increasingly rely on extensive post-training to enhance their intelligence and capabilities. However, current post-training pipelines face fundamental challenges: capability imbalance, where improving one skill causes regressions in others (the “see-saw” effect), and learning inefficiency, where existing approaches fail to fully leverage training signals when combining knowledge from multiple specialized models.

现代语言模型日益依赖大规模后训练以提升智能与能力. 然而当前后训练管线面临根本挑战: 能力失衡 (提升一项技能导致其他回退, 即 「跷跷板」 效应), 以及学习低效 (在融合多个专精模型知识时, 现有方法未能充分利用训练信号).

We propose Multi-Teacher On-Policy Distillation (MOPD), a unified post-training paradigm that addresses these challenges through a three-stage framework, as illustrated in Figure 3:

我们提出 Multi-Teacher On-Policy Distillation (MOPD), 一种统一的后训练范式, 通过三阶段框架应对上述挑战, 如图 3 所示:

<!-- page 12 of 31 -->

| Benchmark | M # Shots | iMo-V2-FlasBase | h Kimi-K2 Base | DeepSeek-V3.1Base | DeepSeek-V3.2 Exp Base |
| --- | --- | --- | --- | --- | --- |
| #Activated Params | - | 15B | 32B | 37B | 37B |
| #Total Params | - | 309B | 1043B | 671B | 671B |
| General |  |  |  |  |  |
| BBH | 3-shot | 88.5 | 88.7 | 88.2 | 88.7 |
| MMLU | 5-shot | 86.7 | 87.8 | 87.4 | 87.8 |
| MMLU-Redux | 5-shot | 90.6 | 90.2 | 90.0 | 90.4 |
| MMLU-Pro | 5-shot | 73.2 | 69.2 | 58.8 | 62.1 |
| DROP | 3-shot | 84.7 | 83.6 | 86.3 | 86.6 |
| ARC-Challenge | 25-shot | 95.9 | 96.2 | 95.6 | 95.5 |
| HellaSwag | 10-shot | 88.5 | 94.6 | 89.2 | 89.4 |
| WinoGrande | 5-shot | 83.8 | 85.3 | 85.9 | 85.6 |
| TriviaQA | 5-shot | 80.3 | 85.1 | 83.5 | 83.9 |
| GPQA-Diamond | 5-shot | 55.1 | 48.1 | 51.0 | 52.0 |
| SuperGPQA | 5-shot | 41.1 | 44.7 | 42.3 | 43.6 |
| SimpleQA | 5-shot | 20.6 | 35.3 | 26.3 | 27.0 |
| Mathematics |  |  |  |  |  |
| GSM8K | 8-shot | 92.3 | 92.1 | 91.4 | 91.1 |
| MATH | 4-shot | 71.0 | 70.2 | 62.6 | 62.5 |
| AIME 24&amp;25 | 2-shot | 35.3 | 31.6 | 21.6 | 24.8 |
| Code |  |  |  |  |  |
| HumanEval+ | 1-shot | 70.7 | 84.8 | 64.6 | 67.7 |
| MBPP+ | 3-shot | 71.4 | 73.8 | 72.2 | 69.8 |
| CRUXEval-I | 1-shot | 67.5 | 74.0 | 62.1 | 63.9 |
| CRUXEval-O | 1-shot | 79.1 | 83.5 | 76.4 | 74.9 |
| MultiPL-E HumanEval | 0-shot | 59.5 | 60.5 | 45.9 | 45.7 |
| MultiPL-E MBPP | 0-shot | 56.7 | 58.8 | 52.5 | 50.6 |
| BigCodeBench | 0-shot | 70.1 | 61.7 | 63.0 | 62.9 |
| LiveCodeBench v6 | 1-shot | 30.8 | 26.3 | 24.8 | 24.9 |
| SWE-Bench (AgentLessRepair) | 3-shot | 30.8 | 28.2 | 24.8 | 9.4<sup>∗</sup> |
| Chinese |  |  |  |  |  |
| C-Eval | 5-shot | 87.9 | 92.5 | 90.0 | 91.0 |
| CMMLU | 5-shot | 87.4 | 90.9 | 88.8 | 88.9 |
| C-SimpleQA | 5-shot | 61.5 | 77.6 | 70.9 | 68.0 |
| Multilingual |  |  |  |  |  |
| GlobalMMLU | 5-shot | 76.6 | 80.7 | 81.9 | 82.0 |
| INCLUDE | 5-shot | 71.4 | 75.3 | 77.2 | 77.2 |

Table 5 Comparison among MiMo-V2-Flash and other open-source base models. An asterisk (\*) denotes that the model does not follow the format of few-shot examples.

表 5 MiMo-V2-Flash 与其他开源 base 模型对比. 星号 (\*) 表示模型未遵循 few-shot 示例格式.

> **再看:** Table 5 SWE-Bench (AgentLessRepair) MiMo 30.8, DeepSeek-V3.2 Exp Base 9.4*. 星号含义能否说明 V3.2-Exp 同设定可比?
> Table 5 注: asterisk 表示模型未遵循 few-shot 示例格式. 9.4* 与 30.8 同表并列, 但星号提醒格式遵循可能不同, 引用时需带注, 不能当成无条件同协议分数.

<!-- page 13 of 31 -->

| Benchmark | M Length | iMo-V2-FlasBase | h Kimi-K2 Base | DeepSeek-V3.1Base | DeepSeek-V3.2 Exp Base |
| --- | --- | --- | --- | --- | --- |
| #Activated Params | - | 15B | 32B | 37B | 37B |
| #Total Params | - | 309B | 1043B | 671B | 671B |
| NIAH-Multi | 32K64K128K256K | 99.399.998.696.7 | 99.8100.099.5- | 99.798.697.2- | 85.6∗85.9<sup>∗</sup>94.3<sup>∗</sup>- |
| GSM-Infinite Hard | 16K32K64K128K | 37.733.731.529.0 | 34.626.116.08.8 | 41.538.834.728.7 | 50.445.232.625.7 |

**Table 6** Long context performance of MiMo-V2-Flash and other open-source base models. An asterisk (\*) indicates the model may fail to follow the prompt. All baseline models have maximum model lengths shorter than 256K.

**表 6** MiMo-V2-Flash 与其他开源 base 模型的长上下文表现. 星号 (\*) 表示模型可能未遵循提示. 所有基线模型的最大模型长度均短于 256K.

> **对一下:** Table 6 NIAH-Multi 在 256K 上 MiMo 96.7, 对照列多为 「-」. 能否说 Flash 是唯一评到 256K 的?
> Table 6 注写 All baseline models have maximum model lengths shorter than 256K, 故对照在 256K 为 「-」. 这支持 「本表内仅 Flash 给出 256K NIAH」, 不是全球唯一, 而是该对照集的最大长度限制.

![Image block](images/p13-figure-3-overview-of-mimo-v2-flash-post-training-stages.png)

Figure 3 Overview of MiMo-V2-Flash post-training stages.

图 3 MiMo-V2-Flash 后训练阶段总览.

**Stage 1: Supervised Fine-Tuning (SFT)** We establish foundational instruction-following capabilities through supervised learning on high-quality instruction-response pairs, enabling the model to understand and execute user requests across diverse domains.

**Stage 1: SFT** 我们在高质量指令-响应对上做监督学习, 建立基础指令跟随能力, 使模型能跨多样域理解并执行用户请求.

**Stage 2: Domain-Specialized Training** We train a suite of domain-specialized teacher models through independent RL optimization on focused tasks including agentic capabilities (search, coding, general tool use) and non-agentic tasks (mathematical reasoning, general reasoning, safety alignment). Each teacher achieves superior performance in its respective domain through targeted optimization with domain-specific reward signals.

**Stage 2: 域专精训练** 我们在聚焦任务上独立做 RL 优化, 训练一套域专精教师模型, 任务含智能体能力 (搜索, 编码, 通用工具使用) 与非智能体任务 (数学推理, 通识推理, 安全对齐). 每个教师通过域特定奖励信号的定向优化, 在各自域达到更优表现.

**Stage 3: Multi-Teacher On-Policy Distillation** Rather than merging model parameters or generating static offline datasets from experts, we formulate multi-teacher knowledge integration as an on-policy reinforcement learning process. The student model samples from its own evolving distribution and receives token-level supervision from domain-specific teachers through KL diver-

**Stage 3: Multi-Teacher On-Policy Distillation** 我们不合并模型参数, 也不从专家生成静态离线数据集, 而是把多教师知识整合表述为 on-policy 强化学习过程. 学生模型从其自身演化分布中采样, 并通过 KL 散度

<!-- page 14 of 31 -->

gence rewards (Agarwal et al., 2023; Gu et al., 2024c; Lu and Lab, 2025), effectively combining specialized capabilities without the traditional trade-offs (Table 7).

奖励 (Agarwal et al., 2023; Gu et al., 2024c; Lu and Lab, 2025) 接受来自域专精教师的 token 级监督, 从而在无传统权衡的情况下有效融合专精能力 (表 7).

| Benchmark | Student Before MOPD | Best Teacher | Student After MOPD | Δ(Student-Teacher) |
| --- | --- | --- | --- | --- |
| AIME 2025 | 89.3 | 93.9 (RL) | 94.1 | +0.2 |
| HMMT Feb. 2025 | 76.9 | 82.6 (RL) | 84.4 | +1.8 |
| LiveCodeBench | 77.5 | 82.6 (RL) | 83.2 | +0.6 |
| MMLU-Pro | 84.7 | 84.7 (Self) | 84.9 | +0.2 |
| GPQA-Diamond | 84.9 | 84.9 (Self) | 84.3 | -0.6 |
| HLE (w/oTool) | 21.2 | 21.2 (Self) | 22.1 | +0.9 |
| Arena-Hard (HardPrompt) | 50.0 | 50.0 (Self) | 54.1 | +4.1 |
| Arena-Hard (CreativeWriting) | 90.1 | 90.1 (Self) | 86.2 | -3.9 |
| SWE-Bench Verified | 67.8 | 74.2 (RL) | 73.4 | -0.8 |
| Tau2-Bench | 75.9 | 79.6 (RL) | 80.3 | +0.7 |
| Tau2-Bench (Telecom) | 92.7 | 95.0 (RL) | 95.3 | +0.3 |
| BrowseComp | 42.5 | 51.7 (SFT) | 45.4 | -6.3 |

Table 7 Benchmark results of MOPD. The model types of best teachers are tagged, including RL, SFT, and the student model itself.

表 7 MOPD 的基准结果. 最佳教师的模型类型已标注, 包括 RL, SFT 与学生模型自身.

This unified framework offers several critical advantages over traditional post-training approaches:

该统一框架相对传统后训练方法有若干关键优势:

Effective and Efficient. Unlike parameter merging or sequential training, which often trade off capabilities, MOPD preserves peak performance of the strongest teacher across all domains. Furthermore, on-policy distillation using dense, token-level rewards from teacher logits ensures stable credit assignment and rapid convergence. By learning from its own distribution, the student avoids the exposure bias and distribution mismatch common in off-policy methods trained on static datasets.

有效且高效. 与常常权衡能力的参数合并或顺序训练不同, MOPD 在各域保留最强教师的峰值表现. 此外, 使用来自教师 logits 的稠密 token 级奖励做 on-policy 蒸馏, 保证稳定的 credit assignment 与快速收敛. 通过从自身分布学习, 学生避免了在静态数据集上训练的 off-policy 方法常见的暴露偏差与分布失配.

> **想:** Table 7 BrowseComp 学生 After MOPD 45.4, Best Teacher 51.7 (SFT), Δ=-6.3. MOPD 「preserves peak performance of the strongest teacher across all domains」 与此格如何共存?
> 该格是明文未追平教师的例子. §4.1 主张是总体框架优势, Table 7 同时列出负 Δ (BrowseComp -6.3, CreativeWriting -3.9, GPQA -0.6, SWE -0.8). 指回本表时, 「全域峰值」 是目标陈述, 不是 BrowseComp 已达成的事实.

Modular and Scalable. The choice of teacher model is highly flexible: it can be a specialized RL-derived model with strong capabilities, a different SFT model, or even the student model itself. The decoupled design enables easy integration of new teachers without restructuring the entire pipeline. Moreover, the framework works seamlessly with existing outcome reward models (ORMs) and is especially advantageous for complex agentic tasks, where setting up independent training pipelines would otherwise be cumbersome.

模块化且可扩展. 教师模型选择高度灵活: 可以是能力强的 RL 专精模型, 不同的 SFT 模型, 甚至学生自身. 解耦设计便于接入新教师而无需重组整条管线. 此外, 该框架可与现有 outcome reward models (ORMs) 无缝配合, 对复杂智能体任务尤其有利 — 否则为各任务单独搭训练管线会很繁琐.

• Iterative Co-Evolution. MOPD naturally supports a teacher-student co-evolution cycle. Distilled student models can re-enter the specialized RL stage to produce stronger teachers, which in turn provide higher-quality supervision for the next generation of students, forming a self-reinforcing improvement cycle that enables sustained capability scaling.

• 迭代共进化. MOPD 自然支持师生共进化循环. 蒸馏后的学生可再进入专精 RL 阶段产出更强教师, 后者又为下一代学生提供更高质量监督, 形成自我强化的改进循环, 支撑持续的能力 Scaling.

In the following subsections, we detail each stage of the MOPD paradigm, beginning with supervised fine-tuning (§4.2), followed by specialized RL for both agentic and non-agentic tasks (§4.3), and conclude with the technical formulation of the multi-teacher distillation mechanism (§4.4).

以下各小节详述 MOPD 范式的每一阶段: 先是 SFT (§4.2), 再是智能体与非智能体任务上的专精 RL (§4.3), 最后给出多教师蒸馏机制的技术形式化 (§4.4).

### 4.2 Supervised Fine-Tuning (SFT) ### 4.2 SFT

The SFT stage serves as the foundation of our post-training pipeline, transforming the base model into a helpful assistant capable of following instructions and responding effectively across diverse tasks. This stage is crucial for activating the model’s latent capabilities acquired during pre-training and aligning its outputs with desired formats and styles.

SFT 阶段是后训练管线的基础, 将 base 模型转变为能跟随指令, 跨多样任务有效作答的助手. 该阶段对激活预训练习得的潜在能力, 并将输出对齐到期望格式与风格至关重要.

<!-- page 15 of 31 -->

To achieve this, we curated millions of training samples spanning diverse domains, including general conversation, reasoning, coding, and agent tasks. These samples cover both thinking and non-thinking modes, with responses generated by our in-house domain-specialized model checkpoints. This diverse training mixture ensures comprehensive capability activation across the model’s intended use cases.

为此, 我们整理了覆盖通用对话, 推理, 编码与智能体任务等多样域的数百万训练样本. 样本同时覆盖 thinking 与 non-thinking 模式, 回答由内部域专精模型 checkpoint 生成. 这一多样训练混合确保在模型预期用例上全面激活能力.

Through preliminary experiments, we identified a critical stability metric for MoE SFT training: the number of parameters with zero gradients (num-zeros). This metric provides early warning signals for training instability: an increasing num-zeros indicates deteriorating load balance among experts, while a decreasing num-zeros suggests the model is significantly overfitting to the training data. Maintaining stable num-zeros throughout training is therefore essential for successful SFT. Furthermore, this stability is paramount for ensuring the robustness and convergence of the subsequent RL phase.

通过预实验, 我们识别出 MoE SFT 训练的关键稳定指标: 梯度为零的参数个数 (num-zeros). 该指标为训练不稳提供早期预警: num-zeros 上升表明专家间负载均衡恶化, num-zeros 下降则提示模型对训练数据显著过拟合. 因此在整个训练中保持稳定的 num-zeros 对成功 SFT 至关重要. 此外, 这一稳定性对后续 RL 阶段的稳健与收敛同样关键.

Our experiments reveal that num-zeros stability critically depends on two hyperparameters: the expert bias update rate and the 𝜖 parameter in the AdamW optimizer. Based on these findings, we configure our training with the following hyperparameters. We employ a cosine decay learning rate scheduler from $5 . 0 \times 1 0 ^ { - 5 }$ to $5 . 0 \times 1 0 ^ { - 6 }$, with a batch size of 128 and AdamW 𝜖 set to $1 . 0 \times 1 0 ^ { - 8 }$. The MoE expert bias update rate is set to $1 . 0 \times 1 0 ^ { - 4 }$, and the sequence auxiliary loss coefficient to $1 . 0 \times 1 0 ^ { - 6 }$.

实验表明, num-zeros 稳定性关键取决于两个超参数: expert bias update rate 与 AdamW 优化器中的 𝜖. 基于这些发现, 训练超参数配置如下. 学习率余弦从 $5 . 0 \times 1 0 ^ { - 5 }$ 衰减到 $5 . 0 \times 1 0 ^ { - 6 }$, batch size 为 128, AdamW 𝜖 设为 $1 . 0 \times 1 0 ^ { - 8 }$. MoE expert bias update rate 设为 $1 . 0 \times 1 0 ^ { - 4 }$, sequence auxiliary loss 系数为 $1 . 0 \times 1 0 ^ { - 6 }$.

### 4.3 Scaling Reinforcement Learning (RL) ### 4.3 Scaling 强化学习 (RL)

Reinforcement learning pushes model capabilities beyond what supervised fine-tuning alone can achieve. We employ different RL strategies depending on whether tasks involve agentic behavior, scaling both non-agentic and agentic RL training to maximize performance across diverse domains.

强化学习把模型能力推到仅靠 SFT 无法达到的高度. 我们按任务是否涉及智能体行为采用不同 RL 策略, 同时 Scaling 非智能体与智能体 RL 训练, 以在多样域上最大化表现.

#### 4.3.1 Non-Agentic RL Training #### 4.3.1 非智能体 RL 训练

Non-agentic RL training focuses on improving the model’s performance on single-turn tasks, where the model generates a complete response without requiring interactive feedback or multi-step execution. The primary objective is to enhance the model’s reasoning accuracy in verifiable domains (e.g., mathematics, coding, logic) while simultaneously aligning its outputs for helpfulness and safety in open-ended conversations.

非智能体 RL 训练聚焦提升单轮任务表现: 模型生成完整回答, 无需交互反馈或多步执行. 首要目标是提高可验证域 (如数学, 编码, 逻辑) 的推理准确度, 同时在开放对话中对齐有用性与安全性.

Our approach to generating reward signals varies based on task characteristics. For domains with verifiable outcomes, we employ a hybrid verification system combining programmatic tools with an LLM judge to automatically assess correctness against curated problem-solution pairs. For subjective qualities such as helpfulness and safety, we implement a rubric-based framework where an advanced LLM judge evaluates responses against detailed rubrics and reference answers, producing granular reward signals that guide the model toward desired behaviors.

生成奖励信号的方法随任务特性而变. 对结果可验证的域, 我们用程序工具与 LLM judge 混合的校验系统, 相对整理好的问题-解答对自动评估正确性. 对有用性与安全等主观质量, 我们实现基于 rubric 的框架: 由更强的 LLM judge 对照细粒度 rubric 与参考答案评估回答, 产出引导模型走向期望行为的细粒度奖励信号.

#### 4.3.2 Agentic RL Training #### 4.3.2 智能体 RL 训练

While non-agentic RL focuses on single-turn reasoning and generation, agentic RL trains the model to operate in interactive, multi-turn environments requiring planning, action execution, and adaptation based on feedback. We scale agentic RL along two critical dimensions: environment diversity and compute resources.

非智能体 RL 聚焦单轮推理与生成, 而智能体 RL 训练模型在需要规划, 执行动作并依据反馈适应的交互式多轮环境中运作. 我们沿两个关键维度 Scaling 智能体 RL: 环境多样性与算力资源.

**Scaling Agentic Environment Diversity** We construct a diverse suite of agentic training environments spanning code debugging, terminal operations, web development, and general tool use

**Scaling 智能体环境多样性** 我们构建覆盖代码调试, 终端操作, Web 开发与通用工具使用的多样智能体训练环境套件

<!-- page 16 of 31 -->

| Agent Type | Number of Tasks | Environment | Prompt Source |
| --- | --- | --- | --- |
| Code Agent | 90K | Real | Real |
| Code Agent | 30K | Real | Synthesized |
| Search Agent | 150K | Real | Synthesized |
| General Agent | 50K | Synthesized | Synthesized |

Table 8 A summary of our training data composition across different agent types. We leverage both real-world and synthetically generated data to create a diverse set of tasks for training agents in various environments.

表 8 不同智能体类型的训练数据构成汇总. 我们同时利用真实与合成数据, 为多类环境中的智能体训练构建多样任务集.

(Table 8). Each environment targets distinct capabilities while sharing the common requirement of multi-step reasoning and execution. Below, we elaborate on the details for agentic environments.

(表 8). 各环境瞄准不同能力, 又共享多步推理与执行的共同要求. 下文详述各类智能体环境.

**Code Agent** We train on large-scale code agentic tasks derived from real-world GitHub issues, where the model operates in an agentic loop to read and edit files, execute commands, and receive rewards based on verifiable unit tests. Our key insight is that continuously scaling available tasks drives sustained improvements in code intelligence. To enable efficient RL training on over 100,000 code tasks, we develop two infrastructure components. First, we build an automated environment setup pipeline that provisions development environments from repository snapshots and packages them into containerized images, achieving 70% success rate across 8 programming languages and supported by a large-scale Kubernetes cluster running over 10,000 concurrent pods. Second, we implement a lightweight agent scaffold that integrates seamlessly with Kubernetes, Docker, or local backends, exposing three atomic tools (bash, str\_replace, finish) that interact with execution backends solely via shell commands. This design eliminates server-based tool implementations and employs a minimal system prompt without predefined workflows, allowing the model to discover best practices during training.

**Code Agent** 我们在源自真实 GitHub issue 的大规模代码智能体任务上训练: 模型在智能体循环中读写文件, 执行命令, 并基于可验证单元测试获得奖励. 关键洞察是: 持续 Scaling 可用任务会驱动代码智能持续提升. 为在超过 100,000 个代码任务上高效做 RL, 我们开发两套基础设施. 其一, 自动化环境搭建流水: 从仓库快照供给开发环境并打包为容器镜像, 跨 8 种编程语言成功率约 70%, 并由运行超过 10,000 并发 pod 的大规模 Kubernetes 集群支撑. 其二, 轻量智能体脚手架: 与 Kubernetes, Docker 或本地后端无缝集成, 暴露三个原子工具 (bash, str\_replace, finish), 仅通过 shell 命令与执行后端交互. 该设计消除基于服务的工具实现, 并采用无预定义工作流的最小系统提示, 让模型在训练中自行发现最佳实践.

**Terminal Agent** Beyond GitHub issues, we strengthen terminal-based problem-solving capabilities using tasks sourced from Stack Overflow and Stack Exchange. We select materials requiring advanced technical expertise and transform them into computational tasks with corresponding queries, Dockerfiles, and test cases. After verifying environment installation and filtering by difficulty and reliability, we obtain approximately 30,000 queries with validated execution environments. Additional filtering based on pass rates removes tasks with unreliable correctness judgments or insufficient complexity for effective RL training.

**Terminal Agent** 在 GitHub issue 之外, 我们用源自 Stack Overflow 与 Stack Exchange 的任务强化基于终端的解题能力. 选取需要高级技术专长的材料, 转化为带对应查询, Dockerfile 与测试用例的计算任务. 在验证环境安装并按难度与可靠性过滤后, 得到约 30,000 条带已验证执行环境的查询. 再按通过率过滤, 去掉正确性判断不可靠或复杂度不足以支撑有效 RL 的任务.

**Web Development Agent** To improve web development code generation, we build a real-worldgrounded synthetic dataset paired with a multimodal verifier. We collect high-quality user-written web pages, execute generated code using Playwright to obtain rendered videos, and apply a multimodal visual discriminator to retain only high-quality samples, where video-based evaluation reduces visual hallucination compared to static screenshots. We reverse-engineer user queries from curated pages as seed prompts to synthesize large-scale RL data covering eight web categories that closely match real-world usage. Our vision-based verifier scores rollout executions from recorded videos, jointly evaluating visual quality, functional correctness, and executability to ensure rewards reflect both appearance and behavior.

**Web Development Agent** 为改进 Web 开发代码生成, 我们构建接地真实世界的合成数据集, 并配多模态校验器. 收集高质量用户编写网页, 用 Playwright 执行生成代码以得到渲染视频, 再用多模态视觉判别器只保留高质量样本; 相对静态截图, 基于视频的评估减少视觉幻觉. 我们从精选页面反推用户查询作为种子提示, 合成覆盖八类贴近真实用法的大规模 RL 数据. 基于视觉的校验器根据录制视频为 rollout 打分, 联合评估视觉质量, 功能正确性与可执行性, 使奖励同时反映外观与行为.

**General Agent** We develop two general agentic capabilities. Our search agent adopts a scaffold providing three core tools (search, open, find) for autonomous web exploration. We construct queries through recursive fact-graph expansion from seed entities, where difficulty scales with

**General Agent** 我们发展两类通用智能体能力. 搜索智能体采用提供三个核心工具 (search, open, find) 的脚手架, 以自主探索网页. 查询通过从种子实体递归扩展事实图来构造, 难度随

<!-- page 17 of 31 -->

![Chart block](images/p17-chart.png)

![Chart block](images/p17-figure-4-code-agentic-rl-scaling-curves-the-x-axis.png)

Figure 4 Code-agentic RL scaling curves. The X-axis represents total interactive environments consumed during on-policy RL rollouts; the Y-axis shows resolved rates on SWE-Bench-Verified and SWE-Bench-Multilingual.

图 4 代码智能体 RL 的 Scaling 曲线. 横轴为 on-policy RL rollout 期间消耗的交互环境总数; 纵轴为 SWE-Bench-Verified 与 SWE-Bench-Multilingual 上的解决率.

![Chart block](images/p17-figure-5-generalization-of-code-agentic-rl-training-to.png)

Figure 5 Generalization of code-agentic RL training to other task domains.

图 5 代码智能体 RL 训练向其他任务域的泛化.

relation chain depth and detail obfuscation, enabling automated generation of challenging search problems with verifiable answers. Our function-calling agent trains on synthetic application environments with custom toolsets constructed by generating tool-call graphs based on explicit data dependencies (direct input-output relationships) and implicit logical dependencies (reasoning about hidden system states), requiring both data propagation and state inference capabilities.

关系链深度与细节混淆而 Scaling, 从而自动生成答案可验证的高难度搜索题. 我们的 function-calling 智能体在合成应用环境上训练, 自定义工具集通过生成工具调用图构造, 图同时基于显式数据依赖 (直接输入-输出关系) 与隐式逻辑依赖 (对隐藏系统状态的推理), 要求同时具备数据传播与状态推断能力.

**Scaling Agentic Compute** Training on the previous diverse set of agentic environments (Table 8), we find that scaling agentic RL compute not only boosts code-agentic performance but also generalizes effectively to other task types. Figure 4 shows the RL training curve for our codeagent, where the model performed on-policy rollouts and updates across approximately 120K environments. This scaling significantly improves upon the SFT base model’s performance on SWE-Bench-Verified and SWE-Bench-Multilingual. Moreover, Figure 5 demonstrates that large scale code-agentic RL training generalizes effectively to other agentic tasks, as well as math, code, and general reasoning benchmarks, suggesting that agentic training develops broadly transferable problem-solving capabilities.

**Scaling 智能体算力** 在前述多样智能体环境 (表 8) 上训练时, 我们发现 Scaling 智能体 RL 算力不仅提升代码智能体表现, 还能有效泛化到其他任务类型. 图 4 给出代码智能体的 RL 训练曲线: 模型在约 120K 个环境上做 on-policy rollout 与更新. 这一 Scaling 相对 SFT base 在 SWE-Bench-Verified 与 SWE-Bench-Multilingual 上显著提升. 此外, 图 5 表明大规模代码智能体 RL 训练有效泛化到其他智能体任务, 以及数学, 代码与通识推理基准, 提示智能体训练发展出可广泛迁移的解题能力.

> **看表:** Table 8 Code Agent 90K+30K=120K, 与 Figure 4 「approximately 120K environments」 是否同一计数?
> Figure 4 写 on-policy rollouts across approximately 120K environments, Table 8 Code 两行合计 120K tasks. 报告把二者并读为代码智能体 Scaling 曲线的数据规模; 未再拆 90K/30K 谁贡献了横轴上的每一环境.

<!-- page 18 of 31 -->

### 4.4 Technical Formulation of MOPD ### 4.4 MOPD 的技术形式化

Having established the foundation through SFT and trained specialized teachers through domainspecific RL, we now formalize the multi-teacher on-policy distillation mechanism that integrates these specialized capabilities into a unified student model.

在经由 SFT 奠定基础, 并通过域特定 RL 训练专精教师之后, 我们形式化将专精能力整合进统一学生模型的 multi-teacher on-policy distillation 机制.

Specifically, we cast multi-teacher distillation as an on-policy reinforcement learning objective. Let $\pi _ { \theta }$ denote the target student policy optimized in the training engine, $\mu _ { \theta }$ denote the student sampling policy adopted in the inference engine, and $\pi _ { \mathrm { d o m a i n } }$ denote the teacher policy specialized for the domain of prompt 𝑥 sampled from distribution D. Let sg[·] denote the stop-gradient operator. The reverse KL divergence loss between student and teacher is defined as:

具体地, 我们将多教师蒸馏表述为 on-policy 强化学习目标. 令 $\pi _ { \theta }$ 表示在训练引擎中优化的目标学生策略, $\mu _ { \theta }$ 表示推理引擎中采用的学生采样策略, $\pi _ { \mathrm { d o m a i n } }$ 表示针对从分布 D 采样的提示 𝑥 所属域的专精教师策略. 令 sg[·] 表示 stop-gradient 算子. 学生与教师之间的 reverse KL 散度损失定义为:

$$
\mathcal {L} _ {\text {reverse - KL}} (\theta) = - \mathbb {E} _ {x \sim \mathcal {D}, y _ {t} \sim \pi_ {\theta} (\cdot | x, y _ {<   t})} \log \frac {\pi_ {\text {domain} _ {x}} (y _ {t} | x , y _ {<   t})}{\pi_ {\theta} (y _ {t} | x , y _ {<   t})}.\tag{5}
$$

The gradient is:

梯度为:

$$
\nabla_ {\theta} \mathcal {L} _ {\text {reverse - KL}} (\theta) = - \mathbb {E} _ {x \sim \mathcal {D}, y _ {t} \sim \pi_ {\theta} (\cdot | x, y _ {<   t})} \left[ \log \frac {\pi_ {\text {domain} _ {x}} (y _ {t} | x , y _ {<   t})}{\pi_ {\theta} (y _ {t} | x , y _ {<   t})} \nabla_ {\theta} \log \pi_ {\theta} (y _ {t} | x, y _ {<   t}) \right].\tag{6}
$$

Following Zhao et al. (2025), we apply training-inference importance sampling and discard tokens that exhibit large discrepancies. We then define the surrogate loss of MOPD as:

遵循 Zhao et al. (2025), 我们施加训练-推理重要性采样, 并丢弃差异过大的 token. 随后将 MOPD 的 surrogate 损失定义为:

$$
\mathcal {L} _ {\mathrm{MOPD}} (\theta) = - \mathbb {E} _ {x \sim \mathcal {D}, y \sim \mu_ {\theta} (\cdot | x)} \left[ \frac {1}{| y |} \sum_ {t = 1} ^ {| y |} w _ {t} \hat {A} _ {\mathrm{MOPD}, t} \log \pi_ {\theta} (y _ {t} | x, y _ {<   t}) \right],\tag{7}
$$

where

其中

$$
w _ {t} (\theta) = \left\{ \begin{array}{l l} \operatorname{sg} \left[ \frac {\pi_ {\theta} (y _ {t} | x , y _ {<   t})}{\mu_ {\theta} (y _ {t} | x , y _ {<   t})} \right], & \epsilon_ {\text {low}} \leq \frac {\pi_ {\theta} (y _ {t} | x , y _ {<   t})}{\mu_ {\theta} (y _ {t} | x , y _ {<   t})} \leq \epsilon_ {\text {high}}, \\ 0, & \text {other}, \end{array} \right. \quad \hat {A} _ {\text {MOPD}, t} = \operatorname{sg} \left[ \log \frac {\pi_ {\text {domain} _ {x}} (y _ {t} | x , y _ {<   t})}{\pi_ {\theta} (y _ {t} | x , y _ {<   t})} \right].\tag{8}
$$

By default, we combine the advantages of MOPD with other types of advantages, such as those computed using Outcome Reward Models (ORMs), including GRPO (Shao et al., 2024). Let 𝐴ˆORM denote the advantages computed by the ORMs; the final advantages are given by:

默认地, 我们将 MOPD 优势与其他类型优势结合, 例如由 Outcome Reward Models (ORMs) 计算的优势, 含 GRPO (Shao et al., 2024). 令 $\hat A_{\mathrm{ORM}}$ 表示 ORM 计算的优势; 最终优势由下式给出:

$$
\hat {A} _ {\mathrm{MOPD}, t} = \mathrm{sg} \left[ \log \frac {\pi_ {\mathrm{domain} _ {x}} (y _ {t} | x , y _ {<   t})}{\pi_ {\theta} (y _ {t} | x , y _ {<   t})} \right] + \alpha \hat {A} _ {\mathrm{ORM}}.\tag{9}
$$

> **问:** 式 (8) 的 𝑤_𝑡 在比率越界时置 0. 这与式 (9) 把 ORM 优势加进 Â_MOPD,t 是先过滤再相加, 还是 ORM 项不受 𝑤_𝑡 约束?
> 式 (7) 的 surrogate 是 𝑤_𝑡 Â_MOPD,t 乘 log π. 式 (9) 重定义 Â_MOPD,t = sg[log ratio]+α Â_ORM. 文中未写 ORM 项单独绕过 𝑤_𝑡; 按公式结构, 进入求和的是同一 𝑤_𝑡 权重后的优势.

Figure 6 demonstrates the effectiveness of MOPD compared to traditional post-training approaches. On mathematical reasoning (AIME 2025) and coding (LiveCodeBench) benchmarks, MOPD successfully preserves and combines specialized capabilities from multiple teachers, achieving performance that matches or exceeds the strongest teacher in most domains.

图 6 展示相对传统后训练方法, MOPD 的有效性. 在数学推理 (AIME 2025) 与代码 (LiveCodeBench) 基准上, MOPD 成功保留并融合多教师的专精能力, 在多数域达到匹配或超过最强教师的表现.

### 4.5 Evaluations ### 4.5 评测

#### 4.5.1 Evaluation Setup #### 4.5.1 评测设置

We evaluate MiMo-V2-Flash on MMLU-Pro (Wang et al., 2024), GPQA-Diamond (Rein et al., 2024), HLE Text-only (Phan et al., 2025), AIME 2025 (MAA, 2024), LiveCodeBench (2024.08-2025.04) (Jain et al., 2024), HMMT Feb. 2025 (Balunović et al., 2025), Arena-Hard (Li et al., 2024), LongBench V2 (Bai et al., 2025), MRCR (Vodrahalli et al., 2024) ({2,4,8}-needles, maximum 128K), SWE-Bench Verified (Jimenez et al., 2024b), SWE-Bench Multilingual (Yang et al., 2025), Terminal-Bench, BrowseComp (Wei et al., 2025), 𝜏<sup>2</sup>-Bench (Barres et al., 2025).

我们在以下基准上评测 MiMo-V2-Flash: MMLU-Pro (Wang et al., 2024), GPQA-Diamond (Rein et al., 2024), HLE Text-only (Phan et al., 2025), AIME 2025 (MAA, 2024), LiveCodeBench (2024.08-2025.04) (Jain et al., 2024), HMMT Feb. 2025 (Balunović et al., 2025), Arena-Hard (Li et al., 2024), LongBench V2 (Bai et al., 2025), MRCR (Vodrahalli et al., 2024) ({2,4,8}-needles, 最大 128K), SWE-Bench Verified (Jimenez et al., 2024b), SWE-Bench Multilingual (Yang et al., 2025), Terminal-Bench, BrowseComp (Wei et al., 2025), 𝜏<sup>2</sup>-Bench (Barres et al., 2025).

<!-- page 19 of 31 -->

![Chart block](images/p19-figure-6-comparison-of-different-post-training-methods.png)

Figure 6 Comparison of different post-training methods on math and code tasks. Three lines represent training RL with ORM, MOPD without outcome rewards (MOPD w/o ORM), and MOPD.

图 6 不同后训练方法在数学与代码任务上的对比. 三条线分别表示带 ORM 的 RL 训练, 无结果奖励的 MOPD (MOPD w/o ORM), 以及完整 MOPD.

> **核对:** Figure 6 三条线含 「MOPD w/o ORM」. 若去掉结果奖励, token 级教师 KL 是否仍足够抬 AIME/LiveCodeBench?
> Figure 6 的设定就是把 ORM-RL, MOPD w/o ORM, 完整 MOPD 画在一起, 正文称 MOPD 能匹配或超过最强教师. 具体曲线高低以图为准; 机制上 w/o ORM 仍保留式 (8) 的教师 log-ratio 优势.

#### 4.5.2 Evaluation Results #### 4.5.2 评测结果

We illustrate the evalution results in Table 9. MiMo-V2-Flash achieves performance comparable to that of Kimi-K2-Thinking and DeepSeek-V3.2-Thinking on most reasoning benchmarks. The model also maintains competitive general writing capabilities, enabling it to generate high-quality responses on open-ended tasks. In long context evaluations, our model surpasses Kimi-K2-Thinking, a significantly larger full global attention LLM, highlighting the strong long-context capabilities of our hybrid SWA architecture.

表 9 展示评测结果. MiMo-V2-Flash 在多数推理基准上达到与 Kimi-K2-Thinking 与 DeepSeek-V3.2-Thinking 相当的表现. 模型亦保持有竞争力的通用写作能力, 能在开放任务上生成高质量回答. 在长上下文评测中, 本模型超过显著更大的全全局注意力 LLM Kimi-K2-Thinking, 凸显 hybrid SWA 架构的强长上下文能力.

Notably, MiMo-V2-Flash achieves 73.4% on SWE-Bench Verified, outperforming all open-source competitors and approaching the performance of GPT-5-High. On SWE-Bench Multilingual, our model resolves 71.7% issues, establishing it as the most capable open-source LLM for software engineering tasks. These results underscore the effectiveness of our ultra-scaled agentic RL training. On Terminal Bench, the model also delivers a competitive score.

显著地, MiMo-V2-Flash 在 SWE-Bench Verified 上达到 73.4%, 超过所有开源对手并逼近 GPT-5-High. 在 SWE-Bench Multilingual 上解决 71.7% 的 issue, 确立其为软件工程任务上最强的开源 LLM. 这些结果凸显超大规模智能体 RL 训练的有效性. 在 Terminal Bench 上模型亦给出有竞争力的分数.

In search agent evaluation, MiMo-V2-Flash scores 45.4 on BrowseComp, and is further boosted to 58.3 with the context management method outlined in Appendix C. For general tool-use on 𝜏<sup>2</sup>-Bench, we employ DeepSeek-V3.2 as the user agent, achieving category scores of 95.3 (Telecom), 79.5 (Retail), 66.0 (Airline).

在搜索智能体评测中, MiMo-V2-Flash 在 BrowseComp 上得 45.4, 采用附录 C 所述上下文管理方法后进一步提升到 58.3. 在 𝜏<sup>2</sup>-Bench 的通用工具使用上, 我们以 DeepSeek-V3.2 作用户智能体, 分项得分为 95.3 (Telecom), 79.5 (Retail), 66.0 (Airline).

Taken together, these results validate the effectiveness of our ultra-large-scale RL training within the MOPD post-training paradigm, and highlight the models strong potential for real-world coding, reasoning, and agentic workflows.

综合来看, 这些结果验证了在 MOPD 后训练范式内超大规模 RL 训练的有效性, 并凸显模型在真实世界编码, 推理与智能体工作流上的强潜力.

### 4.6 RL Infrastructures ### 4.6 RL 基础设施

Our RL (and MOPD) infrastructure uses SGLang (Zheng et al., 2024) as the inference engine and Megatron-LM (Shoeybi et al., 2019) as the training engine. We adopt FP8 for both training and inference. To enable stable, efficient, and flexible RL training, we implement three extended modules: Rollout Routing Replay (Ma et al., 2025) (Sec 4.6.1), Data Scheduler (Sec 4.6.2), and Tool Manager combined with Toolbox (Sec 4.6.3).

我们的 RL (与 MOPD) 基础设施以 SGLang (Zheng et al., 2024) 为推理引擎, Megatron-LM (Shoeybi et al., 2019) 为训练引擎. 训练与推理均采用 FP8. 为支撑稳定, 高效且灵活的 RL 训练, 我们实现三个扩展模块: Rollout Routing Replay (Ma et al., 2025) (第 4.6.1 节), Data Scheduler (第 4.6.2 节), 以及 Tool Manager 与 Toolbox 的组合 (第 4.6.3 节).

#### 4.6.1 Stablized Training via Rollout Routing Replay (R3) #### 4.6.1 用 R3 稳定训练

MoE models suffer from inconsistent expert routing across rollout and training due to numerical precision issues (He and Lab, 2025; Yao et al., 2025). We propose Rollout Routing Replay (R3) (Ma et al., 2025) to train RL using the same routed experts from rollout, making its overhead negligible through optimized data types and communication overlapping. For multi-turn agent training,

MoE 模型因数值精度问题, 在 rollout 与训练之间会出现不一致的专家路由 (He and Lab, 2025; Yao et al., 2025). 我们提出 Rollout Routing Replay (R3) (Ma et al., 2025), 使 RL 训练使用与 rollout 相同的路由专家, 并通过优化数据类型与通信重叠使开销可忽略. 对多轮智能体训练,

<!-- page 20 of 31 -->

| Benchmark | MiMo-V2Flash | Kimi-K2Thinking | DeepSeek-V3.2Thinking | Gemini-3.0Pro | Claude Sonnet 4.5 | GPT-5High |
| --- | --- | --- | --- | --- | --- | --- |
| Reasoning |  |  |  |  |  |  |
| MMLU-Pro | 84.9 | 84.6 | 85.0 | 90.1 | 88.2 | 87.5 |
| GPQA-Diamond | 84.3 | 84.5 | 82.4 | 91.9 | 83.4 | 85.7 |
| HLE (notools) | 22.1 | 23.9 | 25.1 | 37.5 | 13.7 | 26.3 |
| AIME 2025 | 94.1 | 94.5 | 93.1 | 95.0 | 87.0 | 94.6 |
| HMMT Feb. 2025 | 84.4 | 89.4 | 92.5 | 97.5 | 79.2 | 88.3 |
| LiveCodeBench-v6 | 85.1 | 83.1 | 83.3 | 90.7 | 64.0 | 84.5 |
| General Writing |  |  |  |  |  |  |
| Arena-Hard (HardPrompt) | 54.1 | 71.9 | 53.4 | 72.6 | 63.3 | 71.9 |
| Arena-Hard (CreativeWriting) | 86.2 | 80.1 | 88.8 | 93.6 | 76.7 | 92.2 |
| Long Context |  |  |  |  |  |  |
| LongBench V2 | 60.6 | 48.1 | 58.4 | 65.6 | 61.8 | - |
| MRCR | 45.7 | 44.2 | 55.5 | 89.7 | 55.4 | - |
| Code Agent |  |  |  |  |  |  |
| SWE-Bench Verified | 73.4 | 71.3 | 73.1 | 76.2 | 77.2 | 74.9 |
| SWE-Bench Multilingual | 71.7 | 61.1 | 70.2 | - | 68.0 | 55.3 |
| Terminal-Bench Hard | 30.5 | 30.6 | 35.4 | 39.0 | 33.3 | 30.5 |
| Terminal Bench 2.0 | 38.5 | 35.7 | 46.4 | 54.2 | 42.8 | 35.2 |
| General Agent |  |  |  |  |  |  |
| BrowseComp | 45.4 | - | 51.4 | - | 24.1 | 54.9 |
| BrowseComp (w/ContextManage) | 58.3 | 60.2 | 67.6 | 59.2 | - | - |
| 𝜏<sup>2</sup>-Bench | 80.3 | 74.3 | 80.3 | 85.4 | 84.7 | 80.2 |

Table 9 Comparison between MiMo-V2-Flash and open/closed models.

表 9 MiMo-V2-Flash 与开源/闭源模型对比.

we employ a request-level prefix cache during rollout. This cache stores KVCache and MoE routed experts from prior turns, allowing them to be reused for subsequent generation steps of the same request. Unlike the commonly-used radix cache in current inference engines, our request-level prefix cache avoids re-prefilling or inter-request output cache sharing, ensuring sampling consistency for routed experts.

我们在 rollout 中采用 request-level prefix cache. 该缓存存储先前轮次的 KVCache 与 MoE 已路由专家, 以便同一请求后续生成步骤复用. 与当前推理引擎常用的 radix cache 不同, 我们的 request-level prefix cache 避免重新 prefilling 或跨请求共享输出缓存, 从而保证路由专家的采样一致性.

> **拆开:** §4.6.1 R3 与 request-level prefix cache. 它解决的是 「专家路由不一致」, 还是 「KV 复用加速」?
> 主问题是 rollout 与 training 路由因数值精度不一致 (引 Ma et al., 2025). prefix cache 存 KVCache 与 MoE routed experts, 目的是多轮同请求内复用并保证采样一致性; 文中对比 radix cache, 强调避免跨请求共享导致路由不一致.

#### 4.6.2 Data Scheduler #### 4.6.2 数据调度

For MiMo-V2-Flash, we extend the Seamless Rollout Engine (Xia et al., 2025) and implement a Data Scheduler to seamlessly schedule fine-grained sequences instead of micro-batches, addressing GPU idleness in distributed MoE training. In dynamic sampling, as sequences return for reward computation, we reference historical pass rates and, if necessary, assign new prompts to GPUs with load balancing. We integrate partial rollout (Fu et al., 2025; Kimi Team, 2025b) to partition overlong trajectories across steps, while limiting staleness and the proportion of partial samples in each batch. By employing staleness-aware truncated importance sampling for partial rollout, we significantly accelerate RL training without sacrificing model quality.

对 MiMo-V2-Flash, 我们扩展 Seamless Rollout Engine (Xia et al., 2025) 并实现 Data Scheduler, 以细粒度序列而非 micro-batch 无缝调度, 缓解分布式 MoE 训练中的 GPU 空转. 在动态采样中, 当序列返回以计算奖励时, 我们参考历史通过率, 必要时在负载均衡下向 GPU 分配新提示. 我们集成 partial rollout (Fu et al., 2025; Kimi Team, 2025b), 将过长轨迹跨步切分, 同时限制陈旧度与每批 partial 样本比例. 通过对 partial rollout 使用 staleness-aware truncated importance sampling, 我们显著加速 RL 训练且不牺牲模型质量.

The Data Scheduler supports data source-specific configurations (sample quota, scheduling priority, length limits, temperature) and fits pass rates to accept samples by configured ratios. Prioritybased scheduling overlaps reward computation and inference across data sources with different time patterns, ensuring high GPU utilization.

Data Scheduler 支持按数据源配置 (sample quota, 调度优先级, 长度上限, temperature), 并拟合通过率按配置比例接受样本. 基于优先级的调度使奖励计算与推理在具有不同耗时模式的数据源之间重叠, 保证高 GPU 利用率.

<!-- page 21 of 31 -->

![Chart block](images/p21-figure-7-the-correlation-between-next-token-cross.png)

Figure 7 The correlation between next token cross-entropy and Average Accept Length across different datasets. The orange dashed line represents the best-fit curve $( R ^ { 2 } = 0 . 9 9 5 )$.

图 7 不同数据集上次 token 交叉熵与 Average Accept Length 的相关性. 橙色虚线为最佳拟合曲线 $( R ^ { 2 } = 0 . 9 9 5 )$.

#### 4.6.3 Toolbox and Tool Manager #### 4.6.3 Toolbox 与 Tool Manager

We implement Toolbox and Tool Manager to tackle global resource contention and local inefficiency in RL agent training. These modules leverage Ray (Moritz et al., 2018) for efficient scheduling. Toolbox acts as the centralized resource allocator, enforcing resource quota and QPS limits for tools across concurrent tasks. It adopts fault-tolerant Ray actor pools, which eliminate cold-start delays. Integrated with the rollout engine, Tool Manager coordinates with Toolbox to accelerate training through environment pre-warming and sequence-level asynchronous reward computation. It maintains training stability through timeout recovery and real-time monitoring. By disaggregating the tool management and rollout workflow, Toolbox isolates task-specific logic from system-wide policies, enabling modular extensibility without compromising stability.

我们实现 Toolbox 与 Tool Manager, 以应对 RL 智能体训练中的全局资源争用与局部低效. 这些模块借助 Ray (Moritz et al., 2018) 做高效调度. Toolbox 作为中心化资源分配器, 对并发任务的工具执行资源配额与 QPS 限制. 它采用容错 Ray actor 池, 消除冷启动延迟. Tool Manager 与 rollout 引擎集成, 并与 Toolbox 协同, 通过环境预热与序列级异步奖励计算加速训练. 它通过超时恢复与实时监控维持训练稳定. 通过解耦工具管理与 rollout 工作流, Toolbox 将任务特定逻辑与系统级策略隔离, 在不牺牲稳定性的前提下实现模块化扩展.

## 5 MTP Speedup ## 5 MTP 加速

### 5.1 MTP Acceptance Length ### 5.1 MTP 接受长度

We analyze the relationship between the model’s predictive uncertainty measured by next token cross-entropy and the efficiency of the Multi-Token Prediction (MTP) module. As illustrated in Figure 7, we evaluate the average acceptance length with 3 MTP layers across diverse benchmarks, ranging from code generation (e.g., WebDev, LiveCodeBench) to complex reasoning tasks (e.g., AIME25, MMLU Pro).

我们分析由 next token 交叉熵度量的模型预测不确定性与 MTP 模块效率之间的关系. 如图 7 所示, 我们在多样基准上评测 3 层 MTP 的平均接受长度, 范围从代码生成 (如 WebDev, LiveCodeBench) 到复杂推理任务 (如 AIME25, MMLU Pro).

The results reveal a strong inverse correlation: lower entropy contexts (such as WebDev) allow for significantly longer acceptance sequences, reaching approximately 3.6 tokens. Conversely, tasks with higher intrinsic uncertainty (e.g., MMLU Pro) exhibit shorter acceptance lengths due to increased prediction divergence. This behavior is accurately modeled by a log-transformed fit $( y = 4 ( 1 - 0 . 5 8 x ^ { 0 . 5 8 } ) )$ with an $R ^ { 2 }$ of 0.995, suggesting that next token cross-entropy is a primary determinant of MTP throughput.

结果揭示强负相关: 低熵上下文 (如 WebDev) 允许显著更长的接受序列, 可达约 3.6 tokens. 相反, 内在不确定性更高的任务 (如 MMLU Pro) 因预测分歧增大而接受长度更短. 该行为可由对数变换拟合 $( y = 4 ( 1 - 0 . 5 8 x ^ { 0 . 5 8 } ) )$ 准确刻画, $R ^ { 2 }$ 为 0.995, 提示 next token 交叉熵是 MTP 吞吐的主要决定量.

> **回看:** Figure 7 拟合 𝑦=4(1−0.58𝑥^0.58), 𝑅^2=0.995. 𝑥 是 next token cross-entropy, 𝑦 是 Average Accept Length — 高熵任务接受长度是否必然更短?
> 是正文主张的强负相关: WebDev 类低熵接受更长 (约 3.6), MMLU Pro 类高不确定接受更短. 拟合 𝑅^2=0.995 支持 「交叉熵是 MTP 吞吐主决定量」 的经验句.

### 5.2 MTP Inference Speedup ### 5.2 MTP 推理加速

We measure the decoding speedup of MiMo-V2-Flash with 3-layer MTP across varying batch sizes (per node) and accept lengths, using 16K input and 1K output lengths. The results in Table 10

我们测量 MiMo-V2-Flash 在 3 层 MTP 下, 跨不同 batch size (每节点) 与接受长度的解码加速, 输入 16K, 输出 1K. 表 10 的结果

<!-- page 22 of 31 -->

| Batch Size | w/o MTP | 2.8 | A3.0 | cceptan3.2 | ce Lengt3.4 | h3.6 | 3.8 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 32 | 1.00× | 1.86× | 1.99× | 2.12× | 2.25× | 2.39× | 2.52× |
| 48 | 1.00× | 1.82× | 1.95× | 2.08× | 2.21× | 2.34× | 2.47× |
| 64 | 1.00× | 1.97× | 2.11× | 2.25× | 2.39× | 2.53× | 2.67× |
| 96 | 1.00× | 1.99× | 2.13× | 2.28× | 2.42× | 2.56× | 2.70× |
| 128 | 1.00× | 1.82× | 1.94× | 2.07× | 2.20× | 2.33× | 2.46× |

Table 10 Decoding speedup of MiMo-V2-Flash with 3-layer MTP v.s. without MTP across batch sizes (per node) and acceptance lengths, under 16K input and 1K output lengths.

表 10 MiMo-V2-Flash 在 3 层 MTP 相对无 MTP, 跨 batch size (每节点) 与接受长度的解码加速 (16K 输入, 1K 输出).

> **确认:** Table 10 batch 64 在 accept length 3.6 时是 2.53×, batch 96 是 2.56×, 摘要写 2.6×. 2.6× 对应哪一格?
> 摘要 「up to ... 2.6× decoding speedup with three MTP layers」 是上界口径. Table 10 最高可见 2.70× (batch 96, accept 3.8) 与 2.67× (batch 64, accept 3.8). 2.6× 与表内 2.53–2.56× (accept 3.6) 同量级; 精确格以 Table 10 为准, 摘要为约数上界.

demonstrate that MTP consistently outperforms the baseline without additional hardware costs. Notably, the speedup scales linearly with accept length. Under different batch sizes, MTP exhibits varying speedup, which depends on the corresponding computation and I/O demands as well as kernel efficiency. In practice, researchers and engineers should tune both batch size and MTP layers based on hardware roofline models to optimize the speed-cost trade-off.

表明 MTP 在无额外硬件成本下 consistently 优于基线. 显著地, 加速比随接受长度近似线性 Scaling. 在不同 batch size 下, MTP 呈现不同加速, 取决于相应计算与 I/O 需求以及 kernel 效率. 实践中, 研究者与工程师应根据硬件 roofline 模型同时调节 batch size 与 MTP 层数, 以优化速度-成本权衡.

## 6 Conclusion, Limitation, and Future Work

MiMo-V2-Flash achieves strong reasoning and agentic capabilities, along with fast inference speed, through its hybrid Sliding Window Attention architecture, lightweight Multi-Token Prediction, and the MOPD post-training paradigm. With these strengths, MiMo-V2-Flash rivals larger open-weight models like DeepSeek-V3.2 and Kimi-K2. However, a clear gap remains to the strongest closed-weight models, which we aim to narrow by scaling model size and training compute. Additionally, our current architectural exploration remains preliminary, with limited analysis of design trade-offs. Future work will focus on designing more robust and efficient, agentic-oriented model architectures. Furthermore, we plan to scale the compute for the iterative co-evolution of teachers and students in MOPD to fully unlock its potential.

MiMo-V2-Flash 靠混合 Sliding Window Attention 架构, 轻量 Multi-Token Prediction 与 MOPD 后训练范式, 拿到强推理与 Agent 能力, 推理速度也快. 凭这些优势, 它能与 DeepSeek-V3.2, Kimi-K2 等更大的开放模型竞争. 但与最强的闭源模型仍有明显差距, 后续靠扩大模型规模与训练算力来追. 另外, 目前的架构探索仍属初步, 设计取舍分析不足; 未来将面向 Agent 场景设计更鲁棒高效的架构, 并扩大 MOPD 中教师与学生迭代共演的算力, 充分释放其潜力.

## References

R. Agarwal, N. Vieillard, Y. Zhou, P. Stańczyk, S. Ramos, M. Geist, and O. Bachem. On-policy distillation of language models: Learning from self-generated mistakes. In International Conference on Learning Representations, 2023. URL [https://api.semanticscholar.org/CorpusID:263610088](https://api.semanticscholar.org/CorpusID:263610088).

S. Agarwal, L. Ahmad, J. Ai, S. Altman, A. Applebaum, E. Arbus, R. K. Arora, Y. Bai, B. Baker, H. Bao, et al. gpt-oss-120b & gpt-oss-20b model card. arXiv preprint arXiv:2508.10925, 2025.

J. Ainslie, J. Lee-Thorp, M. De Jong, Y. Zemlyanskiy, F. Lebrón, and S. Sanghai. Gqa: Training generalized multi-query transformer models from multi-head checkpoints. arXiv preprint arXiv:2305.13245, 2023.

J. Austin, A. Odena, M. Nye, M. Bosma, H. Michalewski, D. Dohan, E. Jiang, C. Cai, M. Terry, Q. Le, et al. Program synthesis with large language models. ArXiv preprint, abs/2108.07732, 2021. URL [https://arxiv.org/abs/2108.07732](https://arxiv.org/abs/2108.07732).

Y. Bai, S. Tu, J. Zhang, H. Peng, X. Wang, X. Lv, S. Cao, J. Xu, L. Hou, Y. Dong, et al. Longbench v2: Towards deeper understanding and reasoning on realistic long-context multitasks.

<!-- page 23 of 31 -->

In Proceedings of the 63rd Annual Meeting of the Association for Computational Linguistics (Volume 1: Long Papers), pages 3639–3664, 2025.

M. Balunović, J. Dekoninck, I. Petrov, N. Jovanović, and M. Vechev. Matharena: Evaluating llms on uncontaminated math competitions. arXiv preprint arXiv:2505.23281, 2025.

V. Barres, H. Dong, S. Ray, X. Si, and K. Narasimhan. 𝜏<sup>2</sup>-bench: Evaluating conversational agents in a dual-control environment. arXiv preprint arXiv:2506.07982, 2025.

I. Beltagy, M. E. Peters, and A. Cohan. Longformer: The long-document transformer. arXiv preprint arXiv:2004.05150, 2020.

T. Brown, B. Mann, N. Ryder, M. Subbiah, J. D. Kaplan, P. Dhariwal, A. Neelakantan, P. Shyam, G. Sastry, A. Askell, et al. Language models are few-shot learners. Advances in neural information processing systems, 33:1877–1901, 2020.

F. Cassano, J. Gouwar, D. Nguyen, S. Nguyen, L. Phipps-Costin, D. Pinckney, M.-H. Yee, Y. Zi, C. J. Anderson, M. Q. Feldman, et al. Multipl-e: A scalable and extensible approach to benchmarking neural code generation. arXiv preprint arXiv:2208.08227, 2022.

P. Clark, I. Cowhey, O. Etzioni, T. Khot, A. Sabharwal, C. Schoenick, and O. Tafjord. Think you have solved question answering? try arc, the ai2 reasoning challenge. ArXiv preprint, abs/1803.05457, 2018. URL [https://arxiv.org/abs/1803.05457](https://arxiv.org/abs/1803.05457).

K. Cobbe, V. Kosaraju, M. Bavarian, M. Chen, H. Jun, L. Kaiser, M. Plappert, J. Tworek, J. Hilton, R. Nakano, et al. Training verifiers to solve math word problems. ArXiv preprint, abs/2110.14168, 2021. URL [https://arxiv.org/abs/2110.14168](https://arxiv.org/abs/2110.14168).

X. Du, Y. Yao, K. Ma, B. Wang, T. Zheng, K. Zhu, M. Liu, Y. Liang, X. Jin, Z. Wei, et al. Supergpqa: Scaling llm evaluation across 285 graduate disciplines. ArXiv preprint, abs/2502.14739, 2025. URL [https://arxiv.org/abs/2502.14739](https://arxiv.org/abs/2502.14739).

D. Dua, Y. Wang, P. Dasigi, G. Stanovsky, S. Singh, and M. Gardner. DROP: A reading comprehension benchmark requiring discrete reasoning over paragraphs. In J. Burstein, C. Doran, and T. Solorio, editors, Proceedings of the 2019 Conference of the North American Chapter of the Association for Computational Linguistics: Human Language Technologies, Volume 1 (Long and Short Papers), pages 2368–2378, Minneapolis, Minnesota, 2019. Association for Computational Linguistics. doi: 10.18653/v1/N19-1246. URL [https://aclanthology.org/N19-1246](https://aclanthology.org/N19-1246).

W. Fu, J. Gao, X. Shen, C. Zhu, Z. Mei, C. He, S. Xu, G. Wei, J. Mei, J. Wang, et al. Areal: A large-scale asynchronous reinforcement learning system for language reasoning. arXiv preprint arXiv:2505.24298, 2025.

W. Gao, Y. Zhao, D. An, T. Wu, L. Cao, S. Xiong, J. Huang, W. Wang, S. Yang, W. Su, et al. Rollpacker: Mitigating long-tail rollouts for fast, synchronous rl post-training. arXiv preprint arXiv:2509.21009, 2025.

A. P. Gema, J. O. J. Leang, G. Hong, A. Devoto, A. C. M. Mancino, R. Saxena, X. He, Y. Zhao, X. Du, M. R. G. Madani, et al. Are we done with mmlu? ArXiv preprint, abs/2406.04127, 2024. URL [https://arxiv.org/abs/2406.04127](https://arxiv.org/abs/2406.04127).

Gemma Team. Gemma 2: Improving open language models at a practical size. arXiv preprint arXiv:2408.00118, 2024.

Gemma Team. Gemma 3 technical report. arXiv preprint arXiv:2503.19786, 2025.

<!-- page 24 of 31 -->

F. Gloeckle, B. Y. Idrissi, B. Rozière, D. Lopez-Paz, and G. Synnaeve. Better & faster large language models via multi-token prediction. arXiv preprint arXiv:2404.19737, 2024.

Google DeepMind. Gemini 3 pro model card. [https://storage.googleapis.com/deepmind-media/Model-Cards/Gemini-3-Pro-Model-Card.pdf](https://storage.googleapis.com/deepmind-media/Model-Cards/Gemini-3-Pro-Model-Card.pdf), Nov. 2025.

A. Gu, B. Rozière, H. J. Leather, A. Solar-Lezama, G. Synnaeve, and S. Wang. Cruxeval: A benchmark for code reasoning, understanding and execution. In Forty-first International Conference on Machine Learning, ICML 2024, Vienna, Austria, July 21-27, 2024. OpenReview.net, 2024a. URL [https://openreview.net/forum?id=Ffpg52swvg](https://openreview.net/forum?id=Ffpg52swvg).

X. Gu, T. Pang, C. Du, Q. Liu, F. Zhang, C. Du, Y. Wang, and M. Lin. When attention sink emerges in language models: An empirical view. arXiv preprint arXiv:2410.10781, 2024b.

Y. Gu, L. Dong, F. Wei, and M. Huang. Minillm: Knowledge distillation of large language models. In Proceedings of ICLR, 2024c.

H. He and T. M. Lab. Defeating nondeterminism in llm inference. Thinking Machines Lab: Connectionism, 2025. doi: 1 0 . 6 4 4 3 4 / t m l . 2 0 2 5 0 9 1 0. https://thinkingmachines.ai/blog/defeating-nondeterminism-in-llm-inference/.

Y. He, S. Li, J. Liu, Y. Tan, W. Wang, H. Huang, X. Bu, H. Guo, C. Hu, B. Zheng, et al. Chinese simpleqa: A chinese factuality evaluation for large language models. In Proceedings of the 63rd Annual Meeting of the Association for Computational Linguistics (Volume 1: Long Papers), pages 19182–19208, 2025.

D. Hendrycks, C. Burns, S. Basart, A. Zou, M. Mazeika, D. Song, and J. Steinhardt. Measuring massive multitask language understanding. In 9th International Conference on Learning Representations, ICLR 2021, Virtual Event, Austria, May 3-7, 2021. OpenReview.net, 2021a. URL [https://openreview.net/forum?id=d7KBjmI3GmQ](https://openreview.net/forum?id=d7KBjmI3GmQ).

D. Hendrycks, C. Burns, S. Kadavath, A. Arora, S. Basart, E. Tang, D. Song, and J. Steinhardt. Measuring mathematical problem solving with the math dataset. ArXiv preprint, abs/2103.03874, 2021b. URL [https://arxiv.org/abs/2103.03874](https://arxiv.org/abs/2103.03874).

C.-P. Hsieh, S. Sun, S. Kriman, S. Acharya, D. Rekesh, F. Jia, Y. Zhang, and B. Ginsburg. Ruler: What’s the real context size of your long-context language models? arXiv preprint arXiv:2404.06654, 2024.

Y. Huang, Y. Bai, Z. Zhu, J. Zhang, J. Zhang, T. Su, J. Liu, C. Lv, Y. Zhang, J. Lei, Y. Fu, M. Sun, and J. He. C-eval: A multi-level multi-discipline chinese evaluation suite for foundation models. In A. Oh, T. Naumann, A. Globerson, K. Saenko, M. Hardt, and S. Levine, editors, Advances in Neural Information Processing Systems 36: Annual Conference on Neural Information Processing Systems 2023, NeurIPS 2023, New Orleans, LA, USA, December 10 - 16, 2023, 2023. URL [http://papers.nips.cc/paper\_files/paper/2023/hash/c6ec1844bec96d6d32ae95ae694e23d8-Abstract-Datasets\_and\_Benchmarks.html](http://papers.nips.cc/paper_files/paper/2023/hash/c6ec1844bec96d6d32ae95ae694e23d8-Abstract-Datasets_and_Benchmarks.html).

N. Jain, K. Han, A. Gu, W.-D. Li, F. Yan, T. Zhang, S. Wang, A. Solar-Lezama, K. Sen, and I. Stoica. Livecodebench: Holistic and contamination free evaluation of large language models for code. ArXiv preprint, abs/2403.07974, 2024. URL [https://arxiv.org/abs/2403.07974](https://arxiv.org/abs/2403.07974).

C. E. Jimenez, J. Yang, A. Wettig, S. Yao, K. Pei, O. Press, and K. R. Narasimhan. Swe-bench: Can language models resolve real-world github issues? In The Twelfth International Conference on Learning Representations, ICLR 2024, Vienna, Austria, May 7-11, 2024. OpenReview.net, 2024a. URL [https://openreview.net/forum?id=VTF8yNQM66](https://openreview.net/forum?id=VTF8yNQM66).

<!-- page 25 of 31 -->

C. E. Jimenez, J. Yang, A. Wettig, S. Yao, K. Pei, O. Press, and K. R. Narasimhan. SWE-bench: Can language models resolve real-world github issues? In The Twelfth International Conference on Learning Representations, 2024b. URL [https://openreview.net/forum?id=VTF8yNQM66](https://openreview.net/forum?id=VTF8yNQM66).

M. Joshi, E. Choi, D. Weld, and L. Zettlemoyer. TriviaQA: A large scale distantly supervised challenge dataset for reading comprehension. In R. Barzilay and M.-Y. Kan, editors, Proceedings of the 55th Annual Meeting of the Association for Computational Linguistics (Volume 1: Long Papers), pages 1601–1611, Vancouver, Canada, 2017. Association for Computational Linguistics. doi: 10.18653/v1/P17-1147. URL [https://aclanthology.org/P17-1147](https://aclanthology.org/P17-1147).

Kimi Team. Kimi linear: An expressive, efficient attention architecture. arXiv preprint arXiv:2510.26692, 2025a.

Kimi Team. Kimi k1. 5: Scaling reinforcement learning with llms. arXiv preprint arXiv:2501.12599, 2025b.

Kimi Team. Kimi k2: Open agentic intelligence. arXiv preprint arXiv:2507.20534, 2025c.

A. Li, B. Gong, B. Yang, B. Shan, C. Liu, C. Zhu, C. Zhang, C. Guo, D. Chen, D. Li, et al. Minimax-01: Scaling foundation models with lightning attention. arXiv preprint arXiv:2501.08313, 2025.

H. Li, Y. Zhang, F. Koto, Y. Yang, H. Zhao, Y. Gong, N. Duan, and T. Baldwin. Cmmlu: Measuring massive multitask language understanding in chinese. ArXiv preprint, abs/2306.09212, 2023. URL [https://arxiv.org/abs/2306.09212](https://arxiv.org/abs/2306.09212).

T. Li, W.-L. Chiang, E. Frick, L. Dunlap, B. Zhu, J. E. Gonzalez, and I. Stoica. From live data to high-quality benchmarks: The arena-hard pipeline, April 2024. URL [https://lmsys.org/blog/2024-04-19-arena-hard/](https://lmsys.org/blog/2024-04-19-arena-hard/).

A. Liu, B. Feng, B. Xue, B. Wang, B. Wu, C. Lu, C. Zhao, C. Deng, C. Zhang, C. Ruan, et al. Deepseek-v3 technical report. arXiv preprint arXiv:2412.19437, 2024.

A. Liu, A. Mei, B. Lin, B. Xue, B. Wang, B. Xu, B. Wu, B. Zhang, C. Lin, C. Dong, et al. Deepseek-v3. 2: Pushing the frontier of open large language models. arXiv preprint arXiv:2512.02556, 2025.

J. Liu, C. S. Xia, Y. Wang, and L. Zhang. Is your code generated by chatgpt really correct? rigorous evaluation of large language models for code generation. In A. Oh, T. Naumann, A. Globerson, K. Saenko, M. Hardt, and S. Levine, editors, Advances in Neural Information Processing Systems 36: Annual Conference on Neural Information Processing Systems 2023, NeurIPS 2023, New Orleans, LA, USA, December 10 - 16, 2023, 2023. URL [http://papers.nips.cc/paper\_files/paper/2023/hash/43e9d647ccd3e4b7b5baab53f0368686-Abstract-Conference.html](http://papers.nips.cc/paper_files/paper/2023/hash/43e9d647ccd3e4b7b5baab53f0368686-Abstract-Conference.html).

K. Lu and T. M. Lab. On-policy distillation. Thinking Machines Lab: Connectionism, 2025. doi: 10.64434/tml.20251026. https://thinkingmachines.ai/blog/on-policy-distillation.

W. Ma, H. Zhang, L. Zhao, Y. Song, Y. Wang, Z. Sui, and F. Luo. Stabilizing moe reinforcement learning by aligning training and inference routers. arXiv preprint arXiv:2510.11370, 2025.

MAA. American invitational mathematics examination - aime. In American Invitational Mathematics Examination - AIME, 2024. URL [https://maa.org/math-competitions/american-invitational-mathematics-examination-aime](https://maa.org/math-competitions/american-invitational-mathematics-examination-aime).

<!-- page 26 of 31 -->

A. Modarressi, H. Deilamsalehy, F. Dernoncourt, T. Bui, R. A. Rossi, S. Yoon, and H. Schütze. Nolima: Long-context evaluation beyond literal matching. arXiv preprint arXiv:2502.05167, 2025.

P. Moritz, R. Nishihara, S. Wang, A. Tumanov, R. Liaw, E. Liang, M. Elibol, Z. Yang, W. Paul, M. I. Jordan, et al. Ray: A distributed framework for emerging {AI} applications. In 13th USENIX symposium on operating systems design and implementation (OSDI 18), pages 561–577, 2018.

OpenAI. Introducing simpleqa. [https://openai.com/index/introducing-simpleqa/](https://openai.com/index/introducing-simpleqa/),2024.

L. Phan, A. Gatti, Z. Han, N. Li, J. Hu, H. Zhang, C. B. C. Zhang, M. Shaaban, J. Ling, S. Shi, et al. Humanity’s last exam. arXiv preprint arXiv:2501.14249, 2025.

Z. Qiu, Z. Wang, B. Zheng, Z. Huang, K. Wen, S. Yang, R. Men, L. Yu, F. Huang, S. Huang, et al. Gated attention for large language models: Non-linearity, sparsity, and attention-sink-free. arXiv preprint arXiv:2505.06708, 2025.

Qwen Team. Qwen3-next: Towards ultimate training & inference efficiency. [https://qwen.ai/blog?id=4074cca80393150c248e508aa62983f9cb7d27cd&from=research.latest-advancements-list](https://qwen.ai/blog?id=4074cca80393150c248e508aa62983f9cb7d27cd&from=research.latest-advancements-list), Sept. 2025.

RadixArk Team. Introducing miles — rl framework to fire up large-scale moe training. [https://lmsys.org/blog/2025-11-19-miles/](https://lmsys.org/blog/2025-11-19-miles/), Nov. 2025.

D. Rein, B. L. Hou, A. C. Stickland, J. Petty, R. Y. Pang, J. Dirani, J. Michael, and S. R. Bowman. Gpqa: A graduate-level google-proof q&a benchmark. In First Conference on Language Modeling, 2024.

A. Romanou, N. Foroutan, A. Sotnikova, Z. Chen, S. H. Nelaturu, S. Singh, R. Maheshwary, M. Altomare, M. A. Haggag, A. Amayuelas, et al. Include: Evaluating multilingual language understanding with regional knowledge. arXiv preprint arXiv:2411.19799, 2024.

K. Sakaguchi, R. L. Bras, C. Bhagavatula, and Y. Choi. Winogrande: An adversarial winograd schema challenge at scale. In The Thirty-Fourth AAAI Conference on Artificial Intelligence, AAAI 2020, The Thirty-Second Innovative Applications of Artificial Intelligence Conference, IAAI 2020, The Tenth AAAI Symposium on Educational Advances in Artificial Intelligence, EAAI 2020, New York, NY, USA, February 7-12, 2020, pages 8732–8740. AAAI Press, 2020. URL [https://aaai.org/ojs/index.php/AAAI/article/view/6399](https://aaai.org/ojs/index.php/AAAI/article/view/6399).

J. Schulman, F. Wolski, P. Dhariwal, A. Radford, and O. Klimov. Proximal policy optimization algorithms. arXiv preprint arXiv:1707.06347, 2017.

Z. Shao, P. Wang, Q. Zhu, R. Xu, J. Song, X. Bi, H. Zhang, M. Zhang, Y. K. Li, Y. Wu, and D. Guo. Deepseekmath: Pushing the limits of mathematical reasoning in open language models, 2024. URL [https://arxiv.org/abs/2402.03300](https://arxiv.org/abs/2402.03300).

N. Shazeer, A. Mirhoseini, K. Maziarz, A. Davis, Q. Le, G. Hinton, and J. Dean. Outrageously large neural networks: The sparsely-gated mixture-of-experts layer. arXiv preprint arXiv:1701.06538, 2017.

M. Shoeybi, M. Patwary, R. Puri, P. LeGresley, J. Casper, and B. Catanzaro. Megatron-lm: Training multi-billion parameter language models using model parallelism. arXiv preprint arXiv:1909.08053, 2019.

<!-- page 27 of 31 -->

S. Singh, A. Romanou, C. Fourrier, D. I. Adelani, J. G. Ngui, D. Vila-Suero, P. Limkonchotiwat, K. Marchisio, W. Q. Leong, Y. Susanto, et al. Global mmlu: Understanding and addressing cultural and linguistic biases in multilingual evaluation. In Proceedings of the 63rd Annual Meeting of the Association for Computational Linguistics (Volume 1: Long Papers), pages 18761–18799, 2025.

J. Su, M. Ahmed, Y. Lu, S. Pan, W. Bo, and Y. Liu. Roformer: Enhanced transformer with rotary position embedding. Neurocomputing, 568:127063, 2024.

M. Sun, X. Chen, J. Z. Kolter, and Z. Liu. Massive activations in large language models. arXiv preprint arXiv:2402.17762, 2024.

M. Suzgun, N. Scales, N. Schärli, S. Gehrmann, Y. Tay, H. W. Chung, A. Chowdhery, Q. Le, E. Chi, D. Zhou, and J. Wei. Challenging BIG-bench tasks and whether chain-of-thought can solve them. In A. Rogers, J. Boyd-Graber, and N. Okazaki, editors, Findings of the Association for Computational Linguistics: ACL 2023, pages 13003–13051, Toronto, Canada, 2023. Association for Computational Linguistics. doi: 10.18653/v1/2023.findings-acl.824. URL [https://aclanthology.org/2023.findings-acl.824](https://aclanthology.org/2023.findings-acl.824).

A. Vaswani, N. Shazeer, N. Parmar, J. Uszkoreit, L. Jones, A. N. Gomez, Ł. Kaiser, and I. Polosukhin. Attention is all you need. Advances in neural information processing systems, 30, 2017.

K. Vodrahalli, S. Ontanon, N. Tripuraneni, K. Xu, S. Jain, R. Shivanna, J. Hui, N. Dikkala, M. Kazemi, B. Fatemi, et al. Michelangelo: Long context evaluations beyond haystacks via latent structure queries. arXiv preprint arXiv:2409.12640, 2024.

Y. Wang, X. Ma, G. Zhang, Y. Ni, A. Chandra, S. Guo, W. Ren, A. Arulraj, X. He, Z. Jiang, T. Li, M. Ku, K. Wang, A. Zhuang, R. Fan, X. Yue, and W. Chen. Mmlu-pro: A more robust and challenging multi-task language understanding benchmark. In A. Globersons, L. Mackey, D. Belgrave, A. Fan, U. Paquet, J. M. Tomczak, and C. Zhang, editors, Advances in Neural Information Processing Systems 38: Annual Conference on Neural Information Processing Systems 2024, NeurIPS 2024, Vancouver, BC, Canada, December 10 - 15, 2024, 2024. URL [http://papers.nips.cc/paper\_files/paper/2024/hash/ad236edc564f3e3156e1b2feafb99a24-Abstract-Datasets\_and\_Benchmarks\_Track.html](http://papers.nips.cc/paper_files/paper/2024/hash/ad236edc564f3e3156e1b2feafb99a24-Abstract-Datasets_and_Benchmarks_Track.html).

J. Wei, Z. Sun, S. Papay, S. McKinney, J. Han, I. Fulford, H. W. Chung, A. T. Passos, W. Fedus, and A. Glaese. Browsecomp: A simple yet challenging benchmark for browsing agents. arXiv preprint arXiv:2504.12516, 2025.

B. Xia, B. Shen, D. Zhu, D. Zhang, G. Wang, H. Zhang, H. Liu, J. Xiao, J. Dong, L. Zhao, et al. Mimo: Unlocking the reasoning potential of language model–from pretraining to posttraining. arXiv preprint arXiv:2505.07608, 2025.

C. S. Xia, Y. Deng, S. Dunn, and L. Zhang. Agentless: Demystifying llm-based software engineering agents. arXiv preprint arXiv:2407.01489, 2024.

G. Xiao, Y. Tian, B. Chen, S. Han, and M. Lewis. Efficient streaming language models with attention sinks. arXiv preprint arXiv:2309.17453, 2023.

J. Yang, K. Lieret, C. E. Jimenez, A. Wettig, K. Khandpur, Y. Zhang, B. Hui, O. Press, L. Schmidt, and D. Yang. Swe-smith: Scaling data for software engineering agents, 2025. URL [https://arxiv.org/abs/2504.21798](https://arxiv.org/abs/2504.21798).

<!-- page 28 of 31 -->

F. Yao, L. Liu, D. Zhang, C. Dong, J. Shang, and J. Gao. Your efficient rl framework secretly brings you off-policy rl training, Aug. 2025. URL [https://fengyao.notion.site/off-policy-rl](https://fengyao.notion.site/off-policy-rl).

R. Zellers, A. Holtzman, Y. Bisk, A. Farhadi, and Y. Choi. HellaSwag: Can a machine really finish your sentence? In A. Korhonen, D. Traum, and L. Màrquez, editors, Proceedings of the 57th Annual Meeting of the Association for Computational Linguistics, pages 4791–4800, Florence, Italy, 2019. Association for Computational Linguistics. doi: 10.18653/v1/P19-1472. URL [https://aclanthology.org/P19-1472](https://aclanthology.org/P19-1472).

X. Zhao, Y. Liu, K. Xu, J. Guo, Z. Wang, Y. Sun, X. Kong, Q. Cao, L. Jiang, Z. Wen, Z. Zhang, and J. Zhou. Small leak can sink a great ship–boost rl training on moe with icepop!, Sep 2025. URL [https://ringtech.notion.site/icepop](https://ringtech.notion.site/icepop).

C. Zheng, S. Liu, M. Li, X.-H. Chen, B. Yu, C. Gao, K. Dang, Y. Liu, R. Men, A. Yang, et al. Group sequence policy optimization. arXiv preprint arXiv:2507.18071, 2025.

L. Zheng, L. Yin, Z. Xie, C. L. Sun, J. Huang, C. H. Yu, S. Cao, C. Kozyrakis, I. Stoica, J. E. Gonzalez, et al. Sglang: Efficient execution of structured language model programs. Advances in neural information processing systems, 37:62557–62583, 2024.

Y. Zhong, Z. Zhang, B. Wu, S. Liu, Y. Chen, C. Wan, H. Hu, L. Xia, R. Ming, Y. Zhu, et al. Optimizing {RLHF} training for large language models with stage fusion. In 22nd USENIX Symposium on Networked Systems Design and Implementation (NSDI 25), pages 489–503, 2025.

Y. Zhou, H. Liu, Z. Chen, Y. Tian, and B. Chen. Gsm-infinite: How do your llms behave over infinitely increasing context length and reasoning complexity? arXiv preprint arXiv:2502.05252, 2025.

T. Y. Zhuo, M. C. Vu, J. Chim, H. Hu, W. Yu, R. Widyasari, I. N. B. Yusuf, H. Zhan, J. He, I. Paul, et al. Bigcodebench: Benchmarking code generation with diverse function calls and complex instructions. arXiv preprint arXiv:2406.15877, 2024.

<!-- page 29 of 31 -->

## A Contributions and Acknowledgments

We would like to express our sincere gratitude to all contributors for their invaluable support and efforts, including the Xiaomi Data Platform, CloudML, NGK, MiChat, Mify, MiKS and LLM-Plus teams, as well as those not explicitly listed in this paper. Authors within each role are listed alphabetically by their first name.

| Core Contributors | Wenhan Ma |
| --- | --- |
| Bangjun Xiao | Xiangwei Deng |
| Bingquan Xia | Xing Zhang |
| Bo Yang | Yifan Song |
| Bofei Gao | Yihan Yan |
| Bowen Shen | Yihao Zhao |
| Chen Zhang | Yingchun Lai |
| Chenhong He | Yizhao Gao |
| Chiheng Lou | Yu Cheng |
| Fuli Luo† | Yuanyuan Tian |
| Gang Wang | Yudong Wang |
| Gang Xie | Zhen Tang |
| Hailin Zhang | Zhengju Tang |
| Hanglong Lv | Zhengtao Wen |
| Hanyu Li | Zhichao Song |
| Heyu Chen | Zhixian Zheng |
| Hongshen Xu | Zihan Jiang |
| Houbin Zhang |  |
| Huaqiu Liu | Contributors |
| Jiangshan Duo | Bohan Mao |
| Jianyu Wei | Bowen Ye |
| Jiebao Xiao | Can Cai |
| Jinhao Dong | Chenghua Wang |
| Jun Shi | Chengxuan Zhu |
| Junhao Hu | Chong Ma |
| Kainan Bao | Chun Chen |
| Kang Zhou | Chunan Li |
| Lei Li | Dawei Zhu |
| Liang Zhao | Deshan Xiao |
| Linghao Zhang | Dong Zhang |
| Peidian Li | Duo Zhang |
| Qianli Chen | Fangyue Liu |
| Shaohui Liu | Feiyu Yang |
| Shihua Yu | Fengyuan Shi |
| Shijie Cao | Guoan Wang |
| Shimao Chen | Hao Tian |
| Shouqiu Yu | Hao Wu |
| Shuo Liu | Heng Qu |
| Tianling Zhou | Hongfei Yi |
| Weijiang Su | Hongxu An |
| Weikun Wang | Hongyi Guan |

<small><span class="docvortex-page-footnote" data-block-type="page_footnote" style="color:#6b7280">†Corresponding author</span></small>

<!-- page 30 of 31 -->

Jian Wen Jiarui Sun Jiawei Li Jinlong Xue Jun Xia Kai Fang Menghang Zhu Nuo Chen Qian Tu Qihao Zhang Qiying Wang Rang Li Rui Ma Shaolei Zhang Shengfan Wang Shicheng Li Shuhao Gu Shuhuai Ren Sirui Deng Tao Guo Tianyang Lu Weiji Zhuang Weikang Zhang Weimin Xiong

Wenshan Huang Wenyu Yang Xin Zhang Xing Yong Xu Wang Xueyang Xie Yilin Jiang Yixin Yang Yongzhe He Yu Tu Yuanliang Dong Yuchen Liu Yue Ma Yue Yu Yuxing Xiang Zhaojun Huang Zhenru Lin Zhipeng Xu Zhiyang Chen Zhonghua Deng Zihan Zhang Zihao Yue

<!-- page 31 of 31 -->

## B Reward Hacking of SWE-Bench

Consistent with recent findings within the SWE-Bench community, we similarly identify the bug in the official SWE-Bench images where the ground truth commits are not properly deleted. During the RL training, this could lead to reward hacking and inflated evaluation, where the model tends to obtain rewards by peeking at future commits, as shown in Figure 8. To fix this, we update to the newest SWE-Bench image for evaluation. For our self-built training images, we also follow the official SWE-Bench resolution on git hacking, and repeatedly confirm that our model does not exhibit any reward hacking.

与 SWE-Bench 社区近来的发现一致, 我们也发现官方 SWE-Bench 镜像存在 ground truth commits 未被正确删除的 bug. RL 训练中这会诱发 reward hacking 与评测虚高: 模型偷看未来 commit 拿奖励, 见图 8. 修复办法: 评测换用最新 SWE-Bench 镜像; 自研训练镜像也按官方对 git hacking 的修复方案处理, 并反复确认本模型不存在任何 reward hacking.

![Chart block](images/p31-figure-8-the-tendency-of-our-experiment-on-qwen3-32b-to.png)

Figure 8 The tendency of our experiment on Qwen3-32B to exhibit reward hacking during RL training within unprocessed images. We quantify the model’s git hacking attempts by counting a set of keywords, such as $\mathbf { g i t }$ log –-all", within the model’s rollout trajectories.

> **再看:** 附录 B 的 reward hacking 实验主体是 Qwen3-32B, 不是 MiMo. 能否直接说 MiMo 在训练中也曾 hacking?
> 不能. Figure 8 明确是 Qwen3-32B on unprocessed images 的趋势. 对 MiMo, 正文写自建镜像已按官方修复 git hacking, 并 repeatedly confirm 本模型未表现 hacking.

## C Context Management

While fine-tuning and reinforcement learning optimize model parameters $\theta ,$ context management strategically refines the conditioning context C in $P ( y \mid C , \theta )$ Our approach addresses two complementary challenges. For context augmentation, we adopt a Unix-inspired abstraction: tools, documents, and databases are uniformly exposed as files, enabling the model to retrieve information via Bash commands—leveraging its native code-generation capabilities. For context consolidation, we combat the "Lost in the Middle" phenomenon by enforcing aggressive memory compression. When context utilization exceeds a threshold (as low as 30%), the system prompts the model to summarize, archives the full history to a retrievable memory file, and replaces active context with the summary. Empirically, this yields 5–10% accuracy gains on Deep Research tasks. Our results align with DeepSeek V3’s finding that discarding tool-call history outperforms retention strategies; replicating their aggressive reset protocol, we achieve 58.3 on comparable benchmarks. The core insight is counterintuitive: less context, strategically managed, produces more focused and accurate generation.

> **停一下:** 附录 C 写占用超过阈值 (as low as 30%) 就压缩. 30% 是默认阈值还是可配下限示例?
> 原文 「as low as 30%」 表示阈值可以低到 30%, 不是声明生产默认固定 30%. 经验收益写 Deep Research 类 5–10%, BrowseComp 对齐激进重置后 58.3.

31
