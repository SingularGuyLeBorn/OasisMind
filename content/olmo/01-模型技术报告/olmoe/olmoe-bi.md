---
title: "OLMoE 对照译稿"
category: "模型技术报告"
tags: ["OLMo", "对照译稿"]
published: true
excerpt: "OLMoE 技术报告的逐段中英对照译稿, 讲 1.3B 激活, 6.9B 总参数, 64 选 8 的 dropless MoE 怎样训练 5T token, 以及路由饱和, 专家共激活, 领域和词表特化的分析口径."
---

<!-- page 1 of 63 -->

# OLMoE: Open Mixture-of-Experts Language Models

**Niklas Muennighoff**<sup>c,a</sup> **Luca Soldaini**<sup>a</sup> **Dirk Groeneveld**<sup>a</sup> **Kyle Lo**<sup>a</sup> **Jacob Morrison**<sup>a</sup> **Sewon Min**<sup>a</sup> **Weijia Shi**<sup>w</sup> **Pete Walsh**<sup>a</sup> **Oyvind Tafjord**<sup>a</sup> **Nathan Lambert**<sup>a</sup> **Yuling Gu**<sup>a</sup> **Shane Arora**<sup>a</sup> **Akshita Bhagia**<sup>a</sup> **Dustin Schwenk**<sup>a</sup> **David Wadden**<sup>a</sup> **Alexander Wettig**<sup>a,p</sup> **Binyuan Hui** **Tim Dettmers**<sup>a</sup> **Douwe Kiela**<sup>c</sup> **Ali Farhadi**<sup>a,w</sup> **Noah A. Smith**<sup>a,w</sup> **Pang Wei Koh**<sup>a,w</sup> **Amanpreet Singh**<sup>c</sup> **Hannaneh Hajishirzi**<sup>a,w</sup>

<sup>a</sup>Allen Institute for AI <sup>c</sup>Contextual AI <sup>w</sup>University of Washington <sup>p</sup>Princeton University

n.muennighoff@gmail.com hannah@allenai.org

## Abstract

We introduce OLMoE,<sup>1</sup> a fully open, state-of-the-art language model leveraging sparse Mixture-of-Experts (MoE). OLMoE-1B-7B has 7 billion (B) parameters but uses only 1B per input token. We pretrain it on 5 trillion tokens and further adapt it to create OLMoE-1B-7B-Instruct. Our models outperform all available models with similar active parameters, even surpassing larger ones like Llama2-13B-Chat and DeepSeekMoE-16B. We present various experiments on MoE training, analyze routing in our model showing high specialization, and open-source all aspects of our work: model weights, training data, code, and logs.

我们推出 OLMoE, 一个完全开放, 性能领先的语言模型, 采用稀疏 MoE 架构. OLMoE-1B-7B 共有 70 亿 (B) 参数, 但每个输入 token 只用其中 1B. 我们在 5 万亿 token 上预训练它, 再经适配得到 OLMoE-1B-7B-Instruct. 我们的模型超过所有激活参数相近的可用模型, 甚至超过 Llama2-13B-Chat 与 DeepSeekMoE-16B 这类更大的模型. 文中给出多组 MoE 训练实验, 分析模型的路由并发现高度特化, 并开源工作的全部环节: 模型权重, 训练数据, 代码与日志.

<sup>1</sup> This paper describes the first OLMoE from 09/2024. See §I for an overview of a newer version.

<sup>1</sup> 本文描述的是 2024 年 9 月发布的第一版 OLMoE. 更新版本的概况见 §I.

**Model** [hf.co/allenai/OLMoE-1B-7B-0924](https://hf.co/allenai/OLMoE-1B-7B-0924)

**Data** [hf.co/datasets/allenai/OLMoE-mix-0924](https://hf.co/datasets/allenai/OLMoE-mix-0924)

**Code** [github.com/allenai/OLMoE](https://github.com/allenai/OLMoE)

**Logs** [wandb.ai/ai2-llm/olmoe/reports/OLMoE-1B-7B-0924--Vmlldzo4OTcyMjU3](https://wandb.ai/ai2-llm/olmoe/reports/OLMoE-1B-7B-0924--Vmlldzo4OTcyMjU3)

![](images/overview.png)

Figure 1: **Performance, cost, and degree of openness of open MoE and dense LMs.** Model names contain rounded parameter counts: `model-active-total` for MoEs and `model-total` for dense LMs. `#ckpts` is the number of intermediate checkpoints available. We highlight MMLU as a summary of overall performance; see §3 for more results. OLMoE-1B-7B performs best among models with similar active parameter counts and is the most open MoE.

图 1｜开放 MoE 与 dense LM 的性能, 成本与开放程度. 横轴为激活参数, 纵轴为 MMLU; 模型名按 `model-active-total` (MoE) 或 `model-total` (dense) 取整, `#ckpts` 为公开的中间检查点数.

<!-- page 2 of 63 -->

**Contents**

- 1 Introduction
- 2 Pretraining and Adaptation
- 3 Results
- 4 Experimenting with Alternative Design Choices
  - 4.1 MoE-specific Pretraining Settings
    - 4.1.1 Mixture-of-Experts vs. Dense
    - 4.1.2 Expert Granularity
    - 4.1.3 Shared Experts
    - 4.1.4 Expert Choice vs. Token Choice
    - 4.1.5 Sparse Upcycling
    - 4.1.6 Load Balancing Loss
    - 4.1.7 Router Z-loss
  - 4.2 General Pretraining Settings
    - 4.2.1 Dataset Experiments
    - 4.2.2 Initialization
    - 4.2.3 RMSNorm
    - 4.2.4 Decaying Embedding Parameters
    - 4.2.5 QK-Norm
    - 4.2.6 AdamW Epsilon
  - 4.3 Adaptation Settings
- 5 MoE Analysis
  - 5.1 Router Saturation
  - 5.2 Expert Co-activation
  - 5.3 Domain Specialization
  - 5.4 Vocabulary Specialization
- 6 Related Work
- 7 Conclusion
- References
- A Artifacts
- B Training Configuration
- C Evaluation Setup
- D Openness of Models
- E Additional Evaluation
- F Additional Experiments
- G Additional Analysis
- H Limitations and Future Work
- I OLMoE-1B-7B-0125

<!-- page 3 of 63 -->

## 1 Introduction

Despite significant advances in Large Language Models (LMs) on various tasks, there remains a clear trade-off between performance and cost in both training and inference. High-performing LMs are inaccessible for many academics and open-source developers as they are prohibitively expensive to build and deploy.<sup>2</sup> One approach to improve the cost-performance trade-off lies in using sparsely-activated Mixture-of-Experts (MoEs) [154]. MoEs have several experts in each layer, only a subset of which is activated at a time (see Figure 2). This makes MoEs significantly more efficient than dense models with a similar number of total parameters, which activate all parameters for every input [205]. For this reason, industry frontier models use MoEs including Gemini-1.5 [175] and reportedly GPT-4 [29].

尽管大语言模型 (LM) 在各类任务上进步显著, 训练与推理的性能和成本之间仍有明显的取舍. 高性能 LM 的构建与部署代价过高, 许多学者和开源开发者用不起.<sup>2</sup> 改善成本与性能权衡的一条路是稀疏激活的 MoE [154]. MoE 每层有多个专家, 每次只激活其中一部分 (见 Figure 2). 因此, 与总参数量相近, 但对每个输入都激活全部参数的 dense 模型相比, MoE 效率高得多 [205]. 也正因如此, 业界前沿模型采用了 MoE, 包括 Gemini-1.5 [175], 据报道还有 GPT-4 [29].

<sup>2</sup> For example, even with 16 H100 GPUs and several optimizations, Llama 3 405B only achieves a decoding throughput of around 100 tokens per second [50].

<sup>2</sup> 例如, 即使用 16 张 H100 并做了多项优化, Llama 3 405B 的解码吞吐也只有约每秒 100 个 token [50].

Most MoE models, however, are closed-source: While some have publicly released model weights [43, 79, 158, 178, 180], they offer limited to no information about their training data, code, or recipes (see Figure 1). While there have been prior efforts to make language modeling research fully accessible [18, 65, 90, 103, 193, 209], they have been largely limited to dense LMs. This comes despite MoEs requiring *more* openness as they add complex new design questions to LMs, such as how many total versus active parameters to use, whether to use many small or few large experts, if experts should be shared, and what routing algorithm to use. The lack of open resources and findings about these details prevents the field from building cost-efficient open MoEs that approach the capabilities of closed-source frontier models.

然而大多数 MoE 模型是闭源的: 有些公开了权重 [43, 79, 158, 178, 180], 但训练数据, 代码和配方几乎不公开 (见 Figure 1). 此前已有工作致力于让语言模型研究完全可及 [18, 65, 90, 103, 193, 209], 但基本局限于 dense LM. 可 MoE 恰恰需要*更多*开放, 因为它给 LM 带来了一批新的复杂设计问题: 总参数与激活参数各用多少, 用许多小专家还是少数大专家, 专家是否共享, 采用哪种路由算法. 这些细节缺少公开资源与结论, 领域就难以造出接近闭源前沿模型能力, 又节省成本的开放 MoE.

To address these issues, we introduce OLMoE, a fully open Mixture-of-Experts language model with state-of-the-art performance among similarly-sized models. In particular, we pretrain OLMoE-1B-7B for 5.1 trillion tokens with 6.9B total parameters, of which only 1.3B are activated for each input token. This leads to a similar inference cost as using dense models with around 1B parameters, such as OLMo 1B [65] or TinyLlama 1B [210], but requires more GPU memory to store its 7B total parameters. Our experiments show that MoEs train $\sim$2$\times$ faster than dense LMs with equivalent active parameters. In Figure 1, we show that OLMoE-1B-7B significantly outperforms all open 1B models and displays competitive performance to dense models with significantly higher inference costs and memory storage (e.g., similar MMLU scores to Llama2-13B, which is $\sim$10$\times$ more costly). Via instruction- and preference tuning, we create OLMoE-1B-7B-Instruct, which we find exceeds various larger instruct models including Llama2-13B-Chat [183], OLMo-7B-Instruct (0724), and DeepSeekMoE-16B [42] on common benchmarks (MMLU, GSM8k, HumanEval, etc.).

为此我们推出 OLMoE, 一个完全开放的 MoE 语言模型, 在同等规模模型中性能领先. 具体来说, 我们用 5.1 万亿 token 预训练 OLMoE-1B-7B, 总参数 6.9B, 每个输入 token 只激活其中 1.3B. 它的推理成本与 OLMo 1B [65] 或 TinyLlama 1B [210] 这类约 1B 参数的 dense 模型相当, 但存放 7B 总参数需要更多 GPU 显存. 实验表明, 在激活参数相同时, MoE 的训练速度约为 dense LM 的 2 倍. Figure 1 显示, OLMoE-1B-7B 明显超过所有开放的 1B 模型, 并能与推理成本和显存占用高得多的 dense 模型竞争 (例如 MMLU 与 Llama2-13B 相近, 而后者成本约高 10 倍). 经指令微调与偏好微调, 我们得到 OLMoE-1B-7B-Instruct; 在常用基准 (MMLU, GSM8k, HumanEval 等) 上, 它超过了多个更大的指令模型, 包括 Llama2-13B-Chat [183], OLMo-7B-Instruct (0724) 和 DeepSeekMoE-16B [42].

Our comprehensive set of controlled experiments highlights key design choices for MoEs (see Table 1) and LMs in general. One critical design decision for making MoEs performant is the use of fine-grained routing with granular experts [42]: we employ 64 small experts in each layer with 8 being activated. The choice of routing algorithm is also important: we find dropless [58] token-based routing [154] outperforms expert-based routing [219]. Our findings also include those that challenge prior work, such as the ineffectiveness of shared experts [42] and the limited benefits of sparsely upcycling a pretrained dense LM into an MoE [85] unless under small compute budgets. Finally, we analyze the routing behavior in OLMoE-1B-7B, finding that routing saturates early in pretraining, experts are rarely co-activated, and experts exhibit domain and vocabulary specialization.

我们做了一整套受控实验, 归纳出 MoE (见 Table 1) 以及一般 LM 的关键设计选择. 让 MoE 表现好的一个关键决定是细粒度路由配合小粒度专家 [42]: 每层用 64 个小专家, 激活其中 8 个. 路由算法的选择同样重要: 我们发现 dropless [58] 的按 token 路由 [154] 优于按专家路由 [219]. 有些发现与已有工作相悖, 比如共享专家 [42] 没有效果, 把预训练好的 dense LM 稀疏上循环 (sparse upcycling) 成 MoE [85] 只在小算力预算下才有收益. 最后我们分析 OLMoE-1B-7B 的路由行为, 发现路由在预训练早期就已饱和, 专家很少被同时激活, 并且专家呈现领域与词表特化.

We hope our fully open MoE facilitates more research and analysis to improve our understanding of these models. We release training code, intermediate checkpoints (every 5000 steps), training logs, and training data under open-source licenses (Apache 2.0 http://www.apache.org/licenses/LICENSE-2.0 or ODC-By 1.0 https://opendatacommons.org/licenses/by/1-0/).

我们希望这个完全开放的 MoE 能促进更多研究与分析, 帮助理解这类模型. 我们以开源许可证 (Apache 2.0 或 ODC-By 1.0) 发布训练代码, 中间检查点 (每 5000 step 一个), 训练日志与训练数据.

## 2 Pretraining and Adaptation · 预训练与适配

**Pretraining architecture** OLMoE is a decoder-only LM consisting of $N_{L}$ transformer [185] layers. The feedforward network (FFN) in dense models like OLMo [65], is replaced with an MoE module consisting of $N_{E}$ smaller FFN modules called experts, of which a subset of $k$ experts is

<!-- page 4 of 63 -->

![](images/olmoe.png)

Figure 2: **Comparison of the architecture of dense LMs and MoE models like OLMoE.** The figure excludes some details, e.g., OLMoE-1B-7B also uses QK-Norm (§4.2.5).

图 2｜dense LM 与 OLMoE 这类 MoE 模型的架构对比. MoE 把每层的 FFN 换成由路由器挑选的若干小专家; 图中省略了 QK-Norm 等细节.

| Design choice | Description | Experiment | OLMoE-1B-7B |
|---|---|---|---|
| Active params | # active parameters per input token | §4.1.1 | 1.3B active |
| Total params | Total # of parameters in the model | §4.1.1 | 6.9B total |
| Expert granularity | Using fine-grained small experts vs. a few large experts | §4.1.2 | 64 small experts with 8 activated |
| Expert sharing | Whether or not to include a shared expert | §4.1.3 | No shared expert |
| Routing algorithm | How inputs are assigned to experts, e.g., assignment on a per token basis (e.g., 2 experts per token) or per expert basis (e.g., 2 tokens per expert), and whether or not all tokens get assigned or some get dropped | §4.1.4 | Dropless MoE with token choice |
| Sparse upcycling | Whether to start from a dense model | §4.1.5 | Not used |
| Load balancing loss | Auxiliary loss to penalize unequal assignment to experts that may harm performance | §4.1.6 | Used with weight 0.01 |
| Router z-loss | Auxiliary loss to penalize large logits in the router that may cause instabilities | §4.1.7 | Used with weight 0.001 |

Table 1: Key MoE design choices and our setup for OLMoE-1B-7B based on our experiments. Full configuration for OLMoE-1B-7B is in §B.

表 1｜MoE 的关键设计选择与 OLMoE-1B-7B 的最终设定: 1.3B 激活 / 6.9B 总参数, 64 个小专家激活 8 个, 无共享专家, dropless token choice, 不做上循环, LBL 权重 0.01, router z-loss 权重 0.001.

<!-- page 5 of 63 -->

| Source | Doc Type | GPT-NeoX tokens (billions) | Words (billions) | UTF-8 bytes (GB) | Documents (millions) |
|---|---|---|---|---|---|
| DCLM-Baseline | web pages | 3,860 | 3,380 | 16,700 | 2,950 |
| StarCoder | code | 101 | 63.9 | 325 | 78.7 |
| peS2o | STEM papers | 57.2 | 51.3 | 268 | 38.8 |
| arXiv | STEM papers | 21.1 | 23.5 | 88.8 | 1.55 |
| OpenWebMath | math web pages | 12.7 | 10.2 | 42.4 | 2.91 |
| Algebraic Stack | math proofs code | 12.6 | 9.6 | 39.3 | 2.83 |
| English Wikipedia & Wikibooks | encyclopedic | 3.69 | 3.16 | 16.2 | 6.17 |
| **Total** |  | **4,060** | **3,530** | **17,400** | **3,080** |

Table 2: Composition of the pretraining data for OLMoE-1B-7B. StarCoder, peS2o, and Wikipedia parts come from Dolma 1.7. Links to our data are in §A.

表 2｜OLMoE-1B-7B 的预训练数据构成, 合计 4.06T GPT-NeoX token, 其中 DCLM-Baseline 网页占 3.86T.

| Source | Domain | Samples |
|---|---|---|
| Instruction Tuning |  |  |
| Tulu 2 SFT Mix | Various | 326,154 |
| No Robots | Various | 9,500 |
| CodeFeedback-Filtered-Instruction | Coding | 156,526 |
| MetaMathQA | Math | 98,750 |
| Advanced (non-chat) subset of Daring Anteater | Various | 17,082 |
| Preference Tuning (DPO) |  |  |
| UltraFeedback binarized and filtered for TruthfulQA contamination | Various | 60,800 |

Table 3: Adaptation training data for OLMoE-1B-7B. Links to our data are in §A.

表 3｜OLMoE-1B-7B 的适配数据: 指令微调用 Tulu 2 SFT Mix, No Robots, CodeFeedback, MetaMathQA 与 Daring Anteater 子集; 偏好微调用去污染后的 UltraFeedback.

activated for each processed input token $x$ (also see Figure 2):

**预训练架构** OLMoE 是由 $N_{L}$ 个 transformer [185] 层组成的 decoder-only LM. OLMo [65] 这类 dense 模型中的前馈网络 (FFN) 被替换为 MoE 模块, 该模块由 $N_{E}$ 个较小的 FFN 组成, 称为专家; 对每个输入 token $x$, 只激活其中 $k$ 个专家 (另见 Figure 2):

$$
\text{MoE module}(x)=\sum_{i \in \text{Top}-k(r(x))} \mathrm{softmax} \left( r(x) \right)_i {E_i(x)} \tag{1}
$$

where $r$, called the router, is a learned linear layer mapping from the input logits to the chosen $k$ experts. A softmax is applied to the router outputs to compute routing probabilities for all $N_E$ experts. Each selected expert $E_i$ processes the input $x$, the output of which is then multiplied with its respective routing probability. The results are then summed across all chosen Top-$k$ experts to constitute the output of the MoE module for a single layer of the model out of its $N_L$ total layers. Key decisions in designing an MoE model include determining the number of activated and total parameters, the design of the experts (e.g., granularity, whether or not to include shared experts), and the choice of the routing algorithm. Moreover, training an MoE model can involve initializing from a dense model (sparse upcycling) and changing the training objective, such as including auxiliary load balancing and router z-losses. Experiments related to these design choices are in §4.1; Table 1 shows our final decisions.

其中 $r$ 称为路由器, 是一个学习得到的线性层, 把输入映射为对各专家的打分, 再从中选出 $k$ 个专家. 对路由器输出做 softmax, 得到全部 $N_E$ 个专家的路由概率. 每个被选中的专家 $E_i$ 处理输入 $x$, 其输出乘以对应的路由概率. 再把所有被选中的 Top-$k$ 专家的结果相加, 得到模型 $N_L$ 层中某一层 MoE 模块的输出. 设计 MoE 的关键决定包括: 激活参数与总参数各定多少, 专家的设计 (如粒度, 是否加共享专家), 以及路由算法的选择. 此外, 训练 MoE 还可能涉及从 dense 模型初始化 (稀疏上循环), 以及修改训练目标, 比如加入辅助的负载均衡损失与 router z-loss. 与这些设计选择相关的实验见 §4.1, 最终决定见 Table 1.

> **译注:** 式 (1) 先对 64 个 logit 做 softmax, 再取 Top-8 概率, 没有在选中的 8 个专家之间重新归一化. HF 配置的 `norm_topk_prob` 为 `false`, 代码也采用先 `softmax` 再 `topk` 的顺序, 因此选中专家的权重和通常小于 1.

In summary, we use 1.3B active parameters out of a total of 6.9B, with 8 activated experts out of 64 per layer. We use dropless token choice routing [58]: For each input token, the learned router network determines 8 experts to process it. We train OLMoE-1B-7B from scratch with two auxiliary losses: load balancing loss ($\mathcal{L}_{LB}$) [154] and router z-loss ($\mathcal{L}_{RZ}$) [221], which we define and experiment with in §4.1.6 and §4.1.7, respectively. We multiply them with respective loss weights, $\alpha$ and $\beta$, and sum them linearly with the cross entropy loss ($\mathcal{L}_{\text{CE}}$) to arrive at our final training loss:

总结一下, 我们在 6.9B 总参数中使用 1.3B 激活参数, 每层 64 个专家激活 8 个. 我们采用 dropless 的 token choice 路由 [58]: 对每个输入 token, 学到的路由网络决定由哪 8 个专家处理它. 我们从零训练 OLMoE-1B-7B, 并加两项辅助损失: 负载均衡损失 ($\mathcal{L}_{LB}$) [154] 与 router z-loss ($\mathcal{L}_{RZ}$) [221], 两者的定义与实验分别见 §4.1.6 与 §4.1.7. 两者分别乘以损失权重 $\alpha$ 与 $\beta$, 再与交叉熵损失 ($\mathcal{L}_{\text{CE}}$) 线性相加, 得到最终训练损失:

$$
\mathcal{L} = \mathcal{L}_{\textit{CE}} + \alpha \mathcal{L}_{\textit{LB}} + \beta \mathcal{L}_{\textit{RZ}} \tag{2}
$$

Our full pretraining configuration for OLMoE-1B-7B is in §B.

OLMoE-1B-7B 完整的预训练配置见 §B.

<!-- page 6 of 63 -->

**Pretraining data** We mix data from DCLM [90] and Dolma 1.7 [163], which includes: (1) a quality-filtered subset of Common Crawl, referred to as DCLM-Baseline, (2) StarCoder, Algebraic Stack and arXiv, used in both DCLM and Dolma 1.7, and (3) peS2o and Wikipedia from Dolma 1.7. We refer to our pretraining dataset as OLMoE-Mix.

**预训练数据** 我们混合 DCLM [90] 与 Dolma 1.7 [163] 的数据, 包括: (1) Common Crawl 经质量过滤的子集, 称为 DCLM-Baseline; (2) DCLM 与 Dolma 1.7 都使用的 StarCoder, Algebraic Stack 与 arXiv; (3) 来自 Dolma 1.7 的 peS2o 与 Wikipedia. 这个预训练数据集记为 OLMoE-Mix.

To all sources above, we apply a filter that removes all documents with a sequence of 32 or more repeated n-grams, where an n-gram is any span of 1 to 13 tokens. 
For the StarCoder subset, we also remove any document from a repository with fewer than 2 stars on GitHub, whose most frequent word constitutes over 30% of the document, or whose top-2 most frequent words constitute over 50% of the document.

对上述所有来源, 我们施加一个过滤器: 只要文档中出现 32 次及以上重复的 n-gram 序列就整篇删除, 这里 n-gram 指长度为 1 到 13 个 token 的任意片段. 对 StarCoder 子集, 我们还删除以下文档: 所在仓库 GitHub star 数少于 2 的, 最高频词占文档 30% 以上的, 前两个高频词合计占 50% 以上的.

We shuffle all samples randomly at the beginning of each epoch and train for a total of 5.133T tokens (1.3 epochs following Muennighoff et al. [121]). During our annealing phase (final 100B tokens) we first reshuffle the entire dataset and then linearly decay the learning rate to 0, following prior work [65, 90]. Our pretraining data statistics are in Table 2.

我们在每个 epoch 开始时随机打乱全部样本, 共训练 5.133T token (按 Muennighoff et al. [121] 的做法训 1.3 个 epoch). 在退火阶段 (最后 100B token), 我们先把整个数据集重新打乱, 再把学习率线性衰减到 0, 做法沿用已有工作 [65, 90]. 预训练数据统计见 Table 2.

**Adaptation** We create OLMoE-1B-7B-Instruct by following a standard adaptation recipe split into **instruction tuning** [118, 149, 156, 190, 206] followed by **preference tuning** [15, 31, 54, 138] building on prior open models [76, 184, 188]. In our instruction tuning dataset, we add more code and math data to boost performance on downstream coding and math applications. Other models, such as GPT-4 [128] and Llama 3 [50] similarly include samples from math datasets like GSM8k [35] or MATH [71] during pretraining. We also include No Robots and a subset of Daring Anteater as they are of high quality and add diversity, two key factors for successful adaptation [104, 120, 188, 216]. We describe our adaptation datasets in Table 3 and hyperparameters in §B.

**适配** 我们按标准适配配方得到 OLMoE-1B-7B-Instruct, 分为**指令微调** [118, 149, 156, 190, 206] 和随后的**偏好微调** [15, 31, 54, 138] 两步, 并参照了已有开放模型 [76, 184, 188]. 指令微调数据里我们加入了更多代码与数学数据, 以提升下游代码与数学应用的表现. 其他模型, 如 GPT-4 [128] 与 Llama 3 [50], 同样在预训练中加入了 GSM8k [35] 或 MATH [71] 等数学数据集的样本. 我们还加入了 No Robots 与 Daring Anteater 的一个子集, 因为它们质量高且增加了多样性, 而这两点是适配成功的关键 [104, 120, 188, 216]. 适配数据见 Table 3, 超参数见 §B.

## 3 Results · 结果

Our evaluation procedure consists of three parts: **During pretraining**, **After pretraining**, and **After adaptation**. We detail the setup for each in §C.

评测分三部分: **预训练期间**, **预训练之后**, **适配之后**. 各部分的设置见 §C.

![](images/trainingevalflops.png)

Figure 3: **Evaluation of OLMoE-1B-7B and the current best OLMo models during pretraining.** OLMoE-1B-7B differs from the OLMo models in its MoE architecture, several training hyperparameters, and its training dataset, see §2. A version of this plot with tokens as the x-axis and markers where annealing starts is in §E. More results, logs, and configurations: https://wandb.ai/ai2-llm/olmoe/reports/Plot-OLMoE-1B-7B-vs-OLMo-7B-vs-OLMo-1B--Vmlldzo4OTcyMjEz

图 3｜预训练期间 OLMoE-1B-7B 与当前最好的 OLMo 模型在各下游任务上的表现, 横轴为训练 FLOPs. 三者在架构, 超参数与数据上都不同, 以 token 为横轴的版本见 Figure 25.

**During pretraining** In Figure 3 we benchmark the performance of OLMoE-1B-7B during pretraining with the current best OLMo models [65] on commonly used downstream tasks. We find that

<!-- page 7 of 63 -->

across all tasks OLMoE-1B-7B reaches better performance with less compute (FLOPs) than the dense OLMo models. OLMoE-1B-7B matches or outperforms OLMo-7B at the end of training despite OLMoE-1B-7B having used less than half as many FLOPs for training and using only 1B active parameters. This is likely a result of the dataset and modeling changes we make to the OLMo setup including MoE-related changes, stability, and performance improvements, outlined in §B. §E contains training and validation loss plots showing very smooth loss curves without major loss spikes during the 5T tokens of our pretraining.

**预训练期间** 在 Figure 3 中, 我们在常用下游任务上对比预训练期间的 OLMoE-1B-7B 与当前最好的 OLMo 模型 [65]. 我们发现在所有任务上, OLMoE-1B-7B 用更少的算力 (FLOPs) 达到比 dense OLMo 模型更好的表现. 训练结束时 OLMoE-1B-7B 追平或超过 OLMo-7B, 尽管它训练所用的 FLOPs 不到后者一半, 且只有 1B 激活参数. 这很可能来自我们对 OLMo 设置所做的数据与建模改动, 包括 MoE 相关改动, 稳定性改进与性能改进, 见 §B. §E 给出训练与验证 loss 曲线, 在 5T token 预训练全程都很平滑, 没有大的 loss 尖峰.

|  | Active params | Open Data | MMLU | HellaSwag | ARC-Chall. | ARC-Easy | PIQA | WinoGrande |
|---|---|---|---|---|---|---|---|---|
| LMs with $\sim$7-9B active parameters |  |  |  |  |  |  |  |  |
| Llama2-7B | 6.7B | no | 46.2 | 78.9 | 54.2 | 84.0 | 77.5 | 71.7 |
| OLMo-7B (0724) | 6.9B | yes | 54.9 | 80.5 | 68.0 | 85.7 | 79.3 | 73.2 |
| Mistral-7B | 7.3B | no | 64.0 | 83.0 | 78.6 | 90.8 | 82.8 | 77.9 |
| DCLM-7B | 6.9B | yes | 64.4 | 82.3 | 79.8 | 92.3 | 80.1 | 77.3 |
| Llama3.1-8B | 8.0B | no | 66.9 | 81.6 | 79.5 | 91.7 | 81.1 | 76.6 |
| Gemma2-9B | 9.2B | no | 70.6 | 87.3 | 89.5 | 95.5 | 86.1 | 78.8 |
| LMs with $\sim$2-3B active parameters |  |  |  |  |  |  |  |  |
| OpenMoE-3B-9B | 2.6B | yes | 27.4 | 44.4 | 29.3 | 50.6 | 63.3 | 51.9 |
| StableLM-2B | 1.6B | no | 40.4 | 70.3 | 50.6 | 75.3 | 75.6 | 65.8 |
| DeepSeek-3B-16B | 2.9B | no | 45.5 | 80.4 | 53.4 | 82.7 | 80.1 | 73.2 |
| JetMoE-2B-9B | 2.2B | no | 49.1 | 81.7 | 61.4 | 81.9 | 80.3 | 70.7 |
| Gemma2-3B | 2.6B | no | 53.3 | 74.6 | 67.5 | 84.3 | 78.5 | 71.8 |
| Qwen1.5-3B-14B | 2.7B | no | 62.4 | 80.0 | 77.4 | 91.6 | 81.0 | 72.3 |
| LMs with $\sim$1B active parameters |  |  |  |  |  |  |  |  |
| Pythia-1B | 1.1B | yes | 31.1 | 48.0 | 31.4 | 63.4 | 68.9 | 52.7 |
| OLMo-1B (0724) | 1.3B | yes | 32.1 | 67.5 | 36.4 | 53.5 | 74.0 | 62.9 |
| TinyLlama-1B | 1.1B | yes | 33.6 | 60.8 | 38.1 | 69.5 | 71.7 | 60.1 |
| Llama3.2-1B | 1.2B | no | 38.2 | 67.3 | 43.5 | 71.6 | 73.7 | 62.5 |
| DCLM-1B | 1.4B | yes | 48.5 | 75.1 | 57.6 | 79.5 | 76.6 | 68.1 |
| OLMoE-1B-7B | 1.3B | yes | 54.1 | 80.0 | 62.1 | 84.2 | 79.8 | 70.2 |

Table 4: OLMoE-1B-7B after pretraining versus larger MoEs and dense LMs. We compare with dense LMs close to OLMoE-1B-7B either in active parameters (1B, approximates speed and cost) or total parameters (7B, approximates memory requirements). Model names contain rounded parameter counts: model-active-total for MoEs and model-total for dense LMs (this leads to some differences to official names, e.g., while called “Gemma2-2B” it actually has 2.6B active and total parameters ). Chall. = Challenge. We run all evaluations ourselves with 5 few-shots, see §C for details.

表 4｜预训练后 OLMoE-1B-7B 与更大的 MoE 及 dense LM 的对比 (OLMES, 5-shot). 按激活参数分三档; OLMoE-1B-7B 在约 1B 激活一档 MMLU 54.1, HellaSwag 80.0, 均为该档最高.

**After pretraining** In Table 4 we benchmark OLMoE-1B-7B on common downstream tasks. We find that OLMoE-1B-7B performs best among models that use less than 2B active parameters, making it the most economical option for many use cases of LMs. For larger budgets, Qwen1.5-3B-14B has stronger performance but has more than double the active and total parameters than OLMoE-1B-7B. We find that despite requiring $\sim$6–7$\times$ less compute per forward pass, OLMoE-1B-7B outperforms some dense LMs with 7B parameters such as Llama2-7B [183], but falls short of others like Llama3.1-8B [50]. Figure 1 compares MMLU performance with active parameters, a proxy for the value of a model given its cost, of OLMoE-1B-7B and other LMs. OLMoE-1B-7B is the state of the art in its cost regime.

**预训练之后** 在 Table 4 中, 我们在常用下游任务上评测 OLMoE-1B-7B. 我们发现在激活参数少于 2B 的模型中, OLMoE-1B-7B 表现最好, 对许多 LM 用途来说是最经济的选择. 预算更大时, Qwen1.5-3B-14B 更强, 但它的激活参数与总参数都是 OLMoE-1B-7B 的两倍以上. 我们发现, 尽管每次前向的算力只有约 1/6 到 1/7, OLMoE-1B-7B 仍超过部分 7B dense LM, 如 Llama2-7B [183], 但不及 Llama3.1-8B [50] 等模型. Figure 1 以激活参数为横轴比较 OLMoE-1B-7B 与其他 LM 的 MMLU, 激活参数可近似看作模型成本, 由此衡量模型的性价比. 在它所处的成本区间, OLMoE-1B-7B 是最好的.

**After adaptation** In Table 5, we benchmark our instruction (SFT) and preference (DPO) tuning of OLMoE-1B-7B. SFT improves our model on all tasks measured. We observe a $>$10$\times$ gain on GSM8k, likely due to our inclusion of additional math data to account for the relatively small amounts of math data during pretraining (§2). DPO helps on most tasks, especially AlpacaEval

<!-- page 8 of 63 -->

| Task ($\rightarrow$) | MMLU | GSM8k | BBH | Human-Eval | Alpaca-Eval 1.0 | XSTest | IFEval | Avg |
|---|---|---|---|---|---|---|---|---|
| Setup ($\rightarrow$) | 0-shot | 8-shot CoT | 3-shot | 0-shot | 0-shot | 0-shot | 0-shot |  |
| Metric ($\rightarrow$) | EM | EM | EM | Pass@10 | %win | F1 | Loose Acc |  |
| OLMo-1B (0724) | 25.0 | 7.0 | 22.5 | 16.0 | - | 67.6 | 20.5 | - |
| +SFT | 36.0 | 12.5 | 27.2 | 21.2 | 41.5 | 81.9 | 26.1 | 35.9 |
| +DPO | 36.7 | 12.5 | 30.6 | 22.0 | 50.9 | 79.8 | 24.2 | 37.4 |
| OLMo-7B (0724) | 50.8 | 32.5 | 36.9 | 32.3 | - | 80.8 | 19.6 | - |
| +SFT | 54.2 | 25.0 | 35.7 | 38.5 | 70.9 | 86.1 | 39.7 | 49.3 |
| +DPO | 52.8 | 9.0 | 16.6 | 35.0 | 83.5 | 87.5 | 37.9 | 49.1 |
| JetMoE-2B-9B | 45.6 | 43.0 | 37.2 | 54.6 | - | 68.2 | 20.0 | - |
| +SFT | 46.1 | 53.5 | 35.6 | 64.8 | 69.3 | 55.6 | 30.5 | 50.4 |
| DeepSeek-3B-16B | 37.7 | 18.5 | 39.4 | 48.3 | - | 65.9 | 13.5 | - |
| +Chat | 48.5 | 46.5 | 40.8 | 70.1 | 74.8 | 85.6 | 32.3 | 57.0 |
| Qwen1.5-3B-14B | 60.4 | 13.5 | 27.2 | 60.2 | - | 73.4 | 20.9 | - |
| +Chat | 58.9 | 55.5 | 21.3 | 59.7 | 83.9 | 85.6 | 36.2 | 57.3 |
| OLMoE-1B-7B | 49.8 | 3.0 | 33.6 | 22.4 | - | 59.7 | 16.6 | - |
| +SFT | 51.4 | 40.5 | 38.0 | 51.6 | 69.2 | 84.1 | 43.3 | 54.0 |
| +DPO | 51.9 | 45.5 | 37.0 | 54.8 | 84.0 | 82.6 | 48.1 | 57.7 |

Table 5: OLMoE-1B-7B after adaptation versus other models. We find the JetMoE chat model (https://hf.co/jetmoe/jetmoe-8b-chat) has random scores thus we exclude it. Model names contain rounded parameter counts: model-active-total for MoEs and model-total for dense LMs. We run all evaluations ourselves (§C). Models use different mixes for adaptation, e.g., OLMoE is trained on an improved version of the pipeline used for OLMo models.

表 5｜适配后 OLMoE-1B-7B 与其他模型的对比. OLMoE-1B-7B +DPO 平均 57.7, 为表中最高; AlpacaEval 1.0 达 84.0.

which aligns with findings from prior work [76, 122, 188]. Our DPO model, which we refer to as OLMoE-1B-7B-Instruct, has the highest average among all models benchmarked. We find it to outperform the chat version of Qwen1.5-3B-14B despite Qwen having $>$2$\times$ more parameters and its pretrained model outperforming OLMoE-1B-7B in Table 4. The 84% score on AlpacaEval also outperforms much larger dense models on the leaderboard,<sup>3</sup> such as Llama2-13B-Chat [183].

**适配之后** 在 Table 5 中, 我们评测 OLMoE-1B-7B 经指令微调 (SFT) 与偏好微调 (DPO) 后的表现. SFT 在所有测量任务上都带来提升. GSM8k 提升超过 10 倍, 很可能是因为预训练中数学数据较少, 我们在适配时补充了额外的数学数据 (§2). DPO 在多数任务上有帮助, 尤其是 AlpacaEval, 这与已有工作的发现一致 [76, 122, 188]. 我们的 DPO 模型, 即 OLMoE-1B-7B-Instruct, 在所有被测模型中平均分最高. 它超过 Qwen1.5-3B-14B 的 chat 版本, 尽管 Qwen 的参数量是它的 2 倍以上, 且 Qwen 的预训练模型在 Table 4 中强于 OLMoE-1B-7B. 在 AlpacaEval 上 84% 的分数也超过排行榜上许多大得多的 dense 模型,<sup>3</sup> 例如 Llama2-13B-Chat [183].

> **看表:** Table 5 的 Avg 列是 7 个任务的算术平均吗? 对几行复算.
> 答: OLMoE 两行对得上: +SFT 为 $(51.4+40.5+38.0+51.6+69.2+84.1+43.3)/7=54.0$, +DPO 为 57.7; DeepSeek +Chat 与 Qwen +Chat 也对得上 (57.0, 57.3). 对照模型几行对不上: OLMo-1B +SFT 写 35.9, 七列平均为 35.20; OLMo-1B +DPO 写 37.4, 平均 36.67; OLMo-7B +SFT 写 49.3, 平均 50.01; OLMo-7B +DPO 写 49.1, 平均 46.04; JetMoE +SFT 写 50.4, 平均 50.77. 文中没有给出这些 Avg 的另一种算法, 「OLMoE-1B-7B-Instruct 平均最高」的结论按七列平均重算后不变.

<sup>3</sup> https://tatsu-lab.github.io/alpaca_eval/

<sup>3</sup> https://tatsu-lab.github.io/alpaca_eval/

## 4 Experimenting with Alternative Design Choices · 其他设计选择的实验

In this section, we present pretraining and adaptation experiments that have led to OLMoE-1B-7B. We group them into experiments on settings specific to Mixture-of-Experts (§4.1), experiments on settings applicable to both dense LMs and MoEs (§4.2), and adaptation experiments (§4.3). In pretraining experiments, we often use MMLU Var, a version of MMLU [70] with varying few-shots and a different format that provides signal earlier during training. We describe our full evaluation setup in §C and provide additional experiments in §F. Each experiment links to a Weights & Biases report with more validation and downstream results, and the full configurations of the runs. To isolate the impact of changes and minimize confounders, we vary only one hyperparameter for each experiment. Nevertheless, due to the large number of hyperparameters, some results may change under different configurations and we cannot guarantee the correctness of each of our hyperparameter choices. Models are not comparable across different experiments, as we vary the base model to incorporate successful findings.

本节介绍最终得到 OLMoE-1B-7B 的预训练与适配实验, 分三组: MoE 特有设置的实验 (§4.1), 对 dense LM 与 MoE 都适用的设置的实验 (§4.2), 以及适配实验 (§4.3). 预训练实验中我们常用 MMLU Var, 它是 MMLU [70] 的一个变体, few-shot 数可变, 格式不同, 能在训练更早阶段给出信号. 完整评测设置见 §C, 更多实验见 §F. 每个实验都附有 Weights & Biases 报告链接, 里面有更多验证集与下游结果, 以及各次运行的完整配置. 为隔离改动的影响, 减少混杂因素, 每个实验只改一个超参数. 不过超参数数量很多, 换一套配置有些结论可能会变, 我们无法保证每个超参数选择都正确. 不同实验之间的模型不可直接比较, 因为我们会把已验证有效的发现并入基线模型.

### 4.1 MoE-specific Pretraining Settings · MoE 特有的预训练设置

#### 4.1.1 Mixture-of-Experts vs. Dense · MoE 与 dense 对比

Prior work reports various speed-ups of MoEs over dense models: Artetxe et al. [10] report that MoEs require 2–4$\times$ less compute to match dense models, MoMa [100] exhibits 2.6$\times$ FLOP savings for language tasks, Arctic [161] yields 4$\times$ FLOP savings but for very different dense and MoE

<!-- page 9 of 63 -->

![](images/moevsdense.png)

Figure 4: **MoE vs. Dense.** We train a 1.3B parameter dense model and a 1.3B active, 6.9B total parameter MoE model, each on 128 H100 GPUs. Apart from MoE-related changes, we train both with the same configuration for 130B tokens. The MoE contains 64 experts out of which 8 are activated with an FFN dimension of 1,024, while the dense model has an FFN dimension of 8,192. Thus both have the same number of active parameters. **Top:** The MoE reaches the final dense performance with $\sim$3$\times$ fewer tokens (or FLOPs, as both have the same active parameters ignoring the trivial router parameters). **Bottom:** Due to some memory overhead, this equates to $\sim$2$\times$ faster training. More results, logs, and configurations: https://wandb.ai/ai2-llm/olmoe/reports/Plot-MoE-vs-Dense--Vmlldzo4OTM0Mjkx

图 4｜MoE 与 dense 的受控对比: 1.3B dense 与 1.3B 激活 / 6.9B 总参数的 MoE 各在 128 张 H100 上训练 130B token. 上排以 token 为横轴, MoE 约用 1/3 的 token 达到 dense 的最终水平; 下排以训练时间为横轴, 约快 2 倍.

configurations, and Switch Transformers [56] train 2-7$\times$ faster with MoEs but for encoder-decoder models while the other works study decoder-only LMs [137].

已有工作报告了 MoE 相对 dense 模型的各种加速: Artetxe et al. [10] 报告 MoE 达到 dense 模型同等水平所需算力少 2 到 4 倍; MoMa [100] 在语言任务上节省 2.6 倍 FLOPs; Arctic [161] 节省 4 倍 FLOPs, 但其 dense 与 MoE 的配置差别很大; Switch Transformers [56] 用 MoE 训练快 2 到 7 倍, 但研究的是 encoder-decoder 模型, 其余工作研究的都是 decoder-only LM [137].

In Figure 4, we compare MoEs and dense models in a controlled setup. We find that our MoE reaches the performance of the dense model with $\sim$3$\times$ fewer tokens equivalent to $\sim$3$\times$ less compute measured in FLOPs. However, due to the additional memory overhead of training the MoE with its 7B total parameters, it processes fewer tokens per second than the dense model (23,600 tokens per second per GPU for the MoE vs. 37,500 for dense). Thus, in terms of training time, it reaches the performance of the dense model only $\sim$2$\times$ faster. There are likely optimizations possible that would bring the speed-up closer to the 3$\times$ token speed-up, which we leave to future work. Based on these results, we select an MoE configuration with 6.9B total and 1.3B active parameters matching OLMo-7B in total and OLMo-1B in active parameter count, respectively.

在 Figure 4 中, 我们在受控设置下比较 MoE 与 dense 模型. 我们发现 MoE 用约 1/3 的 token 就达到 dense 模型的水平, 按 FLOPs 计也相当于约 1/3 的算力. 但训练这个总参数 7B 的 MoE 有额外的显存开销, 每秒处理的 token 少于 dense 模型 (MoE 每 GPU 每秒 23,600 个 token, dense 为 37,500). 因此按训练时间算, 它达到 dense 模型水平只快约 2 倍. 应该还有优化手段能让速度提升更接近 token 层面的 3 倍, 留待以后. 基于这些结果, **我们选择 6.9B 总参数, 1.3B 激活参数的 MoE 配置**, 总参数与 OLMo-7B 相当, 激活参数与 OLMo-1B 相当.

#### 4.1.2 Expert Granularity · 专家粒度

Dai et al. [39] propose to use small fine-grained experts to allow more combinations of experts and thus make the model more flexible. For example, the Mixtral model [79] uses the common configuration of 8 experts per layer, 2 of which are activated. This allows for $\binom{8}{2}=28$ combinations per layer. By halving the size of each expert and therefore doubling the number of experts to maintain the same compute and parameter budget, we can increase the possible combinations to $\binom{16}{4}=1,820$. Krajewski et al. [86] investigate compute-optimal granularity configurations finding that higher compute budgets warrant more granular experts.

Dai et al. [39] 提出用细粒度的小专家, 让专家组合更多, 从而使模型更灵活. 例如 Mixtral [79] 采用常见配置, 每层 8 个专家激活 2 个, 每层有 $\binom{8}{2}=28$ 种组合. 把每个专家缩小一半, 专家数翻倍, 以保持算力与参数预算不变, 可能的组合数就增加到 $\binom{16}{4}=1,820$. Krajewski et al. [86] 研究了算力最优的粒度配置, 发现算力预算越高, 越应该用更细粒度的专家.

In Figure 5, we observe that more granular experts improve training loss, validation loss, and downstream performance. The 8-expert configuration uses 1 active expert, which yields $\binom{8}{1}=8$ combinations. By quartering the size of each expert but increasing the number to 32 with 4 active ones ($\binom{32}{4}=35,960$ combinations), we observe an improvement of around 10% on HellaSwag

<!-- page 10 of 63 -->

![](images/granularity.png)

Figure 5: **Expert granularity.** We vary the number of experts in tandem with the FFN dimension to ensure that active and total parameters and thus compute cost remain the same. For example, for 64 experts, the FFN dimension is 1,024 and 8 experts are activated, while for 32 experts it is 2,048 with 4 activated experts. More results, logs, and configurations: https://wandb.ai/ai2-llm/olmoe/reports/Plot-Granularity--Vmlldzo4OTIxOTE4

图 5｜专家粒度: 专家数与 FFN 维度同步变化, 使激活参数与总参数不变 (8 专家激活 1 个, 32 专家激活 4 个, 64 专家激活 8 个). 更细的专家在训练 loss, 验证 loss 与 HellaSwag, MMLU Var 上都更好, 但 32 到 64 的增益变小.

and MMLU at around 130 billion tokens. However, we find that there are diminishing returns to granularity. The additional increase to 64 experts with 8 active ones ($\binom{64}{8}=4,426,165,368$ combinations) improves downstream metrics by a smaller amount of 1–2%. For our OLMoE-1B-7B compute budget<sup>4</sup> of $3\times10^{22}$, Krajewski et al. [86] predict an optimal number of experts of 256 ($G=32$ in their paper). However, their predictions are for compute-optimal models [32, 72], while we train for 5T tokens, which is orders of magnitude beyond what would be conventionally considered optimal for our model size. Thus, their predictions may not extend to our setup, and we stick with 64 experts for OLMoE-1B-7B, also due to the diminishing returns in Figure 5.

在 Figure 5 中, 我们观察到更细粒度的专家改善了训练 loss, 验证 loss 与下游表现. 8 专家的配置激活 1 个专家, 只有 $\binom{8}{1}=8$ 种组合. 把每个专家缩到四分之一, 数量增加到 32 个并激活 4 个 ($\binom{32}{4}=35,960$ 种组合), 在约 130B token 处 HellaSwag 与 MMLU 提升约 10%. 但粒度的收益递减. 再增加到 64 个专家激活 8 个 ($\binom{64}{8}=4,426,165,368$ 种组合), 下游指标只再提升 1 到 2%. 对 OLMoE-1B-7B 的算力预算<sup>4</sup> $3\times10^{22}$, Krajewski et al. [86] 预测的最优专家数为 256 (即其文中的 $G=32$). 但他们的预测针对算力最优模型 [32, 72], 而我们训练 5T token, 比该规模模型通常认为的最优量多出几个数量级. 所以他们的预测未必适用于我们的设置, 再加上 Figure 5 中的收益递减, **OLMoE-1B-7B 仍用 64 个专家**.

> **问:** 「8 到 32 专家提升约 10%」是绝对点数还是相对比例? 能否与 Figure 5 读数对上?
> 答: 文中没有说明口径. 从 Figure 5 在 130B token 处读数, HellaSwag 约从 63 升到 66, MMLU Var 约从 34.6 升到 36.5, 绝对提升约 3 点和 2 点, 相对提升约 5%. 无论按绝对还是相对算, 图上读数都到不了 10%. 64 专家相对 32 专家再提升 1 到 2 点, 与正文一致.

<sup>4</sup> Approximated via $6*N*D$ [80], where $N$ are active parameters (1B) and $D$ are training tokens (5T).

<sup>4</sup> 用 $6*N*D$ [80] 近似, 其中 $N$ 为激活参数 (1B), $D$ 为训练 token 数 (5T).

#### 4.1.3 Shared Experts · 共享专家

![](images/shared.png)

Figure 6: **Shared experts.** Both setups have the same number of active and total parameters and use the same number of FLOPs. 4 of the 32 routed experts are activated, while it is 3 for the 31 routed experts of the other model, as it has 1 always-active shared expert. More results, logs, and configurations: https://wandb.ai/ai2-llm/olmoe/reports/Plot-Expert-sharing--Vmlldzo4OTIyMjQz

图 6｜共享专家: 两组设置激活参数与总参数相同, FLOPs 相同. 一组是 32 个路由专家激活 4 个, 另一组是 31 个路由专家激活 3 个外加 1 个始终激活的共享专家; 共享专家一组略差.

Dai et al. [39] propose training with a shared/fixed expert that is always used in addition to the routed experts. The intuition is to encourage the shared expert to learn common information and allow the other routed experts to learn more specialized knowledge. This should reduce redundancy among experts and thus lead to a better model as it can store more total information.

Dai et al. [39] 提出在路由专家之外, 再训练一个始终参与计算的共享 (固定) 专家. 其想法是让共享专家学习公共信息, 其余路由专家学习更专门的知识. 这应能减少专家间的冗余, 让模型能存下更多信息, 从而更好.

In Figure 6, we benchmark having a single shared and a single routed expert versus two routed experts. While both settings lead to similar performance, sharing an expert performs slightly worse. Sharing an expert removes flexibility from the model and thus goes against the findings in §4.1.2 suggesting that allowing for more expert combinations improves performance. Specifically, the two models in Figure 6 have $\binom{32}{4}=35,960$ and $\binom{31}{3}=4,495$ possible combinations per layer. Thus, removing one of the routed experts and turning it into a shared one eliminates almost 90% of possible

<!-- page 11 of 63 -->

combinations. This likely acts as a counterforce to the potential benefits of isolating common knowledge in a shared expert. Based on these results, we do not use shared experts in OLMoE-1B-7B, but we do think that there is merit to the idea of experts that are activated more often or even always. However, rather than enforcing this behavior via a shared expert, we believe that it should be learned by the model. This is difficult with current setups due to the necessity of a load balancing loss (§4.1.6) penalizing the model if tokens are not distributed equally among experts. Potential future work can explore removing the load balancing loss to allow for more flexible usage of experts.

在 Figure 6 中, 我们比较「一个共享专家加一个路由专家」与「两个路由专家」. 两种设置表现接近, 但共享专家略差. 共享专家削弱了模型的灵活性, 与 §4.1.2 的发现相悖: 那里表明允许更多专家组合能提升表现. 具体来说, Figure 6 中两个模型每层的可能组合分别为 $\binom{32}{4}=35,960$ 与 $\binom{31}{3}=4,495$. 也就是说, 拿出一个路由专家改作共享专家, 去掉了近 90% 的可能组合. 这可能抵消了在共享专家中隔离公共知识的潜在好处. 基于这些结果, **OLMoE-1B-7B 不使用共享专家**. 不过我们认为, 让某些专家更常被激活甚至始终激活, 这个想法有其价值. 只是与其用共享专家强行规定这种行为, 我们认为应当让模型自己学出来. 在当前设置下这很难做到, 因为必须使用负载均衡损失 (§4.1.6), 只要 token 在专家间分配不均, 模型就会受罚. 未来可以尝试去掉负载均衡损失, 让专家的使用更灵活.

> **译注:** Figure 6 题注与组合数对应 32 个路由专家激活 4 个, 对照组则是 31 个路由专家激活 3 个再加 1 个共享专家. 官方消融配置也采用 `moe_num_experts: 32`, `moe_top_k: 3`, `moe_shared_expert: true`. 正文的 「single shared and single routed」 与题注, 组合数和代码配置不一致. $4495/35960=12.5\%$, 因而减少的是 87.5% 的组合.

#### 4.1.4 Expert Choice vs. Token Choice · Expert Choice 与 Token Choice

![](images/expertchoice.png)

Figure 7: **Expert choice (EC) vs. token choice (TC).** Both models have an 8-expert MoE in every 2nd layer. For TC, 2 experts are activated per token, while for EC the capacity factor is 2. Thus, both models use the same number of active parameters. More results, logs, and configurations: https://wandb.ai/ai2-llm/olmoe/reports/Plot-EC-vs-TC--Vmlldzo4MzkzMDM3

图 7｜expert choice (EC) 与 token choice (TC) 的对比: 两个模型每隔一层放一个 8 专家 MoE, TC 每 token 激活 2 个专家, EC 的容量因子为 2, 激活参数相同. TC 在训练 loss 与下游任务上都更好.

The MoE router determines which experts process each input token (§2). There are two common types [102]: **expert choice (EC)** [219] and **token choice (TC)** [154]. For EC, each expert selects a fixed number of tokens from the incoming sequence. By design, this leads to each expert processing the same number of tokens. This is the main benefit of EC as it ensures perfect load balance, which improves training throughput and removes the need for a load balancing loss. The main downside of EC is that it is not easily usable for autoregressive generation where a single token is processed at each step rather than the entire sequence in one [143]. Another potential downside is that EC can lead to token dropping, where some tokens are not selected by any expert, which can hurt performance [58]. At the same time, it can lead to some tokens being processed by multiple experts, which could also be beneficial as it allows the model to allocate more compute to some tokens [219]. For TC, each token selects a fixed number of experts. This can lead to many tokens choosing the same expert, hurting training efficiency. Therefore it is common to use TC with a load balancing loss [154] to encourage equal distribution.

MoE 路由器决定每个输入 token 由哪些专家处理 (§2). 常见的有两类 [102]: **expert choice (EC)** [219] 与 **token choice (TC)** [154]. 在 EC 中, 每个专家从输入序列中挑选固定数量的 token. 按设计, 每个专家处理的 token 数相同. 这是 EC 的主要好处: 保证完美的负载均衡, 提升训练吞吐, 也不再需要负载均衡损失. EC 的主要缺点是不便用于自回归生成, 因为生成时每步只处理一个 token, 而不是一次处理整个序列 [143]. 另一个潜在缺点是 EC 可能导致 token 丢弃, 即有些 token 没有被任何专家选中, 这可能损害表现 [58]. 同时, EC 也可能让一些 token 被多个专家处理, 这或许有益, 因为模型可以给某些 token 分配更多算力 [219]. 在 TC 中, 每个 token 挑选固定数量的专家. 这可能导致许多 token 选中同一个专家, 损害训练效率. 因此 TC 通常配合负载均衡损失 [154] 使用, 以促使分配均匀.

In Figure 7, we benchmark EC and TC. We find that TC outperforms EC for the same token budget for all tasks depicted as well as other tasks like PIQA, SciQ, etc. which we report at https://wandb.ai/ai2-llm/olmoe/reports/Plot-EC-vs-TC--Vmlldzo4MzkzMDM3. While Zhou et al. [219] find EC to be better, our configuration slightly differs in that we use dropless MoEs [58] with a load balancing loss. Thus, our TC variant is expected to perform better than the TC variant in Zhou et al. [219]. We confirm findings that EC runs around 20% faster at 29,400 tokens per second per device versus 24,400 for TC [219]. EC may be more beneficial in a multimodal setup [100] as dropping noisy image tokens is likely less harmful than text tokens. Thus, while we stick with TC for this release of OLMoE, we may revisit EC for future multimodal models.

在 Figure 7 中我们对比 EC 与 TC. 我们发现在相同 token 预算下, TC 在图中所有任务上都优于 EC, 在 PIQA, SciQ 等其他任务上也是如此, 结果见 https://wandb.ai/ai2-llm/olmoe/reports/Plot-EC-vs-TC--Vmlldzo4MzkzMDM3. Zhou et al. [219] 的结论是 EC 更好, 但我们的配置略有不同: 我们用 dropless MoE [58] 并加负载均衡损失. 因此我们的 TC 变体预期会比 Zhou et al. [219] 中的 TC 变体更好. 我们也证实了 EC 快约 20% 的结论: 每设备每秒 29,400 个 token, TC 为 24,400 [219]. EC 在多模态设置中可能更有利 [100], 因为丢掉有噪声的图像 token 大概比丢掉文本 token 危害小. 所以, **这一版 OLMoE 仍用 TC**, 未来做多模态模型时可能会重新考虑 EC.

#### 4.1.5 Sparse Upcycling · 稀疏上循环

Komatsuzaki et al. [85] propose turning a dense model into a Mixture-of-Experts model via sparse upcycling: (1) The dense MLP is cloned for each desired expert to constitute MoE layers. (2) A newly initialized router is added in front of each MoE layer. (3) Pretraining continues with the new model so that the cloned MLPs can gradually specialize in different things and the router can be learned. They find that the upcycling approach maintains a performance advantage over a language model trained from scratch for up to 120% of the compute budget of the original dense checkpoint that the sparse model was upcycled from. For example, if sparsely upcycling a 1.3B parameter model

<!-- page 12 of 63 -->

![](images/upcycle.png)

Figure 8: **Sparse upcycling.** We upcycle OLMo-1B (0724) at 2T tokens into an MoE with 8 total experts of which 2 are activated and train it for an additional 610 billion tokens. We compare it to a model trained from scratch for 610 billion tokens. Except for this difference, both models use the same config, which includes some suboptimal settings that contribute to the instability, such as no QK-Norm (§4.2.5) and no truncated normal init (§4.2.2). More results, logs, and configurations: https://wandb.ai/ai2-llm/olmoe/reports/Plot-Scratch-vs-Upcycle--Vmlldzo4NDIyOTc4

图 8｜稀疏上循环: 把训练到 2T token 的 OLMo-1B (0724) 上循环成 8 专家激活 2 个的 MoE, 再训练 610B token, 与从零训练 610B token 的 MoE 对比. 从零训练的模型约 500B token 追平, 约 600B token 后反超.

at 2 trillion tokens then only at 2.4 trillion tokens should an MoE trained from scratch catch up with the upcycled model. That is, the sparsely upcycled model would have been trained for another 400 billion tokens, thereby saving the equivalent of up to 2T tokens of compute. Other works such as MiniCPM [74], Qwen2 [201] and reportedly Mixtral [25, 79] have adopted sparse upcycling but only share limited information about their configuration.

Komatsuzaki et al. [85] 提出通过稀疏上循环把 dense 模型变成 MoE: (1) 把 dense MLP 复制成所需数量的专家, 构成 MoE 层; (2) 在每个 MoE 层前加一个新初始化的路由器; (3) 用新模型继续预训练, 让复制出的 MLP 逐渐分化, 同时学习路由器. 他们发现, 在不超过原 dense 检查点算力预算 120% 的范围内, 上循环模型一直比从零训练的语言模型有优势. 例如, 上循环一个训练了 2 万亿 token 的 1.3B 参数模型, 从零训练的 MoE 要到 2.4 万亿 token 才能追上上循环模型. 这时上循环模型只多训练了 400B token, 相当于省下最多 2T token 的算力. MiniCPM [74], Qwen2 [201], 以及据报道的 Mixtral [25, 79] 等工作采用了稀疏上循环, 但对配置只透露了很少信息.

In Figure 8, we compare sparse upcycling OLMo-1B (0724) [65] with training an MoE from scratch. We find that after 500B tokens, an otherwise equivalent MoE trained from scratch already catches up with the upcycled model, both on the metrics in Figure 8 and our additional metrics at https://wandb.ai/ai2-llm/olmoe/reports/Plot-Scratch-vs-Upcycle--Vmlldzo4NDIyOTc4. At around 600B tokens, the MoE from scratch starts outperforming the upcycled MoE. Thus, it only requires 25% of the compute budget of the original dense model to catch up as opposed to the 120% reported in Komatsuzaki et al. [85]. However, they use expert choice routing and study encoder-decoder models [139]. Meanwhile, we use token choice routing (§4.1.4) and decoder-only models (§2). Further, we upcycle a model that has already been significantly overtrained [57], i.e., a 1B model trained for 2T tokens. Its parameters are likely already in a very optimal range for a dense model, which may limit the amount of additional exploration possible after upcycling. This motivates us to experiment with adding noise to the upcycled weights outlined in §F, but we do not find it to lead to better performance. A large disadvantage of upcycling is that the upcycled MoE is constrained by some hyperparameters of the dense model. Specifically, OLMo-1B (0724) was trained without QK-Norm and normal initialization, both of which hurt stability in our experiments (§4.2.5, §4.2.2). While it may be possible to simply add new QK-Norms and train them from scratch similar to the new router layer trained from scratch, it is impossible to change the initialization of the original dense model when upcycling it. Thus, as we want to change these hyperparameters and also train OLMoE-1B-7B for around 250% of the compute budget of the dense model (5T vs. 2T tokens), we do not use upcycling.

在 Figure 8 中, 我们比较对 OLMo-1B (0724) [65] 做稀疏上循环与从零训练 MoE. 我们发现, 在 500B token 之后, 其他条件相同的从零训练 MoE 就已追上上循环模型, 无论是 Figure 8 的指标还是 https://wandb.ai/ai2-llm/olmoe/reports/Plot-Scratch-vs-Upcycle--Vmlldzo4NDIyOTc4 里的其他指标. 约 600B token 时, 从零训练的 MoE 开始超过上循环 MoE. 也就是说, 追平只需要原 dense 模型算力预算的 25%, 而不是 Komatsuzaki et al. [85] 报告的 120%. 不过他们用的是 expert choice 路由, 研究的是 encoder-decoder 模型 [139]; 我们用的是 token choice 路由 (§4.1.4) 和 decoder-only 模型 (§2). 此外, 我们上循环的模型已经被大幅过训练 [57], 即一个训练了 2T token 的 1B 模型. 它的参数可能已经处在 dense 模型的较优区域, 这可能限制了上循环后还能继续探索的空间. 这促使我们尝试给上循环权重加噪声 (见 §F), 但没有发现表现变好. 上循环的一大缺点是, 上循环得到的 MoE 受 dense 模型某些超参数的约束. 具体来说, OLMo-1B (0724) 训练时没有 QK-Norm, 用的是普通正态初始化, 而这两点在我们的实验中都损害稳定性 (§4.2.5, §4.2.2). 新加 QK-Norm 并从零训练它, 与从零训练新的路由层类似, 或许可行; 但上循环时无法改变原 dense 模型的初始化. 因此, 既然我们想改这些超参数, 并且 OLMoE-1B-7B 要训练约为 dense 模型 250% 的算力预算 (5T 对 2T token), **我们不使用上循环**.

#### 4.1.6 Load Balancing Loss · 负载均衡损失

Shazeer et al. [154] propose the load balancing loss to penalize the model if it is unbalanced, i.e., if it routes all tokens to only a few experts. This is based on the observation that without such penalty, models tend to update only a select few experts in each layer [17, 52]. To compute the load balancing loss ($\mathcal{L}_{\text{LB}}$) we multiply the fraction of tokens $f_i$ routed to one expert $E_i$ with the total routing probability $P_i$ allocated to $E_i$ for one batch and sum it across the number of experts $N_{E}$:

Shazeer et al. [154] 提出负载均衡损失, 在模型分配不均, 即把所有 token 只路由到少数几个专家时进行惩罚. 其依据是观察到: 没有这种惩罚时, 模型往往在每层只更新少数几个专家 [17, 52]. 计算负载均衡损失 ($\mathcal{L}_{\text{LB}}$) 时, 对一个 batch, 把路由到专家 $E_i$ 的 token 比例 $f_i$ 与分配给 $E_i$ 的路由概率总和 $P_i$ 相乘, 再对 $N_{E}$ 个专家求和:

$$
\mathcal{L}_{\textit{LB}} = N_{E} \cdot \sum_{i=1}^{N_{E}} f_i \cdot P_i \tag{3}
$$

The loss is further scaled by $N_{E}$ and a loss weight $\alpha$ (see Equation 2), which is an optional weight to determine the magnitude of the loss commonly set to 0.01 [199, 221]. We do not experiment with changing the weight of 0.01.

该损失再乘以 $N_{E}$ 和损失权重 $\alpha$ (见 Equation 2); $\alpha$ 是可选权重, 用于控制损失大小, 通常设为 0.01 [199, 221]. 我们没有试验改变 0.01 这个权重.

> **确认:** 式 (3) 已经带了一个 $N_E$, 正文又说「再乘以 $N_E$」, 是乘了两次吗? $f_i$ 按什么归一?
> 答: 式 (3) 与正文对乘几次 $N_E$ 说法不一, $f_i$ 是按 token 数还是按 token-专家对数归一也没交代. 训练实际用的是 megablocks 的 `batched_load_balancing_loss`: 系数为 $N_E\cdot\alpha/(N_L\cdot T\cdot k)$, 再乘各专家的 token 计数与平均路由概率的点积, 完全均衡时不含 $\alpha$ 的值为 1, 只乘一次 $N_E$. HF transformers 的 `load_balancing_loss_func` 则把 $k$ 个选择分别算比例再相加, 完全均衡时值为 $k=8$. Table 6 里的数值在 9.09 到 14.85 之间, 只有按后一种口径才可能出现, 所以 Table 6 与训练时用的损失不是同一个归一化.

<!-- page 13 of 63 -->

![](images/lbl.png)

Figure 9: **Impact of applying a load balancing loss (LBL).** The training loss plot excludes the load balancing loss for both models. More results, logs, and configurations: https://wandb.ai/ai2-llm/olmoe/reports/Plot-LBL-vs-No-LBL--Vmlldzo4OTkyNDg4

图 9｜负载均衡损失 (LBL) 的影响: 加 LBL 的模型在训练 loss 与 C4, Pile 验证 loss 上都更好; 不加 LBL 时仍记录其数值, 初期尖峰后缓慢下降. 训练 loss 曲线不含 LBL 本身.

![](images/lbltoks.png)

Figure 10: **Expert assignment during training when using or not using a load balancing loss for the first MoE layer.** More results, logs, and configurations: https://wandb.ai/ai2-llm/olmoe/reports/Plot-LBL-vs-No-LBL--Vmlldzo4OTkyNDg4

图 10｜第一个 MoE 层的专家分配随训练的变化 (8 个专家): 不加 LBL 时 (左) 几乎全部 token 流向第 6 个专家, 之后第 1 个专家才分到一部分, 其余专家基本闲置; 加 LBL 时 (右) 各专家接近均匀.

In Figure 9 we investigate the performance impact of using the auxiliary load balancing loss. We find that across training loss and validation losses, using the load balancing loss leads to better performance even after only a few billion tokens. We still measure the load balancing loss even when it is not used (“No LBL”) and find that while it spikes initially, it slowly decreases over the next few billion tokens. This behavior is also visible in Figure 10 (left), where initially all tokens in the first layer are assigned to the 6th expert (pink). Eventually, the model also starts assigning some tokens to the 1st expert (yellow). However, all other experts remain largely flat and are thus “dead weights” that take up GPU memory but are not used. Given these results, we use the auxiliary load balancing loss with a weight of 0.01 following prior work [154, 158]. However, getting rid of the load balancing loss is an important direction for future research as it constrains the flexibility of the model by forcing it to use all experts approximately equally. This could prevent the experts from specializing in certain data domains and may be a reason prior work has failed to find strong evidence of expert specialization [79, 221].

在 Figure 9 中, 我们考察使用辅助负载均衡损失对表现的影响. 我们发现在训练 loss 与各验证 loss 上, 使用负载均衡损失都带来更好的表现, 只训练几十亿 token 后就能看出. 不使用时 (「No LBL」) 我们仍记录负载均衡损失, 发现它初期出现尖峰, 随后在接下来几十亿 token 中缓慢下降. 这一现象在 Figure 10 (左) 中也能看到: 起初第一层的所有 token 都被分配给第 6 个专家 (粉色). 后来模型才开始把部分 token 分给第 1 个专家 (黄色). 其余专家基本一直是平的, 因而是占着显存却不被使用的「死权重」. 鉴于这些结果, 我们沿用已有工作 [154, 158], **使用权重为 0.01 的辅助负载均衡损失**. 不过, 去掉负载均衡损失是未来研究的重要方向, 因为它强迫模型大致平均地使用所有专家, 限制了模型的灵活性. 这可能阻碍专家在特定数据领域上特化, 也可能是已有工作没能找到专家特化强证据的原因之一 [79, 221].

#### 4.1.7 Router Z-loss · Router Z-loss

Zoph et al. [221] propose the router z-loss to improve both the stability and quality of MoE models. This auxiliary loss penalizes large logits coming into the gating network. Such large logits can lead to numeric overflows in the large matrix multiplications happening in the MoE layer. It is computed by exponentiating the logits $x_j$ right before the router layer summed across the number of experts $N_E$ and averaged across the batch $B$, thereby making larger logits lead to a larger loss:

Zoph et al. [221] 提出 router z-loss, 用来同时改善 MoE 模型的稳定性与质量. 这项辅助损失惩罚进入门控网络的过大 logit. 过大的 logit 可能在 MoE 层的大矩阵乘法中造成数值溢出. 计算方法是: 对路由层的 logit $x_j$ 取指数, 对 $N_E$ 个专家求和, 取对数后平方, 再对 batch $B$ 求平均, 于是 logit 越大损失越大:

$$
\mathcal{L}_{\textit{RZ}}(x) = \frac{1}{B} \cdot \sum_{i=1}^B \left(\log \sum_{j=1}^{N_{E}} \exp({x_j^{(i)}}) \right)^2 \tag{4}
$$

The loss is further multiplied with an optional loss weight, $\beta$ (see Equation 2), to determine the magnitude of the loss commonly set to 0.001 [158, 221]. We do not experiment with changing the weight of 0.001.

该损失再乘以可选的损失权重 $\beta$ (见 Equation 2) 以控制其大小, 通常设为 0.001 [158, 221]. 我们没有试验改变 0.001 这个权重.

> **对一下:** 式 (4) 只对 batch 求平均, 代码里的 z-loss 也是这样归一的吗?
> 答: 不完全是. megablocks 的实现把每层每个 token 的 $(\log\sum_j e^{x_j})^2$ 相加后除以 $N_L\cdot T\cdot k$, 比式 (4) 在层间取平均之后又多除了一个 $k=8$, 再乘 `moe_zloss_weight: 0.001`. 所以相对式 (4) 的有效权重是 $0.001/8=1.25\times10^{-4}$. 官方仓库 issue #39 里作者确认了这一点, 并说没有对这个归一化做消融.

<!-- page 14 of 63 -->

![](images/zloss.png)

Figure 11: **Router z-loss.** We compare adding router z-loss with a loss weight of 0.001 versus no additional z-loss. More results, logs, and configurations: https://wandb.ai/ai2-llm/olmoe/reports/Plot-Zloss-vs-none--Vmlldzo4NDM4NjUz

图 11｜router z-loss: 权重 0.001 的 z-loss 对比不加, 加 z-loss 后尖峰更少, 训练与验证 loss 更低, HellaSwag 与 MMLU Var 更高.

In Figure 11, we confirm that across training loss, validation loss, and downstream performance adding the router z-loss improves stability (less spikes) and quality (lower loss and higher downstream performance). Thus, despite it reducing throughput by $\sim$2% we use the router z-loss for OLMoE-1B-7B with a weight of 0.001 as in Zoph et al. [221].

在 Figure 11 中我们确认, 在训练 loss, 验证 loss 与下游表现上, 加入 router z-loss 都改善了稳定性 (尖峰更少) 与质量 (loss 更低, 下游表现更高). 因此, 尽管它让吞吐下降约 2%, **OLMoE-1B-7B 仍按 Zoph et al. [221] 的做法使用权重 0.001 的 router z-loss**.

### 4.2 General Pretraining Settings · 通用预训练设置

#### 4.2.1 Dataset Experiments · 数据集实验

![](images/dataset.png)

Figure 12: **OLMoE-Mix vs. Dolma 1.7.** We compare our data mix described in §2 with Dolma 1.7 used to train prior OLMo models. Lower training loss does not mean that one dataset is better, but rather suggests which dataset is easier for the model to learn. More results, logs, and configurations: https://wandb.ai/ai2-llm/olmoe/reports/Plot-Dolma-1-7-vs-Dolma-OLMoE--Vmlldzo4OTIxNTg5

图 12｜OLMoE-Mix 与 Dolma 1.7 的受控对比. OLMoE-Mix 在三项下游指标上都更好, MMLU 差距最大; 训练 loss 更低只说明该数据更容易学, 不代表数据更好.

Li et al. [90] release the DCLM-Baseline dataset and establish that it leads to better language models than Dolma 1.7 and other datasets as measured on common benchmarks like MMLU [70]. This motivates us to mix their DCLM dataset with some components from Dolma 1.7 that we deem to be high-quality; see §2. In Figure 12, we compare our mix, OLMoE-Mix, with Dolma 1.7 in a controlled setup. We find that OLMoE-Mix leads to clear gains on all three downstream metrics, especially MMLU. DCLM-Baseline has been created through a series of dataset ablations targeting MMLU and other downstream metrics, which explains these results. We also compare adding Reddit and FLAN to our mix as detailed in §F, but do not find consistent performance gains. We do not have a strong intuition for why adding these datasets does not help and a more automatic approach to dataset mixing may be desirable for future iterations [4, 101]. We pretrain using our mix of DCLM-Baseline and Dolma 1.7 dubbed OLMoE-Mix.

Li et al. [90] 发布了 DCLM-Baseline 数据集, 并证明按 MMLU [70] 等常用基准衡量, 它训出的语言模型优于 Dolma 1.7 等数据集. 这促使我们把 DCLM 数据与 Dolma 1.7 中我们认为高质量的部分混合, 见 §2. 在 Figure 12 中, 我们在受控设置下比较 OLMoE-Mix 与 Dolma 1.7. 我们发现 OLMoE-Mix 在三项下游指标上都有明显提升, 尤其是 MMLU. DCLM-Baseline 是通过一系列针对 MMLU 等下游指标的数据集消融构建的, 这解释了上述结果. 我们还试过在混合数据中加入 Reddit 与 FLAN (见 §F), 但没有得到一致的提升. 我们对加入这些数据为何无效没有明确的解释, 后续版本或许需要更自动化的数据配比方法 [4, 101]. **我们用 DCLM-Baseline 与 Dolma 1.7 混合而成的 OLMoE-Mix 做预训练.**

#### 4.2.2 Initialization · 初始化

Few prior works on Mixture-of-Experts share their initialization strategy. Even the most open MoEs prior to this work, JetMoE [158] and OpenMoE [199], do not mention their initialization scheme. For DeepSeekMoE [39] and DeepSeekV2 [43], the authors share that they use a normal initialization

<!-- page 15 of 63 -->

![](images/init.png)

Figure 13: **Initialization.** We compare a normal initialization with a standard deviation (std) of 0.02 with a truncated normal initialization with a maximum (minimum) cut-off of 0.06 (–0.06) corresponding to three stds (3$\times$0.02). More results, logs, and configurations: https://wandb.ai/ai2-llm/olmoe/reports/Plot-Init--Vmlldzo4NDIzMzM5

图 13｜初始化: 标准差 0.02 的普通正态初始化, 对比在 $\pm 0.06$ (3 倍标准差) 截断的截断正态初始化. 约 450B token 后普通正态一组开始发散, 截断正态一组保持稳定.

![](images/ln.png)

Figure 14: **Non-parametric layer normalization vs. RMSNorm.** More results, logs, and configurations: https://wandb.ai/ai2-llm/olmoe/reports/Plot-LN--Vmlldzo4NDQyMTAz

图 14｜OLMo 的非参数 layer normalization 与参数化 RMSNorm 的对比, RMSNorm 一组在 loss 与下游指标上更好.

with a standard deviation (std) of 0.006. For dense language models, a normal initialization with an std of 0.02 has been commonly used as popularized by Shoeybi et al. [159].

很少有 MoE 工作公开其初始化策略. 即便是此前最开放的 MoE, JetMoE [158] 与 OpenMoE [199], 也没有提到初始化方案. DeepSeekMoE [39] 与 DeepSeekV2 [43] 的作者说明他们用标准差 (std) 为 0.006 的正态初始化. 对 dense 语言模型, std 为 0.02 的正态初始化很常用, 由 Shoeybi et al. [159] 推广开来.

In Figure 13, we find a truncated normal initialization leads to more stable training and better performance than a regular normal initialization. The difference between the two initializations only becomes clear at around 450 billion tokens, where the model with the normal initialization starts to diverge. This is despite both models using the same configuration except for the difference in weight initialization. Having to train for hundreds of billions of tokens until an experiment provides a clear signal is one of the key challenges of pretraining ablations. We use the truncated normal initialization for OLMoE-1B-7B.

在 Figure 13 中, 我们发现截断正态初始化比普通正态初始化训练更稳定, 表现更好. 两种初始化的差别要到约 450B token 才显现出来, 此时普通正态初始化的模型开始发散. 而两个模型除权重初始化外配置完全相同. 要训练几千亿 token 才能让一个实验给出明确信号, 这是预训练消融的主要难点之一. **OLMoE-1B-7B 使用截断正态初始化.**

#### 4.2.3 RMSNorm · RMSNorm

OLMo [65] uses non-parametric layer normalization [12], mainly as it is significantly faster than the commonly used RMSNorm [113, 208]. This is an unusual choice as most LMs use RMSNorm, such as the Llama [50, 182, 183], Gemma [176, 177], and Qwen [13, 201] model families.

OLMo [65] 使用非参数的 layer normalization [12], 主要因为它比常用的 RMSNorm [113, 208] 快得多. 这个选择并不常见, 多数 LM 用 RMSNorm, 比如 Llama [50, 182, 183], Gemma [176, 177] 与 Qwen [13, 201] 系列.

![](images/lngradnorm.png)

Figure 16: **Total norm of the gradients when training with RMS or non-parametric normalization.** We increase the logging interval of the RMS run at 75B tokens, hence its change in thickness.

图 16｜用 RMSNorm 与用非参数 normalization 训练时梯度总范数的对比. 非参数一组梯度尖峰多得多; RMSNorm 一组在 75B token 处调大了日志间隔, 曲线粗细因此变化.

In Figure 14, we observe that replacing the non-parametric layer normalization in OLMo with a parametric RMSNorm leads to better performance. This is likely because the non-parametric layer normalization leads to a large number of spikes in the gradients as seen in Figure 16. We clip gradients at 1.0, which prevents these spikes from leading to very large and potentially disruptive parameter updates. However, the clipped gradients may still harm the performance of the model as they are no longer the true gradients. Thus, despite RMSNorm lowering our training throughput by 15%, we train our final model with RMSNorm.

<!-- page 16 of 63 -->

![](images/lndecay.png)

Figure 15: **Decaying the RMSNorm parameters.** More results, logs, and configurations: https://wandb.ai/ai2-llm/olmoe/reports/Plot-Decay-LN--Vmlldzo4NDQ1NDYy

图 15｜RMSNorm 参数做与不做 weight decay 的对比, 两者差别很小, 做 decay 的一组略好.

![](images/embdecay.png)

Figure 17: **Decaying the embedding parameters.** More results, logs, and configurations: https://api.wandb.ai/links/ai2-llm/3h22onp5

图 17｜embedding 参数做与不做 weight decay 的对比, 差别很小, 做 decay 略好.

We include the RMSNorm parameters in weight decay as we find that it performs slightly better (Figure 15) even though it is common practice to exclude them.<sup>5</sup>

在 Figure 14 中, 我们观察到把 OLMo 中的非参数 layer normalization 换成参数化的 RMSNorm 后表现更好. 这可能是因为非参数 layer normalization 导致梯度出现大量尖峰, 见 Figure 16. 我们把梯度裁剪到 1.0, 防止这些尖峰造成过大, 可能有破坏性的参数更新. 但裁剪后的梯度不再是真实梯度, 仍可能损害模型表现. 因此, 尽管 RMSNorm 让训练吞吐下降 15%, **最终模型仍用 RMSNorm 训练.** 我们把 RMSNorm 参数纳入 weight decay, 因为这样略好 (Figure 15), 尽管常见做法是把它们排除在外.<sup>5</sup>

<sup>5</sup> https://github.com/karpathy/minGPT/pull/24#issuecomment-679316025

#### 4.2.4 Decaying Embedding Parameters · 对 Embedding 参数做衰减

Similar to the RMSNorm parameters (§4.2.3), embedding parameters are commonly excluded from weight decay.<sup>6</sup> In Figure 17 we find that whether or not they are decayed has only a minor impact on performance, with decaying being slightly better. Thus for simplicity, we weight decay all parameters in OLMoE-1B-7B including embedding and RMSNorm.

与 RMSNorm 参数 (§4.2.3) 类似, embedding 参数通常也不做 weight decay.<sup>6</sup> 在 Figure 17 中我们发现, 是否对它们做衰减只对表现有很小影响, 做衰减略好. 因此为简单起见, **OLMoE-1B-7B 对所有参数做 weight decay, 包括 embedding 与 RMSNorm.**

<sup>6</sup> https://github.com/karpathy/minGPT/pull/24#issuecomment-679316025

#### 4.2.5 QK-Norm · QK-Norm

Some works have reported stability improvements from adding layer normalization after the query and key projections (“QK-Norm”) [44, 113, 173]. QK-Norm can prevent the subsequent attention operation from leading to very large logits that may lead to numeric overflows and destabilize the network, especially when training in low precision. Like layer normalization at other places in the model, the QK-Norm could be non-parametric or use the parametric RMSNorm (§4.2.3).

有些工作报告, 在 query 与 key 投影之后加 layer normalization (「QK-Norm」) 能提升稳定性 [44, 113, 173]. QK-Norm 能防止随后的注意力运算产生过大的 logit, 这类 logit 可能造成数值溢出, 使网络失稳, 低精度训练时尤其如此. 与模型中其他位置的 layer normalization 一样, QK-Norm 可以是非参数的, 也可以用参数化的 RMSNorm (§4.2.3).

In Figure 18, we compare using QK-Norm with no normalization after the query and key projections. We find that QK-Norm leads to some stability and performance improvements. We perform this experiment with non-parametric layer normalization as used in OLMo [65], while we used parametric RMS layer normalization [208] for OLMoE-1B-7B (§4.2.3). To ensure the benefit of QK-Norm is not an artifact of comparing with non-parametric layer normalization, we run another experiment with RMS layer normalization and still find QK-Norm to lead to slightly better training loss and to prevent a large grad norm spike.<sup>7</sup> Thus, we use QK-Norm for OLMoE-1B-7B despite it reducing throughput by almost 10%.

在 Figure 18 中, 我们比较使用 QK-Norm 与在 query, key 投影后不做 normalization. 我们发现 QK-Norm 带来一定的稳定性与表现提升. 这个实验用的是 OLMo [65] 的非参数 layer normalization, 而 OLMoE-1B-7B 用的是参数化的 RMS layer normalization [208] (§4.2.3). 为确认 QK-Norm 的好处不是与非参数 layer normalization 比较造成的假象, 我们又用 RMS layer normalization 做了一次实验, 仍发现 QK-Norm 的训练 loss 略好, 并避免了一次较大的梯度范数尖峰.<sup>7</sup> 因此, 尽管 QK-Norm 让吞吐下降近 10%, **OLMoE-1B-7B 仍使用 QK-Norm**.

<sup>7</sup> https://wandb.ai/ai2-llm/olmoe/reports/Plot-QKNorm-revisited--Vmlldzo4NTc2NTIz

<!-- page 17 of 63 -->

![](images/qknorm.png)

Figure 18: **Query-Key layer normalization (QK-Norm).** Both models use non-parametric layer normalization. QK-Norm corresponds to additional layer normalization of the query and key projections. More results, logs, and configurations: https://wandb.ai/ai2-llm/olmoe/reports/Plot-QKNorm-vs-none--Vmlldzo4NDIzMzE2

图 18｜Query-Key layer normalization (QK-Norm): 两个模型都用非参数 layer normalization, QK-Norm 指对 query 与 key 投影再做一次 normalization. 加 QK-Norm 的一组更稳定, loss 更低.

#### 4.2.6 AdamW Epsilon · AdamW Epsilon

![](images/adamweps.png)

Figure 19: **AdamW epsilon.** More results, logs, and configurations: https://wandb.ai/ai2-llm/olmoe/reports/Plot-AdamW-eps--Vmlldzo4NDc5MDg0

图 19｜AdamW epsilon 取 1E-05 与 1E-08 的对比, 1E-08 一组 loss 明显更低, 训练仍稳定.

Groeneveld et al. [65] use an epsilon (“eps”) value of 1E-05 in the AdamW optimizer for training OLMo. A larger eps value leads to smaller steps of the optimizer but can be more stable [83].

Groeneveld et al. [65] 训练 OLMo 时在 AdamW 优化器中用 1E-05 的 epsilon (「eps」). eps 越大, 优化器步长越小, 但可能更稳定 [83].

In Figure 19, we find that decreasing eps to the recommended default of 1E-08 [83] significantly improves performance while the run remains stable. Thus, we set eps to 1E-08 for our final run.

在 Figure 19 中, 我们发现把 eps 降到推荐的默认值 1E-08 [83] 显著改善表现, 训练仍保持稳定. 因此最终运行中 **eps 设为 1E-08**.

### 4.3 Adaptation Settings · 适配设置

| Data ($\downarrow$) | OLMoE-1B-7B After pretraining | OLMoE-1B-7B After SFT |
|---|---|---|
| SFT data | 12.22 | 12.16 |
| Github | 13.85 | 14.85 |
| Wikipedia | 14.48 | 14.24 |
| C4 | 9.09 | 9.13 |

Table 6: **Load balancing loss (Equation 3) over a subset of the respective corpora prior to scaling with the load balancing loss weight $\alpha$**. While we use load balancing loss during pretraining, we do not use it during SFT.

表 6｜在若干语料子集上测得的负载均衡损失 (式 (3), 未乘权重 $\alpha$), 预训练后对比 SFT 后; SFT 数据上的值从 12.22 降到 12.16.

We experiment with small design choices for adaptation using our evaluation setup described in §C. **(1) Auxiliary losses:** Zoph et al. [221] find that using the auxiliary load balancing loss (§4.1.6) during regular finetuning leads to small performance gains. For instruction tuning, however, Shen et al. [156] do not find conclusive evidence in favor of using the load balancing or router z-loss with only small differences in performance, both in support of and against the auxiliary losses. In Table 7 we display experiments with the load balancing loss during adaptation and find that not using it leads to better performance (54.0 vs. 52.8 after instruction tuning (SFT) and 57.7 vs. 57.1 after preference tuning (DPO)). One potential problem of deactivating the load balancing loss is that it may harm balance among experts and turn some into dead weights as observed during pretraining in §4.1.6. However, when measuring the load balancing loss in Table 6 on our SFT data (§2), we find that the loss actually decreases slightly during SFT (12.16 vs. 12.22).

<!-- page 18 of 63 -->

This is likely because which experts certain tokens get routed to is determined early during pretraining, as we find later in the analysis section (§5.1). We also visualize the activation patterns of experts of the model after pretraining, and the models after SFT and DPO trained without load balancing in §G (Figure 33) finding that the distribution remains around the same. Thus, as our models adapted without load balancing perform better and we find it not to impact routing substantially, we do not use load balancing during adaptation. **(2) Annealing checkpoint:** We also experiment with using the checkpoint pre-annealing (§2) for adaptation and find the checkpoint post-annealing leads to better performance (53.8 vs. 54.0 after SFT and 56.3 vs 57.7 after DPO), thus we use the post-annealing checkpoint. **(3) Preference algorithm:** Since the release of DPO (Direct Preference Optimization) [138], a variety of preference algorithms have been proposed [54, 73, 114]. We experiment with KTO [54] and find that it matches DPO in Table 7 for our setup (§B). While we release both models, we use DPO for our final OLMoE-1B-7B-Instruct model, as it scores higher on AlpacaEval, which has a smaller chance of data contamination than our other benchmarks [198].

我们用 §C 的评测设置对适配阶段的几项小设计做了实验. **(1) 辅助损失:** Zoph et al. [221] 发现常规微调中使用辅助负载均衡损失 (§4.1.6) 带来小幅提升. 但对指令微调, Shen et al. [156] 没有找到支持使用负载均衡损失或 router z-loss 的确凿证据, 差别都很小, 有支持也有反对. 在 Table 7 中我们给出适配阶段使用负载均衡损失的实验, 发现不用它表现更好 (指令微调 (SFT) 后 54.0 对 52.8, 偏好微调 (DPO) 后 57.7 对 57.1). 关闭负载均衡损失的一个潜在问题是, 它可能破坏专家间的均衡, 让部分专家变成死权重, §4.1.6 的预训练中就观察到过这种情况. 但在 Table 6 中用我们的 SFT 数据 (§2) 测负载均衡损失, 发现 SFT 期间它反而略有下降 (12.16 对 12.22). 这可能是因为某些 token 路由到哪些专家, 在预训练早期就已确定, 这一点在后面的分析 (§5.1) 中可以看到. 我们还在 §G (Figure 33) 中可视化了预训练后模型, 以及不加负载均衡训练的 SFT, DPO 模型的专家激活模式, 发现分布基本不变. 因此, 既然不加负载均衡适配出的模型表现更好, 又发现它对路由影响不大, **我们在适配阶段不使用负载均衡**. **(2) 退火检查点:** 我们还试过用退火前 (§2) 的检查点做适配, 发现退火后的检查点表现更好 (SFT 后 53.8 对 54.0, DPO 后 56.3 对 57.7), 因此 **我们用退火后的检查点.** **(3) 偏好算法:** DPO (Direct Preference Optimization) [138] 发布后, 出现了多种偏好算法 [54, 73, 114]. 我们试了 KTO [54], 发现在我们的设置 (§B) 下它在 Table 7 中与 DPO 持平. 两个模型我们都发布, 但最终的 OLMoE-1B-7B-Instruct **用 DPO**, 因为它在 AlpacaEval 上得分更高, 而 AlpacaEval 数据污染的可能性比我们的其他基准小 [198].

> **回看:** §4.3 说适配阶段不用负载均衡损失, 附录 B 却写「SFT 和 DPO 都加了负载均衡损失, 依据是 §4.3 的实验」, 哪个是最终做法?
> 答: 论文前后矛盾. 支持「不用」的有三处: Table 7 中不加 LBL 的 +SFT 54.0, +DPO 57.7, 都高于加 LBL 的 52.8 和 57.1; Figure 33 题注写「SFT 和 DPO 不加负载均衡损失」; §4.3 的结论句. 附录 B 的说法与这三处相反, 却引用 §4.3 作依据. 按 Table 7 的分数, 发布的 Instruct 模型 (57.7) 对应的是不加 LBL 的那一行.

| Task ($\rightarrow$) | MMLU | GSM8k | BBH | Human-Eval | Alpaca-Eval 1.0 | XSTest | IFEval | Avg |
|---|---|---|---|---|---|---|---|---|
| Setup ($\rightarrow$) | 0-shot | 8-shot CoT | 0-shot | 0-shot | 0-shot | 0-shot | 0-shot | 0-shot |
| Metric ($\rightarrow$) | EM | EM | EM | Pass@10 | %win | F1 | Loose Acc |  |
| OLMoE-1B-7B w/o annealing | 49.0 | 2.0 | 31.5 | 18.9 | - | 62.1 | 18.5 | - |
| +SFT | 50.2 | 43.0 | 35.6 | 55.5 | 68.9 | 83.8 | 39.7 | 53.8 |
| +DPO | 50.9 | 36.0 | 35.8 | 58.8 | 81.7 | 83.2 | 47.9 | 56.3 |
| OLMoE-1B-7B | 49.8 | 3.0 | 33.6 | 22.4 | - | 59.7 | 16.6 | - |
| +SFT | 51.4 | 40.5 | 38.0 | 51.6 | 69.2 | 84.1 | 43.3 | 54.0 |
| +DPO | **51.9** | **45.5** | 37.0 | 54.8 | **84.0** | 82.6 | **48.1** | **57.7** |
| +KTO | 51.2 | **45.5** | 34.1 | 57.1 | 81.6 | **86.6** | 47.5 | **57.7** |
| +SFT (load balancing) | 50.9 | 36.5 | 35.7 | 52.4 | 66.9 | 84.8 | 42.3 | 52.8 |
| +DPO (load balancing) | 51.1 | 42.5 | **39.3** | 55.6 | 82.9 | 82.1 | 46.0 | 57.1 |

Table 7: Adaptation experiments of OLMoE-1B-7B. We compare using the pretrained checkpoint prior to annealing for adaptation, using the checkpoint after the additional 100B tokens of annealing, and using the checkpoint after the additional 100B tokens of annealing and with load balancing loss (§4.1.6) during adaptation. We apply DPO/KTO to the respective SFT model.

表 7｜OLMoE-1B-7B 的适配实验: 退火前检查点, 退火后检查点, 以及退火后检查点在适配中加负载均衡损失, 三组对比; DPO / KTO 都接在对应的 SFT 模型之后.

## 5 MoE Analysis · MoE 分析

By advancing open and cost-efficient models (§1), OLMoE-1B-7B enables new research into LMs and MoEs. Making use of our released intermediate checkpoints, data, and code, we define and analyze four properties specific to MoEs: **Router saturation** (§5.1), **Expert co-activation** (§5.2), **Domain specialization** (§5.3), and **Vocabulary specialization** (§5.4).

在推进开放且低成本模型 (§1) 的同时, OLMoE-1B-7B 也为 LM 与 MoE 的新研究提供了条件. 借助我们发布的中间检查点, 数据与代码, 我们定义并分析 MoE 特有的四种性质: **路由饱和** (§5.1), **专家共激活** (§5.2), **领域特化** (§5.3) 与 **词表特化** (§5.4).

### 5.1 Router Saturation · 路由饱和

We define router saturation as the proportion of expert activations at some intermediary checkpoint at time $t$ that matches the expert IDs activated at some final checkpoint over the same dataset:

我们把路由饱和定义为: 在同一数据集上, 某个中间检查点 $t$ 激活的专家中, 与最终检查点激活的专家 ID 一致的比例:

$$
\text{Router Saturation}(t) = \frac{1}{N} \sum_{i=1}^{N} \frac{|\mathcal{E}_{i}^{(t)} \cap \mathcal{E}_{i}^{(T)}|}{k}, \tag{5}
$$

where:

其中:

- $N$: The total number of tokens in the dataset.

- $N$: 数据集中 token 的总数.

<!-- page 19 of 63 -->

![](images/top18_changes_over_checkpoints.png)

Figure 20: **Router saturation during pretraining measured on a random 0.5% of the C4 validation data.** We compute saturation by comparing the routing to the top-$k$ experts at four intermediate checkpoints (1, 10, 20, and 40% of pretraining) to the final pretraining checkpoint (Equation 5).

图 20｜预训练期间的路由饱和, 在 C4 验证集随机 0.5% 上测量: 把 1%, 10%, 20%, 40% 四个中间检查点的 top-$k$ 路由与最终检查点比较 (式 (5)). 左为 top-1, 右为 top-8, 每条线一层; layer 0 饱和最慢.

- $k$: The number of top-$k$ experts activated per input token. While we train with $k=8$ (§2), we also analyze $k=1$ by only looking at the expert with the highest routing probability.

- $k$: 每个输入 token 激活的 top-$k$ 专家数. 训练时 $k=8$ (§2), 我们也分析 $k=1$, 即只看路由概率最高的那个专家.

- $\mathcal{E}_{i}^{(t)}$: The set of $k$ experts activated for the $i$th token at the $t$th checkpoint.

- $\mathcal{E}_{i}^{(t)}$: 第 $t$ 个检查点上第 $i$ 个 token 激活的 $k$ 个专家的集合.

- $\mathcal{E}_{i}^{(T)}$: The set of $k$ experts activated for the $i$th token at the final checkpoint $T$.

- $\mathcal{E}_{i}^{(T)}$: 最终检查点 $T$ 上第 $i$ 个 token 激活的 $k$ 个专家的集合.

- $|\mathcal{E}_{i}^{(t)} \cap \mathcal{E}_{i}^{(T)}|$: The number of common experts activated for the $i$th token between the $t$th and final checkpoints.

- $|\mathcal{E}_{i}^{(t)} \cap \mathcal{E}_{i}^{(T)}|$: 第 $i$ 个 token 在第 $t$ 个检查点与最终检查点之间共同激活的专家数.

Router saturation thus corresponds to whether the router weights are still learning which expert will process certain data. A value of 100% indicates that the router at the intermediate checkpoint will route to the same experts as the final checkpoint router. However, even at 100% saturation the router weight can still change and adapt the exact router probability for each expert. These probabilities are used to scale the output of the respective expert in the model. For OLMoE-1B-7B with its 64 experts, random routing equals a saturation of $1/64=1.6%$ for $k=1$ and $8/64=12.5%$ for $k=8$.

因此, 路由饱和反映路由器权重是否还在学习某类数据该交给哪个专家. 100% 表示中间检查点的路由器与最终检查点的路由器选中同样的专家. 不过即使饱和度为 100%, 路由器权重仍可能变化, 调整每个专家的具体路由概率. 这些概率用来缩放对应专家在模型中的输出. 对有 64 个专家的 OLMoE-1B-7B, 随机路由对应的饱和度在 $k=1$ 时为 $1/64=1.6\%$, 在 $k=8$ 时为 $8/64=12.5\%$.

In Figure 20 we find that after 1% of pretraining (5000 steps or 20B tokens), up to $\sim$60% of routing to the top-8 activated experts has already saturated (right). Thus the model already uses the same 8 experts for given input data as it will at the end of pretraining. This early saturation aligns with prior work [199]. At 40% of pretraining, saturation reaches up to $\sim$80%. However, which top-1 expert has the highest routing probability saturates slower (left). We find that routing in later layers saturates earlier during pretraining. Layer 0 is an outlier saturating significantly more slowly than other layers. Dai et al. [39] do not use an MoE in the first layer as they find that load balancing converges more slowly for the first layer. This is likely linked to our findings on saturation. Because routing in the first layer saturates slower, the experts that certain input data get routed to frequently change. These changes may lead to one expert suddenly getting significantly more data than others thereby impairing load balancing. We are excited about future work further investigating what happens in the first layer by building on our open release.

在 Figure 20 中我们发现, 预训练进行到 1% (5000 step, 即 20B token) 时, 路由到 top-8 激活专家的部分已有最多约 60% 饱和 (右). 也就是说, 对给定输入, 模型此时用的 8 个专家已经和预训练结束时一样. 早期饱和与已有工作一致 [199]. 到预训练 40% 时, 饱和度最高约 80%. 但「哪个 top-1 专家路由概率最高」饱和得更慢 (左). 我们发现越靠后的层, 路由在预训练中饱和得越早. Layer 0 是个例外, 饱和明显慢于其他层. Dai et al. [39] 在第一层不用 MoE, 因为他们发现第一层的负载均衡收敛更慢. 这很可能与我们关于饱和的发现有关. 由于第一层的路由饱和较慢, 某类输入被路由到的专家会频繁变动. 这些变动可能让某个专家突然分到比其他专家多得多的数据, 从而破坏负载均衡. 我们期待未来有工作基于我们的开放发布, 进一步研究第一层发生了什么.

> **停一下:** 「1% of pretraining (5000 steps or 20B tokens)」这三个数彼此一致吗?
> 答: step 与 token 一致, 与 1% 不一致. 每 step 为 $1024\times4096=4{,}194{,}304$ 个 token, 5000 step 为 $2.10\times10^{10}$, 即约 21B token. 但预训练共约 1.2M step (Table 13 的检查点为 step 1,200,000, 总量 5.133T token 约合 1.22M step), 5000 step 只占约 0.42%. 真到 1% 应是约 12,000 step, 约 51B token. 所以 Figure 20 横轴最左那个点比标称的 1% 还早. 另外从图上读数, top-8 在该点的最大饱和度约 65%, 40% 处约 88%, 都比正文的「约 60%」「约 80%」略高.

### 5.2 Expert Co-activation · 专家共激活

We define expert co-activation as the proportion of times two specific experts, $E_i$ and $E_j$, are simultaneously activated out of the total number of activations of one of those experts:

我们把专家共激活定义为: 两个特定专家 $E_i$ 与 $E_j$ 同时被激活的次数, 占其中一个专家总激活次数的比例:

$$
\text{Expert co-activation}(E_i, E_j) = \frac{N_{E_i, E_j}}{N_{E_i}}, \tag{6}
$$

where:

其中:

- $E_i$: The first expert.

- $E_i$: 第一个专家.

- $E_j$: The second expert.

- $E_j$: 第二个专家.

- $N_{E_i, E_j}$: The number of times experts $E_i$ and $E_j$ are activated together.

- $N_{E_i, E_j}$: 专家 $E_i$ 与 $E_j$ 同时被激活的次数.

<!-- page 20 of 63 -->

![](images/layer_0_heatmap.png)

![](images/layer_7_heatmap.png)

![](images/layer_15_heatmap.png)

Figure 21: **Co-activation among experts of OLMoE-1B-7B on a random 0.5% of the C4 validation data.** We display the 32 experts with the highest maximum co-activation score via their expert IDs on the x- and y-axis.

图 21｜OLMoE-1B-7B 专家间的共激活, 在 C4 验证集随机 0.5% 上测量. 三张热力图分别对应 layer 0, 7, 15, 坐标轴为专家 ID, 格子颜色为式 (6) 的共激活比例; 每张图实际列出 16 个专家.

- $N_{E_i}$: The total number of times expert $E_i$ is activated.

- $N_{E_i}$: 专家 $E_i$ 被激活的总次数.

A co-activation of 100% indicates that if $E_i$ is activated, $E_j$ is also always activated. A value of 0% indicates that the experts never co-occur. If multiple expert pairs have high co-activation, it may suggest that these experts could be merged, benefiting less from keeping them separate. In a distributed setup, we could place highly co-activated experts on the same device to reduce communication costs during model inference.

共激活为 100% 表示只要 $E_i$ 被激活, $E_j$ 也一定被激活. 0% 表示两个专家从不同时出现. 如果多对专家共激活都很高, 可能说明这些专家可以合并, 分开保留的收益不大. 在分布式部署中, 可以把高度共激活的专家放到同一设备上, 降低推理时的通信开销.

In Figure 21, we find that there is no strong co-activation among experts in one layer, with only few exceptions. This may indicate that there is little redundancy across different experts. Overall, layers 7 and 15 show similar co-activation patterns with several groups of 3 or 2 experts that tend to get activated together. We investigate tokens that activate these experts in §5.4. Further, in §G (Figure 35), we investigate whether experts across layers, rather than within one layer, tend to process tokens together.

在 Figure 21 中我们发现, 同一层内的专家之间没有强共激活, 只有少数例外. 这可能说明不同专家之间冗余很少. 总体上, layer 7 与 layer 15 的共激活模式相似, 有几组 3 个或 2 个专家倾向于一起被激活. 我们在 §5.4 中考察激活这些专家的 token. 此外在 §G (Figure 35) 中, 我们考察跨层而非同层的专家是否倾向于一起处理 token.

> **译注:** Figure 21 每张热力图的坐标轴列出 16 个专家 ID, 与题注所说的 32 个不一致. 式 (6) 以 $N_{E_i}$ 为分母, 因而 $(E_i,E_j)$ 与 $(E_j,E_i)$ 一般不对称; layer 7 的 (5, 46) 与 (46, 5) 两格也呈现不同深浅.

### 5.3 Domain Specialization · 领域特化

We define domain specialization as the proportion of tokens from a particular domain $D$ that get routed to a particular expert $E_i$:

我们把领域特化定义为: 来自特定领域 $D$ 的 token 中, 被路由到特定专家 $E_i$ 的比例:

$$
\text{Domain specialization}(E_i, D) = \frac{N_{E_i, D}^{(k)}}{N_D}, \tag{7}
$$

where:

其中:

- $E_i$: The $i$th expert in the model.

- $E_i$: 模型中的第 $i$ 个专家.

- $D$: The domain from which the data originates.

- $D$: 数据来源的领域.

- $k$: The number of experts considered (e.g., $k = 8$ means considering the top 8 experts with the highest routing probabilities).

- $k$: 考虑的专家数 (如 $k = 8$ 表示考虑路由概率最高的 8 个专家).

- $N_{E_i,D}^{(k)}$: The number of tokens from domain $D$ for which $E_i$ is among the top-$k$ selected experts.

- $N_{E_i,D}^{(k)}$: 领域 $D$ 的 token 中, $E_i$ 位于所选 top-$k$ 专家之内的 token 数.

- $N_D$: The total number of tokens from domain $D$ processed by the MoE.

- $N_D$: MoE 处理的来自领域 $D$ 的 token 总数.

Domain specialization thus refers to the specialization of expert $E_i$ to domain $D$. A value of 100% indicates that all data from that domain is routed to $E_i$, whereas 0% indicates the expert is never used for that domain and can be removed from the model without affecting performance in that domain.

因此, 领域特化指专家 $E_i$ 对领域 $D$ 的特化程度. 100% 表示该领域的数据全部路由到 $E_i$, 0% 表示该领域从不使用这个专家, 可以把它从模型中删掉而不影响该领域的表现.

In Figure 22 (top) we find many examples of experts that are activated significantly above or below random chance for *specific domains*. E.g., for arXiv, which has a very specific distribution with lots of scientific text, the first expert in layer 0 is nearly 100% specialized. This suggests that there is little redundancy in the knowledge of the experts in OLMoE-1B-7B, as they specialize in different kinds of data. GitHub and arXiv are often activated together in layer 7, which we explore further

<!-- page 21 of 63 -->

![](images/routing_olmoe_v2.png)

![](images/routing_mixtral_v2.png)

Figure 22: **Domain specialization of OLMoE-1B-7B (top) vs. Mixtral-8x7B (bottom).** We visualize how often tokens from different domains get routed to the 64 (OLMoE) or 8 (Mixtral) experts at the end of pretraining. We consider tokens routed to any of the $k=8$ (OLMoE) or $k=2$ (Mixtral) active experts (Equation 7). Horizontal gray lines correspond to random chance or uniform routing (8/64=12.5% per expert for OLMoE-1B-7B with 8 active out of 64 total experts per layer and 2/8=25% for Mixtral with 2 active out of 8 total experts per layer). See Figure 34 for $k=1$ results.

图 22｜OLMoE-1B-7B (上) 与 Mixtral-8x7B (下) 的领域特化: 预训练结束时, 来自 GitHub, arXiv, Wikipedia, Books, C4 的 token 被路由到各专家的比例 (式 (7), OLMoE 取 $k=8$, Mixtral 取 $k=2$). 灰色水平线是均匀路由基线 (OLMoE 12.5%, Mixtral 25%); OLMoE 在 arXiv, GitHub 上偏离基线明显, Mixtral 各领域都贴近基线.

<!-- page 22 of 63 -->

in §5.4. For *generic domains*, such as C4 [139], which is a web crawl containing various kinds of data, expert activations in OLMoE-1B-7B are much more balanced. This highlights that the load balancing (§4.1.6) works as intended and the model makes proper use of all experts for generic data. Mixtral-8x7B [79] in Figure 22 (bottom), however, exhibits little domain specialization across both *unique* and *generic* *domains*. Experts are activated close to the uniform routing baseline for all layers and domains. Thus, there may be more redundancy across experts in Mixtral, as they likely contain similar knowledge. We hypothesize that this is due to Mixtral being upcycled from Mistral [25]. The initialization from a dense model may limit the amount of possible specialization in the experts as they all start from the same local optimum. This is likely why training from scratch eventually outperforms upcycling in our pretraining experiments (§4.1.5).

在 Figure 22 (上) 中, 我们发现许多专家在*特定领域*上的激活明显高于或低于随机水平. 例如 arXiv 的分布很特殊, 包含大量科学文本, layer 0 的第一个专家对它的特化接近 100%. 这说明 OLMoE-1B-7B 各专家的知识冗余很少, 因为它们特化于不同类型的数据. 在 layer 7 中, GitHub 与 arXiv 经常激活相同的专家, §5.4 会进一步讨论. 对 C4 [139] 这类*通用领域*, 它是包含各类数据的网页爬取, OLMoE-1B-7B 的专家激活要均衡得多. 这说明负载均衡 (§4.1.6) 按预期发挥了作用, 模型在通用数据上合理地用到了所有专家. 而 Figure 22 (下) 中的 Mixtral-8x7B [79], 无论在*特有*还是*通用**领域*上都几乎没有领域特化. 在所有层和领域上, 专家激活都接近均匀路由基线. 因此 Mixtral 的专家之间可能冗余更多, 它们大概包含相似的知识. 我们推测这是因为 Mixtral 是从 Mistral 上循环得到的 [25]. 从 dense 模型初始化, 可能限制了专家能达到的特化程度, 因为它们都从同一个局部最优出发. 这很可能也是我们预训练实验中从零训练最终超过上循环 (§4.1.5) 的原因.

### 5.4 Vocabulary Specialization · 词表特化

![](images/vocabulary_specialization_top1_olmoe.png)

Figure 23: **Vocabulary specialization of OLMoE-1B-7B across layers and experts.** To compute vocabulary specialization per layer (left) we average the specialization of each expert in that layer. Dashed lines (right) correspond to the average of layer 7 as depicted left. We display the first 32 experts out of 64. This plot is for $k=1$ (Equation 8) and we provide $k=8$ and a comparison with Mixtral-8x7B in §G.

图 23｜OLMoE-1B-7B 各层与各专家的词表特化 ($k=1$, 式 (8)). 左为每层所有专家的平均, 分输入 token ID, 预测输出 token ID, 真实输出 token ID 三条线; 右为 layer 7 的若干专家, 虚线是 layer 7 的平均. 右图实际列出 12 个专家 (0 到 8, 27, 37, 58).

We define vocabulary specialization as the proportion of tokens with a token ID $x$ (also called vocabulary element) that are routed to one particular expert $E_i$ out of all experts in that layer:

我们把词表特化定义为: 某个 token ID $x$ (也叫词表元素) 的所有 token 中, 在该层被路由到特定专家 $E_i$ 的比例:

$$
\text{Vocabulary specialization}(E_i, x) = \frac{N_{x, E_i}^{(k)}}{N_x}, \tag{8}
$$

where:

其中:

- $E_i$: The $i$th expert in the model.

- $E_i$: 模型中的第 $i$ 个专家.

- $x$: The token ID being analyzed.

- $x$: 被分析的 token ID.

- $k$: The number of experts considered (e.g., $k=8$ means considering the top 8 experts with the highest routing probabilities).

- $k$: 考虑的专家数 (如 $k=8$ 表示考虑路由概率最高的 8 个专家).

- $N_{x, E_i}$: The number of times input data is routed to $E_i$ for $x$.

- $N_{x, E_i}$: 对 $x$, 输入被路由到 $E_i$ 的次数.

- $N_x$: The total number of times input data is routed across all experts for $x$.

- $N_x$: 对 $x$, 输入被路由到所有专家的总次数.

Vocabulary specialization thus refers to how specialized a particular expert is on some vocabulary item. We distinguish input and output variants of this specialization, where $x$ is either the input token ID or the next output token ID (either the ground-truth next token ID or the token ID predicted by the model). A value of 100% indicates that for all occurrences of that vocabulary element, input data is routed to $E_i$, whereas 0% indicates an expert that is fully irrelevant for that vocabulary element and can be effectively removed from the model without affecting performance whenever the token ID appears.

因此, 词表特化反映某个专家对某个词表元素的专门程度. 我们区分输入与输出两种: $x$ 可以是输入 token ID, 也可以是下一个输出 token ID (真实的下一个 token ID, 或模型预测的 token ID). 100% 表示该词表元素每次出现, 输入都被路由到 $E_i$; 0% 表示该专家与这个词表元素完全无关, 只要出现的是这个 token ID, 删掉该专家也不影响表现.

In Figure 23 we find that vocabulary specialization is higher in later layers, similar to how later layers saturate earlier (§5.1). Later layers also specialize more on predicted output token IDs rather than input token IDs, i.e., the routing is decided more by the token the model is about to predict rather than the original input token. This is intuitive as in earlier layers there is more uncertainty about which token the model will predict. At $\sim$90%, expert 27 specializes the most, which we find in Table 8 to activate for many non-alphabetic tokens, such as Cyrillic and Devanagari letters.

<!-- page 23 of 63 -->

| Expert ID | Input token IDs | Predicted output token IDs |
|---|---|---|
| 27 | [copyright] (100%) [latin_l] (100%) $^{3}$ (100%) [latin_i] (100%) [jarai_i] (100%) [devanagari_virama] (100%) [devanagari_e] (100%) [devanagari_ka] (100%) [cyrillic_sha] (100%) [cyrillic_in] (100%) [cyrillic_a] (100%) | [slovak_l] (100%) § (100%) [copyright] (100%) [persian_j] (100%) [dutch_ij] (100%) [chinese_dot] (100%) [japanese_no] (100%) [devanagari_ra] (100%) [devanagari_ka] (100%) [devanagari_virama] (100%) [devanagari_la] (100%) |
| 58 | (“ (100%) (" (100%) ‘ (94%) ’ (92%) “ (92%) ( (92%) " (90%) ' (89%) “ (88%) USD (87%) [ (87%) £ (86%) | such (100%) 486 (100%) see (95%) which (91%) driving (91%) UK (90%) who (88%) including (88%) normal (88%) |
| 7 | Him (100%) inde (100%) Jesus (98%) God (90%) pray (81%) Holy (80%) Quran (80%) God (77%) Lord (76%) glory (75%) Spirit (66%) Christ (65%) | rella (100%) Him (94%) sin (90%) prince (80%) glory (72%) Jesus (69%) Lord (68%) Christ (65%) Spirit (55%) Holy (53%) God (50%) Prayer (50%) |
| 37 | Sunday (100%) Tuesday (100%) Thursday (100%) Olympic (100%) Christmas (100%) rugby (100%) Championship (100%) weekends (100%) | days (91%) anniversary (90%) month (88%) week (84%) mpi (83%) semester (81%) mand (80%) Olympics (78%) cent (76%) season (76%) perm (75%) |
| 43 | Armenian (100%) ijan (100%) enia (96%) Iraq (95%) Iranian (92%) Iran (92%) Saudi (90%) northern (90%) Lebanon (90%) Singapore (88%) Turkey (88%) Asia (87%) Egypt (86%) western (86%) | enia (90%) invasion (80%) Arabia (76%) irregular (66%) regions (64%) border (63%) Kong (61%) ians (61%) bases (60%) Republic (59%) Ireland (58%) Korea (58%) War (55%) Carolina (52%) |
| 4 | sq (89%) Main (70%) reversal (69%) YR (63%) GC (56%) Overall (50%) 79 (50%) main (50%) RE (46%) PCR (46%) tomb (45%) normal (43%) intensity (41%) Overall (41%) median (41%) | YR (90%) Character (88%) sq (77%) Os (76%) GHz (71%) fluence (60%) amycin (60%) pixels (56%) = (53%) arc (52%) Story (52%) = (51%) anth (50%) GHz (50%) cm (46%) |
| 0 | ESM (100%) icillin (100%) agra (98%) aust (96%) asa (93%) pills (92%) mg (85%) uk (82%) login (82%) doc (81%) generic (81%) cd (81%) Essay (81%) password (81%) Content (80%) | *, (100%) sil (96%) pills (91%) vi (90%) xen (87%) pharmacy (87%) gener (85%) aust (82%) mg (75%) Content (75%) uk (73%) THAT (73%) dispens (68%) icillin (68%) generic (66%) |
| 3 | grandmother (92%) brother (91%) Daisy (83%) daughter (78%) mum (75%) father (72%) wife (70%) husband (70%) lady (63%) dad (62%) boy (61%) | hood (36%) mother (35%) inde (31%) boy (29%) girl (28%) married (27%) tri (21%) Gab (20%) died (18%) taught (14%) lived (13%) knew (10%) |
| 48 | compared (42%) !) (41%) Then (41%) ’, (40%) ), (35%) ", (35%) instead (33%) | except (60%) tennis (41%) Marks (40%) Dunn (33%) tears (30%) Arizona (30%) |
| 23 | .... (58%) Therefore (55%) So (46%) !!! (46%) And (44%) According (41%) ." (41%) !! (40%) ?" (38%) But (38%) | [english_d] (53%) Republican (50%) Jack (47%) THIS (40%) Democratic (40%) according (39%) So (38%) Step (33%) |

Table 8: Vocabulary specialization in the 7th layer of OLMoE-1B-7B. We use $k=1$ (Equation 8) and a random 0.5% of the C4 validation data excluding token IDs with $<$10 appearances.

表 8｜OLMoE-1B-7B 第 7 层若干专家的词表特化 ($k=1$, C4 验证集随机 0.5%, 去掉出现少于 10 次的 token ID), 每格为 token 及其被路由到该专家的比例. 专家 27 集中于非拉丁字母, 专家 43 集中于地名, 专家 3 集中于亲属称谓.

<!-- page 24 of 63 -->

Expert 43 shows specialization on geographic terms in both input and output tokens. Experts 48 and 23 both focus on connector words, such as  Then and  Therefore. This is likely because they commonly process tokens together with a high co-activation of 60% in Figure 21 (middle). Based on our findings in §5.3 that for GitHub and arXiv often the same experts in layer 7 activate, we display one such expert (expert ID 4) in Table 8. It seems to specialize in measurements, such as  sq, YR (year), and  GHz. These are common terms in scientific papers corresponding to the arXiv domain and likely also in GitHub code for computations related to measurements. They are less likely to appear in books, which explains the low activation of expert ID 4 in layer 7 for book data in Figure 22. Expert 3 is among the three most active experts of layer 7 for book data in Figure 22 (fourth yellow bar for layer 7). This resonates when looking at its specialization on family terms in Table 8, which are far more common in books than scientific papers or code. Overall, domain specialization and vocabulary specialization are closely linked to one another, as domains are usually characterized by their distinct word distribution. In §G (Figure 32), we link them more closely by comparing the extent of vocabulary specialization across domains and expert IDs. In §G (Figure 30, Figure 31) we also find that OLMoE-1B-7B exhibits stronger vocabulary specialization than Mixtral-8x7B.

在 Figure 23 中我们发现, 词表特化在后面的层更高, 这与后面的层饱和更早 (§5.1) 相呼应. 后面的层也更多地按预测输出 token ID 而非输入 token ID 特化, 即路由更多地由模型将要预测的 token 决定, 而不是原输入 token. 这符合直觉, 因为在前面的层, 模型将预测哪个 token 还很不确定. 专家 27 的特化程度最高, 约 90%, Table 8 显示它对许多非字母 token 激活, 比如西里尔字母与天城文字母. 专家 43 在输入与输出 token 上都特化于地理名词. 专家 48 与 23 都集中于连接词, 如 Then 与 Therefore. 这可能是因为它们经常一起处理 token, 在 Figure 21 (中) 中两者的共激活高达 60%. 根据 §5.3 中 GitHub 与 arXiv 常在 layer 7 激活相同专家的发现, 我们在 Table 8 中列出了一个这样的专家 (ID 4). 它似乎特化于计量单位, 如 sq, YR (年) 与 GHz. 这些是 arXiv 领域科学论文中的常见词, 在 GitHub 中与计量相关的计算代码里大概也常见. 它们较少出现在书籍中, 这解释了 Figure 22 中 layer 7 的专家 4 在书籍数据上激活低. 专家 3 是 layer 7 在书籍数据上最活跃的三个专家之一 (Figure 22 中 layer 7 的第四根黄色柱). 再看它在 Table 8 中对亲属称谓的特化, 这些词在书籍中远比在科学论文或代码中常见, 两者对得上. 总体上, 领域特化与词表特化紧密相关, 因为领域通常由其独特的词分布来刻画. 在 §G (Figure 32) 中, 我们按领域与专家 ID 比较词表特化的程度, 把两者更紧密地联系起来. 在 §G (Figure 30, Figure 31) 中我们还发现, OLMoE-1B-7B 的词表特化比 Mixtral-8x7B 更强.

## 6 Related Work · 相关工作

**Advances in MoEs** Current LMs still largely follow the transformer architecture [185] with only few architectural changes that have been widely adopted, such as decoder-only training [137], SwiGLU activations [41, 153], RoPE [166], MQA/GQA [3, 152] and RMSNorm [208]. Model sparsity via Mixture-of-Experts is one modification still under active exploration with some early adoption but most LMs, including Llama 3 [50], still rely on a dense architecture. There has been a lot of progress in improving the sparsely-gated MoE layer since its introduction [154]: New routing techniques [49, 66, 77, 89, 124, 146, 195, 215, 222], fine-grained expert segmentation [39, 69], stability [221] and efficiency [48, 88, 91, 129, 141, 145, 168, 218] improvements. In this work, we perform many experiments to provide insights into training Mixture-of-Experts LMs. Subsequently, we train OLMoE-1B-7B for 5T tokens. No prior MoE has been overtrained [57] to this extent to our knowledge making OLMoE-1B-7B the best testbed to research performance saturation of MoEs vs. dense models. With OLMoE we hope to facilitate such and other research to help the field uncover whether MoEs should make it into all future LMs and with what precise configuration.

**MoE 的进展** 当前的 LM 仍基本沿用 transformer 架构 [185], 被广泛采纳的架构改动不多, 例如 decoder-only 训练 [137], SwiGLU 激活 [41, 153], RoPE [166], MQA/GQA [3, 152] 与 RMSNorm [208]. 通过 MoE 实现模型稀疏是一项仍在积极探索的改动, 已有一些早期采用, 但包括 Llama 3 [50] 在内的多数 LM 仍是 dense 架构. 稀疏门控 MoE 层提出 [154] 以来已有很多改进: 新的路由技术 [49, 66, 77, 89, 124, 146, 195, 215, 222], 细粒度专家切分 [39, 69], 稳定性 [221] 与效率 [48, 88, 91, 129, 141, 145, 168, 218] 方面的改进. 本工作做了大量实验, 为训练 MoE LM 提供参考. 随后我们用 5T token 训练 OLMoE-1B-7B. 据我们所知, 此前没有 MoE 被过训练 [57] 到这个程度, 这使 OLMoE-1B-7B 成为研究 MoE 与 dense 模型性能饱和的最好试验台. 我们希望 OLMoE 能促进这类研究及其他研究, 帮助领域弄明白 MoE 是否应当进入未来所有的 LM, 以及具体该用什么配置.

**Open LMs** A variety of model families have been proposed under varying degrees of openness commonly categorized based on whether model weights are available. **Closed-weight** models include GPT [24, 128], Gemini [174, 175], PaLM [9, 30], Reka [181], and **open-weight** ones include Llama [50, 182, 183], Mistral [78, 79], Gemma [176, 177], Falcon [8, 132], MPT [179], Qwen [13, 201], GLM [61], Yi [2], DeepSeek [39, 42, 43], Nemotron [126, 130], Zamba [62], InternLM [26], Baichuan [200], Phi [1, 68, 94], StableLM [16], OPT [212]. However, besides model weights, training data and code are key to enabling scientific research of these models [105, 106] and distributing their benefits broadly [23]. There have been few releases also including data and code in addition to model weights which we refer to as **“fully open-source”**: BLOOM [123, 151, 193, 203], GPT-NeoX [21, 22, 186], StarCoder [5, 92, 109, 120, 220], Pythia [18], OLMo [65], LLM360 [103], Cerebras-GPT [46], DCLM [90], MAP-Neo [209], RWKV [133, 134], and SmolLM [6]. For Mixture-of-Experts only OpenMoE [199] aims to be fully open-source, however, its poor performance limits its usefulness. We release OLMoE-1B-7B as the first state-of-the-art Mixture-of-Experts LM that is fully open-source: model weights, data, code, and logs.

**开放 LM** 已有多个模型系列以不同开放程度发布, 通常按权重是否公开来分类. **闭权重**模型包括 GPT [24, 128], Gemini [174, 175], PaLM [9, 30], Reka [181]; **开放权重**模型包括 Llama [50, 182, 183], Mistral [78, 79], Gemma [176, 177], Falcon [8, 132], MPT [179], Qwen [13, 201], GLM [61], Yi [2], DeepSeek [39, 42, 43], Nemotron [126, 130], Zamba [62], InternLM [26], Baichuan [200], Phi [1, 68, 94], StableLM [16], OPT [212]. 但除了模型权重, 训练数据与代码是开展这些模型科学研究 [105, 106] 并广泛分享其收益 [23] 的关键. 同时公开数据, 代码与权重的发布很少, 我们称之为**「完全开源」**: BLOOM [123, 151, 193, 203], GPT-NeoX [21, 22, 186], StarCoder [5, 92, 109, 120, 220], Pythia [18], OLMo [65], LLM360 [103], Cerebras-GPT [46], DCLM [90], MAP-Neo [209], RWKV [133, 134] 与 SmolLM [6]. MoE 中只有 OpenMoE [199] 以完全开源为目标, 但其表现较差, 用处有限. 我们发布的 OLMoE-1B-7B 是第一个性能领先且完全开源的 MoE LM: 模型权重, 数据, 代码与日志全部公开.

## 7 Conclusion

We open-source OLMoE-1B-7B and OLMoE-1B-7B-Instruct including model, data, code, and logs. At 1B active and 7B total parameters, our models yield state-of-the-art performance among models with a similar amount of active parameters even outperforming larger models including DeepSeekMoE-16B and Llama2-13B-Chat. We share various training experiments and define and analyze router saturation, expert co-activation, domain and vocabulary specialization of our model. Through our fully open release, we seek to help the field build better MoEs. We are excited about more iterations of OLMoE to close the gap between frontier models and fully open models.

我们开源 OLMoE-1B-7B 与 OLMoE-1B-7B-Instruct, 包括模型, 数据, 代码与日志. 在 1B 激活, 7B 总参数的规模上, 我们的模型在激活参数相近的模型中性能领先, 甚至超过 DeepSeekMoE-16B 与 Llama2-13B-Chat 等更大的模型. 我们分享了多项训练实验, 并定义, 分析了模型的路由饱和, 专家共激活, 领域特化与词表特化. 通过完全开放的发布, 我们希望帮助领域造出更好的 MoE. 我们期待 OLMoE 的后续迭代缩小前沿模型与完全开放模型之间的差距.

<!-- page 25 of 63 -->

## Author Contributions · 作者贡献

**Niklas Muennighoff** proposed and led the project. He ran the pretraining experiments, pretrained the model, helped run adaptation and analysis, and wrote most of the paper.

**Luca Soldaini** created the pretraining dataset and advised on pretraining.

**Dirk Groeneveld** advised on pretraining, especially stability and throughput improvements.

**Kyle Lo** helped with pretraining dataset creation, analyzed data experiments, and advised on data and framing, and helped edit the paper.

**Jacob Morrison** co-created the adaptation dataset, ran most adaptation experiments, and helped edit the paper.

**Sewon Min** analyzed router saturation, expert correlation, and vocabulary specialization, and helped frame and edit the paper.

**Weijia Shi** analyzed domain and vocabulary specialization, advised at various project stages, and helped edit the paper.

**Pete Walsh** advised on pretraining, especially stability and throughput improvements.

**Oyvind Tafjord** ran OLMES evaluations.

**Nathan Lambert** co-created the adaptation dataset, advised on adaptation, and helped edit the paper.

**Yuling Gu** ran OLMES evaluations and helped edit the paper.

**Shane Arora** uploaded the models, helped with code review and framework integration.

**Akshita Bhagia** supported stability investigations and helped with DCLM evaluations.

**Dustin Schwenk** supported stability investigations.

**David Wadden** ran DCLM evaluations and helped with Weights & Biases reports.

**Alexander Wettig** advised on pretraining, analyzed load balancing, routing, and domain specialization, and helped edit the paper.

**Binyuan Hui** advised on pretraining and helped with plotting and framework integration.

**Tim Dettmers** advised on analysis and inference experiments.

**Douwe Kiela** advised on framing.

**Ali Farhadi** advised on pretraining and framing.

**Noah A. Smith** advised on pretraining, and helped frame and edit the paper.

**Pang Wei Koh** advised on analysis, and helped frame and edit the paper.

**Amanpreet Singh** advised on pretraining, framing and helped edit the paper.

**Hannaneh Hajishirzi** was responsible for direction and advising of the overall effort and helped frame and edit the paper.

**Niklas Muennighoff** 提出并主导了项目. 他运行了预训练实验, 预训练了模型, 协助适配与分析, 并撰写了论文的大部分内容. **Luca Soldaini** 构建了预训练数据集, 并为预训练提供建议. **Dirk Groeneveld** 为预训练提供建议, 尤其是稳定性与吞吐改进. **Kyle Lo** 协助构建预训练数据集, 分析数据实验, 为数据与论文定位提供建议, 并协助修改论文. **Jacob Morrison** 共同构建适配数据集, 运行了大部分适配实验, 并协助修改论文. **Sewon Min** 分析了路由饱和, 专家相关性与词表特化, 并协助论文定位与修改. **Weijia Shi** 分析了领域与词表特化, 在项目各阶段提供建议, 并协助修改论文. **Pete Walsh** 为预训练提供建议, 尤其是稳定性与吞吐改进. **Oyvind Tafjord** 运行了 OLMES 评测. **Nathan Lambert** 共同构建适配数据集, 为适配提供建议, 并协助修改论文. **Yuling Gu** 运行了 OLMES 评测, 并协助修改论文. **Shane Arora** 上传了模型, 协助代码审查与框架集成. **Akshita Bhagia** 支持稳定性排查, 并协助 DCLM 评测. **Dustin Schwenk** 支持稳定性排查. **David Wadden** 运行了 DCLM 评测, 并协助制作 Weights & Biases 报告. **Alexander Wettig** 为预训练提供建议, 分析了负载均衡, 路由与领域特化, 并协助修改论文. **Binyuan Hui** 为预训练提供建议, 协助绘图与框架集成. **Tim Dettmers** 为分析与推理实验提供建议. **Douwe Kiela** 为论文定位提供建议. **Ali Farhadi** 为预训练与论文定位提供建议. **Noah A. Smith** 为预训练提供建议, 并协助论文定位与修改. **Pang Wei Koh** 为分析提供建议, 并协助论文定位与修改. **Amanpreet Singh** 为预训练与论文定位提供建议, 并协助修改论文. **Hannaneh Hajishirzi** 负责整体工作的方向与指导, 并协助论文定位与修改.

## Acknowledgements · 致谢

OLMoE would not be possible without the support of many individuals and institutions. We thank our teammates at the Allen Institute for AI, Contextual AI, and the University of Washington for their support, especially Aditya Kusupati, Ananya Harsh Jha, Caitlin Wittlif, Carissa Schoenick, Costa Huang, Crystal Nam, David Atkinson, Emma Strubell, Faeze Brahman, Hamish Ivison, Karel D'Oosterlinck, Matt Latzke, Ian Magnusson, Jack Merullo, Jay Chen, Jennifer Dumas, Jiacheng Liu, Johann Dahm, Luke Zettlemoyer, Michael Schmitz, Michael Wilson, Pradeep Dasigi, Sahil Verma, Sam Skjonsberg, Sophie Lebrecht, Stas Bekman, Taira Anderson, Valentina Pyatkin, Yanai Elazar, Yizhong Wang, and Yoganand Chandrasekhar. We also thank Armen Aghajanyan, Akshat Shrivastava, Colin Raffel, Haokun Liu, Ludwig Schmidt, Mengzhou Xia, Shayne Longpre, Sheng Shen, and Zexuan Zhong. PWK is supported by the Singapore National Research Foundation and the National AI Group in the Singapore Ministry of Digital Development and Innovation under the AI Visiting Professorship Programme (award number AIVP-2024-001).

OLMoE 的完成离不开许多个人与机构的支持. 我们感谢 Allen Institute for AI, Contextual AI 与 University of Washington 的同事们, 特别是 Aditya Kusupati, Ananya Harsh Jha, Caitlin Wittlif, Carissa Schoenick, Costa Huang, Crystal Nam, David Atkinson, Emma Strubell, Faeze Brahman, Hamish Ivison, Karel D'Oosterlinck, Matt Latzke, Ian Magnusson, Jack Merullo, Jay Chen, Jennifer Dumas, Jiacheng Liu, Johann Dahm, Luke Zettlemoyer, Michael Schmitz, Michael Wilson, Pradeep Dasigi, Sahil Verma, Sam Skjonsberg, Sophie Lebrecht, Stas Bekman, Taira Anderson, Valentina Pyatkin, Yanai Elazar, Yizhong Wang 与 Yoganand Chandrasekhar. 我们也感谢 Armen Aghajanyan, Akshat Shrivastava, Colin Raffel, Haokun Liu, Ludwig Schmidt, Mengzhou Xia, Shayne Longpre, Sheng Shen 与 Zexuan Zhong. PWK 受新加坡国家研究基金会, 以及新加坡数码发展及新闻部国家人工智能小组 AI 访问教授计划 (编号 AIVP-2024-001) 资助.

<!-- page 26 of 63 -->

## References

[1] Marah Abdin, Sam Ade Jacobs, Ammar Ahmad Awan, Jyoti Aneja, Ahmed Awadallah, Hany Awadalla, Nguyen Bach, Amit Bahree, Arash Bakhtiari, Jianmin Bao, Harkirat Behl, Alon Benhaim, Misha Bilenko, Johan Bjorck, S´ebastien Bubeck, Qin Cai, Martin Cai, Caio C´esar Teodoro Mendes, Weizhu Chen, Vishrav Chaudhary, Dong Chen, Dongdong Chen, Yen-Chun Chen, Yi-Ling Chen, Parul Chopra, Xiyang Dai, Allie Del Giorno, Gus- tavo de Rosa, Matthew Dixon, Ronen Eldan, Victor Fragoso, Dan Iter, Mei Gao, Min Gao, Jianfeng Gao, Amit Garg, Abhishek Goswami, Suriya Gunasekar, Emman Haider, Junheng Hao, Russell J. Hewett, Jamie Huynh, Mojan Javaheripi, Xin Jin, Piero Kauffmann, Nikos Karampatziakis, Dongwoo Kim, Mahoud Khademi, Lev Kurilenko, James R. Lee, Yin Tat Lee, Yuanzhi Li, Yunsheng Li, Chen Liang, Lars Liden, Ce Liu, Mengchen Liu, Weishung Liu, Eric Lin, Zeqi Lin, Chong Luo, Piyush Madan, Matt Mazzola, Arindam Mitra, Hardik Modi, Anh Nguyen, Brandon Norick, Barun Patra, Daniel Perez-Becker, Thomas Portet, Reid Pryzant, Heyang Qin, Marko Radmilac, Corby Rosset, Sambudha Roy, Olatunji Ruwase, Olli Saarikivi, Amin Saied, Adil Salim, Michael Santacroce, Shital Shah, Ning Shang, Hiteshi Sharma, Swadheen Shukla, Xia Song, Masahiro Tanaka, Andrea Tupini, Xin Wang, Lijuan Wang, Chunyu Wang, Yu Wang, Rachel Ward, Guanhua Wang, Philipp Witte, Haiping Wu, Michael Wyatt, Bin Xiao, Can Xu, Jiahang Xu, Weijian Xu, Sonali Yadav, Fan Yang, Jianwei Yang, Ziyi Yang, Yifan Yang, Donghan Yu, Lu Yuan, Chengruidong Zhang, Cyril Zhang, Jianwen Zhang, Li Lyna Zhang, Yi Zhang, Yue Zhang, Yunan Zhang, and Xiren Zhou. 2024. Phi-3 Technical Report: A Highly Capable Language Model Locally on Your Phone.

[2] 01. AI, :, Alex Young, Bei Chen, Chao Li, Chengen Huang, Ge Zhang, Guanwei Zhang, Heng Li, Jiangcheng Zhu, Jianqun Chen, Jing Chang, Kaidong Yu, Peng Liu, Qiang Liu, Shawn Yue, Senbin Yang, Shiming Yang, Tao Yu, Wen Xie, Wenhao Huang, Xiaohui Hu, Xiaoyi Ren, Xinyao Niu, Pengcheng Nie, Yuchi Xu, Yudong Liu, Yue Wang, Yuxuan Cai, Zhenyu Gu, Zhiyuan Liu, and Zonghong Dai. 2024. Yi: Open Foundation Models by 01.AI.

[3] Joshua Ainslie, James Lee-Thorp, Michiel de Jong, Yury Zemlyanskiy, Federico Lebr´on, and Sumit Sanghai. 2023. GQA: Training Generalized Multi-Query Transformer Models from Multi-Head Checkpoints.

[4] Alon Albalak, Yanai Elazar, Sang Michael Xie, Shayne Longpre, Nathan Lambert, Xinyi Wang, Niklas Muennighoff, Bairu Hou, Liangming Pan, Haewon Jeong, Colin Raffel, Shiyu Chang, Tatsunori Hashimoto, and William Yang Wang. 2024. A Survey on Data Selection for Language Models.

[5] Loubna Ben Allal, Raymond Li, Denis Kocetkov, Chenghao Mou, Christopher Akiki, Car-los Munoz Ferrandis, Niklas Muennighoff, Mayank Mishra, Alex Gu, Manan Dey, et al. 2023. SantaCoder: don’t reach for the stars!

[6] Loubna Ben Allal, Anton Lozhkov, Elie Bakouch, Leandro von Werra, and Thomas Wolf. 2024. SmolLM - blazingly fast and remarkably powerful.

[7] Zeyuan Allen-Zhu and Yuanzhi Li. 2024. Physics of Language Models: Part 3.3, Knowledge Capacity Scaling Laws.

[8] Ebtesam Almazrouei, Hamza Alobeidli, Abdulaziz Alshamsi, Alessandro Cappelli, Ruxan-dra Cojocaru, M´erouane Debbah, ´Etienne Goffinet, Daniel Hesslow, Julien Launay, Quentin Malartic, Daniele Mazzotta, Badreddine Noune, Baptiste Pannier, and Guilherme Penedo. 2023. The Falcon Series of Open Language Models.

[9] Rohan Anil, Andrew M. Dai, Orhan Firat, Melvin Johnson, Dmitry Lepikhin, Alexandre Pas-sos, Siamak Shakeri, Emanuel Taropa, Paige Bailey, Zhifeng Chen, Eric Chu, Jonathan H. Clark, Laurent El Shafey, Yanping Huang, Kathy Meier-Hellstern, Gaurav Mishra, Erica Moreira, Mark Omernick, Kevin Robinson, Sebastian Ruder, Yi Tay, Kefan Xiao, Yuanzhong Xu, Yujing Zhang, Gustavo Hernandez Abrego, Junwhan Ahn, Jacob Austin, Paul Barham, Jan Botha, James Bradbury, Siddhartha Brahma, Kevin Brooks, Michele Catasta, Yong Cheng, Colin Cherry, Christopher A. Choquette-Choo, Aakanksha Chowdhery, Cl´ement Crepy, Shachi Dave, Mostafa Dehghani, Sunipa Dev, Jacob Devlin, Mark D´ıaz, Nan Du, Ethan Dyer, Vlad Feinberg, Fangxiaoyu Feng, Vlad Fienber, Markus Freitag, Xavier Garcia,

<!-- page 27 of 63 -->

Sebastian Gehrmann, Lucas Gonzalez, Guy Gur-Ari, Steven Hand, Hadi Hashemi, Le Hou, Joshua Howland, Andrea Hu, Jeffrey Hui, Jeremy Hurwitz, Michael Isard, Abe Ittycheriah, Matthew Jagielski, Wenhao Jia, Kathleen Kenealy, Maxim Krikun, Sneha Kudugunta, Chang Lan, Katherine Lee, Benjamin Lee, Eric Li, Music Li, Wei Li, YaGuang Li, Jian Li, Hyeon- taek Lim, Hanzhao Lin, Zhongtao Liu, Frederick Liu, Marcello Maggioni, Aroma Mahendru, Joshua Maynez, Vedant Misra, Maysam Moussalem, Zachary Nado, John Nham, Eric Ni, Andrew Nystrom, Alicia Parrish, Marie Pellat, Martin Polacek, Alex Polozov, Reiner Pope, Siyuan Qiao, Emily Reif, Bryan Richter, Parker Riley, Alex Castro Ros, Aurko Roy, Bren- nan Saeta, Rajkumar Samuel, Renee Shelby, Ambrose Slone, Daniel Smilkov, David R. So, Daniel Sohn, Simon Tokumine, Dasha Valter, Vijay Vasudevan, Kiran Vodrahalli, Xuezhi Wang, Pidong Wang, Zirui Wang, Tao Wang, John Wieting, Yuhuai Wu, Kelvin Xu, Yunhan Xu, Linting Xue, Pengcheng Yin, Jiahui Yu, Qiao Zhang, Steven Zheng, Ce Zheng, Weikang Zhou, Denny Zhou, Slav Petrov, and Yonghui Wu. 2023. PaLM 2 Technical Report.

[10] Mikel Artetxe, Shruti Bhosale, Naman Goyal, Todor Mihaylov, Myle Ott, Sam Shleifer, Xi Victoria Lin, Jingfei Du, Srinivasan Iyer, Ramakanth Pasunuru, Giri Anantharaman, Xian Li, Shuohui Chen, Halil Akin, Mandeep Baines, Louis Martin, Xing Zhou, Punit Singh Koura, Brian O’Horo, Jeff Wang, Luke Zettlemoyer, Mona Diab, Zornitsa Kozareva, and Ves Stoyanov. 2022. Efficient Large Scale Language Modeling with Mixtures of Experts.

[11] Zhangir Azerbayev, Hailey Schoelkopf, Keiran Paster, Marco Dos Santos, Stephen McAleer, Albert Q. Jiang, Jia Deng, Stella Biderman, and Sean Welleck. 2023. Llemma: An Open Language Model For Mathematics.

[12] Jimmy Lei Ba, Jamie Ryan Kiros, and Geoffrey E. Hinton. 2016. Layer Normalization.

[13] Jinze Bai, Shuai Bai, Yunfei Chu, Zeyu Cui, Kai Dang, Xiaodong Deng, Yang Fan, Wenbin Ge, Yu Han, Fei Huang, Binyuan Hui, Luo Ji, Mei Li, Junyang Lin, Runji Lin, Dayiheng Liu, Gao Liu, Chengqiang Lu, Keming Lu, Jianxin Ma, Rui Men, Xingzhang Ren, Xuancheng Ren, Chuanqi Tan, Sinan Tan, Jianhong Tu, Peng Wang, Shijie Wang, Wei Wang, Sheng- guang Wu, Benfeng Xu, Jin Xu, An Yang, Hao Yang, Jian Yang, Shusheng Yang, Yang Yao, Bowen Yu, Hongyi Yuan, Zheng Yuan, Jianwei Zhang, Xingxuan Zhang, Yichang Zhang, Zhenru Zhang, Chang Zhou, Jingren Zhou, Xiaohuan Zhou, and Tianhang Zhu. 2023. Qwen Technical Report.

[14] Jinze Bai, Shuai Bai, Shusheng Yang, Shijie Wang, Sinan Tan, Peng Wang, Junyang Lin, Chang Zhou, and Jingren Zhou. 2023. Qwen-VL: A Versatile Vision-Language Model for Understanding, Localization, Text Reading, and Beyond.

[15] Yuntao Bai, Saurav Kadavath, Sandipan Kundu, Amanda Askell, Jackson Kernion, Andy Jones, Anna Chen, Anna Goldie, Azalia Mirhoseini, Cameron McKinnon, Carol Chen, Catherine Olsson, Christopher Olah, Danny Hernandez, Dawn Drain, Deep Ganguli, Dustin Li, Eli Tran-Johnson, Ethan Perez, Jamie Kerr, Jared Mueller, Jeffrey Ladish, Joshua Landau, Kamal Ndousse, Kamile Lukosuite, Liane Lovitt, Michael Sellitto, Nelson Elhage, Nicholas Schiefer, Noemi Mercado, Nova DasSarma, Robert Lasenby, Robin Larson, Sam Ringer, Scott Johnston, Shauna Kravec, Sheer El Showk, Stanislav Fort, Tamera Lanham, Timo- thy Telleen-Lawton, Tom Conerly, Tom Henighan, Tristan Hume, Samuel R. Bowman, Zac Hatfield-Dodds, Ben Mann, Dario Amodei, Nicholas Joseph, Sam McCandlish, Tom Brown, and Jared Kaplan. 2022. Constitutional AI: Harmlessness from AI Feedback.

[16] Marco Bellagente, Jonathan Tow, Dakota Mahan, Duy Phung, Maksym Zhuravinskyi, Reshinth Adithyan, James Baicoianu, Ben Brooks, Nathan Cooper, Ashish Datta, Meng Lee, Emad Mostaque, Michael Pieler, Nikhil Pinnaparju, Paulo Rocha, Harry Saini, Han- nah Teufel, Niccolo Zanichelli, and Carlos Riquelme. 2024. Stable LM 2 1.6B Technical Report.

[17] Emmanuel Bengio, Pierre-Luc Bacon, Joelle Pineau, and Doina Precup. 2016. Conditional Computation in Neural Networks for faster models.

[18] Stella Biderman, Hailey Schoelkopf, Quentin Anthony, Herbie Bradley, Kyle O’Brien, Eric Hallahan, Mohammad Aflah Khan, Shivanshu Purohit, USVSN Sai Prashanth, Edward Raff, Aviya Skowron, Lintang Sutawika, and Oskar van der Wal. 2023. Pythia: A Suite for Ana- lyzing Large Language Models Across Training and Scaling.

<!-- page 28 of 63 -->

[19] Stella Biderman, Hailey Schoelkopf, Lintang Sutawika, Leo Gao, Jonathan Tow, Baber Ab-basi, Alham Fikri Aji, Pawan Sasanka Ammanamanchi, Sidney Black, Jordan Clive, An- thony DiPofi, Julen Etxaniz, Benjamin Fattori, Jessica Zosa Forde, Charles Foster, Jeffrey Hsu, Mimansa Jaiswal, Wilson Y. Lee, Haonan Li, Charles Lovering, Niklas Muennighoff, Ellie Pavlick, Jason Phang, Aviya Skowron, Samson Tan, Xiangru Tang, Kevin A. Wang, Genta Indra Winata, Franc¸ois Yvon, and Andy Zou. 2024. Lessons from the Trenches on Reproducible Evaluation of Language Models.

[20] Yonatan Bisk, Rowan Zellers, Ronan Le Bras, Jianfeng Gao, and Yejin Choi. 2019. PIQA: Reasoning about Physical Commonsense in Natural Language.

[21] Sid Black, Stella Biderman, Eric Hallahan, Quentin Anthony, Leo Gao, Laurence Gold-ing, Horace He, Connor Leahy, Kyle McDonell, Jason Phang, Michael Pieler, USVSN Sai Prashanth, Shivanshu Purohit, Laria Reynolds, Jonathan Tow, Ben Wang, and Samuel Wein- bach. 2022. GPT-NeoX-20B: An Open-Source Autoregressive Language Model.

[22] Sid Black, Leo Gao, Phil Wang, Connor Leahy, and Stella Biderman. 2021. GPT-Neo: Large Scale Autoregressive Language Modeling with Mesh-Tensorflow.

[23] Rishi Bommasani, Kevin Klyman, Shayne Longpre, Sayash Kapoor, Nestor Maslej, Betty Xiong, Daniel Zhang, and Percy Liang. 2023. The Foundation Model Transparency Index.

[24] Tom B. Brown, Benjamin Mann, Nick Ryder, Melanie Subbiah, Jared Kaplan, Prafulla Dhari-wal, Arvind Neelakantan, Pranav Shyam, Girish Sastry, Amanda Askell, et al. 2020. Lan- guage Models are Few-Shot Learners.

[25] Tianle Cai. 2023. Mixtral from Mistral.

[26] Zheng Cai, Maosong Cao, Haojiong Chen, Kai Chen, Keyu Chen, Xin Chen, Xun Chen, Zehui Chen, Zhi Chen, Pei Chu, Xiaoyi Dong, Haodong Duan, Qi Fan, Zhaoye Fei, Yang Gao, Jiaye Ge, Chenya Gu, Yuzhe Gu, Tao Gui, Aijia Guo, Qipeng Guo, Conghui He, Yingfan Hu, Ting Huang, Tao Jiang, Penglong Jiao, Zhenjiang Jin, Zhikai Lei, Jiaxing Li, Jingwen Li, Linyang Li, Shuaibin Li, Wei Li, Yining Li, Hongwei Liu, Jiangning Liu, Jiawei Hong, Kaiwen Liu, Kuikun Liu, Xiaoran Liu, Chengqi Lv, Haijun Lv, Kai Lv, Li Ma, Runyuan Ma, Zerun Ma, Wenchang Ning, Linke Ouyang, Jiantao Qiu, Yuan Qu, Fukai Shang, Yunfan Shao, Demin Song, Zifan Song, Zhihao Sui, Peng Sun, Yu Sun, Huanze Tang, Bin Wang, Guoteng Wang, Jiaqi Wang, Jiayu Wang, Rui Wang, Yudong Wang, Ziyi Wang, Xingjian Wei, Qizhen Weng, Fan Wu, Yingtong Xiong, Chao Xu, Ruiliang Xu, Hang Yan, Yirong Yan, Xiaogui Yang, Haochen Ye, Huaiyuan Ying, Jia Yu, Jing Yu, Yuhang Zang, Chuyu Zhang, Li Zhang, Pan Zhang, Peng Zhang, Ruijie Zhang, Shuo Zhang, Songyang Zhang, Wenjian Zhang, Wenwei Zhang, Xingcheng Zhang, Xinyue Zhang, Hui Zhao, Qian Zhao, Xiaomeng Zhao, Fengzhe Zhou, Zaida Zhou, Jingming Zhuo, Yicheng Zou, Xipeng Qiu, Yu Qiao, and Dahua Lin. 2024. InternLM2 Technical Report.

[27] Mark Chen, Alec Radford, Rewon Child, Jeffrey Wu, Heewoo Jun, David Luan, and Ilya Sutskever. 2020. Generative pretraining from pixels.

[28] Mark Chen, Jerry Tworek, Heewoo Jun, Qiming Yuan, Henrique Ponde de Oliveira Pinto, Jared Kaplan, Harri Edwards, Yuri Burda, Nicholas Joseph, Greg Brockman, Alex Ray, Raul Puri, Gretchen Krueger, Michael Petrov, Heidy Khlaaf, Girish Sastry, Pamela Mishkin, Brooke Chan, Scott Gray, Nick Ryder, Mikhail Pavlov, Alethea Power, Lukasz Kaiser, Mo- hammad Bavarian, Clemens Winter, Philippe Tillet, Felipe Petroski Such, Dave Cummings, Matthias Plappert, Fotios Chantzis, Elizabeth Barnes, Ariel Herbert-Voss, William Hebgen Guss, Alex Nichol, Alex Paino, Nikolas Tezak, Jie Tang, Igor Babuschkin, Suchir Bal- aji, Shantanu Jain, William Saunders, Christopher Hesse, Andrew N. Carr, Jan Leike, Josh Achiam, Vedant Misra, Evan Morikawa, Alec Radford, Matthew Knight, Miles Brundage, Mira Murati, Katie Mayer, Peter Welinder, Bob McGrew, Dario Amodei, Sam McCandlish, Ilya Sutskever, and Wojciech Zaremba. 2021. Evaluating Large Language Models Trained on Code.

[29] Soumith Chintala. 2024. GPT-4 MoE.

<!-- page 29 of 63 -->

[30] Aakanksha Chowdhery, Sharan Narang, Jacob Devlin, Maarten Bosma, Gaurav Mishra, Adam Roberts, Paul Barham, Hyung Won Chung, Charles Sutton, Sebastian Gehrmann, et al. 2022. PaLM: Scaling Language Modeling with Pathways.

[31] Paul Christiano, Jan Leike, Tom B. Brown, Miljan Martic, Shane Legg, and Dario Amodei. 2023. Deep reinforcement learning from human preferences.

[32] Aidan Clark, Diego de las Casas, Aurelia Guy, Arthur Mensch, Michela Paganini, Jor-dan Hoffmann, Bogdan Damoc, Blake Hechtman, Trevor Cai, Sebastian Borgeaud, George van den Driessche, Eliza Rutherford, Tom Hennigan, Matthew Johnson, Katie Millican, Al- bin Cassirer, Chris Jones, Elena Buchatskaya, David Budden, Laurent Sifre, Simon Osindero, Oriol Vinyals, Jack Rae, Erich Elsen, Koray Kavukcuoglu, and Karen Simonyan. 2022. Uni- fied Scaling Laws for Routed Language Models.

[33] Christopher Clark, Kenton Lee, Ming-Wei Chang, Tom Kwiatkowski, Michael Collins, and Kristina Toutanova. 2019. BoolQ: Exploring the Surprising Difficulty of Natural Yes/No Questions.

[34] Peter Clark, Isaac Cowhey, Oren Etzioni, Tushar Khot, Ashish Sabharwal, Carissa Schoenick, and Oyvind Tafjord. 2018. Think you have Solved Question Answering? Try ARC, the AI2 Reasoning Challenge.

[35] Karl Cobbe, Vineet Kosaraju, Mohammad Bavarian, Mark Chen, Heewoo Jun, Lukasz Kaiser, Matthias Plappert, Jerry Tworek, Jacob Hilton, Reiichiro Nakano, Christopher Hesse, and John Schulman. 2021. Training Verifiers to Solve Math Word Problems.

[36] Together Computer. 2023. RedPajama: An Open Source Recipe to Reproduce LLaMA train-ing dataset.

[37] R´obert Csord´as, Kazuki Irie, J¨urgen Schmidhuber, Christopher Potts, and Christopher D. Manning. 2024. MoEUT: Mixture-of-Experts Universal Transformers.

[38] Ganqu Cui, Lifan Yuan, Ning Ding, Guanming Yao, Wei Zhu, Yuan Ni, Guotong Xie, Zhiyuan Liu, and Maosong Sun. 2023. UltraFeedback: Boosting Language Models with High-quality Feedback.

[39] Damai Dai, Chengqi Deng, Chenggang Zhao, R. X. Xu, Huazuo Gao, Deli Chen, Jiashi Li, Wangding Zeng, Xingkai Yu, Y. Wu, Zhenda Xie, Y. K. Li, Panpan Huang, Fuli Luo, Chong Ruan, Zhifang Sui, and Wenfeng Liang. 2024. DeepSeekMoE: Towards Ultimate Expert Specialization in Mixture-of-Experts Language Models.

[40] Databricks. 2024. DBRX.

[41] Yann N. Dauphin, Angela Fan, Michael Auli, and David Grangier. 2017. Language Modeling with Gated Convolutional Networks.

[42] DeepSeek-AI, :, Xiao Bi, Deli Chen, Guanting Chen, Shanhuang Chen, Damai Dai, Chengqi Deng, Honghui Ding, Kai Dong, Qiushi Du, Zhe Fu, Huazuo Gao, Kaige Gao, Wenjun Gao, Ruiqi Ge, Kang Guan, Daya Guo, Jianzhong Guo, Guangbo Hao, Zhewen Hao, Ying He, Wenjie Hu, Panpan Huang, Erhang Li, Guowei Li, Jiashi Li, Yao Li, Y. K. Li, Wenfeng Liang, Fangyun Lin, A. X. Liu, Bo Liu, Wen Liu, Xiaodong Liu, Xin Liu, Yiyuan Liu, Haoyu Lu, Shanghao Lu, Fuli Luo, Shirong Ma, Xiaotao Nie, Tian Pei, Yishi Piao, Junjie Qiu, Hui Qu, Tongzheng Ren, Zehui Ren, Chong Ruan, Zhangli Sha, Zhihong Shao, Junxiao Song, Xuecheng Su, Jingxiang Sun, Yaofeng Sun, Minghui Tang, Bingxuan Wang, Peiyi Wang, Shiyu Wang, Yaohui Wang, Yongji Wang, Tong Wu, Y. Wu, Xin Xie, Zhenda Xie, Ziwei Xie, Yiliang Xiong, Hanwei Xu, R. X. Xu, Yanhong Xu, Dejian Yang, Yuxiang You, Shuiping Yu, Xingkai Yu, B. Zhang, Haowei Zhang, Lecong Zhang, Liyue Zhang, Mingchuan Zhang, Minghua Zhang, Wentao Zhang, Yichao Zhang, Chenggang Zhao, Yao Zhao, Shangyan Zhou, Shunfeng Zhou, Qihao Zhu, and Yuheng Zou. 2024. DeepSeek LLM: Scaling Open-Source Language Models with Longtermism.

<!-- page 30 of 63 -->

[43] DeepSeek-AI, Aixin Liu, Bei Feng, Bin Wang, Bingxuan Wang, Bo Liu, Chenggang Zhao, Chengqi Dengr, Chong Ruan, Damai Dai, Daya Guo, Dejian Yang, Deli Chen, Dongjie Ji, Erhang Li, Fangyun Lin, Fuli Luo, Guangbo Hao, Guanting Chen, Guowei Li, H. Zhang, Hanwei Xu, Hao Yang, Haowei Zhang, Honghui Ding, Huajian Xin, Huazuo Gao, Hui Li, Hui Qu, J. L. Cai, Jian Liang, Jianzhong Guo, Jiaqi Ni, Jiashi Li, Jin Chen, Jingyang Yuan, Junjie Qiu, Junxiao Song, Kai Dong, Kaige Gao, Kang Guan, Lean Wang, Lecong Zhang, Lei Xu, Leyi Xia, Liang Zhao, Liyue Zhang, Meng Li, Miaojun Wang, Mingchuan Zhang, Minghua Zhang, Minghui Tang, Mingming Li, Ning Tian, Panpan Huang, Peiyi Wang, Peng Zhang, Qihao Zhu, Qinyu Chen, Qiushi Du, R. J. Chen, R. L. Jin, Ruiqi Ge, Ruizhe Pan, Runxin Xu, Ruyi Chen, S. S. Li, Shanghao Lu, Shangyan Zhou, Shanhuang Chen, Shaoqing Wu, Shengfeng Ye, Shirong Ma, Shiyu Wang, Shuang Zhou, Shuiping Yu, Shunfeng Zhou, Size Zheng, T. Wang, Tian Pei, Tian Yuan, Tianyu Sun, W. L. Xiao, Wangding Zeng, Wei An, Wen Liu, Wenfeng Liang, Wenjun Gao, Wentao Zhang, X. Q. Li, Xiangyue Jin, Xianzu Wang, Xiao Bi, Xiaodong Liu, Xiaohan Wang, Xiaojin Shen, Xiaokang Chen, Xiaosha Chen, Xiaotao Nie, Xiaowen Sun, Xiaoxiang Wang, Xin Liu, Xin Xie, Xingkai Yu, Xinnan Song, Xinyi Zhou, Xinyu Yang, Xuan Lu, Xuecheng Su, Y. Wu, Y. K. Li, Y. X. Wei, Y. X. Zhu, Yanhong Xu, Yanping Huang, Yao Li, Yao Zhao, Yaofeng Sun, Yaohui Li, Yaohui Wang, Yi Zheng, Yichao Zhang, Yiliang Xiong, Yilong Zhao, Ying He, Ying Tang, Yishi Piao, Yixin Dong, Yixuan Tan, Yiyuan Liu, Yongji Wang, Yongqiang Guo, Yuchen Zhu, Yuduan Wang, Yuheng Zou, Yukun Zha, Yunxian Ma, Yuting Yan, Yuxiang You, Yuxuan Liu, Z. Z. Ren, Zehui Ren, Zhangli Sha, Zhe Fu, Zhen Huang, Zhen Zhang, Zhenda Xie, Zhewen Hao, Zhihong Shao, Zhiniu Wen, Zhipeng Xu, Zhongyu Zhang, Zhuoshu Li, Zihan Wang, Zihui Gu, Zilin Li, and Ziwei Xie. 2024. DeepSeek-V2: A Strong, Economical, and Efficient Mixture-of-Experts Language Model.

[44] Mostafa Dehghani, Josip Djolonga, Basil Mustafa, Piotr Padlewski, Jonathan Heek, Justin Gilmer, Andreas Steiner, Mathilde Caron, Robert Geirhos, Ibrahim Alabdulmohsin, Rodolphe Jenatton, Lucas Beyer, Michael Tschannen, Anurag Arnab, Xiao Wang, Car- los Riquelme, Matthias Minderer, Joan Puigcerver, Utku Evci, Manoj Kumar, Sjoerd van Steenkiste, Gamaleldin F. Elsayed, Aravindh Mahendran, Fisher Yu, Avital Oliver, Fantine Huot, Jasmijn Bastings, Mark Patrick Collier, Alexey Gritsenko, Vighnesh Birodkar, Cristina Vasconcelos, Yi Tay, Thomas Mensink, Alexander Kolesnikov, Filip Paveti´c, Dustin Tran, Thomas Kipf, Mario Luˇci´c, Xiaohua Zhai, Daniel Keysers, Jeremiah Harmsen, and Neil Houlsby. 2023. Scaling Vision Transformers to 22 Billion Parameters.

[45] Mostafa Dehghani, Stephan Gouws, Oriol Vinyals, Jakob Uszkoreit, and Łukasz Kaiser. 2019. Universal Transformers.

[46] Nolan Dey, Gurpreet Gosal, Zhiming, Chen, Hemant Khachane, William Marshall, Ribhu Pathria, Marvin Tom, and Joel Hestness. 2023. Cerebras-GPT: Open Compute-Optimal Lan- guage Models Trained on the Cerebras Wafer-Scale Cluster.

[47] Danny Driess, Fei Xia, Mehdi S. M. Sajjadi, Corey Lynch, Aakanksha Chowdhery, Brian Ichter, Ayzaan Wahid, Jonathan Tompson, Quan Vuong, Tianhe Yu, Wenlong Huang, Yevgen Chebotar, Pierre Sermanet, Daniel Duckworth, Sergey Levine, Vincent Vanhoucke, Karol Hausman, Marc Toussaint, Klaus Greff, Andy Zeng, Igor Mordatch, and Pete Florence. 2023. PaLM-E: An Embodied Multimodal Language Model.

[48] Nan Du, Yanping Huang, Andrew M. Dai, Simon Tong, Dmitry Lepikhin, Yuanzhong Xu, Maxim Krikun, Yanqi Zhou, Adams Wei Yu, Orhan Firat, Barret Zoph, Liam Fedus, Maarten Bosma, Zongwei Zhou, Tao Wang, Yu Emma Wang, Kellie Webster, Marie Pellat, Kevin Robinson, Kathleen Meier-Hellstern, Toju Duke, Lucas Dixon, Kun Zhang, Quoc V Le, Yonghui Wu, Zhifeng Chen, and Claire Cui. 2022. GLaM: Efficient Scaling of Language Models with Mixture-of-Experts.

[49] Dheeru Dua, Shruti Bhosale, Vedanuj Goswami, James Cross, Mike Lewis, and Angela Fan. 2021. Tricks for Training Sparse Translation Models.

[50] Abhimanyu Dubey, Abhinav Jauhri, Abhinav Pandey, Abhishek Kadian, Ahmad Al-Dahle, Aiesha Letman, Akhil Mathur, Alan Schelten, Amy Yang, Angela Fan, Anirudh Goyal, An- thony Hartshorn, Aobo Yang, Archi Mitra, Archie Sravankumar, Artem Korenev, Arthur

<!-- page 31 of 63 -->

Hinsvark, Arun Rao, Aston Zhang, Aurelien Rodriguez, Austen Gregerson, et al. 2024. The Llama 3 Herd of Models.

[51] Yann Dubois, Bal´azs Galambosi, Percy Liang, and Tatsunori B. Hashimoto. 2024. Length-Controlled AlpacaEval: A Simple Way to Debias Automatic Evaluators.

[52] David Eigen, Marc’Aurelio Ranzato, and Ilya Sutskever. 2014. Learning Factored Represen-tations in a Deep Mixture of Experts.

[53] Kenneth Enevoldsen, M´arton Kardos, Niklas Muennighoff, and Kristoffer Laigaard Nielbo. 2024. The Scandinavian Embedding Benchmarks: Comprehensive Assessment of Multilin- gual and Monolingual Text Embedding.

[54] Kawin Ethayarajh, Winnie Xu, Niklas Muennighoff, Dan Jurafsky, and Douwe Kiela. 2024. KTO: Model Alignment as Prospect Theoretic Optimization.

[55] Manuel Faysse, Patrick Fernandes, Nuno M. Guerreiro, Ant´onio Loison, Duarte M. Alves, Caio Corro, Nicolas Boizard, Jo˜ao Alves, Ricardo Rei, Pedro H. Martins, Antoni Bigata Casademunt, Franc¸ois Yvon, Andr´e F. T. Martins, Gautier Viaud, C´eline Hudelot, and Pierre Colombo. 2024. CroissantLLM: A Truly Bilingual French-English Language Model.

[56] William Fedus, Barret Zoph, and Noam Shazeer. 2022. Switch Transformers: Scaling to Trillion Parameter Models with Simple and Efficient Sparsity.

[57] Samir Yitzhak Gadre, Georgios Smyrnis, Vaishaal Shankar, Suchin Gururangan, Mitchell Wortsman, Rulin Shao, Jean Mercat, Alex Fang, Jeffrey Li, Sedrick Keh, Rui Xin, Marianna Nezhurina, Igor Vasiljevic, Jenia Jitsev, Luca Soldaini, Alexandros G. Dimakis, Gabriel Il- harco, Pang Wei Koh, Shuran Song, Thomas Kollar, Yair Carmon, Achal Dave, Reinhard Heckel, Niklas Muennighoff, and Ludwig Schmidt. 2024. Language models scale reliably with over-training and on downstream tasks.

[58] Trevor Gale, Deepak Narayanan, Cliff Young, and Matei Zaharia. 2022. MegaBlocks: Effi-cient Sparse Training with Mixture-of-Experts.

[59] Leo Gao, Stella Biderman, Sid Black, Laurence Golding, Travis Hoppe, Charles Foster, Jason Phang, Horace He, Anish Thite, Noa Nabeshima, Shawn Presser, and Connor Leahy. 2020. The Pile: An 800GB Dataset of Diverse Text for Language Modeling.

[60] Leo Gao, Jonathan Tow, Stella Biderman, Sid Black, Anthony DiPofi, Charles Foster, Laurence Golding, Jeffrey Hsu, Kyle McDonell, Niklas Muennighoff, Jason Phang, Laria Reynolds, Eric Tang, Anish Thite, Ben Wang, Kevin Wang, and Andy Zou. 2021. A frame- work for few-shot language model evaluation.

[61] Team GLM, Aohan Zeng, Bin Xu, Bowen Wang, Chenhui Zhang, Da Yin, Diego Rojas, Guanyu Feng, Hanlin Zhao, Hanyu Lai, Hao Yu, Hongning Wang, Jiadai Sun, Jiajie Zhang, Jiale Cheng, Jiayi Gui, Jie Tang, Jing Zhang, Juanzi Li, Lei Zhao, Lindong Wu, Lucen Zhong, Mingdao Liu, Minlie Huang, Peng Zhang, Qinkai Zheng, Rui Lu, Shuaiqi Duan, Shudan Zhang, Shulin Cao, Shuxun Yang, Weng Lam Tam, Wenyi Zhao, Xiao Liu, Xiao Xia, Xiaohan Zhang, Xiaotao Gu, Xin Lv, Xinghan Liu, Xinyi Liu, Xinyue Yang, Xixuan Song, Xunkai Zhang, Yifan An, Yifan Xu, Yilin Niu, Yuantao Yang, Yueyan Li, Yushi Bai, Yuxiao Dong, Zehan Qi, Zhaoyu Wang, Zhen Yang, Zhengxiao Du, Zhenyu Hou, and Zihan Wang. 2024. ChatGLM: A Family of Large Language Models from GLM-130B to GLM-4 All Tools.

[62] Paolo Glorioso, Quentin Anthony, Yury Tokpanov, James Whittington, Jonathan Pilault, Adam Ibrahim, and Beren Millidge. 2024. Zamba: A Compact 7B SSM Hybrid Model.

[63] Andrew Gordon, Zornitsa Kozareva, and Melissa Roemmele. 2012. SemEval-2012 Task 7: Choice of Plausible Alternatives: An Evaluation of Commonsense Causal Reasoning.

[64] Dirk Groeneveld, Anas Awadalla, Iz Beltagy, Akshita Bhagia, Ian Magnusson, Hao Peng, Oyvind Tafjord, Pete Walsh, Kyle Richardson, and Jesse Dodge. 2023. Catwalk: A Unified Language Model Evaluation Framework for Many Datasets.

<!-- page 32 of 63 -->

[65] Dirk Groeneveld, Iz Beltagy, Pete Walsh, Akshita Bhagia, Rodney Kinney, Oyvind Tafjord, Ananya Harsh Jha, Hamish Ivison, Ian Magnusson, Yizhong Wang, Shane Arora, David Atkinson, Russell Authur, Khyathi Raghavi Chandu, Arman Cohan, Jennifer Dumas, Yanai Elazar, Yuling Gu, Jack Hessel, Tushar Khot, William Merrill, Jacob Morrison, Niklas Muen- nighoff, Aakanksha Naik, Crystal Nam, Matthew E. Peters, Valentina Pyatkin, Abhilasha Ravichander, Dustin Schwenk, Saurabh Shah, Will Smith, Emma Strubell, Nishant Subra- mani, Mitchell Wortsman, Pradeep Dasigi, Nathan Lambert, Kyle Richardson, Luke Zettle- moyer, Jesse Dodge, Kyle Lo, Luca Soldaini, Noah A. Smith, and Hannaneh Hajishirzi. 2024. OLMo: Accelerating the Science of Language Models.

[66] Sam Gross, Marc’Aurelio Ranzato, and Arthur Szlam. 2017. Hard Mixtures of Experts for Large Scale Weakly Supervised Vision.

[67] Yuling Gu, Oyvind Tafjord, Bailey Kuehl, Dany Haddad, Jesse Dodge, and Hannaneh Ha-jishirzi. 2024. OLMES: A Standard for Language Model Evaluations.

[68] Suriya Gunasekar, Yi Zhang, Jyoti Aneja, Caio C´esar Teodoro Mendes, Allie Del Giorno, Sivakanth Gopi, Mojan Javaheripi, Piero Kauffmann, Gustavo de Rosa, Olli Saarikivi, Adil Salim, Shital Shah, Harkirat Singh Behl, Xin Wang, S´ebastien Bubeck, Ronen Eldan, Adam Tauman Kalai, Yin Tat Lee, and Yuanzhi Li. 2023. Textbooks Are All You Need.

[69] Xu Owen He. 2024. Mixture of A Million Experts.

[70] Dan Hendrycks, Collin Burns, Steven Basart, Andy Zou, Mantas Mazeika, Dawn Song, and Jacob Steinhardt. 2021. Measuring Massive Multitask Language Understanding.

[71] Dan Hendrycks, Collin Burns, Saurav Kadavath, Akul Arora, Steven Basart, Eric Tang, Dawn Song, and Jacob Steinhardt. 2021. Measuring Mathematical Problem Solving With the MATH Dataset.

[72] Jordan Hoffmann, Sebastian Borgeaud, Arthur Mensch, Elena Buchatskaya, Trevor Cai, Eliza Rutherford, Diego de Las Casas, Lisa Anne Hendricks, Johannes Welbl, Aidan Clark, Tom Hennigan, Eric Noland, Katie Millican, George van den Driessche, Bogdan Damoc, Aurelia Guy, Simon Osindero, Karen Simonyan, Erich Elsen, Jack W. Rae, Oriol Vinyals, and Laurent Sifre. 2022. Training Compute-Optimal Large Language Models.

[73] Jiwoo Hong, Noah Lee, and James Thorne. 2024. ORPO: Monolithic Preference Optimiza-tion without Reference Model.

[74] Shengding Hu, Yuge Tu, Xu Han, Chaoqun He, Ganqu Cui, Xiang Long, Zhi Zheng, Yewei Fang, Yuxiang Huang, Weilin Zhao, Xinrong Zhang, Zheng Leng Thai, Kaihuo Zhang, Chongyi Wang, Yuan Yao, Chenyang Zhao, Jie Zhou, Jie Cai, Zhongwu Zhai, Ning Ding, Chao Jia, Guoyang Zeng, Dahai Li, Zhiyuan Liu, and Maosong Sun. 2024. MiniCPM: Un- veiling the Potential of Small Language Models with Scalable Training Strategies.

[75] Cheng-Zhi Anna Huang, Ashish Vaswani, Jakob Uszkoreit, Noam Shazeer, Ian Simon, Curtis Hawthorne, Andrew M. Dai, Matthew D. Hoffman, Monica Dinculescu, and Douglas Eck. 2018. Music Transformer.

[76] Hamish Ivison, Yizhong Wang, Valentina Pyatkin, Nathan Lambert, Matthew Peters, Pradeep Dasigi, Joel Jang, David Wadden, Noah A. Smith, Iz Beltagy, and Hannaneh Hajishirzi. 2023. Camels in a Changing Climate: Enhancing LM Adaptation with Tulu 2.

[77] Sebastian Jaszczur, Aakanksha Chowdhery, Afroz Mohiuddin, Łukasz Kaiser, Wojciech Gajewski, Henryk Michalewski, and Jonni Kanerva. 2021. Sparse is Enough in Scaling Trans- formers.

[78] Albert Q. Jiang, Alexandre Sablayrolles, Arthur Mensch, Chris Bamford, Devendra Singh Chaplot, Diego de las Casas, Florian Bressand, Gianna Lengyel, Guillaume Lample, Lucile Saulnier, L´elio Renard Lavaud, Marie-Anne Lachaux, Pierre Stock, Teven Le Scao, Thibaut Lavril, Thomas Wang, Timoth´ee Lacroix, and William El Sayed. 2023. Mistral 7B.

<!-- page 33 of 63 -->

[79] Albert Q. Jiang, Alexandre Sablayrolles, Antoine Roux, Arthur Mensch, Blanche Savary, Chris Bamford, Devendra Singh Chaplot, Diego de las Casas, Emma Bou Hanna, Florian Bressand, Gianna Lengyel, Guillaume Bour, Guillaume Lample, L´elio Renard Lavaud, Lu- cile Saulnier, Marie-Anne Lachaux, Pierre Stock, Sandeep Subramanian, Sophia Yang, Szy- mon Antoniak, Teven Le Scao, Th´eophile Gervet, Thibaut Lavril, Thomas Wang, Timoth´ee Lacroix, and William El Sayed. 2024. Mixtral of Experts.

[80] Jared Kaplan, Sam McCandlish, Tom Henighan, Tom B. Brown, Benjamin Chess, Rewon Child, Scott Gray, Alec Radford, Jeffrey Wu, and Dario Amodei. 2020. Scaling Laws for Neural Language Models.

[81] Andrej Karpathy. 2024. LLM model size competition is intensifying... backwards!

[82] Douwe Kiela, Hamed Firooz, Aravind Mohan, Vedanuj Goswami, Amanpreet Singh, Casey A Fitzpatrick, Peter Bull, Greg Lipstein, Tony Nelli, Ron Zhu, et al. 2021. The hateful memes challenge: Competition report.

[83] Diederik P. Kingma and Jimmy Ba. 2017. Adam: A Method for Stochastic Optimization.

[84] Denis Kocetkov, Raymond Li, Loubna Ben Allal, Jia Li, Chenghao Mou, Carlos Mu˜noz Fer-randis, Yacine Jernite, Margaret Mitchell, Sean Hughes, Thomas Wolf, Dzmitry Bahdanau, Leandro von Werra, and Harm de Vries. 2022. The Stack: 3 TB of permissively licensed source code.

[85] Aran Komatsuzaki, Joan Puigcerver, James Lee-Thorp, Carlos Riquelme Ruiz, Basil Mustafa, Joshua Ainslie, Yi Tay, Mostafa Dehghani, and Neil Houlsby. 2023. Sparse Upcycling: Train- ing Mixture-of-Experts from Dense Checkpoints.

[86] Jakub Krajewski, Jan Ludziejewski, Kamil Adamczewski, Maciej Pi´oro, Michał Krutul, Szy-mon Antoniak, Kamil Ciebiera, Krystian Kr´ol, Tomasz Odrzyg´o´zd´z, Piotr Sankowski, Marek Cygan, and Sebastian Jaszczur. 2024. Scaling Laws for Fine-Grained Mixture of Experts.

[87] Nathan Lambert, Jacob Morrison, Valentina Pyatkin, Shengyi Huang, Hamish Ivison, Faeze Brahman, Lester James V. Miranda, Alisa Liu, Nouha Dziri, Shane Lyu, Yuling Gu, Saumya Malik, Victoria Graf, Jena D. Hwang, Jiangjiang Yang, Ronan Le Bras, Oyvind Tafjord, Chris Wilhelm, Luca Soldaini, Noah A. Smith, Yizhong Wang, Pradeep Dasigi, and Hannaneh Hajishirzi. 2025. Tulu 3: Pushing Frontiers in Open Language Model Post-Training.

[88] Dmitry Lepikhin, HyoukJoong Lee, Yuanzhong Xu, Dehao Chen, Orhan Firat, Yanping Huang, Maxim Krikun, Noam Shazeer, and Zhifeng Chen. 2020. GShard: Scaling Giant Models with Conditional Computation and Automatic Sharding.

[89] Mike Lewis, Shruti Bhosale, Tim Dettmers, Naman Goyal, and Luke Zettlemoyer. 2021. BASE Layers: Simplifying Training of Large, Sparse Models.

[90] Jeffrey Li, Alex Fang, Georgios Smyrnis, Maor Ivgi, Matt Jordan, Samir Gadre, Hritik Bansal, Etash Guha, Sedrick Keh, Kushal Arora, Saurabh Garg, Rui Xin, Niklas Muen- nighoff, Reinhard Heckel, Jean Mercat, Mayee Chen, Suchin Gururangan, Mitchell Worts- man, Alon Albalak, Yonatan Bitton, Marianna Nezhurina, Amro Abbas, Cheng-Yu Hsieh, Dhruba Ghosh, Josh Gardner, Maciej Kilian, Hanlin Zhang, Rulin Shao, Sarah Pratt, Sunny Sanyal, Gabriel Ilharco, Giannis Daras, Kalyani Marathe, Aaron Gokaslan, Jieyu Zhang, Khyathi Chandu, Thao Nguyen, Igor Vasiljevic, Sham Kakade, Shuran Song, Sujay Sang- havi, Fartash Faghri, Sewoong Oh, Luke Zettlemoyer, Kyle Lo, Alaaeldin El-Nouby, Hadi Pouransari, Alexander Toshev, Stephanie Wang, Dirk Groeneveld, Luca Soldaini, Pang Wei Koh, Jenia Jitsev, Thomas Kollar, Alexandros G. Dimakis, Yair Carmon, Achal Dave, Lud- wig Schmidt, and Vaishaal Shankar. 2024. DataComp-LM: In search of the next generation of training sets for language models.

[91] Margaret Li, Suchin Gururangan, Tim Dettmers, Mike Lewis, Tim Althoff, Noah A. Smith, and Luke Zettlemoyer. 2022. Branch-Train-Merge: Embarrassingly Parallel Training of Ex- pert Language Models.

<!-- page 34 of 63 -->

[92] Raymond Li, Loubna Ben Allal, Yangtian Zi, Niklas Muennighoff, Denis Kocetkov, Cheng-hao Mou, Marc Marone, Christopher Akiki, Jia Li, Jenny Chim, et al. 2023. StarCoder: may the source be with you!

[93] Xuechen Li, Tianyi Zhang, Yann Dubois, Rohan Taori, Ishaan Gulrajani, Carlos Guestrin, Percy Liang, and Tatsunori B. Hashimoto. 2023. AlpacaEval: An Automatic Evaluator of Instruction-following Models.

[94] Yuanzhi Li, S´ebastien Bubeck, Ronen Eldan, Allie Del Giorno, Suriya Gunasekar, and Yin Tat Lee. 2023. Textbooks Are All You Need II: phi-1.5 technical report.

[95] Yunxin Li, Shenyuan Jiang, Baotian Hu, Longyue Wang, Wanqi Zhong, Wenhan Luo, Lin Ma, and Min Zhang. 2024. Uni-MoE: Scaling Unified Multimodal LLMs with Mixture of Experts.

[96] Percy Liang, Rishi Bommasani, Tony Lee, Dimitris Tsipras, Dilara Soylu, Michihiro Ya-sunaga, Yian Zhang, Deepak Narayanan, Yuhuai Wu, Ananya Kumar, Benjamin Newman, Binhang Yuan, Bobby Yan, Ce Zhang, Christian Cosgrove, Christopher D. Manning, Christo- pher R´e, Diana Acosta-Navas, Drew A. Hudson, Eric Zelikman, Esin Durmus, Faisal Lad- hak, Frieda Rong, Hongyu Ren, Huaxiu Yao, Jue Wang, Keshav Santhanam, Laurel Orr, Lucia Zheng, Mert Yuksekgonul, Mirac Suzgun, Nathan Kim, Neel Guha, Niladri Chatterji, Omar Khattab, Peter Henderson, Qian Huang, Ryan Chi, Sang Michael Xie, Shibani San- turkar, Surya Ganguli, Tatsunori Hashimoto, Thomas Icard, Tianyi Zhang, Vishrav Chaud- hary, William Wang, Xuechen Li, Yifan Mai, Yuhui Zhang, and Yuta Koreeda. 2023. Holistic Evaluation of Language Models.

[97] Opher Lieber, Barak Lenz, Hofit Bata, Gal Cohen, Jhonathan Osin, Itay Dalmedigos, Erez Safahi, Shaked Meirom, Yonatan Belinkov, Shai Shalev-Shwartz, Omri Abend, Raz Alon, Tomer Asida, Amir Bergman, Roman Glozman, Michael Gokhman, Avashalom Manevich, Nir Ratner, Noam Rozen, Erez Shwartz, Mor Zusman, and Yoav Shoham. 2024. Jamba: A Hybrid Transformer-Mamba Language Model.

[98] Bin Lin, Zhenyu Tang, Yang Ye, Jiaxi Cui, Bin Zhu, Peng Jin, Jinfa Huang, Junwu Zhang, Yatian Pang, Munan Ning, and Li Yuan. 2024. MoE-LLaVA: Mixture of Experts for Large Vision-Language Models.

[99] Stephanie Lin, Jacob Hilton, and Owain Evans. 2022. TruthfulQA: Measuring How Models Mimic Human Falsehoods.

[100] Xi Victoria Lin, Akshat Shrivastava, Liang Luo, Srinivasan Iyer, Mike Lewis, Gargi Gosh, Luke Zettlemoyer, and Armen Aghajanyan. 2024. MoMa: Efficient Early-Fusion Pre-training with Mixture of Modality-Aware Experts.

[101] Qian Liu, Xiaosen Zheng, Niklas Muennighoff, Guangtao Zeng, Longxu Dou, Tianyu Pang, Jing Jiang, and Min Lin. 2024. RegMix: Data Mixture as Regression for Language Model Pre-training.

[102] Tianlin Liu, Mathieu Blondel, Carlos Riquelme, and Joan Puigcerver. 2024. Routers in Vision Mixture of Experts: An Empirical Study.

[103] Zhengzhong Liu, Aurick Qiao, Willie Neiswanger, Hongyi Wang, Bowen Tan, Tianhua Tao, Junbo Li, Yuqi Wang, Suqi Sun, Omkar Pangarkar, Richard Fan, Yi Gu, Victor Miller, Yong- hao Zhuang, Guowei He, Haonan Li, Fajri Koto, Liping Tang, Nikhil Ranjan, Zhiqiang Shen, Xuguang Ren, Roberto Iriondo, Cun Mu, Zhiting Hu, Mark Schulze, Preslav Nakov, Tim Baldwin, and Eric P. Xing. 2023. LLM360: Towards Fully Transparent Open-Source LLMs.

[104] Shayne Longpre, Le Hou, Tu Vu, Albert Webson, Hyung Won Chung, Yi Tay, Denny Zhou, Quoc V. Le, Barret Zoph, Jason Wei, and Adam Roberts. 2023. The Flan Collection: Design- ing Data and Methods for Effective Instruction Tuning.

[105] Shayne Longpre, Robert Mahari, Anthony Chen, Naana Obeng-Marnu, Damien Sileo, William Brannon, Niklas Muennighoff, Nathan Khazam, Jad Kabbara, Kartik Perisetla, Xinyi Wu, Enrico Shippole, Kurt Bollacker, Tongshuang Wu, Luis Villa, Sandy Pentland, and Sara

<!-- page 35 of 63 -->

Hooker. 2023. The Data Provenance Initiative: A Large Scale Audit of Dataset Licensing & Attribution in AI.

[106] Shayne Longpre, Robert Mahari, Ariel Lee, Campbell Lund, Hamidah Oderinwale, William Brannon, Nayan Saxena, Naana Obeng-Marnu, Tobin South, Cole Hunter, Kevin Kly- man, Christopher Klamm, Hailey Schoelkopf, Nikhil Singh, Manuel Cherep, Ahmad Anis, An Dinh, Caroline Chitongo, Da Yin, Damien Sileo, Deividas Mataciunas, Diganta Misra, Emad Alghamdi, Enrico Shippole, Jianguo Zhang, Joanna Materzynska, Kun Qian, Kush Ti- wary, Lester Miranda, Manan Dey, Minnie Liang, Mohammed Hamdy, Niklas Muennighoff, Seonghyeon Ye, Seungone Kim, Shrestha Mohanty, Vipul Gupta, Vivek Sharma, Vu Minh Chien, Xuhui Zhou, Yizhi Li, Caiming Xiong, Luis Villa, Stella Biderman, Hanlin Li, Daphne Ippolito, Sara Hooker, Jad Kabbara, and Sandy Pentland. 2024. Consent in Crisis: The Rapid Decline of the AI Data Commons.

[107] Ilya Loshchilov and Frank Hutter. 2019. Decoupled Weight Decay Regularization.

[108] Holy Lovenia, Rahmad Mahendra, Salsabil Maulana Akbar, Lester James V. Miranda, Jen-nifer Santoso, Elyanah Aco, Akhdan Fadhilah, Jonibek Mansurov, Joseph Marvin Imperial, Onno P. Kampman, Joel Ruben Antony Moniz, Muhammad Ravi Shulthan Habibi, Frederikus Hudi, Railey Montalan, Ryan Ignatius, Joanito Agili Lopo, William Nixon, B¨orje F. Karlsson, James Jaya, Ryandito Diandaru, Yuze Gao, Patrick Amadeus, Bin Wang, Jan Christian Blaise Cruz, Chenxi Whitehouse, Ivan Halim Parmonangan, Maria Khelli, Wenyu Zhang, Lucky Susanto, Reynard Adha Ryanda, Sonny Lazuardi Hermawan, Dan John Velasco, Muhammad Dehan Al Kautsar, Willy Fitra Hendria, Yasmin Moslem, Noah Flynn, Muhammad Farid Adilazuarda, Haochen Li, Johanes Lee, R. Damanhuri, Shuo Sun, Muhammad Reza Qorib, Amirbek Djanibekov, Wei Qi Leong, Quyet V. Do, Niklas Muennighoff, Tanrada Pansuwan, Ilham Firdausi Putra, Yan Xu, Ngee Chia Tai, Ayu Purwarianti, Sebastian Ruder, William Tjhi, Peerat Limkonchotiwat, Alham Fikri Aji, Sedrick Keh, Genta Indra Winata, Ruochen Zhang, Fajri Koto, Zheng-Xin Yong, and Samuel Cahyawijaya. 2024. SEACrowd: A Multi- lingual Multimodal Data Hub and Benchmark Suite for Southeast Asian Languages.

[109] Anton Lozhkov, Raymond Li, Loubna Ben Allal, Federico Cassano, Joel Lamy-Poirier, Nouamane Tazi, Ao Tang, Dmytro Pykhtar, Jiawei Liu, Yuxiang Wei, Tianyang Liu, Max Tian, Denis Kocetkov, Arthur Zucker, Younes Belkada, Zijian Wang, Qian Liu, Dmitry Ab- ulkhanov, Indraneil Paul, Zhuang Li, Wen-Ding Li, Megan Risdal, Jia Li, Jian Zhu, Terry Yue Zhuo, Evgenii Zheltonozhskii, Nii Osae Osae Dade, Wenhao Yu, Lucas Krauß, Naman Jain, Yixuan Su, Xuanli He, Manan Dey, Edoardo Abati, Yekun Chai, Niklas Muennighoff, Xian- gru Tang, Muhtasham Oblokulov, Christopher Akiki, Marc Marone, Chenghao Mou, Mayank Mishra, Alex Gu, Binyuan Hui, Tri Dao, Armel Zebaze, Olivier Dehaene, Nicolas Patry, Can- wen Xu, Julian McAuley, Han Hu, Torsten Scholak, Sebastien Paquet, Jennifer Robinson, Carolyn Jane Anderson, Nicolas Chapados, Mostofa Patwary, Nima Tajbakhsh, Yacine Jer- nite, Carlos Mu˜noz Ferrandis, Lingming Zhang, Sean Hughes, Thomas Wolf, Arjun Guha, Leandro von Werra, and Harm de Vries. 2024. StarCoder 2 and The Stack v2: The Next Generation.

[110] Risto Luukkonen, Ville Komulainen, Jouni Luoma, Anni Eskelinen, Jenna Kanerva, Hanna-Mari Kupari, Filip Ginter, Veronika Laippala, Niklas Muennighoff, Aleksandra Piktus, Thomas Wang, Nouamane Tazi, Teven Le Scao, Thomas Wolf, Osma Suominen, Samuli Sairanen, Mikko Merioksa, Jyrki Heinonen, Aija Vahtola, Samuel Antao, and Sampo Pyysalo. 2023. FinGPT: Large Generative Models for a Small Language.

[111] Ian Magnusson, Akshita Bhagia, Valentin Hofmann, Luca Soldaini, Ananya Harsh Jha, Oyvind Tafjord, Dustin Schwenk, Evan Pete Walsh, Yanai Elazar, Kyle Lo, Dirk Groeneveld, Iz Beltagy, Hannaneh Hajishirzi, Noah A. Smith, Kyle Richardson, and Jesse Dodge. 2023. Paloma: A Benchmark for Evaluating Language Model Fit.

[112] Brandon McKinzie, Zhe Gan, Jean-Philippe Fauconnier, Sam Dodge, Bowen Zhang, Philipp Dufter, Dhruti Shah, Xianzhi Du, Futang Peng, Floris Weers, Anton Belyi, Haotian Zhang, Karanjeet Singh, Doug Kang, Ankur Jain, Hongyu H`e, Max Schwarzer, Tom Gunter, Xiang Kong, Aonan Zhang, Jianyu Wang, Chong Wang, Nan Du, Tao Lei, Sam Wiseman, Guoli Yin, Mark Lee, Zirui Wang, Ruoming Pang, Peter Grasch, Alexander Toshev, and Yinfei Yang. 2024. MM1: Methods, Analysis & Insights from Multimodal LLM Pre-training.

<!-- page 36 of 63 -->

[113] Sachin Mehta, Mohammad Hossein Sekhavat, Qingqing Cao, Maxwell Horton, Yanzi Jin, Chenfan Sun, Iman Mirzadeh, Mahyar Najibi, Dmitry Belenko, Peter Zatloukal, and Moham- mad Rastegari. 2024. OpenELM: An Efficient Language Model Family with Open Training and Inference Framework.

[114] Yu Meng, Mengzhou Xia, and Danqi Chen. 2024. SimPO: Simple Preference Optimization with a Reference-Free Reward.

[115] Stephen Merity, Caiming Xiong, James Bradbury, and Richard Socher. 2016. Pointer Sentinel Mixture Models.

[116] Paulius Micikevicius, Sharan Narang, Jonah Alben, Gregory Diamos, Erich Elsen, David Garcia, Boris Ginsburg, Michael Houston, Oleksii Kuchaiev, Ganesh Venkatesh, and Hao Wu. 2018. Mixed Precision Training.

[117] Todor Mihaylov, Peter Clark, Tushar Khot, and Ashish Sabharwal. 2018. Can a Suit of Armor Conduct Electricity? A New Dataset for Open Book Question Answering.

[118] Swaroop Mishra, Daniel Khashabi, Chitta Baral, and Hannaneh Hajishirzi. 2022. Cross-Task Generalization via Natural Language Crowdsourcing Instructions.

[119] Niklas Muennighoff. 2020. Vilio: State-of-the-art Visio-Linguistic Models applied to Hateful Memes.

[120] Niklas Muennighoff, Qian Liu, Armel Zebaze, Qinkai Zheng, Binyuan Hui, Terry Yue Zhuo, Swayam Singh, Xiangru Tang, Leandro von Werra, and Shayne Longpre. 2023. OctoPack: Instruction Tuning Code Large Language Models.

[121] Niklas Muennighoff, Alexander M. Rush, Boaz Barak, Teven Le Scao, Aleksandra Piktus, Nouamane Tazi, Sampo Pyysalo, Thomas Wolf, and Colin Raffel. 2023. Scaling Data- Constrained Language Models.

[122] Niklas Muennighoff, Hongjin Su, Liang Wang, Nan Yang, Furu Wei, Tao Yu, Amanpreet Singh, and Douwe Kiela. 2024. Generative Representational Instruction Tuning.

[123] Niklas Muennighoff, Thomas Wang, Lintang Sutawika, Adam Roberts, Stella Biderman, Teven Le Scao, M Saiful Bari, Sheng Shen, Zheng-Xin Yong, Hailey Schoelkopf, Xiangru Tang, Dragomir Radev, Alham Fikri Aji, Khalid Almubarak, Samuel Albanie, Zaid Alyafeai, Albert Webson, Edward Raff, and Colin Raffel. 2023. Crosslingual Generalization through Multitask Finetuning.

[124] Mohammed Muqeeth, Haokun Liu, and Colin Raffel. 2024. Soft Merging of Experts with Adaptive Routing.

[125] Basil Mustafa, Carlos Riquelme, Joan Puigcerver, Rodolphe Jenatton, and Neil Houlsby. 2022. Multimodal Contrastive Learning with LIMoE: the Language-Image Mixture of Ex- perts.

[126] Nvidia, :, Bo Adler, Niket Agarwal, Ashwath Aithal, Dong H. Anh, Pallab Bhattacharya, An-nika Brundyn, Jared Casper, Bryan Catanzaro, Sharon Clay, Jonathan Cohen, Sirshak Das, Ayush Dattagupta, Olivier Delalleau, Leon Derczynski, Yi Dong, Daniel Egert, Ellie Evans, Aleksander Ficek, Denys Fridman, Shaona Ghosh, Boris Ginsburg, Igor Gitman, Tomasz Grzegorzek, Robert Hero, Jining Huang, Vibhu Jawa, Joseph Jennings, Aastha Jhunjhun- wala, John Kamalu, Sadaf Khan, Oleksii Kuchaiev, Patrick LeGresley, Hui Li, Jiwei Liu, Zi- han Liu, Eileen Long, Ameya Sunil Mahabaleshwarkar, Somshubra Majumdar, James Maki, Miguel Martinez, Maer Rodrigues de Melo, Ivan Moshkov, Deepak Narayanan, Sean Nar- enthiran, Jesus Navarro, Phong Nguyen, Osvald Nitski, Vahid Noroozi, Guruprasad Nutheti, Christopher Parisien, Jupinder Parmar, Mostofa Patwary, Krzysztof Pawelec, Wei Ping, Shri- mai Prabhumoye, Rajarshi Roy, Trisha Saar, Vasanth Rao Naik Sabavat, Sanjeev Satheesh, Jane Polak Scowcroft, Jason Sewall, Pavel Shamis, Gerald Shen, Mohammad Shoeybi, Dave Sizer, Misha Smelyanskiy, Felipe Soares, Makesh Narsimhan Sreedhar, Dan Su, Sandeep Subramanian, Shengyang Sun, Shubham Toshniwal, Hao Wang, Zhilin Wang, Jiaxuan You, Jiaqi Zeng, Jimmy Zhang, Jing Zhang, Vivienne Zhang, Yian Zhang, and Chen Zhu. 2024. Nemotron-4 340B Technical Report.

<!-- page 37 of 63 -->

[127] Team OLMo, Pete Walsh, Luca Soldaini, Dirk Groeneveld, Kyle Lo, Shane Arora, Akshita Bhagia, Yuling Gu, Shengyi Huang, Matt Jordan, Nathan Lambert, Dustin Schwenk, Oyvind Tafjord, Taira Anderson, David Atkinson, Faeze Brahman, Christopher Clark, Pradeep Dasigi, Nouha Dziri, Michal Guerquin, Hamish Ivison, Pang Wei Koh, Jiacheng Liu, Saumya Malik, William Merrill, Lester James Validad Miranda, Jacob Daniel Morrison, Tyler C. Mur- ray, Crystal Nam, Valentina Pyatkin, Aman Rangapur, Michael Schmitz, Sam Skjonsberg, David Wadden, Chris Wilhelm, Michael Wilson, Luke S. Zettlemoyer, Ali Farhadi, Noah A. Smith, and Hanna Hajishirzi. 2024. 2 OLMo 2 Furious. arXiv preprint.

[128] OpenAI, Josh Achiam, Steven Adler, Sandhini Agarwal, Lama Ahmad, Ilge Akkaya, Floren-cia Leoni Aleman, Diogo Almeida, Janko Altenschmidt, Sam Altman, et al. 2023. GPT-4 Technical Report.

[129] Bowen Pan, Yikang Shen, Haokun Liu, Mayank Mishra, Gaoyuan Zhang, Aude Oliva, Colin Raffel, and Rameswar Panda. 2024. Dense Training, Sparse Inference: Rethinking Training of Mixture-of-Experts Language Models.

[130] Jupinder Parmar, Shrimai Prabhumoye, Joseph Jennings, Mostofa Patwary, Sandeep Subra-manian, Dan Su, Chen Zhu, Deepak Narayanan, Aastha Jhunjhunwala, Ayush Dattagupta, Vibhu Jawa, Jiwei Liu, Ameya Mahabaleshwarkar, Osvald Nitski, Annika Brundyn, James Maki, Miguel Martinez, Jiaxuan You, John Kamalu, Patrick LeGresley, Denys Fridman, Jared Casper, Ashwath Aithal, Oleksii Kuchaiev, Mohammad Shoeybi, Jonathan Cohen, and Bryan Catanzaro. 2024. Nemotron-4 15B Technical Report.

[131] Keiran Paster, Marco Dos Santos, Zhangir Azerbayev, and Jimmy Ba. 2023. OpenWebMath: An Open Dataset of High-Quality Mathematical Web Text.

[132] Guilherme Penedo, Quentin Malartic, Daniel Hesslow, Ruxandra Cojocaru, Alessandro Cap-pelli, Hamza Alobeidli, Baptiste Pannier, Ebtesam Almazrouei, and Julien Launay. 2023. The RefinedWeb Dataset for Falcon LLM: Outperforming Curated Corpora with Web Data, and Web Data Only.

[133] Bo Peng, Eric Alcaide, Quentin Anthony, Alon Albalak, Samuel Arcadinho, Stella Bider-man, Huanqi Cao, Xin Cheng, Michael Chung, Matteo Grella, Kranthi Kiran GV, Xuzheng He, Haowen Hou, Jiaju Lin, Przemyslaw Kazienko, Jan Kocon, Jiaming Kong, Bartlomiej Koptyra, Hayden Lau, Krishna Sri Ipsit Mantri, Ferdinand Mom, Atsushi Saito, Guangyu Song, Xiangru Tang, Bolun Wang, Johan S. Wind, Stanislaw Wozniak, Ruichong Zhang, Zhenyuan Zhang, Qihang Zhao, Peng Zhou, Qinghua Zhou, Jian Zhu, and Rui-Jie Zhu. 2023. RWKV: Reinventing RNNs for the Transformer Era.

[134] Bo Peng, Daniel Goldstein, Quentin Anthony, Alon Albalak, Eric Alcaide, Stella Biderman, Eugene Cheah, Xingjian Du, Teddy Ferdinan, Haowen Hou, Przemysław Kazienko, Kran- thi Kiran GV, Jan Koco´n, Bartłomiej Koptyra, Satyapriya Krishna, Ronald McClelland Jr. au2, Niklas Muennighoff, Fares Obeid, Atsushi Saito, Guangyu Song, Haoqin Tu, Stanisław Wo´zniak, Ruichong Zhang, Bingchen Zhao, Qihang Zhao, Peng Zhou, Jian Zhu, and Rui-Jie Zhu. 2024. Eagle and Finch: RWKV with Matrix-Valued States and Dynamic Recurrence.

[135] Ofir Press and Lior Wolf. 2017. Using the Output Embedding to Improve Language Models.

[136] Alec Radford, Jong Wook Kim, Tao Xu, Greg Brockman, Christine McLeavey, and Ilya Sutskever. 2022. Robust Speech Recognition via Large-Scale Weak Supervision.

[137] Alec Radford, Jeffrey Wu, Rewon Child, David Luan, Dario Amodei, Ilya Sutskever, et al. 2019. Language models are unsupervised multitask learners.

[138] Rafael Rafailov, Archit Sharma, Eric Mitchell, Stefano Ermon, Christopher D. Manning, and Chelsea Finn. 2023. Direct Preference Optimization: Your Language Model is Secretly a Reward Model.

[139] Colin Raffel, Noam Shazeer, Adam Roberts, Katherine Lee, Sharan Narang, Michael Matena, Yanqi Zhou, Wei Li, and Peter J. Liu. 2023. Exploring the Limits of Transfer Learning with a Unified Text-to-Text Transformer.

<!-- page 38 of 63 -->

[140] Nazneen Rajani, Lewis Tunstall, Edward Beeching, Nathan Lambert, Alexander M. Rush, and Thomas Wolf. 2023. No Robots.

[141] Samyam Rajbhandari, Conglong Li, Zhewei Yao, Minjia Zhang, Reza Yazdani Aminabadi, Ammar Ahmad Awan, Jeff Rasley, and Yuxiong He. 2022. DeepSpeed-MoE: Advancing Mixture-of-Experts Inference and Training to Power Next-Generation AI Scale.

[142] Samyam Rajbhandari, Jeff Rasley, Olatunji Ruwase, and Yuxiong He. 2020. ZeRO: Memory Optimizations Toward Training Trillion Parameter Models.

[143] David Raposo, Sam Ritter, Blake Richards, Timothy Lillicrap, Peter Conway Humphreys, and Adam Santoro. 2024. Mixture-of-Depths: Dynamically allocating compute in transformer- based language models.

[144] Machel Reid, Victor Zhong, Suchin Gururangan, and Luke Zettlemoyer. 2022. M2D2: A Massively Multi-domain Language Modeling Dataset.

[145] Xiaozhe Ren, Pingyi Zhou, Xinfan Meng, Xinjing Huang, Yadao Wang, Weichao Wang, Pengfei Li, Xiaoda Zhang, Alexander Podolskiy, Grigory Arshinov, Andrey Bout, Irina Pio- ntkovskaya, Jiansheng Wei, Xin Jiang, Teng Su, Qun Liu, and Jun Yao. 2023. PanGu-Sigma: Towards Trillion Parameter Language Model with Sparse Heterogeneous Computing.

[146] Stephen Roller, Sainbayar Sukhbaatar, Arthur Szlam, and Jason Weston. 2021. Hash Layers For Large Sparse Models.

[147] Paul R¨ottger, Hannah Rose Kirk, Bertie Vidgen, Giuseppe Attanasio, Federico Bianchi, and Dirk Hovy. 2024. XSTest: A Test Suite for Identifying Exaggerated Safety Behaviours in Large Language Models.

[148] Keisuke Sakaguchi, Ronan Le Bras, Chandra Bhagavatula, and Yejin Choi. 2019. Wino-Grande: An Adversarial Winograd Schema Challenge at Scale.

[149] Victor Sanh, Albert Webson, Colin Raffel, Stephen H. Bach, Lintang Sutawika, Zaid Alyafeai, Antoine Chaffin, Arnaud Stiegler, Teven Le Scao, Arun Raja, et al. 2022. Mul- titask Prompted Training Enables Zero-Shot Task Generalization.

[150] Maarten Sap, Hannah Rashkin, Derek Chen, Ronan LeBras, and Yejin Choi. 2019. So- cialIQA: Commonsense Reasoning about Social Interactions.

[151] Teven Le Scao, Thomas Wang, Daniel Hesslow, Lucile Saulnier, Stas Bekman, M Saiful Bari, Stella Biderman, Hady Elsahar, Niklas Muennighoff, Jason Phang, Ofir Press, Colin Raffel, Victor Sanh, Sheng Shen, Lintang Sutawika, Jaesung Tae, Zheng Xin Yong, Julien Launay, and Iz Beltagy. 2022. What Language Model to Train if You Have One Million GPU Hours?

[152] Noam Shazeer. 2019. Fast Transformer Decoding: One Write-Head is All You Need.

[153] Noam Shazeer. 2020. GLU Variants Improve Transformer.

[154] Noam Shazeer, Azalia Mirhoseini, Krzysztof Maziarz, Andy Davis, Quoc Le, Geoffrey Hinton, and Jeff Dean. 2017. Outrageously Large Neural Networks: The Sparsely-Gated Mixture-of-Experts Layer.

[155] Noam Shazeer and Mitchell Stern. 2018. Adafactor: Adaptive Learning Rates with Sublinear Memory Cost.

[156] Sheng Shen, Le Hou, Yanqi Zhou, Nan Du, Shayne Longpre, Jason Wei, Hyung Won Chung, Barret Zoph, William Fedus, Xinyun Chen, Tu Vu, Yuexin Wu, Wuyang Chen, Albert Web- son, Yunxuan Li, Vincent Zhao, Hongkun Yu, Kurt Keutzer, Trevor Darrell, and Denny Zhou. 2023. Mixture-of-Experts Meets Instruction Tuning:A Winning Combination for Large Lan- guage Models.

[157] Sheng Shen, Zhewei Yao, Chunyuan Li, Trevor Darrell, Kurt Keutzer, and Yuxiong He. 2023. Scaling Vision-Language Models with Sparse Mixture of Experts.

<!-- page 39 of 63 -->

[158] Yikang Shen, Zhen Guo, Tianle Cai, and Zengyi Qin. 2024. JetMoE: Reaching Llama2 Performance with 0.1M Dollars.

[159] Mohammad Shoeybi, Mostofa Patwary, Raul Puri, Patrick LeGresley, Jared Casper, and Bryan Catanzaro. 2020. Megatron-LM: Training Multi-Billion Parameter Language Mod- els Using Model Parallelism.

[160] Shivalika Singh, Freddie Vargus, Daniel Dsouza, B¨orje F. Karlsson, Abinaya Mahendiran, Wei-Yin Ko, Herumb Shandilya, Jay Patel, Deividas Mataciunas, Laura OMahony, Mike Zhang, Ramith Hettiarachchi, Joseph Wilson, Marina Machado, Luisa Souza Moura, Do- minik Krzemi´nski, Hakimeh Fadaei, Irem Erg¨un, Ifeoma Okoh, Aisha Alaagib, Oshan Mu- dannayake, Zaid Alyafeai, Vu Minh Chien, Sebastian Ruder, Surya Guthikonda, Emad A. Alghamdi, Sebastian Gehrmann, Niklas Muennighoff, Max Bartolo, Julia Kreutzer, Ahmet ¨Ust¨un, Marzieh Fadaee, and Sara Hooker. 2024. Aya Dataset: An Open-Access Collection for Multilingual Instruction Tuning.

[161] Snowflake. 2024. Snowflake Arctic Cookbook Series: Exploring Mixture of Experts (MoE).

[162] Snowflake. 2024. Snowflake Arctic: The Best LLM for Enterprise AI — Efficiently Intelli-gent, Truly Open.

[163] Luca Soldaini, Rodney Kinney, Akshita Bhagia, Dustin Schwenk, David Atkinson, Russell Authur, Ben Bogin, Khyathi Chandu, Jennifer Dumas, Yanai Elazar, Valentin Hofmann, Ananya Harsh Jha, Sachin Kumar, Li Lucy, Xinxi Lyu, Nathan Lambert, Ian Magnusson, Jacob Morrison, Niklas Muennighoff, Aakanksha Naik, Crystal Nam, Matthew E. Peters, Abhilasha Ravichander, Kyle Richardson, Zejiang Shen, Emma Strubell, Nishant Subramani, Oyvind Tafjord, Pete Walsh, Luke Zettlemoyer, Noah A. Smith, Hannaneh Hajishirzi, Iz Belt- agy, Dirk Groeneveld, Jesse Dodge, and Kyle Lo. 2024. Dolma: an Open Corpus of Three Trillion Tokens for Language Model Pretraining Research.

[164] Luca Soldaini and Kyle Lo. 2023. peS2o (Pretraining Efficiently on S2ORC) Dataset.

[165] Guijin Son, Hanwool Lee, Sungdong Kim, Seungone Kim, Niklas Muennighoff, Taekyoon Choi, Cheonbok Park, Kang Min Yoo, and Stella Biderman. 2024. KMMLU: Measuring Massive Multitask Language Understanding in Korean.

[166] Jianlin Su, Yu Lu, Shengfeng Pan, Ahmed Murtadha, Bo Wen, and Yunfeng Liu. 2023. Ro-Former: Enhanced Transformer with Rotary Position Embedding.

[167] Weijie Su, Xizhou Zhu, Yue Cao, Bin Li, Lewei Lu, Furu Wei, and Jifeng Dai. 2020. VL-BERT: Pre-training of Generic Visual-Linguistic Representations.

[168] Sainbayar Sukhbaatar, Olga Golovneva, Vasu Sharma, Hu Xu, Xi Victoria Lin, Baptiste Rozi`ere, Jacob Kahn, Daniel Li, Wen tau Yih, Jason Weston, and Xian Li. 2024. Branch- Train-MiX: Mixing Expert LLMs into a Mixture-of-Experts LLM.

[169] Mirac Suzgun, Nathan Scales, Nathanael Sch¨arli, Sebastian Gehrmann, Yi Tay, Hyung Won Chung, Aakanksha Chowdhery, Quoc V. Le, Ed H. Chi, Denny Zhou, and Jason Wei. 2022. Challenging BIG-Bench Tasks and Whether Chain-of-Thought Can Solve Them.

[170] Alon Talmor, Jonathan Herzig, Nicholas Lourie, and Jonathan Berant. 2019. Common- senseQA: A Question Answering Challenge Targeting Commonsense Knowledge.

[171] Shawn Tan, Yikang Shen, Zhenfang Chen, Aaron Courville, and Chuang Gan. 2023. Sparse Universal Transformer.

[172] Chaofan Tao, Qian Liu, Longxu Dou, Niklas Muennighoff, Zhongwei Wan, Ping Luo, Min Lin, and Ngai Wong. 2024. Scaling Laws with Vocabulary: Larger Models Deserve Larger Vocabularies.

[173] Chameleon Team. 2024. Chameleon: Mixed-Modal Early-Fusion Foundation Models.

[174] Gemini Team, Rohan Anil, Sebastian Borgeaud, Yonghui Wu, Jean-Baptiste Alayrac, Jiahui Yu, Radu Soricut, Johan Schalkwyk, Andrew M. Dai, Anja Hauth, et al. 2023. Gemini: A Family of Highly Capable Multimodal Models.

<!-- page 40 of 63 -->

[175] Gemini Team, Petko Georgiev, Ving Ian Lei, Ryan Burnell, Libin Bai, Anmol Gulati, Gar-rett Tanzer, Damien Vincent, Zhufeng Pan, Shibo Wang, Soroosh Mariooryad, Yifan Ding, Xinyang Geng, Fred Alcober, Roy Frostig, Mark Omernick, Lexi Walker, Cosmin Paduraru, Christina Sorokin, Andrea Tacchetti, Colin Gaffney, Samira Daruki, Olcan Sercinoglu, Zach Gleicher, Juliette Love, Paul Voigtlaender, Rohan Jain, et al. 2024. Gemini 1.5: Unlocking multimodal understanding across millions of tokens of context.

[176] Gemma Team, Thomas Mesnard, Cassidy Hardin, Robert Dadashi, Surya Bhupatiraju, Shreya Pathak, Laurent Sifre, Morgane Rivi`ere, Mihir Sanjay Kale, Juliette Love, Pouya Tafti, L´eonard Hussenot, Pier Giuseppe Sessa, Aakanksha Chowdhery, Adam Roberts, Aditya Barua, Alex Botev, Alex Castro-Ros, Ambrose Slone, Am´elie H´eliou, Andrea Tacchetti, Anna Bulanova, Antonia Paterson, Beth Tsai, Bobak Shahriari, Charline Le Lan, Christo- pher A. Choquette-Choo, Cl´ement Crepy, Daniel Cer, Daphne Ippolito, David Reid, Elena Buchatskaya, Eric Ni, Eric Noland, Geng Yan, George Tucker, George-Christian Muraru, Grigory Rozhdestvenskiy, Henryk Michalewski, Ian Tenney, Ivan Grishchenko, Jacob Austin, James Keeling, Jane Labanowski, Jean-Baptiste Lespiau, Jeff Stanway, Jenny Brennan, Jeremy Chen, Johan Ferret, Justin Chiu, Justin Mao-Jones, Katherine Lee, Kathy Yu, Katie Millican, Lars Lowe Sjoesund, Lisa Lee, Lucas Dixon, Machel Reid, Maciej Mikuła, Mateo Wirth, Michael Sharman, Nikolai Chinaev, Nithum Thain, Olivier Bachem, Oscar Chang, Oscar Wahltinez, Paige Bailey, Paul Michel, Petko Yotov, Rahma Chaabouni, Ramona Co- manescu, Reena Jana, Rohan Anil, Ross McIlroy, Ruibo Liu, Ryan Mullins, Samuel L Smith, Sebastian Borgeaud, Sertan Girgin, Sholto Douglas, Shree Pandya, Siamak Shakeri, Soham De, Ted Klimenko, Tom Hennigan, Vlad Feinberg, Wojciech Stokowiec, Yu hui Chen, Za- farali Ahmed, Zhitao Gong, Tris Warkentin, Ludovic Peran, Minh Giang, Cl´ement Farabet, Oriol Vinyals, Jeff Dean, Koray Kavukcuoglu, Demis Hassabis, Zoubin Ghahramani, Dou- glas Eck, Joelle Barral, Fernando Pereira, Eli Collins, Armand Joulin, Noah Fiedel, Evan Senter, Alek Andreev, and Kathleen Kenealy. 2024. Gemma: Open Models Based on Gemini Research and Technology.

[177] Gemma Team, Morgane Riviere, Shreya Pathak, Pier Giuseppe Sessa, Cassidy Hardin, Surya Bhupatiraju, L´eonard Hussenot, Thomas Mesnard, Bobak Shahriari, Alexandre Ram´e, Johan Ferret, Peter Liu, Pouya Tafti, Abe Friesen, et al. 2024. Gemma 2: Improving Open Language Models at a Practical Size.

[178] Jamba Team, Barak Lenz, Alan Arazi, Amir Bergman, Avshalom Manevich, Barak Peleg, Ben Aviram, Chen Almagor, Clara Fridman, Dan Padnos, Daniel Gissin, Daniel Jannai, Dor Muhlgay, Dor Zimberg, Edden M Gerber, Elad Dolev, Eran Krakovsky, Erez Safahi, Erez Schwartz, Gal Cohen, Gal Shachaf, Haim Rozenblum, Hofit Bata, Ido Blass, Inbal Ma- gar, Itay Dalmedigos, Jhonathan Osin, Julie Fadlon, Maria Rozman, Matan Danos, Michael Gokhman, Mor Zusman, Naama Gidron, Nir Ratner, Noam Gat, Noam Rozen, Oded Fried, Ohad Leshno, Omer Antverg, Omri Abend, Opher Lieber, Or Dagan, Orit Cohavi, Raz Alon, Ro’i Belson, Roi Cohen, Rom Gilad, Roman Glozman, Shahar Lev, Shaked Meirom, Tal Del- bari, Tal Ness, Tomer Asida, Tom Ben Gal, Tom Braude, Uriya Pumerantz, Yehoshua Cohen, Yonatan Belinkov, Yuval Globerson, Yuval Peleg Levy, and Yoav Shoham. 2024. Jamba-1.5: Hybrid Transformer-Mamba Models at Scale.

[179] MosaicML NLP Team. 2023. Introducing MPT-7B: A New Standard for Open-Source, Com-mercially Usable LLMs.

[180] Qwen Team. 2024. Qwen1.5-MoE: Matching 7B Model Performance with 1/3 Activated Parameters”.

[181] Reka Team, Aitor Ormazabal, Che Zheng, Cyprien de Masson d’Autume, Dani Yogatama, Deyu Fu, Donovan Ong, Eric Chen, Eugenie Lamprecht, Hai Pham, Isaac Ong, Kaloyan Aleksiev, Lei Li, Matthew Henderson, Max Bain, Mikel Artetxe, Nishant Relan, Piotr Padlewski, Qi Liu, Ren Chen, Samuel Phua, Yazheng Yang, Yi Tay, Yuqi Wang, Zhongkai Zhu, and Zhihui Xie. 2024. Reka Core, Flash, and Edge: A Series of Powerful Multimodal Language Models.

[182] Hugo Touvron, Thibaut Lavril, Gautier Izacard, Xavier Martinet, Marie-Anne Lachaux, Tim-oth´ee Lacroix, Baptiste Rozi`ere, Naman Goyal, Eric Hambro, Faisal Azhar, Aurelien Ro-

<!-- page 41 of 63 -->

driguez, Armand Joulin, Edouard Grave, and Guillaume Lample. 2023. LLaMA: Open and Efficient Foundation Language Models.

[183] Hugo Touvron, Louis Martin, Kevin Stone, Peter Albert, Amjad Almahairi, Yasmine Babaei, Nikolay Bashlykov, Soumya Batra, Prajjwal Bhargava, Shruti Bhosale, Dan Bikel, Lukas Blecher, Cristian Canton Ferrer, Moya Chen, Guillem Cucurull, David Esiobu, Jude Fernan- des, Jeremy Fu, Wenyin Fu, Brian Fuller, Cynthia Gao, Vedanuj Goswami, Naman Goyal, Anthony Hartshorn, Saghar Hosseini, Rui Hou, Hakan Inan, Marcin Kardas, Viktor Kerkez, Madian Khabsa, Isabel Kloumann, Artem Korenev, Punit Singh Koura, Marie-Anne Lachaux, Thibaut Lavril, Jenya Lee, Diana Liskovich, Yinghai Lu, Yuning Mao, Xavier Martinet, Todor Mihaylov, Pushkar Mishra, Igor Molybog, Yixin Nie, Andrew Poulton, Jeremy Reizenstein, Rashi Rungta, Kalyan Saladi, Alan Schelten, Ruan Silva, Eric Michael Smith, Ranjan Sub- ramanian, Xiaoqing Ellen Tan, Binh Tang, Ross Taylor, Adina Williams, Jian Xiang Kuan, Puxin Xu, Zheng Yan, Iliyan Zarov, Yuchen Zhang, Angela Fan, Melanie Kambadur, Sharan Narang, Aurelien Rodriguez, Robert Stojnic, Sergey Edunov, and Thomas Scialom. 2023. Llama 2: Open Foundation and Fine-Tuned Chat Models.

[184] Lewis Tunstall, Edward Beeching, Nathan Lambert, Nazneen Rajani, Kashif Rasul, Younes Belkada, Shengyi Huang, Leandro von Werra, Cl´ementine Fourrier, Nathan Habib, Nathan Sarrazin, Omar Sanseviero, Alexander M. Rush, and Thomas Wolf. 2023. Zephyr: Direct Distillation of LM Alignment.

[185] Ashish Vaswani, Noam Shazeer, Niki Parmar, Jakob Uszkoreit, Llion Jones, Aidan N. Gomez, Lukasz Kaiser, and Illia Polosukhin. 2023. Attention Is All You Need.

[186] Ben Wang and Aran Komatsuzaki. 2021. GPT-J-6B: A 6 Billion Parameter Autoregressive Language Model.

[187] Xingyao Wang, Boxuan Li, Yufan Song, Frank F. Xu, Xiangru Tang, Mingchen Zhuge, Jiayi Pan, Yueqi Song, Bowen Li, Jaskirat Singh, Hoang H. Tran, Fuqiang Li, Ren Ma, Mingzhang Zheng, Bill Qian, Yanjun Shao, Niklas Muennighoff, Yizhe Zhang, Binyuan Hui, Junyang Lin, Robert Brennan, Hao Peng, Heng Ji, and Graham Neubig. 2024. OpenDevin: An Open Platform for AI Software Developers as Generalist Agents.

[188] Yizhong Wang, Hamish Ivison, Pradeep Dasigi, Jack Hessel, Tushar Khot, Khyathi Raghavi Chandu, David Wadden, Kelsey MacMillan, Noah A. Smith, Iz Beltagy, and Hannaneh Ha- jishirzi. 2023. How Far Can Camels Go? Exploring the State of Instruction Tuning on Open Resources.

[189] Zhilin Wang, Yi Dong, Olivier Delalleau, Jiaqi Zeng, Gerald Shen, Daniel Egert, Jimmy J. Zhang, Makesh Narsimhan Sreedhar, and Oleksii Kuchaiev. 2024. HelpSteer2: Open-source dataset for training top-performing reward models.

[190] Jason Wei, Maarten Bosma, Vincent Y. Zhao, Kelvin Guu, Adams Wei Yu, Brian Lester, Nan Du, Andrew M. Dai, and Quoc V. Le. 2022. Finetuned Language Models Are Zero-Shot Learners.

[191] Tianwen Wei, Bo Zhu, Liang Zhao, Cheng Cheng, Biye Li, Weiwei L¨u, Peng Cheng, Jianhao Zhang, Xiaoyu Zhang, Liang Zeng, Xiaokun Wang, Yutuan Ma, Rui Hu, Shuicheng Yan, Han Fang, and Yahui Zhou. 2024. Skywork-MoE: A Deep Dive into Training Techniques for Mixture-of-Experts Language Models.

[192] Johannes Welbl, Nelson F. Liu, and Matt Gardner. 2017. Crowdsourcing Multiple Choice Science Questions.

[193] BigScience Workshop, Teven Le Scao, Angela Fan, Christopher Akiki, Ellie Pavlick, Suzana Ili´c, Daniel Hesslow, Roman Castagn´e, Alexandra Sasha Luccioni, Franc¸ois Yvon, Matthias Gall´e, Jonathan Tow, Alexander M. Rush, Stella Biderman, Albert Webson, Pawan Sasanka Ammanamanchi, Thomas Wang, Benoˆıt Sagot, Niklas Muennighoff, et al. 2023. BLOOM: A 176B-Parameter Open-Access Multilingual Language Model.

[194] Jialin Wu, Xia Hu, Yaqing Wang, Bo Pang, and Radu Soricut. 2024. Omni-SMoLA: Boosting Generalist Multimodal Models with Soft Mixture of Low-rank Experts.

<!-- page 42 of 63 -->

[195] Shaohua Wu, Jiangang Luo, Xi Chen, Lingjun Li, Xudong Zhao, Tong Yu, Chao Wang, Yue Wang, Fei Wang, Weixu Qiao, Houbo He, Zeru Zhang, Zeyu Sun, Junxiong Mao, and Chong Shen. 2024. Yuan 2.0-M32: Mixture of Experts with Attention Router.

[196] xAI. 2024. Open Release of Grok-1.

[197] Shitao Xiao, Zheng Liu, Peitian Zhang, and Niklas Muennighoff. 2023. C-Pack: Packaged Resources To Advance General Chinese Embedding.

[198] Cheng Xu, Shuhao Guan, Derek Greene, and M-Tahar Kechadi. 2024. Benchmark Data Contamination of Large Language Models: A Survey.

[199] Fuzhao Xue, Zian Zheng, Yao Fu, Jinjie Ni, Zangwei Zheng, Wangchunshu Zhou, and Yang You. 2024. OpenMoE: An Early Effort on Open Mixture-of-Experts Language Models.

[200] Aiyuan Yang, Bin Xiao, Bingning Wang, Borong Zhang, Ce Bian, Chao Yin, Chenxu Lv, Da Pan, Dian Wang, Dong Yan, Fan Yang, Fei Deng, Feng Wang, Feng Liu, Guangwei Ai, Guosheng Dong, Haizhou Zhao, Hang Xu, Haoze Sun, Hongda Zhang, Hui Liu, Jiaming Ji, Jian Xie, JunTao Dai, Kun Fang, Lei Su, Liang Song, Lifeng Liu, Liyun Ru, Luyao Ma, Mang Wang, Mickel Liu, MingAn Lin, Nuolan Nie, Peidong Guo, Ruiyang Sun, Tao Zhang, Tianpeng Li, Tianyu Li, Wei Cheng, Weipeng Chen, Xiangrong Zeng, Xiaochuan Wang, Xiaoxi Chen, Xin Men, Xin Yu, Xuehai Pan, Yanjun Shen, Yiding Wang, Yiyu Li, Youxin Jiang, Yuchen Gao, Yupeng Zhang, Zenan Zhou, and Zhiying Wu. 2023. Baichuan 2: Open Large-scale Language Models.

[201] An Yang, Baosong Yang, Binyuan Hui, Bo Zheng, Bowen Yu, Chang Zhou, Chengpeng Li, Chengyuan Li, Dayiheng Liu, Fei Huang, Guanting Dong, Haoran Wei, Huan Lin, Jialong Tang, Jialin Wang, Jian Yang, Jianhong Tu, Jianwei Zhang, Jianxin Ma, Jianxin Yang, Jin Xu, Jingren Zhou, Jinze Bai, Jinzheng He, Junyang Lin, Kai Dang, Keming Lu, Keqin Chen, Kexin Yang, Mei Li, Mingfeng Xue, Na Ni, Pei Zhang, Peng Wang, Ru Peng, Rui Men, Ruize Gao, Runji Lin, Shijie Wang, Shuai Bai, Sinan Tan, Tianhang Zhu, Tianhao Li, Tianyu Liu, Wenbin Ge, Xiaodong Deng, Xiaohuan Zhou, Xingzhang Ren, Xinyu Zhang, Xipin Wei, Xuancheng Ren, Xuejing Liu, Yang Fan, Yang Yao, Yichang Zhang, Yu Wan, Yunfei Chu, Yuqiong Liu, Zeyu Cui, Zhenru Zhang, Zhifang Guo, and Zhihao Fan. 2024. Qwen2 Technical Report.

[202] John Yang, Carlos E. Jimenez, Alexander Wettig, Kilian Lieret, Shunyu Yao, Karthik Narasimhan, and Ofir Press. 2024. SWE-agent: Agent-Computer Interfaces Enable Auto- mated Software Engineering.

[203] Zheng-Xin Yong, Hailey Schoelkopf, Niklas Muennighoff, Alham Fikri Aji, David Ife-oluwa Adelani, Khalid Almubarak, M Saiful Bari, Lintang Sutawika, Jungo Kasai, Ahmed Baruwa, Genta Indra Winata, Stella Biderman, Edward Raff, Dragomir Radev, and Vassilina Nikoulina. 2023. BLOOM+1: Adding Language Support to BLOOM for Zero-Shot Prompt- ing.

[204] Longhui Yu, Weisen Jiang, Han Shi, Jincheng Yu, Zhengying Liu, Yu Zhang, James T. Kwok, Zhenguo Li, Adrian Weller, and Weiyang Liu. 2024. MetaMath: Bootstrap Your Own Math- ematical Questions for Large Language Models.

[205] Longfei Yun, Yonghao Zhuang, Yao Fu, Eric P Xing, and Hao Zhang. 2024. Toward Inference-optimal Mixture-of-Expert Large Language Models.

[206] Ted Zadouri, Ahmet ¨Ust¨un, Arash Ahmadian, Beyza Ermis¸, Acyr Locatelli, and Sara Hooker. 2023. Pushing Mixture of Experts to the Limit: Extremely Parameter Efficient MoE for Instruction Tuning.

[207] Rowan Zellers, Ari Holtzman, Yonatan Bisk, Ali Farhadi, and Yejin Choi. 2019. HellaSwag: Can a Machine Really Finish Your Sentence?

[208] Biao Zhang and Rico Sennrich. 2019. Root Mean Square Layer Normalization.

<!-- page 43 of 63 -->

[209] Ge Zhang, Scott Qu, Jiaheng Liu, Chenchen Zhang, Chenghua Lin, Chou Leuang Yu, Danny Pan, Esther Cheng, Jie Liu, Qunshu Lin, Raven Yuan, Tuney Zheng, Wei Pang, Xinrun Du, Yiming Liang, Yinghao Ma, Yizhi Li, Ziyang Ma, Bill Lin, Emmanouil Benetos, Huan Yang, Junting Zhou, Kaijing Ma, Minghao Liu, Morry Niu, Noah Wang, Quehry Que, Ruibo Liu, Sine Liu, Shawn Guo, Soren Gao, Wangchunshu Zhou, Xinyue Zhang, Yizhi Zhou, Yubo Wang, Yuelin Bai, Yuhan Zhang, Yuxiang Zhang, Zenith Wang, Zhenzhu Yang, Zijian Zhao, Jiajun Zhang, Wanli Ouyang, Wenhao Huang, and Wenhu Chen. 2024. MAP-Neo: Highly Capable and Transparent Bilingual Large Language Model Series.

[210] Peiyuan Zhang, Guangtao Zeng, Tianduo Wang, and Wei Lu. 2024. TinyLlama: An Open-Source Small Language Model.

[211] Qizhen Zhang, Nikolas Gritsch, Dwaraknath Gnaneshwar, Simon Guo, David Cairuz, Bharat Venkitesh, Jakob Foerster, Phil Blunsom, Sebastian Ruder, Ahmet Ustun, and Acyr Locatelli. 2024. BAM! Just Like That: Simple and Efficient Parameter Upcycling for Mixture of Ex- perts.

[212] Susan Zhang, Stephen Roller, Naman Goyal, Mikel Artetxe, Moya Chen, Shuohui Chen, Christopher Dewan, Mona Diab, Xian Li, Xi Victoria Lin, Todor Mihaylov, Myle Ott, Sam Shleifer, Kurt Shuster, Daniel Simig, Punit Singh Koura, Anjali Sridhar, Tianlu Wang, and Luke Zettlemoyer. 2022. OPT: Open Pre-trained Transformer Language Models.

[213] Yanli Zhao, Andrew Gu, Rohan Varma, Liang Luo, Chien-Chin Huang, Min Xu, Less Wright, Hamid Shojanazeri, Myle Ott, Sam Shleifer, Alban Desmaison, Can Balioglu, Pritam Da- mania, Bernard Nguyen, Geeta Chauhan, Yuchen Hao, Ajit Mathews, and Shen Li. 2023. PyTorch FSDP: Experiences on Scaling Fully Sharded Data Parallel.

[214] Tianyu Zheng, Ge Zhang, Tianhao Shen, Xueling Liu, Bill Yuchen Lin, Jie Fu, Wenhu Chen, and Xiang Yue. 2024. Opencodeinterpreter: Integrating code generation with execution and refinement. arXiv preprint arXiv:2402.14658.

[215] Zexuan Zhong, Mengzhou Xia, Danqi Chen, and Mike Lewis. 2024. Lory: Fully Differen-tiable Mixture-of-Experts for Autoregressive Language Model Pre-training.

[216] Chunting Zhou, Pengfei Liu, Puxin Xu, Srini Iyer, Jiao Sun, Yuning Mao, Xuezhe Ma, Avia Efrat, Ping Yu, Lili Yu, Susan Zhang, Gargi Ghosh, Mike Lewis, Luke Zettlemoyer, and Omer Levy. 2023. LIMA: Less Is More for Alignment.

[217] Jeffrey Zhou, Tianjian Lu, Swaroop Mishra, Siddhartha Brahma, Sujoy Basu, Yi Luan, Denny Zhou, and Le Hou. 2023. Instruction-Following Evaluation for Large Language Models.

[218] Yanqi Zhou, Nan Du, Yanping Huang, Daiyi Peng, Chang Lan, Da Huang, Siamak Shakeri, David So, Andrew Dai, Yifeng Lu, Zhifeng Chen, Quoc Le, Claire Cui, James Laudon, and Jeff Dean. 2024. Brainformers: Trading Simplicity for Efficiency.

[219] Yanqi Zhou, Tao Lei, Hanxiao Liu, Nan Du, Yanping Huang, Vincent Zhao, Andrew Dai, Zhifeng Chen, Quoc Le, and James Laudon. 2022. Mixture-of-Experts with Expert Choice Routing.

[220] Terry Yue Zhuo, Armel Zebaze, Nitchakarn Suppattarachai, Leandro von Werra, Harm de Vries, Qian Liu, and Niklas Muennighoff. 2024. Astraios: Parameter-Efficient Instruc- tion Tuning Code Large Language Models.

[221] Barret Zoph, Irwan Bello, Sameer Kumar, Nan Du, Yanping Huang, Jeff Dean, Noam Shazeer, and William Fedus. 2022. ST-MoE: Designing Stable and Transferable Sparse Ex- pert Models.

[222] Simiao Zuo, Xiaodong Liu, Jian Jiao, Young Jin Kim, Hany Hassan, Ruofei Zhang, Tuo Zhao, and Jianfeng Gao. 2022. Taming Sparsely Activated Transformer with Stochastic Experts.

[223] Ahmet ¨Ust¨un, Viraat Aryabumi, Zheng-Xin Yong, Wei-Yin Ko, Daniel D’souza, Gbemileke Onilude, Neel Bhandari, Shivalika Singh, Hui-Lee Ooi, Amr Kayid, Freddie Vargus, Phil Blunsom, Shayne Longpre, Niklas Muennighoff, Marzieh Fadaee, Julia Kreutzer, and Sara Hooker. 2024. Aya Model: An Instruction Finetuned Open-Access Multilingual Language Model.

<!-- page 44 of 63 -->

## A Artifacts · 产物清单

| Artifact | Public link |
|---|---|
| OLMoE-1B-7B | https://hf.co/allenai/OLMoE-1B-7B-0924 |
| OLMoE-1B-7B-Instruct | https://hf.co/allenai/OLMoE-1B-7B-0924-Instruct |
| OLMoE-1B-7B-SFT | https://hf.co/allenai/OLMoE-1B-7B-0924-SFT |
| OLMoE-Mix | https://hf.co/datasets/allenai/OLMoE-mix-0924 |
| SFT data | https://hf.co/datasets/allenai/tulu-v3.1-mix-preview-4096-OLMoE |
| KTO/DPO data | https://hf.co/datasets/allenai/ultrafeedback_binarized_cleaned |
| Code | https://github.com/allenai/OLMoE |
| Logs | https://wandb.ai/ai2-llm/olmoe/reports/OLMoE-1B-7B-0924--Vmlldzo4OTcyMjU3 |
| BLOOM-7B | https://hf.co/bigscience/bloom-7b1 |
| DeepSeekMoE-3B-16B | https://hf.co/deepseek-ai/deepseek-moe-16b-base |
| DeepSeekMoE-3B-16B+chat | https://hf.co/deepseek-ai/deepseek-moe-16b-chat |
| DeepSeekV2-2B-16B | https://hf.co/deepseek-ai/DeepSeek-V2-Lite |
| DCLM-1B | https://hf.co/TRI-ML/DCLM-1B |
| DCLM-7B | https://hf.co/TRI-ML/DCLM-7B |
| Falcon-7B | https://hf.co/tiiuae/falcon-7b |
| Gemma2-3B | https://hf.co/google/gemma-2-2b |
| Gemma2-9B | https://hf.co/google/gemma-2-9b |
| JetMoE-2B-9B | https://hf.co/jetmoe/jetmoe-8b |
| JetMoE-2B-9B+SFT | https://hf.co/jetmoe/jetmoe-8b-sft |
| JetMoE-2B-9B+Chat | https://hf.co/jetmoe/jetmoe-8b-chat |
| Llama-7B | https://hf.co/huggyllama/llama-7b |
| Llama2-7B | https://hf.co/meta-llama/Llama-2-7b-hf |
| Llama3.1-8B | https://hf.co/meta-llama/Meta-Llama-3.1-8B |
| MPT-7B | https://hf.co/mosaicml/mpt-7b |
| Mistral-7B | https://hf.co/mistralai/Mistral-7B-v0.1 |
| Mixtral-8x7B | https://hf.co/mistralai/Mixtral-8x7B-v0.1 |
| OLMo-1B (0724) | https://hf.co/allenai/OLMo-1B-0724-hf |
| OLMo-7B (0724) | https://hf.co/allenai/OLMo-7B-0724-hf |
| OpenMoE-3B-9B | https://hf.co/OrionZheng/openmoe-8b |
| Pythia-7B | https://hf.co/EleutherAI/pythia-6.9b |
| Qwen1.5-3B-14B | https://hf.co/Qwen/Qwen1.5-MoE-A2.7B |
| Qwen1.5-3B-14B+Chat | https://hf.co/Qwen/Qwen1.5-MoE-A2.7B-Chat |
| StableLM2-2B | https://hf.co/stabilityai/stablelm-2-1_6b |
| TinyLlama-1B | https://hf.co/TinyLlama/TinyLlama_v1.1 |

Table 9: All artifacts released and used in this work. We point from the name used for a given artifact in this work (e.g. Figure 1) to the URL where it can be obtained.

表 9｜本文发布与使用的全部产物, 从文中使用的名称指向可获取的 URL.

## B Training Configuration · 训练配置

**Pretraining** We display the pretraining hyperparameter configuration of OLMoE-1B-7B in §B comparing with other relevant models. We follow Groeneveld et al. [65] using the AdamW optimizer [107] with ZeRO [142] via PyTorch FSDP [213] and mixed-precision training [116]. Our main model settings differing from Groeneveld et al. [65] are: **(1) MoE-related changes:** OLMoE-1B-7B is a sparsely activated decoder-only transformer [185] using dropless Mixture-of-Experts [58]. Unlike most prior MoEs, we use a high granularity [39, 86] with 64 small experts with an FFN dimension of just 1,024 rather than a few large experts. We further use two auxiliary losses: router z-loss [221] and load balancing loss [154]. **(2) Stability improvements:** (a) We use a truncated normal initialization with a standard deviation of 0.02 and a minimum

<!-- page 45 of 63 -->

(maximum) cut-off of -0.06 (0.06) corresponding to three standard deviations. (b) We use QK normalization [44, 113, 173]. (c) We use RMSNorm [208] instead of the non-parametric LayerNorm used in Groeneveld et al. [65]. **(3) Performance improvements:** Besides some of the stability improvements which also impact performance, we also reduce the AdamW epsilon to 1.0E-08 from the 1.0E-05 used in Groeneveld et al. [65] to speed up convergence. Finally, we train OLMoE-1B-7B for significantly longer than all prior OLMo models amounting to 5T tokens and thus more than one epoch (1.3) following Muennighoff et al. [121]. We shuffle the pretraining dataset before starting the second epoch. For the final 100B tokens, we decay the learning rate linearly from 5.0E-04 to 0. We experiment with many of these settings in §4.

**预训练** 我们在 §B 中给出 OLMoE-1B-7B 的预训练超参数配置, 并与其他相关模型对比. 我们沿用 Groeneveld et al. [65], 使用 AdamW 优化器 [107], 经 PyTorch FSDP [213] 实现 ZeRO [142], 并采用混合精度训练 [116]. 与 Groeneveld et al. [65] 不同的主要设置有: **(1) MoE 相关改动:** OLMoE-1B-7B 是使用 dropless MoE [58] 的稀疏激活 decoder-only transformer [185]. 与多数已有 MoE 不同, 我们采用高粒度 [39, 86], 用 64 个 FFN 维度只有 1,024 的小专家, 而不是少数大专家. 我们还使用两项辅助损失: router z-loss [221] 与负载均衡损失 [154]. **(2) 稳定性改进:** (a) 使用标准差 0.02, 下 (上) 截断点为 -0.06 (0.06), 即三个标准差的截断正态初始化. (b) 使用 QK normalization [44, 113, 173]. (c) 用 RMSNorm [208] 代替 Groeneveld et al. [65] 中的非参数 LayerNorm. **(3) 性能改进:** 除了部分同样影响表现的稳定性改进外, 我们还把 AdamW 的 epsilon 从 Groeneveld et al. [65] 的 1.0E-05 降到 1.0E-08, 以加快收敛. 最后, OLMoE-1B-7B 的训练时长远超以往所有 OLMo 模型, 达 5T token, 因而超过一个 epoch (1.3 个), 做法参照 Muennighoff et al. [121]. 开始第二个 epoch 前我们会打乱预训练数据集. 在最后 100B token 中, 学习率从 5.0E-04 线性衰减到 0. 其中许多设置的实验见 §4.

> **拆开:** 附录 B 说退火从 5.0E-04 线性降到 0, 这与 Table 10 和官方配置一致吗?
> 答: 不一致. Table 10 的峰值 LR 为 4.0E-04, 最小 LR 为 4.0E-05, 调度为 cosine. 官方 `OLMoE-1B-7B-0924.yml` 写 `learning_rate: 4.0e-4`, `cosine_with_warmup`, `t_max: 5e12`, `alpha_f: 0.1`, 即主阶段从 4e-4 余弦降到 4e-5; 退火配置 `olmoe-8x1b-newhp-newds-final-anneal.yml` 写 `learning_rate: 4.0e-5`, `linear_with_warmup`, `t_warmup: 0`, `alpha_f: 0`, 即从 4e-5 线性降到 0, 与 Table 10 的「Annealing min LR 0」吻合. 5.0E-04 是 JetMoE 在 Table 10 中的峰值. 另外论文末尾的 Changelog 写「把 Table 10 的 max LR 从 5.0E-04 改成 4.0E-05」, 而现行 Table 10 的峰值是 4.0E-04, 两处也对不上.

**Adaptation** For finetuning we use Open Instruct [76, 188].<sup>8</sup> We filter all SFT samples to a length of fewer than 4096 tokens to match the sequence length of the model. Following Muennighoff et al. [122], we aggregate loss at the token level during SFT to improve performance on long generative tasks, such as AlpacaEval. We finetune in BF16 with a global batch size of 128 (4 H100 nodes with 8 GPUs each, a per device batch size of 2, and 2 gradient accumulation steps). We train for 2 epochs with a constant learning rate of 2.0E-5. For DPO [138], we reduce the global batch size to 32 (4 H100 nodes with 8 GPUs each and a per device batch size of 1). We train for 3 epochs with a learning rate of 5.0E-7 and a DPO beta of 0.1. Our adapted models are built on top of our annealed checkpoint, and we include the load balancing loss during both SFT and DPO based on our experiments in §4.3. Our preference tuning recipe is heavily optimized for DPO based on extensive experiments by Ivison et al. [76], thus for KTO [54] we experiment with a few settings in §F. Our final KTO adaptation uses the same hyperparameters as DPO, except that we use the RMSProp optimizer instead of Adam, which we use for SFT and DPO, and that we reduce the training duration to 1.3 epochs (5,000 steps) for KTO instead of the 3 epochs used for DPO.

**适配** 微调使用 Open Instruct [76, 188].<sup>8</sup> 我们把所有 SFT 样本过滤到少于 4096 个 token, 与模型的序列长度一致. 参照 Muennighoff et al. [122], SFT 中我们在 token 层面聚合 loss, 以提升 AlpacaEval 这类长生成任务的表现. 我们用 BF16 微调, 全局 batch size 为 128 (4 个 H100 节点, 每节点 8 卡, 每卡 batch size 2, 梯度累积 2 步). 训练 2 个 epoch, 学习率恒定为 2.0E-5. DPO [138] 时全局 batch size 降到 32 (4 个 H100 节点, 每节点 8 卡, 每卡 batch size 1). 训练 3 个 epoch, 学习率 5.0E-7, DPO beta 为 0.1. 适配模型基于退火后的检查点, 并且根据 §4.3 的实验, 我们在 SFT 和 DPO 中都加入了负载均衡损失. 我们的偏好微调配方是基于 Ivison et al. [76] 的大量实验为 DPO 深度调优的, 所以对 KTO [54] 我们在 §F 中试了几组设置. 最终 KTO 适配与 DPO 用相同超参数, 只是把 SFT 与 DPO 所用的 Adam 换成 RMSProp 优化器, 并把训练时长从 DPO 的 3 个 epoch 缩短到 1.3 个 epoch (5,000 step).

<sup>8</sup> Code: https://github.com/allenai/open-instruct

<sup>8</sup> 代码: https://github.com/allenai/open-instruct

**Hardware** We pretrain OLMoE-1B-7B on 256 H100 GPUs for approximately 10 days with NV-link interconnect across GPUs and InfiniBand interconnect across nodes. We also use H100 GPUs for all our experiments but some use a cluster with GCP TCPx interconnect across nodes instead. For adaptation, we use 32 H100 GPUs for 33 hours to instruction tune and for another 14 hours to preference tune via DPO. For KTO adaptation we use 8 H100 GPUs for 30 hours instead.

**硬件** 我们在 256 张 H100 上预训练 OLMoE-1B-7B 约 10 天, GPU 之间用 NV-link 互联, 节点之间用 InfiniBand. 所有实验也都用 H100, 但部分实验所用集群的节点间互联是 GCP TCPx. 适配阶段, 指令微调用 32 张 H100 跑 33 小时, DPO 偏好微调再用 14 小时. KTO 适配改用 8 张 H100 跑 30 小时.

<!-- page 46 of 63 -->

|  | OLMoE-1B-7B | JetMoE | OpenMoE | OLMo-1B (0724) |
|---|---|---|---|---|
| Dimension | 2,048 | 2,048 | 2,048 | 2,048 |
| Activation | SwiGLU | SwiGLU | SwiGLU | SwiGLU |
| FFN dimension | 1,024 | 5,632 | 8,192 | 8,192 |
| Vocab size | 50,304 | 32,000 | 256,384 | 50,304 |
| Attn heads | 16 | 16 | 24 | 16 |
| Num layers | 16 | 24 | 32 | 16 |
| Layer norm type | RMSNorm | RMSNorm | RMSNorm | non-parametric |
| Layer norm eps | 1.0E-05 | 1.0E-05 | 1.0E-06 | 1.0E-05 |
| QK-Norm | yes | no | no | no |
| Pos emb. | RoPE | RoPE | RoPE | RoPE |
| RoPE $\theta$ | 10,000 | 10,000 | 10,000 | 10,000 |
| Attention variant | full | MoA | full | full |
| Biases | - | MLP & Attn | - | - |
| Weight tying | no | yes | no | no |
| Init dist | trunc normal | ? | ? | normal |
| Init std | 0.02 | 0.02 | varies | varies |
| Init trunc | 3$\times$std | - | - | - |
| MoE layers | Every | Every | Every 6th | - |
| MoE layer type | dMoE | dMoE | ST-MoE | - |
| # Experts | 64 | 8 | 32 | 1 |
| # Activated | 8 | 2 | 2 | 1 |
| # Vocab params | 103M | 66M | 525M | 103M |
| # Active params | 1.3B | 2.2B | 2.6B | 1.3B |
| # Total params | 6.9B | 8.5B | 8.7B | 1.3B |
| Sequence length | 4,096 | 4,096 | 2,048 | 4,096 |
| Batch size (samples) | 1,024 | 1,024 | 2,048 | 512 |
| Batch size (tokens) | $\sim$4M | $\sim$4M | $\sim$4M | $\sim$2M |
| warmup steps | 2,500 | 2,500 | 10,000 | 2,000 |
| peak LR | 4.0E-04 | 5.0E-04 | 0.01 | 4.0E-04 |
| minimum LR | 4.0E-05 | 5.0E-05 | - | 4.0E-05 |
| optimizer | AdamW | AdamW | Adafactor | AdamW |
| weight decay | 0.1 | 0.1 | 0.0 | 0.1 |
| beta1 | 0.9 | ? | 0.9 | 0.9 |
| beta2 | 0.95 | ? | - | 0.95 |
| AdamW epsilon | 1.0E-08 | ? | - | 1.0E-05 |
| LR schedule | cosine | WSD | Inv Sq Root | cosine |
| gradient clipping | global 1.0 | global 1.0 | global 1.0 | global 1.0 |
| gradient reduce dtype | FP32 | ? | ? | FP32 |
| optimizer state dtype | FP32 | ? | ? | FP32 |
| LBL weight | 0.01 | 0.01 | 0.01 | - |
| Router z-loss weight | 0.001 | 0.001 | 0.0001 | - |
| Pretraining tokens | 5,033B | 1,000B | 1,100B | 2,000B |
| Annealing tokens | 100B | 250B | - | 50B |
| Annealing schedule | linear | - | - | linear |
| Annealing min LR | 0 | - | - | 0 |

Table 10: Pretraining hyperparameters of OLMoE-1B-7B and comparable models trained from scratch. We highlight rows where OLMoE-1B-7B differs from OLMo-1B. Active params include vocab params. “?” = undisclosed settings, FFN = feed-forward network, Attn = Attention, LR = learning rate, WSD = Weight-Stable-Decay, LBL = load balancing loss, Inv Sq Root = Inverse Square Root decay, trunc = truncation, std = standard deviation, “varies” = stds that are layer or weight-dependent.

表 10｜OLMoE-1B-7B 与可比的从零训练模型的预训练超参数. OLMoE-1B-7B 与 OLMo-1B 不同的行有: FFN 维度 1,024, RMSNorm, QK-Norm, 截断正态初始化, 64 专家激活 8 个, AdamW epsilon 1.0E-08, batch 约 4M token, 训练 5,033B token.

<!-- page 47 of 63 -->

## C Evaluation Setup · 评测设置

| Dataset ($\downarrow$) | During pretraining: Format | Shot | Norm | Split | After pretraining (OLMES): Format | Shot | CF Norm | Split |
|---|---|---|---|---|---|---|---|---|
| ARC-C | CF | 0 | char | val | max(MCF,CF) | 5 | pmi | test |
| ARC-E | CF | 0 | none | val | max(MCF,CF) | 5 | char | test |
| BoolQ | CF | 0 | none | val | max(MCF,CF) | 5 | none | val |
| COPA | CF | 0 | none | val | - | - | - | - |
| CSQA | CF | 0 | char | val | max(MCF,CF) | 5 | pmi | val |
| HellaSwag | CF | 0 | char | val | max(MCF,CF) | 5 | char | val |
| MMLU | MCF | 5 | none | val | max(MCF,CF) | 5 | char | test |
| MMLU Var | CF | 0-5 | char | val | - | - | - | - |
| OBQA | CF | 0 | char | val | max(MCF,CF) | 5 | pmi | test |
| PIQA | CF | 0 | char | val | max(MCF,CF) | 5 | char | val |
| SciQ | CF | 0 | none | val | - | - | - | - |
| SocialIQA | CF | 0 | char | val | max(MCF,CF) | 5 | char | val |
| Winogrande | CF | 0 | none | val | max(MCF,CF) | 5 | none | val |

Table 11: Summary of downstream evaluation during and after pretraining (OLMES). ARC-C and ARC-E refer to ARC-Challenge and -Easy, CSQA=CommonsenseQA, OBQA=OpenBookQA, CF=Completion/Cloze formulation, MCF=Multiple-choice formulation, pmi=pointwise-mutual-information, char=per-character, Var=variants referring to the use of few-shots varying from 0-5.

表 11｜预训练期间与预训练之后 (OLMES) 的下游评测设置: 题型格式 (CF / MCF), shot 数, 概率归一化方式与数据划分.

**During pretraining** We evaluate using a similar in-loop evaluation setup as Groeneveld et al. [65], with the addition of more tasks such as CommonsenseQA, PIQA, and different implementations of MMLU. Following Groeneveld et al. [65], for the majority of the tasks, we perform 0-shot evaluation using the Completion/Cloze Formulation (CF), ranking each answer string using language model probabilities. In terms of probability normalization, there is either no normalization (none) or normalization by the number of characters in the answer (char) when ranking solely based on probability may heavily favor shorter answers [24]. For MMLU, the in-loop evaluation also includes a setup where we increase the total number of instances by including a range of 0-shot to 5-shot setups together as we found this provides smoother trends as the training proceeds (“MMLU Var”). We also include the Multiple-Choice Formulation (MCF) version of MMLU, scoring prediction of answer labels like A/B/C/D, which generally starts to rise only later in training as models only gain the multiple-choice capability later (at around 1T tokens for OLMoE-1B-7B in Figure 25). We also evaluate perplexity on selected validation sets from Paloma [59, 96, 111, 115, 144, 163]. All code used for evaluation during pretraining is at https://github.com/allenai/OLMo/tree/61ac104d616ec5435db225796e5c7532c9abd95a/olmo/eval.

**预训练期间** 我们使用与 Groeneveld et al. [65] 相近的训练中评测设置, 并增加了 CommonsenseQA, PIQA 以及 MMLU 的不同实现等任务. 沿用 Groeneveld et al. [65], 多数任务做 0-shot 评测, 采用补全 / 完形格式 (CF), 用语言模型概率给每个答案字符串排序. 概率归一化有两种: 不归一化 (none), 或按答案字符数归一化 (char), 后者用于单纯按概率排序会明显偏向较短答案的情况 [24]. 对 MMLU, 训练中评测还包含一种设置: 把 0-shot 到 5-shot 的各种设置放在一起, 增加样本总数, 因为我们发现这样随训练推进的趋势更平滑 (「MMLU Var」). 我们也包含 MMLU 的多选格式 (MCF) 版本, 对 A/B/C/D 这类答案标签的预测打分; 它通常到训练后期才开始上升, 因为模型较晚才获得多选能力 (OLMoE-1B-7B 约在 1T token 处, 见 Figure 25). 我们还在 Paloma 中选取的验证集上评测困惑度 [59, 96, 111, 115, 144, 163]. 预训练期间评测的全部代码见 https://github.com/allenai/OLMo/tree/61ac104d616ec5435db225796e5c7532c9abd95a/olmo/eval.

**After pretraining - OLMES** We perform evaluations following the OLMES evaluation standard [67], with the suite of tasks in the original paper. OLMES (Open Language Model Evaluation Standard) is a standard for reproducible LM evaluations that is open, practical, and documented, providing recommendations guided by experiments and results from the literature [19, 60, 64]. It is designed to support comparisons between smaller base models that require the Cloze formulation of multiple-choice questions against larger models that can utilize the Multiple-choice formulation. To make our evaluations reproducible, we follow OLMES in prompt formatting, choice of in-context examples, probability normalization, task formulation, as well as all other details. We summarize this setup in Table 4 and refer to Gu et al. [67] for more details.

**预训练之后 - OLMES** 我们按 OLMES 评测标准 [67] 评测, 任务集合与原论文一致. OLMES (Open Language Model Evaluation Standard) 是一个用于可复现 LM 评测的标准, 开放, 实用, 有文档, 其建议依据文献中的实验与结果 [19, 60, 64]. 它的设计目标是, 让需要用完形格式做多选题的较小基础模型, 能与可以用多选格式的较大模型比较. 为使评测可复现, 我们在提示格式, 上下文示例选择, 概率归一化, 任务格式等所有细节上都遵循 OLMES. 该设置的概要见 Table 4, 更多细节参见 Gu et al. [67].

**After pretraining - DCLM** For results on the DCLM tasks [90] in Table 13, we precisely follow their setup using the evaluation code released by the authors at https://github.com/mlfoundations/dclm. “Core” results are the `low variance` tasks in their evaluation code, while “Extended” corresponds to the `heavy` tasks.

**预训练之后 - DCLM** 对 Table 13 中的 DCLM 任务 [90] 结果, 我们严格按其设置, 使用作者发布的评测代码 https://github.com/mlfoundations/dclm. 「Core」对应其评测代码中的 `low variance` 任务, 「Extended」对应 `heavy` 任务.

**After adaptation** After supervised finetuning and direct preference optimization, we evaluate models using a subset of the evaluations and the same overall setup used in Ivison et al. [76]

<!-- page 48 of 63 -->

and Wang et al. [188]. We cover a wide range of model capabilities in our evaluation suite including coding (HumanEval [28]), general and mathematical reasoning (Big Bench Hard [169], GSM8k [35]), world knowledge (MMLU), general instruction following (AlpacaEval 1.0 [93], not the length-controlled variant [51]), precise instruction following (IFEval [217]) and safety (XSTest [147]). We refer to Wang et al. [188] for more details on each benchmark.

**适配之后** 完成监督微调与直接偏好优化后, 我们用 Ivison et al. [76] 与 Wang et al. [188] 评测的一个子集及相同的整体设置评测模型. 评测覆盖多种能力: 代码 (HumanEval [28]), 通用与数学推理 (Big Bench Hard [169], GSM8k [35]), 世界知识 (MMLU), 一般指令遵循 (AlpacaEval 1.0 [93], 不是长度控制版 [51]), 精确指令遵循 (IFEval [217]) 与安全 (XSTest [147]). 各基准的详细信息参见 Wang et al. [188].

## D Openness of Models · 模型的开放程度

We list the openness of various models summarized in Figure 1. We exclude Switch Transformers [56], as it was published over three years ago and is very different from more recent MoE models (MLM objective, Encoder-decoder, etc.).

我们列出 Figure 1 中汇总的各模型的开放程度. 我们不纳入 Switch Transformers [56], 因为它发表于三年多以前, 与近期的 MoE 模型差别很大 (MLM 目标, encoder-decoder 等).

**Grok-86B-314B [196]**

**Grok-86B-314B [196]**

- **(yes) Model:** Their model is licensed under the open-source Apache 2.0 license.

- **(yes) 模型:** 模型采用开源的 Apache 2.0 许可证.

- **(no) Data:** Unavailable.

- **(no) 数据:** 未公开.

- **(no) Code:** Unavailable.

- **(no) 代码:** 未公开.

- **(no) Logs:** Unavailable.

- **(no) 日志:** 未公开.

**Mixtral-39B-141B and Mixtral-13B-42B [79]**

**Mixtral-39B-141B 与 Mixtral-13B-42B [79]**

- **(yes) Model:** Their model is licensed under the open-source Apache 2.0 license.

- **(yes) 模型:** 模型采用开源的 Apache 2.0 许可证.

- **(no) Data:** Unavailable.

- **(no) 数据:** 未公开.

- **(no) Code:** Unavailable.

- **(no) 代码:** 未公开.

- **(no) Logs:** Unavailable.

- **(no) 日志:** 未公开.

**DBRX-36B-132B [40]**

**DBRX-36B-132B [40]**

- **(partial) Model:** The model is licensed under a custom non-open-source license<sup>9</sup> with additional use-case restrictions.<sup>10</sup>

- **(partial) 模型:** 模型采用自定义的非开源许可证,<sup>9</sup> 并附加了用途限制.<sup>10</sup>

<sup>9</sup> https://www.databricks.com/legal/open-model-license

<sup>10</sup> https://www.databricks.com/legal/acceptable-use-policy-open-model

- **(no) Data:** Unavailable.

- **(no) 数据:** 未公开.

- **(no) Code:** They use closed-source custom adaptations of their public libraries LLM-foundry, composer, and megablocks.<sup>11</sup>

- **(no) 代码:** 他们使用自家公开库 LLM-foundry, composer 与 megablocks 的闭源定制版本.<sup>11</sup>

<sup>11</sup> https://github.com/databricks/dbrx

- **(no) Logs:** Unavailable.

- **(no) 日志:** 未公开.

**Skywork-MoE-22B-146B [191]**

**Skywork-MoE-22B-146B [191]**

- **(partial) Model:** The model is licensed under a custom non-open-source license.<sup>12</sup>

- **(partial) 模型:** 模型采用自定义的非开源许可证.<sup>12</sup>

<sup>12</sup> https://github.com/SkyworkAI/Skywork/blob/main/Skywork%20Community%20License.pdf

- **(no) Data:** Unavailable.

- **(no) 数据:** 未公开.

- **(no) Code:** Unavailable.

- **(no) 代码:** 未公开.

- **(no) Logs:** Unavailable.

- **(no) 日志:** 未公开.

**DeepSeekV2-21B-236B [43] and DeepSeekMoE-3B-14B [39]**

**DeepSeekV2-21B-236B [43] 与 DeepSeekMoE-3B-14B [39]**

- **(partial) Model:** The models are licensed under custom non-open-source licenses.<sup>13</sup>

- **(partial) 模型:** 模型采用自定义的非开源许可证.<sup>13</sup>

<sup>13</sup> https://github.com/deepseek-ai/DeepSeek-MoE/blob/main/LICENSE-MODEL and https://github.com/deepseek-ai/DeepSeek-V2/blob/main/LICENSE-MODEL

<sup>13</sup> https://github.com/deepseek-ai/DeepSeek-MoE/blob/main/LICENSE-MODEL 与 https://github.com/deepseek-ai/DeepSeek-V2/blob/main/LICENSE-MODEL

<!-- page 49 of 63 -->

- **(no) Data:** Unavailable.

- **(no) 数据:** 未公开.

- **(no) Code:** Unavailable.

- **(no) 代码:** 未公开.

- **(no) Logs:** Unavailable.

- **(no) 日志:** 未公开.

**Arctic-17B-480B [162]**

**Arctic-17B-480B [162]**

- **(yes) Model:** The model is licensed under the open-source Apache 2.0 license.

- **(yes) 模型:** 模型采用开源的 Apache 2.0 许可证.

- **(partial) Data:** They describe their mixture but do not release it.<sup>14</sup>

- **(partial) 数据:** 他们描述了数据配比, 但没有公开数据.<sup>14</sup>

<sup>14</sup> https://medium.com/snowflake/snowflake-arctic-cookbook-series-arctics-approach-to-data-b81a8a0958bd

- **(no) Code:** Unavailable.

- **(no) 代码:** 未公开.

- **(no) Logs:** Unavailable.

- **(no) 日志:** 未公开.

**Qwen2-14B-57B [180]**

**Qwen2-14B-57B [180]**

- **(yes) Model:** The model is licensed under the open-source Apache 2.0 license.

- **(yes) 模型:** 模型采用开源的 Apache 2.0 许可证.

- **(no) Data:** Unavailable.

- **(no) 数据:** 未公开.

- **(no) Code:** Unavailable.

- **(no) 代码:** 未公开.

- **(no) Logs:** Unavailable.

- **(no) 日志:** 未公开.

**Jamba-12B-52B [97]**

**Jamba-12B-52B [97]**

- **(yes) Model:** The model is licensed under the open-source Apache 2.0 license.

- **(yes) 模型:** 模型采用开源的 Apache 2.0 许可证.

- **(no) Data:** Unavailable.

- **(no) 数据:** 未公开.

- **(no) Code:** Unavailable.

- **(no) 代码:** 未公开.

- **(no) Logs:** Unavailable.

- **(no) 日志:** 未公开.

**Qwen1.5-3B-14B [180]**

**Qwen1.5-3B-14B [180]**

- **(partial) Model:** The model is licensed under a custom non-open-source license.<sup>15</sup>

- **(partial) 模型:** 模型采用自定义的非开源许可证.<sup>15</sup>

<sup>15</sup> https://hf.co/Qwen/Qwen1.5-MoE-A2.7B/blob/main/LICENSE

- **(no) Data:** Unavailable.

- **(no) 数据:** 未公开.

- **(no) Code:** Unavailable.

- **(no) 代码:** 未公开.

- **(no) Logs:** Unavailable.

- **(no) 日志:** 未公开.

**JetMoE-2B-9B [158]**

**JetMoE-2B-9B [158]**

- **(yes) Model:** The model is licensed under the open-source Apache 2.0 license.

- **(yes) 模型:** 模型采用开源的 Apache 2.0 许可证.

- **(partial) Data:** They describe their mixture but do not release it.

- **(partial) 数据:** 他们描述了数据配比, 但没有公开数据.

- **(partial) Code:** They make their fork of megablocks publicly available,<sup>16</sup> however, their Megatron-LM training code is not available.<sup>17</sup>

- **(partial) 代码:** 他们公开了自己的 megablocks 分支,<sup>16</sup> 但 Megatron-LM 训练代码没有公开.<sup>17</sup>

<sup>16</sup> https://github.com/yikangshen/megablocks

<sup>17</sup> https://hf.co/jetmoe/jetmoe-8b/discussions/5#661ee52c03251697a0b155cc

- **(no) Logs:** Unavailable.

- **(no) 日志:** 未公开.

<!-- page 50 of 63 -->

**OpenMoE-2B-9B [199]**

**OpenMoE-2B-9B [199]**

- **(yes) Model:** The model is licensed under the open-source Apache 2.0 license.

- **(yes) 模型:** 模型采用开源的 Apache 2.0 许可证.

- **(yes) Data:** They make scripts for recreating their data available.

- **(yes) 数据:** 他们公开了重建数据的脚本.

- **(yes) Code:** They make their code available.<sup>18</sup>

- **(yes) 代码:** 他们公开了代码.<sup>18</sup>

<sup>18</sup> https://github.com/XueFuzhao/OpenMoE/tree/main?tab=readme-ov-file#training-with-tpugpu

- **(no) Logs:** Unavailable.

- **(no) 日志:** 未公开.

**OLMoE-1B-7B**

**OLMoE-1B-7B**

- **(yes) Model:** The model is licensed under the open-source Apache 2.0 license.

- **(yes) 模型:** 模型采用开源的 Apache 2.0 许可证.

- **(yes) Data:** The data is licensed under the open-source ODC-By 1.0 license.

- **(yes) 数据:** 数据采用开源的 ODC-By 1.0 许可证.

- **(yes) Code:** The code is licensed under the open-source Apache 2.0 license.

- **(yes) 代码:** 代码采用开源的 Apache 2.0 许可证.

- **(yes) Logs:** Logs are available with the same open-source license as the code (Apache 2.0).

- **(yes) 日志:** 日志与代码采用同样的开源许可证 (Apache 2.0).

## E Additional Evaluation · 补充评测

![](images/loss.png)

Figure 24: **Losses of OLMoE-1B-7B during training.** The Books, Reddit, and Stack [84] datasets are from Dolma 1.7 [163] via Paloma [111]. More results, logs, and configurations: https://wandb.ai/ai2-llm/olmoe/reports/Plot-OLMoE-1B-7B--Vmlldzo4OTcyMjU3

图 24｜OLMoE-1B-7B 训练期间的训练 loss 与多个验证集 loss (其中 Books, Reddit, Stack 取自 Dolma 1.7, 经 Paloma 划分), 5T token 全程平滑, 没有大的尖峰.

<!-- page 51 of 63 -->

![](images/trainingevaltokens.png)

Figure 25: **Evaluation of OLMoE-1B-7B and the current best OLMo models during pretraining.** Grey vertical lines correspond to where the respective run enters annealing with the 1st line being for OLMo-7B, the 2nd for OLMo-1B, and the third for OLMoE-1B-7B. Figure 3 is a version of this plot with training FLOPs as the x-axis. More results, logs, and configurations: https://wandb.ai/ai2-llm/olmoe/reports/Plot-OLMoE-1B-7B-vs-OLMo-7B-vs-OLMo-1B--Vmlldzo4OTcyMjEz

图 25｜以训练 token 为横轴的 Figure 3: OLMoE-1B-7B, OLMo-1B (0724), OLMo-7B (0724) 在六项下游任务上的曲线. 灰色竖线依次是 OLMo-7B, OLMo-1B, OLMoE-1B-7B 进入退火的位置; MMLU 在约 1T token 后才开始上升.

<!-- page 52 of 63 -->

| Model | ARC_C | ARC_E | BoolQ | CSQA | HSwag | MMLU | OBQA | PIQA | SIQA | WinoG | Avg |
|---|---|---|---|---|---|---|---|---|---|---|---|
| LMs with $\sim$7-9B active parameters |  |  |  |  |  |  |  |  |  |  |  |
| Mistral-7B | 78.6$^\dagger$ | 90.8$^\dagger$ | 89.3 | 72.4$^\dagger$ | 83.0 | 64.0$^\dagger$ | 80.6$^\dagger$ | 82.8 | 71.3$^\dagger$ | 77.9 | 79.1 |
| OLMo-7B (0724) | 68.0$^\dagger$ | 85.7$^\dagger$ | 85.3 | 85.4$^\dagger$ | 80.5 | 54.9$^\dagger$ | 67.6$^\dagger$ | 79.3 | 76.1$^\dagger$ | 73.2 | 75.6 |
| DCLM-7B | 79.8$^\dagger$ | 92.3$^\dagger$ | 87.0 | 77.0 | 82.3 | 64.4$^\dagger$ | 79.6$^\dagger$ | 80.1 | $71.2^\dagger$ | 77.3 | 79.1 |
| Llama2-7B | 54.2 | 84.0 | 86.1 | 74.2 | 78.9 | 46.2$^\dagger$ | 57.8 | 77.5 | 59.6 | 71.7 | 69.0 |
| Llama3.1-8B | 79.5$^\dagger$ | 91.7$^\dagger$ | 88.5 | 74.3$^\dagger$ | 81.6 | 66.9$^\dagger$ | 78.6$^\dagger$ | 81.1 | 71.4$^\dagger$ | 76.6 | 79.0 |
| Gemma2-9B | 89.5$^\dagger$ | 95.5$^\dagger$ | 89.4 | 78.8$^\dagger$ | 87.3$^\dagger$ | 70.6$^\dagger$ | 88.4$^\dagger$ | 86.1$^\dagger$ | 76.0$^\dagger$ | 78.8 | 84.0 |
| LMs with $\sim$2-3B active parameters |  |  |  |  |  |  |  |  |  |  |  |
| StableLM-2B | 50.6$^\dagger$ | 75.3 | 82.3 | 70.4$^\dagger$ | 70.3 | 40.4$^\dagger$ | 56.6$^\dagger$ | 75.6 | 64.3$^\dagger$ | 65.8 | 65.1 |
| Gemma2-3B | 67.5$^\dagger$ | 84.3$^\dagger$ | 83.6 | 66.4$^\dagger$ | 74.6 | 53.3$^\dagger$ | 68.8$^\dagger$ | 78.5 | 64.7$^\dagger$ | 71.8 | 71.4 |
| JetMoE-2B-9B | 61.4$^\dagger$ | 81.9$^\dagger$ | 85.7 | 75.3$^\dagger$ | 81.7 | 49.1$^\dagger$ | 68.0$^\dagger$ | 80.3 | 71.3$^\dagger$ | 70.7 | 72.5 |
| OpenMoE-3B-9B | 29.3 | 50.6 | 63.2 | 21.5 | 44.4 | 27.4 | 34.6 | 63.3 | 42.9 | 51.9$^\dagger$ | 42.9 |
| DeepSeek-3B-16B | 53.4 | 82.7 | 81.9 | 72.7 | 80.4 | 45.5$^\dagger$ | 58.4 | 80.1 | 59.9 | 73.2 | 68.8 |
| DeepSeekV2-2B-16B | 74.0$^\dagger$ | 88.9$^\dagger$ | 84.7 | 73.8 | 81.9 | 58.8$^\dagger$ | 72.4$^\dagger$ | 80.2 | 69.1$^\dagger$ | 74.0 | 75.8 |
| Llama3.2-3B | 69.6$^\dagger$ | 85.1$^\dagger$ | 78.3 | 69.0 | 77.0 | 57.8$^\dagger$ | 67.2$^\dagger$ | 77.4 | 64.9$^\dagger$ | 69.9 | 71.6 |
| Qwen1.5-3B-14B | 77.4$^\dagger$ | 91.6$^\dagger$ | 85.0 | 81.4$^\dagger$ | 80.0 | $62.4^\dagger$ | 80.6$^\dagger$ | 81.0 | 74.1$^\dagger$ | 72.3 | 78.6 |
| LMs with $\sim$1B active parameters |  |  |  |  |  |  |  |  |  |  |  |
| OLMo-1B (0724) | 36.4 | 53.5 | 66.8 | 42.4 | 67.5 | 32.1 | 44.2 | 74.0 | 45.2 | 62.9 | 52.5 |
| TinyLlama-1B | 38.1 | 69.5 | 63.6 | 61.1 | 60.8 | 33.6 | 45.0 | 71.7 | 50.4 | 60.1 | 55.4 |
| Pythia-1B | 31.4 | 63.4 | 56.8$^\dagger$ | 50.9 | 48.0 | 31.1 | 40.4 | 68.9 | 46.4 | 52.7 | 49.0 |
| Llama3.2-1B | 43.5 | 71.6 | 69.4 | 59.6 | 67.3 | 38.2 | 42.0 | 73.7 | 52.0 | 62.5 | 58.0 |
| Zamba2-1B | 55.0$^\dagger$ | 85.4 | 76.1 | 70.1 | 73.4 | 44.73$^\dagger$ | 59.8$^\dagger$ | 76.6 | 58.4 | 67.2 | 66.7 |
| DCLM-1B | 57.6$^\dagger$ | 79.5 | 80.9 | 71.3 | 75.1 | 48.5$^\dagger$ | 60.0$^\dagger$ | 76.6 | 60.5$^\dagger$ | 68.1 | 67.8 |
| OLMoE-1B-7B | 62.1$^\dagger$ | 84.2 | 79.2 | 72.9 | 80.0 | 54.1$^\dagger$ | 65.4$^\dagger$ | 79.8 | 63.0$^\dagger$ | 70.2 | 71.1 |

Table 12: More results on OLMES. $^\dagger$ indicates use of the MCF score, see §C. See Table 4 for details on naming and a summary of these results.

表 12｜更多 OLMES 结果, $^\dagger$ 表示用 MCF 分数. OLMoE-1B-7B 平均 71.1, 在约 1B 激活一档最高.

<!-- page 53 of 63 -->

| OLMoE-1B-7B checkpoint ($\rightarrow$) | step 1,200,000 | step 1,220,000 | annealed | OLMo-1B | OLMo-7B |
|---|---|---|---|---|---|
| AGI Eval LSAT-AR$^*$ | 24.3 | 26.5 | 28.7 | 28.3 | 28.3 |
| AGI Eval LSAT-LR | 40.2 | 38.6 | 37.3 | 30.2 | 42.9 |
| AGI Eval LSAT-RC | 47.4 | 43.7 | 46.6 | 23.5 | 61.6 |
| AGI Eval SAT-En | 55.3 | 54.9 | 52.9 | 28.2 | 73.8 |
| AGI Eval SAT-Math CoT | 5.5 | 4.1 | 6.4 | 1.8 | 6.8 |
| AQuA CoT | 2.4 | 2.9 | 2.0 | 2.9 | 6.1 |
| ARC Challenge$^*$ | 53.3 | 53.4 | 53.8 | 34.6 | 48.1 |
| ARC Easy$^*$ | 77.1 | 78.5 | 77.7 | 64.4 | 75.9 |
| BBQ | 49.8 | 48.3 | 50.6 | 45.8 | 67.2 |
| BigBench CS Algorithms$^*$ | 47.1 | 50.2 | 47.2 | 47.5 | 53.6 |
| BigBench Conceptual Combinations | 51.5 | 50.5 | 56.3 | 31.1 | 68.0 |
| BigBench Conlang Translation | 3.7 | 6.1 | 7.3 | 4.3 | 7.3 |
| BigBench Dyck Languages$^*$ | 19.3 | 15.9 | 21.5 | 26.6 | 22.2 |
| BigBench Elementary Math QA | 26.2 | 27.0 | 26.9 | 26.2 | 30.4 |
| BigBench Language Identification$^*$ | 31.9 | 34.0 | 31.0 | 27.0 | 39.1 |
| BigBench Logical Deduction | 26.6 | 25.3 | 24.6 | 23.6 | 27.3 |
| BigBench Misconceptions | 59.8 | 55.3 | 62.6 | 55.7 | 58.0 |
| BigBench Novel Concepts | 62.5 | 62.5 | 65.6 | 43.8 | 53.1 |
| BigBench Operators$^*$ | 36.2 | 34.3 | 33.8 | 23.8 | 45.2 |
| BigBench QA Wikidata$^*$ | 68.2 | 68.8 | 69.2 | 67.0 | 69.9 |
| BigBench Repeat Copy Logic$^*$ | 15.6 | 15.6 | 18.8 | 3.1 | 9.4 |
| BigBench Strange Stories | 66.7 | 68.4 | 69.5 | 53.4 | 66.1 |
| BigBench Strategy QA | 56.2 | 58.1 | 57.0 | 51.5 | 68.6 |
| BigBench Understanding Fables | 47.1 | 44.4 | 47.6 | 28.0 | 61.4 |
| BoolQ$^*$ | 73.3 | 72.8 | 73.2 | 63.7 | 83.9 |
| COPA$^*$ | 81.0 | 80.0 | 78.0 | 75.0 | 77.0 |
| CoQA$^*$ | 43.7 | 44.4 | 43.7 | 3.4 | 45.4 |
| CommonsenseQA$^*$ | 67.2 | 67.0 | 69.3 | 19.6 | 86.0 |
| Enterprise PII Classification | 52.3 | 53.7 | 52.2 | 57.3 | 50.6 |
| GPQA Diamond | 22.2 | 21.2 | 19.7 | 19.7 | 20.2 |
| GPQA Main | 24.8 | 22.3 | 22.5 | 20.3 | 23.0 |
| GSM8K CoT | 6.4 | 7.4 | 7.4 | 4.9 | 30.6 |
| HellaSwag 0-shot$^*$ | 76.0 | 76.0 | 77.0 | 65.8 | 76.7 |
| HellaSwag 10-shot$^*$ | 77.6 | 77.5 | 78.6 | 66.3 | 78.9 |
| Jeopardy$^*$ | 48.8 | 48.7 | 50.3 | 22.6 | 46.5 |
| LAMBADA$^*$ | 72.7 | 72.2 | 73.3 | 61.1 | 71.8 |
| LogiQA | 34.9 | 34.3 | 34.6 | 28.7 | 31.0 |
| MMLU Few-shot | 52.2 | 51.9 | 53.3 | 28.4 | 55.1 |
| MMLU Zero-shot | 41.6 | 42.7 | 43.3 | 26.2 | 50.0 |
| Math QA | 26.4 | 27.1 | 27.5 | 24.1 | 29.8 |
| OpenBookQA$^*$ | 41.4 | 44.0 | 44.8 | 36.6 | 43.4 |
| PIQA$^*$ | 81.3 | 81.2 | 82.0 | 76.4 | 81.7 |
| PubMedQA | 56.1 | 46.6 | 57.9 | 0.2 | 57.9 |
| SQuAD$^*$ | 52.9 | 52.4 | 52.4 | 0.0 | 65.5 |
| SVAMP CoT | 30.0 | 28.0 | 33.0 | 14.3 | 44.7 |
| Simple Arithmetic, no spaces | 17.6 | 18.1 | 20.1 | 1.2 | 15.3 |
| Simple Arithmetic, with spaces | 19.5 | 20.6 | 22.1 | 1.8 | 16.0 |
| Social IQA | 71.5 | 70.7 | 69.3 | 69.5 | 84.4 |
| Trivia QA | 54.2 | 53.0 | 55.9 | 25.1 | 51.8 |
| Winogender Female | 50.0 | 46.7 | 50.0 | 41.7 | 58.3 |
| Winogender Male | 55.0 | 58.3 | 60.0 | 63.3 | 58.3 |
| Winograd$^*$ | 82.8 | 83.2 | 84.6 | 79.9 | 83.2 |
| Winogrande$^*$ | 68.0 | 68.5 | 69.0 | 61.8 | 67.6 |
| Core | 46.3 | 46.5 | 47.2 | 30.2 | 49.8 |
| Extended | 31.3 | 30.9 | 32.5 | 16.9 | 37.0 |

Table 13: DCLM evaluation metrics on the Core and Extended task subsets. $^*$=Core tasks. “annealed” is the final pretraining checkpoint we use for OLMoE-1B-7B and was annealed from the checkpoint at step 1,200,000. We left the non-annealing pretraining run train a little longer resulting in the 1,220,000 checkpoint.

表 13｜DCLM 评测: OLMoE-1B-7B 的 step 1,200,000, step 1,220,000 与退火后检查点, 对比 OLMo-1B 与 OLMo-7B; 退火后 Core 47.2, Extended 32.5.

<!-- page 54 of 63 -->

## F Additional Experiments · 补充实验

![](images/datasetredditflan.png)

Figure 26: **Adding Reddit or FLAN to OLMoE-Mix.** More results, logs, and configurations: https://wandb.ai/ai2-llm/olmoe/reports/Plot-Adding-Reddit-FLAN--Vmlldzo4OTg1NTg4

图 26｜在 OLMoE-Mix 中加入 Reddit 或 FLAN 的对比, 各项 loss 与下游指标上都没有一致的提升.

**Adding Reddit or FLAN to OLMoE-Mix** In Figure 26 we benchmark adding the Reddit or FLAN [190] subsets of Dolma 1.7 [163] to our pretraining data mix (§2). Overall, we do not find either one to lead to consistent gains, thus we do not use them in our final data mix.

**向 OLMoE-Mix 加入 Reddit 或 FLAN** 在 Figure 26 中, 我们评测把 Dolma 1.7 [163] 的 Reddit 或 FLAN [190] 子集加入预训练数据 (§2) 的效果. 总体上两者都没有带来一致的提升, 所以最终数据中不使用它们.

**Load balancing precision** Fedus et al. [56] selectively perform operations related to routing in full precision (FP32) to improve stability. In Figure 27, we test whether computing the load balancing loss in full precision improves stability, but do not find it to reduce spikes. Thus, we stick with bfloat16 (BF16).

**负载均衡的精度** Fedus et al. [56] 把与路由相关的部分运算放在全精度 (FP32) 下执行以提升稳定性. 在 Figure 27 中, 我们测试用全精度计算负载均衡损失能否提升稳定性, 但没有发现尖峰减少. 因此我们仍用 bfloat16 (BF16).

**Noise upcycling** For the creation of Qwen2-MoE [13, 180, 201], the authors add 50% of gaussian noise to feedforward networks before continuing training in an upcycled setup [85]. Komatsuzaki et al. [85] also report that they experimented with adding noise but did not find it beneficial. In Figure 28, we experiment with regular upcycling versus adding noise by randomly replacing 50% of each MLP with numbers drawn from a normal distribution with a standard deviation of 0.02

<!-- page 55 of 63 -->

![](images/lblprecision.png)

Figure 27: **Load balancing precision.** More results, logs, and configurations: https://wandb.ai/ai2-llm/olmoe/reports/Plot-FP32-LBL--Vmlldzo4NDMxNDA4

图 27｜负载均衡损失用 BF16 与 FP32 计算的对比, FP32 没有减少 loss 尖峰.

![](images/noise.png)

Figure 28: **Adding noise to the upcycled checkpoint.** More results, logs, and configurations: https://wandb.ai/ai2-llm/olmoe/reports/Plot-Noise-upcycle---Vmlldzo4NDA3MzI2

图 28｜上循环检查点加噪声与不加的对比. 700B token 后不加噪声一组仍略好, 两者趋于同一水平.

![](images/layersharing.png)

Figure 29: **Sharing the same MoE across layers versus a regular dense LM.** The number of experts in the MoE is equivalent to its number of layers. Thus, because the MoE is shared across layers, it has the same number of total and active parameters as the dense model. More results, logs, and configurations: https://wandb.ai/ai2-llm/olmoe/reports/Plot-Shared-vs-Dense--Vmlldzo4NDI0MTc5

图 29｜跨层共享同一个 MoE 与常规 dense LM 的对比. MoE 的专家数等于层数, 所以共享后总参数与激活参数都与 dense 模型相同; 两者表现接近, dense 在验证 loss 与 HellaSwag 上略占优.

following. We find that after 700 billion tokens, the no noise variant still performs slightly better but both appear to converge to the same performance. If training further, it is possible that the noise variant eventually outperforms the no noise variant, but at that point, it may make more sense to just train the MoE from scratch (§4.1.5).

**加噪声的上循环** 构建 Qwen2-MoE [13, 180, 201] 时, 作者在上循环设置 [85] 下继续训练之前, 给前馈网络加入了 50% 的高斯噪声. Komatsuzaki et al. [85] 也报告试过加噪声, 但没有发现益处. 在 Figure 28 中, 我们比较常规上循环与加噪声的上循环: 随机把每个 MLP 的 50% 替换为从标准差 0.02 的正态分布中采样的数. 我们发现训练 700B token 后, 不加噪声的一组仍略好, 但两者似乎收敛到同一水平. 继续训练下去, 加噪声的一组也许最终会超过不加噪声的一组, 但到那时, 直接从零训练 MoE 可能更合理 (§4.1.5).

**Shared Layer** Some work has investigated Mixture-of-Experts with weights shared across layers in the context of Universal Transformers [37, 45, 171]. We test whether layer-shared Mixture-of-Experts can beat non-shared dense models in Figure 29. The layer-shared MoE uses a load balancing loss that is applied at the model level rather than at the layer level. This gives the model more flexibility by allowing it to completely deactivate certain experts for some layers and even emulate a dense model by always activating one separate expert for each layer. This makes it a generalization of the dense model which motivated our hypothesis that it may perform better than the dense model. However, in practice, we find that both perform similarly with the regular dense models

<!-- page 56 of 63 -->

even maintaining a small advantage on validation loss and HellaSwag. One possible advantage of layer-shared MoEs is that they can allow for better load balancing at inference. If prompts come in continuously, then newly incoming prompts can be batched with previous prompts that have already passed through several layers and sent through the MoE module together, as the MoE module is the same regardless of whether it is the first or last layer. Sharing also reduces throughput by around 20% during training, which further motivates our decision not to use it for OLMoE-1B-7B.

**共享层** 有工作在 Universal Transformer 的背景下研究过跨层共享权重的 MoE [37, 45, 171]. 在 Figure 29 中, 我们测试跨层共享的 MoE 能否胜过不共享的 dense 模型. 跨层共享的 MoE 在模型层面而非层的层面施加负载均衡损失. 这给了模型更多灵活性: 它可以在某些层完全停用某些专家, 甚至通过每层始终激活一个不同的专家来模拟 dense 模型. 因此它是 dense 模型的推广, 据此可以推测它可能比 dense 模型更好. 但实际上两者表现接近, 常规 dense 模型在验证 loss 与 HellaSwag 上甚至还略占优势. 跨层共享 MoE 的一个可能优势是推理时负载均衡更好. 如果提示持续到来, 新到的提示可以与已经过了若干层的旧提示拼成一批, 一起送进 MoE 模块, 因为无论是第一层还是最后一层, MoE 模块都是同一个. 共享还会让训练吞吐下降约 20%, 这进一步支持了 OLMoE-1B-7B 不采用它的决定.

**KTO experiments** In Table 14 we experiment with the number of steps (5,000 vs. 10,000) and the optimizer (Adam [83] vs. RMS) used for KTO [54]. Based on these experiments we use the RMS optimizer and the checkpoint at 5,000 steps in §4.3.

**KTO 实验** 在 Table 14 中, 我们对 KTO [54] 的训练步数 (5,000 对 10,000) 与优化器 (Adam [83] 对 RMS) 做了实验. 基于这些实验, §4.3 中我们使用 RMS 优化器与 5,000 step 的检查点.

| Task ($\rightarrow$) | MMLU | GSM8k | BBH | Human-Eval | Alpaca-Eval 1.0 | XSTest | IFEval | Avg |
|---|---|---|---|---|---|---|---|---|
| Setup ($\rightarrow$) | 0-shot | 8-shot CoT | 0-shot | 0-shot | 0-shot | 0-shot | 0-shot | 0-shot |
| Metric ($\rightarrow$) | EM | EM | EM | Pass@10 | %win | F1 | Loose Acc |  |
| KTO, 5,000 steps, RMS | 51.2 | 45.5 | 34.1 | 57.1 | 81.6 | 86.6 | 47.5 | 57.7 |
| KTO, 10,000 steps, RMS | 51.0 | 41.0 | 34.7 | 53.8 | 81.0 | 62.3 | 47.5 | 54.2 |
| KTO, 5,000 steps, Adam | 51.2 | 42.0 | 35.3 | 55.6 | 81.0 | 84.5 | 46.6 | 56.0 |
| KTO, 10,000 steps, Adam | 51.0 | 43.0 | 34.1 | 54.9 | 79.7 | 62.7 | 47.5 | 53.3 |

Table 14: KTO adaptation experiments. 5,000 and 10,000 steps correspond to 1.3 and 2.6 epochs on our adaptation dataset (§2), respectively.

表 14｜KTO 适配实验: 5,000 与 10,000 step (分别约合 1.3 与 2.6 个 epoch) 乘以 RMS 与 Adam 两种优化器; 5,000 step 加 RMS 一组平均 57.7 最高.

## G Additional Analysis · 补充分析

![](images/vocabulary_specialization_top8_olmoe.png)

Figure 30: **Vocabulary specialization for OLMoE-1B-7B when considering all 8 activated experts.** Equivalent to $k=8$ in Equation 8.

图 30｜OLMoE-1B-7B 考虑全部 8 个激活专家时 ($k=8$) 的词表特化, 布局同 Figure 23.

![](images/vocabulary_specialization_top2_mixtral.png)

Figure 31: **Vocabulary specialization for Mixtral-8x7B when considering all 2 activated experts.** Equivalent to $k=2$ in Equation 8.

图 31｜Mixtral-8x7B 考虑全部 2 个激活专家时 ($k=2$) 的词表特化, 布局同 Figure 23.

<!-- page 57 of 63 -->

![](images/routing_prob_distribution_olmoe.png)

![](images/routing_prob_distribution_mixtral.png)

Figure 32: **Vocabulary specialization across domains of OLMoE-1B-7B (top) and Mixtral-8x7B (bottom).** We visualize how often token IDs get routed to specific experts. We only include IDs that appear at least 8 times in the various corpora. Vertical gray lines correspond to uniform routing (8/64=12.5% for OLMoE-1B-7B as it has 64 experts, 8 of which are activated; 2/8=25% for Mixtral as it has 8 experts, 2 of which are activated). For example, among all token IDs in GitHub that get routed to Expert 0 at least 8 times for OLMoE-1B-7B, $\sim$40% of them get routed to Expert 0 with a probability of $\sim$100% (upper left) indicating that Expert 0 is specialized on those token IDs. For OLMoE-1B-7B there is much frequency at the routing probability extremes (0% or 100%) indicating that these experts exclusively focus on certain token IDs, especially for *specific domains* (§5.3) like GitHub and arXiv.

图 32｜OLMoE-1B-7B (上) 与 Mixtral-8x7B (下) 在各领域的词表特化分布: 对出现至少 8 次的 token ID, 统计其被路由到专家 0, 4, 7 的概率分布. OLMoE 在 GitHub 与 arXiv 上有大量 token ID 落在 0% 或 100% 两端.

<!-- page 58 of 63 -->

![](images/routing_tulu_v2.png)

Figure 33: **Load imbalances in selective layers after adaptation.** We visualize how often tokens from our instruction tuning dataset (§2) get routed to the 8 active experts out of the 64 total experts ($k=1$ in Equation 7). Horizontal gray lines correspond to uniform routing (8/64=12.5% per expert). Although we run SFT and DPO without loss balancing loss (§4.3), we observe that the load distribution does not change substantially.

图 33｜适配后若干层的负载分布: 指令微调数据的 token 被路由到 64 个专家中各专家的比例, 对比预训练后, SFT 后与 DPO 后三个模型. 灰色水平线为 8/64=12.5% 的均匀基线, 三者分布差别很小.

<!-- page 59 of 63 -->

![](images/routing_olmoe_v2_top1.png)

![](images/routing_mixtral_v2_top1.png)

Figure 34: **Domain specialization of OLMoE-1B-7B (top) vs. Mixtral-8x7B (bottom) of the top-$1$ routed expert.** We visualize how often tokens from different domains get routed to the 64 (OLMoE) or 8 (Mixtral) experts at the end of pretraining. Unlike in Figure 22, here we only consider tokens routed to the top-1 expert ($k=1$ in Equation 7). Horizontal gray lines correspond to uniform routing (1/64=1.56% per expert for OLMoE-1B-7B and 1/8=12.5% for Mixtral).

图 34｜只看 top-1 专家时 ($k=1$) OLMoE-1B-7B (上) 与 Mixtral-8x7B (下) 的领域特化, 灰色水平线为均匀基线 (OLMoE 1/64=1.56%, Mixtral 1/8=12.5%).

<!-- page 60 of 63 -->

![](images/routing_cross_layer_sankey_olmoe_github.png)

![](images/routing_cross_layer_sankey_olmoe_arxiv.png)

![](images/routing_cross_layer_sankey_olmoe_wikipedia.png)

![](images/routing_cross_layer_sankey_olmoe_book.png)

Figure 35: **OLMoE-1B-7B token routing across layers.** We visualize how often tokens from different domains get routed to a pair of experts across layers under top-1 routing, corresponding to Figure 34. The size of each rectangle is proportional to the total number of tokens an expert receives, while the flow between two experts shows the proportion of tokens routed to both experts. We only show experts that receive tokens 50% above random chance and use stronger coloring for larger flows. We observe some instances of cross-layer coordination between pairs of experts, e.g., expert 27 in layer 7 and expert 57 in layer 15 process a substantial fraction of Wikipedia tokens together. The flows between layers 0 $\to$ 7 and 7 $\to$ 15 are independent in this visualization.

图 35｜OLMoE-1B-7B 在 top-1 路由下的跨层 token 流向 (GitHub, arXiv, Wikipedia, Books 四个领域, layer 0 到 7 到 15). 方块大小是专家收到的 token 量, 连线是同时路由到两个专家的 token 比例; 只画超过随机水平 50% 的专家.

<!-- page 61 of 63 -->

![](images/routing_cross_layer_sankey_mixtral_github.png)

![](images/routing_cross_layer_sankey_mixtral_arxiv.png)

![](images/routing_cross_layer_sankey_mixtral_wikipedia.png)

![](images/routing_cross_layer_sankey_mixtral_book.png)

Figure 36: **Mixtral-8x7B token routing across layers.** We visualize how often tokens from different domains get routed to a pair of experts across layers under top-1 routing, corresponding to Figure 34. The size of each rectangle is proportional to the total number of tokens an expert receives, while the flow between two experts shows the proportion of tokens routed to both experts. The flows between layers 0 $\to$ 7 and 7 $\to$ 15 are independent in this visualization.

图 36｜Mixtral-8x7B 在 top-1 路由下的跨层 token 流向, 画法同 Figure 35.

<!-- page 62 of 63 -->

## H Limitations and Future Work · 局限与未来工作

We highlight four key limitations with this release of OLMoE-1B-7B. We look forward to addressing these issues in future iterations of OLMoE.

我们指出这一版 OLMoE-1B-7B 的四点主要局限, 期待在 OLMoE 后续版本中解决.

**More parameters** OLMoE-1B-7B has 7B total parameters out of which 1B are activated for each input token. This small size makes OLMoE-1B-7B very cheap to use, yet we demonstrate in this work that it outperforms much more expensive models (Figure 1). However, using only 1B parameters for each input token also limits the capabilities of OLMoE-1B-7B as seen by its performance compared to models that use $>$7$\times$ more parameters, such as Llama3.1-8B in §3. While it may be possible that more parameters are not needed to match 8B models and beyond [81], in the short-term adding parameters is an easy way to improve the performance of OLMoE, at least allowing the model to utilize more than 1B parameters per input, possibly via recursion [45] or agentic workflows [187, 202]. Relatedly, changing the allocation of parameters to e.g. vocabulary versus non-vocabulary parameters is another avenue for improvement [172].

**更多参数** OLMoE-1B-7B 共 7B 参数, 每个输入 token 激活其中 1B. 规模小使 OLMoE-1B-7B 用起来很便宜, 而本文也表明它超过了许多贵得多的模型 (Figure 1). 但每个输入 token 只用 1B 参数也限制了 OLMoE-1B-7B 的能力, 这从它与 Llama3.1-8B 等参数多 7 倍以上的模型的对比 (§3) 中可以看出. 也许不需要更多参数就能追平 8B 及更大的模型 [81], 但短期内增加参数是提升 OLMoE 表现的简单办法, 至少让模型对每个输入使用超过 1B 的参数, 途径可以是递归 [45] 或智能体工作流 [187, 202]. 与此相关, 调整参数的分配, 比如词表参数与非词表参数的比例, 也是一个改进方向 [172].

**More data** We train OLMoE-1B-7B for 5 trillion tokens, however, some recent dense models train significantly longer, such as Llama 3 with 15 trillion tokens [50]. To the best of our knowledge, there has been no large MoE that has been overtrained [57] as much as OLMoE-1B-7B. Specifically, taking the active parameters of OLMoE-1B-7B, our token multiplier [57] is around 5,000 (5T / 1B). There are likely benefits to training even longer, but to what degree overtraining is effective for MoEs and how it differs from dense models still requires more research [7].

**更多数据** 我们用 5 万亿 token 训练 OLMoE-1B-7B, 但近期一些 dense 模型训练得长得多, 比如 Llama 3 用了 15 万亿 token [50]. 据我们所知, 还没有大型 MoE 被过训练 [57] 到 OLMoE-1B-7B 的程度. 具体来说, 按 OLMoE-1B-7B 的激活参数算, token 倍数 [57] 约为 5,000 (5T / 1B). 训练更久大概仍有收益, 但过训练对 MoE 的效果有多大, 与 dense 模型有何不同, 还需要更多研究 [7].

**Multimodal** OLMoE-1B-7B is a text-only large language model, thus it cannot take inputs or produce outputs in other modalities like images or audio. This limits its utility for the large variety of multimodal use cases of such models [14, 27, 47, 50, 75, 82, 119, 136, 167]. There has been early work on open multimodal MoEs [95, 98, 112, 125, 157, 194] and we look forward to making future versions of OLMoE a part of that.

**多模态** OLMoE-1B-7B 是纯文本的大语言模型, 不能接收或输出图像, 音频等其他模态. 这限制了它在大量多模态场景中的用处 [14, 27, 47, 50, 75, 82, 119, 136, 167]. 开放多模态 MoE 已有早期工作 [95, 98, 112, 125, 157, 194], 我们期待让 OLMoE 的未来版本也加入其中.

**Multilingual** We pretrain OLMoE-1B-7B on a predominantly English corpus and exclusively evaluate on English tasks. This may severely limit the usefulness of our model for research on non-English language models [53, 108, 160, 165, 197, 223]. While there has been work on training language-specific LMs [55, 110], it is more likely that as we add more data to build better future iterations of OLMoE we will mix in more non-English data due to data constraints [121]. This may make future OLMoE models perform better in non-English languages.

**多语言** 我们在以英语为主的语料上预训练 OLMoE-1B-7B, 并且只在英语任务上评测. 这可能严重限制了模型在非英语语言模型研究中的用处 [53, 108, 160, 165, 197, 223]. 虽然已有训练特定语言 LM 的工作 [55, 110], 但更可能的情况是, 随着我们为构建更好的 OLMoE 后续版本加入更多数据, 受数据量所限, 会混入更多非英语数据 [121]. 这可能让未来的 OLMoE 模型在非英语语言上表现更好.

## I OLMoE-1B-7B-0125

We introduced OLMoE-1B-7B in September 2024. In January 2025, we released a better model, OLMoE-1B-7B-0125, which we discuss here.

我们在 2024 年 9 月推出了 OLMoE-1B-7B. 2025 年 1 月我们发布了更好的模型 OLMoE-1B-7B-0125, 在此介绍.

| Source | Total tokens | Source % | Mix % |
|---|---|---|---|
| Filtered DCLM | 752B | 6.85 | 50.2 |
| Decontaminated FLAN | 17.0B | 100 | 16.7 |
| StackExchange Q&A | 1.26B | 200 | 2.47 |
| peS2o | 58.6B | 16.7 | 9.52 |
| Wikipedia/Wikibooks | 3.70B | 100 | 3.57 |
| Dolmino Math | 10.7B | 200 | 17.5 |

Table 15: Dolmino composition and sampling distribution used for OLMoE-1B-7B-0125.

表 15｜OLMoE-1B-7B-0125 退火所用 Dolmino 数据的构成与采样比例, 其中过滤后的 DCLM 占 50.2%, Dolmino Math 占 17.5%, 去污染的 FLAN 占 16.7%.

For pretraining, OLMoE-1B-7B-0125 uses the same data mix for the first stage of training. Following OLMo 2 [127], we anneal this new model on a curated mix of high-quality sources. 
We sample this mix from the Dolmino dataset,<sup>19</sup> a collection of high-quality web pages, academic content, question answering pairs, instruction data, and math problems. We use the same 100B tokens sample of Dolmino used to anneal OLMo 2 13B; a summary of this dataset is in Table 15.

预训练方面, OLMoE-1B-7B-0125 第一阶段使用相同的数据配比. 参照 OLMo 2 [127], 我们在一个精选的高质量数据混合上对新模型退火. 该混合采样自 Dolmino 数据集,<sup>19</sup> 包含高质量网页, 学术内容, 问答对, 指令数据与数学题. 我们使用退火 OLMo 2 13B 时所用的同一份 100B token Dolmino 样本, 概要见 Table 15.

<sup>19</sup> [`huggingface.co/datasets/allenai/dolmino-mix-1124`](https://huggingface.co/datasets/allenai/dolmino-mix-1124)

<!-- page 63 of 63 -->

| OLMoE release | ARC_C | ARC_E | BoolQ | CSQA | HSwag | MMLU | OBQA | PIQA | SIQA | WinoG | Avg |
|---|---|---|---|---|---|---|---|---|---|---|---|
| Sep 2024 (0924) | 62.1$^\dagger$ | 84.2 | 79.2 | 72.9 | 80.0 | 54.1$^\dagger$ | 65.4$^\dagger$ | 79.8 | 63.0$^\dagger$ | 70.2 | 71.1 |
| Jan 2025 (0125) | 67.5$^\dagger$ | 84.4$^\dagger$ | 80.6 | 70.8 | 81.7 | 56.3$^\dagger$ | 69.6$^\dagger$ | 78.7 | 66.8$^\dagger$ | 70.6 | 72.7 |

Table 16: OLMoE-1B-7B-0924 and OLMoE-1B-7B-0125 on OLMES. We bold the best performance. $^\dagger$ indicates use of the MCF score, see §C for evaluation details.

表 16｜OLMoE-1B-7B-0924 与 OLMoE-1B-7B-0125 在 OLMES 上的对比, 平均从 71.1 升到 72.7.

We compare OLMoE-1B-7B-0125 with OLMoE-1B-7B In Table 16. Overall, the new model is a notable improvement over the previous iteration being better on average (+1.6) and notable datasets like MMLU (+2.1).

在 Table 16 中我们比较 OLMoE-1B-7B-0125 与 OLMoE-1B-7B. 总体上新模型比上一版有明显提升, 平均分更高 (+1.6), MMLU 等重要数据集也更高 (+2.1).

Following this improved annealing setup, we adapt OLMoE-1B-7B-0125 using the post-training from Tülu 3 [87]. This recipe represents an updated version of the one originally used for OLMoE. It features an improved SFT mix, better sampled DPO data, and a PPO step that leverages verifiers as for the model reward. We compare this new iteration using the evaluation setup from Tülu (which differs from other evaluations in this paper) in Table 17. After adaptation, the new model is significantly better, with a 10-point gain on the benchmark average.

沿用这一改进的退火设置, 我们用 Tülu 3 [87] 的后训练流程适配 OLMoE-1B-7B-0125. 这一配方是 OLMoE 原先所用配方的更新版, 包含改进的 SFT 数据, 采样更好的 DPO 数据, 以及一个用验证器提供奖励的 PPO 步骤. 我们用 Tülu 的评测设置 (与本文其他评测不同) 比较新版本, 见 Table 17. 适配后新模型明显更好, 基准平均分提高 10 分.

| Skill | Benchmark (eval) | OLMoE-1B-7B-0924 +SFT | OLMoE-1B-7B-0924 +DPO | OLMoE-1B-7B-0125 +SFT | OLMoE-1B-7B-0125 +DPO | OLMoE-1B-7B-0125 +RLVR |
|---|---|---|---|---|---|---|
|  | Avg. | 39.7 | 39.8 | 46.6 | 49.3 | **49.8** |
| Knowledge | MMLU (0 shot, CoT) | 54.3 | 54.6 | **55.3** | 54.9 | 55.1 |
|  | PopQA (15 shot) | **21.0** | 20.6 | 20.1 | 19.7 | 19.8 |
|  | TruthfulQA (6 shot) | 44.7 | 49.1 | 45.5 | 50.0 | **50.6** |
| Reasoning | BigBenchHard (3 shot, CoT) | 36.6 | 36.8 | 37.3 | 37.4 | **38.6** |
|  | DROP (3 shot) | 34.7 | 34.5 | **48.6** | 48.4 | 47.9 |
| Math | MATH (4 shot CoT, Flex) | 8.2 | 8.2 | **21.4** | 20.4 | **21.4** |
|  | GSM8K (8 shot, CoT) | 42.5 | 47.4 | 55.7 | 64.6 | **72.4** |
| Coding | HumanEval (pass@10) | **63.7** | 63.0 | 62.6 | 61.9 | 62.3 |
|  | HumanEval+ (pass@10) | 57.4 | **58.9** | 55.7 | 57.6 | 54.4 |
| IF & chat | IFEval (prompt loose) | 41.2 | 45.3 | 56.6 | 65.6 | **66.4** |
|  | AlpacaEval 2 (LC % win) | 6.4 | 7.5 | 5.8 | **19.5** | 18.0 |
| Safety | Safety (6 task avg.) | 65.8 | 51.4 | **94.5** | 91.4 | 90.4 |

Table 17: OLMoE-1B-7B-0924 and OLMoE-1B-7B-0125 after adaptation. We bold the best performance.

表 17｜OLMoE-1B-7B-0924 与 OLMoE-1B-7B-0125 适配后的对比 (Tülu 3 评测设置). 0125 的 +RLVR 平均 49.8, 0924 的 +DPO 为 39.8.

The new models and datasets are freely available on the Hugging Face hub.<sup>20</sup> For more information about this release, we refer to its announcement on Ai2's website.<sup>21</sup>

新的模型与数据集已在 Hugging Face hub 上免费提供.<sup>20</sup> 关于这次发布的更多信息, 参见 Ai2 网站上的公告.<sup>21</sup>

<sup>20</sup> [hf.co/collections/allenai/olmoe-january-2025-67992134f9ebea0a941706ca](https://hf.co/collections/allenai/olmoe-january-2025-67992134f9ebea0a941706ca)

<sup>21</sup> [allenai.org/blog/olmoe-app](https://web.archive.org/web/20250212023046/https://allenai.org/blog/olmoe-app)
