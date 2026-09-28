---
title: "对照: Qwen2-VL"
category: "主流模型"
published: true
excerpt: "Qwen2-VL 技术报告中英对照. Abstract / Introduction / Conclusion / References / Appendix 不译; 其余英文段落后接中文意译."
---

<!-- page 1 of 52 -->

arXiv:2409.12191v2 [cs.CV] 3 Oct 2024

# Qwen2-VL: Enhancing Vision-Language Model’s Perception of the World at Any Resolution # Qwen2-VL: 任意分辨率下增强视觉语言模型的世界感知

Peng Wang\* Shuai Bai\* Sinan Tan\* Shijie Wang\* Zhihao Fan\* Jinze Bai\*† Keqin Chen Xuejing Liu Jialin Wang Wenbin Ge Yang Fan Kai Dang Mengfei Du Xuancheng Ren Rui Men Dayiheng Liu Chang Zhou Jingren Zhou Junyang Lin† **Qwen Team Alibaba Group**

## Abstract

We present the Qwen2-VL Series, an advanced upgrade of the previous Qwen-VL models that redefines the conventional predetermined-resolution approach in visual processing. Qwen2-VL introduces the Naive Dynamic Resolution mechanism, which enables the model to dynamically process images of varying resolutions into different numbers of visual tokens. This approach allows the model to generate more efficient and accurate visual representations, closely aligning with human perceptual processes. The model also integrates Multimodal Rotary Position Embedding (M-RoPE), facilitating the effective fusion of positional information across text, images, and videos. We employ a unified paradigm for processing both images and videos, enhancing the model’s visual perception capabilities. To explore the potential of large multimodal models, Qwen2-VL investigates the scaling laws for large vision-language models (LVLMs). By scaling both the model size-with versions at 2B, 8B, and 72B parameters-and the amount of training data, the Qwen2-VL Series achieves highly competitive performance. Notably, the Qwen2-VL-72B model achieves results comparable to leading models such as GPT-4o and Claude3.5- Sonnet across various multimodal benchmarks, outperforming other generalist models. Code is available at [https://github.com/QwenLM/Qwen2-VL](https://github.com/QwenLM/Qwen2-VL).

## 1 Introduction

In the realm of artificial intelligence, Large Vision-Language Models (LVLMs) represent a significant leap forward, building upon the strong textual processing capabilities of traditional large language models. These advanced models now encompass the ability to interpret and analyze a broader spectrum of data, including images, audio, and video. This expansion of capabilities has transformed LVLMs into indispensable tools for tackling a variety of real-world challenges. Recognized for their unique capacity to condense extensive and intricate knowledge into functional representations, LVLMs are paving the way for more comprehensive cognitive systems. By integrating diverse data forms, LVLMs aim to more closely mimic the nuanced ways in which humans perceive and interact with their environment. This allows these models to provide a more accurate representation of how we engage with and perceive our environment

Recent advancements in large vision-language models (LVLMs) (Li et al., 2023c; Liu et al., 2023b; Dai et al., 2023; Zhu et al., 2023; Huang et al., 2023a; Bai et al., 2023b; Liu et al., 2023a; Wang et al., 2023b; OpenAI., 2023; Team et al., 2023) have led to significant improvements in a short span. These models (OpenAI, 2023; Touvron et al., 2023a,b; Chiang et al., 2023; Bai et al., 2023a) generally follow a common approach of visual encoder→cross-modal connector→LLM. This setup, combined with next-token prediction as the primary training method and the availability of high-quality datasets (Liu et al., 2023a; Zhang et al., 2023; Chen et al., 2023b;

<small><span class="docvortex-page-footnote" data-block-type="page_footnote" style="color:#6b7280">∗Equal core contribution, †Corresponding author</span></small>

<!-- page 2 of 52 -->

![Image block](images/p02-figure-1-qwen2-vl-capabilities-multilingual-image-text.png)

Figure 1: Qwen2-VL capabilities: Multilingual image text understanding, code/math reasoning, video analysis, live chat, agent potential, and more. See Appendix for details.

Li et al., 2023b), has driven much of the progress. Additional factors like larger model architectures (Alayrac et al., 2022), higher-resolution images (Li et al., 2023a,d), and advanced techniques such as mixture-of-expert models (MoE) (Wang et al., 2023b; Ye et al., 2023b), model ensembles (Lin et al., 2023), and more sophisticated connectors (Ye et al., 2023a) between visual and textual modalities have also played a key role in enhancing LVLMs’ ability to process complex visual and textual information more effectively.

However, current large vision-language models (LVLMs) are typically constrained by a fixed image input size. Standard LVLMs encode input images to a fixed resolution (e.g., 224×224), often by either downsampling or upsampling the images (Zhu et al., 2023; Huang et al., 2023a), or by employing a scale-then-padding approach (Liu et al., 2023b,a). While this one-size-fits-all strategy enables processing of images at consistent resolutions, it also limits the model’s ability to capture information at different scales, particularly leading to a significant loss of detailed information in high-resolution images. Consequently, such models fall short of perceiving visual information with the same sensitivity to scale and detail as human vision.

Additionally, most LVLMs rely on a static, frozen CLIP-style (Radford et al., 2021) vision encoder, raising concerns about whether the visual representations produced by such pre-trained models are adequate, particularly for complex reasoning tasks and processing intricate details within images. Recent works (Bai et al., 2023b; Ye et al., 2023a) have attempted to address these limitations by fine-tuning the vision transformer (ViT) during the LVLM training process, which has shown to yield improved results. To further enhance the model’s adaptability to varying resolutions, we introduce dynamic resolution training in the LVLM training process. Specifically, we employ a 2D Rotary Position Embedding (RoPE) in the ViT, thus allowing the model to better capture information across different spatial scales.

When it comes to video content, which is essentially a sequence of frames, many existing models continue to treat it as an independent modality. However, understanding the dynamic nature of reality, as manifested in videos, is crucial for models aiming to grasp the complexities of the real world. Unlike text, which is inherently one-dimensional, the real-world environment exists in three dimensions. The use of one-dimensional position embeddings in current models significantly limits their ability to model three-dimensional space and temporal dynamics effectively. To bridge this gap, we have developed Multimodal Rotary Position Embedding (M-

<!-- page 3 of 52 -->

Table 1: Model descriptions of Qwen2-VL.

| Model Name | Vision Encoder | LLM | Model Description |
| --- | --- | --- | --- |
| Qwen2-VL-2B | 675M | 1.5B | The most efficient model, designed to run on-device. It delivers adequate performance for most scenarios with limited resources. |
| Qwen2-VL-7B | 675M | 7.6B | The performance-optimized model in terms of cost, significantly upgraded for text recognition and video understanding capabilities. It delivers significant performance across a broad range of visual tasks. |
| Qwen2-VL-72B | 675M | 72B | The most capable model, further improvements in visual reasoning, instruction-following, decision-making, and agent capabilities. It delivers optimal performance on most complex tasks. |

RoPE), which employs separate components to represent temporal and spatial information. This enables the model to naturally comprehend dynamic content, such as videos or streaming data, improving its ability to understand and interact with the world.

Furthermore, compared to the scaling of large language models (LLMs), current LVLMs are still in the early stages of exploring the impact of scaling in terms of training data and model parameters. The exploration of scaling laws for LVLMs—how increases in model and data size affect performance—remains an open and promising area of research.

In this work, we introduce the newest addition to the large vision-language models of the Qwen family: Qwen2-VL series, which comprises three open-weight models with total parameter counts of 2 billion, 8 billion, and 72 billion. As shown in Figure 1, the key advances in Qwen2-VL include:

• **State-of-the-art understanding across various resolutions and aspect ratios:** Qwen2-VL achieves leading performance on visual benchmarks, including DocVQA, InfoVQA, RealWorldQA, MTVQA, MathVista, and others.

• **Comprehension of extended-duration videos (20 min+):** Qwen2-VL is capable of understanding videos over 20 minutes in length, enhancing its ability to perform high-quality video-based question answering, dialogue, content creation, and more.

• **Robust agent capabilities for device operation:** With advanced reasoning and decision-making abilities, Qwen2-VL can be integrated with devices such as mobile phones, robots, etc., enabling autonomous operation based on visual inputs and text instructions.

• **Multilingual support:** To serve a global audience, beyond English and Chinese, Qwen2-VL now supports multilingual context understanding within images, including most European languages, Japanese, Korean, Arabic, Vietnamese, and others.

## 2 Approach 方法

The Qwen2-VL series consists of models of 3 sizes, which are Qwen2-VL-2B, Qwen2-VL-7B and Qwen2-VL-72B. Table 1 lists the hyper-parameters and important information. Notably, Qwen2-VL employs a 675M parameter ViT across various-sized LLMs, ensuring that the computational load of the ViT remains constant regardless of the scale of the LLM.

Qwen2-VL 系列三档: Qwen2-VL-2B, Qwen2-VL-7B, Qwen2-VL-72B. 表 1 给超参与要点. 各尺寸 LLM 共用约 675M 参数的 ViT, 视觉侧算力不随 LLM 放大而变.

> **想:** 摘要写 versions at 2B, 8B, and 72B, 正文型号却是 2B / 7B / 72B, 哪个为准?
> 以表 1 与正文型号名为准: Qwen2-VL-2B / 7B / 72B. LLM 列是 1.5B / 7.6B / 72B; 摘要的 8B 是粗说体量, 不要和 7B 型号名对错号.

### 2.1 Model Architecture 模型架构

Figure 2 illustrates the comprehensive structure of Qwen2-VL. We have retained the Qwen-VL (Bai et al., 2023b) framework, which integrates vision encoders and language models. For various scale adaptations, we

图 2 给出整体结构: 沿用 Qwen-VL 的「视觉编码器 + 语言模型」框架. 为适配多种规模, 我们

<!-- page 4 of 52 -->

![Image block](images/p04-figure-2-qwen2-vl-is-capable-of-accurately-identifying.png)

Figure 2: Qwen2-VL is capable of accurately identifying and comprehending the content within images, regardless of their clarity, resolution, or extreme aspect ratios.

图 2｜无论清晰度, 分辨率或极端宽高比, Qwen2-VL 都能准确识别并理解图像内容.

have implemented a Vision Transformer (ViT) (Dosovitskiy et al., 2021) with approximately 675 million parameters, adept at handling both image and video inputs. In terms of language processing, we have opted for the more powerful Qwen2 (Yang et al., 2024) series of language models. To further enhance the model’s ability to effectively perceive and comprehend visual information in videos, we introduced several key upgrades:

实现了约 675M 参数的 ViT, 同时吃图像与视频; 语言侧换用更强的 Qwen2. 为更好感知视频视觉信息, 做了若干关键升级:

**Naive Dynamic Resolution** A key architectural improvement in Qwen2-VL is the introduction of naive dynamic resolution support (Dehghani et al., 2024). Unlike Qwen-VL, Qwen2-VL can now process images of any resolution, dynamically converting them into a variable number of visual tokens.<sup>1</sup> To support this feature, we modified ViT by removing the original absolute position embeddings and introducing 2D-RoPE (Su et al., 2024; Su, 2021) to capture the two-dimensional positional information of images. At the inference stage, images of varying resolutions are packed into a single sequence, with the packed length controlled to limit GPU memory usage. Furthermore, to reduce the visual tokens of each image, a simple MLP layer is employed after the ViT to compress adjacent 2 × 2 tokens into a single token, with the special <|vision\_start|> and <|vision\_end|> tokens placed at the beginning and end of the compressed visual tokens. As a result, an image with a resolution of 224 × 224, encoded with a ViT using patch\_size=14, will be compressed to 66 tokens before entering LLM.

**朴素动态分辨率.** 相对 Qwen-VL, 现可处理任意分辨率图像, 并动态变成可变数量视觉 token. ViT 去掉原绝对位置编码, 改用 **2D-RoPE** 刻画二维位置. 推理时不同分辨率图像打包进同一序列, 并控制打包长度以限制显存. ViT 后再接简单 MLP, 把相邻 2×2 token 压成 1 个, 两端加 `<|vision_start|>` / `<|vision_end|>`. 例如 224×224, `patch_size=14` 时, 进 LLM 前约压到 66 个 token.

> **问:** 224×224, patch_size=14, 压完怎么是 66 个 token?
> ViT 网格约 (224/14)^2 = 256 个 patch token; MLP 把相邻 2×2 压成 1 个得 64; 再加 vision_start / vision_end, 进 LLM 前约 66.

**Multimodal Rotary Position Embedding (M-RoPE)** Another key architectural enhancement is the innovation of Multimodal Rotary Position Embedding (M-RoPE). Unlike the traditional 1D-RoPE in LLMs, which is limited to encoding one-dimensional positional information, M-RoPE effectively models the positional

**M-RoPE.** 相对 LLM 常见的一维 RoPE, M-RoPE 把旋转位置编码拆成时间, 高, 宽三分量. (本段跨页, 续见下页.)

<small><span class="docvortex-page-footnote" data-block-type="page_footnote" style="color:#6b7280"><sup>1</sup>This technology was previously implemented in the internal iterations, Qwen-VL Plus and Qwen-VL MAX. We have further upgraded it in Qwen2-VL.</span></small>

<!-- page 5 of 52 -->

![Image block](images/p05-figure-3-a-demonstration-of-m-rope-by-decomposing.png)

Figure 3: A demonstration of M-RoPE. By decomposing rotary embedding into temporal, height, and width components, M-RoPE can explicitly model the positional information of text, images, and video in LLM.

图 3｜M-RoPE 示意: 旋转嵌入拆成时间, 高, 宽, 在 LLM 中显式建模文本, 图像与视频位置.

information of multimodal inputs. This is achieved by deconstructing the original rotary embedding into three components: temporal, height, and width. For text inputs, these components utilize identical position IDs, making M-RoPE functionally equivalent to 1D-RoPE (Su, 2024). When processing images, the temporal IDs of each visual token remain constant, while distinct IDs are assigned to the height and width components based on the token’s position in the image. For videos, which are treated as sequences of frames, the temporal ID increments for each frame, while the height and width components follow the same ID assignment pattern as images. In scenarios where the model’s input encompasses multiple modalities, position numbering for each modality is initialized by incrementing the maximum position ID of the preceding modality by one. An illustration of M-RoPE is shown in Figure 3. M-RoPE not only enhances the modeling of positional information but also reduces the value of position IDs for images and videos, enabling the model to extrapolate to longer sequences during inference.

对多模态输入的位置信息建模. 做法是把原旋转嵌入拆成时间, 高, 宽三分量. 文本三分量共用同一 position ID, 功能上等价 1D-RoPE; 图像时时间 ID 不变, 按 token 在图中位置赋高/宽 ID; 视频按帧递增时间 ID, 高宽同图像. 多模态拼接时, 后一模态的编号从前一模态最大 ID 加一开始. 示意见图 3. 除更好建模位置外, 还能压低图/视频的 position ID 数值, 利于推理时外推更长序列.

> **核对:** 文本三分量 ID 相同, 那和普通 1D-RoPE 算出来真一样吗?
> 报告写 functionally equivalent to 1D-RoPE. 实现上三分量共用同一 ID, 读作与 1D 等价即可; 细公式见 RoPE 单独成篇.

**Unified Image and Video Understanding** Qwen2-VL employs a mixed training regimen incorporating both image and video data, ensuring proficiency in image understanding and video comprehension. To preserve video information as completely as possible, we sampled each video at two frames per second. Additionally, we integrated 3D convolutions (Carreira and Zisserman, 2017) with a depth of two to process video inputs, allowing the model to handle 3D tubes instead of 2D patches, thus enabling it to process more video frames without increasing the sequence length (Arnab et al., 2021). For consistency, each image is treated as two identical frames. To balance the computational demands of long video processing with overall training efficiency, we dynamically adjust the resolution of each video frame, limiting the total number of tokens per video to 16384. This training approach strikes a balance between the model’s ability to comprehend long videos and training efficiency.

**图像与视频统一理解.** 图, 视频混合训练. 视频尽量保信息, 按 2 fps 采样; 并用深度为 2 的 3D 卷积处理, 吃 3D tube 而非仅 2D patch, 从而在不拉长序列的前提下吞更多帧. 图像视为两帧相同画面以保持一致. 为平衡长视频算力与训练效率, 动态调每帧分辨率, 单视频 token 上限 16384.

> **看表:** 图像当两帧相同画面, 是为了迁就深度为 2 的 3D 卷积吗?
> 是. 深度 2 的 3D 卷积吃 tube; 图像复制成两帧才能走同一条视频通路, 并与 2 fps 采样策略对齐.

### 2.2 Training 训练

Following Qwen-VL (Bai et al., 2023b), we adopt a three-stage training methodology. In the first stage, we focus exclusively on training the Vision Transformer (ViT) component, utilizing a vast corpus of image-text pairs to enhance semantic understanding within the Large Language Model (LLM). In the second stage, we unfreeze all parameters and train with a wider range of data for more comprehensive learning. In the final stage, we lock the ViT parameters and perform exclusive fine-tuning of the LLM using instructional datasets.

沿用 Qwen-VL 三阶段: (1) 只训 ViT, 用大规模图文对加强与 LLM 的语义对齐; (2) 解冻全部参数, 用更广数据综合学习; (3) 锁定 ViT, 仅用指令数据微调 LLM.

> **想:** 第三阶段锁 ViT 只训 LLM, 和第一阶段只训 ViT, 会不会把视觉侧学歪后再冻住?
> 这是经典三阶段对齐: 先视觉对齐, 再联合, 最后指令微调保视觉稳定. 是否最优报告未消融对比两阶段变体.

The model is pre-trained on a diverse dataset that includes image-text pairs, optical character recognition (OCR) data, interleaved image-text articles, visual question answering datasets, video dialogues, and image knowledge datasets. Our data sources primarily comprise cleaned web pages, open-source datasets, and synthetic data. The cutoff date for our data knowledge is June 2023. This diverse data composition is instrumental in developing a robust multimodal understanding capability.

预训练数据含图文对, OCR, 图文交错文章, VQA, 视频对话, 图像知识等; 来源以清洗网页, 开源集与合成数据为主; 知识截止 2023 年 6 月.

During the initial pre-training phase, Qwen2-VL is exposed to a corpus of around 600 billion tokens. The LLM component of Qwen2-VL is initialized using the parameters from Qwen2 (Yang et al., 2024), while the vision encoder of Qwen2-VL is initialized with the ViT derived from DFN. However, the fixed position embedding in the original DFN’s ViT (Fang et al., 2023) is replaced by RoPE-2D. This pre-training phase

第一阶段约 6000 亿 token: LLM 用 Qwen2 初始化, 视觉侧用 DFN 的 ViT, 但把原固定位置编码换成 RoPE-2D. 本阶段

<!-- page 6 of 52 -->

primarily focuses on learning image-text relationships, textual content recognition within images through OCR, and image classification tasks. Such foundational training is instrumental in enabling the model to develop a robust understanding of core visual-textual correlations and alignments.

重点学图文关系, 图内 OCR 与图像分类, 为视觉—文本对齐打底.

The second pre-training phase marks a significant progression, involving an additional 800 billion tokens of image-related data. This stage introduces a higher volume of mixed image-text content, facilitating a more nuanced understanding of the interplay between visual and textual information. The incorporation of visual question answering datasets refines the model’s capacity to respond to image-related queries. Moreover, the inclusion of multitasking datasets is pivotal in developing the model’s ability to navigate diverse tasks concurrently, a skill of paramount importance when dealing with complex, real-world datasets. Concurrently, purely textual data continues to play a crucial role in maintaining and advancing the model’s linguistic proficiency.

第二阶段再加约 8000 亿图像相关 token: 更多混合图文, VQA 与多任务数据, 同时保留纯文本以维持语言能力.

Throughout the pre-training stages, Qwen2-VL processes a cumulative total of 1.4 trillion tokens. Specifically, these tokens encompass not only text tokens but also image tokens. During the training process, however, we only provide supervision for the text tokens. This exposure to extensive and diverse linguistic and visual scenarios ensures that the model develops a deep understanding of the intricate relationships between visual and textual information, thereby laying a robust foundation for various multimodal tasks.

预训练累计约 1.4 万亿 token (含文本与图像 token), 但监督只落在文本 token 上.

> **拆开:** 1.4T 里图像 token 也算进去了, 但 loss 只监督文本 token, 视觉侧怎么学?
> 视觉 token 进上下文, 梯度仍从要预测的文本 token 回传, 所以视觉编码器与连接器靠「预测对的文本」间接受训.

During the instruction fine-tuning phase, we employ the ChatML (Openai, 2024) format to construct instruction-following data. This dataset encompasses not only pure text-based dialogue data but also multimodal conversational data. The multimodal components include image question-answering, document parsing, multi-image comparison, video comprehension, video stream dialogue, and agent-based interactions. Our comprehensive approach to data construction aims to enhance the model’s capability to understand and execute a wide range of instructions across various modalities. By incorporating diverse data types, we seek to develop a more versatile and robust language model capable of handling complex, multimodal tasks in addition to traditional text-based interactions.

指令微调阶段用 ChatML 格式构造数据: 含纯文本对话, 以及图像问答, 文档解析, 多图比较, 视频理解, 视频流对话, agent 交互等多模态对话.

#### 2.2.1 Data Format 数据格式

In line with Qwen-VL, Qwen2-VL also employs special tokens to distinguish vision and text inputs. Tokens <|vision\_start|> and <|vision\_end|> are inserted at the start and end of the image feature sequence to demarcate the image content.

与 Qwen-VL 一致, 用 `<|vision_start|>` / `<|vision_end|>` 标出图像特征序列边界.

**Dialogue Data.** In terms of dialogue format, we construct our instruction tuning dataset using the ChatML format, where each interaction’s statement is marked with two special tokens (<|im\_start|> and <|im\_end|>) to facilitate dialogue termination. The sections marked in blue indicate the supervised parts.

**对话数据.** 指令微调用 ChatML: 每轮语句用 `<|im_start|>` / `<|im_end|>` 包裹; 原文蓝色部分为监督片段.

```txt
<|im_start|>user
<|vision_start|>Picture1.jpg<|vision_end|><|vision_start|>Picture2.jpg<|vision_end|>What do the two pictures have in common?
```

**Visual Grounding.** To endow the model with visual grounding capabilities, bounding box coordinates are normalized within [0, 1000) and represented as "(X<sub>top</sub> left, Y<sub>top</sub> left), (X<sub>bottom</sub> right, Y<sub>bottom</sub> right)". Tokens

**视觉定位 (grounding).** 框坐标归一化到 [0, 1000), 写成左上—右下形式. (本段跨页.)

> **确认:** 框坐标归一化到 [0, 1000), 和 UI agent 里 point 也是 0 到 1000, 是同一套吗?
> 报告两处都用 0–1000 量纲, 便于统一表示; 但 grounding 输出的是框角点对, agent 的 Tap 是单点, 语义不同, 不要混成同一种动作.

<!-- page 7 of 52 -->

| Referring Grounding |
| --- |
| Picture1.jpgthe eyes on a giraffe(176,106),(232,160)&lt;box_end> |

<|box\_start|> and <|box\_end|> are utilized to demarcate bounding box text. To accurately link bounding boxes with their textual descriptions, we introduce tokens <|object\_ref\_start|> and <|object\_ref\_end|> to indicate the content that the bounding box references, thereby allowing the model to effectively interpret and generate precise descriptions of specific regions.

`<|box_start|>` / `<|box_end|>` 包住框文本; 用 `<|object_ref_start|>` / `<|object_ref_end|>` 标出框所指对象描述.

**Visual Agent.** To develop Qwen2-VL as a general-purpose VL-Agent, we treat various agent tasks, such as UI Operations, Robotic Control, Games, and Navigation, as sequential decision-making problems, enabling Qwen2-VL to accomplish tasks through multi-step action execution. For each task, we first define a set of permissible actions and keywords pattern (underline) for function call (Qwen Team, 2024). Qwen2-VL then analyzes the observations, performs reasoning and planning, executes the selected actions, and interacts with the environment to acquire new observations. This cycle repeats iteratively until the task is successfully completed. By integrating various tools and leveraging the vision perception capabilities of large visionlanguage models (LVLMs), Qwen2-VL is able to iteratively execute increasingly complex tasks involving real-world visual interactions.

**视觉 Agent.** UI 操作, 机器人控制, 游戏, 导航等被当作序贯决策: 定义允许动作与函数调用关键词模式; 模型观察 → 推理规划 → 执行动作 → 获新观察, 循环至完成.

| Visual Agent |
| --- |
| system |
| You are a helpful assistant. |
| # Actions |
| ## You have the following actions. |
| ### Tap |
| Tap: A gentle tap that commands, chooses, or navigates through a smartphone's user interface. |
| Parameters: [{"name": "point", "description": "The specific spot of interest on the monitor, denoted by the coordinates (x, y) where x and y range from 0 to 1000.", "required": True}] |
| ### Home |
| Home: Go to phone's home screen. Parameters: [] |
| ### Other Actions ... |
| ## Continuously take action until the task is completed. |
| *FUNCTION*: The action to take, should be one of {Actions}. |
| *ARGS*: The input of the action. |
| *RESULT*: Action results. |
| *RETURN*: Reply based on action results. |

<!-- page 8 of 52 -->

### 2.3 Multimodal Model Infrastructure 多模态基础设施

The Qwen2-VL models were trained on Alibaba Cloud’s PAI-Lingjun Intelligent Computing Service (Alibaba-Cloud, 2024c) with its scalable computing, auto resuming and straggler detection.

训练跑在阿里云 PAI-灵骏: 可扩展算力, 自动续跑与掉队检测.

**Storage.** We use Alibaba Cloud’s ultra-speed CPFS (Cloud Parallel File Storage) (Alibaba-Cloud, 2024a) to build a storage system of Qwen2-VL pre-training and post-training. We decoupled the text data and vision data storage. We simply store text data on CPFS and use mmap for efficient access. For vision data, we use Alibaba Cloud’s OSS (Object Storage Service) (Alibaba-Cloud, 2024b) for persistent storage. During training, we accessed vision data through OSS’s python-client concurrently and tuned the concurrency and retrying parameters to avoid reaching the QPS (queries per second) limit. We also found that video data decoding is a main bottleneck, especially for long videos. After several attempts with open-source (FFmpeg-Developers, 2024) and in-house software failed, we opted for a caching decoding technique. Checkpointing saves each GPU’s optimizer and model states on CPFS.

**存储.** 文本与视觉解耦: 文本落 CPFS + mmap; 视觉持久化在 OSS, 训练时并发拉取并调重试以免触 QPS 上限. 长视频解码是瓶颈, 最终采用缓存解码. 检查点把各 GPU 的优化器与模型状态存 CPFS.

> **对一下:** 开源与自研解码都失败才上缓存解码, 复现训练时普通人怎么办?
> 报告没开源该缓存解码器细节. 复现重点应放在动态分辨率与 M-RoPE; 长视频 I/O 要自备解码与缓存策略.

**Parallelism.** We use 3D parallelism which combines data parallelism (DP) (Li et al., 2020), tensor parallelism (TP) (Krizhevsky et al., 2012; Shoeybi et al., 2019) and pipeline parallelism (PP) (Huang et al., 2019; Narayanan et al., 2021; Lamy-Poirier, 2023) to scale Qwen2-VL model training. We also leverage deepspeed’s zero-1 redundancy optimizer (Rajbhandari et al., 2020) to shard states for memory saving. Sequence parallelism (SP) (Korthikanti et al., 2023) with selective checkpointing activation (Chen et al., 2016) was leveraged to reduce memory usage. When enabling TP training, we always shard the vision encoder and large language models together but not the vision merger due to its relatively few parameters. We found the TP training would result in different model shared-weights due to the convolution operator’s non-deterministic behavior <sup>2</sup>. We resolved this issue by performing offline reduction of the shared weights, thereby avoiding an additional **all-reduce** communication step. This approach resulted in only a minimal impact on performance. We leverage 1F1B PP (Narayanan et al., 2021) for Qwen2-VL 72B training. We combine the vision encoder, vision adapter and several LLM’s decoder layers into one stage, and evenly split the remaining decoder layers. Note that the vision and text sequence lengths are dynamic for each data point. We **broadcast** the dynamic sequence lengths before initiating the 1F1B process and access the shape information using batch indices. We also implemented an interleaved 1F1B PP (Narayanan et al., 2021) but found it is slower than the standard 1F1B setting.

**并行.** DP+TP+PP 三维并行, 并配 ZeRO-1 与序列并行 (选择性激活重计算). 开 TP 时视觉编码器与 LLM 一起切分, vision merger 因参数少不切. 卷积非确定性会导致共享权重不一致, 用离线归约共享权重解决, 避免额外 all-reduce. 72B 用 1F1B 流水线; 交错 1F1B 实测更慢.

> **回看:** TP 下卷积非确定性导致共享权重不一致, 离线归约会不会改掉已学好的表示?
> 报告说对性能影响很小, 目的是消掉各 TP 分片间的数值漂移, 避免再付一次 all-reduce. 不是重新训练.

**Software.** We use PyTorch (Paszke et al., 2019; Ansel et al., 2024) version 2.1.2 with CUDA 11.8 (Nvidia, 2024b) for training. Additionally, we leverage flash-attention (Dao et al., 2022; Dao, 2024; Shah et al., 2024) for efficient training in both the vision encoder and the LLM. We also utilize fused operators (Nvidia, 2024a) such as LayerNorm (Ba et al., 2016), RMSNorm (Zhang and Sennrich, 2019), and Adam (Loshchilov and Hutter, 2019). Besides this, we leverage the overlap of communication and computation during matrix multiplication in our training process.

**软件.** PyTorch 2.1.2 + CUDA 11.8; FlashAttention; 融合 LayerNorm / RMSNorm / Adam; 通信与矩阵乘重叠.

## 3 Experiments 实验

In this section, we first evaluate the model’s performance by conducting a comparative analysis across a variety of visual benchmarks, demonstrating the advantages of our approach. Subsequently, we carry out a detailed examination of specific capabilities, including general visual perception, document understanding, multilingual recognition in images, video comprehension, and agent abilities. Finally, we present an ablation study to investigate several key components of our approach.

本节先在多项视觉基准上对比; 再细看通用视觉, 文档, 多语 OCR, 视频与 agent; 最后做关键组件消融.

<small><span class="docvortex-page-footnote" data-block-type="page_footnote" style="color:#6b7280"><sup>2</sup>[https://pytorch.org/docs/stable/notes/randomness.html](https://pytorch.org/docs/stable/notes/randomness.html)</span></small>

<!-- page 9 of 52 -->

Table 2: Performance Comparison of Qwen2-VL Models and State-of-the-art.

表 2｜Qwen2-VL 与 SoTA / 闭源对照.

| Benchmark | Previous SoTA | Claude-3.5 Sonnet | GPT-4o | Qwen2-VL-72B | Qwen2-VL-7B | Qwen2-VL-2B |
| --- | --- | --- | --- | --- | --- | --- |
| MMMU<sub>val</sub> (Yue et al., 2023) | 66.1 (X.AI, 2024b) | 68.3 | 69.1 | 64.5 | 54.1 | 41.1 |
| DocVQA<sub>test</sub> (Mathew et al., 2021) | 94.1 (Chen et al., 2024c) | 95.2 | 92.8 | 96.5 | 94.5 | 90.1 |
| InfoVQA<sub>test</sub> (Mathew et al., 2021) | 82.0 (Chen et al., 2024c) | - | - | 84.5 | 76.5 | 65.5 |
| AI2D (Kembhavi et al., 2016) | 87.6 (Chen et al., 2024c) | 80.2(94.7) | 84.6(94.2) | 88.1 | 83.0 | 74.7 |
| ChartQA<sub>test</sub> (Masry et al., 2022) | 88.4 (Chen et al., 2024c) | 90.8 | 85.7 | 88.3 | 83.0 | 73.5 |
| TextVQA<sub>val</sub> (Singh et al., 2019) | 84.4 (Chen et al., 2024c) | - | - | 85.5 | 84.3 | 79.7 |
| OCRBench (Liu et al., 2023e) | 852 (Yao et al., 2024) | 788 | 736 | 877 | 866 | 809 |
| MTVQA (Tang et al., 2024) | 23.2 (Team et al., 2023) | 25.7 | 27.8 | 30.9 | 25.6 | 18.1 |
| VCR<sub>eneasy</sub> (Zhang et al., 2024c) | 84.7 (Chen et al., 2024c) | 63.9 | 91.6 | 91.9 | 89.7 | 81.5 |
| VCR<sub>zheasy</sub> (Zhang et al., 2024c) | 22.1 (Chen et al., 2024c) | 1.0 | 14.9 | 65.4 | 59.9 | 46.2 |
| RealWorldQA (X.AI, 2024a) | 72.2 (Chen et al., 2024c) | 60.1 | 75.4 | 77.8 | 70.1 | 62.9 |
| MME<sub>sum</sub> (Fu et al., 2023) | 2414.7 (Chen et al., 2024c) | 1920.0 | 2328.7 | 2482.7 | 2326.8 | 1872.0 |
| MMBench-EN<sub>test</sub> (Liu et al., 2023d) | 86.5 (Chen et al., 2024c) | 79.7 | 83.4 | 86.5 | 83.0 | 74.9 |
| MMBench-CN<sub>test</sub> (Liu et al., 2023d) | 86.3 (Chen et al., 2024c) | 80.7 | 82.1 | 86.6 | 80.5 | 73.5 |
| MMBench-V1.1<sub>test</sub> (Liu et al., 2023d) | 85.5 (Chen et al., 2024c) | 78.5 | 82.2 | 85.9 | 80.7 | 72.2 |
| MMT-Bench<sub>test</sub> (Ying et al., 2024) | 63.4 (Chen et al., 2024b) | - | 65.5 | 71.7 | 63.7 | 54.5 |
| MMStar (Chen et al., 2024a) | 67.1 (Chen et al., 2024c) | 62.2 | 63.9 | 68.3 | 60.7 | 48.0 |
| MMVet<sub>GPT-4-</sub>Turbo (Yu et al., 2024) | 67.5 (OpenAI., 2023) | 66.0 | 69.1 | 74.0 | 62.0 | 49.5 |
| HallBench<sub>avg</sub> (Guan et al., 2023) | 55.2 (Chen et al., 2024c) | 49.9 | 55.0 | 58.1 | 50.6 | 41.7 |
| MathVista<sub>testmini</sub> (Lu et al., 2024a) | 69.0 (X.AI, 2024b) | 67.7 | 63.8 | 70.5 | 58.2 | 43.0 |
| MathVision (Wang et al., 2024) | 30.3 (OpenAI, 2023) | - | 30.4 | 25.9 | 16.3 | 12.4 |
| MMMU-Pro (Yue et al., 2024) | 46.9 (Team et al., 2023) | 51.5 | 51.9 | 46.2 | 43.5 | 37.6 |

Table 3: Performance of Qwen2-VL and GPT-4o on internal multilingual OCR benchmarks.

表 3｜内部多语 OCR: Qwen2-VL-72B vs GPT-4o.

| Language | Korean | Japanese | French | German | Italian | Russian | Vietnamese | Arabic |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| GPT-4o | 87.8 | 88.3 | 89.7 | 88.3 | 74.1 | 96.8 | 72.0 | 75.9 |
| Qwen2-VL-72B | 94.5 | 93.4 | 94.1 | 91.5 | 89.8 | 97.2 | 73.0 | 70.7 |

### 3.1 Compare to SOTAs 与 SoTA 对比

We evaluate the visual capabilities of our model through various visual benchmarks, video tasks, and agentbased assessments. Qwen2-VL demonstrates highly competitive performance at the same scale, achieving new state-of-the-art (SoTA) results. Overall, our 72B model consistently delivers top-tier performance across most evaluation metrics, frequently surpassing even closed-source models such as GPT-4o (OpenAI, 2024) and Claude 3.5-Sonnet (Anthropic, 2024). Notably, it exhibits a significant advantage in document understanding tasks. However, in the MMMU (Yue et al., 2023) benchmark, our model still lags behind GPT-4o to some extent, indicating that Qwen2-VL-72B has room for improvement when handling more complex and challenging problem sets.

同规模下竞争力强, 多处新 SoTA. 72B 在多数指标顶档, 常超过 GPT-4o 与 Claude 3.5-Sonnet, 文档理解优势尤其明显. 但在 MMMU 上仍落后 GPT-4o 一截, 说明复杂高难度题集仍有提升空间.

> **停一下:** 文档理解很强, 但 MMMU 落后, 这和动态分辨率叙事打架吗?
> 不打架. 消融里也写 MMMU 对抬分辨率几乎不敏感, 瓶颈更偏推理与知识. 文档/OCR 吃分辨率与 OCR 数据; MMMU 吃的是另一刀.

### 3.2 Quantitative Results 定量结果

In this section, we present an extensive evaluation of the Qwen2-VL series across an array of datasets, offering a comprehensive understanding of the model’s capabilities in various aspects.

本节在多类数据集上系统评测, 从各侧面刻画能力剖面.

#### 3.2.1 General Visual Question Answering 通用视觉问答

To rigorously assess our models’ capabilities in general visual question answering tasks, we conduct extensive evaluations across a diverse array of state-of-the-art benchmarks: RealWorldQA (X.AI, 2024a), MMStar (Chen et al., 2024a), MMVet (Yu et al., 2024), MMT-Bench (Ying et al., 2024), MMBench (Liu et al., 2023d), MMbench-1.1 (Liu et al., 2023d), MME (Fu et al., 2023), and HallusionBench (Guan et al., 2023). The Qwen2-VL series exhibits exceptional performance across these benchmarks, with the 72B model consistently achieving or surpassing state-of-the-art results, while the 7B and 2B variants also demonstrate robust capabilities. On RealWorldQA, which evaluates real-world spatial comprehension, Qwen2-VL-72B achieves a

通用 VQA 覆盖 RealWorldQA, MMStar, MMVet, MMT-Bench, MMBench, MMBench-1.1, MME, HallusionBench 等. 72B 多处达到或超过 SoTA, 7B/2B 也扎实. RealWorldQA 上 72B 得

<!-- page 10 of 52 -->

Table 4: Performance of Qwen2-VL and other models on video benchmarks.

表 4｜视频基准.

| Benchmark | Previous SoTA | Gemini 1.5-Pro | GPT-4o | Qwen2-VL-72B | Qwen2-VL-7B | Qwen2-VL-2B |
| --- | --- | --- | --- | --- | --- | --- |
| MVBench (Li et al., 2024) | 69.6 | - | - | 73.6 | 67.0 | 63.2 |
| PerceptionTest<sub>test</sub> (Patraucean et al., 2024) | 66.9 | - | - | 68.0 | 62.3 | 53.9 |
| EgoSchema<sub>test</sub> (Mangalam et al., 2023) | 62.0 | 63.2 | 72.2 | 77.9 | 66.7 | 54.9 |
| Video-MME(wo/wsubs) (Fu et al., 2024) | 66.3/69.6 | 75.0/81.3 | 71.9/77.2 | 71.2/77.8 | 63.3/69.0 | 55.6/60.4 |

Table 5: Performance Comparison of Qwen2-VL-72B across various agent benchmarks and GPT-4o. SR, GC, TM and EM are short for success rate, goal-condition success, type match and exact match. ALFRED, R2R and REVERIE are performance in valid-unseen.

表 5｜Agent 基准 (TM/EM/SR/GC) vs GPT-4o.

| Benchmark General FnCall | Metric TM EM | Previous SoTA-- | GPT-4o90.250.0 | Qwen2-VL-72B93.153.2 |
| --- | --- | --- | --- | --- |
| UI Operations AITZ (Zhang et al., 2024b) | TM EM | 83.0 (Hong et al., 2023) 47.7 (Zhan and Zhang, 2023) | 70.035.3 | 89.672.1 |
| Number Line (Zhai et al., 2024) | SR | 89.4 (Zhai et al., 2024) | 91.5 | 100.0 |
| BlackJack (Zhai et al., 2024) | SR | 40.2 (Zhai et al., 2024) | 34.5 | 42.6 |
| Card Games |  |  |  |  |
| EZPoint (Zhai et al., 2024) | SR | 50.0 (Zhai et al., 2024) | 85.5 | 100.0 |
| Point24 (Zhai et al., 2024) | SR | 2.6 (Liu et al., 2023b) | 3.0 | 4.5 |
| Robotic Control ALFRED (Shridhar et al., 2020a) | SR GC | 67.7 (Lu et al., 2023) 75.3 (Lu et al., 2023) | -- | 67.875.8 |
| R2R (Anderson et al., 2018) | SR | 79.0 (Chen et al., 2022) | 43.7 | 51.7 |
| Navigation |  |  |  |  |
| REVERIE (Qi et al., 2020) | SR | 61.0 (Sigurdsson et al., 2023) | 31.6 | 31.0 |

score of 77.8, surpassing both the previous state-of-the-art (72.2) and formidable baselines such as GPT-4o (75.4), thus demonstrating superior understanding of physical environments. For MMStar, a benchmark designed to assess genuine multimodal capabilities through visually indispensable samples, Qwen2-VL-72B attains 68.3, outperforming the previous best of 67.1 and highlighting its proficiency in integrating visual and textual information. On MMVet, which evaluates the integration of core vision-language capabilities across 16 complex multimodal tasks, Qwen2-VL-72B achieves a remarkable 74.0, significantly outperforming strong competitors including GPT-4V (67.5) and showcasing its versatility in addressing diverse multimodal challenges. In the MMT-Bench evaluation, which assesses advanced reasoning and instruction following across 32 core meta-tasks and 162 subtasks in multimodal understanding, Qwen2-VL-72B achieves 71.7, markedly surpassing the previous best (63.4) and demonstrating its prowess in applying expert knowledge and executing deliberate visual recognition, localization, reasoning, and planning. On MMBench, which evaluates fine-grained abilities across 20 dimensions, Qwen2-VL-72B exhibits strong performance, achieving 86.5 on the English test set, matching the state-of-the-art, and 86.6 on the Chinese test set, establishing a new benchmark. For MME, which measures a wide spectrum of perception and cognition abilities across 14 subtasks, Qwen2-VL-72B achieves a cumulative score of 2482.7, significantly outperforming the previous best (2414.7), underscoring its advanced capabilities in both visual perception and high-level cognition tasks.

77.8, 超过先前 SoTA (72.2) 与 GPT-4o (75.4). MMStar 68.3 (先前最佳 67.1). MMVet 74.0 (高于 GPT-4V 的 67.5). MMT-Bench 71.7 (先前最佳 63.4). MMBench 英测 86.5 持平 SoTA, 中测 86.6 新高. MME 累计 2482.7 (先前最佳 2414.7).

> **再看:** MME 2482.7 是 sum, 和其他百分制榜能直接比吗?
> 不能. MME 是多子任务累加分, 量纲不同. 同表内和 Previous SoTA 2414.7 比即可, 不要换算成准确率.

These comprehensive results underscore the Qwen2-VL series’ exceptional proficiency in general visual question answering tasks. The models demonstrate advanced capabilities in real-world spatial comprehension, genuine multimodal integration, complex reasoning, instruction following, and a broad range of perception and cognition tasks. The consistent superior performance across diverse benchmarks, particularly the outstanding results of the 72B model, positions the Qwen2-VL series as a leading solution in the field of visual question answering. Our models excel in handling visually indispensable tasks, integrating core vision-language capabilities, and demonstrating expertise across diverse multimodal scenarios, ranging from fundamental perception tasks to complex reasoning and planning. This exhaustive evaluation highlights the Qwen2-VL series’ versatility and effectiveness in addressing the multifaceted challenges posed by state-of-the-art multimodal benchmarks, thereby setting a new standard for large vision-language models.

综合看, 通用 VQA 上空间理解, 真多模态融合, 复杂推理与指令遵循都强; 72B 把系列推到通才 LVLM 前列.

<!-- page 11 of 52 -->

#### 3.2.2 Document and Diagrams Reading 文档与图表阅读

We tested our model’s OCR and document and diagram comprehension on DocVQA (Mathew et al., 2021), ChartQA (Masry et al., 2022),InfoVQA (Mathew et al., 2021), TextVQA (Singh et al., 2019),AI2D (Kembhavi et al., 2016) datasets. The DocVQA/InfoVQA/ChartQA dataset focuses on the model’s ability to comprehend text in documents/high-resolution infographics/charts, while the TextVQA dataset examines the ability to comprehend text in naturalistic images. The OCRBench dataset is a a dataset of mixed tasks, which focuses on mathematical formula parsing and information extraction in addition to the text-based VQA. The AI2D dataset focuses on multiple-choice questions on scientific diagrams containing text. In addition, we also tested the OCR and formula recognition capabilities of our model on OCRBench (Liu et al., 2023e), as well as the multilingual OCR capabilities of our model on the MTVQA (Tang et al., 2024) dataset.

在 DocVQA, ChartQA, InfoVQA, TextVQA, AI2D 上测 OCR 与文档/图表理解; DocVQA/InfoVQA/ChartQA 偏文档/高清信息图/图表文字, TextVQA 偏自然图文字; OCRBench 还含公式解析与信息抽取; AI2D 偏含文字的科学示意图选择题. 另在 OCRBench 与 MTVQA 测公式与多语 OCR.

The experimental results show that our model achieves SoTA level in several metrics, including DocVQA, InfoVQA, TextVQA and OCRBench, demonstrating that our model has good comprehension of textual content in images from multiple domains.

DocVQA, InfoVQA, TextVQA, OCRBench 等多指标达 SoTA, 说明跨域图内文字理解扎实.

#### 3.2.3 Multilingual Text Recognition and Understanding 多语文字识别与理解

In particular, our model surpasses all existing general-purpose LVLMs in multilingual OCR. Our model not only outperforms existing LVLMs (including proprietary models such as GPT-4o, Claude 3.5 Sonnet, etc.) on the public-available MTVQA dataset, it also outperforms GPT-4o on the in-house internal benchmark across all foreign languages except Arabic (Table 3).

多语 OCR 上超过现有通才 LVLM: 公开 MTVQA 领先 GPT-4o / Claude 3.5 Sonnet 等; 内部榜除阿拉伯语外也全面高于 GPT-4o (表 3).

> **对一下:** 表 3 阿拉伯语 70.7 低于 GPT-4o 的 75.9, 和「全面超过」怎么并存?
> 正文已写 except Arabic. 公开 MTVQA 与内部多语多数项领先; 阿拉伯语是明确例外, 以表 3 为准.

#### 3.2.4 Mathematical Reasoning 数学推理

We’ve conducted experiments on the MathVista (Lu et al., 2024a) and MathVision (Wang et al., 2024) datasets to assess mathematical reasoning capabilities. MathVista is a comprehensive benchmark featuring 6,141 diverse examples of mathematical and visual tasks. The MathVision dataset comprises 3,040 math problems embedded in visual contexts from actual math competitions, covering 16 mathematical disciplines and varying in difficulty across five levels. These challenges underscore the necessity for LVLMs to exhibit strong visual comprehension, a deep understanding of mathematics, and sound logical reasoning skills. The Qwen2-VL series has demonstrated superior performance on MathVista, achieving a 70.5 outperforming other LVLMs. Additionally, it has set a new open-source benchmark on MathVision with 25.9.

MathVista (6141 例) 与 MathVision (3040 题, 16 学科, 五档难度) 测数学推理. MathVista 上得 70.5 领先; MathVision 25.9 创开源新高.

> **想:** MathVista 70.5 很亮, MathVision 25.9 仍远低于 GPT-4o 的 30.4, 该信哪张?
> 两张都信, 题型不同. MathVista 综合视觉数学; MathVision 更偏竞赛嵌图. 开源新高不等于追上闭源竞赛卷.

#### 3.2.5 Referring Expression Comprehension 指代表达理解

Regarding visual localization task, we evaluate Qwen2-VL on RefCOCO, RefCOCO+, and RefCOCOg datasets (Kazemzadeh et al., 2014; Mao et al., 2016). The results, as depicted in Table 6, demonstrate that Qwen2-VL attains top-tier results among generalist models. Benefiting from a more rational structure design, Qwen2-VL is able to perceive details in high-resolution images, leading to significant improvements over Qwen-VL. The superiority of these models in comparison to both generalist and specialized models highlights their potential for advancing the field of visual localization and their capacity for real-world implementation in tasks requiring precise visual understanding.

在 RefCOCO / RefCOCO+ / RefCOCOg 上评视觉定位 (表 6). 通才模型里顶档; 结构设计更合理, 高清细节感知强于 Qwen-VL, 相对专精模型也有竞争力.

#### 3.2.6 Video Understanding 视频理解

We evaluate our models on various video understanding tasks, with related benchmarks covering short videos of a few seconds to long videos of up to one hour. Table 4 presents the performance of Qwen2-VL and baseline models. Overall, Qwen2-VL demonstrates strong results across 2B, 7B, and 72B sizes, with Qwen2-VL-72B achieving the best performance on MVBench (Li et al., 2024), PerceptionTest (Patraucean et al., 2024), and EgoSchema (Mangalam et al., 2023). This showcases Qwen2-VL’s superior capabilities in

视频基准覆盖数秒短片到约一小时长片. 表 4 显示 2B/7B/72B 都强, 72B 在 MVBench, PerceptionTest, EgoSchema 最佳. 这体现视频理解优势, 且

<!-- page 12 of 52 -->

Table 6: Performance Comparison on Referring Expression Comprehension Task.

表 6｜指代表达理解 (RefCOCO 系列).

<table><tr><td rowspan="2">Type</td><td rowspan="2">Model</td><td colspan="3">RefCOCO</td><td colspan="3">RefCOCO+</td><td colspan="2">RefCOCOg</td></tr><tr><td>val</td><td>test-A</td><td>test-B</td><td>val</td><td>test-A</td><td>test-B</td><td>val</td><td>test</td></tr><tr><td rowspan="11">Generalist</td><td>OFA-L (Wang et al., 2022)</td><td>80.0</td><td>83.7</td><td>76.4</td><td>68.3</td><td>76.0</td><td>61.8</td><td>67.6</td><td>67.6</td></tr><tr><td>Shikra (Chen et al., 2023a)</td><td>87.0</td><td>90.6</td><td>80.2</td><td>81.6</td><td>87.4</td><td>72.1</td><td>82.3</td><td>82.2</td></tr><tr><td>Qwen-VL (Bai et al., 2023b)</td><td>89.4</td><td>92.3</td><td>85.3</td><td>83.1</td><td>88.3</td><td>77.2</td><td>85.6</td><td>85.5</td></tr><tr><td>Ferretv2 (Zhang et al., 2024a)</td><td>92.6</td><td>95.0</td><td>88.9</td><td>87.4</td><td>92.1</td><td>81.4</td><td>89.4</td><td>90.0</td></tr><tr><td>CogVLM (Wang et al., 2023b)</td><td>92.8</td><td>94.8</td><td>89.0</td><td>88.7</td><td>92.9</td><td>83.4</td><td>89.8</td><td>90.8</td></tr><tr><td>InternVL $2_{2b}$  (Chen et al., 2024c)</td><td>82.3</td><td>88.2</td><td>75.9</td><td>73.5</td><td>82.8</td><td>63.3</td><td>77.6</td><td>78.3</td></tr><tr><td>InternVL $2_{8b}$  (Chen et al., 2024c)</td><td>87.1</td><td>91.1</td><td>80.7</td><td>79.8</td><td>87.9</td><td>71.4</td><td>82.7</td><td>82.7</td></tr><tr><td>InternVL $2_{76b}$  (Chen et al., 2024c)</td><td>92.2</td><td>94.8</td><td>88.4</td><td>88.8</td><td>93.1</td><td>82.8</td><td>89.5</td><td>90.3</td></tr><tr><td>Qwen2-VL $_{2b}$ </td><td>87.6</td><td>90.6</td><td>82.3</td><td>79.0</td><td>84.9</td><td>71.0</td><td>81.2</td><td>80.3</td></tr><tr><td>Qwen2-VL $_{7b}$ </td><td>91.7</td><td>93.6</td><td>87.3</td><td>85.8</td><td>90.5</td><td>79.5</td><td>87.3</td><td>87.8</td></tr><tr><td>Qwen2-VL $_{72b}$ </td><td>93.2</td><td>95.3</td><td>90.7</td><td>90.1</td><td>93.8</td><td>85.6</td><td>89.9</td><td>90.4</td></tr><tr><td rowspan="3">Specialist</td><td>G-DINO-L (Liu et al., 2023c)</td><td>90.6</td><td>93.2</td><td>88.2</td><td>82.8</td><td>89.0</td><td>75.9</td><td>86.1</td><td>87.0</td></tr><tr><td>UNINEXT-H (Yan et al., 2023)</td><td>92.6</td><td>94.3</td><td>91.5</td><td>85.2</td><td>89.6</td><td>79.8</td><td>88.7</td><td>89.4</td></tr><tr><td>ONE-PEACE (Wang et al., 2023a)</td><td>92.6</td><td>94.2</td><td>89.3</td><td>88.8</td><td>92.2</td><td>83.2</td><td>89.2</td><td>89.3</td></tr></table>

video understanding tasks, and scaling up Qwen2-VL yields significant improvements. For the challenging Video-MME benchmark (Fu et al., 2024), which includes videos up to one hour, it is noteworthy that we limited the maximum number of frames extracted per video to 768 during evaluation, potentially impacting performance on longer videos. Future work will focus on extending Qwen2-VL to support longer sequences, thereby accommodating longer videos.

放大模型带来明显增益. Video-MME 含最长约一小时视频; 评测时每视频最多抽 768 帧, 可能伤更长片表现. 后续计划支持更长序列.

> **问:** 宣传 20 min+ 长视频, 评测又限 768 帧, 会不会把长视频优势测短了?
> 有可能. 正文自己提示 768 帧上限可能影响更长片. 读 Video-MME 分数时要带着这个评测约束.

#### 3.2.7 Visual Agent 视觉 Agent

Qwen2-VL is evaluated first for its ability to interact with the environment via function calls and then for its capacity to complete complex sequential decision tasks through multiple rounds of interaction. The implementation is based on the Qwen-Agent framework (Qwen Team, 2024).

先评函数调用与环境交互, 再评多轮序贯决策; 实现基于 Qwen-Agent.

**Function Calling** Unlike function calling in LLMs (Yan et al., 2024; Srinivasan et al., 2023; Chen et al., 2023c), function calling in LVLMs often involves extracting information from visual cues. Due to the absence of public benchmarks for evaluating the capabilities of LVLMs in function calling, we constructed our internal evaluation dataset.

**函数调用.** LVLM 侧常要从视觉线索抽信息. 因缺公开榜, 自建内部评测集.

To construct the evaluation dataset, we undertook the following procedures (Chen et al., 2023c): Scene Categorization, Image Collection, Image Content Extraction, and Question/Functions/Arguments Generation. Firstly, we classified scenes into categories based on different visual applications. Subsequently, we downloaded and meticulously selected high-quality, representative images from the internet for each category. Thereafter, utilizing an advanced LVLM (Bai et al., 2023b), we analyzed each image to extract key visual elements and textual information. Finally, based on the content information from the images, we used an advanced LLM (Yang et al., 2024) to generate a series of questions that required specific functions to answer, along with specifying the input parameters needed for these function calls.

建集流程: 场景分类 → 收图精选 → 用强 LVLM 抽关键视觉/文字 → 用强 LLM 生成需调函数的问题与参数.

Similar to the function calling evaluation method in LLMs (Yan et al., 2024), we designed two metrics to evaluate the accuracy of the function selection and the correctness of the arguments input. Specifically, Type Match(TM), is calculated as the ratio of times the model successfully invoked the correct function to the total number of calls attempted. Exact Match(EM), for each function calling, we checked whether the arguments passed to the function exactly matched those recorded in the image’s content information, calculating this correctness ratio.

指标: Type Match (TM) = 选对函数次数 / 总调用; Exact Match (EM) = 参数与图内记录完全一致的比例.

As shown in Table 5, the performance of Qwen2-VL in both Type Match(93.1 vs. 90.2) and Exact Match(53.2 vs. 50.0) over GPT-4o substantiates the efficacy of Qwen2-VL’s capability in function calling, thereby underscoring

表 5: TM 93.1 vs GPT-4o 90.2, EM 53.2 vs 50.0, 说明函数调用有效, 也

> **核对:** TM 很高但 EM 只有 53.2, 函数调用到底能不能上生产?
> 能选对工具, 参数常对不齐. 生产上要校验参数或二次确认, 不能只看 TM.

<!-- page 13 of 52 -->

its significant potential for application expansion through external tool integration.

表明外挂工具扩展应用的潜力大.

The evaluation results demonstrated that GPT-4o underperformed, primarily due to two factors: in scenarios where uncertainty arises, GPT-4o demonstrates a conservative approach by avoiding using external tools. The Optical Character Recognition (OCR) capability of GPT-4o is outperformed by Qwen2-VL, particularly in the context of Chinese characters.

GPT-4o 偏弱主因: 不确定时偏保守少用外工具; OCR 尤其中文弱于 Qwen2-VL.

**UI Operations/Games/Robotics/Navigation** To assess Qwen2-VL’s ability to generally handle complex tasks, we conduct evaluations across multiple VL agent tasks, including mobile operations (Zhang et al., 2024b; Rawles et al., 2024b; Lu et al., 2024b; Rawles et al., 2024a), robotic control (Kolve et al., 2017; Shridhar et al., 2020a; Inoue and Ohashi, 2022; Lu et al., 2023; Jiang et al., 2022; Huang et al., 2023b), card games (Zhai et al., 2024), and vision-language navigation (Anderson et al., 2018; Qi et al., 2020). As these tasks need multiple actions to complete tasks, we keep the history (observation, action) through Qwen2-VL supports a 32K context length, then append each new observation image after every action, enabling continuous reasoning about subsequent steps.

**UI / 游戏 / 机器人 / 导航.** 多类 VL agent 任务需多步动作; 在 32K 上下文里保留 (观察, 动作) 历史, 每步追加新观察图, 持续推下一步.

**UI Operations:** we evaluate Qwen2-VL using the AITZ task (Zhang et al., 2024b), which constructs a core clean test set derived from AITW (Rawles et al., 2024b). Based on common operation patterns of phone, we define actions such as tap, input and swipe (Rawles et al., 2024b) for Qwen2-VL to interact with on-screen icons for task completion. For example, when Qwen2-VL is tasked with finding a pizza restaurant nearby by Google Maps, it should input "pizza" in the search term, swipe to select the appropriate restaurant, and tap the corresponding link. Following the AITZ setting, we report both type match (correctness of tap, input, or swipe) and exact match (correctness of tap location, input text, or swipe direction). With the support of grounding capability on UI, Qwen2-VL surpasses GPT-4 and previous SoTA (Zhang et al., 2024b; Zhan and Zhang, 2023).

**UI 操作:** AITZ (源自 AITW 清洗核). 定义 tap / input / swipe 等; 报 TM 与 EM. 凭 UI grounding, 超过 GPT-4 与先前 SoTA.

**Robotic Control:** we evaluate Qwen2-VL on the ALFRED task (Shridhar et al., 2020a) in AI2THOR (Kolve et al., 2017). The task requires agent to perform complex household tasks, such as toasting bread and slicing an apple to prepare a meal. To work in the virtual environment, we define high-level actions (GotoLocation, Pickup, PutDown, Open, Close, Clean, Heat, Cool, Slice) (Shridhar et al., 2020b) as the action set. Moreover, agent needs to localize objects for manipulation (e.g., it can only pick up an apple if the apple is recognized). To improve the accuracy of manipulation, we integrate SAM (Kirillov et al., 2023). ALFRED task reports task success rate (SR) (e.g., preparing dinner) and sub-goal completion metrics (GC) (e.g., whether the bread is toasted or the apple is sliced). Qwen2-VL slightly outperforms the previously specialized model ThinkBot (Lu et al., 2023) on the valid-unseen set.

**机器人控制:** ALFRED (AI2-THOR). 高层动作集含 GotoLocation, Pickup 等; 操作前需定位物体, 并接 SAM 提操纵精度. 报 SR 与 GC; valid-unseen 上略超专精 ThinkBot.

**Card Games:** we leverage the card game environment from RL4VLM (Zhai et al., 2024) to assess Qwen2-VL’s performance in a series of card-based games: Number Line, BlackJack, EZPoint, and Point24. Each game presents distinct challenges: (1) reaching a target number using +1 or -1 operations, (2) drawing or holding cards to compete against the dealer, (3) applying basic arithmetic operations to reach a total of 12, and (4) using arithmetic operations to achieve a total of 24. We report the success rate of the tasks. They not only evaluate agent capabilities but also require strong OCR skills to recognize these cards and understand the progression of the game. Qwen2-VL demonstrates superior performance across all tasks.

**纸牌游戏:** Number Line, BlackJack, EZPoint, Point24; 既要 agent 能力也要强 OCR 认牌. 各任务成功率均领先.

**Vision-Language Navigation:** we evaluate Qwen2-VL on the Vision-and-Language Navigation (VLN) task using the R2R (Anderson et al., 2018) and REVERIE (Qi et al., 2020). In VLN, the model must autonomously determine the next location based on instruction, current observations. We report the success rate (SR) of VLM in reaching the predetermined destination for this task. The performance of Qwen2-VL is comparable to that of GPT-4o, but both models fall significantly behind current specialized VLN models (Chen et al., 2022; Sigurdsson et al., 2023). We attribute this gap to the incomplete and unstructured map information generated by the model from multiple images. Accurately modeling maps and locations in a 3D environment remains a major challenge for multimodal models.

**视觉语言导航:** R2R 与 REVERIE, 报到达预定终点的 SR. 与 GPT-4o 可比, 但远落后专精 VLN; 归因于多图拼出的地图信息不完整, 三维场景建图仍是难点.

> **看表:** R2R 上 51.7 高于 GPT-4o 的 43.7, 为什么还说远落后专精 VLN?
> 对照的是专精 SoTA (约 79.0 / 61.0), 不是 GPT-4o. 相对通才闭源可比, 相对导航专模仍差一截.

<!-- page 14 of 52 -->

![Chart block](images/p14-table-7-qwen2-vl-7b-under-fixed-dynamic-image-tokens.png)

Table 7: Qwen2-VL-7B under fixed/dynamic image tokens. Adjusting image sizes only results in small perturbations in performance, demonstrating the robustness to varying image sizes. Moreover, the dynamic resolution strategy achieves top-tier performance while consuming fewer tokens on average, demonstrating the efficiency of our model.

表 7｜固定 vs 动态图像 token; 动态平均更省且全面顶档.

<table><tr><td>Strategy</td><td>Average Image Tokens</td><td>InfoVQ $A_{val}$ </td><td>RealWorldQA</td><td>OCRBench</td><td>MMMU</td></tr><tr><td rowspan="4">Fixed Image Tokens</td><td>64</td><td>28.85</td><td>56.47</td><td>572</td><td>53.33</td></tr><tr><td>576</td><td>65.72</td><td>65.88</td><td>828</td><td>52.78</td></tr><tr><td>1600</td><td>74.99</td><td>69.54</td><td>824</td><td>52.89</td></tr><tr><td>3136</td><td>77.27</td><td>70.59</td><td>786</td><td>53.44</td></tr><tr><td>Dynamic Image Tokens</td><td>1924</td><td>75.89</td><td>70.07</td><td>866</td><td>53.44</td></tr></table>

Figure 4: Qwen2-VL-7B with different min\_pixels. Small images are upscaled to surpass a specified min\_pixels threshold before input into the model. Increasing the image size within a reasonable range shows enhanced performance on perceptual tasks like InfoVQA, HallusionBench, and OCRBench.

### 3.3 Ablation Study 消融实验

In this section, we present ablation studies on image dynamic resolution, M-RoPE, and model scale. These experiments aim to provide insights into the impact of these key components on our model’s performance.

#### 3.3.1 Dynamic Resolution 动态分辨率

As shown in Table 7, we compare the performance between dynamic resolution and fixed resolution. For fixed resolution, we resize the images to ensure a constant number of image tokens being input to the model, rather than resizing to a specific height and width, as this would distort the original aspect ratio. For dynamic resolution, we only set min\_pixels= 100 × 28 × 28 and max\_pixels= 16384 × 28 × 28, allowing the number of image tokens depend primarily on the image’s native resolution. It can be observed that adjusting image sizes only results in small perturbations in performance, demonstrating the model robustness to varying image sizes. Moreover, dynamic resolution approach is more efficient. We can observe that no single fixed resolution achieves optimal performance across all benchmarks. In contrast, the dynamic resolution approach consistently achieves top-tier performance while consuming fewer tokens on average.

表 7 对比动态 vs 固定分辨率. 固定侧按恒定图像 token 数缩放, 不锁死高宽以免扭曲宽高比. 动态侧只设 min_pixels=100×28×28 与 max_pixels=16384×28×28, token 数主要由原生分辨率决定. 改尺寸只带来小扰动, 说明对尺寸稳健; 动态方案平均更省 token, 且没有单一固定档能在所有榜上最优.

> **拆开:** 动态平均 1924 token, 固定 3136 在 InfoVQA 上反而更高 (77.27 vs 75.89), 动态还谈得上全面更好吗?
> 报告强调的是「没有单一固定档通吃」且平均更省. OCRBench 上动态 866 明显高于固定各档; 单看 InfoVQA 固定 3136 可以更高, 但代价是 token.

Additionally, we observe that merely increasing the image size does not always lead to improved performance. It is more important to choose an appropriate resolution for different images. As detailed in Figure 4, we upscale small images to surpass a specified min\_pixels threshold. Evaluations on upscaled images shows enhanced performance on perceptual tasks like InfoVQA, HallusionBench, and OCRBench. We attribute these gains to increased computational load. However, for OCRBench, a too-high min\_pixels value leads to a severe performance decline. This is likely because OCRBench contains numerous extremely small images, and excessive enlargement causes these images to deviate from the training data distribution, turning them into out-of-distribution samples. In contrast, the effect of increasing min\_pixels on the MMMU benchmark is negligible. We hypothesize that the performance bottleneck in MMMU is more related to the model’s

单纯放大并不总涨分, 更要按图选合适分辨率. 如图 4, 把小图抬过 min_pixels 后, InfoVQA / HallusionBench / OCRBench 等感知任务变好, 可归因于算力增加; 但 OCRBench 上 min_pixels 过高会严重掉点 (极小图过度放大成 OOD). MMMU 对抬 min_pixels 几乎不敏感, 瓶颈更像推理能力而非分辨率.

> **确认:** min_pixels 过高让 OCRBench 崩掉, 是分布外还是细节糊了?
> 报告归因是极小图被过度放大, 偏离训练分布成 OOD. 不是简单的「越大越清」.

<!-- page 15 of 52 -->

Table 8: Ablation studies of M-RoPE. Compared to 1D-RoPE, using M-RoPE achieves better performance in downstream tasks, particularly in video benchmarks. RWQ means RealworldQA.

表 8｜M-RoPE vs 1D-RoPE 消融; 视频侧增益更明显.

<table><tr><td></td><td colspan="8">Image Benchmarks</td><td colspan="3">Video Benchmarks</td></tr><tr><td></td><td>MathVista</td><td>MMB</td><td>MMStar</td><td>RWQ</td><td>DocVQA</td><td>ChartQA</td><td>InfoVQA</td><td>TextVQA</td><td>PerceptionTest</td><td>NextQA</td><td>STAR</td></tr><tr><td>1D-RoPE</td><td>39.2</td><td>58.6</td><td>36.7</td><td>54.5</td><td>82.5</td><td>68.0</td><td>50.8</td><td>71.3</td><td>46.6</td><td>43.9</td><td>55.5</td></tr><tr><td>M-RoPE</td><td>43.4</td><td>60.6</td><td>36.7</td><td>53.7</td><td>82.8</td><td>68.4</td><td>50.3</td><td>71.8</td><td>47.4</td><td>46.0</td><td>57.9</td></tr></table>

![Chart block](images/p15-figure-5-evaluate-the-length-extrapolation-capability.png)

Figure 5: Evaluate the length extrapolation capability of Qwen2-VL-72B on Video-MME Medium Video. With the help of M-RoPE, the model demonstrated robust performance when the inference length exceeded the maximum training length of 16384 tokens.

图 5｜Video-MME Medium 上长度外推: 训练 16K, 推理可到 80K.

reasoning capability rather than image resolution.

#### 3.3.2 M-RoPE

In this subsection, we demonstrate the effectiveness of M-RoPE. First, we validate its capability on various downstream tasks. We employ Qwen2-1.5B and ViT-L as the backbone and report the results of the pre-trained models. As shown in Table 8, compared to 1D-RoPE, using M-RoPE achieves better performance in downstream tasks, particularly in video benchmarks. Furthermore, we assess the length extrapolation capability of M-RoPE on Video-MME medium-length videos. Figure 5 illustrates the performance of Qwen2- VL-72B at different inference lengths. Leveraging M-RoPE, the model demonstrates robust results across various inference lengths. Notably, despite limiting the maximum tokens per video to 16K during training, the model still exhibits exceptional performance at a maximum inference length of 80K tokens.

先用 Qwen2-1.5B + ViT-L 骨干, 报预训练后下游分. 表 8: 相对 1D-RoPE, M-RoPE 整体更好, 视频榜增益更明显. 再在 Video-MME 中长视频上看长度外推: 图 5 显示训练单视频上限 16K token, 推理到 80K 仍稳健.

> **回看:** 表 8 里 RealWorldQA 上 M-RoPE 53.7 反低于 1D 的 54.5, 还能说全面更好吗?
> 多数图像榜持平或小涨, 视频三榜都涨. 个别图像榜小幅回落不否定主结论; 外推长视频是 M-RoPE 的另一张王牌.

#### 3.3.3 Model Scaling 模型缩放

We evaluate the performance of models of varying scales across multiple capability dimensions. Specifically, we categorize these dimensions into complex college-level problem-solving, mathematical abilities, document and table comprehension, general scenario question-answering, and video comprehension. The overall capability of a model is assessed by averaging its scores across different benchmarks associated with each dimension.

按能力维切分: 大学级复杂题 (MMMU), 数学 (MathVista+MathVision 均分), 通用场景问答 (RealWorldQA 等六榜均分), 文档表格 (DocVQA 等六榜均分), 视频 (MVBench 等四榜均分).

In particular, we use the MMMU (Yue et al., 2023) benchmark to represent college-level problem-solving ability, while the average scores from MathVista (Lu et al., 2024a) and MathVision (Wang et al., 2024) serve as indicators of mathematical ability. For general scenario question-answering, we compute the average score across the RealWorldQA (X.AI, 2024a), MMBench-V1.1 (Liu et al., 2023d), MMT-Bench (Ying et al., 2024), HallBench (Guan et al., 2023), MMVet (Yu et al., 2024), and MMStar (Chen et al., 2024a)

具体: MMMU 代表大学级解题; MathVista 与 MathVision 均分代表数学; RealWorldQA, MMBench-V1.1, MMT-Bench, HallBench, MMVet, MMStar 均分代表通用场景. (跨页续.)

<!-- page 16 of 52 -->

![Chart block](images/p16-a.png)

![Chart block](images/p16-6.png)

(6)

Figure 6: Model Performance Scaling Across Capabilities and Training Progress. As model size and the volume of training data increase, performance consistently improves across a range of capabilities and benchmarks.

图 6｜能力维与训练进度上的 scaling: 模型与数据变大, 多维持续抬升.

benchmarks. Document and table comprehension capability is reflected through the average score from benchmarks like DocVQA (Mathew et al., 2021), InfoVQA (Mathew et al., 2021), ChartQA (Masry et al., 2022), TextVQA (Singh et al., 2019), OCRBench (Liu et al., 2023e), and MTVQA (Tang et al., 2024). Lastly, video comprehension ability is measured by averaging scores across MVBench (Li et al., 2024), Perception-Test (Patraucean et al., 2024), EgoSchema (Mangalam et al., 2023), and Video-MME (Fu et al., 2024).

文档表格用 DocVQA, InfoVQA, ChartQA, TextVQA, OCRBench, MTVQA 均分; 视频用 MVBench, Perception-Test, EgoSchema, Video-MME 均分.

As illustrated in Figure 6(a), there is a consistent improvement in performance with increasing model size, particularly with respect to mathematical abilities, which show a positive correlation with the number of model parameters. On the other hand, for optical character recognition (OCR)-related tasks, even smallerscale models exhibit relatively strong performance.

图 6(a): 随模型变大, 各能力维持续抬升, 数学与参数量正相关尤其明显; OCR 相关任务上, 较小模型已相对强.

> **停一下:** OCR 小模型已经较强, 那 72B 的文档 SoTA 主要靠什么?
> 小模型 OCR 底子不错, 但旗舰在 DocVQA 96.5, OCRBench 877 等仍继续抬. 图 6 是能力维均分趋势, 具体格子仍看表 2.

As shown in Figure 6(b), we visualize the relationship between model performance and the number of training tokens during the second stage of pretraining for Qwen2-VL-7B. As the number of training tokens increases, the model performance improves; however, performance on vision question answering (VQA) tasks exhibits some fluctuation. In contrast, for tasks such as AI2D (Kembhavi et al., 2016) and InfoVQA (Mathew et al., 2021)—both of which involve understanding textual and graphical information in images—the model performance shows steady improvement as training data is augmented.

图 6(b): Qwen2-VL-7B 第二阶段预训练中, 训练 token 增多总体涨分, VQA 有波动; AI2D / InfoVQA 等需读图内文字与图形的任务则随数据稳步升.

> **再看:** VQA 随 token 波动, 是不是第二阶段数据配比不稳?
> 报告只描述波动现象, 未给配比时间表. 可读成 VQA 对数据次序更敏感; AI2D/InfoVQA 则更单调受益于加数据.

## 4 Conclusion

We have presented the Qwen2-VL series, the versatile large vision-language models, including three open-weight models with total parameter counts of 2, 8, and 72 billion. Qwen2-VL matches the performance of top-tier models like GPT-4o and Claude3.5-Sonnet in a range of multimodal scenarios, surpassing all other open-weight LVLM models. Qwen2-VL series introduces naive dynamic resolution and multimodal rotary position embedding (M-RoPE) to fuse information across modals effectively and be capable of understanding videos over 20 minutes in length. With advanced reasoning and decision-making abilities, Qwen2-VL can be integrated with devices such as mobile phones, robots, etc. Furthermore, Qwen2-VL now supports understanding multilingual texts within images, including most European languages, Japanese, Korean, Arabic, Vietnamese, and others.

We have made the Qwen2-VL model weights openly accessible, which enables researchers and developers to harness the full potential in a variety of applications and research projects. We aim to advance AI technologies and enhance their beneficial effects on society by dedicating ourselves to these endeavors.

<!-- page 17 of 52 -->

## Acknowledgements 致谢

We express our gratitude to Juan Zhu, Fan Hong, Jie Zhang, Yong Li of Alibaba Cloud’s PAI team (Alibaba-Cloud, 2024c) for supporting the training infrastructure of Qwen2-VL. This work was also supported by Qwen LLM team (Yang et al., 2024), and we especially thank Na Ni, Yichang Zhang, Jianxin Ma, Bowen Yu, Zheren Fu for their data contribution and insightful discussion.

感谢阿里云 PAI 团队朱娟, 洪帆, 张杰, 李勇对训练基础设施的支持; 亦获 Qwen LLM 团队支持, 并特别感谢倪娜, 张怡畅, 马建鑫, 于博文, 付哲人在数据与讨论上的贡献.

## References

Jean-Baptiste Alayrac, Jeff Donahue, Pauline Luc, Antoine Miech, Iain Barr, Yana Hasson, Karel Lenc, Arthur Mensch, Katherine Millican, Malcolm Reynolds, et al. Flamingo: a visual language model for few-shot learning. In NeurIPS, 2022. 2

Alibaba-Cloud. Cloud parallel file storage (cpfs), 2024a. URL [https://www.alibabacloud.com/en/product/cpfs](https://www.alibabacloud.com/en/product/cpfs). 8

Alibaba-Cloud. Object storage service (oss), 2024b. URL [https://www.alibabacloud.com/en/product/object-storage-service](https://www.alibabacloud.com/en/product/object-storage-service). 8

Alibaba-Cloud. Pai-lingjun intelligent computing service, 2024c. URL [https://www.alibabacloud.com/en/product/pai-lingjun](https://www.alibabacloud.com/en/product/pai-lingjun). 8, 17

Peter Anderson, Qi Wu, Damien Teney, Jake Bruce, Mark Johnson, Niko Sünderhauf, Ian Reid, Stephen Gould, and Anton Van Den Hengel. Vision-and-language navigation: Interpreting visually-grounded navigation instructions in real environments. In CVPR, 2018. 10, 13

Jason Ansel, Edward Z. Yang, Horace He, Natalia Gimelshein, Animesh Jain, Michael Voznesensky, Bin Bao, Peter Bell, David Berard, Evgeni Burovski, Geeta Chauhan, Anjali Chourdia, Will Constable, Alban Desmaison, Zachary DeVito, Elias Ellison, Will Feng, Jiong Gong, Michael Gschwind, Brian Hirsh, Sherlock Huang, Kshiteej Kalambarkar, Laurent Kirsch, Michael Lazos, Mario Lezcano, Yanbo Liang, Jason Liang, Yinghai Lu, C. K. Luk, Bert Maher, Yunjie Pan, Christian Puhrsch, Matthias Reso, Mark Saroufim, Marcos Yukio Siraichi, Helen Suk, Shunting Zhang, Michael Suo, Phil Tillet, Xu Zhao, Eikan Wang, Keren Zhou, Richard Zou, Xiaodong Wang, Ajit Mathews, William Wen, Gregory Chanan, Peng Wu, and Soumith Chintala. Pytorch 2: Faster machine learning through dynamic python bytecode transformation and graph compilation. In ASPLOS, 2024. 8

Anthropic. Claude 3.5 sonnet, 2024. URL [https://www.anthropic.com/news/claude-3-5-sonnet](https://www.anthropic.com/news/claude-3-5-sonnet). 9

Anurag Arnab, Mostafa Dehghani, Georg Heigold, Chen Sun, Mario Lučić, and Cordelia Schmid. Vivit: A video vision transformer. In ICCV, 2021. 5

Lei Jimmy Ba, Jamie Ryan Kiros, and Geoffrey E. Hinton. Layer normalization. arXiv:1607.06450, 2016. 8

Jinze Bai, Shuai Bai, Yunfei Chu, Zeyu Cui, Kai Dang, Xiaodong Deng, Yang Fan, Wenbin Ge, Yu Han, Fei Huang, et al. Qwen technical report. arXiv:2309.16609, 2023a. 1

Jinze Bai, Shuai Bai, Shusheng Yang, Shijie Wang, Sinan Tan, Peng Wang, Junyang Lin, Chang Zhou, and Jingren Zhou. Qwen-vl: A frontier large vision-language model with versatile abilities. arXiv:2308.12966, 2023b. 1, 2, 3, 5, 12

Joao Carreira and Andrew Zisserman. Quo vadis, action recognition? a new model and the kinetics dataset. In CVPR, 2017. 5

Keqin Chen, Zhao Zhang, Weili Zeng, Richong Zhang, Feng Zhu, and Rui Zhao. Shikra: Unleashing multimodal llm’s referential dialogue magic. arXiv:2306.15195, 2023a. 12

<!-- page 18 of 52 -->

Lin Chen, Jisong Li, Xiaoyi Dong, Pan Zhang, Conghui He, Jiaqi Wang, Feng Zhao, and Dahua Lin. Sharegpt4v: Improving large multi-modal models with better captions. arXiv:2311.12793, 2023b. 1

Lin Chen, Jinsong Li, Xiaoyi Dong, Pan Zhang, Yuhang Zang, Zehui Chen, Haodong Duan, Jiaqi Wang, Yu Qiao, Dahua Lin, et al. Are we on the right way for evaluating large vision-language models? arXiv:2403.20330, 2024a. 9, 15

Shizhe Chen, Pierre-Louis Guhur, Makarand Tapaswi, Cordelia Schmid, and Ivan Laptev. Think global, act local: Dual-scale graph transformer for vision-and-language navigation. In CVPR, 2022. 10, 13

Tianqi Chen, Bing Xu, Chiyuan Zhang, and Carlos Guestrin. Training deep nets with sublinear memory cost. arXiv:1604.06174, 2016. 8

Zehui Chen, Weihua Du, Wenwei Zhang, Kuikun Liu, Jiangning Liu, Miao Zheng, Jingming Zhuo, Songyang Zhang, Dahua Lin, Kai Chen, et al. T-eval: Evaluating the tool utilization capability step by step. arXiv:2312.14033, 2023c. 12

Zhe Chen, Weiyun Wang, Hao Tian, Shenglong Ye, Zhangwei Gao, Erfei Cui, Wenwen Tong, Kongzhi Hu, Jiapeng Luo, Zheng Ma, et al. How far are we to gpt-4v? closing the gap to commercial multimodal models with open-source suites. arXiv:2404.16821, 2024b. 9

Zhe Chen, Weiyun Wang, Hao Tian, Shenglong Ye, Zhangwei Gao, Erfei Cui, Wenwen Tong, Kongzhi Hu, Jiapeng Luo, Zheng Ma, et al. Internvl2: Better than the best—expanding performance boundaries of open-source multimodal models with the progressive scaling strategy, 2024c. URL [https://internvl.github.io/blog/2024-07-02-InternVL-2.0](https://internvl.github.io/blog/2024-07-02-InternVL-2.0). 9, 12

Wei-Lin Chiang, Zhuohan Li, Zi Lin, Ying Sheng, Zhanghao Wu, Hao Zhang, Lianmin Zheng, Siyuan Zhuang, Yonghao Zhuang, Joseph E. Gonzalez, Ion Stoica, and Eric P. Xing. Vicuna: An open-source chatbot impressing gpt-4 with 90%\* chatgpt quality, 2023. URL [https://lmsys.org/blog/2023-03-30-vicuna/](https://lmsys.org/blog/2023-03-30-vicuna/).

Wenliang Dai, Junnan Li, Dongxu Li, Anthony Meng Huat Tiong, Junqi Zhao, Weisheng Wang, Boyang Li, Pascale Fung, and Steven Hoi. Instructblip: Towards general-purpose vision-language models with instruction tuning. arXiv:2305.06500, 2023. 1

Tri Dao. Flashattention-2: Faster attention with better parallelism and work partitioning. In ICLR, 2024. 8

Tri Dao, Daniel Y. Fu, Stefano Ermon, Atri Rudra, and Christopher Ré. Flashattention: Fast and memoryefficient exact attention with io-awareness. In NeurIPS, 2022. 8

Mostafa Dehghani, Basil Mustafa, Josip Djolonga, Jonathan Heek, Matthias Minderer, Mathilde Caron, Andreas Steiner, Joan Puigcerver, Robert Geirhos, Ibrahim M Alabdulmohsin, et al. Patch n’pack: Navit, a vision transformer for any aspect ratio and resolution. In NeurIPS, 2024. 4

Alexey Dosovitskiy, Lucas Beyer, Alexander Kolesnikov, Dirk Weissenborn, Xiaohua Zhai, Thomas Unterthiner, Mostafa Dehghani, Matthias Minderer, Georg Heigold, Sylvain Gelly, Jakob Uszkoreit, and Neil Houlsby. An image is worth 16x16 words: Transformers for image recognition at scale. In ICLR, 2021. 4

Abhimanyu Dubey, Abhinav Jauhri, Abhinav Pandey, Abhishek Kadian, Ahmad Al-Dahle, Aiesha Letman, Akhil Mathur, Alan Schelten, Amy Yang, Angela Fan, et al. The llama 3 herd of models. arXiv:2407.21783, 2024. 46, 48, 49

Alex Fang, Albin Madappally Jose, Amit Jain, Ludwig Schmidt, Alexander Toshev, and Vaishaal Shankar. Data filtering networks. arXiv:2309.17425, 2023. 5

FFmpeg-Developers. ffmpeg tool, 2024. URL [http://ffmpeg.org/](http://ffmpeg.org/). 8

Chaoyou Fu, Peixian Chen, Yunhang Shen, Yulei Qin, Mengdan Zhang, Xu Lin, Zhenyu Qiu, Wei Lin, Jinrui Yang, Xiawu Zheng, et al. Mme: A comprehensive evaluation benchmark for multimodal large language models. arXiv:2306.13394, 2023. 9

<!-- page 19 of 52 -->

Chaoyou Fu, Yuhan Dai, Yondong Luo, Lei Li, Shuhuai Ren, Renrui Zhang, Zihan Wang, Chenyu Zhou, Yunhang Shen, Mengdan Zhang, et al. Video-mme: The first-ever comprehensive evaluation benchmark of multi-modal llms in video analysis. arXiv:2405.21075, 2024. 10, 12, 16

Tianrui Guan, Fuxiao Liu, Xiyang Wu, Ruiqi Xian, Zongxia Li, Xiaoyu Liu, Xijun Wang, Lichang Chen, Furong Huang, Yaser Yacoob, Dinesh Manocha, and Tianyi Zhou. Hallusionbench: An advanced diagnostic suite for entangled language hallucination & visual illusion in large vision-language models. arXiv:2310.14566, 2023. 9, 15

Wenyi Hong, Weihan Wang, Qingsong Lv, Jiazheng Xu, Wenmeng Yu, Junhui Ji, Yan Wang, Zihan Wang, Yuxiao Dong, Ming Ding, et al. Cogagent: A visual language model for gui agents. arXiv:2312.08914, 2023. 10

Shaohan Huang, Li Dong, Wenhui Wang, Yaru Hao, Saksham Singhal, Shuming Ma, Tengchao Lv, Lei Cui, Owais Khan Mohammed, Qiang Liu, et al. Language is not all you need: Aligning perception with language models. arXiv:2302.14045, 2023a. 1, 2

Siyuan Huang, Zhengkai Jiang, Hao Dong, Yu Qiao, Peng Gao, and Hongsheng Li. Instruct2act: Mapping multi-modality instructions to robotic actions with large language model. arXiv:2305.11176, 2023b. 13

Yanping Huang, Youlong Cheng, Ankur Bapna, Orhan Firat, Dehao Chen, Mia Xu Chen, HyoukJoong Lee, Jiquan Ngiam, Quoc V. Le, Yonghui Wu, and Zhifeng Chen. Gpipe: Efficient training of giant neural networks using pipeline parallelism. In NeurIPS, 2019. 8

Yuki Inoue and Hiroki Ohashi. Prompter: Utilizing large language model prompting for a data efficient embodied instruction following. arXiv:2211.03267, 2022. 13

Yunfan Jiang, Agrim Gupta, Zichen Zhang, Guanzhi Wang, Yongqiang Dou, Yanjun Chen, Li Fei-Fei, Anima Anandkumar, Yuke Zhu, and Linxi Fan. Vima: General robot manipulation with multimodal prompts. arXiv:2210.03094, 2022. 13

Sahar Kazemzadeh, Vicente Ordonez, Mark Matten, and Tamara Berg. Referitgame: Referring to objects in photographs of natural scenes. In EMNLP, 2014. 11

Aniruddha Kembhavi, Mike Salvato, Eric Kolve, Minjoon Seo, Hannaneh Hajishirzi, and Ali Farhadi. A diagram is worth a dozen images. In ECCV, 2016. 9, 11, 16

Alexander Kirillov, Eric Mintun, Nikhila Ravi, Hanzi Mao, Chloe Rolland, Laura Gustafson, Tete Xiao, Spencer Whitehead, Alexander C Berg, Wan-Yen Lo, et al. Segment anything. In ICCV, 2023. 13

Eric Kolve, Roozbeh Mottaghi, Winson Han, Eli VanderBilt, Luca Weihs, Alvaro Herrasti, Matt Deitke, Kiana Ehsani, Daniel Gordon, Yuke Zhu, et al. Ai2-thor: An interactive 3d environment for visual ai. arXiv:1712.05474, 2017. 13

Vijay Anand Korthikanti, Jared Casper, Sangkug Lym, Lawrence McAfee, Michael Andersch, Mohammad Shoeybi, and Bryan Catanzaro. Reducing activation recomputation in large transformer models. In MLSys, 2023. 8

Alex Krizhevsky, Ilya Sutskever, and Geoffrey E. Hinton. Imagenet classification with deep convolutional neural networks. In NeurIPS, 2012. 8

Joel Lamy-Poirier. Breadth-first pipeline parallelism. In MLSys, 2023. 8

Bo Li, Peiyuan Zhang, Jingkang Yang, Yuanhan Zhang, Fanyi Pu, and Ziwei Liu. Otterhd: A high-resolution multi-modality model. arXiv:2311.04219, 2023a. 2

Chen Li, Yixiao Ge, Dian Li, and Ying Shan. Vision-language instruction tuning: A review and analysis. arXiv:2311.08172, 2023b. 2

<!-- page 20 of 52 -->

Junnan Li, Dongxu Li, Silvio Savarese, and Steven Hoi. Blip-2: Bootstrapping language-image pre-training with frozen image encoders and large language models. arXiv:2301.12597, 2023c. 1

Kunchang Li, Yali Wang, Yinan He, Yizhuo Li, Yi Wang, Yi Liu, Zun Wang, Jilan Xu, Guo Chen, Ping Luo, et al. Mvbench: A comprehensive multi-modal video understanding benchmark. In CVPR, 2024. 10, 11, 16

Shen Li, Yanli Zhao, Rohan Varma, Omkar Salpekar, Pieter Noordhuis, Teng Li, Adam Paszke, Jeff Smith, Brian Vaughan, Pritam Damania, et al. Pytorch distributed: Experiences on accelerating data parallel training. In VLDB, 2020. 8

Zhang Li, Biao Yang, Qiang Liu, Zhiyin Ma, Shuo Zhang, Jingxu Yang, Yabo Sun, Yuliang Liu, and Xiang Bai. Monkey: Image resolution and text label are important things for large multi-modal models. arXiv:2311.06607, 2023d. 2

Ziyi Lin, Chris Liu, Renrui Zhang, Peng Gao, Longtian Qiu, Han Xiao, Han Qiu, Chen Lin, Wenqi Shao, Keqin Chen, Jiaming Han, Siyuan Huang, Yichi Zhang, Xuming He, Hongsheng Li, and Yu Jiao Qiao. Sphinx: The joint mixing of weights, tasks, and visual embeddings for multi-modal large language models. arXiv:2311.07575, 2023. 2

Haotian Liu, Chunyuan Li, Yuheng Li, and Yong Jae Lee. Improved baselines with visual instruction tuning. arXiv:2310.03744, 2023a. 1, 2

Haotian Liu, Chunyuan Li, Qingyang Wu, and Yong Jae Lee. Visual instruction tuning. arXiv:2304.08485, 2023b. 1, 2, 10

Shilong Liu, Zhaoyang Zeng, Tianhe Ren, Feng Li, Hao Zhang, Jie Yang, Chun yue Li, Jianwei Yang, Hang Su, Jun-Juan Zhu, and Lei Zhang. Grounding dino: Marrying dino with grounded pre-training for open-set object detection. arXiv:2303.05499, 2023c. 12

Yuan Liu, Haodong Duan, Bo Li Yuanhan Zhang, Songyang Zhang, Wangbo Zhao, Yike Yuan, Jiaqi Wang, Conghui He, Ziwei Liu, Kai Chen, and Dahua Lin. Mmbench: Is your multi-modal model an all-around player? arXiv:2307.06281, 2023d. 9, 15

Yuliang Liu, Zhang Li, Mingxin Huang, Biao Yang, Wenwen Yu, Chunyuan Li, Xucheng Yin, Cheng lin Liu, Lianwen Jin, and Xiang Bai. Ocrbench: On the hidden mystery of ocr in large multimodal models. arXiv:2305.07895, 2023e. 9, 11, 16

Ilya Loshchilov and Frank Hutter. Decoupled weight decay regularization. In ICLR, 2019. 8

Guanxing Lu, Ziwei Wang, Changliu Liu, Jiwen Lu, and Yansong Tang. Thinkbot: Embodied instruction following with thought chain reasoning. arXiv:2312.07062, 2023. 10, 13

Pan Lu, Ran Gong, Shibiao Jiang, Liang Qiu, Siyuan Huang, Xiaodan Liang, and Song-Chun Zhu. Inter-gps: Interpretable geometry problem solving with formal language and symbolic reasoning. In ACL, 2021. 32

Pan Lu, Hritik Bansal, Tony Xia, Jiacheng Liu, Chunyuan Li, Hannaneh Hajishirzi, Hao Cheng, Kai-Wei Chang, Michel Galley, and Jianfeng Gao. Mathvista: Evaluating mathematical reasoning of foundation models in visual contexts. In ICLR, 2024a. 9, 11, 15

Quanfeng Lu, Wenqi Shao, Zitao Liu, Fanqing Meng, Boxuan Li, Botong Chen, Siyuan Huang, Kaipeng Zhang, Yu Qiao, and Ping Luo. Gui odyssey: A comprehensive dataset for cross-app gui navigation on mobile devices. arXiv:2406.08451, 2024b. 13

Karttikeya Mangalam, Raiymbek Akshulakov, and Jitendra Malik. Egoschema: A diagnostic benchmark for very long-form video language understanding. In NeurIPS, 2023. 10, 11, 16

Junhua Mao, Jonathan Huang, Alexander Toshev, Oana Camburu, Alan L Yuille, and Kevin Murphy. Generation and comprehension of unambiguous object descriptions. In CVPR, 2016. 11

<!-- page 21 of 52 -->

Ahmed Masry, Do Xuan Long, Jia Qing Tan, Shafiq Joty, and Enamul Hoque. Chartqa: A benchmark for question answering about charts with visual and logical reasoning. arXiv:2203.10244, 2022. 9, 11, 16

Minesh Mathew, Dimosthenis Karatzas, and CV Jawahar. Docvqa: A dataset for vqa on document images. In WACV, 2021. 9, 11, 16

Deepak Narayanan, Mohammad Shoeybi, Jared Casper, Patrick LeGresley, Mostofa Patwary, Vijay Korthikanti, Dmitri Vainbrand, Prethvi Kashinkunti, Julie Bernauer, Bryan Catanzaro, Amar Phanishayee, and Matei Zaharia. Efficient large-scale language model training on GPU clusters using megatron-lm. In SC, 2021. 8

Nvidia. Apex, 2024a. URL [https://github.com/NVIDIA/apex](https://github.com/NVIDIA/apex). 8

Nvidia. Cuda, 2024b. URL [https://developer.nvidia.com/cuda-toolkit](https://developer.nvidia.com/cuda-toolkit). 8

OpenAI. Gpt-4 technical report. arXiv:2303.08774, 2023. 1, 9

OpenAI. Gpt-4v(ision) system card, 2023. URL [https://openai.com/research/gpt-4v-system-card](https://openai.com/research/gpt-4v-system-card). 1, 9

Openai. Chatml documents, 2024. URL [https://github.com/openai/openai-python/blob/main/chatml.md](https://github.com/openai/openai-python/blob/main/chatml.md). 6

OpenAI. Hello gpt-4o, 2024. URL [https://openai.com/index/hello-gpt-4o](https://openai.com/index/hello-gpt-4o). 9

Adam Paszke, Sam Gross, Francisco Massa, Adam Lerer, James Bradbury, Gregory Chanan, Trevor Killeen, Zeming Lin, Natalia Gimelshein, Luca Antiga, Alban Desmaison, Andreas Köpf, Edward Z. Yang, Zachary DeVito, Martin Raison, Alykhan Tejani, Sasank Chilamkurthy, Benoit Steiner, Lu Fang, Junjie Bai, and Soumith Chintala. Pytorch: An imperative style, high-performance deep learning library. In NeurIPS, 2019. 8

Viorica Patraucean, Lucas Smaira, Ankush Gupta, Adria Recasens, Larisa Markeeva, Dylan Banarse, Skanda Koppula, Mateusz Malinowski, Yi Yang, Carl Doersch, et al. Perception test: A diagnostic benchmark for multimodal video models. In NeurIPS, 2024. 10, 11, 16

Yuankai Qi, Qi Wu, Peter Anderson, Xin Wang, William Yang Wang, Chunhua Shen, and Anton van den Hengel. Reverie: Remote embodied visual referring expression in real indoor environments. In CVPR, 2020. 10, 13

Alibaba Group Qwen Team. Qwen-agent framework, 2024. URL [https://github.com/QwenLM/Qwen-Agent](https://github.com/QwenLM/Qwen-Agent).7, 12

Alec Radford, Jong Wook Kim, Chris Hallacy, Aditya Ramesh, Gabriel Goh, Sandhini Agarwal, Girish Sastry, Amanda Askell, Pamela Mishkin, Jack Clark, et al. Learning transferable visual models from natural language supervision. In ICML, 2021. 2

Samyam Rajbhandari, Jeff Rasley, Olatunji Ruwase, and Yuxiong He. Zero: memory optimizations toward training trillion parameter models. In SC, 2020. 8

Christopher Rawles, Sarah Clinckemaillie, Yifan Chang, Jonathan Waltz, Gabrielle Lau, Marybeth Fair, Alice Li, William Bishop, Wei Li, Folawiyo Campbell-Ajala, et al. Androidworld: A dynamic benchmarking environment for autonomous agents. arXiv:2405.14573, 2024a. 13

Christopher Rawles, Alice Li, Daniel Rodriguez, Oriana Riva, and Timothy Lillicrap. Androidinthewild: A large-scale dataset for android device control. In NeurIPS, 2024b. 13

Jay Shah, Ganesh Bikshandi, Ying Zhang, Vijay Thakkar, Pradeep Ramani, and Tri Dao. Flashattention-3: Fast and accurate attention with asynchrony and low-precision. arXiv:2407.08608, 2024. 8

Mohammad Shoeybi, Mostofa Patwary, Raul Puri, Patrick LeGresley, Jared Casper, and Bryan Catanzaro. Megatron-lm: Training multi-billion parameter language models using model parallelism. arXiv:1909.08053, 2019. 8

<!-- page 22 of 52 -->

Mohit Shridhar, Jesse Thomason, Daniel Gordon, Yonatan Bisk, Winson Han, Roozbeh Mottaghi, Luke Zettlemoyer, and Dieter Fox. Alfred: A benchmark for interpreting grounded instructions for everyday tasks. In CVPR, 2020a. 10, 13

Mohit Shridhar, Xingdi Yuan, Marc-Alexandre Côté, Yonatan Bisk, Adam Trischler, and Matthew Hausknecht. Alfworld: Aligning text and embodied environments for interactive learning. arXiv:2010.03768, 2020b. 13

Gunnar A Sigurdsson, Jesse Thomason, Gaurav S Sukhatme, and Robinson Piramuthu. Rrex-bot: Remote referring expressions with a bag of tricks. In IROS, 2023. 10, 13

Amanpreet Singh, Vivek Natarajan, Meet Shah, Yu Jiang, Xinlei Chen, Dhruv Batra, Devi Parikh, and Marcus Rohrbach. Towards vqa models that can read. In CVPR, 2019. 9, 11, 16

Venkat Krishna Srinivasan, Zhen Dong, Banghua Zhu, Brian Yu, Damon Mosk-Aoyama, Kurt Keutzer, Jiantao Jiao, and Jian Zhang. Nexusraven: a commercially-permissive language model for function calling. In NeurIPS Workshop, 2023. 12

Jianlin Su. Transformer upgrade path: 4. rotary position encoding for two-dimensional positions, 2021. URL [https://www.spaces.ac.cn/archives/8397](https://www.spaces.ac.cn/archives/8397). 4

Jianlin Su. Transformer upgrade path: 17. insights into multimodal positional encoding, 2024. URL [https://spaces.ac.cn/archives/10040](https://spaces.ac.cn/archives/10040). 5

Jianlin Su, Murtadha Ahmed, Yu Lu, Shengfeng Pan, Wen Bo, and Yunfeng Liu. Roformer: Enhanced transformer with rotary position embedding. In Neurocomputing, 2024. 4

Jingqun Tang, Qi Liu, Yongjie Ye, Jinghui Lu, Shu Wei, Chunhui Lin, Wanqing Li, Mohamad Fitri Faiz Bin Mahmood, Hao Feng, Zhen Zhao, Yanjie Wang, Yuliang Liu, Hao Liu, Xiang Bai, and Can Huang. Mtvqa: Benchmarking multilingual text-centric visual question answering. arXiv:2405.11985, 2024. 9, 11, 16

Gemini Team, Rohan Anil, Sebastian Borgeaud, Yonghui Wu, Jean-Baptiste Alayrac, Jiahui Yu, Radu Soricut, Johan Schalkwyk, Andrew M Dai, Anja Hauth, et al. Gemini: A family of highly capable multimodal models. arXiv:2312.11805, 2023. 1, 9

Hugo Touvron, Thibaut Lavril, Gautier Izacard, Xavier Martinet, Marie-Anne Lachaux, Timothée Lacroix, Baptiste Rozière, Naman Goyal, Eric Hambro, Faisal Azhar, et al. Llama: Open and efficient foundation language models. arXiv:2302.13971, 2023a. 1

Hugo Touvron, Louis Martin, Kevin Stone, Peter Albert, Amjad Almahairi, Yasmine Babaei, Nikolay Bashlykov, Soumya Batra, Prajjwal Bhargava, Shruti Bhosale, et al. Llama 2: Open foundation and fine-tuned chat models. arXiv:2307.09288, 2023b. 1

Ke Wang, Junting Pan, Weikang Shi, Zimu Lu, Mingjie Zhan, and Hongsheng Li. Measuring multimodal mathematical reasoning with math-vision dataset. arXiv:2402.14804, 2024. 9, 11, 15

Peng Wang, An Yang, Rui Men, Junyang Lin, Shuai Bai, Zhikang Li, Jianxin Ma, Chang Zhou, Jingren Zhou, and Hongxia Yang. Ofa: Unifying architectures, tasks, and modalities through a simple sequence-to-sequence learning framework. In ICML, 2022. 12

Peng Wang, Shijie Wang, Junyang Lin, Shuai Bai, Xiaohuan Zhou, Jingren Zhou, Xinggang Wang, and Chang Zhou. One-peace: Exploring one general representation model toward unlimited modalities. arXiv:2305.11172, 2023a. 12

Weihan Wang, Qingsong Lv, Wenmeng Yu, Wenyi Hong, Ji Qi, Yan Wang, Junhui Ji, Zhuoyi Yang, Lei Zhao, Xixuan Song, et al. Cogvlm: Visual expert for pretrained language models. arXiv:2311.03079, 2023b. 1, 2, 12

X.AI. Grok-1.5 vision preview. [https://x.ai/blog/grok-1.5v](https://x.ai/blog/grok-1.5v), 2024a. 9, 15

X.AI. Grok-2 beta release. [https://x.ai/blog/grok-2](https://x.ai/blog/grok-2), 2024b. 9

<!-- page 23 of 52 -->

B. Yan, Yi Jiang, Jiannan Wu, D. Wang, Ping Luo, Zehuan Yuan, and Huchuan Lu. Universal instance perception as object discovery and retrieval. In CVPR, 2023. 12

Fanjia Yan, Huanzhi Mao, Charlie Cheng-Jie Ji, Tianjun Zhang, Shishir G. Patil, Ion Stoica, and Joseph E. Gonzalez. Berkeley function calling leaderboard, 2024. URL [https://gorilla.cs.berkeley.edu/blogs/8\_berkeley\_function\_calling\_leaderboard.html](https://gorilla.cs.berkeley.edu/blogs/8_berkeley_function_calling_leaderboard.html). 12

An Yang, Baosong Yang, Binyuan Hui, Bo Zheng, Bowen Yu, Chang Zhou, Chengpeng Li, Chengyuan Li, Dayiheng Liu, Fei Huang, et al. Qwen2 technical report. arXiv:2407.10671, 2024. 4, 5, 12, 17

Zhengyuan Yang, Linjie Li, Kevin Lin, Jianfeng Wang, Chung-Ching Lin, Zicheng Liu, and Lijuan Wang. The dawn of lmms: Preliminary explorations with gpt-4v (ision). arXiv:2309.17421, 2023. 30, 44

Yuan Yao, Tianyu Yu, Ao Zhang, Chongyi Wang, Junbo Cui, Hongji Zhu, Tianchi Cai, Haoyu Li, Weilin Zhao, Zhihui He, et al. Minicpm-v: A gpt-4v level mllm on your phone. arXiv:2408.01800, 2024. 9

Qinghao Ye, Haiyang Xu, Guohai Xu, Jiabo Ye, Ming Yan, Yiyang Zhou, Junyang Wang, Anwen Hu, Pengcheng Shi, Yaya Shi, et al. mplug-owl: Modularization empowers large language models with multimodality. arXiv:2304.14178, 2023a. 2

Qinghao Ye, Haiyang Xu, Jiabo Ye, Ming Yan, Haowei Liu, Qi Qian, Ji Zhang, Fei Huang, and Jingren Zhou. mplug-owl2: Revolutionizing multi-modal large language model with modality collaboration. arXiv:2311.04257, 2023b. 2

Kaining Ying, Fanqing Meng, Jin Wang, Zhiqian Li, Han Lin, Yue Yang, Hao Zhang, Wenbo Zhang, Yuqi Lin, Shuo Liu, Jiayi Lei, Quanfeng Lu, Runjian Chen, Peng Xu, Renrui Zhang, Haozhe Zhang, Peng Gao, Yali Wang, Yu Qiao, Ping Luo, Kaipeng Zhang, and Wenqi Shao. Mmt-bench: A comprehensive multimodal benchmark for evaluating large vision-language models towards multitask agi. arXiv:2404.16006, 2024. 9, 15

Weihao Yu, Zhengyuan Yang, Linjie Li, Jianfeng Wang, Kevin Lin, Zicheng Liu, Xinchao Wang, and Lijuan Wang. Mm-vet: Evaluating large multimodal models for integrated capabilities. In ICML, 2024. 9, 15

Xiang Yue, Yuansheng Ni, Kai Zhang, Tianyu Zheng, Ruoqi Liu, Ge Zhang, Samuel Stevens, Dongfu Jiang, Weiming Ren, Yuxuan Sun, et al. Mmmu: A massive multi-discipline multimodal understanding and reasoning benchmark for expert agi. arXiv:2311.16502, 2023. 9, 15

Xiang Yue, Tianyu Zheng, Yuansheng Ni, Yubo Wang, Kai Zhang, Shengbang Tong, Yuxuan Sun, Ming Yin, Botao Yu, Ge Zhang, et al. Mmmu-pro: A more robust multi-discipline multimodal understanding benchmark. arXiv preprint arXiv:2409.02813, 2024. 9

Yuexiang Zhai, Hao Bai, Zipeng Lin, Jiayi Pan, Shengbang Tong, Yifei Zhou, Alane Suhr, Saining Xie, Yann LeCun, Yi Ma, et al. Fine-tuning large vision-language models as decision-making agents via reinforcement learning. arXiv:2405.10292, 2024. 10, 13

Zhuosheng Zhan and Aston Zhang. You only look at screens: Multimodal chain-of-action agents. arXiv:2309.11436, 2023. 10, 13

Biao Zhang and Rico Sennrich. Root mean square layer normalization. In NeurIPS, 2019. 8

Haotian Zhang, Haoxuan You, Philipp Dufter, Bowen Zhang, Chen Chen, Hong-You Chen, Tsu-Jui Fu, William Yang Wang, Shih-Fu Chang, Zhe Gan, and Yinfei Yang. Ferret-v2: An improved baseline for referring and grounding with large language models. arXiv:2404.07973, 2024a. 12

Jiwen Zhang, Jihao Wu, Yihua Teng, Minghui Liao, Nuo Xu, Xiao Xiao, Zhongyu Wei, and Duyu Tang. Android in the zoo: Chain-of-action-thought for gui agents. arXiv:2403.02713, 2024b. 10, 13

Pan Zhang, Xiaoyi Dong Bin Wang, Yuhang Cao, Chao Xu, Linke Ouyang, Zhiyuan Zhao, Shuangrui Ding, Songyang Zhang, Haodong Duan, Hang Yan, et al. Internlm-xcomposer: A vision-language large model for advanced text-image comprehension and composition. arXiv:2309.15112, 2023. 1

<!-- page 24 of 52 -->

Tianyu Zhang, Suyuchen Wang, Lu Li, Ge Zhang, Perouz Taslakian, Sai Rajeswar, Jie Fu, Bang Liu, and Yoshua Bengio. Vcr: Visual caption restoration. arXiv:2406.06462, 2024c. 9

Deyao Zhu, Jun Chen, Xiaoqian Shen, Xiang Li, and Mohamed Elhoseiny. Minigpt-4: Enhancing visionlanguage understanding with advanced large language models. arXiv:2304.10592, 2023. 1, 2

<!-- page 25 of 52 -->

## A Model Capabilities and Qualitative Examples

In this section, we present some practical examples of our Qwen2-VL.

### A.1 General Chat and OCR

The Qwen2-VL models are now more adept at accurately describing and identifying complex information within images, as well as providing detailed background and answering related questions. Besides, the text processing capabilities of the Qwen2-VL models have seen significant improvements, particularly concerning the recognition of Chinese and English text within images.

![Image block](images/p25-figure-7-when-presented-with-an-image-of-cubes-of.png)

Figure 7: When presented with an image of cubes of different colors, the models identify their layout and the color of each cube.

<!-- page 26 of 52 -->

![Image block](images/p26-figure-8-the-model-displays-an-adeptness-in-recognizing.png)

Figure 8: The model displays an adeptness in recognizing flowers in photographs.

<!-- page 27 of 52 -->

![Image block](images/p27-figure-9-literary-writing-in-multiple-languages-based.png)

Figure 9: Literary writing in multiple languages based on visual stimuli.

<!-- page 28 of 52 -->

![Image block](images/p28-figure-10-the-model-displays-an-adeptness-in.png)

Figure 10: The model displays an adeptness in recognizing multilingual texts in images.

<!-- page 29 of 52 -->

![Image block](images/p29-figure-11-recognition-of-dense-chinese-text-the-model.png)

Figure 11: Recognition of dense Chinese text. The model is capable of directly converting lengthy, closely packed Chinese characters into standard English with accuracy and fluency.

<!-- page 30 of 52 -->

![Image block](images/p30-figure-12-the-model-displays-an-adeptness-in.png)

Figure 12: The model displays an adeptness in recognizing multilingual texts in images. Image source: (Yang et al., 2023)

<!-- page 31 of 52 -->

![Image block](images/p31-figure-13-the-model-displays-an-adeptness-in.png)

Figure 13: The model displays an adeptness in recognizing multilingual texts in images.

<!-- page 32 of 52 -->

### A.2 Information extraction and Visual Reasoning

A notable advancement in the Qwen2-VL models is their enhanced visual reasoning capability. This advancement allows the models to interpret and comprehend complex representations such as flowcharts, diagrams, and other symbolic systems.

![Image block](images/p32-figure-14-the-model-displays-an-adeptness-in-solving.png)

Figure 14: The model displays an adeptness in solving mathematical problems. Image source: Lu et al. (2021)

<!-- page 33 of 52 -->

```txt
Mathematical Problem Solving

3, 计算下面图形的表面积和体积(8分)

①(单位: 厘米)
②(单位: 分米)

Read the image and solve it step by step.

Model Response

The image shows two geometric figures, a rectangular prism and a cube, with their dimensions labeled. The problem asks to calculate the surface area and volume of these figures.

1.For the rectangular prism:
Length (l) = 4 cm
Width (w) = 2 cm
Height (h) = 3 cm
Surface Area (SA) of a rectangular prism = 2lw + 2lh + 2wh
Volume (V) of a rectangular prism = lwh
Substituting the given values:
SA = 2(4cm)(2cm) + 2(4cm)(3cm) + 2(2cm)(3cm)
SA = 16cm² + 24cm² + 12cm² SA = 52cm²
V = (4cm)(2cm)(3cm) V = 24cm³

2.For the cube:
Side length (a) = 3 dm
Surface Area (SA) of a cube = 6a² Volume (V) of a cube = a³
Substituting the given value:
SA = 6(3dm)² SA = 6(9dm²) SA = 54dm²
V = (3dm)³ V = 27dm³

So, the surface area and volume for each figure are as follows:
For the rectangular prism:
Surface Area = 52 cm²
Volume = 24 cm³

For the cube:
Surface Area = 54 dm²
Volume = 27 dm³
```

Figure 15: Solving a math problem. The model calculates the surface area and volume of these figures with step-by-step explanation

<!-- page 34 of 52 -->

Algorithmic Problem Solving

![Image block](images/p34-solve-the-algorithmic-problem-in-the-web-page.png)

Solve the algorithmic problem in the web page.

<!-- page 35 of 52 -->

<div class="docvortex-algorithm" style="white-space: pre-wrap; font-family:monospace;">
To solve the "Snake in Matrix" problem, we need to implement a function that takes the size of the matrix $n$ and a list of commands, and returns the final position of the snake after executing all the commands. Here's a step-by-step approach to solve this problem:
Initialize Variables:
    Initialize the current position of the snake as 0.
    Initialize the direction of the snake as RIGHT (initially, the snake moves to the right).
Define Movement Functions:
    Create a function to move the snake based on the current direction and the size of the matrix $n$.
    Update the position of the snake accordingly.
Process Commands:
    Iterate through each command in the list of commands.
    For each command, update the direction and position of the snake.
Return Final Position:
    After processing all commands, return the final position of the snake.
Here's the Python code to implement the solution:
class Solution:
    def finalPositionOfSnake(self, n: int, commands: List[str]) -&gt; int:
        # Initialize variables
        position = 0
        direction = "RIGHT"
        # Define movement functions
        def move_right():
            nonlocal position
            position += 1
        def move_down():
            nonlocal position
            position += n
        def move_left():
            nonlocal position
            position -= 1
        def move_up():
            nonlocal position
            position -= n
        # Process commands
        for command in commands:
            if command == "RIGHT":
                move_right()
            elif command == "DOWN":
                move_down()
            elif command == "LEFT":
                move_left()
            elif command == "UP":
                move_up()
        # Return final position
        return position
</div>

Figure 16: The model displays an adeptness in solving algorithmic problems.

<!-- page 36 of 52 -->

![Image block](images/p36-figure-17-the-model-displays-an-adeptness-in-recognize.png)

Figure 17: The model displays an adeptness in recognize content from the web page.

<!-- page 37 of 52 -->

![Image block](images/p37-figure-18-the-model-displays-an-adeptness-in-ocr-and.png)

Figure 18: The model displays an adeptness in OCR and mathematical reasoning.

<!-- page 38 of 52 -->

![Image block](images/p38-json.png)

```json
[
  {
    "version": "6.11-rc3", "release_date": "2024-08-11"
  },
  {
    "version": "6.10.4", "release_date": "2024-08-11"
  },
  {
    "version": "6.9.12 [EOL]", "release_date": "2024-07-27"
  },
  {
    "version": "6.6.45", "release_date": "2024-08-11"
  },
  {
    "version": "6.1.104", "release_date": "2024-08-11"
  },
  {
    "version": "5.15.164", "release_date": "2024-07-27"
  },
  {
    "version": "5.10.223", "release_date": "2024-07-27"
  },
  {
    "version": "5.4.281", "release_date": "2024-07-27"
  },
  {
    "version": "4.19.319", "release_date": "2024-07-27"
  },
  {
    "version": "next-20240812", "release_date": "2024-08-12"
  }
]
```

Figure 19: The model displays an adeptness in OCR and following formats.

<!-- page 39 of 52 -->

![Image block](images/p39-figure-20-the-model-displays-an-adeptness-in-ocr-and.png)

Figure 20: The model displays an adeptness in OCR and following formats.

<!-- page 40 of 52 -->

![Image block](images/p40-figure-21-the-model-displays-an-adeptness-in-large.png)

Figure 21: The model displays an adeptness in large images OCR.

<!-- page 41 of 52 -->

A.3 Video Understanding

![Image block](images/p41-figure-22-the-model-displays-an-adeptness-in.png)

Figure 22: The model displays an adeptness in recognizing multi-round video chat.

<!-- page 42 of 52 -->

![Image block](images/p42-figure-23-the-model-displays-an-adeptness-in.png)

Figure 23: The model displays an adeptness in recognizing multi-video understanding.

<!-- page 43 of 52 -->

| Locate Whatever You Desire |
| --- |
|  |
| Detect the bounding box of 'the red car' |
| Model Response |
| the red car(701,531),(869,675) |
|  |

Figure 24: Our models were able to locate specific elements within images, such as identifying the red car accurately.

### A.4 Visual Agent Capability

The Qwen2-VL also excels in location and agent tasks.

<!-- page 44 of 52 -->

![Image block](images/p44-figure-25-our-model-is-capable-of-annotating-and-posing.png)

Figure 25: Our model is capable of annotating and posing questions regarding the content present in webpage screenshots, demonstrating its potential as a visual agent. Image source: (Yang et al., 2023)

<!-- page 45 of 52 -->

![Image block](images/p45-figure-26-the-model-identified-the-destination-and.png)

Figure 26: The model identified the destination and arrival time in the image, called the 24-hour weather query function, correctly input the destination, and extracted the weather at the arrival time from the query results, thus enabling it to answer the user’s question.

<!-- page 46 of 52 -->

Implement the flowchart, representing modules as functions without implementation details. Write the code and validate it using the code interpreter.

![Image block](images/p46-python.png)

```python
# Placeholder functions for the modules
def speech_adapter(input_audio):
    # Placeholder for speech adapter implementation
    pass

# To avoid excessive length,
# the remaining functions without implementation details are omitted here.

# Example usage
input_audio = "talk about the weather in San Francisco."
speech_adapter_output = speech_adapter(input_audio)
speech_encoder_output = speech_encoder(speech_adapter_output)
system_prompt_output = system_prompt()
dialogue_history_output = dialogue_history()
llama_3_output = llama_3(speech_encoder_output, system_prompt_output, \
dialogue_history_output)
text_normalization_output = text_normalization(llama_3_output)
prosody_model_output = prosody_model(text_normalization_output)
output_audio = synthesizer(prosody_model_output)
```

The code has been executed without any errors, which means that the structure of the code matches the flowchart and there are no syntax issues. However, since the functions are placeholders and do not perform any actual operations, we cannot validate the correctness of the implementation. The code simply represents the flowchart by defining each module as a function and demonstrating how the functions could be called in sequence to process input audio and produce output audio.

Figure 27: The model identified the steps in the flowchart, drafted the simulation code as required while omitting the details, and then successfully executed it through the code interpreter. Image source: (Dubey et al., 2024)

<!-- page 47 of 52 -->

Function Calling - Code Interpreter

| Model | HumanEval | HumanEval+ | MBPP | MBPP EvalPlus (base) |
| --- | --- | --- | --- | --- |
| Llama 3 8B | 72.6 ±6.8 | 67.1 ±7.2 | 60.8 ±4.3 | 72.8 ±4.5 |
| Gemma 2 9B | 54.3 ±7.6 | 48.8 ±7.7 | 59.2 ±4.3 | 71.7 ±4.5 |
| Mistral 7B | 40.2 ±7.5 | 32.3 ±7.2 | 42.6 ±4.3 | 49.5 ±5.0 |
| Llama 3 70B | 80.5 ±6.1 | 74.4 ±6.7 | 75.4 ±3.8 | 86.0 ±3.5 |
| Mixtral 8×22B | 75.6 ±6.6 | 68.3 ±7.1 | 66.2 ±4.1 | 78.6 ±4.1 |
| GPT-3.5 Turbo | 68.0 ±7.1 | 62.8 ±7.4 | 71.2 ±4.0 | 82.0 ±3.9 |
| Llama 3 405B | 89.0 ±4.8 | 82.3 ±5.8 | 78.8 ±3.6 | 88.6 ±3.2 |
| GPT-4 | 86.6 ±5.2 | 77.4 ±6.4 | 80.2 ±3.5 | 83.6 ±3.7 |
| GPT-4o | 90.2 ±4.5 | 86.0 ±5.3 | 81.4 ±3.4 | 87.8 ±3.3 |
| Claude 3.5 Sonnet | 92.0 ±4.2 | 82.3 ±5.8 | 76.6 ±3.7 | 90.5 ±3.0 |
| Nemotron 4 340B | 73.2 ±6.8 | 64.0 ±7.3 | 75.4 ±3.8 | 72.8 ±4.5 |

Table 18 Pass@1 scores on code generation benchmarks. We report results on HumanEval (Chen et al., 2021) MBPP (Austin et al., 2021), as well as EvalPlus (Liu et al., 2024a) versions of these benchmarks.

#### Function Input

Count the average value of each row in this chart and draw a bar chart to show it. Write the code and verify it using the code interpreter.

```python
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt

# Extracting the numerical values from the table
data = {
    "Model": ["Llama 3 8B", "Gemma 2 9B", "Mistral 7B", "Llama 3 70B", \
        "Mixtral 8x22B", "GPT-3.5 Turbo", "Llama 3 405B", "GPT-4", \
        "GPT-4o", "Claude 3.5 Sonnet", "Nemotron 4 340B"],
    "HumanEval": [72.6, 54.3, 40.2, 80.5, 75.6, 68.0, 89.0, 86.6, 90.2, \
        92.0, 73.2],
    "HumanEval+": [67.1, 48.8, 32.3, 74.4, 68.3, 62.8, 82.3, 77.4, 86.0, \
        82.3, 64.0],
    "MBPP": [60.8, 59.2, 42.6, 75.4, 66.2, 71.2, 78.8, 80.2, 81.4, 76.6, \
        75.4],
    "MBPP EvalPlus (base)": [72.8, 71.7, 49.5, 86.0, 78.6, 82.0, 88.6, \
        83.6, 87.8, 90.5, 72.8]
}

# Create a DataFrame
df = pd.DataFrame(data)

# Calculate the average for each row
df["Average"] = df.mean(axis=1)

# Plotting the bar chart
plt.figure(figsize=(12, 6))
plt.bar(df["Model"], df["Average"], color="skyblue")
plt.xlabel("Model")
plt.ylabel("Average Score")
plt.title("Average Pass@1 Scores on Code Generation Benchmarks")
plt.xticks(rotation=45, ha="right")
plt.tight_layout()
plt.show()
```

<!-- page 48 of 52 -->

Function Result

![Chart block](images/p48-model-response.png)

#### Model Response

The average Pass@1 scores on code generation benchmarks for each model have been calculated and are displayed in the table above. The bar chart shows the average scores for each model, providing a visual comparison of their performance across the different benchmarks.

Figure 28: The model analyzed the table, and wrote the code to calculate the mean of each row in the table and to plot the results as a bar chart, which was successfully executed and visualized by the code interpreter. Image source: (Dubey et al., 2024)

<!-- page 49 of 52 -->

![Image block](images/p49-figure-29-the-model-understood-the-formula-implemented.png)

Figure 29: The model understood the formula, implemented the code as required, and successfully executed it in the code interpreter to obtain the results. Image source: (Dubey et al., 2024)

<!-- page 50 of 52 -->

VL Agent - UI Operations

![Image block](images/p50-image.png)

![Image block](images/p50-image-2.png)

![Image block](images/p50-50.png)

<!-- page 51 of 52 -->

| VL Agent - UI Operations |
| --- |
| ## Continuously take action until the task is completed.*FUNCTION*: The action to take, should be one of {Click,Type,Swipe,Back,Home,Enter,Done}*ARGS*: The input of the action.*RESULT*: Action results.*RETURN*: Reply based on action results. |
| User |
| Your task is: What's a good restaurant in San Diego?![](Screenshot_1) |
| Assistant |
| The screen shows the email setup page, which is not relevant to finding a restaurant. Possible actions are to exit the email setup and navigate to a search engine or map application where I can look up restaurants in San Diego. *FUNCTION*: Home *ARGS*: {*RESULT*: ![](Screenshot_2)*RETURN*: The screen shows the home screen with various apps, including Google Chrome and Maps which could be used to search for a restaurant in San Diego. Possible actions are to tap on the Google Chrome app to open it and then use it to search for a good restaurant in San Diego.*FUNCTION*: Click *ARGS*: {"point": "(687, 792)"*RESULT*: ![](Screen_4)*RETURN*: The current screen shows search results for skateboards, which is not related to the query about finding a good restaurant in San Diego. Possible actions are to click on the Google search bar at the top of the screen and enter the correct search term "good restaurant in San Diego" to find relevant information.*FUNCTION*: Click *ARGS*: {"point": "(596, 213)"*RESULT*: ![](Screen_6)*RETURN*: The current screen shows search suggestions related to skateboard speeds, which is not relevant to the query about finding a good restaurant in San Diego. Possible actions are to click on the "X" button to be correct query for finding a good restaurant in San Diego.*FUNCTION*: Click *ARGS*: {"point": "(927, 135)"*RESULT*: ![](Screen_8)*RETURN*: The screen shows the Google search bar with a list of previous searches, none of which are related to finding a restaurant in San Diego. Possible actions are to type "good restaurant in San Diego" into the search bar and then press enter to perform the search.*FUNCTION*: Type *ARGS*: {"text": "What's a good restaurant in San Diego?"*RESULT*: ![](Screen_9)*RETURN*: The screen shows a list of search suggestions related to finding good restaurants in San Diego, indicating that the user has typed in a query but not yet executed it. Possible actions are to select one of the suggested searches or press enter on the keyboard to execute the current search and view the results.*FUNCTION*: Enter *ARGS*: {*RESULT*: ![](Screen_10)*RETURN*: The screen shows a list of top-rated restaurants in San Diego with details such as ratings, price range, and opening hours. Possible actions are to stop and set the query as completed.*FUNCTION*: Done *ARGS*: {} |

Figure 30: Qwen2-VL as an agent understands the query with respect to UI operation, utilizes the pre-defined actions in system message, and fulfill the task step-by-step.

<!-- page 52 of 52 -->

![Image block](images/p52-figure-31-qwen2-vl-recognizes-these-cards-and-utilizes.png)

Figure 31: Qwen2-VL recognizes these cards and utilizes Hit and Stand to play the blackjack.

52
