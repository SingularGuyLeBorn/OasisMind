<!-- page 1 of 23 -->

arXiv:2502.13923v1 [cs.CV] 19 Feb 2025

Qwen

March 5, 2025

# Qwen2.5-VL Technical Report

**Qwen Team, Alibaba Group**

[https://chat.qwenlm.ai](https://chat.qwenlm.ai)

0 [https://huggingface.co/Qwen](https://huggingface.co/Qwen)

[https://modelscope.cn/organization/qwen](https://modelscope.cn/organization/qwen)

[https://github.com/QwenLM/Qwen2.5-VL](https://github.com/QwenLM/Qwen2.5-VL)
作者与链接: 阿里巴巴集团 Qwen 团队; 对话 https://chat.qwenlm.ai; 权重 https://huggingface.co/Qwen, https://modelscope.cn/organization/qwen; 代码 https://github.com/QwenLM/Qwen2.5-VL.

## Abstract

We introduce Qwen2.5-VL, the latest flagship model of Qwen vision-language series, which demonstrates significant advancements in both foundational capabilities and innovative functionalities. Qwen2.5-VL achieves a major leap forward in understanding and interacting with the world through enhanced visual recognition, precise object localization, robust document parsing, and long-video comprehension. A standout feature of Qwen2.5-VL is its ability to localize objects using bounding boxes or points accurately. It provides robust structured data extraction from invoices, forms, and tables, as well as detailed analysis of charts, diagrams, and layouts. To handle complex inputs, Qwen2.5- VL introduces dynamic resolution processing and absolute time encoding, enabling it to process images of varying sizes and videos of extended durations (up to hours) with second-level event localization. This allows the model to natively perceive spatial scales and temporal dynamics without relying on traditional normalization techniques. By training a native dynamic-resolution Vision Transformer (ViT) from scratch and incorporating Window Attention, we have significantly reduced computational overhead while maintaining native resolution. As a result, Qwen2.5-VL excels not only in static image and document understanding but also as an interactive visual agent capable of reasoning, tool usage, and task execution in real-world scenarios such as operating computers and mobile devices. The model achieves strong generalization across domains without requiring task-specific fine-tuning. Qwen2.5-VL is available in three sizes, addressing diverse use cases from edge AI to high-performance computing. The flagship Qwen2.5-VL-72B model matches state-of-the-art models like GPT-4o and Claude 3.5 Sonnet, particularly excelling in document and diagram understanding. The smaller Qwen2.5-VL-7B and Qwen2.5-VL-3B models outperform comparable competitors, offering strong capabilities even in resource-constrained environments. Additionally, Qwen2.5-VL maintains robust linguistic performance, preserving the core language competencies of the Qwen2.5 LLM.
本报告介绍 **Qwen2.5-VL**: Qwen 视觉语言系列最新旗舰, 基础能力与新功能均有明显提升. 视觉识别, 物体定位, 文档解析与长视频理解一并加强. 突出能力是用边界框或点精确落地物体; 发票, 表单, 表格可抽结构化数据, 图表与版面可细读. 复杂输入上引入 **动态分辨率**(dynamic resolution)与 **绝对时间编码**(absolute time encoding): 可变尺寸图像与长达数小时的视频均可处理, 事件可定位到秒级, 空间尺度与时间动态由模型原生感知, 不必再靠传统归一化坐标. 从零训练原生动态分辨率 **ViT**(Vision Transformer), 并加 **Window Attention**(窗口注意力), 在保持原生分辨率的同时压低算力. 因此它既擅长静态图与文档, 也能当交互式视觉 agent: 推理, 用工具, 在电脑与手机等真实场景执行任务; 跨域泛化强, 不必按任务单独微调. 三档尺寸覆盖端侧到高性能计算. 旗舰 Qwen2.5-VL-72B 可对标 GPT-4o, Claude 3.5 Sonnet, 文档与图示理解尤强; 更小的 7B, 3B 在同级中领先, 资源紧时仍可用. 语言侧仍保持 Qwen2.5 LLM 的核心文本能力.

![Image block](images/p01-image.png)

![Image block](images/p01-1.png)

<!-- page 2 of 23 -->

## 1 Introduction

Large vision-language models ( LVLMs ) (OpenAI, 2024; Anthropic, 2024a; Team et al., 2023; Wang et al., 2024f) represent a pivotal breakthrough in artificial intelligence, signaling a transformative approach to multimodal understanding and interaction. By seamlessly integrating visual perception with natural language processing, these advanced models are fundamentally reshaping how machines interpret and analyze complex information across diverse domains. Despite significant advancements in multimodal large language models, the current capabilities of these models can be likened to the middle layer of a sandwich cookie—competent across various tasks but falling short of exceptional performance. Finegrained visual tasks form the foundational layer of this analogy. In this iteration of Qwen2.5-VL, we are committed to exploring fine-grained perception capabilities, aiming to establish a robust foundation for LVLMs and create an agentic amplifier for real-world applications. The top layer of this framework is multi-modal reasoning, which is enhanced by leveraging the latest Qwen2.5 LLM and employing multi-modal QA data construction.
**LVLM**(Large Vision-Language Model, 大型视觉语言模型)把视觉感知与自然语言接到一起, 正在改写机器跨域理解复杂信息的方式. 现有多模态大模型常像夹心饼干的中间层: 样样能做, 却难称顶尖. 细粒度视觉是底层; 本代 Qwen2.5-VL 主攻细粒度感知, 为 LVLM 打底, 并放大真实场景里的 agent 能力. 上层是多模态推理, 依托最新 Qwen2.5 LLM 与多模态问答数据构造.

A spectrum of works have promoted the development of multimodal large models, characterized by architectural design, visual input processing, and data curation. One of the primary drivers of progress in LVLMs is the continuous innovation in architecture. The studies presented in (Alayrac et al., 2022; Li et al., 2022a; 2023b; Liu et al., 2023b;a; Wang et al., 2024i; Zhang et al., 2024b; Wang et al., 2023) have incrementally shaped the current paradigm, which typically consists of a visual encoder, a cross-modal projector, and LLM. Fine-grained perception models have emerged as another crucial area. Models like (Xiao et al., 2023; Liu et al., 2023c; Ren et al., 2024; Zhang et al., 2024a;d; Peng et al., 2023; Deitke et al., 2024) have pushed the boundaries of what is possible in terms of detailed visual understanding. The architectures of Omni (Li et al., 2024g; 2025b; Ye et al., 2024) and MoE (Riquelme et al., 2021; Lee et al., 2024; Li et al., 2024h;c; Wu et al., 2024b) also inspire the future evolution of LVLMs. Enhancements in visual encoders (Chen et al., 2023; Liu et al., 2024b; Liang et al., 2025) and resolution scaling (Li et al., 2023c; Ye et al., 2023; Li et al., 2023a) have played a pivotal role in improving the quality of practical visual understanding. Curating data with more diverse scenarios and higher-quality is an essential step in training advanced LVLMs. The efforts proposed in (Guo et al., 2024; Chen et al., 2024d; Liu et al., 2024a; Chen et al., 2024a; Tong et al., 2024; Li et al., 2024a) are highly valuable contributions to this endeavor.
推动多模态大模型的工作大致落在架构, 视觉输入处理与数据策展. 当前范式多为「视觉编码器 → 跨模态投影 → LLM」. 细粒度感知, Omni / **MoE**(Mixture-of-Experts)结构, 更强视觉编码器与分辨率缩放, 以及更高质, 更多样的数据, 都是重要推力.

However, despite their remarkable progress, vision-language models currently face developmental bottlenecks, including computational complexity, limited contextual understanding, poor fine-grained visual perception, and inconsistent performance across varied sequence length.
尽管进步明显, 视觉语言模型仍卡住: 算力复杂, 上下文理解有限, 细粒度视觉弱, 不同序列长度上表现不稳.

In this report, we introduce the latest work Qwen2.5-VL, which continues the open-source philosophy of the Qwen series, achieving and even surpassing top-tier closed-source models on various benchmarks. Technically, our contributions are four-folds: (1) We implement window attention in the visual encoder to optimize inference efficiency; (2) We introduce dynamic FPS sampling, extending dynamic resolution to the temporal dimension and enabling comprehensive video understanding across varied sampling rates; (3) We upgrade MRoPE in the temporal domain by aligning to absolute time, thereby facilitating more sophisticated temporal sequence learning; (4) We make significant efforts in curating high-quality data for both pre-training and supervised fine-tuning, further scaling the pre-training corpus from 1.2 trillion tokens to 4.1 trillion tokens.
本报告介绍 Qwen2.5-VL: 延续 Qwen 开源路线, 多项基准达到甚至超过顶尖闭源模型. 技术贡献四点: (1)视觉编码器加窗口注意力, 优化推理效率; (2)引入 **动态 FPS 采样**, 把动态分辨率伸到时间维, 适配不同采样率下的视频理解; (3)时间维升级 **MRoPE**, 与绝对时间对齐, 利于更细的时间序列学习; (4)预训练与监督微调都大力策展高质量数据, 预训练语料由约 1.2 万亿 token 扩到约 4.1 万亿.

> **想:** 窗口注意力只放在视觉编码器, LLM 侧还是全注意力吗?
> 是. 四点贡献里 window attention 写在 visual encoder; LLM 仍是 Qwen2.5 的解码器注意力, 表 1 也只给 ViT 写了 Window Size 与 Full Attention Block Indexes.

The sparkling characteristics of Qwen2.5-VL are as follows:
亮点如下:

• **Powerful document parsing capabilities:** Qwen2.5-VL upgrades text recognition to omnidocument parsing, excelling in processing multi-scene, multilingual, and various built-in (handwriting, tables, charts, chemical formulas, and music sheets) documents.
• **强文档解析:** 从文本识别升到全文档解析 (omni-document parsing), 多场景, 多语种, 以及手写, 表格, 图表, 化学式, 乐谱等内嵌元素都能处理.

• **Precise object grounding across formats:** Qwen2.5-VL unlocks improved accuracy in detecting, pointing, and counting objects, accommodating absolute coordinate and JSON formats for advanced spatial reasoning.
• **多格式精确 grounding:** 检测, 点选与计数更准, 支持绝对坐标与 JSON, 便于空间推理.

• **Ultra-long video understanding and fine-grained video grounding:** Our model extends native dynamic resolution to the temporal dimension, enhancing the ability to understand videos lasting hours while extracting event segments in seconds.
• **超长视频理解与细粒度视频 grounding:** 原生动态分辨率伸到时间维, 可理解小时级视频, 并以秒级抽出事件片段.

**Enhanced agent Functionality for computer and mobile devices:** Leverage advanced grounding, reasoning, and decision-making abilities, boosting the model with superior agent functionality on smartphones and computers.
**强化电脑与手机上的 agent:** 依托 grounding, 推理与决策, 在智能手机与计算机上更好充当操作助手.

<!-- page 3 of 23 -->

![Image block](images/p03-figure-1-the-qwen2-5-vl-framework-demonstrates-the.png)

Figure 1: The Qwen2.5-VL framework demonstrates the integration of a vision encoder and a language model decoder to process multimodal inputs, including images and videos. The vision encoder is designed to handle inputs at their native resolution and supports dynamic FPS sampling. Images of varying sizes and video frames with different FPS rates are dynamically mapped to token sequences of varying lengths. Notably, MRoPE aligns time IDs with absolute time along the temporal dimension, enabling the model to better comprehend temporal dynamics, such as the pace of events and precise moment localization. The processed visual data is subsequently fed into the Qwen2.5 LM Decoder. We have re-engineered the vision transformer (ViT) architecture, incorporating advanced components such as FFN with SwiGLU activation, RMSNorm for normalization, and window-based attention mechanisms to enhance performance and efficiency.
图 1: Qwen2.5-VL 框架把视觉编码器与语言模型解码器接到一起, 处理图像与视频. 视觉编码器按原生分辨率工作, 并支持动态 FPS 采样. 不同尺寸图像与不同 FPS 的视频帧, 动态映射成不同长度的 token 序列. MRoPE 在时间维把 time ID 与绝对时间对齐, 便于理解事件节奏与精确定位时刻. 视觉特征再送入 Qwen2.5 LM Decoder. ViT 重做: FFN 用 SwiGLU, 归一化用 RMSNorm, 并加窗口注意力以兼顾效果与效率.

> **问:** 动态 FPS 是推理时再抽帧, 还是训练就按可变帧率喂?
> 训练侧就动态采样 FPS, 让训练集里帧率分布更匀; 时间维再靠绝对时间对齐的 MRoPE, 让不同 FPS 仍能对齐事件节奏.

## 2 Approach 方法

In this section, we first outline the architectural updates of the Qwen2.5-VL series models and provide an overview of the data and training details.
本节先概述 Qwen2.5-VL 系列的架构更新, 再交代数据与训练要点.

### 2.1 Model Architecture 模型架构

The overall model architecture of Qwen2.5-VL consists of three components:
整体架构三块:

**Large Language Model**: The Qwen2.5-VL series adopts large language models as its foundational component. The model is initialized with pre-trained weights from the Qwen2.5 LLM. To better meet the demands of multimodal understanding, we have modified the 1D RoPE (Rotary Position Embedding) to our Multimodal Rotary Position Embedding Aligned to Absolute Time.
大语言模型: 以 Qwen2.5 LLM 预训练权重初始化. 为更好服务多模态, 把一维 RoPE 改成与绝对时间对齐的多模态旋转位置编码 (Multimodal Rotary Position Embedding Aligned to Absolute Time).

**Vision Encoder**: The vision encoder of Qwen2.5-VL employs a redesigned Vision Transformer (ViT) architecture. Structurally, we incorporate 2D-RoPE and window attention to support native input resolutions while accelerating the computation of the entire visual encoder. During both training and inference, the height and width of the input images are resized to multiples of 28 before being fed into the ViT. The vision encoder processes images by splitting them into patches with a stride of 14, generating a set of image features. We provide a more detailed introduction to the vision encoder in Section 2.1.1.
视觉编码器: 重设计的 ViT, 含 2D-RoPE 与窗口注意力, 支持原生分辨率并加速整段视觉编码. 训练与推理时, 输入高宽先调成 28 的倍数再进 ViT; 按 stride 14 切 patch 得到图像特征. 细节见 2.1.1.

> **看表:** 高宽先调成 28 的倍数, 和 patch stride 14, 窗口 112 怎么咬合?
> 14 的两倍是 28, 方便 2x2 合并进 Merger; 112=8x14, 正好是最大窗口对应 8x8 patch. 表 1 三项一起读.

**MLP-based Vision-Language Merger**: To address the efficiency challenges posed by long sequences of image features, we adopt a simple yet effective approach to compress the feature sequences before feeding them into the large language model (LLM). Specifically, instead of directly using the raw patch
基于 MLP 的视觉-语言合并器: 为压缩过长的图像特征序列, 不直接把 ViT 原始 patch 特征送进 LLM.

<!-- page 4 of 23 -->

features extracted by the Vision Transformer (ViT), we first group spatially adjacent sets of four patch features. These grouped features are then concatenated and passed through a two-layer multi-layer perceptron (MLP) to project them into a dimension that aligns with the text embeddings used in the LLM. This method not only reduces computational costs but also provides a flexible way to dynamically compress image feature sequences of varying lengths.
而是先把空间相邻的 4 个 patch 特征成组拼接, 再经两层 MLP 投影到与 LLM 文本嵌入同维. 这样既降算力, 也能灵活压缩变长图像特征序列.

> **拆开:** 连续两帧捆成一个 3D patch 之后, 绝对时间对齐的 MRoPE 还怎么同时成立?
> 2.1.1 写视频把 consecutive frames 成组以降送进 LLM 的 token; 2.1.3 写时间分量对齐 absolute time, 靠 temporal ID 的间隔学事件节奏, 不再绑输入帧数. 成组管的是视觉 token 预算, 绝对时间网格管的是墙钟几何, 二者正交: FPS 与成组改变采样密度, MRoPE 仍按绝对时间对齐.

In Table 1, the architecture and configuration of Qwen2.5-VL are detailed.
表 1 给出 Qwen2.5-VL 的架构与配置.

<table><tr><td>Configuration</td><td>Qwen2.5-VL-3B</td><td>Qwen2.5-VL-7B</td><td>Qwen2.5-VL-72B</td></tr><tr><td colspan="4">Vision Transformer (ViT)</td></tr><tr><td>Hidden Size</td><td>1280</td><td>1280</td><td>1280</td></tr><tr><td># Layers</td><td>32</td><td>32</td><td>32</td></tr><tr><td># Num Heads</td><td>16</td><td>16</td><td>16</td></tr><tr><td>Intermediate Size</td><td>3456</td><td>3456</td><td>3456</td></tr><tr><td>Patch Size</td><td>14</td><td>14</td><td>14</td></tr><tr><td>Window Size</td><td>112</td><td>112</td><td>112</td></tr><tr><td>Full Attention Block Indexes</td><td>{7, 15, 23, 31}</td><td>{7, 15, 23, 31}</td><td>{7, 15, 23, 31}</td></tr><tr><td colspan="4">Vision-Language Merger</td></tr><tr><td>In Channel</td><td>1280</td><td>1280</td><td>1280</td></tr><tr><td>Out Channel</td><td>2048</td><td>3584</td><td>8192</td></tr><tr><td colspan="4">Large Language Model (LLM)</td></tr><tr><td>Hidden Size</td><td>2048</td><td>3,584</td><td>8192</td></tr><tr><td># Layers</td><td>36</td><td>28</td><td>80</td></tr><tr><td># KV Heads</td><td>2</td><td>4</td><td>8</td></tr><tr><td>Head Size</td><td>128</td><td>128</td><td>128</td></tr><tr><td>Intermediate Size</td><td>4864</td><td>18944</td><td>29568</td></tr><tr><td>Embedding Tying</td><td>✓</td><td>✘</td><td>✘</td></tr><tr><td>Vocabulary Size</td><td>151646</td><td>151646</td><td>151646</td></tr><tr><td># Trained Tokens</td><td>4.1T</td><td>4.1T</td><td>4.1T</td></tr></table>

> **确认:** 2.3.4 写 SFT/DPO 都 freeze ViT, Merger 那两层 MLP 还进不进梯度?
> 原文只写 「both with the Vision Transformer (ViT) parameters frozen」, 未宣布冻 Vision-Language Merger. 表 1 把 ViT 与 Merger 分成两块配置. 按字面: ViT 停梯度; LLM 必训; Merger 未列入冻结句, 仍可作为可训练投影, 除非实现另做未写入报告的冻结.

Table 1: Configuration of Qwen2.5-VL.
表 1: Qwen2.5-VL 配置.

#### 2.1.1 Fast and Efficient Vision Encoder 快速高效的视觉编码器

The vision encoder plays a pivotal role in multimodal large language models (MLLMs). To address the challenges posed by computational load imbalances during training and inference due to native resolution inputs, we have redesigned the Vision Transformer (ViT) architecture. A key issue arises from the quadratic computational complexity associated with processing images of varying sizes. To mitigate this, we introduce windowed attention in most layers, which ensures that computational cost scales linearly with the number of patches rather than quadratically. In our architecture, only four layers employ full self-attention, while the remaining layers utilize windowed attention with a maximum window size of 112×112 (corresponding to 8×8 patches). Regions smaller than 112×112 are processed without padding, preserving their original resolution. This design allows the model to operate natively at the input resolution, avoiding unnecessary scaling or distortion.
视觉编码器是 **MLLM** 的关键. 原生分辨率易导致训练/推理算力不均; 可变尺寸下全注意力是二次复杂度. 多数层改用窗口注意力, 使代价近似随 patch 数线性增长: 仅 4 层全自注意力, 其余最大窗口 112×112(对应 8×8 patch); 小于该窗口的区域不 padding, 保留原分辨率, 从而原生分辨率运行, 少做无谓缩放或形变.

> **核对:** 多数层窗口注意力之后, 为什么还要留 {7,15,23,31} 四层 full self-attention, 能不能全窗口?
> 2.1.1 写多数层 windowed attention 使代价近似随 patch 数线性增长, 「only four layers employ full self-attention」. 窗口内看不到窗外 patch; 文档远距版面或跨区 GUI 要靠这四层全局混合. 表 1 Full Attention Block Indexes 三档相同, 是精度与算力的折中, 不是可删的装饰.

For positional encoding, we adopt 2D Rotary Positional Embedding (RoPE) to effectively capture spatial relationships in 2D space. Furthermore, to better handle video inputs, we extend our approach to 3D patch partitioning. Specifically, we use 14×14 image patches as the basic unit, consistent with traditional ViTs for static images. For video data, two consecutive frames are grouped together, significantly reducing the number of tokens fed into the language model. This design not only maintains compatibility with existing architectures but also enhances efficiency when processing sequential video data.
位置编码用 **2D-RoPE**. 视频侧扩展为 3D patch 划分: 静态图仍以 14×14 patch 为基本单元; 视频把连续两帧成组, 显著减少送入语言模型的 token, 兼顾兼容与效率.

> **回看:** 视频两帧一组, 和动态 FPS 会不会打架?
> 两帧成组是 3D patch 降 token; 动态 FPS 决定抽哪些帧. 先按 FPS 抽样, 再两两成组进 ViT.

To streamline the overall network structure, we align the ViT architecture more closely with the design principles of large language models (LLMs). Specifically, we adopt RMSNorm (Zhang &Sennrich, 2019) for normalization and SwiGLU (Dauphin et al., 2017) as the activation function. These choices enhance both computational efficiency and compatibility between the vision and language components of the model.
结构上向 LLM 靠拢: 归一化用 **RMSNorm**, 激活用 **SwiGLU**, 兼顾效率与视觉-语言组件兼容.

In terms of training, we train the redesigned ViT from scratch. The training process consists of several stages, including CLIP pre-training, vision-language alignment, and end-to-end fine-tuning. To ensure robustness across varying input resolutions, we employ dynamic sampling at native resolutions during

<!-- page 5 of 23 -->

training. Images are randomly sampled according to their original aspect ratios, enabling the model to generalize effectively to inputs of diverse resolutions. This approach not only improves the model’s adaptability but also ensures stable and efficient training across different sizes of visual data.
ViT 从零训练, 经 CLIP 预训练, 视觉-语言对齐与端到端微调等阶段. 训练时按原生分辨率动态采样, 依原宽高比随机取图, 以泛化到多样分辨率, 并在不同视觉尺寸上保持稳定高效训练.

#### 2.1.2 Native Dynamic Resolution and Frame Rate 原生动态分辨率与帧率

Qwen2.5-VL introduces advancements in both spatial and temporal dimensions to handle diverse multimodal inputs effectively.
空间与时间两侧都做了增强, 以吃多样多模态输入.

In the spatial domain, Qwen2.5-VL dynamically converts images of varying sizes into sequences of tokens with corresponding lengths. Unlike traditional approaches that normalize coordinates, our model directly uses the actual dimensions of the input image to represent bounding boxes, points, and other spatial features. This allows the model to learn scale information inherently, improving its ability to process images across different resolutions.
空间上: 不同尺寸图像动态变成相应长度的 token 序列. 框, 点等空间特征直接用输入图像真实尺寸表示, 而非归一化坐标, 从而内生学习尺度信息.

> **停一下:** 绝对坐标训练, 推理时输入被 resize 到 28 倍数, 框还对得上原图像素吗?
> 报告强调用实际输入图尺寸表示框与点, 让模型学尺度; resize 是进 ViT 前的对齐约束, 标注坐标按训练时的实际输入尺寸来写, 不是归一化到 [0,1].

For video inputs, Qwen2.5-VL incorporates dynamic frame rate (FPS) training and absolute time encoding. By adapting to variable frame rates, the model can better capture the temporal dynamics of video content. Unlike other approaches that incorporate textual timestamps or utilize additional heads to enable temporal grounding, we introduce a novel and efficient strategy that aligns MRoPE IDs directly with the timestamps. This approach allows the model to understand the tempo of time through the intervals between temporal dimension IDs, without necessitating any additional computational overhead.
视频上: 动态 **FPS** 训练与绝对时间编码. 相对「文本时间戳」或额外时间头, 这里把 MRoPE 的 ID 直接与时间戳对齐, 靠时间维 ID 间隔感知节奏, 几乎不加额外算力.

#### 2.1.3 Multimodal Rotary Position Embedding Aligned to Absolute Time 与绝对时间对齐的多模态旋转位置编码

Positional embeddings are crucial for modeling sequential data in both vision and language modalities. Building upon the Multimodal Rotary Position Embedding (MRoPE) introduced in Qwen2-VL, we extend its capabilities to better handle temporal information in videos.
位置嵌入对视觉与语言序列都关键. 在 Qwen2-VL 的 **MRoPE** 基础上扩展, 以更好处理视频时间信息.

The MRoPE in Qwen2-VL decomposes the position embedding into three distinct components: temporal, height, and width to effectively model multimodal inputs. For textual inputs, all three components use identical position IDs, making MRoPE functionally equivalent to traditional 1D RoPE (Su et al., 2024). For images, the temporal ID remains constant across visual tokens, while unique IDs are assigned to the height and width components based on each token’s spatial position within the image. When processing videos, which are treated as sequences of frames, the temporal ID increments for each frame, while the height and width components follow the same assignment pattern as for static images.
Qwen2-VL 的 MRoPE 把位置拆成时间, 高, 宽. 文本三分量共用同一 ID, 功能上等价一维 RoPE; 图像时间 ID 不变, 按空间位置赋高/宽 ID; 视频按帧递增时间 ID, 高宽同静态图.

However, in Qwen2-VL, the temporal position IDs in MRoPE were tied to the number of input frames, which did not account for the speed of content changes or the absolute timing of events within the video. To address this limitation, Qwen2.5-VL introduces a key improvement: aligning the temporal component of MRoPE with absolute time. As shown in Figure 1, by leveraging the intervals between temporal IDs, the model is able to learn consistent temporal alignment across videos with different FPS sampling rates.
Qwen2-VL 里时间 ID 绑在输入帧数上, 未显式刻画内容变化快慢与事件绝对时刻. Qwen2.5-VL 的关键改进是: MRoPE 时间分量与绝对时间对齐(见图 1). 借助时间 ID 间隔, 不同 FPS 采样的视频也能学到一致的时间对齐.

### 2.2 Pre-Training 预训练

In this section, we first describe the construction of the pre-training dataset, followed by an overview of the overall training pipeline and configuration.
先写预训练数据构造, 再概述整体训练流水线与配置.

#### 2.2.1 Pre-Training Data 预训练数据

Compared to Qwen2-VL, we have significantly expanded the volume of our pre-training data, increasing it from 1.2 trillion tokens to approximately 4 trillion tokens. Our pre-training dataset was constructed through a combination of methods, including cleaning raw web data, synthesizing data, etc. The dataset encompasses a wide variety of multimodal data, such as image captions, interleaved image-text data, optical character recognition (OCR) data, visual knowledge (e.g., celebrity, landmark, flora, and fauna identification), multi-modal academic questions, localization data, document parsing data, video descriptions, video localization, and agent-based interaction data. Throughout the training process, we carefully adjusted the composition and proportions of these data types at different stages to optimize learning outcomes.
相对 Qwen2-VL, 预训练由约 1.2 万亿 token 扩到约 4 万亿. 数据来自清洗网页, 合成等, 覆盖图像描述, 图文交错, **OCR**, 视觉知识(名人/地标/动植物等), 多模态学术题, 定位, 文档解析, 视频描述与定位, agent 交互等; 各阶段按比例细调.

> **再看:** 文档 HTML 里的 data-bbox 与 grounding 用的绝对坐标, 是不是同一套像素约定?
> 文档 omni-parsing 段要求 HTML 标签嵌 data-bbox 并按阅读顺序带模块坐标; grounding 段写 「coordinate values based on the actual dimensions of the input images」. 两条管线都拒绝相对/归一化框, 都服务原生分辨率, 但是文档解析与开放词表检测/指点两套数据, 报告没有写共用同一个标注导出器.

**Interleaved Image-Text Data** Interleaved image-text data is essential for multimodal learning, offering three key benefits: (1) enabling in-context learning with simultaneous visual and textual cues (Alayrac et al., 2022), (2) maintaining strong text-only capabilities when images are missing (Lin et al., 2024), and (3) containing a wide range of general information. However, much of the available interleaved data
**交错图文数据** 对多模态学习很关键, 三点好处: (1) 同时用视觉与文本线索做 in-context learning; (2) 缺图时仍能保住纯文本能力; (3) 覆盖广谱常识. 但大量可用交错数据

<!-- page 6 of 23 -->

lacks meaningful text-image associations and is often noisy, limiting its usefulness for complex reasoning and creative generation.
缺少有意义的图文关联, 噪声也多, 复杂推理与创意生成用起来受限.

To address these challenges, we developed a pipeline for scoring and cleaning data, ensuring only high-quality, relevant interleaved data is used. Our process involves two steps: standard data cleaning (Li et al., 2024e) followed by a four-stage scoring system using an internal evaluation model. The scoring criteria include: (1) text-only quality, (2) image-text relevance, (3) image-text complementarity, and (4) information density balance. This meticulous approach improves the model’s ability to perform complex reasoning and generate coherent multimodal content.
为此建立打分清洗流水线: 先标准清洗, 再用内部评估模型做四维打分 - - 纯文本质量, 图文相关性, 图文互补性, 信息密度平衡 - - 以提升复杂推理与连贯多模态生成.

The following is a description of these image-text scoring criteria:
各维含义如下:

Image-text Relevance: A higher score indicates a stronger connection between the image and text, where the image meaningfully supplements, explains or expands on the text rather than just decorating it.
图文相关性: 分高表示图文联系强, 图像是补充, 解释或扩展, 而非纯装饰.

Information Complementarity: A higher score reflects greater complementary information between the image and text. Each should provide unique details that together create a complete narrative.
信息互补: 图与文各自提供独特细节, 合起来才成完整叙述.

Balance of Information Density: A higher score means a more balanced distribution of information between the image and text, avoiding excessive text or image information, and ensuring an appropriate balance between the two.
信息密度平衡: 避免一侧信息过载, 图文分配适当.

**Grounding Data with Absolute Position Coordinates** We adopt native resolution training with the aim of achieving a more accurate perception of the world. In contrast, relative coordinates fail to effectively represent the original size and position of objects within images. To address this limitation, Qwen2.5-VL uses coordinate values based on the actual dimensions of the input images during training to represent bounding boxes and points. This approach ensures that the model can better capture the real-world scale and spatial relationships of objects, leading to improved performance in tasks such as object detection and localization.
**带绝对位置坐标的 grounding 数据** 采用原生分辨率训练, 目标是更准地感知世界. 相对坐标难以表达物体在原图中的真实尺寸与位置. 因此训练时用输入图实际尺寸上的坐标表示边界框与点, 便于捕捉真实尺度与空间关系, 抬检测与定位.

To improve the generalizability of grounding capabilities, we have developed a comprehensive dataset encompassing bounding boxes and points with referring expressions, leveraging both publicly available datasets and proprietary data. Our methodology involves synthesizing data into various formats, including XML, JSON, and custom formats, employing techniques such as copy-paste augmentation (Ghiasi et al., 2021) and synthesis with off-the-shelf models such as Grounding DINO (Liu et al., 2023c) and SAM (Kirillov et al., 2023). This approach facilitates a more robust evaluation and advancement of grounding abilities.
为提升 grounding 泛化, 构建含指代表达的框/点数据(公开 + 自有), 合成 XML / JSON / 自定义等格式, 并用 copy-paste 增强以及 Grounding DINO, SAM 等现成模型合成.

To enhance the model’s performance on open-vocabulary detection, we expanded the training dataset to include over 10,000 object categories. Additionally, to improve the model’s effectiveness in extreme object detection scenarios, we synthesized non-existent object categories within the queries and constructed image data containing multiple instances for each object.
为抬开放词表检测, 训练类别扩到超过 10,000 类. 极端检测场景下, 还在查询里合成不存在的物体类别, 并为每类构造多实例图像.

To ensure superior point-based object grounding capabilities, we have constructed a comprehensive pointing dataset comprising both publicly available and synthetic data. Specifically, the data source includes public pointing and counting data from PixMo (Deitke et al., 2024), publicly accessible object grounding data (from both object detection and instance segmentation tasks), and data synthesized by an automated pipeline for generating precise pointing data towards certain image details.
点式 grounding: 综合 PixMo 公开指向/计数, 公开检测与实例分割 grounding, 以及自动管线合成的细节指向数据.

**Document Omni-Parsing Data** To train Qwen2.5-VL, we synthesized a large corpus of document data. Traditional methods for parsing document content typically rely on separate models to handle layout analysis, text extraction, chart interpretation, and illustration processing. In contrast, Qwen2.5- VL is designed to empower a general-purpose model with comprehensive capabilities for parsing, understanding, and converting document formats. Specifically, we incorporated a diverse array of elements into the documents, such as tables, charts, equations, natural or synthetic images, music sheets, and chemical formulas. These elements were uniformly formatted in HTML, which integrates layout box information and descriptions of illustrations into HTML tag structures. We also enriched the document layouts according to typical reading sequences and included the coordinates corresponding to each module, such as paragraphs and charts, in the HTML-based ground truth. This innovative approach allows the complete information of any document, including its layout, text, charts, and illustrations, to be represented in a standardized and unified manner. As a result, Qwen2.5-VL achieves seamless integration of multimodal document elements, thereby facilitating more efficient and accurate document understanding and transformation.
**文档 omni-parsing 数据** 合成大批文档语料. 传统解析常拆成版面, 抽字, 读图, 读插图多个专模; Qwen2.5-VL 则让一个通模具备解析, 理解与格式转换. 文档里纳入表格, 图表, 公式, 自然/合成图, 乐谱, 化学式等, 统一写成 HTML, 把版面框与插图说明嵌进标签. 版面按常见阅读顺序组织, ground truth 里带上段落, 图表等模块坐标. 于是任意文档的版面, 文本, 图表与插图都能用同一套结构表示, 便于多模态文档理解与转换.

> **问:** 文档 omni-parsing 为什么统一成 HTML 而不是纯 Markdown?
> HTML 标签能嵌 data-bbox, 把版面框, 表格, 公式, 乐谱, 化学式与阅读顺序收进同一结构, 方便一个通模吃完整文档.

Below is the QwenVL HTML format:
QwenVL HTML 格式示意如下:

<!-- page 7 of 23 -->

```html
<html><body>
# paragraph
<p data-bbox="x1 y1 x2 y2"> content </p>
# table
<style>table{id} style</style><table data-bbox="x1 y1 x2 y2" class="table{id}"> table content
</table>
# chart
<div class="chart" data-bbox="x1 y1 x2 y2"><img data-bbox="x1 y1 x2 y2" /><table> chart content
</table></div>
# formula
<div class="formula" data-bbox="x1 y1 x2 y2"><img data-bbox="x1 y1 x2 y2" /><div> formula
content </div></div>
# image caption
<div class="image caption" data-bbox="x1 y1 x2 y2"><img data-bbox="x1 y1 x2 y2" /><p> image
caption </p></div>
# image ocr
<div class="image ocr" data-bbox="x1 y1 x2 y2"><img data-bbox="x1 y1 x2 y2" /><p> image ocr
</p></div>
# music sheet
<div class="music sheet" format="abc notation" data-bbox="x1 y1 x2 y2"><img data-bbox="x1 y1
x2 y2" /><div> music sheet content </div></div>
# chemical formula content
<div class="chemical formula" format="smile" data-bbox="x1 y1 x2 y2"><img data-bbox="x1 y1
x2 y2" /><div> chemical formula content </div></div>
</html></body>
```

This format ensures that all document elements are represented in a structured and accessible manner, enabling efficient processing and understanding by Qwen2.5-VL.
该格式把各文档元素结构化, 便于 Qwen2.5-VL 处理与理解.

**OCR Data** Data from different sources are gathered and curated to enhance the OCR performance, including synthetic data, open-sourced data and in-house collected data. Synthetic data is generated through a visual text generation engine to produce high-quality text images in the wild. To support a wider range of languages and enhance multilingual capabilities, we have incorporated a large-scale multilingual OCR dataset. This dataset includes support for diverse languages such as French, German, Italian, Spanish, Portuguese, Arabic, Russian, Japanese, Korean, and Vietnamese. The dataset is carefully curated to ensure diversity and quality, utilizing both high-quality synthetic images and real-world natural scene images. This combination ensures robust performance across various linguistic contexts and improves the model’s adaptability to different text appearances and environmental conditions. For chart-type data, we synthesized 1 million samples using visualization libraries including matplotlib, seaborn, and plotly, encompassing chart categories such as bar charts, relational diagrams, and heatmaps. Regarding tabular data, we processed 6 million real-world samples through an offline end-to-end table recognition model, subsequently filtering out low-confidence tables, overlapping tables, and tables with insufficient cell density.
**OCR 数据** 汇集合成, 开源与内部采集数据. 合成侧用视觉文本生成引擎做野外高质量文字图. 为扩语种, 纳入大规模多语 OCR, 覆盖法, 德, 意, 西, 葡, 阿, 俄, 日, 韩, 越等, 合成图与真实场景图并用. 图表类用 matplotlib, seaborn, plotly 合成约 100 万样本 (柱状, 关系图, 热力图等). 表格侧用离线端到端识别模型处理约 600 万真实样本, 再滤掉低置信, 重叠与单元格过稀的表.

**Video Data** To ensure enhanced robustness in understanding video data with varying frames per second (FPS), we dynamically sampled FPS during training to achieve a more evenly distributed representation of FPS within the training dataset. Additionally, for videos exceeding half an hour in length, we specifically constructed a set of long video captions by synthesizing multi-frame captions through a targeted synthesis pipeline. Regarding video grounding data, we formulated timestamps in both second-based formats and hour-minute-second-frame (hmsf) formats, ensuring that the model can accurately understand and output time in various formats.
**视频数据** 训练时动态采样 FPS, 让训练集帧率分布更匀. 超过半小时的长视频, 用定向合成管线做多帧 caption, 专构长视频描述集. 视频 grounding 的时间戳同时用秒制与时-分-秒-帧 (hmsf) 格式, 让模型能理解并输出多种时间写法.

**Agent Data** We enhance the perception and decision-making abilities to build the agent capabilities of Qwen2.5-VL. For perception, we collect screenshots on mobile, web, and desktop platforms. A synthetic data engine is used to generate screenshot captions and UI element grounding annotations. The caption task helps Qwen2.5-VL understand the graphic interface, while the grounding task helps it align the appearance and function of elements. For decision-making, we first unify the operations across mobile, web, and desktop platforms into a function call format with a shared action space. A set of annotated multi-step trajectories collected from open-source data and synthesized by agent framework (Wang et al., 2025; 2024b;c) on virtual environments are reformatted into a function format. We further generate a
**Agent 数据** 从感知与决策两侧建 agent 能力. 感知侧采集手机, 网页, 桌面截图, 用合成引擎生成截图 caption 与 UI 元素 grounding; caption 帮模型懂界面, grounding 帮外观与功能对齐. 决策侧先把三端操作统一成共享动作空间的 function call; 开源轨迹与虚拟环境中 agent 框架合成的多步轨迹, 再改写成函数格式. 我们进一步为每一步生成

<!-- page 8 of 23 -->

reasoning process for each step through human and model annotators (Xu et al., 2024). Specifically, given a ground-truth operation, we highlight it on the screenshot. Then, we provide the global query, along with screenshots from before and after this operation, to the annotators and require them to write reasoning content to explain the intention behind this operation. A model-based filter is used to screen out low-quality reasoning content. Such reasoning content prevents Qwen2.5-VL from overfitting to the ground-truth operations and makes it more robust in real-world scenarios.
推理过程 (人与模型标注). 具体做法: 在截图上高亮 ground-truth 操作, 把全局查询与操作前后截图交给标注者, 写清该步意图; 再用模型过滤低质推理. 这类推理内容减轻对 ground-truth 操作的过拟合, 真实场景更稳.

| Stages | Visual Pre-Training | Multimodal Pre-Training | Long-Context Pre-Training |
| --- | --- | --- | --- |
| Data | Image Caption Knowledge OCR | +Pure text Interleaved Data VQA, Video Grounding, Agent | +Long Video Long Agent Long Document |
| Tokens | 1.5T | 2T | 0.6T |

> **看表:** 表 2 第一阶段只训 ViT, 第二阶段才 ViT & LLM 全开, 为什么不从一开始就解冻语言模型?
> 2.2.2 写 phase 1 「only the Vision Transformer (ViT) is trained to improve its alignment with the language model」, 数据是 caption / visual knowledge / OCR; phase 2 才 unfreeze all, 加入交错, VQA, agent, 视频与纯文本. 先把从零训的 ViT 接到已有 Qwen2.5 表示空间, 再联合改 LLM, 避免一上来全域更新冲掉语言芯.

| Sequence length | 8192 | 8192 | 32768 |
| Training | ViT | ViT &amp; LLM | ViT &amp; LLM |

Table 2: Training data volume and composition across different stages.
表 2: 各阶段训练数据量与构成.

#### 2.2.2 Training Recipe 训练配方

We trained a Vision Transformer (ViT) from scratch using DataComp (Gadre et al., 2023) and some in-house datasets as the initialization for the vision encoder, while leveraging the pre-trained Qwen2.5 large language model (LLM) (Yang et al., 2024a) as the initialization for the LLM component. As shown in Table 2, the pre-training process is divided into three distinct phases, each employing different data configurations and training strategies to progressively enhance the model’s capabilities.
ViT 用 DataComp 与内部数据从零训起; LLM 用预训练 Qwen2.5. 如表 2, 预训练分三阶段, 数据与策略递进.

In the first phase, only the Vision Transformer (ViT) is trained to improve its alignment with the language model, laying a solid foundation for multimodal understanding. The primary data sources during this phase include image captions, visual knowledge, and OCR data. These datasets are carefully selected to foster ViT’s ability to extract meaningful visual representations that can be effectively integrated with textual information.
第一阶段只训 ViT, 加强与语言模型对齐; 主数据为图像描述, 视觉知识与 OCR.

In the second phase, all model parameters are unfrozen, and the model is trained on a diverse set of multimodal image data to enhance its capacity to process complex visual information. This phase introduces more intricate and reasoning-intensive datasets, such as interleaved data, multi-task learning datasets, visual question answering (VQA), multimodal mathematics, agent-based tasks, video understanding, and pure-text datasets. These datasets strengthen the model’s ability to establish deeper connections between visual and linguistic modalities, enabling it to handle increasingly sophisticated tasks.
第二阶段解冻全部参数, 加入交错数据, 多任务, VQA, 多模态数学, agent, 视频与纯文本等, 加深视觉-语言联结.

In the third phase, to further enhance the model’s reasoning capabilities over longer sequences, video, and agent-based data are incorporated, alongside an increase in sequence length. This allows the model to tackle more advanced and intricate multimodal tasks with greater precision. By extending the sequence length, the model gains the ability to process extended contexts, which is particularly beneficial for tasks requiring long-range dependencies and complex reasoning.
第三阶段再纳入视频与 agent 数据, 并加长序列, 强化长程依赖与复杂多模态推理.

To address the challenges posed by varying image sizes and text lengths, which can lead to imbalanced computational loads during training, we adopted a strategy to optimize training efficiency. The primary computational costs arise from the LLM and the vision encoder. Given that the vision encoder has relatively fewer parameters and that we introduced window attention to further reduce its computational demands, we focused on balancing the computational load of the LLM across different GPUs. Specifically, we dynamically packed data samples based on their corresponding input sequence lengths to the LLM, ensuring consistent computational loads. In the first and second phases, data were uniformly packed to a sequence length of 8,192, while in the third phase, the sequence length was increased to 32,768 to accommodate the model’s enhanced capacity for handling longer sequences.
为缓解图尺寸与文本长度导致的算力不均: 视觉侧参数较少且有窗口注意力, 重点按送入 LLM 的序列长动态打包样本. 一, 二阶段统一打包到 8192; 三阶段升到 32768.

### 2.3 Post-training 后训练

The post-training alignment framework of Qwen2.5-VL employs a dual-stage optimization paradigm comprising Supervised Fine-Tuning (SFT) and Direct Preference Optimization (DPO) (Rafailov et al., 2023). This hierarchical alignment strategy synergizes parameter-efficient domain adaptation with human preference distillation, addressing both representational grounding and behavioral refinement through distinct optimization objectives.
后训练对齐采用双阶段: **SFT**(Supervised Fine-Tuning, 监督微调)与 **DPO**(Direct Preference Optimization, 直接偏好优化): 前者做表征落地与任务适配, 后者蒸馏人类偏好, 细化行为.

<!-- page 9 of 23 -->

Supervised Fine-Tuning (SFT) aims to bridge the gap between pretrained representations and downstream task requirements through targeted instruction optimization. During this phase, we employ the ChatML format (Openai, 2024) to structure instruction-following data, deliberately diverging from the pretraining data schema while maintaining architectural consistency with Qwen2-VL (Wang et al., 2024e). This format transition enables three critical adaptations: 1) Explicit dialogue role tagging for multimodal turntaking, 2) Structured injection of visual embeddings alongside textual instructions, and 3) Preservation of cross-modal positional relationships through format-aware packing. By exposing the model to curated multimodal instruction-response pairs under this enhanced schema, SFT enables efficient knowledge transfer while maintaining the integrity of pre-trained features.
SFT 用 **ChatML** 组织指令数据(相对预训练 schema 有意不同, 但与 Qwen2-VL 架构一致), 实现: (1)多模态轮次显式角色标注; (2)视觉嵌入与文本指令结构化注入; (3)格式感知打包以保留跨模态位置关系.

#### 2.3.1 Instruction Data 指令数据

The Supervised Fine-Tuning (SFT) phase employs a meticulously curated dataset designed to enhance the model’s instruction-following capabilities across diverse modalities. This dataset comprises approximately 2 million entries, evenly distributed between pure text data (50%) and multimodal data (50%), which includes image-text and video-text combinations. The inclusion of multimodal data enables the model to process complex inputs effectively. Notably, although pure text and multimodal entries are equally represented, multimodal entries consume significantly more tokens and computational resources during training due to the embedded visual and temporal information. The dataset is primarily composed of Chinese and English data, with supplementary multilingual entries to support broader linguistic diversity.
SFT 集约 200 万条, 纯文本与多模态各约一半(含图文, 视频-文本). 条数对半, 但多模态因视觉/时间信息更耗 token 与算力. 以中英为主, 并补多语条目.

> **拆开:** 纯文本与多模态条数各半, 算力也各半吗?
> 条数 50/50, 但多模态因视觉与时间信息吃更多 token 与算力, 报告明确说不算力均分.

The dataset is structured to reflect varying levels of dialogue complexity, including both single-turn and multi-turn interactions. These interactions are further contextualized by scenarios ranging from single-image inputs to multi-image sequences, thereby simulating realistic conversational dynamics. The query sources are primarily drawn from open-source repositories, with additional contributions from curated purchased datasets and online query data. This combination ensures broad coverage and enhances the representativeness of the dataset.
对话复杂度覆盖单轮/多轮, 单图/多图; 查询来自开源, 采购与线上查询, 保证覆盖面.

To address a wide range of application scenarios, the dataset includes specialized subsets for General Visual Question Answering (VQA), image captioning, mathematical problem-solving, coding tasks, and security-related queries. Additionally, dedicated datasets for Document and Optical Character Recognition (Doc and OCR), Grounding, Video Analysis, and Agent Interactions are constructed to enhance domain-specific proficiency. Detailed information regarding the data can be found in the relevant sections of the paper. This structured and diverse composition ensures that the SFT phase effectively aligns pre-trained representations with the nuanced demands of downstream multimodal tasks, fostering robust and contextually aware model performance.
专项子集含通用 VQA, 图像描述, 数学, 代码, 安全相关, 以及文档/OCR, Grounding, 视频分析, Agent 交互等, 使预训练表征对齐下游多模态需求.

#### 2.3.2 Data Filtering Pipeline 数据过滤流水线

The quality of training data is a critical factor influencing the performance of vision-language models. Open-source and synthetic datasets typically exhibit significant variability, often containing noisy, redundant, or low-quality samples. Therefore, rigorous data cleaning and filtering processes are essential to address these issues. Low-quality data can lead to suboptimal alignment between pretrained representations and downstream task requirements, thereby diminishing the model’s ability to effectively handle complex multimodal tasks. Consequently, ensuring high-quality data is paramount for achieving robust and reliable model performance.
训练数据质量直接影响表现; 开源与合成集噪声, 冗余与低质样本常见, 必须严格清洗过滤, 否则预训练表征与下游任务对不齐.

To address these challenges, we implement a two-stage data filtering pipeline designed to systematically enhance the quality of the Supervised Fine-Tuning (SFT) dataset. This pipeline comprises the following stages:
为此采用两阶段过滤流水线提升 SFT 数据质量:

**Stage 1: Domain-Specific Categorization** In the initial stage, we employ Qwen2-VL-Instag, a specialized classification model derived from Qwen2-VL-72B, to perform hierarchical categorization of questionanswer (QA) pairs. This model organizes QA pairs into eight primary domains, such as Coding and Planning, which are further divided into 30 fine-grained subcategories. For example, the primary domain Coding is subdivided into subcategories including Code\_Debugging, Code\_Generation, Code\_Translation, and Code\_Understanding. This hierarchical structure facilitates domain-aware and subdomain-aware filtering strategies, enabling the pipeline to optimize data-cleaning processes tailored to each category’s specific characteristics. Consequently, this enhances the quality and relevance of the supervised fine-tuning (SFT) dataset.
**阶段 1: 分域归类** 用由 Qwen2-VL-72B 衍生的专用分类模型 Qwen2-VL-Instag, 对问答对做层级归类: 8 个主域 (如 Coding, Planning), 再拆 30 个细类 (如 Code_Debugging, Code_Generation, Code_Translation, Code_Understanding). 分域/分细类过滤可按各类特点清洗, 抬高 SFT 数据质量与相关性.

**Stage 2: Domain-Tailored Filtering** The second stage involves domain-tailored filtering, which integrates both rule-based and model-based approaches to comprehensively enhance data quality. Given
**阶段 2: 分域定制过滤** 规则与模型两路并用, 全面抬数据质量. 鉴于

<!-- page 10 of 23 -->

the diverse nature of domains such as Document Processing, Optical Character Recognition (OCR), and Visual Grounding, each may necessitate unique filtering strategies. Below, we provide an overview of the general filtering strategies applied across these domains.
文档处理, OCR, 视觉 grounding 等领域性质各异, 过滤策略也可能不同. 下面概述跨域通用的过滤策略.
阶段 2: 按域过滤, 规则与模型结合; 文档, OCR, 视觉 grounding 等可有不同策略. 通用做法概览如下.

**Rule-Based Filtering** employs predefined heuristics to eliminate low-quality or problematic entries. Specifically, for datasets related to Document Processing, OCR, and Visual Grounding tasks, repetitive patterns are identified and removed to prevent distortion of the model’s learning process and ensure optimal performance. Additionally, entries containing incomplete, truncated, or improperly formatted responses—common in synthetic datasets and multimodal contexts—are excluded. To maintain relevance and uphold ethical standards, queries and answers that are unrelated or could potentially lead to harmful outputs are also discarded. This structured approach ensures that the dataset adheres to ethical guidelines and meets task-specific requirements.
**规则过滤** 用预定义启发式删低质或问题条目. 文档处理, OCR, 视觉 grounding 数据里识别并去掉重复模式, 以免扭曲学习; 不完整, 截断或格式坏的答复 (合成与多模态里常见) 也剔除. 无关或可能有害的问答一并丢弃, 以符合伦理与任务要求.

**Model-Based Filtering** further refines the dataset by leveraging reward models trained on the Qwen2.5- VL series. These models evaluate multimodal QA pairs across multiple dimensions. Queries are assessed for complexity and relevance, retaining only those examples that are appropriately challenging and contextually pertinent. Answers are evaluated based on correctness, completeness, clarity, relevance to the query, and helpfulness. In visual-grounded tasks, particular attention is given to verifying the accurate interpretation and utilization of visual information. This multi-dimensional scoring ensures that only high-quality data progresses to the SFT phase.
**模型过滤** 再用 Qwen2.5-VL 系列上训的奖励模型, 从多维评估多模态问答. 查询看复杂度与相关性, 只留难度合适, 语境贴切的例子; 答案看正确, 完整, 清晰, 相关与有用. 视觉落地任务特别核验是否正确理解并使用视觉信息. 多维打分后, 只有高质量样本进入 SFT.

#### 2.3.3 Rejection Sampling for Enhanced Reasoning 拒采样增强推理

To complement our structured data filtering pipeline, we employ rejection sampling as a strategy to refine the dataset and enhance the reasoning capabilities of the vision-language model (VLM). This approach is particularly critical for tasks requiring complex inference, such as mathematical problemsolving, code generation, and domain-specific visual question answering (VQA). Prior research has shown that incorporating Chain-of-Thought (CoT) Wei et al. (2022) reasoning significantly improves a model’s inferential performance. (DeepSeek-AI et al., 2024) Our post-training experiments confirm this, underscoring the importance of structured reasoning processes for achieving high-quality outcomes.
在结构化过滤之外, 用 **拒绝采样**(rejection sampling)精炼数据, 增强推理, 尤其数学, 代码与领域 VQA. 引入 **CoT**(Chain-of-Thought, CoT)可明显提升推断; 后训练实验也印证了结构化推理的重要性.

> **回看:** 拒采样保留的是最终答案对, 还是中间 CoT 步也要过视觉校验?
> 先按最终答案与 ground truth 匹配保留; 另用规则与模型过滤, 检查中间步是否真正用上视觉信息, 并丢掉语码混用, 过长, 重复.

The rejection sampling process begins with datasets enriched with ground truth annotations. These datasets are carefully curated to include tasks that demand multi-step reasoning, such as mathematical problem-solving, code generation, and domain-specific VQA. Using an intermediate version of the Qwen2.5-VL model, we evaluate the generated responses against the ground truth. Only samples where the model’s output matches the expected answers are retained, ensuring the dataset consists solely of high-quality, accurate examples.
流程: 在带真值标注, 需多步推理的数据上, 用中间版 Qwen2.5-VL 生成答案, 仅保留与真值匹配的样本.

To further improve data quality, we apply additional constraints to filter out undesirable outputs. Specifically, we exclude responses that exhibit code-switching, excessive length, or repetitive patterns. These criteria ensure clarity and coherence in the CoT reasoning process, which is crucial for downstream applications.
再过滤语码混用, 过长或重复模式的回复, 保证 CoT 清晰连贯.

A key challenge in applying CoT reasoning to vision-language models is their reliance on both textual and visual modalities. Intermediate reasoning steps may fail to adequately integrate visual information, either by ignoring relevant visual cues or misinterpreting them. To address this, we have developed rule-based and model-driven filtering strategies to validate the accuracy of intermediate reasoning steps. These mechanisms ensure that each step in the CoT process effectively integrates visual and textual modalities. Despite these efforts, achieving optimal modality alignment remains an ongoing challenge that requires further advancements.
难点在于中间推理步须真正融合视觉信息. 为此用规则与模型校验中间步; 模态对齐仍待继续改进.

The data generated through rejection sampling significantly enhances the model’s reasoning proficiency. By iteratively refining the dataset and removing low-quality or erroneous samples, we enable the model to learn from high-fidelity examples that emphasize accurate and coherent reasoning. This methodology not only strengthens the model’s ability to handle complex tasks but also lays the groundwork for future improvements in vision-language modeling.
拒采样得到的数据明显抬高推理能力. 迭代精炼并去掉低质或错误样本后, 模型从高保真, 强调准确连贯推理的例子里学习. 这不仅加强复杂任务, 也为后续视觉语言建模改进铺路.

#### 2.3.4 Training Recipe 训练配方

The post-training process for Qwen2.5-VL consists of two phases: Supervised Fine-Tuning (SFT) and Direct Preference Optimization (DPO), both with the Vision Transformer (ViT) parameters frozen. In the SFT phase, the model is fine-tuned on diverse multimodal data, including image-text pairs, video, and pure text, sourced from general VQA, Rejection Sampling, and specialized datasets such as Document and OCR, Grounding, Video, and Agent-related tasks. The DPO phase focuses exclusively on image-text and pure text data, utilizing preference data to align the model with human preferences, with each sample processed only once to ensure efficient optimization. This streamlined process enhances the model’s

<!-- page 11 of 23 -->

cross-modal reasoning and task-specific performance while maintaining alignment with user intent.
后训练两阶段均冻结 ViT. SFT 覆盖图文, 视频与纯文本 (通用 VQA, 拒绝采样, 以及文档/OCR, Grounding, 视频, Agent 等). DPO 只做图文与纯文本偏好对齐, 每条样本只过一遍. 整条流程抬升跨模态推理与任务表现, 同时保持与用户意图对齐.

> **核对:** 后训练冻 ViT, 那文档 OCR 与 grounding 还能继续长进视觉塔吗?
> SFT 与 DPO 阶段 ViT 冻结, 适配落在 LLM 与已对齐表征上; 视觉塔能力主要靠预训练三阶段灌入.

## 3 Experiments 实验

In this section, we first introduce the overall model and compare it with the current state-of-the-art (SoTA) models. Then, we evaluate the model’s performance across various sub-capabilities.
先与当前 **SoTA**(state-of-the-art)对比, 再分能力评测.

### 3.1 Comparison with the SOTA Models 与 SOTA 模型对比

Table 3: Performance of Qwen2.5-VL and State-of-the-art.
表 3: Qwen2.5-VL 与业界顶尖模型表现.

<table><tr><td>Datasets</td><td>Previous Open-source SoTA</td><td>Claude-3.5 Sonnet-0620</td><td>GPT-4o 0513</td><td>InternVL2.5 78B</td><td>Qwen2-VL 72B</td><td>Qwen2.5-VL 72B</td><td>Qwen2.5-VL 7B</td><td>Qwen2.5-VL 3B</td></tr><tr><td colspan="9">College-level Problems</td></tr><tr><td> $MMMU_{val}$ (Yue et al., 2023)</td><td>70.1 Chen et al. (2024d)</td><td>68.3</td><td>69.1</td><td>70.1</td><td>64.5</td><td>70.2</td><td>58.6</td><td>53.1</td></tr><tr><td> $MMMU-Pro_{overall}$ (Yue et al., 2024)</td><td>48.6 Chen et al. (2024d)</td><td>51.5</td><td>51.9</td><td>48.6</td><td>46.2</td><td>51.1</td><td>38.3</td><td>31.56</td></tr><tr><td colspan="9">Math</td></tr><tr><td> $MathVista_{mini}$ (Lu et al., 2024)</td><td>72.3 Chen et al. (2024d)</td><td>67.7</td><td>63.8</td><td>72.3</td><td>70.5</td><td>74.8</td><td>68.2</td><td>62.3</td></tr><tr><td> $MATH-Vision_{full}$ (Wang et al., 2024d)</td><td>32.2 Chen et al. (2024d)</td><td>-</td><td>30.4</td><td>32.2</td><td>25.9</td><td>38.1</td><td>25.1</td><td>21.2</td></tr><tr><td> $MathVerse_{mini}$ (Zhang et al., 2024c)</td><td>51.7 Chen et al. (2024d)</td><td>-</td><td>50.2</td><td>51.7</td><td>-</td><td>57.6</td><td>49.2</td><td>47.6</td></tr><tr><td colspan="9">General Visual Question Answering</td></tr><tr><td>MegaBench (Chen et al., 2024b)</td><td>47.4 MiniMax et al. (2025)</td><td>52.1</td><td>54.2</td><td>45.6</td><td>46.8</td><td>51.3</td><td>36.8</td><td>28.9</td></tr><tr><td> $MMBench-EN_{test}$ (Liu et al., 2023d)</td><td>88.3 Chen et al. (2024d)</td><td>82.6</td><td>83.4</td><td>88.3</td><td>86.9</td><td>88.6</td><td>83.5</td><td>79.1</td></tr><tr><td> $MMBench-CN_{test}$ (Liu et al., 2023d)</td><td>88.5 Chen et al. (2024d)</td><td>83.5</td><td>82.1</td><td>88.5</td><td>86.7</td><td>87.9</td><td>83.4</td><td>78.1</td></tr><tr><td> $MMBench-V1.1-EN_{test}$ (Liu et al., 2023d)</td><td>87.4 Chen et al. (2024d)</td><td>80.9</td><td>83.1</td><td>87.4</td><td>86.1</td><td>88.4</td><td>82.6</td><td>77.4</td></tr><tr><td>MMStar (Chen et al., 2024c)</td><td>69.5 Chen et al. (2024d)</td><td>65.1</td><td>64.7</td><td>69.5</td><td>68.3</td><td>70.8</td><td>63.9</td><td>55.9</td></tr><tr><td> $MME_{sum}$ (Fu et al., 2023)</td><td>2494 Chen et al. (2024d)</td><td>1920</td><td>2328</td><td>2494</td><td>2483</td><td>2448</td><td>2347</td><td>2157</td></tr><tr><td>MuirBench (Wang et al., 2024a)</td><td>63.5 Chen et al. (2024d)</td><td>-</td><td>68.0</td><td>63.5</td><td>-</td><td>70.7</td><td>59.6</td><td>47.7</td></tr><tr><td> $BLINK_{val}$ (Fu et al., 2024c)</td><td>63.8 Chen et al. (2024d)</td><td>-</td><td>68.0</td><td>63.8</td><td>-</td><td>64.4</td><td>56.4</td><td>47.6</td></tr><tr><td> $CRPE_{relation}$ (Wang et al., 2024h)</td><td>78.8 Chen et al. (2024d)</td><td>-</td><td>76.6</td><td>78.8</td><td>-</td><td>79.2</td><td>76.4</td><td>73.6</td></tr><tr><td> $HallBench_{avg}$ (Guan et al., 2023)</td><td>58.1 Wang et al. (2024f)</td><td>55.5</td><td>55.0</td><td>57.4</td><td>58.1</td><td>55.2</td><td>52.9</td><td>46.3</td></tr><tr><td>MTVQA (Tang et al., 2024)</td><td>31.9 Chen et al. (2024d)</td><td>25.7</td><td>27.8</td><td>31.9</td><td>30.9</td><td>31.7</td><td>29.2</td><td>24.8</td></tr><tr><td> $RealWorldQA_{avg}$ (X.AI, 2024)</td><td>78.7 Chen et al. (2024d)</td><td>60.1</td><td>75.4</td><td>78.7</td><td>77.8</td><td>75.7</td><td>68.5</td><td>65.4</td></tr><tr><td>MME-RealWorld $_{en}$ (Zhang et al., 2024f)</td><td>62.9 Chen et al. (2024d)</td><td>51.6</td><td>45.2</td><td>62.9</td><td>-</td><td>63.2</td><td>57.4</td><td>53.1</td></tr><tr><td> $MMVet_{turbo}$ (Yu et al., 2024)</td><td>74.0 Wang et al. (2024f)</td><td>70.1</td><td>69.1</td><td>72.3</td><td>74.0</td><td>76.2</td><td>67.1</td><td>61.8</td></tr><tr><td>MM-MT-Bench (Agrawal et al., 2024)</td><td>7.4 Agrawal et al. (2024)</td><td>7.5</td><td>7.72</td><td>-</td><td>6.59</td><td>7.6</td><td>6.3</td><td>5.7</td></tr></table>
The experimental section evaluates the performance of Qwen2.5-VL across a variety of datasets, comparing it with state-of-the-art models such as Claude-3.5-Sonnet-0620 (Anthropic, 2024a), GPT-4o-0513 (OpenAI, 2024), InternVL2.5 (Chen et al., 2024d), and different sizes of Qwen2-VL (Wang et al., 2024e). In college-level problems, Qwen2.5-VL-72B achieves a score of 70.2 on MMMU (Yue et al., 2023). For MMMU-Pro (Yue et al., 2024), Qwen2.5-VL-72B scores 51.1, surpassing the previous open-source state-of-the-art models and achieving performance comparable to GPT-4o.
实验对比 Claude-3.5-Sonnet-0620, GPT-4o-0513, InternVL2.5 与各档 Qwen2-VL. 高校题上, Qwen2.5-VL-72B 在 MMMU 得 70.2; MMMU-Pro 得 51.1, 超过此前开源 SoTA, 并接近 GPT-4o.

> **看表:** MMMU 70.2 相对 InternVL2.5-78B 的 70.1, 算超越还是持平?
> 表 3 里 72B 为 70.2, 前开源 SoTA 与 InternVL2.5 同为 70.1, 属于微幅领先/持平档, 正文也写 college-level 上达到可比.

In math-related tasks, Qwen2.5-VL-72B demonstrates strong capabilities. On MathVista (Lu et al., 2024), it achieves a score of 74.8, outperforming the previous open-source state-of-the-art score of 72.3. For MATH-Vision (Wang et al., 2024d), Qwen2.5-VL-72B scores 38.1, while MathVerse (Zhang et al., 2024c) achieves 57.6, both showing competitive results compared to other leading models.
数学上, MathVista 74.8(超此前开源 72.3); MATH-Vision 38.1, MathVerse 57.6, 均具竞争力.

For general visual question answering, Qwen2.5-VL-72B excels across multiple benchmarks. On MMbench-EN (Liu et al., 2023d), it achieves a score of 88.6, slightly surpassing the previous best score of 88.3. The model also performs well in MuirBench (Wang et al., 2024a) with a score of 70.7 and BLINK (Fu et al., 2024c) with 64.4. In the multilingual capability evaluation of MTVQA (Tang et al., 2024), Qwen2.5-VL-72B achieves a score of 31.7, showcasing its powerful multilingual text recognition abilities. In subjective evaluations such as MMVet (Yu et al., 2024) and MM-MT-Bench (Agrawal et al., 2024), Qwen2.5-VL-72B scores 76.2 and 7.6, respectively, demonstrating excellent natural conversational experience and user satisfaction.
通用 VQA: MMBench-EN 88.6(略超此前 88.3); MuirBench 70.7, BLINK 64.4; 多语 MTVQA 31.7; 主观侧 MMVet 76.2, MM-MT-Bench 7.6.

### 3.2 Performance on Pure Text Tasks 纯文本任务表现

To critically evaluate the performance of instruction-tuned models on pure text tasks, as illustrated in Table 4, we selected several representative benchmarks to assess the model’s capabilities across a variety of domains, including general tasks (Wang et al., 2024j; Gema et al., 2024; White et al., 2024), mathematics and science tasks (Rein et al., 2023; Hendrycks et al., 2021; Cobbe et al., 2021), coding tasks (Chen et al., 2021; Cassano et al., 2023), and alignment task (Zhou et al., 2023). We compared Qwen2.5-VL with several large language models (LLMs) of similar size. The results demonstrate that Qwen2.5-VL not only achieves state-of-the-art (SoTA) performance on multimodal tasks but also exhibits leading performance on pure text tasks, showcasing its versatility and robustness across diverse evaluation criteria.
纯文本侧(表 4)覆盖通用, 数理, 代码与对齐等基准, 并与相近规模 LLM 对比. 结果显示: 多模态 SoTA 之外, 纯文本也居前, 说明能力面宽, 稳健.

<!-- page 12 of 23 -->

Table 4: Performance on pure text tasks of the 70B+ Instruct models and Qwen2.5-VL.
表 4: 70B+ Instruct 与 Qwen2.5-VL 的纯文本任务表现.

<table><tr><td>Datasets</td><td>Llama-3.1-70B</td><td>Llama-3.1-405B</td><td>Qwen2-72B</td><td>Qwen2.5-72B</td><td>Qwen2.5-VL-72B</td></tr><tr><td colspan="6">General Tasks</td></tr><tr><td>MMLU-Pro</td><td>66.4</td><td>73.3</td><td>64.4</td><td>71.1</td><td>71.2</td></tr><tr><td>MMLU-redux</td><td>83.0</td><td>86.2</td><td>81.6</td><td>86.8</td><td>85.9</td></tr><tr><td>LiveBench-0831</td><td>46.6</td><td>53.2</td><td>41.5</td><td>52.3</td><td>57.0</td></tr><tr><td colspan="6">Mathematics &amp; Science Tasks</td></tr><tr><td>GPQA</td><td>46.7</td><td>51.1</td><td>42.4</td><td>49.0</td><td>49.0</td></tr><tr><td>MATH</td><td>68.0</td><td>73.8</td><td>69.0</td><td>83.1</td><td>83.0</td></tr><tr><td>GSM8K</td><td>95.1</td><td>96.8</td><td>93.2</td><td>95.8</td><td>95.3</td></tr><tr><td colspan="6">Coding Tasks</td></tr><tr><td>HumanEval</td><td>80.5</td><td>89.0</td><td>86.0</td><td>86.6</td><td>87.8</td></tr><tr><td>MultiPL-E</td><td>68.2</td><td>73.5</td><td>69.2</td><td>75.1</td><td>79.5</td></tr><tr><td colspan="6">Alignment Tasks</td></tr><tr><td>IFEval</td><td>83.6</td><td>86.0</td><td>77.6</td><td>84.1</td><td>86.3</td></tr></table>
### 3.3 Quantitative Results 定量结果

#### 3.3.1 General Visual Question Answering 通用视觉问答

To comprehensively evaluate the model’s capabilities in general visual question answering (VQA) and dialogue, we conducted extensive experiments across a diverse range of datasets. As illustrated in Table 3, Qwen2.5-VL demonstrates state-of-the-art performance in various VQA tasks, subjective evaluations, multilingual scenarios, and multi-image questions. Specifically, it excels on benchmark datasets such as MMBench series (Liu et al., 2023d), MMStar (Chen et al., 2024c), MME (Fu et al., 2023), MuirBench (Wang et al., 2024a), BLINK(Fu et al., 2024c), CRPE (Wang et al., 2024h), HallBench (Guan et al., 2023), MTVQA (Tang et al., 2024), MME-RealWorld (Zhang et al., 2024f), MMVet (Yu et al., 2024), and MM-MT-Bench (Agrawal et al., 2024).
为全面评估通用 VQA 与对话能力, 我们在多样数据集上做了广泛实验. 如表 3 所示, Qwen2.5-VL 在多种 VQA, 主观评测, 多语场景与多图问题上表现居前, 并在 MMBench 系列, MMStar, MME, MuirBench, BLINK, CRPE, HallBench, MTVQA, MME-RealWorld, MMVet, MM-MT-Bench 等基准上表现突出.

In the domain of visual detail comprehension and reasoning, Qwen2.5-VL-72B achieves an accuracy of 88.4% on the MMBench-EN-V1.1 dataset, surpassing previous state-of-the-art models such as InternVL2.5 (78B) and Claude-3.5 Sonnet-0620. Similarly, on the MMStar dataset, Qwen2.5-VL attains a score of 70.8%, outperforming other leading models in this benchmark. These results underscore the model’s robustness and adaptability across diverse linguistic contexts.
细节理解与推理: MMBench-EN-V1.1 88.4%, 超 InternVL2.5-78B 与 Claude-3.5 Sonnet-0620; MMStar 70.8%.

Furthermore, in high-resolution real-world scenarios, specifically on the MME-RealWorld benchmark, Qwen2.5-VL demonstrates state-of-the-art performance with a score of 63.2, showcasing its broad adaptability to realistic environments. Additionally, in multi-image understanding tasks evaluated on the MuirBench dataset, Qwen2.5-VL achieves a leading score of 70.7, further highlighting its superior generalization capabilities. Collectively, these results illustrate the strong versatility and effectiveness of Qwen2.5-VL in addressing general-purpose visual question answering (VQA) tasks across various scenarios.
高清真实场景 MME-RealWorld 63.2; 多图 MuirBench 70.7, 泛化强.

Notably, even the smaller-scale versions of Qwen2.5-VL, specifically Qwen2.5-VL-7B and Qwen2.5-VL-3B, exhibit highly competitive performance. For instance, on the MMStar dataset, Qwen2.5-VL-7B achieves 63.9%, while Qwen2.5-VL-3B scores 55.9%. This demonstrates that Qwen2.5-VL’s architecture is not only powerful but also scalable, maintaining strong performance even with fewer parameters.
更小档也有竞争力: MMStar 上 7B 63.9%, 3B 55.9%, 说明架构可随参数缩放仍保持强度.

#### 3.3.2 Document Understanding and OCR 文档理解与 OCR

We evaluated our models across a diverse range of OCR, chart, and document understanding benchmarks. Table 5 demonstrates the performance comparison between Qwen2.5-VL models and toptier models on following OCR-related benchmarks: AI2D (Kembhavi et al., 2016), TextVQA (Singh et al., 2019), DocVQA (Mathew et al., 2021b), InfoVQA (Mathew et al., 2021a), ChartQA (Masry et al., 2022), CharXiv (Wang et al., 2024k), SEED-Bench-2-Plus (Li et al., 2024b), OCRBench (Liu et al., 2023e), OCRBench\_v2 (Fu et al., 2024b), CC-OCR (Yang et al., 2024b), OmniDocBench (Ouyang et al., 2024), VCR (Zhang et al., 2024e).

For OCR-related parsing benchmarks on element parsing for multi-scene, multilingual, and various built-in (handwriting, tables, charts, chemical formulas, and mathematical expressions) documents,

<!-- page 13 of 23 -->

as CC-OCR and OmniDocBench, Qwen2.5-VL-72B model sets the new state-of-the-art due to curated training data and excellent capability of LLM models.
解析类 (CC-OCR, OmniDocBench 等) 上, 凭策展数据与 LLM 能力, Qwen2.5-VL-72B 刷新 SoTA.

For OCR-related understanding benchmarks for scene text, chart, diagram and document, Qwen2.5-VL models achieve impressive performance with good understanding abilities. Notably, on composite OCR-related understanding benchmarks as OCRBench, InfoVQA which focusing on infographics, and SEED-Bench-2-Plus covering text-rich scenarios including charts, maps, and webs, Qwen2.5-VL-72B achieves remarkable results, significantly outperforming strong competitors such as InternVL2.5-78B.
理解类(场景文字, 图表, 图示与文档)同样强: OCRBench, InfoVQA, SEED-Bench-2-Plus 等上明显超过 InternVL2.5-78B 等强对手.

Furthermore, for OCR-related comprehensive benchmarks as OCRBench\_v2 including a wide range of OCR-related parsing and understanding tasks, top performance is also achieved by Qwen2.5-VL models, largely exceeding best model Gemini 1.5-Pro by 9.6% and 20.6% for English and Chinese track respectively.
综合基准 OCRBench_v2 上亦居前, 英/中赛道相对 Gemini 1.5-Pro 约高 9.6% / 20.6%.

Table 5: Performance of Qwen2.5-VL and other models on OCR, chart, and document understanding benchmarks.
表 5: Qwen2.5-VL 与其他模型在 OCR, 图表与文档理解基准上的表现.

<table><tr><td>Datasets</td><td>Claude-3.5 Sonnet</td><td>Gemini 1.5 Pro</td><td>GPT 4o</td><td>InternVL2.5 78B</td><td>Qwen2.5-VL 72B</td><td>Qwen2.5-VL 7B</td><td>Qwen2.5-VL 3B</td></tr><tr><td colspan="8">OCR-related Parsing Tasks</td></tr><tr><td>CC-OCR</td><td>62.5</td><td>73.0</td><td>66.9</td><td>64.7</td><td>79.8</td><td>77.8</td><td>74.5</td></tr><tr><td>OmniDocBenchedit en/zh↓</td><td>0.330/0.381</td><td>0.230/0.281</td><td>0.265/0.435</td><td>0.275/0.324</td><td>0.226/0.324</td><td>0.308/0.398</td><td>0.409/0.543</td></tr><tr><td colspan="8">OCR-related Understanding Tasks</td></tr><tr><td>AI2Dw.M.</td><td>81.2</td><td>88.4</td><td>84.6</td><td>89.1</td><td>88.7</td><td>83.9</td><td>81.6</td></tr><tr><td>TextVQAval</td><td>76.5</td><td>78.8</td><td>77.4</td><td>83.4</td><td>83.5</td><td>84.9</td><td>79.3</td></tr><tr><td>DocVQAtest</td><td>95.2</td><td>93.1</td><td>91.1</td><td>95.1</td><td>96.4</td><td>95.7</td><td>93.9</td></tr><tr><td>InfoVQAtest</td><td>74.3</td><td>81.0</td><td>80.7</td><td>84.1</td><td>87.3</td><td>82.6</td><td>77.1</td></tr><tr><td>ChartQAtest Avg.</td><td>90.8</td><td>87.2</td><td>86.7</td><td>88.3</td><td>89.5</td><td>87.3</td><td>84.0</td></tr><tr><td>CharXivRQ/DQ</td><td>60.2/84.3</td><td>43.3/72.0</td><td>47.1/84.5</td><td>42.4/82.3</td><td>49.7/87.4</td><td>42.5/73.9</td><td>31.3/58.6</td></tr><tr><td>SEED-Bench-2-Plus</td><td>71.7</td><td>70.8</td><td>72.0</td><td>71.3</td><td>73.0</td><td>70.4</td><td>67.6</td></tr><tr><td>OCRBench</td><td>788</td><td>754</td><td>736</td><td>854</td><td>885</td><td>864</td><td>797</td></tr><tr><td>VCREn-Hard-EM</td><td>41.7</td><td>28.1</td><td>73.2</td><td>-</td><td>79.8</td><td>80.5</td><td>37.5</td></tr><tr><td colspan="8">OCR-related Comprehensive Tasks</td></tr><tr><td>OCRBench_v2en/zh</td><td>45.2/39.6</td><td>51.9/43.1</td><td>46.5/32.2</td><td>49.8/52.1</td><td>61.5/63.7</td><td>56.3/57.2</td><td>54.3/52.1</td></tr></table>
#### 3.3.3 Spatial Understanding 空间理解

Understanding spatial relationships is crucial for developing AI models that can interpret and interact with the world as humans do. In Large Vision-Language Models, visual grounding allows for the precise localization and identification of specific objects, regions, or elements within an image based on natural language queries or descriptions. This capability transcends traditional object detection by establishing a semantic relationship between visual content and linguistic context, facilitating more nuanced and contextually aware visual reasoning. We evaluated Qwen2.5-VL’s grounding capabilities on the referring expression comprehension benchmarks (Kazemzadeh et al., 2014; Mao et al., 2016), object detection in the wild (Li et al., 2022b), self-curated point grounding benchmark, and CountBench (Paiss et al., 2023).
空间关系理解是人机式交互的基础. 视觉 grounding 按自然语言查询精确定位物体/区域, 超越传统检测, 建立视觉-语言语义联系. 评测含指代表达理解, 野外目标检测, 自建点 grounding 与 CountBench.

We compare Qwen2.5-VL’s visual grounding capabilities with other leading LVLMs including Gemini, Grounding-DINO (Liu et al., 2023c), Molmo (Deitke et al., 2024), and InternVL2.5.
我们把 Qwen2.5-VL 的视觉 grounding 与 Gemini, Grounding-DINO, Molmo, InternVL2.5 等领先 LVLM 对照.

Qwen2.5-VL achieves leading performance across different benchmarks from box-grounding, and pointgrounding to counting. By equipping Qwen2.5-VL with both box and point-grounding capability, it is able to understand, locate, and reason on the very details of certain parts of an image. For open-vocabulary object detection, Qwen2.5-VL achieves a good performance of 43.1 mAP on ODinW-13, surpassing most LVLMs and quickly narrowing the gap between generalist models and specialist models. In addition, Qwen2.5-VL unlocks the point-based grounding ability so that it could precisely locate the very details of a certain object, which was difficult to represent by a bounding box in the past. Qwen2.5- VL’s counting ability also makes great progress, achieving a leading accuracy of 93.6 on CountBench with Qwen2.5-VL-72B using a “detect then count”-style prompt.
框 grounding, 点 grounding 到计数均居前. 开放词汇检测 ODinW-13 上 43.1 mAP, 缩小通才与专才差距; 点 grounding 可标出难用框表示的细节; CountBench 上 72B 用「先检测再计数」式提示达 93.6.

#### 3.3.4 Video Understanding and Grounding 视频理解与 grounding

We assessed our models across a diverse range of video understanding and grounding tasks, utilizing benchmarks that include videos ranging from a few seconds to several hours in length. Table 8 demonstrates the performance comparison between Qwen2.5-VL models and top-tier proprietary models on the following video benchmarks: Video-MME (Fu et al., 2024a), Video-MMMU (Hu et al., 2025), MMVU (Zhao
视频理解与 grounding 覆盖数秒到数小时; 表 8 对比多家闭源. 长视频问答 LVBench, MLVU 上 72B 明显超过 GPT-4o 等.

<!-- page 14 of 23 -->

Table 6: Performance of Qwen2.5-VL and other models on grounding.
表 6: Qwen2.5-VL 与其他模型在 grounding 上的表现.

| Datasets | Gemini 1.5 Pro | Grounding DINO | Molmo 72B | InternVL2.5 78B | Qwen2.5-VL 72B | Qwen2.5-VL 7B | Qwen2.5-VL 3B |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Refcoco$_{val}$ | 73.2 | 90.6 | - | 93.7 | 92.7 | 90.0 | 89.1 |
| Refcoco$_{testA}$ | 72.9 | 93.2 | - | 95.6 | 94.6 | 92.5 | 91.7 |
| Refcoco$_{testB}$ | 74.6 | 88.2 | - | 92.5 | 89.7 | 85.4 | 84.0 |
| Refcoco$_{+val}$ | 62.5 | 88.2 | - | 90.4 | 88.9 | 84.2 | 82.4 |
| Refcoco$_{+testA}$ | 63.9 | 89.0 | - | 94.7 | 92.2 | 89.1 | 88.0 |
| Refcoco$_{+testB}$ | 65.0 | 75.9 | - | 86.9 | 83.7 | 76.9 | 74.1 |
| Refcocog$_{val}$ | 75.2 | 86.1 | - | 92.7 | 89.9 | 87.2 | 85.2 |
| Refcocog$_{test}$ | 76.2 | 87.0 | - | 92.2 | 90.3 | 87.2 | 85.7 |
| ODinW | 36.7 | 55.0 | - | 31.7 | 43.1 | 37.3 | 37.5 |
| PointGrounding | - | - | 69.2 | - | 67.5 | 67.3 | 58.3 |

Table 7: Performance of Qwen2.5-VL and other models on counting.
表 7: Qwen2.5-VL 与其他模型在计数上的表现.

| Datasets | Gemini 1.5-Pro | GPT-4o | Claude-3.5 Sonnet | Molmo-72b | InternVL2.5-78B | Qwen2.5-VL-72B |
| --- | --- | --- | --- | --- | --- | --- |
| CountBench | 85.5 | 87.9 | 89.7 | 91.2 | 72.1 | 93.6 |

et al., 2025), MVBench (Li et al., 2024d), MMBench-Video (Fang et al., 2024), LongVideoBench (Wu et al., 2024a), EgoSchema (Mangalam et al., 2023), PerceptionTest (Patraucean et al., 2024), MLVU (Zhou et al., 2024), LVBench (Wang et al., 2024g), TempCompass (Liu et al., 2024c) and Charades-STA (Gao et al., 2017). Notably, on LVBench and MLVU, which evaluate long-form video understanding capabilities through question-answering tasks, Qwen2.5-VL-72B achieves remarkable results, significantly outperforming strong competitors such as GPT-4o.

> **看表:** Charades-STA 的 mIoU 50.9 相对 GPT-4o 的 35.7, 增益主要归功于同步 MRoPE 吗?
> 正文把时间敏感视频理解 (时间戳引用, temporal grounding, 稠密描述等) 与提出的 synchronized MRoPE 联系起来; Charades-STA 是事件时间定位榜, 72B 拿到 50.9 mIoU.

等. 在以问答评估长视频理解的 LVBench 与 MLVU 上, Qwen2.5-VL-72B 成绩突出, 明显超过 GPT-4o 等强对手.

By utilizing the proposed synchronized MRoPE, Qwen2.5-VL enhances its capabilities in time-sensitive video understanding, featuring improved timestamp referencing, temporal grounding, dense captioning, and additional functionalities. On the Charades-STA dataset, which assesses the capability to accurately localize events or activities with precise timestamps, Qwen2.5-VL-72B achieves an impressive mIoU score of 50.9, thereby surpassing the performance of GPT-4o. For all evaluated benchmarks, we capped the maximum number of frames analyzed per video at 768, with the total number of video tokens not exceeding 24,576.
同步 MRoPE 强化时间敏感的视频理解(时间戳引用, 时间 grounding, 稠密字幕等). Charades-STA 上 72B 的 mIoU 50.9, 超过 GPT-4o. 评测时每视频最多 768 帧, 视频 token 上限 24576.

> **停一下:** 768 帧与 24576 video token 上限, 和两帧成组怎么换算?
> 评估时每视频最多 768 帧, 视频 token 总数不超过 24576. 两帧成组会再压缩视觉 token; 具体每帧 token 还受分辨率与 Merger 影响.

Table 8: Performance of Qwen2.5-VL and other models on video benchmarks.
表 8: Qwen2.5-VL 与其他模型在视频基准上的表现.

<table><tr><td>Datasets</td><td>Gemini 1.5-Pro</td><td>GPT-4o</td><td>Qwen2.5-VL-72B</td><td>Qwen2.5-VL-7B</td><td>Qwen2.5-VL-3B</td></tr><tr><td colspan="6">Video Understanding Tasks</td></tr><tr><td> $Video-MME_{w/o sub.}$ </td><td>75.0</td><td>71.9</td><td>73.3</td><td>65.1</td><td>61.5</td></tr><tr><td> $Video-MME_{w sub.}$ </td><td>81.3</td><td>77.2</td><td>79.1</td><td>71.6</td><td>67.6</td></tr><tr><td>Video-MMMU</td><td>53.9</td><td>61.2</td><td>60.2</td><td>47.4</td><td>-</td></tr><tr><td> $MMVU_{val}$ </td><td>65.4</td><td>67.4</td><td>62.9</td><td>50.1</td><td>-</td></tr><tr><td>MVBench</td><td>60.5</td><td>64.6</td><td>70.4</td><td>69.6</td><td>67.0</td></tr><tr><td>MMBench-Video</td><td>1.30</td><td>1.63</td><td>2.02</td><td>1.79</td><td>1.63</td></tr><tr><td> $LongVideoBench_{val}$ </td><td>64.0</td><td>66.7</td><td>60.7</td><td>56.0</td><td>54.2</td></tr><tr><td>LVBench</td><td>33.1</td><td>30.8</td><td>47.3</td><td>45.3</td><td>43.3</td></tr><tr><td> $EgoSchema_{test}$ </td><td>71.2</td><td>72.2</td><td>76.2</td><td>65.0</td><td>64.8</td></tr><tr><td> $PerceptionTest_{test}$ </td><td>-</td><td>-</td><td>73.2</td><td>70.5</td><td>66.9</td></tr><tr><td> $MLVU_{M-Avg}$ </td><td>-</td><td>64.6</td><td>74.6</td><td>70.2</td><td>68.2</td></tr><tr><td> $TempCompass_{Avg}$ </td><td>67.1</td><td>73.8</td><td>74.8</td><td>71.7</td><td>64.4</td></tr><tr><td colspan="6">Video Grounding Tasks</td></tr><tr><td> $Charades-STA_{mIoU}$ </td><td>-</td><td>35.7</td><td>50.9</td><td>43.6</td><td>38.8</td></tr></table>
#### 3.3.5 Agent Agent

Agent capabilities within multimodal models are crucial for enabling these models to effectively interact with real-world devices. We assess the agent capabilities of Qwen2.5-VL through various aspects. The UI
多模态模型的 agent 能力, 是它们能否有效操控真实设备的关键. 我们从多个侧面评估 Qwen2.5-VL 的 agent 能力. UI

<!-- page 15 of 23 -->

elements grounding is evaluated by ScreenSpot (Cheng et al., 2024) and ScreenSpot Pro (Li et al., 2025a). Offline evaluations are conducted on Android Control (Li et al., 2024f), while online evaluations are performed on platforms including AndroidWorld (Rawles et al., 2024), MobileMiniWob++ (Rawles et al., 2024), and OSWorld (Xie et al., 2025). We compare the performance of Qwen2.5-VL-72B againsts other prominent models, such as GPT-4o (OpenAI, 2024), Gemini 2.0 (Deepmind, 2024), Claude (Anthropic, 2024b), Aguvis-72B (Xu et al., 2024), and Qwen2-VL-72B (Wang et al., 2024e). The results are demonstrated in Table 9.
元素 grounding 用 ScreenSpot 与 ScreenSpot Pro 评估. 离线评测走 Android Control; 在线评测含 AndroidWorld, MobileMiniWob++, OSWorld. 对照 GPT-4o, Gemini 2.0, Claude, Aguvis-72B, Qwen2-VL-72B 等, 结果见表 9.

Table 9: Performance of Qwen2.5-VL and other models on GUI Agent benchmarks.
表 9: Qwen2.5-VL 与其他模型在 GUI Agent 基准上的表现.

| Benchmarks | GPT-4o | Gemini 2.0 | Claude | Aguvis-72B | Qwen2-VL-72B | Qwen2.5-VL-72B |
| --- | --- | --- | --- | --- | --- | --- |
| ScreenSpot | 18.1 | 84.0 | 83.0 | 89.2 | - | 87.1 |
| ScreenSpot Pro | - | - | 17.1 | 23.6 | 1.6 | 43.6 |
| Android Control $High_{EM}$ | 20.8 | 28.5 | 12.5 | 66.4 | 59.1 | 67.36 |
| Android Control $Low_{EM}$ | 19.4 | 60.2 | 19.4 | 84.4 | 59.2 | 93.7 |
| $AndroidWorld_{SR}$ | 34.5% (SoM) | 26% (SoM) | 27.9% | 26.1% | 6% (SoM) | 35% |
| MobileMiniWob++$_{SR}$ | 61% | 42% (SoM) | 61% (SoM) | 66% | 50% (SoM) | 68% |
| OSWorld | 5.03 | 4.70 | 14.90 | 10.26 | 2.42 | 8.83 |

The performance of Qwen2.5-VL-72B demonstrates exceptional advancements across GUI grounding benchmarks. It achieves 87.1% accuracy on ScreenSpot, competing strongly with Gemini 2.0 (84.0%) and Claude (83.0%), while notably setting a new standard on ScreenSpot Pro with 43.6% accuracy - far surpassing both Aguvis-72B (23.6%) and its foundation Qwen2-VL-72B (1.6%). Leveraging these superior grounding capabilities, Qwen2.5-VL-72B significantly outperforms baselines across all offline evaluation benchmarks with a large gap. In online evaluation, some baselines have difficulty completing tasks due to limited grounding capabilities. Thus, we apply the Set-of-Mark (SoM) to the inputs of these models. The results show that Qwen2.5-VL-72B can outperform the baselines on AndroidWorld and MobileMiniWob++ and achieve comparable performance on OSWorld in online evaluation without auxiliary marks. This observation suggests that Qwen2.5-VL-72B is able to function as an agent in real and dynamic environments.

> **对一下:** ScreenSpot Pro 从 Qwen2-VL-72B 的 1.6% 跳到 43.6%, 是否主要靠 GUI grounding 数据?
> 报告把 ScreenSpot/Pro 与后续 offline/online agent 增益写成 grounding 变强后的连锁结果; 相对 Qwen2-VL-72B 的 1.6%, 本代 43.6% 是数量级跳变, 并强调线上评测可不用 SoM.

GUI grounding 大幅前进: ScreenSpot 87.1%; ScreenSpot Pro 43.6%, 远超 Aguvis-72B(23.6%)与 Qwen2-VL-72B(1.6%). 离线评测全面领先. 部分基线 grounding 弱, 在线评测对其输入加了 **SoM**(Set-of-Mark); Qwen2.5-VL-72B 无需辅助标记即可在 AndroidWorld, MobileMiniWob++ 上超过基线, OSWorld 上也可比, 说明能在真实动态环境中充当 agent.

> **再看:** 线上评测不用 Set-of-Mark, 是因为 grounding 已经够强吗?
> 报告对比里部分基线因 grounding 弱才加 SoM; Qwen2.5-VL-72B 在 AndroidWorld 与 MobileMiniWob++ 上不用辅助标记仍能超过或打平, 说明 GUI grounding 可直接支撑 agent.

## 4 Conclusion

We present Qwen2.5-VL, a state-of-the-art vision-language model series that achieves significant advancements in multimodal understanding and interaction. With enhanced capabilities in visual recognition, object localization, document parsing, and long-video comprehension, Qwen2.5-VL excels in both static and dynamic tasks. Its native dynamic-resolution processing and absolute time encoding enable robust handling of diverse inputs, while Window Attention reduces computational overhead without sacrificing resolution fidelity. Qwen2.5-VL caters to a wide range of applications, from edge AI to high-performance computing. The flagship Qwen2.5-VL-72B matches or surpasses leading models like GPT-4o, and Claude 3.5 Sonnet, particularly in document and diagram understanding, while maintaining strong performance on pure text tasks. The smaller Qwen2.5-VL-7B and Qwen2.5-VL-3B variants outperform similarly sized competitors, offering efficiency and versatility. Qwen2.5-VL sets a new benchmark for vision-language models, demonstrating exceptional generalization and task execution across domains. Its innovations pave the way for more intelligent and interactive systems, bridging perception and real-world application.
本文推出 Qwen2.5-VL: 视觉识别, 物体定位, 文档解析与长视频理解同步加强, 静动态任务都强. 原生动态分辨率与绝对时间编码吃多样输入; 窗口注意力在保分辨率保真的同时降算力. 应用从端侧到高性能计算. 旗舰 72B 在文档与图示上可对标甚至超过 GPT-4o, Claude 3.5 Sonnet, 纯文本也强; 更小的 7B, 3B 同级领先. 系列为视觉语言模型立下新标杆, 把感知接到真实应用.

## 5 Authors 作者

**Core Contributors:** Shuai Bai, Keqin Chen, Xuejing Liu, Jialin Wang, Wenbin Ge, Sibo Song, Kai Dang, Peng Wang, Shijie Wang, Jun Tang, Humen Zhong, Yuanzhi Zhu, Mingkun Yang, Zhaohai Li, Jianqiang Wan, Pengfei Wang, Wei Ding, Zheren Fu, Yiheng Xu, Jiabo Ye, Xi Zhang, Tianbao Xie, Zesen Cheng, Hang Zhang, Zhibo Yang, Haiyang Xu, Junyang Lin
核心贡献者: Shuai Bai, Keqin Chen, Xuejing Liu, Jialin Wang, Wenbin Ge, Sibo Song, Kai Dang, Peng Wang, Shijie Wang, Jun Tang, Humen Zhong, Yuanzhi Zhu, Mingkun Yang, Zhaohai Li, Jianqiang Wan, Pengfei Wang, Wei Ding, Zheren Fu, Yiheng Xu, Jiabo Ye, Xi Zhang, Tianbao Xie, Zesen Cheng, Hang Zhang, Zhibo Yang, Haiyang Xu, Junyang Lin

**Contributors**<strong><sup>1</sup></strong>: An Yang, Binyuan Hui, Bowen Yu, Chen Cheng, Dayiheng Liu, Fan Hong, Fei Huang, Jiawei Liu, Jin Xu, Jianhong Tu, Jianyuan Zeng, Jie Zhang, Jinkai Wang, Jianwei Zhang, Jingren Zhou, Kexin Yang, Mei Li, Ming Yan, Na Ni, Rui Men, Songtao Jiang, Xiaodong Deng, Xiaoming Huang, Ximing Zhou, Xingzhang Ren, Yang Fan, Yichang Zhang, Yikai Zhu, Yuqiong Liu, Zhifang Guo
贡献者 (按字母序): An Yang, Binyuan Hui, Bowen Yu, Chen Cheng, Dayiheng Liu, Fan Hong, Fei Huang, Jiawei Liu, Jin Xu, Jianhong Tu, Jianyuan Zeng, Jie Zhang, Jinkai Wang, Jianwei Zhang, Jingren Zhou, Kexin Yang, Mei Li, Ming Yan, Na Ni, Rui Men, Songtao Jiang, Xiaodong Deng, Xiaoming Huang, Ximing Zhou, Xingzhang Ren, Yang Fan, Yichang Zhang, Yikai Zhu, Yuqiong Liu, Zhifang Guo

<small><span class="docvortex-page-footnote" data-block-type="page_footnote" style="color:#6b7280"><sup>1</sup>Alphabetical order.</span></small>

<!-- page 16 of 23 -->

## References

Pravesh Agrawal, Szymon Antoniak, Emma Bou Hanna, Baptiste Bout, Devendra Chaplot, Jessica Chudnovsky, Diogo Costa, Baudouin De Monicault, Saurabh Garg, Theophile Gervet, et al. Pixtral 12b. arXiv preprint arXiv:2410.07073, 2024.

Jean-Baptiste Alayrac, Jeff Donahue, Pauline Luc, Antoine Miech, Iain Barr, Yana Hasson, Karel Lenc, Arthur Mensch, Katherine Millican, Malcolm Reynolds, et al. Flamingo: a visual language model for few-shot learning. In NeurIPS, 2022.

Anthropic. Claude 3.5 sonnet, 2024a. URL [https://www.anthropic.com/news/claude-3-5-sonnet](https://www.anthropic.com/news/claude-3-5-sonnet).

Anthropic. Introducing computer use, a new claude 3.5 sonnet, and claude 3.5 haiku, 2024b. URL [https://www.anthropic.com/news/3-5-models-and-computer-use](https://www.anthropic.com/news/3-5-models-and-computer-use).

Federico Cassano, John Gouwar, Daniel Nguyen, Sydney Nguyen, Luna Phipps-Costin, Donald Pinckney, Ming-Ho Yee, Yangtian Zi, Carolyn Jane Anderson, Molly Q. Feldman, Arjun Guha, Michael Greenberg, and Abhinav Jangda. MultiPL-E: A scalable and polyglot approach to benchmarking neural code generation. IEEE Trans. Software Eng., 49(7):3675–3691, 2023.

Guiming Hardy Chen, Shunian Chen, Ruifei Zhang, Junying Chen, Xiangbo Wu, Zhiyi Zhang, Zhihong Chen, Jianquan Li, Xiang Wan, and Benyou Wang. Allava: Harnessing gpt4v-synthesized data for a lite vision-language model. arXiv preprint arXiv:2402.11684, 2024a.

Jiacheng Chen, Tianhao Liang, Sherman Siu, Zhengqing Wang, Kai Wang, Yubo Wang, Yuansheng Ni, Wang Zhu, Ziyan Jiang, Bohan Lyu, et al. Mega-bench: Scaling multimodal evaluation to over 500 real-world tasks. arXiv preprint arXiv:2410.10563, 2024b.

Lin Chen, Jinsong Li, Xiaoyi Dong, Pan Zhang, Yuhang Zang, Zehui Chen, Haodong Duan, Jiaqi Wang, Yu Qiao, Dahua Lin, et al. Are we on the right way for evaluating large vision-language models? arXiv:2403.20330, 2024c.

Mark Chen, Jerry Tworek, Heewoo Jun, Qiming Yuan, Henrique Pondé de Oliveira Pinto, Jared Kaplan, Harrison Edwards, Yuri Burda, Nicholas Joseph, Greg Brockman, Alex Ray, Raul Puri, Gretchen Krueger, Michael Petrov, Heidy Khlaaf, Girish Sastry, Pamela Mishkin, Brooke Chan, Scott Gray, Nick Ryder, Mikhail Pavlov, Alethea Power, Lukasz Kaiser, Mohammad Bavarian, Clemens Winter, Philippe Tillet, Felipe Petroski Such, Dave Cummings, Matthias Plappert, Fotios Chantzis, Elizabeth Barnes, Ariel Herbert-Voss, William Hebgen Guss, Alex Nichol, Alex Paino, Nikolas Tezak, Jie Tang, Igor Babuschkin, Suchir Balaji, Shantanu Jain, William Saunders, Christopher Hesse, Andrew N. Carr, Jan Leike, Joshua Achiam, Vedant Misra, Evan Morikawa, Alec Radford, Matthew Knight, Miles Brundage, Mira Murati, Katie Mayer, Peter Welinder, Bob McGrew, Dario Amodei, Sam McCandlish, Ilya Sutskever, and Wojciech Zaremba. Evaluating large language models trained on code. CoRR, abs/2107.03374, 2021.

Zhe Chen, Jiannan Wu, Wenhai Wang, Weijie Su, Guo Chen, Sen Xing, Muyan Zhong, Qinglong Zhang, Xizhou Zhu, Lewei Lu, Bin Li, Ping Luo, Tong Lu, Yu Qiao, and Jifeng Dai. Internvl: Scaling up vision foundation models and aligning for generic visual-linguistic tasks. arXiv preprint arXiv:2312.14238, 2023.

Zhe Chen, Weiyun Wang, Yue Cao, Yangzhou Liu, Zhangwei Gao, Erfei Cui, Jinguo Zhu, Shenglong Ye, Hao Tian, Zhaoyang Liu, et al. Expanding performance boundaries of open-source multimodal models with model, data, and test-time scaling. arXiv preprint arXiv:2412.05271, 2024d.

Kanzhi Cheng, Qiushi Sun, Yougang Chu, Fangzhi Xu, Yantao Li, Jianbing Zhang, and Zhiyong Wu. Seeclick: Harnessing gui grounding for advanced visual gui agents. arXiv preprint arXiv:2401.10935, 2024.

Karl Cobbe, Vineet Kosaraju, Mohammad Bavarian, Mark Chen, Heewoo Jun, Lukasz Kaiser, Matthias Plappert, Jerry Tworek, Jacob Hilton, Reiichiro Nakano, Christopher Hesse, and John Schulman. Training verifiers to solve math word problems. CoRR, abs/2110.14168, 2021.

Yann N. Dauphin, Angela Fan, Michael Auli, and David Grangier. Language modeling with gated convolutional networks. In ICML, volume 70 of Proceedings of Machine Learning Research, pp. 933–941. PMLR, 2017.

Google Deepmind. Introducing gemini 2.0: our new ai model for the agentic era, 2024. URL [https://blog.google/technology/google-deepmind/google-gemini-ai-update-december-2024/](https://blog.google/technology/google-deepmind/google-gemini-ai-update-december-2024/).

<!-- page 17 of 23 -->

DeepSeek-AI, Aixin Liu, Bei Feng, Bing Xue, Bingxuan Wang, Bochao Wu, Chengda Lu, Chenggang Zhao, Chengqi Deng, Chenyu Zhang, Chong Ruan, Damai Dai, Daya Guo, Dejian Yang, Deli Chen, Dongjie Ji, Erhang Li, Fangyun Lin, Fucong Dai, Fuli Luo, Guangbo Hao, Guanting Chen, Guowei Li, H. Zhang, Han Bao, Hanwei Xu, Haocheng Wang, Haowei Zhang, Honghui Ding, Huajian Xin, Huazuo Gao, Hui Li, Hui Qu, J. L. Cai, Jian Liang, Jianzhong Guo, Jiaqi Ni, Jiashi Li, Jiawei Wang, Jin Chen, Jingchang Chen, Jingyang Yuan, Junjie Qiu, Junlong Li, Junxiao Song, Kai Dong, Kai Hu, Kaige Gao, Kang Guan, Kexin Huang, Kuai Yu, Lean Wang, Lecong Zhang, Lei Xu, Leyi Xia, Liang Zhao, Litong Wang, Liyue Zhang, Meng Li, Miaojun Wang, Mingchuan Zhang, Minghua Zhang, Minghui Tang, Mingming Li, Ning Tian, Panpan Huang, Peiyi Wang, Peng Zhang, Qiancheng Wang, Qihao Zhu, Qinyu Chen, Qiushi Du, R. J. Chen, R. L. Jin, Ruiqi Ge, Ruisong Zhang, Ruizhe Pan, Runji Wang, Runxin Xu, Ruoyu Zhang, Ruyi Chen, S. S. Li, Shanghao Lu, Shangyan Zhou, Shanhuang Chen, Shaoqing Wu, Shengfeng Ye, Shengfeng Ye, Shirong Ma, Shiyu Wang, Shuang Zhou, Shuiping Yu, Shunfeng Zhou, Shuting Pan, T. Wang, Tao Yun, Tian Pei, Tianyu Sun, W. L. Xiao, and Wangding Zeng. Deepseek-v3 technical report. CoRR, abs/2412.19437, 2024. doi: 10.48550/ARXIV.2412.19437. URL [https://doi.org/10.48550/arXiv.2412.19437](https://doi.org/10.48550/arXiv.2412.19437).

Matt Deitke, Christopher Clark, Sangho Lee, Rohun Tripathi, Yue Yang, Jae Sung Park, Mohammadreza Salehi, Niklas Muennighoff, Kyle Lo, Luca Soldaini, et al. Molmo and pixmo: Open weights and open data for state-of-the-art multimodal models. arXiv preprint arXiv:2409.17146, 2024.

Xinyu Fang, Kangrui Mao, Haodong Duan, Xiangyu Zhao, Yining Li, Dahua Lin, and Kai Chen. Mmbench-video: A long-form multi-shot benchmark for holistic video understanding. arXiv preprint arXiv:2406.14515, 2024.

Chaoyou Fu, Peixian Chen, Yunhang Shen, Yulei Qin, Mengdan Zhang, Xu Lin, Zhenyu Qiu, Wei Lin, Jinrui Yang, Xiawu Zheng, et al. Mme: A comprehensive evaluation benchmark for multimodal large language models. arXiv:2306.13394, 2023.

Chaoyou Fu, Yuhan Dai, Yondong Luo, Lei Li, Shuhuai Ren, Renrui Zhang, Zihan Wang, Chenyu Zhou, Yunhang Shen, Mengdan Zhang, et al. Video-mme: The first-ever comprehensive evaluation benchmark of multi-modal llms in video analysis. arXiv:2405.21075, 2024a.

Ling Fu, Biao Yang, Zhebin Kuang, Jiajun Song, Yuzhe Li, Linghao Zhu, Qidi Luo, Xinyu Wang, Hao Lu, Mingxin Huang, Zhang Li, Guozhi Tang, Bin Shan, Chunhui Lin, Qi Liu, Binghong Wu, Hao Feng, Hao Liu, Can Huang, Jingqun Tang, Wei Chen, Lianwen Jin, Yuliang Liu, and Xiang Bai. Ocrbench v2: An improved benchmark for evaluating large multimodal models on visual text localization and reasoning, 2024b. URL [https://arxiv.org/abs/2501.00321](https://arxiv.org/abs/2501.00321).

Xingyu Fu, Yushi Hu, Bangzheng Li, Yu Feng, Haoyu Wang, Xudong Lin, Dan Roth, Noah A Smith, Wei-Chiu Ma, and Ranjay Krishna. Blink: Multimodal large language models can see but not perceive. In European Conference on Computer Vision, pp. 148–166. Springer, 2024c.

Samir Yitzhak Gadre, Gabriel Ilharco, Alex Fang, Jonathan Hayase, Georgios Smyrnis, Thao Nguyen, Ryan Marten, Mitchell Wortsman, Dhruba Ghosh, Jieyu Zhang, et al. Datacomp: In search of the next generation of multimodal datasets. arXiv:2304.14108, 2023.

Jiyang Gao, Chen Sun, Zhenheng Yang, and Ram Nevatia. Tall: Temporal activity localization via language query. In Proceedings of the IEEE international conference on computer vision, pp. 5267–5275, 2017.

Aryo Pradipta Gema, Joshua Ong Jun Leang, Giwon Hong, Alessio Devoto, Alberto Carlo Maria Mancino, Rohit Saxena, Xuanli He, Yu Zhao, Xiaotang Du, Mohammad Reza Ghasemi Madani, et al. Are we done with mmlu? CoRR, abs/2406.04127, 2024.

Golnaz Ghiasi, Yin Cui, Aravind Srinivas, Rui Qian, Tsung-Yi Lin, Ekin D Cubuk, Quoc V Le, and Barret Zoph. Simple copy-paste is a strong data augmentation method for instance segmentation. In Proceedings of the IEEE/CVF conference on computer vision and pattern recognition, pp. 2918–2928, 2021.

Tianrui Guan, Fuxiao Liu, Xiyang Wu, Ruiqi Xian, Zongxia Li, Xiaoyu Liu, Xijun Wang, Lichang Chen, Furong Huang, Yaser Yacoob, Dinesh Manocha, and Tianyi Zhou. Hallusionbench: An advanced diagnostic suite for entangled language hallucination & visual illusion in large vision-language models. arXiv:2310.14566, 2023.

Jarvis Guo, Tuney Zheng, Yuelin Bai, Bo Li, Yubo Wang, King Zhu, Yizhi Li, Graham Neubig, Wenhu Chen, and Xiang Yue. Mammoth-vl: Eliciting multimodal reasoning with instruction tuning at scale. arXiv preprint arXiv:2412.05237, 2024.

<!-- page 18 of 23 -->

Dan Hendrycks, Collin Burns, Saurav Kadavath, Akul Arora, Steven Basart, Eric Tang, Dawn Song, and Jacob Steinhardt. Measuring mathematical problem solving with the MATH dataset. In NeurIPS Datasets and Benchmarks, 2021.

Kairui Hu, Penghao Wu, Fanyi Pu, Wang Xiao, Yuanhan Zhang, Xiang Yue, Bo Li, and Ziwei Liu. Videommmu: Evaluating knowledge acquisition from multi-discipline professional videos. arXiv preprint arXiv:2501.13826, 2025.

Sahar Kazemzadeh, Vicente Ordonez, Mark Matten, and Tamara Berg. Referitgame: Referring to objects in photographs of natural scenes. In EMNLP, 2014.

Aniruddha Kembhavi, Mike Salvato, Eric Kolve, Minjoon Seo, Hannaneh Hajishirzi, and Ali Farhadi. A diagram is worth a dozen images. In ECCV, 2016.

Alexander Kirillov, Eric Mintun, Nikhila Ravi, Hanzi Mao, Chloe Rolland, Laura Gustafson, Tete Xiao, Spencer Whitehead, Alexander C Berg, Wan-Yen Lo, et al. Segment anything. In ICCV, 2023.

Byung-Kwan Lee, Beomchan Park, Chae Won Kim, and Yong Man Ro. Moai: Mixture of all intelligence for large language and vision models. In European Conference on Computer Vision, pp. 273–302. Springer, 2024.

Bo Li, Peiyuan Zhang, Jingkang Yang, Yuanhan Zhang, Fanyi Pu, and Ziwei Liu. Otterhd: A highresolution multi-modality model. arXiv:2311.04219, 2023a.

Bo Li, Yuanhan Zhang, Dong Guo, Renrui Zhang, Feng Li, Hao Zhang, Kaichen Zhang, Peiyuan Zhang, Yanwei Li, Ziwei Liu, et al. Llava-onevision: Easy visual task transfer. arXiv preprint arXiv:2408.03326, 2024a.

Bohao Li, Yuying Ge, Yi Chen, Yixiao Ge, Ruimao Zhang, and Ying Shan. Seed-bench-2-plus: Benchmarking multimodal large language models with text-rich visual comprehension. arXiv preprint arXiv:2404.16790, 2024b.

Dongxu Li, Yudong Liu, Haoning Wu, Yue Wang, Zhiqi Shen, Bowen Qu, Xinyao Niu, Guoyin Wang, Bei Chen, and Junnan Li. Aria: An open multimodal native mixture-of-experts model. arXiv preprint arXiv:2410.05993, 2024c.

Junnan Li, Dongxu Li, Caiming Xiong, and Steven C. H. Hoi. Blip: Bootstrapping language-image pre-training for unified vision-language understanding and generation. In ICML, 2022a.

Junnan Li, Dongxu Li, Silvio Savarese, and Steven Hoi. Blip-2: Bootstrapping language-image pre-training with frozen image encoders and large language models. arXiv:2301.12597, 2023b.

Kaixin Li, Ziyang Meng, Hongzhan Lin, Ziyang Luo, Yuchen Tian, Jing Ma, Zhiyong Huang, and Tat-Seng Chua. Screenspot-pro: Gui grounding for professional high-resolution computer use, 2025a. URL [https://likaixin2000.github.io/papers/ScreenSpot\_Pro.pdf](https://likaixin2000.github.io/papers/ScreenSpot_Pro.pdf). Preprint.

Kunchang Li, Yali Wang, Yinan He, Yizhuo Li, Yi Wang, Yi Liu, Zun Wang, Jilan Xu, Guo Chen, Ping Luo, et al. Mvbench: A comprehensive multi-modal video understanding benchmark. In CVPR, 2024d.

Liunian Harold Li, Pengchuan Zhang, Haotian Zhang, Jianwei Yang, Chunyuan Li, Yiwu Zhong, Lijuan Wang, Lu Yuan, Lei Zhang, Jenq-Neng Hwang, et al. Grounded language-image pre-training. In Proceedings of the IEEE/CVF Conference on Computer Vision and Pattern Recognition, pp. 10965–10975, 2022b.

Qingyun Li, Zhe Chen, Weiyun Wang, Wenhai Wang, Shenglong Ye, Zhenjiang Jin, Guanzhou Chen, Yinan He, Zhangwei Gao, Erfei Cui, et al. Omnicorpus: An unified multimodal corpus of 10 billion-level images interleaved with text. arXiv preprint arXiv:2406.08418, 2024e.

Wei Li, William Bishop, Alice Li, Chris Rawles, Folawiyo Campbell-Ajala, Divya Tyamagundlu, and Oriana Riva. On the effects of data scale on computer control agents. arXiv preprint arXiv:2406.03679, 2024f.

Yadong Li, Haoze Sun, Mingan Lin, Tianpeng Li, Guosheng Dong, Tao Zhang, Bowen Ding, Wei Song, Zhenglin Cheng, Yuqi Huo, et al. Baichuan-omni technical report. arXiv preprint arXiv:2410.08565, 3(7), 2024g.

Yadong Li, Jun Liu, Tao Zhang, Song Chen, Tianpeng Li, Zehuan Li, Lijun Liu, Lingfeng Ming, Guosheng Dong, Da Pan, et al. Baichuan-omni-1.5 technical report. arXiv preprint arXiv:2501.15368, 2025b.

<!-- page 19 of 23 -->

Yunxin Li, Shenyuan Jiang, Baotian Hu, Longyue Wang, Wanqi Zhong, Wenhan Luo, Lin Ma, and Min Zhang. Uni-moe: Scaling unified multimodal llms with mixture of experts. arXiv preprint arXiv:2405.11273, 2024h.

Zhang Li, Biao Yang, Qiang Liu, Zhiyin Ma, Shuo Zhang, Jingxu Yang, Yabo Sun, Yuliang Liu, and Xiang Bai. Monkey: Image resolution and text label are important things for large multi-modal models. arXiv:2311.06607, 2023c.

Yuxuan Liang, Xu Li, Xiaolei Chen, Haotian Chen, Yi Zheng, Chenghang Lai, Bin Li, and Xiangyang Xue. Global semantic-guided sub-image feature weight allocation in high-resolution large vision-language models. arXiv preprint arXiv:2501.14276, 2025.

Ji Lin, Hongxu Yin, Wei Ping, Pavlo Molchanov, Mohammad Shoeybi, and Song Han. Vila: On pre-training for visual language models. In Proceedings of the IEEE/CVF Conference on Computer Vision and Pattern Recognition, pp. 26689–26699, 2024.

Haotian Liu, Chunyuan Li, Yuheng Li, and Yong Jae Lee. Improved baselines with visual instruction tuning. arXiv:2310.03744, 2023a.

Haotian Liu, Chunyuan Li, Qingyang Wu, and Yong Jae Lee. Visual instruction tuning. arXiv:2304.08485, 2023b.

Shilong Liu, Zhaoyang Zeng, Tianhe Ren, Feng Li, Hao Zhang, Jie Yang, Chun yue Li, Jianwei Yang, Hang Su, Jun-Juan Zhu, and Lei Zhang. Grounding dino: Marrying dino with grounded pre-training for open-set object detection. arXiv:2303.05499, 2023c.

Yangzhou Liu, Yue Cao, Zhangwei Gao, Weiyun Wang, Zhe Chen, Wenhai Wang, Hao Tian, Lewei Lu, Xizhou Zhu, Tong Lu, et al. Mminstruct: A high-quality multi-modal instruction tuning dataset with extensive diversity. Science China Information Sciences, 67(12):1–16, 2024a.

Yuan Liu, Haodong Duan, Bo Li Yuanhan Zhang, Songyang Zhang, Wangbo Zhao, Yike Yuan, Jiaqi Wang, Conghui He, Ziwei Liu, Kai Chen, and Dahua Lin. Mmbench: Is your multi-modal model an all-around player? arXiv:2307.06281, 2023d.

Yuan Liu, Zhongyin Zhao, Ziyuan Zhuang, Le Tian, Xiao Zhou, and Jie Zhou. Points: Improving your vision-language model with affordable strategies. arXiv preprint arXiv:2409.04828, 2024b.

Yuanxin Liu, Shicheng Li, Yi Liu, Yuxiang Wang, Shuhuai Ren, Lei Li, Sishuo Chen, Xu Sun, and Lu Hou. Tempcompass: Do video llms really understand videos? arXiv preprint arXiv:2403.00476, 2024c.

Yuliang Liu, Zhang Li, Mingxin Huang, Biao Yang, Wenwen Yu, Chunyuan Li, Xucheng Yin, Cheng lin Liu, Lianwen Jin, and Xiang Bai. Ocrbench: On the hidden mystery of ocr in large multimodal models. arXiv:2305.07895, 2023e.

Pan Lu, Hritik Bansal, Tony Xia, Jiacheng Liu, Chunyuan Li, Hannaneh Hajishirzi, Hao Cheng, Kai-Wei Chang, Michel Galley, and Jianfeng Gao. Mathvista: Evaluating mathematical reasoning of foundation models in visual contexts. In ICLR, 2024.

Karttikeya Mangalam, Raiymbek Akshulakov, and Jitendra Malik. Egoschema: A diagnostic benchmark for very long-form video language understanding. In NeurIPS, 2023.

Junhua Mao, Jonathan Huang, Alexander Toshev, Oana Camburu, Alan L Yuille, and Kevin Murphy. Generation and comprehension of unambiguous object descriptions. In CVPR, 2016.

Ahmed Masry, Do Xuan Long, Jia Qing Tan, Shafiq Joty, and Enamul Hoque. Chartqa: A benchmark for question answering about charts with visual and logical reasoning. arXiv:2203.10244, 2022.

Minesh Mathew, Viraj Bagal, Rubèn Pérez Tito, Dimosthenis Karatzas, Ernest Valveny, and C.V. Jawahar. Infographicvqa. 2022 IEEE/CVF Winter Conference on Applications of Computer Vision (WACV), pp. 2582–2591, 2021a.

Minesh Mathew, Dimosthenis Karatzas, and CV Jawahar. Docvqa: A dataset for vqa on document images. In WACV, 2021b.

MiniMax, Aonian Li, Bangwei Gong, Bo Yang, Boji Shan, Chang Liu, Cheng Zhu, Chunhao Zhang, Congchao Guo, Da Chen, Dong Li, Enwei Jiao, Gengxin Li, Guojun Zhang, Haohai Sun, Houze Dong, Jiadai Zhu, Jiaqi Zhuang, Jiayuan Song, Jin Zhu, Jingtao Han, Jingyang Li, Junbin Xie, Junhao Xu, Junjie Yan, Kaishun Zhang, Kecheng Xiao, Kexi Kang, Le Han, Leyang Wang, Lianfei Yu, Liheng Feng, Lin Zheng, Linbo Chai, Long Xing, Meizhi Ju, Mingyuan Chi, Mozhi Zhang, Peikai Huang, Pengcheng

<!-- page 20 of 23 -->

Niu, Pengfei Li, Pengyu Zhao, Qi Yang, Qidi Xu, Qiexiang Wang, Qin Wang, Qiuhui Li, Ruitao Leng, Shengmin Shi, Shuqi Yu, Sichen Li, Songquan Zhu, Tao Huang, Tianrun Liang, Weigao Sun, Weixuan Sun, Weiyu Cheng, Wenkai Li, Xiangjun Song, Xiao Su, Xiaodong Han, Xinjie Zhang, Xinzhu Hou, Xu Min, Xun Zou, Xuyang Shen, Yan Gong, Yingjie Zhu, Yipeng Zhou, Yiran Zhong, Yongyi Hu, Yuanxiang Fan, Yue Yu, Yufeng Yang, Yuhao Li, Yunan Huang, Yunji Li, Yunpeng Huang, Yunzhi Xu, Yuxin Mao, Zehan Li, Zekang Li, Zewei Tao, Zewen Ying, Zhaoyang Cong, Zhen Qin, Zhenhua Fan, Zhihang Yu, Zhuo Jiang, and Zijia Wu. Minimax-01: Scaling foundation models with lightning attention, 2025. URL [https://arxiv.org/abs/2501.08313](https://arxiv.org/abs/2501.08313).

Openai. Chatml documents, 2024. URL [https://github.com/openai/openai-python/blob/main/chatml.md](https://github.com/openai/openai-python/blob/main/chatml.md).

OpenAI. Hello gpt-4o, 2024. URL [https://openai.com/index/hello-gpt-4o](https://openai.com/index/hello-gpt-4o).

Linke Ouyang, Yuan Qu, Hongbin Zhou, Jiawei Zhu, Rui Zhang, Qunshu Lin, Bin Wang, Zhiyuan Zhao, Man Jiang, Xiaomeng Zhao, Jin Shi, Fan Wu, Pei Chu, Minghao Liu, Zhenxiang Li, Chao Xu, Bo Zhang, Botian Shi, Zhongying Tu, and Conghui He. Omnidocbench: Benchmarking diverse pdf document parsing with comprehensive annotations, 2024. URL [https://arxiv.org/abs/2412.07626](https://arxiv.org/abs/2412.07626).

Roni Paiss, Ariel Ephrat, Omer Tov, Shiran Zada, Inbar Mosseri, Michal Irani, and Tali Dekel. Teaching clip to count to ten. In Proceedings of the IEEE/CVF International Conference on Computer Vision, pp. 3170–3180, 2023.

Viorica Patraucean, Lucas Smaira, Ankush Gupta, Adria Recasens, Larisa Markeeva, Dylan Banarse, Skanda Koppula, Mateusz Malinowski, Yi Yang, Carl Doersch, et al. Perception test: A diagnostic benchmark for multimodal video models. In NeurIPS, 2024.

Zhiliang Peng, Wenhui Wang, Li Dong, Yaru Hao, Shaohan Huang, Shuming Ma, and Furu Wei. Kosmos-2: Grounding multimodal large language models to the world. arXiv:2306.14824, 2023.

Rafael Rafailov, Archit Sharma, Eric Mitchell, Christopher D. Manning, Stefano Ermon, and Chelsea Finn. Direct preference optimization: Your language model is secretly a reward model. In Alice Oh, Tristan Naumann, Amir Globerson, Kate Saenko, Moritz Hardt, and Sergey Levine (eds.), Advances in Neural Information Processing Systems 36: Annual Conference on Neural Information Processing Systems 2023, NeurIPS 2023, New Orleans, LA, USA, December 10 - 16, 2023, 2023. URL [http://papers.nips.cc/paper\_files/paper/2023/hash/a85b405ed65c6477a4fe8302b5e06ce7-Abstract-Conference.html](http://papers.nips.cc/paper_files/paper/2023/hash/a85b405ed65c6477a4fe8302b5e06ce7-Abstract-Conference.html).

Christopher Rawles, Sarah Clinckemaillie, Yifan Chang, Jonathan Waltz, Gabrielle Lau, Marybeth Fair, Alice Li, William Bishop, Wei Li, Folawiyo Campbell-Ajala, et al. Androidworld: A dynamic benchmarking environment for autonomous agents. arXiv:2405.14573, 2024.

David Rein, Betty Li Hou, Asa Cooper Stickland, Jackson Petty, Richard Yuanzhe Pang, Julien Dirani, Julian Michael, and Samuel R. Bowman. GPQA: A graduate-level Google-proof Q&A benchmark. CoRR, abs/2311.12022, 2023.

Tianhe Ren, Qing Jiang, Shilong Liu, Zhaoyang Zeng, Wenlong Liu, Han Gao, Hongjie Huang, Zhengyu Ma, Xiaoke Jiang, Yihao Chen, et al. Grounding dino 1.5: Advance the" edge" of open-set object detection. arXiv preprint arXiv:2405.10300, 2024.

Carlos Riquelme, Joan Puigcerver, Basil Mustafa, Maxim Neumann, Rodolphe Jenatton, André Susano Pinto, Daniel Keysers, and Neil Houlsby. Scaling vision with sparse mixture of experts. Advances in Neural Information Processing Systems, 34:8583–8595, 2021.

Amanpreet Singh, Vivek Natarajan, Meet Shah, Yu Jiang, Xinlei Chen, Dhruv Batra, Devi Parikh, and Marcus Rohrbach. Towards vqa models that can read. In CVPR, 2019.

Jianlin Su, Murtadha H. M. Ahmed, Yu Lu, Shengfeng Pan, Wen Bo, and Yunfeng Liu. Roformer: Enhanced Transformer with rotary position embedding. Neurocomputing, 568:127063, 2024.

Jingqun Tang, Qi Liu, Yongjie Ye, Jinghui Lu, Shu Wei, Chunhui Lin, Wanqing Li, Mohamad Fitri Faiz Bin Mahmood, Hao Feng, Zhen Zhao, Yanjie Wang, Yuliang Liu, Hao Liu, Xiang Bai, and Can Huang. Mtvqa: Benchmarking multilingual text-centric visual question answering. arXiv:2405.11985, 2024.

Gemini Team, Rohan Anil, Sebastian Borgeaud, Yonghui Wu, Jean-Baptiste Alayrac, Jiahui Yu, Radu Soricut, Johan Schalkwyk, Andrew M Dai, Anja Hauth, et al. Gemini: a family of highly capable multimodal models. arXiv preprint arXiv:2312.11805, 2023.

<!-- page 21 of 23 -->

Shengbang Tong, Ellis Brown, Penghao Wu, Sanghyun Woo, Manoj Middepogu, Sai Charitha Akula, Jihan Yang, Shusheng Yang, Adithya Iyer, Xichen Pan, et al. Cambrian-1: A fully open, vision-centric exploration of multimodal llms. arXiv preprint arXiv:2406.16860, 2024.

Fei Wang, Xingyu Fu, James Y Huang, Zekun Li, Qin Liu, Xiaogeng Liu, Mingyu Derek Ma, Nan Xu, Wenxuan Zhou, Kai Zhang, et al. Muirbench: A comprehensive benchmark for robust multi-image understanding. arXiv preprint arXiv:2406.09411, 2024a.

Junyang Wang, Haiyang Xu, Haitao Jia, Xi Zhang, Ming Yan, Weizhou Shen, Ji Zhang, Fei Huang, and Jitao Sang. Mobile-agent-v2: Mobile device operation assistant with effective navigation via multi-agent collaboration. arXiv preprint arXiv:2406.01014, 2024b.

Junyang Wang, Haiyang Xu, Jiabo Ye, Ming Yan, Weizhou Shen, Ji Zhang, Fei Huang, and Jitao Sang. Mobile-agent: Autonomous multi-modal mobile device agent with visual perception. arXiv preprint arXiv:2401.16158, 2024c.

Ke Wang, Junting Pan, Weikang Shi, Zimu Lu, Mingjie Zhan, and Hongsheng Li. Measuring multimodal mathematical reasoning with math-vision dataset. arXiv:2402.14804, 2024d.

Peng Wang, Shuai Bai, Sinan Tan, Shijie Wang, Zhihao Fan, Jinze Bai, Keqin Chen, Xuejing Liu, Jialin Wang, Wenbin Ge, Yang Fan, Kai Dang, Mengfei Du, Xuancheng Ren, Rui Men, Dayiheng Liu, Chang Zhou, Jingren Zhou, and Junyang Lin. Qwen2-vl: Enhancing vision-language model’s perception of the world at any resolution. arXiv:2409.12191, 2024e.

Peng Wang, Shuai Bai, Sinan Tan, Shijie Wang, Zhihao Fan, Jinze Bai, Keqin Chen, Xuejing Liu, Jialin Wang, Wenbin Ge, et al. Qwen2-vl: Enhancing vision-language model’s perception of the world at any resolution. arXiv preprint arXiv:2409.12191, 2024f.

Weihan Wang, Zehai He, Wenyi Hong, Yean Cheng, Xiaohan Zhang, Ji Qi, Xiaotao Gu, Shiyu Huang, Bin Xu, Yuxiao Dong, et al. Lvbench: An extreme long video understanding benchmark. arXiv preprint arXiv:2406.08035, 2024g.

Weiyun Wang, Yiming Ren, Haowen Luo, Tiantong Li, Chenxiang Yan, Zhe Chen, Wenhai Wang, Qingyun Li, Lewei Lu, Xizhou Zhu, et al. The all-seeing project v2: Towards general relation comprehension of the open world. arXiv preprint arXiv:2402.19474, 2024h.

Wenhai Wang, Jifeng Dai, Zhe Chen, Zhenhang Huang, Zhiqi Li, Xizhou Zhu, Xiaowei Hu, Tong Lu, Lewei Lu, Hongsheng Li, et al. Internimage: Exploring large-scale vision foundation models with deformable convolutions. In Proceedings of the IEEE/CVF conference on computer vision and pattern recognition, pp. 14408–14419, 2023.

Xinlong Wang, Xiaosong Zhang, Zhengxiong Luo, Quan Sun, Yufeng Cui, Jinsheng Wang, Fan Zhang, Yueze Wang, Zhen Li, Qiying Yu, et al. Emu3: Next-token prediction is all you need. arXiv preprint arXiv:2409.18869, 2024i.

Yubo Wang, Xueguang Ma, Ge Zhang, Yuansheng Ni, Abhranil Chandra, Shiguang Guo, Weiming Ren, Aaran Arulraj, Xuan He, Ziyan Jiang, Tianle Li, Max Ku, Kai Wang, Alex Zhuang, Rongqi Fan, Xiang Yue, and Wenhu Chen. MMLU-Pro: A more robust and challenging multi-task language understanding benchmark. CoRR, abs/2406.01574, 2024j.

Zhenhailong Wang, Haiyang Xu, Junyang Wang, Xi Zhang, Ming Yan, Ji Zhang, Fei Huang, and Heng Ji. Mobile-agent-e: Self-evolving mobile assistant for complex tasks. arXiv preprint arXiv:2501.11733, 2025.

Zirui Wang, Mengzhou Xia, Luxi He, Howard Chen, Yitao Liu, Richard Zhu, Kaiqu Liang, Xindi Wu, Haotian Liu, Sadhika Malladi, Alexis Chevalier, Sanjeev Arora, and Danqi Chen. Charxiv: Charting gaps in realistic chart understanding in multimodal llms. arXiv preprint arXiv:2406.18521, 2024k.

Jason Wei, Xuezhi Wang, Dale Schuurmans, Maarten Bosma, Ed H. Chi, Quoc Le, and Denny Zhou. Chain of thought prompting elicits reasoning in large language models. CoRR, abs/2201.11903, 2022. URL [https://arxiv.org/abs/2201.11903](https://arxiv.org/abs/2201.11903).

Colin White, Samuel Dooley, Manley Roberts, Arka Pal, Benjamin Feuer, Siddhartha Jain, Ravid Shwartz-Ziv, Neel Jain, Khalid Saifullah, Siddartha Naidu, Chinmay Hegde, Yann LeCun, Tom Goldstein, Willie Neiswanger, and Micah Goldblum. LiveBench: A challenging, contamination-free LLM benchmark. CoRR, abs/2406.19314, 2024.

Haoning Wu, Dongxu Li, Bei Chen, and Junnan Li. Longvideobench: A benchmark for long-context interleaved video-language understanding, 2024a. URL [https://arxiv.org/abs/2407.15754](https://arxiv.org/abs/2407.15754).

<!-- page 22 of 23 -->

Zhiyu Wu, Xiaokang Chen, Zizheng Pan, Xingchao Liu, Wen Liu, Damai Dai, Huazuo Gao, Yiyang Ma, Chengyue Wu, Bingxuan Wang, et al. Deepseek-vl2: Mixture-of-experts vision-language models for advanced multimodal understanding. arXiv preprint arXiv:2412.10302, 2024b.

X.AI. Grok-1.5 vision preview. [https://x.ai/blog/grok-1.5v](https://x.ai/blog/grok-1.5v), 2024.

Bin Xiao, Haiping Wu, Weijian Xu, Xiyang Dai, Houdong Hu, Yumao Lu, Michael Zeng, Ce Liu, and Lu Yuan. Florence-2: Advancing a unified representation for a variety of vision tasks (2023). URL https://arxiv. org/abs/2311.06242, 2023.

Tianbao Xie, Danyang Zhang, Jixuan Chen, Xiaochuan Li, Siheng Zhao, Ruisheng Cao, Jing Hua Toh, Zhoujun Cheng, Dongchan Shin, Fangyu Lei, et al. Osworld: Benchmarking multimodal agents for open-ended tasks in real computer environments. Advances in Neural Information Processing Systems, 37: 52040–52094, 2025.

Yiheng Xu, Zekun Wang, Junli Wang, Dunjie Lu, Tianbao Xie, Amrita Saha, Doyen Sahoo, Tao Yu, and Caiming Xiong. Aguvis: Unified pure vision agents for autonomous gui interaction. arXiv preprint arXiv:2412.04454, 2024.

An Yang, Baosong Yang, Beichen Zhang, Binyuan Hui, Bo Zheng, Bowen Yu, Chengyuan Li, Dayiheng Liu, Fei Huang, et al. Qwen2.5 technical report. arXiv:2412.15115, 2024a.

Zhibo Yang, Jun Tang, Zhaohai Li, Pengfei Wang, Jianqiang Wan, Humen Zhong, Xuejing Liu, Mingkun Yang, Peng Wang, Shuai Bai, LianWen Jin, and Junyang Lin. Cc-ocr: A comprehensive and challenging ocr benchmark for evaluating large multimodal models in literacy, 2024b. URL [https://arxiv.org/abs/2412.02210](https://arxiv.org/abs/2412.02210).

Hanrong Ye, De-An Huang, Yao Lu, Zhiding Yu, Wei Ping, Andrew Tao, Jan Kautz, Song Han, Dan Xu, Pavlo Molchanov, et al. X-vila: Cross-modality alignment for large language model. arXiv preprint arXiv:2405.19335, 2024.

Qinghao Ye, Haiyang Xu, Jiabo Ye, Ming Yan, Haowei Liu, Qi Qian, Ji Zhang, Fei Huang, and Jingren Zhou. mplug-owl2: Revolutionizing multi-modal large language model with modality collaboration. arXiv:2311.04257, 2023.

Weihao Yu, Zhengyuan Yang, Linjie Li, Jianfeng Wang, Kevin Lin, Zicheng Liu, Xinchao Wang, and Lijuan Wang. Mm-vet: Evaluating large multimodal models for integrated capabilities. In ICML, 2024.

Xiang Yue, Yuansheng Ni, Kai Zhang, Tianyu Zheng, Ruoqi Liu, Ge Zhang, Samuel Stevens, Dongfu Jiang, Weiming Ren, Yuxuan Sun, et al. Mmmu: A massive multi-discipline multimodal understanding and reasoning benchmark for expert agi. arXiv:2311.16502, 2023.

Xiang Yue, Tianyu Zheng, Yuansheng Ni, Yubo Wang, Kai Zhang, Shengbang Tong, Yuxuan Sun, Ming Yin, Botao Yu, Ge Zhang, et al. Mmmu-pro: A more robust multi-discipline multimodal understanding benchmark. arXiv preprint arXiv:2409.02813, 2024.

Biao Zhang and Rico Sennrich. Root mean square layer normalization. In NeurIPS, 2019.

Haotian Zhang, Haoxuan You, Philipp Dufter, Bowen Zhang, Chen Chen, Hong-You Chen, Tsu-Jui Fu, William Yang Wang, Shih-Fu Chang, Zhe Gan, and Yinfei Yang. Ferret-v2: An improved baseline for referring and grounding with large language models. arXiv:2404.07973, 2024a.

Pan Zhang, Xiaoyi Dong, Yuhang Cao, Yuhang Zang, Rui Qian, Xilin Wei, Lin Chen, Yifei Li, Junbo Niu, Shuangrui Ding, et al. Internlm-xcomposer2. 5-omnilive: A comprehensive multimodal system for long-term streaming video and audio interactions. arXiv preprint arXiv:2412.09596, 2024b.

Renrui Zhang, Dongzhi Jiang, Yichi Zhang, Haokun Lin, Ziyu Guo, Pengshuo Qiu, Aojun Zhou, Pan Lu, Kai-Wei Chang, Yu Qiao, et al. Mathverse: Does your multi-modal llm truly see the diagrams in visual math problems? In European Conference on Computer Vision, pp. 169–186. Springer, 2024c.

Tao Zhang, Xiangtai Li, Hao Fei, Haobo Yuan, Shengqiong Wu, Shunping Ji, Chen Change Loy, and Shuicheng Yan. Omg-llava: Bridging image-level, object-level, pixel-level reasoning and understanding. arXiv preprint arXiv:2406.19389, 2024d.

Tianyu Zhang, Suyuchen Wang, Lu Li, Ge Zhang, Perouz Taslakian, Sai Rajeswar, Jie Fu, Bang Liu, and Yoshua Bengio. Vcr: Visual caption restoration. arXiv:2406.06462, 2024e.

<!-- page 23 of 23 -->

Yi-Fan Zhang, Huanyu Zhang, Haochen Tian, Chaoyou Fu, Shuangqing Zhang, Junfei Wu, Feng Li, Kun Wang, Qingsong Wen, Zhang Zhang, et al. Mme-realworld: Could your multimodal llm challenge high-resolution real-world scenarios that are difficult for humans? arXiv preprint arXiv:2408.13257, 2024f.

Yilun Zhao, Lujing Xie, Haowei Zhang, Guo Gan, Yitao Long, Zhiyuan Hu, Tongyan Hu, Weiyuan Chen, Chuhan Li, Junyang Song, Zhijian Xu, Chengye Wang, Weifeng Pan, Ziyao Shangguan, Xiangru Tang, Zhenwen Liang, Yixin Liu, Chen Zhao, and Arman Cohan. Mmvu: Measuring expert-level multi-discipline video understanding, 2025. URL [https://arxiv.org/abs/2501.12380](https://arxiv.org/abs/2501.12380).

Jeffrey Zhou, Tianjian Lu, Swaroop Mishra, Siddhartha Brahma, Sujoy Basu, Yi Luan, Denny Zhou, and Le Hou. Instruction-following evaluation for large language models. CoRR, abs/2311.07911, 2023.

Junjie Zhou, Yan Shu, Bo Zhao, Boya Wu, Shitao Xiao, Xi Yang, Yongping Xiong, Bo Zhang, Tiejun Huang, and Zheng Liu. Mlvu: A comprehensive benchmark for multi-task long video understanding. arXiv preprint arXiv:2406.04264, 2024.

23
