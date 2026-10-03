---
title: "Mixtral 8x7B · 对照译稿"
category: "模型库"
tags: ["Mistral", "对照译稿"]
published: true
excerpt: "Mixtral 8x7B 公开材料的逐段中英对照译稿,附读报告时的疑问块."
---
源文: arXiv:2401.04088v1, Mixtral of Experts, 13 页, 16 张图. 英文段在前, 中文意译紧跟. 参考文献 (第 9 至 11 页) 不译; 单独的页码行已删去, 跨页断开的半句已接回; 表 3, 表 4, 表 5 的表头按 PDF 原版重排.

<!-- page 1 of 13 -->

arXiv:2401.04088v1 [cs.LG] 8 Jan 2024

arXiv 编号 2401.04088v1, 分类 cs.LG, 日期 2024 年 1 月 8 日.

# Mixtral of Experts (Mixtral: 一个稀疏 MoE 语言模型)

**Albert Q. Jiang, Alexandre Sablayrolles, Antoine Roux, Arthur Mensch, Blanche Savary, Chris Bamford, Devendra Singh Chaplot, Diego de las Casas, Emma Bou Hanna, Florian Bressand, Gianna Lengyel, Guillaume Bour, Guillaume Lample, Lélio Renard Lavaud, Lucile Saulnier, Marie-Anne Lachaux, Pierre Stock, Sandeep Subramanian, Sophia Yang, Szymon Antoniak, Teven Le Scao, Théophile Gervet, Thibaut Lavril, Thomas Wang, Timothée Lacroix, William El Sayed**

作者共 26 人, 名单原样保留, 从 Albert Q. Jiang 到 William El Sayed.

![Mistral AI 标志: 橙黄渐变, 带深棕色立体阴影的斜排字样 Mistral.AI](images/p01-abstract.png)

## Abstract

We introduce Mixtral 8x7B, a Sparse Mixture of Experts (SMoE) language model. Mixtral has the same architecture as Mistral 7B, with the difference that each layer is composed of 8 feedforward blocks (i.e. experts). For every token, at each layer, a router network selects two experts to process the current state and combine their outputs. Even though each token only sees two experts, the selected experts can be different at each timestep. As a result, each token has access to 47B parameters, but only uses 13B active parameters during inference. Mixtral was trained with a context size of 32k tokens and it outperforms or matches Llama 2 70B and GPT-3.5 across all evaluated benchmarks. In particular, Mixtral vastly outperforms Llama 2 70B on mathematics, code generation, and multilingual benchmarks. We also provide a model finetuned to follow instructions, Mixtral 8x7B – Instruct, that surpasses GPT-3.5 Turbo, Claude-2.1, Gemini Pro, and Llama 2 70B – chat model on human benchmarks. Both the base and instruct models are released under the Apache 2.0 license.

本文介绍 Mixtral 8x7B, 一个稀疏 MoE (SMoE) 语言模型. Mixtral 的架构与 Mistral 7B 相同, 区别只在于每一层由 8 个前馈块 (也就是专家) 组成. 对每个 token, 每一层的 router 网络选出两个专家处理当前状态, 再把两者的输出组合起来. 每个 token 虽然只经过两个专家, 但每个时间步选中的专家可以不同. 这样每个 token 能用到的参数有 47B, 推理时实际激活的只有 13B. Mixtral 用 32k token 的上下文训练, 在所有评测过的基准上都超过或持平 Llama 2 70B 和 GPT-3.5, 在数学, 代码生成和多语言基准上大幅领先 Llama 2 70B. 作者还提供了一个按指令微调的版本 Mixtral 8x7B – Instruct, 在人工评测基准上超过 GPT-3.5 Turbo, Claude-2.1, Gemini Pro 和 Llama 2 70B – chat. 基座模型和指令模型都以 Apache 2.0 许可发布.

> **想:** 名字 「8x7B」 按字面乘是 56B, 摘要印的总参数却是 47B, 激活参数是 13B, 这四个数各指什么?
> 名字里的 8 是表 1 的 num_experts (每层 8 个专家), 7B 是基座 Mistral 7B 的规模标签; 页面上的 47B 是总参数 (第 3 页称 sparse 参数量), 13B 是每个 token 的激活参数. 按表 1 估算: 每个专家 3 × 4096 × 14336 ≈ 1.76 亿, 32 层 8 个专家约 45.1B; 注意力, 路由器和嵌入只有一份, 约 1.6B; 合计约 46.7B. 只有 FFN 换成了 8 份, 注意力和嵌入不跟着乘 8, 所以到不了 56B. 激活部分是 1.6B 加 2 个专家的 11.3B, 约 12.9B.

**Code:** [https://github.com/mistralai/mistral-src](https://github.com/mistralai/mistral-src)

**Webpage:** [https://mistral.ai/news/mixtral-of-experts/](https://mistral.ai/news/mixtral-of-experts/)

代码: https://github.com/mistralai/mistral-src. 网页: https://mistral.ai/news/mixtral-of-experts/.

## 1 Introduction

In this paper, we present Mixtral 8x7B, a sparse mixture of experts model (SMoE) with open weights, licensed under Apache 2.0. Mixtral outperforms Llama 2 70B and GPT-3.5 on most benchmarks. As it only uses a subset of its parameters for every token, Mixtral allows faster inference speed at low batch-sizes, and higher throughput at large batch-sizes.

本文介绍 Mixtral 8x7B, 一个开放权重的稀疏 MoE 模型 (SMoE), 采用 Apache 2.0 许可. Mixtral 在多数基准上超过 Llama 2 70B 和 GPT-3.5. 由于每个 token 只用到一部分参数, Mixtral 在小 batch 下推理更快, 在大 batch 下吞吐更高.

> **问:** 摘要说 「across all evaluated benchmarks」 都超过或持平, 这一段又只说 「most benchmarks」, 哪个说法和表对得上?
> 「most」 对得上. 第 4 页表 2 里 Mixtral 有三列低于 Llama 2 70B: HellaS 84.4 对 85.4, WinoG 77.2 对 80.4, TriQA 71.5 对 73.0; 第 5 页表 3 的 WinoGrande 81.2 同时低于 Llama 2 70B 的 83.2 和 GPT-3.5 的 81.6. 摘要里的 「all」 说得过了.

Mixtral is a sparse mixture-of-experts network. It is a decoder-only model where the feedforward block picks from a set of 8 distinct groups of parameters. At every layer, for every token, a router network chooses two of these groups (the “experts”) to process the token and combine their output additively. This technique increases the number of parameters of a model while controlling cost and latency, as the model only uses a fraction of the total set of parameters per token.

Mixtral 是一个稀疏 MoE 网络, 结构为 decoder-only, 前馈块从 8 组不同的参数里挑选. 在每一层, 对每个 token, router 网络从这些组里选出两组 (即 「专家」) 处理该 token, 并把输出相加合并. 这种做法让模型的参数量上去, 成本和延迟却受控, 因为每个 token 只用到全部参数中的一小部分.

Mixtral is pretrained with multilingual data using a context size of 32k tokens. It either matches or exceeds the performance of Llama 2 70B and GPT-3.5, over several benchmarks. In particular, Mixtral demonstrates superior capabilities in mathematics, code generation, and tasks that require multilingual understanding, significantly outperforming Llama 2 70B in these domains.

Mixtral 用多语言数据预训练, 上下文长度 32k token. 在若干基准上, 它持平或超过 Llama 2 70B 和 GPT-3.5. 尤其在数学, 代码生成和需要多语言理解的任务上, Mixtral 表现更强, 在这些领域明显领先 Llama 2 70B.

<!-- page 2 of 13 -->

![图 1 MoE 层示意: inputs 进入 router, router 引出两条实线箭头指向两个 expert, 其余 expert 画成半透明的叠层; router 上方的虚线 gating weights 把权重送到输出端, 两个 expert 的输出在加号节点合成 outputs](images/p02-figure-1-mixture-of-experts-layer-each-input-vector-is.png)

Figure 1: Mixture of Experts Layer. Each input vector is assigned to 2 of the 8 experts by a router. The layer’s output is the weighted sum of the outputs of the two selected experts. In Mixtral, an expert is a standard feedforward block as in a vanilla transformer architecture.

图 1: MoE 层. router 把每个输入向量分给 8 个专家中的 2 个. 这一层的输出是两个被选中专家输出的加权和. 在 Mixtral 里, 一个专家就是普通 transformer 架构中的标准前馈块.

> **核对:** 图 1 里能数出 8 个专家吗?
> 数不出. 图 1 只把两个被选中的 expert 画成实框, 各接一条来自 router 的实线箭头, 其余画成层层叠开的半透明框, 张数看不清. 「8」 和 「2」 来自图注和第 2 页表 1 的 num_experts = 8, top_k_experts = 2, 图本身只表达 「选两个, 加权求和」 这个结构.

Experiments show that Mixtral is able to successfully retrieve information from its context window of 32k tokens, regardless of the sequence length and the location of the information in the sequence.

实验表明, 不论序列多长, 信息在序列中的什么位置, Mixtral 都能从 32k token 的上下文窗口里把信息找回来.

We also present Mixtral 8x7B – Instruct, a chat model fine-tuned to follow instructions using supervised fine-tuning and Direct Preference Optimization [25]. Its performance notably surpasses that of GPT-3.5 Turbo, Claude-2.1, Gemini Pro, and Llama 2 70B – chat model on human evaluation benchmarks. Mixtral – Instruct also demonstrates reduced biases, and a more balanced sentiment profile in benchmarks such as BBQ, and BOLD.

作者还推出 Mixtral 8x7B – Instruct, 这是用 SFT 和 DPO [25] 微调来遵循指令的对话模型. 在人工评测基准上, 它明显超过 GPT-3.5 Turbo, Claude-2.1, Gemini Pro 和 Llama 2 70B – chat. 在 BBQ, BOLD 等基准上, Mixtral – Instruct 的偏差也更小, 情感分布更均衡.

We release both Mixtral 8x7B and Mixtral 8x7B – Instruct under the Apache 2.0 license<sup>1</sup>, free for academic and commercial usage, ensuring broad accessibility and potential for diverse applications. To enable the community to run Mixtral with a fully open-source stack, we submitted changes to the vLLM project, which integrates Megablocks CUDA kernels for efficient inference. Skypilot also allows the deployment of vLLM endpoints on any instance in the cloud.

Mixtral 8x7B 和 Mixtral 8x7B – Instruct 都以 Apache 2.0 许可<sup>1</sup>发布, 学术和商业使用均免费, 便于广泛获取和多样化应用. 为了让社区能用完全开源的软件栈运行 Mixtral, 作者向 vLLM 项目提交了改动, 集成 Megablocks 的 CUDA kernel 来高效推理. Skypilot 也支持在云上任意实例部署 vLLM 服务端点.

## 2 Architectural details (架构细节)

Mixtral is based on a transformer architecture [31] and uses the same modifications as described in [18], with the notable exceptions that Mixtral supports a fully dense context length of 32k tokens, and the feedforward blocks are replaced by Mixture-of-Expert layers (Section 2.1). The model architecture parameters are summarized in Table 1.

Mixtral 基于 transformer 架构 [31], 沿用 [18] 所述的改动, 两处例外值得注意: Mixtral 支持完全稠密的 32k token 上下文, 前馈块换成了 MoE 层 (第 2.1 节). 模型架构参数汇总在表 1.

## 2.1 Sparse Mixture of Experts (稀疏 MoE)

We present a brief overview of the Mixture of Experts layer (Figure 1). For a more in-depth overview, see [12]. The output of the MoE module for a given input x is determined by the weighted sum of the outputs of the expert networks, where the weights are given by the gating network’s output. i.e. given n expert networks $\{E_0, E_i, \dots, E_{n-1}\}$, the output of the expert layer is given by:

这里简要介绍 MoE 层 (图 1), 更深入的综述见 [12]. 对给定输入 x, MoE 模块的输出是各专家网络输出的加权和, 权重由门控网络的输出给出. 也就是说, 给定 n 个专家网络 $\{E_0, E_i, \dots, E_{n-1}\}$, 专家层的输出为:

| Parameter | Value |
| --- | --- |
| dim | 4096 |
| n_layers | 32 |
| head_dim | 128 |
| hidden_dim | 14336 |
| n_heads | 32 |
| n_kv_heads | 8 |
| context_len | 32768 |
| vocab_size | 32000 |
| num_experts | 8 |
| top_k_experts | 2 |

Table 1: Model architecture.

表 1: 模型架构. 各行依次是隐藏维度, 层数, 每头维度, FFN 中间维度, 查询头数, KV 头数, 上下文长度, 词表大小, 专家数, 每个 token 选用的专家数.

> **看表:** 表 1 的 n_heads 32 和 n_kv_heads 8 放在一起, 32k 上下文的 KV cache 有多大?
> 表 1 给了 head_dim 128, 32 × 128 = 4096 正好等于 dim; KV 头是查询头的 1/4. 每个 token 每层存 K 和 V 各 8 × 128 个数, 32 层共 65,536 个数, 按 2 字节存约 128 KiB; context_len 32768 个 token 满载约 4 GiB. 若 KV 头也是 32 个, 会是约 16 GiB (未计批大小).

> **拆开:** 表 1 的 hidden_dim 14336 是每个专家的中间维, 还是 8 个专家加起来?
> 是每个专家的. 按第 3 页 「SwiGLU 作为专家函数」 计, 单个专家三块矩阵 3 × 4096 × 14336 ≈ 1.76 亿参数, 用这个数才能把总参数拼到约 46.7B, 与摘要的 47B 对上. 如果 14336 是 8 个专家的总和, 每个专家只剩 1792 维, 总参数会掉到 7B 上下, 和页面的 47B 对不上.

> **确认:** 第 2 节说和 [18] 不同之处是 「fully dense context length of 32k」, 表 1 里哪一行体现这一点?
> 表 1 只有 context_len 32768, 没有滑动窗口一类的行. [18] 是 Mistral 7B, 用的是 SWA; 这里说 「fully dense」, 意思是 32768 个位置之间都做完整注意力, 不再按窗口截断. 第 5 页图 4 左的 passkey 测试一直做到约 32K, 与这一行对应.

$$
\sum_ {i = 0} ^ {n - 1} G (x) _ {i} \cdot E _ {i} (x).
$$

Here, $G(x)_i$ denotes the n-dimensional output of the gating network for the i-th expert, and $E_i(x)$ is the output of the i-th expert network. If the gating vector is sparse, we can avoid computing the outputs of experts whose gates are zero. There are multiple alternative ways of implementing $G(x)$ [6, 15, 35], but a simple and performant one is implemented by taking the softmax over the Top-K logits of a linear layer [28]. We use

这里 $G(x)_i$ 表示门控网络对第 i 个专家的 n 维输出, $E_i(x)$ 是第 i 个专家网络的输出. 如果门控向量是稀疏的, 门值为零的专家就不必计算输出. $G(x)$ 有多种实现方式 [6, 15, 35], 其中一种简单且效果好的做法, 是对一个线性层的 Top-K logits 取 softmax [28]. 本文采用

$$
G (x) := \operatorname{Softmax} (\operatorname{TopK} (x \cdot W _ {g})),
$$

> **回看:** 这一段里有两处写法和公式本身对不上, 是哪两处?
> 一处是专家集合写成 $\{E_0, E_i, \dots, E_{n-1}\}$, 第二项按上下文应是 $E_1$, PDF 原文就印作 $E_i$. 另一处是 「$G(x)_i$ denotes the n-dimensional output」: 按上面的求和式, n 维的是整个向量 $G(x)$, $G(x)_i$ 是它的第 i 个分量, 是一个标量.

where $(\operatorname{TopK}(\ell))_i := \ell_i$ if $\ell_i$ is among the top-K coordinates of logits $\ell \in \mathbb{R}^n$ and $(\operatorname{TopK}(\ell))_i := -\infty$ otherwise. The value of K – the number of experts used per token – is a hyper-parameter that modulates the amount of compute used to process each token. If one increases n while keeping K fixed, one can increase the model’s parameter count while keeping its computational cost effectively constant.

其中, 若 $\ell_i$ 位于 logits $\ell \in \mathbb{R}^n$ 的前 K 个坐标之中, 则 $(\operatorname{TopK}(\ell))_i := \ell_i$, 否则 $(\operatorname{TopK}(\ell))_i := -\infty$. K 是每个 token 使用的专家数, 这个超参数决定处理每个 token 要花多少计算. 保持 K 不变而增大 n, 就能在计算成本基本不变的情况下增加模型参数量.

> **停一下:** 先 TopK 再 Softmax, 两个被选中专家的权重加起来是多少, 没被选中的 6 个呢?
> 按上面 $G(x)$ 的定义, 未入选的坐标被置为 $-\infty$, softmax 后正好是 0; 剩下两个坐标在彼此之间归一化, 权重之和为 1. 所以第 3 页 y 的公式虽然写成对 i 从 0 到 n-1 求和, 实际只有两项非零, 这也是 「门值为零的专家不必计算」 的来源.

<small><span class="docvortex-page-footnote" data-block-type="page_footnote" style="color:#6b7280"><sup>1</sup>[https://mistral.ai/news/mixtral-of-experts/](https://mistral.ai/news/mixtral-of-experts/)</span></small>

脚注 1: https://mistral.ai/news/mixtral-of-experts/.

<!-- page 3 of 13 -->

This motivates a distinction between the model’s total parameter count (commonly referenced as the **sparse** parameter count), which grows with n, and the number of parameters used for processing an individual token (called the **active** parameter count), which grows with K up to n.

由此要区分两个量: 模型的总参数量 (通常称为 **sparse** 参数量), 随 n 增长; 处理单个 token 所用的参数量 (称为 **active** 参数量), 随 K 增长, 最多到 n 为止.

> **再看:** 「grows with K up to n」 落到 Mixtral 上, K 从 2 调到 8 时激活参数会变成多少?
> 用表 1 估算: 非专家部分 (注意力, 路由器, 嵌入) 约 1.6B, 每多选一个专家, 32 层共多约 5.64B. K = 2 时约 12.9B, 与页面的 13B 对上; K = 8 时约 46.7B, 就等于总参数. 这说明页面上的 13B 和 47B 是同一张表 1 在 K = 2 和 K = n 两端的读数.

MoE layers can be run efficiently on single GPUs with high performance specialized kernels. For example, Megablocks [13] casts the feed-forward network (FFN) operations of the MoE layer as large sparse matrix multiplications, significantly enhancing the execution speed and naturally handling cases where different experts get a variable number of tokens assigned to them. Moreover, the MoE layer can be distributed to multiple GPUs through standard Model Parallelism techniques, and through a particular kind of partitioning strategy called Expert Parallelism (EP) [28]. During the MoE layer’s execution, tokens meant to be processed by a specific expert are routed to the corresponding GPU for processing, and the expert’s output is returned to the original token location. Note that EP introduces challenges in load balancing, as it is essential to distribute the workload evenly across the GPUs to prevent overloading individual GPUs or hitting computational bottlenecks.

借助高性能专用 kernel, MoE 层可以在单卡上高效运行. 例如 Megablocks [13] 把 MoE 层的前馈网络 (FFN) 运算写成大型稀疏矩阵乘法, 明显提高执行速度, 也自然处理了不同专家分到的 token 数量不一的情况. 此外, MoE 层可以用标准的模型并行技术分布到多张 GPU 上, 也可以用一种专门的切分策略, 即专家并行 (EP) [28]. 执行 MoE 层时, 要由某个专家处理的 token 被路由到对应的 GPU, 专家的输出再送回 token 原来的位置. 注意 EP 带来负载均衡的难题: 必须把工作量均匀分到各卡, 以免个别 GPU 过载或撞上计算瓶颈.

In a Transformer model, the MoE layer is applied independently per token and replaces the feed-forward (FFN) sub-block of the transformer block. For Mixtral we use the same SwiGLU architecture as the expert function $E_i(x)$ and set $K = 2$. This means each token is routed to two SwiGLU sub-blocks with different sets of weights. Taking this all together, the output y for an input token x is computed as:

在 Transformer 模型中, MoE 层对每个 token 独立作用, 替换 transformer 块里的前馈 (FFN) 子块. Mixtral 用同样的 SwiGLU 结构作为专家函数 $E_i(x)$, 并取 $K = 2$. 也就是说, 每个 token 被送到两个权重不同的 SwiGLU 子块. 综合起来, 输入 token x 的输出 y 按下式计算:

$$
y = \sum_ {i = 0} ^ {n - 1} \operatorname{Softmax} (\operatorname{Top2} (x \cdot W _ {g})) _ {i} \cdot \operatorname{SwiGLU} _ {i} (x).
$$

This formulation is similar to the GShard architecture [21], with the exceptions that we replace all FFN sub-blocks by MoE layers while GShard replaces every other block, and that GShard uses a more elaborate gating strategy for the second expert assigned to each token.

这个形式与 GShard 架构 [21] 相似, 区别有两点: 本文把所有 FFN 子块都换成 MoE 层, GShard 只隔一块换一次; GShard 为每个 token 分配第二个专家时用了更复杂的门控策略.

> **对一下:** 「所有 FFN 子块都换成 MoE 层」, 在本文哪张图上能看出来?
> 表 1 的 n_layers 是 32; 第 13 页图 10 的横轴从第 0 层画到第 31 层, 每一层都有专家重复分配的比例点, 说明 32 层每层都有 router 和 8 个专家. 若像 GShard 那样隔层替换, 图 10 只会有 16 个层有数据.

## 3 Results (结果)

We compare Mixtral to Llama, and re-run all benchmarks with our own evaluation pipeline for fair comparison. We measure performance on a wide variety of tasks categorized as follow:

作者把 Mixtral 与 Llama 比较, 为了公平, 所有基准都用自家评测流程重新跑过. 评测覆盖多种任务, 分类如下:

- **Commonsense Reasoning (0-shot):** Hellaswag [32], Winogrande [26], PIQA [3], SIQA [27], OpenbookQA [22], ARC-Easy, ARC-Challenge [8], CommonsenseQA [30]
- **常识推理 (0-shot):** Hellaswag [32], Winogrande [26], PIQA [3], SIQA [27], OpenbookQA [22], ARC-Easy, ARC-Challenge [8], CommonsenseQA [30]
- **World Knowledge (5-shot):** NaturalQuestions [20], TriviaQA [19]
- **世界知识 (5-shot):** NaturalQuestions [20], TriviaQA [19]
- **Reading Comprehension (0-shot):** BoolQ [7], QuAC [5]
- **阅读理解 (0-shot):** BoolQ [7], QuAC [5]
- **Math:** GSM8K [9] (8-shot) with maj@8 and MATH [17] (4-shot) with maj@4
- **数学:** GSM8K [9] (8-shot, maj@8) 和 MATH [17] (4-shot, maj@4)
- **Code:** Humaneval [4] (0-shot) and MBPP [1] (3-shot)
- **代码:** Humaneval [4] (0-shot) 和 MBPP [1] (3-shot)
- **Popular aggregated results:** MMLU [16] (5-shot), BBH [29] (3-shot), and AGI Eval [34] (3-5-shot, English multiple-choice questions only)
- **常用综合榜:** MMLU [16] (5-shot), BBH [29] (3-shot), AGI Eval [34] (3 到 5-shot, 只用英文选择题)

> **想:** 常识推理列了 8 个基准, 阅读理解列了 2 个, 表 2 里能找到几个?
> 第 4 页表 2 只有 HellaS, WinoG, PIQA, Arc-e, Arc-c 五个常识推理列; SIQA, OpenbookQA, CommonsenseQA 不在表里, 阅读理解的 BoolQ 和 QuAC 一个都没有. 所以图 2 的 Reasoning 和 Comprehension 两组柱子没法用表 2 复算, 只能读图.

![图 2 左半柱状图: MMLU, Knowledge, Reasoning, Comprehension 四组, 每组六个模型; Mixtral 8x7B (浅黄) 约为 70.6, 57.5, 71.2, 65.8, LLaMA 2 70B (深绿) 约为 69.9, 56.5, 70.7, 67.0](images/p03-chart.png)

![图 2 右半柱状图: AGI Eval, Math, BBH, Code 四组; Mixtral 8x7B 约为 51.4, 51.4, 42.0, 50.5, LLaMA 2 70B 约为 53.7, 41.7, 45.2, 39.6, Mistral 7B 约为 42.4, 31.3, 38.4, 38.2](images/p03-figure-2-performance-of-mixtral-and-different-llama.png)

Figure 2: Performance of Mixtral and different Llama models on a wide range of benchmarks. All models were re-evaluated on all metrics with our evaluation pipeline for accurate comparison. Mixtral outperforms or matches Llama 2 70B on all benchmarks. In particular, it is vastly superior in mathematics and code generation.

图 2: Mixtral 与各 Llama 模型在多种基准上的表现. 为了比较准确, 所有模型的所有指标都用作者的评测流程重新评过. Mixtral 在所有基准上超过或持平 Llama 2 70B, 在数学和代码生成上优势尤其大.

> **问:** 图注说 「on all benchmarks」 超过或持平, 图 2 自己的柱子支持这句话吗?
> 不完全支持. 读图: 右半的 AGI Eval 上 Mixtral 约 51.4, LLaMA 2 70B 约 53.7; BBH 上约 42.0 对 45.2; 左半 Comprehension 约 65.8 对 67.0. 三组都是 LLaMA 2 70B 的柱子更高, 差距 1 到 3 个点, 不能算持平.

> **核对:** 图 2 的 Math, Code, Knowledge 三组能用表 2 的列平均出来吗?
> Math 和 Code 可以: Mixtral 的 Math = (74.4 + 28.4) / 2 = 51.4, Code = (40.2 + 60.7) / 2 ≈ 50.5; LLaMA 2 70B 的 Math = 41.7, Code ≈ 39.6, 都与图 2 读数一致. Knowledge 不行: 表 2 的 (NQ 30.6 + TriQA 71.5) / 2 ≈ 51.1, 图上 Mixtral 约 57.5; LLaMA 2 70B 算出来约 49.2, 图上约 56.5 (读图). 图 2 的 Knowledge 比表 2 两列平均高 6 到 8 个点, 页面没有说明用的是哪套设置.

<!-- page 4 of 13 -->

| Model | Active Params | MMLU | HellaS | WinoG | PIQA | Arc-e | Arc-c | NQ | TriQA | HumanE | MBPP | Math | GSM8K |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| LLaMA 2 7B | 7B | 44.4% | 77.1% | 69.5% | 77.9% | 68.7% | 43.2% | 17.5% | 56.6% | 11.6% | 26.1% | 3.9% | 16.0% |
| LLaMA 2 13B | 13B | 55.6% | 80.7% | 72.9% | 80.8% | 75.2% | 48.8% | 16.7% | 64.0% | 18.9% | 35.4% | 6.0% | 34.3% |
| LLaMA 1 33B | 33B | 56.8% | 83.7% | 76.2% | 82.2% | 79.6% | 54.4% | 24.1% | 68.5% | 25.0% | 40.9% | 8.4% | 44.1% |
| LLaMA 2 70B | 70B | 69.9% | 85.4% | 80.4% | 82.6% | 79.9% | 56.5% | 25.4% | 73.0% | 29.3% | 49.8% | 13.8% | 69.6% |
| Mistral 7B | 7B | 62.5% | 81.0% | 74.2% | 82.2% | 80.5% | 54.9% | 23.2% | 62.5% | 26.2% | 50.2% | 12.7% | 50.0% |
| Mixtral 8x7B | 13B | 70.6% | 84.4% | 77.2% | 83.6% | 83.1% | 59.7% | 30.6% | 71.5% | 40.2% | 60.7% | 28.4% | 74.4% |

Table 2: Comparison of Mixtral with Llama. Mixtral outperforms or matches Llama 2 70B performance on almost all popular benchmarks while using 5x fewer active parameters during inference.

表 2: Mixtral 与 Llama 的比较. Mixtral 在几乎所有常用基准上超过或持平 Llama 2 70B, 推理时的激活参数却少 5 倍.

> **看表:** 表 2 里 Mixtral 对 Llama 2 70B 究竟赢几列, 输几列? 「5x」 是怎么来的?
> 12 列里赢 9 列, 输 3 列. 赢得最多的是 Math (+14.6), HumanE (+10.9), MBPP (+10.9); MMLU 只高 0.7; 输的是 HellaS (-1.0), WinoG (-3.2), TriQA (-1.5). 「5x」 按表 2 的 Active Params 列算是 70B / 13B ≈ 5.4, 注意 Mixtral 这一格填的是激活参数 13B, 不是总参数 47B.

![图 3 MMLU 面板: 横轴激活参数 7B, 13B, 34B, 70B; 橙线从 Mistral 7B 的 62.5 连到 Mixtral 8x7B 的 70.6, 红线 LLaMA 2 从 7B 约 44 升到 70B 约 70](images/p04-chart.png)

![图 3 Knowledge 面板: Mistral 7B 约 48.5, Mixtral 8x7B 约 57.5; LLaMA 2 三点约 44.2, 49.3, 56.5](images/p04-chart-2.png)

![图 3 Reasoning 面板: Mistral 7B 约 68.6, Mixtral 8x7B 约 71.2; LLaMA 2 三点约 63.4, 66.2, 70.7](images/p04-chart-3.png)

![图 3 Comprehension 面板: Mistral 7B 约 63.4, Mixtral 8x7B 约 65.8; LLaMA 2 三点约 58.9, 63.3, 67.0, 70B 这一点高于 Mixtral](images/p04-chart-4.png)

![图 3 Math 面板: Mistral 7B 约 31.3, Mixtral 8x7B 约 51.4; LLaMA 2 三点约 10.0, 20.2, 41.7](images/p04-chart-5.png)

![图 3 Code 面板: Mistral 7B 约 38.2, Mixtral 8x7B 约 50.5; LLaMA 2 三点约 18.8, 27.2, 39.6; 图例为橙色 Mistral, 红色 LLaMA 2](images/p04-figure-3-results-on-mmlu-commonsense-reasoning-world.png)

Figure 3: Results on MMLU, commonsense reasoning, world knowledge and reading comprehension, math and code for Mistral (7B/8x7B) vs Llama 2 (7B/13B/70B). Mixtral largely outperforms Llama 2 70B on all benchmarks, except on reading comprehension benchmarks while using 5x lower active parameters. It is also vastly superior to Llama 2 70B on code and math.

图 3: Mistral (7B/8x7B) 与 Llama 2 (7B/13B/70B) 在 MMLU, 常识推理, 世界知识, 阅读理解, 数学和代码上的结果. 除阅读理解外, Mixtral 在所有基准上都大幅超过 Llama 2 70B, 激活参数却少 5 倍. 在代码和数学上, 它对 Llama 2 70B 的优势尤其大.

> **拆开:** 这一页的 Llama 1 到底是 33B 还是 34B?
> 两种写法都印在本文里. 表 2 行名和 Active Params 写 33B, 第 5 页表 4 也写 33B; 本页正文和脚注 2 写 「Llama 1 34B」, 第 3 页图 2 图例写 「LLaMA 1 34B」. 表 2 的数字是同一个模型, 34B 这个叫法来自脚注的理由 「Llama 2 34B 没开源」, 模型本身在表里标的是 33B.

> **确认:** 图 3 的横轴上 Mixtral 放在哪个位置? 34B 刻度上为什么没有点?
> 横轴标签是 「Active Params」, Mixtral 的方块画在 13B, 按激活参数放, 没有放在 47B. LLaMA 2 红线只有 7B, 13B, 70B 三个点, 34B 刻度空着, 与脚注 2 「Llama 2 34B 未开源」 一致; 表 2 里的 LLaMA 1 33B 没画进图 3.

Detailed results for Mixtral, Mistral 7B and Llama 2 7B/13B/70B and Llama 1 34B<sup>2</sup> are reported in Table 2. Figure 2 compares the performance of Mixtral with the Llama models in different categories. Mixtral surpasses Llama 2 70B across most metrics. In particular, Mixtral displays a superior performance in code and mathematics benchmarks.

Mixtral, Mistral 7B, Llama 2 7B/13B/70B 和 Llama 1 34B<sup>2</sup> 的详细结果见表 2. 图 2 按类别比较 Mixtral 与各 Llama 模型. Mixtral 在多数指标上超过 Llama 2 70B, 在代码和数学基准上尤其突出.

**Size and Efficiency.** We compare our performance to the Llama 2 family, aiming to understand Mixtral models’ efficiency in the cost-performance spectrum (see Figure 3). As a sparse Mixture-of-Experts model, Mixtral only uses 13B active parameters for each token. With 5x lower active parameters, Mixtral is able to outperform Llama 2 70B across most categories.

**规模与效率.** 作者把 Mixtral 与 Llama 2 家族对比, 想弄清 Mixtral 在成本和性能之间处在什么位置 (见图 3). 作为稀疏 MoE 模型, Mixtral 每个 token 只用 13B 激活参数. 激活参数少 5 倍, Mixtral 仍能在多数类别上超过 Llama 2 70B.

Note that this analysis focuses on the active parameter count (see Section 2.1), which is directly proportional to the inference compute cost, but does not consider the memory costs and hardware utilization. The memory costs for serving Mixtral are proportional to its sparse parameter count, 47B, which is still smaller than Llama 2 70B. As for device utilization, we note that the SMoEs layer introduces additional overhead due to the routing mechanism and due to the increased memory loads when running more than one expert per device. They are more suitable for batched workloads where one can reach a good degree of arithmetic intensity.

注意, 这个分析看的是激活参数量 (见第 2.1 节), 它与推理计算成本成正比, 但没有考虑显存成本和硬件利用率. 部署 Mixtral 的显存成本与稀疏参数量 47B 成正比, 仍小于 Llama 2 70B. 设备利用率方面, SMoE 层有额外开销, 一是路由机制本身, 二是一张卡上跑多个专家时内存读取增加. 这类层更适合批量负载, 那时算术强度能达到较好的水平.

> **回看:** 算力按 13B 计, 显存按 47B 计, 换成权重显存大约是多少?
> 按 2 字节一个参数估算: 表 1 拼出的约 46.7B 参数需要约 93 GB, Llama 2 70B 约 140 GB, 比值约 0.67. 激活参数的比值是 13/70 ≈ 0.19. 所以同一张表 2, 按计算看便宜 5 倍, 按显存看只省三分之一 (不含 KV cache 和激活值).

**Comparison with Llama 2 70B and GPT-3.5.** In Table 3, we report the performance of Mixtral 8x7B compared to Llama 2 70B and GPT-3.5. We observe that Mixtral performs similarly or above the two other models. On MMLU, Mixtral obtains a better performance, despite its significantly smaller capacity (47B tokens compared to 70B). For MT Bench, we report the performance of the latest GPT-3.5-Turbo model available, gpt-3.5-turbo-1106.

**与 Llama 2 70B 和 GPT-3.5 的比较.** 表 3 给出 Mixtral 8x7B 与 Llama 2 70B, GPT-3.5 的对比. Mixtral 的表现与这两个模型相当或更好. 在 MMLU 上, 尽管容量小得多 (47B 对 70B), Mixtral 的成绩更好. MT Bench 一项报告的是当时可用的最新 GPT-3.5-Turbo, 即 gpt-3.5-turbo-1106.

> **停一下:** 「47B tokens compared to 70B」 里的 tokens 对吗?
> 不对, 应是参数. 47B 就是本页上一段和摘要里的稀疏参数量, 70B 是 Llama 2 70B 的参数量; 本文全篇没有给出训练 token 数. 中文按参数译出.

<small><span class="docvortex-page-footnote" data-block-type="page_footnote" style="color:#6b7280"><sup>2</sup>Since Llama 2 34B was not open-sourced, we report results for Llama 1 34B.</span></small>

脚注 2: 由于 Llama 2 34B 没有开源, 这里报告 Llama 1 34B 的结果.

<!-- page 5 of 13 -->

|  | LLaMA 2 70B | GPT-3.5 | Mixtral 8x7B |
| --- | --- | --- | --- |
| MMLU (MCQ in 57 subjects) | 69.9% | 70.0% | 70.6% |
| HellaSwag (10-shot) | 87.1% | 85.5% | 86.7% |
| ARC Challenge (25-shot) | 85.1% | 85.2% | 85.8% |
| WinoGrande (5-shot) | 83.2% | 81.6% | 81.2% |
| MBPP (pass@1) | 49.8% | 52.2% | 60.7% |
| GSM-8K (5-shot) | 53.6% | 57.1% | 58.4% |
| MT Bench (for Instruct Models) | 6.86 | 8.32 | 8.30 |

Table 3: Comparison of Mixtral with Llama 2 70B and GPT-3.5. Mixtral outperforms or matches Llama 2 70B and GPT-3.5 performance on most metrics.

表 3: Mixtral 与 Llama 2 70B, GPT-3.5 的比较. Mixtral 在多数指标上超过或持平 Llama 2 70B 和 GPT-3.5.

> **再看:** 表 3 的 Llama 2 70B HellaSwag 是 87.1, 表 2 是 85.4, 同一个模型为什么差了 1.7?
> 设置不同. 表 3 行名注明 HellaSwag 用 10-shot, ARC Challenge 用 25-shot, GSM-8K 用 5-shot; 第 3 页的清单里常识推理是 0-shot, GSM8K 是 8-shot maj@8. 所以 ARC Challenge 在表 3 是 85.1, 表 2 的 Arc-c 只有 56.5; GSM-8K 在表 3 是 53.6, 表 2 是 69.6. 两表完全相同的只有 MMLU (69.9, 70.6) 和 MBPP (49.8, 60.7).

> **对一下:** 表 3 里 Mixtral 有没有输的项?
> 有两项. WinoGrande 81.2, 低于 Llama 2 70B 的 83.2 和 GPT-3.5 的 81.6; MT Bench 8.30, 比 GPT-3.5 的 8.32 低 0.02. 表 3 的图注用的是 「most metrics」, 与表对得上; 上一页正文说 「similarly or above」, WinoGrande 这一行差 2 个点, 算不上 similarly.

**Evaluation Differences.** On some benchmarks, there are some differences between our evaluation protocol and the one reported in the Llama 2 paper: 1) on MBPP, we use the hand-verified subset 2) on TriviaQA, we do not provide Wikipedia contexts.

**评测差异.** 在部分基准上, 本文的评测协议与 Llama 2 论文有出入: 1) MBPP 用的是人工核验过的子集; 2) TriviaQA 不提供 Wikipedia 上下文.

## 3.1 Multilingual benchmarks (多语言基准)

Compared to Mistral 7B, we significantly upsample the proportion of multilingual data during pretraining. The extra capacity allows Mixtral to perform well on multilingual benchmarks while maintaining a high accuracy in English. In particular, Mixtral significantly outperforms Llama 2 70B in French, German, Spanish, and Italian, as shown in Table 4.

与 Mistral 7B 相比, 预训练时多语言数据的比例被明显上采样. 多出来的容量让 Mixtral 在多语言基准上表现好, 英文准确率也保持在高位. 如表 4 所示, Mixtral 在法语, 德语, 西班牙语和意大利语上都明显超过 Llama 2 70B.

| Model | Active Params | French Arc-c | French HellaS | French MMLU | German Arc-c | German HellaS | German MMLU | Spanish Arc-c | Spanish HellaS | Spanish MMLU | Italian Arc-c | Italian HellaS | Italian MMLU |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| LLaMA 1 33B | 33B | 39.3% | 68.1% | 49.9% | 41.1% | 63.3% | 48.7% | 45.7% | 69.8% | 52.3% | 42.9% | 65.4% | 49.0% |
| LLaMA 2 70B | 70B | 49.9% | 72.5% | 64.3% | 47.3% | 68.7% | 64.2% | 50.5% | 74.5% | 66.0% | 49.4% | 70.9% | 65.1% |
| Mixtral 8x7B | 13B | 58.2% | 77.4% | 70.9% | 54.3% | 73.0% | 71.5% | 55.4% | 77.6% | 72.5% | 52.8% | 75.1% | 70.9% |

Table 4: Comparison of Mixtral with Llama on Multilingual Benchmarks. On ARC Challenge, Hellaswag, and MMLU, Mixtral outperforms Llama 2 70B on 4 languages: French, German, Spanish, and Italian.

表 4: Mixtral 与 Llama 在多语言基准上的比较. 在 ARC Challenge, Hellaswag 和 MMLU 上, Mixtral 在法语, 德语, 西班牙语, 意大利语四种语言都超过 Llama 2 70B.

> **想:** 表 4 的 12 格里 Mixtral 全赢, 领先幅度和英文比起来怎样?
> 12 格全部高于 Llama 2 70B, 最小的是意大利语 Arc-c (+3.4), 最大的是法语 Arc-c (+8.3), 平均约 +5.5. 四种语言的 MMLU 领先 +5.8 到 +7.3, 而表 2 英文 MMLU 只领先 0.7. 多语言上的差距比英文大得多, 与上文 「多语言数据上采样」 的说法方向一致.

## 3.2 Long range performance (长距离表现)

To assess the capabilities of Mixtral to tackle long context, we evaluate it on the passkey retrieval task introduced in [23], a synthetic task designed to measure the ability of the model to retrieve a passkey inserted randomly in a long prompt. Results in Figure 4 (Left) show that Mixtral achieves a 100% retrieval accuracy regardless of the context length or the position of passkey in the sequence. Figure 4 (Right) shows that the perplexity of Mixtral on a subset of the proof-pile dataset [2] decreases monotonically as the size of the context increases.

为了评估 Mixtral 处理长上下文的能力, 作者用 [23] 提出的 passkey 检索任务测试它. 这是一个合成任务, 在长提示里随机插入一个 passkey, 看模型能否把它找回来. 图 4 (左) 显示, 不论上下文多长, passkey 在序列中的什么位置, Mixtral 的检索准确率都是 100%. 图 4 (右) 显示, 在 proof-pile 数据集 [2] 的一个子集上, Mixtral 的困惑度随上下文增长单调下降.

![图 4 左 Passkey Performance 热图: 横轴 Seq Len 从 0K 到约 32K, 纵轴 Passkey Loc; 阶梯状下三角内的格子全是色标 1.0 的绿色, 左上空白处是 passkey 位置超过序列长度的无效区](images/p05-chart.png)

![图 4 右困惑度曲线: Mixtral_8x7B 在约 0.5k 处约 3.8, 到 5k 附近降到约 2.1, 之后缓慢降到 32k 附近约 1.9; 纵轴刻度 3.8, 3.5, 3.2, 3.0, 2.8, 2.5, 2.2, 2.0 间距不等](images/p05-figure-4-long-range-performance-of-mixtral-left-mixtral.png)

Figure 4: Long range performance of Mixtral. (Left) Mixtral has 100% retrieval accuracy of the Passkey task regardless of the location of the passkey and length of the input sequence. (Right) The perplexity of Mixtral on the proof-pile dataset decreases monotonically as the context length increases.

图 4: Mixtral 的长距离表现. (左) 不论 passkey 的位置和输入序列的长度如何, Mixtral 在 Passkey 任务上的检索准确率都是 100%. (右) Mixtral 在 proof-pile 数据集上的困惑度随上下文长度增加而单调下降.

> **问:** 图 4 左的热图为什么只填了一半? 最右一列到多长?
> 纵轴是 passkey 位置, 横轴是序列长度, 位置不能超过长度, 所以只有阶梯下方的格子有效, 左上一半本来就不存在. 有效格子全是色标顶端 1.0 的绿色, 没有一格偏红. 横轴最后一列在 28K 刻度右侧, 约到 32K, 与表 1 的 context_len 32768 相当; 图上没有超过训练长度的测试点.

> **核对:** 图 4 右的纵轴能直接按刻度读差值吗?
> 不宜直接读. 纵轴刻度 3.8, 3.5, 3.2, 3.0, 2.8, 2.5, 2.2, 2.0 的间距不均匀, 看起来是对数坐标加了取整的标签. 读图: 曲线约 0.5k 处 3.8, 5k 处约 2.1, 10k 处约 2.0, 32k 附近约 1.9. 下降主要发生在前 5k, 10k 以后只降约 0.1, 「单调下降」 在图上成立, 但后半段已接近平坦.

<!-- page 6 of 13 -->

## 3.3 Bias Benchmarks (偏差基准)

To identify possible flaws to be corrected by fine-tuning / preference modeling, we measure the base model performance on Bias Benchmark for QA (BBQ) [24] and Bias in Open-Ended Language Generation Dataset (BOLD) [10]. BBQ is a dataset of hand-written question sets that target attested social biases against nine different socially-relevant categories: age, disability status, gender identity, nationality, physical appearance, race/ethnicity, religion, socio-economic status, sexual orientation. BOLD is a large-scale dataset that consists of 23,679 English text generation prompts for bias benchmarking across five domains.

为了找出可以靠微调或偏好建模修正的缺陷, 作者在 BBQ (Bias Benchmark for QA) [24] 和 BOLD (Bias in Open-Ended Language Generation Dataset) [10] 上测量基座模型. BBQ 是人工编写的问题集, 针对九类有据可查的社会偏见: 年龄, 残障状况, 性别认同, 国籍, 外貌, 种族/族裔, 宗教, 社会经济地位, 性取向. BOLD 是一个大规模数据集, 含 23,679 条英文文本生成提示, 覆盖五个领域, 用于偏差评测.

|  | Llama 2 70B | Mixtral 8x7B |
| --- | --- | --- |
| BBQ accuracy | 51.5% | 56.0% |
| BOLD sentiment score (avg ± std) |  |  |
| gender | 0.293 ± 0.073 | 0.323 ± 0.045 |
| profession | 0.218 ± 0.073 | 0.243 ± 0.087 |
| religious_ideology | 0.188 ± 0.133 | 0.144 ± 0.089 |
| political_ideology | 0.149 ± 0.140 | 0.186 ± 0.146 |
| race | 0.232 ± 0.049 | 0.232 ± 0.052 |

Figure 5: Bias Benchmarks. Compared Llama 2 70B, Mixtral presents less bias (higher accuracy on BBQ, lower std on BOLD) and displays more positive sentiment (higher avg on BOLD).

图 5: 偏差基准. 与 Llama 2 70B 相比, Mixtral 偏差更小 (BBQ 准确率更高, BOLD 标准差更低), 情感更积极 (BOLD 均值更高).

> **看表:** 图 5 说 Mixtral 的 BOLD 标准差更低, 均值更高, 五组都是这样吗?
> 不是. 标准差更低的只有 gender (0.045 对 0.073) 和 religious_ideology (0.089 对 0.133); profession (0.087 对 0.073), political_ideology (0.146 对 0.140), race (0.052 对 0.049) 都是 Mixtral 略高. 均值方面, religious_ideology 是 0.144 对 0.188, Mixtral 更低, race 两者都是 0.232. 下一段正文改口为 「similar variances」, 比图注更贴近这张表.

We benchmark Llama 2 and Mixtral on BBQ and BOLD with our evaluation framework and report the results in Table 5. Compared to Llama 2, Mixtral presents less bias on the BBQ benchmark (56.0% vs 51.5%). For each group in BOLD, a higher average sentiment score means more positive sentiments and a lower standard deviation indicates less bias within the group. Overall, Mixtral displays more positive sentiments than Llama 2, with similar variances within each group.

作者用自家评测框架在 BBQ 和 BOLD 上测了 Llama 2 和 Mixtral, 结果见表 5. 与 Llama 2 相比, Mixtral 在 BBQ 上偏差更小 (56.0% 对 51.5%). 对 BOLD 的每个组, 平均情感分越高表示情感越积极, 标准差越低表示组内偏差越小. 总体上, Mixtral 的情感比 Llama 2 更积极, 组内方差相近.

## 4 Instruction Fine-tuning (指令微调)

We train Mixtral – Instruct using supervised fine-tuning (SFT) on an instruction dataset followed by Direct Preference Optimization (DPO) [25] on a paired feedback dataset. Mixtral – Instruct reaches a score of 8.30 on MT-Bench [33] (see Table 2), making it the best open-weights model as of December 2023. Independent human evaluation conducted by LMSys is reported in Figure 6<sup>3</sup> and shows that Mixtral – Instruct outperforms GPT-3.5-Turbo, Gemini Pro, Claude-2.1, and Llama 2 70B chat.

Mixtral – Instruct 的训练分两步: 先在指令数据集上做 SFT, 再在成对反馈数据集上做 DPO [25]. Mixtral – Instruct 在 MT-Bench [33] 上得 8.30 分 (见表 2), 截至 2023 年 12 月是最好的开放权重模型. LMSys 做的独立人工评测见图 6<sup>3</sup>, 显示 Mixtral – Instruct 超过 GPT-3.5-Turbo, Gemini Pro, Claude-2.1 和 Llama 2 70B chat.

> **拆开:** 本页有两处 「见表 k」 指错了表, 分别应指哪里?
> 第 3.3 节说偏差结果 「见表 5」, 实际在本页的图 5, 表 5 是第 8 页的专家重复分配表. 第 4 节说 MT-Bench 8.30 「见表 2」, 表 2 没有 MT-Bench 这一列, 8.30 印在第 5 页表 3 的最后一行. 中文照原文译出编号.

| Model | Arena Elo rating | MT-bench (score) | License |
| --- | --- | --- | --- |
| GPT-4-Turbo | 1243 | 9.32 | Proprietary |
| GPT-4-0314 | 1192 | 8.96 | Proprietary |
| GPT-4-0613 | 1158 | 9.18 | Proprietary |
| Claude-1 | 1149 | 7.9 | Proprietary |
| Claude-2.0 | 1131 | 8.06 | Proprietary |
| Mixtral-8x7b-Instruct-v0.1 | 1121 | 8.3 | Apache 2.0 |
| Claude-2.1 | 1117 | 8.18 | Proprietary |
| GPT-3.5-Turbo-0613 | 1117 | 8.39 | Proprietary |
| Gemini_Pro | 1111 |  | Proprietary |
| Claude-Instant-1 | 1110 | 7.85 | Proprietary |
| Tulu-2-DPO-70B | 1110 | 7.89 | AI2 ImpACT Low-risk |
| Yi-34B-Chat | 1110 |  | Yi License |
| GPT-3.5-Turbo-0314 | 1105 | 7.94 | Proprietary |
| Llama-2-70b-chat | 1077 | 6.86 | Llama 2 Community |

Figure 6: LMSys Leaderboard. (Screenshot from Dec 22, 2023) Mixtral 8x7B Instruct v0.1 achieves an Arena Elo rating of 1121 outperforming Claude-2.1 (1117), all versions of GPT-3.5-Turbo (1117 best), Gemini Pro (1111), and Llama-2-70b-chat (1077). Mixtral is currently the best open-weights model by a large margin.

图 6: LMSys 排行榜 (2023 年 12 月 22 日截图). Mixtral 8x7B Instruct v0.1 的 Arena Elo 为 1121, 高于 Claude-2.1 (1117), 所有版本的 GPT-3.5-Turbo (最好 1117), Gemini Pro (1111) 和 Llama-2-70b-chat (1077). Mixtral 目前是领先幅度最大的开放权重模型.

> **确认:** 图 6 里 Mixtral 排第几, 它领先 Claude-2.1 多少?
> 图 6 的 Elo 列里 Mixtral 1121 排第 6, 前面是 GPT-4-Turbo 1243, GPT-4-0314 1192, GPT-4-0613 1158, Claude-1 1149, Claude-2.0 1131. 对 Claude-2.1 和 GPT-3.5-Turbo-0613 只领先 4 分; 对许可列不是 Proprietary 的 Tulu-2-DPO-70B 和 Yi-34B-Chat 领先 11 分, 对 Llama-2-70b-chat 领先 44 分. 图注只挑了排在它后面的几个模型.

> **回看:** GPT-3.5 的 MT-Bench, 表 3 写 8.32, 图 6 写 8.39 和 7.94, 哪个是对照?
> 三个数对应三个版本. 第 4 页正文说表 3 用的是 gpt-3.5-turbo-1106, 8.32; 图 6 列的是 GPT-3.5-Turbo-0613 (8.39) 和 GPT-3.5-Turbo-0314 (7.94). 若拿图 6 的 0613 比, Mixtral 的 8.3 低 0.09; 拿表 3 的 1106 比, 低 0.02.

<small><span class="docvortex-page-footnote" data-block-type="page_footnote" style="color:#6b7280"><sup>3</sup>[https://huggingface.co/spaces/lmsys/chatbot-arena-leaderboard](https://huggingface.co/spaces/lmsys/chatbot-arena-leaderboard)</span></small>

脚注 3: https://huggingface.co/spaces/lmsys/chatbot-arena-leaderboard.

<!-- page 7 of 13 -->

## 5 Routing analysis (路由分析)

In this section, we perform a small analysis on the expert selection by the router. In particular, we are interested to see if during training some experts specialized to some specific domains (e.g. mathematics, biology, philosophy, etc.).

本节对 router 的专家选择做一个小分析, 主要想看训练中是否有专家专门化到某些领域 (如数学, 生物, 哲学等).

To investigate this, we measure the distribution of selected experts on different subsets of The Pile validation dataset [14]. Results are presented in Figure 7, for layers 0, 15, and 31 (layers 0 and 31 respectively being the first and the last layers of the model). Surprisingly, we do not observe obvious patterns in the assignment of experts based on the topic. For instance, at all layers, the distribution of expert assignment is very similar for ArXiv papers (written in Latex), for biology (PubMed Abstracts), and for Philosophy (PhilPapers) documents.

为此, 作者在 The Pile 验证集 [14] 的不同子集上统计被选中专家的分布. 结果见图 7, 取第 0, 15, 31 层 (第 0 层和第 31 层分别是模型的第一层和最后一层). 出乎意料的是, 专家分配没有表现出明显的按主题划分的规律. 例如在所有层上, ArXiv 论文 (用 Latex 写成), 生物 (PubMed Abstracts) 和哲学 (PhilPapers) 文档的专家分配分布都很相似.

Only for DM Mathematics we note a marginally different distribution of experts. This divergence is likely a consequence of the dataset’s synthetic nature and its limited coverage of the natural language spectrum, and is particularly noticeable at the first and last layers, where the hidden states are very correlated to the input and output embeddings respectively.

只有 DM Mathematics 的专家分布略有不同. 这种差异可能源于该数据集是合成的, 对自然语言的覆盖有限; 在第一层和最后一层尤其明显, 因为这两层的隐藏状态分别与输入嵌入和输出嵌入高度相关.

This suggests that the router does exhibit some structured syntactic behavior. Figure 8 shows examples of text from different domains (Python code, mathematics, and English), where each token is highlighted with a background color corresponding to its selected expert. The figure shows that words such as ‘self’ in Python and ‘Question’ in English often get routed through the same expert even though they involve multiple tokens. Similarly, in code, the indentation tokens are always assigned to the same experts, particularly at the first and last layers where the hidden states are more correlated to the input and output of the model.

这说明 router 确实表现出某种有结构的句法行为. 图 8 给出不同领域 (Python 代码, 数学, 英文) 的文本样例, 每个 token 按所选专家标上背景色. 可以看到, Python 里的 「self」, 英文里的 「Question」 这类词虽然由多个 token 组成, 却常常被路由到同一个专家. 代码里的缩进 token 也总是分给同样的专家, 在第一层和最后一层尤其如此, 这两层的隐藏状态与模型的输入和输出更相关.

We also note from Figure 8 that consecutive tokens are often assigned the same experts. In fact, we observe some degree of positional locality in The Pile datasets. Table 5 shows the proportion of consecutive tokens that get the same expert assignments per domain and layer. The proportion of repeated consecutive assignments is significantly higher than random for higher layers.

从图 8 还能看到, 相邻 token 常被分给同样的专家. 事实上, 作者在 The Pile 各数据集上观察到一定程度的位置局部性. 表 5 按领域和层给出相邻 token 得到相同专家分配的比例. 在较高的层, 相邻重复分配的比例明显高于随机.

![图 7 第 0, 15, 31 层三排柱状图: 横轴专家 0 到 7, 每个专家八根柱对应 The Pile 八个子集, 纵轴选择比例 0 到 0.20, 灰色水平虚线在 0.125; 土黄色的 DM Mathematics 偏离最明显, 如第 0 层专家 1 约 0.06, 第 15 层专家 3 约 0.15, 第 31 层专家 0 和专家 2 约 0.19](images/p07-figure-7-proportion-of-tokens-assigned-to-each-expert.png)

Figure 7: Proportion of tokens assigned to each expert on different domains from The Pile dataset for layers 0, 15, and 31. The gray dashed vertical line marks 1/8, i.e. the proportion expected with uniform sampling. Here, we consider experts that are either selected as a first or second choice by the router. A breakdown of the proportion of assignments done in each case cane be seen in Figure 9 in the Appendix.

图 7: 第 0, 15, 31 层上, The Pile 各领域的 token 分配给每个专家的比例. 灰色虚线标在 1/8, 即均匀抽样时的期望比例. 这里把 router 选为第一或第二选择的专家都算进来. 两种情况各自的分配比例见附录图 9.

> **停一下:** 每个 token 选 2 个专家, 按 「token 比例」 算, 均匀时每个专家应该是 2/8 = 0.25, 图 7 的虚线为什么画在 1/8?
> 图 7 的柱子大多在 0.10 到 0.15 之间, 八个专家加起来约为 1, 说明统计口径是 「分配次数的占比」: 每个 token 贡献两次分配, 分母是全部分配次数, 于是均匀时是 1/8. 图注写 「Proportion of tokens」, 口径实际是分配占比; 第 12 页图 9 的 「Either choice」 行也在 0.125 附近, 口径相同.

> **再看:** 图注说虚线是 「vertical」, 图上是这样吗?
> 不是. 图 7 三排子图里的灰色虚线都是水平的, 画在纵轴 0.125 处, 横贯八个专家. 第 12 页图 9 的图注同样写 「vertical line」, 图上也是水平线. 图注里的 「cane be seen」 是 「can be seen」 的笔误.

> **对一下:** 正文说 DM Mathematics 只是 「marginally different」, 且主要在首末层, 图 7 是这样吗?
> 图 7 上偏得不算轻微, 而且中间层也有. 读图: 第 0 层专家 1 上 DM Mathematics 约 0.06, 其他子集约 0.10 到 0.14; 第 15 层专家 3 上它约 0.15, 其他子集只有 0.06 到 0.10; 第 31 层专家 0 和专家 2 上它约 0.19, 专家 5 上约 0.065. 第 15 层这一处偏离与 「首末层更明显」 的说法不完全一致.

<!-- page 8 of 13 -->

|  | First choice Layer 0 | First choice Layer 15 | First choice Layer 31 | First or second choice Layer 0 | First or second choice Layer 15 | First or second choice Layer 31 |
| --- | --- | --- | --- | --- | --- | --- |
| ArXiv | 14.0% | 27.9% | 22.7% | 46.5% | 62.3% | 52.9% |
| DM Mathematics | 14.1% | 28.4% | 19.7% | 44.9% | 67.0% | 44.5% |
| Github | 14.9% | 28.1% | 19.7% | 49.9% | 66.9% | 49.2% |
| Gutenberg | 13.9% | 26.1% | 26.3% | 49.5% | 63.1% | 52.2% |
| PhilPapers | 13.6% | 25.3% | 22.1% | 46.9% | 61.9% | 51.3% |
| PubMed Abstracts | 14.2% | 24.6% | 22.0% | 48.6% | 61.6% | 51.8% |
| StackExchange | 13.6% | 27.2% | 23.6% | 48.2% | 64.6% | 53.6% |
| Wikipedia (en) | 14.4% | 23.6% | 25.3% | 49.8% | 62.1% | 51.8% |

Table 5: Percentage of expert assignment repetitions. We evaluate the proportion of times the same expert is assigned to a token i and its following token i+1. We report whether the first chosen expert is the same, or whether the same expert is observed as first or second choice in consecutive tokens. For reference, the expected proportion of repetitions in the case of random assignments is $\frac{1}{8} = 12.5\%$ for “First choice” and $1 - \frac{6}{8}\frac{5}{7} \approx 46\%$ for “First and second choice”. Repetitions at the first layer are close to random, but are significantly higher at layers 15 and 31. The high number of repetitions shows that expert choice exhibits high temporal locality at these layers.

表 5: 专家分配重复的百分比. 统计 token i 与其后一个 token i+1 被分配到同一专家的比例. 分两种口径: 第一选择的专家是否相同; 或同一专家是否在相邻 token 中以第一或第二选择出现. 作为参照, 随机分配时 「First choice」 的期望重复比例是 $\frac{1}{8} = 12.5\%$, 「First and second choice」 是 $1 - \frac{6}{8}\frac{5}{7} \approx 46\%$. 第一层的重复接近随机, 第 15 层和第 31 层则明显更高. 大量重复说明这些层的专家选择有很强的时间局部性.

> **想:** 表 5 说第 15 层和第 31 层 「明显高于随机」, 每一格都是这样吗?
> 第 31 层的 First choice 一栏都高于 12.5% (最低 19.7%); 但 First or second choice 一栏里, DM Mathematics 第 31 层是 44.5%, 低于随机的 46%, 第 0 层的 44.9% 也低于 46%. 第 15 层各格都在 61.6% 以上, 说法成立. 所以 「第 31 层明显高于随机」 对 DM Mathematics 的第二种口径不成立.

> **问:** 46% 是怎么来的? 图注写 「First and second choice」, 表头写 「First or second choice」, 哪个对?
> 相邻两个 token 各从 8 个专家里随机选 2 个, 两组完全不重叠的概率是 C(6,2)/C(8,2) = 15/28, 恰好等于 $\frac{6}{8}\cdot\frac{5}{7}$; 1 - 15/28 ≈ 0.464, 即 46%. 这个算法数的是 「有至少一个专家重叠」, 对应表头的 「or」, 图注里的 「and」 是笔误.

This has implications in how one might optimize the model for fast training and inference. For example, cases with high locality are more likely to cause over-subscription of certain experts when doing Expert Parallelism. Conversely, this locality can be leveraged for caching, as is done in [11]. A more complete view of these same expert frequency is provided for all layers and across datasets in Figure 10 in the Appendix.

这对如何优化模型以加快训练和推理有影响. 例如, 局部性高的情况在做专家并行时更容易让某些专家超额承载. 反过来, 这种局部性也可以用于缓存, [11] 就是这么做的. 所有层, 所有数据集上同一专家频率的更完整视图见附录图 10.

## 6 Conclusion

In this paper, we introduced Mixtral 8x7B, the first mixture-of-experts network to reach a state-of-the-art performance among open-source models. Mixtral 8x7B Instruct outperforms Claude-2.1, Gemini Pro, and GPT-3.5 Turbo on human evaluation benchmarks. Because it only uses two experts at each time step, Mixtral only uses 13B active parameters per token while outperforming the previous best model using 70B parameters per token (Llama 2 70B). We are making our trained and fine-tuned models publicly available under the Apache 2.0 license. By sharing our models, we aim to facilitate the development of new techniques and applications that can benefit a wide range of industries and domains.

本文介绍了 Mixtral 8x7B, 第一个在开源模型中达到最先进水平的 MoE 网络. Mixtral 8x7B Instruct 在人工评测基准上超过 Claude-2.1, Gemini Pro 和 GPT-3.5 Turbo. 由于每个时间步只用两个专家, Mixtral 每个 token 只用 13B 激活参数, 却超过了此前每个 token 用 70B 参数的最好模型 (Llama 2 70B). 训练好的基座模型和微调模型以 Apache 2.0 许可公开. 作者希望借由分享模型, 推动能惠及各行各业的新技术和新应用的发展.

![图 8 三栏文本着色样例, 分别是第 0, 15, 31 层: 上为 MoeLayer 类的 Python 源码, 中为三道 DM Mathematics 风格的 Question/Answer, 下为一道关于模型飞机和风速的英文选择题; 每个 token 按首选专家上色, 第 0 层代码的缩进空白整列是粉色, 第 31 层整列是黄色](images/p08-figure-8-text-samples-where-each-token-is-colored-with.png)

Figure 8: Text samples where each token is colored with the first expert choice. The selection of experts appears to be more aligned with the syntax rather than the domain, especially at the initial and final layers.

图 8: 文本样例, 每个 token 按第一选择的专家着色. 专家选择看起来更贴合句法而不是领域, 在开头和末尾几层尤其如此.

> **核对:** 图 8 的颜色只反映第一选择, 能拿它去对表 5 的哪一栏?
> 只能对表 5 左边三列 「First choice」. 图 8 读图: 第 0 层代码左侧的缩进空白整列同色 (粉), 第 31 层整列同色 (黄), 第 15 层则混着几种颜色; 这与表 5 里第 0 层重复率只有 13.6% 到 14.9% 看上去矛盾. 原因在于图 8 挑的是缩进这类重复出现的 token, 表 5 统计的是所有相邻 token 对, 两者不是同一口径.

<!-- page 9 of 13 -->

## Acknowledgements (致谢)

We thank the CoreWeave and Scaleway teams for technical support as we trained our models. We are grateful to NVIDIA for supporting us in integrating TensorRT-LLM and Triton and working alongside us to make a sparse mixture of experts compatible with TensorRT-LLM.

感谢 CoreWeave 和 Scaleway 团队在模型训练期间提供的技术支持. 感谢 NVIDIA 帮助集成 TensorRT-LLM 和 Triton, 并与作者一道让稀疏 MoE 兼容 TensorRT-LLM.

## References

[1] Jacob Austin, Augustus Odena, Maxwell Nye, Maarten Bosma, Henryk Michalewski, David Dohan, Ellen Jiang, Carrie Cai, Michael Terry, Quoc Le, et al. Program synthesis with large language models. arXiv preprint arXiv:2108.07732, 2021.

[2] Zhangir Azerbayev, Hailey Schoelkopf, Keiran Paster, Marco Dos Santos, Stephen McAleer, Albert Q Jiang, Jia Deng, Stella Biderman, and Sean Welleck. Llemma: An open language model for mathematics. arXiv preprint arXiv:2310.10631, 2023.

[3] Yonatan Bisk, Rowan Zellers, Jianfeng Gao, Yejin Choi, et al. Piqa: Reasoning about physical commonsense in natural language. In Proceedings of the AAAI conference on artificial intelligence, pages 7432–7439, 2020.

[4] Mark Chen, Jerry Tworek, Heewoo Jun, Qiming Yuan, Henrique Ponde de Oliveira Pinto, Jared Kaplan, Harri Edwards, Yuri Burda, Nicholas Joseph, Greg Brockman, et al. Evaluating large language models trained on code. arXiv preprint arXiv:2107.03374, 2021.

[5] Eunsol Choi, He He, Mohit Iyyer, Mark Yatskar, Wen-tau Yih, Yejin Choi, Percy Liang, and Luke Zettlemoyer. Quac: Question answering in context. arXiv preprint arXiv:1808.07036, 2018.

[6] Aidan Clark, Diego De Las Casas, Aurelia Guy, Arthur Mensch, Michela Paganini, Jordan Hoffmann, Bogdan Damoc, Blake Hechtman, Trevor Cai, Sebastian Borgeaud, et al. Unified scaling laws for routed language models. In International Conference on Machine Learning, pages 4057–4086. PMLR, 2022.

[7] Christopher Clark, Kenton Lee, Ming-Wei Chang, Tom Kwiatkowski, Michael Collins, and Kristina Toutanova. Boolq: Exploring the surprising difficulty of natural yes/no questions. arXiv preprint arXiv:1905.10044, 2019.

[8] Peter Clark, Isaac Cowhey, Oren Etzioni, Tushar Khot, Ashish Sabharwal, Carissa Schoenick, and Oyvind Tafjord. Think you have solved question answering? try arc, the ai2 reasoning challenge. arXiv preprint arXiv:1803.05457, 2018.

[9] Karl Cobbe, Vineet Kosaraju, Mohammad Bavarian, Mark Chen, Heewoo Jun, Lukasz Kaiser, Matthias Plappert, Jerry Tworek, Jacob Hilton, Reiichiro Nakano, et al. Training verifiers to solve math word problems. arXiv preprint arXiv:2110.14168, 2021.

[10] Jwala Dhamala, Tony Sun, Varun Kumar, Satyapriya Krishna, Yada Pruksachatkun, Kai-Wei Chang, and Rahul Gupta. Bold: Dataset and metrics for measuring biases in open-ended language generation. In Proceedings of the 2021 ACM conference on fairness, accountability, and transparency, pages 862–872, 2021.

[11] Artyom Eliseev and Denis Mazur. Fast inference of mixture-of-experts language models with offloading. arXiv preprint arXiv:2312.17238, 2023.

[12] William Fedus, Jeff Dean, and Barret Zoph. A review of sparse expert models in deep learning. arXiv preprint arXiv:2209.01667, 2022.

[13] Trevor Gale, Deepak Narayanan, Cliff Young, and Matei Zaharia. Megablocks: Efficient sparse training with mixture-of-experts. arXiv preprint arXiv:2211.15841, 2022.

[14] Leo Gao, Stella Biderman, Sid Black, Laurence Golding, Travis Hoppe, Charles Foster, Jason Phang, Horace He, Anish Thite, Noa Nabeshima, et al. The pile: An 800gb dataset of diverse text for language modeling. arXiv preprint arXiv:2101.00027, 2020.

[15] Hussein Hazimeh, Zhe Zhao, Aakanksha Chowdhery, Maheswaran Sathiamoorthy, Yihua Chen, Rahul Mazumder, Lichan Hong, and Ed Chi. Dselect-k: Differentiable selection in the mixture of experts with applications to multi-task learning. Advances in Neural Information Processing Systems, 34:29335–29347, 2021.

<!-- page 10 of 13 -->

[16] Dan Hendrycks, Collin Burns, Steven Basart, Andy Zou, Mantas Mazeika, Dawn Song, and Jacob Steinhardt. Measuring massive multitask language understanding. arXiv preprint arXiv:2009.03300, 2020.

[17] Dan Hendrycks, Collin Burns, Saurav Kadavath, Akul Arora, Steven Basart, Eric Tang, Dawn Song, and Jacob Steinhardt. Measuring mathematical problem solving with the math dataset. arXiv preprint arXiv:2103.03874, 2021.

[18] Albert Q Jiang, Alexandre Sablayrolles, Arthur Mensch, Chris Bamford, Devendra Singh Chaplot, Diego de las Casas, Florian Bressand, Gianna Lengyel, Guillaume Lample, Lucile Saulnier, et al. Mistral 7b. arXiv preprint arXiv:2310.06825, 2023.

[19] Mandar Joshi, Eunsol Choi, Daniel S Weld, and Luke Zettlemoyer. Triviaqa: A large scale distantly supervised challenge dataset for reading comprehension. arXiv preprint arXiv:1705.03551, 2017.

[20] Tom Kwiatkowski, Jennimaria Palomaki, Olivia Redfield, Michael Collins, Ankur Parikh, Chris Alberti, Danielle Epstein, Illia Polosukhin, Jacob Devlin, Kenton Lee, et al. Natural questions: a benchmark for question answering research. Transactions of the Association for Computational Linguistics, pages 453–466, 2019.

[21] Dmitry Lepikhin, HyoukJoong Lee, Yuanzhong Xu, Dehao Chen, Orhan Firat, Yanping Huang, Maxim Krikun, Noam Shazeer, and Zhifeng Chen. Gshard: Scaling giant models with conditional computation and automatic sharding. arXiv preprint arXiv:2006.16668, 2020.

[22] Todor Mihaylov, Peter Clark, Tushar Khot, and Ashish Sabharwal. Can a suit of armor conduct electricity? a new dataset for open book question answering. arXiv preprint arXiv:1809.02789, 2018.

[23] Amirkeivan Mohtashami and Martin Jaggi. Landmark attention: Random-access infinite context length for transformers. arXiv preprint arXiv:2305.16300, 2023.

[24] Alicia Parrish, Angelica Chen, Nikita Nangia, Vishakh Padmakumar, Jason Phang, Jana Thompson, Phu Mon Htut, and Samuel R Bowman. Bbq: A hand-built bias benchmark for question answering. arXiv preprint arXiv:2110.08193, 2021.

[25] Rafael Rafailov, Archit Sharma, Eric Mitchell, Stefano Ermon, Christopher D Manning, and Chelsea Finn. Direct preference optimization: Your language model is secretly a reward model. arXiv preprint arXiv:2305.18290, 2023.

[26] Keisuke Sakaguchi, Ronan Le Bras, Chandra Bhagavatula, and Yejin Choi. Winogrande: An adversarial winograd schema challenge at scale. Communications of the ACM, pages 99–106, 2021.

[27] Maarten Sap, Hannah Rashkin, Derek Chen, Ronan LeBras, and Yejin Choi. Socialiqa: Commonsense reasoning about social interactions. arXiv preprint arXiv:1904.09728, 2019.

[28] Noam Shazeer, Azalia Mirhoseini, Krzysztof Maziarz, Andy Davis, Quoc Le, Geoffrey Hinton, and Jeff Dean. Outrageously large neural networks: The sparsely-gated mixture-of-experts layer. arXiv preprint arXiv:1701.06538, 2017.

[29] Mirac Suzgun, Nathan Scales, Nathanael Schärli, Sebastian Gehrmann, Yi Tay, Hyung Won Chung, Aakanksha Chowdhery, Quoc V Le, Ed H Chi, Denny Zhou, , and Jason Wei. Challenging big-bench tasks and whether chain-of-thought can solve them. arXiv preprint arXiv:2210.09261, 2022.

[30] Alon Talmor, Jonathan Herzig, Nicholas Lourie, and Jonathan Berant. Commonsenseqa: A question answering challenge targeting commonsense knowledge. arXiv preprint arXiv:1811.00937, 2018.

[31] Ashish Vaswani, Noam Shazeer, Niki Parmar, Jakob Uszkoreit, Llion Jones, Aidan N Gomez, Łukasz Kaiser, and Illia Polosukhin. Attention is all you need. Advances in neural information processing systems, 30, 2017.

[32] Rowan Zellers, Ari Holtzman, Yonatan Bisk, Ali Farhadi, and Yejin Choi. Hellaswag: Can a machine really finish your sentence? arXiv preprint arXiv:1905.07830, 2019.

[33] Lianmin Zheng, Wei-Lin Chiang, Ying Sheng, Siyuan Zhuang, Zhanghao Wu, Yonghao Zhuang, Zi Lin, Zhuohan Li, Dacheng Li, Eric Xing, et al. Judging llm-as-a-judge with mt-bench and chatbot arena. arXiv preprint arXiv:2306.05685, 2023.

<!-- page 11 of 13 -->

[34] Wanjun Zhong, Ruixiang Cui, Yiduo Guo, Yaobo Liang, Shuai Lu, Yanlin Wang, Amin Saied, Weizhu Chen, and Nan Duan. Agieval: A human-centric benchmark for evaluating foundation models. arXiv preprint arXiv:2304.06364, 2023.

[35] Yanqi Zhou, Tao Lei, Hanxiao Liu, Nan Du, Yanping Huang, Vincent Zhao, Andrew M Dai, Quoc V Le, James Laudon, et al. Mixture-of-experts with expert choice routing. Advances in Neural Information Processing Systems, 35:7103–7114, 2022.

<!-- page 12 of 13 -->

![图 9 九个子图: 第 0, 15, 31 层各分 Either choice, First choice, Second choice 三行, 横轴专家 0 到 7, 纵轴 0 到 0.3, 灰色水平虚线在 0.125; 第 0 层专家 5 和专家 7 的第一选择约 0.08, 第二选择约 0.2, 第 31 层第一选择中 DM Mathematics 在专家 0 约 0.31](images/p12-figure-9-proportion-of-tokens-assigned-to-each-expert.png)

Figure 9: Proportion of tokens assigned to each expert on different subsets from The Pile dataset, separated by whether the expert was selected as first or second choice, or either. The “Either choice” case is equivalent to Figure 7. The gray dashed vertical line marks $\frac{1}{8}$, i.e. the proportion expected with uniform sampling.

图 9: The Pile 各子集的 token 分配给每个专家的比例, 按专家是被选为第一选择, 第二选择还是任一选择分开画. 「Either choice」 与图 7 相同. 灰色虚线标在 $\frac{1}{8}$, 即均匀抽样时的期望比例.

> **看表:** 图 9 把第一选择和第二选择拆开后, 和 「Either choice」 一行比多了什么信息?
> 拆开后能看到两种选择常常互补. 读图: 第 0 层专家 5 和专家 7 做第一选择的比例约 0.08, 做第二选择约 0.2, 合起来的 Either choice 又回到 0.13 附近; 第 0 层专家 3 反过来, 第一选择约 0.16, 第二选择约 0.08. 第 31 层第一选择里 DM Mathematics 在专家 0 约 0.31, 是均匀值的 2.5 倍, 在图 7 的合并口径下只剩约 0.19. 图 7 只看合并口径, 看不到这层偏好.

<!-- page 13 of 13 -->

![图 10 各 MoE 层相邻 token 重复分配比例折线, 横轴第 0 到 31 层, 八个数据源各一条线; 上图 First choice, 黑色虚线在 0.125, 峰值在第 9 层附近 (Wikipedia 约 0.34), 第 18 层附近有低谷; 下图 First or second choice, 虚线约 0.46, DM Mathematics 在第 0, 27, 31 层附近落到虚线上下](images/p13-figure-10-repeated-consecutive-assignments-per-moe.png)

Figure 10: Repeated consecutive assignments per MoE layer. Repeated assignments occur a lot more often than they would with uniform assignments (materialized by the dashed lines). Patterns are similar across datasets with less repetitions for DM Mathematics.

图 10: 每个 MoE 层的相邻重复分配. 重复分配远比均匀分配时 (虚线所示) 频繁. 各数据集的模式相近, DM Mathematics 的重复较少.

> **拆开:** 表 5 只取第 0, 15, 31 层, 放到图 10 的全部 32 层里, 这三层有代表性吗?
> 代表性有限. 读图: First choice 的峰值在第 9 层附近, Wikipedia 约 0.34, 多数数据源在 0.30 以上; 第 18 层附近有一个低谷, 约 0.17 到 0.22; 表 5 的第 15 层 (23.6% 到 28.4%) 落在峰值之后的下坡上. 下图里 DM Mathematics 在第 0, 27, 31 层附近贴着或低于 0.46 的虚线, 与表 5 的 44.9% 和 44.5% 对得上, 也是图注 「DM Mathematics 重复较少」 的出处.
