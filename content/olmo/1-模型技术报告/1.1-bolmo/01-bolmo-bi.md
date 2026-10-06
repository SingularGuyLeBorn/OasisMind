---
title: "Bolmo 对照译稿"
category: "模型技术报告"
tags: ["OLMo", "对照译稿"]
published: true
excerpt: "Bolmo 论文 (arXiv 2512.15586 v2) 的逐段中英对照译稿, 附读论文时对数字与代码的核对块."
---
<!-- page 1 of 35 -->

arXiv:2512.15586v2 [cs.CL] 9 Feb 2026

# Bolmo: Byteifying the Next Generation of Language Models

**Benjamin Minixhofer** <sup>1,2</sup> **Tyler Murray** <sup>1</sup> **Tomasz Limisiewicz** <sup>3</sup> **Anna Korhonen** <sup>2</sup> **Luke Zettlemoyer** <sup>3</sup> **Noah A. Smith** <sup>1,3</sup> **Edoardo M. Ponti** <sup>4,2</sup> **Luca Soldaini** <sup>1</sup> **Valentin Hofmann** <sup>1,3</sup>

<sup>1</sup>Allen Institute for AI <sup>2</sup>University of Cambridge <sup>3</sup>University of Washington <sup>4</sup>University of Edinburgh

**Models:** [Bolmo-7B](https://huggingface.co/allenai/Bolmo-7B) [Bolmo-1B](https://huggingface.co/allenai/Bolmo-1B) **Data:** Bolmo Mix **Code:** [bolmo-core](https://github.com/allenai/bolmo-core)

## Abstract

Recent advances in generative AI have been largely driven by large language models (LLMs), deep neural networks that operate over discrete units called tokens. To represent text, the vast majority of LLMs use words or word fragments as the tokens, known as subword tokenization. Subword tokenization obscures fine-grained information, which is problematic, especially for scientific data — such as computer code or biological sequences — where meaning depends on the individual characters. Models that instead operate directly on the byte encoding of text avoid these limitations, but until now they have lagged behind subword-based models in performance. Here we introduce Bolmo, a family of fully open byte-level LLMs that approach the capabilities of subword-based systems. Using a two-stage conversion procedure, we transform existing subword-based models into byte-level models with minimal additional training. The resulting models outperform prior byte-level approaches and excel on character-level reasoning tasks, while remaining competitive across standard benchmarks. By efficiently processing byte-level information, these models achieve practical inference speeds and can be adapted at low cost using the existing ecosystem around the source LLM. Our results remove a long-standing performance barrier to end-to-end byte-level language modeling, demonstrating that models operating on raw text encodings can scale competitively while offering advantages in domains requiring fine-grained textual understanding.

近年生成式 AI 的进展主要来自大语言模型 (LLM), 即在称为 token 的离散单元上运算的深度神经网络. 表示文本时, 绝大多数 LLM 把词或词的片段当作 token, 这就是子词分词. 子词分词会遮住细粒度信息, 对代码, 生物序列这类意义取决于单个字符的科学数据尤其不利. 直接在文本字节编码上运算的模型没有这些限制, 但性能一直落后于子词模型. 我们提出 Bolmo, 一族完全开放的字节级 LLM, 能力接近子词系统. 我们用两阶段转换流程, 只做很少的额外训练, 就把现有子词模型转成字节级模型. 得到的模型超过此前的字节级方法, 在字符级推理任务上表现突出, 在常规基准上也保持竞争力. 由于处理字节级信息的效率较高, 这些模型的推理速度达到可用水平, 并能借助源 LLM 已有的生态低成本适配. 结果去掉了端到端字节级语言建模长期存在的性能障碍, 说明直接在原始文本编码上运算的模型可以有竞争力地扩展, 并在需要细粒度文本理解的领域占优.

<!-- page 2 of 35 -->

## Contents

1 Introduction · 2 Related Work · 3 Byteified Olmo (3.1 Architecture, 3.1.1 Non-Causal Patch Boundary Prediction, 3.2 Byteifying Procedure, 3.2.1 Stage 1: Subword-to-Byte Distillation, 3.2.2 Stage 2: End-to-End Training) · 4 Experiment Setup · 5 Main Results (5.1 Training at Higher Compression Factors, 5.2 Post-Training Byteified Models via Task Arithmetic) · 6 Ablations (6.1 Impact of Non-Causal Patch Boundaries, 6.2 Is Stage 1 Training Necessary?, 6.3 Selecting the Right Local Model Architecture for Fast Inference) · 7 Conclusion · 8 Future Directions · A Additional Ablations · B Benchmark Details · C CUTE-Style Training Data · D Does Post-Training Byteified Models via Task Arithmetic Always Work? · E Embedding Rank Analysis · F Full Hyperparameters

<!-- page 3 of 35 -->

## 1 Introduction

Recent progress in AI has been driven by end-to-end deep learning systems that learn representations directly from data. Large language models (LLMs) exemplify this trend, achieving strong capabilities by training on massive collections of text (e.g., Brown et al., 2020; Guo et al., 2025). However, despite their apparent generality, contemporary LLMs are not fully end-to-end: before learning can begin, text must first be mapped to a sequence of discrete units called tokens. The choice of tokens, though sometimes overlooked, fundamentally shapes the representations LLMs learn and the behaviors they exhibit (Hofmann et al., 2021; Ahia et al., 2023; Land and Bartolo, 2024; Peng et al., 2025; Zheng et al., 2025a).

AI 近来的进步来自直接从数据学表示的端到端深度学习系统. LLM 是典型例子, 靠在海量文本上训练获得很强的能力. 但当代 LLM 看似通用, 其实并不完全端到端: 学习开始前, 文本得先映射成称为 token 的离散单元序列. token 的选择常被忽视, 却从根本上决定了 LLM 学到的表示和表现出的行为.

The vast majority of contemporary LLMs use words or parts of words as the tokens, known as subword tokenization (Sennrich et al., 2016; Kudo, 2018). This leads to many problems: LLMs which use subword tokenization suffer from limited character-level understanding (Edman et al., 2024; Cosma et al., 2025; Uzan and Pinter, 2025), which especially hinders performance on scientific data such as code and biological sequences (Chirkova and Troshin, 2023; Dagan et al., 2024; Lindsey et al., 2025; Hwang et al., 2025); they are also implicitly biased toward generating particular responses based on the way the prompt is tokenized (Phan et al., 2024; Hayase et al., 2025; Vieira et al., 2025), are restricted in the number of words they can incorporate in their vocabulary, which in practice leads to English-centricity (Liang et al., 2023; Ahia et al., 2023), and potentially suboptimally allocate their compute (Hwang et al., 2025; Pagnoni et al., 2025). These problems have motivated extensive research into alternatives to subword tokenization, most commonly by using the underlying UTF-8 bytes the text is encoded as (Yergeau, 2003) as the discrete units. Many prior byte-level LLMs claim to outperform subword-level LLMs on the efficiency–performance Pareto frontier (Nawrot et al., 2023; Slagle, 2024; Wang et al., 2024; Hwang et al., 2025; Pagnoni et al., 2025; Zheng et al., 2025b). However, in practice, byte-level LLMs have not seen widespread adoption so far, with all leading LLMs still exclusively relying on subword tokenization.

当代 LLM 大多把词或词的一部分当 token, 即子词分词. 这带来不少问题. 子词 LLM 的字符级理解有限, 在代码和生物序列等科学数据上尤其吃亏. 它们会因提示词的切分方式而隐性偏向某些回答. 词表能收的词数有限, 实际导致以英语为中心. 算力分配也可能不够合理. 这些问题催生了大量替代方案的研究, 最常见的是把文本底层的 UTF-8 字节当离散单元. 不少字节级 LLM 声称在效率-性能 Pareto 前沿上胜过子词 LLM. 可实践中字节级 LLM 至今没有普及, 头部 LLM 仍全部依赖子词分词.

We hypothesize that the key reason for this mismatch between theory and practice is the fact that existing approaches to byte-level language modeling focus predominantly on training a new byte-level model from scratch, and compare against a subword-level LLM trained from scratch. In contrast, training of state-of-the-art subword-level LLMs is rapidly evolving, combining innovations in training data curation, model architecture, and post-training. Keeping this pace is unfeasible for byte-level LLM development without extensive investments.

我们猜测理论与实践脱节的主要原因在于: 现有字节级方法几乎都在从头训一个新的字节级模型, 并拿它和同样从头训的子词 LLM 比. 而最先进的子词 LLM 的训练在数据整理, 模型架构, 后训练上都在快速迭代. 不投入大量资源, 字节级 LLM 的开发跟不上这个节奏.

To resolve this mismatch, we introduce Bolmo, the first family of fully open byte-level LLMs achieving performance on the level of state-of-the-art subword-level LLMs across various tasks. In contrast to prior byte-level LLMs that focus predominantly on training from scratch, Bolmo is trained by byteifying an existing subword-level LLM using less than 1% of a typical pretraining budget (39.3B tokens). Byteification establishes a connection between existing subword-level LLMs and byte-level LLMs. This lets us train the byteified models Bolmo 7B and Bolmo 1B by starting from the existing fully open LLMs Olmo 3 7B (Olmo Team, 2025) and OLMo 2 1B (OLMo et al., 2024), respectively.

为了解决这一脱节, 我们提出 Bolmo: 第一族在多类任务上达到最先进子词 LLM 水平的完全开放字节级 LLM. 此前的字节级 LLM 大多从头训练, Bolmo 则是把现有子词 LLM 字节化 (byteify) 得到的, 用的数据不到常规预训练预算的 1% (39.3B token). 字节化把现有子词 LLM 和字节级 LLM 接了起来. 我们据此分别从完全开放的 Olmo 3 7B 和 OLMo 2 1B 出发, 训出字节化模型 Bolmo 7B 和 Bolmo 1B.

Bolmo first pools bytes into patches of one or more bytes. The patches are then processed by a large Transformer language model (Vaswani et al., 2017) and finally depooled into bytes. Due to its latent tokenization into byte patches, we refer to this style of architecture as Latent Tokenizer Language Model (LTLM). Prior LTLMs include the DTP (Nawrot et al., 2023), BLT (Pagnoni et al., 2025) and H-Net (Hwang et al., 2025) models. However, in contrast to prior work, we specifically design the Bolmo architecture to be well-suited to byteification (see Section 3.1). In particular, we resolve a mismatch between the expressivity of subword tokenization and the latent LTLM tokenization (Section 3.1.1). Alongside an efficient two-stage training procedure (Section 3.2), this allows for quickly recovering and in some cases surpassing the performance of the source subword-level LLM. We believe that byteifying provides a key missing research direction by enabling the creation of state-of-the-art byte-level LLMs without extensive investments. This is complementary to training from scratch: making it cheap to byteify any subword model can quickly unveil high-performing architectures which are promising candidates for training from scratch as byte-level LLMs.

Bolmo 先把字节池化成由一个或多个字节组成的 patch, patch 交给一个大的 Transformer 语言模型处理, 最后再反池化回字节. 由于内部把字节潜在地切成 patch, 我们把这类架构称为潜在分词语言模型 (Latent Tokenizer Language Model, LTLM). 此前的 LTLM 有 DTP, BLT 和 H-Net. 与它们不同, Bolmo 的架构是专门为字节化设计的 (见 3.1 节). 具体来说, 我们解决了子词分词与 LTLM 潜在分词在表达力上的不匹配 (3.1.1 节). 配合高效的两阶段训练流程 (3.2 节), 模型能很快恢复源子词 LLM 的性能, 有时还会超过. 我们认为字节化补上了一个缺失的研究方向: 不必大量投入就能造出最先进的字节级 LLM. 它与从头训练互补: 字节化任意子词模型的成本一旦很低, 就能快速筛出高性能架构, 作为从头训练字节级 LLM 的候选.

Our Bolmo models on average outperform all prior public byte-level LLMs of comparable size; for example, Bolmo 7B achieves +16.5% absolute improvement in STEM tasks over BLT 7B, which was trained from scratch. Bolmo 7B also greatly outperforms the source Olmo 3 on character understanding and improves on average across a set of coding tasks.

Bolmo 模型平均超过此前所有同规模的公开字节级 LLM. 例如 Bolmo 7B 在 STEM 任务上比从头训练的 BLT 7B 绝对提高 16.5%. Bolmo 7B 在字符理解上也大幅超过源模型 Olmo 3, 在一组代码任务上平均有所提升.

<!-- page 4 of 35 -->

In addition, Bolmo can be arbitrarily further sped up by training with higher ratios of bytes per patch, which is only possible to a limited extent in subword-level LLMs (Section 5.1). Furthermore, we show that existing components in the source LLM ecosystem can be utilized to adapt a byteified model without any additional training cost (Section 5.2); this could further accelerate research on byte-level LLMs. Finally, we provide extensive ablations on our design choices and analyze the differences between Bolmo and subword-level LLMs (Section 6).

此外, 用更高的每 patch 字节数训练, Bolmo 可以任意进一步提速, 子词 LLM 只能有限地做到这一点 (5.1 节). 我们还展示了源 LLM 生态里已有的组件可以零额外训练成本地用来适配字节化模型 (5.2 节), 这可能进一步加快字节级 LLM 的研究. 最后, 我们对设计选择做了大量消融, 并分析了 Bolmo 与子词 LLM 的差异 (第 6 节).

In aggregate, our results show that byte-level LLMs offer substantial promise as a foundation for future language models, providing improved computational efficiency that reduces energy and deployment costs, mitigating biases introduced by English-centric subword tokenization, and enabling applications that require fine-grained textual understanding, particularly in scientific and technical domains.

总体来看, 结果表明字节级 LLM 很有希望成为未来语言模型的基础: 计算效率更高, 能降低能耗和部署成本; 能缓解以英语为中心的子词分词带来的偏差; 还能支撑需要细粒度文本理解的应用, 特别是科学和技术领域.

## 2 Related Work · 相关工作

**Tokenization.** LLMs process information represented as a discrete sequence of symbols called tokens or patches. The process of segmenting the input into this discrete sequence is called tokenization, with different ways to tokenize being used across modalities such as text (Kudo, 2018), audio (Borsos et al., 2023) and images (Dosovitskiy, 2020). The predominant approach to tokenize text since the inception of LLMs has been subword tokenization (Sennrich et al., 2016; Kudo, 2018): tokenizing text into a discrete sequence of units from a finite vocabulary of subword tokens (usually of size 30k-300k), typically represented as integer IDs. Subword tokenization causes a number of problems. (i) Information about the characters within each token is lost. While LLMs have been shown to implicitly learn their tokens' constituent characters (Kaushal and Mahowald, 2022; Edman et al., 2024) and it is possible to explicitly re-introduce character information (Cosma et al., 2025), they still fall short in tasks requiring character knowledge (Edman et al., 2024; Uzan and Pinter, 2025). (ii) The implicit reliance of subword tokenization on the future contents of the text (called tokenization bias) causes unexpected behavior at inference if the prompt ends in the middle of a word or with whitespace (Phan et al., 2024; Hayase et al., 2025; Vieira et al., 2025). (iii) The need for a fixed, finite subword vocabulary causes restrictive rigidity: for example, while encoding English efficiently is crucial for pretraining since the vast majority of current pretraining documents are in English, various downstream tasks have different efficiency requirements across different languages. (iv) Tokenization in contemporary LLMs is tied to compute allocation: in a standard LLM, the same amount of compute is spent on processing every token in the prefill, every token contributes equally to the KV cache size, and a fixed amount of compute is spent on sequentially generating any new token. Although there are ways to mitigate this problem post-hoc — such as KV cache sparsification (Łańcucki et al., 2025) and multi-token prediction (Gloeckle et al., 2024) — directly adapting the tokenization and thus the compute allocation based on the input instead might be more effective (Nawrot et al., 2023; Pagnoni et al., 2025).

**分词.** LLM 处理的信息表示为离散符号序列, 符号叫 token 或 patch. 把输入切成这种离散序列的过程叫分词, 文本, 音频, 图像各有各的切法. 自 LLM 出现以来, 文本的主流分词方式是子词分词: 把文本切成来自有限子词词表 (通常 30k-300k) 的单元序列, 一般用整数 ID 表示. 子词分词带来几个问题. (i) token 内部的字符信息丢失. LLM 虽然能隐式学到 token 由哪些字符组成, 也可以显式补回字符信息, 但在需要字符知识的任务上仍然不足. (ii) 子词分词隐式依赖文本后文的内容 (称为分词偏差), 提示词停在词中间或以空白结尾时, 推理会出现意外行为. (iii) 固定有限的词表带来刚性: 当前预训练文档绝大多数是英语, 高效编码英语对预训练很关键, 但下游任务对不同语言的效率要求各不相同. (iv) 当代 LLM 的分词与算力分配绑定: 标准 LLM 在 prefill 时对每个 token 花同样的计算, 每个 token 对 KV cache 大小的贡献相同, 顺序生成每个新 token 的计算量也固定. 虽然可以事后缓解, 例如 KV cache 稀疏化和多 token 预测, 但根据输入直接调整分词, 进而调整算力分配, 可能更有效.

**Byte-level LLMs.** The shortcomings of subword tokenization have motivated extensive work on a wide range of alternatives, which even include tokenizing text by rendering it into pixels and segmenting these into patches (Lotz et al., 2023; Rust et al., 2023; Wei et al., 2025). The most common alternative has been tokenizing into a smaller set of finer-grained atomic units, such as UTF-8 bytes,<sup>1</sup> instead. One strand of work directly replaces subword tokens with UTF-8 bytes, keeping other aspects of the architecture mostly the same (Xue et al., 2022; Wang et al., 2024; Minixhofer et al., 2025b; Zheng et al., 2025b). This potentially solves problems (i) - (iii)<sup>2</sup> of subword tokenization, but compute allocation remains a problem, exacerbated by having to process on average at least four times longer sequences of bytes. To mitigate this problem, some architectures pool a fixed amount of tokens into a single representation with a lightweight local encoder (e.g., another Transformer network), pass the pooled representations through a deep global model operating over the shortened sequence, then depool the representations back to the original granularity via a local decoder. This approach has been pioneered for autoregressive models by the Hourglass Transformer (Nawrot et al., 2022) and later adopted more broadly (Yu et al., 2023; Ho et al., 2024). Recent subsequent work has shown that

**字节级 LLM.** 子词分词的缺点催生了大量替代方案, 甚至包括把文本渲染成像素再切成 patch. 最常见的替代是切成更小, 更细的原子单元集合, 例如 UTF-8 字节<sup>1</sup>. 一条路线直接把子词 token 换成 UTF-8 字节, 架构其余部分基本不动. 这可能解决子词分词的问题 (i) 到 (iii)<sup>2</sup>, 但算力分配仍是问题, 而且字节序列平均至少长四倍, 问题更严重. 为缓解这一点, 一些架构用轻量的局部编码器 (例如另一个 Transformer) 把固定数量的 token 池化成一个表示, 交给在缩短序列上运算的深层全局模型, 再由局部解码器反池化回原粒度. 这种做法由 Hourglass Transformer 在自回归模型上首创, 之后被更广泛采用. 后续工作表明

<sup>1</sup> Although byte-level LLMs are sometimes called 'tokenizer-free', it is more correct to say that UTF-8 is the tokenizer, and the vocabulary is the set of 256 distinct bytes.

<sup>1</sup> 字节级 LLM 有时被称为「无分词器」, 更准确的说法是 UTF-8 就是分词器, 词表是 256 个不同字节的集合.

<sup>2</sup> Since UTF-8 is designed primarily for the Latin script, problem (ii) of inefficiency in languages besides English might persist. However, alternative fine-grained units provide a promising alternative (Limisiewicz et al., 2024; Land and Arnett, 2025).

<sup>2</sup> UTF-8 主要为拉丁文字设计, 所以英语以外语言的低效问题可能仍然存在. 不过其他细粒度单元提供了有前景的替代.


<!-- page 5 of 35 -->

replacing static pooling with dynamic tokenization improves the performance–efficiency Pareto front (Nawrot et al., 2023; Slagle, 2024). In this case, the token boundaries may be learned end-to-end, rely on entropy spikes, or be externally supervised (Nawrot et al., 2023; Hwang et al., 2025). We refer to these architectures as Latent Tokenizer Language Models (LTLMs) collectively, since — although operating over bytes — they perform a tokenization step inside the model which aggregates the byte representations into representations over latent patches. Byte-level LTLMs finally have the ability to address issues (i) - (iv) of subword tokenization. The most recent LTLMs have shown promise by performing on par with subword tokenization when spending the same total amount of FLOPs on training (Hwang et al., 2025; Pagnoni et al., 2025). Although we focus on LTLMs in this work, there are also other strands of promising research relevant to byte-level models, such as MrT5 (Kallini et al., 2025), which uses a soft gating mechanism to reduce sequence lengths at inference and zip2zip (Geng et al., 2025), which adaptively merges tokens based on the past token context.

把静态池化换成动态分词能改善性能-效率 Pareto 前沿. 这时 token 边界可以端到端学出来, 可以依据熵的尖峰, 也可以由外部监督. 我们把这类架构统称为潜在分词语言模型 (LTLM): 它们虽然在字节上运算, 但在模型内部做了一步分词, 把字节表示聚合成潜在 patch 上的表示. 字节级 LTLM 终于有能力同时处理子词分词的问题 (i) 到 (iv). 最新的 LTLM 在训练总 FLOPs 相同时与子词分词持平, 显示出前景. 本文聚焦 LTLM, 但与字节级模型相关的还有其他有前景的路线, 例如用软门控在推理时缩短序列的 MrT5, 以及根据过去的 token 上下文自适应合并 token 的 zip2zip.

**Tokenizer Transfer and Retrofitting.** Techniques to alter a model's architecture with extra training are typically referred to as retrofitting, which often relies on self-distillation (Bick et al., 2024; Łańcucki et al., 2025). The principal difficulty when this involves a change of tokenizer is finding embeddings for the new tokens; this is usually done using heuristics (Tran, 2020; Minixhofer et al., 2022; Dobler and de Melo, 2023) or training-based methods (Minixhofer et al., 2025a). Recently, effective tokenizer transfer methods based on cross-tokenizer distillation have been introduced (Dobler et al., 2025; Haltiuk and Smywiński-Pohl, 2025; Minixhofer et al., 2025b). Here, the original model is seen as the teacher, the tokenizer-transferred model is seen as the student, and the objective is to match the behavior of the student to the teacher. Byteification is a special case of tokenizer transfer. Byteification was first done by Pagnoni et al. (2025) by initializing the LTLM parameters from an existing subword model where possible and training as if from scratch. Hwang et al. (2025) later byteified by supervising the boundary prediction to match the subword boundaries and introducing an auxiliary embedding-matching loss. Our key contribution is creating an LTLM which is specifically suited to byteifying. We do so by introducing a novel architecture (Section 3.1), as well as a dedicated two-stage procedure to byteify efficiently by first learning to exactly recover the behavior of the source subword model (Section 3.2). Together, these innovations first allow closely matching the performance of state-of-the-art subword-level LLMs with a byteified model.

**分词器迁移与改装.** 通过额外训练修改模型架构的技术通常叫改装 (retrofitting), 常依赖自蒸馏. 涉及更换分词器时, 主要难点是给新 token 找 embedding, 通常用启发式方法或基于训练的方法. 近来出现了基于跨分词器蒸馏的有效迁移方法: 原模型当教师, 迁移了分词器的模型当学生, 目标是让学生的行为与教师一致. 字节化是分词器迁移的特例. Pagnoni 等 (2025) 最早做字节化: 尽可能用现有子词模型初始化 LTLM 参数, 然后当作从头训练. Hwang 等 (2025) 后来的做法是监督边界预测去匹配子词边界, 并引入辅助的 embedding 匹配损失. 我们的核心贡献是造出一个专门适合字节化的 LTLM: 提出新架构 (3.1 节), 以及专门的两阶段流程, 先学会精确复现源子词模型的行为, 从而高效完成字节化 (3.2 节). 这些改进合在一起, 首次让字节化模型的性能紧贴最先进的子词 LLM.

## 3 Byteified Olmo · 字节化的 Olmo

### 3.1 Architecture · 架构

Following the same overall structure as prior LTLMs, Bolmo can be formalized as shown in Figure 1.

Bolmo 沿用此前 LTLM 的整体结构, 可形式化为图 1 所示的形式.

**Tokenization & Embedding.** $\mathcal{T}$ assigns every input UTF-8 byte in $x$<sup>3</sup> a corresponding embedding in $\mathbb{R}^d$ from an embedding table containing an entry for every byte. The embedding table over bytes is negligible in size compared to embedding tables over subwords. However, scaling the size and sparsity of the embedding table has been shown to improve performance while having no negative effect on inference speed (Huang et al., 2025). Inspired by BLT's hash embeddings (Tito Svenstrup et al., 2017; Pagnoni et al., 2025), we thus increase the size of the embedding table. Specifically, we residually add the longest subword embedding (of the original subword-level LLM's embedding table) which ends at the current byte position to every byte embedding:

**分词与嵌入.** $\mathcal{T}$ 从一张每个字节各占一行的嵌入表中, 给 $x$<sup>3</sup> 里每个输入 UTF-8 字节分配一个 $\mathbb{R}^d$ 中的嵌入. 字节嵌入表的大小与子词嵌入表相比可以忽略. 但已有工作表明, 扩大嵌入表的规模和稀疏度能提升性能, 且不拖慢推理. 受 BLT 哈希嵌入的启发, 我们扩大了嵌入表: 对每个字节嵌入, 以残差方式加上在当前字节位置结束的最长子词的嵌入 (取自原子词 LLM 的嵌入表):

$$
e_i := \mathcal{T}_{\text{Byte}}(x_i) + \mathcal{T}_{\text{SubwordSuffix}}(x_{:i})
$$

where $\mathcal{T}_{\text{SubwordSuffix}}$ assigns an embedding to every byte based on the index of the subword token in the vocabulary $\mathcal{V}_{\text{Subword}}$ with the longest common suffix to the byte sequence up to the current position $i$. Retaining the subword embeddings is not strictly necessary, and we can generally achieve the same performance by increasing the size of the local encoder instead. However, subword embedding retention allows us to achieve a better performance–efficiency tradeoff by increasing the amount of cheap sparsely activated parameters.<sup>4</sup>

其中 $\mathcal{T}_{\text{SubwordSuffix}}$ 根据词表 $\mathcal{V}_{\text{Subword}}$ 中与「到当前位置 $i$ 为止的字节序列」公共后缀最长的子词 token 的索引, 给每个字节分配嵌入. 保留子词嵌入并非必需, 一般改为加大局部编码器也能达到同样性能. 但保留子词嵌入增加的是廉价的稀疏激活参数, 性能-效率权衡更好<sup>4</sup>.

<sup>3</sup> We treat $x$ as a sequence over bytes, i.e. $x \in \{0, .., 255\}^n$.

<sup>3</sup> 我们把 $x$ 看作字节序列, 即 $x \in \{0, .., 255\}^n$.

<sup>4</sup> An alternative to increasing the size and sparsity of the local encoder is using a mixture of experts in the feed-forward layer, although we do not investigate this here.

<sup>4</sup> 另一种增加局部编码器规模与稀疏度的办法是在前馈层用 MoE, 本文没有研究.

<!-- page 6 of 35 -->

![Figure 1](images/bolmo_architecture-cropped.png)

Figure 1 The Bolmo architecture. Tokenization & Embedding $\mathcal{T}$ transforms the input text into one representation per byte. The representations are contextualized with the local encoder $\mathcal{E}$ consisting of mLSTM blocks. The boundary predictor $\mathcal{B}$ decides where to place patch boundaries using one byte of future context. The representations are then Pooled, passed through the global model $\mathcal{M}$ consisting of Transformer layers, and Depooled. Finally, the local decoder $\mathcal{D}$ consisting of another mLSTM stack contextualizes the depooled byte representations and the LMHead transforms them into next-byte predictions, alongside deciding where to place the next patch boundary.

**Local Encoder.** The local encoder $\mathcal{E}$ contextualizes the byte-level embeddings through an mLSTM layer (Beck et al., 2025a), resulting in the contextualized representations $\hat{e}$. We find that mLSTM improves inference speed compared to other linear RNN variants (see Section 6.3) while attaining competitive performance. We found a single mLSTM layer to be sufficient since the expressivity of the local encoder is substantially enhanced by the retained subword embeddings.

**局部编码器.** 局部编码器 $\mathcal{E}$ 用一层 mLSTM 给字节级嵌入加上上下文, 得到上下文化表示 $\hat{e}$. 我们发现 mLSTM 比其他线性 RNN 变体推理更快 (见 6.3 节), 性能也有竞争力. 一层 mLSTM 就够了, 因为保留的子词嵌入已经大幅增强了局部编码器的表达力.

**Boundary Predictor.** The boundary predictor $\mathcal{B}$ predicts a score $p \in [0, 1]$ for every byte based on the contextualized representations $\hat{e}$. If $p$ is greater than some threshold, a patch boundary is placed after the current byte. In contrast to prior LTLMs, Bolmo's boundary predictor is non-causal:<sup>5</sup> it has access to one byte of future context, and it is only employed for the prefill, where future information can be used while retaining the ability to generate text. We describe non-causal boundary prediction in detail in Section 3.1.1, where we also discuss how boundary prediction is handled during decoding.

**边界预测器.** 边界预测器 $\mathcal{B}$ 根据上下文化表示 $\hat{e}$ 给每个字节预测一个分数 $p \in [0, 1]$. 若 $p$ 超过某个阈值, 就在当前字节之后放一个 patch 边界. 与此前的 LTLM 不同, Bolmo 的边界预测器是非因果的<sup>5</sup>: 它能看到一个字节的未来上下文, 且只用于 prefill, 在 prefill 里使用未来信息并不妨碍生成文本. 3.1.1 节详细介绍非因果边界预测, 并讨论解码时如何处理边界预测.

**Pooling.** We pool byte-level representations into patch representations by selecting the representation of the last byte in every patch as the patch-level representation $h$. This is equivalent to the pooling done by Hwang et al. (2025),<sup>6</sup> and does not introduce any extra parameters. Contrary to Hwang et al. (2025), the local models

**池化.** 我们取每个 patch 最后一个字节的表示作为 patch 级表示 $h$, 以此把字节级表示池化成 patch 表示. 这与 Hwang 等 (2025) 的池化等价<sup>6</sup>, 不引入额外参数. 与 Hwang 等 (2025) 不同, 局部模型

<sup>5</sup> For consistency with prior work, we use the term 'non-causal' to contrast with 'causal' as in causal language models, i.e., causal in the sense of using only unidirectional context, although this is arguably a misnomer.

<sup>5</sup> 为与此前工作一致, 我们用「非因果」对照因果语言模型里的「因果」, 即只使用单向上下文意义上的因果, 尽管这个名字可能不太准确.

<sup>6</sup> Hwang et al. (2025) refer to the process of creating a single representation for every patch as routing, whereas we refer to this more generally as pooling, which also encompasses the cross-attention pooling done by Pagnoni et al. (2025).

<sup>6</sup> Hwang 等 (2025) 把给每个 patch 生成单一表示的过程称为路由 (routing), 我们更一般地称为池化, 也涵盖 Pagnoni 等 (2025) 的交叉注意力池化.

<!-- page 7 of 35 -->

and the global model use the same representation dimensionality, obviating the need for an upprojection.<sup>7</sup>

和全局模型使用相同的表示维度, 因此不需要升维投影<sup>7</sup>.

**Global Model.** The majority of compute is spent in the deep global model $\mathcal{M}$ contextualizing the patch representations $h$ into $\hat{h}$. We retain the global model of the original subword-level LLM, i.e. the Olmo 3 decoder-only transformer backbone.

**全局模型.** 大部分计算花在深层全局模型 $\mathcal{M}$ 上, 它把 patch 表示 $h$ 上下文化为 $\hat{h}$. 我们保留原子词 LLM 的全局模型, 即 Olmo 3 的 decoder-only Transformer 主干.

**Depooling.** The global model is invoked at every patch boundary, providing a contextualized representations for every patch. It remains to depool these representations back to representations of bytes. We do so by adding the latest available patch representation in $\hat{h}$ at any byte position to a linear projection of the byte representations $\hat{e}$, resulting in $z$. This is similar to Hwang et al. (2025)'s depooling, again forgoing the projection due to equal global and local dimensionality.

**反池化.** 全局模型在每个 patch 边界处调用一次, 为每个 patch 给出上下文化表示. 剩下的是把这些表示反池化回字节表示. 做法是: 在每个字节位置, 把 $\hat{h}$ 中最近一个可用的 patch 表示加到字节表示 $\hat{e}$ 的线性投影上, 得到 $z$. 这与 Hwang 等 (2025) 的反池化类似, 同样因为全局与局部维度相同而省掉投影.

**Local Decoder.** The local decoder $\mathcal{D}$ contextualizes the depooled byte representations $z$ into $\hat{z}$ via another stack of mLSTM layers. Here, we use a larger number of mLSTM layers (in practice, four) to increase capacity since unlike in the encoder, we find it infeasible to meaningfully re-incorporate the output subword embedding matrix, which could have potentially allowed reducing the number of layers in the decoder in a similar way as for the encoder.

**局部解码器.** 局部解码器 $\mathcal{D}$ 用另一组 mLSTM 层把反池化后的字节表示 $z$ 上下文化为 $\hat{z}$. 这里用更多的 mLSTM 层 (实际为四层) 来增加容量. 原因是与编码器不同, 我们找不到有意义的方式把输出子词嵌入矩阵重新接进来; 否则解码器也可能像编码器那样减少层数.

**Language Modeling Head.** The language modeling head LMHead converts the final byte representations $\hat{z}$ into scores interpretable as next-byte probabilities via a projection to the vocabulary space and softmax.

**语言建模头.** 语言建模头 LMHead 通过投影到词表空间再做 softmax, 把最终字节表示 $\hat{z}$ 转成可解释为下一字节概率的分数.

Overall, our modifications keep the total parameter count similar to the parameter count of the source subword-level LLM by removing the output embedding matrix but adding new parameters from the local encoder layers and local decoder layers. In practice, Bolmo 1B contains ∼10M fewer parameters than OLMo 2 1B (−0.7%), and Bolmo 7B contains ∼330M more parameters than Olmo 3 7B (+4.5%).

总的来说, 这些改动去掉了输出嵌入矩阵, 又加入局部编码器层与局部解码器层的新参数, 总参数量与源子词 LLM 相近. 实际上 Bolmo 1B 比 OLMo 2 1B 少约 10M 参数 (−0.7%), Bolmo 7B 比 Olmo 3 7B 多约 330M 参数 (+4.5%).

#### 3.1.1 Non-Causal Patch Boundary Prediction · 非因果 patch 边界预测

Prior LTLMs employ a causality constraint on the boundary predictions: the boundary predictor only uses past context to decide on whether to place a boundary.<sup>8</sup> At a glance, this seems necessary: we are aiming to predict the next byte, so we must not leak any information about it. However, although subword-level LLMs employ a causality constraint over the subword tokens, the subword tokens themselves do not depend exclusively on past context: subword tokenizers use information about future bytes to place token boundaries. To see this, let us interpret our subword tokenizer as a function which decides whether to place a token boundary after any byte, i.e. $\mathcal{B}(x): \{0, 1, .., 255\}^n \to \{0, 1\}^n$. Let us assume a vocabulary of English words and subwords, the example text `_Hello_Wor!`, which would typically be tokenized as {`_Hello`, `_Wor`, `!`}, and the position $i = |\texttt{\_Hello\_Wor}| - 1 = 9$. $\mathcal{B}(\texttt{\_Hello\_Wor!})_i = 1$ since there is a boundary after `r`. However, in the text `_Hello_World!`, which would be tokenized as {`_Hello`, `_World`, `!`}, we have $\mathcal{B}(\texttt{\_Hello\_World})_i = 0$, despite `_Hello_Wor![:i]` = `_Hello_World![:i]` = `_Hello_Wor`. In other words, although the subword-level LLM only uses past subword tokens to predict the next subword token, the subword tokens themselves are created by taking future context into account. In this case, this means deciding that `_Wor` should be a token in one case but not in the other, although the text up until that point is equivalent. Current LTLMs, in contrast, can not take future context into account. This creates a mismatch between the expressivity of LTLM boundary predictors and subword tokenizers. We modify the boundary predictor to resolve this mismatch. In particular, while prior boundary predictors are implemented as

此前的 LTLM 对边界预测施加因果约束: 边界预测器只用过去的上下文决定是否放边界<sup>8</sup>. 乍看这是必要的: 目标是预测下一个字节, 就不能泄露它的任何信息. 但子词 LLM 虽然对子词 token 施加因果约束, 子词 token 本身却不只依赖过去: 子词分词器会用未来字节的信息来放 token 边界. 把子词分词器看成一个函数, 决定每个字节之后是否放边界, 即 $\mathcal{B}(x): \{0, 1, .., 255\}^n \to \{0, 1\}^n$. 假设词表由英语词和子词组成, 例句 `_Hello_Wor!` 通常切成 {`_Hello`, `_Wor`, `!`}, 取位置 $i = |\texttt{\_Hello\_Wor}| - 1 = 9$. 因为 `r` 之后有边界, $\mathcal{B}(\texttt{\_Hello\_Wor!})_i = 1$. 而 `_Hello_World!` 切成 {`_Hello`, `_World`, `!`}, 此时 $\mathcal{B}(\texttt{\_Hello\_World})_i = 0$, 尽管两句到位置 $i$ 为止的前缀都是 `_Hello_Wor`. 也就是说, 子词 LLM 虽然只用过去的子词 token 预测下一个子词 token, 但子词 token 本身是考虑了未来上下文才切出来的. 这里的表现是: 截至该点文本完全相同, `_Wor` 却在一句里是 token, 在另一句里不是. 现有 LTLM 则无法考虑未来上下文. 这就造成了 LTLM 边界预测器与子词分词器表达力的不匹配. 我们修改边界预测器来消除它. 具体而言, 此前的边界预测器实现为

$$
\mathcal{B}(\hat{e})_t := f(\hat{e}_0, \hat{e}_1, .., \hat{e}_t)
$$

we implement our boundary predictor as

而我们实现为

$$
\mathcal{B}_{\text{Bolmo}}(\hat{e})_t := f(\hat{e}_0, \hat{e}_1, .., \hat{e}_t, \hat{e}_{t+1}).
$$


<sup>7</sup> We originally experimented with smaller local dimensions but found the upprojection mechanism to bottleneck performance by restricting the rank of the representations (see Appendix E).

<sup>7</sup> 我们最初试过更小的局部维度, 但发现升维投影会限制表示的秩, 成为性能瓶颈 (见附录 E).

<sup>8</sup> The causality constraint on boundaries is referred to as incrementality by Pagnoni et al. (2025).

<sup>8</sup> Pagnoni 等 (2025) 把边界上的因果约束称为增量性 (incrementality).

<!-- page 8 of 35 -->

![Figure 2](images/bolmo_architecture_comparison-cropped.png)

Figure 2 Subword-level LLMs non-causally set boundaries over the prefill using the external subword tokenizer, then implicitly predict boundaries alongside the text content during decoding (left). Prior byte-level LTLMs causally set boundaries with a light-weight boundary predictor during both prefill and decoding (middle). We restore the expressivity of subword-level LLM boundaries by non-causally predicting boundaries for the prefill, then predicting whether a boundary occurs alongside the next byte during decoding (right).

That is, we use up to one byte of future context. Concretely, we parametrize our boundary predictor as

也就是说, 我们最多使用一个字节的未来上下文. 具体地, 边界预测器参数化为

$$
\mathcal{B}_{\text{Bolmo}}(\hat{e})_t := \frac{1}{2}\left(1 - \frac{(W_q \hat{e}_{t+1})^T (W_k \hat{e}_t)}{\|W_q \hat{e}_{t+1}\| \|W_k \hat{e}_t\|}\right) \in [0, 1],
$$

i.e., we compute the cosine distance between a projection of the representation of the current byte and the byte one position in the future. An equivalent parametrization, although using the current byte and one byte before, is used by Hwang et al. (2025). Taking one future byte into account largely resolves the mismatch between subword tokenizers and LTLM tokenization.<sup>9</sup> As shown in Figure 2, taking future context into account can also make patches more semantically coherent: for example, in the case of texts containing compounds such as `the flowerbed`, a boundary predictor has three intuitive options: (i) make the entire compound a single patch `flowerbed`, (ii) place a patch boundary after `r` to create the patch `flower`, or (iii) place a patch boundary after `b` (once it is evident this is a compound word) to create `flowerb`. Option (ii) is arguably the semantically most coherent one,<sup>10</sup> however, for a causal boundary predictor, this would mean having to place a patch boundary after `r` for every text starting with `the flower`, including e.g. `the flowers`, while a non-causal one can adjust based on future context. The byteification strategy of Hwang et al. (2025) supervises based on option (iii), i.e. predicting the start of the next subword token instead of the end of the previous one, which would create a patch `flowerb` as shown in Figure 2.

即计算当前字节表示的投影与下一位置字节表示的投影之间的余弦距离. Hwang 等 (2025) 用的是等价的参数化, 只是比较当前字节和前一个字节. 考虑一个未来字节基本消除了子词分词器与 LTLM 分词之间的不匹配<sup>9</sup>. 如图 2 所示, 考虑未来上下文还能让 patch 语义更连贯. 例如文本中出现复合词 `the flowerbed` 时, 边界预测器有三种直观选择: (i) 整个复合词作为一个 patch `flowerbed`; (ii) 在 `r` 之后放边界, 得到 patch `flower`; (iii) 在 `b` 之后 (确认是复合词时) 放边界, 得到 `flowerb`. 选项 (ii) 可以说语义最连贯<sup>10</sup>, 但对因果边界预测器来说, 这意味着凡是以 `the flower` 开头的文本 (包括 `the flowers`) 都得在 `r` 之后放边界, 非因果预测器则能根据未来上下文调整. Hwang 等 (2025) 的字节化策略按选项 (iii) 监督, 即预测下一个子词 token 的起点, 而非上一个的终点, 这会产生图 2 中的 patch `flowerb`.

Output Boundary Prediction. While using future context is fine for prefilling, we need to know whether to place a boundary without observing the next byte for decoding. We thus add a special symbol `<b>` to the

**输出边界预测.** prefill 时使用未来上下文没有问题, 但解码时需要在看不到下一个字节的情况下决定是否放边界. 因此我们往

<sup>9</sup> Subword tokenizers in principle have unrestricted access to the future, while we use a single byte. In practice, we find one byte of lookahead largely sufficient to match the behavior of subword tokenization. However, we believe future work on larger (or unrestricted) lookaheads could be fruitful.

<sup>9</sup> 子词分词器原则上可以不受限地看未来, 我们只用一个字节. 实践中一个字节的前瞻基本足以匹配子词分词的行为. 不过我们认为未来研究更大 (或不受限) 的前瞻可能有收获.

<sup>10</sup> It is not clear whether human notions such as semantic coherence or faithfulness to linguistics should play a role in designing language models, see e.g. Beinborn and Pinter (2023); Minixhofer et al. (2023).

<sup>10</sup> 语义连贯, 忠于语言学这类人的观念是否应在设计语言模型时起作用, 目前并不清楚.

<!-- page 9 of 35 -->

vocabulary and let the local decoder learn to emit `<b>` at the end of every patch (the local encoder, in contrast, never sees `<b>`).<sup>11</sup> In effect, we end up with two boundary predictors: the boundary predictor $\mathcal{B}$ ingesting the shallowly contextualized representations from the local encoder with future context (used during prefill), and a boundary predictor as part of the language modeling head ingesting deeply contextualized representations from the local decoder without future context (used during decoding). Notably, this is precisely equivalent to what happens in subword-level LLMs: the prefill is tokenized using the external subword tokenizer (analogous to the boundary predictor $\mathcal{B}$), and output boundaries `<b>` are implicitly predicted alongside the text contents of every subword token upon decoding (analogous to our output boundary predictor) as illustrated in Figure 2.

词表里加一个特殊符号 `<b>`, 让局部解码器学会在每个 patch 末尾输出 `<b>` (局部编码器则从不看到 `<b>`)<sup>11</sup>. 结果是有两个边界预测器: 一个是边界预测器 $\mathcal{B}$, 输入局部编码器给出的浅层上下文化表示, 带未来上下文, 用于 prefill; 另一个是语言建模头的一部分, 输入局部解码器给出的深层上下文化表示, 不带未来上下文, 用于解码. 这与子词 LLM 的做法完全对应: prefill 由外部子词分词器切分 (对应边界预测器 $\mathcal{B}$), 解码时输出边界 `<b>` 随每个子词 token 的文本内容一起被隐式预测 (对应我们的输出边界预测器), 如图 2 所示.

**Boundary Symbol Fusion.** Since we are aiming to predict the symbol `<b>` after every patch, our local decoder is turned from an isotropic model to a transducer from $\mathbb{R}^{n\times d} \to \mathbb{R}^{(n+k)\times d}$, i.e., the local decoder needs to process $k$ more positions. Although this overhead is not prohibitive in principle, it makes it difficult to compare models which use output boundary prediction and models which do not. We thus make it effectively zero-cost by doubling our byte vocabulary size from 256 to 512, for every byte adding a version of the same byte followed by a boundary. The goal of the local decoder, then, is to predict the current byte and whether it is followed by a boundary at every step. Fusing the boundary symbol turns the local decoder back into an isotropic model. The only remaining overhead is that the softmax has to be applied over a set of 512 instead of 256 output tokens, which is negligible.

**边界符号融合.** 由于要在每个 patch 之后预测符号 `<b>`, 局部解码器从各向同性 (输入输出等长) 的模型变成了 $\mathbb{R}^{n\times d} \to \mathbb{R}^{(n+k)\times d}$ 的转换器, 即要多处理 $k$ 个位置. 这个开销原则上不算大, 但会让使用与不使用输出边界预测的模型难以比较. 因此我们把字节词表从 256 翻倍到 512, 给每个字节加一个「该字节后接边界」的版本, 使这项开销实际为零. 局部解码器每一步的目标就变成预测当前字节, 以及它后面是否接边界. 融合边界符号让局部解码器回到各向同性. 唯一剩下的开销是 softmax 要在 512 个而不是 256 个输出符号上计算, 可以忽略.

**On end-to-end learning of non-causal boundaries.** Hwang et al. (2025) train the boundary predictor end-to-end by incorporating it in the computation graph through (i) smoothing of the contextualized global representations $\hat{h}$ using the boundary scores and (ii) a straight-through estimator of the boundary scores applied to the depooled representations $z$. Training the boundary predictor end-to-end in this style is not immediately possible using our non-causal formulation. This is the case since (i) our output boundary predictor would need to estimate the precise boundary score assigned by the boundary predictor for decoding, instead of only predicting whether a boundary occurs or not and (ii) relatedly, instead of the single bit of information leaked by discrete boundary predictions, the model can learn to leak 16 bits of information (assuming we use bfloat16) about the next byte, which is enough to uniquely identify it. This could cause the model to learn degenerate solutions by exploiting the boundary scores to pass information about the future to the local decoder. In this work, we thus focus exclusively on strategies to train the boundary predictor with external supervision instead, which we believe have been underutilized in prior work.

**关于端到端学习非因果边界.** Hwang 等 (2025) 把边界预测器接进计算图来端到端训练: (i) 用边界分数平滑上下文化的全局表示 $\hat{h}$; (ii) 对反池化表示 $z$ 施加边界分数的直通估计器 (STE). 在我们的非因果形式下, 无法直接这样端到端训练. 原因有二: (i) 解码时输出边界预测器得估计边界预测器给出的精确分数, 而不只是预测有无边界; (ii) 与此相关, 离散边界预测只泄露 1 bit 信息, 而连续分数能让模型学会泄露下一个字节的 16 bit 信息 (假设用 bfloat16), 足以唯一确定它. 模型可能因此学到退化解, 借边界分数把未来信息传给局部解码器. 所以本文只研究用外部监督训练边界预测器的策略, 我们认为这类策略在此前工作中用得不够.

### 3.2 Byteifying Procedure · 字节化流程

We byteify by initializing the parameters of the global model from the subword-level LLM checkpoint, while parameters of the local models and the LM head are initialized randomly. Our byteifying procedure consists of two stages. In the first stage, we aim to quickly learn weights for the local encoder, local decoder, boundary predictor and LM head which exactly recover the behavior of the subword-level LLM. The parameters of the global model stay frozen in this stage. In the second stage, we train the entire model to let it learn to utilize byte-level information, while also optionally increasing the target compression ratio of bytes per patch.

字节化时, 全局模型参数从子词 LLM 的 checkpoint 初始化, 局部模型和 LM head 的参数随机初始化. 流程分两个阶段. 第一阶段的目标是快速学出局部编码器, 局部解码器, 边界预测器和 LM head 的权重, 让它们精确复现子词 LLM 的行为, 此阶段全局模型参数冻结. 第二阶段训练整个模型, 让它学会利用字节级信息, 并可选地提高每 patch 字节数的目标压缩率.

#### 3.2.1 Stage 1: Subword-to-Byte Distillation · 阶段 1: 子词到字节的蒸馏

The aim of the first stage is quickly learning weights for the local encoder, local decoder, boundary predictor and LM head which recover the behavior of the subword model. Efficiency is crucial; the cost of this stage should be minimal to permit fast experimentation and allow increasing the investment into Stage 2. To achieve these goals, we design a Stage 1 procedure which allows learning the desired weights without fully backpropagating through the global model. This substantially reduces the time per training step (see Appendix F). The Stage 1 loss is minimal if and only if the byte-level model exactly mimics the source subword-level LLM. It is composed of three parts.

第一阶段要快速学出能复现子词模型行为的局部编码器, 局部解码器, 边界预测器和 LM head 权重. 效率很关键: 这一阶段成本要尽量低, 以便快速实验, 并把更多投入留给阶段 2. 为此我们设计的阶段 1 流程不需要在全局模型上完整反向传播就能学到所需权重, 大幅缩短了每步训练时间 (见附录 F). 阶段 1 的损失当且仅当字节级模型精确模仿源子词 LLM 时取最小. 它由三部分组成.

<sup>11</sup> It is worth noting that predicting the boundary symbol `<b>` is analogous to the output boundary prediction in Fleshman and Durme (2023), although the motivation differs.

<sup>11</sup> 预测边界符号 `<b>` 与 Fleshman 和 Durme (2023) 的输出边界预测相对应, 只是动机不同.

<!-- page 10 of 35 -->

**Quickly Learning a Boundary Predictor $\mathcal{B}_{\text{Bolmo}}$.** We train the boundary predictor to emulate the boundaries placed by subword tokenization via a binary cross-entropy loss, i.e.,

**快速学习边界预测器 $\mathcal{B}_{\text{Bolmo}}$.** 我们用二元交叉熵损失训练边界预测器, 让它模仿子词分词放置的边界:

$$
\mathcal{L}_\mathcal{B} := - \sum_t \left(\mathcal{B}_{\text{subword}}(x)_t \log \mathcal{B}_\text{Bolmo}(\hat{e})_t + (1 - \mathcal{B}_{\text{subword}}(x)_t) \log (1 - \mathcal{B}_\text{Bolmo}(\hat{e})_t)\right),
$$

where $\mathcal{B}_{\text{subword}}(x)$ is 1 for every byte at the last position of a subword patch, otherwise 0. The boundary predictor $\mathcal{B}_{\text{Bolmo}}$ utilizing future context to tokenize the prefill text quickly achieves >99% accuracy.

其中 $\mathcal{B}_{\text{subword}}(x)$ 在每个子词 patch 的最后一个字节处为 1, 其余为 0. 利用未来上下文给 prefill 文本分词的 $\mathcal{B}_{\text{Bolmo}}$ 很快达到 99% 以上的准确率.

**Quickly Learning a Local Encoder $\mathcal{E}$.** Assuming our boundary predictor perfectly emulates subword tokenization, our local encoder and pooling mechanism will be a perfect substitute for the subword embedding matrix if they yield the same input to the global model as the subword embedding matrix for every patch. This is the case if all pooled representations $\text{Pool}(\hat{e}, \mathcal{B}_{\text{Bolmo}}(\hat{e}))$ are equal to the corresponding subword embeddings $\mathcal{T}_{\text{Subword}}(x)$. Hwang et al. (2025) optimize toward this goal by directly minimizing the L2 distance of every pooled representation to the corresponding subword embedding. We take an alternative approach inspired by research on model stitching which shows that similar representations do not necessarily propagate through subsequent layers in a similar way (Athanasiadis et al., 2025). We propagate the pooled representations through $n$ layers of the global model and minimize L2 distance to the subword representations which result from propagating the subword embeddings through the same $n$ layers,

**快速学习局部编码器 $\mathcal{E}$.** 假设边界预测器完美模仿了子词分词, 那么只要局部编码器加池化对每个 patch 给全局模型的输入都与子词嵌入矩阵相同, 它们就能完美替代子词嵌入矩阵. 条件是所有池化表示 $\text{Pool}(\hat{e}, \mathcal{B}_{\text{Bolmo}}(\hat{e}))$ 都等于对应的子词嵌入 $\mathcal{T}_{\text{Subword}}(x)$. Hwang 等 (2025) 直接最小化每个池化表示与对应子词嵌入的 L2 距离来逼近这个目标. 我们换了一种做法, 受模型拼接 (model stitching) 研究启发: 相似的表示经过后续层后未必仍然相似. 我们把池化表示送过全局模型的前 $n$ 层, 最小化它与子词嵌入经过同样 $n$ 层后的表示之间的 L2 距离:

$$
\mathcal{L}_\mathcal{E} := \| \mathcal{M}_{:n}(\text{Pool}(\mathcal{E}(\hat{e}, \mathcal{B}_\text{subword}(x))) - \mathcal{M}_{:n}(\mathcal{T}_\text{subword}(x)) \|.
$$

Notably, we pool the local encoder representations using the true subword boundaries $\mathcal{B}_{\text{subword}}$ instead of $\mathcal{B}_{\text{Bolmo}}$.<sup>12</sup> $\mathcal{M}_{:n}$ indicates the global model up to and including the $n$-th layer. The weights of $\mathcal{M}$ are kept frozen. If $n = 0$, this reduces to the setting of Hwang et al. (2025). Although choosing $n > 0$ necessitates backpropagating through some parts of the global model, we can minimize the resulting cost by choosing a small $n$. We find $n = 4$ to strike a good balance between performance and efficiency, substantially outperforming $n = 0$ while remaining cheap to compute.

注意, 池化局部编码器表示时用的是真实子词边界 $\mathcal{B}_{\text{subword}}$, 而非 $\mathcal{B}_{\text{Bolmo}}$<sup>12</sup>. $\mathcal{M}_{:n}$ 表示全局模型直到第 $n$ 层 (含) 的部分. $\mathcal{M}$ 的权重保持冻结. $n = 0$ 时退化为 Hwang 等 (2025) 的设定. 取 $n > 0$ 需要在全局模型的一部分上反向传播, 但取较小的 $n$ 可以把成本压低. 我们发现 $n = 4$ 在性能与效率间取得良好平衡, 明显优于 $n = 0$, 计算仍然便宜.

**Quickly Learning a Local Decoder $\mathcal{D}$.** Our local decoder and LM head are optimal if our byte-level LLM assigns the same likelihood as the subword model to every text $x$. Assuming equal patch boundaries, it is optimal if the likelihood of every patch is equal. Since subword-level LLMs implicitly predict output patch boundaries, we cannot easily compute comparable patch likelihoods in byte-level models without output boundary prediction. In this case, we would have to resort to approximations as in Minixhofer et al. (2025b). However, since Bolmo does predict output patch boundaries, simply comparing the likelihoods of every patch results in an exact objective (i.e., a loss which is minimal if and only if both models are the same),

**快速学习局部解码器 $\mathcal{D}$.** 如果字节级 LLM 对每段文本 $x$ 给出的似然都与子词模型相同, 局部解码器和 LM head 就是最优的. 在 patch 边界相同的前提下, 只要每个 patch 的似然相等即可. 子词 LLM 隐式预测输出 patch 边界, 所以没有输出边界预测的字节级模型很难算出可比的 patch 似然, 只能像 Minixhofer 等 (2025b) 那样用近似. 而 Bolmo 确实预测输出 patch 边界, 直接比较每个 patch 的似然就得到一个精确目标 (即当且仅当两个模型相同时损失最小):

$$
\mathcal{L}_{\mathcal{D},\text{Distill}} := \sum_i f\left(\prod_{j \in T(x, i)} \text{LMHead}(\hat{z}_{\text{subword}})[j, \text{next\_byte}(x, j)],\ \text{LMHead}_\text{subword}(z_\text{subword})[i, \text{next\_tok}(x, i)]\right),
$$

where $j \in T(x, i)$ indicates all byte indices $j$ which are part of the $i$-th subword patch; this includes the indices of the special `<b>` symbol if treated as separate, or the indices of the 256 special symbols consisting of a byte plus `<b>` if fused. $\text{next\_tok}(..)$ and $\text{next\_byte}(..)$ map to the index in the vocabulary of the symbol occurring after the current symbol (token or byte), including special symbols.<sup>13</sup> $z_\text{subword} = \mathcal{M}(\mathcal{T}_\text{subword}(x))$ are the representations of the subword model at the final layer, $\hat{z}_\text{subword} = \mathcal{D}(\text{Depool}(\hat{e}, z_\text{subword}, p))$ is the result of passing these representations through the depooling layer and the local decoder, and $\text{LMHead}_\text{subword}$ is the LM head of the source subword-level LLM. As the comparison function $f$, we choose the temperature-modulated binary cross-entropy,

其中 $j \in T(x, i)$ 表示属于第 $i$ 个子词 patch 的所有字节下标 $j$; 若 `<b>` 单独处理, 也包括它的下标, 若融合, 则包括 256 个「字节加 `<b>`」特殊符号的下标. $\text{next\_tok}(..)$ 和 $\text{next\_byte}(..)$ 映射到当前符号 (token 或字节) 之后那个符号在词表中的下标, 包括特殊符号<sup>13</sup>. $z_\text{subword} = \mathcal{M}(\mathcal{T}_\text{subword}(x))$ 是子词模型最后一层的表示, $\hat{z}_\text{subword} = \mathcal{D}(\text{Depool}(\hat{e}, z_\text{subword}, p))$ 是这些表示经过反池化层和局部解码器的结果, $\text{LMHead}_\text{subword}$ 是源子词 LLM 的 LM head. 比较函数 $f$ 取带温度的二元交叉熵:

<sup>12</sup> Using the true subword boundaries instead of the boundaries predicted by $\mathcal{B}_{\text{Bolmo}}$ is necessary to preserve the alignment of the pooled representations to the representations in $\mathcal{T}_{\text{subword}}(x)$ along the sequence dimension.

<sup>12</sup> 必须用真实子词边界而非 $\mathcal{B}_{\text{Bolmo}}$ 预测的边界, 才能在序列维度上保持池化表示与 $\mathcal{T}_{\text{subword}}(x)$ 中表示的对齐.

<sup>13</sup> For example, $-\log \text{LMHead}_\text{subword}(..(x))[i, \text{next\_tok}(x, i)]$ is the cross-entropy of the subword model.

<sup>13</sup> 例如 $-\log \text{LMHead}_\text{subword}(..(x))[i, \text{next\_tok}(x, i)]$ 就是子词模型的交叉熵.

<!-- page 11 of 35 -->

$$
f(\hat{y} \;\|\; y) := - \left(y^{1/\tau} \log \hat{y}^{1/\tau} + (1 - y^{1/\tau}) \log (1 - \hat{y}^{1/\tau})\right),
$$

with $\tau=5$ as recommended by Minixhofer et al. (2025b). In practice, we conduct the operations involved in the computation of $\mathcal{L}_\mathcal{D}$ in log-space to ensure stable numerics. We optionally combine the distillation loss $\mathcal{L}_{\mathcal{D},\text{Distill}}$ with a cross-entropy loss to encourage modeling the training data well and to already start exploiting byte-level information,

其中 $\tau=5$, 按 Minixhofer 等 (2025b) 的推荐取值. 实际计算 $\mathcal{L}_\mathcal{D}$ 时在对数空间进行, 保证数值稳定. 我们还可以把蒸馏损失 $\mathcal{L}_{\mathcal{D},\text{Distill}}$ 与交叉熵损失组合, 促使模型拟合训练数据, 并提前开始利用字节级信息:

$$
\mathcal{L}_{\mathcal{D},\text{CE}} := \sum_j -\log \text{LMHead}(\hat{z}_\text{subword})[j, \text{next\_byte}(x, j)].
$$

**Putting It Together.** In principle, the boundary predictor and local encoder on the one hand, and the local decoder and LM head on the other, could be trained separately (assuming we stop the gradient to the encoder through $\hat{z}_\text{subword}$). Although there may be scenarios where this is beneficial, we choose to train them together for simplicity. The complete Stage 1 loss is given by

**合在一起.** 原则上, 边界预测器加局部编码器是一组, 局部解码器加 LM head 是另一组, 两组可以分开训练 (前提是截断经 $\hat{z}_\text{subword}$ 流向编码器的梯度). 某些场景下分开训练可能有好处, 但为了简单我们一起训. 完整的阶段 1 损失为

$$
\mathcal{L}_{\text{Stage1}} := \lambda_\mathcal{B} \mathcal{L}_\mathcal{B} + \lambda_\mathcal{E} \mathcal{L}_\mathcal{E} + \lambda_{\mathcal{D},\text{Distill}} \mathcal{L}_{\mathcal{D},\text{Distill}} + \lambda_{\mathcal{D},\text{CE}} \mathcal{L}_{\mathcal{D},\text{CE}},
$$

where $\lambda_\mathcal{B}, \lambda_\mathcal{E}, \lambda_{\mathcal{D},\text{Distill}}, \lambda_{\mathcal{D},\text{CE}} \in \mathbb{R}$ are the loss weights which we set $\lambda_\mathcal{B} = 4$, $\lambda_\mathcal{E} = 1$, $\lambda_{\mathcal{D},\text{Distill}} = 1$, $\lambda_{\mathcal{D},\text{CE}} = 1$. Stage 1 needs in total one forward pass through all layers and one backward pass through the first $n$ layers of the global model, plus forward and backward passes through local encoder, local decoder, boundary predictor and LM head. This makes Stage 1 substantially more efficient than training the entire model. It could also be further optimized by quantizing or applying inference-specific optimizations to the global model layers starting from the $(n+1)$-th layer (which we do not need to backpropagate through). We analyze the difference between inserting Stage 1 and directly training the entire model end-to-end with randomly initialized parameters (besides the global model) later in Section 6.2. Besides performance improvements, Stage 1 provides a vehicle for rapid experimentation: We can conduct Stage 1 training to rapidly check whether a particular architecture for the local encoder and decoder has sufficient capacity to emulate the input and output embedding matrices, respectively. We use this to guide the architecture search for Bolmo under the hypothesis that byte-level architectures which can not emulate the subword model after Stage 1 will remain inadequate with further Stage 2 training.

其中 $\lambda_\mathcal{B}, \lambda_\mathcal{E}, \lambda_{\mathcal{D},\text{Distill}}, \lambda_{\mathcal{D},\text{CE}} \in \mathbb{R}$ 是损失权重, 取 $\lambda_\mathcal{B} = 4$, $\lambda_\mathcal{E} = 1$, $\lambda_{\mathcal{D},\text{Distill}} = 1$, $\lambda_{\mathcal{D},\text{CE}} = 1$. 阶段 1 总共需要全局模型所有层的一次前向, 前 $n$ 层的一次反向, 加上局部编码器, 局部解码器, 边界预测器和 LM head 的前向与反向. 这让阶段 1 比训练整个模型高效得多. 从第 $(n+1)$ 层起的全局模型层不需要反向传播, 还可以对它们做量化或其他推理专用优化来进一步提速. 6.2 节分析插入阶段 1 与直接端到端训练整个模型 (全局模型以外的参数随机初始化) 的差别. 除了提升性能, 阶段 1 还是快速实验的手段: 用阶段 1 训练可以很快检查某种局部编码器和解码器架构是否有足够容量分别模仿输入和输出嵌入矩阵. 我们用它指导 Bolmo 的架构搜索, 依据的假设是: 阶段 1 之后仍无法模仿子词模型的字节级架构, 继续做阶段 2 训练也不会合格.

`bolmo_scripts/launch_stage1_7b.sh` 里 `loss_weights=[1,1,1,4]` 对应 (编码器, CE, 蒸馏, 边界), 与正文一致. 但编码器损失内部另有 `encoder_loss_no_lookahead_weight=0.0` 和 `encoder_loss_lookahead_weights=[0.0,0.0,0.0,4.0]`, 即 $n=0$ 那一项权重为 0, 只用第 4 层输出, 且再乘 4, 第 4 层表示损失的有效权重是 4. 蒸馏项用 `div_fn=kl` 与 `binarization_temp=5.0`, 二元 KL 与上面的温度二元交叉熵只差教师侧的熵 (对学生是常数), 梯度相同. 脚本还开了 `do_alm_debiasing=true`, 给教师与学生两侧 patch 的对数概率各加一项「下一个符号属于空格类」的 logsumexp, 这一项在 $\mathcal{L}_{\mathcal{D},\text{Distill}}$ 的式子里没有出现.

#### 3.2.2 Stage 2: End-to-End Training · 阶段 2: 端到端训练

In the second stage, we train the entire model end-to-end, retaining only the boundary loss $\mathcal{L}_\mathcal{B}$ and the cross-entropy loss $\mathcal{L}_{\mathcal{D},\text{CE}}$. For $\mathcal{L}_{\mathcal{D},\text{CE}}$, we substitute the depooled representations $\hat{z}_\text{subword}$ of the subword model representations with the true depooled representations $\hat{z}$, referring to this loss as $\mathcal{L}_{\text{CE}}$,

第二阶段端到端训练整个模型, 只保留边界损失 $\mathcal{L}_\mathcal{B}$ 和交叉熵损失 $\mathcal{L}_{\mathcal{D},\text{CE}}$. 对 $\mathcal{L}_{\mathcal{D},\text{CE}}$, 把基于子词模型表示的反池化表示 $\hat{z}_\text{subword}$ 换成真实的反池化表示 $\hat{z}$, 这个损失记为 $\mathcal{L}_{\text{CE}}$:

$$
\mathcal{L}_\text{Stage2} := \lambda_{\mathcal{B}} \mathcal{L}_\mathcal{B} + \lambda_{\text{CE}} \mathcal{L}_\text{CE}.
$$

We now optimize all parameters, including those of the global model $\mathcal{M}$. This stage is intended for the model to adjust to the end-to-end setting, since in Stage 1 we assumed a local encoder and boundary predictor perfectly emulating the subword model, which, although close, is not true in practice. The global model can learn to exploit the new byte-level information in Stage 2, and optionally be trained with higher compression ratios of bytes per patch (see Section 5.1).

此时优化所有参数, 包括全局模型 $\mathcal{M}$ 的参数. 这一阶段让模型适应端到端设定: 阶段 1 假设局部编码器和边界预测器完美模仿子词模型, 实际虽然接近, 但并不成立. 阶段 2 中全局模型可以学会利用新的字节级信息, 也可以选择用更高的每 patch 字节压缩率训练 (见 5.1 节).

## 4 Experiment Setup · 实验设置

**Data** The Bolmo data mix consists of ∼172B tokens<sup>14</sup> from the Dolma 3 pretraining data mix (Olmo Team, 2025), augmented with 75M tokens of CUTE-style data (Edman et al., 2024), sampled so as not to overlap with the CUTE test set, to encourage character understanding (see Appendix C for details). Training runs for less than one epoch on this mix.

**数据** Bolmo 数据混合包含来自 Dolma 3 预训练混合的约 172B token<sup>14</sup>, 外加 75M token 的 CUTE 风格数据, 采样时避开 CUTE 测试集, 用来促进字符理解 (详见附录 C). 训练在这个混合上不到一个 epoch.

<sup>14</sup> We count tokens as tokenized by the Dolma2 Tokenizer.

<sup>14</sup> token 数按 Dolma2 分词器的切分计算.

<!-- page 12 of 35 -->

**Model.** We use the pretrained Olmo 3 7B checkpoint after mid-training and long-context extension (Olmo Team, 2025) as our starting point for byteifying into Bolmo. For the local models, we use stacks of alternating mLSTM (Beck et al., 2025a) and feedforward layers of size 1 and 4 for the encoder and decoder, respectively. See Appendix F for details on the architecture.

**模型.** 字节化的起点是经过中期训练和长上下文扩展的 Olmo 3 7B 预训练 checkpoint. 局部模型用 mLSTM 与前馈层交替堆叠, 编码器 1 层, 解码器 4 层. 架构细节见附录 F.

**Training.** For Stage 1, we train on a total of 9.8B tokens (≈43B bytes). In this stage, we train the local encoder, decoder, boundary predictor and LM head, keeping the global model frozen. For Stage 2, we train the entire model on a total of 39.3B tokens (≈173B bytes). See Appendix F for detailed training hyperparameters.

**训练.** 阶段 1 共训练 9.8B token (约 43B 字节), 训练局部编码器, 解码器, 边界预测器和 LM head, 全局模型冻结. 阶段 2 在共 39.3B token (约 173B 字节) 上训练整个模型. 详细超参数见附录 F.

**Baseline.** We compare against the Olmo 3 7B checkpoint with continued training on the Bolmo training data such that the amount of total gradient updates to the global model parameters is the same (i.e., on 39.3B tokens) to disentangle the effects of continued training with the same architecture and byteification.

**基线.** 我们与在 Bolmo 训练数据上继续训练的 Olmo 3 7B checkpoint 对比, 使全局模型参数接受的梯度更新总量相同 (即 39.3B token), 以区分「同架构继续训练」与「字节化」各自的影响.

**Ablations and Development.** We developed Bolmo primarily through experiments on OLMo 2 (OLMo et al., 2025). We optimized decisions around the architecture through quick Stage 1 training runs on OLMo 2 1B or 7B. Our byteifying procedure was then applied without adjustments to Olmo 3 7B. Since there is currently no 1B version of Olmo 3, we conduct experiments requiring larger sweeps across training configurations on OLMo 2 1B.

**消融与开发.** Bolmo 主要在 OLMo 2 上开发. 架构相关的决定通过在 OLMo 2 1B 或 7B 上快速跑阶段 1 来优化, 之后字节化流程不做调整地用到 Olmo 3 7B 上. 目前没有 1B 版本的 Olmo 3, 所以需要大范围扫训练配置的实验都在 OLMo 2 1B 上做.

**Evaluation.** We create the Bolmo 7B evaluation suite based on Olmo Team (2025)'s OlmoBaseEval, skipping GSM Symbolic and BigCodeBench due to their size, and adding CUTE (Edman et al., 2024) and EXECUTE (Edman et al., 2025) to measure character understanding in English and across other languages, respectively. We create the Bolmo 1B evaluation suite based on Olmo Team (2025)'s Base Easy Suite, again adding CUTE (Edman et al., 2024) to measure character understanding. For the Bolmo 1B suite, we define a set of core tasks consisting of ARC (Clark et al., 2018), MMLU (Hendrycks et al., 2021), CSQA (Talmor et al., 2019), HellaSwag (Zellers et al., 2019), WinoGrande (Sakaguchi et al., 2020), SocialIQA (Sap et al., 2019), PIQA (Bisk et al., 2020), the Basic Skills benchmark (Olmo Team, 2025) and CUTE (Edman et al., 2024) for use in ablations and sweeps (see Appendix B for details).

**评测.** Bolmo 7B 评测套件基于 Olmo Team (2025) 的 OlmoBaseEval, 因规模原因跳过 GSM Symbolic 和 BigCodeBench, 并加入 CUTE 和 EXECUTE, 分别衡量英语和其他语言的字符理解. Bolmo 1B 评测套件基于 Olmo Team (2025) 的 Base Easy Suite, 同样加入 CUTE. 对 1B 套件, 我们定义一组核心任务用于消融和参数扫描: ARC, MMLU, CSQA, HellaSwag, WinoGrande, SocialIQA, PIQA, Basic Skills 和 CUTE (详见附录 B).

## 5 Main Results · 主要结果

**Bolmo 7B Results.** Table 1 compares Bolmo 7B with existing byte-level LLMs of comparable size: EvaByte 6.5B (Zheng et al., 2025b), TFree-Hat 7B (Neitemeier et al., 2025) and BLT 7B (Pagnoni et al., 2025), as well as the source Olmo 3 model (Olmo Team, 2025). Bolmo 7B performs best among all publicly known byte-level models in every category, including code, math, multiple-choice QA, and character understanding. As the only exception, Bolmo 7B slightly trails TFree-Hat 7B in the GenQA category (70.9 vs. 71.3). Bolmo 7B also comes close to matching the performance of the source Olmo 3 model (which is itself competitive with other subword-level LLMs of comparable size; see Olmo Team, 2025). The remaining gap to Olmo 3 is largely not specific to byteifying; it can be attributed to continued training in general, see Appendix A.

**Bolmo 7B 结果.** 表 1 把 Bolmo 7B 与同规模的现有字节级 LLM (EvaByte 6.5B, TFree-Hat 7B, BLT 7B) 以及源模型 Olmo 3 对比. 在所有公开的字节级模型中, Bolmo 7B 在每个类别上都最好, 包括代码, 数学, 多选问答和字符理解. 唯一的例外是 GenQA 类别略低于 TFree-Hat 7B (70.9 对 71.3). Bolmo 7B 也接近源模型 Olmo 3 的水平 (Olmo 3 本身与同规模的其他子词 LLM 有竞争力). 与 Olmo 3 剩下的差距大多不是字节化特有的, 可以归因于一般意义上的继续训练, 见附录 A.

On code, Bolmo 7B outperforms Olmo 3 due to higher pass@16 rates at generally slightly lower pass@1. This indicates that Bolmo 7B generates more diverse continuations than Olmo 3 under the given sampling settings, which are equivalent for both models (temperature = 0.6, top_p=0.6, see Appendix B). However, although promising, at this point we cannot conclude that byte-level models are fundamentally better suited to generating more diverse continuations, since we have not comprehensively explored the quality–diversity tradeoff at different points defined by different sampling strategies.

代码上, Bolmo 7B 超过 Olmo 3, 原因是 pass@16 更高, 而 pass@1 总体略低. 这说明在两者相同的采样设置下 (temperature = 0.6, top_p = 0.6, 见附录 B), Bolmo 7B 生成的续写比 Olmo 3 更多样. 这很有希望, 但目前还不能断定字节级模型从根本上更适合生成多样的续写, 因为我们没有全面考察不同采样策略对应的质量-多样性权衡.

The character understanding results are surprising, as Bolmo's accuracy vastly surpasses its subword-level counterpart. In fact, prior byte-level models do not outperform the subword Olmo 3 model. This could be explained by the hypothesis that character understanding is primarily acquired through scale (in terms of parameters and training tokens; Cosma et al., 2025), so although byte-level models should require less scale to acquire character understanding, the increased scale of Olmo 3—likely trained on substantially more tokens than the other models—might compensate for this.<sup>15</sup> In contrast, Bolmo 7B is trained with synthetic data

字符理解的结果出乎意料: Bolmo 的准确率远超对应的子词模型. 事实上此前的字节级模型都没有超过子词的 Olmo 3. 一种解释是字符理解主要靠规模 (参数量和训练 token 数) 习得: 字节级模型习得字符理解本应需要更小的规模, 但 Olmo 3 规模更大, 训练 token 很可能比其他模型多得多, 可能抵消了这一点<sup>15</sup>. 相比之下, Bolmo 7B 用了合成数据训练,

<sup>15</sup> Not all training token/byte counts of prior byte-level models are public.

<sup>15</sup> 此前字节级模型的训练 token / 字节数并未全部公开.

<!-- page 13 of 35 -->

Table 1 Results comparing Bolmo 7B to existing byte-level models of comparable size and the source subword model (Olmo 3 7B) on the Bolmo 7B evaluation suite. All models except Bolmo were trained from scratch. **Boldface** indicates the best result per task, <u>underline</u> the second best.

Bolmo 7B is fully open; EvaByte 6.5B, TFree-Hat 7B and BLT 7B are open-weight byte-level LMs; Olmo 3 7B is a subword LM.

|  | Bolmo 7B | EvaByte 6.5B | TFree-Hat 7B | BLT 7B | Olmo 3 7B |
|---|---|---|---|---|---|
| # Parameters (incl. Embed) | 7.63B | 6.49B | 7.19B | 10.55B | 7.30B |
| **Char** | **75.1** | 47.3 | 47.9 | 49.3 | <u>56.0</u> |
| CUTE | **78.6** | 50.8 | 54.2 | 52.3 | <u>56.9</u> |
| EXECUTE | **71.6** | 43.8 | 41.6 | 46.3 | <u>55.1</u> |
| **Code** | **40.7** | 31.2 | 36.9 | 31.6 | <u>39.5</u> |
| HumanEval pass@1/@16 | 40.6 / **74.7** | 34.7 / 49.1 | <u>41.1</u> / 61.4 | 31.5 / 44.7 | **49.0** / <u>71.1</u> |
| DeepSeek LeetCode pass@1/@16 | **2.3** / **7.6** | 1.6 / 3.3 | 0.9 / 4.6 | 1.2 / 4.8 | <u>1.6</u> / <u>6.2</u> |
| DS 1000 pass@1 | 14.9 | 7.1 | <u>18.2</u> | 17.0 | **20.1** |
| MBPP pass@1/@16 | 42.8 / **68.0** | 42.9 / <u>59.2</u> | **44.6** / <u>59.2</u> | 37.2 / 53.2 | <u>44.3</u> / 54.9 |
| MultiPL HumanEval pass@1/@16 | 26.8 / **62.5** | 16.8 / 31.8 | <u>26.9</u> / 49.7 | 24.1 / 43.7 | **33.6** / <u>56.3</u> |
| MultiPL MBPP pass@1/@16 | <u>38.0</u> / **69.2** | 36.5 / <u>60.5</u> | **38.8** / 60.3 | 36.0 / 54.6 | 37.8 / 59.9 |
| **Math** | <u>48.9</u> | 27.0 | 35.8 | 15.7 | **55.3** |
| GSM8K | <u>68.0</u> | 36.7 | 60.7 | 24.2 | **73.1** |
| MATH | <u>29.8</u> | 17.3 | 10.9 | 7.3 | **37.5** |
| **MC STEM** | <u>65.5</u> | 54.0 | 62.1 | 49.0 | **66.3** |
| ARC MC | 88.5 | 74.2 | **90.0** | 65.5 | <u>89.2</u> |
| MMLU STEM | <u>57.0</u> | 44.3 | 55.2 | 41.6 | **59.5** |
| MedMCQA MC | 47.8 | 37.9 | **51.5** | 37.6 | <u>48.2</u> |
| MedQA MC | **42.4** | 27.2 | 20.5 | 22.5 | <u>42.0</u> |
| SciQ MC | 91.9 | 86.6 | **93.3** | 77.8 | <u>92.8</u> |
| **MC Non-STEM** | <u>75.8</u> | 63.8 | 66.5 | 56.6 | **77.7** |
| MMLU Humanities | <u>67.2</u> | 52.7 | 57.4 | 52.2 | **69.2** |
| MMLU Social Sci. | <u>74.0</u> | 57.4 | 72.0 | 54.0 | **75.2** |
| MMLU Other | <u>65.1</u> | 50.9 | 65.0 | 49.3 | **66.9** |
| CSQA MC | 73.6 | **91.4** | <u>75.4</u> | 52.2 | 75.2 |
| PiQA MC | 79.4 | 65.3 | <u>79.8</u> | 62.9 | **80.3** |
| SocialIQA MC | 79.1 | <u>79.6</u> | 79.3 | 50.6 | **80.4** |
| CoQA Gen2MC MC | 90.0 | 63.2 | <u>91.2</u> | 71.4 | **92.9** |
| DROP Gen2MC MC | <u>59.1</u> | 41.1 | 24.9 | 31.0 | **62.5** |
| Jeopardy Gen2MC MC | 84.8 | 67.8 | **90.5** | 77.5 | <u>85.5</u> |
| NaturalQs Gen2MC MC | 65.9 | 43.8 | **70.7** | 50.1 | <u>69.6</u> |
| SQuAD Gen2MC MC | <u>95.8</u> | 88.8 | 25.8 | 71.0 | **96.8** |
| **GenQA** | 70.9 | 41.4 | <u>71.3</u> | 68.4 | **72.4** |
| HellaSwag RC | 78.8 | 70.1 | **82.8** | <u>81.1</u> | 77.8 |
| Winogrande RC | 85.5 | 78.2 | **88.2** | **88.2** | <u>85.7</u> |
| Lambada | <u>71.1</u> | 62.9 | 70.5 | **72.8** | 68.0 |
| Basic Skills | <u>89.6</u> | 82.7 | <u>89.6</u> | 84.5 | **90.0** |
| DROP | <u>65.2</u> | 7.8 | 48.6 | 38.8 | **71.5** |
| Jeopardy | 56.8 | 13.1 | **68.3** | <u>67.3</u> | 60.3 |
| NaturalQs | 28.6 | 5.4 | **34.3** | 29.2 | <u>32.6</u> |
| SQuAD | <u>91.6</u> | 35.9 | 88.6 | 85.2 | **93.5** |
| CoQA | 70.5 | 16.7 | <u>71.1</u> | 68.6 | **72.7** |

用 Code 下 6 行的 11 个数直接平均可以复现: Bolmo 为 $(40.6+74.7+2.3+7.6+14.9+42.8+68.0+26.8+62.5+38.0+69.2)/11 = 447.4/11 \approx 40.7$, Olmo 3 为 $434.3/11 \approx 39.5$. 也就是把 pass@1 和 pass@16 放在一起平均. 只取 6 个 pass@1, Bolmo 是 $165.4/6 \approx 27.6$, Olmo 3 是 $186.2/6 \approx 31.0$, 方向反过来. 正文说「pass@1 总体略低」, 其中 HumanEval 低 8.4, MultiPL HumanEval 低 6.8, DS 1000 低 5.2, 「略」字偏轻.

encouraging character understanding (Appendix C), which speeds up the acquisition of this skill. Bolmo 7B still outperforms Olmo 3 in a comparison where Olmo 3 had continued training on the Bolmo data mix for the same total amount of tokens (Appendix A), further suggesting that while character understanding is driven by scale, it emerges sooner in byte-level models.

这些数据鼓励字符理解 (附录 C), 加快了这一能力的习得. 即使让 Olmo 3 在 Bolmo 数据混合上继续训练同样多的 token (附录 A), Bolmo 7B 仍然胜过它, 这进一步表明字符理解虽然由规模驱动, 但在字节级模型中出现得更早.

**Bolmo 1B Results.** Table 2 compares Bolmo 1B (trained off of OLMo2 1B; OLMo et al., 2024) with existing byte-level models, including H-Net (for which no 7B checkpoint is available; Hwang et al., 2025) and BLT 1B. Although trained on the previous Olmo generation, Bolmo 1B is competitive with prior byte-level models of similar size, outperforming H-Net and slightly trailing behind BLT 1B, although BLT 1B has substantially more than one billion parameters since Pagnoni et al. (2025) do not count the hash embedding parameters.

**Bolmo 1B 结果.** 表 2 把 Bolmo 1B (从 OLMo2 1B 训来) 与现有字节级模型对比, 包括 H-Net (没有 7B checkpoint) 和 BLT 1B. Bolmo 1B 虽然基于上一代 Olmo, 仍与同规模的字节级模型有竞争力: 超过 H-Net, 略低于 BLT 1B. 不过 BLT 1B 的参数实际远多于十亿, 因为 Pagnoni 等 (2025) 没有计入哈希嵌入参数.

<!-- page 14 of 35 -->

Table 2 Results comparing Bolmo 1B to existing byte-level models of comparable size and the source subword model (OLMo2 1B) on the Bolmo 1B evaluation suite. All models except Bolmo were trained from scratch. **Boldface** indicates the best result per task, <u>underline</u> the second best.

Bolmo 1B is fully open; H-Net XL (1-stage), H-Net XL (2-stage) and BLT 1B are open-weight byte-level LMs; OLMo 2 1B is a subword LM.

|  | Bolmo 1B | H-Net XL (1-stage) | H-Net XL (2-stage) | BLT 1B | OLMo 2 1B |
|---|---|---|---|---|---|
| # Parameters (incl. Embed) | 1.47B | 1.27B | 1.60B | 4.53B | 1.48B |
| **Bolmo 1B Suite** | 58.2 | 52.5 | 53.2 | **58.5** | <u>58.3</u> |
| ARC | 59.0 | <u>61.8</u> | **62.3** | 59.9 | 61.4 |
| MMLU | 37.2 | 37.5 | 38.7 | **40.6** | <u>40.4</u> |
| CSQA | 64.2 | 61.4 | 62.4 | **69.2** | <u>66.0</u> |
| HellaSwag | 67.0 | 60.2 | 63.6 | **71.0** | <u>68.9</u> |
| WinoGrande | <u>65.7</u> | 58.9 | 60.9 | **67.0** | 65.2 |
| SocialIQA | <u>54.7</u> | 50.1 | 52.9 | 54.6 | **55.1** |
| PiQA | 74.9 | 73.6 | 74.0 | **77.3** | <u>76.4</u> |
| CoQA | **81.7** | 73.7 | 72.8 | **81.7** | <u>77.4</u> |
| DROP | <u>43.1</u> | 33.4 | 33.6 | 37.7 | **52.7** |
| Jeopardy | 69.6 | 72.3 | 70.8 | **79.5** | <u>76.4</u> |
| NaturalQs | 40.9 | 34.5 | 35.9 | <u>46.6</u> | **46.8** |
| SQuAD | <u>83.4</u> | 76.7 | 77.1 | 76.4 | **87.4** |
| SciQ | 85.0 | 85.8 | **88.3** | 87.0 | <u>87.5</u> |
| QASPER | <u>63.0</u> | <u>63.0</u> | 51.1 | 59.6 | **64.0** |
| Basic Skills | <u>73.3</u> | 55.9 | 58.5 | **78.0** | 72.9 |
| DBQA | 26.5 | **27.7** | <u>27.5</u> | <u>27.5</u> | 25.2 |
| ProtocolQA | <u>27.8</u> | **28.7** | 25.9 | **28.7** | <u>27.8</u> |
| Lambada | <u>65.2</u> | 48.1 | 49.4 | **65.9** | 60.1 |
| MedMCQA | 30.5 | 30.9 | <u>32.1</u> | **33.1** | 31.1 |
| MedQA | 26.1 | **29.3** | <u>28.2</u> | 26.2 | 28.0 |
| SciRIFF | <u>82.5</u> | 73.8 | 80.5 | 81.1 | **85.0** |
| CUTE | **60.0** | 17.4 | 24.2 | <u>37.6</u> | 27.5 |

Like Bolmo 7B, Bolmo 1B exhibits performance degradation compared to the source subword model on some tasks, e.g. −3.2% on MMLU. However, on other tasks, Bolmo 1B outperforms OLMo2 1B, e.g. +5.1% on Lambada, +3.3% on CoQA and +32.5% on CUTE.

与 Bolmo 7B 一样, Bolmo 1B 在部分任务上不如源子词模型, 例如 MMLU 低 3.2%. 但在另一些任务上超过 OLMo2 1B, 例如 Lambada 高 5.1%, CoQA 高 3.3%, CUTE 高 32.5%.

MMLU $37.2-40.4=-3.2$, Lambada $65.2-60.1=5.1$, CUTE $60.0-27.5=32.5$, 都对. CoQA 是 $81.7-77.4=4.3$, 正文写成 3.3, 差了 1 个点 (v1 也是 3.3). 另外表 2 的套件均值 Bolmo 1B 58.2, OLMo 2 1B 58.3, 源模型仍略高 0.1.

### 5.1 Training at Higher Compression Factors · 以更高压缩率训练

**Takeaway.** Byteified models can be sped up by adapting the external boundary supervision to encourage a higher number of bytes per patch during training. This creates a way to smoothly trade off efficiency and performance which does not exist for subword-level LLMs due to the softmax bottleneck.

**要点.** 调整外部边界监督, 在训练中鼓励更多的每 patch 字节数, 就能给字节化模型提速. 这提供了一种平滑权衡效率与性能的手段, 子词 LLM 因为 softmax 瓶颈没有这种手段.

A substantial advantage of LTLMs is — unlike subword-level LLMs — not to be restricted to a fixed, finite set of patches. So far, we have not exploited this advantage since our primary goal was mimicking the tokenization of the source subword model. We now investigate whether we can leverage the increased freedom in our choice of the patching strategy to train a faster model by encouraging a higher average number of bytes per patch. In particular, we experiment with ways to change the external boundary supervision from the original subword tokenization boundaries $\mathcal{B}_\text{subword}$ to a subset of those boundaries. We fix a compression ratio $t$ of target average bytes-per-patch. We then remove subword boundaries (i.e., merge subword tokens) of $\mathcal{B}_\text{subword}$ until the desired compression ratio is achieved. We experiment with three merging strategies.

LTLM 相对子词 LLM 的一大优势是不受固定有限 patch 集合的限制. 到目前为止我们没有利用这一点, 因为首要目标是模仿源子词模型的分词. 现在研究能否利用 patch 策略上更大的自由, 鼓励更高的平均每 patch 字节数, 训出更快的模型. 具体做法是把外部边界监督从原始子词分词边界 $\mathcal{B}_\text{subword}$ 改为这些边界的一个子集. 先固定目标平均每 patch 字节数, 即压缩率 $t$, 再从 $\mathcal{B}_\text{subword}$ 中移除子词边界 (即合并子词 token), 直到达到目标压缩率. 我们试了三种合并策略.

- **BPE.** We iteratively merge the most common pair of tokens as in Byte Pair Encoding (Sennrich et al., 2016). In contrast to conventional BPE, we apply BPE per-example instead of over the entire corpus.<sup>16</sup> This is inspired by the work of Feher et al. (2025), which has shown that it is possible to retrofit language models

- **BPE.** 像字节对编码 (BPE) 那样反复合并最常见的 token 对. 与常规 BPE 不同, 我们按样本而非在整个语料上做 BPE<sup>16</sup>. 这受 Feher 等 (2025) 启发, 他们证明可以改装语言模型,

<sup>16</sup> Although applying BPE per minibatch would also be possible we choose to apply it per-example to avoid nontrivial dependencies on the batch size.

<sup>16</sup> 也可以按小批量做 BPE, 但我们选择按样本做, 以免结果对 batch size 有复杂的依赖.

<!-- page 15 of 35 -->

![Figure 3](images/compression_vs_perf.png)

Figure 3 The task performance vs. efficiency Pareto frontier of (i) the source subword-level LLM with tokenizer transfer to SuperBPE to achieve higher compression in bytes per patch and (ii) Bolmo models with adapted boundary prediction to achieve higher compression (see Section 5.1). The subword-level LLM breaks off the frontier as the cost of the softmax starts to dominate for larger vocabulary sizes; byte-level LLMs take over the frontier at that point, as seen in the optimal region around the top-left corner.

to operate over BPE merges of the tokens in their vocabulary.

使其在词表 token 的 BPE 合并结果上运行.

- **Entropy.** We use a small auxiliary 370M parameter subword-level LLM<sup>17</sup> to compute next-token entropies for every token. We then iteratively merge the pair of patches which, when summing their individual entropies, results in the lowest entropy among all entropy sums of pairs of patches in the example.
- **Cross-Entropy.** We use the same small auxiliary LLM as for entropy-based merging, but instead of merging the pair of tokens with the lowest total entropy, we iteratively merge the pair of tokens with the lowest total cross-entropy w.r.t. the next token in the data.

- **熵.** 用一个 370M 参数的小型辅助子词 LLM<sup>17</sup> 为每个 token 计算下一 token 熵. 然后反复合并样本中「两者熵之和」最小的那对 patch.
- **交叉熵.** 用与熵合并相同的小型辅助 LLM, 但不按总熵最小合并, 而是反复合并相对数据中下一 token 的总交叉熵最小的那对 token.

In the case of entropy- and cross-entropy-based merging, the auxiliary LLM is only required at training time to supervise the boundary predictor (as in DTP; Nawrot et al., 2023). Unlike BLT (Pagnoni et al., 2025), we do not need to retain the auxiliary LLM for inference.

对熵合并和交叉熵合并, 辅助 LLM 只在训练时用来监督边界预测器 (与 DTP 相同). 与 BLT 不同, 推理时不需要保留辅助 LLM.

Even though the loss is discontinuous w.r.t. the parameters of the boundary predictor and we do not employ any technique to backpropagate through the discrete boundary predictions, we observe stable training without loss spikes with all of the above merging methods. An important nuance is that the supervision target compression ratio $t$ is not attained by the model. Despite the boundaries not being learned end-to-end, the model learns to trade off boundary prediction accuracy with the main next-byte prediction loss, like other multitask models which learn to balance performance on the constituent tasks (see e.g. Zhang and Yang, 2021). An important hyperparameter is thus the factor $\lambda_\mathcal{B}$ controlling the importance of the boundary prediction task; we keep $\lambda_\mathcal{B} = 4$ from Stage 1 training and report the attained compression ratio $c$ in addition to the target compression ratio $t$.

尽管损失对边界预测器参数不连续, 我们也没有用任何技术穿过离散边界预测做反向传播, 但上述所有合并方法都训练稳定, 没有损失尖峰. 一个要点是模型达不到监督目标压缩率 $t$. 边界虽然不是端到端学出的, 模型仍会在边界预测准确率与主任务下一字节预测损失之间权衡, 与其他学会平衡各子任务表现的多任务模型一样. 因此控制边界预测任务权重的 $\lambda_\mathcal{B}$ 是重要超参数; 我们沿用阶段 1 的 $\lambda_\mathcal{B} = 4$, 并在目标压缩率 $t$ 之外报告实际达到的压缩率 $c$.

As the baseline, we increase the bytes per patch of the subword-level LLM via tokenizer transfer to SuperBPE tokenizers (Liu et al., 2025). Here, we train SuperBPE tokenizers on top of the OLMo 2 tokenizer to reach vocabulary sizes of {200k, 400k} using the same 10GB text sample as Liu et al. (2025) for tokenizer training. We use FOCUS (Dobler and de Melo, 2023) to initialize the embeddings of the new superword tokens.

作为基线, 我们通过分词器迁移到 SuperBPE 分词器来提高子词 LLM 的每 patch 字节数. 在 OLMo 2 分词器之上训练 SuperBPE 分词器, 词表达到 {200k, 400k}, 训练分词器用的是与 Liu 等 (2025) 相同的 10GB 文本样本. 新的超词 token 嵌入用 FOCUS 初始化.

<sup>17</sup> The auxiliary 370M parameter subword-level LLM was trained on 74.3B tokens following a downscaled version of the OLMo 2 training and architecture (OLMo et al., 2024).

<sup>17</sup> 这个 370M 参数的辅助子词 LLM 按缩小版的 OLMo 2 训练流程与架构, 在 74.3B token 上训练.

<!-- page 16 of 35 -->

![Figure 4](images/zero_cost_it.png)

Figure 4 Byteified models can be post-trained by leveraging an existing (subword-level) post-trained Olmo 3 checkpoint; shown is the performance on IFEval of the base Olmo 3 model ($\theta_\text{PT}$), the base Bolmo ($\theta_\text{Bolmo}$), a post-trained Olmo 3 checkpoint ($\theta_\text{IT}$), and the result of merging the post-trained checkpoint into Bolmo.

Results are shown in Figure 3. Through transfer to SuperBPE, we can speed up the subword-level LLM while retaining performance to a large extent. However, at some vocabulary size threshold, the subword-level LLM breaks off the frontier as the softmax begins to dominate the FLOPs (for OLMo 2 1B, this is somewhere between a vocabulary size of 200k and 400k tokens). Byte-level LLMs do not suffer from the softmax bottleneck. This enables unboundedly increasing efficiency at a smooth dropoff in performance. Interestingly, BPE merges outperform entropy and cross-entropy merges, in contrast with prior work using entropy-based patch boundaries (Nawrot et al., 2023; Pagnoni et al., 2025). We believe this may be a pattern specific to the byteifying setting, since the BPE merging strategy is the one with the least amount of distinct merges to achieve any target compression (and thus, in this sense, the one closest to the pretrained model). Additional investigation with training from scratch would be necessary to validate this hypothesis.

结果见图 3. 迁移到 SuperBPE 能给子词 LLM 提速, 性能大体保留. 但词表大到某个阈值后, softmax 开始主导 FLOPs, 子词 LLM 脱离前沿 (对 OLMo 2 1B, 阈值在 200k 与 400k 词表之间). 字节级 LLM 没有 softmax 瓶颈, 效率可以无上限地提高, 性能平滑下降. 有意思的是, BPE 合并优于熵合并和交叉熵合并, 与此前使用熵 patch 边界的工作相反. 我们认为这可能是字节化设定特有的规律: 要达到任一目标压缩率, BPE 合并策略用到的不同合并种类最少, 因而在这个意义上最接近预训练模型. 验证这一假设需要再做从头训练的研究.

### 5.2 Post-Training Byteified Models via Task Arithmetic · 用任务算术给字节化模型做后训练

**Takeaway.** An existing subword-level post-trained checkpoint can be merged into a byteified model via Task Arithmetic (Ilharco et al., 2023) to post-train the byteified model with zero extra training cost.

**要点.** 通过任务算术 (Task Arithmetic) 把现有的子词后训练 checkpoint 合并进字节化模型, 能以零额外训练成本完成字节化模型的后训练.

Byteification adds a new component (a byteified model) to the ecosystem around the source LLM. A natural question is: How does this new component interact with the other components of the source LLM ecosystem? To answer this question, we investigate whether we can merge existing post-trained versions of Olmo 3 to post-train Bolmo without any extra training cost. We use the Olmo 3 checkpoint directly post-trained on instruction following via RL (RL-Zero; Olmo Team, 2025) in Deepseek-R1 style (DeepSeek-AI et al., 2025) as a case study. We find that we can infuse the instruction following capabilities from this checkpoint into Bolmo via Task Arithmetic (Ilharco et al., 2023) by adding the weight difference between the Transformer layers of the post-trained checkpoint and the base Olmo 3 to the corresponding Bolmo layers (see Figure 4).

字节化给源 LLM 的生态加了一个新组件 (字节化模型). 一个自然的问题是: 这个新组件与源 LLM 生态的其他组件如何配合? 为此我们研究能否合并现有的 Olmo 3 后训练版本, 零额外训练成本地给 Bolmo 做后训练. 案例是直接用 RL 做指令遵循后训练的 Olmo 3 checkpoint (RL-Zero), 方式同 Deepseek-R1. 我们发现, 把后训练 checkpoint 与基座 Olmo 3 的 Transformer 层权重差加到 Bolmo 的对应层上, 就能通过任务算术把该 checkpoint 的指令遵循能力注入 Bolmo (见图 4).

While the Bolmo base model originally performs worse than Olmo 3 on IFEval (31.1% vs. 35.4%), merging via Task Arithmetic lifts performance to on par with the original post-trained checkpoint (67.4% vs. 66.9%). We conclude that it is possible to utilize components of the subword-level LLM ecosystem to improve the corresponding byteified model. This removes the prerequisite for byte-level LLM support in the infrastructure that subword-level LLM post-training has benefitted immensely from (e.g., Lambert et al., 2024; Piché et al., 2025) and substantially speeds up iteration times.

Bolmo 基座在 IFEval 上原本不如 Olmo 3 (31.1% 对 35.4%), 经任务算术合并后提升到与原后训练 checkpoint 相当 (67.4% 对 66.9%). 结论是可以利用子词 LLM 生态的组件改进对应的字节化模型. 子词 LLM 后训练极大受益于各类基础设施, 这一结果免去了让这些基础设施先支持字节级 LLM 的前提, 也大幅缩短迭代时间.

A subtle requirement to post-training byteified models via Task Arithmetic is embedding resettability: since we only have a one-to-one correspondence between the parameters of the source subword-level LLM and the parameters of the global model $\mathcal{M}$, we can only easily adapt $\mathcal{M}$ via Task Arithmetic. The local encoder $\mathcal{E}$ and decoder $\mathcal{D}$ remain in the base model space. Whether the post-training transfer is successful thus depends on whether the base input embedding space (occupied by the local encoder $\mathcal{E}$ and the input embedding matrix of the base model) and the base output embedding space (occupied by the local decoder $\mathcal{D}$ and the output embedding matrix of the base model) remains compatible with post-trained inner Transformer layers; in other words, whether resetting the embeddings of the post-trained model to the base model embeddings preserves

用任务算术给字节化模型做后训练有一个隐含前提: 嵌入可重置性. 源子词 LLM 的参数只和全局模型 $\mathcal{M}$ 的参数一一对应, 所以只能方便地用任务算术调整 $\mathcal{M}$, 局部编码器 $\mathcal{E}$ 和解码器 $\mathcal{D}$ 仍停留在基座模型的空间里. 后训练能否迁移成功, 取决于基座的输入嵌入空间 (由局部编码器 $\mathcal{E}$ 和基座输入嵌入矩阵占据) 和输出嵌入空间 (由局部解码器 $\mathcal{D}$ 和基座输出嵌入矩阵占据) 是否仍与后训练过的内部 Transformer 层兼容; 换句话说, 把后训练模型的嵌入重置为基座模型的嵌入, 是否还能保持

<!-- page 17 of 35 -->

![Figure 5](images/boundary_ablation.png)

Figure 5 Boundary supervision by predicting the subword patch start or patch end using a causal or non-causal boundary predictor. Shown are the avg. task performance (left), cos. dist. of the local encoder representations to the target subword representations (middle), and the percentage of bytes where the predicted boundary differs from the true subword boundary (right) after Stage 1 training. Causal boundary predictors can achieve either accurate boundaries and accurate representations; non-causal boundaries enable both.

performance. We find this to be generally the case — and more so for larger models — although not always (see Appendix D). Designing post-training methods to preserve compatibility among components of the LLM ecosystem is a promising area of research, with some encouraging early findings (e.g., Shenfeld et al., 2025).

性能. 我们发现一般如此, 模型越大越明显, 但并非总是成立 (见附录 D). 设计能保持 LLM 生态各组件兼容性的后训练方法是有前景的研究方向, 已有一些令人鼓舞的早期发现.

## 6 Ablations · 消融

### 6.1 Impact of Non-Causal Patch Boundaries · 非因果 patch 边界的影响

**Takeaway.** Causal boundary predictors have to choose between either matching the subword tokenizer boundaries or matching the subword patch content; non-causal boundary predictors can do both, substantially improving downstream performance.

**要点.** 因果边界预测器只能在「匹配子词分词器的边界」与「匹配子词 patch 的内容」之间二选一; 非因果边界预测器两者都能做到, 明显提升下游性能.

Our largest deviation from prior byte-level architectures is non-causal boundary prediction. As per Section 3.1.1, causal boundary prediction suffers from a conundrum: we either predict the start of every subword patch, which is easy but creates an offset of one byte w.r.t. the patches passed to the original subword model while also making the patches less semantically coherent, or we predict the end of every subword patch, which is hard, especially since this task has to be performed by the shallow local encoder. In contrast, non-causal boundary prediction allows vastly simplifying the task by using future context (in our case, one future byte). This way, the shallow local encoder has enough capacity to perform well. Figure 5 quantifies this phenomenon: by predicting the patch end with future context, the patch end prediction task becomes easy, while retaining patches which are coherent and compatible with the global model. The remaining gap to the source subword-level LLM is primarily caused by the non-causal boundary predictor still attaining less than 100% accuracy (see Appendix A for details); future work on designing the boundary predictor, potentially using more future context than a single byte, could close this gap. It would even be possible to retain the subword tokenizer for boundary prediction of the prefill. However, this would re-introduce reliance on an external tokenizer, add tokenization bias (see Section 2), and make training at higher compression factors (see Section 5.1) harder.

与此前字节级架构相比, 我们最大的改动是非因果边界预测. 按 3.1.1 节, 因果边界预测面临两难: 要么预测每个子词 patch 的起点, 容易, 但相对送进原子词模型的 patch 错开了一个字节, patch 的语义也不那么连贯; 要么预测每个子词 patch 的终点, 难, 何况这个任务要由浅层局部编码器完成. 非因果边界预测借助未来上下文 (这里是一个未来字节) 让任务大为简化, 浅层局部编码器的容量就够用了. 图 5 量化了这一现象: 带未来上下文预测 patch 终点后, 终点预测变得容易, 同时 patch 保持连贯并与全局模型兼容. 与源子词 LLM 剩下的差距主要来自非因果边界预测器的准确率仍不到 100% (详见附录 A); 改进边界预测器设计, 比如使用多于一个字节的未来上下文, 可能消除这一差距. 甚至可以保留子词分词器给 prefill 做边界预测, 但这会重新依赖外部分词器, 引入分词偏差 (见第 2 节), 并让高压缩率训练 (见 5.1 节) 更难.

### 6.2 Is Stage 1 Training Necessary? · 阶段 1 训练是否必要?

**Takeaway.** Stage 1 training improves performance, but is not strictly necessary to obtain a good final run. The key benefit of Stage 1 training is speeding up iteration times.

**要点.** 阶段 1 训练能提升性能, 但要得到好的最终结果并非必需. 它的主要好处是缩短迭代时间.

Training in two stages adds implementation complexity. Can we not just train everything end-to-end in a single stage instead and let the optimization process do the work? To address this question, we run experiments where we immediately train all parameters, initializing the local encoder, local decoder, boundary predictor

分两阶段训练增加了实现复杂度. 能不能干脆一个阶段端到端训练所有东西, 让优化过程自己解决? 为回答这个问题, 我们做了直接训练所有参数的实验: 局部编码器, 局部解码器, 边界预测器

<!-- page 18 of 35 -->

![Figure 6](images/stage1_vs_no_stage1.png)

Figure 6 Ratio of bits-per-byte throughout training of runs without Stage 1 to runs with Stage 1. For runs with Stage 1, we exclude the Stage 1 loss trajectory. For runs without Stage 1, we exclude the first 9.8B ×2/3 = 6.5B tokens, resulting in a comparable trajectory over the remaining 39.3B tokens; a ratio >1 implies that Stage 1 is beneficial.

and LM head randomly, and the parameters of the global model from the subword-level LLM, i.e., starting directly from Stage 2. A fair comparison of Stage 2 only training with Stage 1 + Stage 2 training is difficult: Stage 1 training requires fewer FLOPs since we only backpropagate through a fraction of the global model (c.f. Section 3.2.1), and is more memory efficient since we only need to store a small fraction of the optimizer states by omitting training of the global model. We account for this difference by approximately FLOP-matching and disregarding the memory mismatch: Stage 1 needs approximately $2 \times \text{FLOPs}_\mathcal{M}$, whereas Stage 2 needs approximately $3 \times \text{FLOPs}_\mathcal{M}$ (1x for the forward and 2x for the backward pass through the global model). We thus add 9.8B × 2/3 = 6.5B tokens to Stage 2 training when omitting Stage 1 (increasing the length of Stage 2 by 17%). In practice, we believe the factor of 2/3 may slightly favor the Stage 2-only run since the memory requirements for Stage 1 are lower (permitting a larger batch size) and inference-specific optimizations could be used to speed up the forward pass of the subword-level LLM used in Stage 1.

和 LM head 随机初始化, 全局模型参数取自子词 LLM, 即直接从阶段 2 开始. 公平比较「只做阶段 2」与「阶段 1 + 阶段 2」并不容易: 阶段 1 只在全局模型的一小部分上反向传播 (见 3.2.1 节), FLOPs 更少; 又因为不训练全局模型, 只需存一小部分优化器状态, 更省显存. 我们近似对齐 FLOPs 来处理这一差异, 忽略显存的不对等: 阶段 1 约需 $2 \times \text{FLOPs}_\mathcal{M}$, 阶段 2 约需 $3 \times \text{FLOPs}_\mathcal{M}$ (全局模型前向 1 份, 反向 2 份). 因此省略阶段 1 时, 给阶段 2 加 9.8B × 2/3 = 6.5B token (阶段 2 长度增加 17%). 实际上我们认为 2/3 这个系数可能略偏向只做阶段 2 的那一组, 因为阶段 1 显存需求更低 (能用更大的 batch), 而且阶段 1 中子词 LLM 的前向可以用推理专用优化加速.

文中没有给出推导. 按 3.2.1 节的描述拆成三份: 子词嵌入走完全部 $L$ 层 (给解码器蒸馏提供 $z_\text{subword}$), 记 1 份; 池化表示走前 $n$ 层前向, 记 $n/L$ 份; 这前 $n$ 层的反向记 $2n/L$ 份. 合计 $1 + 3n/L$. 取 $n=4$: 7B 的 $L=32$, 得 $1.375$; 1B 的 $L=16$, 得 $1.75$. 两者都小于 2, 所以按 2/3 给只做阶段 2 的一组补 token, 补的算力多于阶段 1 实际消耗. 这与正文「2/3 可能略偏向只做阶段 2」方向一致, 7B 上偏得更多.

Figure 6 compares the training trajectory of runs with vs. without Stage 1 training. There are two main takeaways: (i) the 1B model benefits more from Stage 1 training than 7B, indicating that larger models may be more robust to catastrophic forgetting through large gradients at the start of training when starting directly with Stage 2, and (ii) the bits-per-byte gap narrows throughout the training trajectory but remains in favor of adding Stage 1; it is not clear how this behavior is influenced by the learning rate scheduling so we cannot easily extrapolate to higher token budgets. Since the absence of Stage 1 does not cause catastrophic degradation, we believe it is a reasonable hypothesis that Stage 1 training becomes less important with larger token budgets; however, this might be influenced in nontrivial ways by factors such as the choice of data mix.

图 6 比较有无阶段 1 的训练曲线. 主要结论有两条: (i) 1B 模型比 7B 从阶段 1 获益更多, 说明直接从阶段 2 开始时, 更大的模型可能对训练初期大梯度造成的灾难性遗忘更稳健; (ii) bits-per-byte 差距在训练过程中逐渐缩小, 但始终有利于加入阶段 1; 学习率调度如何影响这一行为尚不清楚, 所以不能简单外推到更大的 token 预算. 去掉阶段 1 并不会造成灾难性退化, 因此「token 预算越大, 阶段 1 越不重要」是一个合理假设; 不过数据混合等因素可能以复杂的方式影响这一点.

Summarily, Stage 1 is beneficial in terms of improving performance compared to matched Stage 2-only training, but not strictly necessary. A key benefit of Stage 1 is streamlining experimentation: quickly obtaining a checkpoint which should come close to the subword-level LLMs performance creates a substantially shorter feedback loop than repeatedly running full training experiments.

总之, 与对齐后的只做阶段 2 相比, 阶段 1 有助于提升性能, 但不是必需的. 它的主要好处是让实验更顺: 很快拿到一个应当接近子词 LLM 性能的 checkpoint, 反馈周期比反复跑完整训练短得多.

### 6.3 Selecting the Right Local Model Architecture for Fast Inference · 为快速推理选择局部模型架构

**Takeaway.** FLOP-derivative measurements (total training/inference FLOPs or FLOPs/byte) are a suboptimal proxy for model efficiency. We recommend primarily using wallclock inference time measurements to guide byte-level LLM architecture choices.

**要点.** 由 FLOPs 派生的指标 (训练/推理总 FLOPs 或 FLOPs/byte) 不是衡量模型效率的好代理. 我们建议主要用推理的实际耗时来指导字节级 LLM 的架构选择.

Previous work on byte-level LLMs largely compares against subword-level LLMs by matching the total amount of training or inference (i.e., prefill) FLOPs (e.g., Pagnoni et al., 2025) or FLOPs/byte (Hwang et al., 2025). This provides an incomplete picture. As observed by prior work (e.g., Ma et al., 2018), FLOPs do not necessarily correlate with inference speed; some sources of FLOPs are inherently more amenable to being computed efficiently on today's hardware than others, and decoding in Transformers is typically memory bound. We thus largely used inference speed measurements to guide our choice of local model architecture. Figure 7 shows prefilling latency (time to first byte) and decoding throughput (bytes/s) measurements of our chosen architecture, as well as various candidate local model architectures we explored.

此前的字节级 LLM 工作与子词 LLM 比较时, 大多对齐训练或推理 (即 prefill) 的总 FLOPs, 或对齐 FLOPs/byte. 这样得到的图景不完整. 已有工作指出, FLOPs 未必与推理速度相关: 有些来源的 FLOPs 天然更适合在当今硬件上高效计算, 而且 Transformer 解码通常受访存限制. 因此我们主要依据推理速度测量来选择局部模型架构. 图 7 给出所选架构以及多种候选局部模型架构的 prefill 延迟 (首字节时间) 和解码吞吐 (bytes/s).

<!-- page 19 of 35 -->

![Figure 7](images/wallclock.png)

Figure 7 (left): decoding throughput (bytes/s) and prefilling latency (time to first byte) for Bolmo 7B and the source subword model across compression factors and prefill lengths; Bolmo 7B overtakes Olmo 3 7B at a compression of ∼6.6 bytes per patch. (right): decoding throughput and prefilling latency for 18.0K prefill bytes across candidate local model architectures and of the final chosen Bolmo architecture. Recorded with batchsize=1 on H100 GPUs.

The chosen Bolmo architecture using mLSTM (Beck et al., 2025a) achieves competitive speeds at decoding ∼125 bytes/s vs. ∼150 bytes/s for the subword model at the same compression, and ∼1s to prefill 72K bytes vs. ∼0.8s to prefill the tokens corresponding to the same number of bytes for the subword model. In addition, Bolmo can be made faster by training at arbitrarily higher compression factors (in contrast to subword-level LLMs, see Section 5.1), and starts surpassing the subword model in inference efficiency at ∼6.6 bytes per patch. As shown in Figure 7 (right), we find mLSTM as implemented in Tiled Flash Linear Attention (TFLA; Beck et al., 2025b) to achieve substantially higher wallclock decoding throughput than Mamba2 and Gated DeltaNet at the same amount of FLOPs/byte. Relying purely on FLOPs to guide architecture choices would have thus potentially resulted in suboptimal inference speed due to the inconsistent correlation between the two ($R^2 \approx 0.63$ to $0.66$ in our experiments).

所选的 mLSTM 版 Bolmo 架构速度有竞争力: 同压缩率下解码约 125 bytes/s, 子词模型约 150 bytes/s; prefill 72K 字节约 1s, 子词模型 prefill 等量字节对应的 token 约 0.8s. 此外, Bolmo 可以用任意更高的压缩率训练来提速 (子词 LLM 做不到, 见 5.1 节), 在每 patch 约 6.6 字节时推理效率开始超过子词模型. 如图 7 (右) 所示, 在相同 FLOPs/byte 下, 用 Tiled Flash Linear Attention (TFLA) 实现的 mLSTM 解码实际吞吐明显高于 Mamba2 和 Gated DeltaNet. 两者相关性不稳定 (我们的实验中 $R^2 \approx 0.63$ 到 $0.66$), 只靠 FLOPs 指导架构选择可能导致推理速度欠佳.

图 7 左图中 Bolmo (c=4.4) 的解码吞吐曲线在 4.5K 到 72K prefill 字节之间约为 113 到 117 bytes/s, 右图「Selected by Bolmo」的星标也在约 115. 子词模型约 150 与图一致, prefill 72K 字节 Bolmo 约 1.03s, Olmo 约 0.8s 也一致. 只有 125 这个数在图上找不到对应, 按图读, 同压缩率下 Bolmo 的解码速度约为子词模型的 77%, 而不是 83%.

FLOP-matching is further complicated by having to make decisions as to how to count FLOPs, which is not trivial in practice. For example, the popular FLOP formulas from Hoffmann et al. (2022) assume a matrix multiplication of the input embeddings with the one-hot encoded input tokens. This is arguably not in line with hardware realities since the input embeddings can be computed via an extremely fast lookup operation, so counting the associated FLOPs can cause systematic biases.<sup>18</sup> Additionally, the chunk size used to partially parallelize linear RNN training inherently provides a way to use more FLOPs to achieve faster training (via higher parallelization; as in Dao and Gu, 2024; Yang et al., 2025), which further muddies the relationship between FLOPs and wallclock times.

对齐 FLOPs 还有一层麻烦: 怎么计数 FLOPs 本身就要做取舍, 实践中并不简单. 例如 Hoffmann 等 (2022) 常用的 FLOPs 公式假设输入嵌入要与 one-hot 编码的输入 token 做矩阵乘. 这与硬件实际不符, 因为输入嵌入可以通过极快的查表得到, 计入这部分 FLOPs 会带来系统性偏差<sup>18</sup>. 此外, 线性 RNN 训练中用于部分并行化的 chunk 大小, 本身就提供了一种多花 FLOPs 换取更快训练的途径 (通过更高的并行度), 进一步模糊了 FLOPs 与实际耗时的关系.

## 7 Conclusion

We have introduced byteification as a missing additional direction to training from scratch for developing byte-level LLMs. Byteification let us create Bolmo, the first fully open family of byte-level LLMs on par with or surpassing state-of-the-art subword-level LLMs at the 1B and 7B parameter scales. Bolmo benefits from architectural and training decisions specifically designed for byteifying, and comes close to matching subword-level LLMs in inference speed. We have further explored byte-level models' increased flexibility, such as arbitrarily decreasing token granularity for faster inference. Byteifying also lets us leverage other components of the ecosystem around the source subword model by byteifying post-trained models in zero-shot once the corresponding base model is byteified. Overall, byteifying finally makes byte-level LLMs a practical choice competitive with subword-level LLMs, and enables future research directions on byte-level LLMs for both the byteification setting and training from scratch.

我们提出字节化, 作为开发字节级 LLM 时从头训练之外缺失的另一条路. 借助字节化我们造出 Bolmo: 第一族在 1B 和 7B 规模上与最先进子词 LLM 持平或超过它们的完全开放字节级 LLM. Bolmo 得益于专为字节化设计的架构与训练决策, 推理速度接近子词 LLM. 我们还探索了字节级模型更大的灵活性, 例如任意降低 token 粒度以加快推理. 对应的基座模型字节化之后, 还能零样本地字节化后训练模型, 从而利用源子词模型生态的其他组件. 总的来说, 字节化让字节级 LLM 终于成为能与子词 LLM 竞争的实用选择, 并为字节化设定与从头训练两方面的字节级 LLM 研究打开了新方向.

<sup>18</sup> Counting the input embedding FLOPs has limited effect if the models being compared have similar vocabulary sizes. However, for example in the case of Hwang et al. (2025), it overestimates the FLOPs required by the subword-level baseline LLM by up to ∼25%: The GPT3-Large matched Transformer baseline with $d = 1536$, $|V| = 128256$ and an average number of 4.6 bytes per patch is considered to require 0.42 GFLOPs/byte, of which $2 \times 1536 \times 128256/4.6 \approx 0.085$ GFLOPs/byte are due to the input embeddings, while a negligible amount of the GFLOPs/byte of the byte-level models are due to the input embeddings.

<sup>18</sup> 若比较的模型词表大小相近, 计入输入嵌入 FLOPs 影响有限. 但以 Hwang 等 (2025) 为例, 这样会把子词基线 LLM 所需的 FLOPs 高估多达约 25%: 对齐 GPT3-Large 的 Transformer 基线 $d = 1536$, $|V| = 128256$, 平均每 patch 4.6 字节, 被算作需要 0.42 GFLOPs/byte, 其中 $2 \times 1536 \times 128256/4.6 \approx 0.085$ GFLOPs/byte 来自输入嵌入, 而字节级模型的 GFLOPs/byte 中来自输入嵌入的部分可以忽略.

<!-- page 20 of 35 -->

## 8 Future Directions · 未来方向

We believe Bolmo enables a number of future research directions, bits of which are sketched below.

我们认为 Bolmo 开启了不少研究方向, 下面按 bit 列出一部分.

**Bit 0. Investigating how architectures optimized for byteification perform when training from scratch.** We have restricted ourselves purely to the byteification setting. For example, we have not assessed how non-causal patch boundaries perform when training from scratch. We expect that the increased expressivity of the boundary predictor might be generally useful, but we do not yet know.

**Bit 0. 研究为字节化优化的架构在从头训练时表现如何.** 我们只研究了字节化设定, 例如没有评估非因果 patch 边界在从头训练时的表现. 我们预计边界预测器更强的表达力可能普遍有用, 但还不确定.

**Bit 1. Learning non-causal boundaries end-to-end.** We have purely trained our boundary predictor through direct external supervision — either to match subword tokens, or to match merges over subword tokens. We believe a highly promising area is learning non-causal boundary predictors end-to-end. For example, boundaries could be learnt end-to-end during post-training of a byteified model via RL, or by adapting methods like Hwang et al. (2025)'s method of enabling gradient flow through the boundary predictor to the non-causal setting.

**Bit 1. 端到端学习非因果边界.** 我们的边界预测器完全靠直接的外部监督训练, 要么匹配子词 token, 要么匹配子词 token 的合并. 端到端学习非因果边界预测器是很有前景的方向. 例如可以在字节化模型的 RL 后训练中端到端学边界, 或者把 Hwang 等 (2025) 让梯度流经边界预测器的方法改造到非因果设定.

**Bit 2. Scaling patch size and local model capacity.** We have designed the local models of Bolmo to minimize inference speed degradation when keeping the same patch size as the original subword model, since we have focused mainly on byteifying while keeping the patching constant. However, jointly using larger local models and a larger patch size might yield a better performance vs. efficiency tradeoff, as suggested by Pagnoni et al. (2025) and Huang et al. (2025).

**Bit 2. 扩大 patch 尺寸与局部模型容量.** 我们主要研究在 patch 不变的前提下做字节化, 所以 Bolmo 的局部模型是按「保持与原子词模型相同的 patch 尺寸时, 推理速度下降最少」来设计的. 但同时使用更大的局部模型和更大的 patch 尺寸, 可能得到更好的性能-效率权衡, Pagnoni 等 (2025) 和 Huang 等 (2025) 也有类似提示.

**Bit 3. Multi-byte prediction.** While multi-token/byte prediction has been used to great effect to speed up language models (Gloeckle et al., 2024; Cai et al., 2024; Grivas et al., 2025, among others), Bolmo only predicts the direct next byte. It is not clear how many sequential invocations of the global model multi-byte prediction could save; however, even saving sequential local model computations could lead to substantial speedups and permit larger local models, synergizing with Bit 2.

**Bit 3. 多字节预测.** 多 token / 多字节预测已被有效用于给语言模型提速, 而 Bolmo 只预测紧接着的下一个字节. 多字节预测能省掉多少次全局模型的顺序调用尚不清楚; 但即使只省掉局部模型的顺序计算, 也可能带来明显提速, 并允许更大的局部模型, 与 Bit 2 相互促进.

**Bit 4. Non-destructive byteification.** As per Appendix A, the remaining gap between the performance of Bolmo and the original model can to a large extent be attributed to the continued training setup generally hurting performance. Investigating ways to make continued training less destructive, such as PEFT methods (e.g., Hu et al., 2022; Pfeiffer et al., 2023), could be promising.

**Bit 4. 无损字节化.** 按附录 A, Bolmo 与原模型之间剩下的差距很大程度上可归因于继续训练本身对性能的损害. 研究如何让继续训练损害更小, 例如 PEFT 方法, 可能有前景.

**Bit 5. Specialized LTLM sampling methods.** Subword-level language models have benefitted from a range of sampling methods which have been to various extents designed for, or at the least empirically validated on, predominantly subword-level LLMs (e.g., Holtzman et al., 2020; Meister et al., 2023; Minh et al., 2025). We have not investigated how these methods transfer to LTLMs. Developing specialized sampling methods for LTLMs, for instance by adjusting the sampling strategy based on the position of the current byte within the patch, is also an intriguing topic.

**Bit 5. LTLM 专用采样方法.** 子词语言模型受益于一系列采样方法, 这些方法不同程度上是为子词 LLM 设计的, 至少主要在子词 LLM 上做过经验验证. 我们没有研究它们迁移到 LTLM 的效果. 为 LTLM 开发专用采样方法, 例如根据当前字节在 patch 中的位置调整采样策略, 也是有意思的课题.

**Bit 6. More equitable input units.** Bolmo operates over UTF-8 bytes, which is a highly Latin-centric atomic unit (Limisiewicz et al., 2024). We believe that the dynamic latent tokenization can to some extent 'amortize' over the choice of the atomic unit, but it is not clear to what extent this is possible, and in how far LTLMs inherit the biases from their underlying encoding. Future work could investigate this, alongside alternative choices for the atomic unit such as MYTE (Limisiewicz et al., 2024) or SCRIPT (Land and Arnett, 2025).

**Bit 6. 更公平的输入单元.** Bolmo 在 UTF-8 字节上运算, 这是高度以拉丁文字为中心的原子单元. 我们认为动态潜在分词能在一定程度上「摊平」原子单元选择的影响, 但能做到什么程度, LTLM 在多大程度上继承底层编码的偏差, 都还不清楚. 未来可以研究这些问题, 并尝试 MYTE 或 SCRIPT 等其他原子单元.

**Bit 7. Batched inference optimizations.** We have shown that Bolmo can achieve throughputs competitive with subword-level LLMs in the batchsize = 1 setting, which is sufficient for edge applications. However, achieving fast batched inference of LTLMs by applying e.g. PagedAttention (Kwon et al., 2023) and continuous batching (Yu et al., 2022) will be necessary to unlock a wider range of applications. Here, there are some additional challenges for LTLMs caused by their dynamicity (a fixed amount of tokens across examples causes a variable number of bytes and vice versa) which require additional work.<sup>19</sup>

**Bit 7. 批量推理优化.** 我们展示了 Bolmo 在 batchsize = 1 时吞吐能与子词 LLM 竞争, 这对端侧应用已经够用. 但要支撑更广的应用, 需要借助 PagedAttention 和连续批处理等手段实现 LTLM 的快速批量推理. 这里 LTLM 的动态性带来额外挑战 (各样本 token 数固定时字节数不定, 反之亦然), 需要更多工作<sup>19</sup>.

<sup>19</sup> To our knowledge, the only investigation into efficient batched LTLM inference so far is through Aleph Alpha's vllm fork.

<sup>19</sup> 据我们所知, 目前对 LTLM 高效批量推理的唯一研究是 Aleph Alpha 的 vllm 分支.

<!-- page 21 of 35 -->

## Acknowledgments

We thank the Beaker team at Ai2 for providing and maintaining the training infrastructure. We thank Tyler Romero for helpful discussions on inference efficiency, David Heineman for help with the evaluation infrastructure, Will Merill for useful discussions on linear RNNs, and Alisa Liu for useful discussions on tokenization. We thank Dirk Groeneveld for providing the checkpoint used as entropy model. This work has been supported by the UK EPSRC grant EP/T02450X/1, and resources of the Oak Ridge Leadership Computing Facility, which is a DOE Office of Science User Facility supported under Contract DE-AC05-00OR22725. Edoardo M. Ponti is supported by the ERC Starting Grant AToM-FM (101222956). We acknowledge the National Artificial Intelligence Research Resource (NAIRR) Pilot and Microsoft Azure for contributing to the results in this work.

<!-- page 22 of 35 -->

## References

O. Ahia, S. Kumar, H. Gonen, J. Kasai, D. R. Mortensen, N. A. Smith, and Y. Tsvetkov. Do all languages cost the same? tokenization in the era of commercial language models. arXiv preprint arXiv:2305.13707, 2023.

I. Athanasiadis, A. Karmush, and M. Felsberg. Model stitching by functional latent alignment. arXiv preprint arXiv:2505.20142, 2025.

J. Austin, A. Odena, M. Nye, M. Bosma, H. Michalewski, D. Dohan, E. Jiang, C. Cai, M. Terry, Q. Le, et al. Program synthesis with large language models. arXiv preprint arXiv:2108.07732, 2021.

M. Beck, K. Pöppel, P. Lippe, R. Kurle, P. M. Blies, G. Klambauer, S. Böck, and S. Hochreiter. xLSTM 7b: A recurrent LLM for fast and efficient inference. In Forty-second International Conference on Machine Learning, 2025a. URL https://openreview.net/forum?id=LV3DpKD08B.

M. Beck, K. Pöppel, P. Lippe, and S. Hochreiter. Tiled Flash Linear Attention: More efficient linear rnn and xlstm kernels. arXiv, 2503.14376, 2025b. URL https://arxiv.org/abs/2503.14376.

L. Beinborn and Y. Pinter. Analyzing cognitive plausibility of subword tokenization. In H. Bouamor, J. Pino, and K. Bali, editors, Proceedings of the 2023 Conference on Empirical Methods in Natural Language Processing, pages 4478–4486, Singapore, Dec. 2023. Association for Computational Linguistics. doi: 10.18653/v1/2023.emnlp-main.272. URL https://aclanthology.org/2023.emnlp-main.272/.

A. Bick, K. Y. Li, E. P. Xing, J. Z. Kolter, and A. Gu. Transformers to ssms: Distilling quadratic knowledge to subquadratic models. In A. Globerson, L. Mackey, D. Belgrave, A. Fan, U. Paquet, J. Tomczak, and C. Zhang, editors, Advances in Neural Information Processing Systems, volume 37, pages 31788–31812. Curran Associates, Inc., 2024. doi: 10.52202/079017-0999. URL https://proceedings.neurips.cc/paper_files/paper/2024/file/ 3848fef259495bfd04d60cdc5c1b4db7-Paper-Conference.pdf.

Y. Bisk, R. Zellers, R. Le bras, J. Gao, and Y. Choi. PIQA: Reasoning about physical commonsense in natural language. Proceedings of the AAAI Conference on Artificial Intelligence, 34(05):7432–7439, Apr. 2020. doi: 10.1609/aaai.v34i05.6239. URL https://ojs.aaai.org/index.php/AAAI/article/view/6239.

Z. Borsos, R. Marinier, D. Vincent, E. Kharitonov, O. Pietquin, M. Sharifi, D. Roblek, O. Teboul, D. Grangier, M. Tagliasacchi, et al. Audiolm: a language modeling approach to audio generation. IEEE/ACM transactions on audio, speech, and language processing, 31:2523–2533, 2023.

T. Brown, B. Mann, N. Ryder, M. Subbiah, J. D. Kaplan, P. Dhariwal, A. Neelakantan, P. Shyam, G. Sastry, A. Askell, et al. Language models are few-shot learners. Advances in neural information processing systems, 33:1877–1901, 2020.

T. Cai, Y. Li, Z. Geng, H. Peng, J. D. Lee, D. Chen, and T. Dao. Medusa: Simple llm inference acceleration framework with multiple decoding heads. arXiv preprint arXiv: 2401.10774, 2024.

F. Cassano, J. Gouwar, D. Nguyen, S. Nguyen, L. Phipps-Costin, D. Pinckney, M.-H. Yee, Y. Zi, C. J. Anderson, M. Q. Feldman, et al. Multipl-e: A scalable and extensible approach to benchmarking neural code generation. arXiv preprint arXiv:2208.08227, 2022.

M. Chen, J. Tworek, H. Jun, Q. Yuan, H. P. de Oliveira Pinto, J. Kaplan, H. Edwards, Y. Burda, N. Joseph, G. Brockman, A. Ray, R. Puri, G. Krueger, M. Petrov, H. Khlaaf, G. Sastry, P. Mishkin, B. Chan, S. Gray, N. Ryder, M. Pavlov, A. Power, L. Kaiser, M. Bavarian, C. Winter, P. Tillet, F. P. Such, D. Cummings, M. Plappert, F. Chantzis, E. Barnes, A. Herbert-Voss, W. H. Guss, A. Nichol, A. Paino, N. Tezak, J. Tang, I. Babuschkin, S. Balaji, S. Jain, W. Saunders, C. Hesse, A. N. Carr, J. Leike, J. Achiam, V. Misra, E. Morikawa, A. Radford, M. Knight, M. Brundage, M. Murati, K. Mayer, P. Welinder, B. McGrew, D. Amodei, S. McCandlish, I. Sutskever, and W. Zaremba. Evaluating large language models trained on code. 2021.

N. Chirkova and S. Troshin. CodeBPE: Investigating subtokenization options for large language model pretraining on source code. In The Eleventh International Conference on Learning Representations, 2023. URL https: //openreview.net/forum?id=htL4UZ344nF.

P. Clark, I. Cowhey, O. Etzioni, T. Khot, A. Sabharwal, C. Schoenick, and O. Tafjord. Think you have solved question answering? Try ARC, the AI2 reasoning challenge. CoRR, arXiv:1803.05457, 2018.

K. Cobbe, V. Kosaraju, M. Bavarian, M. Chen, H. Jun, L. Kaiser, M. Plappert, J. Tworek, J. Hilton, R. Nakano, C. Hesse, and J. Schulman. Training verifiers to solve math word problems. arXiv preprint arXiv:2110.14168, 2021.

<!-- page 23 of 35 -->

A. Cosma, S. Ruseti, E. Radoi, and M. Dascalu. The strawberry problem: Emergence of character-level understanding in tokenized language models, 2025. URL https://arxiv.org/abs/2505.14172.

G. Dagan, G. Synnaeve, and B. Roziere. Getting the most out of your tokenizer for pre-training and domain adaptation.

In R. Salakhutdinov, Z. Kolter, K. Heller, A. Weller, N. Oliver, J. Scarlett, and F. Berkenkamp, editors, Proceedings of the 41st International Conference on Machine Learning, volume 235 of Proceedings of Machine Learning Research, pages 9784–9805. PMLR, 21–27 Jul 2024. URL https://proceedings.mlr.press/v235/dagan24a.html.

T. Dao and A. Gu. Transformers are SSMs: Generalized models and efficient algorithms through structured state space duality. In Forty-first International Conference on Machine Learning, 2024. URL https://openreview.net/ forum?id=ztn8FCR1td.

DeepSeek-AI, D. Guo, D. Yang, H. Zhang, J. Song, R. Zhang, R. Xu, Q. Zhu, S. Ma, P. Wang, X. Bi, X. Zhang, X. Yu, Y. Wu, Z. F. Wu, Z. Gou, Z. Shao, Z. Li, Z. Gao, A. Liu, B. Xue, B. Wang, B. Wu, B. Feng, C. Lu, C. Zhao, C. Deng, C. Zhang, C. Ruan, D. Dai, D. Chen, D. Ji, E. Li, F. Lin, F. Dai, F. Luo, G. Hao, G. Chen, G. Li, H. Zhang, H. Bao, H. Xu, H. Wang, H. Ding, H. Xin, H. Gao, H. Qu, H. Li, J. Guo, J. Li, J. Wang, J. Chen, J. Yuan, J. Qiu, J. Li, J. L. Cai, J. Ni, J. Liang, J. Chen, K. Dong, K. Hu, K. Gao, K. Guan, K. Huang, K. Yu, L. Wang, L. Zhang, L. Zhao, L. Wang, L. Zhang, L. Xu, L. Xia, M. Zhang, M. Zhang, M. Tang, M. Li, M. Wang, M. Li, N. Tian, P. Huang, P. Zhang, Q. Wang, Q. Chen, Q. Du, R. Ge, R. Zhang, R. Pan, R. Wang, R. J. Chen, R. L. Jin, R. Chen, S. Lu, S. Zhou, S. Chen, S. Ye, S. Wang, S. Yu, S. Zhou, S. Pan, S. S. Li, S. Zhou, S. Wu, S. Ye, T. Yun, T. Pei, T. Sun, T. Wang, W. Zeng, W. Zhao, W. Liu, W. Liang, W. Gao, W. Yu, W. Zhang, W. L. Xiao, W. An, X. Liu, X. Wang, X. Chen, X. Nie, X. Cheng, X. Liu, X. Xie, X. Liu, X. Yang, X. Li, X. Su, X. Lin, X. Q. Li, X. Jin, X. Shen, X. Chen, X. Sun, X. Wang, X. Song, X. Zhou, X. Wang, X. Shan, Y. K. Li, Y. Q. Wang, Y. X. Wei, Y. Zhang, Y. Xu, Y. Li, Y. Zhao, Y. Sun, Y. Wang, Y. Yu, Y. Zhang, Y. Shi, Y. Xiong, Y. He, Y. Piao, Y. Wang, Y. Tan, Y. Ma, Y. Liu, Y. Guo, Y. Ou, Y. Wang, Y. Gong, Y. Zou, Y. He, Y. Xiong, Y. Luo, Y. You, Y. Liu, Y. Zhou, Y. X. Zhu, Y. Xu, Y. Huang, Y. Li, Y. Zheng, Y. Zhu, Y. Ma, Y. Tang, Y. Zha, Y. Yan, Z. Z. Ren, Z. Ren, Z. Sha, Z. Fu, Z. Xu, Z. Xie, Z. Zhang, Z. Hao, Z. Ma, Z. Yan, Z. Wu, Z. Gu, Z. Zhu, Z. Liu, Z. Li, Z. Xie, Z. Song, Z. Pan, Z. Huang, Z. Xu, Z. Zhang, and Z. Zhang. Deepseek-r1: Incentivizing reasoning capability in llms via reinforcement learning, 2025. URL https://arxiv.org/pdf/2501.12948.

K. Dobler and G. de Melo. FOCUS: Effective embedding initialization for monolingual specialization of multilingual models. In H. Bouamor, J. Pino, and K. Bali, editors, Proceedings of the 2023 Conference on Empirical Methods in Natural Language Processing, pages 13440–13454, Singapore, Dec. 2023. Association for Computational Linguistics.

doi: 10.18653/v1/2023.emnlp-main.829. URL https://aclanthology.org/2023.emnlp-main.829/.

K. Dobler, D. Elliott, and G. de Melo. Token distillation: Attention-aware input embeddings for new tokens, 2025.

URL https://arxiv.org/abs/2505.20133.

A. Dosovitskiy. An image is worth 16x16 words: Transformers for image recognition at scale. arXiv preprint arXiv:2010.11929, 2020.

D. Dua, Y. Wang, P. Dasigi, G. Stanovsky, S. Singh, and M. Gardner. DROP: A reading comprehension benchmark requiring discrete reasoning over paragraphs. In J. Burstein, C. Doran, and T. Solorio, editors, Proceedings of the 2019 Conference of the North American Chapter of the Association for Computational Linguistics: Human Language Technologies, Volume 1 (Long and Short Papers), pages 2368–2378, Minneapolis, Minnesota, June 2019. Association for Computational Linguistics. doi: 10.18653/v1/N19-1246. URL https://aclanthology.org/N19-1246.

L. Edman, H. Schmid, and A. Fraser. CUTE: Measuring LLMs’ understanding of their tokens. In Y. Al-Onaizan, M. Bansal, and Y.-N. Chen, editors, Proceedings of the 2024 Conference on Empirical Methods in Natural Language Processing, pages 3017–3026, Miami, Florida, USA, Nov. 2024. Association for Computational Linguistics. doi: 10.18653/v1/2024.emnlp-main.177. URL https://aclanthology.org/2024.emnlp-main.177/.

L. Edman, H. Schmid, and A. Fraser. EXECUTE: A multilingual benchmark for LLM token understanding. In W. Che, J. Nabende, E. Shutova, and M. T. Pilehvar, editors, Findings of the Association for Computational Linguistics: ACL 2025, pages 1878–1887, Vienna, Austria, July 2025. Association for Computational Linguistics. ISBN 979-8- 89176-256-5. doi: 10.18653/v1/2025.findings-acl.95. URL https://aclanthology.org/2025.findings-acl.95/.

D. Feher, I. Vulić, and B. Minixhofer. Retrofitting large language models with dynamic tokenization. In W. Che, J. Nabende, E. Shutova, and M. T. Pilehvar, editors, Proceedings of the 63rd Annual Meeting of the Association for Computational Linguistics (Volume 1: Long Papers), pages 29866–29883, Vienna, Austria, July 2025. Association for Computational Linguistics. ISBN 979-8-89176-251-0. doi: 10.18653/v1/2025.acl-long.1444. URL https: //aclanthology.org/2025.acl-long.1444/.

W. Fleshman and B. V. Durme. Toucan: Token-aware character level language modeling, 2023. URL https: //arxiv.org/abs/2311.08620.

<!-- page 24 of 35 -->

S. Geng, N. Ranchin, Y. Yao, M. Peyrard, C. Wendler, M. Gastpar, and R. West. zip2zip: Inference-time adaptive tokenization via online compression. In The Thirty-ninth Annual Conference on Neural Information Processing Systems, 2025. URL https://openreview.net/forum?id=Hmepi1Fm2g.

F. Gloeckle, B. Y. Idrissi, B. Roziere, D. Lopez-Paz, and G. Synnaeve. Better & faster large language models via multi-token prediction. In Forty-first International Conference on Machine Learning, 2024. URL https: //openreview.net/forum?id=pEWAcejiU2.

A. Grivas, L. Loconte, E. van Krieken, P. Nawrot, Y. Zhao, E. Wielewski, P. Minervini, E. Ponti, and A. Vergari. Fast and expressive multi-token prediction with probabilistic circuits, 2025. URL https://arxiv.org/abs/2511.11346.

Y. Gu, O. Tafjord, B. Kuehl, D. Haddad, J. Dodge, and H. Hajishirzi. Olmes: A standard for language model evaluations. ArXiv, abs/2406.08446, 2024. URL https://api.semanticscholar.org/CorpusID:270391754.

D. Guo, Q. Zhu, D. Yang, Z. Xie, K. Dong, W. Zhang, G. Chen, X. Bi, Y. Wu, Y. Li, et al. Deepseek-coder: When the large language model meets programming–the rise of code intelligence. arXiv preprint arXiv:2401.14196, 2024.

D. Guo, D. Yang, H. Zhang, J. Song, P. Wang, Q. Zhu, R. Xu, R. Zhang, S. Ma, X. Bi, et al. Deepseek-r1 incentivizes reasoning in llms through reinforcement learning. Nature, 645(8081):633–638, 2025.

M. Haltiuk and A. Smywiński-Pohl. Model-aware tokenizer transfer, 2025. URL https://arxiv.org/abs/2510.21954.

J. Hayase, A. Liu, N. A. Smith, and S. Oh. Sampling from your language model one byte at a time, 2025. URL https://arxiv.org/abs/2506.14123.

D. Hendrycks, C. Burns, S. Basart, A. Zou, M. Mazeika, D. Song, and J. Steinhardt. Measuring massive multitask language understanding. Proceedings of the International Conference on Learning Representations (ICLR), 2021.

N. Ho, S. Bae, T. Kim, hyunjik.jo, Y. Kim, T. Schuster, A. Fisch, J. Thorne, and S.-Y. Yun. Block transformer: Global-to-local language modeling for fast inference. In The Thirty-eighth Annual Conference on Neural Information Processing Systems, 2024. URL https://openreview.net/forum?id=6osgTNnAZQ.

J. Hoffmann, S. Borgeaud, A. Mensch, E. Buchatskaya, T. Cai, E. Rutherford, D. d. L. Casas, L. A. Hendricks, J. Welbl, A. Clark, et al. Training compute-optimal large language models. arXiv preprint arXiv:2203.15556, 2022.

V. Hofmann, J. Pierrehumbert, and H. Schütze. Superbizarre is not superb: Derivational morphology improves BERT’s interpretation of complex words. In C. Zong, F. Xia, W. Li, and R. Navigli, editors, Proceedings of the 59th Annual Meeting of the Association for Computational Linguistics and the 11th International Joint Conference on Natural Language Processing (Volume 1: Long Papers), pages 3594–3608, Online, Aug. 2021. Association for Computational Linguistics. doi: 10.18653/v1/2021.acl-long.279. URL https://aclanthology.org/2021.acl-long.279/.

A. Holtzman, J. Buys, L. Du, M. Forbes, and Y. Choi. The curious case of neural text degeneration. In International Conference on Learning Representations, 2020. URL https://openreview.net/forum?id=rygGQyrFvH.

E. J. Hu, yelong shen, P. Wallis, Z. Allen-Zhu, Y. Li, S. Wang, L. Wang, and W. Chen. LoRA: Low-rank adaptation of large language models. In International Conference on Learning Representations, 2022. URL https://openreview. net/forum?id=nZeVKeeFYf9.

H. Huang, D. Zhu, B. Wu, Y. Zeng, Y. Wang, Q. Min, and Z. Xun. Over-tokenized transformer: Vocabulary is generally worth scaling. In A. Singh, M. Fazel, D. Hsu, S. Lacoste-Julien, F. Berkenkamp, T. Maharaj, K. Wagstaff, and J. Zhu, editors, Proceedings of the 42nd International Conference on Machine Learning, volume 267 of Proceedings of Machine Learning Research, pages 26261–26282. PMLR, 13–19 Jul 2025. URL https: //proceedings.mlr.press/v267/huang25bb.html.

S. Hwang, B. Wang, and A. Gu. Dynamic chunking for end-to-end hierarchical sequence modeling, 2025. URL https://arxiv.org/abs/2507.07955.

G. Ilharco, M. T. Ribeiro, M. Wortsman, L. Schmidt, H. Hajishirzi, and A. Farhadi. Editing models with task arithmetic.

In The Eleventh International Conference on Learning Representations, 2023. URL https://openreview.net/ forum?id=6t0Kwf8-jrj.

D. Jin, E. Pan, N. Oufattole, W.-H. Weng, H. Fang, and P. Szolovits. What disease does this patient have? a large-scale open domain question answering dataset from medical exams. Applied Sciences, 11(14):6421, 2021.

J. Kallini, S. Murty, C. D. Manning, C. Potts, and R. Csordás. Mrt5: Dynamic token merging for efficient byte- level language models. In The Thirteenth International Conference on Learning Representations, 2025. URL https://openreview.net/forum?id=VYWBMq1L7H.

<!-- page 25 of 35 -->

A. Kaushal and K. Mahowald. What do tokens know about their characters and how do they know it? In M. Carpuat, M.-C. de Marneffe, and I. V. Meza Ruiz, editors, Proceedings of the 2022 Conference of the North American Chapter of the Association for Computational Linguistics: Human Language Technologies, pages 2487–2507, Seattle, United States, July 2022. Association for Computational Linguistics. doi: 10.18653/v1/2022.naacl-main.179. URL https://aclanthology.org/2022.naacl-main.179/.

T. Kudo. Subword Regularization: Improving Neural Network Translation Models with Multiple Subword Candidates.

In I. Gurevych and Y. Miyao, editors, Proceedings of the 56th Annual Meeting of the Association for Computational Linguistics (Volume 1: Long Papers), pages 66–75, Melbourne, Australia, July 2018. Association for Computational Linguistics. doi: 10.18653/v1/P18-1007. URL https://aclanthology.org/P18-1007.

T. Kwiatkowski, J. Palomaki, O. Redfield, M. Collins, A. Parikh, C. Alberti, D. Epstein, I. Polosukhin, J. Devlin, K. Lee, K. Toutanova, L. Jones, M. Kelcey, M.-W. Chang, A. M. Dai, J. Uszkoreit, Q. Le, and S. Petrov. Natural questions: A benchmark for question answering research. Transactions of the Association for Computational Linguistics, 7:452–466, 2019. doi: 10.1162/tacl_a_00276. URL https://aclanthology.org/Q19-1026.

W. Kwon, Z. Li, S. Zhuang, Y. Sheng, L. Zheng, C. H. Yu, J. E. Gonzalez, H. Zhang, and I. Stoica. Efficient memory management for large language model serving with pagedattention, 2023. URL https://arxiv.org/abs/2309.06180.

Y. Lai, C. Li, Y. Wang, T. Zhang, R. Zhong, L. Zettlemoyer, W.-T. Yih, D. Fried, S. Wang, and T. Yu. Ds-1000: A natural and reliable benchmark for data science code generation. ArXiv, abs/2211.11501, 2022.

N. Lambert, J. D. Morrison, V. Pyatkin, S. Huang, H. Ivison, F. Brahman, L. J. V. Miranda, A. Liu, N. Dziri, S. Lyu, Y. Gu, S. Malik, V. Graf, J. D. Hwang, J. Yang, R. L. Bras, O. Tafjord, C. Wilhelm, L. Soldaini, N. A. Smith, Y. Wang, P. Dasigi, and H. Hajishirzi. Tulu 3: Pushing frontiers in open language model post-training. 2024. URL https://api.semanticscholar.org/CorpusID:274192505.

A. Łańcucki, K. Staniszewski, P. Nawrot, and E. Ponti. Inference-time hyper-scaling with KV cache compression. In The Thirty-ninth Annual Conference on Neural Information Processing Systems, 2025. URL https://openreview.

net/forum?id=8ZiElzQxf1.

S. Land and C. Arnett. Bpe stays on script: Structured encoding for robust multilingual pretokenization, 2025. URL https://arxiv.org/abs/2505.24689.

S. Land and M. Bartolo. Fishing for magikarp: Automatically detecting under-trained tokens in large language models.

arXiv preprint arXiv:2405.05417, 2024.

A. Lewkowycz, A. Andreassen, D. Dohan, E. Dyer, H. Michalewski, V. Ramasesh, A. Slone, C. Anil, I. Schlag, T. Gutman-Solo, et al. Solving quantitative reasoning problems with language models. Advances in neural information processing systems, 35:3843–3857, 2022.

D. Liang, H. Gonen, Y. Mao, R. Hou, N. Goyal, M. Ghazvininejad, L. Zettlemoyer, and M. Khabsa. XLM-V: Overcoming the vocabulary bottleneck in multilingual masked language models. In H. Bouamor, J. Pino, and K. Bali, editors, Proceedings of the 2023 Conference on Empirical Methods in Natural Language Processing, pages 13142– 13152, Singapore, Dec. 2023. Association for Computational Linguistics. doi: 10.18653/v1/2023.emnlp-main.813. URL https://aclanthology.org/2023.emnlp-main.813/.

T. Limisiewicz, T. Blevins, H. Gonen, O. Ahia, and L. Zettlemoyer. MYTE: Morphology-driven byte encoding for better and fairer multilingual language modeling. In L.-W. Ku, A. Martins, and V. Srikumar, editors, Proceedings of the 62nd Annual Meeting of the Association for Computational Linguistics (Volume 1: Long Papers), pages 15059–15076, Bangkok, Thailand, Aug. 2024. Association for Computational Linguistics. doi: 10.18653/v1/2024.acl-long.804. URL https://aclanthology.org/2024.acl-long.804/.

L. M. Lindsey, N. L. Pershing, A. Habib, K. Dufault-Thompson, W. Z. Stephens, A. J. Blaschke, X. Jiang, and H. Sundar. The impact of tokenizer selection in genomic language models. Bioinformatics, 41(9):btaf456, 2025.

A. Liu, J. Hayase, V. Hofmann, S. Oh, N. A. Smith, and Y. Choi. Superbpe: Space travel for language models, 2025.

URL https://arxiv.org/abs/2503.13423.

J. Lotz, E. Salesky, P. Rust, and D. Elliott. Text rendering strategies for pixel language models. In H. Bouamor, J. Pino, and K. Bali, editors, Proceedings of the 2023 Conference on Empirical Methods in Natural Language Processing, pages 10155–10172, Singapore, Dec. 2023. Association for Computational Linguistics. doi: 10.18653/v1/ 2023.emnlp-main.628. URL https://aclanthology.org/2023.emnlp-main.628/.

N. Ma, X. Zhang, H.-T. Zheng, and J. Sun. Shufflenet v2: Practical guidelines for efficient cnn architecture design, 2018. URL https://arxiv.org/abs/1807.11164.

<!-- page 26 of 35 -->

C. Meister, T. Pimentel, G. Wiher, and R. Cotterell. Locally typical sampling. Transactions of the Association for Computational Linguistics, 11:102–121, 2023. doi: 10.1162/tacl_a_00536. URL https://aclanthology.org/2023.

tacl-1.7/.

N. N. Minh, A. Baker, C. Neo, A. G. Roush, A. Kirsch, and R. Shwartz-Ziv. Turning up the heat: Min-p sampling for creative and coherent LLM outputs. In The Thirteenth International Conference on Learning Representations, 2025. URL https://openreview.net/forum?id=FBkpCyujtS.

B. Minixhofer, F. Paischer, and N. Rekabsaz. WECHSEL: Effective initialization of subword embeddings for cross- lingual transfer of monolingual language models. In M. Carpuat, M.-C. de Marneffe, and I. V. Meza Ruiz, editors, Proceedings of the 2022 Conference of the North American Chapter of the Association for Computational Linguistics: Human Language Technologies, pages 3992–4006, Seattle, United States, July 2022. Association for Computational Linguistics. doi: 10.18653/v1/2022.naacl-main.293. URL https://aclanthology.org/2022.naacl-main.293/.

B. Minixhofer, J. Pfeiffer, and I. Vulić. CompoundPiece: Evaluating and improving decompounding performance of language models. In H. Bouamor, J. Pino, and K. Bali, editors, Proceedings of the 2023 Conference on Empirical Methods in Natural Language Processing, pages 343–359, Singapore, Dec. 2023. Association for Computational Linguistics. doi: 10.18653/v1/2023.emnlp-main.24. URL https://aclanthology.org/2023.emnlp-main.24/.

B. Minixhofer, E. M. Ponti, and I. Vulić. Zero-shot tokenizer transfer, 2025a. URL https://arxiv.org/abs/2405.

07883.

B. Minixhofer, I. Vulić, and E. Ponti. Universal cross-tokenizer distillation via approximate likelihood matching. In The Thirty-ninth Annual Conference on Neural Information Processing Systems, 2025b. URL https://openreview.

net/forum?id=DxKP2E0xK2.

MosaicML. Llm foundry - jeopardy dataset. https://github.com/mosaicml/llm-foundry/blob/main/scripts/eval/ local_data/world_knowledge/jeopardy_all.jsonl, 2024. Accessed: 2024-11-10.

P. Nawrot, S. Tworkowski, M. Tyrolski, L. Kaiser, Y. Wu, C. Szegedy, and H. Michalewski. Hierarchical transformers are more efficient language models. In M. Carpuat, M.-C. de Marneffe, and I. V. Meza Ruiz, editors, Findings of the Association for Computational Linguistics: NAACL 2022, pages 1559–1571, Seattle, United States, July 2022. Association for Computational Linguistics. doi: 10.18653/v1/2022.findings-naacl.117. URL https://aclanthology. org/2022.findings-naacl.117/.

P. Nawrot, J. Chorowski, A. Lancucki, and E. M. Ponti. Efficient transformers with dynamic token pooling. In A. Rogers, J. Boyd-Graber, and N. Okazaki, editors, Proceedings of the 61st Annual Meeting of the Association for Computational Linguistics (Volume 1: Long Papers), pages 6403–6417, Toronto, Canada, July 2023. Association for Computational Linguistics. doi: 10.18653/v1/2023.acl-long.353. URL https://aclanthology.org/2023.acl-long.353/.

P. Neitemeier, B. Deiseroth, C. Eichenberg, and L. Balles. Hierarchical autoregressive transformers: Combining byte- and word-level processing for robust, adaptable language models. In The Thirteenth International Conference on Learning Representations, 2025. URL https://openreview.net/forum?id=tU074jg2vS.

T. OLMo, P. Walsh, L. Soldaini, D. Groeneveld, K. Lo, S. Arora, A. Bhagia, Y. Gu, S. Huang, M. Jordan, N. Lambert, D. Schwenk, O. Tafjord, T. Anderson, D. Atkinson, F. Brahman, C. Clark, P. Dasigi, N. Dziri, M. Guerquin, H. Ivison, P. W. Koh, J. Liu, S. Malik, W. Merrill, L. J. V. Miranda, J. Morrison, T. Murray, C. Nam, V. Pyatkin, A. Rangapur, M. Schmitz, S. Skjonsberg, D. Wadden, C. Wilhelm, M. Wilson, L. Zettlemoyer, A. Farhadi, N. A. Smith, and H. Hajishirzi. 2 olmo 2 furious, 2024. URL https://arxiv.org/abs/2501.00656.

T. OLMo, P. Walsh, L. Soldaini, D. Groeneveld, K. Lo, S. Arora, A. Bhagia, Y. Gu, S. Huang, M. Jordan, N. Lambert, D. Schwenk, O. Tafjord, T. Anderson, D. Atkinson, F. Brahman, C. Clark, P. Dasigi, N. Dziri, A. Ettinger, M. Guerquin, D. Heineman, H. Ivison, P. W. Koh, J. Liu, S. Malik, W. Merrill, L. J. V. Miranda, J. Morrison, T. Murray, C. Nam, J. Poznanski, V. Pyatkin, A. Rangapur, M. Schmitz, S. Skjonsberg, D. Wadden, C. Wilhelm, M. Wilson, L. Zettlemoyer, A. Farhadi, N. A. Smith, and H. Hajishirzi. 2 olmo 2 furious, 2025. URL https: //arxiv.org/abs/2501.00656.

Olmo Team. Olmo 3, 2025. URL https://allenai.org/papers/olmo3.

A. Pagnoni, R. Pasunuru, P. Rodriguez, J. Nguyen, B. Muller, M. Li, C. Zhou, L. Yu, J. E. Weston, L. Zettlemoyer, G. Ghosh, M. Lewis, A. Holtzman, and S. Iyer. Byte latent transformer: Patches scale better than tokens. In W. Che, J. Nabende, E. Shutova, and M. T. Pilehvar, editors, Proceedings of the 63rd Annual Meeting of the Association for Computational Linguistics (Volume 1: Long Papers), pages 9238–9258, Vienna, Austria, July 2025. Association for Computational Linguistics. ISBN 979-8-89176-251-0. doi: 10.18653/v1/2025.acl-long.453. URL https://aclanthology.org/2025.acl-long.453/.

<!-- page 27 of 35 -->

A. Pal, L. K. Umapathi, and M. Sankarasubbu. Medmcqa: A large-scale multi-subject multi-choice dataset for medical domain question answering. In G. Flores, G. H. Chen, T. Pollard, J. C. Ho, and T. Naumann, editors, Proceedings of the Conference on Health, Inference, and Learning, volume 174 of Proceedings of Machine Learning Research, pages 248–260. PMLR, 07–08 Apr 2022. URL https://proceedings.mlr.press/v174/pal22a.html.

D. Paperno, G. Kruszewski, A. Lazaridou, Q. N. Pham, R. Bernardi, S. Pezzelle, M. Baroni, G. Boleda, and R. Fernández.

The lambada dataset: Word prediction requiring a broad discourse context. arXiv preprint arXiv:1606.06031, 2016.

Q. Peng, Y. Chai, and A. Søgaard. Understanding subword compositionality of large language models. In C. Christodoulopoulos, T. Chakraborty, C. Rose, and V. Peng, editors, Proceedings of the 2025 Conference on Empirical Methods in Natural Language Processing, pages 22524–22535, Suzhou, China, Nov. 2025. Associ- ation for Computational Linguistics. ISBN 979-8-89176-332-6. doi: 10.18653/v1/2025.emnlp-main.1146. URL https://aclanthology.org/2025.emnlp-main.1146/.

J. Pfeiffer, S. Ruder, I. Vulić, and E. Ponti. Modular deep learning. Transactions on Machine Learning Research, 2023.

ISSN 2835-8856. URL https://openreview.net/forum?id=z9EkXfvxta. Survey Certification.

B. Phan, B. Amos, I. Gat, M. Havasi, M. Muckley, and K. Ullrich. Exact byte-level probabilities from tokenized language models for fim-tasks and model ensembles. arXiv preprint arXiv:2410.09303, 2024.

A. Piché, E. Kamalloo, R. Pardinas, X. Chen, and D. Bahdanau. Pipelinerl: Faster on-policy reinforcement learning for long sequence generation, 2025. URL https://arxiv.org/abs/2509.19128.

P. Rajpurkar, J. Zhang, K. Lopyrev, and P. Liang. SQuAD: 100,000+ questions for machine comprehension of text.

In J. Su, K. Duh, and X. Carreras, editors, Proceedings of the 2016 Conference on Empirical Methods in Natural Language Processing, pages 2383–2392, Austin, Texas, Nov. 2016. Association for Computational Linguistics. doi: 10.18653/v1/D16-1264. URL https://aclanthology.org/D16-1264.

S. Reddy, D. Chen, and C. D. Manning. CoQA: A conversational question answering challenge. Transactions of the Association for Computational Linguistics, 7:249–266, 2019. doi: 10.1162/tacl_a_00266. URL https: //aclanthology.org/Q19-1016.

P. Rust, J. F. Lotz, E. Bugliarello, E. Salesky, M. de Lhoneux, and D. Elliott. Language modelling with pixels. In The Eleventh International Conference on Learning Representations, 2023. URL https://openreview.net/forum?id= FkSp8VW8RjH.

K. Sakaguchi, R. Le Bras, C. Bhagavatula, and Y. Choi. WinoGrande: An adversarial winograd schema challenge at scale. Proceedings of the AAAI Conference on Artificial Intelligence, 34(05):8732–8740, Apr. 2020. doi: 10.1609/ aaai.v34i05.6399. URL https://ojs.aaai.org/index.php/AAAI/article/view/6399.

M. Sap, H. Rashkin, D. Chen, R. Le Bras, and Y. Choi. Social IQa: Commonsense reasoning about social interactions.

In K. Inui, J. Jiang, V. Ng, and X. Wan, editors, Proceedings of the 2019 Conference on Empirical Methods in Natural Language Processing and the 9th International Joint Conference on Natural Language Processing (EMNLP- IJCNLP), pages 4463–4473, Hong Kong, China, Nov. 2019. Association for Computational Linguistics. doi: 10.18653/v1/D19-1454. URL https://aclanthology.org/D19-1454.

R. Sennrich, B. Haddow, and A. Birch. Neural Machine Translation of Rare Words with Subword Units. In K. Erk and N. A. Smith, editors, Proceedings of the 54th Annual Meeting of the Association for Computational Linguistics (Volume 1: Long Papers), pages 1715–1725, Berlin, Germany, Aug. 2016. Association for Computational Linguistics.

doi: 10.18653/v1/P16-1162. URL https://aclanthology.org/P16-1162.

I. Shenfeld, J. Pari, and P. Agrawal. Rl’s razor: Why online reinforcement learning forgets less, 2025. URL https://arxiv.org/abs/2509.04259.

K. Slagle. Spacebyte: Towards deleting tokenization from large language modeling. In The Thirty-eighth Annual Conference on Neural Information Processing Systems, 2024. URL https://openreview.net/forum?id=KEe4IUp20I.

A. Talmor, J. Herzig, N. Lourie, and J. Berant. CommonsenseQA: A question answering challenge targeting commonsense knowledge. In J. Burstein, C. Doran, and T. Solorio, editors, Proceedings of the 2019 Conference of the North American Chapter of the Association for Computational Linguistics: Human Language Technologies, Volume 1 (Long and Short Papers), pages 4149–4158, Minneapolis, Minnesota, June 2019. Association for Computational Linguistics. doi: 10.18653/v1/N19-1421. URL https://aclanthology.org/N19-1421.

D. Tito Svenstrup, J. Hansen, and O. Winther. Hash embeddings for efficient word representations. In I. Guyon, U. V. Luxburg, S. Bengio, H. Wallach, R. Fergus, S. Vishwanathan, and R. Garnett, editors, Advances in Neural

<!-- page 28 of 35 -->

Information Processing Systems, volume 30. Curran Associates, Inc., 2017. URL https://proceedings.neurips. cc/paper_files/paper/2017/file/f0f6ba4b5e0000340312d33c212c3ae8-Paper.pdf.

K. Tran. From english to foreign languages: Transferring pre-trained language models, 2020. URL https://arxiv.

org/abs/2002.07306.

O. Uzan and Y. Pinter. Charbench: Evaluating the role of tokenization in character-level tasks, 2025. URL https://arxiv.org/abs/2508.02591.

A. Vaswani, N. Shazeer, N. Parmar, J. Uszkoreit, L. Jones, A. N. Gomez, L. u. Kaiser, and I. Polosukhin. Attention is all you need. In I. Guyon, U. V. Luxburg, S. Bengio, H. Wallach, R. Fergus, S. Vishwanathan, and R. Garnett, editors, Advances in Neural Information Processing Systems, volume 30. Curran Associates, Inc., 2017. URL https: //proceedings.neurips.cc/paper_files/paper/2017/file/3f5ee243547dee91fbd053c1c4a845aa-Paper.pdf.

T. Vieira, B. LeBrun, M. Giulianelli, J. L. Gastaldi, B. DuSell, J. Terilla, T. J. O’Donnell, and R. Cotterell. From language models over tokens to language models over characters. In Forty-second International Conference on Machine Learning, 2025. URL https://openreview.net/forum?id=sQS0roNQZR.

J. Wang, T. Gangavarapu, J. N. Yan, and A. M. Rush. Mambabyte: Token-free selective state space model. In First Conference on Language Modeling, 2024. URL https://openreview.net/forum?id=X1xNsuKssb.

H. Wei, Y. Sun, and Y. Li. Deepseek-ocr: Contexts optical compression, 2025. URL https://arxiv.org/abs/2510.

18234.

J. Welbl, N. F. Liu, and M. Gardner. Crowdsourcing multiple choice science questions. In L. Derczynski, W. Xu, A. Ritter, and T. Baldwin, editors, Proceedings of the 3rd Workshop on Noisy User-generated Text, pages 94–106, Copenhagen, Denmark, Sept. 2017. Association for Computational Linguistics. doi: 10.18653/v1/W17-4413. URL https://aclanthology.org/W17-4413/.

L. Xue, A. Barua, N. Constant, R. Al-Rfou, S. Narang, M. Kale, A. Roberts, and C. Raffel. ByT5: Towards a token-free future with pre-trained byte-to-byte models. Transactions of the Association for Computational Linguistics, 10: 291–306, 2022. doi: 10.1162/tacl_a_00461. URL https://aclanthology.org/2022.tacl-1.17/.

S. Yang, J. Kautz, and A. Hatamizadeh. Gated delta networks: Improving mamba2 with delta rule. In The Thirteenth International Conference on Learning Representations, 2025. URL https://openreview.net/forum?id=r8H7xhYPwz.

F. Yergeau. Utf-8, a transformation format of iso 10646. Technical report, 2003.

G.-I. Yu, J. S. Jeong, G.-W. Kim, S. Kim, and B.-G. Chun. Orca: A distributed serving system for Transformer- Based generative models. In 16th USENIX Symposium on Operating Systems Design and Implementation (OSDI 22), pages 521–538, Carlsbad, CA, July 2022. USENIX Association. ISBN 978-1-939133-28-1. URL https: //www.usenix.org/conference/osdi22/presentation/yu.

L. Yu, D. Simig, C. Flaherty, A. Aghajanyan, L. Zettlemoyer, and M. Lewis. MEGABYTE: Predicting million-byte sequences with multiscale transformers. In Thirty-seventh Conference on Neural Information Processing Systems, 2023. URL https://openreview.net/forum?id=JTmO2V9Xpz.

R. Zellers, A. Holtzman, Y. Bisk, A. Farhadi, and Y. Choi. HellaSwag: Can a machine really finish your sentence? In A. Korhonen, D. Traum, and L. Màrquez, editors, Proceedings of the 57th Annual Meeting of the Association for Computational Linguistics, pages 4791–4800, Florence, Italy, July 2019. Association for Computational Linguistics.

doi: 10.18653/v1/P19-1472. URL https://aclanthology.org/P19-1472.

Y. Zhang and Q. Yang. A survey on multi-task learning, 2021. URL https://arxiv.org/abs/1707.08114.

B. S. Zheng, A. Liu, O. Ahia, J. Hayase, Y. Choi, and N. A. Smith. Broken tokens? your language model can secretly handle non-canonical tokenizations. In The Thirty-ninth Annual Conference on Neural Information Processing Systems, 2025a. URL https://openreview.net/forum?id=WrYWolqKh3.

L. Zheng, X. Zhao, G. Wang, C. Wu, D. Dong, A. Wang, M. Wang, Y. Du, H. Bo, A. Sharma, B. Li, K. Zhang, C. Hu, U. Thakker, and L. Kong. Evabyte: Efficient byte-level language models at scale, 2025b. URL https: //hkunlp.github.io/blog/2025/evabyte.

T. Y. Zhuo, M. C. Vu, J. Chim, H. Hu, W. Yu, R. Widyasari, I. N. B. Yusuf, H. Zhan, J. He, I. Paul, et al. Bigcodebench: Benchmarking code generation with diverse function calls and complex instructions. arXiv preprint arXiv:2406.15877, 2024.
<!-- page 29 of 35 -->

Table 3 Comparison of various boundary prediction settings after Stage 1 training across oracle (subword) boundaries and the boundaries as predicted, predicting the patch start causally (Start, C), patch end causally (End, C), patch end non-causally using a separate boundary symbol (End, NC(S)) and patch end non-causally with fused boundaries (End, NC(F)), our chosen setting. $\mathcal{E}$ Sim. = the cosine similarity of the pooled local encoder representations to the corresponding subword embeddings, $\mathcal{B}$ Acc.= accuracy of the boundary predictor. $L/G$ = average number of local model invocations per global model invocation. **Boldface** indicates the best result per column.

|  | $\mathcal{E}$ Sim. | $\mathcal{B}$ Acc. | $L/G$ | ARC | MMLU | CSQA | HS | WinoG | SocialIQA | PIQA | B.Skills | CUTE | Avg. |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| OLMo2 1B | - | - | - | 61.4 | 40.4 | 66.0 | 68.9 | 65.2 | 55.1 | 76.4 | 72.9 | 27.5 | 59.3 |
| **Oracle Boundaries ($\mathcal{B} = \mathcal{B}_{\text{Subword}}$)** | | | | | | | | | | | | | |
| Start, C | 97.5 | 100 | 8.8 | 57.4 | 35.4 | 64.4 | 65.0 | 65.1 | 54.0 | 74.5 | 66.2 | 19.6 | 55.7 |
| End, C | 99.7 | 100 | 8.8 | 59.0 | 36.7 | 64.1 | 67.4 | 65.1 | 53.2 | 74.6 | 71.3 | 30.8 | 58.0 |
| End, NC(S) | 99.8 | 100 | 9.8 | 58.5 | 36.8 | 63.4 | 68.0 | 66.1 | 53.6 | 74.6 | 71.6 | 31.2 | 58.2 |
| End, NC(F) | 99.8 | 100 | 8.8 | 58.2 | 36.8 | 62.6 | 67.7 | 66.9 | 52.4 | 75.0 | 70.7 | 30.7 | 57.9 |
| **Learned Boundary Prediction ($\mathcal{B} \in \{\mathcal{B}_{\text{H-Net}},\mathcal{B}_{\text{BOLMo}}\}$)** | | | | | | | | | | | | | |
| Start, C | 97.5 | **99.2** | **8.8** | 54.1 | 33.4 | **63.6** | 57.9 | 64.1 | **52.9** | 70.4 | 64.7 | 19.6 | 53.4 |
| End, C | 99.7 | 96.0 | **8.8** | 45.9 | 29.3 | 43.4 | 41.8 | 57.5 | 44.0 | 62.4 | 50.8 | 7.8 | 42.5 |
| End, NC(S) | **99.8** | **99.2** | 9.8 | **56.2** | **34.7** | 61.3 | **61.4** | 64.2 | 52.4 | 71.6 | **69.3** | **29.8** | **55.7** |
| End, NC(F) | **99.8** | **99.2** | **8.8** | **56.2** | 34.6 | 61.9 | **61.4** | **65.0** | 51.7 | **71.9** | 69.0 | 28.8 | 55.6 |

## A Additional Ablations

**Analyzing the choice of boundary predictor.** Table 3 compares various choices for the boundary predictor, confirming that fused non-causal boundary prediction of the patch end is best for bytefying. Additionally, analyzing the performance under the original subword ('oracle') boundaries shows that the remainder of the gap to the source model after Stage 1 can be mostly explained by the remaining small percentage of errors of the boundary predictor.

**分析边界预测器的选择.** 表 3 比较了边界预测器的多种选择, 证实融合式非因果 patch 终点预测最适合字节化. 此外, 在原始子词 (「oracle」) 边界下分析性能可以看出, 阶段 1 之后与源模型剩下的差距大多可以用边界预测器残留的小比例错误来解释.

只看任务均值, 不是. oracle 边界下 NC(S) 的 Avg. 是 58.2, NC(F) 是 57.9; 学到的边界下 NC(S) 是 55.7 (加粗), NC(F) 是 55.6. 两种设置下都是单独 `<b>` 符号的 NC(S) 略高. NC(F) 的优势在成本: $L/G$ 从 9.8 降到 8.8, 局部模型每次全局调用少跑一个位置. 8.8 与 9.8 的来历: 平均每 patch 约 4.4 字节, 编码器与解码器各跑 4.4 个位置, 合计 8.8; 单独 `<b>` 让解码器每个 patch 多一个位置, 变成 9.8. 所以「最好」应理解为在性能几乎持平时成本最低. 另外 oracle 行与学到的行之差 (NC(F) 从 57.9 到 55.6) 才是边界错误的代价, 而 oracle 的 57.9 与 OLMo2 1B 的 59.3 之间的 1.4 分并不来自边界错误.

**Comparing byteification to standard continued training.** Table 4 compares Bolmo to an Olmo 3 model with continued training on the same data under the same training settings (same batch size, optimizer, etc., see Table 8). Continued training without byteification generally degrades performance, potentially forgetting due to a narrower data mix and suboptimal training procedure. A notable exception is character understanding, where the model improves due to the training data targeting this skill (Appendix C), but remains worse than Bolmo. While some gap between the byteified model and the model with continued training persists, we believe a promising direction to improve bytefying is thus to apply techniques which generally make training less prone to forgetting, such as applying PEFT methods (e.g. Hu et al., 2022; Pfeiffer et al., 2023).

**比较字节化与普通继续训练.** 表 4 把 Bolmo 与在相同数据, 相同训练设置 (相同 batch size, 优化器等, 见表 8) 下继续训练的 Olmo 3 对比. 不做字节化的继续训练一般也会降低性能, 可能是因为数据混合更窄, 训练流程欠佳导致遗忘. 显著的例外是字符理解: 由于训练数据针对这项能力 (附录 C), 模型有所提升, 但仍不如 Bolmo. 字节化模型与继续训练模型之间仍有一些差距, 因此我们认为改进字节化的一个有前景的方向是使用一般能减少遗忘的技术, 例如 PEFT 方法.

## B Benchmark Details

We utilize OLMES (OLMo et al., 2024) for all evaluations. See Table 5 for details on our 7B evaluation suite, and Table 6 for details on our 1B evaluation suite.

所有评测都用 OLMES. 7B 评测套件细节见表 5, 1B 评测套件见表 6.

## C CUTE-Style Training Data

To encourage models trained on our data mix to learn information about the characters within a word, we generate ∼75M tokens (∼0.04% of the training data) of tasks requiring character-level understanding using the CUTE repository. Tasks include spelling out words, reversing words as well as swapping, deleting, and substituting characters within a word given words in a source wordlist. We use a list of $n = 150000$ words, ensuring zero overlap with the CUTE test words to avoid contamination. This data is purely in English. We do not use any multilingual character understanding data, but still observe large improvements on the multilingual EXECUTE benchmark (see Section 5), suggesting that some texts requiring character-level understanding can help acquire generalizable knowledge about the characters within words. We observed

为促使在我们数据混合上训练的模型学到词内字符的信息, 我们用 CUTE 仓库生成了约 75M token (约占训练数据的 0.04%) 需要字符级理解的任务. 任务包括拼出单词, 倒序单词, 以及对源词表中的单词做字符交换, 删除和替换. 词表有 $n = 150000$ 个词, 确保与 CUTE 测试词零重叠以免污染. 这些数据全是英语. 我们没有用任何多语言字符理解数据, 但在多语言的 EXECUTE 基准上仍看到大幅提升 (见第 5 节), 说明一些需要字符级理解的文本能帮助模型习得关于词内字符的可泛化知识. 我们观察到

<!-- page 30 of 35 -->

Table 4 Results comparing Bolmo to the source Olmo 3 model with continued training for the same amount of tokens on the Bolmo data mix and the original Olmo 3; the degradation from byteifying is not specifically caused by the conversion to bytes; it can to a substantial extent be attributed to continued training of the source model. **Boldface** indicates the best result per task, <u>underline</u> the second best.

|  | Bolmo 7B | Olmo 3 CT 7B | Olmo 3 7B |
|---|---|---|---|
| **Char** | **75.1** | <u>71.0</u> | 56.0 |
| CUTE | **78.6** | <u>72.9</u> | 56.9 |
| EXECUTE | **71.6** | <u>69.2</u> | 55.1 |
| **Code** | **40.7** | 37.8 | <u>39.5</u> |
| HumanEval pass@1/@16 | 40.6 / **74.7** | <u>42.4</u> / 64.9 | **49.0** / <u>71.1</u> |
| DeepSeek LeetCode pass@1/@16 | **2.3** / **7.6** | 0.7 / 2.9 | <u>1.6</u> / <u>6.2</u> |
| DS 1000 | 14.9 | <u>19.4</u> | **20.1** |
| MBPP pass@1/@16 | 42.8 / **68.0** | **45.7** / <u>57.2</u> | <u>44.3</u> / 54.9 |
| MultiPL HumanEval pass@1/@16 | 26.8 / **62.5** | <u>30.1</u> / 53.4 | **33.6** / <u>56.3</u> |
| MultiPL MBPP pass@1/@16 | <u>38.0</u> / **69.2** | **38.4** / <u>60.5</u> | 37.8 / 59.9 |
| **Math** | 48.9 | <u>49.8</u> | **55.3** |
| GSM8K | <u>68.0</u> | 67.6 | **73.1** |
| MATH | 29.8 | <u>32.0</u> | **37.5** |
| **MC STEM** | 65.5 | <u>66.1</u> | **66.3** |
| ARC MC | 88.5 | <u>88.7</u> | **89.2** |
| MMLU STEM | 57.0 | <u>57.7</u> | **59.5** |
| MedMCQA MC | 47.8 | **48.9** | <u>48.2</u> |
| MedQA MC | <u>42.4</u> | **42.9** | 42.0 |
| SciQ MC | 91.9 | <u>92.5</u> | **92.8** |
| **MC Non-STEM** | 75.8 | <u>76.6</u> | **77.7** |
| MMLU Humanities | 67.2 | <u>68.2</u> | **69.2** |
| MMLU Social Sci. | <u>74.0</u> | **75.2** | **75.2** |
| MMLU Other | 65.1 | <u>66.2</u> | **66.9** |
| CSQA MC | 73.6 | <u>74.6</u> | **75.2** |
| PiQA MC | <u>79.4</u> | 79.1 | **80.3** |
| SocialIQA MC | 79.1 | <u>79.2</u> | **80.4** |
| CoQA Gen2MC MC | 90.0 | <u>90.2</u> | **92.9** |
| DROP Gen2MC MC | 59.1 | <u>61.1</u> | **62.5** |
| Jeopardy Gen2MC MC | 84.8 | **86.3** | <u>85.5</u> |
| NaturalQs Gen2MC MC | 65.9 | <u>66.6</u> | **69.6** |
| SQuAD Gen2MC MC | <u>95.8</u> | 95.7 | **96.8** |
| **GenQA** | 70.9 | <u>71.7</u> | **72.4** |
| HellaSwag RC | **78.8** | <u>78.6</u> | 77.8 |
| Winogrande RC | 85.5 | **85.8** | <u>85.7</u> |
| Lambada | **71.1** | <u>69.9</u> | 68.0 |
| Basic Skills | 89.6 | <u>89.8</u> | **90.0** |
| DROP | <u>65.2</u> | 65.0 | **71.5** |
| Jeopardy | 56.8 | **63.1** | <u>60.3</u> |
| NaturalQs | 28.6 | <u>31.1</u> | **32.6** |
| SQuAD | 91.6 | <u>92.0</u> | **93.5** |
| CoQA | <u>70.5</u> | 70.0 | **72.7** |

that byte-level models otherwise do not acquire this knowledge through our short training schedule. However, training for longer, on more diverse data, or with larger local models could act as alternative routes to acquire character-level knowledge.

如果没有这些数据, 字节级模型在我们这么短的训练里学不到这类知识. 不过训练更久, 用更多样的数据, 或用更大的局部模型, 都可能是习得字符级知识的其他途径.

## D Does Post-Training Byteified Models via Task Arithmetic Always Work?

As outlined in Section 5.2, embedding resettability is a crucial prerequisite of post-training byteified models via Task Arithmetic. This is the case since we can transfer the global model $\mathcal{M}$ to the post-trained space via

如 5.2 节所述, 嵌入可重置性是用任务算术给字节化模型做后训练的关键前提. 原因是我们可以通过

<!-- page 31 of 35 -->

Table 5 Details of the Bolmo 7B evaluation suite, adapted from Olmo Team (2025)'s OlmoBaseEval. Tasks were formatted as multiple-choice (MC), rank choice (RC, following the setup in Gu et al. (2024)), short-form generative (GenQA), chain-of-thought with exact-match scoring (CoT EM) or Code Execution (Code Exec.). † = few-shot examples are built-in the task; α = human-written few-shot examples; # sub = number of subtasks.

|  | task | ICL | format | metric | temp | top-p | max toks | p@k (n) | # sub |
|---|---|---|---|---|---|---|---|---|---|
| **Bolmo 7B Suite** | | | | | | | | | |
|  | CUTE | 4 | Greedy Cont. | Acc | - | - | - | - | - |
| Char | EXECUTE | 4 | Greedy Cont. | Acc | - | - | - | - | - |
|  | HumanEval | 3 | Code Exec. | pass@k | 0.6 | 0.6 | 512 | 1, 16 (32) | - |
|  | MBPP | 3 | Code Exec. | pass@k | 0.6 | 0.6 | 512 | 1, 16 (32) | - |
|  | BigCodeBench | 3 | Code Exec. | pass@k | 0.6 | 0.6 | 1280 | 1 (5) | - |
|  | DS 1000 | 3 | Code Exec. | pass@k | 0.6 | 0.6 | 1024 | 1 (5) | - |
|  | Deepseek LeetCode | 0 | Code Exec. | pass@k | 0.6 | 0.6 | 512 | 1, 16 (32) | - |
|  | MultiPL-E HumanEval | 0 | Code Exec. | pass@k | 0.6 | 0.6 | 1024 | 1, 16 (32) | 6 |
| Code | MultiPL-E MBPP | 0 | Code Exec. | pass@k | 0.6 | 0.6 | 1024 | 1, 16 (32) | 6 |
|  | GSM8K | 8<sup>α</sup> | CoT EM | pass@k | 0.6 | 0.6 | 512 | 1, 4 (8) | - |
| Math | Minerva MATH | 4<sup>α</sup> | CoT EM | pass@k | 0.6 | 0.6 | 1024 | 1, 4 (4) | 7 |
|  | ARC | 5 | MC | Acc | - | - | - | - | 2 |
|  | MMLU STEM | 5 | MC | Acc | - | - | - | - | 19 |
|  | MedMCQA | 5 | MC | Acc | - | - | - | - | - |
|  | MedQA | 5 | MC | Acc | - | - | - | - | - |
| STEM QA | SciQ | 5 | MC | Acc | - | - | - | - | - |
|  | MMLU Humanities | 5 | MC | Acc | - | - | - | - | 13 |
|  | MMLU Social Sci. | 5 | MC | Acc | - | - | - | - | 12 |
|  | MMLU Other | 5 | MC | Acc | - | - | - | - | 14 |
|  | CSQA | 5 | MC | Acc | - | - | - | - | - |
|  | PiQA | 5 | MC | Acc | - | - | - | - | - |
|  | SocialIQA | 5 | MC | Acc | - | - | - | - | - |
|  | DROP Gen2MC (Olmo Team, 2025) | 5 | MC | Acc | - | - | - | - | - |
|  | Jeopardy Gen2MC (Olmo Team, 2025) | 5 | MC | Acc | - | - | - | - | - |
|  | NaturalQs Gen2MC (Olmo Team, 2025) | 5 | MC | Acc | - | - | - | - | - |
|  | SQuAD Gen2MC (Olmo Team, 2025) | 5 | MC | Acc | - | - | - | - | - |
|  | CoQA Gen2MC (Olmo Team, 2025) | 0<sup>†</sup> | MC | Acc | - | - | - | - | - |
| Non-STEM QA | Basic Skills (Olmo Team, 2025) | 5 | MC | Acc | - | - | - | - | 6 |
|  | HellaSwag | 5 | RC (per-char) | Acc | - | - | - | - | - |
|  | WinoGrande | 5 | RC (none) | Acc | - | - | - | - | - |
|  | Lambada | 0 | Greedy Cont. | Acc | - | - | - | - | - |
|  | Basic Skills (Olmo Team, 2025) | 5 | RC (per-token) | Acc | - | - | - | - | 6 |
|  | DROP | 5 | GenQA | F1 | 0 | 1 | 100 | - | - |
|  | Jeopardy | 5 | GenQA | F1 | 0 | 1 | 50 | - | - |
|  | NaturalQs | 5 | GenQA | F1 | 0 | 1 | 50 | - | - |
|  | SQuAD | 5 | GenQA | F1 | 0 | 1 | 50 | - | - |
| GenQA | CoQA | 0<sup>†</sup> | GenQA | F1 | 0 | 1 | 50 | - | - |

Task Arithmetic, but we can not transfer the local models since they do not have corresponding parameters in the post-trained checkpoint.

任务算术把全局模型 $\mathcal{M}$ 迁移到后训练空间, 但局部模型在后训练 checkpoint 里没有对应参数, 无法迁移.

In Figure 8, we analyze embedding resettability across a number of models. Resetting the embeddings is possible without substantial performance degradation for a substantial fraction of the analyzed models, with a weak trend toward larger models being more amenable to it. Additionally, in line with the findings of Shenfeld et al. (2025), we find models post-trained via RL (the Olmo 3 RL-Zero family; Olmo Team, 2025) to be closer to the original model; here, embedding resetting almost perfectly preserves the original models' performance.

图 8 分析了多个模型的嵌入可重置性. 相当一部分模型重置嵌入后性能没有明显下降, 且有较弱的趋势: 模型越大越容易重置. 此外, 与 Shenfeld 等 (2025) 的发现一致, 用 RL 后训练的模型 (Olmo 3 RL-Zero 系列) 更接近原模型, 重置嵌入几乎完全保留了原模型的性能.

Future work could investigate in more detail when post-training via Task Arithmetic is possible, and whether it is possible to restore the ability to byteify without additional training for post-trained models where this is not the case as-is.

未来可以更细致地研究什么情况下能用任务算术做后训练, 以及对于本身不满足条件的后训练模型, 能否恢复无需额外训练就可字节化的能力.

## E Embedding Rank Analysis

Figure 9 shows the explained variance ratio of the singular values of the input and output embedding matrices across a number of models. Besides one exception (Qwen3-4B-Base input embeddings), there is a substantial

图 9 给出多个模型输入与输出嵌入矩阵奇异值的解释方差比. 除了一个例外 (Qwen3-4B-Base 的输入嵌入), 都存在相当多的

<!-- page 32 of 35 -->

Table 6 Details of the Bolmo 1B evaluation suite, adapted from Olmo Team (2025)'s Base Easy Suite. Tasks were formatted as rank choice (RC, following the setup in Gu et al. (2024)) † = few-shot examples are built-in the task; α = human-written few-shot examples; # sub = number of subtasks, * = selected core tasks.

| task | capability | ICL | metric | # sub |
|---|---|---|---|---|
| **Bolmo 1B Suite** | | | | |
| ARC* | Science QA | 5 | Acc | 2 |
| MMLU* | General QA | 5 | Acc | 57 |
| CSQA* | Commonsense QA | 5 | Acc | - |
| HellaSwag* | Language Modeling | 5 | Acc | - |
| WinoGrande* | Language Modeling | 5 | Acc | - |
| SocialIQA* | Social QA | 5 | Acc | - |
| PiQA* | Physical QA | 5 | Acc | - |
| CoQA | Conversation QA | 0<sup>†</sup> | Acc | - |
| DROP | Passage QA | 5 | Acc | - |
| Jeopardy | Trivia QA | 5 | Acc | - |
| NaturalQs | General QA | 5 | Acc | - |
| SQuAD | General QA | 5 | Acc | - |
| SciQ | Science QA | 5 | Acc | - |
| QASPER | Science QA | 5 | Acc | - |
| Basic Skills* | Basic QA | 5 | Acc | 6 |
| DBQA | Science QA | 5 | Acc | - |
| ProtocolQA | Science QA | 5 | Acc | - |
| Lambada | Language Modeling | 0 | Acc | - |
| MedMCQA | Medical QA | 5 | Acc | - |
| MedQA | Medical QA | 5 | Acc | - |
| SciRIFF | Science QA | 5 | Acc | - |
| CUTE* | Character Understanding | 4 | Acc | - |

amount of high-rank structure. This makes the embeddings difficult to approximate using lower-dimensional local models. In particular, in the case of the local encoder, the embedding rank has a hard limit given by the dimensionality of the local model if a linear upprojection or padding is used to upproject (as done, e.g., by Hwang et al., 2025). Concatenation of the local representations, as done by Pagnoni et al. (2025), does not lead to a hard limit on the rank but may still limit expressivity.

高秩结构. 这使得嵌入很难用低维局部模型逼近. 尤其对局部编码器而言, 若用线性升维投影或填充来升维 (如 Hwang 等, 2025), 嵌入的秩会受局部模型维度的硬性限制. Pagnoni 等 (2025) 那样拼接局部表示不会造成秩的硬上限, 但仍可能限制表达力.

## F Full Hyperparameters

Full architecture hyperparameters are shown in Table 7, and full training in Table 8.

完整架构超参数见表 7, 完整训练超参数见表 8.

<!-- page 33 of 35 -->

![Figure 8](images/emb_reset.png)

Figure 8 (left): Cross-Entropy loss for post-trained models, and the same post-trained models with the embeddings reset to the corresponding base model embeddings; loss is computed on examples from the Tulu 3 dataset (Lambert et al., 2024). (right): Number of model parameters vs. the loss ratio of the model with reset embeddings to the original post-trained model. The number of parameters explains some variance (with larger models being more amenable to reset embeddings), with the remaining variance presumably being due to different post-training choices.

![Figure 9](images/embedding_rank.png)

Figure 9 The explained variance ratio of the singular values of the input and output embedding matrices (normalized by the number of dimensions). The explained variance ratio smoothly decays along the number of components, up until a steep dropoff toward the highest-rank components. This indicates that it is difficult to approximate the embedding matrices using lower-rank structure. A notable exception is Qwen3-4B-Base, which may be more amenable to a lower-dimensional local encoder; we are not so bold as to dare a guess why.

<!-- page 34 of 35 -->

Table 7 Bolmo architecture details.

|  | Bolmo 7B | Bolmo 1B |
|---|---|---|
| Global Model |  |  |
|  | Same as Olmo Team (2025) | Same as OLMo et al. (2024) |
| Local Encoder |  |  |
| Dimension | 4096 | 2048 |
| Layer Type | mLSTM + FFN | mLSTM + FFN |
| Num. Layers | 1 | 1 |
| mLSTM |  |  |
| &emsp;Num. Heads | 16 | 16 |
| &emsp;Nonlinearity | Exponential | Exponential |
| &emsp;QK Dim. | 128 | 128 |
| &emsp;V Dim. | 256 | 256 |
| &emsp;Gate Soft Cap | 15 | 15 |
| &emsp;Input Gate Bias Init. | -10 | -10 |
| FFN |  |  |
| &emsp;Expansion Dim. | 5504 | 2816 |
| &emsp;Nonlinearity | SwiGLU | SwiGLU |
| &emsp;Layer norm | RMSNorm | RMSNorm |
| Local Decoder |  |  |
| Dimension | 4096 | 2048 |
| Layer Type | mLSTM + FFN | mLSTM + FFN |
| Num. Layers | 4 | 4 |
| mLSTM |  |  |
| &emsp;Num. Heads | 16 | 16 |
| &emsp;Nonlinearity | Exponential | Exponential |
| &emsp;QK Dim. | 128 | 128 |
| &emsp;V Dim. | 256 | 256 |
| &emsp;Gate Soft Cap | 15 | 15 |
| &emsp;Input Gate Bias Init. | -10 | -10 |
| FFN |  |  |
| &emsp;Expansion Dim. | 5504 | 2816 |
| &emsp;Nonlinearity | SwiGLU | SwiGLU |
| &emsp;Layer norm | RMSNorm | RMSNorm |

<!-- page 35 of 35 -->

Table 8 Bolmo training details. Throughput estimates are in tokens per second (TPS) and bytes per second (BPS) per accelerator, as achieved by the final training runs on H100 GPUs.

|  | Bolmo 7B | Bolmo 1B |
|---|---|---|
| Stage 1 |  |  |
| Total Training Tokens | 9.8B | 9.8B |
| &emsp;Total Training Bytes | ≈43.1B | ≈43.1B |
| &emsp;Training Steps | 75K | 75K |
| &emsp;Batch Size | 32 | 32 |
| &emsp;Max. Length. (Tokens) | 4096 | 4096 |
| &emsp;Max. Length. (Bytes) | 24576 | 24576 |
| LR Schedule | Warmup + Linear | Warmup + Linear |
| &emsp;Peak LR | 5e-4 | 7e-4 |
| &emsp;Warmup Steps | 7.5K | 7.5K |
| Optimizer | AdamW | AdamW |
| &emsp;Weight Decay | 0.1 | 0.1 |
| &emsp;$\beta_1$, $\beta_2$ | 0.9, 0.95 | 0.9, 0.95 |
| &emsp;Max. Grad. Norm | 0.5 | 0.5 |
| Throughput (TPS) | 9.9K | 34.5K |
| Throughput (BPS) | 59.4K | 207K |
| Stage 2 |  |  |
| Total Training Tokens | 39.3B | 39.3B |
| &emsp;Total Training Bytes | ≈172.9B | ≈172.9B |
| &emsp;Training Steps | 150K | 150K |
| &emsp;Batch Size | 64 | 64 |
| &emsp;Max. Length. (Tokens) | 4096 | 4096 |
| &emsp;Max. Length. (Bytes) | 24576 | 24576 |
| LR Schedule | Warmup + Linear | Warmup + Linear |
| &emsp;Peak LR (Global Model) | 1.8e-5 | 2.6e-5 |
| &emsp;Peak LR (Local Models) | 3.7e-5 | 5.2e-5 |
| &emsp;Warmup Steps | 15K | 15K |
| Optimizer | AdamW | AdamW |
| &emsp;Weight Decay | 0.1 | 0.1 |
| &emsp;$\beta_1$, $\beta_2$ | 0.9, 0.95 | 0.9, 0.95 |
| &emsp;Max. Grad. Norm | 0.5 | 0.5 |
| Throughput (TPS) | 6.3K | 27.7K |
| Throughput (BPS) | 37.8K | 166.2K |

四组吞吐都满足 BPS = 6 × TPS: $59.4/9.9 = 37.8/6.3 = 207/34.5 = 166.2/27.7 = 6.0$. 6 正好是 Max. Length 的比值 $24576/4096$, 训练脚本也按字节设 `global_batch_size` (阶段 1 为 $786432 = 32 \times 24576$). 而同表的 Total Training Bytes 按每 token 约 4.4 字节换算: $43.1/9.8 \approx 4.4$, $172.9/39.3 \approx 4.4$. 两处换算不一致. 若 TPS 是真实 token 吞吐, BPS 就是按每序列 24576 个字节槽位 (含填充) 换算的容量. 按每 token 4.4 字节算, 有效字节吞吐约为表中 BPS 的 $4.4/6 \approx 73\%$, 例如 7B 阶段 2 约 27.7K bytes/s, 而不是 37.8K.
