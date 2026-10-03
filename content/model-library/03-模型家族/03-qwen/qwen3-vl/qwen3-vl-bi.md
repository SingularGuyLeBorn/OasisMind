---
title: "Qwen3-VL · 对照译稿"
category: "模型库"
tags: ["Qwen", "对照译稿"]
published: true
excerpt: "Qwen3-VL 公开材料的逐段中英对照译稿，附读报告时的疑问块。"
---
<!-- page 1 of 42 -->

arXiv:2511.21631v2 [cs.CV] 27 Nov 2025

Qwen

December 1, 2025

# Qwen3-VL Technical Report

**Qwen Team**

[https://chat.qwen.ai](https://chat.qwen.ai)
作者与链接：Qwen 团队；对话 https://chat.qwen.ai.

![Image block](images/p01-image.png)

![Image block](images/p01-https-huggingface-co-qwen-https-huggingface-co-qwen.png)

[https://huggingface.co/Qwen](https://huggingface.co/Qwen)

[https://modelscope.cn/organization/qwen](https://modelscope.cn/organization/qwen)

[https://github.com/QwenLM/Qwen3-VL](https://github.com/QwenLM/Qwen3-VL)
权重 https://huggingface.co/Qwen, https://modelscope.cn/organization/qwen; 代码 https://github.com/QwenLM/Qwen3-VL.

## Abstract

We introduce Qwen3-VL, the most capable vision–language model in the Qwen series to date, achieving superior performance across a broad range of multimodal benchmarks. It natively supports interleaved contexts of up to 256K tokens, seamlessly integrating text, images, and video. The model family includes both dense (2B/4B/8B/32B) and mixture-of-experts (30B-A3B/235B-A22B) variants to accommodate diverse latency–quality trade-offs. Qwen3-VL delivers three core pillars: (i) markedly stronger pure-text understanding, surpassing comparable text-only backbones in several cases; (ii) robust long-context comprehension with a native 256K-token window for both text and interleaved multimodal inputs, enabling faithful retention, retrieval, and cross-referencing across long documents and videos; and (iii) advanced multimodal reasoning across single-image, multi-image, and video tasks, demonstrating leading performance on comprehensive evaluations such as MMMU and visual-math benchmarks (e.g., Math-Vista and MathVision). Architecturally, we introduce three key upgrades: (i) an enhanced interleaved-MRoPE for stronger spatial–temporal modeling across images and video; (ii) DeepStack integration, which effectively leverages multi-level ViT features to tighten vision–language alignment; and (iii) text-based time alignment for video, evolving from T-RoPE to explicit textual timestamp alignment for more precise temporal grounding. To balance text-only and multimodal learning objectives, we apply square-root reweighting, which boosts multimodal performance without compromising text capabilities. We extend pretraining to a context length of 256K tokens and bifurcate post-training into non-thinking and thinking variants to address distinct application requirements. Furthermore, we allocate additional compute resources to the post-training phase to further enhance model performance. Under comparable token budgets and latency constraints, Qwen3-VL achieves superior performance in both dense and Mixture-of-Experts (MoE) architectures. We envision Qwen3-VL serving as a foundational engine for image-grounded reasoning, agentic decision-making, and multimodal code intelligence in real-world workflows.
本报告介绍 **Qwen3-VL**: Qwen 系列迄今最强的视觉语言模型，在广泛多模态基准上取得更优表现。原生支持最长 256K token 的交错上下文，无缝混合文本，图像与视频。型号含 Dense (2B/4B/8B/32B) 与 MoE (30B-A3B/235B-A22B)，覆盖不同延迟-质量折中。三大支柱：（i）纯文本理解显著更强，若干情形超过同级纯文本骨干；（ii）原生 256K 窗口支撑文本与交错多模态长上下文，便于在长文档与长视频上保真留存，检索与交叉引用；（iii）单图，多图与视频上的多模态推理更强，在 MMMU 与视觉数学基准（如 MathVista, MathVision）等综合评测中表现领先。架构三项升级：（i）增强的 interleaved-MRoPE，加强图像与视频时空建模；（ii）接入 DeepStack，利用多层 ViT 特征收紧视觉-语言对齐；（iii）视频改为基于文本的时间对齐，从 T-RoPE 演进到显式文本时间戳，以更精确定位时间。为平衡纯文本与多模态学习目标，采用平方根重加权，抬多模态且不伤文本。预训练上下文延到 256K token；后训练分叉为 non-thinking 与 thinking 两套变体。后训练阶段另加算力以继续抬表现。在可比的 token 预算与延迟约束下，Dense 与 MoE 架构均取得更优结果。展望上，Qwen3-VL 可作为图接地推理，agent 决策与多模态代码智能的基础引擎。

![Image block](images/p01-image-2.png)

![Image block](images/p01-1.png)

<!-- page 2 of 42 -->

## 1 Introduction

Vision–language models (VLMs) have achieved substantive progress in recent years, evolving from foundational visual perception to advanced multimodal reasoning across images and video. The rapid advancement of VLMs has given rise to a rapidly expanding landscape of downstream applications—such as long-context understanding, STEM reasoning, GUI comprehension and interaction, and agentic workflows. Crucially, these advances must not erode the underlying large language model’s (LLM’s) linguistic proficiency; multimodal models are expected to match or surpass their text-only counterparts on language benchmarks.
视觉语言模型（**VLM**）近年从基础视觉感知推进到图像与视频上的多模态推理。下游迅速铺开：长上下文理解，STEM 推理，GUI 理解与交互，agent 工作流。关键约束是：这些进展不得侵蚀底层 **LLM** 的语言能力；多模态模型在语言基准上应达到或超过同级纯文本对照。

In this report, we present Qwen3-VL and its advances in both general-purpose and advanced applications. Built on the Qwen3 series (Yang et al., 2025a), we instantiate four dense models (2B/4B/8B/32B) and two mixture-of-experts (MoE) models (30B-A3B / 235B-A22B), each trained with a context window of up to 256K tokens to enable long-context understanding. By optimizing the training corpus and training strategy, we preserve the underlying LLM’s language proficiency during vision–language (VL) training, thereby substantially improving overall capability. We release both non-thinking and thinking variants; the latter demonstrates significantly stronger multimodal reasoning capabilities, achieving superior performance on complex reasoning tasks.
本报告介绍 Qwen3-VL 在通用与进阶应用上的进展。基于 Qwen3 系列，实例化四档 Dense (2B/4B/8B/32B) 与两档 MoE (30B-A3B / 235B-A22B)，各自以最长 256K token 上下文训练。通过优化语料与训练策略，在视觉-语言训练中保住底层 LLM 语言能力，从而抬升整体表现。同时发布 non-thinking 与 thinking 变体；后者多模态推理明显更强，在复杂推理任务上更优。

We first introduce the architectural improvements, which span three components: 1) Enhanced positional encoding. In Qwen2.5-VL, we used MRoPE as a unified positional encoding scheme for text and vision. We observed that chunking the embedding dimensions into temporal (t), horizontal (h), and vertical (w) groups induces an imbalanced frequency spectrum and hampers long-video understanding. We therefore adopt an interleaved MRoPE that distributes t, h, and w uniformly across low- and high-frequency bands, yielding more faithful positional representations. 2) DeepStack for cross-layer fusion. To strengthen vision–language alignment, we incorporate the pioneering DeepStack (Meng et al., 2024) mechanism. Visual tokens from different layers of the vision encoder are routed to corresponding LLM layers via lightweight residual connections, enhancing multi-level fusion without introducing extra context length. 3) Explicit video timestamps. We replace the absolute-time alignment via positional encoding used in Qwen2.5-VL with explicit timestamp tokens to mark frame groups, providing a simpler and more direct temporal representation. In addition, on the optimization side, we move from a per-sample loss to a square-root-normalized per-token loss, which better balances the contributions of text and multimodal data during training.
架构改进三点：1) 增强位置编码。Qwen2.5-VL 用 MRoPE 统一文本与视觉位置；观察到来把嵌入维切成 t/h/w 组会频谱失衡，伤长视频理解，故改用交错 MRoPE，把 t/h/w 均匀铺到低/高频带。2) DeepStack 跨层融合。引入 DeepStack：视觉编码器不同层的视觉 token 经轻量残差接到对应 LLM 层，加强多层融合且不额外增加上下文长度。3) 显式视频时间戳。用显式时间戳 token 标记帧组，替换 Qwen2.5-VL 里经位置编码做的绝对时间对齐。优化侧：从 per-sample loss 改为平方根归一化的 per-token loss，更好平衡文本与多模态数据贡献。

> **想：** 交错 MRoPE 解决的是频率切块失衡，还是把绝对时间对齐一并废除？
> 引言把两件事分开写：interleaved MRoPE 针对 t/h/w 切块导致的频谱失衡；绝对时间对齐的废除写在第 3 点 Explicit video timestamps，改用文本时间戳。§2.1 与 §2.3 分别展开，不要并成一刀。

To build a more capable and robust vision–language foundation model, we overhauled our training data in terms of quality, diversity, and structure. Key upgrades include enhanced caption supervision, expanded omni-recognition and OCR coverage, normalized grounding with 3D/spatial reasoning, and new corpora for code, long documents, and temporally grounded video. We further infused chain-of-thought reasoning and high-quality, diverse GUI-agent interaction data to bridge perception, reasoning, and action. Together, these innovations enable stronger multimodal understanding, precise grounding, and tool-augmented intelligence.
数据侧从质量，多样性与结构全面重做：加强 caption 监督，扩展 omni-recognition 与 OCR，归一化 grounding 并含 3D/空间推理，新增代码，长文档与时间接地视频语料；再注入 CoT 推理与高质量多样 GUI-agent 交互数据，把感知，推理与动作接起来。

Our training pipeline consists of two stages: pretraining and post-training. Pretraining proceeds in four phases: a warm-up alignment phase that updates only the merger (vision–language projection) layers while keeping the rest of the model frozen, followed by full-parameter training with progressively larger context windows at 8K, 32K, and 256K sequence lengths. Post-training comprises three phases: (i) supervised fine-tuning on long chain-of-thought data, (ii) knowledge distillation from stronger teacher models, and (iii) reinforcement learning.
训练两段：预训练与后训练。预训练四阶段：先只更新 merger（视觉-语言投影）的对齐热身并冻结其余，再全参训练，序列长递进 8K → 32K → 256K. 后训练三阶段：（i）长 CoT 数据上的监督微调；（ii）较强教师的知识蒸馏；（iii）强化学习。

The above innovations equip Qwen3-VL with strong capabilities not only as a robust vision–language foundation model but also as a flexible platform for real-world multimodal intelligence—seamlessly integrating perception, reasoning, and action across diverse application domains. In the following sections, we present the model architecture, training framework, and extensive evaluations that demonstrate its consistent and competitive performance on text, vision, and multimodal reasoning benchmarks.
上述改动使 Qwen3-VL 既是稳健的视觉-语言基础模型，也可作真实多模态智能平台：在多域里把感知，推理与动作接在一起。下文给出架构，训练框架与广泛评测。

## 2 Model Architecture 模型架构

Following Qwen2.5-VL (Bai et al., 2025), Qwen3-VL adopts a three-module architecture comprising a vision encoder, an MLP-based vision–language merger, and a large language model (LLM). Figure 1 depicts the detailed model structure.
沿用 Qwen2.5-VL 的三模块：视觉编码器，基于 MLP 的视觉-语言 merger，以及 LLM。图 1 给出结构。

**Large Language Model**: Qwen3-VL is instantiated in three dense variants (Qwen3-VL-2B/4B/8B/32B) and two MoE variants (Qwen3-VL-30B-A3B, Qwen3-VL-235B-A22B), all built upon Qwen3 backbones. The flagship model, Qwen3-VL-235B-A22B, has 235B total parameters with 22B activated per token. It
大语言模型：四档 Dense（2B/4B/8B/32B；原文此处写 three 与四档枚举并存，以枚举为准）与两档 MoE (30B-A3B, 235B-A22B)，均基于 Qwen3 骨干。旗舰 235B 总参，每 token 激活 22B。

<!-- page 3 of 42 -->

![Image block](images/p03-figure-1-the-qwen3-vl-framework-integrates-a-vision.png)

Figure 1: The Qwen3-VL framework integrates a vision encoder and a language model decoder to process multimodal inputs, including text, images, and video. The vision encoder is specifically designed to handle dynamic, native-resolution visual inputs, mapping them to visual tokens of variable length. To enhance perceptual capability and preserve rich visual information, we incorporate the pioneering DeepStack mechanism, which injects visual tokens from multiple layers of the vision encoder into corresponding layers of the LLM. Furthermore, we adopt Interleaved MRoPE to encode positional information for multimodal inputs with a balanced frequency spectrum, and introduce text-based timestamp tokens to more effectively capture the temporal structure of video sequences.
图 1: Qwen3-VL 框架把视觉编码器与语言模型解码器接到一起，处理文本，图像与视频。视觉编码器按动态原生分辨率工作，映射为变长视觉 token. DeepStack 把视觉编码器多层视觉 token 注入对应 LLM 层，以加强感知并保留丰富视觉信息。Interleaved MRoPE 以更均衡频谱编码多模态位置；文本时间戳 token 用于捕捉视频时间结构。

outperforms most VLMs across a broad set of multimodal tasks and surpasses its text-only counterpart on the majority of language benchmarks.
旗舰在广泛多模态任务上超过多数 VLM，并在多数语言基准上超过其纯文本对照。

**Vision Encoder**: We utilize the SigLIP-2 architecture (Tschannen et al., 2025) as our vision encoder and continue training it with dynamic input resolutions, initialized from official pretrained checkpoints. To accommodate dynamic resolutions effectively, we employ 2D-RoPE and interpolate absolute position embeddings based on input size, following the methodology of CoMP (Chen et al., 2025). Specifically, we default to the SigLIP2-SO-400M variant and use SigLIP2-Large (300M) for small-scale LLMs (2B and 4B).
视觉编码器：采用 SigLIP-2 架构，从官方预训练检查点初始化并继续做动态分辨率训练。为适配动态分辨率，用 2D-RoPE，并按输入尺寸插值绝对位置嵌入（循 CoMP）。默认 SigLIP2-SO-400M；小规模 LLM (2B, 4B) 用 SigLIP2-Large (300M).

**MLP-based Vision-Language Merger**: As in Qwen2.5-VL, we use a two-layer MLP to compress 2 × 2 visual features from the vision encoder into a single visual token, aligned with the LLM’s hidden dimension. Additionally, we deploy specialized mergers to support the DeepStack mechanism (Meng et al., 2024), the details of which are fully described in Section 2.2.
基于 MLP 的视觉-语言 Merger：与 Qwen2.5-VL 相同，两层 MLP 把视觉编码器的 2×2 视觉特征压成单个视觉 token，对齐 LLM 隐层维。另部署专用 merger 以支持 DeepStack，细节见 §2.2。

> **问：** DeepStack 的专用 merger 会不会把上下文长度乘以层数？
> 不会。引言与图 1 写明 multilayer fusion 「without introducing extra context length」；§2.2 写多级特征投影后 「added directly to the corresponding hidden states of the first three LLM layers」，是残差注入隐状态，不是把三倍视觉 token 拼进序列。

### 2.1 Interleaved MRoPE 交错 MRoPE

Qwen2-VL (Wang et al., 2024c) introduced MRoPE to model positional information for multimodal inputs. In its original formulation, the embedding dimensions are partitioned into temporal (t), horizontal (h), and vertical (w) subspaces, each assigned distinct rotary frequencies. This results in an imbalanced frequency spectrum, which subsequent studies have shown to degrade performance on long-video understanding benchmarks. To address this, we redesign the frequency allocation by interleaving the t, h, and w components across the embedding dimensions (Huang et al., 2025). This ensures that each spatial–temporal axis is uniformly represented across both low- and high-frequency bands. The resulting balanced spectrum mitigates the original spectral bias and significantly improves long-range positional modeling for video.
Qwen2-VL 引入 MRoPE。原式把嵌入维划成 t/h/w 子空间并各挂不同旋转频率，频谱失衡，后续工作显示伤长视频理解。本代把 t/h/w 分量交错铺进各维，使每个时空轴在低/高频带都有代表，缓解频谱偏置，显著改善视频长程位置建模。

> **核对：** 交错之后，文本位置还等价于 1D RoPE 吗？
> §2.1 只写重新分配频率以均衡频谱，未改写 「文本三维 ID 相同」 的旧规则。文本仍应走统一 position ID 的等价 1D 行为；本文强调的增量是视觉/视频轴的频率铺法，不是宣布废除文本等价 1D。

<!-- page 4 of 42 -->

### 2.2 DeepStack

We draw inspiration from DeepStack (Meng et al., 2024) and inject visual tokens into multiple layers of the LLM. Unlike the original DeepStack approach, which stacks tokens from multi-scale visual inputs, we extend DeepStack to extract visual tokens from intermediate layers of the Vision Transformer (ViT). This design preserves rich visual information, ranging from low- to high-level representations.
受 DeepStack 启发，把视觉 token 注入 LLM 多层。与原作叠多尺度输入 token 不同，本代从 ViT 中间层抽取视觉 token，保留从低到高的丰富视觉表示。

Specifically, as illustrated in Figure 1, we select features from three distinct levels of the vision encoder. Subsequently, dedicated vision–language merger modules project these multi-level features into visual tokens, which are then added directly to the corresponding hidden states of the first three LLM layers.
具体如图 1：从视觉编码器三个层级取特征，经专用 merger 投影为视觉 token，再直接加到 LLM 前三层对应隐状态上。

> **拆开：** 「前三层 LLM」 与 「三个 ViT 层级」 是否一一绑定，能否跳层注入？
> §2.2 写 three distinct levels → dedicated mergers → first three LLM layers，按层面对应残差相加。本文未给出跳层或注入更深层的消融；表 12 只对比有无 DeepStack，不拆层级配对。

### 2.3 Video Timestamp 视频时间戳

In Qwen2.5-VL, a time-synchronized variant of MRoPE is employed to endow the model with temporal awareness. However, we identify two key limitations of this approach: (1) By tying temporal position IDs directly to absolute time, the method produces excessively large and sparse temporal position ids for long videos, degrading the model’s ability to understand long temporal contexts. (2) Effective learning under this scheme requires extensive and uniformly distributed sampling across various frame rates (fps), significantly increasing the cost of training data construction.
Qwen2.5-VL 用时间同步版 MRoPE 赋予时间感知。本文指出两点限制：（1）temporal position ID 直接绑绝对时间，长视频上 ID 过大过稀，伤长时序理解；（2）要学好需在多种 fps 上大量均匀采样，显著抬高训练数据造价。

To address these issues, we adopt a textual token–based time encoding strategy (Chen et al., 2024b), wherein each video temporal patch is prefixed with a timestamp expressed as a formatted text string—e.g., <3.0 seconds>. Furthermore, during training, we generate timestamps in both seconds and HMS (hours:minutes:seconds) formats to ensure the model learns to interpret diverse timecode representations. Although this approach incurs a modest increase in context length, it enables the model to perceive temporal information more effectively and precisely, thereby facilitating time-aware video tasks such as video grounding and dense captioning.
对策：基于文本 token 的时间编码，每个视频时间 patch 前加格式化时间串，例如 `<3.0 seconds>`。训练时同时生成秒制与 HMS 格式。上下文略增，但时间感知更直接精确，利于视频 grounding 与稠密描述。

> **停一下：** 文本时间戳是推理时算力（test-time scaling）旋钮吗？
> 不是。§2.3 把它写成训练/表示替换：用文本串携带时刻，替代绝对时间位置 ID。它会略增上下文长度，但不是 thinking budget 那种推理时算力旋钮；后者属于后训练 thinking 变体叙事。

## 3 Pre-Training 预训练

### 3.1 Training Recipe 训练配方

We first enhance the vision encoder by conducting continuous training with dynamic resolutions based on the pre-trained SigLIP-2 model. The overall Qwen3-VL model adopts a three-module architecture, comprising this vision encoder, an MLP-based vision–language merger, and a Qwen3 large language model (LLM) backbone. Building on this architecture, our pre-training methodology is systematically structured into four distinct stages, designed to progressively build capabilities from basic alignment to long-context understanding. An overview of these stages is presented in Table 1.
先在预训练 SigLIP-2 上继续动态分辨率训练以增强视觉编码器。整体仍是视觉编码器 + MLP merger + Qwen3 LLM。预训练系统分成四阶段，从基础对齐递进到长上下文；概览见表 1。

Table 1: Training setup and hyperparameters across different stages for Qwen3-VL.
表 1: Qwen3-VL 各阶段训练设置与超参。

| Stage | Objective | Training | Token Budget | Sequence Length |
| --- | --- | --- | --- | --- |
| S0 | Vision-Language Alignment | Merger | 67B | 8,192 |
| S1 | Multimodal Pre-Training | All | ~1T | 8,192 |
| S2 | Long-Context Pre-Training | All | ~1T | 32,768 |
| S3 | Ultra-Long-Context Adaptation | All | 100B | 262,144 |

> **看表：** S0 只训 Merger 时，视觉编码器与 LLM 是否完全冻结？
> 是。§3.1 Stage 0 写 「only the parameters of the MLP merger are trained ... vision encoder and the LLM backbone remain frozen」。表 1 Training 列也只标 Merger。

**Stage 0: Vision-Language Alignment.** The initial stage (S0) focuses on efficiently bridging the modality gap between the vision encoder and the LLM. Crucially, only the parameters of the MLP merger are trained during this phase, while both the vision encoder and the LLM backbone remain frozen. We utilize a curated dataset of approximately 67B tokens, consisting of high-quality image-caption pairs, visual knowledge collections, and optical character recognition (OCR) data. All training is conducted with a sequence length of 8,192. This alignment-first approach establishes a solid foundation for cross-modal understanding before proceeding to full-parameter training.
S0 专注高效弥合视觉编码器与 LLM 的模态鸿沟：只训 MLP merger，视觉编码器与 LLM 冻结。约 67B token，含高质量图文描述，视觉知识与 OCR；序列长 8,192。

**Stage 1: Multimodal Pre-Training.** Following the initial alignment, Stage 1 (S1) transitions to full-parameter Multimodal Pre-Training. In this phase, we unfreeze all model components—the vision encoder, the merger, and the LLM—for joint end-to-end training. The model is trained on a massive and diverse dataset of approximately 1 trillion (1T) tokens. To maintain the LLM’s strong language abilities, the data mixture is composed of vision-language (VL) data and text-only data. The VL portion is rich and varied, adding interleaved image-text documents, visual grounding tasks, visual question
S1 转入全参多模态预训练：解冻视觉编码器，merger 与 LLM 端到端同训。约 1T token。为保住语言能力，混合 VL 与纯文本；VL 侧含交错图文，grounding, VQA,

<!-- page 5 of 42 -->

answering (VQA), data from STEM domains, and a small amount of video data to introduce temporal understanding. The sequence length remains at 8,192.
STEM 数据，以及少量视频以引入时间理解。序列长仍 8,192。

**Stage 2: Long-Context Pre-Training.** Stage 2 (S2) aims to significantly extend the model’s contextual processing abilities. A key change in this stage is the quadrupling of the sequence length to 32,768, while all model parameters continue to be trainable. Training is conducted on a dataset of approximately 1T tokens, with an adjusted data mixture to support long-context tasks. The proportion of text-only data is increased to bolster long-form text comprehension, while the remaining VL data incorporates a significantly larger volume of video and agent-oriented instruction-following data. This stage is critical for enabling the model to process and reason over longer videos and complex, multi-step tasks.
S2 把序列长四倍到 32,768，仍全参可训，约 1T token。提高纯文本比例以加强长文；VL 侧显著加大视频与 agent 指令数据。关键在于更长视频与多步任务。

**Stage 3: Ultra-Long-Context Adaptation.** The final stage (S3) is a specialized phase designed to push the model’s context window to its operational limits. Here, we dramatically increase the sequence length to 262,144. The model is trained on a more focused 100B token dataset specifically curated for this purpose. The data is also composed of text-only data and VL data, with a strong emphasis on long-video and long-document understanding tasks. This final adaptation solidifies Qwen3-VL’s proficiency in processing and analyzing extremely long sequential inputs, a key capability for applications like comprehensive document analysis and lengthy video summarization.
S3 把序列长拉到 262,144，用更聚焦的 100B token 专训，强调长视频与长文档。固化极长序列处理能力。

> **确认：** 产品口径的 256K 与表 1 的 262,144 是不是同一窗口？
> 摘要/引言写 native 256K；表 1 S3 写 262,144。两者同属超长适应阶段的操作上限口径，横比时以表 1 训练序列长与正文评测设定为准，不要口算成另一个数。

### 3.2 Pre-Training Data 预训练数据

#### 3.2.1 Image Caption and Interleaved Text-Image Data 图像描述与交错图文

To build a robust foundation model for general-purpose vision–language understanding, we significantly expand and refine two core data modalities: image–caption pairs and interleaved text–image sequences. Our strategy emphasizes high-quality, diverse, and semantically rich multimodal grounding, supported by purpose-built models and rigorous filtering pipelines.
为连通视觉-语言底座，大幅扩展并精炼两大模态：图像-描述对与交错图文序列，强调高质量，多样与语义丰富的多模态接地，并由专用模型与严格过滤支撑。

**Image Caption Data**: We curate a large-scale corpus of contemporary, predominantly Chinese–English multilingual image–text pairs from web sources and apply a multi-stage refinement pipeline centered on a specialized Qwen2.5-VL-32B model fine-tuned for recaptioning. This model leverages the original raw text associated with each image to generate more comprehensive, fluent, and fine-grained captions—enriching descriptions of visual elements (e.g., object attributes, spatial layouts, and contextual semantics) while simultaneously improving the linguistic quality and informativeness of the textual component.
图像描述数据：大规模当代中英为主的网页图文对，以专为重写描述微调的 Qwen2.5-VL-32B 为中心多阶段精炼；利用原配原文生成更全面，流畅，细粒度的 caption。

Deduplication is performed exclusively on the recaptioned text using semantic similarity metrics, ensuring removal of redundant samples without sacrificing visual diversity. To further enhance coverage of underrepresented concepts, we apply clustering (Johnson et al., 2019; Douze et al., 2024; Diao et al., 2025) over visual embeddings to identify sparse regions in the data distribution and perform targeted augmentation. The result is a high-fidelity caption dataset that balances scale, diversity, and descriptive granularity.
去重只打在重写后的文本上（语义相似），以免牺牲视觉多样性。再用视觉嵌入聚类找稀疏区并定向增强。

**Interleaved Text-Image Data**: We collect diverse real-world multimodal documents sourced from recent Chinese and English websites (Laurençon et al., 2023; Zhu et al., 2023; Li et al., 2024c). All documents undergo domain classification (Wettig et al., 2025) using a lightweight Qwen-based scorer fine-tuned for fine-grained domain identification. Based on validation experiments across domains, we systematically exclude harmful or low-value categories—such as advertisements, promotional content, and clickbait—using the same efficient scorer to filter out undesirable samples.
交错图文：采自近期中英文网站的真实多模态文档，用轻量 Qwen 域分类器打分；按验证实验系统剔除广告，促销，标题党等有害/低价值类。

For book-scale interleaved data, we employ a fine-tuned Qwen2.5-VL-7B model to perform high-accuracy multimodal parsing, precisely extracting and aligning text with embedded figures, diagrams, and photographs. To enable ultra-long context modeling, we construct a specialized subset by merging consecutive pages into sequences of up to 256K tokens, preserving natural page order and multimodal coherence. During preprocessing, we enforce strict quality controls: (i) pure-text or low-alignment segments are removed; (ii) for ultra-long book sequences, we require a minimum page count and a minimum image-to-text ratio to ensure meaningful visual–textual interaction throughout the context. This yields a clean, diverse, and layout-aware interleaved corpus optimized for both grounded understanding and long-range multimodal reasoning.
书册级交错用微调 Qwen2.5-VL-7B 做高精多模态解析。超长子集把连续页拼到最长 256K token。预处理：去纯文本/低对齐段；超长书序列设最低页数与最低图文比。

#### 3.2.2 Knowledge 知识

World knowledge is essential for multimodal large language models (MLLMs) to achieve robust visual understanding, grounded reasoning, and entity-aware generation across diverse downstream tasks. To equip Qwen3-VL with a comprehensive grasp of both real-world and fictional concepts, we construct a
世界知识对 MLLM 的稳健视觉理解，接地推理与实体感知生成很关键。为覆盖真实与虚构概念，构造

<!-- page 6 of 42 -->

large-scale pretraining dataset centered on well-defined entities spanning more than a dozen semantic categories—including animals, plants, landmarks, food, and everyday objects such as vehicles, electronics, and clothing.
以明确实体为中心的大规模预训练集，覆盖十余语义类（动物，植物，地标，食物，以及车辆，电子，服装等日常物）。

Real-world entities follow a long-tailed distribution: prominent concepts appear frequently with high-quality annotations, while the majority are rare. To address this imbalance, we adopt an importance-based sampling strategy. High-prominence entities are sampled more heavily to ensure a sufficient learning signal, while low-prominence entities are included in smaller proportions to maintain broad coverage without overwhelming the training process. This approach effectively balances data quality, utility, and diversity.
真实实体长尾分布。采用基于重要性的采样：高显著性实体多采以保证学习信号，低显著性少采以保覆盖又不淹没训练。

All retained samples undergo a multi-stage refinement pipeline. In addition to standard filtering for noise and misalignment, we replace original or sparse captions—such as generic alt-text—with richer, LLM-generated descriptions. These enhanced captions not only identify the main entity but also describe its visual attributes, surrounding context, spatial layout, and interactions with other objects or people, thereby providing a more complete and grounded textual representation.
保留样本经多阶段精炼：除噪声/错位过滤外，用更丰富的 LLM 生成描述替换稀疏 alt-text 等，覆盖属性，上下文，空间布局与交互。

Together, these efforts yield a knowledge-rich, context-aware, and discrimination-focused training signal that significantly enhances Qwen3-VL’s ability to recognize, reason about, and accurately describe visual concepts in real-world scenarios.
最终得到知识密，上下文敏感，偏判别的训练信号，加强真实场景中的识别，推理与准确描述。

#### 3.2.3 OCR，Document Parsing and Long Document Understanding OCR，文档解析与长文档理解

**OCR:** To enhance OCR performance on real-world images, we curate a dataset of 30 million in-house collected samples using a coarse-to-fine pipeline. This pipeline refines OCR annotations by integrating pseudo-labels from OCR-specialized models with refinements from Qwen2.5-VL—without any human annotation. Expanding beyond the 10 languages supported by Qwen2.5-VL (excluding Chinese and English), we incorporate an additional 29 languages, synthesizing approximately 30 million high-quality multilingual OCR samples and curating over 1 million internal real-world multilingual images.
OCR：内部采集 3000 万样本，粗到细管线融合 OCR 专模伪标签与 Qwen2.5-VL 精炼，无人标注。在 Qwen2.5-VL 支持的 10 个非中英语言之外再加 29 语，合成约 3000 万高质量多语 OCR，并整理超 100 万内部真实多语图。

**Document Parsing:** For document parsing, we collect 3 million PDFs from Common Crawl, evenly distributed across 10 document types (300K samples each), along with 4 million internal documents. An in-house layout model first predicts the reading order and bounding boxes for textual and non-textual regions; Qwen2.5-VL-72B then performs region-specific recognition. The outputs are reassembled into position-aware, layout-aligned parsing data.
文档解析：Common Crawl 300 万 PDF（10 类各 30 万）加内部 400 万文档。内部版面模型先预测阅读序与框；Qwen2.5-VL-72B 分区识别，再重装成位置感知，版面对齐的解析数据。

To ensure robust parsing across heterogeneous formats, we design a unified annotation framework supporting two representations:
为跨异构格式稳健解析，统一标注框架支持两种表示：

• QwenVL-HTML, which includes fine-grained, element-level bounding boxes;
• QwenVL-HTML，含细粒度元素级边界框；

• QwenVL-Markdown, where only images and tables are localized, with tables encoded in LaTeX.
• QwenVL-Markdown，只定位图与表，表用 LaTeX 编码。

We construct a large-scale synthetic HTML corpus with precise annotations and systematically convert it to Markdown format. To further improve model generalization, we generate pseudo-labels on extensive collections of real documents and filter them for quality. The final training set combines synthetic and high-quality pseudo-labeled data to enhance both scalability and robustness.
大规模精确标注合成 HTML，并系统转到 Markdown；再对真实文档打伪标签并过滤。最终训练集混合合成与高质量伪标签数据。

**Long Document Understanding:** To enhance the model’s ability to understand multi-page PDFs—often spanning dozens of pages—we leverage a large-scale corpus of long-document data. First, we synthesize long-document parsing sequences by merging single-page document samples. In each sequence, multiple page images are placed at the beginning, followed by their corresponding text derived from OCR or HTML parsing. Second, we construct long-document visual question answering (VQA) data. Specifically, we sample high-quality multi-page PDFs and generate a diverse set of VQA examples that require the model to reason across multiple pages and heterogeneous document elements—such as charts, tables, figures, and body text. We carefully balance the distribution of question types and ensure that supporting evidence draws from a wide range of modalities and layout components, thereby promoting robust, grounded, and multi-hop reasoning over extended contexts.
长文档理解：先把单页样本拼成长文档解析序列（多页图像在前，OCR/HTML 文本在后）；再构造跨页 VQA，要求跨页与跨图表正文多跳推理。

#### 3.2.4 Grounding and Counting Grounding 与计数

Visual grounding is a fundamental capability for multimodal models, enabling them to accurately identify, interpret, and localize a wide spectrum of visual targets from specific objects to arbitrary image regions. In Qwen3-VL, we systematically enhance grounding proficiency and support two grounding modalities: bounding boxes and points. These representations allow for precise and flexible interpretation of image content across diverse scenarios and downstream tasks. In addition, we extend the grounding capacity of
视觉 grounding 是多模态基础能力。Qwen3-VL 系统加强 grounding，支持框与点两种模态，并扩展

<!-- page 7 of 42 -->

the model to support counting, enabling quantitative reasoning about visual entities. In the following, we briefly describe the data construction pipelines for grounding and counting.
到计数，以支持对视觉实体的定量推理。下文简述 grounding 与计数的数据构造。

**Box-based Grounding**: We begin by aggregating widely used open-source datasets, including COCO (Lin et al., 2014), Objects365 (Shao et al., 2019), OpenImages (Kuznetsova et al., 2020), and RefCOCO/+/g (Kazemzadeh et al., 2014; Mao et al., 2016). To further enrich data diversity, we developed an automated synthesis pipeline that generates high-quality object annotations across a broad range of scenarios. This pipeline operates in three stages: (i) object candidates are extracted from unlabeled images using Qwen2.5-VL; (ii) these candidates are localized and annotated using both open-vocabulary detectors (specifically, Grounding DINO (Liu et al., 2023a)) and Qwen2.5-VL; and (iii) the resulting annotations undergo quality assessment, with low-confidence or inaccurate ones systematically filtered out. Through this approach, we constructed a large-scale, highly diverse box-based grounding dataset spanning a wide variety of visual contexts and object categories.
框 grounding：聚合 COCO，Objects365，OpenImages，RefCOCO/+/g；再加三阶段自动合成（Qwen2.5-VL 提候选 → Grounding DINO + Qwen2.5-VL 定位标注 → 低置信过滤）。

**Point-based Grounding**: To ensure robust point-based grounding, we curated a comprehensive dataset combining publicly available and synthetically generated pointing annotations. It integrates three sources: (i) public pointing and counting annotations from PixMo (Deitke et al., 2024); (ii) object grounding data derived from public object detection and instance segmentation benchmarks; and (iii) high-precision pointing annotations generated by a dedicated synthesis pipeline designed to target fine-grained image details.
点 grounding：混合 PixMo 公开点/计数，检测/实例分割派生，以及面向细粒度细节的合成管线。

**Counting**: Building upon the grounding data, we curated a high-quality subset to form the basis of our counting dataset, which includes three distinct task formulations: direct counting, box-based counting, and point-based counting. Collectively, these three task types constitute a comprehensive counting dataset.
计数：在 grounding 子集上做直接计数，框计数，点计数三种题型。

Different from Qwen2.5-VL, we adopt a normalized coordinate system scaled to the range [0, 1000] in this version. This design improves robustness to variations in image resolution and aspect ratio across diverse inputs, while also simplifying post-processing and enhancing the usability of predicted coordinates in downstream applications.
与 Qwen2.5-VL 不同，本代采用缩放到 [0, 1000] 的归一化坐标系，以增强对分辨率与宽高比变化的稳健性，并简化后处理与下游可用性。

> **回看：** Qwen2.5-VL 的绝对像素坐标在本代还用吗？
> 不用。§3.2.4 末段明确 「Different from Qwen2.5-VL, we adopt a normalized coordinate system scaled to the range [0, 1000]」。横比定位分数时先核对坐标协议。

#### 3.2.5 Spatial Understanding and 3D Recognition 空间理解与 3D 识别

To facilitate sophisticated interaction with the physical world, Qwen3-VL is designed with a deep understanding of spatial context. This enables the model to interpret spatial relationships, infer object affordances, and perform action planning and embodied reasoning. It can also estimate the 3D spatial positions of objects from a single monocular image. To support these capabilities, we created two comprehensive datasets focused on Spatial Understanding and 3D Grounding.
为支撑与物理世界的复杂交互，Qwen3-VL 强调空间上下文：空间关系，affordance，动作规划与具身推理，以及单目图上的 3D 位置估计。为此构造 Spatial Understanding 与 3D Grounding 两套数据。

**Spatial Understanding**. Beyond localizing objects, Qwen3-VL is trained to reason about spatial relationships, object affordances, and feasible actions in 2D scenes—capabilities essential for embodied AI and interactive applications. To this end, we construct a specialized dataset that goes beyond standard grounding by incorporating: (i) relational annotations (e.g.，“the cup to the left of the laptop”), (ii) affordance labels (e.g.，“graspable”，“pressable”，“sittable”), and (iii) action-conditioned queries that require planning (e.g.，“What should I move first to reach the book behind the monitor?”). These samples are derived from both curated real-world scenes and synthetically generated layouts, with natural language queries automatically generated via templated and LLM-based methods to ensure diversity and complexity. Critically, all spatial references are expressed relative to other objects or scene frames, rather than absolute coordinates, encouraging robust relational reasoning. This training enables Qwen3-VL to not only answer “where” questions but also “how” and “what can be done” — forming a foundation for agentic interaction with visual environments.
空间理解：在标准 grounding 之外加入关系标注，affordance 标签与动作条件查询；空间指称刻意相对其他物体或场景框架，而非绝对坐标。

**3D Grounding**. To further enhance the model’s ability to understand the physical world from images, we constructed a specialized pretraining dataset for 3D visual grounding. We sourced data from public collections of diverse indoor and outdoor scenes and reformulated it into a visual question-answering format. Each sample consists of: 1) a single-view camera image, 2) a natural language referring expression, and 3) the corresponding 9-DoF 3D bounding box annotations in a structured JSON format, specifying the object’s spatial position and semantic label. As the 3D bounding boxes are derived from multiple sensors and data sources, they exhibit varying camera intrinsic parameters and inherent noise. To this end, we filter out heavily occluded and inaccurate labels and follow Omni3D (Brazil et al., 2023) to unify all data into a virtual camera coordinate system. We also synthesized a large corpus of descriptive captions to create rich textual queries for 3D grounding. These descriptions go beyond naming the object’s category to include detailed attributes, layout arrangements, spatial location, visual affordances, and interactions with surrounding objects—yielding more fine-grained and grounded referring expressions.
3D Grounding：单目图 + 指称 + 9-DoF 3D 框 JSON；过滤重遮挡/不准标签，按 Omni3D 统一到虚拟相机坐标系；并合成富描述作查询。

<!-- page 8 of 42 -->

#### 3.2.6 Code 代码

We enhance the Qwen3-VL series with dedicated coding capabilities by incorporating two categories of code-related data into the training corpus, enabling the model to read, write, and reason about programs in both text-only and visually grounded contexts.
通过两类代码相关数据增强读/写/推理程序能力，覆盖纯文本与视觉接地上下文。

**Text-Only Coding.** We reuse the extensive code corpus from the Qwen3 and Qwen3-Coder series. This large-scale dataset spans a wide range of programming languages and domains—including software development, algorithmic problem solving, mathematical reasoning, and agent-oriented tasks—and establishes the model’s foundational understanding of code syntax, algorithmic logic, and generalpurpose program generation.
纯文本代码：复用 Qwen3 与 Qwen3-Coder 大规模代码语料。

**Multimodal Coding.** To address tasks requiring both visual understanding and code generation, we curate data for a diverse suite of multimodal coding tasks. This dataset, sourced from both open-source datasets and internal synthesis pipelines, teaches the model to jointly understand visual inputs and generate functional code. The data covers several key tasks, including: converting UI screenshots into responsive HTML/CSS; generating editable SVG codes from images (Li et al., 2025c); solving visual programming challenges (Li et al., 2024a); answering multimodal coding questions (e.g., StackOverflow posts with images); and transcribing visual representations (such as flowcharts, diagrams, and LATEX equations) into their respective code or markup. This novel data mixture enables Qwen3-VL to act as a bridge between visual perception and executable logic.
多模态代码：UI 截图转 HTML/CSS，图生 SVG，视觉编程题，带图编程问答，流程图/公式转写等，把视觉感知接到可执行逻辑。

#### 3.2.7 Video 视频

The video comprehension capabilities of Qwen3-VL have been substantially advanced, enabling robust modeling of temporal dynamics across frames, fine-grained perception of spatial relationships, and coherent summarization of ultra-long video sequences. This enhancement is underpinned by a data processing pipeline featuring two principal innovations:
视频理解大幅加强：跨帧时间动态，细粒度空间关系，超长视频连贯摘要。数据管线两大创新：

**Temporal-Aware Video Understanding**. (i) Dense Caption Synthesis: For long video sequences, we employ a short-to-long caption synthesis strategy to generate holistic, timestamp-interleaved, and temporally coherent story-level descriptions. Leveraging in-house captioning models, we further produce fine-grained annotations that jointly capture event-level temporal summaries and segment-specific visual details. (ii) Spatio-Temporal Video Grounding: We curate and synthesize large-scale video data annotated at the levels of objects, actions, and persons to strengthen the model’s spatio-temporal grounding capabilities, thereby improving its capacity for fine-grained video understanding.
时间感知视频理解：（i）短到长 caption 合成，生成带时间戳交错的故事级描述；（ii）物体/动作/人物级时空 video grounding 数据。

**Video Data Balancing and Sampling**. (i) Source Balancing: To ensure data balance and diversity, we assemble a large-scale dataset encompassing various video sources, including instructional content, cinematic films, egocentric recordings, etc. Dataset balance is achieved through systematic curation guided by metadata such as video titles, duration, and categorical labels. (ii) Length-Adaptive Sampling: During pre-training stages, we dynamically adjust sampling parameters, such as frames per second (fps) and the maximum number of frames, according to different sequence length constraints. This adaptive strategy mitigates information loss associated with suboptimal sampling practices (e.g., overly sparse frame selection or excessively low spatial resolution), thus preserving visual details and optimizing training efficacy.
视频数据平衡与采样：（i）源域平衡；（ii）按序列长约束动态调 fps 与最大帧数的长度自适应采样。

> **再看：** 长度自适应采样与 §2.3 批评的 「多种 fps 均匀采样」 是否矛盾？
> 不矛盾。§2.3 批评的是绝对时间位置 ID 方案下为学好时间而被迫在多种 fps 上均匀铺数据的高成本；§3.2.7 的自适应采样是按序列长约束调 fps/最大帧，服务 token 预算与信息保留。时间语义改由文本时间戳携带后，采样策略不必再为位置 ID 几何买单。

#### 3.2.8 Science, Technology, Engineering, and Mathematics (STEM)

Multimodal reasoning lies at the heart of Qwen3-VL, with STEM reasoning constituting its most essential part. Our philosophy follows a divide-and-conquer strategy: we first develop fine-grained visual perception and robust linguistic reasoning capabilities independently, and then integrate them in a synergistic manner to achieve effective multimodal reasoning.
多模态推理是核心，STEM 是其最要紧部分。策略是分而治之：先分别做细粒度视觉感知与稳健语言推理，再协同集成。

**Visual Perception Data**. We develop a dedicated synthetic data generation pipeline that constructs geometric diagrams through programmatic (code-based) rendering. Using this pipeline, we generate: (i) 1 million point-grounding samples, such as intersection points, corners, and centers of gravity; and (ii) 2 million perception-oriented visual question answering pairs targeting fine-grained visual understanding of diagrams. To obtain high-fidelity textual descriptions, we further implement a two-stage captioning framework: an initial generation phase followed by rigorous model-based verification. Both stages employ ensembles of specialized models to ensure accuracy and descriptive granularity. This process yields a comprehensive dataset of 6 million richly annotated diagram captions spanning diverse STEM disciplines.
视觉感知数据：程序化渲染几何图，生成 1M 点 grounding 与 2M 感知向 VQA；两阶段 caption + 模型校验，得到 6M 富标注图注。

**Multi-modal Reasoning Data**. The majority of our multi-modal reasoning data consists of over 60

<!-- page 9 of 42 -->

million K–12 and undergraduate-level exercises, meticulously curated through a rigorous cleaning and reformulation pipeline. During quality filtering, we discard low-quality items, including those with corrupted images, irrelevant content, or incomplete or incorrect answers. During the reformulation stage, we translate exercises between Chinese and English and standardize the format of answers—such as step-by-step solution lists, mathematical expressions, and symbolic notations—to ensure consistency and uniform presentation. Regarding long CoT problem-solving data, we synthesize over 12 million multimodal reasoning samples paired with images. To ensure the continuity and richness of the reasoning process, we utilize the original rollouts generated by a strong reasoning model. To guarantee data reliability and applicability, each sample’s reasoning trajectory undergoes rigorous validation—combining rule-based checks and model-based verification—and any instances containing ambiguous answers or code-switching are explicitly filtered out. Furthermore, to enhance reasoning quality, we retain only challenging problems via rejection sampling.
多模态推理数据：超 60M K-12/本科题经清洗与重写；长 CoT 合成超 12M 图配推理样本，保留强推理模型原始 rollout，规则+模型校验，滤歧义答与语码混用，拒采样只留难题。

**Linguistic Reasoning Data**. In addition to multimodal reasoning data, we also incorporate reasoning data from Qwen3, as multimodal reasoning capabilities are largely derived from linguistic reasoning competence.
语言推理数据：另纳入 Qwen3 推理数据，因多模态推理能力很大程度上来自语言推理能力。

#### 3.2.9 Agent

**GUI:** To endow Qwen3-VL with agentic capability for autonomous interaction with graphical user interfaces (GUIs), we curate and synthesize large-scale, cross-platform data spanning desktop, mobile, and web environments (Ye et al., 2025; Wang et al., 2025a; Lu et al., 2025). For GUI interface perception, we leverage metadata, parsing tools, and human annotations to construct tasks such as element description, dense captioning, and dense grounding, enabling robust understanding of diverse user interfaces. For agentic capability, we assemble multi-step task trajectories via a self-evolving trajectory-production framework, complemented by targeted human audits; we also carefully design and augment Chainof-Thought rationales to strengthen planning, decision-making, and reflective self-correction during real-world execution.
GUI：跨桌面/手机/网页大规模数据。感知侧做元素描述，稠密 caption 与稠密 grounding；agent 侧用自演化轨迹框架 + 人工抽检组装多步轨迹，并增强 CoT 理由以加强规划，决策与反思纠错。

**Function Calling:** For general function calling capabilities with multimodal contexts, we build a multimodal function calling trajectory synthesis pipeline. We first instruct capable models with images to generate user queries and their corresponding function definitions. We then sample model function calls with rationales and synthesize the function responses. This process is repeated until the user’s query is judged to be solved. Between each step, trajectories can be filtered out due to formatting errors. Such a pipeline enables us to construct large-scale multimodal function-calling trajectories from vast images, without the need to implement executable functions.
Function Calling：多模态函数调用轨迹合成管线；不必实现可执行函数即可从海量图像构造大规模轨迹。

**Search:** Among the general function calling capabilities, we regard the ability to perform searches as key to facilitating knowledge integration for long-tail entities in real-world scenarios. In this case, we collect multimodal factual lookup trajectories with online image search and text search tools, encouraging the model to perform searches for unfamiliar entities. By doing so, the model learns to gather information from the web to generate more accurate responses.
Search：收集带在线图搜/文搜的多模态事实查询轨迹，鼓励对不熟悉实体执行搜索。

## 4 Post-Training 后训练

### 4.1 Training Recipe 训练配方

Our post-training pipeline is a three-stage process designed to refine the model’s instruction-following capabilities, bolster its reasoning abilities, and align it with human preferences. The specific data and methods for each stage are detailed in the subsequent sections.
后训练三阶段：refining 指令遵循，加强推理，对齐人类偏好。

**Supervised Fine-Tuning (SFT).** The first stage imparts instruction-following abilities and activates latent reasoning skills. This is conducted in two phases: an initial phase at a 32k context length, followed by an extension to a 256k context window that focuses on long-document and long-video data. To cater to different needs, we bifurcate the training data into standard formats for non-thinking models and Chain-of-Thought (CoT) formats for thinking models, the latter of which explicitly models the reasoning process.
SFT：先 32k 再扩到 256k（偏长文档/长视频）。数据分叉为 non-thinking 标准格式与 thinking 的 CoT 格式。

**Strong-to-Weak Distillation.** The second stage employs knowledge distillation, where a powerful teacher model transfers its capabilities to our student models. Crucially, we perform this distillation using text-only data to fine-tune the LLM backbone. This method proves highly effective, yielding significant improvements in reasoning abilities across both text-centric and multimodal tasks.
强到弱蒸馏：用纯文本数据微调 LLM 骨干；对文本向与多模态推理均有显著增益。

**Reinforcement Learning (RL).** The final stage utilizes RL to further enhance model performance and alignment. This phase is divided into Reasoning RL and General RL. We apply large-scale reinforcement

<!-- page 10 of 42 -->

learning across a comprehensive set of text and multimodal domains, including but not limited to math, OCR, grounding, and instruction-following, to improve finer-grained capabilities.
学习覆盖文本与多模态多域（数学，OCR，grounding，指令遵循等），以抬细粒度能力。

> **对一下：** 蒸馏阶段用纯文本，多模态推理怎么还会涨？
> §4.1 原句：distillation using text-only data to fine-tune the LLM backbone，且 「yielding significant improvements in reasoning abilities across both text-centric and multimodal tasks」。机制解释落在语言推理底座被抬高后迁移到多模态，本文未另给多模态蒸馏损失式。

### 4.2 Cold Start Data 冷启动数据

#### 4.2.1 SFT Data SFT 数据

Our principal objective is to endow the model with the capacity to address a wide spectrum of realworld scenarios. Building upon the foundational capabilities of Qwen2.5-VL, which is proficient in approximately eight core domains and 30 fine-grained subcategories, we have strategically expanded its functional scope. This expansion was achieved by integrating insights from community feedback, academic literature, and practical applications, facilitating the introduction of novel capabilities. These include, but are not limited to, spatial reasoning for embodied intelligence, image-grounded reasoning for fine-grained visual understanding, spatio-temporal grounding in videos for robust object tracking, and the comprehension of long-context technical documents spanning hundreds of pages. Guided by these target tasks and grounded in authentic use cases, we systematically curated the SFT dataset through the meticulous selection and synthesis of samples from open-source datasets and web resources. This targeted data engineering effort has been instrumental in establishing Qwen3-VL as a more comprehensive and robust multimodal foundation model.
目标是覆盖广泛真实场景。在 Qwen2.5-VL 约八大域 / 30 细类底座上扩展具身空间推理，图接地细粒度推理，视频时空 grounding，数百页长技术文档等。SFT 集系统精选/合成开源与网页样本。

This dataset comprises approximately 1,200,000 samples, strategically composed to foster robust multimodal capabilities. This collection is partitioned into unimodal and multimodal data, with one-third consisting of text-only entries and the remaining two-thirds comprising image-text and video-text pairs. The integration of multimodal content is specifically designed to enable the model to interpret complex, real-world scenarios. To ensure global relevance, the dataset extends beyond its primary Chinese and English corpora to include a diverse set of multilingual samples, thereby broadening its linguistic coverage. Furthermore, it simulates realistic conversational dynamics by incorporating both single-turn and multi-turn dialogues contextualized within various visual settings, from single-image to multi-image sequences. Crucially, the dataset also features interleaved image-text examples engineered to support advanced agentic behaviors, such as tool-augmented image search and visually-grounded reasoning. This heterogeneous data composition ensures comprehensive coverage and enhances the dataset’s representativeness for training generalizable and sophisticated multimodal agents.
约 1,200,000 条：纯文本约三分之一，图文/视频约三分之二；含多语，单轮/多轮，单图/多图，以及支撑工具增强图搜与图接地推理的交错样本。

Given Qwen3-VL’s native support for a 256K token context length, we employ a staged training strategy to optimize for computational efficiency. This strategy comprises two phases: an initial one-epoch training phase with a sequence length of 32K tokens, followed by a second epoch at the full 256K token length. During this latter stage, the model is trained on a curriculum that interleaves long-context inputs with data sampled at the 32K token length. The long-context inputs include materials such as hundreds of pages of technical documents, entire textbooks, and videos up to two hours in duration.
因原生 256K，SFT 分阶段：先 32K 一 epoch，再 256K 一 epoch，后者与 32K 采样交错；长上下文含数百页技术文档，整本教材，最长约两小时视频。

The quality of training data is a critical determinant of the performance of vision-language models. Datasets derived from open-source and synthetic origins are often plagued by substantial variability and noise, including redundant, irrelevant, or low-quality samples. To mitigate these deficiencies, the implementation of a rigorous data filtering protocol is indispensable. Accordingly, our data curation process incorporates a two-phase filtering pipeline: Query Filtering and Response Filtering.
开源/合成数据噪声大，故采两阶段过滤：Query Filtering 与 Response Filtering。

**Query Filtering.** In this initial phase, we leverage Qwen2.5-VL to identify and discard queries that are not readily verifiable. Queries with ambiguous instructions are minimally revised to enhance clarity while preserving the original semantic intent. Furthermore, web-sourced queries lacking substantive content are systematically eliminated. Crucially, all remaining queries undergo a final assessment of their complexity and contextual relevance, ensuring only appropriately challenging and pertinent samples are retained for the next stage.
查询过滤：用 Qwen2.5-VL 丢掉难验证问句；歧义指令最小改写；剔除空壳网页问；再评估难度与相关性。

**Response Filtering.** This phase integrates two complementary strategies:
响应过滤两条互补策略：

• **Rule-Based Filtering:** A set of predefined heuristics is applied to eliminate responses exhibiting qualitative deficiencies, such as repetition, incompleteness, or improper formatting. To maintain semantic relevance and uphold ethical principles, we also discard any query-response pairs that are off-topic or possess the potential to generate harmful content.
• **规则过滤：** 剔重复，残缺，格式不当；丢离题或有害对。

• **Model-Based Filtering:** The dataset is further refined by employing reward models derived from the Qwen2.5-VL series. These models conduct a multi-dimensional evaluation of multimodal questionanswering pairs. Specifically: (a) answers are scored against a range of criteria, including correctness, completeness, clarity, and helpfulness; (b) for vision-grounded tasks, the evaluation places special emphasis on verifying the accurate interpretation and utilization of visual information; and (c) this model-based approach enables the detection of subtle issues that typically elude rule-based methods,
• **模型过滤：** 用 Qwen2.5-VL 系奖励模型多维打分（正确/完整/清晰/有用；视觉任务强调是否正确用图）；并能抓住规则难抓的细节问题，

<!-- page 11 of 42 -->

such as inappropriate language mixing or abrupt stylistic shifts.
如不当语码混用或风格突变。

This multi-dimensional filtering framework ensures that only data meeting stringent criteria for quality, reliability, and ethical integrity is advanced to the SFT phase.
多维过滤保证进入 SFT 的数据在质量，可靠性与伦理上达标。

#### 4.2.2 Long-CoT Cold Start Data 长 CoT 冷启动数据

The foundation of our thinking models is a meticulously curated Long Chain-of-Thought (CoT) cold start dataset, engineered to elicit and refine complex reasoning capabilities. This dataset is built upon a diverse collection of queries spanning both pure-text and multimodal data, maintaining an approximate 1:1 ratio between vision-language and text-only samples to ensure balanced skill development.
thinking 模型底座是精选长 CoT 冷启动集；纯文本与多模态查询约 1:1。

The multimodal component, while covering established domains such as visual question answering (VQA), optical character recognition (OCR), 2D/3D grounding, and video analysis, places a special emphasis on enriching tasks related to STEM and agentic workflows. This strategic focus is designed to push the model’s performance on problems requiring sophisticated, multi-step inference. The pure-text portion closely mirrors the data used for Qwen3, featuring challenging problems in mathematics, code generation, logical reasoning, and general STEM.
多模态侧覆盖 VQA，OCR，2D/3D grounding，视频，并加重 STEM 与 agent；纯文本侧贴近 Qwen3（数学，代码，逻辑，STEM）。

To guarantee high quality and an appropriate level of difficulty, we implement a rigorous multi-stage filtering protocol.
为保证质量与难度，实施多阶段过滤：

• **Difficulty Curation:** We selectively retain instances where baseline models exhibited low pass rates or generated longer, more detailed responses. This enriches the dataset with problems that are genuinely challenging for current models.
• **难度策展：** 保留基线低通过率或更长更细回答的样本。

• **Multimodal Necessity Filtering:** For vision-language mathematics problems, we introduce a critical filtering step: we discard any samples that our Qwen3-30B-nothink model could solve correctly without access to the visual input. This ensures that the remaining instances genuinely necessitate multimodal understanding and are not solvable via textual cues alone.
• **多模态必要性过滤：** 视觉数学题若 Qwen3-30B-nothink 无图也能答对则丢弃，保证剩余样本必须看图。

• **Response Quality Control:** Aligning with the methodology of Qwen3, we sanitize the generated responses. For queries with multiple candidate answers, we first remove those containing incorrect final results. Subsequently, we filter out responses exhibiting undesirable patterns, such as excessive repetition, improper language mixing, or answers that showed clear signs of guessing without sufficient reasoning steps.
• **响应质控：** 先去终答错误；再滤过度重复，语码混用，或缺少推理步骤的猜测式回答。

This stringent curation process yields a high-quality, challenging dataset tailored for bootstrapping advanced multimodal reasoning.
严格策展得到用于启动高阶多模态推理的高质量难题集。

> **想：** 多模态必要性过滤会不会把 「图文互补但文本可解」 的题全杀掉？
> 会偏向杀掉。§4.2.2 原句对视觉数学题：无视觉输入仍能被 Qwen3-30B-nothink 答对的样本一律 discard。目标是强制 multimodal necessity，代价是文本捷径可解的题被排除，即使图文本可互补。

### 4.3 Strong-to-Weak Distillation 强到弱蒸馏

We adopt the Strong-to-Weak Distillation pipeline as described in Qwen3 to further improve the performance of lightweight models. This distillation process consists of two main phases:
沿用 Qwen3 的强到弱蒸馏管线提升轻量模型，两阶段：

• **Off-policy Distillation:** In the first phase, outputs generated by teacher models are combined to provide response distillation. This helps lightweight student models acquire fundamental reasoning abilities, establishing a strong foundation for subsequent on-policy training.
• **Off-policy 蒸馏：** 混合教师输出做响应蒸馏，先给轻量学生基本推理能力。

• **On-policy Distillation:** In the second phase, the student model generates the responses based on the provided prompts. These on-policy sequences are then used for fine-tuning the student model. We align the logits predicted by the student and teacher by minimizing the KL divergence.
• **On-policy 蒸馏：** 学生按提示自生成序列再微调；以最小化 KL 对齐学生与教师 logits。

### 4.4 Reinforcement Learning 强化学习

#### 4.4.1 Reasoning Reinforcement Learning 推理强化学习

We train models across a diverse set of text and multimodal tasks, including mathematics, coding, logical reasoning, visual grounding, and visual puzzles. Each task is designed so that solutions can be verified deterministically via rules or code executors.
在数学，代码，逻辑推理，视觉 grounding，视觉谜题等可规则/代码确定性校验的任务上训练。

**Data Preparation** We curate training data from both open-source and proprietary sources and apply rigorous preprocessing and manual annotation to ensure high-quality RL queries. For multimodal queries, we use a preliminary checkpoint of our most advanced vision–language model (Qwen3-VL-235B-A22B) to sample 16 responses per query; any query for which all responses are incorrect is discarded.

<!-- page 12 of 42 -->

数据准备：开源+专有，严格预处理与人工标注。多模态查询用旗舰初步检查点每查询采 16 条，全错则丢。

We then run preliminary RL experiments per task to identify and remove data sources with limited potential for improvement. This process yields approximately 30K RL queries covering a variety of text and multimodal tasks. For training each model, we sample 16 responses for all queries and filter out easy queries whose pass rate exceeds 90%. We shuffle and combine task-specific datasets to construct mixed-task batches, ensuring a consistent, predefined ratio of samples per task. The ratio is determined through extensive preliminary experiments.
再按任务做初步 RL 实验剔除提升空间小的数据源，得到约 30K RL 查询。训练时每查询采 16 条并滤 pass rate > 90% 的易题；按预定比例混合任务 batch。

**Reward System** We implement a unified reward framework that delivers precise feedback across all tasks. The system provides shared infrastructure—data preprocessing, utility functions, and a reward manager to integrate multiple reward types—while the core reward logic is implemented per task. We use task-specific format prompts to guide model outputs to the required formats and therefore do not rely on explicit format rewards. To mitigate code-switching, we apply a penalty when the response language differs from the prompt language.
奖励系统：统一框架 + 分任务核心逻辑；用任务格式提示引导输出，故不依赖显式格式奖励；响应语言与提示语言不一致则惩罚。

**RL Algorithm** We employ SAPO (Gao et al., 2025), a smooth and adaptive policy-gradient method, for RL training. SAPO delivers consistent improvements across diverse text and multimodal tasks and across different model sizes and architectures.
RL 算法：采用 SAPO（平滑自适应策略梯度）。跨文本/多模态任务与不同规模/架构均有一致提升。

> **问：** 本文 Reasoning RL 用的是 GRPO 吗？
> 不是。§4.4.1 明确 「We employ SAPO (Gao et al., 2025)」。GRPO 出现在同队纯文本 Qwen3 叙事；本报告推理 RL 算法名是 SAPO，不要混挂。

#### 4.4.2 General Reinforcement Learning 通用强化学习

The General Reinforcement Learning (RL) stage is designed to enhance the model’s generalization capabilities and operational robustness. To this end, we employ a multi-task RL paradigm where the reward function is formulated based on a comprehensive set of tasks from the SFT phase, including VQA, image captioning, OCR, document parsing, grounding, and clock recognition. The reward mechanism is structured to optimize two principal dimensions of model performance:
General RL 提升泛化与稳健性。多任务 RL，奖励覆盖 SFT 期任务（VQA，caption，OCR，文档解析，grounding，读钟等），优化两个主维：

• **Instruction Following:** This dimension evaluates the model’s adherence to explicit user directives. It assesses the ability to handle complex constraints on content, format, length, and structured outputs (e.g., JSON), ensuring the generated response precisely matches user requirements.
• **指令遵循：** 评估对内容/格式/长度/结构化输出（如 JSON）等显式约束的遵守。

• **Preference Alignment:** For open-ended or subjective queries, this dimension aligns the model’s outputs with human preferences by optimizing for helpfulness, factual accuracy, and stylistic appropriateness. This fosters a more natural and engaging user interaction.
• **偏好对齐：** 对开放/主观查询优化有用性，事实准确与风格得体。

Furthermore, this stage acts as a corrective mechanism to unlearn strong but flawed knowledge priors ingrained during SFT. We address this by introducing specialized, verifiable tasks designed to trigger these specific errors, such as counter-intuitive object counting and complex clock time recognition. This targeted intervention is designed to supplant erroneous priors with factual knowledge.
另作纠偏：用反直觉计数，复杂读钟等可验证题触发并替换 SFT 中学歪的强先验。

Another critical objective is to mitigate inferior behaviors like inappropriate language mixing, excessive repetition, and formatting errors. However, the low prevalence of these issues makes general RL a sample-inefficient correction strategy. To overcome this, we curate a dedicated dataset at this stage. This dataset isolates prompts known to elicit such undesirable behaviors. This focused training enables the application of targeted, high-frequency penalties, effectively suppressing these residual errors.
针对语码混用，过度重复，格式错误等低频劣习，另建专集做高频针对性惩罚。

Feedback for the RL process is delivered via a hybrid reward system that combines two complementary approaches:
反馈用混合奖励：

• **Rule-Based Rewards:** This approach provides unambiguous, high-precision feedback for tasks with verifiable ground truths, such as format adherence and instruction following. By using well-defined heuristics, this method offers a robust mechanism for assessing correctness and effectively mitigates reward hacking, where a model might exploit ambiguities in a learned reward function.
• **规则奖励：** 对可验证真值任务给高精反馈，缓解 reward hacking。

• **Model-Based Rewards:** This method employs Qwen2.5-VL-72B-Instruct or Qwen3 as sophisticated judgers. The judge models evaluate each generated response against a ground-truth reference, scoring its quality across multiple axes. This approach offers superior flexibility for assessing nuanced or open-ended tasks where strict, rule-based matching is inadequate. It is particularly effective at minimizing false negatives that would otherwise penalize valid responses with unconventional formatting or phrasing.
• **模型奖励：** 用 Qwen2.5-VL-72B-Instruct 或 Qwen3 作裁判，相对参考答案多轴打分，适合开放题并减少对非常规但正确格式的误杀。

### 4.5 Thinking with Images 借助图像思考

Inspired by the great prior works on "thinking with images" (Wu et al., 2025a; Jin et al., 2025; Zheng et al., 2025; Lai et al., 2025), we endow Qwen3-VL with similar agentic capabilities through a two-stage training paradigm.

<!-- page 13 of 42 -->

受 「thinking with images」 先验工作启发，用两阶段训练赋予类似 agent 能力。

In the first stage, we synthesize a cold-start agentic dataset comprising approximately 10k grounding examples—primarily simple two-turn visual question answering tasks such as attribute detection. We then perform supervised fine-tuning (SFT) on Qwen2.5-VL-32B to emulate the behavior of a visual agent: think → act → analyze feedback → answer. To further enhance its reasoning abilities, we apply multi-turn, tool-integrated reinforcement learning (RL).
第一阶段：合成约 10k grounding 冷启动（多为简单两轮属性检测等）；在 Qwen2.5-VL-32B 上 SFT 模拟 visual agent: think → act → analyze feedback → answer；再做多轮工具集成 RL。

In the second stage, we distill the trained Qwen2.5-VL-32B visual agents from the first stage to generate a larger, more diverse dataset of approximately 120k multi-turn agentic interactions spanning a broader range of visual tasks. We then apply a similar cold-start SFT and tool-integrated RL pipeline (now using both distilled and synthesized data) for the post-training of Qwen3-VL.
第二阶段：蒸馏第一阶段 agent 得到约 120k 更多样多轮交互，再对 Qwen3-VL 做类似冷启动 SFT + 工具 RL。

The multi-turn, tool-integrated RL procedure is nearly identical across both stages, differing only in the underlying data. During RL, we employ three complementary reward signals to encourage robust, tool-mediated reasoning:
两阶段多轮工具 RL 流程几乎相同，仅数据不同。RL 用三路互补奖励：

• **Answer Accuracy Reward** leverages Qwen3-32B to measure whether the final answer is correct.
• **答案正确性奖励：** 用 Qwen3-32B 判断终答是否正确。

• **Multi-Turn Reasoning Reward** leverages Qwen2.5-VL-72B to evaluate whether the assistant correctly interprets tool or environment feedback and arrives at the answer through coherent, step-by-step reasoning.
• **多轮推理奖励：** 用 Qwen2.5-VL-72B 评估是否正确解读工具/环境反馈并连贯逐步推理到位。

• **Tool-Calling Reward** encourages appropriate tool usage by comparing the actual number of tool calls to an expert-estimated target. This target is determined offline by Qwen2.5-VL-72B based on task complexity.
• **工具调用奖励：** 比较实际调用次数与专家估计目标（由 Qwen2.5-VL-72B 按任务复杂度离线给定）。

Early experiments reveal a tendency for models to degenerate into making only a single tool call to hack the first two rewards, regardless of task demands. To mitigate this, we explicitly incorporate the tool-calling reward to promote adaptive tool exploration aligned with task complexity.
早期实验发现模型会退化成只调一次工具来刷前两项奖励；故显式加入工具调用奖励，促使按任务复杂度自适应探索工具。

> **核对：** Thinking with Images 的 SFT 教师是冻 ViT 的 Qwen3-VL 自己吗？
> 第一阶段 SFT/RL 明确落在 Qwen2.5-VL-32B 上；第二阶段才把蒸馏出的 ~120k 轨迹用于 Qwen3-VL 后训练。不是 「冻 ViT 的 Qwen3-VL 自评自训」 这一句能概括的。

### 4.6 Infrastructure 基础设施

We train the Qwen3-VL series models on Alibaba Cloud’s PAI-Lingjun AI Computing Service, which provides the high-performance computing power required for compute-intensive scenarios such as AI and high-performance computing.
在阿里云 PAI-Lingjun 上训练，以支撑算力密集场景。

During the pretraining phase, the system employs a hybrid parallelism strategy built upon the Megatron-LM framework, integrating Tensor Parallelism (TP), Pipeline Parallelism (PP), Context Parallelism (CP), Expert Parallelism (EP), and ZeRO-1 Data Parallelism (DP). This configuration achieves a fine-grained balance among model scale, computational load, and communication overhead, enabling high hardware utilization and sustaining both high throughput and low communication latency—even at scales of up to 10,000 GPUs.
预训练基于 Megatron-LM 混合并行：TP/PP/CP/EP/ZeRO-1 DP，宣称可到约 10,000 GPU 规模仍高吞吐低通信延迟。

For local deployment and performance evaluation, we adopt deployment strategies based on either vLLM or SGLang. vLLM utilizes PagedAttention to enable memory-efficient management and high-throughput inference, while SGLang excels at structured generation and handling complex prompts. Together, these backends provide efficient inference and evaluation with stable, efficient, and flexible model inference capabilities.
本地部署与评测采用 vLLM 或 SGLang：前者偏显存高效与高吞吐推理，后者偏结构化生成与复杂提示。


## 5 Evaluation 评测

### 5.1 General Visual Question Answering 通用视觉问答

To comprehensively assess the general visual question answering (VQA) capabilities of the Qwen3-VL series, we conduct extensive evaluations on a diverse set of benchmarks, including MMBench-V1.1 (Liu et al., 2023b), RealWorldQA (xAI, 2024), MMStar (Chen et al., 2024a), and SimpleVQA (Cheng et al., 2025). As detailed in Table 2, Table 3 and Table 4, the Qwen3-VL family demonstrates robust and highly competitive performance across a wide spectrum of model sizes, from 2B to 235B parameters.
为全面评估 Qwen3-VL 系列通用 VQA 能力，在 MMBench-V1.1，RealWorldQA，MMStar，SimpleVQA 等多样基准上评测。如表 2，表 3，表 4，从 2B 到 235B 各档均表现稳健且有竞争力。

In the comparison of thinking mode, Qwen3-VL-235B-A22B-Thinking achieves the highest score of 78.7 on MMStar. Gemini-2.5-Pro’s (Comanici et al., 2025) Thinking mode delivers the best overall performance, but Qwen3-VL-235B-A22B-Thinking is not far behind. In the non-reasoning mode comparison, Qwen3- VL-235B-A22B-Instruct obtains the highest scores on MMBench and RealWorldQA, with 89.3/88.9 and 79.2, respectively.
thinking 模式对比中，Qwen3-VL-235B-A22B-Thinking 在 MMStar 取得最高分 78.7. Gemini-2.5-Pro Thinking 整体最佳，但本旗舰 thinking 相差不远。non-reasoning 对比中，Instruct 在 MMBench 与 RealWorldQA 取最高 89.3/88.9 与 79.2。

In the experiments with medium-sized models, Qwen3-VL-32B-Thinking achieves the highest scores on MMBench and RealWorldQA, with 89.5/89.5 and 79.4, respectively. Notably, Qwen3-VL-32B-Instruct

<!-- page 14 of 42 -->

even outperforms the Thinking variant on RealWorldQA, scoring 79.0.
中档实验中，Qwen3-VL-32B-Thinking 在 MMBench 与 RealWorldQA 取最高 89.5/89.5 与 79.4。值得注意，Instruct 甚至在 RealWorldQA 上以 79.0 超过 Thinking 变体。

The scalability of the Qwen3-VL series is evident in the strong performance of our smaller models. Specifically, the largest model, Qwen3-VL-8B, achieves the highest performance across all five benchmarks. For example, on MMBench-EN, the score in "thinking" mode increases from 79.9 for the 2B model to 85.3 for the 8B model. A similar upward trend is observed on other benchmarks, such as MMStar, where the score rises from 68.1 (2B, thinking) to 75.3 (8B, thinking).
小档同样体现可扩展性。该组最大的 Qwen3-VL-8B 在五项基准上均最高。例如 MMBench-EN thinking 从 2B 的 79.9 升到 8B 的 85.3；MMStar 从 68.1 到 75.3。

> **看表：** 表 2 里 Thinking 与 Instruct 谁该当旗舰默认？
> 视任务：MMStar 上 Thinking 78.7 更高；MMBench/RealWorldQA 上 Instruct 取最高。§5.1 自己并列两套模式，不要默认开 thinking 必全面更强。

### 5.2 Multimodal Reasoning 多模态推理

We evaluate the Qwen3-VL series on a wide range of multimodal reasoning benchmarks, primarily focusing on STEM-related tasks and visual puzzles. As shown in Table 2, the flagship demonstrates outstanding performance across both non-thinking and thinking models. Qwen3-VL-235B-A22B-Instruct achieves the best reported results among non-thinking or low-thinking-budget models on multiple benchmarks; Qwen3-VL-235B-A22B-Thinking achieves state-of-the-art on MathVista_mini, MathVision, MathVerse_mini, ZeroBench, LogicVista, and VisuLogic.
在广泛多模态推理基准上评测，主攻 STEM 与视觉谜题。如表 2，旗舰两侧均出色；Instruct 在多个非思考/低思考预算设定下报出最佳；Thinking 在 MathVista_mini，MathVision，MathVerse_mini，ZeroBench，LogicVista，VisuLogic 等取 SOTA。

Among medium-sized models, as shown in Table 3, Qwen3-VL-32B demonstrates significant advantages, consistently outperforming Gemini-2.5-Flash and GPT-5-mini. Compared to the previous-generation Qwen2.5-VL-72B model, the medium-sized Qwen3-VL model has already surpassed it on reasoning tasks. Additionally, our newly introduced Qwen3-VL-30B-A3B MoE model also delivers competitive results.
中档如表 3: 32B 相对 Gemini-2.5-Flash 与 GPT-5-mini 有明显优势；相对上代 Qwen2.5-VL-72B，中档已在推理任务上超越.30B-A3B MoE 也具竞争力。

Among small-sized models, we compare Qwen3-VL-2B/4B/8B against GPT-5-Nano, with results presented in Table 4. The 8B variant maintains a clear advantage overall, while the 4B model achieves the highest scores on DynaMath and VisuLogic. Notably, even the smallest 2B model exhibits strong reasoning capabilities.
小档对 GPT-5-Nano 见表 4: 8B 整体领先；4B 在 DynaMath 与 VisuLogic 取最高；2B 也有强推理表现。

### 5.3 Alignment and Subjective Tasks 对齐与主观任务

The ability to follow complex user instructions and reduce potential image-level hallucinations is indispensable for current large vision language models (VLMs). We assess our models on three representative benchmarks: MM-MT-Bench, HallusionBench and MIA-Bench.
复杂指令遵循与降低图像级幻觉对当前 VLM 不可或缺。在 MM-MT-Bench，HallusionBench，MIA-Bench 上评估。

As shown in Table 2, our flagship Qwen3-VL-235B-A22B model consistently outperforms other closedsource models. On HallusionBench, our thinking version surpasses Gemini-2.5-pro, GPT-5 and Claude opus 4.1 by 3.0, 1.0, and 6.3 points, respectively. On MIA-Bench, Qwen3-VL-235B-A22B-Thinking achieves the overall best score across all the other models.
如表 2，旗舰持续超过其他闭源。HallusionBench 上 thinking 相对三者分别高 3.0 / 1.0 / 6.3. MIA-Bench 上 Thinking 取总体最佳。

### 5.4 Text Recognition and Document Understanding 文本识别与文档理解

We compare the Qwen3-VL series with other models of comparable size on document-related benchmarks, including OCR, document parsing, document question answering (QA), and document reasoning.
在文档相关基准上与同档比较，含 OCR，文档解析，文档 QA 与文档推理。

We evaluate our flagship model, Qwen3-VL-235B-A22B, against state-of-the-art VLMs on the benchmarks listed in Table 2. On OCR-focused parsing benchmarks and comprehensive OCR benchmarks, the Qwen3-VL-235B-A22B-Instruct model

<!-- page 15 of 42 -->

Table 2: Performance of Qwen3-VL-235B-A22B and top-tier models on visual benchmarks. The highest scores of the reasoning and non-reasoning models are shown in bold and underlined, respectively. Results marked with an ∗ are sourced from the technical report. + denotes results with tool use.
表 2: Qwen3-VL-235B-A22B 与顶尖模型在视觉基准上的表现。推理/非推理最高分分别加粗与下划线。∗ 来自技术报告；+ 表示使用工具。

<table><tbody><tr><td></td><td>Benchmark</td><td>Qwen3-VL235B-A22B thinking instruct</td><td>Gemini 2.5 Pro thinking budget-128</td><td>OpenAIGPT-5 high minimal</td><td>Claude Opus 4.1 thinking non-thinking</td></tr><tr><td rowspan="15">STEM Puzzle</td><td rowspan="15">MMMU MMMU-Pro MathVista<sub>mini</sub> MathVision MathVision<sub>WP</sub> We-Math MathVerse<sub>mini</sub> DynaMath Math-VR ZeroBench VlmsAreBlind LogicVista VisuLogic VisualPuzzles</td><td rowspan="15">80.6 78.769.3 68.185.8 84.974.6 66.563.8 57.074.8 67.585.0 72.582.8 79.466.8 65.04 279.5 80.472.2 65.834.4 29.957.2 54.7</td><td rowspan="15">81.7<sup>∗</sup> 80.968.8<sup>∗</sup> 71.282.7<sup>∗</sup> 77.773.3<sup>∗</sup> 66.063.2 56.980.6 74.582.9 65.980.0 78.564.7* 54.33 186.1 78.572.0 68.731.6 26.960.9 56.9</td><td rowspan="15">84.2<sup>∗</sup> 74.4<sup>∗</sup>78.4<sup>∗</sup> 62.7<sup>∗</sup>81.3 50.970.9 45.862.8 40.173.8 51.884.1 43.085.4 74.058.1 21.72 280.5 53.471.8 46.328.5 27.257.3 47.9</td><td rowspan="15">78.4 77.264.8 60.775.5 74.564.3 57.754.0 46.465.2 60.270.6 68.175.1 72.054.3 38.03 177.8 72.267.3 63.527.9 27.248.8 47.6</td></tr><tr></tr><tr></tr><tr></tr><tr></tr><tr></tr><tr></tr><tr></tr><tr></tr><tr></tr><tr></tr><tr></tr><tr></tr><tr></tr><tr></tr><tr><td rowspan="6">General VQA</td><td rowspan="6">MMBench-EN MMBench-CN RealWorldQA MMStar SimpleVQA</td><td rowspan="6">88.8 89.388.6 88.981.3 79.278.7 78.461.3 63.0</td><td rowspan="6">90.1<sup>∗</sup> 88.489.7<sup>∗</sup> 86.478.0<sup>∗</sup> 76.077.5<sup>∗</sup> 78.565.4 66.9</td><td rowspan="6">83.8 81.383.5 79.982.8 77.376.4 65.261.8 56.7</td><td rowspan="6">79.4 83.084.9 74.369.9 68.572.1 71.056.7 55.7</td></tr><tr></tr><tr></tr><tr></tr><tr></tr><tr></tr><tr><td rowspan="4">Alignment</td><td rowspan="4">HallusionBench MM-MT-Bench MIA-Bench</td><td rowspan="4">66.7 63.28.5 8.592.7 91.3</td><td rowspan="4">63.7<sup>∗</sup> 60.98.4<sup>∗</sup> 7.692.3 91.3</td><td rowspan="4">65.7 53.77.6 7.592.4 92.6</td><td rowspan="4">60.4 55.17.8 7.991.2 90.0</td></tr><tr></tr><tr></tr><tr></tr><tr><td rowspan="14">Document Understanding</td><td rowspan="14">DocVQA<sub>test</sub> InfoVQA<sub>test</sub> AI2D<sub>w</sub>. <sub>M</sub>. ChartQA<sub>test</sub> OCRBenchOCRBench_v2<sub>en</sub>OCRBench_v2<sub>zh</sub>CC-OCR OmniDocBench<sub>en</sub> OmniDocBench<sub>zh</sub> CharXiv(DQ) CharXiv(RQ) MMLongBench<sub>Doc</sub></td><td rowspan="9">96.5 97.189.5 89.289.2 89.790.3 90.3875 92066.8 67.163.5 61.881.5 82.20.155 0.143</td><td rowspan="14">92.6 94.084.2 82.990.9 90.083.3 62.6866 87254.3 55.248.5 53.177.2 76.80.347 0.2060.238 0.24994.4 87.867.9 62.955.6 51.2</td><td rowspan="14">91.5 89.679.0 69.989.7 84.159.7 59.1810 78753.0 48.243.2 37.768.3 66.10.356 0.1740.472 0.38989.2 79.581.1<sup>∗</sup> 57.851.5 42.4</td><td rowspan="14">92.5 89.269.4 60.986.4 84.486.2 83.9764 75048.4 47.243.7 38.069.1 66.00.194 -0.293 -88.5 87.863.6 60.254.5 48.1</td></tr><tr></tr><tr></tr><tr></tr><tr></tr><tr></tr><tr></tr><tr></tr><tr></tr><tr><td>0.207 0.207</td></tr><tr><td rowspan="4">90.5 89.466.1 62.156.2 57.0</td></tr><tr></tr><tr></tr><tr></tr><tr><td rowspan="7">2D/3DGrounding</td><td rowspan="7">RefCOCO-avg CountBenchODinW-13ARKitScenes Hypersim SUNRGBD</td><td rowspan="7">92.1 91.993.7 93.043.2 48.653.7 56.911.0 13.034.9 39.4</td><td rowspan="7">74.6<sup>∗</sup> -91.0<sup>∗</sup> 91.033.7<sup>∗</sup> 34.5- -- -29.7 -</td><td rowspan="7">66.8 -91.7 87.8- -- -- -- -</td><td rowspan="7">- -93.1 91.9- -- -- -- -</td></tr><tr></tr><tr></tr><tr></tr><tr></tr><tr></tr><tr></tr><tr><td rowspan="6">Embodied/SpatialUnderstanding</td><td rowspan="6">ERQA VSI-Bench EmbSpatialBench RefSpatialBench RoboSpatialHome</td><td rowspan="6">52.5 51.360.0 62.784.3 83.169.9 65.573.9 69.4</td><td rowspan="6">55.3 50.3- -79.1 73.336.5 35.647.5 49.2</td><td rowspan="6">65.7<sup>∗</sup> 42.0<sup>∗</sup>- -82.9 75.123.8 23.153.5 43.6</td><td rowspan="6">34.8 28.0- -69.2 66.0- -- -</td></tr><tr></tr><tr></tr><tr></tr><tr></tr><tr></tr><tr><td rowspan="3">Multi-Image</td><td rowspan="3">MUBIRLBINENKCH</td><td rowspan="3">8607..11 7730..07</td><td rowspan="3">7707..62<sup>∗</sup> 7740..00</td><td rowspan="3">7771..50 6662..58</td><td rowspan="3">64-.1 62-.9</td></tr><tr></tr><tr></tr><tr><td rowspan="8">Video Understanding</td><td rowspan="8">MVBenchVideo-MME<sub>w</sub>/osub.MLVU<sub>M</sub>-Avg LVBench Charades-STA<sub>mIoU</sub> VideoMMMU MMVU</td><td rowspan="8">75.2 76.579.0 79.283.8 84.363.6 67.763.5 64.880.0 74.771.1 68.1</td><td rowspan="8">69.9 65.885.1 80.685.6 81.273.0 69.0- -83.6<sup>∗</sup> 79.474.9 72.2</td><td rowspan="8">75.3 64.684.7 77.386.2 78.3- -- -84.6<sup>∗</sup> 61.6<sup>∗</sup>73.0 68.1</td><td rowspan="8">61.4 59.075.6 73.373.5 71.2- -- -76.2 70.166.4 61.4</td></tr><tr></tr><tr></tr><tr></tr><tr></tr><tr></tr><tr></tr><tr></tr><tr><td rowspan="4">Perception with Tool</td><td rowspan="4">HRBVen<sup>∗</sup>ch4KHRBench8K</td><td>85.9 93.7+</td><td rowspan="4">8873..38 8742..8785.4 80.1</td><td rowspan="4">72-.8 56-.7- -</td><td rowspan="4">-- --- -</td></tr><tr><td>84.3 85.4+</td></tr><tr><td>76.6 82.4+</td></tr><tr><td></td></tr><tr><td rowspan="4">Multi-Modal Coding</td><td rowspan="4">Design2CodeChartMimic UniSVG</td><td rowspan="4">93.4 92.078.4 80.565.8 69.8</td><td rowspan="4">89.2 90.383.9 79.970.0 67.9</td><td rowspan="4">92.5 88.962.1 41.471.7 74.5</td><td rowspan="4">88.5 85.385.2 82.973.0 72.5</td></tr><tr></tr><tr></tr><tr></tr><tr><td rowspan="6">MuAltig-Menotdal</td><td rowspan="6">ScreenSpot Pro AnOdSrWoiodrWldoGrld OSWorld WindowsAA</td><td rowspan="6">61.8 62.06628..03 6636..7738.1 31.632.1 28.9</td><td rowspan="6">- -45-.2 --- -- -</td><td rowspan="6">- --- --- -- -</td><td rowspan="6">- --- --- 44.4- -</td></tr><tr></tr><tr></tr><tr></tr><tr></tr><tr></tr></tbody></table>

<!-- page 16 of 42 -->

Table 3: Performance of medium-sized Qwen3-VL models and previous models on visual benchmarks. The highest scores are shown in bold. Results marked with an ∗ are sourced from the technical report. + denotes results with tool use.
表 3：中档 Qwen3-VL 与对照模型。最高分加粗。∗ 来自技术报告；+ 表示使用工具。

|  | Benchmark | Qwen3-VL30B-A3B thinking instruct | Qwen3-VL32B thinking instruct | Gemini 2.5 Flash thinking non-thinking | GPT-5mini high minimal |
| --- | --- | --- | --- | --- | --- |
| STEM Puzzle | MMMU MMMU-Pro MathVista<sub>mini</sub> MathVision MathVision<sub>WP</sub> We-Math MathVerse<sub>mini</sub> DynaMath Math-VR ZeroBench VlmsAreBlind LogicVista VisuLogic VisualPuzzles | 76.0 74.263.0 60.481.9 80.165.7 60.258.9 52.370.0 56.979.6 70.280.1 73.461.7 61.30 072.5 67.565.8 53.526.6 23.052.0 46.2 | 78.1 76.068.1 65.385.9 83.870.2 63.458.6 54.671.6 63.382.6 76.882.0 76.762.3 59.82 185.1 87.070.9 62.232.4 29.754.7 53.2 | 77.7 76.367.2 65.979.4 75.364.3 60.753.6 49.053.9 60.377.7 75.975.9 69.758.8 54.71 377.5 75.967.3 60.031.0 23.341.4 45.0 | 79.0 67.967.3 53.779.1 59.671.9 46.656.6 42.870.2 51.478.8 36.581.4 71.358.2 26.43 275.8 62.071.4 50.827.2 27.659.3 48.2 |
| General VQA | MMBench-EN MMBench-CN RealWorldQA MMStar SimpleVQA | 87.0 86.185.9 85.377.4 73.775.5 72.154.3 52.7 | 89.5 87.689.4 87.778.4 79.079.4 77.755.4 56.9 | 87.1 86.687.3 86.076.0 75.776.5 75.863.2 59.2 | 86.6 78.584.0 76.379.0 73.374.1 61.356.8 50.3 |
| Alignment | HallusionBench MM-MT-Bench MIA-Bench | 66.0 61.57.9 8.091.6 91.2 | 67.4 63.88.3 8.492.3 91.8 | 63.5 59.18.1 8.091.1 90.6 | 63.2 55.97.7 7.492.0 92.3 |
| Document Understanding | DocVQA<sub>test</sub> InfoVQA<sub>test</sub> AI2D<sub>w</sub>. <sub>M</sub>. ChartQA<sub>test</sub> OCRBenchOCRBench_v2<sub>en</sub>OCRBench_v2<sub>zh</sub>CC-OCR OmniDocBench<sub>en</sub> OmniDocBench<sub>zh</sub> CharXiv(DQ) CharXiv(RQ) MMLongBench<sub>Doc</sub> | 95.5 95.085.6 81.886.9 85.089.4 86.8839 90362.6 63.260.4 57.877.8 80.70.165 0.1830.233 0.25386.9 85.556.6 48.947.4 47.1 | 96.1 96.989.2 87.088.9 89.589.0 88.5855 89568.4 67.462.1 59.279.6 80.30.148 0.1510.236 0.23990.2 90.565.2 62.854.6 55.4 | 92.8 93.082.5 81.788.7 87.760.6 69.0853 86452.2 50.643.8 43.975.4 74.80.265 0.2280.245 0.30590.1 85.561.7 60.149.0 44.6 | 90.5 90.677.6 72.888.2 82.957.5 57.8821 80752.6 45.745.1 41.070.8 61.60.181 0.2600.316 0.42589.4 78.668.6 48.950.3 39.6 |
| 2D/3DGrounding | RefCOCO-avg CountBenchODinW-13ARKitScenes Hypersim SUNRGBD | 89.3 89.790.0 89.842.3 47.555.6 56.111.4 12.534.6 38.1 | 91.1 91.994.1 94.941.8 46.646.1 55.612.5 14.033.9 37.0 | - -86.0 83.7- -- -- -- - | - -91.0 84.1- -- -- -- - |
| Embodied/SpatialUnderstanding | ERQA VSI-Bench EmbSpatialBench RefSpatialBench RoboSpatialHome | 45.3 43.056.1 63.280.6 76.454.2 53.165.5 62.9 | 52.3 48.861.2 61.582.7 81.567.2 61.474.2 64.6 | - -- -- -- -- - | 54.0 45.831.5 30.580.7 72.19.0 4.054.3 44.6 |
| Multi-Image | MUBIRLBINENKCH | 6757..46 6672..79 | 6880..53 6772..38 | 6782..17 6667..85 | -- 5567..75 |
| Video Understanding | MVBenchVideo-MME<sub>w</sub>/osub.MLVU<sub>M</sub>-Avg LVBench Charades-STA<sub>mIoU</sub> VideoMMMU MMVU | 72.0 72.373.3 74.578.9 81.359.2 62.562.7 63.575.0 68.766.1 59.8 | 73.2 72.877.3 76.682.3 82.162.6 63.862.8 61.279.0 71.967.9 66.8 | - -79.6 75.682.1 77.864.5 62.2- -73.9 65.269.8 68.2 | - -78.9 71.083.3 71.7- -- -82.5* 56.769.8 64.8 |
| PweritchepTtoioonl | HHRRBBeeVnn<sup>∗</sup>cchh48KK | 877171...283 887929...553+++ | 887424...818 988141...166+++ | --- --- | 777884...664 666360...939 |
| MuAltig-Menotdal | ScreenSpot Pro AnOdSrWoiodrWldoGrld OSWorld WindowsAA | 57.3 60.55595..60 6514..0330.6 30.324.2 24.9 | 57.1 57.96643..07 6557..1341.0 32.642.9 30.9 | - --- --- -- - | - --- --- -- - |

<!-- page 17 of 42 -->

![Chart block](images/p17-figure-2-multilingual-ocr-performance-of-our-model-on-a.png)

Figure 2: Multilingual OCR performance of our model on a self-built test set. The model achieves over 70% accuracy on 32 out of 39 supported languages, demonstrating strong and usable multilingual capabilities.
图 2：自建测试集上的多语 OCR. 39 个支持语言中有 32 个准确率超过 70%。

establishes a new state of the art, marginally outperforming its “thinking” counterpart, Qwen3-VL-235B-A22B-Thinking. On OCR-related visual question answering (VQA) benchmarks that require both OCR capability and keyword search — such as DocVQA (Mathew et al., 2021b), InfoVQA (Mathew et al., 2021a), AI2D (Kembhavi et al., 2016), ChartQA (Masry et al., 2022), and the CharXiv (Wang et al., 2024g) description subset — both the Instruct and Thinking variants achieve comparable performance, demonstrating consistently strong results across these tasks. Notably, on the reasoning subset of CharXiv which demands deep chart comprehension and multi-step reasoning — the Thinking variant surpasses the Instruct version and ranks second only to GPT5-thinking and Gemini-2.5-Pro-Thinking.
确立新 SOTA，略优于其 thinking 对照。在 DocVQA，InfoVQA，AI2D，ChartQA，CharXiv 描述子集等 OCR 相关 VQA 上，Instruct 与 Thinking 表现接近。CharXiv 推理子集上 Thinking 超过 Instruct，仅次于 GPT5-thinking 与 Gemini-2.5-Pro-Thinking。

> **拆开：** 文档 OCR 上为什么 Instruct 常略强于 Thinking?
> §5.4 原句：Instruct 在 OCR 解析向 marginally outperforming thinking counterpart；CharXiv 推理子集则 Thinking 更强。解析/检索偏短答时 thinking 不一定加分。


Furthermore, among the smaller-sized variants in the Qwen3-VL series, both Qwen3-VL-30BA3B models and Qwen3-VL-32B models consistently outperform Gemini-2.5-Flash and GPT-5-mini across most evaluation metrics, as shown in Table 3. Even the compact dense models — Qwen3-VL-8B, Qwen3-VL-4B, and Qwen3-VL-2B — demonstrate remarkably competitive performance on OCR parsing, visual question answering (VQA), and comprehensive benchmark suites, as detailed in Table 4. This highlights the exceptional efficiency and strong scalability of the Qwen3-VL architecture across model sizes.
中小档在表 3 多数指标上超过 Gemini-2.5-Flash 与 GPT-5-mini；紧凑 Dense 8B/4B/2B 在 OCR 解析与 VQA 上仍很有竞争力（表 4）。

In this version of the Qwen3-VL, we have placed particular emphasis on enhancing its ability to understand long documents. As reported in Table 2, in the comparison within the flagship models on the MMLongBench-Doc benchmark (Ma et al., 2024), our Qwen3-VL-235B-A22B achieves overall accuracy of 57.0%/56.2% under the instruct/thinking settings, showcasing the SOTA performance on the long document understanding task.
本版特别强调长文档理解。表 2 旗舰在 MMLongBench-Doc 上 instruct/thinking 总体准确率 57.0%/56.2%。

Beyond its strong performance on established benchmarks, we have also made substantial strides in multilingual support. This represents a major expansion from the 10 non-English/Chinese languages supported by Qwen2.5-VL to 39 languages in Qwen3-VL. We assess this expanded capability on a newly constructed, in-house dataset. As illustrated in Figure 2, the model’s accuracy surpasses 70%—a threshold we consider practical for real-world usability—on 32 out of the 39 languages tested. This demonstrates that the strong OCR capabilities of Qwen3-VL are not confined to a handful of languages but extend across a broad and diverse linguistic spectrum.
多语支持从 Qwen2.5-VL 的 10 个非中英语言扩到 39 语。自建集上 39 语中 32 语准确率超过 70%。

### 5.5 2D and 3D Grounding 二维与三维 Grounding

> **确认：** ODinW-13 把置信度钉成 1.0，还能和检测专模比 mAP 吗？
> §5.5 原句设定 confidence scores to 1.0，并把全部类别同时放进 prompt，目的是与开放集检测专模可比。这是评测协议，不是训练时废除置信度。


In this section, we conduct a comprehensive evaluation of the Qwen3-VL series on both 2D and 3D grounding-related benchmarks and compare the models with state-of-the-art models that possess similar capabilities.

We evaluate Qwen3-VL’s 2D grounding capabilities on the referring expression comprehension benchmarks RefCOCO/+/g (Kazemzadeh et al., 2014; Mao et al., 2016), the open-vocabulary object detection benchmark ODinW-13 (Li et al., 2022), and the counting benchmark CountBench (Paiss et al., 2023). For

<!-- page 18 of 42 -->

Table 4: Performance of small-sized Qwen3-VL models and GPT-5-nano on visual benchmarks.
表 4：小档 Qwen3-VL 与 GPT-5-nano。

> **对一下：** 小档 OCRBench 上 Instruct 是否系统性高于 Thinking?
> 表 4 多行可见该趋势，例如 8B OCRBench Instruct 896 vs Thinking 819。与 §5.4 旗舰 OCR 解析向 Instruct 略强的叙述一致。


<table><tr><td rowspan="2"></td><td rowspan="2">Benchmark</td><td colspan="2">Qwen3-VL2B</td><td colspan="2">Qwen3-VL4B</td><td colspan="2">Qwen3-VL8B</td><td colspan="2">OpenAI GPT-5 nano</td></tr><tr><td>thinking</td><td>instruct</td><td>thinking</td><td>instruct</td><td>thinking</td><td>instruct</td><td>high</td><td>minimal</td></tr><tr><td rowspan="13">STEM Puzzle</td><td>MMMU</td><td>61.4</td><td>53.4</td><td>70.8</td><td>67.4</td><td>74.1</td><td>69.6</td><td>75.8</td><td>57.6</td></tr><tr><td>MMMU-Pro</td><td>42.5</td><td>36.5</td><td>57.0</td><td>53.2</td><td>60.4</td><td>55.9</td><td>57.2</td><td>36.5</td></tr><tr><td>MathVista $_{mini}$ </td><td>73.6</td><td>61.3</td><td>79.5</td><td>73.7</td><td>81.4</td><td>77.2</td><td>71.5</td><td>40.9</td></tr><tr><td>MathVision</td><td>45.9</td><td>31.6</td><td>60.0</td><td>51.6</td><td>62.7</td><td>53.9</td><td>62.2</td><td>33.2</td></tr><tr><td>MathVision $_{WP}$ </td><td>35.5</td><td>30.9</td><td>48.7</td><td>44.4</td><td>53.3</td><td>45.4</td><td>49.3</td><td>28.3</td></tr><tr><td>MathVerse $_{mini}$ </td><td>66.9</td><td>52.1</td><td>75.2</td><td>46.8</td><td>77.7</td><td>62.1</td><td>74.2</td><td>27.0</td></tr><tr><td>DynaMath</td><td>66.7</td><td>54.2</td><td>74.4</td><td>65.3</td><td>73.2</td><td>67.7</td><td>78.0</td><td>62.0</td></tr><tr><td>Math-VR</td><td>37.7</td><td>20.7</td><td>58.1</td><td>52.3</td><td>59.0</td><td>53.4</td><td>49.7</td><td>25.0</td></tr><tr><td>ZeroBench</td><td>0</td><td>0</td><td>0</td><td>0</td><td>2</td><td>1</td><td>1</td><td>1</td></tr><tr><td>VlmsAreBlind</td><td>50.0</td><td>56.0</td><td>68.6</td><td>71.9</td><td>69.1</td><td>74.0</td><td>66.7</td><td>40.2</td></tr><tr><td>LogicVista</td><td>50.0</td><td>35.8</td><td>61.1</td><td>53.2</td><td>65.1</td><td>55.3</td><td>59.7</td><td>40.5</td></tr><tr><td>VisuLogic</td><td>25.4</td><td>11.5</td><td>30.2</td><td>19.0</td><td>27.5</td><td>22.5</td><td>24.5</td><td>24.0</td></tr><tr><td>VisualPuzzles</td><td>37.4</td><td>34.3</td><td>48.9</td><td>43.7</td><td>51.7</td><td>47.9</td><td>43.5</td><td>31.3</td></tr><tr><td rowspan="5">General VQA</td><td>MMBench-EN</td><td>79.9</td><td>78.4</td><td>84.6</td><td>83.9</td><td>85.3</td><td>84.5</td><td>78.4</td><td>50.8</td></tr><tr><td>MMBench-CN</td><td>78.8</td><td>75.9</td><td>83.8</td><td>83.5</td><td>85.5</td><td>84.7</td><td>77.6</td><td>48.5</td></tr><tr><td>RealWorldQA</td><td>69.5</td><td>63.9</td><td>73.2</td><td>70.9</td><td>73.5</td><td>71.5</td><td>71.8</td><td>60.7</td></tr><tr><td>MMStar</td><td>68.1</td><td>58.3</td><td>73.2</td><td>69.8</td><td>75.3</td><td>70.9</td><td>68.6</td><td>41.3</td></tr><tr><td>SimpleVQA</td><td>43.6</td><td>40.7</td><td>48.8</td><td>48.0</td><td>49.6</td><td>50.2</td><td>46.0</td><td>39.0</td></tr><tr><td rowspan="3">Alignment</td><td>HallusionBench</td><td>54.9</td><td>51.4</td><td>64.1</td><td>57.6</td><td>65.4</td><td>61.1</td><td>58.4</td><td>39.3</td></tr><tr><td>MM-MT-Bench</td><td>6.9</td><td>5.9</td><td>7.7</td><td>7.5</td><td>8.0</td><td>7.7</td><td>6.6</td><td>6.2</td></tr><tr><td>MIA-Bench</td><td>85.6</td><td>83.6</td><td>91.0</td><td>89.7</td><td>91.5</td><td>91.1</td><td>89.9</td><td>89.6</td></tr><tr><td rowspan="13">Document Understanding</td><td>DocVQA $_{test}$ </td><td>92.9</td><td>93.3</td><td>94.2</td><td>95.3</td><td>95.3</td><td>96.1</td><td>88.2</td><td>78.3</td></tr><tr><td>InfoVQA $_{test}$ </td><td>77.1</td><td>72.4</td><td>83.0</td><td>80.3</td><td>86.0</td><td>83.1</td><td>68.6</td><td>49.2</td></tr><tr><td>AI2Dw.M.</td><td>80.4</td><td>76.9</td><td>84.9</td><td>84.1</td><td>84.9</td><td>85.7</td><td>81.9</td><td>65.7</td></tr><tr><td>ChartQA $_{test}$ </td><td>86.6</td><td>79.1</td><td>88.8</td><td>84.6</td><td>88.6</td><td>89.6</td><td>52.1</td><td>48.6</td></tr><tr><td>OCRBench</td><td>792</td><td>858</td><td>808</td><td>881</td><td>819</td><td>896</td><td>753</td><td>701</td></tr><tr><td>OCRBench_v2en</td><td>56.4</td><td>56.3</td><td>61.8</td><td>63.7</td><td>63.9</td><td>65.4</td><td>48.1</td><td>37.9</td></tr><tr><td>OCRBench_v2zh</td><td>51.9</td><td>53.0</td><td>55.8</td><td>57.6</td><td>59.2</td><td>61.2</td><td>33.6</td><td>27.3</td></tr><tr><td>CC-OCR</td><td>68.3</td><td>72.8</td><td>73.8</td><td>76.2</td><td>76.3</td><td>79.9</td><td>58.9</td><td>52.9</td></tr><tr><td>OmniDocBench $_{en}$ </td><td>0.370</td><td>0.292</td><td>0.234</td><td>0.244</td><td>0.209</td><td>0.170</td><td>0.401</td><td>0.454</td></tr><tr><td>OmniDocBench $_{zh}$ </td><td>0.447</td><td>0.348</td><td>0.297</td><td>0.285</td><td>0.253</td><td>0.264</td><td>0.518</td><td>0.568</td></tr><tr><td>CharXiv(DQ)</td><td>70.1</td><td>62.3</td><td>83.9</td><td>76.2</td><td>85.9</td><td>83.0</td><td>82.0</td><td>64.4</td></tr><tr><td>CharXiv(RQ)</td><td>37.1</td><td>26.8</td><td>50.3</td><td>39.7</td><td>53.0</td><td>46.4</td><td>50.1</td><td>31.7</td></tr><tr><td>MMLongBench $_{Doc}$ </td><td>33.8</td><td>31.6</td><td>44.4</td><td>43.5</td><td>48.0</td><td>47.9</td><td>31.8</td><td>22.1</td></tr><tr><td rowspan="6">2D/3D Grounding</td><td>RefCOCO-avg</td><td>84.8</td><td>85.6</td><td>88.2</td><td>89.0</td><td>88.2</td><td>89.1</td><td>-</td><td>-</td></tr><tr><td>CountBench</td><td>84.1</td><td>88.4</td><td>89.4</td><td>84.9</td><td>91.5</td><td>80.5</td><td>80.0</td><td>62.9</td></tr><tr><td>ODinW-13</td><td>36.0</td><td>43.4</td><td>39.4</td><td>48.2</td><td>39.8</td><td>44.7</td><td>-</td><td>-</td></tr><tr><td>ARKitScenes</td><td>47.7</td><td>56.2</td><td>46.3</td><td>56.6</td><td>46.6</td><td>56.8</td><td>-</td><td>-</td></tr><tr><td>Hypersim</td><td>11.2</td><td>12.0</td><td>11.9</td><td>12.2</td><td>12.0</td><td>12.7</td><td>-</td><td>-</td></tr><tr><td>SUNRGBD</td><td>28.6</td><td>33.8</td><td>28.0</td><td>34.7</td><td>30.4</td><td>36.2</td><td>-</td><td>-</td></tr><tr><td rowspan="5">Embodied/Spatial Understanding</td><td>ERQA</td><td>41.8</td><td>28.3</td><td>47.3</td><td>41.3</td><td>46.8</td><td>45.8</td><td>45.8</td><td>37.8</td></tr><tr><td>VSI-Bench</td><td>48.0</td><td>53.9</td><td>55.2</td><td>59.3</td><td>56.6</td><td>59.4</td><td>15.4</td><td>27.0</td></tr><tr><td>EmbSpatialBench</td><td>75.9</td><td>69.2</td><td>80.7</td><td>79.6</td><td>81.1</td><td>78.5</td><td>74.2</td><td>50.7</td></tr><tr><td>RefSpatialBench</td><td>28.9</td><td>30.3</td><td>45.3</td><td>46.6</td><td>44.6</td><td>54.2</td><td>12.6</td><td>2.5</td></tr><tr><td>RoboSpatialHome</td><td>45.3</td><td>49.1</td><td>63.2</td><td>61.7</td><td>62.0</td><td>66.9</td><td>46.1</td><td>44.8</td></tr><tr><td rowspan="2">Multi-Image</td><td>BLINK</td><td>57.2</td><td>53.8</td><td>63.4</td><td>65.8</td><td>64.7</td><td>69.1</td><td>58.3</td><td>42.2</td></tr><tr><td>MUIRBENCH</td><td>68.1</td><td>47.4</td><td>75.0</td><td>63.8</td><td>76.8</td><td>64.4</td><td>65.7</td><td>45.7</td></tr><tr><td rowspan="7">Video Understanding</td><td>MVBench</td><td>64.5</td><td>61.7</td><td>69.3</td><td>68.9</td><td>69.0</td><td>68.7</td><td>-</td><td>-</td></tr><tr><td>Video-MME $_{w/o sub.}$ </td><td>62.1</td><td>61.9</td><td>68.9</td><td>69.3</td><td>71.8</td><td>71.4</td><td>66.2</td><td>49.4</td></tr><tr><td>MLVUM-Avg</td><td>69.2</td><td>68.3</td><td>75.7</td><td>75.3</td><td>75.1</td><td>78.1</td><td>69.2</td><td>52.6</td></tr><tr><td>LVBench</td><td>47.6</td><td>47.4</td><td>53.5</td><td>56.2</td><td>55.8</td><td>58.0</td><td>-</td><td>-</td></tr><tr><td>Charades-STAMIoU</td><td>56.9</td><td>54.5</td><td>59.0</td><td>55.5</td><td>59.9</td><td>56.0</td><td>-</td><td>-</td></tr><tr><td>VideoMMMU</td><td>54.1</td><td>41.9</td><td>69.4</td><td>56.2</td><td>72.8</td><td>65.3</td><td>63.0</td><td>40.2</td></tr><tr><td>MMVU</td><td>48.9</td><td>41.7</td><td>58.6</td><td>50.5</td><td>62.0</td><td>58.7</td><td>63.1</td><td>51.0</td></tr><tr><td rowspan="3">Perception with Tool</td><td>V*</td><td>69.1</td><td>75.9+</td><td>74.9</td><td>88.0+</td><td>77.5</td><td>90.1+</td><td>-</td><td>-</td></tr><tr><td>HRBench4K</td><td>69.4</td><td>72.6+</td><td>73.5</td><td>81.3+</td><td>72.4</td><td>82.3+</td><td>-</td><td>-</td></tr><tr><td>HRBench8K</td><td>62.6</td><td>68.9+</td><td>67.1</td><td>74.4+</td><td>68.1</td><td>78.0+</td><td>-</td><td>-</td></tr><tr><td rowspan="5">Multi-Modal Agent</td><td>ScreenSpot Pro</td><td>32.2</td><td>48.5</td><td>49.2</td><td>59.5</td><td>46.6</td><td>54.6</td><td>-</td><td>-</td></tr><tr><td>OSWorldG</td><td>41.8</td><td>46.1</td><td>53.9</td><td>58.2</td><td>56.7</td><td>58.2</td><td>-</td><td>-</td></tr><tr><td>AndroidWorld</td><td>46.1</td><td>36.4</td><td>52.0</td><td>45.3</td><td>50.0</td><td>47.6</td><td>-</td><td>-</td></tr><tr><td>OSWorld</td><td>19.0</td><td>17.0</td><td>31.4</td><td>26.2</td><td>33.9</td><td>33.9</td><td>-</td><td>-</td></tr><tr><td>WindowsAA</td><td>-</td><td>-</td><td>35.5</td><td>23.4</td><td>24.1</td><td>28.8</td><td>-</td><td>-</td></tr></table>

<!-- page 19 of 42 -->

ODinW-13, we adopt mean Average Precision (mAP) as the evaluation metric by setting confidence scores to 1.0. To ensure comparability with conventional open-set object detection specialist models, we provide all dataset categories simultaneously within the prompt during evaluation. As shown in Table 2, our flagship model, Qwen3-VL-235B-A22B, demonstrates outstanding performance and achieves state-of-the-art (SOTA) results across 2D grounding and counting benchmarks. Notably, it achieves 48.6 mAP on ODinW-13, demonstrating strong performance in multi-target open-vocabulary object grounding. Detailed results for our smaller-scale variants, which also exhibit competitive performance in 2D visual grounding, are presented in Tables 3 and 4, respectively.
ODinW-13 以 mAP 为指标，置信度固定 1.0，评测时把全部类别同时放进 prompt。旗舰 ODinW-13 达 48.6 mAP。更小档见表 3，表 4。

Moreover, in this version of Qwen3-VL, we enhance its spatial perception capabilities for 3D object localization. We evaluate the Qwen3-VL series against other models of comparable scale on Omni3D (Brazil et al., 2023), a comprehensive benchmark comprising datasets such as ARKitScenes (Baruch et al., 2021), Hypersim (Roberts et al., 2021), and SUN RGB-D (Song et al., 2015). We employ mean Average Precision (mAP) as our evaluation metric. Each input is an image-text pair consisting of the image and a textual prompt specifying the object category. To ensure a fair comparison with existing VLMs, we set the IoU threshold to 0.15 and report mAP@0.15 on the Omni3D test set, with detection confidence fixed at 1.0. As shown in Table 2, our flagship Qwen3-VL-235B-A22B model consistently outperforms other closedsource models across multiple datasets. Specifically, on the SUN RGB-D dataset (Song et al., 2015), the Qwen3-VL-235B-A22B-Thinking variants surpass the performance of Gemini-2.5-Pro by 5.2 points. Our smaller-scale variants (e.g., Qwen3-VL-30BA3B, -32B, -8B, -4B, -2B) also exhibit remarkably competitive performance in 3D object grounding, with detailed results provided in Tables 3 and 4, respectively.
3D 定位在 Omni3D 上评测，报 mAP@0.15，置信度 1.0. SUN RGB-D 上 Thinking 相对 Gemini-2.5-Pro 高 5.2。

### 5.6 Fine-grained Perception 细粒度感知

> **回看：** ∼5 分工具增益是推理时算力 scaling 吗？
> 不是。§5.6 写 integrating external tools / tool-integrated agentic learning，对应 §4.5 工具回路，不是 thinking budget 那种纯加长 CoT 的推理时算力旋钮。


We measure the models’ fine-grained perception capabilities on three popular benchmarks. The Qwen3- VL series demonstrates a substantial leap in fine-grained visual understanding compared to its pre-decessor, Qwen2.5-VL-72B. Notably, Qwen3-VL-235B-A22B achieves the state-of-the-art performance across all three benchmarks when augmented with tools—reaching 93.7 on V\* (Wu &Xie, 2024), 85.3 on HRBench-4k (Wang et al., 2024e), and 82.3 on HRBench-8k (Wang et al., 2024e). This consistent outperformance highlights the effectiveness of architectural refinements and training strategies introduced in Qwen3-VL, particularly in handling high-resolution inputs and subtle visual distinctions critical for fine-grained perception tasks. Second, and perhaps more surprisingly, the performance gains from integrating external tools consistently outweigh those from simply increasing model size. For example, within the Qwen3-VL family, the absolute improvement by adding tools is consistently ∼ 5 points across V\*. These findings reinforce our conviction that scaling tool-integrated agentic learning in multimodality is a highly promising path forward.
细粒度感知相对 Qwen2.5-VL-72B 大幅跃升。加工具后旗舰 V\* 93.7, HRBench-4k 85.3, HRBench-8k 82.3。接入外部工具的增益 consistently 大于单纯放大模型，V\* 上约 **∼5** 分。

### 5.7 Multi-Image Understanding 多图理解

Beyond single-image grounded dialogue evaluation, advancing VLMs to handle multi-image understanding is of significant value. This task requires higher-level contextual analysis across diverse visual patterns, enabling more advanced recognition and reasoning capabilities. To this end, we nourish Qwen3-VL with comprehensive cross-image pattern learning techniques, including multi-image referring grounding, visual correspondence, and multi-hop reasoning. We evaluated Qwen3-VL on two prominent multi-image benchmarks: BLINK (Fu et al., 2024c) and MuirBench (Wang et al., 2024a). As shown in Table 2, Qwen3-VL demonstrates overall superiority in multi-image understanding compared to other leading LVLMs. Specifically, Qwen3-VL-235B-A22B-Instruct achieves performance comparable to state-of-the-art models such as Gemini-2.5-pro, while Qwen3-VL-235B-A22B-Thinking attains a remarkable leading score of 80.1 on MuirBench, surpassing all other models.
多图理解在 BLINK 与 MuirBench 上评测。Instruct 可比 Gemini-2.5-pro；Thinking 在 MuirBench 以 80.1 领先。

### 5.8 Embodied and Spatial Understanding 具身与空间理解

For embodied and spatial understanding, Qwen3-VL’s performance is rigorously benchmarked against leading SOTA models using a challenging suite of benchmarks: ERQA (Team et al., 2025), VSIBench (Yang et al., 2025b), EmbSpatial (Du et al., 2024), RefSpatial (Zhou et al., 2025), and RoboSpatialHome (Song et al., 2025a). Across these benchmarks, the model showcases exceptional capabilities, rivaling the performance of top-tier models like Gemini-2.5-Pro, GPT-5, and Claude-Opus-4.1. This success is largely driven by the model’s profound spatial understanding, which stems from its training on high-resolution visual data with fine-grained pointing, relative-position annotations, and QA pairs. This capability is clearly validated by its strong results on EmbSpatial, RefSpatial, and RoboSpatialHome, where Qwen3-VL-235B-A22 achieves scores of 84.3, 69.9, and 73.9, respectively. Moreover, its embodied intelligence is significantly enhanced through the integration of pointing, grounding, and spatio-temporal perception data during training, leading to top-tier scores of 52.5 on ERQA (Team et al., 2025) and 60.0 on VSIBench (Yang et al.,
具身与空间理解在 ERQA，VSIBench，EmbSpatial，RefSpatial，RoboSpatialHome 上对标。旗舰 EmbSpatial/RefSpatial/RoboSpatialHome 为 84.3 / 69.9 / 73.9; ERQA 52.5, VSIBench 60.0。

<!-- page 20 of 42 -->

2025b) for Qwen3-VL-235B-A22B.

### 5.9 Video Understanding 视频理解

> **停一下：** 评测 2048 帧 / 224K video token 与产品 256K 窗口如何对齐？
> §5.9：每视频最多 2,048 帧且视频 token 不超过 224K；产品/训练叙事是交错 256K. 横比用 §5.9 口径，不要把 256K 直接当成视频 token 预算。


Benefiting from the scaling of training data and key architectural enhancements, Qwen3-VL demonstrates substantially improved video understanding capabilities. In particular, the integration of interleaved MRoPE, the insertion of textual timestamps, and scaling temporally dense video captions collectively enable the Qwen3-VL 8B variant to achieve performance competitive with the significantly larger Qwen2.5-VL 72B model.
视频理解大幅提升。interleaved MRoPE，文本时间戳与稠密时间 caption 扩容共同使 8B 档可比显著更大的 Qwen2.5-VL-72B。

We conduct a comprehensive evaluation across a diverse set of video understanding tasks, encompassing general video understanding (VideoMME (Fu et al., 2024a), MVBench (Li et al., 2024b)), temporal video grounding (Charades-STA (Gao et al., 2017)), video reasoning (VideoMMMU (Hu et al., 2025), MMVU (Zhao et al., 2025)), and long-form video understanding (LVBench (Wang et al., 2024d), MLVU (Zhou et al., 2024)). In comparison with state-of-the-art proprietary models — including Gemini 2.5 Pro, GPT-5, and Claude Opus 4.1, Qwen3-VL demonstrates competitive and, in several cases, superior performance. In particular, our flagship model, Qwen3-VL-235B-A22B-Instruct, achieves performance on par with leading models such as Gemini 2.5 Pro (with a thinking budget of 128) and GPT-5 minimal on standard video understanding benchmarks. By extending the context window to 256K tokens, it further attains or even surpasses Gemini-2.5-Pro on long-video evaluation tasks, most notably on MLVU.
视频评测覆盖 VideoMME，MVBench，Charades-STA，VideoMMMU，MMVU，LVBench，MLVU 等。旗舰 Instruct 可比 Gemini 2.5 Pro (thinking budget 128) 与 GPT-5 minimal；上下文 256K 后在长视频（尤其 MLVU）上达到甚至超过 Gemini-2.5-Pro。

Regarding evaluation details, we imposed a cap of 2,048 frames per video for all benchmarks, ensuring that the total number of video tokens did not exceed 224K. The maximum number of tokens per frame was set to 768 for VideoMMMU and MMVU, and to 640 for all other benchmarks. Additionally, videos from Charades-STA were sampled at 4 frames per second (fps), while a rate of 2 fps was used for all other benchmarks. For VideoMMMU, we employed a model-based judge for evaluation, as rule-based scoring proved insufficiently accurate. It is worth noting that our comparison cannot guarantee full fairness due to resource and API limitations, which constrained the number of input frames used during evaluation: 512 for Gemini 2.5 Pro, 256 for GPT-5, and 100 for Claude Opus 4.1.
评测细节：每视频最多 2,048 帧，视频 token 不超过 224K；每帧上限 VideoMMMU/MMVU 768，其余 640；Charades-STA 4 fps，其余 2 fps。对照帧预算 Gemini 512，GPT-5 256，Claude 100，正文承认横比不能保证完全公平。

### 5.10 Agent

We evaluate UI perception with GUI-grounding tasks (ScreenSpot (Cheng et al., 2024), ScreenSpot Pro (Li et al., 2025b), OSWorldG(Xie et al., 2025a)) and assess decision-making abilities through online environment evaluations (AndroidWorld (Rawles et al., 2024), OSWorld (Xie et al., 2025c;b)). For GUI grounding, Qwen3-VL-235B-A22B achieves state-of-the-art performance across multiple tasks, covering interactive interfaces on desktop, mobile, and PC, and demonstrating exceptionally strong UI perception capabilities. For online evaluations, Qwen3-VL 32B scores 41 on OSWorld and 63.7 on AndroidWorld, which surpasses the current foundation VLMs. Qwen3-VL demonstrates exceptionally strong planning, decision-making, and reflection abilities as a GUI agent. Furthermore, smaller Qwen3-VL models have demonstrated highly competitive performance on these benchmarks.
GUI grounding 与在线环境评测。旗舰 GUI grounding 多任务 SOTA; 32B OSWorld 41, AndroidWorld 63.7。

### 5.11 Text-Centric Tasks 文本中心任务

To comprehensively evaluate the text-centric performance of Qwen3-VL, we adopt automatic benchmarks to assess model performance on both instruct and thinking models. These benchmarks can be categorized into the following key types: (1) **Knowledge:** MMLU-Pro (Wang et al., 2024f), MMLU-Redux (Gema et al., 2024), GPQA (Rein et al., 2023), SuperGPQA (Team, 2025), (2) **Reasoning:** AIME-25 (AIME, 2025), HMMT-25 (HMMT, 2025), LiveBench (2024-11-25) (White et al., 2024), (3) **Code:** LiveCodeBench v6 (Jain et al., 2024), CFEval, OJBench (Wang et al., 2025c), (4) **Alignment Tasks:** IFEval (Zhou et al., 2023), Arena-Hard v2 (Li et al., 2024d) <sup>1</sup>, Creative Writing v3 (Paech, 2023) <sup>2</sup>, WritingBench (Wu et al., 2025b), (5) **Agent:** BFCL-v3 (Patil et al., 2024), TAU2-Retail, TAU2-Airline, TAU2-Telecom, (6) **Multilingual:** MultiIF (He et al., 2024), MMLU-ProX, INCLUDE (Romanou et al., 2025), PolyMATH (Wang et al., 2025b).

**Evaluation Settings** For Qwen3-VL instruct models including 235B-A22B, 32B and 30B-A3B, we configure the sampling hyperparameters with temperature = 0.7, top-p = 0.8, top-k = 20, and presence penalty = 1.5. As for the small instruct models including 8B, 4B and 2B, we set the temperature = 1.0, top-p = 1.0, top-k = 40, and presence penalty = 2.0. We set the max output length to 32,768 tokens.
**评测设置** 大档 Instruct: temperature 0.7，top-p 0.8，top-k 20，presence penalty 1.5；小档 Instruct: 1.0 / 1.0 / 40 / 2.0。最大输出 32,768 token。

For Qwen3-VL thinking models with Mixture-of-Experts (MoE) architecture, we set the sampling temperature to 0.6, top-p to 0.95, and top-k to 20. For the dense thinking models, we set temperature = 1.0, top-p

<small><span class="docvortex-page-footnote" data-block-type="page_footnote" style="color:#6b7280"><sup>1</sup>For reproducibility of Arena-Hard v2, we report the win rates evaluated by GPT-4.1.</span></small>

<small><span class="docvortex-page-footnote" data-block-type="page_footnote" style="color:#6b7280"><sup>2</sup>For reproducibility of Creative Writing v3, we report the scores evaluated by Claude 3.7 Sonnet.</span></small>

<!-- page 21 of 42 -->

Table 5: Comparison among Qwen3-VL-235B-A22B (Instruct) and other baselines. The highest and second-best scores are shown in bold and underlined respectively.
表 5：旗舰 Instruct 与基线。

<table><tr><td></td><td>Benchmark</td><td>Qwen3-VL235B-A22BInstruct</td><td>Qwen3235B-A22BInstruct-2507</td><td>Deepseek V30324</td><td>Claude-Opus-4(Without thinking)</td></tr><tr><td rowspan="4">Knowledge</td><td>MMLU-Pro</td><td>81.8</td><td>83.0</td><td>81.2</td><td>86.6</td></tr><tr><td>MMLU-Redux</td><td>92.2</td><td>93.1</td><td>90.4</td><td>94.2</td></tr><tr><td>GPQA</td><td>74.3</td><td>77.5</td><td>68.4</td><td>74.9</td></tr><tr><td>SuperGPQA</td><td>60.4</td><td>62.6</td><td>57.3</td><td>56.5</td></tr><tr><td rowspan="3">Reasoning</td><td>AIME-25</td><td>74.7</td><td>70.3</td><td>46.6</td><td>33.9</td></tr><tr><td>HMMT-25</td><td>57.4</td><td>55.4</td><td>27.5</td><td>15.9</td></tr><tr><td>LiveBench 2024-11-25</td><td>74.8</td><td>75.4</td><td>66.9</td><td>74.6</td></tr><tr><td rowspan="4">Alignment Tasks</td><td>IFEval</td><td>87.8</td><td>88.7</td><td>82.3</td><td>87.4</td></tr><tr><td>Arena-Hard V2 (winrate)</td><td>77.4</td><td>79.2</td><td>45.6</td><td>51.5</td></tr><tr><td>Creative Writing v3</td><td>86.5</td><td>87.5</td><td>81.6</td><td>83.8</td></tr><tr><td>WritingBench</td><td>85.5</td><td>85.2</td><td>74.5</td><td>79.2</td></tr><tr><td rowspan="2">Coding &amp; Agent</td><td>LiveCodeBench v6</td><td>54.3</td><td>51.8</td><td>45.2</td><td>44.6</td></tr><tr><td>BFCL-v3</td><td>67.7</td><td>70.9</td><td>64.7</td><td>60.1</td></tr><tr><td rowspan="4">Multilingualism</td><td>MultiIF</td><td>76.3</td><td>77.5</td><td>66.5</td><td>-</td></tr><tr><td>MMLU-ProX</td><td>77.8</td><td>79.4</td><td>75.8</td><td>-</td></tr><tr><td>INCLUDE</td><td>80.0</td><td>79.5</td><td>80.1</td><td>-</td></tr><tr><td>PolyMATH</td><td>45.1</td><td>50.2</td><td>32.2</td><td>30.0</td></tr></table>

= 0.95, top-k = 20, and additionally apply a presence penalty of 1.5 to encourage greater output diversity. We set the max output length to 32,768 tokens, except AIME-25, HMMT-25 and LiveCodeBench v6 where we extend the length to 81,920 tokens to provide sufficient thinking space.
0.95，top-k 20，另加 presence penalty 1.5。最大输出默认 32,768；AIME-25 / HMMT-25 / LiveCodeBench v6 延到 81,920。

The detailed results are as follows.

**Qwen3-VL-235B-A22B** We compare our flagship model Qwen3-VL-235B-A22B with the leading instruct and thinking models. For the Qwen3-VL-235B-A22B-Instruct, we take Qwen3-235B-A22B-Instruct-2507, DeepSeek V3 0324, and Claude-Opus-4 (without thinking) as the baselines. For the Qwen3-VL-235B-A22B-Thinking, we take Qwen3-235B-A22B-Thinking-2507, OpenAI o3 (medium), Claude-Opus-4 (with thinking) as baselines. We present the evaluation results in Table 5 and Table 6.

**Qwen3-VL-235B-A22B** 把旗舰与领先的 Instruct，Thinking 模型对比：Instruct 侧基线取 Qwen3-235B-A22B-Instruct-2507, DeepSeek V3 0324, Claude-Opus-4 (without thinking)；Thinking 侧基线取 Qwen3-235B-A22B-Thinking-2507, OpenAI o3 (medium), Claude-Opus-4 (with thinking)。结果见表 5 与表 6。

• From Table 5, Qwen3-VL-235B-A22B-Instruct achieves competitive results, comparable to or even surpassing the other leading models, including DeepSeek V3 0324, Claude-Opus-4 (without thinking), and our previous flagship model Qwen3-235B-A22B-Instruct-2507. Particularly, Qwen3-VL-235B-A22B-Instruct exceeds other models on reasoning-demand tasks (e.g., mathematics and coding). It is worth noting that DeepSeek V3 0324 and Qwen3-235B-A22B-Instruct-2507 are Large Language Models, while Qwen3-VL-235B-A22B-Instruct is a Vision Language model which can process visual and textual tasks. This means that Qwen3-VL-235B-Instruct has achieved the integration of visual and textual capabilities.

表 5: Qwen3-VL-235B-A22B-Instruct 成绩有竞争力，可比肩甚至超过 DeepSeek V3 0324, Claude-Opus-4 (without thinking) 与自家上代旗舰 Qwen3-235B-A22B-Instruct-2507，在数学，代码等重推理任务上反超。值得注意的是，DeepSeek V3 0324 与 Qwen3-235B-A22B-Instruct-2507 是纯文本 LLM，而 Qwen3-VL-235B-A22B-Instruct 是能同时处理视觉与文本任务的视觉语言模型，即视觉与文本能力已完成整合。

• From Table 6, Qwen3-VL-235B-A22B-Thinking also achieves competitive results compared with other leading thinking models. Qwen3-VL-235B-A22B-Thinking exceeds OpenAI o3 (medium) and Claude-Opus-4 (with thinking) on AIME-25 and LiveCodeBench v6, which means Qwen3-VL-235B-A22B-Thinking has better reasoning ability.

表 6: Qwen3-VL-235B-A22B-Thinking 对其他领先推理模型同样有竞争力，在 AIME-25 与 LiveCodeBench v6 上超过 OpenAI o3 (medium) 与 Claude-Opus-4 (with thinking)，推理能力更强。

**Qwen3-VL-32B / 30B-A3B** We compare our Qwen3-VL-32B and Qwen3-VL-30B-A3B models with their corresponding text-only counterparts, namely Qwen3-32B, Qwen3-30B-A3B, and Qwen3-30B-A3B-2507. We present the evaluation results in Table 7 and Table 8.

**Qwen3-VL-32B / 30B-A3B** 与对应纯文本模型 Qwen3-32B，Qwen3-30B-A3B，Qwen3-30B-A3B-2507 对比，结果见表 7 与表 8。

• From Table 7, for instruct models, Qwen3-VL-32B and Qwen3-VL-30B-A3B show significant performance improvement compared with Qwen3-32B and Qwen3-30B-A3B on all the benchmarks. Qwen3-VL-30B-A3B achieves comparable or even better results compared with Qwen3-30B-A3B-2507, particularly AIME-25 and HMMT-25.

表 7 (Instruct): Qwen3-VL-32B 与 Qwen3-VL-30B-A3B 在所有基准上都较 Qwen3-32B，Qwen3-30B-A3B 明显提升；Qwen3-VL-30B-A3B 还可比肩甚至优于 Qwen3-30B-A3B-2507，尤其是 AIME-25 与 HMMT-25。

• From Table 8, for thinking models, Qwen3-VL-32B and Qwen3-VL-30B-A3B surpass the baselines in most of the benchmarks. Qwen3-VL-30B-A3B also shows comparable performance compared with Qwen3-30B-A3B-2507.

表 8 (Thinking): Qwen3-VL-32B 与 Qwen3-VL-30B-A3B 在多数基准上超过基线；Qwen3-VL-30B-A3B 与 Qwen3-30B-A3B-2507 表现相当。

<!-- page 22 of 42 -->

Table 6: Comparison among Qwen3-VL-235B-A22B (Thinking) and other reasoning baselines. The highest and second-best scores are shown in bold and underlined respectively.
表 6：旗舰 Thinking 与推理基线。

<table><tr><td></td><td>Benchmark</td><td>Qwen3-VL235B-A22BThinking</td><td>Qwen3235B-A22BThinking-2507</td><td>OpenAI o3(medium)</td><td>Claude-Opus-4(With thinking)</td></tr><tr><td rowspan="4">Knowledge</td><td>MMLU-Pro</td><td>83.8</td><td>84.4</td><td>85.9</td><td>-</td></tr><tr><td>MMLU-Redux</td><td>93.7</td><td>93.8</td><td>94.9</td><td>94.6</td></tr><tr><td>GPQA</td><td>77.1</td><td>81.1</td><td>83.3(high)</td><td>79.6</td></tr><tr><td>SuperGPQA</td><td>64.3</td><td>64.9</td><td>-</td><td>-</td></tr><tr><td rowspan="3">Reasoning</td><td>AIME-25</td><td>89.7</td><td>92.3</td><td>88.9(high)</td><td>75.5</td></tr><tr><td>HMMT-25</td><td>77.4</td><td>83.9</td><td>77.5</td><td>58.3</td></tr><tr><td>LiveBench 2024-11-25</td><td>79.6</td><td>78.4</td><td>78.3</td><td>78.2</td></tr><tr><td rowspan="3">Coding</td><td>LiveCodeBench v6</td><td>70.1</td><td>74.1</td><td>58.6</td><td>48.9</td></tr><tr><td>CFEval</td><td>1964</td><td>2134</td><td>2043</td><td>-</td></tr><tr><td>OJBench</td><td>27.5</td><td>32.5</td><td>25.4</td><td>-</td></tr><tr><td rowspan="4">Alignment Tasks</td><td>IFEval</td><td>88.2</td><td>87.8</td><td>92.1</td><td>89.7</td></tr><tr><td>Arena-Hard V2 (winrate)</td><td>74.8</td><td>79.7</td><td>80.8</td><td>59.1</td></tr><tr><td>Creative Writing v3</td><td>85.7</td><td>86.1</td><td>87.7</td><td>83.8</td></tr><tr><td>WritingBench</td><td>86.7</td><td>88.3</td><td>85.3</td><td>79.1</td></tr><tr><td rowspan="4">Agent</td><td>BFCL-v3</td><td>71.8</td><td>71.9</td><td>72.4</td><td>61.8</td></tr><tr><td>TAU2-Retail</td><td>67.0</td><td>71.9</td><td>76.3</td><td>-</td></tr><tr><td>TAU2-Airline</td><td>62.0</td><td>58.0</td><td>70.0</td><td>-</td></tr><tr><td>TAU2-Telecom</td><td>44.7</td><td>45.6</td><td>60.5</td><td>-</td></tr><tr><td rowspan="4">Multilingualism</td><td>MultiIF</td><td>79.1</td><td>80.6</td><td>80.3</td><td>-</td></tr><tr><td>MMLU-ProX</td><td>80.6</td><td>81.0</td><td>83.3</td><td>-</td></tr><tr><td>INCLUDE</td><td>80.0</td><td>81.0</td><td>86.6</td><td>-</td></tr><tr><td>PolyMATH</td><td>57.8</td><td>60.1</td><td>49.7</td><td>-</td></tr></table>

Table 7: Comparison among Qwen3-VL-32B-Instruct, Qwen3-VL-30B-A3B-Instruct, and corresponding baselines.
表 7：中档 Instruct 与基线。

<table><tr><td></td><td>Benchmark</td><td>Qwen3-VL 32B Instruct</td><td>Qwen3 32B Instruct</td><td>Qwen3-VL 30B-A3B Instruct</td><td>Qwen3 30B-A3B Instruct</td><td>Qwen3 30B-A3B Instruct-2507</td></tr><tr><td rowspan="4">Knowledge</td><td>MMLU-Pro</td><td>78.6</td><td>71.9</td><td>77.8</td><td>69.1</td><td>78.4</td></tr><tr><td>MMLU-Redux</td><td>89.8</td><td>85.7</td><td>88.4</td><td>84.1</td><td>89.3</td></tr><tr><td>GPQA</td><td>68.9</td><td>54.6</td><td>70.4</td><td>54.8</td><td>70.4</td></tr><tr><td>SuperGPQA</td><td>54.6</td><td>43.2</td><td>53.1</td><td>42.2</td><td>53.4</td></tr><tr><td rowspan="3">Reasoning</td><td>AIME-25</td><td>66.2</td><td>20.2</td><td>69.3</td><td>21.6</td><td>61.3</td></tr><tr><td>HMMT-25</td><td>46.1</td><td>10.9</td><td>50.6</td><td>12.0</td><td>43.0</td></tr><tr><td>LiveBench 2024-11-25</td><td>72.2</td><td>31.3</td><td>65.4</td><td>59.4</td><td>69.0</td></tr><tr><td rowspan="4">Alignment Tasks</td><td>IFEval</td><td>84.7</td><td>83.2</td><td>85.8</td><td>83.7</td><td>84.7</td></tr><tr><td>Arena-Hard V2 (winrate)</td><td>64.7</td><td>37.4</td><td>58.5</td><td>24.8</td><td>69.0</td></tr><tr><td>Creative Writing v3</td><td>85.6</td><td>80.6</td><td>84.6</td><td>68.1</td><td>86.0</td></tr><tr><td>WritingBench</td><td>82.9</td><td>81.3</td><td>82.6</td><td>72.2</td><td>85.5</td></tr><tr><td rowspan="2">Coding &amp; Agent</td><td>LiveCodeBench v6</td><td>43.8</td><td>29.1</td><td>42.6</td><td>29.0</td><td>43.2</td></tr><tr><td>BFCL-v3</td><td>70.2</td><td>63.0</td><td>66.3</td><td>58.6</td><td>65.1</td></tr><tr><td rowspan="4">Multilingualism</td><td>MultiIF</td><td>72.0</td><td>70.7</td><td>66.1</td><td>70.8</td><td>67.9</td></tr><tr><td>MMLU-ProX</td><td>73.4</td><td>69.3</td><td>70.9</td><td>65.1</td><td>72.0</td></tr><tr><td>INCLUDE</td><td>74.0</td><td>69.6</td><td>71.6</td><td>67.8</td><td>71.9</td></tr><tr><td>PolyMATH</td><td>40.5</td><td>22.5</td><td>44.3</td><td>23.3</td><td>43.1</td></tr></table>

**Qwen3-VL-8B / 4B / 2B** We present the evaluation results of Qwen3-VL-2B, Qwen3-VL-4B, and Qwen3- VL-8B in Table 9 and Table 10. For Qwen3-VL-2B and Qwen3-VL-8B, we compare them with Qwen3-1.7B and Qwen3-8B. For Qwen3-VL-4B, we compare it with Qwen3-4B and Qwen3-4B-2507. Overall, these edge-side models exhibit impressive performance and outperform baselines. These results demonstrate

<!-- page 23 of 42 -->

Table 8: Comparison among Qwen3-VL-32B (Thinking), Qwen3-VL-30B-A3B (Thinking), and corresponding baselines.
表 8：中档 Thinking 与基线。

<table><tr><td></td><td>Benchmark</td><td>Qwen3-VL 32B Thinking</td><td>Qwen3 32B Thinking</td><td>Qwen3-VL 30B-A3B Thinking</td><td>Qwen3 30B-A3B Thinking</td><td>Qwen3 30B-A3B Thinking-2507</td></tr><tr><td rowspan="4">Knowledge</td><td>MMLU-Pro</td><td>82.1</td><td>79.1</td><td>80.5</td><td>78.5</td><td>80.9</td></tr><tr><td>MMLU-Redux</td><td>91.9</td><td>90.9</td><td>90.9</td><td>89.5</td><td>91.4</td></tr><tr><td>GPQA</td><td>73.1</td><td>68.4</td><td>74.4</td><td>65.8</td><td>73.4</td></tr><tr><td>SuperGPQA</td><td>59.0</td><td>54.1</td><td>56.4</td><td>51.8</td><td>56.8</td></tr><tr><td rowspan="3">Reasoning</td><td>AIME-25</td><td>83.7</td><td>72.9</td><td>83.1</td><td>70.9</td><td>85.0</td></tr><tr><td>HMMT-25</td><td>64.6</td><td>51.8</td><td>67.6</td><td>49.8</td><td>71.4</td></tr><tr><td>LiveBench 2024-11-25</td><td>74.7</td><td>65.7</td><td>72.1</td><td>74.3</td><td>76.8</td></tr><tr><td rowspan="3">Coding</td><td>LiveCodeBench v6</td><td>65.6</td><td>60.6</td><td>64.2</td><td>57.4</td><td>66.0</td></tr><tr><td>CFEval</td><td>1842</td><td>1986</td><td>1894</td><td>1940</td><td>2044</td></tr><tr><td>OJBench</td><td>20.0</td><td>24.1</td><td>23.4</td><td>20.7</td><td>25.1</td></tr><tr><td rowspan="4">Alignment Tasks</td><td>IFEval</td><td>87.8</td><td>85.0</td><td>81.7</td><td>86.5</td><td>88.9</td></tr><tr><td>Arena-Hard V2 (winrate)</td><td>60.5</td><td>50.3</td><td>56.7</td><td>36.3</td><td>56.0</td></tr><tr><td>Creative Writing v3</td><td>83.3</td><td>84.4</td><td>82.5</td><td>79.1</td><td>84.4</td></tr><tr><td>WritingBench</td><td>86.2</td><td>78.4</td><td>85.2</td><td>77.0</td><td>85.0</td></tr><tr><td rowspan="4">Agent</td><td>BFCL-v3</td><td>71.7</td><td>70.3</td><td>68.6</td><td>69.1</td><td>72.4</td></tr><tr><td>TAU2-Retail</td><td>59.4</td><td>59.6</td><td>64.0</td><td>34.2</td><td>58.8</td></tr><tr><td>TAU2-Airline</td><td>52.5</td><td>38.0</td><td>48.0</td><td>36.0</td><td>58.0</td></tr><tr><td>TAU2-Telecom</td><td>46.9</td><td>26.3</td><td>27.2</td><td>22.8</td><td>26.3</td></tr><tr><td rowspan="4">Multilingualism</td><td>MultiIF</td><td>78.0</td><td>73.0</td><td>73.0</td><td>72.2</td><td>76.4</td></tr><tr><td>MMLU-ProX</td><td>77.2</td><td>74.6</td><td>76.1</td><td>73.1</td><td>76.4</td></tr><tr><td>INCLUDE</td><td>76.3</td><td>73.7</td><td>74.5</td><td>71.9</td><td>74.4</td></tr><tr><td>PolyMATH</td><td>52.0</td><td>47.4</td><td>51.7</td><td>46.1</td><td>52.6</td></tr></table>

Table 9: Comparison among Qwen3-VL-2B (Instruct), Qwen3-VL-4B (Instruct), Qwen3-VL-8B (Instruct) and corresponding baselines.
表 9：小档 Instruct 与基线。

<table><tr><td></td><td>Benchmark</td><td>Qwen3-VL2BInstruct</td><td>Qwen3-VL4BInstruct</td><td>Qwen3-VL8BInstruct</td><td>Qwen31.7BInstruct</td><td>Qwen34BInstruct</td><td>Qwen38BInstruct</td><td>Qwen34BInstruct-2507</td></tr><tr><td rowspan="4">Knowledge</td><td>MMLU-Pro</td><td>49.0</td><td>67.1</td><td>71.6</td><td>42.3</td><td>58.0</td><td>63.4</td><td>69.6</td></tr><tr><td>MMLU-Redux</td><td>66.5</td><td>81.5</td><td>84.9</td><td>63.6</td><td>77.3</td><td>79.5</td><td>84.2</td></tr><tr><td>GPQA</td><td>42.0</td><td>55.9</td><td>61.9</td><td>34.7</td><td>41.7</td><td>39.3</td><td>62.0</td></tr><tr><td>SuperGPQA</td><td>24.3</td><td>40.3</td><td>44.5</td><td>22.8</td><td>32.0</td><td>35.8</td><td>42.8</td></tr><tr><td rowspan="3">Reasoning</td><td>AIME-25</td><td>22.2</td><td>46.6</td><td>45.9</td><td>10.6</td><td>19.1</td><td>20.9</td><td>47.4</td></tr><tr><td>HMMT-25</td><td>10.9</td><td>30.7</td><td>32.5</td><td>6.2</td><td>12.1</td><td>11.8</td><td>31.0</td></tr><tr><td>LiveBench 2024-11-25</td><td>39.5</td><td>60.9</td><td>62.0</td><td>35.6</td><td>48.4</td><td>53.5</td><td>63.0</td></tr><tr><td rowspan="4">Alignment Tasks</td><td>IFEval</td><td>68.2</td><td>82.3</td><td>83.7</td><td>67.1</td><td>81.2</td><td>83.0</td><td>83.4</td></tr><tr><td>Arena-Hard V2 (winrate)</td><td>6.4</td><td>30.4</td><td>46.3</td><td>4.1</td><td>9.5</td><td>15.5</td><td>43.4</td></tr><tr><td>Creative Writing v3</td><td>48.6</td><td>72.3</td><td>77.0</td><td>49.1</td><td>53.6</td><td>69.0</td><td>83.5</td></tr><tr><td>WritingBench</td><td>73.0</td><td>82.5</td><td>83.1</td><td>65.1</td><td>68.5</td><td>71.4</td><td>83.4</td></tr><tr><td rowspan="2">Coding &amp; Agent</td><td>LiveCodeBench v6</td><td>20.3</td><td>37.9</td><td>39.3</td><td>16.1</td><td>26.4</td><td>25.5</td><td>35.1</td></tr><tr><td>BFCL-v3</td><td>55.4</td><td>63.3</td><td>66.3</td><td>52.2</td><td>57.6</td><td>60.2</td><td>61.9</td></tr><tr><td rowspan="4">Multilingualism</td><td>MultiIF</td><td>43.2</td><td>61.5</td><td>66.8</td><td>43.2</td><td>61.3</td><td>69.2</td><td>69.0</td></tr><tr><td>MMLU-ProX</td><td>38.8</td><td>59.4</td><td>65.4</td><td>33.5</td><td>49.6</td><td>58.0</td><td>61.6</td></tr><tr><td>INCLUDE</td><td>45.8</td><td>61.4</td><td>67.0</td><td>42.6</td><td>53.8</td><td>62.5</td><td>60.1</td></tr><tr><td>PolyMATH</td><td>14.9</td><td>28.8</td><td>30.4</td><td>10.3</td><td>16.6</td><td>18.8</td><td>31.1</td></tr></table>

the efficacy of our Strong-to-Weak Distillation approach, making it possible for us to build the lightweight models with remarkably reduced costs and efforts.

**Qwen3-VL-8B / 4B / 2B** 结果见表 9 与表 10: Qwen3-VL-2B，Qwen3-VL-8B 对比 Qwen3-1.7B，Qwen3-8B；Qwen3-VL-4B 对比 Qwen3-4B 与 Qwen3-4B-2507。总体看，这些端侧小模型表现出众，超过基线，验证了 Strong-to-Weak Distillation 的有效性，让我们能以显著更低的成本与投入构建轻量模型。

<!-- page 24 of 42 -->

Table 10: Comparison among Qwen3-VL-2B (Thinking), Qwen3-VL-4B (Thinking), Qwen3-VL-8B (Thinking) and corresponding baselines.
表 10：小档 Thinking 与基线。

<table><tr><td></td><td>Benchmark</td><td>Qwen3-VL2BThinking</td><td>Qwen3-VL4BThinking</td><td>Qwen3-VL8BThinking</td><td>Qwen31.7BThinking</td><td>Qwen34BThinking</td><td>Qwen38BThinking</td><td>Qwen34BThinking-2507</td></tr><tr><td rowspan="4">Knowledge</td><td>MMLU-Pro</td><td>62.3</td><td>73.6</td><td>77.3</td><td>58.1</td><td>70.4</td><td>74.6</td><td>74.0</td></tr><tr><td>MMLU-Redux</td><td>76.9</td><td>86.0</td><td>88.8</td><td>73.9</td><td>83.7</td><td>87.5</td><td>86.1</td></tr><tr><td>GPQA</td><td>49.5</td><td>64.1</td><td>69.9</td><td>27.9</td><td>55.9</td><td>62.0</td><td>65.8</td></tr><tr><td>SuperGPQA</td><td>34.6</td><td>46.8</td><td>51.2</td><td>31.2</td><td>42.7</td><td>47.6</td><td>47.8</td></tr><tr><td rowspan="3">Reasoning</td><td>AIME-25</td><td>39.0</td><td>74.5</td><td>80.3</td><td>36.8</td><td>65.6</td><td>67.3</td><td>81.3</td></tr><tr><td>HMMT-25</td><td>22.8</td><td>53.1</td><td>60.6</td><td>24.3</td><td>42.1</td><td>43.2</td><td>55.5</td></tr><tr><td>LiveBench 2024-11-25</td><td>50.1</td><td>68.4</td><td>69.8</td><td>51.1</td><td>63.6</td><td>67.1</td><td>71.8</td></tr><tr><td rowspan="4">Alignment Tasks</td><td>IFEval</td><td>75.1</td><td>82.6</td><td>83.2</td><td>72.5</td><td>81.9</td><td>85.0</td><td>87.4</td></tr><tr><td>Arena-Hard V2 (winrate)</td><td>12.0</td><td>36.8</td><td>51.1</td><td>4.7</td><td>13.7</td><td>29.1</td><td>34.9</td></tr><tr><td>Creative Writing v3</td><td>55.6</td><td>76.1</td><td>82.4</td><td>50.6</td><td>61.1</td><td>78.5</td><td>75.6</td></tr><tr><td>WritingBench</td><td>77.9</td><td>84.0</td><td>85.5</td><td>68.9</td><td>73.5</td><td>75.0</td><td>83.3</td></tr><tr><td rowspan="2">Coding &amp; Agent</td><td>LiveCodeBench v6</td><td>29.3</td><td>51.3</td><td>58.6</td><td>31.3</td><td>48.4</td><td>51.0</td><td>55.2</td></tr><tr><td>BFCL-v3</td><td>57.2</td><td>67.3</td><td>63.0</td><td>56.6</td><td>65.9</td><td>68.1</td><td>71.2</td></tr><tr><td rowspan="4">Multilingualism</td><td>MultiIF</td><td>58.9</td><td>73.6</td><td>75.1</td><td>51.2</td><td>66.3</td><td>71.2</td><td>77.3</td></tr><tr><td>MMLU-ProX</td><td>55.1</td><td>65.0</td><td>70.7</td><td>50.4</td><td>61.0</td><td>68.1</td><td>64.2</td></tr><tr><td>INCLUDE</td><td>53.3</td><td>64.6</td><td>69.5</td><td>51.8</td><td>61.8</td><td>67.8</td><td>64.4</td></tr><tr><td>PolyMATH</td><td>28.0</td><td>44.6</td><td>47.5</td><td>25.2</td><td>40.0</td><td>42.7</td><td>46.2</td></tr></table>

### 5.12 Ablation Study 消融实验

#### 5.12.1 Vision Encoder 视觉编码器

> **拆开：** 表 11 的 Qwen3-ViT 是从零训还是 SigLIP-2 续训？
> §2 与 §3.1：从官方 SigLIP-2 检查点初始化并 continue training with dynamic resolutions。表 11 比的是续训后的 Qwen3-ViT 相对原始 SigLIP-2。


We conduct comparative experiments against the original SigLIP-2. As shown in Table 11, in zero-shot evaluation at the CLIP pretraining stage, Qwen3-ViT maintains competitive performance on standard benchmarks while achieving substantial gains on OmniBench, our in-house holistic evaluation suite designed to assess world knowledge integration under diverse and challenging conditions. Furthermore, when integrated with the same 1.7B Qwen3 language model and trained for 1.5T tokens, Qwen3-ViT consistently outperforms the SigLIP-2-based baseline across multiple key tasks and remains significantly ahead on OmniBench, demonstrating its superiority and effectiveness as a stronger visual backbone.
相对原始 SigLIP-2：表 11 显示 Qwen3-ViT 在 OmniBench 大幅领先；接同一 1.7B Qwen3 并训 1.5T token 后多任务持续超过 SigLIP-2 基线。

Table 11: Ablation on Qwen3-ViT. We compare the performance metrics of Qwen3-ViT and SigLIP-2 during the CLIP pre-training stage, and further evaluate their downstream performance in the visionlanguage modeling (VLM) stage when paired with the same 1.7B Qwen3 language model.
表 11: Qwen3-ViT 消融。比较 CLIP 预训练期与接同一 1.7B Qwen3 的 VLM 下游期。

<table><tr><td rowspan="2">ViT</td><td colspan="7">Clip Bench</td><td colspan="5">VLM Bench</td></tr><tr><td>ImageNet-1K</td><td>ImageNet-V2</td><td>ImageNet-A</td><td>ImageNet-R</td><td>ImageNet-S</td><td>ObjectNet</td><td>Omni</td><td>OCRB</td><td>AI2D</td><td>RLWDQA</td><td>InfoVQA</td><td>Omni</td></tr><tr><td>SigLIP-2</td><td>84.2</td><td>78.6</td><td>87.0</td><td>96.1</td><td>76.2</td><td>79.9</td><td>36.9</td><td>77.2</td><td>74.1</td><td>58.7</td><td>65.3</td><td>50.1</td></tr><tr><td>Qwen3-ViT</td><td>84.6</td><td>78.8</td><td>87.1</td><td>95.7</td><td>74.5</td><td>81.0</td><td>45.5</td><td>78.7</td><td>76.2</td><td>66.1</td><td>67.0</td><td>53.0</td></tr></table>

#### 5.12.2 DeepStack

We conduct an ablation study to verify the effectiveness of the DeepStack mechanism. As demonstrated in Table 12, the model equipped with DeepStack achieved an overall performance gain across various benchmarks, strongly affirming its effectiveness. This gain is attributed to DeepStack’s ability to integrate rich visual information, which effectively boosts the capability in fine-grained visual understanding, such as on the InfoVQA and DocVQA benchmarks.
DeepStack 消融见表 12：配备后整体增益，抬细粒度理解（如 InfoVQA, DocVQA）。

Table 12: Ablation on DeepStack. We conduct the ablation study on the DeepStack using an internal 15B-A2B LLM, with all experiments pretrained on 200 billion tokens. We directly evaluate these pretrained models on the validation sets, without any post-training.
表 12: DeepStack 消融。内部 15B-A2B LLM，预训练 200B token，无后训练直接评验证集。

| Method | AVG | AI2D | OCRB | TVQA | InfoVQA | ChartQA | DocVQA | MMMU | MMStar | RLWDQA | $MMB_{EN}$ | $MMB_{CN}$ |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Baseline | 74.7 | 81.8 | 81.0 | 80.6 | 71.9 | 81.5 | 89.5 | 52.9 | 55.5 | 67.7 | 81.0 | 78.1 |
| DeepStack | 76.0 | 83.2 | 83.6 | 80.5 | 74.2 | 83.3 | 91.1 | 54.1 | 57.7 | 68.1 | 81.2 | 78.5 |

<!-- page 25 of 42 -->

![Chart block](images/p25-figure-3-needle-in-a-haystack-performance-heatmap-for.png)

Figure 3: Needle-in-a-Haystack performance heatmap for Qwen3-VL-235B-A22B-Instruct across varying video durations and needle positions. Each cell shows accuracy (%) for locating and answering questions about the inserted “needle” frame.
图 3：大海捞针热力图。每格为定位并回答 needle 帧相关问题的准确率（%）。

#### 5.12.3 Needle-in-a-Haystack 大海捞针

> **再看：** 1M token 上 99.5% 是预训练原生训到 1M 吗？
> 不是。§5.12.3 写 via YaRN-based positional extension；表 1 S3 序列长是 262,144. YaRN 是评测期位置外推。


To evaluate the model’s capability in processing long-context inputs, we construct a video “Needle-in-a-Haystack” evaluation on Qwen3-VL-235B-A22B-Instruct. In this task, a semantically salient “needle” frame—containing critical visual evidence—is inserted at varying temporal positions within a long video. The model is then tasked with accurately locating the target frame from the long video and answering the corresponding question. During evaluation, videos are uniformly sampled at 1 FPS, and frame resolution is dynamically adjusted to maintain a constant visual token budget.
长上下文视频大海捞针：在长视频不同时间位置插入 needle 帧，要求定位并答题。评测期 1 FPS 均匀采样，动态调帧分辨率以保持视觉 token 预算恒定。

As shown in Figure 3, the model achieves a perfect 100% accuracy on videos up to 30 minutes in duration—corresponding to a context length of 256K tokens. Remarkably, even when extrapolating to sequences of up to 1M tokens (approximately 2 hours of video) via YaRN-based positional extension, the model retains a high accuracy of 99.5%. These results strongly demonstrate the model’s powerful long-sequence modeling capabilities.
如图 3：最长 30 分钟（256K token）准确率 100%；经 YaRN 外推到约 1M token（约 2 小时）仍 99.5%。

## 6 Conclusion

In this work, we present Qwen3-VL, a state-of-the-art series of vision–language foundation models that advances the frontier of multimodal understanding and generation. By integrating high-quality multi-modal data iteration and architectural innovations—such as enhanced interleaved-MRoPE, DeepStack vision-language alignment, and text-based temporal grounding—Qwen3-VL achieves unprecedented performance across a broad spectrum of multimodal benchmarks while maintaining strong pure-text capabilities. Its native support for 256K-token interleaved sequences enables robust reasoning over long, complex documents, image sequences, and videos, making it uniquely suited for real-world applications demanding high-fidelity cross-modal comprehension. The availability of both dense and Mixture-of-Experts variants ensures flexible deployment across diverse latency and quality requirements, and our post-training strategy—including non-thinking and thinking modes.
本工作给出 Qwen3-VL。通过高质量多模态数据迭代与架构创新（interleaved-MRoPE，DeepStack，文本时间接地），在广泛多模态基准上取得空前表现并保持强纯文本能力。原生 256K 交错序列支撑长文档/视频推理。Dense 与 MoE 覆盖不同延迟/质量；后训练含 non-thinking 与 thinking。

Looking forward, we envision Qwen3-VL as a foundational engine for embodied AI agents capable of seamlessly bridging the digital and physical worlds. Such agents will not only perceive and reason over rich multimodal inputs but also execute decisive, context-aware actions in dynamic environments—interacting with users, manipulating digital interfaces, and guiding robotic systems through grounded, multimodal decision-making. Future work will focus on extending Qwen3-VL’s capabilities toward interactive perception, tool-augmented reasoning, and real-time multimodal control, with the ultimate goal of enabling AI systems that learn, adapt, and collaborate alongside humans in both virtual and physical domains. Additionally, we are actively exploring unified understanding-generation architectures, leveraging visual generation capabilities to elevate overall intelligence further. By openly releasing the entire model family under the Apache 2.0 license, we aim to catalyze community-driven innovation toward the vision of truly integrated, multimodal AI agents.
展望上，视 Qwen3-VL 为连接数字与物理世界的具身 AI agent 基础引擎。未来聚焦交互感知，工具增强推理与实时多模态控制，并探索统一理解-生成架构。全系列以 Apache 2.0 开源。

<!-- page 26 of 42 -->

## 7 Contributions and Acknowledgments 贡献与致谢

All contributors of Qwen3-VL are listed in alphabetical order by their last names.

**Core Contributors:** Shuai Bai, Yuxuan Cai, Ruizhe Chen, Keqin Chen, Xionghui Chen, Zesen Cheng, Lianghao Deng, Wei Ding, Chang Gao, Chunjiang Ge, Wenbin Ge, Zhifang Guo, Qidong Huang, Jie Huang, Fei Huang, Binyuan Hui, Shutong Jiang, Zhaohai Li, Mingsheng Li, Mei Li, Kaixin Li, Zicheng Lin, Junyang Lin, Xuejing Liu, Jiawei Liu, Chenglong Liu, Yang Liu, Dayiheng Liu, Shixuan Liu, Dunjie Lu, Ruilin Luo, Chenxu Lv, Rui Men, Lingchen Meng, Xuancheng Ren, Xingzhang Ren, Sibo Song, Yuchong Sun, Jun Tang, Jianhong Tu, Jianqiang Wan, Peng Wang, Pengfei Wang, Qiuyue Wang, Yuxuan Wang, Tianbao Xie, Yiheng Xu, Haiyang Xu, Jin Xu, Zhibo Yang, Mingkun Yang, Jianxin Yang, An Yang, Bowen Yu, Fei Zhang, Hang Zhang, Xi Zhang, Bo Zheng, Humen Zhong, Jingren Zhou, Fan Zhou, Jing Zhou, Yuanzhi Zhu, Ke Zhu

**Contributors:** Yizhong Cao, Bei Chen, Chen Cheng, Yunfei Chu, Zeyu Cui, Kai Dang, Xiaodong Deng, Yang Fan, Rongyao Fang, Tongkun Guan, Jinzheng He, Miao Hong, Songtao Jiang, Zheng Li, Xiaochuan Li, Junrong Lin, Yuqiong Liu, Yantao Liu, Na Ni, Xinyao Niu, Yatian Pang, Zihan Qiu, Tianhao Shen, Tianyi Tang, Yu Wan, Jinxi Wei, Chenfei Wu, Buxiao Wu, Xiao Xu, Mingfeng Xue, Ming Yan, Yuhuan Yang, Jiaxi Yang, Kexin Yang, Le Yu, Hao Yu, Jianke Zhang, Jianwei Zhang, Yichang Zhang, Zhenru Zhang, Siqi Zhang, Peiyang Zhang, Beichen Zhang, Hongbo Zhao, Xianwei Zhuang

**Acknowledgments:** We gratefully acknowledge the unwavering support provided by the teams led by Zulong Chen, Bing Deng, Feiyu Gao, Guanjun Jiang, Yue Liu, Hangdi Xing and Daijun Yu.
致谢：感谢上述团队的支持。人名保持英文拼写，不译。

## References

Pravesh Agrawal, Szymon Antoniak, Emma Bou Hanna, Baptiste Bout, Devendra Chaplot, Jessica Chudnovsky, Diogo Costa, Baudouin De Monicault, Saurabh Garg, Theophile Gervet, et al. Pixtral 12b. arXiv preprint arXiv:2410.07073, 2024.

AIME. Aime problems and solutions, 2025. URL [https://artofproblemsolving.com/wiki/index.php/AIMEProblemsandSolutions](https://artofproblemsolving.com/wiki/index.php/AIMEProblemsandSo%20lutions).

Anthropic. Claude opus 4.1, 2025. URL [https://www.anthropic.com/news/claude-opus-4-1](https://www.anthropic.com/news/claude-opus-4-1).

Shuai Bai, Keqin Chen, Xuejing Liu, Jialin Wang, Wenbin Ge, Sibo Song, Kai Dang, Peng Wang, Shijie Wang, Jun Tang, Humen Zhong, Yuanzhi Zhu, Mingkun Yang, Zhaohai Li, Jianqiang Wan, Pengfei Wang, Wei Ding, Zheren Fu, Yiheng Xu, Jiabo Ye, Xi Zhang, Tianbao Xie, Zesen Cheng, Hang Zhang, Zhibo Yang, Haiyang Xu, and Junyang Lin. Qwen2.5-vl technical report, 2025.

Gilad Baruch, Zhuoyuan Chen, Afshin Dehghan, Tal Dimry, Yuri Feigin, Peter Fu, Thomas Gebauer, Brandon Joffe, Daniel Kurz, Arik Schwartz, et al. Arkitscenes: A diverse real-world dataset for 3d indoor scene understanding using mobile rgb-d data. arXiv preprint arXiv:2111.08897, 2021.

Garrick Brazil, Abhinav Kumar, Julian Straub, Nikhila Ravi, Justin Johnson, and Georgia Gkioxari. Omni3d: A large benchmark and model for 3d object detection in the wild. In Proceedings of the IEEE/CVF conference on computer vision and pattern recognition, pp. 13154–13164, 2023.

Lin Chen, Jinsong Li, Xiaoyi Dong, Pan Zhang, Yuhang Zang, Zehui Chen, Haodong Duan, Jiaqi Wang, Yu Qiao, Dahua Lin, et al. Are we on the right way for evaluating large vision-language models? arXiv:2403.20330, 2024a.

Shimin Chen, Xiaohan Lan, Yitian Yuan, Zequn Jie, and Lin Ma. Timemarker: A versatile video-llm for long and short video understanding with superior temporal localization ability. arXiv preprint arXiv:2411.18211, 2024b.

Yitong Chen, Lingchen Meng, Wujian Peng, Zuxuan Wu, and Yu-Gang Jiang. Comp: Continual multi-modal pre-training for vision foundation models. arXiv preprint arXiv:2503.18931, 2025.

Kanzhi Cheng, Qiushi Sun, Yougang Chu, Fangzhi Xu, Yantao Li, Jianbing Zhang, and Zhiyong Wu. Seeclick: Harnessing gui grounding for advanced visual gui agents. arXiv preprint arXiv:2401.10935, 2024.

Xianfu Cheng, Wei Zhang, Shiwei Zhang, Jian Yang, Xiangyuan Guan, Xianjie Wu, Xiang Li, Ge Zhang, Jiaheng Liu, Yuying Mai, et al. Simplevqa: Multimodal factuality evaluation for multimodal large language models. In Proceedings of the IEEE/CVF International Conference on Computer Vision, pp. 4637–4646, 2025.

<!-- page 27 of 42 -->

Gheorghe Comanici, Eric Bieber, Mike Schaekermann, Ice Pasupat, Noveen Sachdeva, Inderjit Dhillon, Marcel Blistein, Ori Ram, Dan Zhang, Evan Rosen, et al. Gemini 2.5: Pushing the frontier with advanced reasoning, multimodality, long context, and next generation agentic capabilities. arXiv preprint arXiv:2507.06261, 2025.

Matt Deitke, Christopher Clark, Sangho Lee, Rohun Tripathi, Yue Yang, Jae Sung Park, Mohammadreza Salehi, Niklas Muennighoff, Kyle Lo, Luca Soldaini, et al. Molmo and pixmo: Open weights and open data for state-of-the-art multimodal models. arXiv preprint arXiv:2409.17146, 2024.

Shizhe Diao, Yu Yang, Yonggan Fu, Xin Dong, Dan Su, Markus Kliegl, Zijia Chen, Peter Belcak, Yoshi Suhara, Hongxu Yin, et al. Climb: Clustering-based iterative data mixture bootstrapping for language model pre-training. arXiv preprint arXiv:2504.13161, 2025.

Matthijs Douze, Alexandr Guzhva, Chengqi Deng, Jeff Johnson, Gergely Szilvasy, Pierre-Emmanuel Mazaré, Maria Lomeli, Lucas Hosseini, and Hervé Jégou. The faiss library. 2024.

Mengfei Du, Binhao Wu, Zejun Li, Xuanjing Huang, and Zhongyu Wei. Embspatial-bench: Benchmarking spatial understanding for embodied tasks with large vision-language models. arXiv preprint arXiv:2406.05756, 2024.

Chengqi Duan, Kaiyue Sun, Rongyao Fang, Manyuan Zhang, Yan Feng, Ying Luo, Yufang Liu, Ke Wang, Peng Pei, Xunliang Cai, et al. Codeplot-cot: Mathematical visual reasoning by thinking with codedriven images. arXiv preprint arXiv:2510.11718, 2025.

Chaoyou Fu, Yuhan Dai, Yondong Luo, Lei Li, Shuhuai Ren, Renrui Zhang, Zihan Wang, Chenyu Zhou, Yunhang Shen, Mengdan Zhang, et al. Video-mme: The first-ever comprehensive evaluation benchmark of multi-modal llms in video analysis. arXiv:2405.21075, 2024a.

Ling Fu, Biao Yang, Zhebin Kuang, Jiajun Song, Yuzhe Li, Linghao Zhu, Qidi Luo, Xinyu Wang, Hao Lu, Mingxin Huang, Zhang Li, Guozhi Tang, Bin Shan, Chunhui Lin, Qi Liu, Binghong Wu, Hao Feng, Hao Liu, Can Huang, Jingqun Tang, Wei Chen, Lianwen Jin, Yuliang Liu, and Xiang Bai. Ocrbench v2: An improved benchmark for evaluating large multimodal models on visual text localization and reasoning, 2024b. URL [https://arxiv.org/abs/2501.00321](https://arxiv.org/abs/2501.00321).

Xingyu Fu, Yushi Hu, Bangzheng Li, Yu Feng, Haoyu Wang, Xudong Lin, Dan Roth, Noah A Smith, Wei-Chiu Ma, and Ranjay Krishna. Blink: Multimodal large language models can see but not perceive. In European Conference on Computer Vision, pp. 148–166. Springer, 2024c.

Chang Gao, Chujie Zheng, Xiong-Hui Chen, Kai Dang, Shixuan Liu, Bowen Yu, An Yang, Shuai Bai, Jingren Zhou, and Junyang Lin. Soft adaptive policy optimization. arXiv preprint arXiv:2511.20347, 2025.

Jiyang Gao, Chen Sun, Zhenheng Yang, and Ram Nevatia. Tall: Temporal activity localization via language query. In Proceedings of the IEEE international conference on computer vision, pp. 5267–5275, 2017.

Aryo Pradipta Gema, Joshua Ong Jun Leang, Giwon Hong, Alessio Devoto, Alberto Carlo Maria Mancino, Rohit Saxena, Xuanli He, Yu Zhao, Xiaotang Du, Mohammad Reza Ghasemi Madani, Claire Barale, Robert McHardy, Joshua Harris, Jean Kaddour, Emile van Krieken, and Pasquale Minervini. Are we done with mmlu? CoRR, abs/2406.04127, 2024. doi: 10.48550/ARXIV.2406.04127. URL [https://doi.org/10.48550/arXiv.2406.04127](https://doi.org/10.48550/arXiv.2406.04127).

Tianrui Guan, Fuxiao Liu, Xiyang Wu, Ruiqi Xian, Zongxia Li, Xiaoyu Liu, Xijun Wang, Lichang Chen, Furong Huang, Yaser Yacoob, Dinesh Manocha, and Tianyi Zhou. Hallusionbench: An advanced diagnostic suite for entangled language hallucination & visual illusion in large vision-language models, 2023.

Yun He, Di Jin, Chaoqi Wang, Chloe Bi, Karishma Mandyam, Hejia Zhang, Chen Zhu, Ning Li, Tengyu Xu, Hongjiang Lv, Shruti Bhosale, Chenguang Zhu, Karthik Abinav Sankararaman, Eryk Helenowski, Melanie Kambadur, Aditya Tayade, Hao Ma, Han Fang, and Sinong Wang. Multi-if: Benchmarking llms on multi-turn and multilingual instructions following. CoRR, abs/2410.15553, 2024. doi: 10.48550/ ARXIV.2410.15553. URL [https://doi.org/10.48550/arXiv.2410.15553](https://doi.org/10.48550/arXiv.2410.15553).

HMMT. Hmmt 2025. [https://www.hmmt.org](https://www.hmmt.org), 2025.

Kairui Hu, Penghao Wu, Fanyi Pu, Wang Xiao, Yuanhan Zhang, Xiang Yue, Bo Li, and Ziwei Liu. Videommmu: Evaluating knowledge acquisition from multi-discipline professional videos. arXiv preprint arXiv:2501.13826, 2025.

<!-- page 28 of 42 -->

Jie Huang, Xuejing Liu, Sibo Song, Ruibing Hou, Hong Chang, Junyang Lin, and Shuai Bai. Revisiting multimodal positional encoding in vision-language models, 2025.

Naman Jain, King Han, Alex Gu, Wen-Ding Li, Fanjia Yan, Tianjun Zhang, Sida Wang, Armando Solar-Lezama, Koushik Sen, and Ion Stoica. Livecodebench: Holistic and contamination free evaluation of large language models for code. CoRR, abs/2403.07974, 2024. doi: 10.48550/ARXIV.2403.07974. URL [https://doi.org/10.48550/arXiv.2403.07974](https://doi.org/10.48550/arXiv.2403.07974).

Bowen Jin, Hansi Zeng, Zhenrui Yue, Jinsung Yoon, Sercan Arik, Dong Wang, Hamed Zamani, and Jiawei Han. Search-r1: Training llms to reason and leverage search engines with reinforcement learning. arXiv preprint arXiv:2503.09516, 2025.

Jeff Johnson, Matthijs Douze, and Hervé Jégou. Billion-scale similarity search with GPUs. IEEE Transactions on Big Data, 7(3):535–547, 2019.

Sahar Kazemzadeh, Vicente Ordonez, Mark Matten, and Tamara Berg. Referitgame: Referring to objects in photographs of natural scenes. In EMNLP, 2014.

Aniruddha Kembhavi, Michael Salvato, Eric Kolve, Minjoon Seo, Hannaneh Hajishirzi, and Ali Farhadi. A diagram is worth a dozen images. ArXiv, abs/1603.07396, 2016.

Alina Kuznetsova, Hassan Rom, Neil Alldrin, Jasper Uijlings, Ivan Krasin, Jordi Pont-Tuset, Shahab Kamali, Stefan Popov, Matteo Malloci, Alexander Kolesnikov, et al. The open images dataset v4: Unified image classification, object detection, and visual relationship detection at scale. International journal of computer vision, pp. 1956–1981, 2020.

Xin Lai, Junyi Li, Wei Li, Tao Liu, Tianjian Li, and Hengshuang Zhao. Mini-o3: Scaling up reasoning patterns and interaction turns for visual search. arXiv preprint arXiv:2509.07969, 2025.

Hugo Laurençon, Lucile Saulnier, Léo Tronchon, Stas Bekman, Amanpreet Singh, Anton Lozhkov, Thomas Wang, Siddharth Karamcheti, Alexander Rush, Douwe Kiela, et al. Obelics: An open web-scale filtered dataset of interleaved image-text documents. Advances in Neural Information Processing Systems, 36: 71683–71702, 2023.

Jinke Li, Jiarui Yu, Chenxing Wei, Hande Dong, Qiang Lin, Liangjing Yang, Zhicai Wang, and Yanbin Hao. Unisvg: A unified dataset for vector graphic understanding and generation with multimodal large language models. In Proceedings of the 33rd ACM International Conference on Multimedia, pp. 13156–13163, 2025a.

Kaixin Li, Yuchen Tian, Qisheng Hu, Ziyang Luo, Zhiyong Huang, and Jing Ma. Mmcode: Benchmarking multimodal large language models for code generation with visually rich programming problems. In Findings of the Association for Computational Linguistics: EMNLP 2024, pp. 736–783, 2024a.

Kaixin Li, Ziyang Meng, Hongzhan Lin, Ziyang Luo, Yuchen Tian, Jing Ma, Zhiyong Huang, and Tat-Seng Chua. Screenspot-pro: Gui grounding for professional high-resolution computer use, 2025b. URL [https://likaixin2000.github.io/papers/ScreenSpot\_Pro.pdf](https://likaixin2000.github.io/papers/ScreenSpot_Pro.pdf). Preprint.

Kaixin Li et al. Iconstack, 2025c. URL [https://huggingface.co/datasets/likaixin/IconStack-48M-Rendered-Train](https://huggingface.co/datasets/likaixin/IconStack-48M-Rendered-Train).

Kunchang Li, Yali Wang, Yinan He, Yizhuo Li, Yi Wang, Yi Liu, Zun Wang, Jilan Xu, Guo Chen, Ping Luo, et al. Mvbench: A comprehensive multi-modal video understanding benchmark. In CVPR, 2024b.

Liunian Harold Li, Pengchuan Zhang, Haotian Zhang, Jianwei Yang, Chunyuan Li, Yiwu Zhong, Lijuan Wang, Lu Yuan, Lei Zhang, Jenq-Neng Hwang, et al. Grounded language-image pre-training. In Proceedings of the IEEE/CVF Conference on Computer Vision and Pattern Recognition, pp. 10965–10975, 2022.

Qingyun Li, Zhe Chen, Weiyun Wang, Wenhai Wang, Shenglong Ye, Zhenjiang Jin, Guanzhou Chen, Yinan He, Zhangwei Gao, Erfei Cui, et al. Omnicorpus: An unified multimodal corpus of 10 billion-level images interleaved with text. arXiv preprint arXiv:2406.08418, 2024c.

Tianle Li, Wei-Lin Chiang, Evan Frick, Lisa Dunlap, Tianhao Wu, Banghua Zhu, Joseph E. Gonzalez, and Ion Stoica. From crowdsourced data to high-quality benchmarks: Arena-hard and benchbuilder pipeline. CoRR, abs/2406.11939, 2024d. doi: 10.48550/ARXIV.2406.11939. URL [https://doi.org/10.48550/arXiv.2406.11939](https://doi.org/10.48550/arXiv.2406.11939).

Tsung-Yi Lin, Michael Maire, Serge Belongie, James Hays, Pietro Perona, Deva Ramanan, Piotr Dollár, and C Lawrence Zitnick. Microsoft coco: Common objects in context. In ECCV, 2014.

<!-- page 29 of 42 -->

Shilong Liu, Zhaoyang Zeng, Tianhe Ren, Feng Li, Hao Zhang, Jie Yang, Chun yue Li, Jianwei Yang, Hang Su, Jun-Juan Zhu, and Lei Zhang. Grounding dino: Marrying dino with grounded pre-training for open-set object detection. arXiv:2303.05499, 2023a.

Yuan Liu, Haodong Duan, Bo Li Yuanhan Zhang, Songyang Zhang, Wangbo Zhao, Yike Yuan, Jiaqi Wang, Conghui He, Ziwei Liu, Kai Chen, and Dahua Lin. Mmbench: Is your multi-modal model an all-around player? arXiv:2307.06281, 2023b.

Yuliang Liu, Zhang Li, Mingxin Huang, Biao Yang, Wenwen Yu, Chunyuan Li, Xu-Cheng Yin, Cheng-Lin Liu, Lianwen Jin, and Xiang Bai. Ocrbench: on the hidden mystery of ocr in large multimodal models. Science China Information Sciences, 67(12), December 2024. ISSN 1869-1919. doi: 10.1007/ s11432-024-4235-6. URL [http://dx.doi.org/10.1007/s11432-024-4235-6](http://dx.doi.org/10.1007/s11432-024-4235-6).

Dunjie Lu, Yiheng Xu, Junli Wang, Haoyuan Wu, Xinyuan Wang, Zekun Wang, Junlin Yang, Hongjin Su, Jixuan Chen, Junda Chen, Yuchen Mao, Jingren Zhou, Junyang Lin, Binyuan Hui, and Tao Yu. Videoagenttrek: Computer use pretraining from unlabeled videos, 2025. URL [https://arxiv.org/abs/2510.19488](https://arxiv.org/abs/2510.19488).

Pan Lu, Hritik Bansal, Tony Xia, Jiacheng Liu, Chunyuan Li, Hannaneh Hajishirzi, Hao Cheng, Kai-Wei Chang, Michel Galley, and Jianfeng Gao. Mathvista: Evaluating mathematical reasoning of foundation models in visual contexts. arXiv preprint arXiv:2310.02255, 2023.

Yubo Ma, Yuhang Zang, Liangyu Chen, Meiqi Chen, Yizhu Jiao, Xinze Li, Xinyuan Lu, Ziyu Liu, Yan Ma, Xiaoyi Dong, et al. Mmlongbench-doc: Benchmarking long-context document understanding with visualizations. Advances in Neural Information Processing Systems, 37:95963–96010, 2024.

Junhua Mao, Jonathan Huang, Alexander Toshev, Oana Camburu, Alan L Yuille, and Kevin Murphy. Generation and comprehension of unambiguous object descriptions. In CVPR, 2016.

Ahmed Masry, Do Xuan Long, Jia Qing Tan, Shafiq Joty, and Enamul Hoque. Chartqa: A benchmark for question answering about charts with visual and logical reasoning. arXiv:2203.10244, 2022.

Minesh Mathew, Viraj Bagal, Rubèn Pérez Tito, Dimosthenis Karatzas, Ernest Valveny, and C.V. Jawahar. Infographicvqa. 2022 IEEE/CVF Winter Conference on Applications of Computer Vision (WACV), pp. 2582–2591, 2021a.

Minesh Mathew, Dimosthenis Karatzas, and CV Jawahar. Docvqa: A dataset for vqa on document images. In WACV, 2021b.

Lingchen Meng, Jianwei Yang, Rui Tian, Xiyang Dai, Zuxuan Wu, Jianfeng Gao, and Yu-Gang Jiang. Deepstack: Deeply stacking visual tokens is surprisingly simple and effective for lmms. In Advances in Neural Information Processing Systems, volume 37, pp. 23464–23487, 2024.

OpenAI. Gpt-5 system card, 2025. URL [https://cdn.openai.com/gpt-5-system-card.pdf](https://cdn.openai.com/gpt-5-system-card.pdf).

Linke Ouyang, Yuan Qu, Hongbin Zhou, Jiawei Zhu, Rui Zhang, Qunshu Lin, Bin Wang, Zhiyuan Zhao, Man Jiang, Xiaomeng Zhao, Jin Shi, Fan Wu, Pei Chu, Minghao Liu, Zhenxiang Li, Chao Xu, Bo Zhang, Botian Shi, Zhongying Tu, and Conghui He. Omnidocbench: Benchmarking diverse pdf document parsing with comprehensive annotations, 2024. URL [https://arxiv.org/abs/2412.07626](https://arxiv.org/abs/2412.07626).

Samuel J. Paech. Eq-bench: An emotional intelligence benchmark for large language models. CoRR, abs/2312.06281, 2023. doi: 10.48550/ARXIV.2312.06281. URL [https://doi.org/10.48550/arXiv.2312.06281](https://doi.org/10.48550/arXiv.2312.06281).

Roni Paiss, Ariel Ephrat, Omer Tov, Shiran Zada, Inbar Mosseri, Michal Irani, and Tali Dekel. Teaching clip to count to ten. In Proceedings of the IEEE/CVF International Conference on Computer Vision, pp. 3170–3180, 2023.

Shishir G. Patil, Huanzhi Mao, Charlie Cheng-Jie Ji, Fanjia Yan, Vishnu Suresh, Ion Stoica, and Joseph E. Gonzalez. The berkeley function calling leaderboard (bfcl): From tool use to agentic evaluation of large language models. In Advances in Neural Information Processing Systems, 2024.

Yusu Qian, Hanrong Ye, Jean-Philippe Fauconnier, Peter Grasch, Yinfei Yang, and Zhe Gan. Mia-bench: Towards better instruction following evaluation of multimodal llms. arXiv preprint arXiv:2407.01509, 2024.

Runqi Qiao, Qiuna Tan, Guanting Dong, Minhui Wu, Chong Sun, Xiaoshuai Song, Zhuoma GongQue, Shanglin Lei, Zhe Wei, Miaoxuan Zhang, et al. We-math: Does your large multimodal model achieve human-like mathematical reasoning? arXiv preprint arXiv:2407.01284, 2024.

<!-- page 30 of 42 -->

Pooyan Rahmanzadehgervi, Logan Bolton, Mohammad Reza Taesiri, and Anh Totti Nguyen. Vision language models are blind: Failing to translate detailed visual features into words, 2025. URL [https://arxiv.org/abs/2407.06581](https://arxiv.org/abs/2407.06581).

Christopher Rawles, Sarah Clinckemaillie, Yifan Chang, Jonathan Waltz, Gabrielle Lau, Marybeth Fair, Alice Li, William Bishop, Wei Li, Folawiyo Campbell-Ajala, et al. Androidworld: A dynamic benchmarking environment for autonomous agents. arXiv:2405.14573, 2024.

David Rein, Betty Li Hou, Asa Cooper Stickland, Jackson Petty, Richard Yuanzhe Pang, Julien Dirani, Julian Michael, and Samuel R. Bowman. GPQA: A graduate-level google-proof q&a benchmark. CoRR, abs/2311.12022, 2023. doi: 10.48550/ARXIV.2311.12022. URL [https://doi.org/10.48550/arXiv.2311.12022](https://doi.org/10.48550/arXiv.2311.12022).

Jonathan Roberts, Mohammad Reza Taesiri, Ansh Sharma, Akash Gupta, Samuel Roberts, Ioana Croitoru, Simion-Vlad Bogolin, Jialu Tang, Florian Langer, et al. Zerobench: An impossible visual benchmark for contemporary large multimodal models, 2025. URL [https://arxiv.org/abs/2502.09696](https://arxiv.org/abs/2502.09696).

Mike Roberts, Jason Ramapuram, Anurag Ranjan, Atulit Kumar, Miguel Angel Bautista, Nathan Paczan, Russ Webb, and Joshua M Susskind. Hypersim: A photorealistic synthetic dataset for holistic indoor scene understanding. In Proceedings of the IEEE/CVF international conference on computer vision, pp. 10912–10922, 2021.

Angelika Romanou, Negar Foroutan, Anna Sotnikova, Zeming Chen, Sree Harsha Nelaturu, Shivalika Singh, Rishabh Maheshwary, Micol Altomare, Mohamed A. Haggag, Imanol Schlag, et al. INCLUDE: evaluating multilingual language understanding with regional knowledge. In The Thirteenth International Conference on Learning Representations, ICLR 2025, Singapore, April 24-28, 2025. OpenReview.net, 2025.

Shuai Shao, Zeming Li, Tianyuan Zhang, Chao Peng, Gang Yu, Xiangyu Zhang, Jing Li, and Jian Sun. Objects365: A large-scale, high-quality dataset for object detection. In Proceedings of the IEEE/CVF international conference on computer vision, pp. 8430–8439, 2019.

Chenglei Si, Yanzhe Zhang, Ryan Li, Zhengyuan Yang, Ruibo Liu, and Diyi Yang. Design2code: Benchmarking multimodal code generation for automated front-end engineering. In Proceedings of the 2025 Conference of the Nations of the Americas Chapter of the Association for Computational Linguistics: Human Language Technologies (Volume 1: Long Papers), pp. 3956–3974, 2025.

Chan Hee Song, Valts Blukis, Jonathan Tremblay, Stephen Tyree, Yu Su, and Stan Birchfield. Robospatial: Teaching spatial understanding to 2d and 3d vision-language models for robotics. In Proceedings of the Computer Vision and Pattern Recognition Conference, pp. 15768–15780, 2025a.

Shuran Song, Samuel P Lichtenberg, and Jianxiong Xiao. Sun rgb-d: A rgb-d scene understanding benchmark suite. In Proceedings of the IEEE conference on computer vision and pattern recognition, pp. 567–576, 2015.

Yueqi Song, Tianyue Ou, Yibo Kong, Zecheng Li, Graham Neubig, and Xiang Yue. Visualpuzzles: Decoupling multimodal reasoning evaluation from domain knowledge. arXiv preprint arXiv:2504.10342, 2025b. URL [https://arxiv.org/abs/2504.10342](https://arxiv.org/abs/2504.10342).

Gemini Robotics Team, Saminda Abeyruwan, Joshua Ainslie, Jean-Baptiste Alayrac, Montserrat Gonzalez Arenas, Travis Armstrong, Ashwin Balakrishna, Robert Baruch, Maria Bauza, Michiel Blokzijl, et al. Gemini robotics: Bringing ai into the physical world. arXiv preprint arXiv:2503.20020, 2025.

M-A-P Team. Supergpqa: Scaling LLM evaluation across 285 graduate disciplines. CoRR, abs/2502.14739, 2025. doi: 10.48550/ARXIV.2502.14739. URL [https://doi.org/10.48550/arXiv.2502.14739](https://doi.org/10.48550/arXiv.2502.14739).

Michael Tschannen, Alexey Gritsenko, Xiao Wang, Muhammad Ferjad Naeem, Ibrahim Alabdulmohsin, Nikhil Parthasarathy, Talfan Evans, Lucas Beyer, Ye Xia, Basil Mustafa, et al. Siglip 2: Multilingual vision-language encoders with improved semantic understanding, localization, and dense features. arXiv preprint arXiv:2502.14786, 2025.

Fei Wang, Xingyu Fu, James Y Huang, Zekun Li, Qin Liu, Xiaogeng Liu, Mingyu Derek Ma, Nan Xu, Wenxuan Zhou, Kai Zhang, et al. Muirbench: A comprehensive benchmark for robust multi-image understanding. arXiv preprint arXiv:2406.09411, 2024a.

Ke Wang, Junting Pan, Weikang Shi, Zimu Lu, Houxing Ren, Aojun Zhou, Mingjie Zhan, and Hongsheng Li. Measuring multimodal mathematical reasoning with math-vision dataset. Advances in Neural Information Processing Systems, 37:95095–95169, 2024b.

<!-- page 31 of 42 -->

Peng Wang, Shuai Bai, Sinan Tan, Shijie Wang, Zhihao Fan, Jinze Bai, Keqin Chen, Xuejing Liu, Jialin Wang, Wenbin Ge, Yang Fan, Kai Dang, Mengfei Du, Xuancheng Ren, Rui Men, Dayiheng Liu, Chang Zhou, Jingren Zhou, and Junyang Lin. Qwen2-vl: Enhancing vision-language model’s perception of the world at any resolution. arXiv:2409.12191, 2024c.

Weihan Wang, Zehai He, Wenyi Hong, Yean Cheng, Xiaohan Zhang, Ji Qi, Xiaotao Gu, Shiyu Huang, Bin Xu, Yuxiao Dong, et al. Lvbench: An extreme long video understanding benchmark. arXiv preprint arXiv:2406.08035, 2024d.

Wenbin Wang, Liang Ding, Minyan Zeng, Xiabin Zhou, Li Shen, Yong Luo, and Dacheng Tao. Divide, conquer and combine: A training-free framework for high-resolution image perception in multimodal large language models. arXiv preprint, 2024e. URL [https://arxiv.org/abs/2408.15556](https://arxiv.org/abs/2408.15556).

Xinyuan Wang, Bowen Wang, Dunjie Lu, Junlin Yang, Tianbao Xie, Junli Wang, Jiaqi Deng, Xiaole Guo, Yiheng Xu, Chen Henry Wu, et al. Opencua: Open foundations for computer-use agents. arXiv preprint arXiv:2508.09123, 2025a.

Yiming Wang, Pei Zhang, Jialong Tang, Haoran Wei, Baosong Yang, Rui Wang, Chenshu Sun, Feitong Sun, Jiran Zhang, Junxuan Wu, Qiqian Cang, Yichang Zhang, Fei Huang, Junyang Lin, et al. Polymath: Evaluating mathematical reasoning in multilingual contexts. CoRR, abs/2504.18428, 2025b. doi: 10.48550/ARXIV.2504.18428. URL [https://doi.org/10.48550/arXiv.2504.18428](https://doi.org/10.48550/arXiv.2504.18428).

Yubo Wang, Xueguang Ma, Ge Zhang, Yuansheng Ni, Abhranil Chandra, Shiguang Guo, Weiming Ren, Aaran Arulraj, Xuan He, Ziyan Jiang, Tianle Li, et al. MMLU-Pro: A more robust and challenging multi-task language understanding benchmark. CoRR, abs/2406.01574, 2024f.

Zhexu Wang, Yiping Liu, Yejie Wang, Wenyang He, Bofei Gao, Muxi Diao, Yanxu Chen, Kelin Fu, Flood Sung, Zhilin Yang, Tianyu Liu, and Weiran Xu. Ojbench: A competition level code benchmark for large language models. CoRR, abs/2506.16395, 2025c. doi: 10.48550/ARXIV.2506.16395. URL [https://doi.org/10.48550/arXiv.2506.16395](https://doi.org/10.48550/arXiv.2506.16395).

Zirui Wang, Mengzhou Xia, Luxi He, Howard Chen, Yitao Liu, Richard Zhu, Kaiqu Liang, Xindi Wu, Haotian Liu, Sadhika Malladi, Alexis Chevalier, Sanjeev Arora, and Danqi Chen. Charxiv: Charting gaps in realistic chart understanding in multimodal llms. arXiv preprint arXiv:2406.18521, 2024g.

Alexander Wettig, Kyle Lo, Sewon Min, Hannaneh Hajishirzi, Danqi Chen, and Luca Soldaini. Organize the web: Constructing domains enhances pre-training data curation. arXiv preprint arXiv:2502.10341, 2025.

Colin White, Samuel Dooley, Manley Roberts, Arka Pal, Benjamin Feuer, Siddhartha Jain, Ravid Shwartz-Ziv, Neel Jain, et al. Livebench: A challenging, contamination-free LLM benchmark. CoRR, abs/2406.19314, 2024. doi: 10.48550/ARXIV.2406.19314. URL [https://doi.org/10.48550/arXiv.2406.19314](https://doi.org/10.48550/arXiv.2406.19314).

Jinming Wu, Zihao Deng, Wei Li, Yiding Liu, Bo You, Bo Li, Zejun Ma, and Ziwei Liu. Mmsearch-r1: Incentivizing lmms to search. arXiv preprint arXiv:2506.20670, 2025a.

Penghao Wu and Saining Xie. V\*: Guided visual search as a core mechanism in multimodal llms. In Proceedings of the IEEE/CVF Conference on Computer Vision and Pattern Recognition (CVPR), pp. 13084–13094, June 2024.

Yuning Wu, Jiahao Mei, Ming Yan, Chenliang Li, Shaopeng Lai, Yuran Ren, Zijia Wang, Ji Zhang, Mengyue Wu, Qin Jin, and Fei Huang. Writingbench: A comprehensive benchmark for generative writing. CoRR, abs/2503.05244, 2025b. doi: 10.48550/ARXIV.2503.05244. URL [https://doi.org/10.48550/arXiv.2503.05244](https://doi.org/10.48550/arXiv.2503.05244).

xAI. Realworldqa: A benchmark for real-world spatial understanding. [https://huggingface.co/datasets/xai-org/RealworldQA](https://huggingface.co/datasets/xai-org/RealworldQA), 2024. Accessed: 2025-04-26.

Yijia Xiao, Edward Sun, Tianyu Liu, and Wei Wang. Logicvista: Multimodal llm logical reasoning benchmark in visual contexts. arXiv preprint arXiv:2407.04973, 2024.

Tianbao Xie, Jiaqi Deng, Xiaochuan Li, Junlin Yang, Haoyuan Wu, Jixuan Chen, Wenjing Hu, Xinyuan Wang, Yuhui Xu, Zekun Wang, Yiheng Xu, Junli Wang, Doyen Sahoo, Tao Yu, and Caiming Xiong. Scaling computer-use grounding via user interface decomposition and synthesis, 2025a. URL [https://arxiv.org/abs/2505.13227](https://arxiv.org/abs/2505.13227).

<!-- page 32 of 42 -->

Tianbao Xie, Mengqi Yuan, Danyang Zhang, Xinzhuang Xiong, Zhennan Shen, Zilong Zhou, Xinyuan Wang, Yanxu Chen, Jiaqi Deng, Junda Chen, Bowen Wang, Haoyuan Wu, Jixuan Chen, Junli Wang, Dunjie Lu, Hao Hu, and Tao Yu. Introducing osworld-verified. xlang.ai, July 2025b. URL [https://xlang.ai/blog/osworld-verified](https://xlang.ai/blog/osworld-verified).

Tianbao Xie, Danyang Zhang, Jixuan Chen, Xiaochuan Li, Siheng Zhao, Ruisheng Cao, et al. Osworld: Benchmarking multimodal agents for open-ended tasks in real computer environments. Advances in Neural Information Processing Systems, 37:52040–52094, 2025c.

Weiye Xu, Jiahao Wang, Weiyun Wang, Zhe Chen, Wengang Zhou, Aijun Yang, Lewei Lu, Houqiang Li, Xiaohua Wang, Xizhou Zhu, et al. Visulogic: A benchmark for evaluating visual reasoning in multi-modal large language models, 2025. URL [https://arxiv.org/abs/2504.15279](https://arxiv.org/abs/2504.15279).

An Yang, Anfeng Li, Baosong Yang, Beichen Zhang, Binyuan Hui, Bo Zheng, Bowen Yu, et al. Qwen3 technical report, 2025a.

Cheng Yang, Chufan Shi, Yaxin Liu, Bo Shui, Junjie Wang, Mohan Jing, Linran Xu, Xinyu Zhu, Siheng Li, Yuxiang Zhang, et al. Chartmimic: Evaluating lmm’s cross-modal reasoning capability via chart-to-code generation. arXiv preprint arXiv:2406.09961, 2024a.

Jihan Yang, Shusheng Yang, Anjali W Gupta, Rilyn Han, Li Fei-Fei, and Saining Xie. Thinking in space: How multimodal large language models see, remember, and recall spaces. In Proceedings of the Computer Vision and Pattern Recognition Conference, pp. 10632–10643, 2025b.

Zhibo Yang, Jun Tang, Zhaohai Li, Pengfei Wang, Jianqiang Wan, Humen Zhong, Xuejing Liu, Mingkun Yang, Peng Wang, Shuai Bai, LianWen Jin, and Junyang Lin. Cc-ocr: A comprehensive and challenging ocr benchmark for evaluating large multimodal models in literacy, 2024b. URL [https://arxiv.org/abs/2412.02210](https://arxiv.org/abs/2412.02210).

Jiabo Ye, Xi Zhang, Haiyang Xu, Haowei Liu, Junyang Wang, Zhaoqing Zhu, Ziwei Zheng, et al. Mobileagent-v3: Fundamental agents for gui automation. arXiv preprint arXiv:2508.15144, 2025.

Xiang Yue, Yuansheng Ni, Kai Zhang, Tianyu Zheng, Ruoqi Liu, Ge Zhang, et al. Mmmu: A massive multi-discipline multimodal understanding and reasoning benchmark for expert agi. In Proceedings of the IEEE/CVF Conference on Computer Vision and Pattern Recognition, pp. 9556–9567, 2024a.

Xiang Yue, Tianyu Zheng, Yuansheng Ni, Yubo Wang, Kai Zhang, Shengbang Tong, Yuxuan Sun, Botao Yu, Ge Zhang, Huan Sun, et al. Mmmu-pro: A more robust multi-discipline multimodal understanding benchmark. arXiv preprint arXiv:2409.02813, 2024b.

Renrui Zhang, Dongzhi Jiang, Yichi Zhang, Haokun Lin, Ziyu Guo, Pengshuo Qiu, Aojun Zhou, Pan Lu, Kai-Wei Chang, Yu Qiao, et al. Mathverse: Does your multi-modal llm truly see the diagrams in visual math problems? In European Conference on Computer Vision, pp. 169–186. Springer, 2024.

Yilun Zhao, Lujing Xie, Haowei Zhang, Guo Gan, Yitao Long, Zhiyuan Hu, Tongyan Hu, Weiyuan Chen, Chuhan Li, Junyang Song, Zhijian Xu, Chengye Wang, et al. Mmvu: Measuring expert-level multi-discipline video understanding, 2025. URL [https://arxiv.org/abs/2501.12380](https://arxiv.org/abs/2501.12380).

Ziwei Zheng, Michael Yang, Jack Hong, Chenxiao Zhao, Guohai Xu, Le Yang, Chao Shen, and Xing Yu. Deepeyes: Incentivizing" thinking with images" via reinforcement learning. arXiv preprint arXiv:2505.14362, 2025.

Enshen Zhou, Jingkun An, Cheng Chi, Yi Han, Shanyu Rong, Chi Zhang, Pengwei Wang, Zhongyuan Wang, Tiejun Huang, Lu Sheng, et al. Roborefer: Towards spatial referring with reasoning in visionlanguage models for robotics. arXiv preprint arXiv:2506.04308, 2025.

Jeffrey Zhou, Tianjian Lu, Swaroop Mishra, Siddhartha Brahma, Sujoy Basu, Yi Luan, Denny Zhou, and Le Hou. Instruction-following evaluation for large language models. CoRR, abs/2311.07911, 2023. doi: 10.48550/ARXIV.2311.07911. URL [https://doi.org/10.48550/arXiv.2311.07911](https://doi.org/10.48550/arXiv.2311.07911).

Junjie Zhou, Yan Shu, Bo Zhao, Boya Wu, Shitao Xiao, Xi Yang, Yongping Xiong, Bo Zhang, Tiejun Huang, and Zheng Liu. Mlvu: A comprehensive benchmark for multi-task long video understanding. arXiv preprint arXiv:2406.04264, 2024.

Wanrong Zhu, Jack Hessel, Anas Awadalla, Samir Yitzhak Gadre, Jesse Dodge, Alex Fang, Youngjae Yu, Ludwig Schmidt, William Yang Wang, and Yejin Choi. Multimodal c4: An open, billion-scale corpus of images interleaved with text. Advances in Neural Information Processing Systems, 36:8958–8974, 2023.

Chengke Zou, Xingang Guo, Rui Yang, Junyu Zhang, Bin Hu, and Huan Zhang. Dynamath: A dynamic visual benchmark for evaluating mathematical reasoning robustness of vision language models. arXiv preprint arXiv:2411.00836, 2024.

<!-- page 33 of 42 -->

## A Benchmarks

We evaluate Qwen3-VL on a wide range of public benchmarks across distinct capabilities: multimodal reasoning, general visual question answering, subjective experience & instruction following, document understanding (including OCR), 2D/3D visual grounding and counting, spatial reasoning, video understanding, GUI agent, and Text-Centric tasks. Below, we provide a detailed list of all the benchmarks used.

我们在覆盖多类能力的公开基准上评测 Qwen3-VL：多模态推理，通用视觉问答，主观体验与指令跟随，文档理解（含 OCR），2D/3D 视觉 grounding 与计数，空间推理，视频理解，GUI Agent 与文本中心任务。以下列出全部所用基准。

• **Multimodal Reasoning:** We evaluate the models on 12 benchmarks spanning a diverse range of domains—from mathematics and STEM to visual reasoning and puzzle-solving tasks: MMMU (Yue et al., 2024a), MMMU-Pro (Yue et al., 2024b), MathVision (Wang et al., 2024b), MathVision-Wild<sub>photo</sub>, MathVista (Lu et al., 2023), We-Math (Qiao et al., 2024), MathVerse (Zhang et al., 2024), DynaMath (Zou et al., 2024), Math-VR (Duan et al., 2025), LogicVista (Xiao et al., 2024), VisualPuzzles (Song et al., 2025b), VLM are Blind (Rahmanzadehgervi et al., 2025), ZeroBench (Main/Subtasks) (Roberts et al., 2025), and VisuLogic (Xu et al., 2025).

• **General Visual Question Answering:** We evaluate the models on 4 General VQA benchmarks: MMBench-V1.1 (Liu et al., 2023b), RealWorldQA (xAI, 2024), MMStar (Chen et al., 2024a), and SimpleVQA Cheng et al. (2025).

• **Subjective Experience and Instruction Following:** We evaluate the model on 3 benchmarks, across subject experience and complex instruction following: HallusionBench (Guan et al., 2023), MM-MT-Bench (Agrawal et al., 2024), and MIA-Bench (Qian et al., 2024).

**Document Understanding:** We perform comprehensive evaluation on OCR and document understanding ability of Qwen3-VL series across a diverse range OCR related benchmarks: DocVQA (Mathew et al., 2021b), InfoVQA (Mathew et al., 2021a), AI2D (Kembhavi et al., 2016), ChartQA (Masry et al., 2022), OCRBench (Liu et al., 2024), OCRBench\_v2 (Fu et al., 2024b), CC-OCR (Yang et al., 2024b), OmniDocBench (Ouyang et al., 2024), CharXiv (Wang et al., 2024g), and MMLongBench-Doc (Ma et al., 2024).

• **2D/3D Grounding and Spatial Understanding:** We evaluate the models on 11 benchmarks include 2D grounding, 3D grounding and spatial understanding: RefCOCO/+/g (Kazemzadeh et al., 2014; Mao et al., 2016), ODinW-13 (Li et al., 2022), CountBench (Paiss et al., 2023), ARKitScenes (Baruch et al., 2021), Hypersim (Roberts et al., 2021), SUN RGB-D (Song et al., 2015), ERQA (Team et al., 2025), VSIBench (Yang et al., 2025b), EmbSpatial (Du et al., 2024),RefSpatial (Zhou et al., 2025), and RoboSpatialHome (Song et al., 2025a).

• **Video Understanding:** We use seven benchmarks to evaluate the model’s video understanding capabilities: VideoMME (Fu et al., 2024a), MVBench (Li et al., 2024b), VideoMMMU (Hu et al., 2025), MMVU (Zhao et al., 2025), LVBench (Wang et al., 2024d), MLVU (Zhou et al., 2024), Charades-STA (Gao et al., 2017).

• **Coding:** We evaluate the model’s multi-modal coding capabilities, particularly in front-end reconstruction and SVG generation, using the Design2Code (Si et al., 2025), ChartMimic (Yang et al., 2024a), and UniSVG (Li et al., 2025a) benchmarks.

• **GUI Agent:** We evaluate GUI agent capabilities using benchmarks that test both perception and decision-making. For perception, we use ScreenSpot (Cheng et al., 2024), ScreenSpot Pro (Li et al., 2025b), and OSWorldG (Xie et al., 2025a) to measure GUI grounding and understanding of interface layouts across devices. For decision-making, we use AndroidWorld (Rawles et al., 2024) and OSWorld (Xie et al., 2025c;b) to evaluate interactive control, planning, and execution within real or simulated operating environments.

• **Text-Centric Tasks:** We evaluate the models on a wide range of text-centric datasets. (1) **Knowledge:** MMLU-Pro (Wang et al., 2024f), MMLU-Redux (Gema et al., 2024), GPQA (Rein et al., 2023), SuperGPQA (Team, 2025), (2) **Reasoning:** AIME-25 (AIME, 2025), HMMT-25 (HMMT, 2025), LiveBench (2024-11-25) (White et al., 2024), (3) **Code:** LiveCodeBench v6 (Jain et al., 2024), CFEval, OJBench (Wang et al., 2025c), (4) **Alignment Tasks:** IFEval (Zhou et al., 2023), Arena-Hard v2 (Li et al., 2024d) , Creative Writing v3 (Paech, 2023), WritingBench (Wu et al., 2025b), (5) **Agent:** BFCL-v3 (Patil et al., 2024), TAU2-Retail, TAU2-Airline, TAU2-Telecom, (6) **Multilingual:** MultiIF (He et al., 2024), MMLU-ProX, INCLUDE (Romanou et al., 2025), PolyMATH (Wang et al., 2025b).

基准清单按能力分组：多模态推理 12+2 项（数学，STEM，视觉推理与解谜）；通用 VQA 4 项；主观体验与指令跟随 3 项；文档理解与 OCR 10 项；2D/3D grounding 与空间理解 11 项；视频理解 7 项；多模态编码 3 项（前端重建，图表模仿，SVG 生成）；GUI Agent 分感知（GUI grounding，跨设备界面布局）与决策（真实或模拟操作系统环境中的交互控制，规划与执行）两组；文本中心任务分知识，推理，代码，对齐，Agent，多语言六类。

<!-- page 34 of 42 -->

## B Evaluation Prompts

To ensure reproducibility and facilitate future research, we provide here the complete set of prompts used to evaluate our model across all benchmarks. These prompts were consistently applied during inference to maintain fairness and comparability.

为保证可复现并便于后续研究，我们在此给出评测全部基准所用的完整 prompt；推理时统一套用这些 prompt，以保证公平与可比性。

### B.1 STEM & Puzzle

```txt
<image>
Question: {question}
Options:
{options}
Please select the correct answer from the options above.
```

```txt
<image>
{question}
{options}
Please select the correct answer from the options.
```

#### MMMUPro\_Vision

#### MathVista | MathVision | MathVerse | LogicVista

```txt
<image>
Now, we require you to solve a multiple-choice math question. Please briefly describe your thought process and provide the final answer(option).
Question: {question}
Option: {options}
Regarding the format, please answer following the template below, and be sure to include two <> symbols:
<Thought process>: «your thought process» <Answer>: «your option»
```

| ZeroBench |
| --- |
|  |
| {question} |
| Let's think step by step and give the final answer in curly braces, like this: {final answer} |

<!-- page 35 of 42 -->

```txt
VisualPuzzles-Direct

<image>
Question: {question}
Options:
{options}
Answer the question with the option's letter from the given choices directly.
```

```txt
<image>
## Question
{question}
## Answer Instruction: Please provide an answer to the question outlined above. Your response should adhere to the following JSON format, which includes two keys: 'solution' and 'short answer'. The 'solution' key can contain detailed steps needed to solve the question, and the 'short answer' key should provide a concise response.
Example of expected JSON response format:
{
"solution": "[Detailed step-by-step explanation]",
"short answer": "[Concise Answer]"
}
```

#### VLMBlind

```txt
<image>
Question: {question}
```

#### VisuLogic

```txt
<image>
{question}
Solve the complex visual logical reasoning problem through step-by-step reasoning.
Think about the reasoning process first and answer the question following this format:
Answer://boxed{$LETTER}
```

```txt
<image>
Question: {question}
Options:
{options}
Solve the multiple-choice question and then answer with the option letter from the given choices. The last line of your response should be of the following format: 'Answer: \$LETTER' (without quotes), where LETTER is one of the options. Think step by step before answering.
```

### B.2 GeneralVQA

#### MMBench | RealWorldQA | MMStar

```txt
<image>
Question: {question}
Options:
{options}
Please select the correct answer from the options above.
```

#### SimpleVQA

<!-- page 36 of 42 -->

```txt
<image>
Question: {question}
Options:
{options}
Please select the correct answer from the options above.
```

### B.3 Alignment

![Image block](images/p36-b-4-document-understanding.png)

B.4 Document-Understanding

![Image block](images/p36-txt.png)

```txt
<image>
{question}
Answer the question using a single word or phrase.
```

| OmniDocBench |
| --- |
|  |
| You are an AI assistant specialized in converting PDF images to Markdown format. Please follow these instructions for the conversion: |
| Text Processing: - Accurately recognize all text content in the PDF image without guessing or inferring. - Convert the recognized text into Markdown format. - Maintain the original document structure, including headings, paragraphs, lists, etc. |
| Mathematical Formula Processing: |
| - Convert all mathematical formulas to LaTeX format. |
| - Enclose inline formulas with $\). For example: This is an inline formula \(E = mc^2$ |
| - Enclose block formulas with $\]. For example: \[\frac{-b\pm\sqrt{b^2 - 4ac}}{2a}$ |
| Table Processing: - Convert tables to HTML format. - Wrap the entire table withand |
| Figure Handling: - Ignore figures in the PDF image. Do not attempt to describe or convert images. |
| Output Format: - Ensure the output Markdown document has a clear structure with appropriate line breaks between elements. - For complex layouts, try to maintain the original document's structure and format as closely as possible.Please strictly follow these guidelines to ensure accuracy and consistency in the conversion.Your task is to accurately convert the content of the PDF image into Markdown format without adding any extra explanations or comments. |

<!-- page 37 of 42 -->

```txt
<image_1>
<image_2>
...
<image_n>
{question}
```

### B.5 2D/3D Grounding

```txt
<image>
Locate every object that matches the description "{ref_sentence}" in the image. Report bbox coordinates in JSON format.
```

```txt
<image>
Question: {question}
Options:
{options}
Please select the correct answer from the options above.
```

#### ODinW-13

```txt
<image>
Locate every instance that belongs to the following categories: {obj_names}: Report bbox coordinates in JSON format.
```

#### ARKitScenes | Hypersim | SUNRGBD

```txt
<image>
Locate the {class_name } in the provided image and output their positions and dimensions using 3D bounding boxes. The results must be in the JSON format: ["bbox_3d":[x_center, y_center, z_center, x_size, y_size, z_size, roll, pitch, yaw],"label":"category"].
```

### B.6 Embodied/Spatial Understanding

<!-- page 38 of 42 -->

```txt
<image>
Locate {object_name} in this image. Output the point coordinates in JSON format.
For example:
[
{"point_2d": [x, y], "label": "point_1"}
]
```

#### RefSpatialBench

```txt
<image>
{question} Output the point coordinates in JSON format.
For example:
[
{"point_2d": [x, y], "label": "point_1"}
]
```

### B.7 Multi-Image

```txt
<image>
Question: {question}
Options:
{options}
Please select the correct answer from the options above.
```

#### MUIRBENCH

```txt
<image_1>
 <text_1>
 <image_2>
 <text_2>
 ...
 <image_n>
 <text_n>
Answer with the option's letter from the given choices directly.
```

### B.8 Video Understanding

```txt
MVBench | VideoMME | MLVU | LVBench - For instruct models

<video>
Select the best answer to the following multiple-choice question based on the video.
Respond with only the letter (A, B, C, or D) of the correct option.
Question: {question} Possible answer choices:
{options}
The best answer is:
```

#### MVBench | VideoMME | MLVU | LVBench - For thinking models

```txt
<video>
Select the best answer to the following multiple-choice question based on the video.
Respond with only the letter (A, B, C, or D) of the correct option.
Question: {question}
{options}
Please reason step-by-step, identify relevant visual content, analyze key timestamps and clues, and then provide the final answer.
```

<!-- page 39 of 42 -->

| Charades-STA |
| --- |
|  |
| Give you a textual query: {query_text} |
| When does the described content occur in the video? |
| Please return the timestamp in seconds. |

| VideoMMMU |
| --- |
| Perception &amp; Comprehension:{question}{options}Please ignore the Quiz question in last frame of the video. |
| Adaptation-multiple-choice:You should watch and learn the video content. Then apply what you learned to answer the following multi-choice question. The image for this question is at the end of the video.{question}{options} |
| Adaptation-open-ended:You should watch and learn the video content. Then apply what you learned to answer the following open-ended question. The image for this question is at the end of the video.{question} |

| MMVU |
| --- |
| multiple-choice:{question}{options}Visual Information: processed videoAnswer the given multiple-choice question step by step. Begin by explaining your reasoning process clearly. Conclude by stating the final answer using the following format: "Therefore, the final answer is: $LETTER" (without quotes), where $LETTER is one of the options. Think step by step before answering. |
| open-ended:{question}Visual Information: processed videoAnswer the given question step by step. Begin by explaining your reasoning process clearly.Conclude by stating the final answer using the following format: "Therefore, the final answer is: "Answer: $ANSWER" (without quotes), where $ANSWER is the final answer of the question. Think step by step before answering. |

<!-- page 40 of 42 -->

### B.9 Perception with Tool

```txt
V*
Your role is that of a research assistant specializing in visual information. Answer questions about images by looking at them closely and then using research tools. Please follow this structured thinking process and show your work.

Start an iterative loop for each question:
- **First, look closely:** Begin with a detailed description of the image, paying attention to the user's question. List what you can tell just by looking, and what you'll need to look up.
- **Next, find information:** Use a tool to research the things you need to find out.
- **Then, review the findings:** Carefully analyze what the tool tells you and decide on your next action.

Continue this loop until your research is complete.

To finish, bring everything together in a clear, synthesized answer that fully responds to the user's question.

#Tools

You may call one or more functions to assist with the user query.

You are provided with function signatures within <tools></tools> XML tags:
<tools>
{ "type":"function", "function": {"name": "image_zoom_in_tool", "description": "Zoom in on a specific region of an image by cropping it based on a bounding box (bbox) and an optional object label", "arguments": {"type": "object", "properties": {"bbox_2d": {"type": "array", "items": {"type": "number"}, "minItems": 4, "maxItems": 4, "description": "The bounding box of the region to zoom in, as [x1, y1, x2, y2], where (x1, y1) is the top-left corner and (x2, y2) is the bottom-right corner"}, "label": {"type": "string", "description": "The name or label of the object in the specified bounding box"}, "img_idx": {"type": "number", "description": "The index of the zoomed-in image (starting from 0)"}}, "required": ["bbox_2d", "label", "img_idx"]}}}
</tools>
For each function call, return a JSON object with function name and arguments within <tool_call></tool_call> XML tags:
<tool_call>
{{"name": <function-name>, "arguments": <args-json-object>}}
</tool_call>
<image>
{question}
```

<!-- page 41 of 42 -->

```jsonl
HRBench4K | HRBench8K

Your role is that of a research assistant specializing in visual information. Answer questions about images by looking at them closely and then using research tools. Please follow this structured thinking process and show your work.

Start an iterative loop for each question:

- **First, look closely:** Begin with a detailed description of the image, paying attention to the user's question. List what you can tell just by looking, and what you'll need to look up.
- **Next, find information:** Use a tool to research the things you need to find out.
- **Then, review the findings:** Carefully analyze what the tool tells you and decide on your next action.

Continue this loop until your research is complete.

To finish, bring everything together in a clear, synthesized answer that fully responds to the user's question.

#Tools

You may call one or more functions to assist with the user query.

You are provided with function signatures within <tools></tools> XML tags:
<tools>
{ "type":"function", "function": {"name": "image_zoom_in_tool", "description": "Zoom in on a specific region of an image by cropping it based on a bounding box (bbox) and an optional object label", "arguments": {"type": "object", "properties": {"bbox_2d": {"type": "array", "items": {"type": "number"}, "minItems": 4, "maxItems": 4, "description": "The bounding box of the region to zoom in, as [x1, y1, x2, y2], where (x1, y1) is the top-left corner and (x2, y2) is the bottom-right corner"}, "label": {"type": "string", "description": "The name or label of the object in the specified bounding box"}, "img_idx": {"type": "number", "description": "The index of the zoomed-in image (starting from 0)"}}, "required": ["bbox_2d", "label", "img_idx"]}}}
</tools>
For each function call, return a JSON object with function name and arguments within <tool_call></tool_call> XML tags:
<tool_call>
{{"name": <function-name>, "arguments": <args-json-object>}}
</tool_call>
<image>
{question}
{options}
```

### B.10 Coding

```txt
Design2Code (Generation)
<image>
You are an expert web developer who specializes in HTML and CSS. A user will provide you with a screenshot of a webpage. You need to return a single HTML file that uses HTML and CSS to reproduce the given website. Include all CSS code in the HTML file itself. If it involves any images, use "rick.jpg" as the placeholder. Some images on the webpage are replaced with a blue rectangle as the placeholder, and use "rick.jpg" for those as well. Do not hallucinate any dependencies on external files. You do not need to include JavaScript scripts for dynamic interactions. Pay attention to things like size, text, position, and color of all the elements, as well as the overall layout. Respond with the content of the HTML+CSS file:
```

<!-- page 42 of 42 -->

#### Design2Code (GPT-o4-mini Evaluation)

I will give you two images. The first is the reference, and the second is generated from the first via code rendering. Please rate their similarity from 0-100, where 0 means completely different and 100 means identical. Provide the score inside a LaTeX and briefly explain your reasoning. &lt;reference_image&gt; &lt;generated_image&gt;

### B.11 Agent

#### Screenspot | Screenspot-Pro | OSWorld-G

```txt
Tools
You may call one or more functions to assist with the user query.
You are provided with function signatures within <tools>... </tools> XML tags:
<tools>{{ "name":"computer_use", "description": "Use a mouse to interact with a computer. The screen's resolution is <display_width_px>x <display_height_px>." "notes": "Click with the cursor tip centered on targets; avoid edges unless asked. Do not use other tools (type, key, scroll, left_click_drag). Only left_click and mouse_move are allowed. If you can't find the element, terminate and report failure.", "parameters":{" "type":"object", "required":["action"], "properties":{" "action":{" "type":"string", "enum":["mouse_move","left_click"], "description":"The action to perform." }, "coordinate":{" "type":"array", "description":"(x, y): pixels from left/top. Required for action=mouse_move and action=left_click." }} }
}
</tools>
For each function call, return a JSON object with function name and arguments within <tool_call>
... </tool_call> XML tags:
<tool_call>
{{"name": <function-name>, "arguments": <args-json-object>}}
</tool_call>
Additionally, if you think the task is infeasible (e.g., the task is not related to the image), return:
<tool_call>
{"name": "computer_use", "arguments": {"action": "terminate", "status": "failure"}}
</tool_call>
```

42
