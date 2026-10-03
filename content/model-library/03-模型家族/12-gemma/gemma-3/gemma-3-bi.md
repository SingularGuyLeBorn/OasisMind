---
title: "Gemma 3 · 对照译稿"
category: "模型库"
tags: ["Gemma", "对照译稿"]
published: true
excerpt: "Gemma 3 公开材料的逐段中英对照译稿，附读报告时的疑问块。"
---
<!-- page 1 of 25 -->

arXiv:2503.19786v1 [cs.CL] 25 Mar 2025

Google DeepMind

2025-03-12

# Gemma 3 Technical Report

Gemma 3 技术报告

**Gemma Team, Google DeepMind**<sup>1</sup>

**We introduce Gemma 3, a multimodal addition to the Gemma family of lightweight open models, ranging in scale from 1 to 27 billion parameters. This version introduces vision understanding abilities, a wider coverage of languages and longer context – at least 128K tokens. We also change the architecture of the model to reduce the KV-cache memory that tends to explode with long context. This is achieved by increasing the ratio of local to global attention layers, and keeping the span on local attention short. The Gemma 3 models are trained with distillation and achieve superior performance to Gemma 2 for both pre-trained and instruction finetuned versions. In particular, our novel post-training recipe significantly improves the math, chat, instruction-following and multilingual abilities, making Gemma3-4B-IT competitive with Gemma2-27B-IT and Gemma3-27B-IT comparable to Gemini-1.5-Pro across benchmarks. We release all our models to the community.**

我们推出 Gemma 3，它是 Gemma 轻量开放模型家族中新加入的多模态成员，规模从 10 亿到 270 亿参数。这一版加入了视觉理解能力，覆盖更多语言，上下文也更长，至少 128K token。我们还修改了模型架构，以降低长上下文下容易暴涨的 KV cache 内存。做法是提高 local attention 层相对 global attention 层的比例，并让 local attention 的跨度保持很短。Gemma 3 模型用蒸馏训练，预训练版本和指令微调版本都优于 Gemma 2。特别是，我们新的后训练方案明显提升了数学，对话，指令遵循和多语言能力，使 Gemma3-4B-IT 能与 Gemma2-27B-IT 竞争，Gemma3-27B-IT 在各项基准上可与 Gemini-1.5-Pro 相比。我们向社区发布全部模型。

> **想：** 摘要说上下文 「at least 128K tokens」，是不是每个尺寸都有 128K?
> 不是。第 2 页 Long context 段写明 Gemma 3 支持 128K，「with the exception of the 1B model that has 32K」。第 7 页 5.3 节也只说把 4B，12B，27B 扩到 128K. 所以 「至少 128K」 只对 4B，12B，27B 成立。另外 128K 是模型能接收的窗口长度，在这个长度上实际评了什么，见第 22 页表 15 后面的问题。

> **问：** Gemma3-4B-IT 能和 Gemma2-27B-IT 竞争，两者是不是在同一张表里比的？
> 是同一张表，而且有两张。第 6 页表 6 和第 23 页表 18 都同时列了 Gemma 2 27B 和 Gemma 3 4B 的 IT 结果，设置相同。表 6 能比的 9 行里（MMMU 一行 Gemma 2 是 「-」），4B 赢 3 行：FACTS Grounding 70.1 对 62.4，MATH 75.6 对 55.6，HiddenMath 43.0 对 14.8，其余 6 行都输。表 18 的 14 行里 4B 也只赢 3 行：HumanEval 71.3 对 51.8，MATH，HiddenMath 42.0 对 12.0。按我算的简单平均，表 6 是 41.2 对 41.0，表 18 是 55.1 对 55.7，平均几乎持平，但持平靠的是数学；知识和多语言类差距大，例如表 18 的 MMLU 58.1 对 76.2，表 6 的 Global MMLU-Lite 54.5 对 68.6。第 5 页表 5 的 Arena 只有 Gemma-2-27B-it，没有 Gemma 3 4B. 所以这句 「竞争」 的同口径证据只有表 6 和表 18，人类偏好上本文没有证据。

> **核对：** Gemma3-27B-IT 「comparable to Gemini-1.5-Pro」，本文拿哪张表比的？
> 两处。第 6 页表 6 有 Gemini 1.5 Pro 一列，与 Gemma 3 27B 同表同设置：27B 赢 MATH（89.0 对 86.5）和 HiddenMath（60.3 对 52.0），Bird-SQL 持平（54.4），其余 7 行都输，GPQA Diamond 42.4 对 59.1，SimpleQA 10.0 对 24.9 差距最大。9 行简单平均（我算的），27B 是 55.9，Gemini 1.5 Pro 是 60.9，Gemini 1.5 Flash 是 53.9。第 5 页表 5 的 Arena 里 Gemma-3-27B-IT 是 1338 (+8/-9)，Gemini-1.5-Pro-002 是 1302 (+3/-3)，两个区间不重叠，27B 更高。表 6 没写 Gemini 1.5 Pro 的版本号，两处的 「Gemini-1.5-Pro」 是否同一个模型无法确认。第 23 页表 18 没有 Gemini 列，不能拿来支撑这句话。

## 1. Introduction

We present the newest version of Gemma open language models (Gemma Team, 2024a), co-designed with the family of Gemini frontier models (Gemini Team, 2023). This new version comes in sizes comparable to Gemma 2 (Gemma Team, 2024b), with the addition of a 1B model. These models are designed to run on standard consumer-grade hardware such as phones, laptops, and high-end GPUs. This version comes with several new abilities to the Gemma family; namely, multimodality, long context, and multilinguality, while preserving or surpassing the performance of prior versions.

我们介绍最新一版 Gemma 开放语言模型（Gemma Team, 2024a），它与 Gemini 前沿模型家族（Gemini Team, 2023）协同设计。新版的尺寸与 Gemma 2 (Gemma Team, 2024b) 相当，另外增加了一个 1B 模型。这些模型面向普通消费级硬件，例如手机，笔记本电脑和高端 GPU。这一版给 Gemma 家族带来几项新能力：多模态，长上下文和多语言，同时保持或超过之前版本的表现。

In terms of multimodality, most Gemma 3 models are compatible with a tailored version of the SigLIP vision encoder (Zhai et al., 2023). The language models treat images as a sequence of soft tokens encoded by SigLIP. We reduce the inference cost of image processing by condensing the vision embeddings into a fixed size of 256 vectors. The encoder works at a fixed resolution and we take inspiration from LLaVA (Liu et al., 2024) to enable flexible resolutions with a Pan and Scan (P&S) method.

多模态方面，大多数 Gemma 3 模型兼容一个定制版的 SigLIP 视觉编码器（Zhai et al., 2023）。语言模型把图像当作由 SigLIP 编码出的一串 soft token。我们把视觉嵌入压缩成固定的 256 个向量，以降低图像处理的推理成本。编码器在固定分辨率下工作，我们借鉴 LLaVA (Liu et al., 2024)，用 Pan and Scan (P&S) 方法支持灵活的分辨率。

The second main architectural improvement is an increase in context size to 128K tokens, without reducing performance. A challenge with long context is the memory explosion of the KV cache during inference. To reduce this issue, we interleave multiple local layers between each global

layer, and assign a smaller span of only 1024 tokens to the local layers. Therefore, only the global layers attend to long context, and we have 1 global for every 5 local layers.

第二项主要的架构改进是把上下文长度增加到 128K token，且不降低性能。长上下文的一个难题是推理时 KV cache 的内存暴涨。为缓解这一点，我们在每两个 global 层之间交错放置多个 local 层，并给 local 层分配只有 1024 token 的较小跨度。因此只有 global 层关注长上下文，每 5 个 local 层配 1 个 global 层。

> **拆开：** 「1 global for every 5 local layers」 是每个尺寸都一样吗？
> 本文把它写成所有 Gemma 3 模型共用的模式。第 2 页 Model Architecture 说 「a pattern of 5 local layers for every global layer, starting with a local layer as the first layer of the model」，没有按尺寸区分，local 跨度 1024 也只给了一个值。但全文没有各尺寸的层数表，所以每个尺寸有几个 global 层，层数不能被 6 整除时末尾怎么排，都没法从本文核对。支撑这个比例的实验也不在发布尺寸上：第 6 页图 3 用的是 2B 和 9B，第 7 页图 4 到图 6 用的是 2B，都是纯文本模型。1B 只有 32K 上下文，本文没单独说它是否用同样的比例。

The pre-training optimization recipe is similar to Gemma 2, with some modifications in the architecture design. We use the same tokenizer as Gemini 2.0, and we also revisit our data mixture to improve the multilingual capabilities of the models, while introducing image understanding. All Gemma 3 models are trained with knowledge distillation (Hinton et al., 2015).

预训练的优化方案与 Gemma 2 类似，架构设计上有一些修改。我们使用与 Gemini 2.0 相同的 tokenizer，并重新调整数据配比，以提升模型的多语言能力，同时引入图像理解。所有 Gemma 3 模型都用知识蒸馏（Hinton et al., 2015）训练。

In post-training, we focus our efforts on improving mathematics, reasoning, and chat abilities, as well as integrating the new capabilities of Gemma 3, long-context, and image inputs. We use a novel post-training approach that brings gains across all capabilities, including math, coding, chat, instruction following, and multilingual. The resulting Gemma 3 instruction-tuned models are both powerful and versatile, outperforming their predecessors by a wide margin.

后训练阶段，我们着重提升数学，推理和对话能力，并整合 Gemma 3 的新能力：长上下文和图像输入。我们使用一种新的后训练方法，在数学，代码，对话，指令遵循和多语言等所有能力上都带来提升。由此得到的 Gemma 3 指令微调模型既强又通用，大幅超过前代。

In the following sections, we provide a brief overview of our models, including the architecture and pre- and post-training recipes. We also provide detailed evaluations across a wide variety of quantitative and qualitative benchmarks. We discuss our approach to safe and responsible deployment and outline the broader implications of Gemma 3, its limitations, and advantages.

接下来几节简要介绍模型，包括架构以及预训练和后训练方案。我们还在大量定量和定性基准上给出详细评测。最后讨论安全负责的部署做法，并概述 Gemma 3 更广泛的影响，局限和优点。

<small><span class="docvortex-page-footnote" data-block-type="page_footnote" style="color:#6b7280"><sup>1</sup>See Contributions and Acknowledgments section for full author list. Please send correspondence to gemma-3-report@google.com. © 2025 Google DeepMind. All rights reserved</span></small>

脚注 1：完整作者名单见贡献与致谢一节。来信请寄 gemma-3-report@google.com. © 2025 Google DeepMind。保留所有权利。

<!-- page 2 of 25 -->

Gemma 3 Technical Report

![Image block](images/p02-i-only-had-the-sliced-meat-how-much-do-i-need-to-pay.png)

I only had the sliced meat, how much do I need to pay? include a 18% tip

Here's the breakdown of the cost and the tip calculation, based on the receipt:

1. Identify the cost of the sliced meat:

• The receipt lists "1x Zürcher Geschnetzeltes + Rösti" at CHF 36.50. This is the sliced meat dish with a side of Rösti (fried potatoes).

2. Calculate the 18% tip:

• Tip amount = CHF 36.50 \* 0.18 = CHF 6.57

3. Calculate the total amount to pay:

• Total = CHF 36.50 + CHF 6.57 = CHF 43.07

Therefore, you need to pay approximately CHF 43.07, including an 18% tip.

图中对话：用户问 「我只吃了切片肉，要付多少钱？加 18% 小费」。模型答：根据收据，费用和小费计算如下。1。找出切片肉的价格：收据上 「1x Zürcher Geschnetzeltes + Rösti」 是 CHF 36.50，这是配 Rösti（炸土豆饼）的切片肉。2。计算 18% 小费：小费 = CHF 36.50 × 0.18 = CHF 6.57. 3。计算应付总额：总额 = CHF 36.50 + CHF 6.57 = CHF 43.07。所以含 18% 小费，你大约需要付 CHF 43.07。

Figure 1 | Example of visual interaction with Gemma 3 27B IT model.

图 1 | Gemma 3 27B IT 模型的视觉交互示例。

## 2. Model Architecture

**2. 模型架构**

Gemma 3 models follow the same general decoder-only transformer architecture as previous iterations (Vaswani et al., 2017), with most architecture elements similar to the first two Gemma versions. We use a Grouped-Query Attention (GQA) (Ainslie et al., 2023) with post-norm and pre-norm with RMSNorm (Zhang and Sennrich, 2019). Inspired by Dehghani et al. (2023), Wortsman et al. (2023) and Chameleon Team (2024), we replace the soft-capping of Gemma 2 with QK-norm. In this section, we focus on some key differences from previous versions below.

Gemma 3 模型沿用前几代的通用 decoder-only transformer 架构（Vaswani et al., 2017），大多数架构元素与前两版 Gemma 相似。我们使用 Grouped-Query Attention (GQA) (Ainslie et al., 2023)，配合 RMSNorm (Zhang and Sennrich, 2019) 的 post-norm 和 pre-norm。受 Dehghani et al. (2023), Wortsman et al. (2023) 和 Chameleon Team (2024) 启发，我们用 QK-norm 替换了 Gemma 2 的 soft-capping。本节下面聚焦与之前版本的几项关键差异。

**5:1 interleaving of local/global layers.** We alternate between a local sliding window self-attention (Beltagy et al., 2020) and global self-

| Model | Vision Encoder | Embedding Parameters | Non-embedding Parameters |
| --- | --- | --- | --- |
| 1B | 0 | 302M | 698M |
| 4B | 417M | 675M | 3,209M |
| 12B | 417M | 1,012M | 10,759M |
| 27B | 417M | 1,416M | 25,600M |

Table 1 | Parameter counts for the Gemma 3 models. Our vocabulary has 256k entries.

表 1 | Gemma 3 各模型的参数量。词表有 256k 个条目。

> **对一下：** 表 1 说词表 256k 条目，第 3 页 Tokenizer 段说 262k，是两个词表吗？
> 看数字更像同一个词表的两种写法。262,144 = 2^18 = 256 × 1024，按 1024 进位写是 256k，按 1000 进位写是 262k. 用 1B 的嵌入参数反推也对得上：1152 × 262,144 = 301,989,888，约等于表 1 的 302M（这是我的算术，本文没给 1B 的隐藏维度）。4B，12B，27B 的嵌入参数除以 262,144 得不到整数，本文没给这几个尺寸的隐藏维度，没法再核。第 3 页还说这个 tokenizer 与 Gemini 2.0 相同。

attention (Luong et al., 2015), with a pattern of 5 local layers for every global layer, starting with a local layer as the first layer of the model.

**local/global 层 5:1 交替。** 我们让 local sliding window self-attention (Beltagy et al., 2020) 与 global self-attention (Luong et al., 2015) 交替，模式是每 1 个 global 层配 5 个 local 层，模型的第一层是 local 层。

**Long context.** Gemma 3 models support context length of 128K tokens, with the exception of the 1B model that has 32K. We increase RoPE base frequency from 10k to 1M on global self-attention layers, and keep the frequency of the local layers at 10k. We follow a process similar to the positional interpolation of Chen et al. (2023) to extend the span of the global self-attention layers.

**长上下文。** Gemma 3 模型支持 128K token 的上下文长度，1B 模型例外，只有 32K. 我们把 global self-attention 层的 RoPE base frequency 从 10k 提高到 1M，local 层保持 10k. 我们按类似 Chen et al. (2023) 位置插值的流程，扩展 global self-attention 层的跨度。

## 2.1. Vision modality

**2.1. 视觉模态**

**Vision encoder.** We use a 400M variant of the SigLIP encoder (Zhai et al., 2023), a Vision Transformer (Dosovitskiy, 2020) trained with a variation of the CLIP loss (Radford et al., 2021). The Gemma vision encoder takes as input square images resized to 896 x 896, and is finetuned on data from visual assistant tasks. For simplicity, we share the vision encoder across our 4B, 12B, and 27B models, keeping it frozen during training.

**视觉编码器。** 我们使用 SigLIP 编码器（Zhai et al., 2023）的一个 400M 变体，它是一个 Vision Transformer (Dosovitskiy, 2020)，用 CLIP 损失（Radford et al., 2021）的一种变体训练。Gemma 视觉编码器的输入是调整到 896 x 896 的方形图像，并在视觉助手任务的数据上做过微调。为了简单，4B，12B 和 27B 共用同一个视觉编码器，训练时保持冻结。

> **看表：** 表 1 的几列加起来，各尺寸实际多少参数？视觉编码器是 400M 还是 417M?
> 按表 1 相加：1B 是 302M + 698M = 1,000M；4B 是 417M + 675M + 3,209M = 4,301M；12B 是 12,188M；27B 是 27,433M. 4B 的 4.3B 里有 417M 是视觉编码器，去掉后是 3,884M. 第 2 页本段写 「a 400M variant of the SigLIP encoder」，表 1 写 417M，本文没解释这 17M 的差。1B 的视觉编码器一列是 0，与第 1 页 「most Gemma 3 models」 兼容视觉编码器的说法一致：1B 是纯文本模型，本段也只说 4B，12B，27B 共用视觉编码器。

**Pan & Scan (P&S).** The Gemma vision encoder operates at a fixed resolution of 896 × 896. This results in artifacts when processing non-square aspect ratios and high-resolution images, leading to unreadable text, or small objects disappearing. We address this issue with an adaptive windowing algorithm during inference. This algorithm segments images into non-overlapping crops of equal size, covering the whole image, and resize them to 896×896 pixels to pass them to the encoder. This windowing is applied only when necessary, and control for the maximum number of crops. It is an inference-time only optimization and can be disabled for faster inference.

**Pan & Scan (P&S).** Gemma 视觉编码器在固定的 896 × 896 分辨率下工作。处理非方形长宽比和高分辨率图像时会产生伪影，导致文字看不清或小物体消失。我们在推理阶段用一种自适应分窗算法解决这个问题。该算法把图像切成大小相同，互不重叠，覆盖整幅图像的若干块，把每块调整到 896×896 像素后送入编码器。分窗只在必要时使用，并控制最大块数。这是只在推理阶段使用的优化，可以关掉以加快推理。

<!-- page 3 of 25 -->

Gemma 3 Technical Report

<table><tbody><tr><td rowspan="2">Model</td><td rowspan="2">Type</td><td rowspan="2">#Chips</td><td colspan="3">Shards</td></tr><tr><td>Data</td><td>Seq. R</td><td>eplica</td></tr><tr><td>1B</td><td>TPUv5e</td><td>512</td><td>16</td><td>16</td><td>2</td></tr><tr><td>4B</td><td>TPUv5e</td><td>2048</td><td>16</td><td>16</td><td>8</td></tr><tr><td>12B</td><td>TPUv4</td><td>6144</td><td>16</td><td>16</td><td>24</td></tr><tr><td>27B</td><td>TPUv5p</td><td>6144</td><td>24</td><td>8</td><td>32</td></tr></tbody></table>

Table 2 | Training infrastructure with sharding by data, sequence (Seq.), and replica.

表 2 | 训练基础设施，按数据（Data），序列（Seq.）和副本（Replica）分片。

## 2.2. Pre-training

**2.2. 预训练**

We follow a similar recipe as in Gemma 2 for pre-training with knowledge distillation.

我们沿用与 Gemma 2 类似的方案，用知识蒸馏做预训练。

**Training data.** We pre-train our models on a slightly larger token budget than Gemma 2, i.e., we train on 14T tokens for Gemma 3 27B, 12T for the 12B version, 4T for the 4B, and 2T tokens for the 1B. The increase in tokens accounts for the mix of images and text used during pre-training. We also increase the amount of multi-lingual data to improve language coverage. We add both monolingual and parallel data, and we handle the imbalance in language representation using a strategy inspired by Chung et al. (2023).

**训练数据。** 我们的预训练 token 预算比 Gemma 2 略大：Gemma 3 27B 训练 14T token，12B 用 12T，4B 用 4T，1B 用 2T. token 增加是因为预训练中混入了图像和文本。我们还增加了多语言数据以扩大语言覆盖，同时加入单语和平行语料，并借鉴 Chung et al. (2023) 的策略处理各语言占比不均衡的问题。

**Tokenizer.** We use the same tokenizer as Gemini 2.0: a SentencePiece tokenizer with split digits, preserved whitespace, and byte-level encodings (Kudo and Richardson, 2018). The resulting vocabulary has 262k entries. This tokenizer is more balanced for non-English languages.

**Tokenizer.** 我们使用与 Gemini 2.0 相同的 tokenizer：一个 SentencePiece tokenizer，数字拆开，保留空白，采用字节级编码（Kudo and Richardson, 2018）。得到的词表有 262k 个条目。这个 tokenizer 对非英语语言更均衡。

**Filtering.** We use filtering techniques that reduce the risk of unwanted or unsafe utterances and remove certain personal information and other sensitive data. We decontaminate evaluation sets from our pre-training data mixture, and reduce the risk of recitation by minimizing the proliferation of sensitive outputs. We also apply a quality reweighing step inspired by Sachdeva et al. (2024) to reduce occurrences of low quality data.

**过滤。** 我们用过滤技术降低产生不想要或不安全话语的风险，并删除某些个人信息和其他敏感数据。我们从预训练数据配比中清除评测集污染，并通过减少敏感输出的扩散来降低背诵风险。我们还借鉴 Sachdeva et al. (2024) 做了一步质量重加权，减少低质量数据的出现。

**Distillation.** We sample 256 logits per token, weighted by teacher probabilities. The student learns the teacher’s distribution within these samples via cross-entropy loss. The teacher’s target distribution is set to zero probability for non-sampled logits, and renormalized.

**蒸馏。** 每个 token 按教师概率加权采样 256 个 logits。学生通过交叉熵损失，在这些样本内学习教师的分布。未被采样的 logits 在教师目标分布里概率置零，然后重新归一化。

> **停一下：** 预训练蒸馏的教师是哪个模型？多大？
> 本文没说。第 3 页只写了采样 256 个 logits 的做法，没点名教师。第 4 页后训练部分只说从 「a large IT teacher」 蒸馏，那是指令微调的教师，和预训练教师是不是同一个也没交代。第 8 页图 8 比较了大小两个教师，同样没给尺寸。本文能确认的只有两点：四个尺寸都用蒸馏（第 1 页 Introduction），每个 token 只保留 256 个 logits。

<table><tbody><tr><td rowspan="2">Model</td><td>Raw (GB)</td><td colspan="3">Quantized (GB)</td></tr><tr><td>bf16</td><td>Int4 I</td><td>nt4<sub>blocks</sub>=3</td><td>2 <sup>SFP8</sup></td></tr><tr><td>1B</td><td>2.0</td><td>0.5</td><td>0.7</td><td>1.0</td></tr><tr><td>+KV</td><td>2.9</td><td>1.4</td><td>1.6</td><td>1.9</td></tr><tr><td>4B</td><td>8.0</td><td>2.6</td><td>2.9</td><td>4.4</td></tr><tr><td>+KV</td><td>12.7</td><td>7.3</td><td>7.6</td><td>9.1</td></tr><tr><td>12B</td><td>24.0</td><td>6.6</td><td>7.1</td><td>12.4</td></tr><tr><td>+KV</td><td>38.9</td><td>21.5</td><td>22.0</td><td>27.3</td></tr><tr><td>27B</td><td>54.0</td><td>14.1</td><td>15.3</td><td>27.4</td></tr><tr><td>+KV</td><td>72.7</td><td>32.8</td><td>34.0</td><td>46.1</td></tr></tbody></table>

Table 3 | Memory footprints (in GB) comparison between raw (bfloat16) and quantized checkpoints for weights and KV caching (+KV) at 32,768 context size, quantized in 8 bits.

表 3 | 原始（bfloat16）检查点与量化检查点的内存占用对比（单位 GB），分别给出只有权重和加上 KV cache (+KV) 的情况，上下文长度 32,768，KV cache 量化为 8 bit。

> **再看：** 表 3 里 「+KV」 减去权重，在四种权重格式下差多少？
> 每个尺寸在四列里的差值都一样。1B 是 2.9 - 2.0 = 1.4 - 0.5 = 1.6 - 0.7 = 1.9 - 1.0 = 0.9 GB；4B 是 4.7 GB；12B 是 14.9 GB；27B 是 18.7 GB。这和表 3 标题 「quantized in 8 bits」 一致：KV cache 在所有列里都按 8 bit 算，连 bf16 那一列也是，权重格式只影响权重部分。由此还能看出，在 32K 上下文下，27B 用 Int4 权重时总量 32.8 GB 里有 18.7 GB 是 KV cache，占一半以上。12B 的 KV (14.9 GB) 与 27B (18.7 GB) 很接近，本文没给层数和 KV head 数，解释不了原因。

## 2.3. Quantization Aware Training

**2.3. 量化感知训练**

Along with the raw checkpoints, we also provide quantized versions of our models in different standard formats. These versions are obtained by finetuning each model for a small number of steps, typically 5,000, using Quantization Aware Training (QAT) (Jacob et al., 2018). We use probabilities from the non-quantized checkpoint as targets, and adapt the data to match the pre-training and post-training distributions. Based on the most popular open source quantization inference engines (e.g. llama.cpp), we focus on three weight representations: per-channel int4, per-block int4, and switched fp8. In Table 3, we report the memory filled by raw and quantized models for each weight representation with and without a KV-cache for a sequence of 32k tokens.

除了原始检查点，我们还提供多种标准格式的量化版本。这些版本通过量化感知训练（QAT）（Jacob et al., 2018）对每个模型再微调少量步数得到，通常是 5,000 步。我们用未量化检查点的概率作为目标，并调整数据，使其与预训练和后训练的分布相匹配。参照最流行的开源量化推理引擎（例如 llama.cpp），我们关注三种权重表示：按通道 int4，按块 int4 和 switched fp8。表 3 报告了每种权重表示下，原始模型和量化模型在有无 32k token 序列的 KV cache 时占用的内存。

## 2.4. Compute Infrastructure

**2.4. 计算基础设施**

We train our models with TPUv4, TPUv5e, and TPUv5p as outlined in Table 2. Each model configuration is optimized to minimize training step time. For the vision encoder, we pre-compute the embeddings for each image and directly train with the embeddings, adding no cost to the training of the language models.

我们用 TPUv4，TPUv5e 和 TPUv5p 训练模型，见表 2。每种模型配置都经过优化，以尽量缩短训练步时间。视觉编码器方面，我们预先算好每张图像的嵌入，直接用嵌入训练，不给语言模型的训练增加成本。

The optimizer state is sharded using an implementation of ZeRO-3 (Ren et al., 2021). For multi-pod training, we perform a data replica re-

<!-- page 4 of 25 -->

Gemma 3 Technical Report

<table><tr><td>Context</td><td>Formatting</td></tr><tr><td>User turn</td><td>user</td></tr><tr><td>Model turn</td><td>model</td></tr><tr><td>End of turn</td><td></td></tr><tr><td colspan="2">Example of discussion:</td></tr><tr><td colspan="2">User: Who are you?Model: My name is Gemma!User: What is 2+2?Model: 2+2=4.</td></tr><tr><td colspan="2">Model input:</td></tr><tr><td colspan="2">[BOS]userWho are you?modelMy name is Gemma!userWhat is 2+2?model</td></tr><tr><td colspan="2">Model output:</td></tr><tr><td colspan="2">2+2=4.</td></tr></table>

Table 4 | Formatting for Gemma IT models. Explicitly add the [BOS] token after tokenization, or use the add\_bos=True option in the tokenizer. Do not tokenize the text "[BOS]".

表 4 | Gemma IT 模型的格式。tokenize 之后显式加上 [BOS] token，或在 tokenizer 里使用 `add_bos=True` 选项。不要对文本 「[BOS]」 做 tokenize。

duction over the data center network, using the Pathways approach of Barham et al. (2022). We use the ‘single controller’ programming paradigm of Jax (Roberts et al., 2023) and Pathways (Barham et al., 2022), along with the GSPMD partitioner (Xu et al., 2021) and the MegaScale XLA compiler (XLA, 2019).

优化器状态用 ZeRO-3 (Ren et al., 2021) 的一种实现分片。多 pod 训练时，我们按 Barham et al. (2022) 的 Pathways 方法，在数据中心网络上做数据副本归约。我们使用 Jax (Roberts et al., 2023) 和 Pathways (Barham et al., 2022) 的 「single controller」 编程范式，以及 GSPMD 分区器（Xu et al., 2021）和 MegaScale XLA 编译器（XLA, 2019）。

## 3. Instruction-Tuning

**3. 指令微调**

Pre-trained models are turned into instructiontuned models with an improved post-training approach compared to our prior recipe (see Table 6).

预训练模型经过后训练变成指令微调模型，所用方法相比我们之前的方案有所改进（见表 6）。

**Techniques.** Our post-training approach relies on an improved version of knowledge distillation (Agarwal et al., 2024; Anil et al., 2018; Hin ton et al., 2015) from a large IT teacher, along with a RL finetuning phase based on improved versions of BOND (Sessa et al., 2024), WARM (Ramé et al., 2024b), and WARP (Ramé et al., 2024a).

**技术。** 我们的后训练方法依赖改进版的知识蒸馏（Agarwal et al., 2024; Anil et al., 2018; Hinton et al., 2015），教师是一个大的 IT 模型，再加上一个 RL 微调阶段，基于改进版的 BOND (Sessa et al., 2024), WARM (Ramé et al., 2024b) 和 WARP (Ramé et al., 2024a).

**Reinforcement learning objectives.** We use a variety of reward functions to improve helpfulness, math, coding, reasoning, instruction-

following, and multilingual abilities, while minimizing model harmfulness. This includes learning from weight averaged reward models (Ramé et al., 2024b) trained with human feedback data, code execution feedback (Gehring et al., 2024), and ground-truth rewards for solving math problems (DeepSeek-AI, 2025; Lambert et al., 2024).

**强化学习目标。** 我们用多种奖励函数提升有用性，数学，代码，推理，指令遵循和多语言能力，同时尽量降低模型的有害性。其中包括：从用人类反馈数据训练并做权重平均的奖励模型（Ramé et al., 2024b）学习，代码执行反馈（Gehring et al., 2024），以及解数学题的真实答案奖励（DeepSeek-AI, 2025; Lambert et al., 2024）。

**Data filtering.** We carefully optimize the data used in post-training to maximize model performance. We filter examples that show certain personal information, unsafe or toxic model outputs, mistaken self-identification data, and duplicated examples. Including subsets of data that encourage better in-context attribution, hedging, and refusals to minimize hallucinations also improves performance on factuality metrics, without degrading model performance on other metrics.

**数据过滤。** 我们仔细优化后训练数据，以最大化模型表现。我们过滤掉含某些个人信息的样本，不安全或有毒的模型输出，错误的自我身份认知数据，以及重复样本。加入鼓励更好的上下文内归因，含糊表态（hedging）和拒答的数据子集以减少幻觉，也能提升事实性指标，且不损害其他指标上的表现。

**[BOS] token.** For both PT and IT models, text starts with a [BOS] token, that needs to be added explicitly since the text “[BOS]” does not map to the [BOS] token. For instance, Flax has an option, add\_bos=True, to add this token automatically when tokenizing. An example of the formatting for an IT model is shown in Table 4,

**[BOS] token.** PT 和 IT 模型的文本都以 [BOS] token 开头，它需要显式添加，因为文本 「[BOS]」 不会映射成 [BOS] token。例如 Flax 有 `add_bos=True` 选项，可在 tokenize 时自动加上。IT 模型的格式示例见表 4。

**PT versus IT Formatting.** All models share the same tokenizer, with some control tokens dedicated to IT formatting. A key difference is that PT models output a &lt;eos&gt; token at the end of generation, while IT models output a &lt;end_of_turn&gt; at the end of the generation, as shown for IT in Table 4. Fine-tuning either model type thus also requires adding their respective end tokens.

**PT 与 IT 的格式。** 所有模型共用同一个 tokenizer，其中一些控制 token 专用于 IT 格式。一个关键差别是 PT 模型在生成结束时输出 `<eos>`，IT 模型在生成结束时输出 `<end_of_turn>`，如表 4 中 IT 部分所示。因此微调任一类模型时，也需要加上各自的结束 token。

## 4. Evaluation of final models

**4. 最终模型评测**

In this section, we evaluate the IT models over a series of automated benchmarks and human evaluations across a variety of domains, as well as static benchmarks such as MMLU.

本节在多个领域的一系列自动基准和人工评测上评测 IT 模型，也包括 MMLU 这类静态基准。

## 4.1. LMSYS Chatbot Arena

**4.1. LMSYS Chatbot Arena（人类盲评）**

In this section, we report the performance of our IT 27B model on LMSys Chatbot Arena (Chiang et al., 2024) in blind side-by-side evaluations by human raters against other state-of-the-art models. We report Elo scores in Table 5. Gemma 3 27B

<!-- page 5 of 25 -->

Gemma 3 Technical Report

| Rank | Model | Elo | 95% CI | Open | Type | #params/#activated |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | Grok-3-Preview-02-24 | 1412 | +8/-10 | - | - | - |
| 1 | GPT-4.5-Preview | 1411 | +11/-11 | - | - | - |
| 3 | Gemini-2.0-Flash-Thinking-Exp-01-21 | 1384 | +6/-5 | - | - | - |
| 3 | Gemini-2.0-Pro-Exp-02-05 | 1380 | +5/-6 | - | - | - |
| 3 | ChatGPT-4o-latest (2025-01-29) | 1377 | +5/-4 | - | - | - |
| 6 | DeepSeek-R1 | 1363 | +8/-6 | yes | MoE | 671B/37B |
| 6 | Gemini-2.0-Flash-001 | 1357 | +6/-5 | - | - | - |
| 8 | o1-2024-12-17 | 1352 | +4/-6 | - | - | - |
| 9 | Gemma-3-27B-IT | 1338 | +8/-9 | yes | Dense | 27B |
| 9 | Qwen2.5-Max | 1336 | +7/-5 | - | - | - |
| 9 | o1-preview | 1335 | +4/-3 | - | - | - |
| 9 | o3-mini-high | 1329 | +8/-6 | - | - | - |
| 13 | DeepSeek-V3 | 1318 | +8/-6 | yes | MoE | 671B/37B |
| 14 | GLM-4-Plus-0111 | 1311 | +8/-8 | - | - | - |
| 14 | Qwen-Plus-0125 | 1310 | +7/-5 | - | - | - |
| 14 | Claude 3.7 Sonnet | 1309 | +9/-11 | - | - | - |
| 14 | Gemini-2.0-Flash-Lite | 1308 | +5/-5 | - | - | - |
| 18 | Step-2-16K-Exp | 1305 | +7/-6 | - | - | - |
| 18 | o3-mini | 1304 | +5/-4 | - | - | - |
| 18 | o1-mini | 1304 | +4/-3 | - | - | - |
| 18 | Gemini-1.5-Pro-002 | 1302 | +3/-3 | - | - | - |
| ... |  |  |  |  |  |  |
| 28 | Meta-Llama-3.1-405B-Instruct-bf16 | 1269 | +4/-3 | yes | Dense | 405B |
| ... |  |  |  |  |  |  |
| 38 | Llama-3.3-70B-Instruct | 1257 | +5/-3 | yes | Dense | 70B |
| ... |  |  |  |  |  |  |
| 39 | Qwen2.5-72B-Instruct | 1257 | +3/-3 | yes | Dense | 72B |
| ... |  |  |  |  |  |  |
| 59 | Gemma-2-27B-it | 1220 | +3/-2 | yes | Dense | 27B |

Table 5 | Evaluation of Gemma 3 27B IT model in the Chatbot Arena (Chiang et al., 2024). All the models are evaluated against each other through blind side-by-side evaluations by human raters. Each model is attributed a score, based on the Elo rating system. Gemma-3-27B-IT numbers are preliminary results received on March 8, 2025.

表 5 | Gemma 3 27B IT 模型在 Chatbot Arena (Chiang et al., 2024) 上的评测。所有模型通过人类评分者的盲测并排比较互相对比。每个模型按 Elo 评分系统得到一个分数。Gemma-3-27B-IT 的数字是 2025 年 3 月 8 日收到的初步结果。

IT (1338) is among the top 10 best models, with a score above other non-thinking open models, such as DeepSeek-V3 (1318), LLaMA 3 405B (1257), and Qwen2.5-70B (1257), which are much larger models. Finally, the Elo of Gemma 3 is significantly higher than Gemma 2, at 1220. Note that Elo scores do not take into account visual abilities, which none of the aforementioned models have.

本节报告 IT 27B 模型在 LMSys Chatbot Arena (Chiang et al., 2024) 上的表现：人类评分者把它和其他最佳水平的模型放在一起做盲测并排比较。Elo 分数见表 5. Gemma 3 27B IT (1338) 进入前 10，分数高于其他非思考型开放模型，例如 DeepSeek-V3 (1318), LLaMA 3 405B (1257) 和 Qwen2.5-70B (1257)，这些模型都大得多。最后，Gemma 3 的 Elo 明显高于 Gemma 2 的 1220。注意 Elo 分数不考虑视觉能力，上述模型都没有视觉能力。

> **对一下：** 正文说 LLaMA 3 405B 是 1257，Qwen2.5-70B 是 1257，和表 5 对得上吗？
> 对不上。表 5 里 Meta-Llama-3.1-405B-Instruct-bf16 是 1269，排第 28; 1257 是 Llama-3.3-70B-Instruct（第 38）和 Qwen2.5-72B-Instruct（第 39）的分数。表里也没有 「Qwen2.5-70B」，只有 72B. 正文的结论不受影响，1338 比这几个都高，但引用数字应以表 5 为准。另外 「top 10」 指的是排第 9，与 Qwen2.5-Max (1336), o1-preview (1335), o3-mini-high (1329) 同列第 9。按表中 95% 置信区间，1338 (+8/-9) 的下沿 1329 高于 DeepSeek-V3 1318 (+8/-6) 的上沿 1326。

## 4.2. Standard benchmarks

**4.2. 标准基准**

In Table 6, we show the performance of our final models across a variety of benchmarks compared to our previous model iteration, and Gemini 1.5. We do not compare directly with external models that often report their own evaluation settings, since running them in our setting does not guarantee a fair comparison. We encourage the reader to

follow third-party static leaderboards for a fairer comparison across models. We include additional evaluations of our models on other benchmarks in the appendix.

表 6 给出最终模型在多种基准上的表现，对比对象是我们的上一代模型和 Gemini 1.5。我们不直接和外部模型比较，因为它们常报告自己的评测设置，在我们的设置下运行它们也不能保证公平。我们建议读者参考第三方静态排行榜，以便更公平地跨模型比较。附录里还有我们的模型在其他基准上的评测。

## 5. Ablations

**5. 消融**

In this section, we focus on the impact of our architecture changes, as well as some of the vision abilities new to this model.

本节聚焦架构改动的影响，以及这一代模型新增的部分视觉能力。

## 5.1. Pre-training ability probing

**5.1. 预训练能力探测**

We use several standard benchmarks as probes during pre-training to ensure our models capture general abilities, and in Figure 2, we compare the quality of pre-trained models from Gemma 2 and 3 across these general abilities, namely, science,

<!-- page 6 of 25 -->

Gemma 3 Technical Report

<table><tbody><tr><td rowspan="2"></td><td colspan="2">Gemini 1.5</td><td colspan="2">Gemini 2.0</td><td colspan="3">Gemma 2</td><td colspan="4">Gemma 3</td></tr><tr><td>Flash</td><td>Pro</td><td>Flash</td><td>Pro</td><td>2B</td><td>9B</td><td>27B</td><td>1B</td><td>4B</td><td>12B</td><td>27B</td></tr><tr><td>MMLU-Pro</td><td>67.3</td><td>75.8</td><td>77.6</td><td>79.1</td><td>15.6</td><td>46.8</td><td>56.9</td><td>14.7</td><td>43.6</td><td>60.6</td><td>67.5</td></tr><tr><td>LiveCodeBench</td><td>30.7</td><td>34.2</td><td>34.5</td><td>36.0</td><td>1.2</td><td>10.8</td><td>20.4</td><td>1.9</td><td>12.6</td><td>24.6</td><td>29.7</td></tr><tr><td>Bird-SQL (dev)</td><td>45.6</td><td>54.4</td><td>58.7</td><td>59.3</td><td>12.2</td><td>33.8</td><td>46.7</td><td>6.4</td><td>36.3</td><td>47.9</td><td>54.4</td></tr><tr><td>GPQA Diamond</td><td>51.0</td><td>59.1</td><td>60.1</td><td>64.7</td><td>24.7</td><td>28.8</td><td>34.3</td><td>19.2</td><td>30.8</td><td>40.9</td><td>42.4</td></tr><tr><td>SimpleQA</td><td>8.6</td><td>24.9</td><td>29.9</td><td>44.3</td><td>2.8</td><td>5.3</td><td>9.2</td><td>2.2</td><td>4.0</td><td>6.3</td><td>10.0</td></tr><tr><td>FACTS Grounding</td><td>82.9</td><td>80.0</td><td>84.6</td><td>82.8</td><td>43.8</td><td>62.0</td><td>62.4</td><td>36.4</td><td>70.1</td><td>75.8</td><td>74.9</td></tr><tr><td>Global MMLU-Lite</td><td>73.7</td><td>80.8</td><td>83.4</td><td>86.5</td><td>41.9</td><td>64.8</td><td>68.6</td><td>34.2</td><td>54.5</td><td>69.5</td><td>75.1</td></tr><tr><td>MATH</td><td>77.9</td><td>86.5</td><td>90.9</td><td>91.8</td><td>27.2</td><td>49.4</td><td>55.6</td><td>48.0</td><td>75.6</td><td>83.8</td><td>89.0</td></tr><tr><td>HiddenMath</td><td>47.2</td><td>52.0</td><td>63.5</td><td>65.2</td><td>1.8</td><td>10.4</td><td>14.8</td><td>15.8</td><td>43.0</td><td>54.5</td><td>60.3</td></tr><tr><td>MMMU (val)</td><td>62.3</td><td>65.9</td><td>71.7</td><td>72.7</td><td>-</td><td>-</td><td>-</td><td>-</td><td>48.8</td><td>59.6</td><td>64.9</td></tr></tbody></table>

Table 6 | Performance of instruction fine-tuned (IT) models compared to Gemini 1.5, Gemini 2.0, and Gemma 2 on zero-shot benchmarks across different abilities.

表 6 | 指令微调（IT）模型与 Gemini 1.5，Gemini 2.0 和 Gemma 2 在不同能力的零样本基准上的表现对比。

> **核对：** 表 6 和第 23 页表 18 有几个同名基准，数字一样吗？
> 有的一样，有的不一样。MATH 和 Global MMLU-Lite 两表完全相同，例如 27B 的 MATH 都是 89.0，GMMLU-Lite 都是 75.1. LiveCodeBench 差得多：Gemma 3 27B 在表 6 是 29.7，表 18 是 39.0; 4B 是 12.6 对 23.0；Gemma 2 27B 是 20.4 对 29.0. HiddenMath 也不同：Gemma 3 27B 是 60.3 对 56.0，Gemma 2 27B 是 14.8 对 12.0。第 25 页表 21 只写了 LiveCodeBench 是 「Average over 8 samples」，0-shot 加 CoT，本文没解释两表为何不同。好在 4B 对 Gemma 2 27B 在这两项上的胜负方向两表一致：LiveCodeBench 都输，HiddenMath 都赢。

![Image block](images/p06-figure-2-summary-of-the-performance-of-different-pre.png)

Figure 2 | Summary of the performance of different pre-trained models from Gemma 2 and 3 across general abilities. These plots are meant to give a simplified summary and details are in the appendix.

图 2 | Gemma 2 和 Gemma 3 不同预训练模型在通用能力上的表现汇总。这些图只是简化总结，细节见附录。

code, factuality, multilinguality, reasoning, and vision. The details of the performance across the different public benchmarks used in these plots are summarized in the appendix. Overall, we see that the new versions improve in most categories, despite the addition of vision. We particularly focus on multilinguality in this version, and this directly impacts the quality of our models. However, despite the use of decontamination techniques, there is always a risk of contamination of these probes (Mirzadeh et al., 2024), making more definitive conclusions harder to assess.

我们在预训练期间用若干标准基准作为探针，确保模型掌握通用能力。图 2 比较了 Gemma 2 和 Gemma 3 预训练模型在这些通用能力上的质量，即科学，代码，事实性，多语言，推理和视觉。这些图所用各公开基准的详细表现汇总在附录。总体来看，尽管加入了视觉，新版本在大多数类别上都有提升。这一版我们特别关注多语言，这直接影响模型质量。不过，尽管用了去污染技术，这些探针始终有被污染的风险（Mirzadeh et al., 2024），因此更确定的结论难以评估。

> **看表：** 图 2 的三张雷达图，每张比的是同尺寸吗？
> 不全是。按图 2 的图例，第一张是 Gemma 2 2B 对 Gemma 3 4B，第二张是 Gemma 2 9B 对 Gemma 3 12B，只有第三张是 27B 对 27B. 前两张的新模型都比旧模型大，「大多数类别有提升」 在这两张里含有尺寸差。同尺寸的第三张里，Code 一角两代几乎重合，与第 20 页表 10 后 「代码在 27B 上没有提升」 的说法一致。Vision 一角的差距来自 Gemma 2 没有视觉能力，不来自改进。

## 5.2. Local:Global attention layers

**5.2. Local:Global attention 层**

We measure the impact of changes to local and global self-attention layers on performance and memory consumption during inference.

我们测量 local 与 global self-attention 层的改动对性能和推理内存占用的影响。

**Local:Global ratio.** In Fig. 3, we compare differ-

![Chart block](images/p06-figure-3-impact-of-local-global-ratio-on-the-perplexity.png)

Figure 3 | Impact of Local:Global ratio on the perplexity on a validation set. The impact is minimal, even with 7-to-1 local to global. This ablation is run with text-only models.

图 3 | Local:Global 比例对验证集困惑度的影响。影响很小，即使 local 对 global 是 7 比 1。这个消融用纯文本模型做。

ent ratios of local to global attention layers. 1:1 is used in Gemma 2 models, and 5:1 is used in Gemma 3. We observe minimal impact on perplexity when changing this ratio.

**Local:Global 比例。** 图 3 比较了 local 与 global attention 层的不同比例。Gemma 2 用 1:1，Gemma 3 用 5:1。改变这个比例对困惑度的影响很小。

> **确认：** 图 3 的 「影响很小」 有多小，在哪些模型上？
> 图 3 纵轴是困惑度差值，以 1:1 为零点，只画到正负 0.1。从图上读，2B 在 3:1 略高，5:1 约低 0.02, 7:1 约高 0.03; 9B 在 3:1 到 7:1 都略低于零点。图例只有 2B 和 9B 两条线，图注说是纯文本模型。本文没给零点处的绝对困惑度，这些差值折合多少相对变化算不出来。能确认的是：5:1 的依据来自 2B 和 9B，不是在 1B，4B，12B，27B 上逐个验证的。

**Sliding window size.** In Fig. 4, we compare different sliding window sizes for the local at-

<!-- page 7 of 25 -->

Gemma 3 Technical Report

tention layers in different global:local ratio configurations. The sliding window can be reduced significantly without impacting perplexity.

**Sliding window 大小。** 图 4 在不同的 global:local 比例配置下，比较 local attention 层取不同 sliding window 大小的效果。sliding window 可以大幅缩小而不影响困惑度。

![Chart block](images/p07-figure-4-impact-of-sliding-window-size-on-perplexity.png)

Figure 4 | Impact of Sliding Window size on perplexity measured on a validation set. We consider 2 2B models, with 1:1 and 1:3 local to global layer ratios. This ablation is run with text-only models.

图 4 | sliding window 大小对验证集困惑度的影响。我们考虑两个 2B 模型，local 对 global 的层比例分别为 1:1 和 1:3。这个消融用纯文本模型做。

> **回看：** 图 4 图注写 「1:3 local to global」，到底是几个 local 配一个 global?
> 图 4 自己的图例是 「2B L:G=3:1」，即 3 个 local 配 1 个 global，图注的 「1:3 local to global」 顺序写反了。第 7 页正文又写成 「global:local ratio」，图 5 的横轴标签只写 「1:3」。结合第 6 页 「Gemma 3 用 5:1」 的写法（local 在前），图 4 和图 5 里的这个配置应读作每 1 个 global 配 3 个 local。图 4 纵轴只有正负 0.02，以窗口 1024 为零点；3:1 那条线在 512 处反而低约 0.019。

**Impact on KV cache memory.** In Fig. 5, we show the balance between the memory used by the model and the KV cache during inference with a context of 32k tokens. The “global only” configuration is the standard configuration used across most dense models. The “1:1, $s_{W}=4096$ is used in Gemma 2. We observe that the “global only” configuration results in a memory overhead of 60%, while this is reduced to less than 15% with 1:3 and sliding windows of 1024 $(  " \mathrm{sw} = 1024  "  )$ In Fig. 6, we compute the memory used by the KV cache as a function of the context length with either our 2B architecture (L:G=5:1, sw=1024) versus a “global only” 2B model.

**对 KV cache 内存的影响。** 图 5 展示了在 32k token 上下文下推理时，模型本身和 KV cache 所用内存之间的平衡。「global only」 配置是大多数 dense 模型采用的标准配置。「1:1, sw=4096」 是 Gemma 2 用的配置。我们观察到 「global only」 配置带来 60% 的内存开销，而用 1:3 和 1024 的 sliding window (「sw=1024」) 时，这个开销降到 15% 以下。图 6 计算了 KV cache 所用内存随上下文长度的变化，对比我们的 2B 架构（L:G=5:1, sw=1024）和一个 「global only」 的 2B 模型。

![Chart block](images/p07-figure-5-model-versus-kv-cache-memory-during-inference.png)

Figure 5 | Model versus KV cache memory during inference with a pre-fill KV cache of size 32k. We consider a 2B model with different local to global ratios and sliding window sizes (sw). We compare to global only, which is the standard used in Gemma 1 and Llama. This ablation is run with a text-only model.

图 5 | 推理时模型内存与 KV cache 内存的对比，预填充 KV cache 大小为 32k. 我们考虑一个 2B 模型，采用不同的 local 对 global 比例和 sliding window 大小（sw）。对比对象是 global only，这是 Gemma 1 和 Llama 采用的标准。这个消融用纯文本模型做。

> **拆开：** 图 5 的 60% 和 15% 各对应哪根柱子？有没有 Gemma 3 实际用的 5:1?
> 从图 5 读：模型本身约 3.3 GB，五根柱子一样高。global only 的 KV cache 约 1.75 GB，约为模型的 53%，正文写 60%；1:3 sw=1024 的 KV cache 约 0.45 GB，约 14%，对应正文 「less than 15%」。图 5 里没有 5:1 的柱子。5:1 只出现在图 6: 128K 时 global only 约 7 GB，5:1 sw=1024 约 1.1 GB。我按 「1/6 的层存全长，5/6 的层只存 1024」 估算，5:1 在 128K 时约为 global only 的 17%，在 32K 时约 19%，与图 6 的读数接近。这些是读图和估算，不是原文数字。图 5 和图 6 都是 2B 纯文本模型，本文没给发布尺寸在 128K 下的 KV cache，第 3 页表 3 只给到 32,768。

## 5.3. Enabling long context

**5.3. 实现长上下文**

Instead of training with 128K sequences from scratch, we pre-train our models with 32K se-

![Chart block](images/p07-figure-6-kv-cache-memory-versus-context-length-we-show.png)

Figure 6 | KV cache memory versus context length. We show the memory usage of the KV cache for our architecture (L:G=5:1, sw=1024) and a transformer with global attention only – as used in LLaMa or Gemma 1.

图 6 | KV cache 内存随上下文长度的变化。我们展示本架构（L:G=5:1, sw=1024）与只用 global attention 的 transformer（LLaMa 或 Gemma 1 的做法）的 KV cache 内存占用。

quences and then scale the 4B, 12B, and 27B models up to 128K tokens at the end of pre-training while rescaling RoPE (Chen et al., 2023). We find a scaling factor of 8 to work well in practice. Note that compared to Gemma 2, we have also increased the RoPE base frequency of global self-attention layers from 10k to 1M, while keeping 10k for the local self-attention layers. In Figure 7, we show the impact on perplexity for different context lengths. Our models generalize to 128K, but rapidly degrade as we continue to scale.

我们没有从头用 128K 序列训练，而是先用 32K 序列预训练，在预训练末期把 4B，12B 和 27B 模型的上下文扩到 128K token，同时重新调整 RoPE (Chen et al., 2023)。实践中我们发现因子取 8 效果好。注意与 Gemma 2 相比，我们还把 global self-attention 层的 RoPE base frequency 从 10k 提高到 1M，local self-attention 层保持 10k. 图 7 展示了不同上下文长度下对困惑度的影响。我们的模型能泛化到 128K，但上下文继续加长后会迅速变差。

![Chart block](images/p07-figure-7-long-context-performance-of-pre-trained-models.png)

Figure 7 | Long context performance of pre-trained models before and after RoPE rescaling.

图 7 | 预训练模型在调整 RoPE 前后的长上下文表现。

> **想：** 上下文从 32K 扩到 128K 是 4 倍，为什么 RoPE 的因子取 8?
> 本文没解释，第 7 页只说 「a scaling factor of 8 to work well in practice」。图 7 能给一点线索：调整后的实线上，4B 和 12B 的平均困惑度一直降到约 256K 才回升，27B 的最低点更靠后，而 32K 乘 8 正好是 256K. 这是我读图的推测，本文没有这样说。另外正文的 「rapidly degrade as we continue to scale」 从图上看发生在 256K 之后，128K 到 256K 之间困惑度还在降。图 7 的虚线是调整前的模型，12B 的虚线过了 32K 就迅速上升。

## 5.4. Small versus large teacher

**5.4. 小教师与大教师**

A common finding is that, to train a small model, it is preferable to distill from a smaller teacher.

一个常见结论是，训练小模型时，从较小的教师蒸馏更好。

<!-- page 8 of 25 -->

Gemma 3 Technical Report

![Chart block](images/p08-figure-8-small-versus-large-teacher-relative-difference.png)

Figure 8 | Small versus large teacher. Relative difference of perplexity when using a small and large teacher as a function of the token size of training. Smaller numbers means distilling from a larger teacher is better.

图 8 | 小教师与大教师。用小教师和大教师时困惑度的相对差值，随训练 token 量变化。数值越小，说明从大教师蒸馏越好。

We suspect this is because these studies are often performed in settings where the regularization effect of using a worse teacher surpasses the benefit of using a better teacher. We train a student with 2 teachers of different sizes, one large and one small, for different training horizons. In Fig. 8, we observe that for short training horizons, the smaller teacher is better, but the trend is reversed for longer training.

我们猜测原因是，这些研究常在这样的设置下进行：用较差教师带来的正则化效果超过了用更好教师的收益。我们用两个不同大小的教师（一大一小）在不同的训练长度下训练学生。在图 8 中我们观察到，训练长度短时小教师更好，训练更长时趋势反转。

> **问：** 图 8 的反转点在哪？两个教师多大？差值有多大？
> 本文没给两个教师和学生的尺寸。从图 8 读，横轴是总训练 token（单位十亿，对数轴），反转点大约在 20B 到 40B token 之间；约 300B token 时差值约 -0.007。纵轴全程在正负 0.008 以内，图注说是困惑度的相对差值。第 3 页写 Gemma 3 的预训练用 2T 到 14T token，远在图 8 横轴右端之外，按这条趋势应当用大教师，但本文没说实际用了哪个。

## 5.5. Vision encoder

**5.5. 视觉编码器**

| Resolution | DocVQA | InfoVQA | TextVQA |
| --- | --- | --- | --- |
| 256 | 31.9 | 23.1 | 44.1 |
| 448 | 45.4 | 31.6 | 53.5 |
| 896 | 59.8 | 33.7 | 58.0 |

Table 7 | Impact of image encoder input resolution. We measure performance using a short schedule 2B Gemma model on a few evaluation benchmarks to observe the effect of input image resolution on vision encoder pre-training.

表 7 | 图像编码器输入分辨率的影响。我们用一个短训练计划的 2B Gemma 模型在几个评测基准上测量，观察输入图像分辨率对视觉编码器预训练的影响。

**Impact of image resolution.** We use a vision encoder based on SigLIP (Zhai et al., 2023). The vision encoder is frozen, and only the language model is trained. Each image in this multimodal data is represented by 256 image tokens from the respective vision encoder. The higher resolution encoders thus use average pooling to reduce their output to 256 tokens. For instance, the 896

resolution encoder has a 4x4 average pooling on its output. As shown in Table 7, higher resolution encoders perform better than smaller ones.

**图像分辨率的影响。** 我们使用基于 SigLIP (Zhai et al., 2023) 的视觉编码器。视觉编码器冻结，只训练语言模型。这些多模态数据里的每张图像都由相应视觉编码器输出的 256 个图像 token 表示。因此更高分辨率的编码器用平均池化把输出降到 256 个 token。例如 896 分辨率的编码器在输出上做 4x4 平均池化。如表 7 所示，高分辨率编码器比低分辨率的表现更好。

|  | DocVQA | InfoVQA | TextVQA |
| --- | --- | --- | --- |
| 4B | 72.8 | 44.1 | 58.9 |
| 4B w/ P&amp;S | 81.0 | 57.0 | 60.8 |
| Δ | (+8.2) | (+12.9) | (+1.9) |
| 27B | 85.6 | 59.4 | 68.6 |
| 27B w/ P&amp;S | 90.4 | 76.4 | 70.2 |
| Δ | (+4.8) | (+17.0) | (+1.6) |

Table 8 | Impact of P&S. 4-shot evaluation results on the valid set, with and without P&S on a pre-trained checkpoint. Boosts are on tasks associated with images with varying aspect ratios, or involving reading text on images.

表 8 | P&S 的影响。在一个预训练检查点上，有无 P&S 时验证集上的 4-shot 评测结果。提升出现在图像长宽比多变或需要读图中文字的任务上。

**Pan & Scan.** P&S enables capturing images at close to their native aspect ratio and image resolution. In Table 8, we compare our 27B IT model with and without P&S. As expected, the ability to treat images with close to native resolution greatly helps with tasks that require some form of reading text on images, which is particularly important for visual language models.

**Pan & Scan.** P&S 让图像能以接近原始长宽比和分辨率的方式输入。表 8 比较了我们的 27B IT 模型有无 P&S 的结果。不出所料，以接近原始分辨率处理图像，对需要读图中文字的任务帮助很大，这对视觉语言模型尤其重要。

> **再看：** 表 8 标题说是预训练检查点，正文说 27B IT 模型，哪个对？
> 数字支持预训练检查点。表 8 中不带 P&S 的行与第 20 页表 11（预训练后的多模态表现）完全一致：4B 的 DocVQA，InfoVQA，TextVQA 是 72.8, 44.1, 58.9, 27B 是 85.6, 59.4, 68.6。表 11 标题也说 「without P&S」。所以正文 「27B IT model」 应是笔误，而且表 8 同时给了 4B. 提升幅度上 InfoVQA 最大（4B +12.9, 27B +17.0），TextVQA 最小（+1.9, +1.6）。

## 6. Memorization and Privacy

**6. 记忆与隐私**

Large language models may produce near-copies of some text used in training (Biderman et al., 2023; Carlini et al., 2021, 2022; Ippolito et al., 2022; Nasr et al., 2023). Several prior reports have released audits that quantify this risk by measuring the memorization rate (Anil et al., 2023; Chowdhery et al., 2022; Gemini Team, 2023, 2024; Gemma Team, 2024a,b; LLaMa Team, 2024). This “memorization rate”1is defined as the ratio of generations from the model that match its training data compared to all model generations using the following setup. We follow the methodology described in Gemma Team

<small><span class="docvortex-page-footnote" data-block-type="page_footnote" style="color:#6b7280"><sup>1</sup>"We do not state or imply [here] that a model "contains" its training data in the sense that there is a copy of that data in the model. Rather, a model memorizes attributes of its training data such that in certain cases it is statistically able to generate such training data when following rules and using information about features of its training data that it does contain."</span></small>

脚注 1: 「我们并不在此陈述或暗示模型 '包含' 其训练数据，即模型里存有那份数据的副本。更确切地说，模型记住了训练数据的某些属性，因此在某些情况下，当它按规则行事并利用它确实包含的训练数据特征信息时，在统计上能够生成这样的训练数据。」

<!-- page 9 of 25 -->

Gemma 3 Technical Report

![Chart block](images/p09-figure-9-total-memorization-rates-for-both-exact-and.png)

Figure 9 | Total memorization rates for both exact and approximate memorization. Gemma 3 models memorize significantly less than all prior models. \*No results for approximate memorization on these models.

图 9 | 精确记忆与近似记忆的总记忆率。Gemma 3 模型的记忆量明显少于之前所有模型。*这些模型没有近似记忆的结果。

(2024b) to measure it. Specifically, we subsample a large portion of training data distributed uniformly across different corpora and test for discoverable extraction (Nasr et al., 2023) of this content using a prefix of length 50 and a suffix of length 50. We denote text as either “exactly memorized” if all tokens in the continuation match the source suffix or “approximately memorized” if they match up to an edit distance of 10%.

大语言模型可能生成与部分训练文本近乎相同的内容（Biderman et al., 2023; Carlini et al., 2021, 2022; Ippolito et al., 2022; Nasr et al., 2023）。此前多份报告发布了审计结果，通过测量记忆率来量化这一风险（Anil et al., 2023; Chowdhery et al., 2022; Gemini Team, 2023, 2024; Gemma Team, 2024a,b; LLaMa Team, 2024）。这里的 「记忆率」 定义为：在下述设置下，模型生成中与其训练数据匹配的部分占全部生成的比例。我们沿用 Gemma Team (2024b) 描述的方法测量。具体来说，我们从训练数据中二次采样一大部分，使其在不同语料间均匀分布，用长度为 50 的前缀和长度为 50 的后缀测试这些内容能否被提取（discoverable extraction, Nasr et al., 2023）。如果续写的所有 token 都与源后缀一致，就记为 「精确记忆」；如果在 10% 编辑距离内一致，就记为 「近似记忆」。

Figure 9 compares the memorization rates across Gemma and Gemini models; these models are ordered in reverse chronological order, with the newest Gemma 3 models on the left. We find that Gemma 3 models memorize long-form text at a much lower rate than prior models (note the log y-axis). We observe only a marginal difference in the memorization rates between the 4B, 12B, and 27B models, with 1B memorizing less than these larger models. Further, we find that a larger proportion of text is characterized as approximately memorized, with a relative increase in approximate memorization compared to exact memorization of roughly 24x on average.

图 9 比较了 Gemma 和 Gemini 模型的记忆率；模型按时间倒序排列，最新的 Gemma 3 在最左边。我们发现 Gemma 3 模型记住长文本的比例比之前的模型低得多（注意 y 轴是对数轴）。4B，12B 和 27B 之间的记忆率只有很小差别，1B 比这些更大的模型记得更少。此外，被判为近似记忆的文本占比更大，近似记忆相对精确记忆平均约高 24 倍。

We also study the rate at which the generations may contain personal information. To identify potentially personal information, we use the Google Cloud Sensitive Data Protection (SDP) service.<sup>2</sup> SDP uses broad detection rules to identify text that may contain personal information. SDP is

designed to have high recall and does not consider the context in which the information may appear, which leads to many false positives. Thus, we are likely overestimating the true amount of potentially personal information contained in the outputs classified as memorized. SDP also provides broad severity levels: low, medium, and high. We classify text as personal if SDP classifies it as personal information at any severity level. We observed no personal information in the outputs characterized as memorization for all Gemma 3 models. This indicates a low rate of personal data, below our detection thresholds, in outputs classified as memorization.

我们还研究了生成内容可能包含个人信息的比例。为识别潜在个人信息，我们使用 Google Cloud Sensitive Data Protection (SDP) 服务。SDP 用宽泛的检测规则识别可能含个人信息的文本。SDP 的设计追求高召回，不考虑信息出现的上下文，因此误报很多。所以我们很可能高估了被判为记忆的输出中潜在个人信息的真实数量。SDP 还给出宽泛的严重程度等级：低，中，高。只要 SDP 在任一等级把文本判为个人信息，我们就把它算作个人信息。在所有 Gemma 3 模型被判为记忆的输出中，我们都没有观察到个人信息。这说明在被判为记忆的输出中，个人数据的比例很低，低于我们的检测阈值。

## 7. Responsibility, Safety, Security

**7. 责任，安全与安保**

Responsibility, safety, and security are of utmost importance in the development of Gemma models. To reduce risks to Gemma 3 users, we have continued to integrate enhanced internal safety processes that span the development workflow, in line with recent Google AI models (Gemini Team, 2024). This focuses on safety mitigation at training time, and robust and transparent model evaluations for the new image-to-text capabilities we have introduced.

名称：内部安全流程（与近期 Google AI 模型一致，Gemini Team, 2024）；对象：新增的图像到文本能力。分数：无。阈值：无。

## 7.1. Governance & Assessment

**7.1. 治理与评估**

Our approach to assessing the benefits and risks of Gemma is reflective of that outlined for Gemma 1 (Gemma Team, 2024a), taking into account the changes in supported modalities. We continue to believe that openness in AI can spread the benefits of these technologies across society, but must be evaluated against the risk of malicious uses that can cause harm on both individual and institutional levels (Weidinger et al., 2021). Since the inaugural Gemma launch, we have seen these models drive a number of socially beneficial applications, such as our own ShieldGemma 2, a 4B image safety classifier built with Gemma 3, which provides a ready-made solution for image safety, outputting safety labels across dangerous content, sexually explicit, and violence categories.

名称：Gemma 1 的评估做法（Gemma Team, 2024a）；Weidinger et al. (2021)；ShieldGemma 2，基于 Gemma 3 的 4B 图像安全分类器，标签类别 dangerous content, sexually explicit, violence。分数：无。阈值：无。

Releasing Gemma 3 models required specific attention to changes in model capabilities and

<small><span class="docvortex-page-footnote" data-block-type="page_footnote" style="color:#6b7280"><sup>2</sup>https://cloud.google.com/sensitive-data-protection</span></small>

脚注 2: SDP 服务的链接，见上。

<!-- page 10 of 25 -->

Gemma 3 Technical Report

close monitoring of the evolving risks of existing multimodal LLMs (Lin et al., 2024), as well as an understanding of the ways in which models are being used in the wild. Although we are yet to receive any reports of malicious use for Gemma, we remain committed to investigating any such reporting, and work with the academic and developer communities, as well as conduct our own monitoring, to flag such cases.

名称：Lin et al. (2024)。分数：恶意使用报告数 0（原文 「yet to receive any reports」）。阈值：无。

Despite advancements in capabilities, we believe that, given the number of larger powerful open models available, this release will have a negligible effect on the overall risk landscape.

名称：整体风险格局。评级：negligible。阈值：无。

## 7.2. Safety policies and train-time mitigations

**7.2. 安全政策与训练阶段缓解**

A key pillar of Gemma’s approach to safety is to align fine-tuned models with Google’s safety policies, in line with Gemini models (Gemini Team, 2023). They are designed to help prevent our models from generating harmful content, i.e.,

名称：Google 安全政策（与 Gemini 模型一致，Gemini Team, 2023）。

• Child sexual abuse and exploitation

• Revealing personally identifiable information that can lead to harm (e.g., Social Security numbers)

• Hate speech and harassment

• Dangerous or malicious content (including promoting self-harm or instructing in harmful activities)

• Sexually explicit content

• Medical advice that runs contrary to scientific or medical consensus

名称：儿童性虐待与剥削；可导致伤害的个人身份信息泄露（例如社会安全号码）；仇恨言论与骚扰；危险或恶意内容（含宣扬自残或指导有害活动）；露骨色情内容；违背科学或医学共识的医疗建议。

We undertook considerable safety filtering of our pre-training data to reduce the likelihood of our pre-trained and fine-tuned checkpoints producing harmful content. For fine-tuned models, we also use both SFT and RLHF to steer the model away from undesirable behavior.

名称：预训练数据安全过滤；SFT; RLHF。分数：无。阈值：无。

## 7.3. Assurance Evaluations

**7.3. 保障评测**

We also run our IT models through a set of baseline assurance evaluations to understand the potential harms that our models can cause. As we champion open models, we also recognize that the irreversible nature of weight releases requires

rigorous risk assessment. Our internal safety processes are designed accordingly, and for previous Gemma models we have also undertaken evaluations of capabilities relevant to extreme risks (Phuong et al., 2024; Shevlane et al., 2023). As we continue to develop and share open models, we will follow the heuristic that thoroughly evaluating a more capable model often provides sufficient assurance for less capable ones. As such, we prioritised a streamlined set of evaluations for Gemma 3, reserving in-depth dangerous capability assessments for cases where a specific model may present a potentially heightened risk (as described below on CBRN evaluations). We balance development speed with targeted safety testing, ensuring our evaluations are well-focused and efficient, while upholding the commitments laid out in our Frontier Safety Framework.

名称：baseline assurance evaluations；极端风险相关能力评测（Phuong et al., 2024; Shevlane et al., 2023）；CBRN 评测；Frontier Safety Framework。分数：无。阈值：无。

## Baseline Evaluations

**基线评测**

Baseline assurance captures the model violation rate for safety policies, using a large number of synthetic adversarial user queries, and human raters to label the answers as policy violating or not. Overall, Gemma 3 violation rate is significantly low overall on these safety policies.

名称：baseline assurance；指标：安全政策违规率；方法：合成对抗用户查询加人工评分。分数：原文 「significantly low」，无数值。阈值：无。

## Chemical, Biological, Radiological and Nuclear (CBRN) knowledge

**化学，生物，放射与核（CBRN）知识**

Owing to enhanced performance on STEM-related tasks, we evaluated knowledge relevant to biological, radiological, and nuclear risks using an internal dataset of closed-ended, knowledgebased multiple choice questions. For evaluations of chemical knowledge, we employed a closedended knowledge-based approach on chemical hazards developed by Macknight et al. Our evaluation suggests that the knowledge of Gemma 3 models in these domains is low.

名称：内部闭卷知识型多选题数据集（生物，放射，核）；Macknight et al. 的化学危害闭卷知识评测。分数：原文 「low」，无数值。阈值：无。

## 7.4. Our approach to responsible open models

**7.4. 负责任开放模型的做法**

Designing safe, secure, and responsible applications requires a system-level approach, working to mitigate risks associated with each specific use case and environment. We will continue to adopt assessments and safety mitigations proportionate to the potential risks from our models, and

<!-- page 11 of 25 -->

Gemma 3 Technical Report

will only share these with the community when we are confident that the benefits significantly outweigh the foreseeable risks.

名称：系统级方法；与潜在风险相称的评估和安全缓解。分数：无。阈值：无。

## 8. Discussion and Conclusion

**8. 讨论与结论**

In this work, we have presented Gemma 3, the latest addition to the Gemma family of open language models for text, image, and code. In this version, we focus on adding image understanding and long context while improving multilinguality and STEM-related abilities. Our model sizes and architectures are designed to be compatible with standard hardware, and most of our architecture improvements are tailored to fit this hardware while maintaining performance.

本文介绍了 Gemma 3，它是 Gemma 开放语言模型家族面向文本，图像和代码的最新成员。这一版我们着重加入图像理解和长上下文，同时提升多语言和 STEM 相关能力。模型尺寸和架构按标准硬件设计，大部分架构改进都是为了适配这些硬件，同时保持性能。

## References

**参考文献**

Realworldqa. [https://x.ai/news/grok-1.5v](https://x.ai/news/grok-1.5v).

M. Acharya, K. Kafle, and C. Kanan. Tallyqa: Answering complex counting questions. In AAAI, 2018.

R. Agarwal, N. Vieillard, Y. Zhou, P. Stanczyk, S. R. Garea, M. Geist, and O. Bachem. On-policy distillation of language models: Learning from self-generated mistakes. In ICLR, 2024.

J. Ainslie, J. Lee-Thorp, M. de Jong, Y. Zemlyanskiy, F. Lebrón, and S. Sanghai. Gqa: Training generalized multi-query transformer models from multi-head checkpoints. arXiv preprint arXiv:2305.13245, 2023.

R. Anil, G. Pereyra, A. Passos, R. Ormandi, G. E. Dahl, and G. E. Hinton. Large scale distributed neural network training through online distillation. arXiv preprint arXiv:1804.03235, 2018.

R. Anil, A. M. Dai, O. Firat, M. Johnson, D. Lepikhin, A. Passos, S. Shakeri, E. Taropa, P. Bailey, Z. Chen, et al. Palm 2 technical report. arXiv preprint arXiv:2305.10403, 2023.

M. Artetxe, S. Ruder, and D. Yogatama. On the cross-lingual transferability of monolingual representations. In ACL, 2020.

A. Asai, J. Kasai, J. H. Clark, K. Lee, E. Choi, and H. Hajishirzi. Xor qa: Cross-lingual open-retrieval question answering. arXiv preprint arXiv:2010.11856, 2020.

J. Austin, A. Odena, M. I. Nye, M. Bosma, H. Michalewski, D. Dohan, E. Jiang, C. J. Cai, M. Terry, Q. V. Le, and C. Sutton. Program synthesis with large language models. CoRR, abs/2108.07732, 2021.

P. Barham, A. Chowdhery, J. Dean, S. Ghemawat, S. Hand, D. Hurt, M. Isard, H. Lim, R. Pang, S. Roy, B. Saeta, P. Schuh, R. Sepassi, L. E. Shafey, C. A. Thekkath, and Y. Wu. Pathways: Asynchronous distributed dataflow for ml, 2022.

I. Beltagy, M. E. Peters, and A. Cohan. Longformer: The long-document transformer. arXiv preprint arXiv:2004.05150, 2020.

S. Biderman, U. Prashanth, L. Sutawika, H. Schoelkopf, Q. Anthony, S. Purohit, and E. Raff. Emergent and predictable memorization in large language models. NeurIPS, 36: 28072–28090, 2023.

Y. Bisk, R. Zellers, R. L. Bras, J. Gao, and Y. Choi. PIQA: reasoning about physical commonsense in natural language. CoRR, abs/1911.11641, 2019.

N. Carlini, F. Tramer, E. Wallace, M. Jagielski, A. Herbert-Voss, K. Lee, A. Roberts, T. Brown, D. Song, U. Erlingsson, et al. Extracting training data from large language models. In USENIX, 2021.

N. Carlini, D. Ippolito, M. Jagielski, K. Lee, F. Tramer, and C. Zhang. Quantifying memorization across neural language models. arXiv preprint arXiv:2202.07646, 2022.

Chameleon Team. Chameleon: Mixed-modal early-fusion foundation models. arXiv preprint arXiv:2405.09818, 2024.

M. Chen, J. Tworek, H. Jun, Q. Yuan, H. P. de Oliveira Pinto, J. Kaplan, H. Edwards, Y. Burda, N. Joseph, G. Brockman, A. Ray, R. Puri, G. Krueger, M. Petrov, H. Khlaaf,

参考文献条目保留原文，不译。

<!-- page 12 of 25 -->

Gemma 3 Technical Report

G. Sastry, P. Mishkin, B. Chan, S. Gray, N. Ryder, M. Pavlov, A. Power, L. Kaiser, M. Bavarian, C. Winter, P. Tillet, F. P. Such, D. Cummings, M. Plappert, F. Chantzis, E. Barnes, A. Herbert-Voss, W. H. Guss, A. Nichol, A. Paino, N. Tezak, J. Tang, I. Babuschkin, S. Balaji, S. Jain, W. Saunders, C. Hesse, A. N. Carr, J. Leike, J. Achiam, V. Misra, E. Morikawa, A. Radford, M. Knight, M. Brundage, M. Murati, K. Mayer, P. Welinder, B. McGrew, D. Amodei, S. McCandlish, I. Sutskever, and W. Zaremba. Evaluating large language models trained on code. CoRR, abs/2107.03374, 2021.

S. Chen, S. Wong, L. Chen, and Y. Tian. Extending context window of large language models via positional interpolation. arXiv preprint arXiv:2306.15595, 2023.

X. Chen, H. Fang, T.-Y. Lin, R. Vedantam, S. Gupta, P. Dollár, and C. L. Zitnick. Microsoft coco captions: Data collection and evaluation server. ArXiv, abs/1504.00325, 2015.

W.-L. Chiang, L. Zheng, Y. Sheng, A. N. Angelopoulos, T. Li, D. Li, H. Zhang, B. Zhu, M. Jordan, J. E. Gonzalez, and I. Stoica. Chatbot arena: An open platform for evaluating llms by human preference, 2024.

F. Chollet. On the measure of intelligence. arXiv preprint arXiv:1911.01547, 2019.

A. Chowdhery, S. Narang, J. Devlin, M. Bosma, G. Mishra, A. Roberts, P. Barham, H. W. Chung, C. Sutton, S. Gehrmann, P. Schuh, K. Shi, S. Tsvyashchenko, J. Maynez, A. Rao, P. Barnes, Y. Tay, N. Shazeer, V. Prabhakaran, E. Reif, N. Du, B. Hutchinson, R. Pope, J. Bradbury, J. Austin, M. Isard, G. Gur-Ari, P. Yin, T. Duke, A. Levskaya, S. Ghemawat, S. Dev, H. Michalewski, X. Garcia, V. Misra, K. Robinson, L. Fedus, D. Zhou, D. Ippolito, D. Luan, H. Lim, B. Zoph, A. Spiridonov, R. Sepassi, D. Dohan, S. Agrawal, M. Omernick, A. M. Dai, T. S. Pillai, M. Pellat, A. Lewkowycz, E. Moreira, R. Child, O. Polozov, K. Lee, Z. Zhou, X. Wang, B. Saeta, M. Diaz, O. Firat, M. Catasta, J. Wei, K. Meier-Hellstern, D. Eck, J. Dean, S. Petrov, and N. Fiedel. Palm: Scaling language modeling with pathways, 2022.

H. W. Chung, N. Constant, X. Garcia, A. Roberts, Y. Tay, S. Narang, and O. Firat. Unimax: Fairer and more effective language sampling for largescale multilingual pretraining, 2023.

C. Clark, K. Lee, M. Chang, T. Kwiatkowski, M. Collins, and K. Toutanova. Boolq: Exploring the surprising difficulty of natural yes/no questions. CoRR, abs/1905.10044, 2019.

K. Cobbe, V. Kosaraju, M. Bavarian, M. Chen, H. Jun, L. Kaiser, M. Plappert, J. Tworek, J. Hilton, R. Nakano, C. Hesse, and J. Schulman. Training verifiers to solve math word problems. CoRR, abs/2110.14168, 2021.

DeepSeek-AI. Deepseek-r1: Incentivizing reasoningt learning, 2025.

M. Dehghani, J. Djolonga, B. Mustafa, P. Padlewski, J. Heek, J. Gilmer, A. P. Steiner, M. Caron, R. Geirhos, I. Alabdulmohsin, et al. Scaling vision transformers to 22 billion parameters. In ICML, 2023.

D. Deutsch, E. Briakou, I. Caswell, M. Finkelstein, R. Galor, J. Juraska, G. Kovacs, A. Lui, R. Rei, J. Riesa, S. Rijhwani, P. Riley, E. Salesky, F. Trabelsi, S. Winkler, B. Zhang, and M. Freitag. Wmt24++: Expanding the language coverage of wmt24 to 55 languages & dialects, 2025.

A. Dosovitskiy. An image is worth 16x16 words: Transformers for image recognition at scale. arXiv preprint arXiv:2010.11929, 2020.

D. Dua, Y. Wang, P. Dasigi, G. Stanovsky, S. Singh, and M. Gardner. DROP: A reading comprehension benchmark requiring discrete reasoning over paragraphs. In ACL, 2019.

B. Fatemi, M. Kazemi, A. Tsitsulin, K. Malkan, J. Yim, J. Palowitch, S. Seo, J. Halcrow, and B. Perozzi. Test of time: A benchmark for evaluating llms on temporal reasoning. arXiv preprint arXiv:2406.09170, 2024.

X. Fu, Y. Hu, B. Li, Y. Feng, H. Wang, X. Lin, D. Roth, N. A. Smith, W.-C. Ma, and R. Krishna. Blink: Multimodal large language models can see but not perceive. ArXiv, abs/2404.12390, 2024.

参考文献续，条目保留原文。

<!-- page 13 of 25 -->

Gemma 3 Technical Report

J. Gehring, K. Zheng, J. Copet, V. Mella, T. Cohen, and G. Synnaeve. Rlef: Grounding code llms in execution feedback with reinforcement learning. arXiv preprint arXiv:2410.02089, 2024.

Gemini Team. Gemini: A family of highly capable multimodal models, 2023.

Gemini Team. Gemini 1.5: Unlocking multimodal understanding across millions of tokens of con text, 2024.

Gemma Team. Gemma: Open models based on gemini research and technology, 2024a.

Gemma Team. Gemma 2: Improving open language models at a practical size. arXiv preprint arXiv:2408.00118, 2024b.

O. Goldman, U. Shaham, D. Malkin, S. Eiger, A. Hassidim, Y. Matias, J. Maynez, A. M. Gilady, J. Riesa, S. Rijhwani, L. Rimell, I. Szpektor, R. Tsarfaty, and M. Eyal. Eclektic: a novel chal lenge set for evaluation of cross-lingual knowledge transfer, 2025.

N. Goyal, C. Gao, V. Chaudhary, P.-J. Chen, G. Wenzek, D. Ju, S. Krishnan, M. Ranzato, F. Guzmán, and A. Fan. The flores-101 evaluation benchmark for low-resource and multilingual machine translation. ACL, 2022.

Y. Goyal, T. Khot, D. Summers-Stay, D. Batra, and D. Parikh. Making the V in VQA matter: Elevating the role of image understanding in Visual Question Answering. In CVPR, 2017.

D. Hendrycks, C. Burns, S. Basart, A. Zou, M. Mazeika, D. Song, and J. Steinhardt. Measuring massive multitask language understanding. CoRR, abs/2009.03300, 2020.

D. Hendrycks, C. Burns, S. Kadavath, A. Arora, S. Basart, E. Tang, D. Song, and J. Steinhardt. Measuring mathematical problem solving with the math dataset. NeurIPS, 2021.

J. Hessel, A. Marasović, J. D. Hwang, L. Lee, J. Da, R. Zellers, R. Mankoff, and Y. Choi. Do androids laugh at electric sheep? humor" understanding" benchmarks from the new yorker caption contest. arXiv preprint arXiv:2209.06293, 2022.

G. Hinton, O. Vinyals, and J. Dean. Distilling the knowledge in a neural network. arXiv preprint arXiv:1503.02531, 2015.

C.-P. Hsieh, S. Sun, S. Kriman, S. Acharya, D. Rekesh, F. Jia, Y. Zhang, and B. Ginsburg. Ruler: What’s the real context size of your long-context language models? arXiv preprint arXiv:2404.06654, 2024.

D. Ippolito, F. Tramèr, M. Nasr, C. Zhang, M. Jagielski, K. Lee, C. A. Choquette-Choo, and N. Carlini. Preventing verbatim memorization in language models gives a false sense of privacy. arXiv preprint arXiv:2210.17546, 2022.

B. Jacob, S. Kligys, B. Chen, M. Zhu, M. Tang, A. Howard, H. Adam, and D. Kalenichenko. Quantization and training of neural networks for efficient integer-arithmetic-only inference. In CVPR, 2018.

M. Joshi, E. Choi, D. S. Weld, and L. Zettlemoyer. Triviaqa: A large scale distantly supervised challenge dataset for reading comprehension. CoRR, abs/1705.03551, 2017.

M. Kazemi, H. Alvari, A. Anand, J. Wu, X. Chen, and R. Soricut. Geomverse: A systematic evaluation of large models for geometric reasoning. arXiv preprint arXiv:2312.12241, 2023.

M. Kazemi, N. Dikkala, A. Anand, P. Dević, I. Dasgupta, F. Liu, B. Fatemi, P. Awasthi, D. Guo, S. Gollapudi, and A. Qureshi. Remi: A dataset for reasoning with multiple images. ArXiv, abs/2406.09175, 2024a.

M. Kazemi, Q. Yuan, D. Bhatia, N. Kim, X. Xu, V. Imbrasaite, and D. Ramachandran. Boardgameqa: A dataset for natural language reasoning with contradictory information. NeurIPS, 36, 2024b.

M. Kazemi, B. Fatemi, H. Bansal, J. Palowitch, C. Anastasiou, S. V. Mehta, L. K. Jain, V. Aglietti, D. Jindal, P. Chen, et al. Big-bench extra hard. arXiv preprint arXiv:2502.19187, 2025.

A. Kembhavi, M. Salvato, E. Kolve, M. Seo, H. Hajishirzi, and A. Farhadi. A diagram is worth a dozen images. ArXiv, abs/1603.07396, 2016.

参考文献续，条目保留原文。

<!-- page 14 of 25 -->

Gemma 3 Technical Report

E. Kıcıman, R. Ness, A. Sharma, and C. Tan. Causal reasoning and large language models: Opening a new frontier for causality. arXiv preprint arXiv:2305.00050, 2023.

T. Kudo and J. Richardson. SentencePiece: A simple and language independent subword tokenizer and detokenizer for neural text processing. 2018.

T. Kwiatkowski, J. Palomaki, O. Redfield, M. Collins, A. Parikh, C. Alberti, D. Epstein, I. Polosukhin, J. Devlin, K. Lee, K. Toutanova, L. Jones, M. Kelcey, M.-W. Chang, A. M. Dai, J. Uszkoreit, Q. Le, and S. Petrov. Natural questions: A benchmark for question answering research. ACL, 2019.

N. Lambert, J. Morrison, V. Pyatkin, S. Huang, H. Ivison, F. Brahman, L. J. V. Miranda, A. Liu, N. Dziri, S. Lyu, et al. T\" ulu 3: Pushing frontiers in open language model post-training. arXiv preprint arXiv:2411.15124, 2024.

Z. Lin, J. Cui, X. Liao, and X. Wang. Malla: Demystifying real-world large language model integrated malicious services, 2024.

H. Liu, C. Li, Q. Wu, and Y. J. Lee. Visual instruction tuning. NeurIPS, 36, 2024.

LLaMa Team. The llama 3 herd of models. arXiv preprint arXiv:2407.21783, 2024.

M. Luong, H. Pham, and C. D. Manning. Effective approaches to attention-based neural machine translation. 2015.

Macknight, Aung, and Gomes. Personal Communication.

K. Marino, M. Rastegari, A. Farhadi, and R. Mottaghi. Ok-vqa: A visual question answering benchmark requiring external knowledge. In CVPR, 2019.

A. Masry, X. L. Do, J. Q. Tan, S. Joty, and E. Hoque. ChartQA: A benchmark for question answering about charts with visual and logical reasoning. ACL, 2022.

M. Mathew, D. Karatzas, R. Manmatha, and C. V. Jawahar. Docvqa: A dataset for vqa on document images. WACV, 2020.

M. Mathew, V. Bagal, R. Tito, D. Karatzas, E. Valveny, and C. Jawahar. Infographicvqa. In WACV, 2022.

I. Mirzadeh, K. Alizadeh, H. Shahrokhi, O. Tuzel, S. Bengio, and M. Farajtabar. Gsm-symbolic: Understanding the limitations of mathematical reasoning in large language models. arXiv preprint arXiv:2410.05229, 2024.

M. Nasr, N. Carlini, J. Hayase, M. Jagielski, A. F. Cooper, D. Ippolito, C. A. Choquette-Choo, E. Wallace, F. Tramèr, and K. Lee. Scalable extraction of training data from (production) language models. arXiv preprint arXiv:2311.17035, 2023.

A. Nie, Y. Zhang, A. S. Amdekar, C. Piech, T. B. Hashimoto, and T. Gerstenberg. Moca: Measuring human-language model alignment on causal and moral judgment tasks. NeurIPS, 36, 2024.

R. Paiss, A. Ephrat, O. Tov, S. Zada, I. Mosseri, M. Irani, and T. Dekel. Teaching clip to count to ten. ICCV, 2023.

M. Phuong, M. Aitchison, E. Catt, S. Co-gan, A. Kaskasoli, V. Krakovna, D. Lindner, M. Rahtz, Y. Assael, S. Hodkinson, H. Howard, T. Lieberum, R. Kumar, M. A. Raad, A. Webson, L. Ho, S. Lin, S. Farquhar, M. Hutter, G. Deletang, A. Ruoss, S. El-Sayed, S. Brown, A. Dragan, R. Shah, A. Dafoe, and T. Shevlane. Evaluating frontier models for dangerous capabilities, 2024.

A. Radford, J. W. Kim, C. Hallacy, A. Ramesh, G. Goh, S. Agarwal, G. Sastry, A. Askell, P. Mishkin, J. Clark, et al. Learning transferable visual models from natural language supervision. In ICML, pages 8748–8763. PMLR, 2021.

A. Ramé, J. Ferret, N. Vieillard, R. Dadashi, L. Hussenot, P.-L. Cedoz, P. G. Sessa, S. Girgin, A. Douillard, and O. Bachem. WARP: On the benefits of weight averaged rewarded policies, 2024a.

A. Ramé, N. Vieillard, L. Hussenot, R. Dadashi, G. Cideron, O. Bachem, and J. Ferret. WARM: On the benefits of weight averaged reward models. In ICML, 2024b.

参考文献续，条目保留原文。

<!-- page 15 of 25 -->

Gemma 3 Technical Report

D. Rein, B. L. Hou, A. C. Stickland, J. Petty, R. Y. Pang, J. Dirani, J. Michael, and S. R. Bowman. Gpqa: A graduate-level google-proof q&a benchmark. ArXiv, abs/2311.12022, 2023.

J. Ren, S. Rajbhandari, R. Y. Aminabadi, O. Ruwase, S. Yang, M. Zhang, D. Li, and Y. He. Zero-offload: Democratizing billionscale model training. In USENIX, 2021.

A. Roberts, H. W. Chung, G. Mishra, A. Levskaya, J. Bradbury, D. Andor, S. Narang, B. Lester, C. Gaffney, A. Mohiuddin, et al. Scaling up models and data with t5x and seqio. JMLR, 2023.

N. Sachdeva, B. Coleman, W.-C. Kang, J. Ni, L. Hong, E. H. Chi, J. Caverlee, J. McAuley, and D. Z. Cheng. How to train data-efficient llms. arXiv preprint arXiv:2402.09668, 2024.

K. Sakaguchi, R. L. Bras, C. Bhagavatula, and Y. Choi. WINOGRANDE: an adversarial winograd schema challenge at scale. CoRR, abs/1907.10641, 2019.

E. Sánchez, B. Alastruey, C. Ropers, P. Stenetorp, M. Artetxe, and M. R. Costa-jussà. Linguini: A benchmark for language-agnostic linguistic reasoning. arXiv preprint arXiv:2409.12126, 2024.

M. Sap, H. Rashkin, D. Chen, R. L. Bras, and Y. Choi. Socialiqa: Commonsense reasoning about social interactions. CoRR, abs/1904.09728, 2019.

P. G. Sessa, R. Dadashi, L. Hussenot, J. Ferret, N. Vieillard, A. Ramé, B. Shariari, S. Perrin, A. Friesen, G. Cideron, S. Girgin, P. Stanczyk, A. Michi, D. Sinopalnikov, S. Ramos, A. Héliou, A. Severyn, M. Hoffman, N. Momchev, and O. Bachem. Bond: Aligning llms with best-of-n distillation, 2024.

K. Shah, N. Dikkala, X. Wang, and R. Panigrahy. Causal language modeling can elicit search and reasoning capabilities on logic puzzles. arXiv preprint arXiv:2409.10502, 2024.

T. Shevlane, S. Farquhar, B. Garfinkel, M. Phuong, J. Whittlestone, J. Leung, D. Kokotajlo, N. Marchal, M. Anderljung, N. Kolt, L. Ho, D. Siddarth, S. Avin, W. Hawkins, B. Kim, I. Gabriel,

V. Bolina, J. Clark, Y. Bengio, P. Christiano, and A. Dafoe. Model evaluation for extreme risks, 2023.

F. Shi, M. Suzgun, M. Freitag, X. Wang, S. Srivats, S. Vosoughi, H. W. Chung, Y. Tay, S. Ruder, D. Zhou, D. Das, and J. Wei. Language models are multilingual chain-of-thought reasoners. In ICLR, 2023.

A. Singh, V. Natarjan, M. Shah, Y. Jiang, X. Chen, D. Parikh, and M. Rohrbach. Towards vqa models that can read. In CVPR, 2019.

H. Singh, N. Gupta, S. Bharadwaj, D. Tewari, and P. Talukdar. Indicgenbench: a multilingual benchmark to evaluate generation capabilities of llms on indic languages. arXiv preprint arXiv:2404.16816, 2024a.

S. Singh, A. Romanou, C. Fourrier, D. I. Adelani, J. G. Ngui, D. Vila-Suero, P. Limkonchotiwat, K. Marchisio, W. Q. Leong, Y. Susanto, R. Ng, S. Longpre, W.-Y. Ko, M. Smith, A. Bosselut, A. Oh, A. F. T. Martins, L. Choshen, D. Ippolito, E. Ferrante, M. Fadaee, B. Ermis, and S. Hooker. Global mmlu: Understanding and addressing cultural and linguistic biases in multilingual evaluation, 2024b.

A. Steiner, A. S. Pinto, M. Tschannen, D. Keysers, X. Wang, Y. Bitton, A. Gritsenko, M. Minderer, A. Sherbondy, S. Long, S. Qin, R. Ingle, E. Bugliarello, S. Kazemzadeh, T. Mesnard, I. Alabdulmohsin, L. Beyer, and X. Zhai. PaliGemma 2: A Family of Versatile VLMs for Transfer. arXiv preprint arXiv:2412.03555, 2024.

M. Suzgun, N. Scales, N. Schärli, S. Gehrmann, Y. Tay, H. W. Chung, A. Chowdhery, Q. V. Le, E. H. Chi, D. Zhou, and J. Wei. Challenging big-bench tasks and whether chain-of-thought can solve them, 2022.

G. Tyen, H. Mansoor, P. Chen, T. Mak, and V. Cărbune. Llms cannot find reasoning errors, but can correct them! arXiv preprint arXiv:2311.08516, 2023.

A. Vaswani, N. Shazeer, N. Parmar, J. Uszkoreit, L. Jones, A. N. Gomez, L. Kaiser, and I. Polosukhin. Attention is all you need. 2017.

参考文献续，条目保留原文。

<!-- page 16 of 25 -->

Gemma 3 Technical Report

K. Vodrahalli, S. Ontanon, N. Tripuraneni, K. Xu, S. Jain, R. Shivanna, J. Hui, N. Dikkala, M. Kazemi, B. Fatemi, et al. Michelangelo: Long context evaluations beyond haystacks via latent structure queries. arXiv preprint arXiv:2409.12640, 2024.

Y. Wang, X. Ma, G. Zhang, Y. Ni, A. Chandra, S. Guo, W. Ren, A. Arulraj, X. He, Z. Jiang, et al. Mmlu-pro: A more robust and challenging multi-task language understanding benchmark. In NeurIPS, 2024.

L. Weidinger, J. Mellor, M. Rauh, C. Griffin, J. Uesato, P.-S. Huang, M. Cheng, M. Glaese, B. Balle, A. Kasirzadeh, Z. Kenton, S. Brown, W. Hawkins, T. Stepleton, C. Biles, A. Birhane, J. Haas, L. Rimell, L. A. Hendricks, W. Isaac, S. Legassick, G. Irving, and I. Gabriel. Ethical and social risks of harm from language models, 2021.

C. White, S. Dooley, M. Roberts, A. Pal, B. Feuer, S. Jain, R. Shwartz-Ziv, N. Jain, K. Saifullah, S. Naidu, et al. Livebench: A challenging, contamination-free llm benchmark. arXiv preprint arXiv:2406.19314, 2024.

M. Wortsman, P. J. Liu, L. Xiao, K. Everett, A. Alemi, B. Adlam, J. D. Co-Reyes, I. Gur, A. Kumar, R. Novak, et al. Small-scale proxies for large-scale transformer training instabilities. arXiv preprint arXiv:2309.14322, 2023.

XLA. Xla: Optimizing compiler for tensorflow, 2019. URL [https://www.tensorflow.org/xla](https://www.tensorflow.org/xla).

Y. Xu, H. Lee, D. Chen, B. A. Hechtman, Y. Huang, R. Joshi, M. Krikun, D. Lepikhin, A. Ly, M. Maggioni, R. Pang, N. Shazeer, S. Wang, T. Wang, Y. Wu, and Z. Chen. GSPMD: general and scalable parallelization for ML computation graphs. 2021.

Y. Yamada, Y. Bao, A. K. Lampinen, J. Kasai, and I. Yildirim. Evaluating spatial understanding of large language models. arXiv preprint arXiv:2310.14540, 2023.

K. Yang, O. Russakovsky, and J. Deng. Spatialsense: An adversarially crowdsourced

benchmark for spatial relation recognition. ICCV, 2019.

X. Yue, Y. Ni, K. Zhang, T. Zheng, R. Liu, G. Zhang, S. Stevens, D. Jiang, W. Ren, Y. Sun, C. Wei, B. Yu, R. Yuan, R. Sun, M. Yin, B. Zheng, Z. Yang, Y. Liu, W. Huang, H. Sun, Y. Su, and W. Chen. Mmmu: A massive multi-discipline multimodal understanding and reasoning benchmark for expert agi. CVPR, 2023.

R. Zellers, A. Holtzman, Y. Bisk, A. Farhadi, and Y. Choi. HellaSwag: Can a machine really finish your sentence? In ACL, 2019.

X. Zhai, B. Mustafa, A. Kolesnikov, and L. Beyer. Sigmoid loss for language image pre-training. In CVPR, 2023.

B. Zhang and R. Sennrich. Root mean square layer normalization. 2019.

J. Zhang, L. Jain, Y. Guo, J. Chen, K. L. Zhou, S. Suresh, A. Wagenmaker, S. Sievert, T. Rogers, K. Jamieson, et al. Humor in ai: Massive scale crowd-sourced preferences and bench marks for cartoon captioning. arXiv preprint arXiv:2406.10522, 2024.

W. Zhong, R. Cui, Y. Guo, Y. Liang, S. Lu, Y. Wang, A. Saied, W. Chen, and N. Duan. Agieval: A human-centric benchmark for evaluating foundation models, 2023.

参考文献续，条目保留原文。

<!-- page 17 of 25 -->

Gemma 3 Technical Report

**Core contributors** Aishwarya Kamath∗ Johan Ferret<sup>∗</sup> Shreya Pathak∗ Nino Vieillard∗ Ramona Merhej<sup>∗</sup> Sarah Perrin<sup>∗</sup> Tatiana Matejovicova<sup>∗</sup> Alexandre Ramé∗ Morgane Rivière<sup>∗</sup> Louis Rouillard∗ Thomas Mesnard∗ Geoffrey Cideron<sup>∗</sup> Jean-bastien Grill∗ Sabela Ramos<sup>∗</sup> Edouard Yvinec<sup>∗</sup> Michelle Casbon<sup>∗</sup> Etienne Pot Ivo Penchev Gaël Liu Francesco Visin Kathleen Kenealy Lucas Beyer Xiaohai Zhai Anton Tsitsulin Robert Busa-Fekete Alex Feng Noveen Sachdeva Benjamin Coleman Yi Gao Basil Mustafa Iain Barr Emilio Parisotto David Tian Matan Eyal Colin Cherry Jan-Thorsten Peter Danila Sinopalnikov Surya Bhupatiraju Rishabh Agarwal Mehran Kazemi Dan Malkin Ravin Kumar David Vilar Idan Brusilovsky Jiaming Luo Andreas Steiner

**Contributors (alphabetical order)** Abe Friesen Abhanshu Sharma Abheesht Sharma Adi Mayrav Gilady Adrian Goedeckemeyer Alaa Saade Alex Feng Alexander Kolesnikov Alexei Bendebury Alvin Abdagic Amit Vadi András György André Susano Pinto Anil Das Ankur Bapna Antoine Miech Antoine Yang Antonia Paterson Ashish Shenoy Ayan Chakrabarti Bilal Piot Bo Wu Bobak Shahriari Bryce Petrini Charlie Chen Charline Le Lan Christopher A. Choquette-Choo CJ Carey Cormac Brick Daniel Deutsch Danielle Eisenbud Dee Cattle Derek Cheng Dimitris Paparas Divyashree Shivakumar Sreepathihalli Doug Reid Dustin Tran Dustin Zelle Eric Noland Erwin Huizenga Eugene Kharitonov Frederick Liu Gagik Amirkhanyan Glenn Cameron Hadi Hashemi Hanna Klimczak-Plucińska Harman Singh Harsh Mehta

<small><span class="docvortex-page-footnote" data-block-type="page_footnote" style="color:#6b7280">∗co-first authors.</span></small>

名单人名保留原文。Core contributors 为核心贡献者，Contributors (alphabetical order) 为按字母序排列的贡献者。脚注：∗ 为共同第一作者。

<!-- page 18 of 25 -->

Gemma 3 Technical Report

Harshal Tushar Lehri Hussein Hazimeh Ian Ballantyne Idan Szpektor Ivan Nardini Jean Pouget-Abadie Jetha Chan Joe Stanton John Wieting Jonathan Lai Jordi Orbay Joseph Fernandez Josh Newlan Ju-yeong Ji Jyotinder Singh Kat Black Kathy Yu Kevin Hui Kiran Vodrahalli Klaus Greff Linhai Qiu Marcella Valentine Marina Coelho Marvin Ritter Matt Hoffman Matthew Watson Mayank Chaturvedi Michael Moynihan Min Ma Nabila Babar Natasha Noy Nathan Byrd Nick Roy Nikola Momchev Nilay Chauhan Noveen Sachdeva Oskar Bunyan Pankil Botarda Paul Caron Paul Kishan Rubenstein Phil Culliton Philipp Schmid Pier Giuseppe Sessa Pingmei Xu Piotr Stanczyk Pouya Tafti Rakesh Shivanna Renjie Wu Renke Pan

Reza Rokni Rob Willoughby Rohith Vallu Ryan Mullins Sammy Jerome Sara Smoot Sertan Girgin Shariq Iqbal Shashir Reddy Shruti Sheth Siim Põder Sijal Bhatnagar Sindhu Raghuram Panyam Sivan Eiger Susan Zhang Tianqi Liu Trevor Yacovone Tyler Liechty Uday Kalra Utku Evci Vedant Misra Vincent Roseberry Vlad Feinberg Vlad Kolesnikov Woohyun Han Woosuk Kwon Xi Chen Yinlam Chow Yuvein Zhu Zichuan Wei Zoltan Egyed

**Support** Victor Cotruta Minh Giang Phoebe Kirk Anand Rao Kat Black Nabila Babar Jessica Lo Erica Moreira Luiz Gustavo Martins Omar Sanseviero Lucas Gonzalez Zach Gleicher Tris Warkentin

**Sponsors**

贡献者名单续，人名保留原文。Support 为支持团队，Sponsors 为赞助人，赞助人名单接到下一页。

<!-- page 19 of 25 -->

Gemma 3 Technical Report

Vahab Mirrokni Evan Senter Eli Collins Joelle Barral Zoubin Ghahramani Raia Hadsell Yossi Matias D. Sculley Slav Petrov Noah Fiedel Noam Shazeer Oriol Vinyals Jeff Dean Demis Hassabis Koray Kavukcuoglu Clement Farabet

**Technical advisors** Elena Buchatskaya Jean-Baptiste Alayrac Rohan Anil Dmitry (Dima) Lepikhin Sebastian Borgeaud Olivier Bachem

**Lead** Armand Joulin

**Technical leads**

Alek Andreev

Cassidy Hardin

Robert Dadashi

Léonard Hussenot

名单续。页首为赞助人名单的后半。Technical advisors 为技术顾问，Lead 为负责人，Technical leads 为技术负责人。

<!-- page 20 of 25 -->

Gemma 3 Technical Report

## Appendix

**附录**

Details of pre-trained performances.

预训练模型表现的细节。

<table><tr><td rowspan="2"></td><td colspan="3">Gemma 2</td><td colspan="4">Gemma 3</td></tr><tr><td>2B</td><td>9B</td><td>27B</td><td>1B</td><td>4B</td><td>12B</td><td>27B</td></tr><tr><td>HellaS</td><td>72.9</td><td>81.9</td><td>86.4</td><td>62.3</td><td>77.2</td><td>84.2</td><td>85.6</td></tr><tr><td>BoolQ</td><td>75.6</td><td>77.5</td><td>76.2</td><td>63.2</td><td>72.3</td><td>78.8</td><td>82.4</td></tr><tr><td>PIQA</td><td>78.1</td><td>81.9</td><td>83.5</td><td>73.8</td><td>79.6</td><td>81.8</td><td>83.3</td></tr><tr><td>SIQA</td><td>51.8</td><td>53.3</td><td>53.8</td><td>48.9</td><td>51.9</td><td>53.4</td><td>54.9</td></tr><tr><td>TQA</td><td>60.2</td><td>76.5</td><td>83.8</td><td>39.8</td><td>65.8</td><td>78.2</td><td>85.5</td></tr><tr><td>NQ</td><td>17.2</td><td>29.2</td><td>34.7</td><td>9.48</td><td>20.0</td><td>31.4</td><td>36.1</td></tr><tr><td>ARC-C</td><td>55.8</td><td>69.1</td><td>71.4</td><td>38.4</td><td>56.2</td><td>68.9</td><td>70.6</td></tr><tr><td>ARC-E</td><td>80.6</td><td>88.3</td><td>88.6</td><td>73.0</td><td>82.4</td><td>88.3</td><td>89.0</td></tr><tr><td>WinoG</td><td>65.4</td><td>73.9</td><td>79.4</td><td>58.2</td><td>64.7</td><td>74.3</td><td>78.8</td></tr><tr><td>BBH</td><td>42.4</td><td>69.4</td><td>74.8</td><td>28.4</td><td>50.9</td><td>72.6</td><td>77.7</td></tr><tr><td>Drop</td><td>53.2</td><td>71.5</td><td>75.2</td><td>42.4</td><td>60.1</td><td>72.2</td><td>77.2</td></tr></table>

Table 9 | Factuality, common-sense performance and reasoning after pre-training phase.

表 9 | 预训练阶段后的事实性，常识和推理表现。

**Factuality and common-sense.** In Table 9, we report the performance of our new pre-trained benchmarks compared to previous versions. We consider several standard benchmarks, namely HellaSwag (Zellers et al., 2019), BoolQ (Clark et al., 2019), PIQA (Bisk et al., 2019), SIQA (Sap et al., 2019), TriviaQA (Joshi et al., 2017), Natural Questions (Kwiatkowski et al., 2019), ARC-C and ARC-E (Chollet, 2019), WinoGrande (Sakaguchi et al., 2019), BBH (Suzgun et al., 2022), DROP (Dua et al., 2019). Evaluation details are described in Table 19. Overall, our models are in the same ballpark as Gemma 2, which is encouraging since these abilities are not the focus of the improvements brought in this version.

**事实性与常识。** 表 9 报告了新预训练模型在这些基准上相对之前版本的表现。我们考虑若干标准基准，即 HellaSwag (Zellers et al., 2019), BoolQ (Clark et al., 2019), PIQA (Bisk et al., 2019), SIQA (Sap et al., 2019), TriviaQA (Joshi et al., 2017), Natural Questions (Kwiatkowski et al., 2019)，ARC-C 和 ARC-E (Chollet, 2019), WinoGrande (Sakaguchi et al., 2019), BBH (Suzgun et al., 2022), DROP (Dua et al., 2019)。评测细节见表 19。总体上，我们的模型与 Gemma 2 处于同一水平，这让人放心，因为这些能力不是这一版改进的重点。

**STEM and code.** The details of our performance on STEM and Code are in Table 10. We consider several standard benchmarks, namely MMLU (Hendrycks et al., 2020), MMLU-Pro (Wang et al., 2024), AGIEval (Zhong et al., 2023), MATH (Hendrycks et al., 2021), GSM8K (Cobbe et al., 2021), GPQA (Rein et al., 2023), MBPP (Austin et al., 2021), HumanEval (Chen et al., 2021). Evaluation details are described in Table 19. Overall we see a consistent improvement over STEM abilities across our

<table><tr><td rowspan="2"></td><td colspan="3">Gemma 2</td><td colspan="3">Gemma 3</td></tr><tr><td>2B</td><td>9B</td><td>27B</td><td>4B</td><td>12B</td><td>27B</td></tr><tr><td>MMLU</td><td>52.2</td><td>71.2</td><td>75.2</td><td>59.6</td><td>74.5</td><td>78.6</td></tr><tr><td>MMLUpro</td><td>22.2</td><td>43.7</td><td>49.4</td><td>29.2</td><td>45.3</td><td>52.2</td></tr><tr><td>AGIE</td><td>31.6</td><td>53.1</td><td>55.1</td><td>42.1</td><td>57.4</td><td>66.2</td></tr><tr><td>MATH</td><td>16.4</td><td>36.4</td><td>42.1</td><td>24.2</td><td>43.3</td><td>50.0</td></tr><tr><td>GSM8K</td><td>25.0</td><td>70.2</td><td>74.6</td><td>38.4</td><td>71.0</td><td>82.6</td></tr><tr><td>GPQA Diamond</td><td>12.5</td><td>24.8</td><td>26.3</td><td>15.0</td><td>25.4</td><td>24.3</td></tr><tr><td>MBPP</td><td>31.0</td><td>51.2</td><td>60.8</td><td>46.0</td><td>60.4</td><td>65.6</td></tr><tr><td>HumanE</td><td>19.5</td><td>40.2</td><td>51.2</td><td>36.0</td><td>45.7</td><td>48.8</td></tr></table>

Table 10 | STEM and code performance after pre-training phase.

表 10 | 预训练阶段后的 STEM 与代码表现。

pre-trained models. On code, we see a similar improvement for the 4B and 12B models but not on the 27B.

**STEM 与代码。** STEM 和代码上的详细表现见表 10。我们考虑若干标准基准，即 MMLU (Hendrycks et al., 2020), MMLU-Pro (Wang et al., 2024), AGIEval (Zhong et al., 2023), MATH (Hendrycks et al., 2021), GSM8K (Cobbe et al., 2021), GPQA (Rein et al., 2023), MBPP (Austin et al., 2021), HumanEval (Chen et al., 2021)。评测细节见表 19。总体上，我们的预训练模型在 STEM 能力上有一致的提升。代码方面，4B 和 12B 有类似的提升，27B 没有。

> **看表：** 表 10 里 27B 的代码到底有没有提升？STEM 是不是每项都升？
> 代码两项方向相反。Gemma 3 27B 的 HumanEval 是 48.8，低于 Gemma 2 27B 的 51.2；MBPP 是 65.6，高于 60.8。所以 「27B 没有提升」 只对 HumanEval 成立。STEM 也不是全升：GPQA Diamond 上 Gemma 3 27B 是 24.3，低于 Gemma 2 27B 的 26.3，也低于 Gemma 3 12B 的 25.4。表 10 没有 1B 一列，表 9 和表 13 有。尺寸对照上，表 10 是 2B，9B，27B 对 4B，12B，27B，只有 27B 同尺寸。

|  | 4B | 12B | 27B |
| --- | --- | --- | --- |
| COCO caption | 102 | 111 | 116 |
| DocVQA | 72.8 | 82.3 | 85.6 |
| InfoVQA | 44.1 | 54.8 | 59.4 |
| MMMU | 39.2 | 50.3 | 56.1 |
| TextVQA | 58.9 | 66.5 | 68.6 |
| RealWorldQA | 45.5 | 52.2 | 53.9 |
| ReMI | 27.3 | 38.5 | 44.8 |
| AI2D | 63.2 | 75.2 | 79.0 |
| ChartQA | 63.6 | 74.7 | 76.3 |
| VQAv2 | 63.9 | 71.2 | 72.9 |
| BLINK | 38.0 | 35.9 | 39.6 |
| OK-VQA | 51.0 | 58.7 | 60.2 |
| TallyQA | 42.5 | 51.8 | 54.3 |
| SpatialSense VQA | 50.9 | 60.0 | 59.4 |
| CountBench VQA | 26.1 | 17.8 | 68.0 |

Table 11 | Multimodal performance after pre-training phase. The scores are on the val split of each dataset without P&S.

表 11 | 预训练阶段后的多模态表现。分数都在各数据集的 val 划分上，不使用 P&S。

**Image understanding.** In Table 11, we report performance across a variety of visual question answer benchmarks for the different models that were trained with a vision encoder, namely COCO Caption (Chen et al., 2015), DocVQA (Mathew et al., 2020), InfographicVQA (Mathew et al., 2022), MMMU (Yue et al., 2023), TextVQA (Singh et al., 2019), RealWorldQA (Rea), ReMI (Kazemi et al., 2024a),

<!-- page 21 of 25 -->

Gemma 3 Technical Report

AI2D (Kembhavi et al., 2016), ChartQA (Masry et al., 2022), VQA v2 (Goyal et al., 2017), BLINK (Fu et al., 2024), OK-VQA (Marino et al., 2019), TallyQA (Acharya et al., 2018), SpatialSense VQA (Yang et al., 2019), CountBench VQA (Paiss et al., 2023). Evaluation details are described in Table 20.

**图像理解。** 表 11 报告了用视觉编码器训练的各模型在多种视觉问答基准上的表现，即 COCO Caption (Chen et al., 2015), DocVQA (Mathew et al., 2020), InfographicVQA (Mathew et al., 2022), MMMU (Yue et al., 2023), TextVQA (Singh et al., 2019), RealWorldQA (Rea), ReMI (Kazemi et al., 2024a), AI2D (Kembhavi et al., 2016), ChartQA (Masry et al., 2022), VQA v2 (Goyal et al., 2017), BLINK (Fu et al., 2024), OK-VQA (Marino et al., 2019), TallyQA (Acharya et al., 2018), SpatialSense VQA (Yang et al., 2019), CountBench VQA (Paiss et al., 2023)。评测细节见表 20。

<table><tr><td rowspan="2"></td><td colspan="3">PaliGemma 2</td><td colspan="3">Gemma 3</td></tr><tr><td>2B</td><td>9B</td><td>27B</td><td>4B</td><td>12B</td><td>27B</td></tr><tr><td>DocVQA</td><td>81.6</td><td>86.3</td><td>85.1</td><td>86.1</td><td>89.0</td><td>89.5</td></tr><tr><td>InfoVQA</td><td>41.4</td><td>53.1</td><td>50.2</td><td>55.6</td><td>61.6</td><td>64.6</td></tr><tr><td>TextVQA</td><td>76.3</td><td>76.3</td><td>75.1</td><td>79.1</td><td>81.6</td><td>83.2</td></tr><tr><td>ChartQA</td><td>70.7</td><td>79.1</td><td>71.3</td><td>79.8</td><td>83.5</td><td>83.4</td></tr><tr><td>AI2D</td><td>76.0</td><td>84.4</td><td>84.6</td><td>80.9</td><td>85.6</td><td>86.5</td></tr><tr><td>OKVQA</td><td>64.1</td><td>68.6</td><td>70.6</td><td>65.2</td><td>69.3</td><td>71.1</td></tr><tr><td>CountBenchQA</td><td>82.0</td><td>85.3</td><td>87.4</td><td>79.4</td><td>83.5</td><td>87.8</td></tr><tr><td>COCO caption</td><td>143.</td><td>145.</td><td>145.</td><td>143.</td><td>143.</td><td>144.</td></tr><tr><td>VQAv2</td><td>84.8</td><td>85.8</td><td>85.8</td><td>84.1</td><td>84.9</td><td>85.1</td></tr><tr><td>Tally QA</td><td>80.6</td><td>82.4</td><td>82.1</td><td>79.0</td><td>81.3</td><td>81.7</td></tr></table>

Table 12 | Performance of pre-trained checkpoints after fine-tuning on multi-modal benchmarks (without P&S). PaliGemma 2 was transferred at 896x896 resolution for the first four benchmarks, and at 448x448 resolution for the others.

表 12 | 预训练检查点在多模态基准上微调后的表现（不使用 P&S）。PaliGemma 2 在前四个基准上以 896x896 分辨率迁移，其余以 448x448 迁移。

**Comparison to PaliGemma 2.** We fine-tune multimodal Gemma 3 pre-trained checkpoints following the protocol from Steiner et al. (2024) – only learning rate is swept, otherwise the same transfer settings are used. The results in Table 12 show that Gemma 3 excels at benchmarks involving document understanding, even outperforming the larger PaliGemma 2 variant. Note that due to average pooling in the vision encoder the Gemma 3 4B and 12B models are about 10x cheaper to transfer compared with the PaliGemma 2 9B and 27B models at the same 896 x 896 resolution. Gemma 3 also performs better on AI2D and OKVQA, but PaliGemma 2 performs slightly better on VQAv2 and COCO caption.

**与 PaliGemma 2 的比较。** 我们按 Steiner et al. (2024) 的协议微调多模态 Gemma 3 预训练检查点：只扫学习率，其余迁移设置相同。表 12 的结果显示，Gemma 3 在涉及文档理解的基准上表现突出，甚至超过更大的 PaliGemma 2 变体。注意由于视觉编码器里的平均池化，在同样 896 x 896 分辨率下，Gemma 3 4B 和 12B 的迁移成本约为 PaliGemma 2 9B 和 27B 的十分之一。Gemma 3 在 AI2D 和 OKVQA 上也更好，但 PaliGemma 2 在 VQAv2 和 COCO caption 上略好。

**Multilinguality.** In Table 13 we report the performance of the pre-trained models on multilingual tasks. We apply in-context learning with multi-shot prompting and present results on the following benchmarks: MGSM (Shi et al., 2023), Global-MMLU-Lite (Singh et al., 2024b), WMT24++ (Deutsch et al., 2025), FLoRes (Goyal

<table><tr><td rowspan="2"></td><td colspan="3">Gemma 2</td><td colspan="4">Gemma 3</td></tr><tr><td>2B</td><td>9B</td><td>27B</td><td>1B</td><td>4B</td><td>12B</td><td>27B</td></tr><tr><td>MGSM</td><td>18.7</td><td>57.3</td><td>68.0</td><td>2.04</td><td>34.7</td><td>64.3</td><td>74.3</td></tr><tr><td>GMMLU</td><td>43.3</td><td>64.0</td><td>69.4</td><td>24.9</td><td>57.0</td><td>69.4</td><td>75.7</td></tr><tr><td>WMT24++</td><td>38.8</td><td>50.3</td><td>53.0</td><td>36.7</td><td>48.4</td><td>53.9</td><td>55.7</td></tr><tr><td>Flores</td><td>30.2</td><td>41.3</td><td>44.3</td><td>29.5</td><td>39.2</td><td>46.0</td><td>48.8</td></tr><tr><td>XQuAD</td><td>53.7</td><td>72.2</td><td>73.9</td><td>43.9</td><td>68.0</td><td>74.5</td><td>76.8</td></tr><tr><td>ECLeKTic</td><td>8.29</td><td>14.0</td><td>17.1</td><td>4.69</td><td>11.0</td><td>17.2</td><td>24.4</td></tr><tr><td>IndicGB</td><td>47.4</td><td>59.3</td><td>62.1</td><td>41.4</td><td>57.2</td><td>61.7</td><td>63.4</td></tr></table>

Table 13 | Multilingual performance after the pre-training phase. IndicGenBench is an average over benchmarks reported in Table 14.

表 13 | 预训练阶段后的多语言表现。IndicGenBench 是表 14 中各基准的平均。

et al., 2022), XQuAD (Artetxe et al., 2020), ECLeKTic (Goldman et al., 2025), IndicGen-Bench (Singh et al., 2024a), XOR QA (Asai et al., 2020). Evaluation details are described in Table 19.

**多语言。** 表 13 报告了预训练模型在多语言任务上的表现。我们用多示例提示做上下文学习，在以下基准上给出结果：MGSM (Shi et al., 2023), Global-MMLU-Lite (Singh et al., 2024b), WMT24++ (Deutsch et al., 2025), FLoRes (Goyal et al., 2022), XQuAD (Artetxe et al., 2020), ECLeKTic (Goldman et al., 2025), IndicGenBench (Singh et al., 2024a), XOR QA (Asai et al., 2020)。评测细节见表 19。

<table><tr><td rowspan="2"></td><td colspan="3">Gemma 2</td><td colspan="4">Gemma 3</td></tr><tr><td>2B</td><td>9B</td><td>27B</td><td>1B</td><td>4B</td><td>12B</td><td>27B</td></tr><tr><td>XQuAD Indic</td><td>54.3</td><td>73.1</td><td>74.9</td><td>43.1</td><td>68.3</td><td>75.2</td><td>77.8</td></tr><tr><td>XORQA in-en</td><td>66.2</td><td>69.3</td><td>72.5</td><td>56.3</td><td>68.3</td><td>69.8</td><td>70.4</td></tr><tr><td>XORQA in-xx</td><td>31.2</td><td>40.8</td><td>44.3</td><td>27.1</td><td>39.8</td><td>43.8</td><td>46.0</td></tr><tr><td>Flores Indic</td><td>38.1</td><td>54.0</td><td>56.9</td><td>39.0</td><td>52.3</td><td>58.0</td><td>59.5</td></tr></table>

Table 14 | Detailed IndicGenBench performance after the pre-training phase.

表 14 | 预训练阶段后 IndicGenBench 的详细表现。

**Long context.** In Table 15 we report the performance of pre-trained and fine-tuned models on long context benchmarks. We include RULER (Hsieh et al., 2024) and MRCR (Vodrahalli et al., 2024) benchmarks evaluating at 32K and 128K sequence lengths.

**长上下文。** 表 15 报告了预训练和微调模型在长上下文基准上的表现。我们纳入 RULER (Hsieh et al., 2024) 和 MRCR (Vodrahalli et al., 2024) 两个基准，在 32K 和 128K 序列长度上评测。

## 8.1. Performance of IT models

**8.1. IT 模型的表现**

We report in Table 18, additional benchmarks on our IT models. Note that N2C refers to Natural2Code, the Gemini 1.0 internal held-out dataset, which uses author-generated sources instead of web-based information. BBEH refers to BIG-Bench Extra Hard (Kazemi et al., 2025), a challenging LLM reasoning benchmark that aggregates several reasoning tasks (Fatemi et al., 2024;

<!-- page 22 of 25 -->

Gemma 3 Technical Report

<table><tbody><tr><td rowspan="2"></td><td rowspan="2">Contex</td><td>Gemma 3 PT Gemma 3 IT</td></tr><tr><td>t 4B 12B 27B 4B 12B 27B</td></tr><tr><td>RULER</td><td>32K</td><td>67.1 90.6 85.9 61.4 80.3 91.1</td></tr><tr><td>RULER</td><td>128K</td><td>51.7 80.7 72.9 46.8 57.1 66.0</td></tr><tr><td>MRCR</td><td>32K</td><td>44.7 59.8 63.2 49.8 53.7 63.2</td></tr><tr><td>MRCR</td><td>128K</td><td>40.6 56.9 60.0 44.6 49.8 59.3</td></tr></tbody></table>

Table 15 | Performance of pre-trained (PT) and instruction fine-tuned (IT) models on long context benchmarks at different context lengths.

表 15 | 预训练（PT）和指令微调（IT）模型在不同上下文长度下的长上下文基准表现。

> **问：** 128K 是窗口长度，本文在 128K 上实际评了什么？结果怎样？
> 只有表 15 这一处：RULER 和 MRCR 两个基准，各在 32K 和 128K 两个长度上，只评了 4B，12B，27B；1B 不在表里，它只有 32K（第 2 页）。从 32K 到 128K 全部下降：IT 27B 的 RULER 从 91.1 降到 66.0，IT 12B 从 80.3 降到 57.1，IT 4B 从 61.4 降到 46.8；MRCR 降得少，IT 27B 从 63.2 到 59.3. PT 模型里 12B 的 RULER (90.6, 80.7) 高于 27B (85.9, 72.9)。其他长度上的证据只有困惑度和内存：第 7 页图 7 的困惑度画到 512K，图 6 的 KV cache 画到 128K，第 3 页表 3 按 32,768 算内存。表 6 和表 18 的标准基准没写输入长度，第 24 到 25 页表 19 和表 21 只写了 shot 数。所以 「支持 128K」 指的是窗口，本文在 128K 上的准确率证据只有这两个基准，而且都低于 32K。

|  | 4B | 12B | 27B |
| --- | --- | --- | --- |
| MMMU (val) | 48.8 | 59.6 | 64.9 |
| DocVQA | 75.8 | 87.1 | 86.6 |
| InfoVQA | 50.0 | 64.9 | 70.6 |
| TextVQA | 57.8 | 67.7 | 65.1 |
| AI2D | 74.8 | 84.2 | 84.5 |
| ChartQA | 68.8 | 75.7 | 78.0 |
| VQAv2 (val) | 62.4 | 71.6 | 71.0 |
| MathVista (testmini) | 50.0 | 62.9 | 67.6 |

Table 16 | Performance of instruction fine-tuned (IT) models on multimodal benchmarks. If not mentioned, these results are on the final test set of each dataset with P&S applied.

表 16 | 指令微调（IT）模型在多模态基准上的表现。除非另有说明，结果都在各数据集的最终测试集上，并启用 P&S。

Hessel et al., 2022; Kazemi et al., 2023, 2024b; Kıcıman et al., 2023; Nie et al., 2024; Sánchez et al., 2024; Shah et al., 2024; Tyen et al., 2023; White et al., 2024; Yamada et al., 2023; Zhang et al., 2024). ECLeKTic refers to Goldman et al. (2025). We report the micro average score. More evaluation details are described in Table 21.

我们在表 18 中报告 IT 模型在更多基准上的结果。注意 N2C 指 Natural2Code，它是 Gemini 1.0 内部的留出数据集，使用作者自己编写的来源，不用网络信息。BBEH 指 BIG-Bench Extra Hard (Kazemi et al., 2025)，一个有挑战性的 LLM 推理基准，汇集了若干推理任务（Fatemi et al., 2024; Hessel et al., 2022; Kazemi et al., 2023, 2024b; Kıcıman et al., 2023; Nie et al., 2024; Sánchez et al., 2024; Shah et al., 2024; Tyen et al., 2023; White et al., 2024; Yamada et al., 2023; Zhang et al., 2024）。ECLeKTic 指 Goldman et al. (2025)。我们报告微平均分。更多评测细节见表 21。

## 8.2. Performance of IT models on video understanding

**8.2. IT 模型在视频理解上的表现**

**Additional multimodal evaluations.** Gemma 3 IT models were evaluated on common vision benchmarks following the evaluation protocol of Gemini 1.5 (Gemini Team, 2024). The results are given in Table 16 when P&S is activated.

**更多多模态评测。** Gemma 3 IT 模型按 Gemini 1.5 (Gemini Team, 2024) 的评测协议在常见视觉基准上评测。启用 P&S 时的结果见表 16。

|  | 4B | 12B | 27B |
| --- | --- | --- | --- |
| Perception Test MCVQA | 50.6 | 54.9 | 58.1 |
| ActivityNet-QA | 46.3 | 50.4 | 52.8 |

Table 17 | Performance of instruction fine-tuned (IT) models on vision understanding benchmarks using 0 shot with 16 frames linspace. Perception Test consists of real-world videos designed to show perceptually interesting situations and we report results on the multiple choice video QA benchmark in terms of top-1 accuracy. ActivityNet-QA reports standard gpt-evaluation.

表 17 | 指令微调（IT）模型在视觉理解基准上的表现，0-shot，按 linspace 均匀取 16 帧。Perception Test 由真实世界视频组成，用来展示感知上有意思的情形，我们报告其多选视频问答基准的 top-1 准确率。ActivityNet-QA 报告标准的 gpt 评测结果。

<!-- page 23 of 25 -->

Gemma 3 Technical Report

<table><tr><td rowspan="2"></td><td colspan="3">Gemma 2</td><td colspan="4">Gemma 3</td></tr><tr><td>2B</td><td>9B</td><td>27B</td><td>1B</td><td>4B</td><td>12B</td><td>27B</td></tr><tr><td>MMLU</td><td>56.1</td><td>71.3</td><td>76.2</td><td>38.8</td><td>58.1</td><td>71.9</td><td>76.9</td></tr><tr><td>MBPP</td><td>36.6</td><td>59.2</td><td>67.4</td><td>35.2</td><td>63.2</td><td>73.0</td><td>74.4</td></tr><tr><td>HumanEval</td><td>20.1</td><td>40.2</td><td>51.8</td><td>41.5</td><td>71.3</td><td>85.4</td><td>87.8</td></tr><tr><td>N2C</td><td>46.8</td><td>68.3</td><td>77.3</td><td>56.0</td><td>70.3</td><td>80.7</td><td>84.5</td></tr><tr><td>LiveCodeBench</td><td>7.0</td><td>20.0</td><td>29.0</td><td>5.0</td><td>23.0</td><td>32.0</td><td>39.0</td></tr><tr><td>GSM8K</td><td>62.6</td><td>88.1</td><td>91.1</td><td>62.8</td><td>89.2</td><td>94.4</td><td>95.9</td></tr><tr><td>MATH</td><td>27.2</td><td>49.4</td><td>55.6</td><td>48.0</td><td>75.6</td><td>83.8</td><td>89.0</td></tr><tr><td>HiddenMath</td><td>2.0</td><td>8.0</td><td>12.0</td><td>15.0</td><td>42.0</td><td>51.0</td><td>56.0</td></tr><tr><td>BBH</td><td>41.4</td><td>69.0</td><td>74.9</td><td>39.1</td><td>72.2</td><td>85.7</td><td>87.6</td></tr><tr><td>BBEH</td><td>5.9</td><td>9.8</td><td>14.8</td><td>7.2</td><td>11.0</td><td>16.3</td><td>19.3</td></tr><tr><td>IFEval</td><td>80.4</td><td>88.4</td><td>91.1</td><td>80.2</td><td>90.2</td><td>88.9</td><td>90.4</td></tr><tr><td>GMMLU-Lite</td><td>41.9</td><td>64.8</td><td>68.6</td><td>34.2</td><td>54.5</td><td>69.5</td><td>75.1</td></tr><tr><td>ECLeKTic</td><td>5.3</td><td>11.8</td><td>17.6</td><td>1.4</td><td>4.6</td><td>10.3</td><td>16.7</td></tr><tr><td>WMT24++</td><td>37.4</td><td>48.7</td><td>51.7</td><td>35.9</td><td>46.8</td><td>51.6</td><td>53.4</td></tr></table>

Table 18 | Performance of instruction fine-tuned (IT) models of different sizes on more internal and external benchmarks.

表 18 | 不同尺寸的指令微调（IT）模型在更多内部与外部基准上的表现。

<!-- page 24 of 25 -->

Gemma 3 Technical Report

| Evaluation | Metric | Type | n-shot | COT | Norm |
| --- | --- | --- | --- | --- | --- |
| MBPP | pass@1 | sampling | 3-shot |  |  |
| HumanEval | pass@1 | sampling | 0-shot |  |  |
| HellaSwag | Accuracy | scoring | 10-shot |  | Char-Len |
| BoolQ | Accuracy | scoring | 0-shot |  | Char-Len |
| PIQA | Accuracy | scoring | 0-shot |  | Char-Len |
| SIQA | Accuracy | scoring | 0-shot |  | Char-Len |
| TriviaQA | Accuracy | sampling | 5-shot |  |  |
| Natural Questions | Accuracy | sampling | 5-shot |  |  |
| ARC-C | Accuracy | scoring | 25-shot |  | Char-Len |
| ARC-E | Accuracy | scoring | 0-shot |  | Char-Len |
| WinoGrande | Accuracy | scoring | 5-shot |  | Char-Len |
| BBH | Accuracy | sampling | few-shot | Yes |  |
| DROP | Token F1 score | sampling | 1-shot |  |  |
| AGIEval | Accuracy | sampling | 3-5-shot |  |  |
| MMLU | Accuracy | scoring | 5-shot |  | Char-Len |
| MATH | Accuracy | sampling | 4-shot | Yes |  |
| GSM8K | Accuracy | sampling | 8-shot | Yes |  |
| GPQA Diamond | Accuracy | sampling | 5-shot | Yes |  |
| MMLU-Pro | Accuracy | sampling | 5-shot | Yes |  |
| MGSM | Accuracy | sampling | 8-shot |  |  |
| FLoRes | CHaRacter-level F-score | sampling | 1-shot |  |  |
| Global-MMLU-Lite | Accuracy | scoring | 5-shot |  | Char-Len |
| XQuAD | CHaRacter-level F-score | sampling | 5-shot |  |  |
| WMT24++ | CHaRacter-level F-score | sampling | 5-shot |  |  |
| ECLeKTic | ECLeKTic score | sampling | 2-shot |  | First-line/strip |
| XQuAD Indic | CHaRacter-level F-score | sampling | 5-shot |  |  |
| XOR QA IN-EN | CHaRacter-level F-score | sampling | 5-shot |  |  |
| XOR QA IN-XX | CHaRacter-level F-score | sampling | 5-shot |  |  |
| FLoRes Indic | CHaRacter-level F-score | sampling | 5-shot |  |  |
| RULER | Accuracy | sampling | 0-shot |  |  |
| MRCR | MRCR score | sampling | few-shot |  |  |

Table 19 | Details on text benchmarks. Char-Len stands for Character Length Normalization and COT stands for Chain-Of-Thought prompting.

表 19 | 文本基准细节。Char-Len 指字符长度归一化，COT 指 Chain-Of-Thought 提示。

<!-- page 25 of 25 -->

Gemma 3 Technical Report

| Evaluation | Metric | Type | n-shot |
| --- | --- | --- | --- |
| COCO Caption | Cider score | sampling | 4-shot |
| DocVQA | ANLS score | sampling | 4-shot |
| InfographicVQA | ANLS score | sampling | 4-shot |
| MMMU | Accuracy | sampling | 3-shot text only |
| TextVQA | Accuracy | sampling | 4-shot |
| RealWorldQA | Accuracy | sampling | 4-shot text only |
| ReMI | Accuracy | sampling | 4-shot |
| AI2D | Accuracy | sampling | 4-shot |
| ChartQA | Accuracy | sampling | 4-shot |
| VQA v2 | Accuracy | sampling | 4-shot |
| BLINK | Accuracy | sampling | 0-shot |
| OK-VQA | Accuracy | sampling | 4-shot |
| TallyQA | Accuracy | sampling | 4-shot |
| SpatialSense VQA | Accuracy | sampling | 4-shot |
| CountBench VQA | Accuracy | sampling | 0-shot |

Table 20 | Details on vision benchmarks. No Chain-Of-Thought prompting nor normalization.

表 20 | 视觉基准细节。不使用 Chain-Of-Thought 提示，也不做归一化。

| Evaluation | Metric | Type | n-shot | COT |
| --- | --- | --- | --- | --- |
| MMLU | Accuracy | sampling | 0-shot |  |
| MBPP | pass@1 | sampling | 3-shot |  |
| HumanEval | pass@1 | sampling | 0-shot |  |
| N2C | pass@1 | sampling | 0-shot |  |
| LiveCodeBench | Average over 8 samples | sampling | 0-shot | Yes |
| GSM8K | Accuracy | sampling | 0-shot | Yes |
| GPQA Diamond | Accuracy | sampling | 0-shot | Yes |
| MATH | Accuracy | sampling | 0-shot |  |
| HiddenMath | Accuracy | sampling | 0-shot |  |
| BBH | Accuracy | sampling | 0-shot |  |
| BBEH | Accuracy | sampling | 0-shot |  |
| IFEval | Accuracy | sampling | 0-shot |  |
| Global-MMLU-lite | Accuracy | sampling | 0-shot | Yes |
| ECLeKTic | ECLeKTic score | sampling | 0-shot |  |
| WMT24++ | CHaRacter-level F-score | sampling | 0-shot |  |

Table 21 | Details on instruction fine-tuned (IT) benchmarks. No normalization.

表 21 | 指令微调（IT）基准细节。不做归一化。

25
