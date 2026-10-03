---
title: "Gemma 4 · 对照译稿"
category: "模型库"
tags: ["Gemma", "对照译稿"]
published: true
excerpt: "Gemma 4 公开材料的逐段中英对照译稿，附读报告时的疑问块。"
---
<!-- page 1 of 17 -->

arXiv:2607.02770v2 [cs.CL] 24 Jul 2026

Google DeepMind

2026-06-19

# Gemma 4 Technical Report

Gemma 4 技术报告

> **确认:** 首页同时出现 「24 Jul 2026」 和 「2026-06-19」, 哪个是这份报告的日期?
> 两个日期说的不是一件事. 第 1 页顶部的 arXiv 标识是 2607.02770v2, 编号前缀 2607 表示首次提交在 2026 年 7 月, 24 Jul 2026 是 v2 这一版的日期. 2026-06-19 印在 Google DeepMind 下面, 是报告正文的落款日期. 第 4 页表 4 标题写 Arena 榜单 「as of June 19, 2026」, 和落款同一天, 所以表 4 的名次和 Elo 是 6 月 19 日的快照. 参考文献里最新的条目也是 2026 年 6 月的 arXiv 编号 (第 10 页 Kayyam et al. 的 2606.04032, 第 11 页 DeepSeek-V4 的 2606.19348). v2 相对 v1 改了什么, 全文没有说明.

**Gemma Team, Google DeepMind**<sup>1</sup>

**We introduce Gemma 4, a new generation of open-weight, natively multimodal language models in the Gemma model family. Designed to advance compute efficiency and reasoning, the Gemma 4 model suite features dense and Mixture-of-Experts architectures, ranging from 2.3B to 31B parameters. Alongside improved vision and audio encoders for all model sizes, we propose a unified, encoder-free architecture for our 12B model, which ingests raw audio and image patches. Furthermore, we integrate a thinking mode, enabling Gemma models to generate reasoning traces prior to responding. We improve inference speed, memory, and compute efficiency, as well as long-context abilities through critical design choices. Gemma 4 establishes a leap in performance across STEM, multimodal, and long-context benchmarks, and rivals larger, frontier open models in human-rated tasks.**

我们推出 Gemma 4, 这是 Gemma 模型家族新一代的开放权重, 原生多模态语言模型. Gemma 4 以提升计算效率和推理能力为设计目标, 模型组合包括 dense 和 MoE 两类架构, 参数规模从 2.3B 到 31B. 除了为所有尺寸改进视觉和音频编码器, 我们还为 12B 模型提出一种统一的无编码器架构, 它直接接收原始音频和图像 patch. 此外, 我们集成了 thinking mode, 让 Gemma 模型在作答前先生成推理迹. 通过几项关键的设计选择, 我们改善了推理速度, 显存和计算效率, 以及长上下文能力. Gemma 4 在 STEM, 多模态和长上下文基准上实现了性能跃升, 在人工评分任务上可与更大的前沿开放模型相比.

> **想:** 摘要说 「improved vision and audio encoders for all model sizes」, 每个尺寸都有视觉和音频编码器吗?
> 没有. 第 2 页表 1 里, 只有 E2B 和 E4B 同时有音频编码器 (305M) 和视觉编码器 (150M); 26B-A4B 和 31B 只有 550M 视觉编码器, 音频一栏是 「-」; 12B 两栏都是 「-」. 第 3 页训练数据那句也写明音频只用于 E2B, E4B 和 12B. 所以 26B-A4B 和 31B 不接收音频, 12B 接收音频和图像但不用编码器. 摘要这句只能理解为: 带编码器的尺寸都换了新编码器.

## 1. Introduction

The rapid evolution of large language models has driven the need for open-weight models with strong multimodal understanding, reasoning, and computational efficiency. Building upon the foundations of its predecessors (Gemma Team, 2024a,b, 2025a), we introduce Gemma 4, the most capable and efficient generation in the Gemma model family to date. Gemma 4 offers natively multimodal architectures, capable of seamlessly processing text, images, and audio while achieving frontier-level performance on highly complex reasoning tasks. The Gemma 4 family is built to serve a variety of on-device hardware. The model suite includes both dense architectures (2.3B, 4.5B, 12B, and 31B parameters) and a Mixture-of-Experts (Jacobs et al., 1991, MoE) variant with 3.8B activated and 26B total parameters. We introduce several architectural and methodological innovations:

大语言模型的快速演进, 带来了对开放权重模型的需求: 既要有强的多模态理解和推理能力, 又要计算高效. 在前几代 (Gemma Team, 2024a,b, 2025a) 的基础上, 我们推出 Gemma 4, 这是 Gemma 家族迄今能力最强, 效率最高的一代. Gemma 4 提供原生多模态架构, 能流畅处理文本, 图像和音频, 同时在高度复杂的推理任务上达到前沿水平. Gemma 4 家族面向多种端侧硬件. 模型组合包括 dense 架构 (2.3B, 4.5B, 12B 和 31B 参数) 和一个 MoE (Jacobs et al., 1991) 变体, 激活参数 3.8B, 总参数 26B. 我们引入了以下几项架构和方法上的创新:

• **Thinking mode for advanced reasoning:** We introduce a thinking mode (OpenAI, 2024) to Gemma 4 models. By outputting a reasoning trace before the response, models demonstrate improved capabilities in reasoning-heavy domains such as mathematics and coding.

• **用于高级推理的 thinking mode:** 我们为 Gemma 4 模型引入 thinking mode (OpenAI, 2024). 模型在回答前先输出推理迹, 在数学和代码这类重推理的领域表现更好.

• **Long-context efficiency:** Extended contexts lead to a memory explosion in the KV cache. We conserve a 5:1 ratio of local sliding window to global self-attention (4:1 for the 2.3B model) and use 𝑝-RoPE (Barbero et al., 2025) as positional encoding. Combined with KV cache

sharing (Shazeer, 2019) and the reuse of keys as values in global layers (Kayyam et al., 2026), these optimizations reduce the global KV cache footprint by up to 37.5%.

• **长上下文效率:** 上下文拉长会让 KV cache 的显存暴涨. 我们保持 local sliding window 与 global self-attention 5:1 的比例 (2.3B 模型为 4:1), 并用 p-RoPE (Barbero et al., 2025) 作位置编码. 再加上 KV cache 共享 (Shazeer, 2019) 和在 global 层把 key 复用为 value (Kayyam et al., 2026), 这些优化让 global KV cache 的占用最多降低 37.5%.

> **核对:** 37.5% 这个降幅能用本文给出的配置算出来吗?
> 算不出来. 第 1 页把 「up to 37.5%」 归给几项措施的合力: 5:1 比例, p-RoPE, KV cache 共享和 global 层 values = keys. 第 2 页又把同一个 37.5% 接在 p-RoPE 那句后面, 写成 「effectively reducing the global KV cache by 37.5%」. 单看 values = keys, global 层只存 key 不存 value, 这一项本身就能省掉 global KV 的一半; p-RoPE 只决定多少维做旋转, 按常规理解不改变缓存大小. 第 2 页还说 values = keys 不用于 E2B 和 E4B, 而 KV 共享只用于 E2B 和 E4B, 两类措施覆盖的尺寸互不重叠. 本文没有给出 37.5% 的计算口径, 也没说基线是什么. 另外, 这里给 KV cache 共享引的 Shazeer (2019) 是第 10 页那篇 「One write-head is all you need」, 讲多个 query head 共用一组 KV head, 和第 2 页按层数比例共享 KV 不是一回事.

**Compute efficiency:** We release an autoregressive multi-token prediction (MTP) drafter head (Li et al., 2024) designed for speculative decoding (Leviathan et al., 2023) to improve the decoding speed of our models.

**计算效率:** 我们发布一个自回归的多 token 预测 (MTP) drafter head (Li et al., 2024), 用于投机解码 (Leviathan et al., 2023), 以提高模型的解码速度.

• **Memory efficiency:** We provide quantized versions of our models trained with quantizationaware training (Jacob et al., 2018, QAT) to reduce their parameter memory footprint and latency with minimal impact on quality.

• **显存效率:** 我们提供用量化感知训练 (Jacob et al., 2018, QAT) 训练出的量化版本, 在质量损失很小的前提下降低参数的显存占用和延迟.

> **回看:** 这里 MTP drafter 算计算效率, QAT 算显存效率, 结论里也这么分吗?
> 不是. 第 9 页结论写的是 「increased the overall compute efficiency via QAT and memory efficiency via MTP drafters」, 两者对调了. 按正文, 第 3 页 2.5 节和表 3 给的是 QAT 省下的显存, 第 4 页 2.6 节讲 drafter 是为了解码速度. 以这里和正文为准, 结论那句是笔误.

• **Encoder-free architecture**: Gemma 4 models have frozen vision and audio encoders. We introduce a unified encoder-free architecture for the 12B model, which projects raw 40ms audio chunks and image patches into the LLM embedding space, alleviating the need for separate encoders and reducing memory fragmentation.

• **无编码器架构**: Gemma 4 模型的视觉和音频编码器是冻结的. 我们为 12B 模型引入统一的无编码器架构, 它把原始的 40ms 音频片段和图像 patch 直接投影到 LLM 的嵌入空间, 省去单独的编码器, 也减少显存碎片.

In this technical report, we outline the different model architectures across model sizes as well as the pre-training and post-training recipe of Gemma 4. Through comprehensive benchmarks and human evaluations such as Arena (Chiang et al., 2024), we demonstrate that Gemma 4 operates at a level comparable to larger, frontier open-source models across text, image, and audio modalities. We release the Gemma 4 models under an Apache 2.0 license, empowering developers and researchers everywhere to build upon, customize, and extend these capabilities.

这份技术报告介绍各尺寸的模型架构, 以及 Gemma 4 的预训练和后训练方案. 通过全面的基准测试和 Arena (Chiang et al., 2024) 这类人工评估, 我们表明 Gemma 4 在文本, 图像和音频模态上的水平可与更大的前沿开源模型相当. 我们以 Apache 2.0 许可证发布 Gemma 4 模型, 让各地的开发者和研究者都能在此基础上构建, 定制和扩展.

<small><span class="docvortex-page-footnote" data-block-type="page_footnote" style="color:#6b7280"><sup>1</sup>See Contributions and Acknowledgments section for full author list. Please send correspondence to gemma4report@gmail.com. © 2026 Google DeepMind. All rights reserved</span></small>

脚注 1: 完整作者名单见贡献与致谢一节. 来信请寄 gemma4report@gmail.com. © 2026 Google DeepMind. 保留所有权利.

<!-- page 2 of 17 -->

Gemma 4 Technical Report

| Model | Audio Encoder | Vision Encoder | Embedder | Einsums | Drafter |
| --- | --- | --- | --- | --- | --- |
| E2B | 305M | 150M | 400M + 2,340M | 1,870M | 76M |
| E4B | 305M | 150M | 670M + 2,820M | 3,940M | 77M |
| 12B | - | - | 1,000M | 10,890M | 400M |
| 26B-A4B* | - | 550M | 740M | 24,500M / 2,800M (active) | 430M |
| 31B | - | 550M | 1,410M | 29,290M | 500M |

Table 1 | Parameter counts for the Gemma 4 models. The vocabulary we use has 262k entries. The model noted with a star is an MoE defined by its number of active parameters. Note that the extra embedder parameters in E2B and E4B are per-layer embeddings.

表 1 | Gemma 4 各模型的参数量. 我们用的词表有 262k 个条目. 带星号的模型是 MoE, 以激活参数量命名. 注意 E2B 和 E4B 多出来的 embedder 参数是逐层嵌入 (per-layer embeddings).

> **拆开:** 表 1 的各列加起来, 能对上正文的 2.3B, 4.5B, 5B, 8B 吗?
> 大体能. 有效参数取 Embedder 的第一个数加 Einsums: E2B 为 400M + 1,870M = 2.27B, E4B 为 670M + 3,940M = 4.61B, 本页正文写 2.3B 和 4.5B. 总参数再加上逐层嵌入和两个编码器: E2B 为 2.27B + 2.34B + 0.305B + 0.15B, 约 5.07B; E4B 为 4.61B + 2.82B + 0.305B + 0.15B, 约 7.89B, 对应本页的 5B 和 8B. 12B 是 1.0B + 10.89B = 11.89B, 31B 是 0.55B + 1.41B + 29.29B = 31.25B. Drafter 不计入名义尺寸. 下面是我的推算, 原文没有给: 按 262,144 个词条去除 Embedder 参数, 嵌入宽度依次约为 1536 (E2B), 2560 (E4B), 3840 (12B), 2816 (26B-A4B), 5376 (31B); 逐层嵌入 2,340M 和 2,820M 分别约等于 262,144 × 35 × 256 和 262,144 × 42 × 256, 暗示 E2B 和 E4B 各有 35 层和 42 层, 这和本页 KV 共享比例的分母 35, 42 对得上. 26B-A4B 这一行表里写激活 2,800M, 同页正文写激活 3.8B, 第 3 页表 3 的 7.6 又等于 3.8 乘 2, 三处对不齐.

## 2. Model Architecture

**2. 模型架构**

Gemma 4 models follow a decoder-only Transformer architecture (Vaswani et al., 2017). Our models have pre-norm and post-norm with RMSNorm (Zhang and Sennrich, 2019), and QKNorm (Henry et al., 2020).

Gemma 4 模型沿用 decoder-only Transformer 架构 (Vaswani et al., 2017). 模型同时用 pre-norm 和 post-norm, 归一化方式为 RMSNorm (Zhang and Sennrich, 2019), 另加 QKNorm (Henry et al., 2020).

**Dense and MoE:** The Gemma 4 family of models comprises dense architectures, with effective 2.3B (**E2B**), effective 4.5B (**E4B**), 12B and 31B parameters, as well as an MoE model with 3.8B activated parameters for 26B total parameters (**26B-A4B**). E2B and E4B use per-layer embeddings as in Gemma 3n (Gemma Team, 2025b), making them 2.3B and 4.5B effective out of 5B and 8B total parameters respectively.

**Dense 与 MoE:** Gemma 4 家族包括 dense 架构, 参数分别为有效 2.3B (**E2B**), 有效 4.5B (**E4B**), 12B 和 31B; 另有一个 MoE 模型, 激活参数 3.8B, 总参数 26B (**26B-A4B**). E2B 和 E4B 像 Gemma 3n (Gemma Team, 2025b) 一样使用逐层嵌入, 因此在 5B 和 8B 的总参数中, 有效参数分别是 2.3B 和 4.5B.

<table><tr><td rowspan="2">Model</td><td rowspan="2">TPU</td><td rowspan="2">#Chips</td><td colspan="3">Shards</td></tr><tr><td>Data</td><td>Seq</td><td>Replica</td></tr><tr><td>E2B</td><td>v6e</td><td>4,096</td><td>16</td><td>8</td><td>32</td></tr><tr><td>E4B</td><td>v6e</td><td>6,144</td><td>16</td><td>16</td><td>24</td></tr><tr><td>12B</td><td>v4</td><td>12,288</td><td>16</td><td>16</td><td>48</td></tr><tr><td>26B-A4B*</td><td>v6e</td><td>6,144</td><td>16</td><td>16</td><td>24</td></tr><tr><td>31B</td><td>v6e</td><td>10,240</td><td>16</td><td>16</td><td>40</td></tr></table>

Table 2 | Pre-training infrastructure with sharding by data, sequence (Seq), and replica.

表 2 | 预训练基础设施, 按数据 (Data), 序列 (Seq) 和副本 (Replica) 三个维度分片.

**Long-context efficiency:** Our local to global attention ratio patterns follow Gemma Team (2025a), that is, 4-to-1 local attention blocks for E2B and 5-to-1 for the rest. We improve memory efficiency by re-using keys as values in the global attention layers (except in E2B and E4B), i.e. , values = keys. We encode position

with 𝑝-RoPE with 𝑝 = 0.25 on global attention layers and with RoPE on local attention layers, effectively reducing the global KV cache by 37.5%. The RoPE frequencies are set to 1M and 10k on global and local attention layers, respectively. Finally, we share the KV cache with ratios of 20/35 and 18/42 for the E2B and E4B model.

**长上下文效率:** local 与 global attention 的比例沿用 Gemma Team (2025a): E2B 是每 4 个 local attention 块配 1 个 global, 其余模型是 5 比 1. 我们在 global attention 层把 key 复用为 value (E2B 和 E4B 除外), 即 values = keys, 以此提高显存效率. 位置编码方面, global attention 层用 p = 0.25 的 p-RoPE, local attention 层用 RoPE, 实际让 global KV cache 降低 37.5%. global 层和 local 层的 RoPE 频率分别设为 1M 和 10k. 最后, E2B 和 E4B 分别按 20/35 和 18/42 的比例共享 KV cache.

> **问:** 「20/35 和 18/42 的比例共享 KV cache」 里, 分子分母各指什么?
> 分母和上一条从表 1 推出的层数 35, 42 一致, 大概率是总层数. 分子是 「20 层复用别层的 KV」 还是 「20 层自己算 KV」, 本文没写, 也没说哪些层参与共享. 按本页的 4:1 和 5:1, 35 层的 E2B 和 42 层的 E4B 都正好有 7 个 global 层, 这是我的推算. local 层的 sliding window 宽度全文没有给出, 所以第 3 页表 3 里 +0.05, +0.14 这类 KV cache 数字无法从结构参数复算.

## 2.1. Vision modality

**2.1. 视觉模态**

E2B and E4B Gemma models come with a 150M vision encoder, while larger models use a 550M encoder (except for the unified 12B). Both are Vision Transformers (Dosovitskiy et al., 2021, ViT) with a patch size of 16, whose architectural differences are detailed in Table 10 in Appendix. Our vision encoders support variable aspect ratios (see Figure 2 and Algorithm 1) and incorporate both axial 2D-RoPE (Heo et al., 2024) with non-causal attention and 2D absolute positional embeddings. We restrict the maximum number of tokens, 𝑁<sub>max</sub> to the values 70, 140, 280, 560 and 1120 (see Algorithm 1 for implementation details).

E2B 和 E4B 配 150M 的视觉编码器, 更大的模型用 550M 的编码器 (统一架构的 12B 除外). 两者都是 patch 大小为 16 的 Vision Transformer (Dosovitskiy et al., 2021, ViT), 结构差异见附录表 10. 我们的视觉编码器支持可变宽高比 (见图 2 和算法 1), 同时用了带非因果 attention 的轴向 2D-RoPE (Heo et al., 2024) 和 2D 绝对位置嵌入. 最大 token 数 N_max 限定为 70, 140, 280, 560 和 1120 这几档 (实现细节见算法 1).

## 2.2. Audio modality

**2.2. 音频模态**

E2B and E4B Gemma models use a 305M audio encoder that processes audio in 40ms chunks with Mel filterbank inputs. The encoder architecture is based on the Universal Speech Model (Zhang et al., 2023, USM), consisting of two downsampling convolution layers followed by twelve Conformer layers (Gulati et al., 2020). While the architecture remains similar to that of Gemma 3n, we reduce the number of parameters by 55% (from 680M to 305M). We do not use vector quantization; the LLM ingests the con-

E2B 和 E4B 使用 305M 的音频编码器, 以 40ms 为一片处理音频, 输入是 Mel 滤波器组特征. 编码器结构基于 Universal Speech Model (Zhang et al., 2023, USM), 由两个下采样卷积层和其后的十二个 Conformer 层 (Gulati et al., 2020) 组成. 结构和 Gemma 3n 相近, 但参数量减少了 55% (从 680M 降到 305M). 我们不做向量量化; LLM 接收的是音频编码器输出的连续表示.

<!-- page 3 of 17 -->

Gemma 4 Technical Report

tinuous representations produced by the audio encoder. As with the vision encoder, we keep weights frozen during pre-training.

和视觉编码器一样, 音频编码器的权重在预训练期间保持冻结.

## 2.3. Encoder-free architecture

**2.3. 无编码器架构**

Gemma 4 12B is trained from scratch based on a new, unified, and encoder-free model paradigm, replacing the separate vision and audio encoders with lightweight projection modules. For the vision modality, Gemma 4 12B takes in 48×48×3 RGB patches, but replaces the 550M vision encoder by a single large matmul (35M parameters). Spatial awareness is maintained by adding 2D coordinate-based positional embeddings directly to the patch representations before a final LayerNorm layer (Ba et al., 2016).

Gemma 4 12B 基于一种新的, 统一的无编码器模型范式从头训练, 用轻量的投影模块替代单独的视觉和音频编码器. 视觉方面, Gemma 4 12B 接收 48×48×3 的 RGB patch, 把 550M 的视觉编码器换成一次大矩阵乘 (35M 参数). 空间信息的保留方式是: 在最后一个 LayerNorm 层 (Ba et al., 2016) 之前, 把基于 2D 坐标的位置嵌入直接加到 patch 表示上.

> **对一下:** 12B 的 patch 是 48×48, 其他尺寸的视觉编码器用 16 的 patch, 两者什么关系?
> 48 正好是附录算法 1 里的池化 patch 大小 m = k × p = 3 × 16, 第 16 页图 2 标题也写每个池化 patch 是 48px×48px. 其他尺寸先把 48×48 区域切成 3×3 个 16px patch 过编码器, 再池化成 1 个 soft token; 12B 把同一块区域直接拉平成 48 × 48 × 3 = 6912 维, 一次矩阵乘映射成 1 个 token. 如果 12B 也按算法 1 取 m = 48, 同样的 token 预算下两条路线覆盖的像素一样多. 35M 参数本文没有拆开: 按我从表 1 推出的 12B 嵌入宽度 3840, 6912 × 3840 约 26.5M, 余下约 8.5M 可能属于 2D 坐标位置嵌入或别的部件, 本文没交代. 音频这边对得上: 16kHz × 40ms = 640 个采样点, 正好是下一段说的 640 维.

For audio, the 305M USM-based conformer encoder is entirely discarded. Raw audio is segmented into 40ms chunks at 16kHz, resulting in 640-dimensional vectors per chunk. These are projected directly into the LLM embedding space. Since audio is a temporal sequence, it does not require additional positional encoding.

音频方面, 基于 USM 的 305M conformer 编码器被整个去掉. 原始音频按 16kHz 采样切成 40ms 的片段, 每片得到一个 640 维向量. 这些向量直接投影到 LLM 的嵌入空间. 音频本身就是时间序列, 不需要额外的位置编码.

> **停一下:** 12B 去掉编码器之后, 它的主干和其他尺寸是不是同一套结构?
> 主干规则大体相同, 输入端和训练来历不同. 相同处: 第 2 页第 2 节开头的 decoder-only, pre-norm 加 post-norm, RMSNorm, QKNorm 没有按尺寸区分; local 与 global 的比例只把 E2B 单列为 4:1, 12B 属于 5:1; values = keys 只排除 E2B 和 E4B, 所以 12B 用了; p-RoPE 和 RoPE 频率也没分尺寸. 本页表 3 里 12B 和 26B-A4B 的 KV cache 都是 +0.28, 说明两者 attention 配置接近, 这是我从数字推的. 不同处: 表 1 里 12B 没有逐层嵌入, 也没有编码器; 视觉走 35M 矩阵乘, 音频直接投影 640 维片段 (本页); 它按新范式 「from scratch」 训练 (本页 2.3 首句); 第 2 页表 2 里只有它用 TPU v4, 12,288 块芯片是五个模型里最多的; 第 4 页给 drafter 维度时列了 E2B, E4B, 26B-A4B, 31B, 唯独没列 12B. 本文没有给任何尺寸的主干层数和宽度表, 所以 「同一套结构」 只能确认到规则这一层.

| Model | bf16 | Quantized | KV Cache |
| --- | --- | --- | --- |
| E2B | 4.6 | $0.8^†$ | +0.05 |
| E4B | 9.0 | $2.3^†$ | +0.14 |
| 12B | 24.0 | $7.65^‡$ | +0.28 |
| 26B-A4B* | 52.0 / 7.6 | $16.2/2.8^‡$ | +0.28 |
| 31B | 64.0 | $19.2^‡$ | +1.10 |

Table 3 | Text only, Gb memory footprint comparison between raw and quantized checkpoints for weights and int8 KV caching (+KV) at 32k context size. † is mobile quantization, ‡ is Q4\_0.

表 3 | 仅文本场景下, 原始检查点和量化检查点的显存占用对比 (单位 Gb), 含权重以及 32k 上下文下的 int8 KV cache (+KV). † 为移动端量化, ‡ 为 Q4_0.

> **看表:** 表 3 的 bf16 一列和参数量是什么关系? 单位 Gb 是 gigabit 吗?
> bf16 每个参数 2 字节, 这列基本等于名义参数量乘 2: E2B 为 2.3 × 2 = 4.6, E4B 为 4.5 × 2 = 9.0, 12B 为 12 × 2 = 24.0, 26B-A4B 为 26 × 2 = 52.0, 斜杠后的 7.6 对应 3.8 × 2. 可见 E2B 和 E4B 只算了有效参数, 表 1 里的逐层嵌入和编码器没算进来, 标题也写了 「Text only」. 31B 是例外: 31 × 2 = 62, 按表 1 的 31.25B 算是 62.5, 表里写 64.0, 差约 1.5, 本文没解释. 单位如果真是 gigabit, E2B 只合 0.575 GB, 装不下 2.3B 个 bf16 参数, 所以这里的 Gb 只能读作 GB. Q4_0 一列折合每参数约 5 bit: 12B 为 7.65 × 8 / 12, 约 5.1; 31B 为 19.2 × 8 / 31, 约 5.0.

## 2.4. Pre-training

**2.4. 预训练**

We follow a similar pre-training as Gemma 3.

预训练方式和 Gemma 3 相近.

**Training data.** Our pre-training dataset is a largescale, diverse collection of data from a wide range of domains and modalities, including web documents, code, images, and audio (for E2B, E4B and 12B), with a cutoff date of January 2025.

**训练数据.** 预训练数据集规模大, 来源多样, 覆盖广泛的领域和模态, 包括网页文档, 代码, 图像和音频 (音频只用于 E2B, E4B 和 12B), 数据截止日期为 2025 年 1 月.

**Tokenizer.** We use the same tokenizer as Gemini Team (2025) that is, a SentencePiece tok-

![Image block](images/p03-figure-1-the-autoregressive-mtp-drafter-blue-blocks-on.png)

Figure 1 | The autoregressive MTP drafter (blue blocks on the right) is fed activations and KV cache from the main model (gray blocks).

图 1 | 自回归 MTP drafter (右侧蓝色块) 接收主模型 (灰色块) 的激活和 KV cache.

enizer (Kudo and Richardson, 2018) with split digits, preserved whitespace, and byte-level encodings. The vocabulary has 262k entries.

**Tokenizer.** 我们使用和 Gemini Team (2025) 相同的 tokenizer, 即 SentencePiece tokenizer (Kudo and Richardson, 2018): 数字拆开, 保留空白, 采用字节级编码. 词表有 262k 个条目.

**Filtering.** We filter data to decontaminate benchmarks, and to reduce the risk of unwanted or unsafe utterances and the risk of recitation.

**过滤.** 我们过滤数据, 以去除基准污染, 并降低产生不当或不安全言论以及复述训练数据的风险.

## 2.5. Quantization-Aware Training

**2.5. 量化感知训练**

We provide quantized models and encoders in different formats along with the raw checkpoints. Based on the most popular open source quantization inference engines (e.g. llama.cpp) as well as efficient hardware support, we focus on two sets of weight representations:

除原始检查点外, 我们还提供不同格式的量化模型和量化编码器. 参考最流行的开源量化推理引擎 (如 llama.cpp) 以及高效的硬件支持, 我们聚焦两套权重表示:

• mobile quantization: per-channel low bitwidth weight (mix of int2 and int4) and activation quantization (int8).

• Q4\_0 quantization: blockwise quantization, often referred to as Q4\_0.

• 移动端量化: 逐通道的低位宽权重 (int2 和 int4 混用) 加激活量化 (int8).

• Q4_0 量化: 分块量化, 通常就叫 Q4_0.

In Table 3, we report the memory filled by raw and quantized models with and without a KV cache for a sequence of 32k tokens. Furthermore, to enable stable inference in fp16, we introduce a scalar scale at each block in order to bound the activation ranges to fit fp16.

表 3 给出原始模型和量化模型在有无 KV cache 时, 处理 32k token 序列占用的显存. 此外, 为了在 fp16 下稳定推理, 我们在每个块引入一个标量系数 (scalar scale), 把激活范围限制在 fp16 能表示的区间内.

<!-- page 4 of 17 -->

Gemma 4 Technical Report

| Rank | Model | Elo | 95% CI | Open | Type | #params/#activated |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | Claude Fable 5 | 1508 | ± 9 | no | - | - / - |
| ... |  |  |  |  |  |  |
| 15 | GLM 5.1 | 1475 | ± 6 | yes | MoE | 744B / 40B |
| 25 | GLM 5.2 (Max) | 1471 | ± 10 | yes | MoE | 744B / 40B |
| 29 | MiMo V2.5 Pro | 1466 | ± 5 | yes | MoE | 1T / 42B |
| 34 | Kimi K2.6 | 1460 | ± 5 | yes | MoE | 1T / 32B |
| 36 | DeepSeek V4 Pro Thinking | 1458 | ± 5 | yes | MoE | 1.6T / 49B |
| 37 | GLM 5 | 1457 | ± 5 | yes | MoE | 744B / 40B |
| 38 | DeepSeek V4 Pro | 1456 | ± 5 | yes | MoE | 1.6T / 49B |
| 43 | Gemma 4 31B | 1451 | ± 8 | yes | Dense | 31B |
| 44 | Kimi K2.5 Thinking | 1450 | ± 4 | yes | MoE | 1T / 32B |
| 57 | Qwen 3.5 397B-A17B | 1444 | ± 4 | yes | MoE | 397B / 17B |
| 61 | Gemma 4 26B-A4B | 1438 | ± 8 | yes | MoE | 26B / 4B |
| 63 | DeepSeek V4 Flash Thinking | 1436 | ± 5 | yes | MoE | 284B / 13B |
| ... |  |  |  |  |  |  |
| 157 | Gemma 3 27B | 1366 | ± 4 | yes | Dense | 27B |

Table 4 | Leading open-weight models on Arena Text (Chiang et al., 2024) (as of June 19, 2026). Models are evaluated through blind side-by-side evaluations by human raters, and attributed scores based on the Elo rating system. The top closed model (gray) is included for scale. Gemma models rival much larger models, and Gemma 4 31B is the leading dense open model on the leaderboard.

表 4 | Arena Text (Chiang et al., 2024) 上领先的开放权重模型 (截至 2026 年 6 月 19 日). 模型由人工评分者做盲测并排比较, 按 Elo 评分系统计分. 表中收入了排名最高的闭源模型 (灰色) 作参照. Gemma 模型可与大得多的模型抗衡, Gemma 4 31B 是榜上排名最高的 dense 开放模型.

> **再看:** 表 4 能支撑 「31B 是榜上最强的 dense 开放模型」 吗?
> 在表里列出的行里能. 列出的其他开放模型全是 MoE, 31B 是唯一的 dense 开放模型, 排第 43. 但表中有两处 「...」, 第 2 到第 14 名和第 64 到第 156 名都省略了, 读者没法自己确认省略的部分里没有更靠前的 dense 开放模型. 置信区间也要一起看: 31B 为 1451 ± 8, 和第 38 名 DeepSeek V4 Pro 的 1456 ± 5, 第 37 名 GLM 5 的 1457 ± 5 区间重叠; 26B-A4B 为 1438 ± 8, 和第 57 名 Qwen 3.5 397B-A17B 的 1444 ± 4 重叠. 所以第 6 页说两者 「equal to much larger open models」 在统计上站得住, 名次的先后不宜细抠. 名次是 6 月 19 日的快照, 见第 1 页日期那条确认.

We also apply QAT to the image and audio encoders. On the 150M image encoder, quantizing activations and weights to 8-bit precision (W8A8) yields a 2× reduction in total forward-pass memory footprint (from 400 MB to 200 MB, including on-device compilation overhead) and a 44% reduction in on-device latency relative to Gemma 3n on newer hardware. On the audio encoder, we further reduce activation precision to 8 bits and weight precision to {2, 4, 8} bits, varying by layer cluster. Overall, we achieve a 78% reduction in on-disk footprint, from 390 MB in Gemma 3n to 87 MB in this version.

我们也对图像和音频编码器做了 QAT. 在 150M 图像编码器上, 把激活和权重量化到 8 bit (W8A8) 后, 前向总显存占用减半 (从 400 MB 降到 200 MB, 含端侧编译开销), 在较新的硬件上端侧延迟比 Gemma 3n 低 44%. 在音频编码器上, 我们进一步把激活精度降到 8 bit, 权重精度按层簇取 {2, 4, 8} bit. 总体上磁盘占用减少 78%, 从 Gemma 3n 的 390 MB 降到这一版的 87 MB.

> **核对:** 这一段的几个百分比能用给出的数复算吗?
> 能. 图像编码器从 400 MB 到 200 MB, 正好减半. 音频编码器磁盘占用从 390 MB 到 87 MB, 降幅 (390 - 87) / 390, 约 77.7%, 取整为 78%. 第 2 页说音频编码器参数从 680M 降到 305M, (680 - 305) / 680 约 55.1%, 对应 55%. 第 7 页表 7 的 Params 和 Size 两列也写着 305M / 87 MB 和 680M / 390 MB, 前后一致. 我另算了一下, 87 MB 存 305M 个参数, 平均每参数约 2.3 bit, 说明多数层簇用的是 2 bit 权重; 各层簇分别用几 bit, 本文没给. 44% 的延迟降幅没有绝对时延, 硬件也只写了 「newer hardware」, 无法复算.

## 2.6. Multi-Token Prediction Drafter

**2.6. 多 token 预测 drafter**

We train a small autoregressive MTP drafter head with our models, used for speculative decoding. In our MTP procedure, the model’s last layer activations from the previous step and token embeddings are fed into the MTP head. The MTP head generates future tokens sequentially using a separate embedder and a 4-layer Transformer block that cross-attends to the KVs of the main model (Figure 1), thus eliminating the need for

MTP prefill and supporting any draft length. The Transformer block has model dimension 256 for E2B and E4B, 1024 for 26B-A4B and 31B, three local, and one global attention layers.

我们随模型一起训练一个小的自回归 MTP drafter head, 用于投机解码. 在我们的 MTP 流程里, 主模型上一步的最后一层激活和 token 嵌入一起送入 MTP head. MTP head 用单独的 embedder 和一个 4 层 Transformer 块依次生成后续 token, 这个 Transformer 块对主模型的 KV 做 cross-attention (图 1), 因此不需要 MTP prefill, 也支持任意草稿长度. 该 Transformer 块的模型维度在 E2B 和 E4B 上是 256, 在 26B-A4B 和 31B 上是 1024, 由三个 local attention 层和一个 global attention 层组成.

**Efficient MTP Decoding.** For the E2B and E4B drafters, we reduce the decoding overhead by replacing the projection operation to the entire vocabulary by a top-k operation on clusters of tokens. As a result, final matrix multiplication is reduced from 𝑑 × 262, 000 to 𝑑 × 4096 while preserving a similar acceptance rate.

**高效 MTP 解码.** 对 E2B 和 E4B 的 drafter, 我们把到整个词表的投影换成在 token 簇上做 top-k, 以降低解码开销. 这样最后的矩阵乘从 d × 262,000 降到 d × 4096, 接受率基本不变.

> **问:** drafter 能让解码快多少? 12B 的 drafter 长什么样?
> 本文都没给. 本页只说 drafter 用于投机解码, E2B 和 E4B 的簇 top-k 改动 「preserving a similar acceptance rate」, 既没有接受率的数值, 也没有提速倍数. 结构维度只列了 E2B, E4B (256) 和 26B-A4B, 31B (1024), 12B 缺席, 而第 2 页表 1 给 12B 的 drafter 是 400M. 按我的估算, drafter 参数的大头在单独的 embedder: 262k × 256 约 67M, 加上 4 层 256 宽的 Transformer 约 3M, 接近表 1 里 E2B 的 76M; 宽度 1024 时 embedder 约 268M, 离 26B-A4B 的 430M 和 31B 的 500M 还有一截, 差额本文没拆.

## 2.7. Compute Infrastructure

**2.7. 计算基础设施**

We train our models with TPUv4 and TPUv6e as outlined in Table 2. Each model configuration is optimized to minimize training step time. For our larger models, we leverage Slice-Granularity Elasticity (Gemini Team, 2025), which allows continuous training with fewer “slices” of TPU chips when there is a localized failure. This reconfiguration reduces the delay caused by interruptions from many minutes to a few seconds.

我们按表 2 的配置用 TPUv4 和 TPUv6e 训练模型. 每种模型配置都以最小化训练步耗时为目标做了优化. 对较大的模型, 我们用 Slice-Granularity Elasticity (Gemini Team, 2025): 出现局部故障时, 可以用更少的 TPU 芯片 「slice」 继续训练. 这种重配置把中断造成的延迟从好几分钟缩短到几秒.

<!-- page 5 of 17 -->

Gemma 4 Technical Report

<table><tbody><tr><td colspan="2">31B</td><td>Ge26B-A4B</td><td>mma 4 12B</td><td>E4B</td><td>E2B</td><td>Gemma 3 27Bnon-thinking</td></tr><tr><td>MMLU Pro AIME 2026 notools</td><td>85.289.2</td><td>82.688.3</td><td>77.277.5</td><td>69.442.5</td><td>60.037.5</td><td>67.620.8</td></tr><tr><td>LiveCodeBench v6</td><td>80.0</td><td>77.1</td><td>72.0</td><td>52.0</td><td>44.0</td><td>29.1</td></tr><tr><td>Codeforces Elo</td><td>2150</td><td>1718</td><td>1659</td><td>940</td><td>633</td><td>110</td></tr><tr><td>SciCode</td><td>43.0</td><td>40.0</td><td>38.0</td><td>24.0</td><td>21.0</td><td>21.0</td></tr><tr><td>GPQA Diamond</td><td>84.3</td><td>82.3</td><td>78.8</td><td>58.6</td><td>43.4</td><td>42.4</td></tr><tr><td>Big Bench Extra Hard microavg</td><td>74.4</td><td>64.8</td><td>53.0</td><td>33.1</td><td>21.9</td><td>19.3</td></tr><tr><td>HLE</td><td>19.5</td><td>8.7</td><td>5.2</td><td>-</td><td>-</td><td>-</td></tr><tr><td>HLE with search</td><td>26.5</td><td>17.2</td><td>-</td><td>-</td><td>-</td><td>-</td></tr><tr><td>IFBench</td><td>76.0</td><td>72.0</td><td>74.0</td><td>44.0</td><td>38.0</td><td>32.0</td></tr><tr><td>IFEval</td><td>98.9</td><td>98.5</td><td>97.2</td><td>96.7</td><td>94.6</td><td>90.4</td></tr><tr><td>MMMLU</td><td>88.4</td><td>86.3</td><td>83.4</td><td>76.6</td><td>67.4</td><td>70.7</td></tr><tr><td>MRCR v2 8-needle,128k</td><td>66.4</td><td>44.1</td><td>43.4</td><td>25.4</td><td>19.1</td><td>13.5</td></tr><tr><td>Terminal Bench Hard</td><td>36.0</td><td>14.0</td><td>18.0</td><td>8.0</td><td>3.0</td><td>4.0</td></tr><tr><td>Tau2 - airline</td><td>75.0</td><td>76.0</td><td>75.0</td><td>52.0</td><td>31.0</td><td>39.0</td></tr><tr><td>Tau2 - retail</td><td>86.4</td><td>85.5</td><td>77.6</td><td>67.1</td><td>34.6</td><td>6.6</td></tr><tr><td>Tau2 - telecom</td><td>69.3</td><td>43.0</td><td>54.4</td><td>18.4</td><td>19.7</td><td>3.1</td></tr></tbody></table>

Table 5 | Performance comparison of Gemma 3 27B and Gemma 4 models on diverse benchmarks. All models are in thinking mode unless explicitly stated.

表 5 | Gemma 3 27B 与 Gemma 4 各模型在多种基准上的性能对比. 除非明确标注, 所有模型都处于 thinking mode.

> **拆开:** 表 5 的表头和第一行看着错位, 怎么读?
> 这是 PDF 转换把单元格粘在了一起. 表头的 「Ge26B-A4B」 和 「mma 4 12B」 是分组名 「Gemma 4」 被切开后插进了列名, 列顺序是 31B, 26B-A4B, 12B, E4B, E2B, Gemma 3 27B (non-thinking). 第一行 「MMLU Pro AIME 2026 notools」 是两行并成一行, 数值也两两相连: 85.2 / 89.2, 82.6 / 88.3, 77.2 / 77.5, 69.4 / 42.5, 60.0 / 37.5, 67.6 / 20.8, 前一个是 MMLU Pro, 后一个是 AIME 2026 no tools. 第 8 页表 9 的 RULER 一行有同样的粘连: 每格三个数依次是 RULER 32k, RULER 128k 和 LOFT 128k, 例如 31B 为 96.8, 96.4, 79.5, Gemma 3 27B 为 91.1, 66.0, 8.6.

The optimizer state is sharded using an implementation of ZeRO-3 (Ren et al., 2021). For multi-pod training, we perform a data replica reduction over the data center network, using the Pathways approach of Barham et al. (2022). We use the single controller programming paradigm of JAX (Roberts et al., 2023) and Pathways, along with the GSPMD partitioner (Xu et al., 2021) and the MegaScale XLA compiler (XLA, 2019).

优化器状态用 ZeRO-3 (Ren et al., 2021) 的一种实现做分片. 多 pod 训练时, 我们按 Barham et al. (2022) 的 Pathways 方法, 在数据中心网络上做数据副本归约. 我们使用 JAX (Roberts et al., 2023) 和 Pathways 的单控制器编程范式, 配合 GSPMD 分区器 (Xu et al., 2021) 和 MegaScale XLA 编译器 (XLA, 2019).

## 3. Instruction Tuning

**3. 指令微调**

Pre-trained models are turned into instructiontuned models with a similar post-training approach as in Gemma 3. A significant difference is the addition of a thinking mode, where the model can output a reasoning trace before answering.

预训练模型经过和 Gemma 3 相近的后训练流程, 变成指令微调模型. 一个重要区别是加入了 thinking mode: 模型可以在回答前输出推理迹.

> **想:** thinking mode 有没有单独的分数列? 开和不开差多少?
> 没有单独一列. 本页表 5 标题说 「All models are in thinking mode unless explicitly stated」, Gemma 4 五列全是 thinking, 只有 Gemma 3 27B 标了 non-thinking. 第 6 页表 6 和第 17 页表 12 标题写 thinking, 第 8 页表 9 写 without thinking, 第 7 页表 7, 表 8 和第 4 页 Arena 表 4 都没说开没开. 全文没有一张表把同一个 Gemma 4 模型开与不开 thinking 并排放, 所以 thinking 本身带来多少提升, 本文给不出. thinking mode 属于 TestingTime 的投入: 推理时先写推理迹再作答, 多花的是生成推理迹的算力; 本文也没报告推理迹平均多长, 这部分开销同样无从估计. 开启方式见第 17 页表 11: 在开头的 system 轮加入 `<|think|>`.

**Data filtering.** We carefully optimize the data used in post-training to maximize model perfor-

mance. We filter examples that show certain personal information, unsafe or toxic model outputs, mistaken self-identification data, and duplicated examples. Including subsets of data that encourage better in-context attribution, hedging, and refusals to minimize hallucinations also improves performance on factuality metrics, without degrading model performance on other metrics.

**数据过滤.** 我们仔细优化后训练用的数据, 以尽量提升模型性能. 我们过滤掉含某些个人信息的样本, 不安全或有毒的模型输出, 错误的自我身份数据, 以及重复样本. 加入鼓励更好的上下文归因, 留有余地的表述 (hedging) 和拒答的数据子集来减少幻觉, 也提升了事实性指标, 且不损害其他指标上的表现.

**PT versus IT formatting.** All models share the same tokenizer, with some control tokens dedicated to IT formatting. A key difference is that PT models output an &lt;eos&gt; token at the end of generation, while IT models output &lt;turn|&gt; at the end of the generation. An example is given for IT in Table 11. Fine-tuning either model type thus requires adding their respective end tokens. We detail how to activate thinking and how models handle function calling in Table 11.

**PT 与 IT 的格式.** 所有模型共用同一个 tokenizer, 其中一部分控制 token 专用于 IT 格式. 一个关键区别是: PT 模型在生成结束时输出 `<eos>` token, IT 模型在生成结束时输出 `<turn|>`. IT 的示例见表 11. 因此微调任一类模型时, 都要加上各自的结束 token. 如何开启 thinking 以及模型如何处理函数调用, 详见表 11.

<!-- page 6 of 17 -->

Gemma 4 Technical Report

<table><tbody><tr><td rowspan="2"></td><td colspan="4">Gemma 4</td><td colspan="2">Gemma 3</td></tr><tr><td>31B</td><td>26B-A4B</td><td>12B</td><td>E4B</td><td>E2B</td><td>27B</td></tr><tr><td>MMMU Pro</td><td>76.9</td><td>73.8</td><td>69.1</td><td>52.6</td><td>44.2</td><td>49.7</td></tr><tr><td>MATH-Vision</td><td>85.6</td><td>82.4</td><td>79.7</td><td>59.5</td><td>52.4</td><td>46.0</td></tr><tr><td>MedXPertQA MM</td><td>61.3</td><td>58.1</td><td>48.7</td><td>28.7</td><td>23.5</td><td>-</td></tr><tr><td>InfographicVQA</td><td>92.0</td><td>89.3</td><td>88.4</td><td>70.0</td><td>63.9</td><td>70.6</td></tr><tr><td>OmniDocBench 1.5 ↓</td><td>0.131</td><td>0.149</td><td>0.164</td><td>0.181</td><td>0.290</td><td>0.365</td></tr></tbody></table>

Table 6 | Gemma 4 models performance on vision benchmarks at different resolutions (thinking). We use the maximal supported resolution (1120 vision tokens) and report results with 280 vision tokens in Table 12. Gemma 3 27B is non-thinking and uses Pan & Scan.

表 6 | Gemma 4 各模型在视觉基准上的表现 (thinking). 这里用最大支持分辨率 (1120 个视觉 token), 280 个视觉 token 的结果见表 12. Gemma 3 27B 为 non-thinking, 并使用 Pan & Scan.

> **看表:** 表 6 的分组表头对吗? 1120 和 280 两档分辨率之间, 哪个尺寸掉得最多?
> 分组表头错了: 「Gemma 4」 只跨 4 列, 「Gemma 3」 跨 2 列, 但下一行是 5 个 Gemma 4 尺寸加 1 个 Gemma 3 27B, 按标题应是 5 + 1. 和第 17 页表 12 (280 token) 对照, 掉得最多的是无编码器的 12B: InfographicVQA 从 88.4 掉到 58.7, 少了 29.7 分, 同一项 31B 少 9.2, 26B-A4B 少 11.5, E4B 少 15.2, E2B 少 19.3; OmniDocBench (越低越好) 从 0.164 升到 0.408, 在 280 档反而比 E4B 的 0.307 还差. 另外三项的掉幅都在 3 分以内, E2B 的 MATH-Vision 在 280 档还高了 0.6. 本文没有讨论这个现象. 我的猜测是: 其他尺寸每个 soft token 背后有 9 个 16px patch 经过编码器, 12B 每个 token 只是一次线性投影, token 少时细节损失更直接.

## 4. Evaluation of final models

**4. 最终模型评估**

In this section, we evaluate the IT models over a series of automated benchmarks and human evaluations across a variety of domains, as well as static benchmarks such as MMLU Pro.

本节在多个领域的一系列自动基准和人工评估上评估 IT 模型, 也包括 MMLU Pro 这类静态基准.

## 4.1. Human evaluation

**4.1. 人工评估**

We report the performance of our 31B and 26B-A4B models on Arena (Chiang et al., 2024) in blind side-by-side evaluations by human raters against other state-of-the-art models. We report Elo scores in Table 4. Gemma 4 31B is the top open model in the dense category, and both Gemma 4 31B and 26B-A4B show performance equal to much larger open models.

我们报告 31B 和 26B-A4B 在 Arena (Chiang et al., 2024) 上的表现: 由人工评分者做盲测并排比较, 对手是其他最先进的模型. Elo 分数见表 4. Gemma 4 31B 是 dense 类别里排名最高的开放模型, Gemma 4 31B 和 26B-A4B 的表现都与大得多的开放模型持平.

> **确认:** dense 和 MoE 放在同一张表里, 26B-A4B 这一列该和哪一列比?
> 本文没有做同算力或同显存的对照, 只能按用途自己挑列. 看部署显存, 第 3 页表 3 里 26B-A4B 的 bf16 权重要 52.0, 夹在 12B 的 24.0 和 31B 的 64.0 之间, 离 31B 更近, 这时该比 31B 那一列. 看每个 token 的计算量, 它的激活参数 3.8B 和 E4B 的有效 4.5B 同档, 这时该比 E4B 那一列. 两种比法结论不同. 对 31B, 第 5 页表 5 的 17 行里 26B-A4B 只在 Tau2 airline (76.0 对 75.0) 一行领先, Tau2 telecom (43.0 对 69.3) 和 Terminal Bench Hard (14.0 对 36.0) 差得最多. 对 E4B, 它在表 5, 表 6, 第 8 页表 9 的每一行都更高 (「-」 的格子除外). 它和 dense 12B 比也有几行落后: IFBench 72.0 对 74.0, Terminal Bench Hard 14.0 对 18.0, Tau2 telecom 43.0 对 54.4, 表 9 的 RULER 128k 89.8 对 91.2, LOFT 66.3 对 66.4. 第 4 页 Arena 表 4 只有 31B 和 26B-A4B 两个 Gemma 4, 最后一列同时列出了总参数和激活参数, 可以直接横比.

## 4.2. Static benchmarks

**4.2. 静态基准**

In Table 5, we show the performance of our final models across a variety of benchmarks compared to Gemma 3 27B. Gemma 4 31B is closest in size and significantly better across the board, while E2B roughly matches Gemma 3 27B performance with 10x less parameters. Table 6 shows the performance of Gemma 4 models on vision benchmarks, with E4B equaling or outperforming Gemma 3 27B on all evals. Tables 7 and 8 display the multilingual audio transcription and translation performance of E2B & E4B and of 12B respectively. Table 9 shows a leap on long-context capabilities between Gemma 3 27B and Gemma 4 models, with E4B outperforming Gemma 3 27B.

表 5 给出最终模型在多种基准上和 Gemma 3 27B 的对比. Gemma 4 31B 尺寸最接近, 且全面明显更好; E2B 参数少 10 倍, 表现大致与 Gemma 3 27B 相当. 表 6 给出 Gemma 4 在视觉基准上的表现, E4B 在所有评估上都等于或超过 Gemma 3 27B. 表 7 和表 8 分别给出 E2B, E4B 和 12B 的多语言音频转写与翻译表现. 表 9 显示 Gemma 4 相对 Gemma 3 27B 在长上下文能力上的跃升, E4B 也超过了 Gemma 3 27B.

> **对一下:** 这一段的 「roughly matches」, 「equaling or outperforming on all evals」, 「E4B outperforming Gemma 3 27B」, 逐行对得上吗?
> 都有例外. E2B 对 Gemma 3 27B (第 5 页表 5): E2B 在 MMLU Pro (60.0 对 67.6), MMMLU (67.4 对 70.7), Terminal Bench Hard (3.0 对 4.0), Tau2 airline (31.0 对 39.0) 四行落后, SciCode 持平, 其余领先; 而且比的是 thinking 的 E2B 和 non-thinking 的 27B, 见第 5 页 thinking 那条. E4B 对 Gemma 3 27B 的视觉 (本页表 6): InfographicVQA 是 70.0 对 70.6, E4B 略低; MedXPertQA MM 的 Gemma 3 一格是 「-」, 没法比. E4B 对 Gemma 3 27B 的长上下文 (第 8 页表 9): MTOB eng→kgv 半本书是 37.8 对 41.0, E4B 落后, 其余各项领先.

## 5. Responsibility, Safety, Security

**5. 责任, 安全与安保**

As open models become central to enterprise infrastructure, provenance and security are paramount. Gemma 4 undergoes the same rigorous safety evaluations as Gemini models. Responsibility, safety, and security are of utmost importance in the development workflow, ensuring that these language models are designed from the ground up for responsible AI development.

名称: 与 Gemini 模型相同的安全评估.

## 5.1. Governance & Assessment

**5.1. 治理与评估**

Our approach to assessing the benefits and risks of Gemma 4 reflects the foundation established in prior models, updated to account for its expanded multimodal capabilities. We maintain the belief that openness in AI can spread the benefits of these technologies across society, but this must be continuously evaluated against the risk of malicious uses that can cause individual and institutional harm (Weidinger et al., 2021).

名称: Weidinger et al. (2021).

Gemma 4 models were developed in partnership with internal safety and responsible AI teams. Releasing these models required careful scrutiny of the evolving risks associated with LLMs and an understanding of how models are deployed in the wild. While an open model shares innovation across the AI ecosystem, we remain committed to providing educational resources to users and monitoring downstream model usage.

名称: 内部安全团队, 负责任 AI 团队.

<!-- page 7 of 17 -->

Gemma 4 Technical Report

<table><tr><td colspan="13">CoVoST (CorpusBLEU ↑ )</td></tr><tr><td></td><td>Params</td><td>Size</td><td>ja → en</td><td>de → en</td><td>fr → en</td><td>es → en</td><td>it → en</td><td>ru → en</td><td>zh → en</td><td>AVG</td><td></td><td></td></tr><tr><td>Gemma 4 E2B</td><td rowspan="2">305M</td><td rowspan="2">87 MB</td><td>21.4</td><td>39.2</td><td>39.2</td><td>43.2</td><td>40.8</td><td>46.4</td><td>17.9</td><td>35.4</td><td></td><td></td></tr><tr><td>Gemma 4 E4B</td><td>25.5</td><td>42.0</td><td>41.0</td><td>44.8</td><td>43.0</td><td>49.4</td><td>21.9</td><td>38.2</td><td></td><td></td></tr><tr><td>Gemma 3n E2B</td><td rowspan="2">680M</td><td rowspan="2">390 MB</td><td>17.7</td><td>36.5</td><td>35.7</td><td>39.9</td><td>38.5</td><td>39.2</td><td>13.9</td><td>31.6</td><td></td><td></td></tr><tr><td>Gemma 3n E4B</td><td>22.3</td><td>39.1</td><td>38.4</td><td>41.8</td><td>40.4</td><td>43.7</td><td>17.4</td><td>34.7</td><td></td><td></td></tr><tr><td colspan="13">FLEURS ASR (WER ↓ , * = CER ↓ )</td></tr><tr><td></td><td>en</td><td>ko*</td><td>ja*</td><td>de</td><td>fr</td><td>hi</td><td>es</td><td>it</td><td>pt-br</td><td>ru</td><td>ar</td><td>zh*</td></tr><tr><td>Gemma 4 E2B</td><td>0.080</td><td>0.066</td><td>0.107</td><td>0.076</td><td>0.101</td><td>0.101</td><td>0.042</td><td>0.041</td><td>0.056</td><td>0.084</td><td>0.143</td><td>0.187</td></tr><tr><td>Gemma 4 E4B</td><td>0.065</td><td>0.053</td><td>0.078</td><td>0.061</td><td>0.080</td><td>0.086</td><td>0.035</td><td>0.032</td><td>0.046</td><td>0.068</td><td>0.162</td><td>0.136</td></tr><tr><td>Gemma 3n E2B</td><td>0.076</td><td>0.101</td><td>0.163</td><td>0.079</td><td>0.130</td><td>0.106</td><td>0.051</td><td>0.044</td><td>0.067</td><td>0.112</td><td>0.131</td><td>0.235</td></tr><tr><td>Gemma 3n E4B</td><td>0.066</td><td>0.073</td><td>0.111</td><td>0.065</td><td>0.098</td><td>0.089</td><td>0.041</td><td>0.034</td><td>0.053</td><td>0.087</td><td>0.101</td><td>0.203</td></tr></table>

Table 7 | Audio performance for Gemma 4 and Gemma 3n models. Top: CoVoST (S2TT prompt: transcribe then translate). Bottom: FLEURS ASR (transcription). Compared to Gemma 3n of corresponding sizes, Gemma 4 achieves a 12% (E2B) / 10% (E4B) relative improvement on translation and a 17% (E2B) / 12% (E4B) relative improvement on transcription, despite a 78% reduction in on-disk audio encoder footprint (from 390 MB to 87 MB after quantization).

表 7 | Gemma 4 与 Gemma 3n 的音频表现. 上: CoVoST (S2TT 提示: 先转写再翻译). 下: FLEURS ASR (转写). 与对应尺寸的 Gemma 3n 相比, Gemma 4 在翻译上相对提升 12% (E2B) / 10% (E4B), 在转写上相对提升 17% (E2B) / 12% (E4B), 同时音频编码器的磁盘占用减少 78% (量化后从 390 MB 降到 87 MB).

> **核对:** 标题里的 12% / 10% 和 17% / 12% 能用表里的数复算吗?
> 翻译能. 按 CoVoST 的 AVG 列, E2B 是 35.4 对 31.6, (35.4 - 31.6) / 31.6 约 12.0%; E4B 是 38.2 对 34.7, 约 10.1%. 转写没有 AVG 列, 我用 12 种语言的 WER 之和算: E4B 为 0.902 对 1.021, 相对降低约 11.7%, 对得上 12%; E2B 为 1.084 对 1.295, 约 16.3%, 改用逐语言相对降幅取平均约 14.3%, 两种算法都到不了 17%. 本文没写 17% 怎么算的. 另有几格是退步: 阿拉伯语 (ar) 两个尺寸都变差, E2B 为 0.143 对 0.131, E4B 为 0.162 对 0.101; E2B 的英语也从 0.076 变成 0.080.

<table><tr><td colspan="5">FLEURS ASR (WER ↓, * = CER ↓)</td></tr><tr><td>en</td><td>ko*</td><td>ja*</td><td>de</td><td>fr</td></tr><tr><td>0.063</td><td>0.057</td><td>0.080</td><td>0.053</td><td>0.081</td></tr><tr><td>es</td><td>it</td><td>pt-br</td><td>ru</td><td>ar</td></tr><tr><td>0.038</td><td>0.030</td><td>0.047</td><td>0.068</td><td>0.070</td></tr><tr><td colspan="5">CoVoST (XX → EN, CorpusBLEU ↑)</td></tr><tr><td>ja</td><td>de</td><td>fr</td><td>es</td><td>it ru</td></tr><tr><td>26.4</td><td>41.9</td><td>42.5</td><td>44.6</td><td>43.3 50.5</td></tr></table>

Table 8 | Audio performance of Gemma 4 12B model on supported languages, demonstrating that competitive audio-text performance can be achieved without a dedicated audio encoder.

表 8 | Gemma 4 12B 在其支持语言上的音频表现, 说明不用专门的音频编码器也能达到有竞争力的音频-文本表现.

> **回看:** 无编码器的 12B 在音频上和带编码器的 E4B 比, 差在哪?
> 把表 8 和本页表 7 的 E4B 行对齐看. FLEURS 两表共有的 10 种语言里, 12B 在德语 (0.053 对 0.061) 和阿拉伯语 (0.070 对 0.162) 明显更好, 其余 8 种相差都在 0.004 以内; 去掉阿拉伯语, 两者 9 种语言的 WER 平均都约 0.057. CoVoST 共有的 6 种语言, 12B 平均 41.5, E4B 平均 41.0. 表 8 少了印地语 (hi) 和中文 (zh), 标题只说 「supported languages」, 本文没说 12B 的音频是否不支持这两种语言. 表 8 最后一格的 「it ru」 和 「43.3 50.5」 是两列粘在一起, 应读作 it 43.3, ru 50.5. 12B 的规模也比 E4B 大得多, 表 8 只能说明去掉音频编码器没有拖后腿, 不能把结果单独归到无编码器结构上.

## 5.2. Safety Policies and Train-Time Mitigations

**5.2. 安全政策与训练阶段缓解**

A key pillar of Gemma’s safety approach is aligning our fine-tuned models with Google’s AI principles and safety policies. These policies aim to prevent our generative models from producing harmful content, specifically:

名称: Google AI 原则, 安全政策.

• Content related to child sexual abuse material

(CSAM) and exploitation;

• Dangerous content, e.g., promoting suicide, or instructing in activities that could cause realworld harm;

• Sexually explicit content;

• Hate speech, e.g., dehumanizing members of protected groups;

• Harassment, e.g., encouraging violence against people.

名称 (政策类别): CSAM 与剥削; 危险内容; 露骨色情内容; 仇恨言论; 骚扰.

To mitigate these risks, Gemma 4 models underwent careful input data pre-processing and scrutiny. The training data was specifically filtered for the removal of certain personal information and other sensitive data to guard against privacy violations. Post-training evaluations and train-time mitigations were also implemented to align the model with our safety policies.

名称: 输入数据预处理, 个人信息与敏感数据过滤, 后训练评估, 训练阶段缓解.

## 5.3. Safety Evaluations

**5.3. 安全评估**

We conduct rigorous automated and human evaluations to understand the potential harms our models might cause. For all areas of safety testing, we saw major improvements in every category of content safety relative to previous Gemma models. Overall, Gemma 4 models significantly out-

名称: 自动评估, 人工评估; 对比对象为此前的 Gemma 模型. 分数: 正文未给数值.

<!-- page 8 of 17 -->

Gemma 4 Technical Report

| Benchmark | Metric Context length | 31B | Ge26B-A4B | mma 4 12B | E4B | E2B | Gemma 3 27B |
| --- | --- | --- | --- | --- | --- | --- | --- |
| RULER LOFT Text Retrieval | 32kAccuracy128k Recall@k 128k | 96.896.479.5 | 97.389.866.3 | 96.491.266.4 | 95.286.658.5 | 83.070.450.5 | 91.166.08.6 |
| GraphWalks | F1 &lt;128k | 82.3 | 72.6 | 71.0 | 50.9 | 4.1 | 32.8 |
| MTOB | ∼128k (Half book) chrF | 52.9 | 50.0 | 45.1 | 37.8 | 15.4 | 41.0 |
| (eng→kgv) | ∼256k (Full book) | 54.3 | 48.9 | 41.9 | - | - | - |
| MTOB | ∼128k (Half book) chrF | 48.6 | 45.0 | 37.3 | 34.6 | 28.2 | 31.2 |
| (kgv→eng) | ∼256k (Full book) | 46.2 | 42.7 | 32.9 | - | - | - |

Table 9 | Long context performance of Gemma 3 and Gemma 4 models (without thinking).

表 9 | Gemma 3 与 Gemma 4 各模型的长上下文表现 (不开 thinking).

perform Gemma 3 and 3n models in improving safety, while keeping unjustified refusals low.

名称: 对比对象 Gemma 3, Gemma 3n; 指标名称: 不当拒答. 分数: 未给数值.

Importantly, all testing was conducted without safety filters to accurately evaluate the model’s inherent capabilities and behaviors. For both textto-text and image-to-text modalities, and across all model sizes, the models produced minimal policy violations. We balance development speed with targeted safety testing, upholding the commitments laid out in our Frontier Safety Framework (Google DeepMind, 2024).

名称: Frontier Safety Framework (Google DeepMind, 2024); 模态名称: 文本到文本, 图像到文本. 分数与阈值: 未给数值.

## 5.4. Ethical Considerations and Risk Mitigation

**5.4. 伦理考量与风险缓解**

The development of LLMs introduces specific ethical considerations. In making Gemma 4, we focused heavily on:

名称: 伦理考量.

• **Bias and Fairness**: LLMs trained on large-scale text and image data can reflect embedded sociocultural biases. We encourage developers to perform continuous monitoring (using evaluation metrics and human review) and explore debiasing techniques during model fine-tuning.

• **Misinformation and Misuse**: LLMs can be misused to generate false or misleading text. We provide technical limitations, developer education, and guidelines for responsible use within the Responsible Generative AI Toolkit to mitigate malicious applications.

• **Privacy Considerations**: While our training datasets were filtered to remove certain personal information and other sensitive data, developers are strongly encouraged to adhere to local privacy regulations and implement privacy-preserving techniques in their applications.

名称: Bias and Fairness (偏见与公平); Misinformation and Misuse (错误信息与滥用); Responsible Generative AI Toolkit; Privacy Considerations (隐私考量).

## 5.5. Our Approach to Responsible Open Models

**5.5. 我们对负责任开放模型的做法**

Designing safe, secure, and responsible applications requires a system-level approach that mitigates risks associated with specific use cases and environments. We provide guidelines, mechanisms, and safeguards for content safety, and encourage developers to implement appropriate configurations based on their product policies. We will continue to adopt safety mitigations proportionate to potential risks, sharing these models with the community only when confident that the benefits significantly outweigh foreseeable risks.

名称: 系统级做法; 内容安全的指南, 机制与防护.

## 6. Discussion and Conclusion

**6. 讨论与结论**

In this technical report, we presented Gemma 4, an open-weight model family featuring multimodal dense and MoE architectures designed for varied hardware environments. Gemma 4 models come with a thinking mode in which they generate reasoning traces prior to responding, improving overall performance. We introduced a unified, encoder-free architecture that processes

这份技术报告介绍了 Gemma 4: 一个开放权重模型家族, 包含多模态的 dense 与 MoE 架构, 面向多种硬件环境. Gemma 4 模型带有 thinking mode, 作答前先生成推理迹, 整体表现因此提升. 我们提出了一种统一的无编码器架构, 用来处理原始音频和图像 patch.

<!-- page 9 of 17 -->

Gemma 4 Technical Report

raw audio and image patches. We also alleviated long-context memory limitations via better local-to-global attention ratios, positional encoding, and KV cache sharing. We increased the overall compute efficiency via QAT and memory efficiency via MTP drafters. Gemma 4 models demonstrate a leap in performance compared to Gemma 3 across benchmarks, and human evaluations demonstrate that Gemma 4 performs comparably to significantly larger open models, providing a scalable foundation for edge deployment and reasoning while supporting open research.

我们还通过更好的 local 与 global attention 比例, 位置编码和 KV cache 共享, 缓解了长上下文的显存限制. 我们通过 QAT 提升了整体计算效率, 通过 MTP drafter 提升了显存效率. Gemma 4 在各项基准上相对 Gemma 3 都有性能跃升, 人工评估也表明 Gemma 4 的表现与明显更大的开放模型相当, 为端侧部署和推理提供了可扩展的基础, 同时支持开放研究.

## References

**参考文献**

J. L. Ba, J. R. Kiros, and G. E. Hinton. Layer normalization. arXiv preprint arXiv:1607.06450, 2016.

F. Barbero, A. Vitvitskyi, C. Perivolaropoulos, R. Pascanu, and P. Veličković. Round and round we go! what makes rotary positional encodings useful? In The Thirteenth International Conference on Learning Representations, 2025.

P. Barham, A. Chowdhery, J. Dean, S. Ghemawat, S. Hand, D. Hurt, M. Isard, H. Lim, R. Pang, S. Roy, B. Saeta, P. Schuh, R. Sepassi, L. E. Shafey, C. A. Thekkath, and Y. Wu. Pathways: Asynchronous distributed dataflow for ml, 2022.

V. Barres, H. Dong, S. Ray, X. Si, and K. Narasimhan. 𝜏<sup>2</sup>-bench: Evaluating conversational agents in a dual-control environment, 2025.

W.-L. Chiang, L. Zheng, Y. Sheng, A. N. Angelopoulos, T. Li, D. Li, H. Zhang, B. Zhu, M. Jordan, J. E. Gonzalez, and I. Stoica. Chatbot arena: An open platform for evaluating llms by human preference, 2024.

A. Conneau, M. Ma, S. Khanuja, Y. Zhang, V. Axelrod, S. Dalmia, J. Riesa, C. Rivera, and A. Bapna. Fleurs: Few-shot learning evaluation of universal representations of speech. In 2022 IEEE Spoken Language Technology Workshop (SLT), pages 798–805. IEEE, 2023.

A. Dosovitskiy, L. Beyer, A. Kolesnikov, D. Weis senborn, X. Zhai, T. Unterthiner, M. Dehghani,

M. Minderer, G. Heigold, S. Gelly, J. Uszkoreit, and N. Houlsby. An image is worth 16x16 words: Transformers for image recognition at scale. In ICLR, 2021.

C. for AI Safety et al. A benchmark of expert-level academic questions to assess ai capabilities. Nature, 649(8099):1139–1146, 2026.

Gemini Team. Gemini 2.5: Pushing the frontier with advanced reasoning, multimodality, long context, and next generation agentic capabilities. arXiv preprint arXiv:2507.06261, 2025.

Gemma Team. Gemma: Open models based on gemini research and technology, 2024a.

Gemma Team. Gemma 2: Improving open language models at a practical size. arXiv preprint arXiv:2408.00118, 2024b.

Gemma Team. Gemma 3: Technical report. arXiv preprint arXiv:2503.19786, 2025a.

Gemma Team. Gemma 3n. [https://deepmind.google/models/gemma/gemma-3n/](https://deepmind.google/models/gemma/gemma-3n/),2025b.

Google DeepMind. Introducing the frontier safety framework. [https://deepmind.google/blog/introducing-the-frontier-safety-framework/](https://deepmind.google/blog/introducing-the-frontier-safety-framework/), 2024.

A. Gulati, J. Qin, C.-C. Chiu, N. Parmar, Y. Zhang, J. Yu, W. Han, S. Wang, Z. Zhang, Y. Wu, et al. Conformer: Convolution-augmented transformer for speech recognition. arXiv preprint arXiv:2005.08100, 2020.

A. Henry, P. R. Dachapally, S. S. Pawar, and Y. Chen. Query-key normalization for transformers. In Findings of the Association for Computational Linguistics: EMNLP 2020, pages 4246–4253, 2020.

B. Heo, S. Park, D. Han, and S. Yun. Rotary position embedding for vision transformer. In European Conference on Computer Vision, pages 289–305. Springer, 2024.

C.-P. Hsieh, S. Sun, S. Kriman, S. Acharya, D. Rekesh, F. Jia, Y. Zhang, and B. Ginsburg. Ruler: What’s the real context size of your

参考文献条目保留原文, 不译.

<!-- page 10 of 17 -->

Gemma 4 Technical Report

long-context language models? arXiv preprint arXiv:2404.06654, 2024.

B. Jacob, S. Kligys, B. Chen, M. Zhu, M. Tang, A. Howard, H. Adam, and D. Kalenichenko. Quantization and training of neural networks for efficient integer-arithmetic-only inference. In CVPR, 2018.

R. A. Jacobs, M. I. Jordan, S. J. Nowlan, and G. E. Hinton. Adaptive mixtures of local experts. Neural Computation, 3:79–87, 1991.

N. Jain, A. Gu, W.-D. Li, F. Yan, T. Zhang, S. Wang, A. Solar-Lezama, K. Sen, and I. Stoica. Livecodebench: Holistic and contamination free evaluation of large language models for code. In International Conference on Learning Representations, volume 2025, pages 58791–58831, 2025.

A. Kayyam, A. M. Gopal, and M. A. Lewis. Do transformers need three projections? systematic study of qkv variants. arXiv preprint arXiv:2606.04032, 2026.

M. Kazemi, B. Fatemi, H. Bansal, J. Palowitch, C. Anastasiou, S. V. Mehta, L. K. Jain, V. Aglietti, D. Jindal, P. Chen, et al. Big-bench extra hard. arXiv preprint arXiv:2502.19187, 2025.

T. Kudo and J. Richardson. SentencePiece: A simple and language independent subword tokenizer and detokenizer for neural text processing. 2018.

J. Lee, A. Chen, Z. Dai, D. Dua, D. S. Sachan, M. Boratko, Y. Luan, S. M. R. Arnold, V. Perot, S. Dalmia, H. Hu, X. Lin, P. Pasupat, A. Amini, J. R. Cole, S. Riedel, I. Naim, M.-W. Chang, and K. Guu. Can long-context language models subsume retrieval, rag, sql, and more? ArXiv, 2024.

Y. Leviathan, M. Kalman, and Y. Matias. Fast inference from transformers via speculative decoding. In Proceedings of the 40th International Conference on Machine Learning, ICML’23. JMLR.org, 2023.

Y. Li, F. Wei, C. Zhang, and H. Zhang. EAGLE: Speculative sampling requires rethinking feature uncertainty. In International Conference on Machine Learning, 2024.

M. Mathew, V. Bagal, R. Tito, D. Karatzas, E. Valveny, and C. Jawahar. Infographicvqa. In WACV, 2022.

M. A. Merrill, A. G. Shaw, N. Carlini, B. Li, H. Raj, I. Bercovich, L. Shi, J. Y. Shin, T. Walshe, E. K. Buchanan, et al. Terminal-bench: Benchmarking agents on hard, realistic tasks in command line interfaces. arXiv preprint arXiv:2601.11868, 2026.

OpenAI. Openai o1 system card. arXiv preprint arXiv:2412.16720, 2024.

OpenAI. GraphWalks dataset, 2025.

L. Ouyang, Y. Qu, H. Zhou, J. Zhu, R. Zhang, Q. Lin, B. Wang, Z. Zhao, M. Jiang, X. Zhao, et al. Omnidocbench: Benchmarking diverse pdf document parsing with comprehensive annotations. In Proceedings of the IEEE/CVF Conference on Computer Vision and Pattern Recognition, pages 24838–24848, 2025.

L. Phan, A. Gatti, Z. Han, N. Li, J. Hu, H. Zhang, C. B. C. Zhang, M. Shaaban, J. Ling, S. Shi, et al. Humanity’s last exam. arXiv preprint arXiv:2501.14249, 2025.

V. Pyatkin, S. Malik, V. Graf, H. Ivison, S. Huang, P. Dasigi, N. Lambert, and H. Hajishirzi. Generalizing verifiable instruction following. Advances in Neural Information Processing Systems, 38, 2026.

D. Rein, B. L. Hou, A. C. Stickland, J. Petty, R. Y. Pang, J. Dirani, J. Michael, and S. R. Bowman. Gpqa: A graduate-level google-proof q&a benchmark. ArXiv, abs/2311.12022, 2023.

J. Ren, S. Rajbhandari, R. Y. Aminabadi, O. Ruwase, S. Yang, M. Zhang, D. Li, and Y. He. Zero-offload: Democratizing billionscale model training. In USENIX, 2021.

A. Roberts, H. W. Chung, G. Mishra, A. Levskaya, J. Bradbury, D. Andor, S. Narang, B. Lester, C. Gaffney, A. Mohiuddin, et al. Scaling up models and data with t5x and seqio. JMLR, 2023.

N. Shazeer. Fast transformer decoding: One writehead is all you need. CoRR, abs/1911.02150, 2019.

参考文献续, 条目保留原文.

<!-- page 11 of 17 -->

Gemma 4 Technical Report

G. Tanzer, M. Suzgun, E. Visser, D. Jurafsky, and L. Melas-Kyriazi. A benchmark for learning to translate a new language from one grammar book. In The Twelfth International Conference on Learning Representations, 2024.

K. Team, T. Bai, Y. Bai, Y. Bao, S. Cai, Y. Cao, Y. Charles, H. Che, C. Chen, G. Chen, et al. Kimi k2. 5: Visual agentic intelligence. arXiv preprint arXiv:2602.02276, 2026.

Q. Team. Qwen3. 5-omni technical report. arXiv preprint arXiv:2604.15804, 2026.

M. Tian, L. Gao, S. D. Zhang, X. Chen, C. Fan, X. Guo, R. Haas, P. Ji, K. Krongchon, Y. Li, et al. Scicode: A research coding benchmark curated by scientists. Advances in Neural Information Processing Systems, 37:30624–30650, 2024.

A. Vaswani, N. Shazeer, N. Parmar, J. Uszkoreit, L. Jones, A. N. Gomez, L. Kaiser, and I. Polosukhin. Attention is all you need. 2017.

K. Vodrahalli, S. Ontanon, N. Tripuraneni, K. Xu, S. Jain, R. Shivanna, J. Hui, N. Dikkala, M. Kazemi, B. Fatemi, et al. Michelangelo: Long context evaluations beyond haystacks via latent structure queries. arXiv preprint arXiv:2409.12640, 2024.

C. Wang, J. Pino, A. Wu, and J. Gu. Covost: A diverse multilingual speech-to-text translation corpus. In Proceedings of the Twelfth Language Resources and Evaluation Conference, pages 4197–4203, 2020.

K. Wang, J. Pan, W. Shi, Z. Lu, H. Ren, A. Zhou, M. Zhan, and H. Li. Measuring multi-modal mathematical reasoning with mathvision dataset. Advances in Neural Information Processing Systems, 37:95095–95169, 2024a.

Y. Wang, X. Ma, G. Zhang, Y. Ni, A. Chandra, S. Guo, W. Ren, A. Arulraj, X. He, Z. Jiang, et al. Mmlu-pro: A more robust and challenging multi-task language understanding benchmark. In NeurIPS, 2024b.

L. Weidinger, J. Mellor, M. Rauh, C. Griffin, J. Uesato, P.-S. Huang, M. Cheng, M. Glaese, B. Balle, A. Kasirzadeh, Z. Kenton, S. Brown, W. Hawkins, T. Stepleton, C. Biles, A. Birhane,

J. Haas, L. Rimell, L. A. Hendricks, W. Isaac, S. Legassick, G. Irving, and I. Gabriel. Ethical and social risks of harm from language models, 2021.

B. Xiao, B. Xia, B. Yang, B. Gao, B. Shen, C. Zhang, C. He, C. Lou, F. Luo, G. Wang, et al. Mimo-v2-flash technical report. arXiv preprint arXiv:2601.02780, 2026.

XLA. Xla: Optimizing compiler for tensorflow, 2019.

A. Xu, B. Lin, B. Xue, B. Wang, B. Xu, B. Wu, B. Zhang, C. Lin, C. Dong, C. Ling, et al. Deepseek-v4: Towards highly efficient milliontoken context intelligence. arXiv preprint arXiv:2606.19348, 2026.

Y. Xu, H. Lee, D. Chen, B. A. Hechtman, Y. Huang, R. Joshi, M. Krikun, D. Lepikhin, A. Ly, M. Maggioni, R. Pang, N. Shazeer, S. Wang, T. Wang, Y. Wu, and Z. Chen. GSPMD: general and scalable parallelization for ML computation graphs. 2021.

X. Yue, T. Zheng, Y. Ni, Y. Wang, K. Zhang, S. Tong, Y. Sun, B. Yu, G. Zhang, H. Sun, et al. Mmmu-pro: A more robust multi-discipline multimodal understanding benchmark. In Proceedings of the 63rd Annual Meeting of the Association for Computational Linguistics (Volume 1: Long Papers), pages 15134–15186, 2025.

A. Zeng, X. Lv, Z. Hou, Z. Du, Q. Zheng, B. Chen, D. Yin, C. Ge, C. Huang, C. Xie, et al. Glm-5: from vibe coding to agentic engineering. arXiv preprint arXiv:2602.15763, 2026.

B. Zhang and R. Sennrich. Root mean square layer normalization. 2019.

Y. Zhang, W. Han, J. Qin, Y. Wang, A. Bapna, Z. Chen, N. Chen, B. Li, V. Axelrod, G. Wang, et al. Google usm: Scaling automatic speech recognition beyond 100 languages. arXiv preprint arXiv:2303.01037, 2023.

J. Zhou, T. Lu, S. Mishra, S. Brahma, S. Basu, Y. Luan, D. Zhou, and L. Hou. Instructionfollowing evaluation for large language models. arXiv preprint arXiv:2311.07911, 2023.

参考文献续, 条目保留原文.

<!-- page 12 of 17 -->

Gemma 4 Technical Report

Y. Zuo, S. Qu, Y. Li, Z. Chen, X. Zhu, E. Hua, K. Zhang, N. Ding, and B. Zhou. Medxpertqa: Benchmarking expert-level medical reasoning and understanding. arXiv preprint arXiv:2501.18362, 2025.

参考文献续, 条目保留原文.

<!-- page 13 of 17 -->

Gemma 4 Technical Report

## Core contributors

**核心贡献者**

Sherif El Abd Vaibhav Aggarwal Robin Algayres Alek Andreev Olivier Bachem Ian Ballantyne Cormac Brick Victor Cărbune Michelle Casbon Mayank Chaturvedi Aditya Chawla Victor Cotruta Alice Coucke Phil Culliton Robert Dadashi Lucas Dixon Mohamed Elhawaty Utku Evci Clément Farabet Johan Ferret Filippo Galgani Sertan Girgin Jean-Bastien Grill Maarten Grootendorst Jiaxian Guo Cassidy Hardin

作者名单保留原文.

## Contributors

**贡献者**

Nicolas Aagnes Abdelrahman Abdelhamed Jakub Adamek Shivani Agrawal Shubham Agrawal Ibrahim Alabdulmohsin Jean Baptiste Alayrac Uri Alon Chandramouli Amarnath Ankesh Anand Chrysovalantis Anastasiou Setareh Ariafar François-Xavier Aubet Kyriakos Axiotis Federico Barbero Joelle Barral

Yanzhang He Steven M. Hernandez Omri Homburger Léonard Hussenot Juyeong Ji Armand Joulin Aishwarya Kamath Parnian Kassraie Olivier Lacombe Preethi Lahoti Gaël Liu Gus Martins Luciano Martins Tatiana Matejovicova Ramona Merhej Nikola Momchev Sneha Mondal Ryan Mullins Sindhu Raghuram Panyam Shreya Pathak Sarah Perrin André Susano Pinto Etienne Pot Angéline Pouget Alexandre Ramé Sabela Ramos

Alexei Bendebury Urs Bergmann Stanley Bileschi Kat Black Mathieu Blondel Sebastian Borgeaud Arthur Bražinskas Ryan Burnell Robert Busa-Fekete Mu Cai Daniele Calandriello Glenn Cameron Charlotte Caucheteux Rahma Chaabouni Garima Chadha Jetha Chan

Douglas Reid David Rim Morgane Rivière Karsten Roth Louis Rouillard Omar Sanseviero Pier Giuseppe Sessa Shane Settle Danila Sinopalnikov Sara Smoot Piotr Stanczyk Andreas Steiner Lawrence Stewart Ilya Tolstikhin Michael Tschannen Anton Tsitsulin Nino Vieillard Renjie Wu Pingmei Xu Haichuan Yang Edouard Yvinec Biao Zhang Li Zhang Joe Zou

Blake Jianhang Chen Jesse Chen Lin Chen Xu Chen Derek Cheng Tzu-hsiang Chien Nikolai Chinaev Yi Chou Zhaohui Chu Benjamin Coleman Pooja Consul Sam Conway-Rahman Scott Crowell Dylan Cutler Vivek Dani Samira Daruki

作者名单保留原文.

<!-- page 14 of 17 -->

Gemma 4 Technical Report

Anil Das Daniel Deutsch Nishanth Dikkala Li Ding Qiuhan Ding Shenil Dodhia Konstantin Donhauser Tulsee Doshi Anca Dragan Alex Druinsky Sahil Dua Zoltan Egyed Danielle Eisenbud Daniel Eppens Cindy Fan Bahare Fatemi Yassir Fathullah Vlad Feinberg Milen Ferev Sebastian Flennerhag Takumi Fujimoto João Gabriel Oliveira Isaac Galatzer-Levy João Gante Simon Geisler Soham Ghosal Antonious M. Girgis Tamara von Glehn Alec Go Alhaad Gokhale Alex Grills Yiming Gu Mayank Gupta Pramod Gupta Guru Guruganesh Raia Hadsell Hamza Harkous Jitendra Harlalka Demis Hassabis Anja Hauth Joe Heyward Arian Hosseini Chih-Yang Hsia I-Hung Hsu Xiaopeng Huang Yangsibo Huang Kevin Hui Adrian Hutter Te I

Fotis Iliopoulos Advait Jain Ganesh Jawahar Ziwei Ji Qilin Jin Melvin Johnson Kandarp Joshi Arun Kandoor Wang-Cheng Kang Koray Kavukcuoglu Mehran Kazemi Kathleen Kenealy Amr Khalifa Phoebe Kirk Ivan Korotkov Suraj Kothawade Vitaly Kovalev Neel Kovelamudi Adam Kraft Ravin Kumar Vivek Kumar Harish Kuppam Justin Lannin Chen-Yu Lee Seungji Lee Dmitry Lepikhin Alon Levkovitch Dongdong Li Qiujia Li Valentin Liévin Ethan Lin Ziqian Lin Casper Liu Tianlin Liu Tianqi Liu Xin Liu Ivan Lobov Mayank Lunayach Min Ma Gagan Madan Andrii Maksai Eric Malmi Michal Matuszak Daniel McDuff Gaurav Menghani Maciej Mikuła Daniil Mirylenka Karolis Misiunas Vedant Misra

Andreea Mitran Kareem Mohamed Maksim Mukha Eric Noland James O’Donnell Brendan O’Donoghue Kate Olszewska Bernett Orlando Wanqiong Pan Rina Panigrahy Unnati Parekh Nicolas Perez-Nieves Chunjong Park Eric Paskie Liqian Peng Bryce Petrini Slav Petrov Jonas Pfeiffer Bilal Piot Martyna Plomecka Siim Poder Octavio Ponce Arijit Pramanik David Racz Anish Rajan Michelle Ramanovich Anand Rao Marvin Ritter Vitor Rodrigues Evan Rosen Mikołaj Rybiński Noveen Sachdeva Michaël E. Sander Rohit Sathyanarayana Sagar Savla Samuel Schmidgall Tal Schuster George Scrivener Benoit Seguin Andrew Sellergren Aliaksei Severyn Izhak Shafran Dhruv Shah Bobak Shahriari Yuan Shangguan Ashish Shenoy Pradeep Shenoy Rakesh Shivanna Pauline Sho

作者名单续, 保留原文.

<!-- page 15 of 17 -->

Gemma 4 Technical Report

| Lucas Spangher | Petar Veličković | Jun Yan |
| --- | --- | --- |
| Wojciech Stokowiec | Malini Pooni Venkat | Antoine Yang |
| Tim Strother | Sagar Gubbi Venkatesh | Lin Yang |
| Yao Su | Vidya Venkiteswaran | Ming-Hsuan Yang |
| Yinghao Sun | Francesco Visin | Ziyu Ying |
| Mukund Sundararajan | Alex Vitvitskyi | Jae Hyeon Yoo |
| Andrea Tacchetti | Kiran Vodrahalli | Morteza Zadimoghaddam |
| Mor Hazan Taege | Weiyi Wang | Sajjad Zafar |
| Pouya Tafti | Xin Wang | Fred Zhang |
| Jean Tarbouriech | Tris Warkentin | Jiageng Zhang |
| Chetan Tekur | Jan Wassenberg | Jianyi Zhang |
| Shantanu Thakoor | John Wieting | Xiaofan Zhang |
| Rahul Thapa | Cindy Wu | Chao Zhao |
| Madeleine Traverse | Lechao Xiao | David Zhou |
| Lenart Treven | Hao Xu | Chen Zou |
| Tao Tu | Yuhui Xu |  |
| Chien Te Tung | Fuzhao Xue |  |
| Çağlar Ünlü | Arun Yadav |  |

作者名单续, 保留原文.

<!-- page 16 of 17 -->

572x1024 pixels (1:1.79)

572x1024 像素 (1:1.79)

Gemma 4 Technical Report

## Appendix

**附录**

**Conversation format.** We give an example of a conversation including thinking, function definition and function calling in Table 11.

**对话格式.** 表 11 给出一段包含 thinking, 函数定义和函数调用的对话示例.

**Vision.** We detail the vision encoder architecture in Table 10. We then illustrate how images are resized before being fed to the vision encoder in Figure 2, and detail the resizing algorithm in Algorithm 1. We display the vision benchmark scores of Gemma 4 models at low resolution $( N _ { m a x } = 2 8 0 )$ in Table 12.

**视觉.** 视觉编码器的结构见表 10. 图 2 演示图像在送入视觉编码器前如何调整尺寸, 算法 1 给出具体的调整算法. Gemma 4 在低分辨率 (N_max = 280) 下的视觉基准分数见表 12.

| Total Params | $d_{model}$ | $d_{MLP}$ | $N_{heads}$ | $N_{layers}$ |
| --- | --- | --- | --- | --- |
| 550M | 1152 | 4304 | 16 | 27 |
| 150M | 768 | 3072 | 12 | 16 |

Table 10 | Vision encoder architecture.

表 10 | 视觉编码器结构.

![Image block](images/p16-mostly-aspectpreserving-resize.png)

mostly aspectpreserving resize

基本保持宽高比的尺寸调整

k=3, sl=10, ps=16

k=3 (池化核大小), sl=10 (序列长度上限), ps=16 (patch 大小)

![Image block](images/p16-96x192-pixels-1-2.png)

96x192 pixels (1:2)

96x192 像素 (1:2)

8 tokens = 72 patches

8 个 token = 72 个 patch

Figure 2 | Image resizing. Here we use patch\_size=16, pooling\_kernel $\mathbf { s i z e } { = } 3 ,$ $\mathtt { m a x \_ s o f t \_ t o k e n s { = } 1 0 }$ . The image is thus first resized to $2 \times 4$ pooled patches (each of size $4 8 \mathrm { p x } \times 4 8 \mathrm { p x } )$ , which is the closest match that results in a sequence length below the targeted 10. The 72 patches (each of size $1 6 \mathrm { p x } \times 1 6 \mathrm { p x } )$ are then processed by the vision encoder, the vision encoder representations are pooled $3 \times 3 ]$ , and the resulting 8 soft tokens are processed by the LLM backbone.

图 2 | 图像尺寸调整. 这里取 patch_size=16, pooling_kernel_size=3, max_soft_tokens=10. 图像先被调整为 2×4 个池化 patch (每个 48px×48px), 这是序列长度低于目标 10 的最接近选项. 随后 72 个 patch (每个 16px×16px) 经视觉编码器处理, 编码器表示再做 3×3 池化, 得到的 8 个 soft token 交给 LLM 主干处理.

<div class="docvortex-algorithm" style="white-space: pre-wrap; font-family:monospace;">
Algorithm 1 Aspect-Ratio Preserving Image Resizing (see also Figure 2)
Require: Image $\mathbf{I} \in \mathbb{R}^{H \times W \times C}$, patch size $p$, max tokens $N_{\max}$, pooling kernel size $k$
    $m \leftarrow k \cdot p$ $\triangleright$ Pooled patch size
    $T \leftarrow N_{\max} \cdot m^2$ $\triangleright$ Ideal scaling factor
    $f \leftarrow \sqrt{T/(H \cdot W)}$ $\triangleright$ Round down
    $H_{\text{ideal}} \leftarrow f \cdot H$ $\triangleright$ Round down
    $W_{\text{ideal}} \leftarrow f \cdot W$ $\triangleright$ Round down
    $H_{\text{target}} \leftarrow \lfloor H_{\text{ideal}}/m \rfloor \cdot m$ $\triangleright$ Round down
    $W_{\text{target}} \leftarrow \lfloor W_{\text{ideal}}/m \rfloor \cdot m$ $\triangleright$ Round down
    $\mathbf{I}_{\text{resized}} \leftarrow \text{BicubicResize}(\mathbf{I}, H_{\text{target}}, W_{\text{target}})$
    return $\mathbf{I}_{\text{resized}}$
</div>

算法 1 保持宽高比的图像尺寸调整 (另见图 2). 输入: 图像 I (H × W × C), patch 大小 p, 最大 token 数 N_max, 池化核大小 k. 步骤: m = k × p, 即池化 patch 的边长; T = N_max × m², 即目标像素总数; f = sqrt(T / (H × W)); H_ideal = f × H, W_ideal = f × W; H_target = floor(H_ideal / m) × m, W_target = floor(W_ideal / m) × m, 两者都向下取到 m 的倍数; 最后用双三次插值把 I 调整为 H_target × W_target 并返回.

> **再看:** 用算法 1 复算图 2 的例子, 能得到 96×192 和 8 个 token 吗?
> 能. 原图 572×1024 (本页顶部那行), N_max = 10, k = 3, p = 16, 所以 m = 48, T = 10 × 48² = 23,040, f = sqrt(23,040 / (572 × 1024)), 约 0.198. 572 × 0.198 约 113.4, 向下取到 48 的倍数是 96; 1024 × 0.198 约 203.1, 取到 192. 结果是 96×192, 池化 patch 2 × 4 = 8 个, 16px patch 6 × 12 = 72 个, 和图 2 的标注一致. 算法框里的行尾注释整体错开了一行: 「Ideal scaling factor」 标在 T 那一行, f 那一行标的却是 「Round down」, 而 f 本身并不取整, 真正取整的只有 H_target 和 W_target 两行. 12B 没有视觉编码器, 第 17 页表 12 仍给了它 N_max = 280 的分数, 本文没说 12B 是否也走算法 1; 按第 3 页 48×48 patch 的说法, 取 m = 48 最说得通, 这是我的推断.

<!-- page 17 of 17 -->

```txt
Toggle thinking mode.
Declare function.
User: I want you to book a train ticket for me.
Model: <...> Where would you like to go?
User: To Rome.
Model: <...> Looking for available tickets: <function call>
```

对话示意: 开启 thinking mode. 声明函数. 用户: 我想让你帮我订一张火车票. 模型: `<...>` 你想去哪里? 用户: 去罗马. 模型: `<...>` 正在查找可用车票: `<function call>`.

```tsv
Context	Formatting
Thinking toggle	<|think|>
Function declaration	<|tool>declaration:...<tool|>
Function call	<|tool_call>call:...<tool_call|>
Thinking trace	<|channel>thought ...<channel|>
System turn	<|turn>system
User turn	<|turn>user
Model turn	<|turn>model
End of turn	<turn|>
Example of discussion:
```

格式对照: thinking 开关 `<|think|>`; 函数声明 `<|tool>declaration:...<tool|>`; 函数调用 `<|tool_call>call:...<tool_call|>`; 推理迹 `<|channel>thought ...<channel|>`; system 轮 `<|turn>system`; user 轮 `<|turn>user`; model 轮 `<|turn>model`; 轮次结束 `<turn|>`. 最后一行 「Example of discussion」 是对话示例的引导语.

Gemma 4 Technical Report

```txt
Model input:
[BOS]
<|turn>system
<|think|>
<|tool>declaration:search_train{...}<tool|><turn|>
<|turn>user
I want you to book a train ticket for me.<turn|>
<|turn>model
<|channel>thought ...<channel|>Where would you like to go?<turn|>
<|turn>user
To Rome.<turn|>
<|turn>model
Model output:
<|channel>thought ...<channel|>Looking for available tickets:
<|tool_call>call:search_train{from:<|"|>|>Athens<|"|>,to:<|"|>|>Rome<|"|>|} <tool_call|><turn|>
```

模型输入与输出示例: 输入以 [BOS] 开头, system 轮里放 `<|think|>` 和 search_train 的函数声明; 之后是用户订票, 模型先写推理迹再问去哪里, 用户答去罗马. 模型输出先给推理迹, 再说正在查票, 并发出 search_train 调用, 参数 from 为 Athens, to 为 Rome.

Table 11 | Formatting for Gemma IT models. Explicitly add the [BOS] token after tokenization, or use the add\_bos=True option in the tokenizer. Do not tokenize the text "[BOS]". Add <|think|> in a leading system turn to activate the thinking mode. Check the official documentation for the function declaration and function calling syntax, as well as more advanced examples.

表 11 | Gemma IT 模型的格式. 分词后要显式加上 [BOS] token, 或在 tokenizer 中使用 add_bos=True 选项. 不要对文本 「[BOS]」 做分词. 在开头的 system 轮中加入 `<|think|>` 以开启 thinking mode. 函数声明和函数调用的语法以及更复杂的示例, 请查阅官方文档.

<table><tr><td rowspan="2"></td><td colspan="5">Gemma 4</td></tr><tr><td>31B</td><td>26B-A4B</td><td>12B</td><td>E4B</td><td>E2B</td></tr><tr><td>MMMU Pro</td><td>75.8</td><td>73.2</td><td>67.7</td><td>51.4</td><td>43.2</td></tr><tr><td>MATH-Vision</td><td>83.4</td><td>80.3</td><td>76.7</td><td>59.2</td><td>53.0</td></tr><tr><td>MedXPertQA MM</td><td>60.7</td><td>55.7</td><td>47.4</td><td>28.7</td><td>22.5</td></tr><tr><td>InfographicVQA</td><td>82.8</td><td>77.8</td><td>58.7</td><td>54.8</td><td>44.6</td></tr><tr><td>OmniDocBench 1.5 ↓</td><td>0.201</td><td>0.269</td><td>0.408</td><td>0.307</td><td>0.496</td></tr></table>

Table 12 | Gemma 4 models performance on vision benchmarks at resolution $N _ { m a x } = 2 8 0$ (thinking).

表 12 | Gemma 4 各模型在分辨率 N_max = 280 下的视觉基准表现 (thinking).

17
