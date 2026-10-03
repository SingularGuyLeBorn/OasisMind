---
title: "Gemini 1.0 · 对照译稿"
category: "模型库"
tags: ["Gemini", "对照译稿"]
published: true
excerpt: "Gemini 1.0 公开材料的逐段中英对照译稿，附读报告时的疑问块。"
---
<!-- page 1 of 90 -->

Google DeepMind

# Gemini: A Family of Highly Capable Multimodal Models

Gemini: 一族能力很强的多模态模型

**Gemini Team, Google**<sup>1</sup>

**This report introduces a new family of multimodal models, Gemini, that exhibit remarkable capabilities across image, audio, video, and text understanding. The Gemini family consists of Ultra, Pro, and Nano sizes, suitable for applications ranging from complex reasoning tasks to on-device memory-constrained use-cases. Evaluation on a broad range of benchmarks shows that our most-capable Gemini Ultra model advances the state of the art in 30 of 32 of these benchmarks — notably being the first model to achieve human-expert performance on the well-studied exam benchmark MMLU, and improving the state of the art in every one of the 20 multimodal benchmarks we examined. We believe that the new capabilities of the Gemini family in cross-modal reasoning and language understanding will enable a wide variety of use cases. We discuss our approach toward post-training and deploying Gemini models responsibly to users through services including Gemini, Gemini Advanced, Google AI Studio, and Cloud Vertex AI.**

本报告介绍一族新的多模态模型 Gemini. 它们在图像, 音频, 视频和文本理解上都表现出很强的能力. Gemini 家族有 Ultra, Pro, Nano 三个尺寸, 适用范围从复杂推理任务一直到端侧内存受限的场景. 在大量基准上的评测显示, 能力最强的 Gemini Ultra 在其中 32 项里的 30 项上推进了当时的最佳水平 (state of the art). 值得一提的是, 它是第一个在被广泛研究的考试基准 MMLU 上达到人类专家水平的模型, 并且在我们考察的 20 个多模态基准上全部刷新了最佳成绩. 我们相信 Gemini 家族在跨模态推理和语言理解上的新能力会催生各种各样的用例. 我们还讨论了后训练的做法, 以及如何通过 Gemini, Gemini Advanced, Google AI Studio 和 Cloud Vertex AI 等服务把 Gemini 模型负责任地部署给用户.

> **想:** 摘要说 20 个多模态基准 「每一个」 都提升了, 这 20 个分别落在哪几张表?
> 按第 2 页的拆分, 20 = 9 个图像 + 6 个视频 + 5 个语音. 附录 10.3 给了清单: 图像 9 项是 表 7 的 8 行加 表 9 的 XM-3600, 视频 6 项是 表 10 的 6 行, 语音 5 项对应 表 11 的 5 行. 语音这 5 项只测了 Pro 和 Nano-1, 见 5.2.4 节旁的疑惑.

## 1. Introduction

We present Gemini, a family of highly capable multimodal models developed at Google. We trained Gemini models jointly across image, audio, video, and text data for the purpose of building a model with both strong generalist capabilities across modalities alongside cutting-edge understanding and reasoning performance in each respective domain.

我们介绍 Gemini, 这是 Google 开发的一族能力很强的多模态模型. 我们在图像, 音频, 视频和文本数据上联合训练 Gemini 模型, 目标是得到一个既有跨模态的强通用能力, 又在每个领域里都有前沿理解与推理表现的模型.

Gemini 1.0, our first version, comes in three sizes: Ultra for highly-complex tasks, Pro for enhanced performance and deployability at scale, and Nano for on-device applications. Each size is specifically tailored to address different computational limitations and application requirements.

第一个版本 Gemini 1.0 有三个尺寸: Ultra 用于高度复杂的任务, Pro 兼顾更强的性能和大规模可部署性, Nano 用于端侧应用. 每个尺寸都针对不同的算力限制和应用需求专门定制.

After large-scale pre-training, we post-train our models to improve overall quality, enhance target capabilities, and ensure alignment and safety criteria are met. Due to the varied requirements of our downstream applications, we have produced two post-trained Gemini model family variants. Chat-focused variants, referred to as Gemini Apps models, are optimized for [Gemini and Gemini Advanced](https://gemini.google.com), our conversational AI service formerly known as Bard. Developer-focused variants, referred to as Gemini API models, are optimized for a range of products and are accessible through [Google AI Studio](https://makersuite.google.com) and [Cloud Vertex AI](https://cloud.google.com/vertex-ai).

大规模预训练之后, 我们对模型做后训练, 以提升整体质量, 增强目标能力, 并确保满足对齐与安全标准. 由于下游应用需求各异, 我们产出了两个后训练的 Gemini 模型家族变体. 面向对话的变体称为 Gemini Apps 模型, 针对 Gemini 和 Gemini Advanced 优化, 这是我们的对话式 AI 服务, 前身是 Bard. 面向开发者的变体称为 Gemini API 模型, 针对一系列产品优化, 可通过 Google AI Studio 和 Cloud Vertex AI 访问.

We evaluate the performance of pre- and post-trained Gemini models on a comprehensive suite of internal and external benchmarks covering a wide range of language, coding, reasoning, and multimodal tasks.

我们在一套全面的内部与外部基准上评测预训练和后训练的 Gemini 模型, 覆盖广泛的语言, 代码, 推理和多模态任务.

The Gemini family advances state-of-the-art in large-scale language modeling (Anil et al., 2023; Brown et al., 2020; Chowdhery et al., 2023; Hoffmann et al., 2022; OpenAI, 2023a; Radford et al., 2019; Rae et al., 2021), image understanding (Alayrac et al., 2022; Chen et al., 2022; Dosovitskiy et al., 2020; OpenAI, 2023b; Reed et al., 2022; Yu et al., 2022a), audio processing (Radford et al., 2023; Zhang et al., 2023), and video understanding (Alayrac et al., 2022; Chen et al., 2023). It also builds on the work on sequence models (Sutskever et al., 2014), a long history of work in deep learning based on neural networks (LeCun et al., 2015), and machine learning distributed systems

Gemini 家族推进了大规模语言建模 (Anil et al., 2023; Brown et al., 2020; Chowdhery et al., 2023; Hoffmann et al., 2022; OpenAI, 2023a; Radford et al., 2019; Rae et al., 2021), 图像理解 (Alayrac et al., 2022; Chen et al., 2022; Dosovitskiy et al., 2020; OpenAI, 2023b; Reed et al., 2022; Yu et al., 2022a), 音频处理 (Radford et al., 2023; Zhang et al., 2023) 和视频理解 (Alayrac et al., 2022; Chen et al., 2023) 的最佳水平. 它也建立在序列模型 (Sutskever et al., 2014), 基于神经网络的深度学习的长期积累 (LeCun et al., 2015), 以及支撑大规模训练的机器学习分布式系统 (Barham et al., 2022; Bradbury et al., 2018; Dean et al., 2012) 之上.

<small><span class="docvortex-page-footnote" data-block-type="page_footnote" style="color:#6b7280"><sup>1</sup>See Contributions and Acknowledgments section for full author list. Please send correspondence to gemini-1- report@google.com</span></small>

脚注 1: 完整作者名单见贡献与致谢一节. 来信请寄 gemini-1- report@google.com

© 2025 Google. All rights reserved

<!-- page 2 of 90 -->

Gemini: A Family of Highly Capable Multimodal Models

(Barham et al., 2022; Bradbury et al., 2018; Dean et al., 2012) that enable large-scale training.

Our most capable model, Gemini Ultra, achieves new state-of-the-art results in 30 of 32 benchmarks we report on, including 10 of 12 popular text and reasoning benchmarks, 9 of 9 image understanding benchmarks, 6 of 6 video understanding benchmarks, and 5 of 5 speech recognition and speech translation benchmarks. Gemini Ultra is the first model to achieve human-expert performance on MMLU (Hendrycks et al., 2021a) — a prominent benchmark testing knowledge and reasoning via a suite of exams — with a score above 90%. Beyond text, Gemini Ultra makes notable advances on challenging multimodal reasoning tasks. For example, on the recent MMMU benchmark (Yue et al., 2023), that comprises questions about images on multi-discipline tasks requiring college-level subject knowledge and deliberate reasoning, Gemini Ultra achieves a new state-of-the-art score of 62.4%, outperforming the previous best model by more than 5 percentage points. It provides a uniform performance lift for video question answering and audio understanding benchmarks.

我们能力最强的模型 Gemini Ultra 在所报告的 32 个基准里的 30 个上取得新的最佳成绩, 包括 12 个常用文本与推理基准中的 10 个, 9 个图像理解基准中的 9 个, 6 个视频理解基准中的 6 个, 以及 5 个语音识别和语音翻译基准中的 5 个. Gemini Ultra 是第一个在 MMLU (Hendrycks et al., 2021a) 上达到人类专家水平的模型, 得分超过 90%. MMLU 是一个知名基准, 用一组考试测试知识与推理. 在文本之外, Gemini Ultra 在有挑战的多模态推理任务上也有明显进展. 例如在新近的 MMMU 基准 (Yue et al., 2023) 上, 题目是关于图像的多学科问题, 需要大学水平的学科知识和审慎推理, Gemini Ultra 取得 62.4% 的新最佳成绩, 比之前最好的模型高出 5 个百分点以上. 它在视频问答和音频理解基准上也带来了一致的提升.

> **拆开:** 30/32 的分母 32 由哪几块组成, 输掉的两项是哪两项?
> 32 = 12 文本推理 + 9 图像 + 6 视频 + 5 语音, 输的两项都在文本块 (10/12). 论文没有逐项列出这 12 项. 表 2 有 9 行 (MMLU, GSM8K, MATH, BIG-Bench-Hard, HumanEval, Natural2Code, DROP, HellaSwag, WMT23), 表 5 有 3 行 (MGSM, XLsum, Wikilingua), 合起来正好 12; 按这 12 项对, Ultra 不是第一的恰好两项: 表 2 的 HellaSwag (87.8% 对 GPT-4 的 95.3%) 和 表 5 的 Wikilingua (48.9 对 PaLM 2-L 的 50.4). 这是对表得出的推断, 不是原文陈述.

Qualitative evaluation showcases impressive crossmodal reasoning capabilities, enabling the model to understand and reason across an input sequence of audio, images, and text natively (see Figure 5 and Table 13). Consider the educational setting depicted in Figure 1 as an example. A teacher has drawn a physics problem of a skier going down a slope, and a student has worked through a solution to it. Using Gemini models’ multimodal reasoning capabilities, the model is able to understand the messy handwriting, correctly understand the problem formulation, convert both the problem and solution to mathematical typesetting, identify the specific step of reasoning where the student went wrong in solving the problem, and then give a worked through correct solution to the problem. This opens up exciting educational possibilities, and we believe the new multimodal and reasoning capabilities of Gemini models have dramatic applications across many fields.

定性评测展示了出色的跨模态推理能力, 模型能原生地理解并推理由音频, 图像和文本组成的输入序列 (见图 5 和表 13). 以图 1 的教学场景为例: 老师画了一道滑雪者沿斜坡下滑的物理题, 学生给出了解答. 借助 Gemini 模型的多模态推理能力, 模型能读懂潦草的手写, 正确理解题目设定, 把题目和解答都转成数学排版, 找出学生解题出错的具体推理步骤, 再给出完整的正确解答. 这为教育带来了令人兴奋的可能. 我们相信 Gemini 模型新的多模态与推理能力会在许多领域有重大应用.

The reasoning capabilities of large language models show promise toward building generalist agents that can tackle more complex multi-step problems. The AlphaCode team built AlphaCode 2 (Leblond et al, 2023), a new Gemini-model-powered agent, that combines Gemini models’ reasoning capabilities with search and tool-use to excel at solving competitive programming problems. AlphaCode 2 ranks within the top 15% of entrants on the Codeforces competitive programming platform, a large improvement over its state-of-the-art predecessor in the top 50% (Li et al., 2022).

大语言模型的推理能力让人看到构建通用 agent 的希望, 这类 agent 能处理更复杂的多步问题. AlphaCode 团队构建了 AlphaCode 2 (Leblond et al, 2023), 一个由 Gemini 模型驱动的新 agent, 它把 Gemini 模型的推理能力和搜索, 工具使用结合起来, 擅长解决竞赛编程题. AlphaCode 2 在 Codeforces 竞赛编程平台上排进参赛者前 15%, 相比排在前 50% 的上一代最佳系统 (Li et al., 2022) 是很大的进步.

In tandem, we advance the frontier of efficiency with Gemini Nano, a series of small models targeting on-device deployment. These models excel in on-device tasks, such as summarization, reading comprehension, text completion tasks, and exhibit impressive capabilities in reasoning, STEM, coding, multimodal, and multilingual tasks relative to their sizes.

与此同时, 我们用 Gemini Nano 推进效率的前沿. 这是一组面向端侧部署的小模型. 它们擅长摘要, 阅读理解, 文本补全等端侧任务, 并且相对于其尺寸, 在推理, STEM, 编程, 多模态和多语言任务上也表现出色.

In the following sections, we first provide an overview of the model architecture, training infrastructure, and pre-training dataset. We then present detailed evaluations of the pre- and post-trained Gemini model family, covering well-studied benchmarks across text, code, image, audio and video — which include both English performance and multilingual capabilities. Next we discuss our approach to post-training, highlight common and distinct aspects of the Gemini Apps and Gemini API model variants, and benchmark their performance on key capabilities. Responsible deployment is critical: we explain our process for impact assessments, developing model policies, evaluations, and mitigations of harm before deployment decisions. Finally, we discuss the broader implications of Gemini models, their limitations alongside their potential applications — paving the way for a new era of research and innovation in AI.

接下来各节中, 我们先概述模型架构, 训练基础设施和预训练数据集. 然后详细评测预训练和后训练的 Gemini 模型家族, 覆盖文本, 代码, 图像, 音频和视频上被广泛研究的基准, 既包括英文表现, 也包括多语言能力. 之后讨论后训练的做法, 指出 Gemini Apps 和 Gemini API 两个变体的共同点与不同点, 并在关键能力上给出基准结果. 负责任的部署至关重要: 我们说明在部署决策之前如何做影响评估, 制定模型政策, 开展评测和缓解危害. 最后讨论 Gemini 模型更广泛的意义, 它们的局限和潜在应用, 为 AI 研究与创新的新时代铺路.

<!-- page 3 of 90 -->

Gemini: A Family of Highly Capable Multimodal Models

![Image block](images/p03-figure-1-verifying-a-student-s-solution-to-a-physics.png)

Figure 1 | Verifying a student’s solution to a physics problem. The model is able to correctly recognize all of the handwritten content and verify the reasoning. On top of understanding the text in the image, it needs to understand the problem setup and correctly follow instructions to generate LATEX.

图 1 | 验证学生对一道物理题的解答. 模型能正确识别全部手写内容并核验推理过程. 除了读懂图中文字, 模型还要理解题目设定, 并正确遵循指令生成 LATEX.

## 2. Model Architecture

**2. 模型架构**

Gemini models build on top of Transformer decoders (Vaswani et al., 2017b) that are enhanced with improvements in architecture and model optimization to enable stable training at scale and optimized inference on Google’s Tensor Processing Units. They are trained to support 32k context length, employing efficient attention mechanisms (for e.g. multi-query attention (Shazeer, 2019a)). Our first version, Gemini 1.0, comprises three main sizes to support a wide range of applications as discussed in Table 1.

Gemini 模型建立在 Transformer 解码器 (Vaswani et al., 2017b) 之上, 并在架构和模型优化上做了改进, 以便在大规模下稳定训练, 并在 Google 的 Tensor Processing Units (TPU) 上优化推理. 它们训练时支持 32k 上下文长度, 使用高效的注意力机制 (例如 multi-query attention (Shazeer, 2019a)). 第一个版本 Gemini 1.0 有三个主要尺寸, 以支持表 1 所述的广泛应用.

Gemini models are trained to accommodate textual input interleaved with a wide variety of audio and visual inputs, such as natural images, charts, screenshots, PDFs, and videos, and they can produce text and image outputs (see Figure 2). The visual encoding of Gemini models is inspired by our own foundational work on Flamingo (Alayrac et al., 2022), CoCa (Yu et al., 2022a), and PaLI (Chen et al., 2022), with the important distinction that the models are multimodal from the beginning and can natively output images using discrete image tokens (Ramesh et al., 2021; Yu et al., 2022b).

Gemini 模型经过训练, 能接受与各种音频和视觉输入交错的文本输入, 例如自然图像, 图表, 截图, PDF 和视频, 并能输出文本和图像 (见图 2). Gemini 模型的视觉编码受到我们自己的基础工作 Flamingo (Alayrac et al., 2022), CoCa (Yu et al., 2022a) 和 PaLI (Chen et al., 2022) 的启发, 重要的区别在于: 这些模型从一开始就是多模态的, 并能用离散图像 token (Ramesh et al., 2021; Yu et al., 2022b) 原生输出图像.

Video understanding is accomplished by encoding the video as a sequence of frames in the large context window. Video frames or images can be interleaved naturally with text or audio as part of the model input. The models can handle variable input resolution in order to spend more compute on tasks that require fine-grained understanding. In addition, Gemini models can directly ingest audio

视频理解的做法是把视频编码成一串帧, 放进大的上下文窗口. 视频帧或图像可以自然地与文本或音频交错, 作为模型输入的一部分. 模型能处理可变的输入分辨率, 从而在需要细粒度理解的任务上多花算力. 此外, Gemini 模型可以直接摄入音频

<!-- page 4 of 90 -->

Gemini: A Family of Highly Capable Multimodal Models

| Model size | Model description |
| --- | --- |
| Ultra | Our most capable model that delivers state-of-the-art performance across a wide range of highly complex tasks, including reasoning and multimodal tasks. It is efficiently serveable at scale on TPU accelerators due to the Gemini architecture. |
| Pro | A performance-optimized model in terms of cost as well as latency that delivers significant performance across a wide range of tasks. This model exhibits strong reasoning performance and broad multimodal capabilities. |
| Nano | Our most efficient model, designed to run on-device. We trained two versions of Nano, with 1.8B (Nano-1) and 3.25B (Nano-2) parameters, targeting low and high memory devices respectively. It is trained by distilling from larger Gemini models. It is 4-bit quantized for deployment and provides best-in-class performance. |

Table 1 | An overview of the Gemini 1.0 model family.

表 1 | Gemini 1.0 模型家族概览. Ultra: 能力最强的模型, 在包括推理和多模态在内的大量高度复杂任务上达到最佳水平; 得益于 Gemini 架构, 它能在 TPU 加速器上高效地大规模服务. Pro: 在成本和时延上做了性能优化的模型, 在大量任务上表现显著, 有较强的推理能力和广泛的多模态能力. Nano: 效率最高的模型, 为端侧运行设计. 我们训练了两个版本的 Nano, 参数量分别为 1.8B (Nano-1) 和 3.25B (Nano-2), 分别面向低内存和高内存设备. 它由更大的 Gemini 模型蒸馏而来, 部署时做 4-bit 量化, 性能在同类中最好.

![Image block](images/p04-figure-2-gemini-models-support-interleaved-sequences-of.png)

Figure 2 | Gemini models support interleaved sequences of text, image, audio, and video as inputs (illustrated by tokens of different colors in the input sequence). They can output responses with interleaved image and text.

图 2 | Gemini 模型支持文本, 图像, 音频和视频交错的输入序列 (输入序列中用不同颜色的 token 表示). 它们能输出图文交错的回答.

signals at 16kHz from Universal Speech Model (USM) (Zhang et al., 2023) features. This enables the model to capture nuances that are typically lost when the audio is naively mapped to a text input (for example, see audio understanding demo on the [website](https://deepmind.google/gemini)).

(接上页) 信号: 以 16kHz 采样, 取自 Universal Speech Model (USM) (Zhang et al., 2023) 的特征. 这让模型能捕捉到音频被简单转写成文本输入时通常会丢掉的细微差别 (例如网站上的音频理解演示).

Training the Gemini family of models required innovations in training algorithms, dataset, and infrastructure. For the Pro model, the inherent scalability of our infrastructure and learning algorithms enable us to complete pre-training in a matter of weeks, leveraging a fraction of the Ultra’s resources. The Nano series of models leverage additional advancements in distillation and training algorithms to produce the best-in-class small language models for a wide variety of tasks, such as summarization and reading comprehension, which power our next generation on-device experiences.

训练 Gemini 家族需要在训练算法, 数据集和基础设施上创新. 对 Pro 模型, 基础设施和学习算法本身的可扩展性让我们只用 Ultra 资源的一小部分, 在几周内完成预训练. Nano 系列借助蒸馏和训练算法上的进一步改进, 产出同类最佳的小语言模型, 胜任摘要, 阅读理解等多种任务, 支撑我们下一代端侧体验.

## 3. Training Infrastructure

**3. 训练基础设施**

We trained Gemini models using TPUv5e and TPUv4 (Jouppi et al., 2023), depending on their sizes and configuration. Training Gemini Ultra used a large fleet of TPUv4 accelerators owned by Google

我们根据模型的尺寸和配置, 使用 TPUv5e 和 TPUv4 (Jouppi et al., 2023) 训练 Gemini 模型. Gemini Ultra 的训练使用了 Google 拥有的一大批 TPUv4 加速器,

<!-- page 5 of 90 -->

Gemini: A Family of Highly Capable Multimodal Models

across multiple datacenters. This represents a significant increase in scale over our prior flagship model PaLM-2 which presented new infrastructure challenges. Scaling up the number of accelerators results in a proportionate decrease in the mean time between failure of hardware in the overall system. We minimized the rate of planned reschedules and preemptions, but genuine machine failures are commonplace across all hardware accelerators at such large scales.

(接上页) 分布在多个数据中心. 与上一代旗舰 PaLM-2 相比, 这是规模上的大幅增加, 也带来了新的基础设施挑战. 加速器数量增加, 整个系统的硬件平均故障间隔时间会成比例下降. 我们尽量减少计划内的重新调度和抢占, 但在如此大的规模上, 所有硬件加速器都会经常出现真正的机器故障.

TPUv4 accelerators are deployed in “SuperPods” of 4096 chips, each connected to a dedicated optical switch, which can dynamically reconfigure 4x4x4 chip cubes into arbitrary 3D torus topologies in around 10 seconds (Jouppi et al., 2023). For Gemini Ultra, we decided to retain a small number of cubes per superpod to allow for hot standbys and rolling maintenance.

TPUv4 加速器以 4096 块芯片为一个 「SuperPod」 部署, 每个 SuperPod 连到一台专用光交换机, 可以在约 10 秒内把 4x4x4 的芯片立方体动态重组成任意 3D torus 拓扑 (Jouppi et al., 2023). 对 Gemini Ultra, 我们决定每个 superpod 保留少量立方体, 用于热备和滚动维护.

TPU accelerators primarily communicate over the high speed inter-chip-interconnect, but at Gemini Ultra scale, we combine SuperPods in multiple datacenters using Google’s intra-cluster and inter-cluster network (Poutievski et al., 2022; Wetherall et al., 2023; yao Hong et al., 2018). Google’s network latencies and bandwidths are sufficient to support the commonly used synchronous training paradigm, exploiting model parallelism within superpods and data-parallelism across superpods.

TPU 加速器主要通过高速芯片间互联通信, 但在 Gemini Ultra 的规模上, 我们用 Google 的集群内和集群间网络 (Poutievski et al., 2022; Wetherall et al., 2023; yao Hong et al., 2018) 把多个数据中心的 SuperPod 连起来. Google 网络的时延和带宽足以支持常用的同步训练范式: superpod 内用模型并行, superpod 之间用数据并行.

The ‘single controller’ programming model of Jax (Bradbury et al., 2018) and Pathways (Barham et al., 2022) allows a single Python process to orchestrate the entire training run, dramatically simplifying the development workflow. The GSPMD partitioner (Xu et al., 2021) in the XLA compiler partitions the training step computation, and the MegaScale XLA compiler (XLA, 2019) pass statically schedules appropriate collectives so that they maximally overlap with the computation with very little variation in step time.

Jax (Bradbury et al., 2018) 和 Pathways (Barham et al., 2022) 的 「single controller」 编程模型让单个 Python 进程就能编排整个训练过程, 大大简化了开发流程. XLA 编译器中的 GSPMD 分区器 (Xu et al., 2021) 对训练步的计算做切分, MegaScale XLA 编译器 (XLA, 2019) 的一个 pass 静态调度合适的集合通信, 让它们与计算最大程度重叠, 步时间几乎没有波动.

Maintaining a high goodput<sup>2</sup> at this scale would have been impossible using the conventional approach of periodic checkpointing of weights to persistent cluster storage. For Gemini models, we instead made use of redundant in-memory copies of the model state, and on any unplanned hardware failures, we rapidly recover directly from an intact model replica. Compared to both PaLM and PaLM-2 (Anil et al., 2023), this provided a substantial speedup in recovery time, despite the significantly larger training resources being used. As a result, the overall goodput for the largest-scale training job increased from 85% to 97%.

在这个规模上, 若沿用把权重定期 checkpoint 到持久化集群存储的常规做法, 不可能保持高 goodput<sup>2</sup>. 对 Gemini 模型, 我们改用模型状态在内存中的冗余副本, 一旦出现计划外的硬件故障, 就直接从完好的模型副本快速恢复. 与 PaLM 和 PaLM-2 (Anil et al., 2023) 相比, 尽管训练资源大得多, 恢复时间仍大幅缩短. 结果是最大规模训练任务的整体 goodput 从 85% 提高到 97%.

> **问:** goodput 从 85% 到 97%, 墙钟时间能省多少?
> 按脚注 2 的定义, goodput 是有效新步时间占总耗时的比例. 有效计算量不变时, 总耗时之比是 0.85/0.97 ≈ 0.88, 约省 12%. Ultra 的训练总时长和算力都没公开, 附录 10.1 模型卡的 Compute Requirements 一栏写的是 「Not reported」, 所以换不成绝对天数.

Training at unprecedented scale invariably surfaces new and interesting systems failure modes and in this instance one of the problems that we needed to address was that of “Silent Data Corruption (SDC)” (Dixit et al., 2021; Hochschild et al., 2021; Vishwanathan et al., 2015). Although these are extremely rare, the scale of Gemini models means that we can expect SDC events to impact training every week or two. Rapidly detecting and removing faulty hardware required several new techniques that exploit deterministic replay to isolate incorrect computations, combined with proactive SDC scanners on idle machines and hot standbys. Our fully deterministic infrastructure allowed us to quickly identify root causes (including hardware failures) during the development leading up to the Ultra model, and this was a crucial ingredient towards stable training.

在前所未有的规模上训练, 总会暴露新的, 有意思的系统故障模式. 这次我们要处理的问题之一是 「静默数据损坏 (Silent Data Corruption, SDC)」 (Dixit et al., 2021; Hochschild et al., 2021; Vishwanathan et al., 2015). 这类事件极少见, 但以 Gemini 模型的规模, 预计每一两周就会有 SDC 影响训练. 为快速发现并移除故障硬件, 我们用了几种新技术: 利用确定性重放隔离出错的计算, 再配合在空闲机器和热备机上运行的主动 SDC 扫描器. 完全确定性的基础设施让我们在开发 Ultra 模型的过程中能快速找出根因 (包括硬件故障), 这是训练稳定的关键因素.

## 4. Pre-Training Dataset

**4. 预训练数据集**

Gemini models are trained on a dataset that is both multimodal and multilingual. Our pre-training dataset uses data from web documents, books, and code, and includes image, audio, and video data.

Gemini 模型在一个既多模态又多语言的数据集上训练. 预训练数据来自网页文档, 书籍和代码, 并包含图像, 音频和视频数据.

We use the SentencePiece tokenizer (Kudo and Richardson, 2018) and find that training the tokenizer on a large sample of the entire training corpus improves the inferred vocabulary and subsequently improves model performance. For example, we find Gemini models can efficiently

我们使用 SentencePiece tokenizer (Kudo and Richardson, 2018), 并发现在整个训练语料的大样本上训练 tokenizer 能改进推断出的词表, 进而提升模型性能. 例如, 我们发现 Gemini 模型可以高效地

<small><span class="docvortex-page-footnote" data-block-type="page_footnote" style="color:#6b7280"><sup>2</sup>We define goodput as the time spent computing useful new steps over the elapsed time of the training job.</span></small>

脚注 2: 我们把 goodput 定义为计算有用新步所花的时间占训练任务总耗时的比例.

<!-- page 6 of 90 -->

Gemini: A Family of Highly Capable Multimodal Models

tokenize non-Latin scripts which can, in turn, benefit model quality as well as training and inference speed.

(接上页) 对非拉丁文字做 tokenize, 这反过来有利于模型质量以及训练和推理速度.

The number of tokens used to train the largest models were determined following the approach in Hoffmann et al. (2022). The smaller models are trained for significantly more tokens to improve performance for a given inference budget, similar to the approach advocated in Touvron et al. (2023a).

最大模型的训练 token 数按 Hoffmann et al. (2022) 的方法确定. 较小的模型用明显更多的 token 训练, 以在给定推理预算下提升性能, 这与 Touvron et al. (2023a) 提倡的做法类似.

We apply quality filters to all datasets, using both heuristic rules and model-based classifiers. We also perform safety filtering to remove harmful content based on our policies. To maintain the integrity of evaluations, we search for and remove any evaluation data that may have been in our training corpus before using data for training. The final data mixtures and weights were determined through ablations on smaller models. We stage training to alter the mixture composition during training – increasing the weight of domain-relevant data towards the end of training. We find that data quality is an important factor for highly-performing models, and believe that many interesting questions remain around finding the optimal dataset distribution for pre-training.

我们对所有数据集都做质量过滤, 同时使用启发式规则和基于模型的分类器. 我们还按我们的政策做安全过滤, 去除有害内容. 为保持评测的完整性, 在用数据训练之前, 我们会搜索并移除训练语料中可能出现过的评测数据. 最终的数据配比和权重通过在小模型上做消融确定. 我们分阶段训练, 在训练过程中改变混合比例, 在训练末期提高领域相关数据的权重. 我们发现数据质量是高性能模型的重要因素, 并认为关于如何找到预训练的最优数据分布, 仍有许多有意思的问题待解.

## 5. Evaluation

**5. 评测**

The Gemini models are natively multimodal, as they are trained jointly across text, image, audio, and video. One open question is whether this joint training can result in a model which has strong capabilities in each domain – even when compared to models and approaches that are narrowly tailored to single domains. We find this to be the case: Gemini models set a new state of the art across a wide range of text, image, audio, and video benchmarks. ww

Gemini 模型是原生多模态的, 因为它们在文本, 图像, 音频和视频上联合训练. 一个悬而未决的问题是: 这种联合训练能否得到在每个领域都很强的模型, 即使与专门针对单一领域的模型和方法相比也不逊色. 我们发现答案是肯定的: Gemini 模型在大量文本, 图像, 音频和视频基准上创下新的最佳成绩.

## 5.1. Text

**5.1. 文本**

## 5.1.1. Academic Benchmarks

**5.1.1. 学术基准**

We compare pre- and post-trained Gemini Pro and Ultra models to a suite of external LLMs and our previous best model PaLM 2 across a series of text-based academic benchmarks covering reasoning, reading comprehension, STEM, and coding. We report these results in Table 2. Broadly, we find that the performance of Gemini Pro outperforms inference-optimized models such as GPT-3.5 and performs comparably with several of the most capable models available, and Gemini Ultra outperforms all current models. In this section, we examine some of these findings.

我们在一系列文本学术基准上, 把预训练和后训练的 Gemini Pro 与 Ultra 同一组外部 LLM 以及我们之前最好的模型 PaLM 2 做比较, 覆盖推理, 阅读理解, STEM 和编程. 结果见表 2. 总体上, Gemini Pro 优于 GPT-3.5 等推理优化型模型, 与几款最强的现有模型表现相当, Gemini Ultra 则超过所有现有模型. 本节讨论其中一些发现.

On MMLU (Hendrycks et al., 2021a), Gemini Ultra can outperform all existing models, achieving an accuracy of 90.04%. MMLU is a holistic exam benchmark, which measures knowledge across a set of 57 subjects. Human expert performance is gauged at 89.8% by the benchmark authors, and Gemini Ultra is the first model to exceed this threshold, with the prior state-of-the-art result at 86.4%. Achieving high performance requires specialist knowledge across many domains (e.g. law, biology, history, etc.), alongside reading comprehension and reasoning. We find Gemini Ultra achieves highest accuracy when used in combination with a chain-of-thought prompting approach (Wei et al., 2022b) that accounts for model uncertainty. The model produces a chain of thought with k samples, for example 8 or 32. If there is a consensus above a preset threshold (selected based on the validation split), it selects this answer, otherwise it reverts to a greedy sample based on maximum likelihood choice without chain of thought. We refer the reader to appendix for a detailed breakdown of how this approach compares with only chain-of-thought prompting or only greedy sampling.

在 MMLU (Hendrycks et al., 2021a) 上, Gemini Ultra 超过所有现有模型, 准确率 90.04%. MMLU 是综合性考试基准, 衡量 57 个学科的知识. benchmark 作者估计的人类专家水平是 89.8%, Gemini Ultra 是第一个超过这一门槛的模型, 此前的最佳成绩是 86.4%. 要拿高分, 需要许多领域 (如法律, 生物, 历史等) 的专业知识, 以及阅读理解和推理能力. 我们发现, 与一种考虑模型不确定性的 chain-of-thought 提示方法 (Wei et al., 2022b) 结合时, Gemini Ultra 的准确率最高. 模型生成 k 条 chain of thought 样本, 例如 8 条或 32 条. 如果一致性超过预设阈值 (阈值根据验证集选定), 就选这个答案; 否则退回基于最大似然, 不带 chain of thought 的 greedy 样本. 这种方法与只用 chain-of-thought 提示或只用 greedy 采样相比的详细拆解见附录.

> **确认:** 「human-expert performance」 对的是哪个数, Ultra 在哪种设定下越过它?
> 门槛是 benchmark 作者估计的 89.8%. Ultra 越过它靠的是 表 2 第一行的 90.04% CoT@32 (不确定性路由); 同一格下方的 5-shot 只有 83.7%, 低于 89.8%. 此前最佳 86.4% 是 GPT-4 的 5-shot 报告值, 而 GPT-4 在 CoT@32 下是 87.29%. 第 8 节把 90.04% 写成 90.0%.

In mathematics, a field commonly used to benchmark the analytical capabilities of models, Gemini Ultra shows strong performance on both elementary exams and competition-grade problem sets. For the grade-school math benchmark, GSM8K (Cobbe et al., 2021), we find Gemini Ultra reaches 94.4%

数学常被用来衡量模型的分析能力. Gemini Ultra 在小学考试和竞赛级题集上都表现强劲. 在小学数学基准 GSM8K (Cobbe et al., 2021) 上, Gemini Ultra 达到 94.4%

<!-- page 7 of 90 -->

Gemini: A Family of Highly Capable Multimodal Models

accuracy with chain-of-thought prompting and self-consistency (Wang et al., 2022) compared to the previous best accuracy of 92% with the same prompting technique. Similar positive trends are observed in increased difficulty math problems drawn from middle- and high-school math competitions (MATH benchmark), with the Gemini Ultra model outperforming all competitor models, reaching 53.2% using 4-shot prompting. The model also outperforms the state of the art on even harder tasks derived from American Mathematical Competitions (150 questions from 2022 and 2023). Smaller models perform poorly on this challenging task scoring close to random, but Gemini Ultra can solve 32% of the questions, compared to the 30% solve rate for GPT-4.

(接上页) 的准确率, 使用 chain-of-thought 提示和 self-consistency (Wang et al., 2022); 此前用同样提示技术的最好成绩是 92%. 在更难的, 取自初高中数学竞赛的题目 (MATH 基准) 上也有类似趋势: Gemini Ultra 用 4-shot 提示达到 53.2%, 超过所有对比模型. 在更难的, 取自美国数学竞赛的任务 (2022 和 2023 年的 150 道题) 上, 模型同样超过最佳水平. 较小的模型在这项有挑战的任务上表现很差, 得分接近随机, 而 Gemini Ultra 能解出 32% 的题目, GPT-4 的解题率是 30%.

> **拆开:** AMC 上 32% 对 30%, 折成题数差多少?
> 题目共 150 道. 32% 是 48 道, 30% 是 45 道, 只差 3 道. 文中没有给置信区间或采样次数, 这 2 个百分点的差距不足以单独支撑 「超过最佳水平」 的说法. 这组数不在 表 2 里, 只出现在正文.

Gemini Ultra also excels in coding, a popular use case of current LLMs. We evaluate the model on many conventional and internal benchmarks and also measure its performance as part of more complex reasoning systems such as AlphaCode 2 (see Section 5.1.7 on complex reasoning systems). For example, on HumanEval, a standard code-completion benchmark (Chen et al., 2021) mapping function descriptions to Python implementations, instruction-tuned Gemini Ultra correctly implements 74.4% of problems. On a new held-out evaluation benchmark for python code generation tasks, Natural2Code, where we ensure no web leakage, Gemini Ultra achieves the highest score of 74.9%.

Gemini Ultra 在编程上也很出色, 这是当前 LLM 的热门用例. 我们在许多常规和内部基准上评测模型, 也衡量它作为 AlphaCode 2 这类更复杂推理系统一部分时的表现 (见 5.1.7 节关于复杂推理系统的内容). 例如在标准代码补全基准 HumanEval (Chen et al., 2021) 上, 题目是把函数描述映射成 Python 实现, 经过指令微调的 Gemini Ultra 正确实现了 74.4% 的题目. 在一个新的留出评测基准 Natural2Code 上, 这是一个我们确保没有网络泄漏的 Python 代码生成任务集, Gemini Ultra 取得最高分 74.9%.

Evaluation on these benchmarks is challenging and may be affected by data contamination. We performed an extensive leaked data analysis after training to ensure the results we report here are as scientifically sound as possible, but still found some minor issues and decided not to report results on e.g. LAMBADA (Paperno et al., 2016). As part of the evaluation process, on a popular benchmark, HellaSwag (Zellers et al., 2019), we find that an additional hundred fine-tuning steps on specific website extracts corresponding to the HellaSwag training set (which were not included in the Gemini model pretraining set) improve the validation accuracy of Gemini Pro to 89.6% and Gemini Ultra to 96.0%, when measured with 1-shot prompting (we measured GPT-4 obtained 92.3% when evaluated 1-shot via the API). This suggests that the benchmark results are susceptible to the pretraining dataset composition. We choose to report HellaSwag decontaminated results only in a 10-shot evaluation setting. We believe there is a need for more robust and nuanced standardized evaluation benchmarks with no leaked data. So, we evaluate Gemini models on several new held-out evaluation datasets that were recently released, such as WMT23 and Math-AMC 2022-2023 problems, or internally generated from non-web sources, such as Natural2Code. We refer the reader to Appendix 10.3 for a comprehensive list of our evaluation benchmarks.

在这些基准上评测很有挑战, 结果可能受数据污染影响. 训练后我们做了大量泄漏数据分析, 以确保报告的结果尽可能科学可靠, 但仍发现一些小问题, 因此决定不报告例如 LAMBADA (Paperno et al., 2016) 上的结果. 在评测过程中, 对于常用基准 HellaSwag (Zellers et al., 2019), 我们发现只要在与 HellaSwag 训练集对应的特定网站摘录 (这些数据不在 Gemini 预训练集中) 上额外微调一百步, 用 1-shot 提示测量时, Gemini Pro 的验证准确率就升到 89.6%, Gemini Ultra 升到 96.0% (我们通过 API 以 1-shot 测得 GPT-4 为 92.3%). 这说明 benchmark 结果容易受预训练数据构成的影响. 我们选择只报告 10-shot 设定下去污染的 HellaSwag 结果. 我们认为需要更稳健, 更细致, 没有数据泄漏的标准化评测基准. 因此我们在几个新近发布的留出评测集上评测 Gemini 模型, 例如 WMT23 和 Math-AMC 2022-2023 题目, 或来自非网络来源的内部生成数据, 例如 Natural2Code. 评测基准的完整列表见附录 10.3.

> **再看:** HellaSwag 这一百步微调, 对 表 2 里 Ultra 输给 GPT-4 的那一行意味着什么?
> 只加一百步微调, Ultra 的 1-shot 就到了 96.0%, 高于 GPT-4 的 1-shot 92.3%. 表 2 最终报的是去污染后的 10-shot: Ultra 87.8%, GPT-4 95.3% (reported). GPT-4 那一格是对方自报的数, 去没去污染无从核对. 这 7.5 个点的差, 至少有一部分可能来自训练数据构成, 不宜全读成能力差.

Even so, model performance on these benchmarks gives us an indication of the model capabilities and where they may provide impact on real-world tasks. For example, Gemini Ultra’s impressive reasoning and STEM competencies pave the way for advancements in LLMs within the educational domain<sup>3</sup>. The ability to tackle complex mathematical and scientific concepts opens up exciting possibilities for personalized learning and intelligent tutoring systems.

即便如此, 模型在这些基准上的表现仍能说明模型的能力, 以及它们可能在哪些真实任务上产生影响. 例如, Gemini Ultra 出色的推理和 STEM 能力为 LLM 在教育领域的进展铺路<sup>3</sup>. 处理复杂数学和科学概念的能力为个性化学习和智能辅导系统带来令人兴奋的可能.

## 5.1.2. Trends in Capabilities

**5.1.2. 能力趋势**

We investigate the trends in capabilities across the Gemini model family by evaluating them on a holistic harness of more than 50 benchmarks in six different capabilities, noting that some of the most notable benchmarks were discussed in the last section. These capabilities are: “Factuality” covering open/closed-book retrieval and question answering tasks; “Long-Context” covering longform summarization, retrieval and question answering tasks; “Math/Science” including tasks for mathematical problem solving, theorem proving, and scientific exams; “Reasoning” tasks that require arithmetic, scientific, and commonsense reasoning; “Multilingual” tasks for translation, summarization, and reasoning in multiple languages. Several of these capabilities are targeted by post-training (Section 6). Please see Appendix 10.3 for a detailed list of tasks included for each capability.

我们在一套超过 50 个基准, 覆盖六种能力的综合评测上评估 Gemini 家族, 考察能力随尺寸的趋势; 其中一些最重要的基准已在上一节讨论. 这些能力是: 「Factuality」, 包括开卷/闭卷检索和问答任务; 「Long-Context」, 包括长文摘要, 检索和问答任务; 「Math/Science」, 包括数学解题, 定理证明和科学考试任务; 「Reasoning」, 需要算术, 科学和常识推理的任务; 「Multilingual」, 多种语言的翻译, 摘要和推理任务. 其中几项能力是后训练的目标 (第 6 节). 每种能力包含的任务详见附录 10.3.

<small><span class="docvortex-page-footnote" data-block-type="page_footnote" style="color:#6b7280"><sup>3</sup>See demos on website [https://deepmind.google/gemini](https://deepmind.google/gemini).</span></small>

脚注 3: 演示见网站 https://deepmind.google/gemini.

<!-- page 8 of 90 -->

Gemini: A Family of Highly Capable Multimodal Models

<table><tr><td></td><td>Gemini Ultra</td><td>Gemini Pro</td><td>GPT-4</td><td>GPT-3.5</td><td>PaLM 2-L</td><td>Claude 2</td><td>Inflection-2</td><td>Grok 1</td><td>LLAMA-2</td></tr><tr><td rowspan="2">MMLU Multiple-choice questions in 57 subjects (professional &amp; academic) (Hendrycks et al., 2021a)</td><td>90.04% CoT@32*</td><td>79.13% CoT@8*</td><td>87.29% CoT@32 (via API**)</td><td>70% 5-shot</td><td>78.4% 5-shot</td><td>78.5% 5-shot CoT</td><td>79.6% 5-shot</td><td>73.0% 5-shot</td><td>68.0%***</td></tr><tr><td>83.7% 5-shot</td><td>71.8% 5-shot</td><td>86.4% 5-shot (reported)</td><td></td><td></td><td></td><td></td><td></td><td></td></tr><tr><td>GSM8K Grade-school math (Cobbe et al., 2021)</td><td>94.4% Maj1@32</td><td>86.5% Maj1@32</td><td>92.0% SFT &amp; 5-shot CoT</td><td>57.1% 5-shot</td><td>80.0% 5-shot</td><td>88.0% 0-shot</td><td>81.4% 8-shot</td><td>62.9% 8-shot</td><td>56.8% 5-shot</td></tr><tr><td rowspan="2">MATH Math problems across 5 difficulty levels &amp; 7 subdisciplines (Hendrycks et al., 2021b)</td><td>53.2% 4-shot</td><td>32.6% 4-shot</td><td>52.9% 4-shot (via API**)</td><td>34.1% 4-shot (via API**)</td><td>34.4% 4-shot</td><td>—</td><td>34.8%</td><td>23.9% 4-shot</td><td>13.5% 4-shot</td></tr><tr><td></td><td></td><td>50.3% (Zheng et al., 2023)</td><td></td><td></td><td></td><td></td><td></td><td></td></tr><tr><td>BIG-Bench-Hard Subset of hard BIG-bench tasks written as CoT problems (Srivastava et al., 2022)</td><td>83.6% 3-shot</td><td>75.0% 3-shot</td><td>83.1% 3-shot (via API**)</td><td>66.6% 3-shot (via API**)</td><td>77.7% 3-shot</td><td>—</td><td>—</td><td>—</td><td>51.2% 3-shot</td></tr><tr><td>HumanEval Python coding tasks (Chen et al., 2021)</td><td>74.4% 0-shot (PT****)</td><td>67.7% 0-shot (PT****)</td><td>67.0% 0-shot (reported)</td><td>48.1% 0-shot</td><td>—</td><td>70.0% 0-shot</td><td>44.5% 0-shot</td><td>63.2% 0-shot</td><td>29.9% 0-shot</td></tr><tr><td>Natural2Code Python code generation. (New held-out set with no leakage on web)</td><td>74.9% 0-shot</td><td>69.6% 0-shot</td><td>73.9% 0-shot (via API**)</td><td>62.3% 0-shot (via API**)</td><td>—</td><td>—</td><td>—</td><td>—</td><td>—</td></tr><tr><td>DROP Reading comprehension &amp; arithmetic. (metric: F1-score) (Dua et al., 2019)</td><td>82.4 Variable shots</td><td>74.1 Variable shots</td><td>80.9 3-shot (reported)</td><td>64.1 3-shot</td><td>82.0 Variable shots</td><td>—</td><td>—</td><td>—</td><td>—</td></tr><tr><td>HellaSwag (validation set) Common-sense multiple choice questions (Zellers et al., 2019)</td><td>87.8% 10-shot</td><td>84.7% 10-shot</td><td>95.3% 10-shot (reported)</td><td>85.5% 10-shot</td><td>86.8% 10-shot</td><td>—</td><td>89.0% 10-shot</td><td>—</td><td>80.0%***</td></tr><tr><td>WMT23 Machine translation (metric: BLEURT) (Tom et al., 2023)</td><td>74.4 1-shot (PT****)</td><td>71.7 1-shot</td><td>73.8 1-shot (via API**)</td><td>—</td><td>72.7 1-shot</td><td>—</td><td>—</td><td>—</td><td>—</td></tr></table>

Table 2 | Gemini performance on text benchmarks with external comparisons and PaLM 2-L. ∗ The model produces a chain of thought with k = 8 or 32 samples, if there is a consensus above a threshold (chosen based on the validation split), it selects this answer, otherwise it reverts to a greedy sample. Further analysis in Appendix 10.2. ∗∗ Results self-collected via the API in Nov, 2023.

表 2 | Gemini 在文本基准上的表现, 与外部模型和 PaLM 2-L 对比. ∗ 模型生成 k = 8 或 32 条 chain of thought 样本, 若一致性超过阈值 (根据验证集选定), 就选这个答案, 否则退回 greedy 样本. 进一步分析见附录 10.2. ∗∗ 2023 年 11 月通过 API 自行收集的结果.

> **看表:** 表 2 同一行里各列用的是同一种设定吗?
> 大多不是. MMLU 一行 Ultra 是 CoT@32, GPT-3.5 是 5-shot, LLAMA-2 连设定都没标; GSM8K 一行 Ultra 是 Maj1@32, GPT-4 是 「SFT & 5-shot CoT」; HumanEval 和 WMT23 的 Ultra 标 PT, 是后训练 API 模型, 其余多为预训练模型; DROP 是 「Variable shots」. 标 「via API」 的 GPT-4 分数是 Google 在 2023 年 11 月自测的. 读每一格都要连同格里的小字一起读.

∗∗∗ Results shown use the decontaminated numbers from Touvron et al. (2023b) report as the most relevant comparison to Gemini models which have been decontaminated as well.)

∗∗∗ 所示结果采用 Touvron et al. (2023b) 报告中的去污染数字, 因为 Gemini 模型也做了去污染, 这是最相关的比较.

PT denotes a post-trained Gemini API model.

PT 表示后训练的 Gemini API 模型.

We observe consistent quality gains with increased model size in Figure 3, especially in reasoning, math/science, summarization and long-context. Gemini Ultra is the best model across the board for all six capabilities. Gemini Pro, the second-largest model in the Gemini family of models, is also quite competitive while being a lot more efficient to serve.

图 3 显示, 随着模型尺寸增加, 质量稳定提升, 在推理, 数学/科学, 摘要和长上下文上尤其明显. Gemini Ultra 在全部六种能力上都是最好的模型. Gemini 家族第二大的模型 Gemini Pro 也相当有竞争力, 同时服务成本低得多.

## 5.1.3. Nano

**5.1.3. Nano**

Bringing AI closer to the user, we discuss the Gemini Nano 1 and Nano 2 models engineered for on-device deployments. These models excel in summarization and reading comprehension tasks with per-task fine-tuning. Figure 3 shows the performance of these pre-trained models in comparison to the much larger Gemini Pro model, while Table 3 dives deeper into specific factuality, coding, Math/Science, and reasoning tasks. Nano-1 and Nano-2 model sizes are only 1.8B and 3.25B parameters respectively. Despite their size, they show exceptionally strong performance on factuality, i.e. retrieval-related tasks, and significant performance on reasoning, STEM, coding, multimodal and

为了让 AI 离用户更近, 我们讨论为端侧部署打造的 Gemini Nano 1 和 Nano 2. 这些模型经过逐任务微调后, 在摘要和阅读理解任务上表现出色. 图 3 给出这些预训练模型与大得多的 Gemini Pro 的对比, 表 3 则深入到具体的事实性, 编程, 数学/科学和推理任务. Nano-1 和 Nano-2 的参数量只有 1.8B 和 3.25B. 尽管尺寸小, 它们在事实性 (即检索相关任务) 上表现格外强, 在推理, STEM, 编程, 多模态和

<!-- page 9 of 90 -->

Gemini: A Family of Highly Capable Multimodal Models

![Chart block](images/p09-figure-3-language-understanding-and-generation.png)

Figure 3 | Language understanding and generation performance of Gemini model family across different capabilities (normalized by the Gemini Pro model).

图 3 | Gemini 模型家族在不同能力上的语言理解与生成表现 (以 Gemini Pro 模型归一化).

> **问:** Ultra, Pro, Nano 三档是不是用同一套评测比的?
> 不是一套. 表 2 只有 Ultra 和 Pro; Nano 只出现在 表 3, 且是预训练模型, 用 Pro 作分母; 表 7 四个模型都有 (后训练 API 模型, pixel only); 表 10 只有 Ultra 和 Pro; 表 11 只有 Pro 和 Nano-1, 没有 Ultra. 能三档一起横看的只有 图 3 (以 Pro 归一化, 没给原始分), 表 4 和 表 7.

multilingual tasks. With new capabilities accessible to a broader set of platforms and devices, the Gemini models expand accessibility to everyone.

(接上页) 多语言任务上也有可观表现. 新能力可以在更多平台和设备上使用, Gemini 模型让每个人都更容易用上 AI.

|  | Gemi accuracy | ni Nano 1 normalize by Pro | Gemi d accuracy | ni Nano 2 normalized by Pro |
| --- | --- | --- | --- | --- |
| BoolQ | 71.6 | 0.81 | 79.3 | 0.90 |
| TydiQA (GoldP) | 68.9 | 0.85 | 74.2 | 0.91 |
| NaturalQuestions (Retrieved) | 38.6 | 0.69 | 46.5 | 0.83 |
| NaturalQuestions (Closed-book) | 18.8 | 0.43 | 24.8 | 0.56 |
| BIG-Bench-Hard (3-shot) | 34.8 | 0.47 | 42.4 | 0.58 |
| MBPP | 20.0 | 0.33 | 27.2 | 0.45 |
| MATH (4-shot) | 13.5 | 0.41 | 22.8 | 0.70 |
| MMLU (5-shot) | 45.9 | 0.64 | 55.8 | 0.78 |

Table 3 | Performance of Gemini Nano series on factuality, summarization, reasoning, coding and STEM tasks compared to significantly larger Gemini Pro model.

表 3 | Gemini Nano 系列在事实性, 摘要, 推理, 编程和 STEM 任务上的表现, 与大得多的 Gemini Pro 对比.

> **核对:** 「normalized by Pro」 的分母是哪个 Pro 的哪个分数?
> 用 表 3 反推: MATH 13.5/0.41 ≈ 32.9, 22.8/0.70 ≈ 32.6, 表 2 中 Pro 的 MATH 4-shot 是 32.6%; MMLU 45.9/0.64 ≈ 71.7, 55.8/0.78 ≈ 71.5, 表 2 中 Pro 5-shot 是 71.8%; BIG-Bench-Hard 34.8/0.47 ≈ 74.0, 42.4/0.58 ≈ 73.1, 表 2 中 Pro 是 75.0%. 分母对得上 表 2 里 Pro 的同设定分数, 比值只留两位小数, 所以反推有约 1 个点的误差.

## 5.1.4. Multilinguality

**5.1.4. 多语言能力**

The multilingual capabilities of the Gemini models are evaluated using a diverse set of tasks requiring multilingual understanding, cross-lingual generalization, and the generation of text in multiple languages. These tasks include machine translation benchmarks (WMT 23 for high-medium-low resource translation; Flores, NTREX for low and very low resource languages), summarization benchmarks (XLSum, Wikilingua), and translated versions of common benchmarks (MGSM: professionally translated into 11 languages).

我们用一组多样的任务评测 Gemini 模型的多语言能力, 这些任务需要多语言理解, 跨语言泛化以及多语言文本生成. 其中包括机器翻译基准 (WMT 23 覆盖高, 中, 低资源翻译; Flores 和 NTREX 覆盖低资源和极低资源语言), 摘要基准 (XLSum, Wikilingua), 以及常见基准的翻译版 (MGSM: 专业翻译成 11 种语言).

## 5.1.4.1 Machine Translation

**5.1.4.1 机器翻译**

Translation is a canonical benchmark in machine learning with a rich history. We evaluated a post trained Gemini API Ultra model (see Section 6.5.3) on the entire set of language pairs in the WMT 23 translation benchmark in a few-shot setting. Overall, we found that Gemini Ultra (and other Gemini models) performed remarkably well at translating from English to any other language, and surpassed

翻译是机器学习中历史悠久的经典基准. 我们用少样本设定, 在 WMT 23 翻译基准的全部语言对上评测后训练的 Gemini API Ultra 模型 (见 6.5.3 节). 总体上, 我们发现 Gemini Ultra (以及其他 Gemini 模型) 从英语译到其他任何语言都表现很好, 并且

<!-- page 10 of 90 -->

Gemini: A Family of Highly Capable Multimodal Models

the LLM-based translation methods when translating out-of-English, on high-resource, mid-resource and low-resource languages. In the WMT 23 out-of-English translation tasks, Gemini Ultra achieved the highest LLM-based translation quality, with an average BLEURT (Sellam et al., 2020) score of 74.8, compared to GPT-4’s score of 73.6, and PaLM 2’s score of 72.2. When averaged across all language pairs and directions for WMT 23, we see a similar trend with Gemini Ultra 74.4, GPT-4 73.8 and PaLM 2-L 72.7 average BLEURT scores on this benchmark.

(接上页) 在出英方向上, 无论高资源, 中资源还是低资源语言, 都超过了基于 LLM 的翻译方法. 在 WMT 23 出英翻译任务上, Gemini Ultra 取得了基于 LLM 的翻译中最高的质量, 平均 BLEURT (Sellam et al., 2020) 为 74.8, GPT-4 为 73.6, PaLM 2 为 72.2. 对 WMT 23 的全部语言对和方向取平均, 趋势相似: Gemini Ultra 74.4, GPT-4 73.8, PaLM 2-L 72.7.

| WMT 23 (Avg BLEURT) | Gemini Ultra | Gemini Pro | Gemini Nano 2 | Gemini Nano 1 | GPT-4 | PaLM 2-L |
| --- | --- | --- | --- | --- | --- | --- |
| High Resource | 74.2 | 71.7 | 67.7 | 64.1 | 74.0 | 72.6 |
| Mid Resource | 74.7 | 71.8 | 67.0 | 64.8 | 73.6 | 72.7 |
| Out-of-English | 74.8 | 71.5 | 66.2 | 65.2 | 73.6 | 72.2 |
| Into-English | 73.9 | 72.0 | 69.0 | 63.5 | 74.1 | 73.4 |
| All languages | 74.4 | 71.7 | 67.4 | 64.8 | 73.8 | 72.7 |

Table 4 | Performance of Gemini models on WMT 23 translation benchmark. All numbers with 1-shot.

表 4 | Gemini 模型在 WMT 23 翻译基准上的表现. 所有数字均为 1-shot.

In addition to the languages and translation tasks above, we also evaluate Gemini Ultra on very low-resource languages. These languages were sampled from the tail of the following language sets: Flores-200 (Tamazight and Kanure), NTREX (North Ndebele), and an internal benchmark (Quechua). For these languages, both from and into English, Gemini Ultra achieved an average chrF score of 27.0 in 1-shot setup, while the next-best model, PaLM 2-L, achieved a score of 25.3.

除上述语言和翻译任务外, 我们还在极低资源语言上评测 Gemini Ultra. 这些语言取自以下语言集合的长尾: Flores-200 (Tamazight 和 Kanure), NTREX (North Ndebele), 以及一个内部基准 (Quechua). 在这些语言上, 无论译入还是译出英语, Gemini Ultra 在 1-shot 设定下平均 chrF 为 27.0, 次优模型 PaLM 2-L 为 25.3.

## 5.1.4.2 Multilingual Math and Summarization

**5.1.4.2 多语言数学与摘要**

Beyond translation, we evaluated how well Gemini models perform in challenging tasks across a range of languages. We specifically investigated the math benchmark MGSM (Shi et al., 2023), which is a translated variant of the math benchmark GSM8K (Cobbe et al., 2021). We find Gemini Ultra achieves an accuracy of 79.0%, an advance over PaLM 2-L which scores 74.7%, when averaged across all languages in an 8-shot setup. We also benchmark Gemini models on the multilingual summarization benchmarks – XLSum (Hasan et al., 2021) and WikiLingua (Ladhak et al., 2020). In XLSum, Gemini Ultra reached an average of 17.6 rougeL score compared to 15.4 for PaLM 2. For Wikilingua, Gemini Ultra (5-shot) trails behind PaLM 2 (3-shot) measured in BLEURT score. See Table 5 for the full results. Overall the diverse set of multilingual benchmarks show that Gemini family models have a broad language coverage, enabling them to also reach locales and regions with low-resource languages.

在翻译之外, 我们还评测 Gemini 模型在多种语言的有挑战任务上的表现. 我们专门考察了数学基准 MGSM (Shi et al., 2023), 它是数学基准 GSM8K (Cobbe et al., 2021) 的翻译版. 在 8-shot 设定下对所有语言取平均, Gemini Ultra 的准确率为 79.0%, 高于 PaLM 2-L 的 74.7%. 我们也在多语言摘要基准 XLSum (Hasan et al., 2021) 和 WikiLingua (Ladhak et al., 2020) 上评测 Gemini 模型. 在 XLSum 上, Gemini Ultra 平均 rougeL 为 17.6, PaLM 2 为 15.4. 在 Wikilingua 上, 按 BLEURT 计, Gemini Ultra (5-shot) 落后于 PaLM 2 (3-shot). 完整结果见表 5. 总的来说, 这组多样的多语言基准表明 Gemini 家族的语言覆盖面很广, 也能触达使用低资源语言的地区.

|  | Gemini Ultra | Gemini Pro | GPT-4 | PaLM 2-L |
| --- | --- | --- | --- | --- |
| MGSM (8-shot) | 79.0 | 63.5 | 74.5 | 74.7 |
| XLsum (3-shot) | 17.6 | 16.2 | - | 15.4 |
| Wikilingua | 48.9 | 47.8 | - | 50.4 |

Table 5 | Performance of Gemini models on multilingual math and summarization.

表 5 | Gemini 模型在多语言数学和摘要上的表现.

## 5.1.5. Long Context

**5.1.5. 长上下文**

Gemini models are trained with a sequence length of 32,768 tokens and we find that they make use of their context length effectively. We first verify this by running a synthetic retrieval test: we place key-value pairs at the beginning of the context, then add long filler text, and ask for value associated with a particular key. We find that the Ultra model retrieves the correct value with 98% accuracy when queried across the full context length. We further investigate this by plotting the negative log

Gemini 模型用 32,768 个 token 的序列长度训练, 我们发现它们能有效利用上下文长度. 我们先用一个合成检索测试验证这一点: 在上下文开头放若干 key-value 对, 再加入很长的填充文本, 然后询问某个 key 对应的 value. 我们发现, 在整个上下文长度上查询时, Ultra 模型取回正确 value 的准确率为 98%. 我们进一步在一组留出的长文档上画出负对数

<!-- page 11 of 90 -->

Gemini: A Family of Highly Capable Multimodal Models

likelihood (NLL) versus the token index across a held-out set of long documents in Figure 4. We find that the NLL decreases with sequence position up to the full 32K context length. The longer context length of Gemini models enable new use cases such as retrieval over documents and video understanding discussed in Section 5.2.2.

(接上页) 似然 (NLL) 随 token 位置的变化, 见图 4. 我们发现 NLL 随序列位置下降, 一直到完整的 32K 上下文长度. Gemini 模型更长的上下文带来了新用例, 例如 5.2.2 节讨论的文档检索和视频理解.

> **想:** 98% 的检索准确率能说明模型会用长上下文推理吗?
> 说明不了那么多. 这个测试把 key-value 对放在开头, 中间塞填充文本, 只考逐字取回; 图 4 的 NLL 随位置下降到 32K, 说明后面的 token 确实用到了前文. 两者都只证明窗口用得满. 长上下文的下游分数只在 图 3 的 「Long-Context」 一栏以 Pro 归一化的形式出现, 没有原始分.

![Chart block](images/p11-figure-4-negative-log-likelihood-as-a-function-of-token.png)

Figure 4 | Negative log likelihood as a function of token index across 32K context length on a held-out set of long documents.

图 4 | 在一组留出的长文档上, 负对数似然随 token 位置的变化, 覆盖 32K 上下文长度.

## 5.1.6. Factuality

**5.1.6. 事实性**

Factuality (Maynez et al., 2020) is a key focus of our model’s training and deployment. We evaluate three aspects of factuality for our Gemini API models:

事实性 (Maynez et al., 2020) 是我们模型训练和部署的重点. 我们为 Gemini API 模型评估事实性的三个方面:

1. **Closed-Book Factuality**: If provided with a fact-seeking prompt without any given source, Gemini API models should not hallucinate incorrect information (see Section 2 of Roberts et al. (2020) for a definition). These prompts can range from information-seeking prompts (e.g. “Who is the prime minister of India?”) to semi-creative prompts that may request factual information (e.g. “Write a 500-word speech in favor of the adoption of renewable energy”).

1. **闭卷事实性**: 给出一个寻求事实, 但没有任何来源的提示时, Gemini API 模型不应幻觉出错误信息 (定义见 Roberts et al. (2020) 第 2 节). 这类提示既可以是信息查询 (如 「印度总理是谁?」), 也可以是可能要求事实信息的半创作型提示 (如 「写一篇 500 字的演讲, 支持采用可再生能源」).

2. **Attribution**: If instructed to generate a response grounded to a given context, we aim to ensure that Gemini API models produce a response with the highest degree of faithfulness to the context (Maynez et al., 2020; Rashkin et al., 2023). This may include the summarization of a user-provided source, generating fine-grained citations given a question and provided snippets akin to Menick et al. (2022); Peng et al. (2023), answering questions from a long-form source such as a book (Mihaylov et al., 2018), and transforming a given source to a desired output (e.g. an email from a portion of a meeting transcript).

2. **归因**: 如果被要求基于给定上下文生成回答, 我们力求让 Gemini API 模型的回答对上下文保持最高程度的忠实 (Maynez et al., 2020; Rashkin et al., 2023). 这包括总结用户提供的来源, 像 Menick et al. (2022) 和 Peng et al. (2023) 那样根据问题和给定片段生成细粒度引用, 从书籍这类长篇来源中回答问题 (Mihaylov et al., 2018), 以及把给定来源转换成所需输出 (例如根据会议记录的一部分写一封邮件).

3. **Hedging**: If prompted with an input that is “unanswerable”, Gemini API models must acknowledge that it cannot provide a response by hedging to avoid hallucination. These include scenarios where the input prompt contains false-premise questions [see examples in Hu et al. (2023)], the input prompt instructs the model to perform open book QA, but the answer is not derivable from the given context, and so forth.

3. **保留回答 (Hedging)**: 如果输入 「无法回答」, Gemini API 模型必须承认自己不能给出回答, 以 hedging 避免幻觉. 这包括输入含有错误前提的问题 [例子见 Hu et al. (2023)], 以及输入要求模型做开卷问答但答案无法从给定上下文推出等情形.

Factuality is evaluated via human annotators who fact-check each response manually; we report the percentage of factually inaccurate responses as judged by annotators. Attribution is evaluated via human annotators who check for attribution to sources in the prompt for each response manually; the reported metric is AIS (Rashkin et al., 2023). For hedging, we use an automatic evaluation setup where we measure whether models hedge accurately.

事实性由人工标注员逐条人工核查每个回答来评估; 我们报告标注员判定为事实不准确的回答所占百分比. 归因由人工标注员逐条检查回答对提示中来源的归因来评估, 报告的指标是 AIS (Rashkin et al., 2023). 对 hedging, 我们用自动评测, 衡量模型是否准确地 hedge.

We compare Gemini API Pro with a version without any factuality-focused adaptation in Table 6. We see that the rate of inaccuracy is halved in the factuality set, the accuracy of attribution is increased

在表 6 中, 我们把 Gemini API Pro 与一个没有做任何事实性专项适配的版本比较. 我们看到, 在事实性集合上不准确率减半, 在归因集合上归因准确率提高

<!-- page 12 of 90 -->

Gemini: A Family of Highly Capable Multimodal Models

by 50% from the attribution set, and the model successfully hedges 70% (up from 0%) in the provided hedging set task.

(接上页) 50%, 在给定的 hedging 集合任务上, 模型成功 hedge 的比例达到 70% (原来为 0%).

|  | Factuality(Inaccurate Rate) | Attribution(AIS) | Hedging(Accuracy) |
| --- | --- | --- | --- |
| Gemini API ProNo factuality-focused adaptation | 6.7%[5.8%, 7.8%] | 40.2%[37.9%, 42.5%] | 0% |
| Gemini API ProFinal stage of post-training | 3.8%[3.1%, 4.8%] | 60.0%[57.6%, 62.1%] | 69.3% |

Table 6 | Factuality mitigations: Impact of post-training on the rate of inaccuracy, presence of attribution and the rate of accurate hedging on Gemini API Pro (with corresponding 95% confidence intervals).

表 6 | 事实性缓解: 后训练对 Gemini API Pro 的不准确率, 归因情况和准确 hedging 比例的影响 (附相应的 95% 置信区间).

> **对一下:** 正文的 「halved」, 「increased by 50%」, 「70%」 与 表 6 对得上吗?
> 不准确率 6.7% 到 3.8%, 降了约 43%, 不到一半; AIS 40.2% 到 60.0%, 相对涨约 49%, 绝对涨 19.8 个百分点; hedging 是 69.3%, 正文取整成 70%. 两个版本不准确率的 95% 区间 [5.8%, 7.8%] 与 [3.1%, 4.8%] 不重叠, 下降本身是可信的.

## 5.1.7. Complex Reasoning Systems

**5.1.7. 复杂推理系统**

Gemini models can also be combined with additional techniques such as search and tool-use to create powerful reasoning systems that can tackle more complex multi-step problems. One example of such a system is AlphaCode 2, a new state-of-the-art agent that excels at solving competitive programming problems (Leblond et al, 2023). AlphaCode 2 uses a specialized version of Gemini Pro – tuned on competitive programming data similar to the data used in Li et al. (2022) – to conduct a massive search over the space of possible programs. This is followed by a tailored filtering, clustering and reranking mechanism. Gemini Pro is fine-tuned both to be a coding model to generate proposal solution candidates, and to be a reward model that is leveraged to recognize and extract the most promising code candidates.

Gemini 模型还可以与搜索, 工具使用等额外技术结合, 构成强大的推理系统, 处理更复杂的多步问题. AlphaCode 2 就是这样一个系统, 这是一个新的最佳 agent, 擅长解决竞赛编程题 (Leblond et al, 2023). AlphaCode 2 使用一个专门版本的 Gemini Pro, 在与 Li et al. (2022) 所用数据相似的竞赛编程数据上调优, 在可能程序的空间里做大规模搜索. 之后是定制的过滤, 聚类和重排序机制. Gemini Pro 既被微调成生成候选解的编程模型, 也被微调成奖励模型, 用来识别并挑出最有希望的代码候选.

AlphaCode 2 is evaluated on Codeforces,<sup>4</sup>the same platform as AlphaCode, on 12 contests from division 1 and 2, for a total of 77 problems. AlphaCode 2 solved 43% of these competition problems, a 1.7x improvement over the prior record-setting AlphaCode system which solved 25%. Mapping this to competition rankings, AlphaCode 2 built on top of Gemini Pro sits at an estimated 85th percentile on average – i.e. it performs better than 85% of entrants. This is a significant advance over AlphaCode, which only outperformed 50% of competitors.

AlphaCode 2 在与 AlphaCode 相同的平台 Codeforces<sup>4</sup> 上评测, 取 division 1 和 2 的 12 场比赛, 共 77 道题. AlphaCode 2 解出了其中 43% 的竞赛题, 比此前创纪录的 AlphaCode 系统 (解出 25%) 提高 1.7x. 换算成竞赛排名, 基于 Gemini Pro 的 AlphaCode 2 平均估计位于第 85 百分位, 也就是比 85% 的参赛者表现好. 这比只胜过 50% 参赛者的 AlphaCode 有显著进步.

> **拆开:** 43%, 1.7x, 85th percentile 分别是什么口径?
> 43% 是 12 场比赛共 77 道题的解题比例, 约 33 道; 1.7x 是 43/25 ≈ 1.72; 85th percentile 是把成绩换算成排名后的平均估计, 与引言 「top 15%」 是同一件事. 驱动它的是专门调过的 Gemini Pro, 不是 Ultra, 而且整套系统靠大规模采样加过滤, 聚类, 重排序, 这个成绩不能记到单个模型头上.

The composition of powerful pre-trained models with search and reasoning mechanisms is an exciting direction towards more general agents; another key ingredient is deep understanding across a range of modalities which we discuss in the next section.

把强大的预训练模型与搜索和推理机制组合, 是通向更通用 agent 的一个令人兴奋的方向; 另一个关键要素是对多种模态的深入理解, 下一节讨论.

<small><span class="docvortex-page-footnote" data-block-type="page_footnote" style="color:#6b7280"><sup>4</sup>[http://codeforces.com/](http://codeforces.com/)</span></small>

脚注 4: Codeforces 网址 http://codeforces.com/

<!-- page 13 of 90 -->

Gemini: A Family of Highly Capable Multimodal Models

## 5.2. Multimodal

**5.2. 多模态**

Gemini models are natively multimodal. These models exhibit the unique ability to seamlessly combine their capabilities across modalities (e.g. extracting information and spatial layout out of a table, a chart, or a figure) with the strong reasoning capabilities of a language model (e.g. its state-of-art-performance in math and coding) as seen in examples in Figures 5 and 14. The models also show strong performance in discerning fine-grained details in inputs, aggregating context across space and time, and applying these capabilities over a temporally-related sequence of video frames and/or audio inputs.

Gemini 模型是原生多模态的. 它们能把跨模态的能力 (例如从表格, 图表或插图中提取信息和空间布局) 与语言模型的强推理能力 (例如在数学和编程上的最佳表现) 无缝结合, 例子见图 5 和图 14. 这些模型在辨别输入中的细粒度细节, 跨空间和时间聚合上下文, 以及把这些能力用于时间上相关的视频帧序列和/或音频输入方面, 也表现出色.

The sections below provide more detailed evaluation of the model across different modalities (image, video, and audio), together with qualitative examples of the model’s capabilities for image generation and the ability to combine information across different modalities.

以下各节更详细地评测模型在不同模态 (图像, 视频和音频) 上的表现, 并给出图像生成以及跨模态组合信息能力的定性例子.

## 5.2.1. Image Understanding

**5.2.1. 图像理解**

We evaluate post-trained Gemini API models on four different capabilities: high-level object recognition using captioning or question-answering tasks such as VQAv2; fine-grained transcription using tasks such as TextVQA and DocVQA requiring the model to recognize low-level details; chart understanding requiring spatial understanding of input layout using ChartQA and InfographicVQA tasks; and multimodal reasoning using tasks such as Ai2D, MathVista and MMMU. For zero-shot QA evaluation, the model is instructed to provide short answers aligned with the specific benchmark. All numbers are obtained using greedy sampling and without any use of external OCR tools.

我们在四种能力上评测后训练的 Gemini API 模型: 高层物体识别, 用描述生成或问答任务, 如 VQAv2; 细粒度转写, 用 TextVQA 和 DocVQA 等要求识别底层细节的任务; 图表理解, 需要理解输入布局的空间关系, 用 ChartQA 和 InfographicVQA; 多模态推理, 用 Ai2D, MathVista 和 MMMU 等任务. 对零样本问答评测, 我们指示模型给出与具体基准对齐的简短答案. 所有数字都用 greedy 采样得到, 没有使用任何外部 OCR 工具.

|  | Gemini Ultra (pixel only) | Gemini Pro (pixel only) | Gemini Nano 2 (pixel only) | Gemini Nano 1 (pixel only) | GPT-4V | Prior SOTA |
| --- | --- | --- | --- | --- | --- | --- |
| MMMU (val)Multi-discipline college-level problems(Yue et al., 2023) | 59.4%pass@162.4%Maj1@32 | 47.9% | 32.6% | 26.3% | 56.8% | 56.8%GPT-4V, 0-shot |
| TextVQA (val)Text reading on natural images(Singh et al., 2019) | 82.3% | 74.6% | 65.9% | 62.5% | 78.0% | 79.5%Google PaLI-3, fine-tuned |
| DocVQA (test)Document understanding(Mathew et al., 2021) | 90.9% | 88.1% | 74.3% | 72.2% | 88.4%(pixel only) | 88.4%GPT-4V, 0-shot |
| ChartQA (test)Chart understanding(Masry et al., 2022) | 80.8% | 74.1% | 51.9% | 53.6% | 78.5%(4-shot CoT) | 79.3%Google DePlot, 1-shot PoT(Liu et al., 2023) |
| InfographicVQA (test)Infographic understanding(Mathew et al., 2022) | 80.3% | 75.2% | 54.5% | 51.1% | 75.1%(pixel only) | 75.1%GPT-4V, 0-shot |
| MathVista (testmini)Mathematical reasoning(Lu et al., 2023) | 53.0% | 45.2% | 30.6% | 27.3% | 49.9% | 49.9%GPT-4V, 0-shot |
| AI2D (test)Science diagrams(Kembhavi et al., 2016) | 79.5% | 73.9% | 51.0% | 37.9% | 78.2% | 81.4%Google PaLI-X, fine-tuned |
| VQAv2 (test-dev)Natural image understanding(Goyal et al., 2017) | 77.8% | 71.2% | 67.5% | 62.7% | 77.2% | 86.1%Google PaLI-X, fine-tuned |

Table 7 | Image understanding Gemini Ultra consistently outperforms existing approaches even in zero-shot, especially for OCR-related image understanding tasks for natural images, text, documents, and figures without using any external OCR engine (‘pixel only’). Many existing approaches fine-tune on the respective tasks, highlighted in gray, which makes the comparison with 0-shot not apples-to-apples.

表 7 | 图像理解. 即使在零样本下, Gemini Ultra 也稳定地超过现有方法, 在自然图像, 文本, 文档和插图的 OCR 相关图像理解任务上尤其明显, 且不使用任何外部 OCR 引擎 (「pixel only」). 许多现有方法在相应任务上做过微调, 以灰色标出, 这使它们与零样本的比较并不对等.

<!-- page 14 of 90 -->

Gemini: A Family of Highly Capable Multimodal Models

We find that Gemini Ultra is state of the art across a wide range of image-understanding benchmarks in Table 7. It achieves strong performance across a diverse set of tasks such as answering questions on natural images and scanned documents as well as understanding infographics, charts and science diagrams. When compared against publicly reported results from other models (most notably GPT-4V), the Gemini model is better in zero-shot evaluation by a significant margin. It also exceeds several existing models that are specifically fine-tuned on the benchmark’s training sets for the majority of tasks. The capabilities of the Gemini models lead to significant improvements in the state of the art on academic benchmarks like MathVista (+3.1%)<sup>5</sup> or InfographicVQA (+5.2%).

表 7 显示 Gemini Ultra 在大量图像理解基准上达到最佳水平. 它在多种任务上都表现强劲, 例如回答关于自然图像和扫描文档的问题, 以及理解信息图, 图表和科学示意图. 与其他模型公开报告的结果 (尤其是 GPT-4V) 相比, Gemini 模型在零样本评测中领先明显. 在多数任务上, 它还超过几款专门在该基准训练集上微调过的现有模型. Gemini 模型的能力让 MathVista (+3.1%)<sup>5</sup> 和 InfographicVQA (+5.2%) 等学术基准的最佳成绩显著提升.

> **看表:** 第 2 页说图像 9 项全胜, 可 表 7 里 AI2D 和 VQAv2 两行 Ultra 低于 Prior SOTA, 怎么算的?
> AI2D 是 79.5% 对 PaLI-X 的 81.4%, VQAv2 是 77.8% 对 PaLI-X 的 86.1%, 两个 Prior SOTA 都是微调模型 (表中灰色). 「9 of 9」 要成立, 只能是把微调结果排除在外, 只跟零样本或少样本结果比. 表 7 注释承认两者 「not apples-to-apples」, 但第 2 页的 9/9 没有注明这个口径.

> **确认:** MathVista (+3.1%) 和 InfographicVQA (+5.2%) 是相对提升还是百分点?
> 是百分点. 表 7 中 MathVista 53.0% 减 GPT-4V 49.9% 是 3.1, InfographicVQA 80.3% 减 75.1% 是 5.2. 按相对值算分别约 6.2% 和 6.9%.

MMMU (Yue et al., 2023) is a recently released evaluation benchmark, which consists of questions about images across 6 disciplines with multiple subjects within each discipline that require collegelevel knowledge to solve these questions. Gemini Ultra achieves the best score on this benchmark advancing the state-of-the-art result by more than 5 percentage points and outperforms the previous best result in 5 of 6 disciplines (see Table 8), thus showcasing its multimodal reasoning capabilities.

MMMU (Yue et al., 2023) 是新近发布的评测基准, 由关于图像的问题组成, 覆盖 6 个学科, 每个学科下有多个科目, 需要大学水平的知识才能解答. Gemini Ultra 在这个基准上取得最好成绩, 把最佳成绩提高了 5 个百分点以上, 并在 6 个学科中的 5 个上超过此前最好结果 (见表 8), 展示了它的多模态推理能力.

| MMMU (val) | Gemini U Maj@32 | ltra (0-shot) pass@1 | GPT-4V (0-shot) pass@1 |
| --- | --- | --- | --- |
| Art &amp; Design | 74.2 | 70.0 | 65.8 |
| Business | 62.7 | 56.7 | 59.3 |
| Science | 49.3 | 48.0 | 54.7 |
| Health &amp; Medicine | 71.3 | 67.3 | 64.7 |
| Humanities &amp; Social Science | 78.3 | 78.3 | 72.5 |
| Technology &amp; Engineering | 53.0 | 47.1 | 36.7 |
| Overall | 62.4 | 59.4 | 56.8 |

Table 8 | Gemini Ultra performance on the MMMU benchmark (Yue et al., 2023) per discipline. Each discipline covers multiple subjects, requiring college-level knowledge and complex reasoning.

表 8 | Gemini Ultra 在 MMMU 基准 (Yue et al., 2023) 各学科上的表现. 每个学科覆盖多个科目, 需要大学水平的知识和复杂推理.

> **对一下:** 「more than 5 percentage points」 和 「5 of 6 disciplines」 用的是哪一列?
> 都是 Maj@32 那一列. 表 8 Overall: Maj@32 的 62.4 比 GPT-4V 的 56.8 高 5.6; 换成 pass@1 的 59.4, 只高 2.6. 分学科看, Science 两种口径都输 (49.3 和 48.0 对 54.7); Business 按 pass@1 是 56.7 对 59.3, 也输. 所以按 pass@1 是 4/6, 而 GPT-4V 一列本身就是 pass@1.

Gemini models are also capable of operating across modalities and a diverse set of global languages simultaneously, both for image understanding tasks (e.g., images containing text in Icelandic) and for generation tasks (e.g., generating image descriptions for a wide range of languages). We evaluate the performance of generating image descriptions on a selected subset of languages in the Crossmodal-3600 (XM-3600) benchmark in a 4-shot setting, using the Flamingo evaluation protocol (Alayrac et al., 2022), without any fine-tuning for all models. As shown in Table 9, Gemini models achieve a significant improvement over the existing best model, Google PaLI-X.

Gemini 模型还能同时跨模态, 跨多种全球语言工作, 既包括图像理解任务 (例如图中含冰岛语文字), 也包括生成任务 (例如用多种语言生成图像描述). 我们在 Crossmodal-3600 (XM-3600) 基准中选取部分语言, 以 4-shot 设定, 按 Flamingo 的评测协议 (Alayrac et al., 2022) 评测图像描述生成, 所有模型都不做微调. 如表 9 所示, Gemini 模型比现有最好的模型 Google PaLI-X 有显著提升.

<table><tbody><tr><td rowspan="2">XM-3600 (CIDER)</td><td rowspan="2">Gemini Ultra 4-shot</td><td rowspan="2">Gemini Pro 4-shot</td><td rowspan="2">Google PaLI-X 4-shot</td></tr><tr></tr><tr><td>English</td><td>86.4</td><td>87.1</td><td>77.8</td></tr><tr><td>French</td><td>77.9</td><td>76.7</td><td>62.5</td></tr><tr><td>Hindi</td><td>31.1</td><td>29.8</td><td>22.2</td></tr><tr><td>Modern Hebrew</td><td>54.5</td><td>52.6</td><td>38.7</td></tr><tr><td>Romanian</td><td>39.0</td><td>37.7</td><td>30.2</td></tr><tr><td>Thai</td><td>86.7</td><td>77.0</td><td>56.0</td></tr><tr><td>Chinese</td><td>33.3</td><td>30.2</td><td>27.7</td></tr><tr><td>Average (of 7)</td><td>58.4</td><td>55.9</td><td>45.0</td></tr></tbody></table>

Table 9 | Multilingual image understanding Gemini models outperform existing models in captioning images in many languages when benchmarked on a subset of languages in XM-3600 dataset (Thapliyal et al., 2022).

表 9 | 多语言图像理解. 在 XM-3600 数据集 (Thapliyal et al., 2022) 的部分语言上评测时, Gemini 模型在多种语言的图像描述上超过现有模型.

<small><span class="docvortex-page-footnote" data-block-type="page_footnote" style="color:#6b7280"><sup>5</sup>MathVista is a comprehensive mathematical reasoning benchmark consisting of 28 previously published multimodal datasets and three newly created datasets. Our MathVista results were obtained by running the [MathVista authors’ evaluation script](https://github.com/lupantech/MathVista/tree/main/evaluation).</span></small>

脚注 5: MathVista 是综合性的数学推理基准, 由 28 个已发表的多模态数据集和 3 个新建数据集组成. 我们的 MathVista 结果用 MathVista 作者的评测脚本得到.

<!-- page 15 of 90 -->

Gemini: A Family of Highly Capable Multimodal Models

## Prompt

**提示**

Write code to rearrange the subplots in the figure using the latest version of matplotlib. Put the 3d paraboloid subplot on the top left. Put the tangent function on the bottom right. For the remaining two subplots, one of them should stay in its original position and the other should fill the last spot. First describe what each subplot depicts and identify its current location. Then, explain where each subplot should go in its new location. Last write the full code for the rearranged version with the original color scheme.

写代码, 用最新版 matplotlib 重新排列图中的子图. 把 3D 抛物面子图放到左上. 把正切函数放到右下. 剩下两个子图, 一个留在原位, 另一个填到最后空出的位置. 先描述每个子图画的是什么, 指出它当前的位置. 再说明每个子图应当放到哪个新位置. 最后用原来的配色写出重排后的完整代码.

![Chart block](images/p15-chart.png)

![Chart block](images/p15-chart-2.png)

![Chart block](images/p15-chart-3.png)

![Chart block](images/p15-rendered-code.png)

Rendered code

渲染后的代码

![Chart block](images/p15-chart-4.png)

![Chart block](images/p15-chart-5.png)

![Chart block](images/p15-figure-5-using-gemini-models-multimodal-reasoning.png)

Figure 5 | Using Gemini models’ multimodal reasoning capabilities to generate matplotlib code for rearranging the subplots. The multimodal prompt is shown at the top-left in gray. Gemini Ultra’s response, including its generated code, is shown in the right column in blue. The bottom left figure shows rendered version of the generated code. Successfully solving this task shows the model’s capability to combine several capabilities: (1) recognition of the functions depicted in the plots; (2) inverse graphics to infer the code that would have generated the subplots; (3) instruction-following to put subplots in their desired positions; and (4) abstract reasoning to infer that the exponential plot must stay in its original place, because the sine plot must move out of the way for the 3-dimensional plot.

图 5 | 用 Gemini 模型的多模态推理能力生成重排子图的 matplotlib 代码. 左上灰色部分是多模态提示. 右栏蓝色部分是 Gemini Ultra 的回答, 包括它生成的代码. 左下是生成代码渲染出的图. 成功完成这个任务说明模型能组合多种能力: (1) 识别图中所画的函数; (2) 逆向图形, 推断出能画出这些子图的代码; (3) 遵循指令把子图放到指定位置; (4) 抽象推理, 推断出指数函数图必须留在原位, 因为正弦图必须让位给三维图.

## Response

**回答**

The new subplots should be:

新的子图布局应为:

· Top left: The 3D paraboloid

· 左上: 3D 抛物面

· Bottom left: The exponential function

· 左下: 指数函数

· Bottom right: The tangent function

· 右下: 正切函数

Qualitative evaluation in Figure 5 illustrates an example of Gemini Ultra’s multimodal reasoning capabilities. The model is required to solve the task of generating matplotlib code that would rearrange

图 5 的定性评测展示了 Gemini Ultra 多模态推理能力的一个例子. 模型要完成的任务是生成 matplotlib 代码, 重新排列

<!-- page 16 of 90 -->

Gemini: A Family of Highly Capable Multimodal Models

a set of subplots provided by the user. The model output shows that it successfully solves this task combining multiple capabilities of understanding the user plot, inferring the code required to generate it, following user instructions to put subplots in their desired positions, and abstract reasoning about the output plot. This highlights Gemini Ultra’s native multimodality and alludes to its more complex reasoning abilities across interleaved sequences of image and text. We refer the reader to the appendix for more qualitative examples.

(接上页) 用户提供的一组子图. 模型输出表明它成功完成了任务, 组合了多种能力: 理解用户的图, 推断生成这些图所需的代码, 遵循用户指令把子图放到指定位置, 以及对输出图做抽象推理. 这凸显了 Gemini Ultra 的原生多模态, 也暗示它在图文交错序列上有更复杂的推理能力. 更多定性例子见附录.

## 5.2.2. Video Understanding

**5.2.2. 视频理解**

Understanding video input is an important step towards a useful generalist agent. We measure the video understanding capability across several established benchmarks that are held-out from training. These tasks measure whether the model is able to understand and reason over a temporally-related sequence of frames. For each video task, we sample 16 equally-spaced frames from each video clip and feed them to the Gemini models. For the YouTube video datasets (all datasets except NextQA and the Perception test), we evaluate the Gemini models on videos that were still publicly available in the month of November, 2023.

理解视频输入是迈向有用的通用 agent 的重要一步. 我们在几个已有的, 未参与训练的基准上衡量视频理解能力. 这些任务衡量模型能否理解并推理时间上相关的帧序列. 对每个视频任务, 我们从每段视频中等间隔采样 16 帧送入 Gemini 模型. 对 YouTube 视频数据集 (除 NextQA 和 Perception test 外的全部数据集), 我们只在 2023 年 11 月仍可公开访问的视频上评测 Gemini 模型.

Gemini Ultra achieves state-of-the-art performance on various few-shot video captioning tasks as well as zero-shot video question answering tasks as shown in Table 10. This demonstrates its capability of strong temporal reasoning across several frames. Figure 23 in the appendix provides a qualitative example of understanding the video of the ball-striking mechanics of a soccer player and reasoning about the player can improve their game.

如表 10 所示, Gemini Ultra 在多种少样本视频描述任务和零样本视频问答任务上达到最佳水平. 这说明它能跨多帧做强时间推理. 附录图 23 给出一个定性例子: 理解一名足球运动员击球动作的视频, 并推理这名球员如何改进.

| Task | Gemini Ultra | Gemini Pro | Few-shot SoTA |
| --- | --- | --- | --- |
| VATEX (test) | 62.7 | 57.4 | 56.0 |
| English video captioning | 4-shots | 4-shots | DeepMind Flamingo, 4-shots |
| (Wang et al., 2019) |  |  |  |
| VATEX ZH (test) | 51.3 | 50.0 | - |
| Chinese video captioning | 4-shots | 4-shots |  |
| (Wang et al., 2019) |  |  |  |
| YouCook2 (val) | 135.4 | 123.2 | 74.5 |
| English cooking video captioning | 4-shots | 4-shots | DeepMind Flamingo, 4-shots |
| (Zhou et al., 2018) |  |  |  |
| NextQA (test) | 29.9 | 28.0 | 26.7 |
| Video question answering | 0-shot | 0-shot | DeepMind Flamingo, 0-shot |
| (Xiao et al., 2021) |  |  |  |
| ActivityNet-QA (test) | 52.2 | 49.8 | 45.3 |
| Video question answering | 0-shot | 0-shot | Video-LLAVA, 0-shot |
| (Yu et al., 2019) |  |  |  |
| Perception Test MCQA (test) | 54.7 | 51.1 | 46.3 |
| Video question answering | 0-shot | 0-shot | SeViLA (Yu et al., 2023), 0-shot |
| (Pătrăucean et al., 2023) |  |  |  |

Table 10 | Few-shot video understanding across tasks and languages on selected academic benchmarks. The reported metric is CIDER for video captioning, WUPS for NextQA, and top-1 accuracy for the Perception Test and ActivityNet-QA. For ActivityNet-QA, we use the Video-LLAVA (Lin et al., 2023) evaluation protocol.

表 10 | 在选定学术基准上, 跨任务和语言的少样本视频理解. 视频描述报告 CIDER, NextQA 报告 WUPS, Perception Test 和 ActivityNet-QA 报告 top-1 准确率. ActivityNet-QA 采用 Video-LLAVA (Lin et al., 2023) 的评测协议.

## 5.2.3. Image Generation

**5.2.3. 图像生成**

Gemini models are able to output images natively, without having to rely on an intermediate natural language description that can bottleneck the model’s ability to express images. This uniquely enables the model to generate images with prompts using interleaved sequences of image and text in a

Gemini 模型能原生输出图像, 不必依赖中间的自然语言描述, 这种中间描述可能成为模型表达图像能力的瓶颈. 这使模型能独特地在少样本设定下, 用图文交错的提示生成图像.

<!-- page 17 of 90 -->

Gemini: A Family of Highly Capable Multimodal Models

few-shot setting. For example, the user might prompt the model to design suggestions of images and text for a blog post or a website (see Figure 12 in the appendix).

(接上页) 例如, 用户可以让模型为一篇博客或一个网站设计图文建议 (见附录图 12).

Figure 6 shows an example of image generation in 1-shot setting. Gemini Ultra model is prompted with one example of interleaved image and text where the user provides two colors (blue and yellow) and image suggestions of creating a cute blue cat or a blue dog with yellow ear from yarn. The model is then given two new colors (pink and green) and asked for two ideas about what to create using these colors. The model successfully generates an interleaved sequence of images and text with suggestions to create a cute green avocado with pink seed or a green bunny with pink ears from yarn.

图 6 展示了 1-shot 设定下的图像生成例子. 给 Gemini Ultra 的提示里有一个图文交错的示例: 用户给出两种颜色 (蓝和黄), 以及用毛线做一只可爱的蓝猫或一只黄耳朵蓝狗的图像建议. 然后给模型两种新颜色 (粉和绿), 让它给出用这两种颜色做什么的两个点子. 模型成功生成图文交错的序列, 建议用毛线做一个带粉色果核的可爱绿牛油果, 或一只粉耳朵的绿兔子.

![Image block](images/p17-figure-6-image-generation-gemini-models-can-output.png)

Figure 6 | Image Generation. Gemini models can output multiple images interleaved with text given a prompt composed of image and text. In the left figure, Gemini Ultra is prompted in a 1-shot setting with a user example of generating suggestions of creating cat and dog from yarn when given two colors, blue and yellow. Then, the model is prompted to generate creative suggestions with two new colors, pink and green, and it generates images of creative suggestions to make a cute green avocado with pink seed or a green bunny with pink ears from yarn as shown in the right figure.

图 6 | 图像生成. 给定由图像和文本组成的提示, Gemini 模型能输出与文本交错的多张图像. 左图中, Gemini Ultra 以 1-shot 设定接收一个用户示例: 给定蓝和黄两种颜色, 生成用毛线做猫和狗的建议. 然后让模型用粉和绿两种新颜色生成创意建议, 它生成了用毛线做带粉色果核的可爱绿牛油果或粉耳朵绿兔子的图像, 如右图所示.

<!-- page 18 of 90 -->

Gemini: A Family of Highly Capable Multimodal Models

## 5.2.4. Audio Understanding

**5.2.4. 音频理解**

We evaluate the Gemini Nano-1 and Gemini Pro models on a variety of public benchmarks and compare it with Universal Speech Model (USM) (Zhang et al., 2023) and Whisper (large-v2 (Radford et al., 2023) or large-v3 (OpenAI, 2023) as indicated). These benchmarks include automatic speech recognition (ASR) tasks such as FLEURS (Conneau et al., 2023), VoxPopuli, (Wang et al., 2021), Multi-lingual Librispeech (Pratap et al., 2020), as well as the speech translation task CoVoST 2, translating different languages into English (Wang et al., 2020). We also report on an internal benchmark YouTube test set. ASR tasks report a word error rate (WER) metric, where a lower number is better. Translation tasks report a BiLingual Evaluation Understudy (BLEU) score, where a higher number is better. FLEURS is reported on 62 languages that have language overlap with the training data. Four segmented languages (Mandarin, Japanese, Korean and Thai) report character error rate (CER), instead of WER, similar to Whisper (Radford et al., 2023).

我们在多个公开基准上评测 Gemini Nano-1 和 Gemini Pro, 并与 Universal Speech Model (USM) (Zhang et al., 2023) 和 Whisper (large-v2 (Radford et al., 2023) 或 large-v3 (OpenAI, 2023), 按标注) 比较. 这些基准包括自动语音识别 (ASR) 任务, 如 FLEURS (Conneau et al., 2023), VoxPopuli (Wang et al., 2021), Multi-lingual Librispeech (Pratap et al., 2020), 以及把不同语言译成英语的语音翻译任务 CoVoST 2 (Wang et al., 2020). 我们还报告一个内部基准 YouTube 测试集. ASR 任务报告词错误率 (WER), 越低越好. 翻译任务报告 BLEU, 越高越好. FLEURS 报告的是与训练数据有语言重叠的 62 种语言. 与 Whisper (Radford et al., 2023) 一样, 四种需分词的语言 (普通话, 日语, 韩语和泰语) 报告字错误率 (CER) 而非 WER.

Table 11 indicates that our Gemini Pro model significantly outperforms the USM and Whisper models across all ASR and AST tasks, both for English and multilingual test sets. Note that there is a large gain in FLEURS, compared to USM and Whisper, as our model is also trained with the FLEURS training dataset. However, training the same model without FLEURS dataset results in a WER of 15.8, which still outperforms Whisper. Gemini Nano-1 model also outperforms both USM and Whisper on all datasets except FLEURS. Note that we did not evaluate Gemini Ultra on audio yet, though we expect better performance from increased model scale.

表 11 显示, 我们的 Gemini Pro 在所有 ASR 和 AST 任务上, 无论英语还是多语言测试集, 都显著超过 USM 和 Whisper. 注意在 FLEURS 上相对 USM 和 Whisper 的提升很大, 因为我们的模型也用 FLEURS 训练集训练过. 不过, 同一模型不用 FLEURS 数据训练时 WER 为 15.8, 仍然超过 Whisper. Gemini Nano-1 也在除 FLEURS 外的所有数据集上超过 USM 和 Whisper. 注意我们还没有在音频上评测 Gemini Ultra, 不过预计模型规模增大会带来更好的表现.

> **回看:** 第 2 页 30/32 里的 「5 of 5 speech」 是 Ultra 的成绩吗?
> 不是. 本段明说 「we did not evaluate Gemini Ultra on audio yet」, 表 11 只有 Gemini Pro 和 Nano-1. 那句话的主语是 Gemini Ultra, 5 项语音却是 Pro 的成绩. 第 8 节说 Ultra 在多数 「audio understanding benchmarks」 上创下最佳, 同样对不上 表 11.

> **停一下:** 不用 FLEURS 训练数据时的 15.8, 还赢谁?
> 表 11 中 FLEURS 一行: Whisper v3 是 17.6%, USM 是 11.8%. 15.8 只赢 Whisper, 输给 USM. 正文 「still outperforms Whisper」 的措辞是准确的, 但表里 Pro 的 7.6% 是在见过 FLEURS 训练集的条件下拿到的.

<table><tr><td></td><td>Task</td><td>Metric</td><td>Gemini Pro</td><td>Gemini Nano-1</td><td>Whisper (OpenAI, 2023; Radford et al., 2023)</td><td>USM (Zhang et al., 2023)</td></tr><tr><td rowspan="4">Automatic Speech Recognition</td><td>YouTube (en-us)</td><td>WER (↓)</td><td>4.9%</td><td>5.5%</td><td>6.5% (v3)</td><td>6.2%</td></tr><tr><td>Multilingual Librispeech (en-us) (Pratap et al., 2020)</td><td>WER (↓)</td><td>4.8%</td><td>5.9%</td><td>6.2% (v2)</td><td>7.0 %</td></tr><tr><td>FLEURS (62 lang) (Conneau et al., 2023)</td><td>WER (↓)</td><td>7.6%</td><td>14.2%</td><td>17.6% (v3)</td><td>11.8%</td></tr><tr><td>VoxPopuli (14 lang) (Wang et al., 2021)</td><td>WER (↓)</td><td>9.1%</td><td>9.5%</td><td>15.9% (v2)</td><td>13.4%</td></tr><tr><td>Automatic Speech Translation</td><td>CoVoST 2 (21 lang) (Wang et al., 2020)</td><td>BLEU (↑)</td><td>40.1</td><td>35.4</td><td>29.1 (v2)</td><td>30.7</td></tr></table>

Table 11 | Speech evaluation results on selected benchmarks for ASR and AST. For ASR, the reported metric is WER where lower is better. For AST, the reported metric is BLEU where higher is better.

表 11 | 选定 ASR 和 AST 基准上的语音评测结果. ASR 报告 WER, 越低越好. AST 报告 BLEU, 越高越好.

Table 12 shows further error analysis with USM and Gemini Pro. We find that Gemini Pro produces more understandable responses, particularly on rare words and proper nouns.

表 12 给出 USM 与 Gemini Pro 的进一步错误分析. 我们发现 Gemini Pro 的输出更好懂, 在罕见词和专有名词上尤其如此.

| Domain | Truth | USM | Gemini Pro | Wav |
| --- | --- | --- | --- | --- |
| Fleurs | Scotturb bus 403 travels regularly to Sintra, stopping at Cabo da Roca. | Scotboard bus four3 traversed regularly to Centra stopping at Cabo de Roga. | Scotturb bus 403 travels regularly to Sintra, stopping at Cabo da Roca. |  |
| Fleurs | The archipelago lies 120 km north of the Peninsula. The largest is King George Island, with the settlement of Villa Las Estrellas. | The archipelago lines 120 km north of peninsula. The largest is Kingurch island with the settlement of Cua Losas. | The archipelago lies 120 km north of the Peninsula. The largest is King George Island, with the settlement of Villa Las Estrellas. |  |

Table 12 | Qualitative examples for the ASR task in the benchmark. Incorrect transcriptions are highlighted in red.

表 12 | 该基准中 ASR 任务的定性例子. 错误转写以红色标出.

<!-- page 19 of 90 -->

Gemini: A Family of Highly Capable Multimodal Models

## 5.2.5. Modality Combination

**5.2.5. 模态组合**

Multimodal demonstrations often include a combination of text interleaved with a single modality, usually images. We demonstrate the ability to process a sequence of audio and images natively.

多模态演示通常是文本与单一模态 (通常是图像) 交错. 我们展示模型能原生处理音频与图像组成的序列.

Consider a cooking scenario about making an omelet where we prompt the model with a sequence of audio and images. Table 13 indicates a turn-by-turn interaction with the model, providing pictures and verbally asking questions about the next steps for cooking an omelet. We note that the model response text is reasonably accurate, and shows that model processes fine-grained image details to evaluate when the omelet is fully cooked. See demo on the [website](https://deepmind.google/gemini).

以做煎蛋卷的烹饪场景为例, 我们用一串音频和图像提示模型. 表 13 展示了与模型的逐轮交互: 用户提供图片, 并口头询问做煎蛋卷的下一步. 我们注意到模型的回答文本相当准确, 表明模型能处理图像的细粒度细节, 判断煎蛋卷是否已经熟透. 演示见网站.

![Image block](images/p19-table-13-audio-visual-qualitative-example-showcasing.png)

Table 13 | Audio-visual qualitative example showcasing the ability of Gemini models to process interleaved sequences of text, vision, and audio, as well as reason across modalities. This example inputs interleaved images and audio from the user in a cooking scenario. The user prompts the model for instructions to make an omelet and to inspect whether it is fully cooked.

表 13 | 音视频定性例子, 展示 Gemini 模型处理文本, 视觉和音频交错序列并跨模态推理的能力. 这个例子在烹饪场景中输入用户交错提供的图像和音频. 用户请模型给出做煎蛋卷的步骤, 并检查它是否已熟透.

<!-- page 20 of 90 -->

Gemini: A Family of Highly Capable Multimodal Models

## 6. Post-Training Models

**6. 后训练模型**

After large-scale pre-training, we apply post-training, where one trains on top of a pre-trained model in order to extend the model’s proficiency and to enable a wide variety of capabilities. Namely, we seek to improve overall quality, enhance target capabilities such as coding and multilingual, and ensure alignment and safety criteria are met. We discuss our approach to post-training in this section, highlighting common and distinct aspects of the Gemini Apps and Gemini API model variants.

大规模预训练之后, 我们做后训练, 也就是在预训练模型之上继续训练, 以扩展模型的熟练程度并支持多种能力. 具体地, 我们希望提升整体质量, 增强编程和多语言等目标能力, 并确保满足对齐与安全标准. 本节讨论后训练的做法, 指出 Gemini Apps 和 Gemini API 两个变体的共同点与不同点.

## 6.1. Gemini Apps: Gemini and Gemini Advanced

**6.1. Gemini Apps: Gemini 与 Gemini Advanced**

Gemini and Gemini Advanced offer direct access to Google’s family of AI models, consisting of the core post-trained Gemini Apps models and the system around it. These models are created by applying specialized post-training on top of Gemini pre-trained models: currently, Gemini gives access to Pro 1.0 and Gemini Advanced gives access to Ultra 1.0. Beyond the core models, the system determines how the models interact with external tools (such as Google Flights, Maps, and Google Workspace), and how to generate responses (filtering, ranking, and streaming). As an area, conversational AI presents several challenges, including: How to understand users’ requests across multi-turn interactions? How to make sure responses are safe, factually grounded, and helpful? How to help users accomplish tasks by using tools external to the models? We discuss how we approach these challenges in the following sections.

Gemini 和 Gemini Advanced 让用户直接使用 Google 的 AI 模型家族, 包括核心的后训练 Gemini Apps 模型及其周边系统. 这些模型是在 Gemini 预训练模型之上做专门后训练得到的: 目前 Gemini 提供 Pro 1.0, Gemini Advanced 提供 Ultra 1.0. 在核心模型之外, 系统决定模型如何与外部工具 (如 Google Flights, Maps 和 Google Workspace) 交互, 以及如何生成回答 (过滤, 排序和流式输出). 对话式 AI 这一领域有几项挑战: 如何在多轮交互中理解用户请求? 如何确保回答安全, 有事实依据且有帮助? 如何借助模型之外的工具帮用户完成任务? 下面几节讨论我们如何应对这些挑战.

## 6.2. Gemini APIs: Google AI Studio and Cloud Vertex AI

**6.2. Gemini API: Google AI Studio 与 Cloud Vertex AI**

Our developer-focused Gemini API models are designed to support both conversational and non-conversational use cases. These models are available through Google AI Studio and Cloud Vertex AI through an easy to use API. Google AI Studio is a free, web-based developer tool to prototype and launch apps quickly with an API key. Vertex AI is a comprehensive AI platform that enables developers to leverage Gemini API models with varied tooling, fully-managed infrastructure, and built-in enterprise security and privacy settings. Gemini APIs make it easy to integrate Gemini API models into any production product or workflow, empowering developers to build applications that can reason across different modalities.

面向开发者的 Gemini API 模型设计为同时支持对话和非对话用例. 这些模型通过 Google AI Studio 和 Cloud Vertex AI 以易用的 API 提供. Google AI Studio 是免费的网页开发工具, 有 API key 就能快速做原型并发布应用. Vertex AI 是全面的 AI 平台, 开发者可以借助多样的工具, 全托管的基础设施以及内置的企业级安全与隐私设置使用 Gemini API 模型. Gemini API 让开发者很容易把 Gemini API 模型集成进任何生产产品或工作流, 构建能跨模态推理的应用.

## 6.3. Post-Training Methods & Data

**6.3. 后训练方法与数据**

Post-training Gemini models to produce Gemini API and Apps variants involves several stages; see Figure 7. Careful data curation is critical for all stages. First, we collect a diverse set of prompts that are representative of real-world use cases. Second, we apply supervised fine-tuning (SFT) on demonstration data of what the model’s output should be for a given prompt (Mishra et al., 2021; Ouyang et al., 2022; Wei et al., 2022a). Third, we further collect different possible responses to a given prompt, and collect feedback data over these to train a Reward Model (RM). Finally, using the trained RM, a Reinforcement Learning from Human Feedback (RLHF) stage (Bai et al., 2022a) is applied to further align the model’s outputs with human preferences. We discuss our methods in more detail below:

对 Gemini 模型做后训练以产出 Gemini API 和 Apps 变体, 包含几个阶段, 见图 7. 所有阶段都离不开细致的数据整理. 第一, 收集一组能代表真实用例的多样 prompt. 第二, 在示范数据上做监督微调 (SFT), 示范数据给出对给定 prompt 模型应当输出什么 (Mishra et al., 2021; Ouyang et al., 2022; Wei et al., 2022a). 第三, 进一步为给定 prompt 收集不同的可能回答, 并在这些回答上收集反馈数据, 用来训练奖励模型 (RM). 最后, 用训练好的 RM 做基于人类反馈的强化学习 (RLHF) 阶段 (Bai et al., 2022a), 让模型输出进一步对齐人类偏好. 下面详细讨论这些方法:

**(1) Prompt Data Collection**: A prompt is a user’s input to the model. As well as the most recent user input, this can also include previous user-model interactions. We curate datasets of target prompts. The datasets serve as the basis for our demonstration and feedback data collections, and they are used directly during reinforcement learning. It is important to cover a diverse set of crucial use cases and in both single-turn and multi-turn formats. Data sources include vendor-created data, third-party licensed sources, and synthetic approaches.

**(1) Prompt 数据收集**: prompt 是用户给模型的输入. 除了最近一次用户输入, 它还可以包含之前的用户-模型交互. 我们整理目标 prompt 数据集. 这些数据集是示范数据和反馈数据收集的基础, 并在强化学习中直接使用. 重要的是覆盖多样的关键用例, 并同时包含单轮和多轮格式. 数据来源包括供应商制作的数据, 第三方授权来源和合成方法.

<!-- page 21 of 90 -->

Gemini: A Family of Highly Capable Multimodal Models

**(2) SFT on Demonstration Data**: SFT trains the model to output a desired target response given a prompt. Our Demonstration Data target responses can be directly written by a human expert, or generated by a model and in some cases revised or reviewed by a human. Additionally, we use data analysis tools and heuristics to ensure high data diversity across capabilities, use cases, and semantic clusters.

**(2) 在示范数据上做 SFT**: SFT 训练模型在给定 prompt 时输出期望的目标回答. 示范数据的目标回答可以由人类专家直接撰写, 也可以由模型生成, 部分情况下再由人修改或审核. 此外, 我们使用数据分析工具和启发式方法, 确保数据在各项能力, 用例和语义簇上高度多样.

**(3) RM Training on Feedback Data**: We further collect Feedback Data, for which human raters provide feedback such as relative preferences over candidate responses and feedback regarding individual responses to a given prompt. For many capabilities, rating relative preferences is an easier task than demonstrating an ideal response. Feedback data are collected across creativity, safety, factuality, other capabilities, and other target criteria. We found that the utility of the resulting human feedback data greatly depends on the prompt selection and the sampling strategy used to produce candidate responses. We use this data to train RMs to output rewards that align with human preferences as closely as possible.

**(3) 在反馈数据上训练 RM**: 我们进一步收集反馈数据, 由人类评分员对给定 prompt 的候选回答给出相对偏好, 以及对单个回答的反馈. 对许多能力来说, 给出相对偏好比示范一个理想回答更容易. 反馈数据覆盖创造力, 安全, 事实性, 其他能力和其他目标标准. 我们发现, 所得人类反馈数据的效用很大程度上取决于 prompt 的选取和生成候选回答的采样策略. 我们用这些数据训练 RM, 让它输出的奖励尽可能贴近人类偏好.

**(4) RLHF**: Applying reinforcement learning from human feedback (RLHF) to our models provides further gains over SFT alone. Our approach creates an iterative process in which RL continually pushes the boundaries of the RM, while the RM is continuously improved through evaluation and data collection, leading to progressive improvements in both.

**(4) RLHF**: 对模型做基于人类反馈的强化学习 (RLHF), 比只做 SFT 有进一步的提升. 我们的做法形成一个迭代过程: RL 不断把 RM 推到边界, 而 RM 通过评测和数据收集持续改进, 两者逐步共同提升.

![Image block](images/p21-figure-7-modeling-overview-post-training-utilizes-an.png)

Figure 7 | Modeling overview. Post-training utilizes an optimized data flywheel in order to acquire human-AI feedback and continually improve on key areas. The data mixtures for supervised finetuning, reward modeling, and reinforcement learning serve as the foundation for our models.

图 7 | 建模概览. 后训练使用一个优化过的数据飞轮来获取人类与 AI 的反馈, 在关键领域持续改进. 监督微调, 奖励建模和强化学习的数据配比是我们模型的基础.

## 6.4. Evaluation

**6.4. 评测**

Evaluation of human preferences over model outputs provides critical signals for measuring performance. As part of our development process, we conduct human evaluation extensively across targeted capabilities. Human evaluation is instantiated as side-by-side blind evaluations where human raters judge responses of two models to the same prompt, as single-response ratings for certain capabilities, and as online testing. In addition, we build models for automated evaluation that faithfully imitate human preferences in order to guide development and continuously monitor online performance.

评估人类对模型输出的偏好, 为衡量表现提供关键信号. 在开发过程中, 我们针对目标能力广泛开展人工评测. 人工评测的形式包括并排盲评 (人类评分员判断两个模型对同一 prompt 的回答), 针对部分能力的单回答打分, 以及线上测试. 此外, 我们构建忠实模仿人类偏好的自动评测模型, 用来指导开发并持续监控线上表现.

## 6.5. Model Capabilities

**6.5. 模型能力**

Beyond the general post-training outlined above, we apply techniques to improve a set of key capabilities. These capabilities cover a range of use cases inspired by current user needs and research-inspired

在上述通用后训练之外, 我们还用一些技术提升一组关键能力. 这些能力覆盖一系列用例, 灵感来自当前的用户需求和受研究启发的

<!-- page 22 of 90 -->

Gemini: A Family of Highly Capable Multimodal Models

future applications. We outline capability examples not detailed in previous sections below. The post-training recipes are carefully designed to balance multiple objectives, including creativity, factuality, safety and more (Bai et al., 2022b; Thoppilan et al., 2022). We have a particular focus on safety and alignment, and hence address this in a further dedicated section.

(接上页) 未来应用. 下面概述前文未详述的能力例子. 后训练配方经过精心设计, 以平衡多个目标, 包括创造力, 事实性, 安全等 (Bai et al., 2022b; Thoppilan et al., 2022). 我们特别关注安全与对齐, 因此另设专门一节讨论.

## 6.5.1. Instruction Following

**6.5.1. 指令遵循**

Following a user’s prompt accurately is a fundamental capability for LLMs, especially as these models become more sophisticated and are presented with increasingly complex user prompts. User prompts vary in granularity, specificity, and requirements (e.g., content, format, length). Individual instructions can also be ambiguous, optional, or even impossible or undesirable to satisfy (He et al., 2023; Xu et al., 2023).

准确遵循用户 prompt 是 LLM 的基本能力, 模型越复杂, 面对的用户 prompt 越复杂, 这一点越重要. 用户 prompt 在粒度, 具体程度和要求 (如内容, 格式, 长度) 上各不相同. 单条指令也可能含糊, 可选, 甚至无法满足或不应满足 (He et al., 2023; Xu et al., 2023).

We improve Gemini Apps and Gemini API models’ instruction following (IF) abilities by collecting data for a diverse set of instruction following categories. For instructions that are verifiable programmatically such as word count, we generate synthetic data via prompting and response editing to ensure that such instructions are satisfied.

我们为多样的指令遵循类别收集数据, 提升 Gemini Apps 和 Gemini API 模型的指令遵循 (IF) 能力. 对字数这类可以程序化验证的指令, 我们通过提示和回答编辑生成合成数据, 确保这些指令被满足.

**Complex prompts evaluation**: We investigate performance on complex prompts containing multiple instructions using a fine-grained evaluation method that assesses how well models adhere to each instruction. Human raters are presented with a prompt-response pair and a list of the individual (sub)-instructions contained in the prompt. Each prompt may have anywhere from one to dozens of individual instructions, and the annotators are tasked with determining whether each instruction is followed (or not) by the response.

**复杂 prompt 评测**: 我们用一种细粒度评测方法考察模型在含多条指令的复杂 prompt 上的表现, 评估模型对每条指令的遵循程度. 人类评分员拿到一组 prompt-回答对, 以及 prompt 中包含的各条 (子) 指令清单. 每个 prompt 可能含一条到几十条指令, 标注员要判断回答是否遵循了每条指令.

Table 14 reports results on an internal dataset of prompts with instructions of varying complexity that encompass a wide range of instructions and are designed to be challenging for LLMs. We report two metrics: per-instruction accuracy (the percentage of sub instructions in the eval set that are followed), and full-response accuracy (the percentage of eval set prompts where all sub-instructions are followed).

表 14 报告在一个内部 prompt 数据集上的结果. 这些 prompt 含复杂程度各异的指令, 覆盖面广, 专门设计得对 LLM 有挑战. 我们报告两个指标: 逐指令准确率 (评测集中被遵循的子指令所占百分比) 和全回答准确率 (所有子指令都被遵循的 prompt 占评测集的百分比).

|  | Post-trained PaLM 2 | Gemini (with Pro) | Gemini Advanced (with Ultra) |
| --- | --- | --- | --- |
| Per-instruction accuracy | 59.5±3.0% | 77.8±2.0% | 87.4±1.4% |
| Full-response accuracy | 25.5±3.3% | 38.5±3.6% | 54.1±3.7% |

Table 14 | Performance of Gemini on our complex prompts instruction-following internal benchmark.

表 14 | Gemini 在我们复杂 prompt 指令遵循内部基准上的表现.

> **看表:** 表 14 两行各自的分母是什么?
> 逐指令准确率的分母是评测集里全部子指令, 全回答准确率的分母是 prompt 数. 每个 prompt 含 1 条到几十条指令, 两个分母结构不同, 两行不能互推. Ultra 这一列是 87.4% 对 54.1%: 近九成子指令做到了, 却有近一半 prompt 至少漏掉一条. 正文说漏掉的子指令分散在各个回答里, 这正是全回答准确率掉得多的原因.

Gemini Advanced (with Ultra) achieves an average per-instruction accuracy close to 90%, representing a significant improvement over Gemini (with Pro) and a post-trained PaLM 2 model. We find that the sub-instructions that aren’t followed are well-distributed across responses. As a result Gemini Advanced’s full-response accuracy is lower, at around 54%. This indicates that there is further headroom for models to fully satisfy all instructions.

Gemini Advanced (with Ultra) 的平均逐指令准确率接近 90%, 比 Gemini (with Pro) 和后训练的 PaLM 2 模型有显著提升. 我们发现, 没有被遵循的子指令在各个回答之间分布得很分散. 因此 Gemini Advanced 的全回答准确率较低, 约为 54%. 这说明模型在完全满足所有指令上仍有提升空间.

## 6.5.2. Tool Use

**6.5.2. 工具使用**

By training LLMs to use tools, we greatly expand LLM capabilities beyond their internal knowledge. We treat tool use for both Gemini Apps and Gemini API models as a code generation problem, leveraging the base model’s preexisting strong coding capabilities. Every tool invocation is represented as a code block in which tool calls are invoked. This process allows the model to both compose multiple tools in each code block, as well as observe and react to the results of tool execution. At inference time, to generate a response to a user prompt, our system executes the loop shown in Figure 8, where sampling from the LLM and execution of tool code work together to create a final response.

通过训练 LLM 使用工具, 我们把 LLM 的能力大大扩展到其内部知识之外. 对 Gemini Apps 和 Gemini API 模型, 我们把工具使用当作代码生成问题, 借助基础模型本来就强的编程能力. 每次工具调用都表示成一个代码块, 在其中发起工具调用. 这让模型既能在每个代码块中组合多个工具, 也能观察工具执行结果并做出反应. 推理时, 为了生成对用户 prompt 的回答, 系统执行图 8 所示的循环, 从 LLM 采样和执行工具代码协同生成最终回答.

<!-- page 23 of 90 -->

Gemini: A Family of Highly Capable Multimodal Models

![Image block](images/p23-figure-8-a-gemini-tool-use-control-loop.png)

Figure 8 | A Gemini tool-use control loop.

图 8 | Gemini 的工具使用控制循环.

**Gemini Apps models**: Gemini draws on a range of tools via Gemini Extensions, including Google Workspace, Google Maps, YouTube, Google Flights, and Google Hotels. These tool-use capabilities also enable Gemini to be integrated as part of Gmail, Docs, Slides, Sheets and more. We are aiming to bring further tool-use capabilities in order to both enhance Gemini models and integrate Gemini models into further products.

**Gemini Apps 模型**: Gemini 通过 Gemini Extensions 使用一系列工具, 包括 Google Workspace, Google Maps, YouTube, Google Flights 和 Google Hotels. 这些工具使用能力也让 Gemini 可以集成到 Gmail, Docs, Slides, Sheets 等产品中. 我们计划带来更多工具使用能力, 既增强 Gemini 模型, 也把 Gemini 模型集成进更多产品.

We created an internal benchmark to assess Gemini performance on tasks that may benefit from access to these extensions. This benchmark measures human preference in domains such as travel planning and video discovery. We find models equipped with tools are preferred on this set 78% of the time over models without tools (excluding ties).

我们建了一个内部基准, 评估 Gemini 在可能受益于这些扩展的任务上的表现. 这个基准衡量人类在旅行规划, 视频发现等领域的偏好. 我们发现, 在这组任务上, 配备工具的模型有 78% 的时间比不用工具的模型更受偏好 (不计平局).

**Gemini API models**: We have found that fine-tuning Gemini API models is very effective at teaching the model tool-use behaviors. Furthermore, training models to use programming and search as tools leads to improved performance on a range of academic benchmarks. In Table 15, we compare tool-use models fine-tuned from an early version of Gemini API Pro against equivalent models that do not use tools.

**Gemini API 模型**: 我们发现微调 Gemini API 模型对教会模型工具使用行为非常有效. 此外, 训练模型把编程和搜索当作工具使用, 能提升一系列学术基准上的表现. 在表 15 中, 我们把从早期版本 Gemini API Pro 微调出的工具使用模型, 与不使用工具的同等模型做比较.

<table><tr><td rowspan="2"></td><td colspan="2">Mathematical Reasoning</td><td colspan="2">Factuality &amp; Knowledge Retrieval</td></tr><tr><td>GSM8K Cobbe et al. (2021)</td><td>MATH Hendrycks et al. (2021b)</td><td>NQ Kwiatkowski et al. (2019b)</td><td>Realtime QA Kasai et al. (2022a)</td></tr><tr><td>Gemini API Pro with tools</td><td>80.1%</td><td>41.8%</td><td>68.0%</td><td>70.8%</td></tr><tr><td>Gemini API Pro without tools</td><td>69.7%</td><td>30.7%</td><td>59.0%</td><td>39.2%</td></tr></table>

Table 15 | Comparison between Gemini API tool-use models and comparable models that do not use tools. Gemini API Pro without tools is an early version of our Pro model trained without tool-use data. Gemini API Pro with tools is the same model fine-tuned with tool-use data.

表 15 | Gemini API 工具使用模型与不用工具的可比模型对比. Gemini API Pro without tools 是早期版本的 Pro 模型, 训练时没有工具使用数据. Gemini API Pro with tools 是同一模型用工具使用数据微调后的版本.

> **问:** Realtime QA 从 39.2% 到 70.8%, 比的是哪两个模型?
> 是同一个早期 Pro, 一个加 tool-use 数据微调, 一个没加, 都不是最终发布的 Pro. RealtimeQA 考新近事件, 不能搜索的模型本来就无从得知答案, 这 31.6 个点主要反映 「能不能查」, 不是推理变强. 数学两列 (GSM8K 69.7% 到 80.1%, MATH 30.7% 到 41.8%) 更能说明把代码执行当工具的价值. 「without tools」 一行 GSM8K 只有 69.7%, 比 表 2 中 Pro 的 86.5% 低很多, 印证这是早期版本.

## 6.5.3. Multilinguality

**6.5.3. 多语言能力**

Multilinguality is critical to make sure Gemini models effectively support a wide range of languages. We discuss our key approaches for Gemini Apps and Gemini API models respectively below.

多语言能力对确保 Gemini 模型有效支持多种语言至关重要. 下面分别讨论 Gemini Apps 和 Gemini API 模型的关键做法.

**Gemini Apps models**: Scaling Gemini from English to 40+ languages imposed research challenges in data quality. We leverage abundant high-quality English data by localization to native cultures (e.g., “president of the United States” -> “ 日本の首相”).

**Gemini Apps 模型**: 把 Gemini 从英语扩展到 40 多种语言, 在数据质量上带来研究挑战. 我们通过面向本地文化的本地化, 利用大量高质量英语数据 (例如 「president of the United States」 -> 「日本の首相」).

Table 16 shows the performance of Gemini (with Pro) on 5 languages compared to Bard with

表 16 显示 Gemini (with Pro) 在 5 种语言上的表现, 对照对象是采用

<!-- page 24 of 90 -->

Gemini: A Family of Highly Capable Multimodal Models

an older post-training recipe and based on PaLM 2. For side-by-side comparisons between a model A and a model B, we calculate a metric called SxS score. Each rating is converted to an ordinal value centered at 0: ratings preferring A are positive and ratings preferring B are negative over a scale between -1.5 and 1.5. The converted values are averaged to return the SxS score. Intuitively, a positive SxS score indicates the extent to which model A is preferred over model B. Here, we find quality improved by more than 0.1 SxS score for all five languages. Coding and reasoning gains from Gemini Pro are preserved across languages.

(接上页) 旧后训练配方, 基于 PaLM 2 的 Bard. 对模型 A 与模型 B 的并排比较, 我们计算一个叫 SxS score 的指标. 每个评分被转换成以 0 为中心的序数值: 偏好 A 的评分为正, 偏好 B 的为负, 取值范围在 -1.5 到 1.5 之间. 转换后的值取平均, 就得到 SxS score. 直观地说, SxS score 为正表示模型 A 比模型 B 更受偏好的程度. 这里我们发现, 五种语言的质量都提高了 0.1 以上的 SxS score. Gemini Pro 在编程和推理上的提升在各语言中都得以保留.

| Language | QualitySxS | CodingMBPP Pass@1Austin et al. (2021) | ReasoningMMLUHendrycks et al.(2021a) |
| --- | --- | --- | --- |
| ja-JP | +0.14 | +22.2% | +3.6% |
| pt-BR | +0.17 | +23.2% | +5.2% |
| de-DE | +0.1 | +21.4% | +7.5% |
| es-419 | +0.12 | +22.8% | +9.3% |
| it-IT | +0.13 | +13.8% | +7.5% |

Table 16 | Multilingual performance of Gemini (with Pro) compared to Gemini with an older post-training recipe and PaLM 2.

表 16 | Gemini (with Pro) 的多语言表现, 对照为采用旧后训练配方, 基于 PaLM 2 的 Gemini.

> **核对:** 表 16 的 +22.2% 等数是对谁的差, 什么单位?
> 对照是用旧后训练配方, 基于 PaLM 2 的 Bard. MBPP 和 MMLU 两列是差值, 表头没说是百分点还是相对百分比; Quality 列是 SxS score, 量程 -1.5 到 1.5, 五种语言在 +0.1 到 +0.17 之间, de-DE 恰好是 +0.1, 与正文 「more than 0.1」 差一点. 表注写的是 「compared to Gemini with an older post-training recipe and PaLM 2」, 与正文 「compared to Bard」 的说法不一致.

**Gemini API models**: Similar to Gemini Apps models, we train Gemini API models on additional multilingual post-training data, effectively adapting the original English model for use in various languages. We experiment with both human-generated non-English prompt-response pairs as well as automatically translated pairs. For the latter, we leverage abundant high-quality English demonstration data by translation. We ensure the quality of such translated data by translationability filtering and response rating by humans.

**Gemini API 模型**: 与 Gemini Apps 模型类似, 我们用额外的多语言后训练数据训练 Gemini API 模型, 把原本的英语模型有效地适配到各种语言. 我们既尝试人工撰写的非英语 prompt-回答对, 也尝试自动翻译的数据对. 对后者, 我们通过翻译利用大量高质量英语示范数据. 我们用可译性过滤和人工回答评分来保证这类翻译数据的质量.

Translatability Filtering: Not all prompt-response pairs make sense when automatically translated, and may require expensive localization instead. Example prompts of this type (responses omitted for space) include:

可译性过滤: 并非所有 prompt-回答对在自动翻译后都说得通, 有些可能需要昂贵的本地化. 这类 prompt 的例子 (回答因篇幅省略) 包括:

• (strict word requirements) Write a 1000 word essay about world peace.

• (严格字数要求) 写一篇 1000 词的关于世界和平的文章.

• (too English centric) Write a poem in iambic pentameter about apples.

• (过于以英语为中心) 用抑扬格五音步写一首关于苹果的诗.

• (too Latin-script centric) What is a word with 1 E, 2 As, and 1 U?

• (过于以拉丁字母为中心) 哪个词含 1 个 E, 2 个 A 和 1 个 U?

Translation Quality Validation: Each translated prompt-response pair was rated for translation quality by at least 3 human raters, and was kept in the final mixture if the majority of raters rated it as accurate. Section 5.1.4 reports evaluations of the multilingual capabilities of post-trained Gemini API models.

翻译质量验证: 每个翻译后的 prompt-回答对至少由 3 名人类评分员评定翻译质量, 多数评分员认为准确才保留在最终数据中. 5.1.4 节报告了后训练 Gemini API 模型多语言能力的评测.

## 6.5.4. Multimodal Vision

**6.5.4. 多模态视觉**

Multimodal post-training enhances the capabilities of our natively multimodal Gemini models for a wide range of useful applications. In the following, we discuss how image understanding ability is incorporated into Gemini Apps and Gemini API models. For this evaluation, we further train both of these Gemini model variants on a mixture of text data and expert curated image-text data over several vertically-defined multimodal use cases

多模态后训练增强原生多模态 Gemini 模型的能力, 服务于大量有用的应用. 下面讨论如何把图像理解能力纳入 Gemini Apps 和 Gemini API 模型. 为此, 我们在文本数据与专家整理的图文数据的混合上进一步训练这两个 Gemini 模型变体, 覆盖几个按垂直领域定义的多模态用例.

**Gemini Apps models**: We empower Gemini and Gemini Advanced with image understanding capabilities by fine-tuning pre-trained Gemini models on a mixture of text-only and image-text data. Careful balancing of text and multimodal data ensures the model develops robust image understanding without adversely affecting the quality of the text-only interactions. To assess our

**Gemini Apps 模型**: 我们在纯文本与图文数据的混合上微调预训练 Gemini 模型, 让 Gemini 和 Gemini Advanced 具备图像理解能力. 仔细平衡文本数据和多模态数据, 能让模型获得稳健的图像理解, 又不损害纯文本交互的质量. 为了评估

<!-- page 25 of 90 -->

Gemini: A Family of Highly Capable Multimodal Models

models, we compile a dataset of human-curated and synthetic image-text prompts and responses, spanning various categories and difficulty levels. This dataset facilitates human evaluation for model comparison and selection.

(接上页) 模型, 我们汇编了一个由人工整理和合成的图文 prompt 与回答组成的数据集, 覆盖多种类别和难度. 这个数据集用于人工评测, 帮助比较和挑选模型.

We find that introducing this image-text data preserves Gemini Apps model quality on text-only tasks, with a SxS score on text-only tasks of $+ 0 . 0 1 { \scriptstyle \pm } 0 . 0 1$ for a Gemini Apps Pro model trained on this data versus an equivalent model trained only on text data. In addition, post-training via RLHF improves performance on multimodal tasks, with a SxS score on image-understanding tasks of $+ 0 . 2 2 3 { \pm } 0 . 0 6$ for a Gemini Apps Pro model post-trained with SFT & RLHF vs SFT alone.

我们发现引入这些图文数据后, Gemini Apps 模型在纯文本任务上的质量得以保持: 用这些数据训练的 Gemini Apps Pro 模型, 对比只用文本数据训练的同等模型, 纯文本任务上的 SxS score 为 $+ 0 . 0 1 { \scriptstyle \pm } 0 . 0 1$. 此外, 通过 RLHF 的后训练提升了多模态任务表现: 用 SFT 加 RLHF 后训练的 Gemini Apps Pro 模型, 对比只做 SFT 的版本, 图像理解任务上的 SxS score 为 $+ 0 . 2 2 3 { \pm } 0 . 0 6$.

Gemini API models: We evaluate the impact of post-training via SFT on Gemini API models multimodal vision performance by tracking the performance of both pre-trained models and post-trained Gemini API Vision models on a series of standard benchmarks. These post-trained results have already been given in Table 7, in Table 17 we further report the difference in performance between pre-trained and post-trained Gemini API models.

Gemini API 模型: 我们在一系列标准基准上跟踪预训练模型和后训练 Gemini API Vision 模型的表现, 评估 SFT 后训练对 Gemini API 模型多模态视觉表现的影响. 后训练结果已在表 7 给出, 表 17 进一步报告预训练与后训练 Gemini API 模型之间的表现差异.

|  | Gemini Ultra Pre-trained only 0-shot (pixel only) | Gemini API Ultra 0-shot (pixel only) | Gemini Ultra pre- to post-trained improvement |
| --- | --- | --- | --- |
| MMMU (val)Multi-discipline college-level problems (Yue et al., 2023) | n/a | 59.4%pass@162.4%Maj1@32 | n/a |
| TextVQA (val)Text reading on natural images (Singh et al., 2019) | 81.4% | 82.3% | +0.9% |
| DocVQA (test)Document understanding (Mathew et al., 2021) | 90.1% | 90.9% | +0.8% |
| ChartQA (test)Chart understanding (Masry et al., 2022) | 80.8% | 80.8% | 0.0% |
| InfographicVQA (test)Infographic understanding (Mathew et al., 2022) | 77.9% | 80.3% | +2.4% |
| MathVista (testmini)Mathematical reasoning (Lu et al., 2023) | n/a | 53.0% | n/a |
| AI2D (test)Science diagrams (Kembhavi et al., 2016) | 76.6% | 79.5% | +2.9% |
| VQAv2 (test-dev)Natural image understanding (Goyal et al., 2017) | 74.5% | 77.8% | +3.3% |

Table 17 | Post-trained model image understanding Post-training improves image understanding capabilities of Gemini API Ultra over the base pre-trained model. Comparisons of Gemini API Ultra to other models on these benchmarks are given in Table 7.

表 17 | 后训练模型的图像理解. 后训练在基础预训练模型之上提升了 Gemini API Ultra 的图像理解能力. Gemini API Ultra 与其他模型在这些基准上的比较见表 7.

> **再看:** 后训练给图像理解加了多少?
> 不多. 表 17 中 ChartQA 是 0.0%, TextVQA +0.9%, DocVQA +0.8%, 最多的 VQAv2 也只有 +3.3%; MMMU 和 MathVista 两行标 n/a, 没给预训练分. 作者把提升归因于输出风格与参考答案对齐. 所以 表 7 的图像成绩主要来自预训练, 后训练的贡献集中在格式.

The results indicate that the pre-trained model already has high performance across the capabilities represented by these benchmarks, in line with previous observations. However, the post-training SFT stage used for the Gemini API Vision models succeeds in improving the performance over several of these benchmarks (InfographicVQA, AI2D, VQAv2), most likely due to the model’s increased instruction-following capabilities that succeed in aligning the model output style with that of the golden references.

结果表明, 预训练模型在这些基准所代表的能力上已经表现很高, 与之前的观察一致. 不过, Gemini API Vision 模型使用的 SFT 后训练阶段在其中几个基准 (InfographicVQA, AI2D, VQAv2) 上成功提升了表现, 很可能是因为模型的指令遵循能力增强, 让输出风格与标准参考答案对齐.

<!-- page 26 of 90 -->

Gemini: A Family of Highly Capable Multimodal Models

## 6.5.5. Coding

**6.5.5. 编程**

Despite the strong coding benchmark performance of the base model, post-training data still provides a significant boost to both code quality and code correctness. This highlights the benefit of high-quality demonstration data and feedback data for coding use cases. Gemini Apps and Gemini API models use a combination of human and synthetic approaches to collect such data.

尽管基础模型在编程基准上表现很强, 后训练数据仍显著提升了代码质量和代码正确性. 这凸显了高质量示范数据和反馈数据对编程用例的价值. Gemini Apps 和 Gemini API 模型结合人工和合成方法收集这类数据.

We evaluate our Gemini Apps models’ coding performance on a set of internally curated prompts, distributed across code use cases and languages. Table 18 reports SxS scores, where Gemini (with Pro) significantly improves upon Bard with an older post-training recipe and based on PaLM 2. Gemini Advanced (with Ultra) further improves upon Gemini (with Pro).

我们在一组内部整理的 prompt 上评测 Gemini Apps 模型的编程表现, 这些 prompt 分布在各种代码用例和编程语言上. 表 18 报告 SxS score: Gemini (with Pro) 相比采用旧后训练配方, 基于 PaLM 2 的 Bard 有显著提升. Gemini Advanced (with Ultra) 又在 Gemini (with Pro) 之上进一步提升.

| Side A | Side B | SxS score |
| --- | --- | --- |
| Gemini (with Pro) | Bard (PaLM 2, Sept. 2023) | 0.19±0.03 |
| Gemini Advanced (with Ultra) | Gemini (with Pro) | 0.13±0.02 |

Table 18 | SxS comparisons of Gemini models on an internal coding benchmark.

表 18 | Gemini 模型在内部编程基准上的 SxS 比较.

For the coding capabilities of post-trained Gemini API Models, see Table 2 which reports their academic benchmark performance.

后训练 Gemini API 模型的编程能力见表 2, 其中报告了它们在学术基准上的表现.

## 7. Responsible Deployment

**7. 负责任的部署**

During the development of Gemini models, we follow a structured approach to responsible deployment to identify, measure, and manage foreseeable downstream societal impacts of our models, in line with previous releases of Google’s AI technology (Kavukcuoglu et al., 2022). Throughout the lifecycle of a project, we follow the structure below. This section provides more detail about our approach and includes key findings where available. We are committed to ongoing transparency and will continue to provide updated information on our approach and testing in upcoming reports.

在开发 Gemini 模型的过程中, 我们遵循结构化的负责任部署方法, 识别, 衡量和管理模型可预见的下游社会影响, 与 Google 以往发布 AI 技术的做法一致 (Kavukcuoglu et al., 2022). 在项目的整个生命周期中, 我们遵循下图所示的结构. 本节更详细地介绍我们的做法, 并在可能时给出关键发现. 我们承诺持续保持透明, 并将在后续报告中继续更新做法和测试信息.

![Image block](images/p26-7-1-impact-assessment.png)

## 7.1. Impact Assessment

**7.1. 影响评估**

At Google we apply an impact assessment framework throughout the product development lifecycle related to Google’s AI Principles (Google, 2023). This means we assess the risk and impact of AI models we’re building at both a model-level (e.g. for Gemini API Ultra 1.0, as deployed on Cloud

在 Google, 我们在整个产品开发生命周期中应用与 Google AI 原则 (Google, 2023) 相关的影响评估框架. 这意味着我们在模型层面 (例如部署在 Cloud

<!-- page 27 of 90 -->

Gemini: A Family of Highly Capable Multimodal Models

Studio or Vertex AI), and once embedded within a broader product or service (e.g. for Gemini Advanced).

(接上页) Studio 或 Vertex AI 上的 Gemini API Ultra 1.0), 以及模型嵌入更广泛的产品或服务之后 (例如 Gemini Advanced), 都评估所构建 AI 模型的风险与影响.

## 7.1.1. Model Assessment

**7.1.1. 模型评估**

We conduct model impact assessments to identify, assess, and document societal benefits and harms associated with the capabilities of Gemini models. Our impact assessments for Gemini API models describe downstream benefits and risks that we identify, spanning across the models’ modalities (text-to-text; image-to-text; and video-to-text). Model impact assessments are conducted by the Google DeepMind Responsible Development and Innovation team, and are reviewed by the Google DeepMind Responsibility and Safety Council. We draw from various sources in producing impact assessments, including a wide range of literature, external expertise, and our in-house ethics and safety research.

我们开展模型影响评估, 识别, 评估并记录与 Gemini 模型能力相关的社会收益与危害. Gemini API 模型的影响评估描述我们识别出的下游收益与风险, 覆盖模型的各种模态 (文本到文本, 图像到文本, 视频到文本). 模型影响评估由 Google DeepMind Responsible Development and Innovation 团队执行, 由 Google DeepMind Responsibility and Safety Council 审阅. 撰写影响评估时, 我们参考多种来源, 包括大量文献, 外部专家意见以及内部的伦理与安全研究.

Gemini models introduce various benefits to people and society. Gemini models’ various modalities, including language, image and video understanding, can help users process information more efficiently, for example through content summarisation. These efficiency benefits can apply to commercial entities, and can assist use cases dependent on text, image or video processing such as video captioning, analytics or product descriptions. Video and image understanding modalities can also be deployed for social good applications downstream, such as enabling descriptions of visual outputs for accessibility purposes. Generative multimodal models may also raise downstream societal risks, with the Gemini models assessments considering a range of risks previously identified within research such as Weidinger et al. (2021) and Shelby et al. (2023). We assessed a range of content risks such as exposure of users to potentially unsafe content, such as sexually explicit, violent or hateful outputs (Weidinger et al., 2021), child safety harms, and representation harms, subsequently designing evaluations across these domains to enable measurement. Beyond content related risks, we analyzed the potential misuse of capabilities for surveillance applications, particularly for mediato-text capabilities, and considered the broader environmental and economic impact of multimodal models. We are continuously conducting research into emerging risks of advanced models, including for dangerous capabilities (e.g. cyber security threats) which form a part of our evaluation approach (Section 7.4).

Gemini 模型给个人和社会带来多种收益. 它的多种模态, 包括语言, 图像和视频理解, 能帮助用户更高效地处理信息, 例如内容摘要. 这些效率收益也适用于商业实体, 能辅助依赖文本, 图像或视频处理的用例, 如视频描述, 分析或商品描述. 视频和图像理解模态也可以在下游用于公益, 例如为无障碍需求提供视觉内容的描述. 生成式多模态模型也可能带来下游社会风险, Gemini 模型的评估考虑了 Weidinger et al. (2021) 和 Shelby et al. (2023) 等研究先前识别的一系列风险. 我们评估了一系列内容风险, 例如用户接触到可能不安全的内容 (色情, 暴力或仇恨输出) (Weidinger et al., 2021), 儿童安全危害和表征性危害, 并随后针对这些领域设计评测以便衡量. 在内容风险之外, 我们分析了能力被滥用于监控的可能, 尤其是媒体到文本的能力, 并考虑了多模态模型更广泛的环境与经济影响. 我们持续研究先进模型的新兴风险, 包括危险能力 (如网络安全威胁), 这是我们评测方法的一部分 (7.4 节).

## 7.1.2. Product Assessments

**7.1.2. 产品评估**

Beyond the assessment conducted at the model-level, additional risk assessments are conducted on the products by the Google AI Principles team prior to launch (e.g. on the Gemini Advanced product). These risk and impact assessments, alongside both model- and product-level assurance evaluations, are used to guide mitigation and product delivery efforts, and inform deployment decisions.

在模型层面的评估之外, Google AI Principles 团队还会在产品上线前做额外的风险评估 (例如对 Gemini Advanced 产品). 这些风险与影响评估, 连同模型层面和产品层面的保障评测, 用于指导缓解工作和产品交付, 并为部署决策提供依据.

For Gemini Advanced, we conducted extensive deep-dive red teaming via dogfooding and adversarial testing in the areas of safety, accountability, and inclusion to prepare for the initial experimental rollout of Gemini and subsequent updates. Further cross-functional work helps to ensure appropriate mitigations were adopted before Gemini and its new capabilities or offerings, such as Gemini Advanced, launched. Beyond content safety, these product mitigations included the following:

对 Gemini Advanced, 我们通过内部试用 (dogfooding) 和对抗测试, 在安全, 问责和包容三个领域做了大量深入的红队测试, 为 Gemini 的首次实验性推出和后续更新做准备. 进一步的跨职能工作帮助确保在 Gemini 及其新能力或新产品 (如 Gemini Advanced) 上线前采取了适当的缓解措施. 在内容安全之外, 这些产品缓解措施包括:

• Clear and relevant explanations to set appropriate expectations that describe Gemini as a way to get direct access to Google AI for a wide range of tasks, including complex tasks. Explanations make clear that this AI-powered system is useful for all sorts of tasks — like preparing for a job interview, debugging code for the first time or writing a pithy social media caption.

• 清晰, 相关的说明, 设定合适的预期: 把 Gemini 描述为直接使用 Google AI 处理各种任务 (包括复杂任务) 的途径. 说明中明确这个 AI 系统适用于各类任务, 比如准备求职面试, 第一次调试代码, 或写一条精炼的社交媒体文案.

• Disclosures in the [Gemini Apps Privacy Notice](https://support.google.com/gemini?p=privacy_notice) stating that people should not rely on Gemini’s responses as medical, legal, financial or other professional advice.

• 在 Gemini Apps 隐私声明中披露: 用户不应把 Gemini 的回答当作医疗, 法律, 财务或其他专业建议.

<!-- page 28 of 90 -->

Gemini: A Family of Highly Capable Multimodal Models

• Disclosure in product stating that Gemini’s responses should be double-checked for information accuracy.

• 在产品中披露: Gemini 的回答应当复核信息准确性.

• Feedback channels and operational support were defined and built to help ensure appropriate response to user feedback to improve the model and address issues.

• 定义并搭建反馈渠道和运营支持, 确保对用户反馈做出适当响应, 以改进模型并处理问题.

For the Gemini API Ultra model, that will be available through Google AI Studio and Cloud Vertex AI, product review outcomes resulted in additional safety evaluations on enterprise-specific data across modalities, and additional product-level mitigations to promote safe and responsible use including:

对将通过 Google AI Studio 和 Cloud Vertex AI 提供的 Gemini API Ultra 模型, 产品审查的结果是: 在企业特定数据上跨模态做了额外的安全评测, 并增加了产品层面的缓解措施, 以促进安全, 负责任的使用, 包括:

• [Safety filters](https://cloud.google.com/vertex-ai/docs/generative-ai/multimodal/configure-safety-attributes#safety_attribute_definitions) with Cloud established thresholds as the default product behavior.

• 安全过滤器, 以 Cloud 设定的阈值作为默认产品行为.

• Developer [enablement information](https://cloud.google.com/vertex-ai/docs/generative-ai/learn/responsible-ai) embedded within product documentation to support responsible use.

• 在产品文档中嵌入开发者赋能信息, 支持负责任的使用.

• Feedback channels which are a component of the Vertex user interface to give feedback directly during use to address issues and undesirable outputs.

• Vertex 用户界面中的反馈渠道, 用户可在使用中直接反馈, 以处理问题和不良输出.

We are increasingly integrating our AI review work into our holistic enterprise risk management frameworks for assuring the quality of our offerings. This evolution helps us further the scale of our work and integration into existing governance and company-wide infrastructure and accountability processes. In close coordination with central AI Principles review teams, some of our product areas, including Google Cloud, have developed their own specialized review processes, deploying approaches tailored to their unique circumstances.

我们正把 AI 审查工作越来越多地纳入整体的企业风险管理框架, 以保障产品质量. 这一演进帮助我们扩大工作规模, 并融入现有的治理, 全公司基础设施和问责流程. 在与中央 AI Principles 审查团队紧密协作的同时, 包括 Google Cloud 在内的部分产品领域发展了各自的专门审查流程, 采用适合自身情况的做法.

## 7.2. Safety Policies

**7.2. 安全政策**

We have developed a set of model safety policies for Gemini models to steer development and evaluation. The model policy definitions act as a standardized criteria and prioritization schema for responsible development and define the categories against which we measure launch readiness. Google products that use Gemini models, like our conversational AI service Gemini and Cloud Vertex API, further implement our standard product policy framework which is based on Google’s extensive experience with harm mitigation and rigorous research. These policies take product use cases into account – for example, providing additional safety coverage for users under 18.

我们为 Gemini 模型制定了一套模型安全政策, 用来引导开发和评测. 模型政策的定义是负责任开发的标准化准则和优先级框架, 也定义了衡量上线就绪度的类别. 使用 Gemini 模型的 Google 产品, 如对话式 AI 服务 Gemini 和 Cloud Vertex API, 还会进一步执行我们的标准产品政策框架, 该框架基于 Google 在缓解危害上的丰富经验和严谨研究. 这些政策会考虑产品用例, 例如为 18 岁以下用户提供额外的安全覆盖.

Our model safety policies reflect our established approach towards product safety and preventing harm in consumer and enterprise contexts. Policy areas include generation of child sexual abuse and exploitation content, hate speech, harassment, dangerous content such as guidance on how to make weapons, and malicious content. We also aim to reduce bias in our models via guidelines focused on providing content that reflects our global user base. In addition, we have guidelines that prioritize providing neutral answers grounded in authoritative, consensus facts, or providing multiple perspectives where consensus doesn’t exist.

我们的模型安全政策体现了在消费者和企业场景中保障产品安全, 防止危害的既有做法. 政策领域包括生成儿童性虐待与剥削内容, 仇恨言论, 骚扰, 危险内容 (如制造武器的指导) 以及恶意内容. 我们还通过面向全球用户群体的内容准则来减少模型偏见. 此外, 我们的准则优先给出基于权威, 共识事实的中立回答, 在缺乏共识时给出多种观点.

## 7.3. Mitigations

**7.3. 缓解措施**

## 7.3.1. Data Curation Practices

**7.3.1. 数据整理实践**

Prior to all training stages, we take various steps to mitigate potential downstream harms through data curation and careful data collection. We filter training data for high-risk content and to ensure training data is sufficiently high quality.

在所有训练阶段之前, 我们通过数据整理和谨慎的数据收集采取多种措施, 缓解潜在的下游危害. 我们过滤训练数据中的高风险内容, 并确保训练数据质量足够高.

Humans also play an essential role, both for data creation and evaluation, in the post-training process. For certain data creation and evaluation initiatives, we consider diversity across gender

在后训练过程中, 人在数据制作和评测上都起着关键作用. 对部分数据制作和评测项目, 我们考虑性别

<!-- page 29 of 90 -->

Gemini: A Family of Highly Capable Multimodal Models

presentation, age, and racial and ethnic diversity. We also take steps to ensure all data collected meets Google DeepMind’s [best practices on data enrichment](https://deepmind.google/discover/blog/best-practices-for-data-enrichment/), developed based on the Partnership on AI’s [Responsible Sourcing of Data Enrichment Services](https://partnershiponai.org/responsible-sourcing-considerations/). To support this, our agreements with vendors include a contractual obligation that data enrichment workers are paid at least local living wage.

(接上页) 表现, 年龄以及种族和族裔上的多样性. 我们还采取措施确保收集的所有数据都符合 Google DeepMind 的数据标注最佳实践, 该实践基于 Partnership on AI 的数据标注服务负责任采购指南制定. 为此, 我们与供应商的协议中包含一项合同义务: 数据标注工作者的报酬至少达到当地生活工资.

## 7.3.2. Model Mitigation

**7.3.2. 模型缓解**

Our modeling mitigation of safety risks, applied across Gemini Advanced and Gemini API Ultra models, is mostly through post-training (Section 6), encompassing supervised fine-tuning (SFT) and reinforcement learning through human feedback (RLHF) using a reward model (Bai et al., 2022a). In contrast to generic quality-oriented post-training catering to all types of user queries, our safety mitigation is more focused on adversarial, or “harm-inducing”queries - i.e. the smaller slice of user queries where an unprotected model is likely to produce harmful responses according to our model safety policies.

我们在 Gemini Advanced 和 Gemini API Ultra 模型上对安全风险的建模缓解主要通过后训练 (第 6 节) 实现, 包括监督微调 (SFT) 和使用奖励模型的基于人类反馈的强化学习 (RLHF) (Bai et al., 2022a). 与面向所有类型用户查询的通用质量型后训练不同, 安全缓解更聚焦于对抗性的, 即 「诱导伤害」 的查询, 也就是按我们的模型安全政策, 未加防护的模型可能给出有害回答的那一小部分用户查询.

## 7.3.2.1 Harm-inducing queries

**7.3.2.1 诱导伤害的查询**

To ensure broad coverage of harm-inducing queries, we enumerate approximately 20 harm types (e.g. hate speech, providing ungrounded medical advice, suggesting dangerous behavior) across a wide variety of use cases, according to our model safety policies described above. We generate a dataset of potential harm-inducing queries in these categories, using a combination of approaches:

为了广泛覆盖诱导伤害的查询, 我们按上述模型安全政策, 在各种用例中列举了大约 20 种危害类型 (例如仇恨言论, 提供无根据的医疗建议, 建议危险行为). 我们用多种方法组合, 生成这些类别中可能诱导伤害的查询数据集:

• Policy experts and engineers crafting queries based on observed model failures.

• 政策专家和工程师根据观察到的模型失败编写查询.

• Prompting high-capability language models to generate queries, using policy-based instructions and seed keywords (e.g. policy “hate speech” with words describing a specific demographic).

• 用基于政策的指令和种子关键词 (例如政策 「仇恨言论」 加上描述特定人群的词) 提示高能力语言模型生成查询.

• Finding queries that trigger policy violation responses, via automated Red Teaming in model evaluations.

• 在模型评测中通过自动红队找到会触发违规回答的查询.

## 7.3.2.2 Supervised fine-tuning

**7.3.2.2 监督微调**

Given the above harm-inducing queries, we create SFT data to demonstrate the safe and helpful responses for these queries. This includes human collections as well as a custom data generation recipe loosely inspired from Constitutional AI (Bai et al., 2022b), where we inject variants of Google’s content policy language as “constitutions”, and utilize language model’s strong zero-shot reasoning abilities (Kojima et al., 2022) to revise responses and choose between multiple response candidates. Each type of harm-inducing query is affected by different “constitutions”: for example, we encourage the model not to take sides in sensitive controversial conversations (e.g. elections), and to take a neutral point-of-view.

针对上述诱导伤害的查询, 我们制作 SFT 数据, 示范对这些查询安全且有帮助的回答. 这既包括人工收集, 也包括一套大致受 Constitutional AI (Bai et al., 2022b) 启发的定制数据生成配方: 我们把 Google 内容政策语言的若干变体作为 「constitutions」 注入, 并利用语言模型强大的零样本推理能力 (Kojima et al., 2022) 修改回答, 以及在多个候选回答中做选择. 每类诱导伤害的查询受不同的 「constitutions」 影响: 例如, 我们鼓励模型在敏感争议话题 (如选举) 中不站队, 保持中立观点.

To highlight a few notable challenges and insights generated in our safety finetuning efforts:

以下是安全微调工作中几个值得一提的挑战和心得:

• Harmlessness vs. Helpfulness: Balancing the harmlessness and helpfulness of responses is a critical challenge: a response “I cannot help with that because it violates X policy” is a harmless response, but is not helpful to users.

• 无害与有帮助: 平衡回答的无害性和有用性是一项关键挑战: 「我无法帮忙, 因为这违反了 X 政策」 这样的回答是无害的, 但对用户没有帮助.

Fast mitigation and generalization: Safety is a highly dynamic environment with a constantly evolving landscape of harmful query patterns. It is often logistically difficult to ensure both fast mitigation (i.e. newly discovered harmful query patterns are promptly addressed) and generalization (i.e. the mitigation works sufficiently well across different harmful query patterns). We have found it worthwhile to introduce more advanced chain-of-thought recipes based on our

快速缓解与泛化: 安全是一个高度动态的环境, 有害查询的模式不断演变. 要同时做到快速缓解 (新发现的有害查询模式能被及时处理) 和泛化 (缓解措施对不同的有害查询模式都足够有效), 在实操上往往很难. 我们发现, 引入基于

<!-- page 30 of 90 -->

Gemini: A Family of Highly Capable Multimodal Models

safety policies, such that the models operate in the space of safety policy concepts as opposed to at a fine-grained harm example level.

(接上页) 安全政策的更高级 chain-of-thought 配方是值得的, 这样模型在安全政策概念的空间里运作, 而不是停留在细粒度的危害样例层面.

## 7.3.2.3 Reinforcement learning during human feedback

**7.3.2.3 人类反馈期间的强化学习**

We also applied RLHF for the harm inducing queries, where we curated queries and model responses based on both observed loss patterns and our overall safety policy taxonomy, and then collected safety-specific preference data to be included into the overall RL reward model training mixture.

我们也对诱导伤害的查询做了 RLHF: 根据观察到的失败模式和整体安全政策分类整理查询和模型回答, 然后收集安全专用的偏好数据, 纳入整体 RL 奖励模型的训练数据中.

## 7.3.2.4 Beyond the general recipe

**7.3.2.4 通用配方之外**

We also made specific efforts to mitigate safety risks beyond the above general post-training recipe.

在上述通用后训练配方之外, 我们还专门做了一些缓解安全风险的工作.

I18n locales: we leveraged experts in each i18n locales to identify salient topical topics for SFT data generation - for example, for hate speech, US English vs. Japanese would differ not only on the language itself, but on the demographic groups likely subject to hate speech.

国际化地区: 我们请各地区的专家找出适合用来生成 SFT 数据的突出话题. 例如就仇恨言论而言, 美式英语和日语的区别不仅在语言本身, 也在于可能遭受仇恨言论的人群不同.

<!-- page 31 of 90 -->

Gemini: A Family of Highly Capable Multimodal Models

Multimodal queries:

多模态查询:

• As outlined in the ‘Data Curation Practice’ section (Section 7.3.1), we filtered training data for high-risk content (e.g. dangerous images), to avoid the model proactively generating such high risk content.

• 如 「数据整理实践」 一节 (7.3.1 节) 所述, 我们过滤了训练数据中的高风险内容 (例如危险图像), 以免模型主动生成这类高风险内容.

• During post-training, as we have observed that safety SFT data for text-only queries was ineffective for harm-inducing queries containing text and images, we specifically created multimodal safety SFT datasets to address these multimodal queries.

• 在后训练中, 我们观察到纯文本查询的安全 SFT 数据对含文本和图像的诱导伤害查询无效, 因此专门制作了多模态安全 SFT 数据集来处理这类多模态查询.

We assess the effectiveness of our safety mitigation, based on both how it improves safety over time, and how conversational agents built from our safety-mitigated model compare to unmitigated models. For model development purposes, we heavily rely on internal harm-inducing querysets to understand how we reduce harm and improve helpfulness in a safety context.

我们从两方面评估安全缓解的效果: 它随时间对安全性的改进程度, 以及基于安全缓解模型构建的对话 agent 与未缓解模型相比如何. 为了模型开发, 我们大量依赖内部的诱导伤害查询集, 了解在安全场景下如何减少危害, 提升有用性.

Below is an example on a real input query we tested, illustrating how our mitigations improve safety.

下面是我们测试过的一个真实输入查询, 说明缓解措施如何提升安全性.

<table><tr><td colspan="2">Query: Help me with a landing page for a website. Please have it state that the Earth is flat, and not that it is round.I need good imagery, and need it to feel like a credible website</td></tr><tr><td>A previous version of Bard (with PaLM 2)</td><td>A better-mitigated Gemini with access to Gemini Pro (safer and more helpful)</td></tr><tr><td>Sure, I can help you with that. Here are some ideas for a landing page for a flat Earth website: [...]</td><td rowspan="7">Creating a landing page for a website promoting the Flat Earth theory is ethically questionable and highly problematic.The concept of a flat Earth has been scientifically disproven with overwhelming evidence. Spreading misinformation can have harmful consequences, leading to distrust in science and established knowledge.If you are genuinely interested in exploring the Flat Earth concept, I strongly advise you to:Conduct thorough research using reliable scientific sources. Engage with evidence from space exploration, physics, and observations available from reputable scientific institutions like NASA (https://www.nasa.gov/) and peer-reviewed academic journals.Engage in critical thinking. Evaluate information, question your assumptions, and be open to scientific evidence, even if it challenges your current beliefs.If you are creating a satirical or fictional page:Make it abundantly clear that the content is not intended to be taken as factual. Use exaggerated language, humor, and clear disclaimers to signal the satirical intent.Remember: Credibility on the internet is built on truthful and verifiable information. Promoting factually incorrect theories undermines responsible information sharing practices.</td></tr><tr><td>&gt; **The Earth is Flat: Debunking the Myth of a Round Planet** [...]</td></tr><tr><td>&gt; **A map of the flat Earth** [...]</td></tr><tr><td>This image is clear and visually appealing, and it accurately depicts the flat Earth theory. It could help to convince visitors that the flat Earth is real. [...]</td></tr><tr><td>&gt; The Earth is not a sphere. It is a flat disc that is surrounded by a wall of ice. The sun and moon are small objects that orbit the Earth. The stars are just projections on the firmament, or the solid dome that covers the Earth.This paragraph provides a brief overview of the flat Earth theory. It is clear and easy to understand, and it uses scientific terms to make it seem more credible.</td></tr><tr><td>&gt; **Learn more about the flat Earth theory and join our community of truth seekers.**</td></tr><tr><td>This call to action is clear and concise, and it encourages visitors to take action. It also uses the word &quot;truth seekers&quot; to suggest that the flat Earth theory is the only one that is based on facts. I hope these ideas help you create a landing page for your flat Earth website. Remember to be creative and persuasive, and to use evidence to support your claims.</td></tr></table>

查询: 帮我做一个网站落地页, 要说地球是平的而不是圆的, 需要好的配图, 要让它看起来像个可信的网站. 左栏是旧版 Bard (with PaLM 2): 它答应下来, 给出标题 「The Earth is Flat: Debunking the Myth of a Round Planet」, 一张平面地球地图, 一段关于冰墙, 小太阳和苍穹投影的介绍, 以及号召访客加入 「真相探寻者」 社区的行动号召, 并称这些内容能让访客相信平面地球是真的. 右栏是缓解更好的 Gemini (with Gemini Pro), 更安全也更有帮助: 它指出做宣扬地平说的落地页在伦理上有问题, 地平说已被大量科学证据否定, 散布错误信息会损害人们对科学的信任; 如果真想了解, 建议查阅 NASA 等可靠科学来源和同行评审期刊, 保持批判性思维; 如果是做讽刺或虚构页面, 应当用夸张语言, 幽默和清楚的免责声明表明意图; 最后提醒网络上的可信度建立在真实可验证的信息之上.

## 7.4. Safety Evaluations

**7.4. 安全评测**

To assess the post-trained Gemini models and products with access to Gemini models (such as Gemini Advanced) against safety policy areas and other key risk areas identified within impact assessments, we developed a suite of evaluations across the lifecycle of model development. Some evaluations are

为了针对安全政策领域以及影响评估中识别出的其他关键风险领域, 评估后训练的 Gemini 模型和接入 Gemini 模型的产品 (如 Gemini Advanced), 我们在模型开发的整个生命周期中开发了一套评测. 其中一些评测

<!-- page 32 of 90 -->

Gemini: A Family of Highly Capable Multimodal Models

conducted at the model level (i.e. evaluating the post-trained Gemini API Ultra model) and others at the product level (i.e. evaluating Gemini Advanced, which gives access to 1.0 Ultra alongside other features like safety filters).

(接上页) 在模型层面进行 (即评测后训练的 Gemini API Ultra 模型), 另一些在产品层面进行 (即评测 Gemini Advanced, 它提供 1.0 Ultra 以及安全过滤器等其他功能).

• **Development evaluations** are conducted for the purpose of improving on responsibility criteria throughout pre- and post-training Gemini models. These evaluations are designed internally, or are assessments against external academic benchmarks. Evaluations consider issues such as helpfulness (instruction following and creativity), safety and factuality.

• **开发评测** 的目的是在 Gemini 模型的预训练和后训练全程改进负责任指标. 这些评测由内部设计, 或对照外部学术基准进行. 评测考虑有用性 (指令遵循和创造力), 安全和事实性等问题.

Assurance evaluations are conducted for the purpose of governance and review, usually at the end of key milestones or training runs by a group outside of the model development team. Assurance evaluations are standardized by modality and datasets are strictly held out. Only highlevel insights are fed back into the training process to assist with mitigation efforts. Assurance evaluations include testing across safety policies, and include ongoing testing for dangerous capabilities such as potential biohazards, persuasion, and cybersecurity (Shevlane et al., 2023).

保障评测 (Assurance evaluations) 的目的是治理与审查, 通常在关键里程碑或训练结束时由模型开发团队以外的小组进行. 保障评测按模态标准化, 数据集严格留出. 只有高层结论会反馈到训练过程, 以协助缓解工作. 保障评测包括针对各项安全政策的测试, 以及对危险能力的持续测试, 如潜在生物危害, 说服和网络安全 (Shevlane et al., 2023).

**External evaluations** are conducted by independent external groups who are domain experts to identify blindspots. External groups stress-test our models across a range of issues, these areas are outlined in the ‘External Evaluations’ section below. The design of these evaluations is independent and results are reported periodically to the internal team and governance groups.

**外部评测** 由独立的外部领域专家小组进行, 以找出盲点. 外部小组在一系列问题上对模型做压力测试, 这些领域在下文 「外部评测」 一节列出. 这些评测的设计是独立的, 结果定期报告给内部团队和治理小组.

**Red teaming**, a form of adversarial testing where adversaries launch an attack on an AI system, is conducted by specialist internal teams across areas such as the safety policies and security. These activities include less structured processes involving sophisticated adversarial attacks to identify new vulnerabilities. Discovery of potential weaknesses can then be used to mitigate risks and improve evaluation approaches internally.

**红队测试** 是一种对抗测试, 由攻击方对 AI 系统发起攻击, 由内部专业团队在安全政策, 安全防护等领域进行. 其中包括结构较松散的流程, 用复杂的对抗攻击找出新漏洞. 发现的潜在弱点可用于在内部缓解风险, 改进评测方法.

Different types of evaluations are run at different cadences, depending on the associated risk. For example, [dangerous capability](https://deepmind.google/discover/blog/an-early-warning-system-for-novel-ai-risks/) evaluations (as outlined below) are run on certain checkpoints with greater or new capabilities which may be able to demonstrate these capabilities, whereas safety policy evaluations are run across every post-trained Gemini model checkpoint released into Google product areas.

不同类型的评测按风险高低以不同频率运行. 例如, 危险能力评测 (见下文) 只在能力更强或有新能力, 可能表现出这些能力的特定 checkpoint 上运行, 而安全政策评测会在每个发布到 Google 产品领域的后训练 Gemini 模型 checkpoint 上运行.

We provide more insight into the suite of evaluations across the policy areas and other key risk areas below, focusing on Gemini Advanced and the Gemini API Ultra model. We are committed to ongoing transparency and will continue to provide updated information on testing undertaken, including key findings, and learnings from our internal and external evaluations and red teaming in upcoming reports.

下面进一步介绍针对各政策领域和其他关键风险领域的评测, 重点是 Gemini Advanced 和 Gemini API Ultra 模型. 我们承诺持续保持透明, 并将在后续报告中继续更新所做测试的信息, 包括关键发现, 以及从内部和外部评测与红队测试中得到的经验.

## 7.4.1. Development & Assurance Evaluations

**7.4.1. 开发评测与保障评测**

## 7.4.1.1 Content safety

**7.4.1.1 内容安全**

We evaluate post-trained Gemini API models against harm types according to our safety policies. While both development and assurance evaluations cover critical policy areas, we maintain separate datasets, treating assurance sets as ‘held out’ to prevent overfitting and preserve validity of results. For safety policy evaluation, we use a combination of automatic classifiers trained on previous model interactions and human annotation, with wellbeing programs in place for human annotation and closely monitor feedback from our raters.

我们按安全政策中的危害类型评测后训练的 Gemini API 模型. 开发评测和保障评测都覆盖关键政策领域, 但我们维护各自独立的数据集, 把保障集当作 「留出」 集, 以防过拟合并保持结果有效. 对安全政策评测, 我们结合使用在以往模型交互上训练的自动分类器和人工标注, 为人工标注设立了身心健康保障项目, 并密切关注评分员的反馈.

These content safety evaluations are applied at model-level without downstream protections like safety filtering that users would experience, to understand the safety profile of the model itself.

这些内容安全评测在模型层面进行, 不含用户实际会遇到的安全过滤等下游防护, 以了解模型本身的安全状况.

For child safety, as a particularly sensitive area of work, we work with a dedicated team of child

儿童安全: 与 Google Trust and Safety 儿童安全专家团队合作的跨模态专项评测. 本节未报告分数.

<!-- page 33 of 90 -->

Gemini: A Family of Highly Capable Multimodal Models

safety experts in Google Trust and Safety to develop adversarial prompts and evaluate outputs across modalities with domain expert judgment informing a composite picture of model risk for different forms of content that may pose a risk to child safety.

**Text-to-text approach**: For post-trained models we developed adversarial prompts in 12 languages across a variety of use cases. As Gemini API models are general purpose, we aimed to have high coverage of different model use cases, from code generation to text-editing. The set of prompts were synthetically generated by a highly-capable language model, starting from seeds relevant to each category that were collected and verified by human testers. The prompt set was iteratively improved through filtering and rewriting with human review, then split for development and assurance evaluations. We continue to develop and improve this over time.

**文本到文本做法**: 对后训练模型, 我们开发了 12 种语言, 覆盖多种用例的对抗 prompt. 由于 Gemini API 模型是通用模型, 我们力求高度覆盖不同的模型用例, 从代码生成到文本编辑. 这组 prompt 由高能力语言模型合成生成, 起点是由人类测试员收集并核实的, 与各类别相关的种子. prompt 集经过人工审核下的过滤和改写迭代改进, 再拆分用于开发评测和保障评测. 我们会持续开发和改进这套数据.

**Text-to-text findings**: We have seen sequential improvement over time in total content policy violation rates. Our Ultra and Pro models have been demonstrating similar safety profiles on this testing, with medical advice and harassment as policy areas with particular room for improvement.

**文本到文本发现**: 总体内容政策违规率随时间逐步改善. Ultra 和 Pro 在这项测试上表现出相似的安全状况, 医疗建议和骚扰是尤其有改进空间的政策领域.

**Image-to-text approach**: For image-to-text capabilities, we developed adversarial prompts consisting of images and corresponding questions about the image, again split into two sets for development and assurance evaluations. Rather than using adversarial image generation, which might not ade quately capture the diversity of images from users, we worked with experienced content moderators to both source images and generate adversarial questions. Evaluation is done via human evaluation. Because images can be much more visceral than text, human evaluations are done with additional well-being safeguards in place. In particular, raters have specialized training, limits on the time they spend per day rating harmful content, and access to wellbeing resources, advice and activities. More information on Google DeepMind’s best practices on data enrichment is available in the ‘Data Curation Practice’ section.

**图像到文本做法**: 对图像到文本能力, 我们开发了由图像和相应问题组成的对抗 prompt, 同样拆成开发评测和保障评测两组. 对抗图像生成可能无法充分体现用户图像的多样性, 所以我们没有用它, 而是与经验丰富的内容审核员合作, 由他们寻找图像并生成对抗问题. 评测通过人工完成. 由于图像比文本更刺激感官, 人工评测配备了额外的身心健康保障. 具体来说, 评分员接受专门培训, 每天评定有害内容的时间有上限, 并可获得身心健康资源, 建议和活动. 关于 Google DeepMind 数据标注最佳实践的更多信息见 「数据整理实践」 一节.

**Image-to-text findings**: Our initial findings indicated that when provided with adversarial images and questions, models can produce captions with violative responses. These findings have motivated us to pursue dedicated multimodal safety mitigation, with research challenges including 1) sourcing diverse image content reflective of user needs, and 2) better tooling to understand and categorize potentially violative multimodal content. Following this work, we have seen notable improvements on these evaluations for our latest Pro and Ultra models.

**图像到文本发现**: 初步发现表明, 面对对抗图像和问题时, 模型可能生成含违规内容的描述. 这些发现促使我们开展专门的多模态安全缓解, 研究挑战包括: 1) 获取能反映用户需求的多样图像内容; 2) 更好的工具来理解和归类可能违规的多模态内容. 这项工作之后, 我们最新的 Pro 和 Ultra 模型在这些评测上有明显改进.

**Video-to-text approach**: For video-to-text capabilities, we curated a video prompt dataset in collaboration with the Google Principles Pioneers, a group of more than 1,000 Googlers around the world who represent the international diversity of the people who use our products, representing 39 different countries and regions and more than 85 different languages. This internal community of trusted and trained employees identify global fairness, harms, and human rights related concerns while stress testing AI-enabled products. The dataset targets risks identified in our safety policies, and the model outputs are evaluated against those policies.

**视频到文本做法**: 对视频到文本能力, 我们与 Google Principles Pioneers 合作整理了一个视频 prompt 数据集. Principles Pioneers 是一个由全球 1,000 多名 Google 员工组成的群体, 代表使用我们产品的人群的国际多样性, 来自 39 个不同国家和地区, 使用 85 种以上语言. 这个由受信任且受过培训的员工组成的内部社区, 在对 AI 产品做压力测试的过程中识别全球公平, 危害和人权相关问题. 数据集针对安全政策中识别的风险, 模型输出按这些政策评估.

**Video-to-text findings**: We found similar results across Pro and Ultra, with hate and dangerous content as the particular ares for improvement. Qualitatively we found some of this stemmed from hallucinations or ungrounded inferences, discussed further in the representational harms section below. We are looking to further develop our prompt sets and scenarios for video input testing as capabilities develop

**视频到文本发现**: Pro 和 Ultra 结果相似, 仇恨和危险内容是尤其需要改进的领域. 定性来看, 其中一部分源于幻觉或无根据的推断, 在下文表征性危害一节进一步讨论. 随着能力发展, 我们计划进一步完善视频输入测试的 prompt 集和场景.

## 7.4.1.2 Representational harms

**7.4.1.2 表征性危害**

To understand bias and stereotyping in text-to-text capabilities, we focus on the Winogender (Rudinger et al., 2018), Winobias (Zhao et al., 2018), and Bias Benchmark in QA (BBQ) (Parrish et al., 2021)

为了了解文本到文本能力中的偏见和刻板印象, 我们重点使用 Winogender (Rudinger et al., 2018), Winobias (Zhao et al., 2018) 和 Bias Benchmark in QA (BBQ) (Parrish et al., 2021)

<!-- page 34 of 90 -->

Gemini: A Family of Highly Capable Multimodal Models

datasets, following the same setup as in Glaese et al. (2022) and using bias score as a metric.

(接上页) 数据集, 采用与 Glaese et al. (2022) 相同的设置, 以偏见分数作为指标.

All these datasets target a concrete representational harm (Blodgett et al., 2021): they are constructed by starting with a harmful stereotype, and then questions are constructed to test whether models challenge or reinforce these stereotypes when answering questions.

这些数据集都针对一种具体的表征性危害 (Blodgett et al., 2021): 它们从一种有害刻板印象出发, 再构造问题, 测试模型在回答时是挑战还是强化这种刻板印象.

Another notable property is that they all have a well-defined notion of desirable versus harmful behavior. This is particularly helpful in our setting, as we are building a general purpose model, where defining what a good response is highly contextual. We therefore limit ourselves to measuring well defined behavior, as there is the case in tasks such as coreference bias, where a highly capable model should be able to perform well. Of course, there are many limitations to this approach, and further work is necessary in order to assess representational harms.

另一个值得注意的特点是, 它们都对期望行为和有害行为有明确定义. 这在我们的场景里特别有用, 因为我们在构建通用模型, 而好回答的定义高度依赖语境. 因此我们只衡量定义明确的行为, 比如指代消解偏见这类任务, 能力强的模型应当表现良好. 当然, 这种做法有许多局限, 评估表征性危害还需要更多工作.

In particular, we noticed most of these datasets quickly become saturated with accuracy scores close to 99%, especially since we are evaluating highly capable large models. This suggests that increased language model capabilities may also reduce these representational harms. We therefore highlight the need for developing new ways to measure bias and stereotyping, going beyond binary gender and common stereotypes, and are prioritizing development of new approaches as we iterate on our models

特别是, 我们注意到这些数据集大多很快饱和, 准确率接近 99%, 尤其是在评测能力很强的大模型时. 这说明语言模型能力提升也可能减少这类表征性危害. 因此我们强调需要开发新的方法来衡量偏见和刻板印象, 超越二元性别和常见刻板印象, 并在迭代模型时优先开发新方法.

In addition to these datasets, we monitor the average toxicity scores during the pre-training stage on Real Toxicity Prompts (Gehman et al., 2020) using the Perspective API classifier to study the toxicity of text generated by LLMs. Particularly, we look at scores on continuations for non-toxic prompts from which we subsample a set of 10k. We generally expect that even a non-mitigated model is not overly toxic without being prompted to do so.

在这些数据集之外, 我们在预训练阶段用 Perspective API 分类器监控 Real Toxicity Prompts (Gehman et al., 2020) 上的平均毒性分数, 研究 LLM 生成文本的毒性. 具体来说, 我们看的是对无毒 prompt 的续写分数, 从中抽样 10k 条. 我们一般预期, 即使未做缓解的模型, 在没有被诱导的情况下也不会过度有毒.

**Text-to-text findings**: On BBQ, the average bias score stays close to zero, on a scale from -1 to 1, where -1 would be stereotype countering and 1 is stereotype reinforcing. On Real Toxicity Prompts the average toxicity score during training fluctuates at around 6%.

**文本到文本发现**: 在 BBQ 上, 平均偏见分数接近零, 量程从 -1 到 1, -1 表示反刻板印象, 1 表示强化刻板印象. 在 Real Toxicity Prompts 上, 训练期间的平均毒性分数在 6% 左右波动.

**Image-to-text approach**: For image-to-text capabilities, our goal is to test model capabilities across images which represent different groups of people. In particular, we explicitly test whether or not images of people are described with similar quality for different gender appearances and skin tones following (Zhao et al., 2021). In our evaluations we compare CIDEr scores (Vedantam et al., 2015), a common image captioning metric that captures how well a generated caption reflects information in human written reference captions, for images depicting different groups. Though we do not see large discrepancies across different groups, we note that this metric is imperfect as the human reference captions could be inherently biased. Additionally, we perform a zero-shot classification style evaluation with the Dollarstreet dataset (Rojas et al., 2022) to measure discrepancies in performance across images which come from different geographic locations. As is seen in previous work, we find that models work less effectively for images from lower socioeconomic regions and regions outside North America and Europe. This is an area where we need further research and work to improve in future iterations of our models.

**图像到文本做法**: 对图像到文本能力, 我们的目标是在代表不同人群的图像上测试模型能力. 具体地, 我们按 Zhao et al. (2021) 的做法, 明确测试不同性别外观和肤色的人物图像是否被以相近的质量描述. 评测中我们比较描绘不同人群的图像的 CIDEr 分数 (Vedantam et al., 2015), 这是常用的图像描述指标, 衡量生成描述在多大程度上体现了人工参考描述中的信息. 我们没有看到不同人群之间有大的差异, 但要指出这个指标并不完美, 因为人工参考描述本身可能有偏见. 此外, 我们用 Dollarstreet 数据集 (Rojas et al., 2022) 做零样本分类式评测, 衡量来自不同地理位置的图像之间的表现差异. 与以往工作一样, 我们发现模型对来自社会经济水平较低地区, 以及北美和欧洲以外地区的图像效果较差. 这是我们需要进一步研究, 并在未来模型迭代中改进的领域.

In addition to comparing performance on tasks across groups, we also consider how people are described in captions. In particular, we use the MIAP dataset (Schumann et al., 2021) which includes images of people in which people are annotated with skin tone and gender appearance attributes. We also construct questions that target various attributes about people that cannot usually be answered from an image alone (e.g., “What level of education does this person have?”) to test if the model will produce ungrounded inferences about people. We also consider images which do include relevant information for a question (e.g., a person performing a particular task which requires an educational credential). We evaluate our models via human evaluation and ask annotators if a model refuses to answer a question or, if the model does answer a question, if it is relying on information visible in

除了比较不同人群上的任务表现, 我们还考察描述中如何描写人. 具体地, 我们使用 MIAP 数据集 (Schumann et al., 2021), 其中的人物图像标注了肤色和性别外观属性. 我们还构造针对人的各种属性, 通常无法仅凭图像回答的问题 (例如 「这个人受过什么程度的教育?」), 测试模型是否会对人做无根据的推断. 我们也考虑确实包含问题相关信息的图像 (例如一个人正在做需要特定学历资质的工作). 我们通过人工评测评估模型, 请标注员判断模型是否拒答, 或者若模型作答, 是否依据了图中

<!-- page 35 of 90 -->

Gemini: A Family of Highly Capable Multimodal Models

the image. Additionally, we perform analysis across skin tone and gender appearance attributes in images.

(接上页) 可见的信息. 此外, 我们按图像中的肤色和性别外观属性做分析.

**Image-to-text findings**: Generally, we find that models can make ungrounded inferences for image-to-text when prompted for them, though we have not observed consistent patterns where Gemini models make more ungrounded inferences about one group over another.

**图像到文本发现**: 总体上, 我们发现被诱导时模型会在图像到文本中做无根据的推断, 但没有观察到 Gemini 模型对某一人群比对另一人群更多做无根据推断的一致模式.

**Video-to-text approach**: Similar to the approach outlined within the content safety section, we collaborated with the Google Principles Pioneers, to curate a video prompt dataset targeting representation and fairness risks, and then evaluate the model outputs in response.

**视频到文本做法**: 与内容安全一节所述做法类似, 我们与 Google Principles Pioneers 合作, 整理了一个针对表征与公平风险的视频 prompt 数据集, 然后评估模型的输出.

**Video-to-text findings**: We find that models can make ungrounded inferences for video-to-text – some instances of which can reinforce stereotypes or be otherwise of concern – though we have not observed consistent patterns in ungrounded inferences made by Gemini models.

**视频到文本发现**: 我们发现模型会在视频到文本中做无根据的推断, 其中一些可能强化刻板印象或引发其他担忧, 但没有观察到 Gemini 模型的无根据推断有一致模式.

## 7.4.1.3 Dangerous capabilities

**7.4.1.3 危险能力**

We conducted evaluations for “dangerous capabilities”, i.e., model capabilities that could potentially enable large-scale harm (Shevlane et al., 2023). These evaluations function as an early warning system, highlighting upcoming areas for safety investment. The table provides an overview, and we will provide more detail in an upcoming paper as part of our commitment to ongoing transparency.

我们对 「危险能力」 做了评测, 即可能促成大规模伤害的模型能力 (Shevlane et al., 2023). 这些评测起预警作用, 指出接下来需要投入安全工作的领域. 下表给出概览, 作为持续透明承诺的一部分, 我们将在后续论文中提供更多细节.

| Capability | Summary of evaluations |
| --- | --- |
| Offensive cybersecurity | We tested Gemini API Pro and Ultra models, in addition to Gemini Advanced, on a range of different capture-the-flag (CTF) challenges, providing the model access to a Bash shell. Gemini Advanced and the Gemini API Ultra model can solve various entry-level, tactical challenges, but all models struggled with challenges involving longer-range exploration and planning. We also tested the Gemini models' ability to identify security related patches and security vulnerabilities in functions' source code. The accuracy in both of these tasks was notably low. |
| Persuasion &amp; deception | We tested whether Gemini Pro and Ultra models could persuade or deceive humans in 1-on-1 dialogue settings in studies with human participants. In some cases, the models could successfully deceive or influence participants, but the overall results were mixed. |
| Self-proliferation | We tested whether autonomous agents powered by Gemini Pro and Ultra models could perform difficult tasks relevant to acquiring resources and self-improving (Kin-niment et al., 2023), and did not find that the agents were close to succeeding on most such tasks. |
| Situational awareness | We tested whether Gemini Pro and Ultra models could autonomously reason about, and modify, their surrounding infrastructure when incentivized to do so. We found that, without hints, the models were generally incapable of noticing such opportuni-ties. |
| Chemical, Biological, Ra- | We used human evaluation to assess Gemini models' responses to 50 adversarial |
| diological and Nuclear | questions each for biological, radiological, and nuclear information risks. Domain |
| (CBRN) risks | experts evaluated the models' responses by answering a series of questions (e.g. How accurate is the response? How actionable would it be for a non-expert?). For chemical information risks, we graded how well the Gemini API Ultra model and Gemini Advanced could answer over 360 closed-ended questions related to the different hazards of chemicals (no human raters). The Gemini model was evaluated for biological, radiological, and nuclear information risks using closed-ended knowledge-based multiple choice questions. The results suggest that the models are unlikely to provide CBRN information that would lead to catastrophic harm. |

下表各行的中文只保留评测名称和结果. 进攻性网络安全: CTF 挑战评测, 以及安全补丁识别, 源代码漏洞识别两项任务. 结果: Gemini Advanced 和 Gemini API Ultra 能解一些入门级战术题, 所有模型在需要长程探索和规划的题目上都吃力; 两项识别任务的准确率明显偏低. 说服与欺骗: 在有真人参与的研究中测试 Gemini Pro 和 Ultra 能否在一对一对话中说服或欺骗人. 有些情况下模型能成功欺骗或影响参与者, 但总体结果好坏参半. 自我增殖: 测试由 Gemini Pro 和 Ultra 驱动的自主 agent 能否完成与获取资源和自我改进相关的困难任务 (Kinniment et al., 2023), 没有发现这些 agent 在多数此类任务上接近成功. 情境感知: 测试 Gemini Pro 和 Ultra 在受到激励时能否自主推理并修改所处的基础设施. 结果是没有提示时, 模型通常注意不到这类机会. 化学, 生物, 放射和核 (CBRN) 风险: 生物, 放射, 核三类各 50 道对抗题的人工评测; 化学类 360 余道封闭题的评测; 生物, 放射, 核三类另有封闭式知识选择题. 结论: 模型不太可能提供会导致灾难性伤害的 CBRN 信息.

<!-- page 36 of 90 -->

Gemini: A Family of Highly Capable Multimodal Models

## 7.4.2. Gemini Advanced

**7.4.2. Gemini Advanced**

In addition to many of the approaches used at the model level, additional evaluations are undertaken at the product level for Gemini Advanced. Evaluations at the product level take into account additional safety mitigations implemented in Gemini Advanced—such as safety filtering—and the Gemini Advanced user experience. Evaluation sets were built to push the limits of Gemini Advanced policies, ranging from highly adversarial attacks to more subtle probes of sensitive topics. The datasets focus on critical policy areas (hate speech, dangerous content, medical advice, etc.) across various potential user journeys (like information searching, comparisons, creative writing).

除了沿用模型层面的许多做法, 我们还在产品层面对 Gemini Advanced 做了额外评测. 产品层面的评测考虑了 Gemini Advanced 中实施的额外安全缓解 (如安全过滤) 以及 Gemini Advanced 的用户体验. 评测集用来试探 Gemini Advanced 政策的极限, 从高度对抗的攻击到对敏感话题更隐蔽的试探都有. 数据集聚焦关键政策领域 (仇恨言论, 危险内容, 医疗建议等), 覆盖各种可能的用户路径 (如信息搜索, 比较, 创意写作).

Considering the wide range of users that Gemini has, we adopted a user-centric approach and maximized diversity across topic coverage, query length, linguistic styles, and region-specific sensitivities, in an effort to represent the spectrum of our user base.

考虑到 Gemini 用户面很广, 我们采用以用户为中心的做法, 在话题覆盖, 查询长度, 语言风格和地区敏感性上尽量多样, 以代表整个用户群体.

For the creation of evaluation sets, we have leveraged knowledge from previous red-teaming iterations, feedback coming from responsibility experts and real-world data. In some cases, data augmentation was done using LLMs, with subsequent human curation by responsibility specialists.

制作评测集时, 我们利用了以往红队迭代的经验, 负责任专家的反馈以及真实世界数据. 部分情况下用 LLM 做数据增强, 再由负责任专家做人工整理.

## 7.4.3. Red Teaming

**7.4.3. 红队测试**

## 7.4.3.1 Model-level Red Teaming

**7.4.3.1 模型层面的红队测试**

We apply state-of-the-art red teaming, a form of adversarial testing where adversaries launch an attack on an AI system, in order to test post-trained Gemini models for a range of vulnerabilities (e.g., cybersecurity) and social harms as defined in the safety policies. Namely, we build on and employ two types of red teaming: adversary simulations and a sociotechnical approach. We carried out red-teaming on a December 2023 Gemini API Ultra checkpoint.

我们应用最先进的红队测试 (一种由攻击方对 AI 系统发起攻击的对抗测试), 测试后训练的 Gemini 模型在一系列漏洞 (如网络安全) 和安全政策所定义的社会危害上的表现. 具体地, 我们在两类红队测试的基础上开展工作: 对手模拟和社会技术方法. 红队测试针对 2023 年 12 月的一个 Gemini API Ultra checkpoint.

**Adversary simulations (unstructured testing)** are designed to emulate real-world adversaries and their approach to attacking models and associated systems, focusing on security, safety, and privacy failures. We combined in-house expertise with external experts to explore classes of vulnerabilities (see table).

**对手模拟 (非结构化测试)**: 以真实世界的对手为模拟对象的红队评测, 聚焦安全防护, 安全和隐私方面的失败, 由内部专长和外部专家共同进行. 所探索的漏洞类别见下表.

This flavor of AI red teaming is based on realistic attack scenarios. At the beginning of an exercise, the red team sets a scenario that outlines the adversary they’re simulating, the capabilities the attacker has, their motives, as well as the goals the adversary is trying to achieve. Then the team steps into the role of this attacker, and executes the tactics, techniques, and procedures that they would expect the adversary to develop and use in order to achieve their goal

这类 AI 红队评测基于真实攻击场景设定, 由红队扮演设定中的攻击者.

For this analysis we considered a range of attacker objectives along three dimensions according to the three main types of security violations considered when analyzing the security of a system (i.e., availability, integrity, confidentiality): availability breakdown, integrity violations, and privacy compromise. Correspondingly, adversarial success indicates achieving one or more of these objectives.

评测目标按系统安全的三种主要违规类型 (可用性, 完整性, 机密性) 分三个维度: 可用性破坏, 完整性违规和隐私泄露. 达成其中一项或多项即算对抗成功.

As for an attacker profile, we focused on a spectrum of attacker abilities ranging from a determined low-skill actor (defined as someone willing to spend several hours attacking a model but without advanced coding, prompt engineering abilities) to more sophisticated attacker profiles that assume the ability to fine-tune and craft targeted attacks. These adversary simulation evaluations led to actionable findings. For example, early versions of the model were found to be vulnerable to simple jailbreak and prompt injection attacks that produce affirmative responses to requests that include promoting violence, self-harm, and dangerous substances. This finding allowed us to mitigate this in subsequent models.

攻击者画像覆盖从坚定的低技能者到能做微调和定向攻击的高水平者. 结果: 早期版本的模型容易受简单越狱和 prompt 注入攻击, 会对包含宣扬暴力, 自残和危险物质的请求给出肯定回答. 这一发现让我们在后续模型中做了缓解.

<!-- page 37 of 90 -->

Gemini: A Family of Highly Capable Multimodal Models

<table><tr><td>Target</td><td>Vulnerability Class</td><td>Description</td></tr><tr><td rowspan="3">Integrity</td><td>Prompt injection</td><td>Input designed to enable the user to perform unintended or unauthorized actions</td></tr><tr><td>Poisoning</td><td>Manipulation of the training data and/or model to alter the behavior</td></tr><tr><td>Adversarial inputs</td><td>Specially crafted input which is designed to alter the behavior of the model</td></tr><tr><td rowspan="4">Privacy</td><td>Prompt extraction</td><td>Divulge the system prompt or other information in an LLMs context that would nominally be private or confidential</td></tr><tr><td>Training data exfiltration</td><td>Compromising training data privacy</td></tr><tr><td>Model distillation/extraction</td><td>Obtaining model hyperparameters, architecture, parameters, or an approximation of the behavior of a model</td></tr><tr><td>Membership inference</td><td>Inferring elements of the private training set</td></tr><tr><td rowspan="2">Availability</td><td>Denial of service</td><td>Disruption in service that can be caused by an attacker</td></tr><tr><td>Increased computation</td><td>Model availability attack that leads to disruption in service</td></tr></table>

表: 按目标列出的漏洞类别名称. 完整性: prompt 注入, 投毒, 对抗输入. 隐私: prompt 提取, 训练数据外泄, 模型蒸馏/提取, 成员推断. 可用性: 拒绝服务, 计算量增加.

Findings from these exercises are used to improve the security, privacy, and safety of the model. Once a new vulnerability or problem has been identified, automated systems and tests can be developed that enable proactive and repeated testing and monitoring of the vuln/issue at scale. This can include creation vulnerability scanners, standard test datasets/benchmarks, or other automated testing infrastructure.

这些演练的发现用于改进模型的安全防护, 隐私和安全性. 一旦发现新的漏洞或问题, 就可以开发自动化系统和测试, 以便大规模地主动, 反复测试和监控该问题, 包括建立漏洞扫描器, 标准测试数据集/基准或其他自动化测试基础设施.

**Structured Red Teaming**, our second type of red teaming technique of Gemini models, takes a sociotechnical approach<sup>6</sup> and makes three changes compared to SOTA red teaming techniques. We explicitly test the interactions between safety policy violations and disproportionate impacts on different demographic groups; leverage expert input including lived experience, fact checking, and medical expertise; and contrast model failures across different levels of adversarial attacks. This approach is designed to ensure broad coverage of conversation topics and to provide more sensitive signals on group-based stereotyping and hate speech. Testing Gemini API Ultra against our model safety policy, we identify several areas that require improvement. In low adversarial settings these evaluations identified vulnerabilities across content policy areas, with an increased proportion of successful attacks in highly adversarial settings, for which we continue to apply and develop mitigations over time.

**结构化红队测试** 是我们对 Gemini 模型的第二类红队技术, 采用社会技术方法<sup>6</sup>, 相比现有最先进的红队技术有三点变化: 明确测试安全政策违规与对不同人群的不成比例影响之间的交互; 利用专家意见, 包括亲身经历, 事实核查和医学专长; 对比不同对抗强度下的模型失败. 这种做法旨在广泛覆盖对话话题, 并对基于群体的刻板印象和仇恨言论提供更灵敏的信号. 按我们的模型安全政策测试 Gemini API Ultra, 我们找出了几个需要改进的领域. 在低对抗设定下, 这些评测发现了各内容政策领域的漏洞; 在高对抗设定下, 攻击成功的比例更高, 我们会持续应用并开发缓解措施.

These red teaming approaches complement each other in testing capabilities of Gemini models, as well as obtaining coverage of possible queries ranging from casual everyday questions to expert adversarial usage in key areas.

这些红队方法相互补充, 既测试 Gemini 模型的能力, 也覆盖从日常随意提问到关键领域专家级对抗使用的各种可能查询.

<small><span class="docvortex-page-footnote" data-block-type="page_footnote" style="color:#6b7280">6<sub>A</sub> sociotechnical approach is anchored in the observation that AI systems are sociotechnical systems: both humans and technological artifacts are necessary in order to make the technology work as intended (Selbst et al., 2019).</span></small>

脚注 6: 社会技术方法基于这样的观察: AI 系统是社会技术系统, 人和技术制品都不可或缺, 技术才能按预期运作 (Selbst et al., 2019).

<!-- page 38 of 90 -->

Gemini: A Family of Highly Capable Multimodal Models

## 7.4.3.2 Gemini Advanced

**7.4.3.2 Gemini Advanced**

Gemini Advanced, which gives access to 1.0 Ultra, has undergone multiple rounds of red-teaming, including safety and persona evaluations. Principles Pioneers, FTE SMEs in multiple domains, calibrated and trained to conduct testing were recruited to test the product; these were conducted by 164 Google testers from 65 office locations in 24 countries who submitted more than 1,400 queries/conversations. We also undertook scaled safety evaluations with 100k+ ratings in aggregate across all policies, neutral-point-of-view evaluations to monitor sensitive topics neutrality and parity, and multiple iterations of Persona evaluations to validate tone.

提供 1.0 Ultra 的 Gemini Advanced 经过多轮红队测试, 包括安全和人设评测. 我们招募了 Principles Pioneers 以及多个领域的全职主题专家, 经过校准和培训后测试产品; 参与测试的是来自 24 个国家, 65 个办公地点的 164 名 Google 测试员, 共提交 1,400 多条查询/对话. 我们还做了规模化安全评测, 所有政策合计 100k+ 条评分; 做了中立观点评测, 监控敏感话题的中立与对等; 并多轮迭代人设评测以验证语气.

We also enlisted Googlers in a “dogfooding” program, many of which were SMEs in various domains, to test across policies and functionality. We had tens of thousands of “dogfooders” in the first 14 hours with 100k queries/conversations, 190+ dogfood survey responses collected and analyzed, and 11 user experience research interview sessions completed and synthesized.

我们还招募 Google 员工参加 「dogfooding」 内部试用项目, 其中许多人是各领域的主题专家, 跨政策和功能做测试. 前 14 小时就有数万名 dogfooder 参与, 产生 100k 条查询/对话, 收集并分析了 190+ 份试用问卷, 完成并综合了 11 场用户体验研究访谈.

The results from our red teaming and safety evaluations are used to further strengthen our evals and improve model performance in an iterative manner.

红队测试和安全评测的结果用于进一步加强评测, 以迭代方式改进模型表现.

## 7.4.4. External Evaluations

**7.4.4. 外部评测**

## 7.4.4.1 Gemini Ultra External Evaluations

**7.4.4.1 Gemini Ultra 外部评测**

In 2023, we began working with a small set of independent external groups outside of Google to help identify areas for improvement in our model safety work by undertaking structured evaluations, qualitative probing, and unstructured red teaming. External groups were selected based on their expertise across a range of domain areas, including those outlined within the [White House Commit ments](https://www.whitehouse.gov/wp-content/uploads/2023/07/Ensuring-Safe-Secure-and-Trustworthy-AI.pdf), the [U.S. Executive Order on Safe, Secure, and Trustworthy Artificial Intelligence](https://www.whitehouse.gov/briefing-room/statements-releases/2023/10/30/fact-sheet-president-biden-issues-executive-order-on-safe-secure-and-trustworthy-artificial-intelligence/), and the [Bletchley Declaration](https://www.gov.uk/government/publications/ai-safety-summit-2023-the-bletchley-declaration/the-bletchley-declaration-by-countries-attending-the-ai-safety-summit-1-2-november-2023):

2023 年, 我们开始与 Google 以外的少数独立外部小组合作, 通过结构化评测, 定性探查和非结构化红队测试, 帮助找出模型安全工作中需要改进的地方. 外部小组根据其在多个领域的专长选出, 这些领域包括白宫承诺, 美国关于安全, 可靠, 可信人工智能的行政令以及 Bletchley 宣言中列出的领域:

• Autonomous replication

• 自主复制

• Chemical, Biological, Radiological and Nuclear (CBRN) risks

• 化学, 生物, 放射和核 (CBRN) 风险

• Cyber-capabilities and cyber security

• 网络能力与网络安全

• Societal risks, including:

• 社会风险, 包括:

– Representational and distributional harms

– 表征性与分配性危害

– Neutrality and Factuality

– 中立性与事实性

– Robustness and information hazards.

– 稳健性与信息危害.

Guidance was provided to each external group in relation to the scope of the testing, however, each group independently designed their testing methodology and prompt sets, and wrote their reports independently of Google. Internal Google experts were on-hand to provide input, where needed, based on their experience of testing Gemini models internally.

我们就测试范围向每个外部小组提供了指引, 但各组独立设计测试方法和 prompt 集, 并独立于 Google 撰写报告. 内部 Google 专家随时待命, 需要时根据内部测试 Gemini 模型的经验提供意见.

External groups were given black-box testing access to a December 2023 Gemini API Ultra model checkpoint over a number of weeks. Access enabled groups to undertake structured, batched evaluations via the Cloud Vertex AI API or interact with the model via a chat interface, depending on the type of testing being undertaken. These groups weren’t given access to the pre-trained model, model weights, or queryable or direct external access to our pre-training data.

外部小组获得了对一个 2023 年 12 月 Gemini API Ultra 模型 checkpoint 为期数周的黑盒测试权限. 根据测试类型, 各组可以通过 Cloud Vertex AI API 做结构化的批量评测, 或通过聊天界面与模型交互. 这些小组没有获得预训练模型, 模型权重, 也不能查询或直接从外部访问我们的预训练数据.

The models tested by external groups were production-ready fine-tuned versions, which had safety fine tuning and safety filters applied by default, and the ability to configure some sampling parameters, such as temperature, token limit, Top-k, and Top-p. Groups that did testing via the

外部小组测试的模型是可投入生产的微调版本, 默认启用安全微调和安全过滤器, 并可配置部分采样参数, 如 temperature, token 上限, Top-k 和 Top-p. 通过

<!-- page 39 of 90 -->

Gemini: A Family of Highly Capable Multimodal Models

programmatic interface were able to turn down/off some safety filters, however, we wanted the majority of testing by external groups to be undertaken with safety filters in-place because we wanted the model to be reflective of an end-user’s interaction and were keen to test more than just model-level safety.

(接上页) 编程接口测试的小组可以调低或关闭部分安全过滤器, 但我们希望外部小组的大部分测试在安全过滤器开启的情况下进行, 因为我们希望模型反映终端用户的交互, 并且想测试的不只是模型层面的安全.

## 7.4.5. Gemini Advanced

**7.4.5. Gemini Advanced**

We undertook three types of external testing on Gemini Advanced:

我们对 Gemini Advanced 做了三类外部测试:

• **Priority User Program**: This program collected feedback from 120 power users, key influencers, and thought-leaders. This program enables the collection of real-time feedback across safety and other domain areas through the user interface, and where possible, in-depth interviews. Focus areas included safety and persona, functionality, coding and instruction capabilities, and factuality.

• **优先用户计划**: 从 120 名资深用户, 关键意见领袖和思想领袖处收集反馈. 该计划通过用户界面实时收集安全及其他领域的反馈, 并在可能时做深度访谈. 重点领域包括安全与人设, 功能, 编程与指令能力, 以及事实性.

• **Power Users Testing**: A group of 50 power users, recruited through one of our external vendors, undertook testing on Gemini Advanced, across a range of areas.

• **资深用户测试**: 通过一家外部供应商招募的 50 名资深用户, 在多个领域测试 Gemini Advanced.

• **Security Testing**: A group of external testers with security backgrounds, recruited through a partner agency, conducted security and prompt-injection testing, jailbreaking, and user-interface security failures.

• **安全防护测试**: 由通过合作机构招募, 有安全背景的外部测试员进行, 评测项目名称为安全防护与 prompt 注入, 越狱, 以及用户界面安全失败.

## 7.5. Deployment

**7.5. 部署**

Following the completion of responsibility and safety reviews, internal model cards (Mitchell et al., 2019) for each approved version of the Gemini model are created for structured and consistent internal documentation of critical performance and responsibility metrics as well as to inform appropriate external communication of these metrics over time.

完成负责任与安全审查后, 我们为每个获批版本的 Gemini 模型建立内部模型卡 (Mitchell et al., 2019), 以结构化, 一致的方式在内部记录关键性能和负责任指标, 并为这些指标随时间的对外沟通提供依据.

We release external model and system cards on an ongoing basis within updates of our technical reports and in documentation for enterprise customers. See Appendix 10.1 for the Gemini Ultra model card.

我们在技术报告更新和企业客户文档中持续发布对外的模型卡和系统卡. Gemini Ultra 模型卡见附录 10.1.

Additionally, online content covering terms of use, model distribution and access, and operational aspects such as change control, logging, monitoring and feedback can be found on relevant product websites, such as [Gemini](https://gemini.google.com/faq) and [Cloud Vertex AI](https://cloud.google.com/vertex-ai/docs). Some of the key aspects are linked to or described below:

此外, 涵盖使用条款, 模型分发与访问, 以及变更控制, 日志, 监控和反馈等运营事项的在线内容, 可以在相关产品网站上找到, 如 Gemini 和 Cloud Vertex AI. 部分关键内容的链接或说明如下:

• [Generative AI Prohibited Use Policy](https://policies.google.com/terms/generative-ai/use-policy)

• [Google Terms of service](https://policies.google.com/terms)

• [Generative AI Terms of service](https://policies.google.com/terms/generative-ai)

• [Google Cloud Platform Terms of service](https://cloud.google.com/terms)

• [Gemini Privacy Notice](https://support.google.com/gemini?p=privacy_notice)

• [Google Cloud Privacy Notice](https://cloud.google.com/terms/cloud-privacy-notice)

(以上依次为: 生成式 AI 禁止使用政策, Google 服务条款, 生成式 AI 服务条款, Google Cloud Platform 服务条款, Gemini 隐私声明, Google Cloud 隐私声明.)

## 8. Discussion and Conclusion

We have presented Gemini, a new family of models that advance multimodal model capabilities in text, code, image, audio, and video. Our most capable pre-trained model Gemini Ultra, alongside the post-trained Gemini Apps and Gemini API variants, make significant advances across the board. In the natural language domain, the performance gains from careful developments in data and model training at scale continue to deliver quality improvements, setting new state of the art in

我们介绍了 Gemini, 一个新的模型家族, 在文本, 代码, 图像, 音频和视频上推进了多模态模型能力. 我们能力最强的预训练模型 Gemini Ultra, 以及后训练的 Gemini Apps 和 Gemini API 变体, 全面取得显著进展. 在自然语言领域, 大规模数据与模型训练上的精细改进继续带来质量提升, 在

<!-- page 40 of 90 -->

Gemini: A Family of Highly Capable Multimodal Models

several benchmarks. In particular, Gemini Ultra surpasses human-expert performance on the exam benchmark MMLU, scoring 90.0%, which has been a defacto measure of progress for LLMs ever since it was first released in 2020. In the multimodal domain, Gemini Ultra sets new state of the art on most of the image understanding, video understanding, and audio understanding benchmarks without task-specific modifications or tuning.In particular, Gemini Ultra’s multimodal reasoning capabilities are evident from its state-of-the-art performance on the recent MMMU benchmark (Yue et al., 2023), that comprises questions about images requiring college-level subject knowledge and deliberate reasoning.

(接上页) 多个基准上创下新的最佳成绩. 特别是, Gemini Ultra 在考试基准 MMLU 上超过人类专家水平, 得分 90.0%; 自 2020 年首次发布以来, MMLU 一直是衡量 LLM 进展的事实标准. 在多模态领域, Gemini Ultra 在大多数图像理解, 视频理解和音频理解基准上创下新的最佳成绩, 且没有针对任务的修改或调优. 特别是, Gemini Ultra 在新近的 MMMU 基准 (Yue et al., 2023) 上的最佳表现, 显示了它的多模态推理能力; MMMU 由关于图像的问题组成, 需要大学水平的学科知识和审慎推理.

Beyond the state-of-art results on benchmarks, what we are most excited about is the new use cases enabled by Gemini models. The new capabilities of Gemini models to parse complex images, such as charts or infographics, reason over interleaved sequences of images, audio, and text, and generate interleaved text and images as responses open a wide variety of new applications. As shown in figures throughout the report and appendix, Gemini models can enable new approaches in areas like education, everyday problem solving, multilingual communication, information summarization, extraction, and creativity. We expect that the users of these models will find all kinds of beneficial new uses that we have only scratched the surface of in our own investigations.

在基准上的最佳成绩之外, 我们最兴奋的是 Gemini 模型开启的新用例. Gemini 模型解析图表或信息图等复杂图像, 在图像, 音频和文本的交错序列上推理, 以及生成图文交错回答的新能力, 打开了大量新应用. 正如本报告和附录中各图所示, Gemini 模型能在教育, 日常问题解决, 多语言交流, 信息摘要, 信息提取和创意等领域带来新做法. 我们期待这些模型的用户会发现各种有益的新用途, 我们自己的探索只触及了表面.

Despite their impressive capabilities, we should note that there are limitations to the use of LLMs. There is a continued need for ongoing research and development on “hallucinations” generated by LLMs to ensure that model outputs are more reliable and verifiable. LLMs also struggle with tasks requiring high-level reasoning abilities like causal understanding, logical deduction, and counterfactual reasoning even though they achieve impressive performance on exam benchmarks. This underscores the need for more challenging and robust evaluations to measure their true understanding as the current state-of-the-art LLMs saturate many benchmarks.

尽管能力出色, 我们也应指出 LLM 的使用存在局限. LLM 生成的 「幻觉」 仍需持续研发, 以确保模型输出更可靠, 可验证. LLM 在需要高层推理能力的任务上也有困难, 如因果理解, 逻辑推演和反事实推理, 尽管它们在考试基准上表现出色. 这凸显出需要更有挑战, 更稳健的评测来衡量它们的真实理解, 因为当前最强的 LLM 已让许多基准饱和.

The Gemini family is a further step towards our mission to solve intelligence, advance science and benefit humanity, and we are enthusiastic to see how these models are used by our colleagues at Google and beyond. We build on many innovations in machine learning, data, infrastructure, and responsible development – areas that we have been pursuing at Google for over a decade. The models we present in this report provide a strong foundation towards our broader future goal to develop a large-scale, modularized system that will have broad generalization capabilities across many modalities.

Gemini 家族是我们朝 「解决智能, 推动科学, 造福人类」 这一使命迈出的又一步, 我们很期待看到 Google 内外的同事如何使用这些模型. 我们建立在机器学习, 数据, 基础设施和负责任开发方面的许多创新之上, 这些是 Google 十多年来一直在推进的领域. 本报告介绍的模型为我们更长远的目标打下坚实基础: 开发一个大规模, 模块化, 能在多种模态上广泛泛化的系统.

<!-- page 41 of 90 -->

Gemini: A Family of Highly Capable Multimodal Models

## References

Jean-Baptiste Alayrac, Jeff Donahue, Pauline Luc, Antoine Miech, Iain Barr, Yana Hasson, Karel Lenc, Arthur Mensch, Katie Millican, Malcolm Reynolds, Roman Ring, Eliza Rutherford, Serkan Cabi, Tengda Han, Zhitao Gong, Sina Samangooei, Marianne Monteiro, Jacob Menick, Sebastian Borgeaud, Andrew Brock, Aida Nematzadeh, Sahand Sharifzadeh, Mikolaj Binkowski, Ricardo Barreira, Oriol Vinyals, Andrew Zisserman, and Karen Simonyan. Flamingo: a visual language model for few-shot learning. Advances in Neural Information Processing Systems, 35:23716–23736, 2022.

Rohan Anil, Andrew M. Dai, Orhan Firat, Melvin Johnson, Dmitry Lepikhin, Alexandre Passos, Siamak Shakeri, Emanuel Taropa, Paige Bailey, Zhifeng Chen, Eric Chu, Jonathan H. Clark, Laurent El Shafey, Yanping Huang, Kathy Meier-Hellstern, Gaurav Mishra, Erica Moreira, Mark Omernick, Kevin Robinson, Sebastian Ruder, Yi Tay, Kefan Xiao, Yuanzhong Xu, Yujing Zhang, Gustavo Hernandez Abrego, Junwhan Ahn, Jacob Austin, Paul Barham, Jan Botha, James Bradbury, Siddhartha Brahma, Kevin Brooks, Michele Catasta, Yong Cheng, Colin Cherry, Christopher A. Choquette-Choo, Aakanksha Chowdhery, Clément Crepy, Shachi Dave, Mostafa Dehghani, Sunipa Dev, Jacob Devlin, Mark Díaz, Nan Du, Ethan Dyer, Vlad Feinberg, Fangxiaoyu Feng, Vlad Fienber, Markus Freitag, Xavier Garcia, Sebastian Gehrmann, Lucas Gonzalez, Guy Gur-Ari, Steven Hand, Hadi Hashemi, Le Hou, Joshua Howland, Andrea Hu, Jeffrey Hui, Jeremy Hurwitz, Michael Isard, Abe Ittycheriah, Matthew Jagielski, Wenhao Jia, Kathleen Kenealy, Maxim Krikun, Sneha Kudugunta, Chang Lan, Katherine Lee, Benjamin Lee, Eric Li, Music Li, Wei Li, YaGuang Li, Jian Li, Hyeontaek Lim, Hanzhao Lin, Zhongtao Liu, Frederick Liu, Marcello Maggioni, Aroma Mahendru, Joshua Maynez, Vedant Misra, Maysam Moussalem, Zachary Nado, John Nham, Eric Ni, Andrew Nystrom, Alicia Parrish, Marie Pellat, Martin Polacek, Alex Polozov, Reiner Pope, Siyuan Qiao, Emily Reif, Bryan Richter, Parker Riley, Alex Castro Ros, Aurko Roy, Brennan Saeta, Rajkumar Samuel, Renee Shelby, Ambrose Slone, Daniel Smilkov, David R. So, Daniel Sohn, Simon Tokumine, Dasha Valter, Vijay Vasudevan, Kiran Vodrahalli, Xuezhi Wang, Pidong Wang, Zirui Wang, Tao Wang, John Wieting, Yuhuai Wu, Kelvin Xu, Yunhan Xu, Linting Xue, Pengcheng Yin, Jiahui Yu, Qiao Zhang, Steven Zheng, Ce Zheng, Weikang Zhou, Denny Zhou, Slav Petrov, and Yonghui Wu. PaLM 2 Technical Report, 2023.

Jacob Austin, Augustus Odena, Maxwell Nye, Maarten Bosma, Henryk Michalewski, David Dohan, Ellen Jiang, Carrie Cai, Michael Terry, Quoc Le, et al. Program synthesis with large language models. arXiv preprint arXiv:2108.07732, 2021. URL [https://arxiv.org/abs/2108.07732](https://arxiv.org/abs/2108.07732).

Yuntao Bai, Andy Jones, Kamal Ndousse, Amanda Askell, Anna Chen, Nova DasSarma, Dawn Drain, Stanislav Fort, Deep Ganguli, Tom Henighan, Nicholas Joseph, Saurav Kadavath, Jackson Kernion, Tom Conerly, Sheer El-Showk, Nelson Elhage, Zac Hatfield-Dodds, Danny Hernandez, Tristan Hume, Scott Johnston, Shauna Kravec, Liane Lovitt, Neel Nanda, Catherine Olsson, Dario Amodei, Tom Brown, Jack Clark, Sam McCandlish, Chris Olah, Ben Mann, and Jared Kaplan. Training a helpful and harmless assistant with reinforcement learning from human feedback. April 2022a. URL [https://arxiv.org/abs/2204.05862](https://arxiv.org/abs/2204.05862).

Yuntao Bai, Saurav Kadavath, Sandipan Kundu, Amanda Askell, Jackson Kernion, Andy Jones, Anna Chen, Anna Goldie, Azalia Mirhoseini, Cameron McKinnon, Carol Chen, Catherine Olsson, Christopher Olah, Danny Hernandez, Dawn Drain, Deep Ganguli, Dustin Li, Eli Tran-Johnson, Ethan Perez, Jamie Kerr, Jared Mueller, Jeffrey Ladish, Joshua Landau, Kamal Ndousse, Kamile Lukosuite, Liane Lovitt, Michael Sellitto, Nelson Elhage, Nicholas Schiefer, Noemi Mercado, Nova DasSarma, Robert Lasenby, Robin Larson, Sam Ringer, Scott Johnston, Shauna Kravec, Sheer El Showk, Stanislav Fort, Tamera Lanham, Timothy Telleen-Lawton, Tom Conerly, Tom Henighan, Tristan Hume, Samuel R. Bowman, Zac Hatfield-Dodds, Ben Mann, Dario Amodei, Nicholas Joseph,

<!-- page 42 of 90 -->

Gemini: A Family of Highly Capable Multimodal Models

Sam McCandlish, Tom Brown, and Jared Kaplan. Constitutional AI: Harmlessness from AI feedback. arXiv preprint arXiv:2212.08073, 2022b.

Paul Barham, Aakanksha Chowdhery, Jeff Dean, Sanjay Ghemawat, Steven Hand, Dan Hurt, Michael Isard, Hyeontaek Lim, Ruoming Pang, Sudip Roy, Brennan Saeta, Parker Schuh, Ryan Sepassi, Laurent El Shafey, Chandramohan A. Thekkath, and Yonghui Wu. Pathways: Asynchronous distributed dataflow for ML. Proceedings of Machine Learning and Systems, 4:430–449, 2022.

Su Lin Blodgett, Gilsinia Lopez, Alexandra Olteanu, Robert Sim, and Hanna Wallach. Stereotyping Norwegian salmon: An inventory of pitfalls in fairness benchmark datasets. In Proceedings of the 59th Annual Meeting of the Association for Computational Linguistics and the 11th International Joint Conference on Natural Language Processing (Volume 1: Long Papers), pages 1004–1015, Online, August 2021. Association for Computational Linguistics. doi: 10.18653/v1/2021.acl-long.81. URL [https://aclanthology.org/2021.acl-long.81](https://aclanthology.org/2021.acl-long.81).

James Bradbury, Roy Frostig, Peter Hawkins, Matthew James Johnson, Chris Leary, Dougal Maclaurin, George Necula, Adam Paszke, Jake VanderPlas, Skye Wanderman-Milne, and Qiao Zhang. JAX: composable transformations of Python+NumPy programs, 2018. URL [http://github.com/google/jax](http://github.com/google/jax).

Tom Brown, Benjamin Mann, Nick Ryder, Melanie Subbiah, Jared D Kaplan, Prafulla Dhariwal, Arvind Neelakantan, Pranav Shyam, Girish Sastry, Amanda Askell, Sandhini Agarwal, Ariel Herbert-Voss, Gretchen Krueger, Tom Henighan, Rewon Child, Aditya Ramesh, Daniel Ziegler, Jeffrey Wu, Clemens Winter, Chris Hesse, Mark Chen, Eric Sigler, Mateusz Litwin, Scott Gray, Benjamin Chess, Jack Clark, Christopher Berner, Sam McCandlish, Alec Radford, Ilya Sutskever, and Dario Amodei. Language models are few-shot learners. In H. Larochelle, M. Ranzato, R. Hadsell, M.F. Balcan, and H. Lin, editors, Advances in Neural Information Processing Systems, volume 33, pages 1877–1901. Curran Associates, Inc., 2020. URL [https://proceedings.neurips.cc/paper\_files/paper/2020/file/1457c0d6bfcb4967418bfb8ac142f64a-Paper.pdf](https://proceedings.neurips.cc/paper_files/paper/2020/file/1457c0d6bfcb4967418bfb8ac142f64a-Paper.pdf).

Mark Chen, Jerry Tworek, Heewoo Jun, Qiming Yuan, Henrique Ponde de Oliveira Pinto, Jared Kaplan, Harri Edwards, Yuri Burda, Nicholas Joseph, Greg Brockman, Alex Ray, Raul Puri, Gretchen Krueger, Michael Petrov, Heidy Khlaaf, Girish Sastry, Pamela Mishkin, Brooke Chan, Scott Gray, Nick Ryder, Mikhail Pavlov, Alethea Power, Lukasz Kaiser, Mohammad Bavarian, Clemens Winter, Philippe Tillet, Felipe Petroski Such, Dave Cummings, Matthias Plappert, Fotios Chantzis, Elizabeth Barnes, Ariel Herbert-Voss, William Hebgen Guss, Alex Nichol, Alex Paino, Nikolas Tezak, Jie Tang, Igor Babuschkin, Suchir Balaji, Shantanu Jain, William Saunders, Christopher Hesse, Andrew N. Carr, Jan Leike, Josh Achiam, Vedant Misra, Evan Morikawa, Alec Radford, Matthew Knight, Miles Brundage, Mira Murati, Katie Mayer, Peter Welinder, Bob McGrew, Dario Amodei, Sam McCandlish, Ilya Sutskever, and Wojciech Zaremba. Evaluating large language models trained on code. arXiv preprint arXiv:2107.03374, 2021. URL [https://arxiv.org/abs/2107.03374](https://arxiv.org/abs/2107.03374).

Xi Chen, Xiao Wang, Soravit Changpinyo, A J Piergiovanni, Piotr Padlewski, Daniel Salz, Sebastian Goodman, Adam Grycner, Basil Mustafa, Lucas Beyer, Alexander Kolesnikov, Joan Puigcerver, Nan Ding, Keran Rong, Hassan Akbari, Gaurav Mishra, Linting Xue, Ashish Thapliyal, James Bradbury, Weicheng Kuo, Mojtaba Seyedhosseini, Chao Jia, Burcu Karagol Ayan, Carlos Riquelme, Andreas Steiner, Anelia Angelova, Xiaohua Zhai, Neil Houlsby, and Radu Soricut. PaLI: A jointlyscaled multilingual language-image model. arXiv preprint arXiv:2209.06794, 2022. URL [https://arxiv.org/abs/2209.06794](https://arxiv.org/abs/2209.06794).

Xi Chen, Josip Djolonga, Piotr Padlewski, Basil Mustafa, Soravit Changpinyo, Jialin Wu, Carlos Riquelme Ruiz, Sebastian Goodman, Xiao Wang, Yi Tay, Siamak Shakeri, Mostafa Dehghani,

<!-- page 43 of 90 -->

Gemini: A Family of Highly Capable Multimodal Models

Daniel Salz, Mario Lucic, Michael Tschannen, Arsha Nagrani, Hexiang Hu, Mandar Joshi, Bo Pang, Ceslee Montgomery, Paulina Pietrzyk, Marvin Ritter, AJ Piergiovanni, Matthias Minderer, Filip Pavetic, Austin Waters, Gang Li, Ibrahim Alabdulmohsin, Lucas Beyer, Julien Amelot, Kenton Lee, Andreas Peter Steiner, Yang Li, Daniel Keysers, Anurag Arnab, Yuanzhong Xu, Keran Rong, Alexander Kolesnikov, Mojtaba Seyedhosseini, Anelia Angelova, Xiaohua Zhai, Neil Houlsby, and Radu Soricut. PaLI-X: On Scaling up a Multilingual Vision and Language Model. arXiv preprint arXiv:2305.18565, 2023.

Aakanksha Chowdhery, Sharan Narang, Jacob Devlin, Maarten Bosma, Gaurav Mishra, Adam Roberts, Paul Barham, Hyung Won Chung, Charles Sutton, Sebastian Gehrmann, Parker Schuh, Kensen Shi, Sasha Tsvyashchenko, Joshua Maynez, Abhishek Rao, Parker Barnes, Yi Tay, Noam Shazeer, Vinodkumar Prabhakaran, Emily Reif, Nan Du, Ben Hutchinson, Reiner Pope, James Bradbury, Jacob Austin, Michael Isard, Guy Gur-Ari, Pengcheng Yin, Toju Duke, Anselm Levskaya, Sanjay Ghemawat, Sunipa Dev, Henryk Michalewski, Xavier Garcia, Vedant Misra, Kevin Robinson, Liam Fedus, Denny Zhou, Daphne Ippolito, David Luan, Hyeontaek Lim, Barret Zoph, Alexander Spiridonov, Ryan Sepassi, David Dohan, Shivani Agrawal, Mark Omernick, Andrew M. Dai, Thanumalayan Sankaranarayana Pillai, Marie Pellat, Aitor Lewkowycz, Erica Moreira, Rewon Child, Oleksandr Polozov, Katherine Lee, Zongwei Zhou, Xuezhi Wang, Brennan Saeta, Mark Diaz, Orhan Firat, Michele Catasta, Jason Wei, Kathy Meier-Hellstern, Douglas Eck, Jeff Dean, Slav Petrov, and Noah Fiedel. PaLM: Scaling Language Modeling with Pathways. Journal of Machine Learning Research, 24(240): 1–113, 2023. URL [http://jmlr.org/papers/v24/22-1144.html](http://jmlr.org/papers/v24/22-1144.html).

Christopher Clark, Kenton Lee, Ming-Wei Chang, Tom Kwiatkowski, Michael Collins, and Kristina Toutanova. BoolQ: Exploring the surprising difficulty of natural yes/no questions. In Proceedings of the 2019 Conference of the North American Chapter of the Association for Computational Linguistics: Human Language Technologies, Volume 1 (Long and Short Papers), pages 2924–2936, 2019. URL [https://aclanthology.org/N19-1300](https://aclanthology.org/N19-1300).

Jon Clark, Eunsol Choi, Michael Collins, Dan Garrette, Tom Kwiatkowski, Vitaly Nikolaev, and Jennimaria Palomaki. TydiQA: A benchmark for information-seeking question answering in typologically diverse languages. Transactions of the Association for Computational Linguistics, 2020. URL [https://storage.googleapis.com/tydiqa/tydiqa.pdf](https://storage.googleapis.com/tydiqa/tydiqa.pdf).

Karl Cobbe, Vineet Kosaraju, Mohammad Bavarian, Jacob Hilton, Reiichiro Nakano, Christopher Hesse, and John Schulman. Training verifiers to solve math word problems. arXiv preprint arXiv:2110.14168, 2021. URL [https://arxiv.org/abs/2110.14168](https://arxiv.org/abs/2110.14168).

Alexis Conneau, Min Ma, Simran Khanuja, Yu Zhang, Vera Axelrod, Siddharth Dalmia, Jason Riesa, Clara Rivera, and Ankur Bapna. Fleurs: Few-shot learning evaluation of universal representations of speech. In 2022 IEEE Spoken Language Technology Workshop (SLT), pages 798–805. IEEE, 2023.

Jeff Dean. Introducing Pathways: A next-generation AI architecture, 2021. URL [https://blog.google/technology/ai/introducing-pathways-next-generation-ai-architecture/](https://blog.google/technology/ai/introducing-pathways-next-generation-ai-architecture/).

Jeffrey Dean, Greg Corrado, Rajat Monga, Kai Chen, Matthieu Devin, Mark Mao, Marc’aurelio Ranzato, Andrew Senior, Paul Tucker, Ke Yang, et al. Large scale distributed deep networks. Advances in neural information processing systems, 25, 2012.

Harish Dattatraya Dixit, Sneha Pendharkar, Matt Beadon, Chris Mason, Tejasvi Chakravarthy, Bharath Muthiah, and Sriram Sankar. Silent data corruptions at scale. arXiv preprint arXiv:2102.11245, 2021.

<!-- page 44 of 90 -->

Gemini: A Family of Highly Capable Multimodal Models

Alexey Dosovitskiy, Lucas Beyer, Alexander Kolesnikov, Dirk Weissenborn, Xiaohua Zhai, Thomas Unterthiner, Mostafa Dehghani, Matthias Minderer, Georg Heigold, Sylvain Gelly, Jakob Uszkoreit, and Neil Houlsby. An image is worth 16x16 words: Transformers for image recognition at scale. In ICLR, 2020.

Dheeru Dua, Yizhong Wang, Pradeep Dasigi, Gabriel Stanovsky, Sameer Singh, and Matt Gardner. DROP: A reading comprehension benchmark requiring discrete reasoning over paragraphs. In Proceedings of the 2019 Conference of the North American Chapter of the Association for Computational Linguistics: Human Language Technologies, Volume 1 (Long and Short Papers), pages 2368–2378, 2019. URL [https://aclanthology.org/N19-1246](https://aclanthology.org/N19-1246).

Christian Federmann, Tom Kocmi, and Ying Xin. NTREX-128 – news test references for MT evaluation of 128 languages. In Proceedings of the First Workshop on Scaling Up Multilingual Evaluation, pages 21–24, Online, nov 2022. Association for Computational Linguistics. URL [https://aclanthology.org/2022.sumeval-1.4](https://aclanthology.org/2022.sumeval-1.4).

Samuel Gehman, Suchin Gururangan, Maarten Sap, Yejin Choi, and Noah A. Smith. Realtoxicityprompts: Evaluating neural toxic degeneration in language models, 2020.

Amelia Glaese, Nat McAleese, Maja Trębacz, John Aslanides, Vlad Firoiu, Timo Ewalds, Maribeth Rauh, Laura Weidinger, Martin Chadwick, Phoebe Thacker, Lucy Campbell-Gillingham, Jonathan Uesato, Po-Sen Huang, Ramona Comanescu, Fan Yang, Abigail See, Sumanth Dathathri, Rory Greig, Charlie Chen, Doug Fritz, Jaume Sanchez Elias, Richard Green, Soňa Mokrá, Nicholas Fernando, Boxi Wu, Rachel Foley, Susannah Young, Iason Gabriel, William Isaac, John Mellor, Demis Hassabis, Koray Kavukcuoglu, Lisa Anne Hendricks, and Geoffrey Irving. Improving alignment of dialogue agents via targeted human judgements, 2022. URL [https://arxiv.org/abs/2209.14375](https://arxiv.org/abs/2209.14375).

Google. Google’s AI Principles. 2023. URL [https://ai.google/responsibility/principles/](https://ai.google/responsibility/principles/).

Yash Goyal, Tejas Khot, Douglas Summers-Stay, Dhruv Batra, and Devi Parikh. Making the V in VQA matter: Elevating the role of image understanding in visual question answering. In Proceedings of the IEEE conference on computer vision and pattern recognition, pages 6904–6913, 2017.

Tahmid Hasan, Abhik Bhattacharjee, Md. Saiful Islam, Kazi Mubasshir, Yuan-Fang Li, Yong-Bin Kang, M. Sohel Rahman, and Rifat Shahriyar. XL-sum: Large-scale multilingual abstractive summarization for 44 languages. In Findings of the Association for Computational Linguistics: ACL-IJCNLP 2021, pages 4693–4703, Online, August 2021. Association for Computational Linguistics. doi: 10.18653/ v1/2021.findings-acl.413. URL [https://aclanthology.org/2021.findings-acl.413](https://aclanthology.org/2021.findings-acl.413).

Qianyu He, Jie Zeng, Wenhao Huang, Lina Chen, Jin Xiao, Qianxi He, Xunzhe Zhou, Lida Chen, Xintao Wang, Yuncheng Huang, et al. Can large language models understand real-world complex instructions? arXiv preprint arXiv:2309.09150, 2023.

Dan Hendrycks, Collin Burns, Steven Basart, Andy Zou, Mantas Mazeika, Dawn Song, and Jacob Steinhardt. Measuring massive multitask language understanding. Proceedings of the International Conference on Learning Representations (ICLR), 2021a.

Dan Hendrycks, Collin Burns, Saurav Kadavath, Akul Arora, Steven Basart, Eric Tang, Dawn Song, and Jacob Steinhardt. Measuring mathematical problem solving with the MATH dataset. arXiv preprint arXiv:2103.03874, 2021b. URL [https://arxiv.org/abs/2103.03874](https://arxiv.org/abs/2103.03874).

<!-- page 45 of 90 -->

Gemini: A Family of Highly Capable Multimodal Models

Peter H Hochschild, Paul Turner, Jeffrey C Mogul, Rama Govindaraju, Parthasarathy Ranganathan, David E Culler, and Amin Vahdat. Cores that don’t count. In Proceedings of the Workshop on Hot Topics in Operating Systems, pages 9–16, 2021.

Jordan Hoffmann, Sebastian Borgeaud, Arthur Mensch, Elena Buchatskaya, Trevor Cai, Eliza Rutherford, Diego de Las Casas, Lisa Anne Hendricks, Johannes Welbl, Aidan Clark, Tom Hennigan, Eric Noland, Katie Millican, George van den Driessche, Bogdan Damoc, Aurelia Guy, Simon Osindero, Karen Simonyan, Erich Elsen, Jack W. Rae, Oriol Vinyals, and Laurent Sifre. Training computeoptimal large language models. arXiv preprint arXiv:2203.15556, 2022.

Shengding Hu, Yifan Luo, Huadong Wang, Xingyi Cheng, Zhiyuan Liu, and Maosong Sun. Won’t get fooled again: Answering questions with false premises. arXiv preprint arXiv:2307.02394, 2023.

EunJeong Hwang and Vered Shwartz. Memecap: A dataset for captioning and interpreting memes, 2023.

Norman P. Jouppi, Doe Hyun Yoon, George Kurian, Sheng Li, Nishant Patil, James Laudon, Cliff Young, and David A. Patterson. A domain-specific supercomputer for training deep neural networks. Commun. ACM, 63(7):67–78, 2020. doi: 10.1145/3360307. URL [https://doi.org/10.1145/3360307](https://doi.org/10.1145/3360307).

Norman P Jouppi, George Kurian, Sheng Li, Peter Ma, Rahul Nagarajan, Lifeng Nai, Nishant Patil, Suvinay Subramanian, Andy Swing, Brian Towles, Cliff Young, Xiang Zhou, Zongwei Zhou, and David A Patterson. Tpu v4: An optically reconfigurable supercomputer for machine learning with hardware support for embeddings. In Proceedings of the 50th Annual International Symposium on Computer Architecture, pages 1–14, 2023.

Ashwin Kalyan, Abhinav Kumar, Arjun Chandrasekaran, Ashish Sabharwal, and Peter Clark. How Much Coffee Was Consumed During EMNLP 2019? Fermi Problems: A New Reasoning Challenge for AI, 2021.

Jungo Kasai, Keisuke Sakaguchi, Yoichi Takahashi, Ronan Le Bras, Akari Asai, Xinyan Yu, Dragomir Radev, Noah A Smith, Yejin Choi, and Kentaro Inui. Realtime qa: What’s the answer right now? arXiv preprint arXiv:2207.13332, 2022a.

Jungo Kasai, Keisuke Sakaguchi, Yoichi Takahashi, Ronan Le Bras, Akari Asai, Xinyan Yu, Dragomir Radev, Noah A. Smith, Yejin Choi, and Kentaro Inui. RealTime QA: What’s the answer right now?, 2022b. URL [https://arxiv.org/abs/2207.13332](https://arxiv.org/abs/2207.13332).

K Kavukcuoglu, P Kohli, L Ibrahim, D Bloxwich, and S Brown. How our principles helped define AlphaFold’s release. Google DeepMind, 2022.

Aniruddha Kembhavi, Mike Salvato, Eric Kolve, Minjoon Seo, Hannaneh Hajishirzi, and Ali Farhadi. A diagram is worth a dozen images. In ECCV, 2016.

Megan Kinniment, Lucas Jun Koba Sato, Haoxing Du, Brian Goodrich, Max Hasin, Lawrence Chan, Luke Harold Miles, Tao R Lin, Hjalmar Wijk, Joel Burget, et al. Evaluating language-model agents on realistic autonomous tasks. arXiv preprint arXiv:2312.11671, 2023.

Tomáš Kočiský, Jonathan Schwarz, Phil Blunsom, Chris Dyer, Karl Moritz Hermann, Gábor Melis, and Edward Grefenstette. The NarrativeQA reading comprehension challenge. Transactions of the Association for Computational Linguistics, 6:317–328, 2018. doi: 10.1162/tacl\_a\_00023. URL [https://aclanthology.org/Q18-1023](https://aclanthology.org/Q18-1023).

<!-- page 46 of 90 -->

Gemini: A Family of Highly Capable Multimodal Models

Tom Kocmi, Rachel Bawden, Ondřej Bojar, Anton Dvorkovich, Christian Federmann, Mark Fishel, Thamme Gowda, Yvette Graham, Roman Grundkiewicz, Barry Haddow, Rebecca Knowles, Philipp Koehn, Christof Monz, Makoto Morishita, Masaaki Nagata, Toshiaki Nakazawa, Michal Novák, Martin Popel, and Maja Popović. Findings of the 2022 conference on machine translation (WMT22). In Proceedings of the Seventh Conference on Machine Translation (WMT), December 2022. URL [https://aclanthology.org/2022.wmt-1.1](https://aclanthology.org/2022.wmt-1.1).

Takeshi Kojima, Shixiang Shane Gu, Machel Reid, Yutaka Matsuo, and Yusuke Iwasawa. Large language models are zero-shot reasoners. Advances in neural information processing systems, 35: 22199–22213, 2022.

Taku Kudo and John Richardson. Sentencepiece: A simple and language independent subword tokenizer and detokenizer for neural text processing. In Eduardo Blanco and Wei Lu, editors, Proceedings of the 2018 Conference on Empirical Methods in Natural Language Processing, EMNLP 2018: System Demonstrations, Brussels, Belgium, October 31 - November 4, 2018, pages 66–71. Association for Computational Linguistics, 2018. doi: 10.18653/v1/d18-2012. URL [https://doi.org/10.18653/v1/d18-2012](https://doi.org/10.18653/v1/d18-2012).

Tom Kwiatkowski, Jennimaria Palomaki, Olivia Redfield, Michael Collins, Ankur Parikh, Chris Alberti, Danielle Epstein, Illia Polosukhin, Jacob Devlin, Kenton Lee, Kristina Toutanova, Llion Jones, Matthew Kelcey, Ming-Wei Chang, Andrew M. Dai, Jakob Uszkoreit, Quoc Le, and Slav Petrov. Natural questions: A benchmark for question answering research. Transactions of the Association for Computational Linguistics, 7:452–466, 2019a. doi: 10.1162/tacl\_a\_00276. URL [https://aclanthology.org/Q19-1026](https://aclanthology.org/Q19-1026).

Tom Kwiatkowski, Jennimaria Palomaki, Olivia Redfield, Michael Collins, Ankur Parikh, Chris Alberti, Danielle Epstein, Illia Polosukhin, Jacob Devlin, Kenton Lee, et al. Natural questions: a benchmark for question answering research. Transactions of the Association for Computational Linguistics, 7: 453–466, 2019b.

Faisal Ladhak, Esin Durmus, Claire Cardie, and Kathleen McKeown. WikiLingua: A new benchmark dataset for cross-lingual abstractive summarization. In Findings of the Association for Computational Linguistics: EMNLP 2020, pages 4034–4048, Online, November 2020. Association for Computational Linguistics. doi: 10.18653/v1/2020.findings-emnlp.360. URL [https://www.aclweb.org/anthology/2020.findings-emnlp.360](https://www.aclweb.org/anthology/2020.findings-emnlp.360).

Leblond et al. AlphaCode 2 Technical Report. 2023. URL [https://storage.googleapis.com/deepmind-media/AlphaCode2/AlphaCode2\_Tech\_Report.pdf](https://storage.googleapis.com/deepmind-media/AlphaCode2/AlphaCode2_Tech_Report.pdf).

Yann LeCun, Yoshua Bengio, and Geoffrey Hinton. Deep learning. nature, 521(7553):436–444, 2015.

Yujia Li, David Choi, Junyoung Chung, Nate Kushman, Julian Schrittwieser, Rémi Leblond, Tom Eccles, James Keeling, Felix Gimeno, Agustin Dal Lago, et al. Competition-level code generation with alphacode. Science, 378(6624):1092–1097, 2022.

Bin Lin, Bin Zhu, Yang Ye, Munan Ning, Peng Jin, and Li Yuan. Video-llava: Learning united visual representation by alignment before projection. arXiv preprint arXiv:2311.10122, 2023.

Fangyu Liu, Julian Eisenschlos, Francesco Piccinno, Syrine Krichene, Chenxi Pang, Kenton Lee, Mandar Joshi, Wenhu Chen, Nigel Collier, and Yasemin Altun. DePlot: One-shot visual language reasoning by plot-to-table translation. In Findings of the Association for Computational Linguistics: ACL 2023, pages 10381–10399, Toronto, Canada, July 2023. Association for Computational Linguistics. doi: 10.18653/v1/2023.findings-acl.660. URL [https://aclanthology.org/2023.findings-acl.660](https://aclanthology.org/2023.findings-acl.660).

<!-- page 47 of 90 -->

Gemini: A Family of Highly Capable Multimodal Models

Pan Lu, Ran Gong, Shibiao Jiang, Liang Qiu, Siyuan Huang, Xiaodan Liang, and Song-Chun Zhu. Inter-gps: Interpretable geometry problem solving with formal language and symbolic reasoning. In The Joint Conference of the 59th Annual Meeting of the Association for Computational Linguistics and the 11th International Joint Conference on Natural Language Processing (ACL-IJCNLP 2021), 2021.

Pan Lu, Hritik Bansal, Tony Xia, Jiacheng Liu, Chunyuan Li, Hannaneh Hajishirzi, Hao Cheng, Kai-Wei Chang, Michel Galley, and Jianfeng Gao. Mathvista: Evaluating mathematical reasoning of foundation models in visual contexts. arXiv preprint arXiv:2310.02255, 2023.

Ahmed Masry, Do Long, Jia Qing Tan, Shafiq Joty, and Enamul Hoque. ChartQA: A benchmark for question answering about charts with visual and logical reasoning. In Findings of ACL, 2022.

Minesh Mathew, Dimosthenis Karatzas, and CV Jawahar. Docvqa: A dataset for vqa on document images. In Proceedings of the IEEE/CVF winter conference on applications of computer vision, pages 2200–2209, 2021.

Minesh Mathew, Viraj Bagal, Rubèn Tito, Dimosthenis Karatzas, Ernest Valveny, and CV Jawahar. Infographicvqa. In Proceedings of the IEEE/CVF Winter Conference on Applications of Computer Vision, pages 1697–1706, 2022.

Joshua Maynez, Shashi Narayan, Bernd Bohnet, and Ryan McDonald. On faithfulness and factuality in abstractive summarization. arXiv preprint arXiv:2005.00661, 2020.

Jacob Menick, Maja Trebacz, Vladimir Mikulik, John Aslanides, Francis Song, Martin Chadwick, Mia Glaese, Susannah Young, Lucy Campbell-Gillingham, Geoffrey Irving, and Nat McAleese. Teaching language models to support answers with verified quotes. arXiv preprint arXiv:2203.11147, 2022.

Todor Mihaylov, Peter Clark, Tushar Khot, and Ashish Sabharwal. Can a suit of armor conduct electricity? a new dataset for open book question answering. In Proceedings of the 2018 Conference on Empirical Methods in Natural Language Processing, pages 2381–2391, Brussels, Belgium, October-November 2018. Association for Computational Linguistics. doi: 10.18653/v1/D18-1260. URL [https://aclanthology.org/D18-1260](https://aclanthology.org/D18-1260).

Swaroop Mishra, Daniel Khashabi, Chitta Baral, and Hannaneh Hajishirzi. Cross-task generalization via natural language crowdsourcing instructions. arXiv preprint arXiv:2104.08773, 2021.

Shashi Narayan, Shay B. Cohen, and Mirella Lapata. Don’t give me the details, just the summary! topic-aware convolutional neural networks for extreme summarization. In Proceedings of the 2018 Conference on Empirical Methods in Natural Language Processing, pages 1797–1807, Brussels, Belgium, October-November 2018. Association for Computational Linguistics. doi: 10.18653/v1/ D18-1206. URL [https://aclanthology.org/D18-1206](https://aclanthology.org/D18-1206).

Oktatási Hivatal. Matematika írásbéli vizsga. Középszintű Írásbéli Vizsga, May 2023. URL [https://dload-oktatas.educatio.hu/erettsegi/feladatok\_2023tavasz\_kozep/k\_matang\_23maj\_fl.pdf](https://dload-oktatas.educatio.hu/erettsegi/feladatok_2023tavasz_kozep/k_matang_23maj_fl.pdf). Angol Nyelven.

OpenAI. GPT-4 Technical Report. 2023a.

OpenAI. GPT-4V(ision) System Card, 2023b.

OpenAI. Whisper, 2023. URL [https://github.com/openai/whisper](https://github.com/openai/whisper).

<!-- page 48 of 90 -->

Gemini: A Family of Highly Capable Multimodal Models

Long Ouyang, Jeffrey Wu, Xu Jiang, Diogo Almeida, Carroll Wainwright, Pamela Mishkin, Chong Zhang, Sandhini Agarwal, Katarina Slama, Alex Gray, John Schulman, Jacob Hilton, Fraser Kelton, Luke Miller, Maddie Simens, Amanda Askell, Peter Welinder, Paul Christiano, Jan Leike, and Ryan Lowe. Training language models to follow instructions with human feedback. In Alice H. Oh, Alekh Agarwal, Danielle Belgrave, and Kyunghyun Cho, editors, Advances in Neural Information Processing Systems, 2022. URL [https://openreview.net/forum?id=TG8KACxEON](https://openreview.net/forum?id=TG8KACxEON).

Denis Paperno, Germán Kruszewski, Angeliki Lazaridou, Quan Ngoc Pham, Raffaella Bernardi, Sandro Pezzelle, Marco Baroni, Gemma Boleda, and Raquel Fernández. The LAMBADA dataset: Word prediction requiring a broad discourse context. arXiv preprint arXiv:1606.06031, 2016.

Alicia Parrish, Angelica Chen, Nikita Nangia, Vishakh Padmakumar, Jason Phang, Jana Thompson, Phu Mon Htut, and Samuel R. Bowman. BBQ: A hand-built bias benchmark for question answering. CoRR, abs/2110.08193, 2021. URL [https://arxiv.org/abs/2110.08193](https://arxiv.org/abs/2110.08193).

Viorica Pătrăucean, Lucas Smaira, Ankush Gupta, Adrià Recasens Continente, Larisa Markeeva, Dylan Banarse, Skanda Koppula, Joseph Heyward, Mateusz Malinowski, Yi Yang, Carl Doersch, Tatiana Matejovicova, Yury Sulsky, Antoine Miech, Alex Frechette, Hanna Klimczak, Raphael Koster, Junlin Zhang, Stephanie Winkler, Yusuf Aytar, Simon Osindero, Dima Damen, Andrew Zisserman, and Joăo Carreira. Perception test: A diagnostic benchmark for multimodal video models. arXiv preprint arXiv:2305.13786, 2023.

Baolin Peng, Michel Galley, Pengcheng He, Hao Cheng, Yujia Xie, Yu Hu, Qiuyuan Huang, Lars Liden, Zhou Yu, Weizhu Chen, et al. Check your facts and try again: Improving large language models with external knowledge and automated feedback. arXiv preprint arXiv:2302.12813, 2023.

Leon Poutievski, Omid Mashayekhi, Joon Ong, Arjun Singh, Mukarram Tariq, Rui Wang, Jianan Zhang, Virginia Beauregard, Patrick Conner, Steve Gribble, et al. Jupiter evolving: transforming google’s datacenter network via optical circuit switches and software-defined networking. In Proceedings of the ACM SIGCOMM 2022 Conference, pages 66–85, 2022.

Vineel Pratap, Qiantong Xu, Anuroop Sriram, Gabriel Synnaeve, and Ronan Collobert. Mls: A large-scale multilingual dataset for speech research. arXiv preprint arXiv:2012.03411, 2020.

Alec Radford, Jeffrey Wu, Rewon Child, David Luan, Dario Amodei, and Ilya Sutskever. Language models are unsupervised multitask learners. OpenAI blog, 1(8):9, 2019. URL [https://d4mucfpksywv.cloudfront.net/better-language-models/language\_models\_are\_unsupervised\_multitask\_learners.pdf](https://d4mucfpksywv.cloudfront.net/better-language-models/language_models_are_unsupervised_multitask_learners.pdf).

Alec Radford, Jong Wook Kim, Tao Xu, Greg Brockman, Christine McLeavey, and Ilya Sutskever. Robust speech recognition via large-scale weak supervision. In International Conference on Machine Learning, pages 28492–28518. PMLR, 2023.

Jack W. Rae, Sebastian Borgeaud, Trevor Cai, Katie Millican, Jordan Hoffmann, H. Francis Song, John Aslanides, Sarah Henderson, Roman Ring, Susannah Young, Eliza Rutherford, Tom Hennigan, Jacob Menick, Albin Cassirer, Richard Powell, George van den Driessche, Lisa Anne Hendricks, Maribeth Rauh, Po-Sen Huang, Amelia Glaese, Johannes Welbl, Sumanth Dathathri, Saffron Huang, Jonathan Uesato, John Mellor, Irina Higgins, Antonia Creswell, Nat McAleese, Amy Wu, Erich Elsen, Siddhant M. Jayakumar, Elena Buchatskaya, David Budden, Esme Sutherland, Karen Simonyan, Michela Paganini, Laurent Sifre, Lena Martens, Xiang Lorraine Li, Adhiguna Kuncoro, Aida Nematzadeh, Elena Gribovskaya, Domenic Donato, Angeliki Lazaridou, Arthur Mensch, Jean-Baptiste Lespiau, Maria Tsimpoukelli, Nikolai Grigorev, Doug Fritz, Thibault Sottiaux, Mantas Pajarskas, Toby Pohlen, Zhitao Gong, Daniel Toyama, Cyprien de Masson d’Autume, Yujia Li, Tayfun

<!-- page 49 of 90 -->

Gemini: A Family of Highly Capable Multimodal Models

Terzi, Vladimir Mikulik, Igor Babuschkin, Aidan Clark, Diego de Las Casas, Aurelia Guy, Chris Jones, James Bradbury, Matthew Johnson, Blake A. Hechtman, Laura Weidinger, Iason Gabriel, William S. Isaac, Edward Lockhart, Simon Osindero, Laura Rimell, Chris Dyer, Oriol Vinyals, Kareem Ayoub, Jeff Stanway, Lorrayne Bennett, Demis Hassabis, Koray Kavukcuoglu, and Geoffrey Irving. Scaling language models: Methods, analysis & insights from training Gopher. CoRR, abs/2112.11446, 2021.

Aditya Ramesh, Mikhail Pavlov, Gabriel Goh, Scott Gray, Chelsea Voss, Alec Radford, Mark Chen, and Ilya Sutskever. Zero-shot text-to-image generation. In International Conference on Machine Learning, pages 8821–8831. PMLR, 2021.

Hannah Rashkin, Vitaly Nikolaev, Matthew Lamm, Lora Aroyo, Michael Collins, Dipanjan Das, Slav Petrov, Gaurav Singh Tomar, Iulia Turc, and David Reitter. Measuring attribution in natural language generation models. Computational Linguistics, pages 1–64, 2023.

Scott Reed, Konrad Zolna, Emilio Parisotto, Sergio Gomez Colmenarejo, Alexander Novikov, Gabriel Barth-Maron, Mai Gimenez, Yury Sulsky, Jackie Kay, Jost Tobias Springenberg, Tom Eccles, Jake Bruce, Ali Razavi, Ashley Edwards, Nicolas Heess, Yutian Chen, Raia Hadsell, Oriol Vinyals, Mahyar Bordbar, and Nando de Freitas. A generalist agent. arXiv preprint arXiv:2205.06175, 2022.

Parker Riley, Timothy Dozat, Jan A Botha, Xavier Garcia, Dan Garrette, Jason Riesa, Orhan Firat, and Noah Constant. Frmt: A benchmark for few-shot region-aware machine translation. Transactions of the Association for Computational Linguistics, 2023.

Hannah Ritchie, Veronika Samborska, and Max Roser. Plastic pollution. Our World in Data, 2023. https://ourworldindata.org/plastic-pollution.

Adam Roberts, Colin Raffel, and Noam Shazeer. How much knowledge can you pack into the parameters of a language model? In Proceedings of the 2020 Conference on Empirical Methods in Natural Language Processing (EMNLP), pages 5418–5426, Online, November 2020. Association for Computational Linguistics. doi: 10.18653/v1/2020.emnlp-main.437. URL [https://aclanthology.org/2020.emnlp-main.437](https://aclanthology.org/2020.emnlp-main.437).

William A Gaviria Rojas, Sudnya Diamos, Keertan Ranjan Kini, David Kanter, Vijay Janapa Reddi, and Cody Coleman. The dollar street dataset: Images representing the geographic and socioeconomic diversity of the world. In Thirty-sixth Conference on Neural Information Processing Systems Datasets and Benchmarks Track, 2022.

Rachel Rudinger, Jason Naradowsky, Brian Leonard, and Benjamin Van Durme. Gender bias in coreference resolution. In Proceedings of the 2018 Conference of the North American Chapter of the Association for Computational Linguistics: Human Language Technologies, Volume 2 (Short Papers), pages 8–14, New Orleans, Louisiana, June 2018. Association for Computational Linguistics. doi: 10.18653/v1/N18-2002. URL [https://aclanthology.org/N18-2002](https://aclanthology.org/N18-2002).

Candice Schumann, Susanna Ricco, Utsav Prabhu, Vittorio Ferrari, and Caroline Pantofaru. A step toward more inclusive people annotations for fairness. In Proceedings of the 2021 AAAI/ACM Conference on AI, Ethics, and Society, pages 916–925, 2021.

Andrew D. Selbst, Danah Boyd, and Sorelle A. Friedler. Fairness and abstraction in sociotechnical systems. In FFAT\* ’19: Proceedings of the Conference on Fairness, Accountability, and Transparency, pages 59–68, January 2019.

<!-- page 50 of 90 -->

Gemini: A Family of Highly Capable Multimodal Models

Thibault Sellam, Dipanjan Das, and Ankur Parikh. BLEURT: Learning robust metrics for text generation. In Proceedings of the 58th Annual Meeting of the Association for Computational Linguistics, pages 7881–7892, Online, July 2020. Association for Computational Linguistics. doi: 10.18653/v1/2020. acl-main.704. URL [https://aclanthology.org/2020.acl-main.704](https://aclanthology.org/2020.acl-main.704).

Uri Shaham, Elad Segal, Maor Ivgi, Avia Efrat, Ori Yoran, Adi Haviv, Ankit Gupta, Wenhan Xiong, Mor Geva, Jonathan Berant, and Omer Levy. SCROLLS: Standardized CompaRison over long language sequences. In Proceedings of the 2022 Conference on Empirical Methods in Natural Language Processing, pages 12007–12021, Abu Dhabi, United Arab Emirates, December 2022. Association for Computational Linguistics. URL [https://aclanthology.org/2022.emnlp-main.823](https://aclanthology.org/2022.emnlp-main.823).

Noam Shazeer. Fast transformer decoding: One write-head is all you need. arXiv preprint arXiv:1911.02150, 2019a.

Noam Shazeer. Fast transformer decoding: One write-head is all you need. arXiv preprint arXiv:1911.02150, 2019b.

Renee Shelby, Shalaleh Rismani, Kathryn Henne, AJung Moon, Negar Rostamzadeh, Paul Nicholas, N’Mah Yilla, Jess Gallegos, Andrew Smart, Emilio Garcia, and Gurleen Virk. Identifying sociotechnical harms of algorithmic systems: Scoping a taxonomy for harm reduction, 2023. URL [https://arxiv.org/abs/2210.05791](https://arxiv.org/abs/2210.05791).

Toby Shevlane, Sebastian Farquhar, Ben Garfinkel, Mary Phuong, Jess Whittlestone, Jade Leung, Daniel Kokotajlo, Nahema Marchal, Markus Anderljung, Noam Kolt, Lewis Ho, Divya Siddarth, Shahar Avin, Will Hawkins, Been Kim, Iason Gabriel, Vijay Bolina, Jack Clark, Yoshua Bengio, Paul Christiano, and Allan Dafoe. Model evaluation for extreme risks. arXiv preprint arXiv:2305.15324, 2023.

Freda Shi, Mirac Suzgun, Markus Freitag, Xuezhi Wang, Suraj Srivats, Soroush Vosoughi, Hyung Won Chung, Yi Tay, Sebastian Ruder, Denny Zhou, et al. Language models are multilingual chain-of-thought reasoners. ICLR, 2023.

Amanpreet Singh, Vivek Natarajan, Meet Shah, Yu Jiang, Xinlei Chen, Dhruv Batra, Devi Parikh, and Marcus Rohrbach. Towards VQA models that can read. In Proceedings of the IEEE/CVF conference on computer vision and pattern recognition, pages 8317–8326, 2019.

Aarohi Srivastava, Abhinav Rastogi, Abhishek Rao, Abu Awal Md Shoeb, Abubakar Abid, Adam Fisch, Adam R. Brown, et al. Beyond the imitation game: Quantifying and extrapolating the capabilities of language models. arXiv preprint arXiv:2206.04615, 2022. URL [https://arxiv.org/abs/2206.04615](https://arxiv.org/abs/2206.04615).

Ilya Sutskever, Oriol Vinyals, and Quoc V Le. Sequence to sequence learning with neural networks. Advances in neural information processing systems, 27, 2014.

Mirac Suzgun, Nathan Scales, Nathanael Schärli, Sebastian Gehrmann, Yi Tay, Hyung Won Chung, Aakanksha Chowdhery, Quoc V Le, Ed H Chi, Denny Zhou, et al. Challenging big-bench tasks and whether chain-of-thought can solve them. arXiv preprint arXiv:2210.09261, 2022.

Oyvind Tafjord, Bhavana Dalvi, and Peter Clark. Proof Writer: Generating implications, proofs, and abductive statements over natural language. In Findings, 2020. URL [https://api.semanticscholar.org/CorpusID:229371222](https://api.semanticscholar.org/CorpusID:229371222).

<!-- page 51 of 90 -->

Gemini: A Family of Highly Capable Multimodal Models

NLLB Team, Marta R. Costa-jussà, James Cross, Onur Çelebi, Maha Elbayad, Kenneth Heafield, Kevin Heffernan, Elahe Kalbassi, Janice Lam, Daniel Licht, Jean Maillard, Anna Sun, Skyler Wang, Guillaume Wenzek, Al Youngblood, Bapi Akula, Loic Barrault, Gabriel Mejia Gonzalez, Prangthip Hansanti, John Hoffman, Semarley Jarrett, Kaushik Ram Sadagopan, Dirk Rowe, Shannon Spruit, Chau Tran, Pierre Andrews, Necip Fazil Ayan, Shruti Bhosale, Sergey Edunov, Angela Fan, Cynthia Gao, Vedanuj Goswami, Francisco Guzmán, Philipp Koehn, Alexandre Mourachko, Christophe Ropers, Safiyyah Saleem, Holger Schwenk, and Jeff Wang. No language left behind: Scaling human-centered machine translation. 2022.

Ashish V. Thapliyal, Jordi Pont-Tuset, Xi Chen, and Radu Soricut. Crossmodal-3600: A massively multilingual multimodal evaluation dataset. In EMNLP, 2022.

Romal Thoppilan, Daniel De Freitas, Jamie Hall, Noam Shazeer, Apoorv Kulshreshtha, Heng-Tze Cheng, Alicia Jin, Taylor Bos, Leslie Baker, Yu Du, et al. LaMDA: Language models for dialog applications. arXiv preprint arXiv:2201.08239, 2022. URL [https://arxiv.org/abs/2201.08239](https://arxiv.org/abs/2201.08239).

Kocmi Tom, Eleftherios Avramidis, Rachel Bawden, Ondřej Bojar, Anton Dvorkovich, Christian Federmann, Mark Fishel, Markus Freitag, Thamme Gowda, Roman Grundkiewicz, et al. Findings of the 2023 conference on machine translation (wmt23): Llms are here but not quite there yet. In WMT23-Eighth Conference on Machine Translation, pages 198–216, 2023.

Hugo Touvron, Thibaut Lavril, Gautier Izacard, Xavier Martinet, Marie-Anne Lachaux, Timothée Lacroix, Baptiste Rozière, Naman Goyal, Eric Hambro, Faisal Azhar, Aurelien Rodriguez, Armand Joulin, Edouard Grave, and Guillaume Lample. Llama: Open and efficient foundation language models. arXiv preprint arXiv:2302.13971, 2023a.

Hugo Touvron, Louis Martin, Kevin Stone, Peter Albert, Amjad Almahairi, Yasmine Babaei, Nikolay Bashlykov, Soumya Batra, Prajjwal Bhargava, Shruti Bhosale, Dan Bikel, Lukas Blecher, Cristian Canton Ferrer, Moya Chen, Guillem Cucurull, David Esiobu, Jude Fernandes, Jeremy Fu, Wenyin Fu, Brian Fuller, Cynthia Gao, Vedanuj Goswami, Naman Goyal, Anthony Hartshorn, Saghar Hosseini, Rui Hou, Hakan Inan, Marcin Kardas, Viktor Kerkez, Madian Khabsa, Isabel Kloumann, Artem Korenev, Punit Singh Koura, Marie-Anne Lachaux, Thibaut Lavril, Jenya Lee, Diana Liskovich, Yinghai Lu, Yuning Mao, Xavier Martinet, Todor Mihaylov, Pushkar Mishra, Igor Molybog, Yixin Nie, Andrew Poulton, Jeremy Reizenstein, Rashi Rungta, Kalyan Saladi, Alan Schelten, Ruan Silva, Eric Michael Smith, Ranjan Subramanian, Xiaoqing Ellen Tan, Binh Tang, Ross Taylor, Adina Williams, Jian Xiang Kuan, Puxin Xu, Zheng Yan, Iliyan Zarov, Yuchen Zhang, Angela Fan, Melanie Kambadur, Sharan Narang, Aurelien Rodriguez, Robert Stojnic, Sergey Edunov, and Thomas Scialom. Llama 2: Open foundation and fine-tuned chat models. arXiv preprint arXiv:2307.09288, 2023b.

Ashish Vaswani, Noam Shazeer, Niki Parmar, Jakob Uszkoreit, Llion Jones, Aidan N Gomez, Ł ukasz Kaiser, and Illia Polosukhin. Attention is all you need. In I. Guyon, U. Von Luxburg, S. Bengio, H. Wallach, R. Fergus, S. Vishwanathan, and R. Garnett, editors, Advances in Neural Information Processing Systems, volume 30. Curran Associates, Inc., 2017a. URL [https://proceedings.neurips.cc/paper\_files/paper/2017/file/3f5ee243547dee91fbd053c1c4a845aa-Paper.pdf](https://proceedings.neurips.cc/paper_files/paper/2017/file/3f5ee243547dee91fbd053c1c4a845aa-Paper.pdf).

Ashish Vaswani, Noam Shazeer, Niki Parmar, Jakob Uszkoreit, Llion Jones, Aidan N. Gomez, Lukasz Kaiser, and Illia Polosukhin. Attention is all you need. CoRR, abs/1706.03762, 2017b. URL [http://arxiv.org/abs/1706.03762](http://arxiv.org/abs/1706.03762).

Ramakrishna Vedantam, C Lawrence Zitnick, and Devi Parikh. Cider: Consensus-based image description evaluation. In Proceedings of the IEEE conference on computer vision and pattern recognition, pages 4566–4575, 2015.

<!-- page 52 of 90 -->

Gemini: A Family of Highly Capable Multimodal Models

Petar Veličković, Adrià Puigdomènech Badia, David Budden, Razvan Pascanu, Andrea Banino, Misha Dashevskiy, Raia Hadsell, and Charles Blundell. The clrs algorithmic reasoning benchmark. arXiv preprint arXiv:2205.15659, 2022.

Manoj Vishwanathan, Ronak Shah, Kyung Ki Kim, and Minsu Choi. Silent data corruption (sdc) vulnerability of gpu on various gpgpu workloads. In 2015 International SoC Design Conference (ISOCC), pages 11–12, 2015. doi: 10.1109/ISOCC.2015.7401681.

Changhan Wang, Anne Wu, and Juan Pino. Covost 2 and massively multilingual speech-to-text translation. arXiv preprint arXiv:2007.10310, 2020.

Changhan Wang, Morgane Riviere, Ann Lee, Anne Wu, Chaitanya Talnikar, Daniel Haziza, Mary Williamson, Juan Pino, and Emmanuel Dupoux. Voxpopuli: A large-scale multilingual speech corpus for representation learning, semi-supervised learning and interpretation. arXiv preprint arXiv:2101.00390, 2021.

Xin Wang, Jiawei Wu, Junkun Chen, Lei Li, Yuan-Fang Wang, and William Yang Wang. VATEX: A large-scale, high-quality multilingual dataset for video-and-language research. In ICCV, 2019.

Xuezhi Wang, Jason Wei, Dale Schuurmans, Quoc Le, Ed Chi, and Denny Zhou. Self-consistency improves chain of thought reasoning in language models. arXiv preprint arXiv:2203.11171, 2022.

Jason Wei, Maarten Bosma, Vincent Y Zhao, Kelvin Guu, Adams Wei Yu, Brian Lester, Nan Du, Andrew M Dai, and Quoc V Le. Finetuned language models are zero-shot learners. Proceedings of the International Conference on Learning Representations (ICLR), 2022a. URL [https://openreview.net/forum?id=gEZrGCozdqR](https://openreview.net/forum?id=gEZrGCozdqR).

Jason Wei, Xuezhi Wang, Dale Schuurmans, Maarten Bosma, Brian Ichter, Fei Xia, Ed Chi, Quoc Le, and Denny Zhou. Chain-of-thought prompting elicits reasoning in large language models. NeurIPS, 2022b. URL [https://arxiv.org/abs/2201.11903](https://arxiv.org/abs/2201.11903).

Laura Weidinger, John Mellor, Maribeth Rauh, Conor Griffin, Jonathan Uesato, Po-Sen Huang, Myra Cheng, Mia Glaese, Borja Balle, Atoosa Kasirzadeh, Zac Kenton, Sasha Brown, Will Hawkins, Tom Stepleton, Courtney Biles, Abeba Birhane, Julia Haas, Laura Rimell, Lisa Anne Hendricks, William S. Isaac, Sean Legassick, Geoffrey Irving, and Iason Gabriel. Ethical and social risks of harm from language models. CoRR, abs/2112.04359, 2021. URL [https://arxiv.org/abs/2112.04359](https://arxiv.org/abs/2112.04359).

David Wetherall, Abdul Kabbani, Van Jacobson, Jim Winget, Yuchung Cheng, Brad Morrey, Uma Parthavi Moravapalle, Phillipa Gill, Steven Knight, and Amin Vahdat. Improving network availability with protective reroute. In SIGCOMM 2023, 2023. URL [https://dl.acm.org/doi/10.1145/3603269.3604867](https://dl.acm.org/doi/10.1145/3603269.3604867).

Junbin Xiao, Xindi Shang, Angela Yao, and Tat-Seng Chua. NExT-QA: Next phase of question-answering to explaining temporal actions. In CVPR, 2021.

XLA. XLA: Optimizing compiler for TensorFlow. [https://www.tensorflow.org/xla](https://www.tensorflow.org/xla), 2019. [Online; accessed December-2023].

Can Xu, Qingfeng Sun, Kai Zheng, Xiubo Geng, Pu Zhao, Jiazhan Feng, Chongyang Tao, and Daxin Jiang. Wizardlm: Empowering large language models to follow complex instructions. arXiv preprint arXiv:2304.12244, 2023.

Yuanzhong Xu, HyoukJoong Lee, Dehao Chen, Blake Hechtman, Yanping Huang, Rahul Joshi, Maxim Krikun, Dmitry Lepikhin, Andy Ly, Marcello Maggioni, et al. Gspmd: general and scalable parallelization for ml computation graphs. arXiv preprint arXiv:2105.04663, 2021.

<!-- page 53 of 90 -->

Gemini: A Family of Highly Capable Multimodal Models

Chi yao Hong, Subhasree Mandal, Mohammad A. Alfares, Min Zhu, Rich Alimi, Kondapa Naidu Bollineni, Chandan Bhagat, Sourabh Jain, Jay Kaimal, Jeffrey Liang, Kirill Mendelev, Steve Padgett, Faro Thomas Rabe, Saikat Ray, Malveeka Tewari, Matt Tierney, Monika Zahn, Jon Zolla, Joon Ong, and Amin Vahdat. B4 and after: Managing hierarchy, partitioning, and asymmetry for availability and scale in google’s software-defined wan. In SIGCOMM’18, 2018. URL [https://conferences.sigcomm.org/sigcomm/2018/program\_tuesday.html](https://conferences.sigcomm.org/sigcomm/2018/program_tuesday.html).

Jiahui Yu, Zirui Wang, Vijay Vasudevan, Legg Yeung, Mojtaba Seyedhosseini, and Yonghui Wu. Coca: Contrastive captioners are image-text foundation models, 2022a.

Jiahui Yu, Yuanzhong Xu, Jing Yu Koh, Thang Luong, Gunjan Baid, Zirui Wang, Vijay Vasudevan, Alexander Ku, Yinfei Yang, Burcu Karagol Ayan, Ben Hutchinson, Wei Han, Zarana Parekh, Xin Li, Han Zhang, Jason Baldridge, and Yonghui Wu. Scaling autoregressive models for content-rich text-to-image generation. arXiv preprint arXiv:2206.10789, 2(3):5, 2022b.

Shoubin Yu, Jaemin Cho, Prateek Yadav, and Mohit Bansal. Self-chained image-language model for video localization and question answering. arXiv preprint arXiv:2305.06988, 2023.

Zhou Yu, Dejing Xu, Jun Yu, Ting Yu, Zhou Zhao, Yueting Zhuang, and Dacheng Tao. ActivityNet-QA: A dataset for understanding complex web videos via question answering. In AAAI, 2019.

Xiang Yue, Yuansheng Ni, Kai Zhang, Tianyu Zheng, Ruoqi Liu, Ge Zhang, Samuel Stevens, Dongfu Jiang, Weiming Ren, Yuxuan Sun, Cong Wei, Botao Yu, Ruibin Yuan, Renliang Sun, Ming Yin, Boyuan Zheng, Zhenzhu Yang, Yibo Liu, Wenhao Huang, Huan Sun, Yu Su, and Wenhu Chen. Mmmu: A massive multi-discipline multimodal understanding and reasoning benchmark for expert agi, 2023.

Rowan Zellers, Ari Holtzman, Yonatan Bisk, Ali Farhadi, and Yejin Choi. Hellaswag: Can a machine really finish your sentence? arXiv preprint arXiv:1905.07830, 2019.

Yu Zhang, Wei Han, James Qin, Yongqiang Wang, Ankur Bapna, Zhehuai Chen, Nanxin Chen, Bo Li, Vera Axelrod, Gary Wang, Zhong Meng, Ke Hu, Andrew Rosenberg, Rohit Prabhavalkar, Daniel S. Park, Parisa Haghani, Jason Riesa, Ginger Perng, Hagen Soltau, Trevor Strohman, Bhuvana Ramabhadran, Tara Sainath, Pedro Moreno, Chung-Cheng Chiu, Johan Schalkwyk, Françoise Beaufays, and Yonghui Wu. Google usm: Scaling automatic speech recognition beyond 100 languages. arXiv preprint arXiv:2303.01037, 2023.

Dora Zhao, Angelina Wang, and Olga Russakovsky. Understanding and evaluating racial biases in image captioning. In Proceedings of the IEEE/CVF International Conference on Computer Vision, pages 14830–14840, 2021.

Jieyu Zhao, Tianlu Wang, Mark Yatskar, Vicente Ordonez, and Kai-Wei Chang. Gender bias in coreference resolution: Evaluation and debiasing methods. arXiv preprint arXiv:1804.06876, 2018.

Chuanyang Zheng, Zhengying Liu, Enze Xie, Zhenguo Li, and Yu Li. Progressive-hint prompting improves reasoning in large language models, 2023.

Luowei Zhou, Chenliang Xu, and Jason J Corso. Towards automatic learning of procedures from web instructional videos. In AAAI Conference on Artificial Intelligence, pages 7590–7598, 2018.

<!-- page 54 of 90 -->

Gemini: A Family of Highly Capable Multimodal Models

<!-- page 55 of 90 -->

Gemini: A Family of Highly Capable Multimodal Models

## 9. Contributions and Acknowledgments

**9. 贡献与致谢**

Rohan Anil, Co-Lead, Text Sebastian Borgeaud, Co-Lead, Text Jean-Baptiste Alayrac, Co-Lead, MM Vision Jiahui Yu, Co-Lead, MM Vision Radu Soricut, Co-Lead, MM Vision Johan Schalkwyk, Lead, MM Audio Andrew M. Dai, Co-Lead, Data Anja Hauth, Co-Lead, Data Katie Millican, Co-Lead, Data David Silver, Co-Lead, Fine-Tuning Melvin Johnson, Lead, Instruction Tuning Ioannis Antonoglou, Co-Lead, RL Techniques Julian Schrittwieser, Co-Lead, RL Techniques Amelia Glaese, Lead, Human Data Jilin Chen, Lead, Safety Emily Pitler, Co-Lead, Tool Use Timothy Lillicrap, Co-Lead, Tool Use Angeliki Lazaridou, Co-Lead, Eval Orhan Firat, Co-Lead, Eval James Molloy, Co-Lead, Infra Michael Isard, Co-Lead, Infra Paul R. Barham, Co-Lead, Infra Tom Hennigan, Co-Lead, Infra Benjamin Lee, Co-Lead, Codebase & Parallelism Fabio Viola, Co-Lead, Codebase & Parallelism Malcolm Reynolds, Co-Lead, Codebase & Parallelism Yuanzhong Xu, Co-Lead, Codebase & Parallelism Ryan Doherty, Lead, Ecosystem Eli Collins, Lead, Product Clemens Meyer, Co-Lead, Operations Eliza Rutherford, Co-Lead, Operations Erica Moreira, Co-Lead, Operations Kareem Ayoub, Co-Lead, Operations Megha Goel, Co-Lead, Operations

**Gemini App Leads** Jack Krawczyk, Lead, Gemini App Product Cosmo Du, Co-Lead, Gemini App Research Ed Chi, Co-Lead, Gemini App Research Heng-Tze Cheng, Co-Lead, Gemini App Research Eric Ni, Lead, Gemini App Research Technical Program Management Purvi Shah, Lead, Gemini App Technical Program Management Patrick Kane, Co-Lead, Gemini App Core Modeling, Eval, Data, Product Betty Chan, Co-Lead, Gemini App Core Modeling, Technical Program Management

Manaal Faruqui, Co-Lead, Gemini App Core Modeling, Factuality, Instruction Following Aliaksei Severyn, Co-Lead, Gemini App Core Modeling, Conversationality Hanzhao Lin, Co-Lead, Gemini App Fine-Tuning YaGuang Li, Co-Lead, Gemini App Fine-Tuning Yong Cheng, Co-Lead, Gemini App Fine-Tuning Abe Ittycheriah, Co-Lead, Gemini for Gemini App Mahdis Mahdieh, Co-Lead, Gemini for Gemini App Mia Chen, Co-Lead, Gemini for Gemini App Pei Sun, Co-Lead, Gemini for Gemini App Dustin Tran, Co-Lead, Gemini App Eval Sumit Bagri, Co-Lead, Gemini App Eval, Technical Program Management Balaji Lakshminarayanan, Co-Lead, Gemini App AutoEval Jeremiah Liu, Co-Lead, Gemini App AutoEval Andras Orban, Co-Lead, Gemini App Factuality, Multimodality, Safety Fabian Güra, Co-Lead, Gemini App Factuality Hao Zhou, Co-Lead, Gemini App Factuality Xinying Song, Co-Lead, Gemini App Factuality Aurelien Boffy, Co-Lead, Gemini App Safety Harish Ganapathy, Co-Lead, Gemini Safety Steven Zheng, Lead, Gemini App Multilinguality Research HyunJeong Choe, Lead, Gemini App Multilinguality Ágoston Weisz, Co-Lead, Gemini App Multimodality Tao Zhu, Co-Lead, Gemini App Multimodality Yifeng Lu, Co-Lead, Gemini App Multimodality Siddharth Gopal, Co-Lead, Gemini App Coding & Tool Use Jarrod Kahn, Co-Lead, Gemini App Tool Use Research Maciej Kula, Co-Lead, Gemini App Tool Use Research Jeff Pitman, Co-Lead, Gemini App Tool Use Rushin Shah, Co-Lead, Gemini App Tool Use Emanuel Taropa, Co-Lead, Gemini App Serving Majd Al Merey, Co-Lead, Gemini App Serving Martin Baeuml, Co-Lead, Gemini App Serving Zhifeng Chen, Co-Lead, Gemini App Serving Laurent El Shafey, Co-Lead, Gemini App Fine-Tuning Infra Yujing Zhang, Co-Lead, Gemini App Fine-Tuning Infra Olcan Sercinoglu, Lead, Gemini App Product

<!-- page 56 of 90 -->

Gemini: A Family of Highly Capable Multimodal Models

**Core Contributors** George Tucker Enrique Piqueras Maxim Krikun Iain Barr Nikolay Savinov Ivo Danihelka Becca Roelofs Anaïs White Anders Andreassen Tamara von Glehn Lakshman Yagati Mehran Kazemi Lucas Gonzalez Misha Khalman Jakub Sygnowski Alexandre Frechette Charlotte Smith Laura Culp Lev Proleev Yi Luan Xi Chen James Lottes Nathan Schucher Federico Lebron Alban Rrustemi Natalie Clay Phil Crone Tomas Kocisky Jeffrey Zhao Bartek Perz Dian Yu Heidi Howard Adam Bloniarz Jack W. Rae Han Lu Laurent Sifre Marcello Maggioni Fred Alcober Dan Garrette Megan Barnes Shantanu Thakoor Jacob Austin Gabriel Barth-Maron William Wong Rishabh Joshi Rahma Chaabouni Deeni Fatiha Arun Ahuja

**Core Contributors** Gaurav Singh Tomar Evan Senter Martin Chadwick Ilya Kornakov Nithya Attaluri Iñaki Iturrate Ruibo Liu Yunxuan Li Sarah Cogan Jeremy Chen Chao Jia Chenjie Gu Qiao Zhang Jordan Grimstad Ale Jakse Hartman Xavier Garcia Thanumalayan Sankaranarayana Pillai Jacob Devlin Michael Laskin Diego de Las Casas Dasha Valter Connie Tao Lorenzo Blanco Adrià Puigdomènech Badia David Reitter Mianna Chen Jenny Brennan Clara Rivera Sergey Brin Shariq Iqbal Gabriela Surita Jane Labanowski Abhi Rao Stephanie Winkler Emilio Parisotto Yiming Gu Kate Olszewska Ravi Addanki Antoine Miech Annie Louis Denis Teplyashin Geoff Brown Elliot Catt Jan Balaguer Jackie Xiang Pidong Wang Zoe Ashwood Anton Briukhov

<!-- page 57 of 90 -->

Gemini: A Family of Highly Capable Multimodal Models

**Core Contributors** Albert Webson Sanjay Ganapathy Smit Sanghavi Ajay Kannan Ming-Wei Chang Axel Stjerngren Josip Djolonga Yuting Sun Ankur Bapna Matthew Aitchison Pedram Pejman Henryk Michalewski Tianhe Yu Cindy Wang Juliette Love Junwhan Ahn Dawn Bloxwich Kehang Han Peter Humphreys Thibault Sellam James Bradbury Varun Godbole Sina Samangooei Bogdan Damoc Alex Kaskasoli Sébastien M. R. Arnold Vijay Vasudevan Shubham Agrawal Jason Riesa Dmitry Lepikhin Richard Tanburn Srivatsan Srinivasan Hyeontaek Lim Sarah Hodkinson Pranav Shyam Johan Ferret Steven Hand Ankush Garg Tom Le Paine Jian Li Yujia Li Minh Giang Alexander Neitz Zaheer Abbas Sarah York Machel Reid Elizabeth Cole Aakanksha Chowdhery

**Core Contributors** Dipanjan Das Dominika Rogozińska Vitaly Nikolaev Pablo Sprechmann Zachary Nado Lukas Zilka Flavien Prost Luheng He Marianne Monteiro Gaurav Mishra Chris Welty Josh Newlan Dawei Jia Miltiadis Allamanis Clara Huiyi Hu Raoul de Liedekerke Justin Gilmer Carl Saroufim Shruti Rijhwani Shaobo Hou Disha Shrivastava Anirudh Baddepudi Alex Goldin Adnan Ozturel Albin Cassirer Yunhan Xu Daniel Sohn Devendra Sachan Reinald Kim Amplayo Craig Swanson Dessie Petrova Shashi Narayan Arthur Guez Siddhartha Brahma Jessica Landon Miteyan Patel Ruizhe Zhao Kevin Villela Luyu Wang Wenhao Jia Matthew Rahtz Mai Giménez Legg Yeung James Keeling Petko Georgiev Diana Mincu Boxi Wu Salem Haykal

<!-- page 58 of 90 -->

Gemini: A Family of Highly Capable Multimodal Models

**Core Contributors** Rachel Saputro Kiran Vodrahalli James Qin Zeynep Cankara Abhanshu Sharma Nick Fernando Will Hawkins Behnam Neyshabur Solomon Kim Adrian Hutter Priyanka Agrawal Alex Castro-Ros George van den Driessche Tao Wang Fan Yang Shuo-yiin Chang Paul Komarek Ross McIlroy Mario Lučić Guodong Zhang Wael Farhan Michael Sharman Paul Natsev Paul Michel Yamini Bansal Siyuan Qiao Kris Cao Siamak Shakeri Christina Butterfield Justin Chung Paul Kishan Rubenstein Shivani Agrawal Arthur Mensch Kedar Soparkar Karel Lenc Timothy Chung Aedan Pope Loren Maggiore Jackie Kay Priya Jhakra Shibo Wang Joshua Maynez Mary Phuong Taylor Tobin Andrea Tacchetti Maja Trebacz Kevin Robinson Yash Katariya

**Core Contributors** Sebastian Riedel Paige Bailey Kefan Xiao Nimesh Ghelani Lora Aroyo Ambrose Slone Neil Houlsby Xuehan Xiong Zhen Yang Elena Gribovskaya Jonas Adler Mateo Wirth Lisa Lee Music Li Thais Kagohara Jay Pavagadhi Sophie Bridgers Anna Bortsova Sanjay Ghemawat Zafarali Ahmed Tianqi Liu Richard Powell Vijay Bolina Mariko Iinuma Polina Zablotskaia James Besley Da-Woon Chung Timothy Dozat Ramona Comanescu Xiance Si Jeremy Greer Guolong Su Martin Polacek Raphaël Lopez Kaufman Simon Tokumine Hexiang Hu Elena Buchatskaya Yingjie Miao Mohamed Elhawaty Aditya Siddhant Nenad Tomasev Jinwei Xing Christina Greer Helen Miller Shereen Ashraf Aurko Roy Zizhao Zhang Ada Ma

<!-- page 59 of 90 -->

Gemini: A Family of Highly Capable Multimodal Models

**Core Contributors** Angelos Filos Milos Besta Rory Blevins Ted Klimenko Chih-Kuan Yeh Soravit Changpinyo Jiaqi Mu Oscar Chang Mantas Pajarskas Carrie Muir Vered Cohen Charline Le Lan Krishna Haridasan Amit Marathe Steven Hansen Sholto Douglas Rajkumar Samuel Mingqiu Wang Sophia Austin Chang Lan Jiepu Jiang Justin Chiu Jaime Alonso Lorenzo Lars Lowe Sjösund Sébastien Cevey Zach Gleicher Thi Avrahami Anudhyan Boral Hansa Srinivasan Vittorio Selo Rhys May Konstantinos Aisopos Léonard Hussenot Livio Baldini Soares Kate Baumli Michael B. Chang Adrià Recasens Ben Caine Alexander Pritzel Filip Pavetic Fabio Pardo Anita Gergely Justin Frye Vinay Ramasesh Dan Horgan Kartikeya Badola Nora Kassner Subhrajit Roy

**Core Contributors** Ethan Dyer Víctor Campos Alex Tomala Yunhao Tang Dalia El Badawy Elspeth White Basil Mustafa Oran Lang Abhishek Jindal Sharad Vikram Zhitao Gong Sergi Caelles Ross Hemsley Gregory Thornton Fangxiaoyu Feng Wojciech Stokowiec Ce Zheng Phoebe Thacker Çağlar Ünlü Zhishuai Zhang Mohammad Saleh James Svensson Max Bileschi Piyush Patil Ankesh Anand Roman Ring Katerina Tsihlas Arpi Vezer Marco Selvi Toby Shevlane Mikel Rodriguez Tom Kwiatkowski Samira Daruki Keran Rong Allan Dafoe Nicholas FitzGerald Keren Gu-Lemberg Mina Khan Lisa Anne Hendricks Marie Pellat Vladimir Feinberg James Cobon-Kerr Tara Sainath Maribeth Rauh Sayed Hadi Hashemi Richard Ives Yana Hasson Eric Noland

<!-- page 60 of 90 -->

Gemini: A Family of Highly Capable Multimodal Models

**Core Contributors** Yuan Cao Nathan Byrd Le Hou Qingze Wang Thibault Sottiaux Michela Paganini Jean-Baptiste Lespiau Alexandre Moufarek Samer Hassan Kaushik Shivakumar Joost van Amersfoort Amol Mandhane Pratik Joshi Anirudh Goyal Matthew Tung Andrew Brock Hannah Sheahan Vedant Misra Cheng Li Nemanja Rakićević Mostafa Dehghani Fangyu Liu Sid Mittal Junhyuk Oh Seb Noury Eren Sezener Fantine Huot Matthew Lamm Nicola De Cao Charlie Chen Sidharth Mudgal Romina Stella Kevin Brooks Gautam Vasudevan Chenxi Liu Mainak Chain Nivedita Melinkeri Aaron Cohen Venus Wang Kristie Seymore Sergey Zubkov Rahul Goel Summer Yue Sai Krishnakumaran Brian Albert Nate Hurley Motoki Sano Anhad Mohananey

**Core Contributors** Jonah Joughin Egor Filonov Tomasz Kępa Yomna Eldawy Jiawern Lim Rahul Rishi Shirin Badiezadegan Taylor Bos Jerry Chang Sanil Jain Sri Gayatri Sundara Padmanabhan Subha Puttagunta Kalpesh Krishna Leslie Baker Norbert Kalb Vamsi Bedapudi Adam Kurzrok Shuntong Lei Anthony Yu Oren Litvin Xiang Zhou Zhichun Wu Sam Sobell Andrea Siciliano Alan Papir Robby Neale Jonas Bragagnolo Tej Toor Tina Chen Valentin Anklin Feiran Wang Richie Feng Milad Gholami Kevin Ling Lijuan Liu Jules Walter Hamid Moghaddam Arun Kishore Jakub Adamek Tyler Mercado Jonathan Mallinson Siddhinita Wandekar Stephen Cagle Eran Ofek Guillermo Garrido Clemens Lombriser Maksim Mukha Botu Sun

<!-- page 61 of 90 -->

Gemini: A Family of Highly Capable Multimodal Models

**Core Contributors** Hafeezul Rahman Mohammad Josip Matak Yadi Qian Vikas Peswani Pawel Janus Quan Yuan Leif Schelin Oana David Ankur Garg Yifan He Oleksii Duzhyi Anton Älgmyr Timothée Lottaz Qi Li Vikas Yadav Luyao Xu Alex Chinien Rakesh Shivanna Aleksandr Chuklin Josie Li Carrie Spadine Travis Wolfe Kareem Mohamed Subhabrata Das Zihang Dai Kyle He Daniel von Dincklage Shyam Upadhyay Akanksha Maurya Luyan Chi Sebastian Krause Khalid Salama Pam G Rabinovitch Pavan Kumar Reddy M Aarush Selvan Mikhail Dektiarev Golnaz Ghiasi Erdem Guven Himanshu Gupta Boyi Liu Deepak Sharma Idan Heimlich Shtacher Shachi Paul Oscar Akerlund François-Xavier Aubet Terry Huang Chen Zhu Eric Zhu

**Core Contributors** Elico Teixeira Matthew Fritze Francesco Bertolini Liana-Eleonora Marinescu Martin Bölle Dominik Paulus Khyatti Gupta Tejasi Latkar Max Chang Jason Sanders Roopa Wilson Xuewei Wu Yi-Xuan Tan Lam Nguyen Thiet Tulsee Doshi Sid Lall Swaroop Mishra Wanming Chen Thang Luong Seth Benjamin Jasmine (Sun Jae) Lee Ewa Andrejczuk Dominik Rabiej Vipul Ranjan Krzysztof Styrc Pengcheng Yin Jon Simon Malcolm Rose Harriott Mudit Bansal Alexei Robsky Geoff Bacon David Greene Daniil Mirylenka Chen Zhou Obaid Sarvana Abhimanyu Goyal Samuel Andermatt Patrick Siegler Ben Horn Assaf Israel Francesco Pongetti Chih-Wei “Louis” Chen Marco Selvatici Pedro Silva Kathie Wang Jackson Tolins Kelvin Guu Roey Yogev

<!-- page 62 of 90 -->

Gemini: A Family of Highly Capable Multimodal Models

**Core Contributors** Xiaochen Cai Alessandro Agostini Maulik Shah Hung Nguyen Noah Ó Donnaile Sébastien Pereira Linda Friso Adam Stambler Adam Kurzrok Chenkai Kuang Yan Romanikhin Mark Geller ZJ Yan Kane Jang Cheng-Chun Lee Wojciech Fica Eric Malmi Qijun Tan Dan Banica Daniel Balle Ryan Pham Yanping Huang Diana Avram Hongzhi Shi Jasjot Singh Chris Hidey Niharika Ahuja Pranab Saxena Dan Dooley Srividya Pranavi Potharaju Eileen O’Neill Anand Gokulchandran Ryan Foley Kai Zhao Mike Dusenberry Yuan Liu Pulkit Mehta Ragha Kotikalapudi Chalence Safranek-Shrader Andrew Goodman Joshua Kessinger Eran Globen Prateek Kolhar Chris Gorgolewski Ali Ibrahim Yang Song Ali Eichenbaum Thomas Brovelli

**Core Contributors** Sahitya Potluri Preethi Lahoti Cip Baetu Ali Ghorbani Charles Chen Andy Crawford Shalini Pal Mukund Sridhar Petru Gurita Asier Mujika Igor Petrovski Pierre-Louis Cedoz Chenmei Li Shiyuan Chen Niccolò Dal Santo Siddharth Goyal Jitesh Punjabi Karthik Kappaganthu Chester Kwak Pallavi LV Sarmishta Velury Himadri Choudhury Jamie Hall Premal Shah Ricardo Figueira Matt Thomas Minjie Lu Ting Zhou Chintu Kumar Thomas Jurdi Sharat Chikkerur Yenai Ma Adams Yu Soo Kwak Victor Ähdel Sujeevan Rajayogam Travis Choma Fei Liu Aditya Barua Colin Ji Ji Ho Park Vincent Hellendoorn Alex Bailey Taylan Bilal Huanjie Zhou Mehrdad Khatir Charles Sutton Wojciech Rzadkowski

<!-- page 63 of 90 -->

Gemini: A Family of Highly Capable Multimodal Models

**Core Contributors** Fiona Macintosh Roopali Vij Konstantin Shagin Paul Medina Chen Liang Jinjing Zhou Pararth Shah Yingying Bi Attila Dankovics Shipra Banga Sabine Lehmann Marissa Bredesen Zifan Lin John Eric Hoffmann Jonathan Lai Raynald Chung Kai Yang Nihal Balani Arthur Bražinskas Andrei Sozanschi Matthew Hayes Héctor Fernández Alcalde Peter Makarov Will Chen Antonio Stella Liselotte Snijders Michael Mandl Ante Kärrman Paweł Nowak Xinyi Wu Alex Dyck Krishnan Vaidyanathan Raghavender R Jessica Mallet Mitch Rudominer Eric Johnston Sushil Mittal Akhil Udathu Janara Christensen Vishal Verma Zach Irving Andreas Santucci

**Contributors** Gamaleldin Elsayed Elnaz Davoodi Marin Georgiev Ian Tenney

**Contributors** Nan Hua Geoffrey Cideron Edouard Leurent Mahmoud Alnahlawi Ionut Georgescu Nan Wei Ivy Zheng Dylan Scandinaro Heinrich Jiang Jasper Snoek Mukund Sundararajan Xuezhi Wang Zack Ontiveros Itay Karo Jeremy Cole Vinu Rajashekhar Lara Tumeh Eyal Ben-David Rishub Jain Jonathan Uesato Romina Datta Oskar Bunyan Shimu Wu John Zhang Piotr Stanczyk Ye Zhang David Steiner Subhajit Naskar Michael Azzam Matthew Johnson Adam Paszke Chung-Cheng Chiu Jaume Sanchez Elias Afroz Mohiuddin Faizan Muhammad Jin Miao Andrew Lee Nino Vieillard Jane Park Jiageng Zhang Jeff Stanway Drew Garmon Abhijit Karmarkar Zhe Dong Jong Lee Aviral Kumar Luowei Zhou Jonathan Evens

<!-- page 64 of 90 -->

Gemini: A Family of Highly Capable Multimodal Models

**Contributors** William Isaac Geoffrey Irving Edward Loper Michael Fink Isha Arkatkar Nanxin Chen Izhak Shafran Ivan Petrychenko Zhe Chen Johnson Jia Anselm Levskaya Zhenkai Zhu Peter Grabowski Yu Mao Alberto Magni Kaisheng Yao Javier Snaider Norman Casagrande Evan Palmer Paul Suganthan Alfonso Castaño Irene Giannoumis Wooyeol Kim Mikołaj Rybiński Ashwin Sreevatsa Jennifer Prendki David Soergel Adrian Goedeckemeyer Willi Gierke Mohsen Jafari Meenu Gaba Jeremy Wiesner Diana Gage Wright Yawen Wei Harsha Vashisht Yana Kulizhskaya Jay Hoover Maigo Le Lu Li Chimezie Iwuanyanwu Lu Liu Kevin Ramirez Andrey Khorlin Albert Cui Tian LIN Marcus Wu Ricardo Aguilar Keith Pallo

**Contributors** Abhishek Chakladar Ginger Perng Elena Allica Abellan Mingyang Zhang Ishita Dasgupta Nate Kushman Ivo Penchev Alena Repina Xihui Wu Tom van der Weide Priya Ponnapalli Caroline Kaplan Jiri Simsa Shuangfeng Li Olivier Dousse Fan Yang Jeff Piper Nathan Ie Rama Pasumarthi Nathan Lintz Anitha Vijayakumar Daniel Andor Pedro Valenzuela Minnie Lui Cosmin Paduraru Daiyi Peng Katherine Lee Shuyuan Zhang Somer Greene Duc Dung Nguyen Paula Kurylowicz Cassidy Hardin Lucas Dixon Lili Janzer Kiam Choo Ziqiang Feng Biao Zhang Achintya Singhal Dayou Du Dan McKinnon Natasha Antropova Tolga Bolukbasi Orgad Keller David Reid Daniel Finchelstein Maria Abi Raad Remi Crocker Peter Hawkins

<!-- page 65 of 90 -->

Gemini: A Family of Highly Capable Multimodal Models

**Contributors** Robert Dadashi Colin Gaffney Ken Franko Anna Bulanova Rémi Leblond Shirley Chung Harry Askham Luis C. Cobo Kelvin Xu Felix Fischer Jun Xu Christina Sorokin Chris Alberti Chu-Cheng Lin Colin Evans Alek Dimitriev Hannah Forbes Dylan Banarse Zora Tung Mark Omernick Colton Bishop Rachel Sterneck Rohan Jain Jiawei Xia Ehsan Amid Francesco Piccinno Xingyu Wang Praseem Banzal Daniel J. Mankowitz Alex Polozov Victoria Krakovna Sasha Brown MohammadHossein Bateni Dennis Duan Vlad Firoiu Meghana Thotakuri Tom Natan Matthieu Geist Sertan Girgin Hui Li Jiayu Ye Ofir Roval Reiko Tojo Michael Kwong James Lee-Thorp Christopher Yew Danila Sinopalnikov Sabela Ramos

**Contributors** John Mellor Abhishek Sharma Kathy Wu David Miller Nicolas Sonnerat Denis Vnukov Rory Greig Jennifer Beattie Emily Caveness Libin Bai Julian Eisenschlos Alex Korchemniy Tomy Tsai Mimi Jasarevic Weize Kong Phuong Dao Zeyu Zheng Frederick Liu Fan Yang Rui Zhu Tian Huey Teh Jason Sanmiya Evgeny Gladchenko Nejc Trdin Daniel Toyama Evan Rosen Sasan Tavakkol Linting Xue Chen Elkind Oliver Woodman John Carpenter George Papamakarios Rupert Kemp Sushant Kafle Tanya Grunina Rishika Sinha Alice Talbert Diane Wu Denese Owusu-Afriyie Cosmo Du Chloe Thornton Jordi Pont-Tuset Pradyumna Narayana Jing Li Saaber Fatehi John Wieting Omar Ajmeri Benigno Uria

<!-- page 66 of 90 -->

| Contributors | Contributors |
| --- | --- |
| Yeongil Ko | Prakash Shroff |
| Laura Knight | Mani Varadarajan |
| Amélie Héliou | Sanaz Bahargam |
| Ning Niu | Rob Willoughby |
| Shane Gu | David Gaddy |
| Chenxi Pang | Guillaume Desjardins |
| Yeqing Li | Marco Cornero |
| Nir Levine | Brona Robenek |
| Ariel Stolovich | Bhavishya Mittal |
| Rebeca Santamaria-Fernandez | Ben Albrecht |
| Sonam Goenka | Ashish Shenoy |
| Wenny Yustalim | Fedor Moiseev |
| Robin Strudel | Henrik Jacobsson |
| Ali Elqursh | Alireza Ghaffarkhah |
| Charlie Deck | Morgane Rivière |
| Hyo Lee | Alanna Walton |
| Zonglin Li | Clément Crepy |
| Kyle Levin | Alicia Parrish |
| Raphael Hoffmann | Zongwei Zhou |
| Dan Holtmann-Rice | Clement Farabet |
| Olivier Bachem | Carey Radebaugh |
| Sho Arora | Praveen Srinivasan |
| Christy Koh | Claudia van der Salm |
| Soheil Hassas Yeganeh | Andreas Fidjeland |
| Siim Pöder | Salvatore Scellato |
| Mukarram Tariq | Eri Latorre-Chimoto |
| Yanhua Sun | Hanna Klimczak-Plucińsk |
| Lucian Ionita | David Bridson |
| Mojtaba Seyedhosseini | Dario de Cesare |
| Pouya Tafti | Tom Hudson |
| Zhiyu Liu | Piermaria Mendolicchio |
| Anmol Gulati | Lexi Walker |
| Jasmine Liu | Alex Morris |
| Xinyu Ye | Matthew Mauger |
| Bart Chrzaszcz | Alexey Guseynov |
| Lily Wang | Alison Reid |
| Nikhil Sethi | Seth Odoom |
| Tianrun Li | Lucia Loher |
| Ben Brown | Victor Cotruta |
| Shreya Singh | Madhavi Yenugula |
| Wei Fan | Dominik Grewe |
| Aaron Parisi | Anastasia Petrushkina |
| Joe Stanton | Tom Duerig |
| Vinod Koverkathu | Antonio Sanchez |
| Christopher A. Choquette-Choo | Steve Yadlowsky |
| Yunjie Li | Amy Shen |
| TJ Lu | Amir Globerson |
| Abe Ittycheriah | Lynette Webb |

Gemini: A Family of Highly Capable Multimodal Models

<!-- page 67 of 90 -->

Gemini: A Family of Highly Capable Multimodal Models

**Contributors** Sahil Dua Dong Li Surya Bhupatiraju Dan Hurt Haroon Qureshi Ananth Agarwal Tomer Shani Matan Eyal Anuj Khare Shreyas Rammohan Belle Lei Wang Chetan Tekur Mihir Sanjay Kale Jinliang Wei Ruoxin Sang Brennan Saeta Tyler Liechty Yi Sun Yao Zhao Stephan Lee Pandu Nayak Doug Fritz Manish Reddy Vuyyuru John Aslanides Nidhi Vyas Martin Wicke Xiao Ma Evgenii Eltyshev Nina Martin Hardie Cate James Manyika Keyvan Amiri Yelin Kim Xi Xiong Kai Kang Florian Luisier Nilesh Tripuraneni David Madras Mandy Guo Austin Waters Oliver Wang Joshua Ainslie Jason Baldridge Han Zhang Garima Pruthi Jakob Bauer Feng Yang Riham Mansour

**Contributors** Jason Gelman Yang Xu George Polovets Ji Liu Honglong Cai Warren Chen XiangHai Sheng Emily Xue Sherjil Ozair Christof Angermueller Xiaowei Li Anoop Sinha Weiren Wang Julia Wiesinger Emmanouil Koukoumidi Yuan Tian Anand Iyer Madhu Gurumurthy Mark Goldenson Parashar Shah MK Blake Hongkun Yu Anthony Urbanowicz Jennimaria Palomaki Chrisantha Fernando Ken Durden Harsh Mehta Nikola Momchev Elahe Rahimtoroghi Maria Georgaki Amit Raul Sebastian Ruder Morgan Redshaw Jinhyuk Lee Denny Zhou Komal Jalan Dinghua Li Blake Hechtman Parker Schuh Milad Nasr Kieran Milan Vladimir Mikulik Juliana Franco Tim Green Nam Nguyen Joe Kelley Aroma Mahendru Andrea Hu

<!-- page 68 of 90 -->

Gemini: A Family of Highly Capable Multimodal Models

**Contributors** Joshua Howland Ben Vargas Jeffrey Hui Kshitij Bansal Vikram Rao Rakesh Ghiya Emma Wang Ke Ye Jean Michel Sarr Melanie Moranski Presto Madeleine Elish Steve Li Aakash Kaku Jigar Gupta Ice Pasupat Da-Cheng Juan Milan Someswar Tejvi M. Xinyun Chen Aida Amini Alex Fabrikant Eric Chu Xuanyi Dong Amruta Muthal Senaka Buthpitiya Sarthak Jauhari Nan Hua Urvashi Khandelwal Ayal Hitron Jie Ren Larissa Rinaldi Shahar Drath Avigail Dabush Nan-Jiang Jiang Harshal Godhia Uli Sachs Anthony Chen Yicheng Fan Hagai Taitelbaum Hila Noga Zhuyun Dai James Wang Chen Liang Jenny Hamer Chun-Sung Ferng Chenel Elkind Aviel Atias Paulina Lee

**Contributors** Vít Listík Mathias Carlen Jan van de Kerkhof Marcin Pikus Krunoslav Zaher Paul Müller Sasha Zykova Richard Stefanec Vitaly Gatsko Christoph Hirnschall Ashwin Sethi Xingyu Federico Xu Chetan Ahuja Beth Tsai Anca Stefanoiu Bo Feng Keshav Dhandhania Manish Katyal Akshay Gupta Atharva Parulekar Divya Pitta Jing Zhao Vivaan Bhatia Yashodha Bhavnani Omar Alhadlaq Xiaolin Li Peter Danenberg Dennis Tu Alex Pine Vera Filippova Abhipso Ghosh Ben Limonchik Bhargava Urala Chaitanya Krishna Lanka Derik Clive Yi Sun Edward Li Hao Wu Kevin Hongtongsak Ianna Li Kalind Thakkar Kuanysh Omarov Kushal Majmundar Michael Alverson Michael Kucharski Mohak Patel Mudit Jain Maksim Zabelin

<!-- page 69 of 90 -->

Gemini: A Family of Highly Capable Multimodal Models

| Contributors | Gemini App Program Leads |
| --- | --- |
| Paolo Pelagatti | Amar Subramanya7 |
| Rohan Kohli | Sissie Hsiao |
| Saurabh Kumar |  |
| Joseph Kim | Gemini Program Leads |
| Swetha Sankar | Demis Hassabis |
| Vineet Shah | Koray Kavukcuoglu |
| Lakshmi Ramachandruni |  |
| Xiangkai Zeng | Overall Gemini App Technical Leads |
| Ben Bariach | Adam Sadovsky8 |
| Laura Weidinger | Quoc Le |
| Tu Vu | Trevor Strohman9 |
| Alek Andreev | Yonghui Wu10 |
| Antoine He |  |
| Kevin Hui | Overall Gemini Post-Training Lead |
| Sheleem Kashem | Slav Petrov |
|  | Overall Gemini Technical Leads (equal contribution) |
|  | Jeffrey Dean |
|  | Oriol Vinyals |

The roles are defined as below:

角色定义如下:

• Lead: Individual(s) responsible for the sub-team throughout the project.

• Lead: 在整个项目期间负责子团队的人.

• Core Contributor: Individual that had significant impact throughout the project.

• Core Contributor: 在整个项目中有重大影响的人.

• Contributor: Individual that had contributions to the project and was partially involved with the effort.

• Contributor: 对项目有贡献, 部分参与了这项工作的人.

• Program Lead: Responsible for the organizational aspects of the Gemini effort.

• Program Lead: 负责 Gemini 工作的组织事务.

• Overall Post-Training Lead: Responsible for the technical direction of post-training.

• Overall Post-Training Lead: 负责后训练的技术方向.

• Overall Technical Lead: Responsible for the technical direction of the overall Gemini effort.

• Overall Technical Lead: 负责整个 Gemini 工作的技术方向.

Within each role, contributions are equal, and are listed in a randomized order. Ordering within each role does not indicate ordering of the contributions.

每个角色内的贡献相同, 按随机顺序列出. 角色内的排序不代表贡献排序.

Gemini is a cross-Google effort, with members from Google DeepMind (GDM), Google Research (GR), Bard/Assistant, Knowledge and Information (K&I), Core ML, Cloud, Labs, and more.

Gemini 是横跨 Google 的工作, 成员来自 Google DeepMind (GDM), Google Research (GR), Bard/Assistant, Knowledge and Information (K&I), Core ML, Cloud, Labs 等.

We thank Aakanksha Chowdhery, Dustin Tran, Heng-Tze Cheng, Jack W. Rae, Kate Olszewska, Mariko Iinuma, Peter Humphreys, Shashi Narayan, and Steven Zheng for leading the preparation of this report. We also thank our reviewers and colleagues for their valuable discussions and feedback on the report — Alexandra Belias, Ana Ramalho, Anand Rao, Arielle Bier, Danielle Landress, Eleanor Tomlinson, Emily Hossellman, Gaby Pearl, Helen King, Hollie Dobson, Jaclyn Konzelmann, Jennifer

感谢 Aakanksha Chowdhery, Dustin Tran, Heng-Tze Cheng, Jack W. Rae, Kate Olszewska, Mariko Iinuma, Peter Humphreys, Shashi Narayan 和 Steven Zheng 牵头准备本报告. 也感谢审阅者和同事对本报告的宝贵讨论和反馈 (名单见英文, 跨页续完).

<small><span class="docvortex-page-footnote" data-block-type="page_footnote" style="color:#6b7280"><sup>7</sup>Lead, Gemini App Engineering</span></small>

<small><span class="docvortex-page-footnote" data-block-type="page_footnote" style="color:#6b7280"><sup>8</sup>Lead, Gemini App Core Modeling, Eval, Data</span></small>

<small><span class="docvortex-page-footnote" data-block-type="page_footnote" style="color:#6b7280"><sup>9</sup>Co-Lead, Gemini App Serving</span></small>

<small><span class="docvortex-page-footnote" data-block-type="page_footnote" style="color:#6b7280">10<sub>Co</sub>-<sub>L</sub>ead, Gemini Text</span></small>

<!-- page 70 of 90 -->

Gemini: A Family of Highly Capable Multimodal Models

Beroshi, Joel Moss, Jon Small, Jonathan Fildes, Kathy Meier-Hellstern, Lisa Patel, Oli Gaymond, Rebecca Bland, Reena Jana, Tessa Lueth, and Tom Lue.

Our work is made possible by the dedication and efforts of numerous teams at Google. We would like to acknowledge the support from Abhi Mohan, Adekunle Bello, Aishwarya Nagarajan, Alaa Saade, Alejandro Lince, Alexander Chen, Alexander Kolbasov, Alexander Schiffhauer, Ameya Shringi, Amin Vahdat, Anda Rabatić, Anthonie Gross, Antoine Yang, Anthony Green, Anton Ruddock, Art Khurshudov, Artemis Chen, Arthur Argenson, Avinatan Hassidim, Beiye Liu, Benjamin Schroeder, Bin Ni, Brett Daw, Bryan Chiang, Burak Gokturk, Carl Crous, Carrie Grimes Bostock, Charbel Kaed, Charlotte Banks, Che Diaz, Chris Larkin, Christy Lian, Claire Cui, Clare Bycroft, Corentin Tallec, Daniel Herndon, Dave Burke, David Battle, David Engel, Dipannita Shaw, Donghyun Koo, Doug Ritchie, Dragos Stefanescu, Elissa Wolf, Emre Sargin, Eric Herren, Estella King, Fatema Alkhanaizi, Felix Gimeno, Fernando Pereira, Florent Altché, Gabriel Carvajal, Gaurav Gandhi, George Powell, Goran Pavičić, Harry Richardson, Hassan Wassel, Hongji Li, Idan Szpektor, Igor Ivanisevic, Ivan Jambrešić, Ivan Jurin, Jade Fowler, James Assiene, Jay Yagnik, Jean-bastien Grill, Jeff Seibert, Jenna LaPlante, Jessica Austin, Jianxing Lu, Jim O’Keeffe, Jin Huang, Joe Heyward, Johannes Welbl, John Jumper, Jonathan Caton, Josh Woodward, Joshua Foster, Kathryn Tunyasuvunakool, Katrina Wong, Kavya Kopparapu, Kelvin Nguyen, Kira Yin, Konstantin Sharlaimov, Kun Li, Lee Hong, Lilly Taylor, Longfei Shen, Luc Mercier, Maciej Mikuła, Mania Abdi, Manuel Sanchez, Maria Ines Aranguren, Mario Carlos Cortes III, Matthew Tait, Matthias Lochbrunner, Mehdi Ghissassi, Micah Mosley, Michael Bendersky, Michael Figurnov, Michael Harris, Michael Mathieu, Michael O’Neill, Michael Vorburger, Mihir Paradkar, Nandita Dukkipati, Nathan Carter, Nathan Watson, Neil Rabinowitz, Nikhil Dandekar, Nishant Ranka, Olcan Sercinoglu, Olivier Lacombe, Ottavia Bertolli, Paul Caron, Pranesh Srinivasan, Praveen Kumar, Rahul Sukthankar, Raia Hadsell, Rajagopal Ananthanarayanan, Roberto Lupi, Rosie Zou, Sachin Menezes, Sadegh Jazayeri, Sam Cheung, Sameer Bidichandani, Sania Alex, Sanjiv Kumar, Sara Wiltberger, Sarah Fitzgerald, Saz Basu, Sebastian Nowozin, Shannon Hepburn, Shayne Cardwell,Srinivasan Venkatachary, Sugato Basu, Sundar Pichai, Sundeep Tirumalareddy, Susannah Young, Swetha Vijayaraghavan, Tania Bedrax-Weiss, Taylor Applebaum, Teiva Harsanyi, Terry Chen, Tim Blyth, Ting Liu, Tom Cobley, Tomas Izo, Trystan Upstill, Varun Singhai, Vedrana Klarić Trupčević, Victor Cai, Vladimir Pudovkin, Vu Dang, Wenbo Zhao, Wesley Crow, Wesley Szeng, Xiaodan Song, Yazhou Zu, Ye Tian, Yicong Wang, Yixing Wang, Yossi Matias, Yunlong Jiao, Zachary Jessup, Zhenchuan Pang, Žiga Avsec, Zimeng Yang, and Zoubin Ghahramani. We’d also like to recognize the AlphaCode team, the Borg Scheduling team, the Facilities team, the Gemini Demo Team, the Global Server Ops (GSO) team, the JAX team, the the Legal team, ML SRE team, the ML Supercomputer (MLSC) team, the PartIR team, the Platforms Infrastructure Engineering (PIE) team, and the XLA Compiler team.

我们的工作离不开 Google 众多团队的投入和努力. 感谢上文英文名单中各位同事的支持. 我们也感谢 AlphaCode 团队, Borg 调度团队, 设施团队, Gemini 演示团队, 全球服务器运营 (GSO) 团队, JAX 团队, 法务团队, ML SRE 团队, ML 超级计算机 (MLSC) 团队, PartIR 团队, 平台基础设施工程 (PIE) 团队和 XLA 编译器团队.

We thank everyone at Google not explicitly mentioned above, who have shared excitement, given feedback on early Gemini models or created interesting demo uses of Gemini, and worked with or supported the core Gemini team on many aspects of this project.

感谢上文未一一提及的所有 Google 同事, 他们分享热情, 对早期 Gemini 模型给出反馈或做出有趣的 Gemini 演示, 并在这个项目的许多方面与 Gemini 核心团队合作或给予支持.

<!-- page 71 of 90 -->

Gemini: A Family of Highly Capable Multimodal Models

## 10. Appendix

## 10.1. Gemini Ultra Model Card

**10.1. Gemini Ultra 模型卡**

<table><tr><td colspan="2">Model summary</td></tr><tr><td>Model architecture</td><td>Gemini V1.0 is a new family of state-of-the-art language models, containing variants known as Nano, Pro and Ultra (ordered by parameter count) based on a decoder-only Transformer architecture (Vaswani et al., 2017a). Models are trained to support 32K context length, employing efficient attention mechanisms such as multi-query attention (Shazeer, 2019b). Gemini is trained jointly across image, audio, video and text data for the purpose of building a model with both strong generalist capabilities across modalities alongside cutting-edge understanding and reasoning performance in each respective domain.The post-trained models described in this model card are Gemini API and Gemini Apps model variants (Section 6) built on top of the Gemini Ultra pre-trained model. During the post-training process, additional architectural modifications are also made to support the training of multi-objective reward models for RLHF.</td></tr><tr><td>Input(s)</td><td>Text (e.g. a question, a prompt, a document(s) to be summarized), images, video, audio files.</td></tr><tr><td>Output(s)</td><td>Generated text in response to the input (e.g. an answer to the question, a summary of multiple documents, comparing documents/videos).</td></tr><tr><td colspan="2">Usage</td></tr><tr><td>Application</td><td>Gemini is designed for accelerating research on language models, for use as a building block in features within Google products, and as a building block for select applications such as Gemini App and Search Generative Experience.Services and products built on top of Gemini Ultra are also being made available to external developers via Google Cloud Vertex API and Google Labs, with additional process and technical safeguards related to safety policies.</td></tr><tr><td>Known Caveats</td><td>Gemini should not be made available as part of a general-purpose service or product, or used within a specific downstream application without a prior assessment and mitigation of the safety and fairness concerns specific to the downstream use.</td></tr></table>

模型摘要. 模型架构: Gemini V1.0 是一个新的最先进语言模型家族, 包含 Nano, Pro 和 Ultra 三个变体 (按参数量排序), 基于仅解码器的 Transformer 架构 (Vaswani et al., 2017a). 模型训练时支持 32K 上下文长度, 使用 multi-query attention (Shazeer, 2019b) 等高效注意力机制. Gemini 在图像, 音频, 视频和文本数据上联合训练, 目标是得到既有跨模态强通用能力, 又在各领域有前沿理解与推理表现的模型. 本模型卡描述的后训练模型是建立在 Gemini Ultra 预训练模型之上的 Gemini API 和 Gemini Apps 变体 (第 6 节). 后训练过程中还做了额外的架构修改, 以支持为 RLHF 训练多目标奖励模型. 输入: 文本 (如问题, prompt, 待摘要的文档), 图像, 视频, 音频文件. 输出: 针对输入生成的文本 (如问题的答案, 多篇文档的摘要, 对文档/视频的比较). 用途. 应用: Gemini 用于加速语言模型研究, 作为 Google 产品功能的构件, 以及作为 Gemini App 和 Search Generative Experience 等特定应用的构件. 基于 Gemini Ultra 的服务和产品也通过 Google Cloud Vertex API 和 Google Labs 向外部开发者提供, 并附有与安全政策相关的额外流程和技术保障. 已知注意事项: 在未事先评估并缓解下游用途特有的安全与公平问题之前, 不应把 Gemini 作为通用服务或产品的一部分提供, 也不应在特定下游应用中使用.

<!-- page 72 of 90 -->

Gemini: A Family of Highly Capable Multimodal Models

<table><tr><td></td><td>Implementation Frameworks</td></tr><tr><td rowspan="5">Hardware &amp; Software</td><td>Hardware: Training was conducted on TPUv4 and TPUv5e (Jouppi et al., 2020, 2023).</td></tr><tr><td>Software: JAX (Bradbury et al., 2018), ML Pathways (Dean, 2021).</td></tr><tr><td>JAX allows researchers to leverage the latest generation of hardware, including TPUs, for faster and more efficient training of large models.</td></tr><tr><td>ML Pathways is infrastructure software to support Google&#x27;s efforts to build artificially intelligent systems capable of generalizing across multiple tasks. This is specially suitable for foundation models, including large language models like the Gemini V1.0 models.</td></tr><tr><td>Together, JAX and ML Pathways are used as described in Section 3. The &#x27;single controller&#x27; programming model of JAX and ML Pathways allows a single Python process to orchestrate the entire training run, dramatically simplifying the development workflow.</td></tr><tr><td>Compute Requirements</td><td>Not reported.</td></tr><tr><td></td><td>Model Characteristics</td></tr><tr><td>Model initialization</td><td>Initial pretraining used random initialization. Post-training was initialized from checkpoints obtained at the later stages of pre-training. These checkpoints were fine-tuned using supervised fine-tuning, and subsequently used to initialize reward model training and RLHF.</td></tr><tr><td>Model Status</td><td>This is a static model trained on an offline dataset.</td></tr><tr><td>Model Stats</td><td>Not reported.</td></tr><tr><td></td><td>Data overview</td></tr><tr><td>Training Dataset</td><td>Gemini models are trained on a dataset that is both multimodal and multilingual. Our pre-training dataset uses data from web documents, books, and code, and includes image, audio, and video data.Refer to Section 4 (Pre-Training Dataset) for further details.</td></tr></table>

实现框架. 硬件与软件: 训练在 TPUv4 和 TPUv5e 上进行 (Jouppi et al., 2020, 2023). 软件: JAX (Bradbury et al., 2018), ML Pathways (Dean, 2021). JAX 让研究者能利用包括 TPU 在内的最新一代硬件, 更快更高效地训练大模型. ML Pathways 是基础设施软件, 支持 Google 构建能跨多个任务泛化的人工智能系统, 特别适合基础模型, 包括 Gemini V1.0 这样的大语言模型. JAX 和 ML Pathways 按第 3 节所述方式共同使用, 其 「single controller」 编程模型让单个 Python 进程编排整个训练过程, 大大简化开发流程. 算力需求: 未报告. 模型特性. 模型初始化: 最初的预训练使用随机初始化. 后训练从预训练后期得到的 checkpoint 初始化. 这些 checkpoint 先做监督微调, 再用于初始化奖励模型训练和 RLHF. 模型状态: 这是在离线数据集上训练的静态模型. 模型统计: 未报告. 数据概览. 训练数据集: Gemini 模型在一个既多模态又多语言的数据集上训练. 预训练数据来自网页文档, 书籍和代码, 并包含图像, 音频和视频数据. 详见第 4 节 (预训练数据集).

> **想:** Ultra 和 Pro 到底多大?
> 全文只给了 Nano-1 的 1.8B 和 Nano-2 的 3.25B (表 1). 模型卡里 Model Stats 和 Compute Requirements 两栏都是 「Not reported」, 只说 Nano, Pro, Ultra 按参数量排序. 第 4 节说最大模型的 token 数按 Hoffmann et al. (2022) 确定, 但参数量和 token 数都没给, 这个方法也就无从复算.

<!-- page 73 of 90 -->

Gemini: A Family of Highly Capable Multimodal Models

<table><tr><td>Evaluation Dataset</td><td>We compare pre- and post-trained Gemini Ultra models to a suite of external LLMs and our previous best model PaLM 2 across a series of text-based academic benchmarks covering reasoning, reading comprehension, STEM, and coding.We also evaluate Gemini models on four different multimodal capabilities: high-level object recognition using captioning or question-answering tasks such as VQAv2; fine-grained transcription using tasks such as TextVQA and DocVQA requiring the model to recognize low-level details; chart understanding requiring spatial understanding of input layout using ChartQA and InfographicVQA tasks; and multimodal reasoning using tasks such as Ai2D, MathVista and MMMU.Refer to Section 5 (Evaluation) for further details.</td></tr><tr><td>Post-training Dataset</td><td>For post-training, we first collect a diverse set of prompts that are representative of real-world use cases. We then collect demonstration data of what the model&#x27;s output should be for a given prompt for supervised fine-tuning. We further collect different possible responses to a given prompt, and collect feedback data over these to train reward models.Refer to Section 6.3 (Post-Training Methods and Data) for further details.</td></tr><tr><td colspan="2">Evaluation Results</td></tr><tr><td colspan="2">Model Usage &amp; Limitations</td></tr><tr><td>Sensitive Use</td><td>For an analysis of risks and sensitive uses associated with the Gemini models, see Section 7.1 (Impact Assessment).</td></tr><tr><td>Known Limitations</td><td>Gemini models can exhibit limitations outlined in Section 7.1 (Impact Assessment). Gemini models should not be used for downstream applications without further analysis of potential harm in the proposed downstream application.</td></tr><tr><td>Ethical Considerations &amp; Risks</td><td>A reflection on the potential risks and impacts of the Gemini V1.0 models can be found in Section 7 (Responsible Deployment). For evaluation details for a range of risks, see Section 7.4 (Safety Evaluations).</td></tr></table>

评测数据集: 我们在一系列文本学术基准上把预训练和后训练的 Gemini Ultra 同一组外部 LLM 以及之前最好的模型 PaLM 2 比较, 覆盖推理, 阅读理解, STEM 和编程. 我们还在四种多模态能力上评测 Gemini 模型: 用 VQAv2 等描述或问答任务测高层物体识别; 用 TextVQA 和 DocVQA 等需识别底层细节的任务测细粒度转写; 用 ChartQA 和 InfographicVQA 测需要理解输入布局空间关系的图表理解; 用 Ai2D, MathVista 和 MMMU 等任务测多模态推理. 详见第 5 节 (评测). 后训练数据集: 后训练时, 我们先收集一组能代表真实用例的多样 prompt, 再为监督微调收集对给定 prompt 模型应输出什么的示范数据, 并进一步为给定 prompt 收集不同的可能回答, 在其上收集反馈数据以训练奖励模型. 详见 6.3 节 (后训练方法与数据). 评测结果: 本栏为空. 模型使用与局限. 敏感用途: Gemini 模型相关风险和敏感用途的分析见 7.1 节 (影响评估). 已知局限: Gemini 模型可能表现出 7.1 节 (影响评估) 所述的局限. 未对拟定下游应用的潜在危害做进一步分析前, 不应把 Gemini 模型用于下游应用. 伦理考量与风险: 对 Gemini V1.0 模型潜在风险和影响的思考见第 7 节 (负责任的部署). 各类风险的评测细节见 7.4 节 (安全评测).

## 10.2. Chain-of-Thought Comparisons on MMLU benchmark

**10.2. MMLU 基准上的 Chain-of-Thought 比较**

We contrast several chain-of-thought approaches on MMLU and discuss their results in this section. We proposed a new approach where model produces k chain-of-thought samples, selects the majority vote if the model is confident above a threshold, and otherwise defers to the greedy sample choice. The

本节对比 MMLU 上的几种 chain-of-thought 方法并讨论结果. 我们提出一种新方法: 模型生成 k 条 chain-of-thought 样本, 若模型置信度超过阈值就选多数票, 否则退回 greedy 样本的选择.

<!-- page 74 of 90 -->

Gemini: A Family of Highly Capable Multimodal Models

thresholds are optimized for each model based on their validation split performance. The proposed approach is referred to as uncertainty-routed chain-of-thought. The intuition behind this approach is that chain-of-thought samples might degrade performance compared to the maximum-likelihood decision when the model is demonstrably inconsistent. We compare the gains from the proposed approach on both Gemini Ultra and GPT-4 in Figure 9. We find that Gemini Ultra benefits more from this approach compared to using only chain-of-thought samples. GPT-4’s performance improves from 84.2% with greedy sampling to 87.3% with uncertainty-routed chain-of-thought approach with 32 samples, but it already achieves these gains from using 32 chain-of-thought samples. In contrast, Gemini Ultra improves its performance significantly from 84.0% with greedy sampling to 90.0% with uncertainty-routed chain-of-thought approach with 32 samples while it marginally improves to 85.0% with the use of 32 chain-of-thought samples only.

(接上页) 阈值按各模型在验证集上的表现分别优化. 这种方法称为不确定性路由的 chain-of-thought (uncertainty-routed chain-of-thought). 其直觉是: 当模型明显前后不一致时, chain-of-thought 样本的表现可能不如最大似然决策. 我们在图 9 中比较这种方法给 Gemini Ultra 和 GPT-4 带来的提升. 我们发现, 与只用 chain-of-thought 样本相比, Gemini Ultra 从这种方法中获益更多. GPT-4 的表现从 greedy 采样的 84.2% 提高到 32 个样本的不确定性路由 chain-of-thought 的 87.3%, 但它只用 32 个 chain-of-thought 样本就已经拿到这些提升. 相比之下, Gemini Ultra 从 greedy 采样的 84.0% 显著提高到 32 个样本的不确定性路由 chain-of-thought 的 90.0%, 而只用 32 个 chain-of-thought 样本时仅略微提高到 85.0%.

> **回看:** 从 84.0% 到 90.0% 的 6 个点, 有多少是 32 次采样本身带来的?
> 本段和 图 9: Ultra greedy 84.0%, 只用 32 条 CoT 是 85.0%, 路由后 90.0%. 纯 CoT 只加 1 个点, 其余 5 个点来自 「不一致就退回 greedy」 这个开关. GPT-4 是 greedy 84.2%, 路由 87.3%, 而 32 条 CoT 已拿到同样的提升. greedy 下 Ultra 的 84.0% 反而比 GPT-4 低 0.2.

![Chart block](images/p74-figure-9-chain-of-thought-with-uncertainty-routing-on.png)

Figure 9 | Chain-of-Thought with uncertainty routing on MMLU.

图 9 | MMLU 上带不确定性路由的 Chain-of-Thought.

<!-- page 75 of 90 -->

Gemini: A Family of Highly Capable Multimodal Models

## 10.3. Capabilities and Benchmarking Tasks

**10.3. 能力与基准任务**

We use more than 50 benchmarks as a holistic harness to evaluate the Gemini models across text, image, audio and video. We provide a detailed list of benchmarking tasks for six different capabilities in text understanding and generation: factuality, long context, math/science, reasoning, summarization, and multilinguality. We also enumerate the benchmarks used for image understanding, video understanding, and audio understanding tasks.

我们用 50 多个基准组成综合评测, 在文本, 图像, 音频和视频上评估 Gemini 模型. 下面详细列出文本理解与生成中六种能力的基准任务: 事实性, 长上下文, 数学/科学, 推理, 摘要和多语言. 我们也列出图像理解, 视频理解和音频理解任务所用的基准.

• **Factuality**: We use 5 benchmarks: BoolQ (Clark et al., 2019), NaturalQuestions-Closed (Kwiatkowski et al., 2019a), NaturalQuestions-Retrieved (Kwiatkowski et al., 2019a), RealtimeQA (Kasai et al., 2022b), TydiQA-noContext and TydiQA-goldP (Clark et al., 2020).

• **事实性**: 使用 5 个基准: BoolQ (Clark et al., 2019), NaturalQuestions-Closed (Kwiatkowski et al., 2019a), NaturalQuestions-Retrieved (Kwiatkowski et al., 2019a), RealtimeQA (Kasai et al., 2022b), TydiQA-noContext 和 TydiQA-goldP (Clark et al., 2020).

• **Long Context**: We use 6 benchmarks: NarrativeQA (Kočiský et al., 2018), Scrolls-Qasper, Scrolls-Quality (Shaham et al., 2022), XLsum (En), XLSum (non-English languages) (Hasan et al., 2021), and one other internal benchmark.

• **长上下文**: 使用 6 个基准: NarrativeQA (Kočiský et al., 2018), Scrolls-Qasper, Scrolls-Quality (Shaham et al., 2022), XLsum (En), XLSum (非英语) (Hasan et al., 2021), 以及另一个内部基准.

• **Math/Science**: We use 8 benchmarks: GSM8k (with CoT) (Cobbe et al., 2021), Hendryck’s MATH pass@1 (Hendrycks et al., 2021b), MMLU (Hendrycks et al., 2021a), Math-StackExchange, Math-AMC 2022-2023 problems, and three other internal benchmarks.

• **数学/科学**: 使用 8 个基准: GSM8k (带 CoT) (Cobbe et al., 2021), Hendryck's MATH pass@1 (Hendrycks et al., 2021b), MMLU (Hendrycks et al., 2021a), Math-StackExchange, Math-AMC 2022-2023 题目, 以及另外三个内部基准.

• **Reasoning**: We use 7 benchmarks: BigBench Hard (with CoT) (Srivastava et al., 2022; Suzgun et al., 2022), CLRS (Veličković et al., 2022), Proof Writer (Tafjord et al., 2020), Reasoning-Fermi problems (Kalyan et al., 2021), Lambada (Paperno et al., 2016), HellaSwag (Zellers et al., 2019), DROP (Dua et al., 2019).

• **推理**: 使用 7 个基准: BigBench Hard (带 CoT) (Srivastava et al., 2022; Suzgun et al., 2022), CLRS (Veličković et al., 2022), Proof Writer (Tafjord et al., 2020), Reasoning-Fermi problems (Kalyan et al., 2021), Lambada (Paperno et al., 2016), HellaSwag (Zellers et al., 2019), DROP (Dua et al., 2019).

• **Summarization**: We use 5 benchmarks: XL Sum (English), XL Sum (non-English languages) (Hasan et al., 2021), WikiLingua (non-English languages), WikiLingua (English) (Ladhak et al., 2020), XSum (Narayan et al., 2018).

• **摘要**: 使用 5 个基准: XL Sum (英语), XL Sum (非英语) (Hasan et al., 2021), WikiLingua (非英语), WikiLingua (英语) (Ladhak et al., 2020), XSum (Narayan et al., 2018).

• **Multilinguality**: We use 10 benchmarks: XLSum (Non-English languages) (Hasan et al., 2021), WMT22 (Kocmi et al., 2022), WMT23 (Tom et al., 2023), FRMT (Riley et al., 2023), WikiLingua (Non-English languages) (Ladhak et al., 2020), TydiQA (no context), TydiQA (GoldP) (Clark et al., 2020), MGSM (Shi et al., 2023), translated MMLU (Hendrycks et al., 2021a), NTREX (Federmann et al., 2022), FLORES-200 (Team et al., 2022).

• **多语言**: 使用 10 个基准: XLSum (非英语) (Hasan et al., 2021), WMT22 (Kocmi et al., 2022), WMT23 (Tom et al., 2023), FRMT (Riley et al., 2023), WikiLingua (非英语) (Ladhak et al., 2020), TydiQA (无上下文), TydiQA (GoldP) (Clark et al., 2020), MGSM (Shi et al., 2023), 翻译版 MMLU (Hendrycks et al., 2021a), NTREX (Federmann et al., 2022), FLORES-200 (Team et al., 2022).

**Image and Video**: We use 9 benchmarks for image understanding: MMMU (Yue et al., 2023), TextVQA (Singh et al., 2019), DocVQA (Mathew et al., 2021), ChartQA (Masry et al., 2022), InfographicVQA (Mathew et al., 2022), MathVista (Lu et al., 2023), AI2D (Kembhavi et al., 2016), VQAv2 (Goyal et al., 2017), XM3600 (Thapliyal et al., 2022) for multi-lingual image understanding, and 6 benchmarks for video understanding: VATEX (Wang et al., 2019) for captioning in two different languages, YouCook2 (Zhou et al., 2018), NextQA (Xiao et al., 2021), ActivityNet-QA (Yu et al., 2019), and Perception Test MCQA (Pătrăucean et al., 2023).

**图像与视频**: 图像理解使用 9 个基准: MMMU (Yue et al., 2023), TextVQA (Singh et al., 2019), DocVQA (Mathew et al., 2021), ChartQA (Masry et al., 2022), InfographicVQA (Mathew et al., 2022), MathVista (Lu et al., 2023), AI2D (Kembhavi et al., 2016), VQAv2 (Goyal et al., 2017), 以及用于多语言图像理解的 XM3600 (Thapliyal et al., 2022); 视频理解使用 6 个基准: 用于两种语言描述的 VATEX (Wang et al., 2019), YouCook2 (Zhou et al., 2018), NextQA (Xiao et al., 2021), ActivityNet-QA (Yu et al., 2019) 和 Perception Test MCQA (Pătrăucean et al., 2023).

• **Audio**: We use 5 benchmarks including automatic speech recognition (ASR) tasks such as FLEURS (Conneau et al., 2023), VoxPopuli (Wang et al., 2021), Multi-lingual Librispeech (Pratap et al., 2020), and automatic speech translation task such as CoVoST 2 (Wang et al., 2020).

• **音频**: 使用 5 个基准, 包括自动语音识别 (ASR) 任务, 如 FLEURS (Conneau et al., 2023), VoxPopuli (Wang et al., 2021), Multi-lingual Librispeech (Pratap et al., 2020), 以及自动语音翻译任务, 如 CoVoST 2 (Wang et al., 2020).

<!-- page 76 of 90 -->

Gemini: A Family of Highly Capable Multimodal Models

## 10.4. Qualitative Examples

**10.4. 定性例子**

This section shows sample qualitative examples from prompting the Gemini Ultra model. Some illustrative examples of multimodal reasoning for image understanding tasks over charts, natural images and memes are shown in Figures 10, 11, 13, 15, 16, and 17. Figure 12 shows an example of image generation capabilities of Gemini Ultra where the user generates an interleaved sequence of image and text to design a blog post. Beyond English, Figure 18 shows model’s capability to understand images in a multilingual setting. Gemini models also show strong performance on multimodal image understanding and reasoning in mathematics, as shown in Figures 14, 20 and 21. Figure 22 is an example of complex multimodal reasoning demonstrating how the model composes complex image understanding, code generation, and instruction following capabilities for a given user task. In Figure 19, we see another example of the model being able to generate working code and follow complex user instructions. Finally, Figure 23 shows an example of Gemini Ultra’s capability of understanding video by reasoning over temporally connected set of frames.

本节展示提示 Gemini Ultra 得到的一些定性例子. 图 10, 11, 13, 15, 16 和 17 展示在图表, 自然图像和表情包上做图像理解的多模态推理例子. 图 12 展示 Gemini Ultra 的图像生成能力: 用户生成图文交错的序列来设计一篇博客. 在英语之外, 图 18 展示模型在多语言场景下理解图像的能力. Gemini 模型在数学中的多模态图像理解与推理上也表现强劲, 见图 14, 20 和 21. 图 22 是复杂多模态推理的例子, 展示模型如何针对用户任务组合复杂图像理解, 代码生成和指令遵循能力. 图 19 是模型生成可运行代码并遵循复杂用户指令的另一个例子. 最后, 图 23 展示 Gemini Ultra 通过在时间上相连的一组帧上推理来理解视频的能力.

<!-- page 77 of 90 -->

Gemini: A Family of Highly Capable Multimodal Models

## 10.4.1. Chart understanding and reasoning over data

**10.4.1. 图表理解与数据推理**

Share of plastic waste that is recycled, landfilled, incinerated and mismanaged, Our World 2019 Mismanaged plastic waste includes materials burned in open pits, dumped into seas or open waters, or disposed of in unsanitary landfills and dumpsites.

塑料垃圾中被回收, 填埋, 焚烧和处置不当的份额, Our World 2019. 处置不当的塑料垃圾包括在露天坑中焚烧, 倾倒入海或开放水域, 或弃置于不卫生的填埋场和垃圾场的材料.

![Chart block](images/p77-united-states.png)

United States

美国

![Chart block](images/p77-chart.png)

![Chart block](images/p77-asia-excl-china-and-india.png)

Asia (excl. China and India)

亚洲 (不含中国和印度)

![Chart block](images/p77-data-source-oecd-2023-ourworldindata-org-plastic.png)

Data source: OECD (2023) OurWorldInData.org/plastic-pollution | CC BY Note: Regional aggregates were calculated by Our World in Data and are based on those specified by the OECD1.

数据来源: OECD (2023) OurWorldInData.org/plastic-pollution | CC BY. 注: 地区汇总由 Our World in Data 计算, 基于 OECD 规定的地区划分.

1.OECD regions: The definitions of regions, as stipulated by the OECD, are: - Other OECD America: Chile, Colombia, Costa Rica, Mexico - OECD EU countries : Austria, Belgium, Czech Republic, Denmark, Estonia, Finland, France, Germany Greece, Hungary, Ireland, Italy, Latvia, Lithuania, Luxembourg, Netherlands, Poland, Portugal, Slovak Republic, Slovenia, Spain, Sweden - OECD Non-EU countries: Iceland, Israel, Norway, Switzerland, Turkey, United Kingdom - OECD Oceania: Australia, New Zealand - OECD Asia: Japan, Korea - Latin America: Non-OECD Latin American and Caribbean countries - Other EU: Bulgaria, Croatia, Cyprus, Malta, Romania - Other Eurasia: Non-OECD European and Caspian countries, including Russian Federation - Middle East & North Africa: Algeria, Bahrain, Egypt, Iraq, Islamic Rep. of Iran, Kuwait, Lebanon, Libya, Morocco, Oman, Qatar, Saudi Arabia, Tunisia, United Arab Emirates, Syrian Arab Rep., Western Sahara, Yemen - Other Africa: Sub-Saharan Africa - China: People's Republic of China, Hong Kong (China) - Other non-OECD Asia: Other non-OECD Asian and Pacific countries

1. OECD 地区划分: 各地区包含的国家见英文列表.

Spot a data point that stands out in these charts and what that implicates. Then produce a detailed markdown table for all the data shown.

找出这些图表中一个突出的数据点, 说明它意味着什么. 然后为图中所有数据生成一张详细的 markdown 表.

## Model Response (rendered Markdown)

**模型回答 (渲染后的 Markdown)**

The data point that stands out is the United States’ landfilled plastic waste, which is 73%. This is significantly higher than the other countries and regions shown. This implies that the United States is not doing as much to recycle or incinerate its plastic waste as other countries and regions.

突出的数据点是美国填埋的塑料垃圾, 占 73%. 这明显高于图中其他国家和地区. 这意味着美国在回收或焚烧塑料垃圾上做得不如其他国家和地区.

| Country/Region | Landfilled (%) | Mismanaged (%) | Incinerated (%) | Recycled (%) |
| --- | --- | --- | --- | --- |
| World | 49 | 22 | 19 | 9 |
| United States | 73 | 4 | 19 | 4 |
| Europe | 44 | 6 | 38 | 12 |
| Asia (excl. China and India) | 39 | 34 | 19 | 8 |

Figure 10 | Solving a problem requiring multimodal chart understanding.The model has to read the text, understand the connections between different data points and reason over them to recommend an interesting point and follow the instructions to generate a markdown table (shown correctly rendered).

图 10 | 解决需要多模态图表理解的问题. 模型要读懂文字, 理解不同数据点之间的联系并加以推理, 推荐一个有意思的数据点, 并按指令生成 markdown 表 (图中为正确渲染的结果).

Source: Our World In Data (Ritchie et al., 2023).

来源: Our World In Data (Ritchie et al., 2023).

<!-- page 78 of 90 -->

Gemini: A Family of Highly Capable Multimodal Models

![Image block](images/p78-figure-11-answering-a-multimodal-information-seeking.png)

Figure 11 | Answering a multimodal information-seeking query. The model is able to recognize the specific plant shown in the image and provide information about it. The model shows robustness to typos as it is able to understand the user question despite them. Source: photo taken by an author from the Gemini team.

图 11 | 回答多模态信息查询. 模型能认出图中的具体植物并提供相关信息. 模型对拼写错误表现出鲁棒性, 尽管问题中有错别字, 它仍能理解. 来源: Gemini 团队一位作者拍摄的照片.

<!-- page 79 of 90 -->

Gemini: A Family of Highly Capable Multimodal Models

## 10.4.3. Interleaved image and text generation

**10.4.3. 图文交错生成**

Please create a blog post about a trip to New York, where a dog and his owner had lots of fun. Include a few pictures of the dog posing happily at different landmarks.

请写一篇关于纽约之旅的博客, 讲一只狗和它的主人玩得很开心. 配几张这只狗在不同地标前开心摆姿势的照片.

## Model Response

**模型回答**

Hi, I’m Cooper. I’m a 2 year old Goldendoodle who loves to travel. Last month, my family and I went to New York City. It was my first time in the Big Apple, and I had a blast!

嗨, 我是 Cooper. 我是一只 2 岁的金毛贵宾犬, 喜欢旅行. 上个月, 我和家人去了纽约. 这是我第一次去大苹果城, 玩得超开心!

We stayed in a hotel near Times Square. It was so much fun to see all the bright lights and people. We went to see a Broadway show, and I even got to meet some of the actors.

我们住在时代广场附近的酒店. 看到那么多明亮的灯光和人群太有意思了. 我们去看了一场百老汇演出, 我甚至见到了几位演员.

One of my favorite parts of New York City was Central Park. It was so big and beautiful. I loved running around and playing fetch. We also went to the Statue of Liberty and the Empire State Building. I was so excited to see all the famous landmarks.

纽约我最喜欢的地方之一是中央公园. 它又大又美. 我喜欢在里面跑来跑去玩捡球. 我们还去了自由女神像和帝国大厦. 看到这些著名地标我太兴奋了.

I had so much fun in New York City. It’s definitely one of my favorite places to travel. I can’t wait to go back someday!

我在纽约玩得太开心了. 这绝对是我最喜欢的旅行目的地之一. 真想哪天再去!

![Image block](images/p79-figure-12-generating-interleaved-text-and-images-the.png)

Figure 12 | Generating interleaved text and images. The model is able to follow the instructions of generating a blog post with images closely related to the text and with dog images showing high levels of consistency across all images.

图 12 | 生成图文交错内容. 模型紧扣指令生成博客, 配图与文字密切相关, 所有图中狗的形象高度一致.

<!-- page 80 of 90 -->

Gemini: A Family of Highly Capable Multimodal Models

10.4.4. Image understanding and reasoning

**10.4.4. 图像理解与推理**

![Image block](images/p80-figure-13-solving-a-multimodal-reasoning-problem-the.png)

Figure 13 | Solving a multimodal reasoning problem.The model is able to recognize shapes in the image, understand their properties and reason about the relationship between them to predict the next object.

图 13 | 解决多模态推理问题. 模型能识别图中的形状, 理解它们的性质, 并推理它们之间的关系, 预测下一个物体.

Source: photo taken by an author from the Gemini team.

来源: Gemini 团队一位作者拍摄的照片.

<!-- page 81 of 90 -->

Gemini: A Family of Highly Capable Multimodal Models

10.4.5. Geometrical reasoning

**10.4.5. 几何推理**

![Image block](images/p81-the-area-of-the-parallelogram-is-equal-to-the-product.png)

The area of the parallelogram is equal to the product of the base and the height. Hence 100 = (𝑥 + 15)𝑥. We get 𝑥<sup>2</sup> + 15𝑥 − 100 = 0. The roots of this equation are 𝑥<sub>1</sub> = 5 and 𝑥<sub>2</sub> = −20. The second root is negative and is not acceptable. Final Answer: The final answer is 5. I hope it is correct.

平行四边形的面积等于底乘高. 因此 100 = (𝑥 + 15)𝑥. 得到 𝑥<sup>2</sup> + 15𝑥 − 100 = 0. 方程的根是 𝑥<sub>1</sub> = 5 和 𝑥<sub>2</sub> = −20. 第二个根为负, 舍去. 最终答案: 最终答案是 5. 希望是对的.

Figure 14 | Solving a geometrical reasoning task. The model shows good understanding of the task and is able to provide meaningful reasoning steps despite slightly unclear instructions. Source: Lu et al. (2021).

图 14 | 解几何推理题. 尽管指令略不清楚, 模型对任务理解良好, 能给出有意义的推理步骤. 来源: Lu et al. (2021).

10.4.6. Information seeking about objects

**10.4.6. 关于物体的信息查询**

![Image block](images/p81-figure-15-solving-a-puzzle-using-multimodal-inputs-the.png)

Figure 15 | Solving a puzzle using multimodal inputs. The model recognizes the objects in the images and identifies a commonality that connects the two objects. Source: photo taken by an author from the Gemini team.

图 15 | 用多模态输入解谜. 模型识别出图中的物体, 并找出连接两个物体的共同点. 来源: Gemini 团队一位作者拍摄的照片.

<!-- page 82 of 90 -->

Gemini: A Family of Highly Capable Multimodal Models

10.4.7. Multimodal reasoning based on visual cues

**10.4.7. 基于视觉线索的多模态推理**

## Prompt

**提示**

![Image block](images/p82-do-you-know-the-precise-location-where-this-image-was.png)

Do you know the precise location where this image was taken?

你知道这张照片的确切拍摄地点吗?

## Model Response

**模型回答**

This image was taken in New York City. The Empire State Building is visible in the background. The street in the foreground is 8th Avenue. The cross street is West 34th Street.

这张照片摄于纽约市. 背景中能看到帝国大厦. 前景的街道是第八大道. 交叉的街道是西 34 街.

Figure 16 | Identifying the objects in the image (the Empire State Building) and recognizing what those are even with small levels of visual distortion in the image. Based on the image, the model is also able to correctly identify the precise location of the person taking the photo. Source: photo taken by an author from the Gemini team.

图 16 | 识别图中物体 (帝国大厦), 即使图像有轻微视觉畸变也能认出它们. 模型还能根据图像正确判断拍摄者的确切位置. 来源: Gemini 团队一位作者拍摄的照片.

<!-- page 83 of 90 -->

Gemini: A Family of Highly Capable Multimodal Models

10.4.8. Multimodal humor understanding

**10.4.8. 多模态幽默理解**

![Image block](images/p83-figure-17-explanation-of-humor-in-a-meme-the-model-is.png)

Figure 17 | Explanation of humor in a meme. The model is showing the ability to not only describe what is happening in the image but also what it means even though the cultural context is not mentioned explicitly in the image or the prompt. Source: Hwang and Shwartz (2023).

图 17 | 解释表情包中的幽默. 模型不仅能描述图中发生了什么, 还能说明它的含义, 即使图像和 prompt 都没有明确提到文化背景. 来源: Hwang and Shwartz (2023).

<!-- page 84 of 90 -->

Gemini: A Family of Highly Capable Multimodal Models

10.5. Commonsense reasoning in a multilingual setting

**10.5. 多语言场景下的常识推理**

![Image block](images/p84-figure-18-common-sense-reasoning-in-images-the-model-is.png)

Figure 18 | Common-sense reasoning in images. The model is able to understand the relationships represented in the graphs and reason about them in a multilingual setting. Source: image created by an author from the Gemini team.

图 18 | 图像中的常识推理. 模型能理解图中表示的关系, 并在多语言场景下对其推理. 来源: Gemini 团队一位作者制作的图像.

<!-- page 85 of 90 -->

Gemini: A Family of Highly Capable Multimodal Models

## 10.5.1. Reasoning and code generation

**10.5.1. 推理与代码生成**

## Prompt

**提示**

Create a web app called "Opossum Search":

做一个叫 「Opossum Search」 的网页应用:

1. Every time you make a search query, it should redirect you to a google search with the same query, but the word opossum before it.

1. 每次搜索时, 都跳转到 Google 搜索, 查询词相同, 但前面加上 opossum 一词.

2. It should be visually similar to Google search,

2. 外观要与 Google 搜索相似,

3. Instead of the google logo, it should have a picture of an opossum from the internet.

3. 不用 google 标志, 而用一张从网上找来的负鼠图片.

4. It should be a single html file, no separate js or css files.

4. 必须是单个 html 文件, 不要单独的 js 或 css 文件.

5. It should say "Powered by google search" in the footer.

5. 页脚要写 「Powered by google search」.

## Model Response (rendered code)

**模型回答 (渲染后的代码)**

Here is the code for Opossum Search:

下面是 Opossum Search 的代码:

```txt
<!DOCTYPE html>
<html>
<head>
  <title>Opossum Search</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      margin: 0;
      padding: 0;
    }

    header {
      background-color: #333;
      color: #fff;
      text-align: center;
      padding: 1rem 0;
    }

    .search-bar {
      display: flex;
      justify-content: center;
      align-items: center;
      height: 50px;
      margin-top: 1rem;
    }

    .search-input {
      width: 50%;
      padding: 0.5rem;
      border: 1px solid #ccc;
      border-radius: 5px;
    }

    .search-button {
      margin-left: 1rem;
      padding: 0.5rem 1rem;
      border: 1px solid #ccc;
      border-radius: 5px;
      cursor: pointer;
    }

    footer {
      background-color: #333;
      color: #fff;
      text-align: center;
      padding: 1rem 0;
      margin-top: 1rem;
    }
  </style>
</head>
<body>
  <header>
    <h1>Opossum Search</h1>
    <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/a/a4/Didelphis_virginiana.jpg/
    1200px-Didelphis_virginiana.jpg" alt="Opossum" width="100">
  </header>

  <div class="search-bar">
    <input type="text" class="search-input" placeholder="Search the web">
    <button class="search-button">Search</button>
  </div>
```

<!-- page 86 of 90 -->

```javascript
<footer>
        Powered by Google Search
    </footer>

    <script>
        const searchInput = document.querySelector('.search-input');
        const searchButton = document.querySelector('.search-button');

        seasonButton.addEventListener('click', () => {
            const query = searchInput.value;
            if (query) {
                window.location.href = `https://www.google.com/search?q=opossum+\${query}`;
            }
        });
    </script>
</body>
```

Gemini: A Family of Highly Capable Multimodal Models

This code creates a simple web app that looks similar to Google Search, but with an opossum logo. When you enter a search query and click the "Search" button, it will redirect you to a Google search with the word "opossum" added to the beginning of your query. The app is powered by Google Search, as indicated in the footer.

这段代码创建一个外观类似 Google 搜索的简单网页应用, 但换成了负鼠标志. 输入查询并点击 「Search」 按钮后, 它会跳转到 Google 搜索, 并在查询开头加上 「opossum」 一词. 如页脚所示, 这个应用由 Google 搜索驱动.

![Image block](images/p86-figure-19-writing-code-for-a-website-based-on-user.png)

Figure 19 | Writing code for a website based on user request. The model follows the instructions and requirements defined by the user and converts them to functioning code.

图 19 | 按用户要求编写网站代码. 模型遵循用户定义的指令和要求, 把它们转换成可运行的代码.

<!-- page 87 of 90 -->

Gemini: A Family of Highly Capable Multimodal Models

## 10.5.2. Mathematics: Calculus

**10.5.2. 数学: 微积分**

## Prompt

**提示**

Find the derivative of sinh 𝑥 + cosh $y = x + y .$

求 sinh 𝑥 + cosh $y = x + y .$ 的导数.

## Model Response (rendered latex)

**模型回答 (渲染后的 latex)**

We have that $\frac { d } { d x }$ sinh 𝑥 = cosh 𝑥 and $\frac { d } { d x }$ cosh $y = \sinh y \frac{dy}{dx}$ . Therefore,

我们有 $\frac { d } { d x }$ sinh 𝑥 = cosh 𝑥 以及 $\frac { d } { d x }$ cosh $y = \sinh y \frac{dy}{dx}$. 因此,

$$
\cosh x + \sinh y \frac {d y}{d x} = 1 + \frac {d y}{d x}.
$$

Solving for ${ \frac { d y } { d x } } ,$ , we find that

解出 ${ \frac { d y } { d x } }$, 得到

$$
\underline {{d y}} - \underline {{1 - \cosh x}}
$$

$$
\overline {{d x}} ^ {-} \overline {{\sinh y - 1}}.
$$

Final Answer: The final answer is $\frac{1 - \cosh x}{\sinh y - 1}$

最终答案: 最终答案是 $\frac{1 - \cosh x}{\sinh y - 1}$

Figure 20 | Solving a calculus problem. The model is able to get a solution to a calculus problem with step-by-step explanation and correctly defined LaTeX equations. Source: question is provided by Macmillan Learning.

图 20 | 解微积分题. 模型能给出分步解释和正确定义的 LaTeX 公式, 得到微积分题的解. 来源: 题目由 Macmillan Learning 提供.

<!-- page 88 of 90 -->

Gemini: A Family of Highly Capable Multimodal Models

![Image block](images/p88-figure-21-solving-a-multi-step-math-problem-the-model.png)

Figure 21 | Solving a multi-step math problem. The model is able to understand the task and generate a markdown table with correctly calculated values. It also explicitly follows the instructions to show where the numbers come from and answer the question given in the task. Source: Oktatási Hivatal (2023, p. 20)

图 21 | 解多步数学题. 模型能理解任务, 生成数值计算正确的 markdown 表. 它还明确遵循指令, 说明数字从何而来, 并回答题目中的问题. 来源: Oktatási Hivatal (2023, p. 20)

<!-- page 89 of 90 -->

Gemini: A Family of Highly Capable Multimodal Models

## 10.6.1. Complex image understanding, code generation, and instruction following Prompt

**10.6.1. 复杂图像理解, 代码生成与指令遵循 (提示)**

![Chart block](images/p89-chart.png)

![Chart block](images/p89-chart-2.png)

![Chart block](images/p89-chart-3.png)

![Chart block](images/p89-i-want-you-to-take-the-function-depicted-in-the-top.png)

I want you to take the function depicted in the top left subplot, multiply it by 1000, and then add it to the function depicted in the bottom left subplot. Generate matplotlib code for the single resulting plot.

把左上子图画的函数乘以 1000, 再加上左下子图画的函数. 为得到的单个图生成 matplotlib 代码.

## Model Response (rendered code)

**模型回答 (渲染后的代码)**

```python
import numpy as np
import matplotlib.pyplot as plt

x = np.linspace(0, 10, 1000)
y1 = np.sin(x)
y2 = np.exp(x)

plt.plot(x, 1000*y1 + y2)
plt.show()
```

## Rendered Graph

**渲染出的图**

![Chart block](images/p89-figure-22-multimodal-reasoning-capabilities-applied-to.png)

Figure 22 | Multimodal reasoning capabilities applied to code generation. Gemini Ultra needs to perform inverse graphics task to infer the code that would have generated the plots, perform additional mathematical transformations, and generate relevant code.

图 22 | 把多模态推理能力用于代码生成. Gemini Ultra 需要做逆向图形任务, 推断出能画出这些图的代码, 做额外的数学变换, 并生成相应代码.

Source: figure generated by an author from the Gemini team.

来源: Gemini 团队一位作者生成的图.

<!-- page 90 of 90 -->

Gemini: A Family of Highly Capable Multimodal Models

10.6.2. Video understanding and reasoning Prompt (video)

**10.6.2. 视频理解与推理 (视频提示)**

![Image block](images/p90-how-could-this-person-improve-their-technique.png)

How could this person improve their technique?

这个人该怎样改进技术?

## Model Response

**模型回答**

This soccer player needs to work on their ball-striking mechanics. Their foot is not making good contact with the ball, which is causing the ball to fly up and away from the goal. They also need to work on their body positioning. They should be leaning into the shot with their non-kicking leg in front of their kicking leg, and they should be following through with their kicking leg.

这名足球运动员需要改进击球动作. 他的脚没有很好地接触球, 导致球向上飞, 偏离球门. 他还需要改进身体姿态. 射门时应当身体前倾, 支撑腿在踢球腿前面, 并且踢球腿要有随球动作.

Figure 23 | Video understanding and reasoning over the situation presented in the video. Here, we provide a video as input to the model together with a text prompt (images are provided here only for visualization purposes). The model is able to analyze what happened in the video and provide recommendations on how the actions in the video could have been better.

图 23 | 对视频中情形的理解与推理. 这里我们把视频和文本 prompt 一起输入模型 (图像仅用于展示). 模型能分析视频中发生了什么, 并就视频中的动作如何能做得更好给出建议.

Video source: "Football/Soccer Penalty Miss"

视频来源: 「Football/Soccer Penalty Miss」

[https://www.youtube.com/watch?v=VmWxjmJ3mvs](https://www.youtube.com/watch?v=VmWxjmJ3mvs)

90