---
title: "MiniCPM-V 4.5 · 对照译稿"
category: "模型库"
tags: ["MiniCPM", "对照译稿"]
published: true
excerpt: "MiniCPM-V 4.5 公开材料的逐段中英对照译稿，附读报告时的疑问块。"
---
<!-- page 1 of 25 -->

arXiv:2509.18154v1 [cs.LG] 16 Sep 2025

arXiv 编号 2509.18154, 第 1 版, 分类 cs.LG, 2025 年 9 月 16 日.

# MiniCPM-V 4.5: Cooking Efficient MLLMs via Architecture, Data, and Training Recipes (MiniCPM-V 4.5: 从架构, 数据和训练配方三处做出高效的 MLLM)

**Tianyu Yu Zefan Wang Chongyi Wang Fuwei Huang Wenshuo Ma Zhihui He Tianchi Cai Weize Chen Yuxiang Huang Yuanqian Zhao Bokai Xu Junbo Cui Yingjing Xu Liqing Ruan Luoyuan Zhang Hanyu Liu Jingkun Tang Hongyuan Liu Qining Guo Wenhao Hu Bingxiang He Jie Zhou Jie Cai Ji Qi Zonghao Guo Chi Chen Guoyang Zeng Yuxuan Li Ganqu Cui Ning Ding Xu Han Yuan Yao**<sup>∗</sup> **Zhiyuan Liu**<sup>∗</sup> **Maosong Sun**<sup>∗</sup>

作者名单. Yuan Yao, Zhiyuan Liu, Maosong Sun 三人带 ∗, 是通讯作者.

MiniCPM-V Team, OpenBMB

yiranytianyu@gmail.com yaoyuanthu@gmail.com

OpenBMB 的 MiniCPM-V 团队, 附两个联系邮箱.

[MiniCPM-V 4.5 Code](https://github.com/openbmb/MiniCPM-V)

[MiniCPM-V 4.5 Model](https://huggingface.co/openbmb/MiniCPM-V-4_5)

两个链接: GitHub 代码仓库, Hugging Face 模型权重.

## Abstract

Multimodal Large Language Models (MLLMs) are undergoing rapid progress and represent the frontier of AI development. However, their training and inference efficiency have emerged as a core bottleneck in making MLLMs more accessible and scalable. To address the challenges, we present MiniCPM-V 4.5, an 8B parameter model designed for high efficiency and strong performance. We introduce three core improvements in model architecture, data strategy and training method: a unified 3D-Resampler model architecture for highly compact encoding over images and videos, a unified learning paradigm for document knowledge and text recognition without heavy data engineering, and a hybrid reinforcement learning strategy for proficiency in both short and long reasoning modes. Comprehensive experimental results in OpenCompass evaluation show that MiniCPM-V 4.5 surpasses widely used proprietary models such as GPT-4o-latest, and significantly larger open-source models such as Qwen2.5-VL 72B. Notably, the strong performance is achieved with remarkable efficiency. For example, on the widely adopted VideoMME benchmark, MiniCPM-V 4.5 achieves state-of-the-art performance among models under 30B size, using just 46.7% GPU memory cost and 8.7% inference time of Qwen2.5-VL 7B.

多模态大语言模型 (MLLM) 进展很快, 代表着 AI 发展的前沿. 但训练和推理效率已经成了核心瓶颈, 限制了 MLLM 变得更容易用, 更容易铺开. 为此我们推出 MiniCPM-V 4.5, 一个兼顾高效率和强性能的 8B 参数模型. 我们在模型架构, 数据策略和训练方法上做了三项核心改进: 统一的 3D-Resampler 架构, 对图像和视频做高度紧凑的编码; 文档知识与文字识别的统一学习范式, 不需要繁重的数据工程; 混合强化学习策略, 让模型同时擅长短推理和长推理两种模式. OpenCompass 评测的综合实验结果表明, MiniCPM-V 4.5 超过了 GPT-4o-latest 等广泛使用的闭源模型, 也超过了 Qwen2.5-VL 72B 这样大得多的开源模型. 值得一提的是, 这样的性能是以很高的效率换来的. 例如在广泛使用的 VideoMME 基准上, MiniCPM-V 4.5 在 30B 以下的模型里达到 state-of-the-art, 显存只用 Qwen2.5-VL 7B 的 46.7%, 推理时间只用 8.7%.

> **看表:** 摘要说 MiniCPM-V 4.5 在 VideoMME 上 「在 30B 以下模型里达到 state-of-the-art」, 第 10 页表 1 撑得住吗?
> 撑不住. 表 1 的 Video-MME 两行, MiniCPM-V 4.5 是 67.9 (无字幕) 和 73.5 (有字幕), 同在 30B 以下的 GLM-4.1V 9B 是 68.2 和 73.6, 两行都略高; 第 11 页表 2 (b) 也是 GLM-4.1V 73.6 对 73.5. 这句话要读成 「分数接近, 时间和显存省得多」.

> **核对:** 46.7% 的显存和 8.7% 的推理时间, 跟谁比, 出自哪张表?
> 出自第 11 页表 2 (b), 对比对象是 Qwen2.5-VL-7B: 显存 28G / 60G 约 46.7%, 时间 0.26h / 3.00h 约 8.7%, 和摘要一致. 分数是 73.5 对 71.6, 与表 1 有字幕那一行相同, 推断表 2 (b) 用的是有字幕设置; 硬件是 8 张 A100.

## 1 Introduction

Multimodal Large Language Models (MLLMs) [1, 2, 3, 4, 5, 6, 7] are advancing rapidly the frontier of artificial intelligence, enabling machines to deeply understand and reason over different modalities such as text and images. However, as MLLMs evolve, the cost of data engineering, training, and inference also increases heavily. Addressing this efficiency challenge is now a central focus of both research and industry [6, 8, 9, 10, 11], essential for making capable MLLMs more accessible and scalable.

多模态大语言模型 [1, 2, 3, 4, 5, 6, 7] 正在快速推进人工智能的前沿, 让机器能深入理解文本, 图像等不同模态并在其上推理. 然而随着 MLLM 演进, 数据工程, 训练和推理的成本也大幅上涨. 解决这个效率问题, 如今是学界和业界共同关注的焦点 [6, 8, 9, 10, 11], 也是让强大的 MLLM 更容易用, 更容易铺开的关键.

We decompose this efficiency problem into three core aspects: (1) **Model Architecture.** A primary efficiency bottleneck in MLLMs comes from the large number of visual tokens for high-resolution image encoding, which brings heavy computation overhead for visual encoders and LLMs. The problem is even exacerbated in video understanding, where existing models can take thousands of tokens to encode a short and low-resolution video, even when sampling at a low frame rate. For example, processing a 6-second, 2-fps video at a resolution of just 448×448 requires 1,536 tokens for Qwen2.5-VL [7], and 3,072 tokens for InternVL3 [9]. Such long visual token sequences lead to prohibitive training and inference costs in GPU memory and computation speed.

我们把效率问题拆成三个核心方面: (1) **模型架构.** MLLM 的一个主要效率瓶颈, 来自高分辨率图像编码产生的大量视觉 token, 这给视觉编码器和 LLM 都带来很重的计算开销. 视频理解里问题更严重, 现有模型即使用很低的帧率采样, 编码一段又短又低清的视频也要几千个 token. 例如处理一段 6 秒, 2 fps, 分辨率只有 448×448 的视频, Qwen2.5-VL [7] 需要 1,536 个 token, InternVL3 [9] 需要 3,072 个. 这么长的视觉 token 序列, 让训练和推理在显存和计算速度上的成本高到难以承受.

<small><span class="docvortex-page-footnote" data-block-type="page_footnote" style="color:#6b7280"><sup>∗</sup>Corresponding authors.</span></small>

∗ 通讯作者.

<!-- page 2 of 25 -->

(2) **Training Data.** As we quickly run out of new knowledge from traditional web page data, a new cornerstone of modern MLLMs is harnessing high-quality multimodal knowledge from documents [1, 2], such as scientific papers and textbooks. These documents are often stored as PDFs, containing multi-disciplinary knowledge in various domains and organized in diverse layouts of interleaved texts, images, and tables. However, most methods depend on brittle external parsing tools to convert document files into interleaved image-text sequences for training. These tools often fail in complex layouts, leading to either errors in knowledge learning or heavy data engineering efforts to fix the failure cases. (3) **Training Methods.** Reinforcement Learning (RL) has shown promise in improving complex reasoning capabilities by enabling a step-by-step explicit thinking process before providing the final answer [12, 1]. However, this performance gain often comes at the expense of extreme verbosity. Even for simple tasks such as identifying obvious objects, most existing thinking models produce excessively long outputs, inducing poor efficiency in both training and inference. For example, on the comprehensive Opencompass benchmark, the hybrid strategy requires only 33.3% long reasoning samples to match the peak long reasoning performance of training exclusively in single mode.

(2) **训练数据.** 传统网页数据里的新知识很快就要用完, 现代 MLLM 的新基石是从文档里获取高质量的多模态知识 [1, 2], 比如科学论文和教科书. 这些文档多以 PDF 存储, 装着各领域的多学科知识, 版式多样, 文字, 图像, 表格交错排布. 但多数方法依赖脆弱的外部解析工具, 把文档文件转成图文交错序列再拿去训练. 这些工具碰到复杂版式经常失败, 结果要么是知识学错, 要么得花大量数据工程去修补失败样例. (3) **训练方法.** 强化学习 (RL) 让模型在给出最终答案前先做一段逐步的显式思考, 在提升复杂推理能力上显出了潜力 [12, 1]. 但这种提升往往以极度啰嗦为代价. 哪怕是认出一个明显物体这样的简单任务, 多数现有的思考模型也会输出过长的内容, 训练和推理效率都很差. 例如在综合性的 OpenCompass 基准上, 混合策略只要 33.3% 的长推理样本, 就能追平只用单一模式训练时长推理的峰值性能.

> **问:** 引言里 「混合策略只要 33.3% 的长推理样本就能追平峰值」, 这个 33.3% 和后文对得上吗?
> 对不上. 第 11 页消融说混合策略用了 「一半」 的长推理样本, 第 20 页附录写 rollout 时 50% 的 prompt 分给长推理模式; 表 3 只给了 token 数 (纯短 1.6B, 纯长 4.4B, 混合 3.1B), 从这几个数推不出 33.3%. 这句话还放在 「训练方法的问题」 里, 讲的却是解法的效果, 位置也不顺.

To address the challenges, MiniCPM-V 4.5 introduces three key improvements in model architecture, data strategy, and training method: (1) **Unified 3D-Resampler for Compact Image and Video Encoding.** Previous MiniCPM-V series models [6] exhibit high compression rates (e.g., 4× compared with most MLLMs) for high-resolution images via 2D-Resamplers [5, 13]. To further address the architectural inefficiency of video processing, we extend the 2D-Resampler to a 3D-Resampler that jointly compresses spatial-temporal information for videos. This module can encode a 6-second, 2-fps, 448×448 resolution video into only 128 visual tokens, achieving a 12×-24× reduction in token cost compared to representative MLLMs [7, 9], enabling efficient high frame rate and long video understanding, and unified encoding for images as well. (2) **Unified Learning Paradigm for Document Knowledge and OCR.** We propose a learning paradigm that enables the model to accurately acquire knowledge directly from document images, eliminating the need for fragile external parsers. By dynamically corrupting text regions in documents with varying noise levels and asking the model to reconstruct the text, the model learns to adaptively and properly switch between accurate text recognition (when text is roughly visible) and multimodal context-based knowledge reasoning (when text is heavily corrupted). (3) **Hybrid Strategy for Post-Training.** Unlike prior models that optimize for a single long reasoning mode [2, 1], we develop a hybrid RL post-training strategy to support both short reasoning mode for efficient usage and long reasoning mode for complex tasks. In RL training, we randomly alternate between the two modes during the rollout process for joint optimization. This approach not only enables flexible control over the short and long reasoning modes but also allows for mutual performance enhancement. In experiments, we can achieve better reasoning performance with fewer training samples for both modes.

针对这些问题, MiniCPM-V 4.5 在模型架构, 数据策略和训练方法上做了三项关键改进: (1) **统一 3D-Resampler, 紧凑编码图像和视频.** 之前的 MiniCPM-V 系列模型 [6] 借助 2D-Resampler [5, 13], 对高分辨率图像已有很高的压缩率 (例如比多数 MLLM 高 4 倍). 为了进一步解决视频处理在架构上的低效, 我们把 2D-Resampler 扩展成 3D-Resampler, 对视频的时空信息做联合压缩. 这个模块能把一段 6 秒, 2 fps, 448×448 分辨率的视频编码成只有 128 个视觉 token, 相比代表性 MLLM [7, 9] 的 token 开销降低 12 到 24 倍, 从而高效支持高帧率和长视频理解, 同时统一了图像的编码. (2) **文档知识与 OCR 的统一学习范式.** 我们提出一种学习范式, 让模型直接从文档图像中准确获取知识, 不再需要脆弱的外部解析器. 做法是以不同噪声强度动态破坏文档里的文字区域, 再让模型重建文字, 模型由此学会在两种行为间自适应地切换: 文字大致可见时做精确的文字识别, 文字被严重破坏时做基于多模态上下文的知识推理. (3) **后训练的混合策略.** 以往模型只针对单一的长推理模式优化 [2, 1], 我们则设计了混合的 RL 后训练策略, 同时支持高效使用的短推理模式和面向复杂任务的长推理模式. RL 训练时, rollout 过程在两种模式间随机交替, 联合优化. 这种做法既能灵活控制长短两种推理模式, 又让两者的性能互相促进. 实验中, 两种模式都能用更少的训练样本得到更好的推理性能.

> **拆开:** 128 个 token 和 12×-24× 是怎么算出来的?
> 6 秒, 2 fps 就是 12 帧. 对照组是 Qwen2.5-VL 的 1,536 个和 InternVL3 的 3,072 个, 1,536 / 128 = 12, 3,072 / 128 = 24. 128 本身也能拆: 第 4 页说 6 帧 448×448 压成 64 个 token, 12 帧正好是两个 package, 2 × 64 = 128 (假设 package 取 6 帧).

Comprehensive experimental results in OpenCompass evaluation show that MiniCPM-V 4.5 outperforms widely used proprietary models such as GPT-4o-latest [4], and significantly larger open-source models such as Qwen2.5-VL 72B [7]. Notably, the strong performance is achieved with remarkable efficiency. For example, powered by the efficient unified 3D-Resampler, MiniCPM-V 4.5 achieves equivalent performance on VideoMME [14] using only 9.9% of the inference time of prior state-of-the-art MLLMs [1]. Based on the hybrid post-training strategy, MiniCPM-V 4.5 excels in both short and long reasoning modes, outperforming concurrent thinking models [3, 1] on OpenCompass evaluation while using only 42.9%-68.2% inference time.

OpenCompass 评测的综合实验结果表明, MiniCPM-V 4.5 超过了 GPT-4o-latest [4] 等广泛使用的闭源模型, 也超过了 Qwen2.5-VL 72B [7] 这样大得多的开源模型. 值得一提的是, 这样的性能是以很高的效率换来的. 例如借助高效的统一 3D-Resampler, MiniCPM-V 4.5 在 VideoMME [14] 上取得相当的性能, 推理时间只有此前 state-of-the-art MLLM [1] 的 9.9%. 基于混合后训练策略, MiniCPM-V 4.5 在短推理和长推理两种模式下都表现出色, 在 OpenCompass 评测上超过同期的思考模型 [3, 1], 推理时间只用它们的 42.9% 到 68.2%.

> **对一下:** 9.9% 和 42.9%-68.2% 各对应表 2 的哪几格?
> 9.9% 是表 2 (b) 的 0.26h / 2.63h (对 GLM-4.1V-9B-thinking), 约 9.9%; 42.9% 是表 2 (a) 的 7.5h / 17.5h (对 GLM-4.1V), 68.2% 是 7.5h / 11.0h (对 MiMo-VL-7B-RL), 都能复算. 「相当的性能」 在表 2 (b) 上实际是 73.5 对 73.6, 低 0.1.

In summary, our contributions are as follows:

总结起来, 我们的贡献如下:

• We open-source MiniCPM-V 4.5, an efficient and strong MLLM that supports efficient high frame rate and long video understanding, controllable hybrid reasoning, robust OCR, and strong document parsing capabilities.

• 我们开源 MiniCPM-V 4.5, 一个高效又强大的 MLLM, 支持高效的高帧率与长视频理解, 可控的混合推理, 稳健的 OCR, 以及很强的文档解析能力.

• We introduce three key improvements: a unified 3D-Resampler for efficient image and video encoding, a unified paradigm for document knowledge and OCR learning, and a hybrid strategy for post-training that enhances both performance and efficiency.

• 我们提出三项关键改进: 高效编码图像和视频的统一 3D-Resampler, 文档知识与 OCR 学习的统一范式, 以及同时提升性能和效率的混合后训练策略.

• Comprehensive experiments demonstrate the effectiveness of the proposed technical improvements and the performance of MiniCPM-V 4.5.

• 全面的实验验证了这些技术改进的有效性, 也展示了 MiniCPM-V 4.5 的性能.

<!-- page 3 of 25 -->

![图 1: MiniCPM-V 4.5 架构总览. 底部三类输入: 高分辨率图像, 经图像切片的极端长宽比图像, 经视频打包的高帧率与长视频; 依次经过视觉编码器, 统一 3D-Resampler, LLM 解码器. 右侧放大两路: 视频处理把 T=0 到 T=5 的 6 帧打成一包, 额外 6 倍压缩; 图像处理逐片编码, 最高 16 倍压缩. 顶部开关切换长推理和短推理模式](images/p03-figure-1-an-overview-of-the-minicpm-v-4-5-architecture.png)

Figure 1: An overview of the MiniCPM-V 4.5 architecture. The model processes diverse visual inputs, such as high-resolution images and high frame rate videos. After the image partitioning and video packing processes, these inputs are encoded by a visual encoder and then fed into the unified 3D-Resampler. This module efficiently compresses both image and video features into a compact token sequence (achieving up to 16× compression rate for images and an additional 6× for videos), which is then processed by the LLM decoder. The decoder can generate responses in two distinct styles: a concise, short reasoning mode or a step-by-step, long reasoning mode.

图 1: MiniCPM-V 4.5 的架构总览. 模型处理多种视觉输入, 比如高分辨率图像和高帧率视频. 这些输入经过图像切片和视频打包后, 先由视觉编码器编码, 再送进统一 3D-Resampler. 这个模块把图像和视频特征高效地压成紧凑的 token 序列 (图像最高 16 倍压缩, 视频再额外压 6 倍), 然后交给 LLM 解码器处理. 解码器能以两种风格生成回答: 简洁的短推理模式, 或逐步展开的长推理模式.

> **想:** 图 1 说图像最高 16 倍压缩, 视频再额外 6 倍, 16 从哪来, 和第 4 页的 96 倍是什么关系?
> 16 × 6 = 96, 正是第 4 页 「视频 token 96 倍压缩」. 16 倍的分母页面没直接印: 第 3 页只说一片 448×448 编成 64 个 token, 常见做法要 256 个; 若视觉编码器 patch 为 14, 一片有 32 × 32 = 1,024 个 patch, 1,024 / 64 = 16. 本页没有给视觉编码器的名字和 patch 大小, 这一步是按常见配置反推的.

## 2 Approach (方法)

In this section, we describe the methodology of MiniCPM-V 4.5, including the model architecture and the recipes for pre-training, SFT, and RL.

本节介绍 MiniCPM-V 4.5 的方法, 包括模型架构, 以及预训练, SFT 和 RL 的配方.

### 2.1 Architecture (架构)

As shown in Figure 1, the architecture of MiniCPM-V 4.5 comprises three main modules: (1) A lightweight visual encoder that flexibly handles high-resolution images with a special partitioning strategy. (2) A unified 3D-Resampler that encodes images and videos into compact features, exploiting temporal redundancies in visual information. (3) An LLM decoder that understands images, videos, and text, and generates text outputs.

如图 1 所示, MiniCPM-V 4.5 的架构由三个主要模块组成: (1) 一个轻量的视觉编码器, 配合特殊的切片策略灵活处理高分辨率图像. (2) 一个统一 3D-Resampler, 利用视觉信息在时间上的冗余, 把图像和视频编码成紧凑特征. (3) 一个 LLM 解码器, 理解图像, 视频和文本, 并生成文本输出.

#### 2.1.1 The Unified 3D-Resampler (统一 3D-Resampler)

To tackle the image and video encoding efficiency bottleneck in MLLMs, we extend the 2D-Resampler to a 3D-Resampler that jointly compresses spatial-temporal information for videos. In this way, we achieve a 6× temporal compression rate by leveraging the temporal redundancy of consecutive multiple video frames.

为了解决 MLLM 在图像和视频编码上的效率瓶颈, 我们把 2D-Resampler 扩展成 3D-Resampler, 对视频的时空信息做联合压缩. 借助连续多帧之间的时间冗余, 我们得到 6 倍的时间压缩率.

**Image Processing.** To handle high-resolution images in any aspect ratio, we adopt the LLaVA-UHD [13] image partitioning strategy. For each image, we estimate the ideal number of slices from the input resolution and choose the partition whose per-slice resolution deviates least from the visual encoder pretraining setting. We then use learnable queries augmented with 2D spatial positional embeddings to produce a fixed-length sequence for each slice through cross-attention. Most existing MLLMs [7, 9, 1] adopt MLP and pixel unshuffle operation for visual compression, and typically require visual 256 tokens for encoding a 448×448 image. Leveraging the flexibility of resampler architecture, by choosing a small number of query tokens, MiniCPM-V can achieve a significantly higher compression rate for visual tokens (e.g., 64 tokens for a 448×448 image) while maintaining good performance.

**图像处理.** 为了处理任意长宽比的高分辨率图像, 我们采用 LLaVA-UHD [13] 的图像切片策略. 对每张图像, 先根据输入分辨率估计理想的切片数, 再选一种切法, 让每片的分辨率与视觉编码器预训练时的设定偏差最小. 然后用加了 2D 空间位置嵌入的可学习查询, 通过交叉注意力为每片生成一条定长序列. 多数现有 MLLM [7, 9, 1] 用 MLP 加 pixel unshuffle 做视觉压缩, 编码一张 448×448 的图像通常需要 256 个视觉 token. 借助 resampler 架构的灵活性, 只要选少量查询 token, MiniCPM-V 就能在保持良好性能的同时得到高得多的视觉 token 压缩率 (例如一张 448×448 图像只用 64 个 token).

**Video Processing.** To handle the significant redundancy in video data, we employ a joint spatialtemporal compression strategy for higher compression rates. For each video, we first split it into packages along the temporal dimension, where each package contains adjacent frames.

**视频处理.** 为了处理视频数据里的大量冗余, 我们采用时空联合压缩策略, 以获得更高的压缩率. 对每段视频, 先沿时间维把它切成若干 package, 每个 package 包含相邻的几帧.

<!-- page 4 of 25 -->

Intuitively, the video frames within the same package typically share highly redundant visual information, which can be identified and compressed when jointly modeled. To this end, we resample the frame features from the visual encoder in each package into a fixed-length feature sequence through cross-attention. We augment the learnable queries with both 2D spatial positional embedding, as used in image encoding, and temporal positional embedding. The final video representation is obtained by concatenating the token sequences from all packages. We sample at most 1080 frames per video at a maximum frame rate of 10. During training, the package size and frame rate are randomly augmented to improve robustness. This design also provides flexibility at inference time, allowing these hyperparameters to be adjusted to meet the demands of diverse scenarios and devices.

直观地看, 同一 package 里的帧通常共享高度冗余的视觉信息, 联合建模时可以把冗余识别出来并压掉. 为此, 我们在每个 package 内通过交叉注意力, 把视觉编码器输出的帧特征重采样成一条定长特征序列. 可学习查询同时加上 2D 空间位置嵌入 (与图像编码相同) 和时间位置嵌入. 最终的视频表示由所有 package 的 token 序列拼接而成. 每段视频最多采样 1080 帧, 最高帧率为 10. 训练时对 package 大小和帧率做随机增强, 以提高稳健性. 这个设计也给推理带来灵活性, 可以调整这些超参数来适应不同场景和设备的需求.

> **停一下:** 每段视频最多 1,080 帧, 最高 10 fps, 送进 LLM 的视觉 token 有多少?
> 按主模型 6 帧 64 个 token 算, 1,080 帧是 180 个 package, 约 11,520 个视觉 token; 10 fps 下 1,080 帧只覆盖 108 秒, 更长的视频得降帧率. 本页没给 LLM 的上下文长度, 也没说推理时 package 大小的默认值, 长视频能放多少帧只能按这个上限估.

Based on the 3D-Resampler, MiniCPM-V 4.5 can achieve 96× compression rate for video tokens, where 6,448×448 video frames can be jointly compressed into 64 video tokens (normally 1,536-3,072 tokens for most MLLMs). This means that the model can perceive significantly more video frames without increasing the LLM inference cost, which brings strong high-frame-rate video understanding and long video understanding capabilities.

基于 3D-Resampler, MiniCPM-V 4.5 对视频 token 能达到 96 倍压缩率, 6 帧 448×448 的视频帧可以联合压成 64 个视频 token (多数 MLLM 通常要 1,536-3,072 个 token). 这意味着模型能在不增加 LLM 推理成本的前提下看到多得多的视频帧, 由此获得很强的高帧率视频理解和长视频理解能力.

> **回看:** 这里说 6 帧压成 64 个 token, 括号里 「多数 MLLM 通常要 1,536-3,072 个」, 回看引言, 这个区间对应几帧?
> 对应 12 帧. 第 2 页的 1,536 和 3,072 是 6 秒, 2 fps 的视频, 共 12 帧; 换成 6 帧, 按同一比例只有 768-1,536 个. 括号里的区间和 64 不是同一段视频, 直接相除会得到 24×-48×, 而不是引言的 12×-24×. 另外 MinerU 把 「6 448×448」 转成了 「6,448×448」, 看着像六千多, 原意是 6 帧.

**Training Efficiency.** Thanks to the flexibility of the resampler mechanism (agnostic to input shape), we can use the same 3D-Resampler for unified visual encoding over images and videos. This means that image and visual encoding share the same architecture and weights, and therefore, we can achieve the extension from 2D-Resampler to 3D-Resampler efficiently via a lightweight SFT stage. Moreover, this also facilitates efficient knowledge transfer from images to videos. For example, we observe reasonable video OCR capability in MiniCPM-V 4.5, although we did not specifically collect such training data.

**训练效率.** resampler 机制与输入形状无关, 这份灵活性让我们能用同一个 3D-Resampler 统一编码图像和视频. 也就是说图像编码和视频编码共享同一套架构和权重, 因此只需一个轻量的 SFT 阶段, 就能高效地从 2D-Resampler 扩展到 3D-Resampler. 这也方便知识从图像高效迁移到视频. 例如我们观察到 MiniCPM-V 4.5 有不错的视频 OCR 能力, 尽管我们没有专门收集这类训练数据.

**Takeaway**

**要点**

Joint spatial–temporal compression can enable higher visual compression rates. A unified architecture can be more efficiently adapted with minimal additional training and facilitates knowledge transfer from images to videos.

时空联合压缩能带来更高的视觉压缩率. 统一的架构只需很少的额外训练就能高效适配, 也便于知识从图像迁移到视频.

### 2.2 Pre-training (预训练)

Our pre-training process aims to systematically build the model’s foundational capabilities through a progressive, multi-stage strategy. This involves a carefully curated data composition and a novel unified paradigm for document knowledge and OCR learning.

我们的预训练想通过渐进的多阶段策略, 系统地搭起模型的基础能力. 这包括精心设计的数据配比, 以及一种新的文档知识与 OCR 统一学习范式.

#### 2.2.1 Pre-training Strategy (预训练策略)

The pre-training comprises three progressive stages. Each stage strategically unfreezes different model components and introduces increasingly complex data to optimize learning efficiency.

预训练分三个渐进阶段. 每个阶段有针对地解冻不同的模型组件, 并引入越来越复杂的数据, 以提高学习效率.

**Stage 1.** We begin with a warm-up stage, training only the 2D-Resampler module while all other components remain frozen. This stage uses image-caption data to establish an initial alignment between visual and language modalities with minimal training cost.

**阶段 1.** 先是预热阶段, 只训练 2D-Resampler 模块, 其他组件全部冻结. 这一阶段用图像描述数据, 以最小的训练成本建立视觉与语言模态的初步对齐.

**Stage 2.** We then unfreeze the vision encoder to enhance the perceptual foundation capability. This stage consumes OCR-rich data and image-caption data. Since the data in this stage may lack the fluency or quality required for language modeling, the LLM decoder remains frozen in this stage.

**阶段 2.** 接着解冻视觉编码器, 增强感知基础能力. 这一阶段使用富含 OCR 的数据和图像描述数据. 这些数据的流畅度或质量可能达不到语言建模的要求, 所以 LLM 解码器仍保持冻结.

**Stage 3.** With the cross-modal bridge in place and the perceptual foundation set, the final stage trains all model parameters end-to-end using our highest quality data, including text-only corpora, image-text interleaved samples, videos, and a curated subset from earlier stages. At this point, we unfreeze the LLM decoder to fully exploit the knowledge and skills in data, encompassing multi-image reasoning and temporal understanding. We adopt the Warmup-Stable-Decay learning rate scheduler [15]. During the decay phase, we gradually add more high-quality instructions and knowledge-intensive data.

**阶段 3.** 跨模态的连接建好, 感知基础打牢之后, 最后一个阶段用质量最高的数据端到端训练全部参数, 数据包括纯文本语料, 图文交错样本, 视频, 以及从前面阶段挑出的一部分精选数据. 这时解冻 LLM 解码器, 充分吸收数据里的知识和技能, 包括多图推理和时间理解. 我们采用 Warmup-Stable-Decay 学习率调度器 [15]. 在衰减阶段逐步加入更多高质量指令数据和知识密集数据.

> **问:** 预训练三个阶段都只有 2D-Resampler, 第 3 阶段却放进了视频, 这时视频怎么编码?
> 本页没说. 第 6 页写明 3D-Resampler 是到 SFT 第二阶段才换上的, 而预训练第 3 阶段的数据列了 「videos」, 第 5 页也列了视频描述数据. 合理的读法是预训练时视频按帧走 2D-Resampler, 但这只是推断, 页面没给这时的帧数和每帧 token 数.

#### 2.2.2 Pre-training Data (预训练数据)

**Image Caption Data.** We combine large-scale public datasets (LAION-2B [16], COYO [17], etc.) with curated Chinese image-text pairs crawled from the web. We filter out low-resolution images and remove irrelevant image-text pairs with CLIP [18].

**图像描述数据.** 我们把大规模公开数据集 (LAION-2B [16], COYO [17] 等) 和从网上爬取的精选中文图文对合在一起. 过滤掉低分辨率图像, 并用 CLIP [18] 去掉不相关的图文对.

> **对一下:** 图文数据写的是 「LAION-2B [16]」, [16] 是哪一篇?
> 第 15 页 [16] 的标题是 「LAION-5B: an open large-scale dataset for training next generation image-text models」. LAION-2B 一般指 LAION-5B 里的英文子集, 但页面没交代这层关系, 按标题查会以为引错了. 同样, COYO [17] 的标题写的是 COYO-700M.

<!-- page 5 of 25 -->

![图 2: 以一页 Noise2Noise 论文为例演示三档破坏. 蓝框里的正文加了轻度噪点, 仍能认出, 对应增强 OCR; 粉框里的图注被重度模糊, 对应综合推断; 空白框整块遮掉, 对应上下文推断](images/p05-figure-2-unified-paradigm-for-document-knowledge-and.png)

Figure 2: Unified paradigm for document knowledge and OCR learning via dynamic visual corruption. We create a spectrum of training tasks through varied corruption levels: low corruption preserves readability to learn robust OCR, high corruption forces the model to perform contextual inference, and moderate corruption requires integrated inference from visual clues and context.

图 2: 通过动态视觉破坏, 统一学习文档知识和 OCR. 我们用不同的破坏强度构造出一系列训练任务: 低度破坏保留可读性, 用来学稳健的 OCR; 高度破坏迫使模型做上下文推断; 中度破坏要求模型结合视觉线索和上下文做综合推断.

To enrich alt-text descriptions, we employ a Capsfusion-based [19] re-captioning process on a subset to generate fluent and factually complete captions. In this way, we formulate the valuable world knowledge in raw captions into more fluent natural language. We employ an MLLM to tag images with concept labels and ensure a balanced distribution across languages and long-tail concepts.

为了丰富 alt-text 描述, 我们在一个子集上用基于 Capsfusion [19] 的重写流程, 生成流畅而事实完整的描述. 这样就把原始描述里有价值的世界知识改写成更流畅的自然语言. 我们还用一个 MLLM 给图像打概念标签, 保证在语言和长尾概念上的分布均衡.

**Image-Text Interleaved Data.** Sourced from Common Crawl, OmniCorpus [20], and MINT-1T [21], image-text interleaved data is crucial for in-context learning and multi-image understanding capabilities. We apply filtering to ensure quality, removing samples with broken images or imbalanced image-text ratios. We further use relevance filtering to ensure meaningful multimodal associations, and employ knowledge density filtering to select a high-quality subset for the final decay phase of pre-training.

**图文交错数据.** 图文交错数据来自 Common Crawl, OmniCorpus [20] 和 MINT-1T [21], 对上下文学习和多图理解能力很关键. 我们做了质量过滤, 去掉图片损坏或图文比例失衡的样本. 又用相关性过滤保证多模态之间有意义的关联, 并用知识密度过滤挑出一个高质量子集, 留给预训练最后的衰减阶段.

**OCR Data.** We synthesize OCR data to enhance the basic text recognition capability during the early pre-training stage. We render text on natural scenes with various combinations of color and font following [22], and also render real-world HTML sources into images.

**OCR 数据.** 我们合成 OCR 数据, 在预训练早期增强基础的文字识别能力. 参照 [22], 在自然场景图上用各种颜色和字体组合渲染文字, 也把真实的 HTML 源码渲染成图像.

**Document Data.** We collect documents, including scientific papers, academic reports, textbooks, etc., from the web. This data exhibits high knowledge density and contains visually complex layouts.

**文档数据.** 我们从网上收集科学论文, 学术报告, 教科书等文档. 这类数据知识密度高, 版式在视觉上也复杂.

**Video Caption Data.** We aggregate several public datasets (WebVid [23], Vript [24], OpenVid [25]) and supplement them with detailed video captions. This diverse collection supports the development of temporal visual reasoning capabilities essential for video comprehension.

**视频描述数据.** 我们汇总了几个公开数据集 (WebVid [23], Vript [24], OpenVid [25]), 并补充了详细的视频描述. 这批多样的数据支撑视频理解所需的时间视觉推理能力.

#### 2.2.3 Unified Paradigm for Document Knowledge and OCR Learning (文档知识与 OCR 的统一学习范式)

Documents, such as scientific papers, textbooks, and web pages, are vital resources for learning diverse layouts and acquiring multi-disciplinary knowledge in various domains. However, most MLLMs depend on brittle external parsers to convert document PDFs into an interleaved imagetext sequence for training. Such a noisy and inefficient process often introduces structural errors or requires heavy data engineering efforts to fix the failure cases.

科学论文, 教科书, 网页这类文档, 是学习多样版式, 获取各领域多学科知识的重要资源. 但多数 MLLM 依赖脆弱的外部解析器, 把文档 PDF 转成图文交错序列再训练. 这个流程噪声大又低效, 常常引入结构错误, 或者要靠繁重的数据工程修补失败样例.

Another challenge for OCR learning is that, while stronger image augmentation can create more diverse and harder samples, leading to more robust OCR capabilities, over-augmentation can make the texts indistinguishable. Forcing the model to produce the ground truth text from such indistinguishable visual input typically leads to hallucination problems. Therefore, previously, we could only afford a small and safe augmentation level.

OCR 学习的另一个难点是: 更强的图像增强能造出更多样, 更难的样本, 让 OCR 更稳健, 但增强过度会让文字无法辨认. 强迫模型从这种认不出的视觉输入里输出真值文本, 通常会引出幻觉. 所以以前我们只敢用较小, 较安全的增强强度.

<!-- page 6 of 25 -->

To overcome both challenges, we propose a unified training paradigm that learns directly from document images, using their original text as ground truth. Our key insight is that the key difference between document knowledge acquisition and text recognition is the visibility of the text in images. We unify both capabilities into a single learning objective: predicting original text from corrupted document images. By dynamically corrupting text regions with varying corruption levels, the model learns to adaptively and properly switch between precise text recognition (when text is distinguishable) and multimodal context-based knowledge reasoning (when text is heavily obscured or masked), as illustrated in Figure 2. This eliminates reliance on fragile parsers and prevents hallucinations from over-augmented OCR data.

为了同时解决这两个难题, 我们提出一种统一的训练范式, 直接从文档图像学习, 用文档的原始文本作真值. 我们的关键判断是: 文档知识获取和文字识别的根本区别, 在于图像里文字的可见程度. 于是我们把两种能力合进一个学习目标: 从被破坏的文档图像中预测原始文本. 以不同强度动态破坏文字区域, 模型就学会自适应地切换: 文字能辨认时做精确的文字识别, 文字被严重遮挡或完全遮住时做基于多模态上下文的知识推理, 如图 2 所示. 这样既不再依赖脆弱的解析器, 也避开了过度增强的 OCR 数据带来的幻觉.

Specifically, for each document, we treat a subset of its text regions as training ground truth. We then stochastically apply different levels of corruption to each region, essentially creating different training tasks:

具体来说, 对每份文档, 我们把其中一部分文字区域当作训练真值. 然后对每个区域随机施加不同强度的破坏, 相当于造出不同的训练任务:

1. **Low Corruption (Augmented OCR).** When mild noise is applied to a text region, the texts are still recognizable, and the model could effectively predict them via text recognition.

1. **低度破坏 (增强 OCR).** 对文字区域加轻微噪声时, 文字仍然认得出, 模型直接靠文字识别就能预测出来.

2. **Moderate Corruption (Integrated Inference).** When heavy noise is applied to the text region, individual characters become highly ambiguous and unreliable for recognition. The model must therefore learn to integrate the noisy visual cues from the corrupted region with the high-level document context and its internal knowledge to reconstruct the original text.

2. **中度破坏 (综合推断).** 对文字区域加重噪声时, 单个字符变得高度模糊, 靠识别已不可靠. 模型因此必须学会把被破坏区域里带噪的视觉线索, 与高层的文档上下文和自身的内部知识结合起来, 重建原文.

3. **High Corruption (Contextual Inference and Document Knowledge Learning).** With the text region completely masked out, the model cannot rely on character-level cues to predict the missing content. Consequently, the model is forced to infer the information only from the multimodal context and its internal knowledge, including other text, layout structures, charts, tables, and images. This directly cultivates document-level understanding.

3. **高度破坏 (上下文推断与文档知识学习).** 文字区域被完全遮掉后, 模型没法依靠字符级线索预测缺失内容. 它只能从多模态上下文和内部知识里推断, 包括其他文字, 版式结构, 图表, 表格和图像. 这直接培养了文档级的理解能力.

> **拆开:** 三档的名字是低, 中, 高, 可描述里 「中度」 写的是 「heavy noise」, 到底怎么分?
> 拆开看: 低档是 「mild noise」, 字还认得出; 中档是 「heavy noise」, 单个字符已不可靠; 高档是 「completely masked」, 整块遮掉. 所以 「中度」 其实是重噪, 「高度」 是遮挡. 本页没给噪声类型, 强度参数和三档的比例, 也没说被选作监督目标的文字区域占文档多少.

This unified approach yields a more efficient and resilient learning process. By learning directly from the document’s visual and textual structure, we avoid building complex document parsing pipelines and prevent potential noise introduced by fragile parsers. Furthermore, this paradigm allows us to fluidly combine knowledge learning and OCR objectives within the same training batch, maximizing data utility and producing a single, versatile model adept at a wide range of document understanding tasks.

这种统一做法让学习过程更高效, 也更经得起折腾. 直接从文档的视觉和文本结构中学习, 就不必搭复杂的文档解析流水线, 也避开了脆弱解析器可能带进来的噪声. 这个范式还允许在同一个训练 batch 里灵活混合知识学习和 OCR 目标, 把数据用足, 得到一个能胜任各类文档理解任务的通用模型.

**Takeaway**

**要点**

1. Foundation skills can be built on imperfect heterogeneous data sources by selectively freezing parameters.

2. Simple dynamic visual corruption on document image text can effectively unify knowledge learning, robust OCR and contextual inference into a single learning objective.

1. 有选择地冻结参数, 能在不完美的异构数据源上搭起基础技能.

2. 对文档图像里的文字做简单的动态视觉破坏, 就能把知识学习, 稳健 OCR 和上下文推断统一成一个学习目标.

### 2.3 Supervised Fine-tuning (SFT)

The Supervised Fine-Tuning (SFT) stage aims to activate the model’s capability on a broad range of tasks and prepares for reinforcement learning. Moreover, we extend the 2D-Resampler to a unified 3D-Resampler at this stage to enhance the compression efficiency of video data.

SFT 阶段的目标是激活模型在广泛任务上的能力, 并为强化学习做准备. 我们也在这一阶段把 2D-Resampler 扩展为统一 3D-Resampler, 提高视频数据的压缩效率.

#### 2.3.1 Supervised Fine-tuning Strategy (SFT 策略)

We first train the general interaction abilities, and then cultivate specialized skills for advanced reasoning and temporal understanding.

我们先训练通用的交互能力, 再培养高级推理和时间理解这些专门技能.

**Stage 1: General SFT.** This stage aims to activate the broad knowledge acquired during pre-training and align it with human instructions. By fine-tuning on a diverse mixture of high-quality instructionresponse data, the model develops proficiency in multimodal interaction. To prevent degradation of text-only performance and improve training stability, we include 10% high-quality text-only data in the training mixture.

**阶段 1: 通用 SFT.** 这一阶段要激活预训练学到的广泛知识, 并让它与人类指令对齐. 在多样的高质量指令-回复混合数据上微调后, 模型熟练掌握多模态交互. 为了防止纯文本性能退化并提高训练稳定性, 训练数据里混入 10% 的高质量纯文本数据.

**Stage 2: Long-CoT & 3D-Resampler.** Building on versatile foundations from the previous stage, we then cultivate specialized skills to support long reasoning mode, high frame rate, and long video understanding.

**阶段 2: Long-CoT 与 3D-Resampler.** 在上一阶段打下的通用基础上, 我们接着培养专门技能, 支持长推理模式, 高帧率和长视频理解.

<!-- page 7 of 25 -->

First, we unlock advanced reasoning by introducing the Long-CoT warm-up instructions into the SFT data. This encourages the model to perform an explicit step-by-step thinking process, incorporating cognitive patterns such as reflection and backtracking, which are vital for the long reasoning mode. Second, we enhance its temporal understanding by upgrading the architecture from 2D to 3D-Resampler and introducing high frame rate and long video data. Due to the unified design, we find that such an upgrade can be achieved efficiently with a small amount of high-quality video data.

首先, 在 SFT 数据中加入 Long-CoT 预热指令, 解锁高级推理. 这会鼓励模型做显式的逐步思考, 带上反思和回溯这类认知模式, 它们对长推理模式很关键. 其次, 把架构从 2D-Resampler 升级到 3D-Resampler, 并引入高帧率和长视频数据, 增强时间理解. 由于设计是统一的, 我们发现只需少量高质量视频数据就能高效完成这次升级.

#### 2.3.2 Supervised Fine-tuning Data (SFT 数据)

**STEM Data.** To enhance STEM reasoning, we curate a dataset of high-school and higher multidisciplinary problems from online educational websites, covering physics, chemistry, biology, finance, computer science, etc. To ensure the data quality, we implement a two-stage filtering process. First, we only keep samples that exhibit high visual dependency (i.e., not solvable without image information). Second, we perform a consistency check to validate the correctness of the answers. For each remaining sample, we perform rejection sampling with a powerful MLLM to collect a clean reasoning process.

**STEM 数据.** 为了增强 STEM 推理, 我们从在线教育网站整理了高中及以上难度的多学科题目, 覆盖物理, 化学, 生物, 金融, 计算机科学等. 为保证质量, 做两级过滤. 第一, 只保留视觉依赖度高的样本 (即没有图像信息就解不出来). 第二, 做一致性检查, 验证答案是否正确. 对剩下的每个样本, 用一个强 MLLM 做拒绝采样, 收集干净的推理过程.

**Long-tail Knowledge Data.** To address the long-tail problem where models often fail on less common topics, we incorporate long-tail knowledge from Wikipedia [26] to synthesize high-quality multimodal instruction-following data. Specifically, for each entity page, we construct multimodal instructions and answers using strong MLLMs and keep samples with high visual dependency.

**长尾知识数据.** 模型在冷门话题上常常答错, 为了解决这个长尾问题, 我们引入 Wikipedia [26] 的长尾知识, 合成高质量的多模态指令遵循数据. 具体来说, 对每个实体页面, 用强 MLLM 构造多模态指令和答案, 并保留视觉依赖度高的样本.

**Long-CoT Data.** Long-CoT data enables the model to acquire the necessary reasoning patterns for the long reasoning mode. Our data comes from OpenThoughts [27] and an in-house pipeline. We identify challenging prompts by filtering for those on which our early-stage models struggle. Our pilot studies show that focusing on challenging problems is the key to developing robust reasoning capabilities rather than memorizing trivial patterns. Each response then undergoes a multistage validation: we verify its correctness, assess trustworthiness with claim-level factual verification using RLAIF-V [28], and filter out meaningless repetition. Finally, validated responses are augmented through rewriting to enhance diversity.

**Long-CoT 数据.** Long-CoT 数据让模型学到长推理模式所需的推理套路. 数据来自 OpenThoughts [27] 和一条内部流水线. 我们挑出早期模型做不好的 prompt, 以此认定难题. 先导研究表明, 聚焦难题才是培养稳健推理能力的关键, 否则模型只会记住平凡的套路. 每条回复再经过多阶段验证: 检查正确性, 用 RLAIF-V [28] 做声明级事实核查以评估可信度, 并过滤掉无意义的重复. 最后通过改写对验证过的回复做增强, 提高多样性.

**Takeaway**

**要点**

Filtering out easy prompts and focusing on challenging problems is crucial for effective Long-CoT warm-up.

过滤掉简单 prompt, 集中在难题上, 是 Long-CoT 预热见效的关键.

### 2.4 Reinforcement Learning (强化学习)

The RL stage aims to enhance reasoning performance, enable controllable reasoning modes, and improve trustworthiness. To provide efficient general-domain rewards, we combine rule-verified rewards for straightforward cases with general probability-based rewards from RLPR [29] for complex answers and add a calibrated preference reward. A hybrid RL strategy is adopted to allow flexible switch between short and long reasoning modes. We further integrate RLAIF-V [28] to reduce hallucinations.

RL 阶段的目标是提升推理性能, 实现可控的推理模式, 并提高可信度. 为了高效地提供通用领域奖励, 我们对简单情形用规则验证的奖励, 对复杂答案用 RLPR [29] 的通用概率奖励, 另外再加一个校准过的偏好奖励. 我们采用混合 RL 策略, 让模型能在短推理和长推理模式之间灵活切换. 我们还集成了 RLAIF-V [28] 来减少幻觉.

#### 2.4.1 Reinforcement Learning Data (强化学习数据)

Our RL data contains high-quality samples that span four key domains. Each subset underwent a rigorous, human-in-the-loop cleaning and deduplication process.

我们的 RL 数据包含覆盖四个关键领域的高质量样本. 每个子集都经过严格的人在回路清洗和去重.

**Mathematics.** We collect multimodal math problems from academic sources [30, 31, 32], which require the integration of visual perception and logical reasoning. We observe that many open-source datasets contain severe label errors and adopt a thorough cleaning process to produce the final high-quality set.

**数学.** 我们从学术来源 [30, 31, 32] 收集多模态数学题, 这些题要把视觉感知和逻辑推理结合起来. 我们发现许多开源数据集有严重的标签错误, 因此做了彻底清洗, 得到最终的高质量数据集.

**Documents, Tables, and Charts.** To improve reasoning on perceptually complex scenarios, we curate a diverse mix of real-world datasets [33, 34, 35, 36, 37] and synthetic datasets [38, 39, 40] to improve the coverage of domains.

**文档, 表格与图表.** 为了提升感知复杂场景下的推理, 我们整理了多样的真实数据集 [33, 34, 35, 36, 37] 和合成数据集 [38, 39, 40], 扩大领域覆盖面.

**General Reasoning.** To further improve general reasoning capabilities, we assemble a diverse collection of problems covering logical and multi-disciplinary reasoning tasks from VisualWebInstruct [41] and additional web resources.

**通用推理.** 为了进一步提升通用推理能力, 我们从 VisualWebInstruct [41] 和其他网络资源中汇集了多样的题目, 覆盖逻辑推理和多学科推理任务.

<!-- page 8 of 25 -->

These data exhibit a more complex reference answer style; many of the problems have more than one sub-question.

这些数据的参考答案风格更复杂, 许多题目包含不止一个子问题.

**Instruct Following.** We incorporate text-only instructions from the Llama-Nemotron-Post-Training Dataset [42] and the MulDimIF dataset [43]. We observe that the instruction-following improvement generalizes well to multimodal instructions.

**指令遵循.** 我们引入 Llama-Nemotron-Post-Training 数据集 [42] 和 MulDimIF 数据集 [43] 中的纯文本指令. 我们观察到, 指令遵循上的提升能很好地泛化到多模态指令.

#### 2.4.2 Reward Quality Control (奖励质量控制)

The efficacy of RL is highly dependent on data quality. Thus, we implement meticulous quality control processing, focusing on two distinct aspects:

RL 的效果高度依赖数据质量. 因此我们做了细致的质量控制, 聚焦两个不同的方面:

**Label Accuracy.** Incorrect labels can introduce flawed supervision signals. For each dataset, we maintain a small subset to inspect the label accuracy and conduct a human-in-the-loop cleaning process to keep a high label accuracy.

**标签准确率.** 错误标签会带来有缺陷的监督信号. 对每个数据集, 我们留一个小子集检查标签准确率, 并做人在回路的清洗, 让标签保持高准确率.

**Rewarding Accuracy.** Verifying model-generated responses in the general domain is a nontrivial challenge. Hand-crafted rules struggle to tackle the complexity of natural language. To address this, we dynamically apply the most suitable validation method for each case. For straightforward answers containing only a few tokens, we employ a rule-based verification system, achieving 98% reward accuracy. For complex natural language answers where rules are brittle (e.g., those containing specific units or longer phrasing), we use the more robust probability-based rewards of RLPR [29].

**奖励准确率.** 在通用领域验证模型生成的回复并不容易. 手写规则难以应对自然语言的复杂性. 为此, 我们针对每个样例动态选用最合适的验证方法. 对只含几个 token 的简单答案, 用基于规则的验证系统, 奖励准确率达到 98%. 对规则容易失效的复杂自然语言答案 (比如带特定单位或措辞较长的答案), 用更稳健的 RLPR [29] 概率奖励.

**Rewarding Coverage.** To complement these accuracy-focused signals, we integrate a reward model to provide a dense preference-aligned signal that guides the model towards higher-quality humanlike responses. We apply the reward model to only the final answer part for the long reasoning mode to avoid the out-of-distribution problem.

**奖励覆盖面.** 为了补充这些侧重准确性的信号, 我们集成一个奖励模型, 提供与偏好对齐的稠密信号, 引导模型给出质量更高, 更像人的回复. 在长推理模式下, 奖励模型只作用于最终答案部分, 以避开分布外问题.

> **确认:** 2.4.2 节开头说质量控制 「聚焦两个方面」, 下面实际列了几条?
> 三条: Label Accuracy, Rewarding Accuracy, Rewarding Coverage. 第三条讲的是奖励模型提供的稠密偏好信号, 属于覆盖面而不是准确率, 像是后来补进来的. 另外 「规则验证达到 98% 奖励准确率」 没说在什么样本上, 用什么办法测的.

#### 2.4.3 Hybrid Reinforcement Learning (混合强化学习)

We adopt a controllable hybrid reasoning design for our RL model: a short reasoning mode for quick answers and a long reasoning mode that emits explicit step-by-step traces for complex problems. Mode switching is controlled by prompts. Both behaviors are initialized during SFT and then optimized jointly via hybrid RL, where rollouts randomly alternate between the two modes.

我们的 RL 模型采用可控的混合推理设计: 短推理模式快速作答, 长推理模式对复杂问题输出显式的逐步推理轨迹. 模式切换由 prompt 控制. 两种行为都在 SFT 阶段初始化, 再通过混合 RL 联合优化, rollout 时在两种模式间随机交替.

We apply GRPO [44] to optimize the model with these rollouts and remove the KL and entropy loss to improve stability. This training schedule not only preserves the efficiency of short responses while retaining complex reasoning capabilities, but also fosters cross-generalization, where reasoning capabilities learned in one mode can transfer to improve the other mode.

我们用 GRPO [44] 基于这些 rollout 优化模型, 并去掉 KL 损失和熵损失以提高稳定性. 这套训练安排既保住了短回复的效率, 又保留了复杂推理能力, 还促成交叉泛化: 在一种模式中学到的推理能力可以迁移过去, 提升另一种模式.

#### 2.4.4 Reward Shaping (奖励塑形)

We design the reward shaping strategy to balance task capability, human preference, and training stability. The final reward signal is a weighted composite of four components: an accuracy reward $R_{\mathrm{acc}}$, a format reward $R_{\mathrm{format}}$, a repetition penalty reward $R_{\mathrm{rep}}$, and a preference reward $R_{\mathrm{rm}}$. The preference reward is derived from an auxiliary RM trained with human preference data [45]. However, directly applying RMs in the long reasoning mode yields unsatisfactory results since standard RMs struggle to evaluate the out-of-distribution long reasoning chains, leading to worse alignment and training instability, which is also confirmed in our preliminary experiments.

我们设计的奖励塑形策略, 要在任务能力, 人类偏好和训练稳定性之间取得平衡. 最终奖励信号是四个分量的加权组合: 准确率奖励 $R_{\mathrm{acc}}$, 格式奖励 $R_{\mathrm{format}}$, 重复惩罚奖励 $R_{\mathrm{rep}}$, 以及偏好奖励 $R_{\mathrm{rm}}$. 偏好奖励来自一个用人类偏好数据训练的辅助奖励模型 (RM) [45]. 但在长推理模式下直接用 RM 效果不好, 因为标准 RM 难以评估分布外的长推理链, 会导致对齐变差和训练不稳定, 我们的初步实验也证实了这一点.

To address this, we adopt a selective application strategy. The RM scores only the final answer part of the response, completely bypassing the explicit thinking steps. This provides a stable, dense reward signal that aligns with human preferences without incorrectly penalizing complex reasoning paths. The final reward is calculated as follows.

为此, 我们采用选择性应用的策略. RM 只给回复的最终答案部分打分, 完全绕开显式的思考步骤. 这样得到的奖励信号稳定, 稠密, 与人类偏好一致, 又不会错误地惩罚复杂的推理路径. 最终奖励按下式计算.

$$
R = R _ {\mathrm{acc}} + R _ {\mathrm{format}} + R _ {\mathrm{rep}} + \frac {1}{2} \tilde {R} _ {\mathrm{rm}}.\tag{1}
$$

Here, $\tilde{R}_{\mathrm{rm}}$ is the standardized preference reward score computed using $\frac{R_{\mathrm{rm}} - \bar{R}_{\mathrm{rm}}}{\sigma(R_{\mathrm{rm}})}$, where $\bar{R}_{\mathrm{rm}}$ and $\sigma(R_{\mathrm{rm}})$ represent the average and standard deviation of raw reward scores from responses sampled with the same prompt.

这里 $\tilde{R}_{\mathrm{rm}}$ 是标准化后的偏好奖励分数, 按 $\frac{R_{\mathrm{rm}} - \bar{R}_{\mathrm{rm}}}{\sigma(R_{\mathrm{rm}})}$ 计算, 其中 $\bar{R}_{\mathrm{rm}}$ 和 $\sigma(R_{\mathrm{rm}})$ 是同一 prompt 采样出的多条回复的原始奖励分数的均值和标准差.

> **想:** 正文说最终奖励是四项的 「加权组合」, 式 (1) 里的权重各是多少?
> 按式 (1), $R_{\mathrm{acc}}$, $R_{\mathrm{format}}$, $R_{\mathrm{rep}}$ 的权重都是 1, 只有标准化后的偏好分乘 1/2. 偏好分先按同一 prompt 的多条回复做了均值方差标准化, GRPO 又会在组内对总奖励再标准化一次, 两次叠加后 1/2 的实际分量会随其他三项的组内方差变化. 各项的取值范围, $R_{\mathrm{rep}}$ 取负值还是 0/1, 本页都没给.

<!-- page 9 of 25 -->

#### 2.4.5 RLAIF-V (基于 AI 反馈的可信对齐)

Visual hallucinations remain a critical limitation for MLLMs, particularly in applications requiring high reliability. To address this challenge, we integrate RLAIF-V [28] to make the responses more factually grounded to the visual input through alignment from scalable AI feedback. Notably, we extend this approach to video inputs, where hallucination problems are especially pronounced.

视觉幻觉仍是 MLLM 的一个关键短板, 在要求高可靠性的应用里尤其突出. 为此我们集成 RLAIF-V [28], 借助可大规模获取的 AI 反馈做对齐, 让回复更扎实地基于视觉输入. 值得一提的是, 我们把这套方法扩展到了视频输入, 视频上的幻觉问题尤其明显.

**Response Sampling.** We first sample multiple responses from the policy model under the same generation condition. This strategy ensures focused evaluation of factual accuracy, avoiding distributional mismatches between models.

**回复采样.** 先在相同的生成条件下, 从策略模型采样多条回复. 这样评估能集中在事实准确性上, 避开不同模型之间的分布不匹配.

**Feedback Collection.** We begin by decomposing complex responses into verifiable atomic claims, where each claim is independently validated. This transforms the complex long response evaluation into simpler claim-level verification, addressing the inherent challenge of holistic assessment and improving the precision of factual evaluation. Preference pairs are then constructed based on aggregated claim verification scores, where responses containing fewer factual errors are preferred.

**反馈收集.** 先把复杂回复拆成可验证的原子声明, 每条声明单独验证. 这就把复杂的长回复评估变成较简单的声明级验证, 绕开了整体评估的固有难题, 也提高了事实评估的精度. 然后按汇总后的声明验证分数构造偏好对, 事实错误更少的回复被判为更优.

**Preference Learning.** The resulting preference dataset, encompassing both image and video modalities, is used to train the model with DPO [46]. This stage proves particularly effective for visual tasks where factual accuracy is paramount, without compromising response quality or natural language fluency.

**偏好学习.** 得到的偏好数据集同时涵盖图像和视频两种模态, 用 DPO [46] 训练模型. 这一阶段对事实准确性最要紧的视觉任务特别有效, 同时不损害回复质量和语言流畅度.

**Takeaway**

**要点**

1. Combining rule-based reward for simple responses and probability-based reward for complex natural language responses enables a reliable reward system for diverse tasks.

2. Hybrid RL enables cross-mode generalization between long and short reasoning modes.

1. 简单回复用规则奖励, 复杂的自然语言回复用概率奖励, 两者结合能为多样的任务提供可靠的奖励体系.

2. 混合 RL 让长推理和短推理两种模式之间产生跨模式泛化.

## 3 Experiments (实验)

In this section, we empirically evaluate the performance of MiniCPM-V 4.5, and the effectiveness of the proposed methods.

本节用实验评估 MiniCPM-V 4.5 的性能, 以及所提方法的有效性.

### 3.1 Baselines and Benchmarks (基线与基准)

We compare with various strong baseline models: (1) state-of-the-art open-source models, represented by Qwen2.5-VL 72B [7]; (2) strong models of comparable parameter sizes, encompassing parameter-matched competitors such as InternVL3 [9] (8B), and GLM-4.1V [1] (9B); and (3) frontier proprietary models such as the latest GPT-4o [4].

我们与多种强基线模型比较: (1) 最先进的开源模型, 以 Qwen2.5-VL 72B [7] 为代表; (2) 参数规模相当的强模型, 包括参数量匹配的对手 InternVL3 [9] (8B) 和 GLM-4.1V [1] (9B); (3) 前沿闭源模型, 如最新的 GPT-4o [4].

Our evaluation encompasses several key areas of multimodal capabilities:

我们的评测覆盖多模态能力的几个关键方面:

**STEM** includes mathematics and science-oriented benchmarks such as MMMU [47], Math-Vista [48], AI2D [49], MathVerse [50], LogicVista [51], and EMMA [52], designed to evaluate logical reasoning, mathematical problem-solving, and scientific understanding capabilities.

**STEM** 包括数学和科学类基准, 如 MMMU [47], MathVista [48], AI2D [49], MathVerse [50], LogicVista [51] 和 EMMA [52], 用来评估逻辑推理, 数学解题和科学理解能力.

**Document, OCR & Chart** covers OCR-related tasks through OCRBench [53], ChartQA [54], TextVQA [55], DocVQA [56], and OmniDocBench [57], testing ability to extract, interpret, and reason about textual information in various visual contexts, including documents and charts.

**文档, OCR 与图表** 通过 OCRBench [53], ChartQA [54], TextVQA [55], DocVQA [56] 和 OmniDocBench [57] 覆盖 OCR 相关任务, 考查在文档, 图表等各种视觉场景中提取, 解读和推理文字信息的能力.

**Hallucination** evaluates model reliability through HallusionBench [58], ObjHalBench [59], and MMHal-Bench [60], measuring the tendency to generate false or inconsistent information.

**幻觉** 用 HallusionBench [58], ObjHalBench [59] 和 MMHal-Bench [60] 评估模型可靠性, 衡量生成错误或自相矛盾信息的倾向.

**Multi-Image & Real-World & Instruction Following** includes Mantis [61], MMT-Bench [62], RealWorldQA [63], and MM-IFEval [64], assessing performance on complex scenarios involving multiple images, real-world understanding, and instruction following.

**多图, 真实世界与指令遵循** 包括 Mantis [61], MMT-Bench [62], RealWorldQA [63] 和 MM-IFEval [64], 评估多图, 真实世界理解和指令遵循这些复杂场景下的表现.

**Video Understanding** encompasses Video-MME [65], LVBench [66], MLVU [67], LongVideoBench [68], MotionBench [69], and FavorBench [70], evaluating temporal reasoning and dynamic visual comprehension across various video tasks.

**视频理解** 包括 Video-MME [65], LVBench [66], MLVU [67], LongVideoBench [68], MotionBench [69] 和 FavorBench [70], 评估各类视频任务中的时间推理和动态视觉理解.

**Comprehensive Multimodal Understanding** includes benchmarks such as OpenCompass [71], MMVet [72], MMStar [73], MME [74], and MMBench V1.1 [75], which assess general vision-language comprehension across diverse task types.

**综合多模态理解** 包括 OpenCompass [71], MMVet [72], MMStar [73], MME [74] 和 MMBench V1.1 [75] 等基准, 评估各类任务上的通用视觉语言理解.

<!-- page 10 of 25 -->

<table><tr><td>Task</td><td>Benchmark</td><td>MiniCPM-V 4.5</td><td>Qwen2.5-VL</td><td>Qwen2.5-VL</td><td>InternVL3</td><td>GLM-4.1V</td><td>GPT-4o</td></tr><tr><td>Size</td><td></td><td>8B</td><td>7B</td><td>72B</td><td>8B</td><td>9B</td><td>-</td></tr><tr><td>Mode</td><td></td><td>hybrid</td><td>non-thinking</td><td>non-thinking</td><td>non-thinking</td><td>thinking</td><td>non-thinking</td></tr><tr><td rowspan="5">Comprehensive Multimodal</td><td>OpenCompass</td><td> $77.0^†$ </td><td>70.5</td><td>76.1</td><td>73.6</td><td>76.6</td><td> $75.4^‡$ </td></tr><tr><td>MMVet</td><td> $75.5^†$ </td><td>67.1</td><td>76.9</td><td>81.3</td><td> $70.5^†$ </td><td> $76.9^‡$ </td></tr><tr><td>MMStar</td><td> $72.1^†$ </td><td>63.9</td><td>70.5</td><td>68.2</td><td>72.9</td><td> $70.2^‡$ </td></tr><tr><td>MME</td><td>2500</td><td>2347</td><td>2483</td><td>2415</td><td> $2466^†$ </td><td> $2318^*$ </td></tr><tr><td>MMBench V1.1</td><td> $84.2^†$ </td><td>82.6</td><td>87.8</td><td>81.7</td><td>85.3</td><td> $86.0^‡$ </td></tr><tr><td rowspan="6">STEM</td><td>MMMU</td><td> $67.7^†$ </td><td>58.6</td><td>68.2</td><td>62.7</td><td>68.0</td><td> $72.9^‡$ </td></tr><tr><td>MathVista</td><td> $79.9^†$ </td><td>68.2</td><td>74.2</td><td>71.6</td><td>80.7</td><td> $71.6^‡$ </td></tr><tr><td>AI2D</td><td>86.5</td><td>83.9</td><td>88.5</td><td>85.2</td><td>87.9</td><td> $86.3^‡$ </td></tr><tr><td>MathVerse MINI</td><td> $58.8^†$ </td><td>49.2</td><td>47.3</td><td>39.8</td><td>68.4</td><td>40.6</td></tr><tr><td>LogicVista</td><td> $57.0^†$ </td><td>44.1</td><td>55.7</td><td>44.1</td><td>60.4</td><td>52.8</td></tr><tr><td>EMMA</td><td> $34.8^†$ </td><td> $28.6^*$ </td><td>-</td><td>-</td><td> $35.7^†$ </td><td>32.4</td></tr><tr><td rowspan="6">Document,OCR &amp; Chart</td><td>OCRBench</td><td>89.0</td><td>86.4</td><td>88.2</td><td>88.0</td><td>84.2</td><td> $82.2^‡$ </td></tr><tr><td>ChartQA</td><td>87.4</td><td>87.3</td><td>89.5</td><td>86.6</td><td> $87.1^†$ </td><td>86.7</td></tr><tr><td>TextVQA</td><td>82.2</td><td>84.9</td><td>83.5</td><td>80.2</td><td> $79.9^†$ </td><td> $85.6^*$ </td></tr><tr><td>DocVQA</td><td> $94.7^†$ </td><td>95.7</td><td>96.4</td><td>92.7</td><td> $93.4^†$ </td><td>93.0</td></tr><tr><td>OmniDocBench (EN) ↓</td><td>0.175</td><td>0.316</td><td>0.214</td><td>0.335*</td><td>0.460*</td><td>0.233</td></tr><tr><td>OmniDocBench (ZH) ↓</td><td>0.253</td><td>0.399</td><td>0.261</td><td>0.390*</td><td>0.573*</td><td>0.399</td></tr><tr><td rowspan="5">Hallucination</td><td>HallusionBench</td><td> $61.2^†$ </td><td>52.9</td><td>54.6</td><td>49.9</td><td>63.2</td><td> $57.0^‡$ </td></tr><tr><td>ObjHalBench (CHAIRs) ↓</td><td> $9.3^†$ </td><td>13.7*</td><td>17.0*</td><td>11.3*</td><td>12.3*</td><td>-</td></tr><tr><td>ObjHalBench (CHAIRi) ↓</td><td> $5.2^†$ </td><td>7.7*</td><td>8.9*</td><td>6.5*</td><td>6.4*</td><td>-</td></tr><tr><td>MMHal-Bench (Score)</td><td> $5.0^†$ </td><td>4.1*</td><td>4.2*</td><td>4.2*</td><td>4.6*</td><td>-</td></tr><tr><td>MMHal-Bench (Rate)↓</td><td> $19.4^†$ </td><td>31.6*</td><td>38.2*</td><td>24.3*</td><td>22.9*</td><td>-</td></tr><tr><td rowspan="4">Multi-Image &amp; Real World &amp; Instruction Following</td><td>Mantis</td><td> $82.5^†$ </td><td>74.7*</td><td>81.1*</td><td>70.1</td><td> $78.8^†$ </td><td>-</td></tr><tr><td>MMT-Bench</td><td>68.3</td><td>63.6</td><td>-</td><td>65.0</td><td>67.6</td><td>66.7*</td></tr><tr><td>RealWorldQA</td><td> $72.1^†$ </td><td>68.5</td><td>75.7</td><td>70.8</td><td> $70.7^†$ </td><td> $76.8^*$ </td></tr><tr><td>MM-IFEval</td><td>66.0</td><td>51.3*</td><td> $73.8^*$ </td><td>53.2*</td><td> $58.4^†$ </td><td>64.6</td></tr><tr><td rowspan="7">Video Understanding</td><td>Video-MME (w/o subs)</td><td>67.9</td><td>65.1</td><td>73.3</td><td>66.3</td><td>68.2</td><td>71.9</td></tr><tr><td>Video-MME (w/ subs)</td><td>73.5</td><td>71.6</td><td>79.1</td><td>68.9</td><td>73.6</td><td>77.2</td></tr><tr><td>LVBench</td><td>50.4</td><td>45.3</td><td>47.3</td><td>44.1*</td><td>44.0</td><td>48.9</td></tr><tr><td>MLVU (M-Avg)</td><td>75.1</td><td>70.2</td><td>74.6</td><td>71.4</td><td> $72.5^†$ </td><td>-</td></tr><tr><td>LongVideoBench (val)</td><td>63.9</td><td>56.0</td><td>60.7</td><td>58.8</td><td>65.7</td><td>-</td></tr><tr><td>MotionBench</td><td>59.7</td><td>53.0</td><td>58.3</td><td>58.1</td><td>59.0</td><td>58.0</td></tr><tr><td>FavorBench</td><td>56.0</td><td>42.3</td><td>48.1</td><td>45.3</td><td> $51.2^†$ </td><td>-</td></tr></table>

Table 1: Evaluation results across diverse vision-language benchmarks. The best performance is marked in bold.∗ We evaluate officially released checkpoints by ourselves. † Reasoning mode used, where the average score of three runs is reported for robust evaluation. ‡ GPT-4o-latest evaluation results from OpenCompass. Otherwise GPT-4o-1120 is used in evaluation, since GPT-4o-latest is only accessible via Web API.

表 1: 多种视觉语言基准上的评测结果. 最好成绩用粗体标出. ∗ 我们自己评测官方发布的 checkpoint. † 使用推理模式, 报告三次运行的平均分, 让评测更稳. ‡ GPT-4o-latest 的结果取自 OpenCompass. 其余情况用 GPT-4o-1120 评测, 因为 GPT-4o-latest 只能通过网页 API 访问.

表 1 按任务分七组, 列出 MiniCPM-V 4.5 (8B, 混合模式) 与 Qwen2.5-VL 7B, Qwen2.5-VL 72B, InternVL3 8B, GLM-4.1V 9B (思考模式), GPT-4o 在 30 项指标上的分数; 带 ↓ 的指标越低越好. MinerU 转换时丢了粗体, 最好成绩要自己比.

Within the OpenCompass average, we use the long reasoning mode for 5 benchmarks, including MMStar, MMVet, HallusionBench, MathVista, and MMMU.

在 OpenCompass 平均分里, 我们对 5 个基准使用长推理模式, 分别是 MMStar, MMVet, HallusionBench, MathVista 和 MMMU.

> **看表:** 表注说 OpenCompass 平均里只有 5 个基准用长推理, 表 1 哪一格和这个说法对不上?
> MMBench V1.1 的 84.2 带 †, 可它不在 MMStar, MMVet, HallusionBench, MathVista, MMMU 这 5 个里, 而 † 在表注里的意思是 「用了推理模式」. 如果算进 OpenCompass 的 MMBench 用的是短推理分数, 那 84.2 就不是进入 77.0 的那个数. AI2D 86.5 和 OCRBench 89.0 不带 †, 和说法一致.

### 3.2 Main Results (主要结果)

As shown in Table 1, MiniCPM-V 4.5 demonstrates strong performance across a wide range of vision-language capabilities.

如表 1 所示, MiniCPM-V 4.5 在广泛的视觉语言能力上表现强劲.

**Comprehensive Capability.** MiniCPM-V 4.5 achieves an average score of 77.0 on OpenCompass, a comprehensive evaluation of 8 popular benchmarks. With only 8B parameters, it surpasses widely used proprietary models like GPT-4o-latest and strong open-source models like Qwen2.5-VL 72B for vision-language capabilities.

**综合能力.** MiniCPM-V 4.5 在 OpenCompass 上平均得 77.0 分, 这是对 8 个常用基准的综合评测. 只用 8B 参数, 它在视觉语言能力上超过了 GPT-4o-latest 这样广泛使用的闭源模型, 以及 Qwen2.5-VL 72B 这样的强开源模型.

<!-- page 11 of 25 -->

Table 2 (a): OpenCompass results of thinking models.

表 2 (a): 思考模型的 OpenCompass 结果.

| Model | Size | Avg Score ↑ | Time ↓ |
| --- | --- | --- | --- |
| GLM-4.1V-9B-thinking | 10.3B | 76.6 | 17.5h |
| MiMo-VL-7B-RL | 8.3B | 76.4 | 11.0h |
| MiniCPM-V 4.5 | 8.7B | 77.0 | 7.5h |

Table 2 (b): Video-MME results.

表 2 (b): Video-MME 结果.

| Model | Size | Score ↑ | Time ↓ | Mem ↓ |
| --- | --- | --- | --- | --- |
| Qwen2.5-VL-7B | 8.3B | 71.6 | 3.00h | 60G |
| GLM-4.1V-9B-thinking | 10.3B | 73.6 | 2.63h | 32G |
| MiniCPM-V 4.5 | 8.7B | 73.5 | 0.26h | 28G |

Table 2: Inference efficiency on 8 A100 GPUs. Best results are marked in bold.

表 2: 8 张 A100 GPU 上的推理效率. 最好结果用粗体标出.

> **核对:** 表 1 写 MiniCPM-V 4.5 8B, Qwen2.5-VL 7B, GLM-4.1V 9B, 到了表 2 怎么变成 8.7B, 8.3B, 10.3B?
> 表 1 是模型名里的标称档位, 表 2 看来是实际参数量 (推断包含视觉部分), 三者都比标称多 0.7B 到 1.3B; MiMo-VL-7B-RL 在表 2 也写 8.3B. 摘要的 「8B」 是标称值, 实际数是表 2 的 8.7B, 本页没拆 8.7B 里 LLM 和视觉编码器各占多少.

**Video Understanding.** The model achieves strong performance on high frame rate and fine-grained action dynamics video benchmarks such as MotionBench and FlavorBench. It also shows competitive performance on long video understanding benchmarks such as VideoMME, LVBench, MLVLU, LongVideoBench, etc.

**视频理解.** 模型在高帧率和细粒度动作动态类的视频基准上表现强劲, 如 MotionBench 和 FlavorBench. 在 VideoMME, LVBench, MLVLU, LongVideoBench 等长视频理解基准上也有竞争力.

> **再看:** 3.2 节说视频上 「在 MotionBench 和 FlavorBench 表现强」, 对着表 1 再看一遍.
> 表 1 里叫 FavorBench, 正文拼成 FlavorBench, MLVU 也拼成了 MLVLU. 数值上 MotionBench 59.7 和 FavorBench 56.0 在这一栏最高, LVBench 50.4, MLVU 75.1 也最高; LongVideoBench 63.9 低于 GLM-4.1V 的 65.7, Video-MME 两行低于 Qwen2.5-VL 72B 和 GLM-4.1V. 正文对长视频只用 「competitive」, 这个措辞是准的.

**OCR and Document Analysis.** MiniCPM-V 4.5 achieves leading performance on OCRBench, surpassing proprietary models such as GPT-4o-latest. It also achieves state-of-the-art performance for PDF document parsing capability on OmniDocBench among general MLLMs.

**OCR 与文档分析.** MiniCPM-V 4.5 在 OCRBench 上领先, 超过 GPT-4o-latest 等闭源模型. 在通用 MLLM 里, 它在 OmniDocBench 的 PDF 文档解析上也达到 state-of-the-art.

**Hallucination Reduction.** The model shows a significant reduction in visual hallucinations, outperforming other models on ObjectHalBench and MMHal-Bench, since the RLAIF-V training stage specifically enhances the level of trustworthiness.

**幻觉降低.** 模型的视觉幻觉明显减少, 在 ObjectHalBench 和 MMHal-Bench 上超过其他模型, 因为 RLAIF-V 训练阶段专门提升了可信度.

### 3.3 Inference Efficiency (推理效率)

We evaluated the inference efficiency of MiniCPM-V 4.5 in a standard configuration of 8 A100 GPUs on both image understanding and video understanding tasks. As detailed in Table 2, our model achieves competitive or superior performance while significantly reducing inference time and GPU memory consumption compared to other leading models. On OpenCompass, MiniCPM-V 4.5 not only achieves the highest average score among models under 30B, but also finishes the evaluation using 42.9% of the time of GLM-4.1V. This efficiency is enabled by the model’s flexible short and long reasoning modes. On VideoMME, the model demonstrates remarkable efficiency gains. With a strong performance of 73.6, it also reduces the inference time by nearly 10× (from 2.63h to 0.26h) and uses the least memory of 28G. This improvement is primarily due to the efficient 3D-Resampler, which compresses videos jointly considering spatial and temporal dimensions.

我们在 8 张 A100 GPU 的标准配置下, 评估了 MiniCPM-V 4.5 在图像理解和视频理解任务上的推理效率. 如表 2 所示, 与其他领先模型相比, 我们的模型性能相当或更好, 推理时间和显存占用却明显更少. 在 OpenCompass 上, MiniCPM-V 4.5 不仅在 30B 以下模型中平均分最高, 跑完评测的时间也只有 GLM-4.1V 的 42.9%. 这份效率来自模型灵活的短推理和长推理模式. 在 VideoMME 上效率提升更明显. 它以 73.6 的强劲表现, 把推理时间缩短近 10 倍 (从 2.63h 到 0.26h), 显存也最少, 为 28G. 这一提升主要归功于高效的 3D-Resampler, 它同时考虑空间和时间两个维度来压缩视频.

> **核对:** 3.3 节说 VideoMME 上 「以 73.6 的强劲表现」 把时间从 2.63h 降到 0.26h, 73.6 是谁的分?
> 表 2 (b) 里 73.6 是 GLM-4.1V-9B-thinking 的分, MiniCPM-V 4.5 是 73.5; 表 1 有字幕一行也是 73.5 对 73.6, 正文把两格看串了. 2.63 / 0.26 约 10.1 倍, 「近 10 倍」 成立; 28G 也确实是三者里最低.

### 3.4 Ablations (消融)

We ablate key design choices of MiniCPM-V 4.5 in this section.

本节对 MiniCPM-V 4.5 的关键设计做消融.

**Hybrid reasoning reinforcement learning helps improve overall performance and efficiency.** We evaluate the hybrid RL strategy that mixes samples from both long and short reasoning modes during training. As shown in Table 3, we observe that the hybrid strategy achieves the best multimodal understanding performance, demonstrating it effectively incentivizes strong long reasoning capability with only half of the long reasoning samples during training.

**混合推理 RL 提升了整体性能和效率.** 我们评估了训练中混合长短两种推理模式样本的混合 RL 策略. 如表 3 所示, 混合策略的多模态理解性能最好, 说明它只用一半的长推理样本, 就有效激发了很强的长推理能力.

| Method | OpenCompass | Training Tokens |
| --- | --- | --- |
| Short reasoning only | 76.0 | 1.6B |
| Long reasoning only | 77.0 | 4.4B |
| Hybrid | 77.1 | 3.1B |

Table 3: Ablation of hybrid reinforcement learning. We report training token cost and performance on OpenCompass.

表 3: 混合 RL 的消融. 报告训练 token 开销和 OpenCompass 上的性能.

Moreover, the hybrid strategy consumes only 70.5% of the training token costs of the long reasoning only setting to achieve better performance. We hypothesize that this is because both modes share foundational perceptual and cognitive skills. The analytical depth cultivated by long reasoning appears to bolster the short reasoning, while the efficiency and directness learned from the short reasoning refine the long reasoning process.

此外, 混合策略只花了纯长推理设置 70.5% 的训练 token, 性能却更好. 我们推测这是因为两种模式共享基础的感知和认知技能. 长推理培养出的分析深度似乎能增强短推理, 而短推理学到的效率和直接性又能打磨长推理过程.

> **回看:** 表 3 里混合策略 OpenCompass 77.1, 回看表 1, 最终模型为什么是 77.0?
> 表 3 是消融, 最终模型在 RL 之后还有 RLAIF-V 阶段 (第 9 页), 页面没说 77.1 取自哪个 checkpoint, 也没给它的波动范围; 表 1 的 77.0 带 †, 是三次平均. 3.1B / 4.4B 约 70.5%, 与正文一致, 但 3.1B 是总 token, 其中长推理占多少没有拆开.

**Probability-based reward complements rule-verification reward.** In addition to rule-based reward for easy-to-verify responses, MiniCPM-V 4.5 further incorporates the probability-based reward from RLPR [29] for general domain response verification. As shown in Figure 3, combining both rule-based and probability-based signals (VR + PR) consistently and substantially outperforms the rule-only approach, while also yielding stable training patterns with respect to response length and entropy.

**概率奖励补上了规则验证奖励的空缺.** 除了对易验证的回复用规则奖励, MiniCPM-V 4.5 还引入 RLPR [29] 的概率奖励, 用于通用领域的回复验证. 如图 3 所示, 同时用规则信号和概率信号 (VR + PR), 始终大幅优于只用规则的做法, 并且在回复长度和熵上表现出稳定的训练模式.

<!-- page 12 of 25 -->

![图 3 (a): OpenCompass 分数随训练步数变化, 红线 VR+PR, 绿线只用 VR; 前 160 步 VR 略高, 约 400 步后 VR+PR 稳定领先, 720 步时读图约 77.1 对 76.5](images/p12-a-opencompass.png)

![图 3 (b): 回复长度随训练步数变化, 前 350 步两条线都在 600 到 1,000 之间, 之后都明显变长并大幅起落, 只用 VR 的在 620 步附近冲到约 1,870](images/p12-b-response-length.png)

![图 3 (c): 熵随训练步数变化, 前 400 步两条线一起从约 0.55 降到约 0.2, 之后只用 VR 的继续降到约 0.15, VR+PR 回升并在 0.3 到 0.46 之间摆动](images/p12-c-entropy.png)

Figure 3: Performance ablation of adding probability-based reward. We report OpenCompass scores, response length, and entropy on different training steps.

图 3: 加入概率奖励的性能消融. 三个子图 (a)(b)(c) 分别报告不同训练步数下的 OpenCompass 分数, 回复长度和熵.

This confirms that probability-based reward provides a meaningful learning signal for the general reasoning data that rules struggle with, effectively complementing the small subset of simple data suitable for rule verification. The effectiveness becomes particularly evident as the number of training steps scales, where the robust reward signals across the full spectrum of multimodal scenarios provide essential training guidance that pure rule-based verification cannot deliver.

这说明概率奖励能为规则难以处理的通用推理数据提供有意义的学习信号, 有效补上了适合规则验证的那一小部分简单数据之外的缺口. 训练步数越往后, 效果越明显: 覆盖全部多模态场景的稳健奖励信号, 提供了纯规则验证给不了的关键训练指导.

> **再看:** 正文说加入概率奖励后 「回复长度和熵的训练模式稳定」, 再看图 3 (b)(c) 是这样吗?
> 不完全是. 图 3 (c) 里只用 VR 的熵在 500 步后一路降到 0.15 左右, VR+PR 的熵反倒在 550 步附近冲到约 0.46, 之后在 0.3 到 0.42 间摆动; 图 3 (b) 两条长度曲线 400 步后都大起大落. 更贴切的读法是 「PR 让熵没有塌下去」, 而不是 「更平稳」. 图 3 (a) 在 80 步和 160 步时还是 VR 略高, 400 步以后 VR+PR 才稳定领先.

| Method | MMMU | AI2D | OCRBench |
| --- | --- | --- | --- |
| External Parser | 49.0 | 74.9 | 576 |
| Unified Learning | 51.4 | 76.5 | 617 |

Table 4: Ablation of unified learning paradigm for document knowledge and text recognition. We report results on knowledge-intensive, document understanding, and text recognition benchmarks.

表 4: 文档知识与文字识别统一学习范式的消融. 报告在知识密集, 文档理解和文字识别三类基准上的结果.

> **看表:** 表 4 的 OCRBench 是 576 和 617, 表 1 是 89.0, 能直接比吗?
> 不能. 表 4 看来是 1,000 分制的原始分, 表 1 是百分制; 表 4 的模型只用 1M 样本跑完三阶段预训练再走同样的 SFT, 不是最终模型, MMMU 51.4 也远低于表 1 的 67.7. 这组消融只说明 「统一学习好过外部解析器」; 1M 里 20% 是知识密集文档, 约 20 万条.

| Method | w/ sub | w/o sub | tokens/frame |
| --- | --- | --- | --- |
| 2D-Resampler | 65.5 | 71.5 | 64.0 |
| 3D-Resampler | 67.3 | 72.5 | 21.3 |

Table 5: Ablation of the 3D-Resampler. We report scores on VideoMME. w/ sub: using subtitles during evaluation; w/o sub: remove subtitles during evaluation

表 5: 3D-Resampler 的消融. 报告 VideoMME 分数. w/ sub: 评测时使用字幕; w/o sub: 评测时去掉字幕.

> **停一下:** 表 5 的 w/ sub 一列是 65.5 和 67.3, w/o sub 一列是 71.5 和 72.5, 加了字幕反而更低?
> 和表 1 的方向相反: 表 1 里 MiniCPM-V 4.5 无字幕 67.9, 有字幕 73.5, 字幕是加分的. 表 5 两列的表头很可能写反了; 按表 1 的方向读, 3D-Resampler 在无字幕上 +1.8, 有字幕上 +1.0.

> **拆开:** 表 5 里 3D-Resampler 每帧 21.3 个 token, 和主模型 「6 帧 64 个 token」 对得上吗?
> 对不上. 64 / 3 约 21.3, 说明这个消融里一个 package 只放 3 帧; 按主模型 6 帧一包, 每帧约 10.7 个 token. 正文说 「只用 2D 基线三分之一的 token」, 对应的正是 3 帧打包. 本页没说消融为什么用 3 帧, 也没说 300 步微调用了多少视频数据.

**Unified learning of document knowledge and text recognition improves both capabilities.** We run an ablation experiment for the proposed unified learning paradigm. Following the three stages pre-training process in § 2.2, we train the model on 1M high-quality samples, 20% of which are knowledge-intensive documents. Then we conduct a comparison against the baseline method after the same SFT pipeline. As shown in Table 4, the unified approach outperforms the baseline on both knowledge-intensive evaluations and text-recognition tasks. These gains indicate that learning directly from document images mitigates the noise introduced by fragile external parsers.

**统一学习文档知识和文字识别, 两种能力都有提升.** 我们为统一学习范式做了消融实验. 按 § 2.2 的三阶段预训练流程, 用 1M 条高质量样本训练模型, 其中 20% 是知识密集的文档. 然后在相同的 SFT 流程之后与基线方法比较. 如表 4 所示, 统一方法在知识密集评测和文字识别任务上都超过基线. 这些提升说明, 直接从文档图像学习能减轻脆弱的外部解析器带来的噪声.

**3D-Resampler enables higher performance with lower token cost.** We ablate the 3D-Resampler to verify its effectiveness. To ensure a fair comparison against the 2D baseline, we fine-tuned the model ckpt after the general SFT stage for 300 steps, isolating the resampler architecture as the only variable. As demonstrated in Table 5, our 3D-Resampler achieves stronger performance, while using only one-third of the visual tokens per frame required by the 2D baseline.

**3D-Resampler 用更少的 token 换来更高的性能.** 我们对 3D-Resampler 做消融以验证其效果. 为了与 2D 基线公平比较, 我们在通用 SFT 阶段之后的 checkpoint 上微调 300 步, 让 resampler 架构成为唯一变量. 如表 5 所示, 3D-Resampler 性能更强, 每帧视觉 token 却只有 2D 基线的三分之一.

## 4 Conclusion

We introduce MiniCPM-V 4.5, an MLLM designed with high efficiency at both training and inference time via architecture, data, and training recipe. With a unified 3D-Resampler, it achieves strong performance on high frame rate and long video understanding with superior encoding efficiency. Furthermore, the unified learning paradigm for document knowledge and text recognition allows the model to directly learn from document images. This approach bypasses fragile parsers and significantly reduces the data engineering complexity. Finally, the hybrid post-training strategy improves both training and inference efficiency while also facilitating generalization between short and long reasoning modes. Overall, MiniCPM-V 4.5 demonstrates a promising path toward addressing the efficiency bottlenecks in MLLM development.

我们推出 MiniCPM-V 4.5, 一个从架构, 数据和训练配方三方面入手, 在训练和推理阶段都追求高效率的 MLLM. 借助统一 3D-Resampler, 它以更高的编码效率在高帧率和长视频理解上取得强劲表现. 文档知识与文字识别的统一学习范式, 让模型能直接从文档图像学习, 绕开脆弱的解析器, 大幅降低数据工程的复杂度. 最后, 混合后训练策略同时提高了训练和推理效率, 并促进了短推理与长推理模式之间的泛化. 总的来说, MiniCPM-V 4.5 为解决 MLLM 开发中的效率瓶颈给出了一条可行的路径.

<!-- page 13 of 25 -->

## References

[1] GLM-V Team, Wenyi Hong, Wenmeng Yu, Xiaotao Gu, Guo Wang, Guobing Gan, Haomiao Tang, Jiale Cheng, Ji Qi, Junhui Ji, Lihang Pan, Shuaiqi Duan, Weihan Wang, Yan Wang, Yean Cheng, Zehai He, Zhe Su, Zhen Yang, Ziyang Pan, Aohan Zeng, Baoxu Wang, Bin Chen, Boyan Shi, Changyu Pang, Chenhui Zhang, Da Yin, Fan Yang, Guoqing Chen, Jiazheng Xu, Jiale Zhu, Jiali Chen, Jing Chen, Jinhao Chen, Jinghao Lin, Jinjiang Wang, Junjie Chen, Leqi Lei, Letian Gong, Leyi Pan, Mingdao Liu, Mingde Xu, Mingzhi Zhang, Qinkai Zheng, Sheng Yang, Shi Zhong, Shiyu Huang, Shuyuan Zhao, Siyan Xue, Shangqin Tu, Shengbiao Meng, Tianshu Zhang, Tianwei Luo, Tianxiang Hao, Tianyu Tong, Wenkai Li, Wei Jia, Xiao Liu, Xiaohan Zhang, Xin Lyu, Xinyue Fan, Xuancheng Huang, Yanling Wang, Yadong Xue, Yanfeng Wang, Yanzi Wang, Yifan An, Yifan Du, Yiming Shi, Yiheng Huang, Yilin Niu, Yuan Wang, Yuanchang Yue, Yuchen Li, Yutao Zhang, Yuting Wang, Yu Wang, Yuxuan Zhang, Zhao Xue, Zhenyu Hou, Zhengxiao Du, Zihan Wang, Peng Zhang, Debing Liu, Bin Xu, Juanzi Li, Minlie Huang, Yuxiao Dong, and Jie Tang. Glm-4.5v and glm-4.1v-thinking: Towards versatile multimodal reasoning with scalable reinforcement learning, 2025.

[2] Kimi Team, Angang Du, Bohong Yin, Bowei Xing, Bowen Qu, Bowen Wang, Cheng Chen, Chenlin Zhang, Chenzhuang Du, Chu Wei, Congcong Wang, Dehao Zhang, Dikang Du, Dongliang Wang, Enming Yuan, Enzhe Lu, Fang Li, Flood Sung, Guangda Wei, Guokun Lai, Han Zhu, Hao Ding, Hao Hu, Hao Yang, Hao Zhang, Haoning Wu, Haotian Yao, Haoyu Lu, Heng Wang, Hongcheng Gao, Huabin Zheng, Jiaming Li, Jianlin Su, Jianzhou Wang, Jiaqi Deng, Jiezhong Qiu, Jin Xie, Jinhong Wang, Jingyuan Liu, Junjie Yan, Kun Ouyang, Liang Chen, Lin Sui, Longhui Yu, Mengfan Dong, Mengnan Dong, Nuo Xu, Pengyu Cheng, Qizheng Gu, Runjie Zhou, Shaowei Liu, Sihan Cao, Tao Yu, Tianhui Song, Tongtong Bai, Wei Song, Weiran He, Weixiao Huang, Weixin Xu, Xiaokun Yuan, Xingcheng Yao, Xingzhe Wu, Xinxing Zu, Xinyu Zhou, Xinyuan Wang, Y. Charles, Yan Zhong, Yang Li, Yangyang Hu, Yanru Chen, Yejie Wang, Yibo Liu, Yibo Miao, Yidao Qin, Yimin Chen, Yiping Bao, Yiqin Wang, Yongsheng Kang, Yuanxin Liu, Yulun Du, Yuxin Wu, Yuzhi Wang, Yuzi Yan, Zaida Zhou, Zhaowei Li, Zhejun Jiang, Zheng Zhang, Zhilin Yang, Zhiqi Huang, Zihao Huang, Zijia Zhao, and Ziwei Chen. Kimi-VL technical report, 2025.

[3] LLM-Core Xiaomi, Zihao Yue, Zhenru Lin, Yifan Song, Weikun Wang, Shuhuai Ren, Shuhao Gu, Shicheng Li, Peidian Li, Liang Zhao, Lei Li, Kainan Bao, Hao Tian, Hailin Zhang, Gang Wang, Dawei Zhu, Cici, Chenhong He, Bowen Ye, Bowen Shen, Zihan Zhang, Zihan Jiang, Zhixian Zheng, Zhichao Song, Zhenbo Luo, Yue Yu, Yudong Wang, Yuanyuan Tian, Yu Tu, Yihan Yan, Yi Huang, Xu Wang, Xinzhe Xu, Xingchen Song, Xing Zhang, Xing Yong, Xin Zhang, Xiangwei Deng, Wenyu Yang, Wenhan Ma, Weiwei Lv, Weiji Zhuang, Wei Liu, Sirui Deng, Shuo Liu, Shimao Chen, Shihua Yu, Shaohui Liu, Shande Wang, Rui Ma, Qiantong Wang, Peng Wang, Nuo Chen, Menghang Zhu, Kangyang Zhou, Kang Zhou, Kai Fang, Jun Shi, Jinhao Dong, Jiebao Xiao, Jiaming Xu, Huaqiu Liu, Hongshen Xu, Heng Qu, Haochen Zhao, Hanglong Lv, Guoan Wang, Duo Zhang, Dong Zhang, Di Zhang, Chong Ma, Chang Liu, Can Cai, and Bingquan Xia. Mimo-vl technical report, 2025.

[4] OpenAI. Openai platform chatgpt-4o, 2025. Accessed: 2025-08-03.

[5] Jinze Bai, Shuai Bai, Shusheng Yang, Shijie Wang, Sinan Tan, Peng Wang, Junyang Lin, Chang Zhou, and Jingren Zhou. Qwen-vl: A versatile vision-language model for understanding, localization, text reading, and beyond, 2023.

[6] Yuan Yao, Tianyu Yu, Ao Zhang, Chongyi Wang, Junbo Cui, Hongji Zhu, Tianchi Cai, Haoyu Li, Weilin Zhao, Zhihui He, et al. Minicpm-v: A gpt-4v level mllm on your phone. ArXiv preprint, abs/2408.01800, 2024.

[7] Shuai Bai, Keqin Chen, Xuejing Liu, Jialin Wang, Wenbin Ge, Sibo Song, Kai Dang, Peng Wang, Shijie Wang, Jun Tang, Humen Zhong, Yuanzhi Zhu, Mingkun Yang, Zhaohai Li, Jianqiang Wan, Pengfei Wang, Wei Ding, Zheren Fu, Yiheng Xu, Jiabo Ye, Xi Zhang, Tianbao Xie, Zesen Cheng, Hang Zhang, Zhibo Yang, Haiyang Xu, and Junyang Lin. Qwen2.5-vl technical report, 2025.

[8] Shiyin Lu, Yang Li, Yu Xia, Yuwei Hu, Shanshan Zhao, Yanqing Ma, Zhichao Wei, Yinglun Li, Lunhao Duan, Jianshan Zhao, Yuxuan Han, Haijun Li, Wanying Chen, Junke Tang, Chengkun Hou, Zhixing Du, Tianli Zhou, Wenjie Zhang, Huping Ding, Jiahe Li, Wen Li, Gui Hu, Yiliang Gu, Siran Yang, Jiamang Wang, Hailong Sun, Yibo Wang, Hui Sun, Jinlong Huang, Yuping He, Shengze Shi, Weihong Zhang, Guodong Zheng, Junpeng Jiang, Sensen Gao, Yi-Feng Wu, Sijia Chen, Yuhui Chen, Qing-Guo Chen, Zhao Xu, Weihua Luo, and Kaifu Zhang. Ovis2.5 technical report. arXiv:2508.11737, 2025.

<!-- page 14 of 25 -->

[9] Jinguo Zhu, Weiyun Wang, Zhe Chen, Zhaoyang Liu, Shenglong Ye, Lixin Gu, Hao Tian, Yuchen Duan, Weijie Su, Jie Shao, et al. Internvl3: Exploring advanced training and test-time recipes for open-source multimodal models. ArXiv preprint, abs/2504.10479, 2025.

[10] Bo Zhang, Shuo Li, Runhe Tian, Yang Yang, Jixin Tang, Jinhao Zhou, and Lin Ma. Flash-vl 2b: Optimizing vision-language model performance for ultra-low latency and high throughput. arXiv preprint arXiv:2505.09498, 2025.

[11] Google DeepMind. Gemini 2.0: Our latest, most capable ai model yet, 2024. First Gemini 2.0 Flash announced December 11, 2024; multimodal support for text, image, audio, native tool use.

[12] DeepSeek-AI, Daya Guo, Dejian Yang, Haowei Zhang, Junxiao Song, Ruoyu Zhang, Runxin Xu, Qihao Zhu, Shirong Ma, Peiyi Wang, Xiao Bi, Xiaokang Zhang, Xingkai Yu, Yu Wu, Z. F. Wu, Zhibin Gou, Zhihong Shao, Zhuoshu Li, Ziyi Gao, Aixin Liu, Bing Xue, Bingxuan Wang, Bochao Wu, Bei Feng, Chengda Lu, Chenggang Zhao, Chengqi Deng, Chenyu Zhang, Chong Ruan, Damai Dai, Deli Chen, Dongjie Ji, Erhang Li, Fangyun Lin, Fucong Dai, Fuli Luo, Guangbo Hao, Guanting Chen, Guowei Li, H. Zhang, Han Bao, Hanwei Xu, Haocheng Wang, Honghui Ding, Huajian Xin, Huazuo Gao, Hui Qu, Hui Li, Jianzhong Guo, Jiashi Li, Jiawei Wang, Jingchang Chen, Jingyang Yuan, Junjie Qiu, Junlong Li, J. L. Cai, Jiaqi Ni, Jian Liang, Jin Chen, Kai Dong, Kai Hu, Kaige Gao, Kang Guan, Kexin Huang, Kuai Yu, Lean Wang, Lecong Zhang, Liang Zhao, Litong Wang, Liyue Zhang, Lei Xu, Leyi Xia, Mingchuan Zhang, Minghua Zhang, Minghui Tang, Meng Li, Miaojun Wang, Mingming Li, Ning Tian, Panpan Huang, Peng Zhang, Qiancheng Wang, Qinyu Chen, Qiushi Du, Ruiqi Ge, Ruisong Zhang, Ruizhe Pan, Runji Wang, R. J. Chen, R. L. Jin, Ruyi Chen, Shanghao Lu, Shangyan Zhou, Shanhuang Chen, Shengfeng Ye, Shiyu Wang, Shuiping Yu, Shunfeng Zhou, Shuting Pan, S. S. Li, Shuang Zhou, Shaoqing Wu, Shengfeng Ye, Tao Yun, Tian Pei, Tianyu Sun, T. Wang, Wangding Zeng, Wanjia Zhao, Wen Liu, Wenfeng Liang, Wenjun Gao, Wenqin Yu, Wentao Zhang, W. L. Xiao, Wei An, Xiaodong Liu, Xiaohan Wang, Xiaokang Chen, Xiaotao Nie, Xin Cheng, Xin Liu, Xin Xie, Xingchao Liu, Xinyu Yang, Xinyuan Li, Xuecheng Su, Xuheng Lin, X. Q. Li, Xiangyue Jin, Xiaojin Shen, Xiaosha Chen, Xiaowen Sun, Xiaoxiang Wang, Xinnan Song, Xinyi Zhou, Xianzu Wang, Xinxia Shan, Y. K. Li, Y. Q. Wang, Y. X. Wei, Yang Zhang, Yanhong Xu, Yao Li, Yao Zhao, Yaofeng Sun, Yaohui Wang, Yi Yu, Yichao Zhang, Yifan Shi, Yiliang Xiong, Ying He, Yishi Piao, Yisong Wang, Yixuan Tan, Yiyang Ma, Yiyuan Liu, Yongqiang Guo, Yuan Ou, Yuduan Wang, Yue Gong, Yuheng Zou, Yujia He, Yunfan Xiong, Yuxiang Luo, Yuxiang You, Yuxuan Liu, Yuyang Zhou, Y. X. Zhu, Yanhong Xu, Yanping Huang, Yaohui Li, Yi Zheng, Yuchen Zhu, Yunxian Ma, Ying Tang, Yukun Zha, Yuting Yan, Z. Z. Ren, Zehui Ren, Zhangli Sha, Zhe Fu, Zhean Xu, Zhenda Xie, Zhengyan Zhang, Zhewen Hao, Zhicheng Ma, Zhigang Yan, Zhiyu Wu, Zihui Gu, Zijia Zhu, Zijun Liu, Zilin Li, Ziwei Xie, Ziyang Song, Zizheng Pan, Zhen Huang, Zhipeng Xu, Zhongyu Zhang, and Zhen Zhang. Deepseek-r1: Incentivizing reasoning capability in llms via reinforcement learning, 2025.

[13] Zonghao Guo, Ruyi Xu, Yuan Yao, Junbo Cui, Zanlin Ni, Chunjiang Ge, Tat-Seng Chua, Zhiyuan Liu, and Gao Huang. Llava-uhd: an lmm perceiving any aspect ratio and highresolution images. In European Conference on Computer Vision, pages 390–406. Springer, 2024.

[14] Chaoyou Fu, Yuhan Dai, Yongdong Luo, Lei Li, Shuhuai Ren, Renrui Zhang, Zihan Wang, Chenyu Zhou, Yunhang Shen, Mengdan Zhang, Peixian Chen, Yanwei Li, Shaohui Lin, Sirui Zhao, Ke Li, Tong Xu, Xiawu Zheng, Enhong Chen, Caifeng Shan, Ran He, and Xing Sun. Video-mme: The first-ever comprehensive evaluation benchmark of multi-modal llms in video analysis, 2024.

<!-- page 15 of 25 -->

[15] Shengding Hu, Yuge Tu, Xu Han, Chaoqun He, Ganqu Cui, Xiang Long, Zhi Zheng, Yewei Fang, Yuxiang Huang, Weilin Zhao, et al. Minicpm: Unveiling the potential of small language models with scalable training strategies. ArXiv preprint, abs/2404.06395, 2024.

[16] Christoph Schuhmann, Romain Beaumont, Richard Vencu, Cade Gordon, Ross Wightman, Mehdi Cherti, Theo Coombes, Aarush Katta, Clayton Mullis, Mitchell Wortsman, Patrick Schramowski, Srivatsa Kundurthy, Katherine Crowson, Ludwig Schmidt, Robert Kaczmarczyk, and Jenia Jitsev. LAION-5B: an open large-scale dataset for training next generation image-text models. In Sanmi Koyejo, S. Mohamed, A. Agarwal, Danielle Belgrave, K. Cho, and A. Oh, editors, Advances in Neural Information Processing Systems 35: Annual Conference on Neural Information Processing Systems 2022, NeurIPS 2022, New Orleans, LA, USA, November 28 - December 9, 2022, 2022.

[17] Minwoo Byeon, Beomhee Park, Haecheon Kim, Sungjun Lee, Woonhyuk Baek, and Saehoon Kim. Coyo-700m: Image-text pair dataset. [https://github.com/kakaobrain/coyo-dataset](https://github.com/kakaobrain/coyo-dataset), 2022.

[18] Alec Radford, Jong Wook Kim, Chris Hallacy, Aditya Ramesh, Gabriel Goh, Sandhini Agarwal, Girish Sastry, Amanda Askell, Pamela Mishkin, Jack Clark, Gretchen Krueger, and Ilya Sutskever. Learning transferable visual models from natural language supervision. In Marina Meila and Tong Zhang, editors, Proc. of ICML, volume 139 of Proceedings of Machine Learning Research, pages 8748–8763. PMLR, 2021.

[19] Qiying Yu, Quan Sun, Xiaosong Zhang, Yufeng Cui, Fan Zhang, Yue Cao, Xinlong Wang, and Jingjing Liu. Capsfusion: Rethinking image-text data at scale. In IEEE/CVF Conference on Computer Vision and Pattern Recognition, CVPR 2024, Seattle, WA, USA, June 16-22, 2024, pages 14022–14032. IEEE, 2024.

[20] Qingyun Li, Zhe Chen, Weiyun Wang, Wenhai Wang, Shenglong Ye, Zhenjiang Jin, Guanzhou Chen, Yinan He, Zhangwei Gao, Erfei Cui, et al. Omnicorpus: A unified multimodal corpus of 10 billion-level images interleaved with text. ArXiv preprint, abs/2406.08418, 2024.

[21] Anas Awadalla, Le Xue, Oscar Lo, Manli Shu, Hannah Lee, Etash Guha, Sheng Shen, Mohamed Awadalla, Silvio Savarese, Caiming Xiong, Ran Xu, Yejin Choi, and Ludwig Schmidt. MINT-1T: scaling open-source multimodal data by 10x: A multimodal dataset with one trillion tokens. In Amir Globersons, Lester Mackey, Danielle Belgrave, Angela Fan, Ulrich Paquet, Jakub M. Tomczak, and Cheng Zhang, editors, Advances in Neural Information Processing Systems 38: Annual Conference on Neural Information Processing Systems 2024, NeurIPS 2024, Vancouver, BC, Canada, December 10 - 15, 2024, 2024.

[22] Ankush Gupta, Andrea Vedaldi, and Andrew Zisserman. Synthetic data for text localisation in natural images. In 2016 IEEE Conference on Computer Vision and Pattern Recognition, CVPR 2016, Las Vegas, NV, USA, June 27-30, 2016, pages 2315–2324. IEEE Computer Society, 2016.

[23] Max Bain, Arsha Nagrani, Gul Varol, and Andrew Zisserman. Frozen in time: A joint video ¨ and image encoder for end-to-end retrieval. In 2021 IEEE/CVF International Conference on Computer Vision, ICCV 2021, Montreal, QC, Canada, October 10-17, 2021, pages 1708–1718. IEEE, 2021.

[24] Dongjie Yang, Suyuan Huang, Chengqiang Lu, Xiaodong Han, Haoxin Zhang, Yan Gao, Yao Hu, and Hai Zhao. Vript: A video is worth thousands of words. In Amir Globersons, Lester Mackey, Danielle Belgrave, Angela Fan, Ulrich Paquet, Jakub M. Tomczak, and Cheng Zhang, editors, Advances in Neural Information Processing Systems 38: Annual Conference on Neural Information Processing Systems 2024, NeurIPS 2024, Vancouver, BC, Canada, December 10 - 15, 2024, 2024.

[25] Kepan Nan, Rui Xie, Penghao Zhou, Tiehan Fan, Zhenheng Yang, Zhijie Chen, Xiang Li, Jian Yang, and Ying Tai. Openvid-1m: A large-scale high-quality dataset for text-to-video generation. ArXiv preprint, abs/2407.02371, 2024.

[26] Wikipedia contributors. Wikipedia, the free encyclopedia, 2025. Accessed: 2025-09-14; CC BY-SA 4.0.

<!-- page 16 of 25 -->

[27] Etash Guha, Ryan Marten, Sedrick Keh, Negin Raoof, Georgios Smyrnis, Hritik Bansal, Marianna Nezhurina, Jean Mercat, Trung Vu, Zayne Sprague, et al. Openthoughts: Data recipes for reasoning models. ArXiv preprint, abs/2506.04178, 2025.

[28] Tianyu Yu, Haoye Zhang, Qiming Li, Qixin Xu, Yuan Yao, Da Chen, Xiaoman Lu, Ganqu Cui, Yunkai Dang, Taiwen He, Xiaocheng Feng, Jun Song, Bo Zheng, Zhiyuan Liu, Tat-Seng Chua, and Maosong Sun. Rlaif-v: Open-source ai feedback leads to super gpt-4v trustworthiness, 2024.

[29] Tianyu Yu, Bo Ji, Shouli Wang, Shu Yao, Zefan Wang, Ganqu Cui, Lifan Yuan, Ning Ding, Yuan Yao, Zhiyuan Liu, Maosong Sun, and Tat-Seng Chua. Rlpr: Extrapolating rlvr to general domains without verifiers, 2025.

[30] Jiahui Gao, Renjie Pi, Jipeng Zhang, Jiacheng Ye, Wanjun Zhong, Yufei Wang, Lanqing Hong, Jianhua Han, Hang Xu, Zhenguo Li, and Lingpeng Kong. G-llava: Solving geometric problem with multi-modal large language model, 2023.

[31] Linger Deng, Yuliang Liu, Bohan Li, Dongliang Luo, Liang Wu, Chengquan Zhang, Pengyuan Lyu, Ziyang Zhang, Gang Zhang, Errui Ding, et al. R-cot: Reverse chain-of-thought problem generation for geometric reasoning in large multimodal models. ArXiv preprint, abs/2410.17885, 2024.

[32] Adam Dahlgren Lindstrom and Savitha Sam Abraham. Clevr-math: A dataset for composi- ¨ tional language, visual and mathematical reasoning, 2022.

[33] Vivek Gupta, Maitrey Mehta, Pegah Nokhiz, and Vivek Srikumar. INFOTABS: Inference on tables as semi-structured data. In Dan Jurafsky, Joyce Chai, Natalie Schluter, and Joel Tetreault, editors, Proc. of ACL, pages 2309–2324, Online, 2020. Association for Computational Linguistics.

[34] Pan Lu, Liang Qiu, Kai-Wei Chang, Ying Nian Wu, Song-Chun Zhu, Tanmay Rajpurohit, Peter Clark, and Ashwin Kalyan. Dynamic prompt learning via policy gradient for semi-structured mathematical reasoning. In Proc. of ICLR. OpenReview.net, 2023.

[35] Panupong Pasupat and Percy Liang. Compositional semantic parsing on semi-structured tables. In Chengqing Zong and Michael Strube, editors, Proc. of ACL, pages 1470–1480, Beijing, China, 2015. Association for Computational Linguistics.

[36] Wenhu Chen, Hongmin Wang, Jianshu Chen, Yunkai Zhang, Hong Wang, Shiyang Li, Xiyou Zhou, and William Yang Wang. Tabfact: A large-scale dataset for table-based fact verification. In Proc. of ICLR. OpenReview.net, 2020.

[37] Fengbin Zhu, Wenqiang Lei, Youcheng Huang, Chao Wang, Shuo Zhang, Jiancheng Lv, Fuli Feng, and Tat-Seng Chua. TAT-QA: A question answering benchmark on a hybrid of tabular and textual content in finance. In Chengqing Zong, Fei Xia, Wenjie Li, and Roberto Navigli, editors, Proc. of ACL, pages 3277–3287, Online, 2021. Association for Computational Linguistics.

[38] Samira Ebrahimi Kahou, Adam Atkinson, Vincent Michalski, Akos K ´ ad´ ar, Adam Trischler, ´ and Yoshua Bengio. FigureQA: An annotated figure dataset for visual reasoning, 2018.

[39] Lei Li, Yuqi Wang, Runxin Xu, Peiyi Wang, Xiachong Feng, Lingpeng Kong, and Qi Liu. Multimodal ArXiv: A dataset for improving scientific comprehension of large vision-language models. In Lun-Wei Ku, Andre Martins, and Vivek Srikumar, editors, Proc. of ACL, pages 14369–14387, Bangkok, Thailand, 2024. Association for Computational Linguistics.

[40] Kushal Kafle, Brian L. Price, Scott Cohen, and Christopher Kanan. DVQA: understanding data visualizations via question answering. In 2018 IEEE Conference on Computer Vision and Pattern Recognition, CVPR 2018, Salt Lake City, UT, USA, June 18-22, 2018, pages 5648–5656. IEEE Computer Society, 2018.

[41] Yiming Jia, Jiachen Li, Xiang Yue, Bo Li, Ping Nie, Kai Zou, and Wenhu Chen. Visualwebinstruct: Scaling up multimodal instruction data through web search. ArXiv preprint, abs/2503.10582, 2025.

<!-- page 17 of 25 -->

[42] Akhiad Bercovich, Itay Levy, Izik Golan, Mohammad Dabbah, Ran El-Yaniv, Omri Puny, Ido Galil, Zach Moshe, Tomer Ronen, Najeeb Nabwani, Ido Shahaf, Oren Tropp, Ehud Karpas, Ran Zilberstein, Jiaqi Zeng, Soumye Singhal, Alexander Bukharin, Yian Zhang, Tugrul Konuk, Gerald Shen, Ameya Sunil Mahabaleshwarkar, Bilal Kartal, Yoshi Suhara, Olivier Delalleau, Zijia Chen, Zhilin Wang, David Mosallanezhad, Adi Renduchintala, Haifeng Qian, Dima Rekesh, Fei Jia, Somshubra Majumdar, Vahid Noroozi, Wasi Uddin Ahmad, Sean Narenthiran, Aleksander Ficek, Mehrzad Samadi, Jocelyn Huang, Siddhartha Jain, Igor Gitman, Ivan Moshkov, Wei Du, Shubham Toshniwal, George Armstrong, Branislav Kisacanin, Matvei Novikov, Daria Gitman, Evelina Bakhturina, Jane Polak Scowcroft, John Kamalu, Dan Su, Kezhi Kong, Markus Kliegl, Rabeeh Karimi, Ying Lin, Sanjeev Satheesh, Jupinder Parmar, Pritam Gundecha, Brandon Norick, Joseph Jennings, Shrimai Prabhumoye, Syeda Nahida Akter, Mostofa Patwary, Abhinav Khattar, Deepak Narayanan, Roger Waleffe, Jimmy Zhang, Bor-Yiing Su, Guyue Huang, Terry Kong, Parth Chadha, Sahil Jain, Christine Harvey, Elad Segal, Jining Huang, Sergey Kashirsky, Robert McQueen, Izzy Putterman, George Lam, Arun Venkatesan, Sherry Wu, Vinh Nguyen, Manoj Kilaru, Andrew Wang, Anna Warno, Abhilash Somasamudramath, Sandip Bhaskar, Maka Dong, Nave Assaf, Shahar Mor, Omer Ullman Argov, Scot Junkin, Oleksandr Romanenko, Pedro Larroy, Monika Katariya, Marco Rovinelli, Viji Balas, Nicholas Edelman, Anahita Bhiwandiwalla, Muthu Subramaniam, Smita Ithape, Karthik Ramamoorthy, Yuting Wu, Suguna Varshini Velury, Omri Almog, Joyjit Daw, Denys Fridman, Erick Galinkin, Michael Evans, Katherine Luna, Leon Derczynski, Nikki Pope, Eileen Long, Seth Schneider, Guillermo Siman, Tomasz Grzegorzek, Pablo Ribalta, Monika Katariya, Joey Conway, Trisha Saar, Ann Guan, Krzysztof Pawelec, Shyamala Prayaga, Oleksii Kuchaiev, Boris Ginsburg, Oluwatobi Olabiyi, Kari Briski, Jonathan Cohen, Bryan Catanzaro, Jonah Alben, Yonatan Geifman, Eric Chung, and Chris Alexiuk. Llama-nemotron: Efficient reasoning models, 2025.

[43] Junjie Ye, Caishuang Huang, Zhuohan Chen, Wenjie Fu, Chenyuan Yang, Leyi Yang, Yilong Wu, Peng Wang, Meng Zhou, Xiaolong Yang, Tao Gui, Qi Zhang, Zhongchao Shi, Jianping Fan, and Xuanjing Huang. A multi-dimensional constraint framework for evaluating and improving instruction following in large language models, 2025.

[44] Zhihong Shao, Peiyi Wang, Qihao Zhu, Runxin Xu, Junxiao Song, Xiao Bi, Haowei Zhang, Mingchuan Zhang, Y. K. Li, Y. Wu, and Daya Guo. Deepseekmath: Pushing the limits of mathematical reasoning in open language models, 2024.

[45] Xiaokun Wang, Peiyu Wang, Jiangbo Pei, Wei Shen, Yi Peng, Yunzhuo Hao, Weijie Qiu, Ai Jian, Tianyidan Xie, Xuchen Song, Yang Liu, and Yahui Zhou. Skywork-vl reward: An effective reward model for multimodal understanding and reasoning, 2025.

[46] Rafael Rafailov, Archit Sharma, Eric Mitchell, Christopher D. Manning, Stefano Ermon, and Chelsea Finn. Direct preference optimization: Your language model is secretly a reward model. In Alice Oh, Tristan Naumann, Amir Globerson, Kate Saenko, Moritz Hardt, and Sergey Levine, editors, Advances in Neural Information Processing Systems 36: Annual Conference on Neural Information Processing Systems 2023, NeurIPS 2023, New Orleans, LA, USA, December 10 - 16, 2023, 2023.

[47] Xiang Yue, Yuansheng Ni, Tianyu Zheng, Kai Zhang, Ruoqi Liu, Ge Zhang, Samuel Stevens, Dongfu Jiang, Weiming Ren, Yuxuan Sun, Cong Wei, Botao Yu, Ruibin Yuan, Renliang Sun, Ming Yin, Boyuan Zheng, Zhenzhu Yang, Yibo Liu, Wenhao Huang, Huan Sun, Yu Su, and Wenhu Chen. MMMU: A massive multi-discipline multimodal understanding and reasoning benchmark for expert AGI. In IEEE/CVF Conference on Computer Vision and Pattern Recognition, CVPR 2024, Seattle, WA, USA, June 16-22, 2024, pages 9556–9567. IEEE, 2024.

[48] Pan Lu, Hritik Bansal, Tony Xia, Jiacheng Liu, Chunyuan Li, Hannaneh Hajishirzi, Hao Cheng, Kai-Wei Chang, Michel Galley, and Jianfeng Gao. Mathvista: Evaluating mathematical reasoning of foundation models in visual contexts. In Proc. of ICLR. OpenReview.net, 2024.

[49] Aniruddha Kembhavi, Michael Salvato, Eric Kolve, Minjoon Seo, Hannaneh Hajishirzi, and Ali Farhadi. A diagram is worth a dozen images. In European Conference on Computer Vision (ECCV), 2016.

<!-- page 18 of 25 -->

[50] Renrui Zhang, Dongzhi Jiang, Yichi Zhang, Haokun Lin, Ziyu Guo, Pengshuo Qiu, Aojun Zhou, Pan Lu, Kai-Wei Chang, Yu Qiao, et al. Mathverse: Does your multi-modal llm truly see the diagrams in visual math problems? In European Conference on Computer Vision, pages 169–186. Springer, 2024.

[51] Yijia Xiao, Edward Sun, Tianyu Liu, and Wei Wang. Logicvista: Multimodal llm logical reasoning benchmark in visual contexts. ArXiv preprint, abs/2407.04973, 2024.

[52] Yunzhuo Hao, Jiawei Gu, Huichen Will Wang, Linjie Li, Zhengyuan Yang, Lijuan Wang, and Yu Cheng. Can mllms reason in multimodality? emma: An enhanced multimodal reasoning benchmark. ArXiv preprint, abs/2501.05444, 2025.

[53] Yuliang Liu, Zhang Li, Hongliang Li, Wenwen Yu, Mingxin Huang, Dezhi Peng, Mingyu Liu, Mingrui Chen, Chunyuan Li, Lianwen Jin, and Xiang Bai. OCRBench: On the hidden mystery of OCR in large multimodal models. Science China Information Sciences, 2024.

[54] Ahmed Masry, Xuan Long Do, Jia Qing Tan, Shafiq Joty, and Enamul Hoque. ChartQA: A benchmark for question answering about charts with visual and logical reasoning. In Smaranda Muresan, Preslav Nakov, and Aline Villavicencio, editors, Findings of the Association for Computational Linguistics: ACL 2022, pages 2263–2279, Dublin, Ireland, 2022. Association for Computational Linguistics.

[55] Amanpreet Singh, Vivek Natarajan, Meet Shah, Yu Jiang, Xinlei Chen, Dhruv Batra, Devi Parikh, and Marcus Rohrbach. TextVQA: Towards VQA requiring reasoning about text. In Proceedings of the IEEE/CVF Conference on Computer Vision and Pattern Recognition, 2019.

[56] Minesh Mathew, Dimosthenis Karatzas, R. Manmatha, and C. V. Jawahar. DocVQA: A dataset for VQA on document images. In Proceedings of the IEEE/CVF Winter Conference on Applications of Computer Vision, 2021.

[57] Linke Ouyang, Yuan Qu, Hongbin Zhou, Jiawei Zhu, Rui Zhang, Qunshu Lin, Bin Wang, Zhiyuan Zhao, Man Jiang, Xiaomeng Zhao, Jin Shi, Fan Wu, Pei Chu, Minghao Liu, Zhenxiang Li, Chao Xu, Bo Zhang, Botian Shi, Zhongying Tu, and Conghui He. Omnidocbench: Benchmarking diverse pdf document parsing with comprehensive annotations, 2024.

[58] Tianrui Guan, Fuxiao Liu, Xiyang Wu, Ruiqi Xian, Zongxia Li, Xiaoyu Liu, Xijun Wang, Lichang Chen, Furong Huang, Yaser Yacoob, Dinesh Manocha, and Tianyi Zhou. Hallusionbench: An advanced diagnostic suite for entangled language hallucination and visual illusion in large vision-language models. In IEEE/CVF Conference on Computer Vision and Pattern Recognition, CVPR 2024, Seattle, WA, USA, June 16-22, 2024, pages 14375–14385. IEEE, 2024.

[59] Anna Rohrbach, Lisa Anne Hendricks, Kaylee Burns, Trevor Darrell, and Kate Saenko. Object hallucination in image captioning. In Ellen Riloff, David Chiang, Julia Hockenmaier, and Jun’ichi Tsujii, editors, Proc. of EMNLP, pages 4035–4045, Brussels, Belgium, 2018. Association for Computational Linguistics.

[60] Zhiqing Sun, Sheng Shen, Shengcao Cao, Haotian Liu, Chunyuan Li, Yikang Shen, Chuang Gan, Liang-Yan Gui, Yu-Xiong Wang, Yiming Yang, et al. Aligning large multimodal models with factually augmented rlhf. ArXiv preprint, abs/2309.14525, 2023.

[61] Dongfu Jiang, Xuan He, Huaye Zeng, Cong Wei, Max Ku, Qian Liu, and Wenhu Chen. Mantis: Interleaved multi-image instruction tuning. ArXiv preprint, abs/2405.01483, 2024.

[62] Kaining Ying, Fanqing Meng, Jin Wang, Zhiqian Li, Han Lin, Yue Yang, Hao Zhang, Wenbo Zhang, Yuqi Lin, Shuo Liu, Jiayi Lei, Quanfeng Lu, Runjian Chen, Peng Xu, Renrui Zhang, Haozhe Zhang, Peng Gao, Yali Wang, Yu Qiao, Ping Luo, Kaipeng Zhang, and Wenqi Shao. Mmt-bench: A comprehensive multimodal benchmark for evaluating large vision-language models towards multitask AGI. In Forty-first International Conference on Machine Learning, ICML 2024, Vienna, Austria, July 21-27, 2024. OpenReview.net, 2024.

[63] xAI. Grok-1.5 vision preview. [https://x.ai/news/grok-1.5v](https://x.ai/news/grok-1.5v), 2024. Connecting the digital and physical worlds with our first multimodal model.

<!-- page 19 of 25 -->

[64] Shengyuan Ding, Shenxi Wu, Xiangyu Zhao, Yuhang Zang, Haodong Duan, Xiaoyi Dong, Pan Zhang, Yuhang Cao, Dahua Lin, and Jiaqi Wang. Mm-ifengine: Towards multimodal instruction following. ArXiv preprint, abs/2504.07957, 2025.

[65] Chaoyou Fu, Yuhan Dai, Yondong Luo, Lei Li, Shuhuai Ren, Renrui Zhang, Zihan Wang, Chenyu Zhou, Yunhang Shen, Mengdan Zhang, et al. Video-MME: The first-ever comprehensive evaluation benchmark of multi-modal LLMs in video analysis. 2025.

[66] Weihan Wang, Zehai He, Wenyi Hong, Yean Cheng, Xiaohan Zhang, Ji Qi, Shiyu Huang, Bin Xu, Yuxiao Dong, Ming Ding, and Jie Tang. LVBench: An extreme long video understanding benchmark. ArXiv preprint, abs/2406.08035, 2024.

[67] Junjie Zhou, Yan Shu, Bo Zhao, Boya Wu, Zhengyang Liang, Shitao Xiao, Minghao Qin, Xi Yang, Yongping Xiong, Bo Zhang, et al. Mlvu: Benchmarking multi-task long video understanding. In Proceedings of the Computer Vision and Pattern Recognition Conference, pages 13691–13701, 2025.

[68] Haoning Wu, Dongxu Li, Bei Chen, and Junnan Li. Longvideobench: A benchmark for long-context interleaved video-language understanding. In Amir Globersons, Lester Mackey, Danielle Belgrave, Angela Fan, Ulrich Paquet, Jakub M. Tomczak, and Cheng Zhang, editors, Advances in Neural Information Processing Systems 38: Annual Conference on Neural Information Processing Systems 2024, NeurIPS 2024, Vancouver, BC, Canada, December 10 - 15, 2024, 2024.

[69] Wenyi Hong\*, Yean Cheng\*, Zhuoyi Yang\*, Weihan Wang, Lefan Wang, Xiaotao Gu, Shiyu Huang, Yuxiao Dong, and Jie Tang. Motionbench: Benchmarking and improving fine-grained video motion understanding for vision language models, 2024.

[70] Chongjun Tu, Lin Zhang, Pengtao Chen, Peng Ye, Xianfang Zeng, Wei Cheng, Gang Yu, and Tao Chen. Favor-bench: A comprehensive benchmark for fine-grained video motion understanding, 2025.

[71] OpenCompass Contributors. Opencompass: A universal evaluation platform for foundation models. [https://github.com/open-compass/opencompass](https://github.com/open-compass/opencompass), 2023.

[72] Weihao Yu, Zhengyuan Yang, Linjie Li, Jianfeng Wang, Kevin Lin, Zicheng Liu, Xinchao Wang, and Lijuan Wang. Mm-vet: Evaluating large multimodal models for integrated capabilities. In Forty-first International Conference on Machine Learning, ICML 2024, Vienna, Austria, July 21-27, 2024. OpenReview.net, 2024.

[73] Lin Chen, Jinsong Li, Xiaoyi Dong, Pan Zhang, Yuhang Zang, Zehui Chen, Haodong Duan, Jiaqi Wang, Yu Qiao, Dahua Lin, and Feng Zhao. Are we on the right way for evaluating large vision-language models? In Amir Globersons, Lester Mackey, Danielle Belgrave, Angela Fan, Ulrich Paquet, Jakub M. Tomczak, and Cheng Zhang, editors, Advances in Neural Information Processing Systems 38: Annual Conference on Neural Information Processing Systems 2024, NeurIPS 2024, Vancouver, BC, Canada, December 10 - 15, 2024, 2024.

[74] Chaoyou Fu, Peixian Chen, Yunhang Shen, Yulei Qin, Mengdan Zhang, Xu Lin, Jinrui Yang, Xiawu Zheng, Ke Li, Xing Sun, Yunsheng Wu, and Rongrong Ji. Mme: A comprehensive evaluation benchmark for multimodal large language models, 2023.

[75] Yuan Liu, Haodong Duan, Yuanhan Zhang, Bo Li, Songyang Zhang, Wangbo Zhao, Yike Yuan, Jiaqi Wang, Conghui He, Ziwei Liu, et al. Mmbench: Is your multi-modal model an all-around player? In European conference on computer vision, pages 216–233. Springer, 2024.

[76] Zhihong Shao, Peiyi Wang, Qihao Zhu, Runxin Xu, Junxiao Song, Xiao Bi, Haowei Zhang, Mingchuan Zhang, YK Li, Y Wu, et al. Deepseekmath: Pushing the limits of mathematical reasoning in open language models. ArXiv preprint, abs/2402.03300, 2024.

<!-- page 20 of 25 -->

## A Implementation Details

Pre-training follows a WSD schedule [15] with a fixed learning rate of $5 \times 10^{-5}$ in the stable phase, decaying to $1 \times 10^{-5}$. SFT applies cosine decay from $1 \times 10^{-5}$ to $1 \times 10^{-6}$. The Long-CoT and 3D-Resampler stage continues from the SFT checkpoint, warming up to $5 \times 10^{-6}$ and decaying to $1 \times 10^{-6}$.

预训练采用 WSD 调度 [15], 稳定阶段学习率固定为 $5 \times 10^{-5}$, 之后衰减到 $1 \times 10^{-5}$. SFT 用余弦衰减, 从 $1 \times 10^{-5}$ 降到 $1 \times 10^{-6}$. Long-CoT 与 3D-Resampler 阶段从 SFT 的 checkpoint 接着训练, 预热到 $5 \times 10^{-6}$, 再衰减到 $1 \times 10^{-6}$.

For the RL stage, we adopt GRPO [76] without entropy loss or KL penalty. Each batch consists of 128 prompts with 8 responses each, and a max response length of 8192 tokens to support detailed reasoning. Rollouts use a temperature of 1.0, with 50% of prompts assigned to long reasoning mode. We use a fixed learning rate of $1 \times 10^{-6}$ throughout RL. In the RLAIF-V [28] stage, we use a global batch size of 256, learning rate of $1 \times 10^{-6}$, and $\beta = 0.1$ for 400 steps.

RL 阶段采用 GRPO [76], 不用熵损失, 也不加 KL 惩罚. 每个 batch 有 128 个 prompt, 每个 prompt 8 条回复, 最大回复长度 8192 token, 以支持详细推理. rollout 温度为 1.0, 50% 的 prompt 分给长推理模式. RL 全程用固定学习率 $1 \times 10^{-6}$. RLAIF-V [28] 阶段的全局 batch 大小为 256, 学习率 $1 \times 10^{-6}$, $\beta = 0.1$, 训练 400 步.

> **对一下:** 每批 128 个 prompt, 每个 8 条回复, 50% 走长推理, 和引言的 33.3% 对一下.
> 每批 1,024 条回复, 其中约 64 个 prompt, 512 条回复走长推理. 附录的 50% 与第 11 页 「一半的长推理样本」 一致, 与第 2 页的 33.3% 不一致. RL 的总步数正文没写, 图 3 横轴只画到约 720 步, 表 3 给的 1.6B, 4.4B, 3.1B 是消融设置的训练 token, 不一定等于最终模型的 RL 规模.

> **确认:** GRPO 在正文引 [44], 附录引 [76], 是两篇文献吗?
> 是同一篇. [44] 和 [76] 都是 DeepSeekMath 那篇, 作者顺序相同, [76] 多了 arXiv 号 abs/2402.03300. 正文第 8 页和附录都说去掉了 KL 和熵损失, 两处说法一致.

## B Qualitative Cases

### B.1 Comprehensive Instruction Following

![图 4: 英文对话案例. 用户给一张珀斯高速公路路牌照片, 问最近的出口怎么走, 最快要多久; 模型认出 East Perth / Welshpool 出口在 700 米外, James St & Wellington St 出口在 1 千米外, 按 100 km/h 限速换算约 27.78 米每秒, 得出约 25 秒](images/p20-figure-4-a-case-of-comprehensive-real-world-reasoning.png)

Figure 4: A case of comprehensive real-world reasoning.

图 4: 综合真实世界推理的案例.

<!-- page 21 of 25 -->

![图 5: 同一张路牌照片的中文问答. 用户问怎样尽快到达出口, 最快用时多久; 模型选 700 米外的 East Perth 和 Welshpool 出口, 按限速 100 公里每小时 (约 27.78 米每秒) 匀速估算约 25 秒](images/p21-figure-5-a-case-of-comprehensive-real-world-reasoning.png)

Figure 5: A case of comprehensive real-world reasoning in Chinese.

图 5: 中文综合真实世界推理的案例.

![图 6: 中文创意写作案例. 用户给一张高原湖面倒影照片, 要求写小红书风格的旅游分享帖; 模型写出青海湖五日行程, 打卡景点, 美食推荐, 小贴士, 适合季节和人均预算, 末尾带话题标签](images/p21-figure-6-a-case-of-creative-writing-in-chinese.png)

Figure 6: A case of creative writing in Chinese.

图 6: 中文创意写作的案例.

<!-- page 22 of 25 -->

### B.2 World Knowledge

![图 7: 英文世界知识案例. 用户给一张始祖鸟化石照片, 模型认出 Archaeopteryx, 介绍它 1861 年在德国 Solnhofen 首次发现, 生活在约 1.5 亿年前的侏罗纪, 以及它连接恐龙与鸟类的意义](images/p22-figure-7-a-case-of-world-knowledge-understanding.png)

Figure 7: A case of world knowledge understanding.

图 7: 世界知识理解的案例.

![图 8: 同一张始祖鸟化石照片的中文问答. 模型从保存状态, 形态特征, 历史意义三点介绍, 再描述图中的骨骼, 羽毛痕迹和姿态](images/p22-figure-8-a-case-of-world-knowledge-understanding-in.png)

Figure 8: A case of world knowledge understanding in Chinese.

图 8: 中文世界知识理解的案例.

<!-- page 23 of 25 -->

### B.3 OCR

![图 9: 英文手写识别案例. 左边是红线纸上的一篇手写短文, 有涂改和行间补字; 右边是模型转写出的全文](images/p23-when-it-comes-to-retailing-industry-we-often-remind-the.png)

When it comes to retailing industry, we often remind the both part of realistic store and internet shopping. Both of them are all have their pros and cons, but according to the picture, we can find out both of the internet sales counting and its profit are all growed up every year between twenty eighteen to twenty twenty one. The years () rate began with twenty eighteen only 10.3%, next year 14.1%, and the next 20.3%, finally finished in twenty twenty one up to 24.5%. The sales profit also began with twenty eighteen only 2517 (million), next year 2893, and the next 3456, finally finished in twenty twenty one up to 4303. Therefore, we can find out the internet shopping is growed up between the four years. Begun 2019, according my observed, () more of my friends change to internet shopping because of COVID-19. All above the results provided the picture is the realistic. In my opinion, shopping on the internet can save many times to me, so I also do it when I

这段是图 9 里模型的转写结果. 原文是一篇语法错误不少的英文手写作文, 意思大致是: 说到零售业, 我们常会想到实体店和网上购物两方面. 两者各有利弊, 但从图上看, 网上销售额和利润在 2018 到 2021 年间每年都在增长. 年 () 率从 2018 年的 10.3% 起步, 次年 14.1%, 再下一年 20.3%, 到 2021 年达到 24.5%. 销售利润也从 2018 年的 2517 (百万) 起步, 次年 2893, 再下一年 3456, 到 2021 年达到 4303. 因此可以看出, 网上购物在这四年里一直在增长. 从 2019 年起, 据我观察, () 更多朋友因为 COVID-19 改在网上购物. 以上结果说明图里反映的是实情. 我认为网上购物能帮我省下很多时间, 所以我也会在...的时候网购 (原文到此截断).

> **想:** 图 9 转写里的两处 「()」 是什么?
> 对照原图, 「The years」 和 「rate」 之间的行上补写了 「increase」, 「, more of my friends」 前面的行上补写了 「more and」, 模型把这两处行间插字都转成了空括号. 这张图给的 prompt 是 「Extract what's shown in the image, return tables in HTML.」, 与图 11 的 prompt 相同, 放在手写作文上不对题, 模型也没有输出 HTML.

Figure 9: A case of handwritten text recognition.

图 9: 手写文字识别的案例.

![图 10: 中文手写识别案例. 笔记本页眉印着 忠信笃行 自强不息, 手写内容介绍一款语音产品的功能, 如聊天解闷, 订餐购物, 控制智能家居, 声纹识别; 模型按行转写全文](images/p23-figure-10-a-case-of-handwritten-text-recognition-in.png)

Figure 10: A case of handwritten text recognition in Chinese.

图 10: 中文手写文字识别的案例.

<!-- page 24 of 25 -->

![图 11: 表格提取案例. 输入是 RLAIF-V 论文表 7 的截图, 列出多个 MLLM 在 RefoMB 八项能力上的可信胜率和总胜率; 模型按要求输出 HTML 表格, 渲染后与原表逐格一致](images/p24-figure-11-a-case-of-table-content-extraction.png)

Figure 11: A case of table content extraction.

图 11: 表格内容提取的案例.

### B.4 Problem Solving

![图 12: 中文化学选择题案例. 四个实验装置分别是除去 Cl2 中的 HCl, 制备少量 NO 避免被氧化, 用乙醇萃取 CS2 中的 S, 制作简易氢氧燃料电池; 模型先输出 think 块, 再逐项分析, 选 B](images/p24-figure-12-a-case-of-chemistry-problem-solving-in-chinese.png)

Figure 12: A case of chemistry problem solving in Chinese.

图 12: 中文化学解题的案例.

> **问:** 图 12 里模型选 B, 页面给了标准答案吗?
> 没给. 模型对选项 C 的判断句只写到 「因此C」 就断了, 缺了结论词, 思考过程也用省略号跳过. 这张图只能说明模型会先输出 think 块再逐项分析, 不能当作答对的证据.

<!-- page 25 of 25 -->

![图 13: 多图统计题案例. 两张照片分别是缺值的单因素方差分析表 (因子自由度 3, 平方和 36.15, 总自由度 19, 总平方和 196.04) 和第 2 到第 5 题的题面; 模型先输出 think 块, 再给出 159.89, 12.05, 9.9931, 1.206, 并补答第 1 题误差自由度为 16](images/p25-figure-13-a-case-of-multi-image-statistical-problem.png)

Figure 13: A case of multi-image statistical problem solving.

图 13: 多图统计题解题的案例.

> **核对:** 图 13 的方差分析题, 模型答的 16, 159.89, 12.05, 9.9931, 1.206 能复算吗?
> 能. 误差自由度 19 - 3 = 16; 误差平方和 196.04 - 36.15 = 159.89; 因子均方 36.15 / 3 = 12.05; 误差均方 159.89 / 16 约 9.9931; F = 12.05 / 9.9931 约 1.206. 五问全对.
