---
title: "mHC 对照译稿"
category: "架构与算法"
tags: ["DeepSeek", "对照译稿"]
published: true
excerpt: "DeepSeek mHC 论文 (arXiv 2512.24880) 的逐段中英对照译稿, 附读论文时关于双随机约束, 读写量与重计算的疑问块."
---
<!-- page 1 of 19 -->

arXiv:2512.24880v2 [cs.CL] 5 Jan 2026

Qdeepseek

# mHC: Manifold-Constrained Hyper-Connections · 流形约束超连接

Zhenda Xie\*†, Yixuan Wei\*, Huanqi Cao\*,

Chenggang Zhao, Chengqi Deng, Jiashi Li, Damai Dai, Huazuo Gao, Jiang Chang, Kuai Yu, Liang Zhao, Shangyan Zhou, Zhean Xu, Zhengyan Zhang, Wangding Zeng, Shengding Hu, Yuqing Wang, Jingyang Yuan, Lean Wang, Wenfeng Liang

**DeepSeek-AI**

## Abstract

Recently, studies exemplified by Hyper-Connections (HC) have extended the ubiquitous residual connection paradigm established over the past decade by expanding the residual stream width and diversifying connectivity patterns. While yielding substantial performance gains, this diversification fundamentally compromises the identity mapping property intrinsic to the residual connection, which causes severe training instability and restricted scalability, and additionally incurs notable memory access overhead. To address these challenges, we propose **Manifold-Constrained Hyper-Connections** (**mHC**), a general framework that projects the residual connection space of HC onto a specific manifold to restore the identity mapping property, while incorporating rigorous infrastructure optimization to ensure efficiency. Empirical experiments demonstrate that mHC is effective for training at scale, offering tangible performance improvements and superior scalability. We anticipate that mHC, as a flexible and practical extension of HC, will contribute to a deeper understanding of topological architecture design and suggest promising directions for the evolution of foundational models.

以 Hyper-Connections (HC) 为代表的一批工作, 把过去十年通行的残差连接范式往前推了一步: 加宽残差流, 让连接方式更多样. 这样做带来了可观的性能提升, 但多样化的连接从根本上破坏了残差连接自带的恒等映射性质, 结果是训练严重不稳, 规模难以做大, 另外还带来明显的访存开销. 为此我们提出 **流形约束超连接** (**mHC**): 一个通用框架, 把 HC 的残差连接空间投影到一个特定的流形上, 恢复恒等映射性质, 同时配上严格的基础设施优化来保证效率. 实验表明 mHC 能有效支撑大规模训练, 带来实际的性能提升和更好的可扩展性. 我们期望 mHC 作为 HC 的一个灵活实用的扩展, 能加深人们对拓扑结构设计的理解, 并为基础模型的演进指出有希望的方向.

![Image block](./images/p01-figure-1-illustrations-of-residual-connection-paradigms-this-figure.jpg)

(a) Residual Connection

![Image block](./images/p01-figure-1-illustrations-of-residual-connection-paradigms-this-figure-2.jpg)

(b) Hyper-Connections (HC)

![Image block](./images/p01-figure-1-illustrations-of-residual-connection-paradigms-this-figure-3.jpg)

(c) Manifold-Constrained HC (mHC)

Figure 1 | **Illustrations of Residual Connection Paradigms.** This figure compares the structural design of (a) standard Residual Connection, (b) Hyper-Connections (HC), and (c) our proposed **Manifold-Constrained Hyper-Connections** (**mHC**). Unlike the unconstrained HC, mHC focuses on optimizing the residual connection space by projecting the matrices onto a constrained manifold to ensure stability.

\*Core contributors. †Corresponding author: [xie.zhenda@deepseek.com](mailto:xie.zhenda@deepseek.com)

<!-- page 2 of 19 -->

## Contents

- 1 Introduction 3
- 2 Related Works 4
- 2.1 Micro Design 4
- 2.2 Macro Design 5
- 3 Preliminary 5
- 3.1 Numerical Instability 6
- 3.2 System Overhead 7
- 4 Method 8
- 4.1 Manifold-Constrained Hyper-Connections 8
- 4.2 Parameterization and Manifold Projection 9
- 4.3 Efficient Infrastructure Design 9
- 4.3.1 Kernel Fusion 9
- 4.3.2 Recomputing 10
- 4.3.3 Overlapping Communication in DualPipe 11
- 5 Experiments 12
- 5.1 Experimental Setup 12
- 5.2 Main Results 12
- 5.3 Scaling Experiments 13
- 5.4 Stability Analysis 14
- 6 Conclusion and Outlook 15
- A Appendix 19
- A.1 Detailed Model Specifications and Hyper-parameters. 19

<!-- page 3 of 19 -->

## 1. Introduction

Deep neural network architectures have undergone rapid evolution since the introduction of ResNets (He et al., 2016a). As illustrated in Fig. 1(a), the structure of a single-layer can be formulated as follows:

自 ResNet (He et al., 2016a) 提出以来, 深度神经网络的结构演进很快. 如图 1(a), 单层结构可以写成:

$$
\mathbf {x} _ {l + 1} = \mathbf {x} _ {l} + \mathcal {F} (\mathbf {x} _ {l}, \mathcal {W} _ {l}),\tag{1}
$$

where $\mathbf { x } _ { l }$ and $\mathbf { x } _ { l + 1 }$ denote the 𝐶-dimensional input and output of the 𝑙-th layer, respectively, and $\mathcal { F }$ represents the residual function. Although the residual function $\mathcal { F }$ has evolved over the past decade to include various operations such as convolution, attention mechanisms, and feed forward networks, the paradigm of the residual connection has maintained its original form. Accompanying the progression of Transformer (Vaswani et al., 2017) architecture, this paradigm has currently established itself as a fundamental design element in large language models (LLMs) (Brown et al., 2020; Liu et al., 2024b; Touvron et al., 2023).

其中 $\mathbf{x}_l$ 和 $\mathbf{x}_{l+1}$ 分别是第 $l$ 层的 $C$ 维输入与输出, $\mathcal{F}$ 是残差函数. 过去十年里, 残差函数 $\mathcal{F}$ 从卷积演变到注意力和前馈网络等各种操作, 残差连接这一范式却一直保持原样. 随着 Transformer (Vaswani et al., 2017) 的发展, 这一范式已经成为大语言模型 (LLM) 的基本设计元素 (Brown et al., 2020; Liu et al., 2024b; Touvron et al., 2023).

This success is primarily attributed to the concise form of the residual connection. More importantly, early research (He et al., 2016b) revealed that the identity mapping property of the residual connection maintains stability and efficiency during large-scale training. By recursively extending the residual connection across multiple layers, Eq. (1) yields:

这种成功主要归功于残差连接形式简洁. 更重要的是, 早期研究 (He et al., 2016b) 揭示了残差连接的恒等映射性质能在大规模训练中保持稳定和高效. 把式 (1) 沿多层递归展开, 得到:

$$
\mathbf {x} _ {L} = \mathbf {x} _ {l} + \sum_ {i = l} ^ {L - 1} \mathcal {F} (\mathbf {x} _ {i}, \mathcal {W} _ {i}),\tag{2}
$$

where 𝐿 and 𝑙 correspond to deeper and shallower layers, respectively. The term identity mapping refers to the component $\mathbf { x } _ { l }$ itself, which emphasizes the property that the signal from the shallower layer maps directly to the deeper layer without any modification.

其中 $L$ 和 $l$ 分别对应较深层和较浅层. 恒等映射指的就是 $\mathbf{x}_l$ 这一项本身, 强调浅层信号不经任何修改直接映射到深层.

Recently, studies exemplified by Hyper-Connections (HC) (Zhu et al., 2024) have introduced a new dimension to the residual connection and empirically demonstrated its performance potential. The single-layer architecture of HC is illustrated in Fig. 1(b). By expanding the width of the residual stream and enhancing connection complexity, HC significantly increases topological complexity without altering the computational overhead of individual units regarding FLOPs. Formally, single-layer propagation in HC is defined as:

最近, 以 Hyper-Connections (HC) (Zhu et al., 2024) 为代表的工作给残差连接引入了一个新维度, 并在实验上展示了它的性能潜力. HC 的单层结构见图 1(b). HC 加宽残差流, 加强连接复杂度, 在不改变单个计算单元 FLOPs 的前提下显著提高了拓扑复杂度. HC 的单层传播形式化为:

$$
\mathbf {x} _ {l + 1} = \mathcal {H} _ {l} ^ {\mathrm{res}} \mathbf {x} _ {l} + \mathcal {H} _ {l} ^ {\mathrm{post} \top} \mathcal {F} (\mathcal {H} _ {l} ^ {\mathrm{pre}} \mathbf {x} _ {l}, \mathcal {W} _ {l}),\tag{3}
$$

where $\mathbf { x } _ { l }$ and $\mathbf { x } _ { l + 1 }$ denote the input and output of the 𝑙-th layer, respectively. Unlike the formulation in Eq. (1), the feature dimension of $\mathbf { x } _ { l }$ and $\mathbf { x } _ { l + 1 }$ is expanded from $C$ to $n \times C ,$ where 𝑛 is the expansion rate. The term $\mathcal { H } _ { l } ^ { \mathrm { r e s } } \in \mathbb { R } ^ { n \times n }$ represents a learnable mapping that mixes features within the residual stream. Also as a learnable mapping, $\mathcal { H } _ { l } ^ { \mathrm { p r e } } \in \mathbb { R } ^ { 1 \times n }$ aggregates features from the 𝑛𝐶-dim stream into a 𝐶-dim layer input, and conversely, $\mathcal { H } _ { l } ^ { \mathrm { p o s t } } \in \mathbb { R } ^ { 1 \times n }$ maps the layer output back onto the stream.

其中 $\mathbf{x}_l$ 和 $\mathbf{x}_{l+1}$ 分别是第 $l$ 层的输入与输出. 与式 (1) 不同, $\mathbf{x}_l$ 和 $\mathbf{x}_{l+1}$ 的特征维度从 $C$ 扩成 $n\times C$, $n$ 是扩张率. $\mathcal{H}_l^{\mathrm{res}}\in\mathbb{R}^{n\times n}$ 是一个可学习映射, 在残差流内部混合特征. $\mathcal{H}_l^{\mathrm{pre}}\in\mathbb{R}^{1\times n}$ 同样可学习, 把 $nC$ 维的流聚合成 $C$ 维的层输入; 反过来, $\mathcal{H}_l^{\mathrm{post}}\in\mathbb{R}^{1\times n}$ 把层输出映射回流上.

However, as the training scale increases, HC introduces potential risks of instability. The primary concern is that the unconstrained nature of HC compromises the identity mapping property when the architecture extends across multiple layers. In architectures comprising multiple parallel streams, an ideal identity mapping serves as a conservation mechanism. It ensures that the average signal intensity across streams remains invariant during both forward and backward propagation. Recursively extending HC to multiple layers via Eq. (3) yields:

然而训练规模变大后, HC 带来了潜在的不稳定风险. 主要问题在于 HC 不加约束, 结构跨多层延伸时恒等映射性质被破坏. 在由多条并行流组成的结构里, 理想的恒等映射起守恒作用: 它保证前向和反向传播时各流的平均信号强度不变. 用式 (3) 把 HC 沿多层递归展开, 得到:

$$
\mathbf {x} _ {L} = \left(\prod_ {i = 1} ^ {L - l} \mathcal {H} _ {L - i} ^ {\mathrm{res}}\right) \mathbf {x} _ {l} + \sum_ {i = l} ^ {L - 1} \left(\prod_ {j = 1} ^ {L - 1 - i} \mathcal {H} _ {L - j} ^ {\mathrm{res}}\right) \mathcal {H} _ {i} ^ {\mathrm{post} \top} \mathcal {F} (\mathcal {H} _ {i} ^ {\mathrm{pre}} \mathbf {x} _ {i}, \mathcal {W} _ {i}),\tag{4}
$$

<!-- page 4 of 19 -->

where 𝐿 and 𝑙 represent a deeper layer and a shallower layer, respectively. In contrast to Eq. (2), the composite mapping $\textstyle \prod _ { i = 1 } ^ { L - l } \mathcal { H } _ { L - i } ^ { \mathrm { r e s } }$ in HC fails to preserve the global mean of the features. This discrepancy leads to unbounded signal amplification or attenuation, resulting in instability during large-scale training. A further consideration is that, while HC preserves computational efficiency in terms of FLOPs, the hardware efficiency concerning memory access costs for the widened residual stream remains unaddressed in the original design. These factors collectively restrict the practical scalability of HC and hinder its application in large-scale training.

其中 $L$ 和 $l$ 分别是较深层和较浅层. 与式 (2) 相比, HC 中的复合映射 $\prod_{i=1}^{L-l}\mathcal{H}_{L-i}^{\mathrm{res}}$ 不能保持特征的全局均值. 这一差别导致信号无界地放大或衰减, 在大规模训练中引发不稳定. 另一个问题是: HC 在 FLOPs 上保持了计算效率, 但原始设计没有处理加宽后的残差流在访存上的硬件效率. 这些因素合在一起, 限制了 HC 的实际可扩展性, 也妨碍它用于大规模训练.

> **核对:** 式 (4) 之后说复合映射「不能保持特征的全局均值」, 这里的均值守恒对应 $\mathcal{H}^{\mathrm{res}}$ 的哪个条件?
> 答: 把 $n$ 条流的均值写成 $\frac1n\mathbf{1}_n^\top\mathbf{x}$. 经过一层混合后是 $\frac1n\mathbf{1}_n^\top\mathcal{H}^{\mathrm{res}}\mathbf{x}$, 对任意 $\mathbf{x}$ 都等于原均值, 当且仅当 $\mathbf{1}_n^\top\mathcal{H}^{\mathrm{res}}=\mathbf{1}_n^\top$, 即列和为 1. 行和为 1 ($\mathcal{H}^{\mathrm{res}}\mathbf{1}_n=\mathbf{1}_n$) 管的是另一件事: 各流取同一个值时输出不变, 再加上非负就使每条输出流是输入流的凸组合. 式 (6) 同时要求两者, 列和对应均值守恒和反向增益, 行和对应前向增益, 第 3.1 节的 Amax Gain Magnitude 正是分别量这两组和.

To address these challenges, we propose **Manifold-Constrained Hyper-Connections** (**mHC**), as shown in Fig. 1(c), a general framework that projects the residual connection space of HC onto a specific manifold to restore the identity mapping property, while incorporating rigorous infrastructure optimization to ensure efficiency. Specifically, mHC utilizes the Sinkhorn-Knopp algorithm (Sinkhorn and Knopp, 1967) to entropically project $\mathcal { H } _ { l } ^ { \mathrm { r e s } }$ onto the Birkhoff polytope. This operation effectively constrains the residual connection matrices within the manifold that is constituted by doubly stochastic matrices. Since the row and column sums of these matrices equal to 1, the operation $\mathcal { H } _ { l } ^ { \mathrm { r e s } } \mathbf { x } _ { l }$ functions as a convex combination of the input features. This characteristic facilitates a well-conditioned signal propagation where the feature mean is conserved, and the signal norm is strictly regularized, effectively mitigating the risk of vanishing or exploding signals. Furthermore, due to the closure of matrix multiplication for doubly stochastic matrices, the composite mapping $\textstyle \prod _ { i = 1 } ^ { L - l } \mathcal { H } _ { L - i } ^ { \mathrm { r e s } }$ retains this conservation property. Consequently, mHC effectively maintains the stability of identity mappings between arbitrary depths. To ensure efficiency, we employ kernel fusion and develop mixed precision kernels utilizing TileLang (Wang et al., 2025). Furthermore, we mitigate the memory footprint through selective recomputing and carefully overlap communication within the DualPipe schedule (Liu et al., 2024b).

为应对这些问题, 我们提出 **流形约束超连接** (**mHC**), 见图 1(c). 它是一个通用框架, 把 HC 的残差连接空间投影到特定流形上以恢复恒等映射性质, 同时配上严格的基础设施优化保证效率. 具体地, mHC 用 Sinkhorn-Knopp 算法 (Sinkhorn and Knopp, 1967) 把 $\mathcal{H}_l^{\mathrm{res}}$ 熵投影到 Birkhoff 多面体上, 也就是把残差连接矩阵约束在由双随机矩阵构成的流形里. 这类矩阵的行和与列和都等于 1, 所以 $\mathcal{H}_l^{\mathrm{res}}\mathbf{x}_l$ 是输入特征的凸组合. 这一性质让信号传播条件良好: 特征均值守恒, 信号范数受到严格约束, 有效降低了信号消失或爆炸的风险. 此外, 双随机矩阵对矩阵乘法封闭, 复合映射 $\prod_{i=1}^{L-l}\mathcal{H}_{L-i}^{\mathrm{res}}$ 仍保有这种守恒性质. 因此 mHC 能在任意深度之间保持恒等映射的稳定. 效率方面, 我们做了内核融合, 并用 TileLang (Wang et al., 2025) 开发了混合精度内核; 另外通过选择性重计算降低显存占用, 并在 DualPipe 调度 (Liu et al., 2024b) 内仔细重叠通信.

Extensive experiments on language model pretraining demonstrate that mHC exhibits exceptional stability and scalability while maintaining the performance advantages of HC. Inhouse large-scale training indicates that mHC supports training at scale and introduces only a 6.7% additional time overhead when expansion rate $n = 4$

大量语言模型预训练实验表明, mHC 在保持 HC 性能优势的同时, 稳定性和可扩展性都很突出. 内部的大规模训练显示 mHC 能支撑规模化训练, 扩张率 $n=4$ 时只多出 6.7% 的时间开销.

## 2. Related Works · 相关工作

Architectural advancements in deep learning can be primarily classified into micro-design and macro-design. Micro-design concerns the internal architecture of computational blocks, specifying how features are processed across spatial, temporal, and channel dimensions. In contrast, macro-design establishes the inter-block topological structure, thereby dictating how feature representations are propagated, routed, and merged across distinct layers.

深度学习的结构进展大体可以分成微观设计和宏观设计两类. 微观设计关心计算块的内部结构, 规定特征在空间, 时间和通道维度上怎样处理. 宏观设计则确定块与块之间的拓扑结构, 决定特征表示怎样在不同层之间传播, 路由和合并.

## 2.1. Micro Design · 微观设计

Driven by parameter sharing and translation invariance, convolution initially dominated the processing of structured signals. While subsequent variations such as depthwise separable (Chollet, 2017) and grouped convolutions (Xie et al., 2017) optimized efficiency, the advent of Transformers (Vaswani et al., 2017) established Attention and Feed-Forward Networks (FFNs) as the fundamental building blocks of modern architecture. Attention mechanisms facilitate global information propagation, while FFNs enhance the representational capacity of individual features. To balance performance with the computational demands of LLMs, attention mechanisms have evolved towards efficient variants such as Multi-Query Attention (MQA) (Shazeer, 2019), Grouped-Query Attention (GQA) (Ainslie et al., 2023), and Multi-Head Latent Attention

<!-- page 5 of 19 -->

(MLA) (Liu et al., 2024a). Simultaneously, FFNs have been generalized into sparse computing paradigms via Mixture-of-Experts (MoE) (Fedus et al., 2022; Lepikhin et al., 2020; Shazeer et al., 2017), allowing for massive parameter scaling without proportional computational costs.

凭借参数共享和平移不变性, 卷积最早主导了结构化信号的处理. 之后的深度可分离卷积 (Chollet, 2017) 和分组卷积 (Xie et al., 2017) 等变体提升了效率, 而 Transformer (Vaswani et al., 2017) 的出现让注意力和前馈网络 (FFN) 成为现代结构的基本构件. 注意力负责全局的信息传播, FFN 增强单个特征的表示能力. 为了在性能与 LLM 的算力需求之间取得平衡, 注意力朝高效变体演进, 例如 Multi-Query Attention (MQA) (Shazeer, 2019), Grouped-Query Attention (GQA) (Ainslie et al., 2023) 和 Multi-Head Latent Attention (MLA) (Liu et al., 2024a). 与此同时, FFN 经由 MoE (Fedus et al., 2022; Lepikhin et al., 2020; Shazeer et al., 2017) 推广成稀疏计算范式, 参数可以大幅增加而计算成本不按比例增长.

## 2.2. Macro Design · 宏观设计

Macro-design governs the global topology of the network (Srivastava et al., 2015). Following ResNet (He et al., 2016a), architectures such as DenseNet (Huang et al., 2017) and Fractal-Net (Larsson et al., 2016) aimed to enhance performance by increasing topological complexity through dense connectivity and multi-path structures, respectively. Deep Layer Aggregation (DLA) (Yu et al., 2018) further extended this paradigm by recursively aggregating features across various depths and resolutions.

宏观设计决定网络的全局拓扑 (Srivastava et al., 2015). 在 ResNet (He et al., 2016a) 之后, DenseNet (Huang et al., 2017) 和 FractalNet (Larsson et al., 2016) 分别通过稠密连接和多路径结构提高拓扑复杂度来提升性能. Deep Layer Aggregation (DLA) (Yu et al., 2018) 进一步扩展了这一路线, 跨不同深度和分辨率递归地聚合特征.

More recently, the focus of macro-design has shifted toward expanding the width of the residual stream (Chai et al., 2020; Fang et al., 2023; Heddes et al., 2025; Mak and Flanigan, 2025; Menghani et al., 2025; Pagliardini et al., 2024; Xiao et al., 2025; Xie et al., 2023; Zhu et al., 2024). Hyper-Connections (HC) (Zhu et al., 2024) introduced learnable matrices to modulate connection strengths among features at varying depths, while the Residual Matrix Transformer (RMT) (Mak and Flanigan, 2025) replaced the standard residual stream with an outer-product memory matrix to facilitate feature storage. Similarly, MUDDFormer (Xiao et al., 2025) employs multiway dynamic dense connections to optimize cross-layer information flow. Despite their potential, these approaches compromise the inherent identity mapping property of the residual connection, thereby introducing instability and hindering scalability. Furthermore, they incur significant memory access overhead due to expanded feature widths. Building upon HC, the proposed mHC restricts the residual connection space onto a specific manifold to restore the identity mapping property, while also incorporating rigorous infrastructure optimizations to ensure efficiency. This approach enhances stability and scalability while maintaining the topological benefits of expanded connections.

近来宏观设计的重心转向加宽残差流 (Chai et al., 2020; Fang et al., 2023; Heddes et al., 2025; Mak and Flanigan, 2025; Menghani et al., 2025; Pagliardini et al., 2024; Xiao et al., 2025; Xie et al., 2023; Zhu et al., 2024). Hyper-Connections (HC) (Zhu et al., 2024) 引入可学习矩阵来调节不同深度特征之间的连接强度; Residual Matrix Transformer (RMT) (Mak and Flanigan, 2025) 把标准残差流换成外积记忆矩阵, 便于存储特征; MUDDFormer (Xiao et al., 2025) 用多路动态稠密连接优化跨层信息流. 这些方法虽有潜力, 却都破坏了残差连接固有的恒等映射性质, 带来不稳定并妨碍扩展; 而且特征宽度加大后, 访存开销也很显著. mHC 以 HC 为基础, 把残差连接空间限制到特定流形上以恢复恒等映射性质, 同时配上严格的基础设施优化保证效率. 这一做法在保留加宽连接的拓扑收益的同时, 提升了稳定性和可扩展性.

## 3. Preliminary · 预备知识

We first establish the notation used in this work. In the HC formulation, the input to the 𝑙-th layer, $\pmb { x } _ { l } \in \mathbb { R } ^ { 1 \times C }$ , is expanded by a factor of 𝑛 to construct a hidden matrix $\mathbf { x } _ { l } = ( \mathbf { x } _ { l , 0 } ^ { \top } , \dot { \cdots } , \mathbf { x } _ { l , n - 1 } ^ { \top } ) ^ { \top }$ ∈ R<sup>𝑛</sup>×𝐶 which can be viewed as 𝑛-stream residual. This operation effectively broadens the width of the residual stream. To govern the read-out, write-in, and updating processes of this stream, HC introduces three learnable linear mappings— $\mathcal { H } _ { l } ^ { \mathrm { p r e } } , \mathcal { H } _ { l } ^ { \mathrm { p o s } \bar { \mathsf { t } } } \in \mathbb { R } ^ { 1 \times n }$ , and $\mathcal { H } _ { l } ^ { \mathrm { r e s } } \in \mathbb { R } ^ { n \times n }$ . These mappings modify the standard residual connection shown in Eq. (1), resulting in the formulation given in Eq. (3).

先约定记号. 在 HC 的写法里, 第 $l$ 层的输入 $\mathbf{x}_l\in\mathbb{R}^{1\times C}$ 被扩成 $n$ 倍, 构成隐藏矩阵 $\mathbf{x}_l=(\mathbf{x}_{l,0}^\top,\cdots,\mathbf{x}_{l,n-1}^\top)^\top\in\mathbb{R}^{n\times C}$, 可以看作 $n$ 条流的残差. 这一步加宽了残差流. 为了管理这条流的读出, 写入和更新, HC 引入三个可学习线性映射: $\mathcal{H}_l^{\mathrm{pre}},\mathcal{H}_l^{\mathrm{post}}\in\mathbb{R}^{1\times n}$ 和 $\mathcal{H}_l^{\mathrm{res}}\in\mathbb{R}^{n\times n}$. 它们改写了式 (1) 的标准残差连接, 得到式 (3).

In the HC formulation, learnable mappings are composed of two parts of coefficients: the input-dependent one and the global one, referred to as dynamic mappings and static mappings, respectively. Formally, HC computes the coefficients as follows:

HC 的可学习映射由两部分系数组成: 依赖输入的部分和全局共享的部分, 分别叫动态映射和静态映射. HC 按下式计算系数:

$$
\left\{ \begin{array}{l} \tilde {\mathbf {x}} _ {l} = \mathrm{RMSNorm} (\mathbf {x} _ {l}) \\ \mathcal {H} _ {l} ^ {\mathrm{pre}} = \alpha_ {l} ^ {\mathrm{pre}} \cdot \tanh (\theta_ {l} ^ {\mathrm{pre}} \tilde {\mathbf {x}} _ {l} ^ {\top}) + \mathbf {b} _ {l} ^ {\mathrm{pre}} \\ \mathcal {H} _ {l} ^ {\mathrm{post}} = \alpha_ {l} ^ {\mathrm{post}} \cdot \tanh (\theta_ {l} ^ {\mathrm{post}} \tilde {\mathbf {x}} _ {l} ^ {\top}) + \mathbf {b} _ {l} ^ {\mathrm{post}} \\ \mathcal {H} _ {l} ^ {\mathrm{res}} = \alpha_ {l} ^ {\mathrm{res}} \cdot \tanh (\theta_ {l} ^ {\mathrm{res}} \tilde {\mathbf {x}} _ {l} ^ {\top}) + \mathbf {b} _ {l} ^ {\mathrm{res}}, \end{array} \right.\tag{5}
$$

where RMSNorm(·) (Zhang and Sennrich, 2019) is applied to the last dimension, and the scalars $\alpha _ { l } ^ { \mathrm { p r e } } , \alpha _ { l } ^ { \mathrm { p o s t } }$ and $\alpha _ { l } ^ { \mathrm { r e s } }   \in   \mathbb { R }$ are learnable gating factors initialized to small values. The dynamic

<!-- page 6 of 19 -->

mappings are derived via linear projections parameterized by $\theta _ { l } ^ { \mathrm { p r e } } , \theta _ { l } ^ { \mathrm { p o s t } } \in \mathbb { R } ^ { 1 \times C }$ and $\theta _ { l } ^ { \mathrm { r e s } } \in \mathbb { R } ^ { n \times C } ,$ while the static mappings are represented by learnable biases $\mathbf { \widetilde { b } } _ { l } ^ { \mathrm { p r e } } , \mathbf { \widetilde { b } } _ { l } ^ { \mathrm { p o s t } } \in \mathbb { R } ^ { 1 \times n }$ and $\mathbf { b } _ { l } ^ { \mathrm { r e s } } \in \mathbb { R } ^ { n \times n }$

其中 RMSNorm(·) (Zhang and Sennrich, 2019) 作用在末维上, 标量 $\alpha_l^{\mathrm{pre}},\alpha_l^{\mathrm{post}},\alpha_l^{\mathrm{res}}\in\mathbb{R}$ 是可学习的门控因子, 初始化为小值. 动态映射由线性投影 $\theta_l^{\mathrm{pre}},\theta_l^{\mathrm{post}}\in\mathbb{R}^{1\times C}$ 和 $\theta_l^{\mathrm{res}}\in\mathbb{R}^{n\times C}$ 得到, 静态映射则是可学习偏置 $\mathbf{b}_l^{\mathrm{pre}},\mathbf{b}_l^{\mathrm{post}}\in\mathbb{R}^{1\times n}$ 和 $\mathbf{b}_l^{\mathrm{res}}\in\mathbb{R}^{n\times n}$.

It is worth noting that the introduction of these mappings— $\cdot \mathcal { H } _ { l } ^ { \mathrm { p r e } } , \mathcal { H } _ { l } ^ { \mathrm { p o s t } }$ , and $\mathcal { H } _ { l } ^ { \mathrm { r e s } }$ —incurs negligible computational overhead, as the typical expansion rate $n , \mathrm { e . g . } ~ 4 ,$ is much smaller than the input dimension 𝐶. With this design, HC effectively decouples the information capacity of the residual stream from the layer’s input dimension, which is strongly correlated with the model’s computational complexity (FLOPs). Consequently, HC offers a new avenue for scaling by adjusting the residual stream width, complementing the traditional scaling dimensions of model FLOPs and training data size discussed in pre-training scaling laws (Hoffmann et al., 2022).

引入 $\mathcal{H}_l^{\mathrm{pre}}$, $\mathcal{H}_l^{\mathrm{post}}$ 和 $\mathcal{H}_l^{\mathrm{res}}$ 这些映射, 计算开销可以忽略, 因为典型的扩张率 $n$ (例如 4) 远小于输入维度 $C$. 这样设计后, HC 把残差流的信息容量和层的输入维度解耦了, 而层的输入维度与模型的计算复杂度 (FLOPs) 强相关. 于是 HC 提供了一条新的扩展途径: 调整残差流宽度. 它补充了预训练 Scaling Laws (Hoffmann et al., 2022) 中讨论的两个传统维度, 即模型 FLOPs 和训练数据量.

Although HC necessitates three mappings to manage the dimensional mismatch between the residual stream and the layer input, preliminary experiments presented in Tab. 1 indicate that the residual mapping $\mathcal { H } _ { l } ^ { \mathrm { \acute { r e s } } }$ yields the most significant performance gain. This finding underscores the critical importance of effective information exchange within the residual stream.

HC 需要三个映射来处理残差流与层输入之间的维度不匹配, 但表 1 的初步实验表明, 残差映射 $\mathcal{H}_l^{\mathrm{res}}$ 带来的性能收益最大. 这说明残差流内部的有效信息交换十分关键.

| H<sub>𝑙</sub><sup>res</sup> | H<sub>𝑙</sub><sup>pre</sup> | H<sub>𝑙</sub><sup>post</sup> | Absolute Loss Gap |
| --- | --- | --- | --- |
| ✓ |  |  | 0.0- 0.022 |
| ✓ | ✓ |  | - 0.025 |
| ✓ | ✓ | ✓ | - 0.027 |

## 3.1. Numerical Instability · 数值不稳定

While the residual mapping $\mathcal { H } _ { l } ^ { \mathrm { r e s } }$ is instrumental for performance, its sequential application poses a significant risk to numerical stability. As detailed in Eq. (4), when HC is extended across multiple layers, the effective signal propagation from layer 𝑙 to 𝐿 is governed by the composite mapping $\textstyle \prod _ { i = 1 } ^ { L - l } \mathcal { H } _ { L - i } ^ { \mathrm { r e s } }$ . Since the learnable mapping $\mathcal { H } _ { l } ^ { \mathrm { r e s } }$ is unconstrained, this composite mapping inevitably deviates from the identity mapping. Consequently, the signal magnitude is prone to explosion or vanishing during both the forward pass and backpropagation. This phenomenon undermines the fundamental premise of residual learning, which relies on unimpeded signal flow, thereby destabilizing the training process in deeper or larger-scale models.

残差映射 $\mathcal{H}_l^{\mathrm{res}}$ 对性能很关键, 但它被逐层连续施加, 给数值稳定带来很大风险. 如式 (4) 所示, HC 跨多层延伸后, 从第 $l$ 层到第 $L$ 层的有效信号传播由复合映射 $\prod_{i=1}^{L-l}\mathcal{H}_{L-i}^{\mathrm{res}}$ 决定. 由于可学习映射 $\mathcal{H}_l^{\mathrm{res}}$ 没有约束, 这个复合映射必然偏离恒等映射, 信号幅值在前向和反向传播中都容易爆炸或消失. 这破坏了残差学习依赖信号畅通流动的基本前提, 让更深或更大的模型训练失稳.

Empirical evidence supports this analysis. We observe unstable loss behavior in large-scale experiments, as illustrated in Fig. 2. Taking mHC as the baseline, HC exhibits an unexpected loss surge around the 12k step, which is highly correlated with the instability in the gradient norm. Furthermore, the analysis on $\mathcal { H } _ { l } ^ { \mathrm { r e s } }$ validates the mechanism of this instability. To quantify how the composite mapping $\textstyle \prod _ { i = 1 } ^ { L - l } \mathcal { H } _ { L - i } ^ { \dot { \mathrm { r e s } } }$ amplifies signals along the residual stream, we utilize two metrics. The first, based on the maximum absolute value of the row sums of the composite mapping, captures the worst-case expansion in the forward pass. The second, based on the maximum absolute column sum, corresponds to the backward pass. We refer to these metrics as the Amax Gain Magnitude of the composite mapping. As shown in Fig. 3 (b), the Amax Gain Magnitude yields extreme values with peaks of 3000, a stark divergence from 1 that confirms the presence of exploding residual streams.

实验证据支持这一分析. 我们在大规模实验中观察到 loss 行为不稳, 见图 2. 以 mHC 为参照, HC 在约 12k step 处出现意外的 loss 上冲, 并与梯度范数的不稳高度相关. 对 $\mathcal{H}_l^{\mathrm{res}}$ 的分析进一步印证了这种不稳的机制. 为量化复合映射 $\prod_{i=1}^{L-l}\mathcal{H}_{L-i}^{\mathrm{res}}$ 沿残差流放大信号的程度, 我们用两个指标: 第一个基于复合映射行和的最大绝对值, 刻画前向传播的最坏放大; 第二个基于最大绝对列和, 对应反向传播. 两者合称复合映射的 Amax Gain Magnitude (最大增益幅值). 如图 3(b), 这一指标出现峰值约 3000 的极端值, 与 1 相差悬殊, 证实残差流确实在爆炸.

<!-- page 7 of 19 -->

![Image block](./images/p07-a-absolute-training-loss-gap-vs-training-steps.jpg)

(a) Absolute Training Loss Gap vs: Training Steps

![Image block](./images/p07-b-gradient-norm-vs-training-steps.jpg)

(b) Gradient Norm vs: Training Steps

![Image block](./images/p07-figure-2-training-instability-of-hyper-connections-hc-this.jpg)

Figure 2 | Training Instability of Hyper-Connections (HC). This figure illustrates (a) the absolute loss gap of HC relative to mHC, and (b) the comparisons of gradient norms. All results are based on 27B models.

(a) Single-Layer Mapping

![Image block](./images/p07-figure-3-propagation-instability-of-hyper-connections-hc-this.jpg)

(b) Composite Mapping

Figure 3 | Propagation Instability of Hyper-Connections (HC). This figure illustrates the propagation dynamics of (a) the single-layer mapping $\mathcal { H } _ { l } ^ { \mathrm { r e s } }$ and (b) the composite mapping $\textstyle \prod _ { i = 1 } ^ { L - l } \mathcal { H } _ { L - i } ^ { \mathrm { r e s } }$ within the 27B model. The layer index 𝑙 (x-axis) unrolls each standard Transformer block into two independent layers (Attention and FFN). The Amax Gain Magnitude (y-axis) is calculated as the maximum absolute row sum (for the forward signal) and column sum (for the backward gradient), averaged over all tokens in a selected sequence.

## 3.2. System Overhead · 系统开销

While the computational complexity of HC remains manageable due to the linearity of the additional mappings, the system-level overhead prevents a non-negligible challenge. Specifically, memory access (I/O) costs often constitute one of the primary bottlenecks in modern model architectures, which is widely referred to as the “memory wall” (Dao et al., 2022). This bottleneck is frequently overlooked in architectural design, yet it decisively impacts runtime efficiency.

额外映射都是线性的, 所以 HC 的计算复杂度可控, 但系统层面的开销是不可忽略的挑战. 访存 (I/O) 成本常常是现代模型结构的主要瓶颈之一, 也就是常说的「内存墙」(Dao et al., 2022). 结构设计时经常忽略这个瓶颈, 它却决定性地影响运行效率.

Focusing on the widely adopted pre-norm Transformer (Vaswani et al., 2017) architecture, we analyze the I/O patterns inherent to HC. Tab. 2 summarizes the per token memory access overhead in a single residual layer introduced by the 𝑛-stream residual design. The analysis reveals that HC increases the memory access cost by a factor approximately proportional to 𝑛. This excessive I/O demand significantly degrades training throughput without the mitigation of fused kernels. Besides, since $\tilde { \mathcal { H } } _ { l } ^ { \mathrm { p r e } } , \mathcal { H } _ { l } ^ { \mathrm { p \acute { o } s t } }$ , and $\mathcal { H } _ { l } ^ { \mathrm { r e s } }$ involve learnable parameters, their intermediate activations are required for backpropagation. This results in a substantial increase in the GPU memory footprint, often necessitating gradient checkpointing to maintain feasible memory usage. Furthermore, HC requires 𝑛-fold more communication cost in pipeline parallelism (Qi et al., 2024), leading to larger bubbles and decreasing the training throughput.

以广泛采用的 Pre-Norm Transformer (Vaswani et al., 2017) 为对象, 我们分析 HC 固有的 I/O 模式. 表 2 汇总了 $n$ 流残差设计在单个残差层中带来的每 token 访存开销. 分析显示 HC 让访存成本增加了大约与 $n$ 成正比的倍数. 没有融合内核缓解时, 这么大的 I/O 需求会显著拖低训练吞吐. 此外, $\mathcal{H}_l^{\mathrm{pre}}$, $\mathcal{H}_l^{\mathrm{post}}$ 和 $\mathcal{H}_l^{\mathrm{res}}$ 含可学习参数, 反向传播需要它们的中间激活, 这让 GPU 显存占用大幅增加, 往往需要梯度检查点才能把显存控制在可行范围. 再者, 在流水线并行 (Qi et al., 2024) 中 HC 的通信成本是 $n$ 倍, 气泡更大, 训练吞吐下降.

<!-- page 8 of 19 -->

<table><tr><td>Method</td><td>Operation</td><td>Read (Elements)</td><td>Write (Elements)</td></tr><tr><td rowspan="2">Residual Connection</td><td>Residual Merge</td><td>2C</td><td>C</td></tr><tr><td>Total I/O</td><td>2C</td><td>C</td></tr><tr><td rowspan="6">Hyper-Connections</td><td>Calculate  $\mathcal{H}_{l}^{\text{pre}}, \mathcal{H}_{l}^{\text{post}}, \mathcal{H}_{l}^{\text{res}}$ </td><td>nC</td><td> $n^{2} + 2n$ </td></tr><tr><td> $\mathcal{H}_{l}^{\text{pre}}$ </td><td> $nC + n$ </td><td>C</td></tr><tr><td> $\mathcal{H}_{l}^{\text{post}}$ </td><td> $C + n$ </td><td>nC</td></tr><tr><td> $\mathcal{H}_{l}^{\text{res}}$ </td><td> $nC + n^{2}$ </td><td>nC</td></tr><tr><td>Residual Merge</td><td>2nC</td><td>nC</td></tr><tr><td>Total I/O</td><td> $(5n + 1)C + n^{2} + 2n$ </td><td> $(3n + 1)C + n^{2} + 2n$ </td></tr></table>

> **拆开:** 表 2 的两个合计怎么来的, $n=4$ 时比普通残差多多少?
> 答: 读列逐行相加: 算系数读 $nC$, 应用 pre 读 $nC+n$, 应用 post 读 $C+n$, 应用 res 读 $nC+n^2$, 残差合并读 $2nC$, 合计 $(5n+1)C+n^2+2n$. 写列: 系数 $n^2+2n$, pre 输出 $C$, post 输出 $nC$, res 输出 $nC$, 合并输出 $nC$, 合计 $(3n+1)C+n^2+2n$. 两列都与表一致. $n=4$ 时读 $21C+24$, 写 $13C+24$, 读写合计约 $34C$; 普通残差只有读 $2C$ 写 $C$, 合计 $3C$, 相差 11 倍多. 这张表只算残差这一侧, $\mathcal{F}$ 内部 (注意力, FFN) 的访存不在内. 第 4.3.1 节把 post, res 与合并融成一个核后, 这三步的读从 $(3n+1)C$ 降到 $(n+1)C$, 写从 $3nC$ 降到 $nC$, 正是把中间结果不落 HBM 的结果.

## 4. Method · 方法

## 4.1. Manifold-Constrained Hyper-Connections · 流形约束超连接

Drawing inspiration from the identity mapping principle (He et al., 2016b), the core premise of mHC is to constrain the residual mapping $\mathcal { H } _ { l } ^ { \mathrm { r e s } }$ onto a specific manifold. While the original identity mapping ensures stability by enforcing $\dot { \mathcal { H } } _ { l } ^ { \mathrm { r e s } } = \mathbf { I } ,$ it fundamentally precludes information exchange within the residual stream, which is critical for maximizing the potential of multi-stream architectures. Therefore, we propose projecting the residual mapping onto a manifold that simultaneously maintains the stability of signal propagation across layers and facilitates mutual interaction among residual streams to preserve the model’s expressivity. To this end, we restrict $\mathcal { H } _ { l } ^ { \mathrm { r e s } }$ to be a doubly stochastic matrix, which has non-negative entries where both the rows and columns sum to 1. Formally, let $\mathcal { M } ^ { \mathrm { r e s } }$ denote the manifold of doubly stochastic matrices (also known as the Birkhoff polytope). We constrain $\mathcal { H } _ { l } ^ { \mathrm { r e s } }$ to $\mathcal { P } _ { \mathcal { M } ^ { \mathrm { r e s } } } ( \mathcal { H } _ { l } ^ { \mathrm { r e s } } )$ , defined as:

受恒等映射原理 (He et al., 2016b) 启发, mHC 把残差映射 $\mathcal{H}_l^{\mathrm{res}}$ 约束到特定流形上. 原始恒等映射强制 $\mathcal{H}_l^{\mathrm{res}}=\mathbf{I}$ 来保证稳定, 同时也排除了残差流之间的信息交换, 限制多流结构的表达能力. 因此我们把残差映射投影到一个既保持跨层信号稳定、又允许残差流相互作用的流形. 具体地, $\mathcal{H}_l^{\mathrm{res}}$ 被限制为双随机矩阵, 即元素非负且每行、每列之和均为 1. 形式上, 记 $\mathcal{M}^{\mathrm{res}}$ 为双随机矩阵构成的流形 (又称 Birkhoff 多面体), 把 $\mathcal{H}_l^{\mathrm{res}}$ 约束为 $\mathcal{P}_{\mathcal{M}^{\mathrm{res}}}(\mathcal{H}_l^{\mathrm{res}})$, 定义为:

$$
\mathcal {P} _ {\mathcal {M} ^ {\mathrm{res}}} (\mathcal {H} _ {l} ^ {\mathrm{res}}) := \left\{\mathcal {H} _ {l} ^ {\mathrm{res}} \in \mathbb {R} ^ {n \times n} \mid \mathcal {H} _ {l} ^ {\mathrm{res}} \mathbf {1} _ {n} = \mathbf {1} _ {n}, \mathbf {1} _ {n} ^ {\top} \mathcal {H} _ {l} ^ {\mathrm{res}} = \mathbf {1} _ {n} ^ {\top}, \mathcal {H} _ {l} ^ {\mathrm{res}} \geqslant 0 \right\},\tag{6}
$$

where $\mathbf { 1 } _ { n }$ represents the 𝑛-dimensional vector of all ones.

其中 $\mathbf{1}_n$ 是 $n$ 维全 1 向量.

It is worth noting that when $n = 1$ , the doubly stochastic condition degenerates to the scalar 1, thereby recovering the original identity mapping. The choice of double stochasticity confers several rigorous theoretical properties beneficial for large-scale model training:

$n=1$ 时双随机条件退化成标量 1, 恢复原始的恒等映射. 选择双随机约束带来几条对大规模训练有利的严格理论性质:

1. **Norm Preservation:** The spectral norm of a doubly stochastic matrix is bounded by 1 $( \mathrm { i . e . , } ~ \| \mathcal { H } _ { l } ^ { \mathrm { r e s } } \| _ { 2 } \leq 1 )$ . This implies that the learnable mapping is non-expansive, effectively mitigating the gradient explosion problem.

1. **范数保持:** 双随机矩阵的谱范数以 1 为上界 (即 $\|\mathcal{H}_l^{\mathrm{res}}\|_2\le1$). 这意味着这个可学习映射不扩张, 能有效缓解梯度爆炸.

2. **Compositional Closure:** The set of doubly stochastic matrices is closed under matrix multiplication. This ensures that the composite residual mapping across multiple layers, $\begin{array} { r } { \prod _ { i = 1 } ^ { L - l } \hat { \mathcal { H } } _ { L - i } ^ { \mathrm { r e s } } , } \end{array}$ remains doubly stochastic, thereby preserving stability throughout the entire depth of the model.

2. **复合封闭:** 双随机矩阵集合对矩阵乘法封闭. 这保证跨多层的复合残差映射 $\prod_{i=1}^{L-l}\mathcal{H}_{L-i}^{\mathrm{res}}$ 仍是双随机的, 从而在模型的整个深度上保持稳定.

3. **Geometric Interpretation via the Birkhoff Polytope:** The set $\mathcal { M } ^ { \mathrm { r e s } }$ forms the Birkhoff polytope, which is the convex hull of the set of permutation matrices. This provides a clear geometric interpretation: the residual mapping acts as a convex combination of permutations. Mathematically, the repeated application of such matrices tends to increase

<!-- page 9 of 19 -->

the mixing of information across streams monotonically, effectively functioning as a robust feature fusion mechanism.

3. **Birkhoff 多面体的几何解释:** 集合 $\mathcal{M}^{\mathrm{res}}$ 构成 Birkhoff 多面体, 即全体置换矩阵的凸包. 由此有一个清楚的几何解释: 残差映射是若干置换的凸组合. 从数学上看, 反复施加这类矩阵会让各流之间的信息混合单调增加, 起到稳健的特征融合作用.

> **问:** 第 1 条说谱范数不超过 1, 第 3 条说反复施加会让混合单调增加, 这两条合起来对深层的复合映射意味着什么?
> 答: 谱范数的界可以由 $\|\mathcal{H}\|_2\le\sqrt{\|\mathcal{H}\|_1\|\mathcal{H}\|_\infty}$ 得到, 双随机矩阵的最大列和与最大行和都是 1. 又因 $\mathcal{H}\mathbf{1}_n=\mathbf{1}_n$, 全 1 方向的增益恰好为 1, 所以谱范数等于 1, 其余方向的增益不超过 1. 连乘下去, 全 1 方向 (各流取平均) 保持不变, 与之正交的「流间差异」方向只会被压缩或保持. 若各层矩阵都有一定混合 (不是置换阵), 复合矩阵会趋向 $\frac1n\mathbf{1}\mathbf{1}^\top$, 即均匀平均. 图 8 第二行可以看到这一点: 60 层复合的 mHC 矩阵元素都在 0.21 到 0.29 之间, 接近 $1/4$. 所以浅层信号送到最深层时已经被平均到四条流上, 「混合单调增加」的另一面是浅层信号在流间的区分度随深度丢失. 论文把它写成特征融合的好处, 没有讨论这一代价.

Additionally, we impose non-negativity constraints on the input mappings $\mathcal { H } _ { l } ^ { \mathrm { p r e } }$ and output mappings $\mathcal { H } _ { l } ^ { \mathrm { p o s t } }$ . This constrain prevents signal cancellation arising from the composition of positive and negative coefficients, which can also be considered as a special manifold projection.

此外, 我们对输入映射 $\mathcal{H}_l^{\mathrm{pre}}$ 和输出映射 $\mathcal{H}_l^{\mathrm{post}}$ 加非负约束. 这一约束防止正负系数组合造成信号相互抵消, 也可以看作一种特殊的流形投影.

## 4.2. Parameterization and Manifold Projection · 参数化与流形投影

In this section, we detail the calculation process of $\mathcal { H } _ { l } ^ { \mathrm { p r e } } , \mathcal { H } _ { l } ^ { \mathrm { p o s t } }$ , and $\mathcal { H } _ { l } ^ { \mathrm { r e s } }$ in mHC. Given the input hidden matrix $\pmb { x } _ { l } \in \mathbb { R } ^ { n \times C }$ at the 𝑙-th layer, we first flatten it into a vector $\vec { \mathbf { x } } _ { l } = \mathbf { v e c } ( \pmb { x } _ { l } ) \in \mathbb { R } ^ { 1 \times n C }$ to preserve full context information. Then, we follow the original HC formulation to get the dynamic mappings and the static mappings as follows:

本节详细说明 mHC 中 $\mathcal{H}_l^{\mathrm{pre}}$, $\mathcal{H}_l^{\mathrm{post}}$ 和 $\mathcal{H}_l^{\mathrm{res}}$ 的计算过程. 给定第 $l$ 层的输入隐藏矩阵 $\mathbf{x}_l\in\mathbb{R}^{n\times C}$, 先把它展平成向量 $\vec{\mathbf{x}}_l=\mathrm{vec}(\mathbf{x}_l)\in\mathbb{R}^{1\times nC}$, 以保留完整的上下文信息. 然后沿用原始 HC 的写法得到动态映射和静态映射:

$$
\left\{ \begin{array}{l} \vec {\mathbf {x}} _ {l} ^ {\prime} = \mathrm{RMSNorm} (\vec {\mathbf {x}} _ {l}) \\ \tilde {\mathcal {H}} _ {l} ^ {\mathrm{pre}} = \alpha_ {l} ^ {\mathrm{pre}} \cdot (\vec {\mathbf {x}} _ {l} ^ {\prime} \varphi_ {l} ^ {\mathrm{pre}}) + \mathbf {b} _ {l} ^ {\mathrm{pre}} \\ \tilde {\mathcal {H}} _ {l} ^ {\mathrm{post}} = \alpha_ {l} ^ {\mathrm{post}} \cdot (\vec {\mathbf {x}} _ {l} ^ {\prime} \varphi_ {l} ^ {\mathrm{post}}) + \mathbf {b} _ {l} ^ {\mathrm{post}} \\ \tilde {\mathcal {H}} _ {l} ^ {\mathrm{res}} = \alpha_ {l} ^ {\mathrm{res}} \cdot \mathrm{mat} (\vec {\mathbf {x}} _ {l} ^ {\prime} \varphi_ {l} ^ {\mathrm{res}}) + \mathbf {b} _ {l} ^ {\mathrm{res}}, \end{array} \right.\tag{7}
$$

where $\varphi _ { l } ^ { \mathrm { p r e } } , \varphi _ { l } ^ { \mathrm { p o s t } } \in \mathbb { R } ^ { n C \times n }$ and $\varphi _ { l } ^ { \mathrm { r e s } } \in \mathbb { R } ^ { n C \times n ^ { 2 } }$ are linear projections for dynamic mappings and mat(·) is a reshape function from $\mathbb { R } ^ { 1 \times n ^ { 2 } }$ to $\mathbb { R } ^ { n \times n }$

其中 $\varphi_l^{\mathrm{pre}},\varphi_l^{\mathrm{post}}\in\mathbb{R}^{nC\times n}$ 和 $\varphi_l^{\mathrm{res}}\in\mathbb{R}^{nC\times n^2}$ 是动态映射的线性投影, $\mathrm{mat}(\cdot)$ 是把 $\mathbb{R}^{1\times n^2}$ 变形为 $\mathbb{R}^{n\times n}$ 的 reshape 函数.

Then, the final constrained mappings are obtained via:

然后通过下式得到最终的约束映射:

$$
\left\{ \begin{array}{l} \mathcal {H} _ {l} ^ {\mathrm{pre}} = \sigma (\tilde {\mathcal {H}} _ {l} ^ {\mathrm{pre}}) \\ \mathcal {H} _ {l} ^ {\mathrm{post}} = 2 \sigma (\tilde {\mathcal {H}} _ {l} ^ {\mathrm{post}}) \\ \mathcal {H} _ {l} ^ {\mathrm{res}} = \text {Sinkhorn - Knopp} (\tilde {\mathcal {H}} _ {l} ^ {\mathrm{res}}), \end{array} \right.\tag{8}
$$

where $\sigma ( \cdot )$ denotes the Sigmoid function. The Sinkhorn-Knopp(·) operator firstly makes all elements to be positive via an exponent operator and then conducts iterative normalization process that alternately rescales rows and columns to sum to 1. Specifically, given a positive matrix $\mathbf { M } ^ { ( 0 ) } = \exp ( \tilde { \mathcal { H } } _ { l } ^ { \vec { \mathrm { r e s } } } )$ as the start point, the normalization iteration proceeds as:

其中 $\sigma(\cdot)$ 是 Sigmoid 函数. Sinkhorn-Knopp(·) 算子先用指数运算让所有元素为正, 再交替缩放行和列, 迭代归一使行和列和为 1. 具体地, 以正矩阵 $\mathbf{M}^{(0)}=\exp(\tilde{\mathcal{H}}_l^{\mathrm{res}})$ 为起点, 归一化迭代为:

$$
\left| \mathbf {M} ^ {(t)} = \mathcal {T} _ {r} \left(\mathcal {T} _ {c} (\mathbf {M} ^ {(t - 1)})\right), \right.\tag{9}
$$

where $\mathcal { T }$ and $\mathcal { T } _ { c }$ denote row and column normalization, respectively. This process converges to a doubly stochastic matrix $\mathcal { H } _ { l } ^ { \mathrm { r e s } } = \mathbf { M } ^ { ( t _ { \mathrm { m a x } } ) } \mathrm { a s } t _ { \mathrm { m a x } } \rightarrow \infty$ . We choose $t _ { \mathrm { m a x } } = 2 0$ as a practical value in our experiments.

其中 $\mathcal{T}_r$ 和 $\mathcal{T}_c$ 分别是行归一化和列归一化. $t_{\max}\to\infty$ 时这一过程收敛到双随机矩阵 $\mathcal{H}_l^{\mathrm{res}}=\mathbf{M}^{(t_{\max})}$. 实验中我们取 $t_{\max}=20$ 作为实用值.

## 4.3. Efficient Infrastructure Design · 高效基础设施设计

In this section, we detail the infrastructure design tailored for mHC. Through rigorous optimization, we implement mHC (with 𝑛 = 4) in large-scale models with a marginal training overhead of only 6.7%.

本节详细说明为 mHC 定制的基础设施设计. 经过严格优化, 我们在大规模模型中实现了 $n=4$ 的 mHC, 训练开销只多 6.7%.

## 4.3.1. Kernel Fusion · 内核融合

Observing that RMSNorm in mHC imposes significant latency when operating on the highdimensional hidden state $\vec { \pmb x } _ { l } \in \mathbb { R } ^ { 1 \times n C }$ , we reorder the dividing-by-norm operation to follow the

<!-- page 10 of 19 -->

matrix multiplication. This optimization maintains mathematical equivalence while improving efficiency. Furthermore, we employ mixed-precision strategies to maximize numerical accuracy without compromising speed, and fuse multiple operations with shared memory access into unified compute kernels to reduce memory bandwidth bottlenecks. Based on the inputs and parameters detailed in Eq. (10) to (13), we implement three specialized mHC kernels to compute $\bar { \mathcal { H } } _ { l } ^ { \mathrm { p r e } } , \mathcal { H } _ { l } ^ { \mathrm { p o s t } }$ , and $\mathcal { H } _ { l } ^ { \mathrm { r e s } }$ . In these kernels, the biases and linear projections are consolidated into $\mathbf { b } _ { l }$ and $\varphi _ { l } ,$ and the RMSNorm weight is also absorbed in $\varphi _ { l }$

我们观察到 mHC 中的 RMSNorm 作用在高维隐状态 $\vec{\mathbf{x}}_l\in\mathbb{R}^{1\times nC}$ 上时延迟明显, 于是把「除以范数」这一步挪到矩阵乘之后. 这一优化保持数学等价, 同时提高效率. 此外, 我们用混合精度策略在不损失速度的前提下尽量提高数值精度, 并把共享访存的多个操作融合进统一的计算内核, 缓解显存带宽瓶颈. 基于式 (10) 到 (13) 给出的输入和参数, 我们实现了三个专用 mHC 内核来计算 $\mathcal{H}_l^{\mathrm{pre}}$, $\mathcal{H}_l^{\mathrm{post}}$ 和 $\mathcal{H}_l^{\mathrm{res}}$. 在这些内核里, 偏置和线性投影分别合并成 $\mathbf{b}_l$ 和 $\varphi_l$, RMSNorm 的权重也吸收进 $\varphi_l$.

Eq. (14) to (15): We develop a unified kernel that fuses two scans on $\vec { \bf x } _ { l , }$ leveraging matrix multiplication units to maximize memory bandwidth utilization. The backward pass—comprising two matrix multiplications—is similarly consolidated into a single kernel, eliminating redundant reloading of $\vec { \bf x } _ { l }$ . Both kernels feature a finely tuned pipeline (load, cast, compute, store) to efficiently handle mixed-precision processing.

式 (14) 到 (15): 我们开发了一个统一内核, 把对 $\vec{\mathbf{x}}_l$ 的两次扫描融合在一起, 借助矩阵乘单元把显存带宽利用率拉满. 反向传播包含两次矩阵乘, 同样合进一个内核, 免去重复加载 $\vec{\mathbf{x}}_l$. 两个内核都有精细调过的流水 (加载, 类型转换, 计算, 写回), 高效处理混合精度.

• Eq. (16) to (18): These lightweight operations on small coefficients are opportunistically fused into a single kernel, significantly reducing kernel launch overhead.

• 式 (16) 到 (18): 这些对小系数的轻量操作被顺势融合进一个内核, 显著降低内核启动开销.

• Eq. (19): We implement the Sinkhorn-Knopp iteration within a single kernel. For the backward pass, we derive a custom backward kernel that recomputes the intermediate results on-chip and traverses the entire iteration.

• 式 (19): Sinkhorn-Knopp 迭代在单个内核内完成. 反向传播用我们推导的自定义内核, 在片上重算中间结果并完整走一遍迭代.

$$
\varphi_ {l}: \text {tfloat32} \quad [ n C, n ^ {2} + 2 n ]\tag{10}
$$

$$
\vec {\mathbf {x}} _ {l}: \text {bfloat16} \quad [ 1, n C ]\tag{11}
$$

$$
\alpha_ {l} ^ {\text {pre}}, \alpha_ {l} ^ {\text {post}}, \alpha_ {l} ^ {\text {res}}: \text {float32} \quad \text {Scalars}\tag{12}
$$

$$
\mathbf {b} _ {l}: \text {float32} \quad [ 1, n ^ {2} + 2 n ]\tag{13}
$$

$$
\left[ \tilde {\mathcal {H}} _ {l} ^ {\text {pre}}, \tilde {\mathcal {H}} _ {l} ^ {\text {post}}, \tilde {\mathcal {H}} _ {l} ^ {\text {res}} \right]: \text {float32} \quad = \vec {\mathbf {x}} _ {l} \varphi_ {l}\tag{14}
$$

$$
r: \text {float32} \quad = \left\| \vec {\mathbf {x}} _ {l} \right\| _ {2} / \sqrt {n C}\tag{15}
$$

$$
\left[ \tilde {\mathcal {H}} _ {l} ^ {\mathrm{pre}}, \tilde {\mathcal {H}} _ {l} ^ {\mathrm{post}}, \tilde {\mathcal {H}} _ {l} ^ {\mathrm{res}} \right]: \text {float32} \quad = 1 / r \left[ \alpha_ {l} ^ {\mathrm{pre}} \tilde {\mathcal {H}} _ {l} ^ {\mathrm{pre}}, \alpha_ {l} ^ {\mathrm{post}} \tilde {\mathcal {H}} _ {l} ^ {\mathrm{post}}, \alpha_ {l} ^ {\mathrm{res}} \tilde {\mathcal {H}} _ {l} ^ {\mathrm{res}} \right] + \mathbf {b} _ {l}\tag{16}
$$

$$
\left| \mathcal {H} _ {l} ^ {\mathrm{pre}}: \text {float32} \right. \quad = \sigma \left(\tilde {\mathcal {H}} _ {l} ^ {\mathrm{pre}}\right)\tag{17}
$$

$$
\left| \begin{array}{l} \mathcal {H} _ {l} ^ {\text {post}}: \text {float32} \end{array} \right. = 2 \sigma \left(\tilde {\mathcal {H}} _ {l} ^ {\text {post}}\right)\tag{18}
$$

$$
\mathcal {H} _ {l} ^ {\text {res}}: \text {float32} \quad = \text {Sinkhorn - Knopp} \left(\tilde {\mathcal {H}} _ {l} ^ {\text {res}}\right)\tag{19}
$$

Using the coefficients derived from the aforementioned kernels, we introduce two additional kernels to apply these mappings: one for $\mathcal { F } _ { \mathrm { p r e } }   : =   \mathcal { H } _ { l } ^ { \mathrm { p r e } } \mathbf { x } _ { l }$ and another for $\mathcal { F } _ { \mathrm { p o s t , r e s } } : =$ $\mathcal { H } _ { l } ^ { \mathrm { r e s } } \mathbf { x } _ { l } + \mathcal { H } _ { l } ^ { \mathrm { p o s t }   \top } \mathcal { F } ( \cdot , \cdot )$ . Through fusing the application of $\mathcal { H } _ { l } ^ { \mathrm { p o s t } }$ and $\mathcal { H } _ { l } ^ { \mathrm { r e s } }$ with residual merging, we reduce the number of elements read from $( 3 n + 1 ) C$ to $( n + 1 ) C$ and the number of elements written from 3𝑛𝐶 to 𝑛𝐶 for this kernel. We efficiently implement the majority of kernels (excluding Eq. (14) to (15)) using TileLang (Wang et al., 2025). This framework streamlines the implementation of kernels with complex calculation process and allows us to fully utilize the memory bandwidth with minimal engineering effort.

用上述内核得到的系数, 我们再引入两个内核来施加这些映射: 一个算 $\mathcal{F}_{\mathrm{pre}}:=\mathcal{H}_l^{\mathrm{pre}}\mathbf{x}_l$, 另一个算 $\mathcal{F}_{\mathrm{post,res}}:=\mathcal{H}_l^{\mathrm{res}}\mathbf{x}_l+\mathcal{H}_l^{\mathrm{post}\top}\mathcal{F}(\cdot,\cdot)$. 把 $\mathcal{H}_l^{\mathrm{post}}$ 和 $\mathcal{H}_l^{\mathrm{res}}$ 的施加与残差合并融合后, 这个内核读的元素数从 $(3n+1)C$ 降到 $(n+1)C$, 写的元素数从 $3nC$ 降到 $nC$. 大部分内核 (式 (14) 到 (15) 除外) 用 TileLang (Wang et al., 2025) 高效实现. 这个框架简化了计算流程复杂的内核的实现, 让我们以很少的工程量就能用满显存带宽.

## 4.3.2. Recomputing · 重计算

The 𝑛-stream residual design introduces substantial memory overhead during training. To mitigate this, we discard the intermediate activations of the mHC kernels after the forward pass and recompute them on-the-fly in the backward pass, through re-executing the mHC kernels

<!-- page 11 of 19 -->

without the heavy layer function $\mathcal { F } .$ Consequently, for a block of $L _ { r }$ consecutive layers, we need only store the input $\mathbf { x } _ { l _ { 0 } }$ to the first layer. Excluding lightweight coefficients while accounting for the pre-norm with in $\mathcal { F }$ , Tab. 3 summarizes the intermediate activations preserved for the backward pass.

$n$ 流残差设计在训练时带来可观的显存开销. 为缓解这一点, 我们在前向结束后丢弃 mHC 内核的中间激活, 反向传播时重新执行 mHC 内核 (不执行沉重的层函数 $\mathcal{F}$) 即时算回来. 这样, 对连续 $L_r$ 层组成的一个块, 只需存第一层的输入 $\mathbf{x}_{l_0}$. 不计轻量的系数, 但计入 $\mathcal{F}$ 内部的 pre-norm, 表 3 汇总了为反向传播保留的中间激活.

<table><tr><td>Activations</td><td> $\mathbf{x}_{l_0}$ </td><td> $\mathcal{F}(\mathcal{H}_l^{\text{pre}}\mathbf{x}_l,\mathcal{W}_l)$ </td><td> $\mathbf{x}_l$ </td><td> $\mathcal{H}_l^{\text{pre}}\mathbf{x}_l$ </td><td>RMSNorm( $\mathcal{H}_l^{\text{pre}}\mathbf{x}_l$ )</td></tr><tr><td>Size (Elements)</td><td> $nC$ </td><td> $C$ </td><td> $nC$ </td><td> $C$ </td><td> $C$ </td></tr><tr><td>Stored Method</td><td>Every  $L_r$  layers</td><td>Every layer</td><td></td><td colspan="2">Transient inside  $L_r$  layers</td></tr></table>

Since mHC kernels recomputation is performed for blocks of $L _ { r }$ consecutive layers, given a total of 𝐿 layers, we must persistently store the first layer input $\mathbf { x } _ { l _ { 0 } }$ for all $[ \frac { L } { L _ { r } } ]$ blocks for the backward pass. In addition to this resident memory, the recomputation process introduces a transient memory overhead of $( n + 2 ) C \times L _ { r }$ elements for the active block, which determines the peak memory usage during backpropagation. Consequently, we determine the optimal block size $L _ { r } ^ { * }$ by minimizing the total memory footprint corresponded to $L _ { r }$ :

mHC 内核的重计算以连续 $L_r$ 层为一块进行. 总共 $L$ 层时, 必须为所有 $\lceil L/L_r\rceil$ 个块常驻保存首层输入 $\mathbf{x}_{l_0}$ 供反向使用. 除这部分常驻显存外, 重计算过程还为当前处理的块带来 $(n+2)C\times L_r$ 个元素的临时显存, 它决定了反向传播时的峰值显存. 因此我们通过最小化与 $L_r$ 对应的总显存来确定最优块大小 $L_r^*$:

$$
\left| L _ {r} ^ {*} = \arg \min _ {L _ {r}} \left[ n C \times \left\lceil \frac {L}{L _ {r}} \right\rceil + (n + 2) C \times L _ {r} \right] \approx \sqrt {\frac {n L}{n + 2}}. \right|\tag{20}
$$

Furthermore, pipeline parallelism in large-scale training imposes a constraint: recomputation blocks must not cross pipeline stage boundaries. Observing that the theoretical optimum $L _ { r } ^ { * }$ typically aligns with the number of layers per pipeline stage, we choose to synchronize the recomputation boundaries with the pipeline stages.

此外, 大规模训练中的流水线并行带来一个限制: 重计算块不能跨流水线阶段边界. 我们观察到理论最优值 $L_r^*$ 通常与每个流水阶段的层数相当, 所以选择让重计算边界与流水阶段对齐.

## 4.3.3. Overlapping Communication in DualPipe · 在 DualPipe 中重叠通信

In large-scale training, pipeline parallelism is the standard practice for mitigating parameter and gradient memory footprints. Specifically, we adopt the DualPipe schedule (Liu et al., 2024b), which effectively overlaps scale-out interconnected communication traffic, such as those in expert and pipeline parallelism. However, compared to the single-stream design, the proposed 𝑛-stream residual in mHC incurs substantial communication latency across pipeline stages. Furthermore, at stage boundaries, the recomputation of mHC kernels for all $L _ { r }$ layers introduces non-negligible computational overhead. To address these bottlenecks, we extend the DualPipe schedule (see Fig. 4) to facilitate improved overlapping of communication and computation at pipeline stage boundaries.

大规模训练中, 流水线并行是降低参数与梯度显存占用的标准做法. 我们采用 DualPipe 调度 (Liu et al., 2024b), 它能有效重叠跨节点互联的通信流量, 例如专家并行和流水线并行中的通信. 但与单流设计相比, mHC 的 $n$ 流残差让流水阶段之间的通信延迟大幅增加. 另外在阶段边界上, 对全部 $L_r$ 层重算 mHC 内核也带来不可忽略的计算开销. 为解决这些瓶颈, 我们扩展了 DualPipe 调度 (见图 4), 在流水阶段边界上更好地重叠通信与计算.

Notably, to prevent blocking the communication stream, we execute the $\mathcal { F } _ { \mathrm { p o s t , r e s } }$ kernels of MLP (i.e. FFN) layers on a dedicated high-priority compute stream. We further refrain from employing persistent kernels for long-running operations in attention layers, thereby preventing extended stalls. This design enables the preemption of overlapped attention computations, allowing for flexible scheduling while maintaining high utilization of the compute device’s processing units. Furthermore, the recomputation process is decoupled from pipeline communication dependencies, as the initial activation of each stage $\mathbf { x } _ { l _ { 0 } }$ is already cached locally.

为了不阻塞通信流, 我们把 MLP (即 FFN) 层的 $\mathcal{F}_{\mathrm{post,res}}$ 内核放在一条专用的高优先级计算流上执行. 我们还避免在注意力层的长时间操作中使用 persistent kernel, 以免造成长时间停顿. 这一设计让被重叠的注意力计算可以被抢占, 调度更灵活, 同时保持计算设备处理单元的高利用率. 另外, 每个阶段的初始激活 $\mathbf{x}_{l_0}$ 已在本地缓存, 重计算过程因此与流水线通信的依赖解耦.

<!-- page 12 of 19 -->

![Image block](./images/p12-figure-4-communication-computation-overlapping-for-mhc-we-extend.jpg)

Figure 4 | Communication-Computation Overlapping for mHC. We extend the DualPipe schedule to handle the overhead introduced by mHC. Lengths of each block are illustrative only and do not represent actual duration. (F), (B), (W) refers to forward pass, backward pass, weight gradient computation, respectively. $\mathcal { F } ^ { \mathrm { A } }$ and $\mathcal { F } ^ { \mathrm { M } }$ represents kernels corresponded to Attention and MLP, respectively.

## 5. Experiments · 实验

## 5.1. Experimental Setup · 实验设置

We validate the proposed method via language model pre-training, conducting a comparative analysis between the baseline, HC, and our proposed mHC. Utilizing MoE architectures inspired by DeepSeek-V3 (Liu et al., 2024b), we train four distinct model variants to cover different evaluation regimes. Specifically, the expansion rate 𝑛 for both HC and mHC is set to 4. Our primary focus is a 27B model trained with a dataset size proportional to its parameters, which serves as the subject for our system-level main results. Expanding on this, we analyze the compute scaling behavior by incorporating smaller 3B and 9B models trained with proportional data, which allows us to observe performance trends across varying compute. Additionally, to specifically investigate the token scaling behavior, we train a separate 3B model on a fixed corpus of 1 trillion tokens. Detailed model configurations and training hyper-parameters are provided in Appendix A.1.

我们通过语言模型预训练验证所提方法, 对基线, HC 和 mHC 做对比分析. 采用受 DeepSeek-V3 (Liu et al., 2024b) 启发的 MoE 架构, 训练四个模型变体以覆盖不同的评估情形. HC 和 mHC 的扩展率 $n$ 都设为 4. 主要关注对象是一个 27B 模型, 训练数据量与参数量成比例, 作为系统级主结果的研究对象. 在此基础上, 加入同样按比例配数据训练的 3B 和 9B 小模型分析算力扩展行为, 观察不同算力下的性能趋势. 另外为专门考察 token 扩展行为, 我们在固定的 1T token 语料上单独训练一个 3B 模型. 模型配置和训练超参数详见附录 A.1.

## 5.2. Main Results · 主要结果

![Image block](./images/p12-a-absolute-training-loss-gap-vs-training-steps.jpg)

(a) Absolute Training Loss Gap vs: Training Steps

![Image block](./images/p12-figure-5-training-stability-of-manifold-constrained-hyper-connections.jpg)

(b) Gradient Norm vs: Training Steps

Figure 5 | Training Stability of Manifold-Constrained Hyper-Connections (mHC). This figure illustrates (a) the absolute training loss gap of mHC and HC relative to the baseline, and (b) the gradient norm of the three methods. All experiments utilize the 27B model. The results demonstrate that mHC exhibits improved stability in terms of both loss and gradient norm.

We begin by examining the training stability and convergence of the 27B models. As illustrated in Fig. 5 (a), mHC effectively mitigates the training instability observed in HC, achieving a final loss reduction of 0.021 compared to the baseline. This improved stability is further corroborated by the gradient norm analysis in Fig. 5 (b), where mHC exhibits significantly better behavior than HC, maintaining a stable profile comparable to the baseline.

我们先考察 27B 模型的训练稳定性与收敛. 如图 5(a) 所示, mHC 有效缓解了 HC 中出现的训练不稳定, 最终 loss 比基线低 0.021. 图 5(b) 的梯度范数分析进一步印证了稳定性的改善: mHC 的表现明显好于 HC, 保持了与基线相当的平稳曲线.

<!-- page 13 of 19 -->

| Benchmark | BBH | DROP | GSM8K | HellaSwag | MATH | MMLU | PIQA | TriviaQA |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| (Metric) | (EM) | (F1) | (EM) | (Acc.) | (EM) | (Acc.) | (Acc.) | (EM) |
| # Shots | 3-shot | 3-shot | 8-shot | 10-shot | 4-shot | 5-shot | 0-shot | 5-shot |
| 27B Baseline | 43.8 | 47.0 | 46.7 | 73.7 | 22.0 | 59.0 | 78.5 | 54.3 |
| 27B w/ HC | 48.9 | 51.6 | 53.2 | 74.3 | 26.4 | 63.0 | 79.9 | 56.3 |
| 27B w/ mHC | 51.0 | 53.9 | 53.8 | 74.7 | 26.0 | 63.4 | 80.5 | 57.6 |

Tab. 4 presents the downstream performance across a diverse set of benchmarks (Bisk et al., 2020; Cobbe et al., 2021; Hendrycks et al., 2020, 2021; Joshi et al., 2017; Zellers et al., 2019). mHC yields comprehensive improvements, consistently outperforming the baseline and surpassing HC on the majority of tasks. Notably, compared to HC, mHC further enhances the model’s reasoning capabilities, delivering performance gains of 2.1% on BBH (Suzgun et al., 2022) and 2.3% on DROP (Dua et al., 2019).

表 4 给出多种基准上的下游表现 (Bisk et al., 2020; Cobbe et al., 2021; Hendrycks et al., 2020, 2021; Joshi et al., 2017; Zellers et al., 2019). mHC 带来全面提升, 始终优于基线, 并在多数任务上超过 HC. 与 HC 相比, mHC 进一步增强了模型的推理能力, 在 BBH (Suzgun et al., 2022) 上提升 2.1%, 在 DROP (Dua et al., 2019) 上提升 2.3%.

## 5.3. Scaling Experiments · 扩展实验

![Image block](./images/p13-chart.jpg)

![Image block](./images/p13-a-compute-scaling-curve.jpg)

(a) Compute Scaling Curve

![Image block](./images/p13-chart-2.jpg)

![Image block](./images/p13-figure-6-scaling-properties-of-mhc-compared-to-the.jpg)

(b) Token Scaling Curve

Figure 6 | Scaling properties of mHC compared to the Baseline. (a) Compute Scaling Curve. Solid lines depict the performance gap across different compute budgets. Each point represents a specific compute-optimal configuration of model size and dataset size, scaling from 3B and 9B to 27B parameters. (b) Token Scaling Curve. Trajectory of the 3B model during training. Each point represents the model’s performance at different training tokens. Detailed architectures and training configurations are provided in Appendix A.1.

To assess the scalability of our approach, we report the relative loss improvement of mHC against the baseline across different scales. In Fig. 6 (a), we plot the compute scaling curve spanning 3B, 9B, and 27B parameters. The trajectory indicates that the performance advantage is robustly maintained even at higher computational budgets, showing only marginal attenuation. Furthermore, we examine the within-run dynamics in Fig. 6 (b), which presents the token scaling curve for the 3B model. Collectively, these findings validate the effectiveness of mHC in large-scale scenarios. This conclusion is further corroborated by our in-house large-scale training experiments.

为评估方法的可扩展性, 我们报告不同规模下 mHC 相对基线的 loss 相对改善. 图 6(a) 画出跨 3B, 9B, 27B 参数的算力扩展曲线. 曲线表明, 即使在更高的算力预算下性能优势也能稳健保持, 只有轻微衰减. 此外, 图 6(b) 给出 3B 模型的 token 扩展曲线, 用来考察单次训练内的动态. 这些结果共同验证了 mHC 在大规模场景下的有效性. 我们内部的大规模训练实验也进一步印证了这一结论.

<!-- page 14 of 19 -->

![Image block](./images/p14-a-single-layer-mapping.jpg)

(a) Single-Layer Mapping

![Image block](./images/p14-b-composite-mapping.jpg)

(b) Composite Mapping

![Image block](./images/p14-figure-7-propagation-stability-of-manifold-constrained-hyper-connections.jpg)

Figure 7 | Propagation Stability of Manifold-Constrained Hyper-Connections (mHC). This figure illustrates the propagation dynamics of (a) the single-layer mapping $\mathcal { P } _ { \mathcal { M } ^ { \mathrm { r e s } } } ( \mathcal { H } _ { l } ^ { \mathrm { r e s } } )$ and (b) the composite mapping $\begin{array} { r } { \prod _ { i = 1 } ^ { L - l } \mathcal { P } _ { \mathcal { M } ^ { \mathrm { r e s } } } ( \mathcal { H } _ { L - i } ^ { \mathrm { r e s } } ) } \end{array}$ within the 27B model. The results demonstrate that mHC significantly enhances propagation stability compared to HC.

Figure 8 | Visualizations of Learnable Mappings. This figure displays representative singlelayer and composite mappings for HC (first row) and mHC (second row). Each matrix is computed by averaging over all tokens within a selected sequence. The labels annotated along the y-axis and x-axis indicate the forward signal gain (row sum) and the backward gradient gain (column sum), respectively.

## 5.4. Stability Analysis · 稳定性分析

Similar to Fig. 3, Fig. 7 illustrates the propagation stability of mHC. Ideally, the single-layer mapping satisfies the doubly stochastic constraint, implying that both the forward signal gain and the backward gradient gain should equal to 1. However, practice implementations utilizing the Sinkhorn-Knopp algorithm must limit the number of iterations to achieve computational efficiency. In our settings, we use 20 iterations to obtain an approximate solution. Consequently, as shown in Fig. 7(a), the backward gradient gain deviates slightly from 1. In the composite case shown in Fig. 7(b), the deviation increases but remains bounded, reaching a maximum value of approximately 1.6. Notably, compared to the maximum gain magnitude of nearly 3000 in HC, mHC significantly reduces it by three orders of magnitude. These results demonstrate that mHC significantly enhances propagation stability compared to HC, ensuring stable forward signal and backward gradient flows. Additionally, Fig. 8 displays representative mappings. We observe that for HC, when the maximum gain is large, other values also tend to be significant, which indicates general instability across all propagation paths. In contrast, mHC consistently yields stable results.

与图 3 类似, 图 7 展示 mHC 的传播稳定性. 理想情况下单层映射满足双随机约束, 前向信号增益和反向梯度增益都应等于 1. 但用 Sinkhorn-Knopp 算法的实际实现必须限制迭代次数以保证计算效率. 我们的设置用 20 次迭代得到近似解. 因此如图 7(a) 所示, 反向梯度增益略微偏离 1. 在图 7(b) 的复合情形中偏离增大, 但仍有界, 最大约 1.6. 与 HC 接近 3000 的最大增益相比, mHC 把它降低了三个数量级. 这些结果表明 mHC 相比 HC 显著增强了传播稳定性, 保证前向信号和反向梯度平稳流动. 此外图 8 展示了有代表性的映射. 我们观察到, HC 在最大增益很大时其他数值往往也偏大, 说明所有传播路径普遍不稳定. 相比之下, mHC 始终给出稳定的结果.

> **停一下:** 为什么图 7(a) 只有反向增益偏离 1, 前向增益却是一条贴着 1 的直线?
> 答: 式 (9) 每轮先列归一再行归一, 迭代停在第 $t_{\max}$ 轮时, 收尾步骤是行归一, 所以行和精确为 1, 列和只是近似为 1. 按 §3.1 的定义, 前向增益取最大绝对行和, 反向增益取最大绝对列和, 于是前向恒为 1, 截断误差全部落在列和上, 表现为反向增益偏离. 官方 TileKernels 的 Sinkhorn 实现收尾步骤是对 comb 矩阵做列归一, 而 `mhc_post_ref` 的 einsum `'abmn,abmc->abnc'` 等价于用 comb 的转置去乘残差流, 两者合起来同样是 $\mathcal{H}^{\mathrm{res}}$ 的行和精确为 1. 两种写法结论一致. 另外, 代码默认迭代 10 轮 (`repeat=10`), 并在指数化前先做 softmax 再加 $10^{-6}$, 正文写的是 20 轮, 也没有提到 eps.

<!-- page 15 of 19 -->

## 6. Conclusion and Outlook

In this paper, we identify that while expanding the width of residual stream and diversifying connections yields performance gains as proposed in Hyper-Connections (HC), the unconstrained nature of these connections leads to signal divergence. This disruption compromises the conservation of signal energy across layers, inducing training instability and hindering the scalability of deep networks. To address these challenges, we introduce **Manifold-Constrained Hyper-Connections** (**mHC**), a generalized framework that projects the residual connection space onto a specific manifold. By employing the Sinkhorn-Knopp algorithm to enforce a doubly stochastic constraint on residual mappings, mHC transforms signal propagation into a convex combination of features. Empirical results confirm that mHC effectively restores the identity mapping property, enabling stable large-scale training with superior scalability compared to conventional HC. Crucially, through efficient infrastructure-level optimizations, mHC delivers these improvements with negligible computational overhead.

本文指出, 按 Hyper-Connections (HC) 的思路拓宽残差流, 让连接方式多样化, 确实带来性能提升, 但这些连接不受约束, 会导致信号发散. 这种破坏让信号能量无法跨层守恒, 引发训练不稳定, 阻碍深层网络扩展. 为此我们提出**流形约束超连接** (**mHC**), 一个把残差连接空间投影到特定流形上的通用框架. mHC 用 Sinkhorn-Knopp 算法对残差映射施加双随机约束, 把信号传播变成特征的凸组合. 实验结果证实 mHC 有效恢复了恒等映射性质, 实现稳定的大规模训练, 可扩展性优于常规 HC. 更关键的是, 借助高效的基础设施级优化, mHC 带来这些改进时的计算开销可以忽略.

As a generalized extension of the HC paradigm, mHC opens several promising avenues for future research. Although this work utilizes doubly stochastic matrices to ensure stability, the framework accommodates the exploration of diverse manifold constraints tailored to specific learning objectives. We anticipate that further investigation into distinct geometric constraints could yield novel methods that better optimize the trade-off between plasticity and stability. Furthermore, we hope mHC rejuvenates community interest in macro-architecture design. By deepening the understanding of how topological structures influence optimization and representation learning, mHC will help address current limitations and potentially illuminate new pathways for the evolution of next-generation foundational architectures.

作为 HC 范式的通用扩展, mHC 为后续研究打开了几个有前景的方向. 本文用双随机矩阵保证稳定性, 但这个框架也容许针对特定学习目标探索其他流形约束. 我们预期, 进一步研究不同的几何约束, 可能得到更好地平衡可塑性与稳定性的新方法. 此外, 我们希望 mHC 重新唤起社区对宏观架构设计的兴趣. 通过加深对拓扑结构如何影响优化与表示学习的理解, mHC 将有助于突破当前的局限, 并可能为下一代基础架构的演进指出新路径.

## References

J. Ainslie, J. Lee-Thorp, M. De Jong, Y. Zemlyanskiy, F. Lebrón, and S. Sanghai. Gqa: Training generalized multi-query transformer models from multi-head checkpoints. arXiv preprint arXiv:2305.13245, 2023.

Y. Bisk, R. Zellers, R. L. Bras, J. Gao, and Y. Choi. PIQA: reasoning about physical commonsense in natural language. In The Thirty-Fourth AAAI Conference on Artificial Intelligence, AAAI 2020, The Thirty-Second Innovative Applications of Artificial Intelligence Conference, IAAI 2020, The Tenth AAAI Symposium on Educational Advances in Artificial Intelligence, EAAI 2020, New York, NY, USA, February 7-12, 2020, pages 7432–7439. AAAI Press, 2020. doi: 10.1609/aaai.v34i05.6239. URL [https://doi.org/10.1609/aaai.v34i05.6239](https://doi.org/10.1609/aaai.v34i05.6239).

T. Brown, B. Mann, N. Ryder, M. Subbiah, J. D. Kaplan, P. Dhariwal, A. Neelakantan, P. Shyam, G. Sastry, A. Askell, et al. Language models are few-shot learners. Advances in neural information processing systems, 33:1877–1901, 2020.

Y. Chai, S. Jin, and X. Hou. Highway transformer: Self-gating enhanced self-attentive networks. In D. Jurafsky, J. Chai, N. Schluter, and J. Tetreault, editors, Proceedings of the 58th Annual Meeting of the Association for Computational Linguistics, pages 6887–6900, Online, July 2020. Association for Computational Linguistics. doi: 10.18653/v1/2020.acl-main.616. URL [https://aclanthology.org/2020.acl-main.616/](https://aclanthology.org/2020.acl-main.616/).

F. Chollet. Xception: Deep learning with depthwise separable convolutions. In Proceedings of the IEEE conference on computer vision and pattern recognition, pages 1251–1258, 2017.

<!-- page 16 of 19 -->

K. Cobbe, V. Kosaraju, M. Bavarian, M. Chen, H. Jun, L. Kaiser, M. Plappert, J. Tworek, J. Hilton, R. Nakano, et al. Training verifiers to solve math word problems. arXiv preprint arXiv:2110.14168, 2021.

T. Dao, D. Y. Fu, S. Ermon, A. Rudra, and C. Ré. FlashAttention: Fast and memory-efficient exact attention with IO-awareness. In Advances in Neural Information Processing Systems (NeurIPS), 2022.

D. Dua, Y. Wang, P. Dasigi, G. Stanovsky, S. Singh, and M. Gardner. DROP: A reading comprehension benchmark requiring discrete reasoning over paragraphs. In J. Burstein, C. Doran, and T. Solorio, editors, Proceedings of the 2019 Conference of the North American Chapter of the Association for Computational Linguistics: Human Language Technologies, NAACL-HLT 2019, Minneapolis, MN, USA, June 2-7, 2019, Volume 1 (Long and Short Papers), pages 2368–2378. Association for Computational Linguistics, 2019. doi: 10.18653/V1/N19-1246. URL [https://doi.org/10.18653/v1/n19-1246](https://doi.org/10.18653/v1/n19-1246).

Y. Fang, Y. CAI, J. Chen, J. Zhao, G. Tian, and G. Li. Cross-layer retrospective retrieving via layer attention. In The Eleventh International Conference on Learning Representations, 2023. URL [https://openreview.net/forum?id=pvgEL1yS3Ql](https://openreview.net/forum?id=pvgEL1yS3Ql).

W. Fedus, B. Zoph, and N. Shazeer. Switch transformers: Scaling to trillion parameter models with simple and efficient sparsity. Journal of Machine Learning Research, 23(120):1–39, 2022.

K. He, X. Zhang, S. Ren, and J. Sun. Deep residual learning for image recognition. In Proceedings of the IEEE conference on computer vision and pattern recognition, pages 770–778, 2016a.

K. He, X. Zhang, S. Ren, and J. Sun. Identity mappings in deep residual networks. In European conference on computer vision, pages 630–645. Springer, 2016b.

M. Heddes, A. Javanmard, K. Axiotis, G. Fu, M. Bateni, and V. Mirrokni. Deepcrossattention: Supercharging transformer residual connections. In Forty-second International Conference on Machine Learning, 2025. URL [https://openreview.net/forum?id=j3JBfFnGYh](https://openreview.net/forum?id=j3JBfFnGYh).

D. Hendrycks, C. Burns, S. Basart, A. Zou, M. Mazeika, D. Song, and J. Steinhardt. Measuring massive multitask language understanding. arXiv preprint arXiv:2009.03300, 2020.

D. Hendrycks, C. Burns, S. Kadavath, A. Arora, S. Basart, E. Tang, D. Song, and J. Steinhardt. Measuring mathematical problem solving with the math dataset. arXiv preprint arXiv:2103.03874, 2021.

J. Hoffmann, S. Borgeaud, A. Mensch, E. Buchatskaya, T. Cai, E. Rutherford, D. de Las Casas, L. A. Hendricks, J. Welbl, A. Clark, T. Hennigan, E. Noland, K. Millican, G. van den Driessche, B. Damoc, A. Guy, S. Osindero, K. Simonyan, E. Elsen, O. Vinyals, J. Rae, and L. Sifre. An empirical analysis of compute-optimal large language model training. In S. Koyejo, S. Mohamed, A. Agarwal, D. Belgrave, K. Cho, and A. Oh, editors, Advances in Neural Information Processing Systems, volume 35, pages 30016–30030. Curran Associates, Inc., 2022. URL [https://proceedings.neurips.cc/paper\_files/paper/2022/file/c1e2faff6f588870935f114ebe04a3e5-Paper-Conference.pdf](https://proceedings.neurips.cc/paper_files/paper/2022/file/c1e2faff6f588870935f114ebe04a3e5-Paper-Conference.pdf).

G. Huang, Z. Liu, L. Van Der Maaten, and K. Q. Weinberger. Densely connected convolutional networks. In Proceedings of the IEEE conference on computer vision and pattern recognition, pages 4700–4708, 2017.

<!-- page 17 of 19 -->

M. Joshi, E. Choi, D. Weld, and L. Zettlemoyer. TriviaQA: A large scale distantly supervised challenge dataset for reading comprehension. In R. Barzilay and M.-Y. Kan, editors, Proceedings of the 55th Annual Meeting of the Association for Computational Linguistics (Volume 1: Long Papers), pages 1601–1611, Vancouver, Canada, July 2017. Association for Computational Linguistics. doi: 10.18653/v1/P17-1147. URL [https://aclanthology.org/P17-1147](https://aclanthology.org/P17-1147).

G. Larsson, M. Maire, and G. Shakhnarovich. Fractalnet: Ultra-deep neural networks without residuals. arXiv preprint arXiv:1605.07648, 2016.

D. Lepikhin, H. Lee, Y. Xu, D. Chen, O. Firat, Y. Huang, M. Krikun, N. Shazeer, and Z. Chen. Gshard: Scaling giant models with conditional computation and automatic sharding. arXiv preprint arXiv:2006.16668, 2020.

A. Liu, B. Feng, B. Wang, B. Wang, B. Liu, C. Zhao, C. Dengr, C. Ruan, D. Dai, D. Guo, et al. Deepseek-v2: A strong, economical, and efficient mixture-of-experts language model. arXiv preprint arXiv:2405.04434, 2024a.

A. Liu, B. Feng, B. Xue, B. Wang, B. Wu, C. Lu, C. Zhao, C. Deng, C. Zhang, C. Ruan, et al. Deepseek-v3 technical report. arXiv preprint arXiv:2412.19437, 2024b.

I. Loshchilov and F. Hutter. Decoupled weight decay regularization. arXiv preprint arXiv:1711.05101, 2017.

B. Mak and J. Flanigan. Residual matrix transformers: Scaling the size of the residual stream. arXiv preprint arXiv:2506.22696, 2025.

G. Menghani, R. Kumar, and S. Kumar. LAurel: Learned augmented residual layer. In Forty-second International Conference on Machine Learning, 2025. URL [https://openreview.net/forum?id=rUDRWP9WvZ](https://openreview.net/forum?id=rUDRWP9WvZ).

M. Pagliardini, A. Mohtashami, F. Fleuret, and M. Jaggi. Denseformer: Enhancing information flow in transformers via depth weighted averaging. In The Thirty-eighth Annual Conference on Neural Information Processing Systems, 2024. URL [https://openreview.net/forum?id=kMnoh7CXrq](https://openreview.net/forum?id=kMnoh7CXrq).

P. Qi, X. Wan, G. Huang, and M. Lin. Zero bubble (almost) pipeline parallelism. In The Twelfth International Conference on Learning Representations, 2024. URL [https://openreview.net/forum?id=tuzTN0eIO5](https://openreview.net/forum?id=tuzTN0eIO5).

N. Shazeer. Fast transformer decoding: One write-head is all you need. arXiv preprint arXiv:1911.02150, 2019.

N. Shazeer, A. Mirhoseini, K. Maziarz, A. Davis, Q. Le, G. Hinton, and J. Dean. Outrageously large neural networks: The sparsely-gated mixture-of-experts layer. arXiv preprint arXiv:1701.06538, 2017.

R. Sinkhorn and P. Knopp. Concerning nonnegative matrices and doubly stochastic matrices. Pacific Journal of Mathematics, 21(2):343–348, 1967.

R. K. Srivastava, K. Greff, and J. Schmidhuber. Training very deep networks. In C. Cortes, N. Lawrence, D. Lee, M. Sugiyama, and R. Garnett, editors, Advances in Neural Information Processing Systems, volume 28. Curran Associates, Inc., 2015. URL [https://proceedings.neurips.cc/paper\_files/paper/2015/file/215a71a12769b056c3c32e7299f1c5ed-Paper.pdf](https://proceedings.neurips.cc/paper_files/paper/2015/file/215a71a12769b056c3c32e7299f1c5ed-Paper.pdf).

<!-- page 18 of 19 -->

J. Su, M. Ahmed, Y. Lu, S. Pan, W. Bo, and Y. Liu. Roformer: Enhanced transformer with rotary position embedding. Neurocomputing, 568:127063, 2024.

M. Suzgun, N. Scales, N. Schärli, S. Gehrmann, Y. Tay, H. W. Chung, A. Chowdhery, Q. V. Le, E. H. Chi, D. Zhou, et al. Challenging big-bench tasks and whether chain-of-thought can solve them. arXiv preprint arXiv:2210.09261, 2022.

H. Touvron, T. Lavril, G. Izacard, X. Martinet, M.-A. Lachaux, T. Lacroix, B. Rozière, N. Goyal, E. Hambro, F. Azhar, et al. Llama: Open and efficient foundation language models. arXiv preprint arXiv:2302.13971, 2023.

A. Vaswani, N. Shazeer, N. Parmar, J. Uszkoreit, L. Jones, A. N. Gomez, Ł. Kaiser, and I. Polosukhin. Attention is all you need. Advances in neural information processing systems, 30, 2017.

L. Wang, H. Gao, C. Zhao, X. Sun, and D. Dai. Auxiliary-loss-free load balancing strategy for mixture-of-experts. arXiv preprint arXiv:2408.15664, 2024.

L. Wang, Y. Cheng, Y. Shi, Z. Tang, Z. Mo, W. Xie, L. Ma, Y. Xia, J. Xue, F. Yang, et al. Tilelang: A composable tiled programming model for ai systems. arXiv preprint arXiv:2504.17577, 2025.

D. Xiao, Q. Meng, S. Li, and X. Yuan. Muddformer: Breaking residual bottlenecks in transformers via multiway dynamic dense connections. arXiv preprint arXiv:2502.12170, 2025.

S. Xie, R. Girshick, P. Dollár, Z. Tu, and K. He. Aggregated residual transformations for deep neural networks. In Proceedings of the IEEE conference on computer vision and pattern recognition, pages 1492–1500, 2017.

S. Xie, H. Zhang, J. Guo, X. Tan, J. Bian, H. H. Awadalla, A. Menezes, T. Qin, and R. Yan. Residual: Transformer with dual residual connections, 2023. URL [https://arxiv.org/abs/2304.14802](https://arxiv.org/abs/2304.14802).

F. Yu, D. Wang, E. Shelhamer, and T. Darrell. Deep layer aggregation. In Proceedings of the IEEE conference on computer vision and pattern recognition, pages 2403–2412, 2018.

R. Zellers, A. Holtzman, Y. Bisk, A. Farhadi, and Y. Choi. HellaSwag: Can a machine really finish your sentence? In A. Korhonen, D. R. Traum, and L. Màrquez, editors, Proceedings of the 57th Conference of the Association for Computational Linguistics, ACL 2019, Florence, Italy, July 28- August 2, 2019, Volume 1: Long Papers, pages 4791–4800. Association for Computational Linguistics, 2019. doi: 10.18653/v1/p19-1472. URL [https://doi.org/10.18653/v1/p19-1472](https://doi.org/10.18653/v1/p19-1472).

B. Zhang and R. Sennrich. Root mean square layer normalization. Advances in neural information processing systems, 32, 2019.

D. Zhu, H. Huang, Z. Huang, Y. Zeng, Y. Mao, B. Wu, Q. Min, and X. Zhou. Hyper-connections. arXiv preprint arXiv:2409.19606, 2024.

<!-- page 19 of 19 -->

## A. Appendix

## A.1. Detailed Model Specifications and Hyper-parameters.

<table><tr><td>Attribute</td><td>3B</td><td>9B</td><td>27B</td><td>3B1T Tokens</td></tr><tr><td>Vocab Params</td><td>331M</td><td>496M</td><td>662M</td><td>331M</td></tr><tr><td>Active Params</td><td>612M</td><td>1.66B</td><td>4.14B</td><td>612M</td></tr><tr><td>Total Params</td><td>2.97B</td><td>9.18B</td><td>27.0B</td><td>2.97B</td></tr><tr><td>Layers</td><td>12</td><td>18</td><td>30</td><td>12</td></tr><tr><td>Leading Dense Layers</td><td></td><td>1</td><td></td><td>1</td></tr><tr><td>Routed Experts</td><td>64</td><td>64</td><td>72</td><td>64</td></tr><tr><td>Active Experts</td><td></td><td>6</td><td></td><td>6</td></tr><tr><td>Shared Experts</td><td></td><td>2</td><td></td><td>2</td></tr><tr><td>Dimension</td><td>1280</td><td>1920</td><td>2560</td><td>1280</td></tr><tr><td>FFN Dimension</td><td>896</td><td>1280</td><td>1536</td><td>896</td></tr><tr><td>Load Balancing Method</td><td colspan="3">Loss-Free (Wang et al., 2024)</td><td>Loss-Free</td></tr><tr><td>Attention Heads</td><td>16</td><td>24</td><td>32</td><td>16</td></tr><tr><td>Attention Dimension</td><td></td><td>128</td><td></td><td>128</td></tr><tr><td>Attention Variant</td><td colspan="3">MLA (Liu et al., 2024a)</td><td>MLA</td></tr><tr><td>KV Rank</td><td></td><td>512</td><td></td><td>512</td></tr><tr><td>Position Embedding</td><td colspan="3">RoPE (Su et al., 2024)</td><td>RoPE</td></tr><tr><td>RoPE Dimension</td><td></td><td>64</td><td></td><td>64</td></tr><tr><td>RoPE θ</td><td></td><td>10000</td><td></td><td>10000</td></tr><tr><td>Layer Norm Type</td><td colspan="3">RMSNorm (Zhang and Sennrich, 2019)</td><td>RMSNorm</td></tr><tr><td>Layer Norm ε</td><td></td><td>1e-20</td><td></td><td>1e-20</td></tr><tr><td>mHC/HC Expansion Rate n</td><td colspan="3">4</td><td>4</td></tr><tr><td>mHC/HC Gating Factor Init α</td><td colspan="3">0.01</td><td>0.01</td></tr><tr><td>mHC Sinkhorn-Knopp  $t_{max}$ </td><td colspan="3">20</td><td>20</td></tr><tr><td>Sequence Length</td><td></td><td>4096</td><td></td><td>4096</td></tr><tr><td>Vocab Size</td><td></td><td>129280</td><td></td><td>129280</td></tr><tr><td>Batch Size</td><td>320</td><td>512</td><td>1280</td><td>2560</td></tr><tr><td>Training Steps</td><td>30000</td><td>50000</td><td>50000</td><td>100000</td></tr><tr><td>Training Tokens</td><td>39.3B</td><td>105B</td><td>262B</td><td>1.05T</td></tr><tr><td>Warmup Steps</td><td></td><td>2000</td><td></td><td>2000</td></tr><tr><td>Optimizer</td><td colspan="3">AdamW (Loshchilov and Hutter, 2017)</td><td>AdamW</td></tr><tr><td>AdamW Betas</td><td></td><td>(0.9, 0.95)</td><td></td><td>(0.9, 0.95)</td></tr><tr><td>AdamW ε</td><td></td><td>1e-20</td><td></td><td>1e-20</td></tr><tr><td>Base Learning Rate</td><td>8.6e-4</td><td>5.9e-4</td><td>4.0e-4</td><td>9.0e-4</td></tr><tr><td>Lr Scheduler</td><td></td><td>Step</td><td></td><td>Step</td></tr><tr><td>Lr Decay Step Ratio</td><td></td><td>[0.8 ×, 0.9 ×]</td><td></td><td>[0.8 ×, 0.9 ×]</td></tr><tr><td>Lr Decay Rate</td><td></td><td>[0.316, 0.1]</td><td></td><td>[0.316, 0.1]</td></tr><tr><td>Weight Decay</td><td></td><td>0.1</td><td></td><td>0.1</td></tr></table>
