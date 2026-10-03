---
title: "Olmo Hybrid · 对照译稿"
category: "模型库"
tags: ["OLMo", "对照译稿"]
published: true
excerpt: "Olmo Hybrid 公开材料的逐段中英对照译稿,附读报告时的疑问块."
---
<!-- page 1 of 70 -->

arXiv:2604.03444v4 [cs.LG] 15 Jun 2026

# Olmo Hybrid: From Theory to Practice and Back

**William Merrill** <strong><sup>1</sup></strong> **Yanhong Li** <strong><sup>1</sup></strong> **Tyler Romero 1 Anej Svete** <strong><sup>1,4</sup></strong> **Caia Costello** <strong><sup>3</sup></strong> **Pradeep Dasigi**<strong><sup>1</sup></strong> **Dirk Groeneveld**<strong><sup>1</sup></strong> **David Heineman**<strong><sup>1</sup></strong> **Bailey Kuehl**<strong><sup>1</sup></strong> **Nathan Lambert**<strong><sup>1</sup></strong> **Chuan Li**<strong><sup>3</sup></strong> **Kyle Lo**<strong><sup>1,2</sup></strong> **Saumya Malik**<strong><sup>1</sup></strong> **DJ Matusz**<strong><sup>3</sup></strong> **Benjamin Minixhofer**<strong><sup>1,5</sup></strong> **Jacob Morrison**<strong><sup>1,2</sup></strong> **Luca Soldaini**<strong><sup>1</sup></strong> **Finbarr Timbers**<strong><sup>1</sup></strong> **Pete Walsh**<strong><sup>1</sup></strong> **Noah A. Smith**<strong><sup>1,2</sup></strong> **Hannaneh Hajishirzi**<strong><sup>1,2</sup></strong> **Ashish Sabharwal** <strong><sup>1</sup></strong>

<sup>1</sup>Allen Institute for AI <sup>2</sup>University of Washington <sup>3</sup>Lambda ML Team <sup>4</sup>ETH Zürich <sup>5</sup>University of Cambridge

willm@allenai.org marks core contributors. See author contributions here.

**Collection:** [Olmo-Hybrid-7B](https://huggingface.co/collections/allenai/olmo-hybrid)

**Training Logs:** [Olmo-3-7B-vs-Olmo-Hybrid](https://wandb.ai/ai2-llm/Olmo-Hybrid-7B/reports/Olmo-3-7B-vs-Olmo-Hybrid--VmlldzoxNjA5NDIyNg)

**Training Code:** [OLMo-core](https://github.com/allenai/OLMo-core) ([pretrain](https://github.com/allenai/OLMo-core/blob/main/src/scripts/official/OLMo-hybrid/OLMo-hybrid-7B-pretrain.py), [mid-train](https://github.com/allenai/OLMo-core/blob/main/src/scripts/official/OLMo-hybrid/OLMo-hybrid-7B-midtrain.py), [long context](https://github.com/allenai/OLMo-core/blob/main/src/scripts/official/OLMo-hybrid/OLMo-hybrid-7B-long-context.py), [sft-think](https://github.com/allenai/OLMo-core/blob/main/src/scripts/official/OLMo-hybrid/OLMo-hybrid-7B-sft-think.py), [sft-instruct](https://github.com/allenai/OLMo-core/blob/main/src/scripts/official/OLMo-hybrid/OLMo-hybrid-7B-sft-instruct.py))

## Abstract

![Image block](images/p01-recent-work-has-demonstrated-the-potential-of-non.png)

Recent work has demonstrated the potential of non-transformer language models, especially linear recurrent neural networks (RNNs) and hybrid models that mix recurrence and attention. Yet there is no consensus on whether the potential benefits of these new architectures justify the risk and effort of scaling them up. To address this, we provide evidence for the advantages of hybrid models over pure transformers on several fronts. First, theoretically, we show that hybrid models do not merely inherit the expressivity of transformers and linear RNNs, but can express tasks beyond both, such as code execution. Putting this theory to practice, we train **Olmo Hybrid**, a 7B-parameter model largely comparable to Olmo 3 7B but with the sliding window layers replaced by Gated DeltaNet layers. We show that Olmo Hybrid outperforms Olmo 3 across standard pretraining and mid-training evaluations, demonstrating the benefit of hybrid models in a controlled, large-scale setting. We find that the hybrid model scales significantly more efficiently than the transformer, explaining its higher performance. However, its unclear why greater expressivity on specific formal problems should result in better scaling or superior performance on downstream tasks unrelated to those problems. To explain this apparent gap, we return to theory and argue why increased expressivity should translate to better scaling efficiency, completing the loop. Overall, our results suggest that hybrid models mixing attention and recurrent layers are a powerful extension to the language modeling paradigm: not merely to reduce memory during inference, but as a fundamental way to obtain more expressive models that scale better during pretraining.

近期工作已展示非 Transformer 语言模型的潜力, 尤其是线性循环神经网络 (RNN) 以及把递归与注意力混在一起的 hybrid 模型. 然而社区尚未就一件事达成共识: 这些新架构的潜在收益, 是否足以支撑把它们做大的风险与投入. 为此, 我们从几条战线给出 hybrid 相对纯 Transformer 的优势证据. 首先在理论上, 我们证明 hybrid 并不只是继承 Transformer 与线性 RNN 的表达力, 还能表达两者都做不到的任务, 例如代码执行. 把理论落到实践, 我们训练 **Olmo Hybrid**: 一个大体可比 Olmo 3 7B 的 7B 参数模型, 只是把滑动窗层换成 Gated DeltaNet 层. 我们表明 Olmo Hybrid 在标准预训练与 mid-training 评测上超过 Olmo 3, 在可控的大规模设定下展示 hybrid 的收益. 我们发现 hybrid 相对 Transformer 显著更高效地 Scaling, 这解释了它更高的表现. 但为何特定形式问题上的更高表达力, 会带来更好的 Scaling, 或在与那些问题无关的下游任务上更强, 起初并不清楚. 为解释这道缝隙, 我们回到理论, 论证提高表达力为何应转化为更好的 Scaling 效率, 从而闭环. 总体而言, 结果表明把注意力与递归层混合的 hybrid 模型, 是对语言建模范式的有力扩展: 不只为了推理时省内存, 更是在部署前获得更有表达力, 预训练 Scaling 更好的模型的根本路径.

> **想:** Abstract 把 「scales significantly more efficiently」 与推理省内存并提; Fig. 1 的 35%/49% 少用的是训练 token 还是 TestingTime?
> 是部署前训练 token (因而也是训练 FLOPs). Abstract 后文写 「scale better during pretraining」; Fig. 1 明确是同一 Common Crawl loss / MMLU 下更少 training tokens. 推理省状态是另一条轴, 见 Tab. 1, 不是 Fig. 1 的纵轴.

<!-- page 2 of 70 -->

## Contents

- 1 Introduction 3
- 2 Olmo Hybrid Overview 4
  - 2.1 Architecture 4
  - 2.2 Training Overview 4
  - 2.3 Olmo Hybrid Results 5
- 3 Expressive Power of Hybrid Models 7
  - 3.1 Background: Expressive Power of Transformers 8
  - 3.2 Background: Expressive Power of Linear RNNs 9
  - 3.3 Hybrid Models are More Than the Sum of Their Parts 10
  - 3.4 Expressive Power of Padded Hybrid Models 11
  - 3.5 Synthetic Evaluations 13
  - 3.6 Discussion: Pushing the Expressivity-Parallelism Frontier 13
- 4 Scaling Behavior of Hybrid Models 14
  - 4.1 Scaling Laws for Hybrid Models 14
  - 4.2 Theory: Increased Expressive Power Improves Scaling 18
  - 4.3 Discussion: From Expressivity to Scaling 22
- 5 Other Research Questions 22
  - 5.1 RNN and Hybridization Architecture Choices 22
  - 5.2 Olmo Hybrid vs. Other Open Models 25
  - 5.3 Post-Training Olmo Hybrid 26
- 6 Conclusion 29
- A Training Olmo Hybrid 39
  - A.1 Pretraining 39
  - A.2 Mid-Training and Long Context Extension 40
  - A.3 Post-Training 41
  - A.4 Evaluation Details 41
- B Proofs: Expressive Power of Hybrid Models 41
  - B.1 Limitations of Transformers and RNNs 42
  - B.2 Power of Hybrid Models 44
  - B.3 Padded Hybrid Models 45
- C Additional Details: Synthetic Evaluations 46
  - C.1 Tasks and Evaluation Protocol 46
  - C.2 Model Architectures 46
  - C.3 Training Details 46
- D Scaling and Ablation Experiments: Details and Additional Results 49
  - D.1 Additional Results 49
  - D.2 Details on the Scaling Law Fits 50
  - D.3 Architectural Details 53
  - D.4 Parameter Count and FLOP Computations 55
- E Proofs: Increased Expressive Power Improves Scaling 61
  - E.1 Scaling Law with Tasks Learned 62
  - E.2 Parameter Scaling Law 64
  - E.3 Data Scaling Law 64
  - E.4 Main Results 67

<!-- page 3 of 70 -->

## Introduction

Transformers have become the backbone architecture for language models (Radford and Narasimhan, 2018), after initially eclipsing RNNs in machine translation (Vaswani et al., 2017). Recently, theoretical and empirical work has characterized the limitations of transformers (Strobl et al., 2024) and the potential for alternative recurrent architectures to overcome them (Merrill et al., 2024; Grazzi et al., 2025). Transformers lack the expressive power to robustly represent state tracking tasks, which require sequential computation (Merrill and Sabharwal, 2023; Chiang, 2025). While the parallelism of transformers is important for efficient training, a longstanding issue at inference time is their quadratic scaling with context length. Modern RNNs strike a better balance: their compute scales linearly with context length, and, unlike classical RNNs (Elman, 1990; Hochreiter and Schmidhuber, 1997), they can be parallelized through linear gating (Bradbury et al., 2017; Katharopoulos et al., 2020; Gu et al., 2022; Gu and Dao, 2024). Moreover, these linear RNNs can also express state tracking tasks, giving an expressivity advantage over transformers (Merrill et al., 2024; Grazzi et al., 2025; Peng et al., 2025).

Transformer 已成为语言模型的骨干架构 (Radford and Narasimhan, 2018), 此前它在机器翻译上已压过 RNN (Vaswani et al., 2017). 近期理论与实证工作刻画了 Transformer 的局限 (Strobl et al., 2024), 以及替代递归架构克服这些局限的潜力 (Merrill et al., 2024; Grazzi et al., 2025). Transformer 缺乏稳健表示 state tracking 任务的表达力, 这类任务需要顺序计算 (Merrill and Sabharwal, 2023; Chiang, 2025). 虽然 Transformer 的并行性对高效训练很重要, 推理时相对上下文长度的二次 Scaling 仍是长期问题. 现代 RNN 取得更好折中: 算力随上下文长度线性增长, 且与经典 RNN (Elman, 1990; Hochreiter and Schmidhuber, 1997) 不同, 可通过线性门控并行化 (Bradbury et al., 2017; Katharopoulos et al., 2020; Gu et al., 2022; Gu and Dao, 2024). 此外这些线性 RNN 也能表达 state tracking, 相对 Transformer 有表达力优势 (Merrill et al., 2024; Grazzi et al., 2025; Peng et al., 2025).

However, switching from transformers to RNNs is not a free lunch, as RNNs (even linear ones) struggle with copying and recall tasks due to their bounded state (Arora et al., 2024a; Jelassi et al., 2024). This has led to the exploration of hybrid models that mix attention and linear RNN layers in order to leverage the benefits of both architectural primitives. Recently, hybrid models have been trained at scales up to 9B active parameters and 36T tokens (e.g., Mamba-2-Hybrid, Waleffe et al., 2024; Samba, Ren et al., 2025; Nemotron-H, NVIDIA, 2025; Qwen3-Next, Qwen Team, 2025; Kimi Linear, Kimi Team, 2025; and Qwen 3.5, Qwen Team, 2026) with encouraging results. Yet there is not yet consensus on whether the advantages of hybrid models justify the cost and risk of switching to a fundamentally different architecture, in part because a controlled comparison between transformer and modern hybrid LMs is lacking at large scale.

但切到 RNN 并非免费午餐: 即便是线性 RNN, 也因有界状态在复制与召回任务上吃力 (Arora et al., 2024a; Jelassi et al., 2024). 于是出现把注意力与线性 RNN 层混合的 hybrid 模型, 以同时吃两边红利. 近期 hybrid 已训到约 9B 激活参数与 36T token (如 Mamba-2-Hybrid, Waleffe et al., 2024; Samba, Ren et al., 2025; Nemotron-H, NVIDIA, 2025; Qwen3-Next, Qwen Team, 2025; Kimi Linear, Kimi Team, 2025; Qwen 3.5, Qwen Team, 2026), 结果鼓舞. 但社区仍未就 「收益是否撑得住换架构的成本与风险」 达成共识, 部分原因是大规模下 Transformer 与现代 hybrid LM 的可控对照仍然缺失.

To rectify this gap, we introduce **Olmo Hybrid**, a family of model artifacts comparable to Olmo 3 except that the architecture interleaves Gated DeltaNet (GDN, Yang et al., 2025a; Grazzi et al., 2025) layers with attention layers at a 3:1 ratio in place of the sliding-window-attention layers used in Olmo 3. We train Olmo Hybrid 7B on up to 6T tokens, finding large improvements in token efficiency (and thus also compute efficiency): Olmo Hybrid matches Olmo 3 7B on MMLU (Hendrycks et al., 2021) with 49% fewer training tokens. After pretraining, this token efficiency translates to improvements on MMLU and other evaluations, with gains persisting after mid-training; the final Olmo Hybrid base checkpoint outperforms Olmo 3 across all aggregated domains of OlmoBaseEval. Beyond these standard base model evaluations, Olmo Hybrid shows large gains in long-context ability, with a 14.1% improvement on RULER 64k over Olmo 3. Because Olmo Hybrid is closely comparable to Olmo 3 apart from its hybrid architecture, we take these results as strong evidence in favor of hybrid models over pure transformers.

为补这一缺口, 我们引入 **Olmo Hybrid**: 一组大体可比 Olmo 3 的模型产物, 唯一关键架构差是把 Olmo 3 的滑动窗注意力层换成 Gated DeltaNet (GDN, Yang et al., 2025a; Grazzi et al., 2025) 与注意力按 3:1 交错. 我们把 Olmo Hybrid 7B 训到最多 6T token, 发现 token 效率 (因而也是算力效率) 大幅提升: 在 MMLU (Hendrycks et al., 2021) 上追平 Olmo 3 7B 只需少 49% 的训练 token. 预训练后, 这一 token 效率转化为 MMLU 及其他评测上的提升, 并在 mid-training 后保持; 最终 Olmo Hybrid base 检查点在 OlmoBaseEval 全部聚合域上超过 Olmo 3. 在标准 base 评测之外, 长上下文能力也大幅提升: RULER 64k 相对 Olmo 3 高 14.1%. 因为除 hybrid 架构外 Olmo Hybrid 与 Olmo 3 高度可比, 我们把这些结果视为支持 hybrid 优于纯 Transformer 的强证据.

> **问:** Introduction 写 RULER 64k 相对 Olmo 3 提升 14.1%; 这对应 Tab. 3 哪一行差值?
> Tab. 3: Olmo 3 + YaRN 在 64k 为 70.9; Olmo Hybrid + DroPE 为 85.0; 85.0 - 70.9 = 14.1. Hybrid + YaRN 为 76.9, 相对 70.9 只高 6.0, 引言的 14.1 对齐发布所选的 DroPE 行.

Beyond large-scale experiments, we also present theoretical results and fully controlled scaling studies to explain these performance gains. Past theoretical work has shown attention and recurrence have complementary strengths (Merrill et al., 2024; Grazzi et al., 2025). Mixing them is, thus, a natural way to reap the benefits of both primitives. We extend this with novel theory showing that hybrid models are more powerful than the sum of their parts: there are formal problems related to code evaluation that neither transformers nor GDN can express on their own, but which hybrid models can represent theoretically and learn empirically. This greater expressivity does not immediately imply that hybrid models should be better LMs. We therefore run controlled scaling studies comparing hybrid models to transformers and show that they indeed attain better token efficiency, consistent with our observations from the Olmo Hybrid pretraining run. It is not clear prima facie why greater expressivity on specific formal problems should improve scaling efficiency on benchmarks like MMLU. To fill this gap, we develop a formal explanation of how increasing an architecture's expressivity can improve data and compute efficiency for loss and downstream tasks—even on tasks unrelated to new problems expressible by the model.

在大规模实验之外, 我们还给出理论结果与完全可控的 Scaling 研究, 以解释这些性能增益. 既有理论已表明注意力与递归优势互补 (Merrill et al., 2024; Grazzi et al., 2025). 混合二者因此是自然吃两边红利的方式. 我们进一步给出新理论: hybrid 比 「部分之和」 更强. 存在与代码求值相关的形式问题, 纯 Transformer 与纯 GDN 各自都表达不了, 但 hybrid 在理论上可表示, 在实验上可学会. 更高表达力并不立刻意味着 hybrid 必是更好的 LM. 因此我们做可控 Scaling 研究, 比较 hybrid 与 Transformer, 表明它们确实有更好的 token 效率, 与 Olmo Hybrid 预训练观察一致. 乍看并不清楚为何特定形式问题上的更高表达力, 会改善 MMLU 这类基准上的 Scaling 效率. 为填补这一缺口, 我们给出形式解释: 提高架构表达力如何改善 loss 与下游任务上的数据与算力效率. 即便那些下游任务与模型新获得的可表达问题无关.

Taken together, our results suggest that hybrid models dominate transformers both theoretically, in their balance of expressivity and parallelism, and empirically, in terms of benchmark performance and long-context abilities. We believe these findings position hybrid models for wider adoption and call on the research community to pursue further architecture research.

合在一起, 结果表明 hybrid 在理论上 (表达力与并行度的平衡) 与实证上 (基准表现与长上下文能力) 都压过 Transformer. 我们相信这些发现有助于 hybrid 更广泛被采用, 并呼吁社区继续做架构研究.

<!-- page 4 of 70 -->

## 2 Olmo Hybrid Overview 概述

### 2.1 Architecture 架构

Our architecture matches that of Olmo 3 7B (see Olmo Team, 2025 for details), except that 75% of layers use GDN heads in place of attention heads. The layers alternate so that 3 GDN layers are followed by 1 multi-head attention layer. In particular, each GDN head uses GDN (Yang et al., 2025a) extended with negative eigenvalues (Grazzi et al., 2025):

我们的架构与 Olmo 3 7B 对齐 (细节见 Olmo Team, 2025), 唯一例外是 75% 的层用 GDN 头替换注意力头. 层交错方式为: 3 个 GDN 层后接 1 个多头注意力层. 具体地, 每个 GDN 头采用带负特征值扩展的 GDN (Yang et al., 2025a; Grazzi et al., 2025):

**Definition 1: GDN with Negative Eigenvalues** (Schlag et al., 2021; Yang et al., 2025a; Grazzi et al., 2025) Let d be the head dimension. For each token t, we are given $\mathbf { q } _ { t } , \mathbf { k } _ { t } \in \mathbb { R } ^ { d } ,   \mathbf { v } _ { t } \in \mathbb { R } ^ { 2 d }$ and $\alpha _ { t } , \beta _ { t } \in ( 0 , 1 )$ , with $\| \mathbf { k } _ { t } \| = 1$ The initial state $\mathbf { S } _ { 0 }$ is the 0 matrix. The state $\mathbf { S } _ { t } \in \mathbb { R } ^ { 2 d \times d }$ and head output $\mathbf { y } _ { t } \in \mathbb { R } ^ { 2 d }$ are updated via

**Definition 1: 带负特征值的 GDN** (Schlag et al., 2021; Yang et al., 2025a; Grazzi et al., 2025) 设 d 为头维. 对每个 token t, 给定 $\mathbf { q } _ { t } , \mathbf { k } _ { t } \in \mathbb { R } ^ { d } ,   \mathbf { v } _ { t } \in \mathbb { R } ^ { 2 d }$ 以及 $\alpha _ { t } , \beta _ { t } \in ( 0 , 1 )$, 且 $\| \mathbf { k } _ { t } \| = 1$. 初始状态 $\mathbf { S } _ { 0 }$ 为零矩阵. 状态 $\mathbf { S } _ { t } \in \mathbb { R } ^ { 2 d \times d }$ 与头输出 $\mathbf { y } _ { t } \in \mathbb { R } ^ { 2 d }$ 按如下更新:

$$
\left| \begin{array}{l} \mathbf {S} _ {t} = \mathbf {S} _ {t - 1} \alpha_ {t} (\mathbf {I} - 2 \beta_ {t} \mathbf {k} _ {t} \mathbf {k} _ {t} ^ {\top}) + \mathbf {v} _ {t} \mathbf {k} _ {t} ^ {\top} \\ \mathbf {y} _ {t} = \mathbf {S} _ {t} \mathbf {q} _ {t}. \end{array} \right|
$$

GDN extends the earlier DeltaNet (Schlag et al., 2021; Yang et al., 2024c) by adding the decay factor $\alpha _ { t } \in ( 0 , 1 )$ on the state update. The negative eigenvalue extension replaces $\beta _ { t }$ from the original GDN with $2 \beta _ { t }$ . Despite its simplicity, this change has important consequences for the expressive power of GDN (Grazzi et al., 2025), and we therefore adopt it—in contrast to the GDN architecture used by Qwen-3-Next (Qwen Team, 2025), Kimi Linear (Kimi Team, 2025), and Qwen 3.5 (Qwen Team, 2026).

GDN 在更早的 DeltaNet (Schlag et al., 2021; Yang et al., 2024c) 上, 给状态更新加上衰减因子 $\alpha _ { t } \in ( 0 , 1 )$. 负特征值扩展则把原版 GDN 的 $\beta _ { t }$ 换成 $2 \beta _ { t }$. 改动看似简单, 却对 GDN 的表达力有重要后果 (Grazzi et al., 2025), 因此我们采用它. 这与 Qwen-3-Next (Qwen Team, 2025), Kimi Linear (Kimi Team, 2025), Qwen 3.5 (Qwen Team, 2026) 所用的 GDN 架构形成对照.

A GDN head fits seamlessly into the overall transformer architecture from Olmo 3 since we can use the standard query, key, and value projections as inputs and treat $\mathbf { y } _ { t }$ as the per-head output. It is straightforward to construct a hybrid model by replacing entire attention layers with GDN layers—substituting each attention head with a GDN head. In particular, we replace the sliding-window attention (SWA) layers (75% of layers) from Olmo 3 in this way, resulting in a 3:1 hybridization ratio. In GDN, the value vector is typically twice the length of that in a transformer, and $\beta _ { t }$ requires a few extra parameters to compute. Thus, we slightly adjust the shape of the model to match Olmo 3 in parameter count and training throughput (see Section 2.2).

GDN 头可无缝嵌入 Olmo 3 的整体 Transformer 架构: 仍用标准 query / key / value 投影作输入, 并把 $\mathbf { y } _ { t }$ 当作每头输出. 用 GDN 层整层替换注意力层. 每个注意力头换成一个 GDN 头. 即可构造 hybrid 模型. 具体地, 我们如此替换 Olmo 3 的滑动窗注意力 (SWA) 层 (占 75% 层), 得到 3:1 混合比. GDN 中 value 向量通常是 Transformer 的两倍长, 且 $\beta _ { t }$ 需要少量额外参数. 因此我们略调模型形状, 使参数量与训练吞吐对齐 Olmo 3 (见 §2.2).

**Why GDN?** As we discuss in Section 3, GDN with negative eigenvalues, unlike linear attention (Katharopoulos et al., 2020) or Mamba (Gu and Dao, 2024), can express state tracking problems that transformers cannot. Moreover, in Section 3, we prove that hybrid models with attention and GDN layers can express more than purely attention or purely GDN models. Complementing these expressivity results, we show empirically in Section 4.1 that hybrid models with GDN exhibit favorable scaling properties relative to transformers, and provide a theoretical explanation for why their additional expressive power should translate into more efficient scaling (Section 4.2).

**为何选 GDN?** 如 §3 所述, 带负特征值的 GDN 不同于线性注意力 (Katharopoulos et al., 2020) 或 Mamba (Gu and Dao, 2024), 能表达 Transformer 做不到的 state tracking. 此外 §3 证明: 注意力与 GDN 层组成的 hybrid, 表达力超过纯注意力或纯 GDN. 与表达力结果互补, §4.1 实证显示带 GDN 的 hybrid 相对 Transformer 有更优 Scaling 性质, §4.2 再给出理论解释: 额外表达力为何应转化为更高效的 Scaling.

Another important advantage of Olmo Hybrid's GDN layers over Olmo 3's SWA layers is the reduced per-layer inference state size, as shown in Table 1.

Olmo Hybrid 的 GDN 层相对 Olmo 3 的 SWA 层还有另一重要优势: 每层推理状态更小, 见表 1.

Table 1 Per-layer inference state size comparison under the Olmo 3 configuration stored in fp16.

表 1 在 Olmo 3 配置, fp16 存储下的每层推理状态大小对照.

| Layer Type | Elements | FP16 Size | vs. GDN |
| --- | --- | --- | --- |
| Multi-Head Attention (32K seq, 32 KV heads, d<sub>h</sub>=128) | 268.4M | 512 MiB | 485× |
| Grouped-Query Attention (32K seq, 8 KV heads, d<sub>h</sub>=128) | 67.1M | 128 MiB | 121× |
| Grouped-Query SWA (4096 window, 8 KV heads, d<sub>h</sub>=128) | 8.39M | 16.0 MiB | 15.2× |
| Olmo Hybrid GDN (30 heads, d<sub>k</sub>=96, d<sub>v</sub>=192) | 0.55M | 1.05 MiB | - |

> **看表:** Tab. 1 里 GQA-SWA 相对 GDN 是 15.2×; 这 15.2× 比的是 Elements/FP16 Size, 还是把序列长度也折进去了?
> 表内直接比 Elements 与 FP16 Size: SWA 8.39M / 16.0 MiB 对 GDN 0.55M / 1.05 MiB. SWA 行已把 window=4096 写进规格; GDN 行状态与序列长度无关. 不是另开 TestingTime 档, 是每层推理状态体积.

### 2.2 Training Overview 训练概览

**Pretraining.** Overall, Olmo Hybrid aims to use the same hyperparameters and training configuration as Olmo 3 to maximize comparability, though we made a few small changes where warranted. In particular,

**预训练.** 总体目标是尽量沿用 Olmo 3 的超参与训练配置以最大化可比性, 仅在确有必要时做少量改动. 具体地,

<!-- page 5 of 70 -->

![Chart block](images/p05-chart.png)

![Chart block](images/p05-figure-1-olmo-hybrid-7b-is-more-efficient-than-olmo-3.png)

Figure 1 Olmo Hybrid 7B is more efficient than OLMo 3 7B during pretraining, reaching the same Common Crawl loss in 35% fewer tokens and the same MMLU accuracy using 49% fewer tokens (and thus also 35% and 49% fewer FLOPs, respectively).

图 1 预训练中 Olmo Hybrid 7B 比 OLMo 3 7B 更高效: 达到同一 Common Crawl loss 少用 35% token, 达到同一 MMLU 准确率少用 49% token (因而 FLOPs 也分别少 35% 与 49%).

since GDN has more parameters than a transformer with the same hyperparameters, we reduced the number of heads in Olmo Hybrid from 32 to 30 and set the key and query head dimension to 96 and the value head dimension to 192. This yielded an Olmo Hybrid 7B model with 7.0B parameters (compared to 6.8B for Olmo 3) that closely matched—in fact, slightly outperformed—Olmo 3 7B in early training throughput benchmarks. We will refer to this model as **Olmo Hybrid 7B**. We also made a few other minor changes to the hyperparameters and training configuration from Olmo 3; see Section A.1 for more details.

因为在相同超参下 GDN 比 Transformer 参数更多, 我们把 Olmo Hybrid 的头数从 32 减到 30, 并把 key/query 头维设为 96, value 头维设为 192. 于是得到 7.0B 参数的 Olmo Hybrid 7B (Olmo 3 为 6.8B), 在早期训练吞吐基准上与 Olmo 3 7B 接近. 实际上略优. 下文称该模型为 **Olmo Hybrid 7B**. 相对 Olmo 3 还有少量其他超参与训练配置改动; 见附录 A.1.

**Mid-Training.** Mid-training largely follows the procedure from Olmo 3 (Olmo Team, 2025): adaptation on the mid-training data used for Olmo 3 32B (light filtering applied to the mid-training mixture for Olmo 3 7B) followed by long-context extension. We used a doubled mid-training batch size based on a refined understanding of the interplay between learning rate and batch size since training Olmo 3 (Merrill et al., 2025). As for Olmo 3 32B, we conduct two separate mid-training runs on different 100B token subsets of Dolma 3 Dolmino Mix and merge the final checkpoints. For long-context extension, we experimented with the YaRN methodology (Peng et al., 2024) used for Olmo 3, as well as dropping RoPE entirely (DroPE, Gelberg et al., 2025). DroPE removes RoPE after mid-training, eliminating the extrapolation bottleneck imposed by rotation frequencies learned at shorter context lengths. We hypothesize that DroPE is well suited to hybrid architectures because the GDN layers already provide implicit positional encoding through their recurrent structure, reducing the model's reliance on RoPE. While we chose DroPE for the released Olmo Hybrid, we evaluate Olmo Hybrid with both methods for comparability (see Table 3). We run long-context extension on 100B tokens of Dolma 3 Longmino Mix.

**Mid-Training.** Mid-training 大体沿用 Olmo 3 (Olmo Team, 2025): 在 Olmo 3 32B 所用 mid-training 数据上适配 (对 Olmo 3 7B 的 mid 混合做轻过滤), 再接长上下文扩展. 基于训 Olmo 3 之后对学习率与 batch 关系的更精细理解 (Merrill et al., 2025), mid-training batch 加倍. 与 Olmo 3 32B 一样, 我们在 Dolma 3 Dolmino Mix 的不同 100B token 子集上各跑一次 mid-training, 再合并最终检查点. 长上下文扩展上, 我们试验了 Olmo 3 用的 YaRN (Peng et al., 2024), 以及完全去掉 RoPE 的 DroPE (Gelberg et al., 2025). DroPE 在 mid-training 后移除 RoPE, 从而去掉短上下文上学到的旋转频率对外推的瓶颈. 我们假设 DroPE 很适合 hybrid: GDN 层已通过递归结构提供隐式位置编码, 降低对 RoPE 的依赖. 发布版选 DroPE, 但仍用两种方法评测以利对照 (见表 3). 长上下文扩展在 Dolma 3 Longmino Mix 的 100B token 上运行.

As a proof of concept, we also apply the Olmo 3 post-training recipe to Olmo Hybrid in Section 5.3.

作为概念验证, §5.3 还把 Olmo 3 后训练配方应用到 Olmo Hybrid.

### 2.3 Olmo Hybrid Results 结果

**Baselines.** To evaluate the performance of hybrid models, we focus on the largely clean comparison between Olmo 3 and Olmo Hybrid at a large scale of 7B parameters and 6T tokens. Later, in Section 4.1, we complement this with extensive fully controlled experiments between transformers and hybrid models at smaller scale, as well as, in Section 5.2, comparisons against other released (but not perfectly comparable) transformers, linear RNNs, and hybrid models.

**基线.** 为评估 hybrid, 我们聚焦 Olmo 3 与 Olmo Hybrid 在 7B 参数,6T token 大规模上的大体干净对照. 稍后 §4.1 用更小规模上 Transformer 与 hybrid 的大量完全可控实验补充; §5.2 再对照其他已发布 (但并非完美可比) 的 Transformer, 线性 RNN 与 hybrid.

**Pretraining Efficiency.** As shown in Figure 1, Olmo Hybrid is more compute- and data-efficient than Olmo 3, reaching the same Common Crawl loss and MMLU accuracy as Olmo 3 7B with significantly fewer training tokens. By the end of the 6T-token training run, this increased efficiency of Olmo Hybrid translates to gains

**预训练效率.** 如图 1, Olmo Hybrid 比 Olmo 3 更省算力与数据: 达到与 Olmo 3 7B 相同的 Common Crawl loss 与 MMLU 准确率, 所需训练 token 显著更少. 到 6T token 训练结束时, 这一更高效率转化为相对 Olmo 3 的增益

> **核对:** Fig. 1 写少 35% token 追平 Common Crawl loss, 少 49% 追平 MMLU; 正文说 「thus also 35% and 49% fewer FLOPs」. 这里 FLOPs 是否按 C=6ND 与 token 同比例?
> 是. 图注写 「and thus also 35% and 49% fewer FLOPs, respectively」, 在 N 固定的 7B 对照下, 训练 FLOPs 随 D 近似同比例. 这是部署前训练算力, 不是 TestingTime.

<!-- page 6 of 70 -->

| Model | Math | Base Code | Aggrega MC<sub>STEM</sub> | te Scores MC<sub>Non-STEM</sub> | GenQA | LBPP | Held-BBH | out Scor MMLU Pro | es DM Math |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Olmo 3 7B Pretrain | 23.3 | 19.6 | 64.0 | 71.9 | 68.5 | 6.3 | 48.6 | 31.2 | 15.7 |
| Olmo Hybrid 7B Pretrain | 27.0 | 17.1 | 67.4 | 75.5 | 66.8 | 2.9 | 52.2 | 35.7 | 13.2 |
| Olmo 3 7B Midtrain | 59.8 | 32.1 | 67.3 | 78.2 | 71.3 | 17.8 | 65.9 | 36.6 | 23.8 |
| Olmo Hybrid 7B Midtrain | 61.2 | 32.9 | 70.9 | 81.3 | 73.6 | 17.7 | 68.6 | 43.1 | 23.7 |
| Olmo 3 7B LC | 54.6 | 30.9 | 66.2 | 78.2 | 72.5 | 17.7 | 64.0 | 37.2 | 23.6 |
| Olmo Hybrid 7B LC | 55.1 | 32.4 | 70.0 | 80.4 | 72.9 | 16.8 | 65.2 | 41.7 | 23.4 |

Table 2 Base model evaluations across the training pipeline for Olmo Hybrid vs. Olmo 3. After mid-training, Olmo Hybrid outperforms Olmo 3 7B across every evaluation domain. On evaluations held out from Olmo 3 development (right), Olmo Hybrid outperforms Olmo 3 on MMLU Pro and BBH but loses slightly on LBPP and DM Math. Overall, the results suggest that Olmo Hybrid 7B generally outperforms Olmo 3 7B.

表 2 训练管线各阶段 Olmo Hybrid 对 Olmo 3 的 base 评测. Mid-training 后 Hybrid 在每个评测域都超过 Olmo 3 7B. 在 Olmo 3 开发过程 held-out 的评测上 (右), Hybrid 在 MMLU Pro 与 BBH 领先, 在 LBPP 与 DM Math 略退. 总体表明 Olmo Hybrid 7B 大体强于 Olmo 3 7B.

<table><tr><td rowspan="2">Model</td><td rowspan="2">LC Method</td><td colspan="5">RULER Scores</td></tr><tr><td>4k</td><td>8k</td><td>16k</td><td>32k</td><td>64k</td></tr><tr><td>Olmo 3 7B</td><td>YaRN</td><td>95.8</td><td>89.3</td><td>83.2</td><td>78.9</td><td>70.9</td></tr><tr><td>Olmo Hybrid 7B</td><td>YaRN</td><td>92.8</td><td>91.3</td><td>90.0</td><td>84.7</td><td>76.9</td></tr><tr><td>Olmo Hybrid 7B</td><td>DroPE</td><td>92.2</td><td>89.8</td><td>88.4</td><td>86.2</td><td>85.0</td></tr></table>

Table 3 Results for Olmo Hybrid after long-context tension with YaRN and DroPE compared against Olmo 3. Both methods outperform Olmo 3 7B at long sequence lengths, with the gains from DroPE being particularly notable.

表 3 Olmo Hybrid 经 YaRN 与 DroPE 长上下文扩展后相对 Olmo 3 的结果. 两种方法在长序列上都超过 Olmo 3 7B, DroPE 增益尤为显著.

on both metrics compared to Olmo 3. This pretraining efficiency is a compelling fundamental advantage of hybrid models over transformers. Additional pretraining efficiency curves across 6 downstream benchmarks are shown in Appendix Figure 15.

(接上页) 在两项指标上都相对 Olmo 3 取得增益. 这一预训练效率是 hybrid 相对 Transformer 的有力根本优势. 另外 6 个下游基准上的预训练效率曲线见附录 Fig. 15.

**Standard Benchmarks.** In Table 2, we compare Olmo Hybrid and Olmo 3 7B across different stages of pretraining and mid-training on domain-specific and held-out evaluation splits from OlmoBaseEval. The final pretrained Olmo Hybrid checkpoint outperforms Olmo 3 7B on math (+4.3%), STEM MC (+3.4%), and non-STEM MC (+4.4%), with smaller degradations in code (-2.5%) and general QA (-2.3%). However, after mid-training, Olmo Hybrid outperforms Olmo 3 7B across every evaluation domain, and these performance gains persist after long-context extension. Additionally, we compare Olmo 3 and Olmo Hybrid on evaluations held out from the Olmo 3 development process. On these held-out evaluations, we find gains on MMLU Pro (Wang et al., 2024) (+4.5%) and BBH (Suzgun et al., 2022) (+1.2%) but degradations on LBPP (Matton et al., 2024) (-1.1%) and DM Math (Saxton et al., 2019) (-0.2%). Taken together, the domain-specific and held-out evaluations point to strong performance of the Olmo Hybrid 7B base model relative to Olmo 3 7B.

**标准基准.** Tab. 2 比较预训练与 mid-training 各阶段 Olmo Hybrid 与 Olmo 3 7B 在 OlmoBaseEval 域内与 held-out 划分上的表现. 最终预训练检查点在 math (+4.3%), STEM MC (+3.4%), non-STEM MC (+4.4%) 上超过 Olmo 3 7B, 代码 (-2.5%) 与 general QA (-2.3%) 略退. 但 mid-training 后 Hybrid 在每个评测域都超过 Olmo 3 7B, 且增益在长上下文扩展后保持. 另外在 Olmo 3 开发 held-out 评测上: MMLU Pro (Wang et al., 2024) +4.5%, BBH (Suzgun et al., 2022) +1.2%, LBPP (Matton et al., 2024) -1.1%, DM Math (Saxton et al., 2019) -0.2%. 合起来, 域内与 held-out 都指向 Olmo Hybrid 7B base 相对 Olmo 3 7B 的强表现.

**Long-Context Capabilities.** Additionally, after long-context extension (Olmo Team, 2025), we find that Olmo Hybrid shows substantial gains on RULER (Hsieh et al., 2024), a standard long-context benchmark, over Olmo 3. We adapt Olmo Hybrid for long context using both the YaRN methodology (Peng et al., 2024) from Olmo 3 (Olmo Team, 2025) and the more recent DroPE method (Gelberg et al., 2025). As shown in Table 3, Olmo Hybrid 7B outperforms Olmo 3 7B at long RULER lengths with both YaRN and DroPE. We attribute these gains on long-context tasks to the presence of linear RNN layers, in line with existing findings in the literature (Yang et al., 2025b; Ren et al., 2025).

**长上下文能力.** 长上下文扩展 (Olmo Team, 2025) 后, Olmo Hybrid 在标准长上下文基准 RULER (Hsieh et al., 2024) 上相对 Olmo 3 有大幅增益. 适配时同时用了 Olmo 3 的 YaRN (Peng et al., 2024) 与更新的 DroPE (Gelberg et al., 2025). 如表 3, 两种方法下 Hybrid 在长 RULER 长度上都超过 Olmo 3 7B. 我们把长上下文增益归因于线性 RNN 层, 与既有文献一致 (Yang et al., 2025b; Ren et al., 2025).

**Comparison to Open-Weight Models.** Beyond the controlled comparison between Olmo Hybrid and Olmo 3, we also benchmark Olmo Hybrid against other open-weight models of similar parameter count. As shown in Figure 2, Olmo Hybrid is on the Pareto frontier for performance on OlmoBaseEval as a function of training compute among open-weight dense models. We detail baseline architectures and present full results in §5.2.

**与开源权重模型对照.** 在与 Olmo 3 的可控对照之外, 我们还把 Olmo Hybrid 与相近参数量的其他开源权重模型对比. 如图 2, 在开源稠密模型中, Olmo Hybrid 处于 「训练算力 → OlmoBaseEval 表现」 的 Pareto 前沿. 基线架构细节与完整结果见 §5.2.

> **拆开:** Tab. 3 DroPE 在 4k 为 92.2, 低于 Olmo 3 的 95.8, 但 64k 为 85.0 高于 70.9; 作者把长上下文增益主要记在 YaRN 还是线性 RNN?
> 正文写 「We attribute these gains on long-context tasks to the presence of linear RNN layers」. YaRN/DroPE 是扩展方法; Hybrid+YaRN 在 64k 已到 76.9>70.9, DroPE 再抬到 85.0. 短窗略低, 长窗更高是表内事实.

<!-- page 7 of 70 -->

![Chart block](images/p07-figure-2-compute-performance-tradeoff-of-open-weight.png)

Figure 2 Compute-performance tradeoff of open-weight hybrid, RNN, and transformer base models on the average of OlmoBaseEval task suites. Olmo Hybrid 7B is on the Pareto frontier of open-weight dense models. Training compute was estimated using the $C = 6 N D$ heuristic from Kaplan et al. (2020), with reported token and parameter counts. Per-benchmark results are reported in Table 6. While theoretical compute for MoE-based SSMs is low, effective training efficiency can be roughly 50–80% of a dense model (Rajbhandari et al., 2022), so we draw our frontier over dense models only. For this plot, we show only models obtaining >50% average performance on OlmoBaseEval.

图 2 开放权重的 hybrid, RNN 与 transformer base 模型在 OlmoBaseEval 各任务套件平均分上的算力-表现权衡. Olmo Hybrid 7B 位于开放权重 dense 模型的 Pareto 前沿上. 训练算力按 Kaplan et al. (2020) 的 $C = 6 N D$ 经验式, 用公开报告的 token 数与参数量估算. 各基准结果见 Table 6. 基于 MoE 的 SSM 理论算力虽低, 但有效训练效率大约只有 dense 模型的 50–80% (Rajbhandari et al., 2022), 因此前沿只在 dense 模型上画. 图中只展示在 OlmoBaseEval 上平均分 >50% 的模型.

## 3 Expressive Power of Hybrid Models Hybrid 模型的表达力

This section considers the benefits of hybrid models over transformers for expressive power, i.e., the class of computational tasks that each architecture can represent. We show that hybrid models can express tasks beyond both transformers and GDN. Later, we return to explaining how this theoretical expressivity advantage could translate to better compute and data efficiency during pretraining compared to transformers (Section 4.1).

本节讨论 hybrid 模型相对 transformer 在表达力上的优势, 即各架构能表示的计算任务类别. 我们表明 hybrid 模型能表达 transformer 与 GDN 都表达不了的任务. 之后 (Section 4.1) 再回头解释, 这种理论上的表达力优势如何在预训练中转化为比 transformer 更高的算力与数据效率.

While no comprehensive theory of deep learning models exists, theory is advanced enough to provide a useful conceptual framework for understanding the practical limitations of architectures and how to address them. In particular, our motivation for hybrid models takes expressivity as a guiding principle:

虽然深度学习模型还没有完整的理论, 但现有理论已足以提供一个有用的概念框架, 用来理解架构的实际局限及其应对办法. 具体而言, 我们选择 hybrid 模型的动机, 以表达力为指导原则:

**Expressivity Thesis** (Merrill, 2025, Section 5.1)

**表达力论点** (Merrill, 2025, Section 5.1)

A deep learning architecture should be made as expressive as possible—being able to represent as many naturalistic problems as possible theoretically—while remaining trainable and scalable for pretraining.

深度学习架构应当做到尽可能有表达力, 即在理论上能表示尽可能多的自然问题, 同时对预训练而言仍可训练, 可扩展.

In other words, this perspective calls for designing a highly flexible model whose hypothesis class contains as many subtasks as possible that could conceivably be reflected in naturalistic data, while remaining trainable at scale (cf. the Bitter Lesson; Sutton, 2019). Rather than constraining the hypothesis class, we trust the optimizer to find the right fit to the data. This perspective contrasts with classical machine learning wisdom that expressivity and inductive bias are at odds (the bias-variance tradeoff; Mitchell, 1980; Vapnik, 1991; Geman et al., 1992). However, recent work suggests that deep learning methods have an implicit bias toward simplicity that prevents highly expressive models from overfitting (Wilson, 2025). With this in mind, the expressivity thesis outlined above asserts that we should focus on making our architecture maximally expressive without worrying about the impact on inductive bias, as long as the architecture satisfies standard trainability constraints, i.e., the network must be differentiable and signals must propagate across layers during the forward and backward passes (cf. Yang et al., 2024a; Dey et al., 2025).

换句话说, 这一视角要求设计高度灵活的模型: 其假设类尽可能多地包含可能在自然数据中出现的子任务, 同时能在规模上训练 (参见 the Bitter Lesson; Sutton, 2019). 我们不去约束假设类, 而是相信优化器能找到与数据匹配的解. 这与经典机器学习的看法相反: 后者认为表达力与归纳偏置相互冲突 (偏差-方差权衡; Mitchell, 1980; Vapnik, 1991; Geman et al., 1992). 不过近期工作表明, 深度学习方法带有偏向简单解的隐式偏置, 能防止高表达力模型过拟合 (Wilson, 2025). 据此, 上述表达力论点主张: 只要架构满足标准的可训练性约束, 即网络可微, 且前向与反向传播中信号能跨层传递 (参见 Yang et al., 2024a; Dey et al., 2025), 就应专注于让架构表达力最大化, 而不必担心对归纳偏置的影响.

Beyond trainability, the other major constraint that competes with expressivity is scalability. In general, there is a fundamental tradeoff between expressive power and the degree to which the model can process data efficiently during training. For example, if we want our architecture to exactly express NP-complete problems, it would not be possible to process text with it efficiently (assuming ${ \mathsf { P } } \neq { \mathsf { N P } } )$ . Even if we only require the model to express all tasks in P at training time, the model still could not be parallelized effectively over long sequences (assuming $\mathsf { N C } \neq \mathsf { P } ;$ Greenlaw et al., 1991), which would preclude scaling training to

除可训练性外, 与表达力相竞争的另一大约束是可扩展性. 一般而言, 表达力与训练时高效处理数据的程度之间存在根本权衡. 例如, 若要求架构能精确表达 NP-complete 问题, 就无法用它高效处理文本 (假设 ${ \mathsf { P } } \neq { \mathsf { N P } } )$. 即使只要求模型在训练时能表达 P 中的所有任务, 它仍无法在长序列上有效并行 (假设 $\mathsf { N C } \neq \mathsf { P } ;$ Greenlaw et al., 1991), 这将使训练无法扩展到

<!-- page 8 of 70 -->

![Image block](images/p08-figure-3-expressive-power-of-transformers-linear-rnns.png)

Figure 3 Expressive power of transformers, linear RNNs, and hybrid models relative to circuit complexity classes. Dashed lines represent unproven but conjectured separations between classes $( \mathrm { e . g . , } \mathsf { T C } ^ { 0 } \neq \mathsf { N C } ^ { 1 } )$ . Notably, transformers can express recall (Section 3.1), and DeltaNet (or GDN) with negative eigenvalues can express state tracking (Section 3.2) (Grazzi et $\operatorname { a l . } ,$ 2025). Hybridizing gives both capabilities, and we prove that it also unlocks state-based recall, a problem that neither model can express on its own (Section 3.3). With the addition of padding tokens, transformers can express exactly the class $\mathsf { T } C ^ { 0 }$ , whereas hybrid models can capture all of $\mathbb { N } \mathbb { C } ^ { 1 }$ , which enables solving boolean formula evaluation (Section 3.4).

图 3 transformer, 线性 RNN 与 hybrid 模型的表达力, 相对于电路复杂度类的位置. 虚线表示尚未证明但被猜想成立的类间分离 $( \mathrm { e . g . , } \mathsf { T C } ^ { 0 } \neq \mathsf { N C } ^ { 1 } )$. 值得注意的是, transformer 能表达召回 (Section 3.1), 带负特征值的 DeltaNet (或 GDN) 能表达状态追踪 (Section 3.2) (Grazzi et $\operatorname { a l . } ,$ 2025). Hybrid 同时具备这两种能力, 我们还证明它解锁了 state-based recall, 这是两种模型单独都表达不了的问题 (Section 3.3). 加入 padding token 后, transformer 恰好能表达 $\mathsf { T } C ^ { 0 }$ 类, 而 hybrid 模型能覆盖整个 $\mathbb { N } \mathbb { C } ^ { 1 }$, 从而能求解布尔公式求值 (Section 3.4).

massive amounts of data. Thus, our goal in architecture design is not to blindly increase expressivity as much as possible, but to do so while preserving parallelism. A good architecture is one that pushes the frontier of the **expressivity-parallelism tradeoff** (Merrill and Sabharwal, 2023; Liu et al., 2026) as much as possible within fundamental, complexity-theoretic limits.

海量数据上. 因此, 我们在架构设计上的目标不是盲目把表达力堆到最高, 而是在保持并行性的前提下提升表达力. 好的架构, 是在复杂度理论的根本限制之内, 尽可能把 **表达力-并行性权衡** (Merrill and Sabharwal, 2023; Liu et al., 2026) 的前沿往外推.

Existing work has revealed that transformers do not sit on the frontier between expressivity and parallelism: more expressive models exist that are essentially just as parallelizable in practice. In particular, hybrid models can achieve more expressivity while maintaining similar levels of scalability, which we justify both with prior work and new theoretical results. Our core results are summarized in Figure 3. Linear RNNs and transformers have complementary strengths: while linear RNNs like GDN can express state tracking problems beyond the capabilities of transformers, transformers surpass linear RNNs at recall. Each architecture can be trained at scale, but each also has its own expressivity limitations, motivating hybrid models that inherit the best properties from each. Moreover, we prove new theoretical results establishing that hybrid models have expressivity advantages beyond both pure transformers and pure linear RNNs.

已有工作揭示, transformer 并不处在表达力与并行性的前沿上: 存在表达力更强, 而实践中并行程度基本相同的模型. 具体而言, hybrid 模型能在保持相近可扩展性的同时获得更强表达力, 我们用已有工作与新的理论结果共同论证这一点. 核心结果汇总在 Figure 3. 线性 RNN 与 transformer 各有所长: GDN 这类线性 RNN 能表达 transformer 力所不及的状态追踪问题, 而 transformer 在召回上胜过线性 RNN. 两种架构都能在规模上训练, 也各有表达力局限, 这促使我们采用兼取两者长处的 hybrid 模型. 此外, 我们证明了新的理论结果, 确立 hybrid 模型的表达力优势同时超过纯 transformer 与纯线性 RNN.

### 3.1 Background: Expressive Power of Transformers 背景: Transformer 的表达力

As the go-to LM architecture, transformers have received significant theoretical treatment investigating what problems they can and cannot solve (Strobl et al., 2024). Despite their empirical success, it has become clear that, when used as next-token predictors, transformers can only express a restricted set of parallelizable computational problems—formally, those that lie within the complexity class $\mathsf { T } C ^ { 0 }$ (Merrill and Sabharwal, 2023; Chiang, 2025). Under standard complexity conjectures, this implies transformers of fixed depth cannot express inherently sequential computational problems over arbitrary sequence lengths. This includes many problems like graph connectivity (NL-complete) and computing reward in a Markov decision process (P-complete), but, in particular, it includes the fundamental problem of state tracking.

作为首选的 LM 架构, transformer 在理论上得到了大量研究, 考察它能解与不能解哪些问题 (Strobl et al., 2024). 尽管实证上很成功, 但已经清楚的是: 用作 next-token prediction 模型时, transformer 只能表达一类受限的可并行计算问题, 形式上即位于复杂度类 $\mathsf { T } C ^ { 0 }$ 之内的问题 (Merrill and Sabharwal, 2023; Chiang, 2025). 在标准复杂度猜想下, 这意味着固定深度的 transformer 无法在任意序列长度上表达本质上顺序的计算问题. 这包括图连通性 (NL-complete), 马尔可夫决策过程中的奖励计算 (P-complete) 等许多问题, 尤其包括状态追踪这一基础问题.

**Transformers are Limited at State Tracking.** A particularly prominent example of a problem not expressible by transformers (assuming $\mathsf { T C } ^ { 0 } \neq \mathsf { N C } ^ { 1 } )$ is state tracking (Liu et al., 2023a; Merrill et al., 2024, Section 3). State tracking is the task of mapping a world state $x \in X$ and sequence of actions $\delta _ { 1 } , \ldots , \delta _ { n } \in \Delta$ to the updated world state after applying the actions sequentially, e.g., $( \delta _ { n } \circ \ldots \circ \delta _ { 1 } ) ( x ) \in X$ , where both $X , \Delta$ are finite sets and composition over $\Delta$ is associative.1 One natural example of state tracking is chess, where $X$ is

**Transformer 在状态追踪上受限.** transformer 表达不了的问题中 (假设 $\mathsf { T C } ^ { 0 } \neq \mathsf { N C } ^ { 1 } )$, 一个尤其突出的例子是状态追踪 (Liu et al., 2023a; Merrill et al., 2024, Section 3). 状态追踪的任务是: 给定世界状态 $x \in X$ 与动作序列 $\delta _ { 1 } , \ldots , \delta _ { n } \in \Delta$, 映射到依次施加这些动作后的新世界状态, 例如 $( \delta _ { n } \circ \ldots \circ \delta _ { 1 } ) ( x ) \in X$, 其中 $X , \Delta$ 都是有限集, 且 $\Delta$ 上的复合满足结合律.1 状态追踪的一个自然例子是国际象棋, 其中 $X$ 是

<small><span class="docvortex-page-footnote" data-block-type="page_footnote" style="color:#6b7280"><sup>1</sup>State tracking can be described in many equivalent ways, e.g., the word problem in a finite monoid, recognizing a regular language, or simulating a deterministic finite automaton (cf. Merrill et al., 2024, Section 3).</span></small>

<small><sup>1</sup>状态追踪有许多等价描述方式, 例如有限幺半群上的字问题, 识别正则语言, 或模拟确定性有限自动机 (参见 Merrill et al., 2024, Section 3).</small>

<!-- page 9 of 70 -->

```txt
a, b, c, d, e = range(5)
a, c = c, e
...  # n lines
assert a == _  # 0 to 4

bits = [0, 1, 0, 0, ...]  # m bits
a = 36

assert bits[a] == _  # 0 or 1
```

Figure 4 Code evaluation contexts where predicting the next token requires solving state tracking (left) and recall (right). As the number of lines n grows, fixed-depth transformers cannot represent state tracking, assuming $\mathsf { T C } ^ { 0 } \neq \mathsf { N C } ^ { 1 }$ (Merrill et al., 2024). As the number of bits m grows, RNNs with sub-linear precision cannot solve recall because of their bounded state (Arora et al., 2024b; Jelassi et al., 2024). Hybrid models can represent both problems.

图 4 两段代码求值上下文: 预测下一个 token 分别需要求解状态追踪 (左) 与召回 (右). 随着行数 n 增长, 固定深度的 transformer 无法表示状态追踪, 假设 $\mathsf { T C } ^ { 0 } \neq \mathsf { N C } ^ { 1 }$ (Merrill et al., 2024). 随着位数 m 增长, 亚线性精度的 RNN 因状态有界而无法完成召回 (Arora et al., 2024b; Jelassi et al., 2024). Hybrid 模型两种问题都能表示.

```python
bits = [0, 1, 0, 0, ...] # m bits
a, b, c, d, e = 36, 23, 12, 2, 56 # 0 to m - 1

a, c = c, e
... # n lines

assert bits[a] == _ # 0 or 1
```

Figure 5 A code evaluation context where predicting the next token requires solving state-based recall. As n increases, the task becomes inexpressible by transformers because the variable states cannot be tracked (assuming $\mathsf { T C } ^ { 0 } \neq \mathsf { N C } ^ { 1 } )$ As m grows, the task becomes inexpressible by RNNs because recall into the bit array requires more memory than their bounded state can hold. There exists a simple hybrid model that can solve the task robustly for any value of n and m.

图 5 一段代码求值上下文: 预测下一个 token 需要求解 state-based recall. 随着 n 增大, transformer 因无法追踪变量状态而表达不了该任务 (假设 $\mathsf { T C } ^ { 0 } \neq \mathsf { N C } ^ { 1 } )$. 随着 m 增大, RNN 也表达不了, 因为在位数组中召回所需的内存超出其有界状态的容量. 存在一个简单的 hybrid 模型, 对任意 n 与 m 都能稳健求解该任务.

the set of all board states and $\Delta$ is the set of all moves. Another example is the "shell game": the problem of composing swaps (transpositions) over five objects. The complexity of state tracking depends on the algebraic structure of the transition monoid $\Delta ;$ in the hardest case (capturing the shell game and certain notations of chess; Merrill et al., 2024), state tracking is $\mathsf { N C ^ { 1 } \_ c o m p l e t e }$ . It follows that these instances of hard state tracking cannot be expressed by fixed-depth transformers assuming the complexity conjecture $\mathsf { T C } ^ { 0 } \neq \mathsf { N C } ^ { 1 }$ even though variants of these problems could conceivably manifest as subproblems of next-token prediction over natural language data. Intuitively, the problem arises from the fact that attention cannot aggregate information over the sequence of state updates in a way that is fully sensitive to their order (each attention head could look to the last token and apply an individual update, but then the depth of the network would grow with the sequence length).

所有棋盘状态的集合, $\Delta$ 是所有走法的集合. 另一个例子是 「shell game」 (猜杯游戏): 对五个物体复合交换 (对换) 的问题. 状态追踪的复杂度取决于转移幺半群 $\Delta ;$ 的代数结构; 在最难的情形下 (涵盖 shell game 与国际象棋的某些记谱法; Merrill et al., 2024), 状态追踪是 $\mathsf { N C ^ { 1 } \_ c o m p l e t e }$ 的. 由此, 在复杂度猜想 $\mathsf { T C } ^ { 0 } \neq \mathsf { N C } ^ { 1 }$ 成立的前提下, 这些困难的状态追踪实例无法由固定深度 transformer 表达, 尽管这些问题的变体完全可能作为自然语言数据上 next-token prediction 的子问题出现. 直观上, 问题出在注意力无法以完全对顺序敏感的方式聚合一连串状态更新的信息 (每个注意力头可以看最后一个 token 并施加一次单独更新, 但那样网络深度就要随序列长度增长).

### 3.2 Background: Expressive Power of Linear RNNs 背景: 线性 RNN 的表达力

In contrast to transformers, classical nonlinear RNNs can naturally express state tracking by using their hidden vector as a representation of the intermediate state and applying each transition one at a time (e.g., Merrill, 2019, Theorem 3.1). A fundamental question is whether linear RNNs, with their linear recurrent update, can still express sequential state updates in a similar way.

与 transformer 不同, 经典非线性 RNN 能自然地表达状态追踪: 用隐向量表示中间状态, 一次施加一个转移 (例如 Merrill, 2019, Theorem 3.1). 一个根本问题是: 线性 RNN 的循环更新是线性的, 它能否以类似方式表达顺序状态更新?

**Linear RNNs Can Track State.** It turns out that some (but not all) linear RNNs, despite being efficiently parallelizable, can express sequential state tracking. Merrill et al. (2024) showed how early linear RNN architectures like S4 (Gu et al., 2022) and Mamba are limited in complexity to $\mathsf { T } \mathsf { C } ^ { 0 }$ like transformers, and thus cannot express state tracking under standard conjectures. However, Merrill et al. (2024) also showed how, by making the transition matrix non-diagonal and time-dependent, it is possible to construct a linear RNN that can express $\mathbb { N } \mathbb { C } ^ { 1 }$ -complete state tracking problems. Along these lines, recent linear RNN architectures such as DeltaNet (Yang et al., 2024c; Grazzi et al., 2025), RWKV-7 (Peng et al., 2025), and PD-SSM (Terzic et al., 2025) have incorporated more complex transition matrix parameterizations that unlock additional expressive power for state tracking. In the case of DeltaNet or GDN, extending the transition matrix to have negative eigenvalues (Definition 1) is important for state tracking (Grazzi et al., 2025). Intuitively, negative eigenvalues are important because they allow DeltaNet to express swap-like dynamics that alternate between two states, as shown in Figure 6. On empirical state tracking evaluations (such as the $A _ { 5 }$ word problem), these more expressive parameterizations lead to clear improvements over transformers. In other related work, Sarrof

**线性 RNN 能追踪状态.** 结果表明, 部分 (而非全部) 线性 RNN 在可高效并行的同时, 能表达顺序状态追踪. Merrill et al. (2024) 表明, S4 (Gu et al., 2022) 与 Mamba 等早期线性 RNN 架构与 transformer 一样, 复杂度被限制在 $\mathsf { T } \mathsf { C } ^ { 0 }$, 因此在标准猜想下无法表达状态追踪. 但 Merrill et al. (2024) 也表明, 让转移矩阵非对角且随时间变化, 就能构造出可表达 $\mathbb { N } \mathbb { C } ^ { 1 }$-complete 状态追踪问题的线性 RNN. 沿着这一思路, DeltaNet (Yang et al., 2024c; Grazzi et al., 2025), RWKV-7 (Peng et al., 2025), PD-SSM (Terzic et al., 2025) 等近期线性 RNN 架构采用了更复杂的转移矩阵参数化, 为状态追踪解锁了额外表达力. 对 DeltaNet 或 GDN 而言, 把转移矩阵扩展到允许负特征值 (Definition 1) 对状态追踪很重要 (Grazzi et al., 2025). 直观上, 负特征值之所以重要, 是因为它让 DeltaNet 能表达在两个状态间来回切换的类交换动态, 如 Figure 6 所示. 在实证状态追踪评测 (例如 $A _ { 5 }$ 字问题) 上, 这些表达力更强的参数化相对 transformer 有明显提升. 在其他相关工作中, Sarrof

<!-- page 10 of 70 -->

$$
\mathbf {I} - \mathbf {k} _ {t} \mathbf {k} _ {t} ^ {\top} = \mathbf {I} - \frac {1}{2} \left( \begin{array}{c c} 1 & - 1 \\ - 1 & 1 \end{array} \right) = \frac {1}{2} \left( \begin{array}{c c} 1 & 1 \\ 1 & 1 \end{array} \right)
$$

$$
\mathbf {I} - 2 \mathbf {k} _ {t} \mathbf {k} _ {t} ^ {\top} = \mathbf {I} - \left( \begin{array}{c c} 1 & - 1 \\ - 1 & 1 \end{array} \right) = \left( \begin{array}{c c} 0 & 1 \\ 1 & 0 \end{array} \right)
$$

**(a)** Without the negative eigenvalue extension (cf. Definition 1), we get eigenvalues $\lambda _ { 1 } = 1$ and $\lambda _ { 2 } = 0$

**(a)** 不做负特征值扩展 (参见 Definition 1) 时, 特征值为 $\lambda _ { 1 } = 1$ 与 $\lambda _ { 2 } = 0$

**(b)** With the extension, GDN implements $\mathrm { a ~ ` s w a p '' }$ operator with eigenvalues $\lambda _ { 1 } = 1$ and $\lambda _ { 2 } = - 1$

**(b)** 做了扩展后, GDN 实现 $\mathrm { a ~ ` s w a p '' }$ 算子, 特征值为 $\lambda _ { 1 } = 1$ 与 $\lambda _ { 2 } = - 1$

**Figure 6** Let $\mathbf { k } _ { t } ^ { \top } = ( 1 , - 1 ) / \sqrt { 2 } ;$ crucially, $\| \mathbf { k } _ { t } \| = 1$ . Multiplying the low-rank term in the GDN update by 2 allows the transition matrix to have a negative eigenvalue, meaning it can implement dynamics that alternate between states (Grazzi et al., 2025). This is useful for expressing state tracking tasks like parity and the $A _ { 5 }$ word problem.

**图 6** 令 $\mathbf { k } _ { t } ^ { \top } = ( 1 , - 1 ) / \sqrt { 2 } ;$ 关键是 $\| \mathbf { k } _ { t } \| = 1$. 把 GDN 更新中的低秩项乘以 2, 转移矩阵就能有负特征值, 即能实现在状态间来回切换的动态 (Grazzi et al., 2025). 这对表达 parity 与 $A _ { 5 }$ 字问题等状态追踪任务很有用.

> **确认:** Figure 6 两行矩阵只差一个系数 2; 若追问 Householder-style transition 为什么能表示 swap, 特征值从 0 变成 -1 是怎么来的?
> 因为 $\| \mathbf{k}_t \| = 1$, $\mathbf{I} - c\,\mathbf{k}_t\mathbf{k}_t^{\top}$ 在 $\mathbf{k}_t$ 方向上的特征值是 1 - c, 在正交方向上保持 1. c = 1 时是投影, 得到 (a) 的 0; c = 2 时是反射, 得到 (b) 的 -1, 矩阵正好是交换两个坐标的 swap. Definition 1 里 $2\beta_t$ 配合 $\beta_t \in (0,1)$, 这个特征值就能落在 (-1, 1) 内取负值. §3.5 的消融也对得上: 去掉负特征值后, 线性 RNN 在 n = 64 与 128 时掉到 0.21484 与 0.22266.

et al. (2024) show advantages of linear RNNs over transformers on star-free regular languages, a simpler type of state tracking compared to $A _ { 5 } ,$ and Merrill et al. (2026) show that DeltaNet and other linear RNNs like RWKV-7 are upper bounded by $\widehat { \mathsf { P N C } } ^ { 1 }$ and can solve $\mathsf { P N C } ^ { \mathrm { i } }$ -complete problems.

et al. (2024) 表明线性 RNN 在 star-free 正则语言上优于 transformer, 这是比 $A _ { 5 } ,$ 更简单的一类状态追踪; Merrill et al. (2026) 则表明 DeltaNet 以及 RWKV-7 等其他线性 RNN 的上界为 $\widehat { \mathsf { P N C } } ^ { 1 }$, 并能求解 $\mathsf { P N C } ^ { \mathrm { i } }$-complete 问题.

**Linear RNNs are Limited by Recall.** While linear RNNs have an expressivity advantage over transformers on state tracking tasks, this advantage comes at a cost: they are limited on recall-heavy tasks due to their bounded state. In particular, the fixed-size hidden state of linear or nonlinear RNNs means they struggle on tasks involving copying or recalling tokens from the context (Jelassi et al., 2024; Arora et al., 2024b). In-context recall mechanisms have been suggested to be important for language modeling (Olsson et al., 2022), and, indeed, Arora et al. (2024a) argue that most loss degradation of linear RNNs relative to transformers can be attributed to in-context recall. Similarly, Akyürek et al. (2024) argue that transformers outperform pure RNNs at in-context learning, likely due to recall abilities. Additionally, in-context recall is important in constructions for Turing completeness when models are augmented with chain of thought (Merrill and Sabharwal, 2024; Wen et al., 2025a). Thus, for several reasons, it is important for RNN-based models to incorporate some mechanism for recall, providing a strong motivation for hybrid transformer-RNN architectures, which excel at recall-based tasks like copying in practice (Waleffe et al., 2024).

**线性 RNN 受召回所限.** 线性 RNN 在状态追踪任务上相对 transformer 有表达力优势, 但这种优势有代价: 状态有界, 在召回密集的任务上受限. 具体而言, 线性或非线性 RNN 的隐状态大小固定, 在需要复制或从上下文召回 token 的任务上很吃力 (Jelassi et al., 2024; Arora et al., 2024b). 有观点认为上下文内召回机制对语言建模很重要 (Olsson et al., 2022); 事实上, Arora et al. (2024a) 认为线性 RNN 相对 transformer 的 loss 劣化, 大部分可归因于上下文内召回. 类似地, Akyürek et al. (2024) 认为 transformer 在上下文学习上胜过纯 RNN, 很可能得益于召回能力. 此外, 在模型配合 CoT 时的图灵完备性构造中, 上下文内召回也很重要 (Merrill and Sabharwal, 2024; Wen et al., 2025a). 因此, 出于多方面原因, 基于 RNN 的模型需要纳入某种召回机制, 这为 transformer-RNN hybrid 架构提供了强烈动机; 实践中, 这类架构在复制这类基于召回的任务上表现出色 (Waleffe et al., 2024).

### 3.3 Hybrid Models are More Than the Sum of Their Parts Hybrid 模型大于各部分之和

Section 3.2 demonstrates that linear RNNs like DeltaNet have a key expressivity advantage over transformers on state tracking tasks. On the other hand, they are limited on recall-heavy tasks due to their bounded state size. From this perspective, hybrid models that mix layer types offer a natural way to build a model that can express both state tracking and recall while remaining scalable (Yang et al., 2025b; Mohri, 2026). Going beyond this, we now show that hybrid models are, in fact, more expressive than either transformers or linear RNNs in isolation, under standard complexity conjectures. In particular, we will first show the expressivity advantage of hybrid models on the minimal synthetic task of state-based recall:

Section 3.2 表明, DeltaNet 这类线性 RNN 在状态追踪任务上相对 transformer 有关键的表达力优势; 另一方面, 它们因状态大小有界而在召回密集的任务上受限. 从这个角度看, 混合不同层类型的 hybrid 模型, 是构建既能表达状态追踪又能表达召回, 同时仍可扩展的模型的自然途径 (Yang et al., 2025b; Mohri, 2026). 更进一步, 我们现在表明: 在标准复杂度猜想下, hybrid 模型实际上比单独的 transformer 或线性 RNN 表达力都更强. 具体来说, 我们先在最小的合成任务 state-based recall 上展示 hybrid 模型的表达力优势:

**Definition 2: State-Based Recall (Figure 5)**

**定义 2: State-Based Recall (Figure 5)**

The input is a string $x , p , \pi ,$ where $x \in \{ 0 , 1 \} ^ { n }$ is a bitstring, $p _ { 1 } , \ldots , p _ { 5 } \in [ 1 , n ]$ are "pointers" into the bitstring, and $\pi _ { 1 } , \ldots , \pi _ { n }$ is a sequence of transpositions (swap operations) over [1, 5]. Define the permuted pointer values q as $q = ( \pi _ { n } \circ \pi _ { n - 1 } \circ \ldots \circ \pi _ { 1 } ) ( p )$ The output is $x _ { q _ { 1 } }$

输入是字符串 $x , p , \pi ,$, 其中 $x \in \{ 0 , 1 \} ^ { n }$ 是比特串, $p _ { 1 } , \ldots , p _ { 5 } \in [ 1 , n ]$ 是指向该比特串的 「指针」, $\pi _ { 1 } , \ldots , \pi _ { n }$ 是 [1, 5] 上的对换 (交换操作) 序列. 定义置换后的指针值 q 为 $q = ( \pi _ { n } \circ \pi _ { n - 1 } \circ \ldots \circ \pi _ { 1 } ) ( p )$. 输出为 $x _ { q _ { 1 } }$.

Intuitively, state-based recall is designed to require composing state tracking and recall, rather than just one capability. State-based recall can be naturally instantiated as a subtask of evaluating code, which requires both tracking the state of variables and using their values for memory accesses (e.g., indexing into a list). Figure 5 shows an example of how state-based recall might appear within code language modeling. This gives an intuition for how the additional expressivity of hybrid models could be relevant for tasks involving code evaluation. We now show formally that, since it requires the composition of state tracking and recall, state-based recall is solvable by hybrid models, but not pure transformers or GDN models:<sup>2</sup>

直观上, state-based recall 的设计要求把状态追踪与召回组合起来, 而不是只用其中一种能力. 它可以自然地实例化为代码求值的子任务: 既要追踪变量状态, 又要用变量值做内存访问 (例如对列表取下标). Figure 5 展示了 state-based recall 在代码语言建模中可能出现的样子. 这给出一个直观理解: hybrid 模型的额外表达力可能与代码求值类任务相关. 下面我们形式化地表明, 由于 state-based recall 需要状态追踪与召回的组合, hybrid 模型能求解它, 纯 transformer 或纯 GDN 模型则不能:<sup>2</sup>

<small><span class="docvortex-page-footnote" data-block-type="page_footnote" style="color:#6b7280"><sup>2</sup>Our formal models of transformers and RNNs operate under the common log-precision arithmetic assumption (Merrill and Sabharwal, 2023; Merrill et al., 2024), where all internal arithmetic is allowed to use O(log n) bits for input sequences of length n. All our inexpressibility results easily carry over to bounded-precision models. Theorem 1 holds also for poly-precision</span></small>

<small><sup>2</sup>我们对 transformer 与 RNN 的形式化模型采用常见的对数精度算术假设 (Merrill and Sabharwal, 2023; Merrill et al., 2024): 对长度为 n 的输入序列, 所有内部算术允许使用 O(log n) 位. 我们的所有不可表达性结果都能直接推广到有界精度模型. Theorem 1 对多项式精度</small>

<!-- page 11 of 70 -->

**Theorem 1: State-Based Recall Separation 定理 1: State-Based Recall 分离**

There exists a hybrid model (GDN with negative eigenvalues + averaging-hard attention) that solves state-based recall, with just one alternation between layer types, in either order. In contrast, no transformer or RNN can express this problem, assuming $\mathsf { T C } ^ { 0 } \overset { \circ } { \neq } \mathsf { N C } ^ { 1 }$ for transformers.

存在一个 hybrid 模型 (带负特征值的 GDN + averaging-hard attention) 能求解 state-based recall, 且层类型之间只需交替一次, 顺序任意. 相反, 任何 transformer 或 RNN 都表达不了这个问题 (对 transformer 需假设 $\mathsf { T C } ^ { 0 } \overset { \circ } { \neq } \mathsf { N C } ^ { 1 }$).

Proof Sketch. A hybrid model can solve state-based recall in two ways. One way is to first use GDN layers to compose the transpositions over pointers (an example of $\mathbb { N } \mathbb { C } ^ { 1 }$ -complete state tracking) and then retrieve the value at $p _ { 1 }$ using attention. The other way is to first use attention heads to retrieve the values of $p _ { 1 } , \ldots , p _ { 5 }$ and then compose transpositions over the values. Thus, hybrid models with a single alternation of layer types in either order can express the task. On the other hand, full transformers and GDN each lack the ability to express one of the pieces, and thus cannot express state-based recall. We defer a rigorous proof of these negative results to Section B. □

证明概要. Hybrid 模型有两种方式求解 state-based recall. 一种是先用 GDN 层对指针复合对换 (这是 $\mathbb { N } \mathbb { C } ^ { 1 }$-complete 状态追踪的一个实例), 再用注意力取出 $p _ { 1 }$ 处的值. 另一种是先用注意力头取出 $p _ { 1 } , \ldots , p _ { 5 }$ 处的值, 再对这些值复合对换. 因此, 层类型只交替一次, 无论先后, hybrid 模型都能表达该任务. 另一方面, 纯 transformer 与纯 GDN 各自缺少表达其中一块的能力, 因而表达不了 state-based recall. 这些否定结果的严格证明放在 Section B. □

> **回看:** Theorem 1 说 「one alternation, in either order」 就够; 把 GDN→attention 与 attention→GDN 两条 layer ordering 拆开看, 各自先解决 Definition 2 的哪一半?
> 按证明概要: GDN 在前时, GDN 先对 5 个指针复合对换 $\pi_1, \ldots, \pi_n$ 得到 q, 注意力再去比特串里取值. 注意力在前时, 先把 $p_1, \ldots, p_5$ 处的 5 个比特取回来, GDN 再对这 5 个值做对换. 两条路都是先把问题压成另一种原语擅长的形式, 所以一次交替就够. 多次交替会不会更强, 文中列为开放问题.

Since state-based recall is expressible with GDN before attention or vice versa, it follows that alternating layers in either order also unlocks additional expressivity for hybrid models relative to full attention or full GDN. It is an open question whether multiple alternations between layer types buy more expressivity than having just one alternation.

由于 state-based recall 无论 GDN 在注意力之前还是之后都可表达, 可知任意顺序的层交替, 都为 hybrid 模型带来相对纯注意力或纯 GDN 的额外表达力. 层类型多次交替是否比只交替一次带来更多表达力, 仍是开放问题.

### 3.4 Expressive Power of Padded Hybrid Models 加 padding 的 Hybrid 模型的表达力

The interaction between attention and GDN layers naturally allows hybrid models to solve state-based recall, providing a minimal example of an expressivity gain over pure transformers and linear RNNs (under standard conjectures). Moreover, we now show that it also provides more general expressivity benefits for hybrid models: in the presence of padding tokens, hybrid models can express every problem in $\mathbb { N } \mathbb { C } ^ { 1 }$ , which includes many $\mathbb { N } \mathbb { C } ^ { 1 }$ -complete problems that are beyond the capabilities of padded transformers (which remain in $\mathsf { T C } ^ { 0 } )$ In particular, our results imply that, unlike padded transformers, padded hybrid models can evaluate boolean formulas, even though, at first glance, it is non-obvious why the interaction of attention and recurrence should enable this.

注意力层与 GDN 层的相互作用, 让 hybrid 模型自然能求解 state-based recall, 这是 (在标准猜想下) 相对纯 transformer 与线性 RNN 表达力提升的一个最小例子. 此外, 我们现在表明它还给 hybrid 模型带来更一般的表达力收益: 有 padding token 时, hybrid 模型能表达 $\mathbb { N } \mathbb { C } ^ { 1 }$ 中的所有问题, 其中包括许多超出加 padding 的 transformer 能力范围的 $\mathbb { N } \mathbb { C } ^ { 1 }$-complete 问题 (后者仍停留在 $\mathsf { T C } ^ { 0 } )$. 特别是, 我们的结果意味着, 与加 padding 的 transformer 不同, 加 padding 的 hybrid 模型能求值布尔公式, 尽管乍看之下, 注意力与循环的相互作用为什么能做到这一点并不显然.

Before presenting our results, we briefly introduce padding tokens and their relevance to theoretical analysis of expressivity. Padding tokens (Goyal et al., 2024; Pfau et al., 2024) are simply blank tokens (□) appended to a model's input context: i.e., a model with $n ^ { c }$ padding takes as input w□ $\left| w \right| ^ { \overline { { c } } } \in \Sigma ^ { * }$ rather than just $w \in \Sigma ^ { * }$ Padding tokens are interesting for theoretical analysis because adding padding tokens leads architectures to subsume (or exactly correspond to) natural complexity classes in expressivity. Without padding tokens, showing that an entire circuit complexity class neatly lower bounds an architecture is not always possible, in large part because circuit complexity classes like $\mathsf { T } \dot { \mathsf { C } ^ { 0 } }$ and $\mathbb { N C } ^ { 1 }$ allow arbitrary polynomial size computation, whereas models leverage a computation graph of size $O ( n ^ { c } )$ for some fixed $c .$ Adding padding tokens can close the gap between poly-size circuit classes and neural sequence models by allowing them to expand the size of the model's computation without adding new parameters (Li et al., 2024; Merrill and Sabharwal, 2025; London and Kanade, 2025).

介绍结果之前, 先简要说明 padding token 及其与表达力理论分析的关系. Padding token (Goyal et al., 2024; Pfau et al., 2024) 就是附加在模型输入上下文后的空白 token (□): 即带 $n ^ { c }$ padding 的模型以 w□ $\left| w \right| ^ { \overline { { c } } } \in \Sigma ^ { * }$ 为输入, 而不只是 $w \in \Sigma ^ { * }$. Padding token 在理论分析中有意思, 是因为加上它之后, 架构的表达力会包含 (或恰好对应) 自然的复杂度类. 没有 padding token 时, 并不总能证明某个完整的电路复杂度类整齐地构成架构表达力的下界, 很大原因在于 $\mathsf { T } \dot { \mathsf { C } ^ { 0 } }$ 与 $\mathbb { N C } ^ { 1 }$ 这类电路复杂度类允许任意多项式规模的计算, 而模型的计算图规模是 $O ( n ^ { c } )$, c 固定. 加 padding token 能让模型在不增加参数的前提下扩大计算规模, 从而弥合多项式规模电路类与神经序列模型之间的差距 (Li et al., 2024; Merrill and Sabharwal, 2025; London and Kanade, 2025).

It is already established that, with padding tokens, the exact class of problems expressible by transformers has a natural characterization. In particular, while averaging-hard-attention transformers without padding tokens are bounded within $\top C ^ { 0 }$ (Merrill and Sabharwal, 2023), with polynomial padding, the languages expressible by such transformers are exactly $\top C ^ { 0 }$ (Merrill and Sabharwal, 2025):

已有结论表明, 有 padding token 时, transformer 能表达的问题类恰好有自然刻画. 具体来说, 不加 padding token 的 averaging-hard-attention transformer 被限制在 $\top C ^ { 0 }$ 之内 (Merrill and Sabharwal, 2023); 加多项式 padding 后, 这类 transformer 能表达的语言恰好是 $\top C ^ { 0 }$ (Merrill and Sabharwal, 2025):

**Theorem 2: Padded Transformers** (Merrill and Sabharwal, 2025) With polynomial padding tokens, fixed-depth transformers with averaging-hard attention recognize exactly FO-uniform $\mathsf { T } C ^ { 0 }$

**定理 2: 加 padding 的 Transformer** (Merrill and Sabharwal, 2025) 在多项式 padding token 下, 使用 averaging-hard attention 的固定深度 transformer 恰好识别 FO-uniform $\mathsf { T } C ^ { 0 }$.

We give a comparable result for hybrid models with polynomial padding, showing they capture all of $\mathbb { N } \mathbb { C } ^ { 1 }$ , a complexity class thought to be larger than $\mathsf { T C } ^ { 0 } ;$

对加多项式 padding 的 hybrid 模型, 我们给出一个对应结果, 表明它们覆盖整个 $\mathbb { N } \mathbb { C } ^ { 1 }$, 这是一个被认为比 $\mathsf { T C } ^ { 0 } ;$ 更大的复杂度类:

<small><span class="docvortex-page-footnote" data-block-type="page_footnote" style="color:#6b7280">transformers (Chiang, 2025) and can be extended to sub-linear-precision RNNs.</span></small>

<small>(接脚注 2) transformer 也成立 (Chiang, 2025), 并可推广到亚线性精度 RNN.</small>

<!-- page 12 of 70 -->

![Chart block](images/p12-figure-7-synthetic-task-results-a-state-tracking.png)

Figure 7 Synthetic task results. (a) State tracking accuracy vs. number of updates n: linear RNN and hybrid remain near-perfect, while the transformer falls quickly. (b) Recall accuracy vs. bit-array size m: transformer and hybrid maintain perfect recall, while the linear RNN degrades for large m. (c) State-based recall accuracy vs. number of swaps n $( m = n )$ : the hybrid remains robust, while both the transformer and linear RNN degrade for large m, n.

图 7 合成任务结果. (a) 状态追踪准确率随更新次数 n 的变化: 线性 RNN 与 hybrid 保持近乎完美, transformer 迅速下滑. (b) 召回准确率随位数组大小 m 的变化: transformer 与 hybrid 保持完美召回, 线性 RNN 在 m 较大时退化. (c) State-based recall 准确率随交换次数 n $( m = n )$ 的变化: hybrid 保持稳健, transformer 与线性 RNN 在 m, n 较大时都退化.

**Theorem 3: Padded Hybrid Models 定理 3: 加 padding 的 Hybrid 模型**

With polynomial padding tokens, fixed-depth hybrid models (averaging-hard attention $\ne\ GDN$ with negative eigenvalues) can recognize any language in FO-uniform $\mathbb { N } \tilde { C } ^ { 1 }$

在多项式 padding token 下, 固定深度的 hybrid 模型 (averaging-hard attention $\ne\ GDN$ with negative eigenvalues) 能识别 FO-uniform $\mathbb { N } \tilde { C } ^ { 1 }$ 中的任意语言.

Proof Sketch. We use the surprising classical result that any problem in $\mathbb { N } \mathbb { C } ^ { 1 }$ can be reduced via a first-order (FO) formula to composing transpositions over 5 elements (Barrington, 1986). Padded attention layers can express an arbitrary FO reduction, and GDN can implement transposition composition. Thus, this decomposition allows solving any problem in $\mathbb { N C } ^ { 1 }$ with a padded hybrid model. Full proof in Section B.

证明概要. 我们使用一个出人意料的经典结果: $\mathbb { N } \mathbb { C } ^ { 1 }$ 中的任何问题都可以通过一阶 (FO) 公式归约为 5 元素上的对换复合 (Barrington, 1986). 加 padding 的注意力层能表达任意 FO 归约, GDN 能实现对换复合. 因此, 这种分解让加 padding 的 hybrid 模型能求解 $\mathbb { N C } ^ { 1 }$ 中的任何问题. 完整证明见 Section B.

In contrast to Theorem 1, which establishes an expressivity advantage for hybrid models on a specific problem, Theorem 3 establishes that padded hybrid models subsume an entire complexity class $( \mathsf { N } \dot { \mathsf { C } } ^ { 1 } )$ that, under standard complexity conjectures, is more powerful than the class padded transformers correspond to $( \top \mathsf { C } ^ { 0 } )$ Under the conjecture that $\mathsf { T C } ^ { 0 } \neq \mathsf { N C } ^ { 1 }$ , any $\mathbb { N C } ^ { 1 }$ -complete problem can be expressed by a padded hybrid model but not by a padded transformer. One interesting problem in this regime is boolean formula evaluation Let ϕ be a boolean formula over $\langle \{ 0 , 1 \} , \vee , \wedge \rangle$ . The evaluation problem takes as input ϕ serialized in Polish notation, and the output is the value of ϕ. Since formula evaluation is $\mathbb { N } \mathbb { C } ^ { 1 }$ -complete (Buss, 1987), we obtain:

Theorem 1 确立的是 hybrid 模型在某个具体问题上的表达力优势; Theorem 3 则确立加 padding 的 hybrid 模型包含整个复杂度类 $( \mathsf { N } \dot { \mathsf { C } } ^ { 1 } )$, 在标准复杂度猜想下, 它比加 padding 的 transformer 所对应的类 $( \top \mathsf { C } ^ { 0 } )$ 更强. 在 $\mathsf { T C } ^ { 0 } \neq \mathsf { N C } ^ { 1 }$ 的猜想下, 任何 $\mathbb { N C } ^ { 1 }$-complete 问题都能被加 padding 的 hybrid 模型表达, 却不能被加 padding 的 transformer 表达. 这一范围内一个有意思的问题是布尔公式求值. 设 ϕ 是 $\langle \{ 0 , 1 \} , \vee , \wedge \rangle$ 上的布尔公式. 求值问题以按波兰记法序列化的 ϕ 为输入, 输出 ϕ 的值. 由于公式求值是 $\mathbb { N } \mathbb { C } ^ { 1 }$-complete 的 (Buss, 1987), 我们得到:

**Corollary 3.1: Boolean Formula Evaluation Separation 推论 3.1: 布尔公式求值分离**

For some c, there exists a hybrid model (averaging-hard attention + GDN with negative eigenvalues) that solves boolean formula evaluation with $n ^ { c }$ padding tokens. On the other hand, assuming $\mathsf { T C } ^ { 0 } \neq \mathsf { N C } ^ { \vec { 1 } } ,$ no transformer or RNN can solve boolean formula evaluation even with $n ^ { c }$ padding tokens, for any c.

对某个 c, 存在一个 hybrid 模型 (averaging-hard attention + 带负特征值的 GDN) 能在 $n ^ { c }$ 个 padding token 下求解布尔公式求值. 另一方面, 假设 $\mathsf { T C } ^ { 0 } \neq \mathsf { N C } ^ { \vec { 1 } } ,$ 对任意 c, 任何 transformer 或 RNN 即使有 $n ^ { c }$ 个 padding token 也无法求解布尔公式求值.

In contrast to state-based recall, it is not obvious at first glance that boolean formula evaluation should be expressible via the interaction of attention and recurrence. However, Corollary 3.1 shows that it can be, at least for padded models, and moreover that, under standard complexity conjectures, it could not be solved with just one of these primitives. Corollary 3.1 can be restated to fold the padding into the problem definition itself: unpadded hybrid models can solve padded formula evaluation, but neither transformers nor linear RNNs can. Finally, the only property of boolean formula evaluation leveraged to obtain Corollary 3.1 is that it is $\mathbb { N } \mathbb { C } ^ { 1 }$ -complete. Thus, a similar result follows for any $\mathbb { N C } ^ { 1 }$ -complete problem. It is an open question whether a similar boolean formula evaluation result might be obtained for unpadded hybrid models.

与 state-based recall 不同, 布尔公式求值能通过注意力与循环的相互作用来表达, 乍看并不显然. 但 Corollary 3.1 表明至少对加 padding 的模型是可以的, 而且在标准复杂度猜想下, 只用其中一种原语做不到. Corollary 3.1 也可以改写为把 padding 并入问题定义本身: 不加 padding 的 hybrid 模型能求解带 padding 的公式求值, transformer 与线性 RNN 都不能. 最后, 得到 Corollary 3.1 所用到的布尔公式求值的唯一性质, 是它为 $\mathbb { N } \mathbb { C } ^ { 1 }$-complete. 因此任何 $\mathbb { N C } ^ { 1 }$-complete 问题都有类似结果. 不加 padding 的 hybrid 模型能否得到类似的布尔公式求值结果, 仍是开放问题.

<!-- page 13 of 70 -->

### 3.5 Synthetic Evaluations 合成评测

To empirically validate the expressivity tradeoffs from Sections 3.1 to 3.3, we train three primary causal LMs—a standard transformer, a linear RNN (GDN with negative eigenvalues), and a hybrid model mixing GDN blocks with full attention—on synthetic state tracking, recall, and state-based recall tasks. We additionally evaluate no-negative-eigenvalue ablations of the linear RNN and hybrid model. Each task is generated online from short code-like templates (cf. Figures 4 and 5) and framed as a next-token prediction task where the final token requires evaluating the program correctly. We report next-token accuracy on the final answer token and vary task difficulty by increasing the number of required state updates and/or the size of the stored bit-array. For the state-tracking and state-based recall tasks, we additionally train on execution traces that include intermediate state-reveal checks in the form of assert statements, and we include these tokens in the language-modeling loss following Siems et al. (2026). Complete experimental details (model hyperparameters, optimization, curricula, and ablation runs) are provided in Section C.

为实证检验 Sections 3.1 到 3.3 中的表达力权衡, 我们在合成的状态追踪, 召回与 state-based recall 任务上训练三个主要的因果 LM: 标准 transformer, 线性 RNN (带负特征值的 GDN), 以及把 GDN 块与全注意力混合的 hybrid 模型. 我们另外评测了线性 RNN 与 hybrid 模型不带负特征值的消融版本. 每个任务都由简短的类代码模板在线生成 (参见 Figures 4 and 5), 并构造成 next-token prediction 任务, 最后一个 token 需要正确求值程序才能答对. 我们报告最终答案 token 上的 next-token 准确率, 并通过增加所需状态更新次数和/或存储的位数组大小来调节任务难度. 对状态追踪与 state-based recall 任务, 我们还在执行轨迹上训练, 轨迹中含 assert 语句形式的中间状态揭示检查, 并按 Siems et al. (2026) 把这些 token 计入语言建模 loss. 完整实验细节 (模型超参, 优化, 课程学习与消融实验) 见 Section C.

**State Tracking.** To evaluate state tracking, we use the code evaluation task in Figure 4, where the context applies a sequence of state updates and the model must predict the value of a queried component of the final state. As shown in Figure 7, the GDN-based linear RNN and the hybrid remain near-perfect across all tested lengths, while the transformer drops rapidly as the update sequence length increases, consistent with the theoretical limitation of fixed-depth attention on state tracking (Section 3.1). The no-negative-eigenvalue ablations substantially weaken this behavior: the linear RNN without negative eigenvalues falls to 0.21484 and 0.22266 at n = 64 and 128, and the corresponding hybrid falls to 0.36328 at n = 128. In this implementation, negative eigenvalues appear important for robust recurrent state tracking, consistent with the findings from Grazzi et al. (2025).

**状态追踪.** 评测状态追踪时, 我们用 Figure 4 中的代码求值任务: 上下文施加一串状态更新, 模型须预测最终状态中被查询分量的值. 如 Figure 7 所示, 基于 GDN 的线性 RNN 与 hybrid 在所有测试长度上都保持近乎完美, transformer 则随更新序列变长迅速下滑, 与固定深度注意力在状态追踪上的理论局限 (Section 3.1) 一致. 不带负特征值的消融版本明显削弱了这一表现: 无负特征值的线性 RNN 在 n = 64 与 128 时跌到 0.21484 与 0.22266, 对应的 hybrid 在 n = 128 时跌到 0.36328. 在这一实现中, 负特征值对稳健的循环状态追踪看来很重要, 与 Grazzi et al. (2025) 的发现一致.

**Recall.** To evaluate pure recall, we use the code evaluation task illustrated in Figure 4, where predicting bits[idx] requires retrieving a single entry from a long list of bit assignments. As shown in Figure 7, the transformer remains near-perfect and the hybrid remains perfect across the tested context sizes, while the linear RNN degrades as the number of bits grows. The no-negative-eigenvalue ablation leaves the hybrid unchanged and only slightly worsens the linear RNN on the hardest settings (0.80078 at m = 64 and 0.67188 at m = 128, compared with 0.83203 and 0.67578 with negative eigenvalues). This matches the theoretical expectation that linear RNNs should struggle with recall due to their bounded-size state (Section 3.2).

**召回.** 评测纯召回时, 我们用 Figure 4 所示的代码求值任务: 预测 bits[idx] 需要从一长串比特赋值中取回一个条目. 如 Figure 7 所示, 在测试的上下文规模上, transformer 保持近乎完美, hybrid 保持完美, 线性 RNN 则随位数增加而退化. 去掉负特征值的消融对 hybrid 没有影响, 只让线性 RNN 在最难设置上略差 (m = 64 时 0.80078, m = 128 时 0.67188; 有负特征值时分别为 0.83203 与 0.67578). 这符合理论预期: 线性 RNN 因状态大小有界, 在召回上应当吃力 (Section 3.2).

**State-Based Recall.** To test the composition of state tracking and recall, we use the state-based recall task in Figure 5, where state updates transform a set of pointers that are subsequently used to index into a bit array. Theoretically, Theorem 1 predicts hybrid models can express state-based recall while transformers and RNNs cannot under standard complexity conjectures; we now test empirically whether a separation is observed when these models are trained on the task. As shown in Figure 7, both the transformer and the pure GDN-based linear RNN degrade as difficulty increases, while the hybrid with negative eigenvalues remains essentially perfect across all tested difficulties. By contrast, the no-negative-eigenvalue hybrid loses this advantage, dropping to 0.57031 at n = 128; the corresponding no-negative-eigenvalue linear RNN is similarly weak. This suggests that, in practice, the hybrid's compositional advantage depends on the recurrent block's access to negative eigenvalues.

**State-Based Recall.** 为检验状态追踪与召回的组合, 我们用 Figure 5 中的 state-based recall 任务: 状态更新变换一组指针, 这些指针随后用来对位数组取下标. 理论上, Theorem 1 预测在标准复杂度猜想下 hybrid 模型能表达 state-based recall, transformer 与 RNN 不能; 我们现在实证检验, 在该任务上训练这些模型时能否观察到这种分离. 如 Figure 7 所示, transformer 与纯 GDN 线性 RNN 都随难度上升而退化, 带负特征值的 hybrid 则在所有测试难度上基本保持完美. 相比之下, 无负特征值的 hybrid 失去了这一优势, 在 n = 128 时跌到 0.57031; 对应的无负特征值线性 RNN 同样很弱. 这说明实践中 hybrid 的组合优势依赖于循环块能否用上负特征值.

> **停一下:** Figure 7(c) 的 hybrid 有注意力负责召回, 为什么去掉 negative eigenvalues 后在 n = 128 仍跌到 0.57031, 而 Figure 7(b) 的纯召回完全不受影响?
> 因为 Definition 2 要先对 5 个指针复合 n 次对换, 这一半是 $\mathsf{NC}^1$-complete 的状态追踪, 按 Theorem 1 只能交给 GDN, 而 GDN 表达 swap 靠的正是 Figure 6 里的特征值 -1. 纯召回只用注意力那一半, 所以消融后 hybrid 不变. 组合任务的前半段一坏, 后面召回再准也取错了位置. 这与状态追踪实验里无负特征值 hybrid 在 n = 128 跌到 0.36328 是同一原因.

Overall, these results support the theoretical picture while refining the architectural story: transformers excel at recall but struggle with hard state tracking, GDN-based linear RNNs show the opposite pattern, and hybrids with negative eigenvalues inherit both capabilities and remain strong on their composition. Removing negative eigenvalues has little effect on pure recall, but substantially harms state tracking and the composed state-based recall task, in line with theoretical predictions (Grazzi et al., 2025).

总体而言, 这些结果支持理论图景, 也让架构层面的解释更细: transformer 擅长召回但难以处理困难的状态追踪, 基于 GDN 的线性 RNN 正好相反, 带负特征值的 hybrid 继承了两种能力, 在二者的组合上也保持强劲. 去掉负特征值对纯召回影响很小, 却明显损害状态追踪以及组合后的 state-based recall 任务, 与理论预测一致 (Grazzi et al., 2025).

### 3.6 Discussion: Pushing the Expressivity-Parallelism Frontier 讨论: 推进表达力-并行性前沿

Transformers and linear RNNs have complementary strengths from an expressivity perspective. We have shown that hybrid models do not simply inherit the strengths of each architecture; they go beyond both transformers and linear RNNs by expressing tasks that neither architecture alone can. Notably, this expressivity advantage of hybrid models comes despite them retaining theoretical parallelizability to a similar degree as transformers

从表达力角度看, transformer 与线性 RNN 各有所长. 我们已经表明, hybrid 模型不只是继承两种架构各自的长处, 还能表达两者单独都表达不了的任务, 从而同时超越 transformer 与线性 RNN. 值得注意的是, hybrid 模型获得这种表达力优势的同时, 在理论上仍保持与 transformer 相近程度的可并行性

<!-- page 14 of 70 -->

(Merrill et al., 2026). In other words, hybrid architectures extract strictly more from the level of parallelism at which transformers and linear RNNs operate, in a similar vein to the idea of "leaving less money on the table" and getting more out of the same resources in machine learning (Ligett, 2026). Thus, hybrid models push the expressivity-parallelism frontier for language modeling architectures beyond transformers (cf. beginning of Section 3), yielding fundamentally more expressive models that remain similarly scalable.

(Merrill et al., 2026). 换句话说, 在 transformer 与线性 RNN 所处的并行程度上, hybrid 架构榨取出严格更多的能力, 这与机器学习中 「leaving less money on the table」, 即用相同资源得到更多产出的思路相近 (Ligett, 2026). 因此, hybrid 模型把语言建模架构的表达力-并行性前沿推到了 transformer 之外 (参见 Section 3 开头), 得到表达力根本更强, 可扩展性相近的模型.

## 4 Scaling Behavior of Hybrid Models Hybrid 模型的 Scaling 行为

Having established the increased theoretical expressivity of hybrid models over transformers in Section 3, we now turn to evaluating hybrid LMs in practice. A central question is whether the theoretical expressivity guarantees for hybrid models translate to better empirical performance as a function of the parameter count and data invested into a language model.

Section 3 确立了 hybrid 模型相对 transformer 在理论表达力上的提升, 现在转向评测实践中的 hybrid LM. 核心问题是: hybrid 模型的理论表达力保证, 能否随语言模型投入的参数量与数据量, 转化为更好的实证表现.

First, by fitting scaling laws for hybrid models and transformers in a carefully controlled setting (Section 4.1), we establish that hybrid models achieve better scaling efficiency on loss-based pretraining metrics compared to transformers—particularly in scaling with data quantity—consistent with our findings from the Olmo Hybrid pretraining run. Next, drawing on existing theoretical explanations for scaling laws, we present a theoretical argument that increasing an LM's expressive power should improve its scaling efficiency (Section 4.2). Informally, building on explanations of scaling laws in terms of the multi-task nature of language modeling (Michaud et al., 2023), we argue that increased expressivity can improve scaling because it allows a model to acquire a larger proportion of the discrete computational tasks reflected in the pretraining data. This provides a conceptual explanation for the improved scaling efficiency of hybrid models that we take as a compelling hypothesis for future work to test and develop further.

首先, 我们在严格受控的设置下为 hybrid 模型与 transformer 拟合 Scaling Laws (Section 4.1), 确立 hybrid 模型在基于 loss 的预训练指标上比 transformer 有更高的 Scaling 效率, 尤其是随数据量的 Scaling, 这与 Olmo Hybrid 预训练中的发现一致. 接着, 借助已有的 Scaling Laws 理论解释, 我们给出一个理论论证: 提升 LM 的表达力应能提高其 Scaling 效率 (Section 4.2). 非形式地说, 基于从语言建模的多任务本质来解释 Scaling Laws 的工作 (Michaud et al., 2023), 我们论证表达力提升能改善 Scaling, 因为它让模型能习得预训练数据中所反映的离散计算任务里更大的比例. 这为 hybrid 模型更高的 Scaling 效率提供了一个概念性解释, 我们把它视为一个有说服力的假说, 留待后续工作检验与发展.

### 4.1 Scaling Laws for Hybrid Models Hybrid 模型的 Scaling Laws

This section presents derived empirical scaling laws for transformers, pure GDN models, and hybrid models that form the backbone of Olmo Hybrid. Empirical scaling laws enable a principled comparison of different architectures, evaluating not only performance at specific scales but also projecting to larger scales. Our results show that hybrid models are both more data-efficient and more compute-efficient than transformers across scales.

本节给出 transformer, 纯 GDN 模型以及构成 Olmo Hybrid 骨干的 hybrid 模型的实证 Scaling Laws. 实证 Scaling Laws 让我们能有原则地比较不同架构: 既评测特定规模下的表现, 也外推到更大规模. 结果表明, 在各个规模上, hybrid 模型都比 transformer 更省数据, 也更省算力.

**Overview.** We fit Chinchilla-style scaling laws (Hoffmann et al., 2022) to transformers, pure GDN models, and hybrid GDN–transformer models. We find that the hybrid model has a meaningfully lower data coefficient B, while scaling exponents are statistically indistinguishable across architectures. This aligns with our theoretical analysis in Section 4.2 that increased expressivity should improve scaling efficiency by reducing the data coefficient, which captures the fixed-factor improvement in the data required to reach a target loss. This translates to projected token savings of ∼1.3–1.9× at model sizes from 1B to 70B parameters.

**概述.** 我们为 transformer, 纯 GDN 模型与 GDN–transformer hybrid 模型拟合 Chinchilla 式 Scaling Laws (Hoffmann et al., 2022). 我们发现 hybrid 模型的数据系数 B 明显更低, 而 Scaling 指数在各架构间统计上无法区分. 这与 Section 4.2 的理论分析一致: 表达力提升应通过降低数据系数来提高 Scaling 效率, 数据系数刻画的是达到目标 loss 所需数据量的固定倍数改进. 换算下来, 在 1B 到 70B 参数的模型规模上, 预计可节省 ∼1.3–1.9× 的 token.

**Scaling Laws Formulation.** Scaling laws describe the behavior of the language modeling loss as a smooth power law with model size and data budget (Kaplan et al., 2020). Hoffmann et al. (2022) investigate scaling laws with the parametric form

**Scaling Laws 的形式.** Scaling Laws 把语言建模 loss 描述为模型规模与数据预算的平滑幂律 (Kaplan et al., 2020). Hoffmann et al. (2022) 研究了如下参数形式的 Scaling Laws:

$$
L (N, D) = E + \frac {A}{N ^ {\alpha}} + \frac {B}{D ^ {\beta}},\tag{1}
$$

where the number of parameters N and number of training tokens D are the independent variables. The quantity E is the irreducible loss, i.e., the loss that would be attained with infinite resources. The other fit parameters govern how efficiently loss is reduced when N, D are scaled. The coefficients A and B capture fixed-factor improvements in the resources required to reach a target loss: reducing either by a factor k with fixed E implies that the same target loss can be reached with a k-fold reduction in resources. Finally, the exponents α and β govern the rate at which loss improves with scale, though generally these exponents are not changed much by architecture choices. Comparing these parameters between two architectures provides a principled way to quantify which is fundamentally more compute- or data-efficient.

其中参数量 N 与训练 token 数 D 是自变量. E 是不可约 loss, 即资源无限时能达到的 loss. 其余拟合参数决定 N, D 放大时 loss 下降的效率. 系数 A 与 B 刻画达到目标 loss 所需资源的固定倍数改进: 在 E 固定时把其中任一个降低 k 倍, 意味着用少 k 倍的资源就能达到同样的目标 loss. 最后, 指数 α 与 β 决定 loss 随规模改善的速率, 不过这些指数一般不会因架构选择而有多大变化. 比较两种架构的这些参数, 是量化哪一种在根本上更省算力或更省数据的有原则的方法.

We now fit scaling laws to evaluate how efficiently hybrid models scale relative to other architectures. We evaluate three architectures—a pure transformer, a pure GDN, and a hybrid GDN architecture with every fourth

我们现在拟合 Scaling Laws, 评估 hybrid 模型相对其他架构的 Scaling 效率. 我们评测三种架构: 纯 transformer, 纯 GDN, 以及每四层中有一层

<!-- page 15 of 70 -->

layer being a full transformer block—across scales from 60M to 760M parameters, fitting scaling laws to estimate their coefficients and project performance at larger compute budgets. We follow an **isoparams data collection strategy** (Hoffmann et al., 2022): for each model size $N \in \{ 6 0 \mathrm { M }$ , 100M, 190M, 370M, 600M, 760M, 1B}, we train a model at $0 . 5 \times , 1 \times , 2 \times , 4 \times ,$ , and 8× Chinchilla-optimal tokens (20 tokens per parameter). Naïvely, this would require launching five separate runs per architecture and parameter budget. We avoid this by using a WSD-S (warmup–stable–decay with periodic resets) learning rate schedule (Hu et al., 2024; Wen et al., 2025b), which is **token-agnostic**: the learning rate at step t does not depend on the total number of tokens T. This allows us to reuse intermediate checkpoints from a single long run to collect loss measurements at different data budgets D. More precisely, we decay the learning rate for 5% of the training tokens to 0 at each of the five Chinchilla factors to obtain the trained checkpoint for that Chinchilla factor. Decaying the learning rate at each of the five Chinchilla factors and evaluating the resulting checkpoints yields five $( N , D , L )$ triples from a single training run per architecture and parameter count.

为完整 transformer 块的 hybrid GDN 架构, 规模从 60M 到 760M 参数, 拟合 Scaling Laws 以估计系数, 并外推更大算力预算下的表现. 我们采用 **isoparams 数据收集策略** (Hoffmann et al., 2022): 对每个模型规模 $N \in \{ 6 0 \mathrm { M }$, 100M, 190M, 370M, 600M, 760M, 1B}, 分别在 $0 . 5 \times , 1 \times , 2 \times , 4 \times ,$ 与 8× Chinchilla 最优 token 数 (每个参数 20 个 token) 上训练. 朴素做法需要对每种架构与参数预算各启动五次独立训练. 我们改用 WSD-S (带周期重置的 warmup–stable–decay) 学习率调度 (Hu et al., 2024; Wen et al., 2025b) 来避免这一点, 它是 **token-agnostic** 的: 第 t 步的学习率不依赖总 token 数 T. 这让我们能复用单次长训练的中间 checkpoint, 收集不同数据预算 D 下的 loss 测量. 更具体地说, 在五个 Chinchilla 倍数的每一处, 我们用训练 token 的 5% 把学习率衰减到 0, 得到该倍数对应的训练完成 checkpoint. 在五个 Chinchilla 倍数处各衰减一次学习率并评测所得 checkpoint, 就能从每种架构, 每个参数量的单次训练中得到五个 $( N , D , L )$ 三元组.

We run this procedure for three models:

我们对三个模型执行这一流程:

1. The transformer baseline based on the Olmo 3 model,

1. 基于 Olmo 3 模型的 transformer 基线,

2. A fully linear RNN (GDN), and

2. 全线性 RNN (GDN), 以及

3. A hybrid model with a 3 : 1 GDN-to-transformer layer ratio—the architecture that forms the basis of Olmo Hybrid.

3. GDN 与 transformer 层比例为 3 : 1 的 hybrid 模型, 也就是 Olmo Hybrid 的基础架构.

We train all architectures under **matched conditions**: identical training data (Olmo 3 32B mix), optimizer settings, batch size scaling, and evaluation. The only difference between runs is the architecture itself.

所有架构都在 **匹配条件** 下训练: 相同的训练数据 (Olmo 3 32B mix), 优化器设置, batch size 放大方式与评测. 各次训练之间唯一的差别是架构本身.

**Model Specification.** Rather than matching parameter counts exactly, we match the architectural blueprint— the number of layers, heads, and the hidden dimension—of each model to that of Olmo 3 at each scale. This results in models with different numbers of parameters. We account for these differences by focusing on performance as a function of the training FLOPs and fit the scaling laws with respect to the exact number of parameters. The detailed configurations are presented in Table 22.

**模型规格.** 我们不去精确匹配参数量, 而是在每个规模上让各模型的架构蓝图 (层数, 头数与隐藏维度) 与 Olmo 3 一致. 这会导致各模型参数量不同. 为此, 我们关注表现随训练 FLOPs 的变化, 并用精确参数量拟合 Scaling Laws. 详细配置见 Table 22.

**Fitting and Using Scaling Laws.** Given the collected $( N , D , L )$ data triples (35 per architecture; 5 for each of the 7 scales), we fit parametric scaling laws following Approach 3 of Hoffmann et al. (2022): we directly fit $L ( N , D ) = \dot { E } + A / N ^ { \alpha } + B / D ^ { \beta }$ by minimizing the Huber loss of log L between predictions and data. We model the validation loss, computed as the average cross-entropy across 11 held-out evaluation domains: C4 (Raffel et al., 2019), Dolma Books, Dolma Common Crawl, Dolma pes2o, Dolma Reddit, Dolma Stack, Dolma Wiki (Soldaini et al., 2024), ICE (Greenbaum and Nelson, 1996), M2D2 S2ORC (Reid et al., 2022; Lo et al., 2020), Pile (Gao et al., 2020), and WikiText-103 (Merity et al., 2016). Averaging across domains provides a less noisy and more representative signal than any single validation set. Following Hoffmann et al. (2022), we use Huber loss to reduce sensitivity to outliers from training instabilities. The fit is performed jointly over all $( N , D , L )$ triples for each architecture separately. To assess uncertainty in our scaling law estimates, we additionally compute 95% confidence intervals via bootstrap resampling (1,000 iterations).

**拟合与使用 Scaling Laws.** 拿到收集的 $( N , D , L )$ 数据三元组 (每种架构 35 个; 7 个规模各 5 个) 后, 我们按 Hoffmann et al. (2022) 的 Approach 3 拟合参数化 Scaling Laws: 以预测与数据之间 log L 的 Huber loss 最小化为目标, 直接拟合 $L ( N , D ) = \dot { E } + A / N ^ { \alpha } + B / D ^ { \beta }$. 我们建模的是验证 loss, 计算为 11 个留出评测领域上的平均交叉熵: C4 (Raffel et al., 2019), Dolma Books, Dolma Common Crawl, Dolma pes2o, Dolma Reddit, Dolma Stack, Dolma Wiki (Soldaini et al., 2024), ICE (Greenbaum and Nelson, 1996), M2D2 S2ORC (Reid et al., 2022; Lo et al., 2020), Pile (Gao et al., 2020) 以及 WikiText-103 (Merity et al., 2016). 跨领域平均比任何单个验证集噪声更小, 也更有代表性. 按 Hoffmann et al. (2022) 的做法, 我们用 Huber loss 降低对训练不稳定造成的离群点的敏感度. 拟合对每种架构分别进行, 在其全部 $( N , D , L )$ 三元组上联合完成. 为评估 Scaling Laws 估计的不确定性, 我们还通过 bootstrap 重采样 (1,000 次迭代) 计算 95% 置信区间.

**Free and Fixed-Exponent Fits.** We fit scaling laws in two ways. In the unconstrained fit, all five parameters $( E ,   A ,   \alpha ,   B ,   \beta )$ are free; this provides the most flexible fit that explains the scaling laws but yields wide bootstrap confidence intervals, making per-coefficient comparisons unreliable. We therefore also present a fixed-exponent fit in which we fix α and $\beta$ across all architectures and fit only E, A, and B. Fixing the exponents concentrates the remaining variance onto the efficiency coefficients, enabling more statistically robust comparisons between architectures. Full details on the data used for fitting, the optimization procedure, and the construction of all figures and tables in this section are provided in Section D.2.

**自由指数拟合与固定指数拟合.** 我们用两种方式拟合 Scaling Laws. 无约束拟合中, 五个参数 $( E ,   A ,   \alpha ,   B ,   \beta )$ 全部自由; 这是解释 Scaling Laws 最灵活的拟合, 但 bootstrap 置信区间很宽, 逐个系数的比较不可靠. 因此我们还给出固定指数拟合: 在所有架构间固定 α 与 $\beta$, 只拟合 E, A 与 B. 固定指数把剩余方差集中到效率系数上, 使架构间的比较在统计上更稳健. 拟合所用数据, 优化过程, 以及本节所有图表构造的完整细节见 Section D.2.

**Scaling Law Fits and Fit Quality.** Figure 8 shows the fitted scaling laws alongside the raw data for all three architectures, plotted against compute, parameter count, and token budget. The curves in all figures are drawn using the coefficients estimated from the unconstrained fit; we use the fixed-exponent fit only when making quantitative comparisons between architectures (see below). Qualitatively, the hybrid and pure GDN curves lie consistently below the transformer curve, indicating lower loss at matched compute or parameter budget; the separation is visible across all three panels. The fits achieve $R ^ { 2 } \geq 0 . 9 9 8$ for all three architectures,

**Scaling Laws 拟合与拟合质量.** Figure 8 展示三种架构拟合出的 Scaling Laws 以及原始数据, 分别以算力, 参数量与 token 预算为横轴. 所有图中的曲线都用无约束拟合估计的系数绘制; 只有在做架构间定量比较时才用固定指数拟合 (见下文). 定性来看, hybrid 与纯 GDN 的曲线始终位于 transformer 曲线下方, 表明在相同算力或参数预算下 loss 更低; 三个子图中都能看到这种分离. 三种架构的拟合都达到 $R ^ { 2 } \geq 0 . 9 9 8$,

<!-- page 16 of 70 -->

![Chart block](images/p16-chart.png)

![Chart block](images/p16-chart-2.png)

![Chart block](images/p16-figure-8-scaling-law-fits-l-n-d-e-a-n-alpha-b-d-beta.png)

Figure 8 Scaling law fits $L ( N , D ) = E + A / N ^ { \alpha } + B / D ^ { \beta }$ for all architectures. Transformer: $\alpha = 0.252,   \beta = 0.213,$ $\tilde { R ^ { 2 } } = 0 . 9 9 8$ . Hybrid: $\alpha = 0 . 2 2 6$ $\beta = 0 . 2 1 9$ $R ^ { 2 } = 0 . 9 9 9$ Pure GDN: $\alpha = 0 . 1 8 3$ $\beta = 0 . 2 2 7 ,$ $R ^ { 2 } = 0 . 9 9 9 .$ (a) Loss vs. compute; points represent model checkpoints at different model sizes (shown by opacity) and the bold curve shows the fitted scaling law at the compute-optimal frontier. (b) Loss vs. parameter count; points represent checkpoints at different Chinchilla multiples $( D / N$ ratios, shown by opacity) and the fitted curve is evaluated at the largest multiple. (c) Loss vs. data budget; points represent checkpoints at different model sizes (shown by opacity) and the fitted curve is evaluated at the largest model size. Loss axes are plotted on a logarithmic scale so that the power-law relationships appear linear.

图 8 各架构的 Scaling Laws 拟合 $L ( N , D ) = E + A / N ^ { \alpha } + B / D ^ { \beta }$. Transformer: $\alpha = 0.252,   \beta = 0.213,$ $\tilde { R ^ { 2 } } = 0 . 9 9 8$. Hybrid: $\alpha = 0 . 2 2 6$ $\beta = 0 . 2 1 9$ $R ^ { 2 } = 0 . 9 9 9$. Pure GDN: $\alpha = 0 . 1 8 3$ $\beta = 0 . 2 2 7 ,$ $R ^ { 2 } = 0 . 9 9 9 .$ (a) Loss 随算力变化; 点表示不同模型规模的 checkpoint (以透明度区分), 粗曲线是算力最优前沿上的拟合 Scaling Laws. (b) Loss 随参数量变化; 点表示不同 Chinchilla 倍数的 checkpoint $( D / N$ 比例, 以透明度区分), 拟合曲线取最大倍数处的值. (c) Loss 随数据预算变化; 点表示不同模型规模的 checkpoint (以透明度区分), 拟合曲线取最大模型规模处的值. Loss 轴取对数刻度, 使幂律关系呈直线.

| Architecture | Model | N | D | Observed | Predicted | Error (%) |
| --- | --- | --- | --- | --- | --- | --- |
| Transformer | Olmo 3 | 7B | 5.9T | 2.17 | 2.16 | 0.28 |
| Transformer | Olmo 3 | 32B | 5.5T | 2.02 | 2.05 | 1.69 |
| Hybrid GDN | Olmo Hybrid | 7B | 5.5T | 2.14 | 2.14 | 0.28 |

Table 4 Scaling law prediction validation against final models. Predicted loss is computed from the fitted law $L ( N , D ) = E + A / N ^ { \alpha } + B / D ^ { \beta }$ . Extrapolation is generally strong despite differences in the learning rate schedule between our scaling studies and the large-scale training runs.

表 4 用最终模型检验 Scaling Laws 的预测. 预测 loss 由拟合式 $L ( N , D ) = E + A / N ^ { \alpha } + B / D ^ { \beta }$ 计算. 尽管 Scaling 研究与大规模训练所用的学习率调度不同, 外推效果总体很好.

confirming that the Chinchilla scaling law form describes the observed loss curves well across the full range of scales considered.

证实 Chinchilla Scaling Laws 的形式在所考察的整个规模范围内都能很好地描述观测到的 loss 曲线.

**The Derived Scaling Laws are Consistent with Pretraining Observations.** Table 4 validates the derived scaling laws against larger models—the final base 7B Olmo Hybrid as well as the 7B and 32B base Olmo 3 models—and confirms that they generalize well outside the fitting range. The predicted loss for the 7B Olmo Hybrid trained on 5.5T tokens is 2.142, compared to the observed 2.136 (error 0.28%); for Olmo 3 7B (5.93T tokens), the error is similarly 0.28%; and even for Olmo 3 32B—well beyond the ∼1B fitting range—the error is only 1.69%. These results establish that the fitted scaling laws are reliable enough to project performance at larger scales.

**推出的 Scaling Laws 与预训练观察一致.** Table 4 用更大的模型检验推出的 Scaling Laws: 最终的 7B Olmo Hybrid base 模型, 以及 7B 与 32B 的 Olmo 3 base 模型, 证实它们在拟合范围之外也泛化良好. 在 5.5T token 上训练的 7B Olmo Hybrid, 预测 loss 为 2.142, 观测值为 2.136 (误差 0.28%); Olmo 3 7B (5.93T token) 的误差同样是 0.28%; 即便是远超 ∼1B 拟合范围的 Olmo 3 32B, 误差也只有 1.69%. 这些结果表明拟合出的 Scaling Laws 足够可靠, 可用于外推更大规模下的表现.

**The Hybrid Model Has a Robustly Lower Data Coefficient.** Figure 8 visually suggests that the hybrid model has better scaling efficiency than the transformer, particularly with respect to data. To quantify this, we compare the fitted scaling law parameters across architectures in Figure 9 (see Table 18 in the appendix for full details). While the unconstrained fit allows all five parameters to vary and is thus the most flexible, the resulting CIs are wide and largely overlapping, yielding no statistically robust per-coefficient conclusions. We therefore turn to the fixed-exponent fit to draw robust conclusions: we fix $\alpha = \beta = 0 . 2 2$ shared across architectures (the mean of the unconstrained estimates) and refit only E, A, and B. This gives us a clear signal in the data efficiency coefficient B: the hybrid's B = 83.7 (CI [80.2, 87.1]) is significantly lower than the transformer's 94.9 (CI [88.7, 102.0]), with non-overlapping confidence intervals. The parameter coefficient A also slightly favors the hybrid (70.1 vs. 71.8), but the CIs overlap. The scaling exponents in the unconstrained fit are

**Hybrid 模型的数据系数稳健地更低.** 从 Figure 8 直观看, hybrid 模型的 Scaling 效率高于 transformer, 在数据维度上尤其明显. 为量化这一点, 我们在 Figure 9 中比较各架构拟合出的 Scaling Laws 参数 (完整细节见附录 Table 18). 无约束拟合允许五个参数全部变化, 因而最灵活, 但由此得到的置信区间很宽且大面积重叠, 得不出统计上稳健的逐系数结论. 因此我们转向固定指数拟合来得出稳健结论: 在各架构间固定共享的 $\alpha = \beta = 0 . 2 2$ (无约束估计的均值), 只重新拟合 E, A 与 B. 这在数据效率系数 B 上给出清晰信号: hybrid 的 B = 83.7 (CI [80.2, 87.1]) 显著低于 transformer 的 94.9 (CI [88.7, 102.0]), 置信区间不重叠. 参数系数 A 也略偏向 hybrid (70.1 对 71.8), 但置信区间重叠. 无约束拟合中的 Scaling 指数

<!-- page 17 of 70 -->

![Chart block](images/p17-figure-9-scaling-law-coefficients-e-a-b-with-95.png)

Figure 9 Scaling law coefficients E, A, B with 95% bootstrap CIs for the fixed-exponent fit (α=β=0.22 shared), which yields tight confidence intervals. The data efficiency coefficient B shows a robust advantage for Hybrid GDN over the transformer (83.7 vs. 94.9, non-overlapping CIs, marked ∗), while differences in E and A are not statistically conclusive.

图 9 固定指数拟合 (共享 α=β=0.22) 下的 Scaling Laws 系数 E, A, B 及其 95% bootstrap 置信区间, 区间很窄. 数据效率系数 B 显示 Hybrid GDN 相对 transformer 有稳健优势 (83.7 对 94.9, 置信区间不重叠, 标 ∗), E 与 A 的差异在统计上不具结论性.

> **再看:** Figure 9 固定 α=β=0.22 后 B 是 83.7 对 94.9; 回到 Eq. (1) 的 data term $B/D^{\beta}$, 这个差距大致折合多少 token?
> 只看数据项做粗算: 要让 $B/D^{\beta}$ 相等, token 比例约为 (94.9/83.7)^{1/0.22} ≈ 1.77. 这与 §4.1 投影的 ∼1.3–1.9× 同量级. 实际 Figure 10(b) 是按 $D^*(N)$ 反解, 还带着 E 与 $A/N^{\alpha}$, 所以 1B 只有 ∼1.3×, 70B 才到 ∼1.9×. 另外只有 B 的置信区间不重叠, A (70.1 对 71.8) 与 E 的差异都不显著, 所以文中把主优势落在 B 上.

statistically indistinguishable across architectures—consistent with the theory (Section 4.2), which predicts that expressivity shifts the efficiency constants without altering the power-law exponents. The primary robust advantage of the hybrid model is thus its data efficiency coefficient $B ,$ as also predicted by our theoretical results in section 4.2.

在各架构间统计上无法区分, 与理论 (Section 4.2) 一致: 理论预测表达力改变的是效率常数, 而不改变幂律指数. 因此 hybrid 模型主要的稳健优势在于数据效率系数 $B ,$ 这也正是 section 4.2 的理论结果所预测的.

**Token Savings Grow Steadily with Model Size.** The improved scaling trend of hybrid models naturally translates to better scaling of the loss with compute. The projected savings are derived by analytically inverting the fitted scaling law: for a target loss $L ^ { * }$ , the number of tokens required by a model with N parameters is $D ^ { * } ( N ) = \left( B / ( L ^ { * } - E - A / N ^ { \alpha } ) \right) ^ { 1 / \beta }$ , evaluated at each model size using each architecture's fitted coefficients (see Section D.2 for full details). While the pure GDN achieves the lowest estimated loss at small parameter budgets, the hybrid model achieves better loss at the more typical medium and large scales, where its advantage in the data-efficiency coefficient B becomes the dominant and most reliable signal. Figure 10 visualizes the projected parameter and data savings factors across model sizes for a target loss of 2.474 (the minimum observed training loss); the token requirements are obtained by analytically inverting the fitted scaling law as described in Section D.2. The parameter savings factor (cf. Figure 10(a)) reveals that transformers are more parameter-efficient at larger token budgets, a consequence of the larger scaling factor α. Figure 10(b), in contrast, shows that the token savings factor grows steadily with model size, rising from ∼1.3× at 1B parameters to ∼1.9× at 70B parameters. Concretely, to match a transformer trained at a given scale, one can train a hybrid model of the same size on ∼1.3–1.9× fewer tokens (e.g., 1.68× at 7B, 1.82× at 30B, 1.89× at 70B; see Figure 10(b) and Table 20). The pure GDN model, by contrast, initially requires more data than the transformer at the 1B scale (0.82×, i.e., no savings) before catching up and achieving savings of ∼1.7× at 70B.

**Token 节省随模型规模稳步增长.** Hybrid 模型更好的 Scaling 趋势, 自然转化为 loss 随算力更好的 Scaling. 预计的节省由解析反解拟合出的 Scaling Laws 得到: 对目标 loss $L ^ { * }$, 参数量为 N 的模型所需 token 数为 $D ^ { * } ( N ) = \left( B / ( L ^ { * } - E - A / N ^ { \alpha } ) \right) ^ { 1 / \beta }$, 在每个模型规模上用各架构的拟合系数计算 (完整细节见 Section D.2). 纯 GDN 在小参数预算下估计 loss 最低, 但在更常见的中大规模上 hybrid 模型的 loss 更好, 此时它在数据效率系数 B 上的优势成为主导且最可靠的信号. Figure 10 展示目标 loss 为 2.474 (观测到的最低训练 loss) 时, 各模型规模上预计的参数节省倍数与数据节省倍数; token 需求按 Section D.2 所述解析反解拟合出的 Scaling Laws 得到. 参数节省倍数 (参见 Figure 10(a)) 显示, 在较大 token 预算下 transformer 的参数效率更高, 这是其 Scaling 因子 α 更大的结果. 相反, Figure 10(b) 显示 token 节省倍数随模型规模稳步增长, 从 1B 参数时的 ∼1.3× 升到 70B 参数时的 ∼1.9×. 具体来说, 要追平某一规模下训练的 transformer, 同规模的 hybrid 模型可以少用 ∼1.3–1.9× 的 token (例如 7B 时 1.68×, 30B 时 1.82×, 70B 时 1.89×; 见 Figure 10(b) 与 Table 20). 相比之下, 纯 GDN 模型在 1B 规模上起初比 transformer 需要更多数据 (0.82×, 即没有节省), 之后追上, 到 70B 时节省 ∼1.7×.

**Compute Savings Also Grow Steadily with Model Size.** Token savings directly lead to improved compute efficiency. Figure 10(c) visualizes this by showing the compute savings factor needed for reaching a target loss, revealing steadily growing savings. At 10<sup>22</sup> FLOPs, for example, the hybrid model is projected to achieve a loss of 2.267 compared to 2.308 for the transformer (∆ = −0.042, 95% CI [−0.14, +0.06]); full results across compute budgets from $1 0 ^ { 1 8 }$ to $1 0 ^ { 2 3 }$ FLOPs are reported in Table 19 in the appendix.

**算力节省同样随模型规模稳步增长.** Token 节省直接带来算力效率的提升. Figure 10(c) 展示达到目标 loss 所需的算力节省倍数, 可以看到节省稳步增长. 例如在 10<sup>22</sup> FLOPs 时, hybrid 模型预计达到 loss 2.267, transformer 为 2.308 (∆ = −0.042, 95% CI [−0.14, +0.06]); 从 $1 0 ^ { 1 8 }$ 到 $1 0 ^ { 2 3 }$ FLOPs 各算力预算下的完整结果见附录 Table 19.

**Implications.** The derived scaling laws suggest favorable scaling for hybrid models compared to both pure transformers and purely linear RNN models. The most statistically robust finding, from the fixed-exponent analysis, is that the hybrid model has a meaningfully lower data coefficient B (83.7 vs. 94.9 for the transformer, non-overlapping 95% CIs), indicating that hybrid models are more data-efficient learners. The parameter coefficient A also slightly favors the hybrid, though this difference is less statistically clear. In Section 4.2,

**含义.** 推出的 Scaling Laws 表明, hybrid 模型的 Scaling 比纯 transformer 与纯线性 RNN 模型都更有利. 固定指数分析给出的统计上最稳健的发现是: hybrid 模型的数据系数 B 明显更低 (83.7 对 transformer 的 94.9, 95% 置信区间不重叠), 说明 hybrid 模型是更省数据的学习者. 参数系数 A 也略偏向 hybrid, 但这一差异在统计上不够清晰. 在 Section 4.2 中,

<!-- page 18 of 70 -->

![Chart block](images/p18-chart.png)

![Chart block](images/p18-chart-2.png)

![Chart block](images/p18-figure-10-projected-savings-factors-across-model-scales.png)

Figure 10 Projected savings factors across model scales (target loss = 2.474, selected as the minimum of all observed training losses). (a) Parameter savings $( N _ { \mathrm { r e f } } / N _ { \mathrm { a r c h } } )$ vs training tokens: fewer parameters are needed to reach the same loss at a given data budget. (b) Data savings $( D _ { \mathrm { r e f } } / D _ { \mathrm { a r c h } } )$ vs model size: fewer training tokens are needed to reach the target loss at a given model size. (c) Compute savings $( C _ { \mathrm { r e f } } / C _ { \mathrm { a r c h } } ,   C \propto N { \cdot } D )$ vs target loss: for each target loss the minimum total compute is found by optimising over model size $N ;$ harder targets (lower loss) are on the right. Dashed vertical lines mark the observed losses of our final production models. The savings factor grows with difficulty for both Pure GDN and Hybrid models. Values above 1× indicate an advantage over Transformer. Note that estimates at lower loss values (right side of the plot) involve extrapolation beyond the fitting range and are therefore less certain.

图 10 各模型规模上预计的节省倍数 (目标 loss = 2.474, 取所有观测训练 loss 的最小值). (a) 参数节省 $( N _ { \mathrm { r e f } } / N _ { \mathrm { a r c h } } )$ 随训练 token 数变化: 在给定数据预算下达到相同 loss 所需参数更少. (b) 数据节省 $( D _ { \mathrm { r e f } } / D _ { \mathrm { a r c h } } )$ 随模型规模变化: 在给定模型规模下达到目标 loss 所需训练 token 更少. (c) 算力节省 $( C _ { \mathrm { r e f } } / C _ { \mathrm { a r c h } } ,   C \propto N { \cdot } D )$ 随目标 loss 变化: 对每个目标 loss, 在模型规模 $N ;$ 上优化求得最小总算力; 更难的目标 (更低 loss) 在右侧. 竖直虚线标出最终生产模型的观测 loss. Pure GDN 与 Hybrid 模型的节省倍数都随难度增长. 大于 1× 表示相对 Transformer 有优势. 注意较低 loss 处 (图右侧) 的估计涉及超出拟合范围的外推, 因此不确定性更大.

we argue that the improved B is consistent with the expressivity-grounded prediction that more expressive architectures can learn a larger proportion of discrete tasks from data, making each training token more valuable. The scaling exponents α and β are statistically indistinguishable across architectures—consistent with the theoretical prediction that expressivity shifts the constant-factor efficiency without altering the power-law exponents. Together, these results suggest that the primary practical benefit of hybrid models for scaling is more efficient use of training data, which is consistent with our pretraining observations (cf. Figure 1) and the projected ∼1.9× data savings at 70B scale (cf. Figure 10(b) and Table 20). We study additional architecture ablations in Section 5.1, where we justify choosing GDN for the linear component of Olmo Hybrid and the specific hybridization strategy.

我们论证 B 的改善与基于表达力的预测一致: 表达力更强的架构能从数据中学到更大比例的离散任务, 让每个训练 token 更有价值. Scaling 指数 α 与 β 在各架构间统计上无法区分, 与理论预测一致: 表达力改变的是常数倍效率, 而不改变幂律指数. 综合来看, 这些结果表明 hybrid 模型在 Scaling 上的主要实际收益是更高效地利用训练数据, 这与我们的预训练观察 (参见 Figure 1) 以及 70B 规模上预计 ∼1.9× 的数据节省 (参见 Figure 10(b) 与 Table 20) 一致. 我们在 Section 5.1 中研究更多架构消融, 论证为何选 GDN 作为 Olmo Hybrid 的线性组件, 以及具体的 hybrid 策略.

### 4.2 Theory: Increased Expressive Power Improves Scaling 理论: 表达力提升改善 Scaling

In Section 4.1, we saw that the hybrid model scaled more efficiently during pretraining than the transformer, achieving better performance with the same token or compute budget. At first glance, it may be unclear why pretraining efficiency should be related to the greater expressivity of hybrid models (Section 3): after all, our expressivity guarantees imply a binary difference in abilities on synthetic tasks, whereas scaling laws concern smooth improvements on modeling natural-language data. However, we now formalize a plausible explanation for why the greater expressivity of hybrid models should translate to improved scaling behavior. In particular, recent work explains neural scaling laws as emerging from the gradual aggregation of many discrete tasks reflected in language modeling data. Working within this framework, we show that increasing expressivity improves scaling trends (Corollaries 4.1 and 4.2) because it increases the number of discrete tasks that a model can learn on a fixed parameter and token budget. In aggregate, this means that more expressive models can achieve lower loss on the same budget, as shown in Figure 11.

在 Section 4.1 中我们看到, 预训练期间 hybrid 模型比 transformer Scaling 更高效, 在相同 token 或算力预算下表现更好. 乍看之下, 预训练效率为什么会与 hybrid 模型更强的表达力 (Section 3) 相关, 可能并不清楚: 毕竟我们的表达力保证意味着合成任务上能力的二元差异, 而 Scaling Laws 关注的是自然语言数据建模上的平滑改进. 不过, 我们现在形式化一个合理的解释, 说明 hybrid 模型更强的表达力为何应转化为更好的 Scaling 行为. 具体而言, 近期工作把神经 Scaling Laws 解释为语言建模数据中大量离散任务逐步累积的结果. 在这一框架内, 我们表明提升表达力能改善 Scaling 趋势 (Corollaries 4.1 and 4.2), 因为它增加了模型在固定参数与 token 预算下能学会的离散任务数. 汇总起来, 这意味着表达力更强的模型在相同预算下能达到更低 loss, 如 Figure 11 所示.

**Quantization Model** (Michaud et al., 2023). It is well established that language modeling loss decreases smoothly with model size and token budget despite the fact that many properties of language are discrete (Kaplan et al., 2020; Hoffmann et al., 2022). One explanation is that language modeling is fundamentally a multi-task problem: LMs acquire individual tasks discretely, leading to a smooth reduction of aggregate loss

**Quantization Model** (Michaud et al., 2023). 众所周知, 尽管语言的许多性质是离散的, 语言建模 loss 仍随模型规模与 token 预算平滑下降 (Kaplan et al., 2020; Hoffmann et al., 2022). 一种解释是, 语言建模在根本上是多任务问题: LM 以离散方式习得各个任务, 从而使总 loss 平滑下降

<!-- page 19 of 70 -->

(Hutter, 2021; Arora and Goyal, 2023; Nam et al., 2024, inter alia). In particular, this intuition has recently been formalized in the quantization model of neural scaling laws (Michaud et al., 2023), a minimal framework for deriving LM scaling laws. We encapsulate the quantization model via the following basic assumptions:

(Hutter, 2021; Arora and Goyal, 2023; Nam et al., 2024, inter alia). 这一直觉最近在神经 Scaling Laws 的 quantization model (Michaud et al., 2023) 中得到形式化, 它是推导 LM Scaling Laws 的一个最小框架. 我们用以下基本假设来概括 quantization model:

1. Language modeling consists of a large number of discrete tasks (originally called "quanta"), each of which is either unlearned or learned.

1. 语言建模由大量离散任务 (原文称为 「quanta」) 组成, 每个任务要么未学会, 要么已学会.

2. The distribution of tasks in the data follows a power law, resembling the Zipfian distribution of word types in natural language. Each token leverages exactly one task, and the probability of a token (in the training or test data) leveraging task k is $\widetilde { p _ { k } \propto k ^ { - ( \alpha + 1 ) } }$ for $\alpha > 0$

2. 任务在数据中的分布服从幂律, 类似自然语言中词型的 Zipf 分布. 每个 token 恰好用到一个任务, (训练或测试数据中) 一个 token 用到任务 k 的概率为 $\widetilde { p _ { k } \propto k ^ { - ( \alpha + 1 ) } }$, 其中 $\alpha > 0$.

3. During training, task k becomes learnable once a critical threshold $T _ { k }$ of relevant tokens leveraging the task have been observed. An LM learner acquires learnable tasks incrementally, spending parameters $C _ { k }$ on each one, in order of their rank k (formalized in Definition 4 in Section E). Once an LM learns a task, it predicts tokens leveraging that task with lower loss than before.

3. 训练中, 一旦观察到的用到任务 k 的相关 token 数达到临界阈值 $T _ { k }$, 任务 k 就变得可学. LM 学习者按排名 k 的顺序逐个习得可学任务, 每个任务花费 $C _ { k }$ 个参数 (形式化见 Section E 的 Definition 4). LM 学会一个任务后, 预测用到该任务的 token 时 loss 低于之前.

Under these assumptions, the loss $\tilde { L }$ depends on the number of tasks learned, which is controlled by the budget for parameters $N$ or training tokens D. Michaud et al. (2023) show that loss will follow a smooth power law as a function of tasks, parameters, or tokens, resulting from learning many discrete tasks one by one, with each successive task having smoothly decaying probability in the data.

在这些假设下, loss $\tilde { L }$ 取决于已学会的任务数, 而任务数由参数预算 $N$ 或训练 token 预算 D 控制. Michaud et al. (2023) 表明, 由于逐个学会大量离散任务, 且后续每个任务在数据中的概率平滑衰减, loss 会随任务数, 参数量或 token 数服从平滑幂律.

**Incorporating Expressivity.** We now adapt the quantization model to study how the expressive power of an LM impacts scaling efficiency. Section 3 analyzed which computational tasks can be expressed by hybrid models and transformers; now we consider the multi-task setting, where achieving low loss requires learning many individual tasks. We first stipulate that each of these tasks is expressible or inexpressible by our LM, independent of its frequency in the data:

**纳入表达力.** 我们现在改造 quantization model, 研究 LM 的表达力如何影响 Scaling 效率. Section 3 分析了 hybrid 模型与 transformer 能表达哪些计算任务; 现在考虑多任务设置, 其中要达到低 loss 需要学会许多单个任务. 我们首先规定, 这些任务中的每一个对我们的 LM 而言要么可表达, 要么不可表达, 且与其在数据中的频率无关:

**Assumption 1: Only Some Tasks Are Expressible 假设 1: 只有部分任务可表达**

For a given architecture, each task is either expressible or inexpressible, modeled as an iid boolean random variable where the probability that any individual task is expressible is $1 - \epsilon .$

对给定架构, 每个任务要么可表达要么不可表达, 建模为 iid 布尔随机变量, 任一任务可表达的概率为 $1 - \epsilon .$

Increasing expressive power (e.g., going from a transformer to a hybrid model) corresponds to decreasing ϵ. We will analyze the expected loss under Assumption 1. Conceptually, increasing a model's expressivity $( 1 - \epsilon )$ could improve scaling efficiency because it increases the proportion of tasks that a model can learn efficiently, which is the mechanism by which loss decreases. There are two plausible mechanisms: first, the model might fail to learn inexpressible tasks entirely, or, second, the model might approximate them but require more parameters and data because the architecture does not admit a compact subnetwork for solving the task. We formalize a unified expressivity-aware extension to the quantization model that allows for either (or both) of these effects of expressivity. First, we formalize the fact that the loss achieved on a task after it has been learned may depend on whether the task is expressible:

提升表达力 (例如从 transformer 换到 hybrid 模型) 对应于减小 ϵ. 我们将分析 Assumption 1 下的期望 loss. 概念上, 提升模型表达力 $( 1 - \epsilon )$ 能改善 Scaling 效率, 因为它提高了模型能高效学会的任务比例, 而这正是 loss 下降的机制. 有两种合理机制: 一是模型可能完全学不会不可表达的任务; 二是模型可能近似它们, 但因架构不存在求解该任务的紧凑子网络而需要更多参数与数据. 我们给 quantization model 形式化一个统一的表达力感知扩展, 允许这两种效应中的任一种 (或两者同时) 存在. 首先, 我们形式化这样一个事实: 任务学会之后达到的 loss 可能取决于该任务是否可表达:

**Assumption 2: Expressible Tasks Can Be Learned to Lower Loss 假设 2: 可表达任务能学到更低 loss**

Tokens leveraging unlearned tasks incur loss $L _ { 0 }$ If a task k has been learned, the loss incurred by the learner on a token leveraging k is reduced to $L _ { 0 } - \Delta$ if k is expressible by that learner and to $L _ { 0 } - \Delta ^ { \prime }$ if k is inexpressible, for some $\Delta , \Delta ^ { \prime } > 0$ and $\Delta ^ { \prime } \leq \Delta$

用到未学会任务的 token 产生 loss $L _ { 0 }$. 若任务 k 已学会, 学习者在用到 k 的 token 上的 loss: 若 k 对该学习者可表达, 降为 $L _ { 0 } - \Delta$; 若不可表达, 降为 $L _ { 0 } - \Delta ^ { \prime }$, 其中 $\Delta , \Delta ^ { \prime } > 0$ 且 $\Delta ^ { \prime } \leq \Delta$.

We will refer to $\Delta$ and $\Delta ^ { \prime }$ as loss reductions for expressible and inexpressible tasks, respectively. When $\Delta ^ { \prime } = 0$ inexpressible tasks cannot be learned at all (as briefly explored by Michaud, 2026), and when $\Delta ^ { \prime } = \Delta$ , they can be fully learned, though they might require more resources (parameters and data) to learn.

我们把 $\Delta$ 与 $\Delta ^ { \prime }$ 分别称为可表达任务与不可表达任务的 loss 降幅. 当 $\Delta ^ { \prime } = 0$ 时, 不可表达任务完全学不会 (Michaud, 2026 对此有简要探讨); 当 $\Delta ^ { \prime } = \Delta$ 时, 它们能被完全学会, 只是可能需要更多资源 (参数与数据).

We now formalize the resource requirements of different tasks. In the original quantization model (Michaud et al., 2023), all tasks require the same number of parameters $C$ to represent and have the same sample complexity $T .$ In contrast, we now imagine that the number of parameters and tokens needed per task can change based on whether the task is expressible:

我们现在形式化不同任务的资源需求. 在原始 quantization model (Michaud et al., 2023) 中, 所有任务都需要相同的参数量 $C$ 来表示, 并有相同的样本复杂度 $T .$ 与之不同, 我们现在设想每个任务所需的参数与 token 数可以随该任务是否可表达而变化:

<!-- page 20 of 70 -->

**Assumption 3: Expressible Tasks Can Be Learned with Fewer Parameters and Tokens** Each expressible task is representable with $C$ parameters and learnable with T relevant tokens. An inexpressible task requires $C ^ { \prime } \geq C$ parameters to represent approximately and is learnable with $T ^ { \prime } \geq T$ relevant tokens.

**假设 3: 可表达任务能用更少参数与 token 学会** 每个可表达任务可用 $C$ 个参数表示, 用 T 个相关 token 学会. 不可表达任务需要 $C ^ { \prime } \geq C$ 个参数来近似表示, 需要 $T ^ { \prime } \geq T$ 个相关 token 才能学会.

Assumption 3 can be motivated as follows. If a task is fully expressible, a small subnetwork exists that solves the task across all inputs, requiring a reasonable number of samples to learn. If the task is inexpressible, no such small subnetwork exists, but the model can still learn a large lookup table that approximates the function over common inputs, requiring more samples to cover every case. This connection between expressiveness and succinctness of representation recalls philosophical arguments in theoretical computer science for analyzing computation in terms of infinite formal languages (Savitch, 1993). It is natural to imagine that expressibility leads to an exponential reduction in required resources $( \mathrm { i . e . , } ~ C ^ { \prime } = 2 ^ { C } )$ , though we do not need to commit to this. The case where $C ^ { \prime } = C$ recovers the case where inexpressible tasks do not require more parameters.

Assumption 3 的动机如下. 若任务完全可表达, 就存在一个在所有输入上都能求解该任务的小子网络, 用合理数量的样本即可学会. 若任务不可表达, 就不存在这样的小子网络, 但模型仍可学一张大查找表, 在常见输入上近似该函数, 这需要更多样本来覆盖每种情况. 表达力与表示简洁性之间的这种联系, 让人想起理论计算机科学中以无限形式语言来分析计算的哲学论证 (Savitch, 1993). 很自然会设想可表达性带来所需资源的指数级减少 $( \mathrm { i . e . , } ~ C ^ { \prime } = 2 ^ { C } )$, 不过我们不必做此承诺. $C ^ { \prime } = C$ 的情形, 对应不可表达任务并不需要更多参数.

Having extended the quantization model to be expressivity-aware, we now characterize how expressivity affects scaling laws under these assumptions. The following general result establishes that increasing expressiveness leads to more parameter- and data-efficient scaling in the quantization model, and can also improve the irreducible loss achievable with infinite parameters and data.

把 quantization model 扩展为表达力感知之后, 我们现在刻画在这些假设下表达力如何影响 Scaling Laws. 下面的一般结果表明, 在 quantization model 中, 提升表达力带来参数效率与数据效率更高的 Scaling, 还能改善无限参数与数据下可达到的不可约 loss.

Let $\tilde { L } ( N )$ and $\tilde { L } ( D )$ denote the actual loss incurred under the quantization model as a function of the number of parameters N and the token budget D.

记 $\tilde { L } ( N )$ 与 $\tilde { L } ( D )$ 为 quantization model 下, 实际 loss 分别作为参数量 N 与 token 预算 D 的函数.

<div class="docvortex-algorithm" style="white-space: pre-wrap; font-family:monospace;">
Theorem 4: Expressivity-Aware Scaling Laws
Consider the quantization model of neural scaling laws augmented by Assumptions 1 to 3. Then, as a function of the number of parameters N, the loss $\tilde{L}(N)$ is closely approximated by a power law $L(N)$, i.e., $\tilde{L}(N) \approx L(N)$ where:
$L(N) - L_{\infty}^{\epsilon} \propto A_{\epsilon} \cdot N^{-\alpha}, \quad \text{where } A_{\epsilon} = (L_0 - L_{\infty}^{\epsilon}) \cdot (C + \epsilon(C' - C))^{\alpha}.$
Similarly, as a function of the token budget D, the loss $\tilde{L}(D)$ is closely approximated by a power law $L(D)$, i.e., $\tilde{L}(D) \approx L(D)$ where
$L(D) - L_{\infty}^{\epsilon} \propto B_{\epsilon} \cdot D^{-\alpha/(\alpha+1)}, \quad \text{where } B_{\epsilon} = (1 - \epsilon)\Delta T^{\alpha/(\alpha+1)} + \epsilon\Delta' T'^{\alpha/(\alpha+1)}.$
Finally, the irreducible loss $L_{\infty}^{\epsilon}$ for both power laws depends on expressivity via
$L_{\infty}^{\epsilon} = L_0 - (1 - \epsilon)\Delta - \epsilon\Delta'.$
</div>

**定理 4: 表达力感知的 Scaling Laws** 考虑用 Assumptions 1 to 3 增强的神经 Scaling Laws quantization model. 则作为参数量 N 的函数, loss $\tilde{L}(N)$ 可由幂律 $L(N)$ 很好地近似, 即 $\tilde{L}(N) \approx L(N)$, 其中 $L(N) - L_{\infty}^{\epsilon} \propto A_{\epsilon} \cdot N^{-\alpha}$, $A_{\epsilon} = (L_0 - L_{\infty}^{\epsilon}) \cdot (C + \epsilon(C' - C))^{\alpha}$. 类似地, 作为 token 预算 D 的函数, loss $\tilde{L}(D)$ 可由幂律 $L(D)$ 很好地近似, 即 $\tilde{L}(D) \approx L(D)$, 其中 $L(D) - L_{\infty}^{\epsilon} \propto B_{\epsilon} \cdot D^{-\alpha/(\alpha+1)}$, $B_{\epsilon} = (1 - \epsilon)\Delta T^{\alpha/(\alpha+1)} + \epsilon\Delta' T'^{\alpha/(\alpha+1)}$. 最后, 两条幂律的不可约 loss $L_{\infty}^{\epsilon}$ 通过 $L_{\infty}^{\epsilon} = L_0 - (1 - \epsilon)\Delta - \epsilon\Delta'$ 依赖于表达力.

See Section E for a proof. Theorem 4 can be interpreted as follows. If we can express all tasks $( \epsilon = 0 )$ , we recover the standard irreducible loss $L _ { \infty } ^ { 0 } = L _ { 0 } - \Delta$ and scaling coefficients $A _ { 0 } = \Delta C ^ { \alpha }$ and $B _ { 0 } = \dot { \Delta } T ^ { \alpha / ( \alpha + 1 ) }$ from the quantization model (Michaud et al., 2023). On the other hand, if there are some tasks we cannot express $( \epsilon   >   0 )$ , the scaling coefficients $A _ { \epsilon }$ and $B _ { \epsilon }$ (and potentially irreducible loss $L _ { \infty } ^ { \epsilon } )$ will change. In particular, as illustrated in Figure 11, decreasing ϵ improves loss towards the $\epsilon = 0$ case. Formally, under any non-trivial instantiation of Assumptions 1 to 3, increasing expressivity shifts the loss curve down:

证明见 Section E. Theorem 4 可以这样理解. 若所有任务都可表达 $( \epsilon = 0 )$, 就回到 quantization model (Michaud et al., 2023) 的标准不可约 loss $L _ { \infty } ^ { 0 } = L _ { 0 } - \Delta$ 与 Scaling 系数 $A _ { 0 } = \Delta C ^ { \alpha }$, $B _ { 0 } = \dot { \Delta } T ^ { \alpha / ( \alpha + 1 ) }$. 另一方面, 若有部分任务不可表达 $( \epsilon   >   0 )$, Scaling 系数 $A _ { \epsilon }$ 与 $B _ { \epsilon }$ (以及可能的不可约 loss $L _ { \infty } ^ { \epsilon } )$ 都会改变. 具体而言, 如 Figure 11 所示, 减小 ϵ 会让 loss 向 $\epsilon = 0$ 的情形改善. 形式上, 在 Assumptions 1 to 3 的任何非平凡实例化下, 提升表达力都会让 loss 曲线下移:

> **对一下:** Theorem 4 里数据幂律的指数是 $\alpha/(\alpha+1)$, 而 ε 只出现在 $A_\epsilon$, $B_\epsilon$, $L_\infty^\epsilon$ 中; 这和 Figure 8 各架构 β 差不多 (0.213 / 0.219 / 0.227) 能对上吗?
> 能对上. Theorem 4 里的指数只来自 quantization model 的任务频率幂律 $p_k \propto k^{-(\alpha+1)}$, 与架构的 ε 无关, 所以表达力只改系数, 不改指数. 这正是 §4.1 先用无约束拟合看到指数统计上不可区分, 再固定 α=β=0.22 去比 B 的理由. 注意这里的 α 是任务分布的 Zipf 指数, 与 Eq. (1) 里参数项的 α 不是同一个量.

**Corollary 4.1: Expressivity Always Improves Scaling 推论 4.1: 表达力总能改善 Scaling**

Fix a nontrivial instantiation of Assumptions 1 to $\mathcal { B } ,$ i.e., where either $\Delta ^ { \prime } < \Delta _ { i }$ or $C ^ { \prime } > C$ and $T ^ { \prime } > T .$ $T h e n ,$ both $L ( N )$ and $L ( D )$ strictly decrease as ϵ decreases, elementwise for all $N , D .$

固定 Assumptions 1 to $\mathcal { B } ,$ 的一个非平凡实例化, 即 $\Delta ^ { \prime } < \Delta _ { i }$, 或 $C ^ { \prime } > C$ 且 $T ^ { \prime } > T .$ 则对所有 $N , D .$, $L ( N )$ 与 $L ( D )$ 都随 ϵ 减小而严格下降 (逐点成立).

See justification in Section E.4. Corollary 4.1 predicts that increased expressive power will translate into more efficient model scaling. Conceptually, we can understand two separate beneficial effects, coming from Assumptions 2 and 3, respectively. First, if we instantiate Assumption 2 such that inexpressible tasks achieve a strictly lower loss reduction $( \Delta ^ { \prime } < \Delta )$ , the irreducible loss $L _ { \infty } ^ { \epsilon }$ part of the scaling laws is affected:

论证见 Section E.4. Corollary 4.1 预测表达力提升会转化为更高效的模型 Scaling. 概念上, 可以理解为两种分别来自 Assumptions 2 与 3 的有益效应. 第一, 若把 Assumption 2 实例化为不可表达任务的 loss 降幅严格更低 $( \Delta ^ { \prime } < \Delta )$, Scaling Laws 中的不可约 loss $L _ { \infty } ^ { \epsilon }$ 部分会受影响:

<!-- page 21 of 70 -->

Impact of Expressivity $( 1 - \varepsilon )$ on Quantization Model Loss

表达力 $( 1 - \varepsilon )$ 对 Quantization Model loss 的影响

![Chart block](images/p21-chart.png)

![Chart block](images/p21-chart-2.png)

![Chart block](images/p21-chart-3.png)

![Chart block](images/p21-chart-4.png)

![Chart block](images/p21-parameters-n.png)

Parameters (N)

![Chart block](images/p21-tokens-d.png)

Tokens (D)

Figure 11 Impact of expressivity $1 - \epsilon$ on loss under three instantiations of the expressivity-aware quantization model; both axes are log-scaled. In the first row, $\Delta ^ { \prime } < \Delta$ , so decreasing ϵ lowers irreducible loss $\left(  Corollary 4.2 \right)$ and reduces loss everywhere (Corollary 4.1), but especially for large N and D. In the second row, $\Delta ^ { \prime } = \Delta$ , but inexpressible tasks require more parameters and tokens than expressible tasks. Thus, while increasing expressivity shifts down the scaling curve everywhere, irreducible loss remains the same, so for large enough $N , D ,$ the loss reduction diminishes. Finally, the third row incorporates both effects of expressivity. This means decreasing ϵ both causes an initial difference in loss and lowers irreducible loss, leading to a visible gap in loss as ϵ decreases across values of N and D.

图 11 表达力感知 quantization model 三种实例化下, 表达力 $1 - \epsilon$ 对 loss 的影响; 两轴均为对数刻度. 第一行中 $\Delta ^ { \prime } < \Delta$, 因此减小 ϵ 会降低不可约 loss $\left(  Corollary 4.2 \right)$, 并在各处降低 loss (Corollary 4.1), 在 N 与 D 较大时尤其明显. 第二行中 $\Delta ^ { \prime } = \Delta$, 但不可表达任务比可表达任务需要更多参数与 token. 因此提升表达力虽然让 Scaling 曲线处处下移, 不可约 loss 却不变, 所以 $N , D ,$ 足够大时 loss 降幅逐渐消失. 最后, 第三行同时包含表达力的两种效应. 这意味着减小 ϵ 既带来初始的 loss 差异, 又降低不可约 loss, 使得随 ϵ 减小, 在各个 N 与 D 取值上都能看到明显的 loss 差距.

**Corollary 4.2: Expressivity Can Shift Irreducible Loss 推论 4.2: 表达力可以移动不可约 loss**

If and only if $\Delta ^ { \prime } < \Delta$ irreducible loss $L _ { \infty } ^ { \epsilon }$ strictly decreases as ϵ decreases.

当且仅当 $\Delta ^ { \prime } < \Delta$ 时, 不可约 loss $L _ { \infty } ^ { \epsilon }$ 随 ϵ 减小而严格下降.

As visualized in the top row of Figure 11, this leads to a clear difference in loss for large N and D (when the irreducible loss starts to dominate), even though the loss curves start more similarly for small N and D. In contrast, if Assumptions 2 and 3 are instantiated so that inexpressible tasks can be fully learned $( \Delta ^ { \prime } = \Delta )$ but require more parameters and tokens $( C ^ { \prime } > C ,   T ^ { \prime } > T )$ , the picture is different: we see dramatic differences in loss for small values of N and D based on ϵ, but these differences go to 0 in the limit of large N and D, as illustrated in the middle row of Figure 11. Finally, if we combine both assumptions, i.e., inexpressible tasks achieve a lower loss reduction $( \Delta ^ { \prime } < \Delta )$ and also require more parameters and tokens to learn, we see a gap between the loss curves for all values of N and D, as seen in the bottom row of Figure 11.

如 Figure 11 第一行所示, 这会在 N 与 D 较大时 (不可约 loss 开始占主导) 造成明显的 loss 差异, 尽管在 N 与 D 较小时各条曲线起点更接近. 相反, 若把 Assumptions 2 与 3 实例化为不可表达任务能被完全学会 $( \Delta ^ { \prime } = \Delta )$, 但需要更多参数与 token $( C ^ { \prime } > C ,   T ^ { \prime } > T )$, 图景就不同了: 在 N 与 D 较小时, 不同 ϵ 下 loss 差异很大, 但在 N 与 D 很大的极限下这些差异趋于 0, 如 Figure 11 中间一行所示. 最后, 若把两个假设结合起来, 即不可表达任务的 loss 降幅更低 $( \Delta ^ { \prime } < \Delta )$, 学习时还需要更多参数与 token, 那么在所有 N 与 D 取值上各条 loss 曲线之间都有差距, 如 Figure 11 最下一行所示.

A natural question is which instantiation of Assumptions 1 to 3 is most consistent with the empirical scaling laws from Section 4.1. Based on Corollary 4.2, lower irreducible loss for more expressive architectures supports a model where expressible tasks have greater loss reduction, i.e., $\Delta ^ { \prime } < \Delta$ Because we do not find clear empirical evidence in Section 4.1 that architecture affects irreducible loss, it appears that a quantization model with $\Delta ^ { \prime } = \Delta$ may better fit the data, though more precise estimates of the scaling law parameters could change this conclusion. Further, based on Corollary 4.1, a model where expressivity does not improve parameter efficiency requires $C ^ { \prime } = C$ and $\Delta ^ { \prime } = \Delta$ . Thus, a quantization model with $T ^ { \prime } > T$ but $C ^ { \prime } = C$ and $\Delta ^ { \prime } = \Delta$ appears most consistent with the observed scaling behavior of hybrid models vs. transformers, though future work that more precisely estimates the scaling coefficients (in particular, the irreducible loss) for these

一个自然的问题是: Assumptions 1 to 3 的哪种实例化与 Section 4.1 的实证 Scaling Laws 最吻合. 由 Corollary 4.2, 若表达力更强的架构不可约 loss 更低, 就支持可表达任务 loss 降幅更大的模型, 即 $\Delta ^ { \prime } < \Delta$. 由于 Section 4.1 中没有找到架构影响不可约 loss 的明确实证证据, 看来 $\Delta ^ { \prime } = \Delta$ 的 quantization model 可能更贴合数据, 不过对 Scaling Laws 参数更精确的估计可能改变这一结论. 此外, 由 Corollary 4.1, 表达力不提升参数效率的模型要求 $C ^ { \prime } = C$ 且 $\Delta ^ { \prime } = \Delta$. 因此, $T ^ { \prime } > T$ 而 $C ^ { \prime } = C$, $\Delta ^ { \prime } = \Delta$ 的 quantization model, 看来与观察到的 hybrid 模型相对 transformer 的 Scaling 行为最一致; 不过, 今后若有工作更精确地估计这些

<!-- page 22 of 70 -->

architectures could change these conclusions.

架构的 Scaling 系数 (尤其是不可约 loss), 这些结论也可能改变.

### 4.3 Discussion: From Expressivity to Scaling 讨论: 从表达力到 Scaling

Through controlled scaling studies across model sizes and data budgets, we showed our hybrid architecture can attain better data and parameter efficiency compared to the transformer baseline. This matches the improved pretraining efficiency (both in terms of tokens and compute spent) on Common Crawl, MMLU, and other evaluations that we observed for the Olmo Hybrid pretraining run compared to Olmo 3. In Section 4.2, we argued that the pretraining efficiency of hybrid models could be explained by their greater expressivity relative to transformers, as standard explanations of scaling laws can be minimally extended to predict that more expressive models should have better loss curves.

通过跨模型规模与数据预算的受控 Scaling 研究, 我们表明 hybrid 架构相对 transformer 基线能达到更好的数据效率与参数效率. 这与 Olmo Hybrid 预训练相对 Olmo 3 在 Common Crawl, MMLU 及其他评测上观察到的预训练效率提升 (无论按 token 还是按算力计) 相吻合. 在 Section 4.2 中我们论证, hybrid 模型的预训练效率可以用它相对 transformer 更强的表达力来解释, 因为对 Scaling Laws 的标准解释只需做最小扩展, 就能预测表达力更强的模型应有更好的 loss 曲线.

In particular, Theorem 4 provides a conceptual explanation for why more expressive architectures might scale better. In line with our empirical findings (Section 4.1), greater expressivity improves loss across the scaling curve under our formal model but does not affect the scaling law exponent, which depend only on α, which parameterizes the task power law underlying the data distribution. Nevertheless, expressivity reduces loss across the loss curve, in line with the comparison of hybrid models and transformers in Section 4.1. As mentioned earlier, some instantiations of the quantization model (cf. Assumptions 2 and 3) also predict improved irreducible loss and parameter efficiency for more expressive models, which we do not find clear evidence for in Section 4.1.

具体而言, Theorem 4 为表达力更强的架构为何 Scaling 更好提供了概念性解释. 与实证发现 (Section 4.1) 一致, 在我们的形式模型下, 更强的表达力在整条 Scaling 曲线上改善 loss, 但不影响 Scaling Laws 的指数; 指数只取决于 α, 即刻画数据分布背后任务幂律的参数. 尽管如此, 表达力在整条 loss 曲线上都降低 loss, 与 Section 4.1 中 hybrid 模型和 transformer 的对比一致. 如前所述, quantization model 的某些实例化 (参见 Assumptions 2 and 3) 还预测表达力更强的模型不可约 loss 与参数效率会改善, 这一点我们在 Section 4.1 中没有找到明确证据.

Interestingly, and perhaps counterintuitively, even tasks that were already expressible by an architecture can be learned faster when expressivity is increased. Under Assumption 3, learning inexpressible tasks more efficiently frees up parameters than can be allocated to learning (potentially already expressible) tasks faster. This mirrors results reported by Hu et al. (2025), where allowing transformers to learn syntax more efficiently seemed to enable more efficient learning of other aspects of language.

有意思且或许反直觉的是, 提升表达力后, 即使是架构原本就能表达的任务也能学得更快. 在 Assumption 3 下, 更高效地学会不可表达任务会腾出参数, 这些参数可以分配去更快地学习 (可能原本就可表达的) 任务. 这与 Hu et al. (2025) 报告的结果相呼应: 让 transformer 更高效地学习句法, 似乎能让语言其他方面的学习也更高效.

We emphasize that our theoretical results were obtained in the simplified quantization model of scaling laws (Michaud et al., 2023), rather than by analyzing the actual learning dynamics of LMs. While this setting is somewhat simplistic, it nicely captures fundamental properties of language modeling such as its multi-task data distribution. We thus take it to provide a plausible conceptual explanation for the link between expressivity and scaling improvements, though we caution against reading too much into the precise quantitative predictions such as the scaling law coefficients and exponents (cf. Michaud, 2026). There is ample opportunity for more in-depth theoretical work to expand the analysis presented here to more realistic models of training, as well as empirical work that tests predictions of different theory variants.

我们强调, 这些理论结果是在简化的 Scaling Laws quantization model (Michaud et al., 2023) 中得到的, 而不是通过分析 LM 的实际学习动态. 这一设定虽然有些简化, 却很好地抓住了语言建模的基本性质, 例如多任务的数据分布. 因此我们认为它为表达力与 Scaling 改善之间的联系提供了一个合理的概念性解释, 但提醒不要过度解读其精确的定量预测, 例如 Scaling Laws 的系数与指数 (参见 Michaud, 2026). 后续有充分空间做更深入的理论工作, 把这里的分析扩展到更贴近实际的训练模型, 也可以做实证工作来检验不同理论变体的预测.

While expressivity is one clear advantage of GDN-based hybrid models, other factors may also contribute to the performance gains, such as increased training stability, which we explore in Section A.1. In Section 5.1, we see that GDN hybrid models shows better scaling trends than hybrid models using Mamba, whose expressivity is constrained to $\top C ^ { 0 }$ , in line with the hypothesized link between expressivity and scaling. However, GDN without the negative eigenvalue extension (which is thought to be less expressive; cf. Section 3.2) shows very similar scaling trends to GDN with negative values, in potential disagreement with theory. This could suggest that some other benefit of GDN beyond expressivity explains its improved scaling relative to transformers, though it is also an open question whether GDN, even without negative eigenvalues, could have expressivity advantages over transformers such as the ability to solve some $\mathbb { N } \mathbb { C } ^ { \overbrace { 1 } } .$ -complete problems.

表达力是基于 GDN 的 hybrid 模型的一项明确优势, 但其他因素也可能促成性能提升, 例如训练稳定性提高, 我们在 Section A.1 中探讨. 在 Section 5.1 中我们看到, GDN hybrid 模型的 Scaling 趋势优于使用 Mamba 的 hybrid 模型, 而 Mamba 的表达力被限制在 $\top C ^ { 0 }$, 这与所假设的表达力-Scaling 联系一致. 然而, 不带负特征值扩展的 GDN (被认为表达力更弱; 参见 Section 3.2) 与带负特征值的 GDN Scaling 趋势非常接近, 这可能与理论不符. 这或许说明, GDN 相对 transformer 的 Scaling 改善还来自表达力之外的其他好处; 不过, 即便没有负特征值, GDN 是否仍对 transformer 有表达力优势, 例如能求解某些 $\mathbb { N } \mathbb { C } ^ { \overbrace { 1 } } .$-complete 问题, 也是开放问题.

## 5 Other Research Questions 其他研究问题

### 5.1 RNN and Hybridization Architecture Choices RNN 与 hybrid 方式的架构选择

To decide on the final hybrid architecture for Olmo Hybrid, we ran a series of ablation experiments evaluating the performance of different sequence mixers and hybridization strategies. In particular, we were interested in three key design questions:

为确定 Olmo Hybrid 的最终 hybrid 架构, 我们做了一系列消融实验, 评测不同序列混合器与 hybrid 策略的表现. 具体来说, 我们关心三个关键设计问题:

1. **RNN Architecture:** Which popular linear RNN architecture (GDN vs. Mamba2) results in the best hybrid model?

1. **RNN 架构:** 哪种流行的线性 RNN 架构 (GDN 对 Mamba2) 能得到最好的 hybrid 模型?

2. **Layer Placement:** How should hybridization be performed—should attention layers be interleaved

2. **层的位置:** 应当如何做 hybrid: 注意力层是

<!-- page 23 of 70 -->

![Image block](images/p23-figure-12-architecture-configurations-evaluated-in-our.png)

Figure 12 Architecture configurations evaluated in our ablation study. We compare pure architectures (Transformer, GDN, Mamba2) against hybrid variants with different linear-to-attention ratios (1:1, 3:1, 7:1), RNN backbones (GDN vs. Mamba2 at 3:1), and placement strategies (interleaved vs. middle). The highlighted configuration (3:1 interleaved with GDN) was selected for the final Olmo Hybrid.

图 12 消融研究中评测的架构配置. 我们把纯架构 (Transformer, GDN, Mamba2) 与多种 hybrid 变体对比: 不同的线性层与注意力层比例 (1:1, 3:1, 7:1), 不同 RNN 骨干 (3:1 下 GDN 对 Mamba2), 以及不同放置策略 (交错对居中). 高亮配置 (GDN, 3:1 交错) 被选为最终 Olmo Hybrid.

uniformly throughout the model, or concentrated in specific regions?<sup>3</sup>

在整个模型中均匀交错, 还是集中在特定区域?<sup>3</sup>

3. **Attention Ratio:** What is the optimal ratio of attention-to-RNN layers?

3. **注意力比例:** 注意力层与 RNN 层的最优比例是多少?

To inform the final model choice and provide guidelines for future work on hybrid models, we evaluated a comprehensive suite of pure and hybrid architectures at multiple scales, illustrated in Figure 12.

为支撑最终模型选择, 并为今后的 hybrid 模型工作提供指引, 我们在多个规模上评测了一整套纯架构与 hybrid 架构, 见 Figure 12.

**Experimental Setup.** All ablation experiments follow the same setup as Section 4.1 and use identical training data, optimizer settings, and evaluation protocols, varying only the architecture. We train models at the same seven scales: 60M, 100M, 190M, 370M, 600M, 760M, and 1B parameters, and each model is trained on 8× Chinchilla-optimal tokens using a WSD-S learning rate schedule. Table 22 lists the detailed configurations for each model size. All hybrid models were implemented with the Flash Linear Attention library based on the Olmo 3 configuration—the only difference is the implementation of the sequence mixing component.<sup>4</sup>

**实验设置.** 所有消融实验沿用 Section 4.1 的设置, 使用相同的训练数据, 优化器设置与评测协议, 只改变架构. 我们在同样的七个规模上训练: 60M, 100M, 190M, 370M, 600M, 760M 与 1B 参数, 每个模型用 WSD-S 学习率调度在 8× Chinchilla 最优 token 数上训练. Table 22 列出各模型规模的详细配置. 所有 hybrid 模型都基于 Olmo 3 配置, 用 Flash Linear Attention 库实现, 唯一差别是序列混合组件的实现.<sup>4</sup>

As in Section 4.1, we measure performance as the average validation loss, computed as the average cross-entropy across 11 held-out evaluation domains: C4, Dolma Books, Dolma Common Crawl, Dolma pes2o, Dolma Reddit, Dolma Stack, Dolma Wiki, ICE, M2D2 S2ORC, Pile, and WikiText-103. Additionally, we evaluate the models on the OlmoBaseEval Easy suite in bits per byte (BPB), reporting the average score across Math, Code, and general reasoning tasks. We again compute scaling law coefficients; in Figure 16, the curves represent the projected loss at each FLOP value at the optimal parameter and token counts, computed by fitting scaling laws analogously to Section 4.1. See also Section D.2 for more details.

与 Section 4.1 一样, 我们用平均验证 loss 衡量表现, 即 11 个留出评测领域上的平均交叉熵: C4, Dolma Books, Dolma Common Crawl, Dolma pes2o, Dolma Reddit, Dolma Stack, Dolma Wiki, ICE, M2D2 S2ORC, Pile 与 WikiText-103. 此外, 我们在 OlmoBaseEval Easy 套件上以 bits per byte (BPB) 评测模型, 报告 Math, Code 与通用推理任务的平均分. 我们再次计算 Scaling Laws 系数; Figure 16 中的曲线表示在最优参数量与 token 数下各 FLOP 值对应的预计 loss, 按与 Section 4.1 类似的方式拟合 Scaling Laws 得到. 更多细节见 Section D.2.

Figure 16 visually shows the performance of the tested architectures and Table 5 presents the average performance on the OlmoBaseEval Easy suite. The rest of the section interprets these results to justify the final Olmo Hybrid architecture.

Figure 16 直观展示所测架构的表现, Table 5 给出 OlmoBaseEval Easy 套件上的平均表现. 本节其余部分解读这些结果, 论证最终 Olmo Hybrid 架构的选择.

**RNN Architecture: GDN vs. Mamba2.** We compare the two linear RNN architectures in both pure and hybrid (3:1 interleaved) settings against the transformer baseline. Pure Mamba2 performed worse than both the transformer and GDN at most scales—particularly larger ones—with average BPB of 0.72 for Mamba2 at the 1B scale compared to 0.68 for the transformer (Table 5). The hybrid Mamba2 configuration (Mamba2 + 3:1 Attn) improved over pure Mamba2 and outperformed the transformer at most scales, but fell behind at 1B (0.698 vs. 0.682). In contrast, pure GDN outperformed the transformer at all scales (e.g., 0.722 vs.

**RNN 架构: GDN 对 Mamba2.** 我们在纯架构与 hybrid (3:1 交错) 两种设置下, 把两种线性 RNN 架构与 transformer 基线对比. 纯 Mamba2 在多数规模上 (尤其是较大规模) 比 transformer 与 GDN 都差: 1B 规模下 Mamba2 的平均 BPB 为 0.72, transformer 为 0.68 (Table 5). Hybrid Mamba2 配置 (Mamba2 + 3:1 Attn) 比纯 Mamba2 有改进, 在多数规模上超过 transformer, 但在 1B 时落后 (0.698 对 0.682). 相比之下, 纯 GDN 在所有规模上都超过 transformer (例如 760M 时 0.722 对

<small><span class="docvortex-page-footnote" data-block-type="page_footnote" style="color:#6b7280"><sup>3</sup>We only consider inter-layer hybridization and did not test intra-layer hybridization strategies such as those explored in Ren et al. (2025).</span></small>

<small><sup>3</sup>我们只考虑层间 hybrid, 没有测试 Ren et al. (2025) 探索的那类层内 hybrid 策略.</small>

<small><span class="docvortex-page-footnote" data-block-type="page_footnote" style="color:#6b7280"><sup>4</sup>Thus, the position-wise MLPs were identical between the architectures. This aligns well with the GDN architecture but is slightly non-standard for Mamba2, which, as a Gated Linear Unit, contains non-linear activations in the gating mechanism. However, we found Mamba2 models without additional MLPs to perform worse, which is why we included them in the implementations used in this section.</span></small>

<small><sup>4</sup>因此各架构的逐位置 MLP 完全相同. 这与 GDN 架构很契合, 对 Mamba2 则略不标准: Mamba2 作为 Gated Linear Unit, 门控机制中已含非线性激活. 不过我们发现不加额外 MLP 的 Mamba2 模型表现更差, 因此本节所用实现中保留了这些 MLP.</small>

<!-- page 24 of 70 -->

0.747 at 760M; 0.677 vs. 0.682 at 1B), and the hybrid GDN 3:1 configuration improved further, achieving the best overall results (0.717 at 760M; 0.669 at 1B). While hybrid Mamba2 is competitive with the transformer, GDN-based models consistently outperform it across Math, Code, and QA domains (Table 21), confirming GDN as the right choice for the linear component of Olmo Hybrid.

0.747; 1B 时 0.677 对 0.682), hybrid GDN 3:1 配置进一步改进, 取得整体最好结果 (760M 时 0.717; 1B 时 0.669). Hybrid Mamba2 虽能与 transformer 一较高下, 但基于 GDN 的模型在 Math, Code 与 QA 领域上都稳定胜过它 (Table 21), 证实 GDN 是 Olmo Hybrid 线性组件的正确选择.

**Layer Placement: Interleaved vs. Middle.** We compare two hybridization strategies that use the same 3:1 linear-to-attention ratio but place the attention layers differently:

**层的位置: 交错对居中.** 我们比较两种 hybrid 策略, 它们的线性层与注意力层比例同为 3:1, 但注意力层放置方式不同:

• **Interleaved:** Attention layers placed at regular intervals (every 4th layer).

• **Middle:** Attention layers concentrated in the middle of the network, with an additional attention layer at the final position.

• **交错:** 注意力层按固定间隔放置 (每第 4 层).

• **居中:** 注意力层集中在网络中部, 另在最后一个位置加一层注意力.

Despite having very similar parameter counts (948M vs. 932M at 760M; Table 22), the interleaved configuration consistently outperforms the middle placement, with the gap growing at larger scales. Both configurations outperform the transformer baseline, confirming that the benefit of hybridization is robust to placement strategy, though interleaving appears preferable. One interpretation of the advantage of interleaved placement is that uniformly distributing attention layers allows every part of the network to access global context, whereas concentrating attention in the middle creates a bottleneck through which all "attention-relevant information" must pass. Additionally, connecting to our theoretical results in Section 3.3, interleaving maximizes the number of alternations between layer types, which may unlock additional expressive power: for example, stacked compositions of tasks like state-based recall (Theorem 1) could benefit from multiple rounds of alternation between state tracking and recall. While Theorem 3 shows that a single alternation suffices with padding tokens, in practice, multiple alternations without padding may be more effective.

尽管参数量非常接近 (760M 规模下 948M 对 932M; Table 22), 交错配置始终优于居中放置, 且差距随规模增大. 两种配置都超过 transformer 基线, 证实 hybrid 的收益对放置策略是稳健的, 但交错似乎更可取. 对交错放置优势的一种解释是: 均匀分布注意力层让网络每个部分都能访问全局上下文, 而把注意力集中在中部会形成瓶颈, 所有 「与注意力相关的信息」 都得从这里通过. 此外, 联系 Section 3.3 的理论结果, 交错让层类型之间的交替次数最多, 可能解锁额外的表达力: 例如 state-based recall (Theorem 1) 这类任务的层层嵌套组合, 可能受益于状态追踪与召回之间的多轮交替. 虽然 Theorem 3 表明有 padding token 时一次交替就够, 实践中不加 padding 的多次交替可能更有效.

**Linear-to-Attention Ratio: 1:1 vs. 3:1 vs. 7:1.** We vary the fraction of attention layers from 50% down to 12.5%, using interleaved placement with GDN throughout. At the smallest scales (60M–190M parameters), the 7:1 ratio (12.5% attention) tends to perform best or on par with 3:1, suggesting that fewer attention layers can suffice when models are small. At larger scales (600M–1B), however, the 3:1 ratio consistently achieves the best or second-best performance across all domains (Table 21), while the 7:1 ratio falls slightly behind despite having more parameters. The 1:1 ratio (50% attention) performs comparably to 3:1 at small scales but underperforms at larger scales, suggesting that the higher computational cost of more attention layers does not pay off relative to the GDN layers. Overall, the 3:1 ratio (25% attention) offers the best trade-off across scales and domains, and we select it for Olmo Hybrid. Notably, all three interleaved hybrid configurations substantially outperform the transformer at large scales, so the exact ratio is less critical than the decision to hybridize at all.

**线性层与注意力层比例: 1:1 对 3:1 对 7:1.** 我们把注意力层占比从 50% 调到 12.5%, 全程用 GDN 交错放置. 在最小规模 (60M–190M 参数) 上, 7:1 比例 (12.5% 注意力) 往往最好或与 3:1 持平, 说明模型较小时更少的注意力层就够了. 但在较大规模 (600M–1B) 上, 3:1 比例在所有领域都稳定取得最好或第二好的表现 (Table 21), 7:1 比例尽管参数更多却略微落后. 1:1 比例 (50% 注意力) 在小规模上与 3:1 相当, 在较大规模上表现更差, 说明更多注意力层带来的更高计算成本, 相对 GDN 层并不划算. 总体而言, 3:1 比例 (25% 注意力) 在各规模与各领域上权衡最好, 我们为 Olmo Hybrid 选用它. 值得注意的是, 三种交错 hybrid 配置在大规模上都大幅超过 transformer, 因此具体比例不如 「是否做 hybrid」 这个决定关键.

**GDN Architecture: Gate and Eigenvalue Sign.** We additionally ablate two internal GDN design choices—the use of the output gate and the sign of the recurrence eigenvalues—across both pure and hybrid (3:1 interleaved) configurations. In the GDN, the output gate multiplies the RNN output by a learned sigmoid-gated projection, while the eigenvalue sign determines whether the recurrence allows oscillatory dynamics (negative EVs) or monotone decay only (positive EVs). Results are reported in the bottom two sections of Tables 5 and 21.

**GDN 架构: 门控与特征值符号.** 我们还在纯架构与 hybrid (3:1 交错) 两种配置下, 消融 GDN 内部的两个设计选择: 是否使用输出门, 以及循环特征值的符号. 在 GDN 中, 输出门把 RNN 输出乘以一个经 sigmoid 门控的可学习投影; 特征值符号则决定循环允许振荡动态 (负特征值) 还是只允许单调衰减 (正特征值). 结果见 Tables 5 and 21 最下面两部分.

For **pure GDN**, removing the gate consistently hurts performance across all scales and domains: both no-gate variants (Neg EV, no gate and Pos EV, no gate) underperform their gated counterparts, confirming the gate is a useful component in a pure-RNN setting. Interestingly, positive EVs with a gate (Pos EV, gate) perform comparably to or slightly better than negative EVs with a gate at several scales, though the differences are small and inconsistent.

对 **纯 GDN**, 去掉门控在所有规模与领域上都稳定损害表现: 两个无门控变体 (Neg EV, no gate 与 Pos EV, no gate) 都不如对应的有门控版本, 证实门控在纯 RNN 设置中是有用组件. 有意思的是, 在若干规模上, 有门控的正特征值 (Pos EV, gate) 与有门控的负特征值表现相当甚至略好, 不过差异很小且不稳定.

For **hybrid GDN (3:1)**, the picture changes: the selected architecture (Neg EV, gate) remains the most consistent performer, but the no-gate variants are more competitive in the hybrid setting than in the pure setting, and occasionally outperform the gated variants at individual scales. This suggests that, in the hybrid setting, attention layers may partially compensate for the removed gate, reducing its marginal value. Overall, the differences among the four hybrid variants are small (within ∼0.01 BPB at most scales), and we retain the gated negative-EV configuration as the default based on its slight edge in consistency.

对 **hybrid GDN (3:1)**, 图景有所不同: 所选架构 (Neg EV, gate) 仍是表现最稳定的, 但无门控变体在 hybrid 设置下比在纯设置下更有竞争力, 偶尔在个别规模上超过有门控变体. 这说明在 hybrid 设置中, 注意力层可能部分弥补了去掉的门控, 降低了门控的边际价值. 总体上, 四个 hybrid 变体之间差异很小 (多数规模上在 ∼0.01 BPB 以内), 我们基于稳定性上的微弱优势, 保留有门控的负特征值配置作为默认.

<!-- page 25 of 70 -->

Table 5 Architecture ablation results — averages. Average OlmoBaseEval BPB (across Math, Code, QA) for pure and hybrid architectures at 7 representative scales. Bold indicates best; underline second best; † best within section. ⋆ marks our selected architecture. Note that per-size comparisons should be interpreted with care, as architectures at the same nominal scale differ in actual parameter count (see Table 22).

表 5 架构消融结果 (平均值). 纯架构与 hybrid 架构在 7 个代表性规模上的平均 OlmoBaseEval BPB (Math, Code, QA 平均). 粗体为最好, 下划线为第二好, † 为分组内最好. ⋆ 标出我们所选的架构. 注意逐规模比较需谨慎解读, 因为同一名义规模下各架构的实际参数量不同 (见 Table 22).

<table><tr><td>Architecture</td><td>Attn %</td><td>60M</td><td>100M</td><td>190M</td><td>370M</td><td>600M</td><td>760M</td><td>1B</td></tr><tr><td colspan="9">Pure Architectures</td></tr><tr><td>Transformer</td><td>100%</td><td>1.155</td><td>1.037</td><td>0.950</td><td>0.839</td><td>0.781</td><td>0.747</td><td>0.682</td></tr><tr><td>GDN</td><td>0%</td><td> $1.080^†$ </td><td> $0.990^†$ </td><td> $0.895^†$ </td><td> $\underline{0.795}$ </td><td> $0.761^†$ </td><td> $0.722^†$ </td><td> $0.677^†$ </td></tr><tr><td>Mamba2</td><td>0%</td><td>1.146</td><td>1.036</td><td>0.941</td><td>0.843</td><td>0.787</td><td>0.750</td><td>0.718</td></tr><tr><td colspan="9">Hybrid: Interleaved Attention</td></tr><tr><td>GDN (1:1)</td><td>50%</td><td>1.093</td><td>0.992</td><td>0.896</td><td>0.804</td><td>0.787</td><td>0.724</td><td>0.674</td></tr><tr><td>GDN (3:1)*</td><td>25%</td><td> $\underline{1.077}$ </td><td> $0.986^†$ </td><td> $\underline{0.891}$ </td><td> $0.799^†$ </td><td>0.754</td><td> $\underline{0.717}$ </td><td> $0.669^†$ </td></tr><tr><td>GDN (7:1)</td><td>12.5%</td><td>1.082</td><td>0.988</td><td>0.892</td><td>0.803</td><td> $\underline{0.748}$ </td><td>0.721</td><td>0.675</td></tr><tr><td>Mamba2 (3:1)</td><td>25%</td><td>1.130</td><td>1.012</td><td>0.921</td><td>0.828</td><td>0.772</td><td>0.732</td><td>0.698</td></tr><tr><td colspan="9">Hybrid GDN (3:1): Middle Placement</td></tr><tr><td>Interleaved*</td><td>25%</td><td> $1.077^†$ </td><td> $0.986^†$ </td><td> $\underline{0.891}$ </td><td> $0.799^†$ </td><td>0.754</td><td> $0.717^†$ </td><td> $0.669^†$ </td></tr><tr><td>Middle</td><td>25%</td><td>1.087</td><td>0.988</td><td>0.899</td><td>0.800</td><td> $0.754^†$ </td><td>0.721</td><td>0.672</td></tr><tr><td colspan="9">Hybrid GDN (3:1): Gate/Eigenvalue Ablations</td></tr><tr><td>Neg EV, gate*</td><td>25%</td><td> $1.077^†$ </td><td>0.986</td><td> $0.891^†$ </td><td>0.799</td><td>0.754</td><td>0.717</td><td>0.669</td></tr><tr><td>Neg EV, no gate</td><td>25%</td><td>1.081</td><td> $\underline{0.976}$ </td><td>0.894</td><td>0.801</td><td> $0.752^†$ </td><td>0.721</td><td> $\underline{0.666}$ </td></tr><tr><td>Pos EV, gate</td><td>25%</td><td>1.086</td><td> $\underline{0.981}$ </td><td>0.897</td><td>0.828</td><td>0.757</td><td> $\underline{0.714}$ </td><td> $\underline{0.667}$ </td></tr><tr><td>Pos EV, no gate</td><td>25%</td><td>1.082</td><td>0.988</td><td>0.901</td><td> $0.795^†$ </td><td>0.754</td><td>0.717</td><td>0.670</td></tr><tr><td colspan="9">Pure GDN: Gate/Eigenvalue Ablations</td></tr><tr><td>Neg EV, gate</td><td>0%</td><td>1.080</td><td>0.990</td><td>0.895</td><td> $\underline{0.795}$ </td><td>0.761</td><td>0.722</td><td>0.677</td></tr><tr><td>Pos EV, gate</td><td>0%</td><td> $\underline{1.070}$ </td><td> $0.982^†$ </td><td> $0.893^†$ </td><td>0.798</td><td> $\underline{0.751}$ </td><td> $0.720^†$ </td><td> $0.674^†$ </td></tr><tr><td>Neg EV, no gate</td><td>0%</td><td>1.087</td><td>0.999</td><td>0.904</td><td>0.809</td><td>0.761</td><td>0.731</td><td>0.680</td></tr><tr><td>Pos EV, no gate</td><td>0%</td><td>1.092</td><td>1.002</td><td>0.901</td><td>0.806</td><td>0.765</td><td>0.727</td><td>0.678</td></tr></table>

**Summary of Findings.** The ablation study allows us to answer the three design questions posed at the beginning of this section. First, **GDN is preferred over Mamba2** as the linear RNN component: the Mamba2- based models performed worse at every scale in both pure and hybrid configurations, while GDN matched or outperformed the transformer even as a pure architecture. Second, **interleaved placement outperforms middle placement**: distributing attention layers uniformly throughout the network consistently yields better results than concentrating them, likely because it allows every part of the network to access global context and maximizes the number of layer-type alternations. Third, **the 3:1 linear-to-attention ratio is a good default overall choice**: while the 7:1 ratio is competitive at small scales, the 3:1 ratio provides the most consistent gains at large scales, and the 1:1 ratio does not justify the additional attention cost.

**发现小结.** 消融研究让我们能回答本节开头提出的三个设计问题. 第一, 作为线性 RNN 组件 **GDN 优于 Mamba2**: 基于 Mamba2 的模型在纯架构与 hybrid 配置下每个规模都更差, 而 GDN 即便作为纯架构也能追平或超过 transformer. 第二, **交错放置优于居中放置**: 把注意力层均匀分布在整个网络中, 始终比集中放置效果更好, 可能是因为这让网络每个部分都能访问全局上下文, 并使层类型交替次数最多. 第三, **3:1 的线性层与注意力层比例是整体上不错的默认选择**: 7:1 在小规模上有竞争力, 但 3:1 在大规模上增益最稳定, 1:1 则不值得付出额外的注意力成本.

### 5.2 Olmo Hybrid vs. Other Open Models Olmo Hybrid 与其他开放模型对比

**Setup.** We organize our baseline open-weight models into four groups, distinguishing dense vs. MoE MLP layers and RNN-only vs. Hybrid vs. Attention-only architectures. We emphasize that baselines were trained with different datasets and token budgets, making direct comparisons between them less meaningful for evaluating architecture choices.

**设置.** 我们把开放权重基线模型分成四组, 区分 dense 与 MoE 的 MLP 层, 以及纯 RNN, Hybrid 与纯注意力架构. 需要强调的是, 各基线的训练数据集与 token 预算不同, 因此它们之间的直接对比对评估架构选择意义有限.

The closest group to Olmo Hybrid are other hybrid models with dense MLP layers: Nemotron-H (NVIDIA, 2025), Falcon H1 (Zuo et al., 2025), and RecurrentGemma (Botev et al., 2024). Falcon H1 is a parallel hybrid mixer (also referred to as "intra-layer hybridization"): it uses Mamba-2 SSM and attention blocks on 100% of layers and performs a channel-wise concatenation prior to the MLP layer. Nemotron-H is the closest architecture to ours, with 8% of layers using self-attention (GQA; Ainslie et al., 2023) and all other layers

与 Olmo Hybrid 最接近的一组, 是其他使用 dense MLP 层的 hybrid 模型: Nemotron-H (NVIDIA, 2025), Falcon H1 (Zuo et al., 2025) 与 RecurrentGemma (Botev et al., 2024). Falcon H1 是并行 hybrid 混合器 (也称 「层内 hybrid」): 它在 100% 的层上同时使用 Mamba-2 SSM 与注意力块, 并在 MLP 层之前按通道拼接. Nemotron-H 是与我们最接近的架构, 8% 的层使用自注意力 (GQA; Ainslie et al., 2023), 其余所有层

> **想:** Table 5 里 600M 处 GDN (7:1) 是 0.748, 反而比 3:1 的 0.754 好; 按 §5.1 的 attention ratio 结论, 为什么最后仍选 3:1 interleaved?
> §5.1 的依据是跨规模的一致性: 60M–190M 上 7:1 常最好或持平, 但到 600M–1B, 3:1 在所有领域都是最好或第二好 (Table 21), 1B 上 0.669 也低于 7:1 的 0.675 与 1:1 的 0.674. 表注还提醒同一名义规模实际参数量不同, 7:1 参数更多却略落后. 放置方式也一样看: 同为 3:1, 交错 0.669 对居中 0.672. 作者的结论是具体比例不如 「是否做 hybrid」 关键.

<!-- page 26 of 70 -->

using Mamba-2 SSM blocks. RecurrentGemma applies local self-attention (with a 2K context window) and an SSM using the Griffin architecture (De et al., 2024) on 100% of layers and takes a gated sum.

使用 Mamba-2 SSM 块. RecurrentGemma 在 100% 的层上同时使用局部自注意力 (2K 上下文窗口) 与基于 Griffin 架构 (De et al., 2024) 的 SSM, 并取门控加和.

We also compare to open-weight pure RNN models: Falcon Mamba (Zuo et al., 2024) and xLSTM (Beck et al., 2025). Falcon Mamba uses the Mamba 1 architecture on 100% of layers. xLSTM uses mLSTM (Beck et al., 2026) (a gated linear RNN with a memory state) on 100% of layers, and is the only model running in FP32.

我们还与开放权重的纯 RNN 模型对比: Falcon Mamba (Zuo et al., 2024) 与 xLSTM (Beck et al., 2025). Falcon Mamba 在 100% 的层上使用 Mamba 1 架构. xLSTM 在 100% 的层上使用 mLSTM (Beck et al., 2026) (一种带记忆状态的门控线性 RNN), 也是唯一以 FP32 运行的模型.

Finally, we report performance for hybrid models using MoE for MLP layers: Nemotron 3 Nano (NVIDIA Team, 2025b), which alternates between Mamba-2 SSM on 85% of layers and self-attention (GQA) on 15% of layers; and Kimi Linear (Kimi Team, 2025), which uses Kimi DeltaNet on 75% of layers and self-attention (MLA; DeepSeek-AI, 2024) on 25% of layers.

最后, 我们报告 MLP 层使用 MoE 的 hybrid 模型的表现: Nemotron 3 Nano (NVIDIA Team, 2025b), 85% 的层用 Mamba-2 SSM, 15% 的层用自注意力 (GQA), 交替排列; 以及 Kimi Linear (Kimi Team, 2025), 75% 的层用 Kimi DeltaNet, 25% 的层用自注意力 (MLA; DeepSeek-AI, 2024).

**Evaluation Details.** Not all models apply long-context extension to the same window size, so for our base model results on RULER we evaluate up to the maximum supported context window at the end of pretraining. We use the most recent vLLM (Kwon et al., 2023) and transformers versions across all models, except for the pure RNN baselines<sup>5</sup>.

**评测细节.** 各模型长上下文扩展的窗口大小并不相同, 因此对 base 模型的 RULER 结果, 我们评测到各模型预训练结束时支持的最大上下文窗口为止. 除纯 RNN 基线外<sup>5</sup>, 所有模型都使用最新版 vLLM (Kwon et al., 2023) 与 transformers.

**Findings.** As shown in Table 6, we report base model performance on OlmoBaseEval, including reported parameter and token counts. For each baseline, we estimate training compute using the $\mathrm { F L O P s } = 6 N D$ heuristic from Kaplan et al. (2020) and $\mathrm { F L O P s } = 6 N _ { \mathrm { a c t i v e } } D$ for MoE models following Fedus et al. (2022); Clark et al. (2022). While all dense baselines have a similar number of parameters (7–9B), they were trained across a wide range of token budgets, presenting a clear compute-performance tradeoff.

**发现.** 如 Table 6 所示, 我们报告各 base 模型在 OlmoBaseEval 上的表现, 并附公开报告的参数量与 token 数. 对每个基线, 我们用 Kaplan et al. (2020) 的 $\mathrm { F L O P s } = 6 N D$ 经验式估算训练算力, MoE 模型则按 Fedus et al. (2022); Clark et al. (2022) 用 $\mathrm { F L O P s } = 6 N _ { \mathrm { a c t i v e } } D$. 各 dense 基线参数量相近 (7–9B), 但训练 token 预算跨度很大, 呈现出清晰的算力-表现权衡.

Olmo Hybrid substantially outperforms both pure RNN baselines, including Falcon Mamba (which is closely matched on tokens and parameters), across all task averages in OlmoBaseEval. Olmo Hybrid also outperforms the older open-weight model xLSTM, trained on roughly 2T tokens.

在 OlmoBaseEval 的所有任务平均分上, Olmo Hybrid 都大幅超过两个纯 RNN 基线, 包括 token 数与参数量都很接近的 Falcon Mamba. Olmo Hybrid 也超过较早的开放权重模型 xLSTM (约 2T token 训练).

Across OlmoBaseEval task averages, Olmo Hybrid 7B shows competitive performance against both Nemotron-H 8B (trained for 15T tokens, 2.5× more than Olmo Hybrid) and Falcon H1 (trained for 12T tokens, 2× as many as Olmo Hybrid).

在 OlmoBaseEval 各任务平均分上, Olmo Hybrid 7B 与 Nemotron-H 8B (训练 15T token, 是 Olmo Hybrid 的 2.5×) 和 Falcon H1 (训练 12T token, 是 Olmo Hybrid 的 2×) 相比都有竞争力.

Among hybrid dense models, there is a large discrepancy in token budgets. Olmo Hybrid outperforms RecurrentGemma, which was trained on 3× fewer tokens. It also appears generally strong for the amount of data it was trained on, matching or outperforming Nemotron-H and Falcon H1 (which have 2× larger token budgets) on some tasks, while performing worse on others (e.g., Olmo Hybrid only outperforms Falcon H1 on GenQA tasks).

各 hybrid dense 模型的 token 预算差异很大. Olmo Hybrid 超过训练 token 少 3× 的 RecurrentGemma. 就其训练数据量而言, 它总体表现也很强: 在部分任务上追平或超过 token 预算大 2× 的 Nemotron-H 与 Falcon H1, 在另一些任务上较差 (例如 Olmo Hybrid 只在 GenQA 任务上超过 Falcon H1).

### 5.3 Post-Training Olmo Hybrid Olmo Hybrid 的后训练

As a preliminary investigation of hybrid models' capabilities after post-training, we apply a portion of the Olmo 3 post-training pipeline to create a preliminary Instruct version of Olmo Hybrid. Following Olmo Team (2025), this involves three stages: thinking SFT on long reasoning traces, then an instruction-tuning phase without the model first thinking, and finally direct preference optimization (DPO; Rafailov et al., 2024). In this section, we compare Olmo Hybrid and Olmo 3 7B at each stage and discuss details and challenges we encountered when adapting our post-training recipe to the hybrid architecture.

作为对 hybrid 模型后训练能力的初步考察, 我们套用 Olmo 3 后训练流程的一部分, 做出 Olmo Hybrid 的初版 Instruct 模型. 按 Olmo Team (2025), 流程分三阶段: 先在长推理轨迹上做 thinking SFT, 再做模型不先思考的指令微调阶段, 最后做 DPO (Rafailov et al., 2024). 本节在每个阶段对比 Olmo Hybrid 与 Olmo 3 7B, 并讨论把后训练配方迁移到 hybrid 架构时遇到的细节与挑战.

**Data Changes.** Relative to Olmo 3, there is one minor change to the Think SFT stage: the addition of function-calling data for tool use. The lack of advanced tool use in our Think models is a known limitation for building agentic models; this new data is one part of broader changes planned for future Olmo models. We use the same prompts from the Olmo 3 Instruct SFT models with new thinking traces, reusing thinking traces from DR Tülu (Shao et al., 2025) for the Web Search QA prompts and generating reasoning traces with GPT-4.1 for the remaining data, upsampling each data point 3× to increase token coverage.<sup>6</sup> The Instruct SFT and DPO data are identical to the Olmo 3 7B and 32B Instruct SFT and DPO variants.

**数据改动.** 相对 Olmo 3, Think SFT 阶段有一处小改动: 加入用于工具调用的 function-calling 数据. 我们的 Think 模型缺少高级工具使用能力, 这是构建 agentic 模型的已知局限; 这批新数据是未来 Olmo 模型计划中更大范围改动的一部分. 我们沿用 Olmo 3 Instruct SFT 模型的相同提示, 配以新的思考轨迹: Web Search QA 提示复用 DR Tülu (Shao et al., 2025) 的思考轨迹, 其余数据用 GPT-4.1 生成推理轨迹, 每条数据上采样 3× 以提高 token 覆盖.<sup>6</sup> Instruct SFT 与 DPO 数据与 Olmo 3 7B 和 32B 的 Instruct SFT 与 DPO 版本完全相同.

<small><span class="docvortex-page-footnote" data-block-type="page_footnote" style="color:#6b7280"><sup>5</sup>We observed slight differences in scores from those reported in the Olmo 3 paper (<0.25% absolute difference for all tasks for Olmo 3) when using the most recent transformers==5.0.0. As transformers==5.0.0 breaks both pure RNN baselines (RecurrentGemma and xLSTM), we use older versions for those baselines.</span></small>

<small><sup>5</sup>使用最新的 transformers==5.0.0 时, 我们观察到分数与 Olmo 3 论文报告值略有差异 (Olmo 3 所有任务的绝对差 <0.25%). 由于 transformers==5.0.0 会让两个纯 RNN 基线 (RecurrentGemma 与 xLSTM) 无法运行, 这些基线使用旧版本.</small>

<small><span class="docvortex-page-footnote" data-block-type="page_footnote" style="color:#6b7280"><sup>6</sup>The new Think SFT dataset is available at: [https://hf.co/datasets/allenai/Dolci-Think-SFT-Olmo-Hybrid](https://hf.co/datasets/allenai/Dolci-Think-SFT-Olmo-Hybrid)</span></small>

<small><sup>6</sup>新的 Think SFT 数据集见: [https://hf.co/datasets/allenai/Dolci-Think-SFT-Olmo-Hybrid](https://hf.co/datasets/allenai/Dolci-Think-SFT-Olmo-Hybrid)</small>

<small><span class="docvortex-page-footnote" data-block-type="page_footnote" style="color:#6b7280"><sup>7</sup>SFT: [https://hf.co/datasets/allenai/Dolci-Instruct-SFT](https://hf.co/datasets/allenai/Dolci-Instruct-SFT). DPO: [https://hf.co/datasets/allenai/Dolci-Instruct-DPO](https://hf.co/datasets/allenai/Dolci-Instruct-DPO)</span></small>

<small><sup>7</sup>SFT 数据: [https://hf.co/datasets/allenai/Dolci-Instruct-SFT](https://hf.co/datasets/allenai/Dolci-Instruct-SFT). DPO 数据: [https://hf.co/datasets/allenai/Dolci-Instruct-DPO](https://hf.co/datasets/allenai/Dolci-Instruct-DPO)</small>

<!-- page 27 of 70 -->

<table><tr><td rowspan="2"></td><td colspan="4">Hybrid Dense</td><td colspan="2">Pure RNN Dense</td><td colspan="2">Hybrid MoE</td><td colspan="2">Dense Baselines</td></tr><tr><td>Olmo Hybrid</td><td>Nemo.-H</td><td>Falcon H1</td><td>Recurr. Gemma</td><td>Falcon Mamba</td><td>xLSTM</td><td>Nemo. 3 Nano</td><td>Kimi Linear</td><td>Olmo 3</td><td>Qwen 3</td></tr><tr><td># Parameters</td><td>7B</td><td>8B</td><td>7B</td><td>9B</td><td>7B</td><td>7B</td><td>30B A3B</td><td>48B A3B</td><td>7B</td><td>8B</td></tr><tr><td># Train Tokens</td><td>6T</td><td>15T</td><td>12T</td><td>2T</td><td>6T</td><td>2T</td><td>25T</td><td>6T</td><td>6T</td><td>36T</td></tr><tr><td>Train Compute ( $10^{23}$  FLOPs)</td><td>2.6</td><td>7.2</td><td>5.5</td><td>1.0</td><td>2.5</td><td>0.9</td><td>5.4</td><td>1.0</td><td>2.6</td><td>17.3</td></tr><tr><td>OlmoBaseEval Math</td><td>55.1</td><td>54.6</td><td>65.7</td><td>32.1</td><td>33.7</td><td>18.3</td><td>53.2</td><td>68.5</td><td>54.6</td><td>67.2</td></tr><tr><td>GSM8k</td><td>74.3</td><td>76.8</td><td>80.9</td><td>49.6</td><td>57.1</td><td>32.8</td><td>86.3</td><td>84.9</td><td>75.2</td><td>84.2</td></tr><tr><td>GSM Symbolic</td><td>49.2</td><td>55.4</td><td>64.8</td><td>25.3</td><td>25.8</td><td>10.8</td><td>68.6</td><td>66.7</td><td>48.4</td><td>65.4</td></tr><tr><td>MATH</td><td>41.8</td><td>31.7</td><td>51.4</td><td>21.3</td><td>18.2</td><td>11.3</td><td>4.6</td><td>54.0</td><td>40.1</td><td>52.0</td></tr><tr><td>OlmoBaseEval Code</td><td>32.4</td><td>37.1</td><td>45.3</td><td>23.7</td><td>14.6</td><td>3.1</td><td>47.3</td><td>30.3</td><td>30.9</td><td>46.2</td></tr><tr><td>BigCodeBench</td><td>35.1</td><td>40.3</td><td>40.5</td><td>20.2</td><td>0.2</td><td>4.0</td><td>45.7</td><td>44.5</td><td>34.8</td><td>43.1</td></tr><tr><td>HumanEval</td><td>49.0</td><td>60.1</td><td>61.0</td><td>34.5</td><td>0.1</td><td>13.3</td><td>77.1</td><td>72.4</td><td>49.0</td><td>71.2</td></tr><tr><td>DeepSeek LeetCode</td><td>2.2</td><td>4.1</td><td>3.5</td><td>0.6</td><td>0.1</td><td>0.0</td><td>10.1</td><td>1.1</td><td>1.5</td><td>8.8</td></tr><tr><td>DS 1000</td><td>21.1</td><td>24.7</td><td>29.0</td><td>19.1</td><td>16.3</td><td>2.3</td><td>33.3</td><td>34.3</td><td>20.6</td><td>33.3</td></tr><tr><td>MBPP</td><td>50.3</td><td>58.0</td><td>63.5</td><td>33.7</td><td>37.5</td><td>1.3</td><td>66.4</td><td>58.3</td><td>43.6</td><td>65.8</td></tr><tr><td>MultiPL HumanEval</td><td>29.4</td><td>32.3</td><td>59.7</td><td>21.6</td><td>15.7</td><td>0.2</td><td>48.3</td><td>1.1</td><td>28.8</td><td>52.5</td></tr><tr><td>MultiPL MBPPP</td><td>39.5</td><td>40.2</td><td>59.8</td><td>36.4</td><td>32.1</td><td>0.3</td><td>50.0</td><td>0.6</td><td>38.3</td><td>48.5</td></tr><tr><td>OlmoBaseEval MCSTEM</td><td>70.0</td><td>72.4</td><td>75.7</td><td>61.6</td><td>64.2</td><td>36.9</td><td>78.6</td><td>77.5</td><td>66.2</td><td>78.7</td></tr><tr><td>ARC MC</td><td>90.8</td><td>93.3</td><td>94.2</td><td>82.6</td><td>85.7</td><td>46.7</td><td>94.8</td><td>94.3</td><td>89.2</td><td>95.4</td></tr><tr><td>MMLU STEM</td><td>64.6</td><td>64.2</td><td>73.8</td><td>49.6</td><td>52.0</td><td>34.3</td><td>73.8</td><td>67.8</td><td>59.7</td><td>76.7</td></tr><tr><td>MedMCQA MC</td><td>52.1</td><td>56.2</td><td>59.9</td><td>47.3</td><td>48.9</td><td>31.4</td><td>64.2</td><td>64.6</td><td>48.0</td><td>63.5</td></tr><tr><td>MedQA MC</td><td>48.7</td><td>54.5</td><td>55.9</td><td>39.4</td><td>42.5</td><td>23.2</td><td>64.9</td><td>66.6</td><td>41.6</td><td>62.0</td></tr><tr><td>SciQ MC</td><td>93.9</td><td>94.1</td><td>94.7</td><td>88.9</td><td>91.9</td><td>48.8</td><td>95.0</td><td>94.0</td><td>92.8</td><td>96.0</td></tr><tr><td>OlmoBaseEval MCNon-STEM</td><td>80.4</td><td>80.7</td><td>84.1</td><td>71.1</td><td>74.2</td><td>39.9</td><td>83.9</td><td>76.2</td><td>78.2</td><td>84.9</td></tr><tr><td>MMLU Humanities</td><td>71.6</td><td>76.8</td><td>78.7</td><td>62.1</td><td>65.8</td><td>37.6</td><td>80.5</td><td>79.0</td><td>69.2</td><td>78.6</td></tr><tr><td>MMLU Social Sci.</td><td>79.7</td><td>80.5</td><td>84.4</td><td>68.4</td><td>70.8</td><td>39.5</td><td>85.1</td><td>73.4</td><td>75.2</td><td>84.9</td></tr><tr><td>MMLU Other</td><td>71.0</td><td>73.2</td><td>76.3</td><td>63.9</td><td>64.1</td><td>38.7</td><td>78.0</td><td>78.2</td><td>66.8</td><td>76.7</td></tr><tr><td>CSQA MC</td><td>78.4</td><td>75.9</td><td>78.1</td><td>67.8</td><td>73.0</td><td>32.5</td><td>75.3</td><td>52.8</td><td>75.2</td><td>84.1</td></tr><tr><td>PiQA MC</td><td>82.7</td><td>85.9</td><td>87.8</td><td>76.4</td><td>83.5</td><td>51.5</td><td>90.0</td><td>82.8</td><td>80.2</td><td>89.9</td></tr><tr><td>SocialIQA MC</td><td>81.1</td><td>78.6</td><td>81.5</td><td>75.5</td><td>77.5</td><td>34.1</td><td>80.7</td><td>78.8</td><td>80.3</td><td>83.3</td></tr><tr><td>CoQA Gen2MC MC</td><td>93.9</td><td>91.6</td><td>94.4</td><td>83.3</td><td>86.5</td><td>33.6</td><td>92.2</td><td>91.2</td><td>92.5</td><td>93.6</td></tr><tr><td>DROP Gen2MC MC</td><td>68.1</td><td>60.9</td><td>81.3</td><td>48.7</td><td>51.4</td><td>33.9</td><td>70.0</td><td>71.9</td><td>67.4</td><td>78.4</td></tr><tr><td>Jeopardy Gen2MC MC</td><td>89.3</td><td>92.5</td><td>91.8</td><td>83.9</td><td>90.2</td><td>46.7</td><td>94.9</td><td>54.1</td><td>86.9</td><td>92.1</td></tr><tr><td>NaturalQs Gen2MC MC</td><td>71.0</td><td>76.0</td><td>73.3</td><td>64.2</td><td>67.7</td><td>34.3</td><td>79.1</td><td>78.1</td><td>69.5</td><td>74.6</td></tr><tr><td>SQuAD Gen2MC MC</td><td>97.0</td><td>95.8</td><td>97.5</td><td>87.6</td><td>85.4</td><td>56.2</td><td>97.3</td><td>97.3</td><td>97.0</td><td>97.4</td></tr><tr><td>OlmoBaseEval GenQA</td><td>72.9</td><td>71.2</td><td>71.7</td><td>68.5</td><td>68.5</td><td>34.8</td><td>78.1</td><td>75.7</td><td>72.5</td><td>71.1</td></tr><tr><td>HellaSwag RC</td><td>79.0</td><td>84.3</td><td>80.9</td><td>81.3</td><td>81.9</td><td>61.1</td><td>86.0</td><td>85.0</td><td>77.7</td><td>80.6</td></tr><tr><td>Winogrande RC</td><td>86.2</td><td>89.6</td><td>87.9</td><td>86.3</td><td>88.3</td><td>62.1</td><td>88.7</td><td>88.2</td><td>85.6</td><td>86.4</td></tr><tr><td>Lambada</td><td>70.2</td><td>76.0</td><td>73.0</td><td>72.2</td><td>80.9</td><td>19.7</td><td>75.9</td><td>77.2</td><td>68.8</td><td>72.8</td></tr><tr><td>Basic Skills</td><td>89.7</td><td>90.2</td><td>93.3</td><td>83.0</td><td>86.1</td><td>60.9</td><td>92.5</td><td>93.1</td><td>89.5</td><td>93.4</td></tr><tr><td>DROP</td><td>72.9</td><td>65.7</td><td>69.4</td><td>44.0</td><td>41.6</td><td>24.4</td><td>75.0</td><td>72.2</td><td>71.5</td><td>57.2</td></tr><tr><td>Jeopardy</td><td>64.0</td><td>69.7</td><td>61.1</td><td>66.4</td><td>67.1</td><td>9.3</td><td>77.2</td><td>77.1</td><td>60.3</td><td>65.1</td></tr><tr><td>NaturalQs</td><td>34.8</td><td>37.7</td><td>27.4</td><td>30.6</td><td>35.1</td><td>1.8</td><td>45.7</td><td>25.9</td><td>32.5</td><td>33.8</td></tr><tr><td>SQuAD</td><td>92.1</td><td>87.9</td><td>91.4</td><td>85.9</td><td>75.9</td><td>33.9</td><td>94.0</td><td>91.8</td><td>93.6</td><td>89.0</td></tr><tr><td>CoQA</td><td>67.4</td><td>39.9</td><td>60.7</td><td>66.6</td><td>59.7</td><td>40.4</td><td>67.7</td><td>70.3</td><td>72.8</td><td>61.8</td></tr><tr><td>OlmoBaseEval HeldOut</td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td></tr><tr><td>LBPP</td><td>16.8</td><td>26.8</td><td>30.2</td><td>5.8</td><td>5.7</td><td>0.6</td><td>33.7</td><td>31.1</td><td>17.7</td><td>26.2</td></tr><tr><td>BBH</td><td>65.2</td><td>69.9</td><td>75.5</td><td>53.3</td><td>42.8</td><td>24.6</td><td>78.2</td><td>68.6</td><td>64.0</td><td>76.5</td></tr><tr><td>MMLU Pro MC</td><td>41.7</td><td>44.4</td><td>50.0</td><td>27.6</td><td>24.5</td><td>11.4</td><td>53.5</td><td>50.7</td><td>37.2</td><td>50.1</td></tr><tr><td>Deepmind Math</td><td>23.4</td><td>26.1</td><td>34.3</td><td>17.3</td><td>15.5</td><td>7.5</td><td>32.8</td><td>40.8</td><td>23.6</td><td>47.6</td></tr><tr><td>Long-context Eval</td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td></tr><tr><td>RULER 4K</td><td>92.7</td><td>84.1</td><td>92.0</td><td>44.9</td><td>68.2</td><td>28.6</td><td>96.2</td><td>88.5</td><td>94.9</td><td>95.5</td></tr><tr><td>RULER 8K</td><td>91.4</td><td>82.0</td><td>92.0</td><td>-</td><td>49.0</td><td>20.0</td><td>95.2</td><td>89.4</td><td>91.2</td><td>94.1</td></tr><tr><td>RULER 16K</td><td>90.0</td><td>-</td><td>89.7</td><td>-</td><td>23.8</td><td>12.4</td><td>93.8</td><td>94.0</td><td>84.1</td><td>93.5</td></tr><tr><td>RULER 32K</td><td>86.4</td><td>-</td><td>83.0</td><td>-</td><td>4.7</td><td>-</td><td>90.3</td><td>90.2</td><td>78.3</td><td>90.1</td></tr><tr><td>RULER 64K</td><td>85.0</td><td>-</td><td>77.2</td><td>-</td><td>0.0</td><td>-</td><td>85.9</td><td>90.5</td><td>67.8</td><td>-</td></tr></table>

Table 6 Base model performance on OlmoBaseEval compared to open-weight baselines using the OlmoBaseEval suite. Olmo Hybrid outperforms the dense Olmo 3 on all OlmoBaseEval multi-task averages, and both Pure RNN baselines (Falcon Mamba and xLSTM). Olmo Hybrid is also competitive with other open-weight hybrid dense models, like Nemotron-H and Falcon H1, despite being trained on half or fewer tokens. Olmo Hybrid was not evaluated on held-out benchmarks prior to release. RULER was evaluated up to the max context window for each model.

表 6 用 OlmoBaseEval 套件对比 base 模型与开放权重基线的表现. Olmo Hybrid 在 OlmoBaseEval 所有多任务平均分上都超过 dense 的 Olmo 3, 也超过两个纯 RNN 基线 (Falcon Mamba 与 xLSTM). 尽管训练 token 只有一半或更少, Olmo Hybrid 与 Nemotron-H, Falcon H1 等其他开放权重 hybrid dense 模型相比也有竞争力. Olmo Hybrid 发布前未在留出基准上评测. RULER 评测到各模型的最大上下文窗口为止.

**Decoding Settings.** Finding a stable configuration for Olmo Hybrid required careful attention to vLLM flag settings and implementation details, particularly for evaluation. Correct generation and throughput were both sensitive to careful choice of these settings, although this will likely change as hybrid models are more widely adopted and open-source tooling improves. The two key flags needed to get maximum performance with the post-trained models were --disable-cascade-attn, which disables cascade attention (an optimization for shared prompt prefixes), and --enforce-eager, which disables torch compilation. These two flags have been used in our RL setup dating back to Olmo 3, but are new additions to evaluations, and scores drop precipitously without them. We hypothesize that --enforce-eager matters more for Olmo

**解码设置.** 为 Olmo Hybrid 找到稳定配置, 需要仔细处理 vLLM 的 flag 设置与实现细节, 评测时尤其如此. 生成是否正确与吞吐都对这些设置很敏感, 不过随着 hybrid 模型更广泛采用, 开源工具改进, 这种情况很可能改变. 让后训练模型发挥最佳表现的两个关键 flag 是: --disable-cascade-attn, 用于关闭 cascade attention (一种针对共享提示前缀的优化); 以及 --enforce-eager, 用于关闭 torch 编译. 这两个 flag 从 Olmo 3 起就用在我们的 RL 设置里, 但在评测中是新加的, 不加时分数会骤降. 我们推测 --enforce-eager 对 Olmo

<!-- page 28 of 70 -->

<table><tr><td rowspan="2">Model</td><td colspan="5">Knowledge &amp; Reasoning</td><td colspan="4">Math</td><td colspan="3">Code</td><td colspan="3">Chat &amp; IF</td></tr><tr><td>MMLU</td><td>PopQA</td><td>BBH</td><td>GPQA</td><td>Zebra</td><td>MATH</td><td>Ω</td><td>AIME&#x27;25</td><td>AIME&#x27;24</td><td>HE+</td><td>MBPP+</td><td>LCB</td><td>IFEval</td><td>IFB</td><td>AE3</td></tr><tr><td>Olmo 3 Think SFT</td><td>74.9</td><td>20.8</td><td>84.1</td><td>45.8</td><td>57.9</td><td>94.4</td><td>37.8</td><td>57.6</td><td>69.6</td><td>88.2</td><td>63.2</td><td>67.8</td><td>77.9</td><td>30.0</td><td>43.9</td></tr><tr><td>Olmo Hybrid Think SFT</td><td>80.5</td><td>25.1</td><td>84.6</td><td>47.0</td><td>55.1</td><td>93.8</td><td>35.1</td><td>55.2</td><td>66.2</td><td>86.3</td><td>63.7</td><td>65.5</td><td>80.4</td><td>31.6</td><td>49.0</td></tr><tr><td>Olmo 3 Instruct SFT</td><td>67.1</td><td>16.5</td><td>51.0</td><td>30.0</td><td>18.0</td><td>65.1</td><td>14.4</td><td>7.2</td><td>6.7</td><td>69.8</td><td>56.5</td><td>20.0</td><td>81.7</td><td>27.4</td><td>21.8</td></tr><tr><td>Olmo Hybrid Instruct SFT</td><td>71.9</td><td>16.8</td><td>47.3</td><td>36.8</td><td>17.0</td><td>66.7</td><td>16.0</td><td>8.8</td><td>6.7</td><td>69.2</td><td>55.3</td><td>21.3</td><td>81.5</td><td>29.0</td><td>25.6</td></tr><tr><td>Olmo 3 DPO</td><td>69.1</td><td>20.7</td><td>69.3</td><td>37.9</td><td>28.4</td><td>79.6</td><td>22.8</td><td>20.4</td><td>23.5</td><td>72.9</td><td>55.9</td><td>18.8</td><td>82.0</td><td>29.3</td><td>43.3</td></tr><tr><td>Olmo Hybrid DPO</td><td>73.6</td><td>21.0</td><td>57.3</td><td>38.0</td><td>29.1</td><td>72.9</td><td>19.5</td><td>10.2</td><td>10.1</td><td>75.1</td><td>56.9</td><td>22.0</td><td>80.5</td><td>33.3</td><td>56.3</td></tr><tr><td colspan="16">Hybrid - Dense (Δ)</td></tr><tr><td>Δ Think SFT</td><td>+5.6</td><td>+4.3</td><td>+0.5</td><td>+1.2</td><td>-2.8</td><td>-0.6</td><td>-2.7</td><td>-2.4</td><td>-3.4</td><td>-1.9</td><td>+0.5</td><td>-2.3</td><td>+2.5</td><td>+1.6</td><td>+5.1</td></tr><tr><td>Δ Instruct SFT</td><td>+4.8</td><td>+0.3</td><td>-3.7</td><td>+6.8</td><td>-1.0</td><td>+1.6</td><td>+1.6</td><td>+1.6</td><td>-0.0</td><td>-0.7</td><td>-1.2</td><td>+1.3</td><td>-0.3</td><td>+1.6</td><td>+3.8</td></tr><tr><td>Δ DPO</td><td>+4.5</td><td>+0.3</td><td>-12.0</td><td>+0.1</td><td>+0.7</td><td>-6.7</td><td>-3.3</td><td>-10.2</td><td>-13.4</td><td>+2.2</td><td>+1.0</td><td>+3.2</td><td>-1.5</td><td>+4.0</td><td>+13.0</td></tr></table>

Table 7 Post-training evaluation comparison between Olmo 3 (dense) and Olmo Hybrid (hybrid) across three training stages: Think SFT, Instruct SFT, and DPO. Ω = Omega Full. HE+ = HumanEvalPlus. IFB = IFBench. AE3 = AlpacaEval 3.

表 7 Olmo 3 (dense) 与 Olmo Hybrid (hybrid) 在三个训练阶段 (Think SFT, Instruct SFT 与 DPO) 的后训练评测对比. Ω = Omega Full. HE+ = HumanEvalPlus. IFB = IFBench. AE3 = AlpacaEval 3.

<table><tr><td>Model</td><td>Metric</td><td>1K</td><td>4K</td><td>8K</td><td>16K</td><td>32K</td></tr><tr><td rowspan="4">Olmo 3 7B (MHA)</td><td>Tokens/sec/node</td><td>2,909</td><td>2,164</td><td>1,510</td><td>1,690</td><td>1,247</td></tr><tr><td>Inference GPUs (RL batch 1K)</td><td>32</td><td>48</td><td>56</td><td>64</td><td>96</td></tr><tr><td>Generation wall time (h)</td><td>10.5</td><td>56.7</td><td>162.5</td><td>283.7</td><td>768.6</td></tr><tr><td>GPU-hours (×1K)</td><td>0.3</td><td>2.7</td><td>9.1</td><td>18.2</td><td>73.8</td></tr><tr><td rowspan="4">Olmo Hybrid 7B</td><td>Tokens/sec/node</td><td>3,039</td><td>3,077</td><td>2,736</td><td>1,876</td><td>1,422</td></tr><tr><td>Inference GPUs (RL batch 1K)</td><td>8</td><td>16</td><td>24</td><td>40</td><td>64</td></tr><tr><td>Generation wall time (h)</td><td>10.1</td><td>39.9</td><td>89.6</td><td>261.5</td><td>689.9</td></tr><tr><td>GPU-hours (×1K)</td><td>0.1</td><td>0.6</td><td>2.2</td><td>10.5</td><td>44.2</td></tr><tr><td rowspan="4">Olmo Hybrid 7B (enforce eager)</td><td>Tokens/sec/node</td><td>1,410</td><td>1,565</td><td>1,592</td><td>1,495</td><td>1,066</td></tr><tr><td>Inference GPUs (RL batch 1K)</td><td>8</td><td>16</td><td>24</td><td>40</td><td>64</td></tr><tr><td>Generation wall time (h)</td><td>21.7</td><td>78.4</td><td>154.1</td><td>328.1</td><td>920.4</td></tr><tr><td>GPU-hours (×1K)</td><td>0.2</td><td>1.3</td><td>3.7</td><td>13.1</td><td>58.9</td></tr></table>

Table 8 Inference-bound scaling for async RL generation across context lengths. In async RL, each training step requires generating a full batch of rollouts before the policy update; generation throughput is the bottleneck. We measure the minimum GPU allocation needed to serve an RL batch of 1,024 rollouts concurrently and project generation wall time and total GPU-hours over 1,725,440 episodes (1,684 steps).

表 8 异步 RL 生成在不同上下文长度下的推理瓶颈. 异步 RL 中, 每个训练步在策略更新前都需要生成一整批 rollout, 生成吞吐是瓶颈. 我们测量并发服务 1,024 条 rollout 的 RL batch 所需的最少 GPU 数, 并外推 1,725,440 个 episode (1,684 步) 的生成墙钟时间与总 GPU-hours.

Hybrid than for a dense transformer because torch compilation can introduce subtle numerical differences that compound across recurrent GDN state updates in a way that standard attention layers do not experience. Consistent with this interpretation, re-enabling compilation while storing the GDN cache in FP32 via --mamba\_ssm\_cache\_dtype float32 (NVIDIA Team, 2025a) recovers similar scores, suggesting that repeated low-precision downcasting across recurrent steps is part of the issue.

Hybrid 比对 dense transformer 更重要, 因为 torch 编译可能引入细微的数值差异, 这些差异会在 GDN 的循环状态更新中逐步累积, 而标准注意力层没有这种累积. 与这一解释一致, 重新开启编译, 同时用 --mamba\_ssm\_cache\_dtype float32 (NVIDIA Team, 2025a) 把 GDN cache 存为 FP32, 可以恢复相近的分数, 说明跨循环步反复降到低精度是问题的一部分.

**Inference Throughput.** We conducted early investigations into completing our recipe with reinforcement learning with verifiable rewards (RLVR; Lambert et al., 2025). To quantify basic inference throughput—the bottleneck in our synchronous Olmo RL setup (Olmo Team, 2025)—we benchmarked Olmo Hybrid on a single 8×A100 node with a 2,048-token prompt, 2 degrees of tensor parallelism, and a batch size of 16 prompts, each prompt sampled 4×. The details are shown in Table 7. Without --enforce-eager, Olmo Hybrid is competitive with or faster than the dense OLMo 3 7B (4K: 3,023 vs. 2,164, 8K: 2,247 vs. 1,510, 16K: 1,486 vs. 1,690, and 32K: 1,499 vs. 1,247 tokens/sec/node), largely because the gated delta net layers reduce KV cache memory pressure compared to the full multi-head attention used in Olmo 3 7B (which lacks GQA). However, enabling --enforce-eager – as required for numerical stability – substantially reduces throughput (4K: 1,425, 8K: 1,365, 16K: 1,197, and 32K: 654 tokens/sec), roughly 0.5–0.9× that of the dense baseline. The --enforce-eager flag was also used in our Olmo 3 training runs, but the dense model did not suffer from

**推理吞吐.** 我们初步尝试用可验证奖励强化学习 (RLVR; Lambert et al., 2025) 补全配方. 为量化基本推理吞吐 (这是我们同步 Olmo RL 设置中的瓶颈; Olmo Team, 2025), 我们在单个 8×A100 节点上对 Olmo Hybrid 做基准测试: 提示长 2,048 token, 张量并行度 2, batch 为 16 个提示, 每个提示采样 4×. 细节见 Table 7. 不加 --enforce-eager 时, Olmo Hybrid 与 dense 的 OLMo 3 7B 相当或更快 (4K: 3,023 对 2,164, 8K: 2,247 对 1,510, 16K: 1,486 对 1,690, 32K: 1,499 对 1,247 tokens/sec/node), 主要因为相比 Olmo 3 7B 所用的完整多头注意力 (没有 GQA), gated delta net 层降低了 KV cache 的显存压力. 但为数值稳定而开启 --enforce-eager 后, 吞吐大幅下降 (4K: 1,425, 8K: 1,365, 16K: 1,197, 32K: 654 tokens/sec), 约为 dense 基线的 0.5–0.9×. 我们的 Olmo 3 训练中也用了 --enforce-eager, 但 dense 模型没有出现

<!-- page 29 of 70 -->

this substantial slowdown.<sup>8</sup>

这么大的减速.<sup>8</sup>

**Post-Training Performance.** Table 7 shows the performance of the Think SFT, Instruct SFT, and DPO checkpoints for Olmo Hybrid compared to Olmo 3. Overall, the stronger pretraining performance translates to persistent gains on knowledge tasks, but the model still lags behind Olmo 3 on extended reasoning tasks such as AIME and Omega (Sun et al., 2025). We anticipate that adapting the post-training data for the hybrid model could improve performance on these benchmarks. Beyond the data, early post-training results were also sensitive to decoding kernels and related settings, so improvements there could further close the gap. Other work has shown that the strongest teacher model does not always improve the downstream student proportionally (Guha et al., 2025; OpenThoughts-Agent Team, 2025), which could be base-model-specific, further highlighting the need to iterate on the post-training data beyond what was used for Olmo 3.<sup>9</sup> At the level of both engineering and research, post-training hybrid models is in its infancy; we will continue to work on these recipes and share our findings with the community.

**后训练表现.** Table 7 展示 Olmo Hybrid 的 Think SFT, Instruct SFT 与 DPO checkpoint 相对 Olmo 3 的表现. 总体上, 更强的预训练表现转化为知识类任务上持续的增益, 但在 AIME 与 Omega (Sun et al., 2025) 这类长推理任务上仍落后于 Olmo 3. 我们预计, 为 hybrid 模型调整后训练数据能改善这些基准上的表现. 数据之外, 早期后训练结果对解码 kernel 及相关设置也很敏感, 在这方面改进也能进一步缩小差距. 其他工作表明, 最强的教师模型并不总能让下游学生模型同比例提升 (Guha et al., 2025; OpenThoughts-Agent Team, 2025), 这可能与 base 模型有关, 这也说明需要在 Olmo 3 所用数据之外继续迭代后训练数据.<sup>9</sup> 无论工程还是研究层面, hybrid 模型的后训练都还处在起步阶段; 我们会继续完善这些配方, 并与社区分享发现.

> **问:** Table 8 在 1K 上下文时 Olmo Hybrid 只需 8 张推理 GPU, Olmo 3 7B (MHA) 要 32 张; 开了 enforce eager 后吞吐掉到约一半, GPU 数却不变. 用 KV cache memory pressure 怎么解释这两件事?
> GPU 数由能否同时装下 1,024 条 rollout 的状态决定. Olmo 3 7B 用的是没有 GQA 的完整 MHA, Table 1 里 32K 时每层 512 MiB; Olmo Hybrid 的 3/4 层换成 GDN, 每层只有 1.05 MiB 的定长状态, 所以显存需求小得多. enforce eager 只是关掉 torch 编译, 影响每步计算速度, 不影响要存的状态, 所以 GPU 数不变, 墙钟时间变长 (1K 时 10.1h 变 21.7h). 按 §5.3, 开这个 flag 是因为编译引入的数值误差会在 GDN 的循环状态更新里累积.

One limitation of our current investigation into post-training is that we have not considered the implications of switching to a hybrid architecture for safety. In future work, it would be interesting to assess whether Olmo Hybrid exhibits different behavior on safety evaluations compared to transformers.

目前后训练研究的一个局限是, 我们没有考虑换成 hybrid 架构对安全性的影响. 今后值得评估 Olmo Hybrid 在安全评测上的行为是否与 transformer 不同.

## Conclusion

Compared to Olmo 3, Olmo Hybrid achieves better pretraining efficiency, which translates to improvements on downstream tasks, including long-context abilities. While there have been many releases of strong hybrid models mixing recurrence with attention, our results provide evidence for the benefit of hybrid architectures over transformers in a controlled, large-scale setting. Beyond these headline results, we present theoretical analysis and fully controlled scaling studies that further substantiate these advantages. In particular, we show that hybrid models are more expressive than the sum of their parts: they can represent synthetic tasks that neither transformers nor RNNs in isolation can. We also explore the theoretical link between expressivity and language model scaling, showing that standard conceptual explanations for scaling laws predict that increasing expressivity should benefit training efficiency, consistent with our empirical findings. Overall, Olmo Hybrid provides evidence for hybrid models over transformers and a conceptual explanation for their observed gains. This work raises many questions for future research: post-training hybrid models, optimizing RNN architecture details, and more deeply understanding the connection between an architecture's expressive power and its scaling behavior.

与 Olmo 3 相比, Olmo Hybrid 的预训练效率更高, 并转化为下游任务上的提升, 包括长上下文能力. 虽然已有许多把循环与注意力混合的强 hybrid 模型发布, 我们的结果在受控的大规模设置下, 为 hybrid 架构优于 transformer 提供了证据. 在这些主要结果之外, 我们还给出理论分析与完全受控的 Scaling 研究, 进一步支撑这些优势. 具体而言, 我们表明 hybrid 模型的表达力大于各部分之和: 它们能表示 transformer 或 RNN 单独都表示不了的合成任务. 我们还探讨了表达力与语言模型 Scaling 之间的理论联系, 表明对 Scaling Laws 的标准概念性解释预测: 提升表达力应有利于训练效率, 这与我们的实证发现一致. 总体而言, Olmo Hybrid 为 hybrid 模型优于 transformer 提供了证据, 也为其观察到的增益给出了概念性解释. 这项工作为后续研究提出了许多问题: hybrid 模型的后训练, RNN 架构细节的优化, 以及更深入地理解架构表达力与其 Scaling 行为之间的联系.

<small><span class="docvortex-page-footnote" data-block-type="page_footnote" style="color:#6b7280"><sup>8</sup>Subsequent improvements to our vLLM implementation have recovered much of the throughput gap between Olmo Hybrid and OLMo 3 7B in eager mode: [https://github.com/vllm-project/vllm/pull/32550#issuecomment-3994432476](https://github.com/vllm-project/vllm/pull/32550#issuecomment-3994432476).</span></small>

<small><sup>8</sup>此后对 vLLM 实现的改进, 已在 eager 模式下追回 Olmo Hybrid 与 OLMo 3 7B 之间大部分吞吐差距: [https://github.com/vllm-project/vllm/pull/32550#issuecomment-3994432476](https://github.com/vllm-project/vllm/pull/32550#issuecomment-3994432476).</small>

<small><span class="docvortex-page-footnote" data-block-type="page_footnote" style="color:#6b7280"><sup>9</sup>The long-context recipe used for Olmo Hybrid also differs slightly from Olmo 3 7B, which could contribute to differences in post-training behavior.</span></small>

<small><sup>9</sup>Olmo Hybrid 所用的长上下文配方与 Olmo 3 7B 也略有不同, 这可能是后训练行为差异的原因之一.</small>

<!-- page 30 of 70 -->

## Author Contributions 作者贡献

• **William Merrill** led the project, contributing to early experiments, pretraining, theory, and writing.

• **Yanhong Li** conducted early proof-of-concept experiments, implemented the HuggingFace and vLLM versions of Olmo Hybrid, ran evaluations, and owned the synthetic experiments and their writeup.

• **Tyler Romero** ran pretraining, mid-training, and long-context extension. He also optimized training throughput, implemented Ulysses-style context parallelism, improved the throughput and numerical correctness of Olmo Hybrid's vLLM implementation, and helped with writing.

• **Anej Svete** ran early proof-of-concept experiments alongside WM, ran the experiments for the empirical scaling laws and architecture ablation sections, and wrote up those sections.

• **Caia Costello** led the collaboration from Lambda's side, including project scoping, data management, preliminary research on Olmo Hybrid training across B200 and H100 hardware, and real-time support for pretraining.

• **Pradeep Dasigi** generated tool use data for Olmo Hybrid Think SFT and helped with artifact release logistics.

• **Dirk Groeneveld** helped plan the Olmo Hybrid pretraining run and analyze the training stability of Olmo Hybrid.

• **David Heineman** ran generative evaluations for Olmo Hybrid and open-weight models and wrote up these results.

• **Bailey Kuehl** handled technical aspects of preparing Olmo Hybrid artifacts and documentation for release.

• **Nathan Lambert** led post-training for Olmo Hybrid and wrote up post-training results.

• **Chuan Li** provided high-level supervision on the Lambda side of the project.

• **Kyle Lo** contributed to pre-training evaluations, writing, and presentation.

• **SaumyaMalik** contributed to post-training methodology (tokenization and chat templates) and evaluation.

• **DJ Matusz** helped validate the compatibility of Olmo Hybrid pretraining with B200 hardware.

• **Benjamin Minixhofer** implemented FLA in OLMo-core to support the initial experiments for Olmo Hybrid and also benchmarked inference throughput.

• **Jacob Morrison** contributed to post-training, focusing on SFT.

• **Luca Soldaini** helped plan initial experiments and pretraining, and contributed to vLLM implementation and post-training debugging.

• **Finbarr Timbers** contributed to post-training Olmo Hybrid, implementing the hybrid model in open-instruct.

• **Pete Walsh** worked on training code, built the Slurm launch system for pretraining on Lambda's cluster, and helped run pretraining.

• **Noah Smith** provided high-level guidance on many aspects of the project.

• **Hannaneh Hajishirzi** provided high-level guidance on many aspects of the project.

• **Ashish Sabharwal** provided guidance on the initial experiments and made core technical contributions to the theoretical aspects of the project.

• **William Merrill** 主导项目, 参与早期实验, 预训练, 理论与写作.

• **Yanhong Li** 做了早期概念验证实验, 实现 Olmo Hybrid 的 HuggingFace 与 vLLM 版本, 跑评测, 并负责合成实验及其写作.

• **Tyler Romero** 负责预训练, mid-training 与长上下文扩展. 他还优化了训练吞吐, 实现 Ulysses 式上下文并行, 改进 Olmo Hybrid vLLM 实现的吞吐与数值正确性, 并参与写作.

• **Anej Svete** 与 WM 一起做早期概念验证实验, 负责实证 Scaling Laws 与架构消融两节的实验并撰写这两节.

• **Caia Costello** 主导 Lambda 方面的合作, 包括项目范围界定, 数据管理, Olmo Hybrid 在 B200 与 H100 硬件上训练的前期研究, 以及预训练的实时支持.

• **Pradeep Dasigi** 为 Olmo Hybrid Think SFT 生成工具使用数据, 并协助产物发布事务.

• **Dirk Groeneveld** 协助规划 Olmo Hybrid 预训练, 并分析 Olmo Hybrid 的训练稳定性.

• **David Heineman** 为 Olmo Hybrid 与开放权重模型跑生成式评测, 并撰写这些结果.

• **Bailey Kuehl** 负责 Olmo Hybrid 产物与发布文档准备中的技术事务.

• **Nathan Lambert** 主导 Olmo Hybrid 的后训练并撰写后训练结果.

• **Chuan Li** 在 Lambda 一方提供总体指导.

• **Kyle Lo** 参与预训练评测, 写作与呈现.

• **SaumyaMalik** 参与后训练方法 (tokenization 与 chat 模板) 与评测.

• **DJ Matusz** 协助验证 Olmo Hybrid 预训练与 B200 硬件的兼容性.

• **Benjamin Minixhofer** 在 OLMo-core 中实现 FLA, 支撑 Olmo Hybrid 的初期实验, 并测试推理吞吐.

• **Jacob Morrison** 参与后训练, 侧重 SFT.

• **Luca Soldaini** 协助规划初期实验与预训练, 并参与 vLLM 实现与后训练调试.

• **Finbarr Timbers** 参与 Olmo Hybrid 后训练, 在 open-instruct 中实现 hybrid 模型.

• **Pete Walsh** 开发训练代码, 为 Lambda 集群上的预训练搭建 Slurm 启动系统, 并协助运行预训练.

• **Noah Smith** 在项目多个方面提供总体指导.

• **Hannaneh Hajishirzi** 在项目多个方面提供总体指导.

• **Ashish Sabharwal** 为初期实验提供指导, 并在项目理论部分做出核心技术贡献.

## Acknowledgments 致谢

The authors thank Taira Anderson, Kyle Wiggers, David Albright, and Stephen Kelman for contributing to the release of Olmo Hybrid. WM thanks Songlin Yang and Mehryar Mohri for relevant discussions. AS acknowledges the support of the ETH AI Center doctoral fellowship. This research used resources of the Oak Ridge Leadership Computing Facility, which is a DOE Office of Science User Facility supported under Contract DE-AC05-00OR22725. Additionally, this research used Lambda's computational resources for part of Olmo Hybrid pretraining; the authors thank Amir Zadeh, Allison Beck, Abhi Sarma, and Long Fei for their support during that phase. Finally, this material is based upon work supported by the National Science Foundation under Award No. 2413244.

作者感谢 Taira Anderson, Kyle Wiggers, David Albright 与 Stephen Kelman 为 Olmo Hybrid 发布所做的贡献. WM 感谢 Songlin Yang 与 Mehryar Mohri 的相关讨论. AS 感谢 ETH AI Center 博士奖学金的支持. 本研究使用了 Oak Ridge Leadership Computing Facility 的资源, 该设施是在 Contract DE-AC05-00OR22725 下支持的 DOE Office of Science 用户设施. 此外, 本研究在 Olmo Hybrid 部分预训练中使用了 Lambda 的计算资源; 作者感谢 Amir Zadeh, Allison Beck, Abhi Sarma 与 Long Fei 在该阶段的支持. 最后, 本材料基于 National Science Foundation 资助 (Award No. 2413244) 的工作.

<!-- page 31 of 70 -->

## References

Bibliographic entries below are kept in English as in the original.

以下参考文献条目保持英文原样.

J. Ainslie, J. Lee-Thorp, M. de Jong, Y. Zemlyanskiy, F. Lebrón, and S. Sanghai. GQA: Training generalized multi-query transformer models from multi-head checkpoints, 2023. URL [https://arxiv.org/abs/2305.13245.](https://arxiv.org/abs/2305.13245)

E. Akyürek, B. Wang, Y. Kim, and J. Andreas. In-context language learning: Architectures and algorithms. In ICML, 2024. URL [https://proceedings.mlr.press/v235/akyurek24a.html.](https://proceedings.mlr.press/v235/akyurek24a.html)

S. Arora and A. Goyal. A theory for emergence of complex skills in language models, 2023. URL [https://arxiv.org/abs/2307.15936](https://arxiv.org/abs/2307.15936).

S. Arora, S. Eyuboglu, A. Timalsina, I. Johnson, M. Poli, J. Zou, A. Rudra, and C. Re. Zoology: Measuring and improving recall in efficient language models. In ICLR, 2024a. URL [https://openreview.net/forum?id=LY3ukUANko](https://openreview.net/forum?id=LY3ukUANko).

S. Arora, S. Eyuboglu, M. Zhang, A. Timalsina, S. Alberti, J. Zou, A. Rudra, and C. Re. Simple linear attention language models balance the recall-throughput tradeoff. In ICML, 2024b. URL [https://openreview.net/forum?id=e93ffDcpH3](https://openreview.net/forum?id=e93ffDcpH3).

J. Austin, A. Odena, M. Nye, M. Bosma, H. Michalewski, D. Dohan, E. Jiang, C. Cai, M. Terry, Q. Le, et al. Program synthesis with large language models, 2021. URL [https://arxiv.org/abs/2108.07732.](https://arxiv.org/abs/2108.07732)

D. A. Barrington. Bounded-width polynomial-size branching programs recognize exactly those languages in NC<sup>1</sup>. In STOC, pages 1–5, 1986. URL [https://dl.acm.org/doi/10.1145/12130.12131.](https://dl.acm.org/doi/10.1145/12130.12131)

M. Beck, K. Pöppel, P. Lippe, R. Kurle, P. M. Blies, G. Klambauer, S. Böck, and S. Hochreiter. xLSTM 7B: A recurrent LLM for fast and efficient inference, 2025. URL [https://arxiv.org/abs/2503.13427.](https://arxiv.org/abs/2503.13427)

M. Beck, K. Schweighofer, S. Böck, S. Lehner, and S. Hochreiter. xLSTM scaling laws: Competitive performance with linear time-complexity. In ICLR, 2026. URL [https://openreview.net/forum?id=bpbU549sSg.](https://openreview.net/forum?id=bpbU549sSg)

Y. Bisk, R. Zellers, R. Le Bras, J. Gao, and Y. Choi. PIQA: Reasoning about physical commonsense in natural language. AAAI, 34(05):7432–7439, 2020.

A. Botev, S. De, S. L. Smith, A. Fernando, G.-C. Muraru, R. Haroun, L. Berrada, R. Pascanu, P. G. Sessa, R. Dadashi, et al. RecurrentGemma: Moving past transformers for efficient open language models, 2024. URL [https://arxiv.org/abs/2404.07839](https://arxiv.org/abs/2404.07839).

J. Bradbury, S. Merity, C. Xiong, and R. Socher. Quasi-recurrent neural networks. In ICLR, 2017. URL [https://openreview.net/forum?id=H1zJ-v5xl](https://openreview.net/forum?id=H1zJ-v5xl).

S. R. Buss. The boolean formula value problem is in ALOGTIME. In STOC, pages 123–131, 1987. doi: 10.1145/28395. 28409. URL [https://dl.acm.org/doi/10.1145/28395.28409.](https://dl.acm.org/doi/10.1145/28395.28409)

F. Cassano, J. Gouwar, D. Nguyen, S. Nguyen, L. Phipps-Costin, D. Pinckney, M.-H. Yee, Y. Zi, C. J. Anderson, M. Q. Feldman, et al. MultiPL-E: A scalable and extensible approach to benchmarking neural code generation, 2022. URL [https://arxiv.org/abs/2208.08227](https://arxiv.org/abs/2208.08227).

H. Caussinus, P. McKenzie, D. Thérien, and H. Vollmer. Nondeterministic NC1computation. Journal of Computer and System Sciences, 57(2):200–212, 1998. doi: 10.1006/jcss.1998.1588. URL [https://doi.org/10.1006/jcss.1998.1588](https://doi.org/10.1006/jcss.1998.1588).

M. Chen, J. Tworek, H. Jun, Q. Yuan, H. P. d. O. Pinto, J. Kaplan, H. Edwards, Y. Burda, N. Joseph, G. Brockman, et al. Evaluating large language models trained on code, 2021. URL [https://arxiv.org/abs/2107.03374.](https://arxiv.org/abs/2107.03374)

D. Chiang. Transformers in uniform TC<sup>0</sup>. TMLR, 2025. URL [https://openreview.net/forum?id=ZA7D4nQuQF.](https://openreview.net/forum?id=ZA7D4nQuQF)

A. Clark, D. de Las Casas, A. Guy, A. Mensch, M. Paganini, J. Hoffmann, B. Damoc, B. Hechtman, T. Cai, S. Borgeaud, et al. Unified scaling laws for routed language models. In ICML, pages 4057–4086, 2022. URL [https://proceedings.mlr.press/v162/clark22a.html.](https://proceedings.mlr.press/v162/clark22a.html)

P. Clark, I. Cowhey, O. Etzioni, T. Khot, A. Sabharwal, C. Schoenick, and O. Tafjord. Think you have solved question answering? try ARC, the AI2 reasoning challenge, 2018. URL [https://arxiv.org/abs/1803.05457.](https://arxiv.org/abs/1803.05457)

K. Cobbe, V. Kosaraju, M. Bavarian, M. Chen, H. Jun, L. Kaiser, M. Plappert, J. Tworek, J. Hilton, R. Nakano, C. Hesse, and J. Schulman. Training verifiers to solve math word problems, 2021. URL [https://arxiv.org/abs/2110.14168](https://arxiv.org/abs/2110.14168).

<!-- page 32 of 70 -->

T. Dao and A. Gu. Transformers are SSMs: Generalized models and efficient algorithms through structured state space duality. In ICML, 2024. URL [https://openreview.net/forum?id=ztn8FCGNny.](https://openreview.net/forum?id=ztn8FCGNny)

S. De, S. L. Smith, A. Fernando, A. Botev, G. Cristian-Muraru, A. Gu, R. Haroun, L. Berrada, Y. Chen, S. Srinivasan, et al. Griffin: Mixing gated linear recurrences with local attention for efficient language models, 2024. URL [https://arxiv.org/abs/2402.19427](https://arxiv.org/abs/2402.19427).

DeepSeek-AI. DeepSeek-V2: A strong, economical, and efficient mixture-of-experts language model, 2024. URL [https://arxiv.org/abs/2405.04434](https://arxiv.org/abs/2405.04434).

N. S. Dey, B. C. Zhang, L. Noci, M. Li, B. Bordelon, S. Bergsma, C. Pehlevan, B. Hanin, and J. Hestness. Don't be lazy: CompleteP enables compute-efficient deep transformers. In NeurIPS, 2025. URL [https://openreview.net/forum?id=lMU2kaMANl](https://openreview.net/forum?id=lMU2kaMANl).

D. Dua, Y. Wang, P. Dasigi, G. Stanovsky, S. Singh, and M. Gardner. DROP: A reading comprehension benchmark requiring discrete reasoning over paragraphs. In NAACL, 2019. URL [https://aclanthology.org/N19-1246.](https://aclanthology.org/N19-1246)

Y. Dubois, B. Galambosi, P. Liang, and T. B. Hashimoto. Length-controlled AlpacaEval: A simple way to debias automatic evaluators, 2024. URL [https://arxiv.org/abs/2404.04475.](https://arxiv.org/abs/2404.04475)

J. L. Elman. Finding structure in time. Cognitive Science, 14(2):179–211, 1990. doi: 10.1207/s15516709cog1402\_1. URL [https://doi.org/10.1207/s15516709cog1402\_1.](https://doi.org/10.1207/s15516709cog1402_1)

W. Fedus, B. Zoph, and N. Shazeer. Switch transformers: Scaling to trillion parameter models with simple and efficient sparsity. JMLR, 23(120):1–39, 2022. URL [https://jmlr.org/papers/v23/21-0998.html.](https://jmlr.org/papers/v23/21-0998.html)

L. Gao, S. Biderman, S. Black, L. Golding, T. Hoppe, C. Foster, J. Phang, H. He, A. Thite, N. Nabeshima, S. Presser, and C. Leahy. The pile: An 800gb dataset of diverse text for language modeling, 2020. URL [https://arxiv.org/abs/2101.00027](https://arxiv.org/abs/2101.00027).

Y. Gelberg, K. Eguchi, T. Akiba, and E. Cetin. Extending the context of pretrained LLMs by dropping their positional embeddings, 2025. URL [https://arxiv.org/abs/2512.12167.](https://arxiv.org/abs/2512.12167)

S. Geman, E. Bienenstock, and R. Doursat. Neural networks and the bias/variance dilemma. Neural Computation, 4 (1):1–58, 1992. doi: 10.1162/neco.1992.4.1.1. URL [https://doi.org/10.1162/neco.1992.4.1.1.](https://doi.org/10.1162/neco.1992.4.1.1)

S. Goyal, Z. Ji, A. S. Rawat, A. K. Menon, S. Kumar, and V. Nagarajan. Think before you speak: Training language models with pause tokens. In ICLR, 2024. URL [https://openreview.net/forum?id=ph04CRkPdC.](https://openreview.net/forum?id=ph04CRkPdC)

R. Grazzi, J. Siems, J. K. Franke, A. Zela, F. Hutter, and M. Pontil. Unlocking state-tracking in linear RNNs through negative eigenvalues. In ICLR, 2025. URL [https://openreview.net/forum?id=UvTo3tVBk2.](https://openreview.net/forum?id=UvTo3tVBk2)

S. Greenbaum and G. Nelson. The international corpus of English (ICE) project. World Englishes, 15(1):3–15, 1996. doi: 10.1111/j.1467-971x.1996.tb00088.x.

R. Greenlaw, H. J. Hoover, and W. L. Ruzzo. A Compendium of Problems Complete for P. Citeseer, 1991. URL [https://www.semanticscholar.org/paper/A-Compendium-of-Problems-Complete-for-P-Greenlaw-Hoover/32f9d1b1bcead912c87de195a6b3695b13eb3d95.](https://www.semanticscholar.org/paper/A-Compendium-of-Problems-Complete-for-P-Greenlaw-Hoover/32f9d1b1bcead912c87de195a6b3695b13eb3d95)

A. Gu and T. Dao. Mamba: Linear-time sequence modeling with selective state spaces, 2024. URL [https://openreview.net/forum?id=AL1fq05o7H](https://openreview.net/forum?id=AL1fq05o7H).

A. Gu, K. Goel, and C. Re. Efficiently modeling long sequences with structured state spaces. In ICLR, 2022. URL [https://openreview.net/forum?id=uYLFoz1vlAC.](https://openreview.net/forum?id=uYLFoz1vlAC)

E. Guha, R. Marten, S. Keh, N. Raoof, G. Smyrnis, H. Bansal, M. Nezhurina, J. Mercat, T. Vu, Z. Sprague, A. Suvarna, B. Feuer, L. Chen, Z. Khan, E. Frankel, S. Grover, C. Choi, N. Muennighoff, S. Su, W. Zhao, J. Yang, S. Pimpalgaonkar, K. Sharma, C. C.-J. Ji, Y. Deng, S. Pratt, V. Ramanujan, J. Saad-Falcon, J. Li, A. Dave, A. Albalak, K. Arora, B. Wulfe, C. Hegde, G. Durrett, S. Oh, M. Bansal, S. Gabriel, A. Grover, K.-W. Chang, V. Shankar, A. Gokaslan, M. A. Merrill, T. Hashimoto, Y. Choi, J. Jitsev, R. Heckel, M. Sathiamoorthy, A. G. Dimakis, and L. Schmidt. OpenThoughts: Data recipes for reasoning models, 2025. URL [https://arxiv.org/abs/2506.04178.](https://arxiv.org/abs/2506.04178)

D. Guo, Q. Zhu, D. Yang, Z. Xie, K. Dong, W. Zhang, G. Chen, X. Bi, Y. Wu, Y. Li, et al. DeepSeek-Coder: When the large language model meets programming – the rise of code intelligence, 2024. URL [https://arxiv.org/abs/2401.14196](https://arxiv.org/abs/2401.14196).

<!-- page 33 of 70 -->

Y. Hao, D. Angluin, and R. Frank. Formal language recognition by hard attention transformers: Perspectives from circuit complexity. TACL, 10:800–810, 2022. doi: 10.1162/tacl\_a\_00490. URL [https://aclanthology.org/2022.tacl-1.46/](https://aclanthology.org/2022.tacl-1.46/).

D. Hendrycks, C. Burns, S. Basart, A. Zou, M. Mazeika, D. Song, and J. Steinhardt. Measuring massive multitask language understanding. ICLR, 2021.

S. Hochreiter and J. Schmidhuber. Long short-term memory. Neural Computation, 9(8):1735–1780, 1997. doi: 10.1162/neco.1997.9.8.1735. URL [https://doi.org/10.1162/neco.1997.9.8.1735.](https://doi.org/10.1162/neco.1997.9.8.1735)

J. Hoffmann, S. Borgeaud, A. Mensch, E. Buchatskaya, T. Cai, E. Rutherford, D. de Las Casas, L. A. Hendricks, J. Welbl, A. Clark, T. Hennigan, E. Noland, K. Millican, G. van den Driessche, B. Damoc, A. Guy, S. Osindero, K. Simonyan, E. Elsen, J. W. Rae, O. Vinyals, and L. Sifre. Training compute-optimal large language models, 2022. URL [https://arxiv.org/abs/2203.15556](https://arxiv.org/abs/2203.15556).

C.-P. Hsieh, S. Sun, S. Kriman, S. Acharya, D. Rekesh, F. Jia, and B. Ginsburg. RULER: What's the real context size of your long-context language models? In COLM, 2024. URL [https://openreview.net/forum?id=kIoBbc76Sy.](https://openreview.net/forum?id=kIoBbc76Sy)

M. Y. Hu, J. Petty, C. Shi, W. Merrill, and T. Linzen. Between circuits and Chomsky: Pre-pretraining on formal languages imparts linguistic biases. In ACL, 2025. URL [https://aclanthology.org/2025.acl-long.478/.](https://aclanthology.org/2025.acl-long.478/)

S. Hu, Y. Tu, X. Han, G. Cui, C. He, W. Zhao, X. Long, Z. Zheng, Y. Fang, Y. Huang, X. Zhang, Z. L. Thai, C. Wang, Y. Yao, C. Zhao, J. Zhou, J. Cai, Z. Zhai, N. Ding, C. Jia, G. Zeng, D. Li, Z. Liu, and M. Sun. MiniCPM: Unveiling the potential of small language models with scalable training strategies. In COLM, 2024. URL [https://openreview.net/forum?id=3X2L2TFr0f.](https://openreview.net/forum?id=3X2L2TFr0f)

M. Hutter. Learning curve theory, 2021. URL [https://arxiv.org/abs/2102.04074.](https://arxiv.org/abs/2102.04074)

S. A. Jacobs, M. Tanaka, C. Zhang, M. Zhang, S. L. Song, S. Rajbhandari, and Y. He. Deepspeed ulysses: System optimizations for enabling training of extreme long sequence transformer models, 2023. URL [https://arxiv.org/abs/2309.14509](https://arxiv.org/abs/2309.14509).

N. Jain, K. Han, A. Gu, W.-D. Li, F. Yan, T. Zhang, S. Wang, A. Solar-Lezama, K. Sen, and I. Stoica. LiveCodeBench: Holistic and contamination free evaluation of large language models for code, 2024. URL [https://arxiv.org/abs/2403.07974](https://arxiv.org/abs/2403.07974).

S. Jelassi, D. Brandfonbrener, S. M. Kakade, and E. Malach. Repeat after me: Transformers are better than state space models at copying. In ICML, 2024. URL [https://proceedings.mlr.press/v235/jelassi24a.html.](https://proceedings.mlr.press/v235/jelassi24a.html)

D. Jin, E. Pan, N. Oufattole, W.-H. Weng, H. Fang, and P. Szolovits. What disease does this patient have? a large-scale open domain question answering dataset from medical exams. Applied Sciences, 11(14):6421, 2021.

J. Kaplan, S. McCandlish, T. Henighan, T. B. Brown, B. Chess, R. Child, S. Gray, A. Radford, J. Wu, and D. Amodei. Scaling laws for neural language models, 2020. URL [https://arxiv.org/abs/2001.08361.](https://arxiv.org/abs/2001.08361)

A. Katharopoulos, A. Vyas, N. Pappas, and F. Fleuret. Transformers are RNNs: Fast autoregressive transformers with linear attention. In ICML, 2020. URL [https://proceedings.mlr.press/v119/katharopoulos20a.html.](https://proceedings.mlr.press/v119/katharopoulos20a.html)

Kimi Team. Kimi Linear: An expressive, efficient attention architecture, 2025. URL [https://arxiv.org/abs/2510.26692](https://arxiv.org/abs/2510.26692).

T. Kwiatkowski, J. Palomaki, O. Redfield, M. Collins, A. Parikh, C. Alberti, D. Epstein, I. Polosukhin, J. Devlin, K. Lee, K. Toutanova, L. Jones, M. Kelcey, M.-W. Chang, A. M. Dai, J. Uszkoreit, Q. Le, and S. Petrov. Natural questions: A benchmark for question answering research. TACL, 7:452–466, 2019. URL [https://aclanthology.org/Q19-1026](https://aclanthology.org/Q19-1026).

W. Kwon, Z. Li, S. Zhuang, Y. Sheng, L. Zheng, C. H. Yu, J. E. Gonzalez, H. Zhang, and I. Stoica. Efficient memory management for large language model serving with PagedAttention. In SOSP, 2023.

Y. Lai, C. Li, Y. Wang, T. Zhang, R. Zhong, L. Zettlemoyer, W.-T. Yih, D. Fried, S. Wang, and T. Yu. DS-1000: A natural and reliable benchmark for data science code generation, 2022. URL [https://arxiv.org/abs/2211.11501](https://arxiv.org/abs/2211.11501).

N. Lambert, J. Morrison, V. Pyatkin, S. Huang, H. Ivison, F. Brahman, L. J. V. Miranda, A. Liu, N. Dziri, S. Lyu, Y. Gu, S. Malik, V. Graf, J. D. Hwang, J. Yang, R. Le Bras, O. Tafjord, C. Wilhelm, L. Soldaini, N. A. Smith, Y. Wang, P. Dasigi, and H. Hajishirzi. Tulu 3: Pushing frontiers in open language model post-training, 2025. URL [https://arxiv.org/abs/2411.15124](https://arxiv.org/abs/2411.15124).

<!-- page 34 of 70 -->

A. Lewkowycz, A. Andreassen, D. Dohan, E. Dyer, H. Michalewski, V. Ramasesh, A. Slone, C. Anil, I. Schlag, T. Gutman-Solo, et al. Solving quantitative reasoning problems with language models, 2022. URL [https://arxiv.org/abs/2206.14858](https://arxiv.org/abs/2206.14858).

Z. Li, H. Liu, D. Zhou, and T. Ma. Chain of thought empowers transformers to solve inherently serial problems. In ICLR, 2024. URL [https://openreview.net/forum?id=3EWTEy9MTM.](https://openreview.net/forum?id=3EWTEy9MTM)

K. Ligett. Let's stop leaving money on the table, 2026. URL [https://simons.berkeley.edu/events/lets-stop-leaving-money-table-richard-m-karp-distinguished-lecture](https://simons.berkeley.edu/events/lets-stop-leaving-money-table-richard-m-karp-distinguished-lecture). Richard M. Karp Distinguished Lecture, Simons Institute.

H. Lightman, V. Kosaraju, Y. Burda, H. Edwards, B. Baker, T. Lee, J. Leike, J. Schulman, I. Sutskever, and K. Cobbe. Let's verify step by step, 2023. URL [https://arxiv.org/abs/2305.20050.](https://arxiv.org/abs/2305.20050)

B. Y. Lin, R. Le Bras, K. Richardson, A. Sabharwal, R. Poovendran, P. Clark, and Y. Choi. ZebraLogic: On the scaling limits of LLMs for logical reasoning, 2025. URL [https://arxiv.org/abs/2502.01100.](https://arxiv.org/abs/2502.01100)

B. Liu, J. T. Ash, S. Goel, A. Krishnamurthy, and C. Zhang. Transformers learn shortcuts to automata. In ICLR, 2023a. URL [https://openreview.net/forum?id=De4FYqjFueZ.](https://openreview.net/forum?id=De4FYqjFueZ)

J. Liu, C. S. Xia, Y. Wang, and L. Zhang. Is your code generated by ChatGPT really correct? rigorous evaluation of large language models for code generation. In NeurIPS, 2023b. URL [https://openreview.net/forum?id=1qvx610Cu7.](https://openreview.net/forum?id=1qvx610Cu7)

Y. Liu, K. Preechakul, K. Kuwaranancharoen, and Y. Bai. The serial scaling hypothesis. In ICLR, 2026. URL [https://openreview.net/forum?id=ObXB7KJn0B.](https://openreview.net/forum?id=ObXB7KJn0B)

K. Lo, L. L. Wang, M. Neumann, R. Kinney, and D. Weld. S2ORC: The semantic scholar open research corpus. In ACL, 2020. URL [https://aclanthology.org/2020.acl-main.447.](https://aclanthology.org/2020.acl-main.447)

C. London and V. Kanade. Pause tokens strictly increase the expressivity of constant-depth transformers. In NeurIPS, 2025. URL [https://openreview.net/forum?id=eG5oh8l1WZ.](https://openreview.net/forum?id=eG5oh8l1WZ)

A. Mallen, A. Asai, V. Zhong, R. Das, H. Hajishirzi, and D. Khashabi. When not to trust language models: Investigating effectiveness and limitations of parametric and non-parametric memories, 2022. URL https://arxiv.org/abs[2212.10511](https://arxiv.org/abs/2212.10511).

A. Matton, T. Sherborne, D. Aumiller, E. Tommasone, M. Alizadeh, J. He, R. Ma, M. Voisin, E. Gilsenan-McMahon, and M. Gallé. On leakage of code generation evaluation datasets. In Findings of EMNLP, 2024. URL [https://aclanthology.org/2024.findings-emnlp.772/.](https://aclanthology.org/2024.findings-emnlp.772/)

S. Merity, C. Xiong, J. Bradbury, and R. Socher. Pointer sentinel mixture models, 2016. URL [https://arxiv.org/abs/1609.07843](https://arxiv.org/abs/1609.07843).

W. Merrill. Sequential neural networks as automata. In Proceedings of the Workshop on Deep Learning and Formal Languages: Building Bridges, pages 1–13, 2019. doi: 10.18653/v1/W19-3901. URL [https://aclanthology.org/W19-3901/](https://aclanthology.org/W19-3901/).

W. Merrill. On the linguistic capacity of real-time counter automata, 2021. URL [https://arxiv.org/abs/2004.06866](https://arxiv.org/abs/2004.06866).

W. Merrill. A Theory of the Computational Power and Limitations of Language Modeling Architectures. PhD thesis, New York University, 2025. URL [https://lambdaviking.com/assets/pdf/dissertation.pdf.](https://lambdaviking.com/assets/pdf/dissertation.pdf)

W. Merrill and A. Sabharwal. The parallelism tradeoff: Limitations of log-precision transformers. TACL, 11:531–545, 2023. doi: 10.1162/tacl\_a\_00562. URL [https://aclanthology.org/2023.tacl-1.31/.](https://aclanthology.org/2023.tacl-1.31/)

W. Merrill and A. Sabharwal. The expressive power of transformers with chain of thought. In ICLR, 2024. URL [https://openreview.net/forum?id=NjNGlPh8Wh.](https://openreview.net/forum?id=NjNGlPh8Wh)

W. Merrill and A. Sabharwal. Exact expressive power of transformers with padding. In NeurIPS, 2025. URL [https://openreview.net/forum?id=O1abxStFcy.](https://openreview.net/forum?id=O1abxStFcy)

W. Merrill, J. Petty, and A. Sabharwal. The illusion of state in state-space models. In ICML, 2024. URL [https://openreview.net/forum?id=QZgo9JZpLq.](https://openreview.net/forum?id=QZgo9JZpLq)

W. Merrill, S. Arora, D. Groeneveld, and H. Hajishirzi. Critical batch size revisited: A simple empirical approach to large-batch language model training. In NeurIPS, 2025. URL [https://openreview.net/forum?id=XUKUx7Xu89.](https://openreview.net/forum?id=XUKUx7Xu89)

W. Merrill, H. Jiang, Y. Li, A. Lin, and A. Sabharwal. Why are linear RNNs more parallelizable?, 2026. URL [https://arxiv.org/abs/2603.03612](https://arxiv.org/abs/2603.03612).

<!-- page 35 of 70 -->

E. J. Michaud. On neural scaling and the quanta hypothesis. [https://ericjmichaud.com/quanta/](https://ericjmichaud.com/quanta/), 2026. Blog post.

E. J. Michaud, Z. Liu, U. Girit, and M. Tegmark. The quantization model of neural scaling. In NeurIPS, 2023. URL [https://proceedings.neurips.cc/paper\_files/paper/2023/hash/5b6346a05a537d4cdb2f50323452a9fe-Abstract-Conference.html.](https://proceedings.neurips.cc/paper_files/paper/2023/hash/5b6346a05a537d4cdb2f50323452a9fe-Abstract-Conference.html)

I. Mirzadeh, K. Alizadeh, H. Shahrokhi, O. Tuzel, S. Bengio, and M. Farajtabar. GSM-Symbolic: Understanding the limitations of mathematical reasoning in large language models, 2024. URL [https://arxiv.org/abs/2410.05229.](https://arxiv.org/abs/2410.05229)

T. M. Mitchell. The need for biases in learning generalizations. Technical Report CBM-TR-117, Rutgers University, Department of Computer Science, 1980. URL [https://www.cs.cmu.edu/\~tom/pubs/NeedForBias\_1980.pdf.](https://www.cs.cmu.edu/~tom/pubs/NeedForBias_1980.pdf)

M. Mohri. Rational transductors, 2026. URL [https://arxiv.org/abs/2602.07599.](https://arxiv.org/abs/2602.07599)

MosaicML. LLM Foundry – jeopardy dataset, 2024. URL [https://github.com/mosaicml/llm-foundry.](https://github.com/mosaicml/llm-foundry)

Y. Nam, N. Fonseca, S. H. Lee, C. Mingard, and A. A. Louis. An exactly solvable model for emergence and scaling laws in the multitask sparse parity problem. In NeurIPS, 2024. URL [https://openreview.net/forum?id=cuWsR25bbI.](https://openreview.net/forum?id=cuWsR25bbI)

NVIDIA. Nemotron-H: A family of accurate and efficient hybrid mamba-transformer models, 2025. URL [https://arxiv.org/abs/2504.03624](https://arxiv.org/abs/2504.03624).

NVIDIA Team. NVIDIA Nemotron Nano 2: An accurate and efficient hybrid mamba-transformer reasoning model, 2025a. URL [https://arxiv.org/abs/2508.14444.](https://arxiv.org/abs/2508.14444)

NVIDIA Team. Nemotron 3 Nano: Open, efficient mixture-of-experts hybrid Mamba-Transformer model for agentic reasoning, 2025b. URL [https://arxiv.org/abs/2512.20848.](https://arxiv.org/abs/2512.20848) Technical report.

Olmo Team. 2 OLMo 2 furious, 2024. URL [https://arxiv.org/abs/2501.00656.](https://arxiv.org/abs/2501.00656)

Olmo Team. Olmo 3, 2025. URL [https://arxiv.org/abs/2512.13961.](https://arxiv.org/abs/2512.13961)

C. Olsson, N. Elhage, N. Nanda, N. Joseph, N. DasSarma, T. Henighan, B. Mann, A. Askell, Y. Bai, A. Chen, T. Conerly, D. Drain, D. Ganguli, Z. Hatfield-Dodds, D. Hernandez, S. Johnston, A. Jones, J. Kernion, L. Lovitt, K. Ndousse, D. Amodei, T. Brown, J. Clark, J. Kaplan, S. McCandlish, and C. Olah. In-context learning and induction heads, 2022. URL [https://arxiv.org/abs/2209.11895.](https://arxiv.org/abs/2209.11895)

OpenThoughts-Agent Team. OpenThoughts-Agent, 2025. URL [https://www.open-thoughts.ai/blog/agent.](https://www.open-thoughts.ai/blog/agent)

A. Pal, L. K. Umapathi, and M. Sankarasubbu. MedMCQA: A large-scale multi-subject multi-choice dataset for medical domain question answering. In CHIL, 2022. URL [https://proceedings.mlr.press/v174/pal22a.html.](https://proceedings.mlr.press/v174/pal22a.html)

D. Paperno, G. Kruszewski, A. Lazaridou, Q. N. Pham, R. Bernardi, S. Pezzelle, M. Baroni, G. Boleda, and R. Fernández. The LAMBADA dataset: Word prediction requiring a broad discourse context, 2016. URL [https://arxiv.org/abs/1606.06031](https://arxiv.org/abs/1606.06031).

B. Peng, J. Quesnelle, H. Fan, and E. Shippole. YaRN: Efficient context window extension of large language models. In ICLR, 2024. URL [https://openreview.net/forum?id=wHBfxhZu1u.](https://openreview.net/forum?id=wHBfxhZu1u)

B. Peng, R. Zhang, D. Goldstein, E. Alcaide, X. Du, H. Hou, J. Lin, J. Liu, J. Lu, W. Merrill, G. Song, K. Tan, S. Utpala, N. Wilce, J. S. Wind, T. Wu, D. Wuttke, and C. Zhou-Zheng. RWKV-7 "goose" with expressive dynamic state evolution. In COLM, 2025. URL [https://openreview.net/forum?id=ayB1PACN5j.](https://openreview.net/forum?id=ayB1PACN5j)

J. Pfau, W. Merrill, and S. R. Bowman. Let's think dot by dot: Hidden computation in transformer language models. In COLM, 2024. URL [https://openreview.net/forum?id=NikbrdtYvG.](https://openreview.net/forum?id=NikbrdtYvG)

V. Pyatkin, S. Malik, V. Graf, H. Ivison, S. Huang, P. Dasigi, N. Lambert, and H. Hajishirzi. Generalizing verifiable instruction following, 2025. URL [https://arxiv.org/abs/2507.02833.](https://arxiv.org/abs/2507.02833)

Qwen Team. Qwen3-Next: Towards ultimate training & inference efficiency. [https://qwen.ai/blog?id=4074cca80393150c248e508aa62983f9cb7d27cd&from=research.latest-advancements-list,](https://qwen.ai/blog?id=4074cca80393150c248e508aa62983f9cb7d27cd&from=research.latest-advancements-list) 2025. Blog post.

Qwen Team. Qwen3.5: Towards native multimodal agents. [https://qwen.ai/blog?id=qwen3.5,](https://qwen.ai/blog?id=qwen3.5) 2026. Blog post.

A. Radford and K. Narasimhan. Improving language understanding by generative pre-training, 2018. URL [https://cdn.openai.com/research-covers/language-unsupervised/language\_understanding\_paper.pdf.](https://cdn.openai.com/research-covers/language-unsupervised/language_understanding_paper.pdf)

R. Rafailov, A. Sharma, E. Mitchell, C. D. Manning, S. Ermon, and C. Finn. Direct preference optimization: Your language model is secretly a reward model. NeurIPS, 36, 2024.

<!-- page 36 of 70 -->

C. Raffel, N. M. Shazeer, A. Roberts, K. Lee, S. Narang, M. Matena, Y. Zhou, W. Li, and P. J. Liu. Exploring the limits of transfer learning with a unified text-to-text transformer, 2019. URL [https://arxiv.org/abs/1910.10683](https://arxiv.org/abs/1910.10683).

S. Rajbhandari, C. Li, Z. Yao, M. Zhang, R. Y. Aminabadi, A. A. Awan, J. Rasley, and Y. He. DeepSpeed-MoE: Advancing mixture-of-experts inference and training to power next-generation ai scale. In ICML, pages 18332–18346, 2022. URL [https://proceedings.mlr.press/v162/rajbhandari22a.html.](https://proceedings.mlr.press/v162/rajbhandari22a.html)

P. Rajpurkar, J. Zhang, K. Lopyrev, and P. Liang. SQuAD: 100,000+ questions for machine comprehension of text. In EMNLP, 2016. URL [https://aclanthology.org/D16-1264.](https://aclanthology.org/D16-1264)

S. Reddy, D. Chen, and C. D. Manning. CoQA: A conversational question answering challenge. TACL, 7:249–266, 2019. URL [https://aclanthology.org/Q19-1016.](https://aclanthology.org/Q19-1016)

M. Reid, V. Zhong, S. Gururangan, and L. Zettlemoyer. M2D2: A massively multi-domain language modeling dataset. In EMNLP, 2022. URL [https://aclanthology.org/2022.emnlp-main.63.](https://aclanthology.org/2022.emnlp-main.63)

D. Rein, B. L. Hou, A. C. Stickland, J. Petty, R. Y. Pang, J. Dirani, J. Michael, and S. R. Bowman. GPQA: A graduatelevel google-proof Q&A benchmark. In COLM, 2024. URL [https://openreview.net/forum?id=Ti67584b98.](https://openreview.net/forum?id=Ti67584b98)

L. Ren, Y. Liu, Y. Lu, Y. Shen, C. Liang, and W. Chen. Samba: Simple hybrid state space models for efficient unlimited context language modeling. In ICLR, 2025. URL [https://openreview.net/forum?id=bIlnpVM4bc.](https://openreview.net/forum?id=bIlnpVM4bc)

K. Sakaguchi, R. Le Bras, C. Bhagavatula, and Y. Choi. WinoGrande: An adversarial winograd schema challenge at scale. AAAI, 34(05):8732–8740, 2020.

M. Sap, H. Rashkin, D. Chen, R. Le Bras, and Y. Choi. Social IQa: Commonsense reasoning about social interactions. In EMNLP, 2019. URL [https://aclanthology.org/D19-1454.](https://aclanthology.org/D19-1454)

Y. Sarrof, Y. Veitsman, and M. Hahn. The expressive capacity of state space models: A formal language perspective. In The Thirty-eighth Annual Conference on Neural Information Processing Systems, 2024. URL [https://openreview.net/forum?id=eV5YIrJPdy](https://openreview.net/forum?id=eV5YIrJPdy).

W. J. Savitch. Why it might pay to assume that languages are infinite. Annals of Mathematics and Artificial Intelligence, 8:17–25, 1993. URL [https://link.springer.com/article/10.1007/BF02451546.](https://link.springer.com/article/10.1007/BF02451546)

D. Saxton, E. Grefenstette, F. Hill, and P. Kohli. Analysing mathematical reasoning abilities of neural models, 2019. URL [https://arxiv.org/abs/1904.01557](https://arxiv.org/abs/1904.01557).

I. Schlag, K. Irie, and J. Schmidhuber. Linear transformers are secretly fast weight programmers. In ICML. PMLR, 2021. URL [https://proceedings.mlr.press/v139/schlag21a.html.](https://proceedings.mlr.press/v139/schlag21a.html)

R. Shao, A. Asai, S. Z. Shen, H. Ivison, V. Kishore, J. Zhuo, X. Zhao, M. Park, S. G. Finlayson, D. Sontag, T. Murray, S. Min, P. Dasigi, L. Soldaini, F. Brahman, W.-t. Yih, T. Wu, L. Zettlemoyer, Y. Kim, H. Hajishirzi, and P. W. Koh. DR Tulu: Reinforcement learning with evolving rubrics for deep research, 2025. URL [https://arxiv.org/abs/2511.19399](https://arxiv.org/abs/2511.19399).

N. Shazeer. GLU variants improve transformer, 2020. URL [https://arxiv.org/abs/2002.05202.](https://arxiv.org/abs/2002.05202)

J. Siems, R. Grazzi, K. Kalinin, H. Ballani, and B. Rahmani. Learning state-tracking from code using linear rnns, 2026. URL [https://arxiv.org/abs/2602.14814.](https://arxiv.org/abs/2602.14814)

L. Soldaini, R. Kinney, A. Bhagia, D. Schwenk, D. Atkinson, R. Authur, B. Bogin, K. Chandu, J. Dumas, Y. Elazar, V. Hofmann, A. H. Jha, S. Kumar, L. Lucy, X. Lyu, N. Lambert, I. Magnusson, J. Morrison, N. Muennighoff, A. Naik, C. Nam, M. E. Peters, A. Ravichander, K. Richardson, Z. Shen, E. Strubell, N. Subramani, O. Tafjord, P. Walsh, L. Zettlemoyer, N. A. Smith, H. Hajishirzi, I. Beltagy, D. Groeneveld, J. Dodge, and K. Lo. Dolma: an open corpus of three trillion tokens for language model pretraining research, 2024. URL [https://arxiv.org/abs/2402.00159.](https://arxiv.org/abs/2402.00159)

L. Strobl, W. Merrill, G. Weiss, D. Chiang, and D. Angluin. What formal languages can transformers express? a survey. TACL, 12:543–561, 2024. doi: 10.1162/tacl\_a\_00663. URL [https://aclanthology.org/2024.tacl-1.30/](https://aclanthology.org/2024.tacl-1.30/).

J. Su, M. Ahmed, Y. Lu, S. Pan, W. Bo, and Y. Liu. RoFormer: Enhanced transformer with rotary position embedding. Neurocomputing, 568:127063, 2024. doi: 10.1016/j.neucom.2023.127063. URL [https://doi.org/10.1016/j.neucom.2023.127063](https://doi.org/10.1016/j.neucom.2023.127063).

Y. Sun, S. Hu, G. Zhou, K. Zheng, H. Hajishirzi, N. Dziri, and D. X. Song. OMEGA: Can LLMs reason outside the box in math? evaluating exploratory, compositional, and transformative generalization, 2025. URL [https://arxiv.org/abs/2506.18880](https://arxiv.org/abs/2506.18880).

R. S. Sutton. The bitter lesson. [https://heartyhaven.github.io/files/bitter\_lesson.pdf,](https://heartyhaven.github.io/files/bitter_lesson.pdf) 2019.

<!-- page 37 of 70 -->

M. Suzgun, N. Scales, N. Schärli, S. Gehrmann, Y. Tay, H. W. Chung, A. Chowdhery, Q. V. Le, E. H. Chi, D. Zhou, and J. Wei. Challenging BIG-Bench tasks and whether chain-of-thought can solve them, 2022. URL [https://arxiv.org/abs/2210.09261](https://arxiv.org/abs/2210.09261).

A. Talmor, J. Herzig, N. Lourie, and J. Berant. CommonsenseQA: A question answering challenge targeting commonsense knowledge. In NAACL, 2019. URL [https://aclanthology.org/N19-1421.](https://aclanthology.org/N19-1421)

A. Terzic, N. Menet, M. Hersche, T. Hofmann, and A. Rahimi. Structured sparse transition matrices to enable state tracking in state-space models. In NeurIPS, 2025. URL [https://openreview.net/forum?id=RDbuSCWhad.](https://openreview.net/forum?id=RDbuSCWhad)

V. Vapnik. Principles of risk minimization for learning theory. In NeurIPS, pages 831–838, 1991. URL [https://proceedings.neurips.cc/paper/1991/hash/ff4d5fbbafdf976cfdc032e3bde78de5-Abstract.html.](https://proceedings.neurips.cc/paper/1991/hash/ff4d5fbbafdf976cfdc032e3bde78de5-Abstract.html)

A. Vaswani, N. Shazeer, N. Parmar, J. Uszkoreit, L. Jones, A. N. Gomez, Ł. Kaiser, and I. Polosukhin. Attention is all you need. In NeurIPS, volume 30, 2017. URL [https://proceedings.neurips.cc/paper\_files/paper/2017/file/3f5ee243547dee91fbd053c1c4a845aa-Paper.pdf.](https://proceedings.neurips.cc/paper_files/paper/2017/file/3f5ee243547dee91fbd053c1c4a845aa-Paper.pdf)

R. Waleffe, W. Byeon, D. Riach, B. Norick, V. Korthikanti, T. Dao, A. Gu, A. Hatamizadeh, S. Singh, D. Narayanan, G. Kulshreshtha, V. Singh, J. Casper, J. Kautz, M. Shoeybi, and B. Catanzaro. An empirical study of mamba-based language models, 2024. URL [https://arxiv.org/abs/2406.07887.](https://arxiv.org/abs/2406.07887)

Y. Wang, X. Ma, G. Zhang, Y. Ni, A. Chandra, S. Guo, W. Ren, A. Arulraj, X. He, Z. Jiang, et al. MMLU-Pro: A more robust and challenging multi-task language understanding benchmark, 2024. URL [https://arxiv.org/abs/2406.01574](https://arxiv.org/abs/2406.01574).

J. Welbl, N. F. Liu, and M. Gardner. Crowdsourcing multiple choice science questions. In W-NUT, 2017. URL [https://aclanthology.org/W17-4413/](https://aclanthology.org/W17-4413/).

K. Wen, X. Dang, and K. Lyu. RNNs are not transformers (yet): The key bottleneck on in-context retrieval. In ICLR, 2025a. URL [https://openreview.net/forum?id=h3wbI8Uk1Z.](https://openreview.net/forum?id=h3wbI8Uk1Z)

K. Wen, Z. Li, J. S. Wang, D. L. W. Hall, P. Liang, and T. Ma. Understanding warmup-stable-decay learning rates: A river valley loss landscape view. In ICLR, 2025b. URL [https://openreview.net/forum?id=m51BgoqvbP.](https://openreview.net/forum?id=m51BgoqvbP)

A. G. Wilson. Position: Deep learning is not so mysterious or different. In ICML Position Paper Track, 2025. URL [https://openreview.net/forum?id=42Au7FoD8F.](https://openreview.net/forum?id=42Au7FoD8F)

G. Yang, J. B. Simon, and J. Bernstein. A spectral condition for feature learning, 2024a. URL [https://arxiv.org/abs/2310.17813](https://arxiv.org/abs/2310.17813).

S. Yang and Y. Zhang. FLA: A triton-based library for hardware-efficient implementations of linear attention mechanism, 2024. URL [https://github.com/fla-org/flash-linear-attention.](https://github.com/fla-org/flash-linear-attention)

S. Yang, B. Wang, Y. Shen, R. Panda, and Y. Kim. Gated linear attention transformers with hardware-efficient training. In ICML, 2024b. URL [https://proceedings.mlr.press/v235/yang24ab.html.](https://proceedings.mlr.press/v235/yang24ab.html)

S. Yang, B. Wang, Y. Zhang, Y. Shen, and Y. Kim. Parallelizing linear transformers with the delta rule over sequence length. In NeurIPS, 2024c. URL [https://openreview.net/forum?id=y8Rm4VNRPH.](https://openreview.net/forum?id=y8Rm4VNRPH)

S. Yang, J. Kautz, and A. Hatamizadeh. Gated delta networks: Improving mamba2 with delta rule, 2025a. URL [https://arxiv.org/abs/2412.06464](https://arxiv.org/abs/2412.06464).

S. Yang, Y. Shen, K. Wen, S. Tan, M. Mishra, L. Ren, R. Panda, and Y. Kim. PaTH attention: Position encoding via accumulating householder transformations. In NeurIPS, 2025b. URL [https://openreview.net/forum?id=ZBlHEeSvKd](https://openreview.net/forum?id=ZBlHEeSvKd).

R. Zellers, A. Holtzman, Y. Bisk, A. Farhadi, and Y. Choi. HellaSwag: Can a machine really finish your sentence? In ACL, 2019. URL [https://aclanthology.org/P19-1472.](https://aclanthology.org/P19-1472)

B. Zhang and R. Sennrich. Root mean square layer normalization. In NeurIPS, 2019. URL [https://papers.nips.cc/paper\_files/paper/2019/hash/1e8a19426224ca89e83cef47f1e7f53b-Abstract.html.](https://papers.nips.cc/paper_files/paper/2019/hash/1e8a19426224ca89e83cef47f1e7f53b-Abstract.html)

J. Zhou, T. Lu, S. Mishra, S. Brahma, S. Basu, Y. Luan, D. Zhou, and L. Hou. Instruction-following evaluation for large language models, 2023. URL [https://arxiv.org/abs/2311.07911.](https://arxiv.org/abs/2311.07911)

T. Y. Zhuo, M. C. Vu, J. Chim, H. Hu, W. Yu, R. Widyasari, I. N. B. Yusuf, H. Zhan, J. He, I. Paul, et al. BigCodeBench: Benchmarking code generation with diverse function calls and complex instructions, 2024. URL [https://arxiv.org/abs/2406.15877](https://arxiv.org/abs/2406.15877).

<!-- page 38 of 70 -->

J. Zuo, M. Velikanov, D. E. Rhaiem, I. Chahed, Y. Belkada, G. Kunsch, and H. Hacid. Falcon Mamba: The first competitive attention-free 7B language model, 2024. URL [https://arxiv.org/abs/2410.05355.](https://arxiv.org/abs/2410.05355)

J. Zuo, M. Velikanov, I. Chahed, Y. Belkada, D. E. Rhayem, G. Kunsch, H. Hacid, H. Yous, B. Farhat, I. Khadraoui, et al. Falcon-H1: A family of hybrid-head language models redefining efficiency and performance, 2025. URL [https://arxiv.org/abs/2507.22448](https://arxiv.org/abs/2507.22448).

<!-- page 39 of 70 -->

Table 9 Rough training throughput measurements run before launching the Olmo Hybrid pretraining run.

表 9 启动 Olmo Hybrid 预训练前做的粗略训练吞吐测量.

<table><tr><td>Model</td><td># Heads</td><td> $d_{model}$ </td><td># Parameters</td><td>Training Throughput (TPS)</td></tr><tr><td>Olmo 3</td><td>32</td><td>4096</td><td>6.8B</td><td>8.0K</td></tr><tr><td rowspan="3">Olmo Hybrid</td><td>32</td><td>4096</td><td>7.7B</td><td>7.7K</td></tr><tr><td>31</td><td>3968</td><td>7.4B</td><td>7.7K</td></tr><tr><td>30</td><td>3840</td><td>7.0B</td><td>8.2K</td></tr></table>

## A Training Olmo Hybrid

We elaborate on experiments and implementation details in the development of Olmo Hybrid.

本附录展开 Olmo Hybrid 开发过程中的实验与实现细节.

### A.1 Pretraining

Each Olmo Hybrid GDN head is sized proportionately to an Olmo 3 attention head. In line with standard mappings from attention to GDN<sup>10</sup> this means that the size of the query and key becomes $d = 3 / 4 \cdot 1 2 8 = 9 6$ Similarly, the size of the value becomes 2d = 192.

每个 Olmo Hybrid GDN 头按 Olmo 3 注意力头的尺寸等比设定. 按注意力到 GDN 的标准映射<sup>10</sup>, query 与 key 的维度变为 $d = 3 / 4 \cdot 1 2 8 = 9 6$, value 维度相应为 2d = 192.

We used the Flash Linear Attention (Yang and Zhang, 2024) implementation of Gated DeltaNet. In particular, we used the default parameter implemented when instantiating single layer directly (as opposed to the model-level initialization).

Gated DeltaNet 的实现取自 Flash Linear Attention (Yang and Zhang, 2024). 具体地, 我们用的是直接实例化单层时的默认参数初始化, 而不是模型级初始化.

Beyond the individual GDN heads, the overall architecture is roughly the same Olmo 3 7B (Olmo Team, 2025) with a few small tweaks to the architecture, learning rate schedule and training data:

GDN 头之外, 整体架构与 Olmo 3 7B (Olmo Team, 2025) 大体相同, 只在架构, 学习率调度与训练数据上做了几处小调整:

• We removed two heads from the model to make Olmo 3 and Olmo Hybrid more comparable in parameter count and training throughput (see below).

• Rather than using the ad-hoc piecewise learning rate schedule from Olmo 3 7B (Olmo Team, 2025), we use a standard cosine decay to 10% of the maximum learning rate. However, the learning rate schedules still match closely for the majority of training, especially towards the beginning.

• For data, we use the improved data mix from Olmo 3 32B rather than the data mix from Olmo 3 7B—in preliminary experiments, we ran with the Olmo 3 7B data mix and saw similar trends in pretraining evaluation metrics toward the beginning of training.

• 去掉两个头, 使 Olmo 3 与 Olmo Hybrid 在参数量和训练吞吐上更可比 (见下文).

• 不沿用 Olmo 3 7B (Olmo Team, 2025) 临时拼出的分段学习率调度, 改用标准 cosine 衰减到最大学习率的 10%. 两条调度在训练大部分时段仍贴得很近, 前期尤其如此.

• 数据用 Olmo 3 32B 的改进混合, 不用 Olmo 3 7B 的混合. 预实验里用 Olmo 3 7B 混合跑过, 训练前期的预训练评测指标走势相近.

The GDN architecture and 3:1 hybridization ratio were chosen based on early experiments at the scale of 1B parameters and 100B tokens. We replicate those early experiments as carefully controlled architecture ablations in Section 5.1.

GDN 架构与 3:1 混合比是依据 1B 参数,100B token 规模的早期实验选定的. §5.1 把这些早期实验复现为严格控制的架构消融.

The model was trained on 512 GPUs. At the beginning of training, these were H100s, but roughly halfway through pretraining we migrated to 512 B200s.

模型在 512 张 GPU 上训练. 起初是 H100, 预训练大约过半时迁到 512 张 B200.

**Training Throughput.** We calibrated training throughput to be comparable to that of Olmo 3 in initial experiments by removing individual heads until it closely matched the transformer. Concretely, we benchmarked model size and throughput for several training configurations running on 128 H100s. As shown in Table 9, the hybrid model with 2 heads removed closely matches the Olmo 3 transformer in terms of parameters and slightly outperforms it in terms of training throughput. We therefore selected a hybrid architecture with 30 heads for the Olmo Hybrid 7B training run.

**训练吞吐.** 初期实验中, 我们逐个去掉头, 直到训练吞吐与 Transformer 接近, 以此把吞吐校准到与 Olmo 3 可比. 具体做法是在 128 张 H100 上对几种训练配置测模型大小与吞吐. 如表 9, 去掉 2 个头的 hybrid 在参数量上与 Olmo 3 Transformer 接近, 训练吞吐略高. 因此 Olmo Hybrid 7B 训练选了 30 个头的 hybrid 架构.

> **看表:** Tab. 9 里 31 头已把参数压到 7.4B, 为何还要再砍到 30 头?
> 31 头的吞吐是 7.7K TPS, 仍低于 Olmo 3 的 8.0K; 30 头为 7.0B,8.2K TPS, 参数最接近 6.8B, 吞吐也反超. 选 30 头同时对齐了参数量和吞吐两个维度, 只看参数量的话 31 头还不够.

**Training Stability.** To estimate the stability of Olmo training runs, we compute a spike score as an objective measure. Concretely, we define the spike score as the percentage of values in a time series that are at least six standard deviations away from a rolling average of the last 128 values. We use spike score on the L2 norm of

**训练稳定性.** 为估计 Olmo 训练的稳定性, 我们算一个 spike score 作客观度量. 具体定义为: 时间序列中偏离最近 128 个值滚动均值至少六个标准差的值所占百分比. 我们把 spike score 用在梯度的 L2 范数上

<small><span class="docvortex-page-footnote" data-block-type="page_footnote" style="color:#6b7280">10<a href="https://github.com/fla-org/flash-linear-attention/blob/f24317a6a4f513748cd7eb05818534ce66029957/fla/layers/gated_deltanet.py#L40"><sub>https</sub>://github.com/fla-org/flash-linear-attention/blob/f24317a6a4f513748cd7eb05818534ce66029957/fla/layers/ gated\_deltanet.py#L40</a></span></small>

<!-- page 40 of 70 -->

Gradient Norm SpikeScore Over Training

![Chart block](images/p40-figure-13-spikescore-grows-throughout-training-for-olmo.png)

Figure 13 SpikeScore grows throughout training for Olmo 3, but it stays more stable when training Olmo Hybrid.

图 13 Olmo 3 的 SpikeScore 在整个训练中持续上升, Olmo Hybrid 则保持平稳.

the gradient. This is a slight modification from the method used in Olmo Team (2024), leading to slightly higher scores.

(接上页) 这一做法对 Olmo Team (2024) 的方法略有改动, 得分会略高.

Figure 13 shows that Olmo 3 exhibits a high and growing number of spikes in the gradient norm, while Olmo Hybrid shows a lower, flat trajectory. We take this as preliminary evidence that the Olmo Hybrid architecture may be more stable (i.e., more tolerant of large learning rates and noisy data) compared to Olmo 3.

图 13 显示 Olmo 3 梯度范数的尖峰多且越来越多, Olmo Hybrid 则低而平. 我们把这看作初步证据: 相比 Olmo 3, Olmo Hybrid 架构可能更稳定, 即更能承受大学习率与带噪数据.

> **想:** Fig. 13 的 SpikeScore 是 「偏离滚动均值 6 个标准差」 的比例, 而这个滚动窗口只有 128 个值; Hybrid 曲线平, 能直接说它更稳吗?
> 作者措辞是 「preliminary evidence」 与 「may be more stable」. 这个度量只看梯度 L2 范数, 且相对 Olmo Team (2024) 的做法已有改动, 分数偏高. 两条曲线用的是同一口径, 横向比有效; 至于能否承受更大学习率, 文中没有做对应实验.

### A.2 Mid-Training and Long Context Extension

**Mid-Training.** We adapt our mid-training procedure from Olmo 3 (Olmo Team, 2025), using the Olmo 3 32B mid-training data (the Olmo 3 7B mid-training data mixture with additional light filtering applied). One notable change is a doubled batch size, motivated by recent insights into the relationship between learning rate and batch size (Merrill et al., 2025). Following the Olmo 3 32B recipe, we perform two independent mid-training runs on separate 100B token subsets of Dolma 3 Dolmino Mix and merge the resulting checkpoints.

**Mid-Training.** Mid-training 流程改自 Olmo 3 (Olmo Team, 2025), 数据用 Olmo 3 32B 的 mid-training 数据 (即 Olmo 3 7B 的 mid 混合再加一层轻过滤). 一处明显改动是 batch 加倍, 依据是近期对学习率与 batch 关系的认识 (Merrill et al., 2025). 按 Olmo 3 32B 的配方, 在 Dolma 3 Dolmino Mix 的两个不同 100B token 子集上各跑一次独立 mid-training, 再合并得到的检查点.

**Long Context Extension.** After mid-training, we extend context length by continuing training on 100B tokens of Dolma 3 Longmino Mix. We compare two positional encoding strategies for this stage. The first is YaRN (Peng et al., 2024), which was also used for Olmo 3 (Olmo Team, 2025). YaRN modifies the RoPE frequency basis by partitioning dimensions according to frequency: low-frequency components (encoding longer-range position) are interpolated to cover the target context length, while high-frequency components (encoding local position) are left unchanged. An attention temperature factor corrects for the shift in attention logit magnitudes introduced by the interpolation. The second is DroPE (Gelberg et al., 2025), which removes RoPE entirely during long-context extension. The model then relies on the causal attention mask and any positional signal already captured in its weights. The motivation is that RoPE's rotation frequencies, fit to shorter contexts during pretraining, can limit extrapolation to longer sequences; dropping them removes this constraint.

**长上下文扩展.** Mid-training 之后, 在 Dolma 3 Longmino Mix 的 100B token 上继续训练以扩展上下文长度. 这一阶段比较了两种位置编码策略. 第一种是 YaRN (Peng et al., 2024), Olmo 3 (Olmo Team, 2025) 也用它. YaRN 按频率划分维度来改 RoPE 的频率基: 低频分量 (编码较远距离的位置) 做插值以覆盖目标上下文长度, 高频分量 (编码局部位置) 保持不变. 再用一个注意力温度因子, 校正插值带来的注意力 logit 量级偏移. 第二种是 DroPE (Gelberg et al., 2025), 在长上下文扩展时整个去掉 RoPE. 此后模型依靠因果注意力掩码, 以及权重里已经学到的位置信号. 动机是: RoPE 的旋转频率是在预训练的较短上下文上拟合的, 会限制向更长序列外推; 去掉它就去掉了这层约束.

Both strategies produce strong long-context results for Olmo Hybrid (Table 3), but DroPE shows a clear advantage at the longest evaluation lengths (e.g., 85.0 vs. 76.9 on RULER 64k). We attribute this in part to the hybrid architecture: the GDN layers carry implicit positional information through their recurrent structure, so the attention layers are less dependent on explicit positional encodings like RoPE. We therefore adopt DroPE for the released Olmo Hybrid checkpoint.

两种策略都让 Olmo Hybrid 取得了强长上下文结果 (表 3), 但在最长评测长度上 DroPE 优势明显 (如 RULER 64k 上 85.0 对 76.9). 我们把部分原因归于 hybrid 架构: GDN 层通过递归结构携带隐式位置信息, 注意力层因此不那么依赖 RoPE 这类显式位置编码. 所以发布的 Olmo Hybrid 检查点采用 DroPE.

To train at these longer sequence lengths, we implemented Ulysses-style context parallelism (Jacobs et al.,

为在这些更长序列上训练, 我们在注意力层与 GDN 层都实现了 Ulysses 式上下文并行 (Jacobs et al.,

<!-- page 41 of 70 -->

2023) through both the attention and GDN layers. Ulysses distributes the sequence across devices and uses all-to-all communication to transpose from a sequence-parallel layout to a head-parallel layout before each layer. After the all-to-all, each device holds the full sequence for a subset of heads, which suffices for both attention (where each head attends independently) and GDN (where the recurrent state update in Definition 1 is also per-head). The short depthwise convolutions (kernel size 4) applied to the q, k, and v streams in GDN layers operate per-channel along the sequence dimension; since channels are partitioned across heads, the convolution weights must be sharded consistently with the head assignment on each device.

(接上页) 2023). Ulysses 把序列切分到多张设备上, 每层之前用 all-to-all 通信把序列并行布局转置成按头并行布局. all-to-all 之后, 每张设备持有一部分头的完整序列. 这对注意力 (各头独立做 attention) 和 GDN (Definition 1 中的递归状态更新同样按头进行) 都够用. GDN 层对 q, k, v 流施加的短 depthwise 卷积 (kernel size 4) 沿序列维逐通道计算; 通道按头划分, 所以每张设备上的卷积权重必须按该设备的头分配一致地切分.

### A.3 Post-Training

Table 10 Training hyperparameters for Olmo Hybrid 7B. Total tokens includes masked tokens (e.g. prompts). Think SFT total tokens is computed from the Olmo 3 baseline (45.4B) plus the 3× tool-use upscale: $45.4B × (1+2 × 2.47\%)=47.6B$

表 10 Olmo Hybrid 7B 的训练超参数. Total tokens 包含被 mask 掉的 token (如 prompt). Think SFT 的总 token 数由 Olmo 3 基线 (45.4B) 加上 3× 的工具调用上采样算出: $45.4B × (1+2 × 2.47\%)=47.6B$

|  | 7BThinkSFT | 7BInstructSFT | 7BInstructDPO |
| --- | --- | --- | --- |
| Instances | 2,932,239 | 2,153,716 | 259,922 |
| Total Tokens | 47.6B | 3.4B | N/A |
| Batch Size | 1M tokens | 1M tokens | N/A |
| Learning Rate | 2.5 × 10<sup>-5</sup> | 2.5 × 10<sup>-5</sup> | 1 × 10<sup>-6</sup> |
| Num. GPUs | 64 | 64 | 32 |
| Max Sequence Length | 32K | 32K | 16K |
| Epochs | 2 | 2 | 1 |
| Loss | - | - | DPO Norm (β=5) |

Table 11 Differences between Olmo 3 and Olmo Hybrid SFT training configurations.

表 11 Olmo 3 与 Olmo Hybrid 在 SFT 训练配置上的差异.

|  | Olmo3 | OlmoHybrid |
| --- | --- | --- |
| Data Parallel | HSDP (shard within node) | FSDP (full sharding) |
| Context Parallel | Ring (degree = 8) | Ulysses (degree = 2) |
| Activation Checkpointing | Selected modules (feed_forward) | Budget-based (0.1) |

Table 10 summarizes the hyperparameters used for the Olmo Hybrid 7B model variants. Table 11 highlights the key configuration differences between the Olmo 3 and Olmo Hybrid SFT training setups, primarily involving changes to the parallelism strategy and activation checkpointing. The SFT models were trained with [OLMo-core](https://github.com/allenai/OLMo-core), and the DPO model was trained with [Open-Instruct](https://github.com/allenai/open-instruct/tree/main).

表 10 汇总了 Olmo Hybrid 7B 各个变体使用的超参数. 表 11 列出 Olmo 3 与 Olmo Hybrid 在 SFT 训练设置上的主要配置差异, 集中在并行策略和激活检查点两处. SFT 模型用 [OLMo-core](https://github.com/allenai/OLMo-core) 训练, DPO 模型用 [Open-Instruct](https://github.com/allenai/open-instruct/tree/main) 训练.

### A.4 Evaluation Details

We evaluate Olmo Hybrid using the same evaluation suite as OLMo 3 (Olmo Team, 2025). Table 12 describes the base evaluation configuration and Table 13 describes the post-training evaluation configuration.

Olmo Hybrid 的评测沿用 OLMo 3 (Olmo Team, 2025) 的同一套评测. 表 12 给出 base 模型的评测配置, 表 13 给出后训练模型的评测配置.

## B Proofs: Expressive Power of Hybrid Models

Throughout this section, we assume by default that complexity classes $( \mathrm { e . g . , \; \mathsf { T C } ^ { 0 } } )$ refer to their FO-uniform variants (i.e., FO-uniform $\mathsf { T C } ^ { 0 } )$ . We formalize bounded precision to mean logarithmic precision, i.e., on input sequences of length $n ,$ we compute our model with c log n bits of precision, for some c.

本节默认所有复杂度类 (如 $\mathsf{TC}^0$) 都指其 FO-uniform 版本 (即 FO-uniform $\mathsf{TC}^0$). 有界精度一律形式化为对数精度: 输入序列长度为 $n$ 时, 模型以 c log n 位精度计算, c 为某个常数.

Theoretical analysis of transformers makes various assumptions about the types of attention allowed (Hao et al., 2022; Strobl et al., 2024). In our results, we will consider two types. First, we will consider unique-hardattention transformers (UHATs), where attention can only attend to one unique position. Additionally, we will consider averaging-hard-attention transformers (AHATs), where attention weight is uniformly distributed over all positions that maximize the attention score. Our AHAT definition also allows masked pre-norm as in

对 Transformer 做理论分析时, 各家对允许的注意力类型有不同假设 (Hao et al., 2022; Strobl et al., 2024). 我们的结果考虑两类. 第一类是 unique-hard-attention transformer (UHAT), 注意力只能落在唯一一个位置上. 第二类是 averaging-hard-attention transformer (AHAT), 注意力权重在所有使注意力分数取最大值的位置上均匀分布. 我们的 AHAT 定义还允许 masked pre-norm, 做法同

41

> **核对:** Tab. 10 Think SFT total tokens 写成 47.6B, 公式是 45.4B×(1+2×2.47%); 2×2.47% 对应什么 upscale?
> 表注写明: 相对 Olmo 3 baseline 45.4B, 再加 3× tool-use upscale, 公式 45.4B×(1+2×2.47%)=47.6B.

<!-- page 42 of 70 -->

<table><tr><td colspan="2">Task</td><td>ICL</td><td>Format</td><td>Metric</td><td>Temp</td><td>Top-p</td><td>Max toks</td><td>P@k (n)</td><td># sub</td></tr><tr><td colspan="10">Base Main Suite</td></tr><tr><td rowspan="3">Math</td><td>GSM8K* (2021)</td><td> $8^{\alpha}$ </td><td>CoT EM</td><td>pass@k</td><td>0.6</td><td>0.6</td><td>512</td><td>1, 4 (8)</td><td>-</td></tr><tr><td>GSM Symbolic* (2024)</td><td> $8^{\alpha}$ </td><td>CoT EM</td><td>pass@k</td><td>0.6</td><td>0.6</td><td>512</td><td>1, 4 (8)</td><td>3</td></tr><tr><td>MATH 500* (2022; 2023)</td><td> $4^{\alpha}$ </td><td>CoT EM</td><td>pass@k</td><td>0.6</td><td>0.6</td><td>1024</td><td>1, 16 (32)</td><td>-</td></tr><tr><td rowspan="7">Code</td><td>HumanEval* (2021)</td><td>3</td><td>Code Exec</td><td>pass@k</td><td>0.6</td><td>0.6</td><td>512</td><td>1, 16 (32)</td><td>-</td></tr><tr><td>MBPP* (2021)</td><td>3</td><td>Code Exec</td><td>pass@k</td><td>0.6</td><td>0.6</td><td>512</td><td>1, 16 (32)</td><td>-</td></tr><tr><td>BigCodeBench* (2024)</td><td>3</td><td>Code Exec</td><td>pass@k</td><td>0.6</td><td>0.6</td><td>1280</td><td>1 (5)</td><td>-</td></tr><tr><td>DS 1000* (2022)</td><td>3</td><td>Code Exec</td><td>pass@k</td><td>0.6</td><td>0.6</td><td>1024</td><td>1 (5)</td><td>-</td></tr><tr><td>Deepseek LeetCode* (2024)</td><td>0</td><td>Code Exec</td><td>pass@k</td><td>0.6</td><td>0.6</td><td>512</td><td>1, 16 (32)</td><td>-</td></tr><tr><td>MultiPL-E HumanEval* (2022)</td><td>0</td><td>Code Exec</td><td>pass@k</td><td>0.6</td><td>0.6</td><td>1024</td><td>1, 16 (32)</td><td>6</td></tr><tr><td>MultiPL-E MBPP* (2022)</td><td>0</td><td>Code Exec</td><td>pass@k</td><td>0.6</td><td>0.6</td><td>1024</td><td>1, 16 (32)</td><td>6</td></tr><tr><td rowspan="5">STEM QA</td><td>ARC (2018)</td><td>5</td><td>MC</td><td>Acc</td><td>-</td><td>-</td><td>-</td><td>-</td><td>2</td></tr><tr><td>MMLU STEM (2021)</td><td>5</td><td>MC</td><td>Acc</td><td>-</td><td>-</td><td>-</td><td>-</td><td>19</td></tr><tr><td>MedMCQA* (2022)</td><td>5</td><td>MC</td><td>Acc</td><td>-</td><td>-</td><td>-</td><td>-</td><td>-</td></tr><tr><td>MedQA* (2021)</td><td>5</td><td>MC</td><td>Acc</td><td>-</td><td>-</td><td>-</td><td>-</td><td>-</td></tr><tr><td>SciQ* (2017)</td><td>5</td><td>MC</td><td>Acc</td><td>-</td><td>-</td><td>-</td><td>-</td><td>-</td></tr><tr><td rowspan="12">Non-STEM QA</td><td>MMLU Humanities (2021)</td><td>5</td><td>MC</td><td>Acc</td><td>-</td><td>-</td><td>-</td><td>-</td><td>13</td></tr><tr><td>MMLU Social Sci. (2021)</td><td>5</td><td>MC</td><td>Acc</td><td>-</td><td>-</td><td>-</td><td>-</td><td>12</td></tr><tr><td>MMLU Other (2021)</td><td>5</td><td>MC</td><td>Acc</td><td>-</td><td>-</td><td>-</td><td>-</td><td>14</td></tr><tr><td>CSQA (2019)</td><td>5</td><td>MC</td><td>Acc</td><td>-</td><td>-</td><td>-</td><td>-</td><td>-</td></tr><tr><td>PiQA (2020)</td><td>5</td><td>MC</td><td>Acc</td><td>-</td><td>-</td><td>-</td><td>-</td><td>-</td></tr><tr><td>SocialIQA (2019)</td><td>5</td><td>MC</td><td>Acc</td><td>-</td><td>-</td><td>-</td><td>-</td><td>-</td></tr><tr><td>DROP Gen2MC* (introduced in Olmo Team (2025); 2019)</td><td>5</td><td>MC</td><td>Acc</td><td>-</td><td>-</td><td>-</td><td>-</td><td>-</td></tr><tr><td>Jeopardy Gen2MC* (introduced in Olmo Team (2025); 2024)</td><td>5</td><td>MC</td><td>Acc</td><td>-</td><td>-</td><td>-</td><td>-</td><td>-</td></tr><tr><td>NaturalQs Gen2MC* (introduced in Olmo Team (2025); 2019)</td><td>5</td><td>MC</td><td>Acc</td><td>-</td><td>-</td><td>-</td><td>-</td><td>-</td></tr><tr><td>SQuAD Gen2MC* (introduced in Olmo Team (2025); 2016)</td><td>5</td><td>MC</td><td>Acc</td><td>-</td><td>-</td><td>-</td><td>-</td><td>-</td></tr><tr><td>CoQA Gen2MC* (introduced in Olmo Team (2025); 2019)</td><td> $0^{\dagger}$ </td><td>MC</td><td>Acc</td><td>-</td><td>-</td><td>-</td><td>-</td><td>-</td></tr><tr><td>Basic Skills* (introduced in Olmo Team (2025))</td><td>5</td><td>MC</td><td>Acc</td><td>-</td><td>-</td><td>-</td><td>-</td><td>6</td></tr><tr><td rowspan="9">GenQA</td><td>HellaSwag (2019)</td><td>5</td><td> $RC_{per-char}$ </td><td>Acc</td><td>-</td><td>-</td><td>-</td><td>-</td><td>-</td></tr><tr><td>WinoGrande (2020)</td><td>5</td><td> $RC_{none}$ </td><td>Acc</td><td>-</td><td>-</td><td>-</td><td>-</td><td>-</td></tr><tr><td>Lambada (2016)</td><td>0</td><td> $RC_{per-char}$ </td><td>Acc</td><td>-</td><td>-</td><td>-</td><td>-</td><td>-</td></tr><tr><td>Basic Skills* (introduced in Olmo Team (2025))</td><td>5</td><td> $RC_{per-token}$ </td><td>Acc</td><td>-</td><td>-</td><td>-</td><td>-</td><td>6</td></tr><tr><td>DROP (2019)</td><td>5</td><td>GenQA</td><td>F1</td><td>0</td><td>1</td><td>100</td><td>-</td><td>-</td></tr><tr><td>Jeopardy (2024)</td><td>5</td><td>GenQA</td><td>F1</td><td>0</td><td>1</td><td>50</td><td>-</td><td>-</td></tr><tr><td>NaturalQs (2019)</td><td>5</td><td>GenQA</td><td>F1</td><td>0</td><td>1</td><td>50</td><td>-</td><td>-</td></tr><tr><td>SQuAD (2016)</td><td>5</td><td>GenQA</td><td>F1</td><td>0</td><td>1</td><td>50</td><td>-</td><td>-</td></tr><tr><td>CoQA (2019)</td><td> $0^{\dagger}$ </td><td>GenQA</td><td>F1</td><td>0</td><td>1</td><td>50</td><td>-</td><td>-</td></tr><tr><td colspan="10">Base Held-out Suite</td></tr><tr><td rowspan="4"></td><td>MMLU Pro (2024)</td><td>5</td><td>MC</td><td>Acc</td><td>-</td><td>-</td><td>-</td><td>-</td><td>13</td></tr><tr><td>LBPP* (2024)</td><td>0</td><td>Code Exec</td><td>pass@k</td><td>0.6</td><td>0.6</td><td>4096</td><td>1 (32)</td><td>-</td></tr><tr><td>Deepmind Math* (2019)</td><td>5</td><td>CoT EM</td><td>pass@k</td><td>0.6</td><td>0.6</td><td>2048</td><td>1 (1)</td><td>-</td></tr><tr><td>BigBench Hard (2022)</td><td>3</td><td>CoT EM</td><td>Acc</td><td>0.6</td><td>0.6</td><td>512</td><td>1 (1)</td><td>55</td></tr></table>

Table 12 Details of the base evaluation suite, as used in OLMo 3 (Olmo Team, 2025). Tasks were formatted as multiple-choice (MC), rank choice (RC), short-form generative (GenQA), chain-of-thought with exact-match scoring (CoT EM), or code execution (Code Exec). We use \* to indicate additions to the OLMo 2 (Olmo Team, 2024) base suite, <sup>†</sup>for tasks with few-shot examples already specified within each instance, and <sup>α</sup>for tasks with human-written few-shot examples.

表 12 base 评测套件的细节, 与 OLMo 3 (Olmo Team, 2025) 所用一致. 任务格式分为多选 (MC), rank choice (RC), 短答生成 (GenQA), CoT 加精确匹配打分 (CoT EM), 以及代码执行 (Code Exec). \* 表示相对 OLMo 2 (Olmo Team, 2024) base 套件新增的任务, <sup>†</sup> 表示每条样本内已自带 few-shot 示例的任务, <sup>α</sup> 表示 few-shot 示例由人工编写的任务.

Merrill and Sabharwal (2025, Section 2.1). Our constructions for UHATs also work for AHATs, but we state them for UHATs for more generality.

(接上页) Merrill and Sabharwal (2025, Section 2.1). 我们针对 UHAT 的构造对 AHAT 同样成立, 但为了结论更一般, 统一按 UHAT 陈述.

We first establish the negative side of the main theorems (Theorem 1 and corollary 3.1) via core lemmas in Section B.1. We then complete the proofs by giving explicit constructions for hybrid models solving these problems. Finally, we turn to giving a complete padded characterization.

我们先在 B.1 节用两个核心引理确立主定理 (定理 1 与推论 3.1) 的否定部分, 再给出求解这些问题的 hybrid 模型的显式构造, 完成证明. 最后给出一个完整的 padded 刻画.

### B.1 Limitations of Transformers and RNNs

We will now formalize the limitations of transformers and RNNs on several problems of interest via two core lemmas. The same problems are inexpressible for these architectures for different reasons. In the case of transformers, it is because these problems are inherently sequential, which we formalize via circuit complexity. In the case of RNNs, it is because they require remembering a significant amount of information from the prefix of the string, which we formalize using communication complexity.

下面用两个核心引理, 把 Transformer 和 RNN 在几个关注问题上的局限形式化. 同一批问题, 两种架构表达不了的原因各不相同. 对 Transformer, 原因是这些问题本质上是顺序的, 我们用电路复杂度来刻画. 对 RNN, 原因是需要记住字符串前缀里相当多的信息, 我们用通信复杂度来刻画.

We first establish the inability of fixed-depth transformers (both AHAT and UHAT) to express the key

先证明固定深度的 Transformer (AHAT 与 UHAT 都在内) 表达不了定理 1 与推论 3.1 中提到的那些关键

<!-- page 43 of 70 -->

<table><tr><td>Task</td><td>Format</td><td>Metric</td><td>Temp</td><td>Top-p</td><td>Ans. Extract</td><td>Max Toks</td><td>N</td><td># Sub</td></tr><tr><td colspan="9">Chat Suite</td></tr><tr><td>IF Eval (2023)</td><td>CoT</td><td>Custom</td><td>0.6</td><td>0.95</td><td>Custom</td><td>32768</td><td>1</td><td>-</td></tr><tr><td>IFBench (2025)</td><td>CoT</td><td>Custom</td><td>0.6</td><td>0.95</td><td>Custom</td><td>32768</td><td>1</td><td>-</td></tr><tr><td>MATH 500 (2022; 2023)</td><td>CoT EM</td><td>EM Flex</td><td>0.6</td><td>0.95</td><td>Minerva</td><td>32768</td><td>1</td><td>-</td></tr><tr><td>AIME 2024*</td><td>CoT EM</td><td>EM Flex</td><td>0.6</td><td>0.95</td><td>Minerva</td><td>32768</td><td>32</td><td>-</td></tr><tr><td>AIME 2025*</td><td>CoT EM</td><td>EM Flex</td><td>0.6</td><td>0.95</td><td>Minerva</td><td>32768</td><td>32</td><td>-</td></tr><tr><td>Omega Math (2025)</td><td>CoT EM</td><td>EM Flex</td><td>0.6</td><td>0.95</td><td>Custom Regexes</td><td>32768</td><td>1</td><td>55</td></tr><tr><td>HumanEval+ (2023b)</td><td>CoT Code</td><td>pass@1</td><td>0.6</td><td>0.95</td><td>Split on ““</td><td>32768</td><td>10</td><td>-</td></tr><tr><td>MBPP+* (2023b)</td><td>CoT Code</td><td>pass@1</td><td>0.6</td><td>0.95</td><td>Split on ““</td><td>32768</td><td>10</td><td>-</td></tr><tr><td>LiveCodeBench v3* (2024)</td><td>CoT Code</td><td>pass@1</td><td>0.6</td><td>0.95</td><td>Split on ““</td><td>32768</td><td>10</td><td>-</td></tr><tr><td>ZebraLogic* (2025)</td><td>CoT JSON</td><td>Custom</td><td>0.6</td><td>0.95</td><td>Custom JSON</td><td>32768</td><td>1</td><td>-</td></tr><tr><td>BigBench-Hard (2022)</td><td>CoT EM</td><td>EM Flex</td><td>0.6</td><td>0.95</td><td>Custom Regex</td><td>32768</td><td>1</td><td>23</td></tr><tr><td>GPQA* (2024)</td><td>CoT MC</td><td>Acc</td><td>0.6</td><td>0.95</td><td>Custom Regex</td><td>32768</td><td>1</td><td>-</td></tr><tr><td>MMLU (2021)</td><td>CoT MC</td><td>Acc</td><td>0.6</td><td>0.95</td><td>Custom Regex</td><td>32768</td><td>1</td><td>57</td></tr><tr><td>PopQA (2022)</td><td>CoT MC</td><td>Acc</td><td>0.6</td><td>0.95</td><td>EM Recall</td><td>32768</td><td>1</td><td>-</td></tr><tr><td>Alpaca Eval v2 (2024)</td><td>CoT</td><td>Winrate</td><td>0.6</td><td>0.95</td><td>-</td><td>32768</td><td>1</td><td>-</td></tr></table>

Table 13 Details of the post-training evaluation suite, as used in OLMo 3 (Olmo Team, 2025). We mark tasks with \* to indicate new additions compared to the OLMo 2 suite (Olmo Team, 2024). All evaluation generations have thinking traces (text between &lt;think&gt;...&lt;/think&gt;) stripped before passing to the answer scorer. We use zero-shot setting for all metrics.

表 13 后训练评测套件的细节, 与 OLMo 3 (Olmo Team, 2025) 所用一致. \* 表示相对 OLMo 2 套件 (Olmo Team, 2024) 新增的任务. 所有评测生成在送进答案打分器之前, 都会先剥掉思考轨迹 (&lt;think&gt;...&lt;/think&gt; 之间的文本). 所有指标都在 zero-shot 设置下计算.

problems mentioned in Theorem 1 and Corollary 3.1:

(接上页) 问题:

**Lemma 1** Assuming $\mathsf { T C } ^ { 0 } \neq \mathsf { N C } ^ { 1 }$ , fixed-depth transformers cannot solve problems that are $\mathbb { N } \mathbb { C } ^ { 1 }$ -hard under FO reductions, which includes the $A _ { 5 }$ word problem, state-based recall over 5 variables, and formula evaluation. This holds even with polynomial padding.

**引理 1** 假设 $\mathsf{TC}^0 \neq \mathsf{NC}^1$, 固定深度 Transformer 无法求解在 FO 归约下 $\mathsf{NC}^1$-hard 的问题, 其中包括 $A_5$ 字问题, 5 个变量上的 state-based recall, 以及公式求值. 即使加上多项式 padding, 结论依然成立.

Proof. This follows from the fact that fixed-depth AHATs, UHATs, and softmax transformers (even with padding) are in $\top C ^ { 0 }$ (Merrill and Sabharwal, 2023; Chiang, 2025). If transformers could solve a problem hard for $\mathbb { N C } ^ { 1 }$ under FO reductions, then any $\mathbb { N } \mathbb { C } ^ { 1 }$ problem could be solved in $\mathsf { T } C ^ { 0 }$ by composing an $\mathbb { A } \mathbb { C } ^ { 0 }$ circuit for the FO reduction with the $\top C ^ { 0 }$ circuit for the complete problem. This would imply $\mathsf { T } \bar { \mathsf { C } } ^ { 0 } = \mathsf { N } \mathsf { C } ^ { 1 }$ , which contradicts the given premise.

证明. 这由如下事实得出: 固定深度的 AHAT, UHAT 和 softmax Transformer (即使带 padding) 都落在 $\mathsf{TC}^0$ 中 (Merrill and Sabharwal, 2023; Chiang, 2025). 如果 Transformer 能解某个在 FO 归约下 $\mathsf{NC}^1$-hard 的问题, 那么把 FO 归约对应的 $\mathsf{AC}^0$ 电路和该完全问题的 $\mathsf{TC}^0$ 电路复合起来, 任何 $\mathsf{NC}^1$ 问题都能在 $\mathsf{TC}^0$ 中求解. 这会推出 $\mathsf{TC}^0 = \mathsf{NC}^1$, 与前提矛盾.

We now justify that each of the mentioned problems is $\mathbb { N C } ^ { 1 }$ -hard:

下面逐一说明所列问题都是 $\mathsf{NC}^1$-hard 的:

• The $\mathbb { N C } ^ { 1 }$ completeness of the $A _ { 5 }$ word problem is a fundamental result (Barrington, 1986). This holds even for the variant where the input string is a sequence of transpositions over 5 elements and the output is the number that 1 gets mapped to (Merrill et al., 2024, Section 3).

• $A_5$ 字问题的 $\mathsf{NC}^1$ 完全性是一个基础结果 (Barrington, 1986). 下面这个变体同样成立: 输入是 5 个元素上的一串对换, 输出是 1 最终被映射到的数 (Merrill et al., 2024, Section 3).

• To show state-based recall is $\mathsf { N C ^ { 1 } \_ c o m p l e t e }$ , we construct an FO reduction from the transposition variant of the $A _ { 5 }$ word problem as follows. Given a sequence of transpositions w, instantiate a fixed-length list where the first entry is 1 and others are 0. Then simply copy over the list of transpositions from the $A _ { 5 }$ instance. By construction, the output reconstructs the number that w maps 1 to.

• 为证明 state-based recall 是 $\mathsf{NC}^1$-complete, 我们从 $A_5$ 字问题的对换变体构造一个 FO 归约: 给定对换序列 w, 建一个定长列表, 第一项为 1, 其余为 0, 然后把 $A_5$ 实例里的对换序列原样复制过来. 按构造, 输出恰好还原出 w 把 1 映射到的数.

• The $\mathbb { N C } ^ { 1 }$ -hardness of formula evaluation over booleans or integers is straightforward. Moreover, evaluating boolean formulas is also $\mathbb { N C } ^ { 1 }$ -complete (Buss, 1987), whereas evaluating integer formulas is $\mathsf { P N C } ^ { \tilde { 1 } } .$ complete (Caussinus et al., 1998). □

• 布尔或整数上的公式求值是 $\mathsf{NC}^1$-hard 的, 这一点很直接. 进一步, 布尔公式求值还是 $\mathsf{NC}^1$-complete (Buss, 1987), 整数公式求值则是 $\mathsf{PNC}^1$-complete (Caussinus et al., 1998). □

Next we formalize the memory limitations of RNNs (linear or nonlinear) using standard techniques from communication complexity:

接下来用通信复杂度的标准技巧, 把 RNN (线性或非线性) 的记忆局限形式化:

**Lemma 2** Log-precision RNNs (including DeltaNet) cannot solve problems with $\Omega ( n )$ communication complexity, which includes recall, state-based recall, and formula evaluation in Polish notation. This result holds even with polynomial padding.

**引理 2** 对数精度的 RNN (包括 DeltaNet) 无法求解通信复杂度为 $\Omega(n)$ 的问题, 其中包括 recall, state-based recall, 以及波兰表示法下的公式求值. 即使加上多项式 padding, 结论依然成立.

Proof. It is natural that the bounded state size of RNNs restricts their expressive power (Jelassi et al., 2024).

证明. RNN 的状态大小有界, 这自然会限制它的表达力 (Jelassi et al., 2024).

<!-- page 44 of 70 -->

Log-precision RNNs have a hidden state of size $O ( \log n )$ , and thus any problem that requires passing $\Omega ( n )$ bits from prefix to suffix will not be expressible.

(接上页) 对数精度 RNN 的隐藏状态大小为 $O(\log n)$, 所以任何需要从前缀向后缀传递 $\Omega(n)$ 位信息的问题, 它都表达不了.

We next show that each of the listed problems have $\Omega ( n )$ communication complexity, i.e., require passing this many bits from prefix to suffix when processing via streaming:

下面说明所列每个问题的通信复杂度都是 $\Omega(n)$, 也就是说, 以流式方式处理时, 需要从前缀向后缀传递这么多位:

• It is natural that recall problems $\scriptstyle { \left( \mathrm { e . g . } \right. }$ , recognizing ww) have $\Omega ( n )$ communication complexity.

• recall 问题 (例如识别 ww) 的通信复杂度为 $\Omega(n)$, 这一点很自然.

• State-based recall can be reduced to recall by a string homomorphism that simply deletes the state tracking tokens. Thus, it also requires $\Omega ( n )$ communication complexity.

• state-based recall 可以通过一个字符串同态归约到 recall, 这个同态只是删掉状态跟踪用的 token. 因此它的通信复杂度同样是 $\Omega(n)$.

• Finally, evaluating formulas in Polish notation has a communication complexity of $\Omega ( n )$ (Merrill, 2021, Theorem 6).

• 最后, 波兰表示法下公式求值的通信复杂度为 $\Omega(n)$ (Merrill, 2021, Theorem 6).

With polynomial padding tokens, precision remains logarithmic in the input sequence length:

加上多项式个 padding token 之后, 精度相对输入序列长度仍然是对数级:

$$
O (\log (n ^ {c})) = O (c \log n) = O (\log n).
$$

Thus, we are still restricted to remembering at most $O ( \log n )$ bits of an input prefix.

所以模型最多仍只能记住输入前缀的 $O(\log n)$ 位.

Thus, assuming both $\mathsf { T C } ^ { 0 } \neq \mathsf { N C } ^ { 1 }$ and log precision, both transformers and linear RNNs cannot solve statebased recall, the permuted $A _ { 5 }$ word problem, or formula evaluation. As a side note, the same communication complexity argument also shows that RNNs cannot even recognize recall languages like ww and $w w ^ { R }$ , which have communication complexity $\Omega ( n )$ . These simple languages are, however, in uniform $\mathbb { A } \mathbb { C } ^ { 0 }$ and can also be easily recognized by fixed-depth AHATs (Strobl et al., 2024).

于是, 在假设 $\mathsf{TC}^0 \neq \mathsf{NC}^1$ 且精度为对数级时, Transformer 和线性 RNN 都无法求解 state-based recall, 置换版 $A_5$ 字问题或公式求值. 顺带一提, 同样的通信复杂度论证还说明, RNN 连 ww 和 $w w^R$ 这类 recall 语言都识别不了, 它们的通信复杂度为 $\Omega(n)$. 而这些简单语言属于 uniform $\mathsf{AC}^0$, 固定深度的 AHAT 也能轻松识别 (Strobl et al., 2024).

### B.2 Power of Hybrid Models

We now turn to proving the main results that hybrid models can solve problems beyond the capabilities of both transformers and RNNs. In this section, we consider a hybrid model where the transformer component is an AHAT, though the construction also goes through with UHAT blocks as long as there is at least one linear RNN layer prior to it. The inexpressibility part of the result applies to both UHAT and AHAT. Assume the initial pointer values $p _ { 1 } , \ldots , p _ { 5 }$ are encoded in unary (binary encoding is discussed after the following result and its proof) for the state-based recall problem.

现在来证明主结果: hybrid 模型能解 Transformer 和 RNN 都解不了的问题. 本节考虑 Transformer 部分为 AHAT 的 hybrid 模型; 只要 UHAT 块之前至少有一层线性 RNN, 构造对 UHAT 块也同样成立. 结果中的不可表达部分对 UHAT 和 AHAT 都适用. 对 state-based recall 问题, 假设初始指针值 $p_1, \ldots, p_5$ 用一进制编码 (二进制编码放在下面的结果及其证明之后讨论).

**Theorem 1: State-Based Recall Separation**

There exists a hybrid model (GDN with negative eigenvalues + averaging-hard attention) that solves state-based recall, with just one alternation between layer types, in either order. In contrast, no transformer or RNN can express this problem, assuming $\mathsf { T C } ^ { 0 } \overset { \cdot \cdot } { \neq } \mathsf { N C } ^ { 1 }$ for transformers.

存在一个 hybrid 模型 (带负特征值的 GDN + averaging-hard attention) 能求解 state-based recall, 层类型之间只需交替一次, 顺序任意. 相反, 任何 Transformer 或 RNN 都表达不了这个问题 (对 Transformer 需假设 $\mathsf{TC}^0 \neq \mathsf{NC}^1$).

Proof. Lemma 1 shows transformers cannot solve state-based recall assuming $\mathsf { T C } ^ { 0 } \neq \mathsf { N C } ^ { 1 }$ . Similarly, Lemma 2 shows log-precision RNNs cannot express state-based recall unconditionally. We now describe how hybrid models with a single alternation can express pointer-based recall, considering each order separately.

证明. 引理 1 表明, 在 $\mathsf{TC}^0 \neq \mathsf{NC}^1$ 的假设下, Transformer 无法求解 state-based recall. 同样, 引理 2 表明对数精度 RNN 无条件地表达不了 state-based recall. 下面按两种层顺序分别说明, 只交替一次的 hybrid 模型如何表达基于指针的 recall.

(GDN + Attention) First, we use GDN to read the pointers $p _ { 1 } , \ldots , p _ { 5 }$ into a residual stream cell, which can be done for either unary- or binary-encoded pointers. As mentioned in the main text, the hybrid model can capture state-based recall by first composing permutations over the pointers with a GDN block and then using attention to retrieve the value at $p _ { 1 }$ . Since each transposition can be expressed as an identity + rank 1 matrix, it can directly be implemented by GDN (Grazzi et al., 2025). In the attention layer that implements recall, we first use layer-norm to project the final value of $p _ { 1 }$ onto the unit sphere, which we denote $\phi ( p _ { 1 } )$ . At each input bit $x _ { i } ,$ we also compute the projection $\phi ( i )$ using standard tricks with NoPE (Merrill and Sabharwal, 2024, 2025). We then implement the recall by attending with query $\phi ( p _ { 1 } )$ over keys $\phi ( i )$ and values $x _ { i }$ . Since attention is maximized exactly when $p _ { 1 } = i ,$ we will retrieve the correct bit $x _ { p _ { 1 } }$ . Thus, we have constructed a hybrid model of DeltaNet layers followed by attention layers that solves state-based recall.

(GDN 在前, 注意力在后) 先用 GDN 把指针 $p_1, \ldots, p_5$ 读进残差流的一个单元, 一进制或二进制编码的指针都可以. 正文已经说过, hybrid 模型可以先用 GDN 块在指针上复合置换, 再用注意力取出 $p_1$ 处的值, 以此完成 state-based recall. 每个对换都能写成单位阵加一个秩 1 矩阵, 因此可以由 GDN 直接实现 (Grazzi et al., 2025). 在实现 recall 的注意力层里, 先用 layer-norm 把 $p_1$ 的最终值投影到单位球面上, 记作 $\phi(p_1)$. 在每个输入位 $x_i$ 处, 也用 NoPE 下的标准技巧算出投影 $\phi(i)$ (Merrill and Sabharwal, 2024, 2025). 然后以 $\phi(p_1)$ 为 query, $\phi(i)$ 为 key, $x_i$ 为 value 做注意力, 实现 recall. 注意力恰好在 $p_1 = i$ 时取最大值, 所以取出的就是正确的位 $x_{p_1}$. 这样就构造出一个 DeltaNet 层后接注意力层, 能求解 state-based recall 的 hybrid 模型.

<!-- page 45 of 70 -->

(Attention $\neq \: G D N )$ The order of layers is reversed, but the overall idea remains similar. We first use an AHAT block to compute, for each pointer $k ,$ quantities $\phi ( p _ { k } / i )$ and $\phi ( 1 / i )$ , from which $\phi ( p _ { k } )$ can be computed. This is possible with averaging-hard attention (hence reliance on AHAT) because $p _ { k }$ is encoded in unary. Next, we use another layer of 5 attention heads to retrieve each value $x _ { p _ { k } }$ from each pointer $p _ { k }$ using query $\phi ( p _ { k } )$ , key $\phi ( i )$ , and value $x _ { i }$ . Finally, we use GDN to implement transposition composition over the values $x _ { p _ { 1 } } , \ldots , x _ { p _ { 5 } }$ , rather than over the pointers. Thus, in either order, one alternation allows a hybrid model to express state-based recall. □

(注意力在前, GDN 在后) 层的顺序反过来, 整体思路不变. 先用一个 AHAT 块, 对每个指针 $k$ 算出 $\phi(p_k/i)$ 和 $\phi(1/i)$, 由这两者可以得到 $\phi(p_k)$. 因为 $p_k$ 是一进制编码, averaging-hard attention 能做到这一步 (这也是这里依赖 AHAT 的原因). 接着用另一层 5 个注意力头, 以 $\phi(p_k)$ 为 query, $\phi(i)$ 为 key, $x_i$ 为 value, 从每个指针 $p_k$ 取出对应的值 $x_{p_k}$. 最后用 GDN 在值 $x_{p_1}, \ldots, x_{p_5}$ 上实现对换复合, 而不是在指针上. 因此无论哪种顺序, 交替一次就足以让 hybrid 模型表达 state-based recall. □

If GDN precedes attention, then this construction works for binary-encoded pointers in addition to unary encoded pointers, as well as for UHAT blocks. It follows that, with more than one alternation, hybrid models (regardless of UHAT or AHAT) can also handle binary-encoded pointers, since this setting subsumes the one where GDN precedes attention.

如果 GDN 在注意力之前, 这个构造除了一进制指针, 对二进制编码的指针也成立, 并且对 UHAT 块同样成立. 由此可知, 交替多于一次时, hybrid 模型 (不论 UHAT 还是 AHAT) 也能处理二进制编码的指针, 因为这种设置涵盖了 GDN 在注意力之前的情形.

### B.3 Padded Hybrid Models

First, we describe padding in a little more detail. Given a function $t : \mathbb { N } \rightarrow \mathbb { N } ,$ a model is run with $t ( n )$ padding as follows. For any input w, we append $t ( n )$ padding tokens (□) to get a padded input w $\Box ^ { t ( | w | ) }$ . We then interpret the prediction at the final token of this padded input as the prediction for w. We say that a language $L$ can be recognized by a transformer with polynomial padding if there exists c and a transformer T such that T recognizes L with $n ^ { c }$ padding.

先把 padding 说得更细一些. 给定函数 $t : \mathbb{N} \rightarrow \mathbb{N}$, 模型以 $t(n)$ padding 运行的方式如下: 对任意输入 w, 在后面追加 $t(n)$ 个 padding token (□), 得到带 padding 的输入 w $\Box^{t(|w|)}$, 再把这个输入最后一个 token 处的预测当作对 w 的预测. 如果存在 c 和 Transformer T, 使 T 在 $n^c$ padding 下识别 L, 就说语言 $L$ 可以被带多项式 padding 的 Transformer 识别.

We show that polynomially-padded hybrid models (with averaging-hard attention) can capture all of $\mathbb { N C } ^ { 1 }$ :

下面证明, 带多项式 padding 的 hybrid 模型 (使用 averaging-hard attention) 能涵盖整个 $\mathsf{NC}^1$:

**Theorem 3: Padded Hybrid Models** With polynomial padding tokens, fixed-depth hybrid models (averaging-hard attention $\ne\ GDN$ with negative eigenvalues) can recognize any language in FO-uniform $\mathbb { N } \tilde { C } ^ { 1 }$

**定理 3: 加 padding 的 Hybrid 模型** 加上多项式个 padding token 后, 固定深度的 hybrid 模型 (averaging-hard attention 加带负特征值的 GDN) 能识别 FO-uniform $\mathsf{NC}^1$ 中的任意语言.

Proof. Let $L \in \mathsf { N C } ^ { 1 }$ . Recognizing L can be decomposed to implementing an FO reduction to an $\mathbb { N C } ^ { 1 }$ -complete problem L′. Let $L ^ { \prime }$ be the transposition variant of the $S _ { 5 }$ word problem described by Merrill et al. $( 2 0 2 4 ,$ Section 3.1). We use the fact that every language $L \in \mathsf { N C } ^ { 1 }$ is FO-reducible to $L ^ { \prime } .$ That is, any $w   \in   \Sigma ^ { n }$ can be mapped via an FO reduction to a new sequence u of length $n ^ { k }$ such that $\textstyle \prod _ { i = 1 } ^ { n ^ { k } } u _ { i } = 1$ if and only if $w \in L$ . We use a block of transformer layers to implement the FO reduction from w to u. At this point, we have $n ^ { k }$ padding tokens where token i encodes u<sub>i</sub>. Next, we can construct a fixed-depth GDN with negative eigenvalues that recognizes $L ^ { \prime }$ (Grazzi et al., 2025), which is possible because each element in the transition monoid can be written as an identity + rank 1 operator. Thus, by composition, following Lemma 3 of Merrill and Sabharwal (2025), this hybrid model will accept iff $u \in L ^ { \prime }$ . By construction, $u \in L ^ { \prime }$ iff $w \in L$ . Thus, given an arbitrary language $L \in \mathsf { N C } ^ { 1 }$ , we have constructed a hybrid model that recognizes L with $n ^ { c }$ padding, where c is fixed for each $L .$ □

证明. 设 $L \in \mathsf{NC}^1$. 识别 L 可以分解为: 实现一个到 $\mathsf{NC}^1$ 完全问题 L′ 的 FO 归约. 取 L′ 为 Merrill et al. (2024, Section 3.1) 描述的 $S_5$ 字问题对换变体. 我们用到如下事实: 每个语言 $L \in \mathsf{NC}^1$ 都能 FO 归约到 L′. 也就是说, 任何 $w \in \Sigma^n$ 都能经 FO 归约映射成长度为 $n^k$ 的新序列 u, 使得 $\prod_{i=1}^{n^k} u_i = 1$ 当且仅当 $w \in L$. 我们用一块 Transformer 层实现从 w 到 u 的 FO 归约. 这时有 $n^k$ 个 padding token, 第 i 个编码 u<sub>i</sub>. 接着构造一个识别 L′ 的固定深度带负特征值 GDN (Grazzi et al., 2025); 之所以可行, 是因为转移幺半群中的每个元素都能写成单位阵加一个秩 1 算子. 于是按 Merrill and Sabharwal (2025) 的引理 3 做复合, 这个 hybrid 模型当且仅当 $u \in L'$ 时接受. 按构造, $u \in L'$ 当且仅当 $w \in L$. 所以对任意语言 $L \in \mathsf{NC}^1$, 我们都构造出了一个在 $n^c$ padding 下识别 L 的 hybrid 模型, 其中 c 对每个 L 是固定的. □

Based on recent work, Theorem 3 can be naturally extended to give the stronger lower bound of FO-uniform $\mathsf { P N C } ^ { 1 }$ using the fact that GDN with negative eigenvalues can represent $\mathsf { P N C } ^ { 1 }$ -complete problems (Caussinus et al., 1998; Merrill et al., 2026). This implies padded hybrid models can solve some additional problems not known to be in $\mathbb { N } \mathbb { C } ^ { 1 }$ , such as simulated weighted automata or evaluating formulas over integers. Moreover, nonuniform $\mathsf { P N C } ^ { 1 }$ holds as an upper bound for hybrid models (Merrill et al., 2026). Thus, modulo details about uniformity, $\mathsf { P N C } ^ { 1 }$ represents an exact expressivity characterization for padded hybrid models.

借助近期工作, 定理 3 可以自然地加强为 FO-uniform $\mathsf{PNC}^1$ 这一更强的下界, 依据是带负特征值的 GDN 能表示 $\mathsf{PNC}^1$ 完全问题 (Caussinus et al., 1998; Merrill et al., 2026). 这意味着加 padding 的 hybrid 模型还能解一些目前不知道是否属于 $\mathsf{NC}^1$ 的问题, 比如模拟加权自动机, 或者求值整数上的公式. 另外, 非一致的 $\mathsf{PNC}^1$ 是 hybrid 模型的上界 (Merrill et al., 2026). 因此除去一致性上的细节, $\mathsf{PNC}^1$ 就是加 padding 的 hybrid 模型表达力的精确刻画.

Moreover, recent related work has studied hybrid models that mix transformers with weighted transducers, approaching such models from the perspective of expressive power and learning theory (Mohri, 2026). Combined with the link between linear RNNs and weighted automata (Merrill et al., 2026), there is a close connection between these models and hybrid models that mix transformers and linear RNNs, with both architectures falling in $\mathsf { P N C } ^ { 1 }$ and capable of expressing $\mathsf { P N C } ^ { 1 }$ -complete problems.

此外, 近期有相关工作研究了把 Transformer 与加权转导器 (weighted transducer) 组合起来的 hybrid 模型, 从表达力和学习理论两个角度切入 (Mohri, 2026). 再结合线性 RNN 与加权自动机之间的联系 (Merrill et al., 2026), 这类模型和混用 Transformer 与线性 RNN 的 hybrid 模型关系很近: 两种架构都落在 $\mathsf{PNC}^1$ 内, 也都能表达 $\mathsf{PNC}^1$ 完全问题.

<!-- page 46 of 70 -->

## C Additional Details: Synthetic Evaluations

This appendix documents the experimental setup used for the synthetic evaluation curves in Section 3.5, including model architectures, the hyperparameter search protocol, curricula, and the exact numbers plotted.

本附录记录 §3.5 合成评测曲线背后的实验设置, 包括模型架构, 超参数搜索流程, 课程 (curriculum), 以及图中所画的具体数值.

### C.1 Tasks and Evaluation Protocol

All tasks are generated online (no fixed dataset) by sampling code-like strings and training models as next-token predictors.

所有任务都在线生成, 没有固定数据集: 采样类代码字符串, 把模型当作 next-token prediction 模型来训练.

**Recall.** A bit array of size m is instantiated, followed by a query of the form assert bits[i] == \_. The model must output the correct bit. We evaluate across m ∈ {4, 8, 16, 32, 64, 128}.

**Recall.** 先实例化一个大小为 m 的位数组, 后面跟一条形如 assert bits[i] == \_ 的查询, 模型要输出正确的那一位. 评测覆盖 m ∈ {4, 8, 16, 32, 64, 128}.

**State Tracking.** Variables are initialized and updated by n swaps/assignments, followed by a query assert v == \_. We evaluate across n ∈ {4, 8, 16, 32, 64, 128}.

**State Tracking.** 先初始化若干变量, 再经过 n 次交换或赋值更新, 最后是一条查询 assert v == \_. 评测覆盖 n ∈ {4, 8, 16, 32, 64, 128}.

**State-Based Recall.** A bit array of size m is instantiated; variables are initialized to indices in [0, m−1] and then updated by n swaps. Finally, the model must answer assert bits[v] == \_ for a queried variable v. In the default state-based recall setting used in Section 3.5, we set m = n and evaluate across n ∈ {4, 8, 16, 32, 64, 128}.

**State-Based Recall.** 实例化一个大小为 m 的位数组; 变量先初始化为 [0, m−1] 内的下标, 再经过 n 次交换更新. 最后模型要对被查询的变量 v 回答 assert bits[v] == \_. §3.5 默认的 state-based recall 设置取 m = n, 评测覆盖 n ∈ {4, 8, 16, 32, 64, 128}.

**Metric.** We report next-token accuracy on the final answer token (the token immediately following the last ==). Each reported accuracy is computed over 256 freshly generated evaluation samples at the specified difficulty.

**Metric.** 我们报告最终答案 token (紧跟最后一个 == 的那个 token) 上的 next-token 准确率. 每个准确率都在指定难度下, 用 256 条新生成的评测样本算出.

### C.2 Model Architectures

To address potential confounds from over-parameterization on shorter sequences, we use a compact, standardized architecture across all three models. They share the same base width and depth, differing only in their sequence-mixing layers (full attention vs. GDN vs. hybrid). Table 14 summarizes the shared hyperparameters and the model-specific settings.

为了避免短序列上过参数化带来的混淆, 三个模型统一使用紧凑且标准化的架构. 它们的基础宽度和深度相同, 只在序列混合层上有区别 (全注意力, GDN, hybrid). 表 14 汇总了共享的超参数和各模型的专属设置.

**Table 14** Architecture hyperparameters used for synthetic evaluations.

**表 14** 合成评测使用的架构超参数.

| Shared hyperparameters | Value |
| --- | --- |
| Layers (L) | 4 |
| Model width (d<sub>model</sub>) | 256 |
| FFN intermediate size (d<sub>ff</sub>) | 1024 |
| Attention heads (H) | 4 |
| Head dimension (d<sub>head</sub>) | 64 |
| Max positions | 1024 (Recall) / 4096 (State Tracking, State-based Recall) |
| Transformer | full softmax attention in all layers |
| Linear RNN (neg. eig.) | GatedDeltaNet with allow_neg_eigval=True |
| Linear RNN (pos. eig.) | GatedDeltaNet with allow_neg_eigval=False |
| Hybrid (neg. eig.) | first 3 layers are GDN with allow_neg_eigval=True; last layer is full attention |
| Hybrid (pos. eig.) | first 3 layers are GDN with allow_neg_eigval=False; last layer is full attention |

### C.3 Training Details

We train with bf16 using the HuggingFace Trainer (AdamW). To ensure robust comparisons, we standardize fundamental training parameters across all tasks: a batch size of 32, gradient accumulation of 1, and a warmup period of 250 steps. Each experiment is conducted on a single H100 GPU.

训练用 bf16 和 HuggingFace Trainer (AdamW). 为了让比较更稳健, 所有任务统一基本训练参数: batch size 32, 梯度累积 1, warmup 250 步. 每个实验都在单张 H100 上完成.

<!-- page 47 of 70 -->

Because model performance on these synthetic algorithmic tasks is highly sensitive to the learning rate, scheduler, and weight initialization, we conduct a systematic hyperparameter sweep rather than relying on arbitrary fixed values.

模型在这些合成算法任务上的表现对学习率, 调度器和权重初始化都很敏感, 因此我们做系统的超参数扫描, 不依赖随手定下的固定值.

**Recall and State Tracking Sweep.** For the Recall and State Tracking tasks, we randomly sample 10 configurations from a grid of common learning rates $( 1 0 ^ { - 4 } , 3 \cdot 1 0 ^ { - 4 } , 1 0 ^ { - 3 } )$ and schedulers (cosine, constant). Models are trained for 50,000 steps (Recall) and 20,000 steps (State Tracking).

**Recall 与 State Tracking 的扫描.** 对 Recall 和 State Tracking 两个任务, 从常用学习率 $(10^{-4}, 3 \cdot 10^{-4}, 10^{-3})$ 与调度器 (cosine, constant) 构成的网格中随机采 10 组配置. 模型分别训练 50,000 步 (Recall) 和 20,000 步 (State Tracking).

**State-Based Recall Sweep.** State-based recall is a harder compositional task and exhibits high sensitivity to initialization. Initial trials indicated that a learning rate of $\mathrm { \bar { 1 0 } ^ { - 3 } }$ was unstable, causing all architectures to fail to learn. We therefore refined our search space to learning rates of $\{ 1 0 ^ { - 4 } , 3 \cdot 1 0 ^ { - 4 } \}$ and schedulers ∈ {cosine, constant}. For each of the 4 combinations, we run 5 different random seeds across all three model types, totaling 120 runs. Models on this task are trained for up to 200,000 steps.

**State-Based Recall 的扫描.** state-based recall 是更难的组合任务, 对初始化高度敏感. 初步试验显示学习率 $10^{-3}$ 不稳定, 所有架构都学不会. 因此把搜索空间收窄到学习率 $\{10^{-4}, 3 \cdot 10^{-4}\}$ 和调度器 ∈ {cosine, constant}. 这 4 种组合各跑 5 个随机种子, 覆盖全部三类模型, 共 120 次运行. 这个任务上的模型最多训练 200,000 步.

**Curricula.** To facilitate learning on these complex tasks, we employ task-specific curriculum strategies. For **State Tracking**, we use a deterministic, time-based step schedule, advancing the difficulty n through {8, 16, 32, 64} at fixed cumulative step milestones (500, 1,500, 3,500, and 7,500 steps, respectively). For **Recall**, the task does not require a curriculum and is trained directly on a fixed bit-array size of $m   =   1 2 8$ For **State-Based Recall**, we use a hybrid threshold-and-budget curriculum. The model starts at difficulty $n = 8$ and advances through $n \in \{ 8 , 1 6 , 3 2 , 6 4 \}$ if it achieves a 0.95 accuracy threshold (evaluated every 100 steps over a hold-out batch of 256 samples). To prevent stalling, the curriculum also forces an advancement if a step budget is exhausted (10,000 steps for n = 8; 30,000 steps for subsequent levels).

**课程.** 为了帮助模型学会这些复杂任务, 我们按任务设计了课程策略.**State Tracking** 用确定的, 按步数推进的调度: 在固定的累计步数节点 (依次为 500, 1,500, 3,500 和 7,500 步) 把难度 n 依次推进到 {8, 16, 32, 64}.**Recall** 不需要课程, 直接在固定的位数组大小 $m = 128$ 上训练.**State-Based Recall** 用阈值加预算的混合课程: 模型从难度 $n = 8$ 开始, 只要达到 0.95 的准确率阈值 (每 100 步在 256 条 hold-out 样本上评估一次), 就在 $n \in \{8, 16, 32, 64\}$ 中往上推进. 为了防止卡住, 步数预算耗尽时也会强制推进 (n = 8 的预算是 10,000 步, 之后各级是 30,000 步).

**Data Generation.** All tasks are framed as next-token prediction over Python-like execution traces. For **State Tracking**, we follow the method in Siems et al. (2026), where the generator inserts intermediate assert statements to explicitly reveal parts of the evolving program state across 5 variables. These reveals occur at fixed, difficulty-dependent intervals. For **Recall**, the sequence simply consists of a bit-array definition followed by a direct query, without any intermediate state updates. For **State-Based Recall**, which composes state tracking and retrieval, we use intermediate assert statements but further strengthen the supervision and discourage pattern-matching through two techniques: first, we randomize the spacing between assert statements across examples (sampling uniformly from powers of 2 up to n); second, we mix in a fraction of strict examples (20%) that omit intermediate assert statements entirely, forcing the model to answer the final query.

**数据生成.** 所有任务都表述为类 Python 执行轨迹上的 next-token prediction.**State Tracking** 沿用 Siems et al. (2026) 的方法: 生成器插入中间 assert 语句, 显式揭示 5 个变量上正在演化的程序状态的一部分. 这些揭示按固定且随难度变化的间隔出现.**Recall** 的序列只有一段位数组定义加一条直接查询, 中间没有任何状态更新.**State-Based Recall** 把状态跟踪和检索组合在一起, 同样使用中间 assert 语句, 但用两种技巧加强监督, 抑制模式匹配: 一是在不同样本间随机化 assert 语句的间隔 (从不超过 n 的 2 的幂中均匀采样); 二是混入一部分 (20%) 严格样本, 完全省去中间 assert, 迫使模型直接回答最终查询.

**No-Negative-Eigenvalue Ablation.** In addition to the main three-model comparison, we evaluate ablated linear-RNN and hybrid variants in which the GDN blocks disallow negative eigenvalues by setting allow\_- neg\_eigval=False. These ablations use the same task definitions, metrics, and curricula as the main experiments.

**无负特征值消融.** 除了主体的三模型对比, 我们还评测了消融版的线性 RNN 和 hybrid: 设置 allow\_neg\_eigval=False, 让其中的 GDN 块不允许负特征值. 这些消融使用相同的任务定义, 指标和课程.

**Run Selection Criteria.** To report the final numbers in Section 3.5, we select the best run for each model and task using a strict, standardized criterion: we identify the run that achieves the maximum accuracy on the hardest difficulty setting (maximum sequence length / max steps) at the final evaluation step. In the event of a tie, we break the tie by looking at the accuracy of the next longest length, continuing until a clear best run is isolated.

**运行的选择标准.** 为了报告 §3.5 的最终数字, 我们对每个模型和任务按统一的严格标准挑选最佳运行: 选在最难设置 (最大序列长度或最大步数) 上, 最终评估步准确率最高的那一次. 如果并列, 就比次长长度上的准确率, 依此类推, 直到分出唯一的最佳运行.

To ensure full reproducibility and transparency, the complete set of runs for our hyperparameter sweeps can be viewed on Weights & Biases at: [https://wandb.ai/ai2-llm/Olmo-Hybrid-synth-eval.](https://wandb.ai/ai2-llm/Olmo-Hybrid-synth-eval)

为了保证可复现和透明, 超参数扫描的全部运行都可以在 Weights & Biases 上查看: [https://wandb.ai/ai2-llm/Olmo-Hybrid-synth-eval.](https://wandb.ai/ai2-llm/Olmo-Hybrid-synth-eval)

**WandB Naming Conventions.** Note that the task names in the WandB run logs differ slightly from the terminology used in this paper. When navigating the logs, please use the following mapping:

**WandB 命名约定.** WandB 运行日志里的任务名和本文术语略有不同. 查阅日志时请按下面的对应关系:

• **Recall** is labeled as retrieval (e.g., retrieval\_transformer\_lr1e-4\_bs32\_cosine). The relevant evaluation metric is the eval\_normal field.

• **Recall** 标为 retrieval (例如 retrieval\_transformer\_lr1e-4\_bs32\_cosine), 对应的评测指标是 eval\_normal 字段.

• **State Tracking** is labeled as state\_tracking. The relevant evaluation metric is the eval\_strict field.

• **State Tracking** 标为 state\_tracking, 对应的评测指标是 eval\_strict 字段.

<!-- page 48 of 70 -->

• **State-Based Recall** is labeled as ptr (e.g., ptr-transformer-lr3e-4-cosine-seed8). The relevant evaluation metric is the eval\_strict field.

• **State-Based Recall** 标为 ptr (例如 ptr-transformer-lr3e-4-cosine-seed8), 对应的评测指标是 eval\_strict 字段.

The no-negative-eigenvalue ablation projects use the same task naming, but are stored in separate projects whose names end with no-neg-eigval.

无负特征值消融的项目沿用同样的任务命名, 但存放在单独的项目里, 项目名以 no-neg-eigval 结尾.

The exact numbers plotted in Figure 7 and detailed in Tables 15–17 are drawn from the following selected best runs:

图 7 所画以及表 15–17 所列的具体数字, 取自下面这些选定的最佳运行:

**State Tracking.**

• **Transformer:** [https://wandb.ai/ai2-llm/Olmo-Hybrid-synth-eval/runs/925yzp3l](https://wandb.ai/ai2-llm/Olmo-Hybrid-synth-eval/runs/925yzp3l)

• **Linear RNN (neg. eig.):** [https://wandb.ai/ai2-llm/Olmo-Hybrid-synth-eval/runs/i2t6vfgc](https://wandb.ai/ai2-llm/Olmo-Hybrid-synth-eval/runs/i2t6vfgc)

• **Hybrid (neg. eig.):** [https://wandb.ai/ai2-llm/Olmo-Hybrid-synth-eval/runs/7oxbr81u](https://wandb.ai/ai2-llm/Olmo-Hybrid-synth-eval/runs/7oxbr81u)

• **Linear RNN (pos. eig.):** [https://wandb.ai/ai2-llm/Olmo-Hybrid-synth-eval/runs/8hc3oeoq](https://wandb.ai/ai2-llm/Olmo-Hybrid-synth-eval/runs/8hc3oeoq)

• **Hybrid (pos. eig.):** [https://wandb.ai/ai2-llm/Olmo-Hybrid-synth-eval/runs/2hsy3ksf](https://wandb.ai/ai2-llm/Olmo-Hybrid-synth-eval/runs/2hsy3ksf)

**Recall.**

• **Transformer:** [https://wandb.ai/ai2-llm/Olmo-Hybrid-synth-eval/runs/dattbjr0](https://wandb.ai/ai2-llm/Olmo-Hybrid-synth-eval/runs/dattbjr0)

• **Linear RNN (neg. eig.):** [https://wandb.ai/ai2-llm/Olmo-Hybrid-synth-eval/runs/570kpuuh](https://wandb.ai/ai2-llm/Olmo-Hybrid-synth-eval/runs/570kpuuh)

• **Hybrid (neg. eig.):** [https://wandb.ai/ai2-llm/Olmo-Hybrid-synth-eval/runs/5eljlaeq](https://wandb.ai/ai2-llm/Olmo-Hybrid-synth-eval/runs/5eljlaeq)

• **Linear RNN (pos. eig.):** [https://wandb.ai/ai2-llm/Olmo-Hybrid-synth-eval/runs/phcklxlr](https://wandb.ai/ai2-llm/Olmo-Hybrid-synth-eval/runs/phcklxlr)

• **Hybrid (pos. eig.):** [https://wandb.ai/ai2-llm/Olmo-Hybrid-synth-eval/runs/elbinpt6](https://wandb.ai/ai2-llm/Olmo-Hybrid-synth-eval/runs/elbinpt6)

**State-Based Recall.**

• **Transformer:** [https://wandb.ai/ai2-llm/Olmo-Hybrid-synth-eval/runs/9rexm8xm](https://wandb.ai/ai2-llm/Olmo-Hybrid-synth-eval/runs/9rexm8xm)

• **Linear RNN (neg. eig.):** [https://wandb.ai/ai2-llm/Olmo-Hybrid-synth-eval/runs/jnlavjjn](https://wandb.ai/ai2-llm/Olmo-Hybrid-synth-eval/runs/jnlavjjn)

• **Hybrid (neg. eig.):** [https://wandb.ai/ai2-llm/Olmo-Hybrid-synth-eval/runs/oqy3t8n3](https://wandb.ai/ai2-llm/Olmo-Hybrid-synth-eval/runs/oqy3t8n3)

• **Linear RNN (pos. eig.):** [https://wandb.ai/ai2-llm/Olmo-Hybrid-synth-eval/runs/2onzuhs7](https://wandb.ai/ai2-llm/Olmo-Hybrid-synth-eval/runs/2onzuhs7)

• **Hybrid (pos. eig.):** [https://wandb.ai/ai2-llm/Olmo-Hybrid-synth-eval/runs/zn13y4j1](https://wandb.ai/ai2-llm/Olmo-Hybrid-synth-eval/runs/zn13y4j1)

Table 15 State tracking accuracy (varying number of updates n).

表 15 状态跟踪准确率 (随更新次数 n 变化).

| n | Transformer | Linear RNN (neg. eig.) | Linear RNN (pos. eig.) | Hybrid (neg. eig.) | Hybrid (pos. eig.) |
| --- | --- | --- | --- | --- | --- |
| 4 | 0.51172 | 1.00000 | 1.00000 | 1.00000 | 1.00000 |
| 8 | 0.27734 | 1.00000 | 1.00000 | 1.00000 | 1.00000 |
| 16 | 0.17188 | 1.00000 | 0.97266 | 1.00000 | 1.00000 |
| 32 | 0.23047 | 1.00000 | 0.64453 | 1.00000 | 1.00000 |
| 64 | 0.19922 | 1.00000 | 0.21484 | 1.00000 | 0.96094 |
| 128 | 0.23047 | 1.00000 | 0.22266 | 1.00000 | 0.36328 |

<!-- page 49 of 70 -->

Table 16 Recall accuracy (varying bit-array size m).

表 16 Recall 准确率 (随位数组大小 m 变化).

| m | Transformer | Linear RNN (neg. eig.) | Linear RNN (pos. eig.) | Hybrid (neg. eig.) | Hybrid (pos. eig.) |
| --- | --- | --- | --- | --- | --- |
| 4 | 1.00000 | 1.00000 | 1.00000 | 1.00000 | 1.00000 |
| 8 | 1.00000 | 1.00000 | 1.00000 | 1.00000 | 1.00000 |
| 16 | 1.00000 | 1.00000 | 1.00000 | 1.00000 | 1.00000 |
| 32 | 1.00000 | 1.00000 | 1.00000 | 1.00000 | 1.00000 |
| 64 | 1.00000 | 0.83203 | 0.80078 | 1.00000 | 1.00000 |
| 128 | 0.96484 | 0.67578 | 0.67188 | 1.00000 | 1.00000 |

Table 17 State-based recall accuracy (varying number of swaps n, with $m = n )$

表 17 State-based recall 准确率 (随交换次数 n 变化, 取 $m = n$).

| n | Transformer | Linear RNN (neg. eig.) | Linear RNN (pos. eig.) | Hybrid (neg. eig.) | Hybrid (pos. eig.) |
| --- | --- | --- | --- | --- | --- |
| 4 | 0.82031 | 1.00000 | 0.76953 | 1.00000 | 0.85938 |
| 8 | 0.75000 | 1.00000 | 0.99219 | 1.00000 | 0.99219 |
| 16 | 0.73828 | 1.00000 | 0.85547 | 1.00000 | 0.93750 |
| 32 | 0.73828 | 1.00000 | 0.64453 | 1.00000 | 0.68750 |
| 64 | 0.62891 | 0.78125 | 0.59766 | 1.00000 | 0.61328 |
| 128 | 0.54297 | 0.63672 | 0.57422 | 1.00000 | 0.57031 |

## D Scaling and Ablation Experiments: Details and Additional Results

### D.1 Additional Results

#### D.1.1 Additional Scaling Law Results

This section supplements Section 4.1 with the full scaling law coefficient table with confidence intervals (Table 18), compute-optimal loss predictions across all three architectures and compute budgets (Table 19), projected token savings by scale (Table 20), and scaling law residual diagnostics (Figure 14).

本节补充 §4.1 的内容: 带置信区间的完整 Scaling Law 系数表 (表 18), 三种架构在各个算力预算下的算力最优 loss 预测 (表 19), 按模型规模给出的预计 token 节省 (表 20), 以及 Scaling Law 的残差诊断 (图 14).

**Scaling Coefficients.** Table 18 reports the full Chinchilla scaling law coefficients for all three architectures under both the unconstrained fit (all five parameters free) and the fixed-exponent fit $( \alpha = \beta = 0 . 2 2$ shared; only E, A, B refit), together with 95% bootstrap confidence intervals. The unconstrained fit yields wide CIs due to high joint uncertainty when exponents are free; the fixed-exponent fit tightens the CIs considerably. The clearest signal is in B (data efficiency): the hybrid’s $B = 8 3 . 7$ (CI [80.2, 87.1]) is robustly lower than the transformer’s 94.9 (CI [88.7, 102.0]), with non-overlapping CIs. The parameter coefficient A slightly favors the hybrid (70.1 vs. 71.8) but the CIs overlap. In the fixed-exponent fit the ordering of the irreducible loss E reverses relative to the unconstrained fit: the transformer achieves a lower E (1.569, CI [1.54, 1.60]) than the hybrid (1.597, CI [1.58, 1.61]), suggesting the apparent advantage in E for the hybrid in the unconstrained fit was a fitting artifact. The scaling exponents α and $\beta$ are statistically indistinguishable across architectures— the CIs broadly overlap in the unconstrained fit—consistent with the theoretical prediction that expressivity shifts efficiency constants without altering exponents (Section 4.2).

**Scaling 系数.** 表 18 给出三种架构在两种拟合方式下的完整 Chinchilla Scaling Law 系数, 附 95% bootstrap 置信区间. 一种是无约束拟合 (五个参数全部自由), 另一种是固定指数拟合 ($\alpha = \beta = 0.22$ 共享, 只重新拟合 E, A, B). 指数自由时联合不确定性很高, 无约束拟合的 CI 很宽; 固定指数拟合把 CI 收紧了不少. 最清楚的信号出现在 B (数据效率) 上: hybrid 的 $B = 83.7$ (CI [80.2, 87.1]) 稳健地低于 Transformer 的 94.9 (CI [88.7, 102.0]), 两者的 CI 不重叠. 参数系数 A 略偏向 hybrid (70.1 对 71.8), 但 CI 有重叠. 在固定指数拟合中, 不可约 loss E 的排序相对无约束拟合发生了反转: Transformer 的 E 更低 (1.569, CI [1.54, 1.60]), hybrid 为 1.597 (CI [1.58, 1.61]). 这说明无约束拟合里 hybrid 在 E 上的表面优势是拟合伪影. 各架构的 Scaling 指数 α 和 $\beta$ 在统计上无法区分, 无约束拟合的 CI 大面积重叠. 这与理论预测一致: 表达力改变的是效率常数, 不改变指数 (§4.2).

Table 19 reports compute-optimal model sizes, dataset sizes, and predicted losses for all three architectures across compute budgets from $1 0 ^ { 1 8 }$ to $1 0 ^ { 2 3 }$ FLOPs. The pure GDN achieves modest but consistent loss improvements $( \Delta \approx - 0 . 0 2 \mathrm { t o } - 0 . 0 5 )$ across scales, though these are smaller than those of the hybrid model, reflecting its weaker data efficiency B despite lower parameter coefficient A. The compute-optimal allocation for each architecture is derived from the fitted scaling laws as described in Section D.2.

表 19 给出三种架构在 $10^{18}$ 到 $10^{23}$ FLOPs 各算力预算下的算力最优模型大小, 数据量和预测 loss. 纯 GDN 在各个规模上都带来小而稳定的 loss 改进 ($\Delta \approx -0.02$ 到 $-0.05$), 但幅度小于 hybrid 模型. 原因是纯 GDN 虽然参数系数 A 更低, 数据效率 B 却更弱. 各架构的算力最优分配按 §D.2 描述的方法, 由拟合出的 Scaling Law 推出.

Table 20 reports the projected token requirements and savings factors at a discrete set of model scales, corresponding to Figure 10(b) in the main text.

表 20 给出一组离散模型规模下的预计 token 需求与节省倍数, 对应正文的图 10(b).

<!-- page 50 of 70 -->

<table><tr><td>Architecture</td><td>E</td><td>A</td><td>α</td><td>B</td><td>β</td><td> $a_{\text{opt}}$ </td><td> $b_{\text{opt}}$ </td><td> $R^2$ </td></tr><tr><td colspan="9">Free fit (all five parameters fit independently)</td></tr><tr><td>Olmo 3</td><td>1.65[1.11, 1.87]</td><td>108.83[21.2, 448.7]</td><td>0.25[0.14, 0.34]</td><td>83.45[29.6, 495.0]</td><td>0.21[0.15, 0.30]</td><td>0.46[0.33, 0.68]</td><td>0.54[0.32, 0.67]</td><td>0.9976</td></tr><tr><td>Hybrid</td><td>1.60[1.25, 1.72]</td><td>71.14[24.8, 145.3]</td><td>0.23[0.15, 0.27]</td><td>81.72[37.4, 219.6]</td><td>0.22[0.18, 0.27]</td><td>0.49[0.41, 0.64]</td><td>0.51[0.36, 0.59]</td><td>0.9993</td></tr><tr><td>Pure GDN</td><td>1.46[1.16, 1.75]</td><td>36.24[19.0, 113.3]</td><td>0.18[0.14, 0.26]</td><td>102.72[52.1, 214.8]</td><td>0.23[0.19, 0.26]</td><td>0.55[0.45, 0.65]</td><td>0.45[0.35, 0.55]</td><td>0.9994</td></tr><tr><td colspan="9">Fixed-exponent fit ( $\alpha = \beta = 0.22$  shared; only E, A, B refit)</td></tr><tr><td>Olmo 3</td><td>1.55[1.52, 1.58]</td><td>66.63[61.9, 69.4]</td><td>0.22</td><td>94.85[89.3, 101.4]</td><td>0.22</td><td>0.50</td><td>0.50</td><td>0.9975</td></tr><tr><td>Hybrid</td><td>1.58[1.56, 1.59]</td><td>65.09[62.8, 67.3]</td><td>0.22</td><td>83.65[79.9, 87.0]</td><td>0.22</td><td>0.50</td><td>0.50</td><td>0.9993</td></tr><tr><td>Pure GDN</td><td>1.61[1.59, 1.62]</td><td>62.38[60.5, 64.8]</td><td>0.22</td><td>90.80[87.4, 93.3]</td><td>0.22</td><td>0.50</td><td>0.50</td><td>0.9994</td></tr></table>

Table 18 Fit Chinchilla scaling law parameters for $L ( N , D ) = E + A / N ^ { \alpha } + B / D ^ { \beta }$ . 95% bootstrap CI shown below each estimate. Top: unconstrained fit where all five parameters are fit independently per architecture. Bottom: fixed-exponent fit where $\alpha = \beta = 0 . 2 2$ (in gray cells) (approximately the mean of the unconstrained estimates) are shared across architectures; only $E ,   A ,$ B are refit. Equal exponents imply $a _ { \mathrm { o p t } } = b _ { \mathrm { o p t } } = 0 . 5$

表 18 Chinchilla Scaling Law $L(N, D) = E + A / N^{\alpha} + B / D^{\beta}$ 的拟合参数, 每个估计值下方是 95% bootstrap CI. 上半部分: 无约束拟合, 每种架构的五个参数独立拟合. 下半部分: 固定指数拟合, $\alpha = \beta = 0.22$ (灰色单元格, 约为无约束估计的均值) 在各架构间共享, 只重新拟合 $E, A,$ B. 指数相等意味着 $a_{\mathrm{opt}} = b_{\mathrm{opt}} = 0.5$

**Fit Quality.** The $R ^ { 2 }$ values from Table 18 (0.998 for Olmo 3, 0.999 for the hybrid model, and 0.999 for the linear RNN) indicate that the power-law form fits the observed data well. Figure 14 provides additional diagnostics for the quality of the fits. Panel (a) shows (signed) relative prediction errors $( ( L - \hat { L } ) / L ) \times 1 0 0 \%$ as a function of predicted loss $\hat { L } ,$ for all data points across all model sizes. Residuals are small (within ±1%) and scattered around zero, confirming that the Chinchilla parametric form is an adequate model for all three architectures. Panel (b) reports the mean absolute relative error grouped by model size, showing that fit quality is consistent across the full range of scales (60M–1B parameters).

**拟合质量.** 表 18 中的 $R^2$ (Olmo 3 为 0.998, hybrid 模型为 0.999, 线性 RNN 为 0.999) 说明幂律形式很好地拟合了观测数据. 图 14 给出更多关于拟合质量的诊断. (a) 面板画出所有模型规模下全部数据点的 (带符号) 相对预测误差 $((L - \hat{L}) / L) \times 100\%$, 横轴是预测 loss $\hat{L}$. 残差很小 (在 ±1% 以内), 且散布在零附近, 说明 Chinchilla 参数形式对三种架构都够用. (b) 面板按模型规模分组给出平均绝对相对误差, 表明拟合质量在整个规模范围 (60M–1B 参数) 内保持一致.

#### D.1.2 Ablation Results

This section supplements Section 5.1 with additional scaling plots across all tested architectures (Figure 16) and per-domain BPB evaluations for all configurations at all scales (Table 21).

本节补充 §5.1 的内容: 全部被测架构的额外 Scaling 图 (图 16), 以及所有配置在所有规模下的分领域 BPB 评测 (表 21).

**Scaling Trends of All Tested Architectures.** Figure 16 plots the scaling of the OlmoBaseEval average score against training FLOPs for all architectures. Notably, the 7:1 configuration also shows very favorable scaling behavior, likely owing to the lower FLOP counts from having fewer transformer layers. The per-domain breakdown (Figure 16(c)–(e)) shows that the advantage of hybrid models is present across Math, Code, and QA. Fine-grained scaling plots broken down by ablation group are provided in Figures 17 to 21, showing the average and the per-cluster BPB (Math, Code, QA) as a function of training FLOPs for each configuration.

**全部被测架构的 Scaling 趋势.** 图 16 画出所有架构的 OlmoBaseEval 平均分随训练 FLOPs 的 Scaling. 值得一提的是, 7:1 配置同样表现出很好的 Scaling, 这可能是因为它的 Transformer 层更少, FLOPs 更低. 分领域拆解 (图 16(c)–(e)) 显示, hybrid 模型的优势在 Math, Code 和 QA 上都存在. 按消融组拆开的细粒度 Scaling 图见图 17 到图 21, 其中给出每个配置的平均 BPB 和分簇 BPB (Math, Code, QA) 随训练 FLOPs 的变化.

**Per-domain Breakdown.** Table 21 extends Table 5 and provides the per-domain BPB breakdown for all ablation configurations evaluated in Section 5.1. These verify that the aggregate loss improvements are consistent across domains.

**分领域拆解.** 表 21 是表 5 的扩展, 给出 §5.1 评测过的全部消融配置的分领域 BPB. 结果证实, 聚合 loss 上的改进在各个领域都一致.

### D.2 Details on the Scaling Law Fits

**Data Used for Fitting.** Each architecture’s scaling ladder consists of models trained at seven sizes and five Chinchilla multiples per size $( D / N \in \{ 1 0 , 2 0 , 4 0 , 8 0 , 1 6 0 \} )$ , using post-decay checkpoints only $\left( \mathrm { i . e . } , \right.$ checkpoints after the learning-rate decay completes). The loss signal is the average of 11 held-out validation cross-entropy losses spanning diverse domains (C4, books, Common Crawl, Pes2o, Reddit, Stack, Wikipedia, ICE, S2ORC, Pile, and Wikitext-103); this averaging reduces noise from any single domain. Non-embedding parameter counts are used throughout (embedding and language-model head parameters are excluded), and

**拟合所用数据.** 每种架构的 Scaling 阶梯包含七个模型规模, 每个规模五个 Chinchilla 倍数 ($D/N \in \{10, 20, 40, 80, 160\}$), 只使用 post-decay 检查点 (即学习率衰减完成之后的检查点). loss 信号取 11 个跨领域 held-out 验证集交叉熵 loss 的平均 (C4, books, Common Crawl, Pes2o, Reddit, Stack, Wikipedia, ICE, S2ORC, Pile 和 Wikitext-103), 取平均可以降低单一领域的噪声. 全程使用非 embedding 参数量 (不计 embedding 和语言模型头的参数), 并且

<!-- page 51 of 70 -->

Table 19 Compute-optimal model size $( N ^ { * }$ , billions), dataset size $( D ^ { * }$ , billions of tokens), and predicted loss for all three architectures. Each architecture’s fitted $a _ { \mathrm { o p t } } , b _ { \mathrm { o p t } }$ determine its compute-optimal allocation $( C = 6 N D )$ . For each loss entry: [loss CI] on the second line; $[ \triangle   \mathrm { C I } ]$ on the third line (loss reduction relative to the transformer). All CIs are 95% bootstrap intervals.

表 19 三种架构的算力最优模型大小 ($N^*$, 单位十亿), 数据量 ($D^*$, 单位十亿 token) 与预测 loss. 各架构拟合出的 $a_{\mathrm{opt}}, b_{\mathrm{opt}}$ 决定其算力最优分配 ($C = 6ND$). 每个 loss 条目中, 第二行是 [loss CI], 第三行是 [$\Delta$ CI] (相对 Transformer 的 loss 降幅). 所有 CI 都是 95% bootstrap 区间.

<table><tr><td rowspan="2">FLOPs</td><td colspan="3">Transformer</td><td colspan="3">Hybrid GDN</td><td colspan="3">Pure GDN</td></tr><tr><td> $N^{*}$ </td><td> $D^{*}$ </td><td>Loss</td><td> $N^{*}$ </td><td> $D^{*}$ </td><td>Loss</td><td> $N^{*}$ </td><td> $D^{*}$ </td><td>Loss</td></tr><tr><td> $10^{18}$ </td><td>0.2</td><td>0.8</td><td>3.57[3.52, 3.62]</td><td>0.2</td><td>0.7</td><td>3.46[3.42, 3.49][-0.19, -0.05]</td><td>0.2</td><td>1.0</td><td>3.53[3.50, 3.55][-0.10, +0.01]</td></tr><tr><td> $10^{19}$ </td><td>0.6</td><td>2.9</td><td>3.12[3.10, 3.14]</td><td>0.7</td><td>2.3</td><td>3.04[3.02, 3.05][-0.11, -0.05]</td><td>0.6</td><td>2.9</td><td>3.10[3.09, 3.10][-0.05, +0.00]</td></tr><tr><td> $10^{20}$ </td><td>1.6</td><td>10.2</td><td>2.78[2.75, 2.79]</td><td>2.2</td><td>7.4</td><td>2.71[2.69, 2.72][-0.10, -0.04]</td><td>2.0</td><td>8.2</td><td>2.76[2.74, 2.77][-0.04, +0.01]</td></tr><tr><td> $10^{21}$ </td><td>4.7</td><td>35.5</td><td>2.51[2.45, 2.55]</td><td>7.0</td><td>24.0</td><td>2.46[2.41, 2.48][-0.11, +0.01]</td><td>7.3</td><td>22.9</td><td>2.49[2.46, 2.52][-0.07, +0.04]</td></tr><tr><td> $10^{22}$ </td><td>13.5</td><td>123.6</td><td>2.31[2.21, 2.36]</td><td>21.6</td><td>77.2</td><td>2.27[2.18, 2.30][-0.14, +0.06]</td><td>26.0</td><td>64.1</td><td>2.27[2.23, 2.33][-0.10, +0.08]</td></tr><tr><td> $10^{23}$ </td><td>38.7</td><td>430.2</td><td>2.15[2.00, 2.23]</td><td>67.0</td><td>248.7</td><td>2.12[2.00, 2.16][-0.17, +0.11]</td><td>93.0</td><td>179.2</td><td>2.10[2.03, 2.18][-0.14, +0.12]</td></tr></table>

Table 20 Projected token requirements across model scales (target loss = 2.474, selected as the minimum of all observed training losses). Savings $> 1 \times$ means fewer tokens needed than the transformer. 95% bootstrap CI shown below each estimate. See also Figure 10(b).

表 20 各模型规模下的预计 token 需求 (目标 loss = 2.474, 取所有观测训练 loss 中的最小值). 节省倍数 $> 1\times$ 表示比 Transformer 需要更少的 token. 每个估计值下方是 95% bootstrap CI. 另见图 10(b).

<table><tr><td rowspan="2">N</td><td>Transformer</td><td colspan="2">Hybrid</td><td colspan="2">Pure GDN</td></tr><tr><td>D</td><td>D</td><td>Savings</td><td>D</td><td>Savings</td></tr><tr><td>1B</td><td>776.5B</td><td>587.1B</td><td> $1.32 \times [0.67, 4.02]$ </td><td>949.6B</td><td> $0.82 \times [0.45, 2.50]$ </td></tr><tr><td>3B</td><td>90.0B</td><td>57.2B</td><td> $1.57 \times [1.11, 2.50]$ </td><td>79.5B</td><td> $1.13 \times [0.77, 1.63]$ </td></tr><tr><td>7B</td><td>35.1B</td><td>20.9B</td><td> $1.68 \times [0.91, 3.47]$ </td><td>27.0B</td><td> $1.30 \times [0.68, 2.30]$ </td></tr><tr><td>13B</td><td>21.5B</td><td>12.3B</td><td> $1.75 \times [0.84, 4.12]$ </td><td>15.2B</td><td> $1.41 \times [0.65, 2.75]$ </td></tr><tr><td>30B</td><td>13.1B</td><td>7.2B</td><td> $1.82 \times [0.77, 4.98]$ </td><td>8.4B</td><td> $1.56 \times [0.61, 3.44]$ </td></tr><tr><td>70B</td><td>9.0B</td><td>4.8B</td><td> $1.89 \times [0.71, 5.81]$ </td><td>5.3B</td><td> $1.70 \times [0.57, 4.23]$ </td></tr></table>

<!-- page 52 of 70 -->

Scaling law fit diagnostics Transformer R<sup>2</sup> = 0.9976, Hybrid R<sup>2</sup> = 0.9993, Pure GDN R<sup>2</sup> = 0.9994

![Chart block](images/p52-figure-14-scaling-law-fit-diagnostics-a-residuals-are.png)

Figure 14 Scaling law fit diagnostics. (a) Residuals are small and unbiased for all architectures. (b) Mean absolute relative error stays below 1% across all model sizes, confirming reliable fits. Overall: Olmo 3 $R^{2} = 0.9976;$ Hybrid $R ^ { 2 } = 0 . 9 9 9 3 ;$ Pure GDN $R ^ { 2 } = 0 . 9 9 9 4$

图 14 Scaling Law 拟合诊断. (a) 所有架构的残差都很小且没有偏差. (b) 各个模型规模上的平均绝对相对误差都低于 1%, 说明拟合可靠. 总体: Olmo 3 $R^{2} = 0.9976$; Hybrid $R^{2} = 0.9993$; Pure GDN $R^{2} = 0.9994$

architecture-specific FLOPs are computed analytically using the parallel (chunkwise) formulations described in Section D.4.

(接上页) 各架构的 FLOPs 按 §D.4 描述的并行 (chunkwise) 形式解析计算.

**Scaling Law Fitting.** We fit the Chinchilla parametric form $L ( N , D ) = E + A / N ^ { \alpha } + B / D ^ { \beta }$ by minimizing a Huber loss over the log-residuals, using a multi-start grid optimization (with six slices of the parameter space) to avoid local minima. Bootstrap confidence intervals (95%, n = 1,000 resamples) are computed by resampling data points with replacement and re-fitting.

**Scaling Law 拟合.** 我们拟合 Chinchilla 参数形式 $L(N, D) = E + A / N^{\alpha} + B / D^{\beta}$, 目标是最小化 log 残差上的 Huber loss, 并用多起点网格优化 (把参数空间切成六片) 来避开局部极小. Bootstrap 置信区间 (95%, 重采样 n = 1,000 次) 的做法是有放回地重采样数据点, 再重新拟合.

**Construction of Figure 8.** In each panel, thin curves connect the five post-decay checkpoints (one per Chinchilla multiple) for a given model size, and a bold curve shows the fitted scaling law $L ( N , D )$ evaluated at the compute-optimal frontier : for each C, N and D are allocated optimally and the predicted loss is computed. Whereas we normally compute the FLOPs as $C   =   3 \times F _ { \mathrm { f w d } } \times D .$ , where $F _ { \mathrm { f w d } }$ is the architecture-specific forward-pass FLOPs per token (see Section D.4), in Figure 8(a) we use the simplification $C = 6 N D$ for all architectures. In panel (b), thin curves connect checkpoints of different model sizes at the same Chinchilla multiple, and in panel (c), they connect checkpoints of the same size at different Chinchilla factors. In both cases, the bold curve is evaluated at the largest Chinchilla multiple $( D / N = 1 6 0 )$

**图 8 的画法.** 每个面板中, 细曲线连接同一模型规模的五个 post-decay 检查点 (每个 Chinchilla 倍数一个), 粗曲线是拟合出的 Scaling Law $L(N, D)$ 在算力最优前沿上的取值: 对每个 C, 按最优方式分配 N 和 D, 再算出预测 loss. 平时我们按 $C = 3 \times F_{\mathrm{fwd}} \times D$ 计算 FLOPs, 其中 $F_{\mathrm{fwd}}$ 是与架构相关的每 token 前向 FLOPs (见 §D.4); 但在图 8(a) 中, 所有架构都用简化式 $C = 6ND$. (b) 面板中, 细曲线连接同一 Chinchilla 倍数下不同规模的检查点; (c) 面板中, 细曲线连接同一规模在不同 Chinchilla 倍数下的检查点. 两种情形下, 粗曲线都取最大的 Chinchilla 倍数 ($D/N = 160$).

**Construction of Figure 10.** Both panels are derived from the fitted scaling laws by analytically inverting the loss function. Panel (a) solves $L ( N , D ) = L _ { \mathrm { t a r g e t } }$ for D as a function of N:

**图 10 的画法.** 两个面板都由拟合出的 Scaling Law 解析反解 loss 函数得到. (a) 面板把 $L(N, D) = L_{\mathrm{target}}$ 解成 D 关于 N 的函数:

$$
D (N) = \left(\frac {B}{L _ {\text {target}} - E - A / N ^ {\alpha}}\right) ^ {1 / \beta},
$$

where $L _ { \mathrm { t a r g e t } }$ is set to the minimum observed training loss. This gives the projected number of training tokens each architecture needs to reach that target as a function of model size. Panel (b) plots the savings factor, defined as the ratio of the transformer’s token requirement to each other architecture’s token requirement at matched model size, i.e., $D _ { \operatorname { T r a n s f o r m e r } } ( N ) / D _ { \operatorname { a r c h } } ( N )$

其中 $L_{\mathrm{target}}$ 取观测到的最小训练 loss. 由此得到每种架构在不同模型规模下达到该目标所需的预计训练 token 数. (b) 面板画的是节省倍数, 定义为同一模型规模下 Transformer 的 token 需求与其他架构 token 需求之比, 即 $D_{\mathrm{Transformer}}(N) / D_{\mathrm{arch}}(N)$

**Construction of Table 19.** Here, we again use the simplification $C   =   6 N D$ For each compute budget $C = 6 N D$ , the compute-optimal allocation is derived from the first-order condition $\alpha A / N ^ { \alpha } = \beta \bar { B } / D ^ { \beta }$ , which

**表 19 的构造.** 这里同样使用简化式 $C = 6ND$. 对每个算力预算 $C = 6ND$, 算力最优分配由一阶条件 $\alpha A / N^{\alpha} = \beta B / D^{\beta}$ 推出, 该条件

52

> **确认:** Fig. 14 是 Scaling law fit diagnostics; 它支撑的是 §4.1 自由拟合 R^2≥0.998, 还是固定指数后的 B 区间?
> 图在附录 D.2, 服务拟合诊断 (残差等). 主文 §4.1 的 R^2≥0.998 与 Fig. 8 自由拟合对应; 固定指数 B=83.7 vs 94.9 见 Fig. 9. Fig. 14 用来检查拟合是否可信, 不改写 Fig. 9 的系数.

<!-- page 53 of 70 -->

![Chart block](images/p53-figure-15-extended-downstream-eval-training-curves.png)

Figure 15 Extended downstream eval training curves comparing Olmo Hybrid 7B and Olmo 3 7B across 6 benchmarks, sorted by token efficiency (see Figure 1 for CE loss and MMLU training curves). Olmo Hybrid reaches Olmo 3’s final performance using 19–58% fewer tokens depending on the benchmark.

图 15 Olmo Hybrid 7B 与 Olmo 3 7B 在 6 个基准上的扩展下游评测训练曲线, 按 token 效率排序 (CE loss 与 MMLU 的训练曲线见图 1). 视基准不同, Olmo Hybrid 用少 19–58% 的 token 就达到 Olmo 3 的最终表现.

gives

(接上页) 给出

$$
N ^ {*} = \left(\frac {C}{6 G}\right) ^ {a _ {\mathrm{opt}}}, \quad D ^ {*} = \frac {C}{6 N ^ {*}},
$$

where $G = ( \beta B / \alpha A ) ^ { 1 / \beta }$ and $a _ { \mathrm { o p t } } = \beta / ( \alpha + \beta )$ is each architecture’s fitted compute-optimal exponent. The predicted loss $L ( N ^ { * } , D ^ { * } )$ and the difference $\Delta$ relative to the transformer are reported with 95% bootstrap confidence intervals.

其中 $G = (\beta B / \alpha A)^{1/\beta}$, $a_{\mathrm{opt}} = \beta / (\alpha + \beta)$ 是各架构拟合出的算力最优指数. 预测 loss $L(N^*, D^*)$ 及其相对 Transformer 的差值 $\Delta$ 都附有 95% bootstrap 置信区间.

### D.3 Architectural Details

All models in our scaling ladder and ablation experiments share the same base Olmo 3 hyperparameters at each size (see Table 22): model dimension $d ,$ number of attention heads $h ,$ number of layers l, and vocabulary size $V = 1 0 0 { , } 3 5 2$ (the Dolma 2 tokenizer, padded for efficient embedding lookups). We provide some additional details on the architecture below.

Scaling 阶梯和消融实验中的所有模型, 在每个规模上共享同一套 Olmo 3 基础超参数 (见表 22): 模型维度 $d$, 注意力头数 $h$, 层数 l, 以及词表大小 $V = 100{,}352$ (Dolma 2 tokenizer, 为了 embedding 查表效率做了 padding). 下面补充若干架构细节.

**Olmo 3 (Transformer Baseline).** Each Olmo 3 layer consists of a multi-head self-attention sub-layer followed by a SwiGLU MLP (Shazeer, 2020), with RMSNorm (Zhang and Sennrich, 2019) applied before each sublayer (pre-norm). Attention uses rotary position embeddings (RoPE; Su et al., 2024) and QK-norm. No grouped-query attention is used: the number of key–value heads equals the number of query heads. The MLP hidden dimension is $\textstyle { \big [ } { \frac { 3 } { 2 } } \cdot { \frac { 8 d } { 3 } } { \big ] } _ { 2 5 6 }$ , where ⌈·⌉256 rounds up to the nearest multiple of 256. The embedding and language-model head matrices are untied.

**Olmo 3 (Transformer 基线).** 每个 Olmo 3 层由一个多头自注意力子层和一个 SwiGLU MLP (Shazeer, 2020) 组成, 每个子层之前施加 RMSNorm (Zhang and Sennrich, 2019), 即 pre-norm. 注意力使用旋转位置编码 (RoPE; Su et al., 2024) 和 QK-norm. 不使用 GQA: key–value 头数等于 query 头数. MLP 隐藏维度为 $\lceil \frac{3}{2} \cdot \frac{8d}{3} \rceil_{256}$, 其中 ⌈·⌉256 表示向上取整到 256 的倍数. embedding 矩阵与语言模型头矩阵不共享权重.

**Hybrid (GDN–Transformer).** Hybrid GDN models use the same $d ,   h ,$ and l as Olmo 3 but replace a fraction of the attention sub-layers with GDN sub-layers (Yang et al., 2025a). In our default configuration, every r-th

**Hybrid (GDN–Transformer).** Hybrid GDN 模型使用与 Olmo 3 相同的 $d, h$ 和 l, 但把一部分注意力子层换成 GDN 子层 (Yang et al., 2025a). 在默认配置中, 每第 r

53

> **看表:** Fig. 15 写 Hybrid 用 19–58% 更少 token 追上 Olmo 3; 这和 Fig. 1 的 35%/49% 是同一组曲线吗?
> 不是同一组. Fig. 1 是 CE loss 与 MMLU; Fig. 15 是另外 6 个下游基准的扩展曲线, 文注写 sorted by token efficiency, 并指向 Fig. 1 看 CE/MMLU.

<!-- page 54 of 70 -->

![Chart block](images/p54-figure-16-evaluation-metrics-vs-training-flops-a.png)

Figure 16 Evaluation metrics vs. training FLOPs. (a) Average validation cross-entropy loss across 11 held-out corpora (C4, Dolma Books/CC/pes2o/Reddit/Stack/Wiki, ICE, M2D2 S2ORC, Pile, Wikitext-103; lower is better); this is the same loss used to fit the Chinchilla scaling laws. (b) Base Easy Suite average BPB (lower is better). (c)–(e) Per-cluster Base Easy BPB for Math, Code, and QA respectively. The thick line is the fitted compute-optimal frontier.

图 16 评测指标随训练 FLOPs 的变化. (a) 11 个 held-out 语料上的平均验证交叉熵 loss (C4, Dolma Books/CC/pes2o/Reddit/Stack/Wiki, ICE, M2D2 S2ORC, Pile, Wikitext-103; 越低越好), 也就是拟合 Chinchilla Scaling Law 所用的同一个 loss. (b) Base Easy Suite 的平均 BPB (越低越好). (c)–(e) 依次为 Math, Code, QA 的分簇 Base Easy BPB. 粗线是拟合出的算力最优前沿.

<!-- page 55 of 70 -->

![Chart block](images/p55-figure-17-evaluation-metrics-vs-training-flops-for-pure.png)

Figure 17 Evaluation metrics vs. training FLOPs for pure architectures (Transformer, pure GDN, pure Mamba2). Panels follow the same layout as Figure 16: (a) average validation cross-entropy loss, (b) Base Easy Suite average BPB, and (c)–(e) per-cluster BPB for Math, Code, and QA. The thick line is the fitted compute-optimal frontier.

图 17 纯架构 (Transformer, 纯 GDN, 纯 Mamba2) 的评测指标随训练 FLOPs 的变化. 面板布局同图 16: (a) 平均验证交叉熵 loss, (b) Base Easy Suite 平均 BPB, (c)–(e) Math, Code, QA 的分簇 BPB. 粗线是拟合出的算力最优前沿.

layer is an attention layer and the remaining layers are GDN layers, where r is the transformer ratio (default $r = 4$, i.e., a 3:1 linear layer to attention ratio). We additionally enforce the final layer be an attention layer; if it is not already selected by the every-rth rule, it is added.

(接上页) 层是注意力层, 其余是 GDN 层, 其中 r 是 Transformer 比例 (默认 $r = 4$, 即线性层与注意力层之比为 3:1). 另外我们强制最后一层为注意力层; 如果按每第 r 层的规则它没有被选中, 就额外加上.

Each GDN sub-layer computes query, key, and value projections with head dimension $h _ { \mathrm { G D N } } = \lceil 0 . 7 5 \cdot d / h \rceil _ { 1 2 8 }$ yielding a key dimension of $k = h \cdot h _ { \mathrm { G D N } }$ and value dimension $v = h \cdot 2 h _ { \mathrm { G D N } } \mathrm { ( i . e . }$ , the value dimension is expanded by a factor of 2). The GDN sub-layer further includes two scalar per-head parameters $( A _ { \mathrm { l o g } }$ and $\mathrm { d t _ { b i a s } ) }$ , short depthwise convolutions (kernel size 4) over the $q ,   k ,$ and v streams, a gate projection, and an output projection. Each GDN layer retains the same SwiGLU MLP and two RMSNorms as in the Olmo 3 block.

每个 GDN 子层计算 query, key 和 value 投影, 头维度为 $h_{\mathrm{GDN}} = \lceil 0.75 \cdot d / h \rceil_{128}$, 由此 key 维度为 $k = h \cdot h_{\mathrm{GDN}}$, value 维度为 $v = h \cdot 2 h_{\mathrm{GDN}}$ (即 value 维度扩大 2 倍). GDN 子层还包括每个头两个标量参数 ($A_{\log}$ 与 $\mathrm{dt_{bias}}$), 作用在 $q, k$ 和 v 流上的短 depthwise 卷积 (kernel size 4), 一个门控投影和一个输出投影. 每个 GDN 层保留与 Olmo 3 块相同的 SwiGLU MLP 和两个 RMSNorm.

**Pure GDN.** Pure GDN models replace all attention layers with GDN layers $( \mathrm { i . e . , ~ } r \mathrm { = } 0 )$ and do not force a final attention layer. All other hyperparameters are identical to the hybrid variant.

**纯 GDN.** 纯 GDN 模型把所有注意力层都换成 GDN 层 (即 $r = 0$), 也不强制最后一层为注意力层. 其余超参数与 hybrid 版本完全相同.

**Hybrid Mamba2 (Mamba2–Transformer).** Hybrid Mamba2 models follow the same layer interleaving scheme as Hybrid GDN (r=4 by default with a forced final attention layer), but substitute Mamba2 (Dao and Gu, 2024) for the non-attention layers. The Mamba2 sub-layer uses an expansion factor of 2 (intermediate size = 2d), state size $n = 1 2 8 ,   n _ { \mathrm { g r o u p s } } = 1$ , and a depthwise convolution with kernel size 4. In our hybrid Mamba2 configuration, the Mamba2 layers retain the full MLP from the attention blocks.

**Hybrid Mamba2 (Mamba2–Transformer).** Hybrid Mamba2 模型沿用 Hybrid GDN 的层交错方案 (默认 r=4, 强制最后一层为注意力层), 但把非注意力层换成 Mamba2 (Dao and Gu, 2024). Mamba2 子层的扩展因子为 2 (中间维度 = 2d), 状态大小 $n = 128$, $n_{\mathrm{groups}} = 1$, depthwise 卷积的 kernel size 为 4. 在我们的 hybrid Mamba2 配置中, Mamba2 层保留注意力块里的完整 MLP.

### D.4 Parameter Count and FLOP Computations

We report total (non-embedding) parameter counts and forward-pass floating-point operations (FLOPs) per token for each model. Both quantities are computed analytically from the architecture specification; the formulas are detailed below.

我们报告每个模型的总 (非 embedding) 参数量和每 token 的前向浮点运算量 (FLOPs). 两者都由架构规格解析算出, 公式如下.

55

> **回看:** Fig. 17 标题是 pure architectures 的 FLOPs–指标; 和 Tab. 5 的 BPB 消融如何分工?
> Tab. 5 是离散规模上的平均 BPB 表; Fig. 16–21 是按 FLOPs 投影的曲线族. 读纯 Transformer/GDN/Mamba2 走势看 Fig. 17; 读选定 3:1 数字仍以 Tab. 5 为准.

<!-- page 56 of 70 -->

![Chart block](images/p56-figure-18-evaluation-metrics-vs-training-flops-for.png)

Figure 18 Evaluation metrics vs. training FLOPs for hybrid architectures (GDN hybrid with interleaved and middle placement, Mamba2 hybrid). Panels follow the same layout as Figure 16: (a) average validation cross-entropy loss, (b) Base Easy Suite average BPB, and (c)–(e) per-cluster BPB for Math, Code, and QA. The thick line is the fitted compute-optimal frontier.

图 18 hybrid 架构 (交错放置与居中放置的 GDN hybrid, 以及 Mamba2 hybrid) 的评测指标随训练 FLOPs 的变化. 面板布局同图 16: (a) 平均验证交叉熵 loss, (b) Base Easy Suite 平均 BPB, (c)–(e) Math, Code, QA 的分簇 BPB. 粗线是拟合出的算力最优前沿.

<!-- page 57 of 70 -->

![Chart block](images/p57-figure-19-evaluation-metrics-vs-training-flops-for-gdn.png)

Figure 19 Evaluation metrics vs. training FLOPs for GDN hybrid models with varying linear-to-attention ratios (1:1, 3:1, 7:1). Panels follow the same layout as Figure 16: (a) average validation cross-entropy loss, (b) Base Easy Suite average BPB, and (c)–(e) per-cluster BPB for Math, Code, and QA. The thick line is the fitted compute-optimal frontier.

图 19 不同线性层与注意力层比例 (1:1, 3:1, 7:1) 的 GDN hybrid 模型的评测指标随训练 FLOPs 的变化. 面板布局同图 16: (a) 平均验证交叉熵 loss, (b) Base Easy Suite 平均 BPB, (c)–(e) Math, Code, QA 的分簇 BPB. 粗线是拟合出的算力最优前沿.

<!-- page 58 of 70 -->

![Chart block](images/p58-figure-20-evaluation-metrics-vs-training-flops-for-gdn.png)

Figure 20 Evaluation metrics vs. training FLOPs for GDN ablations (e.g., GDN with and without negative eigenvalues). Panels follow the same layout as Figure 16: (a) average validation cross-entropy loss, (b) Base Easy Suite average BPB, and (c)–(e) per-cluster BPB for Math, Code, and QA. The thick line is the fitted compute-optimal frontier.

图 20 GDN 消融 (例如带与不带负特征值的 GDN) 的评测指标随训练 FLOPs 的变化. 面板布局同图 16: (a) 平均验证交叉熵 loss, (b) Base Easy Suite 平均 BPB, (c)–(e) Math, Code, QA 的分簇 BPB. 粗线是拟合出的算力最优前沿.

**Parameter Counting.** The total parameter count is the sum of embedding, language-model head, per-layer, and final layer-norm parameters:

**参数计数.** 总参数量是 embedding, 语言模型头, 各层以及最终 layer-norm 参数之和:

$$
N _ {\text {total}} = \underbrace {V \cdot d} _ {\text {embed}} + \underbrace {V \cdot d} _ {\text {LM head}} + \sum_ {\ell = 1} ^ {l} N _ {\text {layer}} ^ {(\ell)} + \underbrace {d} _ {\text {final norm}},\tag{2}
$$

where $N _ { \mathrm { l a y e r } } ^ { ( \ell ) }$ depends on the layer type. Non-embedding parameters are $N _ { \operatorname { n o n - e m b } } = N _ { \operatorname { t o t a l } } - V \cdot d .$

其中 $N_{\mathrm{layer}}^{(\ell)}$ 取决于层的类型. 非 embedding 参数为 $N_{\mathrm{non\text{-}emb}} = N_{\mathrm{total}} - V \cdot d$.

For an **attention layer**, the sub-layer parameter count is:

**注意力层**的子层参数量为:

$$
N _ {\mathrm{attn}} = \underbrace {4 d ^ {2}} _ {\mathrm{Q, K, V, O projections}} + \underbrace {2 d} _ {\mathrm{QK-norm}} + \underbrace {3 d \cdot d _ {\mathrm{MLP}}} _ {\mathrm{SwiGLU MLP}} + \underbrace {2 d} _ {\mathrm{2RMSNorms}},\tag{3}
$$

where $\begin{array} { r } { d _ { \mathrm { M L P } } = \lceil \frac { 3 } { 2 } \cdot \frac { 8 d } { 3 } \rceil _ { 2 5 6 } } \end{array}$ is the MLP hidden size.

其中 $d_{\mathrm{MLP}} = \lceil \frac{3}{2} \cdot \frac{8d}{3} \rceil_{256}$ 是 MLP 隐藏维度.

For a **GDN layer**, letting $k = h \cdot h _ { \mathrm { G D N } }$ and $v = 2 k$ denote the total key and value dimensions:

对 **GDN 层**, 记 $k = h \cdot h_{\mathrm{GDN}}$ 和 $v = 2k$ 分别为总 key 维度与总 value 维度:

$$
N_{\mathrm{GDN}} = \underbrace{d(2k + v + 2h)}_{\substack{\text{q, k, v, a, b}\\ \text{projections}}} + \underbrace{2h}_{A_{\log}, \text{dt} _{\text{bias}}} + \underbrace{(2k + v)\cdot 4}_{\text{short convolutions}} + \underbrace{dv}_{\substack{\text{gate}\\ \text{projection}}} + \underbrace{v}_{\substack{\text{norm}}} + \underbrace{vd}_{\substack{\text{output}\\ \text{projection}}} + \underbrace{3d\cdot d_{\mathrm{MLP}}}_{\mathrm{MLP}} + \underbrace{2d}_{\substack{\text{norms}}}.\tag{4}
$$

For a **Mamba2 layer**, letting $e = 2 d$ (intermediate size), $c = e + 2 n _ { \mathrm { g r o u p s } } \cdot n$ (convolution dimension), and $p = e + c + h$ (projection size):

对 **Mamba2 层**, 记 $e = 2d$ (中间维度), $c = e + 2 n_{\mathrm{groups}} \cdot n$ (卷积维度), $p = e + c + h$ (投影维度):

$$
N _ {\mathrm{mamba2}} = \underbrace {d \cdot p + p} _ {\text {in projection}} + \underbrace {c \cdot 4} _ {\text {conv1d}} + \underbrace {3 h} _ {\text {dt, A, D}} + \underbrace {e} _ {\text {norm}} + \underbrace {e \cdot d + d} _ {\text {out projection}} + \underbrace {3 d \cdot d _ {\mathrm{MLP}}} _ {\text {SwiGLU MLP}} + \underbrace {2 d} _ {\text {layer norms}}.\tag{5}
$$

<!-- page 59 of 70 -->

![Chart block](images/p59-figure-21-evaluation-metrics-vs-training-flops-for-gdn.png)

Figure 21 Evaluation metrics vs. training FLOPs for GDN hybrid ablations (e.g., hybrid GDN with and without negative eigenvalues). Panels follow the same layout as Figure 16: (a) average validation cross-entropy loss, (b) Base Easy Suite average BPB, and (c)–(e) per-cluster BPB for Math, Code, and QA. The thick line is the fitted compute-optimal frontier.

图 21 GDN hybrid 消融 (例如带与不带负特征值的 hybrid GDN) 的评测指标随训练 FLOPs 的变化. 面板布局同图 16: (a) 平均验证交叉熵 loss, (b) Base Easy Suite 平均 BPB, (c)–(e) Math, Code, QA 的分簇 BPB. 粗线是拟合出的算力最优前沿.

<!-- page 60 of 70 -->

#### D.4.1 FLOP Counting

We estimate forward-pass FLOPs per token using the standard convention $\mathrm { F L O P s } = 2 \times \mathrm { M A C s ( m u l t i p l y } \cdot$ accumulate operations). The total FLOPs per token are:

每 token 的前向 FLOPs 按标准约定 $\mathrm{FLOPs} = 2 \times \mathrm{MACs}$ (乘加运算次数) 估计. 每 token 的总 FLOPs 为:

$$
F = 2 \left(\underbrace {d \cdot V} _ {\text {LM head}} + \sum_ {\ell = 1} ^ {l} M _ {\text {layer}} ^ {(\ell)}\right),\tag{6}
$$

where $M _ { \mathrm { l a y e r } } ^ { ( \ell ) }$ is the per-token MAC count for layer ℓ. Embedding lookups are excluded as they involve no arithmetic. For **attention layers**, the MACs per token include both the projections and the sequence-lengthdependent attention computation. For causal attention, we use the average context length $s _ { \mathrm { e f f } } = s / 2 ;$

其中 $M_{\mathrm{layer}}^{(\ell)}$ 是第 ℓ 层每 token 的 MAC 数. embedding 查表不涉及算术运算, 不计入. 对**注意力层**, 每 token 的 MACs 既包括投影, 也包括随序列长度变化的注意力计算. 因果注意力取平均上下文长度 $s_{\mathrm{eff}} = s/2$:

$$
M _ {\mathrm{attn}} = \underbrace {4 d ^ {2}} _ {\mathrm{Q, K, V, O}} + \underbrace {h \cdot \frac {d}{h} \cdot s _ {\mathrm{eff}}} _ {\text {scores (QK} ^ {\top})} + \underbrace {h \cdot \frac {d}{h} \cdot s _ {\mathrm{eff}}} _ {\text {output (attn} \cdot V)} + \underbrace {\frac {5}{2} \cdot h \cdot s _ {\mathrm{eff}}} _ {\text {softmax}} + \underbrace {3 d \cdot d _ {\mathrm{MLP}}} _ {\text {MLP}} = 4 d ^ {2} + d s + 3 d \cdot d _ {\mathrm{MLP}},\tag{7}
$$

where s is the sequence length. The factor $\frac { 5 } { 2 }$ in front of the softmax contribution accounts for the $5 s _ { \mathrm { e f f } } \; \mathrm { F L O P s }$ usually attributed to softmax normalization (Beck et al., 2026) divided by 2 since the expression computes MACs.

其中 s 是序列长度. softmax 项前面的系数 $\frac{5}{2}$ 来自通常归给 softmax 归一化的 $5 s_{\mathrm{eff}}$ FLOPs (Beck et al., 2026); 因为式子算的是 MACs, 所以除以 2.

For the linear recurrent layers (GDN and Mamba2), we first present per-token MACs in the recurrent formulation, and then describe the chunkwise parallel formulation used during training.

对线性递归层 (GDN 与 Mamba2), 我们先给出递归形式下每 token 的 MACs, 再说明训练时使用的 chunkwise 并行形式.

**Recurrent Formulation.** For **GDN layers**, the per-token MACs include projections, convolutions, the recurrence, and the MLP. The delta rule requires three state interactions (retention projection, state update, output projection):

**递归形式.** 对 **GDN 层**, 每 token 的 MACs 包括投影, 卷积, 递归和 MLP. delta rule 需要三次状态交互 (保留投影, 状态更新, 输出投影):

$$
M _ {\mathrm{GDN}} = \underbrace {d (2 k + v + 2 h)} _ {\text {linear projs}} + \underbrace {4 (2 k + v)} _ {\text {depthwise convs}} + \underbrace {d v} _ {\text {gate proj}} + \underbrace {v d} _ {\text {out proj}} + \underbrace {3 \cdot h \cdot h _ {\mathrm{GDN}} \cdot 2 h _ {\mathrm{GDN}}} _ {\substack{\text {recurrence}\\ (Sk, uv^{T},Sq)}} + \underbrace {3 d \cdot d _ {\mathrm{MLP}}} _ {\mathrm{MLP}}.\tag{8}
$$

For **Mamba2 layers**, the recurrence involves two state interactions (state update and output projection):

对 **Mamba2 层**, 递归包含两次状态交互 (状态更新与输出投影):

$$
M _ {\text {mamba2}} = \underbrace {d \cdot p} _ {\text {in proj}} + \underbrace {4 c} _ {\text {conv1d}} + \underbrace {e \cdot d} _ {\text {out proj}} + \underbrace {2 \cdot h \cdot \frac {e}{h} \cdot n} _ {\text {SSM recurrence} (v k ^ {T}, S q)} + \underbrace {3 d \cdot d _ {\mathrm{MLP}}} _ {\text {MLP}}.\tag{9}
$$

**Parallel (Chunkwise) Formulation.** While the recurrent formulation above describes inference-time FLOPs, training utilizes hardware-efficient chunkwise parallel algorithms. For Gated DeltaNet, we utilize the **Extended WY Representation** algorithm (Yang et al., 2025a), which folds the data-dependent decay terms directly into the update matrices, avoiding the need for log-space computations or sub-tiling required by previous gated linear attention methods (Yang et al., 2024b). Training FLOPs account for the overhead of intra-chunk local attention and inter-chunk state passing.

**并行 (Chunkwise) 形式.** 上面的递归形式描述的是推理时的 FLOPs, 训练则使用对硬件友好的 chunkwise 并行算法. 对 Gated DeltaNet, 我们使用 **Extended WY Representation** 算法 (Yang et al., 2025a). 它把数据相关的衰减项直接并入更新矩阵, 省去了此前门控线性注意力方法需要的 log 空间计算或子分块 (Yang et al., 2024b). 训练 FLOPs 计入块内局部注意力和块间状态传递的开销.

For **GDN layers**, the Extended WY algorithm introduces overheads proportional to the chunk size $L _ { \mathrm { c h u n k } }$ (set to 256) for constructing the kernel, update matrices (W, U), and computing local attention.

对 **GDN 层**, Extended WY 算法在构造核, 构造更新矩阵 (W, U) 以及计算局部注意力时, 会引入与块大小 $L_{\mathrm{chunk}}$ (设为 256) 成正比的开销.

$$
M _ {\mathrm{GDN}, \text {train}} = \underbrace {M _ {\text {proj, conv, MLP}}} _ {\text {sequence - independent}} + \underbrace {L _ {\text {chunk}} (3 k + 2 v)} _ {\text {intra - chunk overhead (Kernel, W / U, Attn)}} + \underbrace {3 \cdot \frac {k v}{h}} _ {\text {inter - chunk state passing}},\tag{10}
$$

where $M _ { \mathrm { p r o j , c o n v , M L P } }$ represents the cost of projections, convolutions, and MLPs (identical to the recurrent formulation). The intra-chunk coefficient $( 3 k + 2 v )$ accounts for the construction of $\begin{array} { r } { K K ^ { \top } , \: W , \: U , \: Q K ^ { \top } } \end{array}$ and the final output computation. The inter-chunk cost $( 3 k v / h )$ represents the three matrix multiplications required to propagate the hidden state $( Q S ^ { \top } ,   U ^ { \top } K ,   W \dot { S ^ { \top } } )$

其中 $M_{\mathrm{proj,conv,MLP}}$ 表示投影, 卷积和 MLP 的开销 (与递归形式相同). 块内系数 $(3k + 2v)$ 计入 $KK^{\top}, W, U, QK^{\top}$ 的构造以及最终的输出计算. 块间开销 $(3kv/h)$ 对应传播隐藏状态所需的三次矩阵乘法 $(QS^{\top}, U^{\top}K, WS^{\top})$.

60

> **拆开:** §D.4.1 FLOP counting 若把 GDN 状态更新算进训练 FLOPs, 是否仍用主文 C=6ND 启发式?
> 主文 Fig. 2 / 开源对照用 Kaplan C=6ND. 附录 D.4 给更细的参数量与 FLOP 计算, 用于 Scaling 阶梯内部对齐; 引用开源 Pareto 时仍按主文启发式, 不要把两套算法混成一行.

<!-- page 61 of 70 -->

For **Mamba2 layers**, utilizing the sequential chunkwise algorithm (instead of parallel scan) reduces the state-passing overhead to simple unidirectional updates:

对 **Mamba2 层**, 使用顺序 chunkwise 算法 (而不是并行 scan) 可以把状态传递的开销降为简单的单向更新:

$$
M_{\text{mamba2, train}} = \underbrace{M_{\text{proj, conv, MLP}}}_{\text{sequence - independent}} + \underbrace{2\cdot L_{\text{chunk}}\cdot e}_{\substack{\text{intra - chunk}\\ \text{SSD mixing}}} + \underbrace{2\cdot e\cdot n}_{\substack{\text{inter - chunk}\\ \text{state passing}}},\tag{11}
$$

where e is the intermediate size and n is the state size. The inter-chunk cost accounts for the unidirectional state passing (state update $S + V K ^ { \top }$ and output computation $Q S ^ { \top } )$ required by the sequential algorithm.

其中 e 是中间维度, n 是状态大小. 块间开销计入顺序算法所需的单向状态传递 (状态更新 $S + VK^{\top}$ 与输出计算 $QS^{\top}$).

For the scaling law fits, we use the analytically computed training FLOPs per token $F$ (using the parallel formulation) to obtain the compute estimate $C = 3 F D$ (accounting for forward and backward passes).

拟合 Scaling Law 时, 我们用解析算出的每 token 训练 FLOPs $F$ (按并行形式) 得到算力估计 $C = 3FD$ (同时计入前向和反向).

## E Proofs: Increased Expressive Power Improves Scaling

In the main text, we have theoretically explained how increasing an architecture’s expressivity can lead to better scaling on a language modeling objective, working in the idealized setup of the quantization model for neural scaling laws. We now clarify details of the quantization model and provide deferred proofs.

正文在神经 Scaling Laws 的 quantization model 这一理想化设定下, 从理论上解释了提高架构的表达力为什么能改善语言建模目标上的 Scaling. 这里补充 quantization model 的细节, 并给出正文推迟的证明.

Michaud et al. (2023) introduce the quantization model of neural scaling laws, which we will augment to take into account expressivity limitations of different architectures. First, we fully define the quantization model, starting with the notion of a learnable task:

Michaud et al. (2023) 提出了神经 Scaling Laws 的 quantization model, 我们在此基础上扩充, 把不同架构的表达力限制考虑进来. 先完整定义 quantization model, 从可学任务这个概念开始:

**Definition 3: Learnable Task**

Task k is learnable with D tokens if $\begin{array} { r } { D \geq \frac { 1 } { p _ { k } } T _ { k } } \end{array}$ i.e., we can expect to observe enough relevant tokens leveraging task k within the D tokens.

如果 $D \geq \frac{1}{p_k} T_k$, 就说任务 k 用 D 个 token 可学, 意思是可以预期在这 D 个 token 中观察到足够多用到任务 k 的相关 token.

In the quantization model, an idealized LM learner proceeds by allocating parameters to learn learnable tasks, ordered by their frequency:

在 quantization model 中, 理想化的 LM 学习者把参数分配给可学任务, 按任务频率依次学习:

**Definition 4: Quantization Model**

The learner is given N parameters and D samples. It proceeds by ranking all tasks k learnable with D samples by their frequency $p _ { k }$ in the data, greedily spending $C _ { k }$ samples to learn task k in this order until the parameter budget N is exceeded.

学习者拥有 N 个参数和 D 个样本. 它把所有用 D 个样本可学的任务 k 按其在数据中的频率 $p_k$ 排序, 按这个顺序贪心地花费 $C_k$ 去学任务 k, 直到超出参数预算 N.

Let $X _ { k }$ be a random variable representing the loss achieved on task k. We will analyze $\tilde { L } ,$ the expected loss across all tasks, which can be defined as

令 $X_k$ 为任务 k 上所得 loss 的随机变量. 我们分析所有任务上的期望 loss $\tilde{L}$, 其定义为

$$
\tilde {L} = \mathbb {E} \left[ \sum_ {k = 1} ^ {\infty} X _ {k} p _ {k} \right].
$$

We incorporate expressivity into the quantization model via the following assumptions, restated from the main text:

我们通过下面几条假设把表达力纳入 quantization model, 这些假设与正文相同:

**Assumption 1: Only Some Tasks Are Expressible**

For a given architecture, each task is either expressible or inexpressible, modeled as an iid boolean random variable where the probability that any individual task is expressible is $1 - \epsilon .$

对给定架构, 每个任务要么可表达, 要么不可表达, 建模为 iid 的布尔随机变量, 单个任务可表达的概率为 $1 - \epsilon$.

**Assumption 2: Expressible Tasks Can Be Learned to Lower Loss**

Tokens leveraging unlearned tasks incur loss $L _ { 0 }$ If a task k has been learned, the loss incurred by the learner on a token leveraging $k$ is reduced to $L _ { 0 } - \Delta$ if k is expressible by that learner and to $L _ { 0 } - \Delta ^ { \prime }$ if k is inexpressible, for some $\Delta , \Delta ^ { \prime } > 0$ and $\Delta ^ { \prime } \leq \Delta$

用到未学任务的 token 产生 loss $L_0$. 如果任务 k 已经学会, 学习者在用到 k 的 token 上的 loss 会降低: k 对该学习者可表达时降到 $L_0 - \Delta$, 不可表达时降到 $L_0 - \Delta'$, 其中 $\Delta, \Delta' > 0$ 且 $\Delta' \leq \Delta$.

61

> **对一下:** Appendix E Definition 3/4 与主文 Assumption 1–3 谁先谁后? Theorem 4 的证明落在 E.1–E.4 哪一节收束?
> 主文 §4.2 陈述 Assumption 1–3 与 Theorem 4; 附录 E 给出 Definition 3/4 与证明细节. E.4 Main Results 收束 Corollary 4.1/4.2. 读定理先主文, 核对推导再进 E.

<!-- page 62 of 70 -->

**Assumption 3: Expressible Tasks Can Be Learned with Fewer Parameters and Tokens**

Each expressible task is representable with $C$ parameters and learnable with T relevant tokens. $\mathrm { A n }$ inexpressible task requires $C ^ { \prime } \geq C$ parameters to represent approximately and is learnable with $T ^ { \prime } \geq T$ relevant tokens.

每个可表达任务用 $C$ 个参数就能表示, 用 T 个相关 token 就能学会. 不可表达任务需要 $C' \geq C$ 个参数才能近似表示, 需要 $T' \geq T$ 个相关 token 才能学会.

It follows from these assumptions that, for an unlearned task, $X _ { k } = b ,$ but, for a learned task,

由这些假设, 未学任务有 $X_k = b$; 已学任务则有

$$
X _ {k} = \left\{ \begin{array}{l l} a & \text {w.p.} 1 - \epsilon \\ a ^ {\prime} & \text {otherwise.} \end{array} \right.
$$

In contrast, for any task $k ,$ we have the following sample complexity and parameter requirements:

而对任意任务 $k$, 样本复杂度和参数需求如下:

$$
T _ {k} = \left\{ \begin{array}{l l} T & \text {w.p.} 1 - \epsilon \\ T ^ {\prime} & \text {otherwise.} \end{array} \right.
$$

$$
C _ {k} = \left\{ \begin{array}{l l} C & \text {w.p.} 1 - \epsilon \\ C ^ {\prime} & \text {otherwise.} \end{array} \right.
$$

We will assume $T ^ { \prime } \geq T .$ , that is, inexpressible tasks require at least as many samples to approximate as expressible tasks. It is natural to imagine $C ^ { \prime } \geq C$ , though we may also consider the case where $C ^ { \prime } = 0$ and $\Delta ^ { \prime } = 0 ,   \mathrm { i . e . }$ , inexpressible tasks are completely ignored by the learner.

我们假设 $T' \geq T$, 即不可表达任务近似所需的样本至少和可表达任务一样多. $C' \geq C$ 也很自然, 不过也可以考虑 $C' = 0$ 且 $\Delta' = 0$ 的情形, 也就是学习者完全忽略不可表达任务.

### E.1 Scaling Law with Tasks Learned

We first slightly generalize the original scaling law from Michaud et al. (2023) in the following way:

我们先把 Michaud et al. (2023) 的原始 Scaling Law 稍作推广:

**Lemma 3** For every learned task k, let $X _ { k }$ be an independent random variable with mean a. Similarly, for every unlearned task $k _ { z }$ let $X _ { k }$ be an independent random variable with mean b. Then the expected loss $\tilde { L } _ { n }$ after learning n tasks is

**引理 3** 对每个已学任务 k, 令 $X_k$ 为均值为 a 的独立随机变量; 对每个未学任务 k, 令 $X_k$ 为均值为 b 的独立随机变量. 那么学会 n 个任务之后的期望 loss $\tilde{L}_n$ 为

$$
\tilde {L} _ {n} = a + \frac {b - a}{\zeta (\alpha + 1)} \sum_ {k = n + 1} ^ {\infty} k ^ {- (\alpha + 1)}.
$$

Further, the following $L _ { n }$ closely approximates $\tilde { L } _ { n }$ :

并且下面的 $L_n$ 能很好地近似 $\tilde{L}_n$:

$$
L _ {n} = a + \frac {b - a}{\alpha \zeta (\alpha + 1)} n ^ {- \alpha},
$$

in the sense that $L _ { n + 1 } \leq \tilde { L } _ { n } \leq L _ { n }$ , and thus the true loss $\tilde { L } _ { n }$ rapidly converges to the power law $L _ { n }$ .

这里的近似是指 $L_{n+1} \leq \tilde{L}_n \leq L_n$, 因此真实 loss $\tilde{L}_n$ 会迅速收敛到幂律 $L_n$.

Proof. The expression for the first part, $\tilde { L } _ { n } ,$ is a straightforward extension to the original derivation from Michaud et al. (2023). For the approximation, we observe that the terms in the summation $\textstyle \sum _ { n + 1 } ^ { \infty } n ^ { - ( \alpha + 1 ) }$ represent a step function, which is naturally lower and upper bounded by the corresponding continuous “envelopes” of the step function as follows:

证明. 第一部分 $\tilde{L}_n$ 的表达式是对 Michaud et al. (2023) 原始推导的直接推广. 对于近似部分, 注意求和 $\sum_{n+1}^{\infty} n^{-(\alpha+1)}$ 的各项构成一个阶梯函数, 它自然被对应的连续 「包络」 从上下两侧夹住:

$$
\left| \int_ {n + 1} ^ {\infty} k ^ {- (\alpha + 1)} d k \leq \sum_ {k = n + 1} ^ {\infty} k ^ {- (\alpha + 1)} \leq \int_ {n} ^ {\infty} k ^ {- (\alpha + 1)} d k \right.
$$

which simplifies to

化简后为

$$
\left| \frac {(n + 1) ^ {- \alpha}}{\alpha} \leq \sum_ {k = n + 1} ^ {\infty} k ^ {- (\alpha + 1)} \leq \frac {n ^ {- \alpha}}{\alpha}. \right|
$$

<!-- page 63 of 70 -->

It follows that $\tilde { L } _ { n }$ is sandwiched between $L _ { n + 1 }$ and $L _ { n } ,$ and rapidly approaches $L _ { n }$ in the following sense:

(接上页) 于是 $\tilde{L}_n$ 夹在 $L_{n+1}$ 与 $L_n$ 之间, 并在如下意义上迅速逼近 $L_n$:

$$
\begin{array}{r l} \frac {L _ {n} - \tilde {L} _ {n}}{\tilde {L} _ {n}} & = \frac {L _ {n}}{\tilde {L} _ {n}} - 1 \leq \frac {L _ {n}}{L _ {n + 1}} - 1 \\ & = \frac {a + \frac {b - a}{\alpha \zeta (\alpha + 1)} n ^ {- \alpha}}{a + \frac {b - a}{\alpha \zeta (\alpha + 1)} (n + 1) ^ {- \alpha}} - 1 \\ & \leq \frac {n ^ {- \alpha}}{(n + 1) ^ {- \alpha}} - 1 \\ & = \frac {(n + 1) ^ {\alpha} - n ^ {\alpha}}{n ^ {\alpha}} \\ & = \frac {\alpha n ^ {\alpha - 1} + \frac {\alpha (\alpha - 1)}{2 !} n ^ {\alpha - 2} + \ldots}{n ^ {\alpha}} \\ & = O (1 / n) \end{array}
$$

Thus, the relative error $( L _ { n } - \tilde { L } _ { n } ) / \tilde { L } _ { n }$ is only $O ( 1 / n )$

所以相对误差 $(L_n - \tilde{L}_n) / \tilde{L}_n$ 只有 $O(1/n)$.

In the upcoming results, we will follow Michaud et al. (2023) in using the approximation $L _ { n }$ from Lemma 3. Having established a general result about analyzing the quantization model, we consider its instantiation in the expressivity-aware case:

后面的结果沿用 Michaud et al. (2023) 的做法, 使用引理 3 中的近似 $L_n$. 有了分析 quantization model 的这个一般结果, 下面看它在考虑表达力时的具体形式:

**Corollary 3.1** Adopt Assumptions 1 and 2, i.e., tasks are expressible w.p. $1 - \epsilon ,$ achieving loss $L _ { 0 } - \Delta$ when learned, or inexpressible w.p. ϵ, achieving loss $L _ { 0 } - \Delta ^ { \prime }$ when learned. Then the expected loss $\tilde { L } _ { n } ^ { \epsilon }$ after learning n tasks is closely approximated by $L _ { n } ^ { \epsilon }$ where:

**推论 3.1** 采用假设 1 和假设 2: 任务以概率 $1 - \epsilon$ 可表达, 学会后 loss 为 $L_0 - \Delta$; 以概率 ϵ 不可表达, 学会后 loss 为 $L_0 - \Delta'$. 那么学会 n 个任务之后的期望 loss $\tilde{L}_n^{\epsilon}$ 可以由 $L_n^{\epsilon}$ 很好地近似, 其中:

$$
L _ {n} ^ {\epsilon} = L _ {\infty} ^ {\epsilon} + \frac {L _ {0} - L _ {\infty} ^ {\epsilon}}{\alpha \zeta (\alpha + 1)} \cdot n ^ {- \alpha},
$$

and $\begin{array} { r } { L _ { \infty } ^ { \epsilon } = L _ { 0 } - ( 1 - \epsilon ) \Delta - \epsilon \Delta ^ { \prime } . } \end{array}$

且 $L_{\infty}^{\epsilon} = L_0 - (1 - \epsilon)\Delta - \epsilon\Delta'$.

The irreducible loss term $L _ { \infty } ^ { \epsilon }$ will be the same in this scaling law as in the upcoming scaling laws for parameters and tokens. Quite naturally, it interpolates between the reduced loss of expressible and inexpressible tasks. Assuming $\Delta ^ { \prime } < \Delta$ , then, for any $\tilde { \epsilon } > \epsilon ,$ we will have $L _ { \infty } ^ { \tilde { \epsilon } } > L _ { \infty } ^ { \epsilon }$ . Furthermore, the following shows that this reduction in irreducible loss translates to a reduction in loss everywhere along the loss curve:

这个 Scaling Law 中的不可约 loss 项 $L_{\infty}^{\epsilon}$, 与后面参数和 token 的 Scaling Law 中的不可约 loss 相同. 它很自然地在可表达任务与不可表达任务各自降低后的 loss 之间插值. 若 $\Delta' < \Delta$, 则对任意 $\tilde{\epsilon} > \epsilon$ 都有 $L_{\infty}^{\tilde{\epsilon}} > L_{\infty}^{\epsilon}$. 下面进一步说明, 不可约 loss 的降低会转化为整条 loss 曲线上处处降低:

**Lemma 4** Fix $f , f ^ { \prime } : \mathbb { N } \to ( 0 , 1 )$ with $f ^ { \prime } ( n ) \geq f ( n )$ for all n. Define

**引理 4** 取 $f, f' : \mathbb{N} \to (0, 1)$, 且对所有 n 有 $f'(n) \geq f(n)$. 定义

$$
\begin{array}{l} L _ {n} = a + (b - a) f (n) \\ L _ {n} ^ {\prime} = a ^ {\prime} + (b - a ^ {\prime}) f ^ {\prime} (n). \end{array}
$$

Then, $\mathit { i f } \: a ^ { \prime } > a ,$ it holds that $L _ { n } ^ { \prime } > L _ { n }$ for all n.

那么若 $a' > a$, 对所有 n 都有 $L_n' > L_n$.

Proof. Define $\Delta L _ { n } = L _ { n } ^ { \prime } - L _ { n }$ . We show that, if $a ^ { \prime } > a$ , it holds that $\Delta L _ { n } > 0$ for all n. By definition,

证明. 定义 $\Delta L_n = L_n' - L_n$. 下面证明: 若 $a' > a$, 则对所有 n 有 $\Delta L_n > 0$. 按定义,

$$
\begin{array}{r l} \Delta L _ {n} & = a ^ {\prime} - a + (b - a ^ {\prime}) f ^ {\prime} (n) - (b - a) f (n) \\ & \geq a ^ {\prime} - a + (b - a ^ {\prime}) f (n) - (b - a) f (n) \\ & = (a ^ {\prime} - a)   (1 - f (n))  . \end{array}
$$

Since $f(n) \in (0,1)$ , we have $\Delta L _ { n } > 0$ as long as $a ^ { \prime } > a$

由于 $f(n) \in (0,1)$, 只要 $a' > a$ 就有 $\Delta L_n > 0$.

Combining Corollary 3.1 and Lemma 4, the fact that we have $L _ { \infty } ^ { \tilde { \epsilon } } > L _ { \infty } ^ { \epsilon }$ implies that $L _ { n } ^ { \tilde { \epsilon } } > L _ { n } ^ { \epsilon }$ for any n.

结合推论 3.1 与引理 4, 由 $L_{\infty}^{\tilde{\epsilon}} > L_{\infty}^{\epsilon}$ 可以推出: 对任意 n 都有 $L_n^{\tilde{\epsilon}} > L_n^{\epsilon}$.

<!-- page 64 of 70 -->

### E.2 Parameter Scaling Law

Define $\tilde { L } ( N ) = \mathbb { E } \left[ L _ { n _ { N } } \right]$ , where n<sub>N</sub> is the expected number of tasks we can learn with N parameters.

定义 $\tilde{L}(N) = \mathbb{E}[L_{n_N}]$, 其中 n<sub>N</sub> 是用 N 个参数能学会的期望任务数.

**Lemma 5** Adopt the assumptions of Lemma 3. Further, assume the parameter cost of task k is a random variable $C _ { k }$ , independent across k with mean c. Then, as a function of the number of parameters $N _ { z }$ the loss $\tilde { L } ( N )$ in the quantization model is closely approximated by a power law, i.e., $\widetilde { L } ( N ) \stackrel { \sim } { \approx } L ( N )$ where:

**引理 5** 采用引理 3 的假设. 再假设任务 k 的参数开销是随机变量 $C_k$, 各 k 之间独立, 均值为 c. 那么作为参数量 $N$ 的函数, quantization model 中的 loss $\tilde{L}(N)$ 可以由幂律很好地近似, 即 $\tilde{L}(N) \approx L(N)$, 其中:

$$
L (N) = a + c ^ {\alpha} \cdot \frac {b - a}{\alpha \zeta (\alpha + 1)} \cdot N ^ {- \alpha}.
$$

Proof. The expected number of tasks $n _ { N }$ we can learn with N parameters satisfies

证明. 用 N 个参数能学会的期望任务数 $n_N$ 满足

$$
N \geq \sum_ {k = 1} ^ {n _ {N}} C _ {k} = n _ {N} \cdot c,
$$

which implies $n _ { N } = \lfloor N / c \rfloor \approx N / c$ . Plugging this into the expression for $L _ { n }$ from Lemma 3 yields the following approximation for the expected loss:

即 $n_N = \lfloor N/c \rfloor \approx N/c$. 把它代入引理 3 中 $L_n$ 的表达式, 得到期望 loss 的如下近似:

$$
\begin{array}{r l} L (N) & = a + \frac {b - a}{\alpha \zeta (\alpha + 1)} \left(N / c\right) ^ {- \alpha} \\ & = a + c ^ {\alpha} \cdot \frac {b - a}{\alpha \zeta (\alpha + 1)} \cdot N ^ {- \alpha}. \end{array}
$$

We now consider the form of $L ( N )$ under the assumptions about expressivity awareness. By Assumptions 1 and 3, we have $C _ { n } = C$ with probability $1 - \epsilon$ and $C _ { n } = C ^ { \prime }$ with probability ϵ. Thus, we obtain:

下面在考虑表达力的假设下看 $L(N)$ 的形式. 由假设 1 和假设 3, $C_n = C$ 的概率为 $1 - \epsilon$, $C_n = C'$ 的概率为 ϵ. 于是得到:

**Corollary 5.1** Adopt Assumptions 1 to 3, i.e., tasks are expressible w.p. $1 - \epsilon ,$ requiring C parameters or inexpressible w.p. ϵ, requiring $C ^ { \prime }$ parameters. Then, as a function of the number of parameters $N _ { \perp }$ , the loss $\tilde { L } ( N )$ in the quantization model is closely approximated by a power law, $i . e . , \; \tilde { L } ( N ) \approx L ( N )$ where:

**推论 5.1** 采用假设 1 到假设 3: 任务以概率 $1 - \epsilon$ 可表达, 需要 C 个参数; 以概率 ϵ 不可表达, 需要 $C'$ 个参数. 那么作为参数量 $N$ 的函数, quantization model 中的 loss $\tilde{L}(N)$ 可以由幂律很好地近似, 即 $\tilde{L}(N) \approx L(N)$, 其中:

$$
L (N) = L _ {\infty} ^ {\epsilon} + A _ {\epsilon} \cdot \frac {L _ {0} - L _ {\infty} ^ {\epsilon}}{\alpha \zeta (\alpha + 1)} \cdot N ^ {- \alpha},
$$

where $L _ { \infty } ^ { \epsilon }$ and $L _ { 0 }$ are defined as in Corollary 3.1 and

其中 $L_{\infty}^{\epsilon}$ 与 $L_0$ 的定义同推论 3.1, 且

$$
A _ {\epsilon} = (C + \epsilon (C ^ {\prime} - C)) ^ {\alpha},
$$

The cost $C ^ { \prime }$ does not change the irreducible loss, though it does impact the slope of the scaling trend. In particular, with $C ^ { \prime } = C$ , we obtain the coefficient $c ^ { \alpha } = C ^ { \alpha }$ , and with $C ^ { \prime } = 0$ , we recover the coefficient $c ^ { \alpha } = ( 1 - \epsilon ) ^ { \alpha } C ^ { \alpha }$ . Further, under any nontrivial instantiation of the model $\left( \mathrm { i . e . } , \right.$ where inexpressible tasks either reduce loss less or cost more), increasing expressivity will decrease $L ( N )$ for all $N ;$

开销 $C'$ 不改变不可约 loss, 但会影响 Scaling 趋势的斜率. 具体来说, 取 $C' = C$ 得到系数 $c^{\alpha} = C^{\alpha}$; 取 $C' = 0$ 则回到系数 $c^{\alpha} = (1 - \epsilon)^{\alpha} C^{\alpha}$. 此外, 在模型的任何非平凡实例下 (即不可表达任务要么降 loss 更少, 要么开销更大), 提高表达力都会对所有 $N$ 降低 $L(N)$:

**Corollary 5.2** Assume $C ^ { \prime } \geq C . \quad \mathit { I f } \quad \Delta ^ { \prime } < \Delta \quad \mathit { o r } \quad C ^ { \prime } > C$ , then $L ( N )$ strictly decreases as ϵ decreases, elementwise for all N.

**推论 5.2** 设 $C' \geq C$. 若 $\Delta' < \Delta$ 或 $C' > C$, 则随着 ϵ 减小, $L(N)$ 对所有 N 逐点严格下降.

Proof. If $\Delta ^ { \prime } = \Delta$ but $C ^ { \prime } > C$ , then $L _ { \infty } ^ { \epsilon } = L _ { 0 } - \Delta$ independent of $\epsilon _ { \gamma }$ but $A _ { \epsilon }$ is increasing with ϵ. Thus, $L ( N )$ will increase with ϵ for all N.

证明. 若 $\Delta' = \Delta$ 但 $C' > C$, 则 $L_{\infty}^{\epsilon} = L_0 - \Delta$ 与 ϵ 无关, 而 $A_{\epsilon}$ 随 ϵ 增大. 因此对所有 N, $L(N)$ 都随 ϵ 增大.

If we have $\Delta ^ { \prime } < \Delta$ , then $L _ { \infty } ^ { \epsilon }$ is increasing with ϵ. It also holds that, for $\epsilon ^ { \prime } > \epsilon ,   A _ { \epsilon ^ { \prime } } \geq A _ { \epsilon }$ . We apply Lemma 4 to conclude that $L ( N )$ is increasing with ϵ elementwise for all N. □

若 $\Delta' < \Delta$, 则 $L_{\infty}^{\epsilon}$ 随 ϵ 增大. 同时, 对 $\epsilon' > \epsilon$ 有 $A_{\epsilon'} \geq A_{\epsilon}$. 应用引理 4, 可得 $L(N)$ 对所有 N 逐点随 ϵ 增大. □

### E.3 Data Scaling Law

We first generalize Lemma 3 in the following way:

先把引理 3 推广如下:

<!-- page 65 of 70 -->

Lemma 6 Let $n _ { 0 } , \ldots , n _ { m }$ . be a finite sequence of phases, with $n _ { 0 } = 0$ and $n _ { m } = \infty$ . For each $1 \leq \ell \leq m$ assume that, for all k such that $n _ { \ell - 1 } < k \leq n _ { \ell } ,$ , all $X _ { k }$ are independent with mean $\mu _ { \ell - 1 }$ . Then the expected loss $\tilde { L }$ across all tasks is closely approximated by a power law, i.e., $\tilde { L } \approx L$ where:

**引理 6** 设 $n_0, \ldots, n_m$ 是一个有限的阶段序列, $n_0 = 0$, $n_m = \infty$. 对每个 $1 \leq \ell \leq m$, 假设对所有满足 $n_{\ell-1} < k \leq n_{\ell}$ 的 k, 各 $X_k$ 相互独立且均值为 $\mu_{\ell-1}$. 那么所有任务上的期望 loss $\tilde{L}$ 可以由幂律很好地近似, 即 $\tilde{L} \approx L$, 其中:

$$
L = \mu_ {0} + \frac {1}{\alpha \zeta (\alpha + 1)} \sum_ {\ell = 1} ^ {m - 1} \left(\mu_ {\ell} - \mu_ {\ell - 1}\right) \cdot n _ {\ell} ^ {- \alpha}.
$$

Proof. We can first write the loss as a weighted sum over losses coming from different phases:

证明. 先把 loss 写成来自不同阶段的 loss 的加权和:

$$
\begin{array}{l} \tilde {L} = \mathbb {E} \left[ \sum_ {k = 1} ^ {\infty} X _ {k} p _ {k} \right] \\ \quad = \mathbb {E} \left[ \sum_ {\ell = 1} ^ {m} \sum_ {k = n _ {\ell - 1} + 1} ^ {n _ {\ell}} X _ {k} p _ {k} \right] \\ \quad = \sum_ {\ell = 1} ^ {m} \mu_ {\ell - 1} \sum_ {k = n _ {\ell - 1} + 1} ^ {n _ {\ell}} p _ {k}. \end{array}
$$

At this point, for each series $\ell < m$ , we add the missing terms $\textstyle \sum _ { k = n _ { \ell } + 1 } ^ { \infty } p _ { k }$ to the series and subtract it from the remaining series. This yields:

此时, 对每个 $\ell < m$ 对应的级数, 补上缺失的项 $\sum_{k=n_{\ell}+1}^{\infty} p_k$, 并从剩下的级数中减去它. 得到:

$$
\begin{array}{l} \hline \tilde {L} = \sum_ {\ell = 1} ^ {m} \mu_ {\ell - 1} \left(\sum_ {k = n _ {\ell - 1} + 1} ^ {\infty} p _ {k} - \sum_ {k = n _ {\ell} + 1} ^ {\infty} p _ {k}\right) \\ \quad = \left(\sum_ {\ell = 1} ^ {m} \mu_ {\ell - 1} \sum_ {k = n _ {\ell - 1} + 1} ^ {\infty} p _ {k}\right) - \left(\sum_ {\ell = 1} ^ {m} \mu_ {\ell - 1} \sum_ {k = n _ {\ell} + 1} ^ {\infty} p _ {k}\right) \\ \quad = \left(\sum_ {\ell = 1} ^ {m} \mu_ {\ell - 1} \sum_ {k = n _ {\ell - 1} + 1} ^ {\infty} p _ {k}\right) - \left(\sum_ {\ell = 2} ^ {m + 1} \mu_ {\ell - 2} \sum_ {k = n _ {\ell - 1} + 1} ^ {\infty} p _ {k}\right) \\ \quad = \mu_ {0} \sum_ {k = n _ {0} + 1} ^ {\infty} p _ {k} + \left(\sum_ {\ell = 2} ^ {m} (\mu_ {\ell - 1} - \mu_ {\ell - 2}) \sum_ {k = n _ {\ell - 1} + 1} ^ {\infty} p _ {k}\right) - \mu_ {m - 1} \sum_ {k = n _ {m} + 1} ^ {\infty} p _ {k} \\ \quad = \mu_ {0} \sum_ {k = 1} ^ {\infty} p _ {k} + \left(\sum_ {\ell = 2} ^ {m} (\mu_ {\ell - 1} - \mu_ {\ell - 2}) \sum_ {k = n _ {\ell - 1} + 1} ^ {\infty} p _ {k}\right) - \mu_ {m - 1} \sum_ {k = \infty} ^ {\infty} p _ {k} \\ \quad = \mu_ {0} + \sum_ {\ell = 2} ^ {m} (\mu_ {\ell - 1} - \mu_ {\ell - 2}) \sum_ {k = n _ {\ell - 1} + 1} ^ {\infty} p _ {k}. \end{array}
$$

At this point, we can simplify the series in a similar way to Michaud et al. (2023) to conclude:

接下来可以仿照 Michaud et al. (2023) 的做法化简级数, 得到:

$$
\begin{array}{c} \hline \tilde {L} \approx L = \mu_ {0} + \sum_ {\ell = 2} ^ {m} \frac {\mu_ {\ell - 1} - \mu_ {\ell - 2}}{\alpha   \zeta (\alpha + 1)} \cdot n _ {\ell - 1} ^ {- \alpha} \\ = \mu_ {0} + \frac {1}{\alpha   \zeta (\alpha + 1)} \sum_ {\ell = 1} ^ {m - 1} (\mu_ {\ell} - \mu_ {\ell - 1}) \cdot n _ {\ell} ^ {- \alpha}. \\ \hline \end{array}
$$

**Lemma 7** Adopt Assumptions 1 to 3, i.e., tasks are expressible w.p. $1 - \epsilon ,$ requiring T relevant tokens to learn, or inexpressible w.p. ϵ, requiring $T ^ { \prime }$ relevant tokens to learn. Then, as a function of the token budget D, the expected loss $\tilde { L } ( D )$ under the quantization model is closely approximated by a power law, i.e., $\tilde { L } ( D ) \approx L ( D )$ where

**引理 7** 采用假设 1 到假设 3: 任务以概率 $1 - \epsilon$ 可表达, 需要 T 个相关 token 才能学会; 以概率 ϵ 不可表达, 需要 $T'$ 个相关 token 才能学会. 那么作为 token 预算 D 的函数, quantization model 下的期望 loss $\tilde{L}(D)$ 可以由幂律很好地近似, 即 $\tilde{L}(D) \approx L(D)$, 其中

$$
L (D) = L _ {\infty} ^ {\epsilon} + \frac {B _ {\epsilon}}{\alpha \zeta (\alpha + 1) ^ {1 / (\alpha + 1)}} \cdot D ^ {- \alpha / (\alpha + 1)},
$$

<!-- page 66 of 70 -->

$L _ { \infty } ^ { \epsilon }$ is defined as in Corollary 3.1, and

(接上页) $L_{\infty}^{\epsilon}$ 的定义同推论 3.1, 且

$$
B _ {\epsilon} = (1 - \epsilon) \Delta T ^ {\alpha / (\alpha + 1)} + \epsilon \Delta^ {\prime} T ^ {\prime \alpha / (\alpha + 1)}.
$$

Proof. We consider the tasks that are learned with D tokens. By Definition 3, any expressible task k learnable with D tokens satisfies

证明. 考虑用 D 个 token 能学会的任务. 由定义 3, 任何用 D 个 token 可学的可表达任务 k 满足

$$
\begin{array}{c} \hline D \geq \frac {1}{p _ {k}} T \\ = \zeta (\alpha + 1) k ^ {\alpha + 1} T \end{array}
$$

Let $k _ { \mathrm { e } }$ be the largest index representing a learnable expressible task. It holds that

令 $k_{\mathrm{e}}$ 为可学的可表达任务中的最大下标, 则

$$
\begin{array}{c} k _ {\mathrm{e}} = \left\lfloor \left(\frac {1}{\zeta (\alpha + 1)} \cdot D / T\right) ^ {1 / (\alpha + 1)} \right\rfloor \\ \approx \left(\frac {1}{\zeta (\alpha + 1)} \cdot D / T\right) ^ {1 / (\alpha + 1)}. \end{array}
$$

By the same reasoning and Assumption 1, we have that the maximum index $k _ { \mathrm { i } } \leq k _ { \mathrm { e } }$ representing an inexpressible task learnable with D tokens satisfies

同理并结合假设 1, 用 D 个 token 可学的不可表达任务的最大下标 $k_{\mathrm{i}} \leq k_{\mathrm{e}}$ 满足

$$
k _ {\mathrm{i}} \approx \left(\frac {1}{\zeta (\alpha + 1)} \cdot D / T ^ {\prime}\right) ^ {1 / (\alpha + 1)}.
$$

Now, we will define three phases of tasks, during each of which all task losses are independent and have a different mean: Thus:

现在定义三个任务阶段, 每个阶段内所有任务的 loss 相互独立, 且各阶段均值不同:

1. Phase from $1 \: \leq \: k \: \leq \: k _ { \mathrm { i } }$ : all tasks are learned, with expressible tasks obtaining loss $L _ { 0 } \mathrm { ~ - ~ } \Delta$ and inexpressible tasks obtaining loss $L _ { 0 } - \Delta ^ { \prime }$ . Thus, the expected loss is $\begin{array} { r } { L _ { \infty } ^ { \epsilon } = L _ { 0 } - ( 1 - \epsilon ) \Delta - \epsilon \Delta ^ { \prime } } \end{array}$

(1) 阶段 $1 \leq k \leq k_{\mathrm{i}}$: 所有任务都已学会, 可表达任务的 loss 为 $L_0 - \Delta$, 不可表达任务的 loss 为 $L_0 - \Delta'$. 因此期望 loss 为 $L_{\infty}^{\epsilon} = L_0 - (1 - \epsilon)\Delta - \epsilon\Delta'$

2. Phase from $k _ { \mathrm { i } } + 1 \leq k \leq k _ { \mathrm { e } } ;$ only expressible tasks are learned obtaining loss $\Delta .$ Thus, the expected loss is $L _ { 0 } - ( 1 - \epsilon ) \Delta$

(2) 阶段 $k_{\mathrm{i}} + 1 \leq k \leq k_{\mathrm{e}}$: 只有可表达任务学会了, loss 降低 $\Delta$. 因此期望 loss 为 $L_0 - (1 - \epsilon)\Delta$

3. Phase from $k _ { \mathrm { e } } + 1 \leq k < \infty { : }$ no tasks are learned. Thus, the expected loss is $L _ { 0 }$

(3) 阶段 $k_{\mathrm{e}} + 1 \leq k < \infty$: 没有任务学会. 因此期望 loss 为 $L_0$

Invoking Lemma 6 with these three phases, the loss $\tilde { L } ( D )$ is closely approximated by the following:

对这三个阶段应用引理 6, loss $\tilde{L}(D)$ 可以由下式很好地近似:

$$
\begin{array}{l} L _ {\infty} ^ {\epsilon} + \frac {1}{\alpha \zeta (\alpha + 1)} \left((1 - \epsilon) \Delta k _ {\mathrm{e}} ^ {- \alpha} + \epsilon \Delta^ {\prime} k _ {\mathrm{i}} ^ {- \alpha}\right) \\ \approx L _ {\infty} ^ {\epsilon} + \frac {(1 - \epsilon) \Delta (D / T) ^ {- \alpha / (\alpha + 1)} + \epsilon \Delta^ {\prime} (D / T ^ {\prime}) ^ {- \alpha / (\alpha + 1)}}{\alpha \zeta (\alpha + 1) ^ {1 / (\alpha + 1)}} \\ = L _ {\infty} ^ {\epsilon} + \frac {(1 - \epsilon) \Delta T ^ {\alpha / (\alpha + 1)} + \epsilon \Delta^ {\prime} T ^ {\prime \alpha / (\alpha + 1)}}{\alpha \zeta (\alpha + 1) ^ {1 / (\alpha + 1)}} \cdot D ^ {- \alpha / (\alpha + 1)} \\ = L _ {\infty} ^ {\epsilon} + \frac {B _ {\epsilon}}{\alpha \zeta (\alpha + 1) ^ {1 / (\alpha + 1)}} \cdot D ^ {- \alpha / (\alpha + 1)}. \end{array}
$$

This final expression is $L ( D )$ , our desired approximation to the expected loss.

最后这个表达式就是 $L(D)$, 也就是我们要的期望 loss 近似.

The irreducible loss here is the same as that of the task scaling law. The scaling coefficient changes from the expressivity-unaware case by a factor of $B _ { \epsilon } / B _ { 0 }$ . Moreover, we see that increasing expressivity improves the loss curve:

这里的不可约 loss 与任务 Scaling Law 中的相同. 与不考虑表达力的情形相比, Scaling 系数变为原来的 $B_{\epsilon} / B_0$ 倍. 并且可以看出, 提高表达力会改善 loss 曲线:

**Corollary 7.1** $\mathit { I f } \; \Delta ^ { \prime } < \Delta , \; o r \; T ^ { \prime } > T$ , then $L ( D )$ strictly decreases as ϵ decreases, elementwise for all $D$ .

**推论 7.1** 若 $\Delta' < \Delta$ 或 $T' > T$, 则随着 ϵ 减小, $L(D)$ 对所有 $D$ 逐点严格下降.

<!-- page 67 of 70 -->

Proof. We will prove this by showing that the derivative of the loss w.r.t. ϵ is strictly positive. Let $Z =$ α $\zeta ( \overset { \cdot } { \alpha } + 1 ) ^ { 1 / ( \alpha + \overset { \cdot } { 1 ) } }$ . Recall that the loss $L ( D )$ is

证明. 我们通过证明 loss 对 ϵ 的导数严格为正来完成证明. 令 $Z = \alpha \zeta(\alpha + 1)^{1/(\alpha + 1)}$. 回忆 loss $L(D)$ 为

$$
\begin{array}{l} L (D) = L _ {\infty} ^ {\epsilon} + \frac {B _ {\epsilon}}{Z} \cdot D ^ {- \alpha / (\alpha + 1)} \\ \qquad = L _ {\infty} ^ {\epsilon} + \frac {(1 - \epsilon) \Delta T ^ {\alpha / (\alpha + 1)} + \epsilon \Delta^ {\prime} T ^ {\prime \alpha / (\alpha + 1)}}{Z} \cdot D ^ {- \alpha / (\alpha + 1)} \\ \qquad = L _ {0} - (1 - \epsilon) \Delta - \epsilon \Delta^ {\prime} + \frac {1}{Z} \cdot \left((1 - \epsilon) \Delta \left(\frac {T}{D}\right) ^ {\alpha / (\alpha + 1)} + \epsilon \Delta^ {\prime} \left(\frac {T ^ {\prime}}{D}\right) ^ {\alpha / (\alpha + 1)}\right). \end{array}
$$

The derivative of the loss w.r.t. ϵ is therefore

因此 loss 对 ϵ 的导数为

$$
\begin{array}{l l} \frac {\partial}{\partial \epsilon} L (D) = (\Delta - \Delta^ {\prime}) + \frac {1}{Z} \cdot \left(- \Delta \left(\frac {T}{D}\right) ^ {\alpha / (\alpha + 1)} + \Delta^ {\prime} \left(\frac {T ^ {\prime}}{D}\right) ^ {\alpha / (\alpha + 1)}\right) \\ \geq (\Delta - \Delta^ {\prime}) + \frac {1}{Z} \cdot \left(- \Delta \left(\frac {T}{D}\right) ^ {\alpha / (\alpha + 1)} + \Delta^ {\prime} \left(\frac {T}{D}\right) ^ {\alpha / (\alpha + 1)}\right) & \text {since} T ^ {\prime} \geq T \\ = (\Delta - \Delta^ {\prime}) + \frac {1}{Z} \cdot \left(- (\Delta - \Delta^ {\prime}) \left(\frac {T}{D}\right) ^ {\alpha / (\alpha + 1)}\right) \\ = (\Delta - \Delta^ {\prime}) \cdot \left(1 - \frac {1}{Z} \cdot \left(\frac {T}{D}\right) ^ {\alpha / (\alpha + 1)}\right) \\ \geq (\Delta - \Delta^ {\prime}) \cdot \left(1 - \frac {1}{Z}\right) & \text {since} D \geq T, \end{array}
$$

which is strictly positive as long as $\Delta ^ { \prime } < \Delta$ . It follows that, for $\Delta ^ { \prime } < \Delta ,   L ( D )$ is an increasing function of $\epsilon ,$ $\mathrm { i . e . } ,$ it increases (pointwise) as ϵ increases and expressivity decreases.

只要 $\Delta' < \Delta$, 它就严格为正. 所以当 $\Delta' < \Delta$ 时, $L(D)$ 是 ϵ 的增函数, 即随着 ϵ 增大, 表达力降低, $L(D)$ (逐点) 增大.

When $\Delta ^ { \prime } = \Delta$ , the expression for the derivative simplifies to

当 $\Delta' = \Delta$ 时, 导数化简为

$$
\begin{array}{c} \frac {\partial}{\partial \epsilon} L (D) = \frac {1}{Z} \cdot \left(- \Delta \left(\frac {T}{D}\right) ^ {\alpha / (\alpha + 1)} + \Delta \left(\frac {T ^ {\prime}}{D}\right) ^ {\alpha / (\alpha + 1)}\right) \\ = \frac {\Delta}{Z} \cdot \left(\left(\frac {T ^ {\prime}}{D}\right) ^ {\alpha / (\alpha + 1)} - \left(\frac {T}{D}\right) ^ {\alpha / (\alpha + 1)}\right) \end{array}
$$

which again is strictly positive as long as $T ^ { \prime } > T$ and $\Delta > 0$ , the latter of which is satisfied by construction.

只要 $T' > T$ 且 $\Delta > 0$, 它同样严格为正; 后一个条件按构造成立.

Overall, we see that in every non-trivial instantiation of the expressivity-aware quantization model, increasing expressivity improves $L ( D )$ , which closely approximates $\tilde { L } ( D )$ for large enough D.

总之, 在考虑表达力的 quantization model 的每个非平凡实例中, 提高表达力都会改善 $L(D)$, 而当 D 足够大时, $L(D)$ 能很好地近似 $\tilde{L}(D)$.

### E.4 Main Results

Combining the results above on parameter (Corollary 5.1) and data scaling (Lemma 7), we obtain:

结合上面关于参数 Scaling (推论 5.1) 和数据 Scaling (引理 7) 的结果, 得到:

<!-- page 68 of 70 -->

<div class="docvortex-algorithm" style="white-space: pre-wrap; font-family:monospace;">
Theorem 4: Expressivity-Aware Scaling Laws
Consider the quantization model of neural scaling laws augmented by Assumptions 1 to 3. Then, as a function of the number of parameters N, the loss $\tilde{L}(N)$ is closely approximated by a power law $L(N)$, i.e., $\tilde{L}(N) \approx L(N)$ where:
    $L(N) - L_{\infty}^{\epsilon} \propto A_{\epsilon} \cdot N^{-\alpha}$, where $A_{\epsilon} = (L_0 - L_{\infty}^{\epsilon}) \cdot (C + \epsilon(C' - C))^{\alpha}$.
Similarly, as a function of the token budget D, the loss $\tilde{L}(D)$ is closely approximated by a power law $L(D)$, i.e., $\tilde{L}(D) \approx L(D)$ where
    $L(D) - L_{\infty}^{\epsilon} \propto B_{\epsilon} \cdot D^{-\alpha/(\alpha+1)}$, where $B_{\epsilon} = (1 - \epsilon)\Delta T^{\alpha/(\alpha+1)} + \epsilon\Delta' T'^{\alpha/(\alpha+1)}$.
Finally, the irreducible loss $L_{\infty}^{\epsilon}$ for both power laws depends on expressivity via
    $L_{\infty}^{\epsilon} = L_0 - (1 - \epsilon)\Delta - \epsilon\Delta'$.
</div>

**定理 4: 考虑表达力的 Scaling Laws** 考虑用假设 1 到假设 3 扩充后的神经 Scaling Laws quantization model. 那么作为参数量 N 的函数, loss $\tilde{L}(N)$ 可以由幂律 $L(N)$ 很好地近似, 即 $\tilde{L}(N) \approx L(N)$, 其中 $L(N) - L_{\infty}^{\epsilon} \propto A_{\epsilon} \cdot N^{-\alpha}$, $A_{\epsilon} = (L_0 - L_{\infty}^{\epsilon}) \cdot (C + \epsilon(C' - C))^{\alpha}$. 同样, 作为 token 预算 D 的函数, loss $\tilde{L}(D)$ 可以由幂律 $L(D)$ 很好地近似, 即 $\tilde{L}(D) \approx L(D)$, 其中 $L(D) - L_{\infty}^{\epsilon} \propto B_{\epsilon} \cdot D^{-\alpha/(\alpha+1)}$, $B_{\epsilon} = (1 - \epsilon)\Delta T^{\alpha/(\alpha+1)} + \epsilon\Delta' T'^{\alpha/(\alpha+1)}$. 最后, 两个幂律共同的不可约 loss $L_{\infty}^{\epsilon}$ 通过 $L_{\infty}^{\epsilon} = L_0 - (1 - \epsilon)\Delta - \epsilon\Delta'$ 依赖表达力.

Combining Corollary 5.2 and Corollary 7.1 yields:

结合推论 5.2 与推论 7.1 得到:

<div class="docvortex-algorithm" style="white-space: pre-wrap; font-family:monospace;">
Corollary 4.1: Expressivity Always Improves Scaling
Fix a nontrivial instantiation of Assumptions 1 to 3, i.e., where either $\Delta' &lt; \Delta$, or $C' &gt; C$ and $T' &gt; T$.
Then, both $L(N)$ and $L(D)$ strictly decrease as $\epsilon$ decreases, elementwise for all $N, D$.
The following follows straightforwardly from assuming $\Delta' &lt; \Delta$:
Corollary 4.2: Expressivity Can Shift Irreducible Loss
If and only if $\Delta' &lt; \Delta$, irreducible loss $L_{\infty}^{\epsilon}$ strictly decreases as $\epsilon$ decreases.
</div>

**推论 4.1: 表达力总能改善 Scaling** 取假设 1 到假设 3 的一个非平凡实例, 即 $\Delta' < \Delta$, 或者 $C' > C$ 且 $T' > T$. 那么随着 $\epsilon$ 减小, $L(N)$ 和 $L(D)$ 对所有 $N, D$ 逐点严格下降. 由 $\Delta' < \Delta$ 可以直接得到下面的推论.**推论 4.2: 表达力可以移动不可约 loss** 当且仅当 $\Delta' < \Delta$ 时, 不可约 loss $L_{\infty}^{\epsilon}$ 随 $\epsilon$ 减小而严格下降.

**Future Work.** There are several extensions to this analysis worth pursuing. First, we have assumed learnable tasks are prioritized in order of frequency, whereas a more optimal policy would order them by parameter efficiency $p _ { n } / C _ { n }$ . It would also be interesting to consider joint parameter-data scaling $L ( N , D )$ rather than scaling laws derived in isolation. On the empirical side, one could test whether these scaling laws match real LMs in controlled settings where ϵ is known, or whether it is possible to isolate tasks in the data in practical settings. All of these directions would close the gap between the idealized quantization model and practical training, and could inform choices about the interaction between data and architecture during pretraining.

**后续工作.** 这一分析有几个值得推进的扩展方向. 第一, 我们假设可学任务按频率排定优先级, 更优的策略应当按参数效率 $p_n / C_n$ 排序. 第二, 可以考虑参数与数据联合的 Scaling $L(N, D)$, 而不是分别推出的两条 Scaling Law. 实证方面, 可以在 ϵ 已知的受控设置中检验这些 Scaling Law 是否符合真实 LM, 或者看在实际设置中能否把数据里的任务分离出来. 这些方向都能缩小理想化 quantization model 与实际训练之间的差距, 也可能为预训练中数据与架构如何相互作用提供选型依据.

<!-- page 69 of 70 -->

Table 21 Architecture ablation results — per-domain breakdown. Per-domain OlmoBaseEval BPB for pure and hybrid architectures. Bold indicates best; underline second best; † best within section. ⋆ marks our selected architecture. Note that per-size comparisons should be interpreted with care, as architectures at the same nominal scale differ in actual parameter count (see Table 22).

表 21 架构消融结果: 分领域拆解. 纯架构与 hybrid 架构的分领域 OlmoBaseEval BPB. 粗体为最佳, 下划线为次佳, † 为本组内最佳. ⋆ 标出我们选定的架构. 注意按规模逐行比较时要谨慎解读, 因为同一名义规模下各架构的实际参数量不同 (见表 22).

Small scales (60M–370M parameters):

小规模 (60M–370M 参数):

<table><tr><td rowspan="2">Architecture</td><td rowspan="2">Attn %</td><td colspan="3">60M</td><td colspan="3">100M</td><td colspan="3">190M</td><td colspan="3">370M</td></tr><tr><td>Math</td><td>Code</td><td>QA</td><td>Math</td><td>Code</td><td>QA</td><td>Math</td><td>Code</td><td>QA</td><td>Math</td><td>Code</td><td>QA</td></tr><tr><td colspan="14">Pure Architectures</td></tr><tr><td>Transformer</td><td>100%</td><td>1.102</td><td>0.931</td><td>1.433</td><td>0.981</td><td>0.804</td><td>1.326</td><td>0.887</td><td>0.707</td><td>1.257</td><td>0.782</td><td>0.616</td><td>1.119</td></tr><tr><td>GDN</td><td>0%</td><td> $1.040^†$ </td><td>0.837</td><td> $1.363^†$ </td><td> $0.949^†$ </td><td> $0.752^†$ </td><td> $1.270^†$ </td><td> $0.839^†$ </td><td> $0.671^†$ </td><td> $1.176^†$ </td><td> $0.746^†$ </td><td>0.573</td><td>1.066</td></tr><tr><td>Mamba2</td><td>0%</td><td>1.110</td><td>0.917</td><td>1.411</td><td>0.994</td><td>0.798</td><td>1.316</td><td>0.896</td><td>0.711</td><td>1.215</td><td>0.790</td><td>0.616</td><td>1.122</td></tr><tr><td colspan="14">Hybrid: Interleaved Attention</td></tr><tr><td>GDN (1:1)</td><td>50%</td><td>1.044</td><td>0.861</td><td>1.374</td><td>0.936</td><td>0.765</td><td>1.273</td><td>0.839</td><td>0.673</td><td>1.178</td><td>0.744</td><td>0.585</td><td>1.083</td></tr><tr><td>GDN (3:1)*</td><td>25%</td><td>1.034</td><td> $0.849^†$ </td><td>1.349</td><td>0.934</td><td> $0.752^†$ </td><td>1.271</td><td>0.835</td><td>0.663</td><td>1.177</td><td> $0.741^†$ </td><td>0.588</td><td> $1.069^†$ </td></tr><tr><td>GDN (7:1)</td><td>12.5%</td><td> $1.032^†$ </td><td>0.850</td><td>1.365</td><td> $0.932^†$ </td><td>0.764</td><td> $1.269^†$ </td><td>0.840</td><td>0.668</td><td>1.169</td><td>0.745</td><td> $0.584^†$ </td><td>1.080</td></tr><tr><td>Mamba2 (3:1)</td><td>25%</td><td>1.080</td><td>0.905</td><td>1.404</td><td>0.957</td><td>0.786</td><td>1.292</td><td>0.863</td><td>0.698</td><td>1.202</td><td>0.770</td><td>0.603</td><td>1.110</td></tr><tr><td colspan="14">Hybrid GDN (3:1): Middle Placement</td></tr><tr><td>Interleaved*</td><td>25%</td><td> $1.034^†$ </td><td> $0.849^†$ </td><td>1.349</td><td> $0.934^†$ </td><td> $0.752^†$ </td><td> $1.271^†$ </td><td>0.835</td><td>0.663</td><td> $1.177^†$ </td><td> $0.741^†$ </td><td>0.588</td><td> $1.069^†$ </td></tr><tr><td>Middle</td><td>25%</td><td>1.041</td><td>0.868</td><td>1.353</td><td>0.934</td><td>0.754</td><td>1.275</td><td>0.842</td><td>0.671</td><td>1.183</td><td>0.743</td><td> $0.576^†$ </td><td>1.081</td></tr><tr><td colspan="14">Hybrid GDN (3:1): Gate/Eigenvalue Ablations</td></tr><tr><td>Neg EV, gate*</td><td>25%</td><td>1.034</td><td>0.849</td><td> $1.349^†$ </td><td>0.934</td><td>0.752</td><td>1.271</td><td> $0.835^†$ </td><td> $0.663^†$ </td><td>1.177</td><td>0.741</td><td>0.588</td><td>1.069</td></tr><tr><td>Neg EV, no gate</td><td>25%</td><td>1.026</td><td> $0.838^†$ </td><td>1.378</td><td>0.930</td><td>0.733</td><td>1.264</td><td>0.837</td><td>0.673</td><td> $1.171^†$ </td><td>0.739</td><td>0.595</td><td>1.070</td></tr><tr><td>Pos EV, gate</td><td>25%</td><td>1.033</td><td>0.849</td><td>1.376</td><td>0.928</td><td>0.746</td><td>1.267</td><td>0.839</td><td>0.675</td><td>1.176</td><td>0.764</td><td>0.598</td><td>1.122</td></tr><tr><td>Pos EV, no gate</td><td>25%</td><td>1.037</td><td>0.843</td><td>1.366</td><td>0.929</td><td>0.757</td><td>1.278</td><td>0.839</td><td>0.681</td><td>1.183</td><td>0.738</td><td> $0.579^†$ </td><td> $1.067^†$ </td></tr><tr><td colspan="14">Pure GDN: Gate/Eigenvalue Ablations</td></tr><tr><td>Neg EV, gate</td><td>0%</td><td>1.040</td><td>0.837</td><td>1.363</td><td>0.949</td><td>0.752</td><td> $1.270^†$ </td><td> $0.839^†$ </td><td>0.671</td><td>1.176</td><td>0.746</td><td>0.573</td><td>1.066</td></tr><tr><td>Pos EV, gate</td><td>0%</td><td>1.026</td><td>0.834</td><td> $1.352^†$ </td><td> $0.936^†$ </td><td>0.740</td><td>1.271</td><td>0.848</td><td> $0.664^†$ </td><td>1.167</td><td> $0.745^†$ </td><td>0.577</td><td>1.073</td></tr><tr><td>Neg EV, no gate</td><td>0%</td><td>1.056</td><td>0.846</td><td>1.360</td><td>0.958</td><td>0.762</td><td>1.276</td><td>0.857</td><td>0.678</td><td>1.176</td><td>0.757</td><td>0.599</td><td>1.071</td></tr><tr><td>Pos EV, no gate</td><td>0%</td><td>1.052</td><td>0.856</td><td>1.369</td><td>0.963</td><td>0.751</td><td>1.292</td><td>0.851</td><td>0.683</td><td>1.170</td><td>0.758</td><td>0.585</td><td>1.075</td></tr></table>

Large scales (600M–1B parameters):

大规模 (600M–1B 参数):

<table><tr><td rowspan="2">Architecture</td><td rowspan="2">Attn %</td><td colspan="3">600M</td><td colspan="3">760M</td><td colspan="3">1B</td></tr><tr><td>Math</td><td>Code</td><td>QA</td><td>Math</td><td>Code</td><td>QA</td><td>Math</td><td>Code</td><td>QA</td></tr><tr><td colspan="11">Pure Architectures</td></tr><tr><td>Transformer</td><td>100%</td><td>0.724</td><td>0.564</td><td>1.055</td><td>0.686</td><td>0.538</td><td>1.015</td><td> $0.622^†$ </td><td>0.492</td><td>0.933</td></tr><tr><td>GDN</td><td>0%</td><td> $0.705^†$ </td><td> $0.551^†$ </td><td> $1.026^†$ </td><td> $0.673^†$ </td><td> $0.522^†$ </td><td> $0.970^†$ </td><td>0.624</td><td> $0.485^†$ </td><td> $0.921^†$ </td></tr><tr><td>Mamba2</td><td>0%</td><td>0.736</td><td>0.577</td><td>1.047</td><td>0.699</td><td>0.547</td><td>1.005</td><td>0.662</td><td>0.524</td><td>0.969</td></tr><tr><td colspan="11">Hybrid: Interleaved Attention</td></tr><tr><td>GDN (1:1)</td><td>50%</td><td>0.725</td><td>0.571</td><td>1.065</td><td>0.663</td><td>0.527</td><td>0.983</td><td>0.610</td><td> $0.484^†$ </td><td>0.928</td></tr><tr><td>GDN (3:1)*</td><td>25%</td><td>0.694</td><td>0.546</td><td>1.022</td><td> $0.658^†$ </td><td> $0.523^†$ </td><td>0.969</td><td>0.604</td><td>0.488</td><td> $0.914^†$ </td></tr><tr><td>GDN (7:1)</td><td>12.5%</td><td>0.693</td><td>0.543</td><td>1.009</td><td>0.660</td><td>0.524</td><td>0.978</td><td>0.612</td><td>0.486</td><td>0.927</td></tr><tr><td>Mamba2 (3:1)</td><td>25%</td><td>0.714</td><td>0.561</td><td>1.042</td><td>0.673</td><td>0.531</td><td>0.992</td><td>0.638</td><td>0.509</td><td>0.946</td></tr><tr><td colspan="11">Hybrid GDN (3:1): Middle Placement</td></tr><tr><td>Interleaved*</td><td>25%</td><td> $0.694^†$ </td><td> $0.546^†$ </td><td>1.022</td><td> $0.658^†$ </td><td>0.523</td><td>0.969</td><td>0.604</td><td>0.488</td><td> $0.914^†$ </td></tr><tr><td>Middle</td><td>25%</td><td>0.698</td><td>0.547</td><td> $1.015^†$ </td><td>0.661</td><td> $0.521^†$ </td><td>0.982</td><td>0.608</td><td> $0.487^†$ </td><td>0.922</td></tr><tr><td colspan="11">Hybrid GDN (3:1): Gate/Eigenvalue Ablations</td></tr><tr><td>Neg EV, gate*</td><td>25%</td><td>0.694</td><td>0.546</td><td>1.022</td><td>0.658</td><td>0.523</td><td> $0.969^†$ </td><td> $0.604^†$ </td><td>0.488</td><td>0.914</td></tr><tr><td>Neg EV, no gate</td><td>25%</td><td>0.696</td><td>0.548</td><td> $1.012^†$ </td><td>0.654</td><td>0.526</td><td>0.983</td><td>0.610</td><td>0.483</td><td>0.904</td></tr><tr><td>Pos EV, gate</td><td>25%</td><td>0.695</td><td>0.546</td><td>1.030</td><td>0.659</td><td>0.514</td><td>0.970</td><td>0.605</td><td>0.484</td><td>0.912</td></tr><tr><td>Pos EV, no gate</td><td>25%</td><td>0.694</td><td> $0.545^†$ </td><td>1.021</td><td>0.656</td><td>0.518</td><td>0.977</td><td>0.605</td><td>0.486</td><td>0.918</td></tr><tr><td colspan="11">Pure GDN: Gate/Eigenvalue Ablations</td></tr><tr><td>Neg EV, gate</td><td>0%</td><td>0.705</td><td>0.551</td><td>1.026</td><td>0.673</td><td>0.522</td><td> $0.970^†$ </td><td>0.624</td><td> $0.485^†$ </td><td>0.921</td></tr><tr><td>Pos EV, gate</td><td>0%</td><td> $0.705^†$ </td><td>0.542</td><td>1.00469</td><td> $0.669^†$ </td><td>0.516</td><td>0.975</td><td> $0.614^†$ </td><td>0.492</td><td> $0.917^†$ </td></tr><tr><td>Neg EV, no gate</td><td>0%</td><td>0.710</td><td>0.546</td><td>1.026</td><td>0.679</td><td>0.527</td><td>0.986</td><td>0.623</td><td>0.489</td><td>0.929</td></tr><tr><td>Pos EV, no gate</td><td>0%</td><td>0.712</td><td>0.559</td><td>1.024</td><td>0.677</td><td>0.526</td><td>0.977</td><td>0.626</td><td>0.488</td><td>0.919</td></tr></table>

<!-- page 70 of 70 -->

Table 22 Architecture configurations and non-embedding parameter counts (millions). d: model dimension, h: number of attention heads, l: number of layers. Architectures at the same nominal scale can differ substantially in parameter count due to differences in layer composition.

表 22 架构配置与非 embedding 参数量 (单位: 百万). d: 模型维度, h: 注意力头数, l: 层数. 由于层的组成不同, 同一名义规模下各架构的参数量可能相差很大.

<table><tr><td>Architecture</td><td>Attn %</td><td>60M</td><td>100M</td><td>190M</td><td>370M</td><td>600M</td><td>760M</td><td>1B</td></tr><tr><td>d</td><td></td><td>384</td><td>512</td><td>768</td><td>1024</td><td>1280</td><td>1536</td><td>2048</td></tr><tr><td>h</td><td></td><td>8</td><td>8</td><td>12</td><td>16</td><td>16</td><td>16</td><td>16</td></tr><tr><td>l</td><td></td><td>8</td><td>12</td><td>12</td><td>16</td><td>16</td><td>16</td><td>16</td></tr><tr><td colspan="9">Pure Architectures</td></tr><tr><td>Transformer</td><td>100%</td><td>57</td><td>102</td><td>190</td><td>371</td><td>548</td><td>758</td><td>1279</td></tr><tr><td>GDN</td><td>0%</td><td>78</td><td>140</td><td>276</td><td>574</td><td>780</td><td>1011</td><td>1549</td></tr><tr><td>Mamba2</td><td>0%</td><td>61</td><td>110</td><td>207</td><td>410</td><td>606</td><td>841</td><td>1423</td></tr><tr><td colspan="9">Hybrid: Interleaved Attention</td></tr><tr><td>GDN (1:1)</td><td>50%</td><td>68</td><td>121</td><td>233</td><td>472</td><td>664</td><td>885</td><td>1414</td></tr><tr><td>GDN (3:1)*</td><td>25%</td><td>73</td><td>130</td><td>254</td><td>523</td><td>722</td><td>948</td><td>1482</td></tr><tr><td>GDN (7:1)</td><td>12.5%</td><td>75</td><td>133</td><td>262</td><td>548</td><td>751</td><td>980</td><td>1516</td></tr><tr><td>Mamba2 (3:1)</td><td>25%</td><td>60</td><td>108</td><td>203</td><td>400</td><td>592</td><td>820</td><td>1387</td></tr><tr><td colspan="9">Hybrid GDN (3:1): Middle Placement</td></tr><tr><td>Interleaved (reference)*</td><td>25%</td><td>73</td><td>130</td><td>254</td><td>523</td><td>722</td><td>948</td><td>1482</td></tr><tr><td>Middle</td><td>25%</td><td>70</td><td>127</td><td>247</td><td>510</td><td>707</td><td>932</td><td>1465</td></tr><tr><td colspan="9">Hybrid GDN (3:1): Gate/Eigenvalue Ablations</td></tr><tr><td>Neg EV, gate*</td><td>25%</td><td>73</td><td>130</td><td>254</td><td>523</td><td>722</td><td>948</td><td>1482</td></tr><tr><td>Neg EV, no gate</td><td>25%</td><td>73</td><td>130</td><td>254</td><td>523</td><td>722</td><td>948</td><td>1482</td></tr><tr><td>Pos EV, gate</td><td>25%</td><td>73</td><td>130</td><td>254</td><td>523</td><td>722</td><td>948</td><td>1482</td></tr><tr><td>Pos EV, no gate</td><td>25%</td><td>73</td><td>130</td><td>254</td><td>523</td><td>722</td><td>948</td><td>1482</td></tr><tr><td colspan="9">Pure GDN: Gate/Eigenvalue Ablations</td></tr><tr><td>Neg EV, gate</td><td>0%</td><td>78</td><td>140</td><td>276</td><td>574</td><td>780</td><td>1011</td><td>1549</td></tr><tr><td>Pos EV, gate</td><td>0%</td><td>78</td><td>140</td><td>276</td><td>574</td><td>780</td><td>1011</td><td>1549</td></tr><tr><td>Neg EV, no gate</td><td>0%</td><td>78</td><td>140</td><td>276</td><td>574</td><td>780</td><td>1011</td><td>1549</td></tr><tr><td>Pos EV, no gate</td><td>0%</td><td>78</td><td>140</td><td>276</td><td>574</td><td>780</td><td>1011</td><td>1549</td></tr></table>

70
