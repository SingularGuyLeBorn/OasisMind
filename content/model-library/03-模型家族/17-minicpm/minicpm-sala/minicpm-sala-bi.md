<!-- page 1 of 14 -->

arXiv:2602.11761v2 [cs.CL] 28 Feb 2026

arXiv 编号 2602.11761 第 2 版, 分类 cs.CL, 日期 2026 年 2 月 28 日.

MiniCPM-SALA

OpenBMB

# MiniCPM-SALA: Hybridizing Sparse and Linear Attention for Efficient Long-Context Modeling (MiniCPM-SALA: 混合稀疏注意力与线性注意力, 实现高效的长上下文建模)

**MiniCPM Team**

MiniCPM 团队. 下面两个链接依次是 Hugging Face 模型页和 GitHub 代码仓库.

[https://huggingface.co/openbmb/MiniCPM-SALA](https://huggingface.co/openbmb/MiniCPM-SALA)

[https://github.com/OpenBMB/MiniCPM](https://github.com/OpenBMB/MiniCPM)

## Abstract

The evolution of large language models (LLMs) towards applications with ultra-long contexts faces challenges posed by the high computational and memory costs of the Transformer architecture. While existing sparse and linear attention mechanisms attempt to mitigate these issues, they typically involve a trade-off between memory efficiency and model performance. This paper introduces MiniCPM-SALA<sup>a</sup>, a 9B-parameter hybrid architecture that integrates the high-fidelity long-context modeling of sparse attention (InfLLM-V2) with the global efficiency of linear attention (Lightning Attention). By employing a layer selection algorithm to integrate these mechanisms in a 1:3 ratio and utilizing a hybrid positional encoding (HyPE), the model maintains efficiency and performance for long-context tasks. Furthermore, we introduce a cost-effective continual training framework that transforms pre-trained Transformer-based models into hybrid models, which reduces training costs by approximately 75% compared to training from scratch. Extensive experiments show that MiniCPM-SALA maintains general capabilities comparable to full-attention models while offering improved efficiency. On a single NVIDIA A6000D GPU, the model achieves up to 3.5× the inference speed of the full-attention model at the sequence length of 256K tokens and supports context lengths of up to 1M tokens, a scale where traditional full-attention 8B models fail because of memory constraints.

大语言模型 (LLM) 正在走向超长上下文应用, 而 Transformer 架构高昂的计算和显存开销是这条路上的主要障碍. 现有的稀疏注意力和线性注意力机制试图缓解这些问题, 但通常要在显存效率和模型性能之间取舍. 本文介绍 MiniCPM-SALA (上标 a), 一个 9B 参数的混合架构, 它把稀疏注意力 (InfLLM-V2) 高保真的长上下文建模能力与线性注意力 (Lightning Attention) 的全局效率结合在一起. 模型用层选择算法以 1:3 的比例组合这两种机制, 并采用混合位置编码 (HyPE), 在长上下文任务上兼顾效率和性能. 此外, 我们提出一个低成本的持续训练框架, 把预训练好的 Transformer 模型转换成混合模型, 与从头训练相比训练成本降低约 75%. 大量实验表明, MiniCPM-SALA 的通用能力与全注意力模型相当, 效率则更高. 在单张 NVIDIA A6000D GPU 上, 序列长度 256K token 时, 模型的推理速度最高可达全注意力模型的 3.5 倍, 并支持最长 1M token 的上下文; 在这个长度上, 传统的 8B 全注意力模型会因显存不足而失败.

<sup>a</sup>SALA stands for Sparse Attention and Linear Attention.

上标 a: SALA 是 Sparse Attention and Linear Attention (稀疏注意力与线性注意力) 的缩写.

## 1 Introduction (引言)

As large language models (LLMs) (OpenAI et al., 2024; Comanici et al., 2025; Grattafiori et al., 2024; Yang et al., 2025a; DeepSeek-AI et al., 2025) become increasingly effective, the application scenarios of LLMs are undergoing a profound paradigm shift, transitioning from simple question-answering (Brown et al., 2020) to more advanced applications, such as deep understanding and generation of ultra-long contexts (Bai et al., 2024, 2025; Zhou et al., 2025; Shao et al., 2024), repository-scale code engineering (Guo et al., 2024; Jimenez et al., 2024; Liu et al., 2024), and long-horizon agents for complex tasks (Qian et al., 2024; Mialon et al., 2023; Li et al., 2026). For these advanced applications, models are no longer confined to processing fragmented information. Instead, they must demonstrate the capacity to handle ultra-long contexts, such as grasping entire technical manuals at once, analyzing comprehensive project dependency trees containing tens of thousands of lines of code, and maintaining coherent task states and memory over multi-day human-AI collaborations. This pursuit of holistic contextual information makes the ability to process millions of tokens a critical aspect for advanced LLMs (Kimi Team et al., 2025; NVIDIA et al., 2025b).

随着大语言模型 (LLM) 越来越好用, 它的应用场景正在发生一次深刻的范式转变: 从简单问答 (Brown et al., 2020) 转向更高级的应用, 例如对超长上下文的深度理解与生成, 仓库级的代码工程, 以及面向复杂任务的长程智能体. 在这些应用里, 模型不再只处理零散的信息, 而要能处理超长上下文, 比如一次读完整本技术手册, 分析包含数万行代码的完整项目依赖树, 在持续多天的人机协作中保持连贯的任务状态和记忆. 为了掌握完整的上下文信息, 处理百万 token 的能力成了先进 LLM 的关键一环 (Kimi Team et al., 2025; NVIDIA et al., 2025b).

However, the Transformer architecture (Vaswani et al., 2017), which is the foundation of modern LLMs, encounters severe computational bottlenecks when handling ultra-long contexts due to its core full-attention mechanism. This bottleneck manifests primarily in two dimensions: (1) the compute bottleneck of computational complexity: for the standard attention mechanism, the computational cost grows quadratically with the sequence length N, i.e., its complexity is O(N<sup>2</sup>). When the context scales to the level of millions of tokens, the huge overhead causes the inference latency to increase dramatically; (2) the memory bottleneck of KV-Cache: during the auto-regressive generation process, the model must store the key and value states (KVs) of all historical contextual tokens to avoid redundant computation. For a typical 8B-parameter model, even when utilizing Grouped Query Attention (GQA) (Ainslie et al., 2023), the KV-Cache required for millions of tokens can reach dozens or even hundreds of gigabytes.

然而, 作为现代 LLM 基础的 Transformer 架构 (Vaswani et al., 2017), 在处理超长上下文时会因核心的全注意力机制遇到严重的计算瓶颈. 瓶颈主要体现在两方面: (1) 计算复杂度带来的算力瓶颈: 标准注意力的计算量随序列长度 N 平方增长, 复杂度是 O(N^2). 上下文到了百万 token 量级, 巨大的开销会让推理延迟急剧上升; (2) KV-Cache 带来的显存瓶颈: 自回归生成时, 模型必须保存所有历史上下文 token 的 key 和 value 状态 (KV), 以免重复计算. 对一个典型的 8B 参数模型, 即使用了分组查询注意力 (GQA) (Ainslie et al., 2023), 百万 token 所需的 KV-Cache 也能达到几十甚至上百 GB.

> **想:** 几十到上百 GB 这个量级是怎么来的, 本文有没有给出算式?
> 本文第 1 到 2 页只给了量级, 没有列算式. 能对上的证据在第 9 页: Qwen3-8B 在 96GB 的 A6000D 上 512K 就 OOM, 在 32GB 的 5090 上非量化 128K 就 OOM. 按 Qwen3-8B 的公开配置 (36 层, 8 个 KV 头, 头维 128, BF16) 估算, 每个 token 的 KV 约 144KiB, 128K 约 18GiB, 加上约 16GB 权重正好越过 32GB; 1M token 约 144GiB, 与 「上百 GB」 相符.

<!-- page 2 of 14 -->

MiniCPM-SALA

OpenBMB

To address the aforementioned challenges, existing solutions have developed two primary paradigms: Sparse Attention (Yuan et al., 2025; DeepSeek-AI et al., 2025; Xiao et al., 2024; Zhao et al., 2025) and Linear Attention (Yang et al., 2024a; Gu & Dao, 2024; Peng et al., 2023; Yang et al., 2024b, 2025b). Both paradigms present distinct advantages and inherent limitations. Sparse attention methods attempt to break the compute bottleneck by computing only the most salient portions of the attention matrix, such as adopting sliding windows or global anchors. However, these methods are hindered by a “sparse computation, dense storage” limitation. While local computation reduces immediate processing overhead, the model must still retain the full KV-Cache to support contextual information retrieval. Linear attention utilizes recurrent formulations to successfully reduce computational complexity to O(N). Nevertheless, this extreme efficiency is achieved by the lossy compression of contextual information and inevitably results in performance degradation.

为应对上述挑战, 现有方案发展出两大范式: 稀疏注意力和线性注意力. 两者各有优势, 也各有固有的局限. 稀疏注意力只计算注意力矩阵中最显著的部分, 比如用滑动窗口或全局锚点, 以此突破算力瓶颈. 但这类方法受 「稀疏计算, 稠密存储」 的限制: 局部计算降低了即时的处理开销, 模型却仍要保留完整的 KV-Cache 以支持上下文信息检索. 线性注意力用循环形式把计算复杂度降到 O(N). 不过这种极致的效率是靠有损压缩上下文信息换来的, 不可避免地带来性能下降.

> **问:** 稀疏层同样是 「稀疏计算, 稠密存储」, 那 MiniCPM-SALA 省下的显存从哪来?
> 本文第 3 页说线性注意力层的计算和显存对序列长度是常数, 而只有 25% 的层用 InfLLM-V2, 这些层仍要存完整的 KV. 如果 KV 头配置不变, KV-Cache 大致只剩同结构全注意力模型的四分之一. 本文没有给显存曲线, 直接证据只有第 9 页的 OOM 对比: Qwen3-8B 在 A6000D 上 512K 和 1024K 失败, MiniCPM-SALA 两档都跑完.

MiniCPM-SALA employs a hybrid architecture of sparse and linear attention (Chen et al., 2026), specifically designed to achieve efficient ultra-long sequence modeling. This architecture combines the high-fidelity long-context modeling capabilities of InfLLM-V2 (Zhao et al., 2025) and the global computational efficiency of Lightning Attention (Qin et al., 2024). Through this integrated approach, the model significantly mitigates inference overhead and memory consumption, while simultaneously addressing the precision bottleneck typical of pure linear architectures in long-range information processing. Consequently, MiniCPM-SALA provides a balanced solution that maintains both efficiency and high performance for long-context tasks. Furthermore, we employ the continual training paradigm to transform a pre-trained Transformer model into our hybrid model. By eschewing training from scratch, this approach significantly reduces the computational costs of model development. While several works have begun exploring the integration of sparse and linear attention (Hu et al., 2025; Hou et al., 2025; He & Garner, 2025), to the best of our knowledge, MiniCPM-SALA is the first to demonstrate through large-scale experimentation that these hybrids can match the performance of full-attention baselines. Furthermore, the model exhibits high efficiency and strong performance in long-context processing.

MiniCPM-SALA 采用稀疏注意力与线性注意力的混合架构 (Chen et al., 2026), 专为高效的超长序列建模设计. 它结合了 InfLLM-V2 (Zhao et al., 2025) 高保真的长上下文建模能力和 Lightning Attention (Qin et al., 2024) 的全局计算效率. 靠这种组合, 模型显著降低了推理开销和显存占用, 同时缓解了纯线性架构在长程信息处理上常见的精度瓶颈. 因此, MiniCPM-SALA 为长上下文任务提供了一个兼顾效率和性能的平衡方案. 此外, 我们用持续训练范式把预训练好的 Transformer 模型转换成混合模型. 不从头训练, 模型开发的算力成本大幅下降. 已有一些工作开始探索稀疏注意力与线性注意力的结合 (Hu et al., 2025; Hou et al., 2025; He & Garner, 2025), 但据我们所知, MiniCPM-SALA 是第一个通过大规模实验证明这类混合模型能追平全注意力基线的工作. 此外, 模型在长上下文处理上效率高, 效果也强.

In summary, the main contributions of this study can be outlined as follows:

总结起来, 本研究的主要贡献如下:

• We introduce a Sparse-Linear hybrid attention mechanism integrating 25% InfLLM-V2 and 75% Lightning Attention to strike a balance between throughput and precision. By leveraging the granular focus of sparse attention for local details and the O(N) efficiency of linear attention for broad context, the architecture maintains high semantic accuracy as the sequence length scales up.

• 我们提出一种稀疏-线性混合注意力机制, 由 25% 的 InfLLM-V2 和 75% 的 Lightning Attention 组成, 在吞吐和精度之间取得平衡. 稀疏注意力负责细粒度地关注局部细节, 线性注意力以 O(N) 的效率覆盖大范围上下文, 这样序列变长时, 架构仍能保持较高的语义准确度.

• We demonstrate that the Transformer-to-hybrid paradigm is a highly effective strategy for building strong hybrid models. This approach circumvents the inefficiencies of cold-start training by performing an architectural transformation on the pre-trained weights, thereby reducing the total training budget to approximately 25% relative to training a comparable model from scratch.

• 我们证明, Transformer 到混合模型的转换范式是构建强混合模型的高效策略. 这种做法直接对预训练权重做架构改造, 绕开了冷启动训练的低效, 总训练预算降到从头训练同类模型的约 25%.

• We adopt HyPE (Hybrid Positional Encoding) (Chen et al., 2026) to effectively harmonize the performance across both short and long contexts. While maintaining general capabilities (e.g., knowledge, mathematics, and coding) comparable to modern full-attention models like Qwen3-8B, MiniCPM-SALA has substantial advantages across multiple long-context benchmarks.

• 我们采用 HyPE (混合位置编码) (Chen et al., 2026), 协调短上下文与长上下文上的表现. MiniCPM-SALA 的通用能力 (如知识, 数学和代码) 与 Qwen3-8B 等现代全注意力模型相当, 在多个长上下文基准上则有明显优势.

• MiniCPM-SALA demonstrates substantial resource savings and speed advantages in long-context scenarios. On the NVIDIA A6000D GPU, MiniCPM-SALA achieves up to 3.5× the inference speed of Qwen3-8B at a sequence length of 256K tokens. Furthermore, MiniCPM-SALA supports inference at context lengths of up to 1M tokens on both NVIDIA A6000D and 5090 GPUs, whereas Qwen3-8B fails at this length due to out-of-memory (OOM) errors. These results demonstrate the broad prospects of MiniCPM-SALA in edge-side information-intensive applications.

• MiniCPM-SALA 在长上下文场景下节省了大量资源, 速度优势明显. 在 NVIDIA A6000D GPU 上, 序列长度 256K token 时, MiniCPM-SALA 的推理速度最高可达 Qwen3-8B 的 3.5 倍. 此外, MiniCPM-SALA 在 NVIDIA A6000D 和 5090 上都支持最长 1M token 的上下文推理, 而 Qwen3-8B 在这个长度会因显存不足 (OOM) 报错. 这些结果说明 MiniCPM-SALA 在端侧信息密集型应用上前景广阔.

## 2 Model Development (模型开发)

In this section, we introduce the model architecture and training strategies for MiniCPM-SALA. Specifically, we combine the efficient sparse attention for long-context modeling and linear attention for global efficiency in MiniCPM-SALA. Moreover, we also introduce an efficient training method, which can transform a standard Transformer model into sparse-linear hybrid attention.

本节介绍 MiniCPM-SALA 的模型架构和训练策略. 具体来说, 我们在 MiniCPM-SALA 中结合了面向长上下文建模的高效稀疏注意力和面向全局效率的线性注意力. 此外还介绍一种高效的训练方法, 能把标准 Transformer 模型转换成稀疏-线性混合注意力.

<!-- page 3 of 14 -->

MiniCPM-SALA

3 OpenBMB

![图 1 MiniCPM-SALA 架构: 25% 稀疏注意力层与 75% 线性注意力层](images/p03-figure-1-architecture-of-minicpm-sala-the-model-adopts.png)

Figure 1: Architecture of MiniCPM-SALA. The model adopts an efficient hybrid design that combines InfLLM-V2 (Zhao et al., 2025) and Lightning Attention (Qin et al., 2024) modules in a 1:3 ratio. Building on an intermediate MiniCPM-4.0 (MiniCPM-Team et al., 2025) checkpoint, MiniCPM-SALA undergoes a continual training phase to convert a standard Transformer model into a sparse-linear hybrid model.

图 1: MiniCPM-SALA 的架构. 模型采用高效的混合设计, 以 1:3 的比例组合 InfLLM-V2 (Zhao et al., 2025) 和 Lightning Attention (Qin et al., 2024) 模块. MiniCPM-SALA 以 MiniCPM-4.0 (MiniCPM-Team et al., 2025) 的一个中间检查点为起点, 经过一段持续训练, 把标准 Transformer 模型转换成稀疏-线性混合模型.

图的左侧是层级示意: 75% 的块是 「线性注意力 + FFN」, 25% 的块是 「稀疏注意力 + FFN」. 右上是稀疏层: q_t 和 k_t 各经过一个 Linear 和一个 Norm, 原本的 RoPE 被红线划掉, 再与 v_t 一起送进 InfLLM-V2, 输出 o_t 与门控分支 z_t 逐元素相乘, 最后过输出 Linear. 右下是线性层: q_t 和 k_t 经过 Linear, Norm, 再加 RoPE, 与 v_t 一起送进 Lightning Attention, 两侧的 S_{t-1} 和 S_t 是逐步传递的循环状态; o_t 先过一个 Norm, 再与 z_t 相乘, 最后过 Linear. 线性层 q, k, v 三个 Linear 背后画了灰色阴影框, 稀疏层只有 q 的 Linear 有, 图中没有标注这些阴影的含义.

> **再看:** 图 1 的线性层在 Lightning Attention 输出后多了一个 Norm, 稀疏层没有, 正文提过这一步吗?
> 本文第 4 页 「Other Architectural Improvements」 只列了 QK 归一化, HyPE 和输出门三项, 没有提线性层的输出归一化; 图 1 的线性分支在 o_t 与 z_t 相乘之前画了 Norm, 稀疏分支没有. 这一步只能从图 1 读出, 它具体是什么形式的归一化, 本文没有交代.

## 2.1 Model Architecture (模型架构)

The overall architecture of MiniCPM-SALA is illustrated in Figure 1. MiniCPM-SALA adopts a hybrid architecture that interleaves sparse attention layers and linear attention layers. We retain the Feed-Forward Network (FFN) block after each attention block in the Transformer architecture to ensure high-capacity knowledge representation. Inspired by the architectural designs of recent representative studies, such as Qwen3-Next (Qwen Team, 2025) and Kimi-Linear (Kimi Team et al., 2025), as well as our internal small-scale preliminary experiments, we employ a 1:3 mixing ratio: 25% of the layers adopt sparse attention while the remaining 75% employ linear attention.

MiniCPM-SALA 的整体架构见图 1. 它采用稀疏注意力层与线性注意力层交错排列的混合架构. 我们保留 Transformer 中每个注意力块之后的前馈网络 (FFN) 块, 保证足够的知识表示容量. 参考近期代表性工作的架构设计, 如 Qwen3-Next (Qwen Team, 2025) 和 Kimi-Linear (Kimi Team et al., 2025), 再结合我们内部的小规模预实验, 我们采用 1:3 的混合比例: 25% 的层用稀疏注意力, 其余 75% 用线性注意力.

This hybrid configuration leverages the complementary strengths of both attention mechanisms. Linear attention layers have constant computational and memory complexities with respect to sequence length, facilitating efficient processing of long contexts. On the other hand, sparse attention layers facilitate effective modeling of long-range dependencies. Rather than naively uniformly interleaving the two attention variants, we determine the placement of sparse attention modules using the layer selection mechanism proposed by Chen et al. (2026), which results in superior downstream performance.

这种混合配置利用了两种注意力机制的互补优势. 线性注意力层的计算和显存复杂度相对序列长度是常数, 便于高效处理长上下文. 稀疏注意力层则能有效建模长程依赖. 我们没有简单地把两种注意力均匀交错, 而是用 Chen et al. (2026) 提出的层选择机制决定稀疏注意力模块放在哪些层, 下游效果更好.

> **拆开:** 1:3 的比例加上 「首尾两层不转换」, 实际有多少层是稀疏层, 是哪几层?
> 本文第 3 页只给了 25% 对 75% 的比例, 第 5 页说首层和末层保留为 softmax 注意力, 其余层由 HALO 算法挑选, 这些 softmax 层在后续阶段训练成稀疏注意力. 全文没有给总层数, 也没有给被选中的层号, 所以只能确定稀疏层里有两层固定在首尾, 其余位置由 HALO 决定.

**Training Strategy** Existing paradigms for training hybrid models generally fall into two categories: (1) training from scratch (Zuo et al., 2025; Qwen Team, 2025; Kimi Team et al., 2025; NVIDIA et al., 2025b) and (2) converting a pre-trained Transformer model into a hybrid model via cross-architecture distillation (Wang et al., 2024a; Hoshino et al., 2025; Li et al., 2025; Gu et al., 2025). Although training from scratch offers simplicity and maximum architectural flexibility, continual-training conversion is a more resource-efficient alternative that leverages parameter inheritance from established pre-trained models. By recycling pre-trained weights and representations, the continual-training method significantly reduces the immense computational cost typically associated with de novo training, achieving competitive performance with a fraction of the budget. Accordingly, MiniCPM-SALA leverages a conversion-based framework that uses continual training to adapt a Transformer into an efficient hybrid version while preserving its core capabilities.

**训练策略** 现有训练混合模型的范式大致分两类: (1) 从头训练; (2) 通过跨架构蒸馏把预训练好的 Transformer 转换成混合模型. 从头训练简单, 架构自由度最大; 持续训练式转换则更省资源, 它能从成熟的预训练模型继承参数. 复用预训练的权重和表示, 持续训练方法能大幅降低从零训练通常要付出的巨大算力成本, 用一小部分预算就达到有竞争力的效果. 因此, MiniCPM-SALA 采用基于转换的框架, 用持续训练把 Transformer 改造成高效的混合版本, 同时保留它的核心能力.

<!-- page 4 of 14 -->

MiniCPM-SALA

OpenBMB

Table 1: Overview of the whole training process to build MiniCPM-SALA.

<table><tr><td>Stage</td><td>Trainable Parameters</td><td>Sparse Attention</td><td>Sequence Length</td><td># Tokens</td></tr><tr><td>Architecture Conversion (HALO)</td><td>Linear Attention</td><td>Disabled</td><td>0.5K</td><td>1.3B</td></tr><tr><td>Continual Stable-Training</td><td>All Parameters</td><td>Disabled</td><td>4K</td><td>314.6B</td></tr><tr><td>Short-Decay Training</td><td>All Parameters</td><td>Disabled</td><td>4K</td><td>1006.6B</td></tr><tr><td rowspan="3">Long-Decay Training</td><td rowspan="3">All Parameters</td><td rowspan="3">Enabled</td><td>32K</td><td>102.2B</td></tr><tr><td>160K</td><td>62.9B</td></tr><tr><td>520K</td><td>50.6B</td></tr><tr><td rowspan="2">Supervised Fine-Tuning</td><td rowspan="2">All Parameters</td><td rowspan="2">Enabled</td><td>64K</td><td>204.5B</td></tr><tr><td>140K</td><td>213.3B</td></tr></table>

表 1: 构建 MiniCPM-SALA 的完整训练流程概览.

| 阶段 | 可训练参数 | 稀疏注意力 | 序列长度 | token 数 |
| --- | --- | --- | --- | --- |
| 架构转换 (HALO) | 线性注意力 | 关闭 | 0.5K | 1.3B |
| 持续稳定训练 | 全部参数 | 关闭 | 4K | 314.6B |
| 短衰减训练 | 全部参数 | 关闭 | 4K | 1006.6B |
| 长衰减训练 | 全部参数 | 开启 | 32K / 160K / 520K | 102.2B / 62.9B / 50.6B |
| 监督微调 | 全部参数 | 开启 | 64K / 140K | 204.5B / 213.3B |

**Sparse Attention and Linear Attention** For the sparse attention layers, we incorporate InfLLM-V2 (Zhao et al., 2025), which offers the distinct advantage of introducing no additional parameters to the architecture. Its inherent flexibility and ability to switch seamlessly between dense and sparse modes are highly compatible with our conversion process. This compatibility facilitates a stable training initialization by allowing sparse modules to inherit dense weights without architectural discrepancies, ensuring that the conversion to a hybrid structure does not compromise the model capacity. For the linear attention layers, we utilize Lightning Attention (Qin et al., 2024). Given our Transformer-to-hybrid conversion paradigm, Lightning Attention is selected for its functional proximity to the standard softmax attention. This structural alignment is intended to mitigate the complexities of parameter adaptation, thereby preserving pre-trained knowledge and ensuring robust downstream performance. Lightning Attention also provides better length generalization capabilities according to Chen et al. (2026), which may improve data efficiency during long-context continual-training.

**稀疏注意力与线性注意力** 稀疏注意力层采用 InfLLM-V2 (Zhao et al., 2025), 它的一个明显优势是不给架构引入任何额外参数. 它本身很灵活, 能在稠密和稀疏两种模式之间无缝切换, 和我们的转换流程高度契合. 这种契合让稀疏模块可以直接继承稠密权重, 不存在架构差异, 训练初始化因此稳定, 转换成混合结构也不损失模型容量. 线性注意力层采用 Lightning Attention (Qin et al., 2024). 我们走的是 Transformer 到混合模型的转换路线, 选 Lightning Attention 是因为它在功能上接近标准的 softmax 注意力. 结构上对齐, 是为了降低参数适配的复杂度, 从而保留预训练知识, 保证下游表现稳健. 按 Chen et al. (2026) 的结果, Lightning Attention 的长度泛化能力也更好, 可能提高长上下文持续训练的数据效率.

> **确认:** 表 2 里同源的 MiniCPM-4.1 标 8B, 转换后的 MiniCPM-SALA 标 9B, 多出来的参数在哪?
> 本文第 4 页说 InfLLM-V2 不引入额外参数, 所以增量只能来自 75% 的线性注意力层和每个注意力块后新加的输出门 (图 1 里的 z_t 分支). 本文没有给层数, 隐藏维度和各部分参数量, 第 6 页表 2 只写了 9B 对 8B, 具体怎么拆分无法从本文算出.

**Other Architectural Improvements** Following HypeNet (Chen et al., 2026), we also introduce several architectural modifications to enhance the expressivity and training stability of MiniCPM-SALA. These include QK-Normalization (Henry et al., 2020), HyPE (Chen et al., 2026), and the integration of output gates.

**其他架构改进** 参照 HypeNet (Chen et al., 2026), 我们还引入了几项架构修改, 增强 MiniCPM-SALA 的表达能力和训练稳定性, 包括 QK 归一化 (Henry et al., 2020), HyPE (Chen et al., 2026) 和输出门.

• **QK-Normalization:** This is applied to all attention layers (both sparse and linear layers) to prevent the activation spikes that often occur in long-context training and further improve and boost the expressivity of linear attention modules.

• **QK 归一化 (QK-Normalization)** 用在所有注意力层上 (稀疏层和线性层都用), 防止长上下文训练中常见的激活尖峰, 并进一步提升线性注意力模块的表达能力.

• **HyPE (Hybrid Positional Encoding):** To balance rich positional awareness and long-range information retention, we employ a hybrid approach to positional encoding. We apply Rotary Positional Embedding (RoPE) (Su et al., 2023) to the linear attention layers to facilitate position-sensitive memory, allowing the model to preserve the relative order of tokens within the global context. On the other hand, we remove RoPE in the sparse attention layers. This strategic omission prevents the decay of long-distance information often associated with RoPE, thereby enabling more precise recall over extended contexts.

• **HyPE (混合位置编码)** 为了兼顾丰富的位置感知和长程信息保持, 我们对位置编码采用混合做法. 线性注意力层使用旋转位置编码 (RoPE) (Su et al., 2023), 形成对位置敏感的记忆, 让模型在全局上下文中保留 token 的相对顺序. 稀疏注意力层则去掉 RoPE. 这个有意的省略避免了 RoPE 常带来的远距离信息衰减, 让长上下文里的召回更精确.

> **想:** RoPE 为什么给线性层, 而不是给负责长程检索的稀疏层?
> 本文第 4 页给的理由是: 线性层靠 RoPE 形成位置敏感的记忆, 稀疏层去掉 RoPE, 避免远距离信息衰减, 召回更准. 第 8 页又把外推到 2048K 的能力归功于稀疏层的 NoPE 配置. 也就是说, 在 MiniCPM-SALA 里做精确长程检索的是稀疏层, 所以不加位置编码的是它; 本文没有给去掉 HyPE 的对照实验, 细节要看 Chen et al. (2026).

**Output gates:** Furthermore, we incorporate an output gate after each attention block (both sparse and linear). This architectural choice aligns with recent advances in the gated attention mechanism (Qiu et al., 2025), in which the output gate has been shown to effectively mitigate issues such as attention sink. By regulating the information flow, the output gate prevents excessive focus on specific tokens and ensures a more flexible distribution of attention weights. Empirically, we observe that integrating output gates into both linear and sparse attention significantly improves model stability and performance.

**输出门** 此外, 我们在每个注意力块 (稀疏和线性) 之后都加了一个输出门. 这个选择和门控注意力机制的近期进展一致 (Qiu et al., 2025), 该工作表明输出门能有效缓解 attention sink 等问题. 输出门调节信息流, 防止注意力过度集中在特定 token 上, 让注意力权重分布得更灵活. 实验中我们观察到, 在线性注意力和稀疏注意力上都加输出门, 模型的稳定性和效果都明显提升.

## 2.2 Model Training (模型训练)

The training of MiniCPM-SALA is conducted through a multi-stage process that starts from an intermediate checkpoint of MiniCPM-4.0 (MiniCPM-Team et al., 2025), which has already been trained on 7T tokens. This methodology represents an extended implementation of Hybrid Attention via Layer Optimization (HALO) (Chen et al., 2026). In the initial phase, we use the HALO framework to convert softmax attention to linear attention. This conversion serves as the starting point for subsequent pipeline stages, including continual pre-training and post-training. By leveraging this approach, the model can transition from a dense architecture to a hybrid structure while preserving the general capabilities acquired during the backbone’s earlier training phases. The entire conversion process, consisting of five stages, is shown in Table 1. It is worth noting that the Transformer-to-hybrid training of MiniCPM-SALA consumes approximately 2T tokens. This corresponds to roughly 25% of the data volume required to train MiniCPM-4.0 from scratch (8T tokens).

MiniCPM-SALA 的训练分多个阶段, 起点是 MiniCPM-4.0 (MiniCPM-Team et al., 2025) 的一个中间检查点, 它已经训练过 7T token. 这套方法是 HALO (Hybrid Attention via Layer Optimization, 基于层优化的混合注意力) (Chen et al., 2026) 的扩展实现. 第一阶段, 我们用 HALO 框架把 softmax 注意力转换成线性注意力. 这次转换是后续各阶段的起点, 后面包括持续预训练和后训练. 借助这种做法, 模型能从稠密架构过渡到混合结构, 同时保留主干在早期训练阶段获得的通用能力. 完整的转换流程共五个阶段, 见表 1. 值得一提的是, MiniCPM-SALA 从 Transformer 到混合模型的训练约消耗 2T token, 大约是从头训练 MiniCPM-4.0 所需数据量 (8T token) 的 25%.

> **核对:** 表 1 加起来是不是 2T, 再算上起点已经训过的 7T, 还能说省了 75% 吗?
> 本文第 4 页表 1 的八个数加起来是 1956.0B, 与 「约 2T」 相符; 但同一页也写明起点检查点已训 7T token, 所以 MiniCPM-SALA 累计见过约 9T token, 比从头训练 MiniCPM-4.0 的 8T 还多. 摘要和第 9 页 「训练成本降低约 75%」 只算了转换这一段的增量, 把 7T 当成已经付过的成本, 前提是手里本来就有这个稠密检查点.

<!-- page 5 of 14 -->

MiniCPM-SALA

OpenBMB

**Architecture Conversion (HALO)** The first stage uses HALO to convert the Transformer model from a full attention architecture to a hybrid architecture. During this phase, the training configuration of MiniCPM-SALA differs from the standard HALO approach in two aspects. First, regarding layer selection, we keep the first and last layers unconverted to improve training stability. For the remaining layers, we utilize the HALO selection algorithm to determine which layers are preserved as softmax attention layers. These preserved softmax attention layers are subsequently trained as sparse attention in later stages. The second difference from standard HALO is that we do not perform the final fine-tuning step of the original HALO process. Instead, we conduct more extensive continual pre-training and post-training, which comprise the subsequent stages of our methodology. The training process at this stage is highly efficient, using only 1.3B tokens with a sequence length of 512 tokens. Furthermore, only the converted linear-attention layers are trainable during this stage, while all other parameters remain frozen.

**架构转换 (HALO)** 第一阶段用 HALO 把 Transformer 从全注意力架构转换成混合架构. 这个阶段 MiniCPM-SALA 的训练配置和标准 HALO 有两点不同. 第一是层选择: 我们保留首层和末层不转换, 以提高训练稳定性; 其余层用 HALO 的选择算法决定哪些保留为 softmax 注意力层. 这些保留下来的 softmax 注意力层在后续阶段会训练成稀疏注意力. 第二点不同是, 我们不做原版 HALO 流程最后的微调步骤, 而是做更充分的持续预训练和后训练, 也就是本方法后面的几个阶段. 这一阶段训练很高效, 只用了 1.3B token, 序列长度 512 token. 此外, 这一阶段只有转换出来的线性注意力层可训练, 其他参数全部冻结.

**Continual Stable-Training** The second stage is continual stable-training. We use the checkpoint from the previous stage as the starting point for further training on the MiniCPM-4.0 pre-training dataset. The primary objective of this phase is to facilitate better coordination between the converted linear attention layers and other model components, including full attention layers, FFN layers, and embeddings. The sequence length for this process is set to 4K tokens, with a total training volume of 314.6B tokens. Since the sequence length remains relatively short, the sparse attention is disabled at this stage to maintain computational efficiency. For the hyperparameter configuration, the learning rate (LR) is set to $7 . 5 \times 1 0 ^ { - 3 }$ and held constant after a 2,000-step LR warmup period. Accounting for the sequence length and the number of GPUs, the global batch size is set to 7.8M tokens.

**持续稳定训练** 第二阶段是持续稳定训练. 我们以上一阶段的检查点为起点, 在 MiniCPM-4.0 的预训练数据集上继续训练. 这一阶段的主要目标是让转换出来的线性注意力层和模型其他组件更好地配合, 包括全注意力层, FFN 层和嵌入层. 序列长度设为 4K token, 总训练量 314.6B token. 由于序列长度仍然较短, 这一阶段关闭稀疏注意力以保持计算效率. 超参数方面, 学习率 (LR) 设为 7.5 × 10^-3, 经过 2,000 步预热后保持不变. 综合序列长度和 GPU 数量, 全局批大小设为 7.8M token.

**Short-Decay Training** The third stage is short-decay training, during which the LR undergoes exponential decay from $\tilde { 7 } . 5 \times 1 0 ^ { - 3 }$ to $3 . 7 5 \times 1 0 ^ { - 4 }$ . This process utilizes a sequence length of 4K tokens and a global batch size of 7.8M tokens. This stage involves training on 1T tokens, representing the most extensive data volume in the entire development pipeline. Building on the MiniCPM-4.0 decay strategy, we significantly increase the weight of L2 high-quality selection data (Wang et al., 2026) and introduce a large volume of PDF corpora and L3 synthetic data. This approach aims to enhance general capabilities and logical reasoning using high-information-density training data, achieving the efficient compression and internalization of massive amounts of knowledge.

**短衰减训练** 第三阶段是短衰减训练, 学习率从 7.5 × 10^-3 指数衰减到 3.75 × 10^-4. 这一阶段用 4K 序列长度, 全局批大小 7.8M token, 共训练 1T token, 是整个开发流程里数据量最大的一段. 在 MiniCPM-4.0 衰减策略的基础上, 我们大幅提高了 L2 高质量精选数据 (Wang et al., 2026) 的权重, 并引入大量 PDF 语料和 L3 合成数据. 目的是用高信息密度的训练数据增强通用能力和逻辑推理, 高效地压缩并内化海量知识.

**Long-Decay Training** The fourth stage, long-decay, progressively extends the context length from 4K to 32K, 160K, and finally 520K tokens. These processes use data volumes of 102.2B tokens, 62.9B tokens, and 50.6B tokens, respectively. To accommodate the increased sequence lengths, the global batch size is adjusted to 7.8M, 9.8M, and 10.1M tokens, while the LR is systematically decays from $3 \times \bar { 1 } 0 ^ { - 4 }   \mathrm { t o }   2 \times 1 0 ^ { - 4 }$ at 32K, then to $1 \times 1 0 ^ { - 4 }$ at 160K, and finally to $3 . 7 5 \times 1 0 ^ { - 5 }$ at 520K to conclude the process. At this stage, we up-sample the proportion of long-context data to better align the model with long-sequence distributions. Given the growing computational advantages of sparse attention at longer sequences, we enable the sparse attention mechanism at this stage and maintain full-parameter training, thereby allowing the model to effectively learn the synergy between sparse attention and linear attention.

**长衰减训练** 第四阶段是长衰减, 把上下文窗口从 4K 逐步缩放到 32K, 160K, 最后到 520K token, 三段分别用 102.2B, 62.9B 和 50.6B token. 为适应更长的序列, 全局批大小依次调为 7.8M, 9.8M 和 10.1M token, 学习率也逐段衰减: 32K 段从 3 × 10^-4 降到 2 × 10^-4, 160K 段降到 1 × 10^-4, 520K 段最终降到 3.75 × 10^-5 结束. 这一阶段我们上采样长上下文数据的比例, 让模型更好地对齐长序列分布. 序列越长, 稀疏注意力的计算优势越大, 所以我们在这一阶段开启稀疏注意力机制, 并保持全参数训练, 让模型学会稀疏注意力和线性注意力之间的协同.

> **对一下:** 短衰减结束时学习率是 3.75 × 10^-4, 长衰减开始却写 3 × 10^-4, 这两个数怎么接上?
> 本文第 5 页的两段分别给了这两个数, 中间差了 0.75 × 10^-4, 正文没有解释是阶段切换时直接降了一档, 还是其中一个数有误. 按第 5 页的写法, 长衰减三段的终点依次是 2 × 10^-4, 1 × 10^-4 和 3.75 × 10^-5, 起点只能按 3 × 10^-4 理解.

**Supervised Fine-Tuning** The SFT corpus for this stage is composed of high-quality reasoning-intensive data, encompassing code, mathematics, knowledge, function calls, and general dialogue. This selection is designed to fully catalyze the reasoning and task-execution capabilities under complex logic. Furthermore, we specifically synthesize long-context data to enhance the precision of information retrieval and cross-document comprehension within extended sequences. During the SFT stage, the context length is set to 64K and increased to 140K afterwards, utilizing 204.5B and 213.3B tokens, respectively. Sparse attention remains enabled throughout this entire process. By bridging shorter and longer contexts, this strategy allows the model to better balance general capabilities with long-context proficiency. For both phases, the LR follows a schedule with a 1,000-step warmup to a peak of $1 \times 1 \tilde { 0 ^ { - 3 } }$ before decaying to $1 \times 1 0 ^ { - \dot { 4 } }$ , while the global batch sizes are set to 15.7M for the 64K phase and 17.8M for the 140K phase.

**监督微调** 这一阶段的 SFT 语料由高质量, 推理密集的数据组成, 覆盖代码, 数学, 知识, 函数调用和通用对话. 这样选材是为了充分激发复杂逻辑下的推理能力和任务执行能力. 此外, 我们专门合成了长上下文数据, 用来提升长序列中的信息检索精度和跨文档理解. SFT 阶段上下文长度先设为 64K, 之后增加到 140K, 分别用 204.5B 和 213.3B token. 整个过程稀疏注意力始终开启. 通过衔接较短和较长的上下文, 这一策略让模型更好地平衡通用能力与长上下文能力. 两段的学习率都是先预热 1,000 步到峰值 1 × 10^-3, 再衰减到 1 × 10^-4; 全局批大小在 64K 段为 15.7M, 在 140K 段为 17.8M.

> **看表:** SFT 用了 417.8B token, 峰值学习率 1 × 10^-3, 这还算通常意义上的微调吗?
> 本文第 4 页表 1 里 SFT 两段合计 204.5B + 213.3B = 417.8B, 约占整个转换流程 1956.0B 的 21%, 比长衰减三段合计的 215.7B 还多; 第 5 页给的峰值学习率 1 × 10^-3 是长衰减终点 3.75 × 10^-5 的约 27 倍. 按规模它更接近一段在指令数据上的持续训练, 本文沿用了 SFT 的叫法, 没有说明是否只对回答部分计算损失.

## 3 Experiments (实验)

## 3.1 Model Performance (模型性能)

**Benchmarks** To thoroughly assess the general capabilities of the model, we conducted evaluations across a diverse array of benchmarks. These include knowledge-intensive tasks (CMMLU (Li et al., 2023), MMLU-Pro (Wang et al., 2024b)), coding benchmarks (HumanEval (Chen et al., 2021), LCB-v5/v6 Jain et al. (2025), MBPP (Austin et al., 2021)), and mathematical reasoning sets (AIME24/25 (AIME, 2025)), alongside other representative benchmarks such as BBH (Suzgun et al., 2022) and IFEval (Zhou et al., 2023). We further evaluated long-context capabilities using RULER (Hsieh et al., 2024), MRCR<sup>1</sup>, and NoliMa (Modarressi et al., 2025). We utilized the OpenCompass framework (Contributors, 2023) to conduct the evaluations.

**基准** 为全面评估模型的通用能力, 我们在一系列多样的基准上做了评测, 包括知识密集型任务 (CMMLU, MMLU-Pro), 代码基准 (HumanEval, LCB-v5/v6, MBPP), 数学推理 (AIME24/25), 以及 BBH 和 IFEval 等其他代表性基准. 长上下文能力用 RULER, MRCR (脚注 1) 和 NoLiMa 评测. 所有评测都在 OpenCompass 框架 (Contributors, 2023) 上完成.

<!-- page 6 of 14 -->

MiniCPM-SALA

3 OpenBMB

Table 2: Standard evaluation results of MiniCPM-SALA and other open-source LLMs.

<table><tr><td>Models</td><td>Qwen3</td><td>Nemotron-Nano-v2</td><td>MiniCPM-4.1</td><td>Ministral-3-R</td><td>Falcon-H1R</td><td>MiniCPM-SALA</td></tr><tr><td># Param.</td><td>8B</td><td>9B</td><td>8B</td><td>8B</td><td>7B</td><td>9B</td></tr><tr><td colspan="7">Knowledge</td></tr><tr><td>CMMLU</td><td>81.68</td><td>61.59</td><td>84.72</td><td>71.74</td><td>63.55</td><td>81.55</td></tr><tr><td>MMLU-Pro</td><td>73.26</td><td>71.79</td><td>72.70</td><td>68.75</td><td>70.98</td><td>67.04</td></tr><tr><td colspan="7">Code</td></tr><tr><td>HumanEval</td><td>93.90</td><td>93.90</td><td>91.46</td><td>96.95</td><td>96.34</td><td>95.12</td></tr><tr><td>LCB-v5</td><td>56.89</td><td>68.26</td><td>56.89</td><td>65.87</td><td>67.66</td><td>60.48</td></tr><tr><td>LCB-v6</td><td>48.57</td><td>60.00</td><td>51.43</td><td>53.71</td><td>57.71</td><td>52.00</td></tr><tr><td>MBPP</td><td>81.32</td><td>93.39</td><td>91.05</td><td>94.16</td><td>91.05</td><td>89.11</td></tr><tr><td colspan="7">Math</td></tr><tr><td>AIME24</td><td>73.33</td><td>71.67</td><td>80.83</td><td>81.46</td><td>86.67</td><td>83.75</td></tr><tr><td>AIME25</td><td>66.67</td><td>56.67</td><td>72.08</td><td>75.00</td><td>81.04</td><td>78.33</td></tr><tr><td colspan="7">Other</td></tr><tr><td>BBH</td><td>74.17</td><td>74.28</td><td>82.68</td><td>64.39</td><td>63.17</td><td>81.55</td></tr><tr><td>IFEval</td><td>84.66</td><td>86.69</td><td>77.45</td><td>70.06</td><td>86.32</td><td>76.34</td></tr><tr><td>Average</td><td>73.45</td><td>73.82</td><td>76.13</td><td>74.21</td><td>76.45</td><td>76.53</td></tr></table>

表 2: MiniCPM-SALA 与其他开源 LLM 的标准评测结果. 表中 # Param. 是参数量, Knowledge, Code, Math, Other 四组依次是知识, 代码, 数学和其他, Average 是十项的算术平均.

Table 3: Long-context evaluation results of MiniCPM-SALA and other open-source LLMs.

| Models | Qwen3 | Nemotron-Nano-v2 | Ministral-3-R | Falcon-H1R | MiniCPM-SALA |
| --- | --- | --- | --- | --- | --- |
| # Param. | 8B | 9B | 8B | 7B | 9B |
| 64K | 80.53 | 88.77 | 70.66 | 56.50 | 92.65 |
| RULER |  |  |  |  |  |
| 128K | 71.74 | 68.01 | 45.09 | 36.33 | 89.37 |
| 64K-2N | 29.20 | 20.91 | 44.02 | 13.18 | 29.77 |
| 64K-4N | 21.56 | 13.69 | 35.80 | 9.06 | 20.57 |
| 64K-8N | 17.82 | 13.24 | 17.23 | 6.93 | 16.56 |
| MRCR |  |  |  |  |  |
| 128K-2N | 26.50 | 14.61 | 50.30 | 9.17 | 28.62 |
| 128K-4N | 14.75 | 12.20 | 22.66 | 8.22 | 19.62 |
| 128K-8N | 12.15 | 7.55 | 14.47 | 7.54 | 10.12 |
| 32K | 43.40 | 19.69 | 3.78 | 14.89 | 54.54 |
| NoLiMa 64K | 23.35 | 11.82 | 2.48 | 9.87 | 42.95 |
| 128K | 11.25 | 5.80 | 3.48 | 4.73 | 23.86 |
| Average | 32.02 | 25.12 | 28.18 | 16.04 | 38.97 |

表 3: MiniCPM-SALA 与其他开源 LLM 的长上下文评测结果. MinerU 抽取时把基准名单独放成了空行, 实际分组是: 64K 和 128K 两行属于 RULER; 64K-2N 到 128K-8N 六行属于 MRCR, 2N, 4N, 8N 是混入的目标数; 32K, 64K, 128K 三行属于 NoLiMa. Average 是这 11 列的算术平均.

**Baseline Models** Given that MiniCPM-SALAis a 9B-parameter model, we selected a series of modern baselines of comparable size, encompassing both hybrid and full-attention architectures. Specifically, the baselines include Qwen3-8B (Yang et al., 2025a), Nemotron-Nano-v2-9B (NVIDIA et al., 2025a), MiniCPM-4.1-8B (MiniCPM-Team et al., 2025), Ministral-3-Reasoning-8B (Liu et al., 2026), and Falcon-H1R-7B (Team et al., 2026). We exclude MiniCPM-4.1-8B from the evaluation of long contexts because of its limitation to a context length of 64K.

**基线模型** MiniCPM-SALA 是 9B 参数的模型, 我们选了一批规模相近的现代基线, 涵盖混合架构和全注意力架构. 具体包括 Qwen3-8B, Nemotron-Nano-v2-9B, MiniCPM-4.1-8B, Ministral-3-Reasoning-8B 和 Falcon-H1R-7B. MiniCPM-4.1-8B 的上下文长度上限是 64K, 所以不参加长上下文评测.

**Results of Standard Evaluation** Table 2 presents the performance of MiniCPM-SALA across a variety of standard benchmarks. The model achieves an average score of 76.53, which represents a competitive level among open-source models of a similar scale. In coding tasks, the model demonstrates high proficiency with scores of 95.12 on HumanEval and 89.11 on MBPP. Mathematical reasoning capabilities also remain robust, as evidenced by the scores of 83.75 on AIME24 and 78.33 on AIME25. These results indicate that the integration of long-context mechanisms does not result in a significant degradation of general capabilities or short-context performance. The model maintains a performance profile that is comparable to, and in some cases exceeds, the performance of models such as Qwen3-8B and Falcon-H1R-7B in standard evaluation settings.

**标准评测结果** 表 2 给出 MiniCPM-SALA 在各类标准基准上的表现. 模型平均分 76.53, 在规模相近的开源模型里处于有竞争力的水平. 代码任务上表现出色, HumanEval 95.12, MBPP 89.11. 数学推理能力也保持稳健, AIME24 83.75, AIME25 78.33. 这些结果说明, 引入长上下文机制没有让通用能力或短上下文表现明显下降. 在标准评测设置下, 模型的表现与 Qwen3-8B, Falcon-H1R-7B 等模型相当, 部分项目还更好.

> **停一下:** 平均分 76.53 高于同源全注意力的 MiniCPM-4.1 (76.13), 能不能说转换没有代价?
> 本文第 6 页表 2 逐项对比, MiniCPM-SALA 相对 MiniCPM-4.1 在 CMMLU 降 3.17, MMLU-Pro 降 5.66, MBPP 降 1.94, BBH 降 1.13, IFEval 降 1.11; 在 AIME25 升 6.25, HumanEval 升 3.66, LCB-v5 升 3.59, AIME24 升 2.92. 平均分持平是知识类下降和数学代码上升相抵的结果, MMLU-Pro 的 67.04 还是全表最低.

> **问:** 表 2 的各模型是在推理模式还是非推理模式下评的, 解码设置一样吗?
> 本文第 5 到 6 页只说用 OpenCompass 框架评测, 没有交代各模型是否开启推理模式, 采样温度, 最大生成长度和重复次数. AIME 每年只有 30 题, 表里却出现 83.75, 81.46 这类分数, 说明做过多次采样取平均, 但次数本文没有写.

> **拆开:** 表 3 的 Average 38.97 是怎么算的, MiniCPM-SALA 在每个基准上都领先吗?
> 本文第 6 页表 3 的 Average 是 11 列的简单平均 (RULER 2 列, MRCR 6 列, NoLiMa 3 列), 可以复算出 38.97. 分基准看, RULER 和 NoLiMa 共五列 MiniCPM-SALA 全部第一; MRCR 六列里一列第一都没有, 2N 两列 Ministral-3-R 分别是 44.02 和 50.30, 64K-4N, 64K-8N, 128K-8N 三列还低于 Qwen3-8B.

<small><span class="docvortex-page-footnote" data-block-type="page_footnote" style="color:#6b7280"><sup>1</sup>[https://huggingface.co/datasets/openai/mrcr](https://huggingface.co/datasets/openai/mrcr)</span></small>

脚注 1: MRCR 数据集在 Hugging Face 上的地址.

<!-- page 7 of 14 -->

MiniCPM-SALA

3 OpenBMB

Table 4: Ultra-long context evaluation results of MiniCPM-SALA and other open-source LLMs. ∗ denotes results cited from the official Qwen3-Next documentation.

| RULER |
| --- |
| Qwen3-30B-A3B-Instruct-2507* |
| Qwen3-235B-A22B-Instruct-2507* |
| Qwen3-Next-80B-A3B-Instruct* |
| MiniCPM-SALA (9B) |

| 128K | 512K | 1000K | 2048K |
| --- | --- | --- | --- |
| 89.1 | 78.4 | 72.8 | - |
| 93.9 | 90.9 | 84.5 | - |
| 96.0 | 86.9 | 80.3 | - |
| 89.4 | 87.1 | 86.3 | 81.6 |

表 4: MiniCPM-SALA 与其他开源 LLM 的超长上下文评测结果. ∗ 表示结果引自 Qwen3-Next 官方文档. MinerU 把模型名和分数拆成了两块, 按行对齐后如下 (RULER 分数):

| 模型 | 128K | 512K | 1000K | 2048K |
| --- | --- | --- | --- | --- |
| Qwen3-30B-A3B-Instruct-2507* | 89.1 | 78.4 | 72.8 | - |
| Qwen3-235B-A22B-Instruct-2507* | 93.9 | 90.9 | 84.5 | - |
| Qwen3-Next-80B-A3B-Instruct* | 96.0 | 86.9 | 80.3 | - |
| MiniCPM-SALA (9B) | 89.4 | 87.1 | 86.3 | 81.6 |

![图 2(a) A6000D 非量化 TTFT](images/p07-a-ttft-s-on-a6000d-non-quantized.png)

(a) TTFT (s) on A6000D (non-quantized).

(a) A6000D 上的首 token 延迟, 单位秒 (非量化).

![图 2(b) A6000D 非量化端到端延迟](images/p07-b-end-to-end-s-latency-on-a6000d-non-quantized.png)

(b) End-to-end (s) latency on A6000D (non-quantized).

(b) A6000D 上的端到端延迟, 单位秒 (非量化).

![图 2(c) A6000D 量化 TTFT](images/p07-c-ttft-s-on-a6000d-quantized.png)

(c) TTFT (s) on A6000D (quantized).

(c) A6000D 上的首 token 延迟, 单位秒 (量化).

![图 2(d) A6000D 量化端到端延迟](images/p07-d-end-to-end-s-latency-on-a6000d-quantized.png)

(d) End-to-end (s) latency on A6000D (quantized).

(d) A6000D 上的端到端延迟, 单位秒 (量化).

Figure 2: Inference speed comparison between Qwen3-8B and MiniCPM-SALA. For each tested sequence length, the models process a specified input (prefilling) and generate 1K tokens (decoding). “TTFT” denotes A6000 GPTQ ttftA6000 GPTQ end-to-endTime To First Token, representing the prefilling latency, while “End-to-end” measures the total latency including both prefilling and decoding phases.

图 2: Qwen3-8B 与 MiniCPM-SALA 的推理速度对比. 每个测试长度下, 模型先处理给定输入 (预填充), 再生成 1K token (解码). 「TTFT」 即 Time To First Token (首 token 延迟), 代表预填充延迟; 「End-to-end」 是包含预填充和解码两个阶段的总延迟. 英文图题里 「A6000 GPTQ ttftA6000 GPTQ end-to-end」 这串字是抽取时混进来的图表标签, 不属于句子.

四张子图的读数 (秒, 前者 Qwen3, 后者 MiniCPM-SALA, 长度依次为 64K, 128K, 256K, 512K, 1024K): (a) 16.1 / 12.3, 51.3 / 25.2, 180.8 / 51.6, OOM / 109.9, OOM / 250.3; (b) 36.8 / 30.4, 79.4 / 43.3, 223.8 / 69.8, OOM / 128.2, OOM / 269.1; (c) 16.4 / 12.6, 52.1 / 25.7, 182.3 / 52.6, OOM / 112.7, OOM / 256.9; (d) 29.6 / 21.1, 72.8 / 34.4, 217.8 / 61.4, OOM / 121.7, OOM / 266.4.

> **看表:** 摘要里的 「最高 3.5 倍」 对应图 2 的哪个数?
> 本文第 7 页图 2(a) 256K 的 TTFT 是 180.8 秒对 51.6 秒, 比值 3.50, 第 9 页正文引用的也是这一对. 同一长度下非量化端到端是 223.8 对 69.8, 只有 3.21 倍; 量化端到端 217.8 对 61.4 则是 3.55 倍. 所以 3.5 倍说的是预填充速度, 端到端提速取决于是否量化, 在 3.2 到 3.55 倍之间.

**Results of Long-Context Evaluation** The evaluation of long-context capabilities is summarized in Table 3, covering benchmarks such as RULER, MRCR, and NoLiMa. MiniCPM-SALA shows a notable proficiency in managing extended input sequences. On the RULER benchmark at a 128K context length, the model maintains a score of 89.37, while many other baselines exhibit a more pronounced decrease in accuracy at the same scale. The advantage of the model is particularly visible in the NoLiMa benchmark, where it achieves a score of 23.86 at the 128K level. This performance is substantially higher than the scores recorded for other models in the comparison. With an overall average long-context score of 38.97, the model demonstrates improved stability and effective information retrieval across large context windows.

**长上下文评测结果** 长上下文能力的评测汇总在表 3, 覆盖 RULER, MRCR 和 NoLiMa 等基准. MiniCPM-SALA 处理长输入序列的能力突出. 在 128K 上下文长度的 RULER 上, 模型保持 89.37 分, 而许多基线在同样长度上准确率下降更明显. 模型的优势在 NoLiMa 上尤其明显, 128K 档得分 23.86, 大幅高于对比中的其他模型. 长上下文总平均分 38.97, 说明模型在大上下文窗口里更稳定, 信息检索更有效.

<!-- page 8 of 14 -->

MiniCPM-SALA

3 OpenBMB

![图 3(a) 5090 非量化 TTFT](images/p08-a-ttft-s-on-5090-non-quantized.png)

(a) TTFT (s) on 5090 (non-quantized).

(a) 5090 上的首 token 延迟, 单位秒 (非量化).

![图 3(b) 5090 非量化端到端延迟](images/p08-b-end-to-end-s-latency-on-5090-non-quantized.png)

(b) End-to-end (s) latency on 5090 (non-quantized).

(b) 5090 上的端到端延迟, 单位秒 (非量化).

![图 3(c) 5090 量化 TTFT](images/p08-c-ttft-s-on-5090-quantized.png)

(c) TTFT (s) on 5090 (quantized).

(c) 5090 上的首 token 延迟, 单位秒 (量化).

![图 3(d) 5090 量化端到端延迟](images/p08-d-end-to-end-s-latency-on-5090-quantized.png)

(d) End-to-end (s) latency on 5090 (quantized).

(d) 5090 上的端到端延迟, 单位秒 (量化).

Figure 3: Inference speed comparison between Qwen3-8B and MiniCPM-SALA. For each tested sequence length, the models process a specified input (prefilling) and generate 1K tokens (decoding).

图 3: Qwen3-8B 与 MiniCPM-SALA 的推理速度对比. 每个测试长度下, 模型先处理给定输入 (预填充), 再生成 1K token (解码).

四张子图的读数 (秒, 前者 Qwen3, 后者 MiniCPM-SALA, 长度依次为 64K, 128K, 256K, 512K, 1024K): (a) 10.4 / 10.8, OOM / 22.3, OOM / 45.9, OOM / 100.3, OOM / 222.6; (b) 27.0 / 25.0, OOM / 36.5, OOM / 60.3, OOM / 115.2, OOM / 238.1; (c) 10.6 / 10.9, 33.3 / 22.2, OOM / 46.1, OOM / 100.4, OOM / 228.0; (d) 21.5 / 17.6, 50.1 / 28.9, OOM / 53.0, OOM / 107.7, OOM / 235.7.

**Results of Ultra-Long Context** As demonstrated in Table 4, MiniCPM-SALA exhibits surprising length extrapolation capabilities. The results for the Qwen3 models are sourced from the official Qwen3-Next documentation<sup>2</sup>. Despite being restricted to a 520K training length, the model successfully extrapolates to 2048K tokens without a significant degradation in performance, maintaining a score of 81.6. It is worth noting that this extrapolation requires no auxiliary techniques (e.g., YaRN (Peng et al., 2024)). This result highlights the efficacy of our approach in handling context windows far beyond the training stage. Additionally, MiniCPM-SALA shows remarkable parameter efficiency, surpassing the performance of the Qwen3-Next-80B-A3B-Instruct model at the 1000K context length (86.3 vs. 80.3), proving that effective long-context processing does not necessarily require massive parameter counts. The length extrapolation capabilities of MiniCPM-SALA can be attributed to the NoPE configuration within the sparse attention layers. In this design, the stored KV-Cache does not require combination with positional information, which can otherwise hinder the capture of long-range dependencies.

**超长上下文结果** 如表 4 所示, MiniCPM-SALA 表现出出人意料的长度外推能力. Qwen3 各模型的结果来自 Qwen3-Next 官方文档 (脚注 2). 尽管训练长度限制在 520K, 模型仍能外推到 2048K token 而没有明显的性能下降, 得分保持在 81.6. 值得注意的是, 这种外推不需要任何辅助技术 (如 YaRN (Peng et al., 2024)). 这一结果说明我们的方法能处理远超训练阶段的上下文窗口. 此外, MiniCPM-SALA 的参数效率也很突出, 在 1000K 上下文长度上超过了 Qwen3-Next-80B-A3B-Instruct (86.3 对 80.3), 说明有效的长上下文处理不一定需要庞大的参数量. MiniCPM-SALA 的长度外推能力可以归因于稀疏注意力层的 NoPE 配置. 在这种设计下, 存下来的 KV-Cache 不需要和位置信息结合, 而位置信息本来可能妨碍捕捉长程依赖.

> **回看:** 正文说训练长度限制在 520K, 可最后两段 SFT 只用了 64K 和 140K, 外推倍数该按哪个算?
> 本文第 5 页长衰减最长的一段是 520K, 之后 SFT 退回 64K 和 140K; 第 8 页说的 「520K 训练长度」 指模型见过的最长序列. 按 520K 算, 2048K 约是 3.9 倍外推; 按最后一个训练阶段的 140K 算, 约是 14.6 倍. 本文没有给 SFT 前后在长上下文上的对比.

> **想:** 线性层加了 RoPE, 到 2048K 时位置远超训练范围, 为什么没有拖垮外推?
> 本文第 8 页只把外推归功于稀疏层的 NoPE, 没有讨论线性层上的 RoPE; 第 4 页引用 Chen et al. (2026) 说 Lightning Attention 长度泛化更好. 线性层把历史压进固定大小的状态, 精确的远距离检索主要由稀疏层完成, 这可能是 RoPE 影响有限的原因, 但本文没有做去掉 RoPE 或更换位置编码的消融, 这一点只能存疑.

<small><span class="docvortex-page-footnote" data-block-type="page_footnote" style="color:#6b7280"><sup>2</sup>[https://huggingface.co/Qwen/Qwen3-Next-80B-A3B-Instruct](https://huggingface.co/Qwen/Qwen3-Next-80B-A3B-Instruct)</span></small>

脚注 2: Qwen3-Next-80B-A3B-Instruct 的 Hugging Face 页面.

<!-- page 9 of 14 -->

MiniCPM-SALA

OpenBMB

## 3.2 Inference Speed (推理速度)

We assessed the inference speed of MiniCPM-SALA and Qwen3-8B across different hardware and sequence lengths. To verify the long-text processing capabilities of the model in edge computing scenarios, we conducted experiments not only on cloud-grade inference chips, such as the NVIDIA A6000D, but also on consumergrade edge GPUs, such as the NVIDIA 5090. For each sequence length, we measured both the Time To First Token (TTFT) and the end-to-end latency. The former serves as an indicator of the prefilling speed, while the latter reflects the combined performance of the prefilling and decoding phases. To align the evaluation with practical deployment scenarios, we assessed the inference latency for both non-quantized models and models compressed via GPTQ (Frantar et al., 2023) INT4 quantization.

我们在不同硬件和序列长度上评估了 MiniCPM-SALA 和 Qwen3-8B 的推理速度. 为了验证模型在边缘计算场景下的长文本处理能力, 实验不仅在 NVIDIA A6000D 这类云端推理芯片上做, 也在 NVIDIA 5090 这类消费级端侧 GPU 上做. 每个序列长度下, 我们都测量首 token 延迟 (TTFT) 和端到端延迟. 前者反映预填充速度, 后者反映预填充和解码两个阶段的综合表现. 为了贴近实际部署, 我们同时评估了非量化模型和经 GPTQ (Frantar et al., 2023) INT4 量化压缩后的模型的推理延迟.

Figure 2 presents a comprehensive comparison of inference latency between Qwen3-8B and MiniCPM-SALA on an NVIDIA A6000D GPU (96GB VRAM). We evaluated performance across sequence lengths ranging from 64K to 1024K tokens. As illustrated, MiniCPM-SALA demonstrates a significant performance advantage over the baseline across all tested configurations. In non-quantized settings, MiniCPM-SALA consistently achieves lower latency. Notably, at a sequence length of 256K, MiniCPM-SALA reduces the TTFT from 180.8s (Qwen3) to just 51.6s.

图 2 全面对比了 Qwen3-8B 与 MiniCPM-SALA 在 NVIDIA A6000D GPU (96GB 显存) 上的推理延迟. 评估覆盖 64K 到 1024K token 的序列长度. 如图所示, MiniCPM-SALA 在所有测试配置下都明显优于基线. 非量化设置下, MiniCPM-SALA 的延迟始终更低. 尤其在 256K 序列长度上, MiniCPM-SALA 把 TTFT 从 180.8 秒 (Qwen3) 降到 51.6 秒.

Crucially, the results highlight a distinct advantage in memory efficiency. While Qwen3-8B encounters OOM failures at sequence lengths of 512K and 1024K, MiniCPM-SALA successfully processes these extended contexts. For example, at 1024K tokens, MiniCPM-SALA maintains a TTFT of 250.3s (non-quantized) and 256.9s (quantized), whereas the baseline fails to complete the inference. This trend persists in the end-to-end latency metrics, proving that MiniCPM-SALA is robust enough for ultra-long context generation tasks where full-attention models fail.

更关键的是, 结果显示了显存效率上的明显优势. Qwen3-8B 在 512K 和 1024K 序列长度上出现 OOM, MiniCPM-SALA 则能处理这些超长上下文. 例如在 1024K token 时, MiniCPM-SALA 的 TTFT 为 250.3 秒 (非量化) 和 256.9 秒 (量化), 基线则无法完成推理. 端到端延迟上也是同样的趋势, 说明在全注意力模型失败的超长上下文生成任务上, MiniCPM-SALA 足够稳健.

> **拆开:** 1024K 时量化版 TTFT 256.9 秒反而比非量化的 250.3 秒慢, INT4 量化到底快在哪?
> 把本文第 7 页图 2 的端到端延迟减去 TTFT, 得到生成 1K token 的解码时间: MiniCPM-SALA 非量化在 64K 到 1024K 都是 18 到 19 秒, 量化后是 8.5 到 9.5 秒, 快一倍左右; 预填充几乎没变, 每一档都是量化版略慢. GPTQ INT4 只压缩权重, 省下的是解码时的访存, 预填充受算力限制, 可能还多了反量化开销, 本文第 9 页没有展开这一点.

Figure 3 demonstrates the critical advantage of MiniCPM-SALA on memory-constrained hardware. On the RTX 5090 (32GB VRAM), the baseline Qwen3-8B hits a “memory wall” significantly earlier than on the A6000D, triggering OOM errors at just 128K tokens in non-quantized settings and 256K in quantized settings. In stark contrast, MiniCPM-SALA successfully scales to 1024K context lengths without memory failure. This suggests that MiniCPM-SALA effectively democratizes long-context inference, enabling 1M-token processing on consumer-level GPUs where full-attention architectures are unusable.

图 3 展示了 MiniCPM-SALA 在显存受限硬件上的关键优势. 在 RTX 5090 (32GB 显存) 上, 基线 Qwen3-8B 比在 A6000D 上更早撞上 「显存墙」: 非量化设置下 128K token 就 OOM, 量化设置下 256K 就 OOM. 形成鲜明对比的是, MiniCPM-SALA 能一路扩展到 1024K 上下文长度而不出现显存失败. 这说明 MiniCPM-SALA 让长上下文推理变得更普及, 在全注意力架构无法使用的消费级 GPU 上也能处理 1M token.

> **再看:** 第 9 页说 MiniCPM-SALA 在所有测试配置下都明显优于基线, 5090 上的 64K 也是这样吗?
> 那句话在本文第 9 页是针对图 2 的 A6000D 说的. 第 8 页图 3 的 5090 上, 64K 的 TTFT 非量化是 10.4 秒 (Qwen3) 对 10.8 秒, 量化是 10.6 对 10.9, MiniCPM-SALA 略慢; 端到端 27.0 对 25.0 和 21.5 对 17.6 才领先, 靠的是解码更快. 短序列上混合架构的预填充没有优势, 优势从 128K 起才明显.

## 4 Conclusion (结论)

In this paper, we presented MiniCPM-SALA, a hybrid architecture that combines sparse and linear attention to overcome the computational and memory bottlenecks of ultra-long context modeling. By utilizing a cost-effective Transformer-to-hybrid training paradigm, we successfully retained the general capabilities of full-attention models while reducing training costs by approximately 75%. Experimental results confirm that MiniCPM-SALA achieves a substantial inference speedup and enables 1M-token context processing on single GPUs (e.g., NVIDIA A6000D), surpassing the limitations of standard 8B models. These results establish MiniCPM-SALA as a scalable and accessible solution for next-generation, information-intensive applications.

本文提出 MiniCPM-SALA, 一种结合稀疏注意力和线性注意力的混合架构, 用来克服超长上下文建模中的计算和显存瓶颈. 借助低成本的 Transformer 到混合模型训练范式, 我们保留了全注意力模型的通用能力, 同时把训练成本降低约 75%. 实验结果证实, MiniCPM-SALA 实现了显著的推理加速, 并能在单张 GPU (如 NVIDIA A6000D) 上处理 1M token 的上下文, 突破了标准 8B 模型的限制. 这些结果表明, MiniCPM-SALA 是面向下一代信息密集型应用的一个可扩展, 易获取的方案.

## 5 Contributions and Acknowledgments (贡献与致谢)

MiniCPM-SALA is the result of the collective efforts of all members of our team. Please refer to Chen et al. (2026) and Zhao et al. (2025) for model architecture details.

MiniCPM-SALA 是团队全体成员共同努力的成果. 模型架构的细节请参考 Chen et al. (2026) 和 Zhao et al. (2025).

**Contributors** (Ordered by the last name) Wenhao An, Yingfa Chen, Yewei Fang, Jiayi Li, Xin Li, Yaohui Li, Yishan Li, Yuxuan Li, Biyuan Lin, Chuan Liu⋆, Hezi Liu, Siyuan Liu, Hongya Lyu, Yinxu Pan, Shixin Ren, Xingyu Shen, Zhou Su, Haojun Sun, Yangang Sun, Zhen Leng Thai, Xin Tian, Rui Wang⋆, Xiaorong Wang, Yudong Wang, Bo Wu, Xiaoyue Xu, Dong Xu, Shuaikang Xue, Jiawei Yang, Bowen Zhang, Jinqian Zhang, Letian Zhang, Shengnan Zhang, Xinyu Zhang, Xinyuan Zhang⋆, Zhu Zhang, Hengyu Zhao, Jiacheng Zhao⋆, Zhi Zheng, Jie Zhou, Zihan Zhou

**贡献者** (按姓氏排序) 名单同上, 其中带 ⋆ 的是 Chuan Liu, Rui Wang, Xinyuan Zhang 和 Jiacheng Zhao.

**Project Design and Coordination** Shuo Wang, Chaojun Xiao, Xu Han, Zhiyuan Liu, Maosong Sun

**项目设计与协调** Shuo Wang, Chaojun Xiao, Xu Han, Zhiyuan Liu, Maosong Sun.

**Affiliations** Contributors marked with ⋆are affiliated with XCORE SIGMA, while the remaining contributors are affiliated with OpenBMB.

**单位** 带 ⋆ 的贡献者来自 XCORE SIGMA, 其余贡献者来自 OpenBMB.

<!-- page 10 of 14 -->

MiniCPM-SALA

3 OpenBMB

## References (参考文献)

参考文献保留英文原文.

AIME. AIME problems and solutions, 2025. URL [https://artofproblemsolving.com/wiki/index.php/AIME\_Problems\_and\_Solutions](https://artofproblemsolving.com/wiki/index.php/AIME_Problems_and_Solutions).

Joshua Ainslie, James Lee-Thorp, Michiel de Jong, Yury Zemlyanskiy, Federico Lebron, and Sumit Sanghai. GQA: Training generalized multi-query transformer models from multi-head checkpoints. In Proceedings of the 2023 Conference on Empirical Methods in Natural Language Processing, 2023. URL [https://aclanthology.org/2023.emnlp-main.298/](https://aclanthology.org/2023.emnlp-main.298/).

Jacob Austin, Augustus Odena, Maxwell Nye, Maarten Bosma, Henryk Michalewski, David Dohan, Ellen Jiang, Carrie Cai, Michael Terry, Quoc Le, et al. Program synthesis with large language models. arXiv preprint arXiv:2108.07732, 2021.

Yushi Bai, Xin Lv, Jiajie Zhang, Yuze He, Ji Qi, Lei Hou, Jie Tang, Yuxiao Dong, and Juanzi Li. LongAlign: A recipe for long context alignment of large language models. In Findings of the Association for Computational Linguistics: EMNLP 2024, 2024. URL [https://aclanthology.org/2024.findings-emnlp.74/](https://aclanthology.org/2024.findings-emnlp.74/).

Yushi Bai, Jiajie Zhang, Xin Lv, Linzhi Zheng, Siqi Zhu, Lei Hou, Yuxiao Dong, Jie Tang, and Juanzi Li. Longwriter: Unleashing 10,000+ word generation from long context LLMs. In The Thirteenth International Conference on Learning Representations, 2025. URL [https://openreview.net/forum?id=kQ5s9Yh0WI](https://openreview.net/forum?id=kQ5s9Yh0WI).

Tom Brown, Benjamin Mann, Nick Ryder, Melanie Subbiah, Jared D Kaplan, Prafulla Dhariwal, Arvind Neelakantan, Pranav Shyam, Girish Sastry, Amanda Askell, et al. Language models are few-shot learners. In H. Larochelle, M. Ranzato, R. Hadsell, M.F. Balcan, and H. Lin (eds.), Advances in Neural Information Processing Systems, volume 33, pp. 1877–1901. Curran Associates, Inc., 2020. URL [https://proceedings.neurips.cc/paper\_files/paper/2020/file/1457c0d6bfcb4967418bfb8ac142f64a-Paper.pdf](https://proceedings.neurips.cc/paper_files/paper/2020/file/1457c0d6bfcb4967418bfb8ac142f64a-Paper.pdf).

Mark Chen, Jerry Tworek, Heewoo Jun, Qiming Yuan, Henrique Ponde De Oliveira Pinto, Jared Kaplan, Harri Edwards, Yuri Burda, Nicholas Joseph, Greg Brockman, et al. Evaluating large language models trained on code. arXiv preprint arXiv:2107.03374, 2021.

Yingfa Chen, Zhen Leng Thai, Zihan Zhou, Zhu Zhang, Xingyu Shen, Shuo Wang, Chaojun Xiao, Xu Han, and Zhiyuan Liu. Hybrid linear attention done right: Efficient distillation and effective architectures for extremely long contexts, 2026. URL [https://arxiv.org/abs/2601.22156](https://arxiv.org/abs/2601.22156).

Gheorghe Comanici, Eric Bieber, Mike Schaekermann, Ice Pasupat, Noveen Sachdeva, Inderjit Dhillon, Marcel Blistein, Ori Ram, Dan Zhang, Evan Rosen, et al. Gemini 2.5: Pushing the frontier with advanced reasoning, multimodality, long context, and next generation agentic capabilities, 2025. URL [https://arxiv.org/abs/2507.06261](https://arxiv.org/abs/2507.06261).

OpenCompass Contributors. Opencompass: A universal evaluation platform for foundation models. [https://github.com/open-compass/opencompass](https://github.com/open-compass/opencompass), 2023.

DeepSeek-AI, Aixin Liu, Aoxue Mei, Bangcai Lin, Bing Xue, Bingxuan Wang, Bingzheng Xu, Bochao Wu, Bowei Zhang, Chaofan Lin, Chen Dong, et al. Deepseek-v3.2: Pushing the frontier of open large language models, 2025. URL [https://arxiv.org/abs/2512.02556](https://arxiv.org/abs/2512.02556).

Elias Frantar, Saleh Ashkboos, Torsten Hoefler, and Dan Alistarh. Gptq: Accurate post-training quantization for generative pre-trained transformers, 2023. URL [https://arxiv.org/abs/2210.17323](https://arxiv.org/abs/2210.17323).

Aaron Grattafiori, Abhimanyu Dubey, Abhinav Jauhri, Abhinav Pandey, Abhishek Kadian, Ahmad Al-Dahle, Aiesha Letman, Akhil Mathur, Alan Schelten, Alex Vaughan, et al. The llama 3 herd of models, 2024. URL [https://arxiv.org/abs/2407.21783](https://arxiv.org/abs/2407.21783).

Albert Gu and Tri Dao. Mamba: Linear-time sequence modeling with selective state spaces. In First Conference on Language Modeling, 2024. URL [https://openreview.net/forum?id=tEYskw1VY2](https://openreview.net/forum?id=tEYskw1VY2).

Yuxian Gu, Qinghao Hu, Shang Yang, Haocheng Xi, Junyu Chen, Song Han, and Han Cai. Jet-nemotron: Efficient language model with post neural architecture search, 2025. URL [https://arxiv.org/abs/2508.15884](https://arxiv.org/abs/2508.15884).

<!-- page 11 of 14 -->

MiniCPM-SALA

3 OpenBMB

Daya Guo, Qihao Zhu, Dejian Yang, Zhenda Xie, Kai Dong, Wentao Zhang, Guanting Chen, Xiao Bi, Y. Wu, Y. K. Li, Fuli Luo, Yingfei Xiong, and Wenfeng Liang. Deepseek-coder: When the large language model meets programming – the rise of code intelligence, 2024. URL [https://arxiv.org/abs/2401.14196](https://arxiv.org/abs/2401.14196).

Mutian He and Philip N. Garner. Alleviating forgetfulness of linear attention by hybrid sparse attention and contextualized learnable token eviction, 2025. URL [https://arxiv.org/abs/2510.20787](https://arxiv.org/abs/2510.20787).

Alex Henry, Prudhvi Raj Dachapally, Shubham Shantaram Pawar, and Yuxuan Chen. Query-key normalization for transformers. In Findings of the Association for Computational Linguistics: EMNLP 2020, pp. 4246–4253, 2020.

Yuichiro Hoshino, Hideyuki Tachibana, Muneyoshi Inahara, and Hiroto Takegawa. Rad: Redundancy-aware distillation for hybrid models via self-speculative decoding, 2025. URL [https://arxiv.org/abs/2505.22135](https://arxiv.org/abs/2505.22135).

Haowen Hou, Zhiyi Huang, Kaifeng Tan, Rongchang Lu, and Fei Richard Yu. Rwkv-x: A linear complexity hybrid language model, 2025. URL [https://arxiv.org/abs/2504.21463](https://arxiv.org/abs/2504.21463).

Cheng-Ping Hsieh, Simeng Sun, Samuel Kriman, Shantanu Acharya, Dima Rekesh, Fei Jia, and Boris Ginsburg. RULER: What’s the real context size of your long-context language models? In First Conference on Language Modeling, 2024. URL [https://openreview.net/forum?id=kIoBbc76Sy](https://openreview.net/forum?id=kIoBbc76Sy).

Xiang Hu, Jiaqi Leng, Jun Zhao, Kewei Tu, and Wei Wu. Hardware-aligned hierarchical sparse attention for efficient long-term memory access, 2025. URL [https://arxiv.org/abs/2504.16795](https://arxiv.org/abs/2504.16795).

Naman Jain, King Han, Alex Gu, Wen-Ding Li, Fanjia Yan, Tianjun Zhang, Sida Wang, Armando Solar-Lezama, Koushik Sen, and Ion Stoica. Livecodebench: Holistic and contamination free evaluation of large language models for code. In The Thirteenth International Conference on Learning Representations, 2025. URL [https://openreview.net/forum?id=chfJJYC3iL](https://openreview.net/forum?id=chfJJYC3iL).

Carlos E Jimenez, John Yang, Alexander Wettig, Shunyu Yao, Kexin Pei, Ofir Press, and Karthik R Narasimhan. SWE-bench: Can language models resolve real-world github issues? In The Twelfth International Conference on Learning Representations, 2024. URL [https://openreview.net/forum?id=VTF8yNQM66](https://openreview.net/forum?id=VTF8yNQM66).

Kimi Team, Yu Zhang, Zongyu Lin, Xingcheng Yao, Jiaxi Hu, Fanqing Meng, Chengyin Liu, Xin Men, Songlin Yang, Zhiyuan Li, Wentao Li, et al. Kimi linear: An expressive, efficient attention architecture, 2025. URL [https://arxiv.org/abs/2510.26692](https://arxiv.org/abs/2510.26692).

Haonan Li, Yixuan Zhang, Fajri Koto, Yifei Yang, Hai Zhao, Yeyun Gong, Nan Duan, and Timothy Baldwin. Cmmlu: Measuring massive multitask language understanding in chinese, 2023.

Keyu Li, Junhao Shi, Yang Xiao, Mohan Jiang, Jie Sun, Yunze Wu, Shijie Xia, Xiaojie Cai, Tianze Xu, Weiye Si, Wenjie Li, Dequan Wang, and Pengfei Liu. Agencybench: Benchmarking the frontiers of autonomous agents in 1m-token real-world contexts, 2026. URL [https://arxiv.org/abs/2601.11044](https://arxiv.org/abs/2601.11044).

Yanhong Li, Songlin Yang, Shawn Tan, Mayank Mishra, Rameswar Panda, Jiawei Zhou, and Yoon Kim. Distilling to hybrid attention models via kl-guided layer selection, 2025. URL [https://arxiv.org/abs/2512.20569](https://arxiv.org/abs/2512.20569).

Alexander H. Liu, Kartik Khandelwal, Sandeep Subramanian, Victor Jouault, Abhinav Rastogi, Adrien Sadé, Alan Jeffares, Albert Jiang, Alexandre Cahill, Alexandre Gavaudan, et al. Ministral 3, 2026. URL [https://arxiv.org/abs/2601.08584](https://arxiv.org/abs/2601.08584).

Tianyang Liu, Canwen Xu, and Julian McAuley. Repobench: Benchmarking repository-level code autocompletion systems. In The Twelfth International Conference on Learning Representations, 2024. URL [https://openreview.net/forum?id=pPjZIOuQuF](https://openreview.net/forum?id=pPjZIOuQuF).

Grégoire Mialon, Clémentine Fourrier, Craig Swift, Thomas Wolf, Yann LeCun, and Thomas Scialom. Gaia: a benchmark for general ai assistants, 2023. URL [https://arxiv.org/abs/2311.12983](https://arxiv.org/abs/2311.12983).

MiniCPM-Team, Chaojun Xiao, Yuxuan Li, Xu Han, Yuzhuo Bai, Jie Cai, Haotian Chen, Wentong Chen, Xin Cong, Ganqu Cui, Ning Ding, et al. Minicpm4: Ultra-efficient llms on end devices, 2025. URL [https://arxiv.org/abs/2506.07900](https://arxiv.org/abs/2506.07900).

<!-- page 12 of 14 -->

MiniCPM-SALA

3 OpenBMB

Ali Modarressi, Hanieh Deilamsalehy, Franck Dernoncourt, Trung Bui, Ryan A. Rossi, Seunghyun Yoon, and Hinrich Schuetze. Nolima: Long-context evaluation beyond literal matching. In Forty-second International Conference on Machine Learning, 2025. URL [https://openreview.net/forum?id=0OshX1hiSa](https://openreview.net/forum?id=0OshX1hiSa).

NVIDIA, Aarti Basant, Abhijit Khairnar, Abhijit Paithankar, Abhinav Khattar, Adithya Renduchintala, Aditya Malte, Akhiad Bercovich, Akshay Hazare, Alejandra Rico, et al. Nvidia nemotron nano 2: An accurate and efficient hybrid mamba-transformer reasoning model, 2025a. URL [https://arxiv.org/abs/2508.14444](https://arxiv.org/abs/2508.14444).

NVIDIA, Aaron Blakeman, Aaron Grattafiori, Aarti Basant, Abhibha Gupta, Abhinav Khattar, Adi Renduchintala, Aditya Vavre, Akanksha Shukla, Akhiad Bercovich, Aleksander Ficek, et al. Nemotron 3 nano: Open, efficient mixture-of-experts hybrid mamba-transformer model for agentic reasoning, 2025b. URL [https://arxiv.org/abs/2512.20848](https://arxiv.org/abs/2512.20848).

OpenAI, Josh Achiam, Steven Adler, Sandhini Agarwal, Lama Ahmad, Ilge Akkaya, Florencia Leoni Aleman, Diogo Almeida, Janko Altenschmidt, Sam Altman, Shyamal Anadkat, et al. Gpt-4 technical report, 2024. URL [https://arxiv.org/abs/2303.08774](https://arxiv.org/abs/2303.08774).

Bo Peng, Eric Alcaide, Quentin Anthony, Alon Albalak, Samuel Arcadinho, Stella Biderman, Huanqi Cao, Xin Cheng, Michael Chung, Leon Derczynski, Xingjian Du, Matteo Grella, Kranthi Gv, Xuzheng He, Haowen Hou, Przemyslaw Kazienko, Jan Kocon, Jiaming Kong, Bartłomiej Koptyra, Hayden Lau, Jiaju Lin, Krishna Sri Ipsit Mantri, Ferdinand Mom, Atsushi Saito, Guangyu Song, Xiangru Tang, Johan Wind, Stanisław Woźniak, Zhenyuan Zhang, Qinghua Zhou, Jian Zhu, and Rui-Jie Zhu. RWKV: Reinventing RNNs for the transformer era. In Findings of the Association for Computational Linguistics: EMNLP 2023, 2023. URL [https://aclanthology.org/2023.findings-emnlp.936/](https://aclanthology.org/2023.findings-emnlp.936/).

Bowen Peng, Jeffrey Quesnelle, Honglu Fan, and Enrico Shippole. YaRN: Efficient context window extension of large language models. In The Twelfth International Conference on Learning Representations, 2024. URL [https://openreview.net/forum?id=wHBfxhZu1u](https://openreview.net/forum?id=wHBfxhZu1u).

Chen Qian, Wei Liu, Hongzhang Liu, Nuo Chen, Yufan Dang, Jiahao Li, Cheng Yang, Weize Chen, Yusheng Su, Xin Cong, Juyuan Xu, Dahai Li, Zhiyuan Liu, and Maosong Sun. ChatDev: Communicative agents for software development. In Proceedings of the 62nd Annual Meeting of the Association for Computational Linguistics (Volume 1: Long Papers), 2024. URL [https://aclanthology.org/2024.acl-long.810/](https://aclanthology.org/2024.acl-long.810/).

Zhen Qin, Weigao Sun, Dong Li, Xuyang Shen, Weixuan Sun, and Yiran Zhong. Various lengths, constant speed: Efficient language modeling with lightning attention. In Forty-first International Conference on Machine Learning, 2024. URL [https://openreview.net/forum?id=Lwm6TiUP4X](https://openreview.net/forum?id=Lwm6TiUP4X).

Zihan Qiu, Zekun Wang, Bo Zheng, Zeyu Huang, Kaiyue Wen, Songlin Yang, Rui Men, Le Yu, Fei Huang, Suozhi Huang, Dayiheng Liu, Jingren Zhou, and Junyang Lin. Gated attention for large language models: Non-linearity, sparsity, and attention-sink-free. In The Thirty-ninth Annual Conference on Neural Information Processing Systems, 2025. URL [https://openreview.net/forum?id=1b7whO4SfY](https://openreview.net/forum?id=1b7whO4SfY).

Qwen Team. Qwen3-Next: Towards Ultimate Training & Inference Efficiency, 2025. URL [https://qwen.ai/blog?id=4074cca80393150c248e508aa62983f9cb7d27cd](https://qwen.ai/blog?id=4074cca80393150c248e508aa62983f9cb7d27cd).

Yijia Shao, Yucheng Jiang, Theodore Kanell, Peter Xu, Omar Khattab, and Monica Lam. Assisting in writing Wikipedia-like articles from scratch with large language models. In Proceedings of the 2024 Conference of the North American Chapter of the Association for Computational Linguistics: Human Language Technologies (Volume 1: Long Papers), 2024. URL [https://aclanthology.org/2024.naacl-long.347/](https://aclanthology.org/2024.naacl-long.347/).

Jianlin Su, Yu Lu, Shengfeng Pan, Ahmed Murtadha, Bo Wen, and Yunfeng Liu. Roformer: Enhanced transformer with rotary position embedding, 2023. URL [https://arxiv.org/abs/2104.09864](https://arxiv.org/abs/2104.09864).

Mirac Suzgun, Nathan Scales, Nathanael Schärli, Sebastian Gehrmann, Yi Tay, Hyung Won Chung, Aakanksha Chowdhery, Quoc V Le, Ed H Chi, Denny Zhou, et al. Challenging big-bench tasks and whether chain-of-thought can solve them. arXiv preprint arXiv:2210.09261, 2022.

Falcon LLM Team, Iheb Chaabane, Puneesh Khanna, Suhail Mohmad, Slim Frikha, Shi Hu, Abdalgader Abubaker, Reda Alami, Mikhail Lubinets, Mohamed El Amine Seddik, and Hakim Hacid. Falcon-h1r: Pushing the reasoning frontiers with a hybrid model for efficient test-time scaling, 2026. URL [https://arxiv.org/abs/2601.02346](https://arxiv.org/abs/2601.02346).

<!-- page 13 of 14 -->

MiniCPM-SALA

3 OpenBMB

Ashish Vaswani, Noam Shazeer, Niki Parmar, Jakob Uszkoreit, Llion Jones, Aidan N Gomez, Ł ukasz Kaiser, and Illia Polosukhin. Attention is all you need. In I. Guyon, U. Von Luxburg, S. Bengio, H. Wallach, R. Fergus, S. Vishwanathan, and R. Garnett (eds.), Advances in Neural Information Processing Systems, volume 30. Curran Associates, Inc., 2017. URL [https://proceedings.neurips.cc/paper\_files/paper/2017/file/3f5ee243547dee91fbd053c1c4a845aa-Paper.pdf](https://proceedings.neurips.cc/paper_files/paper/2017/file/3f5ee243547dee91fbd053c1c4a845aa-Paper.pdf).

Junxiong Wang, Daniele Paliotta, Avner May, Alexander M. Rush, and Tri Dao. The mamba in the llama: Distilling and accelerating hybrid models. In A. Globerson, L. Mackey, D. Belgrave, A. Fan, U. Paquet, J. Tomczak, and C. Zhang (eds.), Advances in Neural Information Processing Systems, volume 37, pp. 62432–62457. Curran Associates, Inc., 2024a. doi: 10.52202/079017-1996. URL [https://proceedings.neurips.cc/paper\_files/paper/2024/file/723933067ad315269b620bc0d2c05cba-Paper-Conference.pdf](https://proceedings.neurips.cc/paper_files/paper/2024/file/723933067ad315269b620bc0d2c05cba-Paper-Conference.pdf).

Yubo Wang, Xueguang Ma, Ge Zhang, Yuansheng Ni, Abhranil Chandra, Shiguang Guo, Weiming Ren, Aaran Arulraj, Xuan He, Ziyan Jiang, Tianle Li, Max Ku, Kai Wang, Alex Zhuang, Rongqi Fan, Xiang Yue, and Wenhu Chen. Mmlu-pro: A more robust and challenging multi-task language understanding benchmark. In A. Globerson, L. Mackey, D. Belgrave, A. Fan, U. Paquet, J. Tomczak, and C. Zhang (eds.), Advances in Neural Information Processing Systems, volume 37, pp. 95266–95290. Curran Associates, Inc., 2024b. doi: 10.52202/079017-3018. URL [https://proceedings.neurips.cc/paper\_files/paper/2024/file/ad236edc564f3e3156e1b2feafb99a24-Paper-Datasets\_and\_Benchmarks\_Track.pdf](https://proceedings.neurips.cc/paper_files/paper/2024/file/ad236edc564f3e3156e1b2feafb99a24-Paper-Datasets_and_Benchmarks_Track.pdf).

Yudong Wang, Zixuan Fu, Hengyu Zhao, Chen Zhao, Chuyue Zhou, Xinle Lin, Hongya Lyu, Shuaikang Xue, Yi Yi, Yingjiao Wang, Zhi Zheng, Yuzhou Zhang, Jie Zhou, Chaojun Xiao, Xu Han, Zhiyuan Liu, and Maosong Sun. Data science and technology towards agi part i: Tiered data management, 2026. URL [https://arxiv.org/abs/2602.09003](https://arxiv.org/abs/2602.09003).

Chaojun Xiao, Pengle Zhang, Xu Han, Guangxuan Xiao, Yankai Lin, Zhengyan Zhang, Zhiyuan Liu, and Maosong Sun. Infllm: Training-free long-context extrapolation for llms with an efficient context memory. In A. Globerson, L. Mackey, D. Belgrave, A. Fan, U. Paquet, J. Tomczak, and C. Zhang (eds.), Advances in Neural Information Processing Systems, volume 37, pp. 119638–119661. Curran Associates, Inc., 2024. doi: 10.52202/079017-3801. URL [https://proceedings.neurips.cc/paper\_files/paper/2024/file/d842425e4bf79ba039352da0f658a906-Paper-Conference.pdf](https://proceedings.neurips.cc/paper_files/paper/2024/file/d842425e4bf79ba039352da0f658a906-Paper-Conference.pdf).

An Yang, Anfeng Li, Baosong Yang, Beichen Zhang, Binyuan Hui, Bo Zheng, Bowen Yu, Chang Gao, Chengen Huang, Chenxu Lv, et al. Qwen3 technical report, 2025a. URL [https://arxiv.org/abs/2505.09388](https://arxiv.org/abs/2505.09388).

Songlin Yang, Bailin Wang, Yikang Shen, Rameswar Panda, and Yoon Kim. Gated linear attention transformers with hardware-efficient training. In Forty-first International Conference on Machine Learning, 2024a. URL [https://openreview.net/forum?id=ia5XvxFUJT](https://openreview.net/forum?id=ia5XvxFUJT).

Songlin Yang, Bailin Wang, Yu Zhang, Yikang Shen, and Yoon Kim. Parallelizing linear transformers with the delta rule over sequence length. In The Thirty-eighth Annual Conference on Neural Information Processing Systems, 2024b. URL [https://openreview.net/forum?id=y8Rm4VNRPH](https://openreview.net/forum?id=y8Rm4VNRPH).

Songlin Yang, Jan Kautz, and Ali Hatamizadeh. Gated delta networks: Improving mamba2 with delta rule. In The Thirteenth International Conference on Learning Representations, 2025b. URL [https://openreview.net/forum?id=r8H7xhYPwz](https://openreview.net/forum?id=r8H7xhYPwz).

Jingyang Yuan, Huazuo Gao, Damai Dai, Junyu Luo, Liang Zhao, Zhengyan Zhang, Zhenda Xie, Yuxing Wei, Lean Wang, Zhiping Xiao, Yuqing Wang, Chong Ruan, Ming Zhang, Wenfeng Liang, and Wangding Zeng. Native sparse attention: Hardware-aligned and natively trainable sparse attention. In Proceedings of the 63rd Annual Meeting of the Association for Computational Linguistics (Volume 1: Long Papers), 2025. URL [https://aclanthology.org/2025.acl-long.1126/](https://aclanthology.org/2025.acl-long.1126/).

Weilin Zhao, Zihan Zhou, Zhou Su, Chaojun Xiao, Yuxuan Li, Yanghao Li, Yudi Zhang, Weilun Zhao, Zhen Li, Yuxiang Huang, Ao Sun, Xu Han, and Zhiyuan Liu. Infllm-v2: Dense-sparse switchable attention for seamless short-to-long adaptation, 2025. URL [https://arxiv.org/abs/2509.24663](https://arxiv.org/abs/2509.24663).

Jeffrey Zhou, Tianjian Lu, Swaroop Mishra, Siddhartha Brahma, Sujoy Basu, Yi Luan, Denny Zhou, and Le Hou. Instruction-following evaluation for large language models, 2023. URL [https://arxiv.org/abs/2311.07911](https://arxiv.org/abs/2311.07911).

<!-- page 14 of 14 -->

MiniCPM-SALA

OpenBMB

Zihan Zhou, Chong Li, Xinyi Chen, Shuo Wang, Yu Chao, Zhili Li, Haoyu Wang, Qi Shi, Zhixing Tan, Xu Han, Xiaodong Shi, Zhiyuan Liu, and Maosong Sun. LLM×MapReduce: Simplified long-sequence processing using large language models. In Proceedings of the 63rd Annual Meeting of the Association for Computational Linguistics (Volume 1: Long Papers), 2025. URL [https://aclanthology.org/2025.acl-long.1341/](https://aclanthology.org/2025.acl-long.1341/).

Jingwei Zuo, Maksim Velikanov, Ilyas Chahed, Younes Belkada, Dhia Eddine Rhayem, Guillaume Kunsch, Hakim Hacid, Hamza Yous, Brahim Farhat, Ibrahim Khadraoui, Mugariya Farooq, Giulia Campesan, Ruxandra Cojocaru, Yasser Djilali, Shi Hu, Iheb Chaabane, Puneesh Khanna, Mohamed El Amine Seddik, Ngoc Dung Huynh, Phuc Le Khac, Leen AlQadi, Billel Mokeddem, Mohamed Chami, Abdalgader Abubaker, Mikhail Lubinets, Kacper Piskorski, and Slim Frikha. Falcon-h1: A family of hybrid-head language models redefining efficiency and performance, 2025. URL [https://arxiv.org/abs/2507.22448](https://arxiv.org/abs/2507.22448).
