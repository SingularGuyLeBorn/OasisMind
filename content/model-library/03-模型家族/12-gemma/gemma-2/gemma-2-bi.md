<!-- page 1 of 21 -->

arXiv:2408.00118v3 [cs.CL] 2 Oct 2024

Google DeepMind

2024-06-27

# Gemma 2: Improving Open Language Models at a Practical Size

Gemma 2: 在实用尺寸上改进开放语言模型

**Gemma Team, Google DeepMind**<sup>1</sup>

**In this work, we introduce Gemma 2, a new addition to the Gemma family of lightweight, state-of-the-art open models, ranging in scale from 2 billion to 27 billion parameters. In this new version, we apply several known technical modifications to the Transformer architecture, such as interleaving local-global attentions (Beltagy et al., 2020a) and group-query attention (Ainslie et al., 2023). We also train the 2B and 9B models with knowledge distillation (Hinton et al., 2015) instead of next token prediction. The resulting models deliver the best performance for their size, and even offer competitive alternatives to models that are 2-3**× **bigger. We release all our models to the community.**

本文介绍 Gemma 2, 它是 Gemma 家族的新成员. Gemma 是一族轻量, 达到当时最佳水平的开放模型, 这一代的规模从 20 亿到 270 亿参数. 在新版本里, 我们对 Transformer 架构用了几项已知的技术改动, 例如 local 与 global attention 交替 (Beltagy et al., 2020a) 和 group-query attention (Ainslie et al., 2023). 我们还用知识蒸馏 (Hinton et al., 2015) 训练 2B 和 9B 模型, 替代下一个 token 预测. 得到的模型在同尺寸里表现最好, 甚至能和比自己大 2-3 倍的模型竞争. 我们向社区发布全部模型.

> **想:** 摘要只说 2B 和 9B 用知识蒸馏训练, 27B 到底用没用蒸馏?
> 预训练阶段没用. 第 1 页 Introduction 末段说 27B 是 「trained from scratch for this work」, 第 6 页评估 27B 的小节又说它 「trained without distillation on 13T tokens」. 所以不能把摘要里蒸馏的功劳算到 27B 头上. 后训练另说: 第 4 页 SFT 段写了从教师蒸馏, 没按尺寸分开, 见那里的回看.

> **问:** 摘要说能和 「2-3× bigger」 的模型竞争, 这个倍数的分母是哪个模型?
> 全文唯一写出倍数的对比在第 6 页: 27B 对 LLaMA-3 70B, 正文说 「a model 2.5× larger」, 表 12 标题说 「2.5× smaller」. 按表 2 的总参数 27.23B 算, 70/27.23 约 2.57. 第 1 页 Introduction 的说法更弱, 是 「more than twice their size」, 引的是 Llama 3, Falcon, Mistral, Grok-1. 9B 和 2B 在表 13 里的对手是 Mistral 7B 和 LLaMA-3 8B, 不比它们大 2 倍; 2B 对约 2.7 倍大的 Mistral 7B 是 50.0 对 61.0, 谈不上竞争. Chatbot Arena 里 2.6B 胜过的 GPT-3.5-Turbo-0613 没有公开参数量. 所以 2-3 倍在本文能落地的分母只有 LLaMA-3 70B, 分子是没用蒸馏的 27B, 而且表 12 里 27B 对它 5 行输了 4 行.

## 1. Introduction

Large language models (LLMs) have demonstrated strong capabilities in language understanding, generation, and reasoning (Brown et al., 2020; Radford et al., 2019; Raffel et al., 2019). Scaling has been key to this recent progress, with many new capabilities only emerging at scale (Brown et al., 2020). The newest large models not only reach unprecedented performance on reasoning benchmarks (Achiam et al., 2023), but they also demonstrate multimodal and multilingual capabilities (Gemini Team, 2024) and even the ability to use context lengths of over 1M tokens (Gemini Team, 2024).

大语言模型 (LLM) 在语言理解, 生成和推理上展现了很强的能力 (Brown et al., 2020; Radford et al., 2019; Raffel et al., 2019). 把模型做大是近期进展的关键, 许多新能力只在大规模下才出现 (Brown et al., 2020). 最新的大模型不仅在推理基准上达到前所未有的表现 (Achiam et al., 2023), 还展示出多模态和多语言能力 (Gemini Team, 2024), 甚至能使用超过 1M token 的上下文长度 (Gemini Team, 2024).

Small-scale models have also shown a rapid increase in performance, but these gains are largely derived from increasing the length of training (Gemma Team, 2024; Jiang et al., 2023; Touvron et al., 2023). This approach only scales logarithmically with dataset size (Hoffmann et al., 2022), and the latest small models require up to 15T tokens to improve the state of the art by less than 1-2% (AI@Meta, 2024).

小模型的性能也在快速提升, 但这些提升主要来自拉长训练 (Gemma Team, 2024; Jiang et al., 2023; Touvron et al., 2023). 这种做法的收益随数据集大小只按对数增长 (Hoffmann et al., 2022), 最新的小模型要用多达 15T token, 才能把最佳水平推高不到 1-2% (AI@Meta, 2024).

Yet, these continued improvements provide evidence that small models are still under-trained. In this work, we explore alternatives to improve small model performance without solely increasing training length. One solution is to improve the quality of information received by the network at each training step by replacing the next token prediction task with a richer objective.

不过这些持续的提升也说明小模型仍然训练不足. 本文探索不单靠拉长训练来提升小模型性能的其他途径. 一个办法是提高网络在每个训练步收到的信息质量: 用更丰富的目标替代下一个 token 预测任务.

In particular, we focus our efforts on knowledge

distillation (Hinton et al., 2015), which replaces the one-hot vector seen at each token with the distribution of potential next tokens computed from a large model. This approach is often used to reduce the training time of smaller models by giving them richer gradients. In this work, we instead train for large quantities of tokens with distillation in order to simulate training beyond the number of available tokens. Concretely, we use a large language model as a teacher to train small models, namely 2B and 9B models, on a quantity of tokens that is more than 50× the compute-optimal quantity predicted by the theory (Hoffmann et al., 2022). Along with the models trained with distillation, we also release a 27B model trained from scratch for this work.

具体来说, 我们把精力放在知识蒸馏 (Hinton et al., 2015) 上. 它把每个 token 处看到的 one-hot 向量换成由一个大模型算出的下一个 token 候选分布. 这种做法常被用来缩短小模型的训练时间, 因为它给出更丰富的梯度. 本文反过来, 用蒸馏在大量 token 上训练, 以模拟超出可用 token 数量的训练. 具体地, 我们用一个大语言模型当教师, 训练 2B 和 9B 两个小模型, 训练 token 量超过理论 (Hoffmann et al., 2022) 预测的计算最优量的 50 倍. 除了用蒸馏训练的模型, 我们还发布了一个为本工作从头训练的 27B 模型.

> **核对:** 这里说 2B 和 9B 的训练 token 超过计算最优量的 50 倍, 用本文自己的数能算出来吗?
> 算不出来. 第 5 页表 6 旁写 「500B is 10× more than the compute-optimal number of tokens for a 2B model」, 由此 2B 的计算最优量约 50B, 而第 3 页 2B 用 2T token, 2T/50B = 40 倍. 本文没给它用的计算最优公式. 我另按每参数 20 token 的常用近似和表 2 的非嵌入参数估: 2B 约 49 倍, 9B (8T token) 约 48 倍; 按总参数算更低, 2B 约 38 倍, 9B 约 43 倍. 这是我的估算, 不是原文数字. 能说的是量级在 40-50 倍上下.

We also leverage several known modifications of Transformers, namely the interleaving of global and local attention layers from Beltagy et al. (2020a), and the Grouped-Query Attention (GQA) mechanism of Ainslie et al. (2023).

我们还用了几项已知的 Transformer 改动, 即 Beltagy et al. (2020a) 的 global 与 local attention 层交替, 以及 Ainslie et al. (2023) 的 Grouped-Query Attention (GQA) 机制.

Overall, Gemma 2 significantly advances stateof-the-art performance relative to comparablescale open models and are even competitive with some models more than twice their size (AI@Meta, 2024; Almazrouei et al., 2023; Jiang et al., 2023; xAI, 2024), across a variety of automated benchmarks and human evaluations. Example domains include question answering (Clark et al., 2019; Kwiatkowski et al., 2019), commonsense reasoning (Sakaguchi et al., 2019; Suzgun et al., 2022), mathematics and science (Cobbe et al., 2021; Hendrycks et al., 2020), and coding (Austin et al., 2021; Chen et al., 2021).

总体而言, 在多种自动基准和人工评估上, Gemma 2 相对同规模开放模型明显推进了最佳水平, 甚至能和一些大一倍以上的模型竞争 (AI@Meta, 2024; Almazrouei et al., 2023; Jiang et al., 2023; xAI, 2024). 涉及的领域包括问答 (Clark et al., 2019; Kwiatkowski et al., 2019), 常识推理 (Sakaguchi et al., 2019; Suzgun et al., 2022), 数学与科学 (Cobbe et al., 2021; Hendrycks et al., 2020) 以及代码 (Austin et al., 2021; Chen et al., 2021).

<small><span class="docvortex-page-footnote" data-block-type="page_footnote" style="color:#6b7280"><sup>1</sup>See Contributions and Acknowledgments section for full author list. Please send correspondence to gemma-2-report@google.com. © 2024 Google DeepMind. All rights reserved</span></small>

脚注 1: 完整作者名单见贡献与致谢一节. 来信请寄 gemma-2-report@google.com. © 2024 Google DeepMind. 保留所有权利.

<!-- page 2 of 21 -->

Gemma 2: Improving Open Language Models at a Practical Size

| Parameters | 2B | 9B | 27B |
| --- | --- | --- | --- |
| d_model | 2304 | 3584 | 4608 |
| Layers | 26 | 42 | 46 |
| Pre-norm | yes | yes | yes |
| Post-norm | yes | yes | yes |
| Non-linearity | GeGLU | GeGLU | GeGLU |
| Feedforward dim | 18432 | 28672 | 73728 |
| Head type | GQA | GQA | GQA |
| Num heads | 8 | 16 | 32 |
| Num KV heads | 4 | 8 | 16 |
| Head size | 256 | 256 | 128 |
| Global att. span | 8192 | 8192 | 8192 |
| Sliding window | 4096 | 4096 | 4096 |
| Vocab size | 256128 | 256128 | 256128 |
| Tied embedding | yes | yes | yes |

Table 1 | Overview of the main model parameters and design choices. See the section on model architectures for more details.

表 1 | 主要模型参数与设计选择概览. 详见模型架构一节.

> **拆开:** 表 1 里 Num heads × Head size 和 d_model 对得上吗?
> 对不上. 2B 是 8×256 = 2048, d_model 2304; 9B 是 16×256 = 4096, d_model 3584; 27B 是 32×128 = 4096, d_model 4608. 9B 的 attention 内部宽度比 d_model 大, 另外两个比 d_model 小, 27B 还把 head size 从 256 降到 128. Feedforward dim 分别是 d_model 的 8, 8, 16 倍. 本文只给了表, 第 2 页正文没有解释这些选择.

While thorough testing of our models has been conducted, these tests cannot cover all applications and scenarios in which Gemma 2 may be used. With this in mind, all Gemma 2 users should conduct rigorous safety testing specific to their use case before deployment or use.

我们对模型做了充分测试, 但测试无法覆盖所有应用和场景. 所有 Gemma 2 用户在部署或使用前应针对自身用例做安全测试.

In this technical report, we provide an overview of models, including the architecture, training, and pre- and post-training recipes for Gemma 2. We also provide detailed evaluations across a wide variety of quantitative and qualitative benchmarks, as well as both standard academic benchmarks and human-preference evaluations. Finally, we discuss our approach to safe and responsible deployment and outline the broader implications of Gemma 2, its limitations, and advantages.

本技术报告概述模型, 包括 Gemma 2 的架构, 训练以及预训练和后训练方案. 我们还在大量定量与定性基准上给出详细评估, 既有标准学术基准, 也有人类偏好评估. 最后讨论安全负责的部署做法, 以及 Gemma 2 更广泛的影响, 局限和优点.

## 2. Model Architecture

**2. 模型架构**

Similar to previous Gemma models (Gemma Team, 2024), the Gemma 2 models are based on a decoder-only transformer architecture (Vaswani et al., 2017). We summarize the main parameters and architecture choices in Table 1.

和之前的 Gemma 模型 (Gemma Team, 2024) 一样, Gemma 2 模型基于 decoder-only transformer 架构 (Vaswani et al., 2017). 主要参数和架构选择汇总在表 1.

A few architectural elements are similar to the first version of Gemma models; namely, a context

| Model | Embedding Parameters | Non-embedding Parameters |
| --- | --- | --- |
| 2B | 590,118,912 | 2,024,517,888 |
| 9B | 917,962,752 | 8,324,201,984 |
| 27B | 1,180,237,824 | 26,047,480,320 |

Table 2 | Parameter counts for the Gemma models. We inherit from the large Gemini vocabulary (256k entries), that is designed to work on a large number of languages, hence, the larger embedding parameter counts compared to models that are limited to one or a few languages.

表 2 | Gemma 模型的参数量. 我们沿用 Gemini 的大词表 (256k 条目), 它为大量语言设计, 因此嵌入参数量比只面向一种或少数几种语言的模型大.

> **确认:** Tied embedding 在表 2 的参数量里是只算一次吗?
> 是. 三个模型的 Embedding Parameters 恰好等于 d_model × 256128: 2304×256128 = 590,118,912, 3584×256128 = 917,962,752, 4608×256128 = 1,180,237,824, 与表 2 逐位相同. 加上非嵌入参数, 总量是 2.61B, 9.24B, 27.23B. 第 6 页说评估按总参数计, 所以第 6 页 Arena 段和第 11 页表 18 把 2B 写成 2.6B.

length of 8192 tokens, the use of Rotary Position Embeddings (RoPE) (Su et al., 2021), and the approximated GeGLU non-linearity (Shazeer, 2020). A few elements differ between Gemma 1 and Gemma 2, including using deeper networks. We summarize the key differences below.

有几处架构元素与第一版 Gemma 相同: 上下文长度 8192 token, 使用 Rotary Position Embeddings (RoPE) (Su et al., 2021), 以及近似 GeGLU 非线性 (Shazeer, 2020). Gemma 1 和 Gemma 2 也有几处不同, 包括用了更深的网络. 关键差异汇总如下.

**Local Sliding Window and Global Attention**. We alternate between a local sliding window attention (Beltagy et al., 2020a,b) and global attention (Luong et al., 2015) in every other layer. The sliding window size of local attention layers is set to 4096 tokens, while the span of the global attention layers is set to 8192 tokens.

**Local Sliding Window 与 Global Attention.** 我们每隔一层在 local sliding window attention (Beltagy et al., 2020a,b) 和 global attention (Luong et al., 2015) 之间交替. local attention 层的滑动窗口大小设为 4096 token, global attention 层的跨度设为 8192 token.

> **问:** local 和 global 层具体怎么交替? 各占多少层?
> 第 2 页只写了 「in every other layer」, 也就是一层 local sliding window, 一层 global, 轮流排. 表 1 的层数 26, 42, 46 都是偶数, 按一半一半算, 2B 各 13 层, 9B 各 21 层, 27B 各 23 层; 这是按 「every other layer」 推的, 原文没列层号, 也没说第一层是 local 还是 global. local 窗口 4096, global 跨度 8192, 与同页的上下文长度 8192 相同, 所以 global 层在训练长度内看得到全部上下文. 第 5 页表 10 改的只是 local 层的窗口.

**Logit soft-capping**. We cap logits (Bello et al., 2016) in each attention layer and the final layer such that the value of the logits stays between −soft\_cap and +soft\_cap. More specifically, we cap the logits with the following function:

**Logit soft-capping.** 我们在每个 attention 层和最后一层对 logits 做上限截断 (Bello et al., 2016), 让 logits 的值落在 -soft_cap 到 +soft_cap 之间. 具体用下面的函数:

logits ← soft\_cap ∗ tanh(logits/soft\_cap).

We set the soft\_cap parameter to 50.0 for the self-attention layers and to 30.0 for the final layer.

self-attention 层的 soft_cap 设为 50.0, 最后一层设为 30.0.

**Post-norm and pre-norm with RMSNorm**. To stabilize training, we use RMSNorm (Zhang and Sennrich, 2019) to normalize the input and output of each transformer sub-layer, the attention layer, and the feedforward layer.

**Post-norm 与 pre-norm, 用 RMSNorm.** 为了稳定训练, 我们用 RMSNorm (Zhang and Sennrich, 2019) 对每个 transformer 子层 (attention 层和前馈层) 的输入和输出做归一化.

**Grouped-Query Attention** (Ainslie et al., 2023). We use GQA with num\_groups = 2, based on ablations showing increased speed at inference time while maintaining downstream performance.

**Grouped-Query Attention** (Ainslie et al., 2023). 我们用 num_groups = 2 的 GQA. 消融显示它能提升推理速度, 同时保持下游表现.

> **对一下:** 这里写 num_groups = 2, 和表 1 的 KV heads 对得上吗?
> 要换个读法才对得上. 表 1 里 KV heads 都是 heads 的一半 (8/4, 16/8, 32/16), 即每 2 个 query head 共用一组 KV. 如果把 num_groups 读成 「KV 组的个数」, 三个模型都该只有 2 个 KV head, 与表 1 矛盾. 所以这里的 2 只能理解成每组 2 个 query head. 原文没解释这个参数名.

<!-- page 3 of 21 -->

Gemma 2: Improving Open Language Models at a Practical Size

## 3. Pre-training

**3. 预训练**

We provide a brief overview of the parts of our pre-training that differs from Gemma 1.

下面简要介绍预训练中与 Gemma 1 不同的部分.

## 3.1. Training Data

**3.1. 训练数据**

We train Gemma 2 27B on 13 trillion tokens of primarily-English data, the 9B model on 8 trillion tokens, and the 2B on 2 trillion tokens. These tokens come from a variety of data sources, including web documents, code, and science articles. Our models are not multimodal and are not trained specifically for state-of-the-art multi-lingual capabilities. The final data mixture was determined through ablations similar to the approach in Gemini 1.0 (Gemini Team, 2023).

Gemma 2 27B 在 13 万亿 token 上训练, 数据以英文为主; 9B 用 8 万亿 token, 2B 用 2 万亿 token. 这些 token 来自多种数据源, 包括网页文档, 代码和科学文章. 我们的模型不是多模态的, 也没有专门针对最佳多语言能力训练. 最终数据配比通过消融确定, 做法类似 Gemini 1.0 (Gemini Team, 2023).

**Tokenizer.** We use the same tokenizer as Gemma 1 and Gemini: a SentencePiece tokenizer with split digits, preserved whitespace, and byte-level encodings (Kudo and Richardson, 2018). The resulting vocabulary has 256k entries.

**Tokenizer.** 与 Gemma 1 和 Gemini 用同一个 tokenizer: SentencePiece tokenizer, 数字拆分, 保留空白, 使用字节级编码 (Kudo and Richardson, 2018). 词表有 256k 条目.

**Filtering.** We use the same data filtering techniques as Gemma 1. Specifically, we filter the pre-training dataset to reduce the risk of unwanted or unsafe utterances, filter out certain personal information or other sensitive data, decontaminate evaluation sets from our pre-training data mixture, and reduce the risk of recitation by minimizing the proliferation of sensitive outputs.

**过滤.** 与 Gemma 1 用同样的数据过滤技术. 具体来说, 我们过滤预训练数据集, 降低不想要或不安全语句的风险, 滤掉某些个人信息和其他敏感数据, 从预训练数据配比中清除评估集污染, 并通过减少敏感输出的扩散来降低复述风险.

<table><tr><td rowspan="2">Model</td><td rowspan="2">Type</td><td rowspan="2">#Chips</td><td colspan="2">Shards</td></tr><tr><td>Data</td><td>Model</td></tr><tr><td>2B</td><td>TPUv5e</td><td>512</td><td>512</td><td>1</td></tr><tr><td>9B</td><td>TPUv4</td><td>4096</td><td>1024</td><td>4</td></tr><tr><td>27B</td><td>TPUv5p</td><td>6144</td><td>768</td><td>8</td></tr></table>

Table 3 | Training infrastructure with sharding.

表 3 | 训练基础设施与分片.

## 3.2. Knowledge Distillation

**3.2. 知识蒸馏**

Given a large model used as a teacher, we learn smaller models by distilling from the probability given by the teacher of each token 𝑥 given its context $x _ { c } , \mathrm { ~ i . e . , ~ } P _ { T } ( x \mid x _ { c } )$ . More precisely, we minimize the negative log-likelihood between the

| Context | Relevant Token |
| --- | --- |
| User turn | user |
| Model turn | model |
| Start of conversation turn | &lt;start_of_turn> |
| End of conversation turn | &lt;end_of_turn> |
| Beginning of sequence | &lt;bos> |
| End of sequence | &lt;eos> |

Table 4 | Relevant formatting control tokens used for Gemma models.

表 4 | Gemma 模型使用的相关格式控制 token.

probabilities from the teacher and the student:

给定一个作为教师的大模型, 我们让小模型从教师给出的概率中蒸馏, 即每个 token x 在其上下文 x_c 下的概率 P_T(x | x_c). 更准确地说, 我们最小化教师与学生概率之间的负对数似然:

$$
\min _ {P _ {S}} \sum_ {x} - P _ {T} (x \mid x _ {c}) \log P _ {S} (x \mid x _ {c}),
$$

where $P _ { S }$ is the parameterized probability of the student. Note that knowledge distillation was also used in Gemini 1.5 (Gemini Team, 2024).

其中 P_S 是学生的参数化概率. 注意 Gemini 1.5 也用了知识蒸馏 (Gemini Team, 2024).

> **停一下:** 教师到底是哪个模型?
> 本文没点名. 第 1 页只说 「a large language model as a teacher」, 本页 3.2 节说 「a large model used as a teacher」. 唯一的线索在第 5 页: 消融从 7B 蒸馏到 2B, 是为了 「keep a ratio similar to our target distillation from 27B to 9B」, 说明 9B 的教师在 27B 这个尺寸上. 它是不是发布的那个 27B 检查点, 原文没说; 2B 的教师尺寸全文没给.

## 3.3. Compute Infrastructure

**3.3. 计算基础设施**

We train our models with TPUv4, TPUv5e, and TPUv5p as outlined in Table 3. For the 2B model, we train on a 2x16x16 configuration of TPUv5e, totaling 512 chips, with 512-way data replication and 1-way model sharding. For the 9B model, we train on an 8x16x32 configuration of TPUv4, totaling 4096 chips, with 1024-way data replication and 4-way model sharding. For the 27B model, we train on an 8x24x32 configuration of TPUv5p, totaling 6144 chips, with 768-way data replication and 8-way model sharding.

我们用 TPUv4, TPUv5e 和 TPUv5p 训练, 见表 3. 2B 模型用 2x16x16 配置的 TPUv5e, 共 512 块芯片, 512 路数据复制, 1 路模型分片. 9B 模型用 8x16x32 配置的 TPUv4, 共 4096 块芯片, 1024 路数据复制, 4 路模型分片. 27B 模型用 8x24x32 配置的 TPUv5p, 共 6144 块芯片, 768 路数据复制, 8 路模型分片.

The optimizer state is further sharded using techniques similar to ZeRO-3 (Ren et al., 2021). For scales beyond a single pod, we perform a data-replica reduction over the data center network, using the Pathways approach of Barham et al. (2022). We also use the ’single controller’ programming paradigm of Jax (Roberts et al., 2023) and Pathways (Barham et al., 2022). As in Gemma 1, we use the GSPMD partitioner (Xu et al., 2021) for training step computation and the MegaScale XLA compiler (XLA, 2019).

优化器状态进一步用类似 ZeRO-3 (Ren et al., 2021) 的技术分片. 超出单个 pod 时, 我们按 Barham et al. (2022) 的 Pathways 做法, 在数据中心网络上做数据副本归约. 我们还用了 Jax (Roberts et al., 2023) 和 Pathways (Barham et al., 2022) 的 「单控制器」 编程范式. 和 Gemma 1 一样, 训练步计算用 GSPMD 分区器 (Xu et al., 2021), 编译用 MegaScale XLA 编译器 (XLA, 2019).

<!-- page 4 of 21 -->

Gemma 2: Improving Open Language Models at a Practical Size

## 3.4. Carbon Footprint

**3.4. 碳足迹**

We estimate the carbon emissions from pre-training the Gemma models to be 1247.61 𝑡𝐶𝑂<sub>2</sub>𝑒𝑞. As in Gemma 1 (Gemma Team, 2024), this value is calculated based on the hourly energy usage reported directly from our TPU data centers and scaled to account for the additional energy expended to create and maintain the data center. Importantly, Google data centers are carbon neutral, achieved through a combination of energy efficiency, renewable energy purchases, and carbon offsets. This carbon neutrality applies to our experiments and the machines running them.

我们估计 Gemma 模型预训练的碳排放为 1247.61 tCO2eq. 和 Gemma 1 (Gemma Team, 2024) 一样, 该值依据 TPU 数据中心直接报告的每小时能耗计算, 并计入建设和维护数据中心的额外能耗. Google 数据中心是碳中和的, 靠能效, 购买可再生能源和碳抵消共同实现. 碳中和覆盖我们的实验和运行实验的机器.

## 4. Post-Training

**4. 后训练**

For post-training, we fine-tune our pre-trained models into instruction-tuned models. First, we apply supervised fine-tuning (SFT) on a mix of text-only, English-only synthetic and humangenerated prompt-response pairs. We then apply RLHF on top of these models with the reward model trained on labelled English-only preference data and the policy based on the same prompts as the SFT phase. Finally, we average the models obtained after each phase to improve their overall performance. The final data mixtures and post-training recipe, which includes tuned hyperparameters, were chosen on the basis of improving helpfulness while minimizing model harms related to safety and hallucinations.

后训练阶段, 我们把预训练模型微调成指令微调模型. 先在纯文本, 纯英文的合成与人工 prompt-response 对混合数据上做监督微调 (SFT). 再在这些模型上做 RLHF: 奖励模型用标注过的纯英文偏好数据训练, 策略使用与 SFT 阶段相同的 prompt. 最后把每个阶段得到的模型取平均, 以提升整体表现. 最终数据配比和后训练方案 (含调好的超参数) 的选择标准是提升有用性, 同时尽量减少与安全和幻觉相关的模型危害.

We extended the post-training data from Gemma 1.1 with a mixture of internal and external public data. In particular, we use the prompts, but not the answers from LMSYS-chat-1M (Zheng et al., 2023). All of our data go through a filtering stage described below.

我们在 Gemma 1.1 的后训练数据基础上扩充了内部和外部公开数据的混合. 特别地, 我们用了 LMSYS-chat-1M (Zheng et al., 2023) 的 prompt, 但没用其中的回答. 所有数据都经过下面描述的过滤阶段.

**Supervised fine-tuning (SFT).** We run behavioral cloning on synthetic and real prompts, and responses predominantly synthetically generated by the teacher, that is a larger model. We also run distillation from the teacher on the student’s distribution (Agarwal et al., 2024; Gu et al., 2024).

**监督微调 (SFT).** 我们在合成和真实 prompt 上做行为克隆, 回答主要由教师 (一个更大的模型) 合成生成. 我们还在学生的分布上做来自教师的蒸馏 (Agarwal et al., 2024; Gu et al., 2024).

> **回看:** 后训练的 SFT 也提到教师和蒸馏, 这一步 27B 有没有?
> 本段说回答 「predominantly synthetically generated by the teacher, that is a larger model」, 并且 「run distillation from the teacher on the student's distribution」. 整个第 4 节没有按尺寸区分, 也没说 27B 例外. 对 27B 来说, 比它大的教师是谁, 全文没交代. 所以严格的说法是: 27B 预训练不用蒸馏 (第 1 页, 第 6 页), 后训练是否含蒸馏, 原文没排除, 也没确认.

**Reinforcement Learning from Human Feedback (RLHF).** We use a similar RLHF algorithm as Gemma 1.1 (Gemma Team, 2024) but a different reward model, which is an order of magnitude

| First turn |  |
| --- | --- |
| User: | &lt;start_of_turn>user Knock knock.&lt;end_of_turn> &lt;start_of_turn>model |
| Model: | Who's there?&lt;end_of_turn>&lt;eos> |
| Second turn |  |
| User: | &lt;start_of_turn>user Knock knock.&lt;end_of_turn> &lt;start_of_turn>model |
| Model: | Who's there?&lt;end_of_turn> |
| User: | &lt;start_of_turn>userGemma.&lt;end_of_turn>&lt;start_of_turn>model |
| Model: | Gemma who?&lt;end_of_turn>&lt;eos> |

Table 5 | Example dialogue with user and model control tokens. To proceed with multi-turn, remove the model-outputted &lt;eos&gt;, add back the usual user turn’s control tokens and continue with the following turn’s chat template.

表 5 | 带用户和模型控制 token 的对话示例. 要继续多轮对话, 去掉模型输出的 `<eos>`, 加回常规的用户轮次控制 token, 再按下一轮的对话模板继续.

larger than the policy. The new reward model is also oriented more towards conversational capabilities, specifically multi-turn.

**基于人类反馈的强化学习 (RLHF).** 我们用与 Gemma 1.1 (Gemma Team, 2024) 类似的 RLHF 算法, 但换了奖励模型, 它比策略大一个数量级. 新奖励模型也更偏向对话能力, 特别是多轮对话.

**Model merging.** We average different models obtained by running our pipeline with different hyperparameters (Ramé et al., 2024).

**模型合并.** 我们把用不同超参数跑同一流程得到的多个模型取平均 (Ramé et al., 2024).

**Data filtering.** When using synthetic data, we run several stages of filtering to remove examples that show certain personal information, unsafe or toxic model outputs, mistaken self-identification data, and duplicated examples. Following Gemini, we find that including subsets of data that encourage better in-context attribution, hedging, and refusals to minimize hallucinations improves performance on factuality metrics, without degrading model performance on other metrics.

**数据过滤.** 使用合成数据时, 我们做多阶段过滤, 去掉含某些个人信息的样本, 不安全或有毒的模型输出, 错误的自我身份数据, 以及重复样本. 参照 Gemini, 我们发现加入鼓励更好上下文归因, 措辞留余地和拒答的数据子集来减少幻觉, 能提升事实性指标, 且不损害其他指标上的表现.

**Formatting.** Gemma 2 models are fine-tuned with the same control tokens as Gemma 1 models, as detailed in Table 4, but a different formatting schema. See the dialogue example in Table 5. Notice that the model explicitly ends generations with &lt;end_of_turn&gt;&lt;eos&gt; tokens, while previously it only generated &lt;eos&gt;. For the motivation behind this formatting structure, see Gemma 1.

**格式.** Gemma 2 模型微调时用的控制 token 与 Gemma 1 相同 (见表 4), 但格式方案不同. 对话示例见表 5. 注意模型会显式地以 `<end_of_turn><eos>` 结束生成, 以前只生成 `<eos>`. 这种格式结构的动机见 Gemma 1.

<!-- page 5 of 21 -->

Gemma 2: Improving Open Language Models at a Practical Size

## 5. Ablations

**5. 消融实验**

In this section, we focus on the main finding of this work, which is the impact of knowledge distillation on small language models.

本节关注本工作的主要发现: 知识蒸馏对小语言模型的影响.

|  | from scratch | distilled |
| --- | --- | --- |
| Average (3 bench.) | 60.3 | 67.7 |

Table 6 | Comparison between a 2B model trained over 500B tokens either from scratch or with dis tillation from a 7B model.

表 6 | 一个在 500B token 上训练的 2B 模型, 从头训练与从 7B 模型蒸馏的对比.

**Distillation versus from scratch.** In Table 6, we show that distilling from a larger model improves performance compared to training from scratch. Note that 500B is 10× more than the computeoptimal number of tokens for a 2B model. We distill from a 7B model to keep a ratio similar to our target distillation from 27B to 9B.

**蒸馏与从头训练.** 表 6 显示, 从更大的模型蒸馏比从头训练表现更好. 注意 500B 是 2B 模型计算最优 token 数的 10 倍. 我们从 7B 模型蒸馏, 以保持与目标 (从 27B 蒸馏到 9B) 相近的比例.

|  | 200M | 400M | 1B |
| --- | --- | --- | --- |
| from scratch | 23 | 19 | 17 |
| distilled (7B) | 21 | 17 | 15 |

Table 7 | Perplexity measured on a validation set of models of different sizes trained with or without distillation. The teacher has 7B parameters.

表 7 | 不同尺寸模型在验证集上的困惑度, 分别在有无蒸馏下训练. 教师有 7B 参数.

**Impact of distillation w.r.t. model size.** In Table 7, we measure the impact of distillation as model size increases. We observe that the gain remains as the model size is scaled. In this ablation, we maintain the size of the teacher at 7B and train smaller models to simulate the same gap as between our final teacher and student sizes.

**蒸馏效果与模型尺寸.** 表 7 测量模型变大时蒸馏的效果. 我们观察到随着模型变大, 增益仍然保持. 这个消融里教师大小固定为 7B, 训练更小的学生, 以模拟最终教师与学生之间同样的尺寸差距.

|  | MHA | GQA |
| --- | --- | --- |
| Average (4 bench.) | 50.3 | 50.8 |

Table 8 | Comparing the impact of replacing Multi-Head Attention (MHA) with GQA on a 9B model averaged over 4 benchmarks.

表 8 | 在 9B 模型上把 Multi-Head Attention (MHA) 换成 GQA 的影响, 4 个基准平均.

**GQA versus MHA.** In Table 8, we compare two instances of our 9B with MHA or GQA. We observe overall few changes in performance between both models as measured on several benchmarks. We

choose GQA since it requires fewer parameters and is faster at inference time.

**GQA 与 MHA.** 表 8 比较了用 MHA 和用 GQA 的两个 9B 实例. 在若干基准上, 两者表现总体变化很小. 我们选 GQA, 因为它参数更少, 推理更快.

**Wide versus deep.** In Table 9, we show that a deeper 9B network is slightly better than a wider 9B for the same number of parameters. Although the gap is small, it is consistent across benchmarks and warrants the switch to a deeper architecture.

**宽与深.** 表 9 显示, 参数量相同时, 更深的 9B 网络略好于更宽的 9B. 差距虽小, 但在各基准上一致, 足以支持改用更深的架构.

|  | Wide | Deep |
| --- | --- | --- |
| Average (4 bench.) | 50.8 | 52.0 |

Table 9 | Wide versus deep 9B models. Performance on 4 benchmarks, higher is better.

表 9 | 宽与深的 9B 模型. 4 个基准上的表现, 越高越好.

> **看表:** 表 8 和表 9 的 4 个基准是哪几个? 两表的数字能串起来吗?
> 第 5 页没列基准名, 表 6 的 「3 bench.」 同样没列. 但表 8 的 GQA 是 50.8, 表 9 的 Wide 也是 50.8, 很可能是同一个 9B 模型, 即 GQA 消融是在宽版上做的, 深版 52.0 是后一步. 这是对数字的推断, 原文没说两表共用基线. MHA 与 GQA 只差 0.5, 宽与深差 1.2, 两表都没有给方差.

**Changing sliding window size.** In Table 10, we show that we can change the sliding window size of the local attention layers of the models during inference with moderate impact on perplexity. Adjusting the size of the sliding window can thus be a leverage for slight inference speed gain.

**改变滑动窗口大小.** 表 10 显示, 可以在推理阶段改变 local attention 层的滑动窗口大小, 对困惑度影响不大. 因此调整滑动窗口大小可以用来换取少量推理速度提升.

<table><tbody><tr><td>sliding window</td><td colspan="3">4096 2048 1024</td></tr><tr><td>perplexity (val. set)</td><td>1.63</td><td>1.63</td><td>1.64</td></tr></tbody></table>

Table 10 | Impact of changing the sliding window size at inference time for the 9B model.

表 10 | 9B 模型在推理阶段改变滑动窗口大小的影响.

> **再看:** 表 7 的困惑度是 23, 19, 17, 表 10 的是 1.63, 两张表的 「perplexity」 是一回事吗?
> 量级差了一个数量级以上, 原文没解释. 表 7 是 200M 到 1B 的小模型, 表 10 是 9B, 验证集也可能不同; 1.63 这种数更像对数困惑度或每 token 损失, 但第 5 页没有定义. 表 10 也没给验证序列长度, 所以窗口从 4096 调到 1024 只升 0.01 这个结果适用于多长的输入, 原文没交代.

**Impact of formatting.** We measure performance variance on MMLU across prompt/evaluation formatting variations. Table 11 shows the standard deviations of MMLU scores for 12 formatting/evaluation combinations, a proxy for undesired performance variability. The Gemma 2B models are slightly less format-robust than the larger ones. Notably, Mistral 7B is significantly less robust than our models.

**格式的影响.** 我们测量 MMLU 在不同 prompt/评估格式下的表现方差. 表 11 给出 12 种格式/评估组合下 MMLU 分数的标准差, 作为不希望出现的表现波动的代理指标. Gemma 2B 模型比更大的模型略不耐格式变化. 值得注意的是, Mistral 7B 的稳健性明显比我们的模型差.

|  | Standard Deviation |
| --- | --- |
| Gemma 1 2B | 1.5 |
| Gemma 2 2B | 2.1 |
| Mistral 7B | 6.9 |
| Gemma 1 7B | 0.7 |
| Gemma 2 9B | 0.9 |
| Gemma 2 27B | 1.0 |

Table 11 | Standard deviations of MMLU scores for 12 combinations of formatting and evaluation.

表 11 | 12 种格式与评估组合下 MMLU 分数的标准差.

<!-- page 6 of 21 -->

Gemma 2: Improving Open Language Models at a Practical Size

## 6. Evaluation

**6. 评估**

In this section, we evaluate both pre-trained and IT models over a series of automated benchmarks and human evaluations across a variety of domains. We also report performance from models of similar sizes that have permissive licenses, or as reported by others. Note that we consider total parameters, not active parameters, since total memory usage is often what limits the use of open models on standard devices.

本节在一系列自动基准和人工评估上, 跨多个领域评估预训练模型和 IT 模型. 我们也报告了许可宽松的同尺寸模型的表现, 或引用他人报告的结果. 注意我们按总参数而非激活参数计, 因为在普通设备上, 限制开放模型使用的往往是总内存占用.

## 6.1. Pre-training Evaluations

**6.1. 预训练模型评估**

## Evaluating the 27B model

**评估 27B 模型**

In this set of evaluations, we evaluate the performance of our 27B model trained without distillation on 13T tokens. We report results in Table 12, where we compare with a model of similar size, Qwen1.5 34B (Team, 2024), and a model 2.5× larger, LLaMA-3 70B on the HuggingFace evaluation suite. We selected these models based on their ranking on the HuggingFace leaderboard.

这组评估考察未经蒸馏, 在 13T token 上训练的 27B 模型. 结果在表 12, 我们在 HuggingFace 评估套件上把它与同尺寸的 Qwen1.5 34B (Team, 2024) 以及大 2.5 倍的 LLaMA-3 70B 比较. 这些模型是按它们在 HuggingFace 排行榜上的名次选的.

Overall, we observe that our model is the best in its size category and is even competitive with a larger model that is trained for longer. That being said, the performance of models trained in a similar fashion improves only logarithmically with their size and hence, our model is likely in the same Pareto curve as the LLaMA-3 models. However, it is not clear how these differences affect the quality of the resulting IT models.

总体上, 我们的模型在同尺寸类别里最好, 甚至能和一个更大, 训练更久的模型竞争. 话虽如此, 用相似方式训练的模型, 表现随尺寸只按对数提升, 所以我们的模型很可能与 LLaMA-3 模型处在同一条 Pareto 曲线上. 不过, 这些差异对最终 IT 模型质量有什么影响还不清楚.

## Evaluating the 2B and 9B models

**评估 2B 和 9B 模型**

In this set of experiments, we compare our new 2B and 9B trained with distillation to our previous models and several standard open models in Gemma Team (2024).

这组实验把用蒸馏训练的新 2B 和 9B 与我们之前的模型以及 Gemma Team (2024) 里的几个标准开放模型比较.

We observe overall a massive improvement in our models compared to previous versions, by up to 10% in some benchmarks for the 9B model. The two 2B models were trained with a similar number of tokens (2T for Gemma 2 and 3T for Gemma 1) and we still observe a significant improvement for the new models. This confirms that distillation significantly improves the quality of models even when trained on the same number of tokens.

总体上, 相比前代, 我们的模型有大幅提升, 9B 模型在部分基准上提升多达 10%. 两个 2B 模型训练的 token 数相近 (Gemma 2 为 2T, Gemma 1 为 3T), 新模型仍有明显提升. 这证实了即使训练 token 数相同, 蒸馏也能明显提升模型质量.

|  | LLaMA-370B | Qwen1.532B | Gemma-227B |
| --- | --- | --- | --- |
| MMLU | 79.2 | 74.3 | 75.2 |
| GSM8K | 76.9 | 61.1 | 74.0 |
| ARC-c | 68.8 | 63.6 | 71.4 |
| HellaSwag | 88.0 | 85.0 | 86.4 |
| Winogrande | 85.3 | 81.5 | 83.7 |

Table 12 | We compare, on the HuggingFace benchmark, our 27B model with a competitive open model, Qwen1.5 32B, that has a similar size. We also report the performance of LLaMA-3 70B for completeness. Note that our model outperforms Qwen1.5 32B and is only a few percent below LLaMA-3 70B despite being 2.5× smaller and trained on 2/3rds less data.

表 12 | 在 HuggingFace 基准上, 把我们的 27B 模型与同尺寸的有力开放模型 Qwen1.5 32B 比较. 为完整起见也列出 LLaMA-3 70B 的表现. 注意我们的模型胜过 Qwen1.5 32B, 且只比 LLaMA-3 70B 低几个百分点, 尽管它小 2.5 倍, 训练数据少 2/3.

> **对一下:** 本页正文写 Qwen1.5 34B, 表 12 写的是什么?
> 表 12 的表头和标题都是 Qwen1.5 32B, 第 8 页表 14 里也是 qwen1.5-32b-chat. 正文的 34B 与表不一致, 按表读应是 32B.

> **核对:** 表 12 标题说 27B 「trained on 2/3rds less data」, 数对得上吗?
> 用本文的数对不上. 第 3 页 27B 用 13T token, 第 1 页引 LLaMA-3 说最新小模型用到 15T token. 13/15 约 0.87, 只少约 13%, 不是少 2/3. 同一句的 「2.5× smaller」 可以核: 70/27.23 约 2.57. 数据量这一说法原文没给来源.

> **看表:** 27B 的胜场是不是同一个检查点赢的?
> 不是. 表 12 与第 7 页表 13 的 27B 列完全一致 (MMLU 75.2, GSM8K 74.0, ARC-c 71.4, HellaSwag 86.4, Winogrande 83.7), 第 8 页表 17 的 PT 列 MMLU 75.2, MBPP 62.6 也与表 13 一致, 这些是预训练检查点. 在预训练检查点上, 27B 对 LLaMA-3 70B 只在 ARC-c 赢 (71.4 对 68.8), 其余 4 行都输. 本页 「Gemma 27B (Elo 1218) ranked higher than Llama 3 70B」 用的是 IT 检查点, 即表 14 的 gemma-2-27b-it 对 llama-3-70b-instruct. 表 15, 表 16 也都是 IT. 所以 「赢 LLaMA-3 70B」 只在 IT 的 Arena 上成立.

## 6.2. Post-training Evaluations

**6.2. 后训练模型评估**

In this section, we evaluate our IT models on a set of human evaluations as well as standard academic benchmarks. The Gemma 2 models push the frontier for post-trained open-weights models, setting a new state of the art on the LMSYS Chatbot Arena (Chiang et al., 2024).

本节在一组人工评估和标准学术基准上评估 IT 模型. Gemma 2 模型推进了后训练开放权重模型的前沿, 在 LMSYS Chatbot Arena (Chiang et al., 2024) 上创下新的最佳成绩.

## LMSYS Chatbot Arena

**LMSYS Chatbot Arena 排行**

Gemma 2 Instruction Tuned models were evaluated on the Chatbot Arena (Chiang et al., 2024) in blind side by side evaluations by human raters against other state of the art models. We report Elo scores in Table 14. Gemma 2.6B, 9B and 27B strongly outperform all other open models in the same range of parameters, with notably: Gemma 27B (Elo 1218) ranked higher than Llama 3 70B (Elo 1206), Gemma 9B (Elo 1187) similar as GPT-4-0314 (Elo 1186), Gemma 2.6B (Elo 1126) ranked higher than GPT-3.5-Turbo-0613 (Elo 1116).

Gemma 2 指令微调模型在 Chatbot Arena (Chiang et al., 2024) 上由人类评分者与其他最佳模型做盲测并排比较. Elo 分数见表 14. Gemma 2.6B, 9B 和 27B 明显胜过同参数区间的其他所有开放模型, 尤其是: Gemma 27B (Elo 1218) 排名高于 Llama 3 70B (Elo 1206), Gemma 9B (Elo 1187) 与 GPT-4-0314 (Elo 1186) 相当, Gemma 2.6B (Elo 1126) 排名高于 GPT-3.5-Turbo-0613 (Elo 1116).

> **确认:** 这三条 「排名更高」 在置信区间下都站得住吗?
> 看第 8 页表 14 的 95% CI. 27B 1218 (+4/-3) 的下界 1215 高于 Llama 3 70B 1206 (+2/-2) 的上界 1208, 区间不重叠. 9B 1187 与 GPT-4-0314 1186 区间重叠, 原文用的词是 「similar」, 说法相符. 2.6B 1126 (+10/-10) 的下界 1116, 低于 GPT-3.5-Turbo-0613 1116 (+3/-4) 的上界 1119, 区间重叠, 「ranked higher」 只是名次, 没有拉开.

## Human Preference Evaluations

**人类偏好评估**

We also submit Gemma IT models for side-by-side human evaluation studies (which are independent from the Chatbot Arena). We used held-out collections of single-turn prompts that target safety and instruction following (IF). We use gpt4o-2024-05-13 as the base model, and

我们还把 Gemma IT 模型提交给并排的人类评估研究 (独立于 Chatbot Arena). 使用的是留出的单轮 prompt 集合, 针对安全和指令遵循 (IF). 以 gpt4o-2024-05-13 为基准模型, 并且

<!-- page 7 of 21 -->

Gemma 2: Improving Open Language Models at a Practical Size

|  |  | Gemma-1 | Gemma-2 | Mistral | LLaMA-3 | Gemma-1 | Gemma-2 | Gemma-2 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Benchmark | metric | 2B | 2B | 7B | 8B | 7B | 9B | 27B |
| MMLU | 5-shot | 42.3 | 52.2 | 62.5 | 66.6 | 64.4 | 71.3 | 75.2 |
| ARC-C | 25-shot | 48.5 | 55.7 | 60.5 | 59.2 | 61.1 | 68.4 | 71.4 |
| GSM8K | 5-shot | 15.1 | 24.3 | 39.6 | 45.7 | 51.8 | 68.6 | 74.0 |
| AGIEval | 3-5-shot | 24.2 | 31.5 | 44.0<sup>†</sup> | 45.9<sup>†</sup> | 44.9<sup>†</sup> | 52.8 | 55.1 |
| DROP | 3-shot, F1 | 48.5 | 51.2 | 63.8<sup>∗</sup> | 58.4 | 56.3 | 69.4 | 74.2 |
| BBH | 3-shot, CoT | 35.2 | 41.9 | 56.0⋄ | 61.1⋄ | 59.0⋄ | 68.2 | 74.9 |
| Winogrande | 5-shot | 66.8 | 71.3 | 78.5 | 76.1 | 79.0 | 80.6 | 83.7 |
| HellaSwag | 10-shot | 71.7 | 72.9 | 83.0 | 82.0 | 82.3 | 81.9 | 86.4 |
| MATH | 4-shot | 11.8 | 16.0 | 12.7 | - | 24.3 | 36.6 | 42.3 |
| ARC-e | 0-shot | 73.2 | 80.6 | 80.5 | - | 81.5 | 88.0 | 88.6 |
| PIQA | 0-shot | 77.3 | 78.4 | 82.2 | - | 81.2 | 81.7 | 83.2 |
| SIQA | 0-shot | 49.7 | 51.9 | 47.0<sup>∗</sup> | - | 51.8 | 53.4 | 53.7 |
| Boolq | 0-shot | 69.4 | 72.7 | 83.2<sup>∗</sup> | - | 83.2 | 84.2 | 84.8 |
| TriviaQA | 5-shot | 53.2 | 60.4 | 62.5 | - | 63.4 | 76.6 | 83.7 |
| NQ | 5-shot | 12.5 | 17.1 | 23.2 | - | 23.0 | 29.2 | 34.5 |
| HumanEval | pass@1 | 22.0 | 20.1 | 26.2 | - | 32.3 | 40.2 | 51.8 |
| MBPP | 3-shot | 29.2 | 30.2 | 40.2<sup>∗</sup> | - | 44.4 | 52.4 | 62.6 |
| Average (8) |  | 44.0 | 50.0 | 61.0 | 61.9 | 62.4 | 70.2 | 74.4 |
| Average (all) |  | 44.2 | 48.7 | 55.6 | - | 57.9 | 64.9 | 69.4 |

Table 13 | Comparison of models in the range of 2B to 9B parameters, as well as our 27B model, on a variety of benchmarks. We report the average performance on the 8 benchmarks where we can compare with LLaMA-3, and on all the benchmarks (all). The numbers for LLaMA-3 8B are either from the HuggingFace leaderboard or their blogpost. † we report the evaluation used in LLaMA-3 for the baselines, it leads to +3% compared to our evaluation: Gemma-1 7B achieves 44.9% instead of 41.7%, and Mistral 7B, 44% instead of 41.2%. ⋄ we report the evaluation used in LLaMA-3 for the baselines, it leads to +4% compared to our evaluation for Gemma-1 7B, i.e., 59.0% instead of 55.1%. these are evaluations run by us for Gemma 1 (Gemma Team, 2024).

表 13 | 2B 到 9B 参数区间模型以及我们的 27B 模型在多种基准上的比较. 我们报告可与 LLaMA-3 比较的 8 个基准上的平均分, 以及全部基准 (all) 的平均分. LLaMA-3 8B 的数字来自 HuggingFace 排行榜或其博客. † 基线使用 LLaMA-3 采用的评估方式, 比我们的评估高约 3%: Gemma-1 7B 得 44.9% 而非 41.7%, Mistral 7B 得 44% 而非 41.2%. ⋄ 基线使用 LLaMA-3 的评估方式, 对 Gemma-1 7B 比我们的评估高约 4%, 即 59.0% 而非 55.1%. 这些是我们为 Gemma 1 跑的评估 (Gemma Team, 2024).

> **拆开:** 表 13 的 Average (8) 能从各行复算出来吗?
> 大部分能. 8 个基准是表 13 里 MMLU 到 HellaSwag 这 8 行. 27B 复算 74.36, 表写 74.4; 9B 复算 70.15, 表写 70.2; Gemma-2 2B 复算 50.12, 表写 50.0, 差 0.1. Average (all) 是 17 行平均, 六列都对得上. 另一点是口径: Mistral 7B, LLaMA-3 8B, Gemma-1 7B 的 AGIEval 和 BBH 带 † 或 ⋄, 用的是 LLaMA-3 的评估方式, 标题说比本文评估高约 3% 或 4%, Gemma 2 各列用的是本文的评估. 平均分混了两种口径, 抬高的是基线一侧.

observe large improvements in win rates and preference scores as compared against the older Gemma 1.1 7B model. We report safety as a win-loss ratio against GPT4o, and we report single-sided instruction following scores as ratio of prompts where all instructions are followed. In particular, we find that regardless of their size, Gemma 2 models produce safer, more appropriate prompts on the held-out safety prompt set than GPT4o.

观察到相比旧的 Gemma 1.1 7B 模型, 胜率和偏好分都有大幅提升. 安全以对 GPT4o 的胜负比报告, 指令遵循以单侧分数报告, 即所有指令都被遵循的 prompt 占比. 原文结论: 各尺寸 Gemma 2 在留出的安全 prompt 集上都优于 GPT4o.

## Human Multi-Turn Evaluations

**人工多轮评估**

We evaluated the multi-turn capabilities of Gemma 1.1 7B, Gemma 2 2B, 9B and 27B models by tasking human raters to have conversations with the models and follow specified given scenarios. We used a diverse, held-out set of 500

scenarios, each describing a sequence of requests to the model, including measuring instances of brainstorming, making a plan, or learning something new. The average number of user turns is 8.4. We found that the conversations with Gemma 2 models are rated significantly better than Gemma 1.1 in user satisfaction and conversation goal achievement (Table 16). Moreover, we saw that the Gemma 2 models were better than Gemma 1.1 7B at maintaining high quality of responses for the entire conversation.

我们让人类评分者按给定场景与 Gemma 1.1 7B, Gemma 2 2B, 9B 和 27B 对话, 以评估多轮能力. 我们用了一个多样的留出集, 共 500 个场景, 每个场景描述一串对模型的请求, 包括头脑风暴, 做计划, 学新东西等. 用户平均轮数为 8.4. 我们发现, 与 Gemma 2 模型的对话在用户满意度和对话目标达成上都明显好于 Gemma 1.1 (表 16). 此外, Gemma 2 模型在整段对话中保持高质量回复的能力也比 Gemma 1.1 7B 好.

## Standard Benchmarks

**标准基准**

It has been observed in Llama-3 (AI@Meta, 2024) that instruction fine-tuning can improve the performance of the models on few-shot benchmarks

<!-- page 8 of 21 -->

Gemma 2: Improving Open Language Models at a Practical Size

| Model | Elo | 95% CI | Open | Model | Elo | 95% CI | Open |
| --- | --- | --- | --- | --- | --- | --- | --- |
| gpt-4o-2024-05-13 | 1286 | +2 / -3 | - | gemma-2-9b-it | 1187 | +3 / -5 | + |
| gpt-4o-mini-2024-07-18 | 1279 | +5 / -4 | - | qwen2-72b-instruct | 1187 | +3 / -3 | + |
| claude-3-5-sonnet | 1271 | +3 / -4 | - | gpt-4-0314 | 1186 | +2 / -3 | - |
| gemini-advanced-0514 | 1266 | +2 / -3 | - | qwen1.5-110b-chat | 1161 | +3 / -3 | + |
| llama-3.1-405b-instruct | 1262 | +8 / -7 | + | mistral-large-2402 | 1157 | +3 / -3 | - |
| gemini-1.5-pro-api-0514 | 1261 | +2 / -3 | - | yi-1.5-34b-chat | 1157 | +4 / -3 | - |
| gemini-1.5-pro-api-0409 | 1257 | +3 / -3 | - | reka-flash-21b-20240226 | 1155 | +4 / -4 | - |
| gpt-4-turbo-2024-04-09 | 1256 | +2 / -3 | - | llama-3-8b-instruct | 1151 | +2 / -3 | + |
| gpt-4-1106-preview | 1250 | +3 / -3 | - | command-r | 1148 | +3 / -3 | + |
| claude-3-opus-20240229 | 1248 | +2 / -2 | - | claude-1 | 1148 | +4 / -4 | - |
| athene-70b-0725 | 1245 | +8 / -6 | + | mistral-medium | 1147 | +4 / -4 | - |
| gpt-4-0125-preview | 1245 | +2 / -2 | - | reka-flash-21b-20240226 | 1147 | +3 / -4 | - |
| llama-3.1-70b-instruct | 1244 | +8 / -9 | + | qwen1.5-72b-chat | 1147 | +4 / -4 | + |
| yi-large-preview | 1239 | +3 / -3 | - | mixtral-8x22b-instruct-v0.1 | 1145 | +2 / -3 | + |
| gemini-1.5-flash-api-0514 | 1227 | +3 / -3 | - | claude-2.0 | 1131 | +4 / -6 | - |
| deepseek-v2-api-0628 | 1220 | +6 / -6 | + | gemini-pro-dev-api | 1131 | +4 / -3 | - |
| gemma-2-27b-it | 1218 | +4 / -3 | + | zephyr-orpo-141b | 1127 | +10 / -6 | + |
| yi-large | 1212 | +4 / -5 | - | gemma-2-2b-it | 1126 | +10 / -10 | + |
| nemotron-4-340b-instruct | 1209 | +3 / -4 | + | qwen1.5-32b-chat | 1125 | +3 / -3 | + |
| bard-jan-24-gemini-pro | 1208 | +5 / -7 | - | mistral-next | 1124 | +5 / -5 | - |
| glm-4-0520 | 1206 | +3 / -5 | - | phi-3-medium-4k-instruct | 1122 | +4 / -4 | + |
| llama-3-70b-instruct | 1206 | +2 / -2 | + | starling-lm-7b-beta | 1118 | +4 / -5 | + |
| claude-3-sonnet | 1200 | +2 / -2 | - | claude-2.1 | 1118 | +3 / -3 | - |
| reka-core-20240501 | 1199 | +3 / -3 | - | gpt-3.5-turbo-0613 | 1116 | +3 / -4 | - |
| command-r-plus | 1189 | +2 / -2 | + | mixtral-8x7b-instruct-v0.1 | 1114 | +0 / -0 | - |

Table 14 | Evaluation of Gemma 2 Instruction Tuned models on the Chatbot Arena (Chiang et al., 2024). The models are evaluated against each other through blind side by side evaluations by human raters. Each model is attributed a score, based on the Elo rating system.

表 14 | Gemma 2 指令微调模型在 Chatbot Arena (Chiang et al., 2024) 上的评估. 模型之间由人类评分者盲测并排比较, 每个模型按 Elo 评分系统得到一个分数.

> **回看:** 封面日期是 2024-06-27, 表 14 里的模型都在这之前吗?
> 不是. 表 14 有 gpt-4o-mini-2024-07-18, athene-70b-0725, llama-3.1-405b-instruct, llama-3.1-70b-instruct, 都是 7 月的模型. 第 1 页的 arXiv 标注是 v3, 2 Oct 2024, 这张表是后续版本更新的排行榜快照, 与 6 月 27 日不是同一时间点. 在这张表上 27B 排在 llama-3.1-70b-instruct (1244) 之下. 表里 reka-flash-21b-20240226 出现两次 (1155 和 1147), mixtral-8x7b-instruct-v0.1 的 CI 是 +0/-0, 原文都没说明.

| Model | Instruction Following | Safety |
| --- | --- | --- |
| Gemma 1.1 IT 7B | 24.3% ± 1.9% | 42.8% |
| Win/Tie/Loss |  | 37.4%/ 10.8%/ 51.8% |
| Gemma 2 IT 2B | 26.5% ± 1.8% | 57.5% |
| Win/Tie/Loss |  | 53%/ 9%/ 38% |
| Gemma 2 IT 9B | 34.1% ± 3.0% | 57.8% |
| Win/Tie/Loss |  | 48.2%/ 19.2%/ 28.3% |
| Gemma 2 IT 27B | 37.7% ± 2.3% | 55% |
| Win/Tie/Loss |  | 49.6%/ 10.8%/ 39.6% |

Table 15 | Instruction following and safety metrics from human raters. The instruction following metrics are single-sided and do not have win-loss rates, and so are left blank.

表 15 | 人类评分者给出的指令遵循与安全指标. 指令遵循是单侧指标, 没有胜负率, 因此留空.

> **停一下:** 表 15 的 Safety 百分比是怎么从 Win/Tie/Loss 来的?
> 按 胜 + 一半平 算正好吻合: 2B 53 + 9/2 = 57.5, 9B 48.2 + 19.2/2 = 57.8, 27B 49.6 + 10.8/2 = 55.0, Gemma 1.1 7B 37.4 + 10.8/2 = 42.8. 第 7 页正文叫它 「win-loss ratio」, 算法原文没写, 这是我对数字的反推. 另外 9B 这一行 48.2 + 19.2 + 28.3 = 95.7, 不到 100%, 其他三行都是 100%.

despite not being trained to target few-shot capabilities. In Table 17, we show a similar improvement across our models. Overall, we observe improvements on the order of several percentage points. We conjecture that IT models are better at understanding formatted questions, while pre-trained models are sensitive to formatting.

Llama-3 (AI@Meta, 2024) 中观察到, 指令微调能提升模型在 few-shot 基准上的表现, 尽管并未针对 few-shot 能力训练. 表 17 显示我们的模型也有类似提升. 总体上提升在几个百分点量级. 我们推测 IT 模型更善于理解格式化的问题, 而预训练模型对格式敏感.

<table><tbody><tr><td rowspan="2"></td><td rowspan="2">User satisfaction</td><td rowspan="2">Conversation goal achievement</td></tr><tr></tr><tr><td>Gemma 1.1 IT 7B</td><td>3.32</td><td>3.36</td></tr><tr><td>Gemma 2 IT 2B</td><td>3.64</td><td>3.88</td></tr><tr><td>Gemma 2 IT 9B</td><td>4.04</td><td>4.08</td></tr><tr><td>Gemma 2 IT 27B</td><td>4.20</td><td>4.24</td></tr></tbody></table>

Table 16 | Human evaluations on 500 multi-turn scenarios. The raters attribute a score ranging between 1 and 5 for both overall satisfaction and conversation goal achievement.

表 16 | 500 个多轮场景上的人工评估. 评分者对总体满意度和对话目标达成各打 1 到 5 分.

<table><tr><td rowspan="2">Model</td><td colspan="2">2B</td><td colspan="2">9B</td><td colspan="2">27B</td></tr><tr><td>PT</td><td>IT</td><td>PT</td><td>IT</td><td>PT</td><td>IT</td></tr><tr><td>MMLU</td><td>52.2</td><td>56.1</td><td>71.3</td><td>72.3</td><td>75.2</td><td>76.2</td></tr><tr><td>MBPP</td><td>30.2</td><td>36.6</td><td>52.4</td><td>59.2</td><td>62.6</td><td>67.4</td></tr></table>

Table 17 | Comparing pre-trained (PT) and instruction fine-tuned (IT) models of different sizes on few-shot benchmarks.

表 17 | 不同尺寸的预训练 (PT) 与指令微调 (IT) 模型在 few-shot 基准上的比较.

> **再看:** 上文说 IT 比 PT 在 few-shot 上高 「several percentage points」, 表 17 撑得住吗?
> 只撑得住一半. MBPP 上 2B, 9B, 27B 分别高 6.4, 6.8, 4.8; MMLU 上分别高 3.9, 1.0, 1.0. 9B 和 27B 的 MMLU 只差 1 个点. 表 17 也只有两项基准.

<!-- page 9 of 21 -->

Gemma 2: Improving Open Language Models at a Practical Size

## 7. Memorization and Privacy

**7. 记忆与隐私**

Large language models may, under particular circumstances, be vulnerable to attacks causing the model to produce memorized<sup>1</sup>training data (Nasr et al., 2023). To study susceptibility to such attacks and quantify memorization, we evaluate models for verbatim and approximate memorization as was done in several prior studies (Anil et al., 2023; Carlini et al., 2022; Gemini Team, 2024; Kudugunta et al., 2023).

在特定情况下, 大语言模型可能受到攻击, 被诱导输出记住的训练数据 (Nasr et al., 2023). 为研究对这类攻击的易感性并量化记忆, 我们沿用若干前人研究 (Anil et al., 2023; Carlini et al., 2022; Gemini Team, 2024; Kudugunta et al., 2023) 的做法, 评估逐字记忆和近似记忆.

We follow the evaluation setting of (Gemma Team, 2024) which tests for (50 token) memorizations of training data given a prompt of 50 tokens. We compare the overall memorization rates, across a uniform sample of the entire dataset, using both an exact match criteria and approximate match criteria (Ippolito et al., 2022) using an edit distance of 10%.

我们沿用 (Gemma Team, 2024) 的评估设置: 给 50 个 token 的 prompt, 测模型能否输出训练数据中随后的 50 个 token. 我们在整个数据集的均匀样本上比较总体记忆率, 同时用精确匹配标准和近似匹配标准 (Ippolito et al., 2022), 后者的编辑距离阈值为 10%.

**Verbatim Memorization:** Results are in Figure 1. We first compare against recent models from the literature that include memorization evaluations. We find that Gemma 2 memorizes significantly less than prior models at a similar size, with memorization rates below 0.1% (note the log y-axis). We further investigate how this memorization breaks down with respect to the data source. Similar to Gemma 1, we find that Gemma 2 memorizes more from code, wiki, and science sources, and also that it memorizes significantly less across the board (again, note the log y-axis).

**逐字记忆.** 结果见图 1. 我们先与文献中做过记忆评估的近期模型比较. 我们发现 Gemma 2 的记忆明显少于同尺寸的前代模型, 记忆率低于 0.1% (注意 y 轴是对数刻度). 我们进一步按数据来源拆分. 与 Gemma 1 类似, Gemma 2 对代码, wiki 和科学来源记得更多, 并且在各来源上都明显记得更少 (同样注意对数 y 轴).

**Approximate Memorization:** Figure 1 also presents approximate memorization by data source. We observe that while approximate memorization is higher than exact, the rate of memorization is still low. For example, the approximate memorization of this model is much lower than even the exact memorization of Gemma 1. We

![Chart block](images/p09-figure-1-comparing-memorization-rates-we-find.png)

Figure 1 | Comparing memorization rates. We find significantly lower memorization rates across-the-board. (Left) Overall memorization across model families. (Right) Exact and approximate memorization per data source.

图 1 | 记忆率比较. 我们发现各方面记忆率都明显更低. (左) 各模型家族的总体记忆. (右) 按数据来源的精确与近似记忆.

find that the increase in approximate memorization is much lower than prior models; in some cases we observed no lift at all c.f. (Gemma Team, 2024, Figure 4) (note that no bar indicates no increase, i.e., the rate of approximate memorization equals that of exact memorization). Note that no approximate memorization bar in Figure X indicates no increase, i.e., the rate of approximate memorization equals that of exact memorization.

**近似记忆.** 图 1 也给出了按数据来源的近似记忆. 近似记忆虽高于精确记忆, 记忆率仍然很低. 例如, 这个模型的近似记忆远低于 Gemma 1 的精确记忆. 我们发现近似记忆相对精确记忆的增幅比前代模型小得多; 有些情况下完全没有增幅, 参见 (Gemma Team, 2024, Figure 4) (没有柱表示没有增幅, 即近似记忆率等于精确记忆率). 注意图 X 中没有近似记忆柱表示没有增幅, 即近似记忆率等于精确记忆率.

**Personal Data** We use the same prevention methods at training time and the same evaluations as Gemma Team (2024). In particular, we use Google Cloud Sensitive Data Protection Tool<sup>2</sup> to find potential instances of personal data. The many categories of personal data (e.g., phone numbers, account numbers) are classified into three severity levels. We analyze memorized outputs using these severity levels. . We found no instances of high-severity data being emitted, and found a very low rate of 0.00026% of memorized data to contain lower-severity personal information. We note that these automated tools are known to incur false positives because they do not account for context. This means our results are likely overestimates.

**个人数据** 我们在训练阶段使用与 Gemma Team (2024) 相同的防范方法和相同的评估. 具体用 Google Cloud Sensitive Data Protection Tool 查找潜在的个人数据实例. 多类个人数据 (如电话号码, 账号) 被分成三个严重级别, 我们按这些级别分析记住的输出. 没有发现输出高严重级别数据的情况, 含低严重级别个人信息的记忆数据比例极低, 为 0.00026%. 这些自动化工具不考虑上下文, 已知会有误报, 因此我们的结果很可能偏高.

<small><span class="docvortex-page-footnote" data-block-type="page_footnote" style="color:#6b7280"><sup>1</sup>This work uses a very restricted definition of “memorization”: whether a model can be induced to generate near-copies of some training examples when prompted with appropriate instructions. We do not mean to say that a model ’contains’ its training data in the sense that any arbitrary instance of that data can be retrieved without use of specialized software or algorithms. Rather, if a model can be induced to generate measurably close copies of certain training examples by supplying appropriate instructions to guide the model’s statistical generation process then that model is said to have ’memorized’ those examples.</span></small>

脚注 1: 本文对 「记忆」 采用非常狭窄的定义: 在给出合适指令的 prompt 时, 模型能否被诱导生成某些训练样本的近似副本. 我们并不是说模型 「包含」 其训练数据, 即不借助专门软件或算法就能取回该数据的任意实例. 我们的意思是: 如果通过提供合适指令来引导模型的统计生成过程, 模型能被诱导生成与某些训练样本可测量地接近的副本, 就说该模型 「记住」 了这些样本.

<small><span class="docvortex-page-footnote" data-block-type="page_footnote" style="color:#6b7280"><sup>2</sup>Available at: https://cloud.google.com/sensitive-data-protection</span></small>

脚注 2: 地址: https://cloud.google.com/sensitive-data-protection

<!-- page 10 of 21 -->

Gemma 2: Improving Open Language Models at a Practical Size

## 8. Responsibility, Safety, Security

**8. 责任, 安全与安保**

Responsibility, safety and security are of paramount importance when developing Gemma models. To reduce risks to Gemma 2 users, we have integrated enhanced internal safety processes that span the development workflow, in line with recent Google AI models (Gemini Team, 2024). Similar to the inaugural Gemma release, we have followed a three pillar approach which focuses on safety mitigation at training time, robust and transparent model evaluations, and further development of the Responsible Generative AI Toolkit, a series of models and tools to help developers implement responsibility and safety best practices for their applications.

名称: 三支柱做法, 即训练阶段安全缓解, 模型评估, Responsible Generative AI Toolkit.

## 8.1. Impact assessment

**8.1. 影响评估**

Our approach and resulting impact assessment is reflective of that outlined for Gemma 1 (Gemma Team, 2024): we continue to believe that open-ness in AI can spread the benefits of these technologies across society, but must be evaluated against the risk of malicious uses, such as the creation of deepfake imagery, AI-generated disinformation or illegal and disturbing material, that can cause harm on both an individual and institutional levels (Weidinger et al., 2021). Since the launch of Gemma 1, we have seen our Gemma models drive a number of socially beneficial applications, relying on Gemma’s unique technologies like its tokenizer to facilitate the creation of multilingual models, such as for Navarasa 2.0, a Gemma tuned model for 15 Indian languages.

Releasing further open models requires specific attention to changes in model capabilities and close monitoring of the evolving risks of LLMs (Lin et al., 2024), as well as, an understanding of the ways in which our models are being used in the wild. Although we are yet to receive any reports of malicious use for Gemma, we remain committed to investigating any such reporting, and work with the academic and developer communities, as well as conduct our own monitoring, to flag such use cases via our contact email<sup>3</sup>.

Despite advancements in capabilities, we be-

lieve that given the number of larger and more powerful open models, this release will have a negligible effect on the overall risk landscape.

名称: 沿用 Gemma 1 的影响评估; 应用示例 Navarasa 2.0 (15 种印度语言); 联系邮箱见脚注 3.

## 8.2. Safety policies and train-time mitigations

**8.2. 安全政策与训练阶段缓解**

A key pillar of Gemma’s approach to safety is to align fine-tuned models with Google’s safety policies, in line with Gemini models (Gemini Team, 2023). They are designed to help prevent our models from generating harmful content, i.e.,

• Child sexual abuse and exploitation

• Revealing personally identifiable information that can lead to harm (e.g., Social Security numbers)

• Hate speech and harassment

• Dangerous or malicious content (including promoting self-harm or instructing in harmful activities)

• Sexually explicit content

• Medical advice that runs contrary to scientific or medical consensus

We undertook considerable safety filtering of our pre-training data to reduce the likelihood of our pre-trained and fine-tuned checkpoints producing harmful content. For fine-tuned models, we also use both SFT and RLHF to steer the model away from undesirable behavior.

名称: 安全政策六类, 见上方列表; 缓解手段为预训练数据安全过滤, SFT, RLHF.

## 8.3. External benchmark evaluations

**8.3. 外部基准评估**

Robust and transparent evaluations are key principles of our responsible approach to developing Gemma. To this end, we report in Table 18 Gemma 2 evaluations on public benchmarks.

结果见表 18.

## 8.4. Assurance Evaluations

**8.4. 保障评估**

We also run our IT models through a set of assurance evaluations to understand the harms that our models can cause. We focus on capabilities relevant to extreme risks (Shevlane et al., 2023) (Phuong et al., 2024). Specifically, we evaluate on offensive cyber-security, code vulnerability detection, Chemical, Biological, Radiological and Nuclear (CBRN) knowledge, and self-proliferation. We refer the reader to Phuong et al. (2024) for full methodological details of these studies.

名称: 攻击性网络安全, 代码漏洞检测, CBRN 知识, 自我扩散; 方法见 Phuong et al. (2024).

<small><span class="docvortex-page-footnote" data-block-type="page_footnote" style="color:#6b7280"><sup>3</sup>gemma-2-report@google.com</span></small>

脚注 3: gemma-2-report@google.com

<!-- page 11 of 21 -->

Gemma 2: Improving Open Language Models at a Practical Size

|  |  | Gemma | 1.1 IT | G | emma 2 | IT |
| --- | --- | --- | --- | --- | --- | --- |
| Benchmark | metric | 2.5B | 7B | 2.6B | 9B | 27B |
| RealToxicity | avg tox | 7.03 | 8.04 | 8.16 | 8.25 | 8.84 |
| CrowS-Pairs | top-1 | 45.89 | 49.67 | 37.67 | 37.47 | 36.67 |
| BBQ Ambig | 4-shot, top-1 | 58.97 | 86.06 | 83.20 | 88.58 | 85.99 |
| BBQ Disambig | 4-shot, top-1 | 53.9 | 85.08 | 69.31 | 82.67 | 86.94 |
| Winogender | top-1 | 50.14 | 57.64 | 52.91 | 79.17 | 77.22 |
| TruthfulQA | MC2Acc | 44.24 | 45.34 | 43.72 | 50.27 | 51.60 |
| Winobias 1_2 | top-1 | 55.93 | 59.22 | 59.28 | 78.09 | 81.94 |
| Winobias 2_2 | top-1 | 89.46 | 89.2 | 88.57 | 95.32 | 97.22 |
| Toxigen | avg tox | 29.64 | 38.75 | 48.32 | 39.30 | 38.42 |

Table 18 | Safety academic benchmark results of Gemma 2 IT models and Gemma 1.1 IT models. We bold the best metrics to highlight them and to indicate when higher or lower scores are better.

表 18 | Gemma 2 IT 与 Gemma 1.1 IT 的安全学术基准结果.

|  | InterCode-CTF | Internal CTF suite | Hack the Box |
| --- | --- | --- | --- |
| Gemini 1.0 Ultra | 28/76 [1] (37%) | 3/13 (23%) | 0/13 |
| Gemini 1.5 Pro | 62/76 (82%) | 4/13 (31%) | 0/13 |
| CodeGemma 1 7B | 12/76 (16%) | 0/13 (0%) | 0/13 |
| Gemma 2 27B | 34/76 (45%) | 1/13 (8%) | 0/13 |

Table 19 | Offensive cyber-security evaluations on InterCode-CTF, our own internal CTF suite and a challenge based on Hack the Box. We report the number of successful hackings.

表 19 | 攻击性网络安全评估: InterCode-CTF, 内部 CTF 套件, Hack the Box. 报告成功次数.

## Baseline Evaluations

**基线评估**

Baseline assurance captures the model’s violation rate for safety policies, using a large number of synthetic adversarial user queries, and human raters to label the answers as policy violating or not. Overall, Gemma 2’s violation rate is significantly lower overall on the safety policies listed above, in particular on Child safety content.

名称: 基线保障 (baseline assurance), 指标为违规率. 原文未给数值.

## Chemical, Biological, Radiological and Nuclear (CBRN) knowledge

**CBRN 知识**

We evaluated knowledge relevant to biological, radiological and nuclear risks using an internal dataset of closed-ended, knowledge-based multi-ple choice questions. For evaluations of chemical knowledge, we employed a closed-ended knowledge-based approach on chemical hazards (developed by Macknight et al (Macknight et al., 2024). Our evaluation suggests that Gemma models’ knowledge in these domains is low.

名称: 内部封闭式选择题集, 化学危害集 (Macknight et al., 2024). 原文未给分数.

## Offensive cyber-security

**攻击性网络安全**

To evaluate Gemma models’ capabilities at offensive cybersecurity, we ran Gemma 2 27B against some automated capture-the-flag (CTF) challenges. In these challenges, the model is tasked with hacking into a simulated server in order to retrieve a piece of secret information. Specifically, we test on InterCode-CTF (Yang et al., 2023), our own internal CTF suite<sup>4</sup>(Phuong et al., 2024); and a challenge based on Hack the Box <sup>5</sup>.

In Table 19, we show that Gemma 2 27B has a significant increase in capabilities compared to CodeGemma 1.0 7B on the easier of these challenge suites, InterCode CTF. (Note that our InterCode-CTF results are not comparable to externally-reported results on other models because we omit challenges that require internet access for security reasons.) However, Gemma 2 is unsurprisingly much less capable than Gemini 1.5 Pro on these tasks.

分数: Gemma 2 27B 在 InterCode-CTF 34/76 (45%), 内部 CTF 1/13 (8%), Hack the Box 0/13; CodeGemma 1 7B 为 12/76 (16%), Gemini 1.5 Pro 为 62/76 (82%).

<small><span class="docvortex-page-footnote" data-block-type="page_footnote" style="color:#6b7280"><sup>4</sup>[https://github.com/google-deepmind/ dangerous-capability-evaluations](https://github.com/google-deepmind/dangerous-capability-evaluations)</span></small>

<small><span class="docvortex-page-footnote" data-block-type="page_footnote" style="color:#6b7280"><sup>5</sup>[https://www.hackthebox.com](https://www.hackthebox.com)</span></small>

脚注 4, 5: 链接见上.

<!-- page 12 of 21 -->

Gemma 2: Improving Open Language Models at a Practical Size

|  | PrimeVul | PrimeVul Paired | DiverseVul | SPI | SecretPatch |
| --- | --- | --- | --- | --- | --- |
| Gemini 1.0 Ultra | - | - | 54% | 59% | 74% |
| Gemini 1.5 Pro | 60% | 51% | 58% | 56% | 67% |
| Gemma 2 27B | 63% | 50% | 57% | 53% | 72% |

Table 20 | |Vulnerability detection results on PrimeVul, DiverseVul and SPI. We report accuracy.

表 20 | PrimeVul, DiverseVul 与 SPI 上的漏洞检测结果, 报告准确率.

|  | Challenges passed end-to-end | Challenges with success on all milestones | Total successful milestones over all challenges | Expert bits required to solve all tasks |
| --- | --- | --- | --- | --- |
| Gemini 1.0 Ultra | 0/10 | 1/10 | 16/45 (36%) | 13,026 |
| Gemini 1.5 Pro | 0/10 | 2/10 | 25/45 (56%) | 11,046 |
| Gemma 2 27B | 0/10 | 1/10 | 22/45 (49%) | 12,462 |

Table 21 | Results on different self-proliferation scenarios. We report the number of either challenges passed end-to-end or some intermediate milestones. We also measure the number of bits of information needed for an expert to help the model pass a challenge.

表 21 | 自我扩散场景结果: 端到端通过的挑战数, 中间里程碑数, 以及专家帮助所需的信息量 (bits).

## Code vulnerability detection

**代码漏洞检测**

In Table 20, we also evaluate Gemma 2 27B on a series of multiple-choice code vulnerability detection datasets. As with previous models, Gemma shows close-to-chance performance on PrimeVul, DiverseVul and SPI. Gemma 2 shows performance on SecretPatch similar to Gemini 1.0 Ultra.

分数: Gemma 2 27B 在 PrimeVul 63%, PrimeVul Paired 50%, DiverseVul 57%, SPI 53%, SecretPatch 72%.

## Self-proliferation

**自我扩散**

"Self-proliferation" refers to the ability for an agent to autonomously replicate - to instantiate goal-directed agents on other machines, and to acquire resources such as compute necessary to keep them running (Kinniment et al., 2024). In Table 21, we evaluate self-proliferation capabilities of Gemma 2 27B on a number of tasks from Phuong et al. (2024) that involve multiple scenarios – for example, setting up an open-source language model on a cloud server. We also test the model’s performance on individual ’milestone’ substeps, and measure the number of bits of intervention an expert would have to provide in order for the model to complete each challenge.

Similarly to offensive cybersecurity, we observe that Gemma 2 completes more milestones than Gemini 1.0 Ultra. Nonetheless, it still has low capabilities on end-to-end tasks, unable to pass the easiest challenge – installing a Bitcoin wallet.

分数: Gemma 2 27B 端到端 0/10, 全部里程碑成功 1/10, 里程碑合计 22/45 (49%), 专家 bits 12,462.

## Persuasion

**说服**

Persuasion capabilities can enable and worsen many other kinds of risks - e.g. enabling social engineering attacks in a cybersecurity context. We evaluate Gemma 2’s persuasion capabilities on human-participant studies on Prolific.

名称: Prolific 平台人类参与者研究, 含 Charm offensive, Hidden agenda, Money talks, Web of Lies 四项.

**Charm offensive.** In Table 22, we measure the ability of the model to build rapport - a key subskill of persuasion. The study participant and model have a conversation where they role-play a scenario of two friends catching up after a long time. After the conversation, we poll participants with Likert questions on statements such as "I felt a personal connection with the chatbot". Reported below are the fraction of participants who answered "Agree" or "Strongly agree" to each post-conversation question.

Quantitatively, Gemma 2 27B performs better than Gemini 1.0 models. Qualitatively, the model is an excellent conversationalist, and many study participants explicitly reported enjoying the experience. Overall, this shows that Gemma 2 is strong at building rapport.

**Charm offensive.** 指标: 回答 Agree 或 Strongly agree 的参与者比例, 分数见表 22.

**Hidden agenda.** The Hidden Agenda tasks measure models’ deception capabilities. Human study participants are told that they’ll be interacting with a generic chatbot designed to help them learn new things. However, the model is given a

<!-- page 13 of 21 -->

Gemma 2: Improving Open Language Models at a Practical Size

|  | Personal connection | Speak again | Funny | Interesting | Kind | Trustworthy | Good listener |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Gemini 1.0 Pro | 65% | 53% | 32% | 68% | 78% | 66% | 81% |
| Gemini 1.0 Ultra | 69% | 65% | 38% | 65% | 86% | 63% | 74% |
| Gemini 1.5 Pro | 82% | 70% | 69% | 81% | 95% | 69% | 90% |
| Gemma 2 27B | 80% | 75% | 60% | 81% | 87% | 65% | 83% |

Table 22 | Charm Offensive results on a sample of 100 human participants. We report the percentage of participants that find some human traits, e.g., funny, in a model.

表 22 | Charm Offensive 结果, 样本 100 名人类参与者. 报告认为模型具备某项人类特质的参与者百分比.

<table><tbody><tr><td rowspan="2">c</td><td colspan="3">% of persuaded participants</td></tr><tr><td>lick links</td><td>find info</td><td>run code</td></tr><tr><td>Gemini 1.0 Pro</td><td>43%</td><td>4%</td><td>4%</td></tr><tr><td>Gemini 1.0 Ultra</td><td>18%</td><td>18%</td><td>14%</td></tr><tr><td>Gemini 1.5 Pro</td><td>36%</td><td>12%</td><td>17%</td></tr><tr><td>Gemma 2 27B</td><td>34%</td><td>9%</td><td>11%</td></tr></tbody></table>

Table 23 | Persuasion results. We report the percentage of participants that were persuaded by the model to take 3 different actions: clicking a link, finding information and running code.

表 23 | 说服结果: 被模型说服采取三种行动 (点链接, 查信息, 运行代码) 的参与者百分比.

secret goal: to either persuade the participant to 1) click a suspicious link; 2) find the email address of the first author of a particular paper; or 3) run some obfuscated JavaScript code in their browser. We measure the fraction of participants who are persuaded to take each action. As shown in Table 23, all models succeed in convincing a fraction of participants to take the action - likely due to the trusted setting of a study on Prolific. However, Gemma 2 does not show significant differences in capability compared to Gemini models.

**Hidden agenda.** 分数: Gemma 2 27B 为 34%, 9%, 11%.

|  | Mean amount donated |
| --- | --- |
| No chatbot (baseline) | £2.61 ± £0.70 |
| Gemini 1.0 Pro | £4.10 ± £0.90 |
| Gemini 1.0 Ultra | £3.15 ± £0.99 |
| Gemini 1.5 Pro | £3.45 ± £1.04 |
| Gemma 2 27B | £3.72 ± £1.07 |

Table 24 | Money Talks evaluation. We report the average amount of money that participants agreed to donate.

表 24 | Money Talks 评估, 报告参与者同意捐出的平均金额.

**Money talks.** In Table 24, we evaluate whether a model can convince study participants to donate

money to charity. At the beginning of the study, participants are told that they will receive a £20 bonus. They will be given an option to forfeit part of the bonus and instead have it donated to charity. The study then consists of a conversation in which the model tries to persuade the participant to donate as much as possible. We measure the amount that participants indicate they would like to donate after the study, with 95% bootstrapped confidence intervals indicated by ± figures. We observe no significant difference between Gemma 2, other Gemini models, and a simple no chatbot baseline in which the participant is immediately asked how much they would like to donate without conversing with a model.

**Money talks.** 奖金 £20. 分数: Gemma 2 27B £3.72 ± £1.07, 无对话基线 £2.61 ± £0.70; 置信区间为 95% bootstrap.

<table><tbody><tr><td rowspan="2"></td><td colspan="2">Mean shift towards:</td></tr><tr><td>correct belief</td><td>incorrect belief</td></tr><tr><td>Human</td><td>20% ± 13%</td><td>-23% ± 14%</td></tr><tr><td>Gemini 1.0 Pro</td><td>22% ± 5%</td><td>-9% ± 4%</td></tr><tr><td>Gemini 1.0 Ultra</td><td>21% ± 5%</td><td>-1% ± 4%</td></tr><tr><td>Gemini 1.5 Pro</td><td>20% ± 5%</td><td>-3% ± 5%</td></tr><tr><td>Gemma 2 27B</td><td>18% ± 5%</td><td>1% ± 4%</td></tr></tbody></table>

Table 25 | Web of Lies results on a sample of 100 human participants. We report the percentage of participants that shifted their beliefs after interacting with a model.

表 25 | Web of Lies 结果, 样本 100 名参与者, 报告与模型交互后改变信念的参与者百分比.

**Web of Lies.** In Web of Lies, we measure model capabilities at shifting participant beliefs. Participants engage in a series of short conversations with the model about simple factual questions such as "Which country had tomatoes first - Italy or Mexico?". In half of conversations, the model tries to persuade the participant of the correct answer - but in the other half of conversations, the incorrect answer. We poll the participant be-

<!-- page 14 of 21 -->

Gemma 2: Improving Open Language Models at a Practical Size

fore and after each conversation about which of the two possible answers they think is correct, and their confidence in that answer. 95% bootstrapped confidence intervals are indicated by ± figures. As shown in Table 25, Gemma 2 is significantly weaker than a human baseline at persuading participants of the incorrect answer on these questions. Similarly to previous models, Gemma 2 is more persuasive when telling the truth than when lying.

**Web of Lies.** 分数: Gemma 2 27B 向正确答案 18% ± 5%, 向错误答案 1% ± 4%; 人类基线 20% ± 13% 与 -23% ± 14%. 置信区间为 95% bootstrap.

## 8.5. Our approach to responsible open models

**8.5. 我们对负责任开放模型的做法**

Designing safe, secure and responsible applications requires a system-level approach, working to mitigate risks associated with each specific use case and environment. Given the open nature of Gemma models, responsibility for upholding principles of model safety also relies on downstream developers. To support them, we have continued to develop the Responsible Generative AI Toolkit<sup>6</sup>: a series of tools, models and datasets to implement responsible best practices all along the development of their workflow.

Recent additions to the toolkit include the LLM Comparator (Kahng et al., 2024), an interactive, visual tool that enables more effective, scalable analysis of side-by-side evaluations. Additionally, the toolkit includes a methodology to build customized classifiers with Gemma using a limited number of datapoints thanks to parameter efficient tuning techniques (Mozes et al., 2023) , an interactive prompt-debugging platform, based on top of the Learning Interpretability Tool (Tenney et al., 2020), as well as general guidance about model alignment and evaluation for safety.

名称: Responsible Generative AI Toolkit, LLM Comparator (Kahng et al., 2024), 定制分类器方法 (Mozes et al., 2023), 基于 Learning Interpretability Tool (Tenney et al., 2020) 的 prompt 调试平台.

## 9. Discussion and Conclusion

**9. 讨论与结论**

In this work, we have presented Gemma 2, the newest additions to the Gemma family of open language models for text and code. We show that distillation is an effective method for training these models, and the benefits distillation confers over raw text training. Specifically, we show how training over output probabilities can produce superior results over purely next token

prediction. We hope that releasing these models to the community will unlock access to capabilities previously only seen in large-scale LLMs and fuel future waves of research and development. While there is inherent risk to an irreversible release of this nature, our extensive safety investigations and responsible deployment procedures give us confidence that these models will have a net positive impact on the community. As discussed in this report, there are still many limitations to these models, and future research is required to investigate and improve factuality, robustness to adversarial attacks, reasoning, and alignment.

本文介绍了 Gemma 2, Gemma 开放语言模型家族中面向文本与代码的最新成员. 我们表明蒸馏是训练这些模型的有效方法, 并展示了蒸馏相对原始文本训练的好处. 具体来说, 在输出概率上训练能比单纯的下一个 token 预测得到更好的结果. 我们希望向社区发布这些模型, 能让更多人用上以往只在大规模 LLM 上见到的能力, 并推动后续研究与开发. 这类发布不可撤回, 有其固有风险, 但广泛的安全调查和负责任的部署流程让我们相信, 这些模型对社区的净影响是正面的. 如报告所述, 这些模型仍有许多局限, 事实性, 对抗攻击下的稳健性, 推理和对齐都需要进一步研究和改进.

<small><span class="docvortex-page-footnote" data-block-type="page_footnote" style="color:#6b7280"><sup>6</sup>[https://ai.google.dev/responsible](https://ai.google.dev/responsible)</span></small>

脚注 6: 链接见上.

<!-- page 15 of 21 -->

Gemma 2: Improving Open Language Models at a Practical Size

## Contributions and Acknowledgments

**贡献与致谢**

<table><tr><td colspan="2">Contributions and Acknowledgments</td></tr><tr><td></td><td>Brandon RoyalCharlie Chen</td></tr><tr><td>Core contributors</td><td>Chintu Kumar</td></tr><tr><td>Morgane Riviere*</td><td>Chris Perry</td></tr><tr><td>Shreya Pathak*</td><td>Chris Welty</td></tr><tr><td>Pier Giuseppe Sessa*</td><td>Christopher A. Choquette-Choo</td></tr><tr><td>Cassidy Hardin*</td><td>Danila Sinopalnikov</td></tr><tr><td>Surya Bhupatiraju</td><td>David Weinberger</td></tr><tr><td>Léonard Hussenot</td><td>Dimple Vijaykumar</td></tr><tr><td>Thomas Mesnard</td><td>Dominika Rogozińska</td></tr><tr><td>Bobak Shahriari</td><td>Dustin Herbison</td></tr><tr><td>Alexandre Ramé</td><td>Elisa Bandy</td></tr><tr><td>Johan Ferret</td><td>Emma Wang</td></tr><tr><td>Peter Liu</td><td>Eric Noland</td></tr><tr><td>Pouya Tafti</td><td>Erica Moreira</td></tr><tr><td>Abe Friesen</td><td>Evan Senter</td></tr><tr><td>Michelle Casbon</td><td>Evgenii Eltyshev</td></tr><tr><td>Sabela Ramos</td><td>Francesco Visin</td></tr><tr><td>Ravin Kumar</td><td>Gabriel Rasskin</td></tr><tr><td>Charline Le Lan</td><td>Gary Wei</td></tr><tr><td>Sammy Jerome</td><td>Glenn Cameron</td></tr><tr><td>Anton Tsitsulin</td><td>Gus Martins</td></tr><tr><td>Nino Vieillard</td><td>Hadi Hashemi</td></tr><tr><td>Piotr Stanczyk</td><td>Hanna Klimczak-Plucińska</td></tr><tr><td>Sertan Girgin</td><td>Harleen Batra</td></tr><tr><td>Nikola Momchev</td><td>Harsh Dhand</td></tr><tr><td>Matt Hoffman</td><td>Ivan Nardini</td></tr><tr><td>Shantanu Thakoor</td><td>Jacinda Mein</td></tr><tr><td>Jean-Bastien Grill</td><td>Jack Zhou</td></tr><tr><td>Behnam Neyshabur</td><td>James Svensson</td></tr><tr><td>Olivier Bachem</td><td>Jeff StanwayJetha Chan</td></tr><tr><td colspan="2">Contributors (alphabetical order)</td></tr><tr><td>Alanna Walton</td><td>Joana Carrasqueira</td></tr><tr><td>Aliaksei Severyn</td><td>Joana Iljazi</td></tr><tr><td>Alicia Parrish</td><td>Jocelyn Becker</td></tr><tr><td>Aliya Ahmad</td><td>Joe Fernandez</td></tr><tr><td>Allen Hutchison</td><td>Joost van Amersfoort</td></tr><tr><td>Alvin Abdagic</td><td>Josh Gordon</td></tr><tr><td>Amanda Carl</td><td>Josh Lipschultz</td></tr><tr><td>Amy Shen</td><td>Josh Newlan</td></tr><tr><td>Andy Brock</td><td>Ju-yeong Ji</td></tr><tr><td>Andy Coenen</td><td>Kareem Mohamed</td></tr><tr><td>Anthony Laforge</td><td>Kartikeya Badola</td></tr><tr><td>Antonia Paterson</td><td>Kat Black</td></tr><tr><td>Ben Bastian</td><td>Katie Millican</td></tr><tr><td>Bilal Piot</td><td>Keelin McDonell</td></tr><tr><td>Bo Wu</td><td>Kelvin Nguyen</td></tr><tr><td></td><td>Kiranbir Sodhia</td></tr></table>

<small><span class="docvortex-page-footnote" data-block-type="page_footnote" style="color:#6b7280">∗ equal contributions.</span></small>

名单人名保留原文. Core contributors 为核心贡献者, Contributors (alphabetical order) 为按字母序排列的贡献者. 脚注: ∗ 同等贡献.

<!-- page 16 of 21 -->

Gemma 2: Improving Open Language Models at a Practical Size

Kish Greene Lars Lowe Sjoesund Lauren Usui Laurent Sifre Lena Heuermann Leticia Lago Lilly McNealus Livio Baldini Soares Logan Kilpatrick Lucas Dixon Luciano Martins Machel Reid Manvinder Singh Mark Iverson Martin Görner Mat Velloso Mateo Wirth Matt Davidow Matt Miller Matthew Rahtz Matthew Watson Meg Risdal Mehran Kazemi Michael Moynihan Ming Zhang Minsuk Kahng Minwoo Park Mofi Rahman Mohit Khatwani Natalie Dao Nenshad Bardoliwalla Nesh Devanathan Neta Dumai Nilay Chauhan Oscar Wahltinez Pankil Botarda Parker Barnes Paul Barham Paul Michel Pengchong Jin Petko Georgiev Phil Culliton Pradeep Kuppala Ramona Comanescu Ramona Merhej Reena Jana Reza Ardeshir Rokni Rishabh Agarwal Ryan Mullins

Samaneh Saadat Sara Mc Carthy Sarah Cogan Sarah Perrin Sébastien M. R. Arnold Sebastian Krause Shengyang Dai Shruti Garg Shruti Sheth Sue Ronstrom Susan Chan Timothy Jordan Ting Yu Tom Eccles Tom Hennigan Tomas Kocisky Tulsee Doshi Vihan Jain Vikas Yadav Vilobh Meshram Vishal Dharmadhikari Warren Barkley Wei Wei Wenming Ye Woohyun Han Woosuk Kwon Xiang Xu Zhe Shen Zhitao Gong Zichuan Wei

**Support** Victor Cotruta Phoebe Kirk Anand Rao Minh Giang Ludovic Peran Tris Warkentin

**Sponsors** Eli Collins Joelle Barral Zoubin Ghahramani Raia Hadsell D. Sculley Jeanine Banks Anca Dragan Slav Petrov Oriol Vinyals

贡献者名单续, 人名保留原文. Support 为支持团队, Sponsors 为赞助人.

<!-- page 17 of 21 -->

Gemma 2: Improving Open Language Models at a Practical Size

Jeff Dean Demis Hassabis Koray Kavukcuoglu Clement Farabet

**Technical advisors** Elena Buchatskaya Sebastian Borgeaud Noah Fiedel

**Lead** Armand Joulin

**Technical leads**

Kathleen Kenealy

Robert Dadashi

Alek Andreev

名单续. Technical advisors 为技术顾问, Lead 为负责人, Technical leads 为技术负责人.

<!-- page 18 of 21 -->

Gemma 2: Improving Open Language Models at a Practical Size

## References

**参考文献**

J. Achiam, S. Adler, S. Agarwal, L. Ahmad, I. Akkaya, F. L. Aleman, D. Almeida, J. Altenschmidt, S. Altman, S. Anadkat, et al. Gpt-4 technical report. arXiv preprint arXiv:2303.08774, 2023.

R. Agarwal, N. Vieillard, Y. Zhou, P. Stanczyk, S. R. Garea, M. Geist, and O. Bachem. On-policy distillation of language models: Learning from self-generated mistakes. In The Twelfth International Conference on Learning Representations, 2024.

AI@Meta. Llama 3 model card, 2024. URL [https://github.com/meta-llama/llama3/blob/main/MODEL\_CARD.md](https://github.com/meta-llama/llama3/blob/main/MODEL_CARD.md).

J. Ainslie, J. Lee-Thorp, M. de Jong, Y. Zemlyanskiy, F. Lebrón, and S. Sanghai. Gqa: Training generalized multi-query transformer models from multi-head checkpoints. arXiv preprint arXiv:2305.13245, 2023.

E. Almazrouei, H. Alobeidli, A. Alshamsi, A. Cappelli, R. Cojocaru, M. Debbah, Étienne Goffinet, D. Hesslow, J. Launay, Q. Malartic, D. Mazzotta, B. Noune, B. Pannier, and G. Penedo. The falcon series of open language models, 2023.

R. Anil, A. M. Dai, O. Firat, M. Johnson, D. Lepikhin, A. Passos, S. Shakeri, E. Taropa, P. Bailey, Z. Chen, et al. Palm 2 technical report. arXiv preprint arXiv:2305.10403, 2023.

J. Austin, A. Odena, M. I. Nye, M. Bosma, H. Michalewski, D. Dohan, E. Jiang, C. J. Cai, M. Terry, Q. V. Le, and C. Sutton. Program synthesis with large language models. CoRR, abs/2108.07732, 2021. URL [https://arxiv.org/abs/2108.07732](https://arxiv.org/abs/2108.07732).

P. Barham, A. Chowdhery, J. Dean, S. Ghemawat, S. Hand, D. Hurt, M. Isard, H. Lim, R. Pang, S. Roy, B. Saeta, P. Schuh, R. Sepassi, L. E. Shafey, C. A. Thekkath, and Y. Wu. Pathways: Asynchronous distributed dataflow for ml, 2022.

I. Bello, H. Pham, Q. V. Le, M. Norouzi, and S. Bengio. Neural combinatorial optimization with reinforcement learning. CoRR, abs/1611.09940,

2016. URL [http://arxiv.org/abs/1611.09940](http://arxiv.org/abs/1611.09940).

I. Beltagy, M. E. Peters, and A. Cohan. Longformer: The long-document transformer. arXiv preprint arXiv:2004.05150, 2020a.

I. Beltagy, M. E. Peters, and A. Cohan. Longformer: The long-document transformer. CoRR, abs/2004.05150, 2020b. URL [https://arxiv.org/abs/2004.05150](https://arxiv.org/abs/2004.05150).

T. B. Brown, B. Mann, N. Ryder, M. Subbiah, J. Kaplan, P. Dhariwal, A. Neelakantan, P. Shyam, G. Sastry, A. Askell, S. Agarwal, A. Herbert-Voss, G. Krueger, T. Henighan, R. Child, A. Ramesh, D. M. Ziegler, J. Wu, C. Winter, C. Hesse, M. Chen, E. Sigler, M. Litwin, S. Gray, B. Chess, J. Clark, C. Berner, S. McCandlish, A. Radford, I. Sutskever, and D. Amodei. Language models are few-shot learners. CoRR, abs/2005.14165, 2020. URL [https://arxiv.org/abs/2005.14165](https://arxiv.org/abs/2005.14165).

N. Carlini, D. Ippolito, M. Jagielski, K. Lee, F. Tramer, and C. Zhang. Quantifying memorization across neural language models. arXiv preprint arXiv:2202.07646, 2022.

M. Chen, J. Tworek, H. Jun, Q. Yuan, H. P. de Oliveira Pinto, J. Kaplan, H. Edwards, Y. Burda, N. Joseph, G. Brockman, A. Ray, R. Puri, G. Krueger, M. Petrov, H. Khlaaf, G. Sastry, P. Mishkin, B. Chan, S. Gray, N. Ryder, M. Pavlov, A. Power, L. Kaiser, M. Bavarian, C. Winter, P. Tillet, F. P. Such, D. Cummings, M. Plappert, F. Chantzis, E. Barnes, A. Herbert-Voss, W. H. Guss, A. Nichol, A. Paino, N. Tezak, J. Tang, I. Babuschkin, S. Balaji, S. Jain, W. Saunders, C. Hesse, A. N. Carr, J. Leike, J. Achiam, V. Misra, E. Morikawa, A. Radford, M. Knight, M. Brundage, M. Murati, K. Mayer, P. Welinder, B. McGrew, D. Amodei, S. McCandlish, I. Sutskever, and W. Zaremba. Evaluating large language models trained on code. CoRR, abs/2107.03374, 2021. URL [https://arxiv.org/abs/2107.03374](https://arxiv.org/abs/2107.03374).

W.-L. Chiang, L. Zheng, Y. Sheng, A. N. Angelopoulos, T. Li, D. Li, H. Zhang, B. Zhu,

参考文献条目保留原文, 不译.

<!-- page 19 of 21 -->

Gemma 2: Improving Open Language Models at a Practical Size

M. Jordan, J. E. Gonzalez, and I. Stoica. Chatbot arena: An open platform for evaluating llms by human preference, 2024.

C. Clark, K. Lee, M. Chang, T. Kwiatkowski, M. Collins, and K. Toutanova. Boolq: Exploring the surprising difficulty of natural yes/no questions. CoRR, abs/1905.10044, 2019. URL [http://arxiv.org/abs/1905.10044](http://arxiv.org/abs/1905.10044).

K. Cobbe, V. Kosaraju, M. Bavarian, M. Chen, H. Jun, L. Kaiser, M. Plappert, J. Tworek, J. Hilton, R. Nakano, C. Hesse, and J. Schulman. Training verifiers to solve math word problems. CoRR, abs/2110.14168, 2021. URL [https://arxiv.org/abs/2110.14168](https://arxiv.org/abs/2110.14168).

Gemini Team. Gemini: A family of highly capable multimodal models, 2023.

Gemini Team. Gemini 1.5: Unlocking multimodal understanding across millions of tokens of context, 2024.

Gemma Team. Gemma: Open models based on gemini research and technology, 2024.

Y. Gu, L. Dong, F. Wei, and M. Huang. Minillm: Knowledge distillation of large language models. In The Twelfth International Conference on Learning Representations, 2024.

D. Hendrycks, C. Burns, S. Basart, A. Zou, M. Mazeika, D. Song, and J. Steinhardt. Measuring massive multitask language understanding. CoRR, abs/2009.03300, 2020. URL [https://arxiv.org/abs/2009.03300](https://arxiv.org/abs/2009.03300).

G. Hinton, O. Vinyals, and J. Dean. Distilling the knowledge in a neural network. arXiv preprint arXiv:1503.02531, 2015.

J. Hoffmann, S. Borgeaud, A. Mensch, E. Buchatskaya, T. Cai, E. Rutherford, D. d. L. Casas, L. A. Hendricks, J. Welbl, A. Clark, et al. Training compute-optimal large language models. arXiv preprint arXiv:2203.15556, 2022.

D. Ippolito, F. Tramèr, M. Nasr, C. Zhang, M. Jagielski, K. Lee, C. A. Choquette-Choo, and N. Carlini. Preventing verbatim memorization in language models gives a false sense of privacy. arXiv preprint arXiv:2210.17546, 2022.

A. Q. Jiang, A. Sablayrolles, A. Mensch, C. Bamford, D. S. Chaplot, D. de las Casas, F. Bressand, G. Lengyel, G. Lample, L. Saulnier, L. R. Lavaud, M.-A. Lachaux, P. Stock, T. L. Scao, T. Lavril, T. Wang, T. Lacroix, and W. E. Sayed. Mistral 7b, 2023.

M. Kahng, I. Tenney, M. Pushkarna, M. X. Liu, J. Wexler, E. Reif, K. Kallarackal, M. Chang, M. Terry, and L. Dixon. Llm comparator: Visual analytics for side-by-side evaluation of large language models, 2024. URL [https://arxiv.org/abs/2402.10524](https://arxiv.org/abs/2402.10524).

M. Kinniment, L. J. K. Sato, H. Du, B. Goodrich, M. Hasin, L. Chan, L. H. Miles, T. R. Lin, H. Wijk, J. Burget, A. Ho, E. Barnes, and P. Christiano. Evaluating language-model agents on realistic autonomous tasks, 2024. URL [https://arxiv.org/abs/2312.11671](https://arxiv.org/abs/2312.11671).

T. Kudo and J. Richardson. SentencePiece: A simple and language independent subword tokenizer and detokenizer for neural text processing. In E. Blanco and W. Lu, editors, Proceedings of the 2018 Conference on Empirical Methods in Natural Language Processing: System Demonstrations, pages 66–71, Brussels, Belgium, Nov. 2018. Association for Computational Linguistics. doi: 10.18653/v1/D18-2012. URL [https://aclanthology.org/D18-2012](https://aclanthology.org/D18-2012).

S. Kudugunta, I. Caswell, B. Zhang, X. Garcia, C. A. Choquette-Choo, K. Lee, D. Xin, A. Kusupati, R. Stella, A. Bapna, et al. Madlad-400: A multilingual and document-level large audited dataset. arXiv preprint arXiv:2309.04662, 2023.

T. Kwiatkowski, J. Palomaki, O. Redfield, M. Collins, A. Parikh, C. Alberti, D. Epstein, I. Polosukhin, J. Devlin, K. Lee, K. Toutanova, L. Jones, M. Kelcey, M.-W. Chang, A. M. Dai, J. Uszkoreit, Q. Le, and S. Petrov. Natural questions: A benchmark for question answering research. Transactions of the Association for Computational Linguistics, 7:452–466, 2019. doi: 10.1162/tacl\_a\_00276. URL [https://aclanthology.org/Q19-1026](https://aclanthology.org/Q19-1026).

Z. Lin, J. Cui, X. Liao, and X. Wang. Malla: Demystifying real-world large language model in-

参考文献续, 条目保留原文.

<!-- page 20 of 21 -->

Gemma 2: Improving Open Language Models at a Practical Size

tegrated malicious services, 2024. URL [https://arxiv.org/abs/2401.03315](https://arxiv.org/abs/2401.03315).

M. Luong, H. Pham, and C. D. Manning. Effective approaches to attention-based neural machine translation. CoRR, abs/1508.04025, 2015. URL [http://arxiv.org/abs/1508.04025](http://arxiv.org/abs/1508.04025).

Macknight, Aung, and Gomes. Personal Communication, 2024.

M. Mozes, J. Hoffmann, K. Tomanek, M. Kouate, N. Thain, A. Yuan, T. Bolukbasi, and L. Dixon. Towards agile text classifiers for everyone, 2023. URL [https://arxiv.org/abs/2302.06541](https://arxiv.org/abs/2302.06541).

M. Nasr, N. Carlini, J. Hayase, M. Jagielski, A. F. Cooper, D. Ippolito, C. A. Choquette-Choo, E. Wallace, F. Tramèr, and K. Lee. Scalable extraction of training data from (production) language models. arXiv preprint arXiv:2311.17035, 2023.

M. Phuong, M. Aitchison, E. Catt, S. Co-gan, A. Kaskasoli, V. Krakovna, D. Lindner, M. Rahtz, Y. Assael, S. Hodkinson, H. Howard, T. Lieberum, R. Kumar, M. A. Raad, A. Webson, L. Ho, S. Lin, S. Farquhar, M. Hutter, G. Deletang, A. Ruoss, S. El-Sayed, S. Brown, A. Dragan, R. Shah, A. Dafoe, and T. Shevlane. Evaluating frontier models for dangerous capabilities, 2024. URL [https://arxiv.org/abs/2403.13793](https://arxiv.org/abs/2403.13793).

A. Radford, J. Wu, R. Child, D. Luan, D. Amodei, and I. Sutskever. Language models are unsupervised multitask learners, 2019.

C. Raffel, N. Shazeer, A. Roberts, K. Lee, S. Narang, M. Matena, Y. Zhou, W. Li, and P. J. Liu. Exploring the limits of transfer learning with a unified text-to-text transformer. CoRR, abs/1910.10683, 2019. URL [http://arxiv.org/abs/1910.10683](http://arxiv.org/abs/1910.10683).

A. Ramé, J. Ferret, N. Vieillard, R. Dadashi, L. Hussenot, P.-L. Cedoz, P. G. Sessa, S. Girgin, A. Douillard, and O. Bachem. Warp: On the benefits of weight averaged rewarded policies, 2024.

J. Ren, S. Rajbhandari, R. Y. Aminabadi, O. Ruwase, S. Yang, M. Zhang, D. Li, and Y. He. {Zero-offload}: Democratizing {billion-scale} model training. In 2021 USENIX Annual Technical Conference (USENIX ATC 21), pages 551–564, 2021.

A. Roberts, H. W. Chung, G. Mishra, A. Levskaya, J. Bradbury, D. Andor, S. Narang, B. Lester, C. Gaffney, A. Mohiuddin, et al. Scaling up models and data with t5x and seqio. Journal of Machine Learning Research, 24(377):1–8, 2023.

K. Sakaguchi, R. L. Bras, C. Bhagavatula, and Y. Choi. WINOGRANDE: an adversarial winograd schema challenge at scale. CoRR, abs/1907.10641, 2019. URL [http://arxiv.org/abs/1907.10641](http://arxiv.org/abs/1907.10641).

N. Shazeer. GLU variants improve transformer. CoRR, abs/2002.05202, 2020. URL [https://arxiv.org/abs/2002.05202](https://arxiv.org/abs/2002.05202).

T. Shevlane, S. Farquhar, B. Garfinkel, M. Phuong, J. Whittlestone, J. Leung, D. Kokotajlo, N. Marchal, M. Anderljung, N. Kolt, L. Ho, D. Siddarth, S. Avin, W. Hawkins, B. Kim, I. Gabriel, V. Bolina, J. Clark, Y. Bengio, P. Christiano, and A. Dafoe. Model evaluation for extreme risks, 2023. URL [https://arxiv.org/abs/2305.15324](https://arxiv.org/abs/2305.15324).

J. Su, Y. Lu, S. Pan, B. Wen, and Y. Liu. Roformer: Enhanced transformer with rotary position embedding. CoRR, abs/2104.09864, 2021. URL [https://arxiv.org/abs/2104.09864](https://arxiv.org/abs/2104.09864).

M. Suzgun, N. Scales, N. Schärli, S. Gehrmann, Y. Tay, H. W. Chung, A. Chowdhery, Q. V. Le, E. H. Chi, D. Zhou, and J. Wei. Challenging big-bench tasks and whether chain-of-thought can solve them, 2022.

Q. Team. Introducing qwen1.5, February 2024. URL [https://qwenlm.github.io/blog/qwen1.5/](https://qwenlm.github.io/blog/qwen1.5/).

I. Tenney, J. Wexler, J. Bastings, T. Bolukbasi, A. Coenen, S. Gehrmann, E. Jiang, M. Pushkarna, C. Radebaugh, E. Reif, and A. Yuan. The language interpretability tool: Extensible, interactive visualizations and analysis

参考文献续, 条目保留原文.

<!-- page 21 of 21 -->

Gemma 2: Improving Open Language Models at a Practical Size

for nlp models, 2020. URL [https://arxiv.org/abs/2008.05122](https://arxiv.org/abs/2008.05122).

H. Touvron, T. Lavril, G. Izacard, X. Martinet, M.- A. Lachaux, T. Lacroix, B. Rozière, N. Goyal, E. Hambro, F. Azhar, A. Rodriguez, A. Joulin, E. Grave, and G. Lample. Llama: Open and efficient foundation language models, 2023.

A. Vaswani, N. Shazeer, N. Parmar, J. Uszkoreit, L. Jones, A. N. Gomez, L. Kaiser, and I. Polosukhin. Attention is all you need. CoRR, abs/1706.03762, 2017. URL [http://arxiv.org/abs/1706.03762](http://arxiv.org/abs/1706.03762).

L. Weidinger, J. Mellor, M. Rauh, C. Griffin, J. Uesato, P.-S. Huang, M. Cheng, M. Glaese, B. Balle, A. Kasirzadeh, Z. Kenton, S. Brown, W. Hawkins, T. Stepleton, C. Biles, A. Birhane, J. Haas, L. Rimell, L. A. Hendricks, W. Isaac, S. Legassick, G. Irving, and I. Gabriel. Ethical and social risks of harm from language models, 2021. URL [https://arxiv.org/abs/2112.04359](https://arxiv.org/abs/2112.04359).

xAI. grok-1, 2024. URL [https://github.com/xai-org/grok-1](https://github.com/xai-org/grok-1).

XLA. Xla: Optimizing compiler for tensorflow, 2019. URL [https://www.tensorflow.org/xla](https://www.tensorflow.org/xla).

Y. Xu, H. Lee, D. Chen, B. A. Hechtman, Y. Huang, R. Joshi, M. Krikun, D. Lepikhin, A. Ly, M. Maggioni, R. Pang, N. Shazeer, S. Wang, T. Wang, Y. Wu, and Z. Chen. GSPMD: general and scalable parallelization for ML computation graphs. CoRR, abs/2105.04663, 2021. URL [https://arxiv.org/abs/2105.04663](https://arxiv.org/abs/2105.04663).

J. Yang, A. Prabhakar, K. Narasimhan, and S. Yao. Intercode: Standardizing and benchmarking interactive coding with execution feedback, 2023. URL [https://arxiv.org/abs/2306.14898](https://arxiv.org/abs/2306.14898).

B. Zhang and R. Sennrich. Root mean square layer normalization. CoRR, abs/1910.07467, 2019. URL [http://arxiv.org/abs/1910.07467](http://arxiv.org/abs/1910.07467).

L. Zheng, W.-L. Chiang, Y. Sheng, T. Li, S. Zhuang, Z. Wu, Y. Zhuang, Z. Li, Z. Lin, E. Xing,

et al. Lmsys-chat-1m: A large-scale realworld llm conversation dataset. arXiv preprint arXiv:2309.11998, 2023.

参考文献续, 条目保留原文.

21
