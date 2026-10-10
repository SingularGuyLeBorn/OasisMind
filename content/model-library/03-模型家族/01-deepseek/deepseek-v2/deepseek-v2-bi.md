---
title: "DeepSeek-V2 · 对照译稿"
category: "模型库"
tags: ["DeepSeek", "对照译稿"]
published: true
excerpt: "DeepSeek-V2 公开材料的逐段中英对照译稿,附读报告时的疑问块."
---
<!-- page 1 of 52 -->

arXiv: 2405.04434v5 [cs. CL] 19 Jun 2024

Qdeepseek

# DeepSeek-V2: A Strong, Economical, and Efficient Mixture-of-Experts Language Model / DeepSeek-V2: 一个强大, 经济且高效的 MoE 语言模型

DeepSeek-AI

**research@deepseek. com**

## Abstract

We present DeepSeek-V2, a strong Mixture-of-Experts (MoE) language model characterized by economical training and efficient inference. It comprises 236B total parameters, of which 21B are activated for each token, and supports a context length of 128K tokens. DeepSeek-V2 adopts innovative architectures including Multi-head Latent Attention (MLA) and DeepSeekMoE. MLA guarantees efficient inference through significantly compressing the Key-Value (KV) cache into a latent vector, while DeepSeekMoE enables training strong models at an economical cost through sparse computation. Compared with DeepSeek 67B, DeepSeek-V2 achieves significantly stronger performance, and meanwhile saves 42.5% of training costs, reduces the KV cache by 93.3%, and boosts the maximum generation throughput to 5.76 times. We pretrain DeepSeek-V2 on a high-quality and multi-source corpus consisting of 8.1T tokens, and further perform Supervised Fine-Tuning (SFT) and Reinforcement Learning (RL) to fully unlock its potential. Evaluation results show that, even with only 21B activated parameters, DeepSeek-V2 and its chat versions still achieve top-tier performance among open-source models. The model checkpoints are available at [https://github. com/deepseek-ai/DeepSeek-V2](https://github. com/deepseek-ai/DeepSeek-V2).

推出 DeepSeek-V2: 强 MoE 语言模型, 训练省钱, 推理省缓存. 总参 236B, 每 token 激活 21B, 上下文 128K. 架构两件套: Multi-head Latent Attention(MLA)与 DeepSeekMoE. MLA 把 KV cache 压成潜变量, 推理更轻; DeepSeekMoE 靠稀疏计算把强模型训得起. 相对 DeepSeek 67B: 更强, 同时训练成本省 42.5%, KV cache 减 93.3%, 最大生成吞吐提到 5.76 倍. 预训练语料 8.1T, 再做 SFT 与 RL. 即使只激活 21B, 基座与 Chat 仍进开源第一梯队. 权重: https://github. com/deepseek-ai/DeepSeek-V2

解释: MLA= 把 Key/Value 联合压到低维潜向量再参与注意力, 推理主要缓存这份压缩向量, 而不是每头全量 K/V. DeepSeekMoE = 细粒度路由专家 + 隔离的共享专家, 用稀疏激活扩大总容量, 控制每步算力.

![Chart block](images/p01-a.png)

![Chart block](images/p01-chart.png)

![Chart block](images/p01-chart-2.png)

![Chart block](images/p01-b.png)

Figure 1 | (a) MMLU accuracy vs. activated parameters, among different open-source models. (b) Training costs and inference efficiency of DeepSeek 67B (Dense) and DeepSeek-V2.

图 1｜(a) 开源模型 MMLU 准确率对激活参数; (b) DeepSeek 67B(Dense)与 DeepSeek-V2 的训练成本与推理效率.

<!-- page 2 of 52 -->

## Contents

- 1 Introduction 4
- 2 Architecture 6
  - 2.1 Multi-Head Latent Attention: Boosting Inference Efficiency 6
    - 2.1.1 Preliminaries: Standard Multi-Head Attention 6
    - 2.1.2 Low-Rank Key-Value Joint Compression 7
    - 2.1.3 Decoupled Rotary Position Embedding 8
    - 2.1.4 Comparison of Key-Value Cache 8
  - 2.2 DeepSeekMoE: Training Strong Models at Economical Costs 9
    - 2.2.1 Basic Architecture 9
    - 2.2.2 Device-Limited Routing 9
    - 2.2.3 Auxiliary Loss for Load Balance 10
    - 2.2.4 Token-Dropping Strategy 11
- 3 Pre-Training 11
  - 3.1 Experimental Setups 11
    - 3.1.1 Data Construction 11
    - 3.1.2 Hyper-Parameters 12
    - 3.1.3 Infrastructures 12
    - 3.1.4 Long Context Extension 13
  - 3.2 Evaluations 13
    - 3.2.1 Evaluation Benchmarks 13
    - 3.2.2 Evaluation Results 14
    - 3.2.3 Training and Inference Efficiency 16
- 4 Alignment 16
  - 4.1 Supervised Fine-Tuning 16
  - 4.2 Reinforcement Learning 17
  - 4.3 Evaluation Results 18
  - 4.4 Discussion 20
- 5 Conclusion, Limitation, and Future Work 21
- A Contributions and Acknowledgments 27
- B DeepSeek-V2-Lite: A 16B Model Equipped with MLA and DeepSeekMoE 29

<!-- page 3 of 52 -->

  - B.1 Model Description 29
  - B.2 Performance Evaluation 30
- C Full Formulas of MLA 31
- D Ablation of Attention Mechanisms 31
  - D.1 Ablation of MHA, GQA, and MQA 31
  - D.2 Comparison Between MLA and MHA 31
- E Discussion About Pre-Training Data Debiasing 32
- F Additional Evaluations on Math and Code 32
- G Evaluation Formats 33

<!-- page 4 of 52 -->

## 1. Introduction

In the past few years, Large Language Models (LLMs) (Anthropic, 2023; Google, 2023; OpenAI, 2022, 2023) have undergone rapid development, offering a glimpse into the dawn of Artificial General Intelligence (AGI). In general, the intelligence of an LLM tends to improve as the number of parameters increases, allowing it to exhibit emergent capabilities across various tasks (Wei et al., 2022). However, the improvement comes at the cost of larger computing resources for training and a potential decrease in inference throughput. These constraints present significant challenges that impede the widespread adoption and utilization of LLMs. In order to tackle this problem, we introduce DeepSeek-V2, a strong open-source Mixture-of-Experts (MoE) language model, characterized by economical training and efficient inference through an innovative Transformer architecture. It is equipped with a total of 236B parameters, of which 21B are activated for each token, and supports a context length of 128K tokens.

过去几年大模型发展很快, 参数越大往往越强, 但训练算力与推理吞吐也一起变差. 为此推出开源 MoE 模型 DeepSeek-V2: 创新 Transformer 架构, 训练经济, 推理高效; 总参 236B, 每 token 激活 21B, 上下文 128K.

We optimize the attention modules and Feed-Forward Networks (FFNs) within the Transformer framework (Vaswani et al., 2017) with our proposed **Multi-head Latent Attention (MLA)** and **DeepSeekMoE**. (1) In the context of attention mechanisms, the Key-Value (KV) cache of the Multi-Head Attention (MHA) (Vaswani et al., 2017) poses a significant obstacle to the inference efficiency of LLMs. Various approaches have been explored to address this issue, including Grouped-Query Attention (GQA) (Ainslie et al., 2023) and Multi-Query Attention (MQA) (Shazeer, 2019). However, these methods often compromise performance in their attempt to reduce the KV cache. In order to achieve the best of both worlds, we introduce MLA, an attention mechanism equipped with low-rank key-value joint compression. Empirically, MLA achieves superior performance compared with MHA, and meanwhile significantly reduces the KV cache during inference, thus boosting the inference efficiency. (2) For Feed-Forward Networks (FFNs), we follow the DeepSeekMoE architecture (Dai et al., 2024), which adopts fine-grained expert segmentation and shared expert isolation for higher potential in expert specialization. The DeepSeekMoE architecture demonstrates great advantages compared with conventional MoE architectures like GShard (Lepikhin et al., 2021), enabling us to train strong models at an economical cost. As we employ expert parallelism during training, we also devise supplementary mechanisms to control communication overheads and ensure load balance. By combining these two techniques, DeepSeek-V2 features strong performance (Figure 1(a)), economical training costs, and efficient inference throughput (Figure 1(b)), simultaneously.

在 Transformer 里同时改注意力与 FFN: (1) MHA 的 KV cache 拖累推理; GQA/MQA 能省缓存却常掉分. MLA 做低秩 KV 联合压缩, 经验上强过 MHA, 同时大幅减推理 KV. (2) FFN 跟 DeepSeekMoE: 细粒度专家分割 + 共享专家隔离, 相对 GShard 一类常规 MoE 优势明显; 训练用专家并行时另加通信与负载均衡机制. 两件套叠在一起: 强(图 1(a)), 训练省, 推理快(图 1(b)).

We construct a high-quality and multi-source pre-training corpus consisting of 8.1T tokens. Compared with the corpus used in DeepSeek 67B (our previous release) (DeepSeek-AI, 2024), this corpus features an extended amount of data, especially Chinese data, and higher data quality. We first pretrain DeepSeek-V2 on the full pre-training corpus. Then, we collect 1.5M conversational sessions, which encompass various domains such as math, code, writing, reasoning, safety, and more, to perform Supervised Fine-Tuning (SFT) for DeepSeek-V2 Chat (SFT). Finally, we follow DeepSeekMath (Shao et al., 2024) to employ Group Relative Policy Optimization (GRPO) to further align the model with human preference and produce DeepSeek-V2 Chat (RL).

预训练语料 8.1T, 相对 67B 更大, 中文更多, 质量更高. 全量预训练后, 用 1.5M 会话(数学, 代码, 写作, 推理, 安全等)做 SFT, 得到 Chat (SFT); 再按 DeepSeekMath 用 GRPO 对齐人类偏好, 得到 Chat (RL).

解释: GRPO(组相对策略优化)= 同一题采样一组回答, 用组内相对奖励估优势, 省掉 PPO 里同规模的 critic.

We evaluate DeepSeek-V2 on a wide range of benchmarks in English and Chinese, and compare it with representative open-source models. Evaluation results show that even with only 21B activated parameters, DeepSeek-V2 still achieves top-tier performance among open-source models and becomes the strongest open-source MoE language model. Figure 1(a) highlights that, on MMLU, DeepSeek-V2 achieves top-ranking performance with only a small number of activated parameters. In addition, as shown in Figure 1(b), compared with DeepSeek 67B, DeepSeek-V2 saves 42.5% of training costs, reduces the KV cache by 93.3%, and boosts the maximum generation throughput to 5.76 times. We also evaluate DeepSeek-V2 Chat (SFT) and

中英多基准评测: 仅激活 21B 仍进开源第一梯队, 并成为当时最强开源 MoE. 图 1(a): MMLU 上激活不多也能排前列. 图 1(b): 相对 67B, 训练成本 −42.5%, KV −93.3%, 最大生成吞吐 ×5.76. Chat (SFT) 与

<!-- page 5 of 52 -->

![Image block](images/p05-figure-2-illustration-of-the-architecture-of-deepseek.png)

Figure 2 | Illustration of the architecture of DeepSeek-V2. MLA ensures efficient inference by significantly reducing the KV cache for generation, and DeepSeekMoE enables training strong models at an economical cost through the sparse architecture.

图 2｜DeepSeek-V2 架构示意. MLA 靠大幅减少生成期 KV cache 抬推理效率; DeepSeekMoE 靠稀疏结构把强模型训得起.

DeepSeek-V2 Chat (RL) on open-ended benchmarks. Notably, DeepSeek-V2 Chat (RL) achieves 38.9 length-controlled win rate on AlpacaEval 2.0 (Dubois et al., 2024), 8.97 overall score on MT-Bench (Zheng et al., 2023), and 7.91 overall score on AlignBench (Liu et al., 2023). The English open-ended conversation evaluations demonstrate that DeepSeek-V2 Chat (RL) has top-tier performance among open-source chat models. In addition, the evaluation on AlignBench indicates that in Chinese, DeepSeek-V2 Chat (RL) outperforms all of open-source models, and even beats most of closed-source models.

Chat (RL) 也做了开放生成评测: AlpacaEval 2.0 长度控制胜率 38.9, MT-Bench 总分 8.97, AlignBench 总分 7.91. 英文开放对话进开源 Chat 第一梯队; AlignBench 上中文超过全部开源, 并压过多数闭源.

In order to facilitate further research and development on MLA and DeepSeekMoE, we also release DeepSeek-V2-Lite, a smaller model equipped with MLA and DeepSeekMoE, for the open-source community. It has a total of 15.7B parameters, where 2.4B are activated for each token. Detailed descriptions about DeepSeek-V2-Lite can be found in Appendix B.

为方便社区继续研究 MLA 与 DeepSeekMoE, 另释出 DeepSeek-V2-Lite: 总参 15.7B, 每 token 激活 2.4B. 细节见附录 B.

In the rest of this paper, we first provide a detailed description of the model architecture of DeepSeek-V2 (Section 2). Subsequently, we introduce our pre-training endeavors, including the training data construction, hyper-parameter settings, infrastructures, long context extension, and the evaluation of model performance and efficiency (Section 3). Following this, we demonstrate our efforts in alignment, encompassing Supervised Fine-Tuning (SFT), Reinforcement

后文结构: §2 架构; §3 预训练(数据, 超参, 基建, 长上下文, 效果与效率); §4 对齐(SFT, 强化

<!-- page 6 of 52 -->

Learning (RL), the evaluation results, and other discussion (Section 4). Finally, we summarize the conclusion, deliberate on the current limitations of DeepSeek-V2, and outline our future work (Section 5).

学习, 评测与讨论); §5 结论, 局限与未来工作.

## 2. Architecture 架构

By and large, DeepSeek-V2 is still in the Transformer architecture (Vaswani et al., 2017), where each Transformer block consists of an attention module and a Feed-Forward Network (FFN). However, for both the attention module and the FFN, we design and employ innovative architectures. For attention, we design MLA, which utilizes low-rank key-value joint compression to eliminate the bottleneck of inference-time key-value cache, thus supporting efficient inference. For FFNs, we adopt the DeepSeekMoE architecture (Dai et al., 2024), a high-performance MoE architecture that enables training strong models at an economical cost. An illustration of the architecture of DeepSeek-V2 is presented in Figure 2, and we will introduce the details of MLA and DeepSeekMoE in this section. For other tiny details (e. g., layer normalization and the activation function in FFNs), unless specifically stated, DeepSeek-V2 follows the settings of DeepSeek 67B (DeepSeek-AI, 2024).

整体仍是 Transformer: 每块注意力 + FFN. 注意力用 MLA(低秩 KV 联合压缩, 去掉推理 KV 瓶颈); FFN 用 DeepSeekMoE(经济地训强模型). 总览见图 2. 其余细节(层归一化, FFN 激活等)未特别说明处跟 DeepSeek 67B.

### 2.1. Multi-Head Latent Attention: Boosting Inference Efficiency Multi-Head Latent Attention: 抬推理效率

Conventional Transformer models usually adopts Multi-Head Attention (MHA) (Vaswani et al., 2017), but during generation, its heavy Key-Value (KV) cache will become the bottleneck that limit the inference efficiency. In order to reduce the KV cache, Multi-Query Attention (MQA) (Shazeer, 2019) and Grouped-Query Attention (GQA) (Ainslie et al., 2023) are proposed. They require a smaller magnitude of KV cache, but their performance does not match MHA (we provide the ablation of MHA, GQA and MQA in Appendix D. 1).

常规 Transformer 用 MHA, 生成时沉重 KV cache 会卡吞吐. MQA, GQA 能少存 KV, 但性能跟不上 MHA(消融见附录 D. 1).

For DeepSeek-V2, we design an innovative attention mechanism called Multi-head Latent Attention (MLA). Equipped with low-rank key-value joint compression, MLA achieves better performance than MHA, but requires a significantly smaller amount of KV cache. We introduce its architecture in the following, and also provide a comparison between MLA and MHA in Appendix D. 2.

V2 设计 MLA: 低秩 KV 联合压缩, 强过 MHA, KV 却少得多. 下文讲结构; 与 MHA 对照见附录 D. 2.

#### 2.1.1. Preliminaries: Standard Multi-Head Attention 预备: 标准 Multi-Head Attention

We first introduce the standard MHA mechanism as background. Let 𝑑 be the embedding dimension, $n _ { h }$ be the number of attention heads, $d _ { h }$ be the dimension per head, and $\mathbf { h } _ { t } \in \mathbb { R } ^ { \tilde { d } }$ be the attention input of the 𝑡-th token at an attention layer. Standard MHA first produces $\mathbf { q } _ { t } , \mathbf { k } _ { t } , \mathbf { v } _ { t } \in \mathbb { R } ^ { d _ { h } n _ { h } }$ through three matrices $W ^ { Q } , W ^ { K } , W ^ { V } \in \mathbb { R } ^ { d _ { h } \vec { n _ { h } \times d } }$ , respectively:

先回顾标准 MHA. $d$ 为嵌入维, $n_h$ 头数, $d_h$ 每头维, $\mathbf{h}_t$ 为第 $t$ 个 token 的注意力输入. 先用 $W^Q, W^K, W^V$ 得到 $\mathbf{q}_t, \mathbf{k}_t, \mathbf{v}_t$:

$$
\mathbf {q} _ {t} = W ^ {Q} \mathbf {h} _ {t}, \tag{1}
$$

$$
\mathbf {k} _ {t} = W ^ {K} \mathbf {h} _ {t}, \tag{2}
$$

$$
\mathbf {v} _ {t} = W ^ {V} \mathbf {h} _ {t}, \tag{3}
$$

<!-- page 7 of 52 -->

![Image block](images/p07-figure-3-simplified-illustration-of-multi-head.png)

Figure 3 | Simplified illustration of Multi-Head Attention (MHA), Grouped-Query Attention (GQA), Multi-Query Attention (MQA), and Multi-head Latent Attention (MLA). Through jointly compressing the keys and values into a latent vector, MLA significantly reduces the KV cache during inference.

图 3｜MHA, GQA, MQA, MLA 示意. MLA 把 K/V 联合压成潜向量, 推理期 KV cache 显著变小.

Then, $\mathbf { q } _ { t } , \mathbf { k } _ { t } , \mathbf { v } _ { t }$ will be sliced into $n _ { h }$ heads for the multi-head attention computation:

再切成 $n_h$ 个头做多头注意力:

$$
[ \mathbf {q} _ {t, 1}; \mathbf {q} _ {t, 2}; \dots ; \mathbf {q} _ {t, n _ {h}} ] = \mathbf {q} _ {t}, \tag{4}
$$

$$
\left[ \mathbf {k} _ {t, 1}; \mathbf {k} _ {t, 2}; \dots ; \mathbf {k} _ {t, n _ {i}} \right] = \mathbf {k} _ {t}, \tag{5}
$$

$$
\left[ \mathbf {V} _ {t, 1}; \mathbf {V} _ {t, 2}; \dots ; \mathbf {V} _ {t, n _ {h}} \right] = \mathbf {V} _ {t}, \tag{6}
$$

$$
\mathbf {o} _ {t, i} = \sum_ {j = 1} ^ {t} \operatorname{Softmax} _ {j} \left(\frac {\mathbf {q} _ {t , i} ^ {T} \mathbf {k} _ {j , i}}{\sqrt {d _ {h}}}\right) \mathbf {v} _ {j, i}, \tag{7}
$$

$$
\mathbf {u} _ {t} = W ^ {O} \big [ \mathbf {o} _ {t, 1}; \mathbf {o} _ {t, 2}; \dots ; \mathbf {o} _ {t, n _ {h}} \big ], \tag{8}
$$

where $\mathbf { q } _ { t , i } , \mathbf { k } _ { t , i } , \mathbf { v } _ { t , i } \in \mathbb { R } ^ { d _ { h } }$ denote the query, key, and value of the 𝑖-th attention head, respectively; $W ^ { O } \in \mathbb { R } ^ { \widehat { d \times d _ { h } n _ { h } } }$ denotes the output projection matrix. During inference, all keys and values need to be cached to accelerate inference, so MHA needs to cache $2 n _ { h } d _ { h } l$ elements for each token. In model deployment, this heavy KV cache is a large bottleneck that limits the maximum batch size and sequence length.

$\mathbf{q}_{t, i}, \mathbf{k}_{t, i}, \mathbf{v}_{t, i}$ 为第 $i$ 头; $W^O$ 为输出投影. 推理要缓存全部 K/V, MHA 每 token 需 $2 n_h d_h l$ 个元素, 会卡住最大 batch 与序列长.

#### 2.1.2. Low-Rank Key-Value Joint Compression 低秩 Key-Value 联合压缩

The core of MLA is the low-rank joint compression for keys and values to reduce KV cache:

MLA 核心: 对 K/V 做低秩联合压缩, 减 KV cache:

$$
\mathbf {c} _ {t} ^ {K V} = W ^ {D K V} \mathbf {h} _ {t}, \tag{9}
$$

$$
\mathbf {k} _ {t} ^ {C} = W ^ {U K} \mathbf {c} _ {t} ^ {K V}, \tag{10}
$$

$$
\mathbf {v} _ {t} ^ {C} = W ^ {U V} \mathbf {c} _ {t} ^ {K V}, \tag{11}
$$

where $\mathbf { c } _ { t } ^ { K V } \in \mathbb { R } ^ { d _ { c } }$ is the compressed latent vector for keys and values; $d _ { c } ( \ll d _ { h } n _ { h } )$ denotes the KV compression dimension; $\dot { W ^ { D K V } } \in \mathbb { R } ^ { d _ { c } \times d }$ is the down-projection matrix; and $\dot { W ^ { U K } } , W ^ { U V } \in \mathbb { R } ^ { d _ { h } n _ { h } \times d _ { c } }$ are the up-projection matrices for keys and values, respectively. During inference, MLA only needs to cache $\mathbf { c } _ { t } ^ { K V }$ , so its KV cache has only 𝑑<sub>𝑐</sub>𝑙 elements, where 𝑙 denotes the number of layers. In addition, during inference, since $W ^ { U K }$ can be absorbed into $W ^ { Q }$ , and $W ^ { U V }$ can be absorbed into $W ^ { O }$ , we even do not need to compute keys and values out for attention. Figure 3 intuitively illustrates how the KV joint compression in MLA reduces the KV cache.

$\mathbf{c}_t^{KV}$ 为压缩潜向量, $d_c\ll d_h n_h$. 推理主要缓存 $\mathbf{c}_t^{KV}$, 每层合计约 $d_c l$ 个元素. 又因 $W^{UK}$ 可吸收进 $W^Q$, $W^{UV}$ 可吸收进 $W^O$, 注意力甚至不必显式算出 K/V. 图 3 直观画出联合压缩如何减 KV.

Moreover, in order to reduce the activation memory during training, we also perform

另外, 为省训练期激活显存, 还对 query 做

<!-- page 8 of 52 -->

low-rank compression for the queries, even if it cannot reduce the KV cache:

低秩压缩(这步不减 KV cache):

$$
\mathbf {c} _ {t} ^ {Q} = W ^ {D Q} \mathbf {h} _ {t}, \tag{12}
$$

$$
\mathbf {q} _ {t} ^ {C} = W ^ {U Q} \mathbf {c} _ {t} ^ {Q}, \tag{13}
$$

where $\mathbf { c } _ { t } ^ { Q } \; \in \; \mathbb { R } ^ { d _ { c } ^ { \prime } }$ is the compressed latent vector for queries; $d _ { c } ^ { \prime } ( \ll   d _ { h } n _ { h } )$ denotes the query compression dimension; and $W ^ { D Q }   \in   \mathbb { R } ^ { d _ { c } ^ { \prime } \times d } , W ^ { U Q }   \in   \mathbb { R } ^ { \hat { d _ { h } n _ { h } } \times d _ { c } ^ { \prime } }$ are the down-projection and upprojection matrices for queries, respectively.

$\mathbf{c}_t^Q$ 为 query 压缩潜向量, 维 $d_c'$.

#### 2.1.3. Decoupled Rotary Position Embedding 解耦 RoPE

Following DeepSeek 67B (DeepSeek-AI, 2024), we intend to use the Rotary Position Embedding (RoPE) (Su et al., 2024) for DeepSeek-V2. However, RoPE is incompatible with low-rank KV compression. To be specific, RoPE is position-sensitive for both keys and queries. If we apply RoPE for the keys $\mathbf { k } _ { t } ^ { C } , W ^ { \hat { U } K }$ in Equation 10 will be coupled with a position-sensitive RoPE matrix. In this way, $W ^ { \vec { U K } }$ cannot be absorbed into $W ^ { Q }$ any more during inference, since a RoPE matrix related to the currently generating token will lie between $W ^ { Q }$ and $W ^ { U K }$ and matrix multiplication does not obey a commutative law. As a result, we must recompute the keys for all the prefix tokens during inference, which will significantly hinder the inference efficiency.

想沿用 RoPE, 但它与低秩 KV 压缩打架: 若直接给 $\mathbf{k}_t^C$ 加 RoPE, $W^{UK}$ 会被位置相关矩阵缠住, 推理时无法吸收进 $W^Q$, 前缀 key 还得重算, 效率立刻掉回去.

As a solution, we propose the decoupled RoPE strategy that uses additional multi-head queries $\mathbf { q } _ { t , i } ^ { R } \in \mathbb { R } ^ { d _ { h } ^ { R } }$ and a shared key $\mathbf { k } _ { t } ^ { R } \in \mathbb { R } ^ { d _ { h } ^ { R } }$ to carry RoPE, where $d _ { h } ^ { R }$ denotes the per-head dimension of the decoupled queries and key. Equipped with the decoupled RoPE strategy, MLA performs the following computation:

解法: 解耦 RoPE-- 另开多头 $\mathbf{q}_{t, i}^R$ 与共享 $\mathbf{k}_t^R$ 专门扛位置, 内容路径继续走压缩:

$$
[ \mathbf {q} _ {t, 1} ^ {R}; \mathbf {q} _ {t, 2} ^ {R}; \dots ; \mathbf {q} _ {t, n _ {h}} ^ {R} ] = \mathbf {q} _ {t} ^ {R} = \mathrm{RoPE} (W ^ {Q R} \mathbf {c} _ {t} ^ {Q}), \tag{14}
$$

$$
\mathbf {k} _ {t} ^ {R} = \mathrm{RoPE} (W ^ {K R} \mathbf {h} _ {t}), \tag{15}
$$

$$
\mathbf {q} _ {t, i} = [ \mathbf {q} _ {t, i} ^ {C}; \mathbf {q} _ {t, i} ^ {R} ], \tag{16}
$$

$$
\mathbf {k} _ {t, i} = [ \mathbf {k} _ {t, i} ^ {C}; \mathbf {k} _ {t} ^ {R} ], \tag{17}
$$

$$
\mathbf {o} _ {t, i} = \sum_ {j = 1} ^ {t} \text {Softmax} _ {j} (\frac {\mathbf {q} _ {t , i} ^ {T} \mathbf {k} _ {j , i}}{\sqrt {d _ {h} + d _ {h} ^ {R}}}) \mathbf {v} _ {j, i} ^ {C}, \tag{18}
$$

$$
\mathbf {u} _ {t} = W ^ {O} [ \mathbf {o} _ {t, 1}; \mathbf {o} _ {t, 2}; \dots ; \mathbf {o} _ {t, n _ {h}} ], \tag{19}
$$

where $W ^ { Q R } \in \mathbb { R } ^ { d _ { h } ^ { R } n _ { h } \times d _ { c } ^ { \prime } }$ and $W ^ { K R } \in \mathbb { R } ^ { d _ { h } ^ { R } \times d }$ are matrices to produce the decouples queries and key, respectively; RoPE(.) denotes the operation that applies RoPE matrices; and $[ \cdot ; \cdot ]$ denotes the concatenation operation. During inference, the decoupled key should also be cached. Therefore, DeepSeek-V2 requires a total KV cache containing $( \bar { d _ { c } } + d _ { h } ^ { R } ) l$ elements.

推理时解耦 key 也要缓存, 总 KV 元素量为 $(d_c+d_h^R)l$.

In order to demonstrate the complete computation process of MLA, we also organize and provide its full formulas in Appendix C.

完整公式见附录 C.

#### 2.1.4. Comparison of Key-Value Cache Key-Value Cache 对照

We demonstrate a comparison of the KV cache per token among different attention mechanisms in Table 1. MLA requires only a small amount of KV cache, equal to GQA with only 2.25 groups, but can achieve stronger performance than MHA.

Table 1: MLA 的每 token KV 量大约等于「只有 2.25 组的 GQA」, 能力却强过 MHA.

<!-- page 9 of 52 -->

| Attention Mechanism | KV Cache per Token (# Element) | Capability |
| --- | --- | --- |
| Multi-Head Attention (MHA) | 2𝑛<sub>ℎ</sub>𝑑<sub>ℎ</sub>𝑙 | Strong |
| Grouped-Query Attention (GQA) | 2𝑛<sub>𝑔</sub>𝑑<sub>ℎ</sub>𝑙 | Moderate |
| Multi-Query Attention (MQA) | 2𝑑<sub>ℎ</sub>𝑙 | Weak |
| MLA (Ours) | (𝑑𝑐 + 𝑑ℎ𝑅)𝑙 ≈ 9/2 𝑑ℎ𝑙 | Stronger |

Table 1 | Comparison of the KV cache per token among different attention mechanisms. $n _ { h }$ denotes the number of attention heads, $d _ { h }$ denotes the dimension per attention head, 𝑙 denotes the number of layers, $n _ { g }$ denotes the number of groups in GQA, and $d _ { c }$ and $d _ { h } ^ { R }$ denote the KV compression dimension and the per-head dimension of the decoupled queries and key in MLA, respectively. The amount of KV cache is measured by the number of elements, regardless of the storage precision. For DeepSeek-V2, $d _ { c }$ is set to $4 d _ { h }$ and $d _ { h } ^ { R }$ is set to $\frac { d _ { h } } { 2 }$ . So, its KV cache is equal to GQA with only 2.25 groups, but its performance is stronger than MHA.

表 1｜各注意力每 token KV 元素量对照. V2 取 $d_c=4d_h$, $d_h^R=d_h/2$, 故约等于 2.25 组 GQA, 性能却强过 MHA.

### 2.2. DeepSeekMoE: Training Strong Models at Economical Costs DeepSeekMoE: 经济地训强模型

#### 2.2.1. Basic Architecture 基本结构

For FFNs, we employ the DeepSeekMoE architecture (Dai et al., 2024). DeepSeekMoE has two key ideas: segmenting experts into finer granularity for higher expert specialization and more accurate knowledge acquisition, and isolating some shared experts for mitigating knowledge redundancy among routed experts. With the same number of activated and total expert parameters, DeepSeekMoE can outperform conventional MoE architectures like GShard (Lepikhin et al., 2021) by a large margin.

FFN 用 DeepSeekMoE: 专家切细, 专业化更强; 再隔离共享专家, 减轻路由专家知识冗余. 相同激活与总专家参数下, 相对 GShard 可大幅领先.

Let $\mathbf { u } _ { t }$ be the FFN input of the 𝑡-th token, we compute the FFN output $\mathbf { h } _ { t } ^ { \prime }$ as follows:

第 $t$ 个 token 的 FFN 输出:

$$
\mathbf {h} _ {t} ^ {\prime} = \mathbf {u} _ {t} + \sum_ {i = 1} ^ {N _ {s}} \mathrm{FFN} _ {i} ^ {(s)} \left(\mathbf {u} _ {t}\right) + \sum_ {i = 1} ^ {N _ {r}} g _ {i, t} \mathrm{FFN} _ {i} ^ {(r)} \left(\mathbf {u} _ {t}\right), \tag{20}
$$

$$
g _ {i, t} = \left\{ \begin{array}{l l} s _ {i, t}, & s _ {i, t} \in \operatorname{Topk} (\{s _ {j, t} | 1 \leqslant j \leqslant N _ {r} \}, K _ {r}), \\ 0, & \text {otherwise}, \end{array} \right. \tag{21}
$$

$$
s _ {i, t} = \operatorname{Softmax} _ {i} \left(\mathbf {u} _ {t} ^ {T} \mathbf {e} _ {i}\right), \tag{22}
$$

where $N _ { s }$ and $N _ { r }$ denote the numbers of shared experts and routed experts, respectively; $\mathrm { F F N } _ { i } ^ { ( s ) } ( \cdot )$ and $\mathrm { F F N } _ { i } ^ { ( r ) } ( \cdot )$ denote the 𝑖-th shared expert and the 𝑖-th routed expert, respectively; $K _ { r }$ denotes the number of activated routed experts; $g _ { i , t }$ is the gate value for the 𝑖-th expert; $s _ { i , t }$ is the tokento-expert affinity; $\mathbf { e } _ { i }$ is the centroid of the 𝑖-th routed expert in this layer; and Topk(., 𝐾) denotes the set comprising 𝐾 highest scores among the affinity scores calculated for the 𝑡-th token and all routed experts.

$N_s$/$N_r$ 为共享/路由专家数; $K_r$ 为激活的路由专家数; $s_{i, t}$ 为 token–专家亲和度.

#### 2.2.2. Device-Limited Routing 设备受限路由

We design a device-limited routing mechanism to bound MoE-related communication costs. When expert parallelism is employed, the routed experts will be distributed across multiple devices. For each token, its MoE-related communication frequency is proportional to the number of devices covered by its target experts. Due to the fine-grained expert segmentation in DeepSeekMoE, the number of activated experts can be large, so the MoE-related communication will be more costly if we apply expert parallelism.

专家并行时, token 的通信开销正比于目标专家覆盖的设备数. 细粒度下激活专家多, 通信更贵.

<!-- page 10 of 52 -->

For DeepSeek-V2, beyond the naive top-K selection of routed experts, we additionally ensure that the target experts of each token will be distributed on at most 𝑀 devices. To be specific, for each token, we first select 𝑀 devices that have experts with the highest affinity scores in them. Then, we perform top-K selection among experts on these 𝑀 devices. In practice, we find that when $M \geqslant 3 , $ the device-limited routing can achieve a good performance roughly aligned with the unrestricted top-K routing.

V2 在 Top-K 之外再限制: 每个 token 的目标专家至多落在 $M$ 台设备. 先挑亲和度最高的 $M$ 台, 再只在其上做 Top-K. 实践中 $M\geqslant 3$ 时, 与无限制 Top-K 大致齐平.

解释: device-limited routing(设备受限路由)= 先选设备, 再选专家, 先把跨机通信的上界卡住, 避免细粒度 MoE 把 all-to-all 打爆.

#### 2.2.3. Auxiliary Loss for Load Balance 负载均衡辅助损失

We take the load balance into consideration for automatically learned routing strategies. Firstly, unbalanced load will raise the risk of routing collapse (Shazeer et al., 2017), preventing some experts being fully trained and utilized. Secondly, when expert parallelism is employed, unbalanced load will diminish computation efficiency. During the training of DeepSeek-V2, we design three kinds of auxiliary losses, for controlling expert-level load balance $( \mathcal { L } _ { \mathrm { E x p B a l } } )$ , device-level load balance $( \mathcal { L } _ { \mathrm { D e v B a l } } )$ , and communication balance $( \mathcal { L } _ { \mathrm { C o m m B a l } } )$ , respectively.

自动路由要管负载: 不均衡会路由塌缩, 专家并行时也会伤吞吐. V2 用三类辅助损失: 专家级, 设备级, 通信级.

**Expert-Level Balance Loss.** We use an expert-level balance loss (Fedus et al., 2021; Lepikhin et al., 2021) to mitigate the risk of routing collapse:

**专家级均衡损失**, 缓解路由塌缩:

$$
\mathcal {L} _ {\mathrm{ExpBal}} = \alpha_ {1} \sum_ {i = 1} ^ {N _ {r}} f _ {i} P _ {i}, \tag{23}
$$

$$
f _ {i} = \frac {N _ {r}}{K _ {r} T} \sum_ {t = 1} ^ {T} \mathbb {1} (\text {Token} t \text {selects Expert} i), \tag{24}
$$

$$
P _ {i} = \frac {1}{T} \sum_ {t = 1} ^ {T} s _ {i, t}, \tag{25}
$$

where $\alpha _ { 1 }$ is a hyper-parameter called expert-level balance factor; 1(.) denotes the indicator function; and 𝑇 denotes the number of tokens in a sequence.

$\alpha_1$ 为专家级均衡系数; $T$ 为序列 token 数.

**Device-Level Balance Loss.** In addition to the expert-level balance loss, we additionally design a device-level balance loss to ensure balanced computation across different devices. In the training process of DeepSeek-V2, we partition all routed experts into 𝐷 groups $\{ \mathcal { E } _ { 1 } , \mathcal { E } _ { 2 } , . . . , \mathcal { E } _ { D } \}$ and deploy each group on a single device. The device-level balance loss is computed as follows:

**设备级均衡损失**: 路由专家分成 $D$ 组, 每组一台设备:

$$
\mathcal {L} _ {\mathrm{DevBal}} = \alpha_ {2} \sum_ {i = 1} ^ {D} f _ {i} ^ {\prime} P _ {i} ^ {\prime}, \tag{26}
$$

$$
f _ {i} ^ {\prime} = \frac {1}{| \mathcal {E} _ {i} |} \sum_ {j \in \mathcal {E} _ {i}} f _ {j}, \tag{27}
$$

$$
\left| P _ {i} ^ {\prime} = \sum_ {j \in \mathcal {E} _ {i}} P _ {j}, \right. \tag{28}
$$

where $\alpha _ { 2 }$ is a hyper-parameter called device-level balance factor.

$\alpha_2$ 为设备级均衡系数.

**Communication Balance Loss.** Finally, we introduce a communication balance loss to ensure that the communication of each device is balanced. Although the device-limited routing mechanism guarantees that the sending communication of each device is bounded, if a certain device

**通信均衡损失**: 设备限路由只保证发送有上界; 若某台设备

<!-- page 11 of 52 -->

receives more tokens than other devices, the practical communication efficiency will also be affected. In order to mitigate this issue, we design a communication balance loss as follows:

收得特别多, 实际通信效率仍会差. 通信均衡损失如下:

$$
\mathcal {L} _ {\mathrm{CommBal}} = \alpha_ {3} \sum_ {i = 1} ^ {D} f _ {i} ^ {\prime \prime} P _ {i} ^ {\prime \prime}, \tag{29}
$$

$$
f _ {i} ^ {\prime \prime} = \frac {D}{M T} \sum_ {t = 1} ^ {T} \mathbb {1} (\text {Token} t \text {is sent to Device} i), \tag{30}
$$

$$
P _ {i} ^ {\prime \prime} = \sum_ {j \in \mathcal {E} _ {i}} P _ {j}, \tag{31}
$$

where $\alpha _ { 3 }$ is a hyper-parameter called communication balance factor. The device-limited routing mechanism operates on the principle of ensuring that each device transmits at most 𝑀𝑇 hidden states to other devices. Simultaneously, the communication balance loss is employed to encourage each device to receive around 𝑀𝑇 hidden states from other devices. The communication balance loss guarantees a balanced exchange of information among devices, promoting efficient communications.

$\alpha_3$ 为通信均衡系数. 设备限路由保证每台最多发出 $MT$ 个隐状态; 该损失鼓励每台大约也收到 $MT$ 个, 交换更匀.

#### 2.2.4. Token-Dropping Strategy Token 丢弃策略

While balance losses aim to encourage a balanced load, it is important to acknowledge that they cannot guarantee a strict load balance. In order to further mitigate the computation wastage caused by unbalanced load, we introduce a device-level token-dropping strategy during training. This approach first computes the average computational budget for each device, which means that the capacity factor for each device is equivalent to 1.0. Then, inspired by Riquelme et al. (2021), we drop tokens with the lowest affinity scores on each device until reaching the computational budget. In addition, we ensure that the tokens belonging to approximately 10% of the training sequences will never be dropped. In this way, we can flexibly decide whether to drop tokens during inference according to the efficiency requirements, and always ensure consistency between training and inference.

辅助损失保证不了严格均衡. 训练期再加设备级 token-dropping: 按容量因子 1.0 丢掉亲和度最低的 token; 约 10% 序列永不丢. 推理可按效率决定是否丢, 并保持训练/推理策略可对齐.

## 3. Pre-Training 预训练

### 3.1. Experimental Setups 实验设置

#### 3.1.1. Data Construction 数据构造

While maintaining the same data processing stages as for DeepSeek 67B (DeepSeek-AI, 2024), we extend the amount of data and elevate the data quality. In order to enlarge our pre-training corpus, we explore the potential of the internet data and optimize our cleaning processes, thus recovering a large amount of mistakenly deleted data. Moreover, we incorporate more Chinese data, aiming to better leverage the corpus available on the Chinese internet. In addition to the amount of data, we also focus on the data quality. We enrich our pre-training corpus with high-quality data from various sources, and meanwhile improve the quality-based filtering algorithm. The improved algorithm ensures that a large amount of non-beneficial data will be removed, while the valuable data will be mostly retained. In addition, we filter out the contentious content from our pre-training corpus to mitigate the data bias introduced from specific regional cultures. A detailed discussion about the influence of this filtering strategy is presented in Appendix E.

处理阶段跟 67B 相同, 但量更大, 质更严: 优化清洗以回收误删数据, 并显著增加中文; 多源高质量数据 + 更严质量过滤; 同时滤掉与特定地域文化强绑定的争议内容(影响讨论见附录 E).

<!-- page 12 of 52 -->

We adopt the same tokenizer as used in DeepSeek 67B, which is built based on the Byte-level Byte-Pair Encoding (BBPE) algorithm and has a vocabulary size of 100K. Our tokenized pre-training corpus contains 8.1T tokens, where Chinese tokens are approximately 12% more than English ones.

分词沿用 67B 的 100K BBPE. 分词后语料 8.1T, 中文 token 约比英文多 12%.

#### 3.1.2. Hyper-Parameters 超参数

**Model Hyper-Parameters.** We set the number of Transformer layers to 60 and the hidden dimension to 5120. All learnable parameters are randomly initialized with a standard deviation of 0.006. In MLA, we set the number of attention heads $n _ { h }$ to 128 and the per-head dimension $d _ { h }$ to 128. The KV compression dimension $d _ { c }$ is set to 512, and the query compression dimension $d _ { c } ^ { \prime }$ is set to 1536. For the decoupled queries and key, we set the per-head dimension $d _ { h } ^ { R }$ to 64. Following Dai et al. (2024), we substitute all FFNs except for the first layer with MoE layers. Each MoE layer consists of 2 shared experts and 160 routed experts, where the intermediate hidden dimension of each expert is 1536. Among the routed experts, 6 experts will be activated for each token. In addition, the low-rank compression and fine-grained expert segmentation will impact the output scale of a layer. Therefore, in practice, we employ additional RMS Norm layers after the compressed latent vectors, and multiply additional scaling factors at the width bottlenecks (i. e., the compressed latent vectors and the intermediate hidden states of routed experts) to ensure stable training. Under this configuration, DeepSeek-V2 comprises 236B total parameters, of which 21B are activated for each token.

**模型超参.** 60 层, 隐宽 5120, 初始化标准差 0.006. MLA: $n_h=128$, $d_h=128$, $d_c=512$, $d_c'=1536$, $d_h^R=64$. 除第 1 层外 FFN 换 MoE: 2 共享 + 160 路由, 专家中间宽 1536, 每 token 激活 6 个路由专家. 压缩潜变量后加 RMSNorm, 并在宽度瓶颈乘缩放因子以稳住训练. 配置下总参 236B, 激活 21B.

**Training Hyper-Parameters.** We employ the AdamW optimizer (Loshchilov and Hutter, 2017) with hyper-parameters set to $\beta _ { 1 } = 0 . 9 , \beta _ { 2 } = 0 . 9 5 , $ , and weight\_decay = 0.1. The learning rate is scheduled using a warmup-and-step-decay strategy (DeepSeek-AI, 2024). Initially, the learning rate linearly increases from 0 to the maximum value during the first 2K steps. Subsequently, the learning rate is multiplied by 0.316 after training about 60% of tokens, and again by 0.316 after training about 90% of tokens. The maximum learning rate is set to $2 . 4 \times 1 0 ^ { - 4 }$ , and the gradient clipping norm is set to 1.0. We also use a batch size scheduling strategy, where the batch size is gradually increased from 2304 to 9216 in the training of the first 225B tokens, and then keeps 9216 in the remaining training. We set the maximum sequence length to 4K, and train DeepSeek-V2 on 8.1T tokens. We leverage pipeline parallelism to deploy different layers of a model on different devices, and for each layer, the routed experts will be uniformly deployed on 8 devices (𝐷 = 8). As for the device-limited routing, each token will be sent to at most 3 devices (𝑀 = 3). As for balance losses, we set $\alpha _ { 1 }$ to 0.003, 𝛼2 to 0.05, and $\alpha _ { 3 }$ to 0.02. We employ the token-dropping strategy during training for acceleration, but do not drop any tokens for evaluation.

**训练超参.** AdamW: $\beta_1=0.9$, $\beta_2=0.95$, weight decay 0.1. 学习率 warmup 2K 到峰值 $2.4\times10^{-4}$, 约 60%/90% token 处各 ×0.316; 梯度裁剪 1.0. Batch 前 225B token 从 2304 爬到 9216, 其后固定; 序列 4K, 训满 8.1T. Pipeline 分多层; $D=8$ 均匀挂路由专家; $M=3$. $\alpha_1=0.003$, $\alpha_2=0.05$, $\alpha_3=0.02$. 训练用 token-dropping, 评测不丢.

#### 3.1.3. Infrastructures 基础设施

DeepSeek-V2 is trained based on the HAI-LLM framework (High-flyer, 2023), an efficient and light-weight training framework developed internally by our engineers. It employs a 16-way zero-bubble pipeline parallelism (Qi et al., 2023), an 8-way expert parallelism (Lepikhin et al., 2021), and ZeRO-1 data parallelism (Rajbhandari et al., 2020). Given that DeepSeek-V2 has relatively few activated parameters, and a portion of the operators are recomputed to save activation memory, it can be trained without the necessity of tensor parallelism, thereby decreasing the communication overhead. Moreover, in order to further improve the training efficiency, we overlap the computation of shared experts with the expert parallel all-to-all communication. We also customize faster CUDA kernels for communications, routing algorithms, and fused

HAI-LLM: 16-way zero-bubble pipeline, 8-way expert parallel, ZeRO-1. 激活参数少 + 部分算子重算, 可不做张量并行. 共享专家计算与专家并行 all-to-all 重叠; 通信, 路由与跨专家融合线性另写更快 CUDA kernel.

<!-- page 13 of 52 -->

Pressure Testing DeepSeek-V2 Base 128K Context via "Needle In A HayStack"

![Chart block](images/p13-figure-4-evaluation-results-on-the-needle-in-a-haystack.png)

Figure 4 | Evaluation results on the “Needle In A Haystack” (NIAH) tests. DeepSeek-V2 performs well across all context window lengths up to 128K.

图 4｜Needle-In-A-Haystack 结果. DeepSeek-V2 在直至 128K 的窗口上都表现稳定.

linear computations across different experts. In addition, MLA is also optimized based on an improved version of FlashAttention-2 (Dao, 2023).

MLA 侧基于改进版 FlashAttention-2.

We conduct all experiments on a cluster equipped with NVIDIA H800 GPUs. Each node in the H800 cluster contains 8 GPUs connected using NVLink and NVSwitch within nodes. Across nodes, InfiniBand interconnects are utilized to facilitate communications.

实验在 H800 集群: 节点内 8 卡 NVLink/NVSwitch, 跨节点 InfiniBand.

#### 3.1.4. Long Context Extension 长上下文扩展

After the initial pre-training of DeepSeek-V2, we employ YaRN (Peng et al., 2023) to extend the default context window length from 4K to 128K. YaRN was specifically applied to the decoupled shared key $\mathbf { k } _ { t } ^ { R }$ as it is responsible for carrying RoPE (Su et al., 2024). For YaRN, we set the scale 𝑠 to 40, 𝛼 to 1, $\beta$ to 32, and the target maximum context length to 160K. Under these settings, we can expect the model to respond well for a context length of 128K. Slightly diverging from original YaRN, due to our distinct attention mechanism, we adjust the length scaling factor to modulate the attention entropy. The factor √𝑡 is computed as $\sqrt { t } = 0 . 0 7 0 7 \ln { s } + 1 , $ , aiming at minimizing the perplexity.

预训练后用 YaRN 把默认窗口从 4K 扩到 128K, 只作用在承载 RoPE 的 $\mathbf{k}_t^R$: $s=40$, $\alpha=1$, $\beta=32$, 目标最大上下文 160K, 期望 128K 可用. 因注意力机制不同, 长度缩放取 $\sqrt{t}=0.0707\ln s+1$, 用来调注意力熵, 压低困惑度.

解释: YaRN = 一种 RoPE 长度外推方法, 通过插值/缩放旋转频率, 让模型在超过预训练窗口的上下文上仍能工作; V2 只把它打在解耦共享 key 上.

We additionally train the model for 1000 steps, with a sequence length of 32K and a batch size of 576 sequences. Although the training is conducted solely at the sequence length of 32K, the model still demonstrates robust performance when being evaluated at a context length of 128K. As shown in Figure 4, the results on the “Needle In A Haystack” (NIAH) tests indicate that DeepSeek-V2 performs well across all context window lengths up to 128K.

额外在 32K, batch 576 上训 1000 step; 尽管只在 32K 上做扩展训练, 128K 评测仍稳. 图 4 的 NIAH 显示直至 128K 全程可用.

### 3.2. Evaluations 评测

#### 3.2.1. Evaluation Benchmarks 评测基准

DeepSeek-V2 is pretrained on a bilingual corpus, so we evaluate it on a series of benchmarks in English and Chinese. Our evaluation is based on our internal evaluation framework integrated

双语预训练, 故中英多基准评测, 框架集成在

<!-- page 14 of 52 -->

in our HAI-LLM framework. Included benchmarks are categorized and listed as follows, where <u>underlined</u> benchmarks are in Chinese:

HAI-LLM 内. 分类如下(下划线为中文基准):

**Multi-subject multiple-choice** datasets include MMLU (Hendrycks et al., 2020), <u>C-Eval</u> (Huang et al., 2023), and <u>CMMLU</u> (Li et al., 2023).

**多学科选择**: MMLU, C-Eval, CMMLU.

**Language understanding and reasoning** datasets include HellaSwag (Zellers et al., 2019), PIQA (Bisk et al., 2020), ARC (Clark et al., 2018), and BigBench Hard (BBH) (Suzgun et al., 2022).

**语言理解与推理**: HellaSwag, PIQA, ARC, BBH.

**Closed-book question answering** datasets include TriviaQA (Joshi et al., 2017) and NaturalQuestions (Kwiatkowski et al., 2019).

**闭卷问答**: TriviaQA, NaturalQuestions.

**Reading comprehension** datasets include RACE Lai et al. (2017), DROP (Dua et al., 2019), C3 (Sun et al., 2019), and <u>CMRC</u> (Cui et al., 2019).

**阅读理解**: RACE, DROP, C3, CMRC.

**Reference disambiguation** datasets include WinoGrande Sakaguchi et al. (2019) and <u>CLUEWSC</u> (Xu et al., 2020).

**指代消歧**: WinoGrande, CLUEWSC.

**Language modeling** datasets include Pile (Gao et al., 2020).

**语言建模**: Pile.

**Chinese understanding and culture** datasets include <u>CHID</u> (Zheng et al., 2019) and <u>CCPM</u> (Li et al., 2021).

**中文理解与文化**: CHID, CCPM.

**Math** datasets include GSM8K (Cobbe et al., 2021), MATH (Hendrycks et al., 2021), and <u>CMath</u> (Wei et al., 2023).

**数学**: GSM8K, MATH, CMath.

**Code** datasets include HumanEval (Chen et al., 2021), MBPP (Austin et al., 2021), and CRUXEval (Gu et al., 2024).

**代码**: HumanEval, MBPP, CRUXEval.

**Standardized exams** include <u>AGIEval</u> (Zhong et al., 2023). Note that AGIEval includes both English and Chinese subsets.

**标准化考试**: AGIEval(含中英子集).

Following our previous work (DeepSeek-AI, 2024), we adopt perplexity-based evaluation for datasets including HellaSwag, PIQA, WinoGrande, RACE-Middle, RACE-High, MMLU, ARC-Easy, ARC-Challenge, CHID, C-Eval, CMMLU, C3, and CCPM, and adopt generationbased evaluation for TriviaQA, NaturalQuestions, DROP, MATH, GSM8K, HumanEval, MBPP, CRUXEval, BBH, AGIEval, CLUEWSC, CMRC, and CMath. In addition, we perform languagemodeling-based evaluation for Pile-test and use Bits-Per-Byte (BPB) as the metric to guarantee fair comparison among models with different tokenizers.

困惑度评测: HellaSwag, PIQA, WinoGrande, RACE, MMLU, ARC, CHID, C-Eval, CMMLU, C3, CCPM. 生成评测: TriviaQA, NaturalQuestions, DROP, MATH, GSM8K, HumanEval, MBPP, CRUXEval, BBH, AGIEval, CLUEWSC, CMRC, CMath. Pile-test 用 BPB, 方便不同分词器公平比.

For an intuitive overview of these benchmarks, we additionally provide our evaluation formats for each benchmark in Appendix G.

各基准评测格式见附录 G.

#### 3.2.2. Evaluation Results 评测结果

In Table 2, we compare DeepSeek-V2 with several representative open-source models, including DeepSeek 67B (DeepSeek-AI, 2024) (our previous release), Qwen1.5 72B (Bai et al., 2023), LLaMA3 70B (AI@Meta, 2024), and Mixtral 8x22B (Mistral, 2024). We evaluate all these models with our internal evaluation framework, and ensure that they share the same evaluation setting. Overall, with only 21B activated parameters, DeepSeek-V2 significantly outperforms DeepSeek 67B on almost all benchmarks, and achieves top-tier performance among open-source models.

Table 2 对照 67B, Qwen1.5 72B, LLaMA3 70B, Mixtral 8x22B, 同一内部框架与设定. 仅激活 21B, V2 几乎全面超过 67B, 并进开源第一梯队.

Further, we elaborately compare DeepSeek-V2 with its open-source counterparts one by one. (1) Compared with Qwen1.5 72B, another model that supports both Chinese and English, DeepSeek-V2 demonstrates overwhelming advantages on the majority of English, code, and math benchmarks. As for Chinese benchmarks, Qwen1.5 72B shows better performance on

逐家对比: (1) 相对同为中英的 Qwen1.5 72B, 英文/代码/数学多数项 V2 更强; 中文上 Qwen 在

<!-- page 15 of 52 -->

<table><tr><td></td><td>Benchmark (Metric)</td><td># Shots</td><td>DeepSeek 67B</td><td>Qwen1.5 72B</td><td>Mixtral 8x22B</td><td>LLaMA 3 70B</td><td>DeepSeek-V2</td></tr><tr><td rowspan="3"></td><td>Architecture</td><td>-</td><td>Dense</td><td>Dense</td><td>MoE</td><td>Dense</td><td>MoE</td></tr><tr><td># Activated Params</td><td>-</td><td>67B</td><td>72B</td><td>39B</td><td>70B</td><td>21B</td></tr><tr><td># Total Params</td><td>-</td><td>67B</td><td>72B</td><td>141B</td><td>70B</td><td>236B</td></tr><tr><td rowspan="14">English</td><td>Pile-test (BPB)</td><td>-</td><td>0.642</td><td>0.637</td><td>0.623</td><td>0.602</td><td>0.606</td></tr><tr><td>BBH (EM)</td><td>3-shot</td><td>68.7</td><td>59.9</td><td>78.9</td><td>81.0</td><td>78.9</td></tr><tr><td>MMLU (Acc.)</td><td>5-shot</td><td>71.3</td><td>77.2</td><td>77.6</td><td>78.9</td><td>78.5</td></tr><tr><td>DROP (F1)</td><td>3-shot</td><td>69.7</td><td>71.5</td><td>80.4</td><td>82.5</td><td>80.1</td></tr><tr><td>ARC-Easy (Acc.)</td><td>25-shot</td><td>95.3</td><td>97.1</td><td>97.3</td><td>97.9</td><td>97.6</td></tr><tr><td>ARC-Challenge (Acc.)</td><td>25-shot</td><td>86.4</td><td>92.8</td><td>91.2</td><td>93.3</td><td>92.4</td></tr><tr><td>HellaSwag (Acc.)</td><td>10-shot</td><td>86.3</td><td>85.8</td><td>86.6</td><td>87.9</td><td>84.2</td></tr><tr><td>PIQA (Acc.)</td><td>0-shot</td><td>83.6</td><td>83.3</td><td>83.6</td><td>85.0</td><td>83.7</td></tr><tr><td>WinoGrande (Acc.)</td><td>5-shot</td><td>84.9</td><td>82.4</td><td>83.7</td><td>85.7</td><td>84.9</td></tr><tr><td>RACE-Middle (Acc.)</td><td>5-shot</td><td>69.9</td><td>63.4</td><td>73.3</td><td>73.3</td><td>73.1</td></tr><tr><td>RACE-High (Acc.)</td><td>5-shot</td><td>50.7</td><td>47.0</td><td>56.7</td><td>57.9</td><td>52.7</td></tr><tr><td>TriviaQA (EM)</td><td>5-shot</td><td>78.9</td><td>73.1</td><td>82.1</td><td>81.6</td><td>79.9</td></tr><tr><td>NaturalQuestions (EM)</td><td>5-shot</td><td>36.6</td><td>35.6</td><td>39.6</td><td>40.2</td><td>38.7</td></tr><tr><td>AGIEval (Acc.)</td><td>0-shot</td><td>41.3</td><td>64.4</td><td>43.4</td><td>49.8</td><td>51.2</td></tr><tr><td rowspan="4">Code</td><td>HumanEval (Pass@1)</td><td>0-shot</td><td>45.1</td><td>43.9</td><td>53.1</td><td>48.2</td><td>48.8</td></tr><tr><td>MBPP (Pass@1)</td><td>3-shot</td><td>57.4</td><td>53.6</td><td>64.2</td><td>68.6</td><td>66.6</td></tr><tr><td>CRUXEval-I (Acc.)</td><td>2-shot</td><td>42.5</td><td>44.3</td><td>52.4</td><td>49.4</td><td>52.8</td></tr><tr><td>CRUXEval-O (Acc.)</td><td>2-shot</td><td>41.0</td><td>42.3</td><td>52.8</td><td>54.3</td><td>49.8</td></tr><tr><td rowspan="3">Math</td><td>GSM8K (EM)</td><td>8-shot</td><td>63.4</td><td>77.9</td><td>80.3</td><td>83.0</td><td>79.2</td></tr><tr><td>MATH (EM)</td><td>4-shot</td><td>18.7</td><td>41.4</td><td>42.5</td><td>42.2</td><td>43.6</td></tr><tr><td>CMath (EM)</td><td>3-shot</td><td>63.0</td><td>77.8</td><td>72.3</td><td>73.9</td><td>78.7</td></tr><tr><td rowspan="7">Chinese</td><td>CLUEWSC (EM)</td><td>5-shot</td><td>81.0</td><td>80.5</td><td>77.5</td><td>78.3</td><td>82.2</td></tr><tr><td>C-Eval (Acc.)</td><td>5-shot</td><td>66.1</td><td>83.7</td><td>59.6</td><td>67.5</td><td>81.7</td></tr><tr><td>CMMLU (Acc.)</td><td>5-shot</td><td>70.8</td><td>84.3</td><td>60.0</td><td>69.3</td><td>84.0</td></tr><tr><td>CMRC (EM)</td><td>1-shot</td><td>73.4</td><td>66.6</td><td>73.1</td><td>73.3</td><td>77.5</td></tr><tr><td>C3 (Acc.)</td><td>0-shot</td><td>75.3</td><td>78.2</td><td>71.4</td><td>74.0</td><td>77.4</td></tr><tr><td>CHID (Acc.)</td><td>0-shot</td><td>92.1</td><td>-</td><td>57.0</td><td>83.2</td><td>92.7</td></tr><tr><td>CCPM (Acc.)</td><td>0-shot</td><td>88.5</td><td>88.1</td><td>61.0</td><td>68.1</td><td>93.1</td></tr></table>

Table 2 | Comparison among DeepSeek-V2 and other representative open-source models. All models are evaluated in our internal framework and share the same evaluation setting. Bold denotes the best and underline denotes the second-best. Scores with a gap smaller than 0.3 are regarded as at the same level. With only 21B activated parameters, DeepSeek-V2 achieves top-tier performance among open-source models.

表 2｜DeepSeek-V2 与代表开源模型对照(同一内部框架). 粗体最优, 下划线次优; 差距 <0.3 视为同级. 仅激活 21B 仍进开源第一梯队.

multi-subject multiple-choice tasks while DeepSeek-V2 is comparable or better on others. Note that for the CHID benchmark, the tokenizer of Qwen1.5 72B will encounter errors in our evaluation framework, so we leave the CHID score blank for Qwen1.5 72B. (2) Compared with Mixtral 8x22B, DeepSeek-V2 achieves comparable or better English performance, except for TriviaQA, NaturalQuestions, and HellaSwag, which are closely related to English commonsense knowledge. Notably, DeepSeek-V2 outperforms Mixtral 8x22B on MMLU. On code and math benchmarks, DeepSeek-V2 demonstrates comparable performance with Mixtral 8x22B. Since Mixtral 8x22B is not specifically trained on Chinese data, its Chinese capability lags far behind DeepSeek-V2. (3) Compared with LLaMA3 70B, DeepSeek-V2 is trained on fewer than a quarter of English tokens. Therefore, we acknowledge that DeepSeek-V2 still has a slight gap in basic English capabilities with LLaMA3 70B. However, even with much fewer training tokens and activated parameters, DeepSeek-V2 still demonstrates comparable code and math capability with LLaMA3

多学科选择更好, 其余中文项 V2 可比或更好; Qwen 在其框架跑 CHID 会因分词报错, 表中留空. (2) 相对 Mixtral 8x22B: 英文大体打平或更好, 例外是 TriviaQA/NaturalQuestions/HellaSwag; MMLU 上 V2 反超; 代码与数学可比; 中文 Mixtral 明显落后. (3) 相对 LLaMA3 70B: 英文预训练 token 不到其四分之一, 基础英文仍有小缺口; 但激活更少, 数据更少的情况下, 代码与数学已可比.

<!-- page 16 of 52 -->

70B. Also, as a bilingual language model, DeepSeek-V2 outperforms LLaMA3 70B overwhelmingly on Chinese benchmarks.

中文则全面占优.

Finally, it is worth mentioning that certain prior studies (Hu et al., 2024) incorporate SFT data during the pre-training stage, whereas DeepSeek-V2 has never been exposed to SFT data during pre-training.

另: 部分工作预训练会塞 SFT 数据; V2 预训练从未见过 SFT 数据.

#### 3.2.3. Training and Inference Efficiency 训练与推理效率

**Training Costs.** Since DeepSeek-V2 activates fewer parameters for each token and requires fewer FLOPs than DeepSeek 67B, training DeepSeek-V2 will be more economical than training DeepSeek 67B theoretically. Although training an MoE model will introduce additional communication overheads, through our operator and communication optimizations, the training for DeepSeek-V2 can attain a relatively high Model FLOPs Utilization (MFU). During our practical training on the H800 cluster, for training on each trillion tokens, DeepSeek 67B requires 300.6K GPU hours, while DeepSeek-V2 needs only 172.8K GPU hours, i. e., sparse DeepSeek-V2 can save 42.5% training costs compared with dense DeepSeek 67B.

**训练成本.** 每 token 激活更少, FLOPs 更少, 理论上更省. MoE 有额外通信, 但经算子与通信优化后 MFU 仍较高. H800 上每训 1T token: 67B 要 300.6K GPU 小时, V2 要 172.8K, 省 42.5%.

**Inference Efficiency.** In order to efficiently deploy DeepSeek-V2 for service, we first convert its parameters into the precision of FP8. In addition, we also perform KV cache quantization (Hooper et al., 2024; Zhao et al., 2023) for DeepSeek-V2 to further compress each element in its KV cache into 6 bits on average. Benefiting from MLA and these optimizations, actually deployed DeepSeek-V2 requires significantly less KV cache than DeepSeek 67B, and thus can serve a much larger batch size. We evaluate the generation throughput of DeepSeek-V2 based on the prompt and generation length distribution from the actually deployed DeepSeek 67B service. On a single node with 8 H800 GPUs, DeepSeek-V2 achieves a generation throughput exceeding 50K tokens per second, which is 5.76 times the maximum generation throughput of DeepSeek 67B. In addition, the prompt input throughput of DeepSeek-V2 exceeds 100K tokens per second.

**推理效率.** 权重转 FP8, KV 元素平均压到约 6 bit. MLA + 量化后 KV 远小于 67B, 可撑更大 batch. 按线上 67B 服务的 prompt/生成长度分布测: 单节点 8×H800 生成吞吐 >50K token/s, 为 67B 最大生成吞吐的 5.76 倍; prompt 吞吐 >100K token/s.

## 4. Alignment 对齐

### 4.1. Supervised Fine-Tuning 监督微调

Building upon our prior research (DeepSeek-AI, 2024), we curate our instruction tuning datasets to include 1.5M instances, comprising 1.2M instances for helpfulness and 0.3M instances for safety. In comparison to the initial version, we improve the data quality to mitigate hallucinatory responses and enhance writing proficiency. We fine-tune DeepSeek-V2 with 2 epochs, and the learning rate is set to $5 \times 1 0 ^ { - \tilde { 6 } }$ . For the evaluation of DeepSeek-V2 Chat (SFT), we mainly include generation-based benchmarks, except for several representative multiple-choice tasks (MMLU and ARC). We also conduct an instruction-following evaluation (IFEval) (Zhou et al., 2023) for DeepSeek-V2 Chat (SFT), using prompt-level loose accuracy as the metric. Moreover, we employ LiveCodeBench (Jain et al., 2024) questions from September 1st, 2023 to April 1st, 2024 to evaluate chat models. In addition to the standard benchmarks, we further evaluate our model on open-ended conversation benchmarks including MT-Bench (Zheng et al., 2023), AlpacaEval 2.0 (Dubois et al., 2024), and AlignBench (Liu et al., 2023). For comparison, we also evaluate Qwen1.5 72B Chat, LLaMA-3-70B Instruct, and Mistral-8x22B Instruct in our evaluation framework and settings. As for DeepSeek 67B Chat, we directly refer to the evaluation results reported in our previous release.

指令数据 1.5M: helpfulness 1.2M, safety 0.3M; 相对初版提高质量, 压幻觉, 抬写作. 微调 2 epoch, lr $5\times10^{-6}$. Chat (SFT) 以生成基准为主, 保留 MMLU/ARC; 另做 IFEval(prompt-level loose accuracy)与 2023-09-01 至 2024-04-01 的 LiveCodeBench; 开放对话用 MT-Bench, AlpacaEval 2.0, AlignBench. 对照含 Qwen1.5 72B Chat, LLaMA-3-70B Instruct, Mistral-8x22B Instruct; 67B Chat 引用前作数字.

<!-- page 17 of 52 -->

### 4.2. Reinforcement Learning 强化学习

In order to further unlock the potential of DeepSeek-V2 and align it with human preference, we conduct Reinforcement Learning (RL) to adjust its preference.

为进一步释放潜力并对齐人类偏好, 做 RL.

**Reinforcement Learning Algorithm.** In order to save the training costs of $\mathbb { R L } , $ we adopt Group Relative Policy Optimization (GRPO) (Shao et al., 2024), which foregoes the critic model that is typically with the same size as the policy model, and estimates the baseline from group scores instead. Specifically, for each question 𝑞, GRPO samples a group of outputs $\{ o _ { 1 } , o _ { 2 } , \cdots , o _ { G } \}$ from the old policy $\pi _ { \theta _ { o l d } }$ and then optimizes the policy model 𝜋𝜃 by maximizing the following objective:

**算法.** 为省 RL 成本, 用 GRPO: 丢掉与策略同规模的 critic, 改用组内分数估基线. 对每个问题 $q$, 从旧策略采样一组输出, 优化目标为:

$$
\left. \begin{array}{l}\mathcal {J} _ {G R P O} (\theta) = \mathbb {E} [ q \sim P (Q), \{o _ {i} \} _ {i = 1} ^ {G} \sim \pi_ {\theta_ {o l d}} (O | q) ] \\ \frac {1}{G} \sum_ {i = 1} ^ {G} \left(\min \left(\frac {\pi_ {\theta} (o _ {i} | q)}{\pi_ {\theta_ {o l d}} (o _ {i} | q)} A _ {i}, \mathrm{clip} \left(\frac {\pi_ {\theta} (o _ {i} | q)}{\pi_ {\theta_ {o l d}} (o _ {i} | q)}, 1 - \varepsilon , 1 + \varepsilon\right) A _ {i}\right) - \beta \mathbb {D} _ {K L} \left(\pi_ {\theta} | | \pi_ {r e f}\right)\right), \\ \end{array} \right|\tag{32}
$$

$$
\mathbb {D} _ {K L} \left(\pi_ {\theta} | | \pi_ {r e f}\right) = \frac {\pi_ {r e f} (o _ {i} | q)}{\pi_ {\theta} (o _ {i} | q)} - \log \frac {\pi_ {r e f} (o _ {i} | q)}{\pi_ {\theta} (o _ {i} | q)} - 1, \tag{33}
$$

where 𝜀 and $\beta$ are hyper-parameters; and $A _ { i }$ is the advantage, computed using a group of rewards $\{ r _ { 1 } , r _ { 2 } , \cdots , r _ { G } \}$ corresponding to the outputs within each group:

$\varepsilon, \beta$ 为超参; 优势 $A_i$ 由组内奖励算:

$$
A _ {i} = \frac {r _ {i} - \text {mean} (\{r _ {1} , r _ {2} , \cdots , r _ {G} \})}{\text {std} (\{r _ {1} , r _ {2} , \cdots , r _ {G} \})}. \tag{34}
$$

**Training Strategy.** In our preliminary experiments, we find that the RL training on reasoning data, such as code and math prompts, exhibits unique characteristics that are distinct from the training on general data. For example, the mathematical and coding abilities of our model can keep improving over a longer period of training steps. Therefore, we employ a two-stage RL training strategy, which first performs reasoning alignment, and then performs human preference alignment. In the first reasoning alignment stage, we train a reward model $R M _ { r e a s o n i n g }$ for code and math reasoning tasks, and optimize the policy model with the feedback of $R M _ { r }$ <sub>𝑟𝑒𝑎𝑠𝑜𝑛𝑖𝑛𝑔</sub>:

**训练策略.** 预实验发现: 代码/数学等推理数据上的 RL, 与通用数据习性不同-- 数学与代码能力可在更长步数里持续爬升. 故两阶段: 先推理对齐, 再人类偏好对齐. 第一阶段用 $RM_{\mathrm{reasoning}}$:

$$
r _ {i} = R M _{\text {reasoning}} (o _ {i}). \tag{35}
$$

In the second human preference alignment stage, we adopt a multi-reward framework, which acquires rewards from a helpful reward model $R M _ { h e l p f u l . }$ , a safety reward model $R M _ { s a f e t y }$ , and a rule-based reward model $R M _ { r u l e }$ . The final reward of a response $o _ { i }$ is

第二阶段多奖励: helpful / safety / rule:

$$
r _ {i} = c _ {1} \cdot R M _{h e l p f u l} (o _ {i}) + c _ {2} \cdot R M _{s a f e t y} (o _ {i}) + c _ {3} \cdot R M _{r u l e} (o _ {i}), \tag{36}
$$

where $c _ { 1 } ,   c _ { 2 }$ , and $c _ { 3 }$ are corresponding coefficients.

$c_1, c_2, c_3$ 为系数.

In order to obtain reliable reward models that play crucial roles in the RL training, we carefully collect preference data, and meticulously conduct quality filtering and proportion adjustments. We obtain code preference data based on compiler-feedback, and mathematical preference data based on the ground-truth labels. For reward model training, we initialize the reward models with DeepSeek-V2 Chat (SFT) and train them with either a point-wise or a pair-wise loss. In our experiments, we observe that the RL training can fully tap into and activate the potential of our model, enabling it to select the correct and satisfactory answer from possible responses.

偏好数据经质量过滤与配比; 代码靠编译器反馈, 数学靠标准答案. 奖励模型由 Chat (SFT) 初始化, point-wise 或 pair-wise 损失. 实验观察到 RL 能把模型潜力挖出来, 在多种可能回答里选出正确且令人满意的.

<!-- page 18 of 52 -->

**Optimizations for Training Efficiency.** Conducting RL training on extremely large models places high demands on the training framework. It requires careful engineering optimization to manage the GPU memory and RAM pressure, and meanwhile maintain a fast training speed. For this goal, we implement the following engineering optimizations. (1) Firstly, we propose a hybrid engine that adopts different parallel strategies for training and inference respectively to achieve higher GPU utilization. (2) Secondly, we leverage vLLM (Kwon et al., 2023) with large batch sizes as our inference backend to accelerate the inference speed. (3) Thirdly, we carefully design a scheduling strategy for offloading models to CPUs and loading models back to GPUs, which achieves a near-optimal balance between the training speed and memory consumption.

**训练效率工程.**(1) 训练与推理用不同并行策略的混合引擎; (2) vLLM 大 batch 加速采样; (3) CPU offload/回载调度, 在速度与显存间找近优平衡.

### 4.3. Evaluation Results 评测结果

**Evaluations on Standard Benchmarks.** Initially, we evaluate DeepSeek-V2 Chat (SFT) and DeepSeek-V2 Chat (RL) on standard benchmarks. Notably, DeepSeek-V2 Chat (SFT) demonstrates substantial improvements in GSM8K, MATH, and HumanEval evaluations compared with its base version. This progress can be attributed to the inclusion of our SFT data, which comprises a considerable volume of math and code related content. In addition, DeepSeek-V2 Chat (RL) further boosts the performance on math and code benchmarks. We show more code and math evaluations in Appendix F.

**标准基准.** Chat (SFT) 相对 base 在 GSM8K/MATH/HumanEval 上大幅提升, 与 SFT 中大量数学与代码有关; Chat (RL) 再抬数学与代码. 更多见附录 F.

As for the comparisons with other models, we first compare DeepSeek-V2 Chat (SFT) with Qwen1.5 72B Chat, and find that DeepSeek-V2 Chat (SFT) surpasses Qwen1.5 72B Chat on almost all of English, math, and code benchmarks. On Chinese benchmarks, DeepSeek-V2 Chat (SFT) demonstrates slightly lower scores than Qwen1.5 72B Chat on multi-subject multiple-choice tasks, consistent with the performance observed from their base versions. When compared with the state-of-the-art open-source MoE model, Mixtral 8x22B Instruct, DeepSeek-V2 Chat (SFT) exhibits better performance on most benchmarks, except for NaturalQuestions and IFEval. Furthermore, in comparison to the state-of-the-art open-source model LLaMA3 70B Chat, DeepSeek-V2 Chat (SFT) shows similar performance in code and math related benchmarks. LLaMA3 70B Chat exhibits better performance on MMLU and IFEval, while DeepSeek-V2 Chat (SFT) showcases stronger performance on Chinese tasks. Ultimately, DeepSeek-V2 Chat (RL) demonstrates further enhanced performance in both mathematical and coding tasks compared with DeepSeek-V2 Chat (SFT). These comparisons highlight the strengths of DeepSeek-V2 Chat in relation to other language models in various domains and languages.

相对 Qwen1.5 72B Chat: 英/数/码几乎全面领先, 中文多学科选择略低(与 base 一致). 相对 Mixtral 8x22B Instruct: 多数更好, 例外 NaturalQuestions 与 IFEval. 相对 LLaMA3 70B Chat: 代码与数学相近, 对方 MMLU/IFEval 更好, V2 中文更强. Chat (RL) 相对 SFT 再抬数学与代码.

**Evaluations on Open-Ended Generation.** We proceed with additional evaluations of our models on open-ended conversation benchmarks. For English open-ended conversation generation, we utilize MT-Bench and AlpacaEval 2.0 as the benchmarks. Evaluation results presented in Table 4 demonstrate a significant performance advantage of DeepSeek-V2 Chat (RL) over DeepSeek-V2 Chat (SFT). This outcome showcases the effectiveness of our RL training in achieving improved alignment. In comparison to other open-source models, DeepSeek-V2 Chat (RL) demonstrates superior performance over Mistral 8x22B Instruct and Qwen1.5 72B Chat on both benchmarks. When compared with LLaMA3 70B Instruct, DeepSeek-V2 Chat (RL) showcases competitive performance on MT-Bench and notably outperforms it on AlpacaEval 2.0. These results highlight the strong performance of DeepSeek-V2 Chat (RL) in generating high-quality and contextually relevant responses, particularly in instruction-based conversation tasks.

**开放生成.** 英文用 MT-Bench 与 AlpacaEval 2.0(Table 4): RL 明显强过 SFT; 相对 Mistral 8x22B Instruct 与 Qwen1.5 72B Chat 双双领先; 相对 LLaMA3 70B Instruct, MT-Bench 可比, AlpacaEval 2.0 明显更好.

In addition, we evaluate the Chinese open-ended generation capability based on AlignBench. As presented in Table 5, DeepSeek-V2 Chat (RL) exhibits a slight advantage over DeepSeek-V2 Chat (SFT). Notably, DeepSeek-V2 Chat (SFT) surpasses all open-source Chinese models by a significant margin. It significantly outperforms the second-best open-source model, Qwen1.5

中文开放生成用 AlignBench(Table 5): RL 略好于 SFT; SFT 已大幅超过全部开源中文模型, 并明显强过次优开源 Qwen1.5

<!-- page 19 of 52 -->

<table><tr><td></td><td>Benchmark</td><td># Shots</td><td>DeepSeek 67B Chat</td><td>Qwen 1.5 LLaMA3 72B Chat</td><td>LLaMA3 70B Inst. </td><td>Mixtral 8x22B Inst. </td><td>DeepSeek-V2 Chat (SFT)</td><td>DeepSeek-V2 Chat (RL)</td></tr><tr><td rowspan="4"></td><td>Context Length</td><td>-</td><td>4K</td><td>32K</td><td>8K</td><td>64K</td><td>128K</td><td>128K</td></tr><tr><td>Architecture</td><td>-</td><td>Dense</td><td>Dense</td><td>Dense</td><td>MoE</td><td>MoE</td><td>MoE</td></tr><tr><td># Activated Params</td><td>-</td><td>67B</td><td>72B</td><td>70B</td><td>39B</td><td>21B</td><td>21B</td></tr><tr><td># Total Params</td><td>-</td><td>67B</td><td>72B</td><td>70B</td><td>141B</td><td>236B</td><td>236B</td></tr><tr><td rowspan="8">English</td><td>TriviaQA</td><td>5-shot</td><td>81.5</td><td>79.6</td><td>69.1</td><td>80.0</td><td>85.4</td><td>86.7</td></tr><tr><td>NaturalQuestions</td><td>5-shot</td><td>47.0</td><td>46.9</td><td>44.6</td><td>54.9</td><td>51.9</td><td>53.4</td></tr><tr><td>MMLU</td><td>5-shot</td><td>71.1</td><td>76.2</td><td>80.3</td><td>77.8</td><td>78.4</td><td>77.8</td></tr><tr><td>ARC-Easy</td><td>25-shot</td><td>96.6</td><td>96.8</td><td>96.9</td><td>97.1</td><td>97.6</td><td>98.1</td></tr><tr><td>ARC-Challenge</td><td>25-shot</td><td>88.9</td><td>91.7</td><td>92.6</td><td>90.0</td><td>92.5</td><td>92.3</td></tr><tr><td>BBH</td><td>3-shot</td><td>71.7</td><td>65.9</td><td>80.1</td><td>78.4</td><td>81.3</td><td>79.7</td></tr><tr><td>AGIEval</td><td>0-shot</td><td>46.4</td><td>62.8</td><td>56.6</td><td>41.4</td><td>63.2</td><td>61.4</td></tr><tr><td>IFEval</td><td>0-shot</td><td>55.5</td><td>57.3</td><td>79.7</td><td>72.1</td><td>64.1</td><td>63.8</td></tr><tr><td rowspan="5">Code</td><td>HumanEval</td><td>0-shot</td><td>73.8</td><td>68.9</td><td>76.2</td><td>75.0</td><td>76.8</td><td>81.1</td></tr><tr><td>MBPP</td><td>3-shot</td><td>61.4</td><td>52.2</td><td>69.8</td><td>64.4</td><td>70.4</td><td>72.0</td></tr><tr><td>CRUXEval-I-COT</td><td>2-shot</td><td>49.1</td><td>51.4</td><td>61.1</td><td>59.4</td><td>59.5</td><td>61.5</td></tr><tr><td>CRUXEval-O-COT</td><td>2-shot</td><td>50.9</td><td>56.5</td><td>63.6</td><td>63.6</td><td>60.7</td><td>63.0</td></tr><tr><td>LiveCodeBench</td><td>0-shot</td><td>18.3</td><td>18.8</td><td>30.5</td><td>25.0</td><td>28.7</td><td>32.5</td></tr><tr><td rowspan="3">Math</td><td>GSM8K</td><td>8-shot</td><td>84.1</td><td>81.9</td><td>93.2</td><td>87.9</td><td>90.8</td><td>92.2</td></tr><tr><td>MATH</td><td>4-shot</td><td>32.6</td><td>40.6</td><td>48.5</td><td>49.8</td><td>52.7</td><td>53.9</td></tr><tr><td>CMath</td><td>0-shot</td><td>80.3</td><td>82.8</td><td>79.2</td><td>75.1</td><td>82.0</td><td>81.9</td></tr><tr><td rowspan="3">Chinese</td><td>CLUEWSC</td><td>5-shot</td><td>78.5</td><td>90.1</td><td>85.4</td><td>75.8</td><td>88.6</td><td>89.9</td></tr><tr><td>C-Eval</td><td>5-shot</td><td>65.2</td><td>82.2</td><td>67.9</td><td>60.0</td><td>80.9</td><td>78.0</td></tr><tr><td>CMMLU</td><td>5-shot</td><td>67.8</td><td>82.9</td><td>70.7</td><td>61.0</td><td>82.4</td><td>81.6</td></tr></table>

Table 3 | Comparison among DeepSeek-V2 Chat (SFT), DeepSeek-V2 Chat (RL), and other representative open-source chat models. Regarding TriviaQA and NaturalQuestions, it is worth noting that chat models, such as LLaMA3 70B Instruct, might not strictly adhere to the format constraints typically specified in the few-shot setting. Consequently, this can lead to underestimation of certain models in our evaluation framework.

表 3｜Chat (SFT)/(RL) 与代表开源 Chat 对照. TriviaQA/NaturalQuestions 上, 部分 Chat(如 LLaMA3 70B Instruct)未必严格遵守 few-shot 格式约束, 内部框架可能低估.

| Model | MT-Bench | AlpacaEval 2.0 |
| --- | --- | --- |
| DeepSeek 67B Chat | 8.35 | 16.6 |
| Mistral 8x22B Instruct v0.1 | 8.66 | 30.9 |
| Qwen1.5 72B Chat | 8.61 | 36.6 |
| LLaMA3 70B Instruct | 8.95 | 34.4 |
| DeepSeek-V2 Chat (SFT) | 8.62 | 30.0 |
| DeepSeek-V2 Chat (RL) | 8.97 | 38.9 |

Table 4 | English open-ended conversation evaluations. For AlpacaEval 2.0, we use the lengthcontrolled win rate as the metric.

表 4｜英文开放对话. AlpacaEval 2.0 用长度控制胜率.

72B Chat on both Chinese reasoning and language. Moreover, both DeepSeek-V2 Chat (SFT) and DeepSeek-V2 Chat (RL) outperform GPT-4-0613 and ERNIEBot 4.0, solidifying the position of our models in the top-tier LLMs that support Chinese. Specifically, DeepSeek-V2 Chat (RL) shows remarkable performance in Chinese language understanding, which outperforms all models including GPT-4-Turbo-1106-Preview. On the other hand, the reasoning capability of DeepSeek-V2 Chat (RL) still lags behind giant models, such as Erniebot-4.0 and GPT-4s.

72B Chat 的中文推理与语言. SFT 与 RL 均超过 GPT-4-0613 与 ERNIEBot 4.0, 跻身支持中文的第一梯队. RL 的中文理解甚至压过含 GPT-4-Turbo-1106-Preview 在内的全部对照; 推理仍落后 Erniebot-4.0 与 GPT-4 系.

<!-- page 20 of 52 -->

<table><tbody><tr><td rowspan=「2」>Model模型</td><td rowspan=「2」>Overall总分</td><td colspan=「4」>Reasoning中文推理</td><td colspan=「6」>Language中文语言</td></tr><tr><td>Avg. 推理总分</td><td>Math. 数学计算</td><td>Logi. 逻辑推理</td><td>Avg. 语言总分</td><td>Fund. 基本任务</td><td>Chi. 中文理解</td><td>Open. 综合问答</td><td>Writ. 文本写作</td><td>Role. 角色扮演</td><td>Pro. 专业能力</td></tr><tr><td>GPT-4-1106-Preview</td><td>8.01</td><td>7.73</td><td>7.80</td><td>7.66</td><td>8.29</td><td>7.99</td><td>7.33</td><td>8.61</td><td>8.67</td><td>8.47</td><td>8.65</td></tr><tr><td>DeepSeek-V2 Chat (RL)</td><td>7.91</td><td>7.45</td><td>7.77</td><td>7.14</td><td>8.36</td><td>8.10</td><td>8.28</td><td>8.37</td><td>8.53</td><td>8.33</td><td>8.53</td></tr><tr><td>ERNIEBot-4.0-202404*(文心一言)</td><td>7.89</td><td>7.61</td><td>7.81</td><td>7.41</td><td>8.17</td><td>7.56</td><td>8.53</td><td>8.13</td><td>8.45</td><td>8.24</td><td>8.09</td></tr><tr><td>DeepSeek-V2 Chat (SFT)</td><td>7.74</td><td>7.30</td><td>7.34</td><td>7.26</td><td>8.17</td><td>8.04</td><td>8.26</td><td>8.13</td><td>8.00</td><td>8.10</td><td>8.49</td></tr><tr><td>GPT-4-0613</td><td>7.53</td><td>7.47</td><td>7.56</td><td>7.37</td><td>7.59</td><td>7.81</td><td>6.93</td><td>7.42</td><td>7.93</td><td>7.51</td><td>7.94</td></tr><tr><td>ERNIEBot-4.0-202312*(文心一言)</td><td>7.36</td><td>6.84</td><td>7.00</td><td>6.67</td><td>7.88</td><td>7.47</td><td>7.88</td><td>8.05</td><td>8.19</td><td>7.84</td><td>7.85</td></tr><tr><td>Moonshot-v1-32k-202404*(月之暗面)</td><td>7.22</td><td>6.42</td><td>6.41</td><td>6.43</td><td>8.02</td><td>7.82</td><td>7.58</td><td>8.00</td><td>8.22</td><td>8.19</td><td>8.29</td></tr><tr><td>Qwen1.5-72B-Chat*</td><td>7.19</td><td>6.45</td><td>6.58</td><td>6.31</td><td>7.93</td><td>7.38</td><td>7.77</td><td>8.15</td><td>8.02</td><td>8.05</td><td>8.24</td></tr><tr><td>DeepSeek-67B-Chat</td><td>6.43</td><td>5.75</td><td>5.71</td><td>5.79</td><td>7.11</td><td>7.12</td><td>6.52</td><td>7.58</td><td>7.20</td><td>6.91</td><td>7.37</td></tr><tr><td>ChatGLM-Turbo(智谱清言)</td><td>6.24</td><td>5.00</td><td>4.74</td><td>5.26</td><td>7.49</td><td>6.82</td><td>7.17</td><td>8.16</td><td>7.77</td><td>7.76</td><td>7.24</td></tr><tr><td>ERNIEBot-3.5(文心一言)</td><td>6.14</td><td>5.15</td><td>5.03</td><td>5.27</td><td>7.13</td><td>6.62</td><td>7.60</td><td>7.26</td><td>7.56</td><td>6.83</td><td>6.90</td></tr><tr><td>Yi-34B-Chat*</td><td>6.12</td><td>4.86</td><td>4.97</td><td>4.74</td><td>7.38</td><td>6.72</td><td>7.28</td><td>7.76</td><td>7.44</td><td>7.58</td><td>7.53</td></tr><tr><td>GPT-3.5-Turbo-0613</td><td>6.08</td><td>5.35</td><td>5.68</td><td>5.02</td><td>6.82</td><td>6.71</td><td>5.81</td><td>7.29</td><td>7.03</td><td>7.28</td><td>6.77</td></tr><tr><td>ChatGLM-Pro(智谱清言)</td><td>5.83</td><td>4.65</td><td>4.54</td><td>4.75</td><td>7.01</td><td>6.51</td><td>6.76</td><td>7.47</td><td>7.07</td><td>7.34</td><td>6.89</td></tr><tr><td>SparkDesk-V2(讯飞星火)</td><td>5.74</td><td>4.73</td><td>4.71</td><td>4.74</td><td>6.76</td><td>5.84</td><td>6.97</td><td>7.29</td><td>7.18</td><td>6.92</td><td>6.34</td></tr><tr><td>Qwen-14B-Chat</td><td>5.72</td><td>4.81</td><td>4.91</td><td>4.71</td><td>6.63</td><td>6.90</td><td>6.36</td><td>6.74</td><td>6.64</td><td>6.59</td><td>6.56</td></tr><tr><td>Baichuan2-13B-Chat</td><td>5.25</td><td>3.92</td><td>3.76</td><td>4.07</td><td>6.59</td><td>6.22</td><td>6.05</td><td>7.11</td><td>6.97</td><td>6.75</td><td>6.43</td></tr><tr><td>ChatGLM3-6B</td><td>4.97</td><td>3.85</td><td>3.55</td><td>4.14</td><td>6.10</td><td>5.75</td><td>5.29</td><td>6.71</td><td>6.83</td><td>6.28</td><td>5.73</td></tr><tr><td>Baichuan2-7B-Chat</td><td>4.97</td><td>3.66</td><td>3.56</td><td>3.75</td><td>6.28</td><td>5.81</td><td>5.50</td><td>7.13</td><td>6.84</td><td>6.53</td><td>5.84</td></tr><tr><td>InternLM-20B</td><td>4.96</td><td>3.66</td><td>3.39</td><td>3.92</td><td>6.26</td><td>5.96</td><td>5.50</td><td>7.18</td><td>6.19</td><td>6.49</td><td>6.22</td></tr><tr><td>Qwen-7B-Chat</td><td>4.91</td><td>3.73</td><td>3.62</td><td>3.83</td><td>6.09</td><td>6.40</td><td>5.74</td><td>6.26</td><td>6.31</td><td>6.19</td><td>5.66</td></tr><tr><td>ChatGLM2-6B</td><td>4.48</td><td>3.39</td><td>3.16</td><td>3.61</td><td>5.58</td><td>4.91</td><td>4.52</td><td>6.66</td><td>6.25</td><td>6.08</td><td>5.08</td></tr><tr><td>InternLM-Chat-7B</td><td>3.65</td><td>2.56</td><td>2.45</td><td>2.66</td><td>4.75</td><td>4.34</td><td>4.09</td><td>5.82</td><td>4.89</td><td>5.32</td><td>4.06</td></tr><tr><td>Chinese-LLaMA-2-7B-Chat</td><td>3.57</td><td>2.68</td><td>2.29</td><td>3.07</td><td>4.46</td><td>4.31</td><td>4.26</td><td>4.50</td><td>4.63</td><td>4.91</td><td>4.13</td></tr><tr><td>LLaMA-2-13B-Chinese-Chat</td><td>3.35</td><td>2.47</td><td>2.21</td><td>2.73</td><td>4.23</td><td>4.13</td><td>3.31</td><td>4.79</td><td>3.93</td><td>4.53</td><td>4.71</td></tr></tbody></table>

Table 5 | AlignBench leaderboard rated by GPT-4-0613. Models are ranked in descending order based on the overall score. Models marked with \* represent that we evaluate them through their API service or open-weighted model, instead of referring to the results reported in their original papers. Suffixes of Erniebot-4.0 and Moonshot denote the timestamps when we called their API.

表 5｜AlignBench 榜(GPT-4-0613 打分), 按总分降序. \* 表示经 API 或开源权重实测, 而非直接引用原论文; Erniebot-4.0/Moonshot 后缀为调用时间戳.

### 4.4. Discussion

**Amount of SFT Data.** The discussion surrounding the necessity of a large SFT corpus has been a topic of intense debate. Previous works (Young et al., 2024; Zhou et al., 2024) argue that fewer than 10K instances of SFT data are enough to produce satisfactory results. However, in our experiments, we observe a significant performance decline on the IFEval benchmark if we use fewer than 10K instances. A possible explanation is that, a language model necessitates a certain amount of data to develop specific skills. Although the requisite data amount may diminish with the model size increasing, it cannot be entirely eliminated. Our observation underscores the critical need for sufficient data to equip an LLM with desired capabilities. Moreover, the quality of SFT data is also crucial, especially for tasks involving writing or open-ended questions.

**SFT 数据量.** 有人认为 <10K 条就够; 但他们实验里 <10K 时 IFEval 明显掉. 特定技能仍要够量的数据, 大模型也消不掉这一需求. 写作与开放题上, 质量同样关键.

**Alignment Tax of Reinforcement Learning.** During human preference alignment, we observe a significant performance enhancement on the open-ended generation benchmarks, in terms of the scores rated by both AI and human evaluators. However, we also notice a phenomenon of “alignment tax” (Ouyang et al., 2022), i. e., the alignment process can negatively impact the performance on some standard benchmarks such as BBH. In order to alleviate the alignment tax, during the RL stage, we make significant efforts in data processing and improving training strategies, finally achieving a tolerable trade-off between the performance on standard and open-ended benchmarks. Exploring how to align a model with human preferences without

**Alignment tax.** 偏好对齐抬开放生成, 却可能伤 BBH 等标准基准. 靠数据处理与训练策略把代价压到可接受. 如何在对齐人类偏好时

<!-- page 21 of 52 -->

compromising its general performance presents a valuable direction for future research.

不伤通用能力, 仍是有价值的研究方向.

**Online Reinforcement Learning.** In our preference alignment experiments, we find that the online approach significantly outperforms the offline approach. Therefore, we invest tremendous efforts in implementing an online RL framework for aligning DeepSeek-V2. The conclusion about online or offline preference alignment can vary in different contexts, and we reserve a more thorough comparison and analysis between them for future work.

**在线 RL.** 偏好实验里在线明显好于离线, 故为 V2 搭了在线框架. 不同场景结论可能不同, 更细比较留给未来.

## 5. Conclusion, Limitation, and Future Work 结论, 局限与未来工作

In this paper, we introduce DeepSeek-V2, a large MoE language model that supports 128K context length. In addition to strong performance, it is also characterized by economical training and efficient inference, benefiting from its innovative architecture including MLA and DeepSeekMoE. In practice, compared with DeepSeek 67B, DeepSeek-V2 achieves significantly stronger performance, and meanwhile saves 42.5% of training costs, reduces the KV cache by 93.3%, and boosts the maximum generation throughput to 5.76 times. Evaluation results further demonstrate that with only 21B activated parameters, DeepSeek-V2 achieves top-tier performance among open-source models and becomes the strongest open-source MoE model.

本文介绍支持 128K 的大型 MoE 模型 DeepSeek-V2. 靠 MLA 与 DeepSeekMoE, 在强性能之外还省训练, 快推理: 相对 67B 更强, 同时训练成本 −42.5%, KV −93.3%, 最大生成吞吐 ×5.76. 仅激活 21B 仍进开源第一梯队, 并成为当时最强开源 MoE.

DeepSeek-V2 and its chat versions share the acknowledged limitations commonly found in other LLMs, including the lack of ongoing knowledge updates after pre-training, the possibility of generating non-factual information such as unverified advice, and a chance to produce hallucinations. In addition, since our data primarily consist of Chinese and English content, our model may exhibit limited proficiency in other languages. In scenarios beyond Chinese and English, it should be used with caution.

局限与多数 LLM 相同: 预训练后知识不更新; 可能给出未核实建议等非事实内容; 存在幻觉; 语料以中英为主, 其他语言要慎用.

DeepSeek will continuously invest in open-source large models with longtermism, aiming to progressively approach the goal of artificial general intelligence.

DeepSeek 会以长期主义继续投入开源大模型, 逐步逼近 AGI.

• In our ongoing exploration, we are dedicated to devising methods that enable further scaling up MoE models while maintaining economical training and inference costs. The goal of our next step is to achieve performance on par with GPT-4 in our upcoming release.

• 继续放大 MoE, 同时保住训练与推理经济性; 下一目标对齐 GPT-4 量级表现.

• Our alignment team continuously strives to enhance our models, aiming to develop a model that is not only helpful but also honest and safe for worldwide users. Our ultimate objective is to align the values of our model with human values, while minimizing the need for human supervision. By prioritizing ethical considerations and responsible development, we are dedicated to creating a positive and beneficial impact on society.

• 对齐上追求有用, 诚实, 安全, 减少人工监督, 让模型价值与人类价值对齐.

• Currently, DeepSeek-V2 is designed to support the text modality exclusively. In our forward-looking agenda, we intend to enable our model to support multiple modalities, enhancing its versatility and utility in a wider range of scenarios.

• 当前仅文本; 后续要走多模态.

## References

(以下参考文献保留英文原文, 与源 md 一致.)

AI@Meta. Llama 3 model card, 2024. URL [https://github. com/meta-llama/llama3/blob/main/MODEL\_CARD.md](https://github. com/meta-llama/llama3/blob/main/MODEL_CARD.md).

J. Ainslie, J. Lee-Thorp, M. de Jong, Y. Zemlyanskiy, F. Lebrón, and S. Sanghai. Gqa: Training generalized multi-query transformer models from multi-head checkpoints. arXiv preprint arXiv: 2305.13245, 2023.

<!-- page 22 of 52 -->

Anthropic. Introducing Claude, 2023. URL [https://www. anthropic. com/index/introducing-claude](https://www. anthropic. com/index/introducing-claude).

J. Austin, A. Odena, M. Nye, M. Bosma, H. Michalewski, D. Dohan, E. Jiang, C. Cai, M. Terry, Q. Le, et al. Program synthesis with large language models. arXiv preprint arXiv: 2108.07732, 2021.

J. Bai, S. Bai, Y. Chu, Z. Cui, K. Dang, X. Deng, Y. Fan, W. Ge, Y. Han, F. Huang, B. Hui, L. Ji, M. Li, J. Lin, R. Lin, D. Liu, G. Liu, C. Lu, K. Lu, J. Ma, R. Men, X. Ren, X. Ren, C. Tan, S. Tan, J. Tu, P. Wang, S. Wang, W. Wang, S. Wu, B. Xu, J. Xu, A. Yang, H. Yang, J. Yang, S. Yang, Y. Yao, B. Yu, H. Yuan, Z. Yuan, J. Zhang, X. Zhang, Y. Zhang, Z. Zhang, C. Zhou, J. Zhou, X. Zhou, and T. Zhu. Qwen technical report. arXiv preprint arXiv: 2309.16609, 2023.

Y. Bisk, R. Zellers, R. L. Bras, J. Gao, and Y. Choi. PIQA: reasoning about physical commonsense in natural language. In The Thirty-Fourth AAAI Conference on Artificial Intelligence, AAAI 2020, The Thirty-Second Innovative Applications of Artificial Intelligence Conference, IAAI 2020, The Tenth AAAI Symposium on Educational Advances in Artificial Intelligence, EAAI 2020, New York, NY, USA, February 7-12, 2020, pages 7432–7439. AAAI Press, 2020. doi: 10.1609/aaai. v34i05.6239. URL [https://doi. org/10.1609/aaai. v34i05.6239](https://doi. org/10.1609/aaai. v34i05.6239).

M. Chen, J. Tworek, H. Jun, Q. Yuan, H. P. de Oliveira Pinto, J. Kaplan, H. Edwards, Y. Burda, N. Joseph, G. Brockman, A. Ray, R. Puri, G. Krueger, M. Petrov, H. Khlaaf, G. Sastry, P. Mishkin, B. Chan, S. Gray, N. Ryder, M. Pavlov, A. Power, L. Kaiser, M. Bavarian, C. Winter, P. Tillet, F. P. Such, D. Cummings, M. Plappert, F. Chantzis, E. Barnes, A. Herbert-Voss, W. H. Guss, A. Nichol, A. Paino, N. Tezak, J. Tang, I. Babuschkin, S. Balaji, S. Jain, W. Saunders, C. Hesse, A. N. Carr, J. Leike, J. Achiam, V. Misra, E. Morikawa, A. Radford, M. Knight, M. Brundage, M. Murati, K. Mayer, P. Welinder, B. McGrew, D. Amodei, S. McCandlish, I. Sutskever, and W. Zaremba. Evaluating large language models trained on code. CoRR, abs/2107.03374, 2021. URL [https://arxiv. org/abs/2107.03374](https://arxiv. org/abs/2107.03374).

P. Clark, I. Cowhey, O. Etzioni, T. Khot, A. Sabharwal, C. Schoenick, and O. Tafjord. Think you have solved question answering? try arc, the AI2 reasoning challenge. CoRR, abs/1803.05457, 2018. URL [http://arxiv. org/abs/1803.05457](http://arxiv. org/abs/1803.05457).

K. Cobbe, V. Kosaraju, M. Bavarian, M. Chen, H. Jun, L. Kaiser, M. Plappert, J. Tworek, J. Hilton, R. Nakano, et al. Training verifiers to solve math word problems. arXiv preprint arXiv: 2110.14168, 2021.

Y. Cui, T. Liu, W. Che, L. Xiao, Z. Chen, W. Ma, S. Wang, and G. Hu. A span-extraction dataset for Chinese machine reading comprehension. In K. Inui, J. Jiang, V. Ng, and X. Wan, editors, Proceedings of the 2019 Conference on Empirical Methods in Natural Language Processing and the 9th International Joint Conference on Natural Language Processing (EMNLP-IJCNLP), pages 5883–5889, Hong Kong, China, Nov. 2019. Association for Computational Linguistics. doi: 10.18653/v1/D19-1600. URL [https://aclanthology. org/D19-1600](https://aclanthology. org/D19-1600).

D. Dai, C. Deng, C. Zhao, R. X. Xu, H. Gao, D. Chen, J. Li, W. Zeng, X. Yu, Y. Wu, Z. Xie, Y. K. Li, P. Huang, F. Luo, C. Ruan, Z. Sui, and W. Liang. Deepseekmoe: Towards ultimate expert specialization in mixture-of-experts language models. CoRR, abs/2401.06066, 2024. URL [https://doi. org/10.48550/arXiv. 2401.06066](https://doi. org/10.48550/arXiv. 2401.06066).

T. Dao. FlashAttention-2: Faster attention with better parallelism and work partitioning, 2023.

<!-- page 23 of 52 -->

DeepSeek-AI. Deepseek LLM: scaling open-source language models with longtermism. CoRR, abs/2401.02954, 2024. URL [https://doi. org/10.48550/arXiv. 2401.02954](https://doi. org/10.48550/arXiv. 2401.02954).

D. Dua, Y. Wang, P. Dasigi, G. Stanovsky, S. Singh, and M. Gardner. DROP: A reading comprehension benchmark requiring discrete reasoning over paragraphs. In J. Burstein, C. Doran, and T. Solorio, editors, Proceedings of the 2019 Conference of the North American Chapter of the Association for Computational Linguistics: Human Language Technologies, NAACL-HLT 2019, Minneapolis, MN, USA, June 2-7, 2019, Volume 1 (Long and Short Papers), pages 2368–2378. Association for Computational Linguistics, 2019. doi: 10.18653/V1/N19-1246. URL [https://doi. org/10.18653/v1/n19-1246](https://doi. org/10.18653/v1/n19-1246).

Y. Dubois, B. Galambosi, P. Liang, and T. B. Hashimoto. Length-controlled alpacaeval: A simple way to debias automatic evaluators. arXiv preprint arXiv: 2404.04475, 2024.

W. Fedus, B. Zoph, and N. Shazeer. Switch transformers: Scaling to trillion parameter models with simple and efficient sparsity. CoRR, abs/2101.03961, 2021. URL [https://arxiv. org/abs/2101.03961](https://arxiv. org/abs/2101.03961).

L. Gao, S. Biderman, S. Black, L. Golding, T. Hoppe, C. Foster, J. Phang, H. He, A. Thite, N. Nabeshima, et al. The Pile: An 800GB dataset of diverse text for language modeling. arXiv preprint arXiv: 2101.00027, 2020.

Google. Introducing gemini: our largest and most capable ai model, 2023. URL [https://blog. google/technology/ai/google-gemini-ai/](https://blog. google/technology/ai/google-gemini-ai/).

A. Gu, B. Rozière, H. Leather, A. Solar-Lezama, G. Synnaeve, and S. I. Wang. Cruxeval: A benchmark for code reasoning, understanding and execution, 2024.

D. Hendrycks, C. Burns, S. Basart, A. Zou, M. Mazeika, D. Song, and J. Steinhardt. Measuring massive multitask language understanding. arXiv preprint arXiv: 2009.03300, 2020.

D. Hendrycks, C. Burns, S. Kadavath, A. Arora, S. Basart, E. Tang, D. Song, and J. Steinhardt. Measuring mathematical problem solving with the math dataset. arXiv preprint arXiv: 2103.03874, 2021.

High-flyer. Hai-llm: 高效且轻量的大模型训练工具, 2023. URL [https://www. high-flyer. cn/en/blog/hai-llm](https://www. high-flyer. cn/en/blog/hai-llm).

C. Hooper, S. Kim, H. Mohammadzadeh, M. W. Mahoney, Y. S. Shao, K. Keutzer, and A. Gholami. Kvquant: Towards 10 million context length LLM inference with KV cache quantization. CoRR, abs/2401.18079, 2024. URL [https://doi. org/10.48550/arXiv. 2401.18079](https://doi. org/10.48550/arXiv. 2401.18079).

S. Hu, Y. Tu, X. Han, C. He, G. Cui, X. Long, Z. Zheng, Y. Fang, Y. Huang, W. Zhao, et al. Minicpm: Unveiling the potential of small language models with scalable training strategies. arXiv preprint arXiv: 2404.06395, 2024.

Y. Huang, Y. Bai, Z. Zhu, J. Zhang, J. Zhang, T. Su, J. Liu, C. Lv, Y. Zhang, J. Lei, et al. C-Eval: A multi-level multi-discipline chinese evaluation suite for foundation models. arXiv preprint arXiv: 2305.08322, 2023.

N. Jain, K. Han, A. Gu, W.-D. Li, F. Yan, T. Zhang, S. Wang, A. Solar-Lezama, K. Sen, and I. Stoica. Livecodebench: Holistic and contamination free evaluation of large language models for code. arXiv preprint arXiv: 2403.07974, 2024.

<!-- page 24 of 52 -->

M. Joshi, E. Choi, D. Weld, and L. Zettlemoyer. TriviaQA: A large scale distantly supervised challenge dataset for reading comprehension. In R. Barzilay and M.-Y. Kan, editors, Proceedings of the 55th Annual Meeting of the Association for Computational Linguistics (Volume 1: Long Papers), pages 1601–1611, Vancouver, Canada, July 2017. Association for Computational Linguistics. doi: 10.18653/v1/P17-1147. URL [https://aclanthology. org/P17-1147](https://aclanthology. org/P17-1147).

T. Kwiatkowski, J. Palomaki, O. Redfield, M. Collins, A. P. Parikh, C. Alberti, D. Epstein, I. Polosukhin, J. Devlin, K. Lee, K. Toutanova, L. Jones, M. Kelcey, M. Chang, A. M. Dai, J. Uszkoreit, Q. Le, and S. Petrov. Natural questions: a benchmark for question answering research. Trans. Assoc. Comput. Linguistics, 7: 452–466, 2019. doi: 10.1162/tacl\_a\_00276. URL [https://doi. org/10.1162/tacl\_a\_00276](https://doi. org/10.1162/tacl_a_00276).

W. Kwon, Z. Li, S. Zhuang, Y. Sheng, L. Zheng, C. H. Yu, J. E. Gonzalez, H. Zhang, and I. Stoica. Efficient memory management for large language model serving with pagedattention. In Proceedings of the ACM SIGOPS 29th Symposium on Operating Systems Principles, 2023.

G. Lai, Q. Xie, H. Liu, Y. Yang, and E. H. Hovy. RACE: large-scale reading comprehension dataset from examinations. In M. Palmer, R. Hwa, and S. Riedel, editors, Proceedings of the 2017 Conference on Empirical Methods in Natural Language Processing, EMNLP 2017, Copenhagen, Denmark, September 9-11, 2017, pages 785–794. Association for Computational Linguistics, 2017. doi: 10.18653/V1/D17-1082. URL [https://doi. org/10.18653/v1/d17-1082](https://doi. org/10.18653/v1/d17-1082).

D. Lepikhin, H. Lee, Y. Xu, D. Chen, O. Firat, Y. Huang, M. Krikun, N. Shazeer, and Z. Chen. Gshard: Scaling giant models with conditional computation and automatic sharding. In 9th International Conference on Learning Representations, ICLR 2021. OpenReview. net, 2021. URL [https://openreview. net/forum? id=qrwe7XHTmYb](https://openreview. net/forum? id=qrwe7XHTmYb).

H. Li, Y. Zhang, F. Koto, Y. Yang, H. Zhao, Y. Gong, N. Duan, and T. Baldwin. CMMLU: Measuring massive multitask language understanding in Chinese. arXiv preprint arXiv: 2306.09212, 2023.

W. Li, F. Qi, M. Sun, X. Yi, and J. Zhang. Ccpm: A chinese classical poetry matching dataset, 2021.

X. Liu, X. Lei, S. Wang, Y. Huang, Z. Feng, B. Wen, J. Cheng, P. Ke, Y. Xu, W. L. Tam, X. Zhang, L. Sun, H. Wang, J. Zhang, M. Huang, Y. Dong, and J. Tang. Alignbench: Benchmarking chinese alignment of large language models. CoRR, abs/2311.18743, 2023. doi: 10.48550/A RXIV. 2311.18743. URL [https://doi. org/10.48550/arXiv. 2311.18743](https://doi. org/10.48550/arXiv. 2311.18743).

I. Loshchilov and F. Hutter. Decoupled weight decay regularization. arXiv preprint arXiv: 1711.05101, 2017.

Mistral. Cheaper, better, faster, stronger: Continuing to push the frontier of ai and making it accessible to all, 2024. URL [https://mistral. ai/news/mixtral-8x22b](https://mistral. ai/news/mixtral-8x22b).

OpenAI. Introducing ChatGPT, 2022. URL [https://openai. com/blog/chatgpt](https://openai. com/blog/chatgpt).

OpenAI. GPT4 technical report. arXiv preprint arXiv: 2303.08774, 2023.

L. Ouyang, J. Wu, X. Jiang, D. Almeida, C. Wainwright, P. Mishkin, C. Zhang, S. Agarwal, K. Slama, A. Ray, et al. Training language models to follow instructions with human feedback. Advances in neural information processing systems, 35: 27730–27744, 2022.

<!-- page 25 of 52 -->

B. Peng, J. Quesnelle, H. Fan, and E. Shippole. Yarn: Efficient context window extension of large language models. arXiv preprint arXiv: 2309.00071, 2023.

P. Qi, X. Wan, G. Huang, and M. Lin. Zero bubble pipeline parallelism. arXiv preprint arXiv: 2401.10241, 2023.

S. Rajbhandari, J. Rasley, O. Ruwase, and Y. He. Zero: Memory optimizations toward training trillion parameter models. In SC20: International Conference for High Performance Computing, Networking, Storage and Analysis, pages 1–16. IEEE, 2020.

C. Riquelme, J. Puigcerver, B. Mustafa, M. Neumann, R. Jenatton, A. S. Pinto, D. Keysers, and N. Houlsby. Scaling vision with sparse mixture of experts. In Advances in Neural Information Processing Systems 34: Annual Conference on Neural Information Processing Systems 2021, NeurIPS 2021, pages 8583–8595, 2021. URL [https://proceedings. neurips. cc/paper/2021/hash/48237d9f2dea8c74c2a72126cf63d933-Abstract. html](https://proceedings. neurips. cc/paper/2021/hash/48237d9f2dea8c74c2a72126cf63d933-Abstract. html).

K. Sakaguchi, R. L. Bras, C. Bhagavatula, and Y. Choi. Winogrande: An adversarial winograd schema challenge at scale, 2019.

Z. Shao, P. Wang, Q. Zhu, R. Xu, J. Song, M. Zhang, Y. Li, Y. Wu, and D. Guo. Deepseekmath: Pushing the limits of mathematical reasoning in open language models. arXiv preprint arXiv: 2402.03300, 2024.

N. Shazeer. Fast transformer decoding: One write-head is all you need. CoRR, abs/1911.02150, 2019. URL [http://arxiv. org/abs/1911.02150](http://arxiv. org/abs/1911.02150).

N. Shazeer, A. Mirhoseini, K. Maziarz, A. Davis, Q. V. Le, G. E. Hinton, and J. Dean. Outrageously large neural networks: The sparsely-gated mixture-of-experts layer. In 5th International Conference on Learning Representations, ICLR 2017. OpenReview. net, 2017. URL [https://openreview. net/forum? id=B1ckMDqlg](https://openreview. net/forum? id=B1ckMDqlg).

J. Su, M. Ahmed, Y. Lu, S. Pan, W. Bo, and Y. Liu. Roformer: Enhanced transformer with rotary position embedding. Neurocomputing, 568: 127063, 2024.

K. Sun, D. Yu, D. Yu, and C. Cardie. Investigating prior knowledge for challenging chinese machine reading comprehension, 2019.

M. Suzgun, N. Scales, N. Schärli, S. Gehrmann, Y. Tay, H. W. Chung, A. Chowdhery, Q. V. Le, E. H. Chi, D. Zhou, et al. Challenging big-bench tasks and whether chain-of-thought can solve them. arXiv preprint arXiv: 2210.09261, 2022.

A. Vaswani, N. Shazeer, N. Parmar, J. Uszkoreit, L. Jones, A. N. Gomez, Ł. Kaiser, and I. Polosukhin. Attention is all you need. Advances in neural information processing systems, 30, 2017.

J. Wei, Y. Tay, R. Bommasani, C. Raffel, B. Zoph, S. Borgeaud, D. Yogatama, M. Bosma, D. Zhou, D. Metzler, et al. Emergent abilities of large language models. arXiv preprint arXiv: 2206.07682, 2022.

T. Wei, J. Luan, W. Liu, S. Dong, and B. Wang. Cmath: Can your language model pass chinese elementary school math test?, 2023.

L. Xu, H. Hu, X. Zhang, L. Li, C. Cao, Y. Li, Y. Xu, K. Sun, D. Yu, C. Yu, Y. Tian, Q. Dong, W. Liu, B. Shi, Y. Cui, J. Li, J. Zeng, R. Wang, W. Xie, Y. Li, Y. Patterson, Z. Tian, Y. Zhang, H. Zhou,

<!-- page 26 of 52 -->

S. Liu, Z. Zhao, Q. Zhao, C. Yue, X. Zhang, Z. Yang, K. Richardson, and Z. Lan. CLUE: A chinese language understanding evaluation benchmark. In D. Scott, N. Bel, and C. Zong, editors, Proceedings of the 28th International Conference on Computational Linguistics, COLING 2020, Barcelona, Spain (Online), December 8-13, 2020, pages 4762–4772. International Committee on Computational Linguistics, 2020. doi: 10.18653/V1/2020. COLING-MAIN. 419. URL [https://doi. org/10.18653/v1/2020. coling-main. 419](https://doi. org/10.18653/v1/2020. coling-main. 419).

A. Young, B. Chen, C. Li, C. Huang, G. Zhang, G. Zhang, H. Li, J. Zhu, J. Chen, J. Chang, et al. Yi: Open foundation models by 01. ai. arXiv preprint arXiv: 2403.04652, 2024.

R. Zellers, A. Holtzman, Y. Bisk, A. Farhadi, and Y. Choi. HellaSwag: Can a machine really finish your sentence? In A. Korhonen, D. R. Traum, and L. Màrquez, editors, Proceedings of the 57th Conference of the Association for Computational Linguistics, ACL 2019, Florence, Italy, July 28- August 2, 2019, Volume 1: Long Papers, pages 4791–4800. Association for Computational Linguistics, 2019. doi: 10.18653/v1/p19-1472. URL [https://doi. org/10.18653/v1/p19-1472](https://doi. org/10.18653/v1/p19-1472).

Y. Zhao, C. Lin, K. Zhu, Z. Ye, L. Chen, S. Zheng, L. Ceze, A. Krishnamurthy, T. Chen, and B. Kasikci. Atom: Low-bit quantization for efficient and accurate LLM serving. CoRR, abs/2310.19102, 2023. URL [https://doi. org/10.48550/arXiv. 2310.19102](https://doi. org/10.48550/arXiv. 2310.19102).

C. Zheng, M. Huang, and A. Sun. Chid: A large-scale chinese idiom dataset for cloze test. In A. Korhonen, D. R. Traum, and L. Màrquez, editors, Proceedings of the 57th Conference of the Association for Computational Linguistics, ACL 2019, Florence, Italy, July 28- August 2, 2019, Volume 1: Long Papers, pages 778–787. Association for Computational Linguistics, 2019. doi: 10.18653/V1/P19-1075. URL [https://doi. org/10.18653/v1/p19-1075](https://doi. org/10.18653/v1/p19-1075).

L. Zheng, W.-L. Chiang, Y. Sheng, S. Zhuang, Z. Wu, Y. Zhuang, Z. Lin, Z. Li, D. Li, E. P. Xing, H. Zhang, J. E. Gonzalez, and I. Stoica. Judging llm-as-a-judge with mt-bench and chatbot arena, 2023.

W. Zhong, R. Cui, Y. Guo, Y. Liang, S. Lu, Y. Wang, A. Saied, W. Chen, and N. Duan. AGIEval: A human-centric benchmark for evaluating foundation models. CoRR, abs/2304.06364, 2023. doi: 10.48550/arXiv. 2304.06364. URL [https://doi. org/10.48550/arXiv. 2304.06364](https://doi. org/10.48550/arXiv. 2304.06364).

C. Zhou, P. Liu, P. Xu, S. Iyer, J. Sun, Y. Mao, X. Ma, A. Efrat, P. Yu, L. Yu, et al. Lima: Less is more for alignment. Advances in Neural Information Processing Systems, 36, 2024.

J. Zhou, T. Lu, S. Mishra, S. Brahma, S. Basu, Y. Luan, D. Zhou, and L. Hou. Instruction-following evaluation for large language models. arXiv preprint arXiv: 2311.07911, 2023.

<!-- page 27 of 52 -->

## Appendix

## A. Contributions and Acknowledgments 贡献与致谢

(贡献名单表与源 md 一致, 此处保留英文原表.)

Within each role, authors are listed alphabetically by first name. Especially, Huazuo Gao and Wangding Zeng have made key innovations in the research of the MLA architecture. Furthermore, we’d like to thank Jianlin Su for his helpful discussion on position embedding. We thank all those who have contributed to DeepSeek-V2 but are not mentioned in the paper. DeepSeek believes that innovation, novelty, and curiosity are essential in the path to AGI.

各角色内按名字母序. 特别地, Huazuo Gao 与 Wangding Zeng 在 MLA 上有关键创新; 感谢 Jianlin Su 在位置编码上的讨论. 也感谢未具名贡献者. DeepSeek 相信创新, 新奇与好奇心是通往 AGI 之路的必需.

<!-- page 28 of 52 -->

(贡献名单续表, 与源 md 一致.)

<!-- page 29 of 52 -->

## B. DeepSeek-V2-Lite: A 16B Model Equipped with MLA and DeepSeekMoE DeepSeek-V2-Lite: 配备 MLA 与 DeepSeekMoE 的约 16B 模型

### B. 1. Model Description 模型描述

**Architectures.** DeepSeek-V2-Lite has 27 layers and a hidden dimension of 2048. It also employs MLA and has 16 attention heads, where each head has a dimension of 128. Its KV compression dimension is 512, but slightly different from DeepSeek-V2, it does not compress the queries. For the decoupled queries and key, it has a per-head dimension of 64. DeepSeek-V2-Lite also employs DeepSeekMoE, and all FFNs except for the first layer are replaced with MoE layers. Each MoE layer consists of 2 shared experts and 64 routed experts, where the intermediate hidden dimension of each expert is 1408. Among the routed experts, 6 experts will be activated for each token. Under this configuration, DeepSeek-V2-Lite comprises 15.7B total parameters, of which 2.4B are activated for each token.

**架构.** 27 层, 隐宽 2048; MLA 16 头, 每头 128; KV 压缩维 512, 但不压缩 query; 解耦 RoPE 每头 64. 除第 1 层外 FFN 换 MoE: 2 共享 + 64 路由, 中间宽 1408, 激活 6. 总参 15.7B, 激活 2.4B.

<table><tr><td></td><td>Benchmark</td><td>DeepSeek 7B</td><td>DeepSeekMoE 16B</td><td>DeepSeek-V2-Lite</td></tr><tr><td rowspan="5"></td><td>Architecture</td><td>MHA+Dense</td><td>MHA+MoE</td><td>MLA+MoE</td></tr><tr><td>Context Length</td><td>4K</td><td>4K</td><td>32K</td></tr><tr><td># Activated Params</td><td>6.9B</td><td>2.8B</td><td>2.4B</td></tr><tr><td># Total Params</td><td>6.9B</td><td>16.4B</td><td>15.7B</td></tr><tr><td># Training Tokens</td><td>2T</td><td>2T</td><td>5.7T</td></tr><tr><td rowspan="7">English</td><td>MMLU</td><td>48.2</td><td>45.0</td><td>58.3</td></tr><tr><td>BBH</td><td>39.5</td><td>38.9</td><td>44.1</td></tr><tr><td>TriviaQA</td><td>59.7</td><td>64.8</td><td>64.2</td></tr><tr><td>NaturalQuestions</td><td>22.2</td><td>25.5</td><td>26.0</td></tr><tr><td>ARC-Easy</td><td>67.9</td><td>68.1</td><td>70.9</td></tr><tr><td>ARC-Challenge</td><td>48.1</td><td>49.8</td><td>51.2</td></tr><tr><td>AGIEval</td><td>26.4</td><td>17.4</td><td>33.2</td></tr><tr><td rowspan="2">Code</td><td>HumanEval</td><td>26.2</td><td>26.8</td><td>29.9</td></tr><tr><td>MBPP</td><td>39.0</td><td>39.2</td><td>43.2</td></tr><tr><td rowspan="3">Math</td><td>GSM8K</td><td>17.4</td><td>18.8</td><td>41.1</td></tr><tr><td>MATH</td><td>3.3</td><td>4.3</td><td>17.1</td></tr><tr><td>CMath</td><td>34.5</td><td>40.4</td><td>58.4</td></tr><tr><td rowspan="3">Chinese</td><td>CLUEWSC</td><td>73.1</td><td>72.1</td><td>74.3</td></tr><tr><td>C-Eval</td><td>45.0</td><td>40.6</td><td>60.3</td></tr><tr><td>CMMLU</td><td>47.2</td><td>42.5</td><td>64.3</td></tr></table>

Table 6 | Performance of DeepSeek-V2-Lite, DeepSeekMoE 16B, and DeepSeek 7B.

表 6｜DeepSeek-V2-Lite, DeepSeekMoE 16B 与 DeepSeek 7B 对照.

**Training Details.** DeepSeek-V2-Lite is also trained from scratch on the same pre-training corpus of DeepSeek-V2, which is not polluted by any SFT data. It uses the AdamW optimizer with hyper-parameters set to $\beta _ { 1 } = 0 . 9 , \beta _ { 2 } = 0 . 9 5 , $ , and weight\_decay = 0.1. The learning rate is scheduled using a warmup-and-step-decay strategy. Initially, the learning rate linearly increases from 0 to the maximum value during the first 2K steps. Subsequently, the learning rate is multiplied by 0.316 after training about 80% of tokens, and again by 0.316 after training about 90% of tokens. The maximum learning rate is set to $4 . 2 \times 1 0 ^ { - 4 } , $ and the gradient clipping norm is set to 1.0. We do not employ the batch size scheduling strategy for it, and it is trained with a constant batch size of 4608 sequences. During pre-training, we set the maximum sequence

**训练细节.** 同语料从零训, 无 SFT 污染. AdamW 同主模型; lr warmup 2K, 约 80%/90% token 处各 ×0.316, 峰值 $4.2\times10^{-4}$; 无 batch 调度, 恒定 4608. 预训练最大序列

<!-- page 30 of 52 -->

length to 4K, and train DeepSeek-V2-Lite on 5.7T tokens. We leverage pipeline parallelism to deploy different layers of it on different devices, but for each layer, all experts will be deployed on the same device. Therefore, we only employ a small expert-level balance loss with $\alpha _ { 1 } = 0 . 0 0 1$ and do not employ device-level balance loss and communication balance loss for it. After pre-training, we also perform long context extension and SFT for DeepSeek-V2-Lite and get a chat model called DeepSeek-V2-Lite Chat.

4K, 训 5.7T. Pipeline 分层, 但每层专家同设备, 故只保留很小专家级均衡损失 $\alpha_1=0.001$, 不做设备级/通信级损失. 预训练后再做长上下文扩展与 SFT, 得到 Lite Chat.

<table><tr><td></td><td>Benchmark</td><td>DeepSeek 7B Chat</td><td>DeepSeekMoE 16B Chat</td><td>DeepSeek-V2-Lite Chat</td></tr><tr><td rowspan="5"></td><td>Architecture</td><td>MHA+Dense</td><td>MHA+MoE</td><td>MLA+MoE</td></tr><tr><td>Context Length</td><td>4K</td><td>4K</td><td>32K</td></tr><tr><td># Activated Params</td><td>6.9B</td><td>2.8B</td><td>2.4B</td></tr><tr><td># Total Params</td><td>6.9B</td><td>16.4B</td><td>15.7B</td></tr><tr><td># Training Tokens</td><td>2T</td><td>2T</td><td>5.7T</td></tr><tr><td rowspan="7">English</td><td>MMLU</td><td>49.7</td><td>47.2</td><td>55.7</td></tr><tr><td>BBH</td><td>43.1</td><td>42.2</td><td>48.1</td></tr><tr><td>TriviaQA</td><td>59.5</td><td>63.3</td><td>65.2</td></tr><tr><td>NaturalQuestions</td><td>32.7</td><td>35.1</td><td>35.5</td></tr><tr><td>ARC-Easy</td><td>70.2</td><td>69.9</td><td>74.3</td></tr><tr><td>ARC-Challenge</td><td>50.2</td><td>50.0</td><td>51.5</td></tr><tr><td>AGIEval</td><td>17.6</td><td>19.7</td><td>42.8</td></tr><tr><td rowspan="2">Code</td><td>HumanEval</td><td>45.1</td><td>45.7</td><td>57.3</td></tr><tr><td>MBPP</td><td>39.0</td><td>46.2</td><td>45.8</td></tr><tr><td rowspan="3">Math</td><td>GSM8K</td><td>62.6</td><td>62.2</td><td>72.0</td></tr><tr><td>MATH</td><td>14.7</td><td>15.2</td><td>27.9</td></tr><tr><td>CMath</td><td>66.4</td><td>67.9</td><td>71.7</td></tr><tr><td rowspan="3">Chinese</td><td>CLUEWSC</td><td>66.2</td><td>68.2</td><td>80.0</td></tr><tr><td>C-Eval</td><td>44.7</td><td>40.0</td><td>60.1</td></tr><tr><td>CMMLU</td><td>51.2</td><td>49.3</td><td>62.5</td></tr></table>

Table 7 | Performance of DeepSeek-V2-Lite Chat, DeepSeekMoE 16B Chat, and DeepSeek 7B Chat.

表 7｜Lite Chat 与既有小模型 Chat 对照.

### B. 2. Performance Evaluation 性能评测

**Base Model.** We evaluate the performance of DeepSeek-V2-Lite and compare it with our pre-vious small-size base models in Table 6. DeepSeek-V2-Lite exhibits overwhelming performance advantages, especially in reasoning, coding, and math.

**基座.** Table 6: Lite 相对既有小基座全面占优, 尤其推理, 代码, 数学.

**Chat Model.** We evaluate the performance of DeepSeek-V2-Lite Chat and compare it with our previous small-size chat models in Table 7. DeepSeek-V2-Lite also outperforms our previous small-size chat models by a large margin.

**Chat.** Table 7: Lite Chat 同样大幅超过既有小 Chat.

<!-- page 31 of 52 -->

## C. Full Formulas of MLA MLA 完整公式

In order to demonstrate the complete computation process of MLA, we provide its full formulas in the following:

完整计算过程如下(公式 (37)–(47) 与源 md 一致, 框出的向量为生成期需缓存项):

$$
\mathbf {c} _ {t} ^ {Q} = W ^ {D Q} \mathbf {h} _ {t}, \tag{37}
$$

$$
[ \mathbf {q} _ {t, 1} ^ {C}; \mathbf {q} _ {t, 2} ^ {C}; \dots ; \mathbf {q} _ {t, n _ {h}} ^ {C} ] = \mathbf {q} _ {t} ^ {C} = W ^ {U Q} \mathbf {c} _ {t} ^ {Q}, \tag{38}
$$

$$
[ \mathbf {q} _ {t, 1} ^ {R}; \mathbf {q} _ {t, 2} ^ {R}; \dots ; \mathbf {q} _ {t, n _ {h}} ^ {R} ] = \mathbf {q} _ {t} ^ {R} = \mathrm{RoPE} (W ^ {Q R} \mathbf {c} _ {t} ^ {Q}), \tag{39}
$$

$$
\mathbf {q} _ {t, i} = [ \mathbf {q} _ {t, i} ^ {C}; \mathbf {q} _ {t, i} ^ {R} ], \tag{40}
$$

$$
\boxed {\mathbf {c} _ {t} ^ {K V}} = W ^ {D K V} \mathbf {h} _ {t}, \tag{41}
$$

$$
[ \mathbf {k} _ {t, 1} ^ {C}; \mathbf {k} _ {t, 2} ^ {C}; \dots ; \mathbf {k} _ {t, n _ {h}} ^ {C} ] = \mathbf {k} _ {t} ^ {C} = W ^ {U K} \mathbf {c} _ {t} ^ {K V}, \tag{42}
$$

$$
\boxed {\mathbf {k} _ {t} ^ {R}} = \mathrm{RoPE} (W ^ {K R} \mathbf {h} _ {t}), \tag{43}
$$

$$
\mathbf {k} _ {t, i} = [ \mathbf {k} _ {t, i} ^ {C}; \mathbf {k} _ {t} ^ {R} ], \tag{44}
$$

$$
[ \mathbf {v} _ {t, 1} ^ {C}; \mathbf {v} _ {t, 2} ^ {C}; \dots ; \mathbf {v} _ {t, n _ {h}} ^ {C} ] = \mathbf {v} _ {t} ^ {C} = W ^ {U V} \mathbf {c} _ {t} ^ {K V}, \tag{45}
$$

$$
\mathbf {o} _ {t, i} = \sum_ {j = 1} ^ {t} \text {Softmax} _ {j} (\frac {\mathbf {q} _ {t , i} ^ {T} \mathbf {k} _ {j , i}}{\sqrt {d _ {h} + d _ {h} ^ {R}}}) \mathbf {v} _ {j, i} ^ {C}, \tag{46}
$$

$$
\mathbf {u} _ {t} = W ^ {O} [ \mathbf {o} _ {t, 1}; \mathbf {o} _ {t, 2}; \dots ; \mathbf {o} _ {t, n _ {h}} ], \tag{47}
$$

where the boxed vectors in blue need to be cached for generation. During inference, the naive formula needs to recover $\mathbf { k } _ { t } ^ { C }$ and $\mathbf { v } _ { t } ^ { C }$ from $\mathbf { c } _ { t } ^ { K V }$ for attention. Fortunately, due to the associative law of matrix multiplication, we can absorb $W ^ { U K }$ into $W ^ { U Q } , $ and $W ^ { U V }$ into $W ^ { O }$ . Therefore, we do not need to compute keys and values out for each query. Through this optimization, we avoid the computational overhead for recomputing $\mathbf { k } _ { t } ^ { C }$ and $\mathbf { v } _ { t } ^ { \vec { C } }$ during inference.

蓝框向量为生成期缓存项. 朴素实现要从 $\mathbf{c}_t^{KV}$ 恢复 $\mathbf{k}_t^C, \mathbf{v}_t^C$; 利用结合律把 $W^{UK}$ 吸进 $W^{UQ}$, $W^{UV}$ 吸进 $W^O$ 后, 不必对每个 query 显式算 K/V, 避免重算开销.

## D. Ablation of Attention Mechanisms 注意力机制消融

### D. 1. Ablation of MHA, GQA, and MQA MHA / GQA / MQA 消融

We show the evaluation results for 7B dense models with MHA, GQA, and MQA on four hard benchmarks in Table 8. All of these three models are trained on 1.33T tokens, and share the same architecture except for the attention mechanisms. In addition, for a fair comparison, we align the number of parameters of them to around 7B by adjusting the number of layers. From the table, we can find that MHA demonstrates significant advantages over GQA and MQA on these benchmarks.

Table 8: 约 7B Dense, 同训 1.33T, 只改注意力并用层数对齐参数量. MHA 在四项硬基准上明显强过 GQA 与 MQA.

### D. 2. Comparison Between MLA and MHA MLA 与 MHA 对照

In Table 9, we show the evaluation results for MoE models equipped with MLA and MHA, respectively, on four hard benchmarks. For a solid conclusion, we train and evaluate models across two scales. Two small MoE models comprise about 16B total parameters, and we train them on 1.33T tokens. Two large MoE models comprise about 250B total parameters, and we train them on 420B tokens. Also, two small MoE models and two large MoE models respectively share the same architecture except for the attention mechanisms. From the table, we can observe that MLA shows better performance than MHA. More importantly, MLA requires a significantly smaller amount of KV cache (14% for small MoE models and 4% for large MoE models) than MHA.

Table 9: 约 16B(1.33T)与约 250B(420B)两档 MoE, 只改注意力. MLA 更强, 且 KV 分别约为 MHA 的 14% 与 4%.

<!-- page 32 of 52 -->

| Benchmark (Metric) | # Shots | Dense 7B w/ MQA w | Dense 7B / GQA (8 Group | Dense 7B s) w/ MHA |
| --- | --- | --- | --- | --- |
| # Params | - | 7.1B | 6.9B | 6.9B |
| BBH (EM) | 3-shot | 33.2 | 35.6 | 37.0 |
| MMLU (Acc.) | 5-shot | 37.9 | 41.2 | 45.2 |
| C-Eval (Acc.) | 5-shot | 30.0 | 37.7 | 42.9 |
| CMMLU (Acc.) | 5-shot | 34.6 | 38.4 | 43.5 |

Table 8 | Comparison among 7B dense models with MHA, GQA, and MQA, respectively. MHA demonstrates significant advantages over GQA and MQA on hard benchmarks.

表 8｜约 7B Dense 上 MHA/GQA/MQA 对照.

| Benchmark (Metric) | # Shots | Small MoE w/ MHA | Small MoE w/ MLA | Large MoE w/ MHA | Large MoE w/ MLA |
| --- | --- | --- | --- | --- | --- |
| # Activated Params | - | 2.5B | 2.4B | 25.0B | 21.5B |
| # Total Params | - | 15.8B | 15.7B | 250.8B | 247.4B |
| KV Cache per Token (# Element) | - | 110.6K | 15.6K | 860.2K | 34.6K |
| BBH (EM) | 3-shot | 37.9 | 39.0 | 46.6 | 50.7 |
| MMLU (Acc.) | 5-shot | 48.7 | 50.0 | 57.5 | 59.0 |
| C-Eval (Acc.) | 5-shot | 51.6 | 50.9 | 57.9 | 59.2 |
| CMMLU (Acc.) | 5-shot | 52.3 | 53.4 | 60.7 | 62.5 |

Table 9 | Comparison between MLA and MHA on hard benchmarks. DeepSeek-V2 shows better performance than MHA, but requires a significantly smaller amount of KV cache.

表 9｜MLA 与 MHA 在硬基准上对照.

## E. Discussion About Pre-Training Data Debiasing 预训练数据去偏讨论

During pre-training data preparation, we identify and filter out contentious content, such as values influenced by regional cultures, to avoid our model exhibiting unnecessary subjective biases on these controversial topics. Consequently, we observe that DeepSeek-V2 performs slightly worse on the test sets that are closely associated with specific regional cultures. For example, when evaluated on MMLU, although DeepSeek-V2 achieves comparable or superior performance on the majority of testsets compared with its competitors like Mixtral 8x22B, it still lags behind on the Humanity-Moral subset, which is mainly associated with American values.

预训练过滤与特定地域文化强绑定的争议内容, 以避免不必要主观偏置. 代价是: 与特定地域文化强相关的测试集会略差, 例如 MMLU 的 Humanity-Moral(偏美国价值观)相对 Mixtral 等仍落后, 尽管多数子集可比或更好.

Further, we conduct a manual analysis on this subset. Three well-educated human annotators conduct independent annotations on 420 moral scenarios from the MMLU Humanity-Moral subset. Then, we compute the agreement among their annotations and the ground-truth label. As shown in Table 10, three human annotators and the ground-truth label exhibit a low agreement with each other. Therefore, we attribute the abnormal performance of DeepSeek-V2 on these value-sensitive test sets to our efforts in debiasing the pre-training corpus.

三名标注员在 420 条道德情景上两两一致率与标准答案一致率都偏低(Table 10). 故把这类价值观子集的异常表现归因于去偏, 而非通用能力塌陷.

## F. Additional Evaluations on Math and Code 数学与代码补充评测

The evaluation employs the SC-Math6 corpus, which consists of thousands of Chinese math problems. DeepSeek-V2 Chat (RL) outperforms all Chinese LLMs, including both open-source and close-source models.

SC-Math6(数千道中文数学题): Chat (RL) 超过全部中文 LLM(含开源与闭源).

We further share more results in Figure 5 on HumanEval and LiveCodeBench, where the

Figure 5 另给 HumanEval 与 LiveCodeBench, 其中

<!-- page 33 of 52 -->

| Agreement | Ground-Truth Label | Annotator 1 | Annotator 2 | Annotator 3 |
| --- | --- | --- | --- | --- |
| Ground-Truth Label | 100.0% | 66.7% | 59.8% | 42.1% |
| Annotator 1 | 66.7% | 100.0% | 57.9% | 69.0% |
| Annotator 2 | 59.8% | 57.9% | 100.0% | 65.5% |
| Annotator 3 | 42.1% | 69.0% | 65.5% | 100.0% |

Table 10 | Three well-educated human annotators conduct independent annotations on 420 moral scenarios from the MMLU Humanity-Moral subset, on which DeepSeek-V2 and its competitive models demonstrate performance inconsistency. Three annotators and the ground-truth label exhibit a low agreement with each other. This indicates that the answers to the Humanity-Moral subset can be contentious according to specific regional cultures.

表 10｜MMLU Humanity-Moral 子集人工一致率.

| Model Name | R Level | Comp. Score | Reas. Steps Score | OvrAcc Score |
| --- | --- | --- | --- | --- |
| GPT-4-1106-Preview | 5 | 90.71 | 91.65 | 89.77 |
| GPT-4 | 5 | 88.40 | 89.10 | 87.71 |
| DeepSeek-V2 Chat (RL) | 5 | 83.35 | 85.73 | 84.54 |
| Ernie-bot 4.0 | 5 | 85.60 | 86.82 | 84.38 |
| Qwen-110B-Chat | 5 | 83.25 | 84.93 | 84.09 |
| GLM-4 | 5 | 84.24 | 85.72 | 82.77 |
| Xinghuo 3.5 | 5 | 83.73 | 85.37 | 82.09 |
| Qwen-72B-Chat | 4 | 78.42 | 80.07 | 79.25 |
| ChatGLM-Turbo | 4 | 57.70 | 60.32 | 55.09 |
| GPT-3.5-Turbo | 4 | 57.05 | 59.61 | 54.50 |
| Qwen-14B-Chat | 4 | 53.12 | 55.99 | 50.26 |
| ChatGLM3-6B | 3 | 40.90 | 44.20 | 37.60 |
| Xinghuo 3.0 | 3 | 40.08 | 45.27 | 34.89 |
| Baichuan2-13B-Chat | 3 | 39.40 | 42.63 | 36.18 |
| Ernie-3.5-turbo | 2 | 25.19 | 27.70 | 22.67 |
| Chinese-Alpaca2-13B | 2 | 20.55 | 22.52 | 18.58 |

Table 11 | SC-Math6 Model Reasoning Level. “R Level” stands for Reasoning Level, “Comp. Score” stands for Comprehensive Score, “Reas. Steps Score” stands for Reasoning Steps Score, and “OvrAcc Score” stands for Overall Accuracy Score.

表 11｜SC-Math6 推理等级.

questions of LiveCodeBench are selected from the period between September 1st, 2023, and April 1st, 2024. As shown in the figure, DeepSeek-V2 Chat (RL) demonstrates considerable proficiency in LiveCodeBench, achieving a Pass@1 score that even surpasses some giant models. This performance highlights the strong capability of DeepSeek-V2 Chat (RL) in tackling live coding tasks.

LiveCodeBench 题来自 2023-09-01 至 2024-04-01. 图中 Chat (RL) 的 Pass@1 甚至超过部分巨型模型, 显示其处理实时编程任务的能力.

## G. Evaluation Formats 评测格式

We present our evaluation formats for each benchmark in Table 12-37, respectively.

各基准评测格式见 Table 12–37(与源 md 一致; 下列页保留图片路径与表号).

<!-- page 34 of 52 -->

![Chart block](images/p34-figure-5-evaluation-results-on-humaneval-and.png)

Figure 5 | Evaluation results on HumanEval and LiveCodeBench. The questions of Live-CodeBench are selected from the period between September 1st, 2023 and April 1st, 2024.

图 5｜HumanEval 与 LiveCodeBench 结果.

| PROMPT以下是一道中国高考生物选择题, 请选择正确的答案. 问题: 下列有关高尔基体, 线粒体和叶绿体的叙述, 正确的是选项: (A)三者都存在于蓝藻中(B)三者都含有DNA (C)三者都是ATP 合成的场所(D)三者的膜结构中都含有蛋白质答案: 从A到D, 我们应选择 |
| --- |

Table 12 | An example of AGIEval.

表 12｜AGIEval 示例.

<!-- page 35 of 52 -->

![Image block](images/p35-table-13-an-example-of-arc.png)

Table 13 | An example of ARC.

表 13｜ARC 示例.

<!-- page 36 of 52 -->

![Image block](images/p36-table-14-an-example-of-bbh.png)

Table 14 | An example of BBH.

表 14｜BBH 示例.

<!-- page 37 of 52 -->

**PROMPT**以下是中国关于教育学考试的单项**选择**题, 请选出其中的正确答案. 根据我国心理学家冯忠良教授的学习分类, 培养学生品德要通过A. 知识的学习B. 技能的学习C. 行为规范的学习D. 态度的学习答案: C

开设跨学科课程**或建**立跨学科专业体现了高等教育课程发展的A. 综**合化趋势**B. 多样**化趋势**C. 人**文化趋势**D. 科学**化趋势**答案: A

心智技能的特点有A. 物质性, 外显性, **简缩**性B. 观念性, 内潜性, **简缩**性C. 物质性, 外显性, 展开性D. 观念性, 内潜性, 展开性答案: B

下列关于大学生的情绪与理智关系的说法中正确的是A. 能冷静控制自己情绪B. 感情用事**, 难**以用理智控制情绪C. 遇事能坚持自己正确认识D.**已发**展到不为小事而发怒和怄气答案: B

在学完一**篇逻**辑结构严密的课文以**后, 勾**画出课文的论点论据的逻辑关系图以**帮助理**解和记忆. 这种学习方法属于\_ A. 精细**加工策**略B. 组织策略C. 复述策略D.**做笔**记策略答案: B

有学者强**调, 教**育要根据一个**民族**固有的特征来定, 这种观点体现了A. 生产力对教育的影**响和制**约B.**政治制度**对教育的影**响和制**约C.**文化**对教育的影**响和制**约D. 经**济制度**对教育的影**响和制**约答案:

**OPTIONS** - A - B - C - D

Table 15 | An example of C-Eval.

表 15｜C-Eval 示例.

<!-- page 38 of 52 -->

![Image block](images/p38-table-16-an-example-of-c3.png)

Table 16 | An example of C3.

表 16｜C3 示例.

![Image block](images/p38-table-17-an-example-of-ccpm.png)

Table 17 | An example of CCPM.

表 17｜CCPM 示例.

<!-- page 39 of 52 -->

| PROMPTQ: 某小学在“献爱心-为汶川地震区捐款”活动中, 六年级五个班共捐款8000元, 其中一班捐款1500元, 二班比一班多捐款200元, 三班捐款1600元, 四班与五班捐款数之比是3: 5. 四班捐款多少元? A: 一班捐款1500元, 而二班比一班多捐200元, 所以二班捐款1500+200=1700元, 又知道六年级五个班一共捐款8000元, 所以四班和五班捐款之和=一共捐款-一班和二班和三班捐款之和, 即8000-1500-1700-1600=3200元, 而题目说四班与五班捐款数之比是3: 5, 则四班捐款了3200/(3+5)*3=1200元. 所以答案是: 1200. |
| --- |
| Q: 小俊在东西大道上跑步, 若规定向东为正. 他先向东跑了800米, 然后又跑了一段之后, 他位于出发点西边100米处, 小俊第二段跑了多少米? A: 小俊第二段跑完后位于出发点西边, 所以第二段应该是向西跑, 第二段跑的长度-第一段跑的长度=100, 第二段跑了100+800=900米. 所以答案是: 900. |
| Q: A车和B车同时从甲, 乙两地相向开出, 经过5小时相遇. 然后, 它们又各自按原速原方向继续行驶3小时, 这时A车离乙地还有135千米, B车离甲地还有165千米. 甲, 乙两地相距多少千米? A: 假设A车的速度为x千米每小时, B车的速度为y千米每小时, 根据而A, B相遇时A车行驶了5小时, A车行驶3小时后离乙地还有135千米, B车行驶3小时后距离甲地还有165千米, 可以得到甲乙两地相距=5x+5y=135+8x=165+8y, 变换得到: 10(x+y)=300+8(x+y), 于是x+y=150, 甲乙两地相距5(x+y)=750千米. 所以答案是: 750. |
| Q: 在一个底面半径为10厘米的圆柱形容器内, 倒入10厘米深的水, 然后将一个底面直径4厘米, 高6厘米的圆锥形铅锤放入水中, 容器中水面上升多少厘米? A: |

Table 18 | An example of CMATH.

表 18｜CMATH 示例.

<!-- page 40 of 52 -->

![Image block](images/p40-table-19-an-example-of-cmmlu.png)

Table 19 | An example of CMMLU.

表 19｜CMMLU 示例.

<!-- page 41 of 52 -->

![Image block](images/p41-image.png)

![Image block](images/p41-table-21-an-example-of-drop.png)

Table 21 | An example of DROP.

表 21｜DROP 示例.

![Image block](images/p41-table-22-an-example-of-chid.png)

Table 22 | An example of CHID.

表 22｜CHID 示例.

<!-- page 42 of 52 -->

| PROMPT胡雪岩离船登岸, 坐轿进城, 等王有龄到家, 他接着也到了他那里, 脸上是掩抑不住的笑容, 王有龄夫妇都觉得奇怪, 问他什么事这么高兴. 上面的句子中的「他」指的是胡雪岩 |
| --- |
| 渐渐地, 汤中凝结出一团团块状物, 将它们捞起放进盆里冷却, 肥皂便出现在世上了. 上面的句子中的「它们」指的是块状物 |
| 「她序上明明引着JulesTellier的比喻, 说有个生脱发病的人去理发, 那剃头的对他说不用剪发, 等不了几天, 头毛压儿全掉光了; 大部分现代文学也同样的不值批评. 这比喻还算俏皮.」上面的句子中的「他」指的是生脱发病的人 |
| 在洛伦佐大街的尽头处, 矗立着著名的圣三一大教堂. 它有着巨大的穹顶, 还有明亮的彩色玻璃窗, 上面描绘着「旧约」和「新约」的场景. 上面的句子中的「它」指的是圣三一大教堂 |
| 他伯父还有许多女弟子, 大半是富商财主的外室; 这些财翁白天忙着赚钱, 怕小公馆里的情妇长日无聊, 要不安分, 常常叫她们学点玩艺儿消遣. 上面的句子中的「她们」指的是情妇 |
| 赵雨又拿出了一个杯子, 我们热情地请老王入座, 我边给他倒酒边问: 1962年的哪次记得吗?「上面的句子中的」他"指的是 |

Table 23 | An example of CLUEWSC.

表 23｜CLUEWSC 示例.

<!-- page 43 of 52 -->

| PROMPTQ: Max can mow the lawn in 40 minutes. If it takes him twice that long to fertilize the lawn, how long will it take him to both mow and fertilize the lawn? A: Let's think step by step. It takes Max 2 * 40 minutes = 80 minutes to fertilize the lawn. In total, Max takes 80 minutes + 40 minutes = 120 minutes to both mow and fertilize the lawn. The answer is 120. |
| --- |

Table 24 | An example of GSM8K.

表 24｜GSM8K 示例(完整 few-shot 与源 md 一致, 此处保留首条示意; 完整多题见源文件 page 43).

| PROMPTPlaying piano: A man is seated at a piano. He |
| --- |
| OPTIONS- is playing the piano with his hands and his face.- bigins to play a song by timbaland on the piano.- plays slowly, and pauses to snap his fingers.- is playing a song in front of him. |

Table 25 | An example of HellaSwag.

表 25｜HellaSwag 示例.

<!-- page 44 of 52 -->

![Image block](images/p44-table-26-an-example-of-humaneval.png)

Table 26 | An example of HumanEval.

表 26｜HumanEval 示例.

<!-- page 45 of 52 -->

![Image block](images/p45-table-27-an-example-of-math.png)

Table 27 | An example of MATH.

表 27｜MATH 示例.

<!-- page 46 of 52 -->

(MBPP 评测格式示例 Table 28, 与源 md page 46 代码块一致.)

Table 28 | An example of MBPP.

表 28｜MBPP 示例.

<!-- page 47 of 52 -->

(续 Table 28/29, 与源 md 一致.)

Table 29 | An example of MMLU.

表 29｜MMLU 示例.

<!-- page 48 of 52 -->

![Image block](images/p48-table-30-an-example-of-naturalquestions.png)

Table 30 | An example of NaturalQuestions.

表 30｜NaturalQuestions 示例.

![Image block](images/p48-table-31-an-example-of-openbookqa.png)

Table 31 | An example of OpenBookQA.

表 31｜OpenBookQA 示例.

![Image block](images/p48-table-32-an-example-of-piqa.png)

Table 32 | An example of PIQA.

表 32｜PIQA 示例.

<!-- page 49 of 52 -->

(Table 33 RACE 评测格式与源 md 一致.)

Table 33 | An example of RACE.

表 33｜RACE 示例.

<!-- page 50 of 52 -->

![Image block](images/p50-table-34-an-example-of-triviaqa.png)

Table 34 | An example of TriviaQA.

表 34｜TriviaQA 示例.

![Image block](images/p50-table-35-an-example-of-winogrande-note-that-there-are.png)

Table 35 | An example of WinoGrande. Note that there are two candidate answers for each sample, and we construct two complete sentences by filling in each candidate. We calculate the perplexity of each sentence, and choose the one with lower perplexity.

表 35｜WinoGrande 示例. 每样本两候选, 分别填入成完整句, 取困惑度更低者.

<!-- page 51 of 52 -->

(Table 36–37 评测格式与源 md 一致.)

Table 36 | An example of CMRC.

表 36｜CMRC 示例.

<!-- page 52 of 52 -->

Table 37 | An example of Pile.

表 37｜Pile 示例.

52
