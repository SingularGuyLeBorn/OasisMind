---
title: "Gemma 1 · 对照译稿"
category: "模型库"
tags: ["Gemma", "对照译稿"]
published: true
excerpt: "Gemma 1 公开材料的逐段中英对照译稿,附读报告时的疑问块."
---
<!-- page 1 of 17 -->

arXiv:2403.08295v4 [cs.CL] 16 Apr 2024

Google DeepMind

2024-02-21

# Gemma: Open Models Based on Gemini Research and Technology

Gemma: 基于 Gemini 研究与技术的开放模型

**Gemma Team, Google DeepMind**<sup>1</sup>

**This work introduces Gemma, a family of lightweight, state-of-the art open models built from the research and technology used to create Gemini models. Gemma models demonstrate strong performance across academic benchmarks for language understanding, reasoning, and safety. We release two sizes of models (2 billion and 7 billion parameters), and provide both pretrained and fine-tuned checkpoints. Gemma outperforms similarly sized open models on 11 out of 18 text-based tasks, and we present comprehensive evaluations of safety and responsibility aspects of the models, alongside a detailed description of model development. We believe the responsible release of LLMs is critical for improving the safety of frontier models, and for enabling the next wave of LLM innovations.**

本文介绍 Gemma. 这是一族轻量级, 达到当时最佳水平的开放模型, 构建它所用的研究与技术和打造 Gemini 模型的相同. Gemma 模型在语言理解, 推理和安全等学术基准上表现强劲. 我们发布两个尺寸的模型 (20 亿和 70 亿参数), 预训练检查点和微调检查点都提供. 在 18 个基于文本的任务里, Gemma 有 11 个超过尺寸相近的开放模型. 我们还给出了模型安全与责任方面的全面评测, 以及模型开发过程的详细说明. 我们相信, 负责任地发布大语言模型 (LLM) 对提升前沿模型的安全性, 对推动下一波 LLM 创新都至关重要.

> **对一下:** 页首有两个日期, 右上的 2024-02-21 和左侧 arXiv 戳上的 「v4 16 Apr 2024」. v1 和 v4 各是哪天?
> arXiv 戳标的是第 4 版, 日期 2024-04-16. 编号 2403.08295 的前缀 2403 表示首次提交在 2024 年 3 月, arXiv 记录的 v1 提交日是 2024-03-13, 所以 2024-02-21 不是 v1 的 arXiv 日期, 而是 DeepMind 印在报告上的日期, 与权重公开的日子相同. v4 的内容也晚于这个日期: 正文表 5 和表 8 换成了 Gemma 1.1 IT, 1.0 IT 的结果挪到第 17 页附录的表 9 和表 10. 引用时日期写 2024-02-21, 版本写 v4, 读到的指令模型分数属于 1.1.

> **拆开:** 11/18 的分母是哪 18 个任务, 11 又是怎么数出来的?
> 表 6 正好 18 行: MMLU, HellaSwag, PIQA, SIQA, BoolQ, Winogrande, CQA, OBQA, ARC-e, ARC-c, TriviaQA, NQ, HumanEval, MBPP, GSM8K, MATH, AGIEval, BBH. 拿 Gemma 7B 逐行对比 LLaMA-2 7B, LLaMA-2 13B, Mistral 7B 三列里的最高分: 严格领先 10 行 (MMLU, HellaSwag, SIQA, CQA, ARC-e, HumanEval, MBPP, GSM8K, MATH, AGIEval), BoolQ 与 Mistral 同为 83.2, 落后 7 行 (PIQA, Winogrande, OBQA, ARC-c, TriviaQA, NQ, BBH). 10 行领先加 1 行平局正好 11. 去掉 13B 那列结果不变; 只和 Mistral 7B 比则是严格领先 12 行. 原文没写计数规则, 「11」 按 「不低于」 的口径才对得上, 这是对表 6 推出来的. Gemma 2B 不在这个计数里, 表 6 没有和它同尺寸的列.

## Introduction

We present Gemma, a family of open models based on Google’s Gemini models (Gemini Team, 2023).

我们介绍 Gemma, 一族基于 Google Gemini 模型 (Gemini Team, 2023) 的开放模型.

We trained Gemma models on up to 6T tokens of text, using architectures, data, and training recipes inspired by the Gemini model family. Like Gemini, these models achieve strong generalist capabilities in text domains, alongside state-of-the-art understanding and reasoning skills at scale. With this work, we release both pre-trained and fine-tuned checkpoints, as well as an open-source codebase for inference and serving.

我们用最多 6T 个 token 的文本训练 Gemma 模型, 架构, 数据和训练方案都借鉴自 Gemini 模型家族. 与 Gemini 一样, 这些模型在文本领域有很强的通用能力, 并在大规模下具备顶尖的理解与推理能力. 这次我们同时发布预训练和微调检查点, 以及一套用于推理和部署服务的开源代码库.

Gemma comes in two sizes: a 7 billion parameter model for efficient deployment and development on GPU and TPU, and a 2 billion parameter model for CPU and on-device applications. Each size is designed to address different computational constraints, applications, and developer requirements. At each scale, we release raw, pre-trained checkpoints, as well as checkpoints finetuned for dialogue, instruction-following, helpfulness, and safety. We thoroughly evaluate the shortcomings of our models on a suite of quantitative and qualitative benchmarks. We believe the release of both pretrained and fine-tuned checkpoints will enable thorough research and investigation into the impact of current instructiontuning regimes, as well as the development of increasingly safe and responsible model development methodologies.

Gemma 有两个尺寸: 70 亿参数的模型面向 GPU 和 TPU 上的高效部署与开发, 20 亿参数的模型面向 CPU 和端侧应用. 每个尺寸针对不同的算力约束, 应用场景和开发者需求设计. 每个尺寸我们都发布原始的预训练检查点, 以及为对话, 指令遵循, 有用性和安全而微调的检查点. 我们在一套定量和定性基准上全面评估了模型的不足. 我们相信, 同时发布预训练和微调检查点, 能让大家深入研究当前指令微调方案的影响, 也有助于发展越来越安全, 负责任的模型开发方法.

Gemma advances state-of-the-art performance relative to comparable-scale (and some larger), open models (Almazrouei et al., 2023; Jiang et al., 2023; Touvron et al., 2023a,b) across a wide range of domains including both automated benchmarks and human evaluation. Example domains include question answering (Clark et al., 2019; Kwiatkowski et al., 2019), commonsense reasoning (Sakaguchi et al., 2019; Suzgun et al., 2022), mathematics and science (Cobbe et al., 2021; Hendrycks et al., 2020), and coding (Austin et al., 2021; Chen et al., 2021). See complete details in the Evaluation section.

与规模相当 (以及部分更大) 的开放模型 (Almazrouei et al., 2023; Jiang et al., 2023; Touvron et al., 2023a,b) 相比, Gemma 在大量领域上推进了最佳水平, 既包括自动化基准, 也包括人工评测. 涉及的领域例如问答 (Clark et al., 2019; Kwiatkowski et al., 2019), 常识推理 (Sakaguchi et al., 2019; Suzgun et al., 2022), 数学与科学 (Cobbe et al., 2021; Hendrycks et al., 2020) 和编程 (Austin et al., 2021; Chen et al., 2021). 完整细节见评测一节.

Like Gemini, Gemma builds on recent work on sequence models (Sutskever et al., 2014) and transformers (Vaswani et al., 2017), deep learning methods based on neural networks (LeCun et al., 2015), and techniques for large-scale training on distributed systems (Barham et al., 2022; Dean et al., 2012; Roberts et al., 2023). Gemma also builds on Google’s long history of open models and ecosystems, including Word2Vec (Mikolov et al., 2013), the Transformer (Vaswani et al., 2017), BERT (Devlin et al., 2018), and T5 (Raffel et al., 2019) and T5X (Roberts et al., 2022).

与 Gemini 一样, Gemma 建立在序列模型 (Sutskever et al., 2014), Transformer (Vaswani et al., 2017), 基于神经网络的深度学习方法 (LeCun et al., 2015) 以及分布式系统上的大规模训练技术 (Barham et al., 2022; Dean et al., 2012; Roberts et al., 2023) 等工作之上. Gemma 也延续了 Google 长期以来开放模型和生态的传统, 包括 Word2Vec (Mikolov et al., 2013), Transformer (Vaswani et al., 2017), BERT (Devlin et al., 2018), T5 (Raffel et al., 2019) 和 T5X (Roberts et al., 2022).

We believe the responsible release of LLMs is critical for improving the safety of frontier models, for ensuring equitable access to this breakthrough technology, for enabling rigorous evaluation and analysis of current techniques, and for enabling the development of the next wave of innovations. While thorough testing of all Gemma models has

我们相信, 负责任地发布 LLM 至关重要: 它能提升前沿模型的安全性, 让人们公平地获得这项突破性技术, 让现有技术得到严格的评估与分析, 并推动下一波创新. 虽然我们已经对所有 Gemma 模型做了全面测试,

<sup>1</sup>See Contributions and Acknowledgments section for full author list. Please send correspondence to gemma-1-report@google.com. © 2024 Google DeepMind. All rights reserved

脚注 1: 完整作者名单见贡献与致谢一节. 来信请寄 gemma-1-report@google.com. © 2024 Google DeepMind. 保留所有权利.

<!-- page 2 of 17 -->

Gemma: Open Models Based on Gemini Research and Technology

![Chart block](images/p02-figure-1-language-understanding-and-generation.png)

Figure 1 | Language understanding and generation performance of Gemma 7B across different capabilities compared to similarly sized open models. We group together standard academic benchmark evaluations by capability and average the respective scores; see Table 6 for a detailed breakdown of performance.

图 1 | Gemma 7B 在不同能力上的语言理解与生成表现, 与尺寸相近的开放模型对比. 我们按能力把标准学术基准归组, 对组内分数取平均; 各项明细见表 6.

> **回看:** 图 1 的四组各含哪些基准? 图注只说 「按能力归组取平均」.
> 用表 6 的数能反推其中两组. Coding 组是 HumanEval 和 MBPP 的平均: Gemma 7B (32.3 + 44.4)/2 = 38.35, Mistral 33.2, LLaMA-2 13B 24.45, LLaMA-2 7B 16.8, 与柱高一致. Math / Science 组是 GSM8K, MATH, MMLU 三项的平均: 45.0, 36.87, 29.13, 20.8, 也对得上. Question Answering 和 Reasoning 两组用剩下的 13 行拼不出唯一解, 读柱高只能到 1 分左右的精度. 另外, Question Answering 一组里 Gemma 7B (约 62) 低于 LLaMA-2 13B (约 64), 图 1 不是四组全胜.

been conducted, testing cannot cover all applications and scenarios in which Gemma may be used. With this in mind, all Gemma users should conduct rigorous safety testing specific to their use case before deployment or use. More details on our approach to safety can be found in section Responsible Deployment.

但测试无法覆盖 Gemma 可能被用到的全部应用和场景. 因此, 所有 Gemma 用户都应在部署或使用之前, 针对自己的用例做严格的安全测试. 我们的安全做法详见负责任部署一节.

In this technical report, we provide a detailed overview of the model architecture, training infrastructure, and pretraining and fine-tuning recipes for Gemma, followed by thorough evaluations of all checkpoints across a wide-variety of quantitative and qualitative benchmarks, as well as both standard academic benchmarks and human-preference evaluations. We then discuss in detail our approach to safe and responsible deployment. Finally, we outline the broader implications of Gemma, its limitations and advantages.

本技术报告先详细介绍 Gemma 的模型架构, 训练基础设施, 以及预训练和微调方案, 然后在大量定量和定性基准上全面评测所有检查点, 包括标准学术基准和人类偏好评测. 接着详细讨论我们实现安全, 负责任部署的做法. 最后概述 Gemma 更广泛的意义, 它的局限和优势.

## Model Architecture

**模型架构**

The Gemma model architecture is based on the transformer decoder (Vaswani et al., 2017). The core parameters of the architecture are summarized in Table 1. Models are trained on a context length of 8192 tokens. We also utilize several improvements proposed after the original trans-

Gemma 的模型架构基于 Transformer 解码器 (Vaswani et al., 2017). 架构的核心参数汇总在表 1. 模型训练时的上下文长度是 8192 个 token. 我们还采用了原始 Transformer

| Parameters | 2B | 7B |
| --- | --- | --- |
| d_model | 2048 | 3072 |
| Layers | 18 | 28 |
| Feedforward hidden dims | 32768 | 49152 |
| Num heads | 8 | 16 |
| Num KV heads | 1 | 16 |
| Head size | 256 | 256 |
| Vocab size | 256128 | 256128 |

Table 1 | Key model parameters.

表 1 | 关键模型参数.

> **看表:** 表 1 里 2B 和 7B 哪几行能直接比?
> 只有 Head size (256) 和 Vocab size (256128) 两行相同, 再加上正文的 8192 上下文. 其余几行都变了, 而且不按同一比例: d_model 从 2048 到 3072 (1.5 倍), 层数从 18 到 28, KV 头从 1 到 16. 7B 的 Num heads x Head size = 16 x 256 = 4096, 大于 d_model 3072; 2B 是 8 x 256 = 2048, 恰好等于 d_model. 再加上训练数据 3T 对 6T (第 3 页训练数据一节), 2B 和 7B 的任何分差都同时混着宽度, 深度, 注意力形式和数据量四个因素, 表 6 两列 Gemma 的差不能只归给参数量.

former paper, and list them below:

论文之后提出的几项改进, 列举如下:

**Multi-Query Attention** (Shazeer, 2019). Notably, the 7B model uses multi-head attention while the 2B checkpoints use multi-query attention (with 𝑛𝑢𝑚\_𝑘𝑣\_ℎ𝑒𝑎𝑑𝑠 = 1), based on ablations that showed that multi-query attention works well at small scales (Shazeer, 2019).

**Multi-Query Attention** (Shazeer, 2019). 值得注意的是, 7B 模型用 multi-head attention, 2B 检查点用 multi-query attention (num_kv_heads = 1). 依据是消融实验显示 multi-query attention 在小规模下效果很好 (Shazeer, 2019).

> **确认:** 2B 选 multi-query attention 的依据是一组消融, 消融数字在哪?
> 全文没有这组消融的表. 能从表 1 算的是推理时的 KV cache: 每个 token 要存 2 x 层数 x KV 头数 x Head size 个数. 2B 是 2 x 18 x 1 x 256 = 9,216, 7B 是 2 x 28 x 16 x 256 = 229,376, 相差 24.9 倍. 假设按 bf16 每个数 2 字节, 8192 上下文下 2B 约 151 MB, 7B 约 3.76 GB. 2B 的定位是 CPU 和端侧 (第 1 页 Introduction), 这组数比 「小规模下效果好」 更能说明它为什么只留 1 个 KV 头.

**RoPE Embeddings** (Su et al., 2021). Rather than using absolute positional embeddings, we use rotary positional embeddings in each layer; we also share embeddings across our inputs and outputs to reduce model size.

**RoPE 嵌入** (Su et al., 2021). 我们不用绝对位置嵌入, 而是在每一层使用旋转位置嵌入; 我们还在输入和输出之间共享嵌入, 以减小模型尺寸.

> **核对:** 「输入输出共享嵌入」 能在表 2 里看出来吗?
> 能. 表 2 的嵌入参数正好等于词表乘 d_model: 256128 x 2048 = 524,550,144, 256128 x 3072 = 786,825,216, 只算了一份, 输出层没有另一套矩阵. 两档总参数是 2,506,434,560 和 8,538,074,112, 即约 2.51B 和 8.54B. 名字里的 2B 和 7B 更接近非嵌入参数 (1.98B 和 7.75B). 嵌入在 2B 里占约 20.9%, 在 7B 里占约 9.2%, 256k 大词表压在 2B 身上的比例是 7B 的两倍多.

**GeGLU Activations** (Shazeer, 2020). The standard ReLU non-linearity is replaced by the approx-

**GeGLU 激活** (Shazeer, 2020). 标准的 ReLU 非线性被替换为

<!-- page 3 of 17 -->

Gemma: Open Models Based on Gemini Research and Technology

| Model | Embedding Parameters | Non-embedding Parameters |
| --- | --- | --- |
| 2B | 524,550,144 | 1,981,884,416 |
| 7B | 786,825,216 | 7,751,248,896 |

Table 2 | Parameter counts for the Gemma models. We inherit from the large Gemini vocabulary (256k entries), that is designed to work on large quantities of languages, hence, the larger embedding parameter counts compared to models that are limited to one or a few languages.

表 2 | Gemma 模型的参数量. 我们沿用了 Gemini 的大词表 (256k 条), 它为大量语言设计, 因此嵌入参数量比只覆盖一种或少数几种语言的模型更大.

> **拆开:** 表 1 的 Feedforward hidden dims 32768 和 49152 是 GeGLU 单支的宽度吗?
> 用表 2 反推. 记 d 为 d_model, L 为层数, h 为前馈单支宽度. 每层注意力参数为 2 x d x (n_heads x 256) + 2 x d x (n_kv x 256); GeGLU 的门, 上投影, 下投影合计 3 x d x h; 每层两个 RMSNorm 各 d 个参数; 最后一层后再加一个 d. 非嵌入参数 = L x (注意力 + 3dh + 2d) + d. 2B 取 h = 16384 得 1,981,884,416, 7B 取 h = 24576 得 7,751,248,896, 与表 2 逐位相同. 所以表 1 写的是门和上投影两支合起来的宽度 2h, 单支是 16384 和 24576.

imated version of the GeGLU activation function.

GeGLU 激活函数的近似版本.

**RMSNorm**. We normalize the input of each transformer sub-layer, the attention layer and the feedforward layer, with RMSNorm (Zhang and Sennrich, 2019) to stabilize the training.

**RMSNorm**. 我们用 RMSNorm (Zhang and Sennrich, 2019) 对每个 Transformer 子层 (注意力层和前馈层) 的输入做归一化, 以稳定训练.

## Training Infrastructure

**训练基础设施**

We train the Gemma models using TPUv5e; TPUv5e are deployed in pods of 256 chips, configured into a 2D torus of 16 x 16 chips. For the 7B model, we train our model across 16 pods, totaling to 4096 TPUv5e. We pretrain the 2B model across 2 pods, totaling 512 TPUv5e. Within a pod, we use 16-way model sharding and 16-way data replication for the 7B model. For the 2B, we simply use 256-way data replication. The optimizer state is further sharded using techniques similar to ZeRO-3. Beyond a pod, we perform datareplica reduce over the data-center network, using Pathways approach of (Barham et al., 2022).

我们用 TPUv5e 训练 Gemma 模型. TPUv5e 以 256 块芯片为一个 pod 部署, 配置成 16 x 16 的 2D torus. 7B 模型在 16 个 pod 上训练, 共 4096 块 TPUv5e. 2B 模型在 2 个 pod 上预训练, 共 512 块 TPUv5e. 在一个 pod 内, 7B 模型用 16 路模型切分和 16 路数据副本; 2B 模型直接用 256 路数据副本. 优化器状态再用类似 ZeRO-3 的技术切分. 跨 pod 时, 我们沿用 (Barham et al., 2022) 的 Pathways 做法, 在数据中心网络上做数据副本间的归约.

> **再看:** 两档的并行度各是多少?
> 7B: 一个 pod 的 256 块芯片 = 16 路模型切分 x 16 路数据副本, 16 个 pod 共 4096 块, 数据并行度 16 x 16 = 256, 模型并行度 16. 2B: pod 内 256 路数据副本, 2 个 pod 共 512 块, 全部是数据并行, 没有模型切分. 这些数都出自本段. 原文没给 batch size, 训练步数和墙钟时长, 所以算不出每块芯片处理了多少 token.

We follow Gemini and we leverage the ’single controller’ programming paradigm of Jax (Roberts et al., 2023) and Pathways (Barham et al., 2022). This simplifies the development process by enabling a single Python process to orchestrate the entire training run; we also leverage the GSPMD partitioner (Xu et al., 2021) for the training step computation and the MegaScale XLA compiler (XLA, 2019).

我们沿用 Gemini 的做法, 利用 Jax (Roberts et al., 2023) 和 Pathways (Barham et al., 2022) 的 「单控制器」 编程范式. 这让单个 Python 进程就能编排整个训练过程, 简化了开发; 训练步的计算还用了 GSPMD 切分器 (Xu et al., 2021) 和 MegaScale XLA 编译器 (XLA, 2019).

## Carbon Footprint

**碳足迹**

We estimate the carbon emissions from pretraining the Gemma models to be ∼ 131 𝑡𝐶𝑂<sub>2</sub>𝑒𝑞. This

我们估计 Gemma 模型预训练的碳排放约为 131 tCO2eq.

value is calculated based on the hourly energy usage reported directly from our TPU datacenters; we also scale this value to account for the additional energy expended to create and maintain the data center, giving us the total energy usage for our training experiments. We convert total energy usage to carbon emissions by joining our hourly energy usage against hourly per-cell carbon emission data reported by our data centers.

这个数值依据 TPU 数据中心直接报告的每小时能耗算出; 我们还按比例上调了这个数值, 计入建设和维护数据中心的额外能耗, 得到训练实验的总能耗. 再把每小时能耗与数据中心报告的每小时各单元碳排放数据对应起来, 把总能耗换算成碳排放.

> **停一下:** 131 tCO2eq 是两档合计, 还是只算 7B?
> 原文只给一个数, 范围是 「Gemma 模型的预训练」, 不含微调. 用 6ND 粗估算力 (N 取表 2 总参数, D 取第 3 页的训练 token 数): 2B 约 6 x 2.51e9 x 3e12 ≈ 4.5e22 FLOPs, 7B 约 6 x 8.54e9 x 6e12 ≈ 3.1e23 FLOPs, 7B 占两者合计的约 87%. 这是估算, 原文没有这组数, 但足以说明 131 吨主要来自 7B.

In addition, Google data centers are carbon neutral, achieved through a combination of energy efficiency, renewable energy purchases, and carbon offsets. This carbon neutrality applies to our experiments and the machines running them.

此外, Google 数据中心通过提升能效, 购买可再生能源和碳抵消实现了碳中和. 这种碳中和覆盖我们的实验以及运行实验的机器.

## Pretraining

**预训练**

## Training Data

**训练数据**

Gemma 2B and 7B are trained on 3T and 6T tokens respectively of primarily-English data from web documents, mathematics, and code. Unlike Gemini, these models are not multimodal, nor are they trained for state-of-the-art performance on multilingual tasks.

Gemma 2B 和 7B 分别在 3T 和 6T 个 token 上训练, 数据以英文为主, 来自网页文档, 数学和代码. 与 Gemini 不同, 这些模型不是多模态的, 也没有为多语言任务上的最佳表现而训练.

> **想:** 3T 和 6T token 相对各自的参数量是多少?
> 按表 2 总参数算, 2B 每个参数约 1197 个 token, 7B 约 703 个; 按非嵌入参数算是 1514 和 774. Hoffmann et al. (2022) 给出的计算最优比例约为每参数 20 个 token, 两档都远超这个比例, 2B 超得更多. 2B 的数据总量是 7B 的一半, 按每参数计却多出约 70%. 回看表 6 两列 Gemma 的差距时, 这一点要和表 1 的结构差异一起算进去.

We use a subset of the SentencePiece tokenizer (Kudo and Richardson, 2018) of Gemini for compatibility. It splits digits, does not remove extra whitespace, and relies on byte-level encodings for unknown tokens, following the techniques used for both (Chowdhery et al., 2022) and (Gemini Team, 2023). The vocabulary size is 256k tokens.

为了兼容, 我们使用 Gemini 的 SentencePiece 分词器 (Kudo and Richardson, 2018) 的一个子集. 它会把数字逐位拆开, 不删除多余的空白, 对未知 token 退回字节级编码, 沿用了 (Chowdhery et al., 2022) 和 (Gemini Team, 2023) 的技术. 词表大小为 256k 个 token.

## Filtering

**过滤**

We filter the pre-training dataset to reduce the risk of unwanted or unsafe utterances, and filter out certain personal information or other sensitive data. This includes both heuristics and modelbased classifiers to remove harmful or low-quality content. Further, we filter all evaluation sets from our pre-training data mixture, run targeted contamination analyses to check against evaluation set leakage, and reduce the risk of recitation by minimizing proliferation of sensitive outputs.

我们过滤预训练数据集, 以降低出现不想要或不安全内容的风险, 并滤掉某些个人信息或其他敏感数据. 做法包括启发式规则和基于模型的分类器, 用来去除有害或低质量的内容. 此外, 我们从预训练数据混合中滤掉所有评测集, 做有针对性的污染分析以检查评测集是否泄漏, 并通过减少敏感输出的扩散来降低复述训练数据的风险.

The final data mixture was determined through a series of ablations on both the 2B and 7B models. Similar to the approach advocated in (Gemini

最终的数据混合是通过在 2B 和 7B 模型上做一系列消融确定的. 与 (Gemini

<!-- page 4 of 17 -->

Gemma: Open Models Based on Gemini Research and Technology

Team, 2023), we stage training to alter the corpus mixture throughout training to increase the weight of relevant, high-quality data towards the end of training.

Team, 2023) 倡导的做法类似, 我们分阶段训练, 在训练过程中调整语料配比, 越到训练后期, 相关的高质量数据权重越高.

## Instruction Tuning

**指令微调**

We finetune Gemma 2B and 7B with supervised fine-tuning (SFT) on a mix of text-only, Englishonly synthetic and human-generated promptresponse pairs and reinforcement learning from human feedback (RLHF) with the reward model trained on labelled English-only preference data and the policy based on a set of high-quality prompts. We find that both stages are important for improved performance on downstream automatic evaluations and human preference evaluations of model outputs.

我们对 Gemma 2B 和 7B 做两步微调. 第一步是监督微调 (SFT), 数据是纯文本, 纯英文的合成与人写 prompt-response 对的混合. 第二步是基于人类反馈的强化学习 (RLHF), 奖励模型在带标注的纯英文偏好数据上训练, 策略基于一组高质量 prompt. 我们发现两个阶段对提升下游自动评测和模型输出的人类偏好评测都很重要.

## Supervised Fine-Tuning

**监督微调**

We selected our data mixtures for supervised finetuning based on LM-based side-by-side evaluations (Zheng et al., 2023). Given a set of heldout prompts, we generate responses from a test model, generate responses on the same prompts from a baseline model, shuffle these randomly, and ask a larger, high capability model to express a preference between two responses. Different prompt sets are constructed to highlight specific capabilities, such as instruction following, factuality, creativity, and safety. Our LM-based judges employ a number of known strategies, such as chain-of-thought prompting (Wei et al., 2022), rubrics and constitutions (Bai et al., 2022), to be aligned with human preferences.

我们根据基于语言模型的 side-by-side 评测 (Zheng et al., 2023) 选择监督微调的数据混合. 给定一组留出的 prompt, 我们用待测模型生成回答, 用基线模型在同样的 prompt 上生成回答, 随机打乱顺序, 再请一个更大, 能力更强的模型在两个回答中表达偏好. 我们构造不同的 prompt 集来突出特定能力, 例如指令遵循, 事实性, 创造性和安全. 我们的语言模型评委采用了多种已知策略, 例如 chain-of-thought 提示 (Wei et al., 2022), 评分细则和 constitution (Bai et al., 2022), 以便与人类偏好对齐.

## Filtering

**过滤**

When using synthetic data, we run several stages of filtering over it, removing examples that show certain personal information, unsafe or toxic model outputs, mistaken self-identification data, or duplicated examples. Following Gemini, we find that including subsets of data that encourage better in-context attribution, hedging, and refusals to minimize hallucinations improves performance on factuality metrics, without degrading model performance on other metrics.

使用合成数据时, 我们对它做多轮过滤, 去掉含某些个人信息的样本, 不安全或有毒的模型输出, 错误的自我身份认定数据, 以及重复样本. 沿用 Gemini 的经验, 我们发现加入鼓励更好的上下文归因, 措辞留余地 (hedging) 和拒答的数据子集来减少幻觉, 能提升事实性指标, 又不损害其他指标上的表现.

The final data mixtures and supervised finetuning recipe, which includes tuned hyperparameters, were chosen on the basis of improving helpfulness while minimizing model harms related to safety and hallucinations.

最终的数据混合和监督微调方案 (包括调好的超参数) 的选择标准是: 提升有用性, 同时把与安全和幻觉相关的模型危害降到最低.

## Formatting

**格式**

Instruction tuned models are trained with a specific formatter that annotates all instruction tuning examples with extra information, both at training and inference time. It has two purposes: 1) indicating roles in a conversation, such as the User role, and 2) delineating turns in a conversation, especially in a multi-turn conversation. Special control tokens are reserved in the tokenizer for this purpose. While it is possible to get coherent generations without the formatter, it will be out-of-distribution for the model, and will very likely produce worse generations.

指令微调模型用一个特定的格式器训练, 训练和推理阶段都由它给所有指令微调样本加上额外信息. 它有两个用途: 1) 标明对话中的角色, 例如 User 角色; 2) 划分对话中的轮次, 在多轮对话中尤其需要. 为此分词器里预留了专用的控制 token. 不用这个格式器也能得到连贯的生成, 但那对模型来说属于分布外输入, 生成质量很可能更差.

The relevant formatting control tokens are pre-sented in Table 3, with a dialogue example pre-sented in Table 4.

相关的格式控制 token 列在表 3, 一段对话示例见表 4.

| Context | Relevant Token |
| --- | --- |
| User turn | user |
| Model turn | model |
| Start of conversation turn | &lt;start_of_turn> |
| End of conversation turn | &lt;end_of_turn> |

Table 3 | Relevant formatting control tokens used for both SFT and RLHF of Gemma models.

表 3 | Gemma 模型 SFT 和 RLHF 共用的格式控制 token. 四行分别对应用户轮, 模型轮, 对话轮开始, 对话轮结束.

```textproto
User: <start_of_turn>user
Knock knock.<end_of_turn>
<start_of_turn>model
Model: Who's there?<end_of_turn>
User: <start_of_turn>user
Gemma.<end_of_turn>
<start_of_turn>model
Model: Gemma who?<end_of_turn>
```

Table 4 | Example dialogue with user and model control tokens.

表 4 | 带用户和模型控制 token 的对话示例.

> **看表:** 表 4 每行开头的 「User:」 和 「Model:」 是输入的一部分吗?
> 不是. 表 3 只列了 4 个控制串: user, model, <start_of_turn>, <end_of_turn>. 「User:」 和 「Model:」 不在其中, 是排版时标出的说话方. 真正送进模型的是以 `<start_of_turn>user` 开头, 以 `<end_of_turn>` 结尾的片段; 模型要生成的是 `<start_of_turn>model` 之后到 `<end_of_turn>` 为止的内容. 照着表 4 把 「User:」 也拼进 prompt, 就落进了上一段说的分布外输入.

## Reinforcement Learning from Human Feedback

**基于人类反馈的强化学习**

We further finetuned the supervised fine-tuned model using RLHF (Christiano et al., 2017;

我们用 RLHF (Christiano et al., 2017;

<!-- page 5 of 17 -->

Gemma: Open Models Based on Gemini Research and Technology

Ouyang et al., 2022). We collected pairs of preferences from human raters and trained a reward function under the Bradley-Terry model (Bradley and Terry, 1952), similarly to Gemini. The policy was trained to optimize this reward function using a novel reinforcement learning algorithm. Similar to the SFT phase, and in order to tune hyperparameters and additionally mitigate reward hacking (Amodei et al., 2016; Skalse et al., 2022) we relied on a high capacity model as an automatic rater and computed side-by-side comparisons against baseline models.

Ouyang et al., 2022) 对监督微调后的模型做进一步微调. 我们收集人类评分者给出的成对偏好, 沿用 Gemini 的做法, 在 Bradley-Terry 模型 (Bradley and Terry, 1952) 下训练奖励函数. 策略用一种新的强化学习算法训练, 以优化这个奖励函数. 与 SFT 阶段类似, 为了调超参数并进一步缓解 reward hacking (Amodei et al., 2016; Skalse et al., 2022), 我们用一个高能力模型作自动评分者, 与基线模型做 side-by-side 比较.

> **问:** 奖励模型用 Bradley-Terry, 策略用 「一种新的强化学习算法」. 这个算法叫什么?
> 原文没有给名字, 目标函数和超参数. 能确定的只有奖励模型的形式: P(a 优于 b) = σ(r(a) - r(b)), r 是奖励函数, σ 是 logistic 函数. 自动评分同样交给 「高能力模型」 做 side-by-side, 和第 4 页监督微调一节挑数据的办法相同. 这一节只能读出流程, 复现不了.

## Evaluation

**评测**

We evaluate Gemma across a broad range of domains, using both automated benchmarks and human evaluation.

我们在广泛的领域上评测 Gemma, 同时使用自动化基准和人工评测.

## Human Preference Evaluations

**人类偏好评测**

In addition to running standard academic benchmarks on the finetuned models, we sent final release candidates to human evaluation studies to be compared against the Mistral v0.2 7B Instruct model (Jiang et al., 2023).

除了在微调模型上跑标准学术基准, 我们还把最终的发布候选送去做人工评测, 与 Mistral v0.2 7B Instruct 模型 (Jiang et al., 2023) 对比.

> **回看:** 预训练和微调是不是同一列分数? 这句说学术基准也在微调模型上跑过.
> 不是同一列. 表 6, 表 7 和图 1 的列名只写 「Gemma 2B/7B」, 没有 PT 或 IT 字样; 对照对象是 LLaMA-2 和 Mistral 的基座模型, LLaMA-2 的数取自 Touvron et al. (2023b), 所以这些列按预训练模型读. 微调模型的分数只出现在四张表: 表 5 和表 8 是 Gemma 1.1 IT, 表 9 和表 10 是 Gemma 1.0 IT. 这句提到的 「微调模型上的学术基准」 全文没有给表. 表 6 的 64.3 和表 5 的 61.2% 都挂在 「Gemma 7B」 名下, 实际分属预训练 7B 和 1.1 IT 7B 两个检查点, 附录里还有第三个, 1.0 IT 7B.

On a held-out collection of around 1000 prompts oriented toward asking models to follow instructions across creative writing tasks, coding, and following instructions, Gemma 7B IT has a 61.2% positive win rate and Gemma 2B IT has a 45% win rate over Mistral v0.2 7B Instruct. On a held-out collection of around 400 prompts oriented towards testing basic safety protocols, Gemma 7B IT has a 63.5% win rate, while Gemma 2B IT has a 60.1% win rate. We report the corresponding numbers in Table 5.

在约 1000 条留出 prompt 上 (这些 prompt 要求模型在创意写作, 编程和指令遵循等任务中按指令行事), Gemma 7B IT 对 Mistral v0.2 7B Instruct 的胜率为 61.2%, Gemma 2B IT 为 45%. 在约 400 条用于检验基本安全规范的留出 prompt 上, Gemma 7B IT 的胜率为 63.5%, Gemma 2B IT 为 60.1%. 对应数字见表 5.

## Automated Benchmarks

**自动化基准**

We measure Gemma models’ performance on domains including physical reasoning (Bisk et al., 2019), social reasoning (Sap et al., 2019), question answering (Clark et al., 2019; Kwiatkowski et al., 2019), coding (Austin et al., 2021; Chen et al., 2021), mathematics (Cobbe et al., 2021), commonsense reasoning (Sakaguchi et al., 2019), language modeling (Paperno et al., 2016), read-

我们在以下领域测量 Gemma 模型的表现: 物理推理 (Bisk et al., 2019), 社会推理 (Sap et al., 2019), 问答 (Clark et al., 2019; Kwiatkowski et al., 2019), 编程 (Austin et al., 2021; Chen et al., 2021), 数学 (Cobbe et al., 2021), 常识推理 (Sakaguchi et al., 2019), 语言建模 (Paperno et al., 2016), 阅读

| Model | Safety | Instr. Following |
| --- | --- | --- |
| Gemma 1.1 IT 7B | 63.5% | 61.2% |
| 95% Conf. Interval | [60.7%, 66.1%] | [59.3%, 63%] |
| Win/ Tie/ Loss | 51.5% / 23.9% / 24.6% | 52.2% / 18.1% / 29.8% |
| Gemma 1.1 IT 2B | 60.1% | 45% |
| 95% Conf. Interval | [57.3%, 62.8%] | [43.1%, 46.9%] |
| Win/ Tie/ Loss | 48.5% / 23.2% / 28.3% | 37.1% / 15.8% / 47.1% |

Table 5 | Win rate of Gemma 1.1 IT models versus Mistral 7B v0.2 Instruct with 95% confidence intervals. We report breakdowns of wins, ties, and losses, and we break ties evenly when reporting the final win rate. Gemma 1.0 results can be found in the appendix.

表 5 | Gemma 1.1 IT 模型对 Mistral 7B v0.2 Instruct 的胜率及 95% 置信区间. 我们给出胜, 平, 负的分项, 报告最终胜率时平局对半计入. Gemma 1.0 的结果见附录.

> **核对:** 61.2% 和 45% 怎么由 Win/Tie/Loss 算出来? 正文说的 「Gemma 7B IT」 是哪一版?
> 表注说平局对半分, 胜率 = 胜 + 平/2. 7B 指令遵循 52.2 + 18.1/2 = 61.25, 2B 为 37.1 + 15.8/2 = 45.0; 安全列 51.5 + 23.9/2 = 63.45, 48.5 + 23.2/2 = 60.1, 四格全部对得上. 表头写 Gemma 1.1 IT, 正文只写 「Gemma 7B IT」, 两者是同一组数; 1.0 IT 的对应值在第 17 页表 9, 是 51.7% 和 41.6%. 2B 那格的 95% 区间 [43.1%, 46.9%] 整段在 50% 以下, 指令遵循上 2B IT 输给 Mistral 7B Instruct.

ing comprehension (Joshi et al., 2017), and more.

理解 (Joshi et al., 2017) 等.

For most automated benchmarks we use the same evaluation methodology as in Gemini. Specifically for those where we report performance compared with Mistral, we replicated methodology from the Mistral technical report as closely as possible. These specific benchmarks are: ARC (Clark et al., 2018), CommonsenseQA (Talmor et al., 2019), Big Bench Hard (Suzgun et al., 2022), and AGI Eval (English-only) (Zhong et al., 2023). Due to restrictive licensing, we were unable to run any evaluations on LLaMA-2 and cite only those metrics previously reported (Touvron et al., 2023b).

大多数自动化基准沿用 Gemini 的评测方法. 其中与 Mistral 对比的那些基准, 我们尽可能照搬了 Mistral 技术报告的方法, 具体是: ARC (Clark et al., 2018), CommonsenseQA (Talmor et al., 2019), Big Bench Hard (Suzgun et al., 2022) 和 AGI Eval (仅英文) (Zhong et al., 2023). 由于许可限制, 我们无法在 LLaMA-2 上跑任何评测, 只引用了此前已报告的指标 (Touvron et al., 2023b).

We compare Gemma 2B and 7B models to several external open-source (OSS) LLMs across a series of academic benchmarks, reported in Table 6 and Table 7.

我们在一系列学术基准上把 Gemma 2B 和 7B 与若干外部开源 (OSS) LLM 对比, 结果见表 6 和表 7.

On MMLU (Hendrycks et al., 2020), Gemma 7B outperforms all OSS alternatives at the same or smaller scale; it also outperforms several larger models, including LLaMA2 13B. However, human expert performance is gauged at 89.8% by the benchmark authors; as Gemini Ultra is the first model to exceed this threshold, there is significant room for continued improvements to achieve Gemini and human-level performance.

在 MMLU (Hendrycks et al., 2020) 上, Gemma 7B 超过同等或更小规模的所有开源模型, 也超过几个更大的模型, 包括 LLaMA2 13B. 不过基准作者估计人类专家的表现是 89.8%; Gemini Ultra 是第一个超过这条线的模型, 要达到 Gemini 和人类水平, 仍有很大的提升空间.

Gemma models demonstrate particularly strong performance on mathematics and coding benchmarks. On mathematics tasks, which are often used to benchmark the general analytical capabilities of models, Gemma models

Gemma 模型在数学和编程基准上表现尤其强. 数学任务常被用来衡量模型的一般分析能力, 在这类任务上, Gemma 模型

<!-- page 6 of 17 -->

Gemma: Open Models Based on Gemini Research and Technology

|  |  | LLa | MA-2 | Mistral | Gem | ma |
| --- | --- | --- | --- | --- | --- | --- |
| Benchmark | metric | 7B | 13B | 7B | 2B | 7B |
| MMLU | 5-shot, top-1 | 45.3 | 54.8 | 62.5 | 42.3 | 64.3 |
| HellaSwag | 0-shot | 77.2 | 80.7 | 81.0 | 71.4 | 81.2 |
| PIQA | 0-shot | 78.8 | 80.5 | 82.2 | 77.3 | 81.2 |
| SIQA | 0-shot | 48.3 | 50.3 | 47.0<sup>∗</sup> | 49.7 | 51.8 |
| Boolq | 0-shot | 77.4 | 81.7 | 83.2<sup>∗</sup> | 69.4 | 83.2 |
| Winogrande | partial scoring | 69.2 | 72.8 | 74.2 | 65.4 | 72.3 |
| CQA | 7-shot | 57.8 | 67.3 | 66.3<sup>∗</sup> | 65.3 | 71.3 |
| OBQA |  | 58.6 | 57.0 | 52.2 | 47.8 | 52.8 |
| ARC-e |  | 75.2 | 77.3 | 80.5 | 73.2 | 81.5 |
| ARC-c |  | 45.9 | 49.4 | 54.9 | 42.1 | 53.2 |
| TriviaQA | 5-shot | 72.1 | 79.6 | 62.5 | 53.2 | 63.4 |
| NQ | 5-shot | 25.7 | 31.2 | 23.2 | 12.5 | 23.0 |
| HumanEval | pass@1 | 12.8 | 18.3 | 26.2 | 22.0 | 32.3 |
| MBPP† | 3-shot | 20.8 | 30.6 | 40.2<sup>∗</sup> | 29.2 | 44.4 |
| GSM8K | maj@1 | 14.6 | 28.7 | 35.4<sup>∗</sup> | 17.7 | 46.4 |
| MATH | 4-shot | 2.5 | 3.9 | 12.7 | 11.8 | 24.3 |
| AGIEval |  | 29.3 | 39.1 | 41.2<sup>∗</sup> | 24.2 | 41.7 |
| BBH |  | 32.6 | 39.4 | 56.1<sup>∗</sup> | 35.2 | 55.1 |
| Average |  | 46.9 | 52.4 | 54.5 | 45.0 | 56.9 |

Table 6 | Academic benchmark results, compared to similarly sized, openly-available models trained on general English text data. † Mistral reports 50.2 on a different split for MBPP and on their split our 7B model achieves 54.5. ∗ evaluations run by us. Note that due to restrictive licensing, we were unable to run evals on LLaMA-2; all values above were previously reported in Touvron et al. (2023b).

表 6 | 学术基准结果, 与在通用英文文本上训练, 尺寸相近的公开模型对比. † Mistral 在另一个 MBPP 划分上报告 50.2, 在他们的划分上我们的 7B 模型得 54.5. ∗ 为我们自己跑的评测. 注意由于许可限制, 我们无法在 LLaMA-2 上跑评测; 上表 LLaMA-2 的数值均取自 Touvron et al. (2023b).

> **看表:** 表 6 里 2B 和 7B 哪一行能比? 2B 的对照列又是谁?
> 两列 Gemma 都是 Google 自己在同一套设定下跑的, 可以逐行直接比: 7B 在全部 18 行都高于 2B, 差距最大的是 GSM8K (46.4 对 17.7, 差 28.7), 最小的是 SIQA (51.8 对 49.7, 差 2.1). 2B 在这张表里没有同尺寸的对手, 最近的是 LLaMA-2 7B; 2B 只在 7 行超过它 (SIQA, CQA, HumanEval, MBPP, GSM8K, MATH, BBH), 平均分 45.0 对 46.9. 跨列比较时还要看星号: Mistral 列带 ∗ 的 7 格是 Google 重跑的, 其余 11 格没有星号, 按表注应是引用值; LLaMA-2 两列全部取自 Touvron et al. (2023b). 各列不是同一次评测.

outperform other models by at least 10 points on GSM8K (Cobbe et al., 2021) and the more difficult MATH (Hendrycks et al., 2021) benchmark. Similarly, they outperform alternate open models by at least 6 points on HumanEval (Chen et al., 2021). They even surpass the performance of the code-fine-tuned CodeLLaMA-7B models on MBPP (CodeLLaMA achieves a score of 41.4% where Gemma 7B achieves 44.4%).

在 GSM8K (Cobbe et al., 2021) 和更难的 MATH (Hendrycks et al., 2021) 上至少领先其他模型 10 分. 类似地, 在 HumanEval (Chen et al., 2021) 上至少领先其他开放模型 6 分. 在 MBPP 上它们甚至超过了专门为代码微调的 CodeLLaMA-7B (CodeLLaMA 得 41.4%, Gemma 7B 得 44.4%).

> **确认:** 「至少领先 10 分」 和 「至少 6 分」 的主语是 Gemma models, 2B 也算在内吗?
> 不算. 按表 6, 7B 的 GSM8K 46.4 比 Mistral 的 35.4 高 11.0, MATH 24.3 比 12.7 高 11.6, HumanEval 32.3 比 26.2 高 6.1, 三句都成立. 2B 的 GSM8K 17.7, MATH 11.8, HumanEval 22.0 全都低于 Mistral 7B. MBPP 那句拿 CodeLLaMA-7B 的 41.4% 比, 用的也是 7B 的 44.4%. 这一段的 「Gemma models」 实际只指 7B.

## Memorization Evaluations

**记忆评测**

Recent work has shown that aligned models may be vulnerable to new adversarial attacks that can bypass alignment (Nasr et al., 2023). These attacks can cause models to diverge, and sometimes regurgitate memorized training data in the process. We focus on discoverable memorization, which serves as a reasonable upper-bound on the

近期研究表明, 对齐过的模型可能会受到能绕过对齐的新型对抗攻击 (Nasr et al., 2023). 这类攻击会让模型发散, 过程中有时会复述记住的训练数据. 我们关注可发现记忆 (discoverable memorization), 它可以作为模型记忆量的合理上界

memorization of a model (Nasr et al., 2023) and has been the common definition used in several studies (Anil et al., 2023; Carlini et al., 2022; Kudugunta et al., 2023).

(Nasr et al., 2023), 也是多项研究 (Anil et al., 2023; Carlini et al., 2022; Kudugunta et al., 2023) 通用的定义.

We test for memorization<sup>1</sup> of the Gemma pre-trained models with the same methodology performed in Anil et al. (2023). We sample 10,000 documents from each corpus and use the first 50 tokens as a prompt for the model. We focus mainly on exact memorization, where we classify texts as memorized if the subsequent 50 tokens generated by the model exactly match the ground truth continuation in the text. However, to better capture potential paraphrased memorizations, we include approximate memorization (Ippolito et al., 2022) using an 10% edit distance thresh-

我们用 Anil et al. (2023) 的同一套方法测试 Gemma 预训练模型的记忆<sup>1</sup>. 从每个语料中采样 10,000 篇文档, 用前 50 个 token 作为模型的 prompt. 我们主要关注精确记忆: 如果模型生成的后续 50 个 token 与文本中的真实续写完全一致, 就把这段文本归为被记住. 为了更好地捕捉可能的改写式记忆, 我们也纳入近似记忆 (Ippolito et al., 2022), 使用 10% 的编辑距离阈

<small><span class="docvortex-page-footnote" data-block-type="page_footnote" style="color:#6b7280"><sup>1</sup>Our use of “memorization” relies on the definition of that term found at www.genlaw.org/glossary.html.</span></small>

脚注 1: 我们对 「记忆」 一词的使用依据 www.genlaw.org/glossary.html 上的定义.

<!-- page 7 of 17 -->

Gemma: Open Models Based on Gemini Research and Technology

|  | Mistral | Gemma |
| --- | --- | --- |
| Benchmark | 7B | 7B |
| ARC-c | 60.0 | 61.9 |
| HellaSwag | 83.3 | 82.2 |
| MMLU | 64.2 | 64.6 |
| TruthfulQA | 42.2 | 44.8 |
| Winogrande | 78.4 | 79.0 |
| GSM8K | 37.8 | 50.9 |
| Average | 61.0 | 63.8 |

Table 7 | HuggingFace H6 benchmark. The performance of small models are sensitive to small modifications in prompts and we further validate the quality of our models on an independent implementation of multiple known benchmarks. All evaluations were run by HuggingFace.

表 7 | HuggingFace H6 基准. 小模型的表现对 prompt 的微小改动很敏感, 我们用多个已知基准的一套独立实现进一步验证模型质量. 所有评测都由 HuggingFace 运行.

> **再看:** 表 7 和表 6 有 5 个基准重名, 同一个 Gemma 7B 为什么分数不同?
> MMLU 64.6 对 64.3, HellaSwag 82.2 对 81.2, Winogrande 79.0 对 72.3, ARC-c 61.9 对 53.2, GSM8K 50.9 对 46.4. 表 7 由 HuggingFace 用自己的实现跑, few-shot 数和打分方式都和表 6 不同, 表注也承认小模型对 prompt 的小改动很敏感. ARC-c 差 8.7, Winogrande 差 6.7, 同一模型换一套实现的差距, 比表 6 里 Gemma 7B 与 Mistral 7B 在 18 行中 16 行的差距都大. 另外按 6 项直接平均, 表 7 的 Gemma 是 383.4/6 = 63.9, 表里写 63.8; Mistral 是 365.9/6 = 60.98, 与 61.0 一致.

![Chart block](images/p07-chart.png)

![Chart block](images/p07-figure-2-comparing-average-memorization-rates-across.png)

Figure 2 | Comparing average memorization rates across model families. We compare the Gemma pretrained models to PaLM and PaLM 2 models of comparable size and find similarly low rates of memorization.

图 2 | 比较不同模型家族的平均记忆率. 我们把 Gemma 预训练模型与尺寸相当的 PaLM 和 PaLM 2 模型对比, 发现记忆率同样很低.

old. In Figure 2, we compare the results of our evaluation with the closest sized PaLM (Chowdh ery et al., 2022) and PaLM 2 models (Anil et al., 2023).

值. 在图 2 中, 我们把评测结果与尺寸最接近的 PaLM (Chowdhery et al., 2022) 和 PaLM 2 模型 (Anil et al., 2023) 对比.

**Verbatim Memorization** PaLM 2 compared with PaLM by evaluating on a shared subset of their training corpora. However, there is even less overlap between the Gemma pretraining data with the PaLM models, and so using this same methodology, we observe much lower memorization rates (Figure 2 left). Instead, we find that estimating the “total memorization” across the entire pretraining dataset gives a more reliable

**逐字记忆** PaLM 2 与 PaLM 比较时, 是在两者训练语料的共享子集上评测的. 而 Gemma 预训练数据与 PaLM 模型的重合更少, 所以用同样的方法, 我们观察到的记忆率低得多 (图 2 左). 我们发现, 估计整个预训练数据集上的 「总记忆」 能给出更可靠的

estimate (Figure 2 right) where we now find the Gemma memorizes training data at a comparable rate to PaLM.

估计 (图 2 右), 这时 Gemma 记住训练数据的比率与 PaLM 相当.

> **拆开:** 精确记忆和近似记忆的判定门槛各是多少? 图 2 左右两栏比的是同一批模型吗?
> 每个语料采 10,000 篇文档, 取前 50 个 token 作 prompt; 续写的 50 个 token 与原文完全一致算精确记忆, 编辑距离不超过 10% 算近似记忆, 即 50 个 token 里最多差 5 个. 图 2 左栏 (英文网页) 的对照是 PaLM 2 Small, Gemma 2B 和 7B 都在 0.1% 上下, PaLM 2 Small 接近 1%; 右栏 (全部内容) 的对照换成 PaLM Small, 三者都在 1% 到 2% 之间. 两栏的对照模型不同, 左栏 Gemma 偏低来自与 PaLM 2 共享数据少, 按右栏读, Gemma 的记忆率与 PaLM 相当.

![Chart block](images/p07-figure-3-measuring-personal-and-sensitive-data.png)

Figure 3 | Measuring personal and sensitive data memorization rates. No sensitive data was memorized, hence it is omitted from the figure.

图 3 | 测量个人数据和敏感数据的记忆率. 没有敏感数据被记住, 因此图中省略.

**Personal Data** Perhaps of higher importance is the possibility that personal data might be memorized. As part of making Gemma pre-trained models safe and reliable, we used automated techniques to filter out certain personal information and other sensitive data from training sets.

**个人数据** 更重要的或许是个人数据被记住的可能. 为了让 Gemma 预训练模型安全可靠, 我们用自动化技术从训练集中滤掉了某些个人信息和其他敏感数据.

To identify possible occurrences of personal data, we use Google Cloud Sensitive Data Protection<sup>2</sup>. This tool outputs three severity levels based on many categories of personal data (e.g., names, emails, etc.). We classify the highest severity as “sensitive” and the remaining two as simply “personal”. Then, we measure how many memorized outputs contain any sensitive or personal data. As shown in Figure 3, we observe no cases of memorized sensitive data. We do find that the model memorizes some data we have classified as potentially “personal” according to the above, though often at a much lower rate. Further, it is important to note that these tools are known to have many false positives (because they only match patterns and do not consider the context), meaning that our results are likely overestimates of the amount of personal data identified.

为了识别个人数据可能出现的地方, 我们使用 Google Cloud Sensitive Data Protection<sup>2</sup>. 这个工具根据多类个人数据 (如姓名, 邮箱等) 输出三个严重等级. 我们把最高等级归为 「敏感」, 其余两级统称 「个人」. 然后统计被记住的输出中有多少含有敏感或个人数据. 如图 3 所示, 我们没有观察到任何被记住的敏感数据. 模型确实会记住一些按上述标准归为可能 「个人」 的数据, 不过比率往往低得多. 还要指出, 这类工具已知有很多误报 (因为它们只匹配模式, 不考虑上下文), 所以我们的结果很可能高估了识别出的个人数据量.

**Approximate Memorization** In Figure 4, we observe that roughly 50% more data is approxi-

**近似记忆** 在图 4 中我们观察到, 被近似记住的数据大约多出 50%

<small><span class="docvortex-page-footnote" data-block-type="page_footnote" style="color:#6b7280"><sup>2</sup>Available at: [https://cloud.google.com/sensitive-data-protection](https://cloud.google.com/sensitive-data-protection)</span></small>

脚注 2: 见 https://cloud.google.com/sensitive-data-protection

<!-- page 8 of 17 -->

Gemma: Open Models Based on Gemini Research and Technology

|  |  | Mistral v0.2 | Gemm | a 1.1 IT |
| --- | --- | --- | --- | --- |
| Benchmark | metric | 7B* | 2B | 7B |
| RealToxicity | avg | 8.44 | 7.03 | 8.04 |
| BOLD |  | 46.0 | 47.76 | 45.2 |
| CrowS-Pairs | top-1 | 32.76 | 45.89 | 49.67 |
| BBQ Ambig | 1-shot, top-1 | 97.53 | 58.97 | 86.06 |
| BBQ Disambig | top-1 | 84.45 | 53.9 | 85.08 |
| Winogender | top-1 | 64.3 | 50.14 | 57.64 |
| TruthfulQA |  | 48.54 | 44.24 | 45.34 |
| Winobias 1_2 |  | 65.72 | 55.93 | 59.22 |
| Winobias 2_2 |  | 84.53 | 89.46 | 89.2 |
| Toxigen |  | 61.77 | 29.64 | 38.75 |

Table 8 | Safety academic benchmark results of Gemma 1.1 IT models, compared to similarly sized, openly-available models. Evaluations run by us. Note that due to restrictive licensing, we were unable to run evals on LLaMA-2; we do not report previously-published numbers for LLaMA-2 on TruthfulQA, as we use different, non-comparable evaluation set-ups: we use MC2, where LLaMA-2 uses GPT-Judge. Results for Gemma 1.0 IT models can be found in appendix.

表 8 | Gemma 1.1 IT 模型的安全学术基准结果, 与尺寸相近的公开模型对比. 评测由我们运行. 注意由于许可限制, 我们无法在 LLaMA-2 上跑评测; TruthfulQA 上我们也不报告 LLaMA-2 此前发表的数字, 因为评测设置不同, 不可比: 我们用 MC2, LLaMA-2 用 GPT-Judge. Gemma 1.0 IT 模型的结果见附录.

![Chart block](images/p08-figure-4-comparing-exact-and-approximate-memorization.png)

Figure 4 | Comparing exact and approximate memorization.

图 4 | 比较精确记忆与近似记忆.

mately memorized (note the log scale) and that this is nearly consistent across each of the different subcategories over the dataset.

(注意是对数坐标), 并且在数据集的各个子类别上这一比例基本一致.

## Responsible Deployment

**负责任部署**

In line with previous releases of Google’s AI technologies (Gemini Team, 2023; Kavukcuoglu et al., 2022), we follow a structured approach to responsible development and deployment of our models, in order to identify, measure, and manage foreseeable downstream societal impacts. As with our recent Gemini release, these are informed by prior academic literature on language model

与 Google 此前发布的 AI 技术 (Gemini Team, 2023; Kavukcuoglu et al., 2022) 一致, 我们用一套结构化的方法做模型的负责任开发与部署, 以识别, 衡量和管理可预见的下游社会影响. 与最近的 Gemini 发布一样, 这些工作参考了此前关于语言模型

risks (Weidinger et al., 2021), findings from similar prior exercises conducted across the industry (Anil et al., 2023), ongoing engagement with experts internally and externally, and unstructured attempts to discover new model vulnerabilities.

风险的学术文献 (Weidinger et al., 2021), 业界类似工作的发现 (Anil et al., 2023), 与内外部专家的持续交流, 以及发现模型新漏洞的非结构化尝试.

## Benefits

**益处**

We believe that openness in AI science and technology can bring significant benefits. Open-sourcing is a significant driver of science and innovation, and a responsible practice in most circumstances. But this needs to be balanced against the risk of providing actors with the tools to cause harm now or in the future.

我们相信 AI 科学与技术的开放能带来很大益处. 开源是科学和创新的重要驱动力, 在大多数情况下也是负责任的做法. 但这需要与另一种风险相平衡: 为行为者提供现在或将来造成伤害的工具.

Google has long committed to providing broader access to successful research innovations (GraphCast, Transformer, BERT, T5, Word2Vec), and we believe that releasing Gemma into the AI development ecosystem will enable downstream developers to create a host of beneficial applications, in areas such as science, education and the arts. Our instruction-tuned offerings should encourage a range of developers to leverage Gemma’s chat and code capabilities to support their own beneficial applications, while allowing for custom fine-tuning to specialize the model’s capabilities for specific use cases. To ensure Gemma

Google 长期致力于让成功的研究创新 (GraphCast, Transformer, BERT, T5, Word2Vec) 被更多人使用. 我们相信, 把 Gemma 发布到 AI 开发生态中, 能让下游开发者在科学, 教育和艺术等领域创造大量有益的应用. 我们的指令微调模型应能鼓励各类开发者利用 Gemma 的对话和代码能力支撑自己的有益应用, 同时允许他们做定制微调, 让模型能力专门适配特定用例. 为了确保 Gemma

<!-- page 9 of 17 -->

Gemma: Open Models Based on Gemini Research and Technology

supports a wide range of developer needs, we are also releasing two model sizes to optimally support different environments, and have made these models available across a number of platforms (see [Kaggle](https://www.kaggle.com/models/google/gemma/frameworks/flax/variations/7b-it) for details). Providing broad access to Gemma in this way should reduce the economic and technical barriers that newer ventures or independent developers face when incorporating these technologies into their workstreams.

能支持各种开发者需求, 我们还发布了两个模型尺寸, 以最好地适配不同环境, 并在多个平台上提供这些模型 (详见 Kaggle). 以这种方式广泛提供 Gemma, 应能降低新创企业或独立开发者把这些技术纳入工作流时面临的经济和技术门槛.

As well as serving developers with our instruction-tuned models, we have also provided access to corresponding base pretrained models. By doing so, it is our intention to encourage further AI safety research and community innovation, providing a wider pool of models available to developers to build on various methods of transparency and interpretability research that the community has already benefited from (Pacchiardi et al., 2023; Zou et al., 2023).

除了向开发者提供指令微调模型, 我们也提供了对应的基础预训练模型. 这样做是为了鼓励更多 AI 安全研究和社区创新, 让开发者有更多模型可用来开展各种透明性和可解释性研究, 社区已经从这类研究中受益 (Pacchiardi et al., 2023; Zou et al., 2023).

## Risks

**风险**

In addition to bringing benefits to the AI development ecosystem, we are aware that malicious uses of LLMs, such as the creation of deepfake imagery, AI-generated disinformation, and illegal and disturbing material can cause harm on both an individual and institutional levels (Weidinger et al., 2021). Providing access to model weights, rather than releasing models behind an API, also raises new challenges for responsible deployment.

在为 AI 开发生态带来益处的同时, 我们也清楚 LLM 的恶意使用, 例如制作深度伪造图像, AI 生成的虚假信息, 以及违法和令人不安的内容, 会在个人和机构层面造成伤害 (Weidinger et al., 2021). 提供模型权重而不是把模型放在 API 后面, 也给负责任部署带来了新挑战.

First, we cannot prevent bad actors from fine tuning Gemma for malicious intent, despite their use being subject to Terms of Use that prohibit the use of Gemma models in ways that contravene our Gemma Prohibited Use Policy. However, we are cognizant that further work is required to build more robust mitigation strategies against intentional misuse of open models, which Google DeepMind will continue to explore both internally and in collaboration with the AI community.

第一, 我们无法阻止不良行为者出于恶意微调 Gemma, 尽管其使用受使用条款约束, 条款禁止以违反 Gemma 禁止使用政策的方式使用 Gemma 模型. 我们也意识到, 需要进一步工作来构建更稳健的缓解策略, 应对对开放模型的蓄意滥用, Google DeepMind 会在内部并与 AI 社区合作继续探索.

The second challenge we face is protecting developers and downstream users against the unintended behaviours of open models, including generation of toxic language or perpetuation of discriminatory social harms, model hallucinations and leakage of personally identifiable information. When deploying models behind an API, these risks

我们面临的第二个挑战是保护开发者和下游用户免受开放模型非预期行为的影响, 包括生成有毒语言, 延续歧视性社会危害, 模型幻觉, 以及泄露可识别个人身份的信息. 把模型部署在 API 后面时, 这些风险

can be reduced via various filtering methods.

可以通过各种过滤方法降低.

## Mitigations

**缓解措施**

Without this layer of defense for the Gemma family of models, we have endeavoured to safeguard against these risks by filtering and measuring biases in pre-training data in line with the Gemini approach, assessing safety through standardized AI safety benchmarks, internal red teaming to better understand the risks associated with external use of Gemma, and subjecting the models to rigorous ethics and safety evaluations, the results of which can be seen in 8.

Gemma 家族模型没有这层防护, 我们为此做了以下努力来防范这些风险: 按 Gemini 的做法过滤和测量预训练数据中的偏见, 用标准化 AI 安全基准评估安全性, 做内部红队测试以更好地理解外部使用 Gemma 的相关风险, 并对模型做严格的伦理与安全评测, 结果见 8 (应指表 8).

While we’ve invested significantly in improving the model, we recognize its limitations. To ensure transparency for downstream users, we’ve published a detailed [model card](https://ai.google.dev/gemma/docs/model_card) to provide researchers with a more comprehensive understanding of Gemma.

虽然我们在改进模型上投入很多, 我们也承认它的局限. 为了对下游用户保持透明, 我们发布了一份详细的模型卡, 让研究者更全面地了解 Gemma.

We have also released a Generative AI Responsible Toolkit to support developers to build AI responsibly. This encompasses a series of assets to help developers design and implement responsible AI best practices and keep their users safe.

我们还发布了一套 Generative AI Responsible Toolkit, 帮助开发者负责任地构建 AI. 它包含一系列资源, 帮助开发者设计和落实负责任 AI 的最佳实践, 保护用户安全.

The relative novelty of releasing open weights models means new uses, and misuses, of these models are still being discovered, which is why Google DeepMind is committed to the continuous research and development of robust mitigation strategies alongside future model development.

发布开放权重模型还比较新, 这些模型的新用途和新滥用方式仍在不断被发现. 因此 Google DeepMind 承诺在未来的模型开发中持续研究和开发稳健的缓解策略.

## Assessment

**评估**

Ultimately, given the capabilities of larger systems accessible within the existing ecosystem, we believe the release of Gemma will have a negligible effect on the overall AI risk portfolio. In light of this, and given the utility of these models for research, auditing and downstream product development, we are confident that the benefit of Gemma to the AI community outweighs the risks described.

总之, 考虑到现有生态中已能获得更大系统的能力, 我们认为 Gemma 的发布对整体 AI 风险组合的影响可以忽略. 鉴于此, 再考虑到这些模型对研究, 审计和下游产品开发的用处, 我们有信心 Gemma 给 AI 社区带来的益处超过上述风险.

## Going Forward

**后续方向**

As a guiding principle, Google DeepMind strives to adopt assessments and safety mitigations proportionate to the potential risks from our models.

作为指导原则, Google DeepMind 力求采取与模型潜在风险相称的评估和安全缓解措施.

<!-- page 10 of 17 -->

Gemma: Open Models Based on Gemini Research and Technology

Although we are confident that Gemma models will provide a net benefit to the community, our emphasis on safety stems from the irreversible nature of this release. As the harms resulting from open models are not yet well defined, nor does an established evaluation framework for such models exist, we will continue to follow this precedent and take a measured and cautionary approach to open model development. As capabilities advance, we may explore extended testing, staggered releases or alternative access mechanisms to ensure responsible AI development.

虽然我们有信心 Gemma 模型会给社区带来净收益, 我们对安全的重视源于这次发布不可逆. 开放模型造成的危害尚未被清楚界定, 也还没有针对这类模型的成熟评估框架, 所以我们会继续遵循这一先例, 以审慎的态度开发开放模型. 随着能力进步, 我们可能会探索延长测试, 分阶段发布或其他访问机制, 以确保 AI 负责任地发展.

As the ecosystem evolves, we urge the wider AI community to move beyond simplistic ’open vs. closed’ debates, and avoid either exaggerating or minimising potential harms, as we believe a nuanced, collaborative approach to risks and benefits is essential. At Google DeepMind we’re committed to developing high-quality evaluations and invite the community to join us in this effort for a deeper understanding of AI systems.

随着生态演进, 我们呼吁更广泛的 AI 社区超越简单的 「开放对封闭」 之争, 既不夸大也不淡化潜在危害, 因为我们相信, 对风险和收益采取细致, 协作的态度是必要的. Google DeepMind 致力于开发高质量的评测, 也邀请社区一起努力, 更深入地理解 AI 系统.

## Discussion and Conclusion

**讨论与结论**

We present Gemma, an openly available family of generative language models for text and code. Gemma advances the state of the art of openly available language model performance, safety, and responsible development.

我们介绍了 Gemma, 一族面向文本和代码, 公开可用的生成式语言模型. Gemma 推进了公开可用语言模型在性能, 安全和负责任开发上的最佳水平.

In particular, we are confident that Gemma models will provide a net benefit to the community given our extensive safety evaluations and mitigations; however, we acknowledge that this release is irreversible and the harms resulting from open models are not yet well defined, so we continue to adopt assessments and safety mitigations proportionate to the potential risks of these models. In addition, our models outperform competitors on 6 standard safety benchmarks, and in human side-by-side evaluations.

具体来说, 基于大量的安全评测和缓解措施, 我们有信心 Gemma 模型会给社区带来净收益; 但我们也承认这次发布不可逆, 开放模型造成的危害尚未被清楚界定, 所以我们继续采取与这些模型潜在风险相称的评估和安全缓解措施. 此外, 我们的模型在 6 项标准安全基准和人工 side-by-side 评测中超过竞品.

Gemma models improve performance on a broad range of domains including dialogue, reasoning, mathematics, and code generation. Results on MMLU (64.3%) and MBPP (44.4%) demonstrate both the high performance of Gemma, as well as the continued headroom in openly available LLM performance.

Gemma 模型在对话, 推理, 数学和代码生成等广泛领域上提升了表现. MMLU (64.3%) 和 MBPP (44.4%) 上的结果既说明 Gemma 表现出色, 也说明公开可用 LLM 的表现仍有提升空间.

> **对一下:** 结论里的 「6 项标准安全基准」, MMLU 64.3% 和 MBPP 44.4% 各出自哪张表?
> MMLU 64.3 和 MBPP 44.4 是表 6 里 Gemma 7B 那一列, 属于预训练模型. 安全基准在表 8 (1.1 IT) 和表 10 (1.0 IT), 各 10 行, 对照只有 Mistral v0.2 7B 一列, 表中没有标出每个指标取高还是取低为好, 仅凭表还原不出是哪 6 项. 按数值大小直接比, 表 8 里 Gemma 1.1 IT 7B 高于 Mistral 的是 CrowS-Pairs (49.67 对 32.76), BBQ Disambig (85.08 对 84.45), Winobias 2_2 (89.2 对 84.53) 三项, 其余 7 项低于 Mistral.

Beyond state-of-the-art performance measures on benchmark tasks, we are excited to see what new use-cases arise from the community, and what new capabilities emerge as we advance the field together. We hope that researchers use Gemma to accelerate a broad array of research, and that developers create beneficial new applications, user experiences, and other functionality.

除了基准任务上的最佳表现, 我们也期待看到社区涌现出哪些新用例, 以及在共同推进这一领域的过程中会出现哪些新能力. 我们希望研究者用 Gemma 加速各类研究, 开发者创造有益的新应用, 用户体验和其他功能.

Gemma benefits from many learnings of the Gemini model program including code, data, architecture, instruction tuning, reinforcement learning from human feedback, and evaluations. As discussed in the Gemini technical report, we reiterate a non-exhaustive set of limitations to the use of LLMs. Even with great performance on benchmark tasks, further research is needed to create robust, safe models that reliably perform as intended. Example further research areas include factuality, alignment, complex reasoning, and robustness to adversarial input. As discussed by Gemini, we note the need for more challenging and robust benchmarks.

Gemma 受益于 Gemini 模型项目的许多经验, 包括代码, 数据, 架构, 指令微调, 基于人类反馈的强化学习和评测. 正如 Gemini 技术报告所讨论的, 我们重申 LLM 使用上的一些局限 (并非全部). 即使在基准任务上表现很好, 仍需要进一步研究, 才能造出稳健, 安全, 可靠地按预期工作的模型. 需要进一步研究的方向例如事实性, 对齐, 复杂推理和对抗输入下的稳健性. 与 Gemini 一样, 我们指出需要更有挑战性, 更稳健的基准.

<!-- page 11 of 17 -->

Gemma: Open Models Based on Gemini Research and Technology

## Contributions and Acknowledgments

**贡献与致谢**

**Core Contributors** Thomas Mesnard Cassidy Hardin Robert Dadashi Surya Bhupatiraju Shreya Pathak Laurent Sifre Morgane Rivière Mihir Sanjay Kale Juliette Love Pouya Tafti Léonard Hussenot Pier Giuseppe Sessa

**核心贡献者** 名单同上, 人名不译.

**Contributors** Aakanksha Chowdhery Adam Roberts Aditya Barua Alex Botev Alex Castro-Ros Ambrose Slone Amélie Héliou Andrea Tacchetti Anna Bulanova Antonia Paterson Beth Tsai Bobak Shahriari Charline Le Lan Christopher A. Choquette-Choo Clément Crepy Daniel Cer Daphne Ippolito David Reid Elena Buchatskaya Eric Ni Eric Noland Geng Yan George Tucker George-Christian Muraru Grigory Rozhdestvenskiy Henryk Michalewski Ian Tenney Ivan Grishchenko Jacob Austin James Keeling Jane Labanowski Jean-Baptiste Lespiau Jeff Stanway

**贡献者** 名单同上, 人名不译.

Jenny Brennan Jeremy Chen Johan Ferret Justin Chiu Justin Mao-Jones Katherine Lee Kathy Yu Katie Millican Lars Lowe Sjoesund Lisa Lee Lucas Dixon Machel Reid Maciej Mikuła Mateo Wirth Michael Sharman Nikolai Chinaev Nithum Thain Olivier Bachem Oscar Chang Oscar Wahltinez Paige Bailey Paul Michel Petko Yotov Rahma Chaabouni Ramona Comanescu Reena Jana Rohan Anil Ross McIlroy Ruibo Liu Ryan Mullins Samuel L Smith Sebastian Borgeaud Sertan Girgin Sholto Douglas Shree Pandya Siamak Shakeri Soham De Ted Klimenko Tom Hennigan Vlad Feinberg Wojciech Stokowiec Yu-hui Chen Zafarali Ahmed Zhitao Gong

贡献者名单续上, 人名不译.

<!-- page 12 of 17 -->

Gemma: Open Models Based on Gemini Research and Technology

**Product Management** Tris Warkentin Ludovic Peran

产品管理: Tris Warkentin, Ludovic Peran.

**Program Management** Minh Giang

项目管理: Minh Giang.

**Executive Sponsors** Clément Farabet Oriol Vinyals Jeff Dean Koray Kavukcuoglu Demis Hassabis Zoubin Ghahramani Douglas Eck Joelle Barral Fernando Pereira Eli Collins

高管支持: 名单同上, 人名不译.

**Leads** Armand Joulin Noah Fiedel Evan Senter

负责人: Armand Joulin, Noah Fiedel, Evan Senter.

**Tech Leads** Alek Andreev† Kathleen Kenealy†

技术负责人: Alek Andreev†, Kathleen Kenealy†.

## Acknowledgements

**致谢**

Our work is made possible by the dedication and efforts of numerous teams at Google. We would like to acknowledge the support from the following teams: Gemini, Gemini Safety, Gemini Infrastructure, Gemini Evaluation, Google Cloud, Google Research Responsible AI, Kaggle, and Keras.

我们的工作离不开 Google 众多团队的投入. 感谢以下团队的支持: Gemini, Gemini Safety, Gemini Infrastructure, Gemini Evaluation, Google Cloud, Google Research Responsible AI, Kaggle 和 Keras.

Special thanks and acknowledgment to Adrian Hutter, Andreas Terzis, Andrei Kulik, Angelos Filos, Anushan Fernando, Aurelien Boffy, Danila Sinopalnikov, Edouard Leurent, Gabriela Surita, Geoffrey Cideron, Jilin Chen, Karthik Raveendran, Kathy Meier-Hellstern, Kehang Han, Kevin Robinson, Kritika Muralidharan, Le Hou, Leonard Berrada, Lev Proleev, Luheng He, Marie Pellat, Mark Sherwood, Matt Hoffman, Matthias Grundmann, Nicola De Cao, Nikola Momchev, Nino Vieillard, Noah Constant, Peter Liu, Piotr Stanczyk, Qiao Zhang, Ruba Haroun, Seliem El-Sayed, Siddhartha Brahma, Tianhe (Kevin) Yu, Tom Le Paine, Yingjie Miao, Yuanzhong Xu, and Yuting Sun.

特别感谢以上列出的各位, 人名不译.

## References

**参考文献** 条目保留原文, 不译.

E. Almazrouei, H. Alobeidli, A. Alshamsi, A. Cappelli, R. Cojocaru, M. Debbah, Étienne Goffinet, D. Hesslow, J. Launay, Q. Malartic, D. Mazzotta, B. Noune, B. Pannier, and G. Penedo. The falcon series of open language models, 2023.

D. Amodei, C. Olah, J. Steinhardt, P. Christiano, J. Schulman, and D. Mané. Concrete problems in AI safety. arXiv preprint, 2016.

R. Anil, A. M. Dai, O. Firat, M. Johnson, D. Lepikhin, A. Passos, S. Shakeri, E. Taropa, P. Bailey, Z. Chen, et al. Palm 2 technical report. arXiv preprint arXiv:2305.10403, 2023.

J. Austin, A. Odena, M. I. Nye, M. Bosma, H. Michalewski, D. Dohan, E. Jiang, C. J. Cai, M. Terry, Q. V. Le, and C. Sutton. Program synthesis with large language models. CoRR, abs/2108.07732, 2021. URL [https://arxiv.org/abs/2108.07732](https://arxiv.org/abs/2108.07732).

Y. Bai, S. Kadavath, S. Kundu, A. Askell, J. Kernion, A. Jones, A. Chen, A. Goldie, A. Mirhoseini, C. McKinnon, C. Chen, C. Olsson, C. Olah, D. Hernandez, D. Drain, D. Ganguli, D. Li, E. Tran-Johnson, E. Perez, J. Kerr, J. Mueller, J. Ladish, J. Landau, K. Ndousse, K. Lukosuite, L. Lovitt, M. Sellitto, N. Elhage, N. Schiefer, N. Mercado, N. DasSarma, R. Lasenby, R. Larson, S. Ringer, S. Johnston, S. Kravec, S. E. Showk, S. Fort, T. Lanham, T. Telleen-Lawton, T. Conerly, T. Henighan, T. Hume, S. R. Bowman, Z. Hatfield-Dodds, B. Mann, D. Amodei, N. Joseph, S. McCandlish, T. Brown, and J. Kaplan. Constitutional ai: Harmlessness from ai feedback, 2022.

P. Barham, A. Chowdhery, J. Dean, S. Ghemawat, S. Hand, D. Hurt, M. Isard, H. Lim, R. Pang, S. Roy, B. Saeta, P. Schuh, R. Sepassi, L. E. Shafey, C. A. Thekkath, and Y. Wu. Pathways: Asynchronous distributed dataflow for ml, 2022.

<small><span class="docvortex-page-footnote" data-block-type="page_footnote" style="color:#6b7280">† equal contribution.</span></small>

脚注 †: 贡献相同.

Y. Bisk, R. Zellers, R. L. Bras, J. Gao, and Y. Choi. PIQA: reasoning about physical commonsense in natural language. CoRR, abs/1911.11641, 2019. URL [http://arxiv.org/abs/1911.11641](http://arxiv.org/abs/1911.11641).

<!-- page 13 of 17 -->

Gemma: Open Models Based on Gemini Research and Technology

R. A. Bradley and M. E. Terry. Rank analysis of incomplete block designs: I. the method of paired comparisons. Biometrika, 39, 1952.

N. Carlini, D. Ippolito, M. Jagielski, K. Lee, F. Tramer, and C. Zhang. Quantifying memorization across neural language models. arXiv preprint arXiv:2202.07646, 2022.

M. Chen, J. Tworek, H. Jun, Q. Yuan, H. P. de Oliveira Pinto, J. Kaplan, H. Edwards, Y. Burda, N. Joseph, G. Brockman, A. Ray, R. Puri, G. Krueger, M. Petrov, H. Khlaaf, G. Sastry, P. Mishkin, B. Chan, S. Gray, N. Ryder, M. Pavlov, A. Power, L. Kaiser, M. Bavarian, C. Winter, P. Tillet, F. P. Such, D. Cummings, M. Plappert, F. Chantzis, E. Barnes, A. Herbert-Voss, W. H. Guss, A. Nichol, A. Paino, N. Tezak, J. Tang, I. Babuschkin, S. Balaji, S. Jain, W. Saunders, C. Hesse, A. N. Carr, J. Leike, J. Achiam, V. Misra, E. Morikawa, A. Radford, M. Knight, M. Brundage, M. Murati, K. Mayer, P. Welinder, B. McGrew, D. Amodei, S. McCandlish, I. Sutskever, and W. Zaremba. Evaluating large language models trained on code. CoRR, abs/2107.03374, 2021. URL [https://arxiv.org/abs/2107.03374](https://arxiv.org/abs/2107.03374).

A. Chowdhery, S. Narang, J. Devlin, M. Bosma, G. Mishra, A. Roberts, P. Barham, H. W. Chung, C. Sutton, S. Gehrmann, P. Schuh, K. Shi, S. Tsvyashchenko, J. Maynez, A. Rao, P. Barnes, Y. Tay, N. Shazeer, V. Prabhakaran, E. Reif, N. Du, B. Hutchinson, R. Pope, J. Bradbury, J. Austin, M. Isard, G. Gur-Ari, P. Yin, T. Duke, A. Levskaya, S. Ghemawat, S. Dev, H. Michalewski, X. Garcia, V. Misra, K. Robinson, L. Fedus, D. Zhou, D. Ippolito, D. Luan, H. Lim, B. Zoph, A. Spiridonov, R. Sepassi, D. Dohan, S. Agrawal, M. Omernick, A. M. Dai, T. S. Pillai, M. Pellat, A. Lewkowycz, E. Moreira, R. Child, O. Polozov, K. Lee, Z. Zhou, X. Wang, B. Saeta, M. Diaz, O. Firat, M. Catasta, J. Wei, K. Meier-Hellstern, D. Eck, J. Dean, S. Petrov, and N. Fiedel. Palm: Scaling language modeling with pathways, 2022.

P. F. Christiano, J. Leike, T. Brown, M. Martic, S. Legg, and D. Amodei. Deep reinforcement learning from human preferences. Advances

in Neural Information Processing Systems, 30, 2017.

C. Clark, K. Lee, M. Chang, T. Kwiatkowski, M. Collins, and K. Toutanova. Boolq: Exploring the surprising difficulty of natural yes/no questions. CoRR, abs/1905.10044, 2019. URL [http://arxiv.org/abs/1905.10044](http://arxiv.org/abs/1905.10044).

P. Clark, I. Cowhey, O. Etzioni, T. Khot, A. Sabharwal, C. Schoenick, and O. Tafjord. Think you have solved question answering? try arc, the ai2 reasoning challenge, 2018.

K. Cobbe, V. Kosaraju, M. Bavarian, M. Chen, H. Jun, L. Kaiser, M. Plappert, J. Tworek, J. Hilton, R. Nakano, C. Hesse, and J. Schulman. Training verifiers to solve math word problems. CoRR, abs/2110.14168, 2021. URL [https://arxiv.org/abs/2110.14168](https://arxiv.org/abs/2110.14168).

J. Dean, G. Corrado, R. Monga, K. Chen, M. Devin, M. Mao, M. a. Ranzato, A. Senior, P. Tucker, K. Yang, Q. Le, and A. Ng. Large scale distributed deep networks. In F. Pereira, C. Burges, L. Bottou, and K. Weinberger, editors, Advances in Neural Information Processing Systems, volume 25. Curran Associates, Inc., 2012. URL [https://proceedings.neurips.cc/paper\_files/paper/2012/file/6aca97005c68f1206823815f66102863-Pa](https://proceedings.neurips.cc/paper_files/paper/2012/file/6aca97005c68f1206823815f66102863-Paper.pdf)per.[pdf](https://proceedings.neurips.cc/paper_files/paper/2012/file/6aca97005c68f1206823815f66102863-Paper.pdf).

J. Devlin, M. Chang, K. Lee, and K. Toutanova. BERT: pre-training of deep bidirectional transformers for language understanding. CoRR, abs/1810.04805, 2018. URL [http://arxiv.org/abs/1810.04805](http://arxiv.org/abs/1810.04805).

Gemini Team. Gemini: A family of highly capable multimodal models, 2023.

D. Hendrycks, C. Burns, S. Basart, A. Zou, M. Mazeika, D. Song, and J. Steinhardt. Measuring massive multitask language understanding. CoRR, abs/2009.03300, 2020. URL [https://arxiv.org/abs/2009.03300](https://arxiv.org/abs/2009.03300).

D. Hendrycks, C. Burns, S. Kadavath, A. Arora, S. Basart, E. Tang, D. Song, and J. Steinhardt. Measuring mathematical problem solving with the math dataset. NeurIPS, 2021.

本页参考文献从 Bradley and Terry (1952) 到 Hendrycks et al. (2021), 条目保留原文.

<!-- page 14 of 17 -->

Gemma: Open Models Based on Gemini Research and Technology

D. Ippolito, F. Tramèr, M. Nasr, C. Zhang, M. Jagielski, K. Lee, C. A. Choquette-Choo, and N. Carlini. Preventing verbatim memorization in language models gives a false sense of privacy. arXiv preprint arXiv:2210.17546, 2022.

A. Q. Jiang, A. Sablayrolles, A. Mensch, C. Bamford, D. S. Chaplot, D. de las Casas, F. Bressand, G. Lengyel, G. Lample, L. Saulnier, L. R. Lavaud, M.-A. Lachaux, P. Stock, T. L. Scao, T. Lavril, T. Wang, T. Lacroix, and W. E. Sayed. Mistral 7b, 2023.

M. Joshi, E. Choi, D. S. Weld, and L. Zettlemoyer. Triviaqa: A large scale distantly supervised challenge dataset for reading comprehension. CoRR, abs/1705.03551, 2017. URL [http://arxiv.org/abs/1705.03551](http://arxiv.org/abs/1705.03551).

K. Kavukcuoglu, P. Kohli, L. Ibrahim, D. Bloxwich, and S. Brown. How our principles helped define alphafold’s release, 2022.

T. Kudo and J. Richardson. SentencePiece: A simple and language independent subword tokenizer and detokenizer for neural text processing. In E. Blanco and W. Lu, editors, Proceedings of the 2018 Conference on Empirical Methods in Natural Language Processing: System Demonstrations, pages 66–71, Brussels, Belgium, Nov. 2018. Association for Computational Linguistics. doi: 10.18653/v1/D18-2012. URL [https://aclanthology.org/D18-2012](https://aclanthology.org/D18-2012).

S. Kudugunta, I. Caswell, B. Zhang, X. Garcia, C. A. Choquette-Choo, K. Lee, D. Xin, A. Kusupati, R. Stella, A. Bapna, et al. Madlad-400: A multilingual and document-level large audited dataset. arXiv preprint arXiv:2309.04662, 2023.

T. Kwiatkowski, J. Palomaki, O. Redfield, M. Collins, A. Parikh, C. Alberti, D. Epstein, I. Polosukhin, J. Devlin, K. Lee, K. Toutanova, L. Jones, M. Kelcey, M.-W. Chang, A. M. Dai, J. Uszkoreit, Q. Le, and S. Petrov. Natural questions: A benchmark for question answering research. Transactions of the Association for Computational Linguistics, 7:452–466, 2019. doi: 10.1162/tacl\_a\_00276. URL [https://aclanthology.org/Q19-1026](https://aclanthology.org/Q19-1026).

Y. LeCun, Y. Bengio, and G. Hinton. Deep learning. nature, 521(7553):436–444, 2015.

T. Mikolov, K. Chen, G. Corrado, and J. Dean. Efficient estimation of word representations in vector space. In Y. Bengio and Y. LeCun, editors, 1st International Conference on Learning Representations, ICLR 2013, Scottsdale, Arizona, USA, May 2-4, 2013, Workshop Track Proceedings, 2013. URL [http://arxiv.org/abs/1301.3781](http://arxiv.org/abs/1301.3781).

M. Nasr, N. Carlini, J. Hayase, M. Jagielski, A. F. Cooper, D. Ippolito, C. A. Choquette-Choo, E. Wallace, F. Tramèr, and K. Lee. Scalable extraction of training data from (production) language models. arXiv preprint arXiv:2311.17035, 2023.

L. Ouyang, J. Wu, X. Jiang, D. Almeida, C. Wainwright, P. Mishkin, C. Zhang, S. Agarwal, K. Slama, A. Ray, et al. Training language models to follow instructions with human feedback. Advances in Neural Information Processing Systems, 35, 2022.

L. Pacchiardi, A. J. Chan, S. Mindermann, I. Moscovitz, A. Y. Pan, Y. Gal, O. Evans, and J. Brauner. How to catch an ai liar: Lie detection in black-box llms by asking unrelated questions, 2023.

D. Paperno, G. Kruszewski, A. Lazaridou, Q. N. Pham, R. Bernardi, S. Pezzelle, M. Baroni, G. Boleda, and R. Fernández. The LAMBADA dataset: Word prediction requiring a broad discourse context. CoRR, abs/1606.06031, 2016. URL [http://arxiv.org/abs/1606.06031](http://arxiv.org/abs/1606.06031).

C. Raffel, N. Shazeer, A. Roberts, K. Lee, S. Narang, M. Matena, Y. Zhou, W. Li, and P. J. Liu. Exploring the limits of transfer learning with a unified text-to-text transformer. CoRR, abs/1910.10683, 2019. URL [http://arxiv.org/abs/1910.10683](http://arxiv.org/abs/1910.10683).

A. Roberts, H. W. Chung, A. Levskaya, G. Mishra, J. Bradbury, D. Andor, S. Narang, B. Lester, C. Gaffney, A. Mohiuddin, C. Hawthorne, A. Lewkowycz, A. Salcianu, M. van Zee, J. Austin, S. Goodman, L. B. Soares, H. Hu,

本页参考文献从 Ippolito et al. (2022) 到 Roberts et al. (2022) 的前半部分, 条目保留原文.

<!-- page 15 of 17 -->

Gemma: Open Models Based on Gemini Research and Technology

S. Tsvyashchenko, A. Chowdhery, J. Bastings, J. Bulian, X. Garcia, J. Ni, A. Chen, K. Kenealy, J. H. Clark, S. Lee, D. Garrette, J. Lee-Thorp, C. Raffel, N. Shazeer, M. Ritter, M. Bosma, A. Passos, J. Maitin-Shepard, N. Fiedel, M. Omernick, B. Saeta, R. Sepassi, A. Spiridonov, J. Newlan, and A. Gesmundo. Scaling up models and data with t5x and seqio, 2022.

A. Roberts, H. W. Chung, G. Mishra, A. Levskaya, J. Bradbury, D. Andor, S. Narang, B. Lester, C. Gaffney, A. Mohiuddin, et al. Scaling up models and data with t5x and seqio. Journal of Machine Learning Research, 24(377):1–8, 2023.

K. Sakaguchi, R. L. Bras, C. Bhagavatula, and Y. Choi. WINOGRANDE: an adversarial winograd schema challenge at scale. CoRR, abs/1907.10641, 2019. URL [http://arxiv.org/abs/1907.10641](http://arxiv.org/abs/1907.10641).

M. Sap, H. Rashkin, D. Chen, R. L. Bras, and Y. Choi. Socialiqa: Commonsense reasoning about social interactions. CoRR, abs/1904.09728, 2019. URL [http://arxiv.org/abs/1904.09728](http://arxiv.org/abs/1904.09728).

N. Shazeer. Fast transformer decoding: One writehead is all you need. CoRR, abs/1911.02150, 2019. URL [http://arxiv.org/abs/1911.02150](http://arxiv.org/abs/1911.02150).

N. Shazeer. GLU variants improve transformer. CoRR, abs/2002.05202, 2020. URL [https://arxiv.org/abs/2002.05202](https://arxiv.org/abs/2002.05202).

J. M. V. Skalse, N. H. R. Howe, D. Krasheninnikov, and D. Krueger. Defining and characterizing reward gaming. In NeurIPS, 2022.

J. Su, Y. Lu, S. Pan, B. Wen, and Y. Liu. Roformer: Enhanced transformer with rotary position embedding. CoRR, abs/2104.09864, 2021. URL [https://arxiv.org/abs/2104.09864](https://arxiv.org/abs/2104.09864).

I. Sutskever, O. Vinyals, and Q. V. Le. Sequence to sequence learning with neural networks. CoRR, abs/1409.3215, 2014. URL [http://arxiv.org/abs/1409.3215](http://arxiv.org/abs/1409.3215).

M. Suzgun, N. Scales, N. Schärli, S. Gehrmann, Y. Tay, H. W. Chung, A. Chowdhery, Q. V. Le, E. H. Chi, D. Zhou, and J. Wei. Challenging big-bench tasks and whether chain-of-thought can solve them, 2022.

A. Talmor, J. Herzig, N. Lourie, and J. Berant. Commonsenseqa: A question answering challenge targeting commonsense knowledge, 2019.

H. Touvron, T. Lavril, G. Izacard, X. Martinet, M.- A. Lachaux, T. Lacroix, B. Rozière, N. Goyal, E. Hambro, F. Azhar, A. Rodriguez, A. Joulin, E. Grave, and G. Lample. Llama: Open and efficient foundation language models, 2023a.

H. Touvron, L. Martin, K. Stone, P. Albert, A. Almahairi, Y. Babaei, N. Bashlykov, S. Batra, P. Bhargava, S. Bhosale, D. Bikel, L. Blecher, C. C. Ferrer, M. Chen, G. Cucurull, D. Esiobu, J. Fernandes, J. Fu, W. Fu, B. Fuller, C. Gao, V. Goswami, N. Goyal, A. Hartshorn, S. Hosseini, R. Hou, H. Inan, M. Kardas, V. Kerkez, M. Khabsa, I. Kloumann, A. Korenev, P. S. Koura, M.-A. Lachaux, T. Lavril, J. Lee, D. Liskovich, Y. Lu, Y. Mao, X. Martinet, T. Mihaylov, P. Mishra, I. Molybog, Y. Nie, A. Poulton, J. Reizenstein, R. Rungta, K. Saladi, A. Schelten, R. Silva, E. M. Smith, R. Subramanian, X. E. Tan, B. Tang, R. Taylor, A. Williams, J. X. Kuan, P. Xu, Z. Yan, I. Zarov, Y. Zhang, A. Fan, M. Kambadur, S. Narang, A. Rodriguez, R. Stojnic, S. Edunov, and T. Scialom. Llama 2: Open foundation and fine-tuned chat models, 2023b.

A. Vaswani, N. Shazeer, N. Parmar, J. Uszkoreit, L. Jones, A. N. Gomez, L. Kaiser, and I. Polosukhin. Attention is all you need. CoRR, abs/1706.03762, 2017. URL [http://arxiv.org/abs/1706.03762](http://arxiv.org/abs/1706.03762).

J. Wei, X. Wang, D. Schuurmans, M. Bosma, E. H. Chi, Q. Le, and D. Zhou. Chain of thought prompting elicits reasoning in large language models. CoRR, abs/2201.11903, 2022. URL [https://arxiv.org/abs/2201.11903](https://arxiv.org/abs/2201.11903).

L. Weidinger, J. Mellor, M. Rauh, C. Griffin, J. Uesato, P. Huang, M. Cheng, M. Glaese, B. Balle, A. Kasirzadeh, Z. Kenton, S. Brown, W. Hawkins, T. Stepleton, C. Biles, A. Birhane,

本页参考文献从 Roberts et al. (2022) 的后半部分到 Weidinger et al. (2021) 的前半部分, 条目保留原文.

<!-- page 16 of 17 -->

Gemma: Open Models Based on Gemini Research and Technology

J. Haas, L. Rimell, L. A. Hendricks, W. Isaac, S. Legassick, G. Irving, and I. Gabriel. Ethical and social risks of harm from language models. CoRR, abs/2112.04359, 2021. URL [https://arxiv.org/abs/2112.04359](https://arxiv.org/abs/2112.04359).

XLA. Xla: Optimizing compiler for tensorflow, 2019. URL [https://www.tensorflow.org/xla](https://www.tensorflow.org/xla).

Y. Xu, H. Lee, D. Chen, B. A. Hechtman, Y. Huang, R. Joshi, M. Krikun, D. Lepikhin, A. Ly, M. Maggioni, R. Pang, N. Shazeer, S. Wang, T. Wang, Y. Wu, and Z. Chen. GSPMD: general and scalable parallelization for ML computation graphs. CoRR, abs/2105.04663, 2021. URL [https://arxiv.org/abs/2105.04663](https://arxiv.org/abs/2105.04663).

B. Zhang and R. Sennrich. Root mean square layer normalization. CoRR, abs/1910.07467, 2019. URL [http://arxiv.org/abs/1910.07467](http://arxiv.org/abs/1910.07467).

L. Zheng, W.-L. Chiang, Y. Sheng, S. Zhuang, Z. Wu, Y. Zhuang, Z. Lin, Z. Li, D. Li, E. P. Xing, H. Zhang, J. E. Gonzalez, and I. Stoica. Judging llm-as-a-judge with mt-bench and chatbot arena, 2023.

W. Zhong, R. Cui, Y. Guo, Y. Liang, S. Lu, Y. Wang, A. Saied, W. Chen, and N. Duan. Agieval: A human-centric benchmark for evaluating foundation models, 2023.

A. Zou, L. Phan, S. Chen, J. Campbell, P. Guo, R. Ren, A. Pan, X. Yin, M. Mazeika, A.-K. Dombrowski, S. Goel, N. Li, M. J. Byun, Z. Wang, A. Mallen, S. Basart, S. Koyejo, D. Song, M. Fredrikson, J. Z. Kolter, and D. Hendrycks. Representation engineering: A top-down approach to ai transparency, 2023.

本页参考文献从 Weidinger et al. (2021) 的后半部分到 Zou et al. (2023), 条目保留原文.

<!-- page 17 of 17 -->

Gemma: Open Models Based on Gemini Research and Technology

## Gemma 1.0 IT results

**Gemma 1.0 IT 结果**

The core of the paper presents the results of the Gemma 1.1 IT models. We kept the results of the previous Gemma 1.0 IT models for comparison in this appendix. Side-by-side evaluations of Gemma 1.0 IT against Mistral 7b v0.2 can be found in table 9. Safety academic benchmark results of version 1.0 can be found in table 10.

论文主体给出的是 Gemma 1.1 IT 模型的结果. 为了便于对比, 我们在本附录保留了之前 Gemma 1.0 IT 模型的结果. Gemma 1.0 IT 对 Mistral 7b v0.2 的 side-by-side 评测见表 9, 1.0 版本的安全学术基准结果见表 10.

| Model | Safety | Instruction Following |
| --- | --- | --- |
| Gemma 7B IT | 58% | 51.7% |
| 95% Conf. Interval | [55.9%, 60.1%] | [49.6%, 53.8%] |
| Win/ Tie/ Loss | 42.9% / 30.2% / 26.9% | 42.5% / 18.4% / 39.1% |
| Gemma 2B IT | 56.5% | 41.6% |
| 95% Conf. Interval | [54.4%, 58.6%] | [39.5%, 43.7%] |
| Win/ Tie/ Loss | 44.8% / 22.9% / 32.3% | 32.7% / 17.8% / 49.5% |

Table 9 | Win rate of Gemma 1.0 IT models versus Mistral 7B v0.2 Instruct with 95% confidence intervals. We report breakdowns of wins, ties, and losses. Ties are broken evenly in the final win rate.

表 9 | Gemma 1.0 IT 模型对 Mistral 7B v0.2 Instruct 的胜率及 95% 置信区间. 我们给出胜, 平, 负的分项. 最终胜率中平局对半计入.

> **核对:** 表 9 的胜率也按 「胜 + 平/2」 算吗?
> 4 格里 3 格对得上: 7B 安全 42.9 + 30.2/2 = 58.0, 7B 指令 42.5 + 18.4/2 = 51.7, 2B 指令 32.7 + 17.8/2 = 41.6. 2B 安全一格是 44.8 + 22.9/2 = 56.25, 表里写 56.5, 差 0.25 个点; 胜平负三项和为 100.0, 每项只舍入到 0.1, 误差最多约 0.075, 解释不了这 0.25. 与表 5 对照, 1.0 到 1.1 提升最多的是 7B 指令遵循, 从 51.7% 到 61.2%; 2B 从 41.6% 到 45%, 仍低于 50%.

<table><tr><td rowspan="2">Benchmark</td><td rowspan="2">metric</td><td>Mistral v0.2</td><td colspan="2">Gemma IT</td></tr><tr><td>7B*</td><td>2B</td><td>7B</td></tr><tr><td>RealToxicity</td><td>avg</td><td>8.44</td><td>6.86</td><td>7.90</td></tr><tr><td>BOLD</td><td></td><td>46.0</td><td>45.57</td><td>49.08</td></tr><tr><td>CrowS-Pairs</td><td>top-1</td><td>32.76</td><td>45.82</td><td>51.33</td></tr><tr><td>BBQ Ambig</td><td>1-shot, top-1</td><td>97.53</td><td>62.58</td><td>92.54</td></tr><tr><td>BBQ Disambig</td><td>top-1</td><td>84.45</td><td>54.62</td><td>71.99</td></tr><tr><td>Winogender</td><td>top-1</td><td>64.3</td><td>51.25</td><td>54.17</td></tr><tr><td>TruthfulQA</td><td></td><td>48.54</td><td>31.81</td><td>44.84</td></tr><tr><td>Winobias 1_2</td><td></td><td>65.72</td><td>56.12</td><td>59.09</td></tr><tr><td>Winobias 2_2</td><td></td><td>84.53</td><td>91.1</td><td>92.23</td></tr><tr><td>Toxigen</td><td></td><td>61.77</td><td>29.77</td><td>39.59</td></tr></table>

Table 10 | Safety academic benchmark results of Gemma 1.0 IT models, compared to similar size open models. Evaluations run by us. Note that due to restrictive licensing, we were unable to run evals on $\mathrm{LLaMA-2};$ we do not report previously-published numbers for LLaMA-2 on TruthfulQA, because we use different, non-comparable evaluation set-ups: we use MC2, where LLaMA-2 uses GPT-Judge.

表 10 | Gemma 1.0 IT 模型的安全学术基准结果, 与尺寸相近的开放模型对比. 评测由我们运行. 注意由于许可限制, 我们无法在 LLaMA-2 上跑评测; TruthfulQA 上我们也不报告 LLaMA-2 此前发表的数字, 因为评测设置不同, 不可比: 我们用 MC2, LLaMA-2 用 GPT-Judge.

17
