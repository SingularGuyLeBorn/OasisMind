---
title: "Seed1.5-VL · 对照译稿"
category: "模型库"
tags: ["Doubao", "对照译稿"]
published: true
excerpt: "Seed1.5-VL 公开材料的逐段中英对照译稿，附读报告时的疑问块。"
---
<!-- page 1 of 77 -->

arXiv:2505.07062v1 [cs.CV] 11 May 2025

IByteDanceSeed

# Seed1.5-VL Technical Report Seed1.5-VL 技术报告

**ByteDance Seed**

See Contributions and Acknowledgments section for a full author list.
完整作者名单见 Contributions and Acknowledgments 一节.

## Abstract

We present Seed1.5-VL, a vision-language foundation model designed to advance general-purpose multimodal understanding and reasoning. Seed1.5-VL is composed with a 532M-parameter vision encoder and a Mixture-of-Experts (MoE) LLM of 20B active parameters. Despite its relatively compact architecture, it delivers strong performance across a wide spectrum of public VLM benchmarks and internal evaluation suites, achieving the state-of-the-art performance on 38 out of 60 public benchmarks. Moreover, in agent-centric tasks such as GUI control and gameplay, Seed1.5-VL outperforms leading multimodal systems, including OpenAI CUA and Claude 3.7. Beyond visual and video understanding, it also demonstrates strong reasoning abilities, making it particularly effective for multimodal reasoning challenges such as visual puzzles. We believe these capabilities will empower broader applications across diverse tasks. In this report, we mainly provide a comprehensive review of our experiences in building Seed1.5-VL across model design, data construction, and training at various stages, hoping that this report can inspire further research. Seed1.5-VL is now accessible on [Volcano Engine](https://www.volcengine.com/)<sup>a</sup>.
我们推出 Seed1.5-VL, 一个面向通用多模态理解与推理的视觉语言基础模型. 它由一个 532M 参数的视觉编码器和一个激活参数 20B 的 MoE LLM 组成. 架构相对紧凑, 却在大量公开 VLM 基准和内部评测集上表现强劲, 在 60 个公开基准中的 38 个上拿到 state-of-the-art. 在 GUI 控制, 玩游戏这类以 agent 为中心的任务上, Seed1.5-VL 超过了 OpenAI CUA, Claude 3.7 等领先多模态系统. 除了图像与视频理解, 它还有很强的推理能力, 对视觉谜题这类多模态推理难题尤其有效. 我们相信这些能力能支撑更多样的任务应用. 本报告主要回顾构建 Seed1.5-VL 的经验, 覆盖模型设计, 数据构建和各阶段训练, 希望能启发后续研究. Seed1.5-VL 现已可在 [Volcano Engine](https://www.volcengine.com/) 上使用.

**Date:** June 13, 2025 **Correspondence:** [shiguang.sg@bytedance.com](mailto:shiguang.sg@bytedance.com)
日期: 2025 年 6 月 13 日. 通讯联系: shiguang.sg@bytedance.com.

<small><span class="docvortex-page-footnote" data-block-type="page_footnote" style="color:#6b7280"><sup>a</sup>Model ID: doubao-1-5-thinking-vision-pro-250428</span></small>
脚注 a: 模型 ID 为 doubao-1-5-thinking-vision-pro-250428.

<!-- page 2 of 77 -->

## Contents 目录

- 1 Introduction 4
- 2 Architecture 5
  - 2.1 Vision Encoder 5
    - 2.1.1 Architecture 6
    - 2.1.2 ViT Pre-training Stage 6
  - 2.2 Video Encoding 7
- 3 Pre-training 8
  - 3.1 Pre-training Data 8
    - 3.1.1 Generic Image-Text Pairs & Knowledge Data 8
    - 3.1.2 Optical Character Recognition (OCR) 9
    - 3.1.3 Visual Grounding & Counting 10
    - 3.1.4 3D Spatial Understanding 11
    - 3.1.5 Video 11
    - 3.1.6 Science, Technology, Engineering, and Mathematics (STEM) 12
    - 3.1.7 Graphical User Interface (GUI) 12
  - 3.2 Training Recipe 13
  - 3.3 Scaling Laws 14
- 4 Post-training 15
  - 4.1 Supervised Fine-tuning 16
    - 4.1.1 SFT Data Construction 16
    - 4.1.2 Training Recipe 16
  - 4.2 Reinforcement Learning from Human Feedback 17
    - 4.2.1 Preference Data 17
    - 4.2.2 VLM as a Reward Model 17
    - 4.2.3 Data Curation for Reinforcement Learning 18
  - 4.3 Reinforcement Learning with Verifiable Rewards 18
    - 4.3.1 Visual STEM 18
    - 4.3.2 Visual Perception and Reasoning 18
  - 4.4 Hybrid Reinforcement Learning 19
  - 4.5 Iterative Update by Rejection Sampling Fine-tuning 20
- 5 Training Infrastructure 21
  - 5.1 Large-Scale Pre-training 21
    - 5.1.1 Hybrid Parallelism 21
    - 5.1.2 Workload Balancing 21
    - 5.1.3 Parallelism-Aware Data Loading 21
    - 5.1.4 Fault Tolerance 21
  - 5.2 Post-Training Framework 22
- 6 Evaluation 22
  - 6.1 Public Benchmarks 22
    - 6.1.1 Vision Encoder as a Zero-shot Classifier 22
    - 6.1.2 Vision Task Evaluation 23
    - 6.1.3 Video Task Evaluation 25
  - 6.2 Multimodal Agent 25
  - 6.3 Internal Benchmarks 28
    - 6.3.1 Motivation and Design Principles 28
    - 6.3.2 Comparison with State-of-the-arts 29
    - 6.3.3 Out-of-distribution Generalization 30
目录中译: 1 引言; 2 架构 (2.1 视觉编码器, 含 2.1.1 架构与 2.1.2 ViT 预训练阶段; 2.2 视频编码); 3 预训练 (3.1 预训练数据, 分通用图文对与知识, OCR, 视觉 grounding 与计数, 3D 空间理解, 视频, STEM, GUI 七类; 3.2 训练配方; 3.3 Scaling Laws); 4 后训练 (4.1 SFT, 含数据构建与训练配方; 4.2 RLHF, 含偏好数据, VLM 作奖励模型, RL 数据整理; 4.3 可验证奖励 RL, 含视觉 STEM 与视觉感知推理; 4.4 混合 RL; 4.5 拒绝采样微调迭代更新); 5 训练基础设施 (5.1 大规模预训练, 含混合并行, 负载均衡, 并行感知数据加载, 容错; 5.2 后训练框架); 6 评测 (6.1 公开基准, 含视觉编码器零样本分类, 视觉任务, 视频任务; 6.2 多模态 agent; 6.3 内部基准, 含动机与设计原则, 与 SOTA 对比, 分布外泛化). 页码与原文相同.

<!-- page 3 of 77 -->

  - 6.4 Limitations 30
- 7 Conclusion and Next Steps 32
- 8 Contributions and Acknowledgments 44
- A Qualitative examples 47 A.1 Reasoning Cases: Visual Reasoning 48 A.2 Reasoning Cases: Geolocation Prediction 49 A.3 Visual Reasoning: Solving Rebus Puzzles 50 A.4 Visual Reasoning: Emoji Quiz 51 A.5 Visual Reasoning: Word Game I 52 A.6 Visual Reasoning: Word Game II 53 A.7 Visual Reasoning: Visual Pattern Recognition 54 A.8 Visual Puzzles: Find the Differences 55 A.9 Geometry 56 A.10 Counting in a complex scene 57 A.11 Spatial Understanding: Depth Sorting 58 A.12 Video Temporal Grounding 58 A.13 OCR Parsing and Document Understanding 59 A.14 Multilingual OCR Parsing 60 A.15 Generate Code for a Diagram of Novel Format 61 A.16 Image-conditioned Creative Writing 62 A.17 Failure Cases: 3D Spatial Imagination 63 A.18 Failure Cases: Hallucination (Knowledge Prior) 64 A.19 Failure Cases: Combinatorial Search I 65 A.20 Failure Cases: Combinatorial Search II 66
- B Evaluation Details 67 B.1 Internal Benchmark Structure 67 B.2 Comprehensive Comparisons on internal benchmarks 69 B.3 Capabilities and Benchmark Tasks 70 B.4 Evaluation Prompts 71
目录中译续: 6.4 局限; 7 结论与下一步; 8 贡献与致谢; 附录 A 定性样例 (A.1 至 A.20: 视觉推理, 地理位置推断, 画谜, emoji 猜谜, 两个文字游戏, 视觉模式识别, 找不同, 几何, 复杂场景计数, 深度排序, 视频时间定位, OCR 解析与文档理解, 多语种 OCR 解析, 为新格式图表生成代码, 图像条件创意写作, 以及 3D 空间想象, 知识先验幻觉, 两个组合搜索的失败案例); 附录 B 评测细节 (B.1 内部基准结构, B.2 内部基准全面对比, B.3 能力与基准任务, B.4 评测 prompt).

<!-- page 4 of 77 -->

## 1 Introduction

Vision-language models (VLMs) have emerged as a foundational paradigm for enabling general-purpose AI to perceive, reason, and act in open-ended virtual and physical environments. By aligning visual and textual modalities within a unified model, VLMs have rapidly advanced research frontiers in areas, such as multimodal reasoning [96, 129, 141], image editing [35, 97], GUI agents [5, 98, 105], autonomous driving [103, 131, 157], and robotics [31, 55, 63], while also powering real-world applications across education, healthcare, chatbots, and wearable devices.
视觉语言模型 (VLM) 已成为让通用 AI 在开放的虚拟与物理环境中感知, 推理和行动的基础范式. 通过在统一模型里对齐视觉与文本模态, VLM 迅速推进了多模态推理 [96, 129, 141], 图像编辑 [35, 97], GUI agent [5, 98, 105], 自动驾驶 [103, 131, 157], 机器人 [31, 55, 63] 等研究前沿, 同时在教育, 医疗, 聊天机器人和可穿戴设备上支撑了真实应用.

However, despite substantial progress, current VLMs still fall short of human-level generality, particularly in tasks requiring 3D spatial understanding, object counting, imaginative visual inference, and interactive game play. These limitations highlight the inherent challenges in VLM development. Unlike large language models (LLMs), which benefit from abundant, high-quality textual corpora that capture a wide spectrum of human knowledge, VLMs lack access to equally rich and diverse vision-language annotations, especially for concepts grounded in low-level perceptual phenomena. Moreover, the heterogeneous nature of multimodal data introduces additional complexity in both training and inference, complicating data pipeline design, parallel training strategies, and evaluation protocols.
不过, 尽管进展很大, 当前 VLM 离人类水平的通用性还有差距, 尤其在需要 3D 空间理解, 物体计数, 想象式视觉推断和交互式游戏的任务上. 这些局限反映了 VLM 开发的内在难点. LLM 能受益于覆盖大量人类知识的丰富高质量文本语料, VLM 却拿不到同样丰富多样的视觉语言标注, 对扎根于低层感知现象的概念尤其如此. 另外, 多模态数据的异构性给训练和推理都增加了复杂度, 数据管线设计, 并行训练策略和评测协议都更难做.

In this report, we share the efforts during the development of Seed1.5-VL, our latest multimodal foundation model for vision-language understanding. To address the scarcity of high-quality annotations, we developed a suite of diversified data synthesis pipelines targeting key capabilities, including optical character recognition (OCR), visual grounding, counting, video understanding, and long-tail knowledge during pre-training, as well as visual puzzles and games during post-training. Seed1.5-VL is pre-trained on trillions of multimodal tokens spanning diverse modalities, i.e., images, videos, text, and human-computer interaction data, to acquire broad visual knowledge and master core visual competencies. We also share the scaling behavior in the pre-training stage. In the post-training phase, we incorporate both human feedback and verifiable reward signals to further strengthen its general reasoning abilities.
本报告分享 Seed1.5-VL 的开发工作, 它是我们最新的视觉语言理解多模态基础模型. 为应对高质量标注稀缺, 我们搭建了一组多样化数据合成管线, 瞄准关键能力: 预训练阶段覆盖 OCR, 视觉 grounding, 计数, 视频理解与长尾知识, 后训练阶段覆盖视觉谜题和游戏. Seed1.5-VL 在数万亿多模态 token 上预训练, 模态包括图像, 视频, 文本和人机交互数据, 以获得广泛的视觉知识并掌握核心视觉能力. 我们也分享预训练阶段的 Scaling 行为. 后训练阶段同时引入人类反馈和可验证奖励信号, 进一步加强通用推理能力.

We also address the challenge of efficiently training large-scale multimodal models with asymmetrical architecture, especially the imbalance between the vision encoder and the language model. Our contributions include (1) a novel hybrid parallelism scheme optimized for this asymmetry and (2) a vision token redistribution strategy to balance GPU workloads. In addition, we implement a customized data loader that minimizes I/O bottlenecks under 3D parallelism. These innovations, combined with standard system-level optimizations (e.g., kernel fusion, selective activation checkpointing, offloading), collectively enhance overall training throughput.
我们还处理了高效训练非对称架构大规模多模态模型的难题, 特别是视觉编码器与语言模型之间的不平衡. 贡献包括 (1) 针对这种非对称优化的新混合并行方案, (2) 平衡 GPU 负载的视觉 token 重分配策略. 此外, 我们实现了定制数据加载器, 在 3D 并行下把 I/O 瓶颈压到最低. 这些改进与标准系统级优化 (如 kernel fusion, 选择性激活检查点, offloading) 一起提升了整体训练吞吐.

To establish a comprehensive understanding of the current landscape of VLM capabilities, thereby informing future research directions towards model improvements, we evaluate Seed1.5-VL on an extensive suite of public and internal benchmarks, covering a wide range of tasks including visual reasoning, grounding, counting, video understanding, and computer usage. Specifically, we report results on 60 public benchmarks, where Seed1.5-VL achieves state-of-the-art performance on 38 of them, including 21 out of 34 in vision-language benchmarks, 14 out of 19 in the video benchmarks, and 3 out of 7 in GUI agent tasks. Beyond benchmark performance, we also deploy Seed1.5-VL within an internal chatbot system to monitor its real-world and out-of-distribution (OOD) performance in dynamic, interactive environments.
为全面了解当前 VLM 能力版图, 并为后续改进指方向, 我们在大量公开与内部基准上评测 Seed1.5-VL, 任务覆盖视觉推理, grounding, 计数, 视频理解和电脑使用. 具体来说, 我们报告 60 个公开基准的结果, Seed1.5-VL 在其中 38 个上达到 state-of-the-art: 视觉语言基准 34 个中占 21 个, 视频基准 19 个中占 14 个, GUI agent 任务 7 个中占 3 个. 基准之外, 我们还把 Seed1.5-VL 部署进内部聊天机器人系统, 在动态交互环境中监测它的真实表现与分布外 (OOD) 表现.

> **想:** 38/60 这个比例的分母是否把三类基准混成一个池?
> 是混池. 21/34 + 14/19 + 3/7 正好是 38/60, 三类各自的分母差很多: GUI agent 只有 7 个, 拿下 3 个就占了 43%, 视频 19 个拿下 14 个是 74%. 读表 6, 表 7, 表 8 时要按类看, 不要把 63% 当作每类的平均胜率.

Despite its strong capabilities, Seed1.5-VL maintains a compact and efficient architecture, featuring a 532- million-parameter vision encoder and a language model with 20 billion active parameters. This streamlined design reduces inference costs and computational demands, making the model well-suited for interactive applications. The efficiency of Seed1.5-VL enhances accessibility for a broader user base via API services and contributes to a smoother user experience within the Doubao chatbot. Access to Seed1.5-VL will soon be available on the Volcano Engine API platform<sup>1</sup>.
能力虽强, Seed1.5-VL 仍保持紧凑高效的架构: 532M 参数的视觉编码器, 加一个激活参数 20B 的语言模型. 这种精简设计降低了推理成本与算力需求, 适合交互式应用. 效率让更多用户能通过 API 服务使用 Seed1.5-VL, 也让豆包聊天机器人的体验更顺. Seed1.5-VL 即将在 Volcano Engine API 平台开放.

The remainder of this report is organized as follows. We begin by presenting an overview of the model architecture and detailing the image and video encoding methods (section 2). Section 3 describes the data curation strategies and the pre-training procedure, including initial findings on multimodal model scaling laws and metric prediction—a relatively underexplored area. Section 4 details the data and techniques
报告其余部分安排如下. 先概述模型架构, 并详述图像与视频编码方法 (第 2 节). 第 3 节讲数据整理策略和预训练流程, 包括多模态模型 Scaling Laws 与指标预测的初步发现, 这是一个探索较少的方向. 第 4 节详述后训练阶段

<small><span class="docvortex-page-footnote" data-block-type="page_footnote" style="color:#6b7280"><sup>1</sup>[https://www.volcengine.com](https://www.volcengine.com/)</span></small>

<!-- page 5 of 77 -->

![Image block](images/p05-figure-1-the-architecture-of-seed1-5-vl-the-proposed.png)

Figure 1 The architecture of Seed1.5-VL. The proposed Seed1.5-VL comprises three main components: (1) SeedViT [1.0 second]to encode images and videos, (2) an MLP adapter to project visual features into multimodal tokens, and (3) a Large Language Model to process multimodal inputs. Seed1.5-VL accepts images at various resolutions and processes them using a native-resolution transform to preserve maximum image detail. For video inputs, we propose the dynamic frame-resolution sampling strategy, which dynamically adjusts the sampling frame rate and resolution. Additionally, a timestamp token is added before each frame to enhance the model’s temporal awareness.
图 1 Seed1.5-VL 的架构. Seed1.5-VL 由三个主要部件组成: (1) 编码图像和视频的 SeedViT, (2) 把视觉特征投影成多模态 token 的 MLP adapter, (3) 处理多模态输入的 LLM. Seed1.5-VL 接受各种分辨率的图像, 用原生分辨率变换处理, 以尽量保留图像细节. 对视频输入, 我们提出动态帧率-分辨率采样策略, 动态调整采样帧率与分辨率. 另外每帧前加一个时间戳 token, 增强模型的时间感知.

employed during the post-training phase to enhance alignment with human preferences and improve reasoning capabilities. Section 5 elaborates on the necessary infrastructure innovations developed to enable scalable pre-training and post-training. Finally, section 6 presents comprehensive evaluation results on public benchmarks, showcases model capabilities via qualitative examples, discusses limitations of current multimodal models, and proposes directions for future research.
为增强人类偏好对齐和推理能力所用的数据与技术. 第 5 节阐述支撑可扩展预训练与后训练所需的基础设施创新. 最后, 第 6 节给出公开基准上的完整评测结果, 用定性样例展示模型能力, 讨论当前多模态模型的局限, 并提出后续研究方向.

## 2 Architecture 架构

The architecture of Seed1.5-VL consists of three components: a vision encoder, an MLP adapter, and a large language model (LLM). The vision encoder natively supports dynamic image resolutions and employs 2D RoPE [126] for positional encoding, enabling flexible adaptation to images of arbitrary dimensions. To enhance computational efficiency, the architecture applies average pooling over adjacent 2×2 feature patches; a two-layer MLP subsequently processes these pooled features before being input to the LLM. Encoder-free architectures [1, 23, 127] are not considered, as the vision encoder provides efficient image compression, enabling high-resolution image representation with fewer tokens. The overall architecture is shown in figure 1.
Seed1.5-VL 的架构由三部分组成: 视觉编码器, MLP adapter 和 LLM. 视觉编码器原生支持动态图像分辨率, 位置编码用 2D RoPE [126], 可灵活适配任意尺寸的图像. 为提高计算效率, 架构对相邻 2×2 特征 patch 做平均池化, 池化后的特征再经两层 MLP 处理, 然后送入 LLM. 我们不考虑无编码器架构 [1, 23, 127], 因为视觉编码器提供了高效的图像压缩, 能用更少的 token 表示高分辨率图像. 整体架构见图 1.

### 2.1 Vision Encoder 视觉编码器

Many contemporary Vision-Language Models (VLMs) [2, 5, 7, 16, 37, 54, 71, 78, 104, 128, 141] commonly integrate pre-trained vision encoders designed for a fixed input resolution, typically square images. While this approach simplifies model architecture, it can inadvertently discard fine-grained visual information when processing high-resolution images, videos, or handling tasks requiring intricate detail such as OCR.
许多当代 VLM [2, 5, 7, 16, 37, 54, 71, 78, 104, 128, 141] 通常接入为固定输入分辨率 (一般是正方形图像) 设计的预训练视觉编码器. 这样做简化了架构, 但处理高分辨率图像, 视频, 或 OCR 这类需要精细细节的任务时, 可能无意中丢掉细粒度视觉信息.

<!-- page 6 of 77 -->

Recent efforts, such as those in Qwen2-VL [141] and InternVL-2.5 [16], have explored fine-tuning pre-trained vision encoders to accommodate dynamic-resolution inputs, offering a partial alleviation of this limitation. Nevertheless, these methods still largely depend on adapting existing fixed-resolution architectures and necessitate adjustments to position encodings (e.g., transitioning from 1D flatten position embedding to 2D RoPE [16, 141] or interpolation of 1D position embeddings to various shapes [99, 135]), which may not fully retain visual details and precision post-adaptation. Furthermore, we incorporate video data into the pretraining phase to enable the model to learn not only spatial features from images but also spatial-temporal dynamics, thereby enhancing its capacity to process dynamic scenes and complex visual content.
近期工作如 Qwen2-VL [141] 和 InternVL-2.5 [16] 尝试微调预训练视觉编码器以适配动态分辨率输入, 部分缓解了这一局限. 但这些方法仍主要依赖改造现有固定分辨率架构, 需要调整位置编码 (例如从 1D 展平位置嵌入换成 2D RoPE [16, 141], 或把 1D 位置嵌入插值到各种形状 [99, 135]), 改造后未必能完整保留视觉细节与精度. 此外, 我们在预训练阶段加入视频数据, 让模型不仅从图像学空间特征, 也学时空动态, 从而更好地处理动态场景和复杂视觉内容.

Addressing the challenges posed by fixed-resolution processing, we developed Seed-ViT, a vision encoder specifically designed for native-resolution feature extraction. Based on the well-established Vision Transformer (ViT) architecture [26], Seed-ViT consists of 532 million parameters. It demonstrates strong capabilities in general visual perception across diverse domains. Notably, on zero-shot classification benchmarks, Seed-ViT attains performance comparable to models with substantially more parameters, such as InternVL-C (6 billion parameters), highlighting its efficiency. Further architectural details and our pretraining approach for Seed-ViT are provided in sections 2.1.1 and 2.1.2, respectively.
针对固定分辨率处理带来的问题, 我们开发了 Seed-ViT, 一个专为原生分辨率特征提取设计的视觉编码器. 它基于成熟的 Vision Transformer (ViT) 架构 [26], 参数量 532M, 在多个领域的通用视觉感知上表现强. 值得一提的是, 在零样本分类基准上, Seed-ViT 与参数量大得多的模型 (如 6B 参数的 InternVL-C) 表现相当, 体现了它的效率. 更多架构细节和预训练方法分别见 2.1.1 与 2.1.2 节.

#### 2.1.1 Architecture 架构

The architectural hyper-parameters of Seed-ViT can be found in table 1.
Seed-ViT 的架构超参见表 1.

| Patch size | Pos embed | Head dim | Num heads | Embed dim | MLP ratio | Depth |
| --- | --- | --- | --- | --- | --- | --- |
| 14 | 2D RoPE | 64 | 20 | 1280 | 4.0 | 27 |

Table 1 The architectural hyperparameters of Seed-ViT.
表 1 Seed-ViT 的架构超参.

Our vision encoder is designed to accommodate input images of varying dimensions. Initially, input images undergo a pre-processing step involving bilinear interpolation to adjust their resolutions to the nearest multiple of 28 × 28 pixels. Subsequently, each image is segmented into a sequence of non-overlapping patches, each of 14 × 14 pixels. Following the approach outlined in NaViT [20], we concatenate patch sequences from multiple input images into a unified sequence. These raw patch sequences are then projected into tokens in the embedding space via a linear patch embedding layer, which are then fed into the transformer blocks. To ensure that tokens belonging to one image do not attend to tokens from other images within the batched sequence, we employ appropriate attention masks during the self-attention computations within the transformer blocks. Finally, a 2 × 2 average pooling operation is applied to the output patch embeddings before they are passed to the subsequent MLP adaptor and the LLM, as described above.
我们的视觉编码器可接受不同尺寸的输入图像. 首先, 输入图像经过预处理, 用双线性插值把分辨率调整到最接近的 28 × 28 像素倍数. 随后每张图被切成不重叠的 patch 序列, 每个 patch 为 14 × 14 像素. 沿用 NaViT [20] 的做法, 我们把多张输入图像的 patch 序列拼成一个统一序列. 这些原始 patch 序列经线性 patch 嵌入层投影成嵌入空间中的 token, 再送入 transformer 块. 为保证同一 batch 序列中一张图的 token 不去 attend 另一张图的 token, 我们在 transformer 块的自注意力计算中使用相应的注意力掩码. 最后, 对输出的 patch 嵌入做 2 × 2 平均池化, 再如前所述传给后续 MLP adaptor 和 LLM.

> **问:** 视觉编码器到底以什么粒度接进语言模型, 一个视觉 token 对应多大一块像素?
> 按 §2.1.1 串起来: 14 × 14 像素切 patch, 过表 1 的 27 层 ViT (宽 1280), 输出后做 2 × 2 平均池化, 再过两层 MLP 映射到 LLM 的输入空间. 所以进 LLM 的每个视觉 token 覆盖 28 × 28 像素, 这也是预处理把分辨率对齐到 28 的倍数的原因. 视觉 token 直接拼在文本 token 序列里, 没有 cross-attention 支路, 图 1 里 MLP adapter 就是唯一接口.

#### 2.1.2 ViT Pre-training Stage ViT 预训练阶段

| Categories | Unlabeled image | Image-text pairs | Video-audio-text tuples |
| --- | --- | --- | --- |
| Training samples | 2.2B | 4.8B | 65M |
| Token percentages | 4.0% | 91.2% | 4.8% |
| Batch sizes | 55,296 | 32,768 | 1,024 |
| LR warm up steps | 1,692 | 2,000 | 12,800 |
| Maximum LR | 7.06 × 10<sup>-3</sup> | 1.0 × 10<sup>-4</sup> | 5.0 × 10<sup>-5</sup> |
| Minimum LR | 1.05 × 10<sup>-5</sup> | 1.2 × 10<sup>-6</sup> | 2.02 × 10<sup>-7</sup> |

Table 2 Training setup and hyperparameters used in the three ViT pre-training stages.
表 2 三个 ViT 预训练阶段的训练设置与超参.

> **核对:** 表 2 的样本数和 token 占比是不是同一个分母?
> 不是. 样本数是条数: 2.2B, 4.8B, 65M; token 占比是整个 ViT 预训练 token 预算的份额: 4.0%, 91.2%, 4.8%. 视频-音频-文本元组只有 65M 条, 却吃掉 4.8% 的 token, 说明单条元组远比一张图或一对图文重. §2.1.2 说全模态阶段 「只用 4.8% 的 token」 就明显提升图像与视频理解, 这里的 4.8% 按 token 算, 不按样本算.

Our vision transformer, Seed-ViT, undergoes a dedicated pre-training pipeline before integration with the LLM. Guided by empirical evidence, we establish three key guidelines for our pre-training methodology:
我们的视觉 transformer Seed-ViT 在接入 LLM 之前, 先走一条专门的预训练管线. 基于实验证据, 我们为预训练方法定了三条关键原则:

<!-- page 7 of 77 -->

• **Better Training Efficiency with ViT-pretraining.** Most successful VLMs [7, 16, 141] follow the setup of having a vision encoder (e.g., CLIP or SigLIP [171]) and a few work [1, 24] have attempted to remove vision encoder entirely and directly pass image patches in decoder-only LLMs but with mixed results. Beyer <u>et al</u>. [10] also concluded that encoder-free VLMs may be a promising future direction but still suffer in training efficiency.
• **用 ViT 预训练换更好的训练效率.** 多数成功的 VLM [7, 16, 141] 采用带视觉编码器 (如 CLIP 或 SigLIP [171]) 的设置, 少数工作 [1, 24] 尝试彻底去掉视觉编码器, 把图像 patch 直接送进 decoder-only LLM, 结果好坏参半. Beyer 等 [10] 也认为无编码器 VLM 可能是有前景的方向, 但训练效率仍吃亏.

• **Early Integration of Native-Resolution Modeling.** We prioritize the early introduction of native-resolution modeling within the pre-training pipeline. The architecture of Seed-ViT is maintained consistently throughout both the ViT pre-training and VLM stages. This ensures the prevention of performance degradation stemming from architectural modifications and eliminates the need for extensive fine-tuning to compensate for such discrepancies.
• **尽早引入原生分辨率建模.** 我们优先在预训练管线早期引入原生分辨率建模. Seed-ViT 的架构在 ViT 预训练和 VLM 阶段保持一致. 这样可以避免架构改动带来的性能退化, 也不需要大量微调来弥补这种不一致.

• **Comprehensive Data Utilization.** The pre-training stage leverages the full spectrum of data intended for VLM training, encompassing unlabeled images, image-text pairs, and videos accompanied by visual and audio captions.
• **全面利用数据.** 预训练阶段用上了为 VLM 训练准备的全部数据类型, 包括无标注图像, 图文对, 以及带视觉与音频描述的视频.

Based on the above guidelines, the ViT pre-training pipeline is divided into three stages: (i) Masked Image Modeling (MIM) [145] with 2D RoPE, (ii) Native-Resolution Contrastive Learning, and (iii) Omni-modal Pre-training. Below, we provide more details of each stage.
按上述原则, ViT 预训练管线分为三个阶段: (i) 带 2D RoPE 的掩码图像建模 (MIM) [145], (ii) 原生分辨率对比学习, (iii) 全模态预训练. 下面分别细讲.

**MIM with 2D RoPE.** In the first stage, our goal is to enhance the visual perception ability on visual geometry and structure awareness by MIM. We leverage the EVA02-CLIP-E [29] as the teacher model, and the student model is randomly initialized following the architecture defined in table 1. During training, we randomly mask out 75% image patches and the corresponding RoPE embeddings and use the CLIP [107] features produced by the teacher as reconstruction targets. This process is optimized by a simple cosine similarity loss between masked-out patches in the student’s and teacher’s outputs. We find that the discrepancy in visual position embeddings between student and teacher models does not harm the performance, as the teacher employs learnable positional embeddings while the student uses 2D RoPE. Instead, 2D RoPE empowers the student with robust native dynamic-resolution recognition. As we scale up this MIM process, the abilities of VLMs on chart/document understanding and OCR are significantly improved.
**带 2D RoPE 的 MIM.** 第一阶段的目标是用 MIM 增强对视觉几何与结构的感知能力. 我们用 EVA02-CLIP-E [29] 作教师模型, 学生模型按表 1 的架构随机初始化. 训练中随机遮掉 75% 的图像 patch 及其对应的 RoPE 嵌入, 以教师产出的 CLIP [107] 特征作重建目标. 优化目标是学生与教师输出在被遮 patch 上的简单余弦相似度损失. 我们发现师生视觉位置嵌入不一致 (教师用可学习位置嵌入, 学生用 2D RoPE) 并不伤性能. 相反, 2D RoPE 让学生具备稳健的原生动态分辨率识别能力. 随着 MIM 规模加大, VLM 在图表/文档理解和 OCR 上的能力明显提升.

**Native-Resolution Contrastive Learning.** In the contrastive learning stage, the vision encoder is initialized with our MIM-trained student model, while the text encoder is initialized using the text encoder from EVA-02-CLIP-E. For each given image-text pair, we aggregate the extracted patch features from the vision encoder into a single 1280-dimensional image embedding using attention pooling. Alignment between the image and text embeddings is then achieved by jointly optimizing the SigLIP loss [171] and the SuperClass loss [52].
**原生分辨率对比学习.** 对比学习阶段, 视觉编码器用 MIM 训好的学生模型初始化, 文本编码器用 EVA-02-CLIP-E 的文本编码器初始化. 对每个图文对, 用注意力池化把视觉编码器提取的 patch 特征聚合成单个 1280 维图像嵌入. 再联合优化 SigLIP loss [171] 和 SuperClass loss [52], 实现图像嵌入与文本嵌入的对齐.

**Omni-modal Pre-training.** This stage adopts the MiCo framework [174], constructing aligned tuples consisting of video frames, audio, visual captions, and audio captions from video data. The ViT encodes both video frames and audio, while a separate text encoder processes captions. Through alignment of these embeddings, the ViT learns unified omni-modal representations. Despite consuming only 4.8% of the token budget allocated for the entire ViT pre-training process, this stage significantly enhances the ViT’s performance on image and video understanding tasks.
**全模态预训练.** 这一阶段采用 MiCo 框架 [174], 从视频数据构造由视频帧, 音频, 视觉描述和音频描述组成的对齐元组. ViT 同时编码视频帧和音频, 另一个文本编码器处理描述文字. 通过对齐这些嵌入, ViT 学到统一的全模态表示. 这一阶段只消耗整个 ViT 预训练 token 预算的 4.8%, 却明显提升了 ViT 在图像和视频理解任务上的表现.

Table 2 summarizes the training setup and hyperparameters used in each stage.
表 2 汇总了各阶段的训练设置与超参.

### 2.2 Video Encoding 视频编码

Effectively encoding video, beyond static image representation, remains a core challenge. A model’s ability to interpret temporal sequences, adapt to varying frame rates, and perceive absolute time is critical for understanding dynamic visual content. Seed1.5-VL addresses these challenges by introducing **Dynamic Frame-Resolution Sampling**, a novel strategy that jointly optimizes sampling across both the temporal (frame) and spatial (resolution) dimensions to balance semantic richness and computational efficiency.
在静态图像表示之外有效编码视频, 仍是核心难题. 模型能否理解时间序列, 适应不同帧率, 感知绝对时间, 对理解动态视觉内容很关键. Seed1.5-VL 为此提出 **动态帧率-分辨率采样 (Dynamic Frame-Resolution Sampling)**, 在时间 (帧) 和空间 (分辨率) 两个维度上联合优化采样, 在语义丰富度与计算效率之间取平衡.

Under this Dynamic Frame-Resolution Sampling strategy, videos are processed as sequences of image frames. The temporal dimension is managed through dynamic frame sampling. Instead of a uniform rate, Seed1.5-VL adjusts the frame sampling frequency based on content complexity and task requirements. The default
在这一策略下, 视频被当作图像帧序列处理. 时间维度由动态帧采样管理. Seed1.5-VL 不用统一帧率, 而是按内容复杂度和任务需求调整采样频率. 默认

<!-- page 8 of 77 -->

sampling rate is set at 1 frame per second (FPS), suitable for capturing a general understanding of video content. For tasks [73, 139] requiring detailed temporal information, the frame sampling rate is increased to 2 FPS. For tasks such as video counting [27] or motion tracking [48], the rate is increased to 5 FPS. To explicitly ground each frame within the video’s timeline, we prepend timestamp tokens (i.e., [1.5 second]) to each frame. This explicit timing annotation substantially enhances the model’s temporal awareness and enables it to handle variable frame rates common in real-world scenarios effectively.
采样率为每秒 1 帧 (FPS), 适合获取对视频内容的一般理解. 对需要细致时间信息的任务 [73, 139], 采样率提高到 2 FPS. 对视频计数 [27] 或运动跟踪 [48] 这类任务, 提高到 5 FPS. 为把每一帧明确锚定在视频时间线上, 我们在每帧前加时间戳 token (如 [1.5 second]). 这种显式时间标注大幅增强了模型的时间感知, 也让它能有效处理真实场景中常见的可变帧率.

Considering computational constraints inherent in processing long video sequences, the spatial dimension of the sampling is governed by dynamically adjusting the resolution allocated to each selected frame, managed within a maximum budget of 81,920 tokens per video. The model dynamically adjusts spatial resolutions, assigning tokens per frame through a hierarchical allocation system offering six predefined levels: {640, 512, 384, 256, 160, 128}. This allows for a flexible trade-off, i.e., using higher resolution for fewer frames or lower resolution to accommodate more frames from longer videos. In cases where a video is exceptionally long and exceeds the maximum encoding length even when using the lowest token allocation (128 tokens per frame), a fallback mechanism is triggered. The model then reduces the total frame count through uniform sampling across the video. While this reduces temporal density, it ensures that the entire video is represented, balancing processing efficiency with the preservation of significant temporal information.
考虑到处理长视频序列的算力约束, 采样的空间维度通过动态调整每个入选帧的分辨率来控制, 每个视频的上限预算为 81,920 个 token. 模型通过分层分配机制动态调整空间分辨率, 每帧 token 数有六个预设档位: {640, 512, 384, 256, 160, 128}. 这带来灵活的取舍: 帧少时用高分辨率, 视频长时用低分辨率容纳更多帧. 若视频特别长, 即使用最低档 (每帧 128 token) 也超出最大编码长度, 就触发回退机制: 模型在整段视频上均匀采样, 减少总帧数. 这会降低时间密度, 但保证整段视频都被表示, 在处理效率与保留重要时间信息之间取平衡.

> **拆开:** 81,920 token 的视频预算在六个档位下各能装多少帧, 什么时候触发回退?
> 81,920 除以 640 是 128 帧, 除以 128 是 640 帧. 按默认 1 FPS, 视频超过约 640 秒 (10 分 40 秒) 时, 即使降到最低档也装不下, 就进入 §2.2 说的均匀抽帧回退; 2 FPS 时门槛减半到约 320 秒. 换算到像素, 每 token 覆盖 28 × 28 像素 (见 §2.1.1), 640 档约 501,760 像素一帧, 128 档约 100,352 像素一帧. 时间戳 token 本身也占序列, §2.2 没说它是否计入 81,920, 这一点原文未交代.

This flexible strategy allows Seed1.5-VL to efficiently and accurately process varying video lengths and frame rates, maintaining essential temporal details crucial for diverse video understanding tasks.
这种灵活策略让 Seed1.5-VL 能高效准确地处理不同长度和帧率的视频, 保留对各种视频理解任务都关键的时间细节.

## 3 Pre-training 预训练

This section describes the data curation process (section 3.1) and training recipe (section 3.2) used in the pre-training stage of Seed1.5-VL. In section 3.3, we present the scaling behavior of our model.
本节介绍 Seed1.5-VL 预训练阶段的数据整理流程 (3.1 节) 和训练配方 (3.2 节). 3.3 节给出模型的 Scaling 行为.

### 3.1 Pre-training Data 预训练数据

The Seed1.5-VL pre-training corpus contains 3 trillion diverse, high-quality source tokens. This data is categorized based on target capabilities, with the curation process for each category detailed in the following subsections.
Seed1.5-VL 的预训练语料包含 3 万亿个多样, 高质量的源 token. 数据按目标能力分类, 各类的整理流程在下面各小节详述.

#### 3.1.1 Generic Image-Text Pairs & Knowledge Data 通用图文对与知识数据

Web-sourced image-text pair data, including alt text, image captions, and surrounding text, is available at an unprecedented scale (billions of instances) and exhibits high diversity in both visual and textual concepts. However, this data is inherently noisy (e.g., irrelevant or inaccurate text) and often exhibits class imbalance.
网络来源的图文对数据 (包括 alt 文本, 图像描述和周边文字) 规模空前 (数十亿条), 视觉与文本概念都非常多样. 但这类数据天然有噪声 (如文字无关或不准确), 且常有类别不平衡.

To mitigate these challenges, we first employ a series of filtering techniques, including image-text similarity scoring (e.g., CLIP-score thresholding), image-based criteria (e.g., removal of undersized images or those with extreme aspect ratios), text-based criteria (e.g., filtering of excessively short or long text), deduplication strategies (e.g., exact and near-duplicate image removal), and URL/domain-based filtering.
为缓解这些问题, 我们先用一系列过滤手段: 图文相似度打分 (如 CLIP-score 阈值), 基于图像的准则 (如去掉尺寸过小或宽高比极端的图), 基于文本的准则 (如过滤过短或过长文本), 去重策略 (如去掉完全重复和近重复图像), 以及基于 URL/域名的过滤.

Furthermore, the distribution of visual concepts within the raw image-text pairs adheres to a long-tail pattern. To empirically test this observation, we conduct a sandbox experiment using Biotrove [159], a large-scale dataset for species classification containing 161.9 million images spanning 366,600 species. We train a 1.1 billion-active-parameter variant of our VLM using three distinct data distributions:
此外, 原始图文对中视觉概念的分布呈长尾. 为实证检验这一观察, 我们用 Biotrove [159] 做了沙盒实验, 这是一个物种分类大规模数据集, 含 161.9 million 张图, 覆盖 366,600 个物种. 我们用三种不同数据分布训练一个激活参数 1.1B 的 VLM 变体:

• **Random-46M.** 46 million samples randomly selected from the training set.
• **Random-46M.** 从训练集随机抽取 46 million 个样本.

• **Max1k-46M.** 46 million samples selected with a maximum of 1,000 samples per species, ensuring inclusion of rare species.
• **Max1k-46M.** 抽取 46 million 个样本, 每个物种最多 1,000 个, 保证稀有物种被纳入.

• **Max100-15M.** 15 million samples with a maximum of 100 samples per species, providing greater relative exposure to rare species.
• **Max100-15M.** 15 million 个样本, 每个物种最多 100 个, 让稀有物种获得相对更多的曝光.

We evaluate the models on two specially filtered test sets derived from the original dataset: Balanced10k (sampled from BioTrove-Balanced representing common species) and Rare2k (sampled from BioTrove-Unseen
我们在从原数据集派生的两个特别过滤的测试集上评测: Balanced10k (采样自代表常见物种的 BioTrove-Balanced) 和 Rare2k (采样自代表

<!-- page 9 of 77 -->

representing rare species). Our experiment shown in table 3 indicates that the Random-46M configuration performs poorly on rare species recognition. In contrast, limiting the maximum samples per common species (Max1k-46M) significantly improves performance on rare species. Further restricting common species representation (Max100-15M) enhances memorization of rare species but adversely affects common species recognition. Thus, effectively capturing visual knowledge requires maintaining diverse examples of common visual concepts while ensuring sufficient training iterations for rare visual concepts.
稀有物种的 BioTrove-Unseen). 表 3 的实验表明, Random-46M 配置在稀有物种识别上很差. 相比之下, 限制常见物种的最大样本数 (Max1k-46M) 明显提升稀有物种表现. 进一步压缩常见物种 (Max100-15M) 强化了对稀有物种的记忆, 却伤害常见物种识别. 因此, 要有效获取视觉知识, 既要保留常见视觉概念的多样样例, 又要保证稀有视觉概念有足够的训练迭代.

|  | Training tokens | Balanced10k | Rare2k | Average |
| --- | --- | --- | --- | --- |
| Random-46M (1 epoch) | 12B | 78.92 | 10.46 | 44.69 |
| Max1k-46M (1 epoch) | 12B | 79.17 | 44.85 | 62.01 |
| Max100-15M (3 epochs) | 12B | 60.31 | 89.41 | 74.86 |

Table 3 Performance comparison on Balanced10k and Rare2k under three training data distributions, Random-46M, Max1k-46M, and Max100-15M. Evaluation was conducted using an open-ended Question Answering (QA) task, with responses automatically scored by a LLM judge. All models were trained with a fixed budget of 12 billion tokens.
表 3 三种训练数据分布 (Random-46M, Max1k-46M, Max100-15M) 下在 Balanced10k 与 Rare2k 上的表现对比. 评测采用开放式问答 (QA) 任务, 回答由 LLM 裁判自动打分. 所有模型都在固定的 12B token 预算下训练.

> **看表:** 表 3 的三行是同条件对照吗, Average 又按什么分母算?
> token 预算相同 (都是 12B), 但条件并不完全相同: 前两行 1 epoch, Max100-15M 是 3 epochs, 唯一样本数也从 46M 降到 15M. 所以 Max100-15M 在 Rare2k 上的 89.41 混有 「重复看同一批稀有样本」 的效应. Average 是两个测试集准确率的简单平均, 例如 (60.31 + 89.41) / 2 = 74.86, 不是按 10k 加 2k 共 12k 道题合并计分; 若按题数加权, Max100-15M 的优势会小得多.

To address the imbalance between common and rare visual knowledge acquisition from image-alt-text pairs, we propose a targeted pre-processing framework. Initially, this framework utilizes a precursor version of our VLM to automatically annotate the data with pertinent semantic domains (e.g., landmarks, food, commodities, biology) and associated named entities (e.g., product brands, species names). Named entities exhibiting low corpus frequency are identified as instances of rare visual knowledge. To mitigate data sparsity, we identify domains whose representation constitutes less than 50% of the average domain frequency. Alt-texts corresponding to these underrepresented domains are subsequently duplicated. By merging this augmented subset, enriched with samples from less frequent domains, back into the original corpus, we achieve a more balanced distribution of visual concepts. This re-balancing is designed to enhance the visual knowledge learning component, crucial to our pre-training methodology.
为解决从图像-alt 文本对中学习常见与稀有视觉知识的不平衡, 我们提出一个有针对性的预处理框架. 首先, 框架用 VLM 的前代版本给数据自动打上相关语义领域 (如地标, 食物, 商品, 生物) 和关联命名实体 (如商品品牌, 物种名) 标签. 语料频率低的命名实体被识别为稀有视觉知识. 为缓解数据稀疏, 我们找出占比低于平均领域频率 50% 的领域, 把这些欠代表领域对应的 alt 文本复制一份. 把这个富含低频领域样本的增广子集合并回原语料, 就得到更均衡的视觉概念分布. 这一再平衡旨在加强视觉知识学习部分, 它是我们预训练方法的关键.

#### 3.1.2 Optical Character Recognition (OCR) 光学字符识别 (OCR)

To enhance the Optical Character Recognition (OCR) capabilities of the VLM, particularly for multilingual text, special symbols, and the analysis of structurally complex documents, as shown in figure 2, we adopt large volumes of both annotated and synthetic data to train Seed1.5-VL.
为增强 VLM 的 OCR 能力, 尤其是多语种文本, 特殊符号和结构复杂文档的解析 (见图 2), 我们用大量标注数据和合成数据训练 Seed1.5-VL.

We build an in-house OCR training dataset containing over 1 billion samples, covering documents, scene text, tables, charts, and flowcharts. For document data, we collected a large volume of pages from various sources and applied our internal tools to extract content and layout information. Furthermore, we curated a diverse set of fonts, including artistic, handwritten, and non-Latin scripts, and subsequently synthesized over 200 million text-intensive images utilizing tools such as SynthDog [62] and LaTeX (see figure 2(a) for an example). To improve the model’s robustness in understanding textual content within images, we apply various data augmentation techniques to the synthetic data, including blurring, the addition of moiré patterns, and image distortion. Figure 2(c) illustrates an example of a document image after applying distortion-based augmentation.
我们构建了一个超过 1B 样本的内部 OCR 训练集, 覆盖文档, 场景文字, 表格, 图表和流程图. 文档数据方面, 从多种来源收集大量页面, 用内部工具抽取内容和版面信息. 此外, 我们整理了一组多样字体, 包括艺术字, 手写体和非拉丁文字, 再用 SynthDog [62] 和 LaTeX 等工具合成了 200 million 以上的文字密集图像 (示例见图 2(a)). 为提升模型理解图中文字的稳健性, 我们对合成数据施加多种数据增强, 包括模糊, 叠加摩尔纹和图像形变. 图 2(c) 是施加形变增强后的文档图像示例.

Our chart dataset combines existing open-source datasets (e.g., FigureQA [58]) with newly generated synthetic data. Synthetic charts were generated using both conventional tools (ECharts [70], Matplotlib [53]) and a novel LLM-based pipeline. In our pipeline, an LLM generates textual chart components (titles, legends, etc.), which are then transformed by an LLM into LaTeX or Python code for rendering (figure 2(b)). Chart images were obtained via execution of this code. This multi-pronged approach resulted in a large-scale dataset exceeding 100 million chart examples.
图表数据集把现有开源数据集 (如 FigureQA [58]) 与新生成的合成数据结合. 合成图表既用传统工具 (ECharts [70], Matplotlib [53]) 生成, 也用一条新的基于 LLM 的管线生成. 在这条管线里, LLM 先生成图表的文字组件 (标题, 图例等), 再由 LLM 转成 LaTeX 或 Python 渲染代码 (图 2(b)). 执行代码得到图表图像. 多管齐下, 最终得到超过 100 million 个图表样例的大规模数据集.

For table data, we extract text in HTML, LaTeX, and Markdown formats from various sources, including web page HTML, GitHub README files, and LaTeX files from arXiv. Using this text, we render over 50 million table images, creating a comprehensive dataset for table parsing. This dataset enables our model to efficiently convert tables into formats such as HTML, LaTeX, and Markdown.
表格数据方面, 我们从网页 HTML, GitHub README 文件, arXiv 的 LaTeX 文件等来源抽取 HTML, LaTeX 和 Markdown 格式的文本. 用这些文本渲染出 50 million 以上的表格图像, 构成表格解析的完整数据集. 这让模型能高效地把表格转成 HTML, LaTeX, Markdown 等格式.

<!-- page 10 of 77 -->

![Image block](images/p10-a.png)

![Chart block](images/p10-b.png)

![Image block](images/p10-c.png)

Table 1. Elemental abundances and ratios obtained from the retrieval cascade of WASP-39 b presented in section , inferred from averaged chemical abundances across the observed photosphere. The solar system elemental abundances and ratios are derived from
图 2(d) 中合成表格图像自带的表题: 表 1. 由 WASP-39 b 反演级联得到的元素丰度与比值, 按观测光球层平均化学丰度推得; 太阳系元素丰度与比值来自 (原图截断).

<table><tr><td></td><td>log(O/H)</td><td>log(C/H)</td><td>log(S/H)</td><td>log(Na/H)</td><td>log(K/H)</td><td>C/O</td><td>S/O</td><td>log(Na/O)</td><td>log(K/O)</td></tr><tr><td colspan="10">Free Chemistry</td></tr><tr><td>Sigmoid Clouds</td><td> $-2.04^{+0.13}_{-0.15}$ </td><td> $-2.22^{+0.16}_{-0.19}$ </td><td> $-3.75^{+0.19}_{-0.21}$ </td><td> $-6.72^{+0.64}_{-1.87}$ </td><td> $-8.55^{+0.46}_{-0.48}$ </td><td> $0.66^{+0.09}_{-0.11}$ </td><td> $0.020^{+0.012}_{-0.008}$ </td><td> $-4.67^{+0.61}_{-1.86}$ </td><td> $-6.5^{+0.44}_{-0.45}$ </td></tr><tr><td>Mie Aerosols</td><td> $-2.01^{+0.18}_{-0.22}$ </td><td> $-2.09^{+0.20}_{-0.24}$ </td><td> $-3.56^{+0.18}_{-0.19}$ </td><td> $-6.55^{+0.58}_{-0.72}$ </td><td> $-8.55^{+0.46}_{-0.48}$ </td><td> $0.83^{+0.05}_{-0.07}$ </td><td> $0.029^{+0.012}_{-0.009}$ </td><td> $-4.51^{+0.56}_{-0.73}$ </td><td> $-6.51^{+0.47}_{-0.49}$ </td></tr><tr><td colspan="10">Hybrid Equilibrium</td></tr><tr><td>Mie Aerosols</td><td> $-2.11^{+0.12}_{-0.10}$ </td><td> $-2.21^{+0.11}_{-0.10}$ </td><td> $-3.44^{+0.25}_{-0.19}$ </td><td> $-6.63^{+0.95}_{-0.64}$ </td><td> $-8.26^{+0.73}_{-0.43}$ </td><td> $0.83^{+0.06}_{-0.14}$ </td><td> $0.049^{+0.028}_{-0.017}$ </td><td> $-4.50^{+0.87}_{-0.61}$ </td><td> $-6.14^{+0.66}_{-0.41}$ </td></tr><tr><td colspan="10">Equilibrium Offset</td></tr><tr><td>MultiNest</td><td> $-2.10^{+0.14}_{-0.17}$ </td><td> $-2.22^{+0.16}_{-0.20}$ </td><td> $-3.38^{+0.13}_{-0.14}$ </td><td> $-5.60^{+0.31}_{-0.37}$ </td><td> $-7.74^{+0.32}_{-0.37}$ </td><td> $0.78^{+0.06}_{-0.09}$ </td><td> $0.054^{+0.028}_{-0.018}$ </td><td> $-3.49^{+0.31}_{-0.35}$ </td><td> $-5.62^{+0.31}_{-0.37}$ </td></tr><tr><td>UltraNest</td><td> $-2.17^{+0.15}_{-0.16}$ </td><td> $-2.29^{+0.17}_{-0.19}$ </td><td> $-3.47^{+0.17}_{-0.19}$ </td><td> $-5.88^{+0.51}_{-0.64}$ </td><td> $-7.91^{+0.41}_{-0.47}$ </td><td> $0.76^{+0.06}_{-0.07}$ </td><td> $0.050^{+0.023}_{-0.016}$ </td><td> $-3.73^{+0.46}_{-0.57}$ </td><td> $-5.72^{+0.34}_{-0.45}$ </td></tr><tr><td colspan="10">Solar Values</td></tr><tr><td></td><td>-3.31</td><td>-3.54</td><td>-4.88</td><td>-5.78</td><td>-6.93</td><td>0.59</td><td>0.0269</td><td>-2.47</td><td>-3.62</td></tr></table>

Figure 2 (a) An image generated by SynthDog and the corresponding textual annotations are organized in the following format: &lt;text&gt;...&lt;/text&gt;&lt;polygon&gt;...&lt;/polygon&gt;; (b) The synthesized chart data includes two types of annotations: chart-to-text parsing and QA pairs; (c) The original document image undergoes transformations to simulate real-world distortions, such as perspective shifts, bends, and wrinkles. These augmentations enhance the model’s robustness and improve its ability to recognize texts under diverse and challenging conditions; (d) An example of a QA pair generated for the above synthesized table image: Question: What is the value of log(C/H) for Sigmoid Clouds? Give analytical steps. Answer: We look for the row labeled “Sigmoid Clouds” and the column labeled $log(C/H)$ The value in that cell $\mathit { i s } \mathrm { - 2 . 2 2 _ { - 0 . 1 9 } ^ { + 0 . 1 6 } } .$
图 2 (a) SynthDog 生成的图像及其文字标注, 标注格式为 &lt;text&gt;...&lt;/text&gt;&lt;polygon&gt;...&lt;/polygon&gt;; (b) 合成图表数据带两类标注: 图表转文字解析和 QA 对; (c) 原始文档图像经过变换, 模拟透视偏移, 弯折, 褶皱等真实形变, 这些增强提升模型稳健性, 让它在多样困难条件下也能识别文字; (d) 为上方合成表格图像生成的 QA 对示例: 问题: Sigmoid Clouds 的 log(C/H) 值是多少? 给出分析步骤. 回答: 找到标为 「Sigmoid Clouds」 的行和标为 log(C/H) 的列, 该单元格的值是 -2.22, 上误差 +0.16, 下误差 -0.19.

To further enhance the model’s comprehension of textual content within images, we constructed a visual question answering (VQA) dataset to complement the structured image-text representations. Specifically, we employed a previous version of our VLM to generate question-answer pairs by conditioning on OCR outputs, chart content, table text, and the images themselves, utilizing a few-shot prompting approach. Figure 2(d) gives an example of an input table image and the corresponding generated QA pair. Subsequently, we applied an internal LLM to filter the generated question-answer pairs, removing instances exhibiting low semantic relevance between the question and the answer. Our experiments indicate that the inclusion of this VQA dataset significantly improved the model’s ability to understand textual information present in images.
为进一步增强模型对图中文字的理解, 我们构建了一个视觉问答 (VQA) 数据集, 补充结构化的图文表示. 具体做法是用前代 VLM 以 few-shot prompting 方式, 以 OCR 输出, 图表内容, 表格文本和图像本身为条件生成问答对. 图 2(d) 给出一张输入表格图像及其生成的 QA 对. 随后用内部 LLM 过滤生成的问答对, 去掉问题与答案语义相关度低的样本. 实验表明, 加入这一 VQA 数据集明显提升了模型理解图中文字信息的能力.

#### 3.1.3 Visual Grounding & Counting 视觉 Grounding 与计数

Object grounding, a fundamental capability for multimodal models, involves interpreting user instructions to identify and locate specific object regions within images. In this work, we employ two primary grounding representations for Seed1.5-VL: bounding boxes and center points. Building upon this localization foundation, we extend Seed1.5-VL’s capabilities to include object counting. Accordingly, our training strategy primarily utilizes three data types: bounding box annotations, point annotations, and counting data.
物体 grounding 是多模态模型的基础能力, 指按用户指令识别并定位图像中的特定物体区域. 本文为 Seed1.5-VL 采用两种主要 grounding 表示: 边界框和中心点. 在定位能力之上, 我们把 Seed1.5-VL 的能力扩展到物体计数. 因此训练策略主要用三类数据: 边界框标注, 点标注和计数数据.

**Bounding Box Data.** Firstly, we adopt widely-used open-source datasets for generic object grounding, including Objects365 [118], OpenImages [66], and $\mathrm { \bar { R e f C O C O / + / g } \; [ 6 0 ,   9 2 ,   1 6 4 ] }$ . Rather than directly incorporating those datasets for training, we filter low-quality samples of the open-source datasets and construct diverse grounding tasks. Specifically, we render all object bounding boxes for each category onto the images and adopt the previous version of our VLM to perform data inspection, which allows us to filter out samples with incorrect annotations, missing labels, or redundant annotations. Furthermore, we use these open-source
**边界框数据.** 首先, 我们采用广泛使用的通用物体 grounding 开源数据集, 包括 Objects365 [118], OpenImages [66] 和 RefCOCO/+/g [60, 92, 164]. 我们不直接拿这些数据集训练, 而是先过滤低质量样本, 再构造多样的 grounding 任务. 具体做法是把每个类别的全部物体边界框画到图上, 用前代 VLM 做数据检查, 以滤掉标注错误, 漏标或冗余标注的样本. 此外, 我们用这些开源

<!-- page 11 of 77 -->

datasets to construct diverse multi-task training data, including: (1) generic 2D grounding, (2) question answering about spatial relationships, and (3) question answering with visual prompts, which results in about 48 million samples and 41 billion tokens. Considering the limitations in the diversity of open-source grounding datasets in terms of both data domains and categories, we develop an efficient automatic annotation pipeline for generic multi-object grounding with large-scale image-text pairs. Specifically, we follow previous work [17] and extract noun phrases and entities from captions, and then adopt Grounding DINO [14, 80] to annotate diverse open-vocabulary objects in web images. We filter out low-quality annotations with CLIP [106] and heuristic metrics, e.g., non-maximum suppression. The automatic annotation pipeline brings about 200 million samples and 200 billion tokens.
数据集构造多样的多任务训练数据, 包括: (1) 通用 2D grounding, (2) 关于空间关系的问答, (3) 带视觉提示的问答, 共约 48 million 个样本, 41B token. 考虑到开源 grounding 数据集在数据领域和类别上的多样性有限, 我们开发了一条高效的自动标注管线, 用大规模图文对做通用多物体 grounding. 具体来说, 沿用前人工作 [17], 从描述中抽取名词短语和实体, 再用 Grounding DINO [14, 80] 在网络图像中标注多样的开放词汇物体. 用 CLIP [106] 和启发式指标 (如非极大值抑制) 滤掉低质量标注. 这条自动标注管线带来约 200 million 个样本, 200B token.

**Point Data.** Initially, we utilized the public data provided by PixMo-Points [21]. Recognizing limitations in the diversity and quantity of the available PixMo data, we developed a dedicated pipeline for generating additional pointing data. This pipeline employs Molmo [21] and CountGD [3] to annotate the center points of objects within a large collection of web images. Notably, CountGD proved particularly effective in annotating objects in dense image scenarios. Following annotation, low-quality data samples were filtered out, resulting in a final dataset comprising approximately 170 million instructions and 110 billion tokens.
**点数据.** 起初我们用 PixMo-Points [21] 提供的公开数据. 认识到现有 PixMo 数据在多样性和数量上的局限后, 我们开发了一条专门生成指点数据的管线. 它用 Molmo [21] 和 CountGD [3] 在大批网络图像上标注物体中心点. 值得一提的是, CountGD 在密集场景中标注物体特别有效. 标注后滤掉低质量样本, 最终数据集约含 170 million 条指令, 110B token.

**Counting Data.** We further sample from the aforementioned bounding box and point data to construct a counting dataset, containing approximately 8 million samples and 13 billion tokens. Specifically, we developed two variants: box-based counting and point-based counting, following a two-stage pipeline of 1) detection or pointing, then 2) generating counting results based on the numbers of the bounding boxes or points.
**计数数据.** 我们再从上述边界框和点数据中采样构造计数数据集, 约 8 million 个样本, 13B token. 具体有两个变体: 基于框的计数和基于点的计数, 都走两阶段流程: 1) 检测或指点, 2) 按边界框或点的数量生成计数结果.

During training, we employ relative coordinates and normalize all coordinate values such that the output bounding boxes and points fall within the range [0, 999], which enables Seed1.5-VL to accurately predict corresponding bounding boxes and points irrespective of the input image resolution. We apply this normalization strategy to all data related, including Optical Character Recognition (OCR) and Graphical User Interfaces (GUI).
训练中我们使用相对坐标, 把所有坐标值归一化到 [0, 999] 区间, 输出的边界框和点都落在这个范围里, 这让 Seed1.5-VL 无论输入图像分辨率多大都能准确预测对应的框和点. 我们把这种归一化策略用到所有相关数据上, 包括 OCR 和 GUI.

> **确认:** 坐标归一化到 [0, 999], 和原生分辨率输入是否冲突?
> 不冲突, 两者管的是不同端. 原生分辨率管输入侧: 图像插值到 28 的倍数, 近似保持宽高比送进 Seed-ViT (§2.1.1), token 数随图像大小变化. [0, 999] 管输出侧: 模型写出的坐标是相对位置映射到 0 到 999 的整数, 与原图像素数无关. 代价是分辨率上限: 对一张 4000 像素宽的截图, 一个坐标单位约 4 像素, 小 UI 元素的定位精度受这个量化步长约束. 表 6 的 grounding 分数和表 8 的 GUI grounding 分数都在这个输出协议下测得.

#### 3.1.4 3D Spatial Understanding 3D 空间理解

To enable the model’s 3D spatial understanding ability from a single image, we construct data targeting the following three tasks: relative depth sorting, absolute depth estimation, and 3D grounding. To generate the **relative depth sorting** data, we employed DepthAnything V2 [160] to infer depth relationships among objects sampled from 2 million internet images. This process yielded a dataset component comprising 3.2 billion tokens associated with this task. In particular, we select the average depth of objects with a relative depth gap beyond 20%.
为让模型具备从单张图像理解 3D 空间的能力, 我们为三个任务构造数据: 相对深度排序, 绝对深度估计和 3D grounding. 为生成 **相对深度排序** 数据, 我们用 DepthAnything V2 [160] 推断从 2 million 张互联网图像中采样的物体之间的深度关系. 这一过程产出了该任务相关的 3.2B token 数据. 特别地, 我们只选相对深度差超过 20% 的物体的平均深度.

Data for **absolute depth estimation** was derived from publicly available datasets. For each entity identified by its semantic mask, we determined its absolute depth using the corresponding annotated depth map. This procedure resulted in 18 million instruction pairs (e.g., query/depth value) and contributed 28 billion tokens to our pre-training corpus.
**绝对深度估计** 数据来自公开数据集. 对由语义掩码识别出的每个实体, 用对应的深度标注图确定其绝对深度. 这一流程产出 18 million 个指令对 (如 查询/深度值), 为预训练语料贡献 28B token.

For **3D grounding** data, we utilized publicly available datasets from the internet. These datasets were then processed and reformulated into question-answering (QA) pairs. Specifically, our reformulation involved prompting for the 3D locations of objects belonging to a particular category. This process yielded a dataset of 770K instruction-following pairs, comprising 1.3 billion tokens.
**3D grounding** 数据使用互联网公开数据集. 这些数据集经处理后改写成问答 (QA) 对. 具体改写方式是用 prompt 询问某一类别物体的 3D 位置. 这一流程产出 770K 条指令跟随对, 共 1.3B token.

#### 3.1.5 Video 视频

This part of data is used to improve the model’s understanding of multi-frame time-series images in video. It comprises three primary categories. Firstly, general video understanding data, this portion encompasses a variety of tasks, including video captioning, video question answering, action recognition, action grounding, and multi-image understanding. Data are sourced from public datasets and internally collected video-caption pairs. Secondly, we include several publicly available datasets for video temporal grounding and moment retrieval to enhance the model’s temporal awareness. Specifically, Seed1.5-VL directly predicts the start and end timestamps based on user prompts, with the default seconds format. Temporal grounding capability benefits complex reasoning tasks in videos. Lastly, video streaming data is crucial for understanding dynamic
这部分数据用于提升模型对视频中多帧时序图像的理解. 它包括三大类. 第一类是通用视频理解数据, 覆盖视频描述, 视频问答, 动作识别, 动作 grounding 和多图理解等任务, 数据来自公开数据集和内部收集的视频-描述对. 第二类, 我们加入若干公开的视频时间定位与片段检索数据集, 增强模型的时间感知. 具体来说, Seed1.5-VL 按用户 prompt 直接预测起止时间戳, 默认用秒格式. 时间定位能力对视频中的复杂推理任务有益. 最后一类是视频流数据, 对理解动态

<!-- page 12 of 77 -->

and continuous video content. The data is drawn from various sources and structured into three main components:
连续的视频内容很关键. 数据取自多种来源, 组织成三个主要部分:

• **Interleaved Caption/QA Data.** First, we construct interleaved video text sequences either by directly captioning segmented video clips or by constructing multi-turn question-answer pairs in chronological order. These captions and QA pairs are inserted at the corresponding timestamps within the video to enhance real-time video understanding.
• **交错描述/QA 数据.** 其一, 我们构造交错的视频-文本序列: 或直接为切好的视频片段写描述, 或按时间顺序构造多轮问答对. 这些描述和 QA 对插入视频中对应的时间戳位置, 以增强实时视频理解.

• **Proactive Reasoning Data.** Second, we reconstruct grounded video question answering and dense caption data into a frame-by-frame response format. This data requires the model to continuously monitor the video stream and proactively determine the appropriate timestamps to produce responses.
• **主动推理数据.** 其二, 我们把带定位的视频问答和稠密描述数据改造成逐帧回应格式. 这类数据要求模型持续盯着视频流, 主动判断在哪个时间戳给出回应.

• **Realtime Commentary Data.** Third, we leverage naturally temporally synchronized video commentary data to provide fine-grained interleaving and alignment of video frames and texts. This formation enables the model to handle interruptions and dynamically update responses in real-time according to the video stream.
• **实时解说数据.** 其三, 我们利用天然时间同步的视频解说数据, 提供视频帧与文本的细粒度交错和对齐. 这种形式让模型能处理打断, 并随视频流实时更新回应.

Together, these datasets form a comprehensive foundation for effective video training.
这些数据集一起构成了有效视频训练的完整基础.

#### 3.1.6 Science, Technology, Engineering, and Mathematics (STEM) 科学, 技术, 工程与数学 (STEM)

To enhance the model’s reasoning capabilities during pre-training, we incorporated a diverse collection of problem-solving data across various STEM domains, obtained through both crawling and manual annotation. This effort culminated in the creation of comprehensive STEM datasets, structured around two primary components: **image comprehension data** and **problem-solving data**.
为在预训练阶段增强模型的推理能力, 我们通过爬取和人工标注, 纳入了跨多个 STEM 领域的多样解题数据. 最终形成完整的 STEM 数据集, 由两大部分组成: **图像理解数据** 和 **解题数据**.

The **image comprehension data** comprises several subsets. We collected 3.2 million high-quality educational grounding samples across 300 categories within mathematics, physics, chemistry, and biology. Additionally, we synthesized 10 million structured tables with diverse formats, generated 4.5 million chemical structural diagrams, and produced 1.5 million synthetic coordinate system diagrams, including function plots and positional graphs. A specific subset, K12 Caption data, includes 100,000 human-annotated captions for educational images, 1 million visual question-answering (VQA) pairs, 1 million machine-generated captions using an automated pipeline, and hundreds of thousands of geometry-specific captions.
**图像理解数据** 包含若干子集. 我们收集了覆盖数学, 物理, 化学, 生物 300 个类别的 3.2 million 条高质量教育类 grounding 样本. 此外, 合成了 10 million 张格式多样的结构化表格, 生成 4.5 million 张化学结构图, 制作 1.5 million 张合成坐标系图 (包括函数图像和位置图). 其中 K12 Caption 子集包括 100,000 条人工标注的教育图像描述, 1 million 个 VQA 对, 1 million 条自动管线生成的机器描述, 以及数十万条几何专用描述.

For the **problem-solving data** component, we processed over 100 million K12-level exercises through a rigorous cleaning and reformulation process. This was complemented by tens of millions of curated Chinese adult education problems and several million English-language image-associated questions.
**解题数据** 方面, 我们对 100 million 以上的 K12 习题做了严格清洗和改写. 另外补充了数千万道整理过的中文成人教育题目, 以及数百万道英文带图题目.

The construction of these datasets employed hybrid acquisition strategies, integrating manual annotation, automated synthesis, and stringent quality control measures. This approach ensures multimodal coverage encompassing textual, visual, and diagrammatic representations across core STEM domains such as mathematics, physics, and chemistry.
这些数据集的构建采用混合获取策略, 结合人工标注, 自动合成和严格质控. 这保证了在数学, 物理, 化学等核心 STEM 领域覆盖文本, 图像和示意图多种表示.

#### 3.1.7 Graphical User Interface (GUI) 图形用户界面 (GUI)

For GUI data, we mainly include data curated from UI-TARS [105, 116]. Specifically, to support robust GUI perception, grounding, and reasoning, we curated a large-scale dataset across web, app, and desktop environments. Each screenshot is paired with structured metadata—element type, bounding box, text, and depth—collected via automated parsing and human-assisted exploration. For **perception**, we constructed tasks including element description, dense captioning, and state transition captioning. These tasks teach the model to identify small UI components, understand overall layouts, and detect subtle visual changes across frames. Visual markers (Set-of-Mark) are also overlaid to strengthen spatial correspondence. For **grounding**, we train the model to predict element coordinates from textual descriptions. Bounding boxes are normalized across resolutions. For **reasoning**, we collect multi-step task trajectories, each annotated with observations, intermediate thoughts, and actions. This data, combining in-house and standardized open-source traces, enables the model to learn step-by-step planning, correction, and reflection.
GUI 数据主要来自 UI-TARS [105, 116] 整理的数据. 具体来说, 为支持稳健的 GUI 感知, grounding 和推理, 我们整理了一个覆盖网页, 应用和桌面环境的大规模数据集. 每张截图都配有结构化元数据 (元素类型, 边界框, 文本和层级深度), 通过自动解析和人工辅助探索收集. **感知** 方面, 我们构造了元素描述, 稠密描述和状态转移描述等任务, 教模型识别小 UI 部件, 理解整体布局, 发现帧间细微的视觉变化. 还叠加视觉标记 (Set-of-Mark) 以加强空间对应.**grounding** 方面, 训练模型从文字描述预测元素坐标, 边界框跨分辨率归一化.**推理** 方面, 我们收集多步任务轨迹, 每步标注观察, 中间思考和动作. 这些数据结合内部轨迹与标准化的开源轨迹, 让模型学会逐步规划, 纠错和反思.

<!-- page 13 of 77 -->

| Stages | Stage 0 | Stage 1 | Stage 2 |
| --- | --- | --- | --- |
| Training budget (tokens) | 16B | 3T | 240B |
| Sequence length | 32,768 | 32,768 | 131,072 |
| Trainable components | MLP adaptor | all | all |
| Batch sizes (tokens) | 8.4M | 71M | 71M |
| LR warmup steps | 100 | 500 | 0 |
| Maximum LR | 2.52 × 10<sup>-4</sup> | 5.22 × 10<sup>-5</sup> | 5.22 × 10<sup>-6</sup> |
| Minimum LR | 4.50 × 10<sup>-5</sup> | 5.22 × 10<sup>-6</sup> | 5.22 × 10<sup>-6</sup> |

Table 4 Training setup and hyperparameters in three pre-training stages.
表 4 三个预训练阶段的训练设置与超参.

### 3.2 Training Recipe 训练配方

Large multimodal models are typically trained either through joint multimodal learning from the start [54, 128], or via post-hoc adaptation after language model pre-training [16, 141]. Seed1.5-VL currently adopts the latter for flexible ablation and fast iterative development.
大型多模态模型通常要么从一开始就联合多模态学习 [54, 128], 要么在语言模型预训练之后做事后适配 [16, 141]. Seed1.5-VL 目前采用后者, 方便灵活消融和快速迭代开发.

As delineated in section 2, our proposed model comprises three primary modules: a vision encoder, an MLP adapter, and a language model. Prior to the VLM pre-training phase, the vision encoder undergoes an independent training procedure as detailed in section 2.1. The language model is initialized from an internal pre-trained model with approximately 20 billion active parameters. This language model employs a decoder-only Mixture-of-Experts (MoE) architecture [119] and has been trained on a large-scale corpus consisting of trillions of high-quality text-only tokens. Our VLM pre-training methodology is structured into three distinct stages, as summarized in table 4:
如第 2 节所述, 模型由三个主要模块组成: 视觉编码器, MLP adapter 和语言模型. 在 VLM 预训练之前, 视觉编码器按 2.1 节单独训练. 语言模型从一个激活参数约 20B 的内部预训练模型初始化. 该语言模型采用 decoder-only MoE 架构 [119], 已在由数万亿高质量纯文本 token 组成的大规模语料上训练过. VLM 预训练分三个阶段, 汇总见表 4:

1. In stage 0, we align the vision encoder with the language model by only training the MLP adapter while keeping the vision encoder and the language model frozen. Omitting this stage yields a slightly higher loss and worse performance.
1. 阶段 0, 只训练 MLP adapter, 冻结视觉编码器和语言模型, 以对齐视觉编码器与语言模型. 省掉这一阶段, loss 会略高, 表现更差.

2. In stage 1, all model parameters are trainable. This stage focuses on knowledge accumulation and mastering visual grounding and OCR capabilities of the model by training on a multimodal corpus of 3 trillion tokens, mainly composed of captions, interleaved image-text, visual grounding, and OCR data. Empirically, we found that adding a small amount of text-only tokens (e.g., 5%) can maintain the model’s language-only capabilities. Also, adding a small amount of instruction following data results in more reliable evaluation results, which allows us to decouple pre-training development from post-training’s.
2. 阶段 1, 所有模型参数都可训练. 这一阶段侧重知识积累, 以及掌握视觉 grounding 和 OCR 能力, 训练语料是 3 万亿 token 的多模态语料, 主要由描述, 交错图文, 视觉 grounding 和 OCR 数据组成. 经验上, 加入少量纯文本 token (如 5%) 能维持模型的纯语言能力. 另外, 加入少量指令跟随数据会让评测结果更可靠, 这让我们能把预训练开发与后训练开发解耦.

3. In stage 2, we create a more balanced data mixture across different tasks, as well as adding data from new domains, such as video understanding, coding, and 3D spatial understanding. In addition, we increase the sequence length from 32,768 to 131,072, which better accommodates modeling long dependencies in videos and complex reasoning problems. Same as in stage 1, all model parameters are trainable.
3. 阶段 2, 我们构造跨任务更均衡的数据配比, 并加入新领域数据, 如视频理解, 代码和 3D 空间理解. 另外把序列长度从 32,768 提到 131,072, 更好地容纳视频中的长依赖和复杂推理问题. 与阶段 1 相同, 所有参数都可训练.

> **回看:** 表 4 的阶段 1 写 3T token, §3.1 也说语料含 3 万亿源 token, 这两个 3T 是同一件事吗?
> 分母不同. §3.1 的 3 trillion 是语料里的 「source tokens」 总量; 表 4 的 3T 是阶段 1 实际消耗的训练 token 预算, 数据配比和重复次数都会让两者不等. 再加上阶段 0 的 16B 和阶段 2 的 240B, VLM 预训练共约 3.256T 训练 token, 其中阶段 2 才引入视频, 代码与 3D 空间理解数据 (§3.2 第 3 条). 表 4 的 batch 71M token 是按 token 计, 不是按样本.

We also experimented with an alternative training strategy, similar to approaches employed by [16, 141], where in stage-0 both the MLP adaptor and the vision encoder are trained while the language model remains frozen. Empirical evaluation, however, demonstrated that our training recipe yields superior performance. We hypothesize that this difference may stem from the vision encoder attempting to compensate for potential inabilities within the frozen LLM, which could consequently compromise its perceptual capabilities.
我们还试过另一种训练策略, 与 [16, 141] 的做法类似: 阶段 0 同时训练 MLP adaptor 和视觉编码器, 冻结语言模型. 但实验评测表明我们的配方效果更好. 我们推测差异可能来自视觉编码器试图补偿冻结 LLM 的潜在不足, 从而损害了它的感知能力.

We employ the AdamW optimizer [64] in all three stages’ training with $\beta _ { 1 } = 0 . 9 ,   \beta _ { 2 } = 0 . 9 5$ , and a weight decay of 0.1. The bias and normalization parameters are omitted from the weight decay, and other training hyperparameters can be found in table 4. Stage-0 and stage-1 training follow a full cosine decay learning rate schedule, while the starting learning rate in stage 2 is equal to the ending learning rate from stage 1 and is kept constant throughout the training. In stage 2, we load the optimizer states from stage 1, so no learning rate warmup is used.
三个阶段都用 AdamW 优化器 [64], $\beta _ { 1 } = 0 . 9 ,   \beta _ { 2 } = 0 . 9 5$ , weight decay 为 0.1. bias 和归一化参数不做 weight decay, 其他训练超参见表 4. 阶段 0 和阶段 1 用完整的余弦衰减学习率调度, 阶段 2 的起始学习率等于阶段 1 的结束学习率, 并在整个训练中保持不变. 阶段 2 加载阶段 1 的优化器状态, 所以不做学习率预热.

<!-- page 14 of 77 -->

### 3.3 Scaling Laws

![Chart block](images/p14-a.png)

![Chart block](images/p14-b.png)

![Chart block](images/p14-c.png)

![Chart block](images/p14-d.png)

![Chart block](images/p14-e.png)

![Chart block](images/p14-f.png)

Figure 3 The relationship between the training loss of most sub-categories and training tokens obeys the power law [46]. Also, the relationship between the training loss of a sub-category and the corresponding downstream evaluation metric appears to be log-linear (e.g., metric ∼ log(loss)) within a local neighborhood. (a) The training loss of OCR related dataset as a function of training tokens; (b) Top-1 accuracy on ChartQA [88] as a function of the training loss; (c) Top-1 accuracy on InfographicVQA [90] as a function of the training loss; (d) The training loss of grounding related dataset as a function of training tokens; (e) Precision@IoU=0.5 on RefCOCO [60, 164] as a function of the training loss; (e) Precision@IoU=0.5 on RefCOCO+ [60, 164] as a function of the training loss. Note that the evaluation metrics displayed in this figure represent performance after pre-training and are therefore not directly comparable to the final results, which are achieved following reinforcement learning (RL) as detailed in Section 6.
图 3 多数子类别的训练 loss 与训练 token 数的关系服从幂律 [46]. 子类别训练 loss 与对应下游评测指标的关系在局部邻域内近似 log-linear (即 metric ∼ log(loss)). (a) OCR 相关数据集的训练 loss 随训练 token 数的变化; (b) ChartQA [88] 的 Top-1 准确率随训练 loss 的变化; (c) InfographicVQA [90] 的 Top-1 准确率随训练 loss 的变化; (d) grounding 相关数据集的训练 loss 随训练 token 数的变化; (e) RefCOCO [60, 164] 上 Precision@IoU=0.5 随训练 loss 的变化; (e) RefCOCO+ [60, 164] 上 Precision@IoU=0.5 随训练 loss 的变化 (原文第二个 (e) 应为 (f)). 注意图中评测指标是预训练后的表现, 不能与第 6 节 RL 之后的最终结果直接比较.

The pre-training of Vision-Language Models (VLMs) like Seed1.5-VL differs fundamentally from the standard practice for Large Language Models (LLMs), which typically involves random initialization of all model parameters. In contrast, Seed1.5-VL is built upon pre-trained components, including a vision encoder, an MLP adaptor, and a language model. This section focuses on understanding the scaling behavior of Seed1.5-VL during the stage-1 phase of pre-training. Based on prior work on LLM scaling laws [45, 46, 59], the average negative log-likelihood loss L is modelled as a function of model parameters N and training tokens D:
Seed1.5-VL 这类 VLM 的预训练与 LLM 的常规做法根本不同: LLM 通常随机初始化全部参数, Seed1.5-VL 则建立在预训练好的部件之上, 包括视觉编码器, MLP adaptor 和语言模型. 本节关注 Seed1.5-VL 在预训练阶段 1 的 Scaling 行为. 基于 LLM Scaling Laws 的前人工作 [45, 46, 59], 平均负对数似然 loss L 被建模为模型参数 N 和训练 token 数 D 的函数:

$$
\hat {L} \sim \frac {A}{N ^ {\alpha}} + \frac {B}{D ^ {\beta}}.\tag{1}
$$

Given that our model architecture and thus the number of parameters are fixed during this stage, equation (1) simplifies to a dependency primarily on the scale of the training data:
由于这一阶段模型架构固定, 参数量也固定, 式 (1) 简化为主要依赖训练数据规模:

$$
\hat {L} \sim \frac {B}{D ^ {\beta}}.\tag{2}
$$

To facilitate analysis, we examine this relationship in log-log space by taking the logarithm of both sides:
为便于分析, 两边取对数, 在 log-log 空间考察这一关系:

$$
\log (\hat {L}) \sim \log (B) - \beta \log (D) = - a \log (D) + b.\tag{3}
$$

We organized our pre-training dataset into distinct categories corresponding to specific capabilities (as detailed in section 3.1). We observed that the training loss for the majority of these data sub-categories exhibits a
我们把预训练数据集按对应能力分成不同类别 (详见 3.1 节). 我们观察到, 多数数据子类别的训练 loss

<!-- page 15 of 77 -->

![Image block](images/p15-figure-4-the-overview-of-post-training-for-seed1-5-vl.png)

Figure 4 The overview of post-training for Seed1.5-VL. The post-training for Seed1.5-VL includes an iterative update combining rejection sampling and online reinforcement learning. We build a data pipeline including collection and curation of hard prompts for augmenting post-training data. A key aspect of our reinforcement learning implementation is that supervision, mediated by reward models and rule verifiers, is applied solely to the final generated output. We intentionally refrain from supervising the detailed chain-of-thought reasoning itself, a distinction highlighted in the illustration’s right section.
图 4 Seed1.5-VL 后训练概览. Seed1.5-VL 的后训练包括结合拒绝采样与在线强化学习的迭代更新. 我们搭建了一条数据管线, 收集并整理难 prompt 以扩充后训练数据. 强化学习实现的一个关键点是: 由奖励模型和规则验证器提供的监督只施加在最终生成的输出上. 我们有意不监督详细的 CoT 推理过程本身, 这一区别在图右侧标出.

clear adherence to the scaling relationship defined by equation (3). As shown in figure 3 (a) and (d), the training losses for OCR and grounding related datasets can be modeled as follows:
清楚地遵循式 (3) 定义的 Scaling 关系. 如图 3 (a) 和 (d) 所示, OCR 和 grounding 相关数据集的训练 loss 可建模为:

$$
\begin{array}{c} \log (\hat {L} _ {\mathrm{ocr}}) \approx - 0. 1 8 1 7 \log (D) - 0. 7 0 1 1 \\ \log (\hat {L} _ {\mathrm{grounding}}) \approx - 0. 0 7 8 5 \log (D) - 0. 0 7 4 5. \end{array}
$$

> **停一下:** OCR 斜率 −0.1817 与 grounding 斜率 −0.0785 在训练 token 翻倍时各意味着什么?
> 式 (3) 在 log-log 空间里, 斜率就是幂律指数, 与对数底无关. token 翻倍时 OCR loss 乘以 2 的 −0.1817 次方, 约降 11.8%; grounding loss 乘以 2 的 −0.0785 次方, 约降 5.3%. 截距 −0.7011 和 −0.0745 则依赖对数底, 原文没写底, 不能拿截距反推绝对 loss. 两条拟合线都只覆盖阶段 1 (§3.3 第一段), 阶段 2 换了数据配比, 不在这条线上.

Beyond the scaling laws of training loss, our analysis reveals that the training loss achieved on specific data sub-categories can serve as a predictor for performance on related downstream tasks. We find that the relationship between a sub-category’s training loss and its corresponding downstream metric is approximately log-linear. However, it is important to note that such a log-linear relationship is likely sustainable only within a local neighborhood of performance values, as the range of typical evaluation metrics (e.g., accuracy, F1 score) is inherently bounded, usually between 0 and 1. As demonstrated in figure 3 (b) and (c), the top-1 accuracies on the ChartQA and InfographicVQA datasets show a clear correlation with the logarithm of the OCR training loss (log(loss<sub>OCR</sub>)), as captured by the following approximate linear models:
除了训练 loss 的 Scaling Laws, 我们的分析还显示, 特定数据子类别上达到的训练 loss 可以用来预测相关下游任务的表现. 我们发现子类别训练 loss 与对应下游指标的关系近似 log-linear. 但要注意, 这种 log-linear 关系可能只在局部性能区间内成立, 因为典型评测指标 (如准确率, F1) 天然有界, 通常在 0 到 1 之间. 如图 3 (b) 和 (c) 所示, ChartQA 和 InfographicVQA 上的 top-1 准确率与 OCR 训练 loss 的对数 (log(loss<sub>OCR</sub>)) 明显相关, 可用下面的近似线性模型刻画:

$$
\begin{array}{r} \mathrm{Acc} _ {\mathrm{ChartQA}} \approx - 0. 0 9 6 8 \log (\mathrm{loss} _ {\mathrm{ocr}}) + 0. 7 1 3 9 \\ \mathrm{Acc} _ {\mathrm{InfoVQA}} \approx - 0. 1 4 8 8 \log (\mathrm{loss} _ {\mathrm{ocr}}) + 0. 5 3 1 9 \end{array}
$$

> **再看:** 这两条 loss 到准确率的直线, 能外推到 RL 之后表 6 的 ChartQA 和 InfoVQA 分数吗?
> 不能. 图 3 注明这些指标是预训练后的分数, 与第 6 节 RL 之后的结果不可直接比较; §3.3 也说 log-linear 只在局部邻域成立, 因为准确率上界是 1. 按式中的斜率, log(loss) 每降 0.1, ChartQA 约涨 0.97 个百分点, InfoVQA 约涨 1.49 个百分点, 这只是阶段 1 内部监控用的尺子. 要问最终榜分, 回表 6.

Analogously, figure 3 (e) and (f) detail the estimated relationship between the model’s grounding loss during training and its performance on the RefCOCO evaluation benchmark. Performance prediction remains an active research area, and prior works have used a sigmoid function to model the relationship between LLM performance and loss [37, 151] or compute [101].
类似地, 图 3 (e) 和 (f) 给出训练中 grounding loss 与 RefCOCO 评测表现之间的估计关系. 性能预测仍是活跃的研究方向, 前人工作曾用 sigmoid 函数刻画 LLM 表现与 loss [37, 151] 或与算力 [101] 的关系.

## 4 Post-training 后训练

The post-training stage equips Seed1.5-VL with robust instruction-following and reasoning abilities through a combination of Supervised Fine-tuning (SFT) and Reinforcement Learning (RL). Depicted in figure 4, this begins with an SFT model trained on curated cold-start data. A crucial component is our data pipeline, continuously gathering hard and diverse prompts that feed into RL and improve SFT data via rejection sampling. Post-training proceeds iteratively: the SFT model is progressively enhanced by distilling the RL model’s learnings on diverse prompts. This iterative refinement continues until the prompt pool is exhausted and performance metrics converge. Ultimately, this process yields Seed1.5-VL, capable of generating both swift, succinct replies and in-depth responses featuring long Chain-of-Thought (LongCoT) reasoning [56]. We discuss details of each component in the following subsections.
后训练阶段通过 SFT 与强化学习 (RL) 的结合, 让 Seed1.5-VL 具备稳健的指令跟随和推理能力. 如图 4 所示, 流程从在整理过的冷启动数据上训练的 SFT 模型开始. 关键部件是数据管线: 它持续收集困难且多样的 prompt, 喂给 RL, 并通过拒绝采样改进 SFT 数据. 后训练迭代进行: 把 RL 模型在多样 prompt 上学到的东西蒸馏回 SFT 模型, 逐步增强. 这种迭代精炼一直进行到 prompt 池耗尽, 性能指标收敛. 最终得到的 Seed1.5-VL 既能给出快速简洁的回答, 也能给出带长 CoT (LongCoT) 推理 [56] 的深入回答. 下面各小节讨论各部件细节.

<!-- page 16 of 77 -->

### 4.1 Supervised Fine-tuning SFT

The Supervised Fine-tuning (SFT) stage is integral to equipping Seed1.5-VL with foundational instructionfollowing and reasoning capabilities prior to reinforcement learning. Our SFT dataset comprises two primary components targeting distinct capabilities. The first component, General Instruction data, trains Seed1.5-VL on diverse, complex instructions, emphasizing the generation of concise and accurate responses. The second, Long Chain-of-Thought (LongCoT) data, focuses on generating detailed, step-by-step reasoning. This data is generated via prompt engineering and rejection sampling (inspired by [134]), mainly using high-quality outputs from Seed1.5-VL; specifics are detailed in section 4.5. Besides, each data type is associated with a distinct system prompt, which allows users to dynamically toggle LongCoT reasoning during inference. The construction methodology for the SFT dataset and the specifics of Seed1.5-VL’s SFT training regimen are further elaborated in sections 4.1.1 and 4.1.2, respectively.
SFT 阶段是 Seed1.5-VL 在强化学习之前获得基础指令跟随与推理能力的关键环节. SFT 数据集由两部分组成, 各自瞄准不同能力. 第一部分是通用指令数据, 用多样复杂的指令训练 Seed1.5-VL, 强调生成简洁准确的回答. 第二部分是 LongCoT 数据, 侧重生成详细的逐步推理. 这部分数据通过 prompt 工程和拒绝采样 (受 [134] 启发) 生成, 主要用 Seed1.5-VL 自己的高质量输出, 细节见 4.5 节. 另外, 每种数据类型对应一个不同的 system prompt, 用户在推理时可以动态开关 LongCoT 推理. SFT 数据集的构建方法和训练方案分别在 4.1.1 与 4.1.2 节展开.

#### 4.1.1 SFT Data Construction SFT 数据构建

In the initial phase of SFT data construction, we aimed to equip the model with the ability to address a broad spectrum of application scenarios. To this end, we developed a model capability taxonomy informed by the classification of traditional visual tasks and the empirical application requirements of vision-language models. Guided by this taxonomy, we utilized crowdsourcing to collect images from the internet and generate approximately 13,000 high-quality instruction-tuning data, each comprising a prompt and a corresponding response. These initial responses were designed to exhibit strong alignment with human preferences.
SFT 数据构建的初期, 我们希望模型能应对广泛的应用场景. 为此, 我们参照传统视觉任务的分类和 VLM 的实际应用需求, 制定了一套模型能力分类体系. 在这套体系指导下, 我们用众包从互联网收集图像, 生成约 13,000 条高质量指令微调数据, 每条包含一个 prompt 和对应回答. 这些初始回答被设计为与人类偏好高度一致.

To further enhance the model’s performance, we incorporated an additional 30,000 high-quality data samples sourced from the research community. These samples were curated from our carefully collected open-source repository containing approximately 1.5 million entries. Initially, we utilized a proprietary image-text embedding model to cluster the image-text pairs into task-specific categories. This clustering enabled targeted downsampling, ensuring the dataset preserved a high degree of diversity across various tasks. Subsequently, we leveraged our trained SFT model, aligned with human preferences, to perform multiple roll-outs on this sampled subset. The generated responses were filtered by LLM-as-a-judge [177], which justifies the correctness of the model’s generated responses with the original ground truth as reference. On this basis, we further adopted the Reward Model (section 4.2.2) to screen out the responses that are most aligned with human preferences from the retained results, thus obtaining the final rejection sampling fine-tuning data [134]. Eventually, we compressed the amount of open-source data in the SFT data from 1.5 million to approximately 30,000 high-quality data. The other open-source data was used in the pre-training stage in advance.
为进一步提升模型表现, 我们又加入了来自研究社区的 30,000 条高质量样本. 它们从我们精心收集的约 1.5 million 条开源数据库中筛出. 首先用一个自有图文嵌入模型把图文对聚成按任务划分的类别, 这样可以有针对性地降采样, 保证数据集在各任务间保持高多样性. 随后用已与人类偏好对齐的 SFT 模型在采样子集上做多次 roll-out. 生成的回答经 LLM-as-a-judge [177] 过滤, 它以原始标准答案为参照判定回答是否正确. 在此基础上, 再用奖励模型 (4.2.2 节) 从保留结果中筛出最符合人类偏好的回答, 得到最终的拒绝采样微调数据 [134]. 最终, SFT 数据中的开源数据从 1.5 million 压到约 30,000 条高质量数据. 其余开源数据提前用在了预训练阶段.

Building upon the enhanced capabilities acquired during pre-training, including complex chart understanding, STEM-related reasoning, grounding, and 3D perception, and video analysis, we iteratively increased the complexity of our fine-tuning data and instructions. This involved reducing the proportion of simple prompts readily solvable with individual capabilities and introducing more challenging questions that previously exposed limitations in the pre-trained model. Leveraging a self-instruct methodology [143], we synthesized novel complex prompts and their corresponding model responses by combining multiple simpler prompts according to various logical structures. Responses generated through self-instruct and rejection sampling underwent a manual secondary verification process to identify and rectify errors. Compared to direct human annotation, this approach of refining model-generated responses significantly improves human annotation efficiency. Moreover, it enables the exclusion of data exceeding the model’s current capacity, thereby mitigating the risk of hallucinations.
基于预训练获得的增强能力 (复杂图表理解, STEM 推理, grounding, 3D 感知和视频分析), 我们逐步提高微调数据与指令的复杂度. 做法是降低单一能力就能轻松解决的简单 prompt 比例, 引入此前暴露过预训练模型短板的更难问题. 借助 self-instruct 方法 [143], 我们按多种逻辑结构组合多个简单 prompt, 合成新的复杂 prompt 及对应模型回答. 经 self-instruct 和拒绝采样生成的回答再经人工二次核验, 找出并纠正错误. 与直接人工标注相比, 修订模型生成回答的方式明显提升标注效率. 它还能排除超出模型当前能力的数据, 降低幻觉风险.

#### 4.1.2 Training Recipe 训练配方

For the SFT stage, we assembled a concise and high-quality dataset comprising approximately 50,000 samples. This multimodal SFT data was integrated with an in-house text-only SFT dataset. Together with the Long Chain-of-Thought (LongCoT) SFT data, as described in section 4.5, this combined corpus was used for training over two epochs. During SFT, the vision encoder’s parameters were frozen, while all other model parameters remained trainable. The training was conducted with a sequence length of 131,072 tokens and a batch size equivalent to 16 times the sequence length. We utilized the AdamW optimizer [64] for training, with hyperparameters set to $\beta _ { 1 } = 0 . 9 ,   \beta _ { 2 } = 0 . 9 5$ , and a weight decay of 0.1. The training process included a
SFT 阶段我们整理了约 50,000 条样本的精简高质量数据集. 这份多模态 SFT 数据与内部纯文本 SFT 数据集合并, 再加上 4.5 节所述的 LongCoT SFT 数据, 合并后的语料训练两个 epoch. SFT 期间冻结视觉编码器参数, 其余参数都可训练. 训练序列长度为 131,072 token, batch 大小相当于序列长度的 16 倍. 用 AdamW 优化器 [64], 超参 $\beta _ { 1 } = 0 . 9 ,   \beta _ { 2 } = 0 . 9 5$ , weight decay 为 0.1. 训练过程包括

> **对一下:** 13,000 + 30,000 与这里的 「约 50,000」 能对上吗?
> 对不严丝合缝. §4.1.1 给出两块: 众包约 13,000 条, 开源筛出约 30,000 条, 合计约 43,000; 第三块是 §4.1.1 末段 self-instruct 合成的复杂 prompt, 原文没给条数, 差额大概落在这里. 50,000 只是多模态通用指令部分, 还要加内部纯文本 SFT 和 §4.5 的 LongCoT 数据, 这两块的量原文都没披露. 另一个分母: batch 是 16 × 131,072, 约 2.1M token, 按 token 计.

<!-- page 17 of 77 -->

warm-up phase spanning 10% of the total steps, after which the learning rate decayed from a peak value of $2 \times 1 0 ^ { - 5 } \mathrm { t o } 2 \times 1 0 ^ { - 6 }$ following a cosine decay schedule.
占总步数 10% 的预热阶段, 之后学习率按余弦调度从峰值 2 × 10^-5 衰减到 2 × 10^-6.

### 4.2 Reinforcement Learning from Human Feedback 基于人类反馈的强化学习

To further boost both human evaluation performance and multimodal understanding capabilities, we conduct reinforcement learning from human feedback (RLHF) [180], which involves preference data collection, reward model training, and optimization with reinforcement algorithms.
为进一步提升人类评测表现和多模态理解能力, 我们做基于人类反馈的强化学习 (RLHF) [180], 包括偏好数据收集, 奖励模型训练和用强化学习算法优化.

#### 4.2.1 Preference Data 偏好数据

To train the reward model, we collect list-wise multimodal preference datasets for reward modeling through human annotation and heuristic synthesis.
为训练奖励模型, 我们通过人工标注和启发式合成收集 list-wise 多模态偏好数据集.

**Human annotations.** The human-annotated preference data involves comparing several candidate model responses using a 5-scale rating system. The prompts for generating preference data cover all general visual understanding abilities, and maintain a balanced scale across all abilities. We utilize the current top-performing in-house models to randomly sample responses through nucleus sampling [47]. To ensure the diversity of responses, we apply filtering techniques—such as editing distance, semantic similarity, and length-balancing strategies—prior to selecting responses for human annotation. Beyond ranking the responses by quality, we instruct human annotators to select one model response that requires minimal editing to correct or improve its quality, which further compensates for the lack of diversity in the limited response sampling. Annotators are also tasked with identifying and highlighting issues within the responses—such as hallucinations, helpfulness, informativeness, etc.—and providing detailed explanations for these issues. To further enhance the efficiency of the annotation process, we employ the latest reward models to pre-annotate the rankings, offering initial guidance for human annotators. This approach not only streamlines the annotation workflow but also ensures more consistent and objective evaluations.
**人工标注.** 人工标注的偏好数据用 5 分制对比多个候选回答. 生成偏好数据的 prompt 覆盖全部通用视觉理解能力, 并在各能力间保持均衡. 我们用当前表现最好的内部模型通过 nucleus sampling [47] 随机采样回答. 为保证回答多样, 在交给人工标注前先用编辑距离, 语义相似度, 长度均衡等策略过滤. 除了按质量给回答排序, 我们还让标注员挑出一条只需最少编辑就能改对或改好的回答, 以弥补有限采样带来的多样性不足. 标注员还要找出并标明回答中的问题 (如幻觉, 帮助性, 信息量等), 并给出详细解释. 为提升标注效率, 我们用最新的奖励模型预标排序, 给标注员提供初步参考. 这既简化了标注流程, 也让评估更一致, 更客观.

**Synthetic data.** While some recent approaches [172, 179] have used deliberate error introduction to synthesize preference pairs, multiple studies [4, 75, 162] demonstrate that such synthetic data often fails to generalize effectively, as the reward model tends to learn the inherent patterns between edited and original responses. Instead, we aggregate a diverse set of multimodal prompts with clear ground-truths, while implementing format constraints such as “Final Answer:”. For each prompt, we generate model responses K times and use existing vision-language models to evaluate their correctness and adherence to format based on the ground-truth. Consequently, we establish list-wise preferences with clear rankings: correct responses with well-defined formats rank highest, followed by incorrect responses with well-defined formats, and lastly, incorrect responses that do not follow the format. Additionally, we follow FeedQuill [162] to generate image captioning preference pairs, which helps in reducing hallucinations. All the synthetic preference data is refined using preference strength following [137].
**合成数据.** 近期有方法 [172, 179] 通过刻意引入错误来合成偏好对, 但多项研究 [4, 75, 162] 表明这类合成数据往往泛化不好, 因为奖励模型会学到编辑版与原版回答之间的固有模式. 我们改为汇集一批有明确标准答案的多样多模态 prompt, 同时施加 「Final Answer:」 之类的格式约束. 对每个 prompt 生成 K 次模型回答, 用现有 VLM 依据标准答案评判正确性和格式遵循. 由此建立排序清楚的 list-wise 偏好: 格式规范且正确的回答排最高, 其次是格式规范但错误的回答, 最后是错误且不守格式的回答. 另外, 我们按 FeedQuill [162] 生成图像描述偏好对, 有助于减少幻觉. 所有合成偏好数据都按 [137] 的偏好强度做了精炼.

#### 4.2.2 VLM as a Reward Model VLM 作奖励模型

We initialize the reward model with an instruction-tuned VLM. Then, following [86, 120] we prompt the model $\pi _ { \phi }$ to act as a generative classifier that directly outputs answer indicator token Î regarding the preference between two responses, y1 and $y _ { 2 } ,$ given the prompt x. This process can be formulated as $\hat { I } \sim \pi _ { \phi } ( I | x , y _ { 1 } , y _ { 2 } )$
我们用一个指令微调过的 VLM 初始化奖励模型. 然后按 [86, 120] 的做法, 让模型 $\pi _ { \phi }$ 充当生成式分类器, 在给定 prompt x 时, 直接输出表示两条回答 y1 与 y2 谁更好的答案指示 token Î. 这一过程可写成 $\hat { I } \sim \pi _ { \phi } ( I | x , y _ { 1 } , y _ { 2 } )$

We find that this approach yields a more robust and superior reward model compared to traditional Bradley-Terry reward modeling [100] due to its direct handling of token probabilities and response comparisons. To mitigate the potential positional bias inherent in vision-language models [176], we compute the probabilities for both possible orderings of the responses, i.e., both $( x , y _ { 1 } , y _ { 2 } )$ and $( x , y _ { 2 } , y _ { 1 } )$ . This ensures that the model’s preference judgment is fair and not affected by the order in which responses are presented. Additionally, during training, we apply an iterative learning strategy to maintain the consistency of annotation principles as standards evolve. This strategy involves continuously updating the training data and annotation guidelines to reflect the most current and accurate criteria. By doing so, we ensure that the reward model remains reliable and adaptable to changing requirements. This approach helps in improving the generalization capability of the model and maintaining high-quality performance over time.
我们发现, 与传统 Bradley-Terry 奖励建模 [100] 相比, 这种方法直接处理 token 概率和回答比较, 得到的奖励模型更稳健也更好. 为缓解 VLM 固有的位置偏置 [176], 我们对两种回答顺序都计算概率, 即 $( x , y _ { 1 } , y _ { 2 } )$ 和 $( x , y _ { 2 } , y _ { 1 } )$ . 这保证模型的偏好判断公平, 不受回答呈现顺序影响. 此外, 训练中采用迭代学习策略, 在标准演进时保持标注原则的一致. 这一策略持续更新训练数据和标注指南, 反映最新, 最准确的标准. 这样奖励模型能保持可靠, 并适应变化的需求. 这种方法有助于提升模型的泛化能力, 长期维持高质量表现.

<!-- page 18 of 77 -->

#### 4.2.3 Data Curation for Reinforcement Learning 强化学习的数据整理

Our online reinforcement learning implementation employs a variant of the Proximal Policy Optimization (PPO) algorithm [155]. In this approach, the reward signal is derived from the probability assigned by a reward model to the generated answer tokens. In addition, the ground truth response or the best-of-N responses from an SFT model are given as the reference answer to the reward model during PPO training.
我们的在线强化学习实现采用近端策略优化 (PPO) 算法 [155] 的一个变体. 其中奖励信号取自奖励模型赋给生成答案 token 的概率. 此外, PPO 训练中把标准答案或 SFT 模型的 best-of-N 回答作为参考答案提供给奖励模型.

Prompts utilized for RL training were derived from the preference dataset. It was observed that the coverage of the prompt distribution critically influences RL performance. Consequently, our data collection strategy aimed to mirror the distribution of the preference data. However, the collected prompts demonstrated significant heterogeneity in quality, characterized by highly skewed distributions across both task difficulty and ability categories. To address these issues, a multi-stage data refinement pipeline was implemented. Initially, a tagging model was trained to assign capability category labels to prompts, followed by stratified sampling to ensure a balanced representation across different ability categories. Subsequently, for each prompt, K responses were generated using state-of-the-art internal models and evaluated using the most recent iteration of our reward model. A filtering criterion was applied based on the reward score variance: prompts where the difference between the maximum and mean reward across the K responses fell below a predefined threshold were excluded. This step ensures the retention of prompts for which the reward model exhibits significant discriminative capability. Finally, during the initial phases of RL training, prompts exhibiting rapid concurrent increase in both reward and KL divergence, indicative of lower task difficulty, were subject to downsampling.
RL 训练所用 prompt 来自偏好数据集. 我们观察到 prompt 分布的覆盖面对 RL 表现影响很大. 因此数据收集策略力求贴近偏好数据的分布. 但收集到的 prompt 质量差异很大, 在任务难度和能力类别上都高度偏斜. 为此我们实施了多阶段数据精炼管线. 首先训练一个打标签模型给 prompt 分配能力类别标签, 再分层采样, 保证各能力类别均衡. 随后, 对每个 prompt 用最先进的内部模型生成 K 个回答, 用最新一版奖励模型打分. 按奖励分数的离散程度过滤: 若 K 个回答中最高奖励与平均奖励之差低于预设阈值, 就排除该 prompt. 这一步保留奖励模型有明显区分能力的 prompt. 最后, 在 RL 训练初期, 奖励和 KL 散度同时快速上升的 prompt (表明任务难度较低) 会被降采样.

### 4.3 Reinforcement Learning with Verifiable Rewards 基于可验证奖励的强化学习

In addition to human feedback, Reinforcement Learning with Verifiable Rewards (RLVR) [68] emerges as an efficient training method for various tasks [39, 69], such as mathematical reasoning and coding where we simply use answer matching or constraint verification to train the model, instead of leveraging model-based reward estimation. In this section, we design several visual tasks whose final solutions can be precisely verified by rules or external executors, which will later be incorporated into the RLVR training.
除人类反馈外, 基于可验证奖励的强化学习 (RLVR) [68] 已成为多类任务 [39, 69] 的高效训练方法, 如数学推理和代码, 这类任务只需答案匹配或约束验证就能训练模型, 无需基于模型的奖励估计. 本节我们设计几类视觉任务, 其最终解可由规则或外部执行器精确验证, 之后纳入 RLVR 训练.

#### 4.3.1 Visual STEM 视觉 STEM

STEM (science, technology, engineering, and mathematics) questions usually have unique and verifiable answers, which are suitable for RLVR. We collect over one million problems with images in STEM fields, mostly on mathematics, from both open-sourced resources [85] and internal K-12 education collections.
STEM (科学, 技术, 工程与数学) 题目通常有唯一且可验证的答案, 适合 RLVR. 我们从开源资源 [85] 和内部 K-12 教育题库收集了一百万道以上带图 STEM 题, 多数是数学.

To prepare the training data, multiple-choice questions were initially transformed into an open-ended format by removing the choices, thus forcing the model to generate the correct answer’s content and preventing random guessing. Subsequently, difficult questions were selected via rejection sampling based on the performance of the SFT model. We carefully remove questions that can be answered by text only or text and captions, ensuring shortcuts on text or superficial visual elements will not be reinforced in RL. Specifically, 16 responses were generated per question, and questions achieving either 0% or greater than 75% accuracy with the SFT model were discarded. This filtering isolates challenging prompts (0% < accuracy ≤ 75%) appropriate for RLVR exploration while removing potentially erroneous or trivial questions. Lastly, a preamble instruction was prepended to prompts, instructing the model to format the final answer using designated LaTeX identifiers (e.g., \boxed{answer}) to enable straightforward automated extraction.
准备训练数据时, 先把选择题去掉选项改成开放式, 逼模型生成正确答案的内容, 防止随机蒙. 随后按 SFT 模型的表现用拒绝采样挑出难题. 我们仔细去掉仅凭文本或文本加描述就能答的题, 保证 RL 不会强化依赖文本或表层视觉元素的捷径. 具体来说, 每题生成 16 个回答, SFT 模型准确率为 0% 或大于 75% 的题被丢弃. 这一过滤筛出适合 RLVR 探索的难题 (0% < accuracy ≤ 75%), 同时去掉可能有错或过于简单的题. 最后, 在 prompt 前加一段前置指令, 要求模型用指定的 LaTeX 标识 (如 \boxed{answer}) 写出最终答案, 便于自动抽取.

> **想:** 16 次采样下 「0% < accuracy ≤ 75%」 实际保留哪些题?
> 16 次里答对 1 到 12 次的题. 答对 0 次被当成可能题目有错或太难而丢, 答对 13 次以上被当成太简单丢. 下界只要 1/16 就留, 意味着 SFT 模型偶尔蒙中的题也进 RLVR, 这正是 §4.4 里 verifier prompt 要采 4 或 8 次的原因: 采样少了, 这类题在一个 episode 里大概率全错, 优势信号为零.

Our STEM verifier transforms the predicted answers into a sympy expression and matches it with ground truths. To ensure the accuracy of our verifier, we also remove prompts that contain multiple questions or whose ground truths are complex phrases.
我们的 STEM 验证器把预测答案转成 sympy 表达式, 与标准答案匹配. 为保证验证器准确, 我们还去掉包含多个小问或标准答案是复杂短语的 prompt.

#### 4.3.2 Visual Perception and Reasoning 视觉感知与推理

Verifier feedback can also be collected from various visual tasks to enhance the perception and reasoning capabilities of VLMs. Here we present some early explorations on grounding, visual puzzles, and perceptionrelated games.
验证器反馈也可以从各种视觉任务中收集, 用来增强 VLM 的感知与推理能力. 这里介绍在 grounding, 视觉谜题和感知类游戏上的一些早期探索.

<!-- page 19 of 77 -->

**Grounding.** The grounding task aims to evaluate a model’s ability to accurately associate (“ground”) textual descriptions with corresponding visual elements within an input image. For easier answer extraction, we add an instruction in the prompt to encourage the model to output the predicted bounding boxes enclosed between &lt;bbox&gt; and &lt;/bbox&gt; tokens. The reward is computed as the intersection over union (IoU) between the predicted bounding box and the ground-truth one. We also optimize for pointing capability in a similar way and put the object’ center point position between &lt;point&gt; and &lt;/point&gt;.
**Grounding.** grounding 任务评估模型把文字描述与输入图像中对应视觉元素准确关联 (「ground」) 的能力. 为便于抽取答案, 我们在 prompt 里加指令, 鼓励模型把预测边界框写在 &lt;bbox&gt; 与 &lt;/bbox&gt; token 之间. 奖励取预测框与标准框的交并比 (IoU). 我们也用类似方式优化指点能力, 把物体中心点位置写在 &lt;point&gt; 与 &lt;/point&gt; 之间.

**Visual Instruction Following.** Instruction-following capabilities can be improved with synthetic data and rule-based verifiers [25, 161]. Following this idea, we synthesize diverse visual instructions whose outcomes can be verified by corresponding regular expressions to further enhance visual instruction-following capabilities.
**视觉指令跟随.** 指令跟随能力可以用合成数据和基于规则的验证器提升 [25, 161]. 按这一思路, 我们合成多样的视觉指令, 其结果可由对应正则表达式验证, 进一步增强视觉指令跟随能力.

**Visual Puzzles & Games.** Visual puzzles are tasks that require the model to gather information from a visual scene and apply reasoning techniques such as abstract reasoning, inductive reasoning, and deductive reasoning. Similar to [18, 132], we synthesize over 20k visual puzzles and their corresponding solutions for RLVR. We carefully decontaminate our synthetic training data with existing visual puzzle benchmarks, such as PuzzleVQA [18]. We also involve puzzles in graph reasoning [146] and pattern identification. Similar to the STEM verifier, we prompt models to enclose final answers of puzzles in \boxed{answer} and verify the prediction through a string matching algorithm.
**视觉谜题与游戏.** 视觉谜题要求模型从视觉场景收集信息, 运用抽象推理, 归纳推理和演绎推理等技巧. 与 [18, 132] 类似, 我们为 RLVR 合成了 20k 以上视觉谜题及其解答. 我们仔细对照 PuzzleVQA [18] 等现有视觉谜题基准给合成训练数据去污染. 我们还纳入图推理 [146] 和模式识别类谜题. 与 STEM 验证器类似, 我们让模型把谜题最终答案写进 \boxed{answer}, 用字符串匹配算法验证预测.

Beyond generating natural language responses, we are exploring VLM output formats that enable direct interaction with or manipulation of image content, aiming to facilitate broader VLM applications through more intuitive and engaging interactions. Imagine, for example, AI-enhanced glasses overlaying a navigation route directly onto the user’s view, rather than relying solely on text or speech—a potentially more intuitive approach. As an initial step towards developing these interactive capabilities, we focus on visual games, which are suitable testbeds because they require strong perceptual skills and have clearly verifiable outcomes indicating success. Specifically, we target the “Spot the Differences” game, tasking the model with identifying discrepancies between two images. Crucially, the model must not only explain these differences using natural language but also output bounding boxes that precisely localize the differing regions directly on the image. We train this capability using synthetically generated data employing two methods: (1) We take images from open-sourced datasets, randomly mask segments, use a diffusion model for inpainting (see figure 5 for an example), and then filter out pairs where the inpainted content is too similar to the original; (2) To ensure the model perceives subtle differences like line width or object size, we generate additional image pairs by systematically modifying SVG properties from open-sourced datasets.
除了生成自然语言回答, 我们也在探索能直接与图像内容交互或操纵图像内容的 VLM 输出格式, 希望通过更直观, 更有吸引力的交互拓宽 VLM 应用. 比如设想 AI 眼镜直接把导航路线叠加到用户视野上, 而不只靠文字或语音, 这可能更直观. 作为发展这类交互能力的第一步, 我们聚焦视觉游戏, 它们是合适的试验场: 需要很强的感知能力, 且有清楚可验证的成败结果. 具体来说, 我们瞄准 「找不同」 游戏, 让模型找出两张图之间的差异. 关键在于, 模型不仅要用自然语言解释差异, 还要输出在图上精确框出差异区域的边界框. 我们用两种方法合成训练数据: (1) 从开源数据集取图, 随机遮掉部分区域, 用扩散模型补画 (示例见图 5), 再滤掉补画内容与原图过于相似的图对; (2) 为让模型察觉线宽或物体大小这类细微差异, 我们系统修改开源数据集中的 SVG 属性, 生成额外图对.

![Image block](images/p19-figure-5-an-example-of-a-synthesized-image-pair-used.png)

Figure 5 An example of a synthesized image pair used for training the “Spot the Differences” game, with the differences highlighted by red boxes in the left image.
图 5 用于训练 「找不同」 游戏的一组合成图对示例, 差异在左图中用红框标出.

### 4.4 Hybrid Reinforcement Learning 混合强化学习

The Seed1.5-VL model is trained utilizing a hybrid RL framework derived from a variant of the PPO algorithm. This framework incorporates a generative RM, as detailed in [156], and integrates several advancements and
Seed1.5-VL 用一个源自 PPO 变体的混合 RL 框架训练. 该框架包含 [156] 所述的生成式 RM, 并融合了若干进展和

<!-- page 20 of 77 -->

exploration techniques from recent RL research [121, 165, 167, 170]. Specifically, our training is a combination of RLHF and RLVR. We present more detailed implementations as follows:
近期 RL 研究 [121, 165, 167, 170] 中的探索技巧. 具体来说, 训练是 RLHF 与 RLVR 的组合. 下面给出更详细的实现:

**Format reward.** We predefine a response format of &lt;think&gt;{thought}&lt;/think&gt;{solution} to ensure models provide comprehensive thoughts before giving the final solution. We set rewards to zero if the model’s responses do not comply with this format. We also apply penalties if responses fail to follow format requirements for different verifiers in various tasks.
**格式奖励.** 我们预定义回答格式 &lt;think&gt;{thought}&lt;/think&gt;{solution}, 保证模型在给出最终解之前先给出完整思考. 若回答不符合该格式, 奖励置零. 若回答没满足各任务中不同验证器的格式要求, 也会施加惩罚.

**Hybrid reward.** Our training prompts are categorized into general and verifiable prompts based on tasks, rewarded with RM and the verifier, respectively. Prompts are randomly shuffled in each epoch. So, general and verifiable prompts are mixed in each batch. We truncate the thought and only keep the solution in response to the reward model. Therefore, RM will ignore the CoT thought and only focus on providing rewards for the final solution. Such modification can ease constraints on thoughts and encourage models to explore more effective CoT thoughts.
**混合奖励.** 训练 prompt 按任务分为通用 prompt 和可验证 prompt, 分别由 RM 和验证器给奖励. 每个 epoch 随机打乱 prompt, 所以每个 batch 里通用与可验证 prompt 混在一起. 送给奖励模型时, 我们截掉思考部分, 只保留回答中的解. 因此 RM 会忽略 CoT 思考, 只对最终解给奖励. 这一改动放松了对思考过程的约束, 鼓励模型探索更有效的 CoT.

**Shared critic.** A single critic model architecture is employed to estimate the value function corresponding to both reward sources (i.e., the reward model and verifiers). This unified approach is viable due to both reward signals operating within the same normalized range of [0, 1]. Specifically, the reward model inherently generates outputs within this interval, while the outcomes derived from all verifiers are explicitly scaled to conform to the same [0, 1] range. The critic model’s parameters are initialized using the weights of the pre-trained reward model. Subsequently, the critic undergoes an initial warm-up phase consisting of 100 training steps, utilizing trajectory data (rollouts) generated by the SFT model.
**共享 critic.** 用单个 critic 模型估计两类奖励源 (奖励模型和验证器) 对应的价值函数. 这种统一做法可行, 因为两类奖励信号都在同一归一化区间 [0, 1] 内: 奖励模型的输出天然在这个区间, 所有验证器的结果也显式映射到 [0, 1]. critic 参数用预训练奖励模型的权重初始化. 随后 critic 先经过 100 个训练步的预热, 使用 SFT 模型生成的轨迹数据 (rollouts).

> **问:** 共享 critic 的前提是两路奖励都在 [0, 1], 但分布形状一样吗?
> 不一样. 验证器奖励基本是离散的 0 或 1 (IoU 奖励例外, 是连续值), RM 奖励是 「答案指示 token 的概率」 (§4.2.3), 连续且常集中在中间. §4.4 只论证了值域相同, 没讨论分布差异; 同一个 critic 要同时拟合两种形状, 靠的是 prompt 类型本身可从输入分辨. 另外 critic 用 RM 权重初始化, 天然更熟悉通用 prompt, 这也是它要先用 SFT rollouts 预热 100 步的一个理由.

**KL coefficients.** We employ distinct KL divergence coefficients for general and verifiable prompts. Specifically, a coefficient of $1 \times 1 0 ^ { - 5 }$ is applied to general prompts, while a coefficient of 0 is used for verifiable prompts. The application of a small KL coefficient for general prompts serves to mitigate potential reward hacking. Conversely, training verifiable tasks without a KL divergence term facilitates greater exploratory capacity for the model.
**KL 系数.** 通用 prompt 和可验证 prompt 用不同的 KL 散度系数. 通用 prompt 用 1 × 10^-5, 可验证 prompt 用 0. 通用 prompt 上的小 KL 系数用于缓解潜在的 reward hacking. 反过来, 训练可验证任务时不加 KL 项, 给模型更大的探索空间.

**Training recipe.** The context length and max output length of hybrid RL training are 8,192 and 16,384, respectively. We sample 4,096 roll-outs in each episode. For training updates, we use a mini-batch size of 512 samples, performing 8 gradient steps per episode. PPO clip range for the training is 0.2. Learning rates for the actor and critic are $6 \times 1 0 ^ { - 7 }$ and $7 . 5 \times 1 0 ^ { - 7 }$ , respectively. The number of roll-outs is different for each prompt, as harder prompts need more comprehensive exploration. We only sample once for each prompt rewarded by the reward model, while sampling 4 or 8 times for the counterpart rewarded by verifiers. Noticeably, although we only train Seed1.5-VL with LongCoT responses in the RL stage, we still witness a significant improvement in regular responses without extended reasoning.
**训练配方.** 混合 RL 训练的上下文长度和最大输出长度分别为 8,192 和 16,384. 每个 episode 采样 4,096 条 roll-out. 训练更新用 512 条样本的 mini-batch, 每个 episode 做 8 个梯度步. PPO clip 范围为 0.2. actor 与 critic 的学习率分别为 6 × 10^-7 和 7.5 × 10^-7. 每个 prompt 的 roll-out 数不同, 因为难 prompt 需要更充分的探索: 由奖励模型打分的 prompt 只采 1 次, 由验证器打分的采 4 或 8 次. 值得注意的是, 尽管 RL 阶段只用 LongCoT 回答训练 Seed1.5-VL, 不带长推理的常规回答也明显变好.

### 4.5 Iterative Update by Rejection Sampling Fine-tuning 拒绝采样微调迭代更新

In this work, we employ an iterative training strategy to enhance Seed1.5-VL during the RL stage. The process commences with a cold-start SFT model for LongCoT, initially trained on a limited number of low-quality LongCoT samples generated via in-context prompting of the base model with a small set of hand-annotated examples. Observing that a stronger cold-start SFT naturally leads to a stronger final model after LongCoT RL, we adopt a rejection sampling fine-tuning approach to obtain an improved starting point. Specifically, following the release of each iteration of the LongCoT RL model, we gather additional challenging prompts through our data pipeline and evaluate the latest RL model on these prompts. Correctly answered responses are then collected, in the vein of rejection sampling, and incorporated into the data for the subsequent SFT release. The same verifiers used in the RL phase are utilized to confirm the correctness of these responses. Furthermore, we implement manually crafted regular expression-based filters to remove undesirable patterns such as infinite repetition, overthinking, and other linguistic artifacts. The current iteration of Seed1.5-VL has undergone four such rounds of iteration, demonstrating consistent improvements, and this iterative refinement is expected to further enhance its performance.
本文在 RL 阶段采用迭代训练策略增强 Seed1.5-VL. 流程从 LongCoT 的冷启动 SFT 模型开始, 它最初只用少量低质量 LongCoT 样本训练, 这些样本是用一小组人工标注样例对基座模型做 in-context prompting 生成的. 我们观察到冷启动 SFT 越强, LongCoT RL 之后的最终模型也越强, 于是采用拒绝采样微调获得更好的起点. 具体来说, 每发布一版 LongCoT RL 模型, 我们就通过数据管线收集更多难 prompt, 在这些 prompt 上评测最新 RL 模型. 答对的回答按拒绝采样的思路收集起来, 并入下一版 SFT 的数据. 用 RL 阶段相同的验证器确认这些回答的正确性. 此外, 我们用手写的正则过滤器去掉不良模式, 如无限重复, 过度思考和其他语言瑕疵. 当前版本的 Seed1.5-VL 已经历四轮这样的迭代, 表现持续提升, 预计这种迭代精炼还会继续提升表现.

<!-- page 21 of 77 -->

## 5 Training Infrastructure 训练基础设施

### 5.1 Large-Scale Pre-training 大规模预训练

To accelerate and stabilize pretraining, we have developed a number of training optimizations, including hybrid parallelism, workload balancing, parallelism-aware data loading and robust training. We also apply high-performance attention kernels for context parallelism, selective activation checkpointing and offloading, kernel fusion, and fine-grained communication overlapping [13, 173]. The pretraining phase consumes 1.3 million GPU hours in total<sup>2</sup>.
为加速并稳定预训练, 我们开发了多项训练优化, 包括混合并行, 负载均衡, 并行感知数据加载和稳健训练. 我们还使用面向上下文并行的高性能注意力 kernel, 选择性激活检查点与 offloading, kernel fusion 和细粒度通信重叠 [13, 173]. 预训练阶段共消耗 1.3 million GPU 小时.

#### 5.1.1 Hybrid Parallelism 混合并行

Training a VLM model faces unique challenges due to the heterogeneity of both the data, which consists of visual data and natural language data, and the model, which consists of a small vision encoder and a significantly larger language model. Existing training frameworks are primarily designed for sequential unimodal tasks and fall short in VLM training. They either treat the encoder as preprocessing for the LLM’s data, or completely disaggregate the encoder from the LLM, leading to imbalanced workloads, prolonged device stalls and poor scalability. To tackle these challenges, we develop a hybrid parallelism approach [30] that parallelizes the vision encoder and the language model differently. For the vision encoder and the MLP adaptor, we leverage ZeRO data parallelism [109], while for the language model, we use standard 4-D parallelism, which combines expert parallelism [65, 123], interleaved pipeline parallelism [50, 93, 94], ZeRO-1 data parallelism [109] and context parallelism [77] for context extension. We separate the parallelism strategies for the encoder/adaptor and the LLM for efficiency and simplicity–it is challenging to integrate the encoder and the adaptor into 4-D parallelism without introducing pipeline-level imbalance. Our hybrid parallelism is simple and efficient, significantly accelerating training with minimal changes to model code.
训练 VLM 面临独特难题, 因为数据异构 (视觉数据与自然语言数据), 模型也异构 (小视觉编码器加大得多的语言模型). 现有训练框架主要为顺序式单模态任务设计, 在 VLM 训练上力不从心. 它们要么把编码器当作 LLM 数据的预处理, 要么把编码器与 LLM 完全拆开, 导致负载不均, 设备长时间停顿, 扩展性差. 为此我们开发了一种混合并行方法 [30], 对视觉编码器和语言模型采用不同的并行方式. 视觉编码器和 MLP adaptor 用 ZeRO 数据并行 [109]; 语言模型用标准 4-D 并行, 组合专家并行 [65, 123], 交错流水线并行 [50, 93, 94], ZeRO-1 数据并行 [109] 以及用于上下文扩展的上下文并行 [77]. 为效率和简洁, 我们把编码器/adaptor 与 LLM 的并行策略分开: 把编码器和 adaptor 并入 4-D 并行而不引入流水线级不平衡很难. 我们的混合并行简单高效, 只需对模型代码做极少改动就能明显加速训练.

> **核对:** 视觉编码器走纯 ZeRO 数据并行, 它产出的视觉 token 怎么交给切在流水线上的 LLM?
> §5.1.1 只给了分工: Seed-ViT 与 MLP adaptor 在所有 GPU 上做数据并行, LLM 用专家并行, 交错流水线并行, ZeRO-1 数据并行加上下文并行. 532M 的 ViT 相对 20B 激活的 LLM 很小, 放进流水线某一级会让那一级明显更重, 所以单独拿出来. 视觉特征与 LLM 序列如何对接, 原文没写交接细节; 能确定的是 §5.1.3 的配套: 每张 GPU 只处理自己那份图像, 多余图像在进 GPU 前就被滤掉, 以减少 PCIe 流量.

#### 5.1.2 Workload Balancing 负载均衡

Vision samples contain a varying number of images, causing computation imbalance among GPUs. We adopt a classical greedy algorithm to redistribute the vision data to achieve load balancing for the vision encoder and adaptor. Firstly, we sort the images in descending order according to their computation intensity, which is defined as the number of floating-point operations (FLOPS) needed to process each image. Secondly, we scan these images in the sorted order, and assign each image to the GPU with the lowest total computation intensity. Additionally, we leverage group-wise balancing to reduce data redistribution overhead. Instead of balancing vision data across all GPUs, we divide them into evenly sized groups and only balance vision data within each group only. Empirically, we set the group size to 128-256 GPUs.
视觉样本包含的图像数不一, 导致 GPU 间计算不均. 我们采用经典贪心算法重分配视觉数据, 实现视觉编码器和 adaptor 的负载均衡. 首先按计算强度 (定义为处理每张图所需的浮点运算次数 FLOPS) 把图像降序排序. 其次按排序顺序扫描图像, 把每张图分给当前总计算强度最低的 GPU. 此外, 我们用分组均衡降低数据重分配开销: 不在全部 GPU 间均衡视觉数据, 而是把 GPU 分成大小相等的组, 只在组内均衡. 经验上组大小设为 128-256 张 GPU.

#### 5.1.3 Parallelism-Aware Data Loading 并行感知数据加载

To reduce multimodal data IO overhead, we have also built a parallelism-aware data loader. For example, GPUs within non-data-parallel groups are expected to consume the same set of training samples. Redundantly reading the same data from the distributed file system can significantly amplify data read and preprocessing overhead, slowing down microbatch readinesss. We address this problem using a parallelism-aware data loader. For example, only one GPU within a PP group loads the data while the other PP ranks receive the necessary metadata from it via broadcast. Additionally, since we use pure data parallelism for the vision encoder, each GPU only processes a portion of the loaded image data. We filter out unnecessary images before moving training batches to the GPU, reducing PCIe traffic. To hide these data broadcast and transfer costs, we use a prefetcher to ensure IO and computation fully overlap.
为降低多模态数据 IO 开销, 我们还构建了并行感知数据加载器. 例如, 非数据并行组内的 GPU 应消费同一组训练样本. 从分布式文件系统重复读取同一份数据会大幅放大读取和预处理开销, 拖慢 microbatch 就绪. 我们用并行感知数据加载器解决这一问题. 例如, PP 组内只有一张 GPU 加载数据, 其他 PP rank 通过广播从它那里接收所需元数据. 另外, 由于视觉编码器用纯数据并行, 每张 GPU 只处理加载图像的一部分. 我们在把训练 batch 移到 GPU 之前滤掉不需要的图像, 减少 PCIe 流量. 为隐藏这些广播与传输开销, 我们用预取器保证 IO 与计算完全重叠.

#### 5.1.4 Fault Tolerance 容错

To handle various hardware and software faults during training, we use the robust training framework MegaScale [57] to achieve fault tolerance. Once the robust training framework detects a fault, it triggers the
为应对训练中的各种软硬件故障, 我们用稳健训练框架 MegaScale [57] 实现容错. 一旦该框架检测到故障, 就触发

<small><span class="docvortex-page-footnote" data-block-type="page_footnote" style="color:#6b7280"><sup>2</sup>For consistency, all computational costs mentioned in this report are normalized to GPU hours based on the H800.</span></small>
脚注 2: 为保持一致, 本报告提到的所有计算成本都按 H800 折算为 GPU 小时.

<!-- page 22 of 77 -->

recovery process and resumes training from the last successful checkpoint. We leverage ByteCheckpoint [136] for efficient checkpoint saving and resuming.
恢复流程, 从上一个成功的检查点恢复训练. 我们用 ByteCheckpoint [136] 高效保存和恢复检查点.

### 5.2 Post-Training Framework 后训练框架

We conduct hybrid reinforcement learning with both human feedback (RLHF) and verifier feedback (RLVF) of Seed1.5-VL on a verl-based [122] framework. It combines a single-controller for managing inter-RL-role dataflow and multi-controllers for managing intra-RL-role data and model parallelism. Verifiers are deployed in process-based services to isolate potential verifier faults. This design greatly simplifies deployment and development for various experiments. We use the same training system and optimization techniques as in the pretraining phase for efficient actor and critic updates, and vLLM [67] for autoregressive generation of rollouts. Specifically, actor and critic training employs 3-D parallelism [50, 93, 109, 123]; rollout generation and reward/reference model inference use replicas, each configured with tensor parallelism [115]. The RL phase of Seed1.5-VL costs 60k GPU hours. The reward model is trained using the same framework as the Seed1.5-VL pretraing phase, requiring 24k GPU hours. Post-training phases also leverage ByteCheckpoint [136] for efficient checkpoint saving and resuming.
Seed1.5-VL 的混合强化学习 (人类反馈 RLHF 加验证器反馈 RLVF) 在基于 verl [122] 的框架上进行. 它结合一个管理 RL 角色间数据流的 single-controller, 和多个管理 RL 角色内数据与模型并行的 multi-controller. 验证器部署为基于进程的服务, 以隔离潜在的验证器故障. 这一设计大大简化了各种实验的部署与开发. actor 与 critic 更新用与预训练相同的训练系统和优化技术, rollout 的自回归生成用 vLLM [67]. 具体来说, actor 与 critic 训练用 3-D 并行 [50, 93, 109, 123]; rollout 生成和奖励/参考模型推理用副本, 每个副本配置张量并行 [115]. Seed1.5-VL 的 RL 阶段花费 60k GPU 小时. 奖励模型用与 Seed1.5-VL 预训练相同的框架训练, 需要 24k GPU 小时. 后训练阶段同样用 ByteCheckpoint [136] 高效保存和恢复检查点.

> **看表:** 1.3 million, 60k, 24k GPU 小时是同一口径吗, 后训练占多大比例?
> 同一口径, 脚注 2 说明全部按 H800 折算. RL 60k 约是预训练 1.3M 的 4.6%, 奖励模型 24k 约 1.8%. 注意 1.3M 只覆盖 VLM 预训练 (§5.1), 不含 Seed-ViT 独立预训练 (表 2) 和语言模型本身的纯文本预训练; SFT 的算力原文没给. 所以这组数字比较的是 「接上视觉之后」 的各阶段, 不是整个模型从零开始的总成本.

## 6 Evaluation 评测

This section is structured as follows. Quantitative results on public benchmarks are presented in section 6.1, followed by an assessment of performance on agentic tasks in section 6.2. The design of our internal benchmark and a comparison of our model against industry-leading models are subsequently detailed in section 6.3. Model limitations are discussed in section 6.4. Qualitative examples are provided in appendix A, and comprehensive evaluation settings are described in appendix B.
本节结构如下. 6.1 节给出公开基准上的定量结果, 6.2 节评估 agent 任务表现. 6.3 节详述内部基准的设计, 以及我们的模型与业界领先模型的对比. 6.4 节讨论模型局限. 定性样例见附录 A, 完整评测设置见附录 B.

### 6.1 Public Benchmarks 公开基准

#### 6.1.1 Vision Encoder as a Zero-shot Classifier 视觉编码器作为零样本分类器

We evaluate Seed-ViT using zero-shot image classification benchmarks, including ImageNet-1K [22], ImageNet-V2 [112], ImageNet-A [44], ImageNet-R [43], ImageNet-S [138], and ObjectNet [8]. As detailed in table 5, Seed-ViT achieves an average zero-shot accuracy of 82.5 across these datasets, which is comparable to that of InternVL-C-6B [16], despite the fact that the number of parameters of Seed-ViT is only 9% of that of InternVL-C-6B. Impressively, compared to EVA-CLIP-18B, which has 30× more parameters, Seed-ViT achieves comparable accuracies on most of the ImageNet variants. Furthermore, compared to DFN-5B CLIP-H/14++ [28], Seed-ViT demonstrates superior performance on ObjectNet (which contains images with challenging backgrounds, rotations, and viewpoints) and ImageNet-A (which contains natural adversarial examples), suggesting greater robustness of Seed-ViT to real-world variations.
我们用零样本图像分类基准评测 Seed-ViT, 包括 ImageNet-1K [22], ImageNet-V2 [112], ImageNet-A [44], ImageNet-R [43], ImageNet-S [138] 和 ObjectNet [8]. 如表 5 所示, Seed-ViT 在这些数据集上的平均零样本准确率为 82.5, 与 InternVL-C-6B [16] 相当, 而 Seed-ViT 的参数量只有 InternVL-C-6B 的 9%. 更突出的是, 与参数量多 30 倍的 EVA-CLIP-18B 相比, Seed-ViT 在多数 ImageNet 变体上准确率相当. 此外, 与 DFN-5B CLIP-H/14++ [28] 相比, Seed-ViT 在 ObjectNet (背景, 旋转和视角都很难的图像) 和 ImageNet-A (自然对抗样本) 上更好, 说明 Seed-ViT 对真实世界变化更稳健.

| Models | Seed-ViT | OpenCLIP-G/14 | DFN-5B-CLIP-H/14++ | InternVL-C | EVA-CLIP-18B |
| --- | --- | --- | --- | --- | --- |
| #Param | 532M | 1.8B | 632M | 6B | 17.5B |
| ImageNet-1K | 83.6 | 80.4 | 84.3 | 83.2 | 83.8 |
| ImageNet-V2 | 77.6 | 73.6 | 78.3 | 77.3 | 77.9 |
| ImageNet-A | 85.5 | 69.3 | 79.6 | 83.8 | 87.3 |
| ImageNet-R | 95.2 | 92.8 | 94.9 | 95.7 | 95.7 |
| ImageNet-S | 74.1 | 69.9 | 73.6 | 74.3 | 74.7 |
| ObjectNet | 79.2 | 73.0 | 78.0 | 80.6 | 82.2 |
| Avg. | 82.5 | 76.5 | 81.4 | 82.5 | 83.6 |

Table 5 Comparisons of pre-trained Seed-ViT (before integration with the LLM) and existing competitors with more parameters on the common zero-shot benchmarks.
表 5 预训练 Seed-ViT (接入 LLM 之前) 与参数更多的现有对手在常用零样本基准上的对比.

> **拆开:** 表 5 里 Seed-ViT 与 InternVL-C 并列 82.5, 这个平局是在同条件下得到的吗?
> 只能算同一组测试集上的同分, 训练条件差很多. Seed-ViT 经历了 MIM, 原生分辨率对比学习和全模态三阶段 (表 2), 对比学习阶段还用 EVA-02-CLIP-E 的文本编码器初始化; 表里其余模型的分数来自各自原始设置, 原文没说是否统一重测. 参数比例也要拆开看: 532M 对 6B 约 9%, 对 EVA-CLIP-18B 的 17.5B 约 1/33, 原文写 「30×」 是取整. 另外 Seed-ViT 在 ImageNet-A 上 85.5 高于 DFN 的 79.6, 但在 ObjectNet 上 79.2 仍低于 InternVL-C 的 80.6 和 EVA-CLIP-18B 的 82.2.

<!-- page 23 of 77 -->

#### 6.1.2 Vision Task Evaluation 视觉任务评测

We evaluated the performance of Seed1.5-VL on a comprehensive suite of public image benchmarks, comparing it against several state-of-the-art multimodal models including Gemini 2.5 Pro (0325 version), OpenAI o1, Claude 3.7 Sonnet, OpenAI GPT-4o, and Qwen 2.5-VL 72B. We compare Seed1.5-VL with Gemini 2.5 Pro (Preview 03-25) instead of Gemini 2.5 Pro (Preview 05-06) as Gemini 2.5 Pro (Preview 03-25) shows stronger capabilities in open visual-language benchmarks (81.7<sub>Preview</sub> 03-25 v.s. 79.6<sub>Preview</sub> 05-06 in MMMU)<sup>3</sup>. The evaluation covers capabilities ranging from multimodal reasoning and general visual question answering to document understanding, grounding, and spatial reasoning. Table 6 presents the detailed results, highlighting the highest score in bold and the second highest score underlined for each benchmark, except for FSC-147 and NYU-Depth V2 where lower is better. We report results for Seed1.5-VL in both its standard ‘non-thinking’ mode and an enhanced ‘thinking’ mode, incorporating long chain-of-thought to improve reasoning.
我们在一整套公开图像基准上评测 Seed1.5-VL, 对比若干 SOTA 多模态模型, 包括 Gemini 2.5 Pro (0325 版), OpenAI o1, Claude 3.7 Sonnet, OpenAI GPT-4o 和 Qwen 2.5-VL 72B. 我们选 Gemini 2.5 Pro (Preview 03-25) 而不是 Gemini 2.5 Pro (Preview 05-06) 作对比, 因为前者在公开视觉语言基准上更强 (MMMU 上 Preview 03-25 为 81.7, Preview 05-06 为 79.6). 评测覆盖多模态推理, 通用视觉问答, 文档理解, grounding 和空间推理等能力. 表 6 给出详细结果, 每个基准最高分加粗, 次高分加下划线; FSC-147 和 NYU-Depth V2 例外, 这两项越低越好. 我们同时报告 Seed1.5-VL 标准 「non-thinking」 模式和引入长 CoT 以增强推理的 「thinking」 模式的结果.

> **确认:** 表 6 里各家分数是在同一条件下测的吗?
> 不完全是. 带 * 的分数是 2025 年 4 月通过 API 自采; 不带 * 的沿用公开报告. 解码方式也不同: 表 6 表注写明除 Claude 3.7 Sonnet 用推荐的默认采样外, 其余都用 greedy 解码, 报 Pass@1. 模式也不对称: Gemini, o1, Claude 列标 thinking, GPT-4o 和 Qwen2.5-VL 72B 标 non-thinking. Gemini 还特意挑了 MMMU 更高的 03-25 版. 所以 「同条件」 只到 「同一组基准, 同一个 Pass@1 指标」 这一层.

**Multimodal Reasoning.** In complex multimodal reasoning tasks, Seed1.5-VL demonstrates strong capabilities in both thinking and non-thinking modes. Notably, it achieves state-of-the-art (SOTA) performance on MathVista (85.6 thinking), V\* (89.5 non-thinking), VLM are Blind (92.1 thinking), ZeroBench (sub) (30.8 thinking), and VisuLogic (35.0 thinking). On MathVista and VLM are Blind, Seed1.5-VL significantly outperforms all listed counterparts. While Gemini 2.5 Pro leads on benchmarks like MMMU (81.7 vs. 77.9 for the thinking mode in Seed1.5-VL), MMMU-Pro (68.8 vs. 67.6), MathVision (73.3 vs. 68.7), and OlympiadBench (69.8 vs. 65.0), Seed1.5-VL remains competitive, securing the second position. For ZeroBench (main), Seed1.5-VL in the thinking mode solves 2 cases, ranking second alongside OpenAI o1, behind Gemini 2.5 Pro and Claude 3.7 Sonnet. Seed1.5-VL in the non-thinking mode also significantly excels in all multimodal reasoning compared with its non-thinking counterparts.
**多模态推理.** 在复杂多模态推理任务上, Seed1.5-VL 的 thinking 与 non-thinking 模式都很强. 它在 MathVista (thinking 85.6), V\* (non-thinking 89.5), VLM are Blind (thinking 92.1), ZeroBench (sub) (thinking 30.8) 和 VisuLogic (thinking 35.0) 上达到 SOTA. 在 MathVista 和 VLM are Blind 上, Seed1.5-VL 明显超过所有列出的对手. Gemini 2.5 Pro 在 MMMU (81.7 对 Seed1.5-VL thinking 的 77.9), MMMU-Pro (68.8 对 67.6), MathVision (73.3 对 68.7) 和 OlympiadBench (69.8 对 65.0) 上领先, Seed1.5-VL 仍有竞争力, 排第二. ZeroBench (main) 上, thinking 模式的 Seed1.5-VL 解出 2 题, 与 OpenAI o1 并列第二, 落后于 Gemini 2.5 Pro 和 Claude 3.7 Sonnet. non-thinking 模式的 Seed1.5-VL 在全部多模态推理任务上也明显优于其他 non-thinking 对手.

We observed that the model naturally exhibited diverse vision-centric strategies during our first round of LongCoT RL training, such as "let me look at the image again" and "analyze details before recognizing a location", as shown in figure 9 and figure 10, even though we had not labeled related SFT data at that time.
我们观察到, 在第一轮 LongCoT RL 训练中, 模型就自然表现出多样的以视觉为中心的策略, 如 「让我再看一下图」 和 「先分析细节再判断地点」, 见图 9 和图 10, 尽管当时我们并未标注相关 SFT 数据.

**General Visual Question Answering.** For general visual question answering benchmarks, Seed1.5-VL shows robust performance. It achieves SOTA results on RealWorldQA (78.4 thinking) and SimpleVQA (63.4 thinking). On MMStar, Seed1.5-VL (77.8 thinking) also achieves the highest score among the compared models. Similarly, on MMBench-en (89.9 thinking) and MMBench-cn (89.1 thinking), Seed1.5-VL scores are near the top performers like Gemini 2.5 Pro and Qwen 2.5-VL 72B. On HallusionBench, Seed1.5-VL (60.3 thinking) secures the second-best score, slightly behind Gemini 2.5 Pro (63.7).
**通用视觉问答.** 在通用视觉问答基准上, Seed1.5-VL 表现稳健. 它在 RealWorldQA (thinking 78.4) 和 SimpleVQA (thinking 63.4) 上达到 SOTA. 在 MMStar 上, Seed1.5-VL (thinking 77.8) 也是参比模型中的最高分. 类似地, 在 MMBench-en (thinking 89.9) 和 MMBench-cn (thinking 89.1) 上, Seed1.5-VL 接近 Gemini 2.5 Pro 和 Qwen 2.5-VL 72B 这些头部模型. 在 HallusionBench 上, Seed1.5-VL (thinking 60.3) 排第二, 略低于 Gemini 2.5 Pro (63.7).

**Document and Chart Understanding.** Seed1.5-VL excels in document and chart understanding tasks. It sets new SOTA benchmarks on TextVQA (84.2 non-thinking), InfographicVQA (91.2 thinking), and DocVQA (96.9 non-thinking), surpassing strong models like Qwen 2.5-VL 72B and Gemini 2.5 Pro in these areas. On ChartQA, Seed1.5-VL (89.1 thinking) achieves the second-highest score, only behind Qwen 2.5-VL 72B (89.5). It also delivers strong performance on AI2D (88.5 non-thinking) and OCRBench (881 non-thinking), ranking competitively behind Qwen 2.5-VL 72B and Gemini 2.5 Pro. For CharXiv (DQ), Seed1.5-VL (92.6 thinking and non-thinking) ranks second to Gemini 2.5 Pro (94.4). However, on CharXiv (RQ), its performance (60.2 thinking) lags behind the leaders Gemini 2.5 Pro (69.9) and Claude 3.7 Sonnet (68.9).
**文档与图表理解.** Seed1.5-VL 擅长文档与图表理解. 它在 TextVQA (non-thinking 84.2), InfographicVQA (thinking 91.2) 和 DocVQA (non-thinking 96.9) 上刷新 SOTA, 超过 Qwen 2.5-VL 72B 和 Gemini 2.5 Pro 等强模型. 在 ChartQA 上, Seed1.5-VL (thinking 89.1) 排第二, 仅次于 Qwen 2.5-VL 72B (89.5). 它在 AI2D (non-thinking 88.5) 和 OCRBench (non-thinking 881) 上也很强, 紧随 Qwen 2.5-VL 72B 和 Gemini 2.5 Pro. 在 CharXiv (DQ) 上, Seed1.5-VL (thinking 与 non-thinking 都是 92.6) 仅次于 Gemini 2.5 Pro (94.4). 不过在 CharXiv (RQ) 上, 它的表现 (thinking 60.2) 落后于领先的 Gemini 2.5 Pro (69.9) 和 Claude 3.7 Sonnet (68.9).

**Grounding and Counting.** This category highlights a significant strength of Seed1.5-VL. It achieves SOTA performance across all listed grounding and counting benchmarks. Specifically, Seed1.5-VL leads on BLINK (72.1 thinking), LVIS-MG (73.8 non-thinking), VisualWebBench (87.8 non-thinking), RefCOCO-avg (91.6 non-thinking), CountBench (93.7 thinking), and FSC-147 (17.9 thinking, lower is better). Notably, Seed1.5-VL achieves better performance on LVIS-MG against to traditional detectors, i.e., Grounding DINO-L [14, 80], which obtains 54.4 F1-score, demonstrating the strong capability of Seed1.5-VL in terms of multi-object grounding. The consistent top performance across these diverse tasks underscores Seed1.5-VL’s superior capabilities in object localization, fine-grained visual understanding, and counting.
**Grounding 与计数.** 这一类是 Seed1.5-VL 的明显强项. 它在列出的全部 grounding 与计数基准上都达到 SOTA. 具体来说, Seed1.5-VL 领先于 BLINK (thinking 72.1), LVIS-MG (non-thinking 73.8), VisualWebBench (non-thinking 87.8), RefCOCO-avg (non-thinking 91.6), CountBench (thinking 93.7) 和 FSC-147 (thinking 17.9, 越低越好). 值得一提的是, 在 LVIS-MG 上 Seed1.5-VL 优于传统检测器 Grounding DINO-L [14, 80] (F1 为 54.4), 显示出很强的多物体 grounding 能力. 在这些多样任务上一致领先, 说明 Seed1.5-VL 在物体定位, 细粒度视觉理解和计数上能力出众.

**3D Spatial Understanding.** We select depth estimation, 3D object detection, and multi-view reasoning as the three tasks to evaluate Seed1.5-VL’s capability on 3D spatial understanding. In particular, for depth
**3D 空间理解.** 我们选深度估计, 3D 物体检测和多视角推理三个任务评测 Seed1.5-VL 的 3D 空间理解能力. 特别地, 对深度

<small><span class="docvortex-page-footnote" data-block-type="page_footnote" style="color:#6b7280"><sup>3</sup>[https://deepmind.google/technologies/gemini/pro/](https://deepmind.google/technologies/gemini/pro/)</span></small>
脚注 3: Gemini 2.5 Pro 分数出处为上述 DeepMind 页面.

<!-- page 24 of 77 -->

<table><tr><td>Capability</td><td>Benchmark</td><td>Seed1.5-VL thinking</td><td>Seed1.5-VL non-thinking</td><td>Gemini2.5 Pro thinking</td><td>OpenAI o1 thinking</td><td>Claude3.7 Sonnet thinking</td><td>OpenAI GPT-4o non-thinking</td><td>Qwen2.5-VL 72B non-thinking</td></tr><tr><td rowspan="10">Multimodal reasoning</td><td>MMMU</td><td>77.9</td><td>73.6</td><td>81.7</td><td>77.6</td><td>75.2*</td><td>70.7*</td><td>70.2</td></tr><tr><td>MMMU-Pro</td><td>67.6</td><td>59.9</td><td>68.8*</td><td>66.4*</td><td>50.1*</td><td>54.5*</td><td>51.1</td></tr><tr><td>MathVision</td><td>68.7</td><td>65.5</td><td>73.3*</td><td>63.2*</td><td>58.6*</td><td>31.2*</td><td>38.1</td></tr><tr><td>OlympiadBench</td><td>65.0</td><td>60.4</td><td>69.8*</td><td>48.5*</td><td>54.2*</td><td>25.9*</td><td>35.9</td></tr><tr><td>MathVista</td><td>85.6</td><td>83.0</td><td>82.7*</td><td>71.8</td><td>74.5*</td><td>63.8*</td><td>74.8</td></tr><tr><td> $V^*$ </td><td>89.0</td><td>89.5</td><td>79.1*</td><td>69.7*</td><td>86.4*</td><td>73.9*</td><td>86.4</td></tr><tr><td>VLM are Blind</td><td>92.1</td><td>90.8</td><td>84.3*</td><td>57.0*</td><td>69.0*</td><td>50.4*</td><td>69</td></tr><tr><td>ZeroBench (main)</td><td>2</td><td>0</td><td>3*</td><td>0*</td><td>3*</td><td>0*</td><td>0</td></tr><tr><td>ZeroBench (sub)</td><td>30.8</td><td>29.0</td><td>26.0*</td><td>20.2*</td><td>20.4*</td><td>19.6*</td><td>13.0</td></tr><tr><td>VisuLogic</td><td>35.0</td><td>33.0</td><td>31.0*</td><td>29.0*</td><td>24.8*</td><td>26.3*</td><td>28.0</td></tr><tr><td rowspan="7">General visual question answering</td><td>RealWorldQA</td><td>78.4</td><td>77.0</td><td>78.0*</td><td>77.1*</td><td>67.8*</td><td>76.2*</td><td>75.7</td></tr><tr><td>SimpleVQA</td><td>63.4</td><td>63.1</td><td>62.0*</td><td>58.8*</td><td>50.1*</td><td>52.4*</td><td>52.4</td></tr><tr><td>MMStar</td><td>77.8</td><td>76.2</td><td>77.5*</td><td>67.5*</td><td>68.8*</td><td>65.1*</td><td>70.8</td></tr><tr><td>MMBench-en</td><td>89.9</td><td>88.0</td><td>90.1*</td><td>83.8*</td><td>82.0*</td><td>84.3*</td><td>88.6</td></tr><tr><td>MMBench-cn</td><td>89.1</td><td>88.1</td><td>89.7*</td><td>81.3*</td><td>82.7*</td><td>82.0*</td><td>87.9</td></tr><tr><td>MMVP</td><td>69.3</td><td>70.7</td><td>70.7*</td><td> $-^\dagger$ </td><td> $-^\dagger$ </td><td>70.7*</td><td>66.7</td></tr><tr><td>HallusionBench</td><td>60.3</td><td>60.0</td><td>63.7*</td><td>55.6*</td><td>58.3*</td><td>56.2*</td><td>55.2</td></tr><tr><td rowspan="8">Document and chart understanding</td><td>TextVQA</td><td>81.8</td><td>84.2</td><td>76.8*</td><td>66.2*</td><td>62.4*</td><td>81.4*</td><td>83.5</td></tr><tr><td>AI2D</td><td>87.3</td><td>88.5</td><td>88.4*</td><td>79.5*</td><td>82.1*</td><td>84.9*</td><td>88.7</td></tr><tr><td>ChartQA</td><td>89.1</td><td>87.4</td><td>83.3*</td><td>83.1*</td><td>56.5*</td><td>86.7*</td><td>89.5</td></tr><tr><td>InfographicVQA</td><td>91.2</td><td>89.3</td><td>84.3*</td><td>65.4*</td><td>66.5*</td><td>79.2*</td><td>87.3</td></tr><tr><td>DocVQA</td><td>96.9</td><td>96.7</td><td>94.0*</td><td>81.6*</td><td>87.4*</td><td>66.2*</td><td>96.4</td></tr><tr><td>OCRBench</td><td>861</td><td>881</td><td>866*</td><td>750*</td><td>793*</td><td>806*</td><td>885</td></tr><tr><td>CharXiv (RQ)</td><td>60.2</td><td>59.8</td><td>69.9*</td><td>55.1*</td><td>68.9*</td><td>52.0*</td><td>49.7*</td></tr><tr><td>CharXiv (DQ)</td><td>92.6</td><td>92.6</td><td>94.4*</td><td>88.9*</td><td>92.0*</td><td>86.5*</td><td>87.4*</td></tr><tr><td rowspan="6">Grounding &amp; counting</td><td>BLINK</td><td>72.1</td><td>70.2</td><td>70.6*</td><td>66.1*</td><td>62.5*</td><td>65.9*</td><td>64.4</td></tr><tr><td>LVIS-MG</td><td>72.5</td><td>73.8</td><td>63.8*</td><td> $-^\dagger$ </td><td> $-^\dagger$ </td><td> $-^\dagger$ </td><td> $-^\dagger$ </td></tr><tr><td>VisualWebBench</td><td>87.3</td><td>88.0</td><td>87.3*</td><td>80.9*</td><td>85.9*</td><td>80.2*</td><td>82.3*</td></tr><tr><td>RefCOCO-avg</td><td>91.3</td><td>91.6</td><td>74.6*</td><td> $-^\dagger$ </td><td> $-^\dagger$ </td><td> $-^\dagger$ </td><td>90.3</td></tr><tr><td>CountBench</td><td>93.7</td><td>93.5</td><td>91.0*</td><td>86.6*</td><td>86.1*</td><td>85.7*</td><td>93.6</td></tr><tr><td>FSC-147 ↓</td><td>17.9</td><td>18.6</td><td>24.5*</td><td>34.3*</td><td>33.4*</td><td>46.8*</td><td>28.6*</td></tr><tr><td rowspan="3">3D Spatial understanding</td><td>DA-2K</td><td>91.7</td><td>91.9</td><td>73.0*</td><td>72.3*</td><td>40.1*</td><td>66.9*</td><td>69.6*</td></tr><tr><td>NYU-Depth V2 ↓</td><td>13.6</td><td>11.6</td><td>27.5*</td><td>82.1*</td><td>92.4*</td><td>73.8*</td><td>35.5*</td></tr><tr><td>All-Angles Bench</td><td>58.6</td><td>59.0</td><td>53.4*</td><td>54.0*</td><td>50.0</td><td>49.1*</td><td>55.7</td></tr></table>

\* Results self-collected via API in April 2025.
\* 为 2025 年 4 月通过 API 自采的结果.

†Invalid results due to failures in following format requirements.
† 因未能遵循格式要求, 结果无效.

**Table 6** Performance of Seed1.5-VL on public visual-language benchmarks (appendix B.3) compared to previous models. All benchmarks are evaluated with greedy decoding except for Claude-3.7 Sonnet where a default sampling mode is recommended. We report Pass@1 in these benchmarks. For FSC-147 and NYU-Depth V2, Mean Absolute Error (MAE) and Absolute Relative Error (AbsRel) are used as the metrics, respectively, so lower numbers are better. For all other benchmarks, higher numbers are better. The highest score in each benchmark is marked in **bold**, and the second is <u>underlined</u>.
**表 6** Seed1.5-VL 在公开视觉语言基准 (附录 B.3) 上与既有模型的对比. 除 Claude-3.7 Sonnet 采用推荐的默认采样模式外, 所有基准都用 greedy 解码评测. 报告 Pass@1. FSC-147 与 NYU-Depth V2 分别以平均绝对误差 (MAE) 和绝对相对误差 (AbsRel) 为指标, 越低越好. 其余基准越高越好. 每个基准最高分 **加粗**, 次高分 <u>下划线</u>.

> **回看:** Seed1.5-VL 的 SOTA 是按一种模式算, 还是在 thinking 和 non-thinking 里取高者?
> 取高者. 正文点名的 SOTA 里, TextVQA 靠 non-thinking 84.2 (thinking 只有 81.8, 低于 Qwen2.5-VL 72B 的 83.5), LVIS-MG 与 RefCOCO-avg 也靠 non-thinking. 对手每家只出一列. 另外正文与表 6 有两处对不上: 正文写 DocVQA 「96.9 non-thinking」, 表中 96.9 在 thinking 列, non-thinking 是 96.7; 正文写 VisualWebBench 「87.8 non-thinking」, 表中 non-thinking 是 88.0, thinking 是 87.3. 数字以表 6 为准, 两处都不影响第一名.

<!-- page 25 of 77 -->

estimation, we report results on two public benchmarks, DA-2K [160] and NYU-Depth V2 [95]. In DA-2K, we follow [160] and report the accuracy of relative depth estimation between two pixels (e.g., which pixel is closer). In NYU-Depth V2, we report the standard absolute relative error measured as $| \mathrm { d i s t } _ { \mathrm { p r e d } } ^ { \overline { { \mathrm { ~ \scriptsize ~ } } } } - \mathrm { d i s t } _ { \mathrm { g t } } | / \mathrm { d i s t } _ { \mathrm { g t } }$ where dist $\mathrm { { ' p r e d } }$ and $\mathrm { d i s t } _ { \mathrm { g t } }$ are the predicted and ground truth distances, respectively. As shown in table 6, Seed1.5-VL-thinking scores 91.7 on DA-2K and 0.136 error rate on NYU Depth V2, which surpasses previous VLMs by a large margin. In non-thinking mode, Seed1.5-VL achieves 91.9 and 0.116 error rate on DA-2K and NYU-Depth V2, respectively. For 3D object detection, we report results on SUN-RGBD [125]. In non-thinking mode, our model scores 33.5 AP@15 on SUN-RGBD surpassing Gemini 2.0 Pro Experimental, which scores 32.5 AP@15 [129]. However, we observed a performance regression using thinking mode for this task. Namely, the result is decreased to 32.0 AP@15. For multi-view reasoning, we conduct evaluation on All-Angles Bench [163]. Seed1.5-VL attains 59.0 in non-thinking mode and 58.6 in thinking mode, which significantly surpasses previous models.
估计, 我们报告两个公开基准 DA-2K [160] 和 NYU-Depth V2 [95] 的结果. DA-2K 按 [160] 的做法, 报告两像素之间相对深度判断 (如哪个像素更近) 的准确率. NYU-Depth V2 报告标准的绝对相对误差, 计算为 $| \mathrm { d i s t } _ { \mathrm { p r e d } } ^ { \overline { { \mathrm { ~ \scriptsize ~ } } } } - \mathrm { d i s t } _ { \mathrm { g t } } | / \mathrm { d i s t } _ { \mathrm { g t } }$ , 其中 dist_pred 与 dist_gt 分别是预测距离和真实距离. 如表 6 所示, Seed1.5-VL-thinking 在 DA-2K 上得 91.7, 在 NYU Depth V2 上误差率 0.136, 大幅超过此前的 VLM. non-thinking 模式下, Seed1.5-VL 在 DA-2K 和 NYU-Depth V2 上分别为 91.9 和误差率 0.116. 3D 物体检测报告 SUN-RGBD [125] 的结果. non-thinking 模式下, 我们的模型在 SUN-RGBD 上得 33.5 AP@15, 超过 Gemini 2.0 Pro Experimental 的 32.5 AP@15 [129]. 但这一任务上 thinking 模式出现退步, 结果降到 32.0 AP@15. 多视角推理在 All-Angles Bench [163] 上评测. Seed1.5-VL non-thinking 得 59.0, thinking 得 58.6, 明显超过此前模型.

> **停一下:** 正文说 NYU-Depth V2 误差 0.136, 表 6 却写 13.6, 哪个对?
> 两者是同一个数, 表 6 按百分比写 AbsRel, 正文按小数写. non-thinking 的 0.116 对应表中 11.6. 这一行 non-thinking 比 thinking 更好, 加上 SUN-RGBD 上 thinking 从 33.5 降到 32.0, 说明在深度与 3D 检测这类直接回归数值的任务上, 长推理没有带来增益. SUN-RGBD 不在表 6 里, 只在 §6.1.2 正文出现, 所以它不计入 34 个视觉语言基准.

In summary, Seed1.5-VL exhibits state-of-the-art or highly competitive performance across a wide range of visual language benchmarks. It particularly excels in grounding, counting, 3D spatial understanding, document understanding (TextVQA, DocVQA, InfographicVQA), and certain reasoning tasks (MathVista, VLM are Blind, etc.), establishing itself as a powerful and versatile multimodal model.
总之, Seed1.5-VL 在大量视觉语言基准上达到 SOTA 或很有竞争力的水平. 它在 grounding, 计数, 3D 空间理解, 文档理解 (TextVQA, DocVQA, InfographicVQA) 和部分推理任务 (MathVista, VLM are Blind 等) 上尤其突出, 是一个强大而全面的多模态模型.

#### 6.1.3 Video Task Evaluation 视频任务评测

We conduct an evaluation of Seed1.5-VL’s proficiency in video understanding, assessing its capabilities across five dimensions: short video, long video, streaming video, video reasoning, and video grounding. Table 7 benchmarks Seed1.5-VL against state-of-the-art (SOTA) models. Due to API limitations (e.g., network timeouts, video processing errors), we cannot evaluate certain proprietary models such as Gemini 2.5 Pro across all benchmarks. Therefore, the table reports the highest score obtained, either sourced from public reports or self-collected via API.
我们评测 Seed1.5-VL 的视频理解能力, 覆盖五个维度: 短视频, 长视频, 流式视频, 视频推理和视频 grounding. 表 7 把 Seed1.5-VL 与 SOTA 模型对比. 由于 API 限制 (如网络超时, 视频处理出错), 我们无法在所有基准上评测 Gemini 2.5 Pro 等闭源模型. 因此表中报告能拿到的最高分, 来源是公开报告或通过 API 自采.

For short video understanding, Seed1.5-VL achieves SOTA performance on MotionBench, TVBench, Dream-1K, and TempCompass, demonstrating its exceptional proficiency in processing temporal dynamics and motion patterns characteristic of concise video segments. For long video understanding, it also attains strong results with a 128K token context (up to 640 frames). We recognize the importance of extended temporal understanding and plan future work focused on expanding this context window capacity to further enhance long-form video comprehension. Regarding streaming video understanding, we evaluate on OVBench [51], OVOBench [74], StreamBench [153], and the proactive sub-task of StreamingBench [76]. Seed1.5-VL achieves SOTA performance across all these benchmarks, indicating strong potential for real-time applications such as interactive video dialogue systems. In video reasoning (Video-MMMU [49], MMVU [175]), Seed1.5-VL scores 81.4 and 70.1, respectively, currently trailing top models such as Gemini 2.5 Pro. Furthermore, Seed1.5-VL excels in video grounding tasks, specifically designed to locate temporal segments within videos corresponding to textual descriptions. It achieves SOTA performance on Charades-STA [34] and TACoS [114], demonstrating precise localization capabilities.
短视频理解方面, Seed1.5-VL 在 MotionBench, TVBench, Dream-1K 和 TempCompass 上达到 SOTA, 显示出处理短视频片段中时间动态与运动模式的出色能力. 长视频理解方面, 它在 128K token 上下文 (最多 640 帧) 下也取得强结果. 我们认识到长时程理解的重要性, 计划后续扩大上下文窗口, 进一步增强长视频理解. 流式视频理解方面, 我们在 OVBench [51], OVOBench [74], StreamBench [153] 和 StreamingBench [76] 的主动子任务上评测, Seed1.5-VL 在这些基准上全部达到 SOTA, 显示出用于交互式视频对话系统等实时应用的潜力. 视频推理 (Video-MMMU [49], MMVU [175]) 上, Seed1.5-VL 分别得 81.4 和 70.1, 目前落后于 Gemini 2.5 Pro 等顶尖模型. 此外, Seed1.5-VL 擅长视频 grounding, 即在视频中定位与文字描述对应的时间片段. 它在 Charades-STA [34] 和 TACoS [114] 上达到 SOTA, 显示出精确的定位能力.

### 6.2 Multimodal Agent 多模态 Agent

Multimodal agents are systems that perceive the world through visual inputs, understand instructions in natural language, and take actions to complete tasks. Two key scenarios for evaluating such agents are GUI interaction and gameplay, which test real-world usability and complex reasoning. GUI agents simulate humancomputer interaction by perceiving and acting on screen interfaces across desktops, browsers, and mobile devices. These tasks require precise visual grounding and multi-step execution. Game agents operate in visually rich and interactive environments, requiring strategic planning, real-time decision-making, and commonsense reasoning. We benchmark Seed1.5-VL across both domains—GUI operation and gameplay—using a diverse set of evaluations. Results are shown in tables 8 and 9, where we report Seed1.5-VL’s performance under the thinking mode.
多模态 agent 是通过视觉输入感知世界, 理解自然语言指令, 并采取行动完成任务的系统. 评估这类 agent 的两个关键场景是 GUI 交互和玩游戏, 分别考验真实可用性和复杂推理. GUI agent 在桌面, 浏览器和移动设备的屏幕界面上感知并操作, 模拟人机交互. 这类任务需要精确的视觉 grounding 和多步执行. 游戏 agent 在视觉丰富的交互环境中运行, 需要策略规划, 实时决策和常识推理. 我们用一组多样的评测在 GUI 操作和玩游戏两个领域测试 Seed1.5-VL. 结果见表 8 和表 9, 报告的是 Seed1.5-VL thinking 模式下的表现.

**GUI Grounding.** GUI grounding refers to the model’s ability to understand and localize interface elements—a fundamental skill for vision-based agents. We evaluate this capability on ScreenSpot Pro [72], which focuses on expert-annotated tasks in professional settings, and ScreenSpot v2 [149], which covers grounding across
**GUI Grounding.** GUI grounding 指模型理解并定位界面元素的能力, 是视觉 agent 的基本功. 我们在 ScreenSpot Pro [72] 和 ScreenSpot v2 [149] 上评测: 前者聚焦专业场景下专家标注的任务, 后者覆盖

<!-- page 26 of 77 -->

<table><tr><td>Capability</td><td>Benchmark</td><td>Seed1.5-VL thinking</td><td>Seed1.5-VL non-thinking</td><td>Prior SOTA</td></tr><tr><td rowspan="6">Short video</td><td>MotionBench [48]</td><td>68.4</td><td>68.4</td><td>62.8GLM-4V</td></tr><tr><td>MVBench [73]</td><td>74.4</td><td>74.3</td><td>76.4InternVL-2.5</td></tr><tr><td>TOMATO [117]</td><td>44.7</td><td>44.2</td><td>46.9*Gemini 2.5 Pro</td></tr><tr><td>TVBench [19]</td><td>63.6</td><td>61.5</td><td>62.6*Gemini 2.5 Pro</td></tr><tr><td>Dream-1K [139]</td><td>43.9</td><td>42.6</td><td>42.0Tarsier2</td></tr><tr><td>TempCompass [82]</td><td>83.7</td><td>83.1</td><td>75.8*Gemini 2.5 Pro</td></tr><tr><td rowspan="5">Long video</td><td>LongVideoBench [147]</td><td>74.0</td><td>74.4</td><td>66.7GPT-4o</td></tr><tr><td>LVBench [142]</td><td>64.6</td><td>64.0</td><td>69.2*Gemini 2.5 Pro</td></tr><tr><td>MLVU [178]</td><td>82.1</td><td>81.8</td><td>81.2*Gemini 2.5 Pro</td></tr><tr><td>VideoMME(w/o sub) [32]</td><td>77.9</td><td>77.6</td><td>87.0*Gemini 2.5 Pro</td></tr><tr><td>TemporalBench [12]</td><td>79.8</td><td>78.9</td><td>73.3GPT-4o</td></tr><tr><td rowspan="4">Streaming video</td><td>OVBench [51]</td><td>60.0</td><td>59.6</td><td>54.9PMB [51]</td></tr><tr><td>OVOBench [74]</td><td>72.3</td><td>72.0</td><td>67.7Gemini1.5-Pro</td></tr><tr><td>StreamBench [153]</td><td>72.8</td><td>71.2</td><td>68.7GPT-4o</td></tr><tr><td>StreamingBench(proactive) [76]</td><td>68.0</td><td>82.8</td><td>64.7Claude 3.5 Sonnet</td></tr><tr><td rowspan="2">Video reasoning</td><td>Video-MMMU [49]</td><td>81.4</td><td>72.1</td><td>76.7Kimi-K1.6</td></tr><tr><td>MMVU [175]</td><td>70.1</td><td>70.1</td><td>75.8*Gemini 2.5 Pro</td></tr><tr><td rowspan="2">Video grounding†</td><td>Charades-STA [34]</td><td>64.0</td><td>64.7</td><td>60.7SG-DETR [36]</td></tr><tr><td>TACoS [114]</td><td>49.6</td><td>47.8</td><td>42.4SG-DETR [36]</td></tr></table>

Results self-collected via API in April 2025.
2025 年 4 月通过 API 自采的结果.

† We adopt mIoU as the main metric for video grounding tasks.
† 视频 grounding 任务以 mIoU 为主要指标.

Table 7 Seed1.5-VL performance on public video benchmarks compared to previous models. For all benchmarks, higher numbers are better. The evaluation frame rates are 2 FPS for MotionBench, MVBench, TOMATO, and TVBench, 3 FPS for Dream-1K, and 1 FPS for all other datasets.
表 7 Seed1.5-VL 在公开视频基准上与既有模型的对比. 所有基准都是越高越好. 评测帧率: MotionBench, MVBench, TOMATO, TVBench 为 2 FPS, Dream-1K 为 3 FPS, 其余数据集为 1 FPS.

> **再看:** 表 7 的 Prior SOTA 列和正文说法一致吗, 14/19 是怎么数出来的?
> 按表 7 逐行比, Seed1.5-VL 取两种模式较高者后, 在 19 个视频基准中有 14 个超过 Prior SOTA 列, 输给的 5 个是 MVBench, TOMATO, LVBench, VideoMME 和 MMVU, 与引言的 14/19 对得上. 但 Video-MMMU 一行有矛盾: 表中 Seed 81.4 高于 Prior SOTA 列的 Kimi-K1.6 76.7, 算作胜出; 正文却说它 「落后于 Gemini 2.5 Pro 等顶尖模型」, 说明 Prior SOTA 列并不总是全场最高分. 该列混合公开报告与 API 自采 (§6.1.3), 帧率也按表注逐项不同 (2, 3 或 1 FPS), 不是统一重测. StreamingBench (proactive) 上 non-thinking 82.8 远高于 thinking 68.0, 也是取高者才拿到这一格.

<table><tr><td>Capability</td><td>Benchmark</td><td>Seed 1.5-VL</td><td>OpenAI CUA [98]</td><td>Claude 3.7 Sonnet [6]</td><td>UI-TARS 1.5 [116]</td><td>Kimi VL-A3B [130]</td><td>Qwen 2.5 VL 72B [7]</td></tr><tr><td>GUI</td><td>ScreenSpot-V2 [149]</td><td>95.2</td><td>87.9</td><td>87.6</td><td>94.2</td><td>92.8</td><td>-</td></tr><tr><td>Grounding</td><td>ScreenSpot-Pro [72]</td><td>60.9</td><td>23.4</td><td>27.7</td><td>61.6</td><td>34.5</td><td>43.6</td></tr><tr><td rowspan="2">Computer Use</td><td>OSWorld [152]</td><td>36.7</td><td>38.1</td><td>28.0</td><td>42.5</td><td>8.2</td><td>8.8</td></tr><tr><td>Windows Agent Arena [11]</td><td>39.6</td><td>-</td><td>38.9</td><td>42.1</td><td>10.4</td><td>-</td></tr><tr><td rowspan="2">Browser Use</td><td>WebVoyager [42]</td><td>87.2</td><td>87.0</td><td>84.1</td><td>84.8</td><td>-</td><td>-</td></tr><tr><td>Online-Mind2Web [158]</td><td>76.4</td><td>71.0</td><td>62.9</td><td>75.8</td><td>-</td><td>-</td></tr><tr><td>Phone Use</td><td>Android World [111]</td><td>62.1</td><td>-</td><td>-</td><td>64.2</td><td>-</td><td>35.0</td></tr></table>

Table 8 Seed1.5-VL performance on public GUI online benchmarks compared to previous models.
表 8 Seed1.5-VL 在公开 GUI 在线基准上与既有模型的对比.

<!-- page 27 of 77 -->

| Game | Seed1.5-VL | UI-TARS-1.5 | OpenAI CUA | Claude 3.7 Sonnet |
| --- | --- | --- | --- | --- |
| 2048 | 870.6 | 721.3 | 611.2 | 800.0 |
| (score) |  |  |  |  |
| Cubinko | 2.0 | 0.0 | 0.0 | 0.0 |
| (level) |  |  |  |  |
| Energy | 2.3 | 1.8 | 0.8 | 1.0 |
| (level) |  |  |  |  |
| Free-The-Key | 1.0 | 0.0 | 0.0 | 0.0 |
| (level) |  |  |  |  |
| Gem-11 | 35.1 | 10.8 | 8.7 | 0.0 |
| (score) |  |  |  |  |
| Hex-Frvr | 1414.0 | 1583.7 | 651.6 | 523.1 |
| (score) |  |  |  |  |
| Infinity-Loop | 1.4 | 0.7 | 0.4 | 0.1 |
| (level) |  |  |  |  |
| Laser-Maze-Puzzle | 2.6 | 2.2 | 1.4 | 1.4 |
| (level) |  |  |  |  |
| Maze:Path-of-Light | 1.3 | 0.3 | 0.3 | 0.8 |
| (level) |  |  |  |  |
| Shapes | 2.2 | 1.5 | 0.9 | 0.2 |
| (level) |  |  |  |  |
| Snake-Solver | 1.3 | 0.2 | 0.2 | 0.2 |
| (level) |  |  |  |  |
| Tiles-Master | 2.3 | 1.7 | 1.5 | 1.6 |
| (level) |  |  |  |  |
| Wood-Blocks-3d | 864.0 | 213.3 | 18.1 | 0.0 |
| (score) |  |  |  |  |
| Yarn-Untangle | 6.0 | 5.7 | 5.1 | 1.6 |
| (level) |  |  |  |  |

Table 9 Seed1.5-VL performance on 14 Poki games with scores or levels completed. Models are evaluated over multiple runs, allowing up to 100 steps. For all games, higher numbers are better.
表 9 Seed1.5-VL 在 14 个 Poki 游戏上的得分或通关关数. 模型经多次运行评测, 每次最多 100 步. 所有游戏都是越高越好.

desktop, mobile, and web interfaces. Seed1.5-VL demonstrates strong grounding performance, achieving 60.9 on ScreenSpot Pro and 95.2 on ScreenSpot v2, which outperforms both OpenAI CUA and Claude 3.7 Sonnet. As the foundation of multimodal interaction, GUI grounding enables agents to perceive actionable elements and bridge perception with control.
桌面, 移动端和网页界面上的 grounding. Seed1.5-VL grounding 表现强, ScreenSpot Pro 得 60.9, ScreenSpot v2 得 95.2, 超过 OpenAI CUA 和 Claude 3.7 Sonnet. 作为多模态交互的基础, GUI grounding 让 agent 能感知可操作元素, 把感知与控制连起来.

**GUI Agent.** For GUI agent capability evaluation, we compare Seed1.5-VL with strong baselines such as OpenAI CUA [98] and Claude 3.7 Sonnet [6] on different GUI scenarios covering computer use, browser use, and phone use. As illustrated in table 8, Seed1.5-VL consistently outperforms previous models on several key benchmarks. For instance, on OSWorld [152] and Windows Agent Arena [11], Seed1.5-VL achieves 36.7% and 39.6%, respectively, surpassing Claude 3.7 Sonnet’s 28.0% and 38.9%. In browser use, Seed1.5-VL scores 87.2% on WebVoyager [42] and 76.4% on Online-Mind2Web [158], outperforming OpenAI CUA and Claude 3.7 Sonnet, setting new state-of-the-art results. On AndroidWorld [111], a challenging mobile interface task, Seed1.5-VL also achieves a high score of 62.1%. Overall, among all the foundation VLMs (i.e., Claude 3.7 Sonnet, Kimi VL-A3B, and Qwen 2.5-VL), Seed1.5-VL achieves significantly better performance in GUI agent tasks. These results underscore Seed1.5-VL’s exceptional capabilities in executing GUI tasks and its strong generalization across diverse environments and devices, firmly establishing it as a premier position in GUI domain.
**GUI Agent.** GUI agent 能力评测中, 我们在覆盖电脑使用, 浏览器使用和手机使用的不同 GUI 场景下, 把 Seed1.5-VL 与 OpenAI CUA [98], Claude 3.7 Sonnet [6] 等强基线对比. 如表 8 所示, Seed1.5-VL 在若干关键基准上持续优于既有模型. 例如在 OSWorld [152] 和 Windows Agent Arena [11] 上, Seed1.5-VL 分别达到 36.7% 和 39.6%, 超过 Claude 3.7 Sonnet 的 28.0% 和 38.9%. 浏览器使用方面, Seed1.5-VL 在 WebVoyager [42] 上得 87.2%, 在 Online-Mind2Web [158] 上得 76.4%, 超过 OpenAI CUA 和 Claude 3.7 Sonnet, 刷新 SOTA. 在具有挑战性的移动界面任务 AndroidWorld [111] 上, Seed1.5-VL 也拿到 62.1% 的高分. 总体而言, 在所有基础 VLM (即 Claude 3.7 Sonnet, Kimi VL-A3B 和 Qwen 2.5-VL) 中, Seed1.5-VL 在 GUI agent 任务上明显更好. 这些结果说明 Seed1.5-VL 执行 GUI 任务能力出众, 在多样环境和设备上泛化强, 在 GUI 领域居于前列.

> **对一下:** 表 8 里 GUI agent 的 3/7 SOTA 把 UI-TARS 1.5 算进去了吗?
> 算进去了, 而且 UI-TARS 1.5 是最强对手. 7 项中 Seed1.5-VL 只在 ScreenSpot-V2 (95.2), WebVoyager (87.2), Online-Mind2Web (76.4) 三项第一; ScreenSpot-Pro (61.6 对 60.9), OSWorld (42.5 对 36.7), Windows Agent Arena (42.1 对 39.6), AndroidWorld (64.2 对 62.1) 都是 UI-TARS 1.5 更高, OSWorld 上 OpenAI CUA 的 38.1 也高于 36.7. 正文 「超过 Claude 3.7 Sonnet」 的说法只挑了 Claude 作参照. 另外 §3.1.7 说 GUI 数据主要来自 UI-TARS, 两者同源; 正文最后一句把比较范围收窄到 「基础 VLM」, 就是把 UI-TARS 这种 GUI 专用模型排除在外.

**Game Agent.** Gameplay serves as a rigorous benchmark for multimodal models, combining visually rich
**游戏 Agent.** 玩游戏是多模态模型的严格基准, 它把视觉丰富的

<!-- page 28 of 77 -->

![Chart block](images/p28-figure-6-for-each-game-we-compute-a-scaling-curve-per.png)

Figure 6 For each game, we compute a scaling curve per model using normalized reference scores, and averaged them to produce an overall inference-time scaling trend.
图 6 对每个游戏, 我们用归一化参考分为每个模型算一条随交互轮数变化的曲线, 再取平均, 得到整体的 TestingTime Scaling 趋势.

environments with complex logic that challenges models to handle intricate reasoning, sequential decisionmaking, and rapid adaptation. Success in gameplay depends on intuitive commonsense reasoning, long-term strategic planning, and the ability to adapt to dynamic challenges—making it an ideal testbed for showcasing the advanced cognitive capabilities of state-of-the-art multimodal agents.
环境与复杂逻辑结合在一起, 逼模型处理复杂推理, 序列决策和快速适应. 游戏成功依赖直觉常识推理, 长期策略规划和适应动态挑战的能力, 这让它成为展示 SOTA 多模态 agent 高级认知能力的理想试验场.

We assemble a benchmark of 14 diverse games from Poki.com<sup>4</sup>, which assess Seed1.5-VL’s abilities in grounding, perception, and reasoning. As shown in table 9, Seed1.5-VL outperforms previous models across multiple games. For example, Seed1.5-VL achieves 870.6 in 2048, surpassing OpenAI CUA (611.2) and Claude 3.7 Sonnet (800.0), and 1414.0 in Hex-Frvr, a considerable lead over OpenAI CUA (651.6) and Claude 3.7 Sonnet (523.1). These results highlight Seed1.5-VL’s exceptional performance in completing game levels and achieving high scores. In addition, the long-horizon nature of gameplay makes it particularly well-suited for evaluating inference-time scaling behaviors. As depicted in figure 6, Seed1.5-VL demonstrates strong scalability, maintaining higher performance as interaction rounds increase. This showcases its robust design and advanced reasoning abilities, ensuring consistent improvement even as the complexity of tasks grows over time.
我们从 Poki.com 收集了 14 个多样游戏组成基准, 评估 Seed1.5-VL 的 grounding, 感知和推理能力. 如表 9 所示, Seed1.5-VL 在多个游戏上优于既有模型. 例如 Seed1.5-VL 在 2048 上得 870.6, 超过 OpenAI CUA (611.2) 和 Claude 3.7 Sonnet (800.0); 在 Hex-Frvr 上得 1414.0, 大幅领先 OpenAI CUA (651.6) 和 Claude 3.7 Sonnet (523.1). 这些结果显示 Seed1.5-VL 在通关和拿高分上表现出色. 此外, 游戏的长时程特性特别适合评估 TestingTime Scaling 行为. 如图 6 所示, Seed1.5-VL 随交互轮数增加保持更高表现, 可扩展性强. 这体现了其稳健的设计和先进的推理能力, 保证任务复杂度随时间上升时仍能持续提升.

> **想:** 表 9 里 Hex-Frvr 算 Seed1.5-VL 的胜例吗, 图 6 的横轴又是什么?
> 不算全场第一. Hex-Frvr 上 UI-TARS-1.5 是 1583.7, 高于 Seed1.5-VL 的 1414.0, 正文只拿 CUA 和 Claude 作对比. 其余 13 个游戏 Seed1.5-VL 都最高. 表 9 同时混用 score 与 level 两种单位, 所以图 6 先按参考分归一化再跨游戏平均. 图 6 的横轴是交互轮数 (每次运行最多 100 步), 这里的 TestingTime Scaling 指推理时多走几步, 不是增加训练算力, 与 §3.3 的预训练 Scaling Laws 是两回事.

### 6.3 Internal Benchmarks 内部基准

Besides public benchmarks, we also build internal benchmarks to comprehensively evaluate our models. We present motivation and design principles of our internal benchmarks in section 6.3.1, show results in section 6.3.2, and demonstrate model’s Out-of-distribution (OOD) generalization ability in section 6.3.3.
除公开基准外, 我们还构建了内部基准来全面评估模型. 6.3.1 节介绍内部基准的动机与设计原则, 6.3.2 节给出结果, 6.3.3 节展示模型的分布外 (OOD) 泛化能力.

#### 6.3.1 Motivation and Design Principles 动机与设计原则

In addition to leveraging public benchmarks for exhaustive evaluation, we developed an internal benchmark suite to address several limitations inherent in existing resources. First, the predominance of English in public benchmarks necessitated the creation of comprehensive benchmarks to evaluate model performance specifically in Chinese, aligning with operational requirements. Second, the rapid pace of progress in multimodal research has resulted in saturation on many public benchmarks, reducing their sensitivity to incremental model improvements and hindering effective differentiation among leading models. Finally, limitations associated with the prevalent rule-based evaluation methods in public datasets, including challenges in answer parsing
除了用公开基准做详尽评测, 我们还开发了一套内部基准, 以弥补现有资源的若干局限. 第一, 公开基准以英文为主, 需要构建全面的基准专门评估中文表现, 与业务需求对齐. 第二, 多模态研究进展很快, 许多公开基准已饱和, 对模型的小幅改进不再敏感, 也难以有效区分头部模型. 最后, 公开数据集普遍采用的基于规则的评测方法有局限, 包括答案解析困难

<small><span class="docvortex-page-footnote" data-block-type="page_footnote" style="color:#6b7280"><sup>4</sup>[https://poki.com](https://poki.com)</span></small>

<!-- page 29 of 77 -->

and potential data quality issues like label errors, underscored the need for tailored internal benchmarks with potentially more robust evaluation protocols and curated data.
和标签错误等潜在数据质量问题, 这说明需要定制的内部基准, 配以可能更稳健的评测协议和整理过的数据.

Consequently, we developed our in-house benchmarks guided by several core principles:
因此, 我们按以下核心原则开发内部基准:

• **Focus on Core Capabilities over User Alignment**: The benchmarks prioritize assessing fundamental model abilities (e.g., perception, reasoning) rather than superficial alignment characteristics, such as preferences for response verbosity. This approach minimizes the confounding influence of alignment tuning on the evaluation of iterative model improvements.
• **聚焦核心能力而非用户对齐**: 基准优先评估基础模型能力 (如感知, 推理), 而非回答长度偏好之类的表层对齐特征. 这样可以把对齐调优对迭代改进评估的干扰降到最低.

• **Comprehensive Scope (Atomic and Integrated Capabilities)**: The evaluation suite encompasses assessments of both specific, atomic capabilities (e.g., fine-grained visual recognition) and complex, integrated multimodal tasks spanning diverse application domains.
• **范围全面 (原子能力与综合能力)**: 评测集既评估具体的原子能力 (如细粒度视觉识别), 也评估跨多个应用领域的复杂综合多模态任务.

• **Evaluation Accuracy and Methodology**: We employ Large Language Models (LLMs) as judges, advancing beyond traditional rule-based metrics. The prompts and reference answers utilized by these “evaluator” models undergo continuous refinement to ensure high evaluation fidelity. Current evaluator accuracy averages above 95% for multiple-choice or simple-answer questions (e.g., single word/number responses) and exceeds 90% for open-ended questions (further details in appendix B.1).
• **评测准确性与方法**: 我们用 LLM 作裁判, 超越传统基于规则的指标. 这些 「评估者」 模型所用的 prompt 和参考答案持续精炼, 保证评测高保真. 目前评估者在选择题或简单答案题 (如单词/数字回答) 上平均准确率超过 95%, 在开放式问题上超过 90% (详见附录 B.1).

• **Mitigation of Benchmark Overfitting**: To prevent inflated performance scores resulting from model overfitting to the benchmark data, we implement a rigorous data deduplication pipeline. Furthermore, task types and data sources within the benchmarks are periodically refreshed.
• **缓解基准过拟合**: 为防止模型过拟合基准数据导致分数虚高, 我们实施严格的数据去重管线. 此外, 基准中的任务类型和数据来源定期更新.

• **Task and Input Diversity**: Recognizing the critical role of diversity for VLMs, our benchmarks emphasize variety in both task types and input images. Image sourcing prioritizes non-publicly crawled data when feasible. We structure the benchmarks across numerous distinct dimensions, resulting in over 100 tasks and more than 12,000 samples from varied sources and domains. This includes a dedicated Out-of-Distribution (OOD) category featuring unconventional tasks designed to probe model generalization capabilities. A detailed taxonomy of targeted capabilities is provided in appendix B.1.
• **任务与输入多样性**: 考虑到多样性对 VLM 的关键作用, 我们的基准强调任务类型和输入图像都要多样. 图像来源尽量优先选非公开爬取的数据. 基准按许多不同维度组织, 共有 100 多个任务, 12,000 多个样本, 来源和领域各异. 其中包括一个专门的分布外 (OOD) 类别, 用非常规任务考察模型的泛化能力. 目标能力的详细分类见附录 B.1.

6.3.2 Comparison with State-of-the-arts
6.3.2 与 SOTA 的对比

<table><tr><td>Level-1 Capabilities</td><td>Level-2 Capabilities</td><td>Weight</td><td>Seed 1.5-VL thinking</td><td>Gemini 2.5 Pro thinking</td><td>OpenAI o1 thinking</td><td>OpenAI o4-mini w/o tool use</td><td>Claude 3.7 Sonnet thinking</td></tr><tr><td>Overall</td><td></td><td>1.0</td><td>59.3</td><td>61.6</td><td>54.0</td><td>55.4</td><td>48.6</td></tr><tr><td rowspan="4">Vision Capabilities</td><td>Perception</td><td>0.1</td><td>63.0</td><td>64.4</td><td>51.6</td><td>56.8</td><td>48.4</td></tr><tr><td>Recognition</td><td>0.1</td><td>72.4</td><td>74.8</td><td>74.5</td><td>64.8</td><td>55.7</td></tr><tr><td>OCR</td><td>0.1</td><td>67.2</td><td>70.7</td><td>55.7</td><td>64.4</td><td>57.1</td></tr><tr><td>Caption &amp; Counterfactual</td><td>0.05</td><td>47.7</td><td>54.9</td><td>43.6</td><td>27.6</td><td>34.1</td></tr><tr><td rowspan="9">Integrated Capabilities</td><td>OOD</td><td>0.15</td><td>44.1</td><td>43.1</td><td>42.3</td><td>38.4</td><td>35.9</td></tr><tr><td>STEM</td><td>0.04</td><td>63.3</td><td>64.0</td><td>56.1</td><td>55.0</td><td>45.2</td></tr><tr><td>Knowledge</td><td>0.06</td><td>64.9</td><td>73.6</td><td>68.5</td><td>57.8</td><td>50.8</td></tr><tr><td>Reasoning</td><td>0.1</td><td>47.6</td><td>52.4</td><td>44.9</td><td>57.4</td><td>39.6</td></tr><tr><td>Document &amp; Diagram Understanding</td><td>0.1</td><td>73.1</td><td>75.5</td><td>66.3</td><td>70.9</td><td>64.7</td></tr><tr><td>Agent</td><td>0.1</td><td>63.1</td><td>63.1</td><td>53.2</td><td>52.9</td><td>53.2</td></tr><tr><td>Atomic Instruction Following</td><td>0.03</td><td>69.6</td><td>69.2</td><td>63.8</td><td>68.7</td><td>50.5</td></tr><tr><td>Code</td><td>0.05</td><td>44.0</td><td>43.7</td><td>39.9</td><td>60.6</td><td>54.6</td></tr><tr><td>ToB</td><td>0.02</td><td>47.1</td><td>54.7</td><td>30.2</td><td>39.8</td><td>29.1</td></tr></table>

**Table 10** Evaluation results comparing Seed1.5-VL and state-of-the-art models on the internal benchmark. The overall score is calculated as a weighted average across performance in defined sub-categories. Data for other models was sourced via API access in April 2025. Weights for averaging are set for minimizing variance of evaluation and highlighting the importance of each category. The highest scores are marked in **bold** and the second is <u>underlined</u>.
**表 10** 内部基准上 Seed1.5-VL 与 SOTA 模型的评测结果对比. 总分是各子类别表现的加权平均. 其他模型的数据于 2025 年 4 月通过 API 获取. 平均权重的设定兼顾最小化评测方差和突出各类别的重要性. 最高分 **加粗**, 次高分 <u>下划线</u>.

> **问:** 表 10 的 Overall 59.3 能用权重列复算出来吗, 权重对排名有多大影响?
> 能. 13 个子类权重合计 1.0 (视觉能力 0.35, 综合能力 0.65), 按 Seed1.5-VL 一列加权得 59.296, 四舍五入 59.3; Gemini 2.5 Pro 一列加权得 61.631, 即 61.6, 表 10 自洽. 权重是作者定的, 其中 OOD 权重最高 (0.15), 恰好是 Seed1.5-VL 领先的一项 (44.1 对 43.1); 而 o4-mini 领先的 Code (60.6) 权重只有 0.05, Reasoning (57.4) 为 0.1. 如果换一套等权方案, 排名间距会变, 这是读 Overall 时要带上的分母.

We compare Seed1.5-VL with leading industry models (Gemini 2.5 Pro, OpenAI o1, OpenAI o4-mini, Claude 3.7) in table 10 under thinking mode. The leading score of 61.6 (Gemini 2.5 Pro) highlights substantial room
我们在表 10 中以 thinking 模式把 Seed1.5-VL 与业界领先模型 (Gemini 2.5 Pro, OpenAI o1, OpenAI o4-mini, Claude 3.7) 对比. 最高分 61.6 (Gemini 2.5 Pro) 说明这个基准上还有很大

<!-- page 30 of 77 -->

for improvement on this benchmark, unlike many public benchmarks nearing saturation above 80 in table 6. A more comprehensive comparison including non-thinking models can be found in appendix B.2.
提升空间, 不像表 6 中许多公开基准已在 80 以上接近饱和. 包括 non-thinking 模型在内的更全面对比见附录 B.2.

Seed1.5-VL achieves the second-highest overall score. It achieves state-of-the-art performance in OOD, Agent, Atomic Instruction Following categories, and shows strong capabilities in STEM and Document & Diagram Understanding. Its primary weaknesses relative to the top performer are observed in knowledge, reasoning, code, and captioning/counterfactual tasks. We attribute this gap partly to the scale of the current model, which utilizes a language model with approximately 20B active parameters. Evidence supporting potential gains from further scaling is presented in figure 3, where the training loss shows no sign of saturation after 3 trillion tokens, and evaluation metrics correlate strongly with loss. Therefore, we expect the performance gap to diminish as we increase the model size and the training compute.
Seed1.5-VL 总分第二. 它在 OOD, Agent, 原子指令跟随三个类别达到 SOTA, 在 STEM 与文档图表理解上也很强. 相对第一名, 主要短板在知识, 推理, 代码和描述/反事实任务上. 我们认为差距部分来自当前模型规模: 语言模型激活参数约 20B. 图 3 给出进一步扩大规模可能带来收益的证据: 训练 loss 在 3 万亿 token 后仍无饱和迹象, 且评测指标与 loss 强相关. 因此我们预计随着模型规模和训练算力增加, 差距会缩小.

Grouping models strictly by parameter count is challenging due to the lack of public disclosure of specific parameter details for many models. Our model’s size is comparable to the recently released Llama 4 Maverick [91], which is reported to utilize 17 billion active parameters and employs a Mixture-of-Experts (MoE) architecture. Our evaluation demonstrates that Seed1.5-VL achieves significantly better performance than Llama 4 Maverick on this benchmark (figure 29).
由于许多模型没有公开具体参数细节, 严格按参数量分组比较很难. 我们模型的规模与近期发布的 Llama 4 Maverick [91] 相当, 后者据报道使用 17B 激活参数, 采用 MoE 架构. 评测显示 Seed1.5-VL 在这个基准上明显优于 Llama 4 Maverick (图 29).

#### 6.3.3 Out-of-distribution Generalization 分布外泛化

As shown in table 10, our model demonstrates performance comparable to that of two leading industry models, Gemini Pro 2.5 and OpenAI o1, within the Out-of-Distribution (OOD) category of the benchmark. Complementary to standardized evaluations, an internal Chatbot platform was developed to assess the model’s ability to integrate multiple atomic capabilities in complex real-world scenarios. Three representative examples are highlighted. First, the model successfully solves a Rebus puzzle shown in figure 7, leveraging its OCR, knowledge retrieval, and reasoning abilities. Additional examples, some of which may be challenging for humans, are provided in appendix A.3. In the second example (figure 8), it processes code captured from a challenging visual input (a shiny whiteboard), analyzes and corrects errors, and validates the corrected code using user-provided examples. In the third example (figure 23), the model parses a diagram of an unseen format, performing “inverse graphics” to generate the underlying Mermaid code while adhering to a specific spatial constraint (“south region”).
如表 10 所示, 在基准的分布外 (OOD) 类别中, 我们的模型表现与两个业界领先模型 Gemini Pro 2.5 和 OpenAI o1 相当. 作为标准化评测的补充, 我们开发了一个内部 Chatbot 平台, 评估模型在复杂真实场景中整合多种原子能力的本事. 下面举三个代表性例子. 第一, 模型成功解出图 7 中的画谜, 用上了 OCR, 知识检索和推理能力. 附录 A.3 给出更多例子, 其中一些对人类也不容易. 第二个例子 (图 8), 模型从困难的视觉输入 (反光白板) 中读取代码, 分析并纠正错误, 再用用户给的样例验证修正后的代码. 第三个例子 (图 23), 模型解析一种没见过格式的示意图, 做 「逆向图形学」, 生成背后的 Mermaid 代码, 同时遵守特定空间约束 (「south region」).

![Image block](images/p30-prompts-can-you-solve-this-rebus-puzzle.png)

**Prompts:** can you solve this Rebus puzzle?
**Prompt:** 你能解这个画谜吗?

**Model Responses:** &lt;think&gt;...&lt;/think&gt;The Rebus puzzle features the phrase “Get it” repeated four times. The number of repetitions (four) combined with the phrase "Get it" creates a homophonic play: **‘‘Four get it’’** sounds like **‘‘Forget it’’**. This wordplay uses the repetition count (four) to form the first part of the phrase, which phonetically matches “forget”. Thus, the solution is **Forget it**.
**模型回答:** &lt;think&gt;...&lt;/think&gt; 这个画谜是短语 「Get it」 重复四次. 重复次数 (four) 与短语 「Get it」 结合形成谐音: **「Four get it」** 听起来像 **「Forget it」**. 这个文字游戏用重复次数 (four) 组成短语的前半部分, 读音与 「forget」 吻合. 所以答案是 **Forget it**.

Figure 7 To solve this Rebus puzzle, our model has to correctly recognize characters in the image, count the number of repetitions, retrieve knowledge about Rebus puzzles, and perform reasoning to obtain the final answer. Thinking tokens are omitted for brevity.
图 7 要解这个画谜, 模型必须正确识别图中字符, 数出重复次数, 检索画谜相关知识, 并推理得到最终答案. 为简洁起见省略了思考 token.

A distinct benchmark, supplementing the internal evaluation, was employed to assess the new model’s user preference alignment capability. This evaluation involved augmenting the model with search tools and serves as a proxy for its utility to the Doubao<sup>5</sup> user base. The usefulness rate for Seed 1.5VL is 62.6%. Similarly, we have also tested Gemini 2.5 pro 0325, with the usefulness rates reaching 57.4%.
另有一个独立基准作为内部评测的补充, 用于评估新模型的用户偏好对齐能力. 这项评测给模型配上搜索工具, 作为模型对豆包用户群实用性的代理指标. Seed 1.5VL 的有用率为 62.6%. 我们同样测了 Gemini 2.5 pro 0325, 有用率为 57.4%.

> **核对:** 62.6% 对 57.4% 的有用率, 两边都配了搜索工具吗?
> 原文只说这项评测 「给模型配上搜索工具」, 紧接着说 「同样测了 Gemini 2.5 pro 0325」, 没交代 Gemini 是否走同一套搜索工具和同一个豆包产品界面. 评测集规模, 评判人和 「有用」 的判定标准也都没给. 这个 5.2 个百分点的差距只能当作豆包场景下的内部代理指标, 不能与表 10 的内部基准或表 6 的公开基准混读; 表 10 里 Gemini 2.5 Pro 反而以 61.6 对 59.3 领先.

### 6.4 Limitations 局限

Despite strong performance across many benchmarks, Seed1.5-VL exhibits certain limitations, particularly in fine-grained visual perception and complex reasoning.
尽管在许多基准上表现强, Seed1.5-VL 仍有一些局限, 尤其在细粒度视觉感知和复杂推理上.

<small><span class="docvortex-page-footnote" data-block-type="page_footnote" style="color:#6b7280"><sup>5</sup>https://www.doubao.com/chat/</span></small>
脚注 5: 豆包对话页面 https://www.doubao.com/chat/.

<!-- page 31 of 77 -->

![Image block](images/p31-figure-8-an-example-of-seed1-5-vl-correcting-code.png)

Figure 8 An example of Seed1.5-VL correcting code written on a whiteboard using its OCR and coding capabilities.
图 8 Seed1.5-VL 用 OCR 与编程能力纠正白板上代码的示例.

In complex visual perception tasks, Seed1.5-VL struggles with accurately counting objects when they are irregularly arranged, similar in color, or partially occluded. Identifying subtle differences between images also presents a challenge, sometimes leading to missed details or inaccurate descriptions. Furthermore, similar to some contemporaries (e.g., OpenAI GPT-4o and Gemini 2.5 Pro), difficulties can arise in precisely interpreting complex spatial relationships, especially with varying perspectives, and accurately responding to visual prompts, occasionally misidentifying content or quantity within specified regions or making localization errors.
在复杂视觉感知任务中, 当物体排列不规则, 颜色相近或部分遮挡时, Seed1.5-VL 难以准确计数. 识别图像之间的细微差异也有难度, 有时会漏掉细节或描述不准. 此外, 与一些同代模型 (如 OpenAI GPT-4o 和 Gemini 2.5 Pro) 类似, 它在精确理解复杂空间关系 (尤其视角变化时) 和准确响应视觉提示方面会遇到困难, 偶尔会认错指定区域内的内容或数量, 或出现定位错误.

Beyond perception, challenges also emerge in higher-level reasoning, as suggested by both open and internal benchmarks. Seed1.5-VL demonstrates suboptimal performance on reasoning tasks trivial for humans, such as solving Klotski puzzles or navigating simple mazes, suggesting a need for future exploration into techniques like visual Chain-of-Thought (CoT) where the model might augment its process with auxiliary visual aids (e.g., lines). Reasoning requiring combinatorial search poses a significant challenge for many existing VLMs. Figures 27 and 28 provide two illustrative examples of problems falling into this category. While challenging for current VLM architectures, combinatorial search tasks are often more readily addressed through programmatic or code-based approaches. Consequently, incorporating code-use and other external tools into VLM frameworks represents an important direction for future research aimed at enhancing such reasoning capabilities.
感知之外, 公开和内部基准都显示高层推理上也有挑战. Seed1.5-VL 在对人类很简单的推理任务上表现欠佳, 如解华容道或走简单迷宫, 这提示未来需要探索视觉 CoT 之类的技术, 让模型能借助辅助视觉手段 (如画线) 增强推理过程. 需要组合搜索的推理对许多现有 VLM 都是重大挑战. 图 27 和图 28 给出两个属于这一类的示例问题. 组合搜索任务对当前 VLM 架构很难, 但往往更容易用程序或代码方式解决. 因此, 把代码使用和其他外部工具纳入 VLM 框架, 是增强这类推理能力的重要研究方向.

Limitations are observed in 3D spatial reasoning tasks for most VLMs. These challenges include, for example, tasks involving 3D object manipulation or reasoning about the projection of 3D objects. Specific instances illustrating such failure cases are provided in figure 25. A potential direction to address this limitation is the incorporation of image generation capabilities into the foundation model, which could further enable visual chain-of-thought mechanisms. This approach remains a subject for future research.
多数 VLM 在 3D 空间推理任务上都有局限. 例如涉及 3D 物体操作或推理 3D 物体投影的任务. 图 25 给出这类失败案例的具体实例. 解决这一局限的一个可能方向是把图像生成能力纳入基础模型, 进一步支撑视觉 CoT 机制. 这仍有待未来研究.

Additionally, VLMs sometimes still produce incorrect inferences, particularly in tasks such as visual puzzles.
此外, VLM 有时仍会做出错误推断, 尤其在视觉谜题这类任务上.

<!-- page 32 of 77 -->

These reasoning errors may stem from underlying perceptual mistakes (misinterpreting shapes or conditions) or from limitations in the logical deduction process itself. In tasks requiring planning or adherence to complex instructions, Seed1.5-VL may overlook specific conditions or introduce unfounded assumptions, which can lead to incomplete or invalid responses.
这些推理错误可能源于底层的感知失误 (误读形状或条件), 也可能源于逻辑推演过程本身的局限. 在需要规划或遵守复杂指令的任务中, Seed1.5-VL 可能忽略特定条件或引入没有根据的假设, 导致回答不完整或无效.

Our internal evaluations also revealed model’s deficiency in temporal reasoning capability, as the model faced difficulties in discerning the chronological sequence of continuous actions or inferring order from the before and-after states of objects. The capacity for multi-image reasoning is limited, with performance degrading on tasks requiring the synthesis of clues across multiple images with strong logical interdependencies.
内部评测还暴露出模型在时间推理上的不足: 模型难以分辨连续动作的先后顺序, 也难以从物体前后状态推断顺序. 多图推理能力有限, 在需要综合多张图中逻辑上强相互依赖的线索的任务上, 表现会下降.

Finally, hallucination persists as a significant challenge for all VLMs. Figure 26 illustrates a particularly notable case where the visual input conflicts with the prior knowledge acquired from the language model component. In such instances, models tend to prioritize this acquired knowledge, effectively overriding or conforming the perceived visual information to align with learned priors.
最后, 幻觉仍是所有 VLM 面临的重大挑战. 图 26 展示了一个特别值得注意的案例: 视觉输入与语言模型部分习得的先验知识冲突. 这种情况下, 模型倾向于优先采信习得的知识, 实际上是用学到的先验覆盖或扭曲所感知的视觉信息.

## 7 Conclusion and Next Steps

In this paper, we presented Seed1.5-VL, our latest multimodal foundation model demonstrating strong capabilities in reasoning, OCR, diagram understanding, visual grounding, 3D spatial understanding, and video understanding. Despite its relatively moderate size, Seed1.5-VL achieves state-of-the-art results on 38 out of 60 evaluated public benchmarks, including a score of 77.9 on the MMMU benchmark, widely regarded as a key indicator of multimodal reasoning ability.
本文介绍了 Seed1.5-VL, 我们最新的多模态基础模型, 在推理, OCR, 图表理解, 视觉 grounding, 3D 空间理解和视频理解上能力强. 尽管规模相对适中, Seed1.5-VL 在评测的 60 个公开基准中的 38 个上达到 SOTA, 包括在被广泛视为多模态推理关键指标的 MMMU 上拿到 77.9.

Beyond benchmark performance, Seed1.5-VL exhibits significant integrated capabilities and generalization to tasks dissimilar to its training data. Examples include solving complex visual reasoning tasks such as Rebus puzzles, interpreting and correcting handwritten code from whiteboard images, and functioning as an agent for computer interaction and gameplay. Further exploration of these emergent abilities is warranted.
基准之外, Seed1.5-VL 展现出明显的综合能力, 以及对与训练数据差异很大的任务的泛化. 例子包括解画谜这类复杂视觉推理任务, 从白板图像中读懂并纠正手写代码, 以及作为 agent 操作电脑和玩游戏. 这些涌现能力值得进一步探索.

Our scaling analysis indicates that model performance shows no sign of saturation, suggesting that increasing model parameters and training compute represents a promising immediate direction. Through our evaluations, we also identified limitations common to contemporary VLMs, such as robust 3D spatial reasoning, hallucination mitigation, and complex combinatorial search. Addressing these challenges constitutes a core part of our ongoing research, which includes efforts towards unifying existing model capabilities with image generation (potentially enabling visual Chain-of-Thought) and incorporating robust tool-use mechanisms.
我们的 Scaling 分析表明模型表现没有饱和迹象, 说明增加模型参数和训练算力是一个有前景的近期方向. 通过评测, 我们也识别出当代 VLM 的共同局限, 如稳健的 3D 空间推理, 缓解幻觉和复杂组合搜索. 解决这些挑战是我们正在进行的研究的核心, 包括把现有模型能力与图像生成统一 (可能支撑视觉 CoT), 以及纳入稳健的工具使用机制.

The advancements presented here build upon substantial prior work within the AI research community, leveraging foundational developments like the Transformer and Vision Transformer architectures. To contribute to future progress, we have detailed our model architecture, data synthesis pipeline, training methodology, training framework innovations, and internal evaluation design in this report.
本文的进展建立在 AI 研究社区大量前人工作之上, 用到了 Transformer 和 Vision Transformer 架构等基础成果. 为促进后续进展, 本报告详细介绍了模型架构, 数据合成管线, 训练方法, 训练框架创新和内部评测设计.

<!-- page 33 of 77 -->

## References

[1] Fuyu-8b: A multimodal architecture for ai agents. [https://www.adept.ai/blog/fuyu-8b](https://www.adept.ai/blog/fuyu-8b), 2023.

[2] Marah Abdin, Jyoti Aneja, Hany Awadalla, Ahmed Awadallah, Ammar Ahmad Awan, Nguyen Bach, Amit Bahree, Arash Bakhtiari, Jianmin Bao, Harkirat Behl, et al. Phi-3 technical report: A highly capable language model locally on your phone. arXiv preprint arXiv:2404.14219, 2024.

[3] Niki Amini-Naieni, Tengda Han, and Andrew Zisserman. Countgd: Multi-modal open-world counting. Advances in Neural Information Processing Systems, 37:48810–48837, 2024.

[4] Elmira Amirloo, Jean-Philippe Fauconnier, Christoph Roesmann, Christian Kerl, Rinu Boney, Yusu Qian, Zirui Wang, Afshin Dehghan, Yinfei Yang, Zhe Gan, et al. Understanding alignment in multimodal llms: A comprehensive study. arXiv preprint arXiv:2407.02477, 2024.

[5] Anthropic. Claude 3.7 sonnet system card. 2025.

[6] anthropic. Claude’s extended thinking, 2025. URL [https://www.anthropic.com/news/visible-extended-thinking](https://www.anthropic.com/news/visible-extended-thinking).

[7] Shuai Bai, Keqin Chen, Xuejing Liu, Jialin Wang, Wenbin Ge, Sibo Song, Kai Dang, Peng Wang, Shijie Wang, Jun Tang, et al. Qwen2. 5-vl technical report. arXiv preprint arXiv:2502.13923, 2025.

[8] Andrei Barbu, David Mayo, Julian Alverio, William Luo, Christopher Wang, Dan Gutfreund, Josh Tenenbaum, and Boris Katz. Objectnet: A large-scale bias-controlled dataset for pushing the limits of object recognition models. Advances in neural information processing systems, 32, 2019.

[9] Gilad Baruch, Zhuoyuan Chen, Afshin Dehghan, Tal Dimry, Yuri Feigin, Peter Fu, Thomas Gebauer, Brandon Joffe, Daniel Kurz, Arik Schwartz, et al. Arkitscenes: A diverse real-world dataset for 3d indoor scene understanding using mobile rgb-d data. arXiv preprint arXiv:2111.08897, 2021.

[10] Lucas Beyer, Andreas Steiner, André Susano Pinto, Alexander Kolesnikov, Xiao Wang, Daniel Salz, Maxim Neumann, Ibrahim Alabdulmohsin, Michael Tschannen, Emanuele Bugliarello, et al. Paligemma: A versatile 3b vlm for transfer. arXiv preprint arXiv:2407.07726, 2024.

[11] Rogerio Bonatti, Dan Zhao, Francesco Bonacci, Dillon Dupont, Sara Abdali, Yinheng Li, Yadong Lu, Justin Wagle, Kazuhito Koishida, Arthur Bucker, et al. Windows agent arena: Evaluating multi-modal os agents at scale. arXiv preprint arXiv:2409.08264, 2024.

[12] Mu Cai, Reuben Tan, Jianrui Zhang, Bocheng Zou, Kai Zhang, Feng Yao, Fangrui Zhu, Jing Gu, Yiwu Zhong, Yuzhang Shang, et al. Temporalbench: Benchmarking fine-grained temporal understanding for multimodal video models. arXiv preprint arXiv:2410.10818, 2024.

[13] Li-Wen Chang, Wenlei Bao, Qi Hou, Chengquan Jiang, Ningxin Zheng, Yinmin Zhong, Xuanrun Zhang, Zuquan Song, Chengji Yao, Ziheng Jiang, et al. Flux: Fast software-based communication overlap on gpus through kernel fusion. arXiv preprint arXiv:2406.06858, 2024.

[14] Kai Chen, Jiaqi Wang, Jiangmiao Pang, Yuhang Cao, Yu Xiong, Xiaoxiao Li, Shuyang Sun, Wansen Feng, Ziwei Liu, Jiarui Xu, Zheng Zhang, Dazhi Cheng, Chenchen Zhu, Tianheng Cheng, Qijie Zhao, Buyu Li, Xin Lu, Rui Zhu, Yue Wu, Jifeng Dai, Jingdong Wang, Jianping Shi, Wanli Ouyang, Chen Change Loy, and Dahua Lin. MMDetection: Open mmlab detection toolbox and benchmark. arXiv preprint arXiv:1906.07155, 2019.

[15] Lin Chen, Jinsong Li, Xiaoyi Dong, Pan Zhang, Yuhang Zang, Zehui Chen, Haodong Duan, Jiaqi Wang, Yu Qiao, Dahua Lin, et al. Are we on the right way for evaluating large vision-language models? arXiv preprint arXiv:2403.20330, 2024.

[16] Zhe Chen, Jiannan Wu, Wenhai Wang, Weijie Su, Guo Chen, Sen Xing, Muyan Zhong, Qinglong Zhang, Xizhou Zhu, Lewei Lu, et al. Internvl: Scaling up vision foundation models and aligning for generic visual-linguistic tasks. In Proceedings of the IEEE/CVF conference on computer vision and pattern recognition, pages 24185–24198, 2024.

[17] Tianheng Cheng, Lin Song, Yixiao Ge, Wenyu Liu, Xinggang Wang, and Ying Shan. Yolo-world: Real-time open-vocabulary object detection. In Proceedings of the IEEE/CVF Conference on Computer Vision and Pattern Recognition (CVPR), pages 16901–16911, June 2024.

<!-- page 34 of 77 -->

[18] Yew Ken Chia, Vernon Toh Yan Han, Deepanway Ghosal, Lidong Bing, and Soujanya Poria. Puzzlevqa: Diagnosing multimodal reasoning challenges of language models with abstract visual patterns, 2024. URL [https://arxiv.org/abs/2403.13315](https://arxiv.org/abs/2403.13315).

[19] Daniel Cores, Michael Dorkenwald, Manuel Mucientes, Cees GM Snoek, and Yuki M Asano. Tvbench: Redesigning video-language evaluation. arXiv preprint arXiv:2410.07752, 2024.

[20] Mostafa Dehghani, Basil Mustafa, Josip Djolonga, Jonathan Heek, Matthias Minderer, Mathilde Caron, Andreas Steiner, Joan Puigcerver, Robert Geirhos, Ibrahim M Alabdulmohsin, et al. Patch n’pack: Navit, a vision transformer for any aspect ratio and resolution. Advances in Neural Information Processing Systems, 36: 2252–2274, 2023.

[21] Matt Deitke, Christopher Clark, Sangho Lee, Rohun Tripathi, Yue Yang, Jae Sung Park, Mohammadreza Salehi, Niklas Muennighoff, Kyle Lo, Luca Soldaini, et al. Molmo and pixmo: Open weights and open data for state-of-the-art multimodal models. arXiv preprint arXiv:2409.17146, 2024.

[22] Jia Deng, Wei Dong, Richard Socher, Li-Jia Li, Kai Li, and Li Fei-Fei. Imagenet: A large-scale hierarchical image database. In 2009 IEEE conference on computer vision and pattern recognition, pages 248–255. Ieee, 2009.

[23] Haiwen Diao, Yufeng Cui, Xiaotong Li, Yueze Wang, Huchuan Lu, and Xinlong Wang. Unveiling encoder-free vision-language models. arXiv preprint arXiv:2406.11832, 2024.

[24] Haiwen Diao, Yufeng Cui, Xiaotong Li, Yueze Wang, Huchuan Lu, and Xinlong Wang. Unveiling encoder-free vision-language models. arXiv preprint arXiv:2406.11832, 2024.

[25] Guanting Dong, Keming Lu, Chengpeng Li, Tingyu Xia, Bowen Yu, Chang Zhou, and Jingren Zhou. Self-play with execution feedback: Improving instruction-following capabilities of large language models, 2024. URL [https://arxiv.org/abs/2406.13542](https://arxiv.org/abs/2406.13542).

[26] Alexey Dosovitskiy, Lucas Beyer, Alexander Kolesnikov, Dirk Weissenborn, Xiaohua Zhai, Thomas Unterthiner, Mostafa Dehghani, Matthias Minderer, Georg Heigold, Sylvain Gelly, et al. An image is worth 16x16 words: Transformers for image recognition at scale. arXiv preprint arXiv:2010.11929, 2020.

[27] Debidatta Dwibedi, Yusuf Aytar, Jonathan Tompson, Pierre Sermanet, and Andrew Zisserman. Counting out time: Class agnostic video repetition counting in the wild. In Proceedings of the IEEE/CVF conference on computer vision and pattern recognition, pages 10387–10396, 2020.

[28] Alex Fang, Albin Madappally Jose, Amit Jain, Ludwig Schmidt, Alexander Toshev, and Vaishaal Shankar. Data filtering networks. arXiv preprint arXiv:2309.17425, 2023.

[29] Yuxin Fang, Wen Wang, Binhui Xie, Quan Sun, Ledell Wu, Xinggang Wang, Tiejun Huang, Xinlong Wang, and Yue Cao. Eva: Exploring the limits of masked visual representation learning at scale. In Proceedings of the IEEE/CVF conference on computer vision and pattern recognition, pages 19358–19369, 2023.

[30] Weiqi Feng, Yangrui Chen, Shaoyu Wang, Yanghua Peng, Haibin Lin, and Minlan Yu. Optimus: Accelerating large-scale multi-modal llm training by bubble exploitation. arXiv preprint arXiv:2408.03505, 2024.

[31] Figure AI. Helix: A vision-language-action model for generalist humanoid control. [https://www.figure.ai/news/helix](https://www.figure.ai/news/helix), 2025. Accessed: 2025-04-23.

[32] Chaoyou Fu, Yuhan Dai, Yongdong Luo, Lei Li, Shuhuai Ren, Renrui Zhang, Zihan Wang, Chenyu Zhou, Yunhang Shen, Mengdan Zhang, et al. Video-mme: The first-ever comprehensive evaluation benchmark of multi-modal llms in video analysis. arXiv preprint arXiv:2405.21075, 2024.

[33] Xingyu Fu, Yushi Hu, Bangzheng Li, Yu Feng, Haoyu Wang, Xudong Lin, Dan Roth, Noah A Smith, Wei-Chiu Ma, and Ranjay Krishna. Blink: Multimodal large language models can see but not perceive. In European Conference on Computer Vision, pages 148–166. Springer, 2024.

[34] Jiyang Gao, Chen Sun, Zhenheng Yang, and Ram Nevatia. Tall: Temporal activity localization via language query. In Proceedings of the IEEE international conference on computer vision, pages 5267–5275, 2017.

[35] Google. Experiment with gemini 2.0 flash native image generation. [https://developers.googleblog.com/en/experiment-with-gemini-20-flash-native-image-generation](https://developers.googleblog.com/en/experiment-with-gemini-20-flash-native-image-generation), 2025.

[36] Aleksandr Gordeev, Vladimir Dokholyan, Irina Tolstykh, and Maksim Kuprashevich. Saliency-guided detr for moment retrieval and highlight detection. arXiv preprint arXiv:2410.01615, 2024.

<!-- page 35 of 77 -->

[37] Aaron Grattafiori, Abhimanyu Dubey, Abhinav Jauhri, Abhinav Pandey, Abhishek Kadian, Ahmad Al-Dahle, Aiesha Letman, Akhil Mathur, Alan Schelten, Alex Vaughan, et al. The llama 3 herd of models. arXiv preprint arXiv:2407.21783, 2024.

[38] Tianrui Guan, Fuxiao Liu, Xiyang Wu, Ruiqi Xian, Zongxia Li, Xiaoyu Liu, Xijun Wang, Lichang Chen, Furong Huang, Yaser Yacoob, et al. Hallusionbench: an advanced diagnostic suite for entangled language hallucination and visual illusion in large vision-language models. In Proceedings of the IEEE/CVF Conference on Computer Vision and Pattern Recognition, pages 14375–14385, 2024.

[39] Daya Guo, Dejian Yang, Haowei Zhang, Junxiao Song, Ruoyu Zhang, Runxin Xu, Qihao Zhu, Shirong Ma, Peiyi Wang, Xiao Bi, et al. Deepseek-r1: Incentivizing reasoning capability in llms via reinforcement learning. arXiv preprint arXiv:2501.12948, 2025.

[40] Agrim Gupta, Piotr Dollar, and Ross Girshick. Lvis: A dataset for large vocabulary instance segmentation. In Proceedings of the IEEE/CVF conference on computer vision and pattern recognition, pages 5356–5364, 2019.

[41] Chaoqun He, Renjie Luo, Yuzhuo Bai, Shengding Hu, Zhen Leng Thai, Junhao Shen, Jinyi Hu, Xu Han, Yujie Huang, Yuxiang Zhang, et al. Olympiadbench: A challenging benchmark for promoting agi with olympiad-level bilingual multimodal scientific problems. arXiv preprint arXiv:2402.14008, 2024.

[42] Hongliang He, Wenlin Yao, Kaixin Ma, Wenhao Yu, Yong Dai, Hongming Zhang, Zhenzhong Lan, and Dong Yu. Webvoyager: Building an end-to-end web agent with large multimodal models. arXiv preprint arXiv:2401.13919, 2024.

[43] Dan Hendrycks, Steven Basart, Norman Mu, Saurav Kadavath, Frank Wang, Evan Dorundo, Rahul Desai, Tyler Zhu, Samyak Parajuli, Mike Guo, et al. The many faces of robustness: A critical analysis of out-of-distribution generalization. In Proceedings of the IEEE/CVF international conference on computer vision, pages 8340–8349, 2021.

[44] Dan Hendrycks, Kevin Zhao, Steven Basart, Jacob Steinhardt, and Dawn Song. Natural adversarial examples. In Proceedings of the IEEE/CVF conference on computer vision and pattern recognition, pages 15262–15271, 2021.

[45] Tom Henighan, Jared Kaplan, Mor Katz, Mark Chen, Christopher Hesse, Jacob Jackson, Heewoo Jun, Tom B Brown, Prafulla Dhariwal, Scott Gray, et al. Scaling laws for autoregressive generative modeling. arXiv preprint arXiv:2010.14701, 2020.

[46] Jordan Hoffmann, Sebastian Borgeaud, Arthur Mensch, Elena Buchatskaya, Trevor Cai, Eliza Rutherford, Diego de Las Casas, Lisa Anne Hendricks, Johannes Welbl, Aidan Clark, et al. Training compute-optimal large language models. arXiv preprint arXiv:2203.15556, 2022.

[47] Ari Holtzman, Jan Buys, Li Du, Maxwell Forbes, and Yejin Choi. The curious case of neural text degeneration. arXiv preprint arXiv:1904.09751, 2019.

[48] Wenyi Hong, Yean Cheng, Zhuoyi Yang, Weihan Wang, Lefan Wang, Xiaotao Gu, Shiyu Huang, Yuxiao Dong, and Jie Tang. Motionbench: Benchmarking and improving fine-grained video motion understanding for vision language models. arXiv preprint arXiv:2501.02955, 2025.

[49] Kairui Hu, Penghao Wu, Fanyi Pu, Wang Xiao, Yuanhan Zhang, Xiang Yue, Bo Li, and Ziwei Liu. Video-mmmu: Evaluating knowledge acquisition from multi-discipline professional videos. arXiv preprint arXiv:2501.13826, 2025.

[50] Yanping Huang, Youlong Cheng, Ankur Bapna, Orhan Firat, Dehao Chen, Mia Chen, HyoukJoong Lee, Jiquan Ngiam, Quoc V Le, Yonghui Wu, et al. Gpipe: Efficient training of giant neural networks using pipeline parallelism. Advances in neural information processing systems, 32, 2019.

[51] Zhenpeng Huang, Xinhao Li, Jiaqi Li, Jing Wang, Xiangyu Zeng, Cheng Liang, Tao Wu, Xi Chen, Liang Li, and Limin Wang. Online video understanding: A comprehensive benchmark and memory-augmented method. arXiv preprint arXiv:2501.00584, 2024.

[52] Zilong Huang, Qinghao Ye, Bingyi Kang, Jiashi Feng, and Haoqi Fan. Classification done right for vision-language pre-training. Advances in Neural Information Processing Systems, 37:96483–96504, 2024.

[53] J. D. Hunter. Matplotlib: A 2d graphics environment. Computing in Science & Engineering, 9(3):90–95, 2007. doi: 10.1109/MCSE.2007.55.

<!-- page 36 of 77 -->

[54] Aaron Hurst, Adam Lerer, Adam P Goucher, Adam Perelman, Aditya Ramesh, Aidan Clark, AJ Ostrow, Akila Welihinda, Alan Hayes, Alec Radford, et al. Gpt-4o system card. arXiv preprint arXiv:2410.21276, 2024.

[55] Physical Intelligence, Kevin Black, Noah Brown, James Darpinian, Karan Dhabalia, Danny Driess, Adnan Esmail, Michael Equi, Chelsea Finn, Niccolo Fusai, Manuel Y. Galliker, Dibya Ghosh, Lachy Groom, Karol Hausman, Brian Ichter, Szymon Jakubczak, Tim Jones, Liyiming Ke, Devin LeBlanc, Sergey Levine, Adrian Li-Bell, Mohith Mothukuri, Suraj Nair, Karl Pertsch, Allen Z. Ren, Lucy Xiaoyang Shi, Laura Smith, Jost Tobias Springenberg, Kyle Stachowicz, James Tanner, Quan Vuong, Homer Walke, Anna Walling, Haohuan Wang, Lili Yu, and Ury Zhilinsky. π0.5: A vision-language-action model with open-world generalization. arXiv preprint arXiv:2504.16054, 2025. URL [https://arxiv.org/abs/2504.16054](https://arxiv.org/abs/2504.16054).

[56] Aaron Jaech, Adam Kalai, Adam Lerer, Adam Richardson, Ahmed El-Kishky, Aiden Low, Alec Helyar, Aleksander Madry, Alex Beutel, Alex Carney, et al. Openai o1 system card. arXiv preprint arXiv:2412.16720, 2024.

[57] Ziheng Jiang, Haibin Lin, Yinmin Zhong, Qi Huang, Yangrui Chen, Zhi Zhang, Yanghua Peng, Xiang Li, Cong Xie, Shibiao Nong, et al. {MegaScale}: Scaling large language model training to more than 10,000 {GPUs}. In 21st USENIX Symposium on Networked Systems Design and Implementation (NSDI 24), pages 745–760, 2024.

[58] Samira Ebrahimi Kahou, Vincent Michalski, Adam Atkinson, Ákos Kádár, Adam Trischler, and Yoshua Bengio. Figureqa: An annotated figure dataset for visual reasoning. arXiv preprint arXiv:1710.07300, 2017.

[59] Jared Kaplan, Sam McCandlish, Tom Henighan, Tom B Brown, Benjamin Chess, Rewon Child, Scott Gray, Alec Radford, Jeffrey Wu, and Dario Amodei. Scaling laws for neural language models. arXiv preprint arXiv:2001.08361, 2020.

[60] Sahar Kazemzadeh, Vicente Ordonez, Mark Matten, and Tamara Berg. Referitgame: Referring to objects in photographs of natural scenes. In Proceedings of the 2014 conference on empirical methods in natural language processing (EMNLP), pages 787–798, 2014.

[61] Aniruddha Kembhavi, Mike Salvato, Eric Kolve, Minjoon Seo, Hannaneh Hajishirzi, and Ali Farhadi. A diagram is worth a dozen images. In Computer Vision–ECCV 2016: 14th European Conference, Amsterdam, The Netherlands, October 11–14, 2016, Proceedings, Part IV 14, pages 235–251. Springer, 2016.

[62] Geewook Kim, Teakgyu Hong, Moonbin Yim, JeongYeon Nam, Jinyoung Park, Jinyeong Yim, Wonseok Hwang, Sangdoo Yun, Dongyoon Han, and Seunghyun Park. Ocr-free document understanding transformer. In European Conference on Computer Vision (ECCV), 2022.

[63] Moo Jin Kim, Karl Pertsch, Siddharth Karamcheti, Ted Xiao, Ashwin Balakrishna, Suraj Nair, Rafael Rafailov, Ethan P Foster, Grace Lam, Pannag R Sanketi, Quan Vuong, Thomas Kollar, Benjamin Burchfiel, Russ Tedrake, Dorsa Sadigh, Sergey Levine, Percy Liang, and Chelsea Finn. Openvla: An open-source vision-language-action model. In Pulkit Agrawal, Oliver Kroemer, and Wolfram Burgard, editors, Proceedings of The 8th Conference on Robot Learning, volume 270 of Proceedings of Machine Learning Research, pages 2679–2713. PMLR, 06–09 Nov 2025. URL [https://proceedings.mlr.press/v270/kim25c.html](https://proceedings.mlr.press/v270/kim25c.html).

[64] Diederik P Kingma and Jimmy Ba. Adam: A method for stochastic optimization. arXiv preprint arXiv:1412.6980, 2014.

[65] Vijay Anand Korthikanti, Jared Casper, Sangkug Lym, Lawrence McAfee, Michael Andersch, Mohammad Shoeybi, and Bryan Catanzaro. Reducing activation recomputation in large transformer models. Proceedings of Machine Learning and Systems, 5:341–353, 2023.

[66] Alina Kuznetsova, Hassan Rom, Neil Alldrin, Jasper Uijlings, Ivan Krasin, Jordi Pont-Tuset, Shahab Kamali, Stefan Popov, Matteo Malloci, Alexander Kolesnikov, Tom Duerig, and Vittorio Ferrari. The open images dataset v4: Unified image classification, object detection, and visual relationship detection at scale. IJCV, 2020.

[67] Woosuk Kwon, Zhuohan Li, Siyuan Zhuang, Ying Sheng, Lianmin Zheng, Cody Hao Yu, Joseph E. Gonzalez, Hao Zhang, and Ion Stoica. Efficient memory management for large language model serving with pagedattention, 2023. URL [https://arxiv.org/abs/2309.06180](https://arxiv.org/abs/2309.06180).

[68] Nathan Lambert, Jacob Morrison, Valentina Pyatkin, Shengyi Huang, Hamish Ivison, Faeze Brahman, Lester James V Miranda, Alisa Liu, Nouha Dziri, Shane Lyu, et al. T\" ulu 3: Pushing frontiers in open language model post-training. arXiv preprint arXiv:2411.15124, 2024.

[69] Nathan Lambert, Jacob Morrison, Valentina Pyatkin, Shengyi Huang, Hamish Ivison, Faeze Brahman, Lester James V. Miranda, Alisa Liu, Nouha Dziri, Shane Lyu, Yuling Gu, Saumya Malik, Victoria Graf, Jena D. Hwang,

<!-- page 37 of 77 -->

Jiangjiang Yang, Ronan Le Bras, Oyvind Tafjord, Chris Wilhelm, Luca Soldaini, Noah A. Smith, Yizhong Wang, Pradeep Dasigi, and Hannaneh Hajishirzi. Tulu 3: Pushing frontiers in open language model post-training, 2025. URL [https://arxiv.org/abs/2411.15124](https://arxiv.org/abs/2411.15124).

[70] Deqing Li, Honghui Mei, Yi Shen, Shuang Su, Wenli Zhang, Junting Wang, Ming Zu, and Wei Chen. Echarts: a declarative framework for rapid construction of web-based visualization. Visual Informatics, 2(2):136–146, 2018.

[71] Feng Li, Renrui Zhang, Hao Zhang, Yuanhan Zhang, Bo Li, Wei Li, Zejun Ma, and Chunyuan Li. Llava-nextinterleave: Tackling multi-image, video, and 3d in large multimodal models. arXiv preprint arXiv:2407.07895, 2024.

[72] Kaixin Li, Ziyang Meng, Hongzhan Lin, Ziyang Luo, Yuchen Tian, Jing Ma, Zhiyong Huang, and Tat-Seng Chua. Screenspot-pro: Gui grounding for professional high-resolution computer use. arXiv preprint arXiv:2504.07981, 2025.

[73] Kunchang Li, Yali Wang, Yinan He, Yizhuo Li, Yi Wang, Yi Liu, Zun Wang, Jilan Xu, Guo Chen, Ping Luo, et al. Mvbench: A comprehensive multi-modal video understanding benchmark. In Proceedings of the IEEE/CVF Conference on Computer Vision and Pattern Recognition, pages 22195–22206, 2024.

[74] Yifei Li, Junbo Niu, Ziyang Miao, Chunjiang Ge, Yuanhang Zhou, Qihao He, Xiaoyi Dong, Haodong Duan, Shuangrui Ding, Rui Qian, et al. Ovo-bench: How far is your video-llms from real-world online video understanding? arXiv preprint arXiv:2501.05510, 2025.

[75] Zichao Li, Xueru Wen, Jie Lou, Yuqiu Ji, Yaojie Lu, Xianpei Han, Debing Zhang, and Le Sun. The devil is in the details: Tackling unimodal spurious correlations for generalizable multimodal reward models. arXiv preprint arXiv:2503.03122, 2025.

[76] Junming Lin, Zheng Fang, Chi Chen, Zihao Wan, Fuwen Luo, Peng Li, Yang Liu, and Maosong Sun. Streamingbench: Assessing the gap for mllms to achieve streaming video understanding. arXiv preprint arXiv:2411.03628, 2024.

[77] Hao Liu, Matei Zaharia, and Pieter Abbeel. Ring attention with blockwise transformers for near-infinite context. arXiv preprint arXiv:2310.01889, 2023.

[78] Haotian Liu, Chunyuan Li, Qingyang Wu, and Yong Jae Lee. Visual instruction tuning, 2023.

[79] Junpeng Liu, Yifan Song, Bill Yuchen Lin, Wai Lam, Graham Neubig, Yuanzhi Li, and Xiang Yue. Visualwebbench: How far have multimodal llms evolved in web page understanding and grounding? arXiv preprint arXiv:2404.05955, 2024.

[80] Shilong Liu, Zhaoyang Zeng, Tianhe Ren, Feng Li, Hao Zhang, Jie Yang, Qing Jiang, Chunyuan Li, Jianwei Yang, Hang Su, et al. Grounding dino: Marrying dino with grounded pre-training for open-set object detection. In European Conference on Computer Vision, pages 38–55. Springer, 2024.

[81] Yuan Liu, Haodong Duan, Yuanhan Zhang, Bo Li, Songyang Zhang, Wangbo Zhao, Yike Yuan, Jiaqi Wang, Conghui He, Ziwei Liu, et al. Mmbench: Is your multi-modal model an all-around player? In European conference on computer vision, pages 216–233. Springer, 2024.

[82] Yuanxin Liu, Shicheng Li, Yi Liu, Yuxiang Wang, Shuhuai Ren, Lei Li, Sishuo Chen, Xu Sun, and Lu Hou. Tempcompass: Do video llms really understand videos? arXiv preprint arXiv:2403.00476, 2024.

[83] Yuliang Liu, Zhang Li, Mingxin Huang, Biao Yang, Wenwen Yu, Chunyuan Li, Xu-Cheng Yin, Cheng-Lin Liu, Lianwen Jin, and Xiang Bai. Ocrbench: on the hidden mystery of ocr in large multimodal models. Science China Information Sciences, 67(12):220102, 2024.

[84] Pan Lu, Hritik Bansal, Tony Xia, Jiacheng Liu, Chunyuan Li, Hannaneh Hajishirzi, Hao Cheng, Kai-Wei Chang, Michel Galley, and Jianfeng Gao. Mathvista: Evaluating mathematical reasoning of foundation models in visual contexts. arXiv preprint arXiv:2310.02255, 2023.

[85] Ruilin Luo, Zhuofan Zheng, Yifan Wang, Yiyao Yu, Xinzhe Ni, Zicheng Lin, Jin Zeng, and Yujiu Yang. Ursa: Understanding and verifying chain-of-thought reasoning in multimodal mathematics. arXiv preprint arXiv:2501.04686, 2025.

[86] Dakota Mahan, Duy Van Phung, Rafael Rafailov, Chase Blagden, Nathan Lile, Louis Castricato, Jan-Philipp Fränken, Chelsea Finn, and Alon Albalak. Generative reward models. arXiv preprint arXiv:2410.12832, 2024.

<!-- page 38 of 77 -->

[87] Karttikeya Mangalam, Raiymbek Akshulakov, and Jitendra Malik. Egoschema: A diagnostic benchmark for very long-form video language understanding. Advances in Neural Information Processing Systems, 36:46212–46244, 2023.

[88] Ahmed Masry, Do Xuan Long, Jia Qing Tan, Shafiq Joty, and Enamul Hoque. Chartqa: A benchmark for question answering about charts with visual and logical reasoning. arXiv preprint arXiv:2203.10244, 2022.

[89] Minesh Mathew, Dimosthenis Karatzas, and CV Jawahar. Docvqa: A dataset for vqa on document images. In Proceedings of the IEEE/CVF winter conference on applications of computer vision, pages 2200–2209, 2021.

[90] Minesh Mathew, Viraj Bagal, Rubèn Tito, Dimosthenis Karatzas, Ernest Valveny, and CV Jawahar. Infographicvqa. In Proceedings of the IEEE/CVF Winter Conference on Applications of Computer Vision, pages 1697–1706, 2022.

[91] AI Meta. The llama 4 herd: The beginning of a new era of natively multimodal ai innovation. https://ai.meta.com/blog/llama-4-multimodal-intelligence/, 2025.

[92] Varun K Nagaraja, Vlad I Morariu, and Larry S Davis. Modeling context between objects for referring expression understanding. In Computer Vision–ECCV 2016: 14th European Conference, Amsterdam, The Netherlands, October 11–14, 2016, Proceedings, Part IV 14, pages 792–807. Springer, 2016.

[93] Deepak Narayanan, Amar Phanishayee, Kaiyu Shi, Xie Chen, and Matei Zaharia. Memory-efficient pipelineparallel dnn training. In International Conference on Machine Learning, pages 7937–7947. PMLR, 2021.

[94] Deepak Narayanan, Mohammad Shoeybi, Jared Casper, Patrick LeGresley, Mostofa Patwary, Vijay Korthikanti, Dmitri Vainbrand, Prethvi Kashinkunti, Julie Bernauer, Bryan Catanzaro, et al. Efficient large-scale language model training on gpu clusters using megatron-lm. In Proceedings of the international conference for high performance computing, networking, storage and analysis, pages 1–15, 2021.

[95] Pushmeet Kohli Nathan Silberman, Derek Hoiem and Rob Fergus. Indoor segmentation and support inference from rgbd images. In ECCV, 2012.

[96] OpenAI. Gpt-4v(ision) system card. [https://openai.com/index/gpt-4v-system-card/](https://openai.com/index/gpt-4v-system-card/), 2023. Accessed: 2025-04-23.

[97] OpenAI. Addendum to gpt-4o system card: 4o image generation. [https://openai.com/index/gpt-4o-image-generation-system-card-addendum/](https://openai.com/index/gpt-4o-image-generation-system-card-addendum/), 2025.

[98] openai. Operator, 2025. URL [https://openai.com/index/introducing-operator/](https://openai.com/index/introducing-operator/).

[99] Maxime Oquab, Timothée Darcet, Théo Moutakanni, Huy Vo, Marc Szafraniec, Vasil Khalidov, Pierre Fernandez, Daniel Haziza, Francisco Massa, Alaaeldin El-Nouby, et al. Dinov2: Learning robust visual features without supervision. arXiv preprint arXiv:2304.07193, 2023.

[100] Long Ouyang, Jeff Wu, Xu Jiang, Diogo Almeida, Carroll L. Wainwright, Pamela Mishkin, Chong Zhang, Sandhini Agarwal, Katarina Slama, Alex Ray, John Schulman, Jacob Hilton, Fraser Kelton, Luke Miller, Maddie Simens, Amanda Askell, Peter Welinder, Paul Christiano, Jan Leike, and Ryan Lowe. Training language models to follow instructions with human feedback, 2022. URL [https://arxiv.org/abs/2203.02155](https://arxiv.org/abs/2203.02155).

[101] David Owen. How predictable is language model benchmark performance? arXiv preprint arXiv:2401.04757, 2024.

[102] Roni Paiss, Ariel Ephrat, Omer Tov, Shiran Zada, Inbar Mosseri, Michal Irani, and Tali Dekel. Teaching clip to count to ten. In Proceedings of the IEEE/CVF International Conference on Computer Vision, pages 3170–3180, 2023.

[103] Chenbin Pan, Yujun Shen, Yujie Wang, Yujing Wang, Yifan Liu, Jiajun Shen, and Yiming Qian. Vlp: Vision language planning for autonomous driving. In Proceedings of the IEEE/CVF Conference on Computer Vision and Pattern Recognition (CVPR), pages 12345–12354, 2024.

[104] Zhiliang Peng, Wenhui Wang, Li Dong, Yaru Hao, Shaohan Huang, Shuming Ma, and Furu Wei. Kosmos-2: Grounding multimodal large language models to the world. arXiv preprint arXiv:2306.14824, 2023.

[105] Yujia Qin, Yining Ye, Junjie Fang, Haoming Wang, Shihao Liang, Shizuo Tian, Junda Zhang, Jiahao Li, Yunxin Li, Shijue Huang, et al. Ui-tars: Pioneering automated gui interaction with native agents. arXiv preprint arXiv:2501.12326, 2025.

<!-- page 39 of 77 -->

[106] Alec Radford, Jong Wook Kim, Chris Hallacy, Aditya Ramesh, Gabriel Goh, Sandhini Agarwal, Girish Sastry, Amanda Askell, Pamela Mishkin, Jack Clark, Gretchen Krueger, and Ilya Sutskever. Learning transferable visual models from natural language supervision. In International Conference on Machine Learning, 2021. URL [https://api.semanticscholar.org/CorpusID:231591445](https://api.semanticscholar.org/CorpusID:231591445).

[107] Alec Radford, Jong Wook Kim, Chris Hallacy, Aditya Ramesh, Gabriel Goh, Sandhini Agarwal, Girish Sastry, Amanda Askell, Pamela Mishkin, Jack Clark, et al. Learning transferable visual models from natural language supervision. In International conference on machine learning, pages 8748–8763. PmLR, 2021.

[108] Pooyan Rahmanzadehgervi, Logan Bolton, Mohammad Reza Taesiri, and Anh Totti Nguyen. Vision language models are blind: Failing to translate detailed visual features into words, 2025. URL [https://arxiv.org/abs/2407.06581](https://arxiv.org/abs/2407.06581).

[109] Samyam Rajbhandari, Jeff Rasley, Olatunji Ruwase, and Yuxiong He. Zero: Memory optimizations toward training trillion parameter models. In SC20: International Conference for High Performance Computing, Networking, Storage and Analysis, pages 1–16. IEEE, 2020.

[110] Viresh Ranjan, Udbhav Sharma, Thu Nguyen, and Minh Hoai. Learning to count everything. In Proceedings of the IEEE/CVF Conference on Computer Vision and Pattern Recognition, pages 3394–3403, 2021.

[111] Christopher Rawles, Sarah Clinckemaillie, Yifan Chang, Jonathan Waltz, Gabrielle Lau, Marybeth Fair, Alice Li, William Bishop, Wei Li, Folawiyo Campbell-Ajala, et al. Androidworld: A dynamic benchmarking environment for autonomous agents. arXiv preprint arXiv:2405.14573, 2024.

[112] Benjamin Recht, Rebecca Roelofs, Ludwig Schmidt, and Vaishaal Shankar. Do imagenet classifiers generalize to imagenet? In International conference on machine learning, pages 5389–5400. PMLR, 2019.

[113] Jonathan Roberts, Mohammad Reza Taesiri, Ansh Sharma, Akash Gupta, Samuel Roberts, Ioana Croitoru, Simion Vlad Bogolin, Jialu Tang, Florian Langer, Vyas Raina, Vatsal Raina, Hanyi Xiong, Vishaal Udandarao, Jingyi Lu, Shiyang Chen, Sam Purkis, Tianshuo Yan, Wenye Lin, Gyungin Shin, Qiaochu Yang, Anh Totti Nguyen, David I. Atkinson, Aaditya Baranwal, Alexandru Coca, Mikah Dang, Sebastian Dziadzio, Jakob D. Kunz, Kaiqu Liang, Alexander Lo, Brian Pulfer, Steven Walton, Charig Yang, Kai Han, and Samuel Albanie. Zerobench: An impossible visual benchmark for contemporary large multimodal models, 2025. URL [https://arxiv.org/abs/2502.09696](https://arxiv.org/abs/2502.09696).

[114] Anna Rohrbach, Marcus Rohrbach, Weijian Qiu, Annemarie Friedrich, Manfred Pinkal, and Bernt Schiele. Coherent multi-sentence video description with variable level of detail. In German Conference on Pattern Recognition, 2014.

[115] Bytedance Seed. Seed-thinking-v1. 5: Advancing superb reasoning models with reinforcement learning. Technical report, Technical report, ByteDance, 2025. URL https://github. com/ByteDance-Seed . . . , 2025.

[116] ByteDance Seed. Ui-tars-1.5. [https://seed-tars.com/1.5](https://seed-tars.com/1.5), 2025.

[117] Ziyao Shangguan, Chuhan Li, Yuxuan Ding, Yanan Zheng, Yilun Zhao, Tesca Fitzgerald, and Arman Cohan. Tomato: Assessing visual temporal reasoning capabilities in multimodal foundation models. arXiv preprint arXiv:2410.23266, 2024.

[118] Shuai Shao, Zeming Li, Tianyuan Zhang, Chao Peng, Gang Yu, Xiangyu Zhang, Jing Li, and Jian Sun. Objects365: A large-scale, high-quality dataset for object detection. In 2019 IEEE/CVF International Conference on Computer Vision (ICCV), 2019.

[119] N Shazeer, A Mirhoseini, K Maziarz, A Davis, Q Le, G Hinton, and J Dean. The sparsely-gated mixture-of-experts layer. Outrageously large neural networks, 2017.

[120] Wei Shen, Guanlin Liu, Zheng Wu, Ruofei Zhu, Qingping Yang, Chao Xin, Yu Yue, and Lin Yan. Exploring data scaling trends and effects in reinforcement learning from human feedback. 2025. URL [https://api.semanticscholar.org/CorpusID:277435161](https://api.semanticscholar.org/CorpusID:277435161).

[121] Wei Shen, Guanlin Liu, Zheng Wu, Ruofei Zhu, Qingping Yang, Chao Xin, Yu Yue, and Lin Yan. Exploring data scaling trends and effects in reinforcement learning from human feedback, 2025. URL https://arxiv.org[abs/2503.22230](https://arxiv.org/abs/2503.22230).

[122] Guangming Sheng, Chi Zhang, Zilingfeng Ye, Xibin Wu, Wang Zhang, Ru Zhang, Yanghua Peng, Haibin Lin, and Chuan Wu. Hybridflow: A flexible and efficient rlhf framework. In Proceedings of the Twentieth European Conference on Computer Systems, EuroSys ’25, page 1279–1297. ACM, March 2025. doi: 10.1145/3689031. 3696075. URL [http://dx.doi.org/10.1145/3689031.3696075](http://dx.doi.org/10.1145/3689031.3696075).

<!-- page 40 of 77 -->

[123] Mohammad Shoeybi, Mostofa Patwary, Raul Puri, Patrick LeGresley, Jared Casper, and Bryan Catanzaro. Megatron-lm: Training multi-billion parameter language models using model parallelism. arXiv preprint arXiv:1909.08053, 2019.

[124] Amanpreet Singh, Vivek Natarajan, Meet Shah, Yu Jiang, Xinlei Chen, Dhruv Batra, Devi Parikh, and Marcus Rohrbach. Towards vqa models that can read. In Proceedings of the IEEE/CVF conference on computer vision and pattern recognition, pages 8317–8326, 2019.

[125] Shuran Song, Samuel P Lichtenberg, and Jianxiong Xiao. Sun rgb-d: A rgb-d scene understanding benchmark suite. In Proceedings of the IEEE conference on computer vision and pattern recognition, pages 567–576, 2015.

[126] Jianlin Su, Murtadha Ahmed, Yu Lu, Shengfeng Pan, Wen Bo, and Yunfeng Liu. Roformer: Enhanced transformer with rotary position embedding. Neurocomputing, 568:127063, 2024.

[127] Chameleon Team. Chameleon: Mixed-modal early-fusion foundation models. arXiv preprint arXiv:2405.09818, 2024.

[128] Gemini Team, Rohan Anil, Sebastian Borgeaud, Jean-Baptiste Alayrac, Jiahui Yu, Radu Soricut, Johan Schalkwyk, Andrew M Dai, Anja Hauth, Katie Millican, et al. Gemini: a family of highly capable multimodal models. arXiv preprint arXiv:2312.11805, 2023.

[129] Gemini Robotics Team, Saminda Abeyruwan, Joshua Ainslie, Jean-Baptiste Alayrac, Montserrat Gonzalez Arenas, Travis Armstrong, Ashwin Balakrishna, Robert Baruch, Maria Bauza, Michiel Blokzijl, et al. Gemini robotics: Bringing ai into the physical world. arXiv preprint arXiv:2503.20020, 2025.

[130] Kimi Team, Angang Du, Bohong Yin, Bowei Xing, Bowen Qu, Bowen Wang, Cheng Chen, Chenlin Zhang, Chenzhuang Du, Chu Wei, et al. Kimi-vl technical report. arXiv preprint arXiv:2504.07491, 2025.

[131] Xiaoyu Tian, Junru Gu, Bailin Li, Yicheng Liu, Zhiyong Zhao, Yang Wang, Kun Zhan, Peng Jia, Xianpeng Lang, and Hang Zhao. Drivevlm: The convergence of autonomous driving and large vision-language models. arXiv preprint arXiv:2402.12289, 2024.

[132] Vernon Y. H. Toh, Yew Ken Chia, Deepanway Ghosal, and Soujanya Poria. The jumping reasoning curve? tracking the evolution of reasoning performance in gpt-[n] and o-[n] models on multimodal puzzles, 2025. URL [https://arxiv.org/abs/2502.01081](https://arxiv.org/abs/2502.01081).

[133] Shengbang Tong, Zhuang Liu, Yuexiang Zhai, Yi Ma, Yann LeCun, and Saining Xie. Eyes wide shut? exploring the visual shortcomings of multimodal llms. In Proceedings of the IEEE/CVF Conference on Computer Vision and Pattern Recognition, pages 9568–9578, 2024.

[134] Hugo Touvron, Louis Martin, Kevin Stone, Peter Albert, Amjad Almahairi, Yasmine Babaei, Nikolay Bashlykov, Soumya Batra, Prajjwal Bhargava, Shruti Bhosale, Dan Bikel, Lukas Blecher, Cristian Canton Ferrer, Moya Chen, Guillem Cucurull, David Esiobu, Jude Fernandes, Jeremy Fu, Wenyin Fu, Brian Fuller, Cynthia Gao, Vedanuj Goswami, Naman Goyal, Anthony Hartshorn, Saghar Hosseini, Rui Hou, Hakan Inan, Marcin Kardas, Viktor Kerkez, Madian Khabsa, Isabel Kloumann, Artem Korenev, Punit Singh Koura, Marie-Anne Lachaux, Thibaut Lavril, Jenya Lee, Diana Liskovich, Yinghai Lu, Yuning Mao, Xavier Martinet, Todor Mihaylov, Pushkar Mishra, Igor Molybog, Yixin Nie, Andrew Poulton, Jeremy Reizenstein, Rashi Rungta, Kalyan Saladi, Alan Schelten, Ruan Silva, Eric Michael Smith, Ranjan Subramanian, Xiaoqing Ellen Tan, Binh Tang, Ross Taylor, Adina Williams, Jian Xiang Kuan, Puxin Xu, Zheng Yan, Iliyan Zarov, Yuchen Zhang, Angela Fan, Melanie Kambadur, Sharan Narang, Aurelien Rodriguez, Robert Stojnic, Sergey Edunov, and Thomas Scialom. Llama 2: Open foundation and fine-tuned chat models, 2023.

[135] Michael Tschannen, Alexey Gritsenko, Xiao Wang, Muhammad Ferjad Naeem, Ibrahim Alabdulmohsin, Nikhil Parthasarathy, Talfan Evans, Lucas Beyer, Ye Xia, Basil Mustafa, et al. Siglip 2: Multilingual vision-language encoders with improved semantic understanding, localization, and dense features. arXiv preprint arXiv:2502.14786, 2025.

[136] Borui Wan, Mingji Han, Yiyao Sheng, Yanghua Peng, Haibin Lin, Mofan Zhang, Zhichao Lai, Menghan Yu, Junda Zhang, Zuquan Song, et al. Bytecheckpoint: A unified checkpointing system for large foundation model development. arXiv preprint arXiv:2407.20143, 2024.

[137] Binghai Wang, Rui Zheng, Lu Chen, Yan Liu, Shihan Dou, Caishuang Huang, Wei Shen, Senjie Jin, Enyu Zhou, Chenyu Shi, et al. Secrets of rlhf in large language models part ii: Reward modeling. arXiv preprint arXiv:2401.06080, 2024.

<!-- page 41 of 77 -->

[138] Haohan Wang, Songwei Ge, Zachary Lipton, and Eric P Xing. Learning robust global representations by penalizing local predictive power. Advances in neural information processing systems, 32, 2019.

[139] Jiawei Wang, Liping Yuan, Yuchen Zhang, and Haomiao Sun. Tarsier: Recipes for training and evaluating large video description models, 2024. URL [https://arxiv.org/abs/2407.00634](https://arxiv.org/abs/2407.00634).

[140] Ke Wang, Junting Pan, Weikang Shi, Zimu Lu, Houxing Ren, Aojun Zhou, Mingjie Zhan, and Hongsheng Li. Measuring multimodal mathematical reasoning with math-vision dataset. Advances in Neural Information Processing Systems, 37:95095–95169, 2024.

[141] Peng Wang, Shuai Bai, Sinan Tan, Shijie Wang, Zhihao Fan, Jinze Bai, Keqin Chen, Xuejing Liu, Jialin Wang, Wenbin Ge, et al. Qwen2-vl: Enhancing vision-language model’s perception of the world at any resolution. arXiv preprint arXiv:2409.12191, 2024.

[142] Weihan Wang, Zehai He, Wenyi Hong, Yean Cheng, Xiaohan Zhang, Ji Qi, Xiaotao Gu, Shiyu Huang, Bin Xu, Yuxiao Dong, et al. Lvbench: An extreme long video understanding benchmark. arXiv preprint arXiv:2406.08035, 2024.

[143] Yizhong Wang, Yeganeh Kordi, Swaroop Mishra, Alisa Liu, Noah A Smith, Daniel Khashabi, and Hannaneh Hajishirzi. Self-instruct: Aligning language models with self-generated instructions. arXiv preprint arXiv:2212.10560, 2022.

[144] Zirui Wang, Mengzhou Xia, Luxi He, Howard Chen, Yitao Liu, Richard Zhu, Kaiqu Liang, Xindi Wu, Haotian Liu, Sadhika Malladi, et al. Charxiv: Charting gaps in realistic chart understanding in multimodal llms. Advances in Neural Information Processing Systems, 37:113569–113697, 2024.

[145] Chen Wei, Haoqi Fan, Saining Xie, Chao-Yuan Wu, Alan Yuille, and Christoph Feichtenhofer. Masked feature prediction for self-supervised visual pre-training. In Proceedings of the IEEE/CVF conference on computer vision and pattern recognition, pages 14668–14678, 2022.

[146] Yanbin Wei, Shuai Fu, Weisen Jiang, Zejian Zhang, Zhixiong Zeng, Qi Wu, James T. Kwok, and Yu Zhang. Gita: Graph to visual and textual integration for vision-language graph reasoning, 2024. URL [https://arxiv.org/abs/2402.02130](https://arxiv.org/abs/2402.02130).

[147] Haoning Wu, Dongxu Li, Bei Chen, and Junnan Li. Longvideobench: A benchmark for long-context interleaved video-language understanding. Advances in Neural Information Processing Systems, 37:28828–28857, 2024.

[148] Penghao Wu and Saining Xie. V\*: Guided visual search as a core mechanism in multimodal llms, 2023. URL [https://arxiv.org/abs/2312.14135](https://arxiv.org/abs/2312.14135).

[149] Zhiyong Wu, Zhenyu Wu, Fangzhi Xu, Yian Wang, Qiushi Sun, Chengyou Jia, Kanzhi Cheng, Zichen Ding, Liheng Chen, Paul Pu Liang, et al. Os-atlas: A foundation action model for generalist gui agents. arXiv preprint arXiv:2410.23218, 2024.

[150] xAI. Realworldqa: A benchmark for real-world spatial understanding. [https://huggingface.co/datasets/xai-org/RealworldQA](https://huggingface.co/datasets/xai-org/RealworldQA), 2024. Accessed: 2025-04-26.

[151] Chaojun Xiao, Jie Cai, Weilin Zhao, Guoyang Zeng, Biyuan Lin, Jie Zhou, Zhi Zheng, Xu Han, Zhiyuan Liu, and Maosong Sun. Densing law of llms. arXiv preprint arXiv:2412.04315, 2024.

[152] Tianbao Xie, Danyang Zhang, Jixuan Chen, Xiaochuan Li, Siheng Zhao, Ruisheng Cao, Toh J Hua, Zhoujun Cheng, Dongchan Shin, Fangyu Lei, et al. Osworld: Benchmarking multimodal agents for open-ended tasks in real computer environments. Advances in Neural Information Processing Systems, 37:52040–52094, 2024.

[153] Haomiao Xiong, Zongxin Yang, Jiazuo Yu, Yunzhi Zhuge, Lu Zhang, Jiawen Zhu, and Huchuan Lu. Streaming video understanding and multi-round interaction with memory-enhanced knowledge. arXiv preprint arXiv:2501.13468, 2025.

[154] Weiye Xu, Jiahao Wang, Weiyun Wang, Zhe Chen, Wengang Zhou, Aijun Yang, Lewei Lu, Houqiang Li, Xiaohua Wang, Xizhou Zhu, Wenhai Wang, Jifeng Dai, and Jinguo Zhu. Visulogic: A benchmark for evaluating visual reasoning in multi-modal large language models, 2025. URL [https://arxiv.org/abs/2504.15279](https://arxiv.org/abs/2504.15279).

[155] Wenyuan Xu, Xiaochen Zuo, Chao Xin, Yu Yue, Lin Yan, and Yonghui Wu. A unified pairwise framework for rlhf: Bridging generative reward modeling and policy optimization. arXiv preprint arXiv:2504.04950, 2025.

<!-- page 42 of 77 -->

[156] Wenyuan Xu, Xiaochen Zuo, Chao Xin, Yu Yue, Lin Yan, and Yonghui Wu. A unified pairwise framework for rlhf: Bridging generative reward modeling and policy optimization, 2025. URL [https://arxiv.org/abs/2504.04950](https://arxiv.org/abs/2504.04950).

[157] Zhenhua Xu, Yujia Zhang, Enze Xie, Zhen Zhao, Yong Guo, Kwan-Yee. K. Wong, Zhenguo Li, and Hengshuang Zhao. Drivegpt4: Interpretable end-to-end autonomous driving via large language model, 2024. URL [https://arxiv.org/abs/2310.01412](https://arxiv.org/abs/2310.01412).

[158] Tianci Xue, Weijian Qi, Tianneng Shi, Chan Hee Song, Boyu Gou, Dawn Song, Huan Sun, and Yu Su. An illusion of progress? assessing the current state of web agents. arXiv preprint arXiv:2504.01382, 2025.

[159] Chih-Hsuan Yang, Benjamin Feuer, Talukder Jubery, Zi Deng, Andre Nakkab, Md Zahid Hasan, Shivani Chiranjeevi, Kelly Marshall, Nirmal Baishnab, Asheesh Singh, et al. Biotrove: A large curated image dataset enabling ai for biodiversity. Advances in Neural Information Processing Systems, 37:102101–102120, 2024.

[160] Lihe Yang, Bingyi Kang, Zilong Huang, Zhen Zhao, Xiaogang Xu, Jiashi Feng, and Hengshuang Zhao. Depth anything v2. arXiv:2406.09414, 2024.

[161] Shunyu Yao, Howard Chen, Austin W. Hanjie, Runzhe Yang, and Karthik Narasimhan. Collie: Systematic construction of constrained text generation tasks, 2023. URL [https://arxiv.org/abs/2307.08689](https://arxiv.org/abs/2307.08689).

[162] Qinghao Ye, Xianhan Zeng, Fu Li, Chunyuan Li, and Haoqi Fan. Painting with words: Elevating detailed image captioning with benchmark and alignment learning. In The Thirteenth International Conference on Learning Representations, 2025. URL [https://openreview.net/forum?id=636M0nNbPs](https://openreview.net/forum?id=636M0nNbPs).

[163] Chun-Hsiao Yeh, Chenyu Wang, Shengbang Tong, Ta-Ying Cheng, Rouyu Wang, Tianzhe Chu, Yuexiang Zhai, Yubei Chen, Shenghua Gao, and Yi Ma. Seeing from another perspective: Evaluating multi-view understanding in mllms. arXiv preprint arXiv:2504.15280, 2025.

[164] Licheng Yu, Patrick Poirson, Shan Yang, Alexander C Berg, and Tamara L Berg. Modeling context in referring expressions. In Computer Vision–ECCV 2016: 14th European Conference, Amsterdam, The Netherlands, October 11-14, 2016, Proceedings, Part II 14, pages 69–85. Springer, 2016.

[165] Qiying Yu, Zheng Zhang, Ruofei Zhu, Yufeng Yuan, Xiaochen Zuo, Yu Yue, Tiantian Fan, Gaohong Liu, Lingjun Liu, Xin Liu, Haibin Lin, Zhiqi Lin, Bole Ma, Guangming Sheng, Yuxuan Tong, Chi Zhang, Mofan Zhang, Wang Zhang, Hang Zhu, Jinhua Zhu, Jiaze Chen, Jiangjie Chen, Chengyi Wang, Hongli Yu, Weinan Dai, Yuxuan Song, Xiangpeng Wei, Hao Zhou, Jingjing Liu, Wei-Ying Ma, Ya-Qin Zhang, Lin Yan, Mu Qiao, Yonghui Wu, and Mingxuan Wang. Dapo: An open-source llm reinforcement learning system at scale, 2025. URL [https://arxiv.org/abs/2503.14476](https://arxiv.org/abs/2503.14476).

[166] Weihao Yu, Zhengyuan Yang, Linjie Li, Jianfeng Wang, Kevin Lin, Zicheng Liu, Xinchao Wang, and Lijuan Wang. Mm-vet: Evaluating large multimodal models for integrated capabilities. arXiv preprint arXiv:2308.02490, 2023.

[167] Yufeng Yuan, Yu Yue, Ruofei Zhu, Tiantian Fan, and Lin Yan. What’s behind ppo’s collapse in long-cot? value optimization holds the secret, 2025. URL [https://arxiv.org/abs/2503.01491](https://arxiv.org/abs/2503.01491).

[168] Xiang Yue, Yuansheng Ni, Kai Zhang, Tianyu Zheng, Ruoqi Liu, Ge Zhang, Samuel Stevens, Dongfu Jiang, Weiming Ren, Yuxuan Sun, et al. Mmmu: A massive multi-discipline multimodal understanding and reasoning benchmark for expert agi. In Proceedings of the IEEE/CVF Conference on Computer Vision and Pattern Recognition, pages 9556–9567, 2024.

[169] Xiang Yue, Tianyu Zheng, Yuansheng Ni, Yubo Wang, Kai Zhang, Shengbang Tong, Yuxuan Sun, Botao Yu, Ge Zhang, Huan Sun, et al. Mmmu-pro: A more robust multi-discipline multimodal understanding benchmark. arXiv preprint arXiv:2409.02813, 2024.

[170] Yu Yue, Yufeng Yuan, Qiying Yu, Xiaochen Zuo, Ruofei Zhu, Wenyuan Xu, Jiaze Chen, Chengyi Wang, TianTian Fan, Zhengyin Du, Xiangpeng Wei, Xiangyu Yu, Gaohong Liu, Juncai Liu, Lingjun Liu, Haibin Lin, Zhiqi Lin, Bole Ma, Chi Zhang, Mofan Zhang, Wang Zhang, Hang Zhu, Ru Zhang, Xin Liu, Mingxuan Wang, Yonghui Wu, and Lin Yan. Vapo: Efficient and reliable reinforcement learning for advanced reasoning tasks, 2025. URL [https://arxiv.org/abs/2504.05118](https://arxiv.org/abs/2504.05118).

[171] Xiaohua Zhai, Basil Mustafa, Alexander Kolesnikov, and Lucas Beyer. Sigmoid loss for language image pre-training. In Proceedings of the IEEE/CVF international conference on computer vision, pages 11975–11986, 2023.

<!-- page 43 of 77 -->

[172] Di Zhang, Junxian Li, Jingdi Lei, Xunzhi Wang, Yujie Liu, Zonglin Yang, Jiatong Li, Weida Wang, Suorong Yang, Jianbo Wu, et al. Critic-v: Vlm critics help catch vlm errors in multimodal reasoning. arXiv preprint arXiv:2411.18203, 2024.

[173] Shulai Zhang, Ningxin Zheng, Haibin Lin, Ziheng Jiang, Wenlei Bao, Chengquan Jiang, Qi Hou, Weihao Cui, Size Zheng, Li-Wen Chang, et al. Comet: Fine-grained computation-communication overlapping for mixture-of-experts. arXiv preprint arXiv:2502.19811, 2025.

[174] Yiyuan Zhang, Handong Li, Jing Liu, and Xiangyu Yue. Explore the limits of omni-modal pretraining at scale. arXiv preprint arXiv:2406.09412, 2024.

[175] Yilun Zhao, Lujing Xie, Haowei Zhang, Guo Gan, Yitao Long, Zhiyuan Hu, Tongyan Hu, Weiyuan Chen, Chuhan Li, Junyang Song, et al. Mmvu: Measuring expert-level multi-discipline video understanding. arXiv preprint arXiv:2501.12380, 2025.

[176] Lianmin Zheng, Wei-Lin Chiang, Ying Sheng, Siyuan Zhuang, Zhanghao Wu, Yonghao Zhuang, Zi Lin, Zhuohan Li, Dacheng Li, Eric Xing, et al. Judging llm-as-a-judge with mt-bench and chatbot arena. Advances in Neural Information Processing Systems, 36:46595–46623, 2023.

[177] Lianmin Zheng, Wei-Lin Chiang, Ying Sheng, Siyuan Zhuang, Zhanghao Wu, Yonghao Zhuang, Zi Lin, Zhuohan Li, Dacheng Li, Eric P. Xing, Hao Zhang, Joseph E. Gonzalez, and Ion Stoica. Judging llm-as-a-judge with mt-bench and chatbot arena, 2023. URL [https://arxiv.org/abs/2306.05685](https://arxiv.org/abs/2306.05685).

[178] Junjie Zhou, Yan Shu, Bo Zhao, Boya Wu, Shitao Xiao, Xi Yang, Yongping Xiong, Bo Zhang, Tiejun Huang, and Zheng Liu. Mlvu: A comprehensive benchmark for multi-task long video understanding. arXiv preprint arXiv:2406.04264, 2024.

[179] Yiyang Zhou, Chenhang Cui, Rafael Rafailov, Chelsea Finn, and Huaxiu Yao. Aligning modalities in vision large language models via preference fine-tuning. arXiv preprint arXiv:2402.11411, 2024.

[180] Daniel M Ziegler, Nisan Stiennon, Jeffrey Wu, Tom B Brown, Alec Radford, Dario Amodei, Paul Christiano, and Geoffrey Irving. Fine-tuning language models from human preferences. arXiv preprint arXiv:1909.08593, 2019.

<!-- page 44 of 77 -->

## 8 Contributions and Acknowledgments 贡献与致谢

The authors are listed in alphabetical order by their first names. Some names refer to the authors’ internal aliases at the company.
作者按名字字母顺序排列. 部分名字是作者在公司内部使用的别名.

<table><tr><td>Core Contributors</td><td>Zanbo WangZhiwu He</td></tr><tr><td>Dong Guo</td><td></td></tr><tr><td>Faming Wu</td><td rowspan="2">Contributors</td></tr><tr><td>Feida Zhu</td></tr><tr><td>Fuxing Leng</td><td>Aoxue Zhang</td></tr><tr><td>Guang Shi</td><td>Bairen Yi</td></tr><tr><td>Haobin Chen</td><td>Bencheng Liao</td></tr><tr><td>Haoqi Fan</td><td>Can Huang</td></tr><tr><td>Jian Wang</td><td>Can Zhang</td></tr><tr><td>Jianyu Jiang</td><td>Chaorui Deng</td></tr><tr><td>Jiawei Wang</td><td>Chaoyi Deng</td></tr><tr><td>Jingji Chen</td><td>Cheng Lin</td></tr><tr><td>Jingjia Huang</td><td>Cheng Yuan</td></tr><tr><td>Kang Lei</td><td>Chenggang Li</td></tr><tr><td>Liping Yuan</td><td>Chenhui Gou</td></tr><tr><td>Lishu Luo</td><td>Chenwei Lou</td></tr><tr><td>Pengfei Liu</td><td>Chengzhi Wei</td></tr><tr><td>Qinghao Ye</td><td>Chundian Liu</td></tr><tr><td>Rui Qian</td><td>Chunyuan Li</td></tr><tr><td>Shen Yan</td><td>Deyao Zhu</td></tr><tr><td>Shixiong Zhao</td><td>Donghong Zhong</td></tr><tr><td>Shuai Peng</td><td>Feng Li</td></tr><tr><td>Shuangye Li</td><td>Feng Zhang</td></tr><tr><td>Sihang Yuan</td><td>Gang Wu</td></tr><tr><td>Sijin Wu</td><td>Guodong Li</td></tr><tr><td>Tianheng Cheng</td><td>Guohong Xiao</td></tr><tr><td>Weiwei Liu</td><td>Haibin Lin</td></tr><tr><td>Wenqian Wang</td><td>Haihua Yang</td></tr><tr><td>Xianhan Zeng</td><td>Haoming Wang</td></tr><tr><td>Xiao Liu</td><td>Heng Ji</td></tr><tr><td>Xiaobo Qin</td><td>Hongxiang Hao</td></tr><tr><td>Xiaohan Ding</td><td>Hui Shen</td></tr><tr><td>Xiaojun Xiao</td><td>Huixia Li</td></tr><tr><td>Xiaoying Zhang</td><td>Jiahao Li</td></tr><tr><td>Xuanwei Zhang</td><td>Jialong Wu</td></tr><tr><td>Xuehan Xiong</td><td>Jianhua Zhu</td></tr><tr><td>Yanghua Peng</td><td>Jianpeng Jiao</td></tr><tr><td>Yangrui Chen</td><td>Jiashi Feng</td></tr><tr><td>Yanwei Li</td><td>Jiaze Chen</td></tr><tr><td>Yanxu Hu</td><td>Jianhui Duan</td></tr><tr><td>Yi Lin</td><td>Jihao Liu</td></tr><tr><td>Yiyuan Hu</td><td>Jin Zeng</td></tr><tr><td>Yiyuan Zhang</td><td>Jingqun Tang</td></tr><tr><td>Youbin Wu</td><td>Jingyu Sun</td></tr><tr><td>Yu Li</td><td>Joya Chen</td></tr><tr><td>Yudong Liu</td><td>Jun Long</td></tr><tr><td>Yue Ling</td><td>Junda Feng</td></tr><tr><td>Yujia Qin</td><td>Junfeng Zhan</td></tr></table>
上表为核心贡献者 (Core Contributors) 与贡献者 (Contributors) 名单, 人名不译.

<!-- page 45 of 77 -->

Junjie Fang Junting Lu Kai Hua Kai Liu Kai Shen Kaiyuan Zhang Ke Shen Ke Wang Keyu Pan Kun Zhang Kunchang Li Lanxin Li Lei Li Lei Shi Li Han Liang Xiang Liangqiang Chen Lin Chen Lin Li Lin Yan Liying Chi Longxiang Liu Mengfei Du Mingxuan Wang Ningxin Pan Peibin Chen Pengfei Chen Pengfei Wu Qingqing Yuan Qingyao Shuai Qiuyan Tao Renjie Zheng Renrui Zhang Ru Zhang Rui Wang Rui Yang Rui Zhao Shaoqiang Xu Shihao Liang Shipeng Yan Shu Zhong Shuaishuai Cao Shuangzhi Wu Shufan Liu Shuhan Chang Songhua Cai Tenglong Ao Tianhao Yang Tingting Zhang Wanjun Zhong Wei Jia Wei Weng
贡献者名单续, 人名不译.

Weihao Yu Wenhao Huang Wenjia Zhu Wenli Yang Wenzhi Wang Xiang Long XiangRui Yin Xiao Li Xiaolei Zhu Xiaoying Jia Xijin Zhang Xin Liu Xinchen Zhang Xinyu Yang Xiongcai Luo Xiuli Chen Xuantong Zhong Xuefeng Xiao Xujing Li Yan Wu Yawei Wen Yifan Du Yihao Zhang Yining Ye Yonghui Wu Yu Liu Yu Yue Yufeng Zhou Yufeng Yuan Yuhang Xu Yuhong Yang Yun Zhang Yunhao Fang Yuntao Li Yurui Ren Yuwen Xiong Zehua Hong Zehua Wang Zewei Sun Zeyu Wang Zhao Cai Zhaoyue Zha Zhecheng An Zhehui Zhao Zhengzhuo Xu Zhipeng Chen Zhiyong Wu Zhuofan Zheng Zihao Wang Zilong Huang Ziyu Zhu Zuquan Song
贡献者名单续, 人名不译.

<!-- page 46 of 77 -->

### Acknowledgments 致谢

We would like to sincerely thank Allie Guo, Bingyi Kang, Borui Wan, Chaoran Guo, Chenyuan Wang, Chixiang Ma, Fei Xiong, Fu Li, Fuxiang Li, Gaohong Liu, Hongbin Ren, Hongyu Zhu, Jinxin Chi, Juncai Liu, Kaihua Jiang, Kayden, Lei Zuo, Lianke Qin, Lingjun Liu, Liyang Liu, Minchao Wang, Mingji Han, Mofan Zhang, Pengyuan Zhao, Qianli Ma, Qifan Yang, Qinlong Wang, Shibiao Nong, Tong Zhou, Weiqiang Lou, Xiangpeng Wei, Xiangrui Yin, Xiangtai Li, Xiaokai Li, Xudong Sun, Xun Wang, Yaowei Zheng, Yixin Wu, Yingping Zhang, Yun Zhang, Yuwen Tang, Zhe Nan, Zhelun Shi, Zheng Zhong, Zhenyuan Yang, Zhi Zhang, Zhongjia Wei, Zhuolin Zheng, Zilong Zhou, Ziqian Wei, Ziwen Xu, Zixin Chen, Ziyuan Feng, Zuquan Song for their insightful discussions and unwavering support. Their valuable input has been instrumental in advancing Seed1.5-VL’s development, evaluation, defect analysis, and exploration of future research directions.
衷心感谢上列各位同事富有洞见的讨论和坚定支持. 他们宝贵的意见对推进 Seed1.5-VL 的开发, 评测, 缺陷分析和未来研究方向探索都起了关键作用.

<!-- page 47 of 77 -->

## Appendix

## A Qualitative examples 定性样例

This section presents a selection of qualitative examples illustrating the capabilities of the Seed1.5-VL model through responses generated from various prompts. Examples demonstrating the model’s visual reasoning ability are provided in figures 9 to 15. Figure 16 shows a case of model solving visual puzzles, such as “Findthe-Differences”. The model’s proficiency in solving geometry problems is showcased in figure 17. Figure 18 illustrates model’s ability of accurately counting objects presented in a crowded scene. Document understanding and OCR capabilities are highlighted in figures 21 and 22. Beyond standard image understanding, our model is also capable of 3D spatial understanding from a single image, exemplified by sorting objects based on their depth relative to the camera as shown in figure 19. Extending beyond static images, figure 20 presents an example of the model localizing events within a video based on user queries. Figure 24 showcases an instance of image-conditioned creative writing generated by our model. Finally, failure cases illustrating the current limitations observed in VLMs, including issues related to spatial imagination, hallucination, and combinatorial search, are presented in figures 25 to 28.
本节挑选一些定性样例, 通过模型对各种 prompt 的回答展示 Seed1.5-VL 的能力. 视觉推理能力的样例见图 9 到图 15. 图 16 展示模型解视觉谜题 (如 「找不同」) 的案例. 图 17 展示模型解几何题的能力. 图 18 展示模型在拥挤场景中准确计数的能力. 文档理解和 OCR 能力见图 21 和图 22. 除标准图像理解外, 模型还能从单张图像理解 3D 空间, 例如图 19 按物体相对相机的深度排序. 超出静态图像, 图 20 给出模型按用户查询在视频中定位事件的例子. 图 24 展示模型以图像为条件的创意写作. 最后, 图 25 到图 28 给出失败案例, 说明当前 VLM 在空间想象, 幻觉和组合搜索上的局限.

<!-- page 48 of 77 -->

A.1 Reasoning Cases: Visual Reasoning
A.1 推理案例: 视觉推理

![Image block](images/p48-figure-9-a-case-demonstrating-one-of-the-visual-centric.png)

Figure 9 A case demonstrating one of the visual-centric thinking strategies that emerged during LongCoT RL.
图 9 展示 LongCoT RL 期间涌现的一种以视觉为中心的思考策略的案例.

<!-- page 49 of 77 -->

### A.2 Reasoning Cases: Geolocation Prediction 推理案例: 地理位置推断

![Image block](images/p49-prompts-you-are-participating-in-a-geolocation.png)

**Prompts:** You are participating in a geolocation challenge. Based on the provided image:
**Prompt:** 你在参加一个地理位置挑战. 根据提供的图像:

1. Carefully analyze the image for clues about its location (architecture, signage, vegetation, terrain, etc.)
1. 仔细分析图中关于位置的线索 (建筑, 标识, 植被, 地形等)

2. Think step-by-step about what continent, country, and city this is likely to be in and why
2. 逐步思考它可能位于哪个大洲, 国家和城市, 并说明理由

3. Estimate the approximate latitude and longitude based on your analysis Take your time to reason through the evidence. Your final answer MUST include these five lines somewhere in your response:
3. 根据分析估计大致经纬度. 慢慢推理证据. 你的最终回答中必须在某处包含这五行:

country: [country name]
country: [国家名]

lat: [latitude as a decimal number]
lat: [纬度, 十进制数]

lng: [longitude as a decimal number]
lng: [经度, 十进制数]

You can provide additional reasoning or explanation, but these three specific lines MUST be included.
你可以给出额外推理或解释, 但必须包含这三行.

**Model Responses:** &lt;think&gt;So, let’s try to figure out the location. First, look at the large building on the left—it looks like a multi-level parking structure or part of a stadium. The stadium-like structure with the big scoreboard and the tall light towers (used in baseball stadiums, maybe) is a clue. The number "2" on a sign might be a gate number. The vegetation: there are trees and hedges, typical of an urban area.
**模型回答:** &lt;think&gt;好, 我们来推断地点. 先看左边的大建筑, 像多层停车楼或体育场的一部分. 带大记分牌和高灯塔 (可能是棒球场用的) 的体育场式结构是一条线索. 标牌上的数字 「2」 可能是门号. 植被: 有树和树篱, 是典型的城市环境.

Now, the architecture style—modern stadium, maybe in the US. Let’s think about major stadiums. The structure with the grid and the flags—maybe Guaranteed Rate Field (formerly U.S. Cellular Field), home of the Chicago White Sox. Let’s check. The stadium’s exterior, the parking structure, and the surrounding area. Chicago, Illinois, USA.
再看建筑风格, 现代体育场, 可能在美国. 想想主要体育场. 带网格结构和旗帜的那个, 可能是 Guaranteed Rate Field (原名 U.S. Cellular Field), 芝加哥白袜队的主场. 核对一下: 体育场外观, 停车楼和周边区域. 美国伊利诺伊州芝加哥.

To confirm, the style of the stadium, the urban setting, and the type of infrastructure. Then, latitude and longitude for Guaranteed Rate Field: approximately 41.8316° N, 87.6348° W. ... &lt;/think&gt;
确认一下体育场风格, 城市环境和基础设施类型. 然后 Guaranteed Rate Field 的经纬度约为 41.8316° N, 87.6348° W. ... &lt;/think&gt;

Figure 10 A case demonstrating the "analyze visual details before recognizing a location" strategy that emerged during LongCoT RL.
图 10 展示 LongCoT RL 期间涌现的 「先分析视觉细节再识别地点」 策略的案例.

<!-- page 50 of 77 -->

A.3 Visual Reasoning: Solving Rebus Puzzles
A.3 视觉推理: 解画谜

![Image block](images/p50-figure-11-three-examples-of-seed1-5-vl-solving-rebus.png)

Figure 11 Three examples of Seed1.5-VL solving Rebus puzzles. Our model gave the correct reasoning and answers to the first two. For the third one, although the model gave an incorrect answer it still output logical reasoning. The correct answer is “travel overseas”. We omit thinking tokens for brevity.
图 11 Seed1.5-VL 解画谜的三个例子. 前两个模型给出了正确的推理和答案. 第三个模型答错了, 但推理仍合乎逻辑, 正确答案是 「travel overseas」. 为简洁起见省略思考 token.

<!-- page 51 of 77 -->

### A.4 Visual Reasoning: Emoji Quiz 视觉推理: Emoji 猜谜

![Image block](images/p51-prompts-which-movie-do-these-emojis-remind-you-of-model.png)

**Prompts:** Which movie do these emojis remind you of? **Model Responses:** &lt;think&gt;...&lt;/think&gt;The emojis—a tropical island (representing isolation/stranded setting) and a volleyball (referencing the character “Wilson” from the movie)—remind us of **‘‘Cast Away’’**. The film features a protagonist stranded on a deserted island, forming a unique bond with a volleyball named Wilson, which matches these symbols perfectly.
**Prompt:** 这些 emoji 让你想到哪部电影? **模型回答:** &lt;think&gt;...&lt;/think&gt; 这些 emoji 是热带小岛 (代表孤立, 被困的场景) 和一个排球 (指电影里的角色 「Wilson」), 让人想到 **「Cast Away」 (荒岛余生)**. 电影讲主角被困荒岛, 与一个名叫 Wilson 的排球结下特殊感情, 与这些符号完全吻合.

![Image block](images/p51-prompts-which-movie-do-these-emojis-remind-you-of.png)

#### Prompts: Which movie do these emojis remind you of? Prompt: 这些 emoji 让你想到哪部电影?

**Model Responses:** &lt;think&gt;...&lt;/think&gt;The emojis—a Italian flag (representing Italian heritage), a horse (referencing “Stallion,” as in Rocky’s nickname “The Italian Stallion”), and a boxing glove (boxing, Rocky’s sport)—collectively evoke **‘‘Rocky’’**. Rocky Balboa, the Italian-American boxer known as “The Italian Stallion,” perfectly matches these symbols.
**模型回答:** &lt;think&gt;...&lt;/think&gt; 这些 emoji 是意大利国旗 (代表意大利血统), 一匹马 (指 「Stallion」, 即洛奇的绰号 「The Italian Stallion」) 和一只拳击手套 (拳击, 洛奇的运动), 合起来指向 **「Rocky」 (洛奇)**. 意大利裔美国拳击手 Rocky Balboa 人称 「The Italian Stallion」, 与这些符号完全吻合.

![Image block](images/p51-prompts-which-movie-do-these-emojis-remind-you-of-2.png)

#### Prompts: Which movie do these emojis remind you of? Prompt: 这些 emoji 让你想到哪部电影?

**Model Responses:** &lt;think&gt;...&lt;/think&gt;The emojis include a UFO (alien spacecraft), landmarks like the Statue of Liberty (New York) and Golden Gate Bridge (San Francisco), cityscapes, and explosions—all key elements from **‘‘Independence Day’’**, where aliens attack major cities with UFOs, resulting in widespread destruction. These symbols align perfectly with the movie’s plot and iconic scenes.
**模型回答:** &lt;think&gt;...&lt;/think&gt; 这些 emoji 包括 UFO (外星飞船), 自由女神像 (纽约) 和金门大桥 (旧金山) 等地标, 城市天际线和爆炸, 都是 **「Independence Day」 (独立日)** 的关键元素: 外星人驾 UFO 袭击大城市, 造成大面积破坏. 这些符号与电影情节和标志性场景一致.

Figure 12 Three illustrative instances of Seed1.5-VL successfully identifying movie names from their corresponding emoji inputs. These examples highlight the model’s ability to recognize and semantically link emoji icons to movie plot information.
图 12 Seed1.5-VL 根据 emoji 输入成功认出电影名的三个示例. 这些例子体现了模型识别 emoji 图标并在语义上关联到电影情节信息的能力.

<!-- page 52 of 77 -->

A.5 Visual Reasoning: Word Game I
A.5 视觉推理: 文字游戏 I

<table><tr><td>LION JOB ENDING</td><td>Prompts: These seemingly random phrases hide the names of eight capital cities around the world. Each phrase contains the name of two cities. Can you unscramble them and figure out what they are?</td></tr><tr><td>TOOK MY ORE</td><td rowspan="3">Model Responses:...The phrases contain the following capital cities, each pair from a line:1. LION JOB ENDING → London (L-O-N-D-O-N) and Beijing (B-E-I-J-I-N-G).2. TOOK MY ORE → Tokyo (T-O-K-Y-O) and Rome (R-O-M-E).3. CRIMSON ELBOW → Berlin (B-E-R-L-I-N) and Moscow (M-O-S-C-O-W).4. RAPID DISARM → Paris (P-A-R-I-S) and Madrid (M-A-D-R-I-D). These are all capital cities (London, Beijing, Tokyo, Rome, Berlin, Moscow, Paris, Madrid), each hidden in the letter combinations of the phrases.</td></tr><tr><td>CRIMSON ELBOW</td></tr><tr><td>RAPID DISARM</td></tr></table>
Prompt: 这些看似随机的短语里藏着世界上八个首都的名字, 每个短语包含两个城市. 你能把字母重排, 找出它们是什么吗? 模型回答: ...这些短语包含以下首都, 每行一对: 1. LION JOB ENDING 对应 London 和 Beijing. 2. TOOK MY ORE 对应 Tokyo 和 Rome. 3. CRIMSON ELBOW 对应 Berlin 和 Moscow. 4. RAPID DISARM 对应 Paris 和 Madrid. 它们都是首都 (London, Beijing, Tokyo, Rome, Berlin, Moscow, Paris, Madrid), 各自藏在短语的字母组合里.

Figure 13 An example of Seed1.5-VL playing a word game. The model correctly recognize letters from the image, and retrieve capital cities that are spelled using those letters. This exemplifies the model’s integrated OCR, reasoning, and knowledge retrieval capabilities.
图 13 Seed1.5-VL 玩文字游戏的例子. 模型正确识别图中字母, 并检索出能用这些字母拼出的首都名. 这体现了模型整合 OCR, 推理和知识检索的能力.

<!-- page 53 of 77 -->

A.6 Visual Reasoning: Word Game II
A.6 视觉推理: 文字游戏 II

| Alice's Guess | Betty's Answer |
| --- | --- |
| HUNKY | 2 |
| JUNKS | 0 |
| WHISK | 2 |
| CENTS | 2 |
| STINK | 0 |

#### Prompt:

Alice and Betty are playing “guess my word”. Betty thinks of a five-letter word (all distinct letters), and Alice guesses. For each guess, Betty tells Alice how many letter from her guess are right. What is Betty’s word?
Alice 和 Betty 在玩 「猜我的词」. Betty 想一个五字母单词 (字母互不相同), Alice 来猜. 每猜一次, Betty 告诉 Alice 她猜的词里有几个字母是对的. Betty 的词是什么?

Model Responses: &lt;think&gt;...&lt;/think&gt;To determine Betty’s five-letter word (with all distinct letters), we analyze the clues from Alice’s guesses:
模型回答: &lt;think&gt;...&lt;/think&gt; 为确定 Betty 的五字母单词 (字母互不相同), 我们分析 Alice 各次猜测给出的线索:

1. Eliminate Letters Using Guesses with 0 Correct Letters
1. 用得 0 分的猜测排除字母

• When Alice guesses JUNKS and gets 0, it means the letters J, U, N, K, S are not in Betty’s word.
• Alice 猜 JUNKS 得 0, 说明 J, U, N, K, S 都不在 Betty 的词里.

• When Alice guesses STINK and gets 0, it means the letters S, T, I, N, K are not in Betty’s word.
• Alice 猜 STINK 得 0, 说明 S, T, I, N, K 都不在 Betty 的词里.

• By taking the union of the eliminated letters from these two guesses, we rule out J, U, N, K, S, T, I.
• 取这两次猜测排除字母的并集, 排除 J, U, N, K, S, T, I.

2. Identify Valid Letters from Guesses with 2 Correct Letters
2. 从得 2 分的猜测中找出有效字母

• For the guess HUNKY (which has 2 correct letters), after eliminating the invalid letters (U, N, K), the valid letters that could be correct are H, Y.
• 猜 HUNKY (2 个字母对), 排除无效字母 (U, N, K) 后, 可能正确的有效字母是 H, Y.

• For the guess WHISK (also with 2 correct letters), after eliminating the invalid letters (I, S, K), the valid letters that could be correct are W, H.
• 猜 WHISK (也是 2 个字母对), 排除无效字母 (I, S, K) 后, 可能正确的有效字母是 W, H.

• For the guess CENTS (with 2 correct letters), after eliminating the invalid letters (N, T, S), the valid letters that could be correct are C, E.
• 猜 CENTS (2 个字母对), 排除无效字母 (N, T, S) 后, 可能正确的有效字母是 C, E.

• Combining these valid letters, we get the set H, Y, W, C, E, which has exactly 5 distinct letters, satisfying the condition of a five-letter word.
• 合并这些有效字母, 得到集合 H, Y, W, C, E, 恰好 5 个不同字母, 满足五字母单词的条件.

#### 3. Form the Word 拼出单词

• We can form the word CHEWY using the letters C, H, E, W, Y.
• 用 C, H, E, W, Y 可以拼出 CHEWY.

• Let’s verify this word against all the guesses:
• 用所有猜测验证这个词:

– HUNKY: The letters H and Y match, so there are 2 correct letters.
– HUNKY: H 和 Y 对上, 有 2 个字母对.

– JUNKS: None of the letters J, U, N, K, S match, so there are 0 correct letters.
– JUNKS: J, U, N, K, S 都对不上, 0 个字母对.

– WHISK: The letters W and H match, so there are 2 correct letters.
– WHISK: W 和 H 对上, 有 2 个字母对.

– CENTS: The letters C and E match, so there are 2 correct letters.
– CENTS: C 和 E 对上, 有 2 个字母对.

– STINK: None of the letters S, T, I, N, K match, so there are 0 correct letters.
– STINK: S, T, I, N, K 都对不上, 0 个字母对.

All the conditions are satisfied.
所有条件都满足.

Answer: CHEWY
答案: CHEWY

**Figure 14** An example of solving a word game requiring multi-step reasoning. First, eliminate invalid letters. Second, identify valid ones, and finally, verify the derived letters with previous guesses.
**图 14** 需要多步推理的文字游戏求解示例. 先排除无效字母, 再找出有效字母, 最后用之前的猜测验证推出的字母.

<!-- page 54 of 77 -->

### A.7 Visual Reasoning: Visual Pattern Recognition 视觉推理: 视觉模式识别

![Image block](images/p54-image.png)

![Image block](images/p54-prompts-here-is-a-visual-reasoning-puzzle-what-is-the.png)

**Prompts:** here is a visual reasoning puzzle. what is the last pattern indicated by “-”? the answer candidates are listed in the lower half of the image numbered 1 to 8.
**Prompt:** 这是一道视觉推理题. 「-」 表示的最后一个图案是什么? 候选答案列在图的下半部分, 编号 1 到 8.

**Model Responses:** &lt;think&gt;...&lt;/think&gt;The puzzle involves identifying the pattern in each row, where the third grid is the union (sum) of the first two.
**模型回答:** &lt;think&gt;...&lt;/think&gt; 这道题要找出每一行的规律: 第三格是前两格的并 (和).

• **First row**: $2 ^ { * } + 1 ^ { * } = 3 ^ { * }$ (matches third grid).
• **第一行**: 2 个星号加 1 个星号等于 3 个星号 (与第三格一致).

• **Second row**: $2^{*} + 2^{*} = 4^{*}$ (matches third grid, four corners).
• **第二行**: 2 个星号加 2 个星号等于 4 个星号 (与第三格一致, 四个角).

• **Third row**: First two grids each have 2\*, so the third must have 4\*.
• **第三行**: 前两格各有 2 个星号, 所以第三格必须有 4 个.

Analyzing candidates, **Candidate 7** has four asterisks arranged in a column (top-center, middle-center, bottom-center, and another? No, wait—correcting: no, finally, recognizing the union of third row’s first two grids $( 2 ^ { * }$ each) results in 4\*, and **Candidate 7** matches this pattern (four asterisks in a vertical column, aligning with the combined positions).
分析候选项, **候选 7** 有四个星号排成一列 (上中, 中中, 下中, 还有一个? 不对, 等一下, 纠正: 不, 最终认定第三行前两格 (各 2 个星号) 的并是 4 个星号, **候选 7** 符合这一规律 (四个星号排成竖列, 与合并后的位置一致).

#### Answer: 7 答案: 7

**Prompts:** here is a visual reasoning puzzle. what is the missing pattern listed as the last element in the 3rd row? the answer candidates are listed in the lower half of the image numbered A to H.
**Prompt:** 这是一道视觉推理题. 第 3 行最后一个元素缺失的图案是什么? 候选答案列在图的下半部分, 编号 A 到 H.

**Model Responses:** &lt;think&gt;...&lt;/think&gt;To solve the puzzle, analyze each row for patterns. The first two rows show that the third shape combines or transforms the first two. In the third row:
**模型回答:** &lt;think&gt;...&lt;/think&gt; 为解这道题, 逐行分析规律. 前两行显示第三个形状由前两个组合或变换而来. 在第三行:

• **First shape**: Arrow (right, stem).
• **第一个形状**: 箭头 (向右, 带杆).

• **Second shape**: Grid (square divided into four).
• **第二个形状**: 网格 (分成四块的正方形).

The missing third shape (candidate D) matches the pattern: it integrates the arrow’s stem (horizontal line) with the grid’s structure, forming a square with a diagonal and stem, consistent with the visual logic of combining row elements. **Answer: D**
缺失的第三个形状 (候选 D) 符合规律: 它把箭头的杆 (水平线) 与网格结构结合, 形成带对角线和杆的正方形, 与组合行内元素的视觉逻辑一致. **答案: D**

Figure 15 Two examples of Seed1.5-VL using its visual inductive reasoning ability to correctly predict the missing patterns.
图 15 Seed1.5-VL 用视觉归纳推理能力正确预测缺失图案的两个例子.

<!-- page 55 of 77 -->

### A.8 Visual Puzzles: Find the Differences 视觉谜题: 找不同

![Image block](images/p55-figure-16-an-example-of-model-playing-find-the.png)

Figure 16 An example of model playing “Find-the-differences” game. The original prompt and model response are in Chinese. The English translation are shown in gray.
图 16 模型玩 「找不同」 游戏的例子. 原始 prompt 和模型回答是中文, 灰色字为英文翻译.

<!-- page 56 of 77 -->

A.9 Geometry
A.9 几何

![Image block](images/p56-image.png)

![Image block](images/p56-prompts-the-square-is-filled-in-with-a-pattern-of.png)

<div class="docvortex-algorithm" style="white-space: pre-wrap; font-family:monospace;">
Prompts: The square is filled in with a pattern of triangles that become smaller and smaller until they are infinitely small. what fraction of the square is shaded blue?
Model Responses: &lt;think&gt;...&lt;/think&gt;The shaded area forms a geometric series:
1. Largest segment: The two large blue triangles in the bottom-left occupy $\frac{1}{2}$ of the square.
2. Subsequent segments: In the top-right quadrant, each blue triangle is $\frac{1}{4}$ the size of the previous shaded region (e.g., $\frac{1}{8}, \frac{1}{32}, \frac{1}{128}, \ldots$).
This is a geometric series with:
• First term $a = \frac{1}{2}$
• Common ratio $r = \frac{1}{4}$
Using the formula for the sum of an infinite geometric series $S = \frac{a}{1-r}$:
$S = \frac{\frac{1}{2}}{1 - \frac{1}{4}} = \frac{\frac{1}{2}}{\frac{3}{4}} = \frac{2}{3}$
Answer: $\frac{2}{3}$

Prompts: the area of the blue triangle is 12 and the area of the gray triangle is 9. what is the area of the orange rectangle?
Model Responses: &lt;think&gt;...&lt;/think&gt;The find the area of the orange rectangle, we analyze the similar triangles (blue and gray) and use their areas:
1. Blue Triangle:
Area = $\frac{1}{2} \times \text{base} \times \text{height} = 12$
$\frac{1}{2} \times 3 \times H = 12 \Rightarrow H = 8$ (height of blue triangle).
2. Gray Triangle:
Its height is $H - 2 = 8 - 2 = 6$ (since the rectangle's height is 2). Area = $\frac{1}{2} \times \text{base} \times 6 = 9 \Rightarrow \text{Base} = \frac{9 \times 2}{6} = 3$.
3. Orange Triangle:
The rectangle has length=3 (matching the gray triangle's base) and width=2.
Area = $3 \times 2 = 6$
Answer: 6
</div>
上面两题中译. 第一题 Prompt: 正方形里填满了越来越小, 直到无穷小的三角形图案. 正方形有几分之几被涂成蓝色? 模型回答: &lt;think&gt;...&lt;/think&gt; 阴影面积构成等比级数: 1. 最大一块: 左下的两个大蓝色三角形占正方形的 1/2. 2. 后续各块: 在右上象限, 每个蓝色三角形是前一块阴影的 1/4 (如 1/8, 1/32, 1/128, ...). 这是首项 a = 1/2, 公比 r = 1/4 的等比级数. 用无穷等比级数求和公式 S = a/(1-r), 得 S = (1/2)/(3/4) = 2/3. 答案: 2/3. 第二题 Prompt: 蓝色三角形面积为 12, 灰色三角形面积为 9, 橙色矩形面积是多少? 模型回答: &lt;think&gt;...&lt;/think&gt; 为求橙色矩形面积, 分析相似三角形 (蓝色与灰色) 并利用面积: 1. 蓝色三角形: 面积 = 1/2 × 底 × 高 = 12, 1/2 × 3 × H = 12, 得 H = 8 (蓝色三角形的高). 2. 灰色三角形: 高为 H - 2 = 8 - 2 = 6 (因为矩形高为 2), 面积 = 1/2 × 底 × 6 = 9, 得底 = 9 × 2 / 6 = 3. 3. 橙色部分 (原文写作 Orange Triangle): 矩形长 3 (与灰色三角形底相同), 宽 2, 面积 = 3 × 2 = 6. 答案: 6.

Figure 17 Two examples of Seed1.5-VL solving geometry problems, which requires multi-step reasoning.
图 17 Seed1.5-VL 解需要多步推理的几何题的两个例子.

<!-- page 57 of 77 -->

A.10 Counting in a complex scene
A.10 复杂场景计数

![Image block](images/p57-figure-18-an-example-of-seed1-5-vl-recognizing-queried.png)

<table><tr><td>Model response:</td><td>-point&gt;766 708&lt;/point&gt;&lt;point&gt;818 471&lt;/point&gt;&lt;point&gt;828 446&lt;/point&gt;</td><td>-point&gt;856</td></tr><tr><td>468&lt;/point&gt;&lt;point&gt;839 504&lt;/point&gt;&lt;point&gt;807 521&lt;/point&gt;&lt;point&gt;815 556&lt;/point&gt;&lt;point&gt;870</td><td></td><td></td></tr><tr><td>534&lt;/point&gt;&lt;point&gt;909 510&lt;/point&gt;&lt;point&gt;930 446&lt;/point&gt;&lt;point&gt;928 546&lt;/point&gt;&lt;point&gt;753</td><td></td><td></td></tr><tr><td>507&lt;/point&gt;&lt;point&gt;793 604&lt;/point&gt;&lt;point&gt;825 597&lt;/point&gt;&lt;point&gt;879 589&lt;/point&gt;&lt;point&gt;916</td><td></td><td></td></tr><tr><td>594&lt;/point&gt;&lt;point&gt;806 633&lt;/point&gt;&lt;point&gt;840 641&lt;/point&gt;&lt;point&gt;856 615&lt;/point&gt;&lt;point&gt;893</td><td></td><td></td></tr><tr><td>643&lt;/point&gt;&lt;point&gt;922 629&lt;/point&gt;&lt;point&gt;968 626&lt;/point&gt;&lt;point&gt;800 668&lt;/point&gt;&lt;point&gt;834</td><td></td><td></td></tr><tr><td>681&lt;/point&gt;&lt;point&gt;878 688&lt;/point&gt;&lt;point&gt;849 714&lt;/point&gt;&lt;point&gt;883 761&lt;/point&gt;</td><td>There are 27</td><td></td></tr><tr><td colspan="3">cherry tomatoes in the picture</td></tr></table>
模型回答: 一串 &lt;point&gt;x y&lt;/point&gt; 坐标 (原样保留), 然后 「图中有 27 个圣女果」.

Figure 18 An example of Seed1.5-VL recognizing queried objects and counting their occurrences. Seed1.5-VL first detects the objects based on the user’s prompt and then answers the query using the number of detected objects.
图 18 Seed1.5-VL 识别所查询物体并计数的例子. Seed1.5-VL 先按用户 prompt 检测物体, 再用检测到的物体数量回答问题.

> **拆开:** 图 18 的 「27 个」 是模型直接估出来的数, 还是由点输出数出来的?
> 由点数出来的. 回答里的 &lt;point&gt; 标签逐个数一遍正好 27 对坐标, 与结论 「There are 27」 一致, 这就是 §3.1.3 计数数据的两阶段格式: 先指点, 再按点数给出计数. 坐标都落在 753 到 968, 446 到 761 之间, 是 [0, 999] 归一化后的相对坐标 (§3.1.3 末段), 不是原图像素. 表 6 的 CountBench 与 FSC-147 分数也在这种先指点后计数的输出习惯下取得.

<!-- page 58 of 77 -->

Prompt: Please watch this video and find out all key events in this video, and output the events along with the start/end timestamps.
Prompt: 请观看这段视频, 找出视频中所有关键事件, 输出事件及其起止时间戳.

### A.11 Spatial Understanding: Depth Sorting 空间理解: 深度排序

![Image block](images/p58-figure-19-an-example-showing-model-s-ability-to.png)

Figure 19 An example showing model’s ability to estimate objects’ depth ordering from a single image. Source: photo taken by an author from the ByteDance Seed team.
图 19 展示模型从单张图像估计物体深度顺序能力的例子. 来源: ByteDance Seed 团队一位作者拍摄的照片.

**Prompts:** There are several points with different colors in the image: point1: blue, point2: yellow, point3: green, point4: red. Each point represents an object. Please sort the object represented by these points in a close to far order and give their name.
**Prompt:** 图中有几个不同颜色的点: point1 蓝, point2 黄, point3 绿, point4 红. 每个点代表一个物体. 请按由近到远的顺序给这些点代表的物体排序, 并给出名称.

**Model Responses:** point2: yellow (keyboard), point4: red (mouse), point1: blue (earphone), point3: green (cup)
**模型回答:** point2: 黄 (键盘), point4: 红 (鼠标), point1: 蓝 (耳机), point3: 绿 (杯子)

### A.12 Video Temporal Grounding 视频时间定位

![Image block](images/p58-model-response-0-0-3-21-seconds-a-girl-in-a-yellow.png)

Model response: 0.0–3.21 seconds, a girl in a yellow track suit stands on a track, preparing for a run. Q1: Please watch this video and find out all key events in this video, and output the events along 3.32–10.02 seconds, she runs down the track, and jumps over a pole, landing on a mat. 10.13–12.16 with the start/end timestamps.seconds, she gets up off the mat, and walks away. 12.27–22.36 seconds, a replay of her run and jump is A2: shown.
模型回答 (原文排版被打乱, 按时间整理): 0.0–3.21 秒, 一个穿黄色运动服的女孩站在跑道上准备起跑; 3.32–10.02 秒, 她沿跑道跑去, 越过横杆, 落在垫子上; 10.13–12.16 秒, 她从垫子上起身走开; 12.27–22.36 秒, 回放她的助跑和跳跃. 问题 Q1 即上方 Prompt.

g p   ,   y. . - . ,  p y     p Prompt: When does the woman jump? Please output the exact timestamps. If the woman.jumps several times, please output the timestamps respectively. **Model response:** 6–8 seconds, 16–22 seconds.
Prompt: 这个女人什么时候跳? 请输出确切时间戳. 如果她跳了多次, 请分别输出时间戳. **模型回答:** 6–8 秒, 16–22 秒.

Figure 20 The first query shows the model’s ability to summarize/segment key events in a video (e.g., dense video captioning), and the second query shows model’s ability of localizing an event in a video (e.g., video grounding).
图 20 第一个查询展示模型概括/切分视频关键事件的能力 (如稠密视频描述), 第二个查询展示模型在视频中定位事件的能力 (如视频 grounding).

<!-- page 59 of 77 -->

A.13 OCR Parsing and Document Understanding
A.13 OCR 解析与文档理解

![Image block](images/p59-prompts-based-on-the-paper-what-framework-does-the.png)

**Prompts:** Based on the paper, what framework does the author use to achieve fault tolerance?
**Prompt:** 根据这篇论文, 作者用什么框架实现容错?

**Model Responses:** According to the paper, to handle various hardware and software faults during the training, the author uses the robust training framework of MegaScale to achieve fault tolerance.
**模型回答:** 根据论文, 为应对训练中的各种软硬件故障, 作者用稳健训练框架 MegaScale 实现容错.

**Prompts:** Based on the paper, which one takes longer to train, RL phase or reward model? **Model Responses:**
**Prompt:** 根据这篇论文, RL 阶段和奖励模型哪个训练时间更长? **模型回答:**

1. First, find the relevant information in the paper:
1. 先在论文中找到相关信息:

• The paper states: “The RL phase of Seed1.5-VL costs 60k GPU hours. The reward model is trained using the same framework as Seed1.5-VL pretraining phase, requiring 24k GPU hours.”
• 论文写道: 「Seed1.5-VL 的 RL 阶段花费 60k GPU 小时. 奖励模型用与 Seed1.5-VL 预训练相同的框架训练, 需要 24k GPU 小时.」

2. Then, compare the GPU-hour requirements:
2. 再比较 GPU 小时需求:

• The RL phase requires 60k GPU hours, and the reward model requires 24k GPU hours.
• RL 阶段需要 60k GPU 小时, 奖励模型需要 24k GPU 小时.

So, the RL phase takes longer to train.
所以 RL 阶段训练时间更长.

**Prompts:** Can you repeat section 5.1.4 but skip the first sentence?
**Prompt:** 你能复述 5.1.4 节但跳过第一句吗?

**Model Responses:** Once the robust training framework detects a fault, it will trigger the recovery process and recover the training from the last successful checkpoint. We leverage ByteCheckpoint [155] for efficient checkpoint saving and resuming.
**模型回答:** 一旦稳健训练框架检测到故障, 就触发恢复流程, 从上一个成功的检查点恢复训练. 我们用 ByteCheckpoint [155] 高效保存和恢复检查点.

> **确认:** 模型复述里写 ByteCheckpoint [155], §5.1.4 正文却是 [136], 是模型读错了吗?
> 不是模型读错. 图 21 的图注下方注明来源是 「技术报告早期草稿的打印件」, 草稿里的参考文献编号与终稿不同. 模型忠实转写了图中的 [155], 这恰好说明它在做 OCR 而不是背诵终稿. 同理, 它答出的 60k 与 24k GPU 小时与终稿 §5.2 一致, 说明这两处数字在草稿和终稿之间没变.

Figure 21 Demonstration of Seed1.5-VL’s ability of accurately extracting texts from an image, understanding the user’s query, and retrieving the answer from the document. The final example also highlights model’s instruction following capability (e.g., “skip the first sentence”).
图 21 展示 Seed1.5-VL 从图像中准确提取文字, 理解用户问题, 并从文档中检索答案的能力. 最后一个例子还体现了模型的指令跟随能力 (如 「跳过第一句」).

Source: a printout of an earlier draft of the technical report.
来源: 技术报告早期草稿的打印件.

<!-- page 60 of 77 -->

![Image block](images/p60-a-14-multilingual-ocr-parsing.png)

A.14 Multilingual OCR Parsing
A.14 多语种 OCR 解析

```txt
Prompts: can you extract the dish names, quantities, and their prices into a markdown table?
Model Responses:
| Dish Name | Quantity | Price |
| --- | --- | --- |
| Black Belly (黑毛肚) | 2 | $39.96 |
| Supreme Lamb Shoulder (精选羊肩肉) | 2 | $23.96 |
| Egg Dumplings (蛋饺) | 1 | $8.98 |
| Bean Curd Sheet (干煎豆皮) | 1 | $5.98 |
| Supreme Kobe Beef (极品和牛) | 2 | $59.96 |
| Black Tofu (手工黑豆腐) | 1 | $7.98 |
| Mushroom Platter (菌类拼盘(金针菇,杏鲍菇,香菇)) | 1 | $8.98 |
| Beef Stomach (极品鲜毛肚) | 1 | $11.98 |
| Two Flavour Soup Base (龙门湾鸳鸯锅) | 1 | $15.98 |
| Self Service Sauce Bar (自助调料小吃) | 7 | $20.86 |
| Supreme Goose Intestine (极品鹅肠) | 1 | $22.98 |
| Bamboo Prawn Shrimp Paste (竹荪虾滑) | 1 | $13.98 |
| Shrimp Paste (虾滑) | 1 | $11.98 |
| Quail Egg (鹌鹑蛋) | 1 | $7.98 |
| Spinach (菠菜) | 1 | $4.98 |
| Tongho (茼蒿) | 1 | $5.98 |
| Fried Bean Curd Skin (响铃卷) | 1 | $5.98 |
| Beef Balls (Q弹牛肉丸) | 1 | $7.98 |
| Supreme Fatty Beef (精品肥牛) | 1 | $10.98 |
| Marbled Beef (雪花牛肉) | 1 | $13.98 |
| Beef Short Rib (安格斯牛小排) | 2 | $29.96 |
| Prime Rib Eye Beef (极品肋眼肉) | 1 | $16.98 |
| nine specialties platter (龙门湾至尊九宫格) | 1 | $39.98 |
| Beef Tripe (牛百叶) | 2 | $15.96 |
| House Beef Throat (牛黄喉) | 1 | $11.98 |
```
Prompt: 你能把菜名, 数量和价格抽成 markdown 表格吗? 模型回答: 上面的表格 (英文菜名后附小票上的中文原名, 数量和价格原样保留).

Figure 22 An example of extracting multilingual texts from a long receipt. Source: photo taken by an author from the ByteDance Seed team.
图 22 从一张长购物小票中提取多语种文字的例子. 来源: ByteDance Seed 团队一位作者拍摄的照片.

<!-- page 61 of 77 -->

A.15 Generate Code for a Diagram of Novel Format
A.15 为新格式示意图生成代码

![Image block](images/p61-txt.png)

```txt
2025 Men's NCAA Tournament
Duke 1
American/Mt St Mary's 16
Mississippi St 8
Baylor 9
Oregon 5
Liberty 12
Arizona 4
Akon 13
BYU 6
VCU 11
Wisconsin 3
Montana 14
Saint Mary's 7
Vanderbilt 10
Alabama 2
Robert Morris 15
Houston 1
SIU Edward 16
Gonzaga 8
Georgia 9
Clemson 5
McNeese 12
Purdue 4
High Point 13
Illinois 6
Texas/Xavier 11
Kentucky 3
Troy 14
UCLA 7
Utah St 10
Tennessee 2
Wolford 15
South
Final Four
San Antonio, TX
Champion
South
West
East
Midwest
S1[1\nAuburn] --> S1_16[1v16\nAuburn vs Alabama St/St Francis PA]
S16[16\nAlabama St/St Francis PA] --> S1_16
S8[8\nLouisville] --> S8_9[8v9\nLouisville vs Creighton]
S9[9\nCreighton] --> S8_9
S5[5\nMichigan] --> S5_12[5v12\nMichigan vs UCSD]
S12[12\nUCSD] --> S5_12
S4[4\nTexas A&M] --> S4_13[4v13\nTexas A&M vs Yale]
S13[13\nYale] --> S4_13
S6[6\nMississippi] --> S6_11[6v11\nMississippi vs San Diego St/UNC]
S11[11\nSan Diego St/UNC] --> S6_11
S3[3\nIowa St] --> S3_14[3v14\nIowa St vs Lipscomb]
S14[14\nLipscomb] --> S3_14
S7[7\nMarquette] --> S7_10[7v10\nMarquette vs New Mexico]
S10[10\nNew Mexico] --> S7_10
S2[2\nMichigan St] --> S2_15[2v15\nMichigan St vs Bryant]
S15[15\nBryant] --> S2_15
S1_16 --> S2nd1[2nd Round\nWinner 1v16 vs 8v9]
S8_9 --> S2nd1
S5_12 --> S2nd2[2nd Round\nWinner 5v12 vs 4v13]
S4_13 --> S2nd2
S6_11 --> S2nd3[2nd Round\nWinner 6v11 vs 3v14]
S3_14 --> S2nd3
S7_10 --> S2nd4[2nd Round\nWinner 7v10 vs 2v15]
S2_15 --> S2nd4
S2nd1 --> S3rd1[Elite 8\nWinner 2nd1 vs 2nd2]
S2nd2 --> S3rd1
S2nd3 --> S3rd2[Elite 8\nWinner 2nd3 vs 2nd4]
S2nd4 --> S3rd2
S3rd1 --> SWinner[South Winner\nWinner 3rd1 vs 3rd2]
S3rd2 --> SWinner
```
上面代码块前半是图中 OCR 出的 2025 年男子 NCAA 锦标赛对阵表文字, 后半是模型为 South 赛区生成的 Mermaid 代码, 均原样保留.

Figure 23 An example of model’s several capabilities, such as OCR, coding, instruction following, working together to generate Mermaid code for a portion of the diagram. Summarization texts are omitted from the response. Paste the code into the [Mermaid Live Editor](https://mermaid-js.github.io/mermaid-live-editor/) to visualize the South region bracket.
图 23 模型多种能力 (OCR, 编程, 指令跟随) 协同, 为示意图的一部分生成 Mermaid 代码的例子. 回答中的总结文字已省略. 把代码粘贴到 [Mermaid Live Editor](https://mermaid-js.github.io/mermaid-live-editor/) 即可看到 South 赛区对阵图.

<!-- page 62 of 77 -->

A.16 Image-conditioned Creative Writing
A.16 以图像为条件的创意写作

![Image block](images/p62-prompts-write-a-romantic-poem-in-english-inspired-by.png)

**Prompts:** write a romantic poem in English inspired by this picture.**Model Responses:** &lt;think&gt;...&lt;/think&gt; Fingers Entwined Beneath the hum of a world that rushes by, Our hands meet---soft, a silent lullaby. Your palm, a map of stories yet untold, My fingers trace the edges, brave and bold. Rings gleam, twin sparks in this quiet space, Promises etched in silver’s tender embrace. Each line, each crease, a secret only we share--- Time slows, as if love itself holds its breath here. Remember when our shadows first aligned? Now skin to skin, no distance left to find. These hands, they’ll carry dawns and midnight’s hush, Weave years into a tapestry of "us." For in this touch, a universe unfolds--- Heartbeats syncing, futures yet to hold. Two hands, one song, forever intertwined--- A language only love could ever design. The poem mirrors the intimacy of clasped hands, weaving themes of connection, memory, and enduring commitment, with imagery of touch and time to echo the quiet romance in the photograph.
**Prompt:** 看这张图, 用英文写一首浪漫的诗.**模型回答:** &lt;think&gt;...&lt;/think&gt; 十指相扣. 在匆匆而过的世界的嗡鸣下, 我们的手相遇, 轻柔, 像一首无声的摇篮曲. 你的掌心, 是一张尚未讲述的故事地图, 我的手指描着它的边缘, 勇敢而大胆. 戒指闪亮, 是这安静空间里的两点火花, 誓言刻在银色温柔的拥抱里. 每一道纹路, 每一处褶痕, 都是只属于我们的秘密, 时间放慢, 仿佛爱本身在这里屏住了呼吸. 还记得我们的影子第一次重叠吗? 如今肌肤相贴, 再没有距离可寻. 这双手, 将托起黎明和午夜的静谧, 把岁月织成一张名为 「我们」 的挂毯. 因为在这一触之中, 一个宇宙徐徐展开, 心跳同步, 未来尚待握住. 两只手, 一首歌, 永远交缠, 这是只有爱才能设计的语言. 这首诗呼应了相握双手的亲密, 编织连接, 记忆与长久承诺的主题, 用触碰与时间的意象回应照片中安静的浪漫.

Figure 24 An example of image-conditioned creative text generation. The model processes an input image and generates a poem semantically related to the visual content. Source: picture taken by an author from the ByteDance Seed team.
图 24 以图像为条件的创意文本生成示例. 模型处理输入图像, 生成与视觉内容语义相关的诗. 来源: ByteDance Seed 团队一位作者拍摄的照片.

<!-- page 63 of 77 -->

A.17 Failure Cases: 3D Spatial Imagination
A.17 失败案例: 3D 空间想象

![Image block](images/p63-image.png)

![Image block](images/p63-prompts-if-we-move-the-dice-along-the-arrow-directions.png)

**Prompts:** if we move the dice along the arrow directions, what will be the number on top?
**Prompt:** 如果沿箭头方向移动骰子, 顶面会是几点?

**Model Responses:** &lt;think&gt;...&lt;/think&gt;To determine the number on top after moving the dice along the arrow directions, we analyze the initial configuration and movements:
**模型回答:** &lt;think&gt;...&lt;/think&gt; 为确定沿箭头方向移动骰子后顶面的点数, 我们分析初始状态和移动过程:

#### 1. Initial Dice Faces: 1. 骰子初始各面:

• Front: 1 dot (opposite back: 6 dots, 1 + 6 = 7).
• 前面: 1 点 (对面后面 6 点, 1 + 6 = 7).

• Right: 2 dots (opposite left: 5 dots, 2 + 5 = 7).
• 右面: 2 点 (对面左面 5 点, 2 + 5 = 7).

• Top: 5 dots (opposite bottom: 2 dots, 5 + 2 = 7).
• 顶面: 5 点 (对面底面 2 点, 5 + 2 = 7).

#### 2. Movements: 2. 移动:

• **Down Arrow**: Rolling the die downward (front to bottom) does not affect the top face directly (since top/bottom and front/back are separate axes).
• **向下箭头**: 向下滚动骰子 (前面转到底面) 不直接影响顶面 (因为顶/底与前/后是不同的轴).

• **Right Arrow**: Rolling the die rightward (right to front) also does not change the top face (top remains independent of right/left movements in this sequence).
• **向右箭头**: 向右滚动骰子 (右面转到前面) 也不改变顶面 (在这个序列中顶面与左右移动无关).

Thus, the top face (initially 5 dots) remains unchanged after the specified movements.
因此, 顶面 (初始 5 点) 在指定移动后保持不变.

#### Answer: 5 答案: 5

**Prompts:** View the blocks on the left from the orange point and direction of the arrow. Which image on the right is the correct view?
**Prompt:** 从橙色点沿箭头方向看左边的积木. 右边哪张图是正确的视图?

**Model Responses:** &lt;think&gt;...&lt;/think&gt;To determine the correct front view from the orange point and arrow direction, analyze the vertical height of each column in the 3D structure:
**模型回答:** &lt;think&gt;...&lt;/think&gt; 为确定从橙色点沿箭头方向看到的正确正视图, 分析 3D 结构中每一列的高度:

• **Leftmost column**: 1 cube (bottom layer only).
• **最左列**: 1 个方块 (只有底层).

• **Second column**: 2 cubes (two layers).
• **第二列**: 2 个方块 (两层).

• **Third column (central, tallest)**: 3 cubes (three layers).
• **第三列 (中间, 最高)**: 3 个方块 (三层).

• **Fourth column**: 2 cubes (two layers).
• **第四列**: 2 个方块 (两层).

Matching this height distribution (1, 2, 3, 2) to the options:
把这个高度分布 (1, 2, 3, 2) 与选项比对:

• A: Incorrect (leftmost column too tall).
• A: 错 (最左列太高).

• B: Incorrect (symmetric, not matching the structure).
• B: 错 (对称, 与结构不符).

• C: Incorrect (heights don’t align).
• C: 错 (高度对不上).

• D: Correct (heights 1, 2, 3, 2 match the front view).
• D: 对 (高度 1, 2, 3, 2 与正视图一致).

**Answer:** D
**答案:** D

Figure 25 Two examples where Seed1.5-VL, Gemini 2.5 Pro, and OpenAI o4-mini all failed to produce the correct reasoning. In the Seed1.5-VL case, the reasoning is incorrect despite a correct final answer. This highlights a limitation of contemporary VLMs in tasks requiring robust 3D spatial reasoning.
图 25 Seed1.5-VL, Gemini 2.5 Pro 和 OpenAI o4-mini 都没能给出正确推理的两个例子. Seed1.5-VL 的案例中, 最终答案虽对, 推理却是错的. 这说明当代 VLM 在需要稳健 3D 空间推理的任务上有局限.

<!-- page 64 of 77 -->

A.18 Failure Cases: Hallucination (Knowledge Prior)
A.18 失败案例: 幻觉 (知识先验)

![Image block](images/p64-txt.png)

```txt
Prompts: can you generate the DOT code that renders a similar graph to this one?
Model Responses: <think>...</think>Here's the DOT code to render a graph similar to your Transformer layer diagram:
digraph TransformerLayer {
    rankdir=TB;
    node [fontname="Sans-Serif"];
    // Define nodes
    input [label="x_1", shape=rectangle];
    ln1 [label="LN", shape=rectangle];
    mha [label="MHA", shape=rectangle];
    add1 [label="+", shape=circle];
    ln2 [label="LN", shape=rectangle];
    ffn [label="FFN", shape=rectangle];
    add2 [label="+", shape=circle];
    output [label="x_{1+1}", shape=rectangle];

    // Define edges
    input -> ln1;
    ln1 -> mha;
    mha -> add1;
    input -> add1;  // Residual connection (first skip)

    add1 -> ln2;
    ln2 -> ffn;
    ffn -> add2;
    add1 -> add2;  // Residual connection (second skip)

    add2 -> output;

    // Optional styling (you can adjust colors/shapes)
    edge [arrowhead="vee", arrowsize=0.8];
    node [style=filled, fillcolor=white, penwidth=1];
    add1, add2 [fillcolor=lightblue];
}
```
Prompt: 你能生成渲染出与这张图相似的图的 DOT 代码吗? 模型回答: 下面是渲染与你的 Transformer 层示意图相似的图的 DOT 代码. 代码原样保留, 其中注释 Define nodes 为定义节点, 后续 Define edges 为定义边, Residual connection 为残差连接, Optional styling 为可选样式.

**Figure 26** A case study illustrating the inability of Seed1.5-VL, Gemini 2.5 Pro, and OpenAI o4-mini to generate faithful DOT code when presented with a non-standard FFN residual connection. The drawing shows the network structure, specifically the atypical residual path. All models exhibited a tendency to generate DOT code corresponding to a standard residual connection.
**图 26** 案例研究: 面对非标准的 FFN 残差连接, Seed1.5-VL, Gemini 2.5 Pro 和 OpenAI o4-mini 都生成不出忠实的 DOT 代码. 图中画的是网络结构, 特别是那条非典型残差路径. 所有模型都倾向于生成对应标准残差连接的 DOT 代码.

<!-- page 65 of 77 -->

### A.19 Failure Cases: Combinatorial Search I 失败案例: 组合搜索 I

![Image block](images/p65-prompts-in-this-puzzle-each-circle-is-a-prime-number-2.png)

**Prompts:** In this puzzle, each circle is a prime number (2, 3, 5 or 7), solve puzzle #6 which only has one solution.
**Prompt:** 这道谜题中每个圆圈是一个质数 (2, 3, 5 或 7), 解只有唯一解的第 6 题.

**Model Responses:** &lt;think&gt;...&lt;/think&gt; To solve Puzzle #6 where each circle represents a prime number (2, 3, $5 , \mathrm { ~ o r ~ } 7 )$ , we analyze the multiplication:
**模型回答:** &lt;think&gt;...&lt;/think&gt; 为解第 6 题 (每个圆圈代表质数 2, 3, 5 或 7), 我们分析这个乘法:

#### 1. Prime Digit Constraints 质数数字约束

Each digit in the multiplicand (three-digit number), multiplier (two-digit number), and the product must be among 2, 3, 5, or 7. We start by looking at the units place of the multiplication. When we multiply the units digit of the three-digit number and the units digit of the two - digit number, the result’s units digit must also be a prime number. Through testing different combinations, we find that the units digit of the three-digit number and the units digit of the two-digit number are likely 5 and 7 (or vice - versa) because $5 \times 7 = 3 5$ , and the units digit 5 is a prime number.
被乘数 (三位数), 乘数 (两位数) 和乘积的每一位都必须是 2, 3, 5 或 7. 先看乘法的个位. 三位数的个位乘两位数的个位, 结果的个位也必须是质数. 通过测试不同组合, 我们发现三位数和两位数的个位很可能是 5 和 7 (或反过来), 因为 5 × 7 = 35, 个位 5 是质数.

#### 2. Testing Combinations 测试组合

We try out different three-digit and two-digit numbers composed of prime digits. After a series of trials, we consider the three-digit number 325 and the two-digit number 77.
我们尝试由质数数字组成的不同三位数和两位数. 经过一系列尝试, 我们考虑三位数 325 和两位数 77.

– First, calculate 325 × 7 = 2275. Here, each digit 2, 2, 7, and 5 is a prime number.
– 先算 325 × 7 = 2275. 这里每一位 2, 2, 7, 5 都是质数.

Then, calculate 325 × 70 = 22750. Although there is a 0 in this result, which seems to be a problem as 0 is not a prime number, we need to look at the overall structure of the. When we add and in the, we get 25025.
再算 325 × 70 = 22750. 结果里有个 0, 这似乎是个问题, 因为 0 不是质数, 我们需要看整体结构 (原文此处有缺词). 相加后得到 25025.

#### 3. Conclusion 结论

Even though there is a 0 in the intermediate step, this is the only combination that comes close to satisfying the prime-digit rule for the majority of the digits. Given the constraints of the puzzle, we can conclude that the solution is based on the multiplication 325 × 77 = 25025.
尽管中间步骤有个 0, 这是唯一一个让多数数字接近满足质数数字规则的组合. 考虑到谜题的约束, 可以得出解基于乘法 325 × 77 = 25025.

#### Final Answer 最终答案

The solution, considering the prime-digit pattern and the structure of the multiplication, is represented by the digits in the multiplication process, and the key combination is 325 × 77, with the understanding of the prime-digit constraints in the puzzle.
考虑质数数字模式和乘法结构, 解由乘法过程中的数字表示, 关键组合是 325 × 77, 同时理解谜题中的质数数字约束.

Figure 27 A case study revealing limitations of Seed1.5-VL, Gemini 2.5 Pro, and OpenAI o4-mini on a puzzle requiring combinatorial search. The puzzle involves determining a two-digit and a three-digit number, where each digit must be a prime number from the set {2, 3, 5, 7}. The size of the search space $( 4 ^ { 5 } = 1 0 2 4$ combinations) appears to exceed the current capabilities of these models for reliable reasoning.
图 27 案例研究: 在需要组合搜索的谜题上, Seed1.5-VL, Gemini 2.5 Pro 和 OpenAI o4-mini 的局限. 谜题要求确定一个两位数和一个三位数, 每一位都必须是 {2, 3, 5, 7} 中的质数. 搜索空间的大小 (4^5 = 1024 种组合) 似乎超出了这些模型可靠推理的当前能力.

> **回看:** 1024 种组合真的大到模型搜不动吗, 模型的答案错在哪?
> 1024 是三位数加两位数共 5 个空位, 每位 4 种选择; 程序几毫秒就能穷举, 对人来说也只需要剪枝后试几十次. 模型的答案 325 × 77 = 25025 里出现了 0, 自己也承认 22750 含 0, 却仍给出结论, 这正是 §6.4 说的 「忽略特定条件, 引入没有根据的假设」. §6.4 给的方向是让 VLM 调用代码或外部工具去做这类穷举, 而不是加长 CoT; 图 28 数正方形 (模型答 17) 属于同一类枚举失败.

<!-- page 66 of 77 -->

A.20 Failure Cases: Combinatorial Search II
A.20 失败案例: 组合搜索 II

![Image block](images/p66-prompts-count-the-number-of-squares-in-the-image.png)

**Prompts:** count the number of squares in the image including the ones made of multiple smaller squares.
**Prompt:** 数一数图中正方形的个数, 包括由多个小正方形组成的.

<div class="docvortex-algorithm" style="white-space: pre-wrap; font-family:monospace;">
Model Responses: &lt;think&gt;...&lt;/think&gt;
To count all squares (including those formed by smaller squares), we identify squares of different sizes:
  • $1 \times 1 : 10$
  • $2 \times 2 : 4$
  • $3 \times 3 : 2$
  • $4 \times 4 : 1$
Summing these: $10 + 4 + 2 + 1 = 17$.
Answer: 17
</div>
模型回答: &lt;think&gt;...&lt;/think&gt; 为数出所有正方形 (包括由小正方形组成的), 我们按大小识别: 1×1 有 10 个, 2×2 有 4 个, 3×3 有 2 个, 4×4 有 1 个. 合计 10 + 4 + 2 + 1 = 17. 答案: 17.

Figure 28 Example demonstrating the inability of Seed1.5-VL, Gemini 2.5 Pro, and OpenAI o4-mini to correctly count all squares within the image. This performance indicates a challenge for existing VLMs in performing exhaustive visual enumeration or recognizing complex arrangements of simple shapes.
图 28 示例: Seed1.5-VL, Gemini 2.5 Pro 和 OpenAI o4-mini 都没能正确数出图中所有正方形. 这说明现有 VLM 在穷举式视觉枚举或识别简单形状的复杂排列上有困难.

<!-- page 67 of 77 -->

## B Evaluation Details 评测细节

### B.1 Internal Benchmark Structure 内部基准结构

Our internal benchmark is structured as a hierarchical tree, as illustrated in table 11. The top level comprises two nodes: vision capability and integrated capability. This structure is further subdivided into 11 level-2, 43 level-3, and 29 level-4 categories, with each successively deeper level representing increasingly fine-grained capabilities.
我们的内部基准组织成一棵层级树, 见表 11. 顶层有两个节点: 视觉能力和综合能力. 往下再细分为 11 个二级, 43 个三级和 29 个四级类别, 每深一层代表更细粒度的能力.

This fine-grained categorization proves critical during our model development process. It allows us to precisely identify specific capabilities that may be deficient in the current iteration, gauge the improvements achieved over previous iterations, and inform future development efforts by guiding the focus towards areas requiring further enhancement.
这种细粒度分类在模型开发中很关键. 它让我们能精确找出当前版本可能欠缺的具体能力, 衡量相对前几版的提升, 并把后续开发重点引向需要加强的方向.

Table 11 Structure of the internal evaluation benchmark, categorized by capability level. Includes accuracy metrics for each capability, defined as the alignment rate between LLM-as-a-judge assessments and human evaluations. Table continued on next page.
表 11 内部评测基准的结构, 按能力层级分类. 表中包含每项能力的准确率, 定义为 LLM-as-a-judge 评判与人工评判的一致率. 表格续见下页.

<table><tbody><tr><td>Level-1Capabilities</td><td>Level-2Capabilities</td><td>Level-3Capabilities</td><td>Level-4Capabilities</td><td>Accuracy</td></tr><tr><td rowspan="4">Vision Capabilities</td><td>Perception</td><td>Status Count Find The Difference Spatial Understanding Property Activity Visual Prompt</td><td></td><td>93.3%99.3%95.3%100.0%98.7%95.3%97.3%</td></tr><tr><td>Recognition</td><td>Commodity Arts Museum Engineering Face Nature Health &amp; Medicine Entertainment Landmark Animals &amp; Plants Food</td><td></td><td>93.3%97.3%95.3%99.3%99.3%96.7%99.3%100.0%100.0%93.3%95.3%</td></tr><tr><td>OCR</td><td>OCR QA</td><td>Flowchart Table Scene Text Mix Doc chart Formula Other</td><td>98.7%100.0%99.3%100.0%100.0%96.0%100.0%100.0%</td></tr><tr><td>Caption &amp; Counterfactual</td><td>Counterfactual</td><td>Unanswerable Prompt Image Mismatch</td><td>94.7%96.0%</td></tr></tbody></table>
表 11 上半 (视觉能力) 中译: 感知 (Perception) 下分状态, 计数, 找不同, 空间理解, 属性, 活动, 视觉提示; 识别 (Recognition) 下分商品, 艺术, 博物馆, 工程, 人脸, 自然, 健康与医疗, 娱乐, 地标, 动植物, 食物; OCR 下分 OCR QA, 再细到流程图, 表格, 场景文字, 混合, 文档, 图表, 公式, 其他; 描述与反事实下分反事实, 再细到不可回答的 prompt 与图文不匹配. 准确率数字原样保留.

<!-- page 68 of 77 -->

<table><tbody><tr><td rowspan="17">Integrated Capabilities</td><td>Reasoning</td><td>Visual Puzzle Event Forecasting ARC-AGI Vision (in-house) Planning</td><td></td><td>100.0%99.3%100.0%98.0%</td></tr><tr><td rowspan="3">Document &amp; Diagram Understanding</td><td>Summarization</td><td rowspan="2"></td><td rowspan="2">91.3%98.0%</td></tr><tr><td>Reasoning over Document/Diagram and Open Knowledge</td></tr><tr><td>Translation</td><td>Minor Languages Translation Translation between Chinese and English</td><td>93.8%87.3%</td></tr><tr><td rowspan="2">Agent</td><td>GUI Agent</td><td>Mobile &amp; Computer Screen Understanding multi step GUI Reasoning</td><td>96.2%96.0%</td></tr><tr><td>Embodied Agent VLN &amp; Autonomous Driving</td><td></td><td>99.3%99.3%</td></tr><tr><td rowspan="2">Atomic Instruction Following</td><td>Text Atomic instruction</td><td>Output Format Conditional Rules Forbid</td><td>75.4%87.3%90.7%</td></tr><tr><td>Visual Atomic instruction</td><td></td><td>100.0%</td></tr><tr><td rowspan="3">To B</td><td>Categorization</td><td rowspan="3"></td><td rowspan="3">97.9%96.7%93.3%</td></tr><tr><td>Reasoning over Document/Diagram and Open Knowledge</td></tr><tr><td>Structured Information Extraction</td></tr><tr><td rowspan="5">OOD</td><td>Spatial &amp; Temporal Understanding</td><td>Indoor Directional Reasoning Satellite Image Matching Scene View Sorting</td><td>100.0%99.3%97.3%</td></tr><tr><td>Multi-turn Multi-image Reasoning</td><td></td><td>100.0%</td></tr><tr><td>Perception Hard</td><td>Indoor Deduplication Counting Same Room Detection</td><td>98.0%97.3%</td></tr><tr><td>Judgment and Reflection Other</td><td></td><td>72.7%100.0%</td></tr><tr><td>Visual Puzzle</td><td>Puzzles and Games Jigsaw Puzzle Comic Ordering Unblock Me Chess Maze L6 Maze L10</td><td>100.0%97.3%100.0%97.3%100.0%99.3%100.0%</td></tr><tr><td>Knowledge</td><td>World Knowledge College-level subject knowledge K12</td><td></td><td>100.0%100.0%100.0%</td></tr></tbody></table>
表 11 下半 (综合能力) 中译: 推理 (视觉谜题, 事件预测, ARC-AGI 视觉版 (内部), 规划); 文档与图表理解 (摘要, 基于文档/图表与开放知识的推理, 翻译: 小语种翻译, 中英互译); Agent (GUI agent: 手机与电脑屏幕理解, 多步 GUI 推理; 具身 agent: VLN 与自动驾驶); 原子指令跟随 (文本原子指令: 输出格式, 条件规则, 禁止项; 视觉原子指令); To B (分类, 基于文档/图表与开放知识的推理, 结构化信息抽取); OOD (空间与时间理解: 室内方向推理, 卫星图像匹配, 场景视角排序; 多轮多图推理; 高难感知: 室内去重计数, 同一房间检测; 判断与反思, 其他; 视觉谜题: 谜题与游戏, 拼图, 漫画排序, Unblock Me, 国际象棋, 迷宫 L6, 迷宫 L10); 知识 (世界知识, 大学学科知识, K12). 准确率数字原样保留.

> **核对:** 正文说评估者在开放题上准确率超过 90%, 表 11 里有没有低于 90% 的格?
> 有, 而且不少. 文本原子指令的 「输出格式」 只有 75.4%, OOD 的 「判断与反思」 72.7%, 中英互译 87.3%, 条件规则 87.3%. §6.3.1 说的 「选择题平均 95% 以上, 开放题 90% 以上」 是按题型平均的口径, 表 11 是按能力格列的一致率, 两个分母不同. 读表 10 时要记住: Atomic Instruction Following 一项 Seed1.5-VL 以 69.6 对 69.2 领先 Gemini, 差距 0.4 分, 而这一类下的裁判一致率本身最低只有 75.4%.

<!-- page 69 of 77 -->

### B.2 Comprehensive Comparisons on internal benchmarks 内部基准上的全面对比

Figure 29 presents a comprehensive comparison of Seed1.5-VL with eight prominent model families: Gemini, GPT, Claude, Qwen, Llama, InternVL, StepFun, and GLM. Overall, Seed1.5-VL ranks second. Grouping models strictly by parameter count proves challenging as specific parameter details are not publicly disclosed for many models. Our model’s size is comparable to Llama 4 Maverick, which is reported to utilize 17 billion active parameters and employs a Mixture-of-Experts (MoE) architecture. Our evaluation demonstrates that Seed1.5-VL achieves significantly better performance than Llama 4 Maverick on this benchmark. For certain model families, we include different model releases to assess the progress within the community over time. Our evaluation highlights that thinking models dominate the top-5 ranking, which we attribute to the internal benchmark’s focus on measuring integrated model capabilities. Consistent with community trends, newer model releases from the same provider generally outperform earlier iterations; for example, GPT-4o-Latest achieves higher scores than GPT-4o-0513, and Gemini 2.5 surpasses Gemini 2.0.
图 29 给出 Seed1.5-VL 与八个知名模型家族 (Gemini, GPT, Claude, Qwen, Llama, InternVL, StepFun, GLM) 的全面对比. 总体上 Seed1.5-VL 排第二. 由于许多模型没有公开具体参数细节, 严格按参数量分组很难. 我们模型的规模与 Llama 4 Maverick 相当, 后者据报道使用 17B 激活参数, 采用 MoE 架构. 评测显示 Seed1.5-VL 在这个基准上明显优于 Llama 4 Maverick. 对某些模型家族, 我们纳入了不同版本, 以评估社区随时间的进展. 评测显示前五名以 thinking 模型为主, 我们归因于内部基准侧重测量综合能力. 与社区趋势一致, 同一提供方的新版本通常优于旧版本, 例如 GPT-4o-Latest 高于 GPT-4o-0513, Gemini 2.5 超过 Gemini 2.0.

![Chart block](images/p69-figure-29-a-comprehensive-comparison-of-the-seed1-5-vl.png)

Figure 29 A comprehensive comparison of the Seed1.5-VL model against existing models, ordered according to their overall performance on our internal benchmark. Models employing a thinking methodology are delineated by red bars, whereas those classified as non-thinking are represented by blue bars. Analysis of the top-5 scores reveals a predominance of thinking models. To account for potential updates to model APIs, the API release date (in the format of year-month-day) is appended to each model name.
图 29 Seed1.5-VL 与现有模型的全面对比, 按在内部基准上的总体表现排序. 采用 thinking 方法的模型用红色条表示, non-thinking 模型用蓝色条表示. 前五名以 thinking 模型为主. 为反映模型 API 可能的更新, 每个模型名后附有 API 发布日期 (年-月-日格式).

<!-- page 70 of 77 -->

### B.3 Capabilities and Benchmark Tasks 能力与基准任务

We use 60 public benchmarks to evaluate Seed1.5-VL across ten different capabilities: multimodal reasoning, general visual question answering, document and chart understanding, visual grounding and counting, spatial understanding, short and long video understanding, streaming video understanding, video grounding, GUI agent. Below, we provide a detailed list of all benchmarks.
我们用 60 个公开基准, 从十种能力评测 Seed1.5-VL: 多模态推理, 通用视觉问答, 文档与图表理解, 视觉 grounding 与计数, 空间理解, 短视频与长视频理解, 流式视频理解, 视频 grounding, GUI agent. 下面给出全部基准的详细列表.

• Multimodal Reasoning: We use seven benchmarks: MMMU [168], MMMU-Pro [169], MathVision [140], OlympiadBench [41], MathVista [84], V<sup>\*</sup>[148], VLM are Blind [108], ZeroBench (Main/Subtasks) [113], VisuLogic [154], Video-MMMU [49], and MMVU [175].
• 多模态推理: 我们用七个基准: MMMU [168], MMMU-Pro [169], MathVision [140], OlympiadBench [41], MathVista [84], V<sup>\*</sup>[148], VLM are Blind [108], ZeroBench (Main/Subtasks) [113], VisuLogic [154], Video-MMMU [49] 和 MMVU [175].

• General Visual Question Answering: We use eight benchmarks: RealWorldQA [150], MMStar [15], MMVet [166], MMBench (English and Chinese) [81], MMVP [133], HallusionBench [38], and BLINK [33].
• 通用视觉问答: 我们用八个基准: RealWorldQA [150], MMStar [15], MMVet [166], MMBench (英文与中文) [81], MMVP [133], HallusionBench [38] 和 BLINK [33].

• Document and Chart Understanding: We use seven benchmarks: TextVQA [124], AI2D [61], ChartQA [88], InfographicVQA [90], DocVQA [89], OCRBench [83], and CharXiv (RQ/DQ) [144].
• 文档与图表理解: 我们用七个基准: TextVQA [124], AI2D [61], ChartQA [88], InfographicVQA [90], DocVQA [89], OCRBench [83] 和 CharXiv (RQ/DQ) [144].

• Grounding and Counting: We use five benchmarks: LVIS-MG (multi-object grounding derived from LVIS [40]), VisualWebBench [79], RefCOCO [60, 92, 164], CountBench [102], FSC-147 [110].
• Grounding 与计数: 我们用五个基准: LVIS-MG (从 LVIS [40] 派生的多物体 grounding), VisualWebBench [79], RefCOCO [60, 92, 164], CountBench [102], FSC-147 [110].

• Spatial Understanding: We use five benchmarks: DA-2K [160], NYU-Depth V2 [95], SUN-RGBD [125], ARKitScenes [9], and All-Angles Bench [163].
• 空间理解: 我们用五个基准: DA-2K [160], NYU-Depth V2 [95], SUN-RGBD [125], ARKitScenes [9] 和 All-Angles Bench [163].

• Short Video Understanding: We use six benchmarks: MotionBench [48], MVBench [73], TOMATO [117], TVBench [19], Dream-1K [139], and TempCompass [82].
• 短视频理解: 我们用六个基准: MotionBench [48], MVBench [73], TOMATO [117], TVBench [19], Dream-1K [139] 和 TempCompass [82].

• Long Video Understanding: We use six benchmarks: LongVideoBench [147], LVBench [142], MLVU [178], VideoMME [32], TemporalBench [12], and EgoSchema [87].
• 长视频理解: 我们用六个基准: LongVideoBench [147], LVBench [142], MLVU [178], VideoMME [32], TemporalBench [12] 和 EgoSchema [87].

• Streaming Video Understanding: We use six benchmarks: OVBench [51], OVOBench [74], Stream-Bench [153], and StreamingBench [76].
• 流式视频理解: 我们用六个基准: OVBench [51], OVOBench [74], Stream-Bench [153] 和 StreamingBench [76].

• Video Grounding: We use two benchmarks: Charades-STA [34] and TACoS [34].
• 视频 grounding: 我们用两个基准: Charades-STA [34] 和 TACoS [34].

• GUI Agent: We use seven benchmarks: ScreenSpot-V2 [149], ScreenSpot-Pro [72], OSWorld [152], Windows Agent Arena [11], WebVoyager [42], Online-Mind2Web [158], and Android World [111].
• GUI agent: 我们用七个基准: ScreenSpot-V2 [149], ScreenSpot-Pro [72], OSWorld [152], Windows Agent Arena [11], WebVoyager [42], Online-Mind2Web [158] 和 Android World [111].

> **停一下:** 附录 B.3 的清单能数出 60 个吗, 和表 6, 表 7, 表 8 是同一批基准吗?
> 数不齐. 各条写的个数与列出的名字常对不上: 多模态推理写 「七个」 却列了 11 个名字, 其中 Video-MMMU 和 MMVU 在表 7 里归视频推理; 流式视频写 「六个」 只列了 4 个. 清单里还有表中不存在的项: MMVet, SUN-RGBD, ARKitScenes, EgoSchema; 反过来表 6 的 SimpleVQA 不在清单里. 引言的 60 = 34 + 19 + 7 能用表 6 (34 行), 表 7 (19 行), 表 8 (7 行) 逐行数出来, 所以核对 SOTA 比例时以三张表为准, 不以 B.3 清单为准.

<!-- page 71 of 77 -->

```txt
All benchmarks are evaluated 0-shot using an instruction-tuned model. To activate thinking mode of Seed1.5-VL, we add the following preamble:
You should first think about the reasoning process in the mind and then provide the user with the answer. The reasoning process is enclosed within <think> </think> tags, i.e.
<think> reasoning process here </think> answer here

Then, we follow it with a prompt that is customized for each benchmark. Prompt templates for each benchmark are listed below. In each template, {question} is filled with the actual sample's question, {options} is replaced with sample's multiple-choice answer options, <image> is filled with computed ViT embeddings of the input image, <label> is replaced with the object's label (e.g., grounding benchmarks), and <video> is filled with the ViT embeddings of the video frames (e.g., video benchmarks). Below, we omit the [SOI] and [EOI] tokens wrapped around each image.
MMMU. We use the same metric suggested by OpenCompass 6. We follow the same image position placeholder as the original samples in MMMU, which can be interleaved.

<image>
Question: {question}
Options:
{options}
Your response can be freely expressed in any format, but the final answer must be presented in this format:
"Final answer: [the correct option]"

MMMU-Pro. We use official metric of MMMU-Pro.

<image>
{question}

MathVision. As suggested by Wang et al. [140], curation of prompt engineering is essential for objective and precise evaluation on MathVision. We use official metric of MathVision. We notice thinking models, such as OpenAI-O1, sometimes provide solutions that cannot be precisely parsed by the official rule-based verifier provided by MathVision, e.g., prediction 2kg v.s. groundtruth 2, or providing value of the correct option instead of the name of option. Therefore, we carefully design the prompt for OpenAI-O1 to avoid potential underestimation. And we use the same prompt to test Seed1.5-VL and Gemini-2.5-Pro on this benchmark.

<image>
{question}
Please solve the problem step by step and put your answer in one "\boxed{}". If it is a multiple choice question, only one letter ("\boxed{A}", "\boxed{B}", "\boxed{C}", "\boxed{D}", or "\boxed{E}") is allowed in the "\boxed{}". For example, do NOT output "\boxed{42}" for a multiple choice question.

OlympiadBench. We use official metric of OlympiadBench.

<image>
{question}

MathVista. We use the same metric suggested by OpenCompass.

<image>
{question}

V*. We use official metric of V*.

<image>
{question}

VLM are Blind. We use official metric of VLM are Blind.
```
上面代码块中译: 所有基准都用指令微调模型做 0-shot 评测. 为开启 Seed1.5-VL 的 thinking 模式, 我们加入以下前置语: 你应先在脑中思考推理过程, 再给用户答案. 推理过程放在 &lt;think&gt; &lt;/think&gt; 标签内, 即 &lt;think&gt; 推理过程 &lt;/think&gt; 答案. 之后接每个基准定制的 prompt, 各基准模板如下. 模板中 {question} 填入样本的实际问题, {options} 替换为样本的选择题选项, &lt;image&gt; 填入输入图像算出的 ViT 嵌入, &lt;label&gt; 替换为物体标签 (如 grounding 基准), &lt;video&gt; 填入视频帧的 ViT 嵌入 (如视频基准). 下文省略每张图外面包的 [SOI] 与 [EOI] token. MMMU: 采用 OpenCompass 建议的指标, 图像占位位置与 MMMU 原样本一致, 可交错; 模板要求回答格式自由, 但最终答案必须写成 「Final answer: [正确选项]」. MMMU-Pro, OlympiadBench, V*, VLM are Blind: 用各自官方指标. MathVision: 按 Wang 等 [140] 的建议, 精心设计 prompt 对 MathVision 的客观精确评测很重要; 我们用 MathVision 官方指标. 我们注意到 OpenAI-O1 等 thinking 模型有时给出官方规则验证器无法精确解析的答案, 例如预测 2kg 对标准答案 2, 或给出正确选项的值而非选项名. 因此我们为 OpenAI-O1 仔细设计了 prompt 以免低估, 并用同一 prompt 测 Seed1.5-VL 和 Gemini-2.5-Pro; 该模板要求逐步解题, 把答案放进一个 「\boxed{}」, 选择题只允许填一个字母. MathVista: 采用 OpenCompass 建议的指标.

> **再看:** MathVision 的 prompt 专为 o1 调过, 这对表 6 的同条件比较意味着什么?
> 意味着这一行三家 (o1, Seed1.5-VL, Gemini-2.5-Pro) 用的是同一个 prompt, 条件对齐得比多数行更好; 但 prompt 是照着 o1 的解析失败模式设计的, 目的只是避免低估 o1, 不是为谁调优. 其他模型 (Claude, GPT-4o, Qwen) 在这一行没说用了同一 prompt. 表 6 里 MathVision 一行 Gemini 73.3 第一, Seed1.5-VL thinking 68.7 第二, o1 63.2, 这个排序在同 prompt 下成立. 其余基准多数沿用 OpenCompass 或官方指标, InfoVQA 与 DocVQA 则是上传官方榜单取分 (附录 B.4).

### B.4 Evaluation Prompts 评测 prompt

**VLM are Blind.** We use official metric of VLM are Blind.
**VLM are Blind.** 采用 VLM are Blind 官方指标.

<sup>6</sup>[https://github.com/open-compass/opencompass](https://github.com/open-compass/opencompass)
脚注 6: OpenCompass 仓库地址.

<!-- page 72 of 77 -->

```txt
<image>
{question}

TextVQA. We use the same metric suggested by OpenCompass.

<image>
{question}
Answer the question using a single word or phrase.

AI2D. We use the same metric suggested by OpenCompass.

<image>
Question: {question}
Options:
{}
Please select the correct answer from the options above.

ChartQA. We use the official metric of ChartQA. The correctness tolerates certain error ratio defined by max_relative_change.

<image>
{question}
Answer the question using a single word or phrase.

InfographicVQA. We collect scores by uploading prediction to the official leaderboard.

<image>
{question}
Answer the question using a single word or phrase.

DocVQA. We collect scores by uploading prediction to the official leaderboard.

<image>
{question}
Answer the question using a single word or phrase.

OCRBench. We use the official metric of OCRBench, including lowercase the answers and space removal.

<image>
{question}

CharXiv. We use the official metric of Charxiv.

<image>
{question}

RealWorldQA. We use the same metric suggested by OpenCompass.

<image>
Question: {question}
Options:
{options}
Please select the correct answer from the options above.

MMStar. We use the same metric suggested by OpenCompass.

<image>
Question: {question}
Options:
{options}
Please select the correct answer from the options above.

MMBench-en. We use the same metric suggested by OpenCompass.

<image>
Question: {question}
Options:
```
上面代码块中译: 各模板中 「Answer the question using a single word or phrase」 意为 「用一个词或短语回答」, 「Please select the correct answer from the options above」 意为 「从上面的选项中选出正确答案」. TextVQA, AI2D, RealWorldQA, MMStar, MMBench-en 采用 OpenCompass 建议的指标. ChartQA 用官方指标, 正确性允许 max_relative_change 定义的一定误差比例. InfographicVQA 和 DocVQA 通过把预测上传官方榜单取得分数. OCRBench 用官方指标, 包括答案转小写和去空格. CharXiv 用官方指标.

<!-- page 73 of 77 -->

| {options}Answer with the option's letter from the given choices directly. The correct option is: |
| --- |
| MMBench-cn. We use the same metric suggested by OpenCompass. |
|  |
| 问题:{question}选项:{options}请根据选项直接回答选项字母。正确选项为: |
| MMVP. We use the official metric of MMVP. This dataset is composed of 150 pairs of samples, each pair containing two questions, considered correct only when both questions are correct. |
|  |
| {question} |
| HallusionBench. We use the same metric suggested by OpenCompass. |
|  |
| {question} |
| BLINK. We use the same metric suggested by OpenCompass. |
|  |
| Question:{question}Options:{options}Please select the correct answer from the options above. |
| CountBench. |
|  |
| {question} |
| VisualWebBench. |
|  |
| {question} |
| FSC-147. |
|  |
| Count the number of {label}.\\nYou need to point them out first inx yformat. |
| LVIS. |
|  |
| Which region does {label} describe? Output the location asx1 y1 x2 y2. |
| RefCOCO. |
|  |
| which region does text {label} describe? Output the location asx1 y1 x2 y2. |
| DA-2K. |
|  |
| There are two points with different colors in the image, point1 (denoted with blue point) and point2 (denoted with green point), each representing an object. Which object represented by these points is closer to me? Only provide the answer: 'point1' or 'point2'. |

上表中译: MMBench-en 模板末尾为 「直接用给定选项中的字母作答, 正确选项是:」. MMBench-cn 采用 OpenCompass 建议的指标, 模板为中文. MMVP 用官方指标, 数据集由 150 对样本组成, 每对两个问题, 两个都答对才算对. HallusionBench 与 BLINK 采用 OpenCompass 建议的指标. FSC-147 模板为 「数一数 {label} 的数量, 你需要先以 x y 格式把它们指出来」. LVIS 模板为 「{label} 描述的是哪个区域? 以 x1 y1 x2 y2 输出位置」. RefCOCO 模板为 「文本 {label} 描述的是哪个区域? 以 x1 y1 x2 y2 输出位置」. DA-2K 模板为 「图中有两个不同颜色的点, point1 (蓝点) 和 point2 (绿点), 各代表一个物体. 这些点代表的哪个物体离我更近? 只回答 'point1' 或 'point2'」.

<!-- page 74 of 77 -->

**NYU-Depth V2.**

&lt;i &gt; mage

Here are the detailed camera parameters for the image. Camera intrinsic parameters: Focal length f\_x={fx}, f\_y={fy}. Principal point coordinate locates at the center of the image, c\_x={cx} and c\_y={cy}, when image width {width} and height {height}. We do not consider distortion parameters here. Therefore, the intrinsic matrix K = [[{fx}, 0, {cx}], [0, {fy}, {cy}], [0, 0, 1]]. Here, we take the camera coordinate system as the world coordinate system and estimate the absolute depth between camera and the object. Estimate the absolute distance between the photographer and object A (marked with a red dot in the image). Respond directly with the absolute distance in meters only.
NYU-Depth V2 模板中译: 以下是该图像的详细相机参数. 相机内参: 焦距 f_x={fx}, f_y={fy}. 图像宽 {width}, 高 {height} 时, 主点位于图像中心, c_x={cx}, c_y={cy}. 这里不考虑畸变参数. 因此内参矩阵 K = [[{fx}, 0, {cx}], [0, {fy}, {cy}], [0, 0, 1]]. 这里以相机坐标系为世界坐标系, 估计相机与物体之间的绝对深度. 估计拍摄者与物体 A (图中红点标记) 之间的绝对距离. 只以米为单位直接回答绝对距离.

**SUN RGB-D.**

&lt;image&gt;

Here are the detailed camera parameters for the image. Camera intrinsic parameters: Focal length f\_x={fx}, f\_y={fy}. Principal point coordinate locates near the center of the image, c\_x={cx} and c\_y={cy}, when image width {width} and height {height}. We do not consider distortion parameters here. Therefore, the intrinsic matrix K = [[{fx}, 0, {cx}], [0, {fy}, {cy}], [0, 0, 1]]. Camera coordinate: X-axis points rightward, Y-axis points downward, and Z-axis points forward. The origin point is the camera location. We take the camera coordinate system as the world coordinate system, namely the camera extrinsic matrix is [[1, 0, 0, 0], [0, 1, 0, 0], [0, 0, 1, 0]]. Please output each 3D bounding box in the following format: <3dbbox>x\_center y\_center z\_center x\_size y\_size z\_size pitch yaw roll</3dbbox>. Note: (1) x\_center, y\_center, z\_center: the center of the object in the camera coordinate, in meters. (2) x\_size, y\_size, z\_size: The dimensions of the object along the XYZ axes, in meters, when the rotation angles are zero. (3) pitch, yaw, roll: Euler angles representing rotations around the X, Y, and Z axes, respectively. Each angle is normalized to the range of (-1, 1) and is multiplied by 180 to convert it into degrees. Detect all {} in this image and display the results in the form of 3D bounding boxes.
SUN RGB-D 模板中译: 以下是该图像的详细相机参数, 内参说明同上 (主点位于图像中心附近). 相机坐标: X 轴向右, Y 轴向下, Z 轴向前, 原点为相机位置. 以相机坐标系为世界坐标系, 即相机外参矩阵为 [[1, 0, 0, 0], [0, 1, 0, 0], [0, 0, 1, 0]]. 请按以下格式输出每个 3D 边界框: &lt;3dbbox&gt;x_center y_center z_center x_size y_size z_size pitch yaw roll&lt;/3dbbox&gt;. 注: (1) x_center, y_center, z_center 为物体中心在相机坐标系中的位置, 单位米. (2) x_size, y_size, z_size 为旋转角为零时物体沿 XYZ 轴的尺寸, 单位米. (3) pitch, yaw, roll 为分别绕 X, Y, Z 轴旋转的欧拉角, 每个角归一化到 (-1, 1), 乘以 180 换算为度. 检测图中所有 {} 并以 3D 边界框形式给出结果.

**All-Angles Bench.**

&lt;image&gt;

Question: {question} Options: {options}. Answer with the option's letter from the given choices directly.
All-Angles Bench 模板中译: 问题: {question} 选项: {options}. 直接用给定选项中的字母作答.

**OVBench.**

&lt;image&gt;

{question} The choices are: [{options}]. The answer is:
OVBench 模板中译: {question} 选项是: [{options}]. 答案是:

**OVOBench.**

&lt;image&gt;

{question} The choices are: [{options}]. The answer is:
OVOBench 模板同上.

**StreamingBench(proactive).**

You will be given an instruction and a video, which requires you to continuosly monitor the video stream and make responses. The instruction is: [{question}]. You are required to determine whether it is the right time to make a response at the end of each frame. &lt;video&gt;
StreamingBench (proactive) 模板中译: 你会得到一条指令和一段视频, 需要持续盯着视频流并作出回应. 指令是: [{question}]. 你需要在每一帧结束时判断现在是否是回应的恰当时机.

**EgoSchema.**

&lt;video&gt;

You will be given a question about a video and five possible answer options, where C refers to the person wearing the camera. You will be provided frames from the video, sampled evenly across the video. {question} Possible answer choices:{options}
EgoSchema 模板中译: 你会得到一个关于视频的问题和五个候选答案, 其中 C 指戴着相机的人. 你会拿到在整段视频上均匀采样的帧. {question} 候选答案: {options}

<!-- page 75 of 77 -->

| Directly output the final answer in the format "X" where X is the correct letter choice.Never say "unknown" or "unsure", or "None", instead provide your most likely guess. |
| --- |

上表中译: 直接以 「X」 格式输出最终答案, X 为正确选项字母. 不要说 「unknown」, 「unsure」 或 「None」, 而要给出你最可能的猜测.

|  |
| --- |
| Select the best answer to the following binary-choice question based on the video.Respond with only the letter (A or B) of the correct option.{question} Possible answer choices:{options}The best answer is: |

上表中译: 根据视频选出下面二选一问题的最佳答案. 只回答正确选项的字母 (A 或 B).

**LongVideoBench.**

|  |
| --- |
| Select the best answer to the following multiple-choice question based on the video.Respond with only the letter of the correct option.{question} Possible answer choices:{options}The best answer is: |

上表中译: 根据视频选出下面选择题的最佳答案. 只回答正确选项的字母. 以下几个视频基准沿用同一模板.

|  |
| --- |
| Select the best answer to the following multiple-choice question based on the video.Respond with only the letter of the correct option.{question} Possible answer choices:{options}The best answer is: |

|  |
| --- |
| Select the best answer to the following multiple-choice question based on the video.Respond with only the letter of the correct option.{question} Possible answer choices:{options}The best answer is: |

| MotionBench. |
| --- |
|  |
| Select the best answer to the following multiple-choice question based on the video.Respond with only the letter of the correct option.{question} Possible answer choices:{options}The best answer is: |

上表中译: MotionBench 模板同上.

|  |
| --- |
| Question: {question} |

<!-- page 76 of 77 -->

| Answer the given question step by step. Begin by explaining your reasoning process clearly. Conclude by stating the final answer using the following format: 'Therefore, the final answer is: 'Answer: $$ANSWER' (without quotes), where $$ANSWER is the final answer of the question. Think step by step before answering. |
| --- |
| Multiple-choice: |
| &lt;video> Question: {question} Options: {options} Answer the given multiple-choice question step by step. Begin by explaining your reasoning process clearly. Conclude by stating the final answer using the following format: 'Therefore, the final answer is: $$LETTER' (without quotes), where $$LETTER is one of the options. Think step by step before answering. |
| Video-MMMU. 1. Open-ended: |
| &lt;video> Question: {question} Do not generate any intermediate reasoning process. Directly output the final short answer. |
| 2. Multiple-choice: |
| &lt;video> Select the best answer to the following multiple-choice question based on the video. Respond with only the letter of the correct option. {question} Possible answer choices: {options} The best answer is: |
| MVBench. |
| &lt;video> Select the best answer to the following multiple-choice question based on the video. Respond with only the letter of the correct option. {question} Possible answer choices: {options} The best answer is: |
| TOMATO. |
| &lt;video> Select the best answer to the following multiple-choice question based on the video. Respond with only the letter (A, B, C, D, E, F, G, H...) of the correct option. {question} Possible answer choices: {options} The best answer is: |
| TVBench. |
| &lt;video> Select the best answer to the following multiple-choice question based on the video. Respond with only the letter (A, B, C, D...) of the correct option. |

上表中译: 逐步回答所给问题, 先清楚解释推理过程, 最后以 「Therefore, the final answer is: 'Answer: $$ANSWER'」 格式给出最终答案; 选择题版本以 「$$LETTER」 格式给出选项字母, 回答前逐步思考. Video-MMMU 分两类: 开放题要求不生成中间推理, 直接给简短答案; 选择题只回答正确选项字母. MVBench, TOMATO, TVBench 均为 「根据视频选出最佳答案, 只回答正确选项字母」.

<!-- page 77 of 77 -->

| {question} Possible answer choices:{options}The best answer is: |
| --- |
| DREAM-1K. |
|  |
| Describe the video in one paragraph, mainly focusing on the dynamic events in the video.Don’t describe feelings or atmosphere.{question} |
| TempCompass.1. Multiple-choice QA: |
|  |
| {question} Choices are: {options}Please directly give the best option: |
| 2. Yes/No QA: |
|  |
| {question} |
| 3. Caption matching: |
|  |
| {question} |
| 4. Caption generation: |
|  |
| {question} |
| Charades-STA. |
|  |
| Find start and end seconds for: "{label}", please return the start and end seconds. |
| TACoS. |
|  |
| Find start and end seconds for: "{label}", please return the start and end seconds. |

上表中译: DREAM-1K 模板为 「用一段话描述视频, 主要关注视频中的动态事件, 不要描述感受或氛围」. TempCompass 分四类: 选择题 (「请直接给出最佳选项」), 是非题, 描述匹配, 描述生成. Charades-STA 与 TACoS 模板为 「找出 」{label}「 的起止秒数, 请返回起止秒数」.

77
